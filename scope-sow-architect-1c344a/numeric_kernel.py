# Vendored verbatim from lilly-procurement-kernels-1c344a/numeric_kernel.py on 2026-07-22; source of truth is lilly-procurement-kernels-1c344a/numeric_kernel.py. Do not hand-edit here; edit the source and re-vendor.
# scope-sow-architect-1c344a calls: to_hourly() (rate-card normalization across hour/day/week/month/year rate bases), verify_line_math() (rate x hours = line total on the rate card, and milestone-payment-sum-equals-total-contract-value reconciliation), escalate() (multi-year staffing rate escalation clauses), and weighted_score() (the Scope Definition Score composite across the 10 weighted dimensions in references/scope-quality-scoring.md). npv, percentile_gate, convert_currency, and quadrature_rollup are vendored for completeness (this is a verbatim copy of the shared kernel) but not called by this skill's own workflow.
"""
numeric_kernel.py
Lilly Procurement Skills - Shared Numeric Kernel

Stdlib-only Python module implementing the arithmetic that several suite skills
independently describe in prose (market-rate-benchmarking, should-cost-builder,
pro-forma-builder, evaluation-engine, lilly-contract-review). Every formula below
is copied from those SKILL.md / reference files, not re-derived from first
principles. Where a source file gives a formula but no worked numeric example,
that is disclosed in the docstring and in the self-test output rather than
inventing a "verified" number.

Three faces:
  NORMALIZATION - to_hourly, convert_currency, percentile_gate
  VERIFICATION  - verify_line_math, escalate, weighted_score
  COMPUTATION   - npv, quadrature_rollup

Design pattern (matches the suite's own "refuse, don't guess" rule):
  - Unknown units, unknown currencies, and weight sets that don't foot to 1.0
    raise a typed exception rather than silently defaulting or estimating.
  - Dataclasses carry provenance-shaped results (e.g. QuadratureResult keeps the
    naive worst-case envelope alongside the quadrature range, because
    should-cost-builder's own text requires the naive bound be shown only as a
    footnote, never the headline).

See MAINTENANCE.md in this directory for update procedure and known limitations.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Dict, List, Sequence


# ===========================================================================
# Exceptions
# ===========================================================================

class KernelError(Exception):
    """Base class for every refusal raised by this kernel.

    Per the suite-wide anti-fabrication rule, this module refuses rather than
    guesses when it hits an unknown unit, an unknown currency, a weight set
    that does not foot to 1.0, or otherwise malformed input.
    """


class UnknownUnitError(KernelError):
    """Raised by to_hourly() for a unit outside hour/day/week/month/year."""


class UnknownCurrencyError(KernelError):
    """Raised by convert_currency() for a currency code missing from fx_table."""


class WeightSumError(KernelError):
    """Raised by weighted_score() when weights do not sum to 1.0 within tolerance.

    This is the exact bug class documented in market-rate-benchmarking's v2.1
    changelog ("corrected composite quality weights to sum to 1.00 (was 1.05)")
    and guarded again in evaluation-engine's Score Validation Checks table
    ("Effective weight sum: All Effective_Weight_Frac values must sum to 1.0
    +/- 0.001 across every criterion").
    """


class InvalidInputError(KernelError):
    """Raised for malformed numeric input: empty sequences, mismatched lengths,
    non-positive totals where a ratio is required, out-of-range years, etc."""


# ===========================================================================
# NORMALIZATION face
# ===========================================================================

# Source: market-rate-benchmarking-1c344a/SKILL.md, inlined
# "external-research-guide.md" -> "## Normalization Rules" table:
#   Annual salary  -> Hourly rate : / 2,080
#   Daily rate     -> Hourly rate : / 8
#   Monthly fee    -> Annual      : x 12          (not a direct-to-hourly path)
#   Per-seat/month -> Per-seat/annual : x 12       (not a direct-to-hourly path)
#   Per-FTE/month  -> Hourly      : / 173
#
# "week" has NO stated divisor anywhere in the source skills. It is inferred
# here as 2,080 / 52 = 40 hours/week (the same 40-hour-week convention already
# implicit in the quoted 2,080 annual-hours figure), not copied verbatim from
# any skill text. This is flagged as a judgment call in MAINTENANCE.md and in
# the calling report; do not treat the "week" divisor as source-verified.
_HOURLY_DIVISORS = {
    "hour": 1.0,
    "day": 8.0,      # market-rate-benchmarking: "Daily rate | Hourly rate | / 8"
    "week": 40.0,    # INFERRED, not verbatim in any skill file (see above)
    "month": 173.0,  # market-rate-benchmarking: "Per-FTE/month | Hourly | / 173"
    "year": 2080.0,  # market-rate-benchmarking: "Annual salary | Hourly rate | / 2,080"
}


def to_hourly(value: float, unit: str) -> float:
    """Convert a rate stated in `unit` (hour/day/week/month/year) to an hourly rate.

    Divisors are copied from market-rate-benchmarking's Normalization Rules
    table (see comment above `_HOURLY_DIVISORS`). Refuses unknown units rather
    than guessing a conversion factor.
    """
    key = unit.strip().lower()
    if key not in _HOURLY_DIVISORS:
        raise UnknownUnitError(
            f"Unknown unit '{unit}'. to_hourly only knows "
            f"{sorted(_HOURLY_DIVISORS)} per market-rate-benchmarking's "
            "Normalization Rules table; refusing rather than guessing a "
            "conversion factor."
        )
    return value / _HOURLY_DIVISORS[key]


def convert_currency(value: float, currency: str, fx_table: Dict[str, float]) -> float:
    """Convert `value` from `currency` to the reporting currency (USD) using fx_table.

    fx_table maps currency code -> multiplier to reach USD, in the same shape
    as pro-forma-builder's Assumptions register JSON example:
        {"from": "EUR", "to": "USD", "rate": 1.08, "as_of": "2026-06-01"}
    i.e. convert_currency(value, "EUR", {"EUR": 1.08}) applies rate 1.08.
    USD passes through at 1.0 unless the caller overrides it in fx_table.
    Refuses unknown currency codes rather than assuming parity (market-rate-
    benchmarking: "Note rate and date... never silently mix currencies.").
    """
    code = currency.strip().upper()
    if code in fx_table:
        return value * fx_table[code]
    if code == "USD":
        return value
    raise UnknownCurrencyError(
        f"Unknown currency code '{currency}': no FX rate present in fx_table "
        "and it is not USD. Refusing to invent an exchange rate."
    )


def percentile_gate(n_points: int, min_points: int = 5) -> bool:
    """Return True if a percentile band (P10/P25/P50/P75/P90) may be reported.

    Source: market-rate-benchmarking-1c344a/SKILL.md, Rule 2 ("PERCENTILE GATE,
    single threshold"):
      "N >= 5 usable data points for a rate line: compute and report the
       percentile band ... N = 2 to 4: report the RANGE and the MEDIAN only.
       Do NOT report percentiles ... N = 1: report the single observed point
       as a reference only ... This single N >= 5 rule governs the benchmark
       card template ... There is no separate '3 data points = percentiles'
       path; any older text implying percentiles at N=3 is superseded by
       this rule."
    This is the corrected v2.1 rule (the v2.0 text had a 5-vs-3
    self-contradiction; that buggy N=3 path no longer exists here).
    """
    if n_points < 0:
        raise InvalidInputError("n_points cannot be negative.")
    return n_points >= min_points


# ===========================================================================
# VERIFICATION face
# ===========================================================================

def verify_line_math(rate: float, hours: float, stated_total: float,
                      tolerance: float = 0.01) -> bool:
    """Return True if rate * hours equals stated_total within tolerance.

    Source: lilly-contract-review-1c344a/references/arithmetic-verification.md,
    section 3E-1 #1: "Verify line-item math: Rate x hours = line total for
    every row in every pricing table."

    The document does not state a numeric tolerance value; the default here
    (0.01, i.e. cent-level) reflects 3E-2 #3's instruction to "Round to the
    same precision as the document - if rates are stated to the cent, verify
    to the cent," but that default itself is an inference, not a quoted
    number. Callers with a different stated precision should pass their own
    tolerance.
    """
    expected = rate * hours
    return abs(expected - stated_total) <= tolerance


def escalate(base: float, rate: float, year: int, compounding: bool) -> float:
    """Apply an escalation formula to `base` for a 1-indexed `year`.

    Source: lilly-contract-review-1c344a/references/arithmetic-verification.md,
    section 3E-2 #2:
      "Compounding (Year N = Year N-1 x 1.03) - each year's increase builds
       on the prior year's increased rate"
      "Simple (Year N = Base Year x (1 + 0.03 x N)) - each year's increase is
       calculated from the original base rate"

    JUDGMENT CALL (flagged): the source text does not define what "Year 0"
    is, i.e. whether "Year 1" already carries one escalation or is still the
    unescalated base. This module reads the recursive compounding formula
    literally, unrolled from an unescalated base: Year_N = Base * (1+rate)^N
    for compounding, and Year_N = Base * (1 + rate*N) for simple, both with
    N = the 1-indexed `year` argument >= 1. See MAINTENANCE.md and the
    accompanying report for the alternative reading (pro-forma-builder's own
    TCO section uses base*(1+rate)^(n-1) with "Year 1 at the base rate" -
    a different convention for a different purpose). Only the rate value 0.03
    / multiplier 1.03 and the two formula shapes are copied verbatim from
    arithmetic-verification.md; the choice of what year 1 means is this
    module's own resolution of that ambiguity.
    """
    if year < 1:
        raise InvalidInputError(
            "year must be >= 1 (1-indexed, per arithmetic-verification.md 3E-2)."
        )
    if compounding:
        return base * (1 + rate) ** year
    return base * (1 + rate * year)


def weighted_score(scores: Dict[str, float], weights: Dict[str, float],
                    tolerance: float = 0.001) -> float:
    """Return sum(scores[k] * weights[k]); refuses if weights don't sum to 1.0.

    Source (the weight-sum requirement): market-rate-benchmarking-1c344a/
    SKILL.md, "Composite Contract Quality Score" section: "Base weights sum
    to 1.00. EVERY category profile below must also sum to exactly 1.00;
    verify the sum before scoring (if a profile does not sum to 1.00, do not
    use it)." Its v2.1 changelog: "corrected composite quality weights to sum
    to 1.00 (was 1.05)" - this is the exact bug class this function guards
    against.

    Source (the default tolerance): evaluation-engine-1c344a/SKILL.md,
    "Score Validation Checks" table: "Effective weight sum | All
    Effective_Weight_Frac values must sum to 1.0 +/- 0.001 across every
    criterion."
    """
    if scores.keys() != weights.keys():
        raise InvalidInputError(
            "scores and weights must have exactly the same set of keys."
        )
    total_weight = sum(weights.values())
    if abs(total_weight - 1.0) > tolerance:
        raise WeightSumError(
            f"Weights sum to {total_weight:.4f}, not 1.0 (tolerance "
            f"{tolerance}). This is the bug class fixed in market-rate-"
            "benchmarking v2.1 (weights summed to 1.05) and guarded in "
            "evaluation-engine's Score Validation Checks (sum to 1.0 +/- "
            "0.001). Refusing to score against un-footed weights."
        )
    return sum(scores[k] * weights[k] for k in scores)


# ===========================================================================
# COMPUTATION face
# ===========================================================================

def npv(cashflows: Sequence[float], discount_rate: float) -> float:
    """Net present value with end-of-year Year-1 discounting.

    Source: pro-forma-builder-1c344a/SKILL.md, "Financial Methodology" block:
      "Year 0 is 'now' (the decision date) and is NOT discounted."
      "Default discounting is end-of-year. A cash flow assigned to Year n is
       treated as occurring at the END of year n and is discounted by n full
       periods. So Year 1 is discounted ONE full period (divide by
       (1+r)^1) ... Year 1 is NEVER left at t=0 (undiscounted)."
      "NPV = Year-0 net cash flow + the sum over n=1..N of [ net cash flow in
       year n / (1+r)^n ]"

    cashflows[0] is the Year-0 (undiscounted) flow; cashflows[1:] are Year 1..N.
    No worked numeric NPV example with concrete cash-flow figures exists in
    pro-forma-builder-1c344a/SKILL.md (only the formula and convention are
    given), so there is no source-verified golden number for this function;
    see the self-test and the accompanying report for the disclosed
    consistency check used instead.
    """
    if not cashflows:
        raise InvalidInputError("cashflows must contain at least a Year-0 value.")
    total = cashflows[0]
    for n, cf in enumerate(cashflows[1:], start=1):
        total += cf / (1 + discount_rate) ** n
    return total


@dataclass(frozen=True)
class QuadratureResult:
    total_base: float
    total_low: float
    total_high: float
    widened_components: List[int]  # indices reverted from quadrature to linear
    naive_low: float               # footnote-only worst-case envelope
    naive_high: float              # footnote-only worst-case envelope

    def reconciliation_line(self) -> str:
        n_total = None  # filled by caller context if desired
        return (
            f"Reconciles: base {self.total_base:g}; "
            f"range [{self.total_low:g}, {self.total_high:g}] via quadrature "
            f"({'no' if not self.widened_components else len(self.widened_components)} "
            "widened driver(s)); naive worst-case envelope "
            f"[{self.naive_low:g}, {self.naive_high:g}] (footnote only, never headline)."
        )


def quadrature_rollup(component_bases: Sequence[float],
                       component_spreads_low: Sequence[float],
                       component_spreads_high: Sequence[float],
                       confidence_flags: Sequence[str]) -> QuadratureResult:
    """Roll up independent cost-driver spreads via quadrature, then widen for
    thin LOW-confidence drivers per should-cost-builder's Aggregation Method.

    Source: should-cost-builder-1c344a/SKILL.md, "Aggregation Method" section:
      Step 1: "Total_base = sum of all component base_i."
      Step 2: "spread_low_i = base_i - low_i and spread_high_i = high_i - base_i."
      Step 3 (independent drivers): "combine spreads in quadrature
        (root-sum-of-squares): Total_low = Total_base - sqrt(sum of
        (spread_low_i)^2); Total_high = Total_base + sqrt(sum of
        (spread_high_i)^2)."
      Step 4 (confidence-weighted widening): "if any single LOW-confidence
        driver represents more than 15% of Total_base, widen the total
        low/high by that driver's full linear spread (revert it from
        quadrature to linear)."

    This function implements the independent-drivers path plus the LOW>15%
    widening rule. It does NOT implement the separate "correlated drivers"
    grouping rule (group-then-quadrature-across-groups) or the margin/SG&A
    linear-on-top step; those are documented in should-cost-builder but are
    out of scope for this function's signature (component_bases/spreads/
    confidence_flags only, no grouping parameter).

    Golden test: should-cost-builder's own worked illustration states
    verbatim: "a 3-component stack with bases 60 + 30 + 10 = Total_base 100.
    Spreads (low/high): materials +/-9, labor +/-6, logistics +/-2 ...
    Quadrature (independent): sqrt(9^2 + 6^2 + 2^2) = sqrt(81+36+4) =
    sqrt(121) = 11, so the range is [89, 111]." Its Pre-Delivery Self-Test
    example line also confirms logistics (10% of base) is LOW confidence but
    does NOT trigger widening (10% < the 15% threshold): "Reconciles: base
    100 = 60+30+10; range [89, 111] via quadrature (3 independent drivers);
    model confidence MEDIUM (1 LOW driver = logistics)."
    """
    n = len(component_bases)
    if not (len(component_spreads_low) == len(component_spreads_high)
            == len(confidence_flags) == n) or n == 0:
        raise InvalidInputError(
            "component_bases, component_spreads_low, component_spreads_high, "
            "and confidence_flags must all be the same non-zero length."
        )
    valid_flags = {"HIGH", "MEDIUM", "LOW"}
    for f in confidence_flags:
        if f.upper() not in valid_flags:
            raise InvalidInputError(
                f"Unknown confidence flag '{f}'; expected one of HIGH/MEDIUM/LOW "
                "per should-cost-builder's confidence framework. Refusing to guess."
            )

    total_base = sum(component_bases)
    if total_base == 0:
        raise InvalidInputError(
            "Total_base is 0; cannot evaluate the 15%-of-base widening threshold."
        )

    widened: List[int] = []
    quad_low_sq = 0.0
    quad_high_sq = 0.0
    linear_low_add = 0.0
    linear_high_add = 0.0

    for i in range(n):
        is_low_conf = confidence_flags[i].upper() == "LOW"
        share = component_bases[i] / total_base
        if is_low_conf and share > 0.15:
            widened.append(i)
            linear_low_add += component_spreads_low[i]
            linear_high_add += component_spreads_high[i]
        else:
            quad_low_sq += component_spreads_low[i] ** 2
            quad_high_sq += component_spreads_high[i] ** 2

    total_low = total_base - math.sqrt(quad_low_sq) - linear_low_add
    total_high = total_base + math.sqrt(quad_high_sq) + linear_high_add

    naive_low = total_base - sum(component_spreads_low)
    naive_high = total_base + sum(component_spreads_high)

    return QuadratureResult(
        total_base=total_base,
        total_low=total_low,
        total_high=total_high,
        widened_components=widened,
        naive_low=naive_low,
        naive_high=naive_high,
    )


# ===========================================================================
# Self-test
# ===========================================================================

if __name__ == "__main__":
    _results = []  # list[(label, passed: bool, detail: str)]

    def _check(label: str, condition: bool, detail: str = "") -> None:
        _results.append((label, bool(condition), detail))
        status = "PASS" if condition else "FAIL"
        line = f"[{status}] {label}"
        if detail:
            line += f"  ({detail})"
        print(line)

    def _check_raises(label: str, fn, exc_type) -> None:
        try:
            fn()
            _check(label, False, f"expected {exc_type.__name__}, nothing raised")
        except exc_type as e:
            _check(label, True, f"refused as expected: {e}")
        except Exception as e:  # wrong exception type
            _check(label, False, f"expected {exc_type.__name__}, got {type(e).__name__}: {e}")

    print("=" * 78)
    print("GOLDEN TESTS (each traces to a quoted line in an on-disk skill file)")
    print("=" * 78)

    # --- Golden 1: should-cost-builder quadrature worked example ----------
    # Source: should-cost-builder-1c344a/SKILL.md, "Aggregation Method":
    #   "a 3-component stack with bases 60 + 30 + 10 = Total_base 100.
    #    Spreads (low/high): materials +/-9, labor +/-6, logistics +/-2 ...
    #    sqrt(9^2 + 6^2 + 2^2) = sqrt(81+36+4) = sqrt(121) = 11, so the range
    #    is [89, 111]." Logistics (base 10 = 10% of Total_base) is the LOW
    #    driver named in the Pre-Delivery Self-Test example line and 10% does
    #    NOT exceed the 15% widening threshold, so no widening triggers.
    qr = quadrature_rollup(
        component_bases=[60, 30, 10],
        component_spreads_low=[9, 6, 2],
        component_spreads_high=[9, 6, 2],
        confidence_flags=["MEDIUM", "MEDIUM", "LOW"],
    )
    _check(
        "quadrature_rollup: should-cost-builder worked example "
        "'base 100 = 60+30+10; range [89, 111] via quadrature (3 independent drivers)'",
        qr.total_base == 100 and abs(qr.total_low - 89) < 1e-9
        and abs(qr.total_high - 111) < 1e-9 and qr.widened_components == [],
        f"got base={qr.total_base}, low={qr.total_low}, high={qr.total_high}, "
        f"widened={qr.widened_components}",
    )

    # --- Golden 2: market-rate-benchmarking percentile gate ---------------
    # Source: market-rate-benchmarking-1c344a/SKILL.md, Rule 2:
    #   "N >= 5 usable data points ... compute and report the percentile band"
    #   "N = 2 to 4 ... Do NOT report percentiles"
    #   "There is no separate '3 data points = percentiles' path; any older
    #    text implying percentiles at N=3 is superseded by this rule."
    _check("percentile_gate(5) == True (N>=5 rule)", percentile_gate(5) is True)
    _check("percentile_gate(4) == False (N=2-4 -> range+median only)", percentile_gate(4) is False)
    _check(
        "percentile_gate(3) == False (explicitly supersedes the old buggy N=3 path)",
        percentile_gate(3) is False,
    )
    _check("percentile_gate(1) == False (N=1 -> single reference point only)", percentile_gate(1) is False)

    # --- Golden 3: market-rate-benchmarking composite weight sum ----------
    # Source: market-rate-benchmarking-1c344a/SKILL.md, "Composite Contract
    # Quality Score": "Contract Quality = (Pricing x 0.30) + (SLA x 0.25) +
    # (Legal x 0.25) + (Operational x 0.20)" ... "Base weights sum to 1.00."
    # The per-criterion scores below (Pricing=4, SLA=3, Legal=5, Operational=2)
    # are illustrative inputs chosen for this test, NOT quoted from the skill
    # text; only the four weight values and their sum-to-1.00 requirement are
    # source-verified.
    weights_v21 = {"Pricing": 0.30, "SLA": 0.25, "Legal": 0.25, "Operational": 0.20}
    scores_demo = {"Pricing": 4.0, "SLA": 3.0, "Legal": 5.0, "Operational": 2.0}
    ws = weighted_score(scores_demo, weights_v21)
    expected_ws = 4.0 * 0.30 + 3.0 * 0.25 + 5.0 * 0.25 + 2.0 * 0.20
    _check(
        "weighted_score: market-rate-benchmarking corrected weights "
        "(0.30+0.25+0.25+0.20 = 1.00) accepted and computed correctly "
        "[weight values sourced; demo scores are illustrative, not quoted]",
        abs(ws - expected_ws) < 1e-9,
        f"got {ws}, expected {expected_ws}",
    )

    # --- Golden 4: market-rate-benchmarking's own bug value (1.05) refused -
    # Source: market-rate-benchmarking-1c344a/SKILL.md changelog v2.1:
    # "corrected composite quality weights to sum to 1.00 (was 1.05)."
    # The exact original mis-weighted set is not given in the text (only the
    # erroneous total, 1.05, is quoted); this reproduces that total with a
    # representative 4-weight set for the refusal test.
    weights_bug = {"Pricing": 0.30, "SLA": 0.25, "Legal": 0.25, "Operational": 0.25}  # sums to 1.05
    _check_raises(
        "weighted_score: refuses the market-rate-benchmarking v2.0 bug total "
        "(weights summing to 1.05, quoted verbatim in the v2.1 changelog)",
        lambda: weighted_score(scores_demo, weights_bug),
        WeightSumError,
    )

    # --- Golden 5: evaluation-engine's +/-0.001 weight-sum tolerance -------
    # Source: evaluation-engine-1c344a/SKILL.md, "Score Validation Checks":
    # "Effective weight sum | All Effective_Weight_Frac values must sum to
    # 1.0 +/- 0.001 across every criterion."
    weights_borderline = {"A": 0.5005, "B": 0.4995}  # sums to 1.0000, well inside tolerance
    _check(
        "weighted_score: accepts weights within evaluation-engine's stated "
        "+/-0.001 tolerance",
        weighted_score({"A": 2.0, "B": 3.0}, weights_borderline) is not None,
    )
    weights_just_outside = {"A": 0.502, "B": 0.5}  # sums to 1.002, outside +/-0.001
    _check_raises(
        "weighted_score: refuses weights just outside evaluation-engine's "
        "+/-0.001 tolerance (sum 1.002)",
        lambda: weighted_score({"A": 2.0, "B": 3.0}, weights_just_outside),
        WeightSumError,
    )

    # --- Golden 6: pro-forma-builder Assumptions register FX example ------
    # Source: pro-forma-builder-1c344a/SKILL.md, Assumptions register schema:
    # {"currency": "USD", "fx_rates": [ { "from": "EUR", "to": "USD",
    #  "rate": 1.08, "as_of": "2026-06-01" } ], ...}
    converted = convert_currency(100, "EUR", {"EUR": 1.08})
    _check(
        "convert_currency: pro-forma-builder Assumptions register example "
        "(EUR -> USD at 1.08)",
        abs(converted - 108.0) < 1e-9,
        f"got {converted}, expected 108.0",
    )

    # --- Golden 7 (formula-sourced, base value illustrative): escalate ----
    # Source: lilly-contract-review-1c344a/references/arithmetic-verification.md
    # 3E-2 #2: "Compounding (Year N = Year N-1 x 1.03) ... Simple (Year N =
    # Base Year x (1 + 0.03 x N))". The rate 0.03 / multiplier 1.03 is quoted
    # verbatim; the base value (100) below is illustrative, chosen by this
    # module to demonstrate the formula, NOT a worked example from the text.
    comp_y2 = escalate(100, 0.03, 2, compounding=True)
    simple_y2 = escalate(100, 0.03, 2, compounding=False)
    _check(
        "escalate: compounding formula 'Year N = Year N-1 x 1.03' unrolled "
        "to Base*(1.03)^N [rate 0.03/1.03 sourced; base=100 illustrative]",
        abs(comp_y2 - 100 * 1.03 ** 2) < 1e-9,
        f"got {comp_y2}",
    )
    _check(
        "escalate: simple formula 'Year N = Base x (1 + 0.03 x N)' "
        "[rate 0.03 sourced; base=100 illustrative]",
        abs(simple_y2 - 100 * (1 + 0.03 * 2)) < 1e-9,
        f"got {simple_y2}",
    )
    _check(
        "escalate: compounding and simple diverge for the same rate/year "
        "(qualitative claim in 3E-2: builds on prior year vs. from original base)",
        comp_y2 != simple_y2,
        f"compounding={comp_y2}, simple={simple_y2}",
    )

    print()
    print("=" * 78)
    print("FORMULA-ONLY IMPLEMENTATIONS (no source-verified golden numeric")
    print("example found; formula is copied verbatim, test is a consistency")
    print("check only, NOT presented as source-verified)")
    print("=" * 78)

    # npv(): pro-forma-builder gives the convention and formula but no worked
    # cash-flow example with concrete figures anywhere in its SKILL.md.
    # Consistency check only: with discount_rate = 0, NPV must equal the raw
    # sum of cashflows (a mathematical necessity of the formula itself, not a
    # quoted example).
    cf = [-100, 50, 50, 50]
    npv_zero_rate = npv(cf, 0.0)
    _check(
        "npv: consistency check only (r=0 => NPV = sum(cashflows)); "
        "NOT a source-quoted worked example, see report",
        abs(npv_zero_rate - sum(cf)) < 1e-9,
        f"got {npv_zero_rate}, expected {sum(cf)}",
    )
    npv_disc = npv(cf, 0.10)
    expected_npv_disc = -100 + 50 / 1.10 + 50 / 1.10 ** 2 + 50 / 1.10 ** 3
    _check(
        "npv: end-of-year Year-1 discounting convention applied correctly "
        "to an illustrative cash-flow series (not a quoted example)",
        abs(npv_disc - expected_npv_disc) < 1e-9,
        f"got {npv_disc}, expected {expected_npv_disc}",
    )

    # verify_line_math(): arithmetic-verification.md states the formula
    # ("Rate x hours = line total") but no worked numeric example.
    _check(
        "verify_line_math: consistency check only (150 * 10 == 1500), "
        "NOT a source-quoted worked example",
        verify_line_math(150, 10, 1500) is True,
    )
    _check(
        "verify_line_math: detects a mismatch beyond tolerance",
        verify_line_math(150, 10, 1600) is False,
    )

    # quadrature_rollup widening path: should-cost-builder states the >15%
    # widening rule in prose but gives no worked numeric example of it firing.
    qr_widened = quadrature_rollup(
        component_bases=[50, 40, 20],
        component_spreads_low=[5, 4, 6],
        component_spreads_high=[5, 4, 6],
        confidence_flags=["MEDIUM", "MEDIUM", "LOW"],
    )
    # component 3 (logistics-like) base=20 of total=110 -> 18.2% > 15%, LOW confidence -> widened
    _check(
        "quadrature_rollup: >15%-of-base LOW-confidence widening rule fires "
        "on an illustrative 3-driver stack; NOT a source-quoted worked example",
        qr_widened.widened_components == [2],
        f"got widened={qr_widened.widened_components}, "
        f"base={qr_widened.total_base}, low={qr_widened.total_low}, high={qr_widened.total_high}",
    )

    print()
    print("=" * 78)
    print("NEGATIVE TESTS (must refuse)")
    print("=" * 78)

    _check_raises(
        "to_hourly: refuses an unknown unit ('fortnight')",
        lambda: to_hourly(100, "fortnight"),
        UnknownUnitError,
    )
    _check_raises(
        "convert_currency: refuses an unknown currency code ('XYZ')",
        lambda: convert_currency(100, "XYZ", {"EUR": 1.08}),
        UnknownCurrencyError,
    )
    _check_raises(
        "weighted_score: refuses weights not summing to 1.0 (sum 1.05, the "
        "market-rate-benchmarking v2.0 bug value)",
        lambda: weighted_score(scores_demo, weights_bug),
        WeightSumError,
    )
    _check(
        "percentile_gate: N<5 (N=3) correctly withholds the percentile band "
        "(this is the negative case for the corrected gate, not a crash/refusal)",
        percentile_gate(3) is False,
    )
    _check_raises(
        "quadrature_rollup: refuses an unrecognized confidence flag ('UNSURE')",
        lambda: quadrature_rollup([10, 10], [1, 1], [1, 1], ["HIGH", "UNSURE"]),
        InvalidInputError,
    )
    _check_raises(
        "escalate: refuses year < 1 (not 1-indexed)",
        lambda: escalate(100, 0.03, 0, compounding=True),
        InvalidInputError,
    )

    print()
    print("=" * 78)
    passed = sum(1 for _, ok, _ in _results if ok)
    failed = sum(1 for _, ok, _ in _results if not ok)
    total = len(_results)
    print(f"SUMMARY: {passed}/{total} passed, {failed}/{total} failed")
    if failed:
        print("FAILED CASES:")
        for label, ok, detail in _results:
            if not ok:
                print(f"  - {label}: {detail}")
    print("=" * 78)
