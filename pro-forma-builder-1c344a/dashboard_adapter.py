"""
dashboard_adapter.py
pro-forma-builder - emit the dashboard data object from the generator's ground truth.

WS F item F6.

THE DRIFT THIS CLOSES
---------------------
`pro_forma_model.xlsx` is produced in one call to `pro_forma_generator.py`, from
`compute_ground_truth()`. The optional `pro_forma_dashboard.jsx` was hand-assembled
from narrative figures. Two artifacts, two derivations, one set of numbers: the
workbook and the dashboard could disagree, and nothing would say so.

This is the only remaining hand-built artifact in what is otherwise the
best-wired skill in its group, which is exactly why it is worth closing. A skill
that computes everything correctly and then hand-types the summary into a second
deliverable has moved the error, not removed it.

WHAT THIS DOES AND DOES NOT TOUCH
---------------------------------
It reads `compute_ground_truth()` and returns a plain dict for the dashboard.

It does NOT touch the workbook path. `MASTER-REMAINING-WORK.md:316` preserves
`pro_forma_generator.py` / `numeric_kernel.py` / the `.xlsx` explicitly, and
nothing here writes to any of them.

It is also deliberately INDEPENDENT of the dashboard's information architecture.
D1 will rewrite this skill's `dashboard-canonical.md` to the converged 4-tab IA.
This adapter emits FIGURES, not layout, so that rewrite changes what the tabs look
like and not where their numbers come from. The adapter survives it.

    from dashboard_adapter import build_dashboard_data, assert_dashboard_matches_workbook
    data = build_dashboard_data(register)
    assert_dashboard_matches_workbook(data, ground_truth)

Stdlib only, plus the vendored generator beside it.
"""

from __future__ import annotations

import json
import sys
from typing import Any, Dict

try:
    from pro_forma_generator import (
        AssumptionsRegister, GroundTruth, compute_ground_truth,
        validate_assumptions,
    )
    GENERATOR_AVAILABLE = True
    _IMPORT_ERROR = None
except Exception as _exc:  # pragma: no cover
    GENERATOR_AVAILABLE = False
    _IMPORT_ERROR = _exc


class AdapterError(Exception):
    """Base class for refusals raised by this adapter."""


class GeneratorUnavailableError(AdapterError):
    """pro_forma_generator could not be imported.

    There is deliberately no fallback that assembles the dashboard from narrative
    figures. That fallback IS the drift this module exists to remove, so offering
    it would defeat the purpose.
    """


class DashboardWorkbookMismatch(AdapterError):
    """A dashboard figure does not equal its workbook counterpart.

    F6's verification criterion is "assert dashboard NPV equals workbook NPV
    cell". If that ever fails, the two artifacts have diverged and neither should
    be delivered until it is understood: a reader given both would have no way to
    tell which one is wrong.
    """


def _require_generator() -> None:
    if not GENERATOR_AVAILABLE:
        raise GeneratorUnavailableError(
            "pro_forma_generator.py could not be imported, so the dashboard cannot "
            "be built from ground truth. Hand-assembling it from narrative figures "
            "is exactly the drift this adapter removes and is not offered as a "
            f"fallback. Original import error: {_IMPORT_ERROR}"
        )


def build_dashboard_data(reg: "AssumptionsRegister",
                         gt: "GroundTruth" = None) -> Dict[str, Any]:
    """Return the dashboard data object, derived entirely from ground truth.

    Every figure here is read from `compute_ground_truth()`. Nothing is recomputed
    and nothing is passed in as prose, so a dashboard built from this object
    cannot disagree with the workbook built from the same object.
    """
    _require_generator()
    if gt is None:
        gt = compute_ground_truth(reg)

    scenarios = sorted(gt.scenario_npv.keys())

    return {
        "_provenance": {
            "derived_from": "pro_forma_generator.compute_ground_truth()",
            "hand_entered_figures": 0,
            "note": ("Every number in this object came from the same ground-truth "
                     "computation that produced pro_forma_model.xlsx. Do not edit "
                     "values here; change the register and re-run."),
        },
        "years": list(gt.years),
        "scenarios": scenarios,
        "npv_by_scenario": {s: gt.scenario_npv[s] for s in scenarios},
        "net_cashflow_by_scenario": {s: list(gt.scenario_net_cashflows[s])
                                     for s in scenarios},
        "base_gross_savings_by_year": list(gt.base_gross_savings_by_year),
        "base_net_cashflow": list(gt.base_net_cashflow),
        "waterfall": [{"label": lbl, "value": val} for lbl, val in gt.waterfall_steps],
        "baseline_value": gt.baseline_value,
        "net_future_state_value": gt.net_future_state_value,
        "annual_baseline_by_year": list(gt.annual_baseline_by_year),
    }


def assert_dashboard_matches_workbook(data: Dict[str, Any],
                                      gt: "GroundTruth",
                                      tolerance: float = 0.01) -> None:
    """F6's verification criterion, as an assertion rather than a review step.

    Checks every scenario NPV, not only the base case: a base-case match with a
    drifted alternative scenario is still two artifacts that disagree, and the
    alternative is what a reader uses to argue for a different decision.
    """
    for scenario, npv in gt.scenario_npv.items():
        shown = data.get("npv_by_scenario", {}).get(scenario)
        if shown is None:
            raise DashboardWorkbookMismatch(
                f"scenario {scenario!r} is in the workbook's ground truth but "
                "absent from the dashboard data object")
        if abs(shown - npv) > tolerance:
            raise DashboardWorkbookMismatch(
                f"scenario {scenario!r}: dashboard NPV {shown:,.2f} does not equal "
                f"workbook NPV {npv:,.2f} (tolerance {tolerance}). The two "
                "artifacts have diverged; deliver neither until this is resolved")

    if len(data.get("years", [])) != len(gt.years):
        raise DashboardWorkbookMismatch(
            f"dashboard shows {len(data.get('years', []))} years, workbook has "
            f"{len(gt.years)}")

    for scenario, flows in gt.scenario_net_cashflows.items():
        shown = data.get("net_cashflow_by_scenario", {}).get(scenario, [])
        if len(shown) != len(flows):
            raise DashboardWorkbookMismatch(
                f"scenario {scenario!r}: dashboard has {len(shown)} cashflow "
                f"periods, workbook has {len(flows)}")
        for i, (a, b) in enumerate(zip(shown, flows)):
            if abs(a - b) > tolerance:
                raise DashboardWorkbookMismatch(
                    f"scenario {scenario!r} period {i}: dashboard {a:,.2f} vs "
                    f"workbook {b:,.2f}")


def _selftest() -> int:
    results = []

    def check(label, ok, detail=""):
        results.append((label, bool(ok), detail))
        print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f"  ({detail})" if detail else ""))

    print("=" * 78)
    print("F6 DASHBOARD ADAPTER SELF-TEST")
    print("=" * 78)

    if not GENERATOR_AVAILABLE:
        print(f"[FAIL] pro_forma_generator import: {_IMPORT_ERROR}")
        return 1

    # Use the generator's own demo register so the adapter is tested against the
    # same input the workbook path is tested against.
    # Use the SAME register the generator's own self-test uses, lifted verbatim
    # from its __main__ block. Going through validate_assumptions() means this
    # cannot pass against a register shape the generator would itself reject, and
    # using its own sample means the adapter is tested against the same input the
    # workbook path is tested against rather than a shape invented here.
    sample_register = {
        "currency": "USD",
        "fx_rates": [{"from": "EUR", "to": "USD", "rate": 1.08, "as_of": "2026-06-01"}],
        "discount_rate": {"value": 0.08, "status": "CONFIRMED", "basis": "nominal"},
        "horizon_years": 5,
        "discounting_convention": "end_of_year",
        "escalation_rate": {"value": 0.03, "compounding": "annual", "source": "assumption"},
        "baseline": {"type": "current_state", "value": 2_000_000.0, "source": "user_provided"},
        "volumes": [{"year": n, "units": u} for n, u in
                    ((1, 10_000), (2, 10_500), (3, 11_000), (4, 11_500), (5, 12_000))],
        "scenarios": {
            "low": {"unit_price": 150.0, "volume_multiplier": 0.9},
            "base": {"unit_price": 140.0, "volume_multiplier": 1.0},
            "high": {"unit_price": 130.0, "volume_multiplier": 1.1},
        },
        "sensitivity_drivers": ["discount_rate", "escalation_rate"],
        "one_time_costs": {"year0_implementation": 250_000.0},
        "operating_costs": [{"year": n, "amount": a} for n, a in
                            ((1, 50_000.0), (2, 51_500.0), (3, 53_045.0),
                             (4, 54_636.0), (5, 56_275.0))],
    }
    reg = validate_assumptions(sample_register)

    if reg is not None:
        gt = compute_ground_truth(reg)
        data = build_dashboard_data(reg, gt)
        check("dashboard data builds from ground truth", bool(data["years"]))
        check("every scenario NPV present", set(data["npv_by_scenario"]) == set(gt.scenario_npv))
        try:
            assert_dashboard_matches_workbook(data, gt)
            check("dashboard NPV equals workbook NPV, every scenario", True)
        except DashboardWorkbookMismatch as e:
            check("dashboard NPV equals workbook NPV, every scenario", False, str(e))
        check("provenance records zero hand-entered figures",
              data["_provenance"]["hand_entered_figures"] == 0)

        # the assertion must actually FIRE when a figure is tampered with
        tampered = json.loads(json.dumps(data))
        first = sorted(tampered["npv_by_scenario"])[0]
        tampered["npv_by_scenario"][first] += 1000.0
        try:
            assert_dashboard_matches_workbook(tampered, gt)
            check("a drifted NPV is REJECTED", False, "no exception raised")
        except DashboardWorkbookMismatch:
            check("a drifted NPV is REJECTED", True)

        # a missing scenario must also fire
        missing = json.loads(json.dumps(data))
        missing["npv_by_scenario"].pop(first)
        try:
            assert_dashboard_matches_workbook(missing, gt)
            check("a scenario missing from the dashboard is REJECTED", False)
        except DashboardWorkbookMismatch:
            check("a scenario missing from the dashboard is REJECTED", True)

    print("=" * 78)
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"SUMMARY: {passed}/{len(results)} passed")
    print("=" * 78)
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(_selftest())
