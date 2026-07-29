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
| O1 coverage matrix output-mode re-audit | PART DONE | `2720f66` | merge done, 307 rows not 342. Output-mode column + Part 3 coverage sweep still owed |
| O2 build `deduction_score()` | NOT STARTED | | kernel skill only, do NOT wire |
| O3 C3 Bid Leveling kernel | NOT STARTED | | gates an audited ranking |
| O4 C2 playbook-learning Difficulty Score | NOT STARTED | | proven bug in its own changelog |
| O5-O10 C4,C5,C6,C7,C8,C10 kernel adoption | NOT STARTED | | non-held skills |
| O11 C9 kernel hash manifest | NOT STARTED | | |
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
