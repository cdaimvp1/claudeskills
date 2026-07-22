# Protection Scoring: Combined-Protection-Weighted Formula

**Loaded during Pass 4.** This formula produces the 0-100 Protection Score (higher = better protected) for the dashboard Overview and Review Summary. The formula is mechanical: it forces cross-reference against PASS_2_COVERAGE before assigning any deduction, preventing the most common scoring failure (treating a WO finding with full MSA backup the same as a standalone contract finding with zero fallback).

## Why This Exists

Without a formula, risk scoring defaults to a naive approach: count findings, multiply by severity, deduct from 100. That approach produces inflated scores because it ignores the contractual landscape. A WO under a comprehensive MSA with verified exhibits has a fundamentally different risk profile than a standalone supplier-paper agreement. The formula encodes this difference.

## Formula

**Starting point:** 100 (no risk to Lilly).

**Per-finding deduction, weighted by PASS_2_COVERAGE status for the finding's protection category:**

| Finding Severity | Standalone (no governing doc covers this category) | Governed: Covered | Governed: Confirm | Governed: Gap |
|---|---|---|---|---|
| Hard Stop | -15 | -15 (never reduced) | -15 | -15 |
| HIGH | -7 to -10 | -3 to -5 | -5 to -7 | -7 to -10 |
| MEDIUM | -4 to -6 | -2 to -3 | -3 to -4 | -4 to -6 |
| LOW | -2 to -3 | -1 | -1 to -2 | -2 to -3 |
| Protection Gap | -3 to -5 | -1 to -2 | -2 to -3 | -3 to -5 |

**How to use:**

1. For each validated finding in PASS_4_PREP, identify its protection category (Termination, SLA, Data Protection, AI Governance, Security, Audit, IP, Indemnification, Liability, Insurance, Renewal/Price, Flexibility, Pharma-Specific, Commitment).
2. Look up that category's status in PASS_2_COVERAGE (Covered / Confirm / Gap / not addressed in governing docs).
3. Select the deduction range from the appropriate column.
4. Within the range, use judgment: findings that are editing errors or MSA-alignment restorations take the low end; findings that represent genuine unprotected exposure take the high end.
5. Sum all deductions. Subtract from 100.

**Hard Stops are never reduced.** A Hard Stop is a non-negotiable Lilly position regardless of what the MSA says. The deduction is always -15.

## Scale

The Protection Score runs 0-100 where **higher = better protected (lower residual risk)**. The Label column is the residual-risk level each score implies.

| Score | Label | Color | Meaning |
|---|---|---|---|
| 75-100 | Low | POS (Bold Blue `#0F3A85`, the on-brand positive signal; Lilly has no on-brand green) | MSA provides strong coverage; findings are clarifications or minor enhancements |
| 50-74 | Moderate | AMB (amber `#B45309`) | Some genuine gaps or weakened protections; negotiation needed but manageable |
| 25-49 | High | R (red `#E1251B`) | Material unprotected exposure; Hard Stops likely; multiple rounds expected |
| 0-24 | Critical | R (red, bold) | Fundamental structural issues; do not sign without comprehensive renegotiation |

## Score Methodology Display

The dashboard Overview must include a brief methodology explanation beneath the Protection Score KPI card. Format:

> **Score methodology:** Starts at 100 (no risk). Deducts by finding severity weighted against combined protection. [N] of 14 categories are Covered by the verified [governing doc], so findings in covered categories carry reduced deductions. [N] Hard Stops. [Brief characterization of findings, e.g., "The HIGH findings are: an editing error, an MSA-template restoration, and a compliance clarification"]. Scale: 75-100 Low, 50-74 Moderate, 25-49 High, 0-24 Critical.

This transparency prevents the "why is this score so low/high?" question and makes the scoring auditable.

## Worked Example: Supplier A WO 10 (illustrative)

Context: Work Order under a verified MPT 5.0 MSA with Exhibits A, B, C, and SPS. 9 of 14 protection categories Covered (3 to Confirm, 2 with residual Gaps). Zero Hard Stops.

| # | Finding | Severity | Category | PASS_2 Status | Column Used | Deduction | Rationale |
|---|---------|----------|----------|---------------|-------------|-----------|-----------|
| 1 | Missing volume period | HIGH | Scope (N/A) | No MSA analog | Standalone | -7 | WO-specific issue; no MSA fallback, so the full Standalone range (-7 to -10) applies; -7 is the low end for a likely editing error |
| 2 | SLA degraded from MSA template | HIGH | SLA | Covered (Exhibit B) | Governed: Covered | -4 | Exhibit B IS the fallback; WO weakens it but MSA framework survives |
| 3 | HITL training data ambiguity | HIGH | AI Governance | Covered (Exhibit C) | Governed: Covered | -3 | AI Standard already governs; WO needs clarification, not new protection |
| 4 | Prepay/TfC exposure | MEDIUM | Commitment | Confirm | Governed: Confirm | -3 | MSA 13.4 partially covers but prepay creates new exposure |
| 5 | Custom model ownership | MEDIUM | IP | Covered (MSA 9.1.2 + AI Std 15) | Governed: Covered | -2 | Two independent assignment clauses exist; WO just needs explicit confirmation |
| 6 | AE detection at scale | MEDIUM | Pharma | Covered (MSA 3.8) | Governed: Covered | -3 | MSA covers reactive reporting; gap is proactive detection at AI scale |
| 7 | Migration plan | MEDIUM | Delivery (N/A) | No MSA analog | Standalone | -4 | WO-specific operational risk with no governing doc fallback |
| 8 | June 15 deadline | MEDIUM | Commercial (N/A) | No MSA analog | Standalone | -4 | Commercial pressure, not legal risk; Standalone MEDIUM range is -4 to -6, so -4 is the low-end minimum |
| 9 | Missing acceptance criteria | MEDIUM | Delivery | Covered (template requires it) | Governed: Covered | -2 | MSA Exhibit B template is the standard; WO omits it |
| 10 | Expense language | LOW | Commercial (N/A) | No MSA analog | Standalone | -2 | Template artifact; Standalone LOW range is -2 to -3, so -2 is the low-end minimum |
| 11 | Insight Sessions "up to" | LOW | Scope (N/A) | No MSA analog | Standalone | -2 | Minor scope qualifier; Standalone LOW range is -2 to -3, so -2 is the low-end minimum |
| | | | | **Total deductions:** | | **-36** | |
| | | | | **Score:** | | **64** | |

Score of 64 = Moderate, consistent with: zero Hard Stops, strong MSA coverage on the governed categories, and a mix of MSA-alignment or clarification items alongside five genuinely standalone findings (no MSA analog) that carry the full Standalone-column deductions rather than reduced Governed values. The Moderate band (50-74) is the expected zone for a well-governed WO with no Hard Stops and several resolvable items; this example lands at 64, in the middle of that band, because the standalone findings get no MSA fallback discount.

## Anti-Drift Calibration

If a score for a document meeting ALL of these criteria exceeds a 30-point deduction:
- Zero Hard Stops
- 10+ of 14 protection categories Covered in PASS_2_COVERAGE
- Findings are primarily MSA-alignment or clarification items (not new unprotected exposures)

...then the scoring is likely using the Standalone column when the Governed: Covered column should apply. Re-check each finding's deduction against its PASS_2_COVERAGE status.

Conversely, if a score for a standalone supplier-paper MSA with no governing documents produces less than a 25-point deduction despite having 5+ findings, the scoring is likely too generous. Every finding in a standalone document uses the Standalone column.

---