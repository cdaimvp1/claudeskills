# RFx AREA: Platform vs Skill Dashboards - Redesign Proposal

Scope: the RFx tab in the platform (project-view "RFx" tab, vanilla `assets/pv/pv-09-rfx.js` +
React port `react-ui/src/tabs/RfxTab.tsx`) versus the `rfp-response-analysis`, `evaluation-engine`,
and `rfp-engine` / `rfp-case-manager` skill dashboards. Focus: cross-supplier comparison, coverage
heatmap, scoring/pricing, Q&A/addendum surfaces.

Sources read (read-only): platform `assets/pv/pv-09-rfx.js` (1374 lines), `react-ui/src/tabs/RfxTab.tsx`
(1386 lines), `_audit_workspace/dashboard-gap-assessment/01-RFx.md`, `_audit_workspace/rfx-tab-redesign-spec.md`
(Marc-approved 2026-07-05 build spec); skill `rfp-response-analysis-1c344a/SKILL.md` (dashboard-canonical.md
inlined), `evaluation-engine-1c344a/SKILL.md` (+ `examples/evaluation_engine_canonical_dashboard.jsx`),
`rfp-engine-1c344a/SKILL.md`, `rfp-case-manager-1c344a/SKILL.md`.

IMPORTANT FINDING UP FRONT: the platform has already been through a full Marc-approved redesign
(`rfx-tab-redesign-spec.md`, 2026-07-05) that is NOW BUILT in `pv-09-rfx.js`. This is one of the more
mature areas of the platform - it already exceeds the skill dashboards in several places (interactive
weight-sliders, sensitivity/robustness verdicts, gate-aware advisory ranking, ZOPA). But there is real,
verifiable DRIFT between the two platform surfaces themselves, and two dead/unwired functions worth
fixing before adding anything net-new. See "Reconcile first" under NEWEST VERSION.

---

## 1. PLATFORM (what it does well)

### Structure: 4 top-level subtabs, no sub-sub-tab sprawl
`Overview -> Scoring -> Analysis -> Recommendation` (`RFX_SUB`, pv-09-rfx.js:106-131). Analysis has
exactly two sub-subtabs (`Individual supplier` / `Cross-Supplier`, `RFX_AV`, lines 869-887); Individual
supplier is ONE scrolling page with a sticky jump-nav, not a third tab level. This was a deliberate,
documented decision (`rfx-tab-redesign-spec.md` "Resolved decisions B") to avoid tab-in-tab-in-tab
depth. The old IA (Summary / Bidders / Scoring / Analysis) was audited, found shallow versus the
skill dashboards, and REPLACED - this is not a stale reference point, it is superseded.

### Why it reads as coherent

- **One merged ranking, not three.** The old design rendered the same ranking three times (a
  weighted-fit bar chart, an advisory-ranking list, per-supplier narratives). The rebuild collapses
  this into ONE view on Overview: left = per-supplier rows with three at-a-glance signals (weighted-fit
  bar, coverage-% bar, rank#+tier chip), right = a narrative that updates to whichever supplier is
  selected (`rfxMergedRankingHTML`, lines 271-299). Click a row, the narrative on the right re-renders.
  This is the single strongest coherence move: one interaction model (click-to-select) drives both the
  compare view and the deep-dive view everywhere in the tab (`RFX_DD`, shared selection state).
- **Compact event strip, not a tall stacked card.** `rfxEventStripHTML` (lines 203-246) is a tight
  `.ovfacts` key-value grid (RFx name / Stage / Health / CCI / Est TCO / Next action) plus, only when
  present, an INTERNAL delaying-item flag row (never a supplier issue) and the evaluation-summary lede.
  This replaced a description block + evaluation roster + scores-due + doc link + landscape link that
  used to stack the page tall before any analysis appeared (Marc's explicit complaint, "Evaluation
  panel LEFT / Event data RIGHT, or merged" - resolved by merging and compacting).
- **Merit vs gate is never hidden.** Every ranking, narrative, and recommendation states BOTH the
  top panel-score supplier and the gate-pass leader when they diverge, and explains why a
  Must-Have failure demotes a higher scorer to #2 rather than burying it (`rfxRecoText`,
  `rfxCompareReadHTML`, lines 72-79, 456-483). This is a genuine analytical honesty pattern:
  the reader is never left wondering "wait, didn't that other supplier score higher?"
- **Density with restraint.** KPI tiles are small stat cards (`rfxKpi`, 22px number, 9px mono
  label), pills are 8.5-9px uppercase mono chips, tables are compact `.mx` grids reusing the
  Landscape's `.hcell` + `pvHmRamp()` blue-ramp pill styling for every heatmap in the app (coverage
  heatmap, per-requirement matrix, scoring matrix) so all grids in the platform share one visual
  grammar. Nothing is a bubble-card; sections are dividers + tables (matches the app-wide
  "de-bubble" design direction).
- **Color does one job.** Plum (`--plum #5C2B50`) is the only "good/lead" accent; amber is caution;
  red (`#C8202E`) is reserved for hard gate failures and nothing else. No green anywhere. This
  three-colour restraint (plum / amber / red-only-for-gates) is the same discipline documented for
  the rest of the app and it is what keeps a dense page legible.

### Scoring subtab (Marc: "protected win" - do not touch)
Two-level weighted editor: category weights sum to 100% of the overall score, each category's own
sub-criteria weight to 100% within that category (effective weight = category% x sub%), both
validated before the structure can lock (lines 624-646). Per-evaluator private scoring: your own
sub-criterion entries roll up live to your own category/overall score, and the panel composite
stays HIDDEN until you submit (no anchoring) - `RFX_SC_MODE` toggles "My scores" vs "Composite"
side-by-side (lines 606-702). Below the matrix: **panel calibration**, a collapsible pair of cards -
per-criterion inter-rater disagreement (spread/SD, "Aligned/Moderate/High") and a team-vs-Theo
reconciliation (biggest deltas between the submitted panel and Theo's first-pass), with a one-line
headline so the value shows without expanding (`rfxVarianceReconHTML`, lines 1076-1123). The
requirement set (MoSCoW, acceptance criterion, traces-to-objective, extraction confidence, derived
category weights) sits below that as a collapsible reference, not a competing wall of cards
(`rfxRequirementsRegisterHTML`, lines 1277+). Excel export is explicitly a read-only snapshot; the
in-app matrix stays system of record (line 699).

### Analysis > Cross-Supplier (the strongest single surface for this AREA)
One flattened scrolling page (lens tabs were tried and explicitly retired - "increment 3: Compare is
one page (stacked groups + jump-nav), no lens tabs", line 114), organized as:
1. **Field roll-up** table, Theo's award-recommendation order, with RECOMMENDED / TOP PANEL badges so
   a merit-leader that fails a gate is marked, not hidden (`rfxCrossRollupHTML`, 529-544).
2. **The assessment** - a plain-English narrative synthesized from the same helpers the tables use, so
   it cannot drift from the evidence (`rfxCompareReadHTML`, 456-483).
3. **Value & cost** - a value-map scatter (panel score x annual price, dot size = coverage, a
   dashed ring = Must-Have gate fail, an unpriced-lane for suppliers with no submitted price) next to
   the raw cross-supplier pricing table, with a narrative insight card (`rfxValueMapHTML`,
   `rfxPricingTableHTML`, `rfxValueCostInsight`, 484-586).
4. **Capability** - the coverage heatmap (category rows x supplier cols, coverage % on the shared
   blue ramp, Weight column, OVERALL row, category-leaders line) next to a narrative insight card,
   with the full per-requirement 0-5 comparison matrix (MoSCoW chip + confidence %, leader-ringed)
   collapsed behind a "See all N requirements" fold so the page doesn't drown in it
   (`rfxHeatmapHTML` 824-839, `rfxReqMatrixHTML` 712-725, `rfxCapabilityInsight` 575-586).

This directly answers the AREA's "cross-supplier comparison / coverage heatmap / scoring & pricing"
brief better than either skill dashboard does on its own, because it unifies what the skill spec
keeps as three separate tabs (Coverage Heatmap tab, Scoring & Pricing tab, and the ranking on
Executive Summary) into one page with narrative reads stitched on, and shows the same visual
grammar (the ramp, the pills, the plum accent) everywhere.

### Recommendation subtab (top-level, replaces the old async "deep brief")
Final recommendation banner + grounded argument narrative that names the merit-vs-gate tension when
present; a decision-status tracker (Theo advisory -> Panel scoring -> Group decision -> Award); a
"case per supplier" For/Against card grid; "What happens next" (3 real steps, ending in a hand-off to
a contract-and-pricing negotiation project, with a read-only provenance block that carries the
decision forward); **Model the decision** - live category-weight sliders that re-rank all scored
suppliers in real time with a robustness verdict ("Leader flips" vs "still leads, robust to this
shift") (`rfxModelDecisionHTML`, 966-1008); a full **sensitivity analysis** with a weight-headroom
tornado chart and named flip points (`rfxSensitivityHTML`, 1038-1060, present but currently only
invoked implicitly via the model - confirm wiring, see Section 3); and **Theo-modeled alternatives**
(lowest-cost / dual-source resilience / diversity-strategic) each with a $ delta versus the
recommendation (`rfxScenariosHTML`, 1261-1273). Marc's decision explicitly CUT the old async
"deep response-analysis brief" job (`RFXJOB`/`rfxStartBrief`, retained in code but not called) because
"the Recommendation IS the brief" - correct call, this tab now does everything that job did, live and
grounded, without a spinner.

---

## 2. SKILL DASHBOARD (current)

Two skills cover this area: `rfp-response-analysis` (the response-analysis dashboard) and
`evaluation-engine` (the scoring/decision dashboard); `rfp-engine` and `rfp-case-manager` contribute
the requirements register and the Q&A/addendum + event-status pattern respectively.

### rfp-response-analysis: 6 LOCKED canonical tabs, every run, every category
`Executive Summary -> Supplier Deep Dive -> Coverage Heatmap -> Scoring & Pricing -> Risks &
Clarifications -> Award Recommendation` (dashboard-canonical.md, inlined in SKILL.md ~line 1801).
Locked skeleton across Mode A/B/C and every commodity; three labeled states (NEEDS_INPUT /
NOT_APPLICABLE / RESEARCH_PENDING) used instead of ever dropping or blanking a tab.

**Genuinely worth retaining (platform lacks these or has them shallower):**
- **Per-requirement `ReqStatusCell` with SOURCE CITATION.** The per-requirement detail table (Coverage
  Heatmap tab) carries Met/Partial/Not Met + confidence + a citation into the actual submission
  (page/section) behind every cell. The platform's per-requirement matrix (`rfxReqMatrixHTML`) shows a
  0-5 score and a MoSCoW chip and a confidence %, but never a citation into the source document. This
  is the clearest, most concrete content gap: a reviewer cannot currently see WHERE in a supplier's
  response a coverage judgment came from.
- **Inconsistency / Issues register**, distinct from red flags: submission-internal contradictions
  (e.g., claims SOC 2 in the executive summary, silent on it in the security questionnaire). The
  platform's `rfxFlags()` only derives flags from a low/missing score against a requirement; it has no
  concept of "the response contradicts itself."
- **Bid Leveling Gate status strip** (Scoring & Pricing tab opener): one card per vendor, Complete /
  Pending, derived from that vendor's modeled pricing fields, gating that vendor's price OUT of the
  weighted scoring and normalized comparison until leveled (never silently folded in as a zero). The
  platform has an equivalent "clean vs needed an assumption" badge on the Deal tab's normalization fold
  (`rfxNormZopaHTML`, "How Theo normalized these") but it is not surfaced on the RFx tab's own
  Commercial comparison table.
- **Normalized $/named-user/year list-price-vs-fully-loaded-TCO bar chart** (`normPricing()`), a
  different question from the platform's ZOPA band ("is this price within the negotiated range") -
  this answers "which vendor is cheapest overall, apples-to-apples, list vs total cost of ownership."
- **Supplier debrief email template** and CSV pipeline artifacts
  (`requirements_coverage_matrix.csv`, `bid_leveling_worksheet.csv`) for downstream handoff, a
  discipline the platform's reflect-only stance doesn't need to fully match but is worth noting exists.

**Weak / incoherent versus the platform:**
- Visual identity is the generic 26-skill "suite" look: dark charcoal (`#212121`) header with a red
  (`#E1251B`) rule, Georgia-serif titles and big numbers, Arial body, a non-green status palette built
  from Bold Blue (`#0F3A85`) / azure "POS" (`#1668B3`) / amber (`#B45309`). This is a shared,
  templated shell used identically across ALL 26 procurement skills (spend, contract-review,
  category-strategy, etc.) - it reads as "a report," not as a purpose-built RFx workspace. The
  platform's off-white/near-black/plum-accent system, by contrast, is specific to this app and reused
  identically across every tab in the SAME app, which is the correct place for a shared shell.
- Three tabs (Executive Summary ranking, Coverage Heatmap, Scoring & Pricing weighted matrix) all
  restate "who is winning" in a slightly different shape with no single narrative stitching them
  together - the platform's Field-roll-up + Assessment narrative pattern solves exactly this.
  The skill spec explicitly documents this as three separate tabs with no cross-linking narrative.
- Deep Dive profile opens with a flat KV-dump-shaped company overview in places (explicitly
  called out as an anti-pattern in the skill's own spec, "No key-value dump profiles"), whereas the
  platform's `rfxRptProfile` mixes narrative + facts grid + risk markers in one card.

### evaluation-engine: 6 LOCKED tabs, rendered via `visualize:show_widget`, not bespoke JSX
`Overview -> Scoring Detail -> Requirements Coverage -> Risk -> Sensitivity -> Award Scenario`
(SKILL.md ~line 631). Notably this skill does NOT emit a bespoke React artifact for its dashboard; it
builds a `supplier_evaluation_ui.json` data model and renders it through the suite's generic widget
primitive, with a Markdown/DOCX fallback if the widget host is unavailable. This is an architectural
difference (data-model-first, then a generic renderer) worth noting but not directly portable into a
bespoke React/HTML tab.

**Genuinely worth retaining:**
- **Supplier Participation & Scoring Roll-up** (Overview tab addition): a compact roster combining
  6 fixed RFx-process milestones (Agreed to Participate, CDA Signed, MSA with Lilly, Response
  Submitted, Demo Scheduled, Demo Completed) as GLYPHS (check / half-circle / flag / dash - never
  color alone) with a coverage mini-bar and a column-max-emphasized Grand Total. The platform's
  Overview has an Evaluation panel (internal reviewers) and Suppliers & contacts (bidder list), but
  nothing that tracks BIDDER PROCESS MILESTONES at a glance - this is a genuine, small, high-value gap.
- **Award Scenario: single-vs-split-award modeler.** An interactive allocation slider across 2+
  ELIGIBLE (Preferred/Competitive tier, no gate fail) suppliers that live-recomputes a blended Grand
  Total, blended coverage %, blended Year-1 cost and 3-year TCV, plus a vendor-count trade-off
  narrative and a Scenario Compare table against the single-award recommendation. It reuses the same
  `weighted_score()` kernel with allocation percentages as the weight set - "one more call to the same
  kernel, never a parallel scoring path." The platform's "Theo-modeled alternatives" has a static
  "Dual-source resilience" scenario CARD with a narrative and a one-shot $ delta, but no interactive
  blend-slider. This is a genuinely net-new capability, not a duplicate.
- **Numbers-reconcile assertion**: an explicit pre-render check that Grand Totals equal the sum of
  per-criterion weighted contributions and that effective weight fractions sum to 1.0 - a good,
  cheap correctness discipline worth adopting as an internal check (not a visible UI element).

**Weak / incoherent versus the platform:**
- Risk tab is a bare category x supplier severity heatmap (Low/Med/High text + color), materially
  shallower than what it's compared against here: the platform derives an actual per-supplier Risk
  Level (`rfxRiskLevel`) from real flags/gates, not a hand-authored severity table.
- Sensitivity tab is described only as "weight-perturbation matrix and the robustness verdict" - one
  paragraph in the spec - versus the platform's actual tornado chart with per-category weight-headroom
  bars and named flip points. The platform is deeper here already.
- Six fixed tabs for what is fundamentally one scoring decision forces "Requirements Coverage" and
  "Scoring Detail" into separate tabs that the platform correctly treats as one flattened page
  (Scoring subtab) with a fold-out reference.

### rfp-engine + rfp-case-manager (Q&A / addendum surfaces)
`rfp-engine`'s "RFP Q&A Consolidation" workflow is the actual source of an ADDENDUM concept absent
from both platform and the other skill's dashboard: when a supplier question yields a
requirement-changing or scope-negotiating answer, the skill authors a formal
`[RFP|RFI]_Addendum_[N].docx`, tracked in `qa_log.xlsx` with each row's affected `Req_ID`(s) and
`Addendum Reference`; `requirements_matrix.xlsx` carries a matching `Amendment_Ref` column, and
category weights are re-summed to 100% for any category an amendment touches. This is a DOCX/XLSX-level
artifact today, not represented as an interactive panel anywhere - a genuine gap on BOTH sides.

`rfp-case-manager`'s "Case Status Visual" Q&A Distribution panel (SKILL.md ~line 916-943) is a
richer take on the same idea the platform already has built (see Section 3): a stacked bar of
compiled/anonymized Q&A counts by category (Answered vs Pending) with a narrative, PLUS a
separate **Open Q&A table** (category, pending count, OLDEST-PENDING AGE, who it's routed to). The
platform's `rfxQaHTML` is a flat per-question list with a pill (no category roll-up chart, no
pending-age, no routed-to column).

---

## 3. NEWEST VERSION (the proposal)

### Reconcile first (before adding anything net-new)
Verified, concrete drift between the platform's two own surfaces:

1. **Vanilla (`pv-09-rfx.js`) has `rfxQaHTML()` fully built (compiled/anonymized Q&A list, category +
   answered/pending pill) but it is DEAD CODE - never called from `rfxAnalysisCrossHTML` or anywhere
   else in the file** (verified: `grep rfxQaHTML()` returns only its own definition).
2. **The React port (`RfxTab.tsx`) DOES wire it in** - Cross-Supplier there still uses an earlier,
   since-retired "lens tab" architecture (`Capability / Commercial / Risk & completeness / Q&A`
   segmented sub-nav, `XS_GROUPS`, line ~1102) that vanilla explicitly moved away from ("increment 3:
   Compare is one page ... no lens tabs"). So: React is stale on LAYOUT (still has lens tabs vanilla
   retired) but ahead on WIRING (Q&A actually renders there).
3. `rfxPhaseBannerHTML()` (the fuller phase-i-of-N + progress bar + outstanding-items-queue banner) is
   ALSO defined and never called in vanilla - appears intentionally superseded by the more compact
   `R.blocker`/`R.internalFlags` rows in `rfxEventStripHTML` (a comment marks the removal as deliberate,
   Marc's "#2"). Confirm this reading with Marc before deleting the function; if confirmed, delete it
   (dead code) rather than leave two banners half-alive.

**Action:** bring `rfxQaHTML`'s content into vanilla's flattened Cross-Supplier page (see below), verify
the React port is regenerated from the same vanilla source of truth afterward so the two stop drifting,
and either wire or delete `rfxPhaseBannerHTML`. This is pure integration debt, not a design decision -
cheapest, highest-confidence fix in this whole proposal.

### Proposed structure (concrete, buildable)

Keep the 4-subtab IA exactly as built. It is already the right shape and already beats both skill
dashboards on coherence. Changes are additive within it:

```
RFx tab
+-- Overview                                            [UNCHANGED, one addition]
|     - Event & status strip (left) / Evaluation panel + Suppliers & contacts (right)  [as-is]
|     - Suppliers & contacts: ADD a compact participation-glyph row per supplier
|       (Agreed / CDA / MSA / Response / Demo-set / Demo-done as check/half/flag/dash glyphs,
|        adapted from evaluation-engine's Participation Roll-up) - extra columns on the
|        existing contact rows, NOT a new panel.
|     - KPI tile row: ADD a 5th tile, "Q&A open" (N pending of M compiled), linking down to
|       the new Q&A section on Analysis > Cross-Supplier (see below).
|     - ONE merged ranking                                                        [as-is]
|
+-- Scoring                                              [UNCHANGED - protected win]
|     - nested category/sub-criteria weight editor, lock gate                    [as-is]
|     - My scores / Composite blind-then-reveal toggle                            [as-is]
|     - Panel calibration (inter-rater variance | team-vs-Theo), collapsible       [as-is]
|     - Requirements register reference (MoSCoW/acceptance/traceability/conf.)     [as-is]
|
+-- Analysis
|     +-- (i) Individual supplier                        [mostly unchanged, 2 additions]
|     |     - Response summary & profile / Requirements fit / Strengths-gaps-risks /
|     |       Commercial & operational / Clarifications                          [as-is]
|     |     - Requirements fit table: ADD a per-requirement drill-through modeled on
|     |       ReqStatusCell (Met/Partial/Not Met + confidence + a SOURCE CITATION -
|     |       page/section reference into the actual response document). This is the
|     |       single clearest content gap versus rfp-response-analysis: today a reviewer
|     |       sees a score, never WHERE it came from.
|     |     - Strengths, gaps & risks: ADD a small "Inconsistencies" card (submission-
|     |       internal contradictions, distinct from a low-score gap), same evidence-first
|     |       tone as the existing red-flags card.
|     |
|     +-- (ii) Cross-Supplier                            [1 new section, 1 enrichment]
|           - Field roll-up + The assessment narrative                            [as-is]
|           - Value & cost: value map + pricing table + insight card              [as-is]
|             ENRICH: surface the existing "clean vs needed an assumption" per-bidder
|             normalization badge (already built for the Deal tab's ZOPA fold) on THIS
|             tab's own Commercial comparison table too, so bid-leveling status is visible
|             without leaving the RFx tab.
|           - Capability: coverage heatmap + per-requirement fold + insight card    [as-is]
|           - NEW: "Q&A & Addenda" section (folds in the rewired rfxQaHTML content, enriched
|             per rfp-case-manager's pattern):
|               - a compact stacked bar of compiled Q&A by category (Answered / Pending)
|               - the existing per-question list, but ADD oldest-pending-age and a
|                 routed-to column (Legal / Technical / Commercial / Lead)
|               - a small "Addenda issued" table beneath it: Addendum #, date, Req_ID(s)
|                 amended, requirement-changing Y/N, category re-weighted Y/N - sourced
|                 from the same rfp-engine addendum-reconciliation concept
|                 (Req_ID <-> Amendment_Ref), currently absent from BOTH surfaces.
|
+-- Recommendation                                       [1 upgrade]
      - Final recommendation banner + argument + decision-status tracker            [as-is]
      - The case, per supplier (For/Against)                                       [as-is]
      - What happens next + read-only provenance to negotiation project             [as-is]
      - Model the decision (category-weight sliders, live re-rank)                  [as-is]
      - Sensitivity analysis (tornado + flip points) - CONFIRM this is actually
        reachable/visible in the shipped page (it is defined and looks wired via the
        Model panel; double check it renders, it is good work, don't let it go dark
        the way rfxQaHTML did)
      - Theo-modeled alternatives: UPGRADE the existing "Dual-source resilience" static
        card into evaluation-engine's interactive single-vs-split-award modeler - an
        allocation slider across eligible (conforming, gate-clear) suppliers, live
        blended Grand Total / coverage / Year-1 cost / 3-yr TCV, vendor-count trade-off
        narrative, and a Scenario Compare table against the single-award recommendation.
        Reuse the platform's own weighted-total kernel with allocation % as the weight
        set (mirrors evaluation-engine's "one more call to the same kernel" approach) -
        this is genuinely net-new, not a duplicate of "Model the decision" (which
        re-weights scoring CATEGORIES; this re-weights the AWARD across suppliers).
      - Export                                                                      [as-is]
```

### What NOT to import from the skill dashboards
- Do not adopt the 6-tab locked skeleton as a literal tab set; the platform's flattened,
  narrative-stitched Cross-Supplier page already communicates more per screen than three separate
  Executive Summary / Coverage Heatmap / Scoring & Pricing tabs would.
- Do not adopt the generic charcoal/red/Georgia-serif "suite" shell; it is intentionally
  shared across all 26 skills and is not meant to carry this app's identity.
- Do not resurrect the async "deep response-analysis brief" job UI; Marc's cut was correct and the
  Recommendation subtab already supersedes it live.

---

## 4. DESIGN NOTES

- **Palette base**: warm off-white background `--bg #FBFAF9`, near-black ink `--ink #1A1A1A`, plum
  accent `--plum #5C2B50` as the ONE "good/lead" colour, amber for caution, red (`#C8202E`) reserved
  for hard gate failures only - never decorative. No green anywhere in RFx. This is the opposite
  design decision from the skill dashboards' Lilly-red-header + non-green-but-still-colorful status
  palette; keep the platform's tighter 3-colour rule when building any new panel (participation
  glyphs, Q&A pills, Addenda table) - glyph SHAPE and pill LABEL carry status, colour is secondary.
- **Typography**: system sans (Arial/Helvetica stack) + a mono face for labels/pills/section eyebrows
  (uppercase, letter-spacing ~0.04-0.06em, 8-10px). No Georgia serif, no large "headline" numbers in
  the skill-dashboard style - KPI numbers stay compact (`rfxKpi` = 22px, not the skill's big serif
  Metric numbers). Keep this; it is a large part of why the platform reads denser and calmer.
  Body copy runs smaller and tighter (11-13px) than the skill dashboards' Arial body.
- **Card/panel styling**: `.card` = flat white/cream panel, 1px `--line2` hairline border
  (`#DCD8D2` light), NO drop shadow, no gradient fill except the raised `.card-hd` gradient band
  reserved for a handful of Deal-tab section headers (`rfxDealBand`). Do not add drop-shadowed or
  heavily gradiented cards for any new panel (participation row, Q&A/Addenda section, split-award
  modeler) - reuse `.card`, `.sect`/`.secthd`, `.mxwrap`/`.mx` table classes, and the existing pill
  mixins (`rfxSevPill`, `rfxPrioPill`, `rfxTprmPill`) rather than inventing new chip styles.
- **Heatmap/grid grammar**: every graded grid in the app (coverage heatmap, per-requirement matrix,
  scoring matrix) reuses the SAME Landscape-style rounded pill cell (`.hcell` + `pvHmRamp()`) on one
  blue ramp, leader-ringed. Any new coverage-adjacent visual (e.g., a per-requirement citation drill)
  should render inside this same cell language, not a new heatmap style.
- **Density/spacing**: tight gaps (8-14px), sections separated by dividers and small `.secthd` labels
  rather than nested cards-within-cards ("de-bubble" - matches the rest of the app's current design
  direction). New sections (Q&A & Addenda, participation glyphs, split-award modeler) should read as
  one more `.sect` in the existing rhythm, not a visually distinct "skill dashboard" insert.
- **Dark mode**: the whole token set has an additive `html[data-theme="dark"]` layer (see
  `theo-tokens.css` - plum, bg, ink, line2 all get dark-mode counterparts). Any new component must be
  built against the CSS variables (`var(--plum)`, `var(--bg)`, etc.), never hard-coded hex, so it
  inherits dark mode for free; verify with an actual screenshot in both themes, `getComputedStyle` on
  a `var()`-based background can misreport.
- **Brand marks**: black Lilly + Theo wordmarks and the `theo-dino-mark.png` asset
  (`assets/theo-dino-mark.png`) belong in app chrome (header/empty-states), not per-tab decoration.
  If the new Q&A/Addenda section or split-award modeler needs an empty state ("no compiled Q&A yet",
  "no addenda logged", "fewer than two eligible suppliers to model a split"), match the existing
  empty-state tone elsewhere in the app rather than inventing a new illustration.
- **What to avoid carrying over from the skill dashboards**: Georgia serif, the charcoal/red header
  band, azure "POS" as a status colour (reads as a second blue next to plum and would blur the
  3-colour rule), and glyph-less colour-only status (the skill spec itself flags this as an
  accessibility anti-pattern - the platform already avoids it, keep doing so for the new
  participation glyphs: shape + label, not colour alone).
