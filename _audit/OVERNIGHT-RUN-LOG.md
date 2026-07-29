# Overnight run log

**THIS FILE IS THE RESUME POINT.** If the session restarted, crashed, or its context
was compacted, read this file first. It tells you exactly what is done, what is in
flight, and what is next. Trust this file over your own memory of the session.

Queue: `_audit/OVERNIGHT-QUEUE.md`. Do not invent work outside it.

---

## Protocol (follow exactly)

**Before starting any item:**
1. Append a `### O<n> STARTED` block below with the timestamp and what you intend to
   do.
2. Set the matching harness task to `in_progress` via TaskUpdate.

**While working:**
- Evidence with `file:line`. Never assert from memory. If you cannot verify a claim,
  write UNKNOWN and say what would resolve it.
- Do not trust a tracker over the running code. This suite has been bitten by stale
  trackers twice.
- Test before claiming anything works. A self-test that passes is evidence; reading
  the code is not.

**After finishing any item:**
1. Run its verification. Record the actual output, not a summary of it.
2. Commit. The commit hash IS the progress record.
3. Append a `### O<n> DONE` block: commit hash, verification output, what changed,
   what you deliberately did not do.
4. Update the harness task.

**If blocked:** append `### O<n> BLOCKED`, state exactly what blocked you and what
you would need, then MOVE ON to the next item. Do not guess, do not work around it,
do not touch anything in the DO NOT TOUCH list to unblock yourself.

**If an item turns out to be unnecessary or already done:** that is a valid outcome.
Log it as `### O<n> NOT NEEDED` with the evidence. Do not manufacture work to fill
the slot.

---

## Status board

Update this table as you go. It is the fastest way to resume.

| Item | Status | Commit | Notes |
|---|---|---|---|
| O1 coverage matrix output-mode re-audit | **DONE** | `2720f66` `19afc3f` +sweep | 307 rows. 5 at-risk clusters. Part 3 sweep found 4 items with no home = 4th rescue candidate, undecided |
| O2 build `deduction_score()` | **DONE** | `18b955b` | 43/43 self-test. Golden -36/64 exact. Both calibrations raise. NOT wired, per brief |
| O3 C3 Bid Leveling kernel | **DONE** | `32e3cbd` | 54/54. level_bid() built AND wired. Kernel-drift finding for O11 |
| O4 C2 playbook-learning Difficulty Score | **DONE** | `640ce4b` | 63/63. 6 source goldens exact. Kernel vendored (had none) + wired |
| O5-O10 C4,C5,C6,C7,C8,C10 kernel adoption | **DONE** | `f011727` `808bce6` `a84b8fe` `8dee0c8` `4759c17` `b45a9ad` | 96/96. 5 new kernel faces. C10 verdict: WIRE, not retire |
| O11 C9 kernel hash manifest | **DONE** | `24a2a2c` | found 9 stale copies, re-vendored 8, contract-review HELD as the 1 named exception |
| O12-O17 D2-D7 slice contracts | NOT STARTED | | design already approved |
| O18-O22 E1-E5 handoff discipline | NOT STARTED | | E1 is the one real drift bug |
| O23-O26 F4,F5,F6,F8,F9 | NOT STARTED | | |
| O27-O31 audits, read-only | NOT STARTED | | findings only, fix nothing |
| O32-O37 cleanup + A10 + A2 | NOT STARTED | | last, most drift-prone |

## Log

(Append blocks below. Newest at the bottom. Do not rewrite history; if you were
wrong earlier, append a correction rather than editing the original entry.)

### O1 PART DONE, 2026-07-29

Merged the three parts into `_audit/F1-COVERAGE-MATRIX.md`. Commit `2720f66`.

**Verification, actual output not a summary of it.** Every line of all three part files
was checked for presence in the merged file:

```
F1-COVERAGE-MATRIX-PART1-mechanical.md: source_lines=170 missing_from_merge=0
F1-COVERAGE-MATRIX-PART2-judgment.md:   source_lines=280 missing_from_merge=0
F1-COVERAGE-MATRIX-PART3-outputs-rules.md: source_lines=200 missing_from_merge=0
```

Data rows counted from the tables themselves, per source file:

```
Part 1: definition-tracing 15, arithmetic-verification 16, dpa-review 49,
        risk-scoring 9, contract-stack-map 30            = 119  (claims 118)
Part 2: playbook 34, vendor-tactics 19,
        commercial-analysis 23, pharma-requirements 14   =  90  (claims  89)
Part 3: dashboard rescue 23, review-summary-design 23, pass-artifacts 10,
        sme-matrix 15, lilly-templates 5, ai-standard 10,
        the 12 Rules 12                                  =  98  (claims 135)
TOTAL 307, not 342.
```

**What changed:** merged file created with new front matter consolidating the
output-mode hole, the three decided rescues and their corrected destinations, the Rule
12 text edit, the two calibration assertions, the shared-implementation list, and the
seven pre-existing ambiguities. Part 3 coverage marked UNKNOWN rather than complete.

**What I deliberately did not do:** did not add the output-mode column, did not sweep
Part 3's source files, did not renumber or reword a single row. The rows are verbatim.
Nothing under `lilly-contract-review` was written to. `dashboard-canonical.md` untouched.

**O1 is NOT complete.** Remaining: the output-mode column, the row-count reconciliation,
and the Part 3 coverage sweep. See the revised O1 in the queue.

### O1 output-mode audit DONE, 2026-07-29

Added the "Output-mode audit" section to `_audit/F1-COVERAGE-MATRIX.md` (line 254).
Re-verified after the splice that the merge is still lossless: missing_from_merge=0 for
all three part files.

**Evidence base, all read-only from `lilly-contract-review-1c344a/SKILL.md`:**
`:225-248` five modes, Redline only is the DEFAULT; `:1040-1047` mode-to-emission
matrix (Redline only = 5A redline YES, everything else NO); `:1038`/`:1051` the
analytical workflow runs identically regardless of mode, only emission varies;
`:205` Rule 12 names exactly two emission targets for the calculation table and says a
score without a visible table is INVALID; `:1049`/`:720`/`:1742` Stack map only exits
at Step 0.5 and never runs Steps 1-7.

**Result: the check always RUNS in every mode. The question is only whether the RESULT
reaches the user.** Roughly 240 of 307 rows are safe because findings are clause-anchored
and the redline is a clause-anchored instrument. The losses cluster in one place,
judgments about the document as a whole.

**Five at-risk clusters, full detail in the matrix section:**
- A: Protection Score + methodology + Rule 12 table + Rules 7/9. Only surface is the
  Review Summary. Post-retirement, a default-mode run omits the headline number or emits
  one Rule 12 itself calls invalid.
- B: commercial analysis, 20 of 23 rows. Value at Risk and market position never reach a
  redline-only user; only arithmetic ERRORS cross over, via `arithmetic-verification.md:91`.
- C: **most severe.** Completeness gates (playbook 8-item checklist, pharma 11-item
  checklist, benchmark-sources and no-fabrication assertions) are wired to the Review
  Summary / Briefing generator, which never runs in redline-only mode. The gate does not
  fire, nothing looks wrong. Fix is structural: assert at the LEDGER boundary, which is
  built in every mode, not the generator boundary.
- D: two output-format rows with no named redline destination. Cheap fix.
- E: the decided Compliance Evidence Checklist rescue was routed into `contract-stack-map.md`,
  class S5, a mode redline-only users never invoke. Stage 1 placement right, surface wrong.

**Deliberate deviation, stated not hidden:** O1 said "add a column". I did not append a
sixth cell to 307 verbatim provenance rows. Every row is classified by GROUP with each
exception named individually, which is the same coverage without risking the rows. The
deviation and its reason are recorded in the matrix section itself.

**What I deliberately did not do:** wrote nothing to `lilly-contract-review`, made no
correction to any skill file, did not touch `dashboard-canonical.md`. All five clusters
are findings with stated corrections, not applied changes. Applying them means editing a
HELD skill and is NOT SAFE autonomously.

**O1 remaining:** the Part 3 coverage sweep. Part 3's 37-row gap is unsettled, so its
coverage is UNKNOWN and this matrix is still not a passed gate.

### O1 Part 3 coverage sweep DONE, 2026-07-29. O1 COMPLETE.

Settled the 37-row gap. Method: extracted every `file:line` citation in Part 3, built the
covered line set per source file, inspected every uncited span of 5+ lines against source.

```
review-summary-design.md  118/165  71%   gaps 1-6, 8-14, 33-37, 83-87
pass-artifacts.md          99/123  80%   gaps 1-14
sme-matrix.md             119/139  85%   none
lilly-templates.md        147/164  89%   gaps 84-90
ai-standard.md            190/207  91%   gaps 1-8
dashboard-canonical.md    217/353  61%   gaps ... 124-223  <-- the material one
```

**Verdict: BOTH readings were right.** The 135 was a stale estimate, AND real content was
uncovered. `dashboard-canonical.md:124-223` is Panels 2 and 3 (Legal Negotiation,
Commercial Analysis), 100 lines, never walked by Part 3.

Most survives: `pass-artifacts.md:64` already requires pricing decomposition, per-unit
economics, discount architecture, value at risk, assumptions register and benchmarks as
Pass 3 output, with gates at `:73` and `:119`; `:90` carries acceptance rate;
`review-summary-design.md` Section 06 carries negotiation strategy and BATNA.

**FOUR items have no surviving home. Verified by grep across every reference file and
SKILL.md; each appears in dashboard-canonical.md and nowhere else:**
- `:132` Compliance Leverage KPI
- `:132` Difficulty KPI (concept exists in negotiation-playbook-learning, not in this skill)
- `:204` Governance carry-forward recommendations
- `:205` Volume optimization opportunities

`:183` cost waterfall is presentation only, correctly retires. `:198-200` Discount
Architecture survives via pass-artifacts.md:64. `:202-203` renewal pricing protection
survives via commercial-analysis.md:51-57.

**This is a FOURTH RESCUE CANDIDATE and it is NOT DECIDED.** Marc decided obligations and
the Compliance Evidence Checklist. He has not seen these four because Part 3 never
surfaced them. Two are negotiation recommendations, which argues they matter on any run
producing negotiation output. Decision is his, not mine. NOT actioned.

**Cross-cutting catch, worth more than the gap that found it.** `lilly-templates.md:90`:
the US PO Terms & Conditions carry **$25M cyber insurance versus $5M+ in MSAs**, and a
15-day cure versus 30-day. The shared-implementation list named only two insurance
threshold sources (playbook.md:152-160, pharma-requirements.md:114-127). There is a
third, nearly an order of magnitude higher. A shared insurance check that does not know
which paper governs will validate a PO-governed contract against a $5M floor and PASS it.
Failure mode is a silent pass. Same applies to the cure-period threshold. Stage 1 already
identifies the template, so the input is available. Recorded as a required correction.

**What I deliberately did not do:** did not action the four rescue candidates, did not
touch any skill file, wrote only to `_audit/`. Re-verified after both splices that the
merge remains lossless: missing=0 for all three part files.

**O1 is COMPLETE.** The matrix is still NOT a passed gate: four rescue candidates
undecided, five at-risk clusters unapplied, both blocked on a HELD skill. It is now an
accurate map of what is owed, which it was not this morning.

### O2 DONE, 2026-07-29. `deduction_score()` built in the kernel.

Built `deduction_score()` and `score_band()` in
`lilly-procurement-kernels-1c344a/numeric_kernel.py` as a new SCORING face.
Source: `lilly-contract-review-1c344a/references/risk-scoring.md`, read in full.

**Verification, actual output:**

```
SUMMARY: 43/43 passed, 0/43 failed
```

That is the whole module self-test (`python numeric_kernel.py`), 21 new assertions
plus every pre-existing one, no regressions.

**The golden test is the source's own worked example**, Supplier A WO 10,
`risk-scoring.md:52-72`, all 11 rows entered verbatim:
```
total_deduction: -36.0   expected -36   PASS
score:           64      expected 64    PASS
band:            Moderate expected Moderate  PASS
rows:            11 calculation-table rows emitted
```

**Invariants enforced, each raising rather than returning a wrong number:**
- Hard Stop deducts exactly -15 in ALL FOUR coverage columns, never reduced
  (`:17`, `:31`). Tested against all four columns explicitly.
- A deduction outside its (severity, coverage status) range refuses. The named
  failure mode is the Standalone column applied to a category the MSA covers,
  which is exactly the Rule 7 defect.
- **BOTH calibration checks raise**, as the corrected spec requires.
  Too harsh (`:76-81`) and too generous (`:83`). Boundary-tested: exactly 30
  does not fire, because the source says "exceeds".
- Unknown severity, unknown coverage status, positive deduction all refuse.

**Three judgment calls, all disclosed in MAINTENANCE.md rather than left implicit:**
1. The too-harsh check has THREE criteria at `:76-80`, not two. The queue's
   one-line summary named only two. The source governs. The third criterion is a
   judgment, so when the two mechanical criteria hold the caller must supply
   `alignment_dominant`; omitting it RAISES rather than defaulting either way,
   because defaulting True blocks legitimate harsh scores and defaulting False
   silently disables the check.
2. Added conservatism beyond the brief: a document with no governing documents
   must use the Standalone column for every finding (`:83`). The Governed columns
   describe protection a governing document provides, so they cannot apply when
   there is none.
3. Clamping at 0 is NOT source-specified. `risk-scoring.md` defines a 0-100 scale
   but is silent on deductions exceeding 100. Score clamps, `raw_score` keeps the
   unclamped value, `clamped` flag set, so the clamp hides nothing.

**Division of labour, deliberately:** the function does NOT choose the deduction.
`:28` step 4 reserves the value within each range to judgment. Code validates the
boundary; the model still rules. Same narrow-but-never-decide split as everywhere
else in the redesign.

**Malicious-code review of this increment: SAFE.** Evidence, not assertion:
imports are `math`, `dataclasses`, `typing` only. Grep for `os`/`sys`/`subprocess`/
`socket`/`urllib`/`__import__`/`eval(`/`exec(`/`compile(`/`getattr(`/`setattr(`/
`open(`/`pickle`/`marshal`/`base64` returns NONE across the whole file. No I/O, no
network, no dynamic dispatch. Diff is 556 insertions and 2 deletions, and both
deletions are the docstring line and the import line I edited on purpose, so no
existing behavior was altered.

**What I deliberately did not do: NOT wired into lilly-contract-review.** That
skill is HELD (`PLATFORM-CONSOLIDATION-TRACKER.md:172`). The queue says build it
in the kernel only and do NOT wire it, and that is what happened. The function
currently has no caller in the suite, which is deliberate. Recorded in
MAINTENANCE.md so a later reader does not mistake it for dead code.

### O3 DONE, 2026-07-29. Bid Leveling normalization kerneled AND wired.

Built `level_bid()` in the kernel, re-vendored into `rfp-response-analysis-1c344a`,
and wired SKILL.md to require it. Source: `rfp-response-analysis-1c344a/SKILL.md`
:1696-1704, the inlined `references/bid-leveling.md` normalization formulas.

**Why this one mattered.** That skill already routes its Weighted Scoring Matrix
through `weighted_score()`, so the RANKING arithmetic was audited. But the pricing
dimension of that matrix reads the normalized TCO, and the normalization was prose
the model executed by hand. An audited ranking over an unaudited input is not
audited. Its own Rule 6 ("Never rank, score, or recommend on unleveled figures") is
now enforced by code rather than instruction.

**Verification, actual output:**

```
SUMMARY: 54/54 passed, 0/54 failed
```

Kernel source and the re-vendored copy both run clean. The vendored copy's code
body diffs IDENTICAL against the source.

Hand calculations against the three quoted formulas (the source gives no worked
numeric example, so these are labeled hand checks, not source goldens):
```
flat:  annual 120000, units 500, term 3, one_time 45000
       reported_tco 405000        = 120000*3+45000     PASS
       per_unit     240           = 120000/500         PASS
       per_unit_yr  270           = 405000/3/500       PASS
escalated 3yr @5% compounding, year1=base:
       per_year [100000, 105000, 110250]               PASS
```

**Three refusals, each a way a number could misrepresent one supplier against another:**
- `one_time=None` raises. Element 5 says an unpriced cost is a labeled placeholder,
  "never defaulted to zero". A silent zero flatters whichever supplier disclosed
  least, which is the exact distortion leveling exists to remove.
- A multi-year escalator with `first_year_escalated` unstated raises. The source
  says call `escalate()` per contract year but never says whether year 1 already
  carries one escalation, and `escalate()`'s own docstring flags the same ambiguity
  while noting pro-forma-builder resolves it the other way. **Measured: the two
  readings differ by 15,762.50 on a 3-year 5% term against a 100,000 annual stack.**
  That is material to a ranking, so the caller states the convention.
- Zero units or `term_years` < 1 raise. Neither can produce a per-unit basis.

**Wired, not just built** (per the integrate-or-don't-ship rule). SKILL.md:1704 now
carries a HARD RULE with a worked call, the three refusals, and an instruction not
to hand-compute around a raise. Unlike O2, this skill is NOT held, so wiring was in
scope and leaving it unwired would have been false-complete.

**Finding, surfaced by re-vendoring: the shared kernel exists in three variants.**
Hashes across the 11 vendored copies fell into 3 groups. Diffed all of them:
**the code bodies are byte-identical** (`830d8c9f628a` for all 11 with the vendor
header stripped). The only differences are the vendor-date comment on line 1
(2026-07-21 for 7 skills, 2026-07-22 for 4) and a call-manifest comment
scope-sow-architect adds. So the drift is benign TODAY. It is also invisible
without doing this by hand, which is precisely the argument for O11's hash
manifest. Recorded there.

Also note: none of the 11 vendored copies carried `deduction_score()` from O2, and
only rfp-response-analysis has been re-vendored now. That is deliberate. Re-vendoring
to all of them would touch `lilly-contract-review`, which is HELD.

**Housekeeping, disclosed because it makes one diff look bigger than it is.**
`OVERNIGHT-RUN-LOG.md` and `OVERNIGHT-QUEUE.md` were MIXED line endings at HEAD
(149 CRLF / 125 LF in the run log). My earlier Python writes normalized them to
CRLF, producing a whole-file diff. I have normalized both to LF to match the rest
of what this session wrote, so future diffs on these two resume-critical files show
real changes rather than noise. No content was altered by that step.

**Malicious-code review of this increment: SAFE.** Kernel imports remain `math`,
`dataclasses`, `typing` only. Grep for os/sys/subprocess/socket/urllib/`__import__`/
eval/exec/pickle/base64 across the kernel returns 0. Kernel diff is 293 insertions
and ZERO deletions, so nothing existing was altered. The SKILL.md change is prose
plus a fenced example, no executable content.

### O4 DONE, 2026-07-29. playbook-learning Difficulty Score and partition rates kerneled AND wired.

Built `difficulty_score()` and `outcome_partition()` in the kernel, vendored the
kernel into `negotiation-playbook-learning-1c344a` (which had NO kernel at all
before this), and wired both call sites in SKILL.md. Source: that skill's
SKILL.md:574-608 (partition math) and :613-641 (difficulty score).

**Verification, actual output. This one has TRUE goldens**, because the source
published its own worked answers at SKILL.md:641 ("Band verification"):

```
SUMMARY: 63/63 passed, 0/63 failed

lone HARD_STOP_EXCEPTION   100.0  Very high  (leadership flag)   source says 100
lone REJECTED_BY_SUPPLIER   66.7  High                           source says 66.7
lone ESCALATED_TO_LEGAL     53.3  High                           source says 53.3
lone COUNTER_ACCEPTED       53.3  High                           source says 53.3
lone NEGOTIATED_COMPROMISE  33.3  Medium                         source says 33.3
lone LILLY_FALLBACK_USED    20.0  Low                            source says 20
partition sums to 1.0 over denominator 16, NOT_APPLICABLE excluded
strict acceptance 0.4375 is a SUBSET of lilly_prevailed 0.5
```

All six band verifications reproduce to the source's own stated precision.

**The bug this closes.** That skill's v2.1 changelog (SKILL.md:33) records fixing
"difficulty-score scaling (max per-position weight set to 15, scaling_factor =
100/15) so a single HARD_STOP_EXCEPTION can no longer push the 0-100 score past
100" and making "the win/loss outcome partition exhaustive (rates sum to 100%)".
Both halves were prose. Both are now invariants:
- the score raises if it exceeds 100 before clamping, rather than clipping,
  because if the clamp ever has real work to do then a weight exceeds the stated
  maximum, which IS the v2.1 bug returning rather than a rounding artifact;
- the partition raises if the four rates do not foot to 1.0, and does not
  rescale, because the source says a failure means a miscount to be recounted.

**Two design calls, both disclosed in MAINTENANCE.md:**
1. `difficulty_score()` returns None, not 0, when no positions are applicable.
   The source says "if applicable == 0, difficulty is NEEDS_INPUT". A score of 0
   means "every position held", the easiest possible negotiation, so returning 0
   for an unmeasured one would invert the finding.
2. Bands are evaluated as <=25 Low, <=50 Medium, <=75 High, else Very high. The
   source states integer ranges (0-25, 26-50, ...) which leave a score of 25.4
   undefined between Low and Medium. Resolved downward and flagged, same family
   as the seven pre-existing ambiguities in the F1 matrix.

**Wired, not just built.** Both call sites in SKILL.md now carry a HARD RULE with
a worked call and the refusal behavior. This skill is NOT held.

**Kernel-copy consistency maintained deliberately.** Adding the outcome face made
rfp-response-analysis's O3 copy one revision stale, so I re-vendored it in the
same increment. Both consuming copies now diff IDENTICAL against the source and
both run 63/63. A full re-vendor sweep across all non-held consumers is still
owed once the C-tier finishes; that is O11's job and it is where the drift
detection belongs. `lilly-contract-review` is NOT re-vendored, deliberately: HELD.

**Malicious-code review of this increment: SAFE.** Kernel imports unchanged
(`math`, `dataclasses`, `typing`). Grep for os/sys/subprocess/socket/urllib/
`__import__`/eval/exec/pickle/base64 returns 0 across the kernel. Kernel diff is
310 insertions and ZERO deletions. The two SKILL.md changes are prose plus fenced
examples, no executable content.

### O5 DONE, 2026-07-29. C4 supplier-landscape Weighted Scoring Matrix.

Vendored the kernel into `supplier-landscape-1c344a` (it had none, and made no
kernel calls) and wired the 8-pillar Weighted Scoring Matrix at SKILL.md:341-362
to `weighted_score()`.

**No new kernel function was needed.** `weighted_score()` already implements this
exact shape. NOT NEEDED is a valid outcome and manufacturing a landscape-specific
variant would have been the wrong call.

**Verification, actual output:**
```
SUMMARY: 63/63 passed, 0/63 failed     (vendored copy, diffs identical to source)
8 pillars sum to 1.0                   (30+15+15+15+10+5+5+5)
all-8s      -> 8.0
mixed       -> 8.0    hand-checked:  8.0
un-footed weights refuse: OK
```

**Why the wiring matters here specifically.** SKILL.md:345 says "user may
customize" the weights. A customized weight set is exactly where the
market-rate-benchmarking v2.1 defect (weights summing to 1.05) would recur, and
until now nothing checked it. The wired text tells the reader not to renormalize
around a `WeightSumError`, because silently rescaling changes the ranking the
user asked for.

Both of that skill's two distinct scoring systems (the 8-pillar percentage-
weighted matrix and the requirement-count-weighted requirements-fit score) now
route through the kernel. They stay two systems, per the skill's own note; they
are just computed the same way.

**Malicious-code review: SAFE.** Vendored copy diffs identical to the reviewed
source; no new code was written this increment. SKILL.md change is prose plus a
fenced example.

### O6 DONE, 2026-07-29. C5 category-strategy: Pareto, HHI, CAGR, YoY, tail, anomaly.

Built a CONCENTRATION face in the kernel (`hhi`, `hhi_band`, `pareto_segments`,
`cagr`, `yoy`, `tail_at_threshold`), vendored into `category-strategy-1c344a`
(which had none), and wired three sites in `references/analysis-methodology.md`.

**Verification, actual output:**
```
SUMMARY: 78/78 passed, 0/78 failed
GOLDEN hhi(50/30/20) = 3800.0  (source states 3,800 "High")   PASS
monopoly hhi([100])  = 10000                                   PASS
HHI bands exact at 1500 and 2500                               PASS
cagr(100 -> 121, 2y) = 10.0% exactly                           PASS
yoy(88M -> 95M)      = 7.95%  (skill's own example: 8.0)       PASS
tail < $50K: 3 vendors, $80,000, 5.063%, 24-36 hours           PASS
```

The HHI case is a TRUE golden: analysis-methodology.md:153-156 publishes the
arithmetic ("50^2 + 30^2 + 20^2 = 2500 + 900 + 400 = 3,800").

**A real ambiguity found and resolved in the open.** analysis-methodology.md
defines segment A as "top suppliers up to 80% cumulative" (:109) and Pareto
Efficiency as "number of suppliers covering 80% of spend" (:118). Those two
readings disagree about the supplier whose spend straddles the line. I resolved
in favour of the second, so the straddler is counted and `p80_count` is the
smallest N that actually reaches 80%. On a 50/25/25 split that is 3, not 2,
because two suppliers reach only 75%. The alternative reports a p80 that does not
reach 80%, which is worse. Both readings are pinned by tests, and the resolution
is documented in the source file and MAINTENANCE.md rather than chosen quietly.

**Also caught while testing: my own expectation was wrong first, not the code.**
I asserted p80=3 for a 50/30/12/5/2/1 split; the correct answer is 2, because
A+B lands exactly on 80.0 and no third supplier is needed. Recorded because the
boundary case is the whole point of the ambiguity above.

**Three refusals worth naming:**
- `hhi()` refuses an all-zero or empty distribution rather than returning 0,
  which would read as perfect competition.
- `cagr()` and `yoy()` refuse a zero or negative base. Growth off zero is
  undefined, not large. Returning a number would manufacture the phantom ">50%
  CAGR rapid growth vendor" that this skill's own Phase 1.7 anomaly check
  (SKILL.md:367) exists to surface honestly. A vendor with no prior-year spend
  is NEW, and the skill now says so.
- `pareto_segments()` breaks ties by name so ranking is input-order independent.
  The skill's determinism guarantee requires it; a stable sort alone does not.

`tail_at_threshold()` returns the effort-to-value hours as the skill's stated
8-12 hour RANGE rather than a midpoint, because the skill reports a range and
collapsing it would claim precision the source declined to claim.

**Kernel-copy hygiene:** all four consuming copies (rfp-response-analysis,
negotiation-playbook-learning, supplier-landscape, category-strategy) refreshed
to the current source in this increment and all four diff IDENTICAL. Held skill
untouched.

**Malicious-code review: SAFE.** Kernel imports unchanged; grep for os/sys/
subprocess/socket/urllib/`__import__`/eval/exec/pickle/base64 returns 0. Kernel
diff is additive with ZERO deletions. The methodology-file changes are prose.

### O7 DONE, 2026-07-29. C6 negotiation-simulator reciprocity and anchor capture.

Built a NEGOTIATION-METRICS face (`reciprocity`, `anchor_capture`), vendored into
`negotiation-simulator-1c344a` (which had none), wired SKILL.md:464.

**Verification, actual output:**
```
SUMMARY: 86/86 passed, 0/86 failed
GOLDEN reciprocity(3,2) -> index 0.7, UNFAVORABLE   (SKILL.md:468 states both)
reciprocity(0,0) NOT_APPLICABLE / (2,0) POOR / (0,2) STRONG / (2,2) BALANCED
anchor 10->15 target 20        = 50%   CAPTURED
anchor 100->80 target 60       = 50%   CAPTURED   (downward price target)
anchor 10->23 target 20        raw 130% -> displayed 100%, beyond_amount 3
anchor opening==target         NOT_APPLICABLE, no divide-by-zero
anchor 10->5 target 20         display 0%, raw -50% kept for coaching
```

The 130% case is the source's own named defect: SKILL.md:473 says the cap exists
because "This prevents a 130%-style artifact". The test reproduces it exactly.

**Why these two were worth kerneling even though the arithmetic is trivial.**
They are almost entirely edge cases, and that skill's v2.3 changelog (SKILL.md:149)
records having to define every one of them after the fact: divide-by-zero, bare
"N:0", the 130% artifact, zero range, wrong direction, non-numeric. In prose,
each degenerate case depends on the model remembering a rule at the moment it is
writing a debrief. Both functions now return a STATE, and return `None` for the
number in exactly the cases the source forbids printing one. A None cannot be
formatted into a misleading "0.0"; a 0.0 can. That is the whole design.

`anchor_capture()` refuses non-numeric input rather than coercing it, because the
source explicitly prohibits fabricating a numeric capture for a non-numeric issue
such as an audit-scope clause.

Direction is handled by the arithmetic rather than a branch: a downward price
target computes identically to an upward term target because the sign is carried
by (Y - Z). Both are pinned by tests.

**All five consuming kernel copies refreshed and verified identical to source.**

**Malicious-code review: SAFE.** Imports unchanged, no dangerous constructs,
additive only. SKILL.md change is prose plus a fenced example.

### O8 DONE, 2026-07-29. C7 rfp-engine weight-sum check.

Added `assert_weight_sum()` to the kernel, vendored into `rfp-engine-1c344a`
(which had none), wired the Evaluation-weight sanity check at SKILL.md:384.

**Verification: 91/91 passed, 0 failed.** All six consuming copies identical.

**Why a new function rather than `weighted_score()`.** rfp-engine works in
PERCENTAGE points (weights sum to 100), `weighted_score()` enforces the 1.0
fractional convention, and rfp-engine does not score at all at this point in its
workflow. It BUILDS and confirms the grid that evaluation-engine and
rfp-response-analysis later score against. So it needs validation without
scoring, on a different scale. `assert_weight_sum(weights, expected=100.0)`
does that and still serves the 1.0 convention by default. Tolerance defaults to
0.001 x expected, preserving evaluation-engine's stated relative precision on
either scale.

**It refuses rather than normalizes, which is the skill's own rule** (SKILL.md:384,
"surface the discrepancy rather than silently normalizing"). A renormalized set
would differ from the one the evaluation team confirmed, with nothing left to
show it changed, and it would distort every downstream ranking.

**Caught a case a sum check alone would pass:** weights of 110 and -10 foot to
exactly 100. The function rejects the negative weight, because a negative
evaluation weight inverts the criterion rather than de-emphasizing it. Pinned by
test.

**Malicious-code review: SAFE.** Additive only, imports unchanged.

### O9 DONE, 2026-07-29. C8 commercial-negotiation-prep rollup gap.

Added `assert_reconciles()` and `ReconciliationError` to the kernel, re-vendored,
and wired SKILL.md:521.

**Verification: 96/96 passed, 0 failed.** All seven consuming copies identical.

**What the gap actually was.** This skill was NOT missing kernel adoption in
general; it already calls `escalate()`, `percentile_gate()` and `to_hourly()`
under explicit HARD RULEs. The gap is narrower and more interesting: SKILL.md:521
says the year totals, "Year 1 as % of Total" and "Hidden Cost Ratio" "are plain
sums and ratios with no dedicated kernel function; continue to compute those as
directed elsewhere." Being plain sums is exactly why they were left unchecked,
and exactly why they drift.

The dashboard already states the contract at SKILL.md:1665: "NUMBERS RECONCILE:
annualVal(line,'proposed') summed across LINES === meta.proposedAnnual ... A
cloner MUST preserve this." **That was a comment addressed to a human cloner.**
It is now an assertion that raises with the label and the exact difference.

The arithmetic is trivial; the drift is not. A trivial sum carried in two places
is the most common way a deck stops footing between its table and its headline,
and that is the number a supplier sees.

`assert_reconciles()` is deliberately general, because the same shape recurs at
`contract-stack-map.md:222` (coverage_summary counts footing to array lengths)
and in theos-field-guide's pre-render check, which is O25. Default tolerance is
one cent, matching `verify_line_math`. A one-cent shortfall (33.33 x 3 against
100.00) still refuses rather than being absorbed.

**Malicious-code review: SAFE.** Additive only, imports unchanged.

### O10 DONE, 2026-07-29. C10 wire or retire `convert_currency()`. VERDICT: WIRE.

**It is not dead code.** `deal-room-1c344a/SKILL.md:502` already names it as the
sanctioned conversion path ("via the vendored kernel's `convert_currency()` where
a conversion is genuinely needed"). Retiring it was the wrong branch.

**But I found a genuinely unwired site**, and it is the one that matters most:
`category-strategy-1c344a/references/data-quality-rules.md:610-633` carries a full
multi-currency detection and conversion framework, including a four-priority rate
ladder, with NO kernel call. Conversion was prose arithmetic over a spend cube.

That is the largest-N monetary dataset in the suite. A conversion applied
inconsistently across a few thousand rows does not announce itself: it surfaces as
a supplier whose spend looks smaller than it is, which ranks it lower in the
Pareto, which changes its tier. Wired, with the reasoning stated at the call site.

**Also tightened a real hazard next to it.** Detection step 3 says "if all amounts
appear to be in one currency, assume USD unless told otherwise". Fine as a
single-currency-file default, dangerous as a fallback for an unrecognized code
inside a multi-currency file. `convert_currency()` refuses an unknown code rather
than assuming parity, and the wiring text now says those records are quarantined
or the user supplies the rate. A record converted at an invented parity rate is
worse than a quarantined one, because it still counts toward every total.

**Deliberately NOT touched:** `pro-forma-builder-1c344a/SKILL.md:204` documents
that its generator does NOT call `convert_currency()` at workbook-build time, and
gives the reason (every monetary field must already be single-currency before the
Assumptions register runs). That is a documented decision with a stated rationale,
so it stays. Reversing it to "wire everything" would be exactly the shortcut
reversal the standing rules forbid.

No kernel code changed this increment, so no new tests and no malicious-code
surface. 96/96 still passing.

### O11 DONE, 2026-07-29. C9 kernel-copy hash manifest. Tier 2 COMPLETE.

Built `lilly-procurement-kernels-1c344a/kernel_manifest.py` plus the generated
`kernel_manifest.json`, and re-vendored every non-held stale copy.

**Verification, actual output:**
```
python lilly-procurement-kernels-1c344a/kernel_manifest.py
  ... 16 vendored copies found
  [HELD  ] lilly-contract-review-1c344a   (known exception, PLATFORM-CONSOLIDATION-TRACKER.md:172)
  [OK    ] x 15
RESULT: 15 of 16 vendored copies match the source, 1 knowingly held.
        No unexplained drift.
EXIT=0
```

Self-test re-run inside all 8 re-vendored skills: **96/96 in every one.**

**It found real drift on its first run, before I re-vendored: 9 of 16 copies were
still on the pre-O2 kernel.** All nine hashed identically to each other, so the
suite had exactly two kernel versions in circulation, not nine variants. Eight
were non-held and are now current. The ninth is contract-review and stays behind.

**Design decisions worth recording:**
- The hash covers the CODE BODY only, from the module docstring onward. Whole-file
  hashing reports drift on every copy forever, because each carries a vendor-date
  header and a per-skill call manifest. A check that always fails trains its
  reader to ignore it.
- Line endings are normalized before hashing. This suite has already been bitten
  by mixed CRLF/LF in tracked files, earlier in this very session.
- Exit 1 on drift, so it can run as a pre-commit or CI gate rather than be read
  as a report.
- `KNOWN_EXCEPTIONS` carries a reason and an owner per entry, and the script
  reports those as HELD rather than DRIFT so they do not fail the check. The
  docstring says plainly that this list is a liability, not a feature: every
  entry is a skill running older arithmetic than the rest of the suite.

**Re-vendoring preserved each skill's own header verbatim**, including
scope-sow-architect's two-line variant with its call manifest. Nothing was
flattened to a common header.

**`lilly-contract-review` was NOT re-vendored.** It is HELD. It is now the single
recorded exception rather than an invisible one, which is a strictly better state
than before: the divergence is named, reasoned, and will fail the check the moment
someone removes the exception without re-vendoring.

**Malicious-code review of `kernel_manifest.py`: SAFE by inspection.** Imports are
`hashlib`, `json`, `os`, `sys`. It READS files and writes exactly one file
(`kernel_manifest.json`, only under `--write`). No network, no subprocess, no
eval/exec, no deletion, no writes outside the kernel skill directory. `os.listdir`
and `os.path` are used for traversal only.
