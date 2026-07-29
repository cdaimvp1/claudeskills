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

| Skill | Owns |
|---|---|
| `rfp-engine-1c344a` | `criteria[]`, `requirements[]` (the RFP structure; weight-sum discipline lives here) |
| `rfp-case-manager-1c344a` | `qa[]`, event/case state |
| `rfp-response-analysis-1c344a` | `suppliers[]` (bid-leveled, normalized to a common basis) |
| `evaluation-engine-1c344a` | `panel[]` (panel scoring) |

No lens skill builds its own version of this dashboard. Each contributes its slice; this skill
never re-derives scoring, leveling, or requirements math that one of those four already owns.

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

## Owed work

- **A2** (RFx-to-Deal handoff emitter): not built here. This skill has no "Send winner to
  Deal" action yet; wiring it emits `RfxToDealHandoff` per the RFx-Deal redesign spec and
  depends on this hub existing, which is now true.
- Malicious-code sweep and in-browser 0-console-error check ahead of formal lock (the "#16
  gate") have not been re-run post-rehome; only the byte-identity build proof has.
