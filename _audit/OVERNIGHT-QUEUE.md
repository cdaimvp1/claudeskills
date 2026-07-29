# Overnight autonomous queue

Prepared 2026-07-29 for an unattended run. Read
`_audit/SESSION-HANDOFF-2026-07-29.md` and `_audit/OPTIMIZATION-PRINCIPLES.md`
first.

**Standing rule for the whole run: when blocked, STOP AND LOG IT.** Do not guess,
do not work around, do not touch anything in the DO NOT TOUCH list to unblock
yourself. Commit after each item. Malicious-code review is mandatory per increment.

---

## Tier 1: highest value, fully autonomous

### O1. Re-audit the coverage matrix for output-mode coverage
**Why it is first:** the matrix currently reports 342 rows and zero blockers, and it
is NOT actually complete. Part 3 assigned destinations without checking which output
modes each destination reaches, so any row mapped to a deliverable the user did not
request is silently lost. Marc found this via obligations; it is systematic.

**Do:** merge the three parts into `_audit/F1-COVERAGE-MATRIX.md`, add a column
"which output modes does this reach", and re-audit all 342 rows against this test:
*if the user requests ONLY the redlined track-changes .docx, does this check still
run, and does its result still reach them?*

A check that affects whether the contract should be SIGNED must clear that floor.
Report every row that fails. Do not fix the skill; produce the corrected matrix.

**Verify:** every row has an output-mode value; failures are listed separately with
a proposed destination.

### O2. Build `deduction_score()` in the kernel
**Safe because** it lives in `lilly-procurement-kernels-1c344a`, NOT in the held
contract-review. Nothing calls it until wired, so it cannot change any skill's
behaviour tonight.

**Do:** deduction model. Starts at 100. Subtracts per-finding deductions weighted by
the four coverage columns (Standalone / Governed: Covered / Governed: Confirm /
Governed: Gap). Hard Stops always -15, never reduced. NOT `weighted_score()`, which
is the wrong shape.

**TWO calibration assertions, both must raise:**
1. too harsh: zero Hard Stops plus 10+ covered categories must not exceed 30 points
2. too generous: a standalone document with 5+ findings must not come in under 25

**Verify:** unit-test against the worked example in
`lilly-contract-review-1c344a/references/risk-scoring.md` (deductions -36, score 64).
Stdlib only, matching the existing kernel functions. Add a self-test block like the
other generators have. Do NOT wire it into contract-review.

### O3. Audit G12 claim-gate implementation versus mention (item H3)
**Why it matters:** G12 is the suite-wide anti-fabrication rule and appears in only
2 of 31 SKILL.md files. This is the most load-bearing item in WS H.

**Do:** read-only pass over all 31 skills. Per skill: is G12 declared, is it
actually implemented (NEEDS_INPUT / [CONFIRM] markers, cite-or-abstain behaviour,
gap-state rendering), or merely mentioned. Produce `_audit/H3-G12-AUDIT.md` with
file:line evidence and a per-skill verdict. Fix nothing.

### O4. Desktop runtime audits G1 to G7
**Do:** read-only inventories, one output file. Third-party imports and whether they
are guarded; cross-skill path references (12 skills read
`/mnt/skills/user/lilly-brand-assets-1c344a/...`, including the supplier-risk
anti-fabrication rules, so a partial install silently drops a guardrail); builder
self-containment; output-path portability; tool and connector assumptions.

**Verify:** produce findings only. Do not fix. Fixing is G9 and needs review.

---

## Tier 2: valuable, autonomous, lower risk

### O5. Fix the stale `case-handoff-schema.md` (item E1)
rfp-case-manager's copy is correct and explicitly calls rfp-engine's superseded
legacy. Bring rfp-engine's into line, and add the numeric kernel's discipline: a
named source of truth plus a do-not-hand-edit header. This is the one REAL drift bug
in the suite.

### O6. Kernel-copy verification manifest (item C9)
Manifest of the 12 vendored `numeric_kernel.py` copies with hashes, so future drift
is detectable by script rather than by an audit that mistakes comment changes for
drift, as this one did.

### O7. Re-check the other lens skills for slice contracts
Part 3 found contract-review HAS a slice contract, buried in the file being retired.
The earlier finding "only deal-tab has one" was therefore wrong. Re-check every lens
skill and correct `_audit/SYNTHESIS.md` and `_audit/RECONCILIATION.md`.

### O8. B6 and B7 cleanup, NON-HELD skills only
Orphaned static dashboard HTML and stale superseded prose. Skip anything in the DO
NOT TOUCH list. If a file's status is unclear, skip it and log it.

---

## DO NOT TOUCH tonight

| Item | Why |
|---|---|
| **`lilly-contract-review` ANY file** | Documented HOLD, `PLATFORM-CONSOLIDATION-TRACKER.md:172`. The obligations and Compliance Evidence rescues are DECIDED but still need Marc's explicit go to edit a held file. |
| **Retiring `dashboard-canonical.md`** | Three rescues must land first, one of which is the D1 slice contract itself. |
| **WS J orchestration** | Open decision conflict: the audit recommended a new skill, contradicting the locked THEO-maturation decision. Do not start either way. |
| **I1 help-desk** | Marc decision pending. I2 is network-blocked regardless. |
| **A11 lock the hubs** | Needs Marc sign-off. |
| **B1, B2 category-strategy spec** | Needs Marc confirming 5 tabs. |
| **Any locked dashboard artifact** | Deal, RFx, Landscape, Category Strategy are locked. |
| **Phase 2 work ahead of Phase 1** | Phase order is locked. O2 and O5 are exceptions only because they touch neither a held file nor a locked artifact. |

---

## Recommended run

**O1, O2, O3 in parallel; then O5, O6, O7 in parallel; O4 alongside; O8 last.**

O1 is the single highest-value item, because it corrects a gate that currently
misreports itself as passed. O2 is the highest-value BUILD, and the one thing on
this list that leaves a working artifact behind.

## Morning report

Leave `_audit/OVERNIGHT-REPORT.md`: what completed, what was skipped and why, every
STOP AND LOG, and the decisions now waiting on Marc.
