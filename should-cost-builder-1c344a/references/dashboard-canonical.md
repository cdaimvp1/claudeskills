# Should-Cost Builder Dashboard: Canonical Structure v1.0 (LOCKED)

This spec is mandatory. Every should-cost dashboard this skill produces, for every deal, category,
or commodity, follows this exact structure. Only the data changes per run. The reference
implementation is `examples/should_cost_canonical_dashboard.jsx`. Clone its structure, swap the data.

This is the first locked version of this skill's dashboard skeleton (the skill previously described
only an "optional dashboard (Magazine house style)" with no fixed tab set). It is built directly from
content this skill's workflow already requires (the Aggregation Method, the Gap Method, the Bracket
Reconciliation, and the Cost-Driver Assumption Ledger), plus two additions approved in the 2026-07
suite review:

- **Sensitivity tab (tornado, driver +/-15% impact).** The per-driver base/spread/confidence array the
  Aggregation Method already computes for `quadrature_rollup()` is reused, unchanged, to answer a
  second question the workflow already names as required ("identify the cost drivers with the most
  leverage," Workflow Step 4) but never rendered visually: a uniform +/-15% stress test per driver,
  ranked by dollar swing on Total_base. No new judgment call, no new research; a deterministic
  re-projection of numbers already validated for the roll-up.
- **Savings Pipeline + Category Scorecard (Gap & Savings Pipeline tab).** The Gap Method's driver
  attribution (Workflow Step 4: "decompose the gap onto the components so the rep can see WHERE the
  over-ask sits") already produces a dollar attribution per driver; this renders that attribution as a
  sorted, confidence-flagged pipeline table (never a bare point estimate, per Rule 4) plus a compact
  scorecard summarizing confidence coverage, reconciliation status, and research-freshness at a glance.

A third candidate from the same review, a "savings model with live lever toggles," was explicitly
**excluded**: it sits outside this skill's own stated BOUNDARY ("this skill is BOTTOMS-UP cost
construction only... full negotiation-brief assembly belongs to commercial-negotiation-prep") and
belongs to commercial-negotiation-prep, which already consumes this skill's assumption ledger as its
cost anchor. Building it here would duplicate a downstream skill's deliverable rather than serve this
one.

## The determinism guarantee

1. **Same skeleton, always.** Six tabs, in the fixed order (Overview, Cost Stack, Sensitivity, Gap
   & Savings Pipeline, Bracket Reconciliation, Assumption Ledger), appear on every run for every
   should-cost model. Header, footer, tab nav, color tokens, typography, and reusable components are
   identical run to run.
2. **Content varies, structure does not.** A services rate-card model and a hardware BOM teardown
   populate the same tabs. A tab that is less applicable (no supplier price given; no market-rate
   benchmark available) shows a labeled state (NEEDS_INPUT, NOT_APPLICABLE, or RESEARCH_PENDING),
   never a blank.
3. **Numbers reconcile by construction.** The dashboard's data model computes Total_base as the visible
   sum of component bases and Total_low/Total_high via the SAME `quadrature_rollup()` logic vendored in
   `numeric_kernel.py` (mirrored in JS, not hand-typed), including the >15%-of-base LOW-confidence
   widening rule and the naive worst-case envelope carried only as a footnote bound. The Gap Method's
   driver attribution is a plug decomposition of the visible gap dollar amount, so the attributed rows
   always sum to the gap exactly. The Sensitivity tornado re-projects the SAME component bases already
   in the data model; it does not introduce a second set of numbers.
4. **Reconciliation line is always shown.** The Pre-Delivery Self-Test line (SKILL.md) is rendered as a
   visible callout on the Overview tab, not just computed silently.

## Color tokens (do not change)

R `#E1251B` (Lilly Red), DK `#212121` (Lilly Black), BRN `#521207` (Bold Brown), CARD/BD `#E4EBF1`
(Neutral Stone), WARM `#FFF0D8` (Neutral Cream), RISK `#FDE8E5` (Neutral Rose), OK `#D4E5F7` (Neutral
Sky, positive background tint), MUT/LT `#8A969E` (Bold Grey), BLU `#0F3A85` (Bold Blue, the on-brand
positive/good/passing signal), AMB `#B45309` (Amber). Chart palette (exactly 6, verbatim from
`dashboard-components.md`): `[R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"]`. No green or teal anywhere,
per the lilly-brand-assets no-green rule.

## Typography

Georgia serif for titles, KPI numbers, and emphasis. Arial for body text, tables, and labels.

## Reusable components

Copied verbatim from `lilly-brand-assets-1c344a/references/dashboard-components.md`: Metric, Card,
Pillar, StateBanner, STable, Tip. A local `ConfBadge` (HIGH/MEDIUM/LOW confidence pill, same color
discipline as `SevPill`) is added for the Cost Stack, Sensitivity, Gap, and Ledger tabs, the same
pattern pro-forma-builder uses for its own Assumptions and Sources tab.

## Tab 1: Overview

- KPI row (5 cards): Should-Cost Base (Total_base), Should-Cost Range (Total_low - Total_high),
  Model Confidence (HIGH/MEDIUM/LOW per Aggregation Method step 5), Supplier Price (when provided),
  Gap vs Should-Cost (absolute + percent, colored by position).
- Reconciliation callout: the Pre-Delivery Self-Test line, e.g. "Reconciles: base $3,975,000 =
  $1,850,000 + $980,000 + $210,000 + $340,000 + $185,000 + $410,000; range [$3,517,183, $4,526,706]
  via quadrature (1 widened LOW-confidence driver); model confidence MEDIUM."
- **Where the leverage is** (left: a compact component-share bar; right: narrative panel) naming the
  single most influential driver on the gap and the single LOW-confidence driver, if any.
- Empty state: if no supplier price was provided, the Gap KPI card shows NEEDS_INPUT ("gap not
  computable yet, add the supplier's proposed price to unlock this card") per the Edge Cases section
  of SKILL.md; the should-cost range itself still renders in full.

## Tab 2: Cost Stack

- Per-component table (STable): Component, Class (MATERIAL/CONVERSION/COMMERCIAL), Base, Low, High,
  Basis, Source, Confidence pill. Sourced from the Cost-Structure Template appropriate to the category.
- Stacked bar chart of component bases (left) paired with a narrative reading (right): which class
  (MATERIAL/CONVERSION/COMMERCIAL) dominates, and why.

## Tab 3: Sensitivity (NEW, 2026-07 addition)

- Tornado chart: each driver swung +/-15% off its own base, others held constant, ranked by dollar
  swing on Total_base (top 5 of the modeled drivers). This is a uniform stress test, distinct from the
  driver's own researched low/high spread shown on the Cost Stack tab.
- Paired narrative: names the top driver, states its +/-15% dollar swing, and states plainly which
  single driver would most change the should-cost conclusion if its true value differs from the
  research estimate.
- Empty state: NOT_APPLICABLE with a one-line reason when fewer than 2 components exist to compare
  (a single-line-item should-cost has nothing to rank).

## Tab 4: Gap & Savings Pipeline

- KPI row (4-5 cards): Should-Cost Base, Supplier Price, Gap ($, %), Position vs Range (Above
  Total_high / Within band / Below Total_low, colored).
- Driver-attribution chart (left: horizontal bar decomposing the gap dollar amount across drivers,
  summing exactly to the gap) with narrative (right): where the over-ask sits and why.
- **Savings Pipeline** (NEW, 2026-07 addition): STable of negotiation levers derived from the same
  driver attribution -- Lever, Class, Low $ impact, High $ impact, Basis, Confidence pill -- sorted by
  high-impact descending. Never a bare point estimate (Rule 4): each lever carries a range whose width
  widens with lower confidence.
- **Category Scorecard** (NEW, 2026-07 addition): a compact stat-tile row -- drivers at HIGH
  confidence (n of total), Model Confidence badge, Reconciliation status (PASS/FAIL), sources flagged
  stale (>12 months), and web-sourced drivers meeting the 3-search effort floor (n of applicable) --
  giving a one-glance read on how much to trust the model before it is used in a negotiation.
- Empty state: if no supplier price was provided, the whole tab shows NEEDS_INPUT ("add the supplier's
  proposed price to compute the gap and the savings pipeline") per the Edge Cases section; the
  Category Scorecard still renders (it does not depend on the supplier price).

## Tab 5: Bracket Reconciliation

- Two-range visual: the should-cost band (bottoms-up) plotted against the market-rate band (top-down,
  typically P25-P75), with the overlap band highlighted as the recommended target.
- Narrative: which of the three Bracket Reconciliation cases applies (agreement/overlap,
  should-cost-below-market, should-cost-above-market) and what it means for anchoring.
- Empty state: NOT_APPLICABLE ("no market-rate-benchmarking output available for this run; the
  should-cost range on Overview stands alone as the negotiation anchor") when no top-down benchmark is
  present or producible.

## Tab 6: Assumption Ledger

- The full Cost-Driver Assumption Ledger (STable): component, class, basis, low/base/high, currency,
  source, source_date, confidence, index_used, freshness_flag, notes.
- The model-level header (as_of_date, fx_rate_table, totals, correlation_assumption, model_confidence,
  supplier_price, gap_abs, gap_pct) as a copyable JSON block, per SKILL.md's ledger schema, for
  downstream reuse by commercial-negotiation-prep and pro-forma-builder.
- Research log (query/source/date, condensed to one row per driver) including any RESEARCH_PENDING
  state for a driver where the 3-search effort floor was not met.

**House style and palette.** Magazine Report house style (per the inlined `house-styles.md` summary in
lilly-brand-assets). Use ONLY the canonical non-green status palette: positive text Bold Blue
`#0F3A85` on Neutral Sky `#D4E5F7`; warning text Amber `#B45309` on Neutral Cream `#FFF0D8`; negative
text Lilly Red `#E1251B` on Neutral Rose `#FDE8E5`; neutral/N-A Bold Grey `#8A969E`; section headers
Bold Blue `#0F3A85`; cards/borders Neutral Stone `#E4EBF1`; header bar Lilly Black `#212121`. No green
or teal in any status indicator. In any rendered text, use the literal character, never a backslash-u
escape or HTML entity, and never an em dash (Rule 7).

**Graceful degradation (primitive availability).**
- If the `visualize:show_widget` primitive or the JSX/React render path is unavailable, do NOT fail:
  emit the same six-tab content as a Magazine-style Markdown report (KPI table, cost-stack table,
  tornado table, gap and savings-pipeline table, bracket table, ledger table) and tell the user the
  interactive dashboard could not render so a static version was produced.
- The dashboard is OPTIONAL and never blocks the XLSX + narrative + ledger, which are the primary
  deliverable and stand alone (SKILL.md Deliverables).
- Numbers-reconcile assertion: Total_base must equal the visible sum of component bases; Total_low and
  Total_high must be the `quadrature_rollup()` output (mirrored in JS, never hand-typed); the Gap
  Method's driver-attribution rows must sum exactly to the visible gap dollar amount; and the Savings
  Pipeline's point estimates (before the confidence-based range is applied) must equal those same
  attribution rows. Reconcile before rendering (validation pass).

## Anti-patterns

1. No per-run redesign of tabs or panels.
2. No vanishing tabs; every tab always renders, using a labeled state when genuinely not applicable.
3. No hand-typed totals that could drift from the underlying component data; every headline figure is
   derived, and the driver-attribution rows are a plug decomposition that guarantees exact
   reconciliation to the gap.
4. No naive sum-of-extremes presented as the headline range; it is shown only as a footnote bound.
5. No fabricated break-even or false-precision point estimate in the Savings Pipeline; every lever
   carries a range whose width reflects its confidence flag.
6. No naked charts: every visualization (cost-stack bar, tornado, driver-attribution bar, bracket
   range, ledger) is paired with an adjacent narrative analysis panel.

---
