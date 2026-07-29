> # SUPERSEDED — do not build from this document
>
> **D4, 2026-07-29.** This proposal specifies **six** sub-tabs:
> Overview, Scope, Review, Strategy & Positions, Pricing & Commercial, Pro-forma.
>
> **What shipped is four**, and the four are locked:
>
> | Tab | Subtabs |
> |---|---|
> | **Overview** | none |
> | **Terms & Review** | Documents & Conflicts · Legal & Protection · Scope & Performance · Sources & Evidence |
> | **Economics** | Deal Table & ZOPA · Financial Model |
> | **Negotiation** | Positions · Trade Plan · Communications |
>
> The shipped IA is canonical. It differs from this proposal in three ways worth
> recording, because each was a deliberate decision and not drift:
>
> 1. **Scope did not get its own top-level tab.** It became a subtab of Terms &
>    Review, because scope questions are read alongside the legal ones, not apart
>    from them.
> 2. **Strategy & Positions and Pricing & Commercial did not split into peers.**
>    Positions, Trade Plan and Communications are subtabs of Negotiation; the
>    numbers live in Economics. The proposal split Negotiate to relieve
>    overloading; the shipped answer relieved it with subtabs instead, which kept
>    the top bar to four.
> 3. **Pro-forma is a subtab of Economics**, named Financial Model, not a
>    top-level tab.
>
> This document is kept for the analysis in section 2, which is still sound. The
> IA in section 1 is not. Build from the table above.

---

# Deal Tab Redesign Proposal (assessment synthesis)

# Deal Tab Redesign — Decision-Ready Proposal

Synthesis of four evaluations (platform Deal tab, contract-review, pro-forma-builder, scope-sow-architect) into one Deal-tab information architecture. The three skills stay standalone; only their genuinely-additive, non-duplicative content converges here, with the platform as system-of-record for anything it already computes live.

---

## 1. Proposed New Deal-Tab Information Architecture

**Top-level ordering (left-to-right, mirrors a rep's flow from "what is this" to "sign"):**

**Overview → Scope → Review → Strategy & Positions → Pricing & Commercial → Pro-forma**

Six sub-tabs. This resolves the overloaded Negotiate into two coherent peers (Strategy & Positions / Pricing & Commercial) and gives Scope and a deepened Pro-forma proper homes. A thin persistent chrome strip (contract-status: doc/turn/process/MSA/paper/pen) and the **Key Issues index** sit ABOVE the sub-tabs as shared cross-cutting context, not buried inside one tab.

### Overview (landing)
- **Default-visible:** Deal headline KPI strip + Protection Score gauge, Go/No-Go call + Conditions Before Signature, Total-deal ZOPA/TCO one-line readout, Key Issues (the shared index, anchored here).
- **On-demand:** Score methodology (one-line citation by default, essay collapsed), governing agreement / document-type strip.

### Scope (from scope-sow skill; new home for Scope Definition)
- **Default-visible:** Scope Definition Score (tile + bar), Top Findings, Deliverables Register, In-Scope/Out-of-Scope (Section Coverage Map folded in as a compact strip), Milestone Schedule (with a single "Reconciles?" flag column), Acceptance-Criteria Objectivity Scan, Change-Control Trigger Register + Rewrite Map.
- **On-demand (own drawer/collapsed):** RACI Matrix, Assumptions & Dependencies (merged into one register with a Type column), SLA/KPI Register (auto-collapsed when mostly "Not stated"), Rate Card **footing-check exceptions only** (reads from commercial, does not re-author).

### Review (from contract-review skill + platform Review mode)
- **Default-visible:** Overview headline block (Go/No-Go, conditions), Findings grouped H/M/L (audit-grade Evidence/MSA-Cross-Ref/Impact/Action from the skill), Protection & Coverage (single merged 14-cat view), Obligations tracker (deadlines + party-imbalance + missing-standard-obligations), Documents register / evidence-gate.
- **On-demand:** Vendor tactics scan, contract versions, Act-on-review actions, Push-to-LEAH.

### Strategy & Positions (Negotiate breakout, part 1 — the argument content)
- **Default-visible:** Negotiation Strategy (KPIs + posture + leverage read + talking points, all folded into one banner), Position Playbook (with a "group by tier" **view toggle** that replaces the standalone Position Map), Red Lines (pinned compact strip), Concession Sequencing + BATNA.
- **On-demand (collapsed):** SME Pre-Engagement (named contacts/asks, anchored from the Documents evidence-gate), MSA-Already-Covers (keep its existing collapsed reveal pattern as the model).

### Pricing & Commercial (Negotiate breakout, part 2 — the numbers)
- **Default-visible:** Levers & Protection-Score model (interactive, **the hero panel**), ZOPA by line item + Total-deal ZOPA/TCO, Ranked counter-proposal + trade matrix, Negotiation-prep summary card.
- **On-demand (collapsed):** Pricing-model recommendation (one-line rec shown, 6-model grid + volume/consolidation bullets behind expand), External benchmark bands (per-line research log collapsed), Discount-architecture waterfall, Value-at-Risk + Assumptions Register, Counter-email draft (bottom accordion), Renewal & Forward Levers (rate-lock/CPI cap/carry-forward, from contract-review).

### Pro-forma (deepened; the buried depth surfaced)
- **Default-visible:** Compact TCO/component summary **plus Payback KPI (simple + discounted)**, the **P&L/cashflow-by-year matrix + Insights un-hidden** (only line-item granularity stays behind an expand), "What would change this conclusion" pre-mortem callout, Savings Waterfall (four named levers), Scenarios (Low/Base/High), Sensitivity tornado.
- **On-demand:** NPV-vs-discount-rate curve with Current + Break-even markers, Break-Even & Robustness panel, TCO Teardown, sourced Assumptions Register (Research Log folded in as row detail), Export-to-Excel.
- **One global WACC control** feeds the matrix, KPIs, and the curve (no duplicate sliders).

**Alternative considered:** a 3-tab Negotiate split adding a "Prep & Coordination" tab for SME + MSA. Rejected — two small items don't justify a thin tab; fold them into Strategy & Positions as collapsed sections.

---

## 2. Unified KEEP / IMPROVE / CUT / SURFACE / MERGE Table (grouped by destination sub-tab)

| Destination | Item (source) | Action | Rationale |
|---|---|---|---|
| **Overview** | Deal Score + Go/No-Go + Conditions (platform + contract-review) | KEEP/MERGE | One committed recommendation; cut duplicate methodology essay to a one-line citation. |
| Overview | Key Issues index (platform) | SURFACE | Genuine synthesis; promote above all sub-tabs as shared context. |
| Overview | Total-deal ZOPA/TCO readout (platform) | SURFACE | The actual decision number; was dead-last in a 20+ panel scroll. |
| **Scope** | Deliverables Register, In/Out-of-Scope, Milestones, Acceptance Scan, Change-Control, Rewrite Map (scope-sow) | KEEP | Platform has no equivalent; this is the "what are we buying" record. Rewrite Map is undervalued, keep it. |
| Scope | Section Coverage Map (scope-sow) | MERGE | Fold into In/Out-of-Scope as a compact pill strip, not its own panel. |
| Scope | Assumptions + Dependencies registers (scope-sow) | MERGE | One register, Type column; halves vertical space. |
| Scope | Payment Milestone Reconciliation table (scope-sow) | CUT | Same milestone rows as Milestone Schedule; replace with a "Reconciles?" flag column on the one table. |
| Scope | Rate Card raw table (scope-sow) | CUT/MERGE | Second copy of commercial pricing; keep only the footing-check exceptions, read from commercial. |
| Scope | Total Contract Value tile, Next Steps panel, prose narratives (scope-sow) | CUT | TCV repeats the header; Next Steps → one-line footer; narratives → bullets. |
| **Review** | Findings detail, Obligations, Documents/evidence-gate (contract-review) | KEEP/SURFACE | Platform gaps; Obligations and Documents were buried, deserve higher billing. |
| Review | Risk Heatmap + Protection & Coverage (platform + contract-review, both render same 14-cat array) | MERGE | Confirmed duplicate in code AND across skill; keep the richer Protection & Coverage rendering, drop the second table. |
| Review | Vendor Tactics (contract-review) | CUT | Platform runs this live; keep only platform's. |
| Review | Score Methodology essay (contract-review) | IMPROVE | Cut to a one-line citation of the live platform score. |
| **Strategy & Positions** | Negotiation Strategy, Playbook, Concession Sequencing + BATNA (platform + contract-review Legal) | KEEP | Deepest, most-used content; legal-argument playbook is a genuine platform gap. |
| Strategy | Leverage read + Talking points (platform) | MERGE | Single-sentence panels; fold into the posture banner. |
| Strategy | Position Map (platform + contract-review) | MERGE | Same array re-grouped; make it a "group by tier" toggle on Playbook. |
| Strategy | Red Lines (platform) | MERGE | Dedupe against redline-tier items already in Playbook; keep as a pinned strip. |
| Strategy | Persona tone toggle (contract-review: 5 tones) | IMPROVE | Trim "Curious"/"Astonished"; keep Standard/Collaborative/Aggressive. |
| Strategy | SME Pre-Engagement, MSA-Already-Covers (platform + contract-review) | KEEP (collapsed) | Coordination content; anchor SME from the Documents evidence-gate. |
| **Pricing & Commercial** | Levers & Protection-Score model (platform) | SURFACE (hero) | Best panel in the tab; live price↔protection tradeoff, was 6th. |
| Pricing | ZOPA by line item, Ranked counter + trade matrix (platform) | SURFACE | Most actionable tables; move up. |
| Pricing | Pricing-model rec, Benchmark bands, Discount waterfall, Value-at-Risk (platform) | KEEP (collapsed) | Real depth; show one-liners, collapse the dense grids/logs. |
| Pricing | Volume/consolidation leverage (platform) | MERGE | Static prose; fold into pricing-model panel as bullets. |
| Pricing | Counter-email draft (platform) | KEEP (on-demand) | Output artifact; bottom accordion. |
| Pricing | Cost Build / Benchmarks / Counter / Discount Architecture (contract-review Commercial) | CUT | 4-of-5 duplicate the platform's live commercial block; favor platform as source of truth (avoids stale-number drift). |
| Pricing | Value-at-Risk + Assumptions Register framing (contract-review) | KEEP | Risk/bearer allocation not in platform; keep as one compact panel. |
| Pricing | Renewal & Forward Levers (contract-review) | KEEP | Forward-looking rate-lock/CPI/carry-forward; the one non-duplicate commercial piece. Rename for clarity. |
| **Pro-forma** | P&L/cashflow matrix + Insights + NPV slider (platform, hidden behind toggle) | SURFACE | The core complaint; un-hide by default, only line-item granularity stays collapsed. |
| Pro-forma | Payback KPI (pro-forma skill) | KEEP/MERGE | Genuinely additive; inject into the existing summary row (don't ship a 2nd KPI strip). |
| Pro-forma | "What would change this conclusion" callout (pro-forma) | SURFACE | Cheap, high-value pre-mortem under the KPIs. |
| Pro-forma | Savings Waterfall, 4 named levers (pro-forma) | SURFACE | Best exec-readout artifact; not on platform today. |
| Pro-forma | NPV-vs-rate curve + Break-even, Break-Even & Robustness (pro-forma) | SURFACE (on-demand) | Real computed analytics (bisection solve); additive, keep compact. |
| Pro-forma | Assumptions Register + Research Log (pro-forma) | KEEP/MERGE | Provenance/trust layer; fold Research Log in as row detail. |
| Pro-forma | Escalation-cap slider w/ governance band (pro-forma) | KEEP | The real governance find (Target 3.0/Ceiling 6.0, term-linked). |
| Pro-forma | WACC slider duplicate, Cost-buildup chart, Low/Base/High chart, by-year matrix rebuild, 2nd tornado (pro-forma) | CUT | All duplicate platform features; the by-year matrix is the *evidence* to un-hide the platform's own, not rebuild it. |
| Pro-forma | 4 "Reading the X" narrative panels (pro-forma) | IMPROVE | Collapse each to a 2-line caption under its chart; keep insight, drop panel chrome. |

---

## 3. Analysis-Paralysis Check (deliberate demotions and cuts)

**Cut outright (redundant, favor platform-live or the single owner):**
- All 4 duplicated commercial sub-tabs from contract-review (Cost Build table, Benchmarks, Counter-Proposal, Discount Architecture) and its Vendor Tactics — the platform computes these live; a parallel static copy is a correctness/drift risk, not just clutter.
- From pro-forma: WACC slider (rebuilt 3x), Cost-buildup chart, Low/Base/High chart, the rebuilt by-year matrix, the second tornado.
- From scope-sow: the duplicate Payment Milestone Reconciliation table, standalone Next Steps panel, Total Contract Value tile.
- Duplicate Risk Heatmap table in Review.

**Demoted to on-demand (kept, not default-visible):** SME Pre-Engagement, MSA-Already-Covers, pricing-model 6-card grid, benchmark research logs, discount waterfall, Value-at-Risk register, counter-email draft, NPV curve, Break-Even/Robustness, TCO Teardown, RACI, SLA/KPI register (auto-collapse when thin), Scope calculation table.

**Collapsed to captions/one-liners:** every "Reading the X" narrative (pro-forma), "Where This Stands" and other essay blocks (scope-sow), score-methodology essays, leverage-read and talking-points sentences.

**Net footprint:** Negotiate's ~21-section single scroll becomes two focused sub-tabs of ~4 default panels each; contract-review's 17 sub-tabs collapse to non-duplicative content spread across Review/Strategy/Pricing; pro-forma contributes exactly 5 additive pieces plus the un-hidden matrix; scope-sow lands as one trimmed Scope tab. The rep sees roughly 4-6 panels per sub-tab by default, everything else one click away.

---

## 4. Open Questions for Marc

1. **Negotiate split placement:** two top-level sub-tabs (recommended) vs. one "Negotiate" parent with two nested tabs? The former is flatter; the latter keeps the top bar shorter (5 tabs vs 6).
2. **Single source of truth for pricing/rate/milestone-dollar data:** confirm the platform commercial/pro-forma model owns the numbers, and Scope's Rate Card + Payment sections *read from* it (showing only footing exceptions). This is the correctness call, not just layout.
3. **Payment-to-deliverable linkage ownership:** should Scope own the milestone→payment linkage and have Pro-forma's cashflow model *consume* it (recommended), or keep Pro-forma authoritative?
4. **Vendor Tactics:** cut the skill's copy entirely and rely on platform-live — unless the skill's detection differs materially. Does it?
5. **Persona tones:** trim to Standard/Collaborative/Aggressive (recommended), or keep the full 5?
6. **SME + MSA home:** fold into Strategy & Positions as collapsed sections (recommended) or give them a dedicated Prep tab?
7. **Renewal & Forward Levers:** confirm this is genuinely forward-looking (not a restatement of the current-deal commercial block) before keeping it as a distinct panel.

Source files referenced in the four evaluations: platform `assets/pv/pv-11/12/13-deal-*.js`; `_dashboards_ORIGINAL/lilly-contract-review.html`, `scope-sow-architect.html`; pro-forma-builder dashboard.

---

## Open Questions - RESOLVED (Marc, 2026-07-22)

1. **Negotiate split** -> TWO top-level sub-tabs (Strategy & Positions / Pricing & Commercial). [recommended]
2. **Pricing source of truth** -> the SUPPLIER proposed pricing is EXTRACTED from supplier-provided documents (email, Excel, PPTX deck, PDF, SOW / order form / work order). That extraction becomes the canonical internal record the commercial/pro-forma model OWNS; Scope Rate Card + Payment sections READ from it (footing exceptions only). Requires a document-extraction step, grounded + never fabricated per the data-grounding protocol.
3. **Payment-to-deliverable linkage** -> Scope owns milestone->payment; Pro-forma cashflow consumes it. [recommended] CAVEAT (Marc): some pricing models have NO milestones (subscription, usage/consumption, fixed recurring). The reconciliation must DEGRADE GRACEFULLY - show the periodic/consumption payment structure for milestone-less models instead of forcing a milestone map. Ties to the 6 pricing-model types.
4. **Vendor Tactics** -> CHECK whether the contract-review skill vendor-tactics detection differs materially from the platform live 12-cat scan (Marc: verify before cutting). Cut the skill copy only if not materially different. [comparison check in progress]
5. **Persona tones** -> trim to Standard / Collaborative / Aggressive. [recommended]
6. **SME + MSA home** -> fold into Strategy & Positions as collapsed sections. [recommended]
7. **Renewal & Forward Levers** -> DUAL scope, trait-aware. (a) Current deal: the forward caps we NEGOTIATE IN (price renewal caps, CPI cap, carry-forward). (b) If the project is a RENEWAL (dealIsRenewal trait): ALSO pull existing price-increase-cap language from BOTH the governing MSA AND the existing EXPIRING contract, and verify the proposed renewal deal ADHERES TO or BEATS those caps. New-deal = forward caps we set; renewal = forward caps + compliance check vs MSA + expiring-contract cap language.


### Q4 RESOLVED (vendor-tactics comparison, 2026-07-22): KEEP the skill's version.
The platform Deal tab's 12-category vendor-tactics scan is INERT SEED DATA (dealVendorTacticsHTML renders a static per-project array of flag/text lines; the live contractReview payload has no tactics field at all - it is never computed against the real contract). The contract-review SKILL's vendor-tactics (references/vendor-tactics.md, wired as review Pass 3, gated checklist item) is REAL evidence-based per-clause detection grounded in the actual document + governing rate card + parent MSA + prior WO/SOW pricing, with required evidence citations. Same 12-category taxonomy, materially different depth. DECISION: keep the skill's coverage (do NOT cut); relabel the platform section as illustrative OR wire the skill's Pass-3 output into the Deal tab's live review host.
