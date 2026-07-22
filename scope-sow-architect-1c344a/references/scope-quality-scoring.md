# Scope Definition Score (Suite-Wide-Compatible, Skill-Owned Method)

This is the single source of truth for how scope-sow-architect converts a diagnostic pass into a
numeric **Scope Definition Score (0-100, higher = better defined / more priceable, deliverable,
acceptable, and governable)**. It is the scope-quality analogue of lilly-contract-review's
Protection Score (0-100, higher = better legally protected), but it is a DIFFERENT metric measuring
a DIFFERENT question, computed with a different formula shape, and the two must never be conflated,
summed, or presented as comparable numbers on the same axis. A Protection Score of 70 and a Scope
Definition Score of 70 are not the same kind of 70; state which metric is which every time either
appears.

It is also distinct from the suite's canonical 0.0-5.0 evaluation scale (`scoring-scales.md` in the
lilly-brand-assets foundation), which governs the RFx evaluation chain (rfp-engine, rfp-response-
analysis, evaluation-engine, supplier-deep-dive's fit score). The Scope Definition Score borrows
that same 0.0-5.0 per-dimension scoring convention as its INPUT unit (so raters use one familiar
scale suite-wide) but is not itself a member of that governed evaluation chain and is never handed
downstream as an RFx evaluation score.

## Why a composite-weighted score, not a deduction table

lilly-contract-review's Protection Score starts at 100 and deducts for legal/commercial gaps, because
the question is "how much residual risk remains after netting out existing protections." A scope
document does not have an equivalent netting question: there is no governing document that
pre-defines deliverables or acceptance criteria the way an MSA pre-defines liability caps. The
right question for scope is "how completely and objectively is each necessary dimension of the work
defined," which is a coverage-quality composite, not a risk-deduction ladder. The suite already has
a proven, kernel-backed primitive for exactly this shape of composite: `weighted_score()` in the
vendored `numeric_kernel.py`, the same function market-rate-benchmarking uses for its Composite
Contract Quality Score and evaluation-engine uses for its Grand Total. This skill reuses that
primitive rather than inventing a new one.

## The 10 dimensions and their weights (MUST sum to 1.0)

| # | Dimension | Weight | What it measures |
|---|-----------|--------|-------------------|
| 1 | Deliverables Definition & Testability | 0.15 | Every deliverable is named, described, has a stated format/medium, and is objectively verifiable (a third party could confirm it exists and matches the description) |
| 2 | In-Scope / Out-of-Scope Boundary Clarity | 0.10 | The SOW states what is included AND explicitly excludes adjacent work; the boundary is not left to inference |
| 3 | Acceptance Criteria Objectivity | 0.15 | Each deliverable or milestone has a measurable pass/fail test, not a subjective standard ("satisfactory," "as needed," "industry standard") |
| 4 | Assumptions & Dependencies Completeness | 0.10 | Assumptions the price/timeline rely on are stated with an owner and a risk-if-wrong; external dependencies (Lilly-owned or third-party) are named with an owner and a needed-by date |
| 5 | Roles & Responsibilities (RACI) Completeness | 0.10 | Every workstream has a named Responsible, Accountable, Consulted, and Informed party on each side; no orphaned deliverable with no owner |
| 6 | Milestones & Schedule Definition | 0.10 | Milestones are dated or trigger-defined, sequenced, and each maps to at least one deliverable |
| 7 | SLAs / KPIs Measurability | 0.10 | Where the engagement type expects service levels or performance metrics, each has a target, a measurement method, and a reporting cadence; not just a metric name with no target |
| 8 | Staffing & Rate-Card Structure Soundness | 0.10 | Roles, levels, rates, and units are stated; the rate card is internally consistent (rate x hours = line total; blended rate reconciles) |
| 9 | Payment-to-Deliverable Alignment | 0.05 | Payment milestones are tied to specific deliverables or acceptance gates (not pure calendar dates alone, unless a stated retainer/subscription rationale applies) and the milestone payments sum to the stated total contract value |
| 10 | Change-Control Trigger Definition | 0.05 | A change-order process exists with a stated trigger threshold (scope, schedule, or cost delta), an approval authority, and a pricing mechanism for changes |

`0.15+0.10+0.15+0.10+0.10+0.10+0.10+0.10+0.05+0.05 = 1.00`. If a category rebalance is ever needed,
the new weight set MUST still sum to 1.0; `weighted_score()` in the vendored kernel refuses (raises
`WeightSumError`) any set that does not, exactly the guard that caught market-rate-benchmarking's
own 1.05 bug in v2.1. Do not hand-adjust weights without re-verifying the sum.

## Per-dimension scoring (0.0-5.0), restated for scope quality

Use the suite's canonical five-tier shape, relabeled for a scope-definition question rather than a
requirements-fit question. The band boundaries are identical to `scoring-scales.md` so a reader who
already knows the suite's 0.0-5.0 convention reads this correctly on sight:

| Score band | Tier label (scope-specific) | Meaning |
|------------|------------------------------|---------|
| 4.5 - 5.0 | Fully Defined | The dimension is complete, specific, and objectively verifiable; nothing to add before pricing/execution |
| 3.5 - 4.4 | Largely Defined | Present and usable with a minor, non-material gap (e.g., one deliverable missing a format spec) |
| 2.5 - 3.4 | Partially Defined | Material gap; the dimension exists but needs targeted rework before the SOW is issuance- or execution-ready |
| 1.0 - 2.4 | Minimally Defined | Significant gap; largely unusable as written, high rework burden |
| 0.0 - 0.9 | Not Defined | Dimension is absent or so vague it provides no governing content |

A dimension score of 0.0 is a labeled gap, not a silent zero: every 0.0-0.9 score must carry the
specific missing content named (per the anti-collapse rule below), and a dimension that has not yet
been assessed (pending user input) is NEEDS_INPUT, not a 0.0, per the suite's "pending is not a real
zero" rule in `scoring-scales.md`.

## Formula (kernel-backed, HARD RULE per G11)

```
scores  = { dim_1: <0.0-5.0>, dim_2: <0.0-5.0>, ..., dim_10: <0.0-5.0> }
weights = { dim_1: 0.15, dim_2: 0.10, dim_3: 0.15, dim_4: 0.10, dim_5: 0.10,
            dim_6: 0.10, dim_7: 0.10, dim_8: 0.10, dim_9: 0.05, dim_10: 0.05 }
composite_0to5 = weighted_score(scores, weights)      // vendored numeric_kernel.py
scope_definition_score = round(composite_0to5 * 20)   // rescale 0.0-5.0 -> 0-100
```

**Computation requirement (HARD RULE, G11): do not hand-compute the composite.** Call
`weighted_score()` in the vendored `numeric_kernel.py` (or its verbatim JS mirror in the canonical
dashboard, `weightedScoreJS()`) with the 10 dimension scores and the 10 weights above. If the
weights do not sum to 1.0 within tolerance the kernel refuses; fix the weight set, do not catch and
re-normalize silently. A Scope Definition Score produced without a visible call to this function,
or produced by summing/eyeballing the ten dimension scores in prose, is invalid per G9.

## Bands (for the dashboard's score display)

| Band | Score | Read |
|------|-------|------|
| 75-100 | Low gap / Ready to Issue | The SOW is ready to price, staff, execute against, and govern with only minor polish |
| 50-74 | Moderate gap / Needs Targeted Fixes | Workable but specific dimensions need rework before issuance or signature; name them |
| 25-49 | High gap / Major Rework | Multiple material dimensions are undefined; do not issue or price against this scope as written |
| 0-24 | Critical gap / Not Priceable | The scope cannot be reliably priced, delivered, accepted, or governed as written; treat as a blocking gap, not a minor edit |

These bands are visually distinct from lilly-contract-review's Protection Score bands (which read
"Low/Moderate/High/Critical **risk**") by labeling the SAME four numeric ranges with a
definition-readiness read ("gap" and an action verb) instead of a risk read, so the two scores are
never mistaken for the same axis even when a reader sees them side by side in a cross-skill handoff.

## Worked micro-example (illustrative; numbers reconcile)

| Dimension | Weight | Score (0.0-5.0) | Weighted contribution |
|-----------|--------|------------------|------------------------|
| Deliverables Definition & Testability | 0.15 | 3.5 | 0.525 |
| In-Scope / Out-of-Scope Boundary | 0.10 | 1.0 | 0.100 |
| Acceptance Criteria Objectivity | 0.15 | 2.0 | 0.300 |
| Assumptions & Dependencies | 0.10 | 3.0 | 0.300 |
| RACI Completeness | 0.10 | 2.5 | 0.250 |
| Milestones & Schedule | 0.10 | 4.0 | 0.400 |
| SLAs / KPIs Measurability | 0.10 | 2.5 | 0.250 |
| Staffing & Rate-Card Soundness | 0.10 | 3.5 | 0.350 |
| Payment-to-Deliverable Alignment | 0.05 | 1.5 | 0.075 |
| Change-Control Trigger Definition | 0.05 | 0.0 | 0.000 |
| **Composite** | **1.00** | | **2.550** |

`scope_definition_score = round(2.550 * 20) = 51` -> Moderate gap / Needs Targeted Fixes band. Show
this calculation table in the output every time (Overview tab and the diagnostic report): a score
without a visible per-dimension derivation is invalid, per the suite validation checklist.

## Anti-collapse signals (skill-specific, in addition to the suite-wide G9 list)

- A Scope Definition Score presented with no visible 10-row calculation table.
- A dimension scored 0.0 with no named missing content (what, specifically, is absent).
- A dimension scored above 3.5 ("Largely" or "Fully Defined") when the diagnostic's own findings
  list contains a HIGH or BLOCKING finding tagged to that same dimension. Findings and dimension
  scores must agree; if a dimension has an open HIGH/BLOCKING finding, its score cannot exceed 3.4
  (Partially Defined) until the finding is resolved.
- Payment-to-Deliverable Alignment scored above 3.4 when `verify_line_math()` (or the equivalent
  milestone-sum check) shows the milestone payments do not foot to the stated total contract value.
  A footing failure caps this dimension at 2.4 (Minimally Defined) regardless of how well the
  milestones otherwise read, because unreconciled payment math is itself the material gap.
- Weights that do not sum to 1.0 (the kernel will refuse this, but a hand-typed narrative summary
  that skips the kernel call and states a score anyway is the collapse signal to watch for).

## Relationship to findings severity

Findings drive dimension scores; dimension scores do not exist independently of findings. Severity
tiers used in the findings ledger:

| Severity | Meaning | Effect on the owning dimension's score ceiling |
|----------|---------|--------------------------------------------------|
| BLOCKING | The scope cannot be priced, staffed, delivered, accepted, or governed at all without this (e.g., no deliverables defined; no acceptance mechanism of any kind; no stated total value or payment terms) | Caps the dimension at 0.9 (Not Defined) until resolved |
| HIGH | A material, decision-relevant gap likely to cause a dispute, a missed payment gate, or an unpriceable change | Caps the dimension at 3.4 (Partially Defined) until resolved |
| MEDIUM | A real gap with moderate consequence; usable with remediation | Caps the dimension at 4.4 (Largely Defined) until resolved |
| LOW | A minor, non-material polish item | No cap; may coexist with a 4.5+ score if it is the only open item on that dimension |

This mirrors the coupling lilly-contract-review enforces between its findings ledger and its
Protection Score (a finding's severity and coverage status determine its deduction; here a finding's
severity caps the score ceiling of the dimension it belongs to), so the two skills feel like one
system to a rep who uses both.
