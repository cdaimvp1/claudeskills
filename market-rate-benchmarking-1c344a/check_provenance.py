#!/usr/bin/env python3
"""check_provenance.py — per-fact provenance over this skill's data points (H4 / G13b).

Row-level form: each benchmark data point IS a fact and carries its own source columns
(`source`, `date`, `tier`). Validated against the same rules as category-strategy's
field-keyed sidecar, because the principle is identical and only the container differs.

Run: python check_provenance.py <benchmarking_input.json>
"""
from __future__ import annotations

import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from provenance import ProvenanceError, validate_rows  # noqa: E402


def check(payload):
    total = {"checked": 0, "abstained": 0, "rows": 0}
    for rl in payload.get("rate_lines") or []:
        r = validate_rows(rl.get("data_points") or [], "source", "date",
                          label="rate_line %r data_points" % (rl.get("name") or "?"),
                          tier_key="tier")
        for k in total:
            total[k] += r[k]
    return total


def main(argv):
    if not argv:
        print(__doc__.strip()); return 0
    with open(argv[0], encoding="utf-8") as fh:
        payload = json.load(fh)
    try:
        t = check(payload)
    except ProvenanceError as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr); return 2
    print("OK: %d data point(s) carry a named source and a usable capture date" % t["checked"])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
