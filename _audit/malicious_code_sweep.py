#!/usr/bin/env python3
"""
malicious_code_sweep.py — the full-codebase adversarial pass (A11's second half).

Scans every shipped skill for the classes that matter in code a user installs and runs on
their own machine with their own credentials:

    EGRESS        network calls, especially to hardcoded hosts
    EXEC          eval / exec / dynamic import / shell-out
    SECRETS       hardcoded tokens, keys, passwords, connection strings
    BYPASS        code that disables or short-circuits a guardrail or a check
    OBFUSCATION   base64/hex blobs, char-code assembly, unusual encodings
    DEPS          third-party imports that could be typosquats or unexpected
    INJECTION     SQL/command string interpolation

WHAT THIS IS AND IS NOT
-----------------------
This is a PATTERN sweep. It proves where the risky constructs are, so a human can look at
each one. It cannot prove code is safe, and a clean run means "nothing matched these
patterns", never "this code is benign".

It is also the third tool in this repo to learn the same lesson, so the lesson is written
here: **a pattern list under-reports.** The H3 claim-gate audit produced four false
negatives by matching wording instead of mechanism, and the abstain check famously did not
contain the word "abstain". Treat an empty category as a prompt to read the code, not as a
finding.

ALLOWLIST, PINNED
-----------------
Known-benign matches are listed with a reason. Each is keyed to the exact file AND pattern,
so a new match in the same file still surfaces. An allowlist keyed to a whole file would
hide tomorrow's real hit behind today's benign one.
"""
from __future__ import annotations

import ast
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SCAN_EXT = (".py", ".js", ".html", ".json", ".css")
SKIP_DIRS = ("__pycache__", ".git", "node_modules", "_package",
             # Vendored/legacy React bundles: minified third-party code that is not
             # shipped in any .skill and cannot be meaningfully read line by line.
             # Scanning them produced hundreds of fromCharCode hits from the React
             # runtime and buried everything that matters.
             "_canonical_originals", "_dashboards_ORIGINAL", "_dashboard_previews",
             "_rfx_build", "_deal_build", "_category_build", "_platform_build")

PATTERNS = {
    "EGRESS": [
        r"\brequests\.(get|post|put|delete)\b", r"\burllib\.request\b", r"\bhttplib\b",
        r"\bfetch\s*\(", r"XMLHttpRequest", r"\bWebSocket\s*\(",
        r"\bsocket\.socket\b", r"navigator\.sendBeacon",
    ],
    "EXEC": [
        r"\beval\s*\(", r"\bexec\s*\(", r"\bcompile\s*\(",
        r"\bsubprocess\.(run|call|Popen|check_output)\b", r"\bos\.system\b",
        r"\bos\.popen\b", r"\b__import__\s*\(", r"new\s+Function\s*\(",
    ],
    "SECRETS": [
        r"(?i)\b(api[_-]?key|secret|passwd|password|token)\s*[=:]\s*['\"][^'\"]{8,}",
        r"(?i)\bBearer\s+[A-Za-z0-9._\-]{20,}", r"AKIA[0-9A-Z]{16}",
        r"(?i)\b(mongodb|postgres|mysql)://[^\s'\"]+:[^\s'\"]+@",
    ],
    "BYPASS": [
        r"(?i)#\s*(nosec|noqa:\s*S)", r"verify\s*=\s*False",
        r"(?i)disable[_ ](guardrail|check|validation|assert)",
        r"(?i)skip[_ ](check|validation|guardrail)",
        r"rejectUnauthorized\s*:\s*false",
    ],
    "OBFUSCATION": [
        r"base64\.b64decode", r"atob\s*\(", r"fromCharCode",
        r"\\x[0-9a-fA-F]{2}\\x[0-9a-fA-F]{2}\\x[0-9a-fA-F]{2}",
        r"(?i)codecs\.decode\([^)]*rot13",
    ],
    # INJECTION patterns must require a real SQL SHAPE. An earlier version matched
    # (SELECT|INSERT|UPDATE|DELETE) followed by any "+", which flagged 411 hits, nearly all
    # English prose: the comment "assumptions: live update + recalc" matched. A sweep with
    # that many false positives is worse than no sweep, because nobody reads it.
    "INJECTION": [
        r"(?i)\bSELECT\b[^;\n]{0,80}\bFROM\b[^;\n]{0,80}[+%]\s*\w",
        r"(?i)\b(INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b[^;\n]{0,80}[+%]\s*\w",
        r"(?i)\bexecute\s*\(\s*f?['\"][^'\"]*%s",
        r"\bos\.system\s*\(\s*f?['\"][^'\"]*\{",
    ],
}

# (file, category) -> reason. Pinned to the pair, never to the file alone.
ALLOWLIST = {
    ("_audit/malicious_code_sweep.py", "EGRESS"): "this scanner's own pattern list",
    ("_audit/malicious_code_sweep.py", "EXEC"): "this scanner's own pattern list",
    ("_audit/malicious_code_sweep.py", "SECRETS"): "this scanner's own pattern list",
    ("_audit/malicious_code_sweep.py", "BYPASS"): "this scanner's own pattern list",
    ("_audit/malicious_code_sweep.py", "OBFUSCATION"): "this scanner's own pattern list",
    ("_audit/malicious_code_sweep.py", "INJECTION"): "this scanner's own pattern list",
    ("_audit/package_skills.py", "EXEC"): (
        "subprocess.run is how the packager executes the integrity sweep; it runs only "
        "sys.executable against paths inside this repo, with no user-supplied argument"),
}

# Third-party imports that are expected. Anything else is reported for a human to judge.
EXPECTED_DEPS = {"openpyxl", "docx", "python-docx"}


def iter_files():
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in SKIP_DIRS]
        for f in sorted(fn):
            if f.endswith(SCAN_EXT):
                yield os.path.join(dp, f)


def third_party_imports(path, text):
    """Real imports only, via the AST.

    A regex over `^\\s*(from|import)\\s+(\\w+)` looked right and was wrong: it matched
    ordinary prose in docstrings, so the dependency list filled with "the", "these",
    "should" and "narrative". A dependency audit that reports English words as packages
    trains its reader to skim, which is the failure mode that lets a real typosquat through.
    The AST cannot make that mistake because it only sees actual import statements.
    """
    if not path.endswith(".py"):
        return []
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return []
    names = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.update(a.name.split(".")[0] for a in node.names)
        elif isinstance(node, ast.ImportFrom):
            if node.level == 0 and node.module:
                names.add(node.module.split(".")[0])

    found = set()
    for mod in names:
        if mod in ("os", "sys", "re", "json", "csv", "math", "copy", "zipfile", "shutil",
                   "tempfile", "hashlib", "subprocess", "argparse", "datetime", "typing",
                   "dataclasses", "collections", "itertools", "functools", "importlib",
                   "textwrap", "unicodedata", "string", "time", "random", "pathlib",
                   "__future__", "traceback", "io", "glob", "statistics", "decimal",
                   "warnings", "abc", "enum", "uuid", "base64", "binascii", "html",
                   "urllib", "socket", "codecs"):
            continue
        if mod.startswith("_") or os.path.isfile(os.path.join(os.path.dirname(path), mod + ".py")):
            continue
        found.add(mod)
    return sorted(found)


def sweep():
    hits, deps = [], {}
    for path in iter_files():
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        try:
            text = open(path, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue

        for mod in third_party_imports(path, text):
            deps.setdefault(mod, []).append(rel)

        for cat, pats in PATTERNS.items():
            if (rel, cat) in ALLOWLIST:
                continue
            for pat in pats:
                for m in re.finditer(pat, text):
                    line = text[:m.start()].count("\n") + 1
                    snippet = text.splitlines()[line - 1].strip()[:120] if line <= len(text.splitlines()) else ""
                    hits.append({"file": rel, "category": cat, "line": line,
                                 "pattern": pat, "snippet": snippet})
    return hits, deps


def main(argv):
    hits, deps = sweep()
    by_cat = {}
    for h in hits:
        by_cat.setdefault(h["category"], []).append(h)

    if "--json" in argv:
        print(json.dumps({"hits": hits, "third_party_imports": deps}, indent=2))
        return 1 if hits else 0

    print("=" * 88)
    print("MALICIOUS-CODE SWEEP (A11). Pattern-based: proves WHERE to look, not that code is safe.")
    print("=" * 88)
    for cat in PATTERNS:
        rows = by_cat.get(cat, [])
        print("\n%-12s %d hit(s)" % (cat, len(rows)))
        for h in rows[:12]:
            print("    %s:%d" % (h["file"], h["line"]))
            safe = h["snippet"][:104].encode("ascii", "replace").decode("ascii")
            print("        %s" % safe)
        if len(rows) > 12:
            print("    ... and %d more" % (len(rows) - 12))

    print("\n" + "-" * 88)
    print("THIRD-PARTY IMPORTS")
    for mod, files in sorted(deps.items()):
        flag = "" if mod in EXPECTED_DEPS else "   <- UNEXPECTED, judge this"
        print("  %-18s %d file(s)%s" % (mod, len(files), flag))
    unexpected = [m for m in deps if m not in EXPECTED_DEPS]

    print("\n" + "=" * 88)
    print("TOTAL: %d pattern hit(s), %d unexpected dependency(ies)" % (len(hits), len(unexpected)))
    print("A clean result means nothing matched these patterns. It does NOT mean the code is")
    print("benign: a pattern list under-reports, which this repo has now proven three times.")
    print("=" * 88)
    return 1 if (hits or unexpected) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
