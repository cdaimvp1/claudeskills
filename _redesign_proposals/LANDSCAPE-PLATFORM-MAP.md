# Live Platform Landscape - structured map (source for the redesigned exemplar)

Sourced read-only from the platform repo (`lilly IT intake and orchestration tool`):
Marc's approved intent specs (`_audit_workspace/landscape-redesign-spec.md`,
`landscape-round3-spec.md`), the live render layer (`assets/pv/pv-07-landscape-render.js`),
the seed (`assets/seed/supplier-landscape.js`), and the merge proposal
(`_redesign_proposals/Landscape.md`, section 1). Nothing in the platform was modified.

The live Landscape is a **project-scoped tab** inside `project-view.html` (reached on the
nimbus demo project). It is **reflect-only / not a system of record**: one page-level bordered
banner states the advisory framing once; individual cards never repeat it. One data model
(`P.requirements` = 6 weighted categories each with 4-7 sub-requirements; `P.riskDimensions`;
`P.landscape[]` candidates carrying authored `subFit`/`riskSub`) is hydrated once and rolled up
(`pvRollup`) into category/dimension scores that **cannot drift** from the sub-scores because
they are computed, not separately authored. A restrained 3-hue status system (Bold Blue
positive, amber caution, red gap/risk - never green) sits on a neutral shade ladder; a 4th
orthogonal channel (`PVSUP_PAL`, 8 distinct hues) answers only "which supplier is this" across
ranking bars, plane dots, heatmap/risk column heads and the deep-dive masthead accent.

---

## Subtab bar: Executive Summary | Supplier Deep Dive | Requirements Heatmap | Risk Assessment
Underline text-tabs, always this order, no 5th tab. Head-to-Head and Market-Structure/HHI were
deliberately dropped (Head-to-Head folded into Exec Summary in the live build; HHI removed as
"not real market share"). This is a coherence win the exemplar preserves.

### 1. Executive Summary (`pvExecSummaryHtml`)
| Panel | Content / data | Functionality / interactivity | Organizational intent (why here) |
|---|---|---|---|
| Header + "Start an RFx" button | Subtab title; single action button top-right | Button opens the Start-an-RFx **drawer** (not a persistent picker) | The one forward action on the analytical page; the "so what do I do" exit. |
| KPI strip (4 tiles) | Vendors evaluated / total requirements across 6 categories / top weighted score / recommended lead | Static read | A 3-second read of field size and the headline before any detail. Sits at the very top (round-3 reorder). |
| Evaluation Summary (prose) | Narrative: the need, how the field narrowed, the full ranking stated in words | Read; no caption clutter (round-3 cut the "field size & ranking, in words" caption) | Analyst voice, not a table recitation - gives the numbers meaning. |
| Recommendation (left) + All-vendor ranking (right), side-by-side | Compact recommendation (top candidate + secondary + one-liner + suggested slate) beside a horizontal weighted-fit ranking bar (5-point decimals) | Ranking bar dots/rows tie to supplier identity colors; leader is emphasized | Pairs the verdict with the evidence for it in one glance (round-3 side-by-side layout). |
| Segmentation & what to do | Fit x risk quadrant plane (~half width) + a per-supplier actionable-insights narrative column to its right (its own scrollbar) | Click a dot -> rings it and refocuses the narrative to that vendor; **hover explainers** on quadrants and dots explain how to read the fit x risk plane; a bottom "Horizontal = weighted fit..." explainer is kept | Turns a scatter into guidance: who is leader/challenger/niche/caution and what to do about each. |
| Start-an-RFx drawer | Pre-checked recommended slate of 3-5; add-off-landscape free-entry row; suggested qualified incumbents; soft cap of 5 (warn, not block); "routes to sourcing rep for approval" reflect-only note | Opens from the button; on confirm seeds the RFx tab bidder set (a draft until the rep approves) | The concrete landscape -> RFx handoff, made interactive but strictly reflect-only. |

### 2. Supplier Deep Dive (`pvDeepDiveTabHtml`)
| Panel | Content / data | Functionality / interactivity | Organizational intent |
|---|---|---|---|
| Vendor dropdown | The 3 candidates | Selecting repaints the whole deep dive for that vendor | One vendor in focus at a time; keeps the page from being a wall of three profiles. |
| Nested sub-tabs (segmented pill) | Profile & Fit / Solution & Financials / Strengths & Risks / Requirements Analysis (round-3 folded the old Commercial & Ecosystem: clients+partners into Profile & Fit, contracting+regulatory into Strengths & Risks) | Segmented-pill control (tertiary nav, visually demoted below the underline tabs) | Progressive disclosure of a deep profile without a scroll marathon. |
| Profile & Fit | Overview narrative, why-Lilly, 8-field attributes grid, named clients & partners | Read | The "who are they and why do we care" masthead. |
| Solution & Financials | Solution/architecture paragraph, financial-health block (RESEARCH_PENDING where a private figure is undisclosed) | Read | Substance behind the fit score: what they actually sell and whether they will still exist. |
| Strengths & Risks | Strengths list; narrative risks (category + severity Low/Med/High + sentence); contracting + regulatory/GxP ledes | Read | The judgment layer: upside and the graded downside in one place. |
| Requirements Analysis | Per-category fit table for the selected vendor | **Expand a category on click -> its sub-requirements with scores + a short analysis**; consistent with the Heatmap drill-down (same authored rationale, not re-authored) | The per-vendor view of the same evidence the Heatmap shows across vendors. |

### 3. Requirements Heatmap (`pvHeatmapHtml`)
| Panel | Content / data | Functionality / interactivity | Organizational intent |
|---|---|---|---|
| 6-category x 3-vendor matrix | Category score per vendor; category header shows weight % + sub-req count; a weighted-average row | **Collapsed at category level by default; expand a category -> its scored sub-requirements**. Single blue ramp (darker = stronger fit, no green). Band legend navy >=4.25 / amber 3.50-4.24 / red <3.50 | "Scan everyone at once": columns = a vendor's shape, rows = who leads a category. |
| "Who leads which category" narrative | Prose read of the matrix | Read | Tells the reader what the grid means before they parse cells. |
| Click-vendor inline rationale | The selected vendor's per-category scoring rationale | **Click a vendor column -> rationale renders inline BELOW the matrix (no drawer); with a category expanded it goes to sub-requirement level** | Linked focus: the grid answers "who," the inline block answers "why," in place. |

### 4. Risk Assessment (`pvRiskHtml`)
| Panel | Content / data | Functionality / interactivity | Organizational intent |
|---|---|---|---|
| 5-dimension x 3-vendor matrix | Dimensions down the LEFT (rows), vendors across the TOP (columns) - matches the heatmap layout; single red/amber ramp, higher = worse, no green | **Expand a dimension -> its scored sub-factors**; contained/elevated framing spread into the cells/legend; flags rendered as icons + hover, not raw codes | Same mental model as the heatmap so the reader never relearns the layout; risk read as a shape per vendor. |
| Cross-cutting risk narrative | Prose synthesis of the risk landscape | Read | The "where is the field exposed together" read. |
| Click-vendor inline rationale | Why each risk dimension scored what it did for the selected vendor | **Click a vendor -> rationale inline below the matrix** (mirrors the Heatmap interaction line-for-line) | Linked focus again, identical pattern to subtab 3 - which is a large part of why the tab feels like one product. |

---

## How the exemplar merges platform IA with retained skill depth
The redesigned single-file exemplar keeps the platform's **4-subtab consolidated IA verbatim**
(Executive Summary / Supplier Deep Dive / Requirements Heatmap / Risk Assessment) and its
coherence contract (one computed data model, the 3+1 color system on a neutral shade ladder,
progressive disclosure, an identical row/column/expand/click-vendor pattern shared by the
Heatmap and Risk subtabs, one reflect-only voice). Onto that it ports the depth the standalone
skill dashboard held: every visualization is **paired with a substantive narrative insight**
(what it means / what to do, not a caption); the Deep Dive carries the skill's rich per-vendor
profile (overview, why-Lilly, 8-field attributes grid, solution + financial-health block,
strengths, graded narrative risks, contracting/regulatory ledes, named clients & partners); and
a **5-point decimal** scale with computed rollups replaces the skill's hand-authored flat
numbers so scores cannot drift. It drops exactly what Marc dropped (Head-to-Head, Market
Structure/HHI, the Data-Basis panel) and adopts the platform design system (Libre-Franklin-like
sans, Roboto-Mono-like numerals, off-white canvas + white surfaces, navy primary + teal
secondary + a burnt-orange standout ring on the recommended leader, Lilly Red scarce, no green,
full dark mode). The five reusable viz components (KPI tile, ranking bar, segmentation quadrant,
requirements heatmap, risk matrix) are the canonical shapes the platform wanted FROM the skills,
each built with narrative-pairing and linked-focus support so a click on any vendor - heatmap
column, risk column, ranking bar, or segmentation dot - refocuses the narrative to that vendor
in place.
