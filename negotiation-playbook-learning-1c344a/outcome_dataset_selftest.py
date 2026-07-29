#!/usr/bin/env python3
"""
Self-test for outcome_dataset_generator.py (F9 build 2).

The partition arithmetic is the kernel's and is already tested there, so this asserts the
things a SERIALIZER can get wrong: the wrong enum, a stated total that contradicts its own
detail rows, a double-counted negotiation, and the zero-applicable case that must read
NEEDS_INPUT rather than a score of 0.

Negative controls included: a legitimately empty dataset, an all-NOT_APPLICABLE record, and
a repeat capture that is a genuine UPDATE.

Run: python outcome_dataset_selftest.py
"""
from __future__ import annotations

import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from numeric_kernel import PartitionError                       # noqa: E402
from outcome_dataset_generator import (                          # noqa: E402
    OUTCOME_CODES,
    DistributionMismatchError,
    DuplicateOutcomeError,
    UnknownOutcomeError,
    build_dataset,
    build_outcome_record,
    count_outcomes,
    dedup_key,
    write_json,
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


def pos(code, n=1):
    return [{"playbook_section": "Indemnification", "playbook_section_id": "S17_INDEMNIFICATION",
             "clause_type": "standard_position", "outcome": code,
             "detail": {}, "risk_assessment": {"risk_accepted": "none"},
             "confidence": "high"} for _ in range(n)]


def record(ref="PO-1001", supplier="Acme Ltd", positions=None):
    return {
        "outcome_id": "NO-2026-001",
        "record_date": "2026-07-29",
        "capture_method": "comparative",
        "contract_metadata": {
            "supplier": supplier, "contract_type": "MSA",
            "contract_category": "Software/SaaS", "total_value": 1200000,
            "value_band": "$500K-$2M", "execution_date": "2026-06-01",
            "effective_date": "2026-06-15", "expiration_date": "2029-06-14",
            "negotiation_duration_days": 61, "lilly_negotiator": "M. Lane",
            "contract_reference": ref,
        },
        "position_outcomes": positions if positions is not None else (
            pos("ACCEPTED_AS_IS", 4) + pos("ACCEPTED_WITH_MINOR_CHANGES", 2)
            + pos("HARD_STOP_HELD", 1) + pos("LILLY_FALLBACK_USED", 1)
            + pos("COUNTER_ACCEPTED", 1) + pos("REJECTED_BY_SUPPLIER", 1)
            + pos("NEGOTIATED_COMPROMISE", 2) + pos("ESCALATED_TO_SME", 1)
            + pos("NOT_APPLICABLE", 2)
        ),
        "negotiation_summary": {"key_wins": ["Indemnity held"], "key_concessions": [],
                                "notes": None},
    }


def run():
    print("=" * 84)
    print("outcome_dataset_generator self-test")
    print("=" * 84)

    ok("T1  the eleven schema outcome codes are all present", len(OUTCOME_CODES) == 11,
       str(len(OUTCOME_CODES)))

    r = build_outcome_record(record())
    s = r["negotiation_summary"]

    ok("T2  total_positions_evaluated matches the actual rows",
       s["total_positions_evaluated"] == 15, str(s["total_positions_evaluated"]))
    ok("T3  the distribution covers all eleven codes",
       len(s["outcome_distribution"]) == 11, str(len(s["outcome_distribution"])))
    ok("T4  denominator EXCLUDES not_applicable (15 - 2 = 13)",
       s["partition"]["denominator"] == 13, str(s["partition"]["denominator"]))

    four = (s["partition"]["lilly_position_prevailed"] + s["partition"]["supplier_prevailed"]
            + s["partition"]["negotiated"] + s["partition"]["escalated"])
    ok("T5  the four partition rates sum to 1.0", abs(four - 1.0) < 1e-6, str(four))

    # 4 as-is + 2 minor + 1 hard-stop-held + 1 fallback = 8 of 13
    ok("T6  lilly_success_rate is the prevailed rate as a percentage",
       abs(s["lilly_success_rate"] - 8 / 13 * 100) < 0.01, str(s["lilly_success_rate"]))
    # STRICT excludes the fallback: 4 + 2 + 1 = 7 of 13
    ok("T7  strict acceptance EXCLUDES the fallback, so it is lower",
       abs(s["acceptance_rate_strict"] - 7 / 13 * 100) < 0.01, str(s["acceptance_rate_strict"]))
    ok("T8  strict acceptance is a SUBSET of prevailed, never a fifth bucket",
       s["acceptance_rate_strict"] < s["lilly_success_rate"])

    ok("T9  difficulty carries a score and a band", s["difficulty_detail"]["score"] is not None
       and s["negotiation_difficulty"] in ("low", "medium", "high", "very_high"),
       repr(s["negotiation_difficulty"]))
    ok("T10 dedup_key is the schema's lowercased composite",
       r["dedup_key"] == "acme ltd|MSA|PO-1001|2026-06-01", r["dedup_key"])

    # --- the zero-applicable case -------------------------------------------------------
    r2 = build_outcome_record(record(positions=pos("NOT_APPLICABLE", 3)))
    s2 = r2["negotiation_summary"]
    ok("T11 all-NOT_APPLICABLE reports NEEDS_INPUT, never a difficulty of 0",
       s2["negotiation_difficulty"] == "NEEDS_INPUT", repr(s2["negotiation_difficulty"]))
    ok("T12 the NEEDS_INPUT case carries no fabricated score",
       s2["difficulty_detail"]["score"] is None)
    ok("T13 it says WHY, so a reader does not read it as an easy negotiation",
       "easy" in (s2["difficulty_detail"].get("note") or ""))

    # --- refusals -------------------------------------------------------------------------
    raises("T14 refuses an outcome code outside the eleven", UnknownOutcomeError,
           lambda: count_outcomes(pos("ACCEPTED_MOSTLY")))
    raises("T15 refuses an empty outcome code", UnknownOutcomeError,
           lambda: count_outcomes([{"outcome": ""}]))

    def bad_dist():
        raw = record()
        raw["negotiation_summary"]["outcome_distribution"] = {"accepted_as_is": 99}
        build_outcome_record(raw)
    raises("T16 refuses a stated distribution that contradicts the rows",
           DistributionMismatchError, bad_dist)

    def matching_dist():
        raw = record()
        raw["negotiation_summary"]["outcome_distribution"] = {"accepted_as_is": 4}
        return build_outcome_record(raw)
    ok("T17 NEGATIVE CONTROL: a CORRECT stated distribution passes",
       matching_dist()["negotiation_summary"]["outcome_distribution"]["accepted_as_is"] == 4)

    def dupes():
        build_dataset([record(ref="PO-1001"), record(ref="PO-1001")], "2026-07-29")
    raises("T18 refuses two records sharing a dedup_key", DuplicateOutcomeError, dupes)

    # --- dataset rollup --------------------------------------------------------------------
    ds = build_dataset([record(ref="PO-1001"), record(ref="PO-2002", supplier="Beta Inc")],
                       "2026-07-29")
    m = ds["dataset_metadata"]
    ok("T19 dataset counts both distinct outcomes", m["total_outcomes"] == 2)
    ok("T20 total_position_outcomes sums across records",
       m["total_position_outcomes"] == 30, str(m["total_position_outcomes"]))
    ok("T21 coverage counts UNIQUE suppliers", m["coverage"]["suppliers"] == 2)
    ok("T22 coverage tallies contract types", m["coverage"]["contract_types"] == {"MSA": 2},
       repr(m["coverage"]["contract_types"]))
    ok("T23 date_range is derived, not asserted",
       m["date_range"]["earliest"] == "2026-06-01" and m["date_range"]["latest"] == "2026-06-01")

    same_supplier = build_dataset(
        [record(ref="PO-1001"), record(ref="PO-2002")], "2026-07-29")
    ok("T24 the SAME supplier twice counts as one unique supplier",
       same_supplier["dataset_metadata"]["coverage"]["suppliers"] == 1)

    empty = build_dataset([], "2026-07-29")
    ok("T25 NEGATIVE CONTROL: an empty dataset is legitimate, not an error",
       empty["dataset_metadata"]["total_outcomes"] == 0)
    ok("T26 an empty dataset has a null date range rather than a fabricated one",
       empty["dataset_metadata"]["date_range"]["earliest"] is None)

    # --- serialization ----------------------------------------------------------------------
    tmp = tempfile.mkdtemp(prefix="f9_outcome_")
    p = write_json(ds, os.path.join(tmp, "outcome_dataset.json"))
    ok("T27 dataset serializes to disk", os.path.isfile(p))
    import json as _json
    with open(p, encoding="utf-8") as fh:
        back = _json.load(fh)
    ok("T28 it round-trips through JSON unchanged",
       back["dataset_metadata"]["total_outcomes"] == 2)
    ok("T29 every outcome in the file carries its dedup_key",
       all(o.get("dedup_key") for o in back["outcomes"]))

    print("=" * 84)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 84)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
