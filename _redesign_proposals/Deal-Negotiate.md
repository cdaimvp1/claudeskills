SOURCES READ (for traceability)
- Platform (read-only reference, not modified): assets/pv/pv-11-deal-core.js, pv-12-deal-commercial.js, pv-13-deal-review-renew.js, pv-08-deal-contract.js, pv-10-terms-renewal.js, assets/pv/pv.css, assets/theo-color.css, negotiation-practice.html, project-view.html, playbook-learning.html
- Skills: commercial-negotiation-prep-1c344a/SKILL.md (Phase 10 dashboard + examples/commercial_negotiation_dashboard.jsx), deal-room-1c344a/SKILL.md (Phase 7 dashboard + examples/deal_room_canonical_dashboard.jsx), negotiation-simulator-1c344a/SKILL.md (Position Playbook + Structured Debrief)
- Recon: scratchpad/review/recon_by_skill.md, recon_menu.md


# 1. PLATFORM (what it does well)

## Structure
The platform does NOT give commercial-negotiation-prep, deal-room, and negotiation-simulator three separate destinations. It gives ONE Deal tab per project with a mode switcher (`.dmodes` / `.dmode`, the same segmented-control pattern reused on RFx and Terms):

`[Negotiate] [Pro-forma] [Review] [Renew*]`  (`*Renew` only appears when the project is trait-flagged as a renewal)

Two project shapes get their own Deal layout instead of the mode switcher (this is the "compose by traits" rule in practice, not a special case bolted on):
- Competitive RFx projects: `dealRfxHTML()` renders a cross-supplier profiler (where each bidder stands on contracting/WwTP/onboarding, the cross-supplier normalized ZOPA, an offering-comparison + commercial-comparison matrix), because there is no single bilateral deal yet.
- Buy-under-existing-MSA projects: `dealBuyMsaHTML()` renders a minimal order-form + MSA-amendment-if-gapped view, no mode switcher, because there is nothing to negotiate line-by-line.

Inside the normal (bilateral, non-RFx) Deal tab, `dealHTML()` always renders, in order:
1. Intro sentence + a persistent, read-only **status strip** (`dealStatusStripHTML`) above the mode tabs, so process-at-a-glance ("where is this contract right now") never requires opening a mode.
2. The mode bar itself, plus two icon links (workflow view, "open full dashboard").
3. Mode body.

**Negotiate mode** (the area this brief is about), top to bottom:
- Key issues (`dealIssuesHTML`): every issue once, a category chip + a severity chip (Hard-Stop/High/Med/Low) on one header row, then a two-column body (Negotiation stance: target/fallback/hard-stop | Contract review: finding + redline + supplier-paper-vs-Lilly-template deviation when present). A banner appears only when the paper is the supplier's own, with a "Map to Lilly template" action.
- Negotiation strategy (`negStrategyHTML`): 4 KPI tiles (Negotiation difficulty, Red lines, Open positions, Compliance leverage), an opening-posture narrative banner, 4 tier-count tiles (RED LINE/HOLD FIRM/STRATEGIC TRADE/EASY CONCEDE).
- Position playbook (`negPlaybookHTML`/`negPlaybookInner`): one card per open position with a tier chip, a market-acceptance benchmark chip (e.g. "62% (N=14)"), a confidence chip, and a **5-persona tone toggle** (Standard/Collaborative/Aggressive/Curious/Astonished) that live-repaints only the opening-framing quote; Position/Arguments/Pushback/Rebuttal/Fallback text never changes. A compliance-leverage callout appears on gated positions.
- Leverage read, plus a "Practice this negotiation (preloads this project) ->" deep link into `negotiation-practice.html`, a same-origin sessionStorage handoff (private, nothing written back to the project).
- Position map (`negPositionMapHTML`): the same positions regrouped by tier, target/fallback/hard-stop per card.
- Talking points / Red lines (plain lists).
- Concession sequencing (`negSequencingHTML`): 3 round cards (Opening/Middle/Close), each with objective, ordered moves, and key risk, plus a BATNA card (alternative, value, switching cost, break-even, trigger).
- SME pre-engagement (`negSmeHTML`): per-SME brief with numbered specific asks, tagged "routed from" the position clauses that triggered it.
- MSA-already-covers filter (`negMsaCoveredHTML`): positions the executed MSA already resolves are suppressed from the open list by default, with a reveal toggle, an explicit anti-drift device.
- Commercial analysis block (`dealCommercialExtras`, 8 sub-panels): pricing-model recommendation (6 models, pros/cons/fit chip); external benchmark bands (P10/P50/P90, gated at N>=5 with the band explicitly WITHHELD rather than fabricated below that, a tier-weighted T1-T7 source hierarchy from "Executed Lilly contracts" down to "Anecdotal/single point", and a per-line research log table); ranked counter-proposal + a give/get trade-payoff matrix; value-at-risk + an assumptions register (bearer, protection, "None" shown in red); a layered discount waterfall with a leverage-insight callout; an **interactive lever/Protection-Score modeler** (toggle levers on/off, Yr-1/3-yr horizon toggle, live-recomputed annual cost, 3-yr contract value, and Protection Score with a progress bar, de-rated not summed when levers overlap); volume/consolidation-leverage cards; a **5-persona tone-matched counter-email draft** (draft-don't-send, copy/save actions).
- Negotiation prep summary card (`dealNegPrepCardHTML`, collapsible): Should-cost anchor / Market benchmark / Recommended model / Combined target, where the combined target IS (by shared computation, not just by claim) the ZOPA opening below.
- Contracted rate card (`dealRateCardHTML`): hide-until-data, renders nothing when no negotiated rate card exists for the supplier.
- ZOPA by line item (`zopaGanttHTML`): per line, a market-range bar + ZOPA band (target to walk-away) + median tick + Theo-suggested-opening dot + supplier-ask marker (flagged red when it exceeds walk-away), folded pricing/benchmark/read detail beneath each line, plus a whole-deal Total-Deal ZOPA/TCO band computed from the SAME line data (`zopaTcoBand()`).

## Why it reads as coherent
- **One reconciled data model, not several.** `zopaTcoBand()` is computed once and feeds both the prep-summary card's "Combined target" AND the ZOPA total row, so the same number never drifts between two cards. This single-source-of-truth pattern repeats throughout (the lever modeler recomputes from the same base annual figure the KPI strip shows; the pro-forma teardown reads the same pricing the ZOPA section renders).
- **One interaction idiom reused everywhere.** The `.dmodes`/`.dmode` segmented control is the same component on Deal, RFx, and Terms. The 5-persona tone toggle is the same component and the same 5 names in the Position Playbook AND the counter-email draft. A rep who has learned one sub-tab already knows how the next one behaves.
- **Strict 3-colour discipline with a job for each colour**, not decoration: plum (`--pri`, mapped from `--hue-plum` in `assets/theo-color.css`) is the primary/structural accent (top card rule, active-tab background, KPI accents); teal (`--sec`) is the sole "positive/good" signal (never green, per the suite-wide "no green in status roles" rule); burnt-orange (`--emph`, `#C15E19`) is reserved for emphasis/action items; true red (`#C8202E`/`#E1251B`) is reserved for genuine criticality (Hard-Stop, above-walk-away, "None" protection). This is why a screen with a dozen panels never looks noisy: color always means the same thing.
- **Consistent card chrome.** Every panel is a white `.card` with a 3px top rule in `var(--pri-tx)`, a thin `--line2` border, and the same subtle two-layer shadow as Overview and RFx report cards, so Negotiate mode reads as part of the same product as everything else, not a bolted-on tool.
- **A repeated 3-tier rhythm inside each analytical block**: KPI tiles -> narrative banner/callout -> supporting table/chart. Negotiation strategy, the lever modeler, and the pro-forma teardown all follow this same tiles-then-narrative-then-detail order.
- **Anti-fabrication is visible, not just documented**: the N>=5 gate literally withholds the P10/P50/P90 band and shows the reason instead of drawing a fabricated bar; the rate-card panel disappears entirely (hide-until-data) rather than showing an empty table; a missing protection shows "None" in red rather than a blank cell.
- **Escape hatch, not cramming.** Compact in-tab cards link out to "Open full dashboard" (`dashboard-contract.html`) for the deep-dive version, keeping the inline Deal tab scannable while still making the fuller analysis reachable in one click.
- **Density matches the decision, not the data volume.** The status strip is one line. The KPI rows are one line. The heaviest content (benchmark research logs, the lever modeler) is folded a level down or behind a toggle, so the page is skimmable top-to-bottom even though the underlying analysis is very deep.


# 2. SKILL DASHBOARD (current)

## 2a. commercial-negotiation-prep (Phase 10, "Interactive Negotiation Dashboard", confusingly also labeled "Deal Room" in its own SKILL.md even though it is a ONE-TIME static artifact, not the live tracker)
Locked 4 tabs: Overview (KPI row + Negotiation Prep Summary) | Benchmarks & ZOPA (per-line ZOPA chart + whole-deal band + an escalation-cap slider with live NPV/TCO recompute) | Concessions & BATNA (concession ranking + 3-round sequencing + BATNA) | Communication Alignment (dual-quote diff mined from Outlook/Teams, each topic marked DISPUTED or ALIGNED).

**Genuinely worth retaining (platform gap):**
- **The escalation-cap negotiation lever**, a slider (0-8%, compounding/simple toggle) with Target-cap and Walk-away-cap reference marks placed directly beneath the ONE ZOPA line it governs, live-recomputing that line's Year-2/Year-3 base fee, 3-yr TCO, escalation impact vs. flat baseline, and 3-yr NPV, all via kernel-backed `escalate()`/`npv()`. The platform has an escalation control too, but it lives inside the whole-deal Pro-forma TCO teardown (`pfTeardownHTML`, 0/3/4/6% buttons), scoped to the WHOLE deal's recurring lines, not to the single line actually being negotiated with reference marks showing where the cap needs to land. This is a narrower, more surgical negotiation tool worth folding in, not a duplicate.
- **Communication Alignment / commitment-integrity check.** A plain, grounded finding: "Nimbus committed X in writing on [date], then walked it back on a call on [date]," shown as a dual-quote diff (channel, date, who, verbatim text) with a stated implication, always including at least one ALIGNED example so the check reads as balanced review, not a hunt for bad news. Nothing on the platform's Deal tab does this today. (Recon correctly flagged the skill's own "Phase Alignment" sine-wave viz from theos-field-guide as abstract and hard to read; this Communication Alignment tab is the same underlying detection already reframed as a plain finding list, which is the right form to adopt.)
- **Per-line rate comparison table format** (25th/50th/75th percentile + Lilly historical average + portfolio median in one block) is a reasonable lower-density companion to the platform's percentile-track-and-dot bar, useful as an exportable/printable text view, not a replacement for the visual.

**Weak / duplicated vs. the platform:**
- The ZOPA chart, Concession ranking, sequencing, and BATNA card are functionally the SAME job the platform already does, and the platform's version is richer: the skill's benchmark table has no visible N-gate or withhold-if-insufficient behavior (it asserts "3 independent web searches" in prose only), while the platform gates at N>=5, shows a tier-weighted T1-T7 source hierarchy, and a per-line research log inline.
- The 5-persona tone framing exists only in prose guidance for this skill ("Persona affects the framing... the numbers are the same") with no interactive toggle in its own dashboard, whereas the platform already ships this as a live, reusable component (Position Playbook AND the counter-email draft both use it).

## 2b. deal-room (ongoing, round-by-round negotiation ledger; single-user, single-Project; REFLECT-ONLY; kernel-backed via `numeric_kernel.py`'s `escalate`/`npv`/`weighted_score`)
Locked 4 tabs: Overview (deal meta + KPI row: Deal Progress Score, Net Value Position, Rounds Completed, Open Issues, Approvals Pending, + round-history strip + trajectory narrative) | Concession Ledger (offer-by-offer movement table across ALL rounds, colored by movement direction, narrative on who moved more / where it stalled) | Issues Board & Packages (status-grouped issues OPEN/TENTATIVELY_AGREED/AGREED/ESCALATED/DROPPED + packages panel + approvals-needed panel + a reciprocity-check flag) | Value of Movement & Next Counter (given-vs-received-by-round bars with a cumulative net line + a Next-Counter recommendation table, concession tier re-assessed LIVE from the REMAINING gap each round, + aggregate posture paragraph).

**Genuinely worth retaining, this is THE platform gap:**
Nothing on the platform tracks a negotiation as it actually unfolds across multiple meetings. The platform's Deal/Negotiate mode is a single point-in-time PREP snapshot; its only notion of "history" is the contract-DOCUMENT version chain (`CVERSIONS`/`cvSection` in pv-08-deal-contract.js: v1, v2, v3... each with actor/side/channel/content-hash/SharePoint-version), which is an audit trail of the PAPER, not of the negotiation's positions or economics. Deal Room is the missing middle chapter between the platform's existing "before" (Negotiate mode's prep) and "after" (the platform already has a real, working `negotiation-playbook-learning` engine/service in `platform/src/engines/playbook-learning.ts` and `platform/src/orchestrator/negotiation-playbook-learning.service.ts`, plus a standalone `playbook-learning.html` dashboard, so a Deal Room close-out handoff is a real, wireable connection today, not aspirational). Specifically worth carrying over:
- A persistent, **append-only concession ledger** spanning multiple rounds/meetings, distinct from the document-version chain.
- **Deal Progress Score**: a priority-weighted, gap-closed-fraction score (0-100) via `weighted_score()`, refusing to compute if the priority weights do not sum to 1.0.
- **Net Value Position**: cumulative value given vs. received, kernel-computed for escalation-type issues, plain arithmetic (explicitly labeled as such) for simple per-unit issues, with qualitative (non-dollarizable) issues named and excluded from the rollup rather than forced into a fabricated number.
- **Reciprocity check**: flags any round where Lilly conceded on a HOLD-FIRM-tier issue with no matching ask, "confirm this was intentional."
- **A 5-state issue status taxonomy** (OPEN/TENTATIVELY_AGREED/AGREED/ESCALATED/DROPPED) that is a genuine superset of the platform's pre-negotiation tier taxonomy (RED LINE/HOLD FIRM/STRATEGIC TRADE/EASY CONCEDE): the platform's tiers classify a position BEFORE talks start; Deal Room's statuses track where it actually landed AFTER each round.
- **A LIVE Next-Counter recommendation**: the platform's Concession sequencing is a fixed, pre-authored 3-round script (Opening/Middle/Close) written once during prep; Deal Room's concession tier is re-assessed every round from the ACTUAL remaining gap, so an issue that's 90% closed naturally drifts from Hold-Firm toward Concede.
- **A Next-Round Meeting Brief**, short and ledger-derived, explicitly narrower than (and complementary to) meeting-prep-brief.
- **A structured close-out handoff** (`negotiation_outcome.json`) shaped for direct consumption by negotiation-playbook-learning, including Hard Stop flags and a `playbook_section_id` mapping captured at intake rather than reconstructed later.

**Weak vs. platform (purely visual/systemic, not substantive):**
- Built from the generic `lilly-brand-assets` component set (`Metric`/`Card`/`StateBanner`/`STable`) with the suite-standard "Georgia-serif titles on Arial body" house style and a slightly different hex palette (`#E1251B` red, `#0F3A85` "BLU" for positive) rather than the platform's own plum/teal/burnt-orange tokens, so a straight port would look like a different product bolted onto the Deal tab rather than a fifth mode of it.
- No persistent status strip, no "open full dashboard" escape hatch, and `STable` is a plain sortable table without the platform's inline mini-bars/leader-highlight sophistication used elsewhere (e.g. the benchmark bands' position-percentile bar).

## 2c. negotiation-simulator (chat-native roleplay skill: Practice/Observe/Drill/Internal-Executive-Challenge modes + a Structured Debrief; the ONLY rendered artifact is the Position Playbook)
**Genuinely worth retaining:** the Structured Debrief's METRICS discipline, not a viz, a scoring method:
- **Reciprocity ratio** with every degenerate case handled explicitly: 0 given/0 received -> "NOT APPLICABLE"; gave with nothing received -> "POOR (one-sided giving)"; received with nothing given -> "STRONG (you captured value without giving)"; both positive -> `M/N` index with BALANCED (>=1.0) or UNFAVORABLE (<1.0) state.
- **Anchor effectiveness capture%**, `(W-Z)/(Y-Z)*100`, with edge cases handled instead of printing a misleading number: beyond-target capped at "100% (target fully reached)" with a separate "beyond target" note; zero-range opening-equals-target -> "NOT APPLICABLE"; wrong-direction movement -> "0% (you moved away from target)", never a negative-looking positive; non-numeric issues assessed qualitatively (held/partial/conceded), never forced into a fabricated percentage.
- **Playbook-position coverage** ("N of M positions used") and an explicit **Hard-Stop-at-risk** flag.
None of this scoring exists anywhere on the platform today, including inside `negotiation-practice.html`'s own debrief.

**Weak / duplicated vs. platform:** the Position Playbook artifact itself (tier chip, market-acceptance benchmark with N, confidence stamp, argument/pushback/rebuttal/fallback, 5-persona tone toggle) is already close to a 1:1 match with the platform's live `negPlaybookHTML`. There is essentially nothing structural left to add here, only a discipline check (confirm "Not available" renders for any position with no cited benchmark, matching the skill's own anti-fabrication example card). The roleplay modes (Practice/Observe/Drill) already have a live, working platform equivalent in `negotiation-practice.html`, reached today via the "Practice this negotiation" deep link from Deal/Negotiate, so the newest version should upgrade THAT sandbox's debrief math rather than stand up a second, competing simulator experience.


# 3. NEWEST VERSION (the proposal)

**Governing move:** promote Deal Room to a **fifth mode** inside the EXISTING Deal-tab mode switcher, not a new tab, new page, or new tool. This follows the locked "ONE base + compose by traits" rule: Deal Room is a different TEMPORAL slice of the same deal (before -> during -> after), not a different feature.

```
Deal tab mode switcher:
[ Negotiate ]  [ Deal Room ]  [ Pro-forma ]  [ Review ]  [ Renew* ]
```
- `Deal Room` is visible once a project has a negotiation baseline (see intake note below). Before that, its tab body shows a single-CTA state: "Set up the Deal Room ledger from this project's Negotiate tab", which auto-seeds from data the Negotiate tab already has, no re-keying.
- `*Renew` unchanged, trait-gated as today.
- RFx (competitive) and Buy-under-MSA Deal variants: unchanged for now; once an RFx event down-selects to one supplier and bilateral talks begin, that project's Deal tab converts to the normal bilateral shape (as it likely already does structurally) and Deal Room becomes available there too. Before down-select there is no single ledger to track across multiple bidders, so the cross-supplier normalized ZOPA remains the correct pre-selection tool and Deal Room stays hidden.

## A. NEGOTIATE mode (retain the existing structure; two concrete additions, in place)

1. Status strip (unchanged)
2. Key issues (unchanged: category+severity dual chip, two-column stance/review body)
3. Negotiation strategy (KPI tiles + posture banner + 4 tier tiles) (unchanged)
4. Position playbook, 5-persona toggle (unchanged; tighten one thing: confirm every position missing a cited market-acceptance benchmark renders an explicit neutral "Not available" chip rather than omitting the field, matching negotiation-simulator's own anti-fabrication example card)
5. **NEW panel: Communication alignment.** A dual-quote diff card per topic, mined from the same M365/comms surface the app already reads elsewhere (`assets/react/comms-tab.js` / Total Recall), each topic tagged DISPUTED or ALIGNED with the two quotes (channel, date, who) side by side and a one-line implication. Always render at least one ALIGNED example when one exists. Placed directly after Key Issues, since a disputed commitment is itself a negotiation issue. Reuses the existing severity-chip and card components; no new visual language.
6. Leverage read + "Practice this negotiation" link (unchanged)
7. Position map grouped by tier (unchanged)
8. Talking points / Red lines (unchanged)
9. Concession sequencing (3-round cards) + BATNA (unchanged AS THE PRE-TALKS PLAN; see section B for how this becomes live once Deal Room exists)
10. SME pre-engagement (unchanged)
11. MSA-already-covers filter (unchanged)
12. Commercial analysis block: pricing model / benchmark bands / counters / value-at-risk / waterfall / lever modeler / volume leverage / tone-matched email (unchanged)
13. Negotiation prep summary card (unchanged; still the one reconciled source that sets the ZOPA opening)
14. Contracted rate card, hide-until-data (unchanged)
15. ZOPA by line item + Total-Deal ZOPA/TCO band (unchanged)
16. **NEW, small: inline per-line escalation-cap sub-control.** On any ZOPA line whose unit is an annual recurring rate (the `$/yr` lines, e.g. platform fee, support, residency, DR), add a compact 0-8% slider directly in that line's folded detail (`.zdetail`), with Target-cap and Walk-away-cap tick marks on the same track, a compounding/simple toggle, and a live-recomputed Year-2/Year-3 figure + 3-yr NPV delta for THAT LINE, via the same `escalate()`/`npv()` functions the Pro-forma teardown already mirrors in JS. This is commercial-negotiation-prep's Phase-10 lever, scoped correctly (per-line, where the cap actually applies) instead of duplicated as a second whole-deal control. The existing whole-deal escalation control stays in Pro-forma mode's TCO teardown unchanged; the two are complementary (one line, one whole deal), not the same control shown twice.

## B. DEAL ROOM mode (new; the skill's 4 tabs collapsed to 2 sub-views to match the platform's density, built from the platform's own component vocabulary, not a raw port of the skill's JSX)

**B1. Overview & Ledger**
- KPI strip, same tile component family as Negotiation Strategy's `ngkpi` tiles: Deal Progress Score, Net Value Position (given / received / net), Rounds Completed, Open Issues, Approvals Pending.
- Round History strip: compact horizontal chips, one per round (date + one-line label), click to scroll the ledger to that round.
- "Log this round" box at the top: a single free-text field ("paste an email, or type a sentence about what happened") that parses into structured movement per Deal Room's Phase 2 behavior (new Lilly/supplier position per issue touched, concessions given/received, tentative-vs-final agreement language, new issues surfaced, approvals triggered), then shows a one-line confirm-before-commit summary.
- Concession ledger table: every issue x every round, current status shown with a status pill reusing the platform's chip styling (`AGREED` = teal/`--sec`, `TENTATIVELY_AGREED` = amber/`--emph`-family, `OPEN` = neutral, `ESCALATED` = red/critical, `DROPPED` = neutral-strikethrough), sortable, matching the existing table styling used in the benchmark research log and the Commercial-analysis tables rather than importing the skill's separate `STable`.
- Narrative card: trajectory, who has moved more, and the **reciprocity-check flag**, rendered with the same amber "warn" banner style already used for the on-supplier-paper banner elsewhere in Deal (`.paperbanner`/`.fpbanner`), so a reciprocity warning reads as the same kind of thing a rep already recognizes.

**B2. Issues, Packages & Next Counter** (two-column, matching Key Issues' existing `.dibody` grid: two columns above 760px, stacked below, same breakpoint, no new layout system)
- Left column (~45%): Issues board grouped by status; Packages panel (linked-issue trade logic, status PROPOSED/ACCEPTED/REJECTED); Approvals-needed panel (what, who, status).
- Right column (~55%): Value-of-movement chart (given vs. received by round, cumulative net line), styled consistently with the platform's existing bar charts (category-strategy / pro-forma bars), not a fresh recharts import; beneath it, the Next-Counter recommendation table, one row per OPEN issue (current Lilly/supplier position, remaining gap $, LIVE concession tier re-assessed from the remaining gap this round, recommended move, a reciprocity flag, a suggested framing line), plus the aggregate-posture paragraph.
- Two actions at the bottom: "Generate next-round brief" (produces the short, ledger-derived Deal Room brief, distinct from meeting-prep-brief, as a download or side panel) and "Close deal" (emits the handoff record and links directly to the platform's existing `playbook-learning.html`, wiring into the already-built `negotiation-playbook-learning` engine/service rather than inventing a new integration point).

**Data-model note (buildable detail, not hand-wavy):** Deal Room's intake is a confirm-and-adjust pass over data the Negotiate tab already computed, not a blank form: `issues[]` seeds from `DEAL_ISSUES` (Key Issues) plus `NEG_POSITIONS` (Position playbook/map, including tier, target, fallback, hard-stop, compliance flag), `priority` derived from the existing tier (RED LINE/HOLD FIRM -> High, STRATEGIC TRADE -> Medium, EASY CONCEDE -> Low), and the initial 3-round plan seeds from `NEG_SEQ` + `NEG_BATNA`. Every later round is an appended entry, never an edit to a prior one (matching both Deal Room's own append-only rule and the platform's existing append-only `CVERSIONS` convention for contract redlines, so the two ledgers, document-versions and negotiation-economics, follow the same discipline without being the same data).

## C. Position Playbook / Practice loop (a wiring fix, not a new tab)
- Keep the Position playbook exactly as built in Negotiate mode; no structural change.
- Upgrade `negotiation-practice.html`'s existing debrief to compute negotiation-simulator's exact reciprocity-ratio and anchor-effectiveness formulas, including the documented edge cases (0:0 "NOT APPLICABLE", one-sided "POOR"/"STRONG", `M/N` index with BALANCED/UNFAVORABLE state, capture% capped at "100% (target fully reached)" with a separate beyond-target note, non-numeric issues assessed qualitatively never fabricated), plus add "playbook position coverage (N of M)" and a "Hard Stop at risk" flag if the current sandbox debrief does not already compute these at this level of rigor.
- Offer the skill's opt-in "save a lightweight session record" (`is_real_outcome: false`) exactly as specified, so practice reps never contaminate Deal Room's real ledger or the playbook-learning dataset's true win/loss accounting.

## D. Pro-forma / Review / Renew modes
Unchanged; out of this area's direct scope. Note only: Pro-forma's whole-deal escalation-slider TCO teardown and Negotiate's new per-line escalation sub-control (A.16) are intentionally complementary views of the same math at two different scopes, not a duplicate to be merged away.

## Net structural diff vs. today
- Add: 1 new Deal-tab mode (Deal Room, 2 sub-views), 1 new Negotiate panel (Communication alignment), 1 new inline sub-control (per-line escalation lever), 1 upgraded debrief (negotiation-practice.html).
- Remove: nothing. Every existing panel in Negotiate/Pro-forma/Review/Renew is retained as-is.
- Wire, don't invent: Deal Room's close-out handoff targets the ALREADY-BUILT `negotiation-playbook-learning` engine/service and `playbook-learning.html`, so this is closing a loop the platform's own architecture already anticipates, not adding a speculative integration.


# 4. DESIGN NOTES

**Palette and surface.** Light mode: `--bg #E2E6E1` (a warm, pale sage-grey canvas, not pure white), `--surface #FFFFFF` for every card, `--ink #1A1A1A` near-black text, `--mut #3E3933` / `--mut2 #4A443C` for secondary text. This "off-white canvas, white cards, near-black ink" system, not true white-on-white, is what the app-wide readability-lift work has been protecting; the new Deal Room mode must sit on the same `--bg`/`--surface` pair, never introduce its own white or grey.

**The 3-colour rule, carried over exactly.** From `assets/theo-color.css`: `--pri` (plum, `--hue-plum`) is the primary/structural accent (card top-rule, active-tab fill, KPI accents); `--sec` (teal) is the ONLY "positive/good" signal, never green; `--emph` (burnt-orange, `#C15E19`) is emphasis/action, not alarm; true red (`#C8202E`/`#E1251B`) stays reserved for genuine criticality (Hard-Stop, above-walk-away, escalated issue). Map Deal Room's status taxonomy onto this exactly rather than inventing new hues: `AGREED` -> teal, `TENTATIVELY_AGREED` -> amber/burnt-orange family, `OPEN` -> neutral grey, `ESCALATED` -> red, `DROPPED` -> neutral/struck-through. Do NOT import the skill JSX's own palette (`#E1251B`/`#0F3A85`/`#521207` etc.); those are a different, suite-standard palette built for the skill's standalone deliverables, and porting it verbatim would make Deal Room look like a different product welded onto the Deal tab.

**Typography: one typeface, not two.** The platform uses a single family, `--sans` and `--mono` both set to `'Libre Franklin'`, and differentiates "label" vs. "body" vs. "number" purely by weight, size, letter-spacing, and case (the `.secthd .t` uppercase-tracked label pattern, `--fz-h`/`--fz-title`/`--fz-body`/`--fz-meta`/`--fz-mono` scale). The skill dashboards use a two-typeface "Georgia-serif titles and numbers on Arial body" house style. For Deal Room, follow the PLATFORM's single-typeface discipline: reuse `--fz-h`/`--fz-title` for the KPI numbers and card headers exactly as Negotiation Strategy's `ngkpi` tiles already do, do not bring in a serif face. This is the single most important typographic instruction for whoever builds this, a Georgia-serif Deal Room dropped into an all-Libre-Franklin Deal tab would be the most visible tell that it was pasted in rather than built for this product.

**Card and panel chrome.** Every panel is a `.card`: white surface, `border:1px solid var(--line2)`, `border-top:3px solid var(--pri-tx)`, `border-radius:9px`, the shared two-layer `box-shadow` (`0 1px 2px rgba(28,28,34,.04), 0 4px 11px -4px rgba(28,28,34,.09)`). Section headers use `.secthd`: an uppercase, letter-spaced, mono-styled label with a left border rule in `--pri-tx`, plus an optional right-aligned meta note in `--mut2`. Deal Room's Overview/Ledger and Issues/Next-Counter sections should use exactly these two components, not new ones.

**Spacing and density.** Sections stack with `margin: 0 0 14px` between `.sect` blocks; KPI tile rows use a 4-up grid (`repeat(4,1fr)`, collapsing to 2-up under 680px); two-column analytical layouts (Key Issues' `.dibody`, and the proposed Issues/Next-Counter split) use `1fr 1fr` collapsing to a single column under 760px. Reuse these exact breakpoints so Deal Room resizes identically to the rest of the Deal tab.

**Status strip and escape hatch, carry both over.** Deal Room should NOT duplicate the persistent status strip (that stays a Negotiate/Review-level concept, one per project, not one per mode), but it SHOULD offer the same "open full dashboard" escape-hatch link pattern for a printable/exportable version of the ledger, consistent with `dashboard-contract.html`'s role today.

**Iconography and mascot.** The Lilly corporate logotype (the red/purple script mark, embedded as the top-bar `.brand` image) stays exactly where it is, untouched, this area does not touch global chrome. "Theo" appears as plain product-name text in page titles and section copy (e.g. "Negotiation Practice - Theo"), not as a separate logotype graphic; where a mascot mark is wanted (page hero, empty states), use the existing `theo-dino-mark.png` / `theo-dino.webm` dino asset exactly as `negotiation-practice.html` already does via its `.dino` hero span, do not commission a new mark for Deal Room.

**Reflect-only language, keep it literal and repeated.** Every new panel (Communication alignment, the per-line escalation lever, Deal Room in full) must carry the same explicit "Reflect-only; nothing is sent, nothing is decided here, the rep chooses what to actually offer" language the rest of Deal/Negotiate already repeats verbatim on nearly every sub-panel; this is a load-bearing trust convention for the whole Deal tab, not decorative copy.
