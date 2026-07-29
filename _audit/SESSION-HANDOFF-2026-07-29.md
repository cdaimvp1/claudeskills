# Session handoff, 2026-07-29

Everything from this session is committed and pushed to `main`. This file is the
single entry point for the next session.

---

## Read these, in this order

1. **`_audit/OPTIMIZATION-PRINCIPLES.md`** - GOVERNS EVERYTHING. Accuracy, quality
   and completeness first; time and token cost second. Read before touching any
   skill.
2. **`_audit/UPGRADE-PLAN.md`** - 11 workstreams, 78 items, the whole programme.
3. **`_audit/RECONCILIATION.md`** - the audit corrected against the planning corpus.
   Read this before acting on any audit finding, because several were already known
   or already decided.
4. **`_audit/F1-CONTRACT-REVIEW-REDESIGN-SPEC.md`** - the active design work.
5. `PROGRAM-MASTER-PLAN.md` PRIORITY ORDER section - the LOCKED phase order.

Task list: 11 tasks, one per workstream, already created in the harness.

---

## What shipped this session

| Commit | What |
|---|---|
| `2b9ab61` | Category Strategy dashboard LOCKED, tag `category-strategy-locked-2026-07-29` |
| `03f29f8` | Wired two dead generators (should-cost, market-rate). 23/23 and 24/24 self-tests |
| `d5f3c46` | F2: rfp-response-analysis, 2 of 3 document reopens removed, 0 analysis passes lost |
| `4546036` | F3: dedup by role family plus 90-day cache in 3 pricing skills. NO search cap |
| `ef270b5` | A1/A3/A4: rfx-hub-1c344a created, Category Strategy rehomed, chrome vendored |
| `b1fba90` | Malicious sweep on both hubs: SAFE. F1 as scoped: no change, deliberately |
| `c73dfab`, `cc884a5`, `9f9e47d`, `b0348fe` | F1 redesign spec, coverage guarantee, data lifecycle, Desktop feasibility gate |

All four locked dashboards now have installable skill homes.

---

## IN FLIGHT at handoff

Three agents were building the F1 coverage matrix when this session ended. Check
for these files first:

- `_audit/F1-COVERAGE-MATRIX-PART1-mechanical.md`
- `_audit/F1-COVERAGE-MATRIX-PART2-judgment.md`
- `_audit/F1-COVERAGE-MATRIX-PART3-outputs-rules.md`

**If they exist:** merge into `_audit/F1-COVERAGE-MATRIX.md`, resolve every row
marked BLOCKER, and report the blocker count to Marc. A BLOCKER stops F1
implementation; it is not a footnote.

**If any is missing:** re-run that part. The briefs are recoverable from this file's
sibling specs, and Part 3 is the important one because it must RESCUE anything in
`dashboard-canonical.md` that is not purely about the dashboard before that file is
deleted.

**If Part 3 reports rescued content:** that is a real finding. Marc retired the JSX
dashboard deliverable, and anything in those 353 lines governing the Review Summary
or Briefing must survive the deletion.

---

## Overnight autonomous work: what is SAFE and what is NOT

Marc intends to ask for autonomous overnight work. This is the pre-sorted answer.

### SAFE to do autonomously

No Marc decision needed, no locked or held file touched, verifiable without him.

| Item | Why it is safe |
|---|---|
| **C1 build `deduction_score()`** | Touches `lilly-procurement-kernels` ONLY. Does not touch contract-review, so the hold does not apply. Unit-test against the worked example in `risk-scoring.md` (deductions -36, score 64). NOT `weighted_score()`: this is a deduction model, starts at 100, Hard Stops always -15 and never reduced. |
| **Merge the coverage matrix** | Assembly of work already done. |
| **C9 kernel-copy verification manifest** | Read-only plus a manifest file. |
| **E1 fix the stale `case-handoff-schema.md`** | rfp-case-manager's copy is correct and calls rfp-engine's superseded. Fix rfp-engine's to match and add a source-of-truth header. |
| **G1-G7 Desktop runtime audits** | Read-only inventories. Produce findings, do not fix. |
| **H3 audit G12 claim-gate** | Read-only. G12 appears in only 2 of 31 SKILL.md files; establish implement-vs-mention per skill. |
| **B6, B7 cleanup** | Orphaned static HTML and stale prose, in NON-held skills only. |
| **A2 RFx to Deal handoff emitter** | rfx-hub now exists, so this is unblocked. |

### NOT safe autonomously

| Item | Why not |
|---|---|
| **Anything touching `lilly-contract-review`** | Documented HOLD at `PLATFORM-CONSOLIDATION-TRACKER.md:172`. Includes F1 rewire, D1, B4 for that skill. |
| **WS J orchestration** | Marc has an OPEN DECISION: the audit recommended a new skill, which contradicts the locked THEO-maturation decision at `docs/master-plan.md:312-345`. Do not start either way. |
| **I1 help-desk** | Marc decision pending: sibling skill vs fold into process-navigator. I2 is network-blocked regardless. |
| **A11 lock the hubs** | Needs Marc sign-off. |
| **B1, B2 category-strategy spec cleanup** | Depends on Marc confirming 5 tabs, and on the coverage matrix for the retirement propagation. |
| **Retiring `dashboard-canonical.md`** | Blocked until Part 3's rescue finding is reviewed. Deleting first would be the exact regression the coverage guarantee exists to prevent. |
| **Any Phase 2 work ahead of Phase 1** | `PROGRAM-MASTER-PLAN.md:41-43` locks the order. The generator wiring already jumped it once on Marc's direct instruction; that was a disclosed exception, not a precedent. |

---

## Decisions waiting on Marc

1. **Orchestration**: confirm THEO-maturation (locked) over a new skill (audit's
   recommendation, contradicts it).
2. **Category Strategy tabs**: 5 is locked and built, the build spec still says 7,
   SKILL.md still says 11. Confirm 5 and correct the rest.
3. **help-desk**: sibling skill, or a mode inside process-navigator.
4. **JSX dashboard retirement**: confirm it propagates to D1 and B4 so a later
   reader does not restore it as a regression.
5. **Golden fixture**: which contract, real or synthetic.
6. **Redline .docx mechanics**: move to code now or defer. Highest-risk deliverable.
7. **Tier 2 keying**: recommendation is per contract as source of truth, with
   `negotiation-playbook-learning` owning the per-supplier aggregate DERIVED from
   those records, never from re-reading contracts. Lineage is the credibility
   argument.

---

## Standing constraints that must not be relearned

- **Accuracy before cost.** Multi-pass designs were deliberate. Never trim passes
  to go faster.
- **No model-tier routing.** Skills run on the user's Desktop on their model and
  must work on Sonnet.
- **No skill's ACCURACY may depend on cross-run persistence.** Desktop persistence
  is user-mediated and `timeline-builder` already documents its failure mode.
  Persistence may buy speed; it may never decide whether the work is done properly.
- **Determinism narrows, never decides, never drops.** Code proposes candidates;
  the model rules. Regions with no deterministic hit still get model eyes.
- **Never reverse a documented decision** to make something work now. Quote the
  decision log first.
- **Malicious-code review is mandatory** per increment.
- **No em dashes**, in prose or code.
- **Save and commit often.**

---

# UPDATE: coverage matrix complete (2026-07-29, end of session)

All three parts done. **342 rows, 0 strict blockers.** Files:
`_audit/F1-COVERAGE-MATRIX-PART1-mechanical.md` (118 rows),
`PART2-judgment.md` (89), `PART3-outputs-rules.md` (135).

Still owed: merge into one `_audit/F1-COVERAGE-MATRIX.md`.

## Part 3 justified the whole exercise: three real losses caught

Retiring `dashboard-canonical.md` would have silently deleted three things. This is
exactly the regression the coverage guarantee exists to prevent, and none of it was
visible without reading the file.

**1. The Deal-tab contribution section (lines 224-353) IS D1.** It was added
2026-07-29, earlier in the same session that retired the file. It documents this
skill's data slice into `deal-tab-1c344a`. Deleting the file deletes the slice
contract.

This also corrects an earlier audit finding. The claim "only deal-tab has a slice
contract" was wrong: contract-review has one too, it is just buried in the file
being retired. Re-check the other lens skills before trusting that finding.

**RELOCATE it to `references/deal-tab-contribution.md` BEFORE any deletion.**
`deal-tab-1c344a` does not reference it back, so there is no dangling reference
from that side, but the contract itself would be gone.

**2. The Obligations sub-tab.** Register, imbalance analysis, deadline-urgency
chips, verbatim-source-sentence field. `review-summary-design.md` has NO Obligations
section, so the dashboard was the ONLY place this analysis surfaced outside a Deal
build. Needs a new section in `review-summary-design.md` plus a field addition to
`pass-artifacts.md` Pass 4.

**3. The Documents sub-tab Compliance Evidence Checklist.** The fixed W-9 / SOC2
list with Filed / Draft / Pending / Awaiting states, plus the document-family
register. No surviving home. Maps to `contract-stack-map.md` as new Stage 1
deterministic checks.

`retentionClass()` and `evidenceStatus()` are pure lookups and port to the kernel at
no cost. Dependencies: `SKILL.md` has 9 references to the file, and
`examples/contract_review_canonical_dashboard.jsx` is wholly dependent and retires
with it.

## Rules affected

- **Rules 7, 9, 12** upgrade from instruction to code-enforced via
  `deduction_score()`.
- **Rule 12 needs a text edit**: it names "the dashboard's Protection Score panel"
  as an emission target that will no longer exist.
- **Rules 5, 10, 11** gain a deterministic first pass that narrows but never decides.
- **Rules 1-4, 6, 8** unchanged.

## Spec correction from Part 1

`deduction_score()` needs **TWO** calibration assertions, not one. The spec named
only the too-harsh direction. `risk-scoring.md` also carries the converse: a
standalone document with 5+ findings must not come in under 25 points. The
too-generous case is the more dangerous one, because it understates risk and nobody
questions a good number. Spec already corrected.

## Pre-existing quality issues found (not redesign defects)

Seven ambiguities in the judgment corpora where two reviewers would reach different
answers today. One is a real contradiction: **playbook section 18 sets a 3M floor
AND a 2x to 3x fallback, with no resolution when the fallback computes below the
floor.** The rest are unbounded or untestable terms. Worth Marc's attention
independently of this work, and they get MORE visible after the redesign, because
Stage 1 proposing candidates against an ambiguous rule produces inconsistent
candidates rather than absorbing the ambiguity in prose.

## Efficiency finding worth acting on

`playbook.md` and `pharma-requirements.md` are loaded **"Always", in full, with zero
narrowing** (`SKILL.md:658, 666`). 406 lines into every run regardless of relevance.
Retrieval indexing is a real saving at zero accuracy cost. A retrieval miss must
fall back to the FULL corpus, never to skipping the check.

## CORRECTED overnight sort

**Retiring `dashboard-canonical.md` is NOT safe** and is now blocked on the three
rescues above. Do the rescues first, as separate reviewed changes. This moves from
"blocked pending review" to "blocked with known required work".

Everything else in the SAFE list below is unchanged and still safe.

**Also note:** the rescue work touches `lilly-contract-review`, which is under the
documented HOLD at `PLATFORM-CONSOLIDATION-TRACKER.md:172`. Relocating the D1
section is additive and low risk, but it is still a held file. **Get Marc's
explicit go before touching it.**

---

# CORRECTION: obligations, and the output-mode gap it exposes (Marc, 2026-07-29)

## The decision

**Obligations analysis SURVIVES the dashboard retirement. Decided by Marc.**

His reasoning: obligations matter in a standalone contract review even when the
ONLY requested output is the redlined, commented, track-changes .docx. A missing,
one-sided or unbalanced obligation is precisely the kind of thing a reviewer raises
as a comment in the document.

So this is no longer an open question. It is required work.

## But Part 3's proposed destination is WRONG

Part 3 mapped the Obligations sub-tab content into `review-summary-design.md`. That
does not solve the problem Marc raised.

**If the only requested output is the redline, the Review Summary is never
produced.** Content mapped only into the Review Summary is still lost on a
redline-only run. The loss just moves from visible (a deleted file) to invisible (a
section that never renders).

### Correct destination

Obligations must reach the REDLINE path:

1. **The analysis runs in a pass regardless of output mode.** It is not conditional
   on which deliverable was requested. Extraction, imbalance analysis and
   missing-obligation detection happen every run.
2. **Findings surface as COMMENTS in the redline .docx**, anchored to the clause
   that creates or omits the obligation. That is the deliverable a redline-only user
   actually receives.
3. **And in the Review Summary** when that IS requested, in the fuller register
   form Part 3 described.
4. **And in the deal-tab slice** when a Deal build is running.

One analysis, three surfaces, none of them conditional on the others.

## The structural gap this exposes, which is bigger than obligations

Part 3 assigned destinations without checking WHICH OUTPUT MODES each destination
reaches. That is a systematic hole in the coverage matrix, not a one-off error.

**A row mapped to "the Review Summary generator" is silently lost on every run that
does not produce a Review Summary.** The same applies to any row mapped to a
deliverable the user did not request.

### Required fix to the coverage matrix

Add a column: **"Which output modes does this reach?"**

Then re-audit every mapped row in all three parts against it. For each row ask: if
the user requests ONLY the redline, does this check still run, and does its result
still reach the user? If the answer is no and the check matters standalone, the
destination is wrong.

The redline-only run is the strictest case and should be the test. It is also
plausibly the most common real-world use of this skill, which makes it the worst
one to have quietly degraded.

### Suspects to check first

Any row Part 3 mapped to `review-summary-design.md` or to the Review Summary
generator.

## The Compliance Evidence Checklist: same decision, same reasoning

**Marc, 2026-07-29: it survives too.** Also crucial to a standalone contract review
whose only output is the redlined, commented, track-changes .docx.

That is the right call and arguably more clear-cut than obligations. The checklist
tracks whether W-9, SOC 2 and the rest are Filed, Draft, Pending or Awaiting.
Missing evidence is a reason to comment on the document and a reason not to sign
it. A reviewer who receives only a redline and is not told the SOC 2 report is
outstanding has been given an incomplete review, whatever the redline says about
the clauses.

Same destination correction applies: it runs every run, surfaces as comments or a
front-matter note in the redline, appears in fuller register form in the Review
Summary when requested, and feeds the deal-tab slice when a Deal build is running.
Its deterministic parts (fixed document list, four-state status) map to Stage 1 as
Part 3 proposed; what changes is only WHERE the result has to reach.

## Status change

Both rescues are now DECIDED and required. Neither is an open question.

- **Obligations: DECIDED, required.** Destination corrected to the redline comment
  path plus the Review Summary plus the slice.
- **Compliance Evidence Checklist: DECIDED, required.** Same three surfaces.
- **D1 slice contract relocation:** was never a judgment call, still mandatory.
- **Coverage matrix: needs an output-mode column and a re-audit** before it can be
  called complete. It is not the finished gate it appeared to be an hour ago.

Both decisions point the same way, which is worth stating as a principle rather
than two one-off rulings: **a check that affects whether the contract should be
signed must reach the user in whatever single deliverable they asked for.** The
redline is the minimum deliverable, so it is the floor every such check has to
clear. Use that test on the remaining rows rather than re-litigating each one.
