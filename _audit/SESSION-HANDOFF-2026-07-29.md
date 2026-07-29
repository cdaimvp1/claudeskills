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
