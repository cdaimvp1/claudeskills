---
name: rfx-hub-1c344a
description: >
  RFx hub: the static, single-file analytical dashboard for an active RFx event under
  evaluation. Assembles one self-contained HTML artifact from a single data object, on the
  platform chrome, across four subtabs: Overview, Scoring, Analysis, Recommendation. It is
  the convergence point for the RFx-family lens skills, which own the content: rfp-engine
  supplies criteria/requirements structure, rfp-case-manager supplies event state and QA,
  rfp-response-analysis supplies bid-leveled supplier data, evaluation-engine supplies panel
  scoring. Deterministic: the same data object in produces a byte-identical dashboard out.
  REFLECT-ONLY, and static: no state, no persistence, no sends, no writes. Triggers: "RFx
  dashboard", "RFx tab", "build the RFx dashboard", "RFx hub".
metadata:
  owner: Lilly Global Procurement
  status: rehomed 2026-07-29 (build tree moved from repo-root `_rfx_build/`; the dashboard
    itself was already LOCKED before the move)
---

# RFx hub

## What this is, and what it is not

This skill builds ONE artifact: a single self-contained HTML file that renders an RFx event
for evaluation. It holds no state between runs, sends nothing and writes to no system.

It is **not** an editor. Nothing here mutates a live RFx event, writes back to
`rfp-case-manager`'s case file, or drives supplier communications. It is a reflect-only
snapshot rendered from whatever data object it is given.

It is **not** `rfp-engine`, `rfp-case-manager`, `rfp-response-analysis`, or
`evaluation-engine`. Those four skills each own a slice of the data this dashboard renders
(see Output slice contract below); none of them owns the composed view, and this skill does
not duplicate their analysis logic. If a request is to draft an RFP, manage a live case, score
a bid, or run leveling, that is one of those four skills, not this one.

## Information architecture, LOCKED

One tab, four subtabs, module state `RFX_SUB`:

| Subtab | Content |
|---|---|
| **Overview** | event summary |
| **Scoring** | panel scoring grid |
| **Analysis** | cross-supplier comparison |
| **Recommendation** | recommended award and rationale |

This is the base-build scope proven against the real platform's `rfxHTML()` render path: all
four subtabs render, no panels added or removed. No structural change without owner approval.

## Where the code is

    dashboard/build_dashboard_rfx.py    assembler; run it, no arguments (writes rfx-dashboard.html)
    dashboard/assets/                   vendored platform render code + chrome + fonts + data

The builder resolves every asset relative to its own directory (`BUILD_DIR = os.path.dirname
(os.path.abspath(__file__))`); it does not reach outside its own skill folder. Unlike
category-strategy's original build tree, this one carries its own chrome extraction
(`extract_chrome()` inlined in `build_dashboard_rfx.py`) reading straight from its own vendored
`assets/app-shell.js` and `assets/theo-brand.js` -- there is no `_platform_build/` cross-
reference to vendor here at all.

Verified on the 2026-07-29 rehome from repo-root `_rfx_build/`: built from inside a directory
containing ONLY a copy of this skill (no sibling `_rfx_build/` or `_platform_build/` present),
output is byte-for-byte (SHA-256) identical to the dashboard built from the original
`_rfx_build/` location.

Markup changes must go through `assets/pv/pv-09-rfx.js` (the render code) or the seed data.
Editing a built HTML file is overwritten by the next build.

## Output slice contract

This dashboard does not author content. The model authors ONLY the data object; the builder
renders. Each lens skill owns a slice of the `RFX` object (`{criteria, requirements,
suppliers, panel, qa}`, seeded in `assets/pv/pv-04-domain-data.js` / `assets/seed/
project-view.js`'s `projectView.domain.rfx`):

| Skill | Owns (spec-derived) | Owns (inferred, see below) | Label |
|---|---|---|---|
| `rfp-engine-1c344a` | `criteria[]`, `requirements[]` (the RFP structure; weight-sum discipline lives here) | `scale`, `structureLocked` | |
| `rfp-case-manager-1c344a` | `qa[]` | `intent`, `doc`, `dueDate`, `tco`, `cci`, `awardBasis`, `phase`, `internalFlags` | |
| `rfp-response-analysis-1c344a` | `suppliers[]` (coverage, AI first-pass scores, Bid-Leveled commercial figures normalized to the common basis) | | **proposed** |
| `evaluation-engine-1c344a` | `panel[]` (panel scoring, official ranking, dispersion, calibration, audit trail, readiness) | `modelDecision` (award-scenario re-weighting, i.e. sensitivity), `blocker`, `finalLocked` | **official** |
| this skill, hub-local | | `me` (viewing user identity, not event data) | |

**All 19 top-level keys of the shipped `RFX` object are accounted for above.** That is the
point of the table, and it was not true before: the earlier version named 5 keys against an
object carrying 19, so 14 fields had no owner at all. A field owned by nobody is the defect
this contract exists to catch, so leaving them unlisted defeated it.

**Read the two "Owns" columns differently.** The spec-derived column comes from
`MASTER-REMAINING-WORK.md:320` and `_redesign_proposals/RFx-REDESIGN-SPEC.md` section D, and
is settled. The inferred column is my reading of the seeded object
(`dashboard/assets/seed/project-view.js`, `projectView.domain.rfx`) against each skill's
stated remit, and is NOT approved design. Each assignment is defensible (`scale` to
rfp-engine because that skill already mandates the suite-canonical 0-5 band set at
`rfp-engine-1c344a/SKILL.md:384`; the event metadata to rfp-case-manager because it is the state and lifecycle
owner; `modelDecision` to evaluation-engine because scenario re-weighting is sensitivity
analysis) but defensible is not the same as confirmed. **Marc should confirm the inferred
column.** Until he does, treat it as the working assignment rather than the contract.

Each of those four carries the matching "RFx-hub contribution, output slice" section in its
own SKILL.md. The contract is two-sided on purpose: a reader can check it from either end,
and a field that appears here but in no feeder is a defect visible without running anything.

No lens skill builds its own version of this dashboard. Each contributes its slice; this skill
never re-derives scoring, leveling, or requirements math that one of those four already owns.

**Three rules this table only works under.**

**Proposed and official never render indistinguishably.** rfp-response-analysis contributes
an AI first pass; evaluation-engine contributes the panel's decision. That labelling is an
accuracy mechanism, not presentation: an AI first pass read as a panel outcome is the exact
failure it exists to prevent. If this dashboard cannot show the distinction, it does not show
the scores. Where the two disagree, that disagreement is surfaced as a finding for a human,
never reconciled arithmetically here.

**Every field carries a `sourceRef`.** A field arriving without one is a build failure, not
a gap to render. Gap-stating is for data that is genuinely absent and named as such; an
uncited value is worse than a missing one, because it looks like evidence.

**A field owned by nobody fails the build.** If this dashboard needs a value that no feeder
declares, the fix is to extend the owning feeder's slice, never to compute it here. Silently
deriving it would make this skill a fifth source of truth, which is the duplication the
composition model exists to remove. The build-time assertion for this is D7.

## Honesty rules

Absent data is gap-stated in place, naming the field that would fill it. Nothing is invented
to complete a layout. The base build seeds from `PROJECTS.nimbus` (the demonstration project);
a real run must replace that seed with the live event's data object before building.

## Known limitation, carried from the original build

A few RFx click handlers reached only by user interaction (not by the boot-time render
itself) call `closeDrawer()`, which lives in the platform's workflow-chrome module and is
out of scope for this single-tab, no-drawer build (documented in `build_dashboard_rfx.py`'s
own header). The base render — mount plus all four subtabs — does not reach them and is
unaffected. Same acceptance boundary as the Deal-tab and Landscape builds.

## Send winner to Deal (the RFx-to-Deal handoff)

When a winner is selected and the selection is final, emit the `RfxToDealHandoff` with the
generator. Do NOT hand-write the object: the schema is owned by
`_redesign_proposals/RFx-REDESIGN-SPEC.md` section C and must not be forked, and the numbers
in it are inherited by the whole negotiation.

```bash
python rfx_handoff_emitter.py <rfx_event.json>           # the handoff object
python rfx_handoff_emitter.py <rfx_event.json> --seed    # projected into deal-room Phase 1 intake
python rfx_handoff_selftest.py                           # 28 assertions, run after any edit
```

**RFx never writes past selection.** Everything emitted is `draft: true`; Deal Room owns it
all afterwards and re-derives the TCO.

**The claim-gate on the seam (G12).** A commitment WITH a citation is emitted as a
commitment. A commitment WITHOUT one is not dropped and is not asserted: it is demoted to an
OPEN issue labelled `[CONFIRM ...]`. Deal Room must never inherit an agreed position that
nobody can source. Drop the CLAIM, never the finding.

**It refuses rather than guesses.** The generator raises, and the CLI exits 2, on:

| refusal | why it is not a default |
|---|---|
| no selected supplier, or selection not final | there is nothing to hand over before a winner exists |
| TCO components that do not sum to the total | an unauditable total is the thing this seam exists to prevent |
| a component with no amount | treating it as 0 understates the total, and the error is inherited silently |
| a finding that neither survives nor is demoted | the claim-gate may change a finding's status, never delete it |

An unresolved `gateConflict` is carried into `openIssues` rather than resolved in either
party's favour.

**One contract value, one spelling.** The TCO tag is `indicative - firm in negotiation`.
The spec renders it with an em dash and deal-room's SKILL.md paraphrases it with a comma;
the em-dash-free form is canonical (see `_audit/A2-HANDOFF-FINDINGS.md`).

## Owed work

- **A2** (RFx-to-Deal handoff emitter): **BUILT 2026-07-29.** See "Send winner to Deal" below.
- Malicious-code sweep and in-browser 0-console-error check ahead of formal lock (the "#16
  gate") have not been re-run post-rehome; only the byte-identity build proof has.

## Panel data contract: where each panel's data comes from, and what it says when empty

`panel_sources.json` declares, for every panel on this dashboard: the fields it needs,
**where each field comes from**, and what the panel renders when a field is empty.

```bash
python panel_contract.py panel_sources.json     # validate + print the retrieval plan
```

### Two rules, both enforced in code

**1. A panel NEVER disappears when data is missing.** It stays, and it says why it is
empty. A hidden panel looks like a panel that was never meant to exist, and the reader has
no way to tell that something is absent. `hide_when_empty` is refused by the validator.

**2. "Searched and found nothing" and "could not reach the source" are different answers.**
They look identical to a careless reader and they mean opposite things. If a connector is
down and the panel says "no data found", a broken pipe silently becomes a clean finding
about the supplier and someone decides on it. So the code **refuses to report
SEARCHED_NOT_FOUND unless a retrieval actually ran and came back empty.**

| State | The panel says | The reader does |
|---|---|---|
| NEEDS_INPUT | this has to come from you or the supplier | provide it |
| SOURCE_UNREACHABLE | could not reach *the named source* | retry, or fix access |
| RESEARCH_PENDING | not yet retrieved from *the named source* | run retrieval |
| SEARCHED_NOT_FOUND | checked *the named source*; not present | nothing, the gap is real |
| NOT_APPLICABLE | this subject type has no such thing | nothing |

Every message **names the source it expected**, so "could not reach OFAC SDN" is
actionable where "unavailable" is not.

### Retrieval goes to the source, not to a search box

`retrieval_plan()` groups every field by source, so retrieval runs **once per source**
collecting everything that source can answer, rather than once per field. That is both the
accuracy mechanism (the right source is named up front) and the efficiency one.

### Internal sources are flagged, never invented

A source marked `access: internal` without `confirmed_by_owner` is reported as needing
confirmation. Those names are inferred, and **a confidently wrong internal system name is
worse than an honest blank**, so the code surfaces them rather than quietly asserting them.
