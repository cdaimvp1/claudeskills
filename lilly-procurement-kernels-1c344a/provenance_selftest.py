#!/usr/bin/env python3
"""
Self-test for provenance.py (H4).

Negative controls are the important half here. A provenance checker that refuses everything
is easy to write and useless: derived figures, stubs and absent values are all LEGITIMATE
and must pass. What must fail is silence.

Run: python provenance_selftest.py
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from provenance import (                                        # noqa: E402
    MalformedSourceError,
    validate_rows,
    MissingProvenanceError,
    ProvenanceError,
    stub_report,
    validate_provenance,
)

PASS, FAIL = [], []


def ok(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("  ok   " if cond else "  FAIL ") + name + (("  <- " + detail) if detail and not cond else ""))


def raises(name, exc, fn):
    try:
        fn()
    except exc:
        ok(name, True)
        return
    except Exception as e:                                      # noqa: BLE001
        ok(name, False, "raised %s, expected %s" % (type(e).__name__, exc.__name__))
        return
    ok(name, False, "did not raise " + exc.__name__)


def obj():
    return {
        "s23": 214800000,
        "s24": 248600000,
        "yoy2425": 15.2,
        "vendors": 412,
    }


def src():
    return {
        "s23": [{"name": "ARIA S2P, PO Product pull", "tier": 1,
                 "confidence": "Medium", "asOf": "2026-06-01"}],
        "s24": [{"name": "ARIA S2P, PO Product pull", "tier": 1,
                 "confidence": "Medium", "asOf": "2026-06-01"}],
        "yoy2425": {"kind": "derived", "by": "annual[] FY24-FY25 delta"},
        "vendors": [{"name": "Supplier master (SAP)", "tier": 1,
                     "confidence": "Medium", "asOf": "2026-06-01", "stub": True}],
    }


def run():
    print("=" * 84)
    print("provenance self-test (H4)")
    print("=" * 84)

    r = validate_provenance(obj(), src())
    ok("T1  a fully provenanced object validates", r["checked"] == 4, str(r))
    ok("T2  sourced and derived are counted separately",
       r["sourced"] == 3 and r["derived"] == 1, str(r))
    ok("T3  stub fields are surfaced, not hidden", r["stub_fields"] == ["vendors"],
       str(r["stub_fields"]))

    # --- the sidecar's weakness, which is the whole reason for this check ---------------
    def forgot():
        v = obj(); v["newField"] = 99
        validate_provenance(v, src())
    raises("T4  refuses a field added WITHOUT a $src entry", MissingProvenanceError, forgot)

    raises("T5  refuses an object with no $src block at all", MissingProvenanceError,
           lambda: validate_provenance(obj(), None))

    def empty_list():
        s = src(); s["s23"] = []
        validate_provenance(obj(), s)
    raises("T6  refuses an EMPTY source list (not an abstention)", MissingProvenanceError,
           empty_list)

    # --- source entry shape --------------------------------------------------------------
    def no_name():
        s = src(); s["s23"][0]["name"] = "  "
        validate_provenance(obj(), s)
    raises("T7  refuses a source with no name", MalformedSourceError, no_name)

    for bad in ("", "TBD", "recent", "sometime last year", "2025-02-30"):
        def bad_date(b=bad):
            s = src(); s["s23"][0]["asOf"] = b
            validate_provenance(obj(), s)
        raises("T8  refuses asOf %-20r" % bad, MalformedSourceError, bad_date)

    for good in ("2026-06-01", "2026-06", "2026", "Jun 2026", "Jun 1, 2026"):
        def good_date(g=good):
            s = src(); s["s23"][0]["asOf"] = g
            return validate_provenance(obj(), s)
        ok("T9  NEGATIVE CONTROL: accepts asOf %-14r" % good, good_date()["checked"] == 4)

    def bad_tier():
        s = src(); s["s23"][0]["tier"] = 9
        validate_provenance(obj(), s)
    raises("T10 refuses a tier outside the 1-7 hierarchy", MalformedSourceError, bad_tier)

    def bad_conf():
        s = src(); s["s23"][0]["confidence"] = "Fairly sure"
        validate_provenance(obj(), s)
    raises("T11 refuses a confidence outside High/Medium/Low", MalformedSourceError, bad_conf)

    # --- derived facts ---------------------------------------------------------------------
    def derived_no_formula():
        s = src(); s["yoy2425"] = {"kind": "derived", "by": "  "}
        validate_provenance(obj(), s)
    raises("T12 refuses derived with no `by` formula", MalformedSourceError,
           derived_no_formula)

    def derived_and_sourced():
        s = src(); s["yoy2425"] = {"kind": "derived", "by": "x", "source": "ARIA"}
        validate_provenance(obj(), s)
    raises("T13 refuses a fact claiming to be BOTH derived and sourced",
           MalformedSourceError, derived_and_sourced)

    ok("T14 NEGATIVE CONTROL: a derived fact needs NO source and passes",
       validate_provenance({"yoy2425": 15.2},
                           {"yoy2425": {"kind": "derived", "by": "FY24-FY25 delta"}}
                           )["derived"] == 1)

    # --- legitimate absences ----------------------------------------------------------------
    ok("T15 NEGATIVE CONTROL: a None value needs no provenance",
       validate_provenance({"s23": None}, {})["checked"] == 0)
    ok("T16 NEGATIVE CONTROL: an exempt field is skipped",
       validate_provenance({"note": "free text"}, {}, exempt=("note",))["checked"] == 0)

    def wrong_shape():
        s = src(); s["s23"] = "ARIA"
        validate_provenance(obj(), s)
    raises("T17 refuses provenance that is neither a list nor a derived block",
           MalformedSourceError, wrong_shape)

    # --- stub reporting ------------------------------------------------------------------------
    st = stub_report(obj(), src())
    ok("T18 stub_report finds the stub", len(st) == 1 and st[0]["field"] == "vendors",
       repr(st))
    ok("T19 stub_report carries the source and date so it is actionable",
       st and st[0]["source"] and st[0]["asOf"])
    ok("T20 NEGATIVE CONTROL: a stub does NOT fail validation, it is honest labelling",
       validate_provenance(obj(), src())["checked"] == 4)

    raises("T21 refuses a non-dict values object", ProvenanceError,
           lambda: validate_provenance([], {}))

    # --- row-level form: one fact per row, its source in its own columns -------------------
    ROWS = [{"source": "10-K", "date": "2026-02-11", "tier": 1, "confidence": "High"},
            {"source": "Gartner", "date": "2026-01", "tier": 2, "confidence": "Medium"}]
    r = validate_rows(ROWS, "source", "date", tier_key="tier", confidence_key="confidence")
    ok("T22 row-level provenance validates", r["checked"] == 2, str(r))

    raises("T23 refuses a row with no named source", MissingProvenanceError,
           lambda: validate_rows([{"source": "", "date": "2026-01"}], "source", "date"))
    raises("T24 refuses a row whose date is a placeholder", MalformedSourceError,
           lambda: validate_rows([{"source": "x", "date": "TBD"}], "source", "date"))
    raises("T25 refuses an out-of-range tier in a row", MalformedSourceError,
           lambda: validate_rows([{"source": "x", "date": "2026-01", "tier": 9}],
                                 "source", "date", tier_key="tier"))

    # The honest-abstention case. Refusing it would push a caller toward inventing a source.
    ab = validate_rows([{"source": "Not Determined", "date": ""}], "source", "date",
                       abstentions=("Not Determined",))
    ok("T26 NEGATIVE CONTROL: an honest abstention passes without a date",
       ab["abstained"] == 1 and ab["checked"] == 0, str(ab))

    ok("T27 NEGATIVE CONTROL: an empty row list is legitimate",
       validate_rows([], "source", "date")["rows"] == 0)
    raises("T28 refuses a non-list", ProvenanceError,
           lambda: validate_rows({}, "source", "date"))
    ok("T29 confidence is case-normalised rather than rejected on case alone",
       validate_rows([{"source": "x", "date": "2026-01", "confidence": "high"}],
                     "source", "date", confidence_key="confidence")["checked"] == 1)

    print("=" * 84)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 84)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
