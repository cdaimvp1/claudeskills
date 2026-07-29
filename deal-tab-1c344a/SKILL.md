---
name: deal-tab-1c344a
description: >
  Deal tab: the static, single-file analytical dashboard for a Lilly procurement deal under
  review. Assembles one self-contained HTML artifact from a single data object, on the
  platform chrome, across four tabs: Overview, Terms & Review, Economics, Negotiation. It is
  the convergence point for three lens skills, which own the content: contract-review supplies
  issues, document conflicts, protection and obligations; scope-sow-architect supplies scope
  and its issues; pro-forma-builder supplies commercial lines, scenarios, assumptions and
  benchmarks. Deterministic: the same data object in produces a byte-identical dashboard out.
  REFLECT-ONLY, and static: no state, no persistence, no sends, no writes. Triggers: "deal
  tab", "deal dashboard", "build the deal dashboard".
  BOUNDARY: deal-room-1c344a is a DIFFERENT product, a live negotiation manager that keeps a
  persistent concession ledger across a negotiation. This skill produces a static artifact and
  keeps nothing. The two were previously in one directory, which is the name collision that
  created this skill.
metadata:
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
