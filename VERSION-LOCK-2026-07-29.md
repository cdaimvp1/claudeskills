# Version lock — 2026-07-29

This is the locked version. Marc's call.

Anything below is verified against the running dashboards, not asserted from a
tracker. Where something is incomplete it says so.

---

## What is locked

| Dashboard | State | Build |
|---|---|---|
| **Deal** | **LOCKED** #17, 2026-07-29 | `deal-tab-1c344a/dashboard/build_deal_artifact.py` |
| **Category Strategy** | **LOCKED** at this version | `_category_build/build_dashboard_category.py [--demo]` |
| **RFx** | Locked at this version; one known gap, below | `_rfx_build/build_dashboard_rfx.py` |
| **Landscape** | Locked at this version | `supplier-landscape-1c344a/dashboard/build_dashboard.py` |

Category Strategy ships **two** artifacts and both must be rebuilt together: the
production build (5 categories, gap panels intact) and `-DEMO` (Software only,
every panel populated, banner on every screen).

---

## Category Strategy, as locked

**Five tabs, in argument order:** Overview · Spend & Suppliers · Trend & Change ·
Market & Risk · Strategy & Plays. Internal facts, then internal movement, then
external context, then the decision.

| Tab | Screens |
|---|---|
| Overview | one |
| Spend & Suppliers | Pareto & Tail · Suppliers · Subcategories |
| Trend & Change | Trend · Tail & Rationalization |
| Market & Risk | one, three bands |
| Strategy & Plays | Strategy · Savings & Scorecard |

**Decisions that are locked and should not be quietly reversed:**

- **Strategy & Plays is the platform's outer tab**, reproduced: metric strip,
  recommended plays as selectable cards, the Model the Impact panel. It is not a
  redesign and must not become one.
- **Market & Risk is one screen**, not three. Kraljic and Porter share one
  segmentation toggle; selecting a segment filters the risk band too.
- **The line-item segmentation is MARKET data**, not a Lilly spend split. It
  describes what the market for each consumption unit looks like. This was
  corrected once already; do not reintroduce a Lilly-spend version.
- **Supply risk is average spend per vendor, log-scaled**, not vendor count.
  Vendor count made Scientific Research look like the safest segment because it
  has the most vendors, which was wrong.
- **Tail & Rationalization is one screen.** Overlap & Consolidation and Tail
  Consolidation Opportunities both ended in the same move and were merged.
  Contract Opportunities was SPLIT: the one consolidation item stayed, the four
  exposure items went to Overview.
- **Type ladder is 11 / 13 / 20 / 28.** No 9px anywhere. Verified by a live
  census of rendered size, not declared size: 4 distinct sizes, 0 off-ladder.
  Declared size is not sufficient evidence here, because SVG text scales with its
  container and two charts sit in columns narrower than their viewBox. The
  priority plot renders at 0.965 and the risk heatmap at 0.839, so both carry a
  measured compensation on their declared size. Re-measure after any layout change
  that alters those column widths.
- **Porter is one overlaid pentagon, not three small radars.** Every axis is
  named on the frame. There is no legend: each read card carries a colour bar in
  its segment's colour, so the card is the legend. Segment colour is plum / teal /
  burnt orange in order, and it is load-bearing rather than decorative because it
  is the only thing binding a shape to its read.
- **Market intelligence rows are subject-only when shut.** The figure and its
  headline both live in the opened card. A bare figure on a shut row is a number
  with no denominator and reads as emphasis rather than information.
- **Demo data is illustrative and banner-marked.** The production build reads
  only the real seed and keeps its gap panels.

**Verified at lock, against the running DEMO artifact:** all 5 tabs and 7 subtabs
render, 0 JS errors, no horizontal scroll, banner present on every screen, all
three segmentation modes drive Kraljic, Porter and the risk filter together, and
Strategy & Plays carries its metric strip, six play cards and Model the Impact
panel.

---

## Deal, as locked

Four tabs: Overview · Terms & Review · Economics · Negotiation. The six-tab
proposal is marked superseded.

#11 Positions, #12 Communications, #14 pale-fill sweep and #16 verification plus
the malicious-code sweep all closed. Six judgment calls answered; the reasoning
is in `_deal_build/DEAL-DASHBOARD-TRACKER.md`.

The dashboard moved to its own skill, `deal-tab-1c344a`, away from
`deal-room-1c344a`, which is a live negotiation manager and a different product.
The move was verified byte-identical.

---

## Known gaps, stated rather than hidden

1. **RFx type ladder is not finished.** 91% of text sits on 11px or 13px and 9px
   fell from 396 instances to 198, but 198 of 9px and 26 of 16px remain. They are
   inline `font:` shorthand inside `pv-*.js` and need a renderer pass over the
   call sites. RFx and Landscape also still build panel headers as inline-styled
   divs rather than `.card-hd`, so the restyle protocol reaches them only
   partially.
2. **`deal-room-1c344a/dashboard/` is a stale duplicate.** It could not be deleted
   because a local HTTP server held a handle on it. It carries a SUPERSEDED
   marker. Delete it; nothing references it.
3. **D2 is deferred by Marc.** The shared no-green rule in
   `lilly-brand-assets-1c344a/references/` still says "no green or teal" while
   teal is the primary settled token. ~26 skills of blast radius. The lens
   skills' palette lines were deliberately left alone for this reason.
4. **"Jasper" shell** — Marc mentioned putting this on it; I did not know what it
   referred to and left it. Unresolved, not forgotten.

---

## The traps worth keeping

1. Chrome CSS concatenates AFTER the dashboard sheet, so a plain `:root` loses.
   Use `html:root`.
2. A `var()` inside a custom-property declaration resolves against its own block,
   not the winning cascade value. Restate aliases explicitly.
3. SVG text cannot hold a declared size; the SVG scales with its container. Bars
   and labels belong in HTML.
4. `overflow-x:auto` alone computes `overflow-y:auto`. Declare both on tab strips.
5. `DealUI` is an object literal: a new method needs a trailing comma.
6. Tracker entries go stale. Two Deal items were largely already built. Verify
   against the running dashboard before building from a tracker.
7. Production Category Strategy opens on IT Professional Services; test
   Software-only features on the `-DEMO` artifact.
