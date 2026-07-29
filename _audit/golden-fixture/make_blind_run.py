#!/usr/bin/env python3
"""
make_blind_run.py — build a QUARANTINED copy of the fixture for a blind run (#30).

RUN-PROTOCOL.md requires the runner to have seen neither `ANSWER-KEY.md` nor
`expected-findings.json`. Relying on the runner to simply not look is not a control, so
this builds a directory that contains only what a reviewer legitimately gets:

    documents/   the six contract files, and nothing else
    skill/       a copy of lilly-contract-review, so the runner needs no path back here
    output/      empty, for the run's result

Nothing from this directory (answer key, expected findings, README, RUN-PROTOCOL) is
copied. The runner is then pointed at the quarantine and told to stay inside it, so a
stray search cannot reach the key even by accident.

WHY THE BANNER IS STRIPPED
--------------------------
Every one of the six documents opens with:

    **SYNTHETIC TEST DOCUMENT. Contains deliberately planted defects. See ANSWER-KEY.md.**

That line contaminates any blind run twice over. It tells the reviewer defects were planted,
so they hunt harder than they would on a real contract and the run measures effort rather
than the skill's normal behaviour. And it names the answer key, inviting exactly the lookup
the protocol forbids. The banner is useful to a human browsing the repo, so it stays in the
originals and is removed only from the quarantined copies.

This was found by checking the quarantine rather than assuming it, which is the same
discipline the fixture itself exists to enforce.

Usage:
    python make_blind_run.py <target_dir>
"""
from __future__ import annotations

import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SKILL_SRC = os.path.join(REPO, "lilly-contract-review-1c344a")

DOCUMENTS = [
    "MSA.md",
    "EXHIBIT-A-Definitions.md",
    "EXHIBIT-B-SLA-and-Rate-Card.md",
    "EXHIBIT-C-AI-Standard.md",
    "SPS-Supplier-Privacy-Schedule.md",
    "WO-10-under-review.md",
]

# Never copied. Listed explicitly so the exclusion is auditable rather than implied by
# whatever DOCUMENTS happens to contain.
NEVER_COPY = ["ANSWER-KEY.md", "expected-findings.json", "README.md", "RUN-PROTOCOL.md",
              "check_run.py", "make_blind_run.py", "runs"]

BANNER = re.compile(
    r"^.*(SYNTHETIC TEST DOCUMENT|planted defect|ANSWER-KEY).*$", re.I | re.M)

# Anything matching these in the built quarantine means the build is unsafe.
LEAK_PATTERNS = [r"answer[\s\-]?key", r"expected[\s\-]findings", r"planted",
                 r"synthetic test document", r"golden fixture"]


def build(target):
    docs = os.path.join(target, "documents")
    skill = os.path.join(target, "skill")
    out = os.path.join(target, "output")

    if os.path.exists(target):
        shutil.rmtree(target)
    os.makedirs(docs)
    os.makedirs(out)

    stripped = 0
    for name in DOCUMENTS:
        src = os.path.join(HERE, name)
        if not os.path.isfile(src):
            raise SystemExit("missing fixture document: %s" % name)
        text = open(src, encoding="utf-8", newline="").read()
        text, n = BANNER.subn("", text)
        stripped += n
        open(os.path.join(docs, name), "w", encoding="utf-8", newline="").write(text)

    if os.path.isdir(SKILL_SRC):
        shutil.copytree(SKILL_SRC, skill)
    else:
        print("WARNING: skill not found at %s; the runner will need it supplied "
              "another way" % SKILL_SRC)

    return docs, skill, out, stripped


def verify(target):
    """Prove the quarantine is clean. A build that cannot be verified is not usable."""
    problems = []
    for name in NEVER_COPY:
        for dp, dn, fn in os.walk(target):
            if name in fn or name in dn:
                problems.append("excluded item present: %s in %s" % (name, dp))

    docs = os.path.join(target, "documents")
    for f in sorted(os.listdir(docs)):
        text = open(os.path.join(docs, f), encoding="utf-8", errors="ignore").read()
        for pat in LEAK_PATTERNS:
            if re.search(pat, text, re.I):
                problems.append("leak %r in documents/%s" % (pat, f))
    return problems


def main(argv):
    if not argv:
        print(__doc__.strip())
        return 0
    target = os.path.abspath(argv[0])
    docs, skill, out, stripped = build(target)

    print("=" * 78)
    print("BLIND RUN QUARANTINE")
    print("=" * 78)
    print("  target      %s" % target)
    print("  documents   %d" % len(os.listdir(docs)))
    print("  banners stripped from the copies: %d" % stripped)
    print("  skill       %s" % ("copied" if os.path.isdir(skill) else "NOT COPIED"))

    problems = verify(target)
    if problems:
        print("\nUNSAFE, do not run:")
        for p in problems:
            print("   - %s" % p)
        return 2
    print("\nVERIFIED CLEAN: no answer key, no expected findings, no test banner.")
    print("\nGive the runner ONLY this directory, and instruct it not to search outside.")
    print("Run TWICE, in separate sessions: 'Redline only' (the default, and the mode the")
    print("output-mode audit found degraded) and 'Full review'. Separate sessions matter:")
    print("one runner doing both would carry the first run's findings into the second.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
