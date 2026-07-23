# Landscape Top-Level Tabs — Redesign Spec v3 (Marc's 2nd analysis, 2026-07-23)
Companion to DEEP-DIVE-REDESIGN-SPEC-v3.md. Same spine: standardized scoring + evidence/confidence layer +
disposition vocabulary + gates-override-average + one-job-per-tab + visual-first. Marc's direction at the end
of the analysis OVERRIDES the analysis's first-pass "substantially simplify Overview" recommendation.

## New top-level structure (Marc-confirmed)
**Overview → Requirements Heatmap → Head-to-Head → Risk Assessment → Supplier Deep Dive**
Each tab's single job:
- Overview: what should the team do?
- Requirements Heatmap: which supplier meets the need best?
- Head-to-Head: what's the difference between any two suppliers?
- Risk Assessment: what could prevent successful performance?
- Supplier Deep Dive: what do we know about ONE supplier? (see v3 spec)

## SHARED cross-tab standards (build once, applied everywhere)
- **Fit**: ONE scale visible (whole-number % OR 1-decimal /5 — not both at once). No 2-decimal qualitative scores.
- **Risk**: semantic level (Low / Moderate / High / Critical / Unknown) + a SEPARATE confidence marker. 1-decimal
  only where the model is defined enough to warrant it.
- **Evidence status** per material field: Verified / Partial / Supplier-asserted / Proxy / Missing (+ Not-found,
  Not-applicable). "No issue found" is NOT "not enough information."
- **Recommendation disposition** (one vocabulary everywhere): Advance / Advance with conditions / Hold as
  alternate / Do not advance / Screened out. Keep quadrant labels (Leader/Challenger) SEPARATE from disposition.
- **Gates override the aggregate** — a hard-stop or a critical single risk is never averaged away.
- **Composite score demoted** from the visible surface; dimensions + confidence lead.

## Overview — KEEP IT (Marc likes it). Only 3 limited changes.
Retain: KPI cards · evaluation summary · ranked recommendation table · fit-vs-risk quadrant · candidate
segmentation · excluded-supplier callout · overall recommendation & sourcing strategy.
1. **Fix supplier-count confusion**: today mixes ranked (7) and screened-out (2) so it reads like 9. Show:
   Suppliers reviewed 9 · Passed screen 7 · Screened out 2 · Recommended for RFx 4.
2. **Standardize visible scores** (stop showing 90 / 89.37 / 4.51 / 60.77 / 61 side by side): Fit 89 · Risk
   Low-moderate · 1.6 · Composite 61 · category score 4.8 · Strong. Keep precision internal, display consistently.
3. **Move Head-to-Head OUT** to its own tab; leave a compact compare teaser / launch control on Overview.
   Also: clarify disposition labels (separate from quadrant), and tighten narrative that just restates the table.
Note the segmentation issue for later: 6/7 land in "Leader" -> thresholds aren't separating the field (a tuning
item, not a redesign; flag, don't silently leave).

## Head-to-Head — restore as its own tab (detailed layout)
1. Two prominent supplier SELECTORS (compare any two eligible).
2. **Comparison summary strip** (fit · risk · requirements met · partial · must-have gaps · evidence confidence)
   with a center "current advantage: X by N" AND whether that gap is meaningful or effectively a tie.
3. **Category delta bars** (the best visual in the file — keep): both scores + difference + category importance +
   evidence confidence per row.
4. **Requirements difference heatmap**: only requirements where the two differ meaningfully; controls: show all /
   differences / must-haves / unknowns / low-confidence.
5. **Risk difference panel** (side-by-side per risk dimension) — two similar totals can hide very different profiles.
6. **Evidence-confidence comparison** (segmented bar per supplier) — stops a more-inferred supplier from looking
   equally certain.
7. **Commercial-model comparison** (cost-driver matrix, NOT a fabricated TCO).
8. **Decision conclusion card** + remaining validation actions as CHIPS (not paragraphs).

## Requirements Heatmap — KEEP + IMPROVE (not rebuild)
Keep: cross-supplier heatmap · category->subrequirement expansion · knockout matrix · supplier rationale (as
evidence, not prose).
Fix:
- **Kill 2-decimal precision** -> 1-decimal + semantic (4.5 · Strong / 3.7 · Partial / 2.2 · Gap / Unknown).
- **Two visual channels per cell**: requirement status AND evidence confidence (solid=verified · hatched=asserted/
  partial · outline=proxy/inference · gray-? =unknown · red-outline=must-have gap).
- **Rename mislabeled "coverage"**: "coverage 100% (5/5 >=3.5)" is a PASS RATE, not evidence coverage — rename to
  "Requirements meeting threshold"; add a separate real evidence-coverage measure.
- **Leadership strip** (compact per-category leader row) REPLACES the leadership prose paragraph.
- **Decision leverage = importance x differentiation x confidence** (not score-spread alone) for "where the
  decision is made" bars.
- **Evidence panel** on cell/row select (requirement · status · score · evidence · source · confidence · Lilly
  relevance · validation question · last verified) REPLACES the long generated rationale narrative.
- Top controls/filters: must-haves only · gaps only · unknowns only · decision drivers · all; sort by rank/score/
  confidence. Disposition summary (Strong/Meets N · Partial N · Gap N · Unknown N). Move knockout matrix up.

## Risk Assessment — MAJOR REBUILD
Keep the bones: cross-supplier risk heatmap · subfactor drilldown · material-event data.
New **risk taxonomy** (rows), replacing the mixed dimensions:
Financial viability · Operational continuity · Cyber & privacy · Legal/sanctions/integrity · Quality & regulatory
· Geographic & concentration · Commercial & exit exposure · Responsible sourcing.
Also distinguish risk TYPE (drives response): supplier-inherent · solution/design · commercial · diligence-unknown
· Lilly-specific exposure.
Fixes:
- Cells: semantic Low/Moderate/High/Critical/Unknown + SEPARATE confidence marker. No 2-decimal false precision.
- **Gates + critical single risks override the weighted average** (6/7 "Contained" today = averaging hides material
  risk).
- **Classify every event by directness**: directly-affects-service · affects-division · parent-company-context ·
  indirect/weak. Don't give parent-corp noise (Amazon Prime dark-patterns, layoffs) equal weight for Redshift.
- **"No material event found" != "confirmed low risk"** — counter public-visibility bias (big public cos look
  riskier; small private cos look "clean" only because less is known).
- **ESG/unassessed dims -> assessment-coverage section**, NOT a scored dash row sitting beside real scores.
- Replace the cross-cutting PROSE with: **portfolio summary** (critical/high counts · unresolved gates · most-common
  exposure · least-assessed dim · highest-confidence dim), **dominant heatmap**, **selected-supplier top-material-
  risks table** (risk · severity · confidence · relevance · mitigation), **risk disposition** (accept / mitigate-in-
  arch / mitigate-contractually / evidence-required / escalate / hard-stop), **event TIMELINE** (cards: date ·
  event · severity · directness · resolution · source confidence; filters: direct/operational/cyber/regulatory/
  financial/parent-context/resolved) with prose in a drawer, and a **mitigation board** (risk · action · owner ·
  gate? · status) that converts risk into work.
- Fix the broken layout (long right-hand event wall beside an empty left side).

## Dedicated COMPARE interaction
Head-to-Head is the home; also a persistent "Compare suppliers" control. (Covered by the Head-to-Head tab.)

## Preserve / Rebuild / Remove (Marc's explicit lists)
PRESERVE: exec fit-risk quadrant · recommendation standings · head-to-head delta bars · requirements heatmap ·
expandable categories · knockout matrix · risk heatmap · risk subfactor drilldowns · material-event data.
REBUILD: Overview hierarchy (light) · score definitions/consistency · evidence confidence · requirements rationale
panel · risk taxonomy · selected-supplier risk presentation · material-event timeline · risk mitigation workflow.
REMOVE/RELOCATE: long evaluation prose · repeated candidate list beside quadrant · 2-decimal qualitative scores ·
full head-to-head from default Overview · category-leadership prose · giant rationale blocks · irrelevant parent-
company event lists · empty ESG scored row · repeated "reflect-only" disclaimers.

## Build note
This shares the deep-dive spine. Foundation (scoring/evidence/disposition/gate standards + grounded data reshape)
comes first; then tabs are built on it. All vanilla JS/SVG/CSS, self-contained, grounded (no fabrication; explicit
status for every gap). Top-level tabs currently WORK off the old fields — reshape carefully so nothing regresses.
