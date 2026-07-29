"""
invoice_audit_selftest.py
Golden invoice set with seeded defects, per F4's own verification criterion:

    "a golden invoice set with seeded defects (rate mismatch, escalation over cap,
     duplicate, unsupported hours) must produce exactly the seeded findings and no
     others."

"AND NO OTHERS" is the half that matters. An engine that flags everything passes
a test that only checks the seeded defects were caught, so the clean lines below
are as load-bearing as the dirty ones.

Unlike the contract-review golden fixture, the author of this fixture is allowed
to be the author of the engine: the checks here are deterministic arithmetic and
matching, so knowing where the defects are cannot make the code find them. No
contamination argument applies.

Stdlib only.
"""

from __future__ import annotations

import sys

from invoice_audit_engine import (
    audit, build_ledger, BlockingAmbiguityError, ReconciliationError,
    CATEGORY_RATE, CATEGORY_ESCALATION, CATEGORY_DUPLICATE, CATEGORY_UNSUPPORTED,
    CATEGORY_HOURS, CATEGORY_ROLE, CATEGORY_MILESTONE,
)

RATE_CARD = [
    {"role": "Senior Engineer", "base_rate": 200.0, "unit": "hour"},
    {"role": "Engineer", "base_rate": 150.0, "unit": "hour"},
    {"role": "Analyst", "base_rate": 100.0, "unit": "hour"},
]

# 3% compounding. Year 2 cap for Senior Engineer = 200 * 1.03 = 206.00
ESCALATION = {"rate": 0.03, "compounding": True}


def _base_input():
    return {
        "rate_card": RATE_CARD,
        "escalation": ESCALATION,
        "po": {"po_number": "PO-1", "nte": 1_000_000,
               "lines": [{"line_ref": "P1", "description": "services"}]},
        "timesheets": [
            {"resource": "alice", "period": "2026-01", "approved_hours": 100,
             "role_per_roster": "Senior Engineer"},
            {"resource": "bob", "period": "2026-01", "approved_hours": 80,
             "role_per_roster": "Engineer"},
            {"resource": "carol", "period": "2026-02", "approved_hours": 60,
             "role_per_roster": "Analyst"},
            {"resource": "dave", "period": "2026-02", "approved_hours": 40,
             "role_per_roster": "Engineer"},
            {"resource": "erin", "period": "2026-03", "approved_hours": 50,
             "role_per_roster": "Senior Engineer"},
        ],
        "invoice_lines": [],
        "milestones": [],
    }


def _line(lid, inv, resource, role, period, rate, qty, total,
          year=1, po_ref="P1", date="2026-02-01"):
    return {"line_id": lid, "invoice_number": inv, "invoice_date": date,
            "resource": resource, "role_billed": role, "period": period,
            "rate_billed": rate, "qty_billed": qty, "stated_total": total,
            "contract_year": year, "po_line_ref": po_ref}


def golden_case():
    """Six seeded defects plus three deliberately CLEAN lines."""
    inp = _base_input()
    inp["invoice_lines"] = [
        # ---- CLEAN: correct rate, correct math, hours match --------------
        _line("L-01", "INV-1", "alice", "Senior Engineer", "2026-01", 200.0, 100, 20000.0),
        # ---- CLEAN: year 2 billed exactly at the escalated cap 206.00 ----
        _line("L-02", "INV-1", "erin", "Senior Engineer", "2026-03", 206.0, 50, 10300.0,
              year=2),
        # ---- CLEAN: lower-rate role, math fine ---------------------------
        _line("L-03", "INV-1", "carol", "Analyst", "2026-02", 100.0, 60, 6000.0),

        # ---- SEED 1: rate above contract (Engineer at 165 vs 150) --------
        _line("L-04", "INV-1", "bob", "Engineer", "2026-01", 165.0, 80, 13200.0),

        # ---- SEED 2: line-item math error (150 x 40 = 6000, stated 6500) -
        _line("L-05", "INV-1", "dave", "Engineer", "2026-02", 150.0, 40, 6500.0),

        # ---- SEED 3: escalation over cap, year 2 at 220 vs cap 206 -------
        #      14 over 206 is 6.8%, above the 5% trigger, so Critical.
        _line("L-06", "INV-2", "erin", "Senior Engineer", "2026-03", 220.0, 50, 11000.0,
              year=2, date="2026-03-01"),

        # ---- SEED 4: duplicate of L-01 on a DIFFERENT invoice ------------
        _line("L-07", "INV-2", "alice", "Senior Engineer", "2026-01", 200.0, 100, 20000.0,
              date="2026-03-01"),

        # ---- SEED 5: unsupported, no timesheet and no PO match -----------
        _line("L-08", "INV-2", "frank", "Engineer", "2026-04", 150.0, 90, 13500.0,
              po_ref="MISSING", date="2026-03-01"),

        # ---- SEED 6: hours discrepancy, 120 billed vs 100 approved -------
        #      20/120 is 16.7%, above the 10% trigger, so High.
        _line("L-09", "INV-3", "alice", "Senior Engineer", "2026-01", 200.0, 120, 24000.0,
              date="2026-04-01"),
    ]
    return inp


EXPECTED = {
    "L-04": [(CATEGORY_RATE, "RATE_VS_CONTRACT", 1200.0)],       # (165-150)*80
    "L-05": [(CATEGORY_RATE, "LINE_MATH_ERROR", 500.0)],          # 6500-6000
    "L-06": [(CATEGORY_RATE, "RATE_VS_CONTRACT", 700.0),          # (220-206)*50
             (CATEGORY_ESCALATION, "ESCALATION_CAP_BREACH", 700.0)],
    "L-07": [(CATEGORY_DUPLICATE, "DUPLICATE", 20000.0)],
    "L-08": [(CATEGORY_UNSUPPORTED, "UNSUPPORTED", 13500.0)],
    "L-09": [(CATEGORY_HOURS, "HOURS_DISCREPANCY", 4000.0)],      # 20 * 200
}
CLEAN = ["L-01", "L-02", "L-03"]


def run_selftest() -> int:
    results = []

    def check(label, cond, detail=""):
        results.append((label, bool(cond), detail))
        print(f"[{'PASS' if cond else 'FAIL'}] {label}" + (f"  ({detail})" if detail else ""))

    print("=" * 78)
    print("INVOICE AUDIT ENGINE, GOLDEN SET WITH SEEDED DEFECTS")
    print("=" * 78)

    res = audit(golden_case())
    got = {}
    for f in res.findings:
        got.setdefault(f.line_id, []).append((f.category, f.check_type,
                                              round(f.questioned_amount, 2)))

    # every seeded defect found, with the exact questioned amount
    for lid, exp in EXPECTED.items():
        actual = sorted(got.get(lid, []))
        check(f"{lid}: seeded defect(s) found with exact amounts",
              actual == sorted(exp), f"expected {sorted(exp)}, got {actual}")

    # AND NO OTHERS
    unexpected = {lid: v for lid, v in got.items() if lid not in EXPECTED}
    check("no findings on any line that was not seeded", not unexpected,
          f"unexpected: {unexpected}" if unexpected else "")
    for lid in CLEAN:
        check(f"{lid}: clean line produced NO finding", lid not in got,
              str(got.get(lid, "")))
    check("all three clean lines are in clear_lines",
          all(l in res.clear_lines for l in CLEAN))

    # severity escalation triggers
    sev = {(f.line_id, f.check_type): f.severity for f in res.findings}
    check("L-06 escalation breach is Critical (6.8% over cap, above the 5% trigger)",
          sev.get(("L-06", "ESCALATION_CAP_BREACH")) == "Critical",
          str(sev.get(("L-06", "ESCALATION_CAP_BREACH"))))
    check("L-08 unsupported is Critical (13,500 is above the 10,000 trigger)",
          sev.get(("L-08", "UNSUPPORTED")) == "Critical",
          str(sev.get(("L-08", "UNSUPPORTED"))))
    check("L-09 hours discrepancy is High (16.7% is above the 10% trigger)",
          sev.get(("L-09", "HOURS_DISCREPANCY")) == "High",
          str(sev.get(("L-09", "HOURS_DISCREPANCY"))))
    check("L-07 duplicate is Critical",
          sev.get(("L-07", "DUPLICATE")) == "Critical")

    # duplicate direction: the LATER occurrence is flagged, not the first
    check("duplicate flags the later invoice (L-07), not the original (L-01)",
          "L-07" in got and "L-01" not in got)

    # reconciliation
    check("lines in equals lines verified",
          res.reconciliation["lines_in"] == res.reconciliation["lines_verified"] == 9,
          str(res.reconciliation))
    check("confirmed plus pending equals the total questioned amount",
          abs(res.rollup["confirmed_potential_credit"]
              + res.rollup["pending_supplier_response"]
              - res.rollup["total_questioned_amount"]) < 0.01,
          f"{res.rollup['confirmed_potential_credit']} + "
          f"{res.rollup['pending_supplier_response']} = "
          f"{res.rollup['total_questioned_amount']}")
    check("category rollup sums to the total",
          abs(sum(res.rollup["by_category"].values())
              - res.rollup["total_questioned_amount"]) < 0.01)

    ledger = build_ledger(res)
    check("F5: ledger row count does not exceed verified lines",
          len({f["line_id"] for f in ledger["findings"]} | set(ledger["clear_lines"]))
          <= res.reconciliation["lines_verified"])

    print()
    print("-" * 78)
    print("NEGATIVE AND REFUSAL CASES")
    print("-" * 78)

    # immateriality: a $5 variance on a $20,000 line is CLEAR, not a finding
    inp = _base_input()
    inp["invoice_lines"] = [
        _line("M-01", "INV-9", "alice", "Senior Engineer", "2026-01", 200.0, 100, 20005.0)]
    r2 = audit(inp)
    check("a $5 variance on a $20,000 line is CLEAR, not a padded exception",
          not r2.findings and "M-01" in r2.clear_lines,
          f"findings={[(f.check_type, f.questioned_amount) for f in r2.findings]}")

    # blocking ambiguity
    inp = _base_input()
    inp["escalation"] = {"rate": 0.03, "compounding": None}
    inp["invoice_lines"] = [
        _line("B-01", "INV-9", "alice", "Senior Engineer", "2026-01", 200.0, 100, 20000.0)]
    try:
        audit(inp)
        check("unstated compounding reading REFUSES rather than guessing", False)
    except BlockingAmbiguityError:
        check("unstated compounding reading REFUSES rather than guessing", True)

    # no timesheets at all is NEEDS_INPUT, never "unsupported"
    inp = _base_input()
    inp["timesheets"] = None
    inp["invoice_lines"] = [
        _line("N-01", "INV-9", "zoe", "Engineer", "2026-05", 150.0, 10, 1500.0)]
    r3 = audit(inp)
    check("no timesheet population supplied is NEEDS_INPUT, not an unsupported charge",
          not any(f.category == CATEGORY_UNSUPPORTED for f in r3.findings)
          and any(x["line_id"] == "N-01" for x in r3.needs_input))

    # unknown role goes to the model, not to a guess
    inp = _base_input()
    inp["invoice_lines"] = [
        _line("U-01", "INV-9", "zoe", "Principal Architect", "2026-01", 400.0, 10, 4000.0)]
    r4 = audit(inp)
    check("a role absent from the rate card is routed to the model, not guessed",
          any(x["line_id"] == "U-01" for x in r4.needs_model_review))

    # favourable variance is not a questioned amount
    inp = _base_input()
    inp["invoice_lines"] = [
        _line("F-01", "INV-9", "alice", "Analyst", "2026-01", 100.0, 100, 10000.0)]
    r5 = audit(inp)
    check("roster level higher than billed is a favourable variance, not questioned",
          not any(f.category == CATEGORY_ROLE for f in r5.findings)
          and any("favourable" in x["reason"] for x in r5.needs_model_review))

    # PO NTE breach fires even when every line is individually correct
    inp = _base_input()
    inp["po"] = {"po_number": "PO-2", "nte": 15000,
                 "lines": [{"line_ref": "P1", "description": "services"}],
                 "previously_invoiced": 0}
    inp["invoice_lines"] = [
        _line("Q-01", "INV-9", "alice", "Senior Engineer", "2026-01", 200.0, 100, 20000.0)]
    r6 = audit(inp)
    check("PO NTE breach fires even when no single line is wrong",
          any(f.check_type == "PO_NTE_BREACH" for f in r6.findings),
          f"total questioned {r6.rollup['total_questioned_amount']}")

    print()
    print("=" * 78)
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"SUMMARY: {passed}/{len(results)} passed, {len(results) - passed} failed")
    if passed != len(results):
        for label, ok, detail in results:
            if not ok:
                print(f"  FAILED: {label}  {detail}")
    print("=" * 78)
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(run_selftest())
