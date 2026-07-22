# Procurement Options Analysis Dashboard: Canonical Structure v1.0 (LOCKED)

This spec is mandatory. Every procurement-options-analysis dashboard this skill produces, for
every request, category, or commodity, follows this exact structure. Only the data changes per
run. The reference implementation is `examples/procurement_options_canonical_dashboard.jsx`.
Clone its structure, swap the data.

## The determinism guarantee

1. **Same skeleton, always.** Five tabs, in the fixed order (Overview & Recommendation, Options
   Matrix, Scored Comparison, Recommendation & Rationale, Evidence & Assumptions), appear on
   every run for every request. Header, footer, tab nav, color tokens, typography, and reusable
   components are identical run to run.
2. **All ten options render, always.** A request-specific screen decides APPLICABLE vs
   NOT_APPLICABLE per option (never a per-run redesign of which options exist); a NOT_APPLICABLE
   option is a dimmed row with a one-line reason on Options Matrix, never a dropped row.
3. **Numbers reconcile by construction.** The dashboard's data model computes every Overall
   Score from the six raw dimension scores and the active weight profile via the kernel-mirrored
   `weightedScoreJS()`, never from a hand-typed total. The Scored Comparison stacked-bar segments
   for a given option sum exactly to that option's Overall Score shown on Overview and Options
   Matrix; all three tabs rank the same options in the same order under the same profile.
4. **Interactive controls recompute live, client-side.** The weight-profile switcher
   (Default / Time-Critical / Risk-Sensitive) is a pure function over the in-memory `OPTIONS`
   array (`computeRanked(profileKey)`); no server round-trip, no re-fetch. Profile state is
   lifted to the top-level dashboard component, so switching it on Overview and switching it on
   Scored Comparison show the identical result.
5. **The gate-vs-score reconciliation is derived, not authored per run.** Whether the
   reconciliation banner fires is computed from the top-ranked option's `confidence` label and
   `blockingItem` field under whichever profile is currently active, so it can appear or
   disappear as the user switches profiles, exactly as the underlying evidence dictates.

## Color tokens (do not change)

R `#E1251B` (Lilly Red), DK `#212121` (Lilly Black), BRN `#521207` (Bold Brown), CARD/BD
`#E4EBF1` (Neutral Stone), WARM `#FFF0D8` (Neutral Cream), RISK `#FDE8E5` (Neutral Rose), OK
`#D4E5F7` (Neutral Sky, positive background tint), MUT/LT `#8A969E` (Bold Grey), BLU `#0F3A85`
(Bold Blue, the on-brand positive/good/passing signal), AMB `#B45309` (Amber). Chart palette
(exactly 6, verbatim from `dashboard-components.md`), reused here as the fixed per-dimension
color assignment on the Scored Comparison stacked bar: `[R, BLU, BRN, "#F58E7D", "#FFC709",
"#99BFE5"]` mapped in order to Cost, Time, Feasibility, Switching Burden, Risk, Optionality. No
green or teal anywhere, per the lilly-brand-assets no-green rule.

## Typography

Georgia serif for titles, KPI numbers, and emphasis. Arial for body text, tables, and labels.

## Reusable components

Copied verbatim from `lilly-brand-assets-1c344a/references/dashboard-components.md`: Metric,
Card, StateBanner, STable, Tip. Two small local additions follow the same pattern
pro-forma-builder's `ConfBadge` uses: `ConfBadge` (HIGH/MEDIUM/LOW confidence pill, same color
discipline as `SevPill`) for Evidence Confidence, and `ApplPill` (APPLICABLE/NOT APPLICABLE) for
the Applicability column, both same shape and sizing as `SevPill`/`PrioPill`, no new hexes.
`StateBanner` gains one additional local `kind`, `RECONCILE`, styled identically to the existing
Lilly-Red-accented negative state, for the gate-vs-score reconciliation banner; it is not a new
color, only a new labeled use of the existing negative token.

## Tab 1: Overview and Recommendation

- Weight-profile switcher (three buttons: Default, Time-Critical, Risk-Sensitive), shared state
  with Tab 3.
- KPI row (4 cards): Recommended path, Overall Score (with the active weight profile shown),
  Evidence Confidence (with the non-VERIFIED dimension count), Runner-up (flagged when within
  0.2 of the leader).
- "What would change this conclusion" one-liner: derived by actually re-ranking under all three
  named profiles and stating whether any of them flips the leader, never a fabricated or
  hand-typed claim.
- Gate-vs-score reconciliation `StateBanner` (kind `RECONCILE`), rendered only when the
  top-ranked option's Evidence Confidence is LOW or it carries a `blockingItem`.
- Ranked horizontal bar of every APPLICABLE option's Overall Score, color-coded by the same
  `scC()` thresholds used everywhere else in the suite (favorable/caution/unfavorable), with a
  footer line naming which options were screened out as NOT_APPLICABLE.

## Tab 2: Options Matrix

- A one-paragraph framing sentence naming how many of the ten fixed options are NOT_APPLICABLE
  this run.
- Full sortable/searchable `STable`: all TEN options as rows, in the framework's fixed order
  (not re-sorted by rank; the column-sort control lets a user re-order without changing the
  underlying skeleton). Columns: Option, the six dimension `ScoreCell`-style colored score
  columns, Overall Score, Evidence Confidence badge, Applicability pill. NOT_APPLICABLE rows are
  dimmed (Bold Grey text, "N/A" score cells) but never removed.
- A companion panel listing each NOT_APPLICABLE option's one-line reason in full sentence form
  (the matrix row itself only has room for a short version).

## Tab 3: Scored Comparison

- Weight-profile switcher, shared state with Tab 1.
- Stacked horizontal bar chart: one bar per applicable option, six colored segments (one per
  dimension) whose lengths are that dimension's weighted contribution (`score x weight`) under
  the active profile. Segment order and color match the fixed `DIMENSIONS` array and the chart
  palette above. Segments sum exactly to the Overall Score shown on Overview and Options Matrix.
- Paired narrative panel: names the single largest contributing dimension for the current
  leader, computed from the same contribution data, not asserted.

## Tab 4: Recommendation and Rationale

- Full narrative on why the leading option wins (a computed score gap, not just a claim), and
  the runner-up's single biggest relative advantage (the dimension where the runner-up
  outscores the leader by the widest margin, computed, not picked by hand).
- The gate-vs-score reconciliation detail (the same trigger logic as Tab 1's banner, expanded
  into a full explanation with the routing instruction, per `sme-matrix.md`, when triggered).
- Next Steps: closing the leading option's evidence gaps, resolving any BLOCKING item, and the
  specific downstream skill named for both the leader and the runner-up (`NEXT_STEP_SKILL`),
  never a generic "consult procurement" line.

## Tab 5: Evidence and Assumptions

- Full per-option, per-dimension evidence log (`STable`, one row per scored cell): score,
  VERIFIED/INFERRED/ASSUMED status (rendered as a confidence-style badge), and the one-line
  rationale.
- Research log with source, date, and confidence per entry, plus a `RESEARCH_PENDING`
  `StateBanner` for any anchor not yet established (never silently treated as zero or favorable).
- The active weight profile's six values, stated plainly, with a one-line note that the sum is
  kernel-enforced (`weighted_score()`'s `WeightSumError` refusal), so a reader never has to trust
  an unstated weight set.

## Anti-patterns

1. No per-run redesign of tabs, panels, or the ten-option framework itself.
2. No vanishing options: every one of the ten always renders somewhere in Options Matrix, using
   a labeled NOT_APPLICABLE state with a reason when genuinely inapplicable, never a blank or a
   silently shortened list.
3. No hand-typed Overall Scores or stacked-bar segments that could drift from the underlying
   `OPTIONS` data and the active weight profile; every figure is derived through
   `weightedScoreJS()`, the same mirror pattern the workbook's `weighted_score()` kernel call
   uses.
4. No burying an evidence conflict behind a high score: the gate-vs-score reconciliation banner
   is derived from the data, not something the model chooses to show or hide per run.
5. No naked charts: both visualizations (the ranked bar, the stacked contribution bar) are paired
   with an adjacent narrative analysis panel.
6. Never conflate this skill's per-path Overall Score with evaluation-engine's per-supplier
   Final_Score; both happen to use 0.0-5.0, but they answer different questions and must never be
   shown as if directly comparable.
