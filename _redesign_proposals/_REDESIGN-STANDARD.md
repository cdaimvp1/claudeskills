# Dashboard redesign standard (canonical) - v1, 2026-07-22

The single source of truth for redesigning every skill dashboard to match the platform. The
corrected `_dashboard_previews/supplier-landscape-REDESIGN.html` is the CANONICAL REFERENCE
IMPLEMENTATION - copy its shell (topbar, tokens, tabs, fonts, card system) verbatim; only the
body content changes per skill. Platform (READ-ONLY) = `C:\Users\marcs\OneDrive\Desktop\lilly IT
intake and orchestration tool`.

## The four structural properties (every dashboard must have all four)
1. **Purposeful IA / consolidation.** Consolidate thin tabs (1-2 viz) into coherent, task-grouped
   tabs. Structure around how the user works the problem, not by data source. Nothing decorative.
2. **Viz + substantive narrative.** Every visualization is paired with a "what it means / what to
   do" insight (not a caption).
3. **Linked focus.** Clicking an entity (supplier, heatmap cell, bar, dot) refocuses the narrative
   and related panels to THAT entity, inline. Client-side coordinated views.
4. **Canonical viz components.** One shared component per shape (one heatmap, one waterfall, one
   quadrant, one tornado, one ranking bar, one KPI tile), with narrative-pairing + linked-focus
   built in. No skill hand-rolls its own variant. (Marc's example: contract-review's discount
   waterfall and pro-forma's must be ONE component.)

## Marc's HARD design rules (locked 2026-07-22 - all applied in the canonical exemplar)
- **Fonts (real, embedded offline):** Libre Franklin (UI/titles), Roboto Mono (all numbers/ids/
  dates), **Sacramento (the "Theo" wordmark ONLY)**. Embed as base64 @font-face from the platform's
  `assets/fonts-inline.css` (families: Sacramento, Libre Franklin, Roboto Mono; skip Newsreader).
  NOTE: the full 3-family bundle is ~1.4MB; for the local previews that is fine, for a shipped skill
  artifact use a trimmed weight set (LF 400/600/700/800, RM 400/500, Sacramento 400).
- **Off-white / black shell, NO dark mode.** Page `--bg:#E2E6E1`, white card surfaces, neutral shade
  ladder (surface/panel/nested/well). Remove all `html[data-theme="dark"]` tokens + any theme toggle.
- **Topbar (off-white, black):** plain **Lilly-Script-Black** wordmark (`assets/logos-lilly/
  Lilly-Script-Black-RGB.png`, base64; NOT the "A Medicine Company" lockup) + a 1px divider + "Theo"
  in Sacramento + a **bare dino mark** (`theo-dino-mark.png`, CSS `filter:brightness(0)`). NO circular
  bubble, NO "Theo assistant" button (the assistant lives in Claude Desktop). NO left icon nav rail
  (these run inside Claude Desktop).
- **Header/body divider = BLACK** (`.dash-head border-top` uses `--ink`, not `--pri`/blue).
- **Tabs / subtabs / sub-subtabs active = BLACK** (`--ink`), never blue. (Underline text-tabs for
  primary; segmented pill for tertiary; the segmented pill active is white-bg + ink-text.)
- **No little meta-caption notes.** Remove the grey stat/provenance sub-lines under titles ("N
  vendors . N categories . 5-point scale . credible public sources, not validated", "5 dimensions x
  3 vendors . higher is worse", etc.). They add no value. (In the exemplar: header meta removed;
  card `.cs` sub-notes hidden via `.card-hd .cs{display:none}`.)
- **Titles: Title Case** - capitalize the first letter of every word; never sentence case, lowercase,
  or mixed. Dashboard titles read like "Supplier Landscape Search - Cloud Data Warehouse" (a real
  title, not "... market scan").
- **Colour does a job (locked canon, from the platform):** off-white + near-black + a per-family
  accent pair + a scarce Lilly Red (brand/danger only) + a 4-5 tone status vocabulary. **Green
  allowed for done/ok, sparingly, never beside red.** `--ent-1..5` categorical, separate from status
  tones. Per-family accent pairs (plum-teal / navy-teal / green-navy / graphite-plum / burgundy-navy)
  assigned by skill family (see Platform Design System.md).

## Platform source files to lift (do not reinvent)
- Header/shell: `assets/app-shell.css` (.topbar), `my-work.html` (the exact off-white/black header
  markup Marc likes), `assets/theo-brand.js`.
- Tabs/cards/heatmap: `assets/pv/pv.css`, `assets/dash-kit.css` + `assets/dash-kit.js` (DK.metric/
  card/pillar/banner/sevPill/table + the chart primitives), `assets/theo-color.css` (authoritative
  token layer).
- Fonts: `assets/fonts-inline.css`. Logos: `assets/logos-lilly/Lilly-Script-Black-RGB.png`, dino
  `assets/theo-dino-mark.png`.
- Per-tab IA + interactions: each area has a Marc-approved spec in `_audit_workspace/*.md` (e.g.
  `landscape-redesign-spec.md`, `rfx-tab-redesign-spec.md`) - FOLLOW THESE for structure; and a
  per-area proposal in `_redesign_proposals/`.

## Reusable patch (for a dashboard already built to the new structure but needing the corrections)
`scratchpad/patch_landscape.py` applies the shell corrections (fonts, no-dark, logo, black tabs +
divider, bare dino, hide `.cs`, Title-Case `.ct`+KPI) with per-edit assertions (aborts on drift).
Adapt its selectors per dashboard; verify with `node --check` on the extracted `<script>`.

## Build + verify checklist per dashboard
1. Consolidated IA per the skill's `_audit_workspace` spec (or its `_redesign_proposals` file).
2. Canonical shell copied from the canonical exemplar (topbar, tokens, tabs, fonts, cards).
3. Every viz has a narrative; linked-focus wired; canonical components used.
4. All Marc hard rules above.
5. Verify: `node --check` on the main script = 0; grep 0 for `undefined`/`NaN`/`[object Object]`,
   `data-theme="dark"`, green-in-status, em dashes; confirm Title Case, plain Lilly logo, bare dino,
   black tabs/divider. Open in browser.

## Rollout status
- DONE: supplier-landscape (canonical reference exemplar).
- NEXT (Marc's priority): Personal Command Center (theos-field-guide) per `my-work-tasks-drawer.md`
  + this standard + frozen storage key `theo.fieldguide.workgraph.v1` / file `theo-workgraph.json` /
  id `theos-field-guide-1c344a`.
- THEN family-by-family: RFx, Category Strategy, Deal, Overview/Docs/Comms, and the remaining skills,
  each per its `_audit_workspace` spec + this standard. Do NOT mass-build before Marc validates the
  exemplar + PCC.
