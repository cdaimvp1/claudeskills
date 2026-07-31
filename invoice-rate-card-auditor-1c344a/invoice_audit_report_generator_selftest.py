"""
invoice_audit_report_generator_selftest.py
F5's own verification: reuses F4's golden invoice set (invoice_audit_selftest.py)
and confirms the generator's two verification criteria hold:

  1. Row-count reconciliation: the ledger's line-level row count (distinct
     invoice lines carrying at least one finding, plus clean lines) equals
     the verified line count F4 already asserts (9 for the golden set), and
     equals `header.lines_audited`.
  2. DOCX-to-ledger traceability: every dollar figure rendered in the DOCX
     is a figure the ledger object itself carries; a fabricated figure not
     present in the ledger is caught, not silently accepted.

Also exercises the two structural failure modes build_full_ledger() itself
guards against (a missing line, and a double-counted line), using hand-built
AuditResult objects rather than the real engine, since the real engine
cannot produce either defect by construction; this is a direct unit test of
the guard itself, matching the same "the check does real work" discipline
should-cost/evaluation-engine's self-tests use for their own invariants.

Stdlib only, plus python-docx if present (DOCX checks are skipped, not
silently passed, when it is not).
"""

from __future__ import annotations

import json
import os
import sys
import tempfile

from invoice_audit_engine import AuditResult, Finding, ReconciliationError, audit
from invoice_audit_selftest import golden_case, CLEAN
from invoice_audit_report_generator import (
    build_full_ledger, write_ledger_json, DOCX_AVAILABLE,
    build_document, _assert_no_forbidden_content, _assert_docx_traceable_to_ledger,
    _iter_all_text, EM_DASH,
)

HEADER = {
    "supplier": "Acme Consulting Partners",
    "contract_reference": "MSA-2024-0091, Exhibit B (Rate Card) and Section 4.2 (Escalation)",
    "rate_card_reference": "Exhibit B Rate Card, effective 2026-01-01",
    "audit_period": "January through April 2026",
    "as_of_date": "2026-07-30",
}


def run_selftest() -> int:
    results = []

    def check(label, cond, detail=""):
        results.append((label, bool(cond), detail))
        print(f"[{'PASS' if cond else 'FAIL'}] {label}" + (f"  ({detail})" if detail else ""))

    print("=" * 78)
    print("F5 GENERATOR SELF-TEST (ledger + DOCX, golden invoice set)")
    print("=" * 78)

    inp = golden_case()
    res = audit(inp)
    ledger = build_full_ledger(inp, res, header=HEADER)

    h = ledger["header"]
    exception_lines = {f["line_id"] for f in ledger["findings"] if f["is_invoice_line"]}
    clear_lines = {c["line_id"] for c in ledger["clear_lines"]}

    check("row-count reconciliation: exception lines and clear lines are disjoint",
          not (exception_lines & clear_lines),
          f"overlap={exception_lines & clear_lines}")
    check("row-count reconciliation: exception lines + clear lines == lines_audited",
          len(exception_lines) + len(clear_lines) == h["lines_audited"] == 9,
          f"{len(exception_lines)} + {len(clear_lines)} vs {h['lines_audited']}")
    check("all three golden CLEAN lines appear in ledger clear_lines",
          clear_lines == set(CLEAN), f"got {clear_lines}")

    check("header totals match the engine's own rollup (never re-derived separately)",
          h["total_questioned_amount"] == res.rollup["total_questioned_amount"]
          and h["confirmed_credit_total"] == res.rollup["confirmed_potential_credit"]
          and h["pending_total"] == res.rollup["pending_supplier_response"])

    categories_present = {f["category"] for f in ledger["findings"]}
    check("category enum mapping covers rate, escalation, duplicate, unsupported, hours",
          {"RATE_MISMATCH", "ESCALATION_CAP_BREACH", "DUPLICATE_UNSUPPORTED",
           "HOURS_QUANTITY_DISCREPANCY"} <= categories_present,
          str(categories_present))

    # every finding carries the F4 fields F5 needs (never None where the check
    # family always computes them)
    rate_findings = [f for f in ledger["findings"] if f["category"] == "RATE_MISMATCH"]
    check("rate findings carry a non-null invoiced_rate and stated_total",
          all(f["invoiced_rate"] is not None and f["stated_total"] is not None
              for f in rate_findings))
    esc_findings = [f for f in ledger["findings"] if f["category"] == "ESCALATION_CAP_BREACH"]
    check("escalation findings carry a non-null escalation_cap_rate",
          all(f["escalation_cap_rate"] is not None for f in esc_findings))

    # ---- JSON round-trip: the ledger must actually be JSON-serializable ----
    tmp_dir = tempfile.gettempdir()
    ledger_path = os.path.join(tmp_dir, "invoice_audit_f5_selftest_ledger.json")
    write_ledger_json(ledger, ledger_path)
    with open(ledger_path, encoding="utf-8") as fh:
        reloaded = json.load(fh)
    check("ledger JSON round-trips (write then reload) without loss of finding count",
          len(reloaded["findings"]) == len(ledger["findings"]))

    # ---- structural failure modes: build_full_ledger's own guard ----------
    fake_inp = {"invoice_lines": [
        {"line_id": "X1", "invoice_number": "INV-X", "line_no": 1, "resource": "r",
         "role_billed": "Engineer", "rate_billed": 100.0, "qty_billed": 1,
         "stated_total": 100.0, "contract_year": 1},
        {"line_id": "X2", "invoice_number": "INV-X", "line_no": 2, "resource": "r",
         "role_billed": "Engineer", "rate_billed": 100.0, "qty_billed": 1,
         "stated_total": 100.0, "contract_year": 1},
    ]}
    missing_res = AuditResult(clear_lines=["X1"], findings=[],
                              reconciliation={"lines_in": 2, "lines_verified": 2},
                              rollup={"by_category": {}, "total_questioned_amount": 0,
                                      "confirmed_potential_credit": 0,
                                      "pending_supplier_response": 0})
    try:
        build_full_ledger(fake_inp, missing_res)
        check("a line missing from both findings and clear_lines is REJECTED", False)
    except ReconciliationError:
        check("a line missing from both findings and clear_lines is REJECTED", True)

    overlap_res = AuditResult(
        clear_lines=["X1", "X2"],
        findings=[Finding("X1", "Rate Mismatch", "RATE_VS_CONTRACT", "Medium", 5.0,
                          "CONFIRMED_OVERCHARGE", "test")],
        reconciliation={"lines_in": 2, "lines_verified": 2},
        rollup={"by_category": {}, "total_questioned_amount": 0,
                "confirmed_potential_credit": 0, "pending_supplier_response": 0})
    try:
        build_full_ledger(fake_inp, overlap_res)
        check("a line counted as BOTH clear and a finding is REJECTED", False)
    except ReconciliationError:
        check("a line counted as BOTH clear and a finding is REJECTED", True)

    # ---- DOCX: build, scan, and confirm traceability -----------------------
    if not DOCX_AVAILABLE:
        print("[SKIP] python-docx not available in this environment; "
              "DOCX checks skipped, not silently passed.")
    else:
        doc = build_document(ledger)

        text = "\n".join(_iter_all_text(doc))
        check("DOCX contains no em dash", EM_DASH not in text)
        check("DOCX title page carries the fixed title",
              "INVOICE & RATE-CARD AUDIT" in text)
        check("DOCX carries the scope line with the exact lines_audited count",
              f"{h['lines_audited']} lines audited" in text)
        check("every finding_id from the ledger appears somewhere in the DOCX",
              all(f["finding_id"] in text for f in ledger["findings"]))
        check("Appendix A and Appendix B headings both present",
              "Appendix A: Full Line-Level Ledger" in text
              and "Appendix B: Assumptions & Data Gaps" in text)
        check("all six exception-category section headings present",
              all(title in text for title, _ in [
                  ("03 Rate & Line-Math Findings", None), ("04 Role & Level Findings", None),
                  ("05 Escalation Cap Findings", None), ("06 Hours & Quantity Findings", None),
                  ("07 Duplicate & Unsupported Charges", None),
                  ("08 Milestone & PO/NTE Findings", None)]))

        # No exception raised means: passes cleanly (built entirely from the ledger).
        try:
            _assert_no_forbidden_content(doc)
            _assert_docx_traceable_to_ledger(doc, ledger)
            check("DOCX passes the em-dash and traceability scans", True)
        except ReconciliationError as e:
            check("DOCX passes the em-dash and traceability scans", False, str(e))

        # Negative case: the traceability check must actually catch a fabricated
        # figure, not just pass by construction. Inject a paragraph with a dollar
        # amount that is NOT anywhere in the ledger's own numeric pool.
        fabricated_amount = 999999.99
        pool_check = {round(v, 2) for v in [
            h["total_questioned_amount"], h["confirmed_credit_total"], h["pending_total"]]}
        while fabricated_amount in pool_check:
            fabricated_amount += 1.0
        para = doc.add_paragraph(f"Fabricated figure not in the ledger: ${fabricated_amount:,.2f}")
        try:
            _assert_docx_traceable_to_ledger(doc, ledger)
            check("traceability check REJECTS a fabricated figure not in the ledger", False)
        except ReconciliationError:
            check("traceability check REJECTS a fabricated figure not in the ledger", True)

        # Full pipeline, save to disk, and re-open to confirm the saved file
        # matches what was scanned in memory.
        docx_path = os.path.join(tmp_dir, "invoice_audit_f5_selftest_report.docx")
        clean_doc = build_document(ledger)
        _assert_no_forbidden_content(clean_doc)
        _assert_docx_traceable_to_ledger(clean_doc, ledger)
        clean_doc.save(docx_path)
        try:
            from docx import Document as _ReopenDocument
        except ImportError:
            raise RuntimeError(
                "python-docx became unavailable mid-test after DOCX_AVAILABLE "
                "was already confirmed True; environment changed under us."
            )
        reopened = _ReopenDocument(docx_path)
        reopened_text = "\n".join(_iter_all_text(reopened))
        check("saved-and-reopened DOCX still contains the total questioned amount",
              f"{h['total_questioned_amount']:,.2f}" in reopened_text)

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
