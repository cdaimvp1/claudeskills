#!/usr/bin/env python3
"""
check_provenance.py — enforce per-fact provenance on this skill's seed (H4).

Runs the shared `provenance` validator over `dashboard/assets/seed/category-data.js`, which
is the suite's strongest existing provenance precedent: it already carries `$src` blocks
keyed by field.

WHAT IS EXEMPT, AND WHY IT IS DECLARED RATHER THAN INFERRED
------------------------------------------------------------
Provenance is required for FACTS: values asserting something about the world. Four kinds of
field are not facts, and each is listed by name below rather than caught by a heuristic.
A heuristic would quietly widen over time; a named list has to be edited on purpose, and the
edit shows up in review.

Run: python check_provenance.py
"""
from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from provenance import ProvenanceError, stub_report, validate_provenance  # noqa: E402

SEED = os.path.join(HERE, "dashboard", "assets", "seed", "category-data.js")

# Declared, with the reason each is not a fact.
EXEMPT = {
    "commodity": "identifier, not a claim about the world",
    "name":      "label, not a claim about the world",
    "ytdNote":   "free-text commentary on the figures, not itself a figure",
    "cutoff":    "dataset-level metadata; it IS provenance rather than a fact needing it",
    "p80":       "carries the gap marker '~' rather than a value",
}


def load_seed(path=SEED):
    text = open(path, encoding="utf-8", errors="ignore").read()
    m = re.search(r"var CATEGORY_SEED\s*=\s*(\{.*\})\s*;?\s*$", text, re.S)
    blob = m.group(1) if m else text[text.find("{"):text.rfind("}") + 1]
    return json.loads(blob)


def main():
    if not os.path.isfile(SEED):
        print("seed not found: %s" % SEED, file=sys.stderr)
        return 2
    data = load_seed()
    cats = data.get("categories") or []
    print("=" * 82)
    print("PER-FACT PROVENANCE (H4) over %d categories" % len(cats))
    print("=" * 82)

    failures, stubs = [], []
    for c in cats:
        meta = c.get("meta") or {}
        src = meta.get("$src") or {}
        values = {k: v for k, v in meta.items() if k != "$src"}
        label = (c.get("title") or "?")[:28]
        try:
            r = validate_provenance(values, src, exempt=tuple(EXEMPT), label=label)
            print("  [OK  ] %-30s sourced %2d  derived %2d  stub %d"
                  % (label, r["sourced"], r["derived"], len(r["stub_fields"])))
            stubs += [dict(s, category=label) for s in stub_report(values, src, tuple(EXEMPT))]
        except ProvenanceError as e:
            failures.append((label, str(e)))
            print("  [FAIL] %-30s %s" % (label, str(e)[:78]))

    print("\n  exempt (declared, not inferred):")
    for k, why in sorted(EXEMPT.items()):
        print("    %-11s %s" % (k, why))

    # Stubs are legitimate and must not fail the build, but shipping a deliverable built on
    # them without saying so is exactly what the flag exists to prevent.
    if stubs:
        by_field = sorted({s["field"] for s in stubs})
        print("\n  STUB-SOURCED FIELDS (%d): %s" % (len(by_field), ", ".join(by_field)))
        print("  Legitimate and honestly labelled. Say so in any deliverable built on them.")

    print("\n" + "=" * 82)
    print("%d category(ies), %d failure(s)" % (len(cats), len(failures)))
    print("=" * 82)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
