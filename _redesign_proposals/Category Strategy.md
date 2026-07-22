CATEGORY STRATEGY: PLATFORM vs SKILL DASHBOARD, MERGE PROPOSAL
================================================================

Sources read (read-only reference, nothing modified):
- Platform: `C:\Users\marcs\OneDrive\Desktop\lilly IT intake and orchestration tool\category-strategy.html`
  and its five inlined asset modules under `assets\category-strategy\category-strategy-01..05-*.js`,
  plus `assets\dash-kit.css` / `assets\dash-kit.js` (the shared chart/card kit) and `assets\theo-brand.js`
  (the app-wide topbar/wordmark injector). Note: `dashboard-category.html` and
  `platform/public/dashboard-category.html` are meta-refresh stubs; the real deep dashboard is inlined
  into `category-strategy.html` itself via the `assets/category-strategy/` modules.
- Skill: `C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\category-strategy-1c344a\SKILL.md`
  (inlined JSX Dashboard component, ~line 1237-1568) and its `references/*.md`.
- Recon: `scratchpad\review\recon_by_skill.md` and `recon_menu.md` (category-strategy = 19 candidates,
  11 of them "strong").


1. PLATFORM (what it does well)
--------------------------------

STRUCTURE. `category-strategy.html` is a single page with a persistent left icon rail (Home / Projects /
Approvals / Suppliers & spend / Savings / Category strategy / Defender / My work / Team) and one main
column. Inside that column there are exactly two top-level tabs, rendered as underline text-tabs, not
pills:

- **Strategy & Plays** (default) - the action workspace for a rep working a category today.
- **Deep Analysis** - an 11-tab structured report (Overview, Pareto & Tail, Suppliers, Subcategories,
  Market & Kraljic, Risk, Strategy, Savings & Scorecard, Supplier Development, Rationalization,
  Trend & Change).

A single category picker (IT Professional Services / Software & SaaS / Hardware & infrastructure /
Telecom & network / IT Managed Services), also rendered as underline tabs, sits above BOTH panels and
is kept in sync (`#picker` and `#picker-deep` share state) - pick a category once, it drives everything.

STRATEGY & PLAYS PANELS (in page order):
1. Category picker
2. KPI strip (5 tiles: Annual spend, Suppliers, Contracts, Savings YTD w/ delta, Avg cycle - live variant
   swaps in HHI/tier/tail-share tiles)
3. Recommended Plays cards (the 4 base levers: Consolidate / Recompete / Renegotiate / Standardize) with
   an "Ask Theo for more plays" AI button and a free-text "Add your own play" form
4. "Model the Impact" - a sticky right-rail panel: Yr1/3yr/5yr horizon toggle, big headline savings
   number, a 3-bar chart, a category-risk bar (base -> modeled /100), FTE-weeks of effort, time-to-first-
   value, and three follow-through buttons (Generate strategy narrative / Surface to savings / Start RFx)
5. Single-source exposure flag (conditional, only when a named vendor exceeds 30% share)
6. "Full Category Strategy" async background-job card (idle -> running -> done/error), with phase pips
   (Research -> Analysis -> Draft), dual checklists (research passes with signal counts, analysis
   sections), a "you can leave this page" note, and a bell notification on completion
7. Supplier Landscape mini-table (name, spend, share bar, fit/risk read chip)
8. Portfolio Risk Overview (tier tiles Critical/Elevated/Watch/Clear + top-movers list with
   WORSENED/IMPROVED/NEW diffing against a prior snapshot, or a "standing watch" fallback when there is
   no prior snapshot) - explicitly reflect-only from WWTP/Aravo
9. Opportunities list (expiring contracts / tail consolidation / off-contract spend, each with a $ value
   and a tag)
10. Porter's Five Forces (buyer/procurement lens: 5 rows with Low/Med/High leverage chips + a "net
    leverage" synthesis callout tying the forces to a recommended play)
11. Reflect-only banner (repeats the "nothing is initiated on your behalf" framing once, plainly)

DEEP ANALYSIS: the same 11 tabs as the skill (see section 2), but every figure is read through a
grounded seed (`assets/seed/categories.js` via the `Theo.data` facade) with a typed `$src` per field, and
every headline metric that has no sourced value renders `DK.banner("NEEDS_INPUT", ...)` and simply hides
rather than showing an invented number (the `DNA()` / `hideData()` pattern). Live categories replace the
demo renderers 1:1 with `renderLive`/`mountLive` functions that read the real category-strategy engine
response (`window.__csLive`), with the same shape and same hide-until-data discipline.

WHY IT READS AS COHERENT:
- **One picker, two views.** The category selection and the strategy/deep-analysis split are the only two
  navigation decisions a user makes; everything else is scannable in place. No mode picker up front, no
  wizard - the "action" and "report" surfaces are just two tabs on the same object.
- **Consistent grouping.** Every panel is a `.card` with the same header band, same padding, same
  provenance affordance. The Deep Analysis mount uses the same `DK.card` / `DK.metric` / `DK.pillar`
  component set, so a reader's eye never has to re-learn a new shape between Overview and Risk.
- **Hierarchy via type weight and one rule color, not boxes-in-boxes.** Card titles are 13-16px bold,
  body copy 12-13px, captions 11px muted - no nested card-in-card. A single 4px red rule marks the
  Deep-Analysis header; that is the only "loud" color element on the page.
- **Density is even.** KPI strips are always 4 or 5 tiles wide, tables are always the same row height and
  right-aligned numeric columns, chart heights are fixed per card type (KPI charts ~180-230px, Pareto
  ~320px) so scanning down the page has a steady rhythm.
- **Color does one job (the "3-colour rule").** Category-strategy's identity accent is plum
  (`#5C2B50` / `--plum-t` tint) used only on card header bands and the recommended-play callout. Bold
  Blue `#0F3A85` always means positive/good/on-track (this suite never uses green). Amber/burnt-orange
  always means watch/caution. Lilly Red is reserved for the app brand rule and true critical/risk states.
  Nothing else competes for attention.
- **Reflect-only trust framing is structural, not just a footnote.** Every proactive action (surface to
  savings, start an RFx, generate a narrative) routes through a confirm modal that names what will change
  and what stays a draft; the live/demo duality means the same UI never lies about whether a number is
  real or illustrative.
- **Interaction model.** Click a category chip -> everything below repaints optimistically (demo first,
  live overlays when it resolves). Click a supplier name -> an inline deep-dive drawer expands beneath
  the table (no navigation away, no modal). Drag the Pareto tier-cutoff slider -> the tier band and table
  resize live. Toggle a play card -> the sticky model panel recomputes instantly. Nothing requires a
  round trip to see its own effect.


2. SKILL DASHBOARD (current)
------------------------------

STRUCTURE. The skill's JSX `Dashboard()` component is a SINGLE 11-tab report with no separate
"action/plays" surface - `useState("Overview")` drives one tab bar (Overview, Pareto & Tail, Suppliers,
Subcategories, Market & Kraljic, Risk, Strategy, Savings & Scorecard, Supplier Development,
Rationalization, Trend & Change; NEEDS_INPUT tabs get a `*`). It is the direct ancestor of the platform's
Deep Analysis tab (identical tab names, very similar per-tab panel sets) - this is genuinely the same
lineage, not a different design.

GENUINELY WORTH RETAINING (the platform lacks these, confirmed by direct comparison):

- **A. Renewal Decision Matrix** (Suppliers tab, inside the per-vendor deep-dive drawer): a
  Performance(1-5) x Market-attractiveness(1-5) quadrant bubble scatter (`Quad2x2`, generic and reused
  for Kraljic too), with named quadrants (Replace/Compete, Renew & Expand, Exit/Remediate, Renew-Protect-
  Terms), a plain-language rationale, and a "renewal window confirmed / unconfirmed - upload contract"
  chip. The platform's `drawDeep()` supplier drawer has none of this (just KPIs + an FY bar chart + a
  rate-vs-volume note). This exact panel is flagged in recon as a strong, currently-missing candidate for
  category-strategy.
- **B. Escalation Triggers** (Risk tab): 7 rule-based triggers per top vendor (value threshold,
  recompete-due, sole-source concentration >20%, notice window <30 days, etc.), rendered as fired/clear
  chips rolled into a routing verdict (Escalate / Monitor / Clear), plus a "Confidence & bundling"
  callout that names a concrete cross-subcategory bundling candidate. The platform's Risk tab has a Risk
  Register + top-risk callout but no trigger/escalation mechanism at all.
- **C. Spend Under Contract** (Overview tab): a contract-coverage KPI (% of spend under an active
  agreement), a two-segment coverage bar (under-contract vs off-contract/expired, in dollars), named
  off-contract supplier chips, and an explicit coverage target ("<85% coverage, below the >85% target for
  a strategic (>$5M) category"). The platform's demo Overview tab has no contract-coverage figure at all.
- **D. Geographic Distribution** (Overview tab): country-share horizontal bar with a named
  single-country-risk threshold (70%) and a plain reading ("62% concentrated in the US, no threshold
  breach"). The platform's demo Overview tab does not surface geography (a `liveGeo()` renderer exists
  in the live-path code but is not wired into the demo Overview tab consistently).
- **E. Fragmentation Map** (Subcategories tab): a vendor-count(x) x spend(y) bubble scatter, bubble-sized
  by 3-yr spend, with a plain "upper-left = consolidated, lower-right = fragmented" reading key and a
  named single "cleanest consolidation target" subcategory. The platform's Subcategories tab has a
  spend-by-subcategory bar and a hosting/segment split, but no fragmentation view.
- **F. ARIA Spend Forecast** (Trend & Change tab): a forward 3-year low/base/high spend projection with a
  live adjustable growth-assumption slider (-5% to +20%), paired with an explicit "Forecast Methodology &
  Confidence" card (provenance: ARIA session vs annualized-run-rate fallback; method: compounding band;
  confidence: medium, near-term higher than CY+3). This is the single biggest gap: the platform's
  Trend & Change tab is entirely backward-looking (swing drivers + decomposition), with no forward
  projection or interactive assumption control anywhere in category-strategy.
- **G. Savings play cards carry vendor + basis.** Each `SavingsModeler` play card names the specific
  supplier it targets and a one-line "basis" for the estimate, alongside a confidence chip. The
  platform's Recommended Plays cards are supplier-agnostic category-wide levers (the vendor context lives
  only in the Landscape table above, not on the play card itself).
- **H. Transparent Risk scoring.** The skill computes `score = likelihood x impact` and a derived tier via
  a named `riskTier()` helper, showing the numeric Score column next to the Tier chip, so a reader can
  audit how a tier was reached. The platform's Risk Register shows tier/severity chips without the
  underlying score arithmetic visible in the table.
- **I. Research & Citation Log co-located with claims.** The skill puts a claim/source/as-of/confidence
  table directly on the Market & Kraljic tab, next to the Porter/Kraljic claims it supports. The platform
  has the identical pattern (`researchLog()`) but it mainly surfaces inside the async full-strategy job
  flow, not consistently attached to the tab that carries the claims.

WEAK / INCOHERENT vs the platform (do not carry these forward):
- No action/plays workspace at all - a rep has nowhere to select and model a play outside the
  Savings & Scorecard tab; there is no sticky "Model the Impact" panel visible while browsing other tabs.
- No provenance system: figures are either plainly stated or wrapped in a generic `StateBanner`
  (RESEARCH_PENDING / NEEDS_INPUT); there is no per-field source badge, no `DNA` hide-until-data
  sentinel, so an ungrounded number and a grounded one look identical outside of the banner text.
- No live/demo duality - it is a single illustrative artifact with no wiring to a real engine, so figures
  cannot be trusted as anything but a layout example (the skill's own footer says "Data: NEUTRAL
  ILLUSTRATIVE").
- No dark mode, no house typography (uses Arial + Georgia serif with hardcoded hex constants DK/R/BLU/
  AMB/BD/MUT, not CSS variables), so it cannot re-skin with the app theme.
- No cross-panel actions (nothing surfaces to Savings, nothing starts an RFx, nothing drafts a narrative)
  - it is read-only in a stronger sense than "reflect-only": there is no path from insight to next step.
- Portfolio Risk Overview here is a static tier-tile count with a one-line "N/A this run, needs a prior
  snapshot" note; the platform's version actually diffs against a prior snapshot and reflects real
  WWTP/Aravo tiers. Not worth porting over the platform's version, but the LOCATION (inside the Risk tab)
  is arguably more logical than the platform's placement (Strategy & Plays tab) - see proposal below.


3. NEWEST VERSION (the proposal)
----------------------------------

Keep the platform's two-tab, one-picker information architecture wholesale (it is unambiguously the
better structure) and graft in the nine genuinely-additive skill panels (A-I above) at the specific
points where they close a real gap. Do not duplicate anything the platform already does better
(Portfolio Risk Overview diffing, Kraljic derivation, Supplier Development trend, Rationalization/
sole-source card, the async full-strategy job).

TOP-LEVEL STRUCTURE (unchanged from platform):
```
Category Strategy
 ├─ Category picker (shared across both tabs)
 ├─ [ Strategy & Plays ]  [ Deep Analysis ]      <- underline tab switch
 │
 ├─ STRATEGY & PLAYS (panel-strategy)
 │   1. KPI strip (5 tiles)
 │   2. Recommended Plays + "Model the Impact" sticky panel
 │        - play cards NOW carry an optional vendor chip + one-line basis (skill pattern G),
 │          shown only when a play targets a specific named supplier (e.g. Renegotiate -> Accenture)
 │   3. Full Category Strategy background-job card
 │   4. Supplier Landscape mini-table
 │   5. Portfolio Risk Overview + Escalation Triggers (MERGED card, two stacked sections:
 │        tier tiles/movers on top - unchanged from platform - Escalation Triggers rows underneath,
 │        collapsed by default with a "N triggers fired across the portfolio" summary line and an
 │        expand toggle, reusing the skill's TriggerRow chips + routing verdict + bundling callout)
 │   6. Spend Under Contract (NEW card, skill pattern C: coverage %, two-segment bar, off-contract chips)
 │   7. Opportunities list
 │   8. Porter's Five Forces (buyer lens)
 │   9. Reflect-only banner
 │
 └─ DEEP ANALYSIS (panel-deep, 11 tabs unchanged)
     1. Overview        + Geographic Distribution card (skill pattern D), placed beside Data Quality
     2. Pareto & Tail    (unchanged; A/B/C/D tier slider already covers the skill's cutoff-slider need,
                          only add the 3-metric quick-stat row skill's ParetoTierSlider showed above the
                          slider, since it reads faster than scanning the tier table)
     3. Suppliers        + Renewal Decision Matrix (skill pattern A) inside drawDeep(), gated by
                          DNA()/hideData() so it only renders for vendors with resolved performance +
                          market-attractiveness data; carries the "renewal window confirmed/unconfirmed"
                          chip
     4. Subcategories    + Fragmentation Map bubble scatter (skill pattern E), placed between the
                          spend-by-subcategory bar and the hosting-split cards
     5. Market & Kraljic (unchanged structure; the Research & Citation Log stays here, already present)
     6. Risk             (Risk Register + top-risk callout unchanged; Escalation Triggers now lives in
                          Strategy & Plays per above - do NOT duplicate the panel here, just a one-line
                          cross-link: "7 escalation triggers tracked in Strategy & Plays > Portfolio Risk")
     7. Strategy         (unchanged; already the stronger of the two versions)
     8. Savings & Scorecard  + vendor/basis columns added to the Savings Pipeline table (skill pattern G,
                          applied to the platform's existing table rather than porting a second modeler)
     9. Supplier Development (unchanged; platform's SBE/WBE/MBE breakout is already the richer version)
    10. Rationalization  (unchanged; add one cross-link chip on each lever card pointing to its matching
                          Fragmentation Map subcategory, rather than re-adding the skill's flat table)
    11. Trend & Change   + ARIA Spend Forecast panel (skill pattern F): adjustable growth-assumption
                          slider, 3-year low/base/high bar chart, paired "Forecast Methodology &
                          Confidence" card - inserted after the existing swing-drivers table and change
                          decomposition, using platform provenance conventions (label the base as
                          "Projection (ARIA forecast)" when a live ARIA session is active, otherwise
                          "annualized run-rate" exactly as the skill already phrases it)
```

NET-NEW IDEAS (beyond either source):
- **One shared provenance legend**, stated once at the top of Deep Analysis (not repeated per tab):
  what a source-badge means, what `NEEDS_INPUT` / `RESEARCH_PENDING` / hidden-until-data means. Cuts
  caption repetition across 11 tabs (aligns with the app-wide "caption cull" design pass already
  underway elsewhere in Theo) while keeping every individual claim's badge on the figure itself.
- **One reusable "signal card" component** for the three near-identical shapes that now exist
  (Recommended Play card, Savings Pipeline row, Rationalization lever pillar): title + vendor chip
  (optional) + basis line + confidence chip + a stat row. Build it once in dash-kit as
  `DK.signalCard(...)` and use it in all three places instead of three bespoke markups, so a future
  fourth use (e.g. a play surfaced from the Opportunities list) is a one-line call, not new CSS.
- **Cross-link chips** between the newly-added panels and their existing platform counterparts: the
  Renewal Decision Matrix's quadrant verdict links to that vendor's row in Escalation Triggers; the
  Fragmentation Map's flagged subcategory links to its Rationalization lever. This is the same
  "golden-thread" cross-tab reflection pattern already used elsewhere in Theo (Landscape -> RFx,
  Total Recall), applied inside category-strategy itself so the 11 tabs stop reading as 11 independent
  reports.
- **Escalation Triggers collapsed-by-default**: since it is a dense, rarely-all-fired table, default it
  collapsed with a one-line fired-count summary inside the merged Portfolio Risk Overview card, expand on
  click - keeps the Strategy & Plays tab from getting longer for the common case where nothing has fired.

LAYOUT: single main column (unchanged), no left/right split at the page level - the only right-rail
element remains the existing sticky "Model the Impact" panel inside Recommended Plays (`.plays-wrap`
grid, 1.5fr/1fr), which already works well and should not change. All new panels are full-width cards
inserted in-flow, consistent with every existing platform panel.


4. DESIGN NOTES
-----------------

CARRY OVER EXACTLY AS-IS (already correct, do not re-invent):
- **Canvas and cards.** Off-white/stone app canvas (`--bg`), white `.card`/`.dk-card` surfaces, 14px
  border radius, 1px `--line` borders, no drop-shadow drama (`--shadow: 0 1px 4px rgba(38,30,20,.08)`).
- **Topbar.** `theo-brand.js` overrides the page-local red topbar CSS to the current house look: an
  off-white topbar (`--header:#E2E6E1` light / `#0A0A0A` dark), the Lilly wordmark rendered pure black
  via `brightness(0)` filter in light mode (white/inverted in dark mode via `brightness(0) invert(.92)`),
  and Marc's T-rex "Theo" mark (`theo-dino-mark.png`, embedded as a base64 data-URI, recolored the same
  way via `currentColor`/filter) injected as a button beside Tasks. Any new page or redesigned panel
  should load `assets/theo-brand.js` last (as `category-strategy.html` already does) rather than
  re-implementing topbar chrome locally - it is the single source of truth for the black-on-off-white
  brand system and keeps every page consistent for free.
- **Typography.** Libre Franklin (weights 300-800) for all UI text, Roboto Mono for numeric/mono figures
  (spend $, HHI, percentages), both loaded once via the shared Google Fonts link. Deep-Analysis card
  titles may keep the Georgia-serif big-stat treatment (`.bigstat`) purely for large single numbers
  (e.g. tail-tier counts) as a deliberate, restrained departure from the sans-serif body, not for prose.
- **Color discipline (3-colour rule).** Category-strategy's identity accent is plum (`#5C2B50`,
  tint `#EDDFE9`) on card header bands and the recommended-play callout only. Bold Blue `#0F3A85` is the
  ONLY positive/good/on-track color across every tab (never green, per house rule). Amber/burnt-orange
  (`#C9A227` / `#8A5A00`) means watch/caution/pending-confirmation. Lilly Red is reserved for the app
  brand rule, true critical states, and off-contract/risk figures. New panels (Escalation Triggers,
  Spend Under Contract, Fragmentation Map, ARIA Forecast) must draw only from this existing palette;
  do not introduce a new hue for "forecast" or "escalation" just because they are new panels.
- **Card header pattern.** `.chd` (flex row: icon, title, right-aligned meta caption) on a tinted
  header band, `.cbody` padding 14-16px below. Every new card (Spend Under Contract, Escalation
  Triggers, Fragmentation Map, ARIA Forecast) should use this exact header shape, not a bespoke one.
- **Table style.** `DK.table` / `.mtable` conventions: uppercase 12px tinted column headers, right-
  aligned numeric columns in mono, inline share-bars for percentage columns, colored tier/fit chips
  rather than colored row backgrounds. Apply this to the new vendor/basis columns on the Savings
  Pipeline table rather than inventing a new table skin.
- **Provenance and honesty conventions.** Per-field source badges (`renderProvenance`/`prov()`), the
  `DNA()`/`hideData()` "hidden until data, never a fabricated number" sentinel, and `NEEDS_INPUT` /
  `RESEARCH_PENDING` banners are the load-bearing trust pattern of the whole page and must be applied to
  every ported skill panel (Renewal Decision Matrix, Geographic Distribution, Fragmentation Map, ARIA
  Forecast) exactly as they already gate every existing platform figure - this is the single most
  important thing to carry over, more important than any individual visual.
- **Dark mode.** All new CSS must add tokens under the existing `html[data-theme="dark"]` block
  (additive override only, light stays byte-identical) exactly as the current stylesheet already does
  for every existing panel; verify with real dark-mode screenshots, not just `var()` values, per prior
  house lesson that `getComputedStyle` can misreport CSS custom properties.
- **Spacing and density rhythm.** 18px gaps between major cards, 10-14px internal grid gaps, KPI rows
  always 4 or 5 even columns, chart heights fixed per card type as documented in section 1 - keep every
  new panel's chart height and grid column count inside these existing bands so the page's scan rhythm
  does not break at the seams where old and new panels meet.
