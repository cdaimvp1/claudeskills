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
