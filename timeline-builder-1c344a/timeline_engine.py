"""
timeline_engine.py
===================

Stdlib-only reference kernel for the "timeline-builder-1c344a" Claude Skill
(SKILL.md, Version 1.1, June 2, 2026).

This module is a literal re-implementation of the critical-path math described
in SKILL.md's "Defaults" and "Workflow" sections (Steps 2-5). Every table,
formula, and worked number below is copied from SKILL.md; none are invented.
Line references are to the copy of SKILL.md read on 2026-07-20/21 in:
  .../timeline-builder-1c344a/SKILL.md

WHY THIS EXISTS (v1.1 changelog, quoted from SKILL.md line 134):
  "Estimation-model correction. The complexity tier no longer multiplies phase
  durations that already encode complexity (that double-count produced 3-6x
  inflation); the tier now maps to a small, interpolated unmodeled-friction
  factor (1.00-1.25) applied once to the critical-path base only. Parallel risk
  reviews and onboarding combine with a single rule (max, never sum). The
  output range now propagates per-phase Low/Base/High through the same
  critical-path logic instead of a flat plus or minus 20%. Calibration derives
  a single domain scale factor applied to all defaults. Added a worked
  end-to-end example and a single-effort sanity-ceiling self-check (~78 weeks)."

This kernel exists so that logic can be unit-tested outside the chat
environment, and so the exact regression this skill was built to prevent
(the v1.0 double-count bug) has a standing automated check.
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Enumerations for the finite-choice inputs (SKILL.md Step 1 pickers)
# ---------------------------------------------------------------------------

class SourcingType(Enum):
    NONE = "none"                 # direct buy
    RFI_ONLY = "rfi_only"
    RFQ = "rfq"
    RFP = "rfp"                   # full, 4-6 suppliers, mid complexity
    MULTI_STAGE = "multi_stage"   # RFI then RFP


class Instrument(Enum):
    PO_TCS = "po_tcs"
    SHORT_FORM = "short_form"
    SOW_EXISTING_MSA = "sow_existing_msa"
    SOW_MSA_AMENDMENT = "sow_msa_amendment"
    NEW_MSA = "new_msa"
    MASTER_AGREEMENT_AMENDMENT = "master_agreement_amendment"


class ReviewType(Enum):
    TPRM = "tprm"
    SAE = "sae"
    PRIVACY = "privacy"
    AIR = "air"


class PilotType(Enum):
    NONE = "none"
    SHALLOW = "shallow"   # shallow eval
    MEDIUM = "medium"     # medium pilot
    DEEP = "deep"         # deep PoC, 3-6 months


# ---------------------------------------------------------------------------
# Baked-in default tables, copied verbatim from SKILL.md "Defaults" section.
# Each tuple is (Low, Base, High) in calendar weeks.
# ---------------------------------------------------------------------------

# "Sourcing phase" table (SKILL.md lines 217-223)
SOURCING_TABLE: Dict[SourcingType, Tuple[float, float, float]] = {
    SourcingType.NONE: (0, 0, 0),
    SourcingType.RFI_ONLY: (3, 4, 5),
    SourcingType.RFQ: (4, 5, 6),
    SourcingType.RFP: (8, 11, 14),
    SourcingType.MULTI_STAGE: (10, 14, 18),
}

# "Negotiation phase by contract instrument" table (SKILL.md lines 227-234).
# NOTE on the "(Base overridden by calibration QN)" annotations: in the
# source markdown table these annotations are typographically attached to
# the High column cell (e.g. "8 (Base overridden by calibration Q1)"), but
# the surrounding prose ("Direct override of the three matching negotiation
# rows... The user's number replaces the baked-in Average for that row",
# line 195) makes clear it is the BASE value, not High, that calibration
# replaces. Low and High stay at the baked-in defaults below. This is an
# ambiguous formatting artifact, documented again in MAINTENANCE.md.
NEGOTIATION_TABLE: Dict[Instrument, Tuple[float, float, float]] = {
    Instrument.PO_TCS: (2, 3, 4),
    Instrument.SHORT_FORM: (4, 6, 8),
    Instrument.SOW_EXISTING_MSA: (4, 6, 8),
    Instrument.SOW_MSA_AMENDMENT: (8, 10, 12),
    Instrument.NEW_MSA: (14, 20, 26),
    Instrument.MASTER_AGREEMENT_AMENDMENT: (4, 6, 8),
}

# Baked-in averages that Q1/Q2/Q3 respectively override (SKILL.md line 199:
# "6, 20, 10 are the baked-in averages for those three rows").
CALIBRATION_BASELINE_AVERAGES = {
    "Q1_sow_existing_msa": 6.0,
    "Q2_new_msa": 20.0,
    "Q3_sow_msa_amendment": 10.0,
}

# Instruments the three calibration questions can directly override
# (SKILL.md line 195: "Q1 = SOW under existing MSA; Q2 = New MSA full
# negotiation; Q3 = SOW with MSA amendment").
CALIBRATION_ELIGIBLE_INSTRUMENTS = {
    Instrument.SOW_EXISTING_MSA: "Q1_sow_existing_msa",
    Instrument.NEW_MSA: "Q2_new_msa",
    Instrument.SOW_MSA_AMENDMENT: "Q3_sow_msa_amendment",
}

# Default redline-turn counts when unknown (SKILL.md line 360: "If turn
# count is unknown, default to the instrument's typical (PO/short-form = 1,
# SOW = 2, New MSA = 3) and label it assumed.")
# NOTE: SKILL.md does not state a default for "Master agreement amendment".
# We default it to 2 (treated like the SOW rows) as a judgment call; this is
# an unstated case and is flagged again in MAINTENANCE.md.
DEFAULT_REDLINE_TURNS: Dict[Instrument, int] = {
    Instrument.PO_TCS: 1,
    Instrument.SHORT_FORM: 1,
    Instrument.SOW_EXISTING_MSA: 2,
    Instrument.SOW_MSA_AMENDMENT: 2,
    Instrument.NEW_MSA: 3,
    Instrument.MASTER_AGREEMENT_AMENDMENT: 2,  # judgment call, not in SKILL.md
}

# "Redline turns" table (SKILL.md lines 258-261): per-turn Low/Base/High.
PER_TURN_ROW: Tuple[float, float, float] = (1.5, 2.25, 3.0)

# "Risk reviews" table (SKILL.md lines 238-244).
REVIEW_TABLE: Dict[ReviewType, Tuple[float, float, float]] = {
    ReviewType.TPRM: (2, 3, 4),
    ReviewType.SAE: (4, 15, 26),
    ReviewType.PRIVACY: (4, 8, 12),
    ReviewType.AIR: (4, 8, 12),
}

# "Concurrent work that overlaps negotiation" table (SKILL.md lines 249-254).
ONBOARDING_ROW: Tuple[float, float, float] = (3, 4, 5)

PILOT_TABLE: Dict[PilotType, Tuple[float, float, float]] = {
    PilotType.NONE: (0, 0, 0),
    PilotType.SHALLOW: (2, 2.5, 3),
    PilotType.MEDIUM: (5, 7.5, 10),
    PilotType.DEEP: (14, 20, 26),
}

# Sanity-ceiling constant (SKILL.md Step 4b / Rule 9): "~78 weeks (18 months)".
SANITY_CEILING_WEEKS = 78.0

# Domain scale factor clamp bounds (SKILL.md line 200: "K = clamp(K_raw, 0.6, 1.8)").
K_MIN, K_MAX = 0.6, 1.8

# Deal-size threshold for ATC/ATS routing (SKILL.md lines 287-288).
DEAL_SIZE_THRESHOLD_USD = 15_000_000.0


# ---------------------------------------------------------------------------
# Low/Base/High vector with the exact arithmetic the model needs: add, scale
# by a scalar, and combine several vectors with max() (never sum). Doing the
# whole calculation "three times... on Low, Base, and High" (SKILL.md line
# 356) via one vector type is what guarantees Low/High are propagated through
# the SAME critical-path logic as Base, per Step 5 / Rule 4, instead of a
# flat +/-20% band bolted on afterward.
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class LBH:
    low: float
    base: float
    high: float

    def __add__(self, other: "LBH | float") -> "LBH":
        if isinstance(other, LBH):
            return LBH(self.low + other.low, self.base + other.base, self.high + other.high)
        return LBH(self.low + other, self.base + other, self.high + other)

    __radd__ = __add__

    def __mul__(self, factor: float) -> "LBH":
        return LBH(self.low * factor, self.base * factor, self.high * factor)

    __rmul__ = __mul__

    @staticmethod
    def max_of(*items: "LBH") -> "LBH":
        """The ONE combine rule for everything concurrent (SKILL.md Rule 3 /
        Step 3b): max, per column, never sum."""
        if not items:
            return LBH(0.0, 0.0, 0.0)
        return LBH(
            max(i.low for i in items),
            max(i.base for i in items),
            max(i.high for i in items),
        )

    def rounded(self) -> "LBH":
        """Step 5: 'Round each to the nearest week.'"""
        return LBH(round(self.low), round(self.base), round(self.high))

    def as_tuple(self) -> Tuple[float, float, float]:
        return (self.low, self.base, self.high)


# ---------------------------------------------------------------------------
# Facts: the typed input structure.
# ---------------------------------------------------------------------------

@dataclass
class Facts:
    # --- request / instrument type ---
    sourcing_type: SourcingType = SourcingType.NONE
    instrument: Instrument = Instrument.PO_TCS

    # --- complexity signals (Step 2 scoring inputs, SKILL.md lines 340-349) ---
    new_supplier: bool = False
    triggered_reviews: List[ReviewType] = field(default_factory=list)  # "whether parallel reviews apply"
    rfp_4_plus_suppliers: bool = False
    cross_functional_stakeholders_3plus: bool = False
    confidentiality: Optional[str] = None      # "red" | "orange" | None
    heavy_redlines_flagged: bool = False
    pilot_type: PilotType = PilotType.NONE     # also feeds scoring ("Pilot/PoC requested -> +1")

    # Direct override of the computed score (rare; normally leave None so
    # compute_complexity_score derives it from the signals above).
    complexity_score_override: Optional[int] = None

    # --- redline turns (sequential round-trip work, SKILL.md line 360) ---
    redline_turns: Optional[int] = None  # None => use instrument default, label "assumed"

    # --- calibration scale factor (Calibration section, SKILL.md lines 193-203) ---
    K: float = 1.0
    # Direct per-instrument Base overrides from the three calibration
    # questions (only SOW_EXISTING_MSA / NEW_MSA / SOW_MSA_AMENDMENT are
    # eligible - SKILL.md line 195).
    calibration_overrides: Dict[Instrument, float] = field(default_factory=dict)

    # --- ATC/ATS deal size for approval-chain routing (SKILL.md lines 287-288) ---
    deal_size_usd: Optional[float] = None  # None => default under $15M, label "assumed"


# ---------------------------------------------------------------------------
# Calibration: derive K from the three-question first-run prompt.
# (SKILL.md "Deriving the domain scale factor", lines 193-203.)
# ---------------------------------------------------------------------------

def derive_domain_scale_factor(q1_weeks: float, q2_weeks: float, q3_weeks: float) -> float:
    """
    K_raw = mean( Q1/6 , Q2/20 , Q3/10 )   # 6, 20, 10 are baked-in averages
    K     = clamp(K_raw, 0.6, 1.8)
    (SKILL.md lines 199-200, quoted verbatim as the docstring formula.)
    """
    k_raw = statistics.mean([
        q1_weeks / CALIBRATION_BASELINE_AVERAGES["Q1_sow_existing_msa"],
        q2_weeks / CALIBRATION_BASELINE_AVERAGES["Q2_new_msa"],
        q3_weeks / CALIBRATION_BASELINE_AVERAGES["Q3_sow_msa_amendment"],
    ])
    return min(max(k_raw, K_MIN), K_MAX)


def calibration_overrides_from_answers(q1_weeks: float, q2_weeks: float, q3_weeks: float) -> Dict[Instrument, float]:
    """Direct override of the three matching negotiation rows' BASE value
    (SKILL.md line 195). Low/High for these rows stay at baked-in defaults
    per NEGOTIATION_TABLE and are NOT scaled by K (see the ambiguity note on
    NEGOTIATION_TABLE above and in MAINTENANCE.md)."""
    return {
        Instrument.SOW_EXISTING_MSA: q1_weeks,
        Instrument.NEW_MSA: q2_weeks,
        Instrument.SOW_MSA_AMENDMENT: q3_weeks,
    }


# ---------------------------------------------------------------------------
# Step 2: complexity score -> friction factor (SKILL.md lines 338-352, 262-281)
# ---------------------------------------------------------------------------

def compute_complexity_score(facts: Facts) -> int:
    """SKILL.md lines 340-349, the exact scoring rules:
        New MSA -> +2
        New supplier -> +2
        Each risk review needed (TPRM, SAE, Privacy, AIR) -> +1
        RFP with 4+ suppliers -> +1
        3+ cross-functional stakeholders -> +1
        Confidentiality: Red -> +2, Orange -> +1
        Heavy supplier redlines flagged -> +1
        Pilot / PoC requested -> +1
    """
    if facts.complexity_score_override is not None:
        return facts.complexity_score_override

    score = 0
    if facts.instrument is Instrument.NEW_MSA:
        score += 2
    if facts.new_supplier:
        score += 2
    score += len(facts.triggered_reviews)  # each triggered review -> +1
    if facts.rfp_4_plus_suppliers:
        score += 1
    if facts.cross_functional_stakeholders_3plus:
        score += 1
    if facts.confidentiality == "red":
        score += 2
    elif facts.confidentiality == "orange":
        score += 1
    if facts.heavy_redlines_flagged:
        score += 1
    if facts.pilot_type is not PilotType.NONE:
        score += 1
    return score


def friction(score: int) -> float:
    """SKILL.md line 269 (verbatim):
        friction(score) = clamp( 1.00 + 0.025 * max(0, score) , 1.00 , 1.25 )
    This is the ENTIRE fix for the v1.0 bug: a small, continuously
    interpolated factor, applied once, instead of a discrete 2x/4x tier
    multiplier re-applied on top of phases that already encode complexity.
    """
    return min(max(1.00 + 0.025 * max(0, score), 1.00), 1.25)


def tier_label(score: int) -> str:
    """Display-only tier label (SKILL.md reference table, lines 274-279).
    The math never uses this; only friction(score) does (line 281)."""
    if score <= 2:
        return "Quick"
    if score <= 5:
        return "Standard"
    if score <= 9:
        return "Complex"
    return "Major"


# ---------------------------------------------------------------------------
# Step 3: build the critical-path base, on Low/Base/High simultaneously.
# ---------------------------------------------------------------------------

def sourcing_row(facts: Facts) -> LBH:
    """Sequential, precedes negotiation (SKILL.md line 382). Scaled by K
    (sourcing is never a calibration-overridden row)."""
    return LBH(*SOURCING_TABLE[facts.sourcing_type]) * facts.K


def negotiation_row(facts: Facts) -> Tuple[LBH, bool]:
    """Selected contract-instrument row, with the calibration override
    applied to Base only when this instrument is one of the three eligible
    rows AND the caller supplied an override (SKILL.md lines 195, 231-233).
    Overridden rows are excluded from K-scaling entirely (line 203: "Do NOT
    apply K to the three directly-overridden rows") - see MAINTENANCE.md for
    why this is an interpretive call for Low/High.
    """
    low, base, high = NEGOTIATION_TABLE[facts.instrument]
    overridden = facts.instrument in facts.calibration_overrides
    if overridden:
        base = facts.calibration_overrides[facts.instrument]
        return LBH(low, base, high), True
    return LBH(low, base, high) * facts.K, False


def redline_addition(facts: Facts) -> Tuple[LBH, int, bool]:
    """SKILL.md line 360: negotiation += (expected turns) * (per-turn row).
    Per-turn row IS K-scaled (line 203 explicitly lists 'per-turn redline'
    among the K-scaled defaults)."""
    turns_assumed = facts.redline_turns is None
    turns = facts.redline_turns if facts.redline_turns is not None else DEFAULT_REDLINE_TURNS[facts.instrument]
    per_turn = LBH(*PER_TURN_ROW) * facts.K
    return per_turn * turns, turns, turns_assumed


def longest_triggered_review(facts: Facts) -> LBH:
    """SKILL.md line 245: 'take max across them... NEVER sum reviews.'"""
    rows = [LBH(*REVIEW_TABLE[r]) * facts.K for r in facts.triggered_reviews]
    return LBH.max_of(*rows) if rows else LBH(0.0, 0.0, 0.0)


def onboarding_row(facts: Facts) -> LBH:
    if not facts.new_supplier:
        return LBH(0.0, 0.0, 0.0)
    return LBH(*ONBOARDING_ROW) * facts.K


def pilot_row(facts: Facts) -> LBH:
    return LBH(*PILOT_TABLE[facts.pilot_type]) * facts.K


def concurrent_band(negotiation_total: LBH, review: LBH, onboarding: LBH, pilot: LBH) -> LBH:
    """SKILL.md lines 366-371, the ONE combine rule for everything
    concurrent with negotiation: risk reviews (max across triggered
    reviews), new-supplier onboarding, and a pilot. max(), never sum()."""
    return LBH.max_of(negotiation_total, review, onboarding, pilot)


def sequential_lilly_phases(facts: Facts) -> Tuple[float, float, bool]:
    """SKILL.md lines 285-289, 398: ATC/ATS + execution, added AFTER
    friction, never scaled by friction or K. Returns (atc_ats, execution,
    deal_size_assumed)."""
    if facts.deal_size_usd is None:
        return 2.0, 1.0, True  # "default to 2 and label it assumed"
    atc_ats = 4.0 if facts.deal_size_usd >= DEAL_SIZE_THRESHOLD_USD else 2.0
    return atc_ats, 1.0, False


# ---------------------------------------------------------------------------
# Result container
# ---------------------------------------------------------------------------

@dataclass
class TimelineResult:
    score: int
    tier: str
    friction_factor: float
    K: float

    sourcing: LBH
    negotiation: LBH               # includes redline turns
    concurrent_band: LBH
    critical_path_base: LBH        # sourcing + concurrent_band, BEFORE friction
    core: LBH                      # critical_path_base * friction, ONCE

    atc_ats_weeks: float
    execution_weeks: float

    total: LBH                     # core + atc_ats + execution, unrounded
    total_rounded: LBH

    turns_used: int
    turns_assumed: bool
    deal_size_assumed: bool
    negotiation_base_overridden: bool

    sanity_ceiling_tripped: bool    # total.base > ~78 weeks (Step 4b)


class DoubleCountRegressionError(AssertionError):
    """Raised if a total ever exceeds critical_path_base*1.25 + unscaled
    sequential additions - i.e. exactly the v1.0 double-count inflation
    bug this kernel exists to prevent."""


def sanity_guard(critical_path_base_value: float, sequential_total: float, candidate_total: float) -> bool:
    """The literal mechanism requested by spec: total must never exceed
    (parallel-max critical-path base) x 1.25 plus the unscaled sequential
    additions. Returns True if candidate_total passes."""
    ceiling = critical_path_base_value * 1.25 + sequential_total
    return candidate_total <= ceiling + 1e-6


# ---------------------------------------------------------------------------
# compute_timeline: the full Steps 3-5 critical-path calculation.
# ---------------------------------------------------------------------------

def compute_timeline(facts: Facts) -> TimelineResult:
    score = compute_complexity_score(facts)
    fr = friction(score)
    tier = tier_label(score)

    src = sourcing_row(facts)

    neg_row, neg_overridden = negotiation_row(facts)
    turn_add, turns_used, turns_assumed = redline_addition(facts)
    negotiation_total = neg_row + turn_add  # sequential round-trip work (line 256)

    review = longest_triggered_review(facts)
    onboarding = onboarding_row(facts)
    pilot = pilot_row(facts)

    band = concurrent_band(negotiation_total, review, onboarding, pilot)

    critical_path_base = src + band  # Step 3c (line 379): sourcing + concurrent_band

    core = critical_path_base * fr   # Step 3d (line 387): friction applied ONCE, to base_path only

    atc_ats, execution, deal_assumed = sequential_lilly_phases(facts)
    sequential_total = atc_ats + execution

    total = core + sequential_total  # Step 4 (line 395): total = core + atc_ats + execution

    # --- Regression guard: the exact double-count bug detector requested. ---
    if not sanity_guard(critical_path_base.base, sequential_total, total.base):
        raise DoubleCountRegressionError(
            f"total.base={total.base:.2f} exceeds critical_path_base.base*1.25 "
            f"+ sequential_total = {critical_path_base.base * 1.25 + sequential_total:.2f}. "
            "This is exactly the v1.0 double-count regression (a tier multiplier "
            "re-applied on top of phases that already encode complexity, or a "
            "parallel band summed instead of max-ed)."
        )

    # --- Sanity-ceiling self-check (Step 4b / Rule 9): ~78-week base ceiling. ---
    ceiling_tripped = total.base > SANITY_CEILING_WEEKS

    return TimelineResult(
        score=score, tier=tier, friction_factor=fr, K=facts.K,
        sourcing=src, negotiation=negotiation_total, concurrent_band=band,
        critical_path_base=critical_path_base, core=core,
        atc_ats_weeks=atc_ats, execution_weeks=execution,
        total=total, total_rounded=total.rounded(),
        turns_used=turns_used, turns_assumed=turns_assumed,
        deal_size_assumed=deal_assumed,
        negotiation_base_overridden=neg_overridden,
        sanity_ceiling_tripped=ceiling_tripped,
    )


# ---------------------------------------------------------------------------
# naive_old_buggy_total: reproduces the v1.0 bug ON PURPOSE, for regression
# testing only. NEVER call this from application code.
#
# Source for the exact shape of the bug (SKILL.md's own worked-example
# comparison, lines 473):
#   "Compare to the OLD v1.0 math, which summed the same factors then
#   multiplied by the discrete x2.0 'Complex' tier:
#   (11 + 26.75 + 15) * 2.0 + 5 = 110.5 weeks"
# and the discrete-tier table implied by SKILL.md line 266:
#   "the old discrete 0.75 -> 1.0 -> 2.0 -> 4.0 jumps caused large estimate
#   discontinuities"
# mapped onto the same score bands as tier_label (0-2 / 3-5 / 6-9 / 10+).
#
# NOTE: this old-math formula, exactly as SKILL.md states it, sums only
# (sourcing + negotiation-with-turns + longest-review) - it does NOT include
# onboarding or pilot, even though those are part of the v1.1 concurrent
# band. That is a literal reading of the one comparison sentence SKILL.md
# gives us; SKILL.md does not show what v1.0 did with onboarding/pilot. This
# is flagged again in MAINTENANCE.md as an ambiguity.
# ---------------------------------------------------------------------------

def _old_discrete_tier_multiplier(score: int) -> float:
    if score <= 2:
        return 0.75
    if score <= 5:
        return 1.0
    if score <= 9:
        return 2.0
    return 4.0


def naive_old_buggy_total_base(facts: Facts) -> float:
    score = compute_complexity_score(facts)
    tier_mult = _old_discrete_tier_multiplier(score)

    sourcing_base = SOURCING_TABLE[facts.sourcing_type][1]
    neg_low, neg_base, neg_high = NEGOTIATION_TABLE[facts.instrument]
    turns = facts.redline_turns if facts.redline_turns is not None else DEFAULT_REDLINE_TURNS[facts.instrument]
    negotiation_base_total = neg_base + turns * PER_TURN_ROW[1]

    if facts.triggered_reviews:
        review_base = max(REVIEW_TABLE[r][1] for r in facts.triggered_reviews)
    else:
        review_base = 0.0

    summed = sourcing_base + negotiation_base_total + review_base  # BUG: sum, not max-band
    atc_ats = 4.0 if (facts.deal_size_usd or 0) >= DEAL_SIZE_THRESHOLD_USD else 2.0
    return summed * tier_mult + atc_ats + 1.0  # BUG: tier re-multiplies already-complex phases


# ---------------------------------------------------------------------------
# Self-test / self-check block
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    passed = 0
    failed = 0

    def check(name: str, condition: bool, detail: str = "") -> None:
        global passed, failed
        status = "PASS" if condition else "FAIL"
        if condition:
            passed += 1
        else:
            failed += 1
        print(f"[{status}] {name}" + (f" -- {detail}" if detail else ""))

    print("=" * 78)
    print("TEST 1: Golden worked example reproduced from SKILL.md (lines 458-471)")
    print("=" * 78)
    print(
        "Source quote: 'Request: a NEW supplier, NEW MSA (full negotiation), full\n"
        "RFP (5 suppliers), SAE and Privacy reviews both triggered, no pilot, deal\n"
        "at $18M, 3 expected redline turns. User has NOT calibrated, so K = 1.0.'\n"
        "Expected result line (SKILL.md line 471):\n"
        "  'ESTIMATED TIMELINE: 36-63 weeks (best estimate ~49 weeks)'\n"
    )

    golden_facts = Facts(
        sourcing_type=SourcingType.RFP,
        instrument=Instrument.NEW_MSA,
        new_supplier=True,
        triggered_reviews=[ReviewType.SAE, ReviewType.PRIVACY],
        rfp_4_plus_suppliers=True,
        redline_turns=3,
        deal_size_usd=18_000_000,
        K=1.0,
    )
    golden = compute_timeline(golden_facts)

    print(f"  Complexity score computed: {golden.score} (SKILL.md says 7)")
    print(f"  Tier label: {golden.tier} (SKILL.md says 'Complex')")
    print(f"  friction(score): {golden.friction_factor:.3f} (SKILL.md says 1.175)")
    print(f"  Negotiation (incl. turns), Base: {golden.negotiation.base:.2f} (SKILL.md says 26.75)")
    print(f"  Concurrent band, Base: {golden.concurrent_band.base:.2f} (SKILL.md says 26.75)")
    print(f"  Critical-path base, Base: {golden.critical_path_base.base:.2f} (SKILL.md says 37.75)")
    print(f"  Core (after friction), Base: {golden.core.base:.2f} (SKILL.md says 44.4)")
    print(f"  ATC/ATS: {golden.atc_ats_weeks} weeks (deal >= $15M -> 4)")
    print(
        f"  TOTAL Low/Base/High (unrounded): "
        f"{golden.total.low:.2f} / {golden.total.base:.2f} / {golden.total.high:.2f}"
    )
    print(
        f"  TOTAL Low/Base/High (rounded):   "
        f"{golden.total_rounded.low:.0f} / {golden.total_rounded.base:.0f} / {golden.total_rounded.high:.0f}"
        f"  (SKILL.md says 36 / 49 / 63)"
    )

    check("score == 7", golden.score == 7)
    check("friction == 1.175", abs(golden.friction_factor - 1.175) < 1e-9)
    check("negotiation base == 26.75", abs(golden.negotiation.base - 26.75) < 1e-9)
    check("concurrent_band base == 26.75", abs(golden.concurrent_band.base - 26.75) < 1e-9)
    check("critical_path_base base == 37.75", abs(golden.critical_path_base.base - 37.75) < 1e-9)
    # 37.75 * 1.175 = 44.35625 exactly; SKILL.md line 464 displays this
    # rounded to one decimal as "44.4". Check the exact value and the
    # SKILL.md-displayed rounding both.
    check("core base == 37.75 * 1.175 exactly (44.35625)", abs(golden.core.base - 44.35625) < 1e-9)
    check("core base rounds to SKILL.md's displayed 44.4", round(golden.core.base, 1) == 44.4)
    check("rounded total == 36 / 49 / 63", golden.total_rounded.as_tuple() == (36.0, 49.0, 63.0))
    check("sanity ceiling NOT tripped (49 and 63 are both under ~78)", not golden.sanity_ceiling_tripped)

    print()
    print("=" * 78)
    print("TEST 2: Regression guard against the v1.0 double-count bug")
    print("        (using SKILL.md's OWN comparison, line 473)")
    print("=" * 78)
    print(
        "Source quote: 'Compare to the OLD v1.0 math, which summed the same\n"
        "factors then multiplied by the discrete x2.0 \"Complex\" tier:\n"
        "(11 + 26.75 + 15) * 2.0 + 5 = 110.5 weeks... The v1.0 number was ~2.2x\n"
        "larger and breached the sanity ceiling.'\n"
    )
    old_total = naive_old_buggy_total_base(golden_facts)
    print(f"  naive_old_buggy_total_base(golden_facts) = {old_total:.2f} (SKILL.md says 110.5)")
    ratio = old_total / golden.total.base
    print(f"  old / new ratio = {ratio:.3f}x (SKILL.md says '~2.2x larger')")

    check("naive old-buggy total == 110.5 (matches SKILL.md exactly)", abs(old_total - 110.5) < 1e-9)
    check(
        "corrected total.base (~49.4) does NOT reproduce the old inflated 110.5",
        abs(golden.total.base - old_total) > 50,
        detail=f"corrected={golden.total.base:.2f}, old-buggy={old_total:.2f}",
    )
    check("old/new ratio ~= 2.2x, matching SKILL.md's stated comparison", abs(ratio - 2.2) < 0.1)
    check(
        "corrected total.base passes the double-count guard "
        "(<= critical_path_base*1.25 + sequential)",
        sanity_guard(golden.critical_path_base.base, golden.atc_ats_weeks + golden.execution_weeks, golden.total.base),
    )
    check(
        "the OLD buggy total FAILS that same guard (proves the guard would "
        "have caught the original bug)",
        not sanity_guard(golden.critical_path_base.base, golden.atc_ats_weeks + golden.execution_weeks, old_total),
    )

    print()
    print("-" * 78)
    print("TEST 2b: A higher-complexity case landing inside the changelog's stated")
    print('         "3-6x inflation" band (v1.1 changelog, line 134), built purely')
    print("         from SKILL.md's own tables pushed into the 'Major' tier (score")
    print("         10+, SKILL.md line 279) where the old discrete multiplier is 4.0")
    print("         (SKILL.md line 266: '...0.75 -> 1.0 -> 2.0 -> 4.0 jumps').")
    print("-" * 78)

    major_facts = Facts(
        sourcing_type=SourcingType.RFP,                 # 11 (base) - SKILL.md line 222
        instrument=Instrument.NEW_MSA,                   # 20 (base) - SKILL.md line 233
        new_supplier=True,                               # +2 score, 4wk onboarding row
        triggered_reviews=[ReviewType.TPRM, ReviewType.SAE, ReviewType.PRIVACY, ReviewType.AIR],
        rfp_4_plus_suppliers=True,                        # +1 score
        cross_functional_stakeholders_3plus=True,         # +1 score
        redline_turns=None,                               # defaults to 3 for New MSA (assumed)
        deal_size_usd=18_000_000,
        K=1.0,
    )
    major = compute_timeline(major_facts)
    old_major = naive_old_buggy_total_base(major_facts)
    major_ratio = old_major / major.total.base

    print(f"  score = {major.score} (>= 10 -> tier 'Major', SKILL.md line 279)")
    print(f"  friction = {major.friction_factor:.3f} (capped at 1.25, SKILL.md line 269)")
    print(f"  corrected total.base = {major.total.base:.2f}")
    print(f"  naive_old_buggy_total_base = {old_major:.2f} (old discrete multiplier = 4.0)")
    print(f"  old / new ratio = {major_ratio:.2f}x")

    check("score >= 10 (tier 'Major')", major.score >= 10)
    check("friction capped at 1.25", abs(major.friction_factor - 1.25) < 1e-9)
    check(
        "old/new ratio falls within the changelog's stated 3-6x inflation band",
        3.0 <= major_ratio <= 6.0,
        detail=f"ratio={major_ratio:.2f}x",
    )
    check(
        "corrected implementation does not reproduce the inflated old total",
        abs(major.total.base - old_major) > (old_major * 0.5),
    )

    print()
    print("=" * 78)
    print("TEST 3: Parallel phases combine via max(), never sum() (Rule 3, line 492)")
    print("=" * 78)
    print(
        "Using the golden example's own concurrent-band inputs (Base column):\n"
        "  negotiation(incl. turns) = 26.75, longest review (SAE) = 15,\n"
        "  onboarding (new supplier) = 4, pilot = 0.\n"
    )
    band_inputs_base = (golden.negotiation.base, 15.0, 4.0, 0.0)
    correct_band = max(band_inputs_base)
    naive_summed_band = sum(band_inputs_base)

    print(f"  CORRECT (max):        {correct_band:.2f}  (SKILL.md line 462 says 26.75)")
    print(f"  WRONG-IF-SUMMED (sum): {naive_summed_band:.2f}")
    print(f"  Engine's actual concurrent_band.base: {golden.concurrent_band.base:.2f}")

    check("engine's concurrent_band.base uses max(), == 26.75", abs(golden.concurrent_band.base - 26.75) < 1e-9)
    check(
        "max-based band is materially smaller than a summed band would be "
        "(before/after comparison)",
        correct_band < naive_summed_band,
        detail=f"max={correct_band:.2f} vs sum={naive_summed_band:.2f}",
    )
    check("engine does NOT match the (wrong) summed band", abs(golden.concurrent_band.base - naive_summed_band) > 1e-6)

    print()
    print("=" * 78)
    print(f"SUMMARY: {passed} passed, {failed} failed")
    print("=" * 78)
    if failed:
        raise SystemExit(1)
