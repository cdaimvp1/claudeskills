# MAINTENANCE.md - numeric_kernel.py

## What this kernel is the source of truth for

`numeric_kernel.py` is the single, shared implementation of the arithmetic
that multiple Lilly Procurement Skills each describe independently in prose:

| Function | Owning skill (source of the rule) |
|---|---|
| `to_hourly` | market-rate-benchmarking (Normalization Rules table) |
| `convert_currency` | pro-forma-builder (Assumptions register FX convention), used suite-wide |
| `percentile_gate` | market-rate-benchmarking (Rule 2, the corrected single N>=5 threshold) |
| `verify_line_math` | lilly-contract-review (arithmetic-verification.md, 3E-1 #1) |
| `escalate` | lilly-contract-review (arithmetic-verification.md, 3E-2 #2) |
| `weighted_score` | market-rate-benchmarking (Composite Contract Quality Score) AND evaluation-engine (Effective_Weight_Frac / Score Validation Checks) - both skills independently require weights to foot to 1.0; this is one shared guard instead of two divergent ones |
| `npv` | pro-forma-builder (Financial Methodology, end-of-year Year-1 discounting) |
| `quadrature_rollup` | should-cost-builder (Aggregation Method: quadrature + >15% LOW-confidence widening) |
| `reciprocity` / `anchor_capture` | negotiation-simulator (the two Structured Debrief metrics and every degenerate case its v2.3 changelog records defining) |
| `hhi` / `hhi_band` | category-strategy (`references/analysis-methodology.md`, HHI and its concentration bands) |
| `pareto_segments` | category-strategy (Pareto methodology, A/B/C/D segments, p80/p95/p99, efficiency ratio) |
| `cagr` / `yoy` | category-strategy (growth metrics, and the >50% CAGR rapid-growth anomaly check) |
| `tail_at_threshold` | category-strategy (tail spend framework and the effort-to-value hours band) |
| `outcome_partition` | negotiation-playbook-learning (`references/outcome-schema.md`, the win/loss partition and the sum-to-1.0 integrity check) |
| `difficulty_score` | negotiation-playbook-learning (the 0-100 Negotiation Difficulty Score, its bands, and the v2.1 scaling fix) |
| `level_bid` | rfp-response-analysis (`references/bid-leveling.md`, the three normalization formulas and the escalation rule at SKILL.md:1704) |
| `deduction_score` | lilly-contract-review (`references/risk-scoring.md`, the combined-protection-weighted deduction table, the Hard Stop invariant, and BOTH anti-drift calibration checks) |
| `score_band` | lilly-contract-review (`references/risk-scoring.md:37-42`, the four residual-risk bands) |

If any of the owning skills above changes its documented formula, threshold,
or tolerance, this file is the one place that must change to keep the whole
suite consistent. Skills should call into this kernel rather than
re-implementing the arithmetic inline, so a fix here fixes it everywhere.

**Not yet covered by this kernel** (documented in the source skills but not
implemented here, because the task that produced this file scoped only the
functions listed above): should-cost-builder's correlated-drivers grouping
step and margin/SG&A linear-on-top step; pro-forma-builder's ROI, payback,
and savings-waterfall formulas; evaluation-engine's sensitivity/perturbation
matrix and tie-breaking rules. Treat these as a known gap, not a silent
omission, until they are ported in.

**Current shipped scope:** this directory holds one Python module
(`numeric_kernel.py`) plus this maintenance doc. No versioned JSON reference
tables ship yet, even though the original foundation-skill scope for this
directory anticipated Python modules (plural) and versioned JSON reference
tables. Treat the JSON tables as a known future addition, not a silent
omission, until they are added.

## When to update this kernel

Update `numeric_kernel.py` whenever:
- Any owning skill's SKILL.md changes a **threshold, tolerance, formula
  shape, or rate** covered by the table above (e.g. the percentile-gate N
  threshold, the weight-sum tolerance, the quadrature widening percentage,
  the discounting convention).
- A skill's changelog documents a **bug fix to a formula** this kernel
  implements (the v2.1 market-rate-benchmarking weight-sum fix, from 1.05 to
  1.00, is the reason `weighted_score` exists as a hard-refusing shared
  function instead of being re-implemented ad hoc per skill).
- A new skill is authored that needs one of these same primitives (unit
  conversion, currency conversion, percentile gating, escalation, weighted
  scoring, NPV, or quadrature cost rollup) - vendor it from here rather than
  writing a fresh copy, so the suite does not re-accumulate the same class of
  bug in a second place.
- A source file this kernel cites is renamed, restructured, or its section
  numbering changes (e.g. arithmetic-verification.md's "3E-2" label) - update
  the docstring citations so they still point at the right section.

## How to update this kernel

1. **Re-read the exact source text** in the owning skill's SKILL.md or
   reference file before touching code. Do not paraphrase or "improve" a
   formula from memory; quote it into the docstring comment the same way the
   existing functions do.
2. **Bump the version stamp.** This file does not currently carry an explicit
   `__version__`; add one (e.g. `__version__ = "1.1.0"`) the first time you
   change a formula, and increment it (semver-style: patch for
   docstring/comment fixes, minor for a new function, major for a
   breaking signature or behavior change) on every subsequent change. Record
   the change and its source citation in a `CHANGELOG` comment block at the
   top of the file, in the same style as the skills' own version headers.
3. **Add a regression test in the `if __name__ == "__main__":` block**
   before merging any formula change:
   - If the source skill's text now contains a new worked numeric example,
     add it as a GOLDEN test (quote the exact source sentence in a comment
     immediately above the test, the way every existing golden test does).
   - If no worked example exists yet, add it under the "FORMULA-ONLY
     IMPLEMENTATIONS" section as a consistency check, and say so explicitly
     in the test label - never label an invented number as golden.
   - Add a negative test for any new refusal path (unknown unit, unknown
     currency, un-footed weights, invalid confidence flag, etc.).
4. **Re-run the self-test** (`python numeric_kernel.py`) and confirm the
   pass/fail summary shows 0 failed before committing. If Python is not on
   PATH in your environment, locate any local interpreter (a venv, a Store
   install, etc.) and invoke it directly by full path rather than skipping
   verification.
5. **Re-vendor into consuming skills.** If a skill's own SKILL.md inlines a
   copy of one of these formulas in prose (most do, and 6+ skills now also
   vendor a verbatim copy of this kernel that they import at runtime), update
   that skill's text to match, or add an explicit pointer to this kernel's
   version stamp, so the prose and the code do not drift apart again. This
   kernel is now vendored as a verbatim copy into those 6+ consuming skills
   and is imported and called by them at runtime (e.g. market-rate-
   benchmarking's Rule 5 calls `weighted_score()` and `percentile_gate()`;
   pro-forma-builder imports `npv` and `escalate`; lilly-contract-review
   calls `verify_line_math()` and `escalate()`), in addition to serving as
   the suite's verification and reference source of truth.
6. **Update the table above** if the change adds, removes, or re-homes a
   function's ownership.

## Known limitations (deliberate refusals, and why)

This kernel is built to **refuse rather than guess** wherever the source
skills themselves draw a hard line. Specifically:

- **`to_hourly` refuses any unit outside hour/day/week/month/year.** The
  source (market-rate-benchmarking's Normalization Rules table) enumerates a
  fixed set of conversions; inventing a divisor for an unlisted unit (e.g.
  "shift" or "sprint") would silently fabricate a rate, which is exactly what
  Rule 1 of that skill forbids ("No benchmark figure may appear without ...
  how it was derived"). Note: the "week" divisor (40 hours) is NOT itself
  quoted in any skill file; it was inferred from the already-sourced
  2,080-hours/year convention and is flagged as a judgment call in the
  module's own comments. Treat it as unverified until a skill text states it
  directly.
- **`convert_currency` refuses any currency code not in the caller's
  `fx_table` (and not USD).** Silently assuming parity or inventing a rate
  would violate the suite-wide rule ("never silently mix currencies... state
  any FX assumption and its date").
- **`percentile_gate` implements only the corrected N>=5 rule, not the
  earlier buggy "N=3" path.** market-rate-benchmarking's own text says the
  old 3-point percentile path is superseded; this kernel does not offer it as
  an option, by design, so a caller cannot accidentally regress to the fixed
  bug.
- **`weighted_score` refuses any weight set that does not sum to 1.0 within
  tolerance**, rather than normalizing/rescaling it automatically. This is
  intentional: both market-rate-benchmarking (1.05 bug) and evaluation-engine
  (percentage-vs-fraction bug) show that a silent auto-correction would mask
  the exact error class this function exists to catch. The caller must fix
  its weights and re-call; the kernel will not "helpfully" renormalize for
  them.
- **`escalate` requires a 1-indexed year >= 1.** There is no "Year 0"
  concept in arithmetic-verification.md's escalation section (unlike
  pro-forma-builder's separate NPV/TCO Year-0 convention, which is a
  different formula for a different purpose - see the module docstring's
  flagged judgment call). Passing 0 or a negative year is refused rather than
  silently returning the base value or a nonsensical negative escalation.
- **`quadrature_rollup` refuses any confidence flag outside
  HIGH/MEDIUM/LOW.** should-cost-builder's confidence framework is a closed
  three-value enum; anything else (a typo, a numeric score) is refused rather
  than coerced.
- **`npv` has no source-verified worked numeric example.** pro-forma-builder
  states the convention and formula precisely but gives no concrete
  cash-flow figures anywhere in its SKILL.md. This kernel implements the
  formula literally and ships only a mathematical consistency check (r=0
  implies NPV=sum(cashflows)) as a substitute, clearly labeled as such in the
  self-test output. Do not treat that consistency check as equivalent to a
  golden test; if pro-forma-builder is ever updated with a worked NPV
  example, port it in as a true golden test per the "How to update" section.
- **`verify_line_math`'s default tolerance (0.01) is an inference, not a
  quoted number.** arithmetic-verification.md states the formula (rate x
  hours = line total) and says to "round to the same precision as the
  document," but never states a numeric tolerance. Callers with a different
  stated document precision should pass their own `tolerance` rather than
  relying on the default.
- **`quadrature_rollup` does not implement should-cost-builder's correlated-
  drivers grouping or the margin/SG&A linear-on-top step.** Both are
  documented in should-cost-builder's Aggregation Method but were out of
  scope for this function's current signature. Calling it on a component set
  that actually contains correlated drivers (e.g. several petrochemical
  materials) will silently treat them as independent and understate the
  range - callers must pre-group correlated components into a single
  combined component (summing their spreads linearly) before calling this
  function, per should-cost-builder's own text, until a grouping-aware
  version is added here.
- **`reciprocity` and `anchor_capture` return a STATE, and return None for the
  number in every case where their source forbids printing one.** These two
  metrics are almost entirely edge cases, and negotiation-simulator's v2.3
  changelog records having to define all of them after the fact (divide-by-zero,
  bare "N:0", the 130%-style capture artifact, zero range, wrong direction).
  Returning None rather than 0.0 is the point: a None cannot be formatted into a
  misleading "0.0", whereas a 0.0 can. Callers must render from `state`.
- **`anchor_capture` caps the displayed capture at 100 but preserves `raw_pct`.**
  The source requires the cap (to prevent "a 130%-style artifact") AND requires
  the overshoot be reported separately, so both are returned. Same for the
  wrong-direction case: display 0, raw negative, because the source forbids
  showing a negative capture as a positive percentage but wants the real value
  in the coaching note.
- **`anchor_capture` refuses non-numeric input rather than coercing it.**
  negotiation-simulator explicitly prohibits fabricating a numeric capture for a
  non-numeric issue such as an audit-scope clause; those carry a qualitative read
  with `state: NON_NUMERIC` instead and must not call this function.
- **`hhi` treats market shares as PERCENTAGES (0-100), not fractions.** That is
  what the source specifies and what puts a monopoly at 10,000 rather than 1.0.
  Using fractions would understate every index by a factor of 10,000 and band
  every portfolio as Low concentration. Pinned by the monopoly test.
- **`pareto_segments` resolves an ambiguity in its own source.** The document
  defines segment A as "top suppliers up to 80% cumulative" but defines Pareto
  Efficiency using "number of suppliers covering 80% of spend". These differ for
  the supplier straddling the line. The kernel counts the straddler, so
  `p80_count` is the smallest N actually reaching 80%. The alternative reading
  reports a p80 that does not reach 80%, which is worse. Flagged rather than
  silently chosen.
- **`pareto_segments` sorts ties by name so ranking is input-order
  independent.** category-strategy's determinism guarantee requires two runs of
  the same data to produce the same supplier order, and Python's sort is stable
  with respect to input order, which is not the same thing.
- **`cagr` and `yoy` refuse a zero or negative base rather than returning a huge
  number.** Growth off a zero base is undefined, not large. Returning a number
  there would manufacture the phantom ">50% CAGR rapid growth vendor" that
  category-strategy's Phase 1.7 anomaly check is meant to surface honestly. A
  vendor with no prior-year spend is new, and the skill should say so.
- **`tail_at_threshold` returns the effort-to-value hours as a RANGE, not a
  midpoint.** The source states 8-12 hours per tail vendor and reports it as a
  range; collapsing it would present a false precision the source declined to
  claim. Contrast the tail COST model, which does state midpoints ($3,500
  management, $200 transaction) and is not implemented here.
- **`difficulty_score` returns None rather than 0 when no positions are
  applicable.** negotiation-playbook-learning's own text says "if applicable ==
  0, difficulty is NEEDS_INPUT". A score of 0 means "every position held", which
  is the easiest possible negotiation; returning it for an unmeasured one would
  invert the finding.
- **`difficulty_score` raises instead of clamping when the score exceeds 100.**
  The source calls the clamp "a defensive guard against rounding". If the clamp
  ever has real work to do, a per-position weight exceeds the stated maximum of
  15, which is precisely the v2.1 scaling-overshoot bug that skill's changelog
  records fixing. Clipping it would restore the bug silently.
- **`difficulty_score`'s bands are evaluated as <=25 Low, <=50 Medium, <=75
  High, else Very high.** The source states them as integer ranges (0-25, 26-50,
  51-75, 76-100), which leaves a non-integer score such as 25.4 undefined
  between Low and Medium. This kernel resolves it downward. Flagged as a
  judgment call, in the same family as the seven pre-existing ambiguities the F1
  coverage matrix surfaced; if the source is ever tightened, follow it.
- **`outcome_partition` raises rather than rescaling when the four rates do not
  sum to 1.0.** The source says a failure means an outcome was miscounted and
  must be recounted. Normalizing the rates to fit would hide exactly the
  miscount the check exists to surface.
- **`level_bid` refuses `one_time=None` rather than defaulting it to zero.**
  Bid Leveling element 5 requires an unpriced cost be carried as a labeled
  placeholder, "never defaulted to zero and never dropped from the comparison".
  A silent zero flatters whichever supplier disclosed least, which is the exact
  distortion the leveling stage exists to remove.
- **`level_bid` refuses a multi-year escalated bid when `first_year_escalated`
  is unstated.** rfp-response-analysis says to call `escalate()` once per
  contract year but never says whether contract year 1 already carries one
  escalation. `escalate()`'s own docstring flags the same ambiguity and notes
  pro-forma-builder resolves it the other way. On a 3-year term at 5 percent
  against a 100,000 annual stack the two readings differ by 15,762.50, which is
  material to a ranking, so the caller states the convention.
- **`level_bid` computes the single-year per-unit figure off the STATED annual
  price, unescalated, even when the multi-year TCO is escalated.** That is what
  SKILL.md:1698 defines (`annual / units`), and it is not a multi-year sum.
  Escalating it would double-count against the TCO figure beside it.
- **`deduction_score` does not choose the deduction, it validates the one it is
  given.** `risk-scoring.md:28` step 4 explicitly reserves the value WITHIN each
  table range to judgment ("editing errors or MSA-alignment restorations take
  the low end; genuine unprotected exposure takes the high end"). Code cannot
  make that call and does not try. What it enforces is the boundary: a
  deduction outside its (severity, coverage status) range refuses, a Hard Stop
  at anything other than -15 refuses, and a total that fails either calibration
  check refuses. The model still rules; the kernel stops it ruling outside the
  table. This is the same narrow-but-never-decide split the redesign applies
  everywhere else.
- **`deduction_score` refuses to evaluate the too-harsh calibration check when
  its third criterion is unknown.** `risk-scoring.md:76-80` states THREE
  criteria, and the third ("findings are primarily MSA-alignment or
  clarification items, not new unprotected exposures") is a judgment. When the
  two mechanical criteria hold and the deduction exceeds 30, the caller must
  pass `alignment_dominant`. Omitting it raises `InvalidInputError` rather than
  defaulting either way, because defaulting True would block legitimate harsh
  scores and defaulting False would silently disable the check. Note that the
  overnight queue's one-line summary of this check named only two criteria; the
  source names three and the source governs.
- **`deduction_score` enforces that a document with no governing documents uses
  the Standalone column for every finding.** `risk-scoring.md:83` says so
  directly, and the three Governed columns describe protection a governing
  document provides, so they cannot apply when there is none. This is an ADDED
  conservatism beyond what the redesign spec asked for, recorded here rather
  than left implicit.
- **`deduction_score` clamps the score at 0 rather than returning a negative
  number. This is a judgment call, not source-specified.** `risk-scoring.md`
  defines a 0-100 scale but never says what happens when deductions exceed 100.
  The clamped value is returned as `score` and the unclamped value is preserved
  as `raw_score` with a `clamped` flag, so the clamp hides nothing. If a source
  skill ever states the intended behavior, follow it and remove this note.
- **`deduction_score` is NOT wired into lilly-contract-review.** It is built and
  tested standalone in this kernel. That skill is under a documented HOLD
  (`PLATFORM-CONSOLIDATION-TRACKER.md:172`), so wiring is a separate, reviewed
  change. Until then this function has no caller in the suite, which is
  deliberate rather than an oversight.
