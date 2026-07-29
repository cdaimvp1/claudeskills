"""
h5_citation_resolver.py
WS H item H5: verify citations RESOLVE, not merely that they exist.

The distinction is the whole point. A citation that is present but does not
resolve is worse than a missing one, because it reads as evidence. G12's own
definition of CITED is "a specific, checkable source" - checkable is the operative
word, and nothing in the suite has ever checked.

This resolves three things, in increasing strictness:

  FILE   does the cited file exist at all
  LINE   if the citation names a line or range, does the file have that many lines
  DRIFT  a line citation pointing PAST the end of a file is almost always a stale
         citation left behind when the file shrank, which is the failure mode
         worth catching

Citation forms recognised:
    `playbook.md:17-22`            file plus line range
    `SKILL.md:658`                 file plus line
    references/risk-scoring.md     bare path
    /mnt/skills/user/<skill>/...   cross-skill absolute path

SCOPE, stated because it bounds the result: this checks citations to files INSIDE
this repo. It does not check web URLs, and it cannot check whether the cited line
actually SAYS what the citing text claims. Resolving is necessary, not sufficient.

Read-only. Stdlib only.
"""

from __future__ import annotations

import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# `name.md:12` or `name.md:12-34`, inside backticks or bare.
CITE_RE = re.compile(
    r"`?([A-Za-z0-9_][A-Za-z0-9_\-./]*\.(?:md|py|js|json|css)):(\d+)(?:-(\d+))?`?")
CROSS_RE = re.compile(r"/mnt/skills/user/([a-z0-9\-]+)/([A-Za-z0-9_\-./]+)")

SKIP_DIRS = {".git", "__pycache__", "_audit"}


def all_files():
    """Index every file in the repo by basename and by relative path."""
    by_base, by_rel = {}, {}
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in SKIP_DIRS]
        for f in fn:
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, ROOT).replace("\\", "/")
            by_rel[rel] = full
            by_base.setdefault(f, []).append(full)
    return by_base, by_rel


def line_count(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return sum(1 for _ in fh)
    except OSError:
        return None


def sources():
    """Every markdown file in a shipping skill, plus its references."""
    out = []
    for d in sorted(os.listdir(ROOT)):
        p = os.path.join(ROOT, d)
        if not os.path.isdir(p) or d in SKIP_DIRS or d.startswith("_"):
            continue
        for dp, dn, fn in os.walk(p):
            dn[:] = [x for x in dn if x not in SKIP_DIRS]
            for f in fn:
                if f.endswith(".md"):
                    out.append(os.path.join(dp, f))
    return sorted(out)


def main(argv):
    by_base, by_rel = all_files()
    verbose = "--verbose" in argv

    stats = Counter()
    broken_file, past_end, cross_missing = [], [], []
    cache = {}

    for src in sources():
        skill = os.path.relpath(src, ROOT).replace("\\", "/").split("/")[0]
        skill_dir = os.path.join(ROOT, skill)
        with open(src, encoding="utf-8", errors="replace") as fh:
            text = fh.read()
        rel_src = os.path.relpath(src, ROOT).replace("\\", "/")

        # ---- file:line citations -------------------------------------
        for m in CITE_RE.finditer(text):
            target, start, end = m.group(1), int(m.group(2)), m.group(3)
            stats["line_citations"] += 1

            # Resolution order matters. A citation carrying a PATH (a slash) is
            # explicit and must be honoured against the repo root FIRST; falling
            # through to a basename match would resolve
            # `rfp-engine-1c344a/SKILL.md:384` against the CITING skill's own
            # SKILL.md and report a false break. Caught doing exactly that on its
            # first run.
            cand = None
            probes = []
            if "/" in target:
                probes.append(os.path.join(ROOT, target.replace("/", os.sep)))
            probes += [os.path.join(skill_dir, target),
                       os.path.join(os.path.dirname(src), target)]
            for probe in probes:
                if os.path.isfile(probe):
                    cand = probe
                    break
            if cand is None:
                hits = by_base.get(os.path.basename(target), [])
                # prefer a hit inside the citing skill
                same = [h for h in hits if h.startswith(skill_dir)]
                cand = (same or hits or [None])[0]

            if cand is None:
                stats["file_missing"] += 1
                broken_file.append((rel_src, m.group(0), "no such file anywhere"))
                continue

            if cand not in cache:
                cache[cand] = line_count(cand)
            n = cache[cand]
            hi = int(end) if end else start
            if n is None:
                continue
            if hi > n:
                stats["line_past_end"] += 1
                past_end.append((rel_src, m.group(0),
                                 f"{os.path.relpath(cand, ROOT)} has {n} lines"))
            else:
                stats["resolved"] += 1

        # ---- cross-skill absolute paths ------------------------------
        for m in CROSS_RE.finditer(text):
            tgt_skill, tgt_path = m.group(1), m.group(2).rstrip("`.,)")
            stats["cross_citations"] += 1
            full = os.path.join(ROOT, tgt_skill, tgt_path.replace("/", os.sep))
            if not os.path.exists(full):
                stats["cross_missing"] += 1
                cross_missing.append((rel_src, f"{tgt_skill}/{tgt_path}"))

    print("=" * 96)
    print("H5: DO CITATIONS RESOLVE?")
    print("a citation that is present but does not resolve is worse than a missing one,")
    print("because it reads as evidence")
    print("=" * 96)
    print(f"\nline-number citations checked ... {stats['line_citations']:,}")
    print(f"  resolved ...................... {stats['resolved']:,}")
    print(f"  file does not exist ........... {stats['file_missing']:,}")
    print(f"  line past end of file ......... {stats['line_past_end']:,}")
    print(f"\ncross-skill path citations ...... {stats['cross_citations']:,}")
    print(f"  target does not exist ......... {stats['cross_missing']:,}")

    print("\n" + "-" * 96)
    print("LINE CITATIONS POINTING PAST THE END OF THE FILE")
    print("almost always a stale citation left behind when the file shrank")
    print("-" * 96)
    if not past_end:
        print("  none")
    for src, cite, why in past_end[: (None if verbose else 25)]:
        print(f"  {src}")
        print(f"      {cite}   ->  {why}")
    if not verbose and len(past_end) > 25:
        print(f"  ... and {len(past_end) - 25} more (--verbose for all)")

    print("\n" + "-" * 96)
    print("CITATIONS TO FILES THAT DO NOT EXIST ANYWHERE IN THE REPO")
    print("-" * 96)
    if not broken_file:
        print("  none")
    seen = Counter(c for _s, c, _w in broken_file)
    for cite, n in seen.most_common(20 if not verbose else None):
        print(f"  {n:>4}x  {cite}")

    print("\n" + "-" * 96)
    print("CROSS-SKILL CITATIONS WHOSE TARGET DOES NOT EXIST")
    print("(distinct from unresolvable-on-Desktop: these do not exist in the repo either)")
    print("-" * 96)
    agg = Counter(t for _s, t in cross_missing)
    if not agg:
        print("  none")
    for tgt, n in agg.most_common(20 if not verbose else None):
        print(f"  {n:>4}x  {tgt}")

    total_bad = stats["file_missing"] + stats["line_past_end"] + stats["cross_missing"]
    print("\n" + "=" * 96)
    print(f"{total_bad:,} citation(s) do not resolve")
    print("=" * 96)
    print("\nLIMIT: resolving is necessary, not sufficient. This proves a cited file and")
    print("line EXIST. It cannot prove the line says what the citing text claims.")
    return 1 if total_bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
