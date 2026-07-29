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

## NEXT ACTION: D2, when Marc lifts the deferral. Otherwise the Deal thread is done.

Deal LOCKED (#17). D0, D1, D3, D4, L3 all DONE. **D2 is the only item left in the
agreed scope and Marc deferred it.**

D2 is the shared no-green rule in `lilly-brand-assets-1c344a/references/`
(`brand-colors.md` + `dashboard-components.md`), which still says "no green or
teal". Teal is now the primary settled/ok token, so the rule contradicts the
system. Blast radius ~26 skills; scope strictly to the colour tables and the
no-green prose. The lens skills' own palette lines were deliberately left alone
during D1 for exactly this reason.

ONE LOOSE END: `deal-room-1c344a/dashboard/` could not be deleted after the D0
move (a local HTTP server held a handle). It carries a SUPERSEDED marker. Delete
it when no process holds it; nothing references it.

--- (superseded below) ---
## Was: D0, then D1 and D3

Deal is **LOCKED** (#17, 2026-07-29). D4 and L3 are **DONE**. D2 is deferred by
Marc. D1 and D3 remain and are blocked on D0.

D0 in one line: the Deal-tab dashboard code physically lives inside
`deal-room-1c344a/`, which is a DIFFERENT product (a live negotiation manager
with a persistent concession ledger). The dashboard is static and reflect-only.
One skill directory currently claims both.

--- (superseded section below) ---
## Was: Deal #17 — lock, then the docs/skills set

Deal #11, #12, #14 and #16 are DONE and verified live. #16 passed both halves;
the evidence is in `_deal_build/DEAL-16-VERIFICATION.md`. #17 is not blocked.

#17 is a decision, not a build: it locks the Deal dashboard. Six judgment calls
are parked for Marc and none of them block the lock, but he may want to answer
them first. They are listed under "Parked" below.

After that, the docs/skills set from the agreed overnight scope: D2 shared
no-green rule (~26 skills, colour tables only), D1 lens-skill canonicals, D3
formalise the redesigned tabs, D4 encode the shipped 4-tab IA, L3 Landscape
palette prose.

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

- Deal judgment calls, ANSWERED by Marc 2026-07-29:
  1. Protection-Scorecard spine: **keep the 8 categories.** No change.
  2. L&P group bands vs per-row tag: **keep the bands.** No change.
  3. Boot auto-expand: **start collapsed.** DONE, verified 0 of 11 open on load.
  4. Cross-Doc "Open Document Risks" reframe: **Marc needs to see the mockup**
     before deciding. It is `_deal_build/_mockups/cross-doc-risks-alt.html`,
     copied to the Desktop mockups folder. STILL OPEN.
  5. Document Family Register click-to-open: **no, for now.** Marc's reason: most
     readers will come through Claude Code and a click-through to a document has
     nowhere reliable to go. Agreed, and it is the right call: these artifacts are
     self-contained single files with no file-system access, so the link would be
     a promise the page cannot keep. If it is wanted later, expand-in-place with
     the excerpt and source is the honest version.
  6. #13 Next-Session Brief: **drop.** Confirmed already absent from live source;
     recoverable from git history if ever wanted.
- Market & Risk mockup options 2 and 3 not taken; Marc chose option 1.

## Closed this session

- Deep-dive P2: **complete**, per Marc. FM4/RR3/RR4/CO4 struck as stale.
- Head-to-Head launcher: **removed** from Overview, tab kept.

## Out of scope, explicitly

RFx and Landscape still carry off-ladder type (7 / 12 / 16px) and build panel
headers as inline-styled divs rather than `.card-hd`. Neither is reachable from
CSS. Marc did not select that work.
