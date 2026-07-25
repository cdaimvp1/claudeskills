# Dashboard architecture - LOCKED DECISION (2026-07-25)

## The rule

**One deterministic, locked dashboard per hub, carried inside the skill. Claude authors ONLY the data object.**

This is the pattern the **Landscape** skill already uses (the exemplar): the locked dashboard engine lives inside
the skill (`supplier-landscape-1c344a/dashboard/`), and a run only authors the data (`landscape-data.js`). The
dashboard is deterministic - always the locked design, data swapped per subject. There is exactly ONE dashboard.

## What this REPLACES

The per-skill inlined **"reference JSX"** (a React example the model re-interprets each run) is RETIRED. Those
were an earlier way to force a specific output before the deterministic build existed; now the engine is the
source of truth and the model just fetches/analyzes and authors data. No skill should carry a second,
reinterpreted dashboard alongside a locked one.

## Why (Marc, 2026-07-25)

- No drift: the shell/look/structure cannot vary run to run because it is the one locked artifact, not
  regenerated. Same header, logo, footer, colours, tabs, components every time.
- Desktop-usage-efficient: a run authors a data object (cheap) instead of regenerating a whole dashboard.
- Correctness: the model can't quietly reinterpret the design; it can only supply data the locked engine renders.

## The shared locked shell

All hub dashboards wear ONE shared shell (header + Lilly logo + footer + MCM token application), taken from the
locked Deal + Landscape dashboards. A new hub dashboard is built to that shell, not its own. (Reconcile any
current Deal-vs-Landscape shell differences into one canonical shell.)

## Application per hub

| Hub | Locked engine | Action |
|-----|---------------|--------|
| **Landscape** | `supplier-landscape-1c344a/dashboard/` (pv engine + landscape-data.js) | DONE - this is the exemplar. |
| **Deal** | `_deal_build/` (the locked dashboard Marc iterated on) | **DONE 2026-07-25.** Carried into `deal-room-1c344a/dashboard/` (engine `_parts/*` + assets + `build_deal_artifact.py` + the `_platform_build` chrome dep, import path localized). Build verified from the skill: 2.9MB self-contained HTML with the platform chrome (matches Landscape). Model authors ONLY `dashboard/_parts/data.js`. Reference JSX RETIRED; dashboard-canonical + Phase 7 + changelog (v1.2) rewritten to the deterministic build. Carried Python malicious-scanned clean. |
| **RFx** | (to build) | Build ONCE = platform RFx tab structure + the shared locked shell + Marc's keep-list + Business Case tab, minus Desktop-incompatible bits. Lock it. rfx-hub carries it; model authors data. |
| **Category Strategy** | (to build) | Build ONCE = the workflow's 7-tab draft, put on the shared shell + made data-driven. Lock it. category-strategy carries it; model authors data. |

## Desktop-artifact constraints (baked into every hub dashboard)

A self-contained artifact has no shared backend / no per-user identity / no persistence / no cross-app trigger.
So: NO multi-user score submission (scoring is a reflect view of scores gathered offline); NO "send to another
dashboard" button (handoffs are skill-level data objects the model emits, e.g. the RfxToDealHandoff seed #3).
Local recompute is fine (award-scenario slider, denominator selector, tab switching, collapsibles).

## Program sequence

1. Pin down the shared locked shell (extract + reconcile Deal + Landscape header/logo/footer/tokens).
2. **Deal:** carry `_deal_build` into deal-room + author-data instructions; retire the reference JSX. **DONE.**
3. **RFx:** build the locked RFx dashboard once (per above); rfx-hub carries it.
4. **Category Strategy:** finish the locked 7-tab dashboard from the workflow draft on the shared shell; carry it.
5. Sweep the other skills for any remaining reference-JSX-as-dashboard and retire per this rule (never-regress:
   keep each skill's non-dashboard standalone deliverables).

Status: this is a multi-step program; it will span sessions. `MASTER-REMAINING-WORK.md` points here.
