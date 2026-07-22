"""
tier_kernel.py
Legal Negotiation Prep (legal-negotiation-prep-1c344a) - Tier Assignment Decision Kernel

Stdlib-only Python module implementing the "Tier Assignment Decision Tree" that
legal-negotiation-prep-1c344a/SKILL.md already specifies in prose (inlined
"Fallback Strategy & Concession Sequencing Guide" -> "Tier Assignment Decision
Tree" section, read together with the Phase 2 tier table, "For every playbook
section relevant to this contract type, classify into one of four tiers").
Every test, threshold, and override below is copied from that section, not
re-derived or invented. This is a NON-NUMERIC DECISION kernel: it replaces
model judgment about which of the skill's own four tiers a position belongs
in with a deterministic, testable, auditable decision.

The skill's own four tiers (verbatim labels from the Phase 2 tier table):
  Tier 1  RED LINE          - Hold absolutely. No concession.
  Tier 2  HOLD FIRM         - Defend vigorously. Fallback only under pressure + approval.
  Tier 3  STRATEGIC TRADE   - Prepared to move to fallback. Trading chip for Tier 2.
  Tier 4  EASY CONCEDE      - Concede early to build goodwill.

Refuse rather than guess: this kernel takes STRUCTURED per-position attributes
(the attributes Claude classifies while reading the playbook, supplier
history, and any compliance findings) and returns one of the four tier
constants, OR the REVIEW constant when a required attribute for the next test
in the tree is missing. A REVIEW result names exactly which attribute is
missing so the caller can gather it and re-run, rather than the kernel
silently defaulting a missing acceptance rate, a missing Hard Stop flag, or a
missing fallback-availability flag to some assumed value. This mirrors
numeric_kernel.py's "refuse rather than guess" principle (raising a typed
exception rather than silently defaulting or estimating) and the suite's
ground+confidence+abstain rule.

Two places in the decision tree's own text are NOT fully determined by the
tree as written, because applying them literally would conflict with the
tier table's own stated definition of Tier 1 ("Hard Stops; regulatory
requirements; pharma-mandatory ... Hold absolutely. No concession."). Rather
than invent new criteria to resolve these silently, this module resolves them
by deferring to that already-stated Tier 1 definition, and discloses the
resolution in comments at the point it applies (search "RESOLVED CONFLICT"
below):
  1. The tree says "Apply these tests in order and stop at the first that
     assigns a tier." Test 1 assigning Tier 1 is therefore final; the
     "Overrides" list below the tree is never invoked once Test 1 has
     assigned Tier 1 (there is also no textual mechanism by which an
     override would need to reach a Tier 1 position: none of the three
     overrides deals with regulatory or Hard Stop status).
  2. The "creates precedent risk ... elevate one tier" override, applied
     literally to a position already at Tier 2 (HOLD FIRM), would relabel a
     position "RED LINE" even though it is not a Hard Stop or regulatory
     requirement (Test 1 already answered NO for it, or it would have
     stopped at Tier 1 already). Since Tier 1's own criteria in the tier
     table are "Hard Stops; regulatory requirements; pharma-mandatory" and
     this position meets none of those, this module caps that elevation at
     Tier 2 rather than producing a Tier 1 label the tier table's own
     definition does not support for this position. This is a resolved
     textual conflict, not an invented threshold: the 5%, "3 or more prior
     negotiations", and "elevate one tier" values are all copied verbatim.

Where a required attribute is simply absent for the next tree test (a
position with no historical_acceptance_rate on file, no fallback
determination yet made, etc.), this module ABSTAINS (returns REVIEW) rather
than assuming a value. It does NOT abstain when an optional override input is
absent (financial exposure, prior-acceptance count, precedent-risk flag);
those three inputs are supplementary boosts layered on top of an already-
determined base tier, so their absence is disclosed in the trace as "not
provided, not evaluated (treated as not triggered)" and the base tier stands,
which is different from aborting the whole assignment.

See MAINTENANCE.md (lilly-procurement-kernels-1c344a) for this suite's
general kernel-maintenance conventions; this file has no MAINTENANCE.md of
its own yet (single-skill vendored kernel, v1.0).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


# ===========================================================================
# Exceptions
# ===========================================================================

class KernelError(Exception):
    """Base class for every refusal raised by this kernel.

    Per the suite-wide anti-fabrication rule, this module refuses rather than
    guesses when it is given a structurally malformed attribute (a rate
    outside 0.0-1.0, a negative count, a negative exposure fraction).
    Missing-but-valid attributes are handled separately: they produce a
    REVIEW TierResult (see ABSTAIN below), not an exception, because a
    missing input is an expected, everyday case for this kernel (not every
    position has supplier history yet), while a malformed input signals a
    caller bug worth stopping on.
    """


class InvalidTermAttrsError(KernelError):
    """Raised for structurally malformed TermAttrs: an acceptance rate outside
    0.0-1.0, a negative financial-exposure fraction, or a negative prior-
    acceptance count."""


# ===========================================================================
# Tier constants (the skill's OWN four tiers, verbatim labels from the
# Phase 2 tier table; this kernel invents no new tier and no new label)
# ===========================================================================

TIER_RED_LINE = "RED LINE"
TIER_HOLD_FIRM = "HOLD FIRM"
TIER_STRATEGIC_TRADE = "STRATEGIC TRADE"
TIER_EASY_CONCEDE = "EASY CONCEDE"
REVIEW = "REVIEW"

_TIER_LABELS = {
    1: TIER_RED_LINE,
    2: TIER_HOLD_FIRM,
    3: TIER_STRATEGIC_TRADE,
    4: TIER_EASY_CONCEDE,
}


# ===========================================================================
# Structured input / output
# ===========================================================================

@dataclass
class TermAttrs:
    """Structured per-position attributes this skill already classifies
    during Phase 1 (Intelligence Gathering) and Phase 2 (Position Analysis),
    read out of the playbook, supplier negotiation history, and any
    user-provided compliance findings. None means "not yet determined /
    no data", not "false" or "zero" - the kernel treats a missing required
    attribute as a reason to ABSTAIN, never as a default value.

    position_name is carried only for audit/trace labeling; it plays no part
    in the decision logic.
    """
    position_name: str = ""

    # Test 1 input. Source: Phase 2 tier table, Tier 1 criteria "Hard Stops;
    # regulatory requirements; pharma-mandatory"; tree Test 1 "Is this
    # position a Hard Stop or a regulatory requirement?"
    is_hard_stop_or_regulatory: Optional[bool] = None

    # Test 2 input. Source: tree Test 2 "Does Lilly have compliance leverage
    # backing this position?" (per-position leverage, from Phase 3 Leverage
    # Mapping / Source C Compliance Leverage, not the negotiation-wide total).
    has_compliance_leverage: Optional[bool] = None

    # Test 3 / Test 4 input. Source: tree Test 3 "Is the historical
    # acceptance rate 70% or higher?" and Test 4's "is the historical
    # acceptance rate below 40%?" sub-test. Expressed as a fraction 0.0-1.0
    # (0.70 = 70%). None means no historical data exists for this position
    # (Anti-Drift Rule 2: "no historical data available" is a valid, honest
    # answer, never a fabricated statistic).
    historical_acceptance_rate: Optional[float] = None

    # Test 4 input. Source: tree Test 4 "Does an acceptable fallback exist
    # with low residual risk?"
    acceptable_fallback_exists: Optional[bool] = None

    # Override A input. Source: "Any position where financial exposure
    # exceeds 5% of contract value: minimum Tier 2." Expressed as a fraction
    # of total contract value (0.05 = 5%). Optional: absence means this
    # override is not evaluated (disclosed in the trace), not that exposure
    # is assumed to be zero.
    financial_exposure_pct_of_contract_value: Optional[float] = None

    # Override B input. Source: "Any position where the supplier has
    # accepted Lilly's standard in 3 or more prior negotiations: Tier 2
    # (precedent)." Optional: absence means not evaluated.
    supplier_accepted_standard_count: Optional[int] = None

    # Override C input. Source: "Any position where concession creates
    # precedent risk across the supplier portfolio: elevate one tier."
    # Optional: absence means not evaluated.
    creates_precedent_risk: Optional[bool] = None


@dataclass(frozen=True)
class TierResult:
    """Result of assign_tier(). decision is one of TIER_RED_LINE /
    TIER_HOLD_FIRM / TIER_STRATEGIC_TRADE / TIER_EASY_CONCEDE / REVIEW.
    tier_number is 1-4, or None when decision is REVIEW. trace is an ordered,
    human-readable audit log of every test and override evaluated, in the
    order the decision tree specifies. missing_inputs is non-empty only when
    decision is REVIEW, and names the exact TermAttrs field(s) needed to
    proceed.
    """
    decision: str
    tier_number: Optional[int]
    trace: List[str] = field(default_factory=list)
    missing_inputs: List[str] = field(default_factory=list)

    @property
    def is_review(self) -> bool:
        return self.decision == REVIEW


def _abstain(trace: List[str], missing_attr: str, reason: str) -> TierResult:
    trace = list(trace)
    trace.append(f"ABSTAIN (REVIEW): {reason}")
    return TierResult(decision=REVIEW, tier_number=None, trace=trace,
                       missing_inputs=[missing_attr])


def _validate(term: TermAttrs) -> None:
    """Structural validation, independent of which branch of the tree is
    actually reached. Raises rather than guesses on malformed input, per the
    suite's anti-fabrication rule (this is the InvalidTermAttrsError case,
    distinct from the ABSTAIN/REVIEW case for merely-missing data)."""
    rate = term.historical_acceptance_rate
    if rate is not None and not (0.0 <= rate <= 1.0):
        raise InvalidTermAttrsError(
            f"historical_acceptance_rate must be a fraction in [0.0, 1.0], got {rate!r}. "
            "Refusing to guess whether this was meant as a percentage (e.g. 70 for 70%)."
        )
    fe = term.financial_exposure_pct_of_contract_value
    if fe is not None and fe < 0.0:
        raise InvalidTermAttrsError(
            f"financial_exposure_pct_of_contract_value cannot be negative, got {fe!r}."
        )
    cnt = term.supplier_accepted_standard_count
    if cnt is not None and cnt < 0:
        raise InvalidTermAttrsError(
            f"supplier_accepted_standard_count cannot be negative, got {cnt!r}."
        )


# ===========================================================================
# Tier Assignment Decision Tree
# Source: legal-negotiation-prep-1c344a/SKILL.md, inlined "Fallback Strategy
# & Concession Sequencing Guide" -> "Tier Assignment Decision Tree":
#
#   Apply these tests in order and stop at the first that assigns a tier:
#   1. Is this position a Hard Stop or a regulatory requirement? If YES,
#      assign Tier 1 (RED LINE). If NO, continue.
#   2. Does Lilly have compliance leverage backing this position? If YES,
#      assign Tier 2 (HOLD FIRM): leverage strengthens the hold. If NO,
#      continue.
#   3. Is the historical acceptance rate 70% or higher? If YES, assign
#      Tier 2 (HOLD FIRM): proven winnable. If NO, continue.
#   4. Does an acceptable fallback exist with low residual risk?
#      - If YES: is the historical acceptance rate below 40%? If YES,
#        assign Tier 4 (EASY CONCEDE): not worth the fight. If NO, assign
#        Tier 3 (STRATEGIC TRADE): useful as currency.
#      - If NO: assign Tier 2 (HOLD FIRM): no safe fallback, must defend.
#
#   Overrides:
#   - Any position where financial exposure exceeds 5% of contract value:
#     minimum Tier 2.
#   - Any position where the supplier has accepted Lilly's standard in 3 or
#     more prior negotiations: Tier 2 (precedent).
#   - Any position where concession creates precedent risk across the
#     supplier portfolio: elevate one tier.
# ===========================================================================

def assign_tier(term_attrs: TermAttrs) -> TierResult:
    """Deterministically assign one of the skill's four tiers to a single
    contract position, per the Tier Assignment Decision Tree above. Returns
    REVIEW (never a fabricated tier) when a required attribute for the next
    unresolved test is missing.
    """
    _validate(term_attrs)
    trace: List[str] = []
    if term_attrs.position_name:
        trace.append(f"Position: {term_attrs.position_name}")

    # --- Test 1: Hard Stop / regulatory requirement --------------------
    if term_attrs.is_hard_stop_or_regulatory is None:
        return _abstain(
            trace, "is_hard_stop_or_regulatory",
            "Test 1 of the Tier Assignment Decision Tree ('Is this position a "
            "Hard Stop or a regulatory requirement?') cannot be evaluated: "
            "is_hard_stop_or_regulatory was not provided."
        )
    trace.append(
        f"Test 1 (Hard Stop or regulatory requirement?): {term_attrs.is_hard_stop_or_regulatory}"
    )
    if term_attrs.is_hard_stop_or_regulatory:
        trace.append(
            "-> YES: assign RED LINE (Tier 1). Tree stops here per 'apply these "
            "tests in order and stop at the first that assigns a tier'; "
            "overrides never revisit a Tier 1 assignment (Tier 1's own action "
            "per the tier table is 'Hold absolutely. No concession.')."
        )
        return TierResult(decision=TIER_RED_LINE, tier_number=1, trace=trace, missing_inputs=[])
    trace.append("-> NO: continue to Test 2.")

    # --- Test 2: compliance leverage ------------------------------------
    if term_attrs.has_compliance_leverage is None:
        return _abstain(
            trace, "has_compliance_leverage",
            "Test 2 ('Does Lilly have compliance leverage backing this "
            "position?') cannot be evaluated: has_compliance_leverage was not "
            "provided."
        )
    trace.append(
        f"Test 2 (compliance leverage backing this position?): {term_attrs.has_compliance_leverage}"
    )

    base_tier: Optional[int] = None
    rate: Optional[float] = term_attrs.historical_acceptance_rate

    if term_attrs.has_compliance_leverage:
        trace.append("-> YES: base tier HOLD FIRM (Tier 2) - leverage strengthens the hold.")
        base_tier = 2
    else:
        trace.append("-> NO: continue to Test 3.")

        # --- Test 3: historical acceptance rate >= 70% ------------------
        if rate is None:
            return _abstain(
                trace, "historical_acceptance_rate",
                "Test 3 ('Is the historical acceptance rate 70% or higher?') "
                "cannot be evaluated: historical_acceptance_rate was not "
                "provided (Anti-Drift Rule 2 requires 'no historical data "
                "available' rather than a fabricated rate)."
            )
        trace.append(f"Test 3 (historical acceptance rate >= 70%?): {rate:.0%}")
        if rate >= 0.70:
            trace.append("-> YES: base tier HOLD FIRM (Tier 2) - proven winnable.")
            base_tier = 2
        else:
            trace.append("-> NO: continue to Test 4.")

            # --- Test 4: acceptable fallback with low residual risk -----
            if term_attrs.acceptable_fallback_exists is None:
                return _abstain(
                    trace, "acceptable_fallback_exists",
                    "Test 4 ('Does an acceptable fallback exist with low "
                    "residual risk?') cannot be evaluated: "
                    "acceptable_fallback_exists was not provided."
                )
            trace.append(
                f"Test 4 (acceptable fallback with low residual risk exists?): "
                f"{term_attrs.acceptable_fallback_exists}"
            )
            if term_attrs.acceptable_fallback_exists:
                trace.append(f"-> YES: check acceptance rate below 40% ({rate:.0%}).")
                if rate < 0.40:
                    trace.append(
                        "-> YES (< 40%): assign EASY CONCEDE (Tier 4) - not worth the fight."
                    )
                    base_tier = 4
                else:
                    trace.append(
                        "-> NO (40%-69%): assign STRATEGIC TRADE (Tier 3) - useful as currency."
                    )
                    base_tier = 3
            else:
                trace.append(
                    "-> NO: base tier HOLD FIRM (Tier 2) - no safe fallback, must defend."
                )
                base_tier = 2

    assert base_tier is not None  # every branch above sets it or returns
    tier = base_tier

    # --- Overrides -------------------------------------------------------
    # Only reached for base tiers 2/3/4: a Test-1 Tier 1 assignment already
    # returned above, per the tree's own "stop at the first" instruction.

    # Override A: financial exposure > 5% of contract value -> minimum Tier 2
    fe = term_attrs.financial_exposure_pct_of_contract_value
    if fe is None:
        trace.append(
            "Override A (financial exposure exceeds 5% of contract value?): "
            "not provided, not evaluated (treated as not triggered)."
        )
    else:
        trace.append(f"Override A (financial exposure exceeds 5% of contract value?): {fe:.1%}")
        if fe > 0.05 and tier > 2:
            trace.append(
                f"-> YES: {_TIER_LABELS[tier]} raised to HOLD FIRM (Tier 2) minimum."
            )
            tier = 2
        elif fe > 0.05:
            trace.append(f"-> YES, but tier is already {_TIER_LABELS[tier]} (Tier 2 or stronger): no change.")
        else:
            trace.append("-> NO: no change.")

    # Override B: supplier accepted Lilly's standard 3+ times -> Tier 2 (precedent)
    cnt = term_attrs.supplier_accepted_standard_count
    if cnt is None:
        trace.append(
            "Override B (supplier accepted Lilly's standard in 3+ prior "
            "negotiations?): not provided, not evaluated (treated as not triggered)."
        )
    else:
        trace.append(
            f"Override B (supplier accepted Lilly's standard in 3+ prior negotiations?): count={cnt}"
        )
        if cnt >= 3 and tier > 2:
            trace.append(f"-> YES: {_TIER_LABELS[tier]} set to HOLD FIRM (Tier 2) (precedent).")
            tier = 2
        elif cnt >= 3:
            trace.append(f"-> YES, but tier is already {_TIER_LABELS[tier]} (Tier 2 or stronger): no change.")
        else:
            trace.append("-> NO: no change.")

    # Override C: concession creates precedent risk across the supplier
    # portfolio -> elevate one tier.
    pr = term_attrs.creates_precedent_risk
    if pr is None:
        trace.append(
            "Override C (concession creates precedent risk across the "
            "supplier portfolio?): not provided, not evaluated (treated as not triggered)."
        )
    elif pr:
        proposed = tier - 1
        if proposed < 2:
            # RESOLVED CONFLICT (see module docstring): a literal one-tier
            # elevation from Tier 2 would produce Tier 1 (RED LINE) for a
            # position that Test 1 already established is NOT a Hard Stop
            # or regulatory requirement. Tier 1's own criteria in the tier
            # table are "Hard Stops; regulatory requirements; pharma-
            # mandatory", which this position does not meet, so the
            # elevation is capped at Tier 2 rather than mislabeling it
            # RED LINE.
            trace.append(
                f"-> YES: would elevate {_TIER_LABELS[tier]} to RED LINE (Tier 1), but "
                "capped at HOLD FIRM (Tier 2): Tier 1 is reserved for Hard Stop / "
                "regulatory positions per the tier table, and Test 1 already "
                "answered NO for this position (resolved conflict, not an "
                "invented rule; see tier_kernel.py module docstring)."
            )
            tier = 2
        else:
            trace.append(
                f"-> YES: elevate one tier: {_TIER_LABELS[tier]} -> {_TIER_LABELS[proposed]}."
            )
            tier = proposed
    else:
        trace.append("Override C (creates precedent risk?): False -> no change.")

    return TierResult(decision=_TIER_LABELS[tier], tier_number=tier, trace=trace, missing_inputs=[])


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
    print("GOLDEN TESTS (each traces to a quoted test/override in the Tier")
    print("Assignment Decision Tree, legal-negotiation-prep-1c344a/SKILL.md)")
    print("=" * 78)

    # --- Golden 1: Test 1 YES -> RED LINE -----------------------------
    r1 = assign_tier(TermAttrs(position_name="Sanctions & Export Control Compliance",
                                is_hard_stop_or_regulatory=True))
    _check(
        "Test 1 YES -> RED LINE ('If YES, assign Tier 1 (RED LINE)')",
        r1.decision == TIER_RED_LINE and r1.tier_number == 1,
        f"got {r1.decision}",
    )

    # --- Golden 2: Test 1 NO, Test 2 YES -> HOLD FIRM ------------------
    r2 = assign_tier(TermAttrs(position_name="Rate Card Audit Rights",
                                is_hard_stop_or_regulatory=False,
                                has_compliance_leverage=True))
    _check(
        "Test 1 NO, Test 2 YES -> HOLD FIRM ('leverage strengthens the hold')",
        r2.decision == TIER_HOLD_FIRM and r2.tier_number == 2,
        f"got {r2.decision}",
    )

    # --- Golden 3: Test 1 NO, Test 2 NO, Test 3 YES (rate >=70%) -------
    r3 = assign_tier(TermAttrs(position_name="Insurance Minimums",
                                is_hard_stop_or_regulatory=False,
                                has_compliance_leverage=False,
                                historical_acceptance_rate=0.75))
    _check(
        "Test 3 rate>=70% -> HOLD FIRM ('proven winnable')",
        r3.decision == TIER_HOLD_FIRM and r3.tier_number == 2,
        f"got {r3.decision}",
    )

    # --- Golden 4: Test 4 branch, fallback YES, rate <40% -> EASY CONCEDE
    r4 = assign_tier(TermAttrs(position_name="Invoice Frequency",
                                is_hard_stop_or_regulatory=False,
                                has_compliance_leverage=False,
                                historical_acceptance_rate=0.30,
                                acceptable_fallback_exists=True))
    _check(
        "Test 4 fallback YES, rate<40% -> EASY CONCEDE ('not worth the fight')",
        r4.decision == TIER_EASY_CONCEDE and r4.tier_number == 4,
        f"got {r4.decision}",
    )

    # --- Golden 5: Test 4 branch, fallback YES, rate 40-69% -> STRATEGIC TRADE
    r5 = assign_tier(TermAttrs(position_name="Change Order Markup Rate",
                                is_hard_stop_or_regulatory=False,
                                has_compliance_leverage=False,
                                historical_acceptance_rate=0.55,
                                acceptable_fallback_exists=True))
    _check(
        "Test 4 fallback YES, rate 40-69% -> STRATEGIC TRADE ('useful as currency')",
        r5.decision == TIER_STRATEGIC_TRADE and r5.tier_number == 3,
        f"got {r5.decision}",
    )

    # --- Golden 6: Test 4 branch, fallback NO -> HOLD FIRM -------------
    r6 = assign_tier(TermAttrs(position_name="Liability Cap Tied to Fees Paid",
                                is_hard_stop_or_regulatory=False,
                                has_compliance_leverage=False,
                                historical_acceptance_rate=0.20,
                                acceptable_fallback_exists=False))
    _check(
        "Test 4 fallback NO -> HOLD FIRM ('no safe fallback, must defend')",
        r6.decision == TIER_HOLD_FIRM and r6.tier_number == 2,
        f"got {r6.decision}",
    )

    print()
    print("=" * 78)
    print("OVERRIDE TESTS (each traces to a quoted override in the tree)")
    print("=" * 78)

    # --- Override A triggers: base STRATEGIC TRADE + exposure >5% -> HOLD FIRM
    r7 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=False,
                                historical_acceptance_rate=0.55, acceptable_fallback_exists=True,
                                financial_exposure_pct_of_contract_value=0.10))
    _check(
        "Override A: exposure >5% raises STRATEGIC TRADE to HOLD FIRM minimum",
        r7.decision == TIER_HOLD_FIRM and r7.tier_number == 2,
        f"got {r7.decision}",
    )

    # --- Override A no-op when base already Tier 2 --------------------
    r8 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=True,
                                financial_exposure_pct_of_contract_value=0.10))
    _check(
        "Override A: no-op when base tier is already HOLD FIRM (Tier 2)",
        r8.decision == TIER_HOLD_FIRM and r8.tier_number == 2,
        f"got {r8.decision}",
    )

    # --- Override B triggers: base EASY CONCEDE + count>=3 -> HOLD FIRM
    r9 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=False,
                                historical_acceptance_rate=0.30, acceptable_fallback_exists=True,
                                supplier_accepted_standard_count=3))
    _check(
        "Override B: 3+ prior acceptances raises EASY CONCEDE to HOLD FIRM (precedent)",
        r9.decision == TIER_HOLD_FIRM and r9.tier_number == 2,
        f"got {r9.decision}",
    )

    # --- Override C elevates one tier: STRATEGIC TRADE -> HOLD FIRM ---
    r10 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=False,
                                 historical_acceptance_rate=0.55, acceptable_fallback_exists=True,
                                 creates_precedent_risk=True))
    _check(
        "Override C: precedent risk elevates STRATEGIC TRADE to HOLD FIRM",
        r10.decision == TIER_HOLD_FIRM and r10.tier_number == 2,
        f"got {r10.decision}",
    )

    # --- Override C capped: HOLD FIRM does NOT elevate to RED LINE -----
    r11 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=True,
                                 creates_precedent_risk=True))
    _check(
        "Override C: elevation from HOLD FIRM is capped, NOT relabeled RED LINE "
        "(resolved conflict: Test 1 already said this is not a Hard Stop)",
        r11.decision == TIER_HOLD_FIRM and r11.tier_number == 2
        and any("capped" in line for line in r11.trace),
        f"got {r11.decision}, trace={r11.trace}",
    )

    # --- Multiple overrides combined -----------------------------------
    r12 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=False,
                                 historical_acceptance_rate=0.30, acceptable_fallback_exists=True,
                                 financial_exposure_pct_of_contract_value=0.10,
                                 supplier_accepted_standard_count=3,
                                 creates_precedent_risk=True))
    _check(
        "Combined overrides: base EASY CONCEDE -> A raises to HOLD FIRM -> B "
        "no-op -> C capped at HOLD FIRM",
        r12.decision == TIER_HOLD_FIRM and r12.tier_number == 2,
        f"got {r12.decision}",
    )

    print()
    print("=" * 78)
    print("ABSTAIN / REVIEW CASES (missing required attribute at the next test)")
    print("=" * 78)

    ra1 = assign_tier(TermAttrs())
    _check(
        "ABSTAIN: is_hard_stop_or_regulatory missing -> REVIEW",
        ra1.decision == REVIEW and ra1.missing_inputs == ["is_hard_stop_or_regulatory"],
        f"got {ra1.decision}, missing={ra1.missing_inputs}",
    )

    ra2 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False))
    _check(
        "ABSTAIN: has_compliance_leverage missing -> REVIEW",
        ra2.decision == REVIEW and ra2.missing_inputs == ["has_compliance_leverage"],
        f"got {ra2.decision}, missing={ra2.missing_inputs}",
    )

    ra3 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=False))
    _check(
        "ABSTAIN: historical_acceptance_rate missing -> REVIEW (no fabricated rate, "
        "per Anti-Drift Rule 2)",
        ra3.decision == REVIEW and ra3.missing_inputs == ["historical_acceptance_rate"],
        f"got {ra3.decision}, missing={ra3.missing_inputs}",
    )

    ra4 = assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=False,
                                 historical_acceptance_rate=0.30))
    _check(
        "ABSTAIN: acceptable_fallback_exists missing -> REVIEW",
        ra4.decision == REVIEW and ra4.missing_inputs == ["acceptable_fallback_exists"],
        f"got {ra4.decision}, missing={ra4.missing_inputs}",
    )

    print()
    print("=" * 78)
    print("NEGATIVE TESTS (malformed input must raise, never silently coerce)")
    print("=" * 78)

    _check_raises(
        "assign_tier: refuses historical_acceptance_rate outside [0.0, 1.0] (70 instead of 0.70)",
        lambda: assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=False,
                                       historical_acceptance_rate=70)),
        InvalidTermAttrsError,
    )
    _check_raises(
        "assign_tier: refuses negative financial_exposure_pct_of_contract_value",
        lambda: assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=True,
                                       financial_exposure_pct_of_contract_value=-0.01)),
        InvalidTermAttrsError,
    )
    _check_raises(
        "assign_tier: refuses negative supplier_accepted_standard_count",
        lambda: assign_tier(TermAttrs(is_hard_stop_or_regulatory=False, has_compliance_leverage=True,
                                       supplier_accepted_standard_count=-1)),
        InvalidTermAttrsError,
    )

    print()
    print("=" * 78)
    print("ILLUSTRATIVE CONSISTENCY CHECKS (Position Map & MSA Coverage panel's")
    print("Nimbus Cloud Technologies example names a RESULTING tier per position")
    print("but the SKILL.md text does not give the underlying attributes, so")
    print("these attribute sets are constructed by this test to be consistent")
    print("with that narrative - NOT a source-quoted worked example)")
    print("=" * 78)

    ic1 = assign_tier(TermAttrs(position_name="EU/UK Data Residency Commitment",
                                 is_hard_stop_or_regulatory=True))
    _check(
        "Illustrative: EU/UK Data Residency Commitment -> RED LINE (Position Map example)",
        ic1.decision == TIER_RED_LINE,
        f"got {ic1.decision}",
    )

    ic2 = assign_tier(TermAttrs(position_name="Invoice Frequency",
                                 is_hard_stop_or_regulatory=False, has_compliance_leverage=False,
                                 historical_acceptance_rate=0.25, acceptable_fallback_exists=True))
    _check(
        "Illustrative: Invoice Frequency -> EASY CONCEDE (Position Map example)",
        ic2.decision == TIER_EASY_CONCEDE,
        f"got {ic2.decision}",
    )

    print()
    print("=" * 78)
    passed = sum(1 for _, ok, _ in _results if ok)
    failed = sum(1 for _, ok, _ in _results if not ok)
    total = len(_results)
    print(f"SUMMARY: {passed}/{total} passed")
    if failed:
        print("FAILED CASES:")
        for label, ok, detail in _results:
            if not ok:
                print(f"  - {label}: {detail}")
    print("=" * 78)

    import sys
    sys.exit(0 if failed == 0 else 1)
