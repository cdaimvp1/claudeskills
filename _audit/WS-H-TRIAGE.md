# WS H triage: the grounding items, classified against the repo as it stands

WS H was never triaged, which was the real problem: nobody had decided whether these
mattered. Each item below is measured against the current tree rather than argued about.

**Result: 1 closed by this programme, 2 effectively done, 4 genuinely open, 1 sequenced.**

It did not dissolve the way the A11 dependency audit did (where 10 of 19 citations proved
spurious). These are mostly real.

---

## H8 — CLOSED by this programme

*"Fix supplier-risk anti-fabrication reachability. The referenced file carries hard
anti-fabrication rules ('never assert a debarment, sanctions, breach or financial-distress
status without a cited source')."*

`supplier-deep-dive-1c344a/deep_dive_validator.py` now enforces exactly those rules in code
and refuses rather than warns, and A9 caught that it was initially unwired and forced it into
SKILL.md. The rule is no longer only reachable as prose.

**No action.**

---

## H6 and H7 — effectively done; VERIFY, do not rebuild

| item | measured |
|---|---|
| H6, gap-state discipline in the SKILLS as the dashboards have it | **29 of 32** skills carry gap-state language (`gap-stat`, `Data not available`, `NEEDS_INPUT`, `Information Not Provided`) |
| H7, record what was reachable in the deliverable | **30 of 32** carry a research log, reachability note or evidence register |

Both were written when the coverage was thinner. This programme added more: Rule 9a and 9b
in contract-review, the Compliance Evidence Register, and `Information Not Provided` in the
landscape generator.

**Action: confirm the 2-3 stragglers, then close.** Rebuilding either would be redoing
work that is already there, and the count is high enough that the remaining gap is a
short list rather than a workstream.

---

## H1 — REAL and open. 17 of 32.

*"Canonicalize the source-availability detection step. The pattern already exists and is
good, but is not uniform."*

Measured: **17 of 32** skills carry a reachability or source-availability step. Fifteen do
not. The plan's own framing is right: the pattern is good, it just is not everywhere.

**Recommendation: do it, and do it AFTER H2.** A canonical detection step that reports into
fifteen bespoke degradation ladders is half a mechanism. Sequencing matters more than the
work here.

---

## H2 — REAL and open. 30 bespoke ladders.

*"Define one canonical degradation ladder. Today each skill writes its own degradation
prose."*

Measured: **30 of 32** skills write their own. That is not a style problem. Thirty
independently-worded ladders can disagree about what "degraded" means, and a user cannot
learn the convention once and trust it, which is exactly the property a ladder is for.

**Recommendation: do this FIRST of the four open items.** It is the one the others depend
on, and it is the one whose absence quietly costs the most.

---

## H4 — REAL, open, and the biggest. 6 of 32.

*"Move provenance from per-document to per-fact."*

Measured: **6 of 32** skills carry any per-fact provenance notion (`sourceRef` or similar).

This is also the blocker for **#31 / H5 proper**, and that blocking relationship is correct
rather than bureaucratic: building a resolve-check on every emitted citation without a
per-fact provenance field means inventing that field, which is H4's whole job. My H5
findings document said this before this triage and nothing has changed it.

**Recommendation: this is the real WS H project.** The other three are tractable; this one
is a data-model change across the suite. It should be scoped on its own, not bundled.

---

## H10 — REAL and open, but SMALLER than it looks. 1 adopter.

*"Adopt the comms-evidence 5-step methodology beyond deal-room."*

Measured: only `deal-room` adopts it.

But the canonical contract
(`_redesign_proposals/RFX-DEAL-HANDOFF-AND-COMMS-EVIDENCE.md`) names its intended consumers
explicitly: deal-room, the two negotiation-prep skills, and rfx-hub. That is **four**
skills, not thirty-two. A suite-wide rollout is not what the source document asks for.

**Recommendation: scope to the three named non-adopters.** Worth checking whether the
methodology is genuinely needed in each before writing it in; a methodology adopted where
it has nothing to bite on is the "statistic-improving edit" the H3 document argued against.

---

## H9 — SEQUENCED, not independently actionable

*"Reconcile G7 research minimums with the availability ladder."*

26 skills carry Research Minimums. The reconciliation cannot happen before the ladder is
canonical, because there is currently no single ladder to reconcile them against.

**Recommendation: hold until H2 lands, then it is small.**

---

## Suggested order, if this gets picked up

1. **H2** the canonical ladder, because H1 and H9 both need it
2. **H1** the detection step, reporting into H2's ladder
3. **H9** the reconciliation, which is short once 1 and 2 exist
4. **H6 / H7** confirm the stragglers and close
5. **H10** scoped to the three named skills, after checking each needs it
6. **H4** on its own, as a data-model project, which then unblocks #31

The first five are a contained piece of work. H4 is the one that deserves a real decision
about whether the suite wants per-fact provenance, because it touches everything.
