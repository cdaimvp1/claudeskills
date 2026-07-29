"""
h3_claimgate_audit.py
WS H item H3: audit G12 claim-gate IMPLEMENTATION vs MENTION across the suite.

G12 (defined at lilly-brand-assets-1c344a/SKILL.md:1113) says every claim a skill
emits is either CITED or ABSTAINED. The audit finding that prompted this item was
that G12 is named in only 2 of 31 SKILL.md files, which raises the question of
whether the guardrail is actually in force or merely declared centrally.

Naming G12 is NOT the test. A skill that never says "G12" but requires a source on
every finding and ships explicit abstain markers is implementing it. A skill that
cites G12 in a guardrail list and then never mentions a citation or a gap marker
again is not. So this scores the MECHANISMS G12 specifies, not the label.

Mechanisms scored, straight from the G12 text:
  ABSTAIN    [CONFIRM: ...] markers, or NEEDS_INPUT / NOT VERIFIED /
             RESEARCH PENDING / NOT APPLICABLE labeled states
  CITE       a requirement that claims carry a checkable source
  NOFAB      the anti-fabrication prohibitions (never invent / never fabricate)
  DROP       "drop, do not dilute": an uncitable finding is dropped, not softened
  ENFORCED   a code path that RAISES or REFUSES on a missing citation or field,
             rather than an instruction the model has to remember

Grades:
  IMPLEMENTED  ABSTAIN and CITE and NOFAB present
  PARTIAL      some mechanisms, not the core three
  MENTION-ONLY names G12 but carries none of its mechanisms
  ABSENT       neither the label nor the mechanisms

Read-only. Produces findings, changes nothing. Stdlib only.
"""

from __future__ import annotations

import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

PATTERNS = {
    "ABSTAIN": [
        r"\[CONFIRM", r"NEEDS_INPUT", r"NOT VERIFIED", r"RESEARCH PENDING",
        r"NOT APPLICABLE",
        # The hub/dashboard skills express the same mechanism differently. Missing
        # these produced a false ABSENT on rfx-hub and deal-tab on the first run,
        # which is why the wording variants are enumerated rather than assumed.
        r"gap-stat", r"gap stat", r"labeled state", r"labelled state",
        # THIRD false negative of the same kind: the bare word. procurement-help-desk
        # says "ABSTAIN rather than fabricate" at SKILL.md:138, the most direct possible
        # statement of the mechanism, and this list did not contain "abstain", so the
        # abstain audit could not detect the word abstain. Matching wording instead of
        # mechanism keeps producing the same failure; every variant found is kept here.
        r"abstain",
        # FOURTH, and the reason the note below exists: workflow-map marks an unknown
        # stakeholder as [OWNER?] rather than inventing one, which IS cite-or-abstain
        # applied to stakeholders. Generic bracketed ALL-CAPS placeholder, so the next
        # skill that coins its own marker is caught without another round of this.
        r"\[[A-Z_]+\?\]",
    ],
    "CITE": [
        r"\bcite\b", r"\bcited\b", r"\bcitation", r"source citation",
        r"evidence badge", r"with sources", r"cite the source",
    ],
    "NOFAB": [
        r"never fabricate", r"do not fabricate", r"never invent", r"do not invent",
        r"no fabricat", r"anti-fabrication", r"never assert", r"fabricat",
        r"nothing is invented", r"not invented",
    ],
    "DROP": [
        r"drop, do not dilute", r"dropped, not reworded", r"drop rather than",
        r"dropped rather than",
    ],
    "ENFORCED": [
        r"\braises?\b.{0,40}\b(rather than|instead of)\b", r"\brefus(e|es|ing)\b",
        r"ValidationError", r"ReconciliationError", r"assert_", r"must raise",
        r"raises? `?\w*Error", r"do not deliver a document",
    ],
}

CORE = ("ABSTAIN", "CITE", "NOFAB")


def scan(text):
    hits = {}
    for name, pats in PATTERNS.items():
        n = 0
        for p in pats:
            n += len(re.findall(p, text, re.IGNORECASE))
        hits[name] = n
    return hits


def grade(hits, names_g12):
    core_present = all(hits[k] > 0 for k in CORE)
    any_present = any(hits[k] > 0 for k in PATTERNS)
    if core_present:
        return "IMPLEMENTED"
    if any_present:
        return "PARTIAL"
    if names_g12:
        return "MENTION-ONLY"
    return "ABSENT"


def main():
    skills = sorted(
        d for d in os.listdir(ROOT)
        if os.path.isdir(os.path.join(ROOT, d))
        and os.path.isfile(os.path.join(ROOT, d, "SKILL.md"))
    )

    rows = []
    for s in skills:
        path = os.path.join(ROOT, s, "SKILL.md")
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        # include the skill's own reference files: G12's mechanisms often live there
        refdir = os.path.join(ROOT, s, "references")
        if os.path.isdir(refdir):
            for f in sorted(os.listdir(refdir)):
                if f.endswith(".md"):
                    with open(os.path.join(refdir, f), encoding="utf-8") as fh:
                        text += "\n" + fh.read()
        names = bool(re.search(r"\bG12\b", text))
        hits = scan(text)
        rows.append((s, names, hits, grade(hits, names)))

    print("=" * 100)
    print("H3: G12 CLAIM-GATE, IMPLEMENTATION vs MENTION")
    print("=" * 100)
    print(f"{'skill':38} {'G12?':5} {'ABST':>5} {'CITE':>5} {'NOFAB':>6} "
          f"{'DROP':>5} {'ENF':>4}  grade")
    print("-" * 100)
    for s, names, h, g in rows:
        print(f"{s:38} {'yes' if names else '-':5} {h['ABSTAIN']:>5} {h['CITE']:>5} "
              f"{h['NOFAB']:>6} {h['DROP']:>5} {h['ENFORCED']:>4}  {g}")

    print("-" * 100)
    from collections import Counter
    tally = Counter(g for _, _, _, g in rows)
    named = sum(1 for _, n, _, _ in rows if n)
    print(f"skills audited: {len(rows)}")
    print(f"name G12 explicitly: {named}")
    for k in ("IMPLEMENTED", "PARTIAL", "MENTION-ONLY", "ABSENT"):
        print(f"  {k:14} {tally.get(k, 0)}")

    print()
    print("SKILLS TO LOOK AT FIRST")
    weak = [(s, h) for s, n, h, g in rows if g in ("PARTIAL", "MENTION-ONLY", "ABSENT")]
    if not weak:
        print("  none: every skill carries the core three mechanisms")
    for s, h in weak:
        missing = [k for k in CORE if h[k] == 0]
        print(f"  {s:38} missing core mechanism(s): {', '.join(missing) or 'none'}")

    print()
    print("NO CODE-ENFORCED GATE (instruction only, so it can be forgotten)")
    unenforced = [s for s, n, h, g in rows if h["ENFORCED"] == 0]
    for s in unenforced:
        print(f"  {s}")
    print(f"  total {len(unenforced)} of {len(rows)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
