---
name: deal-tab-1c344a
description: >
  Deal tab: the static, single-file analytical dashboard for a Lilly procurement deal under
  review. Assembles one self-contained HTML artifact from a single data object, on the
  platform chrome, across four tabs: Overview, Terms & Review, Economics, Negotiation. It is
  the convergence point for three lens skills: contract-review (issues, document conflicts,
  protection, obligations), scope-sow-architect (scope and its issues), and pro-forma-builder
  (commercial lines, scenarios, assumptions, benchmarks). Deterministic: the same data object
  in produces a byte-identical dashboard out. REFLECT-ONLY and static: no state, no
  persistence, no sends, no writes. Triggers: deal tab, deal dashboard, build the deal
  dashboard. BOUNDARY: deal-room-1c344a is a DIFFERENT product, a live negotiation manager
  with a persistent concession ledger; this skill produces a static artifact and keeps
  nothing.
metadata:
  author: "Marc Lane, Associate Director, Global IT Procurement"
  suite: v10.7.0
  owner: Lilly Global Procurement
  status: LOCKED 2026-07-29
---

# Deal tab

## What this is, and what it is not

This skill builds ONE artifact: a single self-contained HTML file that renders a deal for
review. It holds no state between runs, sends nothing and writes to no system.

It is **not** `deal-room-1c344a`. That skill is a live negotiation manager: one Claude Project
per negotiation, a persistent `deal_room_state.json` concession ledger updated after every
meeting, and a structured handoff at close. The two lived in one directory until 2026-07-29,
which is what this skill exists to fix. If a request involves logging rounds, tracking
concessions or asking "what happened in the meeting", it is Deal Room, not this.

## Information architecture, LOCKED

Four tabs. The shipped structure is canonical; the six-tab version in
`DEAL-TAB-REDESIGN-PROPOSAL.md` is superseded and marked as such.

| Tab | Subtabs |
|---|---|
| **Overview** | none |
| **Terms & Review** | Documents & Conflicts · Legal & Protection · Scope & Performance · Sources & Evidence |
| **Economics** | Deal Table & ZOPA · Financial Model |
| **Negotiation** | Positions · Trade Plan · Communications |

Locked 2026-07-29. No structural change without owner approval. See
`_deal_build/DEAL-DASHBOARD-TRACKER.md` for what closed the lock and the six judgment calls
decided with it.

## Where the code is

    dashboard/build_deal_artifact.py    assembler; run it, no arguments
    dashboard/_parts/*.js               renderers, one per tab, plus helpers/shell/data
    dashboard/_parts/style.css          the stylesheet
    dashboard/_platform_build/          platform chrome, grafted at build time
    dashboard/assets/                   fonts, logo, dino mark

The builder resolves everything relative to its own directory, so the tree moves as a unit.
Verified on the 2026-07-29 move: byte-identical output before and after.

Markup changes must go through the renderers. Editing a built HTML file is overwritten by the
next build.

## Output slice contract

This dashboard does not author content. Each lens skill owns a slice of the data object:

| Skill | Owns |
|---|---|
| `lilly-contract-review-1c344a` | `issues[]`, `documentConflicts[]`, `protection{}`, `obligations[]`, `tacticFlag` |
| `scope-sow-architect-1c344a` | `scope{}` and scope `issues[]` |
| `pro-forma-builder-1c344a` | `commercialLines[]`, `scenarios[]`, `assumptions[]`, `proforma{}`, `benchmarks[]` |

No lens skill builds its own version of this dashboard. Each contributes its slice.

**Every field carries a `sourceRef`.** A field arriving without one is a build failure, not
a gap to render. This dashboard composes other skills' findings, so it is the last place an
uncited value can be caught before a reader treats a rendered number as established fact.

Gap-stating is for data that is genuinely absent and named as such. An uncited value is
worse than a missing one, because it looks like evidence: a missing figure prompts someone
to go and find it, while a figure with no source gets quoted.

**Drop, do not dilute (G12).** A finding that cannot cite a source is dropped, never softened
into a hedged observation. This dashboard does not author content, so it has no business
rewriting a lens skill's unsupported finding into something vaguer that survives review.

(This matches `rfx-hub-1c344a`'s slice contract. This one predated the D4 pass that added the
requirement there, which is the only reason it was missing.)

## Design system

Restyle protocol, as applied 2026-07-28. Plum `#5C2B50` primary marks structure, teal
`#2F6E6B` secondary marks favourable or settled, burnt orange `#C15E19` is emphasis only and
solid only. There is no red, green, yellow or amber. Role tints have a floor and may not be
paler than plum `#C6B5C2`, teal `#B6CCCB`, burnt `#ECCFBA`. Pale washes as panel backgrounds
are banned.

Panels carry a full-height 3px left spine, a gradient header with an icon and a 13/800
uppercase title, and at most one solid-header panel and one emphasis panel per tab.

## Honesty rules

Absent data is gap-stated in place, naming the field that would fill it. Nothing is invented
to complete a layout. Modelled figures say they are modelled. Estimates are never presented
where a measurement is implied.

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
