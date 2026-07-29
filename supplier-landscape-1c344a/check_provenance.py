#!/usr/bin/env python3
"""check_provenance.py — per-fact provenance (risk_matrix rows) (H4 / G13b).

Row-level form: each row IS a fact carrying `evidence_source` AND `evidence_as_of`.

`evidence_as_of` was added to this schema so the capture date is validated rather than merely
hoped for. Before it, a source from 2019 and one from last week were indistinguishable.
An honest abstention ("Not Determined") still passes without a date, because there is no
evidence to date and demanding one would push a caller toward inventing it.

Run: python check_provenance.py <data.json>
"""
from __future__ import annotations

import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from provenance import ProvenanceError, validate_rows  # noqa: E402

ABSTENTIONS = ("Not Determined", "Not determined", "not determined",
               "Not Publicly Disclosed", "Not verified")


def check(rows):
    return validate_rows(rows or [], "evidence_source", "evidence_as_of", label="risk_matrix rows",
                         confidence_key="confidence", abstentions=ABSTENTIONS)


def main(argv):
    if not argv:
        print(__doc__.strip()); return 0
    with open(argv[0], encoding="utf-8") as fh:
        payload = json.load(fh)
    rows = payload if isinstance(payload, list) else (payload.get("risks") or [])
    try:
        r = check(rows)
    except ProvenanceError as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr); return 2
    print("OK: %d fact(s) carry a named source and capture date, %d honest abstention(s)"
          % (r["checked"], r["abstained"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
