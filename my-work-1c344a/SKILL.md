---
name: my-work-1c344a
description: >
  My Work hub: the static, single-file personal workspace dashboard for a sourcing rep.
  Assembles one self-contained HTML artifact on the platform chrome across eight sections:
  My Workload (portfolio gate-by-date timeline), My Report Card (SLA adherence and
  savings-vs-target, graded), The Suppliers I Manage (spend concentration, pareto, spend
  under contract, upcoming renewals), My Savings, Spend Beneath Me, Handover (the
  de-identified ownership-lineage brief), and Delegate My Work. Deterministic: the same
  vendored seed in produces a byte-identical dashboard out. REFLECT-ONLY and static: no
  state, no persistence, no sends, no writes, and no network of any kind. Triggers: "My
  Work dashboard", "My Work hub", "my workload", "my report card", "handover brief",
  "build the My Work dashboard".
metadata:
  owner: Lilly Global Procurement
  status: built 2026-07-29 (A7, the last Phase 1 hub; includes the #44 handover/custody
    brief, green-lit to live here)
---

# My Work hub

## What this is, and what it is not

This is the fifth and last Phase 1 hub. It is the sourcing rep's personal workspace:
what they are carrying, how they are performing against their own targets, the suppliers
in their book, and what happens to all of it when the book changes hands.

**It is not a system of record.** Every figure it renders is reflect-only, read from a
vendored seed. It writes nothing, sends nothing, and persists nothing.

**It has no network.** This is enforced by the builder, not by convention. See below.

## How it was built, and why not the other way

The platform's `my-work.html` was used as a **read-only specification**, and its render
chain vendored byte-identical into `dashboard/assets/my-work/` (six modules). This is
the same hub pattern the Landscape, Deal and RFx dashboards already use.

It deliberately does **not** use the platform build tree's own My Work inliner, which reads the page
and its assets out of the live Theo platform directory at build time. Running that here
would mean a shipped skill whose build reaches into a separately-owned, actively developed
product, and whose contents silently rot as that product moves. Vendored copies are
drift-checkable; a live reach-through is not.

## Build

```
python dashboard/build_my_work_dashboard.py            # build
python dashboard/build_my_work_dashboard.py --report   # build, and list what was dropped
```

Output: `dashboard/my-work-dashboard.html`, one self-contained file, ~2.55 MB.

`dashboard/build_my_work_selftest.py` covers the builder (offline surface, patch
integrity, markup removal, and the no-network assertion).

## The offline guarantee, and how it is enforced

A skill installs as one folder and runs from the local filesystem. A network call inside
it can never succeed and can only mislead. Three mechanisms hold this:

1. **`assets/lilly-api-offline.js` replaces the platform's api.js.** api.js is 75KB and
   carries a live `fetch()`. The shim reimplements exactly the six methods the my-work
   chain calls (`tryLive`, `esc`, `badge`, `listProjects`, `tasks`, `workload`) against
   the vendored seed. The build asserts the shim's surface matches the call sites exactly:
   a missing method fails the build rather than blanking a panel, and an unused stub fails
   it too rather than inviting a caller who would silently get nothing.

2. **A declared build-time patch neutralises the one remaining call.**
   the vendored handover module does a live `GET /api/handover`. The patch replaces it with a
   rejected promise, which is the branch that module already takes offline, so the seeded
   brief stays on screen. The vendored file on disk is left byte-identical to the platform
   so drift stays detectable, and the patch **pins its exact expected text**: if the
   platform rewrites that line the patch stops matching and the build refuses, rather than
   silently restoring a network call.

3. **The no-network assertion checks the MECHANISM, not the markup.** The first version of
   this builder scanned only for `<script src>` and `<link href>` and reported a confident
   "0 external references" while the built page was pulling four scripts and an image at
   runtime, because the platform's theo-brand script injected them from JavaScript. Markup was clean;
   behaviour was not. The check now looks for `fetch`, `XMLHttpRequest`, `WebSocket`,
   dynamic `import()`, `.src =` assignments and string literals naming bundle assets, over
   a comment-stripped copy. The stripper deliberately under-strips, because a stripper that
   guessed harder could delete real code and hide a genuine call.

## What is dropped, and why it is stated rather than silent

`--report` lists these. They are dropped because they need live platform state a skill hub
does not have:

| Dropped | Why |
|---|---|
| the platform's tasks-drawer script and stylesheet | the task drawer needs live task state |
| the platform's theo-brand script | injects the Theo assistant surface (connectors, help, voice, mentions, and the dino) at runtime; that is platform product chrome, not My Work render |

**A dropped feature takes its surface with it.** Dropping the drawer's script and
stylesheet alone left its markup rendering as unstyled text at the foot of the page and
left a "Tasks" button in the topbar whose `onclick` called an undefined function. A dead
control is not a stated gap. The builder now removes the drawer panel and its trigger, and
asserts it removed exactly one of each.

## Sections

| # | Section | Anchor content |
|---|---|---|
| 1 | My Workload | portfolio timeline, every gate plotted on a real calendar-week axis, critical path called out |
| 2 | My Report Card | SLA adherence and savings-vs-target, graded, controllable time only |
| 3 | The Suppliers I Manage | active spend by category, spend-concentration pareto, spend under contract, upcoming renewals |
| 4 | My Savings | committed vs achieved, personal target progress |
| 5 | Spend Beneath Me | the book below the rep |
| 6 | Handover | **#44**: the de-identified ownership-lineage brief |
| 7 | Delegate my work | delegation and out-of-office |

### Handover (#44)

Green-lit to live here on the grounds that My Work is where a user's work and their
handovers belong. It is **knowledge, not person**: the brief is de-identified, it is
reflect-only, and it is explicitly **not** a system of record. It renders from the seed
offline, which is the same content path the platform takes when its API is unreachable.

## Suite interaction

Reflect-only, and terminal: nothing routes out of this hub. It reads the rep's own book.
Where a figure originates in another skill's analysis, that skill remains the owner of the
number; this hub reflects it and does not recompute it.
