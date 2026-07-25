---
name: lilly-brand-assets-1c344a
description: >
  Shared FOUNDATION for the Lilly procurement skill suite: brand logos, the canonical color palette,
  execution guardrails (G1-G11), the dashboard component library, the DOCX design system, and the
  user manual (troubleshooting, model selection, per-skill usage). Triggers on "Lilly branding",
  "Lilly colors", "brand colors", "how do I use this skill", "help with skills", "skill not working",
  "dashboard error", "dashboard crashed", "which model", "Opus or Sonnet", "troubleshoot", "not rendering",
  "React error", "export the user manual", "user manual as a Word document", "manual as a PDF",
  "download the user manual", "print the manual". On help, read the shared user manual and answer from it; on export, generate it per the instructions below. BOUNDARY: this is the
  passive shared foundation. For a launch menu, "what skills do I have", "what can these skills do", or
  "what should I do next", route to procurement-launcher (THEO).
metadata:
  suite: v10.6.6
  version: "2.1"
---

<!-- MERGED PACKAGE (v10.6.6): All reference, example, and component files are inlined at the end of this document. When the skill text says "read references/foo.md" or "load references/foo.md", the content is already present below under the heading matching that filename. Do NOT attempt to read files from disk; they are here. -->

# Lilly Brand Assets and Shared References

This skill provides shared resources used across the Lilly procurement skill suite. Install FIRST before installing other procurement skills.

## Assets

### Logos (assets/logos/)
Lilly brand logos in transparent PNG format. Use Black or Red variants on light backgrounds, White on dark.

**Canonical logo set (use these):** the `Lilly-Script-*`, `Lilly-AMC-Lockup-*`, and `Lilly-L-Monogram-*` RGB PNGs. See the inlined `assets/logos/LOGOS_README.md` section below for which shape to use where.

**Legacy assets (do NOT use in new outputs):** `logo-blk-footer.png`, `logo-script-wht.png`, and `logo-wht-red.png` are retained only for backward compatibility with pre-v10 artifacts. They are NOT part of the canonical set. For any new dashboard, DOCX, or deck, use the canonical RGB PNGs above. These three may be removed in a future release.

## References (mostly inlined below; two load as companion files)

This is a single-file install for most references. Every reference named here EXCEPT
`user-manual.md` and `aria-enrichment.md` is INLINED later in this same document under a
`## INLINED: references/<name>.md` heading. When any skill says "read references/<name>.md", read the
matching inlined section below for those; do not look for a separate file on disk for them.
`user-manual.md` and `aria-enrichment.md` are the two exceptions: their content is large,
changes independently of the enforcement content on this page, and (for the manual) is
human-facing reference material rather than something every skill run needs in context.
`aria-enrichment.md` loads from its own companion file, `references/aria-enrichment.md`.
`user-manual.md` is SharePoint-primary with a local companion-file fallback; see "Reading
the user manual" below for the read order.

- **execution-guardrails.md** (inlined below): Mandatory guardrails (G1-G11) referenced by every skill; G11 (Kernel-Backed Computation) applies only to the subset of skills that vendor a numeric/decision kernel.
- **dashboard-components.md** (inlined below): Shared React component library for all dashboards.
- **brand-colors.md** (inlined below): Lilly brand color palette with hex codes and usage rules, including the canonical status palette and the single documented green/teal exception.
- **scoring-scales.md** (inlined below): The one canonical suite-wide evaluation scale (0.0-5.0) and its 5-tier requirements mapping.
- **sme-matrix.md** (inlined below): Subject-matter-expert routing table used by the risk, contracting, and negotiation skills.
- **risk-scoring.md** (inlined below): The combined-protection-weighted Protection Score method (G9 formula) used by lilly-contract-review; supplier/TPRM risk is assessed qualitatively via the supplier-risk reference.
- **docx-design-system.md** (inlined below): Formatting standards for all DOCX outputs.
- **docx-title-page-spec.md** (inlined below): Title page branding specification.
- **user-manual.md** (SharePoint-primary, companion-file fallback; see "Reading the user manual" below): Complete user guide for the procurement skills suite. Consult when users ask how to use a skill, what a skill does, what the output should look like, troubleshooting, model selection (Opus vs Sonnet), or any general question about the skills package. It is the single source of truth for the manual and can be generated as a branded Word/PDF hard copy on request (see below).

## Reading the user manual (SharePoint-primary, local fallback)

The manual's canonical home is the TechLillyProcurement SharePoint library:
`https://collab.lilly.com/sites/TechLillyProcurement/Procurement Claude Skills/Forms/AllItems.aspx`.
Use the library path, never a direct link to a specific dated file (for example a link
ending in `..._User_Manual_2June2026.pdf`): this suite's own convention is to add a new
dated filename alongside the old one on every update, not overwrite in place, so a
deep link to today's exact filename goes stale the moment the next version is uploaded,
while a library link always sees whatever is current.
`references/user-manual.md` is the locally-shipped fallback snapshot, current as of this
skill's release, not a live-synced copy: it only updates when this bundle is rebuilt and
redistributed, the same way the ARIA layer's vendored reference tables work.

**Read order, every time the manual is needed (troubleshooting, teach mode, or manual generation):**
1. If the M365 connector is available and connected this session, list the SharePoint
   library path above and select the current manual file: the item whose name contains
   "User_Manual" (case-insensitive); if more than one file matches, take the most
   recently modified. Do not guess a filename or construct a direct link; always resolve
   it from the live folder listing.
2. Read that selected file. If the fetch succeeds, use the fetched content and say once,
   briefly, that it came from the live SharePoint copy (include the filename actually
   read, so the user can tell which version was used).
3. If the connector is unavailable, not connected, the folder listing returns no
   "User_Manual" match, or the fetch fails for any reason, fall back to
   `references/user-manual.md` and say once, briefly, that this is the locally-shipped
   snapshot (not confirmed current against SharePoint) rather than silently treating it
   as equally authoritative.
4. Never fail, block, or ask the user to fix connectivity just to answer a manual question:
   degrade to the local fallback and keep going, per the suite's graceful-degradation rule.

This mirrors the live-fetch-then-fallback pattern process-navigator already uses for Lilly
policy content, applied here to the manual. The local fallback file cannot be updated by a
skill run since it lives inside the packaged skill; keeping it reasonably current is a rebuild
concern, not something any skill invocation can fix at runtime.

## Producing the user manual as a branded document (Word / hard copy)

The user manual (fetched per "Reading the user manual" above) is the single source of truth for the manual. When a user asks for the manual as a Word document, a PDF, a hard copy, or something to hand to people outside the skills package, read the manual per the read order above and GENERATE the document fresh from it. The `.docx` supplied alongside the release is a regenerated snapshot, not a hand-maintained parallel; whichever manual source was actually read (SharePoint or local fallback) is stated on the document's title page or a footer note, and the `.docx` is regenerated whenever the manual changes. Generating on demand means any hard copy always reflects the current pipelines, skills, and instructions, sourced from whichever copy was reachable.

To generate:
1. Read the manual per the read order in "Reading the user manual" above (the current content: 26 skills, the seven pipelines, install steps, per-skill walkthroughs, troubleshooting, glossary).
2. Build a `.docx` styled to match the suite's other branded reports: apply the inlined `docx-design-system.md` (fonts, headings, tables, spacing) and the inlined `docx-title-page-spec.md` (branded title page), using the **Magazine Report** house style from the inlined `house-styles.md`. Place the White or Red Lilly logo from `assets/logos/` per the title-page spec.
3. Preserve the manual's structure: title page, table of contents, the numbered sections, and the tables. Render markdown tables as real Word tables, not plain text.
4. Deliver the `.docx` as a downloadable file. If the user wants a PDF or a print-ready copy, produce the `.docx` and export to PDF where the tooling allows; otherwise note the `.docx` can be saved as PDF.

Never hand-maintain a parallel `.docx`. The manual source (SharePoint or local fallback) is what gets edited; the branded copy is regenerated from it.

---

# INLINED REFERENCE FILES

The following files were previously in subdirectories. Most are now inlined for single-file
installation; `user-manual.md` and `aria-enrichment.md` load as companion files instead (see
"References" above for why).

---

## INLINED: assets/logos/LOGOS_README.md

# Lilly Logo Assets (bundled, transparent)

Every PNG in this folder has a TRANSPARENT background (RGBA). Place a logo on any
background and choose the color variant that contrasts:

- Light backgrounds (white DOCX/PPTX pages, title pages, light cards): use a **Black** or **Red** variant.
- Dark backgrounds (dark headers, dark dashboard bars, dark closing slides): use a **White** variant.

Shapes:
- `Lilly-Script-{Black,Red,White}-RGB.png`            - the Lilly script wordmark (most common; title pages)
- `Lilly-AMC-Lockup-H-Small-{Black,Red,White}-RGB.png` - horizontal "Lilly / A MEDICINE COMPANY" lockup
- `Lilly-AMC-Lockup-V-{Black,Red,White}-RGB.png`       - vertical lockup
- `Lilly-L-Monogram-{Black,Red,White}-RGB.png`         - the cursive L monogram (favicon, small marks)

These are bundled inside the package so the skills are fully self-contained.
No external lilly-brand skill is required. Embed via base64 in HTML/JSX or place
directly in DOCX/PPTX. Backgrounds are already transparent; do not add a fill.

---

## INLINED: references/brand-colors.md

# Lilly Brand Colors - Suite-Wide Reference

This file is the single source of truth for colors across all procurement skill dashboards and documents. All colors are from the approved Lilly 16-color palette unless explicitly noted.

## Core Palette (4)

| Color | Hex | Use |
|-------|-----|-----|
| Lilly Red | #E1251B | Primary brand, headers, CTAs, table header rows, title page accents |
| Lilly Black | #212121 | All body text, dark backgrounds. NEVER use #000000. |
| Lilly White | #FFFFFF | Backgrounds, text on dark |
| Lilly Pink | #FBCFC8 | Light backgrounds, accents |

## Secondary Palette (12)

| Color | Hex | Dashboard Token | Use |
|-------|-----|-----------------|-----|
| Bold Brown | #521207 | BRN | Accent/highlight, title page header bars, section badges, KPI card backgrounds, standard table headers |
| Neutral Rose | #FDE8E5 | RISK | Risk/negative background tint |
| Vibrant Coral | #F58E7D | (chart) | Chart palette element |
| Vibrant Orange | #FDD1B0 | - | Available for accents |
| Vibrant Gold | #FFC709 | (chart) | Chart palette element |
| Neutral Cream | #FFF0D8 | WARM | Warning background tint, heatmap warning |
| Bold Blue | #0F3A85 | BLU | Section header text (H1), links, info indicators, SME badges, Strengths table headers, positive text |
| Vibrant Azure | #99BFE5 | (chart) | Chart palette element |
| Bold Grey | #8A969E | MUT | Secondary/muted text, headers, footers |
| Neutral Stone | #E4EBF1 | CARD, BD | Card backgrounds, borders, callout boxes, alternating table rows, KPI label cells |
| Neutral Sky | #D4E5F7 | OK | Positive/success background tint, heatmap positive. Replaces former green tints. |
| Light Yellow | #FEF9C3 | (assess) | Assessment: Adequate/Medium cells |

## Functional Exceptions

| Color | Hex | Token | Use | Note |
|-------|-----|-------|-----|------|
| Amber | #B45309 | AMB | Warning text/badges, medium-risk indicators | Not in Lilly palette. Retained for functional clarity in risk/warning contexts where Vibrant Gold (#FFC709) is too light for the intended contrast. |
| Light Red | #FEE2E2 | - | DOCX-only: Assessment/Scoring table cells for Weak/Low/Critical results (see `docx-design-system.md`) | Not in Lilly palette. Distinct from Neutral Rose (#FDE8E5, the RISK token); used only in DOCX assessment-cell tinting, never in dashboards. |

## Dashboard Token Map

| Token | Hex | Lilly Name | Role |
|-------|-----|------------|------|
| R | #E1251B | Lilly Red | Primary brand |
| DK | #212121 | Lilly Black | Body text, dark backgrounds |
| BRN | #521207 | Bold Brown | Accent/highlight, badges, KPI cards |
| BLU | #0F3A85 | Bold Blue | Section headers, positive text, links |
| CARD | #E4EBF1 | Neutral Stone | Card backgrounds, alternating rows |
| WARM | #FFF0D8 | Neutral Cream | Warning backgrounds |
| RISK | #FDE8E5 | Neutral Rose | Risk backgrounds |
| OK | #D4E5F7 | Neutral Sky | Success/positive backgrounds |
| BD | #E4EBF1 | Neutral Stone | Borders |
| MUT | #8A969E | Bold Grey | Secondary text |
| AMB | #B45309 | (exception) | Warnings |

## Machine-readable token manifest (JSON)

A copy-paste manifest of the canonical tokens, so a build step or downstream skill can consume the palette
without parsing markdown tables. This is the same data as the tables above and the Canonical Status Palette
below; if they ever disagree, the tables are authoritative and this block is the bug.

```json
{
  "suite": "v10.6.6",
  "core": { "Lilly Red": "#E1251B", "Lilly Black": "#212121", "Lilly White": "#FFFFFF", "Lilly Pink": "#FBCFC8" },
  "tokens": {
    "R": "#E1251B", "DK": "#212121", "BRN": "#521207", "BLU": "#0F3A85",
    "CARD": "#E4EBF1", "WARM": "#FFF0D8", "RISK": "#FDE8E5", "OK": "#D4E5F7",
    "BD": "#E4EBF1", "MUT": "#8A969E", "AMB": "#B45309"
  },
  "statusPalette": {
    "POS": "#0F3A85", "POS_BG": "#D4E5F7",
    "WARN": "#B45309", "WARN_BG": "#FFF0D8",
    "NEG": "#E1251B", "NEG_BG": "#FDE8E5",
    "NEU": "#8A969E"
  },
  "chartPalette": ["#E1251B", "#0F3A85", "#521207", "#F58E7D", "#FFC709", "#99BFE5"],
  "noGreen": true,
  "greenException": null
}
```

## Chart Palette (6 colors, in order)
#E1251B (Lilly Red), #0F3A85 (Bold Blue), #521207 (Bold Brown), #F58E7D (Vibrant Coral), #FFC709 (Vibrant Gold), #99BFE5 (Vibrant Azure)

## Heatmap Cells
| Meaning | Hex | Lilly Name |
|---------|-----|------------|
| Positive (>80%) | #D4E5F7 | Neutral Sky |
| Warning (50-80%) | #FFF0D8 | Neutral Cream |
| Negative (<50%) | #FDE8E5 | Neutral Rose |
| N/A | #E4EBF1 | Neutral Stone |

## Canonical Status Palette (OWNED HERE - single source of truth, NO GREEN)

This is the one status palette every dashboard and report uses for positive / warning / negative / neutral
signals. It is intentionally GREEN-FREE: Lilly's brand palette contains no green, so "positive / good /
passing" is carried by Bold Blue and Neutral Sky, never by a green. There are SEVEN distinct,
uniquely-named hexes here and no two share a value. Do not introduce a green to mean "good."

| Status role | Token | Hex | Lilly Name | Where it renders |
|-------------|-------|-----|------------|------------------|
| Positive / pass / good (text) | POS | #0F3A85 | Bold Blue | positive score text, pass labels, "good" KPI numbers |
| Positive / pass / good (background) | POS_BG | #D4E5F7 | Neutral Sky | success/positive cell + KPI card backgrounds, heatmap positive |
| Warning / caution (text) | WARN | #B45309 | Amber | medium-risk text, caution badges, "needs attention" |
| Warning / caution (background) | WARN_BG | #FFF0D8 | Neutral Cream | warning cell backgrounds, heatmap warning |
| Negative / fail / critical (text) | NEG | #E1251B | Lilly Red | critical/high-risk text, fail labels, "below target" |
| Negative / fail / critical (background) | NEG_BG | #FDE8E5 | Neutral Rose | risk/negative cell backgrounds, heatmap negative |
| Neutral / N/A / muted | NEU | #8A969E | Bold Grey | not-applicable, muted secondary text, neutral chips |

Uniqueness check: #0F3A85, #D4E5F7, #B45309, #FFF0D8, #E1251B, #FDE8E5, #8A969E are seven distinct hexes.
None is a green. Earlier builds aliased a "GRN" token onto Bold Blue (`GRN === BLU`); that alias is
RETIRED. Use POS / POS_BG for positive signals; do not declare a `GRN` token.

**Accessibility / contrast.** Status is always carried by BOTH a color and a word or icon, never by color
alone (so the palette works for color-vision-deficient readers, who cannot distinguish the red/amber
cues). Each text token meets WCAG AA (4.5:1) for normal text on white and on its paired background tint:
Bold Blue, Lilly Red, Amber, and Bold Grey all clear 4.5:1 on #FFFFFF and on their light tints. The light
tints (Neutral Sky, Neutral Cream, Neutral Rose, Neutral Stone) are BACKGROUND-only; never use a light
tint as text color, and always place dark text (#212121) or a dark status text token on top of them. When
a positive and a negative cell sit adjacent, rely on the label ("Pass" / "Fail") plus the icon, not only
the blue-vs-red distinction.

## The Slide Template green/teal allowance (currently unused)

The suite-wide no-green rule has exactly ONE documented allowance: the **Slide Template** house style,
matching Lilly's official executive-deck slide masters, which legitimately includes sage `#C6DCD8` and
uses greens/teals for positive data. This allowance applies ONLY inside Slide Template PPTX output. It
does NOT apply to any dashboard, DOCX report, or status palette, all of which remain strictly green-free
per the Canonical Status Palette above. No shipped skill currently produces Slide Template output:
decision-deck, the prior and only consumer of this house style, has been retired. The allowance stays
documented here, unused, for any future PPTX-producing skill that adopts the Slide Template house style;
it is not activated for any skill by default.

## DOCX Design Colors

See the inlined `docx-design-system.md` section below for the complete DOCX specification. Summary:

| Element | Color | Hex |
|---------|-------|-----|
| Title page header bar | Bold Brown | #521207 |
| Title page accent/rule | Lilly Red | #E1251B |
| Section header text (H1) | Bold Blue | #0F3A85 |
| All body text | Lilly Black | #212121 |
| Section badges, KPI cards, standard table headers | Bold Brown | #521207 |
| Strengths table header | Bold Blue | #0F3A85 |
| Concerns/Risk table header | Lilly Red | #E1251B |
| Callout box backgrounds | Neutral Stone | #E4EBF1 |
| Profile table label cells | Neutral Stone | #E4EBF1 |
| SME escalation badges | Bold Blue | #0F3A85 |
| Assessment: Full/Strong | Neutral Sky | #D4E5F7 |
| Assessment: Adequate/Medium | Light Yellow | #FEF9C3 |
| Assessment: Weak/Critical | Light Red | #FEE2E2 |
| Assessment: N/A | Neutral Stone | #E4EBF1 |

## Prohibited Colors

Do NOT use any green colors in dashboards, DOCX reports, or any status palette. This includes:
- #144B2D (former Bold Green)
- #C6DCD8 (Neutral Sage)
- #DCFCE7 (off-brand light green)
- #0D7C5F, #007205, #4EA72E, #196B24 or any green variant

Where green was previously used, substitute:
- Section header text: use Bold Blue (#0F3A85)
- Positive/success backgrounds: use Neutral Sky (#D4E5F7)
- Chart series that was green: use Bold Brown (#521207)

**Sole documented allowance:** the Slide Template (PPTX) house style may use sage `#C6DCD8` and
greens/teals for positive data, because it mirrors Lilly's official slide masters. See "The Slide
Template green/teal allowance" above. That allowance is scoped to Slide Template PPTX output only;
it never applies to dashboards, DOCX reports, or the Canonical Status Palette, which stay green-free.
No shipped skill currently produces Slide Template output, so no skill may use a green today.

## Logo Path
All Lilly logos are in this skill's `assets/logos/` folder. Use Black or Red variants on light backgrounds, White on dark. Backgrounds are transparent. (Single-file install: read logos from the bundled `assets/logos/` directory, not from any `/mnt/...` path.)

---

## INLINED: references/dashboard-components.md

# Dashboard Component Library - Suite Standard

All procurement skill dashboards use these exact component implementations. Copy them verbatim into every dashboard JSX file. Restyle only via the color tokens defined in `brand-colors.md`. Do not redesign per run.

## Required Imports

```jsx
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList, ComposedChart, Line, ReferenceLine } from "recharts";
```

## Color Token Declarations

> Note on naming: Lilly's brand palette does NOT include a pure green, so "positive / good / passing"
> is carried by **Bold Blue** (`BLU = #0F3A85`), never by a green. The former `GRN` alias has been
> RETIRED: it was set to the same hex as `BLU` (`#0F3A85`), which violated the suite rule that no two
> STATUS-role tokens (POS/POS_BG/WARN/WARN_BG/NEG/NEG_BG/NEU, see the Canonical Status Palette above) may
> share a hex. General-purpose layout tokens (CARD/BD, MUT/LT) may intentionally alias the same hex; only
> status-role tokens are required to be unique. Use `BLU` for positive-signal text and `OK` for
> positive-signal backgrounds.
> Do not declare a `GRN` token and do not introduce off-palette greens. (The single documented green
> allowance, the Slide Template house style, does not use this dashboard token set, and no shipped
> skill currently produces Slide Template output.)

```jsx
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";
```

## Semantic Color Maps (adapt per skill)

```jsx
// Risk/severity tiers (positive = BLU, never green)
const SEV = { Critical: R, High: R, Medium: AMB, Low: BLU };
const SEVBG = { Critical: RISK, High: RISK, Medium: WARM, Low: OK };

// Score-to-color (numeric thresholds; scale is 0.0-5.0 per scoring-scales.md)
function scC(v) { return v >= 4.0 ? BLU : v >= 3.0 ? AMB : R; }
function scBg(v) { return v >= 4.0 ? OK : v >= 3.0 ? WARM : RISK; }

// Percentage-to-color
function pcC(p) { return p >= 90 ? BLU : p >= 70 ? AMB : R; }
function pcBg(p) { return p >= 90 ? OK : p >= 70 ? WARM : RISK; }
```

> Note: the numeric thresholds in `scC`/`scBg` are on the canonical 0.0-5.0 evaluation scale (see the
> inlined `scoring-scales.md` below: 4.0+ = Fully/Largely Meets, 3.0-3.9 = Partially Meets, below 3.0 =
> Minimally/Does Not Meet). If a skill genuinely renders a 0-100 or 0-10 axis, rescale to 0.0-5.0 first,
> or adjust these breakpoints locally and say so.

## Chart Palette (6 colors, in order)

Exactly SIX distinct, on-brand, non-green hexes, matching the Chart Palette in `brand-colors.md`. No
entry repeats and none is a green (the retired `GRN` duplicate is gone).

```jsx
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];
// = [Lilly Red, Bold Blue, Bold Brown, Vibrant Coral, Vibrant Gold, Vibrant Azure]
```

## Currency Helpers

```jsx
// Compact currency (for KPI cards, chart labels)
function f$(v) {
  if (v == null) return "";
  var a = Math.abs(v);
  if (a >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (a >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}

// Full currency (for table cells, tooltips)
function fF(v) { return "$" + v.toLocaleString("en-US"); }

// Percentage
function fP(v) { return v == null ? "" : v.toFixed(1) + "%"; }
```

## Metric (KPI Card)

Props: `label` (string), `value` (string/number), `sub` (optional subtitle), `accent` (boolean, warm highlight), `warn` (boolean, risk highlight), `good` (boolean, success highlight)

```jsx
function Metric({ label, value, sub, accent, warn, good }) {
  var bar = accent ? R : warn ? R : good ? BLU : BD;
  return <div style={{ background: accent ? WARM : warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: accent ? R : LT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: warn ? R : good ? BLU : DK, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{sub}</div>}
  </div>;
}
```

## Card (Content Panel)

Props: `title` (string), `note` (optional right-aligned annotation), `children`

```jsx
function Card({ title, note, children }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 18, border: "1px solid " + BD, marginBottom: 14 }}>
    {title && <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: DK, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 14, background: R, borderRadius: 2 }} />{title}
      {note && <span style={{ fontFamily: "Arial", fontSize: 10, fontWeight: 600, color: MUT, marginLeft: "auto" }}>{note}</span>}
    </div>}{children}
  </div>;
}
```

## Pillar (Accent-Bordered Callout)

Props: `c` (accent color), `k` (kicker/big number), `t` (title), `d` (description)

```jsx
function Pillar({ c, k, t, d }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 16, border: "1px solid " + BD, borderTop: "3px solid " + c, flex: 1, minWidth: 0 }}>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: c }}>{k}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: DK, marginTop: 4 }}>{t}</div>
    <div style={{ fontSize: 11, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{d}</div>
  </div>;
}
```

## SevPill (Severity Indicator)

Props: `s` (severity string: "Critical", "High", "Medium", "Low")

```jsx
function SevPill({ s }) {
  return <span style={{ color: SEV[s], background: SEVBG[s], border: "1px solid " + SEV[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}
```

## PrioPill (Priority Indicator)

Priority analogue of `SevPill`. Props: `p` (priority string: "Urgent", "High", "Medium", "Low"). Positive/low = BLU, never green; mirrors the severity color logic.

```jsx
// Priority tiers (mirror of the severity scale; low/positive = BLU, never green)
const PRIO = { Urgent: R, High: R, Medium: AMB, Low: BLU };
const PRIOBG = { Urgent: RISK, High: RISK, Medium: WARM, Low: OK };
function PrioPill({ p }) {
  return <span style={{ color: PRIO[p], background: PRIOBG[p], border: "1px solid " + PRIO[p] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{p}</span>;
}
```

## StateBanner (NEEDS_INPUT / NOT_APPLICABLE / RESEARCH_PENDING)

Props: `kind` (string), `msg` (string)

```jsx
function StateBanner({ kind, msg }) {
  var map = { NEEDS_INPUT: [AMB, WARM, "Needs input"], NOT_APPLICABLE: [MUT, CARD, "Not applicable"], RESEARCH_PENDING: [MUT, CARD, "Research pending"] };
  var c = map[kind] || map.NOT_APPLICABLE;
  return <div style={{ background: c[1], border: "1px solid " + c[0] + "55", borderLeft: "4px solid " + c[0], borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: c[0], textTransform: "uppercase" }}>{c[2]}</span>
    <div style={{ fontSize: 12, color: DK, marginTop: 4, lineHeight: 1.5 }}>{msg}</div>
  </div>;
}
```

## STable (Sortable + Searchable Table)

Props: `columns` (array of `{l: label, a: alignment}`), `rows` (array of arrays of `{d: display, v: sortValue, b: bold, c: color, a: align}`)

```jsx
function STable({ columns, rows }) {
  var _s = useState({ col: 0, dir: "asc" }); var sort = _s[0]; var setSort = _s[1];
  var _q = useState(""); var q = _q[0]; var setQ = _q[1];
  var filtered = useMemo(function () {
    var r = rows;
    if (q) { var lq = q.toLowerCase(); r = rows.filter(function (row) { return row.some(function (c) { return String(c.d).toLowerCase().indexOf(lq) >= 0; }); }); }
    return r.slice().sort(function (a, b) {
      var av = a[sort.col].v != null ? a[sort.col].v : a[sort.col].d;
      var bv = b[sort.col].v != null ? b[sort.col].v : b[sort.col].d;
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sort, q]);
  return <div>
    <div style={{ marginBottom: 8 }}>
      <input value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="Search..." style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid " + BD, fontSize: 12, width: 220 }} />
      <span style={{ fontSize: 11, color: LT, marginLeft: 8 }}>{filtered.length} of {rows.length}</span>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{columns.map(function (h, i) {
          var active = sort.col === i;
          return <th key={i} onClick={function () { setSort({ col: i, dir: active && sort.dir === "desc" ? "asc" : "desc" }); }} style={{ padding: "7px 8px", fontWeight: 600, color: active ? R : MUT, fontSize: 11, borderBottom: "2px solid " + BD, cursor: "pointer", textAlign: h.a || "left", whiteSpace: "nowrap" }}>{h.l}{active ? (sort.dir === "asc" ? " ^" : " v") : ""}</th>;
        })}</tr></thead>
        <tbody>{filtered.map(function (row, ri) {
          return <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
            {row.map(function (cell, ci) {
              return <td key={ci} style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: columns[ci].a || "left", fontWeight: cell.b ? 700 : 400, color: cell.c || DK }}>{cell.d}</td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}
```

## ScoreCell / PctCell (Color-Coded Table Cells)

Tinted `<td>` cells that color a value by its own scale. `ScoreCell` renders a 0.0-5.0 score using the `scC`/`scBg` helpers; `PctCell` renders a 0-100 percentage using the `pcC`/`pcBg` helpers. Use inside a table row (`<tr>`). Props: `ScoreCell` takes `v` (number, 0.0-5.0); `PctCell` takes `p` (number, 0-100); both take optional `a` (text align, default "center").

```jsx
function ScoreCell({ v, a }) {
  return <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, textAlign: a || "center", color: scC(v), background: scBg(v), borderBottom: "1px solid " + BD }}>{v == null ? "" : v.toFixed(1)}</td>;
}
function PctCell({ p, a }) {
  return <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, textAlign: a || "center", color: pcC(p), background: pcBg(p), borderBottom: "1px solid " + BD }}>{fP(p)}</td>;
}
```

## Tip (Recharts Tooltip)

```jsx
function Tip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div style={{ background: DK, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 12 }}>
    {label && <div style={{ fontWeight: 600, color: LT }}>{label}</div>}
    {payload.map(function (p, i) { return <div key={i}><strong>{typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}</strong></div>; })}
  </div>;
}
```

## Layout Shell (Header + Tab Nav + Footer)

```jsx
// Header bar
<div style={{ background: DK, padding: "12px 24px 8px" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>{eyebrowText}</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{titleText}</div>
      </div>
    </div>
    <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{dateAndCoverage}</div>
  </div>
</div>

// Tab navigation
<div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto" }}>
  {TABS.map(function (t) {
    var active = t === currentTab;
    return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}{NEEDS_INPUT[t] ? <span style={{ color: AMB, marginLeft: 4 }}>*</span> : null}</button>;
  })}
</div>

// Body container
<div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>
  {/* Tab content here */}
</div>

// Footer
<div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
  <div>{footerLeftText}</div>
  <div>Company Confidential | {skillName} | {year}</div>
</div>
```

## Grid Patterns

```jsx
// 5-column KPI row
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
  <Metric ... />
</div>

// 2-column card layout
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
  <Card ... />
  <Card ... />
</div>

// 3-column findings/insights
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
  <Pillar ... />
</div>
```

## Rules

- NEVER use localStorage, sessionStorage, or any browser storage APIs
- ALWAYS use `create_file` to write dashboards (never bash/cat)
- Use standard CSS properties only (no Tailwind shorthands)
- Import React hooks explicitly
- Use named functions for components
- No em dashes in any rendered text
- No literal escape sequences as visible text

---

## INLINED: references/docx-design-system.md

# DOCX Design System -- Suite-Wide Reference

This file is the single source of truth for DOCX document design across all procurement skills. Every report, briefing, analysis, and summary produced by any skill MUST follow this specification. Read this file before generating any DOCX output. The design is derived from the production documents (supplier landscape reports, response analysis reports) and uses the Lilly-approved color palette from `brand-colors.md`.

## Fonts

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Document title (title page) | Calibri | 26pt | Bold | #212121 (Lilly Black) |
| Document subtitle (title page) | Calibri | 14pt | Normal | #8A969E (Bold Grey) |
| Scope line (title page) | Calibri | 11pt | Normal | #0F3A85 (Bold Blue) |
| Confidential notice (title page) | Calibri | 10pt | Bold | #E1251B (Lilly Red) |
| Description paragraph (title page) | Calibri | 10pt | Normal | #212121 |
| Section number badge text | Calibri | 16pt | Bold | #FFFFFF |
| Section title (H1) | Calibri | 14pt | Bold | #0F3A85 (Bold Blue) |
| Subsection title (H2) | Calibri | 12pt | Bold | #212121 |
| Subsection title (H3, e.g. "3.1 Kinaxis") | Calibri | 11pt | Bold | #212121 |
| Body text | Calibri | 10pt | Normal | #212121 |
| Table header text | Calibri | 9pt | Bold | #FFFFFF |
| Table body text | Calibri | 9pt | Normal | #212121 |
| KPI card number | Calibri | 22pt | Bold | #FFFFFF |
| KPI card label | Calibri | 8pt | Normal (caps) | #212121 |
| Footer text | Calibri | 8pt | Normal | #8A969E |
| Header text | Calibri | 8pt | Normal | #8A969E |
| Bold inline labels ("Basis:", "Proposed Solution:") | Calibri | 10pt | Bold | #212121 |

> Note: DOCX body content uses **Calibri** (matching `docx-title-page-spec.md`, the Magazine Report style in `house-styles.md`, and the docx-js implementation below). Arial is used only for on-screen dashboards, not for DOCX.

## Title Page

Layout from top to bottom:

1. **Lilly logo** -- "A Medicine Company" horizontal lockup, top-left. Use this skill's bundled `assets/logos/Lilly-AMC-Lockup-H-Small-Red-RGB.png` (red variant on white background). No resizing beyond proportional fit (approximately 2 inches wide).

2. **Spacing** -- ~0.5 inch gap below logo.

3. **Document title** -- Bold, 26pt, Lilly Black (#212121). All caps or title case depending on document type (reports use all caps: "SUPPLIER RESPONSE ANALYSIS", "SUPPLIER MARKET LANDSCAPE").

4. **Document subtitle** -- 14pt, Bold Grey (#8A969E). Describes the specific context (e.g., "Scenario Planning RFP -- 4 Vendor Evaluation", "Supply Chain Planning Solutions").

5. **Horizontal rule** -- Full-width, 1.5pt, Lilly Red (#E1251B). ~0.3 inch below subtitle.

6. **Scope line** -- 11pt, Bold Blue (#0F3A85). Key parameters separated by pipes (e.g., "485 Requirements | 15 Categories | 10 Vendors Evaluated").

7. **Prepared by line** -- 10pt, #212121. Attribution and date (e.g., "Prepared by Eli Lilly and Company - Procurement | May 22, 2026").

8. **Confidential notice** -- 10pt bold, Lilly Red (#E1251B). "Company Confidential (c) {Year} Eli Lilly and Company".

9. **Brief description** (optional) -- 10pt, #212121. 1-3 sentences summarizing the document scope. Only for longer reports.

No background fills, gradients, or colored bars on the title page. Clean white background.

## Running Header

- Right-aligned, 8pt, Bold Grey (#8A969E)
- Format: `[Document Title]  |  Company Confidential`
- Thin underline: 0.5pt, Lilly Red (#E1251B)
- Not on the title page (first page different header)

## Running Footer

- Centered, 8pt, Bold Grey (#8A969E)
- Format: `Company Confidential  (c) {Year} Eli Lilly and Company  |  Page [N]`
- Appears on all pages including the title page

## Section Headers (H1)

Each major section uses a numbered badge + title:

- **Number badge**: Rounded rectangle, approximately 30x30pt. Background: Bold Brown (#521207). Text: white, 16pt bold, centered. Numbers are zero-padded to two digits ("01", "02", "03").
- **Section title**: Immediately to the right of the badge. Bold Blue (#0F3A85), 14pt bold. Vertically centered with the badge.
- **Background strip**: Very light gray behind the full badge+title row. Use Neutral Stone (#E4EBF1) at ~30% opacity or a single thin border below.

Implementation: Use a 2-column table (badge column fixed narrow, title column flexible) with no visible borders and the section styling applied.

## KPI Cards

A row of 3-4 metric cells spanning the full page width, placed immediately below section headers:

- **Number cell**: Background Bold Brown (#521207), text white, 22pt bold, centered. The metric value (e.g., "485", "95.1%", "$548M").
- **Label cell**: Background Neutral Stone (#E4EBF1), text #212121, 8pt, small caps or uppercase, centered. The metric name (e.g., "REQUIREMENTS", "FM COVERAGE", "REVENUE (FY2025)").

Implementation: Single-row table with cells. Each cell has two paragraphs (number + label) or use a 2-row table where row 1 is the number and row 2 is the label.

## Tables

### Standard Data Tables

- **Header row**: Background Bold Brown (#521207), text white (#FFFFFF), 9pt bold. Left-aligned for text, center-aligned for numbers.
- **Body rows**: Alternating white and Neutral Stone (#E4EBF1). Text #212121, 9pt.
- **Cell borders**: 0.5pt, #D0D0D0 (light gray).
- **Cell padding**: 4pt vertical, 6pt horizontal minimum.

### Strengths/Concerns Tables (Two-Column Comparative)

- **Left column header ("KEY STRENGTHS")**: Background Bold Blue (#0F3A85), text white, 9pt bold.
- **Right column header ("KEY CONCERNS" or "LIMITATIONS & RISKS")**: Background Lilly Red (#E1251B), text white, 9pt bold.
- **Body cells**: White background, normal text with bold lead-in phrases.

### Assessment/Scoring Tables

- **Header row**: Same as standard (Bold Brown with white text).
- **Assessment cells** (color-coded by result):

| Assessment | Cell Background | Text Color |
|-----------|----------------|------------|
| Full / Strong / High | #D4E5F7 (Neutral Sky) | #212121 |
| Adequate / Medium | #FEF9C3 (light yellow) | #212121 |
| Weak / Low / Critical | #FEE2E2 (light red) | #212121 |
| N/A | #E4EBF1 (Neutral Stone) | #8A969E |

## Recommendation Callout Box

Full-width box for key recommendations or action items:

- **Background**: Neutral Stone (#E4EBF1)
- **Border**: 0.5pt, #D0D0D0 (light gray), all sides
- **Text**: 10pt, #212121, normal weight
- **Label** (optional): "RECOMMENDATION:" in bold at the start

## Callout / Info Box

For notes, caveats, or highlighted context:

- **Background**: Neutral Stone (#E4EBF1)
- **Left border**: 3pt, Bold Blue (#0F3A85)
- **Text**: 10pt, #212121

## Page Layout

- **Page size**: Letter (8.5" x 11")
- **Margins**: 1" top, 1" bottom, 1" left, 1" right
- **Line spacing**: 1.15 for body text
- **Paragraph spacing**: 6pt after for body, 12pt before for headings

## Table of Contents

- Generated after the title page
- "Table of Contents" as H1 (same Bold Blue section header style, no badge number)
- TOC entries: 10pt, #212121, with right-aligned page numbers and dot leaders
- Indent nested entries by 0.25 inches per level

## Color Palette Reference (DOCX-Specific)

| Role | Color Name | Hex | Where Used |
|------|-----------|-----|------------|
| Primary brand accent | Lilly Red | #E1251B | Title page rule, header underline, Concerns/Risk table headers, confidential notice |
| Section header text | Bold Blue | #0F3A85 | H1 section titles, scope lines, info callout borders, Strengths table header |
| Section badge / KPI card background | Bold Brown | #521207 | Number badges, KPI metric cells, standard table headers |
| All body text | Lilly Black | #212121 | Body, table cells, headings (H2/H3) |
| Secondary/muted text | Bold Grey | #8A969E | Headers, footers, N/A cells |
| White (on dark) | Lilly White | #FFFFFF | Text on brown/red/blue backgrounds |
| Card/neutral backgrounds | Neutral Stone | #E4EBF1 | Callout boxes, KPI labels, profile tables, alternating rows |
| Positive/success cells | Neutral Sky | #D4E5F7 | Assessment: Full, Strong, High |
| Warning cells | Light Yellow | #FEF9C3 | Assessment: Adequate, Medium |
| Risk/negative cells | Light Red | #FEE2E2 | Assessment: Weak, Low, Critical |
| Risk backgrounds | Neutral Rose | #FDE8E5 | High-risk callouts |
| Warning backgrounds | Neutral Cream | #FFF0D8 | Warning callouts |
| Table borders | Light Gray | #D0D0D0 | All table cell borders |

## What NOT to Do

- Do NOT use #000000 for any text. Always #212121.
- Do NOT use green colors (see the Prohibited Colors list in `brand-colors.md` above, or any green). Use Bold Blue (#0F3A85) and Neutral Sky (#D4E5F7) for positive/success roles instead.
- Do NOT use em dashes. Use hyphens, colons, or restructure.
- Do NOT use colored title page backgrounds, gradients, or full-bleed images.
- Do NOT use fonts other than Calibri for body content.
- Do NOT fabricate data or metrics. If a value is estimated or inferred, label it as such.
- Do NOT skip the Lilly logo on the title page.
- Do NOT omit the confidential footer.

---

## INLINED: references/docx-title-page-spec.md

# DOCX Title Page & Document Shell -- Suite Standard (LOCKED)

This file defines the deterministic title page, table of contents, header/footer, and page setup used by every RFx pipeline skill that produces a DOCX report (rfp-response-analysis, supplier-landscape, and any future DOCX-producing skills). The structure does not change per run, per mode, or per category. Only the content (report title, subtitle, metadata values, abstract text) varies.

## Title Page Elements (in order)

| # | Element | Alignment | Font | Size | Color | Notes |
|---|---------|-----------|------|------|-------|-------|
| 1 | Lilly logo | Left | -- | 1.46" x 0.61" | -- | Inline ImageRun, spacing before 200 twips. Source: this skill's bundled `assets/logos/` folder, or extracted from a previous report. |
| 2 | Report title | Left | Calibri | 22pt (44 half-pt) | #212121 | Bold. E.g., "SUPPLIER RESPONSE ANALYSIS", "SUPPLIER MARKET LANDSCAPE". Spacing before 400 twips. |
| 3 | Subtitle + red rule | Left | Calibri | 15pt (30 half-pt) | #0F3A85 | The sourcing event name. Paragraph bottom border: single, 8pt, #E1251B, space 4. This is the red divider. Spacing after 100 twips. |
| 4 | Spacer | -- | -- | -- | -- | Empty paragraph, spacing after 40 twips. |
| 5 | Metadata line 1 | Left | Calibri | 10pt (20 half-pt) | #0F3A85 | "{N} Functional Requirements | {N} Categories | {N} Vendors Evaluated" |
| 6 | Metadata line 2 | Left | Calibri | 10pt (20 half-pt) | #521207 | "Prepared by Eli Lilly and Company | {Month Year}" |
| 7 | Spacer | -- | -- | -- | -- | Empty paragraph, spacing after 40 twips. |
| 8 | Confidential notice | Left | Calibri | 10pt (20 half-pt) | #E1251B | Bold. "Company Confidential  (c) {Year} Eli Lilly and Company" |
| 9 | Spacer | -- | -- | -- | -- | Empty paragraph, spacing after 40 twips. |
| 10 | Abstract | Left | Calibri | 9.5pt (19 half-pt) | #521207 | One paragraph summarizing scope. Line spacing 264 twips. |
| 11 | Page break | -- | -- | -- | -- | PageBreak element. |

**Critical: everything is LEFT-ALIGNED. Never center title page elements. Never use large vertical spacing to push content toward the middle of the page.**

## Table of Contents

Immediately after the title page break:

1. **TOC badge** -- `badge("","Table of Contents")` -- the same section badge table used for numbered sections (01, 02, etc.). Left cell: empty red (#E1251B) accent bar. Right cell: light blue (#E4EBF1) with bold "Table of Contents". This keeps the TOC heading visually consistent with the rest of the document. Do NOT use a plain Heading1 paragraph.
2. **Spacer** -- empty paragraph, spacing after 120 twips.
3. **Field** -- `TableOfContents("TOC \\h \\o \"1-2\"", {hyperlink: true})`. Auto-populates in Word.
4. **Page break**.

The TOC indexes Heading2 paragraphs only. Section badge tables (01, 02...) are visual elements that do NOT feed the TOC.

## Header (all pages)

Right-aligned, Calibri 8pt italic, #8A969E. Text: "{Report Type}  |  Company Confidential".

## Footer (all pages)

Center-aligned, Calibri 8pt, #8A969E. Text: "Company Confidential  (c) {Year} Eli Lilly and Company  |  Page {PageNumber.CURRENT}".

## Page Setup

- US Letter: 12240 x 15840 DXA
- Margins: 0.75" all sides (1080 DXA)
- Default font: Calibri 10.5pt (21 half-pt), #212121

## docx-js Implementation Pattern

```javascript
const logoData = fs.readFileSync("/path/to/lilly_logo.png");

// 1. Logo
ch.push(new Paragraph({spacing:{before:200},children:[
  new ImageRun({data:logoData,transformation:{width:140,height:58},type:"png"})
]}));
// 2. Title
ch.push(new Paragraph({spacing:{before:400},children:[
  new TextRun({text:"REPORT TITLE HERE",font:"Calibri",size:44,bold:true,color:"212121"})
]}));
// 3. Subtitle with red bottom border
ch.push(new Paragraph({spacing:{after:100},border:{bottom:{style:BorderStyle.SINGLE,color:"E1251B",size:8,space:4}},children:[
  new TextRun({text:"Subtitle Here",font:"Calibri",size:30,color:"0F3A85"})
]}));
// 4. Spacer
ch.push(new Paragraph({spacing:{after:40},children:[]}));
// 5. Metadata 1
ch.push(new Paragraph({children:[
  new TextRun({text:"N Requirements | N Categories | N Vendors",font:"Calibri",size:20,color:"0F3A85"})
]}));
// 6. Metadata 2
ch.push(new Paragraph({children:[
  new TextRun({text:"Prepared by Eli Lilly and Company | Month Year",font:"Calibri",size:20,color:"521207"})
]}));
// 7. Spacer
ch.push(new Paragraph({spacing:{after:40},children:[]}));
// 8. Confidential
ch.push(new Paragraph({children:[
  new TextRun({text:"Company Confidential  (c) Year Eli Lilly and Company",font:"Calibri",size:20,bold:true,color:"E1251B"})
]}));
// 9. Spacer
ch.push(new Paragraph({spacing:{after:40},children:[]}));
// 10. Abstract
ch.push(new Paragraph({spacing:{after:200,line:264},children:[
  new TextRun({text:"Abstract paragraph here...",font:"Calibri",size:19,color:"521207"})
]}));
// 11. Page break
ch.push(new Paragraph({children:[new PageBreak()]}));

// TOC page
ch.push(badge("","Table of Contents"));
ch.push(sp());
ch.push(new TableOfContents("TOC \\\\h \\\\o \"1-2\"",{hyperlink:true}));
ch.push(new Paragraph({children:[new PageBreak()]}));
```

## Anti-Patterns

- Do NOT center title page elements.
- Do NOT use spacing-before > 400 twips to push content downward.
- Do NOT omit the red bottom border on the subtitle.
- Do NOT omit the Lilly logo.
- Do NOT hardcode author names in the "Prepared by" line without user instruction.
- Do NOT omit the abstract paragraph.
- Do NOT skip the Table of Contents page.
- Do NOT use a plain Heading1 paragraph for the "Table of Contents" title. Use the badge table (`badge("","Table of Contents")`) so the TOC heading matches the visual style of numbered section badges used throughout the document.

---

## INLINED: references/execution-guardrails.md

# Execution Guardrails (Suite-Wide, v8.2)

Shared enforcement module for all Lilly procurement skills. These guardrails prevent the most common failure mode: reading a skill's workflow and then collapsing it into a single shallow pass that produces plausible-looking but analytically thin output.

**These guardrails are structural, not advisory.** They create mandatory intermediate artifacts, tool prescriptions, and gate checks that make skipping analytical work impossible without visibly skipping a required step.

## G1: Tool Selection by Document Context (HARD RULE)

The wrong tool silently destroys input the skill depends on. Every skill that reads .docx files must follow these rules:

| Context | Required Tool | Prohibited Tool | Reason |
|---------|--------------|-----------------|--------|
| Any .docx in the contracting-and-negotiations pipeline (lilly-contract-review, legal-negotiation-prep, commercial-negotiation-prep, negotiation-playbook-learning, comment-cleanup), ALL modes, ALL rounds | `unpack.py` to extract XML; read `word/comments.xml` for comments, scan `word/document.xml` for `<w:ins>`, `<w:del>`, `<w:commentRangeStart>` elements | `extract-text` | There is no scenario in the contracting pipeline where `extract-text` is the better choice. `unpack.py` gives everything `extract-text` gives plus tracked changes, comments, and authorship. Supplier-returned documents in round 2+ have tracked changes. Order-form governing agreements may have tracked changes. The speed advantage of `extract-text` is exactly what causes analytical collapse. |
| .docx for content extraction only (executive summaries, spend data documents, RFP submissions, scope documents with no negotiation history) | `extract-text` is acceptable; `unpack.py` also acceptable | Neither prohibited | Content is the input, not change history. |
| .docx for comment inventory (comment-cleanup, post-review hygiene) | `unpack.py` to extract XML; read `word/comments.xml` directly | `extract-text` | Comment metadata (author, classification, threading) is not preserved by text extraction. |
| .pdf | Use the pdf-reading skill or `extract-text` | N/A | PDFs do not have tracked changes. |

**The test:** If the .docx is in the contracting-and-negotiations pipeline, use `unpack.py`. Always. The only .docx files where `extract-text` is acceptable are those outside the contracting pipeline (RFP submissions, spend reports, scope documents) where tracked changes are never analytically relevant.

## G2: Mandatory Gate Checks Between Phases

Every multi-phase workflow in the suite must produce intermediate artifacts at phase boundaries. A gate check is a list of items that must exist before the next phase begins. If an item is missing, STOP and complete it.

**Gate check format (insert at each phase boundary in the skill):**

```
GATE CHECK: [Phase N] complete before proceeding to [Phase N+1]
Confirm the following exist in your working notes:
- [ ] [Artifact 1 from Phase N]
- [ ] [Artifact 2 from Phase N]
- [ ] [Artifact 3 from Phase N]
If any box is unchecked, STOP. Complete the missing item before proceeding.
```

**The anti-collapse signal:** If you find yourself producing the final deliverable (the .docx, the dashboard, the briefing) without having produced the intermediate artifacts from each phase, you have collapsed the workflow. Stop, go back to the first phase you skipped, and produce the intermediate artifacts.

Gate checks are skill-specific and defined in each skill's workflow section. This module defines the principle; the skills define the checkpoints.

## G3: Existing Document Context Is Primary Input (Negotiation Documents)

For any document that contains existing tracked changes, comments, or multi-author history:

1. **Read the existing context FIRST.** Before adding any new analysis, inventory what is already in the document:
   - Count and classify all tracked changes by author (Lilly side / Supplier side / Unknown)
   - Count and classify all comments by author
   - Build the Party Map (who is on each side)
   - Determine the negotiation round (how many author/date clusters exist)

2. **Respond to the existing context BEFORE adding new findings.** The existing tracked changes and comments are positions from Lilly stakeholders and supplier contacts. Every existing item must receive a response (accept, reject, counter, build on, or note as settled) before the review adds new findings.

3. **The signal of skipping this step:** If the review output contains no references to existing comments or tracked changes, and the document had them, the primary analytical step was skipped.

## G4: Cross-Reference Tracing for Defined Terms

When a finding involves data rights, IP ownership, AI/ML training, confidentiality, or any concept that has a defined term in the governing agreement:

1. **Identify the relevant defined term(s).** Look up the exact definition in the governing agreement's Definitions section or exhibit.

2. **State which definition applies and why.** Example: "Call recordings are 'Lilly Information' per MSA A.1.19 (information Supplier receives from Lilly or gains access to through Lilly as a result of performance under the Agreement), NOT 'Usage Data' per A.1.37 (usage and operations data in connection with Customer's use of the Service). This distinction matters because MSA 9.1.4 authorizes Supplier to use Usage Data to improve its products, but does not authorize use of Lilly Information for that purpose."

3. **A finding that references a contractual concept without tracing it to the governing definition is incomplete.** "The AI training language raises concerns about Lilly data" is not a finding. "HITL/Supervised Training uses Lilly call recordings, which are Lilly Information (A.1.19), not Usage Data (A.1.37), to train Supplier A models; MSA 9.1.4 does not authorize this use" is a finding.

**When to apply:** Any finding where the conclusion depends on which contractual definition applies. If two reasonable people could disagree about which definition covers the data or activity in question, the tracing is mandatory.

## G5: Dashboard Data-Model-First (HARD RULE for Dashboard-Producing Skills)

Skills that produce interactive dashboards (.jsx artifacts) must build the complete data model as an intermediate artifact before writing any rendering code.

**Required sequence:**
1. Complete all analytical phases (findings, benchmarks, positions, coverage, etc.)
2. Assemble the full data object as a structured JavaScript object at the top of the .jsx file
3. Only then write the rendering components that consume the data object
4. The data object must be complete and self-contained: if you delete the rendering code, the data object alone should document the full analytical output

**The anti-collapse signal:** If you are writing JSX component code (tabs, tables, cards, charts) before the data object is complete, you are collapsing analysis into rendering. Stop, complete the data object, then render it.

**Data model minimum for dashboard-producing skills:**
- All findings with tier, section reference, evidence, action, and impact
- All benchmarks with source, date, and confidence flag
- All coverage/protection items with status and governing-document reference
- All negotiation positions with rationale, fallback, and acceptance history (where applicable)
- All SME escalations with contact, topic, urgency, and brief

## G6: Pre-Delivery Self-Test

Before producing the final deliverable, every skill must run its own delivery checklist. The checklist is skill-specific and defined in the skill's workflow. This module defines the principle.

**Minimum universal checks (all skills):**
- [ ] Every section/tab of the deliverable is populated (no blank sections without a labeled state explaining why)
- [ ] Every finding, position, or recommendation has a specific action and a reason
- [ ] Every external data point has a source citation and confidence flag
- [ ] Every cross-reference to a governing document cites a specific section number (not "the MSA covers this")
- [ ] The deliverable matches the skill's locked structure (no tabs dropped, no sections reordered)
- [ ] No em dashes anywhere in the output

**The anti-shallow check:** Read the executive summary or decision tab. Does it contain specific numbers, specific section references, and specific actions? Or does it read like it could apply to any contract? If the latter, the analysis was shallow.

## G7: Research Minimums (Skills That Perform Web Search)

Skills that include external research phases must meet minimum search thresholds before producing output. The threshold is skill-specific, but the principle is universal:

- **State the minimum.** Each research phase declares its search minimum (e.g., "minimum 3 broad searches" or "minimum 5 searches per top-5 vendor").
- **Track searches performed.** Maintain a research log: query, source, result count, usable results.
- **If minimums are not met, label the output.** "RESEARCH PENDING: [N] of [minimum] searches completed. Results may be incomplete."
- **Never present thin research as complete.** If you found one data point, say "single source, LOW confidence," not "market rate is $X."

**Skills with research phases:** supplier-landscape (has minimums), category-strategy (has minimums), market-rate-benchmarking (has minimums), commercial-negotiation-prep (add minimums), lilly-contract-review Order Form / governing-agreement benchmarking (add minimums).

## G8: Pass Artifact Enforcement (HARD RULE for Multi-Pass Skills)

Skills that run a multi-pass workflow must produce a named intermediate artifact at the end of each pass and confirm it exists before starting the next pass.

- Name the artifact for each pass (for example PASS_1_STRUCTURE, PASS_2_COVERAGE, PASS_3_ANALYSIS, PASS_4_PREP for contract review; the analogous per-pass artifacts for response-analysis, category-strategy, and supplier-landscape).
- Before starting pass N+1, confirm the pass N artifact exists in your working notes. If it does not, STOP and produce it first.
- **The anti-collapse signal:** if you are writing the final deliverable (dashboard, DOCX, deck) without having produced every named pass artifact, you collapsed the passes. Go back and produce the missing artifact, then continue.

## G9: Anti-Collapse Signal (HARD RULE)

If the output shows any of the skill-specific collapse patterns below, the analysis was shallow. Stop generating and re-run the missing analysis:

- A finding that asserts a gap ("no renewal protection," "no AE clause") without first checking whether the governing MSA or an exhibit already covers it.
- A data, AI, or IP finding stated without tracing the controlling defined term through the governing documents (see G4).
- A volume-based engagement with no per-unit economics calculated.
- A Protection Score that does not reference governing-document protections, or was produced without the combined-protection-weighted method defined in the inlined `risk-scoring.md` section below.
- A locked-structure dashboard that is missing a canonical tab or sub-tab, or position cards missing their required persona variants.
- Any deliverable whose executive summary reads as if it could apply to any contract, supplier, or category (no specific numbers, sections, or vendor names).

## G10: Chunked Artifact Assembly (HARD RULE for Large Single-File Deliverables)

Applies to any large single-file artifact: an interactive JSX/React dashboard, a self-contained HTML page, or any inlined file likely to exceed ~150 lines. These MUST be assembled across multiple writes, never emitted in one create_file call. A single oversized write can exceed the response length limit and truncate the file mid-stream, especially late in a long session when less headroom remains. This is a delivery-mechanics rule, separate from G5: G5 says assemble the full data model before rendering; G10 says write the file itself in pieces.

Procedure:

1. Write to the persisted outputs directory (`/mnt/user-data/outputs`), never to scratch. A truncated turn loses scratch work.
2. Scaffold first: create the file with imports, the empty top-level component shell, and the export. Confirm it wrote.
3. Append one section per write: the data object, then the shared components, then each tab, panel, or slide group. Keep every write small enough to finish on its own.
4. Before `present_files`, run a structural self-test: balanced braces and parentheses, no truncated trailing token, no em dashes, no literal escape sequences shown as text, and totals reconcile to the sum of their parts.

If a write does not visibly complete, re-issue that one section. Do not proceed past an incomplete write.

## G11: Kernel-Backed Computation (HARD RULE for Kernel-Consuming Skills)

Where a skill vendors a numeric/decision kernel (a Python module, such as `numeric_kernel.py`, `frap_chain_kernel.py`, or `timeline_engine.py`, shipped in that skill's own directory), all arithmetic and lookups covered by that kernel MUST be computed by calling the kernel, never performed in prose or by model judgment.

- **The rule:** if a kernel function exists for a computation (a weighted score, an NPV, a percentile gate, an FRAP chain lookup, a critical-path calculation, an escalation threshold, or any other figure the kernel covers), that function is called and its return value is used verbatim. The model does not re-derive, sanity-check by re-computing, round differently, or "correct" the kernel's output through its own arithmetic.
- **A figure produced without the kernel is invalid.** If the kernel is missing, fails to import, or errors on the given input, the skill STOPS and reports the failure; it does not fall back to estimating the figure in prose. A plausible-looking number that did not come from calling the kernel is not a substitute and must not be presented as the computed result.
- **Scope:** this guardrail applies only to the specific skills that vendor a kernel (see each such skill's own HARD RULE kernel-wiring text for the exact function(s) and call sites). It does not require every skill in the suite to have a kernel; it requires that skills which do have one actually use it for everything the kernel covers.
- **The anti-collapse signal:** if the output contains a number that falls inside the kernel's covered scope but the working notes show no corresponding kernel call, the computation was collapsed into prose arithmetic. Stop, call the kernel, and replace the figure with its return value before continuing.

## G12: Claim-Gate, Cite or Abstain (HARD RULE, suite-wide)

Every CLAIM a skill emits is either cited or abstained. A claim is any assertion of fact, status, number, benchmark, score rationale, risk, or recommendation placed in a deliverable (dashboard, DOCX, deck, workbook, redline, or chat analysis). This consolidates the anti-fabrication rules already stated in GLOBAL OPERATING RULES 3 and 8 and the supplier-risk reference into one enforceable guardrail. It is an output-integrity discipline, not a computation: it adds no material token cost and requires no heavier model (a quick check still gets a light pass; a signing-stage deliverable gets the careful one).

- **CITED:** carries a specific, checkable source shown as a small evidence badge (not prose): a document plus section/page, a dated communication (email / Teams / call), a named dataset plus field, an accessed web source with URL plus capture date, or an explicit input the user supplied.
- **ABSTAINED:** if a claim cannot be cited, do NOT soften it into a vague generality and do NOT invent a plausible value. Emit an explicit gap marker: `[CONFIRM: exactly what is needed]` in prose or DOCX, or a labeled NEEDS_INPUT / NOT VERIFIED / RESEARCH PENDING / NOT APPLICABLE state in a dashboard (never a blanked or dropped section).
- **DROP, do not dilute:** a generated finding that cannot cite a source is dropped, not reworded into an unsupported observation.

Hard prohibitions:

1. **No fabricated "illustrative defaults."** Never fill a missing operational input with a made-up plausible value (a delivery-model split, a percentage, a sample supplier or rate) and disclose it afterward. Missing input means an abstain marker up front, never a guess.
2. **No premium or licensed-source leakage.** Never present a Gartner, Forrester, IDC, S&P Capital IQ, D&B, or Bloomberg finding as if it were queried unless it was actually accessed in this session. If it was not accessed, abstain. Canonical examples must not contain such results either.
3. **No unverified status assertions.** Never assert a debarment, sanctions, breach, financial-distress, or certification-held status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the named SME (the supplier-risk reference stays authoritative for the SME-routing specifics).

Confidence: when a claim is cited but the inference is soft, label it (a High / Moderate / Low band or an `Estimate` tag with the basis on hover or expand), never a bare "confidence: 73%."

**The anti-collapse signal:** if a deliverable contains a finding, number, status, or recommendation with no cited source and no abstain marker, the claim-gate was skipped. Stop, attach the citation, convert the claim to an abstain marker, or drop it.

---

## INLINED: references/risk-scoring.md

# Protection Scoring (Suite-Wide) - the combined-protection-weighted method

This is the single source of truth for how lilly-contract-review converts contract findings into a numeric **Protection Score** (0-100, where **higher = better protected / lower residual risk**). The score **starts at 100** (a clean, fully protected contract) and **deducts** points per finding, weighting each deduction down to the extent the governing documents (MSA, exhibits, DPA, prior order forms) already protect against the finding. A raw gap that the MSA already covers is not full-weight exposure, so it deducts less. This combined-protection weighting is the "combined-protection-weighted formula" that guardrail G9 requires; a Protection Score produced without it is invalid. (Supplier/TPRM risk is assessed QUALITATIVELY via the inlined `supplier-risk.md` framework, not on this numeric scale; never treat a supplier-risk rating and a contract Protection Score as the same metric or as directly comparable.)

## Scale

- The Protection Score runs **0 to 100**, where **higher = better protected (lower residual risk)**. This is the contract Protection index, distinct from the 0.0-5.0 evaluation/quality scale (see the inlined `scoring-scales.md` below). Do not conflate them.
- Bands (the residual-risk level each score implies): **75-100 Low**, **50-74 Moderate**, **25-49 High**, **0-24 Critical**.

## Inputs

For each finding, capture before scoring:

1. **Severity** of the finding (Hard Stop / HIGH / MEDIUM / LOW / Protection Gap).
2. **Combined-protection status** of the finding's protection category, from the governing-document coverage check (Standalone / Governed: Covered / Governed: Confirm / Governed: Gap). This MUST be justified by a specific cited section; if you did not check the governing documents you cannot assign it, and per G9 the Protection Score is invalid.

## Formula

Start at **100** (a clean, fully protected contract) and **deduct** per finding, weighted by how much the governing documents already cover that finding's category (a finding the MSA already covers deducts less than the same finding standalone):

| Finding Severity | Standalone | Governed: Covered | Governed: Confirm | Governed: Gap |
|---|---|---|---|---|
| Hard Stop | -15 | -15 (never reduced) | -15 | -15 |
| HIGH | -7 to -10 | -3 to -5 | -5 to -7 | -7 to -10 |
| MEDIUM | -4 to -6 | -2 to -3 | -3 to -4 | -4 to -6 |
| LOW | -2 to -3 | -1 | -1 to -2 | -2 to -3 |
| Protection Gap | -3 to -5 | -1 to -2 | -2 to -3 | -3 to -5 |

```
total_deductions = sum(per-finding deductions)
protection_score = max(0, 100 - total_deductions)        // higher = better protected
```

Worked micro-example (illustrative; numbers reconcile):

| Finding | Severity | Coverage | Deduction |
|---------|----------|----------|-----------|
| Uncapped liability (MSA cap excludes this carve-out) | HIGH | Governed: Gap | -9 |
| No data-breach notification SLA (DPA silent) | HIGH | Standalone | -8 |
| Auto-renewal; MSA gives 60-day termination for convenience | MEDIUM | Governed: Covered | -3 |
| Vague acceptance criteria | MEDIUM | Standalone | -5 |
| Covered clarifications and template restorations | LOW/MEDIUM | Governed: Covered | -5 |
| **Total deductions** | | | **-30** |

Protection Score = max(0, 100 - 30) = **70 (Moderate)**. Every deduction is weighted by a cited coverage status; the protection check is what separates a netted 70 from a naive, un-netted lower score. Show this calculation table in the output (per the inlined validation-checklist): a Protection Score without a visible derivation is invalid. (lilly-contract-review's `references/risk-scoring.md` carries the full deduction table and the detailed worked example; it is the same method.)

## Rules

- **Reduce a deduction only with a citation.** Moving a finding off the Standalone column (reducing its deduction because the governing documents protect against it) requires naming the governing section that provides the protection. No citation = Standalone column (full deduction).
- **Gating items are not scored, they gate.** Debarment, sanctions/exclusion, and unresolved Hard Stops are pass/fail gates flagged for SME screening per the inlined `sme-matrix.md`. Never let a high Protection Score mask an unresolved gating item.
- **Reconcile counts.** State how many findings are HIGH/MEDIUM/LOW and confirm the count matches the rows scored, so the prose and the data model agree.

---

## INLINED: references/scoring-scales.md

# Scoring Scales (Suite-Wide) - the one canonical evaluation scale

There is exactly ONE evaluation/quality scale for the **formal evaluation chain**: **0.0 to 5.0**, tied to a five-tier requirements mapping. It governs criterion/requirements scoring across rfp-engine (the requirements matrix and the demo-evaluation rubric), rfp-response-analysis, evaluation-engine, and supplier-deep-dive's fit score. Skills in that chain emit on this scale, and skills that consume those scores (for example evaluation-engine consuming rfp-response-analysis) read it unchanged. Within the evaluation chain, do NOT use a 0-10 or 0-100 quality scale; if a source is on another scale, rescale to 0.0-5.0 at a single, stated rescale point before using it.

**What this scale does NOT govern** (these are deliberately separate metrics, not evaluation scores, and must NOT be rescaled to 0.0-5.0): supplier-landscape's discovery-stage capability-fit score (a 0-10 shortlisting tool that is never handed off downstream as a number; its hand-off carries only categorical Strong/Moderate/Weak), the 0-100 contract Protection Score in `risk-scoring.md`, negotiation difficulty (0-100), and data-quality (0-100).

(This is the EVALUATION scale. It is separate from the 0-100 contract Protection Score in `risk-scoring.md` above. A "4.6" is a quality score; a "70" is a Protection Score. Never mix them.)

## The five tiers (0.0-5.0)

| Score band | Tier label | Meaning |
|------------|-----------|---------|
| 4.5 - 5.0 | Fully Meets | Requirement fully satisfied, no gap. |
| 3.5 - 4.4 | Largely Meets | Satisfied with a minor, non-material gap. |
| 2.5 - 3.4 | Partially Meets | Material gap; usable with remediation. |
| 1.0 - 2.4 | Minimally Meets | Significant gap; high remediation burden. |
| 0.0 - 0.9 | Does Not Meet | Requirement not satisfied. |

## Weights

- Category and requirement weights are **fractions that sum to 1.0** (for example 0.30, 0.25, 0.20, 0.15,
  0.10). They are NOT percentages stored as 30, 25, 20... If a schema stores a weight as `30`, divide by
  100 before computing, or the weighted score is inflated 100x. Store and compute as fractions.
- Weighted score for a category = sum over requirements of (requirement_score * requirement_weight),
  on the same 0.0-5.0 scale. Overall score = sum over categories of (category_score * category_weight).

## Pending / not-yet-submitted dimensions

A dimension that has not been scored yet is a labeled partial state (NEEDS_INPUT / RESEARCH PENDING), NOT
a real 0.0. Do not let an unsubmitted dimension drag a weighted total down as if it scored zero; exclude
it from the denominator and label the total as partial until the dimension is scored.

## Where to render the legend

Any dashboard or report that shows these scores prints a one-line scale legend ("0.0-5.0: 5 = Fully
Meets ... 0 = Does Not Meet") so the reader knows the scale. The legend must match the axis actually
rendered; never print a 0-5 legend on a 0-10 axis.

---

## INLINED: references/sme-matrix.md

# SME Routing Matrix (Suite-Wide)

The single source of truth for which subject-matter expert (SME) owns which class of issue. The
contracting, negotiation, supplier-risk, and RFx skills route specialist items here rather than
adjudicating them. The rule is simple: these skills surface and draft, the named SME decides. Never
assert a specialist outcome (a legal position, a security clearance, a privacy approval) as settled;
flag it and route it. Gating items (debarment, sanctions, GxP) are always escalated, never assumed clear.

| Issue class | Route to (SME function) | Typical contact channel | What the skill does vs. what the SME owns |
|-------------|-------------------------|-------------------------|-------------------------------------------|
| Legal terms, liability, indemnity, IP ownership, governing law | Legal / Contracting Counsel | Legal intake / assigned counsel | Skill drafts the redline and the position; Counsel approves the legal position. |
| Information security, breach history, certifications (SOC 2 / ISO 27001 / HITRUST / FedRAMP), pen-test posture | Cyber ISS (Information System Security) | Cyber ISS intake | Skill flags the gap and questionnaire items; Cyber ISS adjudicates the security posture. |
| Data privacy, data residency, subprocessors, PHI/PII, AI/model training on customer data, DPA terms | Privacy Office | Privacy intake | Skill flags the data-handling exposure and DPA gaps; Privacy Office approves the data position. |
| Debarment, HHS-OIG exclusion, OFAC/sanctions, global trade restrictions (GATING) | Compliance / Trade Compliance | Formal screen request | Skill flags "requires a formal screen" and never asserts a clean status; Compliance runs the screen. |
| GxP / regulated-process posture (GMP, GDP, GCP), validation, quality agreements | Quality / GxP | Quality intake | Skill flags the GxP touchpoint; Quality owns the determination and any quality agreement. |
| Anti-corruption / FCPA, third-party intermediary risk | Ethics & Compliance | E&C intake | Skill flags the exposure; E&C owns the determination. |
| Financial health, credit, going-concern, PE-exit pressure | Finance / Procurement Finance | Finance review | Skill summarizes disclosed/inferred financial signals (labeled); Finance owns the credit view. |
| Tax, transfer pricing, withholding | Tax | Tax intake | Skill flags the question; Tax owns the answer. |
| Insurance, certificates of insurance, coverage limits | Risk Management / Insurance | Risk Mgmt intake | Skill flags coverage gaps against requirements; Risk Mgmt owns adequacy. |
| Sourcing strategy, threshold/approval routing (FRAP), policy interpretation | Procurement category lead / process-navigator | Internal | process-navigator answers policy/threshold questions with cited sources; the category lead owns the sourcing decision. |

## Rules

- **Escalate gating items unconditionally.** Debarment, sanctions/exclusion, and GxP gates are escalated
  whenever in scope; "no evidence found" is not a clean status (see the inlined supplier-risk reference).
- **One issue can route to more than one SME.** A breach involving PHI routes to both Cyber ISS and the
  Privacy Office. List every applicable SME, do not pick one.
- **Draft, do not decide.** Skills may draft an SME pre-engagement note (recipient, the specific question,
  the relevant clause/section, what is needed back), but the user sends it and the SME decides. No
  auto-send (see user-manual S4 and the suite-wide read-and-draft rule).

---

## INLINED: references/house-styles.md

# House Styles (Suite-Wide)

The suite uses THREE named output house styles. They are intentionally different because they serve different audiences and channels. "Lilly branding" is not one palette; it is whichever of these three applies to the deliverable you are producing. Pick the right one, then use it consistently. Do not invent a fourth palette, font, or component set, and do not mix styles within one deliverable.

Token values live in `brand-colors.md`. Dashboard components live in `dashboard-components.md`. DOCX formatting lives in `docx-design-system.md` and `docx-title-page-spec.md`. This file says WHICH style applies and WHAT each one is; those files are the single source for the exact values. Reference them; do not restate their values inline in a skill.

## 1. Magazine Report (the default for analytical DOCX + dashboards)

Marketing-piece-quality layout for reports and interactive dashboards.

- **Used by:** lilly-contract-review (review summary + 3-panel dashboard), supplier-landscape, rfp-response-analysis, evaluation-engine, category-strategy, market-rate-benchmarking, and the negotiation briefings.
- **Palette (from the inlined `brand-colors.md`):** Lilly Red `#E1251B` (table headers, accents, dividers), Lilly Black `#212121` (body text and dashboard header bar), Bold Blue `#0F3A85` (section headers / H1-H2), Bold Brown `#521207` (metadata, abstracts), Neutral Stone `#E4EBF1` (callouts, label cells), warm/risk/ok tints for status.
- **Type:** DOCX reports in Calibri (body 10.5-11pt, H1 13-15pt, H2 13pt). Dashboards use Arial body with Georgia serif for titles, card titles, and large numbers.
- **DOCX chrome:** locked left-aligned title page, badge section dividers (01, 02...), KPI cards, callout boxes, header (report type + Confidential) and footer (Confidential + page) per `docx-title-page-spec.md`.
- **Dashboard chrome:** dark charcoal header bar with a 4px red left rule and red eyebrow; tab nav with NEEDS_INPUT dot markers; dark footer carrying the scoring legend + "Company Confidential | <skill-name> | procurement guidance, not legal advice."
- **Dashboard logo (subtle, all dashboards, every run):** place the Lilly mark in the **top-right corner of the dark header bar**, vertically centered within the bar, about 20-24px tall, preserving aspect ratio. Same position on every dashboard and every tab. Use the bundled WHITE variant on the dark header (`assets/logos/Lilly-L-Monogram-White-RGB.png`, or `Lilly-Script-White-RGB.png` if you prefer the wordmark) read from this skill's assets and embedded into the JSX as a base64 data URI so it renders in the artifact (do NOT reference a file path or a remote URL, and do NOT hand-draw a substitute SVG). Keep it understated: it sits in the existing header, adds no new bar or band, and must not change the layout, the palette, the tab structure, or any spacing.

  Graceful degradation (do them in this order; the dashboard is always delivered either way): (1) if the WHITE monogram cannot be embedded, try the WHITE script wordmark `assets/logos/Lilly-Script-White-RGB.png`; (2) if no logo asset can be read or base64-encoded at all, render the existing text eyebrow "ELI LILLY AND COMPANY" in white in that top-right slot at the same size, which keeps the brand cue without an image; (3) only if even that is not possible, omit the mark silently. Never reference a file path or remote URL in the JSX, never hand-draw a substitute logo SVG, and never block or alter the dashboard because the logo is unavailable.

## 2. Plain ATC/ATS (approval-workflow documents)

The deliberately plain Lilly-approved approval format. NOT a magazine piece.

- **Used by:** executive-summary-package only.
- **Type/chrome:** Arial 11pt body, bold inline section headers (NO colored banners, NO shaded boxes, NO dashboard tables), simple tables for financial data only, governance fields as bold-label + value lines, 2-page hard limit.
- **Why different:** this format is what the Lilly approval workflow expects on submission. Do not "upgrade" it to the Magazine style.

## 3. Slide Template (executive presentations)

Lilly's deck template palette, distinct from the report palette.

- **Used by:** no shipped skill currently. Its prior and only consumer, decision-deck, has been retired; this house style remains documented, unused, for any future PPTX-producing skill.
- **Palette:** panels cream `#FFF0D8` / peach `#FDD1B0` / sage `#C6DCD8` / white; headers dark `#212121` / gold `#FFC709` / sage / peach; data greens/teals positive, reds negative, amber caution, purple/navy scenarios.
- **Type/chrome:** LAYOUT_WIDE, locked template set, size-to-content components, narrative 30-50% of slide area, headlines state insights not topics.
- **Why different:** it matches Lilly's official slide templates, not the report system. Keep PPTX in this style and reports/dashboards in the Magazine style.

## Component registry (dashboards)

Canonical shared components (implementations in `dashboard-components.md`): `Metric`, `Card`, `STable` (sortable + searchable), `Pillar`, `SevPill` (severity), `PrioPill` (priority), `Tip`, `StateBanner`, `ScoreCell` / `PctCell`. Use these; do not hand-roll equivalents. A skill may use a subset, but must not rename them or introduce off-registry components for the same purpose. Labeled states are always NEEDS_INPUT / NOT APPLICABLE (with a one-line reason) / RESEARCH PENDING.

## The rule

Every DOCX, dashboard, or deck states which house style it used (implicitly, by following it) and pulls exact values from `brand-colors.md` / `dashboard-components.md` / `docx-design-system.md`. Skills should reference those files rather than restating their values; restated copies drift. No off-style palettes, fonts, or components.

---

## INLINED: references/narrative-standards.md

# Narrative Standards (Suite-Wide)

Shared enforcement for the written quality of every analytical document, deck, and dashboard in the suite. Read this whenever a skill produces a DOCX report, a dashboard, a deck, or a briefing. The goal: output that reads as connected analysis a procurement leader can act on, not a database export or a wall of bullet fragments.

## The standard

**Every section (and every dashboard tab) contains at least one full paragraph of connected prose.** Data tables, bulleted lists, and KPI cards are interspersed where they add value, but they never stand in for the analysis. A tab or section that is only a table, or only bold-label fragments, is incomplete.

**Every insight is specific and tied to a decision.** Not "there are multiple suppliers" but "spend is fragmented across 12 vendors, creating a consolidation opportunity and weakening leverage at renewal." Every recommendation states what to do, why it matters, and (where applicable) its impact and effort.

**Depth is proportional to the input, not padded.** Match analytical depth to the material: a 280-page submission earns several pages of analysis; a 35-page one earns less. Never inflate a thin section with filler; if research genuinely returned nothing, say so with a labeled state (NEEDS_INPUT / NOT APPLICABLE / RESEARCH PENDING) rather than padding.

## Anti-patterns (explicitly prohibited)

1. **Key-value dump profiles.** A profile is not a 2-column table of "Headquarters | Walldorf." Open with a 2-3 paragraph narrative introduction; use a compact data table only for the 4-5 most critical numeric fields.
2. **Compressed single-sentence fragments.** "Implementation. 3 phases, 600 days." is not analysis. Write the paragraph that explains what it means and why it matters.
3. **Bold-label sentence fragments as a substitute for prose.** A sequence of "**Term:** value" lines is not a section. Each section must read start-to-finish as flowing text.
4. **Tables used as the primary container for narrative.** Tables are for data (scoring matrices, heatmaps, pricing, requirements fit). Narrative belongs in paragraphs.
5. **"+" / "-" as bullet substitutes.** Use real bulleted/numbered lists for genuinely list-worthy items (strengths, risks, clarifications, next steps).
6. **Generic executive summaries.** If the executive summary could apply to any contract, supplier, or category (no specific numbers, section references, or vendor names), the analysis was shallow. Re-run it.
7. **"See the dashboard" as a substitute for content in a DOCX** (or vice versa). Each deliverable must be complete on its own.

## Acronyms and terminology

- Spell out every acronym on first use in both DOCX and dashboards (Fully Meets, Master Services Agreement, Supply Chain Planning, etc.).
- Use the suite-standard vocabulary consistently: Kraljic (strategic / leverage / bottleneck / routine), TCO, tail spend, addressable vs non-addressable spend, should-cost, rate card, TfC (termination for convenience).
- If a deliverable uses more than 5 unique acronyms, include a glossary (DOCX) or a footer legend (dashboard).

## Section transitions

Each major section opens with 1-2 sentences establishing what it covers and why it matters, before the detail. Do not open a section with a raw table.

---

## INLINED: references/supplier-risk.md

# Supplier Risk (Suite-Wide, Lite Reference)

A compact, shared supplier-risk framework that the contracting, negotiation, and RFx skills (and the negotiation simulator) read when they need to assess a supplier. It is deliberately LIGHT: a consistent set of risk dimensions plus hard anti-fabrication rules. It is not a standalone deliverable, and it is not a full third-party-risk-management dossier (the suite does not have the data for that). Produce risk findings in the consuming skill's native format and route specialist items per the inlined `sme-matrix.md` section below.

## Hard anti-fabrication rules (MUST, override any "be helpful" instinct)

- **Never assert a supplier's status as fact without a verifiable source.** Debarment, sanctions/exclusion, litigation, data breach, regulatory action, certification, or financial distress must trace to an actual checked source (regulator list, SEC/Companies-House filing, reputable report) or a user-provided document. If you have not verified it, say "not verified in available sources" or "requires a formal screen." NEVER invent, assume, or infer a status.
- **Debarment / sanctions / exclusion are gating and high-stakes.** FDA debarment, HHS-OIG exclusion, OFAC/sanctions, and global trade restrictions: report a hit ONLY from an actual checked source; otherwise flag "requires a formal screen" and route to the SME. Absence of evidence is NOT a clean status. Never tell a user a supplier "is clear" of these unless a real screen confirms it.
- **Label every item:** VERIFIED (source + as-of date), INFERRED (from public profile or category norms, lower confidence), or UNKNOWN. Attach a High/Medium/Low confidence flag and cite the source per `validation-checklist.md`.
- **Do not fabricate** financials, certifications (SOC 2 / ISO 27001 / HITRUST / FedRAMP), breach history, subprocessors, or client lists. "Not disclosed" / "not found" is an acceptable answer.
- **Web-sourced risk data follows G7** (research minimums + research log + confidence). A single weak source is "LOW confidence," never a firm finding.

## Risk dimensions (lite)

- **Financial health:** public (filings, market cap, debt), private (what is disclosed); flag pre-profitability, PE-exit pressure, acquisition uncertainty. Mark inferred vs disclosed.
- **Cyber / InfoSec:** certification status, known breaches, questionnaire gaps. Route security specifics to Cyber ISS (per the inlined `sme-matrix.md` section below), do not adjudicate them here.
- **Data / privacy:** data residency, subprocessors, AI/model training on customer data, PHI/PII exposure. Route to the Privacy Office.
- **Geopolitical / trade:** headquarters and data-residency jurisdiction, sanctions exposure, supply-chain concentration and disruption risk.
- **Operational / concentration:** single-source exposure, hyperscaler/sub-supplier dependency, key-person risk, capacity, product stability.
- **Pharma-specific gates (gating):** FDA debarment, HHS-OIG exclusion, GxP posture, HIPAA BAA need, FCPA/anti-corruption, trade sanctions. Unverified = escalate, never assume clear.
- **ESG / supplier development:** diversity certifications, sustainability commitments. Informational unless a requirement applies.

## How consuming skills use this

Read this when assessing a supplier's risk (contract review supplier context, legal/commercial negotiation prep, supplier landscape, evaluation, negotiation simulator). Keep the read proportional to the task: a lite, clearly-sourced risk picture, with gating items (debarment/sanctions/regulatory) explicitly flagged for a formal screen rather than asserted. SME routing and the comment/finding format follow the consuming skill's own rules.

---

## INLINED: references/user-manual.md

The complete user manual now lives in `references/user-manual.md`, loaded on demand,
not inlined here. Read it when a user asks how to use a skill, what a skill does, model
selection guidance, troubleshooting, or any general question about the suite, or when
generating the manual as a branded Word document (see 'Producing the user manual as a
branded document' above). Do not inline its content back into this file.

---

## INLINED: references/validation-checklist.md

# Validation Checklist (Suite-Wide)

Shared pre-delivery validation for any skill that emits numbers, findings, or multiple cross-referenced artifacts. Run this AFTER generating outputs and BEFORE presenting them. This is a cross-check of the outputs against each other and against the source, not a re-read of the inputs.

## 1. Numbers

- [ ] Every arithmetic result verifies: line-item math, subtotals, grand totals, NTE, per-unit economics. Show the calculation where a number drives a decision.
- [ ] Escalation / increase math is correct (compounding vs simple; renewal-cap compliance; formula-derived rates).
- [ ] **Emit the calculation table.** Where a score or total is derived (risk score, weighted evaluation score, TCO, savings estimate), the calc table (inputs, weights, deductions, result, rationale) appears in the output, not just in working notes. A score produced without a visible derivation is invalid.
- [ ] Number formatting is consistent within the deliverable: currency symbol + code, decimal places, percentage style. State any FX assumption and its date; never silently mix currencies.

## 2. Sources

- [ ] Every external figure carries a source name, link where available, an "as of" date, and a High/Medium/Low confidence flag, and that flag actually RENDERS in the deliverable (not just instructed).
- [ ] Every internal reference carries light provenance: clause/section number, data field + period, requirement ID, or supplier-response section.
- [ ] No fabricated figures. A single weakly-sourced data point is labeled "single source, LOW confidence," never presented as a firm benchmark. "Not available for this category" is an acceptable answer.

## 3. Facts and findings

- [ ] Every finding traces to specific text/data (section number, quoted phrase, or located clause). No finding cites a section, clause, or field that does not exist in the source.
- [ ] VERIFIED vs ASSUMED is visible: anything not confirmed from a read document is labeled ASSUMED/UNVERIFIED.
- [ ] No finding flags an issue the governing documents already resolve (combined-protection check).

## 4. Cross-artifact consistency

- [ ] Every finding/score in the dashboard appears in the DOCX (and vice versa); the two never disagree.
- [ ] Report rankings match the score rollup; the JSON/CSV pipeline artifacts contain the same data shown in the report.
- [ ] Dashboard depth matches the DOCX: every narrative section in the report has a corresponding populated panel; no tab is thinner than its report section.
- [ ] Headline/summary figures reconcile with the detailed tables they summarize.

## 5. Structure and style

- [ ] The deliverable matches its skill's LOCKED skeleton (no tab/section dropped, reordered, or renamed); every canonical tab/section renders or shows a labeled state.
- [ ] DOCX/dashboard/deck follow the suite house style (see `docx-design-system.md`, `dashboard-components.md`, `brand-colors.md`). No off-brand colors, fonts, or ad-hoc components.
- [ ] No em dashes; no literal escape codes or HTML entities rendered as visible text.
- [ ] Narrative standards met (see `narrative-standards.md`): every section/tab has connected prose, not just tables or fragments.

If any box fails, fix it before presenting. Do not deliver a partially-validated artifact.

---

## BINARY ASSETS (bundled; fallback upload only)

These logo assets are bundled inside this skill package. Do not upload them separately during normal installation. Only upload them to Project Knowledge if the skill reports a missing-logo or missing-asset error at runtime. The files (with matching filenames) are:

- `assets/logos/Lilly-AMC-Lockup-H-Small-Black-RGB.png` (45KB)
- `assets/logos/Lilly-AMC-Lockup-H-Small-Red-RGB.png` (50KB)
- `assets/logos/Lilly-AMC-Lockup-H-Small-White-RGB.png` (50KB)
- `assets/logos/Lilly-AMC-Lockup-V-Black-RGB.png` (72KB)
- `assets/logos/Lilly-AMC-Lockup-V-Red-RGB.png` (82KB)
- `assets/logos/Lilly-AMC-Lockup-V-White-RGB.png` (82KB)
- `assets/logos/Lilly-L-Monogram-Black-RGB.png` (54KB)
- `assets/logos/Lilly-L-Monogram-Red-RGB.png` (64KB)
- `assets/logos/Lilly-L-Monogram-White-RGB.png` (64KB)
- `assets/logos/Lilly-Script-Black-RGB.png` (67KB)
- `assets/logos/Lilly-Script-Red-RGB.png` (79KB)
- `assets/logos/Lilly-Script-White-RGB.png` (79KB)
- `assets/logos/logo-blk-footer.png` (22KB)
- `assets/logos/logo-script-wht.png` (59KB)
- `assets/logos/logo-wht-red.png` (23KB)



---

## INLINED: references/aria-enrichment.md

The full ARIA enrichment spec now lives only in `references/aria-enrichment.md`, loaded
on demand by the 15 gated skills that carry the ARIA-ENRICHMENT pointer block. This
duplicate inlined copy has been removed; the companion file is the single source of truth.
If a skill's own pointer says 'search INLINED: references/aria-enrichment.md' and it is
not found here, read the companion file directly instead.