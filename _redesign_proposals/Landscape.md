
# Landscape area: platform vs skill dashboards, merge proposal

Scope: the project-scoped Landscape tab in project-view.html (ranking/quadrant, per-supplier
profiles, requirements-fit, risk, head-to-head) vs the supplier-landscape skill's canonical
5-tab dashboard, with the supplier-deep-dive skill's canonical structure pulled in for the
per-supplier-profile slice only.

Sources read for this proposal:
- Platform (read-only reference, not modified): `assets/pv/pv-07-landscape-render.js` (1570
  lines, full read - the live render layer and the ported PVSLE compute engine), `assets/pv/pv-02-landscape-data.js`,
  `platform/src/engines/supplier-landscape.ts`, `react-ui/src/tabs/LandscapeTab.tsx` +
  `landscapeEngine.ts` (React twin, same function names, treated as equivalent).
- Skill: `supplier-landscape-1c344a/SKILL.md` lines 1651-1945 (canonical dashboard spec,
  locked), `supplier-deep-dive-1c344a/SKILL.md` lines 422-514 (canonical dashboard spec,
  locked), `_dashboard_previews/supplier-landscape.html` and `supplier-deep-dive.html`
  (built preview artifacts, confirmed same 5-tab structure by string search).
- Prior in-repo audits (already exist under `_audit_workspace/`, written by an earlier pass
  on this same question - I read them, they materially inform this doc, and I flag where the
  platform has since moved past them): `dashboard-gap-assessment/02-Landscape.md`,
  `findings/supplier-landscape.md`, `landscape-deepdive-gap-analysis.md`,
  `landscape-deepdive-skill-review.md`, `landscape-gaps-placement-plan.md`,
  `landscape-redesign-spec.md`, `landscape-round3-spec.md`. These docs are READ-ONLY
  reference like the rest of the platform folder; nothing in them or in the platform was
  changed to produce this proposal.

IMPORTANT CONTEXT: the platform's Landscape tab is not an early build. It has already been
through four documented redesign passes (initial gap assessment -> `landscape-redesign-spec.md`
-> "round 2" refinements inlined in that same file -> `landscape-round3-spec.md` -> an
unlabeled "round 4" visible only in code comments, e.g. `PVSL_HM_INIT`, G1-G15 gap IDs wired
into `pv-07-landscape-render.js`). Most of what the earlier `_audit_workspace` gap docs called
"missing" has since been built. This proposal is therefore a delta on top of a mature surface,
not a green-field redesign, and it explicitly does not re-litigate decisions Marc already
locked (e.g., dropping SME-routing from the Landscape Deep Dive, folding Head-to-Head into
Executive Summary instead of a 6th/5th tab).

---

## 1. PLATFORM (what it does well)

### Structure
The Landscape tab has **4 subtabs**, always in this order: **Executive Summary -> Supplier
Deep Dive -> Requirements Heatmap -> Risk Assessment** (`pvSubtabsHtml()`, `pv-07-landscape-render.js:1032`).
There is no 5th "Head-to-Head" tab; competitive dynamics and an any-pair head-to-head compare
live inside Executive Summary (`pvDynamicsHtml()`), a deliberate merge, not an omission.

- **Executive Summary** (`pvExecSummaryHtml`): header + "Start an RFx" button -> a 4-tile
  metric strip (suppliers scanned, eligible after screen, requirements scored, leader gap) ->
  a two-column row of an **Evaluation Summary** narrative card (prose, not a table recitation)
  and a **Recommendation** table (rank, supplier, segment, composite, fit, risk; rank-1 row
  raised; a "shortlist to advance" band drawn at ~10% of the top composite) -> a merged
  **Segmentation & Differentiators** panel (fit-by-risk quadrant plane on the left with
  click-to-ring dots, a per-supplier differentiator accordion on the right showing "leads
  field / strongest category / watch item") -> **Competitive Dynamics & Head-to-Head**
  (a race-line clear-leader/close-race read, a picker for **any** two vendors, not just
  #1 vs #2, side-by-side pillar cards with HQ/financials/integration/contract facts, a
  centered per-requirement diverging "tornado" bar, and a key-tradeoff synthesis sentence).
- **Supplier Deep Dive** (`pvDeepDiveTabHtml`): a vendor dropdown, a **Competitive position**
  masthead colored in that vendor's own identity color (verdict badge, "why it's the leader" /
  "why it's screened out" heading + sentence, fit/risk stats, a leads-field/strongest/watch
  band), then **5 nested sub-tabs**: Profile, Market & Financials, Strengths & Risks, Lilly
  Fit, Requirements Fit. Requirements Fit deliberately **reuses the exact same multi-vendor
  heatmap renderer** as the standalone Heatmap subtab (`pvHeatmapHtml(refl,{inDeep:true})`) so
  a per-vendor requirements view is never a second, divergent table.
- **Requirements Heatmap** (`pvHeatmapHtml`): category x vendor grid, collapsible per category
  to sub-requirements, a weighted-average row, a single blue ramp legend (5-point fit scale,
  darker = stronger, no green), a "who leads which category" narrative, click-a-vendor
  rationale rendered inline below the table (reused text from the deep-dive profile, never
  re-authored), plus a **"Where the decision is made"** field-read card: differentiator
  categories (high score spread) vs parity categories (tied, low signal) vs the field's
  thinnest sub-requirement coverage (a market-gap read) vs a **must-have watch** list (a
  vendor trailing on a tagged must-have even at strong overall fit is a knockout risk).
- **Risk Assessment** (`pvRiskHtml`): mirrors the heatmap's exact layout (dimensions as rows,
  vendors as columns this time), same collapse/click-vendor/inline-rationale interaction,
  single red ramp (light to deep, no green), contained/elevated framing, ESG & regulatory
  posture folded in as a genuinely **scored** dimension (`PVSL_ESG`), not free text.
- **Start an RFx**: a drawer (not a persistent picker), pre-checks the recommended slate, lets
  the user add off-landscape suppliers or pull in a suggested qualified incumbent, soft-caps
  at 5, and routes the draft to the sourcing rep for approval; on approval it seeds the RFx
  tab's bidder set. This is the landscape-to-RFx handoff made concrete and interactive.

### Why it reads as coherent
1. **One data model feeds every view.** `P.requirements` (6 weighted categories, each with
   4-7 sub-requirements), `P.riskDimensions`, and `P.landscape[]` candidates (with authored
   `subFit`/`riskSub`) are hydrated once (`pvHydrate`) into category/dimension rollups
   (`pvRollup`) that **cannot drift** from the sub-scores, because they are computed, not
   separately authored. The same `PVSL_INPUT` feeds the Overview mini-card, all 4 subtabs,
   and the RFx handoff.
2. **A restrained, purposeful 3-hue system** sits on a neutral surface: Bold Blue `#0F3A85`
   for strength/positive, amber for caution/adequate, red for gap/risk/hard-flag - never
   green. A 4th, orthogonal channel (`PVSUP_PAL`, 8 distinct hues e.g. `#123C82` navy,
   `#2F6E6B` teal, `#7A2436` maroon, `#6A4C93` violet) is used **only** to answer "which
   supplier is this," consistently across ranking bars, plane dots, heatmap/risk column
   headers, and the deep-dive masthead accent (`--ddacc`). Status-meaning color and
   identity color are never mixed.
3. **One reflect-only voice.** A single bordered banner states the reflect-only framing once;
   individual cards do not repeat a disclaimer per card (an explicit round-4 cleanup, "the
   per-card advisory note is dropped... the page-level badge carries it").
4. **Progressive disclosure everywhere.** Categories/dimensions collapse to a headline score
   and expand to sub-rows on a caret click; a vendor's rationale expands further on a second
   click. Density stays high without becoming a wall of prose.
5. **Identical shape across siblings.** The Heatmap and Risk subtabs share the same
   row/column/expand/rationale-drawer pattern almost line for line. A user's mental model
   transfers instantly between them, which is a large part of why the tab feels like one
   product rather than four bolted-together views.

---

## 2. SKILL DASHBOARD (current)

### Structure (both skills, canonical and LOCKED per their SKILL.md)
**supplier-landscape** produces a single self-contained JSX dashboard with **5 tabs, always
in this order, every run, every mode, every category**: Executive Summary, Supplier Deep
Dive, Requirements Heatmap, Risk Assessment, **Head-to-Head** (its own tab, not folded into
Exec Summary). It is the interactive companion to a up-to-30-page DOCX report and is built
under a strict determinism guarantee: same skeleton always, content varies but structure
never does, every tab filled to the same depth through research (never blank), and 3 labeled
states used instead of omission: `NEEDS_INPUT`, `NOT APPLICABLE`, `RESEARCH PENDING`.

**supplier-deep-dive** (a separate, any-stage, single-supplier skill) produces its own
5-tab dashboard: Identity, Capability, Market & Financials, Risk, Lilly Fit, plus a pinned
Recommendation strip. Its Lilly Fit tab additionally carries a rich **Relationship**
sub-section (a 5-tile communication KPI strip, channel/direction/topic/sentiment rollups, a
governance-flags panel, a reverse-chronological comms timeline, and a live FY spend-forecast
slider).

### Genuinely worth retaining (platform lacks it, or has it thinner, or has since dropped it)
1. **`EXCLUDED[]` pre-scoring audit trail with a fixed 5-code taxonomy**
   (`FAILED_DISQUALIFIER`, `OUT_OF_SCOPE`, `INSUFFICIENT_EVIDENCE`, `DUPLICATE`,
   `BUYER_EXCLUDED`). The platform only shows post-scoring hard-flag eliminations (a vendor
   that was scored, then disqualified). It has nothing for "we researched this vendor and it
   never even became a scored candidate" - a real, defensible piece of the shortlist story
   the skill's report format forces but the dashboard has quietly lost.
2. **`DATA_BASIS` coverage chips at the point of recommendation.** The platform actually
   *built* this exact idea (`pvDataBasisHtml()`, fit/risk coverage %, NEEDS_INPUT-style gap
   flags) but it is **dead code** - grepping the file confirms it is defined and never
   called from `landscapeHTML()` after the round-3/4 cuts. This is a regression to repair,
   not a new feature to design.
3. **Interactive segmentation-threshold sliders.** The skill's Fit x Risk plane ships with
   two live sliders that reclassify every vendor as you drag them. The platform's plane reads
   `fitHigh`/`riskHigh` from `P.segmentation` but has no in-tab control to move them; the
   cutoff is fixed per project.
4. **A 3-way evidence-marker vocabulary** (`"Information Not Provided"` supplier didn't
   disclose vs `"Not Publicly Disclosed"` confidential/proprietary vs `"Not Determined"`
   research couldn't confirm) versus the platform's single, flatter `"Data not available"`
   used everywhere a figure is missing. Cheap to add, meaningfully more honest.
5. **All-vendor data-parity rule as an explicit, named rule** ("if a vendor was evaluated,
   it appears everywhere, no separate condensed array that only shows in Exec Summary"). The
   platform already follows this in practice (one `L.assessments` array drives every subtab)
   but it is worth stating as an explicit invariant so it survives future edits.
6. Market Context / Porter's Five Forces schema (`porter_forces`, `market_size` with
   source+confidence, `pricing_trend`, `key_trends[]`, `key_risks[]`) - genuinely valuable,
   but Marc's own `landscape-gaps-placement-plan.md` already routed this correctly to
   **Category Strategy** (which already has Kraljic + real spend-based HHI), not to the
   project Landscape tab. Listed here only to confirm the routing still holds; it is not a
   Landscape gap.

### What's weak or incoherent vs the platform
- **No structural drift guarantee.** The skill authors each vendor's `os`/`fitScore` by hand
  in a flat array and relies on a manual "numbers-reconcile assertion" (a note telling the
  author to check their own arithmetic). The platform's numbers are *computed* from
  `subFit`/`riskSub` and cannot drift by construction. This is a real, not cosmetic,
  reliability gap in the skill's approach.
- **Every deep-dive is a flat single-vendor page.** No persistent per-supplier accent color,
  no masthead synthesis of "why it leads / why it's screened out" - it is a key-value-plus-
  prose dump rather than the platform's competitive-position framing.
- **Heatmap and Risk each hand-roll their own table**, so the two views do not share a
  component or an interaction pattern the way the platform's do; a reader has to relearn the
  layout between them.
- **No shortlist-to-RFx handoff UI.** The recommendation ends at a `next_action` string
  (RFP / Pilot / Direct Negotiation / Re-scope / Eliminate Category) with no drawer, no
  picker, no routed-for-approval flow. The platform's Start-an-RFx is strictly ahead here.
- **No progressive disclosure.** A report rendered into tabs means every section is fully
  expanded prose-plus-tables; on a document that is correct, on a dashboard it reads as
  denser and more fatiguing than the platform's collapsed-by-default categories.
- **Head-to-Head as a standalone 5th tab** duplicates most of what the Requirements Heatmap
  already shows for two vendors at a time; the platform's decision to fold it into Executive
  Summary (an owner decision, not an oversight) reads as the more coherent call and should
  not be reversed.

### supplier-deep-dive's canonical structure, scoped correctly
The rich Identity/Capability/Market&Financials/Risk/LillyFit structure (plus the
Relationship sub-section: comms KPIs, timeline, governance flags, spend-forecast slider) is
the **any-stage, single-supplier** skill, not the pre-RFP no-contact market scan. Marc's own
locked correction in `landscape-deepdive-skill-review.md` (section 5, item 2) already settled
this: SME-routing and relationship/communications machinery belong downstream (RFx,
onboarding, My Work / Supplier 360), never on the Landscape tab, which is explicitly a
no-contact scan. The platform's Landscape > Supplier Deep Dive subtab is *correctly* scoped
down from that canonical structure, not incompletely built. Two narrower pieces are still
worth pulling forward, listed in section 3 below (a scored offerings-to-need table, and the
evidence-marker vocabulary); the Relationship sub-section is out of scope for this tab by
design and belongs to whatever surface owns Supplier 360 (a separate area).

---

## 3. NEWEST VERSION (the proposal)

Keep the platform's 4-subtab structure exactly as it is; it already exceeds the skill's
5-tab version on every axis except the six items in section 2. This is a **targeted merge**,
not a rebuild. Outline below is concrete enough to build from directly against
`pv-07-landscape-render.js`.

```
Landscape tab (project-scoped)
+-- Subtab bar: Executive Summary | Supplier Deep Dive | Requirements Heatmap | Risk Assessment
|  (KEEP exactly as-is; do not add a 5th Head-to-Head tab - the fold-in is a coherence win)
|
+-- 1. EXECUTIVE SUMMARY  (amend)
|  +-- Header + "Start an RFx" button                                   KEEP
|  +-- Metric strip (4 tiles)                                           KEEP
|  +-- Evaluation Summary (prose) | Recommendation (ranked table)       KEEP
|  |    + NEW: one-line "N researched, ruled out before scoring"
|  |      sourced from P.excludedVendors[] (5-code taxonomy: FAILED_
|  |      DISQUALIFIER / OUT_OF_SCOPE / INSUFFICIENT_EVIDENCE /
|  |      DUPLICATE / BUYER_EXCLUDED), rendered under the Recommendation
|  |      table, distinct from the existing post-scoring hard-flag list
|  |    + NEW: restore pvDataBasisHtml's coverage math as a single
|  |      FOOTNOTE line (not a card) under the Recommendation table,
|  |      shown ONLY when fit or risk coverage is < 100% - re-point the
|  |      already-built dead function instead of writing a new one
|  +-- Segmentation & Differentiators (plane + accordion)               KEEP layout
|  |    + NEW: two small inline range inputs above the plane
|  |      (fit-cut, risk-cut) that live-redraw the quadrant divider and
|  |      re-tile the segment counts on drag - ports the skill's
|  |      "sliders reclassify every vendor" interaction onto the
|  |      platform's already-superior merged layout
|  `-- Competitive Dynamics & Head-to-Head                              KEEP as-is
|       (already exceeds the skill's standalone tab: any-pair picker,
|        pillar cards, tornado chart, tradeoff synthesis)
|
+-- 2. SUPPLIER DEEP DIVE  (amend)
|  +-- Vendor dropdown + Competitive-position masthead                  KEEP
|  +-- Profile
|  |    + NEW: upgrade "Offering profile" from a flat name/note table
|  |      to a scored offerings-to-need table (offering | maps-to-need |
|  |      fit 0-5, reusing the existing pvHmRamp/ScoreCell coloring) -
|  |      matches supplier-deep-dive skill's Capability section, no new
|  |      visual language required
|  +-- Market & Financials
|  |    + NEW: adopt the 3-way evidence-marker vocabulary (Not
|  |      disclosed / Not publicly disclosed / Not determined) via one
|  |      small evidenceLabel(kind) helper, replacing the single "Data
|  |      not available" string used everywhere a figure is missing
|  +-- Strengths & Risks                                                KEEP
|  +-- Lilly Fit                                                        KEEP
|  |    (relationship-status pill / capability-fit rating / strategic
|  |     fit / pharma-gate SIGNAL, never SME-routing - correct as built)
|  `-- Requirements Fit (reuses the multi-vendor heatmap)                KEEP
|       (do NOT rebuild a single-vendor requirements table - the owner
|        correction that consolidated these two views was right)
|
+-- 3. REQUIREMENTS HEATMAP                                              KEEP, no changes
|  (collapsible sub-requirements, leaders narrative, click-vendor
|   rationale, "Where the decision is made" differentiator/parity/
|   thin-coverage/must-have-watch read - this is the strongest subtab
|   on either side of the comparison; treat it as the reference pattern
|   for any future panel, not a target for edits)
|
`-- 4. RISK ASSESSMENT  (amend, small)
   +-- Dimension x vendor grid, expandable sub-factors, click-vendor
   |  rationale, ESG folded in as a scored dimension                   KEEP
   `-- + NEW: add "Legal & Regulatory" as its own scored risk dimension
        alongside the existing set (mirrors supplier-deep-dive's
        canonical 6-dimension risk taxonomy: Operational / Financial /
        Cyber / Geopolitical / Legal & Regulatory / ESG) - today
        "Regulatory / GxP" is prose folded into the Deep Dive's
        Strengths & Risks sub-tab, not a scored Risk Assessment
        dimension; aligning the two closes a naming/coverage gap
        between the two views of the same supplier

Structural / net-new (not tied to one subtab):
- Extend the seed data so at least one more demo project (not only
  "nimbus") carries the deepened model (P.requirements/P.riskDimensions/
  P.landscape[].subFit) - today every other demo project falls back to
  landscapeThinHTML()'s flat cards, which is the FIRST thing most
  reviewers see and understates how deep the real surface is.
- Start-an-RFx drawer                                                  KEEP as-is
  (already ahead of the skill, which stops at a next_action string)
```

### Files a builder would touch
- `assets/pv/pv-07-landscape-render.js` - all render logic + the ported `PVSLE` engine; every
  item above lands here.
- `assets/pv/pv-02-landscape-data.js` - project data model; add `P.excludedVendors[]` here,
  matching the skill's `excluded_vendors.csv` shape (`vendor_name`, `reason_code`,
  `reason_detail`, `source`, `date`).
- `platform/src/engines/supplier-landscape.ts` - the source-of-truth TS engine `PVSLE` mirrors;
  if `excludedVendors` or adjustable segmentation thresholds are added, keep both in sync (this
  is a documented pattern already, e.g. `pvLandInput()` deliberately mirrors the TS engine's
  input shape).
- `react-ui/src/tabs/LandscapeTab.tsx` + `landscapeEngine.ts` - the React port; same additions
  need to land there too to avoid the two surfaces drifting apart again.
- `supplier-landscape-1c344a/SKILL.md` (lines 1651+) - if the skill itself is ever asked to
  emit an excluded-vendor list or evidence-marker vocabulary that the platform can ingest, that
  schema already exists there (`excluded_vendors.csv`, the 3 evidence markers in
  "Output Schemas") - no new schema invention needed, just wire an ingestion path.

### Why this is the newest/best version
It keeps every element that makes the platform read as one coherent product (one data model,
the 3+1 color system, progressive disclosure, four subtabs with an identical shape), while
closing the six concrete, non-duplicative gaps the skill dashboards still hold value on: a
pre-scoring exclusion audit trail, a restored data-basis footnote, adjustable segmentation
thresholds, a richer evidence-marker vocabulary, a scored offerings-to-need table, and a sixth
named risk dimension. Nothing here proposes a new tab, a new layout paradigm, or reversing an
owner decision already on record.

---

## 4. DESIGN NOTES

- **Palette / 3-colour rule.** Bold Blue `#0F3A85` = positive / strong / section emphasis.
  Amber (`var(--amber-d)` / `#B45309` family) = caution / adequate. Lilly Red `#E1251B` =
  negative / gap / hard-flag / brand rule. **Never green** - this is a hard rule stated
  independently in both the platform CSS and every skill SKILL.md; it is one of the few things
  both sides already agree on verbatim. Surfaces are off-white/cream in light mode and neutral
  (not bluish) near-black in dark mode, per the shipped dark-mode work; body ink is Lilly
  Charcoal `#212121`.
- **Vendor-identity colour is a 4th, orthogonal channel.** `PVSUP_PAL` (8 distinct hues:
  navy `#123C82`, teal `#2F6E6B`, maroon `#7A2436`, violet `#6A4C93`, plum `#5C2B50`, mustard
  `#8A5A00`, deep teal `#3E7C6A`, wine `#8A3A6E`) answers "which supplier is this" only -
  ranking bars, plane dots, heatmap/risk column headers, the deep-dive masthead accent
  (`--ddacc`). Never mix this palette's meaning with the status 3-colour system above; any new
  panel (e.g. the exclusion-audit line, the offerings-to-need table) should pick colors from
  the correct one of these two systems, never invent a third.
- **Typography.** Georgia serif for card titles and large numeric values (KPI figures, scores);
  a sans body face (Libre Franklin per the round-3 note) for prose and labels; mono, uppercase,
  letter-spaced text for small eyebrows and metadata labels (category weight tags, the
  "REQUIREMENTS SCORED" style metric labels). This three-way split is already consistent across
  every existing panel in `pv-07-landscape-render.js` (`var(--sans)`, `var(--mono)`) - match it
  exactly in any new copy.
- **Wordmarks.** The black Lilly wordmark and the black Theo wordmark live in the shared
  project-view.html app chrome (header), not inside the Landscape tab body itself. Nothing
  proposed here touches or duplicates that chrome; the tab content inherits it.
  `assets/theo-dino-mark.png` is the Theo assistant identity (the header ambient-chat button
  and the docked project-chat panel). If any new panel in this proposal ever surfaces a
  Theo-authored suggestion inline (for example, a nudge to widen a thin candidate field), it
  must use that same dino avatar and a single consistent name color, per the already-fixed
  "one Theo identity everywhere" rule (`landscape-round3-spec.md`, items F/G) - no bespoke "AI"
  badge, no second avatar.
- **Card and panel styling.** Every panel is a `.sa-card`: a `.card-hd` row (a 16-24px stroke
  SVG icon in `currentColor`, a `.ct` title, an optional right-aligned `.cs` meta string) above
  a `.scc-b` body. Reuse this exact header pattern for anything new (the restored data-basis
  line should be a **footnote inside an existing card**, not a new `.sa-card` - avoid the
  "card-itis" the skill's report-derived layout falls into, where every subsection becomes its
  own boxed panel).
- **Density and disclosure.** A caret button (`.catbtn`/`.catcaret`) collapses a
  category/dimension row to a single score and expands it to sub-rows on click; a second click
  expands a vendor's authored rationale below the table. Single-hue ramps (blue for fit,
  red for risk) run light-to-dark with the legend inline, not as a separate key card. Keep this
  pattern for the new "Legal & Regulatory" dimension row and for the scored offerings-to-need
  table.
- **Reflect-only voice.** One bordered banner (icon + bold "Reflect-only" + one sentence) opens
  the tab; individual cards do not repeat the disclaimer. Any new copy (exclusion reasons,
  evidence markers, slider captions) should read as a plain data label, not a second caveat.
- **No em dashes anywhere**, in code-adjacent copy or narrative prose - a suite-wide hard rule
  confirmed independently in the platform's own round-3 spec and in both skills' SKILL.md files.
  Applies to every new string this proposal adds.
