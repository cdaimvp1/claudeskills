#!/usr/bin/env python3
"""
Self-test for case_state_generator.py (F9 build 3).

Concentrates on the invariants that hurt LATER rather than here, because this skill is the
suite's state owner: a bad case file does not fail at write time, it fails as another
skill's wrong answer days afterwards.

Negative controls throughout: a legitimately minimal case must pass, an unbound case must
be allowed to exist, and re-ingesting the SAME handoff twice must be idempotent rather than
treated as a conflict.

Run: python case_state_selftest.py
"""
from __future__ import annotations

import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from case_state_generator import (                              # noqa: E402
    MEETING_COLUMNS,
    SCHEMA_VERSION,
    CaseIdError,
    DuplicateIdError,
    EnumError,
    SchemaError,
    SchemaVersionError,
    build_project_ack,
    build_team_binding,
    ingest_handoff,
    validate_case_file,
    write_meeting_log,
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
    except Exception as e:                                     # noqa: BLE001
        ok(name, False, "raised %s, expected %s" % (type(e).__name__, exc.__name__))
        return
    ok(name, False, "did not raise " + exc.__name__)


def case():
    return {
        "schema_version": SCHEMA_VERSION,
        "case_id": "RFP-2026-014",
        "case_title": "Clinical data platform migration",
        "category": "IT Professional Services",
        "status": "Active",
        "current_phase": "Q&A Window",
        "suppliers": [{"supplier_id": "SUP-01", "name": "Meridian"},
                      {"supplier_id": "SUP-02", "name": "Northwind"}],
        "stakeholders": [{"name": "M. Lane", "role": "Lead"},
                         {"name": "A. Curti", "role": "Approver"}],
        "events": [{"event_id": "EV-01", "type": "Issued"},
                   {"event_id": "EV-02", "type": "Q&A closed"}],
    }


def run():
    print("=" * 84)
    print("case_state_generator self-test")
    print("=" * 84)

    ok("T1  a well-formed case validates", validate_case_file(case())["case_id"] == "RFP-2026-014")

    # --- enums ------------------------------------------------------------------------
    raises("T2  refuses a status outside the enum", EnumError,
           lambda: validate_case_file({**case(), "status": "Paused"}))
    raises("T3  refuses a current_phase outside the enum", EnumError,
           lambda: validate_case_file({**case(), "current_phase": "Shortlist"}))
    raises("T4  refuses a stakeholder role outside the enum", EnumError,
           lambda: validate_case_file({**case(),
                                       "stakeholders": [{"name": "X", "role": "Sponsor"}]}))
    for st in ("Draft", "Active", "On Hold", "Awarded"):
        ok("T5  NEGATIVE CONTROL: %-8s is a legitimate status" % st,
           validate_case_file({**case(), "status": st})["status"] == st)

    # --- schema version ----------------------------------------------------------------
    raises("T6  refuses an unknown schema_version", SchemaVersionError,
           lambda: validate_case_file({**case(), "schema_version": "2.2"}))
    raises("T7  refuses a missing schema_version", SchemaVersionError,
           lambda: validate_case_file({k: v for k, v in case().items() if k != "schema_version"}))

    # --- identity ----------------------------------------------------------------------
    raises("T8  refuses a missing case_id", SchemaError,
           lambda: validate_case_file({**case(), "case_id": ""}))
    raises("T9  refuses a missing case_title", SchemaError,
           lambda: validate_case_file({**case(), "case_title": "  "}))

    def dup_supplier():
        c = case(); c["suppliers"][1]["supplier_id"] = "SUP-01"
        validate_case_file(c)
    raises("T10 refuses a duplicate supplier_id", DuplicateIdError, dup_supplier)

    def dup_event():
        c = case(); c["events"][1]["event_id"] = "EV-01"
        validate_case_file(c)
    raises("T11 refuses a duplicate event_id", DuplicateIdError, dup_event)

    # --- internal consistency ----------------------------------------------------------
    raises("T12 refuses a Closed case still in an active phase", SchemaError,
           lambda: validate_case_file({**case(), "status": "Closed",
                                       "current_phase": "Demo"}))
    ok("T13 NEGATIVE CONTROL: Closed + Close phase is consistent",
       validate_case_file({**case(), "status": "Closed",
                           "current_phase": "Close"})["status"] == "Closed")

    # --- the case_id preservation rule, the one that matters ---------------------------
    handoff = {"case_id": "RFP-20260601-clinical-data", "case_title": "From engine",
               "category": "IT Professional Services"}
    fresh = {k: v for k, v in case().items() if k != "case_id"}
    fresh["case_id"] = ""
    merged = ingest_handoff(fresh, handoff)
    ok("T14 ingest PRESERVES the handoff's case_id, in the engine's own format",
       merged["case_id"] == "RFP-20260601-clinical-data", merged["case_id"])
    ok("T15 ingest records where the case came from",
       merged["seeded_from"]["case_handoff"] is True)

    raises("T16 refuses to silently overwrite a DIFFERENT existing case_id", CaseIdError,
           lambda: ingest_handoff(case(), handoff))

    same = ingest_handoff({**case(), "case_id": "RFP-20260601-clinical-data"}, handoff)
    ok("T17 NEGATIVE CONTROL: re-ingesting the SAME handoff is idempotent, not a conflict",
       same["case_id"] == "RFP-20260601-clinical-data")

    raises("T18 refuses a handoff carrying no case_id", SchemaError,
           lambda: ingest_handoff(case(), {"case_title": "x"}))

    ok("T19 ingest does not invent a title over an existing one",
       ingest_handoff({**case(), "case_id": "RFP-20260601-clinical-data"},
                      handoff)["case_title"] == "Clinical data platform migration")

    # --- binding files -------------------------------------------------------------------
    b = build_team_binding(True, "https://teams.microsoft.com/l/team/x", "General", "2026-07-01")
    ok("T20 a bound case produces a binding file", b["binding"]["bound"] is True)
    raises("T21 refuses to write a binding file for an UNBOUND case", SchemaError,
           lambda: build_team_binding(False))
    raises("T22 refuses a bound case with no team_url", SchemaError,
           lambda: build_team_binding(True, "  "))

    ok("T23 the acknowledgement file records acknowledgement",
       build_project_ack(True, "2026-07-01")["acknowledged"] is True)
    raises("T24 refuses an acknowledgement file that records a NON-acknowledgement",
           SchemaError, lambda: build_project_ack(False))

    # --- meeting log ----------------------------------------------------------------------
    tmp = tempfile.mkdtemp(prefix="f9_case_")
    rows = [{"meeting_id": "M-01", "date": "2026-07-02", "type": "Kickoff",
             "attendees": "M. Lane; A. Curti", "purpose": "scope", "decisions": "",
             "actions": "", "status": "completed"},
            {"meeting_id": "M-02", "date": "2026-07-09", "type": "Q&A",
             "attendees": "M. Lane", "purpose": "supplier questions", "decisions": "",
             "actions": "", "status": "draft"}]
    p = write_meeting_log(rows, os.path.join(tmp, "meeting_log.csv"))
    with open(p, encoding="utf-8") as fh:
        head = fh.readline().strip().split(",")
    ok("T25 meeting log carries its fixed column set", head == MEETING_COLUMNS, repr(head))
    ok("T26 meeting log wrote both rows",
       sum(1 for _ in open(p, encoding="utf-8")) == 3)

    raises("T27 refuses a meeting status outside the enum", EnumError,
           lambda: write_meeting_log([{**rows[0], "status": "pending"}],
                                     os.path.join(tmp, "x.csv")))
    raises("T28 refuses duplicate meeting_ids", DuplicateIdError,
           lambda: write_meeting_log([rows[0], {**rows[1], "meeting_id": "M-01"}],
                                     os.path.join(tmp, "y.csv")))
    ok("T29 NEGATIVE CONTROL: an empty meeting log is legitimate",
       write_meeting_log([], os.path.join(tmp, "empty.csv")) is not None)

    print("=" * 84)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 84)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
