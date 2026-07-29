#!/usr/bin/env python3
"""check_provenance.py — per-fact provenance over the Cost-Driver Assumption Ledger (H4 / G13b).

Row-level form: each cost driver IS a fact and carries `source`, `source_date` and
`confidence`. This is the fullest row-level provenance in the suite: name, capture date and
confidence all present as their own columns.

Run: python check_provenance.py <register.json>
"""
from __future__ import annotations

import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from provenance import ProvenanceError, validate_rows  # noqa: E402


def check(register):
    return validate_rows(register.get("cost_drivers") or [], "source", "source_date",
                         label="cost_drivers", confidence_key="confidence")


def main(argv):
    if not argv:
        print(__doc__.strip()); return 0
    with open(argv[0], encoding="utf-8") as fh:
        reg = json.load(fh)
    try:
        r = check(reg)
    except ProvenanceError as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr); return 2
    print("OK: %d cost driver(s) carry source, capture date and confidence" % r["checked"])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
