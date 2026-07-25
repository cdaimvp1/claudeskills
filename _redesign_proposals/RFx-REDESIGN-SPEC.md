# RFx Dashboard — Redesign Spec (Reflect-Only Claude Skill)

**Status:** decisive build spec. Supersedes `_redesign_proposals/RFx.md` (which was platform-internal and predates Marc's binding direction below). Target artifact: a **single desktop-native Claude skill, "RFx dashboard,"** serving RFI / RFQ / RFP for any commodity, reflect-only, no live engine/DB/Graph, forward-compatible with Cowork. Lifecycle **ends at selection** and hands the winner to the already-built Deal dashboard.

Naming rule applied throughout: the artifact and all surfaced copy say **RFx** (never RFP); "RFP/RFI/RFQ" appear only as the chosen *instrument* label for a given event.

---

## A. Recommended structure

The platform base (`Overview → Scoring → Analysis → Recommendation`) and Marc's 6-section model are **not two lists to concatenate** — they are the same lifecycle at two resolutions. Reconciliation: keep the platform's 4-subtab spine as the top-level IA (it already won a Marc-approved redesign and carries dual-ranking + sensitivity + merged ranking), and **fold the 6 content sections in as named panels inside those subtabs**. The 6-section model contributes two things the platform lacks as first-class surfaces: **Commercial & Bid Leveling** and **Evaluation Readiness**. Those get promoted; the rest map cleanly onto existing subtabs.

**Top-level IA — 4 subtabs + 1 handoff action (not a tab):**

**1. Executive Readout** *(= platform Overview, renamed to Marc's section-1 wording)*
- Event strip: instrument (RFI/RFQ/RFP) + phase X of Y + deadline pill (4-state: On-track/At-risk/Breached/Stale) + next milestone + award basis + doc/landscape links + panel roster.
- Participation glyph row on each supplier contact line — Agreed / CDA / MSA / Response / Demo-set / Demo-done as **check/half/flag/dash shapes with labels** (accessibility: shape+label, never color-only). *(from evaluation-engine + rfp-case-manager, reconciled into one row.)*
- KPI StatRow: 3-yr TCO · CCI · scorecards-submitted · **Q&A open** (5th tile added).
- Completeness & Risk Roll-up table (conforming Y/N · completeness% · red-flags · gating items · award tier). *(from rfp-response-analysis.)*
- **SupplierScoreGrid with the score triad** (Theo/AI-first-pass · Team/panel-average · pre-RFP market-scan) + Coverage% mini-bar + award-tier pill; row-click selects the supplier for Deep Dive. Triad relabeled commodity-neutral: **"AI first-pass / Panel / Pre-RFx scan."**
- Generated evaluation lede — **claim-gated** (cites or `[CONFIRM …]`).

**2. Scoring** *(platform Scoring — the "protected win," structurally unchanged; only IT-fingerprint strings and green/dark-mode styling touched)*
- ScoringMatrixTable (criteria × weight × supplier, panel-average to 1dp, ★ leader col, Weighted-Total + Gate/Must-Have footer rows).
- **Dual-ranking surface (must-keep):** compensatory leader and Must-Have gate-pass leader shown **side by side**, with the explicit `gateConflict` callout naming the gate-pass leader when the compensatory leader carries a Must-Have zero.
- CriterionCards (category · weight% · sub-requirements with within-category weight% + must-have flags + leader/field-high).
- Collapsible RequirementsRegister (category-weight bar + full requirement table: text · MoSCoW chip · acceptance criterion · traces-to objective · weight · confidence bar).
- Named **rubric bands** (6-band 0–5 with definitions) shown wherever a bare score appears.
- Weight sanity gate: category weights sum to 100%, unconfirmed weights labeled **"DRAFT — confirm with evaluation team"** (never silently normalized). *(from rfp-engine.)*

**3. Analysis** *(platform Analysis; hosts Marc's "Supplier Deep Dive," "Requirements Comparison," and the promoted "Commercial & Bid Leveling")* — segmented **Individual / Cross-Supplier**.
- *Individual (Supplier Deep Dive):* supplier chip selector; **Internal Buyer Context strip** (relationship/spend/risk-status/security-signal — explicitly "does not affect coverage scores," de-Lilly'd per §6 of the base survey); 5 jump-nav sections — Response summary & profile · **Requirements fit with per-requirement source citation (page/section into the actual response doc — the single clearest content gap, from rfp-response-analysis's `ReqStatusCell`)** · Strengths/Gaps/Red-flags · Commercial & operational · Clarifications (DRAFT + GATING-first). Add small **Inconsistencies card** (submission-internal contradictions, distinct from a low-score gap).
- *Cross-Supplier (Requirements Comparison + Commercial & Bid Leveling):*
  - CoverageHeatmap (category×supplier %, ringed leader) + **per-requirement drill-down** (MoSCoW pill, status cell, confidence, citation).
  - ReqMatrix (per-requirement×supplier, colored by met/partial/gap level).
  - **Commercial & Bid Leveling** *(promoted to a named panel — the highest-value import of the whole set):* a **Bid-Leveling Gate** status strip (Complete/Pending per supplier) that must clear before ranking is trusted; raw PricingTable ("Not submitted" never fabricated); **Normalized all-in-unit comparison** (annualize recurring + amortize one-time ÷ denominator → single unit; per-component breakdown + human-auditable reconciliation string; `BELOW / IN_LINE ±5% / ABOVE / NO_REFERENCE` read). Denominator/labels **parameterized by commodity** (per-seat/FTE/site/unit/volume), not hardcoded to $/seat/yr.
  - RiskRollup (completeness/fully-meets/conforming/red-flags/gating/clarifications + gate-vs-total callout).
  - **Q&A & Addenda** section (revives the dead-code Q&A surface + adds Addenda): QaDistribution (anonymized, deduped by question-key, same answer to every bidder) + category roll-up bar + oldest-pending-age + routed-to column + **Addenda table** (formal post-issuance requirement changes with amendment traceability). *(from rfp-case-manager + rfp-engine.)*

**4. Recommendation** *(platform Recommendation + Marc's "Evaluation Readiness"; ends the lifecycle)*
- Final-recommendation banner (top of advisory ranking · tier · generated argument, claim-gated).
- 4-stage decision tracker (AI advisory → Panel scoring → Group decision → Award).
- "The case, per supplier" For/Against grid.
- **Sensitivity/robustness verdict** — weight-perturbation ±5pp with plain-English **"robust / fragile-to-X"** string (confirm it actually renders; RFx.md flagged risk of it going dark).
- **Evaluation Readiness panel** *(promoted from Marc's section 6):* a checklist that gates the handoff — bid-leveling complete? weights confirmed (no DRAFT)? gate-conflict resolved or acknowledged? mandatory reviews cleared? open gating clarifications closed? Each item cites or shows `[CONFIRM …]`. This is the "are we allowed to hand off yet" surface.
- **Optional Award-Scenario modeler** (single-vs-split allocation slider recomputing blended total/coverage/Year-1/TCV via the same weighted kernel; eligibility gated by tier + no gate-fail). Kept but marked advisory-only. *(from evaluation-engine.)*
- **Provenance / carry-forward block** → feeds the Deal handoff object (see §C).

**Handoff (action, NOT a 7th tab):** a "Send winner to Deal dashboard" action on Recommendation emits the handoff state object (§C). Everything post-decision (negotiation, ZOPA locking, contract) belongs to Deal.

---

## B. Adoption table

| Idea | Source | Decision | Why |
|---|---|---|---|
| Dual ranking (compensatory + gate-pass) + explicit `gateConflict` | Platform | **Adopt** | Marc-mandated must-keep; stops a Must-Have failure being silently outscored, any commodity. |
| Two-level effective weights + 1.0-sum assertion | Platform | **Adopt** | Governance-grade defensibility; portable arithmetic. |
| Named 6-band 0–5 rubric with definitions | Platform | **Adopt** | Every score human-legible, not a bare number. |
| Weight-sensitivity ±5pp → robust/fragile verdict | Platform + eval-engine | **Adopt** | Turns "is this solid" into a reproducible answer; confirm it renders. |
| Reconstructable audit trail (one serializable object) | Platform + eval-engine | **Adopt** | Replayable by a reviewer; core to reflect-only trust. |
| Normalized all-in unit price + BELOW/IN_LINE/ABOVE | Platform `price-normalize` | **Adapt** | Machinery is neutral; **parameterize denominator + component labels** per commodity. |
| Score triad shown side by side (AI/Panel/pre-RFx scan) | Platform | **Adapt** | Keep; relabel neutral, drop "Landscape/Theo" branding. |
| Draft-don't-send letters as typed `draft:true` object | Platform | **Adopt** | Reflect-only guarantee; nothing auto-sent. |
| Bid-Leveling Gate (must clear before ranking) | rfp-response-analysis | **Adopt** | Single most valuable skill import; apples-to-apples pricing before any score. |
| Completeness & Risk Roll-up table | rfp-response-analysis | **Adopt** | Compact conformance snapshot on Executive Readout. |
| Per-requirement citation drill-down (`ReqStatusCell`) | rfp-response-analysis | **Adopt** | "Clearest content gap" in platform; satisfies claim-gate. |
| Submitted-vs-inferred labeling (research-pending, med-confidence) | rfp-response-analysis | **Adapt** | Keep the *label*; but no fabricated defaults — inference must cite or abstain. |
| Award tier as derived field (never array index) | rfp-response-analysis | **Adopt** | Ordering stays stable as data changes. |
| 8-phase lifecycle stepper | rfp-case-manager | **Adopt** | Cleanest canonical phase model; header spine. |
| 4-state deadline pill (Breached/At-risk/Stale/On-track) | rfp-case-manager | **Adopt** | Derived purely from dates + refresh; no live dependency. |
| Q&A Distribution (anonymized, dedup by question-key) | rfp-case-manager | **Adopt** | Fairness rule baked in; revives platform dead-code Q&A. |
| Comms-discipline anomaly flag | rfp-case-manager / platform `CaseHealth` | **Adapt** | Surface-only watchdog; reflect, never auto-chase. |
| Formal Addenda + amendment traceability | rfp-engine | **Adopt** | Gap on both current surfaces; audit trail for changed requirements. |
| Weight sanity gate + "DRAFT — confirm" labeling | rfp-engine | **Adopt** | Scoring tab inherits the validation gate. |
| Stakeholder Requirements Synthesizer / reconciliation grid | rfp-engine | **Drop from dashboard** | Pre-issuance authoring; stays rfp-engine's job, consumed as source. |
| Participation glyph row (shape not color) | eval-engine | **Adopt** | Accessibility-correct; reconcile with case-manager stepper into one row. |
| Supplier Scoring Grid + Tier/Gate pills, click-to-drill | eval-engine | **Adopt** | Canonical leaderboard; merges with platform SupplierScoreGrid. |
| Award-Scenario single-vs-split modeler | eval-engine | **Adapt** | Keep as advisory-only on Recommendation; not the decision. |
| Evaluation Readiness checklist as a gate | Marc's 6-section model | **Adopt** | New first-class panel; gates the handoff. |
| Locked 6-tab skill skeleton (Exec/Deep/Heatmap/Scoring/Risk/Award) | skills | **Drop** | Platform's flattened narrative page judged superior; don't import the shell. |
| Charcoal/red/Georgia "suite" shell | skills | **Drop** | Replaced by MCM plum/teal/burnt-orange (§ design). |
| Dark mode / pale fills / stoplight palette | platform + skills | **Drop** | Marc: no dark mode, no pale fills, no stoplight, outline pills. |
| 7th post-decision tab / async deep-brief job UI | platform/proposal | **Drop** | Lifecycle ends at selection; Deal owns after; Marc's earlier cut was correct. |
| Duplicated numeric kernels / two DOCX generators | skills | **Adapt** | Converge on **one shared kernel** so proposed and official scores are identical arithmetic. |

**Design/color (applies to every subtab):** MCM system matching Deal/Landscape — plum `#5C2B50` + teal + burnt-orange as the ≤3-color reference; **no stoplight, no dark mode, no pale fills, outline pills**; color does a job (leader highlight / status tint), neutral is canvas; glyph shape+label carry status, never color alone.

**Claim-gate (every generated finding):** cite a source (evidence-as-small-badge with page/section) **or** abstain with `[CONFIRM …]`. No fabricated illustrative defaults anywhere.

---

## C. Data shape + RFx→Deal handoff object

The skill reads **one persisted event object** (a JSON case-file, the reflect-only source of truth — no DB/Graph). Shape, commodity-neutral:

```
RfxEvent {
  event: { id, title, instrument: "RFI"|"RFQ"|"RFP", commodity, phase, phaseOf,
           awardBasis, keyDates{}, lastRefresh, docLink, landscapeLink, traits[] }
  requirements: Requirement[] {
     id, text, category, weightRaw(1-5), weightInCategoryFrac, categoryWeightFrac,
     effectiveWeightFrac, mandatory(bool), moscow, acceptanceCriterion,
     tracesTo, validated(bool)  // starts unvalidated=DRAFT
  }
  weightAssertion { effectiveWeightSum, ok(≈1.0) }
  suppliers: Supplier[] {
     id, name, participation{agreed,cda,msa,response,demoSet,demoDone},
     buyerContext{ relationship, spend, riskStatus, securitySignal },  // reflect-only, non-scoring
     responseDoc{ present, ref }
  }
  scores: {
     aiFirstPass: Cell[], panel: EvaluatorScorecard[], preRfxScan: Cell[]
     // Cell { supplierId, requirementId, score(0-5), band, note, citation }
  }
  coverage: CoverageCell[] { requirementId, supplierId, score, status: met|partial|gap }
  dispersion { perCellSd[], highVarianceCells[], consensusLevel }
  calibration: Evaluator[] { meanScore, bias, tendency, outlier }
  ranking { compensatory[], gatePass[], leader, gateLeader,
            gateConflict{ present, supplierId, mustHaveZeroReqId } }
  sensitivity { robust(bool), fragileCategories[], verdict(string) }
  commercial: NormalizedOption[] {
     supplierId, rawQuote{}, denominatorUnit, allInUnit,
     components[]{ label, amount, shareOfUnit, amortized }, reconciliation, compareRead
  }
  bidLeveling { perSupplierStatus: complete|pending }
  qa: { distribution[], openQuestions[]{category,pending,oldestAge,routedTo}, addenda[] }
  caseHealth { stale, openQuestions, awaitingResponses, commsAnomalies[], flags[] }
  readiness { items[]{ label, status: ok|blocked|confirm, evidence } }
  auditTrail { weightSet, perCriterionScores[], gateReconciliation, sensitivity, ranking }
}
```

**RFx→Deal handoff object** (emitted by the "Send winner to Deal" action; matches Marc's field list, advisory-only):

```
RfxToDealHandoff {
  selectedSupplier { id, name, advisoryTier }
  requirementModel { categoryCount, mustHaveCount, note: "weights locked at scoring" }
  normalizedTco { allInUnit, denominatorUnit, components[], reconciliation,
                  tag: "indicative — firm in negotiation" }
  awardConditions[]          // gate-pass status, mandatory-review outcomes
  openIssues[]               // open gating clarifications, unresolved gateConflict
  commitments[]              // supplier-stated terms/escalator/exit (or "to be negotiated")
  risks[]                    // red-flags, high-variance cells, fragile-sensitivity note
  evidence[] { claim, sourceRef }   // citations backing each carried finding
  conformanceStatus          // "Conforming" | open gating item
  provenanceNote: "financial-viability grade and exit terms re-validated during negotiation"
  draft: true                // nothing locked; Deal owns everything after
}
```

Deal reads this and takes over. RFx never writes past selection.

---

## D. Hub-skill home + feeding skills

**Owner: a new thin `rfx-hub` skill** (dashboard orchestrator), NOT one of the four promoted in place. Rationale: the survey shows no single existing skill can own it cleanly — rfp-engine is pre-issuance authoring (no dashboard, shouldn't become one), rfp-case-manager is state/lifecycle (explicitly boundaried out of scoring), rfp-response-analysis owns *proposed* not *official* scores, and evaluation-engine owns official scoring but renders via a different primitive (`show_widget`) than the others (raw JSX). A thin hub sidesteps the render-primitive war and the "proposed vs official" ownership tangle by being an **orchestrator over the persisted `RfxEvent` object**, standardizing on **one render primitive** (raw JSX artifact, the desktop-native path) and **one shared numeric kernel**.

Feeding pattern (each keeps its standalone deliverables — never-regress, branch don't replace):

- **rfp-engine** → feeds `requirements[]` + weights + pricing template + addenda. **Keeps** its locked institutional templates, `requirements_matrix.xlsx`, `case_handoff.json`. Hub consumes as source, never rebuilds a competing matrix.
- **rfp-case-manager** → feeds `event`, `participation`, `keyDates`, `qa`, `caseHealth`. **Keeps** `_case_file.json`, status snapshots, meeting drafts, comms log. Hub reads its state layer; it stays the state/orchestration owner.
- **rfp-response-analysis** → feeds `scores.aiFirstPass`, `coverage`, `commercial` bid-leveling, per-requirement citations. **Keeps** `analysis_summary.docx` (its primary 30-40pp deliverable, "never reduced to a pointer"), debrief drafts, pipeline CSVs. Its output is labeled **proposed** in the hub.
- **evaluation-engine** → feeds `scores.panel`, `ranking`, `sensitivity`, `dispersion`, `calibration`, `auditTrail`, `readiness`. **Keeps** `evaluation_report.docx`, all CSVs, full comms suite (BAFO/award/non-award/debrief). Its output is labeled **official** in the hub.

Each feeder returns a **bounded, cited slice** (only its owned fields, each carrying `sourceRef`); the hub composes, never re-scores (composition-over-duplication, mirroring `decision-deck.service`). A **proposed-vs-official lens/toggle** in the hub resolves the two-dashboard duplication without a second build.

---

## E. Commodity / instrument flexibility (compose-by-traits)

One base composes via a **`traits[]` descriptor** on `event` (mirrors Theo's locked "one base + compose by traits"). No mode-picker up front; traits add/remove panels and parameterize labels.

**Instrument traits** (RFI / RFQ / RFP):
- `RFI` → requirements are informational; **suppress** Scoring's Weighted-Total footer and the Award-Scenario modeler; Recommendation becomes a "shortlist readout" not an award. Bid-Leveling optional.
- `RFQ` → price-dominant; **elevate** Commercial & Bid Leveling to the primary comparison; requirements collapse to conformance yes/no; rubric bands simplify to pass/fail + price rank.
- `RFP` → full surface, all panels on (default).

**Commodity parameterization** (via a small `commodityProfile`):
- `denominatorUnit` + component labels for normalization (per-seat/FTE/site/case/kg/hour/unit).
- Must-Have exemplars swapped per category (insurance certificate / capacity guarantee / delivery SLA / SOC 2 / cGMP cert …) — **no IT default**.
- Mandatory-review set is pluggable ("InfoSec" → Quality/EHS, Clinical/Regulatory, Legal, whatever the commodity needs).
- Approval chain is a generic **pluggable "approval-ceiling" concept** (FRAP/ATC/ATS stripped to a configurable chain).
- Buyer-context strip fields configurable (drop Defender/TPRM-specific; keep generic relationship/spend/risk/compliance status).

All IT fingerprints from §6 of the base survey (Lilly branding, FRAP/ATC/ATS, TPRM, Defender, SOC-2-as-flagship, demo vendor names, node numbering, `pal-navy-teal`) are **stripped or parameterized** at this layer. Traits are declarative; the same JSX renders every instrument×commodity by reading the descriptor.

---

## F. Phased build sequence

**Phase 0 — Reconcile-first (cheapest, highest-confidence; prerequisite).**
- Confirm dead-code disposition: `rfxQaHTML` (revive into Q&A & Addenda), `rfxPhaseBannerHTML` (confirm deletion with Marc), retired React "lens tab" sub-nav (remove).
- Confirm Sensitivity actually renders.
- Confirm `docs/master-plan.md` Stage 1 scoring-ownership fix is reflected (evaluation-engine = official; response-analysis/deep-dive = descriptive-signal-only).
- Lock the single render primitive (raw JSX artifact) + single shared numeric kernel.

**Phase 1 — Base spine + data contract.** Stand up `rfx-hub` reading the `RfxEvent` object; port the 4-subtab platform IA verbatim (Scoring untouched); implement dual-ranking + gateConflict + rubric bands + weight-sum assertion. MCM recolor (color-layer only, no logic change). Strip IT fingerprints to `commodityProfile` params.

**Phase 2 — Executive Readout + Analysis content grafts.** Participation glyph row (reconciled), 5th Q&A KPI, Completeness roll-up, score triad relabel; per-requirement citation drill-down + Inconsistencies card. Claim-gate enforcement pass.

**Phase 3 — Commercial & Bid Leveling (highest-value import).** Bid-Leveling Gate + parameterized normalized-unit comparison + BELOW/IN_LINE/ABOVE. Q&A & Addenda section.

**Phase 4 — Recommendation + Evaluation Readiness + handoff.** Sensitivity verdict confirmed-rendering; Evaluation Readiness gate; optional Award-Scenario modeler (advisory); emit `RfxToDealHandoff` object + "Send winner to Deal" action.

**Phase 5 — Compose-by-traits.** Wire instrument traits (RFI/RFQ/RFP) + commodity parameterization; verify one base renders all instrument×commodity combos with no fabricated defaults.

**Phase 6 — Feeder bounding + never-regress verification.** Wire the 4 skills as bounded cited-slice feeders; verify each retains its standalone deliverables (analysis_summary.docx, evaluation_report.docx, institutional templates, case-file) unbroken; proposed-vs-official lens toggle live.

**Phase 7 — Adversarial + correctness sweep.** Claim-gate audit (every finding cites or abstains), no-fabrication check, malicious-code review per increment, Playwright render QA over http, dual-ranking/gateConflict edge cases (Must-Have zero, all-weights-zero fallback, div-by-zero on normalization).

Gate between phases: no phase ships components unwired to the live `RfxEvent` mount (integrate-or-don't-ship). Scoring subtab is a protected win — touched only for IT-string removal and MCM recolor, never structurally.
---

## G. The three sign-off decisions — recommendations (accuracy / performance / efficiency)

All three align with §D/§A. Reasoning by dimension:

1. **HUB HOME → NEW THIN `rfx-hub`** (not hosted in evaluation-engine).
   - Accuracy: composes cited slices over ONE persisted RfxEvent object + ONE shared numeric kernel, so proposed and official scores use identical arithmetic (no drift); every number traces to its owning feeder's cited output. Hosting in evaluation-engine entangles composition with scoring and risks re-derivation.
   - Performance: reads the persisted object (generate-once / recall-fast) instead of re-running the heavy evaluation each render.
   - Efficiency: clean seam, sidesteps the render-primitive war (show_widget vs raw JSX) + the proposed-vs-official tangle; one compose point reused by 4 feeders. Enabler: ONE render primitive (raw JSX) + ONE shared kernel.

2. **SCORING OWNERSHIP → SPLIT** (evaluation-engine = OFFICIAL, response-analysis/deep-dive = PROPOSED / descriptive-signal-only) + ONE shared kernel.
   - Accuracy (biggest lever): one binding owner of the official score prevents conflicting numbers; the first-pass is labeled PROPOSED, never binding; both call the SAME kernel (identical arithmetic; only inputs + labels differ).
   - Performance: staged — cheap first-pass early/fast; heavier official panel score only when evaluators submit.
   - Efficiency: one owner + one kernel kills the duplicated-kernel / duplicated-DOCX problem. Surface proposed-vs-official as a hub lens toggle.

3. **IA → KEEP THE 4-SUBTAB SPINE** (Overview/Scoring/Analysis/Recommendation); fold the 6 sections in as panels.
   - Accuracy (decision-accuracy): keeps dual-ranking/gate/sensitivity rigor prominent + navigable; matches score→analyze→recommend; flat scroll buries it. Scoring stays the protected win.
   - Performance: 4 subtabs map 1:1 to the 4 feeder slices → bounded data flow + lazy population.
   - Efficiency: the spine is the proven, approved platform base → adopt it (colour/label only), far less build than a new IA.

**CROSS-CUTTING ENABLERS (make all three win):** ONE persisted RfxEvent object (single source of truth + recall-not-recompute); ONE shared numeric kernel (no drift, no dup); compose-not-duplicate (hub reads cited slices, never re-scores — accuracy + claim-gate integrity); compose-by-traits (one base for every instrument x commodity). These are the platform's own patterns (materialized-analysis, decision-deck composition, claim-gate, one-base-compose-by-traits).

**STATUS:** all 3 decisions RESOLVED per above (Marc to confirm). NEXT: mockup the reconciled structure for review, then build per §F phases.
