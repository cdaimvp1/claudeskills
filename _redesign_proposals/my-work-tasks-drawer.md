
# PCC Redesign Spec: Personal Command Center = Platform "My Work" + Tasks Drawer x Current Field Guide

Scope: theos-field-guide-1c344a (engine.html = the self-contained vanilla-JS "Personal Command
Center" artifact). Platform reference is READ-ONLY: `C:\Users\marcs\OneDrive\Desktop\lilly IT
intake and orchestration tool\my-work.html` (+ `assets/my-work/my-work-0X*.js`,
`assets/tasks-drawer.css`, `assets/tasks-drawer.js`, `assets/theo-brand.js`). Current PCC =
`theos-field-guide-1c344a/references/field-guide-engine.html` (== `_dashboard_previews/
personal-command-center.html`, byte-identical, 2898 lines). Frozen identifiers this proposal
MUST NOT change: storage key `theo.fieldguide.workgraph.v1`, export file `theo-workgraph.json`,
skill id `theos-field-guide-1c344a`.

---

## 1. PLATFORM (what it does well)

### 1a. My Work page (`my-work.html`) - structure

Single scrolling page, numbered collapsible sections, in this order:
1. Pinned KPI cards (sticky under the topbar): 4 cards (Active projects, Completed projects,
   Contracts in-progress vs completed, Active committed spend), each with a hover tooltip that
   breaks the number down by type (`.pincard .ptip`, dark popover, per-type rows + total).
2. Portfolio scale band (book context, 3 big-number tiles + a context sentence) - collapsible.
3. **Section 1, My Workload**: `Portfolio Timeline` - a real-calendar-week Gantt: one lane per
   project, gate nodes (`.node.done/.inprog/.blocked/.proj`) positioned by date-%, a dashed TODAY
   line, a focus row highlighted with a left accent bar + tinted background, hover tooltip
   (`.tltip`, dark card) showing what/when/owner/system/action, "+N more" progressive disclosure,
   a legend row.
4. **Section 2, My Report Card**: SLA-adherence card (`.slacard`, per-stage bars vs a dashed
   target tick, verdict pill) + a master/detail grade scorecard (`.rclist` rows -> `.rcdetail`
   panel with a ring/line SVG chart, GPA tile in a distinct plum gradient, grade-history matrix).
   A newer variant (`rcg2`/`.gcard`/`.gpa`) renders it as a flip-card grid instead (front = grade
   badge, back = 3-year trend, on hover/focus).
5. **Section 3, The Suppliers I Manage**: two-column card grid - ranked spend list with inline
   mini-bar meters (`.suplist.slim`), a spend-by-category donut (`.donut`), a Pareto 80/20 chart
   (bars + cumulative-% line + split marker), a Spend-Under-Contract coverage KPI (two-segment
   bar), an Upcoming-renewals list (`.renlist`/`.renrow`: soon/near/ok left-accent, notice-by
   date, auto-renew pill, renew/reneg/recompete recommendation pip).
6. **Section 4, My Savings**: hero $ number, CI-vs-CA split bar with a legend, a pipeline list
   with committed/pending/achieved status pips (`.savitem .sstat .pip`).
7. Section 5 (leadership lens only, hidden by default) and Section 6, Handover (relationship
   pivot table + de-identified brief + OOO checklist) - reflect-only, collapsed by default.
8. Delegate-my-work button + modal (segmented scope/duration pickers, a live mini-list of my
   delegations with per-row cancel).

Every section: a numbered `.sectitle` header (kx badge + title + meta + chevron, click to
collapse), a `.card` body (14px radius, 1px hairline border, `var(--shadow)`), consistent
zone-label convention (12px uppercase, muted), and an italic "reflect-only" note
(`.savnote`/`.rcnote`, sparkle bullet) at the foot of any section that could be mistaken for a
live system-of-record.

### 1b. Tasks drawer (`tasks-drawer.css`/`.js`) - structure

A right-anchored slide-in drawer (`.mqdrawer`, resizable via a drag grip, width persisted in
localStorage), opened from a `Tasks` button in the topbar (badge = live open count).
- Header: title "Ready for you this morning" + subtitle + a manual refresh icon + close X.
- A lede callout (sparkle bullet, tinted card): "I prepared these from your projects overnight...
  you review and send."
- Segmented tabs: **Now what? / Open N / Waiting N / Done & dismissed N** (`.mqtabs`/`.mqtab`,
  Waiting tab gets its own pink/red accent when active).
- A search + filter + sort toolbar (`.mqtools`): free-text search (icon-prefixed pill input),
  filter-by-kind dropdown, filter-by-project dropdown, sort-by dropdown (Priority/Due/Value).
- Rows (`.mqrow`, full-bleed, hairline divider, hover background): icon chip by kind
  (chase/decide/approve/sign/risk, colored `ai`/`amber`/`blue`/`red`), title (never truncated,
  wraps), a status tag pill, project/context line, an inline recommendation sentence with a bold
  "verb" (`mqeff`) naming the effect of the action, a "why this ranked" chip row
  (`$value` / `due Nd` / `your step` / `unblocks N`), an optional cited "Total Recall" precedent
  line with a confidence pill, an expandable "Why this is next" work-graph detail (task list with
  done/wait/open/blocked dots + an evidence list with source tag + auto/confirm chip), and a
  right-aligned action cluster: M365 hand-off icons (Outlook/Teams/Word/SharePoint, monochrome
  stroke, low-opacity until hover), a single primary glyph button whose ring color encodes TYPE OF
  URGENCY (red=overdue, amber=deadline, purple=unblocks-many, blue=time-window, grey=none) or a
  "Nudge" button when the pending owner is someone else, a quiet dismiss X, and an overflow kebab
  with every remaining labeled action.
- Waiting tab: a separate row shape (`.mqwrow`) - icon (waiting=grey clock, blocked=red alert),
  title, "waiting on **X** * project * PID", staleness age with color (old=red/mid=amber/
  fresh=grey), a Nudge button. Sorted stalest-first.
- Done & dismissed tab: same row shell, a state pill (Done=blue, Dismissed=grey-outlined), and a
  "Recall" ghost button to reopen.
- Footer: fixed reflect-only disclosure line.

### 1c. Why it reads as coherent

- **One color grammar everywhere**: red = brand/primary action only; blue = the ONLY "good/
  confirmed/on-track" accent (an explicit rule in the CSS comments: "positive accent = Bold Blue,
  never green"); amber = warning/medium; a soft purple only for "unblocks many"; grey/neutral for
  everything else. Every dashboard on the platform (My Work, Tasks, Category Strategy, etc.)
  draws from this same four-color grammar, so nothing on any page introduces a fifth meaning-color.
- **One card/zone vocabulary**: every panel is the same `.card` shell (14px radius, 1px line,
  soft shadow) with the same uppercase-eyebrow zone label convention, so panels read as
  instances of one system, not bespoke widgets.
- **One type stack**: Libre Franklin for UI text (weights 300-800), Roboto Mono for every id,
  date, dollar figure and count (visually separates "data" from "prose" at a glance).
  `Sacramento` (cursive) is reserved for exactly one thing: the "Theo" wordmark.
- **Density matches the job**: rows are compact (11-13px meta text) so a list of 20 items still
  fits without feeling sparse, but detail panels get generous padding (26-32px) so prose reads
  comfortably; the platform never applies the same spacing scale to both.
- **Grouping mirrors mental model, not data source**: sections are numbered in the order a rep
  actually works through their day/week (workload -> performance -> suppliers -> savings ->
  handover), not grouped by which backend feeds them.
- **Reflect-only is a visible, repeated pattern**, not a one-off disclaimer: every section that
  could be mistaken for live/writeback state carries the same sparkle-bullet italic note, and the
  Tasks drawer repeats "draft, never send" at both the lede and the footer.
- **Progressive disclosure everywhere**: collapsed sections, "+N more" lane truncation, hover
  tooltips instead of permanent labels, expandable "why" detail - the page front-loads only what
  is immediately decision-relevant and defers the rest to one click/hover.

---

## 2. SKILL DASHBOARD (current)

### 2a. Structure

A centered, floating "widget card" (not a full-bleed page): `body` is a flex-centered light-gray
canvas (`--lds-g-color-neutral-005`, #f5f5f5) and `.fg` is a max-width-1180px white card with its
own rounded corners and shadow - it reads as a demo/prototype embedded on a page, not as an
app screen.
- **Top bar** (black, `--lds-g-color-neutral-100` = #191919, white text): a T-rex emoji glyph +
  bold wordmark **Personal Command Center** + a divider + cursive (Sacramento) subtitle *Theo's
  Field Guide*; right side: on-demand View pills (Renewals/Savings/Report Card, only if data
  present) + a "Synced [time]" mono clock chip.
- Non-blocking data banner (hidden unless a bad JSON payload degrades to the saved board).
- KPI strip: 5 flat tiles (Open issues, Action now, Waiting, Meetings ahead, Aged 7d+).
- **Split body** (this is the piece Marc wants kept): left rail (322px) + right panel.
  - Left rail: 3-way mode toggle (Issues / Meeting Prep / Comms), a sort row (Priority/Aged/
    Newest), a search+filter-chip bar (topic/channel/party/status), a scrollable row list (dot by
    priority, id chip, title, due/age meta line, a staged-checkmark badge).
  - Right panel: for an Issue - id chip + title + meta line, a "Current state" zone (prose), a
    "Recommended next action" zone with a confidence pill (High/Med/Low) OR an **abstain block**
    ("Not enough signal to recommend a next move" + grounded reason + "what would resolve it"),
    and a pinned dock with a "Your direction" textarea + Stage/Remove buttons.
  - For a Meeting: read-only prep notes.
  - For Comms: a custom SVG "River of Convergence" (topic swim-lanes, bezier thread paths,
    status-ringed nodes) plus, per topic, a "Topic Flow" heat row (28-cell opacity band) with a
    tempo caption ("settled" / "quiet 7d" / "no comms").
  - On-demand views (swap into the right panel): Renewals radar, My Savings, Report Card
    (+ bandwidth gauge).
- Footer: "Clear all" / "Submit Actions - N" buttons + a "pacer" dino animation with a "Rawr!"
  bubble; Submit opens an overlay ("sheet") previewing the single consolidated prompt that will
  fire into chat, built from every staged per-issue direction.
- Data contract (already correct, keep as-is): an inert `<script type="application/json"
  id="fgData">` island the skill overwrites each run; `readDelta()` parses it in a try/catch so a
  malformed payload degrades to the last-saved board with a banner, never a blank screen; storage
  key `theo.fieldguide.workgraph.v1`; export `theo-workgraph.json`.

### 2b. Genuinely worth retaining (the platform has no equivalent)

- **The work-graph Issue model itself**: ACTIONABLE-ASK / WAITING / FYI-EVIDENCE / NOISE
  classification, three confidence tiers, "never auto-close or auto-create on a guess." This is
  the skill's actual product; nothing on the platform reasons about a solo user's inbox this way.
- **Abstaining next-best-action** (`recZoneHtml`, `isAbstaining`): when confidence is low, the
  panel explicitly refuses to fabricate a recommendation and instead states what signal is
  missing and what would resolve it. The platform's Tasks drawer always shows an action card;
  it has no honest "I don't know yet" state. This is a stronger anti-fabrication pattern than
  anything on the platform and must not be diluted into a generic low-confidence pill.
  it has no honest "I don't know yet" state. This is a stronger anti-fabrication pattern than
  anything on the platform and must not be diluted into a generic low-confidence pill.
- **Staged-direction -> one consolidated prompt** (`staged{}`, `buildPrompt`, the submit sheet):
  a genuinely skill-native interaction (this is a Claude Desktop artifact, not a live app) with
  no platform analog - the user annotates several issues, then fires ONE turn back into chat.
  Must be preserved exactly as the closing mechanic.
- **Comms lane substance** (per the recon: both River Convergence and Topic Flow rated `strong`,
  fully computable from the user's own M365 data, low fabrication risk): the topic x time
  structure, per-node status (Agreed/Open/Disputed/Flagged), and the stall/tempo read ("quiet
  7d" while still open) are real value. The recon explicitly flags the river metaphor itself as
  "optional polish" - the substance to keep is topic x time + status, not the bezier rendering.
- **Meeting Prep lane**: read-only prep notes keyed to an issue; nothing on the platform surfaces
  this for a solo contributor.
- **Graceful-degradation data contract**: the inert JSON-island + try/catch parse + non-blocking
  banner is more robust than anything comparable on the platform (which assumes live JS data
  objects, not an artifact that a model overwrites every run). Keep this exactly as built.

### 2c. Weak / incoherent vs the platform

- **Off-brand token system**: the whole file is themed with `--lds-g-color-*` "LDS 3.0" tokens
  (Ringside font family, red-060/070, neutral-100 black) that do not match the platform's actual
  shipped identity (Libre Franklin + Roboto Mono, `--red:#E1251B`, off-white `--bg:#E2E6E1`).
  Two Lilly-flavored systems exist side by side and neither matches the real product.
- **No Lilly or Theo wordmark at all.** The top bar has an emoji dino and a bold generic label;
  there is no Lilly logo anywhere in the file, and "Theo" only appears as a small cursive
  sub-label, never as its own wordmark next to Lilly's.
- **Emoji T-rex glyph instead of the real brand mark.** `theo-dino-mark.png` exists precisely so
  every surface uses the same asset; the emoji reads as a placeholder, not a brand element, and
  cannot be recolored to match either theme.
- **Floating centered "widget" instead of a page.** The 1180px-max card with its own shadow,
  centered on a gray canvas, reads as a demo embedded on a page rather than a command center the
  user lives in. The platform's pages (including My Work) are full-bleed app screens.
- **No dark mode.** No `data-theme` handling, no dark token set, no theme toggle - every other
  platform page has additive dark tokens and a persisted `theo-theme` preference.
- **Confidence-pill color risk.** `conf-pill high/med/low` needs to be checked against the
  platform's explicit "positive accent = Bold Blue, never green" rule; as authored it is at risk
  of using green for "high confidence," which would break the site-wide color grammar.
- **Thinner interaction chrome than the platform's equivalents once you compare like-for-like**:
  the current sort-row + filter-chip bar is less capable than the Tasks drawer's search+kind-
  filter+project-filter+sort-by toolbar; the current flat KPI tiles are less informative than the
  platform's hover-breakdown `.pincard`s; the current flat Renewals/Savings/Report-Card views are
  visually plainer than my-work.html's `.renrow`/`.savhero`/`.rclist`+`.rcdetail`, which already
  solve the identical problem more richly (soon/near/ok accenting, CI/CA legend, ring-chart
  detail, GPA tile).
- **No "waiting on others with a nudge" surface** and no dismiss/recall lifecycle for
  low-value issues - the platform's Tasks drawer models both and the skill's own WAITING state
  already has the data to support the first one.

---

## 3. NEWEST VERSION (the proposal)

Principle: keep the left/right split and the work-graph/abstain/comms/renewal/savings substance;
replace the visual system and several interaction patterns wholesale with the platform's actual
shipped components (My Work page + Tasks drawer), reskinned to fit a single self-contained
vanilla-JS artifact. Nothing below requires a live backend; every new affordance is either pure
client-side computation over the existing JSON payload or a "draft, never send" text composer,
consistent with the skill's existing reflect-only posture.

### 3a. Page shell (was: centered widget card -> becomes: full-bleed app page)

Drop the centered 1180px "board" card and the gray canvas. Render as a full-bleed page with a
persistent header, matching the platform's page structure (topbar + content), NOT a card floating
on a page. `body` background = the off-white token (`--bg:#E2E6E1` light / near-black dark), no
outer padding/centering.

### 3b. Header bar (was: black bar + emoji + bold label -> becomes: platform topbar)

Off-white (light) / near-black (dark) bar, NOT the old solid-black bar (that black-bar-white-text
look isn't the platform's actual chrome - see Design Notes for the real header recipe):
- Left cluster: black Lilly wordmark image + a 1px vertical divider + "Theo" in Sacramento
  cursive, black - both exactly like `theomark`/`brand img` in `theo-brand.js`/`my-work.html`.
- Directly under/beside the wordmark cluster: a small uppercase eyebrow label "Personal Command
  Center" (plain sans, muted color) - the app name, not the identity.
- A `theo-dino-mark.png` icon (recolored via `filter:brightness(0)` light / `invert` dark,
  exactly like the platform's `.theo-dinobtn`) replaces the T-rex emoji glyph everywhere it appears,
  including the footer "pacer" - same asset, two contexts, CSS-filter recolor, no second file.
- Right cluster: the existing "Synced [time]" mono clock chip (keep), the on-demand View pills
  (Renewals/Savings/Report Card - keep, only offered when their data key exists), and a light/
  dark theme toggle wired to `theoSetTheme()`/`theoTheme()` and the `theo-theme` localStorage key
  (additive; does not touch the frozen workgraph key).

### 3c. KPI strip (was: 5 flat tiles -> becomes: platform `.pincard` strip)

Same 5 metrics (Open issues, Action now, Waiting, Meetings ahead, Aged 7d+), rebuilt as
`.pincard`-style cards: uppercase label + small stroke icon, big Roboto-Mono number, a muted note
line. Add a hover tooltip on "Action now" breaking it down by issue kind (chase/decide/approve/
sign/risk counts), reusing the platform's dark `.ptip` popover pattern - this is pure client-side
aggregation over `ISSUES`, no new data needed.

### 3d. Left rail (was: mode toggle + sort row + filter chips -> becomes: Tasks-drawer toolbar)

- Lane tabs become a 4-way segmented control, styled like `.mqtabs`/`.mqtab`: **Issues | Meeting
  Prep | Comms | Waiting** (Waiting is new, see 3g).
- Replace the separate sort-row + filter-chip strip with one `.mqtools`-style toolbar: a
  search-icon-prefixed text input (matches title/party/id, unchanged predicate), a "Filter by
  kind" dropdown (derived from whatever `topic`/`channel`/`state` values exist in the payload,
  same as today's chips but as a single select, denser), and a "Sort by" dropdown (Priority /
  Aged / Newest / Due - Due is new and trivial: sort by `daysTo(renewal.expiry)` /due meta where
  present, else falls back to Priority). Keep the live "N of M shown" counter.
- Row anatomy is kept (priority dot, id chip, title, due/age meta, staged-checkmark) but recolored
  to the platform's 4-color grammar (see Design Notes) and given the platform's row affordances:
  a left accent bar on the active row (already present, keep), plus a quiet per-row Dismiss (X)
  for FYI-EVIDENCE/NOISE-classified issues that moves them to a **Done & dismissed** sub-view
  with a Recall button - a straight port of the Tasks drawer's closed-row pattern
  (`.mqrow.closed`/`.mqstate`/`.mqrecall`), persisted in a NEW, separate localStorage key (e.g.
  `theo.fieldguide.rowstates.v1`) so it never touches the frozen `workgraph.v1` key.

### 3e. Right panel - Issue detail (was: 2 zones -> becomes: 3 zones + evidence disclosure)

Keep the header (id chip + title + meta line) and the "Current state" zone unchanged in
substance, restyled to the platform's `.card`/zone-label look (14px radius, 1px hairline, soft
shadow, 12px uppercase eyebrow labels).

Keep the "Recommended next action" zone and the **abstain block exactly as-is in substance**
("Not enough signal..." + `abstain_reason` + `abstain_resolve`) - this is the skill's strongest
differentiator and must not be watered down. Restyle only: recolor the confidence pill to the
platform's locked grammar (high = **Bold Blue**, medium = amber, low = red/pink - never green),
and restyle the abstain callout as a tinted note card matching `.savnote`/`.dgnote` (sparkle
bullet, italic reflect-only tone) instead of a plain bordered box.

Add ONE new, small, optional zone: a collapsible **"Evidence"** disclosure
(`<button class="exp">Why this state</button>` toggling a detail block), directly modeled on the
Tasks drawer's `mqDetail`/`wgev` pattern: a short list of the machine signals behind the state or
recommendation, each row = source tag (Outlook / Teams / Aravo / LEAH-style label) + one-line
summary + an `auto`/`confirm?` chip. This is additive to the existing schema
(`iss.evidence: [[source, summary, "auto"|"confirm"], ...]`, optional, omit to hide the
disclosure) and operationalizes the skill's own "machine signals + confidence tiers" language in
the platform's established evidence-list visual grammar, rather than leaving it implicit in
prose.

Direction dock (was: plain textarea + 2 buttons) - unchanged mechanic (textarea, Stage direction,
Remove from queue), buttons restyled to the platform's pill button shapes (`.btn.primary` solid
red, `.btn.ghost` bordered), matching `.dggo`/`.dgcx` in `my-work.html`'s delegation modal.

### 3f. On-demand views - direct platform ports

These three already exist nearly verbatim on the platform, more richly built. Port them, keep the
skill's existing data fields, change only the render function bodies:
- **Renewals radar**: rebuild using `my-work.html`'s `.renlist`/`.renrow` exactly - left-accent
  bar colored soon(red)/near(amber)/ok(blue), a `.rdate .dt`/`.out` days-to-expiry readout, an
  auto-renew pill, and the renew/renegotiate/recompete recommendation as a colored `.pip`
  (reusing the existing `rec_md`/`renewal{}` fields, no schema change).
- **My Savings**: rebuild using `.savhero` (hero $ + CI/CA `.splitbar` + `.splitkey` legend +
  target-to-go line) + `.savflow`/`.savitem` pipeline rows with `committed`/`pending`/`achieved`
  pips - same `savings{}` schema, new markup only.
- **Report Card**: rebuild using the master/detail pattern (`.rclist` rows -> `.rcdetail` panel
  with the ring-chart SVG + bandwidth gauge), which fits a right-panel-in-a-drawer width better
  than the platform's newer full-width flip-card grid; keep the GPA tile in its own plum-gradient
  card. Same `reportCard{}` schema, new markup only.

### 3g. Waiting tab (new, small, pure client-side)

A 4th lane tab pulling every issue with `state === "waiting"`, rendered with the Tasks drawer's
`.mqwrow` shape: icon (grey clock / red alert if overdue), title, "waiting on **{party}** -
{project}", a staleness age chip (color by age: old/mid/fresh, computed from the issue's existing
age fields, no new signal needed), and a **Nudge** button. Nudge does not send anything: it
pre-fills the direction textarea for that issue with a drafted chase sentence ("Draft a status
chase to {party} re: {title}.") and opens that issue's detail panel - i.e. it feeds the EXISTING
staged-direction/submit-prompt mechanic rather than adding a new send path. This directly reuses
data already in `ISSUES` (`state`, `party`, `title`) plus the age helper already in the file
(`ageNum`); no schema change required, matching the recon's "strong, availability strong" verdict
for this exact pattern.

### 3h. Comms lane (was: River primary -> becomes: Topic Flow primary, River secondary)

Make **Topic Flow** (the heat-row + tempo/stall read) the default view when a topic is selected -
it is the more portable, more scannable of the two per the recon, and reads correctly at a
glance during a weekly review. Keep **River of Convergence** available behind a small "Show
river view" toggle in the same zone, unchanged in substance (topic lanes, bezier paths, ringed
status nodes) - this satisfies "redesign the rest" while preserving the recon's explicit note
that the river metaphor is optional polish, not core value.

Add the platform-recommended unified filter bar above the visualization: Topic / Channel / Person
/ Status dropdowns + free-text search, with a live "N of M communications match" readout, driving
BOTH the active visualization and the flow list underneath it as two projections of one filtered
set (adopting the recon's "Supplier/scope Lens + unified Filter bar" pattern, `possible/strong`,
zero new data dependency since `comms.nodes[]` already carries topic/channel/party/status).

### 3i. Footer (was: ad hoc "sheet" -> becomes: platform-style modal)

Keep "Clear all" / "Submit Actions - N" (restyled as `.btn.ghost`/`.btn.primary`). Keep the pacer
dino as a small delight but swap the emoji for `theo-dino-mark.png` and turn "Rawr!" into a hover
tooltip rather than a persistent animated bar (quieter, matches the platform's restraint). Rebuild
the submit-preview overlay as a platform-style modal: scrim + centered card (16px radius, header/
body/foot), matching `my-work.html`'s `.dgscrim`/`.dgmodal` structure, replacing the current
ad hoc `.scrim`/`.sheet`.

### 3j. Layout outline (concrete, buildable)

```
<body> (page bg = --bg off-white/dark)
  <header class="pcc-top">                          # off-white/black, sticky
    [Lilly wordmark img] | [Theo cursive] "Personal Command Center" (eyebrow)
    [dino icon btn]                        ... (right) [Synced clock] [View pills] [theme toggle]
  </header>
  <div class="pcc-banner" hidden>...</div>           # non-blocking data banner, unchanged logic
  <div class="pcc-kpi">5x .pincard</div>              # KPI strip, hover breakdown on Action-now
  <div class="pcc-body">                              # LEFT/RIGHT SPLIT (kept)
    <nav class="pcc-rail">
      [Issues | Meeting Prep | Comms | Waiting]        # 4-way segmented tabs
      [search] [kind filter v] [sort by v]             # mqtools-style toolbar
      <list of rows>                                   # kept anatomy, recolored, dismiss/recall
    </nav>
    <section class="pcc-panel">
      <div class="panel-scroll">
        # Issue: header + Current state zone + (Rec zone w/ confidence pill OR Abstain card)
        #        + collapsible Evidence disclosure
        # Meeting: header + Prep notes (read-only)
        # Comms: filter bar + Topic Flow (default) / River (toggle) + flow list
        # View=Renewals / Savings / ReportCard: platform-ported panels (3f)
      </div>
      <div class="panel-dock">[direction textarea] [Stage] [Remove]</div>   # kept mechanic
    </section>
  </div>
  <footer class="pcc-foot">
    [Clear all] [Submit Actions - N]                   [dino pacer icon, hover "Rawr!"]
  </footer>
  <div class="pcc-scrim">/<div class="pcc-modal">       # submit-preview, platform modal shell
  <script type="application/json" id="fgData">...</script>   # UNCHANGED contract
```

### 3k. Data model deltas (additive only, nothing frozen touched)

- New OPTIONAL issue field: `evidence: [[source, summary, "auto"|"confirm"], ...]` (3e).
- No new field needed for Waiting (3g) or Renewals/Savings/ReportCard ports (3f) - existing
  schema already carries everything.
- New, separate localStorage key `theo.fieldguide.rowstates.v1` for dismiss/recall (3d) and
  `theo-theme` for the theme toggle (3b) - both additive, neither collides with
  `theo.fieldguide.workgraph.v1`.
- Storage key, export filename, and skill id remain byte-for-byte frozen as required.

---

## 4. DESIGN NOTES

### Palette (swap `--lds-g-color-*` for the platform's real tokens)

Light:
- Page/rail background `--bg: #E2E6E1` (off-white, NOT pure white and NOT the LDS neutral-005
  cool gray).
- Card surface `--surface: #FFFFFF`.
- Ink `--ink: #1A1A1A`, muted `--mut: #4A443C` / `--mut2: #4A443C`.
- Lines `--line: #E1E0DC`, `--line2: #CECCC7`.
- Brand red `--red: #E1251B` / hover `--red-d: #B41E16` - primary actions, overdue, critical
  only.
- "Good/confirmed" blue `--bblue: #0F3A85` - the ONLY positive-state color. **Never green.**
- Amber `--amber-d: #8A5A00` / tint `--amber-t: #FBF1DA` - warnings, medium confidence.
- Pink tint `--pink-t: #FBE7E3` - red-family soft background (overdue chips, critical tints).
- Teal `--teal-d: #2F6E6B` - reserved for one structural accent per surface (timeline top-border,
  bandwidth-adjacent accents), not a general-purpose color.
- Purple/plum `--ai: #5C2B50` / tint `--ai-t: #EDDFE9` - reserved for the "reflect-only assistant
  voice" (sparkle-bullet notes, GPA tile) - do not reuse for anything else.

Dark (additive `html[data-theme="dark"]` override block, same recipe as `my-work.html`):
`--header:#0A0A0A; --surface:#262626; --ink:#ECECEC; --mut:#B0B0B0; --line:#3A3A3A;
--bg:#1C1C1C; --red:#F0574C; --bblue:#7CA6E2; --amber-d:#DBAA50; --ai:#C99BD1`. Neutral grays,
not bluish. Persist via `localStorage['theo-theme']`, applied through `theoSetTheme()`/
`theoTheme()` helpers copied verbatim from `theo-brand.js`.

Hard rule carried over from the platform (already governing Marc's suite): color does a JOB, not
decoration. Cap functional color to red / blue / amber (+ the two reserved narrow-purpose colors
above); never introduce green anywhere in status, confidence, or pip coloring.

### Typography

- UI text: `'Libre Franklin', system-ui, Arial, sans-serif` (weights 300-800) - replaces
  "Ringside"/LDS entirely.
- Every id, date, dollar figure, day-count, and clock readout: `'Roboto Mono', ui-monospace,
  monospace` - this is what makes platform numbers instantly scannable against prose; the current
  PCC under-uses mono (LDS falls back to a generic mono stack inconsistently).
- `Sacramento` (cursive, Google Fonts) is used for exactly one string in the whole artifact: the
  "Theo" wordmark next to the Lilly logo. Do not reuse it for section subtitles (the current
  file's `.fg-sub` misuse of Sacramento for "Theo's Field Guide" goes away).

### Logos / brand marks (embed as base64 data-URIs, self-contained, no network)

- Lilly wordmark: embed `Lilly-Script-Black-RGB.png` (or `Lilly-AMC-Lockup-H-Small-Black-RGB.png`)
  from `assets/logos-lilly/` as a base64 `<img>`, exactly as `my-work.html` embeds its logo
  inline. Apply `filter:brightness(0)` in light mode (guarantees pure black regardless of source
  artifact) and `filter:none` (or a light-safe alternate) in dark mode - same two-line recipe as
  `theo-brand.js`'s `--brand-logo-filter` token.
- Theo wordmark: literal text `Theo` in the Sacramento cursive font, colored via `currentColor`/
  `--ink` so it inherits the theme automatically (this is how the platform does it - it is NOT a
  bitmap asset).
- Dino mark: embed `theo-dino-mark.png` (the same file referenced in `theo-brand.js`'s
  `THEO_DINO_MARK` constant) as one base64 data-URI, reused in two spots via CSS filter, never
  duplicated as a second file:
  - Header icon button: `filter:brightness(0)` light / `brightness(0) invert(.92)` dark (matches
    `.theo-dinobtn .theo-dinomark`).
  - Footer pacer: same asset, same filter recipe, replacing the T-rex emoji glyph 1:1.
- Divider between Lilly and Theo: `1px solid` at ~20% opacity of the header's foreground color
  (matches `.theomark{border-left:1px solid var(--topbar-divider)}`).

### Card / panel system

- Radius 14px on all cards/zones (`var(--lds-g-radius-150)` equivalent -> just use `14px`
  directly, dropping the LDS token layer entirely).
- Border `1px solid var(--line)`, shadow `0 1px 4px rgba(38,30,20,.08)` (light) /
  `0 1px 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.4)` (dark) - copy `--shadow`/`--shadow-lg`
  verbatim from `my-work.html`.
- Zone/section labels: 12px, uppercase, `letter-spacing:.04em`, muted color - matches
  `.sectitle`/`.zone-lbl` conventions on both platform pages; keep the current file's `.zone-lbl`
  class name so the JS render functions do not need renaming, just restyle the CSS rule.
- Reflect-only notes: tinted card (`--ai-t` background, `--ai`-colored sparkle bullet, italic
  body), same shape as `.savnote`/`.rcnote`/`.dgnote` - use this ONE component everywhere the
  current file says "nothing is sent" or "illustrative," instead of ad hoc inline text.

### Density and spacing

- Row meta text 11-12.5px, row padding ~11-13px vertical - matches Tasks-drawer row density, not
  the airier LDS spacing scale (`--lds-g-spacing-*` goes away with the token layer).
- Detail-panel padding stays generous (24-32px) so prose (state_md/rec_md/prep_md) keeps reading
  comfortably - this is the one place density should NOT be tightened.
- Icons: inline stroke SVG, 24x24 viewBox, `stroke-width:2`, no fill, `stroke:currentColor` -
  replace every remaining emoji glyph (checkmarks, clock, alert) except the intentional dino
  brand mark, matching the platform's icon language throughout `my-work.html`/`tasks-drawer.js`.

### What NOT to carry over from the platform

- Do not add the platform's left icon nav rail (Home/Projects/Approvals/etc.) - the PCC is a
  standalone artifact, not a page inside the app shell; "keep the left/right split" refers to the
  issue-list/detail split, not the app navigation rail.
- Do not wire any live M365/Aravo/LEAH connector calls - the "Evidence" disclosure (3e) and the
  Waiting/Nudge affordance (3g) stay pure client-side over the existing JSON payload, consistent
  with the skill's own reflect-only, single-user, never-writeback posture.
