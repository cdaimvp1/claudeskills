#!/usr/bin/env python3
"""
reachability_sweep.py
Finds candidates for the skills-cleanup pass Marc asked to design (not yet run).

THIS SCRIPT DELETES NOTHING AND IS NOT ABLE TO. Same discipline as ship_manifest.py:
classify and report; stripping is a separate, deliberate, reviewed step taken later,
against this report, with Marc's sign-off per bucket.

Two things it looks for, per skill:

1. UNREFERENCED FILES: a file on disk that no SKILL.md / references/*.md / *.py in
   that skill's own directory ever names. A candidate for removal -- but "looks
   unreferenced" and "is safe to remove" are NOT the same thing (proven wrong twice
   today: a "RETIRED reference" JSX is deliberately kept; several files this session
   looked like gaps and were already-shipped generators). So every candidate below
   is additionally checked for:
     - git history (a real commit history suggests real, maintained content)
     - preservation-intent language in the file itself or in _audit/*.md ("RETIRED",
       "kept so", "historical", "DO NOT delete", "reference implementation")
   and bucketed accordingly. UNCERTAIN is the default; nothing is auto-classified
   as safe-to-strip without an explicit, checkable reason.

2. DANGLING REFERENCES: a file named in SKILL.md/references/*.md that does not
   exist anywhere in that skill's directory. This is the execution-guardrails.md
   bug, generalized: a pointer to content that was moved, renamed, or never
   shipped. Every hit here is a real, fixable defect (either ship the file, or
   fix the pointer) -- unlike the unreferenced-file candidates, these do not need
   a "maybe it's intentional" caveat, because a dangling pointer helps no one.

Usage:
    python reachability_sweep.py            # human-readable report
    python reachability_sweep.py --json      # machine-readable, for a later apply step

Stdlib only. Read-only. Safe to run at any time; makes no filesystem changes.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

sys.path.insert(0, HERE)
try:
    from ship_manifest import DEAD_WEIGHT_DIRS, DEAD_WEIGHT_FILES, SUPERSEDED_ARTIFACTS, HELD_BACK
except Exception:
    DEAD_WEIGHT_DIRS, DEAD_WEIGHT_FILES, SUPERSEDED_ARTIFACTS, HELD_BACK = {}, {}, {}, {}

SKILL_DIR_RE = re.compile(r".*-1c344a$")

# Files every skill legitimately has that are entrypoints, not "referenced content" --
# never flag these as unreferenced even if nothing names them by filename.
ALWAYS_LIVE_BASENAMES = {"SKILL.md", "MAINTENANCE.md"}
ALWAYS_LIVE_SUFFIXES = ("_selftest.py", "selftest.py")

# A file whose own name suggests it's the thing that RUNS other things (a generator,
# an engine, a kernel) is reached by Python import machinery, not by being named in
# prose -- don't flag these just because SKILL.md describes calling a function in
# them rather than naming the filename verbatim near every mention.
CODE_ENTRYPOINT_SUFFIXES = (
    "_generator.py", "_engine.py", "_kernel.py", "kernel.py", "_adapter.py",
    "_sections.py", "_traits.py", "_viz.py", "_schema.py",
)

PRESERVATION_KEYWORDS = [
    "RETIRED", "retired reference", "kept so", "kept for", "historical",
    "DO NOT delete", "do not remove", "reference implementation",
    "superseded by", "pinned by", "strippable-at-packaging",
]

# Known lilly-brand-assets-1c344a reference docs (confirmed by direct read of that
# skill's SKILL.md, not inferred): every skill in the suite cites these by bare
# filename constantly, often in shorthand comments far from any "inside
# lilly-brand-assets" phrasing, so a nearby-text heuristic under-excludes them. Named
# explicitly here instead of guessed at.
KNOWN_LILLY_BRAND_ASSETS_REFS = {
    "execution-guardrails.md", "dashboard-components.md", "brand-colors.md",
    "scoring-scales.md", "sme-matrix.md", "risk-scoring.md", "docx-design-system.md",
    "docx-title-page-spec.md", "narrative-standards.md", "validation-checklist.md",
    "house-styles.md", "supplier-risk.md", "user-manual.md", "aria-enrichment.md",
    "sharepoint-search-and-extract.md", "rfx-teams-site-binding.md",
}

# The vendored-kernel family (confirmed by kernel_manifest.py to be copy-pasted
# byte-for-byte across 12+ skills): their citation comments ("see arithmetic-
# verification.md") point at whichever skill the kernel was ORIGINALLY written
# for, not the skill it happens to be vendored into today. Checking these for
# per-skill dangling references produces pure noise -- kernel_manifest.py
# already owns kernel-file integrity; this sweep does not re-check them.
VENDORED_KERNEL_BASENAMES = {
    "numeric_kernel.py", "tier_kernel.py", "audience_kernel.py", "roster_kernel.py",
    "frap_chain_kernel.py", "provenance.py", "panel_contract.py", "journey_state.py",
}

# Extensions worth scanning for filename mentions and worth flagging as candidates.
TEXT_EXTS = {".md", ".py", ".json", ".js", ".jsx"}
CANDIDATE_EXTS = {".md", ".py", ".jsx", ".html", ".csv", ".xlsx", ".docx", ".pptx", ".json"}


def iter_skill_dirs():
    for name in sorted(os.listdir(ROOT)):
        full = os.path.join(ROOT, name)
        if os.path.isdir(full) and SKILL_DIR_RE.match(name):
            yield name, full


def iter_files(skill_root):
    for dp, dn, fn in os.walk(skill_root):
        dn[:] = [d for d in dn if d not in DEAD_WEIGHT_DIRS and d != ".git"]
        for f in fn:
            if f in DEAD_WEIGHT_FILES:
                continue
            if any(f.endswith(ext) for ext in DEAD_WEIGHT_FILES):
                continue
            yield os.path.relpath(os.path.join(dp, f), skill_root)


def read_text(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""


def git_last_touch(rel_path_from_root):
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%ad|%s", "--date=short", "--", rel_path_from_root],
            cwd=ROOT, capture_output=True, text=True, timeout=15,
        )
        line = out.stdout.strip()
        return line if line else None
    except Exception:
        return None


def is_always_live(rel_path):
    base = os.path.basename(rel_path)
    if base in ALWAYS_LIVE_BASENAMES:
        return True
    if any(base.endswith(s) for s in ALWAYS_LIVE_SUFFIXES):
        return True
    return False


def is_code_entrypoint(rel_path):
    base = os.path.basename(rel_path)
    return any(base.endswith(s) for s in CODE_ENTRYPOINT_SUFFIXES)


def already_known(rel_path, skill_name):
    key = f"{skill_name}/{rel_path}".replace("\\", "/")
    if skill_name in HELD_BACK:
        return "skill is HELD_BACK entirely -- do not sweep, out of scope"
    for pinned in SUPERSEDED_ARTIFACTS:
        if pinned.replace("\\", "/") == key:
            return "already tracked in ship_manifest.SUPERSEDED_ARTIFACTS"
    return None


def sweep_skill(skill_name, skill_root):
    all_files = list(iter_files(skill_root))
    basenames_on_disk = {os.path.basename(p): p for p in all_files}

    # Build the "referenced" set: every basename mentioned inside any text file
    # in this skill's own directory (SKILL.md, references/*.md, *.py, *.json).
    corpus = []
    for rel in all_files:
        if os.path.splitext(rel)[1] in TEXT_EXTS:
            corpus.append((rel, read_text(os.path.join(skill_root, rel))))

    mentioned = set()
    for rel, text in corpus:
        for base in basenames_on_disk:
            if base in text and base != os.path.basename(rel):
                mentioned.add(base)

    unreferenced = []
    for rel in all_files:
        base = os.path.basename(rel)
        ext = os.path.splitext(rel)[1]
        if ext not in CANDIDATE_EXTS:
            continue
        if is_always_live(rel) or is_code_entrypoint(rel):
            continue
        if base in mentioned:
            continue
        known = already_known(rel, skill_name)
        if known:
            continue
        full_path = os.path.join(skill_root, rel)
        text = read_text(full_path) if ext in TEXT_EXTS else ""
        hit_keywords = [k for k in PRESERVATION_KEYWORDS if k.lower() in text.lower()]
        rel_from_root = os.path.relpath(full_path, ROOT)
        last_touch = git_last_touch(rel_from_root)
        size_kb = (os.path.getsize(full_path) // 1024) if os.path.exists(full_path) else 0

        if hit_keywords:
            bucket = "DO_NOT_TOUCH (preservation language found in the file itself)"
        elif last_touch is None:
            bucket = "UNCERTAIN (no git history found -- verify manually before any action)"
        else:
            bucket = "UNCERTAIN (has git history; verify intent before any action)"

        unreferenced.append({
            "path": rel, "size_kb": size_kb, "last_touch": last_touch,
            "preservation_keywords_found": hit_keywords, "bucket": bucket,
        })

    # Dangling references: basenames mentioned in this skill's OWN text that do not
    # exist ANYWHERE in this skill's own directory. Scoped to .md/.py/.jsx/.json only
    # -- .xlsx/.docx/.pptx/.csv are almost always runtime-GENERATED outputs described
    # in prose ("writes rate_comparison.xlsx"), not shipped content that should be
    # sitting on disk, so checking those produces near-total noise, not findings.
    dangling = []
    corpus = [(rel, text) for rel, text in corpus if os.path.basename(rel) not in VENDORED_KERNEL_BASENAMES]
    # .json dropped from this check entirely: almost every .json mention in this suite
    # is a user-carried RUNTIME state file (voice_profile.json, field_guide_state.json,
    # timeline_calibration.json, landscape_handoff.json...) that is correctly never
    # shipped in the repo -- SKILL.md documents its schema, the user's own Project
    # Knowledge or conversation carries the actual file. Checking these produces
    # near-total noise, not findings, the same reasoning that already excluded
    # .xlsx/.docx/.pptx as generated-output mentions.
    filename_pattern = re.compile(r"[A-Za-z0-9_\-]+\.(?:md|py|jsx)")
    PLACEHOLDER_STEMS = {"x", "y", "z", "foo", "bar", "baz", "example", "template",
                          "placeholder", "n", "name", "path"}
    # Anthropic's built-in tools, named in prose but never part of this repo.
    BUILTIN_TOOL_FILES = {"unpack.py", "extract-text"}
    CROSS_SKILL_MARKER_RE = re.compile(
        r"-1c344a|/mnt/skills/user/|INLINED:|inside\s|section inside",
        re.IGNORECASE,
    )
    for rel, text in corpus:
        # Line-scoped, not char-window-scoped: the actual phrasing in this repo puts
        # the cross-skill marker (e.g. "... inside lilly-brand-assets-1c344a/SKILL.md")
        # AFTER the filename in the same sentence, not before it, so a fixed
        # look-behind window missed nearly every real case. A line (this repo writes
        # these as single long lines/bullets) is the right unit to check both ways.
        for line in text.split("\n"):
            for m in filename_pattern.finditer(line):
                fname = m.group(0)
                stem = os.path.splitext(fname)[0].lower()
                if fname in basenames_on_disk:
                    continue
                if fname in BUILTIN_TOOL_FILES:
                    continue
                if fname in KNOWN_LILLY_BRAND_ASSETS_REFS and skill_name != "lilly-brand-assets-1c344a":
                    continue
                if stem in PLACEHOLDER_STEMS:
                    continue
                if CROSS_SKILL_MARKER_RE.search(line):
                    continue  # cross-skill pointer (to lilly-brand-assets or a named sibling skill), out of scope here
                dangling.append({"referenced_as": fname, "found_in": rel})

    return unreferenced, dangling


def main():
    as_json = "--json" in sys.argv
    report = {}
    total_unreferenced = 0
    total_dangling = 0

    for skill_name, skill_root in iter_skill_dirs():
        unreferenced, dangling = sweep_skill(skill_name, skill_root)
        if unreferenced or dangling:
            report[skill_name] = {"unreferenced_candidates": unreferenced, "dangling_references": dangling}
            total_unreferenced += len(unreferenced)
            total_dangling += len(dangling)

    if as_json:
        print(json.dumps(report, indent=2))
        return

    print("=" * 92)
    print("REACHABILITY SWEEP -- candidates only. Nothing here has been removed or changed.")
    print("=" * 92)
    for skill_name, data in report.items():
        if data["dangling_references"]:
            print(f"\n{skill_name} -- DANGLING REFERENCES ({len(data['dangling_references'])}):")
            for d in data["dangling_references"]:
                print(f"    {d['found_in']} mentions '{d['referenced_as']}', which does not exist in this skill")
        if data["unreferenced_candidates"]:
            print(f"\n{skill_name} -- unreferenced-file candidates ({len(data['unreferenced_candidates'])}):")
            for u in data["unreferenced_candidates"]:
                kw = f", preservation language: {u['preservation_keywords_found']}" if u["preservation_keywords_found"] else ""
                lt = f", last touched {u['last_touch']}" if u["last_touch"] else ", no git history"
                print(f"    {u['path']} ({u['size_kb']} KB{lt}{kw}) -> {u['bucket']}")

    print("\n" + "=" * 92)
    print(f"TOTAL: {total_unreferenced} unreferenced-file candidate(s), {total_dangling} dangling reference(s)")
    print("Every candidate needs the verify-before-classify step (Phase 2 of the cleanup")
    print("process) before anything is decided, let alone removed. This sweep's own")
    print("basename-matching is a pattern list and will under-report and over-report --")
    print("read each hit, don't trust the count.")
    print("=" * 92)


if __name__ == "__main__":
    main()
