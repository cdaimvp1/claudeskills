"""
skill_smoke_test.py
WS G item G8: the canonical per-skill runtime smoke test. Eight assertions.

OPTIMIZATION-PRINCIPLES.md: "Each skill needs a runtime smoke test that proves it
executes, not a static read that proves it parses."

THE DESIGN DECISION THAT MAKES THIS A RUNTIME TEST
--------------------------------------------------
Every assertion runs against a COPY of the skill in an otherwise empty temporary
directory. No siblings, no suite root, no repo. That is what a Claude Desktop
install looks like, and testing in place would silently pass code that only works
because a sibling happened to be one directory up.

    python skill_smoke_test.py                    # every skill
    python skill_smoke_test.py rfp-engine-1c344a  # one skill
    python skill_smoke_test.py --verbose

Exit 0 all pass, 1 any failure. Designed to run in CI.

THE EIGHT ASSERTIONS
--------------------
  A1  SKILL.md exists, is non-empty, and is valid UTF-8
  A2  every .py parses (syntax, in isolation)
  A3  every .py IMPORTS in a flat single-folder install
  A4  every .py that ships a self-test passes it, in isolation
  A5  no unguarded third-party import
  A6  no relative or package-style import (a flat install has no package)
  A7  every path the skill references relative to ITSELF resolves
  A8  every cross-skill path either resolves or has a stated inline fallback

A7 and A8 are separated deliberately. A7 is unambiguously the skill's own bug. A8
is a suite-composition question, and on Desktop it is EXPECTED to be unresolvable,
so what is asserted there is the presence of a fallback, not the path.

Stdlib only.
"""

from __future__ import annotations

import ast
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
STDLIB = set(getattr(sys, "stdlib_module_names", ()))

FALLBACK_HINTS = [
    r"if .{0,60}not installed", r"if .{0,60}unavailable", r"inlined below",
    r"fall ?back", r"graceful", r"if .{0,40}cannot be read", r"degrade",
    r"INLINED:", r"self-describing",
]

# Filenames provided by the PLATFORM, not by a skill. A7 must not treat these as
# broken self-references: they are supposed to be absent from the skill folder.
# Caught as a false positive on the first run of this test against
# invoice-rate-card-auditor, which cites unpack.py as a docx-reading tool.
PLATFORM_TOOLS = {
    "unpack.py",      # docx skill: read word/comments.xml and tracked changes
    "pack.py",
}

# Assertions that are KNOWN-OPEN, with a reason and a tracking reference. These
# report as KNOWN rather than FAIL so the suite can run as a CI gate: a check that
# is red on day one gets ignored, and then stops catching the failures that matter.
#
# This list is a liability, exactly like kernel_manifest.py's KNOWN_EXCEPTIONS.
# Every entry is a real defect that is not being fixed today. Adding to it must be
# a deliberate act with a reason, never a way to make a run pass.
KNOWN_OPEN = {
    # value = (exact expected failure detail, reason). The detail is compared
    # EXACTLY. If the same assertion fails for a DIFFERENT reason in the same
    # skill, it is NOT suppressed and the gate goes red.
    #
    # That pinning is the point. Keying only on (skill, assertion) would suppress
    # the whole check for that skill forever, so a NEW broken path in deal-room
    # would sail through behind an entry that was about a different path. An
    # allowlist that absorbs future defects is worse than no allowlist, because it
    # reads as coverage.
    ("deal-room-1c344a", "A7"): (
        "_parts/data.js; _parts/style.css; dashboard/_parts/data.js; "
        "dashboard/_platform_build/build_dashboard.py; dashboard/build_deal_artifact.py",
        "Documents deal-tab's files. Prose pointing at another skill's tree. "
        "Non-breaking. Tracked as B7.",
    ),
    ("lilly-brand-assets-1c344a", "A7"): (
        "assets/theo-color.css; frap_chain_kernel.py; numeric_kernel.py; timeline_engine.py",
        "Documents three kernels it does not ship. numeric_kernel genuinely lives in "
        "lilly-procurement-kernels and is vendored into consumers, so the reference "
        "describes something real from the wrong place. Non-breaking. Tracked as B7.",
    ),
    ("rfp-engine-1c344a", "A7"): (
        "rfx-hub-1c344a/dashboard/assets/pv/pv-04-domain-data.js",
        "Points at a path inside another skill. Non-breaking. Tracked as B7.",
    ),
}

# Files whose self-test is known to require the suite and cannot run flat.
# Each entry needs a reason. This list is a liability: every entry is a file
# whose runtime behaviour this test does NOT cover.
SELFTEST_EXEMPT = {
    "kernel_manifest.py": (
        "walks the suite directory to compare vendored copies. Cannot run in a "
        "flat install BY DESIGN, is referenced by no SKILL.md, and exits cleanly "
        "with a clear message outside the suite."
    ),
}


def skills():
    return sorted(
        d for d in os.listdir(ROOT)
        if os.path.isdir(os.path.join(ROOT, d))
        and os.path.isfile(os.path.join(ROOT, d, "SKILL.md"))
    )


def _py_files(base):
    out = []
    for dirpath, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for f in files:
            if f.endswith(".py"):
                out.append(os.path.join(dirpath, f))
    return sorted(out)


def _md_text(base):
    parts = []
    for dirpath, _d, files in os.walk(base):
        for f in files:
            if f.endswith(".md"):
                with open(os.path.join(dirpath, f), encoding="utf-8",
                          errors="replace") as fh:
                    parts.append(fh.read())
    return "\n".join(parts)


def _has_selftest(path):
    with open(path, encoding="utf-8", errors="replace") as fh:
        src = fh.read()
    return ("--selftest" in src) or ("SUMMARY:" in src and "__main__" in src)


def smoke(skill, verbose=False):
    """Run the eight assertions against an isolated copy. Returns (results, notes)."""
    src = os.path.join(ROOT, skill)
    results = []
    notes = []

    def add(aid, label, ok, detail=""):
        results.append((aid, label, bool(ok), detail))

    tmp = tempfile.mkdtemp(prefix="smoke_")
    try:
        dst = os.path.join(tmp, skill)
        shutil.copytree(src, dst, ignore=shutil.ignore_patterns("__pycache__"))

        # --- A1 -----------------------------------------------------------
        sk = os.path.join(dst, "SKILL.md")
        try:
            with open(sk, encoding="utf-8") as fh:
                body = fh.read()
            add("A1", "SKILL.md exists, non-empty, valid UTF-8",
                len(body.strip()) > 0, f"{len(body)} chars")
        except Exception as e:
            add("A1", "SKILL.md exists, non-empty, valid UTF-8", False, str(e))
            body = ""

        pys = _py_files(dst)

        # --- A2 -----------------------------------------------------------
        bad = []
        for p in pys:
            try:
                with open(p, encoding="utf-8") as fh:
                    ast.parse(fh.read())
            except Exception as e:
                bad.append(f"{os.path.basename(p)}: {e}")
        add("A2", f"all {len(pys)} .py parse", not bad, "; ".join(bad))

        # --- A3 import in a FLAT install ----------------------------------
        fails = []
        for p in pys:
            mod = os.path.splitext(os.path.basename(p))[0]
            if mod in SELFTEST_EXEMPT:
                continue
            r = subprocess.run(
                [sys.executable, "-c", f"import {mod}"],
                cwd=os.path.dirname(p), capture_output=True, text=True, timeout=120)
            if r.returncode != 0:
                tail = (r.stderr or "").strip().splitlines()
                fails.append(f"{mod}: {tail[-1] if tail else 'failed'}")
        add("A3", f"all .py import in a flat single-folder install", not fails,
            "; ".join(fails))

        # --- A4 self-tests -------------------------------------------------
        st_fail, st_ran = [], 0
        for p in pys:
            name = os.path.basename(p)
            if name in SELFTEST_EXEMPT:
                notes.append(f"A4 exempt: {name}: {SELFTEST_EXEMPT[name]}")
                continue
            if not _has_selftest(p):
                continue
            st_ran += 1
            args = [sys.executable, name]
            if "--selftest" in open(p, encoding="utf-8", errors="replace").read():
                args.append("--selftest")
            r = subprocess.run(args, cwd=os.path.dirname(p),
                               capture_output=True, text=True, timeout=600)
            out = (r.stdout or "") + (r.stderr or "")
            failed = re.search(r"(\d+)\s*/\s*\d+\s*failed", out)
            nonzero_fail = failed and failed.group(1) != "0"
            if r.returncode != 0 or nonzero_fail:
                line = next((l for l in out.splitlines() if "SUMMARY" in l), "")
                st_fail.append(f"{name}: {line or f'exit {r.returncode}'}")
        add("A4", f"all {st_ran} shipped self-test(s) pass in isolation",
            not st_fail, "; ".join(st_fail))

        # --- A5 / A6 imports ------------------------------------------------
        local = {os.path.splitext(os.path.basename(p))[0] for p in pys}
        unguarded, relative = [], []
        for p in pys:
            with open(p, encoding="utf-8", errors="replace") as fh:
                srctext = fh.read()
            try:
                tree = ast.parse(srctext)
            except Exception:
                continue
            guarded = set()
            for node in ast.walk(tree):
                if isinstance(node, ast.Try):
                    for sub in ast.walk(node):
                        if isinstance(sub, ast.Import):
                            guarded |= {a.name.split(".")[0] for a in sub.names}
                        elif isinstance(sub, ast.ImportFrom) and sub.module:
                            guarded.add(sub.module.split(".")[0])
            for node in ast.walk(tree):
                mods = []
                if isinstance(node, ast.Import):
                    mods = [a.name.split(".")[0] for a in node.names]
                elif isinstance(node, ast.ImportFrom):
                    if node.level and node.level > 0:
                        relative.append(f"{os.path.basename(p)}: level-{node.level}")
                        continue
                    if node.module:
                        mods = [node.module.split(".")[0]]
                for m in mods:
                    if m in STDLIB or m in local or m == "__future__":
                        continue
                    if m not in guarded:
                        unguarded.append(f"{os.path.basename(p)}: {m}")
        add("A5", "no unguarded third-party import", not unguarded,
            "; ".join(sorted(set(unguarded))))
        add("A6", "no relative or package-style import", not relative,
            "; ".join(sorted(set(relative))))

        # --- A7 self-referencing paths resolve -------------------------------
        text = _md_text(dst)
        missing = []
        # Only EXECUTABLE / ASSET files a skill must SHIP. Deliberately excludes
        # .docx, .xlsx, .pptx, .csv and .json: those are overwhelmingly artifacts
        # the skill PRODUCES, and asserting they exist in the folder is backwards.
        # Caught as a false positive on the first run: rfp-response-analysis was
        # flagged for analysis_summary.docx, which is its primary deliverable.
        for m in re.findall(r"`([a-zA-Z0-9_][a-zA-Z0-9_\-/]*\.(?:py|js|css))`",
                            text):
            if m.startswith("/") or "://" in m:
                continue
            if os.path.basename(m) in PLATFORM_TOOLS:
                continue
            cand = os.path.join(dst, m)
            if not os.path.exists(cand):
                # also allow it to sit anywhere inside the skill
                base = os.path.basename(m)
                if not any(base == os.path.basename(f)
                           for dp, _dd, ff in os.walk(dst) for f in ff):
                    missing.append(m)
        add("A7", "every self-referencing file path resolves",
            not missing, "; ".join(sorted(set(missing))[:6]))

        # --- A8 cross-skill paths have a fallback ----------------------------
        cross = sorted(set(re.findall(
            r"/mnt/skills/user/([a-z0-9\-]+)/([a-zA-Z0-9_\-/.]*)", text)))
        cross = [(a, b) for a, b in cross if a != skill]
        has_fallback = any(re.search(p, text, re.I) for p in FALLBACK_HINTS)
        add("A8", f"cross-skill paths ({len(cross)}) have a stated inline fallback",
            (not cross) or has_fallback,
            "no fallback language found" if cross and not has_fallback else
            (f"{len(cross)} cross-skill path(s), fallback present" if cross else "none"))
        if cross:
            notes.append(f"A8: {len(cross)} cross-skill path(s); on Desktop these are "
                         f"EXPECTED not to resolve, so the fallback is the assertion")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    return results, notes


def main(argv):
    verbose = "--verbose" in argv
    targets = [a for a in argv if not a.startswith("--")] or skills()
    total_fail = 0
    print("=" * 92)
    print("G8: CANONICAL PER-SKILL RUNTIME SMOKE TEST")
    print("each skill copied to an empty temp dir first: no siblings, no suite root")
    print("=" * 92)
    total_known = 0
    for s in targets:
        results, notes = smoke(s, verbose)
        def _pinned(r):
            return (s, r[0]) in KNOWN_OPEN and r[3] == KNOWN_OPEN[(s, r[0])][0]
        fails = [r for r in results if not r[2] and not _pinned(r)]
        known = [r for r in results if not r[2] and _pinned(r)]
        total_fail += len(fails)
        total_known += len(known)
        status = "PASS" if not fails else f"FAIL({len(fails)})"
        if known:
            status += f"  [{len(known)} known-open]"
        print("")
        print(f"{s:44} {status}")
        for aid, label, ok, detail in results:
            if ok and not verbose:
                continue
            if not ok and (s, aid) in KNOWN_OPEN and detail == KNOWN_OPEN[(s, aid)][0]:
                print(f"    [KNOWN] {aid} {label}" + (f"  -> {detail}" if detail else ""))
                print(f"            {KNOWN_OPEN[(s, aid)][1]}")
                continue
            mark = "ok  " if ok else "FAIL"
            print(f"    [{mark}] {aid} {label}" + (f"  -> {detail}" if detail else ""))
        if verbose:
            for n in notes:
                print(f"    note: {n}")
    print()
    print("=" * 92)
    print(f"{len(targets)} skill(s), {total_fail} failed assertion(s)"
          + (f", {total_known} known-open (see KNOWN_OPEN)" if total_known else ""))
    print("=" * 92)
    return 1 if total_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
