# Theo Dashboards — Restyle Protocol

A CSS-only restyle to be applied across all 18 dashboard pages (rfx · deal · landscape).
This document is the specification. `RFx Overview.dc.html` in this folder is the worked
reference: every rule below is visible in it.

---

## 0. Scope and non-goals

**In scope:** colour, tint depth, panel/header/section treatment, type scale, table
chrome, tab chrome, equal-height rows, inner scroll.

**This protocol does not design your page.** Which panels exist, what goes in them, what
order they appear in, and how the grid is arranged are yours. The protocol governs how a
panel *looks*, not where it sits. Two rules do reach into layout, and only these two:

- **Equal-height rows** (§4.1) — columns in a row match height. This does not move any
  panel; it changes how slack is distributed inside a row you already designed.
- **Inner scroll** (§4.2) — overflow goes inside the panel body instead of growing the
  page. Again, no panel moves.

Section dividers (§3.5) add a 9px label line above a group of panels you already have.
They group; they do not reorder. If a divider would force you to reorder panels to make
the bands read, keep your order and rename the band.

**Out of scope — do not touch:**

- Markup. Per the source README, markup changes have to come back through the renderers
  or the next build overwrites them. Every rule here is expressible as CSS.
- The app shell: topbar (`.topbar`, `#E2E6E1`, Lilly logo + Sacramento "Theo" mark +
  avatar), page background, `.sa-main` padding/max-width, `.theo-foot`.
- Data, copy, or the meaning of any figure.

**Where the CSS lives** (from the source README):

| Pages | Stylesheets |
|---|---|
| `rfx/*` | `_rfx_build/assets/pv/*.css` (+ `pv-09-rfx.js` for inline style) |
| `deal/*` | `deal-room-1c344a/dashboard/_parts/*` |
| `landscape/*` | `supplier-landscape-1c344a/dashboard/assets/pv/*` |

Inline `style="…"` attributes written by the renderers are the one exception: where a
rule below cannot win against an inline style, fix it in the renderer that emits it
(`pv-09-rfx.js` and equivalents), not by adding `!important` in CSS.

---

## 1. The colour system in one paragraph

Three structural colours and nothing else: **plum** is primary and marks structure,
**teal** is secondary and marks favourable reads, **burnt orange** is emphasis and marks
attention. Neutrals are the canvas. A fourth family — muted mid-century hues — exists
**only** to tell suppliers apart, never to say anything is good or bad. At most three
colours in a view; shades of those three do not count against the limit.

### 1.1 Tokens — redefine these first

Most of this restyle lands by changing token values. Do this before touching any
component rule.

```css
:root{
  /* structural hues — unchanged */
  --plum:#5C2B50;      --plum-l:#7A3C6B;   --plum-d:#3E1C36;
  --teal-d:#2F6E6B;    --teal-l:#4A8F8B;   --teal-deep:#1F4A48;
  --emph:#C15E19;      --emph-tx:#A2500F;

  /* ROLE TINTS — CHANGED. These were ~9-12% over surface and were invisible.
     New floor: no role tint lighter than ~18% over white. Never go back. */
  --plum-t:#C6B5C2;          /* was #EDDFE9 — table headers, chips */
  --teal-t:#B6CCCB;          /* was #DCEBE9 */
  --emph-t:#ECCFBA;          /* was #F6DDC9 */
  --plum-band:#DDCFDA;       /* panel header gradient start */
  --teal-band:#CFE0DE;
  --emph-band:#ECCFBA;
  --plum-rule:#B99CB0;       /* panel header bottom rule */
  --teal-rule:#9FBFBC;
  --emph-rule:#C68A55;

  /* neutrals */
  --surface:#FFFFFF;
  --well:#F4F1EC;            /* every nested block inside a panel */
  --rule:#E2DCD4;
  --line2:#CECCC7;           /* panel border */
  --mut:#5B534C;
  --ink:#1E1A17;
  --tab-idle:#6E6862;

  /* text on solid fills */
  --pri-fg:#F3ECF1;          /* on plum */
  --sec-fg:#EAF4F2;          /* on teal */

  --shadow-card:0 1px 2px rgba(38,30,20,.06),0 2px 6px rgba(38,30,20,.07);
}
```

**Hard floor:** a role tint may not be lighter than the values above. Anything paler
disappears on a projector — the same failure `foundations/color.html` already warns
about. If a tint needs to be quieter, go *neutral*, not paler.

**Still banned:** pale washes as panel backgrounds below the floor, `#FBEFC9` above all,
and any amber/light-orange shade — burnt orange is used at `--emph` or `--emph-t`, and
nothing between.

### 1.2 Supplier identity hues (mid-century, sparing)

```css
:root{
  --sup-1:#7A2436;   /* burgundy */
  --sup-2:#123C82;   /* navy */
  --sup-3:#5A6B33;   /* olive */
  --sup-4:#8A6A1F;   /* ochre  — landscape only, 4+ suppliers */
  --sup-5:#4A5A6B;   /* slate  — landscape only, 5+ suppliers */
}
```

Rules:

1. **Identity only.** A supplier hue may appear on: a series dot in a table header, a
   3px row spine, a rank badge, a chart series, a bar fill. It may never appear on a
   status chip, an alert, a gate, or a panel header.
2. **Assign by stable order** (the invited-bidder order the renderer already uses), so
   the same supplier keeps the same hue on every tab of a dashboard.
3. **Never orange-adjacent.** `--sup-4` ochre sits next to burnt orange; use it only
   when there are 4+ suppliers and never in the same panel as an emphasis element.
4. Three or fewer suppliers: use `--sup-1..3` only.

### 1.3 What each colour is allowed to mean

| Colour | Means | Never used for |
|---|---|---|
| Plum | Structure: panel identity, section rules, table headers, primary bars | Status |
| Teal | Favourable / settled / complete | Structure on a plum panel |
| Burnt orange | Attention, gate, risk, blocked, outstanding | Decoration, identity, a series |
| Supplier hue | Which supplier | Whether something is good |
| Neutral | Everything else | — |

There is no green, red, yellow or amber anywhere.

---

## 2. Type

Six sizes, per `foundations/type.html`. Locked ladder for these dashboards:

| Token | px / weight | Used for |
|---|---|---|
| `--fz-display` | 28 / 800 | Page `h1` only |
| `--fz-head` | 20 / 700 | Reserved. Not used in the restyle — see below |
| `--fz-title` | 13 / 800, `letter-spacing:.07em`, UPPERCASE | Panel header title (`.ct`) |
| `--fz-body` | 13 / 400 | Body copy, table cells, fact values (600 when a value) |
| `--fz-meta` | 11 / 400 | Captions, provenance, sub-labels, chart labels |
| `--fz-label` | 9 / 700, `letter-spacing:.08em`, UPPERCASE, mono | Eyebrows, section dividers, table `th`, chips |

Figures (KPI values, scores, percentages, counts) are **Roboto Mono 20 / 700**.
Prose is Libre Franklin. Sacramento is the Theo wordmark only.

The 20px step is deliberately unused for panel titles: hierarchy comes from *weight and
case*, not size, so a dense tab does not turn into a ladder of headings. Floors still
apply — nothing below 9px, and chart/SVG text floors at 11px.

---

## 3. Component recipes

### 3.1 Panel (`.card`, `.sa-card`, `.statusblk`)

```css
.sa-card,.card,.statusblk{
  background:var(--surface);
  border:1px solid var(--line2);
  border-left:3px solid var(--plum);      /* role spine, full height */
  border-radius:8px;
  overflow:hidden;
  box-shadow:var(--shadow-card);
  display:flex; flex-direction:column; min-width:0;
}
.sa-card.accent-teal{border-left-color:var(--teal-d)}
.sa-card.accent-emph{border-left-color:var(--emph)}
```

If the existing sheet draws the spine with `.sa-card::before`, keep that mechanism —
it is equivalent. **Remove** the old `border-top:3px solid var(--pri-tx)` rule on
`.tabbody .card`; the spine replaces it, and having both double-frames every panel.

### 3.2 Panel header (`.card-hd`) — the default

```css
.card-hd{
  display:flex; align-items:center; gap:9px;
  padding:12px 15px;
  background:linear-gradient(180deg,var(--plum-band),var(--surface));
  border-bottom:1px solid var(--plum-rule);
  flex:none;
}
.card-hd .ch-ic{width:17px;height:17px;flex:none;color:var(--plum)}
.card-hd .ch-ic svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:2}
.card-hd .ct{font-size:13px;font-weight:800;letter-spacing:.07em;
             text-transform:uppercase;color:var(--plum);flex:1}
.card-hd .cs{font-size:11px;color:var(--mut);font-weight:400}  /* right-hand subtitle */

.sa-card.accent-teal .card-hd{
  background:linear-gradient(180deg,var(--teal-band),var(--surface));
  border-bottom-color:var(--teal-rule);
}
.sa-card.accent-teal .card-hd .ch-ic,
.sa-card.accent-teal .card-hd .ct{color:var(--teal-d)}
```

Every panel gets an icon. Use the existing `.ch-ic` sprite in
`deal/deal-brief.html` — do not draw new ones. Known glyphs (all `viewBox="0 0 24 24"`,
stroke, no fill):

| Meaning | Path |
|---|---|
| Document / snapshot | `M7 3h7l4 4v14H7z` + `M14 3v4h4` + `M10 12h6M10 15h6M10 18h3` |
| Clock / state of play | `circle 12 12 r9` + `M12 7v5l3 2` |
| Calendar / next steps | `rect 3 4 18 14 rx2` + `M3 9h18M8 21h8M12 18v3` |
| Shield / risk, security | `M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z` |
| Flag / issues, ranking | `M5 21V4M5 4h11l-2 4 2 4H5` |
| Scales / commercial, evaluation | `M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.3-5 3.2c0 4.3 10 2.2 10 6.6 0 1.9-2.2 3.2-5 3.2s-5-1.1-5-3` |
| Warning / evidence gaps | `M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.4 3.9a2 2 0 00-3.4 0z` + `M12 9v4M12 17h.01` |
| Register / list | `M4 6h16M4 12h16M4 18h10` + `circle 19 18 r2` |
| Balance / conflicts | `M12 3v18` + `M6 7h12` + `M6 7l-3 6h6z` + `M18 7l-3 6h6z` + `M8 21h8` |

### 3.3 Panel header — emphasis variant

A panel is `accent-emph` when *its own subject* is at risk, blocked, or gated. Burnt
orange is now allowed as a tint at the standard depth:

```css
.sa-card.accent-emph .card-hd{
  background:linear-gradient(180deg,var(--emph-band),var(--surface));
  border-bottom-color:var(--emph-rule);
}
.sa-card.accent-emph .card-hd .ch-ic,
.sa-card.accent-emph .card-hd .ct{color:var(--emph-tx)}
```

At most **one** emphasis panel per tab. If two panels qualify, the second becomes a
plum panel with an orange alert block inside it.

### 3.4 Panel header — solid variant (`.card-hd.solid`), one per tab

```css
.card-hd.solid{background:var(--plum);border-bottom:none}
.card-hd.solid .ch-ic,.card-hd.solid .ct{color:var(--pri-fg)}
.card-hd.solid .cs{color:#E2CFDD}
```

Rules: **plum only, never teal, never orange, exactly one per tab, and only on the
panel that answers the tab's headline question** (RFx Overview → Advisory ranking;
Deal Brief → Recommendation; Landscape Exec → the ranking or concentration panel). A
tab may also have zero. Two solid headers on one tab is a bug.

### 3.5 Section divider (`.secthd .t`)

The existing RFx rule, kept as-is and promoted to the grouping device across all three
dashboards:

```css
.secthd .t{
  font:700 9px var(--mono); letter-spacing:.02em; text-transform:capitalize;
  color:var(--mut); padding-left:10px; border-left:3px solid var(--plum);
  line-height:1.15;
}
.sect{margin:24px 0 0}
.secthd{margin-bottom:10px}
```

When to use one:

- **4+ panels on a tab → dividers are required.** Group the panels into 2–4 named
  bands. Name the band after the question it answers, not the data it holds
  ("Where The Rfx Stands", "Who Is Ahead", "Evidence On File", "What Happens Next").
- **3 or fewer panels → no dividers.** The panel headers carry it.
- A divider always spans the full content width and sits *above* the row, never inside
  a panel.

### 3.6 Nested blocks — killing the white

Any block inside a panel body — fact cells, roster rows, alert blocks, summary boxes,
detail panes, step cards — sits on `--well` (`#F4F1EC`) with `border-radius:6px`.
White is reserved for the panel surface and for data tables.

```css
.card-bd{padding:13px 15px;flex:1;min-width:0}
.card-bd .kv,.card-bd .ovfact,.card-bd .ovrp,.card-bd .insight{
  background:var(--well);border-radius:6px;padding:8px 10px;
}
```

Alert / callout blocks keep a 3px left bar and take the matching tint:

```css
.alert-emph{border-left:3px solid var(--emph);background:#F2E0D1;border-radius:0 6px 6px 0;padding:9px 12px}
.alert-neutral{border-left:3px solid var(--line2);background:var(--well);border-radius:0 6px 6px 0;padding:9px 12px}
```

### 3.7 Tables

```css
.tabbody table:not(.pvpt) th,.dt th,.mx th{
  background:var(--plum-t); color:var(--plum-d);
  font:700 9px var(--mono); text-transform:uppercase; letter-spacing:.08em;
  padding:7px 10px; text-align:left;
}
.sa-card.accent-teal .dt th{background:var(--teal-t);color:var(--teal-deep)}
.dt td,.mx td{padding:8px 10px;border-bottom:1px solid var(--rule);font-size:13px}
.zebra tbody tr:nth-child(even){background:var(--well)}
```

Numeric columns: `text-align:right`, Roboto Mono 11 / 700, `font-variant-numeric:tabular-nums`.
Supplier columns carry an 8px identity dot before the label:
`<span style="width:8px;height:8px;border-radius:50%;background:var(--sup-N)">`.

### 3.8 Chips

```css
.gate,.tier,.chip{
  font:700 9px var(--mono); text-transform:uppercase; letter-spacing:.06em;
  padding:3px 9px; border-radius:30px; white-space:nowrap;
}
.chip.neutral{background:var(--plum-t);color:var(--plum-d)}
.chip.good{background:var(--teal-t);color:var(--teal-deep)}
.chip.attention{background:var(--emph);color:#FFFFFF}   /* solid, not tinted */
```

`.gate.fail` and every other red/pink chip (`--pink-t`, `--ti-red`, `#C8202E`) is
replaced by `.chip.attention`. There is no red in the system.

### 3.9 Bars and meters

**Length encodes the measurement; colour encodes who.** A bar fill takes the supplier's
identity hue, on a `#E7E3DC` track, 9px tall, `border-radius:5px`. The value beside it
is Roboto Mono 11 / 700 in `--ink`, never coloured. Good/bad is carried by the chip and
the gate line, not by the bar. Single-series meters that are not per-supplier use
`--plum`.

### 3.10 Tabs and subtabs

```css
.tab,.rfxst,.pvsubtab,.ddtab{
  font-family:var(--sans); font-size:13px; font-weight:600;
  color:var(--tab-idle); background:transparent; border:none;
  border-bottom:3px solid transparent; padding:9px 12px; cursor:pointer;
  margin-bottom:-1px; white-space:nowrap;
}
.tab:hover,.rfxst:hover{color:var(--ink)}
.tab.on,.rfxst.on,.pvsubtab.on,.ddtab.on{
  color:var(--ink); font-weight:700; border-bottom-color:var(--ink);
}
.tabs,.rfxstbar{
  display:flex; gap:4px; border-bottom:1px solid var(--line2);
  overflow-x:auto; overflow-y:hidden; scrollbar-width:thin;   /* both, always */
}
```

Medium grey idle, black label + black 3px underline when active — at **every** level:
tabs, subtabs, sub-subtabs. Plum underlines on tabs are removed. Segmented-control
variants (`.dmodes/.dmode`, `.ddtabs/.ddtab`) convert to this underline treatment so
there is one tab idiom in the product.

`overflow-y:hidden` is mandatory on every tab strip: `overflow-x:auto` alone computes
`overflow-y:auto`, and a 1px track/tab height difference then shows a stray vertical
scrollbar.

---

## 4. Layout rules

### 4.1 Equal-height rows

**In any row of panels, the row's columns are equal height.** Where one column holds a
single panel and another holds a stack, the stack's total height equals the single
panel's height.

```css
.row{display:grid;gap:14px;align-items:stretch}     /* never align-items:start */
.row > .col{display:flex;flex-direction:column;gap:14px;min-height:0}
.row > .col > .sa-card{min-height:0}
.row > .col > .sa-card.fill{flex:1}                 /* the one that absorbs slack */
```

In a stacked column, exactly one panel takes `flex:1`; the others are `flex:none`.
Choose the one whose content is most naturally elastic (a roster, a list), not one with
a fixed set of rows.

### 4.2 Inner scroll

A panel never grows the page to fit its content. When content exceeds the row height,
the **panel body** scrolls, not the panel:

```css
.card-bd-scroll{flex:1;min-height:0;overflow-y:auto;scrollbar-width:thin}
```

The header stays pinned (`flex:none`). Never put the scroll on the card itself — it
would clip the header's bottom rule. `min-height:0` on every flex ancestor or the
scroll silently does nothing.

Panel-level scrollers that already exist in the source are part of the design and stay.

### 4.3 Grid

Content column: `.sa-main{padding:28px 40px 70px;max-width:1320px;margin:0 auto}` —
unchanged. Row gap 14px, panel body padding 13px 15px, nested block gap 8-9px,
section divider margin `24px 0 10px`.

---

## 5. Per-tab application order

For each of the 18 pages, in this order:

1. Apply the token block (§1.1) — verify nothing turned invisible.
2. Replace `border-top` accents with the left spine (§3.1).
3. Give every panel a `.card-hd` with an icon, title and role (§3.2). Decide the panel's
   role: plum default, teal for a favourable/settled subject, emph for the one at-risk
   subject.
4. Pick the single solid-header panel, or none (§3.4).
5. Count the panels: 4+ → add section dividers and name the bands (§3.5).
6. Move every nested block onto `--well` (§3.6).
7. Convert tables, chips, bars (§3.7–3.9).
8. Convert tabs and every subtab level (§3.10).
9. Make each row equal-height and move overflow into the panel body (§4).
10. Check the tab against §6.

### Panel counts and expected treatment

| Page | Panels | Dividers | Solid header candidate |
|---|---|---|---|
| `rfx/rfx-overview` | 8 | yes — 4 bands | Advisory ranking |
| `rfx/rfx-scoring` | 5-6 | yes | Scoring matrix |
| `rfx/rfx-analysis` | many, per supplier | yes — one band per supplier | none |
| `rfx/rfx-recommendation` | 4-5 | yes | Recommendation |
| `rfx/rfx-businesscase` | 5-6 | yes | Business case summary |
| `deal/deal-brief` | 8 | yes — 4 bands | Recommendation |
| `deal/deal-contract-map` | 3-4 | borderline | Document relationship map |
| `deal/deal-contract-legal` | 5+ | yes | none |
| `deal/deal-contract-scope` | 4-5 | yes | none |
| `deal/deal-contract-sources` | 3-4 | no | none |
| `deal/deal-commercials-deal` | 5-6 | yes | Commercial headline |
| `deal/deal-commercials-proforma` | 4-5 | yes | none |
| `deal/deal-negotiation` | 5-6 | yes | Negotiation plan |
| `landscape/landscape-exec` | 5-6 | yes | Concentration & leverage |
| `landscape/landscape-deep` | many, per supplier | yes — one band per supplier | none |
| `landscape/landscape-h2h` | 3-4 | no | Head-to-head |
| `landscape/landscape-heatmap` | 2-3 | no | Heatmap |
| `landscape/landscape-risk` | 4-5 | yes | Risk register |

Counts are from the exported snapshots; confirm against the live renderer and adjust.
The rule, not the table, is authoritative: 4+ panels means dividers.

---

## 6. Acceptance checklist — run per tab

- [ ] No role tint lighter than `--plum-t` / `--teal-t` / `--emph-t`.
- [ ] No red, green, yellow, amber, or pale orange anywhere.
- [ ] At most three structural colours in the view; supplier hues used only for identity.
- [ ] Every panel has a spine, a header, an icon and a title; roles are deliberate.
- [ ] Exactly zero or one solid header; it is plum; it is the panel that answers the tab.
- [ ] Exactly zero or one emphasis panel.
- [ ] 4+ panels → section dividers present and named after questions.
- [ ] No nested block sits on white; tables and panel surfaces are the only white.
- [ ] Type is only 9 / 11 / 13 / 20 / 28. No 10, 12, 14, 15, 16, 18.
- [ ] Figures are Roboto Mono; prose is Libre Franklin.
- [ ] Every row of panels is equal height; stacked columns match the single column.
- [ ] Overflow scrolls inside panel bodies; headers stay pinned; page height unchanged.
- [ ] Every tab strip has `overflow-y:hidden`; no stray vertical scrollbar.
- [ ] Idle tabs medium grey; active tab black text + black underline, at every level.
- [ ] Bar colour = supplier identity, never verdict; bar values in ink.
- [ ] Shell untouched: topbar, background, `.sa-main` metrics, footer.
- [ ] Markup unchanged; diff shows CSS only.

---

## 7. Building a NEW dashboard with this system

Everything above is written as a restyle of existing markup. For a page that does not
exist yet, use `theo-dash.css` + `skeleton.html` in this bundle instead — the same rules,
expressed as a working stylesheet and a page you can copy.

`skeleton.html` is a **demonstration of the parts, not a prescribed layout.** Its three
bands and its particular rows are an example. If you have already designed the page's
layout, keep it: link `theo-dash.css`, apply the classes to the structure you designed,
and ignore the skeleton's arrangement. The procedure below is for pages with no layout
yet — skip steps 2, 3 and 6 if yours is already decided.

### 7.1 Procedure

1. **Copy `skeleton.html`.** It already contains the shell (topbar, `.sa-main`, footer),
   the tab strip, a KPI strip, three section bands, and one example of every panel
   variant. Delete what the page does not need.
2. **Write the page's question first.** One sentence: what decision does this page
   support? The answer determines which panel gets the solid header, and there is at
   most one.
3. **List the panels, then group them into bands.** Each band is a question:
   *where it stands · what is blocking it · who is ahead · evidence on file ·
   what happens next.* 4+ panels means the bands become `.sect` dividers; 3 or fewer
   means no dividers.
4. **Assign each panel a role, deliberately:**
   - `plum` (default) — structural, neutral subject.
   - `accent-teal` — the subject is settled, complete or favourable.
   - `accent-emph` — the subject is at risk, blocked or gated. **One per page.**
   - `.card-hd.solid` — the panel that answers the page's question. **Zero or one.**
5. **Give every panel an icon** from the `.ch-ic` set (§3.2). If none fits, draw one in
   the same idiom: 24 viewBox, stroke 2, no fill, one concept.
6. **Build rows, not columns of cards.** Use `.row` + `.col`; give exactly one panel in
   each stacked column `.fill`. Put overflow on `.card-bd-scroll`, never on the card.
7. **Nest everything on `.well`.** Facts, roster rows, alerts, detail panes, step cards.
   White is the panel surface and tables only.
8. **Run the checklist in §6.** It applies unchanged to new pages.

### 7.2 Composition defaults

| Situation | Do this |
|---|---|
| Page opens with numbers | `.kpis` strip, 3–5 items, mono figures, one `.attention` at most |
| Two panels of unequal importance | `.row.r-16-10`, important one on the left |
| A panel plus two small ones | `.row.r-16-10` with `.col` on the right, smaller one `.fixed`, elastic one `.fill` |
| Two peer tables | `.row.r-1-1`, both `.card-bd-scroll` |
| Comparing suppliers | identity hue on dots, spines, bars — never on chips |
| A verdict | `.chip`, plus a one-line reason under it. Never colour the surrounding panel |
| A long list | `.card-bd-scroll` inside a `.fill` panel, not a taller page |

### 7.3 Things that are always wrong

- A second solid header, or a solid header in teal or orange.
- A role tint lighter than `--plum-t` / `--teal-t` / `--emph-t`.
- A supplier hue used to mean good or bad.
- A bar coloured by performance.
- Nested content on white.
- A type size that is not 9 / 11 / 13 / 20 / 28.
- A row whose columns are different heights.
- A page that grows instead of a panel that scrolls.
- Red, green, yellow, amber, or emoji.

### 7.4 If the new page needs something the system has no rule for

Add it in the system's own logic rather than inventing: reuse an existing token, an
existing shape (spine, band, well, chip, dot), and the existing type steps. If a genuinely
new element class is needed (a map, a timeline, a Gantt), define it once, write it into
this document, and apply it everywhere — do not let it live on one page.

---

## 8. Files in this bundle

| File | What it is |
|---|---|
| `theo-dash.css` | The design system as a working stylesheet. Use for new dashboards; port rule by rule into the three existing sheet trees for the built ones. |
| `skeleton.html` | A blank dashboard using `theo-dash.css` — shell, tabs, KPI strip, three bands, every panel variant. Copy this to start a new page. |
| `RFx Overview.dc.html` | The worked reference. Every rule above is applied here. Open it in a browser. |
| `RFx Overview Options.dc.html` | The options canvas the decisions came from. Turn 2 (`2a`–`2d`) is the header study; turn 1 is colour / type / layout. Useful for understanding *why* a rule exists. |
| `assets/lilly-logo.png`, `assets/theo-dino.png` | Extracted from the source data-URIs. Shell only. |

Both HTML files are **design references**, not production code. They are single-file
prototypes; the real work is porting the CSS rules above into the three stylesheet
trees listed in §0.

## 9. Open items for the implementer

- The `.ch-ic` icon set covers 9 glyphs. Some panels across 18 tabs will need one that
  does not exist yet; add it in the same style (24 viewBox, stroke 2, no fill, single
  concept) rather than importing an icon library.
- Landscape dashboards compare more than three suppliers. `--sup-4` and `--sup-5` are
  provided; if a page needs a sixth, stop and ask rather than inventing a hue.
- Chart series colours inside `landscape/*` were not audited. Apply §1.2 to them: series
  = supplier identity hue, thresholds and alerts = burnt orange, everything else plum.
