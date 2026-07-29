# Audit reconciled against the planning corpus

The skills audit (`_audit/SYNTHESIS.md`) read 31 SKILL.md files and no trackers.
Three readers then cross-checked its findings against 57 planning documents
(`_audit/TRACKERS-A/B/C`). This is the corrected picture.

Reader coverage was uneven and is disclosed: reader B used 1 tool call, reader C
used 29. Both of B's strong claims were spot-verified directly and held.

---

## The headline: most of the audit was already known

| Finding | Status after cross-check |
|---|---|
| F1 kernel arithmetic in prose | **Mostly known.** playbook-learning kernel is #113 GREEN LIT; Protection Score is #114 GREEN LIT/HELD. The corpus had already corrected a prior misdiagnosis of this same finding. NEW: rfp-response-analysis's Bid Leveling defect. |
| F2 dead generators | **GENUINELY NEW.** No prior doc records them as built-but-unwired. **Now wired (03f29f8).** |
| F3 slice contracts | **Designed and approved, not missing.** See below. |
| F4 category-strategy retired pattern | **Known, approved, outstanding.** Retiring the JSX-clone is explicit at `PROGRAM-MASTER-PLAN.md:99,110`. NEW: the tab-count drift below. |
| F5 four slowness mechanisms | **GENUINELY NEW** as specifics, under the existing CC2 efficiency mandate. |
| F6 help-desk inert | **Known and tracked.** |
| F7 orchestration as a new skill | **CONTRADICTS A LOCKED DECISION.** See below. |

## Three corrections to the audit

**1. Orchestration: the audit contradicts a locked decision.**
`docs/master-plan.md:312-345` (Stage 8) and `docs/theo-redesign-plan.md` frame
orchestration as "the MATURATION of procurement-launcher (THEO), NOT a new skill",
with a first pass already shipped 2026-07-22 and continuing as WS4.

The audit reasoned honestly from THEO's own "dispatcher, not an orchestrator"
line, but that line describes THEO as it is today, not what was decided for it.
**Marc's call. Do not proceed on the audit's version.**

**2. Slice contracts are designed, approved and sequenced.**
`MASTER-REMAINING-WORK.md:320` carries the approved field-ownership table:
contract-review owns `issues[]`/`documentConflicts[]`/`protection{}`/
`obligations[]`/`tacticFlag`; scope-sow owns `scope{}`; pro-forma owns
`commercialLines[]`/`scenarios[]`/`assumptions[]`/`proforma{}`/`benchmarks[]`.
Tagged `[Marc, after D0-D2]`. A second, richer design covers the RFx feeders in
`RFx-REDESIGN-SPEC.md` section D.

"Only 1 of 31 skills has a slice contract" was true but framed wrongly: the work
is designed and deliberately sequenced, not overlooked.

**3. The kernel finding is weaker than stated.**
Guardrail G11 (`lilly-brand-assets-1c344a/SKILL.md:1104`) requires kernel use only
for skills that ALREADY vendor a kernel. It does not mandate that every skill have
one. So negotiation-playbook-learning, supplier-landscape and category-strategy
doing arithmetic in prose are outside G11's scope, **not in violation of it**: an
open design question, not a compliance failure. The Protection Score case is a
kernel-coverage gap, since the function does not exist to call.

## Two things the audit missed entirely

**The parent decision.** `_redesign_proposals/DASHBOARD-ARCHITECTURE-DECISION.md`
(2026-07-25) locks one deterministic dashboard per hub, model authors ONLY the
data object, per-skill reference JSX retired suite-wide. That is the origin of
both F3 and F4, and its cleanup vehicle (WS3a) is already scheduled.

**The generator pattern was already the named fix.** `docs/master-plan.md:182-198`
diagnoses model-assembled documents as the cost and quality problem and names the
generator pattern as the remedy. So wiring the two dead generators was on-plan,
not freelance.

## Two genuinely new problems

**Undocumented tab drift on Category Strategy.** Verified directly:

- legacy: 11 tabs, still literally in `category-strategy-1c344a/SKILL.md:746`
- approved 2026-07-25: 7 tabs (`CATEGORY-STRATEGY-REBUILD-PLAN.md`), formalized
  2026-07-27 in `_category_build/CATEGORY-STRATEGY-BUILD-SPEC.md:44` under the
  heading "Structure - 7 tabs, not 11"
- **locked 2026-07-29: 5 tabs** (`VERSION-LOCK-2026-07-29.md:27`)

No document narrates the 7 to 5 fold. The build spec of record still says 7 while
the locked artifact has 5. Three different tab counts now live in three places.
This happened during this session's work and should be written down.

**Handoff schemas have no source-of-truth discipline.** rfp-case-manager's
SKILL.md:723 calls its copy a "mirror" and flags rfp-engine's as superseded legacy
behaviour. The drift is self-documented and unresolved. The numeric kernel avoids
exactly this with a named source of truth and a do-not-hand-edit header; the
handoff schemas have neither.

## Sequencing: the audit's recommended order violates the locked phase order

`PROGRAM-MASTER-PLAN.md:41-43` (re-sequenced with Marc 2026-07-26): "The
dashboards gate almost everything, so they go first; a skills-file CLEANUP pass
sits between the dashboards and the deep skills work (so Claude never weeds
through retired content); the ARIA conversion is DEAD LAST."

Three hubs are still unlocked: `rfx-hub`, Deep Dive, My Work. The audit's order
would interleave Phase-2 repair ahead of finishing Phase 1.

Note that the cleanup pass sitting between the two is exactly where
category-strategy's retired-pattern removal belongs.

**The generator wiring already done (03f29f8) jumped this sequence.** Marc
authorized it directly, so it stands, but it is recorded here as a deliberate
exception rather than a precedent.

## Corrected order, respecting the locked phases

1. **Finish Phase 1:** `rfx-hub`, Deep Dive, My Work.
2. **The skills-file CLEANUP pass** already scheduled between the phases: retire
   category-strategy's JSX-clone spec and its 11-tab structure, and settle the
   tab count at 5 in the build spec.
3. **Phase 2 repair:** kernel adoption (#113, #114, plus the new Bid Leveling
   defect), slice contracts per the approved ownership table, handoff-schema
   source-of-truth discipline, and the four slowness mechanisms.
4. **Orchestration as WS4**, maturing THEO, per the locked decision rather than
   the audit's recommendation.

## Open for Marc

1. Orchestration: confirm THEO-maturation (locked) over a new skill (audit's
   recommendation).
2. Category Strategy tab count: 5 is locked and built; the spec says 7. Confirm 5
   and correct the spec.
3. help-desk: ship as a sibling skill, or fold into process-navigator as a mode.
