# H3: G12 claim-gate, implementation vs mention

**Read-only audit, 2026-07-29. Findings only, nothing fixed.**
Reproduce with `python _audit/h3_claimgate_audit.py`.

---

## The premise was misleading, and correcting it is the main finding

The item was raised because **G12 is named in only 2 of 31 SKILL.md files**, which reads
like a guardrail nobody adopted.

That statistic is true and it measures the wrong thing. G12 (`lilly-brand-assets-1c344a/
SKILL.md:1113`) is explicitly a **consolidation** of rules that already existed: "This
consolidates the anti-fabrication rules already stated in GLOBAL OPERATING RULES 3 and 8
and the supplier-risk reference into one enforceable guardrail." Skills implement those
underlying rules and never had reason to start citing the new umbrella label.

So the audit scored the **mechanisms** G12 specifies rather than the label:

| Grade | Count |
|---|---|
| IMPLEMENTED (carries abstain, cite and anti-fabrication) | **30 of 32** |
| PARTIAL | 2 |
| MENTION-ONLY | 0 |
| ABSENT | 0 |

**G12's substance is broadly in force.** Naming it is a documentation gap, not a control
gap. The 2-of-31 figure should not be used to argue the guardrail is unadopted.

## A false finding I caught in my own first pass, recorded because it is the same error

The first run graded `rfx-hub` and `deal-tab` **ABSENT** on all three core mechanisms. Both
in fact carry the abstain and anti-fabrication rules, worded as:

> "Absent data is gap-stated in place, naming the field that would fill it. Nothing is
> invented to complete a layout."

My patterns looked for `NEEDS_INPUT` and `[CONFIRM:` and missed `gap-stated`. That is
exactly the mistake the headline statistic makes: **matching the wording instead of the
mechanism.** Patterns corrected, both regraded, and the variants enumerated in the script
with a comment saying why, so the next reader does not re-introduce it.

---

## Real gap 1: "DROP, do not dilute" is adopted NOWHERE

The sharpest finding, and the only G12 mechanism with genuinely zero uptake.

G12 says: *"a generated finding that cannot cite a source is dropped, not reworded into an
unsupported observation."*

**Hits across all 32 skills: 2, both inside G12's own definition in `lilly-brand-assets`.
Every other skill: 0.**

This matters more than its adoption rate suggests, because it is the subtlest of the three
behaviours and the one a model will get wrong by default. Faced with a finding it cannot
source, the natural move is to soften it into something defensible ("the agreement may not
fully address X") rather than delete it. That produces a deliverable full of unfalsifiable
observations that read as analysis. Abstaining is visible; diluting is not.

**Recommendation:** add the drop-do-not-dilute rule to the skills that generate findings
from judgment corpora, which is where dilution is available as an escape: contract-review,
supplier-deep-dive, supplier-landscape, legal-negotiation-prep, commercial-negotiation-prep,
category-strategy. Not needed in the composition dashboards, which do not generate findings.

## Real gap 2: 11 of 32 skills have no code-enforced gate

The claim-gate is an instruction in these, so it can be forgotten:

```
deal-tab-1c344a            lilly-brand-assets-1c344a    process-navigator-1c344a
procurement-help-desk      procurement-launcher         rfx-hub-1c344a
supplier-deep-dive         theos-field-guide            timeline-builder
voice-profile              workflow-map
```

`OPTIMIZATION-PRINCIPLES.md` is direct about this: "A generator that RAISES on a
NEEDS_INPUT field beats an instruction telling the model not to fabricate, because the
instruction can be forgotten and the exception cannot."

Not all eleven are equal. `voice-profile`, `workflow-map` and `timeline-builder` produce
little or no cited output, so the absence is defensible. **`supplier-deep-dive` is the one
to look at first**: it generates a single-vendor dossier full of exactly the status
assertions G12's third prohibition names (debarment, sanctions, financial distress,
certifications), and it has no code path that refuses.

## Real gap 3: four skills missing a core mechanism

| Skill | Missing | Assessment |
|---|---|---|
| `procurement-help-desk-1c344a` | ABSTAIN | **Genuine gap.** It answers questions; an unanswerable one needs a gap marker rather than a plausible answer |
| `workflow-map-1c344a` | ABSTAIN | Genuine but low stakes: it maps process, and it asserts little |
| `rfx-hub-1c344a` | CITE | **Largely closed today.** The D4 slice contracts authored 2026-07-29 require `sourceRef` on every field and make an uncited field a build failure. The SKILL.md prose has not caught up with its own contract |
| `deal-tab-1c344a` | CITE | Same shape as rfx-hub, and its slice contract predates D4. Worth the same treatment |

---

## What I would NOT do

**Do not add "per G12" labels across 30 skills to make the statistic look better.** The
mechanisms are present; adding the citation changes nothing about behaviour and creates 30
diffs whose only effect is to make a future audit of this kind report a nicer number. If
the label is wanted for traceability, that is a documentation decision, not a control fix,
and it should be described as such.

The three real items are the drop-do-not-dilute gap, the eleven unenforced gates with
`supplier-deep-dive` first, and the two genuine ABSTAIN gaps.

## Method and its limits

Scored per skill over `SKILL.md` plus every `.md` in that skill's `references/`, since the
mechanisms often live in reference files rather than the main body.

**This is a text audit and it proves presence, not correctness.** A skill can carry every
mechanism and still apply them badly at runtime; only the golden fixture and the G8 smoke
test can speak to that. Read this as a map of where the guardrail is declared, not as
evidence that it fires.

---

# RESOLUTION, 2026-07-29

Final state: **32 IMPLEMENTED, 0 PARTIAL, 0 MENTION-ONLY, 0 ABSENT.**

## Gap 1, drop-do-not-dilute: CLOSED

Added to the five finding-generating skills where dilution is available as an escape:
supplier-deep-dive, supplier-landscape, legal-negotiation-prep, commercial-negotiation-prep,
category-strategy. Placed under GLOBAL OPERATING RULE 3, which is one of the two rules G12
says it consolidates, rather than bolted on as a new section.

`lilly-contract-review` is on the list in principle but is **HELD**, so it was excluded and
verified untouched. It needs the same bullet when the hold lifts.

Adoption went from 1 skill (brand-assets, its own definition) to 7. It was deliberately NOT
sprayed across all 33 files carrying the shared rules block: the composition dashboards do
not generate findings, so the rule has nothing to bite on there, and adding it would be
exactly the statistic-improving edit this document argued against.

## Gap 2, no code-enforced gate: CLOSED for the skill that mattered

`supplier-deep-dive-1c344a/deep_dive_validator.py` + self-test (20/20). It enforces THIS
SKILL'S OWN quoted rules, not a standard invented for it, and it refuses rather than warns:

- a gated status (debarment / sanctions / breach / financial distress) asserted with no
  cited source
- a gating item carrying any status other than `REQUIRES_FORMAL_SCREEN`, because a `PASS`
  here is a fabricated clearance and this skill routes gating items to an SME rather than
  adjudicating them
- a gating item with no SME route
- a diluted finding, in a risk dimension or in the recommendation rationale
- named customers or financial figures against an empty research log
- a confidence value outside High / Medium / Low

It carries **negative controls**: honest abstentions ("Not verified, requires a formal
screen", "Not Publicly Disclosed", an empty financials block, no gating items at all) must
PASS. A gate that refuses everything is as useless as one that refuses nothing, and that is
the failure mode a strict validator actually reaches, because every tightening looks like an
improvement until it starts rejecting honest abstentions.

Check ORDER was corrected during the build: the generic uncited-claim check originally fired
before the specific gated-status and dilution checks, so a diluted sanctions claim was
reported as merely uncited. That tells the reader to add a citation when the correct action
is to delete the sentence.

The other ten skills keep instruction-only gates. `voice-profile`, `workflow-map` and
`timeline-builder` remain defensible; the rest are lower-stakes than deep-dive and are not
closed here.

## Gap 3: was mostly MY OWN MEASUREMENT ERROR

Only one of the four entries survived contact with the evidence.

| skill | claimed gap | actual |
|---|---|---|
| `procurement-help-desk` | missing ABSTAIN | **FALSE POSITIVE.** SKILL.md:138 says "ABSTAIN rather than fabricate", the most direct possible statement of the mechanism |
| `workflow-map` | missing ABSTAIN | **FALSE POSITIVE.** Rule 2 marks an unknown stakeholder `[OWNER?]` rather than inventing one, which is cite-or-abstain applied to stakeholders |
| `rfx-hub` | missing CITE | closed by its own D4 slice contract, as this document predicted |
| `deal-tab` | missing CITE | **GENUINE.** Fixed: its slice contract now requires a `sourceRef` on every field, matching rfx-hub |

### The pattern this audit kept repeating

Four false negatives, all the same mistake: **matching wording instead of mechanism.**

1. `rfx-hub` / `deal-tab` graded ABSENT because the patterns missed `gap-stated` (caught in
   the original pass, and the reason this document warned about it).
2. `procurement-help-desk` graded missing ABSTAIN because the ABSTAIN pattern list did not
   contain the word **"abstain"**. The abstain audit could not detect the word abstain.
3. `workflow-map` graded missing ABSTAIN because it uses `[OWNER?]` as its marker.
4. A fifth near-miss: the fix for (2) was written into the script with a corrupted escape,
   so the pattern became a literal backspace character. It matched nothing and the audit
   **silently reported zero** rather than erroring. A regex that cannot match is
   indistinguishable, in the output, from a skill that lacks the mechanism.

All patterns are now enumerated in the script with comments saying why each exists, plus a
generic bracketed-placeholder pattern so the next skill that coins its own marker is caught
without another round of this.

**The standing conclusion in "Method and its limits" is stronger than first written.** This
is a text audit; it proves presence, not correctness, AND its absence findings are
unreliable in a specific direction: they under-report, because a mechanism expressed in
unanticipated words reads as a missing mechanism. Treat an ABSENT from this tool as a
prompt to go and read the skill, never as a finding on its own.
