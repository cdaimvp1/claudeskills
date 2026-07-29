#!/usr/bin/env python3
"""check_provenance.py — per-fact provenance (H4 / G13b).

Row-level form: each risk_matrix rows row IS a fact carrying its own source (`evidence_source`).

**A SCHEMA GAP THIS CHECK SURFACES.** G13b requires a source AND a usable capture date per
fact. This skill's rows carry the source but have **no separate as-of field**, so the date
cannot be validated and a stale source is indistinguishable from a fresh one. That is a
schema change rather than a data fix, so it is reported here rather than silently passed or
failed. What IS enforced: every row names a source or honestly abstains.

Run: python check_provenance.py <data.json>
"""
from __future__ import annotations

import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from provenance import MissingProvenanceError  # noqa: E402

ABSTENTIONS = ("Not Determined", "Not determined", "not determined")


def check(rows):
    """Names only: this schema carries no as-of field. See the module docstring."""
    named = abstained = 0
    for i, row in enumerate(rows or []):
        v = (row.get("evidence_source") or "").strip()
        if v in ABSTENTIONS:
            abstained += 1
            continue
        if not v:
            raise MissingProvenanceError(
                "risk_matrix rows[%d] has no evidence_source. A row asserting a fact must name its source, or say "
                "'Not Determined', which is an answer." % i)
        named += 1
    return {"named": named, "abstained": abstained, "rows": len(rows or []),
            "as_of_validated": False,
            "schema_gap": "no per-row as-of field; capture date cannot be checked"}


def main(argv):
    if not argv:
        print(__doc__.strip()); return 0
    with open(argv[0], encoding="utf-8") as fh:
        payload = json.load(fh)
    rows = payload.get("risks") or payload if isinstance(payload, list) else payload.get("risks") or []
    try:
        r = check(rows)
    except MissingProvenanceError as e:
        print("REFUSED: %s" % e, file=sys.stderr); return 2
    print("OK: %d named, %d honest abstention(s)" % (r["named"], r["abstained"]))
    print("SCHEMA GAP: %s" % r["schema_gap"])
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
