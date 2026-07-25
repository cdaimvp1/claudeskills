# Deal Hub SKILL extension plan (#1) — for review before build

Status: DRAFT for Marc's approval. Decision on record (2026-07-25): **Extend `deal-room-1c344a`
into the Deal SKILL HOME**, do NOT create a parallel `deal-workspace`. This plan says exactly how,
what stays untouched (never-regress), and the two calls I still need before executing.

Governance honored: never-regress the skill, separate-design-from-build, UI-change approval gate,
NOT-SoR / reflect-only, Desktop-runnable + efficient (no new Opus dependency), all-commodity.

---

## 1. Why extend, not rebuild

`deal-room-1c344a` is ALREADY a hub in all but name: single persistent data object
(`deal_room_state.json`), orchestrates over it round by round, is seeded by commercial/legal-
negotiation-prep, hands off to negotiation-playbook-learning at close, renders a locked dashboard,
kernel-backed math (G11), reflect-only, single-Project. The Deal HUB dashboard in `_deal_build/`
(the locked one) already ABSORBED deal-room's live-tracking surfaces: its Trade Plan, Positions,
and Communications tabs are the evolved versions of deal-room's Concession Ledger / Issues Board /
Next-Counter tabs. So "extend into the hub" = point the mature skill at the richer dashboard and add
a thin front-door layer. Low blast radius, high reuse.

## 2. What STAYS UNTOUCHED (never-regress guarantee)

None of deal-room's live-negotiation engine changes:
- Phase 1 opening-strategy intake (BLOCKING), Phase 2 round capture, Phase 3 kernel value-of-movement,
  Phase 4 ledger rollup, Phase 5 next-counter, Phase 6 meeting brief, Phase 8 close-out handoff.
- `deal_room_state.json` as the persisted ledger; the numbers-reconcile validation; single-user /
  single-Project / single-negotiation envelope; REFLECT-ONLY; kernel (`escalate`/`npv`/`weighted_score`).
- All four BOUNDARY disambiguations (vs prep skills, playbook-learning, meeting-prep, rfp-case-manager).
- Standalone use: deal-room must still run as today for a user who just wants the live tracker.

## 3. What is ADDED (additive hub layer)

**3a. "Deal SKILL HOME (hub)" section** — a new front-door section near the top of the workflow. It is
the home for the whole deal lifecycle and ROUTES (reflect-only, no duplication):
- pre-talks -> commercial-negotiation-prep / legal-negotiation-prep (seed the strategy),
- live -> this skill's Phases 1-8 (unchanged),
- post-close -> negotiation-playbook-learning.
The hub composes over ONE data object (`deal_room_state.json`); sub-skills return SLICES that enrich it
(prep seeds issues/positions; landscape, protection-scorecard, scope/performance slices attach as they
become available). It never re-runs a sub-skill's heavy analysis; it points to it. ARIA supplies
search-wide context when reachable (read-gated), same as today.

**3b. Dashboard-canonical upgrade** — deal-room's `references/dashboard-canonical.md` is upgraded from
the standalone 4-tab skeleton to the locked `_deal_build` Deal hub structure (Overview, ZOPA, Trade Plan,
Communications, Positions, Terms & Review, Scope & Performance, Protection Scorecard, Landscape). Mapping:

| deal-room 4-tab (today) | Deal hub tab (target) |
|-------------------------|-----------------------|
| Tab 1 Overview | Overview (KPI row + round history + narrative) |
| Tab 2 Concession Ledger | Positions + Trade Plan |
| Tab 3 Issues Board & Packages | Positions (status columns) + Trade Plan (packages) |
| Tab 4 Value of Movement & Next Counter | Trade Plan (scoreboard + next counter) + ZOPA |
| (new, enriched by sub-skills) | Landscape, Terms & Review, Scope & Performance, Protection Scorecard |

Palette = the Dashboard Palette (MCM) just encoded in the foundation (#2). Tabs that have no data yet
render the canonical NEEDS_INPUT / NOT APPLICABLE / RESEARCH PENDING state (Rule 8), never blank.

**3c. One canonical Deal data object** — reconcile the `_deal_build` dashboard's data model with
`deal_room_state.json` so there is ONE persisted object: deal-room's state, extended with the hub's
additional slices. The dashboard renders from it; the ledger writes to it; no second source of truth.

## 4. Name-collision fix (approved)

Rename commercial-negotiation-prep's Phase 10 "Interactive Negotiation Dashboard (Deal Room)" ->
**"Interactive Negotiation Prep Dashboard"** (drop "Deal Room"). Touch points: ~5 mentions in
commercial-negotiation-prep/SKILL.md (Phase 10 heading, references list, Shared-Enhancements line, the
inlined JSX comment + header), its two dashboard HTML files (`_dashboard_previews/`, `_dashboards_ORIGINAL/`),
and deal-room's BOUNDARY paragraph that cites the old name. After this, "Deal Room" names ONLY the live
hub skill. (New name is adjustable, see decisions below.)

## 5. Efficiency (Marc's constraint)

Hub orchestration is routing + composition over already-persisted state: cheap, model-light. Heavy
analysis stays inside the sub-skills, which keep their own Opus-vs-Sonnet guidance. No new Opus
dependency is introduced by the hub layer. Dashboard render is deterministic from the data object.

## 6. Execution order (after approval)

1. Rename (collision) across both skills + the two HTML files — mechanical, verify consistency.
2. Upgrade deal-room `dashboard-canonical.md` to the hub structure + MCM palette; port the reference JSX.
3. Add the "Deal SKILL HOME (hub)" section + routing; bump changelog to v1.1 (additive).
4. Extend the `deal-room-state-schema.md` with the hub slices (landscape/protection/scope), all optional
   so existing state files still load (never-regress).
5. Self-test (numbers reconcile, every canonical tab renders a state), independent malicious-code scan,
   commit + push.

## 7. TWO decisions I need before executing

1. **Retire deal-room's locked standalone 4-tab dashboard in favor of the hub dashboard?**
   Recommended: YES — its surfaces are absorbed into the hub tabs, and one dashboard-canonical is cleaner.
   But it changes a LOCKED dashboard, so per no-shortcut-reversals I want your explicit OK. (Alternative:
   keep the 4-tab as a "lite" fallback for pure-standalone runs and add the hub as the Project-mode view.)
2. **New name for commercial-negotiation-prep's dashboard** — proposed "Interactive Negotiation Prep
   Dashboard." Fine, or prefer another (e.g. "Pre-Talks ZOPA Model", "Negotiation Prep Model")?

Nothing in deal-room or commercial-negotiation-prep is edited until these two are answered.

---

## 8. Progress + refined step-2 scope (updated 2026-07-25)

**DONE:** Step 1 (name-collision rename) committed (`c0da7e7`). Both decisions answered:
retire the 4-tab (hub becomes canonical), and rename to "Interactive Negotiation Prep Dashboard."

**Refined understanding of step 2 (dashboard-canonical upgrade), found while doing step 1.** The
current `references/dashboard-canonical.md` is a detailed LOCKED spec: a 4-tab React/recharts
dashboard using the DOCUMENT status palette (Bold Blue positive), with a large inlined reference JSX
and a reconciled Meridian-BioAnalytics worked example. Making the hub canonical is bigger than a "port":

- **Technology:** the skill generates a self-contained React artifact at runtime; the `_deal_build`
  Deal hub is vanilla-JS + multi-file + python-built. So the skill's new canonical must be a React
  9-tab hub that MATCHES `_deal_build`'s structure and MCM palette. `_deal_build` stays the visual
  design-of-record reference; the inlined reference JSX is rewritten from 4 tabs to the 9-tab hub.
- **Palette flip:** deal-room's dashboard is INTERACTIVE, so per #2 it moves from the document status
  palette (Bold Blue positive) to the MCM Dashboard Palette (teal settled / burnt-orange attention /
  deep rust critical / muted blue info; outline pills; no pale-orange fills; grey/black tab strips).
- **Cross-skill composition:** 5 of the 9 tabs (Landscape, Terms & Review, Scope & Performance,
  Protection Scorecard) are fed by OTHER sub-skills. deal-room renders them from the composed data
  object with the canonical NEEDS_INPUT / NOT APPLICABLE state until a sub-skill contributes. This is
  the hub pattern (orchestrator over one persisted object; sub-skills return slices).
- **Reconcile the worked example** so the KPI/ledger/value numbers still reconcile across
  dashboard-canonical.md, deal-room-state-schema.md, and handoff-mapping.md (never-regress the math).

**Step 2 execution plan (its own focused increment):**
1. Confirm the `_deal_build` dashboard's ACTUAL current tab list + structure post-lock (do not spec from memory).
2. Rewrite `dashboard-canonical.md` skeleton: 4-tab -> 9-tab hub, MCM palette, per-tab content +
   NEEDS_INPUT states, data-composition note, point to `_deal_build` as design-of-record.
3. Rewrite the inlined reference JSX to the 9-tab hub (bulky, low-judgment; candidate for a Sonnet
   subagent per the cheaper-workflow-models rule, then verify).
4. Update Phase 7 + changelog (v1.1) + version; extend deal-room-state-schema with optional hub slices.
5. Self-test (numbers reconcile, every canonical tab renders a state), independent malicious-code scan,
   commit. Then step 3 (hub front-door section) and step 4 (schema) per section 6.
