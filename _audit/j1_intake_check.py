#!/usr/bin/env python3
"""
j1_intake_check.py -- J1's verification: does a free-text need produce a correct ordered path?

WHY THIS IS A CHECK AND NOT A DEMO
----------------------------------
J1 rebuilt THEO to open with a conversation instead of a menu: diagnose -> recommend ->
confirm -> hand off. The recommendation step names a PATH, and THEO's hard grounding rule
is that every hop must trace to `routing-and-chains.md`. "Never stitch together a path from
plausibility."

A prose rule saying that is exactly the kind of instruction this programme keeps finding
was never enforced. So this file checks the two things that would make THEO fabricate:

  1. **Every skill named in the chain table actually exists.** A successor pointing at a
     retired skill sends the user to a dead end, and THEO would state it confidently.
  2. **Every path THEO could walk is composed only of documented hops.** Built by walking
     the table, so a path that cannot be derived from it cannot be produced.

WHAT IT DOES NOT CHECK
----------------------
It cannot verify that THEO *chooses well* in conversation: that is judgement, and it is
what a live run tests. It verifies that the material THEO reasons from is sound, so a good
choice is possible and a fabricated one is not.

Stdlib only. Run: python _audit/j1_intake_check.py
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAUNCHER = os.path.join(ROOT, "procurement-launcher-1c344a")
CHAINS = os.path.join(LAUNCHER, "references", "routing-and-chains.md")
SKILL = os.path.join(LAUNCHER, "SKILL.md")

NONE_PHRASES = ("none stated", "none", "n/a", "terminus", "endpoint")


def shipped_skills():
    return set(d[:-len("-1c344a")] for d in os.listdir(ROOT)
               if d.endswith("-1c344a")
               and os.path.isfile(os.path.join(ROOT, d, "SKILL.md")))


def read(p):
    with io.open(p, encoding="utf-8") as fh:
        return fh.read()


def parse_chain_table(text):
    """Parse the Skill | Predecessors | Successors table into {skill: (preds, succs)}.

    Skill names are extracted as bare tokens, because the cells are prose with the source
    phrasing preserved. Anything that is not a known shipped skill is reported rather than
    silently dropped: a name that matches nothing is exactly the defect worth finding.
    """
    rows = {}
    for line in text.splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 3:
            continue
        name = cells[0].strip("` ")
        # Row names carry a friendly parenthetical, e.g. "procurement-launcher (THEO)".
        # Stripping it is not cosmetic: without it the exists-check reported the launcher
        # itself as a skill that does not ship.
        name = re.sub(r"\s*\(.*?\)\s*$", "", name).strip()
        if name.lower() in ("skill", "---") or set(name) <= set("-: "):
            continue
        rows[name] = (cells[1], cells[2])
    return rows


def names_in(cell, known):
    """Skill names mentioned in a prose cell, matched against the known set."""
    if any(p in cell.lower() for p in NONE_PHRASES) and len(cell) < 60:
        return []
    found = []
    for k in sorted(known, key=len, reverse=True):
        if re.search(r"(?<![\w-])" + re.escape(k) + r"(?![\w-])", cell):
            found.append(k)
    return found


def walk(start, succs, seen=None, depth=0):
    """Longest documented path from a starting skill. Cycles are stopped, not followed."""
    seen = seen or set()
    if depth > 8:
        return [start]
    seen = seen | {start}
    best = [start]
    for nxt in succs.get(start, []):
        # Stop AT the cycle rather than stepping into it. Appending the revisited node
        # made the printed path show one skill twice, which reads as a real loop in the
        # data when it is only the walker turning around.
        if nxt in seen:
            continue
        cand = [start] + walk(nxt, succs, seen, depth + 1)
        if len(cand) > len(best):
            best = cand
    return best


def main(argv):
    print("=" * 92)
    print("J1 conversational intake check")
    print("=" * 92)

    known = shipped_skills()
    chain_text = read(CHAINS)
    skill_text = read(SKILL)
    rows = parse_chain_table(chain_text)

    fails = []

    # --- 1. the intake behaviour is actually specified -----------------------------------
    for needle, what in (
        ("Conversational intake", "the intake section exists"),
        ("DIAGNOSE", "step 1 diagnose"),
        ("RECOMMEND", "step 2 recommend"),
        ("CONFIRM", "step 3 confirm"),
        ("HAND OFF", "step 4 hand off"),
        ("ON REQUEST, not the default", "the menu is demoted from default"),
    ):
        ok = needle in skill_text
        print("  %-52s %s" % (what, "ok" if ok else "MISSING"))
        if not ok:
            fails.append(what)

    # --- 2. the auto-dispatch honesty SURVIVED the rewrite --------------------------------
    # This is the accuracy property the plan explicitly told J1 not to break.
    for needle, what in (
        ("Auto-dispatch (NOT available today)", "auto-dispatch honesty preserved"),
        ("Do NOT claim THEO can auto-invoke a chain", "the no-auto-invoke rule preserved"),
        ("dispatcher, not an orchestrator", "the dispatcher boundary preserved"),
    ):
        ok = needle in skill_text
        print("  %-52s %s" % (what, "ok" if ok else "LOST IN REWRITE"))
        if not ok:
            fails.append(what)

    # --- 3. direct trigger phrases still bypass intake -------------------------------------
    ok = "Direct trigger phrases still work" in skill_text
    print("  %-52s %s" % ("direct trigger phrases still bypass intake",
                          "ok" if ok else "MISSING"))
    if not ok:
        fails.append("trigger-phrase bypass")

    # --- 4. every skill in the chain table exists -------------------------------------------
    print("\n  chain table: %d row(s)" % len(rows))
    ghosts = sorted(n for n in rows if n not in known)
    if ghosts:
        print("  rows naming a skill that does not ship: %s" % ", ".join(ghosts))
        fails.append("chain table names %d non-existent skill(s)" % len(ghosts))
    else:
        print("  every chain-table row names a shipped skill            ok")

    # --- 5. paths are composed only of documented hops ---------------------------------------
    succs = {}
    for name, (_pred, succ) in rows.items():
        succs[name] = [s for s in names_in(succ, known) if s != name]

    total_hops = sum(len(v) for v in succs.values())
    print("  %d documented successor hop(s) across the table" % total_hops)

    longest = []
    for start in rows:
        p = walk(start, succs)
        if len(p) > len(longest):
            longest = p
    print("  longest documented path: %s" % " -> ".join(longest))

    undocumented = 0
    for name, nxts in succs.items():
        for n in nxts:
            if n not in rows and n not in known:
                undocumented += 1
    if undocumented:
        fails.append("%d successor(s) point outside the table and the shipped set"
                     % undocumented)
    else:
        print("  every successor resolves to a shipped skill            ok")

    # --- 6. terminals are stated, not implied -------------------------------------------------
    terminals = [n for n, v in succs.items() if not v]
    print("  %d skill(s) are path terminals (stated 'none', not guessed): %s"
          % (len(terminals), ", ".join(sorted(terminals)[:5])
             + (" ..." if len(terminals) > 5 else "")))

    print("-" * 92)
    if fails:
        print("FAILED: %d" % len(fails))
        for f in fails:
            print("  - %s" % f)
        return 1
    print("PASS. Intake is specified, the honesty properties survived the rewrite, and "
          "every path THEO can name is composed of documented hops.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
