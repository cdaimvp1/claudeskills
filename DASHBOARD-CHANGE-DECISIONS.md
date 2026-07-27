# Dashboard Change Decisions (mockup triage) — 2026-07-27

Triage of the 14 change-mockups (`OneDrive\Desktop\dashboard-mockups\`). Locked dashboards get a batched
rebuild per dashboard once the PENDING items resolve. "Do" = label/CSS-level, no mock. Legend: BUILD / MOCK
(show first) / PENDING (needs Marc) / REJECTED / DO.

## RFx
- R1 banner "Final Recommendation" -> "Recommendation to Award" — DO.
- R2 tab "Business Case" -> "Business Case & Approval" — DO (lands with the subtab split, see R4).
- R3 gate label "Merit Leader - Gated" + "Conforming Leader" — DO (enumerate every spot).
- R4 **What-Changed-Since-Recommendation** panel — ADDITIVE. **Split Business Case into SUBTABS**: "The Case"
  (Rationale · Deal Terms & the Field · Deal Economics + Mini P&L) | "The Ask & Approval" (The Ask · R4 · Path to
  Close). R4 lives in "The Ask & Approval". **2026-07-27 Marc: MOCK the subtab structure first** (then approve
  -> folds into the batched RFx rebuild).
- R5 value map -> panel-score x NORMALIZED all-in — BUILD, **GRAPH ONLY**; everything else in that panel stays
  exactly as-is (Marc: do not change anything except the graph).
- R6 Risk Roll-Up provenance split (RFx-issues vs diligence/context) — **STILL PENDING 2026-07-27.** Marc asked for
  a fuller explanation, then for MULTIPLE options (the original single mock rejected: it was full-width/stacked and
  broke the panel's real half-width slot beside the Coverage heatmap). **4 options mocked in
  `dashboard-mockups\rfx\rfx-R6-risk-provenance-OPTIONS.html`** (A grouped columns · B provenance toggle · C stacked
  bands · D marks only), each rendered in the real 2-col context, verified in browser (favicon 404 only).
  The file opens with a faithful **TODAY baseline** (reproduced from rfxRiskCompactHTML pv-09-rfx.js:720 verbatim,
  real chips/caption/risk-read/source-note) + a numbered defect list, and every option carries a
  **"Replaces, against Today"** delta column beside Fixes/Costs.
  **REAL DEFECTS FOUND while grounding this:** the panel caption claims "response-grounded" but the `Red flags`
  column reads `s.profile.redFlags` (Landscape), AND Nimbus's SOC 2 Type II item is counted TWICE in one row
  (once under Gating, once as a red flag), AND Helio's only "red flag" ("commercial submission incomplete") is a
  RESPONSE fact misfiled in the profile field. All 4 options fix the caption + the double-count; they differ only
  in how hard they separate the sources.
  **DECIDED 2026-07-27: BUILD Option A** (grouped columns under two spanned provenance headers; "Red flags" ->
  "Profile flags"; SOC 2 double-count removed so Nimbus reads 1 and Helio 0; caption + source note corrected).
  Marc noted A reads only subtly different from today, which is expected: R6's substance is provenance/counting
  correctness, not a visual restyle.
  **PLUS a NEW layout rule from Marc (2026-07-27): PAIRED SIDE-BY-SIDE PANELS MUST BE EQUAL HEIGHT, and if either
  panel overflows, give it a VERTICAL SCROLL** (use the D8-approved affordance: visible scrollbar + "N of M /
  scroll for more" + fade edge). Applies here to Risk roll-up vs Coverage heatmap. OPEN: whether Marc wants this
  rule applied to EVERY 2-col panel row across all 3 dashboards.
  **ANSWERED 2026-07-27 (Marc): NOT a universal panel-to-panel rule.** Some rows are ONE panel on one side and TWO
  STACKED panels on the other, where the stack's combined height (plus the gap) equals the single panel. So the rule
  is ROW-level, not panel-level: **every COLUMN in a side-by-side row ends on the same line; a column that stacks
  panels reaches that line by its panels' combined height + gaps; if a column would overrun, the panel that grew
  scrolls inside itself** (thin visible scrollbar + sticky header, per D8). Applied to the RFx Risk-roll-up /
  Coverage-heatmap pair; apply case-by-case elsewhere, never blanket.
  **PORTED + BUILT 2026-07-27 (Marc: "just go ahead and port it into the dashboard").** In `_rfx_build`:
  seed `profile.redFlags` entries now carry provenance `{t,src:'submission'|'diligence'}` (plain strings still
  accepted, default 'diligence'); new helpers `rfxRedFlags` / `rfxProfileFlags` / `rfxSubmissionSourcedFlags` in
  pv-09; `rfxRiskCompactHTML` rebuilt to Option A (2-tier grouped header, col order Supplier | Risk level |
  Conforming | Gating | Profile flags, hover on the profile cell lists the actual flags, two per-group source
  lines, corrected caption + spnote that states the sides do not add and reports reclassified counts);
  `rfxRiskInsight` narrative reworded to name each side separately; individual-report red-flag list reads the
  normalized objects (output identical). pv.css: provenance header/rule/source-row styles + the EQUAL-HEIGHT pair
  (`.xs2col-hm` stretch threaded wrapper>sect>card, secthd min-height so both cards start on the same line) and
  `.rfxpairscroll` (max-height 46vh, thin visible scrollbar, sticky thead).
  VERIFIED in browser: both cards 585px, tops AND bottoms flush; injected 42 rows -> pair stays equal (836/836),
  table area clamps ~509px and scrolls with the header stuck; 0 console errors (favicon 404 only); node --check
  clean; diff scanned for network/exec patterns = 0 (the `src=` hits are `f.src===` comparisons). Rebuilt 3.45MB,
  delivered to `OneDrive\Desktop\dashboards\rfx-dashboard.html`.
  NOTE/OPEN: the INDIVIDUAL report's "Red Flags" card still carries the label "response-grounded" (the same false
  claim R6 fixed on the roll-up). NOT changed, out of R6 scope, needs Marc's word.
- R7 `--` + hover "Data not available" for zero-data cells — BUILD. + fix heading "Completeness & risk roll-up"
  -> "Completeness & Risk Roll-up". + **FLIP rows/columns** on BOTH the Participation and Completeness & Risk
  Roll-up panels to fit better — **MOCK the flipped panels first** (visual judgment).
  **2026-07-27 Marc: YES, mock first.**
- R8 label "3-Yr TCV (simple)" -> "3-Yr Subscription Baseline" — DO.
- R9 trim Overview Evaluation Summary — **REJECTED** (leave as-is).
- R10 pull ZOPA from Analysis — **DO NOT DO**.
- R11 CSS cleanup (inert dark tokens) — DO.

## Deal
- D1 footer overlay fix + static Landscape/RFx footer — DO.
- D2 inference labeling — **APPROVED 2026-07-27 (Marc).** ONE convention: dotted underline / ◦ + ONE key +
  hover-for-basis, no per-item chips. Chips-everywhere rejected. Build into the batched Deal rebuild.
- D3 Financial Model when no inputs — BUILD **Option A** (collapsed + labeled + non-expandable).
- D4 "Protection Score" -> "Playbook Alignment Score" — DO.
- D5 + D6 Overview reorder / compact ZOPA — **REJECTED** (leave Deal Overview as-is).
- D7 sticky secondary subnav — DO, **must match the tab design**.
- D8 Legal Findings Register scroll — BUILD **Option B** (nested scroll + obvious affordance: visible scrollbar +
  "N of M / scroll for more" + fade edge).
- D9 CSS cleanup (~3MB, dead dark theme, dup :root, ~59 @font-face) — DO.

## Landscape (all ADDITIVE unless noted; nothing existing changes unless stated)
- OVERVIEW: ADD the summary cards (Credible field 7 · Advance to RFx 3 · Keep as leverage 2 · Excluded hard-screen
  2 · Open uncertainties 4) + the full **Market Decision Brief** Sections 1-5 (exact content Marc pasted: The
  Credible Field · Recommended Advance Slate · Keep as Leverage / Exclude · Uncertainties That Could Change the
  Slate · Critical RFx Questions / Landscape->RFx handoff). **DO NOT change the evaluation-summary or recommendation
  panels.** **REMOVE the Segmentation & Differentiators panel** (false-precision veneer on inferred data - confirmed).
- DEEP-DIVE: ADD "Coverage by Section" + "Full Schema, Field-by-Field" sections somewhere; **do not change the
  existing deep-dive** (L1/L3/L14/L13 redesign NOT applied - only these 2 additive sections).
- FINANCIAL & MARKET: change **Peer Position** panel (-> categorical quadrant) + **Credit & Market Enrichment**
  panel (-> no D&B/Bloomberg placeholder, schema-ready) to the mock; **LEAVE the Financial Health panel alone**.
- HEAD-TO-HEAD: leave alone; at most ADD the **"Decision Could Turn On"** section (L10).
- REQUIREMENTS HEATMAP: BUILD **decision leverage** = weight x must-have x differentiation x confidence (L9/L14).
- H2H launcher button on Overview (A1 remove) — **CONFIRMED 2026-07-27 (Marc): remove the launcher button only;
  the Head-to-Head TAB stays untouched.** Only non-additive Landscape change.
- L15 deep-dive tab consolidation — **DO NOT DO**.

## Shared
- S1 Title-Case Deal + Landscape section headers to match RFx — DO.

## Next (updated 2026-07-27 after Marc's calls)
Resolved this round: D2 APPROVED (build, no further mock) · R4 mock-first · R7-flip mock-first · A1 H2H launcher
removal CONFIRMED. Only R6 still open (explanation given, awaiting build/skip).
MOCK NOW: R4 Business-Case subtabs · R7 flipped Participation + Completeness panels. Then batch per
dashboard: RFx (R1/R2/R3/R5/R7/R8/R11 + approved R4 + R6 if greenlit), Deal (D1/D3/D4/D7/D8/D9 + approved D2),
Landscape (all approved additive + heatmap + Segmentation removal + S1). One rebuild per dashboard.

## BUILD LOG 2026-07-27 (Marc: "you can rebuild each of the dashboards I gave you notes on")
**RFx — DONE, built + delivered** (`_rfx_build` -> `OneDrive\Desktop\dashboards\rfx-dashboard.html`, 3.46MB):
R1 "Final recommendation" -> "Recommendation to Award" · R2 subtab -> "Business Case & Approval" · R3 gate
vocabulary (`rfxAwardTier` now emits "Merit Leader - Gated" for a gated top scorer and "Conforming Leader" for the
highest-scored bidder clearing every Must-Have, via new `rfxConformingLeaderSi`; badge "GATE RISK" -> "GATED";
Gate Status pill "Gate Risk" -> "Gated") · R5 value map cost axis repointed to the NORMALIZED all-in via a new
shared `rfxNormAllIn()` helper that the Commercial comparison table now also reads, so the map and the table cannot
diverge (graph + its own axis/aria/caption only, panel otherwise untouched) · R6 (see above) · R7 build half
(`rfxGlyph('nt')` now renders `--` with a "Data not available" hover, glyph key + panel note updated; heading
Title-Cased) · R8 KPI "3-Yr TCV (Simple)" -> "3-Yr Subscription Baseline" · R11 inert dark CSS removed (3 blocks,
1,025 bytes; the ACTIVE `html:not([data-theme="dark"])` light rules deliberately kept).
VERIFIED: all 5 subtabs render, 0 JS errors (favicon 404 only), tiers read Nimbus="Merit Leader - Gated" /
Lakehouse="Conforming Leader" / Helio="Secondary", normalized all-in Nimbus $2,557 + Lakehouse $2,750 reconcile to
the comparison table, Helio null (not fabricated), 10 data-not-available cells, equal-height pair still flush,
diff scanned for network/exec patterns = 0.
STILL PENDING for RFx (blocked on mocks, NOT built): R4 Business-Case subtabs, R7 row/column FLIP.

**Deal — PARTIAL** (`deal-room-1c344a/dashboard` -> `dashboards\deal-dashboard.html`, 2.81MB):
D4 rename DONE ("Protection Score" -> "Playbook Alignment Score", 9 label sites; the `protectionScore` DATA KEY is
deliberately NOT renamed, that would be a data-model change; "data protection" prose untouched). D1 DONE: the
footer was already the static Landscape/RFx one on this path, and the real overlay bug was that the platform
reserves footer clearance on `.sa-main` while the Deal artifact renders into `#app`, so nothing reserved it ->
added the same 70px/60px recipe to `#app` (NOT theo-brand's `body:has(.theo-foot)` rail rule, which this build
deliberately excludes; that scope note was respected, not reversed).
**BUILD-PATH FINDING (important):** the delivered Deal artifact is built by `deal-room-1c344a/dashboard/
build_deal_artifact.py` from **`_parts/*.js`**, NOT from `_deal_build/` and NOT from `dashboard/assets/pv/*`.
`_deal_build/assets/pv/*` and `dashboard/assets/pv/*` are a parallel (byte-identical) copy that this builder never
reads, and `_deal_build/build_dashboard_deal.py` emits a DIFFERENT artifact (deal-acme-PLATFORM.html). Edits were
applied to `_parts` (canonical) and mirrored into both asset copies to stop them drifting. Worth collapsing.
NOT YET BUILT for Deal: D2 (inference labeling), D3 (Financial Model collapse), D7 (sticky subnav), D8 (Legal
Findings scroll), D9 (CSS cleanup).

**Landscape — NOT STARTED** (all items still open).

## RFx ROUND-3 NOTES (Marc, 2026-07-27) - new batch, logged verbatim in intent
- **N1 ROW-HEIGHT SWEEP (whole dashboard).** Go through RFx and organise panels into ROWS, then make every
  column in a row end on the same line, whether a column holds ONE panel or STACKED panels (stack + gaps = the
  single panel's height). This is the row-level rule agreed earlier, applied dashboard-wide, not just to the
  Risk-roll-up/Heatmap pair already done.
- **N2 TEXT TRIM.** Several panels overflow only because the copy is slightly long; trim the text and the panel
  fits. Cut words, do not cut content.
- **N3 SCORING MATRIX (Scoring tab) is UGLY** - bring it up to the design quality of the rest of the dashboard.
- **N4 BANNED SHADING - STANDING RULE.** The pale amber wash behind the "Still to submit ... Next milestone"
  strip must NEVER be used as a background, in any dashboard, ever. **DONE 2026-07-27**: `#FBEFC9` /
  `--tint-fbefc9` removed as a background at source (`pv-11-deal-core.js`: `.rfxgate.warn`, `.fpbanner.warn`,
  `.suplst.hold`) -> transparent ground + burnt-orange left rule. Built RFx now greps 0 for FBEFC9. Also saved
  as a permanent memory rule; the other two builds were scanned and are clean.
- **N5 REQUIREMENTS REGISTER, id scheme + scale.** r1/r2/... looks odd and will not survive 400+ requirements.
  Marc's proposal: collapse the table itself, and inside it accordion BY CATEGORY with only one category open at
  a time. He asked for a recommendation.
- **N6 VALUE & COST row.** Repetitive data in the Commercial Comparison panel, and that panel is far taller than
  Field at a Glance beside it. Even the two sides out efficiently WITHOUT losing content.
- **N7 REQUIREMENTS MATRIX (same page) is UGLY** - improve the design.
- **N8 COMPANY PROFILE (Analysis > individual supplier).** The Headquarters / Founded / Ownership / Years in
  business / Revenue / Employees block should be a 2- or 3-COLUMN layout, not the current one.
Status: N4 DONE + delivered. N1/N2/N3/N6/N7/N8 queued. N5 needs Marc's nod on the accordion proposal.

## BUILD LOG 2026-07-27 (evening) - RFx round-3 batch + Deal collapse/finish + Landscape start
**DEAL - COMPLETE (1.69MB, was 2.81MB).** Build paths COLLAPSED first: `_deal_build`'s engine was a stale
byte-identical mirror; `_parts/` `assets/` both builders + old HTMLs moved to
`_deal_build/_SUPERSEDED_ENGINE_2026-07-27/` (moved, NOT deleted, reversible), `_deal_build/SOURCE-OF-TRUTH.md`
written, canonical builder headed, `apply_deal_chrome.py` (both copies) marked superseded. Then D1 (real cause:
platform reserves footer clearance on `.sa-main`, the Deal renders into `#app`; same 70/60px recipe applied to
`#app`, NOT the rail-only body:has rule that build deliberately excludes) · D2 (implemented INSIDE evidenceChip
so all ~57 call sites get it: inference renders a quiet dotted mark + hover basis, ONE page key; 54 marks, 0
inference chips) · D3 (real `pfHasInputs` gate, cost side AND value side; correctly does NOT fire on this deal)
· D4 (9 label sites; `protectionScore` DATA KEY deliberately not renamed) · D7 (sticky subnav, offset measured
at runtime + resize) · D8 (Option B: "10 of 22 findings shown", permanent scrollbar, fade; cue only when rows
actually overflow) · D9 (build-time trim only, since fonts-inline.css is SHARED with Landscape: dropped 11
unreferenced faces + 5 unused weights + 5 dead dark blocks).

**RFx ROUND-3 - N1/N2/N3/N4/N5/N6/N7/N8 ALL BUILT + delivered (3.47MB).**
N1 row rule dashboard-wide: all 3 side-by-side rows now end level (measured 0px delta), including the
1-vs-2-stacked Value & Cost row; overflow scrolls inside the panel that grew. N2 longest captions trimmed
(facts kept). N3 scoring matrix rebuilt on the dashboard's own conventions (supplier swatches not a star, plum
intensity ramp shared with the Coverage heatmap instead of the blue Landscape ramp, mono weight chips, MCM gate
pills, structural leader rule). N4 banned shading removed at source + saved as a permanent rule. N5 register
COLLAPSED with an exclusive per-category accordion (native <details name>, no script), category headers readable
while closed (count / mandatory / weight / holds-a-Must-Have) + category-derived display ids (FUN-01, SEC-02)
with the STORED id kept as a secondary (renaming it would be a data change). N6 Commercial comparison split:
4 cost dimensions open, 4 commercial-terms dimensions in a fold, nothing deleted. N7 Requirements Matrix on the
same conventions as N3. N8 company profile = one fact per cell on a fixed 3-col grid (was a ragged auto-fit with
a double-stacked cell).
**A1 FINDING: the "Compare candidates head-to-head" launcher does NOT exist in the current Landscape build** -
it was a mockup proposal never built (the source comment already says "NO launcher/teaser on Overview"). So A1
is a no-op; the contradiction resolves to "do not add it".

**LANDSCAPE - STARTED, partially delivered (3.29MB).** DONE: Segmentation & Differentiators panel removed from
Overview (call commented, function retained like the market-structure precedent) · decision strip ADDED, fully
data-derived (Credible field 7 / Advance to RFx 4 / Keep as leverage 3 / Excluded 2 - NOTE these are the REAL
derived numbers, the mockup's 3/2 were illustrative) · S1 17 section headers Title-Cased · A1 verified no-op.
**"Open uncertainties" tile deliberately NOT built: landscape-data.js carries no structured uncertainty list,
only prose inside risk rationales, so the count would be fabricated. It needs a model-authored field first.**
STILL TO DO on Landscape: Market Decision Brief Sections 1-5 on Overview (content exists in
`dashboard-mockups\landscape\landscape-overview.html`) · deep-dive "Coverage by Section" + "Full Schema,
Field-by-Field" · Financial & Market Peer Position -> categorical quadrant + Credit & Market Enrichment
schema-ready · H2H "Decision Could Turn On" · Requirements Heatmap decision leverage.

## DEAL ROUND-2 NOTES (Marc, 2026-07-27) - NOT yet built
- **DN1 Terms & Review > Legal & Protection.** Clicking a protection/obligation in the Navigator should open
  ONLY that finding in the right-hand panel, with a BACK button to the full list; clicking a different one in
  the navigator jumps straight to that finding (no need to go back first). = a master/detail mode for the
  Findings Register.
- **DN2 Economics > Deal Table & ZOPA ordering (Marc ASKED, not directed).** Should "Ask -> Negotiated Value
  Ladder" move ABOVE "Total-Deal ZOPA - Sensitivity & Benchmarks"? Should "Should-Cost, Bottoms-Up" also move
  above it? Recommendation given in chat; awaiting Marc's call.

## SERVING NOTE
Edge caches `file://` hard, so updated dashboards looked unchanged. The delivery folder is now served at
**http://127.0.0.1:8900/** and dashboards are opened with a `?v=<time>` cache-buster. Use that URL (or Ctrl+F5)
when reviewing rebuilds.

## LANDSCAPE COMPLETE 2026-07-27 (3.33MB, delivered)
All approved Landscape items built + verified in browser (0 console errors; diffs scanned, 0 risky patterns):
- **Market Decision Brief, Sections 1-5** ADDED to Overview, above the untouched existing panels.
  **GENERATED, not transcribed:** the approved mockup carried illustrative prose about Nimbus / Helio /
  Lakehouse, but this project's real field is Snowflake / Databricks / ClickHouse / Redshift / BigQuery /
  Fabric / Firebolt. Copying it would have asserted FALSE FACTS about real vendors, so every section composes
  from the same reflected model the panels beside it render. Section 4 honestly reports that no soft flag is
  recorded rather than inventing uncertainties, and names the data field that would fix it.
- **Decision strip** (Credible field 7 / Advance 4 / Leverage 3 / Excluded 2): real derived numbers, NOT the
  mockup's illustrative 3/2. NOT a revival of the cut funnel strip - those described the process, these
  describe the decision.
- **Segmentation & Differentiators REMOVED** from Overview (call commented out, function retained, same
  treatment as the earlier market-structure cut).
- **Deep dive: "Coverage by Section" + "Full Schema, Field-by-Field"** added as a 7th subtab (Data Coverage);
  the existing six are untouched. Reports populated / empty / not-collected as three DIFFERENT states
  (this vendor: 95%, 20 of 21 fields).
- **Financial & Market: Peer Position -> CATEGORICAL QUADRANT.** The scatter implied a precision its inputs
  (a concern BAND plus a 0-5 fit score) do not support; vendors now sit in four named quadrants. Financial
  Health panel untouched per scope. pvDD2PeerScatterBig retained unused.
- **Credit & Market Enrichment de-branded:** no provider named anywhere user-visible (verified: 0 matches for
  D&B / Bloomberg in rendered text; the 4 remaining hits are code comments). Slots read "not collected in this
  scan" and stay schema-ready.
- **Head-to-Head: "The Decision Could Turn On"** added BELOW the untouched H2H card; lists only gaps of 0.4
  points or more, and says so plainly when nothing separates the two vendors.
- **Requirements Heatmap: Decision Leverage** added BELOW the untouched heatmap. weight x differentiation
  (vendor-score spread) x evidence coverage, indexed to the top scorer. **The MUST-HAVE term of Marc's formula
  is deliberately NOT applied** - the requirement model carries no must-have flag, so including it would mean
  inventing one; the panel states this and names the field to add. Top leverage: Security & compliance
  (spread 3.52 across the credible field).
- **S1** 17 section headers Title-Cased. **A1 verified a NO-OP** - the "Compare candidates head-to-head"
  launcher never existed in the build; the source already said "NO launcher/teaser on Overview".

### Landscape items NOT built, and why
- **"Open uncertainties" tile** on the decision strip: landscape-data.js carries no structured uncertainty
  list, only prose inside risk rationales. A count would be fabricated. Needs a model-authored field first.
- **Must-have weighting** in Decision Leverage: same reason, needs a `mustHave` flag on the requirement model.

## DEAL ROUND-2 + LANDSCAPE CORRECTIONS 2026-07-27 (late) - all delivered
**DN1 BUILT.** Findings Register focus mode: a Navigator click shows that finding ALONE with a
"Back to all findings" control + "Showing ISS-xx of 22"; clicking a different navigator item swaps
straight to it without needing Back. Back restores the full list AND the scroll position it was left
at. Implemented as show/hide classes over the existing rows (not a re-render) so the register's
filters, expanders and D8 scroll survive the round trip. Verified: focus 1 of 22 -> swap ISS-03 to
ISS-08 -> back to 22.
**DN2 BUILT, as recommended.** Should-Cost moved ABOVE the ZOPA (it is an INPUT to the ZOPA: target and
walk-away come from it). Ask -> Negotiated Value Ladder deliberately STAYS BELOW (it is the OUTPUT;
above the ZOPA it would put a conclusion before its premise). Verified order: Where the Room Is ·
Renewal & Price Protection · Should-Cost · Total-Deal ZOPA · Value Ladder.

**LANDSCAPE OVERVIEW DE-DUPLICATED (Marc: "ugly as hell", redundant with the Evaluation Summary +
Recommendation table, which he likes).** The redundancy was mine. Removed:
- the decision strip ENTIRELY (its Credible-field 7 / Advance 4 repeated the brief's own funnel inches below);
- brief Section 2 "Recommended Advance Slate" (restated the Recommendation table's fit / risk / composite /
  rank for the same vendors, plus its next-action line, plus "no open item on file" four times);
- brief Section 3 "Keep as Leverage / Exclude" (restated the table's shortlist band AND its elimination rows,
  re-creating the very card an earlier decision had deliberately merged INTO that table).
Kept + REORDERED: the brief now sits BELOW the Evaluation Summary + Recommendation table and is retitled
**"What This Scan Cannot Settle"** with 3 sections: Evidence & Coverage · Uncertainties That Could Change the
Slate · Critical RFx Questions. Those are the only parts the existing panels do not carry.

**LANDSCAPE PALETTE PASS (Marc): plum + teal shades are the primaries, burnt orange #C15E19 is the
emphasis/alert/action colour and SOLID ONLY, no lighter shades of it.** Applied across every panel, tab and
subtab (pv-07 / pv-07a / pv-07b / pv.css + the two token files). 95 replacements:
- `#B4560F` second burnt shade -> `#C15E19` (40) so there is ONE burnt orange;
- reds `#A23A30` (30) + `#C8202E` (2) -> `#C15E19`, burnt orange is the alert colour;
- light burnt / amber / pink WASHES `#FBE7E3` (10) `#FBF1DA` (7) `#F6DDC9` (5) `#FBEAD9` `#F7E3D3` `#F7E7D8`
  `#F4E6BC` `#FFF6E6` -> neutral `#F1EFEC`, no tinted grounds;
- stray blues `#DCE7EC` `#A9C4E6` `#3C5476` -> neutrals.
The last two washes lived in TOKEN definitions (`--emph-t` in theo-color.css, `--pink-t` in app-shell.css), so
they were fixed at that layer, which corrected ~60 consumers at once. Verified: 0 banned colours in the
rendered page, 0 console errors, all 5 subtabs render.
**Side effect caught + fixed:** collapsing the second burnt shade left vendor identity slots 3 and 5 identical
(`PVVENDOR_COLORS`); slot 5 became a deeper teal `#1F4E4C` so every vendor keeps a distinct colour.

**Data Coverage subtab REMOVED** (Marc: a user would never need it). Deep dive is back to its 6 subtabs;
`pvDD2Coverage` kept unreachable rather than deleted.

## OPEN QUESTION FOR MARC
**Segmentation & Differentiators** (removed earlier): Marc asked "it looked good, but was it accurate?"
Answer: it looked good and it was NOT sound. It plotted inferred fit/risk scores as precise x/y coordinates,
and its segment labels (leader / challenger / niche / caution) flipped based on two threshold sliders the user
moves, so the classification read as authoritative while being threshold-dependent. That is the same defect
just fixed on Peer Position. **Recommendation: do not restore it as a plane. If it comes back, restore it as a
CATEGORICAL quadrant** matching the new Peer Position, which keeps the visual read without the false precision.
Awaiting Marc's call.
