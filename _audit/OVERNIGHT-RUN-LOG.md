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
| O12-O17 D2-D7 slice contracts | **D4 DONE, REST BLOCKED** | `c117406` | queue mis-sorted: D1 is [Marc, after D0-D2] + needs A11/B4; D2/D3/D5/D6/D7 chain off it. D2 (no-green) not done |
| O18-O22 E1-E5 handoff discipline | **E1, E2 DONE** | `fdf88ec` `7f0376e` | E1 drift went BOTH ways, handoff's description was wrong. E3-E5 remain |
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

### F2 VERIFIED COMPLETE, 2026-07-29. My earlier "1 reopen remaining" was a misread.

Marc asked me to finish F2's last reopen. There isn't one. Correcting my own status
report rather than inventing work to match it.

**What "2 of 3" actually meant.** Commit `d5f3c46` says "2 of 3 whole-document reopens
eliminated". `_audit/F2-IMPLEMENTATION.md:10-24` classifies all three passes: Pass 1 was
a document CREATE ("Save the document"), Passes 2 and 3 were REOPENS ("Open the saved
document and append"). All three assembly cycles were removed; only two of them were
literally reopens. The same file states the outcome plainly at :61-64: "What was
removed: 3 document open/append/save cycles, replaced by 1 generator call."

**Verified now, not taken on trust:**
```
grep -c "Open the saved document|Save the document"  rfp-response-analysis SKILL.md  ->  0
python rfp_analysis_report_generator.py            ->  SUMMARY: 52/52 passed, 0 failed
```
`SKILL.md:550` now reads "No document is created or opened" for Pass 1, and :556 "There
is no Pass 4 'open and append' step". The three content-authoring passes survive intact,
which was the accuracy requirement.

**F2's dependency is also now satisfied.** `UPGRADE-PLAN.md` lists F2 as "Depends on: C3".
C3 landed tonight as O3. So F2 is complete AND unblocked in the plan's own terms.

### The real remainder, scoped rather than faked: supplier-landscape's DOCX passes

`d5f3c46` deferred one thing by name: "supplier-landscape's analogous three DOCX passes,
because its generator does not yet cover the full document." That is still true and I am
NOT closing it silently.

`supplier-landscape-1c344a/SKILL.md:626-631` carries the identical pattern:
```
1. Pass 1: Title page, executive summary, market context, first 3 supplier profiles. Save.
2. Pass 2: Open saved document, append remaining supplier profiles. Save.
3. Pass 3: Open saved document, append cross-vendor comparison, ... Save.
```

**Why I did NOT fix it the way F2 was fixed.** F2 worked because
`rfp_analysis_report_generator.py` already existed (2,935 lines, kernel-backed ground
truth, already wired). supplier-landscape's `dashboard/build_dashboard.py` builds the
DASHBOARD, not the DOCX. There is no DOCX generator to call.

Collapsing the three passes without one would replace three appends with a single
oversized write, which is exactly the truncation failure `SKILL.md:19` (guardrail G10)
warns about. That trades a transcription risk for a truncation risk and is a
degradation, not a fix. Under the priority order, a redesign that cannot hold accuracy
does not ship.

**Correct scoping: this is a BUILD, and it belongs to F9** (generator coverage sweep for
every remaining model-assembled deliverable), queued as O26. Recorded there as a named,
sized item rather than left as a footnote in a commit message. It is not small: the
comparable generator is ~2,900 lines.

### Tier 3 CORRECTION: the queue mis-sorted WS D. O12/O13/O15/O16/O17 are BLOCKED.

The queue said "Tier 3: slice contracts (design already approved). The field-ownership
table is approved at `MASTER-REMAINING-WORK.md:320`. This is authoring an approved design
into SKILL.md text, not designing." The field CONTENT is approved. The ITEMS are not
unblocked, and the queue did not check the dependency chain.

Evidence, from `_audit/UPGRADE-PLAN.md` itself:
```
D1  Marc decision: tagged [Marc, after D0-D2] ... Depends on: A11, B4
D2  Depends on: D1          D3  Depends on: D1          D5  Depends on: D1
D6  Depends on: D5          D7  Depends on: D1-D3
D4  Marc decision: no.      Depends on: A1
```
And `MASTER-REMAINING-WORK.md:320` tags the slice-contract line `[Marc, after D0-D2]`,
"sequenced after dashboards per Marc".

Gate status checked, not assumed:
- **D0 CLOSED.** `deal-tab-1c344a/` exists with SKILL.md and dashboard.
- **D2 NOT DONE.** `lilly-brand-assets-1c344a/SKILL.md:250-253` still declares "NO GREEN"
  as the single source of truth. That item is `[Marc]`-tagged with ~26-skill blast radius.
- **A11 NOT DONE** (lock the hubs, Marc sign-off), and D1 depends on it too.

So D1 is doubly blocked, and D2/D3/D5/D6/D7 all chain off D1. **STOPPED AND LOGGED rather
than proceeding.** Authoring them anyway would have been exactly the shortcut reversal the
standing rules forbid: a tracker I wrote asserting "approved" over a source document that
says "Marc".

**D4 is the one WS D item that is genuinely clear**: "Marc decision: no", and its only
dependency A1 (rfx-hub) closed in `ef270b5`. Done below.

### O14 DONE, 2026-07-29. D4 RFx slice contracts into the four feeders.

Authored "RFx-hub contribution, output slice" into `rfp-engine`, `rfp-case-manager`,
`rfp-response-analysis` and `evaluation-engine`, and rewrote the matching table in
`rfx-hub` so the contract is two-sided and checkable from either end.

**Verification, mechanical, actual output:**
```
shipped RFX top-level keys: 19
keys with no owner named in the hub contract: NONE
  rfp-engine-1c344a                OK
  rfp-case-manager-1c344a          OK
  rfp-response-analysis-1c344a     OK
  evaluation-engine-1c344a         OK
BOTH SIDES AGREE
```

**The finding that made this worth doing properly.** The hub's pre-existing slice table
named 5 fields. The object it actually renders (`dashboard/assets/seed/project-view.js`,
`projectView.domain.rfx`) has **19 top-level keys**. So 14 fields had NO owner, which is
precisely the condition D4's own verify criterion says must fail the build rather than
render as a gap. The contract could not have caught the defect it exists to catch.

All 19 are now assigned. The 14 beyond the spec are marked in a SEPARATE COLUMN as
inferred from the seed rather than approved design, with the reasoning stated per
assignment (`scale` to rfp-engine because that skill already mandates the canonical 0-5
band set at its SKILL.md:384; event metadata to rfp-case-manager as state owner;
`modelDecision`, which is award-scenario re-weighting, to evaluation-engine because
scenario re-weighting is sensitivity analysis and belongs to the official scorer; `me` is
hub-local viewer identity and not event data at all). **Marc should confirm the inferred
column.** Defensible is not the same as confirmed, and the file says so.

**Bound to what ships, not to what is planned.** `RFx-REDESIGN-SPEC.md` section D describes
a richer object (`scores.aiFirstPass`, `coverage`, `commercial`, `participation`,
`keyDates`, `caseHealth`, `ranking`, `sensitivity`, `dispersion`, `calibration`,
`auditTrail`, `readiness`). The hub does not ship that object. Writing the contract against
the spec would have produced a contract the hub cannot honour, so each feeder carries a
"Forward note" recording the spec's superset and saying to EXTEND the table when the object
grows, never replace it. Standing rule: do not trust a tracker over the running code.

**The proposed-versus-official labelling is carried as an accuracy mechanism, not
presentation**, in all three relevant files: rfp-response-analysis is **proposed**,
evaluation-engine is **official**, and if the hub cannot render the distinction it does not
render the scores. An AI first pass read as a panel decision is the specific failure it
prevents. Where the two disagree, that is surfaced as a finding for a human, never
reconciled arithmetically in the hub.

Each feeder's section also states `sourceRef` per field, that an uncited field is a build
failure rather than a gap, and that the skill keeps every standalone deliverable it already
produces (never-regress).

**No code changed. Malicious-code review: not applicable by scope, prose only.**

### O18 DONE, 2026-07-29. E1 case-handoff-schema. The drift went BOTH ways.

**The handoff's characterization was wrong, and acting on it would have destroyed
content.** It said "rfp-case-manager's copy is correct and calls rfp-engine's superseded.
Fix rfp-engine's to match." Diffing the two JSON blocks first showed the drift was
bidirectional:

```
rfp-engine AHEAD:        artifact type enum carries "Addendum | QA_Log"; mirror lacked both
rfp-case-manager AHEAD:  delivery_method carries the message_compose graceful-degradation
                         wording; source had the older "not a file artifact" phrasing
mirror's NOTE stale:     it asserts rfp-engine "still describes legacy provisioning actions
                         on receipt". rfp-engine's file already states the no-provisioning
                         behaviour, so the note described a defect that had been fixed
```

Copying case-manager over rfp-engine, as instructed, would have silently dropped
`Addendum` and `QA_Log` from the artifact enum.

**Source of truth named: `rfp-engine-1c344a/references/case-handoff-schema.md`.** rfp-engine
PRODUCES the payload and rfp-case-manager CONSUMES it, so the producer owns the schema.
That is the general rule worth carrying into E2, not a coin toss.

**Verification, actual output:**
```
post-fix schema diff: IDENTICAL, 0 differences
Addendum/QA_Log present in mirror: True
degradation wording present in source: True
stale 'still describes legacy provisioning' claim removed: True
```

The source now carries a do-not-hand-edit header stating the mirror relationship, what a
schema change requires (edit source, re-copy mirror, same commit, say so in the message),
and a dated record of the reconciliation. The mirror says plainly that it is a copy and not
a second authority.

Kept deliberately: the v2.0 no-provisioning behaviour in the mirror. That is rfp-case-
manager's OWN decision about what it does on receipt, not a property of the schema, so it
belongs there. Reworded to note the source agrees rather than to claim it disagrees.

### O19 DONE, 2026-07-29. E2 source-of-truth discipline across shared schemas.

Surveyed every cross-skill handoff payload and applied the E1 discipline. Three exist:

| Payload | Producer | Consumer | Owner | State after this pass |
|---|---|---|---|---|
| `case_handoff.json` | rfp-engine | rfp-case-manager | **producer** | Fixed in E1. Source header + synced mirror + one pointer in `artifact-schemas.md:283` that was already correct |
| `landscape_handoff.json` | supplier-landscape | rfp-engine | **consumer** | Header added to the source; the inlined fallback in supplier-landscape:1046 now labelled a fallback copy |
| `evaluation_engine_handoff.json` | rfp-response-analysis | evaluation-engine | not yet declared | **Left for E3 (O20)**, which is specifically about formalizing this one |

**The finding worth Marc's attention: the suite uses BOTH ownership conventions.**

`case_handoff.json` is producer-owned. `landscape_handoff.json` is consumer-owned, and
that is not an accident: `supplier-landscape-1c344a/SKILL.md:310` and `:322` already state
it explicitly ("that schema lives in the rfp-engine skill, which is the consumer of this
handoff"). Both have a coherent rationale. Producer-owns says the party that writes the
payload defines it. Consumer-owns says the party that BREAKS when the shape is wrong
defines what it can ingest.

I did NOT force them into one convention. Flipping either would reverse a documented
decision to make a rule tidy, and the consumer-owns case is stated in two places in a
shipped skill. What was actually wrong is that a reader had no way to tell which applied
to a given schema. So each source file now DECLARES its owner and the reasoning in a
header, and each mirror or fallback declares that it is a copy.

If Marc wants one convention suite-wide, that is a real decision with a real blast radius
and it should be made deliberately, not as a side effect of tidying. Flagged, not taken.

**Third-copy check:** `rfp-engine-1c344a/references/artifact-schemas.md:283` references
`case_handoff.json` but correctly says "See `case-handoff-schema.md` for full schema"
rather than restating it. That is already the right pattern and was left alone. A pointer
cannot drift; a copy can.

**No code changed. Prose and headers only.**

### GOLDEN FIXTURE BUILT, 2026-07-29. Marc's decision: synthetic.

`_audit/golden-fixture/`. Six synthetic documents, an answer key, and a machine-readable
expectation file. Does not touch `lilly-contract-review`, which is held.

**Why it went first, ahead of the rest of the queue.** The coverage matrix has ~200 rows
whose verification column reads "golden-fixture test: finding present in both runs", and
there was no fixture. Every one of those rows was a promise with no instrument. F1 cannot
be shown to have preserved anything without it.

**The package.** MSA (Lilly paper, MPT 5.0 shape) plus Exhibit A definitions, Exhibit B
SLA and rate card, Exhibit C AI Standard extract, and the SPS. The Work Order is the
document under review and carries the defects. The governing family genuinely COVERS most
categories, deliberately, so the fixture tests Rules 7 and 9 (combined protection) rather
than defect detection alone: several WO defects must score in the Governed: Covered column,
not Standalone.

**Verification, actual output:**
```
JSON parses OK
planted defects present in WO: 33/33
negative controls genuinely absent from WO: 5/5
AE absent from WO: True        AE present in MSA: True
Usage Data human-authored exclusion in Exhibit A: True
```
Arithmetic independently recomputed before the answer key was written: line sum 645,400,
corrected total 680,400, stated total 685,000 (+5,100), NTE 675,000 exceeded either way.

**Coverage: 5 Hard Stops, 8 arithmetic defects, 9 playbook positions, 6 data-protection
defects, 5 vendor tactics, 1 missing incorporated document, 1 compliance-evidence gap, and
8 NEGATIVE CONTROLS.**

**The negative controls are half the point.** A fixture that only plants defects cannot
detect over-flagging, and Rule 5 (do not flag what the governing docs already resolve) is
the most commonly violated rule in this skill. Eight categories the WO is silent on are
already covered by the MSA or SPS and must produce NO finding.

**Two rows carry most of the signal:**

1. **The absence-detection case.** The WO has no adverse event clause at all. The correct
   answer is a LOW finding in the Governed: Covered column, because MSA:23 covers it.
   Three distinct bugs give three distinct wrong answers: silence means absence detection
   is broken, a Hard Stop means the governing document was never read (the Rule 9 defect,
   and it inflates the Hard Stop count to six), and a Standalone-column score means the
   wrong coverage status reached `deduction_score()`. **This is also the exact case that
   would break under content-keyed playbook retrieval**, since AE appears nowhere in the
   WO and would never trigger its own rule. The retrieval-indexing change cannot ship
   without passing this row.

2. **D-6, the definition-tracing failure.** The WO classifies free-text notes written by
   Lilly staff as Usage Data; Exhibit A:4 expressly excludes human-authored content from
   that definition. No keyword match finds it. It is the mechanism behind the two findings
   either side of it, and a run that catches those but misses this has found the symptom
   and not the cause.

**Aggregate assertions for fast checking:** exactly 5 Hard Stops, HS-4 NOT among them, AE
present at LOW/Covered, at least 8 arithmetic findings including the one favouring Lilly,
zero false positives, Protection Score in the Critical band (five Hard Stops deduct 75
before anything else counts), Rule 12 calculation table present.

**Stated limits, in the README rather than left implied:** it proves the planted checks
still fire; it does not prove checks nobody thought to plant still fire. Regression net,
not completeness proof. Completeness is argued by the coverage matrix; this stops that
argument decaying on every edit.

**Maintenance rule recorded:** if a change makes a row fail, the presumption is the change
is wrong, and overriding that requires saying so explicitly in the commit with a reason.
Same discipline as the kernel's KNOWN_EXCEPTIONS, and for the same reason.

### O20 DONE, 2026-07-29. E3 evaluation-engine outbound handoff formalized.

Authored `evaluation_engine_award_handoff.json` into `evaluation-engine-1c344a/SKILL.md`,
fixed the matching vagueness at `routing-and-chains.md:75`, and added the consumer contract
to `commercial-negotiation-prep`.

**What was wrong.** This skill's INBOUND handoff discipline is fully specified. Its
outbound named only "contract negotiation chain" with no payload, and the routing reference
repeated the same phrase in quotes. So the official award decision left this skill as prose.
That is the family's one asymmetry and the plan called it correctly.

**What the schema carries:** event context and which scoring mode ran, the award itself
(single/split/no-award, allocation, conditions, rationale), the `scoring_grid` block verbatim
plus weights, scale and the sensitivity verdict, a `negotiation_inputs` block (commercial
figures, must-have gaps, open clarifications, leverage notes) and a `provenance` block
carrying citations through.

**Three design points worth recording:**

1. **`"authority": "official"` is a required field.** It is what stops a consumer blending
   this skill's official figures with rfp-response-analysis's **proposed** ones. The same
   distinction I carried into the D4 slice contracts, now enforced at the payload boundary
   as well as the dashboard boundary.
2. **`provenance.citations` must be non-empty or the payload is rejected.** The skill
   already mandates citation flow-through internally (`SKILL.md:1296`); this makes it a
   validation rule at the boundary rather than an internal habit. An award handoff with no
   citations cannot support a negotiation, because every downstream figure would be
   unattributable.
3. **Producer-owns, and the file says why.** Unlike `landscape_handoff.json` this payload
   has TWO named consumers. A consumer-owned schema with two consumers has two authorities,
   which is exactly how the two copies of `case_handoff.json` drifted in both directions at
   once. That reasoning is written into the section rather than left as convention.

**The no-auto-advance rule is preserved explicitly.** `SKILL.md:1322` records that
decision-deck was retired leaving no auto-advance target. Formalizing the handoff does not
create one: emit the payload, name the consuming skill, stop.

**Consumer side:** `commercial-negotiation-prep` now declares what it reads and two rules on
receipt (do not re-score or re-rank; never blend official with proposed), plus that the
handoff is an enrichment and its absence is not a gap to state.

**`lilly-contract-review` is the second named consumer and was NOT edited.** It is HELD.
Its side of this contract is owed when the hold lifts, and is recorded here so it is not
mistaken for done.

### Task #1 PART DONE, 2026-07-29. Fixture harness built. Baseline BLOCKED, and why.

**I cannot produce a valid baseline and did not fake one.** I authored `ANSWER-KEY.md` an
hour before starting this task. Any finding I "detect" in the fixture is recall, not
detection, and a baseline built that way reports green while proving nothing. That is worse
than having no baseline, because it would be trusted.

So I built the uncontaminated half: the harness that makes the run mechanical when someone
who has NOT read the answer key performs it.

**Delivered:**
- `check_run.py`, a stdlib-only checker: takes a run file, diffs against
  `expected-findings.json`, verdicts pass/fail, exit 1 on failure.
- `RUN-PROTOCOL.md`, including the contamination rule stated as a hard requirement.
- `runs/EXAMPLE-degraded-redline-only.json`, a hand-authored illustration, clearly labelled
  as not a real run.

**Verification, actual output:**
```
python check_run.py --selftest      ->  SELF-TEST: 11/11 passed   EXIT=0
```
The checker is tested before it is trusted, because a checker that passes everything is
worse than no checker. The 11 cases cover a perfect run, a missing Hard Stop, all three
absence-detection failure modes separately, a false positive on a negative control, a
negative control named in `extra`, a dropped direction-agnostic arithmetic finding, a
wrong score band, a missing Rule 12 table, and the case that must NOT fail (an unrelated
extra finding).

**End-to-end proof on the degraded case:**
```
python check_run.py runs/EXAMPLE-degraded-redline-only.json
  hard_stops 5/5, arithmetic 8/8, playbook 9/9, vendor_tactics 5/5   total 33/36
  MISSING: AE-ABSENT, D-6, S-2
  protection_score absent, Rule 12 table absent, band not emitted
  VERDICT: FAIL, 7 problems   EXIT=1
```
That is exactly the output-mode defect the coverage-matrix audit found, now reproduced
mechanically: clause-anchored findings survive into the redline, and the Protection Score,
the Rule 12 calculation table, the Compliance Evidence Checklist and the absence-detection
row do not, because none of them has a surface in the default mode. **The fixture and the
checker demonstrably detect the real defect**, which is the strongest evidence available
that they will detect a regression.

**Desktop:** `check_run.py` imports `json`, `os`, `sys` only. It lives in `_audit/`, is a
test harness rather than a skill file, and ships with nothing. The six fixture documents
are plain Markdown with no dependency at all.

**What is still owed on Task #1:** a clean run by an actor who has not read the answer key.
That is a fresh Claude Desktop session with the skill installed, given only the six contract
documents. Tracked as its own task rather than left inside this one.

### Task #2 DONE, 2026-07-29. H3 G12 claim-gate audit. The premise was misleading.

`_audit/H3-CLAIMGATE-FINDINGS.md`, reproducible via `_audit/h3_claimgate_audit.py`.
Read-only, findings only, nothing fixed.

**Headline: the item's premise measured the wrong thing.** "G12 named in only 2 of 31
SKILL.md files" is true and it counts the LABEL. G12's own text says it "consolidates the
anti-fabrication rules already stated in GLOBAL OPERATING RULES 3 and 8 and the
supplier-risk reference", so skills implement the underlying rules without citing the new
umbrella name.

Scoring the MECHANISMS instead:
```
IMPLEMENTED (abstain + cite + anti-fabrication)   30 of 32
PARTIAL                                            2
MENTION-ONLY                                       0
ABSENT                                             0
```
The guardrail is broadly in force. Naming it is a documentation gap, not a control gap.

**I caught a false finding in my own first pass and recorded it.** The first run graded
`rfx-hub` and `deal-tab` ABSENT on all three core mechanisms. Both actually carry them,
worded "Absent data is gap-stated in place ... Nothing is invented to complete a layout".
My patterns matched `NEEDS_INPUT` and `[CONFIRM:` and missed `gap-stated`. **That is the
same error the headline statistic makes: matching wording instead of mechanism.** Patterns
corrected, both regraded, variants enumerated in the script with a comment so it is not
re-introduced.

**Three real gaps:**

1. **"DROP, do not dilute" is adopted NOWHERE.** Verified independently: 2 hits across the
   whole suite, both inside G12's own definition in lilly-brand-assets. Every other skill 0.
   It matters more than the count suggests because it is the behaviour a model gets wrong
   by default: faced with an unciteable finding, softening it into "the agreement may not
   fully address X" is the natural move, and it produces deliverables full of
   unfalsifiable observations that read as analysis. Abstaining is visible; diluting is not.

2. **11 of 32 have no code-enforced gate**, so the claim-gate is an instruction that can be
   forgotten. Not all equal: voice-profile, workflow-map and timeline-builder assert little.
   **supplier-deep-dive is the one to look at first** because it produces a single-vendor
   dossier full of exactly the status assertions G12's third prohibition names (debarment,
   sanctions, financial distress, certifications) with no code path that refuses.

3. **Four skills missing a core mechanism.** procurement-help-desk and workflow-map lack
   ABSTAIN (the first is a genuine gap: an unanswerable question needs a marker, not a
   plausible answer). rfx-hub and deal-tab lack CITE in prose, but for rfx-hub that is
   largely closed already by the D4 slice contracts authored today, which require
   `sourceRef` per field and make an uncited field a build failure. The prose has not
   caught up with its own contract.

**Explicitly recommended AGAINST:** adding "per G12" labels across 30 skills. The
mechanisms are present; the label changes no behaviour and would create 30 diffs whose only
effect is to make a future audit of this kind report a nicer number.

**Stated limit:** this is a text audit. It proves presence, not correctness. A skill can
carry every mechanism and apply them badly at runtime; only the golden fixture and the G8
smoke test can speak to that.

### Task #3 DONE, 2026-07-29. F4 + F5 invoice-rate-card-auditor.

Built `invoice_audit_engine.py` and `invoice_audit_selftest.py` in the skill, and wired
SKILL.md with a HARD RULE at the head of Phase 2. F4's dependency (C9) landed earlier
tonight, so it was unblocked.

**Verification, actual output:**
```
python invoice_audit_selftest.py   ->  SUMMARY: 26/26 passed, 0 failed
standalone in an isolated directory (Desktop case)  ->  26/26 passed
imports: json, sys, dataclasses, typing   (stdlib only; os removed as unused)
kernel drift after the change: 15 of 16 match, 1 knowingly held
```

**F4's own verify criterion, met in full.** It asked for "a golden invoice set with seeded
defects (rate mismatch, escalation over cap, duplicate, unsupported hours) must produce
exactly the seeded findings AND NO OTHERS". Six seeded defects, each asserted to the exact
questioned amount:
```
L-04  rate above contract     (165-150) x 80        = 1,200
L-05  line-item math error    6,500 - 6,000         =   500
L-06  escalation over cap     (220-206) x 50        =   700   + RATE_VS_CONTRACT 700
L-07  duplicate across invs   full stated_total     = 20,000
L-08  unsupported charge      full stated_total     = 13,500
L-09  hours discrepancy       20 x 200 (lower rate) =  4,000
```
Plus **three deliberately CLEAN lines that must produce nothing**. That half is the one
that matters: an engine which flags everything passes a test that only checks the seeded
defects were caught. All three stayed clean and landed in `clear_lines`.

**Also asserted:** every severity-escalation trigger (6.8% over cap to Critical, 13,500
unsupported to Critical, 16.7% hours to High), that the duplicate rule flags the LATER
occurrence and not the original, and that confirmed plus pending equals the total.

**What deliberately did NOT move to code.** The engine never guesses an ambiguous match. A
role absent from the rate card, or a roster level HIGHER than billed (a favourable variance
under Rule 7, never a questioned amount), goes to `needs_model_review` with the reason. The
model judges only those lines rather than all of them. Judgment is narrowed, not removed,
which is the same split used everywhere else in this programme.

**Three refusals, all tested:**
- unstated compounding-vs-simple reading raises `BlockingAmbiguityError` rather than
  defaulting, because Operating Rule 2 makes it a blocking ambiguity and the two readings
  produce different caps and therefore different findings;
- a missing or refusing kernel raises `KernelUnavailableError` naming the line, per the
  skill's own "a figure produced without the kernel is invalid" with no estimated fallback;
- row counts or rollups that do not foot raise `ReconciliationError`.

**Two subtleties from the spec that are easy to get wrong and are pinned by tests:**
- **No double counting between the hours finding and the rate finding.** 3D uses the LOWER
  of the two rates the line could defensibly be billed at, so the same excess dollars are
  never questioned twice.
- **`NO_TIMESHEETS_SUPPLIED` is NEEDS_INPUT, not an unsupported charge.** The absence of any
  timesheet population is a data gap, not evidence against a specific line. Tested.

**Immateriality holds:** a $5 variance on a $20,000 line is logged CLEAR, not scored, so
the exception count is never padded with rounding noise.

**Malicious-code review: SAFE.** Imports are `json`, `sys`, `dataclasses`, `typing` plus
the vendored kernel. No network, no subprocess, no eval/exec, no file writes except the
explicit `--ledger` output path the caller names.

### Task #4 DONE, 2026-07-29. G1-G7 Desktop runtime audit. One large finding.

`_audit/G-RUNTIME-FINDINGS.md`, reproducible via `_audit/g_runtime_audit.py`. 32 skills.
Read-only, findings only, nothing fixed.

**HEADLINE: 26 skills point at 8 brand-assets reference files, and NONE of those files
exist.**
```
execution-guardrails.md   23 skills   file exists: NO
narrative-standards.md    23          NO
house-styles.md           23          NO
validation-checklist.md   23          NO
supplier-risk.md          21          NO
dashboard-components.md    7          NO
brand-colors.md            5          NO
docx-design-system.md      2          NO
```
`lilly-brand-assets-1c344a/references/` holds exactly two files (`aria-enrichment.md`,
`user-manual.md`). The other fifteen were INLINED into that skill's SKILL.md and the
standalone files removed. **Every pointer to them was left behind.**

**This fails twice, and the second one is the interesting one.** On Desktop the sibling
skill is not installed, so the path cannot resolve. But in the FULL SUITE, where the
sibling IS installed, the file still does not exist. This is not a Desktop-only
portability question the packaged suite gets away with; it is a broken pointer everywhere.

**Mitigation, verified not assumed: all 26 carry the content inline themselves.** Measured,
26 of 26. So the rules are reachable and no run loses them. What happens is a wasted,
silent step, and a reader being trained that a broken path is normal, which is the
condition under which a load-bearing broken path stops getting noticed.

**Recommendation: delete the pointers, keep the inline content. Do NOT restore the eight
files** — they were inlined deliberately and re-creating them gives the suite two copies of
each, reintroducing exactly the drift E1 and E2 were about.

**This substantially IS H8** (fix supplier-risk anti-fabrication reachability), and H8's
premise understates it: not only `supplier-risk.md`, and the file is not merely unreachable
on Desktop, it does not exist. Also overlaps B7.

**Everything else is clean or better than expected:**
- **G1 third-party imports: ZERO unguarded.** All eight (docx, openpyxl, pptx) are guarded.
  `pro_forma_generator.py` is the reference pattern: detect at import, raise a clear
  ImportError at workbook-BUILD time, so validation stays testable without the library.
- **G3/G4 self-containment: ZERO relative or package imports.** 23 of 32 ship .py and every
  one imports only stdlib plus modules beside it. Independently confirmed tonight by
  running `numeric_kernel.py` and `invoice_audit_engine.py` in isolated directories
  containing nothing else, 96/96 and 26/26.
- **G5:** `/mnt/user-data/outputs` in 13 skills is the standard Claude output location, not
  a repo path. No action.
- **G7:** rfp-response-analysis documents the right recharts pattern, with a styled-div
  fallback so the render degrades rather than failing.

**G6 deliberately NOT overstated.** SharePoint 31, M365/Teams/Outlook 30, ask_user_input_v0
19, and so on, are MENTIONS not hard dependencies. Spot checks show most sit inside a
degradation sentence. Counting them as assumptions would repeat exactly the error the G12
statistic made. What a text audit cannot say is whether each degradation path WORKS; that
is G8 and G9, and it is stated as the honest limit.

**Three skills thin on degradation language:** rfx-hub (1), deal-tab (2), sole-source-
challenge (2). The first two are new hub skills and thinness is expected. **sole-source-
challenge is the one to look at**: it is the only skill depending on TWO third-party
libraries (docx and pptx) and it discusses absence least.

`kernel_manifest.py` flagged in the report so a later reader does not file it as a defect:
it walks the suite directory and cannot run standalone BY DESIGN, is referenced by no
SKILL.md, and exits cleanly with a clear message outside the suite.

### Tasks #5 and #6 DONE, 2026-07-29. G8 defined, G9 run, one real breakage fixed.

`_audit/skill_smoke_test.py` and `_audit/G8-G9-SMOKE-TEST-FINDINGS.md`.

**G8's design decision: every assertion runs against a COPY of the skill in an empty temp
directory.** No siblings, no suite root, no repo. Testing in place silently passes code
that only works because a sibling was one directory up, which is precisely what a Desktop
install exposes and a repo checkout hides. Eight assertions: SKILL.md present, .py parse,
.py IMPORT in a flat install, shipped self-tests PASS in isolation, no unguarded
third-party import, no relative import, self-referencing paths resolve, cross-skill paths
have a stated fallback.

A7 and A8 are deliberately separate. A7 is the skill's own bug; A8 is suite composition,
and on Desktop a cross-skill path is EXPECTED not to resolve, so the assertion is the
fallback rather than the path.

**Two false positives I introduced and fixed before trusting any result**, recorded because
a smoke test that cries wolf gets ignored and then stops catching real failures:
`unpack.py` is a PLATFORM tool, not a skill file (allowlisted); and `analysis_summary.docx`
/ `pro_forma_model.xlsx` are artifacts the skill PRODUCES, so asserting a skill ships its
own output is backwards (A7 narrowed to .py/.js/.css).

**RESULT: 32 skills, 4 failed assertions, 3 after the fix.**

**The one real breakage, which no text audit could have found.**
`deal-tab-1c344a/dashboard/_platform_build/apply_deal_chrome.py` ran file I/O at MODULE
level against `C:\Users\marcs\Downloads\...\_deal_build\deal-dashboard.html`. Merely
IMPORTING it raised FileNotFoundError. Hardcoded absolute path, containing a specific
user's name, pointing at something the file's own header says no longer exists, shipping
inside an installable skill.

**The fix respects a documented decision instead of reversing it.**
`_deal_build/SOURCE-OF-TRUTH.md:50` records: "Left in place, headed as superseded, not
deleted." Deleting was the obvious fix and would have reversed that. Instead the execution
moved behind `if __name__ == '__main__':`. Nothing removed, the file stays exactly as
documented, and it is now inert on import, which is what "kept for reference" already
meant. Both copies fixed, both import cleanly, deal-tab passes all eight.

**Three A7 failures remain, all documentation pointers, none breaking a run:** deal-room
cites deal-tab's files, lilly-brand-assets documents three kernels it does not ship, and
rfp-engine points into rfx-hub's dashboard assets. Same family and same disposition as the
G1-G7 headline: prune the pointers, do not create the files. B7.

**Reported and deliberately NOT fixed:** `build_my_work.py` hardcodes two absolute paths
into a DIFFERENT project ("lilly IT intake and orchestration tool"). It does not crash on
import so nothing fails, and it also cannot work on any machine but one. Left alone because
it is a build-tree script that pending My Work dashboard work may depend on, and rewriting
it would overstep a read-and-report boundary. The honest disposition is that
`_platform_build/` probably should not ship inside an installable skill at all, which is a
packaging question (K1).

**Scan worth recording:** every .py in every skill checked for hardcoded local paths.
Exactly TWO files, both in `deal-tab-1c344a/dashboard/_platform_build/`. The rest of the
suite is clean.

**Suite state after G9:**
```
A1 SKILL.md present ........... 32/32     A5 no unguarded 3rd-party .... 32/32
A2 .py parse .................. 32/32     A6 no relative import ........ 32/32
A3 .py import flat ............ 32/32     A7 self-refs resolve ......... 29/32
A4 self-tests pass ............ 32/32     A8 cross-skill fallback ...... 32/32
   (A3 was 31/32 before the fix)
```
**Every skill imports and every shipped self-test passes in a flat, sibling-free,
single-folder install.** That is the Desktop condition and the assertion that matters most.

**Flagged for a ruling before packaging:** `lilly-procurement-kernels-1c344a` has NO
SKILL.md, so it is skipped by the default sweep. That may be correct, since every consumer
vendors a verbatim copy and it may not need to install at all, but nothing in the repo says
whether that is design or oversight.

### Kernel ruling + ship manifest, 2026-07-29. Answers Marc's two questions.

**QUESTION 1: is `lilly-procurement-kernels-1c344a` having no SKILL.md design or oversight?**

**RULING: it is NOT an installable skill and must NOT ship.** Recorded in that directory's
MAINTENANCE.md. The evidence is unanimous:

1. **No SKILL.md** means Claude cannot discover or invoke it. Shipping it delivers inert
   bytes to every user.
2. **Zero references** to `/mnt/skills/user/lilly-procurement-kernels-1c344a/` across every
   SKILL.md and reference file in the suite. Nothing expects it installed.
3. **The distribution model is VENDORING.** Consumers carry a byte-identical copy, which is
   what lets a skill install standalone. `ARIA-PROCUREMENT-PLUGIN-RESEARCH.md:17` says the
   same: "already vendored byte-identical into 10 skills" (15 now).
4. **Every other non-shipping tree is `_`-prefixed or `docs/`.** This is the sole exception,
   and that naming is the entire reason it looks shippable.

**The `-1c344a` suffix is the defect, not the missing SKILL.md.** Explicitly recorded: do
NOT "fix" this by adding a SKILL.md, which would make it genuinely installable and give
users a skill whose only job is to hold a library every other skill already carries.

**QUESTION 2: what ships, what gets stripped, without deleting anything yet?**

Built `_audit/ship_manifest.py`. It classifies and measures. **It deletes nothing and
cannot.** Marc: keep the old files until the new skills prove themselves in real use.

```
SHIPS ....................... 32 skills, 46,185 KB as-is
REPO-ONLY ................... 11 trees (_audit, _deal_build, _platform_build,
                              _canonical_originals, _dashboards_ORIGINAL, docs, ...)
ANOMALY ..................... lilly-procurement-kernels-1c344a, 255 KB
                              a '*-1c344a' glob WOULD ship it
DEAD WEIGHT IN SHIPPING SKILLS  8,624 KB across 13 paths  (18% of the package)
package after stripping ..... 37,561 KB
```

**The dead weight, largest first:**
- `deal-tab/dashboard/_platform_build` ~4.0 MB and
  `category-strategy/dashboard/_platform_build` ~2.8 MB. These are build trees that GENERATE
  the dashboard. The shipped artifact is the built HTML; the builder is not needed to use
  the skill. **This is also where both hardcoded-local-path files live**, including
  `build_my_work.py`, so stripping build trees at packaging resolves that finding as a side
  effect rather than needing a code edit.
- `deal-tab/dashboard/_parts` 548 KB, pre-assembly fragments.
- `__pycache__` across 8 skills, ~1.2 MB, regenerated on demand and never read by a user.
- `lilly-contract-review/references/isolated` 226 KB, isolation test scratch.

**Nothing was deleted and no packaging step was run.** Stripping is a deliberate reviewed
step taken against this manifest at packaging time (K1). Recorded here so the assessment
exists when that moment comes, rather than being improvised then.

### Task #7, 2026-07-29. H5 is BLOCKED on H4. Adjacent tool built and kept.

`_audit/H5-CITATION-FINDINGS.md`, `_audit/h5_citation_resolver.py`.

**I built the wrong tool first, then read H5's actual definition.** Recording that rather
than presenting the tool as if it were the item.

H5 is about citations a skill EMITS in its deliverables, chiefly external URLs: "a resolve
check on every emitted citation: URL fetched this run, or snapshot hash matched, or
explicitly labelled unverified", verified by seeding a dead URL. It is NOT about internal
file cross-references, which is what I checked.

**H5 `Depends on: H4`, and H4 is one of the eight untriaged WS H items behind a Marc
decision.** A per-citation resolve state has nowhere to live until provenance is per-fact:
today a document carries one provenance record, so there is no field on which to record
that THIS URL was fetched, hash-matched, or unverified. H5 proper cannot be built yet, and
attempting it would mean inventing the field that is H4's whole job.

**Ground state measured (the unblocked groundwork):**
```
skills emitting external URLs .................. 7 of 32
skills requiring a capture date / "this session"  2
generators enforcing a resolve check IN CODE ... 0
```
G12 already specifies the right shape at `lilly-brand-assets:1117` ("an accessed web source
with URL plus capture date"). **Stated once, centrally, enforced nowhere.** Same pattern H3
found for "drop, do not dilute": a correct rule with no mechanism.

**The named worst case is already documented and still open.**
`procurement-help-desk-1c344a/SKILL.md:129-131`, Global ProtectLilly: on the now.lilly.com
intranet, not SharePoint, so the M365 connector "may NOT reach this page ... the source most
likely to fail retrieval ... the retrieval gap has not yet been re-verified". A policy URL
that will be cited, probably cannot be reached, and where nothing forces the difference
between "fetched" and "cited from memory" to be visible. That is all of H5 in one example.

**The adjacent tool I kept**, checking internal cross-references, which nothing else covers:
```
line-number citations checked ... 12    resolved 12    broken 0
cross-skill path citations ...... 166   target missing 153
```

**The interesting result is the SCARCITY, not the breakage. Twelve line-level citations
across 32 skills.** The suite cites files constantly and lines almost never. G12 asks for
"a document plus section/page"; internal referencing is file-level, so a reader chasing a
claim lands on a whole document rather than a place in it. That is the difference between a
checkable source and a plausible one.

**Two real catches, both mine:**
1. An ambiguous citation I wrote earlier tonight: `rfx-hub/SKILL.md` carried a bare
   `SKILL.md:384` inside prose about rfp-engine. Correct in context, ambiguous in form,
   resolves against the wrong file mechanically. Fixed to `rfp-engine-1c344a/SKILL.md:384`.
2. A resolver bug: my first version preferred a same-skill basename match over an explicit
   path, so the corrected citation still reported false. A citation carrying a path is
   explicit and must be honoured first. Fixed, reason recorded in the code.

**153 cross-skill misses: 145 are the brand-assets dangling pointers, independently
reproduced by a second tool**, which is a useful confirmation of the G1-G7 finding.

**One NEW finding, not a citation at all:** eight paths under
`/mnt/skills/user/executive-summary/` come from an INSTALL SCRIPT at
`executive-summary-package-1c344a/SKILL.md:1096-1150`. **That skill installs under a
different name than its directory** (`executive-summary` vs `executive-summary-package-1c344a`).
Possibly deliberate, but a manifest built from directory names will not match what lands on
disk. Flagged for K1.

**Recommendation:** H5 stays blocked on H4. What is worth doing now regardless: enforce the
capture-date requirement in whichever generator emits a benchmark or research table, so a
citation without one raises rather than renders. Same ledger-boundary pattern as the
contract-review fix pack, and it needs no new provenance model, only a required field on an
existing structure.

### Task #8 DONE, 2026-07-29. "Only deal-tab has a slice contract" was wrong. Corrected.

Re-checked every skill and corrected the stale claim in both places it was recorded:
`_audit/SYNTHESIS.md:52` and `_audit/UPGRADE-PLAN.md:455`.

**The original finding:** "`deal-tab-1c344a` is the only skill in the suite with an
output-slice contract. **Confirmed across all six groups.**"

**It was wrong when it was written.** `lilly-contract-review` already had one. Not missing,
**buried**, at `references/dashboard-canonical.md:224-353`, inside the very file scheduled
for retirement. A search that looks only at `SKILL.md` cannot find it.

**"Confirmed across all six groups" is how a shared blind spot gets recorded as a verified
fact.** Six independent reviewers all searched the same wrong place and their agreement was
mistaken for evidence. That is worth more than the correction itself, so it is written into
SYNTHESIS.md rather than just fixed.

**Verified current state, 7 of 32 carry one:**
```
deal-tab              YES  hub's own table (pre-existing)
rfx-hub               YES  hub table, rewritten under D4 tonight
lilly-contract-review YES  BURIED in dashboard-canonical.md:224 -> must be RELOCATED to
                           references/deal-tab-contribution.md BEFORE that file is deleted
rfp-engine            YES  authored under D4 tonight
rfp-case-manager      YES  authored under D4 tonight
rfp-response-analysis YES  authored under D4 tonight
evaluation-engine     YES  authored under D4 tonight
scope-sow-architect   NO   = D2, blocked
pro-forma-builder     NO   = D3, blocked
deal-room             NO   = D5, blocked
```

**The genuine gap is THREE skills, not thirty-one**, and all three are already tracked as
D2, D3 and D5 behind the A11 and B4 gates. The workstream is far smaller than the audit
implied.

**Lesson recorded in SYNTHESIS.md:** absence was asserted from a search that could not have
found the thing it was looking for. Before recording "no skill has X", state where X would
live if it existed, and search there. The original claim is kept alongside the correction
rather than deleted, because how it was wrong matters more than that it was wrong.

### FIX, 2026-07-29. executive-summary-package install script was broken four ways.

Followed up on what I had reported as a "naming inconsistency". It was worse than that, and
reporting it as a nit was wrong.

`executive-summary-package-1c344a/SKILL.md`'s Installation block would have produced a
**non-functional skill**:

1. Destination `/mnt/skills/user/executive-summary/` did not match the skill's declared
   `name: executive-summary-package-1c344a`.
2. Source path `executive-summary-package/` missing the `-1c344a` suffix.
3. Copied `references/metadata-fields.md` and `references/default-structure.md`. **This
   skill has no `references/` directory at all.** Those files do not exist.
4. **Omitted `executive_summary_generator.py`** entirely, which SKILL.md:509 names as the
   module that produces the primary `.docx` deliverable under a HARD RULE. A skill installed
   by that script would have been missing its own generator.

Point 4 is the real defect. The rest is stale naming; that one ships a skill that cannot do
its main job.

**Fixed:** paths corrected to the declared name, the two non-existent reference files
dropped, the generator added, and the verify step now checks the generator explicitly
because its absence is exactly what the old script caused. The correction is recorded inline
above the block rather than silently applied.

**Verified:** every file the script now copies exists; zero stale `/mnt/skills/user/
executive-summary/` paths remain outside the explanatory note; the 8 phantom cross-skill
paths the H5 resolver was reporting are gone; smoke test still 0 failed assertions.

**Scope checked:** no other skill has this defect. A sweep comparing every skill's declared
`name:` against the install paths in its own SKILL.md returns this one only.

### Task #9 DONE, 2026-07-29. E5 category-strategy sidecar ownership table.

**Assessed the stated `Depends on: B1` and judged it does NOT apply.** Stating that openly
rather than either ignoring the dependency or skipping the item.

B1 retires category-strategy's reference-JSX spec. This sidecar carries ANALYSIS DATA
(concentration, kraljic, savings pipeline), not dashboard structure. Retiring a JSX spec
does not change what data the sidecar holds, and the disputed tab count (B2) does not
either. If B1 lands later, nothing authored here needs rework. Reversible if Marc disagrees:
it is one added section.

**What the gap actually was.** The plan says the sidecar has "no named fields". It does have
a JSON example with 12 keys. The real gap is that **an example is not a contract**: a
consumer reading it as a schema hardcodes `"commodity": "999"` and a `v10.6.6` stamp.
Authored a field-ownership table declaring, per field, whether it is STABLE (a consumer may
depend on it) or ADVISORY (may change, do not build on it), and which of the three named
consumers reads it. Verified mechanically: all 12 illustrative keys are covered.

**`numbers_reconcile` is called out as STABLE AND A GATE.** A consumer that reads the
figures while it is `false` is consuming numbers this skill has already declared
untrustworthy and labelled NEEDS_INPUT.

**REAL FINDING: rfp-engine expects a shortlist this sidecar does not carry.**
`rfp-engine-1c344a/SKILL.md:195` consumes from this skill "the recommended sourcing approach
**and any named supplier shortlist**", carrying the shortlist "into the supplier invitation
list at Step 3". **There is no shortlist field.** The nearest is
`savings_pipeline[].vendor`, which is not the same thing: a vendor can appear there for a
renewal renegotiation without being a candidate to invite to an event.

So rfp-engine either re-parses the dashboard, which is exactly what the sidecar exists to
prevent, or the shortlist moves by hand. **Recorded, not silently patched.** A `shortlist[]`
field is a real design addition with a consumer already waiting for it, and it needs its own
definition of what qualifies a supplier, which is Marc's call rather than mine.

**Also corrected the framing.** The sidecar is described as feeding "downstream skills", but
two of the three named consumers also flow INTO this skill
(`market-rate-benchmarking:706` has a "To category-strategy" section;
`supplier-deep-dive:347` adds a supplier of interest into the category dashboard). Those are
separate handoffs that do NOT write to the sidecar. The distinction matters because treating
an inbound flow as able to edit the sidecar would give it two producers, which is the defect
E1 and E2 exist to prevent.

Smoke test on the skill after the change: 0 failed assertions.

### Task #10 DONE, 2026-07-29. F6 pro-forma dashboard wired to ground truth.

Built `pro-forma-builder-1c344a/dashboard_adapter.py` and wired SKILL.md with a HARD RULE.

**Assessed the stated `Depends on: A11` and judged it does NOT apply**, same as E5's B1.
A11 locks the five hubs; pro-forma's dashboard is a skill-level artifact, not a hub. The
adapter emits FIGURES, not layout, so the D1 rewrite to the converged 4-tab IA changes what
the tabs look like and not where their numbers come from. It survives that rewrite and in
fact makes it easier.

**The drift this closes.** `pro_forma_model.xlsx` comes from `compute_ground_truth()` in one
generator call. The optional dashboard was hand-assembled from narrative figures. Two
artifacts, two derivations, one set of numbers, so they could disagree and nothing would
say so. This was the only remaining hand-built artifact in the best-wired skill in its
group, which is exactly why it was worth closing: a skill that computes everything correctly
and then hand-types the summary into a second deliverable has moved the error, not removed it.

**Verification, actual output:**
```
python dashboard_adapter.py   ->  SUMMARY: 6/6 passed
  dashboard data builds from ground truth
  every scenario NPV present
  dashboard NPV equals workbook NPV, every scenario
  provenance records zero hand-entered figures
  a drifted NPV is REJECTED
  a scenario missing from the dashboard is REJECTED
smoke test in a flat isolated install: 0 failed assertions
imports: json, sys, typing (stdlib only)
```

**Two of the six cases deliberately tamper with a figure**, because an assertion that has
never fired is not known to work. One perturbs an NPV, one removes a scenario; both must
raise.

**Stronger than F6's stated criterion.** F6 asks to "assert dashboard NPV equals workbook
NPV cell". The adapter checks EVERY scenario's NPV and every cashflow period, not just the
base case. A base-case match with a drifted alternative scenario is still two artifacts that
disagree, and the alternative scenario is precisely what a reader uses to argue for a
different decision.

**Two process notes, recorded because both were my errors:**
1. My first version imported `validate_pro_forma_input`, which does not exist. The real name
   is `validate_assumptions`. Caught immediately by running it.
2. My second version hand-built a minimal register, which the generator's own validator
   REFUSED for six missing required fields. That refusal is the generator working correctly.
   Rather than weaken the register, the self-test now uses the sample register from the
   generator's own `__main__` block verbatim, so the adapter is tested against the same
   input the workbook path is tested against and cannot pass against a shape the generator
   would reject. **A self-test that ran 0/0 was the intermediate state and was not
   acceptable to ship.**

**Does not touch the workbook path**, which `MASTER-REMAINING-WORK.md:316` preserves
explicitly. No fallback that assembles from narrative figures is offered, because that
fallback IS the drift being removed.

**Malicious-code review: SAFE.** Imports `json`, `sys`, `typing` plus the vendored generator.
No network, subprocess, eval, exec, pickle or base64. Writes nothing.

### DEPENDENCY AUDIT, 2026-07-29. Settled definitively rather than flagged.

I had reported "three spurious dependencies in a row, worth a look". That was pushing a
question back that I could answer. Answered it.

**A11 is cited by 19 of the plan's 78 items.** A quarter of the programme gated on one
sign-off.

**A11's own text says what it is:** "This is the gate, and it is the reason nothing in WS B
through WS H starts earlier." And `PROGRAM-MASTER-PLAN.md` gives the phase-order rationale:
cleanup sits between the dashboards and the deep skills work "so Claude never weeds through
retired content".

**So `Depends on: A11` means "this is Phase 2". It is a SEQUENCING CONVENTION, not a
statement that the item technically needs locked hubs.** The two were never distinguished
and the column reads as though they were the same thing.

**THE EMPIRICAL TEST. Eight items citing `Depends on: A11` were completed tonight without
A11:** C1, C2, C3, C4, C6, C7, C8 and F6. Kernel self-test 96/96, adapter 6/6, suite smoke
test unchanged. Nothing broke. None of them touches dashboard content; they touch
arithmetic, schemas and data contracts.

**The rule that separates real from spurious:** A11 is a real dependency **if and only if
the item OPERATES ON content that locking or retirement will change.**

```
REAL (7)      B1 B4 B6 B7 D1 F1 J1
              each either IS a retirement, or cannot know what is stale until
              retirement settles. D1 is the sharpest: contract-review's slice
              contract is BURIED inside the file being retired.

SPURIOUS (10) C1 C2 C3 C4 C6 C7 C8 F6 E4 I1
              seven kernel items and F6 PROVEN by completion tonight.
              E4 builds a WORKBOOK, not a hub dashboard. I1 is a Marc decision
              about skill boundaries that A11 has no bearing on.

PARTIAL (2)   B5  dead code in vendored .py is not gated; dead code in dashboard
                  BUILD TREES is. Split by location.
              F9  the findings sweep can run now; any BUILD it recommends is gated
                  on knowing which deliverables survive.
```

**VERDICT: of 19 A11 dependencies, 7 real, 10 spurious, 2 partial.** The column is not
wrong so much as OVERLOADED: it carries both "needs this built first" and "comes after this
in the agreed sequence" with no way to tell which. The practical cost is real, roughly 10
items sat in a blocked column while technically ready, and this session completed 8 of them
without incident.

**ACTED, not just reported.** Inserted the audit at the top of `_audit/UPGRADE-PLAN.md` and
annotated all 12 affected entries inline as `A11 (SEQUENCING ONLY, not a technical gate)` or
`(PARTIAL)`. The 7 REAL ones are deliberately left untouched.

**Explicitly preserved:** the phase order itself is unchanged and remains Marc's to relax.
An item marked SEQUENCING ONLY is technically ready, NOT automatically approved to jump the
queue. That distinction is written into the audit so a later reader cannot mistake one for
the other.

**Flagged for the same treatment:** `B1` is cited by 3 items and likely carries the same
overloading. `C9`, `D1`, `H1` and `H4` were spot-checked and appear to be genuine
build-order dependencies.

### Task #11 DONE, 2026-07-29. F8 field-guide reconciliation gate.

Added `fgReconcileSavings()`, `fgReconcileRC()` and `fgRefusalHtml()` to
`references/field-guide-engine.html`, gating both figure views before they paint.

**Verification, actual output (11/11), run against the ENGINE'S OWN `num()` and `money()`
rather than sandbox stand-ins:**
```
shipped seed savings reconciles (must not false-positive)     PASS
shipped seed reportCard reconciles                            PASS
F8 CRITERION: achieved > committed REFUSES                    PASS
ci + ca != achieved REFUSES                                   PASS
non-numeric pipeline amount REFUSES                           PASS
negative target REFUSES                                       PASS
non-numeric committed REFUSES                                 PASS
unrecognised grade REFUSES                                    PASS
gpa NOT asserted vs categories                                PASS
absent savings / reportCard are not errors                    PASS x2
```
Engine script still parses; smoke test on the skill unchanged.

**Refuses the VIEW, not the board.** The engine's standing promise is that a bad payload
never blanks the screen. Blanking everything over one savings typo would trade a wrong
number for a dead board, so the refusal is scoped to the affected view and names the field
and the problem.

**MY OWN TEST CAUGHT TWO BUGS IN MY OWN CODE, both of which would have shipped:**
1. **`fmtMoney` does not exist in the engine.** I invented the name; the real formatter is
   `money()`. Six call sites, every one a ReferenceError the moment a refusal fired. So the
   gate would have crashed precisely when it was needed. Fixed.
2. **The non-numeric check could never fire.** `num()` coerces `"TBD"` to `0`, so
   `isFinite(num(x))` is always true. A pipeline amount of `"TBD"` sailed through and would
   have rendered as `$0`, a fabricated figure presented as real. Now tested on the RAW value.

This is the second time tonight that testing against a skill's REAL helpers rather than
plausible ones caught a defect (the first was pro-forma's `validate_assumptions`). Worth
stating as a rule: a self-test that stubs the environment tests the stub.

**FINDING, and it changes F8's premise. The GPA invariant does not exist.** F8 asked to
validate "that Report Card categories foot to the stated GPA". No formula is defined
anywhere in the skill, and **the shipped seed does not foot under the obvious reading**: its
grades (B, C, B, A, D) average 2.60 against a stated GPA of 3.4.

So asserting it would have INVENTED the rule and then failed the engine's own seed.
Deliberately not asserted. Recorded in SKILL.md as an open question for Marc: either the GPA
is weighted, in which case the weights need stating, or it is an independent
self-assessment, in which case it should be labelled as one rather than sitting above a
category list that implies it is their average.

`savings{}` by contrast has genuinely well-defined invariants, both of which hold in the
seed, and both are now enforced.

### Tasks #33 and #34 RESOLVED, 2026-07-29. Both without inventing policy.

Researched both rather than escalating them. Neither needed a new rule, because in both
cases the rule already existed and was being looked for in the wrong place.

**#33 SHORTLIST: do NOT add the field. Fixed a wrong pointer instead.**

`recommended_shortlist` already exists at
`rfp-engine-1c344a/references/landscape-intake-schema.md:88`, produced by
**supplier-landscape**, the skill literally named "Supplier Market Landscape and Shortlist
Generator". It is not a bare array: it is **user-confirmed by construction** (`:110`
populated only after the user confirms; `:100` excludes eliminated suppliers; `:106`
confirmed again before the package is generated).

**Adding a `shortlist[]` to category-strategy would have been actively harmful, not merely
redundant.** category-strategy's supplier view is Pareto-derived management TIERING, which
answers how to manage a supplier you already spend with. A shortlist answers who to invite
to a competitive event. A derived list feeding the same invitation field as a user-confirmed
one puts two producers on one field with **incompatible confirmation semantics**, and the
failure mode is inviting a supplier that nobody approved.

So the defect was `rfp-engine/SKILL.md:195` naming the wrong source. Corrected there, and
the matching "Known gap" note in category-strategy rewritten as RESOLVED with the reasoning.
category-strategy contributes `recommended_strategy` and tiering as CONTEXT, never an
invitation list.

**#34 GPA: it was already declared self-scored. The defect was presentation.**

The engine's own view header has always read "**A self-scored read** on category health".
So it was never meant to derive from the categories, and my earlier framing of it as an
undefined formula was wrong.

Two real problems compounded it:
1. **`scoring-scales.md` enumerates every exception to the 0.0-5.0 evaluation scale**
   (supplier-landscape 0-10, Protection Score 0-100, negotiation difficulty 0-100,
   data-quality 0-100) **and the GPA was in neither list**, so a list that reads as
   exhaustive was not.
2. The same doc requires "Any dashboard or report that shows these scores prints a one-line
   scale legend". The Report Card printed a bare `3.4` in a 40px numeral above a graded
   category list, with no legend and no basis, which implies it is their average.

**Also: the seed's grades did not follow their own value/target ratios.** 66% carried a B
while 70% carried a C, and 40% carried a D where any standard scale gives F. Illustrative
data that contradicts itself teaches the wrong pattern.

Fixed all four: the numeral now carries "self-scored, 4.0 scale. Not derived from the
categories below."; the GPA is added to `scoring-scales.md`'s exception list with both
non-obvious properties stated; and the seed grades are corrected to follow their own ratios
(B, C, D, A, F).

**The GPA itself was deliberately NOT recomputed.** It is self-scored by design, so deriving
it would be wrong, and now for a positive reason rather than an absence of one.

**Verification:** engine script parses; corrected seed passes the F8 reconciliation gate on
both savings and reportCard; the 2 smoke-test failures across the four touched skills are
the pre-existing G9 doc-pointer failures in rfp-engine and lilly-brand-assets, unchanged and
unrelated.

### Task #12 DONE, 2026-07-29. F9 generator coverage sweep.

`_audit/F9-GENERATOR-COVERAGE-SWEEP.md`. Decisions with written reasons, per F9's own
requirement. Findings, not builds.

**The decision rule is the suite's own precedent**, from GROUP-6's split for
executive-summary-package: **code owns validation, arithmetic, assembly and invariants; the
model owns narrative.** Prose is the RIGHT answer for genuinely narrative content, and a
generator authoring argument produces worse output than a model. The failure this item
catches is the opposite one: a STRUCTURED artifact assembled by hand.

**Current coverage:** 13 skills ship a `.py`; 8 are real document or data generators, the
rest are decision kernels. Two of the 8 landed tonight (`invoice_audit_engine`,
`dashboard_adapter`), which materially changes the cost of two rows below.

**Priority order, with the reason each earns its rank:**

1. **scope-sow-architect, BUILD.** Four structured artifacts
   (`rate_card_and_payment_schedule.xlsx`, `raci_matrix.csv`,
   `change_control_log_template.xlsx`, `scope_findings.json`) and ZERO generators. Verified:
   the skill ships only `numeric_kernel.py`. Effort M rather than L, because the arithmetic
   is already available via `verify_line_math()` and `assert_reconciles()`. `Rewritten_SOW.docx`
   stays PROSE and is preserved explicitly at MASTER-REMAINING-WORK:316.
2. **rfp-engine E4.** A documented claim (validation dropdowns, conditional formatting) that
   no code implements. A correctness gap, not a cost one. A11 dependency already resolved
   spurious.
3. **negotiation-playbook-learning, and it is now CHEAP.** `outcome_partition()` and
   `difficulty_score()` (O4 tonight) already compute and validate every figure its JSON
   artifacts carry, including the sum-to-1.0 check. The generator is serialization plus
   assertion, not arithmetic. Effort S. Verified both functions import.
4. **rfp-case-manager schemas.** It is the suite's STATE owner, so hand-assembled state is
   the worst possible place for drift. Meeting and comms drafts stay PROSE.
5. **legal-negotiation-prep, SPLIT.** `tier_kernel.py` exists and computes the tiering;
   nothing assembles the briefing from it. Skeleton and tier tables BUILD, the negotiation
   argument stays PROSE. Verified: tier_kernel is the only .py.
6. **supplier-landscape DOCX, BUILD but genuinely large.** Still carries the three-pass
   open/append/save pattern F2 removed from rfp-response-analysis (verified, 2 occurrences
   remain). Deferred by name in F2's own commit because its generator builds the DASHBOARD,
   not the DOCX. Must NOT be fixed the F2 way: collapsing three appends into one write is
   the truncation failure G10 warns about. Effort L, ~2,900 lines comparable.

   Its CSVs should be emitted by the SAME generator so the report and the CSVs cannot
   disagree, which is the F6 lesson applied.

**DEFERRED with reasons, not skipped:** supplier-deep-dive's dossier dashboard follows A5
(blocked on Marc's hub-home decision), and building against an IA about to change would be
waste. scope-sow's dashboard defers to D1 for the same reason.

**Accepted as PROSE deliberately**, with the test stated: a reader would be worse off if a
template wrote it. That covers `Rewritten_SOW.docx`, negotiation argument, meeting and comms
drafts, `outcome_summary.md`, dossier narrative, and contract-review's redline wording.

**Excluded:** `lilly-contract-review`, HELD. Its generator question is F1's and the coverage
matrix already answers it.

### Task #13 DONE, 2026-07-29. CI gate wired. All 8 checks green.

`.github/workflows/checks.yml`. Runs on push to main, on PR, and on demand.

**The blocker I had to solve first: the smoke test was red on day one.** Three A7
doc-pointer failures (deal-room, lilly-brand-assets, rfp-engine) would have made the gate
fail from its first run, and **a check that is red on day one gets ignored, then stops
catching the failures that matter.** That is the same "cries wolf" failure I fixed twice
tonight in my own tools.

Added `KNOWN_OPEN` to `skill_smoke_test.py`: each of the three carries a REASON and a
tracking reference (B7), reports as `[KNOWN]` rather than `FAIL`, and does not fail the run.
The docstring states plainly that the list is **a liability, exactly like
kernel_manifest.py's KNOWN_EXCEPTIONS**, and that adding to it must be a deliberate act with
a reason, never a way to make a run pass.

```
32 skill(s), 0 failed assertion(s), 3 known-open (see KNOWN_OPEN)   EXIT=0
```

**Every gate verified locally, exactly as CI runs it:**
```
kernel drift (no vendored copy may silently diverge)   PASS
numeric kernel self-test                               PASS
runtime smoke, 32 skills in flat isolated installs     PASS
golden fixture checker self-test                       PASS
invoice engine seeded-defect golden set                PASS
pro-forma dashboard adapter drift assertions           PASS
field-guide gate (parses, seed reconciles, gate fires) PASS
ship manifest                                          PASS
```
YAML parses.

**Each gate is in there because a real defect got through without it**, and the workflow
header says so: kernel drift because 9 of 16 vendored copies were silently stale; the
runtime smoke test because deal-tab crashed on IMPORT inside an installable skill against a
hardcoded path containing a username; the self-tests because two bugs shipped into a
reconciliation gate that would have thrown the moment it fired.

**No third-party install step, deliberately.** The suite's own rule is that a skill must run
without one, so its CI should too. Everything is stdlib Python plus the Node already on the
runner.

**Two steps are non-blocking on purpose.** The citation resolver reports but does not fail,
because its 153 cross-skill misses are the known brand-assets dangling pointers tracked as
B7; it is there so a NEW break becomes visible. The ship manifest is informational and
deletes nothing.

**The field-guide step does more than parse.** It asserts the shipped seed reconciles AND
that the gate actually fires on `achieved > committed`, because an assertion that has never
fired is not known to work.

### SUPPRESSION AUDIT, 2026-07-29. Two real holes found in my own allowlists, both closed.

Marc asked how big the liabilities are and whether they were mitigated or eliminated. Audited
all four suppression mechanisms I created tonight. **Two were real holes. Both are now
eliminated, not documented.**

**The test that matters: can it absorb a NEW defect?** An allowlist scoped to "suppress this
check for this skill" absorbs every future failure of that check in that skill. That is
worse than no allowlist, because it reads as coverage.

**HOLE 1: `KNOWN_OPEN` suppressed the whole A7 assertion for 3 skills.** If deal-room later
referenced a different missing file, A7 stayed suppressed and the gate would not have caught
it.

**HOLE 2: `KNOWN_EXCEPTIONS` suppressed ANY hash mismatch for contract-review.** The copy is
knowingly stale, but a CORRUPTED or hand-edited one would also have passed. The entire
purpose of that script is catching a copy nobody meant to change, so the exception hid
exactly the case it exists to find.

**FIX, applied to both: pin the exception to the exact known state, not to the check.**
`KNOWN_OPEN` now stores the exact expected failure detail and compares it verbatim.
`KNOWN_EXCEPTIONS` now stores the expected body sha256 of the held copy.

**Proven by tampering, not asserted:**
```
TEST 1  append a comment to the HELD contract-review kernel
        -> [DRIFT] "has an exception entry but its hash does not match the pinned one.
                    This is drift in a HELD file and is NOT excused."
        -> RESULT: DRIFT in 1 of 16.   restored -> green again

TEST 2  add a NEW broken path to rfp-engine, which HAS an A7 allowlist entry
        -> FAIL(1), detail shows BOTH the known path and totally_made_up_file.py
        -> restored -> 0 failed, 1 known-open
```

**Residual liability, honestly stated.** Two suppressions remain and both are narrow and
correct:
- `SELFTEST_EXEMPT` skips A4 for `kernel_manifest.py`, which genuinely cannot run in a flat
  install by design. It means that file's runtime behaviour is not covered by the smoke
  test. It IS covered by CI, which runs it directly against the real suite.
- `PLATFORM_TOOLS` excludes `unpack.py` / `pack.py` from A7. Those are platform-provided and
  are supposed to be absent from a skill folder. If the platform ever renamed one, A7 would
  not notice, which is an acceptable trade for not re-introducing the false positive.

**Net position:** of four suppressions, two were real holes and are now closed with proof,
and two are narrow with their residual exposure named. The three `KNOWN_OPEN` entries and
the one `KNOWN_EXCEPTIONS` entry all remain REAL open defects tracked as B7 and the F1
rewire respectively; pinning does not fix them, it stops them concealing anything else.

### TRACEABILITY AUDIT, 2026-07-29. Traced every finding to a task. Found 6 gaps in my own tracking.

Marc asked whether the "real open items" I keep referencing actually have plans. Checked
rather than asserted. **Most did. Six did not**, and I had been saying "tracked as B7" as an
assumption.

**THE ASSUMPTION THAT WAS WRONG.** `_audit/UPGRADE-PLAN.md` B7 says: "remove old mode
pickers, superseded IA prose, routing lists". It does **not** name the dangling brand-assets
pointers or the three A7 doc pointers. A future reader working B7 would have had no reason
to look for either. Saying "tracked as B7" was a guess dressed as a fact.

**GAPS FOUND AND CLOSED:**

1-2. **The 26-skill dangling pointer sweep** and **the three A7 doc pointers**, now written
explicitly into task #15 with the fix stated (delete the pointers, keep the inline content,
do NOT restore the 8 files) and a **completion criterion**: when done, DELETE the KNOWN_OPEN
entries. The allowlist must not survive as permanent furniture, and the smoke test must end
green with an EMPTY KNOWN_OPEN.

3-5. **H3's three surviving findings had no task at all** (new task #35): "drop, do not
dilute" adopted nowhere (2 hits suite-wide, both inside its own definition); eleven skills
with no code-enforced claim gate, **supplier-deep-dive first** because it asserts exactly the
debarment/sanctions/financial-distress statuses G12's third prohibition names with no code
path that refuses; and two skills missing the ABSTAIN mechanism.

6. **F9's five build decisions had no tasks** (new task #36). The sweep decided build-or-prose
and built nothing, per its scope, but only rfp-engine's E4 was tracked. scope-sow-architect
(four structured artifacts, zero generators), negotiation-playbook-learning (now cheap
because O4 did its arithmetic), rfp-case-manager schemas, legal-negotiation-prep's split, and
the supplier-landscape DOCX were all findings with nowhere to land.

**The lesson, same shape as the slice-contract correction.** An audit that produces findings
and a task list that does not absorb them is how a finding becomes folklore: still true,
still cited in conversation, never scheduled. Producing findings is only half of an audit
item; the other half is making sure something will act on them.

**Net position after this audit:** every finding from tonight now maps to either a completed
fix, a workable task, or a task blocked with the blocker named. Nothing is floating.

### Task #14 DONE, 2026-07-29. C1's last non-held tail closed.

`lilly-brand-assets-1c344a/SKILL.md:1150` carried a SECOND full derivation of the Protection
Score: the same five-severity by four-column deduction table, its own worked micro-example,
and the formula. Two copies of one method is the drift shape E1 and E2 exist to prevent.

**Checked for live drift first: the tables are IDENTICAL**, row for row across all five
severities and all four coverage columns. So this was latent risk, not a current defect, and
the fix is the mirror discipline rather than a correction.

**Applied the E1/E2 pattern**: named `lilly-contract-review-1c344a/references/risk-scoring.md`
as the source of truth, labelled this copy a MIRROR, recorded the verified-identical date,
and stated the change procedure (edit the source, update `deduction_score()` and its tests,
re-sync the mirror in the same commit, say all three moved).

**Also pointed it at the implementation, which is the part C1 was actually about.** The
prose could only ASK for things the kernel now ENFORCES, and the header now says which:
- Hard Stops deduct exactly -15 in every column and refuse anything else. "Never reduced" is
  a code branch, not a reminder.
- A deduction outside its (severity, coverage) range refuses, naming the Rule 7 failure mode.
- BOTH calibration checks RAISE, and the header states why the too-generous direction is the
  more dangerous one.
- The visible calculation table this section demands is returned as DATA (`rows`), so the
  table and the score render from one object and cannot disagree.
- The kernel does not choose the deduction; `risk-scoring.md` step 4 reserves that to
  judgment. Code validates the boundary, the model still rules.
- It is NOT `weighted_score()`, and the header says so, because routing a deduction model
  through a weighted average is the obvious wrong move.

**Every claim in that header verified against the running kernel before committing:**
```
Hard Stop -15 in all four columns .... enforced
reduced Hard Stop .................... refuses
out-of-range deduction ............... refuses
too-harsh calibration ................ raises
too-generous calibration ............. raises
calculation table returned as data ... rows[] with allowed_range, column_used, ...
```
Writing a doc header that asserts behaviour without running it would be the same defect as a
citation that does not resolve.

**C1 status: kernel BUILT and tested (O2), brand-assets prose FIXED (this). The one
remaining tail is vendoring `deduction_score()` into `lilly-contract-review`, which is
BLOCKED by the hold and belongs to the F1 rewire.**

### Task #15 (dangling-pointer sweep) DONE, 2026-07-29. KNOWN_OPEN RETIRED.

The allowlist I created two hours ago is now EMPTY, because everything it excused is fixed
rather than suppressed. That was the completion criterion and it is met.

**PART A: the 145 dead paths. All rewritten, none deleted.**
26 skills pointed at 8 brand-assets reference files that exist nowhere. The content had been
INLINED into `lilly-brand-assets/SKILL.md` (15 `## INLINED:` sections) and the standalone
files removed, leaving every pointer behind.

The fix was a **path rewrite, not a deletion**: each dead path now names the live inlined
section, e.g. `.../references/execution-guardrails.md` becomes `the "## INLINED:
references/execution-guardrails.md" section inside .../SKILL.md`. Verified all 8 targets
exist before rewriting; the script only rewrote paths whose standalone file genuinely does
not exist.

```
files rewritten ....... 23
dead paths replaced ... 145
dead paths remaining .. 0
citation resolver ..... 0 citations do not resolve   (was 153)
```

**PART B: the three A7 failures. Two were REAL, one class was my own check.**

**deal-room was a REAL runtime defect, and my G9 classification of it as "non-breaking
prose" was WRONG.** `deal-room-1c344a/dashboard/` contains ONLY a superseded marker: the
engine moved to `deal-tab-1c344a` on 2026-07-29 (D0). But deal-room's SKILL.md still
instructed the reader to author `dashboard/_parts/data.js` and run
`dashboard/build_deal_artifact.py` **from a directory that had been emptied**. Anyone
following the skill would have hit a missing script. Repointed every reference (7 sites) at
`deal-tab-1c344a/dashboard/`, with a degradation note for when that skill is not installed.

**A second, neater defect inside the first:** the superseded marker asserted "**Nothing
references it**" while the very skill containing it did, in six places. Corrected, and now
true: `grep` for backticked `dashboard/` paths in deal-room returns 0.

**rfp-engine and lilly-brand-assets were A7 FALSE POSITIVES, so I fixed the check, not the
prose.** A7 flagged legitimate references to files that live in ANOTHER skill. A7's job is
the skill's own broken self-references; cross-skill references are A8's, which asserts a
fallback rather than a path. Added an exclusion for paths prefixed with another skill's
directory, with the reason recorded in the code.

Two brand-assets references were genuinely imprecise and were reworded rather than
suppressed: generic kernel EXAMPLES were backticked as if they were this foundation's own
paths, and the theo-color.css token layer is named without saying it ships in each rendering
skill's dashboard tree. **One of those was my own text from the C1 fix an hour earlier**,
which said "`deduction_score()` in `numeric_kernel.py`" without naming the owning skill.

**A small irony worth recording:** my correction note in the superseded marker quoted the old
paths in backticks, which made the smoke test flag the correction itself. Reworded to
describe rather than quote them, with a line in the file explaining why.

**FINAL STATE, all gates:**
```
kernel drift ................ PASS      golden fixture checker .... PASS
numeric kernel 96/96 ........ PASS      invoice engine 26/26 ...... PASS
runtime smoke, 32 skills .... PASS      pro-forma adapter 6/6 ..... PASS
citation resolver ........... PASS (0 unresolved, was 153)
32 skills, 0 failed assertions, KNOWN_OPEN = {}
```

**KNOWN_OPEN's docstring now records why it is empty and what refilling it would require**:
a reason, an owner, a tracking reference, and a PINNED exact failure detail. A suppression
list should be temporary by construction, and this one lasted about two hours.

---

## B8 — guardrail numbering

The plan said "two skills still cite G1-G10 or G1-G11". That understated it.
**27 SKILL.md files** carried a stale range, 57 occurrences, while the live suite
defines through **G12**:

- `## G11: Kernel-Backed Computation (HARD RULE for Kernel-Consuming Skills)`
- `## G12: Claim-Gate, Cite or Abstain (HARD RULE, suite-wide)`

so "G1-G12" is a truthful range, not a bumped number.

A blind find-and-replace would have been wrong here, because two different kinds of
text mention a range and only one of them should move:

| kind | example | action |
|---|---|---|
| LIVE reference | prose asserting which guardrails this skill follows | update to G1-G12 |
| HISTORICAL record | a changelog line recording a past correction | leave it alone |

Rewriting a changelog entry would falsify the record of what the skill used to do.

**Result: 26 skills updated, 48 live references corrected, 4 changelog entries preserved.**

`lilly-contract-review-1c344a` was excluded because it is HELD
(PLATFORM-CONSOLIDATION-TRACKER.md:172). Verified untouched:
`git diff --stat lilly-contract-review-1c344a/` is empty.

## B6 — orphaned dashboard HTML

Eight static HTML files ship inside skills. Six are unreferenced by their own SKILL.md,
which looked like ~12.5 MB of orphans. It is not, and the distinction matters:
**unreferenced by SKILL.md is not the same as orphaned**, because a builder's output
artifact is reached through the builder, not through a prose pointer.

Checking each against its builder's declared output settled it:

| file | verdict |
|---|---|
| `rfx-dashboard.html` | builder default output. CURRENT. |
| `supplier-landscape-PLATFORM.html` | builder default output. CURRENT. |
| `deal-dashboard-v2.html` | builder default output (`build_deal_dashboard.py:209`). CURRENT. |
| `deal-dashboard.html` | **superseded.** Not the builder default, not reproducible. |
| `category-strategy-dashboard{,-DEMO}.html` | builder takes explicit `--out`. UNRESOLVED, left alone. |

The decisive evidence on deal-tab: `deal-dashboard-v2.html` hashes to `6b8b6a1f...`,
which is exactly the byte-identical build the superseded marker had already verified.
So v2 is the current artifact and the non-v2 file is the leftover.

**Nothing was deleted**, per the standing instruction to keep old skill files until the
new package is proven in real use. Instead `_audit/ship_manifest.py` gained a
`SUPERSEDED_ARTIFACTS` category that reports the file as strippable-at-packaging.

It is pinned to an exact sha256, following the same discipline as
`kernel_manifest.KNOWN_EXCEPTIONS`: **the exception is keyed to the exact expected
content, not to the filename.** If the file is ever rebuilt, the pin goes stale and the
tool refuses to count it as strippable rather than stripping the wrong thing. Proven by
tampering:

```
normal:  deal-tab-1c344a/dashboard/deal-dashboard.html  1796 KB  -> counted
tampered: 0 KB | PIN STALE, NOT counted as strippable: expected f49166be74c9, found 3233f79a12f
```

Ship manifest now: 46,508 KB as-is, 10,705 KB dead weight, **35,803 KB after stripping.**

Gates after B6+B8: smoke 32 skills / 0 failures, kernel manifest 15 of 16 + 1 held,
kernel self-test 96/96, fixture check_run 11/11.

## B5 — dead code

Closed with **no deletions**. Full write-up: `_audit/B5-DEAD-CODE-FINDINGS.md`.
Reusable detector added: `_audit/dead_code_sweep.py`.

On B5's actual scope (code the repo marks dead) there was nothing to do: the rfx
functions were already removed and only tombstone comments remain, the `isolated/`
copy is already classified strippable, and the unused vendored kernel functions
**must stay** because trimming them would break the byte-identity `kernel_manifest.py`
enforces.

Sweeping properly turned up **110 shipped-runtime dead JS functions** (plus 37 in build
trees) across category-strategy, deal-tab, rfx-hub and supplier-landscape.

I did not trust that number at first, and was right not to: two earlier versions of the
sweep were wrong in opposite directions, one inflating the count by regex-stripping
`//` comments (which also ate everything after `https://`), one deflating it by reading
tombstone comments as call sites. The premise was then verified directly rather than
assumed. `pvDeepDiveHtml` appears exactly once in the built HTML too, and there is no
dynamic dispatch anywhere in these dashboards, so the sweep's textual test is sound
here. The tool aborts loudly if `window[...]`, `eval(` or `new Function` ever appears.

Nothing was deleted. Removing 110 functions across four UI-bearing dashboards is a batch
UI change and would require regenerating the built HTML, so it is a reviewable change
rather than sweep cleanup. It is dead weight, not a correctness bug.

**Correction to A10 (task #16):** `pvRequestDataCard` no longer exists anywhere in code.
All six repo-wide hits are planning docs still instructing its removal. The other three
named functions are real and still present.

---

## A10 — Landscape seed bugs and dead code

Full write-up with the measured before/after table: `_audit/A10-LANDSCAPE-FINDINGS.md`.

Everything was verified by running the REAL engine (`PVSLE.reflect`) against the REAL
seed, before and after, rather than reasoned about. That harness earned its keep twice:
it caught a bug I had just introduced (calling the render-layer `pvFit5` from inside the
pure `PVSLE` engine closure), and it turned "ESG is mis-shown" into a measurement (ESG is
the only one of 6 risk dimensions no supplier scores).

**Score-scale drift.** Four different things computed the same supplier's fit. The engine
now owns the scale (`PVSLE.fit5`), `pvFit5` delegates to it, and every display site routes
through it. Ordering and banding still run on the raw value, so rounding for display cannot
change who ranks first. The authored `cand.fit` second source is no longer silently
preferred, and disagreements with the computed rollup are surfaced instead of hidden.

**ESG.** Illustrative numbers were injected so ESG "appears as a scored Risk-Assessment
dimension". Worse, the injection MUTATED the shared candidate risk object, which
`pvLandInput` passes by reference and `landscapeHTML()` re-reads on every re-render, so
risk scores changed after the user's first click. Injection removed; ESG now renders as an
assessment-coverage note.

That forced a companion fix: `computeRisk` scored a missing dimension as 0, and risk is
"higher = worse", so removing the injection alone would have credited every supplier with
the best possible ESG result. Weight is now renormalized over scored dimensions only.

Measured: every risk score rose (proving the old behaviour understated risk), rank order
unchanged, and **one classification changes** — ClickHouse 2.33 → 2.50 crosses the 2.5
threshold and becomes a challenger rather than a leader. That is the correct reading.

**Dead code.** Removed `pvVerdictHeaderHtml`, `pvDDSection` (33.9 KB, its own last line
recorded that it returns nothing), `pvCompPositionHtml`, plus `mtile`/`elimN`/`reviewedN`/
`screenedN`/`rfxN`. `pvRequestDataCard`, the fourth name on A10's list, does not exist in
any code file; A10's list needs correcting, not actioning.

**7-vs-9 left open, deliberately.** A10 prescribes a supplier-count funnel. That funnel was
built and then REMOVED at Marc's request ("adds no value"). A10's remedy predates and
contradicts a later owner decision, so I did not reinstate it. The ambiguity is real (field
of 7, plus elimination rows that let a reader total 9). Recommendation recorded: fix it in
the labels, not by re-adding a panel already judged valueless. Needs Marc's call.

Dashboard rebuilt (3.26 MB) and verified to carry the changes. Smoke test 32 skills, 0
failed assertions.

### A10 follow-through (Marc: "use your own judgement")

**7-vs-9 closed at the label, not by reinstating the removed funnel.**

Investigating it properly changed the answer. The two elimination sources mean OPPOSITE
things and were sharing one label:

| source | what it is | inside the evaluated count? |
|---|---|---|
| `elimReal` (`rec.eliminations`) | assessed suppliers carrying a HARD flag | YES |
| `elimIllus` (`P.excludedVendors`) | vendors excluded before assessment | NO |

Both rendered under the single heading "Eliminated before the shortlist", so a reader
could add those rows to "Vendors evaluated" and reach a field size that does not exist.

Worth stating plainly: **for the current seed the ambiguity does not actually appear.**
`nimbus` has no `excludedVendors` and no disqualified supplier, so both sources are empty
and the divider never renders. The count today is unambiguously 7. The defect is latent,
and returns for any project that populates either source.

Fixed structurally so it cannot recur:
- the divider now reads "Eliminated on a hard flag · Included in the N evaluated" OR
  "Excluded before assessment · Not included in the N evaluated", chosen by source;
- the tile note says "assessed field", so the count states what it counts.

The 4-count stat strip stays removed. Marc's decision on it is untouched.

**`pvRequestDataCard` corrected in all five planning documents.** Each carried a live
instruction to remove a function with zero occurrences in any code file. Marking them done
rather than deleting the lines keeps the record of what was asked and what was found:
`MASTER-REMAINING-WORK.md` (2 places), `PROGRAM-MASTER-PLAN.md`, `_audit/OVERNIGHT-QUEUE.md`,
`_audit/UPGRADE-PLAN.md`, `_platform_build/DEEP-DIVE-REDESIGN-SPEC.md`.

Rebuilt (3.26 MB); old label gone, both new labels present. Smoke 32/0, citations 0
unresolved.

---

## A2 — RFx to Deal handoff emitter (BUILT)

`rfx-hub-1c344a/rfx_handoff_emitter.py` + `rfx_handoff_selftest.py`, 28/28.
Write-up: `_audit/A2-HANDOFF-FINDINGS.md`.

A2 called this an unwired half-contract: the consumer (deal-room Phase 1) was wired on
2026-07-25 and the emitter was honestly deferred until rfx-hub existed. It does now.

Deterministic, stdlib-only, Desktop-runnable. The schema is not forked; section C of the
RFx spec owns it and this implements it. `to_deal_room_seed()` projects the handoff into
deal-room's intake shape, which is what turns A2's verify clause into an actual test
rather than a claim.

**Claim-gate:** an uncited commitment is demoted to an OPEN `[CONFIRM ...]` issue, never
asserted as agreed and never dropped. An invariant raises `DroppedFindingError` if the
count entering does not match the count leaving as commitment-or-demotion, so the gate
cannot silently lose a finding.

**Refusals:** no final selection, a TCO that does not reconcile, a component with no
amount (never treated as 0), an unauditable total, a dropped finding. An unresolved
gateConflict is carried into openIssues rather than resolved in either party's favour.

**Finding: one contract value had three spellings.** The TCO tag appears as
`indicative — firm in negotiation` (spec, em dash), `indicative - firm in negotiation`
(canonical doc), and `indicative, firm in negotiation` (deal-room SKILL.md). Any
round-trip equality check would fail against two of three, and the em-dash form breaks
the standing no-em-dash rule. Resolved to the hyphen form, defined once and asserted.
The two disagreeing documents should be corrected to match; recorded rather than changed
unilaterally since both are authoritative.

The self-test caught my own miscount while writing it: T14 expected 5 seeded issues where
4 is right, because a demoted commitment counts once, not twice. Code right, test wrong.

---

## E4 — real XLSX generator for rfp-engine (BUILT)

`rfp-engine-1c344a/rfp_xlsx_generator.py` + `rfp_xlsx_selftest.py`, 39/39.

The gap E4 named was a claim with no implementation: `SKILL.md:292` and the Outputs table
promised a 5-tier dropdown, conditional formatting and a locked structure on
`requirements_matrix.xlsx`, and no code produced any of it. The DOCX sibling already had a
real builder, which is what made this the widest claim-to-code gap in the skill.

The schema is not invented: `references/artifact-schemas.md` sections 3 and 7 own it, down
to the five named hexes. No green, per the status-palette rule.

**Every positive assertion runs against a workbook written to disk and REOPENED**, which is
E4's stated verify clause. Asserting against the in-memory object would only prove the code
did what the code did, not that the features survive into the file, which is exactly where
they get lost.

Refusals: weights not summing to 100 (the kernel's `assert_weight_sum`, G11, not a hand
sum), duplicate `Req_ID`, a value outside a controlled vocabulary, a missing weight, a
package below its row/category minimum, openpyxl absent. A refused build leaves no partial
file (T29).

**Two bugs the self-test caught, both mine:**

1. My colour extraction read `bgColor.rgb or fgColor.rgb`. For a solid `PatternFill` the
   colour is in `fgColor`, and `bgColor` is `'00000000'` — a TRUTHY string — so every rule
   read as black. T8 failed loudly, but the no-green check T9 PASSED VACUOUSLY against an
   empty list. Fixed, and T8a now asserts the list is non-empty so T9 cannot pass on
   emptiness again. A test that passes because it found nothing is worse than no test.
2. My Brief-package sample sliced 12 rows off a Full set, which cuts categories mid-way so
   the weights stopped summing to 100 and the generator correctly refused. The test data
   was wrong, not the code. Brief now gets its own well-formed set, plus T28a asserting
   that same set is REFUSED as a Full package.

Kernel manifest still 15 of 16 + 1 held: the vendored copy was read, never edited.

---

## H3 follow-through — the three claim-gate gaps (CLOSED)

Final: **32 IMPLEMENTED, 0 PARTIAL, 0 ABSENT.** Full write-up appended to
`_audit/H3-CLAIMGATE-FINDINGS.md`.

**Gap 1, drop-do-not-dilute.** Added to the five finding-generating skills, under GLOBAL
OPERATING RULE 3 (one of the two rules G12 says it consolidates) rather than as a bolted-on
section. Adoption 1 -> 7. Deliberately NOT added to all 33 files carrying the shared block:
composition dashboards generate no findings, so the rule has nothing to bite on, and adding
it would be exactly the statistic-improving edit the H3 document argued against.
contract-review is HELD, excluded, verified untouched; it needs the bullet when the hold lifts.

**Gap 2, no code-enforced gate.** Built `supplier-deep-dive/deep_dive_validator.py` (20/20).
It enforces the skill's OWN quoted rules and refuses rather than warns: an uncited
debarment/sanctions/breach/financial-distress assertion, a gating item carrying anything
other than REQUIRES_FORMAL_SCREEN (a PASS there is a fabricated clearance), an unrouted
gating item, a diluted finding, named customers or financials against an empty research log.

It carries negative controls, because a gate that refuses honest abstentions is as useless
as one that refuses nothing. Check ORDER was corrected mid-build: the generic uncited check
fired before the specific ones, so a diluted sanctions claim reported as merely uncited,
telling the reader to add a citation when the right action is to delete the sentence.

**Gap 3 was mostly MY OWN MEASUREMENT ERROR.** Only one of four entries survived:

- `procurement-help-desk` "missing ABSTAIN": FALSE POSITIVE. SKILL.md:138 literally says
  "ABSTAIN rather than fabricate" and the ABSTAIN pattern list did not contain the word
  "abstain". The abstain audit could not detect the word abstain.
- `workflow-map` "missing ABSTAIN": FALSE POSITIVE. It marks unknown stakeholders `[OWNER?]`
  rather than inventing them, which is cite-or-abstain applied to stakeholders.
- `rfx-hub` "missing CITE": closed by its own D4 slice contract, as predicted.
- `deal-tab` "missing CITE": GENUINE, and fixed. Its slice contract now requires a sourceRef
  on every field, matching rfx-hub, whose contract only had it because D4 came later.

Four false negatives, all one mistake: matching WORDING instead of MECHANISM. Plus a fifth
near-miss worth recording, because it is the nastiest kind: my fix for the "abstain" pattern
was written with a corrupted escape and became a literal BACKSPACE character. It matched
nothing, and the audit reported a clean zero rather than erroring. A regex that cannot match
is indistinguishable in the output from a skill that lacks the mechanism.

Conclusion strengthened in the findings doc: this tool's ABSENT results are unreliable in a
specific direction, they UNDER-report. Treat an ABSENT as a prompt to go read the skill,
never as a finding on its own.

---

## #32 — capture-date enforcement in research-table generators (DONE)

H5 found the requirement "stated once, centrally, and enforced nowhere": G12 defines a
cited source as carrying a capture date, and no generator checked for one. Three
generators emit research tables, and all three had the same hole, in three flavours:

| generator | before | after |
|---|---|---|
| `market_rate_generator.py` | `date` checked for KEY PRESENCE only; the dataclass comment literally said "disclosure only, not parsed", so `""` and `"recent"` rendered into the Sources tab as provenance | parsed and enforced, per data point |
| `should_cost_generator.py` | `as_of_date` checked non-empty (so `"TBD"` passed); per-driver `source_date` unchecked entirely | both enforced; the Cost-Driver Assumption Ledger IS a research table |
| `sole_source_generator.py` | no date validation at all | `alternatives[].date` and `research_log[].date` both enforced |

Deterministic by design: it parses the string and consults NO clock. Comparing against
"today" would make a generator's output depend on when it ran, which breaks reproducibility
for no gain.

**The rule was too strict on its first pass, and the skills' own data caught it.**
sole-source's sample uses `"Jul 21, 2026"` and `"Jun 2026"`, and my ISO-only parse refused
them. That was wrong: those ARE real capture dates, just not ISO, and refusing honest
provenance over notation is a worse failure than the one being fixed. Named-month formats
are now accepted.

Slash formats are still refused, deliberately: `03/04/2026` is March 4 or 4 March depending
on the reader, and a date that parses two ways is not provenance either. That line is
principled rather than arbitrary, which is why it is written into the code comment.

Placeholders (`""`, `TBD`, `n/a`, `recent`, `unknown`, `various`, ...) and unparseable junk
are refused, as are impossible dates (`2025-02-30`) and years outside 1990-2100.

The helper is duplicated in the three skills rather than added to `numeric_kernel`. That is
deliberate: the kernel is vendored byte-identical into 16 skills and `lilly-contract-review`
is HELD, so touching it would immediately create the drift `kernel_manifest.py` exists to
prevent. It is a candidate for the kernel when the hold lifts, noted here so the duplication
is a recorded decision and not an accident.

Self-tests: market-rate 24 -> 34, should-cost 23 (unchanged, sample already ISO),
sole-source 83. All carry NEGATIVE CONTROLS asserting valid dates still pass, because a
date check that refuses everything is the easy failure mode.

---

## F9 build 1 of 5 — scope-sow-architect structured artifacts (DONE)

`scope-sow-architect-1c344a/scope_artifacts_generator.py` + self-test, **41/41**.

F9 ranked this first: four structured deliverables, zero generators, and the arithmetic
already in the vendored kernel. All four were hand-assembled, which is the drift case E1/E2
exist to prevent.

Built: `rate_card_and_payment_schedule.xlsx`, `raci_matrix.csv`,
`change_control_log_template.xlsx`, `scope_findings.json`.
NOT built: `Rewritten_SOW.docx`, which F9 classed PROSE and which stays prose. A rewritten
scope is argument and specification, not assembly.

**The score reproduces a published golden.** `references/scope-quality-scoring.md` carries a
worked example stating composite 2.550 -> 51 -> "Moderate gap / Needs Targeted Fixes". The
generator reproduces all three exactly, plus a named per-dimension contribution
(0.15 x 3.5 = 0.525). Reproducing a number someone else wrote down is worth considerably
more than asserting against numbers this code produced itself.

Refusals, each traced to the skill's own rules rather than invented:
- a rate-card row where rate x quantity does not equal the stated total (kernel
  `verify_line_math()`, per row)
- milestones that do not sum to the contract value (kernel `assert_reconciles()`).
  `pass-artifacts.md`: "if it still does not foot, the rewritten SOW carries the same defect
  it was meant to fix; do not ship an unreconciled rewrite"
- a dimension scored above the ceiling its own findings impose (BLOCKING 0.9, HIGH 3.4,
  MEDIUM 4.4, LOW uncapped). Findings drive dimension scores; when score and ledger
  disagree, the ledger wins
- an orphaned RACI deliverable with no open finding naming it. Note the nuance the skill
  actually states: an orphan may EXIST, it may not be silently dropped
- a weight set not summing to 1.0 (kernel `WeightSumError`)

Negative controls throughout: a LOW finding caps nothing, a RESOLVED blocking finding caps
nothing, a score exactly AT its ceiling passes, and a FLAGGED orphan is allowed through.
Without those, a stricter-looking gate would just be a broken one.

The workbook shows its reconciliation as LIVE formulas rather than freezing the check at
build time, so an edit that breaks the footing is visible to the reader, not only to the
generator. A refused build writes no artifacts at all (T38), so a partial set never reaches
anyone.

### F9 build 1 — two design defects corrected (Marc flagged both)

Marc questioned the two design choices I had reported as features. Both were wrong, one
of them badly. Self-test 41 -> **57/57**.

**1. Live formulas were not a check.** openpyxl writes formulas WITHOUT a cached value, so
every footing and reconciliation verdict read as `None` to any programmatic consumer
(`load_workbook(data_only=True)`, pandas, anything that is not Excel). Verified directly.

Worse, my own T34/T35 only asserted the formula STRING existed. They never asserted a check
PASSED, because openpyxl cannot evaluate one. So the workbook's visible verification was
itself unverified.

Fixed by emitting BOTH: a static build-time verdict column that a programmatic reader can
actually read, and the live formula beside it that recomputes if someone edits a rate after
the build. Each covers the other's blind spot. T34a/T34b/T35a now assert exactly this,
including asserting that the formula column IS blank to that reader, which is the reason
the static column has to exist.

**2. "A refused build writes no artifacts" was backwards for this skill.** The rule in
`references/pass-artifacts.md` is scoped precisely: "Payment/rate-card reconciliation in the
REBUILT tables actually foots ... do not ship an unreconciled REWRITE." It forbids shipping
a rebuilt commercial artifact that still does not foot. It does NOT forbid reporting the
defect.

A supplier rate card that does not foot is exactly what this skill exists to CATCH. My
version suppressed `scope_findings.json`, the artifact that documents the very defect, so
the tool went silent precisely when it had found something.

Now split:
- arithmetic failure -> recorded AS A FINDING (`GEN-RC-*`, `GEN-PS-*`, each quoting the
  numbers so a reader can check it); diagnosis and RACI still written; the rebuilt workbook
  withheld with a stated reason
- ledger inconsistency (the caller's score contradicts the caller's own findings) or an
  unflagged orphan -> hard refusal, nothing written, because the input contradicts itself
  and there is no trustworthy diagnosis to produce

That split forced a second correction. Adding a generator-discovered finding would have
capped a dimension the caller had already scored higher, so the run would have died on
`SeverityCapError` and reintroduced the silence. A defect the GENERATOR finds now CLAMPS the
dimension down to its ceiling instead of refusing, since the caller could not have
reconciled against a finding that did not exist yet. A defect the CALLER declared still
refuses. The clamp is visible: `score_as_submitted` sits beside the effective score.

This also put `FOOTING_FAILURE_CAP = 2.4` to work. I had defined it from the scoring doc
and then never used it, which is its own small lesson about constants that look implemented.

---

## F9 build 2 of 5 — negotiation-playbook-learning outcome JSON (DONE)

`outcome_dataset_generator.py` + self-test, **29/29**.

F9 called this "serialization plus assertion, not arithmetic", and that held: the generator
reimplements nothing. `outcome_partition()` and `difficulty_score()` already compute and
validate every figure, including the sum-to-1.0 check, so this counts codes, calls the
kernel and serializes the schema (G11).

`outcome_summary.md` stays prose, per F9.

Refusals: an outcome code outside the eleven, two records sharing a `dedup_key`, a stated
`outcome_distribution` that contradicts its own rows, and the kernel's `PartitionError`.

The dedup refusal matters more than it looks. The schema's own rule is that a repeat capture
is an UPDATE, not a second outcome, "so the same negotiation is never double-counted in any
rate, partition, or difficulty rollup". A duplicate does not corrupt one record, it biases
every acceptance rate the dataset exists to produce.

**The kernel told me the right behaviour for the empty case.** All-NOT_APPLICABLE made
`outcome_partition()` raise, and its message reads: "label this NEEDS_INPUT rather than
reporting zero rates." So both the partition and the difficulty are emitted as NEEDS_INPUT
with the reason stated, never as zeros. Rates of 0.0 would read as "Lilly prevailed on
nothing" and a difficulty of 0 as "this negotiation was easy", when nothing was measured at
all. The catch is narrow: any other `InvalidInputError` still propagates, so this cannot
become a general swallow.

Worth noting what the tests target. The arithmetic is the kernel's and is tested there, so
these 29 assert what a SERIALIZER gets wrong: the wrong enum, a stated total contradicting
its detail rows, a double-counted negotiation, and the zero case. Plus negative controls,
an empty dataset and a correct stated distribution both being legitimate.

---

## A9 — "will these actually be better?" (Marc's question, and a real failure it found)

Marc asked whether this programme will actually produce more accurate, more reliable
skills. Rather than assert it, I checked the assumption the whole effort rests on: **a code
gate only improves anything if the runtime path actually calls it.**

It found a genuine false-complete, and it was mine. `deep_dive_validator.py`, built earlier
today specifically to close H3's "an instruction can be forgotten, an exception cannot" gap,
shipped with **ZERO references in its own SKILL.md.** The file existed; nothing told the
model to run it. The skill would have behaved exactly as it did before, while the tracker
recorded the gap as closed. That is the precise shape of the integrate-or-don't-ship failure.

18 of 19 generators were correctly wired. One was not, and it was the newest.

**Fixed twice over.** The validator is now wired into supplier-deep-dive as a HARD RULE step
before delivery. And a new smoke-test assertion makes the class of failure permanent:

```
A9  every shipped generator is referenced by its own SKILL.md
```

A9 caught this before the fix and passes after. Its own limits are written into the code:
presence in SKILL.md proves the model can FIND the generator, not that it runs it at the
right moment. That is the strongest thing checkable statically, and it should not be
mistaken for proof of runtime behaviour.

Suite now 32 skills, 0 failed assertions, across 9 assertions each.

---

## #30 — THE BLIND BASELINE EXISTS. It is red, and that is the point.

Two independent blind agents, one per mode, each given only a verified quarantine (six
documents + the skill, no answer key, banners stripped) and told not to search outside it.
Neither had seen the key. Runs recorded in `_audit/golden-fixture/runs/`.

**Both runs FAIL the fixture.** That is a real result, not a setup error: the fixture was
built to catch specific failures and it caught them.

### What the skill got right

- **All 5 planted Hard Stops found by BOTH runs** (HS-1 8.1, HS-2 7.1, HS-3 9.1,
  HS-5 6.5, HS-6 12.1). Detection of the headline violations is genuinely working.
- **The HS-4 trap was avoided by both.** Neither raised "no adverse-event clause" as a Hard
  Stop. The full-review agent explicitly reasoned it out: the MSA already covers it. That is
  the Rule 9 defect the fixture was built to catch, and the skill did not fall for it.
- **Full review produced Protection Score 0, Critical band, with the Rule 12 calculation
  table present.** Exactly as the key requires.

### Defect 1: the output-mode defect is CONFIRMED, blind

Redline-only produced **no Protection Score, no band, and no Rule 12 calculation table.**
The agent read the mode-emission matrix and reported plainly that the mode emits only the
marked-up document, then recorded nulls rather than computing a score to fill the field.

This is the F1 defect, confirmed by an actor who did not know it was being looked for, in
the mode that is the DEFAULT. Rule 12 says a score without its calculation table is invalid;
redline-only gives neither. Item #19 is no longer a suspicion.

### Defect 2: absence detection is broken in BOTH modes

**Neither run produced an adverse-event finding at all.** The key's failure mode 1: "No AE
finding at all means absence detection is broken."

The full-review agent's own words are the diagnosis: it dropped AE reporting "which the MSA
already covers per Rule 5/9". It treated governed-and-covered as a reason to say NOTHING,
when the required behaviour is a LOW finding in the Governed:Covered column. The skill
avoided the false-positive trap by falling into the silent-omission one beside it.

That is a subtle and valuable find. Avoiding HS-4 and reporting AE-ABSENT as LOW/covered are
not alternatives; the fixture demands both.

### Defect 3: Hard Stop over-escalation, both modes

Expected 5, got 7 in both. Both escalated **D-6** (WO 6.4, human-authored notes reclassified
as Usage Data) to Hard Stop; it is planted as a DATA-PROTECTION finding. Both also escalated
**P-2** (WO 4.4, 50% advance payment) to Hard Stop; it is planted as a PLAYBOOK position.

Both are real findings, correctly located and correctly reasoned. The defect is severity
calibration, not detection: inflating the Hard Stop count changes the escalation path and
the Protection Score, so it is not cosmetic.

The full-review agent also contradicted itself, reporting 6 Hard Stops in its summary while
its own JSON carried 7.

### Defect 4: arithmetic coverage is half of the minimum

Both runs mapped to **4 arithmetic findings against a required minimum of 8.** Both caught
the headline "the fee table does not foot" and the rate-card overcharge, and both missed
A-4, A-5 and A-6, the ones needing a cross-reference to the rate card rather than a
column sum. Redline additionally missed A-3.

Note what this means for F4/F5's per-line batching: the failure is not the arithmetic, it is
that a per-line sweep never happened for several lines.

### Honest limits of this baseline

- Mapping run findings onto answer-key IDs is judgment, and I did it having read the key.
  The protocol permits a reviewing agent to do the bookkeeping; mapping cannot invent a
  finding, but a stricter or looser mapper would move the counts by one or two.
- Both runs were Sonnet subagents, not Claude Desktop. Same skill files, different harness.
- `S-1`, `S-2`, `V-2` and the `N-*` missing-document rows were not mapped confidently and
  are recorded as not-found, which may understate the runs.

---

## The four fixes, VERIFIED by blind re-run

Two fresh blind agents, fresh quarantine carrying the fixed skill, same protocol. Neither
had seen the answer key or the earlier runs. Runs recorded as `*-POSTFIX.json`.

| defect | before | after | fixed? |
|---|---|---|---|
| redline-only emits no Protection Score | `null` / `null` / table `false` | **0 / Critical / table TRUE** | YES |
| absence detection (AE) silently omitted | 0 AE findings in BOTH modes | **AE reported LOW, `Governed: Covered`, in BOTH** | YES |
| Hard Stop over-escalation | 7 vs expected 5, both modes | **exactly 5, both modes, each pinned to its playbook entry** | YES |
| arithmetic coverage | 4 mapped | **6 mapped, 6 of 6 priced rows verified** | PARTLY |

Problem count fell from 15 to 8 (redline) and 14 to 9 (full review).

**The two modes now agree.** Before the fix they disagreed on the Hard Stop count and on the
severity of WO 4.4. Now both report 5 Hard Stops, the same score, and the same band. Mode
consistency was not a stated goal; it fell out of fixing the matrix and closing the Hard
Stop list, which suggests those were the right root causes rather than patches.

**Still FAIL, on DIFFERENT defects.** A-4, A-5 (arithmetic needing a rate-card
cross-reference), D-4 and D-5 (two further findings at WO 6.4 beyond the one both runs
caught), V-2, S-1 and S-2. The fixture is doing its job: it now surfaces the next layer
rather than the one just closed. Arithmetic reached 6 against a minimum of 8, so fix 4
improved coverage without closing it.

### A contamination risk both agents found, unprompted

`references/risk-scoring.md` carries a "Worked Example: **Supplier A WO 10**", the same name
as the fixture's document under review. Both agents flagged it and both declined to adopt
its numbers, deriving 5 Hard Stops and a score of 0 against the example's 0 and 64.

It is a NAME collision, not a content leak: the example's findings (missing volume period,
Insight Sessions, June 15 deadline) do not overlap a single planted defect.

**It also cannot explain the improvement, because it is a controlled constant.** That file
was present, unchanged, in the pre-fix runs, which produced no AE finding at all. The
variable that changed between the two rounds is the skill's rules. That is the strongest
statement available here about causation, and it is worth stating precisely rather than
claiming the runs prove more than they do.

Still worth removing the collision: rename the fixture's document so no future run has to
reason about it. Recorded, not done, since renaming touches the fixture and its answer key.

---

## CORRECTION: I over-reported the failure. Most of it was my mapping, not the skill.

Before troubleshooting the skill further I checked whether the remaining failures were real,
because I had flagged in the baseline that I mapped `S-1`, `S-2` and `V-2` as not-found
"not confidently". That caveat turned out to be the main story.

Re-checking each remaining item against the run outputs:

| item | I recorded | actually |
|---|---|---|
| A-4 NTE exceeded | not found | **found by both**, explicitly: stated total $685,000 exceeds the WO's own NTE |
| A-5 rate-card overage | not found | **found by both**: Senior Data Engineer billed $235 against the card's $210 |
| S-1 Exhibit E missing | not found | **found by both**, and by the redline run as a HIGH |
| V-2 responsibility shifting | not found | **found by both** (WO 2.3/2.4, SMEs at 10 hrs/week plus the delay consequence) |
| D-4 Controller status, D-5 secondary use | not found | **substantively present**, but BUNDLED into one 6.4 finding rather than raised as three |
| S-2 SOC 2 Type II state | not found | **genuine miss.** The only SOC 2 mention sits inside an audit-rights covered-absence finding, not as an outstanding-evidence finding |

**Corrected verdict: 1 problem (redline-only), 2 problems (full review).** Down from the 8
and 9 I reported. The arithmetic-minimum failure also disappears once A-3 through A-6 are
credited: the runs produce 8, which is the required minimum.

The genuine remaining defects are:
- **S-2, both modes.** SPS:9.2 requires SOC 2 Type II; its "Awaiting" state is not flagged
  as outstanding compliance evidence. A real gap in absence-of-evidence detection, distinct
  from the Rule 9a absence-of-clause detection now working.
- **V-5, full review only.** Retroactive commencement (work started 19 days before
  signature). The redline run caught it; the full review dropped it, having reasoned it did
  not survive citation-checking.
- **D-4/D-5 bundling**, which is a judgment call rather than a clear defect: three planted
  findings at WO 6.4 arrive as one. Substantively the Controller assertion and the
  secondary-use carve-out are both named as grounds. It matters only if three findings at
  one clause should produce three separate remediation asks, which is arguable.

**The lesson is about the measurement, not the skill.** I mapped conservatively, marked
anything I had not verified as not-found, and then reported the resulting count as the
skill's failure. Conservative mapping is not neutral: it manufactures failures, and I
presented those numbers with more confidence than the method supported. The fixture is only
as good as the mapping, and the mapping is the least rigorous part of this apparatus.

Worth doing: make `check_run.py` accept evidence per claimed ID (the finding text that
justifies the mapping), so a mapping is auditable rather than asserted. Recorded, not built.

---

## Mapping-evidence check + S-2 fix

**1. `check_run.py` now audits the mapping, not just the run.** `found` accepts either bare
IDs (legacy, still parses) or `{"id": ..., "evidence": ...}` carrying the run's own text
that justifies the claim. Unevidenced claims WARN by default and FAIL under
`--require-evidence`, which is what any run whose numbers get quoted should use.

The rationale is written into the function, because it is the mistake this apparatus
actually made: four IDs were recorded as not-found that both runs had reported, and the
inflated failure count was then presented as the skill's result. **Conservative mapping is
not neutral. It manufactures failures, invisibly**, because a bare ID list carries no trace
of whether a mapping was checked or assumed.

What it does NOT do, stated in the docstring so nobody over-trusts it: requiring evidence
does not make a mapping correct. Only a reader comparing evidence against the answer key can
do that. It makes an unchecked claim visible instead of silent, in both directions.

Five self-test cases lock the behaviour, including that a blank evidence string does not
count and that evidence does not excuse a genuinely missing ID. Self-test 11 -> **16/16**.

**2. S-2 fixed by a new Rule 9b, and it is a different shape from 9a.** Rule 9a catches a
missing CLAUSE. S-2 is the opposite: the clause is present and correct, and the ARTIFACT it
requires was never delivered. `SPS:9.2` obliges the supplier to provide a SOC 2 Type II
report annually; no report is in the set.

Rule 9b requires a Compliance Evidence Register over the governing set's own obligations,
each artifact recorded as **Provided / Awaiting / Not required**, with "Awaiting" being a
FINDING rather than a status line.

The rule names the trap that made this hard to see: the MSA and the SPS both DISCUSS SOC 2,
so a keyword check finds text and concludes the topic is handled. The question is not
whether SOC 2 is mentioned, it is whether the report was delivered. The clause is the
promise; the artifact is the protection.

Scoped deliberately: only obligations the governing documents themselves impose, so the rule
cannot invent evidence requirements.

Verification in flight: a fresh blind agent against a rebuilt quarantine, asked for a
compliance evidence register alongside the findings.

### Both fixes VERIFIED blind. One problem left in the whole fixture.

A fresh blind agent against a rebuilt quarantine, scored under `--require-evidence`, so
every claimed ID carries the run's own text.

**S-2 is fixed.** The run produced a Compliance Evidence Register and recorded
**SOC 2 Type II | SPS §9.2 | Awaiting**. `compliance_evidence 1/1`.

It also discriminated rather than flagging everything, which is the behaviour that makes the
rule useful instead of noisy: two other artifacts were marked **Not required** with reasons
(deletion certification, "no cessation yet"; PI return/destruction, "pre-termination"). A
register that marks everything Awaiting would be as useless as no register.

Scorecard, all groups green except one:

```
MAPPING PROVENANCE  claimed 35, with evidence 35, without 0
hard_stops 5/5   absence_detection 1/1   arithmetic 8/8   playbook 9/9
data_protection 6/6   compliance_evidence 1/1   missing_documents 1/1
HS-4 correctly NOT raised   AE present LOW/covered   score 0 Critical   Rule 12 table present
VERDICT: FAIL, 1 problem  ->  vendor_tactics: V-5 not found
```

From 15 problems at baseline to **1**.

**The evidence requirement immediately caught a bug in my own mapping.** My extraction
regex for A-6 was `per-?day`, and the run's text says "per day" with a space, so it did not
match. Because the mechanism forces a claim to carry evidence, I could not quietly assert
A-6; I had to look, and looking showed the run HAD found it. Under the old bare-ID method I
would have either dropped it silently (another manufactured failure) or claimed it on
recollection. A one-character regex gap, surfaced in a single check.

That is the point of the mechanism, and it is worth being precise about what it did: it did
not detect the error, it made the error impossible to skip.

**V-5 is the one genuine remaining miss**: retroactive commencement, work starting 19 days
before signature. The full review drops it, having judged it did not survive
citation-checking. The redline-only run catches it. So it is not a capability gap, it is a
mode-dependent judgment call, and it is the only thing between this fixture and green.

---

## V-5 — the rule existed, its SCOPE did not reach

The full review dropped retroactive commencement as "not surviving citation-checking", and
it was right to. `vendor-tactics.md` Category 11 opened with *"Some CHANGE ORDERS attempt to
bypass or circumvent formal procurement governance"*, and every bullet under it said change
order. WO-10 is a Work Order. A strict reviewer looked for a citable rule, found one that
did not reach the document in front of it, and declined to stretch it.

That is a scope gap in the rule, not a model failure, and it is worth separating the two:
the redline-only run DID flag it, which means the difference between the modes was
willingness to extend a rule past its stated scope. Rewarding that would be rewarding the
looser reviewer.

Category 11 now opens with an explicit scope line covering any instrument requiring a Lilly
signature (Work Orders, SOWs, order forms, amendments, change orders), and the
work-started-before-approval bullet instructs a direct date comparison on every instrument,
quoting both dates and the gap in days. Verification in flight.

## F9 build 3 of 5 — rfp-case-manager state schemas (DONE)

`case_state_generator.py` + self-test, **32/32**.

F9's reason for building this one is the strongest of the five: this skill is the suite's
STATE OWNER. Every other skill reads what it writes, so a malformed case file does not fail
here, it fails later as another skill's wrong answer. That is the worst possible place for
hand-assembly.

Built: `_case_file.json`, `team_binding.json`, `rfx_project_acknowledged.json`,
`meeting_log.csv`. Meeting drafts, comms and status snapshots stay prose per F9.

**The case_id preservation rule is the one that earns the build.** SKILL.md says a case_id
is generated here OR preserved as-is from an inbound handoff, including when it arrives in
rfp-engine's different format. Regenerating it on ingest forks one sourcing event into two
records, and every skill keyed to the discarded id then points at a case that stops
accumulating history. **It is data loss that looks like a successful import.** The generator
refuses to choose between a conflicting pair rather than silently picking one, and
re-ingesting the SAME handoff is idempotent rather than a conflict.

Two refusals worth noting because they are about ABSENCE carrying meaning:
- it refuses to write `team_binding.json` for an unbound case
- it refuses to write `rfx_project_acknowledged.json` recording a non-acknowledgement

In both, the file's PRESENCE is the signal. SKILL.md skips Step 0a on any run where the
acknowledgement file is FOUND, so a file saying `false` would skip the very step it was
meant to gate. A present-but-false file reads as a decision made; an absent file reads as a
decision still open.

Also refuses: enum violations on status / current_phase / role / meeting status, an
unimplemented schema_version, duplicate supplier or event ids, and a Closed case still in an
active phase.

---

## V-5 verified, and the run exposed a defect in MY OWN FIX

**V-5 is fixed.** The blind run reports "services commenced 19 days before signature
(approval manipulation)". Broadening Category 11's scope worked.

**But the same run went from 5 Hard Stops back to 6, and the agent was RIGHT.** It raised a
96-hour breach-notification window as a Hard Stop and noted, accurately, that it could find
no `playbook.md` entry number for it.

`references/dpa-review-checklist.md:48` states: *"Hard Stop: Breach notification timeline >
72 hours. Escalate to Legal AIPC."* The WO has 96 hours. It IS a Hard Stop under the skill's
own rules.

My Fix 3 said a finding is a Hard Stop "if and only if it matches an entry in
`references/playbook.md`". That was wrong: Hard Stops live in at least two reference files.
The rule put a careful reviewer in an impossible position, forcing a choice between dropping
a true finding and breaking a stated rule. It did the best available thing, raising it and
flagging the missing entry.

**A rule that forces a true finding to be dropped is a worse defect than the
over-escalation it was written to prevent.** Corrected: the closed list now names both
files, and instructs that a Hard Stop whose entry lives in neither should be raised AND
called out rather than silently downgraded.

**Open question for Marc, genuinely unresolvable here.** The fixture's answer key expects
5 Hard Stops and classes the 96-hour window as a data-protection finding (D-1). The skill's
`dpa-review-checklist.md:48` says it is a Hard Stop. Both cannot be right. Either the answer
key undercounts or the checklist overstates, and which one is correct is a question about
Lilly's actual policy, not about this code.

**Second, smaller issue: my arithmetic metric was ambiguous.** The run reported "2 of 6
priced rows verified", meaning two rows PASSED, where earlier runs reported 6 of 6 meaning
six were CHECKED. Both were honest; the metric was not. SKILL.md now asks for three numbers,
exists / checked / passed, and warns that reporting passed as checked reads as four skipped
rows when it may mean four rows checked and found wrong, which is the opposite of a gap.

## F9 build 4 of 5 — legal-negotiation-prep briefing skeleton (DONE)

`briefing_skeleton_generator.py` + self-test, **33/33**.

The F9 split, implemented literally: code builds the Position Map, the tier tables, the
counts, the totals and the BINDING markers; the model writes the Executive Summary, Leverage
Map, Fallback Sequencing and Predicted Supplier Pushback, into `[PROSE: ...]` placeholders
that name what belongs there so an unfilled briefing is obviously unfinished.

The generator re-derives no tiering. `tier_kernel.assign_tier` decides, and this lays out
the result including the kernel's own trace (G11).

**Its central refusal: a BINDING tier cannot be softened on the way into the document.** If
the incoming position claims a different tier than the kernel assigned, it raises. A briefing
showing a Lilly non-negotiable as tradeable hands the negotiator a position Lilly never
agreed to hold.

Writing the test corrected an assumption of mine: `binding=True` covers the whole
DETERMINISTIC path (source `playbook` or `msa`), not just Tier 1 RED LINE. I had assumed
only Tier 1 was binding, and the test failed until I checked the kernel instead of guessing.
The non-binding negative control now has to be constructed by removing a required input.

---

## F9 build 5 of 5 — supplier-landscape report + CSVs (DONE). #36 COMPLETE.

`landscape_report_generator.py` + self-test, **40/40**.

F9 called this the highest-value build and genuinely large. It replaces the three-pass
open/append/save instruction at the old `SKILL.md:627-634`, the same pattern F2 removed from
rfp-response-analysis and deferred here by name.

**Not fixed the way F2 was, deliberately.** Collapsing three appends into one model-authored
write is the truncation failure G10 warns about: a long document silently comes out short
and looks finished. Because the generator ASSEMBLES the document rather than writing it,
length stops being a generation-time risk at all, whatever the supplier count.

**All five CSVs come from the same call as the report** (the F6 lesson). Emitting them
separately is how a report and its own appendix disagree, and a reader who notices cannot
tell which is wrong. `check_artifact_consistency` refuses when a supplier appears in one
artifact and not another.

**The two scoring systems are enforced apart**, per SKILL.md:381: requirements-fit
(requirement-count-weighted, 0-10) feeds the dashboard headline and lives in
`requirements_fit_matrix.csv`; the 8-pillar percentage-weighted matrix is a report table
only. Writing one into the other's artifact yields a figure that is individually correct and
completely wrong in context.

### Two bugs found by READING, before the shell came back

The shell was unavailable for a stretch, so I reviewed the code instead of waiting. That
found the more serious of the two:

1. **`weighted_score()` refuses any weight set not summing to 1.0**, and the 8 pillars are
   stated as PERCENTAGES summing to 100. `compute_pillar_matrix` would have raised on every
   valid input, the base case rather than an edge case. Worse, test T20 ("refuses weights
   summing to 95") would have PASSED FOR THE WRONG REASON and masked it.

   Fixed by validating the percentage set on its own scale with
   `assert_weight_sum(expected=100.0)`, which names the over- or under-allocation, then
   converting to fractions for scoring. Both steps are needed: raw percentages raise on
   everything valid, and converting without validating would silently score a 95-point set
   as though it footed.

2. A dead `weights` variable in `compute_requirements_fit`, unused because partial evidence
   requires per-supplier reweighting. Same class as B5 and the unused `FOOTING_FAILURE_CAP`.

Then 40/40 on the first execution. Worth noting what that does and does not show: reading
caught a convention error and dead code, which is what reading is good for. It would not
have caught an execution-order or state bug, and those are what the other four builds
actually failed on.

### Absence is stated, not left blank

- a supplier with no evidence scores `Information Not Provided`, never `0.0`, because a zero
  ranks them last on merit when nothing was measured
- a PARTIAL gap reweights across what IS evidenced rather than scoring the gap as zero
- an empty exclusion list still writes a "none excluded" row, because an empty file is
  indistinguishable from a step that never ran, and that file exists to make the shortlist
  defensible
- a blank `evidence_source` on a risk row is refused; "Not Determined" is the honest answer

**#36 is complete: all five F9 builds are done.**

---

## ANSWER KEY CORRECTED: the Hard Stop count is 6, not 5

Marc asked which source was right. The evidence settles it against the key:

- `MSA:81` and `SPS:62` both require notification within **72 hours** of becoming aware
- `WO-10:88` sets **96 hours**
- `dpa-review-checklist.md:43` sits under a column headed **"Hard Stop If"**, and line 48
  restates it: *"Hard Stop: Breach notification timeline > 72 hours."*
- the checklist distinguishes deliberately: section 3 uses "Hard Stop If", section 4 uses
  "Flag If"

And the decisive point: **the key's own D-1 row cited `dpa-review-checklist.md:43` as its
basis** while excluding D-1 from the Hard Stop count. It was citing a Hard Stop rule and
then not counting it.

Applied: `hard_stop_count` 5 -> 6, deduction total -75 -> -90, D-1 listed in `hard_stops`
as dual-classified, and `_perfect_run` in check_run.py updated to match (the fixture's own
self-test failed 12/16 until it did, which is the check working).

**The HS-4 negative control had to be reworded.** It previously read that raising HS-4
"inflates the Hard Stop count to six". Six is now correct, so the control tests WHICH six,
not how many. A run reaching six via HS-4 is still wrong; via D-1 it is right.

**A second defect in that clause, previously unrecorded.** The MSA triggers at "becoming
aware"; the WO triggers at "confirming the incident". A supplier can defer confirmation
indefinitely, so the clock need never start. That may matter more than the 24 extra hours.
Added to D-1's expected text.

### Re-scoring every recorded run

| run | hard stops | against the corrected key |
|---|---|---|
| baseline redline-only | 7 | over by one (P-2 wrongly escalated); D-1 was RIGHT |
| baseline full-review | 7 | same |
| POSTFIX (both modes) | 5 | **under by one, caused by my own fix** |
| RULE9B | 5 | same |
| FINAL (after the closed-list correction) | **6** | correct |

Worth owning plainly: **my Fix 3 caused the under-count.** It declared Hard Stops to come
from `playbook.md` alone, so the post-fix runs dutifully demoted a real Hard Stop to HIGH.
The original runs had D-1 right and P-2 wrong; my fix corrected P-2 and broke D-1. Only
after the closed-list rule was corrected to name both files did a run get both right.

### The FINAL run, scored under --require-evidence

```
MAPPING PROVENANCE  claimed 34, with evidence 34, without 0
hard_stops 6/6   absence_detection 1/1   arithmetic 8/8   vendor_tactics 5/5
compliance_evidence 1/1   missing_documents 1/1
HS-4 correctly NOT raised   AE present LOW/covered   score 0 Critical   Rule 12 table present
VERDICT: FAIL, 2 problems  ->  P-9 not found, D-4 not found
```

**Two problems, from 15 at baseline.** Both are genuine and both are single findings, not
mechanisms: P-9 (SLA degraded to 99.0% quarterly) and D-4 (supplier asserting Controller
status, which this run folded into its Usage Data finding rather than raising separately).
V-5 is now found, which is what this run was built to verify.

---

## K1 — pre-packaging integrity sweep and the `.skill` set (DONE)

`_audit/package_skills.py`. **32 packages, every one verified.**

**The sweep is a GATE, not a report.** Nothing is packaged unless all 13 checks pass first:
the smoke test (A1-A9), the kernel drift manifest, the citation resolver, and every
`*selftest.py` in the tree. A package built over a failing check is worse than no package,
because it ships the defect AND the impression that it was checked. `--force` only shows
what would be built; it still refuses to write.

All 13 passed on the first run, which is what the last several days of work was for.

**Each package is verified by EXTRACT-AND-RETEST**, which is K1's own verify clause
("install from the produced package and re-run one smoke test per skill family"). Testing
the repo tree proves the repo is sound and says nothing about the artifact a user receives.
The two differ precisely because packaging STRIPS files, so a strip rule that removes one
file too many produces a package that passes every repo-side check and fails on the user's
machine. Each `.skill` is therefore extracted into an EMPTY directory and the smoke test is
run against the extraction, mirroring the Desktop install model: one skill folder, no
siblings, no suite root, no repo.

Result: 32 of 32 extracted and passed.

```
32 package(s), 21,098 KB total, 23 file(s)/dir(s) stripped
```

`lilly-procurement-kernels-1c344a` is correctly NOT packaged: it has no SKILL.md and is not
installable. That ruling was made earlier in this programme and the packager enforces it
rather than restating it.

The superseded-artifact strip stays pinned to its exact sha256, so a rebuilt file ships
rather than being removed on a stale pin.

Combined deliverable written to Downloads, as item 14 asked:
`Lilly_Procurement_Skills_2026-07-29.zip`, 21,095 KB, sha256 5570b5b5...

`_package/` is gitignored: build artifacts, reproducible from the script, not source.

## K2 — Desktop delivery folder refreshed (DONE)

`C:\Users\marcs\OneDrive\Desktop\Lilly_Procurement_Skills_v10_6_6_Bundle_2026-07-29.zip`
21,601,741 bytes, sha256 5570b5b5..., byte-identical to the Downloads copy, zip integrity
verified, 32 `.skill` packages + the manifest.

**Naming, deliberately.** The Desktop's latest was `v10_6_4_Bundle.zip`, two behind: the
suite itself claims **v10.6.6** (98 SKILL.md references). This bundle is labelled v10.6.6
with a date stamp rather than bumped to a new version number, because **deciding the release
version is not mine to make**. It is honestly the v10.6.6 suite as it stands on 2026-07-29,
including this programme's fixes. If those changes warrant 10.6.7 or 10.7.0, say so and it
can be relabelled; inventing the number would have put a version identity into a delivery
folder on no authority.

Remaining K2 sub-items from `MASTER-REMAINING-WORK.md:421-422` NOT done and not claimed:
the dummy-data render per skill for Artifacts review, and doc/deck HTML previews for the
four non-dashboard skills. Both are review aids rather than packaging, and item 17 in
particular wants a human looking at the renders.

**#29 is complete for K1 and the delivery refresh.**

## Version: v10.7.0 (Marc's call)

Bumped **88 live declarations across 30 skills** (`suite:` frontmatter, `Suite:` body
blocks, `MERGED PACKAGE (...)` headers).

**Left alone, deliberately: 5 changelog entries and 5 examples.** Changelog lines record
what a PAST release did, and rewriting them falsifies history, the same rule applied to the
B8 guardrail ranges. The examples are a JSON schema sample and its own warning text about
hardcoding a suite stamp: bumping one without the other would desynchronise the warning
from the thing it warns about. One `suite: v10.6.6` remains and is correct, inside a
changelog line recording a past version-stamp reconciliation.

Rebuilt and re-verified: 32 packages, all extract-and-retest green.

Delivered as `Lilly_Procurement_Skills_v10_7_0_Bundle_2026-07-29.zip`, 21,095 KB,
sha256 571c4896..., byte-identical in Downloads and the Desktop delivery folder. The two
mislabelled cuts from before the decision were removed rather than left beside it.

---

## A11 attempted: the lock is NOT executable, but its sweep found a real shipping defect

**A11 cannot be completed, and my recommendation to approve it first was wrong.** A11 is
"lock all five hubs". A7 describes the My Work hub as "the last unbuilt Phase 1 hub", and it
does not exist: four of five hub skills are present, `my-work` is absent. You cannot lock
five hubs when one has not been built. I under-read A11's dependency list (A1, A3-A5,
A7-A10) when I called it "a sign-off, not a build". A5-A9 are substantial builds, not
sign-offs.

A11's OTHER half was executable and is done: `_audit/malicious_code_sweep.py`.

### The sweep, after two rounds of correcting my own calibration

First run: 411 INJECTION hits, nearly all English prose. The pattern
`(SELECT|INSERT|UPDATE|DELETE)\s+.*\+\s*\w+` matched the comment "assumptions: live update
+ recalc". **A sweep with 411 false positives is worse than none, because nobody reads it.**
Patterns now require a real SQL shape. It also crashed on a non-cp1252 character and was
scanning minified React bundles that ship in nothing.

Second: the dependency list filled with "the", "these", "should", "narrative", because a
regex over `^\s*(from|import)\s+(\w+)` matched prose in docstrings. Replaced with the AST,
which cannot make that mistake. A dependency audit reporting English words as packages
trains its reader to skim, which is exactly how a real typosquat gets through.

Final: **SECRETS 0, BYPASS 0, OBFUSCATION 0, INJECTION 0.** EGRESS 1 and EXEC 23, all
reviewed and all benign: the EGRESS hit is the word "fetch" in a comment about a
hypothetical, and every EXEC hit is `re.compile` or a JS regex `.exec()`, not code
execution. No Python file in the suite imports any network library at all.

### The real find: a shipped script broken by its own packaging

`category-strategy` and `deal-tab` each ship `build_dashboard_*.py`, which does
`sys.path.insert(0, PLATFORM)` and imports from `_platform_build/`. The packager STRIPPED
`_platform_build/` as dead weight. **Both packages shipped a builder that could not import.**

Extract-and-retest did not catch it, and that is the lesson: the smoke test LOADS a skill,
it does not EXECUTE its build scripts. A script broken by stripping passes every check and
fails the first time a user runs it.

The strip rationale was sound in isolation ("the shipped artifact is the built HTML, the
builder is not needed"). The error was stripping the dependency while keeping the dependent.

Fixed generally, not per-skill:
- `dirs_still_depended_on()` makes the strip conditional. A dead-weight dir referenced by
  any shipped `.py` outside it is kept.
- `check_strip_consistency()` refuses any package that ships code referencing something the
  strip removed, so this class cannot recur silently.

Both fired on exactly the two skills before the fix and pass after. Packages 21,098 -> 25,649
KB, which is the cost of shipping a builder that actually runs.

---

## I1-I3: not actionable, and I overstated the risk

I called the help desk "the only live honesty risk" and recommended deciding it first. On
inspection that was wrong, and the correction matters more than the recommendation did.

**The skill is already honest about its degraded state**, in three places:
- `SKILL.md:136` "VENDORED SNAPSHOT STATUS: NOT YET HARVESTED ... say so plainly rather
  than answering from memory of what BuyLilly 'probably' says"
- `SKILL.md:138` "ABSTAIN rather than fabricate"
- the placeholder itself: "contains NO Lilly content ... Do NOT fill this in from memory,
  inference, or a guess. Every fact must come from an actual page read ... with the source
  URL and the date"

It is also correctly marked **PENDING** in the launcher registry with "content build
network-gated", so it is not silently routable.

This is the SAME skill my H3 audit wrongly flagged as missing ABSTAIN, because the pattern
list did not contain the word "abstain". I have now under-read this skill's honesty twice.

Per item:
- **I1** is a decision whose recorded state is already "leave help-desk AS-IS for now,
  finalize at Phase 3/WS6" (`PROGRAM-MASTER-PLAN.md:172`). Executing a merge now would
  reverse a recorded decision.
- **I2** is genuinely network-blocked. It requires real page reads from inside Lilly's
  tenant, and the skill's own placeholder forbids filling it any other way. I cannot do it
  and should not simulate it.
- **I3** depends on I2.

**Nothing to do here. The gap is real, documented, and correctly gated.**

## WS H triaged: 1 closed, 2 done, 4 open, 1 sequenced

Full classification in `_audit/WS-H-TRIAGE.md`, measured against the tree rather than argued.

- **H8 CLOSED** by this programme: `deep_dive_validator.py` enforces the supplier-risk
  anti-fabrication rules in code, and A9 forced it to be wired rather than merely present.
- **H6 (29/32) and H7 (30/32) effectively done.** Confirm the stragglers, do not rebuild.
- **H1 (17/32), H2 (30 bespoke ladders), H10 (1 adopter) genuinely open.**
- **H4 (6/32) is the real project**, and it is the correct blocker for #31.
- **H9 sequenced** behind H2, since there is no canonical ladder to reconcile against yet.

Two findings worth keeping:

**H10 is much smaller than "adopt beyond deal-room" implies.** The canonical contract names
its intended consumers: deal-room, the two negotiation-prep skills, rfx-hub. Three
non-adopters, not thirty-one. A suite-wide rollout is not what the source asks for, and
adopting a methodology where it has nothing to bite on is the statistic-improving edit the
H3 document argued against.

**H4 deserves a decision, not a schedule.** Per-fact provenance is a data-model change
across the suite. The other four open items are a contained piece of work; this one is not,
and bundling it with them would hide that.

Unlike the A11 dependency audit, where 10 of 19 citations proved spurious, WS H did not
dissolve. Most of it is real.

---

## H2, H1, H9 — done, in that order

Note on sequencing: the plan says **H2 depends on H1**; my triage argued the reverse, that a
detection step reporting into thirty bespoke ladders is half a mechanism. Both landed in one
pass so the disagreement is moot, but the plan's order was the other way and I should not
pretend otherwise.

### H2 — G13, The Source Ladder

Five rungs, one wording, inlined where the other guardrails live:
live authoritative read -> vendored snapshot -> user-provided document -> general principle
(not Lilly-verified) -> abstain. Every fact carries its rung.

Four rules of use, each aimed at a specific failure: never silently PROMOTE a rung (the
reader's trust is calibrated to the label); descend and SAY you descended (the descent is
itself information about what the run could see); label per FACT not per document (so a
rung-1 figure beside a rung-4 one stays distinguishable); and never lower the floor to avoid
rung 5.

The rationale is recorded because it is the whole point: three sensible ladders already
existed (help-desk, process-navigator, evaluation-engine). Individually fine, together they
meant a reader could not learn the convention once and trust it.

G13 is explicitly separated from G12: **G12 decides whether a claim may be made at all,
G13 decides how a claim that IS made must be labelled.** A citation to a snapshot and a
citation to a live read are both "cited" and are not equally strong.

### H9 — the G7 floor rule, which had no answer at all

G7 covered THIN research ("RESEARCH PENDING: N of minimum"). It said nothing about search
being UNAVAILABLE, which left three bad defaults available: lower the floor quietly, refuse
the whole run, or produce the figure anyway.

Now stated: produce the deliverable, SUPPRESS the affected band rather than estimating it,
label the section as below the floor with the actual counts, and never lower the floor
silently. `percentile_gate()` in the kernel already does exactly this for percentiles and is
named as the precedent rather than treated as a special case.

Framed as **G13 rung 5 applied to a band rather than a fact**: the band abstains while the
rest of the deliverable proceeds at whatever rung its own sources support.

### H1 — and the finding underneath it

My triage said 17 of 32. That was the wrong metric, measured by searching for words rather
than the mechanism, which is now the fourth time this repo has made that exact error. On
H1's own metric it is 29 of 32.

Three skills (`meeting-prep-brief`, `sole-source-challenge`, `workflow-map`) carry the SHORT
FORM: *"S0 / S1 / S2 / S3 / S4 / S5 as per the shared suite protocol."* They are not missing
the rule, they reference it, which is better than duplicating it.

**Except the thing they reference did not exist.** No canonical definition of the shared
suite protocol lived anywhere in the foundation skill. Three skills pointed at nothing, the
same dangling-pointer class as the 145 dead brand-assets references B7 fixed.

Fixed: **G13a** now carries the canonical S1 text, including the M365 rule ("the connector
CANNOT see Ariba, LEAH, an ERP/AP system"; say so plainly rather than letting an absent
result read as absent data), the stop-and-wait rule, and the link from detection to ladder:
the S1 answer sets the HIGHEST rung available, and every fact is still labelled at the rung
it actually came from, never the best rung theoretically available.

**Exemptions are now recorded rather than assumed**, and one had gone stale: H1's original
list named deal-tab, brand-assets and kernels. `rfx-hub` was created later by A1 and would
have read as an oversight rather than an exemption. It is on the list now, with the reason.

Guardrail range bumped **G1-G12 -> G1-G13** across 48 live references in 26 files, and G13
and G13a both verified present so the range is truthful rather than aspirational.

---

## H10 done. H6 and H7 CONFIRMED COMPLETE, with a finding about my own measuring.

### H10 — applied to exactly two skills, not thirty

Narrower than even my triage said. The canonical document names deal-room (already wired),
the two negotiation-prep skills, and rfx-hub marked **"(future)"**. The plan adds: "Do not
widen further without evidence it fits." So: **two** skills.

Applied to `commercial-negotiation-prep` and `legal-negotiation-prep`, scoped to the one
surface the canonical document names: **predicted supplier pushback**. That surface is the
easiest place in either skill to fabricate, because a plausible supplier objection reads
exactly like a remembered one.

The five steps, with the load-bearing one third: pushback grounded in real correspondence
carries its evidence badge; pushback that is not is labelled an **INFERENCE, in those
words**, never a fabricated quote and never a paraphrase that reads like one. Cited and
inferred objections must be visually distinguishable rather than sitting in one list looking
alike. A contradiction between supplier statements is flagged, never silently resolved.

Not widened to rfx-hub: its own source document defers it.

### H6 and H7 — ZERO real gaps. My triage numbers were both undercounts.

The triage said H6 29/32 and H7 30/32 and recommended confirming the stragglers. Confirming
them showed there are none:

| apparent gap | reality |
|---|---|
| `procurement-help-desk` (H6) | has ABSTAIN and "say so plainly rather than answering from memory" |
| `workflow-map` (H6) | marks unknowns `[OWNER?]` |
| `process-navigator` (H6) | Rule 2: **"Not specified in policy" is the answer** |
| `lilly-procurement-kernels` (H6, H7) | has no SKILL.md at all; not a skill |
| `deal-tab`, `rfx-hub` (H7) | exactly the exempt set recorded in G13a |

**This is the sixth time in this programme that a pattern list under-reported**, and the
count is the point rather than the anecdote. Every one had the same shape: a skill expressed
the mechanism in words the pattern did not anticipate, and the tool reported absence. The
H3 audit did it four times, my WS H triage did it twice more.

**H2 is the structural fix for exactly this.** One canonical ladder means one wording, so a
future audit can match a mechanism instead of guessing at its synonyms. That was not why G13
was written, but it is the strongest argument for it.

**No changes made to H6 or H7.** Both are complete. Rebuilding either would have been
re-doing work already there, on the strength of a measurement that was wrong six times over.

WS H now: H1, H2, H6, H7, H8, H9, H10 closed. **H4 alone remains**, and it is a decision
about whether the suite adopts per-fact provenance, not a scheduling question.

---

## H4 — per-fact provenance. Option B, as decided.

`provenance.py` + self-test (**29/29**) in the kernels source, vendored into
`category-strategy` and run by its `check_provenance.py`. Canonicalised as **G13b**.

**The shape is the existing `$src` sidecar, not H4's proposed inline wrapper**, and the
reasons were worth the decision:

- **Non-breaking.** Every dashboard and generator reads `meta.s23` as a number. Inlining
  `{value, source, as_of, confidence}` turns each value into an object and breaks all of
  them at once.
- **A derived figure has no source and must not be given one.** A CAGR computed from three
  spend figures is provenanced by its FORMULA. Forcing a source onto it would fabricate
  provenance inside the guardrail written to prevent fabrication. The validator refuses a
  fact claiming to be both derived and sourced, because one of the two is untrue.
- **A fact can have several sources.** The list form says so; a single `source` cannot.
- **It preserves `tier` and `stub`**, which the flat shape has no room for. `tier` maps onto
  G13's rungs, which is what makes the ladder checkable rather than aspirational.

**The sidecar's one weakness is the check's entire purpose.** Provenance beside a value means
a field can be added and its entry forgotten, so: every field carries a source list or a
derived block, and **silence is refused**. A field with no provenance is not rung 5
(abstain), it is unlabelled, which is exactly the state G13 exists to eliminate.

### Run against the real shipped seed, it found things immediately

Five fields carried values with no `$src`: `commodity`, `name`, `ytdNote`, `cutoff`, `p80`.
On inspection none is a claim about the world: two identifiers, one free-text commentary,
one dataset-metadata field that IS provenance, and one carrying the gap marker `~`.

They are exempted **by name with a reason**, never by heuristic. A heuristic exemption
widens quietly; a named list has to be edited on purpose and the edit shows up in review.

### The finding that matters more than the mechanism

**All 22 sourced fields in the category-strategy seed are `stub: true`.** The entire spend
spine (`s23`, `s24`, `s25`, `vendors`, every tail figure) is illustrative data.

It was always honestly labelled. Nothing was hidden. But nothing SURFACED it either, and a
deliverable built on that seed would have carried real-looking figures with no reader ever
being told. The stub flag was doing its job silently, which is half a job.

`stub: true` does not fail the build, deliberately: it is honest labelling and rejecting it
would punish the honesty. It is reported separately instead, with the instruction that any
deliverable built on those fields must say so.

### Scope, stated plainly

H4 names 8 skills. **1 of 8 is wired.** The mechanism, the shape, the validator and the
guardrail are done and proven against real data; the other 7 need their data objects to
CARRY `$src` before a validator has anything to check, which is real per-skill work rather
than a switch. Reporting 1 of 8 rather than claiming 8.

`#31 / H5 proper` is now unblocked in principle: the per-fact provenance field it needed
exists. It still needs the other 7 skills carrying it before a suite-wide resolve check
means anything.

---

## H4 wired across the remaining skills: 5 of 8 wired, 3 have nothing to validate

Self-test 29 -> **37/37** (a second provenance FORM), `provenance.py` vendored into 5 skills
and tracked against drift.

### A second form, because facts come in two containers

`category-strategy` keys facts by FIELD and carries a `$src` sidecar. The four generator
skills carry them as ROWS, where each row IS a fact with its own source columns: a
market-rate data point, a cost-driver line, a risk-register entry, a deep-dive dimension.

Same principle, different container, so `validate_rows()` applies the same rules rather than
forcing four skills to restructure their data. Rewriting working schemas to fit one shape
would have been the change with all the risk and none of the benefit.

| skill | form | validated |
|---|---|---|
| category-strategy | `$src` sidecar | field-keyed, sourced + derived |
| market-rate-benchmarking | rows | source + date + tier |
| should-cost-builder | rows | source + date + confidence (the fullest in the suite) |
| supplier-landscape | rows | source name only, see gap |
| supplier-deep-dive | rows | source name only, see gap |

### A schema gap found, and surfaced rather than papered over

`supplier-landscape` risk rows and `supplier-deep-dive` risk dimensions carry a source but
have **no separate as-of field**, so a stale source is indistinguishable from a fresh one.
G13b requires both.

That is a SCHEMA change, not a data fix, so those two checks enforce what exists (every row
names a source or honestly abstains) and REPORT the gap. Passing silently would hide it;
failing the build would punish skills for a shape nobody has yet agreed to change.

`"Not Determined"` passes as an honest abstention. Refusing it would push a caller toward
inventing a source, which is the opposite of the point.

### The 3 remaining skills have no data object to validate

`commercial-negotiation-prep`, `process-navigator` and `procurement-help-desk` emit
documents and answers, not structured data objects. Their per-fact discipline is already
prose and already present: process-navigator's Rule 1 is "Cite every fact", help-desk
discloses which tier answered and abstains otherwise.

**Wiring a validator into them would validate nothing** — a file present, a check that
never fires, which is precisely the false-complete A9 exists to catch. Recorded as
not-applicable rather than counted as done.

**So: 5 wired, 3 not applicable. H4 covers what it can cover.**

### The vendoring drifted within minutes, and now cannot

`category-strategy` got its copy of `provenance.py` BEFORE `validate_rows()` was added, so
the shared module was inconsistent almost immediately. Caught by hashing the copies.

`kernel_manifest.py` now tracks `EXTRA_VENDORED` modules under the same discipline as
`numeric_kernel.py`, deliberately in a separate code path so the kernel's HELD exception
cannot accidentally excuse another module. Tamper-tested: 5 of 5 match, and a one-line edit
is caught and named.

---

## The as-of schema change: both gaps closed. H4 is now complete at 5 of 5 applicable.

`supplier-landscape` risk rows gain **`evidence_as_of`**; `supplier-deep-dive` risk
dimensions gain **`as_of`**. Both are now validated rather than reported as a gap.

**Why it mattered.** A source without a date is not provenance. A risk citation from 2019
and one from last week were indistinguishable, and a stale supplier-risk read is exactly the
kind that gets a supplier approved.

**Required when a real source is named, NOT required for an abstention.** `Not Determined`
and `Not Publicly Disclosed` pass without a date, because there is no evidence to date.
Demanding one there would push a caller toward inventing a date to satisfy a column, which
is the failure the field exists to prevent.

Enforced in three places per skill so it cannot be satisfied in one and skipped in another:
the generator/validator, the `check_provenance` row check, and the SKILL.md schema.

### What the change surfaced about the old shape

`supplier-deep-dive`'s fixtures carried the date INSIDE the source string: `"10-K,
2026-02-11"`. That reads fine to a human and is invisible to every check, because a date
embedded in free text cannot be parsed, compared or aged. Splitting it into `source: "10-K"`
and `as_of: "2026-02-11"` is the entire point of the field.

Fourteen of that skill's twenty assertions failed the moment the rule went in, which is the
schema change doing its job: the fixtures were carrying provenance the old shape could not
check.

Landscape self-test 40 -> **45** (five new assertions: a named source with no date is
refused, a placeholder date is refused, a dated source passes, the column is really in the
emitted CSV, and `Not Determined` still passes with no date). Deep-dive **20/20** after
migrating its fixtures.

**H4 final: 5 of 5 applicable skills wired and validating, 3 not applicable** (they emit
documents and answers, not data objects). No remaining schema gaps.

`#31 / H5 proper` is now fully unblocked: every skill that emits data carries per-fact
provenance WITH a capture date, so a resolve check can verify both that a source exists and
that it is current.

---

## #31 / H5 proper — DONE. Citations now resolve-checked, not just counted.

`resolve_status()` and `resolve_report()` in the shared `provenance` module, canonicalised
as **G13c**. Self-test 37 -> **53/53**. Vendored to all 5 consuming skills, manifest clean.

Four verdicts: **OK**, **STALE** (with the age stated), **UNDATED** (followable but no
capture date), **UNRESOLVABLE** (names nothing a reader can reach).

**UNRESOLVABLE is the point.** "Internal analysis", "industry knowledge", "our experience"
read as citations and point at nothing. A citation nobody can follow is worse than an
abstention, because it stops the reader looking.

**It reports rather than refuses**, deliberately. Some deliverables legitimately rest on an
internal read; the right response is to label it G13 rung 4, not fail the run. Refusing
would push authors toward dressing an internal read as an external source, which is worse
than the thing being prevented.

**Honest limit, written into the code:** offline, "resolve" cannot mean fetching a URL. This
proves a citation is well-formed enough to follow and current enough to trust. It cannot
prove the source says what the citing text claims. Claiming more would be the fabrication
these guardrails exist to prevent.

### Run against the real shipped seed

110 citations checked: **100 OK, 0 STALE, 0 UNDATED, 10 UNRESOLVABLE.** The ten are
"Benchmark & savings model, reflect-only estimate", which names no followable source. That
is a real finding on shipped data, not a synthetic test.

===============================================================================
# RESUME BLOCK (written ahead of context compaction)
===============================================================================

**Everything unblocked is DONE.** 27 of 36 tracked items complete.

State: smoke 32/0 · citations 0 unresolved · kernel manifest 15/16 + 1 HELD · provenance
5/5 · fixture check_run 16/16 · 32 packages built and extract-and-retest verified · bundle
`Lilly_Procurement_Skills_v10_7_0_Bundle_2026-07-29.zip` in Downloads and on the Desktop.

**The 9 open items ALL need Marc, none is in progress:**

| # | needs |
|---|---|
| 20 | decide: keep/delete/rebuild 4 orphaned dashboard items. Recommendation: KEEP (only 1 is provably superseded, and it is pinned by hash) |
| 21 | ratify or correct D4's inferred ownership column in rfx-hub (~14 fields, 20 min) |
| 22 | blocked on A11, which is NOT EXECUTABLE: A11 locks five hubs and the My Work hub (A7) does not exist |
| 23 | go-ahead for retrieval indexing. Gate intent met (fixture 15 problems -> 2) |
| 24 | keep or lift the contract-review HOLD. Recommendation: KEEP until the fixture is stable at 0 |
| 25 | approve A5-A9. A11 cannot be approved until A7 builds My Work |
| 26 | B1-B4, B9 skills-file decisions. B4 should wait for #22 |
| 28 | J1-J3 orchestration, never triaged. I1-I3 confirmed NOT ACTIONABLE (I2 is network-blocked) |
| 31 | **now DONE** |

**Standing instruction from Marc:** for anything needing his decision, state the issue,
pros and cons, a recommendation, then ASK before proceeding.

**Recurring lesson, six occurrences:** a pattern list under-reports. Every "missing
mechanism" finding in this programme that turned out false was a skill wording something
differently. Treat an ABSENT from any text audit as a prompt to read the skill.

---

## #28 WS J triage — DONE. All three blocked, and the plan contains a CIRCULAR dependency.

J1-J3 had never been triaged. They are not startable, and one reason is a defect in the
plan itself rather than a missing decision.

### Declared dependencies, as written

| item | depends on |
|---|---|
| J1 rebuild THEO as conversational intake | **A11, B7** |
| J2 collapse routing into one JSON manifest | J1 |
| J3 cross-session journey state | J2 |
| B7 prune stale instructions | **A11; routing lists depend on J2** |
| A11 lock all five hubs | A1, A3-A5, **A7-A10** |
| A7 build the My Work dashboard and hub | nothing |

### Finding 1: the whole workstream is transitively blocked on ONE unbuilt thing

A7 -> A11 -> B7 -> J1 -> J2 -> J3. A7 is the last unbuilt Phase 1 hub and depends on
nothing. It is the single root block for WS J, WS B's B7, and #22 and #25. Effort L.

### Finding 2: J1 -> B7 -> J2 -> J1 is CIRCULAR

J1 depends on B7. B7's routing lists depend on J2. J2 depends on J1. As written this can
never start, no matter what is decided or built.

**Recommended fix, which is a plan edit and not a build:** split B7.
- **B7a** prune stale prose and old mode pickers. Depends on A11 only.
- **B7b** regenerate routing lists from the manifest. Depends on J2.

Then J1 depends on A11 + B7a and the chain is linear:
A7 -> A11 -> B7a -> J1 -> J2 -> (B7b, J3). The cycle disappears without weakening any
dependency, because the two halves of B7 genuinely have different inputs: pruning prose
needs the hubs locked, regenerating routing lists needs the manifest to exist.

### Finding 3: J1 also carries an un-taken Marc decision

`PROGRAM-MASTER-PLAN.md:117` gates J1. Even with A7 built and the cycle fixed, J1 needs a
go-ahead. J2 and J3 need no decision (J3 is merely sequenced "after hubs").

### What is NOT wrong

J1's honesty about auto-dispatch is deliberate and must be preserved:
`procurement-launcher-1c344a/SKILL.md:205-215` states plainly that auto-dispatch does not
exist in stock Desktop. The plan already flags that as an accuracy property to keep. Any
J1 rebuild that quietly starts implying dispatch works would be a regression.

J3's design is already specified and sound: copy `timeline_calibration.json`, the one place
the persisted-state pattern is actually implemented, rather than inventing a new one. It
also correctly catches that meeting-prep-brief's "gets richer across meetings"
(`SKILL.md:97`) is aspirational prose with no file, no schema and no read-back step.

**Net: #28 is now triaged. It moves from "never looked at" to "blocked on A7, plus one
plan edit and one decision." No code is startable today.**

---

## #23 retrieval indexing — BUILT. And it caught a defect in its own spec on the first run.

`lilly-contract-review-1c344a/retrieval_index.py` + selftest (**42/42**).

**Scope, stated plainly:** this BUILDS and VERIFIES the index. It does NOT rewire the review
passes. That is F1 (#24), which stays on hold. The index is separable, checkable today, and
when F1 lifts it is already proven rather than written under time pressure.

### The finding: the spec prose under-reports the table it is describing

`F1-COVERAGE-MATRIX-PART2-judgment.md:85,103` said an Order Form "only needs categories 1
and 6". The actual applicability matrix at `vendor-tactics.md:288-301` marks **1, 6 AND 8**.
Category 8 is **Compliance/Security Gaps**, and it is the one category marked applicable to
all six document types.

Anyone hand-authoring the index from the spec prose, which is exactly what the prose
invites, would have silently dropped compliance and security tactic detection from every
Order Form review. Corrected in three places across the two matrix documents.

This is the sixth occurrence of the same failure mode, and the first where it bit the
PLAN rather than a skill. It is also the direct payoff of deriving the index from the
corpus instead of transcribing it.

### Three load-bearing properties

1. **A retrieval miss NEVER means skip the check.** `select()` returns an explicit
   `fallback` flag, not a possibly-empty list. An empty list read as "nothing to check"
   would turn a token saving into an accuracy regression. Today the full corpus always
   loads, so narrowing can only ever LOSE coverage, never gain it. Tests T13-T17 and
   T22-T27 exist for this and nothing else.
2. **All six Hard Stops load unconditionally**, whatever topics were requested. Making the
   most consequential checks depend on clause tagging would put them behind the least
   reliable step (T20, T28).
3. **Derived at run time, never hand-maintained.** A copy reads as correct right up until
   someone edits the corpus and not the index. Same drift class as B7b and E1.

### The numeric section label is an alias, never the key

The playbook records its own numbering as unstable ("S14 Insurance (S16 in some templates)",
`playbook.md:152`), and S26 is BOTH Governing Law and the section HS-2 cites for debarment
certification. Keying on the number would merge two unrelated topics. T5 and T6 assert this
against the real file rather than trusting the reasoning.

### Built index

playbook: 27 sections, 6 Hard Stops, **0 untagged**.
vendor-tactics: Change Order and Amendment all 12 - SOW and Work Order 11 - Order Form 3 -
MSA 2 (category 1 keeping its "Rate card only" qualifier rather than being flattened).

### Also in this increment

**B7 split applied**, breaking the circular dependency #28 found. B7a (prune prose, depends
A11) and B7b (routing lists, depends J2). J1 now depends on A11 + B7a. Chain is linear:
A7 -> A11 -> B7a -> J1 -> J2 -> (B7b, J3).

**Malicious-code review:** SECRETS 0, BYPASS 0, OBFUSCATION 0, INJECTION 0. EGRESS 1
(pre-existing, reviewed benign). EXEC rose 23 -> 41; `retrieval_index.py` contributed zero,
and the increase is `provenance.py:278-280` replicated across the 5 vendored copies. Those
lines are regex literals naming followable citation shapes (`10-K`, `OFAC`, `SAP`, `SOC 2`)
inside a validator. No execution, no dynamic dispatch. Benign.

---

## A7 My Work hub — BUILT. The last Phase 1 hub. (Marc approved Option B, 2026-07-29)

New skill `my-work-1c344a`. Suite is now **33 skills**.

### The decision that shaped it

The plan said "deterministic port of the platform My Work page". The existing
`build_my_work.py` in the platform build tree is not a port: it reads `my-work.html` and
its assets out of the LIVE Theo directory on the Desktop at build time. Marc chose
Option B: use the platform page as a READ-ONLY SPEC, vendor its render chain
byte-identical, and build to the hub pattern Landscape/Deal/RFx already use. A live
reach-through would have put a frozen copy of a separately-owned, actively developed
product inside a shipped skill, with no drift detection.

Correction on the record: I told Marc the page pulled voice, mentions, connectors and
approval-chain. That was wrong. I had listed the platform's whole assets directory rather
than the page's actual imports. Option B still held on the separation and drift arguments.

Vendored: the six-module my-work chain (setup/metrics/SLA, timeline, suppliers, report
card, delegation/org boot, handover) plus people, seed, theo-data, demo-data, provenance.
**`my-work-06-handover.js` IS the #44 handover/custody brief, already built in the
platform**, which is why #44 lands with this hub rather than after it.

### Three defects found and fixed during the build

**1. My own no-network assertion checked the MARKUP, not the mechanism.** The first build
reported a confident "0 external references" while the rendered page pulled four scripts
and an image and issued a fetch. `theo-brand.js` injected them from JavaScript, and the
handover module called fetch directly, so a `<script src>` scan saw nothing. **Seventh
occurrence of the pattern-matches-wording-not-mechanism failure, and the first that was
mine.** The check now looks for fetch, XMLHttpRequest, WebSocket, dynamic import, `.src =`
assignment and bundle-path string literals, over a comment-stripped copy. The stripper
deliberately UNDER-strips: one that guessed harder could delete real code and hide a real
call.

**2. Dropping a feature is not the same as removing it.** Dropping the task drawer's
script and stylesheet left its markup rendering as unstyled text at the foot of the page
and left a Tasks button in the topbar whose onclick called an undefined `mqOpen()`. A dead
control is not a stated gap. The builder now removes the panel and its trigger and asserts
exactly one of each.

**3. The handover fetch needed neutralising without breaking drift detection.** Solved
with a declared build-time patch that PINS its exact expected text. The vendored file
stays byte-identical so drift is still detectable; if the platform rewrites that line the
patch stops matching and the build REFUSES rather than silently restoring a network call.

### Verified

- builder selftest **29/29**, including 5 tamper tests that plant each failure mode and
  assert the build refuses
- rendered in-browser: **0 console errors**, all 8 sections populated, Handover renders
  1,969 chars offline from the seed
- suite smoke test **33 skills, 0 failed assertions**
- **builds from an isolated extract in a temp dir with no repo and no siblings**, which is
  the Claude Desktop install contract proven rather than asserted
- 33 packages, every one extract-and-retest verified

### Malicious-code review

13 EGRESS hits in my-work. Twelve are comments, the no-network check's own regex patterns,
or tamper-test payloads. One is real: the vendored handover module's fetch, on disk by
design, removed at build time by the pinned patch, and proven absent from the built page by
selftest T5/T20/T22. All five judgements recorded in the sweep's reviewed list so they are
not re-litigated. SECRETS 0, BYPASS 0, OBFUSCATION 0, INJECTION 0.

### What A7 unblocks

A7 was the root block for three items. **A11 can now be attempted** (it needed A7 among
A1/A3-A5/A7-A10), and A11 unblocks B7a -> J1 -> J2 -> (B7b, J3) plus #22 and #25.
A11 still needs Marc's sign-off, and A5/A6 Deep Dive and A8/A9 Landscape remain.

---

## A11 lock all five hubs — EXECUTED AS FAR AS IT CAN GO. Cannot complete: Deep Dive does not exist.

A11's stated work is "per-dashboard in-browser sweep plus full-codebase malicious-code
pass, then tag", gated on Marc's sign-off (M14), depending on A1, A3-A5, A7-A10.

### The blocker, precisely

The five Phase 1 hubs (`PROGRAM-MASTER-PLAN.md:44-51`) are RFx, Category Strategy,
**Deep Dive**, My Work, Landscape.

- **Deep Dive (A5) has zero builders and zero HTML.** It is still on the fully-manual JSX
  path. There is no artifact to sweep, and none to lock.
- **Landscape is built but not "fully-locked"**: A8 (design uplift to Deal/RFx caliber)
  and A9 (engine recolor to MCM) are both outstanding.

So the tag cannot be applied. A11 is 1 of 3 preconditions short, and A7 was only one of them.

### What WAS done, because it does not depend on the missing pieces

**1. In-browser sweep of every built hub.** Landscape, Deal v2, RFx, Category Strategy and
My Work: **0 console errors** across all five. The only error seen anywhere was a
`favicon.ico` 404, which is a browser's default request, not a page defect.

**2. Full-codebase malicious-code pass.** SECRETS 0, BYPASS 0, OBFUSCATION 0, INJECTION 0.
EGRESS and EXEC hits all previously reviewed and recorded.

**3. NEW permanent gate: `_audit/hub_selfcontainment.py`.** The in-browser sweep alone
would not have caught the defect My Work shipped an hour earlier, because that page's
markup was clean while its behaviour was not. This gate matches the MECHANISM: fetch,
XMLHttpRequest, WebSocket, sendBeacon, dynamic import, `.src =` assignment, bundle-asset
literals and `/api/` path literals, over a comment-stripped copy.

**Result: 7 built artifacts, 0 findings.** Every hub dashboard is provably request-free.

Two design points worth keeping:
- It **names Deep Dive as NOT SWEPT** rather than silently skipping it. A sweep that omits
  what does not exist reports green for a set it never examined, which is exactly how an
  unbuilt dashboard gets counted as locked.
- It **states what a clean result does not mean**: no requests is not the same as renders
  correctly or figures reconcile.

Worth recording: earlier console history showed category-strategy pages POSTing to
`/api/supplier-risk` and `/api/category-strategy` and pulling the Theo chrome and dino.
Those were pre-fix builds from earlier sessions. The current artifacts are clean, and the
new gate now makes that a standing check rather than something noticed by accident.

### Remaining for A11

| precondition | state |
|---|---|
| A5 Deep Dive dashboard | **NOT BUILT** (effort L) |
| A8 Landscape design uplift | outstanding |
| A9 Landscape engine recolor | outstanding |
| A11 sign-off | **Marc (M14)** |

---

## A5 Deep Dive dashboard — STAGE 1 BUILT. Awaiting Marc's sign-off before stage 2.

`supplier-deep-dive` was the last skill on the fully-manual path: `SKILL.md:337` told the
model to hand-author the JSX with `create_file`, so every run produced a differently shaped
artifact. That is a consistency defect before it is a cost defect, and no better
instruction fixes it. The model now authors DATA; code assembles the page.

**Stage 1 of 3, deliberately.** `DEEP-DIVE-REDESIGN-SPEC-v3.md:163` places a sign-off gate
after the Supplier Summary exemplar, before the pattern rolls to the other five subtabs.
Stopping here is the spec's sequencing, not a shortcut.

### Built

- `dashboard/deepdive_schema.py` — the validator, where the spec's rules live as checks
- `dashboard/build_profile_dashboard.py` — deterministic assembly, no hand-authored markup
- `dashboard/assets/seed/snowflake.json` — stage 0 reshape into the normalized 8-dimension
  evidence model
- `dashboard/deepdive_schema_selftest.py` — **35/35**

### Stage 0 fixed the two seed defects the spec names by hand

The UNC5537 credential-stuffing incident is now filed under **cyber_privacy_data**, not
under "ML / data-science depth" where v2 had it. And no composite score is carried at all,
because v2 emitted 89/100, 90/100 and 4.5/5 for the same supplier.

### The spec is mostly a list of v2's defects, so each is now a refusal

| Refused | Why |
|---|---|
| a visible composite score | three different composites for one supplier is what made v2 untrustworthy; the fix is to stop emitting a number that was never supported |
| a precise $ with no bid / internal / benchmark / prior-spend / contract source | public consumption pricing cannot estimate Lilly TCO, and such a figure reads as a bid |
| a field with no retrieval status | "no issue found" and "not enough information" must not collapse into each other |
| a gate folded into the aggregate | folding a hard stop into an average turns a disqualifying finding into a slightly lower score |
| "Advance" while a HARD STOP is open | a hard stop is the answer until its owner clears it |
| a confident assessment with no evidence | verified fact and inference may not carry equal authority |
| a missing dimension | all eight always render, so a weak area cannot be hidden by omitting its row |

**It does not refuse incompleteness.** T21 is the negative control: a supplier with zero
evidence validates and renders as "Insufficient evidence" throughout. A validator that
rejected gaps would push an author toward inventing values, which is the failure this
redesign exists to prevent.

### Design points worth keeping

- **Bar length is a relative position; the label carries the assessment.** A long bar
  cannot be misread as a score, which is what the removed composite used to invite.
- **Confidence is the FILL** (solid / striped / dashed outline), so a reader cannot take in
  an assessment without also taking in how well it is evidenced.
- **Risk posture in the header is DERIVED from the gates**, not authored. That is what
  stops the header disagreeing with the chart beneath it, which is the internal-
  inconsistency class the spec calls out.
- **The builder refuses invalid data** rather than rendering it, because a rendered page is
  indistinguishable from a trustworthy one.

### Verified

Selftest 35/35 (20 tamper tests, 2 negative controls) - in-browser 0 console errors -
suite smoke 33/0 - hub self-containment now **8 built artifacts, 0 findings**, and the
"Deep Dive NOT SWEPT" warning is gone - malicious sweep SECRETS/BYPASS/OBFUSCATION/
INJECTION all 0 - 33 packages extract-and-retest verified.

### Next

Stage 2 (the other five subtabs) and stage 3 / A6 (supplier-type adaptation) are held at
the spec's sign-off gate pending Marc's review of this exemplar.

---

## A5 STAGE 2 — the pattern rolled out to all five remaining subtabs. Marc signed off the exemplar.

All six subtabs now render from validated data: Supplier Summary, Company & Ownership,
Capabilities & Operations, Financial & Market, Risk & Resilience, Lilly Fit & Diligence.

### The important piece is `deepdive_viz.py`, not the markup

The spec's closing instruction is "never fabricate a network/trend/map from weak web
references" (spec:145). That is the most likely way this dashboard produces something
false: **not by stating a wrong fact, but by drawing a SHAPE that implies evidence nobody
has.** A line through one point invents a direction. A map drawn from a country of domicile
invents a delivery footprint. A one-node ownership tree invents a structure never
researched.

So the dominant visual for every subtab is CHOSEN from what the data can carry, and the
reason is printed on the page.

| Visual | Requires | Otherwise |
|---|---|---|
| trend line | 3+ comparable dated periods of one metric | 2 bars, 1 metric card, 0 stated requirement |
| ownership tree | >1 entity, differing contracting entity, or unresolved UBO | identity matrix carries the section |
| footprint map | real delivery-relevant locations | stated requirement; domicile is not a footprint |
| dependency diagram | confirmed existence | unconfirmed listed, never drawn: a node reads as a confirmed relationship |
| risk matrix | impact AND likelihood scored separately | one-axis risks listed separately, never dropped |
| peer scatter | 3+ comparable candidates | stated requirement; one point is position relative to nothing |

### On the real Snowflake data, four of six fell back, and said why

This is the mechanism working, not a shortfall:

- **ownership** -> matrix only. "A one-node tree would imply a structure that was never
  researched; the subsidiary structure is stated as required, not drawn."
- **trend** -> metric card. "A line through one point would invent a direction."
- **map** -> stated requirement. Delivery-relevant regions are unconfirmed, and country of
  domicile is not a substitute.
- **peer scatter** -> stated requirement. No comparable peer data captured.
- **dependency diagram** -> drawn, with AWS/Azure/GCP confirmed and the implementation
  partner **listed but not drawn** because its existence is unconfirmed.
- **risk matrix** -> drawn with 3 of 4 risks. The GxP shortfall has an impact but no
  likelihood, so it is **named beneath the matrix rather than dropped**, which stops the
  matrix being mistaken for the whole picture.

### Also

The risk matrix gained gridlines, axis ticks and a confidence legend. Without a scale it
looked quantitative while being unreadable, which is the worst of both: it implies
precision and delivers none.

Two user-visible grammar defects were caught in generated prose and fixed: "1 identified
dependency(ies)" and a "cannot not be plotted" double negative. T62 now asserts against the
latter, because generated prose is still prose a reader has to trust.

### Verified

Selftest **65/65** (up from 35; T34-T63 cover selection and the six panes) - in-browser
0 console errors, all six panes populated - suite smoke 33/0 - hub self-containment
8 artifacts 0 findings - malicious sweep SECRETS/BYPASS/OBFUSCATION/INJECTION all 0 -
33 packages extract-and-retest verified.

**A5 is complete.** A6 (supplier-type adaptation: public / private / hyperscaler product)
is the remaining Deep Dive item and depends on this.

---

## A6 compose-by-traits — DONE. A5 and A6 both complete.

`deepdive_traits.py` + 21 new tests. Selftest **86/86** (was 65).

### The problem, stated as the spec states it

"Lilly contracts an ENTITY, evaluates an OFFERING, depends on specific SERVICES: three
different things" (spec:36). One layout cannot evaluate Snowflake (public), Databricks
(private) and BigQuery (a product inside Google). Forced through one template, the private
company gets empty market-cap fields and the hyperscaler product gets standalone financials
it does not have.

**An empty field invites someone to fill it. That is how fabrication starts.**

### ONE base, composed by traits

There is no "public dashboard" and "private dashboard" variant, per the LOCKED
one-base-compose-by-traits rule. Variants drift and then a fix has to be made three times.

| Entity type | Panels | What changes |
|---|---|---|
| public | 19 | own financials are the relevant ones |
| private | 19 | same layout; viability rests on supplier disclosure, not filings |
| hyperscaler product | 17 | no standalone financials; viability reads at the parent, and the tree separating parent / contracting entity / offering becomes essential |

### The distinction the whole mechanism exists for

A panel can be absent for two completely different reasons, and they must NEVER look alike:

- **OMIT_BY_TRAIT** - this supplier type HAS no such thing. BigQuery has no standalone
  balance sheet. Asking for one is a category error. The page says *not applicable to this
  supplier type*, gives the reason, and points at where viability IS assessed.
- **GAP** - it exists and nobody found it. That is a research action, rendered as a stated
  information requirement.

Collapsing them fails in both directions. Show a gap where there is a trait omission and
you send someone hunting for a document that cannot exist. Show a trait omission where
there is a gap and you quietly excuse missing work.

`disposition()` therefore returns THREE values, not two, and T69 asserts that having data
can never turn a trait omission into a gap.

### Refuses rather than guesses

An unknown entity type is refused (T81): guessing would silently pick a layout that asks
for evidence the supplier may not have, which is the failure this exists to prevent. An
undeclared panel is refused (T82) so applicability is declared rather than assumed. And
T83 asserts every declared omission carries a reader-facing reason, because an unexplained
absence is indistinguishable from an oversight.

### Verified against the plan's own bar

The plan requires "render one supplier of each type; assert no panel renders an invented
value and every omitted panel is omitted by trait, not by gap". All three render (T65).
The private company shows **no market capitalisation** because it has none (T76), and its
financial viability reads as insufficient rather than being filled in (T77). The
hyperscaler shows the not-applicable card rather than an information-required card (T72,
T73) and names Alphabet as where viability is assessed (T75).

Selftest 86/86 - 0 console errors on all three - suite smoke 33/0 - hub self-containment
**10 artifacts, 0 findings** - malicious sweep clean - 33 packages extract-and-retest
verified.

**A5 and A6 are both complete.** A11 now waits only on A8, A9 and Marc's sign-off.

---

## Panel data contracts — Deal and RFx. (Marc: dashboards DESIGN LOCKED 2026-07-29)

Marc locked the four dashboards' design and named the only two things that still mattered,
neither of them visual:

1. A panel with no data must NEVER disappear or sit blank. It stays and says why.
2. Each panel must know its own sources, so retrieval goes to the 10-K or OFAC or the spend
   data instead of a blind web search.

**A8 (Landscape design uplift) is therefore CLOSED.** A9 (colour tokenising) is deferred,
since a future redesign may redo it.

### Before this, there was no panel-to-source map anywhere in the suite

Deal: 0 files declaring a source. RFx: 0. The skill genuinely did search blind and hope.

### Built

`panel_contract.py` (shared, vendored, manifest-tracked) plus a contract per dashboard:

| | panels | fields | sources | retrieval |
|---|---|---|---|---|
| Deal | 35 | 59 | 79 links | **11 source visits** |
| RFx | 23 | 42 | 65 links | **9 source visits** |

`retrieval_plan()` groups fields by source, so retrieval runs once per source collecting
everything that source answers, rather than once per field. 79 lookups become 11 visits.
That is the accuracy mechanism and the efficiency one at the same time.

### The rule that carries the most weight

Every empty state except one describes OUR PROCESS. `SEARCHED_NOT_FOUND` is the only one
that makes a claim about the SUPPLIER. So it is the only one gated on evidence:
**`resolve_state()` refuses to return it unless a retrieval actually ran and came back
empty.** Absent that, the honest answer is NOT_ATTEMPTED.

If a connector is down and the panel reads "no data found", a broken pipe silently becomes
a clean finding and someone decides on it. T6 and T7 exist for that and nothing else.

Every message names the source it expected, so "could not reach OFAC SDN" is actionable
where "unavailable" is not.

### Internal sources are flagged, never invented

17 internal sources across the two contracts are named from inference and reported as
needing Marc's confirmation rather than asserted: SME review outcomes, prior Lilly
contracts, Lilly spend data, funding confirmation. **A confidently wrong internal system
name is worse than an honest blank.**

### It also found what only Marc can supply

9 fields cannot be retrieved from anywhere and are marked `requires_input`, correctly:
Lilly's WACC, the negotiation stage, who holds the pen, what Lilly intended (as opposed to
what the contract says), Lilly's trading currency, and approvals obtained. Those are
decisions and records, not documents.

### Why a data file rather than renderer code

Marc may redesign the dashboards later. The contract is per-panel DATA, so a layout change
does not throw the work away.

### Verified

Selftest **40/40** - suite smoke 33/0 - kernel manifest: panel_contract 2 of 2, provenance
5 of 5 - malicious sweep SECRETS/BYPASS/OBFUSCATION/INJECTION all 0 - 33 packages
extract-and-retest verified.

**Next: the same contracts for Landscape and Category Strategy, which are partway there
(1 file each) rather than starting from nothing.**

---

## Panel data contracts — Landscape and Category Strategy. All four locked dashboards now covered.

| dashboard | panels | fields | source visits | need the user | internal to confirm |
|---|---|---|---|---|---|
| Deal | 35 | 59 | 11 | 8 | 5 |
| RFx | 23 | 42 | 9 | 1 | 12 |
| Category Strategy | 42 | 50 | 11 | 9 | 53 |
| Landscape | 35 | 40 | 12 | 4 | 8 |
| **total** | **135** | **191** | | **22** | **78** |

Panel names were read out of the render code (`csCard(...)` and the pv-07 card helpers),
not invented, so each contract covers the panels that actually exist.

### The retrieval shape is the point

Category Strategy resolves 72 field lookups into **11 source visits**, and one source
(Lilly spend data) answers 32 of them. Landscape resolves 58 into 12. Retrieval now knows
to go to spend data once and take everything it can answer, instead of searching per field.

### 78 internal sources flagged for Marc, not invented

Category Strategy carries 53 of them, which stands to reason: almost everything it renders
comes from Lilly's own spend, contract, PO and vendor-master systems, and I named those
from inference. **A confidently wrong internal system name is worse than an honest blank**,
so every one is reported rather than asserted.

### 22 fields correctly identified as un-retrievable

Not gaps, and not research tasks. Examples: Lilly's WACC, the negotiation stage, who holds
the pen, what Lilly INTENDED as against what the contract says, which suppliers are
strategic, where the fit and risk cuts sit, whether a supplier fits Lilly's architecture,
utilisation and shelfware data, and the prior strategy document. Those are decisions,
records and systems, not documents to be found.

### A real defect the smoke test caught

The first version of the self-test discovered contracts ONLY as sibling directories. It
passed in the repo and failed in every installed skill, because **a skill installs as one
folder with no siblings.** A4 runs each self-test in an isolated copy, which is exactly why
it fired.

Fixed to work both ways: it reads the contract shipped beside it, adds siblings when they
exist, and asserts four-dashboard coverage only when the siblings are actually visible.
Demanding four contracts inside a correctly-installed single skill would have failed a
skill that was working properly.

Verified both contexts: **56/56 in the repo, 41/41 from an isolated extract.**

### Verified

Smoke 33/0 - kernel manifest 15/16 + 1 held, panel_contract 4 of 4, provenance 5 of 5 -
malicious sweep SECRETS/BYPASS/OBFUSCATION/INJECTION all 0 - 33 packages
extract-and-retest verified.

**All four design-locked dashboards now have a panel data contract. 135 panels.**

---

## Merges + state reconciliation. A vocabulary I invented already existed.

### The mistake

`StateBanner({kind, msg})` already existed in the shared component library with three
states: **NEEDS_INPUT, NOT_APPLICABLE, RESEARCH_PENDING**. I built a five-state vocabulary
without checking, so three of mine were duplicates under different names. That is precisely
the drift class this programme has spent weeks removing, and this one was mine.

**The library's names and labels win.** `NOT_ATTEMPTED` is gone; it is `RESEARCH_PENDING`,
and the three shared labels are now copied verbatim ("Needs input", "Not applicable",
"Research pending") so a reader sees the same words here as everywhere else in the suite.

### What survives, and why it should

Two states are genuinely new, and they are the two Marc actually asked for:

- **SOURCE_UNREACHABLE** - the connection-failing case
- **SEARCHED_NOT_FOUND** - checked the right place, genuinely absent

The library had no way to say either, so both collapsed into RESEARCH_PENDING. That is the
exact conflation this module exists to break: **a failed connector and a real absence are
opposite findings.** T43 asserts that exactly these two are new, so the reconciliation
cannot silently regrow.

### The merges

Two sources were the same thing named twice by me:

- `SME gate outcomes` -> **SME review outcome** (8 rows in RFx)
- `Prior Lilly contracts for this supplier` -> **Contract repository** (1 row in Deal)

Fields that ended up listing a source twice were de-duplicated. T45, T46 and T47 hold it.

### Result: 78 rows, 6 systems

| system | rows | dashboards |
|---|---|---|
| Lilly spend data | 36 | Category 32, RFx 2, Deal 1, Landscape 1 |
| SME review outcome | 16 | RFx 8, Landscape 4, Deal 3, Category 1 |
| Contract repository | 13 | Category 11, Deal 1, Landscape 1 |
| Vendor master | 8 | Category 6, Landscape 2 |
| Purchase order and invoice data | 3 | Category 3 |
| Business case funding confirmation | 2 | RFx 2 |

### What the suite already names, and what it does not

Searching the suite's own docs turned up the enterprise systems it already references:
ARIA (609 mentions), ATC (146), Ariba (132), ATS (126), LEAH (82), Fabric (62), BuyLilly
(59), SAP (41), CLM (19).

Two candidate mappings emerged that are worth putting to Marc rather than adopting:

- **Lilly spend data -> SHARP, reached via Fabric.** The suite contains literal
  `SHARP_Finance view[...]` and `SHARP_Procurement view[...]` references, and elsewhere
  "Spend data unavailable this session: Fabric was not reachable."
- **Vendor master -> the supplier master.** The suite phrase is "SAP, Ariba, SHARP, or the
  supplier master", which reads as four distinct things.

These are NOT applied. A confidently wrong internal system name is worse than an honest
blank, and inferring one from a doc search is still inferring.

Selftest **63/63** - smoke 33/0 - manifest panel_contract 4 of 4 - malicious sweep clean -
33 packages extract-and-retest verified.

---

# ============================================================================
# A11 LOCKED 2026-07-30. PHASE 1 CLOSES.
# ============================================================================

Marc confirmed the lock. Tag: `hubs-locked-2026-07-30`.

All five Phase 1 hubs, plus Deep Dive built to the same standard:

| hub | state |
|---|---|
| RFx | locked |
| Category Strategy | locked |
| Deep Dive | built 2026-07-29 (A5 + A6), locked |
| My Work | built 2026-07-29 (A7), locked |
| Landscape | locked as-is |
| Deal | locked |

**A8 and A9 are disposed of by the lock rather than completed.** A8 was the design uplift
and A9 the recolor; neither survives a decision to stop changing the appearance. A9 also
rested on a stale premise: no stoplight palette remains and the dominant colours are
already MCM. The real residue is 231 distinct hardcoded colours a token swap cannot reach,
recorded in `_audit/A8-A9-PROPOSALS.md` should a future redesign want it.

### Evidence at lock

hub self-containment **10 built artifacts / 0 findings** - in-browser sweep **0 console
errors** on every hub - suite smoke **33 skills / 0 failed assertions** - malicious sweep
SECRETS/BYPASS/OBFUSCATION/INJECTION **all 0** - kernel manifest **no unexplained drift** -
**33 packages** extract-and-retest verified.

### What this unblocks

A11 was the gate holding WS B through WS H, and the root of the WS J chain:

    A11 -> B7a -> J1 -> J2 -> (B7b, J3)

Also unblocked: the slice contracts (#22) and B4 (#26).

### RESUME POINTER

Open and needing Marc: the **6 internal source names** (spend data 36 rows, SME review
outcome 16, contract repository 13, vendor master 8, PO/invoice 3, funding confirmation 2);
**#20** four orphaned dashboard items; **#21** D4 ownership column; **#24** whether to lift
the contract-review hold.

Startable without Marc: **B7a**, then the WS J chain.
