#!/usr/bin/env python3
"""
Self-test for journey_state.py (J3).

J3's stated verification is behavioural: "second run in the same Project detects the state
file and does not re-ask; deleting it returns first-run behaviour with a recoverable
message." Both halves are tested here, plus the two properties that make the record safe to
persist at all: it refuses to store artifact content, and it refuses an untagged input.

Run: python journey_state_selftest.py
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from journey_state import (                                          # noqa: E402
    ASSUMED, CONFIRMED, JourneyError, load, new_record, record_step, resume_brief,
    set_input, validate,
)

PASS, FAIL = [], []


def ok(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("  ok   " if cond else "  FAIL ") + name + (("  <- " + detail) if detail and not cond else ""))


def raises(name, fn, expect=None):
    try:
        fn()
    except JourneyError as e:
        if expect and expect.lower() not in str(e).lower():
            ok(name, False, "refused for the wrong reason: %s" % str(e)[:90])
            return
        ok(name, True)
        return
    except Exception as e:                                           # noqa: BLE001
        ok(name, False, "raised %s, expected JourneyError" % type(e).__name__)
        return
    ok(name, False, "did not refuse")


def built():
    r = new_record("analytics platform rfp")
    record_step(r, "supplier-landscape", "Analytics Workload Shortlist", "docx",
                next_hop="rfp-engine")
    set_input(r, "category", "IT Professional Services", CONFIRMED)
    set_input(r, "deal size band", "over $1M", ASSUMED)
    return r


def run():
    print("=" * 90)
    print("journey_state self-test (J3)")
    print("=" * 90)

    r = built()
    s = validate(r)
    ok("T1  a built record validates", s["steps"] == 1)
    ok("T2  confirmed and assumed inputs are counted separately",
       s["confirmed"] == 1 and s["assumed"] == 1)
    ok("T3  the next hop is carried", s["next_hop"] == "rfp-engine")

    # --- J3's stated verification, both halves -----------------------------------------
    rec, msg = load(json.dumps(r))
    ok("T4  SECOND RUN: a present state file is detected", rec is not None and msg is None)
    b = resume_brief(rec)
    ok("T5  and it produces primed context instead of re-asking",
       "supplier-landscape" in b["line"] and "rfp-engine" in b["line"], b["line"])
    ok("T6  naming the artifact by name and type", "Analytics Workload Shortlist" in b["line"])

    rec2, msg2 = load(None)
    ok("T7  DELETED state returns FIRST-RUN behaviour, not an error", rec2 is None)
    ok("T8  with a recoverable message naming how to get it back",
       "paste it back" in (msg2 or ""), msg2)

    rec3, msg3 = load("{not json at all")
    ok("T9  a CORRUPT state file also degrades to first run rather than failing",
       rec3 is None and "first run" in (msg3 or "").lower())

    rec4, msg4 = load(json.dumps({"schema_version": 99, "request_key": "x"}))
    ok("T10 a record from a different schema is ignored, because stale state silently "
       "misapplied is worse than no state", rec4 is None)

    # --- what must never be persisted ---------------------------------------------------
    def content_in_step():
        rr = built()
        rr["steps"][0]["content"] = "the full text of the MSA ..."
        validate(rr)
    raises("T11 refuses a record carrying artifact CONTENT, which would make the state "
           "file a second copy of governed data", content_in_step, "never its content")

    def long_string():
        rr = built()
        rr["steps"][0]["note"] = "x" * 900
        validate(rr)
    raises("T12 refuses a long string anywhere in the record, because that is content "
           "wearing another key's name", long_string, "that is content")

    def nested_content():
        rr = built()
        rr["inputs"]["notes"] = {"value": {"body": "clause text"}, "state": CONFIRMED}
        validate(rr)
    raises("T13 refuses content nested at depth, not just at the top level",
           nested_content, "never its content")

    # --- the CONFIRMED/ASSUMED discipline -------------------------------------------------
    raises("T14 refuses an input state outside CONFIRMED/ASSUMED",
           lambda: set_input(built(), "x", "y", "probably"), "third value")

    def untagged():
        rr = built()
        rr["inputs"]["orphan"] = {"value": "z"}
        validate(rr)
    raises("T15 refuses an untagged input, because carrying it forward would harden a "
           "guess into a fact across sessions", untagged, "hardens a guess")

    ok("T16 the resume brief SURFACES assumed inputs for reconfirmation",
       b["reconfirm"] == ["deal size band"], str(b.get("reconfirm")))
    ok("T17 and says why they are worth checking", "assumed rather than confirmed" in b["note"])
    ok("T18 confirmed inputs are NOT queued for reconfirmation",
       "category" not in b["reconfirm"])

    # --- artifact typing --------------------------------------------------------------------
    raises("T19 refuses an unknown artifact type, which usually means the caller is about "
           "to store the artifact itself",
           lambda: record_step(new_record("k"), "s", "a", "sqlite"), "not one of")
    raises("T20 refuses a step naming no skill",
           lambda: record_step(new_record("k"), "", "a", "docx"), "must name the skill")
    raises("T21 refuses a record with no request key", lambda: new_record("  "),
           "request key")

    ok("T22 a step with no artifact is fine (not every skill emits a file)",
       validate(record_step(new_record("k"), "process-navigator"))["steps"] == 1)

    print("=" * 90)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 90)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
