#!/usr/bin/env python3
"""
Find JS functions that are DEFINED inside a shipped skill but never CALLED anywhere
in that skill, including its built HTML.

WHY THIS IS TRUSTWORTHY, AND WHERE IT IS NOT
--------------------------------------------
A textual "is it mentioned?" test is normally a bad way to find dead code, because a
function can be reached without its name ever appearing at a call site: dynamic dispatch
(window['pv'+x]), eval, new Function, or a string-keyed registry.

This sweep is only sound because those escape hatches were checked for and are ABSENT
from these dashboards. Before trusting the output, re-run:

    grep -rnoE "window\\[[^]]+\\]|eval\\(|new Function" --include=*.js <skill>/

If that ever starts matching, this tool's premise is broken and its output must not be
acted on.

Two earlier versions of this sweep were WRONG and both were caught by spot-checking:
  1. Stripping // comments with a regex also ate everything after "https://" on a line,
     deleting real call sites and inflating the count.
  2. Counting bare "name(" missed nothing, but counting comment tombstones as call sites
     DEFLATED it. Comment LINES are dropped here; comments are not stripped mid-line.

The rule below is deliberately conservative: a function is reported only when the total
number of times its name appears equals the number of times it is DEFINED. In other
words, every single mention of the name is itself a definition, and nothing references
it. One call site anywhere, in any .js, .html or .md in the skill, clears it.

REPORTS ONLY. Deletes nothing.
"""
from __future__ import annotations

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = ("__pycache__", "_parts", "_mockups")
ESCAPE_HATCH = re.compile(r"window\[[^\]]+\]|eval\(|new Function")


def is_comment_line(line: str) -> bool:
    s = line.lstrip()
    return s.startswith("//") or s.startswith("*") or s.startswith("/*")


def sweep_skill(skill: str):
    base = os.path.join(ROOT, skill)
    js_files, corpus_lines, hatches = [], [], []
    for dp, _dn, fn in os.walk(base):
        if any(x in dp for x in SKIP_DIRS):
            continue
        for f in fn:
            p = os.path.join(dp, f)
            if f.endswith(".js"):
                js_files.append(p)
            if f.endswith((".js", ".html", ".md")):
                try:
                    text = open(p, encoding="utf-8", errors="ignore").read()
                except OSError:
                    continue
                corpus_lines += text.splitlines()
                if f.endswith(".js") and ESCAPE_HATCH.search(text):
                    hatches.append(os.path.relpath(p, ROOT))
    if not js_files:
        return [], hatches

    # Drop comment LINES so tombstones ("// fooHTML removed") do not read as call sites.
    code = "\n".join(l for l in corpus_lines if not is_comment_line(l))

    dead = []
    for f in js_files:
        src = open(f, encoding="utf-8", errors="ignore").read()
        for m in re.finditer(r"^\s*function\s+([A-Za-z_$][\w$]*)\s*\(", src, re.M):
            n = m.group(1)
            mentions = len(re.findall(r"\b" + re.escape(n) + r"\b", code))
            defs = len(re.findall(r"function\s+" + re.escape(n) + r"\b", code))
            if mentions <= defs:
                rel = os.path.relpath(f, ROOT).replace(os.sep, "/")
                dead.append({"fn": n, "path": rel,
                             "line": src[:m.start()].count("\n") + 1,
                             "build_tree": "_platform_build" in rel})
    return dead, hatches


def main(argv):
    skills = [d for d in sorted(os.listdir(ROOT))
              if d.endswith("-1c344a") and os.path.isdir(os.path.join(ROOT, d))]
    out, all_hatches = {}, []
    for s in skills:
        dead, hatches = sweep_skill(s)
        all_hatches += hatches
        if dead:
            out[s] = dead

    if "--json" in argv:
        print(json.dumps({"dead": out, "escape_hatches": all_hatches}, indent=2))
        return 0

    print("=" * 88)
    print("DEAD JS FUNCTION SWEEP: defined in a shipped skill, never called")
    print("REPORTS ONLY. Deletes nothing.")
    print("=" * 88)

    if all_hatches:
        print("\n!! DYNAMIC DISPATCH FOUND. This tool's premise is broken here:")
        for h in all_hatches:
            print(f"     {h}")
        print("   Do NOT act on the list below for these files.")

    live_total = build_total = 0
    for s, dead in out.items():
        live = [d for d in dead if not d["build_tree"]]
        build = [d for d in dead if d["build_tree"]]
        live_total += len(live)
        build_total += len(build)
        print(f"\n{s}  ({len(live)} shipped-runtime, {len(build)} in build tree)")
        for d in live:
            print(f"    {d['fn']:<28} {d['path']}:{d['line']}")

    print(f"\nTOTAL: {live_total} shipped-runtime, {build_total} in build trees")
    print("Build-tree hits are already classified strippable by ship_manifest.py.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
