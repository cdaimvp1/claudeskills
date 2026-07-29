# Vendored verbatim from lilly-procurement-kernels-1c344a/numeric_kernel.py on 2026-07-29; source of truth is lilly-procurement-kernels-1c344a/numeric_kernel.py. Do not hand-edit here; edit the source and re-vendor.
# negotiation-simulator-1c344a calls: reciprocity() and anchor_capture() (the two Structured Debrief metrics, including every degenerate case the v2.3 changelog records defining). The remaining functions are vendored for completeness (this is a verbatim copy of the shared kernel) but not called by this skill's own workflow.
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

Four faces:
  NORMALIZATION - to_hourly, convert_currency, percentile_gate
  VERIFICATION  - verify_line_math, escalate, weighted_score
  COMPUTATION   - npv, quadrature_rollup
  SCORING       - deduction_score, score_band

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
from typing import Dict, List, Optional, Sequence


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
# NEGOTIATION-METRICS face
# ===========================================================================
#
# Source: negotiation-simulator-1c344a/SKILL.md:464-476, the Structured Debrief
# metrics (reciprocity ratio and anchor effectiveness).
#
# These two metrics are almost entirely edge cases. That skill's v2.3 changelog
# (SKILL.md:149) records having to fix exactly that: "Defined the reciprocity
# ratio for zero/degenerate cases (give-nothing, get-nothing, one-sided) instead
# of printing a divide-by-zero or bare 'N:0'. Capped anchor effectiveness at 100%
# (with a separate 'beyond target' note) and defined the zero-range,
# wrong-direction, and non-numeric cases."
#
# All of that lives in prose today, which means every degenerate case depends on
# the model remembering a rule at the moment it is generating a debrief. Both
# functions below return a STATE rather than a bare number, so the caller cannot
# accidentally print a ratio in a case where the source forbids one.


@dataclass
class Reciprocity:
    """Reciprocity outcome. `index` is None in every case where the source
    forbids printing a ratio, so a None index is a hard signal not to render
    one rather than a value to coerce."""

    given: int
    received: int
    index: Optional[float]
    state: str


@dataclass
class AnchorCapture:
    """Anchor effectiveness. `display_pct` is what may be shown; `raw_pct` is
    the uncapped value, kept for the coaching note the source requires."""

    display_pct: Optional[float]
    raw_pct: Optional[float]
    state: str
    beyond_target: bool = False
    beyond_amount: float = 0.0


def reciprocity(given: int, received: int) -> Reciprocity:
    """Reciprocity ratio and state, per negotiation-simulator SKILL.md:464-470.

    `given` is N, the concessions the user made. `received` is M, those they got
    back. The four cases the source enumerates map to four states:

      N=0, M=0   NOT_APPLICABLE   no give-and-take to measure
      N>0, M=0   POOR             one-sided giving. NO ratio is produced,
                                  because the source says explicitly "Do NOT
                                  print a ratio with a zero denominator"
      N=0, M>0   STRONG           captured value without giving
      N>0, M>0   BALANCED if M/N >= 1.0, else UNFAVORABLE

    The index is M/N, "received per concession given", rounded to one decimal as
    the source specifies. It is None in the first three cases. That is
    deliberate: a None index cannot be formatted into a misleading "0.0" or
    "N:0" string, which is the defect the v2.3 changelog records fixing.
    """
    for label, v in (("given", given), ("received", received)):
        if not isinstance(v, int) or isinstance(v, bool) or v < 0:
            raise InvalidInputError(
                f"{label} must be a non-negative integer count of concessions, "
                f"got {v!r}"
            )
    if given == 0 and received == 0:
        return Reciprocity(given, received, None, "NOT_APPLICABLE")
    if given > 0 and received == 0:
        return Reciprocity(given, received, None, "POOR")
    if given == 0 and received > 0:
        return Reciprocity(given, received, None, "STRONG")
    index = round(received / given, 1)
    return Reciprocity(given, received, index,
                       "BALANCED" if index >= 1.0 else "UNFAVORABLE")


def anchor_capture(opening: float, final: float, target: float) -> AnchorCapture:
    """Anchor effectiveness, per negotiation-simulator SKILL.md:472-476.

    "capture% = (W - Z) / (Y - Z) * 100", where Z is the opening, W the final
    position and Y the playbook target. Direction is handled by the arithmetic
    itself: (Y - Z) carries the sign of the direction that favours Lilly, so a
    price target below the opening works the same as a term target above it.

    Four states, matching the four cases the source enumerates:

      NOT_APPLICABLE  opening equals target, so there is no range to capture.
                      The source requires this instead of dividing by zero
      BEYOND_TARGET   final closed past the target. display_pct is CAPPED at
                      100 and `beyond_amount` carries the overshoot. The source
                      calls the uncapped figure "a 130%-style artifact" and
                      forbids printing it as a percentage of a range
      MOVED_AWAY      final moved away from the target. display_pct is 0 and
                      raw_pct keeps the negative value for the coaching note.
                      The source forbids showing this as a positive percentage
      CAPTURED        the ordinary case, 0 to 100

    For a non-numeric issue, do not call this function at all. The source
    requires a qualitative read carried in a `qualitative` field with
    `state: NON_NUMERIC`, and fabricating a numeric capture is exactly what it
    prohibits.
    """
    for label, v in (("opening", opening), ("final", final), ("target", target)):
        if v is None or isinstance(v, bool) or not isinstance(v, (int, float)):
            raise InvalidInputError(
                f"{label} must be numeric, got {v!r}. For a non-numeric issue do "
                "not call anchor_capture at all: carry a qualitative read with "
                "state NON_NUMERIC, per SKILL.md:476"
            )
    if target == opening:
        return AnchorCapture(display_pct=None, raw_pct=None,
                             state="NOT_APPLICABLE")

    raw = (final - opening) / (target - opening) * 100.0

    if raw > 100.0:
        # The overshoot is expressed in the direction of travel, so it is
        # positive regardless of whether the target sits above or below.
        return AnchorCapture(display_pct=100.0, raw_pct=raw, state="BEYOND_TARGET",
                             beyond_target=True, beyond_amount=abs(final - target))
    if raw < 0.0:
        return AnchorCapture(display_pct=0.0, raw_pct=raw, state="MOVED_AWAY")
    return AnchorCapture(display_pct=raw, raw_pct=raw, state="CAPTURED")


# ===========================================================================
# CONCENTRATION face
# ===========================================================================
#
# Source: category-strategy-1c344a/references/analysis-methodology.md
#   Pareto methodology and segments  :96-125
#   HHI and its bands                :140-157
#   Growth metrics (CAGR)            :339
#   Tail spend framework             :253-290
#
# category-strategy had no kernel and no kernel calls. Every figure below was
# model arithmetic over a spend cube, which is the largest-N input this skill
# handles and the one where a single mis-summed cumulative silently reorders
# supplier tiers.


class ConcentrationError(KernelError):
    """Raised when a spend distribution cannot support the requested metric."""


# analysis-methodology.md:148-151.
_HHI_BANDS = ((1500, "Low"), (2500, "Moderate"), (10000, "High"))

# analysis-methodology.md:107-112. Upper cumulative bound per segment, in
# percent, and the label. A supplier belongs to the segment its cumulative
# share crosses INTO, counted from the share BEFORE it (see pareto_segments).
_PARETO_SEGMENTS = ((80.0, "A"), (95.0, "B"), (99.0, "C"), (100.0, "D"))

# analysis-methodology.md:118-123.
_PARETO_EFFICIENCY_BANDS = (
    (10.0, "Highly concentrated"),
    (20.0, "Typical"),
    (30.0, "Moderately fragmented"),
    (float("inf"), "Highly fragmented"),
)


@dataclass
class ParetoRow:
    """One supplier's position in the ranked spend distribution."""

    name: str
    spend: float
    share_pct: float
    cumulative_pct: float
    segment: str


@dataclass
class ParetoResult:
    rows: List[ParetoRow] = field(default_factory=list)
    total_spend: float = 0.0
    supplier_count: int = 0
    p80_count: int = 0
    p95_count: int = 0
    p99_count: int = 0
    pareto_efficiency_pct: float = 0.0
    pareto_efficiency_band: str = ""


def hhi(spends: Sequence[float]) -> float:
    """Herfindahl-Hirschman Index over a spend distribution, 0 to 10,000.

    Source: analysis-methodology.md:143-146, "HHI = sum(market_share_i^2) for
    all suppliers, where market_share_i = supplier_i_spend / total_spend (as a
    percentage, 0-100)".

    Shares are percentages, not fractions, which is what puts a monopoly at
    10,000 rather than 1.0. Getting that wrong by a factor of 10,000 is the
    obvious failure mode, so the worked example at :155 is a golden test.
    """
    if not spends:
        raise ConcentrationError("cannot compute HHI over an empty spend list")
    if any(s < 0 for s in spends):
        raise InvalidInputError("spend values must be non-negative")
    total = sum(spends)
    if total <= 0:
        raise ConcentrationError(
            "total spend is zero, so no supplier has a market share and HHI is "
            "undefined. Label this NEEDS_INPUT rather than reporting 0"
        )
    return sum((s / total * 100.0) ** 2 for s in spends)


def hhi_band(index: float) -> str:
    """Map an HHI to its concentration label (analysis-methodology.md:148-151)."""
    if index < 0 or index > 10000 + 1e-6:
        raise InvalidInputError(f"HHI {index} is outside the 0-10,000 scale")
    for ceiling, label in _HHI_BANDS:
        if index < ceiling:
            return label
    return "High"


def pareto_segments(suppliers: Sequence[tuple]) -> ParetoResult:
    """Rank suppliers by spend and assign Pareto segments A/B/C/D.

    `suppliers` is a sequence of (name, spend) pairs, in any order.

    Source: analysis-methodology.md:96-125.

    RESOLVED AMBIGUITY, disclosed. The source defines segment A as "top
    suppliers up to 80% cumulative" and separately defines Pareto Efficiency
    using "number of suppliers covering 80% of spend". Those two readings differ
    for the one supplier whose spend straddles the line. This function resolves
    it so that the straddling supplier is INCLUDED in A, i.e. segment is decided
    by the cumulative share BEFORE that supplier is added. That makes p80_count
    the smallest N whose cumulative reaches 80%, which is what "covering 80% of
    spend" means and what the dashboard's `p80` field reports. The alternative
    reading would report a p80 that does not actually reach 80%.
    """
    if not suppliers:
        raise ConcentrationError("cannot compute a Pareto distribution over no suppliers")
    for item in suppliers:
        if len(item) != 2:
            raise InvalidInputError(f"expected (name, spend) pairs, got {item!r}")
        if item[1] < 0:
            raise InvalidInputError(f"spend for {item[0]!r} is negative")
    total = sum(s for _, s in suppliers)
    if total <= 0:
        raise ConcentrationError(
            "total spend is zero, so there is no distribution to rank. Label "
            "NEEDS_INPUT rather than emitting an all-zero Pareto"
        )

    # Descending spend, then name, so two runs of the same data rank identically
    # (the skill's determinism guarantee applies to supplier ordering).
    ranked = sorted(suppliers, key=lambda p: (-p[1], p[0]))

    rows: List[ParetoRow] = []
    cumulative_before = 0.0
    for name, spend in ranked:
        share = spend / total * 100.0
        segment = _PARETO_SEGMENTS[-1][1]
        for ceiling, label in _PARETO_SEGMENTS:
            if cumulative_before < ceiling:
                segment = label
                break
        cumulative_before += share
        rows.append(ParetoRow(name=name, spend=float(spend), share_pct=share,
                              cumulative_pct=cumulative_before, segment=segment))

    p80 = sum(1 for r in rows if r.segment == "A")
    p95 = p80 + sum(1 for r in rows if r.segment == "B")
    p99 = p95 + sum(1 for r in rows if r.segment == "C")
    efficiency = p80 / len(rows) * 100.0
    band = _PARETO_EFFICIENCY_BANDS[-1][1]
    for ceiling, label in _PARETO_EFFICIENCY_BANDS:
        if efficiency < ceiling:
            band = label
            break

    return ParetoResult(rows=rows, total_spend=total, supplier_count=len(rows),
                        p80_count=p80, p95_count=p95, p99_count=p99,
                        pareto_efficiency_pct=efficiency,
                        pareto_efficiency_band=band)


def cagr(start_value: float, end_value: float, years: float) -> float:
    """Compound annual growth rate as a fraction (0.08 = 8 percent).

    Source: analysis-methodology.md:339, "CAGR (multi-year): (P_end / P_start)
    ^(1/years) - 1".

    Refuses a non-positive start value. A CAGR off a zero or negative base is
    undefined, not infinite, and reporting a large number there would create
    exactly the kind of phantom "rapid growth vendor" the anomaly check at
    SKILL.md:367 is meant to surface honestly.
    """
    if years <= 0:
        raise InvalidInputError(f"years must be positive, got {years}")
    if start_value <= 0:
        raise ConcentrationError(
            f"CAGR is undefined from a start value of {start_value}. A growth "
            "rate off a zero or negative base is not a large number, it is "
            "meaningless; report the vendor as new rather than fabricating a rate"
        )
    if end_value < 0:
        raise InvalidInputError(f"end_value must be non-negative, got {end_value}")
    return (end_value / start_value) ** (1.0 / years) - 1.0


def yoy(prior_value: float, current_value: float) -> float:
    """Year-over-year change as a fraction (0.08 = 8 percent growth).

    Source: category-strategy SKILL.md:715, "Show CAGR across the full period
    and YoY for the most recent year-pair."

    Refuses a zero prior value for the same reason cagr() does.
    """
    if prior_value == 0:
        raise ConcentrationError(
            "year-over-year change is undefined against a prior value of zero. "
            "Report the category or vendor as new rather than as infinite growth"
        )
    if prior_value < 0:
        raise InvalidInputError("prior_value must be positive for a YoY rate")
    return (current_value - prior_value) / prior_value


@dataclass
class TailResult:
    threshold: float
    vendor_count: int
    tail_spend: float
    tail_spend_pct: float
    hours_low: float
    hours_high: float


def tail_at_threshold(spends: Sequence[float], threshold: float,
                      hours_per_vendor_low: float = 8.0,
                      hours_per_vendor_high: float = 12.0) -> TailResult:
    """Tail analysis at a spend threshold (Method 2 of the tail framework).

    Source: analysis-methodology.md:261 (threshold method) and category-strategy
    SKILL.md:378-379, which require tail analysis at $50K / $100K / $250K with
    "vendor count, total spend, and percentage", plus the effort-to-value line
    "tail vendor count x 8-12 hours = estimated annual contracting hours".

    The 8-to-12 hour band is the skill's own stated range and is returned as a
    range, not collapsed to a midpoint, because the skill reports it as a range.
    """
    if threshold <= 0:
        raise InvalidInputError(f"threshold must be positive, got {threshold}")
    if any(s < 0 for s in spends):
        raise InvalidInputError("spend values must be non-negative")
    total = sum(spends)
    if total <= 0:
        raise ConcentrationError(
            "total spend is zero, so a tail percentage is undefined"
        )
    tail = [s for s in spends if s < threshold]
    tail_spend = sum(tail)
    return TailResult(
        threshold=float(threshold),
        vendor_count=len(tail),
        tail_spend=tail_spend,
        tail_spend_pct=tail_spend / total * 100.0,
        hours_low=len(tail) * hours_per_vendor_low,
        hours_high=len(tail) * hours_per_vendor_high,
    )


# ===========================================================================
# OUTCOME face
# ===========================================================================
#
# Source: negotiation-playbook-learning-1c344a/SKILL.md, inlined
# "references/outcome-schema.md" -> the win/loss partition math (SKILL.md:574-608)
# and "## Negotiation Difficulty Score" (SKILL.md:613-640).
#
# That skill had no kernel at all before this, and its own v2.1 changelog
# (SKILL.md:33) records the bug this face exists to make unrepeatable: "Fixed
# difficulty-score scaling (max per-position weight set to 15, scaling_factor =
# 100/15) so a single HARD_STOP_EXCEPTION can no longer push the 0-100 score
# past 100; made the win/loss outcome partition exhaustive (rates sum to 100%)".
# Both halves of that fix are invariants here rather than prose: the score is
# bounded by construction and asserted, and the partition raises if it does not
# foot to 1.0.


class OutcomeCodeError(KernelError):
    """Raised for an outcome code outside the eleven the schema defines."""


class PartitionError(KernelError):
    """Raised when the four win/loss partition rates do not sum to 1.0.

    SKILL.md:607 states the integrity check directly: "lilly_position_prevailed
    + supplier_prevailed + negotiated + escalated == 1.0", and :610 tells the
    reader that a failure means "you have miscounted an outcome and must
    recount". That is a recount instruction, not a rounding tolerance, so this
    raises rather than normalizing the rates to fit.
    """


# SKILL.md:564-570, the outcome-code to partition-bucket map. NOT_APPLICABLE is
# excluded from the denominator rather than assigned a bucket.
_LILLY_PREVAILED = ("ACCEPTED_AS_IS", "ACCEPTED_WITH_MINOR_CHANGES",
                    "HARD_STOP_HELD", "LILLY_FALLBACK_USED")
_SUPPLIER_PREVAILED = ("COUNTER_ACCEPTED", "REJECTED_BY_SUPPLIER",
                       "HARD_STOP_EXCEPTION")
_NEGOTIATED = ("NEGOTIATED_COMPROMISE",)
_ESCALATED = ("ESCALATED_TO_SME", "ESCALATED_TO_LEGAL")
_NOT_APPLICABLE = "NOT_APPLICABLE"

# SKILL.md:576-583. Strict acceptance EXCLUDES fallbacks, so it is a subset of
# lilly_position_prevailed and is deliberately NOT part of the 100% partition
# (SKILL.md:610 says so explicitly).
_STRICT_ACCEPTANCE = ("ACCEPTED_AS_IS", "ACCEPTED_WITH_MINOR_CHANGES",
                      "HARD_STOP_HELD")

_ALL_OUTCOME_CODES = (_LILLY_PREVAILED + _SUPPLIER_PREVAILED + _NEGOTIATED
                      + _ESCALATED + (_NOT_APPLICABLE,))

# SKILL.md:620-628. Codes absent from this map carry weight 0
# (ACCEPTED_AS_IS, ACCEPTED_WITH_MINOR_CHANGES, HARD_STOP_HELD).
_DIFFICULTY_WEIGHTS = {
    "REJECTED_BY_SUPPLIER": 10,
    "COUNTER_ACCEPTED": 8,
    "NEGOTIATED_COMPROMISE": 5,
    "ESCALATED_TO_SME": 6,
    "ESCALATED_TO_LEGAL": 8,
    "HARD_STOP_EXCEPTION": 15,
    "LILLY_FALLBACK_USED": 3,
}

# SKILL.md:615, :630-632. The max per-position weight is 15, so 100/15 maps an
# average-weight-per-position range of 0-to-15 onto 0-to-100 by construction.
_MAX_POSITION_WEIGHT = 15
_DIFFICULTY_SCALING_FACTOR = 100 / _MAX_POSITION_WEIGHT

# SKILL.md:636-639.
_DIFFICULTY_BANDS = ((25, "Low"), (50, "Medium"), (75, "High"),
                     (100, "Very high"))


@dataclass
class OutcomePartition:
    """The four win/loss rates plus strict acceptance, over one denominator."""

    denominator: int
    acceptance_rate: float
    lilly_position_prevailed: float
    supplier_prevailed: float
    negotiated: float
    escalated: float


@dataclass
class DifficultyScore:
    """A 0-100 negotiation difficulty score with its band label."""

    score: float
    band: str
    weighted_sum: int
    applicable: int
    leadership_flag: bool


def _validate_counts(counts: Dict[str, int]) -> None:
    for code, n in counts.items():
        if code not in _ALL_OUTCOME_CODES:
            raise OutcomeCodeError(
                f"unknown outcome code {code!r}. The schema defines exactly "
                f"{sorted(_ALL_OUTCOME_CODES)} (SKILL.md:564-570)"
            )
        if not isinstance(n, int) or isinstance(n, bool) or n < 0:
            raise InvalidInputError(
                f"count for {code} must be a non-negative integer, got {n!r}"
            )


def outcome_partition(counts: Dict[str, int]) -> OutcomePartition:
    """Compute the win/loss partition and strict acceptance rate.

    Source: negotiation-playbook-learning SKILL.md:574-608.

    `denominator` is every applicable position, i.e. the sum of all counts
    except NOT_APPLICABLE (SKILL.md:574, "denominator = total_applicable -
    count(NOT_APPLICABLE)").

    Raises `PartitionError` if the four partition rates do not sum to 1.0.
    SKILL.md:610 says a failure means an outcome was miscounted and must be
    recounted, so this refuses rather than rescaling the rates to fit, which
    would hide the miscount the check exists to surface.

    Note that `acceptance_rate` is STRICT: it excludes LILLY_FALLBACK_USED and
    is therefore a subset of `lilly_position_prevailed`, not a fifth partition
    member. SKILL.md:610 states this explicitly.
    """
    _validate_counts(counts)
    denominator = sum(n for c, n in counts.items() if c != _NOT_APPLICABLE)
    if denominator == 0:
        raise InvalidInputError(
            "denominator is 0: every position was NOT_APPLICABLE, or no counts "
            "were supplied. There is no partition to report; label this "
            "NEEDS_INPUT rather than reporting zero rates"
        )

    def _rate(codes):
        return sum(counts.get(c, 0) for c in codes) / denominator

    part = OutcomePartition(
        denominator=denominator,
        acceptance_rate=_rate(_STRICT_ACCEPTANCE),
        lilly_position_prevailed=_rate(_LILLY_PREVAILED),
        supplier_prevailed=_rate(_SUPPLIER_PREVAILED),
        negotiated=_rate(_NEGOTIATED),
        escalated=_rate(_ESCALATED),
    )

    total = (part.lilly_position_prevailed + part.supplier_prevailed
             + part.negotiated + part.escalated)
    if abs(total - 1.0) > 1e-9:
        raise PartitionError(
            f"the four partition rates sum to {total}, not 1.0 "
            f"(lilly={part.lilly_position_prevailed}, "
            f"supplier={part.supplier_prevailed}, negotiated={part.negotiated}, "
            f"escalated={part.escalated}). SKILL.md:610, an outcome has been "
            "miscounted and must be recounted. Refusing to rescale"
        )
    return part


def difficulty_score(counts: Dict[str, int]) -> Optional[DifficultyScore]:
    """Compute the 0-100 Negotiation Difficulty Score (higher = harder).

    Source: negotiation-playbook-learning SKILL.md:613-640.

    Returns None when there are no applicable positions. SKILL.md:630 says
    "never divide by zero; if applicable == 0, difficulty is NEEDS_INPUT", so
    None is the caller's cue to render NEEDS_INPUT rather than a score of 0,
    which would read as "this negotiation was easy" when nothing was measured.

    The 0-100 bound holds by construction: the maximum per-position weight is
    15 and the scaling factor is 100/15, so the worst possible average weight
    per position maps to exactly 100. This is asserted rather than assumed,
    because restoring the pre-v2.1 scaling would break it silently.
    """
    _validate_counts(counts)
    applicable = sum(n for c, n in counts.items() if c != _NOT_APPLICABLE)
    if applicable == 0:
        return None

    weighted_sum = sum(_DIFFICULTY_WEIGHTS.get(c, 0) * n
                       for c, n in counts.items() if c != _NOT_APPLICABLE)
    score = (weighted_sum / applicable) * _DIFFICULTY_SCALING_FACTOR

    # SKILL.md:634 calls the clamp "a defensive guard against rounding". If it
    # ever has real work to do, the scaling is wrong, which is exactly the v2.1
    # bug, so the overshoot is caught rather than quietly clipped.
    if score < -1e-9 or score > 100 + 1e-9:
        raise InvalidInputError(
            f"difficulty score {score} fell outside 0-100 before clamping. The "
            f"score is bounded by construction (max weight {_MAX_POSITION_WEIGHT}, "
            f"scaling {_DIFFICULTY_SCALING_FACTOR:.4f}), so this means a weight "
            "exceeds the stated maximum. This is the v2.1 scaling-overshoot bug "
            "(SKILL.md:33) reappearing, not a rounding artifact"
        )
    score = min(100.0, max(0.0, score))

    band = _DIFFICULTY_BANDS[-1][1]
    for ceiling, label in _DIFFICULTY_BANDS:
        if score <= ceiling:
            band = label
            break

    return DifficultyScore(
        score=score,
        band=band,
        weighted_sum=weighted_sum,
        applicable=applicable,
        # SKILL.md:639, "76-100: Very high difficulty (flag for procurement
        # leadership awareness)".
        leadership_flag=score > 75,
    )


# ===========================================================================
# LEVELING face
# ===========================================================================
#
# Source: rfp-response-analysis-1c344a/SKILL.md, inlined
# "references/bid-leveling.md" -> "## Normalization formulas" (SKILL.md:1696-1704)
#
# Why this is in the kernel at all. rfp-response-analysis already routes its
# Weighted Scoring Matrix through weighted_score(), so the RANKING arithmetic is
# audited. But the pricing dimension of that matrix reads the NORMALIZED TCO,
# and the normalization producing it was prose the model executed by hand. An
# audited ranking computed over an unaudited input is not audited. Rule 6 of
# that skill ("Never rank, score, or recommend on unleveled figures") is exactly
# the invariant these functions enforce.
#
# The three formulas, quoted from SKILL.md:1698-1700:
#   normalized_price_per_unit_per_year = annual / units
#   reported_TCO = (annual * term_years) + one_time
#   normalized_TCO_per_unit_per_year = reported_TCO / term_years / units
#
# The second is qualified in the source as "flat, no escalation; this is the
# illustrative-dashboard simplification". SKILL.md:1704 then makes the real rule
# explicit: when a proposal states a multi-year escalator and the comparison
# spans more than one year, the year-by-year escalated recurring cost MUST be
# computed by calling escalate() once per contract year and summed, "rather than
# the flat annual * term_years shorthand above". level_bid() implements that
# rule as a refusal, not a preference: ask for a flat TCO on an escalated
# multi-year proposal and it raises.


class LevelingError(KernelError):
    """Raised when a bid cannot be leveled onto the common comparison basis.

    Every raise here is a case where returning a number would silently
    misrepresent one supplier against another, which is the specific harm
    rfp-response-analysis's Bid Leveling gate exists to prevent.
    """


@dataclass
class LeveledBid:
    """One supplier's pricing normalized onto the common comparison basis.

    Field names follow `bid_leveling_worksheet.csv`'s columns where they
    correspond, so a worksheet row can be written straight from this object
    instead of being re-derived.
    """

    reported_tco: float
    recurring_total: float
    one_time_cost: float
    normalized_price_per_unit: float
    normalized_tco_per_unit_per_year: float
    per_year_recurring: List[float] = field(default_factory=list)
    term_years: int = 0
    units: float = 0.0
    escalator_pct: float = 0.0
    flat_shorthand_used: bool = True
    supplier_stated_total: Optional[float] = None
    stated_vs_computed_variance: Optional[float] = None


def level_bid(
    *,
    annual_recurring: float,
    units: float,
    term_years: int,
    one_time: Optional[float],
    escalator_pct: float = 0.0,
    compounding: bool = True,
    first_year_escalated: Optional[bool] = None,
    supplier_stated_total: Optional[float] = None,
) -> LeveledBid:
    """Normalize one supplier's reported pricing onto the common basis.

    Implements the three formulas at SKILL.md:1698-1700 and the escalation rule
    at :1704. Refuses rather than returning a figure that would misrepresent one
    supplier against another.

    Arguments:
      annual_recurring      the stated annual recurring price (subscription,
                            support, hosting, managed services)
      units                 the named-unit count for the common basis
      term_years            the RFP's stated term, in whole years
      one_time              one-time costs (implementation, setup, migration).
                            Must be a number. See the refusal note below
      escalator_pct         the proposal's stated annual escalator as a
                            fraction, e.g. 0.03 for 3 percent. 0.0 means the
                            proposal states no escalator
      compounding           True for "Year N = Year N-1 x (1+rate)", False for
                            simple escalation off the base. Passed to escalate()
      first_year_escalated  whether contract year 1 already carries one
                            escalation. Required when an escalator applies over
                            more than one year, see below
      supplier_stated_total the supplier's own headline total, if stated. When
                            given, the variance against the computed TCO is
                            returned so element 7's "reported vs normalized"
                            gap is visible rather than absorbed

    Refusals, each tied to a specific way a number could mislead:

      one_time=None refuses. Element 5 of the eight required elements says a
      cost no supplier priced is carried as a labeled placeholder, "never
      defaulted to zero and never dropped from the comparison". Coercing an
      unknown one-time cost to 0 is precisely that defaulting, and it flatters
      whichever supplier was least forthcoming. A supplier whose one-time costs
      are unknown is Pending Clarification and does not get a leveled TCO.

      first_year_escalated=None refuses when escalator_pct != 0 and
      term_years > 1. The source says to call escalate() per year but never says
      whether contract year 1 is already escalated. The kernel's own escalate()
      docstring flags the same ambiguity and notes pro-forma-builder resolves it
      the other way. On a 3-year term at 5 percent the two readings differ by
      roughly a full year of escalation across the recurring stack, which is
      material to a ranking, so the caller states the convention rather than the
      kernel guessing it.

      A stated escalator over a multi-year term never silently uses the flat
      shorthand. That is the whole point of SKILL.md:1704.
    """
    if units is None or units <= 0:
        raise InvalidInputError(
            f"units must be positive, got {units!r}. The common comparison basis "
            "is a per-unit figure, so a zero or missing unit count cannot produce one"
        )
    if not isinstance(term_years, int) or isinstance(term_years, bool) or term_years < 1:
        raise InvalidInputError(
            f"term_years must be a whole number of years >= 1, got {term_years!r}"
        )
    if annual_recurring is None or annual_recurring < 0:
        raise InvalidInputError(
            f"annual_recurring must be zero or positive, got {annual_recurring!r}"
        )
    if one_time is None:
        raise LevelingError(
            "one_time is None. Bid Leveling element 5 requires an unpriced cost be "
            "carried as a labeled placeholder, never defaulted to zero and never "
            "dropped. Supply a should-cost placeholder value, or leave this supplier "
            "at Pending Clarification and exclude it from the normalized comparison"
        )
    if one_time < 0:
        raise InvalidInputError(f"one_time must be zero or positive, got {one_time!r}")

    escalates = escalator_pct != 0.0 and term_years > 1
    if escalates and first_year_escalated is None:
        raise LevelingError(
            f"a {escalator_pct:.2%} escalator applies over {term_years} years but "
            "first_year_escalated was not stated. SKILL.md:1704 requires escalate() "
            "per contract year, and the source does not define whether contract "
            "year 1 already carries one escalation. Pass first_year_escalated=False "
            "if the stated annual price IS year 1's price (the usual reading), True "
            "if year 1 is already escalated off an earlier base"
        )

    per_year: List[float] = []
    if escalates:
        offset = 0 if first_year_escalated else 1
        for n in range(1, term_years + 1):
            exponent = n - offset
            if exponent < 1:
                # escalate() refuses year < 1 by design, and an exponent of 0 is
                # the unescalated base year, so it is used directly.
                per_year.append(float(annual_recurring))
            else:
                per_year.append(
                    escalate(annual_recurring, escalator_pct, exponent, compounding)
                )
    else:
        # SKILL.md:1699 flat shorthand, legal only when no escalator applies.
        per_year = [float(annual_recurring)] * term_years

    recurring_total = sum(per_year)
    reported_tco = recurring_total + float(one_time)

    variance = None
    if supplier_stated_total is not None:
        variance = reported_tco - float(supplier_stated_total)

    return LeveledBid(
        reported_tco=reported_tco,
        recurring_total=recurring_total,
        one_time_cost=float(one_time),
        # SKILL.md:1698, a single-year figure off the stated annual price, so it
        # is deliberately NOT escalated even when the multi-year TCO is.
        normalized_price_per_unit=annual_recurring / units,
        # SKILL.md:1700.
        normalized_tco_per_unit_per_year=reported_tco / term_years / units,
        per_year_recurring=per_year,
        term_years=term_years,
        units=float(units),
        escalator_pct=escalator_pct,
        flat_shorthand_used=not escalates,
        supplier_stated_total=supplier_stated_total,
        stated_vs_computed_variance=variance,
    )


# ===========================================================================
# SCORING face
# ===========================================================================
#
# Source: lilly-contract-review-1c344a/references/risk-scoring.md
#
# This is a DEDUCTION model and is deliberately NOT weighted_score(). It starts
# at 100 and subtracts, the deduction for a finding depends on how well the
# governing documents already cover that finding's category, and Hard Stops are
# fixed at -15 in every column. weighted_score() is a weighted average over
# criteria that must foot to 1.0, which is a different shape entirely. Do not
# route one through the other.
#
# The division of labour matters and is the reason this function takes a
# per-finding deduction rather than computing one. risk-scoring.md:28 step 4
# reserves the value WITHIN the range to human or model judgment ("findings that
# are editing errors or MSA-alignment restorations take the low end; findings
# that represent genuine unprotected exposure take the high end"). Code cannot
# make that call. What code CAN do, and what this function does, is refuse a
# deduction that falls outside the range the table allows, refuse a reduced Hard
# Stop, and refuse a total that fails either calibration check. The model still
# rules; the kernel stops it ruling outside the table.


class CoverageStatusError(KernelError):
    """Raised for a coverage status outside standalone/covered/confirm/gap."""


class SeverityError(KernelError):
    """Raised for a finding severity outside the five rows of the deduction table."""


class HardStopReducedError(KernelError):
    """Raised when a Hard Stop carries any deduction other than -15.

    risk-scoring.md:17 puts -15 in all four coverage columns and :31 states
    "Hard Stops are never reduced. A Hard Stop is a non-negotiable Lilly
    position regardless of what the MSA says. The deduction is always -15."
    This is the invariant the redesign spec asks the kernel to enforce rather
    than leave as an instruction, so a reduced Hard Stop refuses here instead of
    quietly producing a flattering score.
    """


class DeductionRangeError(KernelError):
    """Raised when a per-finding deduction falls outside its table range.

    The range is selected by (severity, coverage status) per
    risk-scoring.md:15-21. Judgment picks the value inside the range; anything
    outside it is a scoring error, most commonly the Standalone column applied
    to a category the governing documents actually cover.
    """


class CalibrationError(KernelError):
    """Raised when a total deduction fails one of the two anti-drift checks.

    risk-scoring.md:74-83 carries BOTH directions:
      too harsh   (:76-81) zero Hard Stops, 10+ of 14 categories Covered, and
                  findings primarily alignment or clarification, yet total
                  deductions exceed 30. Indicates the Standalone column was
                  used where Governed: Covered should apply.
      too generous(:83)    a standalone supplier-paper document with no
                  governing documents and 5+ findings, yet total deductions are
                  under 25.

    The too-generous direction is the more dangerous of the two, because it
    understates risk and a flattering number does not invite scrutiny. Both
    raise here. Neither is advisory.
    """


# risk-scoring.md:15-21, transcribed verbatim. Ranges are (most_negative,
# least_negative) so that a deduction d is valid when low <= d <= high.
_COVERAGE_COLUMNS = ("standalone", "covered", "confirm", "gap")

_HARD_STOP = "Hard Stop"
_HARD_STOP_DEDUCTION = -15.0

_DEDUCTION_TABLE = {
    # severity        standalone     covered      confirm      gap
    "Hard Stop": {
        "standalone": (-15.0, -15.0),
        "covered": (-15.0, -15.0),
        "confirm": (-15.0, -15.0),
        "gap": (-15.0, -15.0),
    },
    "HIGH": {
        "standalone": (-10.0, -7.0),
        "covered": (-5.0, -3.0),
        "confirm": (-7.0, -5.0),
        "gap": (-10.0, -7.0),
    },
    "MEDIUM": {
        "standalone": (-6.0, -4.0),
        "covered": (-3.0, -2.0),
        "confirm": (-4.0, -3.0),
        "gap": (-6.0, -4.0),
    },
    "LOW": {
        "standalone": (-3.0, -2.0),
        "covered": (-1.0, -1.0),
        "confirm": (-2.0, -1.0),
        "gap": (-3.0, -2.0),
    },
    "Protection Gap": {
        "standalone": (-5.0, -3.0),
        "covered": (-2.0, -1.0),
        "confirm": (-3.0, -2.0),
        "gap": (-5.0, -3.0),
    },
}

# risk-scoring.md:37-42. Bands are inclusive at both ends and contiguous.
_SCORE_BANDS = (
    (75, 100, "Low"),
    (50, 74, "Moderate"),
    (25, 49, "High"),
    (0, 24, "Critical"),
)

_TOTAL_PROTECTION_CATEGORIES = 14  # risk-scoring.md:25 names all 14


@dataclass
class ScoredFinding:
    """One finding as the deduction table sees it.

    `deduction` is the value judgment already picked from the table range, as a
    negative number. `rationale` is carried through untouched so the Rule 12
    calculation table can be rendered from this object rather than re-authored.
    """

    severity: str
    coverage_status: str
    deduction: float
    finding_id: str = ""
    category: str = ""
    rationale: str = ""


@dataclass
class ProtectionScore:
    """Result of deduction_score(), shaped for the Rule 12 calculation table.

    `rows` carries one entry per finding with the column that was used and the
    range it had to fall inside, which is exactly what SKILL.md Rule 12 requires
    be emitted so the score is auditable and reproducible by the reader. It is
    returned as data, not prose: the generator renders it, so the table cannot
    disagree with the score it accompanies.
    """

    score: int
    raw_score: float
    band: str
    total_deduction: float
    hard_stop_count: int
    finding_count: int
    covered_category_count: Optional[int]
    rows: List[Dict[str, object]] = field(default_factory=list)
    clamped: bool = False


def score_band(score: float) -> str:
    """Map a 0-100 Protection Score to its residual-risk label.

    Source: risk-scoring.md:37-42. Boundaries are exact and inclusive: 75 is
    Low, 74 is Moderate, 50 is Moderate, 49 is High, 25 is High, 24 is Critical.
    """
    if score < 0 or score > 100:
        raise InvalidInputError(
            f"score {score} is outside the 0-100 scale defined at risk-scoring.md:37-42"
        )
    for low, high, label in _SCORE_BANDS:
        if low <= score <= high:
            return label
    raise InvalidInputError(f"no band covers score {score}")  # unreachable by construction


def deduction_score(
    findings: Sequence[ScoredFinding],
    *,
    covered_category_count: Optional[int] = None,
    governing_docs_present: bool = True,
    alignment_dominant: Optional[bool] = None,
) -> ProtectionScore:
    """Compute the 0-100 Protection Score from validated findings.

    Implements risk-scoring.md in full: the starting point of 100 (:11), the
    severity-by-coverage deduction table (:15-21), the Hard Stop invariant
    (:17, :31), the 0-100 scale and its four bands (:37-42), and BOTH anti-drift
    calibration checks (:76-81 and :83).

    Arguments:
      findings                 the validated PASS_4_PREP findings, each carrying
                               the deduction already chosen from its table range
      covered_category_count   how many of the 14 protection categories
                               PASS_2_COVERAGE marks Covered. Required to
                               evaluate the too-harsh calibration check
      governing_docs_present   False for a standalone supplier-paper document
                               with no governing documents. Drives the
                               too-generous check
      alignment_dominant       whether the findings are primarily MSA-alignment
                               or clarification items rather than new
                               unprotected exposures. This is the third
                               criterion at risk-scoring.md:79 and it is a
                               judgment, so the caller supplies it

    Raises rather than returning a wrong number, in every case:
      SeverityError / CoverageStatusError  unknown severity or column
      HardStopReducedError                 a Hard Stop deducting other than -15
      DeductionRangeError                  a deduction outside its table range
      CalibrationError                     either anti-drift check fails
      InvalidInputError                    a positive deduction, or the
                                           too-harsh check cannot be evaluated
                                           because alignment_dominant is unknown

    On the last one: when zero Hard Stops and 10+ Covered categories both hold,
    the too-harsh check is live and its third criterion cannot be guessed. The
    kernel refuses rather than assuming, matching this module's standing
    refuse-do-not-guess rule. Passing alignment_dominant=False disables that one
    check honestly; omitting it does not.
    """
    if not isinstance(findings, Sequence) or isinstance(findings, (str, bytes)):
        raise InvalidInputError("findings must be a sequence of ScoredFinding")

    rows: List[Dict[str, object]] = []
    total_deduction = 0.0
    hard_stop_count = 0

    for i, f in enumerate(findings):
        where = f.finding_id or f"index {i}"

        if f.severity not in _DEDUCTION_TABLE:
            raise SeverityError(
                f"finding {where}: severity {f.severity!r} is not one of "
                f"{sorted(_DEDUCTION_TABLE)} (risk-scoring.md:15-21)"
            )
        status = f.coverage_status.strip().lower() if isinstance(f.coverage_status, str) else f.coverage_status
        if status not in _COVERAGE_COLUMNS:
            raise CoverageStatusError(
                f"finding {where}: coverage status {f.coverage_status!r} is not one of "
                f"{list(_COVERAGE_COLUMNS)} (risk-scoring.md:15)"
            )

        deduction = float(f.deduction)
        if deduction > 0:
            raise InvalidInputError(
                f"finding {where}: deduction {deduction} must be negative or zero; "
                "this is a deduction model, not an additive score"
            )

        # risk-scoring.md:83, "Every finding in a standalone document uses the
        # Standalone column." The three Governed columns describe what a
        # governing document provides, so they cannot apply when there is none.
        if not governing_docs_present and status != "standalone":
            raise CoverageStatusError(
                f"finding {where}: coverage status {status!r} used on a document with "
                "no governing documents. risk-scoring.md:83, every finding in a "
                "standalone document uses the Standalone column"
            )

        if f.severity == _HARD_STOP:
            hard_stop_count += 1
            if deduction != _HARD_STOP_DEDUCTION:
                raise HardStopReducedError(
                    f"finding {where}: Hard Stop deduction is {deduction}, must be "
                    f"{_HARD_STOP_DEDUCTION} in every coverage column. "
                    "risk-scoring.md:31, Hard Stops are never reduced"
                )
        else:
            low, high = _DEDUCTION_TABLE[f.severity][status]
            if not (low <= deduction <= high):
                raise DeductionRangeError(
                    f"finding {where}: deduction {deduction} is outside the "
                    f"{f.severity} / {status} range [{low}, {high}] "
                    "(risk-scoring.md:15-21). The usual cause is the Standalone "
                    "column applied to a category the governing documents cover"
                )

        total_deduction += deduction
        rows.append({
            "finding_id": f.finding_id,
            "category": f.category,
            "severity": f.severity,
            "coverage_status": status,
            "column_used": "Standalone" if status == "standalone" else f"Governed: {status.capitalize()}",
            "allowed_range": _DEDUCTION_TABLE[f.severity][status],
            "deduction": deduction,
            "rationale": f.rationale,
        })

    raw_score = 100.0 + total_deduction  # total_deduction is negative
    clamped = raw_score < 0
    score = int(round(max(0.0, raw_score)))

    # --- Anti-drift calibration, both directions, both raising -------------
    magnitude = abs(total_deduction)

    # Too harsh: risk-scoring.md:76-81. ALL THREE criteria must hold.
    two_mechanical_criteria_hold = (
        hard_stop_count == 0
        and covered_category_count is not None
        and covered_category_count >= 10
    )
    if two_mechanical_criteria_hold and magnitude > 30:
        if alignment_dominant is None:
            raise InvalidInputError(
                "the too-harsh calibration check at risk-scoring.md:76-81 is live "
                f"(zero Hard Stops, {covered_category_count} of "
                f"{_TOTAL_PROTECTION_CATEGORIES} categories Covered, total deduction "
                f"{magnitude}) but its third criterion cannot be evaluated: pass "
                "alignment_dominant=True if the findings are primarily MSA-alignment "
                "or clarification items, False if they are new unprotected exposures"
            )
        if alignment_dominant:
            raise CalibrationError(
                f"too harsh: total deduction {magnitude} exceeds 30 with zero Hard "
                f"Stops, {covered_category_count} of {_TOTAL_PROTECTION_CATEGORIES} "
                "categories Covered, and findings that are primarily alignment or "
                "clarification items. risk-scoring.md:81, the scoring is likely using "
                "the Standalone column where Governed: Covered should apply. "
                "Re-check each finding's deduction against its PASS_2_COVERAGE status"
            )

    # Too generous: risk-scoring.md:83.
    if not governing_docs_present and len(findings) >= 5 and magnitude < 25:
        raise CalibrationError(
            f"too generous: a standalone document with no governing documents and "
            f"{len(findings)} findings produced a total deduction of only {magnitude}, "
            "under the 25-point floor at risk-scoring.md:83. Every finding in a "
            "standalone document uses the Standalone column"
        )

    return ProtectionScore(
        score=score,
        raw_score=raw_score,
        band=score_band(score),
        total_deduction=total_deduction,
        hard_stop_count=hard_stop_count,
        finding_count=len(findings),
        covered_category_count=covered_category_count,
        rows=rows,
        clamped=clamped,
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

    # --- Golden: negotiation-simulator reciprocity worked example ----------
    # Source: negotiation-simulator-1c344a/SKILL.md:468, "Example: gave 3,
    # received 2 -> '3 given : 2 received, reciprocity index 0.7, state
    # UNFAVORABLE'". A true golden.
    _rec = reciprocity(3, 2)
    _check(
        "reciprocity: SKILL.md:468 worked example, gave 3 received 2 gives "
        "index 0.7 and state UNFAVORABLE",
        _rec.index == 0.7 and _rec.state == "UNFAVORABLE",
        f"got index={_rec.index}, state={_rec.state}",
    )
    _rec_states = [(reciprocity(g, r).state, reciprocity(g, r).index)
                   for g, r in ((0, 0), (2, 0), (0, 2), (2, 2))]
    _check(
        "reciprocity: all four degenerate cases the v2.3 changelog names return "
        "index=None where the source forbids a ratio, so it cannot be formatted "
        "into a misleading '0.0' or bare 'N:0'",
        _rec_states == [("NOT_APPLICABLE", None), ("POOR", None),
                        ("STRONG", None), ("BALANCED", 1.0)],
        f"got {_rec_states}",
    )

    # Anchor effectiveness, SKILL.md:472-475.
    _anc = anchor_capture(opening=10, final=15, target=20)
    _anc_price = anchor_capture(opening=100, final=80, target=60)
    _check(
        "anchor_capture: (W-Z)/(Y-Z)*100 gives 50% closed, and a DOWNWARD price "
        "target computes identically to an upward term target because the "
        "direction is carried by the sign of (Y-Z)",
        _anc.display_pct == 50.0 and _anc_price.display_pct == 50.0,
        f"got term={_anc.display_pct}, price={_anc_price.display_pct}",
    )
    _beyond = anchor_capture(opening=10, final=23, target=20)
    _check(
        "anchor_capture: the source's own named '130%-style artifact' is "
        "prevented. Raw 130% is capped to a displayed 100% with the overshoot "
        "carried separately as beyond_amount=3",
        _beyond.display_pct == 100.0 and round(_beyond.raw_pct) == 130
        and _beyond.beyond_target and _beyond.beyond_amount == 3,
        f"got display={_beyond.display_pct}, raw={_beyond.raw_pct}, "
        f"beyond={_beyond.beyond_amount}",
    )
    _zero_range = anchor_capture(opening=20, final=25, target=20)
    _check(
        "anchor_capture: opening == target returns NOT_APPLICABLE with no "
        "percentage, instead of dividing by zero (SKILL.md:474)",
        _zero_range.state == "NOT_APPLICABLE" and _zero_range.display_pct is None,
    )
    _away = anchor_capture(opening=10, final=5, target=20)
    _check(
        "anchor_capture: moving away from target displays 0% but preserves the "
        "negative raw value for the coaching note, never showing it as a "
        "positive percentage (SKILL.md:475)",
        _away.display_pct == 0.0 and _away.raw_pct == -50.0
        and _away.state == "MOVED_AWAY",
        f"got display={_away.display_pct}, raw={_away.raw_pct}",
    )

    # --- Golden: analysis-methodology.md HHI worked example ----------------
    # Source: category-strategy-1c344a/references/analysis-methodology.md:153-156,
    # "If 3 suppliers split spend 50/30/20: HHI = 50^2 + 30^2 + 20^2 = 2500 +
    # 900 + 400 = 3,800 (High)". A true golden: the source did the arithmetic.
    _hhi_golden = hhi([50, 30, 20])
    _check(
        "hhi: analysis-methodology.md worked example, 3 suppliers at 50/30/20 "
        "gives exactly 3,800 and bands as High",
        abs(_hhi_golden - 3800.0) < 1e-6 and hhi_band(_hhi_golden) == "High",
        f"got {_hhi_golden}, band {hhi_band(_hhi_golden)}",
    )
    _check(
        "hhi: a monopoly is 10,000, confirming shares are percentages not "
        "fractions (the factor-of-10,000 failure mode)",
        abs(hhi([100]) - 10000.0) < 1e-6,
        f"got {hhi([100])}",
    )
    _check(
        "hhi_band: exact boundaries per analysis-methodology.md:148-151 "
        "(1499 Low / 1500 Moderate, 2499 Moderate / 2500 High)",
        hhi_band(1499) == "Low" and hhi_band(1500) == "Moderate"
        and hhi_band(2499) == "Moderate" and hhi_band(2500) == "High",
    )

    # Pareto: the two readings of "up to 80% cumulative" differ only for the
    # supplier straddling the line. Both cases are pinned.
    _p_exact = pareto_segments([("A", 50), ("B", 30), ("C", 12), ("D", 5),
                                ("E", 2), ("F", 1)])
    _p_straddle = pareto_segments([("A", 50), ("B", 25), ("C", 25)])
    _check(
        "pareto_segments: when suppliers land exactly ON 80.0 cumulative, "
        "p80 counts only those needed to reach it (A+B = 80 exactly -> p80=2)",
        _p_exact.p80_count == 2 and _p_exact.p95_count == 4
        and _p_exact.p99_count == 5,
        f"got p80={_p_exact.p80_count}, p95={_p_exact.p95_count}, "
        f"p99={_p_exact.p99_count}",
    )
    _check(
        "pareto_segments: when the 80% line is crossed mid-supplier, that "
        "supplier IS counted, so p80 is the smallest N actually covering 80% "
        "(50/25/25 -> p80=3, cumulative 100 not 75)",
        _p_straddle.p80_count == 3,
        f"got p80={_p_straddle.p80_count}",
    )
    _p_a = pareto_segments([("v%d" % i, float(100 - i)) for i in range(20)])
    _p_b = pareto_segments([("v%d" % i, float(100 - i)) for i in reversed(range(20))])
    _check(
        "pareto_segments: ranking is input-order independent and deterministic, "
        "which the skill's own determinism guarantee requires of supplier order",
        [r.name for r in _p_a.rows] == [r.name for r in _p_b.rows],
    )

    _check(
        "cagr: (P_end/P_start)^(1/years)-1 per analysis-methodology.md:339; "
        "100 to 121 over 2 years is exactly 10%",
        abs(cagr(100, 121, 2) - 0.10) < 1e-9,
        f"got {cagr(100, 121, 2)}",
    )
    _check(
        "yoy: 88M to 95M is 7.95%, which the skill's own dashboard example "
        "carries as yoy2324 = 8.0 after rounding",
        abs(yoy(88_000_000, 95_000_000) * 100 - 7.95) < 0.01,
        f"got {yoy(88_000_000, 95_000_000) * 100}",
    )

    _tail = tail_at_threshold([1e6, 500_000, 40_000, 30_000, 10_000], 50_000)
    _check(
        "tail_at_threshold: 3 vendors below $50K totalling $80,000, and the "
        "effort-to-value band is returned as the skill's stated 8-12 hour "
        "RANGE (24-36 hours) rather than collapsed to a midpoint",
        _tail.vendor_count == 3 and _tail.tail_spend == 80_000
        and _tail.hours_low == 24 and _tail.hours_high == 36,
        f"got {_tail.vendor_count} vendors, {_tail.tail_spend}, "
        f"{_tail.hours_low}-{_tail.hours_high}h",
    )

    # --- Golden: negotiation-playbook-learning band verification -----------
    # Source: negotiation-playbook-learning-1c344a/SKILL.md:641, "Band
    # verification (single-position negotiations)", which states every one of
    # these six numbers and its band explicitly. This is a true golden test:
    # the source did the arithmetic and published the answers.
    _band_cases = [
        ("HARD_STOP_EXCEPTION", 100.0, "Very high", True),
        ("REJECTED_BY_SUPPLIER", 66.7, "High", False),
        ("ESCALATED_TO_LEGAL", 53.3, "High", False),
        ("COUNTER_ACCEPTED", 53.3, "High", False),
        ("NEGOTIATED_COMPROMISE", 33.3, "Medium", False),
        ("LILLY_FALLBACK_USED", 20.0, "Low", False),
    ]
    _band_ok = True
    _band_detail = []
    for _code, _expected, _band, _flag in _band_cases:
        _d = difficulty_score({_code: 1})
        if (abs(_d.score - _expected) > 0.05 or _d.band != _band
                or _d.leadership_flag != _flag):
            _band_ok = False
        _band_detail.append(f"{_code}={_d.score:.1f}/{_d.band}")
    _check(
        "difficulty_score: all six single-position band verifications from "
        "SKILL.md:641 reproduce exactly (HARD_STOP_EXCEPTION 100 Very high, "
        "REJECTED_BY_SUPPLIER 66.7 High, ESCALATED_TO_LEGAL and "
        "COUNTER_ACCEPTED 53.3 High, NEGOTIATED_COMPROMISE 33.3 Medium, "
        "LILLY_FALLBACK_USED 20 Low)",
        _band_ok,
        "; ".join(_band_detail),
    )
    _check(
        "difficulty_score: the >75 leadership flag fires ONLY on the "
        "exception-level case, which is what the v2.1 rescaling was for",
        difficulty_score({"HARD_STOP_EXCEPTION": 1}).leadership_flag is True
        and difficulty_score({"REJECTED_BY_SUPPLIER": 1}).leadership_flag is False,
    )
    _check(
        "difficulty_score: a negotiation where every position held scores 0 / Low "
        "(ACCEPTED_AS_IS and HARD_STOP_HELD carry weight 0)",
        difficulty_score({"ACCEPTED_AS_IS": 3, "HARD_STOP_HELD": 2}).score == 0.0,
    )
    _check(
        "difficulty_score: applicable == 0 returns None so the caller renders "
        "NEEDS_INPUT (SKILL.md:630). Returning 0 would read as 'this was easy' "
        "when nothing was measured",
        difficulty_score({"NOT_APPLICABLE": 5}) is None,
    )

    # Partition: SKILL.md:574-608, four rates over one denominator.
    _pcounts = {
        "ACCEPTED_AS_IS": 4, "ACCEPTED_WITH_MINOR_CHANGES": 2,
        "HARD_STOP_HELD": 1, "LILLY_FALLBACK_USED": 1,
        "COUNTER_ACCEPTED": 2, "REJECTED_BY_SUPPLIER": 1,
        "HARD_STOP_EXCEPTION": 1, "NEGOTIATED_COMPROMISE": 2,
        "ESCALATED_TO_SME": 1, "ESCALATED_TO_LEGAL": 1, "NOT_APPLICABLE": 3,
    }
    _part = outcome_partition(_pcounts)
    _psum = (_part.lilly_position_prevailed + _part.supplier_prevailed
             + _part.negotiated + _part.escalated)
    _check(
        "outcome_partition: the four win/loss rates sum to exactly 1.0 over a "
        "denominator that excludes NOT_APPLICABLE (SKILL.md:574, :607)",
        abs(_psum - 1.0) < 1e-9 and _part.denominator == 16,
        f"got sum={_psum}, denominator={_part.denominator}",
    )
    _check(
        "outcome_partition: strict acceptance_rate excludes fallbacks, so it is "
        "a SUBSET of lilly_position_prevailed and not a fifth partition member "
        "(SKILL.md:610)",
        _part.acceptance_rate == 7 / 16
        and _part.acceptance_rate < _part.lilly_position_prevailed,
        f"got acceptance={_part.acceptance_rate}, "
        f"lilly_prevailed={_part.lilly_position_prevailed}",
    )

    # --- level_bid: the three formulas at SKILL.md:1698-1700 ---------------
    # Source: rfp-response-analysis-1c344a/SKILL.md, inlined bid-leveling.md.
    # No worked numeric example is given in the source, so these are hand
    # calculations against the quoted formulas, labeled as such rather than
    # presented as source-verified goldens.
    _lb = level_bid(annual_recurring=120000, units=500, term_years=3, one_time=45000)
    _check(
        "level_bid: flat case matches all three quoted formulas "
        "(TCO 405000 = 120000*3+45000; per-unit 240 = 120000/500; "
        "per-unit-per-year 270 = 405000/3/500). Hand calculation, NOT a "
        "source-quoted worked example",
        _lb.reported_tco == 405000 and _lb.normalized_price_per_unit == 240
        and abs(_lb.normalized_tco_per_unit_per_year - 270) < 1e-9,
        f"got tco={_lb.reported_tco}, per_unit={_lb.normalized_price_per_unit}, "
        f"per_unit_per_year={_lb.normalized_tco_per_unit_per_year}",
    )

    # SKILL.md:1704: a stated escalator over a multi-year term MUST route
    # through escalate() per year and be summed, never the flat shorthand.
    _esc = level_bid(annual_recurring=100000, units=100, term_years=3, one_time=0,
                     escalator_pct=0.05, compounding=True, first_year_escalated=False)
    _check(
        "level_bid: a stated escalator over a multi-year term routes through "
        "escalate() per contract year and sums, per SKILL.md:1704, instead of "
        "the flat annual*term shorthand",
        [round(v, 2) for v in _esc.per_year_recurring] == [100000.0, 105000.0, 110250.0]
        and _esc.flat_shorthand_used is False,
        f"got per_year={_esc.per_year_recurring}, flat={_esc.flat_shorthand_used}",
    )
    _esc_true = level_bid(annual_recurring=100000, units=100, term_years=3, one_time=0,
                          escalator_pct=0.05, compounding=True, first_year_escalated=True)
    _check(
        "level_bid: the two first-year conventions differ by 15762.50 on a "
        "3-year 5% stack, which is why the kernel refuses to pick one silently",
        abs((_esc_true.recurring_total - _esc.recurring_total) - 15762.50) < 0.01,
        f"got delta={_esc_true.recurring_total - _esc.recurring_total}",
    )
    _simple = level_bid(annual_recurring=100000, units=100, term_years=3, one_time=0,
                        escalator_pct=0.05, compounding=False, first_year_escalated=False)
    _check(
        "level_bid: simple (non-compounding) escalation routes through "
        "escalate(compounding=False), Year N = Base * (1 + rate*N)",
        [round(v, 2) for v in _simple.per_year_recurring] == [100000.0, 105000.0, 110000.0],
        f"got {_simple.per_year_recurring}",
    )
    _one_yr = level_bid(annual_recurring=50000, units=10, term_years=1,
                        one_time=1000, escalator_pct=0.05)
    _check(
        "level_bid: an escalator on a 1-year term needs no convention and "
        "correctly uses the flat figure (no multi-year sum exists to escalate)",
        _one_yr.flat_shorthand_used and _one_yr.reported_tco == 51000,
        f"got flat={_one_yr.flat_shorthand_used}, tco={_one_yr.reported_tco}",
    )
    _var = level_bid(annual_recurring=120000, units=500, term_years=3,
                     one_time=45000, supplier_stated_total=360000)
    _check(
        "level_bid: element 7's reported-vs-normalized gap is returned as a "
        "number (45000, the one-time cost this supplier left out of its "
        "headline), so it is visible rather than absorbed",
        _var.stated_vs_computed_variance == 45000,
        f"got variance={_var.stated_vs_computed_variance}",
    )

    # --- Golden: risk-scoring.md Supplier A WO 10 worked example ----------
    # Source: lilly-contract-review-1c344a/references/risk-scoring.md:52-72,
    # "Worked Example: Supplier A WO 10 (illustrative)". All 11 rows of the
    # table are entered verbatim below with the severity, PASS_2 status and
    # deduction the source states. The source's own totals are "Total
    # deductions: -36" and "Score: 64", and :72 states that 64 sits in the
    # Moderate band. Context line :54 gives "9 of 14 protection categories
    # Covered ... Zero Hard Stops", which is what makes this example ALSO the
    # negative case for the too-harsh calibration check: at 9 Covered it is
    # below the 10+ threshold, so a -36 total must NOT raise here.
    _wo10 = [
        ScoredFinding(finding_id="1", category="Scope (N/A)", severity="HIGH",
                      coverage_status="standalone", deduction=-7),
        ScoredFinding(finding_id="2", category="SLA", severity="HIGH",
                      coverage_status="covered", deduction=-4),
        ScoredFinding(finding_id="3", category="AI Governance", severity="HIGH",
                      coverage_status="covered", deduction=-3),
        ScoredFinding(finding_id="4", category="Commitment", severity="MEDIUM",
                      coverage_status="confirm", deduction=-3),
        ScoredFinding(finding_id="5", category="IP", severity="MEDIUM",
                      coverage_status="covered", deduction=-2),
        ScoredFinding(finding_id="6", category="Pharma", severity="MEDIUM",
                      coverage_status="covered", deduction=-3),
        ScoredFinding(finding_id="7", category="Delivery (N/A)", severity="MEDIUM",
                      coverage_status="standalone", deduction=-4),
        ScoredFinding(finding_id="8", category="Commercial (N/A)", severity="MEDIUM",
                      coverage_status="standalone", deduction=-4),
        ScoredFinding(finding_id="9", category="Delivery", severity="MEDIUM",
                      coverage_status="covered", deduction=-2),
        ScoredFinding(finding_id="10", category="Commercial (N/A)", severity="LOW",
                      coverage_status="standalone", deduction=-2),
        ScoredFinding(finding_id="11", category="Scope (N/A)", severity="LOW",
                      coverage_status="standalone", deduction=-2),
    ]
    _wo10_result = deduction_score(_wo10, covered_category_count=9)
    _check(
        "deduction_score: risk-scoring.md worked example 'Supplier A WO 10' "
        "reproduces total deductions -36 and Score 64 exactly",
        _wo10_result.total_deduction == -36 and _wo10_result.score == 64,
        f"got total={_wo10_result.total_deduction}, score={_wo10_result.score}",
    )
    _check(
        "deduction_score: the same example lands in the Moderate band, "
        "matching risk-scoring.md:72 ('Score of 64 = Moderate')",
        _wo10_result.band == "Moderate",
        f"got band={_wo10_result.band}",
    )
    _check(
        "deduction_score: emits one calculation-table row per finding, which is "
        "what SKILL.md Rule 12 requires be visible for the score to be valid",
        len(_wo10_result.rows) == 11 and _wo10_result.rows[0]["column_used"] == "Standalone",
        f"got {len(_wo10_result.rows)} rows, first column_used="
        f"{_wo10_result.rows[0]['column_used'] if _wo10_result.rows else 'n/a'}",
    )

    # Hard Stop invariant: risk-scoring.md:17 puts -15 in all four columns and
    # :31 states "Hard Stops are never reduced ... always -15."
    _hs_all_columns = [
        deduction_score([ScoredFinding(severity="Hard Stop", coverage_status=_c,
                                       deduction=-15)],
                        covered_category_count=0).total_deduction
        for _c in ("standalone", "covered", "confirm", "gap")
    ]
    _check(
        "deduction_score: a Hard Stop deducts exactly -15 in ALL FOUR coverage "
        "columns (risk-scoring.md:17, :31, never reduced)",
        _hs_all_columns == [-15, -15, -15, -15],
        f"got {_hs_all_columns}",
    )

    # Scale boundaries: risk-scoring.md:37-42, four contiguous inclusive bands.
    _bands = [score_band(_s) for _s in (100, 75, 74, 50, 49, 25, 24, 0)]
    _check(
        "score_band: exact boundaries per risk-scoring.md:37-42 "
        "(75 Low / 74 Moderate, 50 Moderate / 49 High, 25 High / 24 Critical)",
        _bands == ["Low", "Low", "Moderate", "Moderate", "High", "High",
                   "Critical", "Critical"],
        f"got {_bands}",
    )

    _check(
        "deduction_score: no findings scores 100 (risk-scoring.md:11 starting point)",
        deduction_score([]).score == 100 and deduction_score([]).band == "Low",
    )

    # Calibration NEGATIVE cases: the checks must stay silent when their
    # conditions are not all met, or they would block correct scores.
    _harsh_set = [ScoredFinding(severity="HIGH", coverage_status="standalone",
                                deduction=-8) for _ in range(5)]  # -40 total
    _check(
        "deduction_score: too-harsh check does NOT fire when the third criterion "
        "is False (findings are genuine exposures, not alignment items), "
        "risk-scoring.md:79",
        deduction_score(_harsh_set, covered_category_count=12,
                        alignment_dominant=False).score == 60,
    )
    _check(
        "deduction_score: too-harsh check does NOT fire below 10 Covered "
        "categories, which is why the -36 worked example above is legal",
        deduction_score(_harsh_set, covered_category_count=9,
                        alignment_dominant=True).score == 60,
    )
    _at_30 = [ScoredFinding(severity="MEDIUM", coverage_status="covered",
                            deduction=-3) for _ in range(10)]  # exactly -30
    _check(
        "deduction_score: too-harsh check does NOT fire at exactly 30 "
        "(risk-scoring.md:76 says 'exceeds a 30-point deduction')",
        deduction_score(_at_30, covered_category_count=12,
                        alignment_dominant=True).score == 70,
    )

    # Clamping is a JUDGMENT CALL, disclosed: risk-scoring.md defines a 0-100
    # scale but does not say what happens when deductions exceed 100. The score
    # clamps at 0 and raw_score keeps the unclamped value so nothing is hidden.
    _clamped = deduction_score(
        [ScoredFinding(severity="Hard Stop", coverage_status="gap", deduction=-15)
         for _ in range(8)], covered_category_count=0)
    _check(
        "deduction_score: clamps at 0 rather than going negative, and preserves "
        "the unclamped raw_score (-20). NOT source-specified, disclosed judgment",
        _clamped.score == 0 and _clamped.raw_score == -20 and _clamped.clamped
        and _clamped.band == "Critical",
        f"got score={_clamped.score}, raw={_clamped.raw_score}, "
        f"clamped={_clamped.clamped}, band={_clamped.band}",
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






    # --- negotiation-metrics refusals --------------------------------------
    _check_raises(
        "reciprocity: refuses a negative concession count",
        lambda: reciprocity(-1, 0),
        InvalidInputError,
    )
    _check_raises(
        "anchor_capture: refuses a non-numeric issue rather than fabricating a "
        "capture percentage for it, which SKILL.md:476 explicitly prohibits",
        lambda: anchor_capture(opening="audit scope", final=1, target=2),
        InvalidInputError,
    )
    # --- concentration face refusals ---------------------------------------
    _check_raises(
        "cagr: refuses a zero or negative start value. A growth rate off a zero "
        "base is meaningless, not large, and reporting one would manufacture "
        "the phantom 'rapid growth vendor' the anomaly check exists to find",
        lambda: cagr(0, 100, 3),
        ConcentrationError,
    )
    _check_raises(
        "yoy: refuses a zero prior value, same reasoning",
        lambda: yoy(0, 100),
        ConcentrationError,
    )
    _check_raises(
        "hhi: refuses an all-zero spend distribution rather than reporting 0, "
        "which would read as perfect competition",
        lambda: hhi([0, 0]),
        ConcentrationError,
    )
    _check_raises(
        "hhi: refuses an empty supplier list",
        lambda: hhi([]),
        ConcentrationError,
    )
    _check_raises(
        "hhi: refuses negative spend",
        lambda: hhi([10, -5]),
        InvalidInputError,
    )
    _check_raises(
        "pareto_segments: refuses an empty supplier set",
        lambda: pareto_segments([]),
        ConcentrationError,
    )
    # --- outcome face refusals ---------------------------------------------
    _check_raises(
        "outcome_partition: refuses an outcome code outside the eleven the "
        "schema defines",
        lambda: outcome_partition({"MAYBE": 1}),
        OutcomeCodeError,
    )
    _check_raises(
        "outcome_partition: refuses when every position is NOT_APPLICABLE, "
        "rather than reporting four zero rates as if they were measured",
        lambda: outcome_partition({"NOT_APPLICABLE": 4}),
        InvalidInputError,
    )
    _check_raises(
        "difficulty_score: refuses a negative outcome count",
        lambda: difficulty_score({"COUNTER_ACCEPTED": -1}),
        InvalidInputError,
    )
    # --- level_bid refusals -------------------------------------------------
    _check_raises(
        "level_bid: refuses one_time=None rather than defaulting it to zero. "
        "Bid Leveling element 5, an unpriced cost is a labeled placeholder, "
        "never a silent zero, because zero flatters the least forthcoming bid",
        lambda: level_bid(annual_recurring=1, units=1, term_years=1, one_time=None),
        LevelingError,
    )
    _check_raises(
        "level_bid: refuses a multi-year escalated bid when the first-year "
        "convention is unstated. The source says call escalate() per year but "
        "never says whether year 1 is already escalated, and the gap is "
        "material to a ranking",
        lambda: level_bid(annual_recurring=1, units=1, term_years=3, one_time=0,
                          escalator_pct=0.03),
        LevelingError,
    )
    _check_raises(
        "level_bid: refuses zero units (a per-unit basis cannot be computed)",
        lambda: level_bid(annual_recurring=1, units=0, term_years=1, one_time=0),
        InvalidInputError,
    )
    _check_raises(
        "level_bid: refuses term_years < 1",
        lambda: level_bid(annual_recurring=1, units=1, term_years=0, one_time=0),
        InvalidInputError,
    )
    _check_raises(
        "level_bid: refuses a negative one_time cost",
        lambda: level_bid(annual_recurring=1, units=1, term_years=1, one_time=-5),
        InvalidInputError,
    )
    # --- deduction_score refusals ------------------------------------------
    _check_raises(
        "deduction_score: refuses a Hard Stop reduced below -15 "
        "(risk-scoring.md:31, never reduced, in any column)",
        lambda: deduction_score([ScoredFinding(severity="Hard Stop",
                                               coverage_status="covered",
                                               deduction=-10)]),
        HardStopReducedError,
    )
    _check_raises(
        "deduction_score: refuses a HIGH/Governed-Covered finding carrying -9, a "
        "Standalone-column value. This is the exact Rule 7 failure mode, the "
        "Standalone column applied to a category the MSA covers",
        lambda: deduction_score([ScoredFinding(severity="HIGH",
                                               coverage_status="covered",
                                               deduction=-9)]),
        DeductionRangeError,
    )
    _check_raises(
        "deduction_score: refuses an unknown severity ('SEVERE')",
        lambda: deduction_score([ScoredFinding(severity="SEVERE",
                                               coverage_status="gap",
                                               deduction=-5)]),
        SeverityError,
    )
    _check_raises(
        "deduction_score: refuses an unknown coverage status ('partial')",
        lambda: deduction_score([ScoredFinding(severity="HIGH",
                                               coverage_status="partial",
                                               deduction=-8)]),
        CoverageStatusError,
    )
    _check_raises(
        "deduction_score: refuses a positive deduction (this is a deduction "
        "model, not an additive score)",
        lambda: deduction_score([ScoredFinding(severity="LOW",
                                               coverage_status="covered",
                                               deduction=1)]),
        InvalidInputError,
    )
    _check_raises(
        "deduction_score: CALIBRATION 1 of 2, too harsh. Zero Hard Stops, 12 of "
        "14 Covered, alignment-dominant findings, total -40. risk-scoring.md:81",
        lambda: deduction_score(
            [ScoredFinding(severity="HIGH", coverage_status="standalone",
                           deduction=-8) for _ in range(5)],
            covered_category_count=12, alignment_dominant=True),
        CalibrationError,
    )
    _check_raises(
        "deduction_score: refuses to evaluate the too-harsh check when its third "
        "criterion is unknown, rather than assuming it. Refuse, do not guess",
        lambda: deduction_score(
            [ScoredFinding(severity="HIGH", coverage_status="standalone",
                           deduction=-8) for _ in range(5)],
            covered_category_count=12),
        InvalidInputError,
    )
    _check_raises(
        "deduction_score: CALIBRATION 2 of 2, too generous. Standalone document, "
        "no governing docs, 5 findings, total only -10 against the 25-point "
        "floor at risk-scoring.md:83. This is the more dangerous direction, "
        "because a flattering score does not invite scrutiny",
        lambda: deduction_score(
            [ScoredFinding(severity="LOW", coverage_status="standalone",
                           deduction=-2) for _ in range(5)],
            governing_docs_present=False),
        CalibrationError,
    )
    _check_raises(
        "deduction_score: refuses a Governed column on a document with no "
        "governing documents (risk-scoring.md:83, every finding in a standalone "
        "document uses the Standalone column)",
        lambda: deduction_score([ScoredFinding(severity="HIGH",
                                               coverage_status="covered",
                                               deduction=-4)],
                                governing_docs_present=False),
        CoverageStatusError,
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
