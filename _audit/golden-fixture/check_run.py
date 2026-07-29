"""
check_run.py
Golden-fixture checker for lilly-contract-review.

Takes a RUN FILE describing what a review run actually produced, diffs it against
`expected-findings.json`, and returns a verdict. Exit 0 pass, 1 fail.

    python check_run.py runs/2026-07-29-full-review.json
    python check_run.py --selftest

WHY A RUN FILE RATHER THAN PARSING THE DELIBERABLES
---------------------------------------------------
A review emits a .docx redline and a .docx summary. Parsing those to decide
whether a finding "is present" would mean writing a second, unreviewed judgment
layer, and a bug in it would look exactly like a bug in the skill. So the mapping
from real output to expected IDs is done by the reviewer, and this script does
only the bookkeeping and the verdict. The bookkeeping is where the mistakes
actually happen: miscounting Hard Stops, forgetting to check negative controls,
and calling a run green when eight rows are unaccounted for.

THE RUN FILE
------------
    {
      "run_id":   "2026-07-29-full-review",
      "mode":     "Full review",            // or "Redline only"
      "found":    ["HS-1", "A-1", "D-6"],   // expected IDs the run produced
      "extra":    [                          // findings NOT in the answer key
        {"topic": "...", "severity": "HIGH", "where": "WO-10:4.2"}
      ],
      "aggregates": {
        "hard_stop_count": 5,
        "protection_score": 12,
        "protection_score_band": "Critical",
        "rule12_calculation_table_present": true,
        "ae_finding_severity": "LOW",
        "ae_finding_coverage_column": "covered"
      }
    }

`extra` is not automatically a failure. A run may legitimately find something the
fixture's author did not plant, and that is worth knowing rather than punishing.
It is reported, and a NEGATIVE CONTROL appearing in it IS a failure.

Stdlib only.
"""

from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
EXPECTED_PATH = os.path.join(HERE, "expected-findings.json")


def load_expected(path=EXPECTED_PATH):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def expected_ids(exp):
    """Every planted defect ID, grouped, in answer-key order."""
    groups = {
        "hard_stops": [r["id"] for r in exp["hard_stops"]],
        "absence_detection": [exp["absence_detection"]["id"]],
        "arithmetic": [r["id"] for r in exp["arithmetic"]],
        "playbook_positions": [r["id"] for r in exp["playbook_positions"]],
        "data_protection": [r["id"] for r in exp["data_protection"]],
        "vendor_tactics": [r["id"] for r in exp["vendor_tactics"]],
        "compliance_evidence": [r["id"] for r in exp["compliance_evidence"]],
        "missing_documents": [r["id"] for r in exp["missing_incorporated_documents"]],
    }
    return groups


def check(run, exp):
    """Return (failures, warnings, lines) for a run against the expectation."""
    failures, warnings, lines = [], [], []
    groups = expected_ids(exp)
    found = set(run.get("found", []))
    agg = run.get("aggregates", {})
    ex_agg = exp["aggregate_assertions"]
    mode = run.get("mode", "unspecified")

    lines.append(f"run: {run.get('run_id', '(unnamed)')}   mode: {mode}")
    lines.append("")

    # --- planted defects, per group -------------------------------------
    lines.append("PLANTED DEFECTS")
    total_expected = total_found = 0
    for group, ids in groups.items():
        got = [i for i in ids if i in found]
        missed = [i for i in ids if i not in found]
        total_expected += len(ids)
        total_found += len(got)
        status = "OK  " if not missed else "MISS"
        lines.append(f"  [{status}] {group:22} {len(got)}/{len(ids)}"
                     + (f"   missing: {', '.join(missed)}" if missed else ""))
        for m in missed:
            failures.append(f"{group}: {m} not found")
    lines.append(f"  total {total_found}/{total_expected}")
    lines.append("")

    # --- negative controls ----------------------------------------------
    # A negative control is violated if its ID appears in `found`, or if any
    # `extra` finding names it.
    lines.append("NEGATIVE CONTROLS (a hit here is a FALSE POSITIVE)")
    extra = run.get("extra", []) or []
    extra_blob = json.dumps(extra).lower()
    nc_violations = []
    for nc in exp["negative_controls"]:
        nid = nc["id"]
        violated = nid in found
        # N-8 is special: it SHOULD produce a finding, just not a hard stop.
        if nid == "N-8":
            continue
        if not violated and nc["silent_on"].lower() in extra_blob:
            violated = True
        if violated:
            nc_violations.append(nid)
            failures.append(f"false positive on negative control {nid} "
                            f"({nc['silent_on']}, covered by {nc['covered_by']})")
    lines.append(f"  {len(exp['negative_controls']) - 1 - len(nc_violations)}"
                 f"/{len(exp['negative_controls']) - 1} clean"
                 + (f"   VIOLATED: {', '.join(nc_violations)}" if nc_violations else ""))
    lines.append("")

    # --- the absence-detection case, checked in detail -------------------
    ad = exp["absence_detection"]
    lines.append("ABSENCE DETECTION (the highest-signal row)")
    if ad["id"] not in found:
        failures.append("absence detection: no AE finding at all. "
                        + ad["failure_modes"]["no_finding"])
        lines.append("  [FAIL] no AE finding produced")
    else:
        sev = agg.get("ae_finding_severity")
        col = agg.get("ae_finding_coverage_column")
        if sev != ad["expected_severity"]:
            failures.append(f"absence detection: AE severity {sev!r}, expected "
                            f"{ad['expected_severity']!r}. "
                            + (ad["failure_modes"]["hard_stop"]
                               if str(sev).lower().startswith("hard")
                               else "wrong severity"))
        if col != ad["expected_coverage_column"]:
            failures.append(f"absence detection: AE coverage column {col!r}, expected "
                            f"{ad['expected_coverage_column']!r}. "
                            + ad["failure_modes"]["standalone_column"])
        ok = sev == ad["expected_severity"] and col == ad["expected_coverage_column"]
        lines.append(f"  [{'OK  ' if ok else 'FAIL'}] AE finding present, "
                     f"severity={sev}, column={col}")
    lines.append("")

    # --- aggregates -------------------------------------------------------
    lines.append("AGGREGATE ASSERTIONS")

    def agg_check(key, expected, comparator=lambda a, b: a == b, label=None):
        actual = agg.get(key, "(absent)")
        ok = actual != "(absent)" and comparator(actual, expected)
        lines.append(f"  [{'OK  ' if ok else 'FAIL'}] {label or key}: "
                     f"{actual}   expected {expected}")
        if not ok:
            failures.append(f"aggregate {key}: got {actual!r}, expected {expected!r}")

    agg_check("hard_stop_count", ex_agg["hard_stop_count"])
    if "HS-4" in found:
        failures.append("HS-4 raised as a Hard Stop. The governing document was not "
                        "read: MSA:23 covers adverse event reporting. This is the "
                        "Rule 9 defect and it inflates the Hard Stop count")
        lines.append("  [FAIL] HS-4 raised as a Hard Stop (must NOT be)")
    else:
        lines.append("  [OK  ] HS-4 correctly not raised as a Hard Stop")

    lo, hi = ex_agg["protection_score_range"]
    agg_check("protection_score_band", ex_agg["protection_score_band"])
    score = agg.get("protection_score")
    if isinstance(score, (int, float)):
        ok = lo <= score <= hi
        lines.append(f"  [{'OK  ' if ok else 'FAIL'}] protection_score: {score}   "
                     f"expected within [{lo}, {hi}]")
        if not ok:
            failures.append(f"protection_score {score} outside the Critical band "
                            f"[{lo}, {hi}]. Five Hard Stops deduct 75 before any "
                            "other finding counts, so a higher score means a "
                            "scoring defect")
    else:
        failures.append("protection_score missing from the run file")
        lines.append("  [FAIL] protection_score: (absent)")

    agg_check("rule12_calculation_table_present", True,
              label="Rule 12 calculation table present")

    arith_found = len([i for i in groups["arithmetic"] if i in found])
    minimum = ex_agg["arithmetic_findings_minimum"]
    ok = arith_found >= minimum
    lines.append(f"  [{'OK  ' if ok else 'FAIL'}] arithmetic findings: {arith_found}"
                 f"   expected at least {minimum}")
    if not ok:
        failures.append(f"arithmetic findings {arith_found} below the minimum {minimum}")

    if "A-2" not in found:
        failures.append("A-2 not found: the arithmetic error in LILLY's favour was "
                        "not flagged. arithmetic-verification.md:13 is "
                        "direction-agnostic; this is a direction-suppressing bug")
        lines.append("  [FAIL] A-2 (error favouring Lilly) not flagged")
    else:
        lines.append("  [OK  ] A-2 flagged: direction-agnostic arithmetic holds")
    lines.append("")

    # --- extras, reported not punished -----------------------------------
    if extra:
        lines.append(f"EXTRA FINDINGS NOT IN THE ANSWER KEY ({len(extra)})")
        lines.append("  Not automatically a failure. Review each: a genuine find is a "
                     "row to ADD to the fixture; a spurious one is a false positive.")
        for e in extra:
            lines.append(f"    - {e.get('topic', e)}")
        warnings.append(f"{len(extra)} finding(s) outside the answer key")
        lines.append("")

    return failures, warnings, lines


def report(run, exp):
    failures, warnings, lines = check(run, exp)
    print("=" * 78)
    print("GOLDEN FIXTURE CHECK")
    print("=" * 78)
    for l in lines:
        print(l)
    print("=" * 78)
    if failures:
        print(f"VERDICT: FAIL, {len(failures)} problem(s)")
        for f in failures:
            print(f"  - {f}")
    else:
        print("VERDICT: PASS, every planted check fired and no negative control tripped")
    if warnings:
        print()
        for w in warnings:
            print(f"  note: {w}")
    print("=" * 78)
    return 1 if failures else 0


# ---------------------------------------------------------------------------
# Self-test: the checker itself has to be trustworthy before a run is judged by
# it. A checker that passes everything is worse than no checker.
# ---------------------------------------------------------------------------

def _perfect_run(exp):
    ids = expected_ids(exp)
    found = [i for g in ids.values() for i in g]
    return {
        "run_id": "selftest-perfect", "mode": "Full review", "found": found,
        "extra": [],
        "aggregates": {
            "hard_stop_count": 5, "protection_score": 12,
            "protection_score_band": "Critical",
            "rule12_calculation_table_present": True,
            "ae_finding_severity": "LOW", "ae_finding_coverage_column": "covered",
        },
    }


def _selftest():
    exp = load_expected()
    results = []

    def case(label, mutate, should_fail):
        run = _perfect_run(exp)
        mutate(run)
        failures, _, _ = check(run, exp)
        failed = bool(failures)
        ok = failed == should_fail
        results.append((label, ok, failures[:1]))
        print(f"[{'PASS' if ok else 'FAIL'}] {label}")

    print("=" * 78)
    print("CHECKER SELF-TEST")
    print("=" * 78)

    case("a perfect run PASSES", lambda r: None, False)
    case("a missing Hard Stop FAILS",
         lambda r: r["found"].remove("HS-1"), True)
    case("silent absence detection FAILS (no AE finding)",
         lambda r: r["found"].remove("AE-ABSENT"), True)
    case("AE raised as a Hard Stop FAILS",
         lambda r: (r["found"].append("HS-4"),
                    r["aggregates"].update(hard_stop_count=6)), True)
    case("AE scored in the Standalone column FAILS",
         lambda r: r["aggregates"].update(ae_finding_coverage_column="standalone"), True)
    case("a false positive on a negative control FAILS",
         lambda r: r["found"].append("N-1"), True)
    case("a negative control named in `extra` FAILS",
         lambda r: r["extra"].append({"topic": "no intellectual property assignment"}), True)
    case("dropping the error in Lilly's favour (A-2) FAILS",
         lambda r: r["found"].remove("A-2"), True)
    case("a Moderate protection score FAILS",
         lambda r: r["aggregates"].update(protection_score=64,
                                          protection_score_band="Moderate"), True)
    case("a missing Rule 12 calculation table FAILS",
         lambda r: r["aggregates"].update(rule12_calculation_table_present=False), True)
    case("an unrelated extra finding does NOT fail",
         lambda r: r["extra"].append({"topic": "unusual notice address clause"}), False)

    print("=" * 78)
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"SELF-TEST: {passed}/{len(results)} passed")
    print("=" * 78)
    return 0 if passed == len(results) else 1


def main(argv):
    if "--selftest" in argv:
        return _selftest()
    if not argv:
        print(__doc__)
        print("ERROR: supply a run file, or --selftest", file=sys.stderr)
        return 2
    with open(argv[0], encoding="utf-8") as fh:
        run = json.load(fh)
    return report(run, load_expected())


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
