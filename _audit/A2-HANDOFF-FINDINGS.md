# A2 — RFx to Deal handoff emitter

Built: `rfx-hub-1c344a/rfx_handoff_emitter.py` + `rfx_handoff_selftest.py` (28/28).

A2 called this an "unwired half-contract": the consumer side (deal-room Phase 1) was wired
on 2026-07-25 and the emitter was honestly deferred until `rfx-hub` existed. It exists now,
so this closes the seam.

## What was built

A deterministic generator, stdlib-only so it runs in Claude Desktop with no install step.
The object is ASSEMBLED BY CODE rather than narrated, on the suite's usual division:
code owns validation, arithmetic, assembly and invariants; the model owns narrative.

The schema is NOT forked. `RFx-REDESIGN-SPEC.md` section C owns it; this module implements it.

`build_handoff(rfx_event)` returns the `RfxToDealHandoff`. `to_deal_room_seed(handoff)`
projects it into deal-room's Phase 1 intake shape, which is what makes A2's verify clause
("assert every required field round-trips and `sourceRef` survives") a test rather than a
claim: T10-T15 run the projection and assert on it.

## The claim-gate on the seam

An uncited commitment is neither an error nor dropped. It is **demoted**: it seeds as an
OPEN issue labelled `[CONFIRM ...]` and never as an agreed position, so Deal Room cannot
inherit a starting agreement nobody can source.

This is the precise reading of "drop, do not dilute": the CLAIM is dropped, the FINDING
survives. An invariant check enforces it, raising `DroppedFindingError` if the count of
commitments entering does not equal the count leaving as commitment-or-demotion. A gate that
can silently lose a finding is not a gate.

## What it refuses

A handoff is where one skill's output becomes another's starting position, so a wrong number
is inherited by the whole negotiation. Every one of these raises instead of emitting
something plausible:

| refusal | why a default would be wrong |
|---|---|
| no selected supplier / selection not final | RFx never writes past selection |
| TCO components that do not sum to the total | an unauditable total is what this seam exists to prevent |
| a component with no amount | treating it as 0 understates the total, silently |
| a TCO with a total but no components | same, from the other direction |
| a finding that neither survives nor is demoted | the claim-gate may change status, never delete |

An unresolved `gateConflict` is carried into `openIssues` rather than resolved in either
party's favour. Tolerance on the TCO sum is one cent: a rounding allowance, not a fudge factor.

## Finding: one contract value had THREE spellings

The TCO tag is a literal in a contract that two skills must agree on. It was written three
different ways:

| source | spelling |
|---|---|
| `RFx-REDESIGN-SPEC.md` section C (the authoritative schema) | `indicative — firm in negotiation` (em dash) |
| `RFX-DEAL-HANDOFF-AND-COMMS-EVIDENCE.md` (the canonical contract doc) | `indicative - firm in negotiation` (hyphen) |
| `deal-room-1c344a/SKILL.md:216` (the consumer) | `indicative, firm in negotiation` (comma) |

Any round-trip equality check would fail against at least two of the three, and the em-dash
form also violates the standing no-em-dash rule while the canonical doc explicitly declares
itself em-dash-free.

**Resolved to the hyphen form**, defined once as `TCO_TAG` in the emitter and asserted by
T4. T5 additionally asserts no em dash appears anywhere in the emitted object.

**CLOSED 2026-07-29 (Marc: "align the docs to the hyphen form").** Both disagreeing sources
were corrected, so all three now carry `indicative - firm in negotiation`:

- `_redesign_proposals/RFx-REDESIGN-SPEC.md:141` (was the em dash)
- `deal-room-1c344a/SKILL.md:216` (was the comma)

The only remaining occurrences of the old spellings are in this file and the run log, where
they are quoted deliberately as the record of what the defect was. Do not "fix" those: a
findings document that no longer states the finding is useless.

## Self-test coverage

28 assertions. Every negative case asserts the SPECIFIC exception type, because a test that
passes on an unrelated crash is worse than no test.

The suite caught a real error during authoring: my own T14 expected 5 seeded issues where 4
is correct, because a demoted commitment must be counted once (as an open issue) and not
twice. The code was right and the expectation was wrong.
