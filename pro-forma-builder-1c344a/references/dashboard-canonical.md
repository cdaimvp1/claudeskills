# Pro-Forma Builder Dashboard: Canonical Structure v1.2 (LOCKED)

This spec is mandatory. Every pro-forma dashboard this skill produces, for every deal, category,
or commodity, follows this exact structure. Only the data changes per run. The reference
implementation is `examples/pro_forma_canonical_dashboard.jsx`. Clone its structure, swap the data.

## What Changed in v1.2

Added to v1.1 (the five-tab skeleton fixed in SKILL.md's "Dashboard canonical tab skeleton"):
- **Cost Component Buildup** (Headline + Scenario Projection): a per-component (License/
  Subscription, Implementation, Support, Other, extensible to Training/T&E/Change-orders/
  Integration/Admin) Year 0-N cash-flow breakdown, computed via the `escalate()` kernel mirror
  per component. Headline shows it as a stacked bar chart with a paired narrative panel;
  Scenario Projection shows the full component x year matrix as a searchable, sortable table.
  Replaces the previously aggregate-only Net 5-Yr TCO KPI and scenario-level-only year-by-year
  table with a genuine line-item cost buildup.
- **What-If: Discount Rate and Escalation Cap lever** (Headline + Sensitivity): two live sliders
  (discount rate, recurring-cost escalation cap applied uniformly to License + Support) that
  reprice NPV and 5-Yr TCO client-side, in real time, against the SAME validated net-cash-flow
  series used for the headline NPV. Same kernel-mirrored `escalate()`/`npv()` engine and lever
  framing as commercial-negotiation-prep's escalation-cap-to-multi-year-TCO lever, so the two
  skills' outputs are directly comparable. Sensitivity additionally gets a live NPV-vs-discount-
  rate curve (sweeping 2%-20%) with a current-position marker and a break-even marker, both
  driven by the same lifted slider state as the Headline lever.
- **Break-even and tornado, driver-agnostic:** the tornado ranks 2-3 of 4 modeled drivers
  (discount rate, future-state escalation delta, status-quo baseline escalation delta,
  implementation cost variance) by NPV swing and computes break-even on whichever driver ranks
  first, via bisection. When no sign change exists in the driver's tested bracket, the dashboard
  states that fact plainly (NPV stays positive/negative across the full band) rather than
  fabricating a 0%-style break-even value.

## The determinism guarantee

1. **Same skeleton, always.** Five tabs, in the fixed order (Headline, Scenario Projection,
   Savings Waterfall, Assumptions and Sources, Sensitivity), appear on every run for every deal.
   Header, footer, tab nav, color tokens, typography, and reusable components are identical run
   to run.
2. **Content varies, structure does not.** A services renewal and an ERP consolidation populate
   the same tabs. A tab that is less applicable shows a labeled state (NEEDS_INPUT,
   NOT_APPLICABLE, or RESEARCH_PENDING), never a blank.
3. **Numbers reconcile by construction.** The dashboard's data model computes every headline
   figure (NPV, ROI, payback, TCO, the savings waterfall, the tornado, break-even) from the
   COMPONENTS + BASELINE assumptions via the kernel-mirrored `escalate()`/`npv()` functions, not
   from hand-typed totals. The savings waterfall's last lever is always the reconciliation plug
   (computed as a remainder), so Baseline minus the sum of the steps equals Net Future-State
   exactly, and Net Future-State equals the independently-computed Net 5-Yr TCO exactly. See the
   "Numbers-reconcile assertion" in SKILL.md's Graceful Degradation section.
4. **Interactive controls recompute live, client-side.** The discount-rate and escalation-cap
   sliders are pure functions over the in-memory data object (`buildLeverScenario`,
   `leverNetCF`, `npvJS`); no server round-trip, no re-fetch. Both sliders share React state
   lifted to the top-level dashboard component, so the same drag is reflected identically on the
   Headline tab and the Sensitivity tab.

## Color tokens (do not change)

R `#E1251B` (Lilly Red), DK `#212121` (Lilly Black), BRN `#521207` (Bold Brown), CARD/BD
`#E4EBF1` (Neutral Stone), WARM `#FFF0D8` (Neutral Cream), RISK `#FDE8E5` (Neutral Rose), OK
`#D4E5F7` (Neutral Sky, positive background tint), MUT/LT `#8A969E` (Bold Grey), BLU `#0F3A85`
(Bold Blue, the on-brand positive/good/passing signal), AMB `#B45309` (Amber). Chart palette
(exactly 6, verbatim from `dashboard-components.md`): `[R, BLU, BRN, "#F58E7D", "#FFC709",
"#99BFE5"]`. No green or teal anywhere, per the lilly-brand-assets no-green rule.

## Typography

Georgia serif for titles, KPI numbers, and emphasis. Arial for body text, tables, and labels.

## Reusable components

Copied verbatim from `lilly-brand-assets-1c344a/references/dashboard-components.md`: Metric,
Card, Pillar, StateBanner, STable, Tip. A small `ConfBadge` (HIGH/MEDIUM/LOW confidence pill,
same color discipline as `SevPill`) is added locally for the Assumptions and Sources tab, the
same pattern commercial-negotiation-prep uses for its own confidence badges.

## Tab 1: Headline

- KPI row (5 cards): NPV (with the discount rate shown), ROI (annualized + cumulative, labeled
  discounted/undiscounted), Payback (simple + discounted), Net 5-Yr TCO, Total Net Savings vs
  Baseline.
- "What would change this conclusion" one-liner: names the top sensitivity driver and its
  break-even (or states plainly that none exists in the tested range), never fabricated.
- **Cost Component Buildup** (left: stacked bar chart by component, Year 0-5; right: narrative
  reading, including the biggest driver as % of TCO).
- **What-If: Discount Rate and Escalation Cap** (left: two sliders + live-recomputed NPV/TCO
  metric cards; right: narrative reading, including the same-engine cross-reference to
  commercial-negotiation-prep).

## Tab 2: Scenario Projection

- Low/Base/High multi-year cost-projection chart (left) with a "Year 1 vs steady state" and
  Low-High band narrative (right).
- **Cost Component Buildup, by Year**: full component x year matrix (License/Subscription,
  Implementation, Support, Other, each Year 0-5, plus 5-Yr Total and a TOTAL row), searchable
  and sortable via STable.

## Tab 3: Savings Waterfall

- KPI row (5 cards): Baseline, Gross Recurring Savings, One-Time Cost to Achieve, Net Savings,
  Net Future-State.
- Baseline-to-Net-Future-State waterfall chart (left, signed steps: 3 named levers + an
  escalation-rate-improvement plug + one-time cost, reconciling exactly) with narrative reading
  (right).

## Tab 4: Assumptions and Sources

- Assumptions register table (discount rate, horizon, discounting convention, escalation rates,
  baseline, sourced benchmark anchors) with Source + Confidence per row.
- Research log, including a RESEARCH_PENDING state for any anchor not yet established (never
  silently assumed to be zero).

## Tab 5: Sensitivity

- Tornado chart (top 3 of 4 modeled drivers, ranked by NPV swing) with the break-even and
  robustness verdict for the top driver.
- **NPV vs Discount Rate** live curve (left: sliders + chart with current-position and
  break-even markers; right: narrative reading), sharing state with the Headline lever.

## Anti-patterns

1. No per-run redesign of tabs or panels.
2. No vanishing tabs; every tab always renders, using a labeled state when genuinely not
   applicable.
3. No hand-typed totals that could drift from the underlying component/baseline data; every
   headline figure is derived, and the waterfall's plug lever guarantees exact reconciliation.
4. No fabricated break-even value when no sign change exists in a driver's tested range; state
   the robustness fact instead.
5. No naked charts: every visualization (component buildup, scenario lines, waterfall, tornado,
   NPV curve) is paired with an adjacent narrative analysis panel.

---
