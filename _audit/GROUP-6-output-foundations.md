# Group 6 Deep Read: Output Generation + Shared Foundations

Skills: executive-summary-package-1c344a, negotiation-playbook-learning-1c344a, theos-field-guide-1c344a,
voice-profile-1c344a, lilly-brand-assets-1c344a. Plus shared kernel lilly-procurement-kernels-1c344a.

All file references are relative to repo root
`C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\`.

---

## executive-summary-package-1c344a

**Q1 in-model arithmetic:** Largely eliminated. The FRAP chain math (ceiling/start-grade lookup) is
delegated to `frap_chain_kernel.py::compute_chain()`; SKILL.md line 459-465 ("Kernel wiring") is explicit:
"Do not hand-recompute the chain in prose and do not hand-roll a second copy of the algorithm - call the
kernel." The only residual in-model numeric step is the self-verification "echo" (SKILL.md:443-451), but
line 464 clarifies the echo text itself is `Decision.reasoning` returned by the kernel, not separately
computed: "use the returned `Decision.reasoning` field directly as the mandatory self-verification
arithmetic echo required above - do not compute a second, separate echo by hand." No residual freehand
arithmetic found.

**Q2 deliverable vs code:** Two files, 2,623 lines total.
- `frap_chain_kernel.py` (741 lines): pure decision function `compute_chain(Facts) -> Decision`. Implements
  ceiling-grade lookup, start-grade lookup (ATC vs ATS), CEO operating/capital band disambiguation, and the
  live-fetch-first/vendored-fallback `table_source` gate (refuses if `table_source` is omitted or claimed
  "live SharePoint" without live tables actually supplied - MAINTENANCE.md:54-58). No I/O of its own.
- `executive_summary_generator.py` (1,882 lines): full document-builder. Defines typed dataclasses
  (`ExecutiveSummaryInput`, `GovernanceInput`, `DataBasis`, etc.), `validate_executive_summary_input()`,
  `compute_ground_truth()` (calls `compute_chain()` for both ATC and ATS), four hard-invariant assertions
  (`_assert_atc_chain_resolved`, `_assert_ats_chain_resolved`, `_assert_approver_names_match_chain_length`,
  `_assert_financial_risk_rating_integrity`), a python-docx `build_document()` that renders all 15
  sections, a post-build `_assert_no_forbidden_content()` scan (em-dash check + Cost-Efficiency
  present-iff-savings-supplied check), and a `--demo` self-test that builds both illustrative registers,
  reopens the DOCX, and asserts 76/76 checks (SKILL.md:514-517).
- Split assessment: this is the right split. Code owns validation, kernel-backed chain computation,
  document assembly, and structural invariants; the model owns narrative composition (background,
  benefits, risks - prose that cannot be templated) which is explicitly out of scope for the generator
  (SKILL.md:520: "It consumes narrative content ... already composed by this skill's own ... workflow
  rather than reading the source contract itself ... only the ATC/ATS chain math is delegated to the
  kernel"). Approval-chain grades are always kernel-computed; approval-chain names are never invented,
  rendered `[To be confirmed]` if missing (SKILL.md:509).

**Q3 runtime cost:** SKILL.md is 13,901 words (largest of the five other than theos-field-guide/
lilly-brand-assets). No slow mechanism beyond the standard live-SharePoint-fetch-then-fallback for the
FRAP table (one fetch attempt per run, SKILL.md:459-465) and the two-file DOCX+MD generation. No
multi-pass research loop.

**Q4 slice contract:** ABSENT. This skill's deliverable is a fixed 15-section prose DOCX/MD (Section Order
1-15, SKILL.md:180-282), not a hub-dashboard tile or slice. It is a leaf/terminal deliverable, not a
composable dashboard panel.

**Q6 best version - concrete improvement:** `convert_currency()` from the shared kernel is referenced only
in prose (pro-forma-builder SKILL.md:204, deal-room SKILL.md:502) and is never actually imported/called in
any `.py` file suite-wide (confirmed by grep across all `.py` files). For executive-summary-package
specifically, multi-currency deals (a Y1 fee in EUR, Y2+ in USD, common in multi-region pharma) get no
kernel-backed conversion path at all today; wiring `convert_currency()` into
`executive_summary_generator.py`'s Financial Summary table build (with the FX rate/date already required
by Rule elsewhere in the suite) would close a real fabrication-risk gap rather than leaving currency math
to the model.

---

## negotiation-playbook-learning-1c344a

**Q1 in-model arithmetic - the flagged check.** This skill has **no Python file at all** (confirmed:
`find negotiation-playbook-learning-1c344a -type f` returns only `SKILL.md`). Every formula is prose-only,
computed by the model at runtime, in a skill whose entire ANALYZE mode is a rate/scoring engine:

- Acceptance rate / win-loss partition (SKILL.md:560-609): a five-bucket partition over an 11-code enum,
  with an explicit reconciliation requirement ("lilly_position_prevailed + supplier_prevailed + negotiated
  + escalated == 1.0", line 608) that the model must verify by re-summing in prose: "Before delivering,
  verify the four partition rates sum to 100% (within rounding); if they do not, you have miscounted an
  outcome and must recount" (line 611). This is a deterministic sum/divide operation described as a manual
  model re-check, not a function call.
- Negotiation Difficulty Score (SKILL.md:613-643): a **weighted sum** - `weighted_sum = sum(count(code) *
  weight)` then `difficulty = (weighted_sum / applicable) * (100/15)` - is exactly the shape of the shared
  kernel's `weighted_score()` function (see lilly-procurement-kernels-1c344a), yet this skill does not
  vendor or call `numeric_kernel.py` at all. The v2.1 changelog (line 33) even documents a scaling-bug fix
  ("Fixed difficulty-score scaling ... so a single HARD_STOP_EXCEPTION can no longer push the 0-100 score
  past 100") of exactly the class the kernel's `weighted_score()` / `WeightSumError` guard exists to catch
  (a mis-normalized weight set silently overshooting 100) - this skill re-derived and separately bug-fixed
  the same failure mode the kernel already solves elsewhere in the suite.
- The dashboard's own "Numbers-reconcile assertion" (dashboard-canonical.md section, SKILL.md:812-819)
  again asks the model to re-verify partition-sums-to-100%, strict-acceptance <= prevailed, and Difficulty
  Score in-band, all in prose, with no code backing.

**Verdict on Q1: this is prose-derived, not code-derived**, and it is the clearest violation of the
suite's own G11 pattern (Kernel-Backed Computation) found in this group. Every sibling skill that computes
a weighted score (evaluation-engine, market-rate-benchmarking, rfp-response-analysis, sole-source-challenge,
deal-room) vendors `numeric_kernel.py` and calls `weighted_score()`; this skill does the same shape of math
by hand.

**Q2 deliverable vs code:** Two JSON artifacts (`negotiation_outcome.json`, `outcome_dataset.json`), one
narrative (`outcome_summary.md`), pattern-analysis text responses, and a 5-panel ANALYZE dashboard (JSX,
with Markdown-table degrade). No builder script exists for any of these; all are hand-assembled by the
model from the prose schema (SKILL.md:451-529 for the outcome schema, 768-850 for the dashboard spec). This
is the group's only skill with a nontrivial numeric engine (rates, partitions, a composite difficulty
score, amendment-trigger thresholds) and zero code backing it, in contrast to every numerically-comparable
sibling in the suite.

**Q3 runtime cost:** SKILL.md is 8,924 words (smallest of the four prose-heavy skills in this group). No
external research/web-search phase; the slow mechanism, if any, is re-scanning the full outcome dataset in
context for every ANALYZE query (no persisted/indexed store - "the outcome dataset" is just a JSON blob the
model reasons over fresh each time).

**Q4 slice contract:** Present, and correctly locked. The 5-panel ANALYZE dashboard is explicitly a bounded,
order-fixed slice (SKILL.md:313-324, dashboard-canonical.md:770-772): "The dashboard structure is LOCKED:
exactly five panels, same order, every run (Rule 8)... Do not add, drop, reorder, or rename panels based on
the query or the segment in hand." Panels: Position Effectiveness Ranking, Acceptance Heatmap, Outcome
Trend, Supplier Difficulty Scores, Playbook Amendment Queue. Graceful Markdown-table degrade specified
(line 324, 808-810).

**Q6 best version - concrete improvement:** Port the acceptance-rate partition, the win/loss reconciliation
check, and the Negotiation Difficulty Score into a vendored `numeric_kernel.py` copy (or a new kernel
function set: `partition_rates()` / `difficulty_score()`), the same way deal-room, evaluation-engine, and
sole-source-challenge already vendor `weighted_score()` for their own composite scores. This single change
would (a) eliminate the exact "weights overshoot 100" bug class the v2.1 changelog already had to patch
once by hand, (b) make the mandatory "numbers-reconcile assertion" a code-enforced invariant instead of a
prose instruction the model can skip under time pressure, and (c) bring this skill in line with G11, which
every numerically-comparable sibling already follows.

---

## theos-field-guide-1c344a

**Q1 in-model arithmetic:** Correctly NOT in-model. This skill ships a real JS engine,
`references/field-guide-engine.html` (2,898 lines), with actual functions doing the numeric/date work:
`ageNum()`, `daysTo()` (line 1951, ISO-date arithmetic for renewal/due countdowns), `money()` (line 1939),
`num()` (defensive parseFloat), and `renderKpis()` (line 1966, the deterministic KPI-strip counts: Open
issues, Action now, Waiting, Meetings ahead, Aged 7d+ - SKILL.md:408 states "No fabrication" for this
strip). The Savings view sums (`committed, achieved, ci, ca, target`) and Report Card GPA are likewise
rendered by the engine from a data object the model only populates, not computes prose-side (SKILL.md:413:
"All sums deterministic"). This is the correct split: the model classifies/clusters/drafts (a
judgment task), the engine's JS sums/dates/sorts (a computation task).

**Q2 deliverable vs code:** Deliverable is a single self-contained HTML artifact
(`theo-field-guide.html`, built by overwriting the `#fgData` JSON island in the shipped engine file) plus
an optional `field_guide_state.json` / Export JSON backup schema. There is no separate Python builder; the
"build" step is the model constructing a JSON object (issues, meetings, comms, savings, reportCard) and
splicing it into an inert `<script type="application/json">` block (SKILL.md:401-403), which the engine's
own JS then renders and persists via `window.storage`. This is a sound alternative to a Python generator
because the artifact itself is the runtime, and the JSON-island-not-code-literal design (line 165, 401-403)
is specifically chosen so "a syntax error inside a `type=\"application/json\"` block is not executed and
cannot break the script" - a real defensive-engineering decision, not an omission.

**Q3 runtime cost:** SKILL.md is 15,952 words plus `references/dashboard-canonical.md` (1,328 words),
the single largest of the five skills. Slow mechanisms: (a) the M365 scan window is 1-2 weeks on first run
(SKILL.md:272, widened from 24h specifically to avoid missing backlog), scanning inbox, sent items,
calendar (7-day forward), and Teams chats every run; (b) a "single structured judgment" LLM call per
surviving item after a deterministic pre-filter (SKILL.md:290-296) - this is a real per-item classification
cost, mitigated by the free deterministic pre-filter (TO/CC + Sent-items cross-check) that short-circuits
most items before any model call.

**Q4 slice contract:** Present. The two-lane board (Issues lane + Meeting Prep lane) plus the Comms lane is
locked as the canonical layout, with `references/dashboard-canonical.md` as its written spec
(SKILL.md:394-396: "CANONICAL DESIGN (authoritative)... You do not rebuild the board; you fill it with
data."). On-demand views (Renewals radar, My Savings, Report Card) are explicitly gated to "offered only
when their data is present" (SKILL.md:412-414), a correctly-scoped slice contract with documented
absent-data behavior rather than fabricated panels.

**Q5 n/a (has code).**

**Q6 best version - concrete improvement:** The `#fgData` KPI strip and Savings/Report Card math are all
"deterministic" per the SKILL.md text, but nothing in the JS (`renderKpis`, the savings bar) validates that
`achieved <= committed` or that category values in Report Card foot to the stated GPA before rendering - i.e.
there is no code-level reconciliation assertion analogous to should-cost-builder's `quadrature_rollup`
"Numbers-reconcile assertion" pattern. Since this skill is populated per-run by the model (not a separate
validated register), a bad model-supplied number (e.g. `achieved > committed`) would render silently. Adding
a lightweight JS assertion pass (mirroring executive-summary-package's `_assert_no_forbidden_content`
pattern) before the engine paints the Savings/Report Card views would close that gap.

---

## voice-profile-1c344a

**Q5: is it correctly prose-only?** CORRECT, but with one caveat. Voice-profile has no Python
(confirmed: only `SKILL.md` in the directory). Its job is BUILD (extract a recipient-segmented writing-style
fingerprint from sent-mail samples), DRAFT (apply that fingerprint plus discipline rules), AUDIT, and UPDATE
- all four are language-judgment tasks (does this phrasing sound like the user, does this draft match a
register) that cannot be reduced to arithmetic or a deterministic schema check. The output artifact
(`voice_profile.json`) is a data record, not a computed number. This is correctly a reference/judgment
skill, not a computation skill: no Q1 gap exists because there is no numeric work being asked of the model
that Python should own instead. The one soft counterpoint: the "sentence-length distribution: median +
range" (SKILL.md:253) is a numeric extraction step that a small script (word-count per message, then
median/range) could compute more reliably than an LLM eyeballing raw email text, but this is a minor,
low-stakes descriptive statistic feeding a style note, not a decision-grade number, so it does not rise to
a genuine gap.

**Q2 deliverable vs code:** `voice_profile.json` (BUILD/UPDATE), a draft (DRAFT), an audit report (AUDIT).
No builder script for any of the three; all are hand-assembled by the model, which is appropriate given the
content is prose/JSON-of-prose-patterns, not a templated financial or governance document.

**Q3 runtime cost:** SKILL.md is 6,043 words, the smallest of the five - reflects the narrow four-mode
scope. No web research phase. The one potentially slow step is BUILD-mode extraction over a 50-200 message
sent-mail sample (SKILL.md:172-173) if pulled live via the M365 connector, but this is bounded and one-time
per refresh (Rule 2, line 407).

**Q4 slice contract:** ABSENT. Voice-profile has no dashboard; SKILL.md's own troubleshooting block says so
explicitly (line 29): "This skill is chat-and-file only: it produces a JSON profile and text drafts. It has
no dashboard, no React artifact, and no share button." Its deliverables are consumed as inputs by other
skills' drafting steps (executive-summary-package, rfp-engine, negotiation-prep - line 393-401), never
rendered as a hub tile itself.

**Q6 best version - concrete improvement:** The hashtag-emission opt-in gate (v1.2 changelog, SKILL.md:136,
353-357) is well-designed (defaults OFF for external/legal recipients, visible-not-hidden metadata,
never smuggled via zero-width/HTML-comment tricks - line 357). The single highest-value improvement would
be a lightweight AUDIT-mode regression check: run the BUILD-mode auto-detected tells (em-dash usage, Oxford
comma, etc., SKILL.md:467-472) as a small deterministic post-DRAFT scan (not a model judgment) to confirm
the discipline layer's hard rules (no em dash, word cap) actually held in the emitted draft, rather than
relying on the model itself to have obeyed its own instruction - this is the same class of
"HARD RULE enforced as code-level check, not just workflow instruction" pattern executive-summary-package
already uses (`_assert_no_forbidden_content` for its own em-dash scan).

---

## lilly-brand-assets-1c344a

**Q5: is it correctly prose-only?** CORRECT for the great majority of its content (logos, color palette,
house styles, dashboard component library, DOCX design system, execution guardrails, user manual) - these
are genuinely reference/style material, not computation. However, one inlined reference is a clear
**GAP**: `references/risk-scoring.md` (inlined at SKILL.md:1133-1186), the "Protection Score" method used
by lilly-contract-review, is pure prose-specified arithmetic with no code backing anywhere in the suite:

> "total_deductions = sum(per-finding deductions); protection_score = max(0, 100 - total_deductions)"
> (SKILL.md:1163-1166)

This is structurally identical to what `numeric_kernel.py`'s `weighted_score()` / `quadrature_rollup()`
already do for other skills (sum a set of per-item numbers, clamp/bound the result, refuse or flag
malformed input) - a weighted-deduction-sum-and-clamp is exactly kernel-shaped work, yet
`lilly-procurement-kernels-1c344a/MAINTENANCE.md`'s own "Not yet covered by this kernel" list (line 24-30)
does not even mention it, and no vendored kernel copy exposes a `protection_score()` function. The model is
asked to sum a deduction table and clamp it by hand, then "show this calculation table in the output" as
the only verification (SKILL.md:1179) - there is no code-level "numbers-reconcile assertion" comparable to
should-cost-builder's or the negotiation-playbook difficulty score's stated (but unenforced) check.

**Q1/Q2/Q3/Q4 n/a** in the assigned-skill sense: lilly-brand-assets is the shared foundation, not a
task-executing skill; it emits no deliverable of its own except the on-demand branded user-manual `.docx`
(SKILL.md:91-101), which is itself a builder-less, hand-assembled document (no Python).

**Q6 best version - concrete improvement:** Add a `protection_score()` function to
`lilly-procurement-kernels-1c344a/numeric_kernel.py` (sum deductions, clamp `max(0, 100 - total)`, refuse if
any deduction is outside its severity/coverage-cell's stated range) and vendor it into
`lilly-contract-review-1c344a` alongside the `verify_line_math()` / `escalate()` copies it already carries.
This is the single most concrete, scoped, low-risk fix identified across this whole group.

---

## lilly-procurement-kernels-1c344a (shared kernel)

### Functions exposed by `numeric_kernel.py`

| Function | One-line purpose |
|---|---|
| `to_hourly(value, unit)` | Convert hour/day/week/month/year rate to hourly; refuses unknown units. |
| `convert_currency(value, currency, fx_table)` | Convert a currency to USD via a caller-supplied FX table; refuses unknown codes. |
| `percentile_gate(n_points, min_points=5)` | Gate whether a percentile band (P10-P90) may be reported (N>=5 rule). |
| `verify_line_math(rate, hours, stated_total, tolerance=0.01)` | Check rate x hours == stated line total within tolerance. |
| `escalate(base, rate, year, compounding)` | Apply compounding or simple escalation for a 1-indexed year. |
| `weighted_score(scores, weights, tolerance=0.001)` | Weighted sum of scores; refuses if weights don't foot to 1.0. |
| `npv(cashflows, discount_rate)` | Net present value, Year-0 undiscounted + end-of-year Year-1+ discounting. |
| `quadrature_rollup(bases, spreads_low, spreads_high, confidence_flags)` | Root-sum-of-squares cost rollup with >15%-of-base LOW-confidence widening. |

All eight are exercised by the module's own `if __name__ == "__main__":` self-test (golden tests traced to
quoted source sentences, formula-only consistency checks explicitly labeled as such, and negative/refusal
tests) - `numeric_kernel.py:392-651`.

### Widely used vs never called

Confirmed by grepping every vendored copy's owning skill for actual call sites (not just prose mentions):

- **Widely used, wired into real code paths:** `escalate()` (commercial-negotiation-prep, deal-room,
  lilly-contract-review, invoice-rate-card-auditor, pro-forma-builder's `pro_forma_generator.py`,
  rfp-response-analysis), `weighted_score()` (deal-room, `evaluation_report_generator.py`,
  market-rate-benchmarking's `market_rate_generator.py`, `rfp_analysis_report_generator.py`,
  `sole_source_generator.py`), `npv()` (deal-room, `pro_forma_generator.py`), `percentile_gate()`
  (market-rate-benchmarking), `to_hourly()` (market-rate-benchmarking, commercial-negotiation-prep),
  `verify_line_math()` (lilly-contract-review, invoice-rate-card-auditor), `quadrature_rollup()`
  (`should_cost_generator.py`).
- **Never called anywhere:** `convert_currency()`. Grepped every `.py` file suite-wide
  (`grep -rln "convert_currency" --include="*.py"` returns only `numeric_kernel.py` itself, in all 12
  copies). It is mentioned only in prose, twice, as an available-if-needed function (deal-room SKILL.md:502,
  pro-forma-builder SKILL.md:204, the latter explicitly noting its own generator "does not itself call the
  kernel's `convert_currency()` at workbook-build time"). This is a shipped, tested, self-contained function
  with zero real call sites in the suite.

### Vendoring pattern verdict

**Verdict: the verbatim-vendoring pattern is the correct approach for Claude Desktop distribution, and it
is well-executed here.** Each of the 12 skills that needs the kernel must install independently and run
standalone (a Claude Desktop skill has no cross-package import mechanism at runtime), so a single shared
importable module is not an option; vendoring a verbatim copy into each skill's own directory
(`lilly-procurement-kernels-1c344a/MAINTENANCE.md:87-97`) is the only way to get real, executable,
self-contained code into 11 independently-installable skills. The design compensates for vendoring's usual
drift risk with real discipline: (a) a single documented source of truth
(`lilly-procurement-kernels-1c344a`) with an explicit "re-vendor into consuming skills" step in its own
maintenance procedure (MAINTENANCE.md:87-97), (b) every function's docstring traces to an exact quoted
sentence in the owning skill's SKILL.md, so drift between the prose rule and the vendored code is
detectable by diffing quotes, and (c) hard-refusal behavior (`WeightSumError`, `UnknownUnitError`, etc.)
that fails loudly rather than silently diverging if a copy goes stale. The residual risk is exactly what
MAINTENANCE.md documents: nothing currently verifies that all 11 vendored copies are byte-identical to the
source (no build script, no checksum manifest) - a future update to the source `numeric_kernel.py` could
silently fail to propagate to one or more of the 11 copies, and nothing in the suite would catch that.

### Missing kernel functions the suite keeps re-deriving in prose (highest-leverage finding)

Two clear candidates, both structurally identical to functions the kernel already has:

1. **Protection Score (lilly-contract-review, via `lilly-brand-assets-1c344a/references/risk-scoring.md`,
   SKILL.md:1163-1166):** `total_deductions = sum(deductions); score = max(0, 100 - total_deductions)`. This
   is a sum-and-clamp over a list of per-finding numbers with a citation-gated deduction table - the same
   shape of work `weighted_score()` and `quadrature_rollup()` already do, but implemented nowhere in code.
   A `protection_score(deductions: List[float]) -> float` (clamped 0-100, refusing an out-of-range single
   deduction) would be a two-line kernel addition with an immediate, real consumer.

2. **Negotiation Difficulty Score (negotiation-playbook-learning, SKILL.md:613-643):** a weighted sum of
   11 outcome-code counts, scaled by `100/15`, is the exact `weighted_score()` shape (a fixed weight per
   category, summed, then normalized to a 0-100 band) but is hand-rederived in prose with its own
   from-scratch scaling-bug history (v2.1 changelog, line 33) that `weighted_score()`'s `WeightSumError`
   guard would have caught by construction had this skill used the kernel.

Of the two, **#2 (negotiation-playbook-learning's difficulty score) is the higher-leverage fix**: it is the
only skill in the entire 12-skill kernel-consuming set that does real weighted-scoring arithmetic with zero
kernel involvement, it already had one production bug in exactly the failure class the kernel exists to
prevent, and its ANALYZE dashboard's own "Numbers-reconcile assertion" (SKILL.md:812-819) is currently an
unenforced prose instruction rather than a code-checked invariant.
