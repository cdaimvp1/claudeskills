# UPGRADE PLAN: completing all 31 skills

Compiled 2026-07-29 from `_audit/OPTIMIZATION-PRINCIPLES.md`, `_audit/RECONCILIATION.md`,
`_audit/SYNTHESIS.md`, `_audit/GROUP-1..6-*.md`, `_audit/TRACKERS-A/B/C`,
`MASTER-REMAINING-WORK.md` section 9, and `PROGRAM-MASTER-PLAN.md`.

This is the working document. It does not modify any skill or planning file.

## The governing rule, restated

`_audit/OPTIMIZATION-PRINCIPLES.md:5-9`: priority is (1) accuracy, quality, completeness,
then (2) time and token cost. `:26`: "Redesign is permitted. Degradation is not."
`:72-77`: model-tier routing is NOT available; every optimization must work on Sonnet on
the user's own Desktop.

Consequence for this plan: no item below reduces the number of judgment passes, the
research floor, or the per-item coverage of any skill. Where cost falls it falls because
work moved from the model to code, from repeated to recalled, or from duplicated to
deduplicated. Where accuracy cannot be held, the item says so and recommends leaving the
cost in place (see F3 and F7).

## Scope and counts

- 11 workstreams: A through K.
- 78 items.
- 13 need a Marc decision (section 5).
- 9 items are explicitly out of scope (section 6).

---

# SECTION 1: WORKSTREAMS

| WS | Name | Phase | Why it exists | Items |
|---|---|---|---|---|
| **A** | Dashboard skill homes (finish Phase 1) | 1 | Three of five hubs still have no skill home. The locked phase order gates everything else on this. `PROGRAM-MASTER-PLAN.md:45-51` | 11 |
| **B** | Skills-file cleanup pass (WS3a) | 2 | Retired reference-JSX, stale tab counts, dead code and superseded prose still ship inside the skill files. `PROGRAM-MASTER-PLAN.md:96-104` | 9 |
| **C** | Kernel adoption and coverage | 2 (some 4) | About a third of the suite does kernel-shaped arithmetic in prose. `_audit/SYNTHESIS.md:20-38` | 10 |
| **D** | Slice contracts per the approved ownership table | 2 | Designed and field-assigned, not authored. `MASTER-REMAINING-WORK.md:320`, `_redesign_proposals/RFx-REDESIGN-SPEC.md` section D | 7 |
| **E** | Handoff-schema source-of-truth discipline | 2 | Two live copies of `case-handoff-schema.md`, one self-documented as stale. `rfp-case-manager-1c344a/SKILL.md:723` | 5 |
| **F** | The four slowness mechanisms | 2 | `_audit/SYNTHESIS.md:80-96`. Redesigned in section 3, not trimmed. | 9 |
| **G** | Claude Desktop runtime feasibility | 2, with a gate in 1 | A skill that reads well but does not execute in Desktop is not shipped. New workstream, Marc 2026-07-29. | 9 |
| **H** | Grounding under unknown data access, and anti-drift | 2 | Skills cannot know what the user can reach; the claim-gate exists but is not uniformly implemented. New workstream, Marc 2026-07-29. | 10 |
| **I** | Help-desk | 3 | Inert scaffold, undecided fork, network-blocked harvest. `procurement-help-desk-1c344a/SKILL.md:77,319` | 3 |
| **J** | Orchestration as THEO maturation (WS4) | 3 | LOCKED as maturation of procurement-launcher, NOT a new skill. `docs/master-plan.md:312-345` | 3 |
| **K** | Packaging and release | 4 | `MASTER-REMAINING-WORK.md:415-421` | 2 |

**Not a workstream, deliberately.** A new dedicated orchestration skill. The audit
recommended one (`_audit/SYNTHESIS.md:110`); `_audit/RECONCILIATION.md:26-33` shows this
contradicts a locked decision. WS J follows the locked decision. See section 5, decision 1.

---

# SECTION 2: PER-ITEM DETAIL

Format per item: what · skills touched · why (accuracy first) · concrete change ·
verification · effort · Marc decision · dependencies.

## WS A: Dashboard skill homes (Phase 1)

**A1. Build the `rfx-hub` skill.**
Skills: new `rfx-hub`; feeds from rfp-engine, rfp-case-manager, rfp-response-analysis,
evaluation-engine.
Why: the RFx dashboard is locked but homeless. Four skills each produce RFx data and
none of them owns the composed view, so today the only way to get one is for a model to
hand-assemble it, which is the exact accuracy failure the deterministic-build decision
exists to prevent (`_redesign_proposals/DASHBOARD-ARCHITECTURE-DECISION.md:1-16`).
`_audit/GROUP-3-rfx-family.md:90` confirms `rfx-hub` does not exist as a directory.
Change: create `rfx-hub-1c344a` carrying the locked RFx build tree from `_rfx_build/`
(engine + assets + builder), on the deal-tab pattern: model authors only the data object,
builder renders. `PROGRAM-MASTER-PLAN.md:79`.
Verify: build the dashboard from the shipped seed data with zero hand-authored markup;
in-browser check of every tab, 0 console errors; malicious-code sweep before lock (the
"#16 gate", `MASTER-REMAINING-WORK.md:294`).
Effort: L. Marc decision: no. Depends on: nothing.

**A2. Wire the RFx to Deal handoff emitter.**
Skills: `rfx-hub`, deal-room.
Why: the consumer side is already wired (`MASTER-REMAINING-WORK.md:136-143`), the emitter
was deferred until rfx-hub existed. An unwired half-contract is a false-complete.
Change: implement "Send winner to Deal" emitting `RfxToDealHandoff` per
`_redesign_proposals/RFx-REDESIGN-SPEC.md` section C; do not fork the schema
(`RFX-DEAL-HANDOFF-AND-COMMS-EVIDENCE.md:14`).
Verify: emit from rfx-hub, ingest in deal-room Phase 1, assert every required field
round-trips and `sourceRef` survives.
Effort: M. Marc decision: no. Depends on: A1.

**A3. Rehome the Category Strategy build tree into the skill.**
Skills: category-strategy.
Why: the dashboard is locked and verified (`MASTER-REMAINING-WORK.md:12-15`) but lives at
repo root in `_category_build/`, so an installed skill cannot build it. The skill
currently instructs hand-cloned JSX instead (`category-strategy-1c344a/SKILL.md:1588`),
which is the retired, drift-prone path.
Change: move `_category_build/build_dashboard_category.py`, `assets/pv/`, `assets/seed/`
into `category-strategy-1c344a/dashboard/` preserving relative structure, per
`_audit/GROUP-4-supplier-category-deal.md:90`.
Verify: build runs from inside the skill directory with the repo root absent.
Effort: M. Marc decision: no. Depends on: nothing. Note: pairs with G3.

**A4. Vendor the platform chrome into category-strategy.**
Skills: category-strategy.
Why: hard runtime break, not cosmetic. `_category_build/build_dashboard_category.py:22-25`
does `PLATFORM = os.path.join(REPO, '_platform_build')` then
`import build_dashboard as bd`, reaching a REPO-ROOT directory that does not exist in an
installed-skill layout. deal-tab already solves this by carrying its own copy
(`deal-tab-1c344a/dashboard/_platform_build/`).
Change: vendor `_platform_build/` into `category-strategy-1c344a/dashboard/_platform_build/`
and re-point the import at the skill-local path.
Verify: copy only the skill directory to a clean location and build successfully.
Effort: S. Marc decision: no. Depends on: A3.

**A5. Build the Deep Dive dashboard.**
Skills: supplier-deep-dive.
Why: this is the only skill still on the fully-manual JSX path with zero code in its
directory (`_audit/GROUP-4-supplier-category-deal.md:27,35`); `SKILL.md:337` instructs
the model to hand-author the JSX with `create_file`. Every run produces a differently
shaped artifact, which is a consistency defect before it is a cost defect.
Change: build the deterministic dashboard per `_platform_build/DEEP-DIVE-REDESIGN-SPEC-v3.md`,
carried inside the skill: `dashboard/build_profile_dashboard.py` + `dashboard/assets/`.
Renders at 4 depths (Landscape tab / RFx bidder / Deal light / standalone full).
`PROGRAM-MASTER-PLAN.md:85`.
Verify: in-browser all depths, 0 console errors, malicious-code sweep, lock.
Effort: L. Marc decision: hub home is TBD (`MASTER-REMAINING-WORK.md:390`) - see decision 4.
Depends on: nothing.

**A6. Compose-by-traits deep-dive layout.**
Skills: supplier-deep-dive.
Why: public / private / hyperscaler-product suppliers have genuinely different evidence
sets; a single layout forces either fabricated fields or empty ones. Traits let absent
sections be absent rather than invented.
Change: per `DEEP-DIVE-REDESIGN-SPEC-v3`, trait-driven section inclusion in the renderer.
Verify: render one supplier of each type; assert no panel renders an invented value and
every omitted panel is omitted by trait, not by gap.
Effort: M. Marc decision: no. Depends on: A5.

**A7. Build the My Work dashboard and hub.**
Skills: new My Work hub; reads theos-field-guide state.
Why: last unbuilt Phase 1 hub. `PROGRAM-MASTER-PLAN.md:86`.
Change: deterministic port of the platform My Work page, plus the #44 handover/custody
brief which is GREEN LIT to live here (`PROGRAM-MASTER-PLAN.md:86`).
Verify: as A1. Effort: L. Marc decision: no. Depends on: nothing.

**A8. Landscape design uplift to Deal/RFx caliber.**
Skills: supplier-landscape.
Why: `PROGRAM-MASTER-PLAN.md:89` records this as the real WS2 driver, a caliber gap not a
breakage. Phase 1 does not close until Landscape locks.
Change: R2 deep-dive batch G1-G4 plus the per-tab items enumerated at
`MASTER-REMAINING-WORK.md:300-303`; Marc is conservative and changes are additive
(`MASTER-REMAINING-WORK.md:57`).
Verify: in-browser per tab; diff against the two locked dashboards as the caliber bar.
Effort: L. Marc decision: several sub-items (M10, M11, M12 in `MASTER-REMAINING-WORK.md:374-376`).
Depends on: nothing.

**A9. Landscape engine recolor to MCM.**
Skills: supplier-landscape.
Why: hardcoded stoplight hex literals in `pv-07-landscape-render.js`, `pv-07a-assess-model.js`,
`pv-07b-deepdive.js`, `pv.css` bypass the CSS-var layer, so a token swap does not fully
recolor (`MASTER-REMAINING-WORK.md:298`).
Change: colour-only replacement; do not touch tab structure or the `PROJECTS[key]` data
contract.
Verify: old-hex count equals 0 after re-sync and rebuild (`MASTER-REMAINING-WORK.md:299`).
Effort: M. Marc decision: no. Depends on: nothing.

**A10. Landscape seed bugs and dead code.**
Skills: supplier-landscape.
Why: score-scale drift means one number appears as 89 / 89.37 / 4.51 / 60.77 in four
places (`MASTER-REMAINING-WORK.md:304`). That is an accuracy defect visible to a user.
Change: single `pvAssess` source; supplier-count funnel resolving 7-vs-9; ESG rendered as
an assessment-coverage note not a scored dash; remove `pvRequestDataCard`, `pvDDSection`,
`pvVerdictHeaderHtml`, `pvCompPositionHtml`.
Verify: one score scale rendered suite-wide on the dashboard; grep confirms removed
functions have no call sites.
Effort: M. Marc decision: no. Depends on: nothing.

**A11. Lock all five hubs.**
Why: `PROGRAM-MASTER-PLAN.md:51`: "all five hub dashboards LOCKED before Phase 2." This
is the gate, and it is the reason nothing in WS B through WS H starts earlier.
Change: per-dashboard in-browser sweep plus full-codebase malicious-code pass, then tag.
Verify: tag exists; `MASTER-REMAINING-WORK.md` RESUME block updated.
Effort: S. Marc decision: sign-off (M14). Depends on: A1, A3-A5, A7-A10.

## WS B: Skills-file cleanup pass (WS3a, Phase 2)

**B1. Retire category-strategy's reference-JSX dashboard spec.**
Skills: category-strategy.
Why: `SKILL.md:1588` still says "The reference implementation is
`examples/category_strategy_canonical_dashboard.jsx` ... Clone the structure, swap the
data entirely." Anyone running the skill today gets the pre-deterministic pattern
(`_audit/SYNTHESIS.md:65-70`). It is also a large fraction of the 25,176-word file
(`_audit/GROUP-4-supplier-category-deal.md:81,98`).
Change: replace with supplier-landscape's language at `supplier-landscape-1c344a/SKILL.md:230`
("Do NOT hand-author JSX/React or CSS: your only job is the data object; the shipped,
locked engine renders every tab") pointing at `dashboard/build_dashboard_category.py`;
demote the JSX example to historical or delete per `PROGRAM-MASTER-PLAN.md:99`.
Verify: zero occurrences of "clone the structure" and of `create_file`-based dashboard
build instructions; one build command present.
Effort: M. Marc decision: no (the retirement is locked). Depends on: A3, A4, A11.

**B2. Settle the Category Strategy tab count at 5 everywhere.**
Skills: category-strategy; plus `_category_build/CATEGORY-STRATEGY-BUILD-SPEC.md`.
Why: three tab counts live in three places. `category-strategy-1c344a/SKILL.md:746,846-847,1767,1777`
say 11; `_category_build/CATEGORY-STRATEGY-BUILD-SPEC.md:44` says 7; `VERSION-LOCK-2026-07-29.md:27`
locks 5. `_audit/TRACKERS-B-dashboards.md:100-108` records that no document narrates the
7-to-5 fold, and that the approved Supplier Program and Execution tabs were dropped with
no recorded rationale.
Change: rewrite the SKILL.md tab references to the locked five (Overview, Spend & Suppliers,
Trend & Change, Market & Risk, Strategy & Plays); correct the build spec; write the
7-to-5 decision record.
Verify: grep for "11 tab", "7 tab" returns only historical changelog lines.
Effort: S. Marc decision: yes, confirm 5 (decision 2). Depends on: B1.

**B3. Carry the locked substantive sub-decisions into the SKILL.md.**
Skills: category-strategy.
Why: these are analysis rules, not layout. If the SKILL.md does not carry them the model
will author data that contradicts the engine.
Change: per `_audit/TRACKERS-B-dashboards.md:159-164`, encode: line-item segmentation is
market data not a Lilly spend split (`VERSION-LOCK-2026-07-29.md:47-49`); supply risk is
log-scaled average spend per vendor, not vendor count (`:50-52`); type ladder 11/13/20/28
(`:56-62`); Porter as one overlaid pentagon (`:63-67`).
Verify: each rule appears once, in the data-authoring section.
Effort: S. Marc decision: no. Depends on: B2.

**B4. Sweep reference-JSX out of the remaining lens skills.**
Skills: lilly-contract-review, scope-sow-architect, pro-forma-builder, supplier-deep-dive,
negotiation-simulator, timeline-builder, meeting-prep-brief, invoice-rate-card-auditor,
should-cost-builder, evaluation-engine, rfp-response-analysis.
Why: `_redesign_proposals/DASHBOARD-ARCHITECTURE-DECISION.md:12-16` retires per-skill
reference JSX suite-wide, gated on each hub carrying its locked dashboard.
`PROGRAM-MASTER-PLAN.md:110` (D1) names the first three explicitly and says "sweep the rest".
Evidence of live instances: `negotiation-simulator` SKILL.md:434 ("clone its structure,
swap the data"); `pro-forma-builder` SKILL.md:17 ("this skill's only large single-file
hand-assembled output"); `timeline-builder` and `meeting-prep-brief` carry large inlined
canonical JSX (`_audit/GROUP-5-orchestration.md:261,314`).
Change: for each, either point at the owning hub's deterministic build, or, where the
skill genuinely has no hub (negotiation-simulator, timeline-builder, meeting-prep-brief),
keep the artifact but strip the "clone and redesign" language and state that the layout is
locked and presentation-only.
Verify: per skill, one dashboard instruction path, no `create_file`-authored-markup
instruction, standalone deliverable preserved (never-regress, `MASTER-REMAINING-WORK.md:281`).
Effort: L. Marc decision: no. Depends on: A11.

**B5. Remove documented-dead code from vendored `.py` and `assets/`.**
Skills: supplier-landscape (see A10), any skill with dead blocks.
Why: `PROGRAM-MASTER-PLAN.md:100`.
Change: delete only blocks documented as dead; call out anything ambiguous before deleting
(`:101`).
Verify: full self-test of each touched generator still passes (each ships one: 23 checks
in `should_cost_generator.py`, 24 in `market_rate_generator.py`, 76 in
`executive_summary_generator.py`).
Effort: M. Marc decision: no. Depends on: A11.

**B6. Retire orphaned static dashboard HTML.**
Skills: repo-level `_dashboards_ORIGINAL/`, `_dashboard_previews/`, retired PCC HTML,
`deal-room-1c344a/dashboard/`.
Why: `PROGRAM-MASTER-PLAN.md:101`; `MASTER-REMAINING-WORK.md:413` records
`deal-room-1c344a/dashboard/` as a stale duplicate carrying a SUPERSEDED marker that could
not be removed because a local server held a file handle.
Change: confirm reference-only, then delete.
Verify: no SKILL.md references any deleted path.
Effort: S. Marc decision: call out before deleting. Depends on: A11.

**B7. Prune stale instructions and superseded prose.**
Skills: all 31.
Why: `PROGRAM-MASTER-PLAN.md:102`. Also `feedback_skill_design_principles`: no up-front
mode pickers.
Change: remove old mode pickers, superseded IA prose, routing lists that will be generated
from the JSON manifest once J2 lands.
Verify: word-count delta per file recorded; no rule deleted, only restated once.
Effort: M. Marc decision: no. Depends on: A11; routing lists depend on J2.

**B8. Update the guardrail numbering references.**
Skills: commercial-negotiation-prep SKILL.md:150 says "G1-G10 apply suite-wide";
deal-room SKILL.md:135 says "G1-G11". The actual set is G1-G12
(`_audit/TRACKERS-C-skills-handoff.md:117-130`).
Why: a skill that cites the wrong guardrail range tells the model that G11 kernel-backed
computation and G12 claim-gate do not apply to it. This is an accuracy rule, silently
scoped away.
Change: normalize every "suite-wide guardrails note" to G1-G12 with the correct scope
sentence for G11 (applies only to kernel-vendoring skills, `lilly-brand-assets-1c344a/SKILL.md:1104-1110`).
Verify: grep "G1-G10" and "G1-G11" returns zero outside changelogs.
Effort: S. Marc decision: no. Depends on: nothing. This is the cheapest correctness item
in the plan.

**B9. Extract comment-cleanup Mode B into its own skill, or keep and re-label.**
Skills: comment-cleanup.
Why: the skill's own maintainer note (`comment-cleanup-1c344a/SKILL.md:452`) flags that
"Finalize for Signature" touches operative contract body text via tracked-change
acceptance, a materially higher-risk surface hidden inside a lower-stakes comment-hygiene
trigger set (`_audit/GROUP-1-contract-legal.md:51`).
Change: either split, or leave in place and add an explicit high-risk gate plus discovery
aliases.
Verify: the risky path cannot be reached without an explicit confirmation step.
Effort: M. Marc decision: yes (decision 9). Depends on: nothing.

## WS C: Kernel adoption and coverage (Phase 2, some Phase 4)

**C1. Add `deduction_score()` to the canonical kernel.** BUILT 2026-07-29, `18b955b`.

NAME RESOLVED (Marc, 2026-07-29): this plan and the session handoff disagreed, the plan
saying `protection_score()` and the handoff `deduction_score()`. **`deduction_score()`
is the name.** It describes what the function does (starts at 100 and subtracts, per
coverage column, Hard Stops never reduced) rather than what it returns, and the
distinction matters because the obvious wrong move is to route it through
`weighted_score()`, which is a weighted average over criteria footing to 1.0 and a
different shape entirely. Earlier `protection_score()` references in
`_audit/F1-IMPLEMENTATION.md`, `GROUP-1-contract-legal.md` and
`GROUP-6-output-foundations.md` are superseded by this line and are left in place as
the audit record rather than rewritten.

Still owed on C1: vendor to `lilly-contract-review` (BLOCKED, held) and the text fix in
`lilly-brand-assets-1c344a/SKILL.md:1163-1166` (not held, still open).
Skills: `lilly-procurement-kernels`, then vendor to lilly-contract-review; text fix in
lilly-brand-assets.
Why: the same number is prose-derived in two places
(`lilly-contract-review-1c344a/references/risk-scoring.md` and inlined at
`lilly-brand-assets-1c344a/SKILL.md:1163-1166`) and is absent even from the kernel's own
"not yet covered" list (`lilly-procurement-kernels-1c344a/MAINTENANCE.md:24-30`). It is a
kernel-coverage gap, not a G11 violation, because there is nothing to call
(`_audit/TRACKERS-C-skills-handoff.md:144-149`).
Change: it is a DEDUCTION model, not a weighted average. `PLATFORM-CONSOLIDATION-TRACKER.md:172`
records and corrects the prior "wire it to weighted_score()" misdiagnosis. Implement
`deduction_score(deductions) -> float` clamped 0-100, refusing a deduction outside its
severity/coverage cell range, with the anti-drift calibration ceiling (30-point ceiling
for zero-Hard-Stop / 10+-Covered documents) enforced inside the function rather than as
prose the model must remember (`_audit/GROUP-1-contract-legal.md:19`).
Verify: golden cases traced to quoted SKILL.md sentences, matching the kernel's existing
docstring discipline; negative tests that the function refuses rather than clamps silently.
Effort: M. Marc decision: GREEN LIT as #114 but `[held]`, sensitive, explicit go required
(`PROGRAM-MASTER-PLAN.md:148`). Also evaluate deterministic vs semantic vs heuristic per
`PROGRAM-MASTER-PLAN.md:173`. Depends on: A11.

**C2. Kernel the negotiation-playbook-learning Difficulty Score and partition rates.**
Skills: negotiation-playbook-learning.
Why: strongest evidence in the audit. The skill has no Python file at all
(`_audit/GROUP-6-output-foundations.md:65`), and its own v2.1 changelog (SKILL.md:33)
records a scaling-overshoot bug of exactly the class `weighted_score()`'s `WeightSumError`
guard prevents by construction. A bug that already shipped once.
Change: vendor `numeric_kernel.py` and add `partition_rates()` / `difficulty_score()`;
make the "numbers-reconcile assertion" (SKILL.md:812-819) a code invariant instead of a
prose instruction the model can skip.
Verify: reproduce the v2.1 overshoot input and assert the kernel refuses; partition rates
sum to 1.0 within tolerance or raise.
Effort: M. Marc decision: GREEN LIT as #113 (`PROGRAM-MASTER-PLAN.md:146,175`), sequenced
to WS8 Phase 4. See section 4 for the sequencing note. Depends on: A11.

**C3. Kernel the rfp-response-analysis Bid Leveling normalization.**
Skills: rfp-response-analysis.
Why: the single biggest correctness risk found. `SKILL.md:328` instructs prose
recomputation of each supplier's price onto a common basis; `SKILL.md:571` states "Bid
Leveling gates ranking". The weighted average downstream IS kernel-verified
(`rfp_analysis_report_generator.py:1374`), so the audited step sits on an unaudited
input (`_audit/GROUP-3-rfx-family.md:40`). Genuinely new; no planning document names it
(`_audit/TRACKERS-A-program.md:30-34`).
Change: add a bid-leveling normalization function to the kernel (unit conversion, term
normalization, scenario basis) and have `rfp_analysis_report_generator.py` call it the way
it already calls `weighted_score()`.
Verify: the normalization arithmetic the skill already requires to be shown
(`SKILL.md:328`) must equal the kernel return; a golden multi-supplier, multi-scenario set
with a deliberate unit mismatch must change the ranking and be caught.
Effort: M. Marc decision: no, but it is new work not in the corpus, so flag on landing.
Depends on: A11.

**C4. Kernel supplier-landscape's Weighted Scoring Matrix.**
Skills: supplier-landscape.
Why: `SKILL.md:358` says "Rate each supplier 0-10 per category. Multiply by weight. Sum
for final weighted score." The dashboard headline is already derived in the deterministic
JS engine (`SKILL.md:152`), so the DOCX table and the dashboard can drift apart today
(`_audit/GROUP-4-supplier-category-deal.md:9,19`).
Change: vendor `numeric_kernel.py`; replace the prose instruction with a `weighted_score()`
call; the DOCX table and dashboard both read the same value.
Verify: assert DOCX weighted score equals dashboard `os` for the same data object.
Effort: S. Marc decision: no. Ranked #1 for deterministic Python at
`PROGRAM-MASTER-PLAN.md:108`. Depends on: A11.

**C5. Kernel category-strategy's Pareto / HHI / CAGR / YoY / tail-threshold / anomaly.**
Skills: category-strategy.
Why: ranked "highest" at `PROGRAM-MASTER-PLAN.md:108`. Zero Python in the skill today
(`_audit/GROUP-4-supplier-category-deal.md:77`); `SKILL.md:320,337,342,367` all instruct
prose derivation.
Change: add the functions to the canonical kernel and vendor; the dashboard builder should
call the same functions so the narrative and the chart cannot disagree.
Verify: golden spend file with a known HHI and CAGR; assert narrative figure equals
rendered figure.
Effort: M. Marc decision: no. Depends on: A3, A4, B1.

**C6. Kernel negotiation-simulator's reciprocity ratio and anchor capture.**
Skills: negotiation-simulator.
Why: `SKILL.md:464-475` specifies `M / N` rounded to one decimal and
`capture% = (W - Z) / (Y - Z) * 100` with edge cases for >100%, zero-range and
wrong-direction, all handled in prose with no kernel in the directory
(`_audit/GROUP-1-contract-legal.md:73`).
Change: the prose already specifies every formula and every edge case, so the kernel can
be written by mechanical transcription. Add `reciprocity_ratio()` and
`anchor_capture_pct()` with typed degenerate-case returns.
Verify: one test per named edge case.
Effort: S. Marc decision: no. Ranked #4 at `PROGRAM-MASTER-PLAN.md:108`. Depends on: A11.

**C7. Kernel rfp-engine's weight-sum check.**
Skills: rfp-engine.
Why: `SKILL.md:384` asks the model to sum evaluation weights to 100% and label DRAFT on
failure. Low-stakes but silently driftable on a large requirements matrix
(`_audit/GROUP-3-rfx-family.md:8`).
Change: vendor the kernel; `weighted_score()`'s `WeightSumError` already encodes this
refusal.
Verify: a matrix summing to 99% must produce the DRAFT label deterministically.
Effort: S. Marc decision: no. Ranked #3 at `PROGRAM-MASTER-PLAN.md:108`. Depends on: A11.

**C8. Close the commercial-negotiation-prep rollup gap.**
Skills: commercial-negotiation-prep.
Why: the most numeric-narrative-heavy skill in its group and the least kernel-covered
relative to its complexity (`_audit/GROUP-2-commercial-pricing.md:9`). Pricing Position
Summary percentages, Weighted Avg Position, Total Annual Exposure, Volume Leverage sums
and ZOPA band math at `SKILL.md:356-367` have no kernel binding at all.
Change: a `commercial_negotiation_generator.py` computing these from the validated rate
register and writing `rate_comparison.xlsx` / `counter_offer.xlsx` via openpyxl
(`_audit/GROUP-2-commercial-pricing.md:19`). Overlaps F9.
Verify: generator self-test with reconciliation assertions on the exposure total.
Effort: L. Marc decision: no. Depends on: A11.

**C9. Kernel-copy verification manifest.**
Skills: `lilly-procurement-kernels` plus all 11 vendoring skills.
Why: NEW FINDING, verified directly this session. The 12 `numeric_kernel.py` copies are
NOT byte-identical: four distinct md5 hashes. `SUITE-MODERNIZATION-FINDINGS.md:26-30`
asserts "copies are byte-identical". Diffing shows the divergence is confined to the
vendoring header comment (dates 2026-07-21 vs 2026-07-22) plus one extra call-site comment
in `scope-sow-architect-1c344a/numeric_kernel.py:2`; the 650-line body is identical in all
copies. So the discipline holds substantively today, but nothing verifies it, exactly as
`_audit/GROUP-6-output-foundations.md:300-302` predicts: "nothing currently verifies that
all 11 vendored copies are byte-identical to the source (no build script, no checksum
manifest)."
Change: a `verify_kernel_copies.py` in `lilly-procurement-kernels-1c344a` that hashes each
copy's body with the leading comment block stripped and fails on any mismatch; a
`KERNEL-MANIFEST.md` recording each copy's body hash and vendoring date.
Verify: run it; deliberately mutate one copy's body and confirm it fails.
Effort: S. Marc decision: no. Depends on: nothing. Recommend running this BEFORE any
kernel change in C1-C8 so the re-vendor step is checkable.

**C10. Wire or retire `convert_currency()`.**
Skills: executive-summary-package, pro-forma-builder, deal-room.
Why: shipped, self-tested, and never called anywhere in the suite
(`_audit/GROUP-6-output-foundations.md:279-284`, grep confirmed). Meanwhile multi-currency
deals get no kernel-backed conversion path, so FX math falls to the model
(`_audit/GROUP-6-output-foundations.md:52-59`).
Change: wire it into `executive_summary_generator.py`'s Financial Summary build with the
FX rate and date required as inputs; refuse rather than assume a rate.
Verify: a two-currency register must either convert with a cited rate or raise.
Effort: M. Marc decision: no. Depends on: C9.

## WS D: Slice contracts (Phase 2)

The design exists. This workstream authors it. `_audit/TRACKERS-C-skills-handoff.md:50-52`:
read this as "author the two already-designed slice contracts", not "design slice contracts".

**D1. Author the Deal slice contract into lilly-contract-review.**
Why: `MASTER-REMAINING-WORK.md:320` assigns it `issues[]`, `documentConflicts[]`,
`protection{}`, `obligations[]`, `tacticFlag`. deal-tab is currently the only skill in the
suite with an output-slice contract (`deal-tab-1c344a/SKILL.md:65-75`).
Change: add a "Deal-tab hub contribution, output slice" section naming exactly those
fields; strip competing "build your own dashboard" instructions; preserve the five
standalone output modes and the clause/playbook engine (`MASTER-REMAINING-WORK.md:316`).
Verify: deal-tab renders from the slice with no field it does not own.
Effort: M. Marc decision: tagged `[Marc, after D0-D2]`; D0 is now closed (deal-tab exists),
D2 is deferred (M1). See decision 3. Depends on: A11, B4.

**D2. Author the Deal slice contract into scope-sow-architect.**
Fields: `scope{}` plus scope `issues[]` (`MASTER-REMAINING-WORK.md:320`). Preserve
`Rewritten_SOW.docx` and the four-pass workflow (`:316`). Effort: S. Depends on: D1.

**D3. Author the Deal slice contract into pro-forma-builder.**
Fields: `commercialLines[]`, `scenarios[]`, `assumptions[]`, `proforma{}`, `benchmarks[]`.
Do NOT touch the workbook path (`MASTER-REMAINING-WORK.md:316`). Note pro-forma already has
the closest thing to a boundary statement (`SKILL.md:256-259`), so this is a formalization.
Effort: S. Depends on: D1.

**D4. Author the RFx slice contracts into the four feeders.**
Skills: rfp-engine, rfp-case-manager, rfp-response-analysis, evaluation-engine.
Why: the richer of the two designs, already specified with the proposed-vs-official lens:
rfp-response-analysis output is labelled **proposed**, evaluation-engine output **official**
(`_redesign_proposals/RFx-REDESIGN-SPEC.md:157-168`). That labelling is an accuracy
mechanism, not presentation: it stops an AI first pass being read as a panel decision.
Change: each feeder declares its bounded slice, each field carrying `sourceRef`. The hub
composes and never re-scores.
Verify: rfx-hub renders with every field traceable to a feeder and a `sourceRef`;
a field owned by nobody must fail the build, not render as a gap (see D7).
Effort: L. Marc decision: no. Depends on: A1.

**D5. Add a slice-contribution contract to deal-room.**
Why: deal-room is a hub that consumes slices (`SKILL.md:620-626`) but does not declare
what it exposes outward to negotiation-playbook-learning at close. It has this de facto in
the Phase 8 handoff mapping (`SKILL.md:697-804`) but unlabelled
(`_audit/GROUP-4-supplier-category-deal.md:67`).
Effort: S. Depends on: D1.

**D6. Add slice staleness assertions to deal-room's `hub_slices`.**
Why: `hub_slices` provenance is not re-checked the way the numbers-reconcile assertion is,
so a 90-day-old contract-review slice renders silently as current
(`_audit/GROUP-4-supplier-category-deal.md:51`). Silent staleness is a drift vector.
Change: per-skill staleness window; a stale slice renders "STALE, refresh from {skill}".
Verify: seed a slice with an old provenance timestamp and confirm the stale state renders.
Effort: S. Depends on: D5.

**D7. Add schema validation to deal-tab's build.**
Why: `deal-tab-1c344a/SKILL.md:71-73` has the ownership table but no versioning or
validation hook, so a lens skill can rename a field and deal-tab renders a gap rather than
erroring. A silent gap masks a real upstream break
(`_audit/GROUP-4-supplier-category-deal.md:71`).
Change: `dashboard/_parts/schema_check.py` validating incoming keys against the ownership
table before `build_deal_artifact.py` runs, failing with "field X is not owned by any
registered lens skill".
Verify: rename a field in a test data object; the build must fail loudly.
Effort: S. Depends on: D1-D3.

## WS E: Handoff-schema source-of-truth discipline (Phase 2)

**E1. Fix the stale `case-handoff-schema.md` in rfp-engine.**
Skills: rfp-engine, rfp-case-manager.
Why: two independently maintained copies of a contract governing what passes between two
skills. `rfp-case-manager-1c344a/SKILL.md:723` self-documents it: rfp-engine's source copy
"still describes legacy provisioning actions on receipt" that rfp-case-manager no longer
performs under the v2.0 no-provisioning decision. The receiver-actions list at
`rfp-engine-1c344a/references/case-handoff-schema.md:124-131` still carries folder-mapping
actions.
Change: correct rfp-engine's copy to match the v2.0 behaviour.
Verify: diff the two copies; only the vendoring header differs.
Effort: S. Marc decision: no. Depends on: nothing. This is the second-cheapest correctness
item in the plan.

**E2. Apply the kernel's source-of-truth discipline to every shared schema.**
Skills: rfp-engine, rfp-case-manager, rfp-response-analysis, evaluation-engine,
sole-source-challenge, deal-room, rfx-hub.
Why: `_audit/RECONCILIATION.md:80-84`: "The numeric kernel avoids exactly this with a named
source of truth and a do-not-hand-edit header; the handoff schemas have neither."
`RfxToDealHandoff` already has the rule ("do not fork it",
`RFX-DEAL-HANDOFF-AND-COMMS-EVIDENCE.md:14`) but no header enforcing it.
Change: for each shared schema, name one canonical file, add a do-not-hand-edit header
naming the source, add a `schema_version` where absent, and record the re-vendor step in a
maintenance note.
Verify: extend `verify_kernel_copies.py` (C9) to also hash schema bodies.
Effort: M. Marc decision: no. Depends on: C9, E1.

**E3. Formalize evaluation-engine's outbound handoff.**
Skills: evaluation-engine.
Why: the family's one asymmetry. Inbound handoff discipline is excellent
(`SKILL.md:1167-1251`); outbound names only "contract negotiation chain" generically with
no schema, and `routing-and-chains.md:75` repeats the vagueness
(`_audit/GROUP-3-rfx-family.md:64`).
Change: `evaluation_engine_award_handoff.json` built from the already well-shaped
`scoring_grid` array (`SKILL.md:936`), with a schema version, a validation table and named
consumers (commercial-negotiation-prep, lilly-contract-review).
Verify: producer emits, named consumer validates, citation provenance preserved as
rfp-response-analysis already mandates (`SKILL.md:2073-2089`).
Effort: M. Marc decision: no. Depends on: E2.

**E4. Build a real XLSX generator for rfp-engine's structured artifacts.**
Skills: rfp-engine.
Why: `SKILL.md:288` claims a 5-tier response scale with data validation and conditional
formatting on `requirements_matrix.xlsx` and `pricing_template.xlsx`, but no code produces
them, so nothing guarantees the validation dropdowns exist
(`_audit/GROUP-3-rfx-family.md:10,18`). The DOCX path already has a real builder
(`assets/lilly_rfx_template.js`), so this is the highest-risk gap relative to its sibling.
Change: an openpyxl generator, matching the pro-forma wiring pattern.
Verify: open the generated workbook and assert data validations and conditional formats
are present.
Effort: M. Marc decision: no. Depends on: A11. Also serves F9.

**E5. Add the JSON-sidecar ownership table to category-strategy.**
Why: `category-strategy-1c344a/SKILL.md:2138` describes the sidecar only as "additive...
never gate the dashboard on it", with no named fields, so downstream consumers
(rfp-engine, market-rate-benchmarking, supplier-deep-dive) have nothing stable to read
(`_audit/GROUP-4-supplier-category-deal.md:66`).
Effort: S. Depends on: B1.

## WS F: The four slowness mechanisms (Phase 2)

Design rationale in section 3. Items here are the concrete builds.

**F1. Separate analysis passes from assembly passes in lilly-contract-review.**
Skills: lilly-contract-review.
Why: `SKILL.md:648` mandates four passes per document plus a Layer 1 governing-document
read. The passes are the accuracy measure and stay. The cost is that each pass re-reads
raw contract text and the deliverable is then hand-assembled with no builder in the
directory (`_audit/GROUP-1-contract-legal.md:11,13`).
Change: keep all four passes. Add deterministic clause segmentation before Pass 1 so each
pass reads a structured clause register rather than raw text; persist the `PASS_4_PREP`
data object (already specified, `SKILL.md:273`) as the single findings register; add a
generator that assembles the redlined DOCX and the findings ledger from that register.
Verify: finding-count and finding-ID parity against a golden contract before and after;
Pass 4's cross-finding check must still run, now over the register.
Effort: L. Marc decision: contract-review is the sensitive skill agreed not to modify
casually (`PLATFORM-CONSOLIDATION-TRACKER.md:172`, B4 hold). See decision 6.
Depends on: A11, C1.

**F2. Collapse rfp-response-analysis's three document reopens into one generator call.**
Skills: rfp-response-analysis.
Why: `SKILL.md:554-555` mandates "Pass 2: Open the saved document and append... Pass 3:
...open the saved document and append all cross-cutting sections". This is assembly, not
analysis, and the skill already ships `rfp_analysis_report_generator.py` (2,935 lines)
that does real python-docx assembly from a kernel-computed ground truth
(`_audit/GROUP-3-rfx-family.md:42,44`). The reopen loop is redundant with a builder that
already exists.
Change: analysis phases unchanged; the DOCX is built once by the generator from the
completed ground-truth object. Bid Leveling still gates scoring (`SKILL.md:571`) as a data
dependency, not as a document-reopen dependency.
Verify: section-for-section diff of generated vs hand-assembled output on a golden RFP;
every figure traced to the ground-truth object.
Effort: M. Marc decision: no. Depends on: C3.

**F3. Do NOT cap web search in the three pricing skills. Deduplicate and cache instead.**
Skills: commercial-negotiation-prep, should-cost-builder, market-rate-benchmarking.
Why the cap is refused: G7 Research Minimums (`lilly-brand-assets-1c344a/SKILL.md:1061`)
sets a floor for depth, and `percentile_gate(n_points, min_points=5)` refuses to report a
band below 5 points. `_audit/TRACKERS-C-skills-handoff.md:196-198` notes G7 is "the
opposite pressure from the audit's cap-the-searches recommendation, and no document
reconciles the two." Capping degrades accuracy. It does not ship.
Change instead: (a) cluster rate lines into role families before research so searches are
per distinct role or cost driver rather than per line, when the lines genuinely share a
market; a line whose family yields fewer than 5 points still gets its own searches;
(b) persist a dated benchmark cache so a re-run recalls rather than re-searches, which is
CC2 recall-don't-recompute (`PROGRAM-MASTER-PLAN.md:27-31`) with `timeline_calibration.json`
as the working precedent (`timeline-builder-1c344a/SKILL.md:195`); (c) keep
`percentile_gate()` as the hard floor.
Verify: points-per-line must not fall; assert every reported band still passes
`percentile_gate`; cache hits must carry an as-of date and re-search when past the
staleness window.
Effort: M. Marc decision: yes, the clustering rule needs a sign-off because it changes what
"independent data point" means per line (decision 7). Depends on: H4 (as-of provenance).

**F4. Batch invoice-rate-card-auditor's per-line loop into one code pass.**
Skills: invoice-rate-card-auditor.
Why: `SKILL.md:229,256` require the model to resolve and verify every invoice line
individually, and invoice populations are the largest-N input in the suite
(`_audit/GROUP-2-commercial-pricing.md:69`). A model loop over thousands of lines can skip
one; code cannot. This is a completeness improvement first.
Change: a companion script taking the extracted invoice / contract / PO / timesheet line
arrays and running PASS_2 through PASS_4 matching, verification and rollup in one
execution, calling `verify_line_math()` and `escalate()` internally per line
(`_audit/GROUP-2-commercial-pricing.md:75`). The model still judges ambiguous matches, but
only on lines the code flags as ambiguous. G11's fail-closed rule (`SKILL.md:193`) moves
into the script as a raise.
Verify: row-count reconciliation (lines in equals lines verified equals lines in the
ledger); a golden invoice set with seeded defects (rate mismatch, escalation over cap,
duplicate, unsupported hours) must produce exactly the seeded findings and no others.
Effort: L. Marc decision: no. Depends on: C9.

**F5. Wire a generator for invoice-rate-card-auditor's outputs.**
Why: the skill has no builder besides the kernel; the JSON ledger and DOCX are
model-assembled from per-line kernel outputs (`_audit/GROUP-2-commercial-pricing.md:67`).
Change: serialize the ledger and build the DOCX from the F4 script's output object.
Verify: ledger row count equals verified line count.
Effort: M. Depends on: F4.

**F6. Wire pro-forma's dashboard to the generator's ground truth.**
Why: the optional `pro_forma_dashboard.jsx` is the one remaining hand-built artifact in
the best-wired skill in its group, and it is hand-assembled from narrative figures rather
than from `compute_ground_truth()`, so the workbook and dashboard can drift
(`_audit/GROUP-2-commercial-pricing.md:33`).
Change: a small data-adapter emitting the dashboard data object from `compute_ground_truth()`.
Verify: assert dashboard NPV equals workbook NPV cell.
Effort: S. Depends on: A11.

**F7. Leave category-strategy's per-category research uncached across categories.**
Why: `category-strategy-1c344a/SKILL.md:287,391-403` requires 14-21 searches per category
and explicitly forbids sharing research across categories in a multi-category run. Sharing
would let one category's market evidence stand in for another's. That is a grounding
failure, not a saving. RECOMMENDATION: do not change it. Add only the within-category
materialized artifact so a re-run of the SAME category recalls.
Verify: a second run of the same category performs zero new searches and states the as-of
date; a run of a different category performs the full minimum.
Effort: S. Marc decision: no. Depends on: H4.

**F8. Add a JS reconciliation assertion to theos-field-guide before render.**
Why: the KPI strip and Savings/Report Card math are described as deterministic
(`SKILL.md:408,413`) but nothing validates that `achieved <= committed` or that Report Card
categories foot to the stated GPA, and the data object is model-populated per run, so a bad
number renders silently (`_audit/GROUP-6-output-foundations.md:163-170`).
Change: a lightweight assertion pass mirroring `executive_summary_generator.py`'s
`_assert_no_forbidden_content` pattern, before the engine paints.
Verify: seed `achieved > committed` and confirm the view refuses rather than renders.
Effort: S. Marc decision: no. Depends on: nothing.

**F9. Generator coverage sweep for every remaining model-assembled deliverable.**
Skills: commercial-negotiation-prep (C8), rfp-engine (E4), invoice-rate-card-auditor (F5),
supplier-deep-dive (A5), scope-sow-architect (`rate_card_and_payment_schedule.xlsx`,
`_audit/GROUP-1-contract-legal.md:59`), legal-negotiation-prep (briefing DOCX,
`_audit/GROUP-1-contract-legal.md:27`), negotiation-playbook-learning (all artifacts,
`_audit/GROUP-6-output-foundations.md:93`), rfp-case-manager (Case Status Visual,
`_audit/GROUP-3-rfx-family.md:26`).
Why: `docs/master-plan.md:182-198` already names model-assembled documents as the cost and
quality problem and the generator pattern as the remedy. This item is the sweep that
finishes it.
Change: per deliverable, decide build-a-generator or accept-as-prose, with a written
reason. Prose is the right answer where content is genuinely narrative
(`_audit/GROUP-6-output-foundations.md:36-41` records the correct split for
executive-summary-package: code owns validation, chain math, assembly and invariants; the
model owns narrative).
Verify: a table in the release notes listing every deliverable, its builder, or its
recorded reason for having none.
Effort: L. Marc decision: `#32 dashboard-as-code generators (full generator-ify)` is
tagged large and deferred (M18). See decision 8. Depends on: A11.

## WS G: Claude Desktop runtime feasibility (Phase 2, with a gate in Phase 1)

New workstream, Marc 2026-07-29: "we also need to ensure that these can be run successfully
via claude desktop." A skill that reads well but does not execute is not shipped
(`feedback_integrate_or_dont_ship`).

**G1. Third-party import inventory and degradation audit.**
Skills: the 7 with generators.
Why: verified this session. The generators need `openpyxl` (pro-forma, should-cost,
market-rate), `python-docx` (evaluation-engine, executive-summary, rfp-response-analysis,
sole-source) and `python-pptx` (sole-source, `sole_source_generator.py:224-226`). The
current handling is GOOD and should be the standard: each wraps the import in a try block
and defers failure to build time rather than import time, so validation and ground-truth
logic remain usable without the library (`pro_forma_generator.py:85-103`,
`should_cost_generator.py:165-183`).
Change: confirm every generator follows this pattern; where a library is missing, the skill
must state plainly in the output that the generator was unavailable and what degraded, as
`should-cost-builder-1c344a/SKILL.md:282` already specifies.
Verify: run each generator's self-test in an environment with the library removed; assert a
clear named error, not a traceback, and assert validation still runs.
Effort: M. Marc decision: no. Depends on: nothing.

**G2. Cross-skill path portability audit.**
Skills: at least 12, verified by grep.
Why: this is the highest-risk runtime finding. Every skill's shared block instructs
"Read and follow `/mnt/skills/user/lilly-brand-assets-1c344a/references/execution-guardrails.md`"
(for example `category-strategy-1c344a/SKILL.md:89`, `comment-cleanup-1c344a/SKILL.md:59`,
`deal-room-1c344a/SKILL.md:68`, `evaluation-engine-1c344a/SKILL.md:81`,
`executive-summary-package-1c344a/SKILL.md:77`). If a user installs only some skills,
`lilly-brand-assets-1c344a` may not be present and that path does not resolve. Logo assets
have the same exposure (`commercial-negotiation-prep-1c344a/SKILL.md:1122`,
`evaluation-engine-1c344a/SKILL.md:417`).
Mitigating evidence: at least two skills already carry a documented fallback,
"If the foundation cannot be read, follow the Rule 9 inlined summary and proceed with
reduced styling" (`evaluation-engine-1c344a/SKILL.md:373,417`,
`evaluation-engine-1c344a/SKILL.md:633` for the palette case). So the pattern exists.
UNKNOWN: whether all 12 carry a Rule 9 equivalent. Resolved by grepping each SKILL.md for a
foundation-unavailable fallback clause.
Change: every cross-skill path reference gets a stated fallback, and the fallback must
carry enough inlined content to keep the run CORRECT, not just styled. A missing palette is
cosmetic; a missing `supplier-risk.md` anti-fabrication rule is not, and that file is
referenced by the same shared block (`category-strategy-1c344a/SKILL.md:91`).
Verify: install one skill alone in Desktop; run it; assert it completes and states the
degradation.
Effort: L. Marc decision: yes, whether lilly-brand-assets becomes a hard prerequisite
declared in every skill's install notes, or every skill inlines the load-bearing rules
(decision 10). Depends on: nothing.

**G3. Builder self-containment audit.**
Skills: category-strategy, deal-tab, supplier-landscape, supplier-deep-dive.
Why: verified this session. `deal-tab-1c344a/dashboard/build_deal_artifact.py:34` resolves
`_platform_build` relative to its own build directory, and the tree is vendored inside the
skill, so it is portable. `supplier-landscape-1c344a/dashboard/build_dashboard.py` imports
only stdlib (argparse, ast, base64, html, json, os, re) and is self-contained. But
`_category_build/build_dashboard_category.py:22-25` resolves `_platform_build` at REPO
root, one level ABOVE the build directory, which does not exist in an installed layout.
That is a hard break, and it is item A4.
Change: A4 fixes category-strategy. This item is the sweep that confirms every other
builder resolves paths relative to its own file only.
Verify: for each builder, copy only its owning skill directory to a clean temp path and run
the build.
Effort: S. Marc decision: no. Depends on: A4.

**G4. Vendored-kernel self-containment check.**
Why: verified this session. All seven generator scripts insert only their OWN directory on
`sys.path` (`pro_forma_generator.py:63-64`, `should_cost_generator.py:141-142`,
`market_rate_generator.py:117-118`, `evaluation_report_generator.py:169-170`,
`executive_summary_generator.py:225-226`, `rfp_analysis_report_generator.py:215-216`,
`sole_source_generator.py:178-179`), then import the vendored `numeric_kernel`. No script
reaches into a sibling skill. The vendoring discipline holds. This item records that as a
verified property and adds the regression guard.
Change: add the self-containment assertion to the C9 verification script.
Verify: run each generator from a directory containing only its own skill.
Effort: S. Marc decision: no. Depends on: C9.

**G5. Output-path portability.**
Skills: at least 17 reference `/mnt/user-data/outputs/` (grep list includes category-strategy,
deal-room, evaluation-engine, invoice-rate-card-auditor, lilly-brand-assets,
lilly-contract-review, pro-forma-builder, procurement-launcher, rfp-response-analysis,
sole-source-challenge, supplier-deep-dive, supplier-landscape, theos-field-guide).
Why: these paths are correct for the Claude execution environment but a skill must not
fail if the directory is absent.
Change: builders take an explicit `--out` argument (supplier-landscape and category-strategy
already do) and default sensibly; SKILL.md instructions state the path as the default, not
as a requirement.
Verify: run each builder with `--out` pointing elsewhere.
Effort: S. Marc decision: no. Depends on: nothing.

**G6. Tool and connector assumption audit.**
Skills: process-navigator, procurement-help-desk, meeting-prep-brief, workflow-map,
rfp-case-manager, theos-field-guide, voice-profile.
Why: these depend on the M365 connector, live SharePoint or intranet fetches, or web search.
`procurement-help-desk-1c344a/SKILL.md:129-131,219-222` already flags that one source
(Global ProtectLilly on now.lilly.com) is "the source most likely to fail retrieval"
because it lives outside SharePoint indexing. `executive-summary-package-1c344a/SKILL.md:1073-1096`
contains shell commands (`touch`, `test -f`, `rm`) assuming a writable `/mnt/skills/user/`
and a bash tool.
Change: every connector or tool dependency must be DETECTED not assumed, per WS H, and the
skill must complete with a labelled degradation. Shell-dependent install instructions
should be marked as installation guidance, not runtime steps.
Verify: run each with the connector off; assert completion plus a stated gap.
Effort: M. Marc decision: no. Depends on: H1.

**G7. Widget and artifact render dependencies.**
Skills: procurement-launcher (`assets/theo-widget.html` via `visualize:show_widget`,
`_audit/GROUP-5-orchestration.md:64-70`), process-navigator (`SKILL.md:255-268`),
theos-field-guide (self-contained HTML using `window.storage`,
`_audit/GROUP-6-output-foundations.md:136-144`).
Why: `MASTER-REMAINING-WORK.md:421` records that procurement-launcher's verification is
static analysis only, never a live smoke test.
Change: run the live smoke test (widget render plus Teach-mode paths). Confirm the
markdown degrade path actually renders when the widget tool is absent.
Verify: both paths exercised in Desktop; theos-field-guide's `window.storage` persistence
confirmed to work or documented as not persisting.
Effort: S. Marc decision: no. Depends on: nothing.

**G8. Define the canonical per-skill RUNTIME SMOKE TEST.**
Skills: all 31.
Why: no such test exists today. Each skill's correctness is currently asserted by reading
it.
Change: a `SMOKE.md` per skill, or one `_audit/SMOKE-TESTS.md`, defining a single scripted
run per skill. It must assert, in this order:
1. **Activation.** The skill triggers on its own documented trigger phrase and does not
   trigger on a sibling's.
2. **Input election.** S0 blocking-input check and S1 source election fire before any
   search, and the run stops and waits where the protocol says stop and wait
   (`invoice-rate-card-auditor-1c344a/SKILL.md` SUITE INTERACTION PROTOCOL, S1).
3. **Degradation.** With the connector off and no uploads, the skill still completes and
   states what was unreachable.
4. **Code path.** Every Python entry point the SKILL.md names actually runs, including its
   own self-test where one ships (23 checks should-cost, 24 market-rate, 76
   executive-summary, 21 timeline-engine).
5. **Kernel binding.** Every figure the SKILL.md says must come from the kernel is traceable
   to a kernel return, not to prose.
6. **Refusal.** A deliberately missing required field produces a raise or a NEEDS_INPUT
   state, never an invented value.
7. **Artifact.** Every named deliverable is produced, opens, and is non-empty.
8. **Provenance.** Every artifact carries the source and as-of date of what it was built
   from.
Verify: the smoke test itself is the verification. Record pass or fail per skill in a
matrix.
Effort: L. Marc decision: no. Depends on: G1-G7, H1.

**G9. Run the smoke test matrix and fix what it breaks.**
Effort: L. Marc decision: no. Depends on: G8. This is the gate on K1 packaging.

## WS H: Grounding under unknown data access, and anti-drift (Phase 2)

New workstream, Marc 2026-07-29. Two coupled problems: the skill cannot know what the user
can reach, and the model must not fill the gap with invention.

**H1. Canonicalize the source-availability detection step.**
Skills: all 31.
Why: the pattern already exists and is good, but is not uniform. 29 of 32 directories carry
the SUITE INTERACTION PROTOCOL (verified by grep; the three without it are `deal-tab-1c344a`,
`lilly-brand-assets-1c344a` and `lilly-procurement-kernels-1c344a`, all correctly exempt
since none is a task-executing skill). S1 already states the right rule:
"Do NOT auto-search before asking. The M365 connector can only see what lives in M365
(SharePoint, OneDrive, Outlook, Teams); it CANNOT see Ariba, an ERP/AP system, or other
external systems, so say that plainly... If M365 is not connected, proceed on
provided/uploaded documents and label the gap"
(`invoice-rate-card-auditor-1c344a/SKILL.md`, SUITE INTERACTION PROTOCOL S1). S5 already
splits BLOCKING from ENRICHING inputs correctly.
The gap is that election is an ASK, not a DETECT. The user is asked what to do before
anyone knows what is reachable.
Change: add a deterministic availability probe before S1: attempt one cheap, bounded read
per candidate source (M365 connector present or not, one SharePoint fetch, web search
available or not), record the result as a typed `source_availability` record, and let S1
offer only the options that are actually available. Record the record in the output.
Verify: with the connector off, the S1 picker must not offer "Search M365"; the output must
carry the availability record.
Effort: M. Marc decision: yes, this changes the interaction of every skill (decision 11).
Depends on: nothing.

**H2. Define one canonical degradation ladder.**
Skills: all 31.
Why: today each skill writes its own degradation prose. `procurement-help-desk-1c344a`
models the target ("Degrades gracefully with no connector: general principles, labeled not
Lilly-verified"), `process-navigator-1c344a/SKILL.md:202-207` has retry-once-then-fallback
per source, `evaluation-engine-1c344a/SKILL.md:373` has "If the foundation cannot be read,
follow the Rule 9 inlined summary". Three different ladders.
Change: one shared ladder, inlined once in `lilly-brand-assets-1c344a/references/execution-guardrails.md`
as a new guardrail and referenced by every skill:
1. **Live authoritative source** read this run. Label: cited, as-of date.
2. **Vendored snapshot** of that source. Label: snapshot, as-of date, "verify against live".
3. **User-provided document.** Label: user-supplied, name and date.
4. **General principle, not Lilly-verified.** Label explicitly as such.
5. **Abstain.** Name the field and the source that would resolve it. Never invent.
Every fact in every deliverable carries which rung it came from.
Verify: a run with each rung forced must show the correct label; a run with no source must
abstain, not proceed.
Effort: M. Marc decision: yes, this is a new guardrail (decision 12). Depends on: H1.

**H3. Audit G12 claim-gate implementation versus mention.**
Skills: all 31.
Why: MAJOR FINDING, verified this session. G12 "Claim-Gate, Cite or Abstain" is declared a
HARD RULE, suite-wide at `lilly-brand-assets-1c344a/SKILL.md:1113`, and
`MASTER-REMAINING-WORK.md:77` records "#5 claim-gate DONE (foundation guardrail G12,
ebdc557)". But grep for "G12" or "claim-gate" across all 32 SKILL.md files returns exactly
TWO files: `lilly-brand-assets-1c344a/SKILL.md` (where it is defined) and
`deal-room-1c344a/SKILL.md`. By contrast `NEEDS_INPUT` appears in 27 files and `G11` in 9.
So the suite-wide claim-gate is defined centrally and referenced by one consuming skill.
This is consistent with B8's finding that two skills still cite the guardrail range as
G1-G10 and G1-G11.
Change: for each of the 29 task-executing skills, either add the G12 reference to its
suite-wide guardrails note (cheap, but only as strong as the model's compliance) or, where
a generator exists, encode the gate as a raise (strong). Prefer the second wherever a
generator exists.
Verify: grep count for G12 equals 30; and for every generator-backed skill, a claim without
a source must raise.
Effort: M. Marc decision: no, this is enforcing an existing locked rule. Depends on: B8.

**H4. Move provenance from per-document to per-fact.**
Skills: all research-driven skills: supplier-landscape, supplier-deep-dive,
category-strategy, market-rate-benchmarking, should-cost-builder,
commercial-negotiation-prep, process-navigator, procurement-help-desk.
Why: the strongest existing precedent is `_category_build`'s seed shape, which already
carries `$src` provenance blocks per field
(`_audit/GROUP-4-supplier-category-deal.md:96`), and rfp-response-analysis's handoff which
mandates that "All source_document and source_location values from this handoff must be
preserved in evaluation-engine's downstream outputs" (`SKILL.md:2073-2089`). Elsewhere
provenance is per document, so a single cited page can silently back six unrelated claims.
Change: every data object field carries `{value, source, as_of, confidence}`. This is the
mechanism that makes H2's ladder checkable and F3's cache safe.
Verify: schema validation rejects a fact without a source; the dashboard renders the as-of
date.
Effort: L. Marc decision: no. Depends on: H2.

**H5. Verify that citations resolve, not merely that they exist.**
Skills: the research-driven set plus process-navigator and procurement-help-desk.
Why: a present-but-dead citation is worse than an absent one, because it reads as
verification. `reference_lilly_procurement_policy_urls` lists 4 SharePoint sources; ProtectLilly
is already flagged as retrieval-prone-to-fail
(`procurement-help-desk-1c344a/SKILL.md:129-131`).
Change: a resolve check on every emitted citation: URL fetched this run, or snapshot hash
matched, or explicitly labelled unverified. Deterministic, in code where a generator exists.
Verify: seed a dead URL; the run must label it unverified, not cite it clean.
Effort: M. Marc decision: no. Depends on: H4.

**H6. Give the SKILLS the gap-state discipline the dashboards already have.**
Skills: all deliverable-producing skills.
Why: the dashboards already enforce it: a missing field renders a stated gap naming the
field needed, never an invented value (the NEEDS_INPUT dot markers,
`category-strategy-1c344a/SKILL.md:563`; deal-room's `hub_slices` `null | object` with
NEEDS_INPUT fallback, `SKILL.md:620-626`; rfp-case-manager's NEEDS_INPUT banner rather
than a derived TCO, `SKILL.md:1232-1236`). The DOCX and XLSX deliverables have no
equivalent enforcement except where a generator raises.
Change: extend the two wired generators' pattern suite-wide. `should_cost_generator.py`
raises `ShouldCostValidationError` on "a missing or NEEDS_INPUT field", and
`should-cost-builder-1c344a/SKILL.md:282` says plainly "do not deliver a workbook: surface
the raised message... rather than hand-patching around the failure." That is the strongest
anti-fabrication mechanism in the suite because it is code, not instruction. Every new
generator from F9 must raise the same way.
Verify: for each generator, a NEEDS_INPUT in a required field must raise; the raise message
must name the field.
Effort: M. Marc decision: no. Depends on: F9, H3.

**H7. Record what was reachable, in the deliverable.**
Skills: all 31.
Why: a reader cannot judge a conclusion without knowing what the run could see. Today this
is scattered prose.
Change: every deliverable carries a short, standard "Sources reached this run" block built
from H1's availability record plus the H2 ladder rungs actually used.
Verify: present in every artifact type; generator-built artifacts get it from code.
Effort: S. Marc decision: no. Depends on: H1, H2.

**H8. Fix supplier-risk anti-fabrication reachability.**
Skills: all 12 that reference `/mnt/skills/user/lilly-brand-assets-1c344a/references/supplier-risk.md`.
Why: the referenced file carries hard anti-fabrication rules ("never assert a debarment,
sanctions, breach, or financial-distress status without a cited source; 'not verified,
requires a formal screen' is the answer", for example `category-strategy-1c344a/SKILL.md:91`).
If lilly-brand-assets is not installed, the highest-stakes anti-fabrication rule in the
suite is unreachable. This is G2's worst case.
Change: inline the supplier-risk refusal rules into every skill that assesses supplier risk,
regardless of the shared-block reference. Duplication is correct here: this rule must never
depend on another install.
Verify: run a risk assessment with lilly-brand-assets absent; the refusal must still fire.
Effort: S. Marc decision: no. Depends on: G2.

**H9. Reconcile G7 research minimums with the availability ladder.**
Why: G7 sets a search floor (`lilly-brand-assets-1c344a/SKILL.md:1061`), but if web search
is unavailable the floor cannot be met. Today no rule says what happens then.
Change: state it. If the floor cannot be met, the skill produces the deliverable with the
band suppressed (percentile_gate already does this for percentiles) and labels the section
as below the research floor. It does not lower the floor silently and it does not refuse
the whole run.
Verify: run with search off; assert bands are suppressed and the label appears.
Effort: S. Marc decision: no. Depends on: H2.

**H10. Adopt the comms-evidence 5-step methodology beyond deal-room.**
Skills: deal-room plus the two negotiation-prep skills, per the already-approved item
(`MASTER-REMAINING-WORK.md:73-76`, recommendation 6: "shared comms-evidence methodology
starting with deal-room + the 2 negotiation-prep skills").
Why: it is the suite's most rigorous evidence discipline
(`_redesign_proposals/RFX-DEAL-HANDOFF-AND-COMMS-EVIDENCE.md`) and it is currently scoped
to one family.
Change: apply as designed. Do not widen further without evidence it fits.
Effort: M. Marc decision: no, already approved. Depends on: H4.

## WS I: Help-desk (Phase 3)

**I1. Decide sibling skill versus fold into process-navigator.**
Why: `procurement-help-desk-1c344a/SKILL.md:319` carries the fork explicitly. Marc's
recorded lean is MERGE (`PROGRAM-MASTER-PLAN.md:172`, A3: "Lean MERGE into
`process-navigator` (one skill)... NO up-front mode picker... Leave help-desk AS-IS for
now; finalize at Phase 3/WS6 on the efficiency criterion").
Effort: S (decision), M (execution). Marc decision: yes (decision 5). Depends on: A11.

**I2. Run the six network-gated harvest steps.**
Why: `procurement-help-desk-1c344a/references/TODO-network-gated-harvest.md:1-3`: "STATUS:
placeholder only. This file contains NO Lilly content." The only genuinely
network-blocked item in the backlog (`MASTER-REMAINING-WORK.md:347`). Real page reads only,
never inferred.
Effort: M. Marc decision: no, but BLOCKED on Lilly network. Depends on: I1.

**I3. Wire help-desk into routing once it ships.**
Why: `procurement-launcher-1c344a/SKILL.md:318` deliberately excludes it from the 27
routable skills and `routing-and-chains.md:36-38` withholds a chain row "until it ships".
Change: add the routing row, the widget entry and the count.
Effort: S. Depends on: I2, J2.

## WS J: Orchestration as THEO maturation (Phase 3, WS4)

Per the LOCKED decision, `docs/master-plan.md:312-345` (Stage 8): "This is the MATURATION
of procurement-launcher (THEO), NOT a new skill", first pass DONE 2026-07-22
(`docs/master-plan.md:405-407`). The audit's contrary recommendation
(`_audit/SYNTHESIS.md:110`) is not followed. See decision 1.

**J1. Rebuild THEO as conversational intake.**
Why: #108, `PROGRAM-MASTER-PLAN.md:118`: diagnose, recommend, confirm, hand off; retire the
static menu-as-default; keep direct trigger phrases.
Change: as specified. Do not claim auto-dispatch; `procurement-launcher-1c344a/SKILL.md:205-215`
is honest that it does not exist in stock Desktop, and that honesty is an accuracy property
to preserve.
Verify: live smoke test (G7); a free-text need produces the correct ordered path.
Effort: L. Marc decision: gate at `PROGRAM-MASTER-PLAN.md:117`. Depends on: A11, B7.

**J2. Collapse routing into one JSON manifest.**
Why: #110, `PROGRAM-MASTER-PLAN.md:119`: today 4-5 hand-synced files. Hand-synced routing
is the same drift class as the hand-synced handoff schema in E1.
Change: one manifest as source of truth; widget, Markdown fallback, teach-mode lists and
the chain table all generated from it.
Verify: regenerate all four surfaces; diff against the manifest; no hand edits possible.
Effort: M. Marc decision: no. Depends on: J1.

**J3. Cross-session journey state, on the timeline-builder pattern.**
Why: THEO has no persisted state at all (`_audit/GROUP-5-orchestration.md:36-41`), so it
cannot tell first run from later run except by re-reading chat. The template already exists
in exactly one place and should be copied rather than invented:
`timeline_calibration.json`, small, typed, persisted to Project knowledge with a file
fallback, explicitly checked for presence to gate first-run behaviour
(`timeline-builder-1c344a/SKILL.md:172,195,197-207`), self-describing about recovery
(`SKILL.md:23`).
Change: a minimal journey-state record: request key, last skill run and what it produced
(artifact name and type, not content), which inputs were CONFIRMED versus ASSUMED, and the
next suggested hop from `routing-and-chains.md`. Persist under the same S2 pattern every
skill already implements, so it degrades identically when no Project exists.
Also: build the same thing for meeting-prep-brief, whose "the brief gets richer when state
accumulates across meetings with the same counterparty" (`SKILL.md:97`) is aspirational
prose with no file, no schema and no read-back step
(`_audit/GROUP-5-orchestration.md:307-312`).
Verify: second run in the same Project detects the state file and does not re-ask; deleting
it returns first-run behaviour with a recoverable message.
Effort: M. Marc decision: sequenced "after hubs" (`PROGRAM-MASTER-PLAN.md:122`).
Depends on: J2.

## WS K: Packaging and release (Phase 4)

**K1. Pre-packaging integrity sweep and repackage.**
Why: `MASTER-REMAINING-WORK.md:415-417`: a 44MB staging tree was built at
`%TEMP%\claude\pkg_lilly_2026-07-29\` and never written to Downloads; no in-repo packaging
script exists (`PROGRAM-MASTER-PLAN.md:142`).
Change: write the packaging script; run the integrity sweep; produce the `.skill` set.
Verify: G9's smoke matrix must be green first; install from the produced package and re-run
one smoke test per skill family.
Effort: M. Marc decision: no. Depends on: G9.

**K2. Refresh the Desktop delivery folder and run the dummy-data render per skill.**
Why: `MASTER-REMAINING-WORK.md:418-419`.
Effort: S. Depends on: K1.

---

# SECTION 3: THE EFFICIENCY REDESIGNS, TREATED SERIOUSLY

Four mechanisms (`_audit/SYNTHESIS.md:80-96`). For each: the accuracy property that must
hold, how the redesign holds it, how that is checked, and what evidence would prove the
redesign lost accuracy.

## 3.1 Multi-pass document reopens

**Where.** lilly-contract-review: four passes, per clause (`SKILL.md:648,894`).
rfp-response-analysis: three passes with a full supplier x scenario Bid Leveling pass
gating any scoring (`SKILL.md:328,554-555,571`). Also supplier-landscape's three sequential
DOCX passes each re-opening the saved document (`SKILL.md:608-615`).

**Accuracy property to preserve.** Three distinct ones, and they are not the same thing:
1. Every clause is judged against the playbook with the full governing-document stack in
   view. That is what Passes 1 and 2 buy.
2. Cross-finding consistency. Pass 4 re-reads ALL findings against the governing-document
   landscape and catches contradictions no single-clause pass can see
   (`lilly-contract-review-1c344a/SKILL.md:648`).
3. Sequencing integrity: Bid Leveling must complete for every pricing supplier before any
   scoring starts, because the normalized price is the scoring input
   (`rfp-response-analysis-1c344a/SKILL.md:571`).

**The redesign.** Separate ANALYSIS passes from ASSEMBLY passes, and cut only the second.

The four contract-review passes are analysis. They stay, all four. What is expensive about
them is that each re-reads raw contract text. Insert deterministic clause segmentation
before Pass 1 so every pass operates on a structured clause register with stable IDs
(`_audit/OPTIMIZATION-PRINCIPLES.md:46-50`: "Segment clauses, parse tables, extract rate
lines in Python so each model pass operates on clean structured input rather than re-reading
raw text. Fewer tokens AND less to misread"). Property 1 is unaffected because the same
clauses are judged. Property 2 IMPROVES, because Pass 4 gets a register with stable IDs
rather than re-reading prose findings, so a cross-reference cannot be missed by paraphrase
drift.

The three rfp-response-analysis "passes" at `SKILL.md:554-555` are NOT analysis. They are
document assembly: open the saved document and append. And that skill already ships
`rfp_analysis_report_generator.py`, 2,935 lines of real python-docx assembly that computes
ground truth via the kernel before rendering (`_audit/GROUP-3-rfx-family.md:42,44`). The
reopen loop is redundant with a builder that exists and works. Removing it removes the
model from assembly entirely, which is an accuracy improvement, not just a saving: a
figure written by code from a validated object cannot be mistyped in a third append pass.
Property 3 is a DATA dependency, not a document dependency, and it holds unchanged because
Bid Leveling still completes before the ground-truth object is built.

Same treatment for supplier-landscape's three DOCX passes once its builder covers the DOCX.

**Cost effect.** For contract-review, the raw-text re-read cost falls by roughly the ratio
of segmented register to full document, repeated four times, and no judgment is lost. For
rfp-response-analysis, two of three whole-document reopens disappear entirely.

**How it is checked.** Finding-count and finding-ID parity on a golden contract, before and
after. Pass 4's contradiction check must fire on a golden document containing a known
MSA-versus-SOW conflict. For rfp-response-analysis, section-for-section diff of generated
versus hand-assembled output, and every figure traced to the ground-truth object.

**What would prove accuracy was lost.** Fewer findings on the golden contract. A finding
that lost its governing-document cross-reference. A Pass-4 contradiction the register-based
check misses that the prose-based check caught. Any figure in the generated DOCX that does
not appear in the ground-truth object. Any of these means the redesign does not ship.

**Marc gate.** contract-review is the skill agreed not to modify casually
(`PLATFORM-CONSOLIDATION-TRACKER.md:172`). F1 is proposed, not assumed.

## 3.2 Per-item unbatched loops

**Where.** invoice-rate-card-auditor calls the kernel per invoice line
(`SKILL.md:229,256`), and invoice populations are the largest-N input in the suite
(`_audit/GROUP-2-commercial-pricing.md:69`).

**Accuracy property to preserve.** Every line is verified. G11 fail-closed holds: "A figure
produced without the kernel is invalid... the skill STOPS on that specific line... does NOT
fall back to estimating the figure in prose" (`SKILL.md:193`). And G5 requires the complete
findings object, every line, every finding, every rollup, before any rendering
(`SKILL.md:94`).

**The redesign.** One script over the extracted line arrays, calling `verify_line_math()`
and `escalate()` internally per line, running PASS_2 through PASS_4 in a single execution.
The model keeps the work that needs judgment: extraction, and resolving lines the code
flags as ambiguous.

**Why this is an accuracy improvement, not a tradeoff.** A model iterating over 2,000
invoice lines turn by turn can skip one and produce a plausible ledger. A `for` loop
cannot. Coverage becomes structural rather than diligent. The fail-closed rule becomes a
raise rather than an instruction. This is the clearest case in the whole audit where the
cheaper design is also the more accurate one.

**The risk this creates, stated plainly.** Extraction becomes the single point of failure.
Today a model reading each line has a second chance to notice a mis-parsed column; a batch
pass does not. Mitigation: extraction stays model-side with the S1 default-reading
disclosure the skill already requires ("State the default reading you are using for any
ambiguous column"), plus a reconciliation assertion that the sum of extracted line totals
equals the stated invoice total. If that assertion fails, the run stops.

**How it is checked.** Row-count reconciliation: lines extracted equals lines verified
equals lines in the ledger. A golden invoice set with seeded defects (rate mismatch,
escalation over cap, duplicate line, unsupported hours) must yield exactly the seeded
findings and no others.

**What would prove accuracy was lost.** A seeded defect missed. A line present in the
invoice and absent from the ledger. The extracted-total assertion passing while a column
was mis-parsed, which would show up as a systematic offset across a golden set.

## 3.3 Uncapped per-line web search

**Where.** commercial-negotiation-prep: 3 independent searches per rate line, so about 60
searches for a 20-line rate card before Phase 2 (`SKILL.md:250-256`). market-rate-benchmarking:
"minimum of 3 independent searches per rate line. Aim for 5+ usable data points"
(`SKILL.md:235`). should-cost-builder: "at least 3 independent searches" per major driver
(`SKILL.md:161`). category-strategy: 14-21 searches per category, explicitly not shared
across categories (`SKILL.md:287,391-403`).

**Accuracy property to preserve.** Depth per line. G7 Research Minimums sets it as a floor
(`lilly-brand-assets-1c344a/SKILL.md:1061`), and `percentile_gate(n_points, min_points=5)`
refuses to report a band on fewer than 5 points. The floor is the accuracy mechanism.

**Conclusion: capping is refused.** `_audit/TRACKERS-C-skills-handoff.md:196-198` states the
conflict directly: G7 "sets a floor on search count for depth, which is the opposite
pressure from the audit's 'cap the searches' recommendation, and no document reconciles the
two." A cap lowers the floor. That is degradation, and per
`_audit/OPTIMIZATION-PRINCIPLES.md:22-26` it does not ship. **The audit's recommendation to
cap the searches should not be executed.**

**What ships instead, and what it preserves.**

(a) **Deduplicate by role family, not by line.** Where several rate lines are the same role
in the same market (three "Senior Java Developer, offshore" lines from three suppliers), the
market evidence is the same evidence. Cluster deterministically before research, then
research per distinct family. Points-per-line is unchanged, because every line in the family
inherits the family's points and `percentile_gate` still evaluates per line. A family that
yields fewer than 5 points gets its own additional searches. This cuts duplicated work, not
depth. It is the one genuine saving available here, and its size depends entirely on how
much duplication the rate card contains: on a card of 20 genuinely distinct roles it saves
nothing, and it should save nothing.

(b) **Persist a dated benchmark cache.** A re-run recalls rather than re-searches, within a
staleness window. This is CC2's "recall-don't-recompute (materialized artifacts)"
(`PROGRAM-MASTER-PLAN.md:27-31`) with `timeline_calibration.json` as the working precedent
(`timeline-builder-1c344a/SKILL.md:195`). Accuracy holds because every cached point carries
its as-of date (H4) and re-searches past the window. It IMPROVES consistency: two runs a
day apart no longer produce two different benchmark bands from the same market.

(c) **Keep the gate.** `percentile_gate()` stays exactly as it is.

**How it is checked.** Points-per-line before and after must not fall. Every reported band
must pass `percentile_gate`. Every cached point must carry an as-of date and re-search past
the window.

**What would prove accuracy was lost.** Points-per-line falls for any line. A band reported
that `percentile_gate` would refuse. A clustered family whose members are not actually the
same market, which shows up as within-family variance exceeding the reported band.

**Where accuracy CANNOT be preserved while cutting cost, stated plainly.** For a rate card
of genuinely distinct roles, and for a multi-category strategy run, there is no saving
available that does not lower the evidence floor. `category-strategy-1c344a/SKILL.md:287`
already refuses to share research across categories and even recommends splitting into
separate conversations when context pressure shows. That refusal is correct.
**RECOMMENDATION: leave the per-category and per-distinct-line research cost alone.** It is
the price of grounding. The only change is the within-category cache in F7.

## 3.4 Model-assembled documents

**Where.** Every DOCX, XLSX and JSX outside the wired generators
(`_audit/SYNTHESIS.md:94-95`). Currently that includes: commercial-negotiation-prep's two
xlsx plus its briefing docx (`_audit/GROUP-2-commercial-pricing.md:11`), rfp-engine's
requirements matrix and pricing template (`_audit/GROUP-3-rfx-family.md:10`),
invoice-rate-card-auditor's ledger and report (`_audit/GROUP-2-commercial-pricing.md:67`),
scope-sow-architect's rate card and payment schedule
(`_audit/GROUP-1-contract-legal.md:59`), legal-negotiation-prep's briefing
(`_audit/GROUP-1-contract-legal.md:27`), negotiation-playbook-learning's entire output set
(`_audit/GROUP-6-output-foundations.md:93`), supplier-deep-dive's dashboard
(`_audit/GROUP-4-supplier-category-deal.md:27`).

**Accuracy property to preserve.** Every figure in a deliverable equals the validated
ground truth, and no figure appears that was not derived.

**The redesign.** Extend the generator pattern. This is not a new idea and it is not the
audit's idea: `docs/master-plan.md:182-198` already diagnoses model-assembled documents as
the cost and quality problem and names the generator pattern as the remedy, with
`lilly_rfx_template.js` and `pro_forma_generator.py` as the working precedent.

**Why this is accuracy-first, per `_audit/OPTIMIZATION-PRINCIPLES.md:28-42`.** The stated
ordering is accuracy, then consistency, then reliability, then cost. The already-wired
generators demonstrate all four: `should_cost_generator.py` writes every tab as live Excel
formulas that independently re-derive the same figures, with named ranges, and
`should-cost-builder-1c344a/SKILL.md:284` states the accuracy reason plainly: "the
quadrature roll-up for independent drivers is not the naive low/high sum, and the generator
writes the naive figures only as a labelled footnote so the two are never confused." A model
hand-assembling that workbook would produce the naive sum and it would look right.

**What must NOT be generator-ified.** Narrative. `_audit/GROUP-6-output-foundations.md:36-41`
records the correct split for executive-summary-package: code owns validation, kernel-backed
chain computation, document assembly and structural invariants; the model owns background,
benefits and risks, which cannot be templated. F9 requires a written reason for every
deliverable left as prose, so the split is deliberate rather than residual.

**How it is checked.** Per generator, a self-test asserting the built artifact re-derives
its own figures (the existing tests do this: 23 checks should-cost, 24 market-rate, 76
executive-summary). Plus: a NEEDS_INPUT in any required field must raise, not render.

**What would prove accuracy was lost.** A generated figure differing from the ground-truth
object. A generator that silently substitutes a default for a missing input. A narrative
section that became templated and now reads as a key-value dump, which
`narrative-standards.md` already forbids.

## 3.5 Grounding cost, stated rather than optimized away

Marc's instruction, recorded here as required. The WS H work adds tokens: an availability
probe at the start of every run, per-fact provenance instead of per-document, a citation
resolve check, and a "sources reached" block in every deliverable.

That cost is justified and it is not to be optimized away. Per
`_audit/OPTIMIZATION-PRINCIPLES.md:5-9`, accuracy comes first and it is "not a tie-break".
An ungrounded number delivered cheaply is a defect, not a saving. The specific defenses:

- The availability probe is bounded (one cheap read per candidate source, once per run) and
  it REPLACES speculative searching against sources that are not reachable, which is pure
  waste today.
- Per-fact provenance is a data-shape change, not extra model reasoning. Where the object
  is generator-built the cost is zero model tokens.
- The citation resolve check is deterministic and belongs in code.
- Only the "sources reached" block is a genuine unrecovered token cost, and it is small and
  constant.

Net expectation: WS H is roughly cost-neutral to slightly positive, and where it is
negative that is the correct trade.

---

# SECTION 4: SEQUENCING

The locked order is `PROGRAM-MASTER-PLAN.md:41-70`, re-sequenced with Marc 2026-07-26:
"The dashboards gate almost everything, so they go first; a skills-file CLEANUP pass sits
between the dashboards and the deep skills work (so Claude never weeds through retired
content); the ARIA conversion is DEAD LAST."

`_audit/TRACKERS-B-dashboards.md:284-300` is explicit that the audit's own recommended order
would reverse this. This plan follows the locked order.

## Phase 1: finish the dashboards (WS A)

1. A1 rfx-hub, A2 handoff emitter.
2. A3 + A4 category-strategy rehome and platform vendoring. **Note:** A3 and A4 are a TREE
   MOVE and a path fix, not a skills-file edit. The SKILL.md text rewrite (B1, B2, B3) is
   Phase 2 cleanup work and is sequenced there. `PROGRAM-MASTER-PLAN.md:84` places "carry
   into a Category Strategy hub" in WS1 Phase 1, so the move belongs here; `:99` places the
   reference-JSX removal in WS3a Phase 2. Splitting them this way honours both lines.
3. A5 + A6 Deep Dive.
4. A7 My Work (+ #44 handover brief).
5. A8, A9, A10 Landscape uplift, recolor, seed bugs.
6. A11 lock all five.

**Justified exception requested inside Phase 1:** C9 (kernel copy verification) and E1
(stale case-handoff-schema fix). Both are Phase 2 by category. Both are S-effort, touch no
dashboard, and are pure correctness. C9 should run BEFORE any kernel edit so that the
re-vendor step in C1-C8 is checkable, and E1 fixes a contract between two skills that is
self-documented as wrong today (`rfp-case-manager-1c344a/SKILL.md:723`). Precedent exists:
the generator wiring at 03f29f8 jumped the sequence with Marc's direct authorization and
`_audit/RECONCILIATION.md:99-101` records it as "a deliberate exception rather than a
precedent." So this is a REQUEST, not an assumption. See decision 13. If refused, both slide
to Phase 2 with no harm beyond the delay.

**Also requested early:** B8 (guardrail range normalization, one grep and a few edits) and
H8 (inline the supplier-risk refusal rules). Both are anti-fabrication rules that are
currently either mis-scoped or unreachable. Same decision.

## Phase 2, first half: cleanup (WS B)

B1, B2, B3 category-strategy text; B4 reference-JSX sweep; B5 dead code; B6 orphaned HTML;
B7 stale instructions; B8 if not taken early; B9 comment-cleanup Mode B decision.

Cleanup before enhancement, per `PROGRAM-MASTER-PLAN.md:42-43`, so the later work does not
read retired content.

## Phase 2, second half: enhancement

Order within the half, chosen so that each item's dependency exists when it runs:

1. **C9, G4** kernel verification and self-containment (if not taken early). Everything
   kernel-shaped depends on being able to verify a re-vendor.
2. **G1, G2, G3, G5, G6, G7** runtime feasibility audits. These come BEFORE the deep skill
   edits because it is wasteful to enhance a skill that does not execute, and because G2's
   answer (decision 10) changes how every skill's shared block is written, which every later
   edit touches.
3. **H1, H2** availability detection and the degradation ladder. These are the canonical
   patterns every subsequent skill edit must adopt. Doing them after the skill edits would
   mean editing every skill twice.
4. **H3, H8, H9** claim-gate enforcement.
5. **C3, C4, C5, C6, C7, C2, C8, C10** kernel adoption, in the ranked order at
   `PROGRAM-MASTER-PLAN.md:108` (category-strategy, playbook-learning, rfp-engine,
   negotiation-simulator) with C3 Bid Leveling inserted first because it gates a ranking
   (`rfp-response-analysis-1c344a/SKILL.md:571`) and is the largest correctness exposure
   found.
6. **F1 through F9** the efficiency redesigns. After the kernels, because F2 depends on C3
   and F4 depends on C9.
7. **H4, H5, H6, H7, H10** per-fact provenance and code-enforced abstention. After the
   generators exist (F9), because H6 is implemented as generator raises.
8. **D1 through D7** slice contracts. Last in Phase 2, because a slice contract describes a
   settled output and the outputs settle in steps 5 and 6.
9. **E2, E3, E4, E5** schema discipline.
10. **G8, G9** define and run the smoke matrix. This closes Phase 2 and gates release.

**Deviation flagged:** C1 (Protection Score deduction kernel, #114) and C2
(playbook-learning kernel, #113) are homed in **WS8, Phase 4**, deliberately late and
`[held]` (`PROGRAM-MASTER-PLAN.md:145-150`). This plan runs C2 in Phase 2 with the rest of
the kernel adoption pass and leaves C1 in Phase 4.

Justification for moving C2 only: `PROGRAM-MASTER-PLAN.md:108` ALSO lists
negotiation-playbook-learning as rank 2 of the WS3 deterministic-Python items, so the corpus
already places this work in two phases. Phase 2 is the earlier of the two and the audit
supplies new evidence that was not available when WS8 was written: the v2.1 changelog
records a scaling-overshoot bug that already shipped once
(`negotiation-playbook-learning-1c344a/SKILL.md:33`,
`_audit/GROUP-6-output-foundations.md:80-82`). A proven production bug in the exact class
the kernel prevents is a reason to move it earlier, not later.

Justification for NOT moving C1: contract-review is explicitly the sensitive skill agreed
not to modify casually, held pending an explicit go (`PLATFORM-CONSOLIDATION-TRACKER.md:172`,
`PROGRAM-MASTER-PLAN.md:148`). It stays in Phase 4 unless Marc says otherwise. F1, which
also touches contract-review, carries the same gate.

**Deviation flagged:** #102 the cross-cut scoring layer is GREEN LIT and DEFERRED to WS8
Phase 4 (`PROGRAM-MASTER-PLAN.md:150,176`). Every kernel item in WS C should be read as an
input to that eventual convergence, not as its final shape
(`_audit/TRACKERS-A-program.md:221-226`). Nothing in WS C should be designed in a way that
makes #102 harder: keep each new scoring function as a pure function with a stable
signature so it can be lifted into a shared engine later.

## Phase 3: conversational and orchestration

J1, J2, J3 THEO maturation; then WS5 conversational PCC (out of scope for this plan, see
section 6); then I1, I2, I3 help-desk. Order per `PROGRAM-MASTER-PLAN.md:57-60`.

## Phase 4: foundation and release, plus held kernels

K1, K2 packaging; C1 Protection Score deduction kernel; F1 contract-review pass redesign;
#80 hybrid clause pipeline; #102 cross-cut scoring layer.

## Phase 5: ARIA

Untouched by this plan. Branch, do not mutate (`PROGRAM-MASTER-PLAN.md:155-157`).

---

# SECTION 5: DECISIONS NEEDED FROM MARC

**1. Orchestration: THEO maturation, or a new orchestration skill?**
Recommendation: **THEO maturation**, per the locked decision
(`docs/master-plan.md:312-345`, first pass DONE 2026-07-22). Tradeoff: the audit's argument
is real. THEO self-describes as "a dispatcher, not an orchestrator"
(`procurement-launcher-1c344a/SKILL.md:152`) and is deliberately kept context-light by not
inlining its companion files (`SKILL.md:22,363-367`), so loading orchestration into it
contradicts its own stated role and grows the largest SKILL.md in its group. Against that:
the corpus's answer to exactly that constraint was to mature THEO's guided-handoff role
within its existing bounds without ever claiming auto-dispatch
(`docs/theo-redesign-plan.md:144-151`), and the suite's chosen shape is many small
domain-scoped hub orchestrators plus a router, not one cross-suite orchestrator
(`PROGRAM-MASTER-PLAN.md:83`). A new skill would be a third pattern.
Note the genuinely open sub-question neither document decides
(`_audit/TRACKERS-B-dashboards.md:262-264`): cross-DOMAIN re-run, for example "re-run RFx
scoring after new bids arrive, across skills". If you want that, J3's journey state is where
it lives.

**2. Category Strategy tab count.**
Recommendation: **confirm 5, correct the build spec, and write the 7-to-5 decision record.**
Tradeoff: 5 is locked, built and verified (`VERSION-LOCK-2026-07-29.md:27`,
`MASTER-REMAINING-WORK.md:12-15`). But the approved 7-tab plan had a Supplier Program tab
and a new Execution tab, both dropped with no recorded rationale, and Trend & Change was
un-folded back into its own tab against the plan's stated preference
(`_audit/TRACKERS-B-dashboards.md:100-108`). Confirming 5 means confirming those three
changes. If Execution was wanted, say so now rather than after B1 rewrites the SKILL.md.

**3. Slice contracts: proceed with D2 still deferred?**
Recommendation: **proceed.** The slice contract is tagged `[Marc, after D0-D2]`
(`MASTER-REMAINING-WORK.md:320`). D0 is now closed: `deal-tab-1c344a` exists. D2, the
no-green rule update, is deferred by Marc because of a ~26-skill blast radius (M1,
`MASTER-REMAINING-WORK.md:365`). Tradeoff: D2 is a COLOUR decision and the slice contract is
a FIELD-OWNERSHIP decision. They were bundled because both touch the same files. Unbundling
lets the field ownership land now. Risk: the lens skills get touched twice, once for fields
and later for colour. Given `feedback_no_shortcut_reversals`, unbundling needs your explicit
word rather than an inference.

**4. Deep Dive hub home.**
Recommendation: **`supplier-deep-dive-1c344a` hosts it**, on the supplier-landscape pattern
(engine inside the skill directory). `MASTER-REMAINING-WORK.md:390` records "hub home still
TBD". Tradeoff: Deep Dive renders at four depths including as a Landscape tab and an RFx
bidder view, so an argument exists for hosting it in Landscape. Against: it would make
Landscape the owner of a view other hubs consume, which inverts the lens/hub direction that
deal-tab established.

**5. Help-desk: sibling skill, or fold into process-navigator?**
Recommendation: **fold**, per your recorded lean (`PROGRAM-MASTER-PLAN.md:172`, A3: "Lean
MERGE into `process-navigator` (one skill)... NO up-front mode picker"). Tradeoff: the
sibling path already has a well-specified BOUNDARY with trigger-collision handling
(`procurement-help-desk-1c344a/SKILL.md:95-114`), which is real work to discard. Folding
means process-navigator infers the user's role from the connector or the question rather
than asking, which is harder to get right but matches `feedback_skill_design_principles`
(no up-front mode pickers). Decide BEFORE the harvest, since the two paths need different
state and dedup handling (`_audit/GROUP-5-orchestration.md:418-426`).

**6. contract-review: authorize F1 and C1, or keep both held?**
Recommendation: **authorize F1's clause segmentation and findings register, keep C1 held
until you have seen the deduction-kernel design.** Tradeoff: contract-review is the largest
and most sensitive skill and is explicitly on hold (`PLATFORM-CONSOLIDATION-TRACKER.md:172`,
B4). F1 is the largest single cost item in the suite and also improves Pass 4's
cross-finding check. But it touches the four-pass workflow, which is the thing you said was
deliberate. If you want zero risk here, skip F1 entirely: the rest of the plan does not
depend on it.

**7. Rate-line clustering for research dedup (F3).**
Recommendation: **approve, with the per-line `percentile_gate` floor unchanged.**
Tradeoff: this changes what "3 independent searches per rate line"
(`market-rate-benchmarking-1c344a/SKILL.md:235`) means in practice, from per line to per
distinct role family. Points-per-line does not fall, but the searches backing a line may now
have been run for a sibling line. If you regard "independent per line" as literal, this is
not approvable and the answer is to leave the search cost alone, which is a legitimate
outcome.

**8. F9 generator sweep scope.**
Recommendation: **approve the sweep, sized per deliverable rather than as one big
generator-ify.** `#32 dashboard-as-code generators (full generator-ify)` is tagged large and
deferred (M18, `MASTER-REMAINING-WORK.md:382`). Tradeoff: doing it deliverable by
deliverable spreads the cost and lets each one carry its own reason, but takes longer than a
single push.

**9. comment-cleanup Mode B (B9).**
Recommendation: **keep it in place and add a hard confirmation gate**, rather than
splitting. Tradeoff: the skill's own maintainer note argues for splitting
(`comment-cleanup-1c344a/SKILL.md:452`), and the risk-profile mixing is real. But a split
adds a 32nd skill for a mode that runs rarely, and `feedback_skill_update_never_regress_branch`
makes the split the more disruptive option. A gate captures most of the safety at a fraction
of the churn.

**10. Cross-skill path dependency (G2).**
Recommendation: **inline the load-bearing rules into every skill; keep the
`/mnt/skills/user/lilly-brand-assets-1c344a/...` reference as an enrichment, not a
requirement.** Tradeoff: inlining duplicates content across 12+ skills and duplication
drifts, which is exactly what C9 and E2 exist to control. The alternative, declaring
lilly-brand-assets a hard prerequisite in every install note, is cleaner but means a
partially-installed suite silently loses its anti-fabrication rules
(`category-strategy-1c344a/SKILL.md:91`). Given accuracy-first, duplication of a REFUSAL
rule is the safer failure mode. H8 already proposes this for supplier-risk specifically; the
decision is whether it extends to execution-guardrails and validation-checklist too.

**11. Availability probe before source election (H1).**
Recommendation: **approve.** Tradeoff: it changes the opening interaction of all 29
task-executing skills, and the S1 protocol is currently uniform and well-drafted. Adding a
probe means one more step before the user is asked anything. Against that: today S1 can
offer "Search M365" to a user with no connector, and the failure surfaces later as an empty
result. Detecting first is both more accurate and, on balance, fewer round trips.

**12. New guardrail for the degradation ladder (H2).**
Recommendation: **approve as G13**, inlined once in
`lilly-brand-assets-1c344a/references/execution-guardrails.md`. Tradeoff: adding a suite-wide
guardrail has a ~29-skill reference blast radius, and B8 already shows that guardrail-range
references drift. But the alternative is per-skill degradation prose, which is what we have,
and it is inconsistent across three different patterns today.

**13. Permit the four early-correctness items into Phase 1?**
Items: C9 kernel copy verification, E1 stale case-handoff-schema fix, B8 guardrail range
normalization, H8 supplier-risk inlining. All S-effort, none touches a dashboard.
Recommendation: **permit.** Tradeoff: it is a documented deviation from the locked
dashboards-first order, and `_audit/RECONCILIATION.md:99-101` explicitly says the previous
deviation stands as an exception, not a precedent. If you would rather hold the line, all
four slide to Phase 2 and nothing breaks.

---

# SECTION 6: EXPLICITLY OUT OF SCOPE

**1. The two dead generators. DONE, not pending.**
`should_cost_generator.py` and `market_rate_generator.py` were the audit's "cheapest large
win" (`_audit/SYNTHESIS.md:50`). They are now wired. Verified this session:
`should-cost-builder-1c344a/SKILL.md:280,282,284` carries a "Workbook generation wiring
(HARD RULE)" naming `generate_should_cost_workbook()`, its component functions, its
raise-don't-hand-patch rule and its 23-check self-test.
`market-rate-benchmarking-1c344a/SKILL.md:379,382,386` carries the equivalent for
`generate_market_rate_workbook()` with a 24-check self-test.
`_audit/RECONCILIATION.md:16` records the commit (03f29f8). Do not re-open.

**2. Reversing any locked dashboard UI.**
Deal, RFx, Landscape and Category Strategy structures are locked
(`VERSION-LOCK-2026-07-29.md`, `_deal_build/DEAL-DASHBOARD-TRACKER.md:311-368`).
`_audit/TRACKERS-B-dashboards.md:302-311` confirms none of the audit's findings asks to
reopen a locked UI. Nothing in this plan does either. Strategy & Plays on Category Strategy
is explicitly "LOCKED. Leave it exactly as built" (`MASTER-REMAINING-WORK.md:41`).

**3. Trimming any analysis pass, research minimum, or per-item loop.**
Per `_audit/OPTIMIZATION-PRINCIPLES.md:17-26`, that reading is "explicitly rejected". Section
3 redesigns assembly, duplication and recompute. It never reduces judgment coverage.

**4. Model-tier routing.**
Ruled out by the Desktop constraint (`_audit/OPTIMIZATION-PRINCIPLES.md:72-77`,
`feedback_skills_desktop_usage_efficient`). No item assumes a cheaper model for mechanical
passes.

**5. The ARIA conversion (WS9).**
Dead last, branched into a separate folder, never converting the Desktop skills in place
(`PROGRAM-MASTER-PLAN.md:66-68,155-157`). Gated on CC1-CC3 verification, which is WS3 work
this plan feeds but does not complete.

**6. The help-desk content harvest.**
Blocked on the Lilly network, the one genuinely network-blocked item in the backlog
(`MASTER-REMAINING-WORK.md:346-347`). I2 is listed but cannot start offline. Real page reads
only, never inferred.

**7. Items Marc has deferred, and which this plan does not reopen.**
D2 the no-green rule (M1, ~26-skill blast radius); #86 invoice-rate-card platform mapping
(SHELVED not deprecated, `PROGRAM-MASTER-PLAN.md:177`, needs invoices and contracts visible
together); #80 contract-review hybrid clause pipeline (GREEN LIT but held, `:149`); the
Landscape narrative reconciliation (~250 illustrative sub-narratives, parked, `:183`); the
ARIA Fabric telemetry loop (`:183`); the Landscape D&B/Bloomberg enrichment backlog
(`MASTER-REMAINING-WORK.md:436`, optional).

**8. WS5 conversational PCC.**
Phase 3 work with its own plan (`PROGRAM-MASTER-PLAN.md:125-131`). It depends on the same
Phase 1 and Phase 2 gates as everything else here, but its content is a separate design
exercise and expanding it here would duplicate that plan.

**9. The `re-paper-SOW` new skill.**
GREEN LIT as a NEW skill (`PROGRAM-MASTER-PLAN.md:180`) and on the build list, but it is
new capability rather than completion of the existing 31, and the brief for this document is
the upgrade of the current suite.

---

# APPENDIX: what is UNKNOWN, and what would resolve it

1. **Whether all 12 skills that reference `/mnt/skills/user/lilly-brand-assets-1c344a/...`
   carry a foundation-unavailable fallback.** Two are confirmed to
   (`evaluation-engine-1c344a/SKILL.md:373,417,633`). Resolved by grepping each SKILL.md for
   a Rule 9 or equivalent clause. Item G2.
2. **Whether `window.storage` persistence in `theos-field-guide`'s HTML artifact actually
   works in Claude Desktop's artifact sandbox.** Resolved by G7's live test.
3. **Whether `openpyxl`, `python-docx` and `python-pptx` are present in Desktop's execution
   environment.** The generators are written to survive their absence
   (`pro_forma_generator.py:85-103`), so this is a degradation question, not a blocker.
   Resolved by G1's test run.
4. **Whether any work has begun on the case-handoff-schema fix.**
   `_audit/TRACKERS-C-skills-handoff.md:227-228` records no tracker entry for it. Resolved
   by checking git history for `rfp-engine-1c344a/references/case-handoff-schema.md`.
5. **Why the 7-tab plan's Supplier Program and Execution tabs were dropped.** No document
   narrates it (`_audit/TRACKERS-B-dashboards.md:100-108`). Resolved only by Marc.
6. **Whether supplier-deep-dive's absence of arithmetic is by design or an oversight.**
   `_audit/GROUP-4-supplier-category-deal.md:25` marks this UNKNOWN. Resolved by checking
   whether the Renewal dossier's Spend Commitment and Price Exposure rows are ever meant to
   be computed comparisons rather than narrative reads.
7. **The real token cost of each mechanism in section 3.** No measurement exists.
   `_audit/OPTIMIZATION-PRINCIPLES.md:83` requires "the measured cost before and after" for
   any redesign. Resolved by instrumenting one golden run per affected skill BEFORE
   redesigning it. This should be the first action inside WS F.
</content>
</invoke>
