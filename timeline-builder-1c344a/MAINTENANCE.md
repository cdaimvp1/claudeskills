# MAINTENANCE.md - timeline_engine.py

## What this kernel owns

`timeline_engine.py` is a standalone, stdlib-only Python re-implementation of
the critical-path math in `SKILL.md` (Timeline Builder, Version 1.1, June 2,
2026). It exists so the arithmetic behind the skill's estimates can be
unit-tested outside a chat run, and so the specific v1.0 regression
(described in the v1.1 changelog) has a standing automated check.

It owns, and directly mirrors, these sections of `SKILL.md`:

- **Defaults tables** (Sourcing, Negotiation, Risk reviews, Concurrent
  work/onboarding/pilot, Redline turns) -> `SOURCING_TABLE`,
  `NEGOTIATION_TABLE`, `REVIEW_TABLE`, `ONBOARDING_ROW`, `PILOT_TABLE`,
  `PER_TURN_ROW`.
- **Step 2 (complexity score -> friction factor)** -> `compute_complexity_score()`,
  `friction()`, `tier_label()`. The formula
  `friction(score) = clamp(1.00 + 0.025*max(0,score), 1.00, 1.25)` is copied
  verbatim from SKILL.md line 269.
- **Step 3 (critical-path base, Low/Base/High in parallel)** -> the `LBH`
  vector type plus `sourcing_row()`, `negotiation_row()`,
  `redline_addition()`, `longest_triggered_review()`, `onboarding_row()`,
  `pilot_row()`, `concurrent_band()` (max, never sum), and
  `critical_path_base = sourcing + concurrent_band`.
- **Step 3d (friction applied once)** -> `core = critical_path_base * friction(score)`.
- **Step 4 (sequential Lilly-system phases, unscaled)** -> `sequential_lilly_phases()`,
  `total = core + atc_ats + execution`.
- **Step 4b / Rule 9 (sanity-ceiling self-check, ~78 weeks)** -> `SANITY_CEILING_WEEKS`
  and `TimelineResult.sanity_ceiling_tripped`.
- **Step 5 (Low/Base/High propagation, no flat percentage)** -> the entire
  calculation is done once per `LBH` vector (which carries Low/Base/High
  together through every add/multiply/max), so the range is never a flat
  +/-20% band bolted onto Base after the fact.
- **Calibration (three-question first-run prompt -> domain scale factor K)**
  -> `derive_domain_scale_factor()` (K_raw = mean(Q1/6, Q2/20, Q3/10), clamped
  to [0.6, 1.8], per SKILL.md lines 199-200) and
  `calibration_overrides_from_answers()`.
- **A deliberate double-count regression guard** -> `sanity_guard()` and
  `DoubleCountRegressionError`, raised inside `compute_timeline()` if a total
  ever exceeds `critical_path_base.base * 1.25 + sequential_total`. This is
  the exact shape of the v1.0 bug (a discrete 2x/4x tier multiplier
  re-applied to phases that already encode complexity, or a parallel band
  summed instead of maxed) and is the single most important check in this
  file.
- **`naive_old_buggy_total_base()`**, a deliberately-wrong reimplementation
  of the OLD v1.0 math, kept ONLY for regression testing (never call it from
  application code). Its shape is copied from SKILL.md's own comparison
  sentence (line 473): `(11 + 26.75 + 15) * 2.0 + 5 = 110.5 weeks`, generalized
  with the old discrete tier table implied at line 266
  (`0.75 -> 1.0 -> 2.0 -> 4.0`).

## What this kernel does NOT own

- It does not implement Step 1 extraction/pickers (`ask_user_input_v0`
  question rendering), Step 6 output rendering (the chat text skeleton), the
  optional Gantt/`visualize:show_widget` view, or any of the cross-skill
  handoffs (theos-field-guide, process-navigator, voice-profile). Those stay
  in the chat-run skill logic; this file is math only.
- It does not talk to `timeline_calibration.json` I/O; it takes an already
  resolved `K` (and optional per-instrument override dict) as plain
  `Facts` fields. Whatever loads/saves that JSON in the live skill should
  call `derive_domain_scale_factor()` / `calibration_overrides_from_answers()`
  and feed the results into `Facts`.

## When and how to update this kernel

Update `timeline_engine.py` whenever `SKILL.md`'s **Defaults**, **Calibration**,
or **Workflow (Steps 2-5)** sections change version. Concretely:

1. If a table value changes (e.g. SAE Base moves off 15, or a new review type
   is added), update the matching `*_TABLE` dict. Keep the inline `# SKILL.md
   lines N-M` citation comment next to it current.
2. If the friction formula's coefficients or cap change (currently
   `1.00 + 0.025*score`, capped at 1.25), update `friction()` and re-run the
   self-test - the golden test's expected friction (1.175) and the Major-tier
   test's expected cap (1.25) will fail loudly if the source and the code
   disagree.
3. If the worked example in SKILL.md's "Worked end-to-end example" section is
   replaced or re-derived, replace `golden_facts` / the expected numbers in
   the `__main__` block with the NEW example's exact quoted inputs and
   outputs. Do not average old and new examples; always trace to a single
   worked example verbatim from the file.
4. If the sanity-ceiling constant (`~78 weeks`) changes, update
   `SANITY_CEILING_WEEKS`.
5. If the calibration clamp bounds or baseline averages change (`0.6/1.8`,
   `6/20/10`), update `K_MIN`/`K_MAX`/`CALIBRATION_BASELINE_AVERAGES`.
6. After any change, run:
   `python timeline_engine.py`
   and confirm the summary line reads `N passed, 0 failed`. A non-zero exit
   code means either a genuine regression or that the golden example's
   expected numbers are now stale relative to SKILL.md and need updating
   together with the source change.

## Known limitations / ambiguities inherited from SKILL.md

These are places where SKILL.md's prose was not fully mechanical and a
judgment call was required. They are also flagged inline in the code:

1. **Which column calibration overrides.** The Negotiation table's markdown
   (SKILL.md lines 227-234) attaches the "(Base overridden by calibration
   QN)" annotation text to the High-column cell typographically (e.g.
   `"8 (Base overridden by calibration Q1)"` appears in the High column of
   the SOW-existing-MSA row), but the surrounding prose says plainly "Direct
   override of the three matching negotiation rows... The user's number
   replaces the baked-in Average for that row" (line 195), and "Average"
   clearly means Base, not High. The kernel overrides **Base only**, leaving
   Low/High at the baked-in defaults. If a future SKILL.md revision clarifies
   this differently, `negotiation_row()` and `calibration_overrides_from_answers()`
   are the two functions to change.
2. **Default redline-turn count for "Master agreement amendment."** SKILL.md
   line 360 states defaults only for PO/short-form (1), SOW (2), and New MSA
   (3); it does not state a default for Master Agreement Amendment. The
   kernel defaults it to 2 (treated like the SOW rows) as an unstated
   judgment call (`DEFAULT_REDLINE_TURNS`), not something SKILL.md specifies.
3. **What the OLD v1.0 buggy math did with onboarding/pilot.** SKILL.md's
   only concrete statement of the old formula (line 473) is
   `(11 + 26.75 + 15) * 2.0 + 5 = 110.5`, i.e. sourcing + negotiation-with-turns
   + longest-review only; it does not show what v1.0 did when onboarding or a
   pilot was also present. `naive_old_buggy_total_base()` therefore only
   reproduces the golden example's own three-term sum and does not model an
   old onboarding/pilot term, since SKILL.md gives no worked number for that
   case to trace to.
4. **Scope.** This kernel only computes the numeric total/range and the two
   self-checks (double-count guard, sanity ceiling). It intentionally does
   not decide confidence labels (High/Medium/Low based on confirmed vs.
   assumed factor count, SKILL.md Step 5) - that requires knowing which
   inputs were user-confirmed vs. defaulted, which is a chat-turn concern, not
   a pure math concern. Callers should track confirmed/assumed counts
   themselves using the `*_assumed` flags already returned on `TimelineResult`
   (`turns_assumed`, `deal_size_assumed`) plus their own tracking of which
   Step 1 answers were given vs. defaulted.
