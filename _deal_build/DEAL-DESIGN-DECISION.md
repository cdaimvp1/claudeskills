# Deal Dashboard — Design Decision + Build Plan (max-effort 3-source synthesis, 2026-07-23)

> Output of the `deal-design` workflow (3 approaches at Opus/Fable-max -> Opus-max synthesis -> Opus-max build plan). Awaiting Marc sign-off. Grounded in `_deal_build/_parts/data.js`, `DEAL-TAB-MAP.md`, and the 3-source reviews.

---

## PART 1 — RECOMMENDED DESIGN

I have full grounding: the canonical `dashboardData` object (confirmed shape, ISS-01..12 spine, `commercialLines[]` already carrying ask/target/fallback/max per row, `scenarios[]` SC-ask/target/fallback/max, `assumptions[]` with a bare discount-rate ASM-5 and no WACC label, `meta.contractSet` already driving adaptive tabs), and both `_deal_build` bugs confirmed (cross-doc conflict rows hardcoded at `tab-contract.js:111-121`; dangling `ISS-03b` patched by a runtime filter at `data.js:498-499`). Here is the adjudicated design.

---

# LILLY DEAL DASHBOARD, RECOMMENDED DESIGN
## One synthesis of the platform engine (S1), contract-review depth (S2), and `_deal_build` IA (S3)

**VERDICT: 4 tabs + 1 persistent strip.** `Overview · Terms & Review · Economics · Negotiation`, 9 subtabs, ~40 panels. This is Approach C's spine, corrected and enriched with the strongest moves from A and B. It drops zero decision-relevant capability, cuts the redundancy the brief names, and honors "fewer tabs."

**Naming/routing note (buildable as-is):** display names map onto the data object's existing jump namespace, so `summaryStrip[].jump` strings need no rewrite: Overview = id `brief`, Terms & Review = id `contract` (`sub:terms` preserved), Economics = id `commercials` (`sub:scenarios` preserved), Negotiation = id `negotiation`. The Python build owns routing; renames are a display map, not a data change.

**Source shorthand:** S1 = platform Deal tab (pv-11/12/13) · S2 = contract-review skill (P1 legal / P2 legal-neg / P3 commercial) · S3 = `_deal_build`. Lens = scope-sow / pro-forma / contract-review sub-skills that each return a bounded SLICE the hub merges into the one object.

---

## (a) RECOMMENDED STRUCTURE + DEFENDED TAB COUNT

### Persistent strip (all tabs, never a tab)
- Deal identity + contract-status (stage labeled best-effort, never faked). MERGE S1 status strip + S3 summary strip.
- **Who-has-the-pen chip** (party + basis + confidence, e.g. "Supplier, redline sent 07-15, High"). The one process-position signal the data reality permits; promoted here so it is glanceable everywhere. `deal.whoHasPen` (new field).
- Evidence-coverage pill (Strong/Moderate/Limited, plain-language, never a %). From `deal.evidenceCoverage`.
- ≤5 clickable counts from `deal.summaryStrip` (hard stops · high · open · signature conditions · 3-yr target-vs-ask gap), each a jump link. Replaces S1's full key-issues stack repeated above every mode.
- Session-snapshot disclaimer in footer (`meta.disclaimer`). Evidence chips inline on every material value; clicking a chip opens its source row in the Overview evidence band (B's drawer mechanism, which is what lets Sources fold).

### Tab 1 — OVERVIEW (id `brief`, no subtabs): the 2-minute decision readout
1. Verdict block: stance + 3 signature conditions (chips + jump) + limitations. MERGE S3 recommendation / S2 Go-No-Go+conditions / S1 pv-13 Go-No-Go.
2. Deal snapshot table. KEEP S3.
3. State-of-play digest (3 lines: who has the pen · last material event · next expected move), reads the comms slice, labeled best-effort. REDESIGN (Marc comms requirement).
4. Top-5 issues (renders the `issues[]` spine, tier chips, jump to Terms). MERGE S3/S1/S2.
5. Commercial headline + boundaries (Y1 ask/target/fallback/max, 3-yr TCV gap, total-deal ZOPA bar with BATNA floor marker), a computed rollup of the same `commercialLines[]`/`scenarios[]` the Deal Table reads. MERGE S3/S1.
6. Next-actions timeline (planning only, no assign/send). KEEP S3.
7. **Evidence & gaps band** (compressed): source×area coverage strip + top-5 critical unknowns + expanders for full source inventory and the impact-vs-ease missing-inputs register. COMPRESS S3's entire Sources & Gaps tab into one band. Assumptions register relocates to Economics where it does work.

### Tab 2 — TERMS & REVIEW (id `contract`): can I trust the paper?
**2A Documents & Conflicts:** slim term-evolution/conflict map (MSA→amendments→SOW→CO tree, dashed = missing DPA/Exhibit B, edges ONLY where a later doc changed or conflicts an earlier term, no emails) · term-conflict table driven by new `documentConflicts[]` (BUG FIX) · document family register with status/retention-class column (folds S1 contract-versions).
**2B Legal & Protection:** Protection Score gauge + mandatory methodology + deduction table (S2's auditable version wins; a bare S1 gauge is a black box) · findings register H/M/L (evidence excerpt · MSA cross-ref · VERIFIED/ASSUMED · $impact · SME route) · 14-category Protection & Coverage with the severity-vs-coverage callout (S2 Heatmap + Coverage were two views of one 14-cat set: one panel) · obligations register + imbalance flag (dates labeled static, we cannot monitor) · SME pre-engagement as collapsed copy-ready cards.
**2C Scope & Performance (adaptive):** full when a SOW exists (`meta.contractSet` already drives this), "no SOW in scope" note otherwise. Scope-definition score + gap-state · in/out scope + section coverage map · deliverables + acceptance-objectivity scan (flags `defined:false` AC-3/AC-4 → ISS-10) · milestone schedule with payment-% reconciliation to contract value · RACI + dependencies (compact; flags the two-Accountable / no-owner rows) · SLA/KPI register + change-control triggers (SL-1→ISS-06, change-control→ISS-11). The whole dimension S1 lacks.

### Tab 3 — ECONOMICS (id `commercials`): what is it worth, what should I pay?
**3A Deal Table & ZOPA:** THE Deal Table (normalized line items as rows; columns supplier-ask / target / fallback / max / per-line ZOPA band / benchmark chip: one table IS the normalization, the ask-vs-target view, and per-line ZOPA) · total-deal ZOPA/TCO rollup · discount architecture (S1 gross→net waterfall engine + S2 layer-by-layer narrative) · benchmarks gated band (real comps only, comparability pill, RESEARCH-PENDING when thin) · renewal-protection band (rate locks / CPI caps, links ISS-04/11).
**3B Pro-forma (pv-12 real engine + pro-forma lens):** TCO summary + Export-to-Excel + P&L/cash-flow-by-year · **WACC-labeled discount control with governance band + NPV-vs-rate curve + break-even + payback KPI** (S1's ASM-5 slider is unnamed/unbenchmarked) · **savings waterfall vs baseline/incumbent** (S1's is list→net only) · TCO teardown + pricing decomposition (auto hidden-cost multipliers dropped) · assumptions register with research log + confidence (relocated from Sources; drives recalc).
**3C Scenarios & Sensitivity:** ask→negotiated waterfall + 4-scenario table + narrative · sensitivity tornado precomputed static (S3 itself flags live-recalc as overbuilt for a snapshot) · value-at-risk table.

### Tab 4 — NEGOTIATION (id `negotiation`): how do I move them?
**4A Positions:** posture header (4-tier distribution + difficulty) · one position register for legal + commercial + scope (playbook-cited: position / arguments / predicted pushback / rebuttal / fallback / hard-stop / trade-against; per-issue "MSA already covers" flag; acceptance-rate only if genuinely sourced) · collaborative↔direct wording toggle (2-way, not 5 personas) · **term-interdependency mini-map** (which positions move together: cap×indemnity×insurance, price×term×SLA, scope×acceptance×milestones).
**4B Trade Plan:** objectives + evidence-based leverage table (data-driven strength; honest and weak when sole-source, never fake competitive tension; volume folded in as rows) · give-get 2×2 + concession ladders + 2-3 bundled packages · **round plan R1/R2/R3 with the single BATNA floor + escalation path, BATNA costed from the pro-forma slice** · interactive package simulator (toggle a package, protection score and $ move together) driven by **precomputed** `packages[].resultingProtectionScore/resultingNetTCO/deltas`, a lookup-swap, not a client-side model.
**4C Communications (replaces Meeting Brief):** comms thread synthesis (internal+external email/Teams distilled into an events ledger: ask / position / commitment / concession, each linked to `sourceRef` + `issueId`; pen-history timeline) · commitments & open-asks board (ours vs theirs; open / honored / breached / superseded) · **next-session brief as a GENERATED view** (agenda, opening, exact asks, expected pushback, closing, computed from open positions × latest thread state; per-block copy buttons; counter-email as draft-only, never send).

### Tab-count defense
- **Why not 3:** folding Economics into Negotiation is exactly what made S1's Negotiate mode an unscannable ~30-panel pile. "What is it worth" (desk analysis) and "how do I move them" (live prep) are consulted at different moments. Keep them separate.
- **Why not 5:** the two candidate 5th tabs both lose. **Sources & Gaps** is ~70% redundant with the inline evidence-chip system; its two live registers have real homes (assumptions → Economics where they drive recalc; coverage + missing-inputs → the Overview band). B's own design duplicates `assumptions[]` across Sources and Commercials, which is the tell that Sources-as-tab does not pull its weight. **Communications** as a top tab fragments "the plan" and is thin; its asks/commitments ARE the issue spine observed in the wild, so it belongs beside Positions and Trade Plan, with the one always-needed fact (the pen) promoted to the strip. A standalone **Scope** tab over-weights scope on MSA-only deals and re-splits one document family. Each 5th tab re-introduces the tab-to-tab redundancy the brief says to kill.
- **Why 4 is exactly right:** four irreducible, non-overlapping rep questions (verdict / trust-the-paper / worth / move-them), each producing a distinct rep output, over one shared audit ledger surfaced as inline chips. A's "distinct output per tab" test and B's floor/ceiling test both land here once Sources and Communications are correctly folded.

---

## (b) DISPOSITION TABLE (every notable element across the 3 sources)

### S1 — Platform Deal tab (pv-11/12/13)
| Element | Disp | Lands in | Why |
|---|---|---|---|
| Contract-status strip | MERGE | Strip | One status line, merged with S3 summary counts. |
| Key issues stack (above every mode) | MERGE | Overview #4 | Becomes top-5 off the spine; the repeated stack is killed. |
| Negotiation strategy (4-tier) | MERGE | 4A posture header | One posture band, not a mode. |
| Position playbook (5-persona) | COMPRESS | 4A register | Card depth kept; 5 personas → 2-tone toggle. |
| Leverage read | MERGE | 4B leverage | One leverage home; strength made evidence-based. |
| Position map | MERGE | 4A register | Same per-term positions, one register off the spine. |
| Talking points | MERGE | 4A / 4C | Become card fields + derived next-session brief. |
| Red lines | MERGE | 4A `hardStop` | The per-issue hard-stop field. |
| Concession sequencing R1/R2/R3 | MERGE | 4B round plan | One ladder-per-issue off the spine. |
| BATNA (inside sequencing) | REDESIGN | 4B (relocated) | Lifted to deal-level (redundancy iii). |
| SME pre-engagement | COMPRESS | 2B cards | Collapsed brief cards, reflect-only. |
| MSA-already-covers toggle | REDESIGN | 4A per-issue field | A global toggle becomes a per-issue property. |
| ZOPA by line-item + total-deal ZOPA/TCO | MERGE | 3A Deal Table + rollup | Per-line band in-row; total in footer (redundancy i). |
| pv-12 pricing-model rec | MERGE | 3A | Folds into the Deal Table/architecture. |
| pv-12 benchmark bands P10/P50/P90 | CUT | 3A gated band | Percentiles need N≥5 real comps we rarely have (fabrication). |
| pv-12 ranked counter + trade matrix | MERGE | 4B give-gets | Ranking logic kept; matrix is the spine. |
| pv-12 value-at-risk + assumptions | MERGE | 3C VaR + 3B assumptions | One VaR panel; assumptions unified. |
| pv-12 discount waterfall gross→net | MERGE | 3A | Engine kept, S2 narrative poured on (redundancy ii). |
| pv-12 interactive levers + live Protection-Score recompute | KEEP (reconciled) | 4B simulator | Kept as a **precomputed** package-swap, not client-side modeling. |
| pv-12 volume leverage | MERGE | 4B leverage rows | Folds into the one leverage table. |
| pv-12 counter-email draft | CUT | — | Fabrication + send-implying; asks already in the spine. |
| pv-12 TCO summary + Export-to-Excel | KEEP | 3B | The real engine; CSV export is client-side (allowed). |
| pv-12 P&L / cash-flow-by-year | KEEP | 3B | Strongest single reusable asset. |
| pv-12 live discount-rate slider (unlabeled) | REDESIGN | 3B | Gets a WACC name + governance band + consequences. |
| pv-12 scenarios Low/Base/High | MERGE | 3C | Favor deal-specific ask/target/fallback/max. |
| pv-12 sensitivity tornado ±15% | COMPRESS | 3C | Precomputed static (Sonnet-generatable). |
| pv-12 TCO teardown + escalation | MERGE | 3B | Kept; auto hidden-cost multipliers dropped. |
| (No WACC label) | REDESIGN | 3B | Add WACC + target/ceiling band. |
| pv-13 Protection Score gauge + Go/No-Go + methodology + conditions | KEEP/MERGE | 2B gauge; Overview verdict | Gauge lives in 2B; Go/No-Go + conditions → Overview. |
| pv-13 findings H/M/L | MERGE | 2B findings | S2 fields are the superset. |
| pv-13 14-cat risk heatmap | MERGE | 2B | One heatmap with the coverage callout. |
| pv-13 protection & coverage | MERGE | 2B | Same 14-cat set. |
| pv-13 12-cat vendor tactics | CUT→FOLD | 4A/2B issues | A genuine tactic becomes a `tacticFlag` on its issue. |
| pv-13 vendor-response draft | CUT | — | Send-implying; fabrication-prone. |
| pv-13 contract versions | MERGE | 2A register | A status column on the document register. |
| pv-13 Push-to-LEAH | STRIP | — | No system access (NOT-SoR). |
| Data note: no acme deal key; hardcoded inline prose; unused `PROJECTS.acme.deal` override | REDESIGN | Build | Mount the one data object on that override path; delete inline prose. |

### S2 — Contract-review skill (3 panels / 17 subtabs)
| Element | Disp | Lands in | Why |
|---|---|---|---|
| P1 Overview (gauge 4-band + Go/No-Go + MSA coverage) | MERGE | 2B + Overview verdict | Auditable gauge in 2B; verdict on Overview. |
| P1 Risk Heatmap (MSA+WO + tier bars) | MERGE | 2B | One heatmap with 14-cat coverage. |
| P1 Findings (H/M/L + evidence + cross-ref + $impact + SME) | MERGE | 2B findings | The superset field set for the register. |
| P1 Protection & Coverage (14-cat + rollup + posture) | MERGE | 2B | Same 14-cat set as the heatmap. |
| P1 Obligations (register + dates + imbalance) | KEEP | 2B | Post-sign exposure is part of "at what terms"; dates static. |
| P1 Vendor Tactics (12-cat FLAG/CLEAR) | CUT→FOLD | issues | A 12-row grid is analytical theater; fold real flags into issues. |
| P1 Documents (family + retention class + compliance checklist) | MERGE/COMPRESS | 2A | Register + retention column kept; drop the compliance-GATE framing. |
| P2 Strategy (difficulty + posture) | MERGE | 4A posture header | One posture band. |
| P2 Playbook (per-term depth, 5-persona) | MERGE + COMPRESS | 4A register | Deepest content wins; personas 5→2. |
| P2 Position Map (Hold/Trade/Concede + acceptance rate + sources) | MERGE | 4A | Acceptance rate only if genuinely sourced, else cut. |
| P2 Concession Sequencing (round-by-round + BATNA & escalation) | MERGE | 4B | Rounds kept; BATNA relocated to deal-level (iii). |
| P2 SME Pre-Engagement (full briefs) | COMPRESS | 2B cards | Content behind expanders; not a full subtab. |
| P3 Cost Build (decomposition + waterfall + VaR + assumptions) | MERGE | 3B teardown + 3C VaR | Absorbed; Panel 3 dissolves (ii). |
| P3 Benchmarks (sourced + confidence + RESEARCH-PENDING) | MERGE | 3A gated band | Favored over pv-12 percentile bands (ii). |
| P3 Counter-Proposal (prioritized asks) | MERGE | 4B / 4A | Asks are positions, not economics. |
| P3 Discount Architecture (layer-by-layer + Lilly leverage) | MERGE | 3A | Narrative poured onto the pv-12 waterfall (ii). |
| P3 Renewal Strategy (rate locks / CPI / carry-forward) | COMPRESS | 3A renewal band | Links ISS-04/11; not a standalone subtab. |
| Auditable Protection Score (methodology + deduction table) | KEEP | 2B | The defendability strength; preserved verbatim. |
| Clean legal/commercial separation | KEEP | 2B / Tab 3 | Legal in 2B, commercial in Tab 3; not blended. |
| BATNA on the legal side | RELOCATE | 4B | Deal-level, not legal (iii). |

### S3 — `_deal_build` (5 tabs / 13 subtabs)
| Element | Disp | Lands in | Why |
|---|---|---|---|
| Recommended position + 3 signature conditions (chips + jump) | KEEP | Overview #1 | The verdict form; kept verbatim. |
| Deal snapshot | KEEP | Overview #2 | Orientation in seconds. |
| Issue-landscape heatmap | COMPRESS | Overview strip | Small orientation strip, not a second register. |
| Top-5 issues | KEEP | Overview #4 | Same objects as the register (anti-drift). |
| Negotiation boundaries | KEEP | Overview #5 | Walk-away band; feeds BATNA. |
| Commercial headline (Y1 + 3-yr gap) | KEEP | Overview #5 | Computed rollup of `commercialLines[]`. |
| Immediate next-actions | KEEP | Overview #6 | Planning only, strip assign/send. |
| Critical unknowns | KEEP | Overview #7 | Into the evidence-gaps band. |
| Document Map (tree + inventory + precedence + cross-doc consistency + missing-doc cards) | REDESIGN + BUGFIX | 2A | Slim to conflict edges; **conflict rows → `documentConflicts[]`** not tab code. |
| Scope & Performance (gantt, deps, in/out, acceptance, RACI, SLA, change control) | KEEP/MERGE | 2C | The scope dimension kept; gantt choreography → compact schedule. |
| Terms & Risk (category bars + Issue Register) | MERGE | 2B + 4A | One spine renders the register and the positions. |
| Proposal (Ask-vs-Target bars + Normalized Line Items + cash-flow + concerns) | MERGE | 3A + 3B | ONE Deal Table (redundancy i); cash-flow to 3B. |
| Scenarios (waterfall + table + live sliders + tornado) | MERGE/COMPRESS | 3C + 3B | Tornado precomputed static; discount slider stays live. |
| Benchmarks (cards + comparability pill + methodology) | MERGE | 3A gated band | Only real comps; the thin subtab dissolves into a band. |
| Positions (register reframed + collaborative↔direct toggle) | MERGE | 4A | The toggle wins over 5 personas. |
| Trade Plan (objectives, leverage, give-get 2×2, ladders, 3 packages, sequence) | MERGE | 4B | S3's IA + S1's ranking logic. |
| Meeting Brief (agenda/opening/closing/asks/questions/pushback + copy) | MERGE/REDESIGN | 4C | Survives as a DERIVED brief; monologue cut (redundancy iv). |
| Sources (coverage heat matrix + inventory) | COMPRESS | Overview band | Chips already thread provenance; no tab needed. |
| Assumptions (impact bars + editable register) | RELOCATE | 3B | Moves to where assumptions drive recalc. |
| Missing Inputs (impact-vs-ease 2×2 + register) | COMPRESS | Overview band | Gap-state first-class, in the band. |
| Single canonical data object | KEEP | Build | The anti-drift core; retained and extended. |
| Evidence-chip + coverage-badge | KEEP | Everywhere | The anti-fabrication backbone. |
| Missing docs/gaps as first-class visual | KEEP | 2A / Overview | Dashed nodes + gap cards + critical unknowns. |
| Copy-ready outputs | KEEP | 4C | Copy buttons, never send. |
| Purposeful chart-to-purpose + correct palette | KEEP | Everywhere | Already locked-palette compliant. |
| Overbuilt: assumes 12-issue register ready early | NOTE | 2B/2C | Adaptive + gap-state; never zero-fill a thin register. |
| BUG: cross-doc conflict rows hardcoded in tab file (`tab-contract.js:111-121`) | BUGFIX | 2A | Move to `documentConflicts[]` in the data object. |
| BUG: dangling `ISS-03b` (patched by runtime filter `data.js:498-499`) | BUGFIX | Build | Referential-integrity build gate; fix at source. |

---

## (c) THE FOUR REDUNDANCIES, RESOLVED

**(i) Ask-vs-Target vs Normalized-Line-Items → ONE Deal Table (Economics 3A).** `commercialLines[]` already carries `supplierAmount` (ask), `target`, `fallback`, `maximumAcceptable`, `negotiability` per row. Render one normalized table with those as columns and an inline per-row bar that IS the ask-vs-target comparison; per-line ZOPA is the shaded target↔max band in-row; total-deal ZOPA/TCO is the footer. The standalone S3 bar-chart panel is deleted. Overview's commercial headline is a computed rollup of the same array, never retyped. Three surfaces to one object.

**(ii) contract-review Commercial Analysis vs pv-12 → pv-12 is the ENGINE, S2 is the CONTENT, fabrication is dropped.** Home = Economics. Keep pv-12's real P&L/cash-flow/scenarios/sensitivity and add the four pro-forma-lens deltas (WACC band, NPV-vs-rate/break-even, payback, baseline savings waterfall). Pour S2's genuinely additive content in: Cost Build → 3B teardown, Discount Architecture → 3A waterfall narrative, Benchmarks (sourced, comparability-labeled) → 3A gated band (favored over pv-12's P10/P50/P90), Counter-Proposal → 4B give-gets, Renewal Strategy → 3A band. S2 Panel 3 dissolves as a parallel structure. Cut the fabrication ornaments: percentile bands, acceptance-rate stats, counter-email, and the live Protection-Score-as-client-model. Favor-the-richer, honored.

**(iii) BATNA placement → Negotiation / Trade Plan (4B), deal-level, one editable home.** BATNA is neither legal nor commercial; it is "what we do if we walk." Lift it out of S2's legal Concession-Sequencing silo, anchor it in 4B to the commercial walk-away (`scenarios` SC-max) and the alternatives (`leverage` LV-3), cost it from the pro-forma slice, and echo only its floor marker on Overview's boundaries bar. New field `negotiation.batna{alternative, costDelta, trigger}`. Sole-source honesty: when there is no real alternative, the BATNA panel says so and the leverage table shows weak/terms-timing leverage rather than faking competitive tension (the Visier sample has LV-3, the brief's acme is sole-source; the design is data-driven and honest either way).

**(iv) Meeting Brief vs Communications synthesis → Communications replaces it; the copy-ready brief survives as a DERIVED view.** The new substance is backward-looking and traceable: `comms.events[]` (asks/positions/commitments cited to `sourceRef` + `issueId`) + the commitments board + pen history. The Meeting Brief's one genuinely valuable trait (copy-ready blocks) survives as the next-session brief, but computed from open positions × latest thread state so it cannot drift. The hand-authored opening/closing monologue and 5-persona scripting (the fabrication-risk parts) are cut. One owns the past, one owns the next, both off the same spine, zero duplicated content.

---

## (d) THE THREE OPEN DECISIONS

**Decision 1 — Communications own tab vs folded into Overview → the third door: a SUBTAB of Negotiation (4C), with who-has-the-pen promoted to the persistent strip and a 3-line state-of-play digest on Overview.** The full thread is negotiation state (it feeds positions, commitments, and the derived brief, all in the same tab), so folding the whole thing into Overview would break the 2-minute readout, and a top-level Comms tab would be a thin 5th tab carrying one subtab's content. The only comms fact needed everywhere is the pen, so that alone goes global. If Marc wants a strict answer to the posed binary: closer to "own tab," demoted one level. Holds at 4 tabs.

**Decision 2 — one combined Terms & Review vs split scope out → COMBINED, with Scope as an ADAPTIVE subtab (2C).** It is one document family examined through three lenses; splitting scope forces the issue register and deliverables to render in two tabs and re-creates the redundancy this redesign exists to kill. `meta.contractSet` already drives adaptivity, so 2C shows full when a SOW is present and collapses to a "no SOW in scope" note otherwise, and never occupies a permanent peer tab it does not earn. **Recorded split trigger:** promote 2C to its own tab only if Scope & Performance routinely exceeds ~8 panels or SOW-heavy multi-workstream engagements become the dominant use; the data object supports it with zero rework.

**Decision 3 — cut further → YES, the list in (e).** Highest-confidence cuts beyond the system-access strips: the 12-cat vendor-tactics grid (fold into issues), the 5-persona playbook (→ 2-tone toggle), the live Protection-Score-as-model lever (→ precomputed swap), the persona counter-email, the live-recalc tornado (→ static), and the P10/P50/P90 bands (→ sourced benchmarks). Do NOT cut Scope, obligations, or the package simulator: each wires directly to "at what terms" (scope via milestone-payment reconciliation, obligations via post-sign exposure, the simulator via the protection-vs-price trade-off).

---

## (e) EXPLICIT CUT LIST

**Stripped (no system access / NOT-SoR, reflect-only):** Push-to-LEAH · all Send / Assign / Approve / Route / Notify / Refresh / Register / Finalize / Monitor controls · deadline monitoring (obligation and renewal dates render static, reflected-from-contract) · auto-send of any draft (copy-to-clipboard only, of grounded text). Buttons limited to: show-evidence, expand/collapse, filter, sort, edit-assumption, recalc, reset, copy, print, jump.

**Cut (fabrication risk or overbuilt for a session snapshot):**
1. Standalone 12-category vendor-tactics grid → fold real flags into the relevant issue (`tacticFlag` + triggering text).
2. 5-persona playbook → one recommended position + a 2-way collaborative/direct wording toggle (halves generated text, substance invariant).
3. Sources & Gaps as a TAB → Overview evidence-gaps band + Economics assumptions register (inline chips carry provenance).
4. Meeting Brief as hand-authored content → derived next-session brief (renders open positions × thread state).
5. P10/P50/P90 percentile bands → sourced, comparability-pilled benchmarks with an N-gate; RESEARCH-PENDING when thin.
6. Live-recalc tornado → precomputed static (top drivers), built server-side.
7. Live Protection-Score client-side model → precomputed package-swap simulator (kept as a lookup, not modeling).
8. Persona counter-email draft, vendor-response draft → cut (asks already in the spine).
9. Unsourced acceptance-rate stats, should-cost precision, auto hidden-cost multipliers → cut.
10. S1 global "MSA-already-covers" toggle → per-issue field. S1 separate volume-leverage panel → leverage rows.
11. S3 gantt choreography → compact milestone schedule (keep the payment-% reconciliation).
12. S2 Documents retention-class compliance-evidence GATE framing → plain referenced-but-missing list feeding gaps (keep the data, drop the gate). S2 obligations by-party/by-date + folder-tree view toggles → single sorted renders.
13. Protection-Score HERO gauge on Overview → compact posture chip (the full auditable gauge + deduction table lives in 2B).
14. All hardcoded inline acme/conflict prose in the pv/tab render paths → replaced by the one data object; mount on the currently-unused `PROJECTS.acme.deal` override.

---

## Build spec (so Marc can green-light directly)

**Additions the canonical object needs** (confirmed absent from `_parts/data.js`): `deal.whoHasPen{party,basis,confidence}` · `documentConflicts[]` (BUG FIX, from `tab-contract.js:111-121`) · `obligations[]` · `protection{score,methodology,deductions[],categories14[]}` · `proforma{wacc{value,band{target,ceiling}},npvCurve[],paybackMonths,savingsWaterfall[],teardown[],sensitivity[]}` · `comms{events[],penHistory[]}` · `negotiation.batna{alternative,costDelta,trigger}` · `negotiation.packages[].resultingProtectionScore/resultingNetTCO/deltas` · `assumptions[].researchLog[] + confidence`. Everything else (issues spine, scope, commercialLines, scenarios, benchmarks, negotiation core, gaps, sources, analysisAreas) already exists and is reused verbatim.

**Anti-drift proof (one issue, rendered five ways):** `ISS-01` (12-month liability cap) → Overview top-5 row + signature condition · 2B finding + Protection deduction row · 4A position card (24-mo cap, super-cap, in PKG-A) · 4B member of PKG-A traded against the price hold · 4C comms event ("supplier rejected 24-mo cap, redline 07-15"). Same object by id, five surfaces, zero restatement.

**Integrity + generatability:** LLM authors ONLY the data object (locked Landscape pattern); deterministic Python renders a static self-contained shell. The 3 lenses (contract-review → legal `issues[]`/`documentConflicts[]`/`protection`; scope-sow → `scope{}`; pro-forma → `commercialLines`/`scenarios`/`assumptions`/`proforma`) each return a bounded slice; the hub merges into the `issues[]` spine and authors the comms/negotiation synthesis; generate-once/persist/recall. Build runs a **referential-integrity pass** (every `issueId`/`sourceId`/`documentId`/`packageId` must resolve or the build FAILS, replacing the runtime `ISS-03b` filter at `data.js:498-499`). Client-side compute limited to linear recalcs (WACC slider, package swap, sort/filter); tornado and scenarios precomputed. Reuse pv-12 for the P&L/cash-flow/waterfall/CSV engine, pv-13 depth for the register, pv-11 for ladders/packages.

**Palette (locked, each colour does a job):** plum `#5C2B50` = structure/legal spine · teal `#2F6E6B` = agreement-motion (ZOPA band, Covered, in-scope) · burnt-orange `#C15E19` = trade/attention (Strategic Trade, Confirm, assumption chips) · red = critical only (hard stops, Gap, governance-band breach). Colour is never the sole signal; chips and labels carry it too. Dark-mode compatible.

---

## Grounding files (absolute paths)
- Canonical data object (extend, do not rewrite): `C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\_deal_build\_parts\data.js`
- BUG to fix (hardcoded conflict rows): `C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\_deal_build\_parts\tab-contract.js` (lines 111-121)
- Runtime patch to replace with a build gate: `...\_deal_build\_parts\data.js` (lines 498-499, the `ISS-03b` filter)
- Redesign rules + evidence/visual system: `...\_deal_build\DEAL-REDESIGN-BRIEF.md`, `...\_deal_build\DEAL-DESIGN-BRIEF.md`
- Lens/merge + pv reuse + strip list: `C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\DEAL-TAB-MAP.md`
- Existing tab renderers to refactor onto the 4-tab shell: `...\_deal_build\_parts\tab-brief.js`, `tab-contract.js`, `tab-commercials.js`, `tab-negotiation.js`, `tab-sources.js`
- pv engine to reuse: `...\_deal_build\assets\pv\pv-11-deal-core.js`, `pv-12-deal-commercial.js`, `pv-13-deal-review-renew.js`

**One correction worth flagging for sign-off:** the brief's reference deal is acme/P-1042 (sole-source, ~$1.8M), but the realized sample object is Visier (people-analytics SaaS, ~$3.05M ask / $2.37M target 3-yr, with a competitive alternative at LV-3). The design is deal-agnostic and data-driven, so it renders either correctly; the sole-source honesty principle is implemented as data-driven leverage/BATNA (weak and named when no alternative exists), not hardcoded to one deal.

---

## PART 2 — BUILD PLAN

I have everything needed. Toolchain confirmed (node v24.11.1, python 3.14.0). I've mapped both build patterns, the ground-up render layer, the current 5-tab builders, pv-12's engine functions, the two bug sites, and the missing assembler. Here is the build plan.

---

# BUILD PLAN — Lilly Deal Dashboard (4-tab redesign) as a Sonnet-generatable artifact

## 0. Grounding findings that shape the whole plan (read first)

**Two build patterns exist in this repo; this plan uses the second one's render layer inside the first one's mechanism.**

- **Landscape (the "locked" pattern)** — `C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\supplier-landscape-1c344a\dashboard\build_dashboard.py` bundles the platform's OWN render module (`pv-07`) + one authored data object (`landscape-data.js`) + chrome into one self-contained HTML. The LLM authors ONLY the data object; the render code is static platform code.
- **Deal `_parts/` redesign (the live redesign)** — `...\_deal_build\_parts\` is a GROUND-UP custom render: `helpers.js` (render primitives + the `DealUI` interaction engine) + `tab-*.js` (5 tab builders that read only `dashboardData`) + `data.js` (the canonical object) + `style.css`. Explicitly NOT a platform bundle (per `DEAL-REDESIGN-BRIEF.md` §Build note).

**"Same deterministic way as Landscape" reconciles to: same MECHANISM (Python concatenation of static render code + ONE LLM-authored data object → self-contained HTML), not the same render code.** For Deal, the static render code is the ground-up `helpers.js + tab-*.js` (it plays the role `pv-07` plays for Landscape). The LLM authors ONLY `data.js`. This is the only coherent reading, because the 4-tab redesign is a *different UI* from the platform's 3-mode Deal tab, so `pv-12/13` cannot be the render layer.

**Critical gap: there is NO checked-in Python assembler for the `_parts/` redesign.** `deal-dashboard.html` (2.68 MB) exists and inlines the parts, but no `build_*.py`/`.cjs` references `_parts`, and the working **shell** (tab bar + subtab bars + summary strip + `DealTabs` registry + `DealUI.init`) currently lives *inline inside the built HTML only* — it is not a checked-in part. So Phase 0 must (a) create `build_deal_artifact.py` and (b) capture the shell as `_parts/shell.js`.

**Two source-level bugs to fix (not runtime-patch):**
1. `...\_parts\tab-contract.js:111-121` — `crossRows` (cross-doc conflicts) is hardcoded in the tab file → move to a new `documentConflicts[]` in the data object.
2. `...\_parts\data.js:498-499` — a runtime `.filter(id => id !== 'ISS-03b')` patches a dangling id in `PKG-B` → fix `PKG-B.issueIds` at source and add a build-time referential-integrity gate that would have caught it.

**pv-12 reuse is narrow and honest:** the live pv-12 module cannot be bundled (it is entangled with `LillyAPI.tryLive`, `PF_DISC`/seed globals, DOM wiring, the React comms island — the exact entanglement the platform build had to stub, and the reason the `_parts/` redesign exists). "Reuse pv-12" therefore means **PORT its deterministic engine math** (`dealProFormaPayload()` P&L/cashflow-by-year at `pv-12:572`, `dealProFormaCardHTML()` at `619`, and the Export-to-Excel CSV at `pv-12:787-806`) into a new static helper, with the already-built-and-smoke-tested `...\_deal_build\deal-acme-PLATFORM.html` as the numeric fidelity ORACLE. `pv-13` (register depth) and `pv-11` (ladders/packages) are **design-depth references**, not bundle targets — their equivalents already exist ground-up in `tab-negotiation.js`/`tab-contract.js`.

**Instance note (flag for sign-off):** the realized `data.js` models **Visier** (~$3.05M ask / $2.37M target 3-yr, LV-3 competitive alternative present); the brief's reference project is **acme/P-1042** (sole-source Acme Analytics, ~$1.8M 3-yr TCO). The contract below is deal-agnostic; sole-source honesty is data-driven (weak/named `leverage[]` + `batna` when no alternative exists), not hardcoded. Whichever instance ships, the shape is identical.

---

## 1. THE DATA-OBJECT CONTRACT — `PROJECTS.acme.deal` (a.k.a. `dashboardData`)

One object drives all four tabs; the artifact exposes it both as the global `dashboardData` (what `tab-*.js` read today) and, per cut-list #14, mounts the same reference on the platform's unused override `PROJECTS.acme.deal` so the platform path can consume it. **12 keys already exist and are reused verbatim; the design adds ~9 keys/fields.** Types below are the confirmed shapes from `...\_parts\data.js`.

### 1a. Reused verbatim (confirmed present — do not rewrite)

| Key | Shape (confirmed) | Drives |
|---|---|---|
| `meta` | `{artifactKind, generatedAt, disclaimer, contractSet}` — `contractSet` ∈ `msa-only\|sow-under-msa\|new-msa-plus-sow\|multiple-sows\|amendment\|renewal` | Strip disclaimer; **adaptive 2C** (Scope shows/collapses) |
| `deal` | `{title, supplier, supplierCategory, projectId, analysisDate, negotiationType, stage, counterparties{buyer,supplier}, evidenceCoverage:'Strong\|Moderate\|Limited', recommendation{stance,headline,rationale,conditions[{text,issueId}],limitations[]}, summaryStrip[{key,label,value,tone,jump,evidenceType}]}` | Strip; Overview #1/#2 |
| `documents[]` | `{id,name,type,status,date,sourceType,role,relatedTo[],pages,evidenceType,limitations[]}` — `role` ∈ governing/ordering/scope/data/security/correspondence/reference | 2A tree + register |
| `issues[]` | THE spine, `ISS-01..12`: `{id,title,category,priority:'hard-stop\|high\|medium\|low',documentId,clause,supplierPosition,sourceExcerpt,playbookPosition,deviation,impact,recommendedPosition,fallback,hardStop,supplierPushback,recommendedResponse,tradeOpportunity,internalDecision,evidenceType,sourceIds[]}` | Overview top-5 · 2B/2C · 4A positions · 4C events (by id) |
| `scope` | `{objective,objectiveEvidence,inScope[],outOfScope[],deliverables[{id,name,milestone,owner,acceptanceRef}],milestones[{id,name,date,end,dependsOn[]}],acceptance[{id,deliverable,criteria,defined:bool}],dependencies[{id,text,owner,risk}],raci{roles[],rows[{activity,vals[],ambiguous,note}]},serviceLevels[{id,metric,target,remedy,playbook,status,issueId}],changeControl[]}` | 2C (all panels) |
| `commercialLines[]` | `{id,item,supplierAmount,unit,frequency,quantity,target,fallback,maximumAcceptable,negotiability,evidenceType,sourceIds[]}` — **already carries ask/target/fallback/max per row** | 3A ONE Deal Table |
| `scenarios[]` | `SC-ask/target/fallback/max`: `{id,name,basis,values{CL-*},y1Total,total,interpretation,evidenceType}` | 3C table + Overview #5 rollup |
| `benchmarks[]` | `{id,item,comparisonValue,sourceId,comparability,explanation,evidenceType}` | 3A gated band |
| `negotiation` | `{objectives[],leverage[{id,text,strength,basis}],giveGets[{id,give,giveCost,get,getValue,issueIds[]}],concessionLadders[{id,issueId,steps[]}],packages[{id,name,issueIds[],give,get,priority}],sequence[],meetingBrief{…}}` | 4A/4B (meetingBrief becomes the *derived* 4C brief) |
| `assumptions[]` | `ASM-1..5`: `{id,label,value,unit,min,max,step,classification,usedIn[],materiality,evidenceType}` (incl. the bare `ASM-5` discount rate) | 3B register + live recalc |
| `gaps[]` | `GAP-1..6`: `{id,priority:'critical\|important\|helpful',input,whyItMatters,possibleSource,decisionImpact,ease,affectedAnalysis[]}` | Overview evidence-gaps band |
| `sources[]` + `analysisAreas[]` | `{id,kind,label,detail,coverage[]}` + area axis | Overview coverage strip |

### 1b. NEW keys/fields the 4-tab design requires (author these into the object)

```
deal.whoHasPen        = { party, basis, confidence:'High|Moderate|Low', asOf }         // strip chip + Overview #3
deal.stateOfPlay      = { whoHasPen (ref), lastMaterialEvent, nextExpectedMove,         // Overview #3 digest (3 lines);
                          evidenceType:'inference', labeledBestEffort:true }            //   may be derived from comms[]

documentConflicts[]   = { id, docA, docB, topic, relation:'conflict|changed-by|gap',    // BUG-FIX: replaces hardcoded
                          consistent:bool, issueId, note, evidenceType }                //   tab-contract.js:111-121

obligations[]         = { id, party:'buyer|supplier|mutual', text, clause, trigger,      // 2B obligations register
                          dueBasis:'static', imbalanceFlag:bool, issueId?, evidenceType }//   (dates labeled static)

protection            = { score, band:'Strong|Adequate|Weak|Critical',                  // 2B auditable gauge
                          methodology, deductions[{ category, points, reason, issueId }],//   + deduction table
                          categories14[{ name, severity, coverage:'Covered|Confirm|Gap',//   14-cat heat+coverage
                            issueIds[] }] }                                              //   (ONE 14-cat set)

proforma              = { plByYear[{year,revenue?,cost,net}], cashflowByYear[{year,in,out,net,cum}],  // PORT pv-12 engine
                          tcoSummary{ y1, term, netTerm },
                          wacc:{ value, band:{ target, ceiling } },                       // NEW vs pv-12 (unlabeled slider)
                          npvCurve[{ rate, npv }], breakEven:{ rate, months },            // NEW
                          paybackMonths,                                                  // NEW
                          savingsWaterfall[{ label, delta, kind:'baseline|concession|net' }], // NEW vs baseline/incumbent
                          teardown[{ line, driver, amount, evidenceType }],               // from pv-12 teardown
                          sensitivity[{ driver, low, base, high }] }                      // PRECOMPUTED tornado

comms                 = { events[{ id, date, channel:'email|teams', direction:'in|out|internal',
                                    kind:'ask|position|commitment|concession', text,
                                    issueId, sourceRef, party }],
                          penHistory[{ date, party, basis }],
                          commitments[{ id, owner:'ours|theirs', text, status:'open|honored|breached|superseded',
                                        issueId, sourceRef }] }

negotiation.batna     = { alternative, costDelta, trigger, hasRealAlternative:bool }      // deal-level; sole-source honest
negotiation.packages[].resultingProtectionScore   // PRECOMPUTED lookup for the 4B simulator (swap, not client model)
negotiation.packages[].resultingNetTCO
negotiation.packages[].deltas = { protection, tco }
assumptions[].researchLog[]   = [{ date, note, sourceId }]   // 3B register
assumptions[].confidence      = 'High|Moderate|Low'
issues[].tacticFlag           = { present:bool, tactic, triggeringText, evidenceType }   // folds the 12-cat vendor grid
```

**Grounding to what acme/P-1042 carries** (so the author is never zero-filling): sole-source ⇒ `negotiation.batna.hasRealAlternative:false` with a named weak alternative (e.g. "extend incumbent BI + manual reporting; +cost, -capability"), and `leverage[]` skews to timing/volume/reference, not competitive tension; `documents[]` carries the MSA + amendments + SOW + COs the project actually holds (referenced-but-missing exhibits become `evidenceType:'unavailable'` rows that feed `gaps[]`); `comms[]` is populated only from M365 email/Teams that exist in-session, each row cited to `sourceRef`; `proforma` reuses the project's real past-financials baseline for `savingsWaterfall`. Every field carries an `evidenceType` from the fixed set; anything not in session becomes a `gap`, never a fabricated panel.

---

## 2. pv-* REUSE vs BUILD-NEW, per panel

Because the render layer is ground-up, most panels are **BUILT (refactor existing `tab-*.js`)** or **BUILD-NEW on existing `helpers.js` primitives**. Genuine platform-code reuse is confined to the pro-forma engine math.

| Panel / capability | Verdict | Source | How |
|---|---|---|---|
| Strip (identity, pen chip, coverage pill, ≤5 counts) | REFACTOR | shell (inline today) → `_parts/shell.js` | Merge status + summaryStrip; add `whoHasPen` chip + `evidenceCoverage` pill |
| Overview #1–7 | BUILT, extend | `tab-brief.js` | Add #3 state-of-play digest (reads `comms`), compress #7 into evidence-gaps band |
| 2A doc tree + register + precedence + missing | BUILT | `tab-contract.js renderDocMap` | Keep; slim tree to conflict/changed edges only |
| 2A cross-doc conflict table | **BUILD-NEW (bug fix)** | data `documentConflicts[]` | Render from data, delete hardcoded `crossRows` (`:111-121`); use existing `dataTable`+`statusPill` |
| 2B Protection gauge + methodology + deduction table | BUILD-NEW | data `protection{}`; **pv-13 = depth reference only** | New card; `dataTable` for deductions; NOT the pv-13 module |
| 2B findings register / 14-cat heat+coverage / obligations / SME cards / tacticFlag | BUILD-NEW | data `protection.categories14`, `obligations`, `issues[].tacticFlag` | `heatCell`, `dataTable`, `collapsible` |
| 2C scope score / in-out / deliverables+milestones / acceptance / RACI / SLA / change-control | BUILT | `tab-contract.js renderScopePerf` | Keep; gantt→compact schedule with payment-% reconciliation; adaptive via `meta.contractSet` |
| 2C Terms & Risk issue register | BUILT | `tab-contract.js renderTermsRisk` | Keep dense/filterable register |
| 3A ONE Deal Table (ask/target/fallback/max + in-row ZOPA + benchmark chip) | **REFACTOR (resolve redundancy i)** | `tab-commercials.js renderLineChart`+`renderLineItemsTable` | **Merge the two into one** table with in-row bar; footer = total ZOPA/TCO |
| 3A discount architecture (gross→net) + renewal band | BUILT + narrative | `renderWaterfall` + S2 narrative | Keep waterfall; pour discount-architecture narrative |
| 3A benchmarks gated band | BUILT | `renderBenchmarkCard` | Keep N-gate + comparability pill; RESEARCH-PENDING when thin |
| **3B P&L / cashflow-by-year matrix + TCO + Export-to-Excel CSV** | **PORT (real pv-12 reuse)** | **`pv-12` `dealProFormaPayload()`:572, `dealProFormaCardHTML()`:619, CSV :787-806** | New `_parts/proforma-engine.js`; read `dashboardData`; **diff numbers vs `deal-acme-PLATFORM.html` oracle** |
| 3B WACC control+band / NPV-vs-rate curve / break-even / payback / savings-waterfall vs baseline | BUILD-NEW | data `proforma{}` | New cards on `assumptionSlider`, `matrixPlot`/`waterfall`; the 4 pro-forma-lens deltas pv-12 lacks |
| 3B assumptions register + research log + confidence | REFACTOR (relocate) | `tab-sources.js` register → Economics | Move here (where it drives recalc via `DealUI.recalc`) |
| 3C scenarios waterfall + 4-scenario table + tornado + VaR | BUILT | `tab-commercials.js renderTornado` + scenario table | Keep; tornado **precomputed static** from `proforma.sensitivity` |
| 4A positions register / posture / 2-tone toggle / term-interdependency map | BUILT + 1 new | `tab-negotiation.js` positions | Keep register+toggle; **term-interdependency mini-map = BUILD-NEW** (`matrixPlot`/edges over `giveGets`/`packages`) |
| 4B objectives / leverage / give-get 2×2 / ladders / packages / round plan | BUILT | `tab-negotiation.js`; **pv-11 = design reference only** | Keep; add BATNA (`negotiation.batna`) + round plan R1/R2/R3 |
| 4B package simulator | BUILD-NEW (**precomputed swap**) | data `packages[].resulting*` + `DealUI.recalc` | Lookup-swap, not a client model |
| 4C Communications (events ledger / commitments board / pen history / **derived** next-session brief) | **BUILD-NEW (replaces Meeting Brief)** | data `comms{}`; reuse `meetingBrief` copy-blocks as the *derived* view | `timeline`, `dataTable`, `copyBtn`; brief computed from open positions × latest thread |
| Sources & Gaps as a TAB | **FOLD (delete tab)** | `tab-sources.js` | Coverage strip + critical-unknowns → Overview band; assumptions → 3B |
| Push-to-LEAH / Send / Assign / Approve / Refresh / Monitor / counter-email / vendor-response draft | **STRIP** | — | Not built; buttons limited to show-evidence/expand/filter/sort/edit-assumption/recalc/reset/copy/print/jump |

---

## 3. PANEL-BY-PANEL COMPONENT LIST (strip + 4 tabs / 9 subtabs / ~40 panels)

Each panel names the `helpers.js` primitive it renders with and its status: **[K]**=keep, **[R]**=refactor, **[N]**=build-new.

**Persistent strip** (`_parts/shell.js`): identity line [R] · `whoHasPen` chip [N] (`deal.whoHasPen`) · evidence-coverage pill [R] (`coverageBadge`) · ≤5 clickable counts [K] (`deal.summaryStrip` → `jumpLink`) · footer disclaimer [K] (`meta.disclaimer`).

**Tab 1 — OVERVIEW** (`renderTab_brief`, id `brief`): 1 Verdict block [K] (`saCard`+conditions chips+jump) · 2 Deal snapshot [K] (`dataTable`) · 3 State-of-play digest [N] (`deal.stateOfPlay`/`comms`, best-effort label) · 4 Top-5 issues [K] (spine → `severityPill`+`jumpLink`) · 5 Commercial headline + total-deal ZOPA bar + BATNA floor marker [K/R] (`barRow`, rollup of `scenarios`) · 6 Next-actions timeline [K] (`timeline`, planning-only) · 7 Evidence & gaps band [R] (compress `tab-sources` coverage strip `heatCell` + top-5 `gaps` + expanders for full source inventory + impact-vs-ease `matrixPlot`).

**Tab 2 — TERMS & REVIEW** (`renderTab_contract`, id `contract`): **2A** doc tree [K] · inventory register [K] (`dataTable`) · precedence [K] · **conflict table [N]** (`documentConflicts[]`) · missing-docs cards [K] (`gapCard`). **2B** Protection gauge+methodology+deduction table [N] (`protection{}`) · findings register [N] (`dataTable`, evidence excerpt/cross-ref/VERIFIED-ASSUMED/$impact/SME) · 14-cat severity×coverage [N] (`heatCell`) · obligations + imbalance flag [N] (`obligations[]`, dates static) · SME pre-engagement cards [N] (`collapsible`, copy-ready). **2C** (adaptive) scope score+gap-state [K] · in/out + section coverage [K] · deliverables + acceptance-objectivity scan [K] (flags `defined:false`→ISS-10) · milestone schedule + payment-% reconciliation [R] (compact, from gantt) · RACI + dependencies [K] (flags 2-Accountable/no-owner) · SLA/KPI + change-control [K] (`serviceLevels`→ISS-06/ISS-11).

**Tab 3 — ECONOMICS** (`renderTab_commercials`, id `commercials`): **3A** ONE Deal Table [R] (merge line-chart+line-items; in-row ZOPA band; footer total) · discount architecture waterfall + narrative [K/R] · benchmarks gated band [K] · renewal-protection band [N] (links ISS-04/11). **3B** TCO summary + P&L/cashflow-by-year + Export-to-Excel [PORT] (`proforma-engine.js`) · WACC control+governance band + NPV-vs-rate curve + break-even + payback KPI [N] · savings waterfall vs baseline [N] · TCO teardown + pricing decomposition [K/R] · assumptions register + research log + confidence [R] (relocated; drives recalc). **3C** ask→negotiated waterfall + 4-scenario table + narrative [K] · sensitivity tornado (precomputed) [K] · value-at-risk table [K/N].

**Tab 4 — NEGOTIATION** (`renderTab_negotiation`, id `negotiation`): **4A** posture header [K] · one position register (legal+commercial+scope) [K] (playbook-cited; per-issue "MSA covers" flag; `tacticFlag`) · collaborative↔direct toggle [K] · term-interdependency mini-map [N]. **4B** objectives [K] · evidence-based leverage table [K] (honest/weak when sole-source) · give-get 2×2 + ladders + 2-3 packages [K] · round plan R1/R2/R3 + single BATNA floor + escalation [N] (`negotiation.batna`, costed from `proforma`) · package simulator [N] (precomputed swap). **4C** comms events ledger [N] (`comms.events`→`sourceRef`+`issueId`) + pen-history timeline [N] · commitments board [N] (`comms.commitments`, ours/theirs × open/honored/breached/superseded) · next-session brief (derived) [N] (open positions × latest thread; per-block `copyBtn`; draft-only).

---

## 4. BUILD SEQUENCE + how the 3 lenses feed bounded slices

The **hub** orchestrates ONE persisted object; the **3 lenses run as isolated sub-skills** (own context, own token budget), each returning a bounded JSON SLICE. The hub deep-merges slices by key, authors the cross-cutting synthesis (comms/negotiation/verdict), then a referential-integrity pass gates the build.

**Lens → slice contract (each lens fills only its keys; never the whole object):**
- **contract-review** → `issues[]` (legal categories), `documentConflicts[]`, `protection{}`, `obligations[]`, `issues[].tacticFlag`. (Legal spine + defensible protection score.)
- **scope-sow** → `scope{}` (objective, in/out, deliverables, milestones, acceptance, RACI, dependencies, serviceLevels, changeControl) and the scope-flavored `issues[]` (ISS-10 acceptance, SL→ISS-06/11). Adaptive: emits `scope` only when `meta.contractSet` includes a SOW.
- **pro-forma** → `commercialLines[]`, `scenarios[]`, `assumptions[]` (+researchLog/confidence), `proforma{}`, `benchmarks[]`, and `negotiation.batna.costDelta`.
- **hub authors directly** (no lens): `meta`, `deal` (incl. `whoHasPen`, `stateOfPlay`, `recommendation`, `summaryStrip`), `comms{}`, `negotiation` core (objectives/leverage/giveGets/ladders/packages/sequence + `packages[].resulting*` precompute), `gaps[]`, `sources[]`, `analysisAreas[]`. The hub owns anything that references two lenses' ids.

**Phased build:**

- **P0 — Assembler + shell + bug gates (foundation).** Create `...\_deal_build\build_deal_artifact.py` mirroring `build_dashboard_deal.py`/`supplier-landscape-1c344a\dashboard\build_dashboard.py`: inline `fonts-inline.css` + `_parts/style.css` (+ `extract_chrome()` topbar/footer, verbatim technique), then JS blocks in order **`helpers.js` → `data.js` → `tab-brief.js` → `tab-contract.js` → `tab-commercials.js` → `tab-negotiation.js` → `shell.js`**, then `DealUI.init` boot. **Capture the currently-inline shell as `_parts/shell.js`** (builds strip + 4-tab bar + 9 subtab bars + panel containers + `DealTabs` registry). Add a **referential-integrity function** (Python + a JS twin) that asserts every `issueId`/`sourceId`/`documentId`/`packageId`/`acceptanceRef`/`milestone` resolves, and **fails the build** on a dangling id — this replaces the `data.js:498-499` runtime `ISS-03b` filter (fix `PKG-B.issueIds` at source and delete lines 498-499).
- **P1 — Data-contract extension.** Add the §1b keys to `data.js`. Move `crossRows` out of `tab-contract.js:111-121` into `documentConflicts[]`; point the render at the data.
- **P2 — IA refactor 5→4 tabs.** Rename display labels (Overview/Terms & Review/Economics/Negotiation) while **keeping the id/jump namespace** (`brief`/`contract`/`commercials`/`negotiation`) so no `summaryStrip[].jump` string changes. **Delete the `sources` tab**; fold its coverage/gaps into Overview #7 and its assumptions into 3B. Register 4C `communications` as a Negotiation subtab.
- **P3 — Per-tab panel builds** (parallelizable across 4 sub-agents, one per tab; Sonnet-suitable, mechanical against `helpers.js`): Overview #3/#7; 2A conflict table + 2B protection/obligations/SME; 3A merge + 3B additions + relocation; 4A interdependency map + 4B BATNA/round-plan/simulator + 4C comms.
- **P4 — Pro-forma engine port.** Create `_parts/proforma-engine.js` from `pv-12` (`dealProFormaPayload`/`dealProFormaCardHTML`/CSV), reading `dashboardData`; wire into 3B. Client-side compute limited to linear recalcs (WACC slider, package swap, sort/filter); tornado + scenarios precomputed.
- **P5 — Comms synthesis** (hub): author `comms{}` from in-session M365 only, each event cited; derive 4C brief.
- **P6 — Verification** (§5), then `python build_deal_artifact.py --out deal-dashboard.html`.

**Anti-drift proof to assert in tests:** `ISS-01` renders five ways off one object — Overview top-5 + signature condition; 2B finding + protection deduction; 4A position card; 4B PKG-A member; 4C comms event — zero restatement.

---

## 5. VERIFICATION (concrete, runnable)

Run from `C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\_deal_build`.

1. **Syntax gate — `node --check` on every part** (fast, catches parse errors before assembly):
   `for f in _parts/*.js; do node --check "$f" || exit 1; done` (Bash tool). Must pass for `helpers.js`, `data.js`, `shell.js`, `proforma-engine.js`, all `tab-*.js`.

2. **Referential-integrity pass** (the `ISS-03b`-class gate): a `verify_integrity.cjs` that loads `data.js` in a `vm` and asserts every cross-reference id resolves (issues↔packages↔giveGets↔ladders↔sequence↔conditions↔documentConflicts↔sources↔acceptance↔milestones). Exit 1 on any dangling id. This same function runs inside `build_deal_artifact.py` so a bad data object **cannot build**.

3. **Headless render smoke** — extend the existing `smoke_deal.cjs` pattern to the ground-up render: concat `helpers.js + data.js + tab-*.js + shell.js` in a `vm` with the same DOM/`localStorage` stubs, then for each tab call `DealTabs.brief/contract/commercials/negotiation(dashboardData)` (and each subtab) and assert output is a non-trivial string containing a per-tab marker (e.g. Overview `/Go\/No-Go|signature condition/`, Economics `/Deal Table|Payback|WACC/`, Negotiation `/BATNA|Commitments|who has the pen/`, Terms `/Protection|Cross-Document|RACI/`). Assert **no throw** with no `LillyAPI`/DOM present (the render must be pure over `dashboardData`).

4. **Pro-forma numeric oracle** — in the smoke, compute `proforma.cashflowByYear`/`tcoSummary`/NPV from `proforma-engine.js` and **assert they match the platform figures** rendered by `deal-acme-PLATFORM.html` (build it once via `python build_dashboard_deal.py`; parse its P&L/TCO). Guards the "reuse pv-12" fidelity claim.

5. **External-refs scan** (self-contained gate, reuse `smoke_deal.cjs`'s block): assert the built `deal-dashboard.html` has **zero** `http(s)://`, `src="assets`, `href="assets` — no remote fonts/scripts/images.

6. **Browser check (Playwright over http, per the landscape-rebuild memory that this works):** serve the dir (`python -m http.server`), `browser_navigate` to `deal-dashboard.html`; `browser_console_messages` must be error-free; snapshot + `browser_click` each of the 4 tabs and 9 subtabs asserting the panel container is non-empty; exercise one WACC-slider `input` and one package-simulator toggle and assert the dependent number changes (recalc works); `browser_take_screenshot` per tab in light and dark (`data-theme` toggle) to confirm the locked plum/teal/burnt-orange palette and that no panel opens as a wall of text. Confirm no Send/Assign/Approve/Push/Refresh/Monitor control is present.

**Definition of done:** all six pass; four tabs + strip render from one object; the two bugs are fixed at source and gated; `proforma` matches the platform oracle; zero external refs; palette + reflect-only constraints hold in-browser.

---

### Files this plan creates or changes (absolute paths)
- CREATE `...\_deal_build\build_deal_artifact.py` (assembler; mirrors the two existing build scripts)
- CREATE `...\_deal_build\_parts\shell.js` (extract inline shell), `...\_parts\proforma-engine.js` (port pv-12), `...\_deal_build\verify_integrity.cjs`
- EDIT `...\_parts\data.js` (add §1b keys; delete runtime filter `:498-499`; fix `PKG-B.issueIds`)
- EDIT `...\_parts\tab-contract.js` (data-drive conflicts, delete hardcoded `:111-121`; add 2B protection/obligations/SME), `tab-commercials.js` (merge 3A; 3B additions; relocate assumptions), `tab-negotiation.js` (BATNA, round plan, simulator, 4C comms, interdependency map), `tab-brief.js` (state-of-play digest, evidence-gaps band)
- DELETE from IA `...\_parts\tab-sources.js` as a tab (fold its panels; keep the file only if reused as fold-in fragments)
- REFERENCE ONLY (do not bundle): `...\assets\pv\pv-12-deal-commercial.js` (engine), `pv-13-deal-review-renew.js` (register depth), `pv-11-deal-core.js` (ladders); ORACLE `...\_deal_build\deal-acme-PLATFORM.html`