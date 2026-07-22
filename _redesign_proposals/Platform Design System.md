PLATFORM DESIGN SYSTEM: THE THROUGH-LINE FOR EVERY REDESIGNED SKILL DASHBOARD
==============================================================================

Sources read (read-only reference under the platform repo, nothing modified there):
- `assets\theo-tokens.css` - the older canonical Lilly-brand token file (dash-kit's source of truth)
- `assets\theo-color.css` - the AUTHORITATIVE, newer visual-hierarchy + colour-role layer (site-wide)
- `assets\app.css`, `assets\app-shell.css` - the vanilla HTML shell chrome (topbar, rail, buttons, cards)
- `assets\dash-kit.css` + `assets\dash-kit.js` - the self-contained vanilla dashboard kit that already
  reproduces "canonical dashboards" (i.e. skill dashboards) as HTML/SVG, already restyled once from the
  skills' old canon toward the app's look (see its own header comment, quoted below)
- `assets\theo-brand.js` - the header identity injector: Lilly wordmark, "Theo" script wordmark, the
  ambient dino assistant button
- `assets\pv\pv.css` (2013 lines) - the project-view tab/subtab/sub-subtab/table/heatmap patterns
- `react-ui\src\theme\tokens.css` + `components.css` - the React port of the same tokens, extended with
  a spacing scale, type scale and named radii the vanilla app never had
- `react-ui\src\shell\ProjectViewShell.tsx` - the live per-tab palette assignment map
- `react-ui\src\shell\lillyLogo.ts`, `assets\logos-lilly\*.png`, `assets\theo-dino-mark.png` - the actual
  brand marks
- Skill canon: `lilly-brand-assets-1c344a\SKILL.md` and `references\user-manual.md` (the dashboard
  component contract every other skill's inlined JSX imports), spot-checked against
  `_dashboard_previews\category-strategy.html` (rendered colours: `#212121`, `#0F3A85`, `#E4EBF1`, Arial)
- Recon: `scratchpad\review\recon_by_skill.md` and `recon_menu.md`, plus the sibling per-area files
  already written in `scratchpad\redesign\` (Category Strategy, Deal-Negotiate, Landscape, RFx,
  Overview_Documents_Comms, my-work-tasks-drawer) for cross-checking tone and depth


1. PLATFORM (what it does well)
--------------------------------

STRUCTURE, three nested levels, one shell.

- **App shell (site-wide, once).** A 56px sticky topbar + a 58px left icon rail. The topbar carries the
  brand (Lilly wordmark + "Theo" script wordmark), an action cluster (ambient assistant, tasks bell,
  avatar/role switch), nothing else. The rail carries the ~9 site-level destinations (Home/intake,
  Projects, Approvals, Suppliers & spend, Savings, Category strategy, Defender, My work, Team) as icon
  buttons with a hover tooltip; the active one gets a soft pink-tint pill (`.nav.on`). This is the ONE
  navigational decision that lives outside any page.
- **Tab bar (per page/skill).** Underline text-tabs (`.tabs`/`.tab`), never pills, scrolling sideways
  when they overflow rather than wrapping. Example: a project page's tabs are Overview / RFx / Landscape /
  Deal / Documents / Workflow(+Communications). A "deep analysis" style page (category-strategy) instead
  splits into two top tabs (an action workspace + an 11-tab structured report).
- **Subtabs (per tab).** Same underline convention, one level down, e.g. inside Deal: Terms / Pro-forma /
  Negotiate / Renew / Review. Inside Landscape: a 4-subtab shell (Executive Summary + 3 analysis tabs)
  with a nested Supplier Deep Dive.
- **Sub-subtabs (per subtab, when a tertiary mode-switch is needed).** A segmented-pill control, NOT
  another underline row: `.ddtabs`/`.ddtab` renders a grey rounded track with the active choice as a
  raised white segment (`box-shadow:0 1px 5px rgba(0,0,0,.17)`). Used for things like a Deep-Dive's
  Company/Financial/Risk mode switch. This visually demotes tertiary navigation below the tab/subtab
  underline pattern, so a reader never confuses "which level of the hierarchy am I choosing."

PANELS, in every tab body: KPI strip (`.dk-metric`/`.statrow`, usually 4-5 tiles), then `.card` sections
in reading order, each with a small header (`eyebrow` + title, optionally a right-aligned meta/note), a
table or chart, and (when relevant) a `.callout` with a left accent bar for a synthesized read. Nothing
nests card-in-card; a sub-panel inside a card is a shaded `--panel`/`--nested` block, not another
bordered card.

INTERACTION MODEL: click a chip/category/supplier -> the panel below repaints in place (no navigation,
no modal) with a materialized-first, live-overlay-second data path; an inline drawer expands beneath a
table row for a "deep dive" rather than opening a new page; sliders (Pareto tier cutoff, discount-rate,
growth-assumption) recompute a chart live; toggling a play/lever card recomputes a sticky summary panel
instantly. Every proactive action (send, surface-to-savings, start an RFx) routes through a confirm step
that names what changes and what stays a draft - trust framing is structural, not a footnote.

WHY IT READS AS COHERENT:
- **One shared token layer, one shared component vocabulary.** Every page's card/table/chip/tab is built
  from the same handful of CSS classes (`dk-card`, `dk-metric`, `dk-table`, `tpill`, `callout`, `tabs`),
  so a reader's eye never re-learns a shape switching tabs, and a builder never improvises a new card
  style per page.
- **A neutral SHADE ladder carries hierarchy, not colour.** `--bg` (page) < `--surface` (card) <
  `--panel` (sub-block) < `--nested` < `--well` (inset). Depth is legible in grayscale; colour is free to
  mean something else.
- **Colour does a job, not decoration (LOCKED site rule).** At most 3 colours read on any view: a
  primary hue (`--pri`, header bands/card top-rule/leader rings), a secondary hue (`--sec`, comparison
  series), and one constant accent (`--emph`, burnt orange, "this is the standout" - ringed leaders,
  recommended picks) used identically everywhere. Semantic tones (warn/info/danger/ok) are a SEPARATE,
  fixed 4-colour vocabulary layered on top and never reused as categorical/chart colour. Lilly Red is
  reserved for the brand header and true danger/blocker states - never decorative, never a 6th "chart
  colour."
- **Each tab/subtab gets ONE identity pair via a `.pal-*` class**, not a bespoke palette per page. Only 5
  pairs exist site-wide (`pal-plum-teal`, `pal-navy-teal`, `pal-burgundy-navy`, `pal-green-navy`,
  `pal-graphite-plum`) and tabs share them by family (Overview=plum-teal, Landscape+Documents=navy-teal,
  Workflow+Deal/Terms=graphite-plum, Deal(commercial)=green-navy, RFx+Communications=burgundy-navy, per
  `ProjectViewShell.tsx`). Variety without chaos: a handful of hues, reused deliberately.
- **Hierarchy via type weight and one rule, not boxes-in-boxes.** Card titles ~13-19px/700-800 weight,
  body 12-14px, captions/meta 10-11px muted, numbers in Roboto Mono with tabular figures. A single
  coloured tick or top-rule (in the view's `--pri-tx`) is the loudest thing on a card; nothing else
  competes.
- **Density is even and predictable.** KPI strips are always 4-5 tiles (`repeat(auto-fit,minmax(180px,1fr))`
  so they never orphan a lone card into its own row); tables share one row height, right-aligned numeric
  columns, hairline row dividers, a light zebra past a few rows; chart heights are fixed per chart type
  (KPI mini ~180-230px, Pareto ~320px) so scanning down a long page has a steady rhythm.
- **Honesty is a rendered state, not a caveat in prose.** A `StateBanner`-equivalent (`NEEDS_INPUT` /
  `RESEARCH_PENDING` / `NOT_APPLICABLE`) simply HIDES a figure with no source rather than inventing one;
  a data-basis chip strip states coverage % and flagged/disqualified counts; a Research Log ties every
  claim to a source + as-of date + confidence. This pattern is native to the platform, not bolted on.
- **Dark mode is additive, not inverted.** Every token above is redefined for `html[data-theme="dark"]`
  with hand-tuned values (near-black canvas #1C1C1C, "solid" hue = mid-dark reading as a frame, not a
  naive photo-negative), so a `.pal-*` pairing works unchanged in both modes.


2. SKILL DASHBOARD (current)
------------------------------

CANON (documented verbatim in `lilly-brand-assets-1c344a/SKILL.md` and `references/user-manual.md`,
confirmed by inspecting the rendered colours in `_dashboard_previews/category-strategy.html`):
"Dark header bar (#212121) with red rule (#E1251B), Georgia serif titles, Arial body text, Lilly Red for
table headers and accents, Stone (#E4EBF1) for card backgrounds." Chart palette is a fixed 6-colour array
`PAL = [R, BLU, BRN, #F58E7D, #FFC709, #99BFE5]` reused as categorical series colour across every chart in
every skill. The component vocabulary every skill's inlined JSX imports is small and consistent:
`Metric` (KPI card), `Card`, `Pillar` (accent-bordered callout), `SevPill`/`PrioPill` (severity/priority
chips), `StateBanner` (NEEDS_INPUT/RESEARCH_PENDING/NOT_APPLICABLE), `STable` (sortable+searchable table),
`ScoreCell`/`PctCell` (colour-coded cells), a shared `Tip` tooltip, and a `Layout Shell` (header+tabnav+
footer).

GENUINELY WORTH RETAINING (the platform, at the level of a generic through-line, does not ship these as
a codified CONTRACT the way the skill kit does):

- **A disciplined, named component contract with a fixed function signature per shape.** `Metric({label,
  value, sub, accent, warn, good})`, `StateBanner({kind, msg})`, `STable({columns, rows})` etc. are
  documented once and reused by all 26 skills verbatim. This is MORE portable than the platform's own
  vanilla kit: `dash-kit.js` (`DK.metric`, `DK.card`, `DK.pillar`, `DK.banner`, `DK.sevPill`, `DK.table`)
  is, shape-for-shape, the SAME component set under different names - meaning a reskin (section 3) is a
  rename + token swap, not a rebuild.
- **The honesty vocabulary is already first-class in the skill kit too** (`StateBanner` kinds, `ScoreCell`
  data-basis colouring), so it is not something the merge needs to invent - it needs to be carried over
  and unified with the platform's `.callout`/data-basis-chip conventions, not dropped.
- **A wider chart repertoire than `dash-kit.js` currently ships.** The skills use 2x2 quadrant scatters
  (Kraljic, renewal-decision-matrix), fit/risk heatmaps (vendor x requirement, vendor x risk-dimension),
  tornado charts (should-cost sensitivity), and normalized cross-supplier pricing bands (ZOPA). `dash-kit.js`
  today only has `vbar`, `hbar`, `pareto`, `scatter` (bubble, used for Kraljic-shaped plots already) - the
  quadrant-with-named-regions, heatmap-cell-ramp, and tornado shapes are gaps the platform needs FROM the
  skills, confirmed independently by the recon pass (Segmentation board, Requirements-fit heatmap, Risk
  heatmap, Sensitivity tornado, Kraljic 2x2 are all flagged "strong").
- **Deterministic scoring math shown next to its verdict** (e.g. `riskTier()` = likelihood x impact,
  visible as a Score column beside the Tier chip). The platform's live Risk Register shows the chip
  without the number; the skill's "show your work" habit is worth keeping everywhere a chip implies a
  computation.
- **Analytical density and breadth per tab** (Pareto tiers with a live cutoff slider, Porter's Five
  Forces, requirement-level MoSCoW+confidence extraction, pricing "not submitted" honesty) - genuinely
  more procurement-analyst content per skill than the platform's demo tabs currently populate. This is
  the actual VALUE the redesign must not lose while reskinning.

WEAK / INCOHERENT vs the platform (do not carry these forward):
- **Two competing type systems on one page.** Georgia serif for titles/big numbers next to Arial body
  reads as two different documents stapled together; the platform uses one family (Libre Franklin) at
  different weights for the same job, which is calmer and matches how the rest of Theo looks.
- **A heavy dark header (#212121) competes with the content for attention** and does not match the app
  shell it will be opened inside of (Theo's topbar is off-white/black, not a dark charcoal band) -
  opening a skill dashboard next to a Theo page currently looks like two different products.
- **Flat two-tone surface, no depth ladder.** Card fill (`#E4EBF1` Stone) has no `--panel`/`--nested`/
  `--well` step below it, so a dashboard that needs a sub-block inside a card has nowhere calm to put it
  and reaches for another bordered box instead (boxes-in-boxes), which the platform's ladder avoids.
- **The 6-colour chart palette double-books brand/status colour as categorical colour.** Slot 1 is Lilly
  Red, slot 2 is Bold Blue - the same hues that ALSO mean danger/positive elsewhere on the same page, so
  a chart legend can accidentally read as a status signal it does not intend. The platform's separation
  (entity colours vs semantic tones vs hue-pair identity, three different jobs, never conflated) is more
  disciplined and should replace this.
- **No shade-consistent dark mode.** None of the skill dashboards define a dark palette; every design
  choice (contrast, tint strength) was made assuming a permanently light page.
- **No app identity at all.** No Lilly wordmark, no "Theo" wordmark, no ambient assistant entry point, no
  left rail - each dashboard is visually a standalone artifact, not a page that belongs to Theo. This is
  the single biggest driver of "the platform looks more coherent": it looks like ONE product; the skill
  dashboards look like 26 different one-off exports.
- **Tab bar look is reinvented per skill** (styling, spacing and active-state treatment vary slightly
  skill to skill because each is its own inlined JSX) rather than drawing from one shared tab component.
- **Radii, spacing and shadow values are raw px literals scattered through each skill's JSX**, not a
  shared scale - so a 12px gap in one skill is a 10px or 14px gap in the next for no reason.


3. NEWEST VERSION (the proposal)
----------------------------------

PRINCIPLE: reskin, don't rebuild. The skill kit's component CONTRACT (section 2) already matches the
platform's component SHAPES (section 1) one-for-one. The merge is (a) swap the token values under both
kits to the one canonical set below, (b) swap the skill kit's literal-colour habits (Georgia, dark header,
6-colour chart palette) for the platform's role-token habits, (c) add the platform's header identity and
neutral shade ladder, (d) port forward the skill kit's honesty vocabulary and wider chart repertoire INTO
the shared kit so every dashboard gains them, not just the ones that already had them.

3.1 THE UNIVERSAL SKILL-DASHBOARD SHELL (every redesigned skill dashboard uses this outer frame; the
per-skill tab/panel content is specified in the sibling files in this folder)

```
+---------------------------------------------------------------------------------+
| TOPBAR (56px, sticky, --pv-header bg)                                           |
|  [Lilly wordmark, black] | [Theo, Sacramento script]   ...   [dino][tasks][avatar]|
+---------------------------------------------------------------------------------+
| dash-back breadcrumb (optional, only when opened from a project context)        |
+---------------------------------------------------------------------------------+
| DASHBOARD HEADER (dk-header: 4px --pri rule, eyebrow, title, right-aligned meta) |
+---------------------------------------------------------------------------------+
| TAB BAR (underline, .tabs/.tab, scroll sideways)                                |
+---------------------------------------------------------------------------------+
| BODY (max-width 1280px, centered, --bg canvas)                                  |
|   KPI STRIP (4-5 .dk-metric tiles, auto-fit)                                    |
|   [ SUBTAB BAR if this tab has one, underline, one level down ]                 |
|     [ SUB-SUBTAB segmented pill if a tertiary mode-switch exists ]              |
|   CARD SECTIONS in reading order:                                               |
|     - synthesis/verdict callout first when the tab has a "so what" (recommend,  |
|       verdict, risk read) - .callout tone-appropriate, left accent bar          |
|     - then tables/charts/heatmaps, each its own .dk-card, never nested          |
|     - StateBanner where a figure has no source, instead of a fabricated number |
|   DATA-BASIS FOOTER STRIP (coverage %, confidence, as-of date) on any tab that  |
|     synthesizes or scores something                                            |
+---------------------------------------------------------------------------------+
| FOOTER (dk-footer: light band, generation/version meta)                        |
+---------------------------------------------------------------------------------+
```

Skill dashboards opened as a Theo skill/tab do NOT reproduce the left icon rail (that is site-level
navigation, out of scope for a single skill's surface) - only the topbar + dashboard header + tabs,
consistent with the "one-pane" home=intake/build-native principle already locked for Theo.

3.2 COMPONENT RESKIN MAP (old skill-kit name -> shared kit class, values from section 4)

| Skill kit (JSX)         | Platform vanilla class      | Platform React class   | Change applied |
|--------------------------|------------------------------|--------------------------|----------------|
| `Metric`                 | `.dk-metric` / `.dk-metric-*`| `.tcard` + KPI layout    | Georgia->Libre Franklin, Stone->white surface, tick colour Red-everywhere -> `--pri-tx` per view |
| `Card`                   | `.dk-card` / `.dk-card-title`| `.tcard.tcard--pad`     | same, + neutral ladder available for nested blocks (`--panel`/`--nested`) |
| `Pillar`                 | `.dk-pillar`                 | `.tcard.tcard--accent`  | accent border-top now `--pri-tx`, not a fixed mut/red |
| `SevPill` / `PrioPill`   | `.dk-sev`                    | `.tpill--{ok,warn,info,danger,neutral}` | collapse both onto the ONE 4-tone semantic vocabulary, never a 5th ad hoc hue |
| `StateBanner`            | `.dk-banner`                 | `.callout.tone-*`       | same behaviour (hide, don't fabricate), reskinned to the shared callout look with left accent bar |
| `STable`                 | `.dk-table*`                 | `DataTable` component    | Arial->Libre Franklin, add optional `--pri`/`--pri-fg` coloured header band for "signature" tables (participation, coverage heatmap) |
| `ScoreCell` / `PctCell`  | inline in `.dk-table td`     | `DataTable` cell renderer| keep colour-coded logic, source colours from semantic tones not raw hex |
| `Tip` (chart tooltip)    | `.dk-tip` (DOM, shared)      | `Tooltip.css`            | one tooltip component for every chart everywhere, not reimplemented per skill |
| chart `PAL[6]`           | `dash-kit.js` `vbar/hbar/pareto/scatter` | n/a (SVG)   | categorical series -> `--ent-1..5`, NOT brand/status colours; extend with heatmap ramp + quadrant + tornado helpers (net-new, see 3.4) |
| Layout Shell             | `.dk-header`/`.dk-tabs`/`.dk-footer` + topbar | `AppShell.css`/`TopBar.css` | add Lilly + Theo wordmark, drop the dark #212121 band |

3.3 A DELIBERATE RECONCILIATION THE PLATFORM ITSELF HAS NOT MADE YET (call this out explicitly, don't
silently pick one): `dash-kit.css` (the vanilla kit already used to reproduce skill dashboards) still
hard-codes Lilly Red as the universal card tick/eyebrow colour (`--dk-r` on `.dk-card-tick`,
`.dk-eyebrow`, `.dk-metric.dk-accent`) - a leftover from BEFORE `theo-color.css`'s per-view `.pal-*`
role-token system and its LOCKED owner rule that "Lilly Red stays scarce: reserved for the header and
DANGER only. Never decorative." `theo-color.css` is the newer, documented, "AUTHORITATIVE" layer (its own
header says so) and is what `pv.css`'s tab bodies actually key off (`.tabbody .card{border-top:3px solid
var(--pri-tx)}`). Recommendation for every redesigned skill dashboard: use `dash-kit.js`/`dash-kit.css`
for its MARKUP/geometry (table sort+search, chart primitives, card scaffolding) but repoint every tick/
eyebrow/accent colour from `--dk-r` to the view's `--pri-tx`, exactly as `pv.css` already does for
project-view cards. Do not propagate the older red-everywhere habit into 26 newly reskinned dashboards.

Similarly, reconcile the "no green" doctrine: `theo-tokens.css` (older) states "THE NO-GREEN RULE...
positive/good = Bold Blue... There is NO green token anywhere in Theo," while `theo-color.css` and
`react-ui/theme/tokens.css` (both newer, and `theo-color.css` is explicitly marked authoritative) state
"Green IS allowed. Success/done = green (--ok-*). Just never cluster a lot of green and red together."
`react-ui/theme/tokens.css` even ships a `.pal-dashboard` escape hatch (`--ok-bg:var(--info-bg)`) for any
context that still wants to stay blue-only. Recommendation: redesigned skill dashboards follow the NEWER
rule (green allowed for `ok`/done, sparingly, never beside red) since that is what the current React
token layer and `theo-color.css` actually ship; keep Lilly Red scarce regardless of which doctrine a given
page follows.

3.4 NET-NEW additions the merge should make to the SHARED kit (not skill-specific, benefits all 26):
- **Heatmap cell primitive** (`DK.heatCell(value, rampTone)`): a pill (`.hcell`, matches `pv.css`'s
  existing Landscape/RFx heatmap pill) with an inline computed background ramp (blue ramp = fit, red ramp
  = risk), optional leader-ring (`box-shadow: inset 0 0 0 1.5px #fff, 0 0 0 2px var(--pri)`), and a
  field-average row/column convention. Currently hand-built per skill/tab; promote to `dash-kit.js`.
- **Quadrant/2x2 primitive** (`DK.quadrant`): named-region scatter (Kraljic, renewal-decision-matrix,
  segmentation board all want the same shape: two axes, four labeled quadrants, bubble sized by a third
  value, a ringed "you are here"/incumbent marker, dashed-out disqualified markers).
- **Tornado primitive** (`DK.tornado`): sorted, centered horizontal bars for sensitivity analysis
  (should-cost, pro-forma).
- **Data-basis / confidence chip strip** as a first-class `dash-kit` component (currently bespoke per
  skill): coverage %, flagged/disqualified counts, confidence pill, "as of" date, in one reusable row.
- **Research Log table** (`claim | source | as-of | confidence`) as a shared component so every
  web/ARIA-grounded skill cites the same way, not a bespoke table per skill.
- **Ambient provenance mark**: an inline `currentColor` dino SVG (id `theo-hero`, already defined in
  `theo-brand.js`) available for a single sparse "Theo generated this" or empty-state illustration -
  never multiplied as page decoration, never the literal `theo-dino-mark.png` PNG (that PNG is reserved
  for the header assistant button, see section 4).

3.5 PALETTE ASSIGNMENT for the 26 skills (reuse the 5 existing `.pal-*` pairs by family, matching how
`ProjectViewShell.tsx` already shares pairs across related tabs - do not invent a 6th pair per skill):

| Family | Skills | Pair |
|---|---|---|
| Strategy / spend / portfolio | category-strategy, market-rate-benchmarking, should-cost-builder, pro-forma-builder | `pal-plum-teal` |
| Sourcing landscape / evaluation | supplier-landscape, supplier-deep-dive, evaluation-engine, rfp-engine, rfp-response-analysis, rfp-case-manager | `pal-navy-teal` |
| Deal / commercial / negotiation | commercial-negotiation-prep, legal-negotiation-prep, negotiation-simulator, negotiation-playbook-learning, decision-deck | `pal-green-navy` |
| Contracts / legal / governance | lilly-contract-review, process-navigator, timeline-builder, workflow-map, sole-source-challenge, invoice-rate-card-auditor | `pal-graphite-plum` |
| Relationship / personal / comms | theos-field-guide, meeting-prep-brief, executive-summary-package, procurement-help-desk, deal-room, comment-cleanup, scope-sow-architect, procurement-options-analysis | `pal-burgundy-navy` |

Each skill still gets one constant `--emph` (burnt orange) for its own "the standout" marker (leader
supplier, recommended play, advisory pick) - identical meaning everywhere, per the LOCKED rule.


4. DESIGN NOTES (carry over verbatim into every redesigned dashboard)
------------------------------------------------------------------------

WORDMARKS AND MASCOT
- **Lilly wordmark**: the corporate script "Lilly" lockup (`assets/logos-lilly/Lilly-AMC-Lockup-H-Small-
  Black-RGB.png`, script "Lilly" + bold caps "A MEDICINE COMPANY"), rendered at 23px height, filtered
  `brightness(0)` on the light header (renders black) and `none` on the dark header (already white/keyed
  for dark). Always sits at the far left of the topbar.
- **"Theo" wordmark**: set in the **Sacramento** cursive/script webfont, 27px, weight 400, colour =
  `--topbar-fg` (black on light, off-white on dark, i.e. it matches body text colour, it is NOT a brand-
  colour word), positioned immediately right of the Lilly logo behind a 1px vertical divider
  (`border-left`) with 13-14px of gap. Never use Sacramento for anything except this one wordmark - not
  section titles, not callouts, not emphasis text.
- **theo-dino-mark.png**: a simple, monochrome, rounded-line-art friendly T-rex glyph (single flat colour,
  no gradient, no detail beyond a dot eye and a smile). It is tinted via CSS `filter` (`brightness(0)` for
  black, `brightness(0) invert(1)` for white) rather than shipped in multiple colourways. Its ONLY
  sanctioned use is the circular 34x34 "Ambient Theo Assistant" launcher button in the topbar action
  cluster (hidden on project pages and the home/intake page, which have their own assistant entry point).
  Do not scatter the dino across dashboard cards, empty states, or footers as decoration - if a dashboard
  wants a mascot touch, use the inline `currentColor` SVG dino (`id="theo-hero"`, already defined once in
  `theo-brand.js`) sparingly, tinted to the view's `--pri`, for a single "Theo generated this" mark or an
  empty-state illustration, never repeated.

PALETTE (canonical values; use the newest source when files disagree - `theo-color.css` /
`react-ui/theme/tokens.css` win over the older `theo-tokens.css` / `dash-kit.css` per section 3.3)

| Token | Light | Dark | Job |
|---|---|---|---|
| `--bg` | `#E2E6E1` | `#1C1C1C` | page canvas (off-white, warm-neutral, not pure white) |
| `--surface` | `#FFFFFF` | `#262626` | card / primary panel |
| `--panel` | `#F5F2ED` | `#2E2E2E` | sub-panel inside a card (one step down) |
| `--nested` | `#EDEAE3` | `#343434` | nested block (two steps down) |
| `--well` | `#E4E0D8` | `#3B3B3B` | inset / deepest well |
| `--line` / `--line2` | `#E3DED6` / `#D3CDC3` | `#333333` / `#454545` | hairline / stronger divider |
| `--ink` / `--ink2` | `#1A1A1A` / `#3A362F` | `#ECECEC` / `#C9C6C0` | primary / secondary text |
| `--mut` / `--mut2` | `#505A64` / `#564F48` | `#B0B0B0` / `#8A8A8A` | muted text (AA-safe, never a light gray on a light surface) |
| `--red` / `--red-d` | `#E1251B` / `#B41E16` | `#F0574C` / `#D2453A` | brand rule + true danger ONLY, never decorative |
| `--warn-bg/-fg/-bar` | `#FBF1DA` / `#8A5A00` / `#B45309` | dark-tuned | needs-your-action |
| `--info-bg/-fg/-bar` | `#E8EEF6` / `#0F3A85` / `#0F3A85` | dark-tuned | notable / recommendation |
| `--danger-bg/-fg/-bar` | `#FBE7E3` / `#B41E16` / `#E1251B` | dark-tuned | hard gate / blocker / late |
| `--ok-bg/-fg` | `#E4F1E6` / `#2E7D46` | dark-tuned | cleared / done (green allowed, see 3.3) |
| `--ent-1..5` | navy/violet/copper/teal/gold | brightened equivalents | categorical/entity differentiation ONLY (suppliers, evaluators) - never status meaning |
| `--pri`/`--sec`/`--emph` | set by `.pal-*` (5 pairs) + constant burnt-orange `--emph:#C15E19` | dark-tuned per pair | per-view identity (header bands, ticks, leader rings) + the one constant "standout" ring |

TYPOGRAPHY
- Sans: **Libre Franklin** (`--font-sans`), weights 300-800. Titles/section headers 700-800 weight with
  slightly tight tracking (-0.01 to -0.02em). Body 400-600. This is the ONE family for everything except
  the Theo wordmark - do not mix in Georgia or any other serif for dashboard titles.
  - Skill-dashboard title scale should match `dash-kit`'s in-app scale (`.dk-title` 19px/800), not the
    app-chrome page-hero scale (30px `h1`) - a skill dashboard is a section inside Theo, not its own
    hero page.
  - Body 13-14px, meta/caption 10-12px, never smaller than an 11px floor (`--fz-floor`) for anything a
    user must read.
- Mono: **Roboto Mono** (`--font-mono`) for all numbers (tabular-nums), table headers when uppercase-
  tracked, eyebrows, and mono-flavoured labels/badges. Uppercase tracking 0.05-0.12em.
- Script: **Sacramento**, reserved exclusively for the "Theo" wordmark (see above).
- (Newsreader exists in the vendored font set but is used only on the login page hero, not dashboards -
  do not introduce it into skill dashboards.)

SPACING / RADII / SHADOW (from `react-ui/theme/tokens.css`, the one scale that formalizes what the
vanilla app only had as scattered literals - adopt this scale in every redesigned dashboard instead of
picking new px values per skill)
- Spacing: `--sp-1..8` = 4, 6, 8, 12, 16, 20, 24, 32px.
- Radii: `--r-sm` 6px (icon buttons), `--r-md` 10px (inputs/small controls), `--r-lg` 14px (cards - use
  this, not the app-chrome's 20px, which is for top-level nav cards not dashboard cards), `--r-pill` 30px
  (buttons, chips, status pills).
- Card border: 1px solid `--line`; optional 3px `border-top` in `--pri-tx` for a card that wants the
  view's identity colour (headline KPI card, the tab's primary chart).
- Shadow: `--shadow-card: 0 1px 2px rgba(38,30,20,.06), 0 2px 6px rgba(38,30,20,.07)` light;
  `0 1px 2px rgba(0,0,0,.5), 0 2px 6px rgba(0,0,0,.4)` dark. One shadow depth for cards; a deeper
  `--shadow-pop` only for floating popovers/menus.

TABLE / CHART STYLING
- Tables: header row muted, uppercase, 10-11px Roboto Mono, sort-active column tinted `--pri-tx`; body
  rows 12-13px Libre Franklin, numeric columns right-aligned and tabular-nums, hairline row dividers,
  light `--panel` zebra only past a handful of rows (never colour-zebra); an optional coloured header/
  footer BAND in `--pri`/`--pri-fg` for one "signature" table per tab (participation, coverage) - not
  every table.
- Heatmap cells: pill shape (`.hcell`), inline-computed ramp background (blue ramp = fit/positive scales,
  red ramp = risk scales), leader cell gets an inset-white + `--pri` ring, never a rainbow of ad hoc hues.
- Charts: inline SVG, `--line`-coloured grid/axis, 10px muted tick labels, one shared DOM tooltip
  (`.dk-tip`) for every chart on the page, categorical series coloured from `--ent-1..5` (never brand/
  status hues), bar-hover opacity dip (`.dk-bar:hover{opacity:.82}`) as the only hover affordance needed.
- Status vocabulary: exactly 5 pill tones (`neutral`/`ok`/`warn`/`info`/`danger`) plus the 4 matching
  `.callout` tones - every skill's severity/priority chip (Critical/High/Medium/Low, Gating/High/Medium,
  Fired/Clear, etc.) maps onto these 4-5, never invents a 6th hue for "just this skill's" severity scale.

DARK MODE: every token above has a defined dark value (hand-tuned, not inverted); a redesigned dashboard
must be checked in both `html[data-theme="light"]` and `[data-theme="dark"]` before being called done,
since `getComputedStyle` on a `var()` background can look fine in one mode and wrong in the other without
a real render check.
