# Session handoff — read this first on resume

Written 2026-07-28. Everything below is verified state, not intention. If the
context compacted, start here.

---

## Where the work is

| Thing | Path | Build command |
|---|---|---|
| Category Strategy | `_category_build/` | `python build_dashboard_category.py [--demo]` |
| Deal | `deal-room-1c344a/dashboard/` | `python build_deal_artifact.py` |
| RFx | `_rfx_build/` | `python build_dashboard_rfx.py` |
| Landscape | `supplier-landscape-1c344a/dashboard/` | `python build_dashboard.py` |
| Landscape ENGINE (edit here first) | `_platform_build/assets/pv/` | then copy into the dashboard's `assets/pv/` and rebuild |

Deliver every build to `C:\Users\marcs\OneDrive\Desktop\dashboards\`. Marc reviews
from there over `http://127.0.0.1:8900/`, not from `file://`.

Category Strategy ships TWO artifacts: the production build (5 categories, gap
panels intact) and `-DEMO` (Software only, every panel populated, banner on every
screen). Both must be rebuilt and copied on every change.

---

## NEXT ACTION: Deal #16

Full-tab verification plus a full-codebase malicious-code sweep, including the
single-file demo. Required before #17 locks the dashboard.

#11, #12 and #14 are DONE and verified live. See the log below.

---

## Done this session, verified

**Category Strategy**
- 5 tabs / 12 screens, then Market & Risk merged to one screen: now 5 tabs, 10 screens.
- Tab order: Overview, Spend & Suppliers, Trend & Change, Market & Risk, Strategy & Plays.
- Market & Risk is one screen in three bands, with a segmentation toggle shared by
  Kraljic and Porter. Selecting a segment filters the risk band.
- Segmentations: business purpose (7) and delivery model (4) derived from held
  data; **line item is MARKET data per consumption unit**, researched, not a Lilly
  spend split. Marc corrected me on this: the market tab shows the market.
- Restyle protocol applied. Type ladder is 11 / 13 / 20 / 28. **No 9px anywhere.**
- Strategy & Plays is the platform's outer tab (metric strip, play cards, Model
  the Impact panel). **LOCKED — leave it exactly as is.**

**RFx / Deal / Landscape**
- Restyle protocol layer appended to each stylesheet.
- Landscape L1/L2: 194 off-palette hex mapped to tokens, ownership tree un-nested,
  OV1 Head-to-Head COMPARE launcher removed from Overview.
- Deal #14 pale-fill sweep complete at the token layer.

---

## Traps that cost time. Do not rediscover these.

1. **Chrome CSS is concatenated AFTER the dashboard sheet.** A plain `:root`
   block loses to it. Use `html:root`, which outranks `:root` at any source order.
2. **A `var()` inside a custom-property declaration resolves against the block it
   was declared in**, not against whichever value later wins the cascade. So
   overriding `--danger` did nothing for `--danger-fg: var(--danger)` declared in
   the original `:root`. Restate aliases explicitly.
3. **SVG text cannot hold a declared size** — an SVG scales with its container, so
   11px renders 157px in a wide card and 7px in a narrow one. Bars and labels
   belong in HTML; put only band and line geometry in SVG.
4. **`overflow-x:auto` alone computes `overflow-y:auto`.** Every tab strip needs
   `overflow-y:hidden` or a stray vertical scrollbar appears.
5. **`git commit -m` word-splits on messages containing `->`.** Use `-F -` with a
   heredoc.
6. **Bash heredocs break on some quoting.** Write patch scripts with the Write
   tool and run them, rather than piping long scripts through bash.
7. Production Category Strategy opens on category 0 = IT Professional Services.
   Software-only features correctly read "needs data" there. Test on `-DEMO`.
8. **`DealUI` is an object literal, not a class.** A new method needs a trailing
   comma. Without it the file parses as far as the NEXT method name and throws
   "Unexpected identifier" pointing at innocent code several lines below the real
   error.
9. **Two tracker entries were stale.** #12 claimed no Communications filters were
   wired; three of four were. #11 claimed Positions was "still the old design";
   every block of the locked mockup was already live. Verify against the running
   dashboard before building from a tracker entry.

---

## Parked, needs Marc

- Deal judgment calls, all still open and none blocking #11/#12/#14/#16: L&P group
  bands vs per-row tag; boot auto-expand; Protection-Scorecard 8-category spine vs
  26-row union; Cross-Doc "Open Document Risks" reframe; Document Family Register
  click-to-open; #13 Next-Session Brief re-home or drop.
- Market & Risk mockup options 2 and 3 not taken; Marc chose option 1.

## Closed this session

- Deep-dive P2: **complete**, per Marc. FM4/RR3/RR4/CO4 struck as stale.
- Head-to-Head launcher: **removed** from Overview, tab kept.

## Out of scope, explicitly

RFx and Landscape still carry off-ladder type (7 / 12 / 16px) and build panel
headers as inline-styled divs rather than `.card-hd`. Neither is reachable from
CSS. Marc did not select that work.
