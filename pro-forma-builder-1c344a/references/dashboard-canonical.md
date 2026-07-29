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


---

# Deal-tab contribution (D1 / D3, added 2026-07-29)

> **Nothing above this line changed.** This skill's standalone outputs are
> unaffected: same structure, same palette, same generators. This section only
> describes what this skill contributes when a Deal tab is being built.

## The converged target

The Deal tab is built by **`deal-tab-1c344a`**, not by this skill. It is one
static, self-contained HTML artifact on the platform chrome, with a LOCKED
four-tab structure:

| Tab | Subtabs |
|---|---|
| **Overview** | none |
| **Terms & Review** | Documents & Conflicts · Legal & Protection · Scope & Performance · Sources & Evidence |
| **Economics** | Deal Table & ZOPA · Financial Model |
| **Negotiation** | Positions · Trade Plan · Communications |

Locked 2026-07-29. The six-tab version in `DEAL-TAB-REDESIGN-PROPOSAL.md` is
superseded and marked as such.

**This skill does not build that dashboard and must not emit its own version of
it.** It contributes a slice of the data object and stops there. Three skills
feed one artifact; if each built its own, the deal would have three
disagreeing dashboards.

## The slice this skill owns

| Key | What it carries |
|---|---|
| `commercialLines[]` | Each priced line: ask, target, fallback, walk-away, and the basis for each |
| `scenarios[]` | Modelled cases with their assumptions made explicit |
| `assumptions[]` | Every assumption, with its original value retained so a reset is possible |
| `proforma{}` | The pro-forma, P&L and cash-flow views |
| `benchmarks[]` | External comparators with source and date |

## Where each lands

- `commercialLines[]` and `benchmarks[]` drive **Economics > Deal Table & ZOPA**,
  including the ask-to-negotiated value ladder and the sensitivity band.
- `scenarios[]`, `assumptions[]` and `proforma{}` drive
  **Economics > Financial Model**.
- Assumptions are user-adjustable in the artifact and must carry their original
  value, because the panel offers a reset.

## An honesty rule that bites here

A modelled figure must say it is modelled. Identified and modelled savings are
never presented in the same column as validated or approved ones; the Deal tab
keeps those stages visually separate on purpose. Blurring an estimate into a
target is how savings numbers stop being believed.

## Preserved, unchanged by D1/D3

`pro_forma_generator.py` and `numeric_kernel.py` and the `.xlsx` workbook path
are untouched. Do not route workbook generation through the dashboard.


---

# D3: the redesigned panels, as specification

Four panels were designed against mockups and built, but existed only as code.
They are recorded here so the next build reproduces them rather than reinventing
them. Full implementations live in `deal-tab-1c344a/dashboard/_parts/`.

## Legal & Protection: accordion scorecard + register

A segmented navigator, **Protections N / Obligations N**, each a single-open
accordion (native `<details name>`, no JavaScript). The counts on the segments
are the summary; there is no separate count panel.

The register **starts collapsed** (2026-07-29). It previously auto-expanded the
first category containing a hard stop, which pushed the rest of the page off the
first screen and chose a first item for the reader with no reason to prefer one.

Group bands are kept rather than per-row tags: protections and obligations are
read at different moments, and a flat tagged list makes both audiences filter
visually every time.

## Positions: master-detail with severity filter

Left, the ranked list of contested terms. Right, the selected term in full: the
position ladder (as-drafted, target, fallback, walk-away), why it matters, the
exchange with expected pushback and our rebuttal, dependencies, and the history
of that term across redlines.

Above it, a posture header carrying the signature gates as Now/Need pairs and the
protection trajectory.

A severity filter bar sits above the list: **Hard stop / High / Medium / Low /
All**, each with its count, plus a live count of what is shown. Counts are on the
chips deliberately, because a filter that hides rows without saying how many is a
filter people stop trusting. If the selected row is filtered out, selection moves
to the first row still visible, so the detail pane never shows a position the
list is denying.

## Communications: item-driven alignment map

Organised by what is being negotiated, not by message. For each contested term:
where each side stands, mapped to the specific messages and quotes that got them
there, how it evolved, and the next move.

Content is **looked up, never re-typed**: `gapUs` = recommendedPosition,
`gapThem` = supplierPosition, cited messages = `comms.events` matched by issueId
and direction, the redline quote = `issue.sourceExcerpt`, next move =
recommendedResponse.

Three filters compose through one function: status, category and free-text
search, ANDed together so a later filter cannot undo an earlier one. Plus
expand-all, which relabels itself to collapse-all. An empty result states itself
rather than showing a blank panel.

## Scope & Performance: master-detail reconciliation

Readiness verdict first (verify-complete, verify-sound, verify-allocated), then
the reconciliation ledger, timeline and RACI. Undefined acceptance gates are
counted and stated, never omitted.

## The rule under all four

Reflect-only. These panels draft, surface and organise. They do not send, route,
write to any system, or initiate anything on the user's behalf.
