# Program Master Plan — Lilly Procurement Skills + Hub Dashboards

Compiled 2026-07-26 from a full sweep of every tracker, all 31 skills, and the orchestration layer.
This is the clean top-level roadmap; `MASTER-REMAINING-WORK.md` remains the detailed running log.
Tags: `[now]` active · `[next]` queued · `[Marc]` needs your decision · `[blocked]` needs Lilly network ·
`[held]` sensitive, explicit go required · `[opt]` optional/backlog.

## Status at a glance
- **Deal dashboard** — LOCKED (design of record).
- **RFx dashboard** — finishing now (feedback round 2 build in flight).
- **Landscape dashboard** — functionally built + was the exemplar, BUT has an in-progress redesign/fix batch (NOT fully locked).
- **3 dashboards still to build** — Category Strategy, Deep Dive, My Work.
- **PCC dashboard** — RETIRED; PCC becomes a conversation-led skill.
- **31 skills** — all mature (no stubs, no missing data-source/output); enhancement pass owed.
- **Theo / routing** — still a static menu router; the conversational intake + orchestration web are planned, not built.
- **ARIA + Cowork + commodity-agnostic** — the capstone (WS9) plus 3 cross-cutting mandates (CC1-CC3) to bake in from now on.

---

## Cross-cutting design mandates (bake in NOW; verify in WS3; prerequisite to WS9)
Marc 2026-07-26. These are prerequisites to the ARIA conversion and must be DESIGNED INTO every relevant skill,
dashboard, and hub as the builds proceed - not bolted on later.
- **CC1 - Commodity-agnostic.** Every relevant skill flexes across commodities/categories (never hardcoded to
  IT / data-platforms). Data sources, benchmarks, requirement templates, evaluation criteria, comparators, terms,
  and narratives all parameterize by the commodity/category in context. Verify each skill takes a commodity
  context and adapts.
- **CC2 - Efficient deep research + performance as a usability factor.** Skills find data EFFICIENTLY (right
  sources, minimal round-trips), do DEEP, robust, GROUNDED research (retrieval + citation + provenance + a
  depth/quality floor), yet stay FAST. Treat speed / quality / depth as balanced usability factors:
  recall-don't-recompute (materialized artifacts), right-effort-per-task, right-model-for-task, works on Desktop
  default/Sonnet without burning usage. No needless heavy recompute.
- **CC3 - Claude Cowork readiness.** Design every skill so that, once Cowork is widely released, it can take a
  user's direction, get data, analyze it, and ACT on the user's behalf with guardrails + HITL where needed.
  Structure each workflow as discrete, confirmable steps with explicit inputs/outputs/guardrails so Cowork can
  execute them. It won't be fully plug-and-play yet - design for it now as best we can. **PCC's Cowork loop
  specifically:** read the work knowledge graph -> assess + propose the user's NEXT BEST ACTION -> confirm with
  the user -> on confirmation, Cowork carries out the next steps (guardrails + HITL).

---

## PRIORITY ORDER (phased) — THE sequence  (re-sequenced with Marc 2026-07-26)
The dashboards gate almost everything, so they go first; a skills-file CLEANUP pass sits between the dashboards
and the deep skills work (so Claude never weeds through retired content); the ARIA conversion is DEAD LAST.

**PHASE 1 - DASHBOARDS (do before almost anything else):**
1. **WS0** Finish & lock RFx + build `rfx-hub`.  `[now]`
2. **WS1** Category Strategy dashboard + hub.
3. **WS1** Deep Dive dashboard + hub.
4. **WS1** My Work dashboard + hub.
5. **WS2** Finish Landscape (bring to fully-locked).
   -> all five hub dashboards LOCKED before Phase 2.

**PHASE 2 - SKILLS CLEANUP, THEN ENHANCEMENT:**
6. **WS3a** (NEW) Skills FILE CLEANUP - strip retired/dead/superseded content so the files are lean.
7. **WS3** Skills review & enhancement (data / output / deterministic Python / works-as-designed) + verify CC1-CC3.

**PHASE 3 - CONVERSATIONAL + ORCHESTRATION (after the skill set is clean & settled):**
8. **WS4** Theo conversational intake + one routing manifest + the ranked-handoff routing web + journey state.
9. **WS5** Conversational PCC + the Cowork next-best-action loop.
10. **WS6** Conversational help guides.

**PHASE 4 - FOUNDATION / RELEASE + DATA-LAYER (as you green-light):**
11. **WS7** Foundation / shared-shell consistency + release / packaging.
12. **WS8** Data-layer / kernels (sensitive; per-item go).

**PHASE 5 - ARIA (LAST - the capstone):**
13. **WS9** Convert to ARIA recipes + build the plugin (BRANCH into a separate Desktop folder, do NOT mutate the
    Desktop skills; gated by CC1-CC3 + the Phase-0 spike).

CC1-CC3 are woven through EVERY phase (designed into each build; formally verified in Phase 2 / WS3).

---

## WS0 — Finish & lock RFx  `[now]`
1. Running build (`wf_5736ada0-554`): merged Business Case tab + flipped/decluttered radar + dashboard-wide supplier colors + direct fixes (Title Case, strip reflect-only boilerplate all tabs, Landscape/Deal footer) + adversarial verify.
2. Revision pass after it lands: drop B's supplier comparison; Deal Economics right-table -> A's Mini P&L (remove standalone line-item); normalize ALL Business Case headings to mockup A's style.
3. Address verify findings; final full-tab in-browser check + full-codebase malicious-code sweep (the Deal "#16" gate).
4. LOCK the RFx dashboard.
5. Build **`rfx-hub`** skill: thin orchestrator carrying the locked dashboard; model authors only the data object.
6. Wire the RFx->Deal handoff emitter ("Send winner to Deal") once `rfx-hub` exists.

## WS1 — Build the 3 remaining hub dashboards  `[next]`
Each = locked deterministic build (engine carried in the skill, model authors data), MCM palette, shared shell, + a thin hub orchestrator skill, + a final in-browser + malicious-code sweep before lock.
1. **Category Strategy** — Phase-0 plan approved (11->7 tabs + new Execution tab, MCM, claim-gate). Write the Phase-1 deterministic spec, build, carry into a Category Strategy hub. (Also add its numeric kernel — see WS3.)
2. **Deep Dive** (`supplier-deep-dive`) — spec exists (DEEP-DIVE-REDESIGN-SPEC v3). Build the deterministic dashboard (renders at 4 depths: Landscape tab / RFx bidder / Deal light / standalone full+internal); hub home TBD.
3. **My Work** (NEW) — deterministic port of the platform's My Work page; My Work hub skill. **Includes #44 handover/custody brief** (GREEN LIT, Marc 2026-07-26): the de-identified handover brief lives here (My Work is where a user's work + handovers belong).

## WS2 — Finish Landscape  `[next]` (more than optional)
**A2 / DESIGN-CALIBER FINDING (Marc 2026-07-26) — the real driver:** nothing on Landscape broke or got deleted (the cross-supplier heatmap is still in the deep-dive "Portfolio summary"; the build is byte-identical to the `_platform_build` engine; NOT changed this session). The issue is a CALIBER GAP: Deal + RFx got MANY intensive design-polish rounds (de-bubble nested cards -> dividers/bands, purposeful <=3-colour, MEDIUM-detail richness, REAL viz not thin tables, tighter use of space, flat sections), while Landscape only got a functional build + an MCM colour pass -> it now reads THIN and BLAND next to them. **So WS2's core = a DESIGN UPLIFT bringing Landscape to Deal/RFx caliber:** apply the refined design language developed on Deal/RFx, use the two LOCKED dashboards as the caliber bar, enrich the deep-dive + cross-supplier view (make them substantial, not thin). Then fold in the existing R2/spec-gap batch + the green-lit enrichments + the MCM engine recolor (below).
1. Recolor the render ENGINE to MCM — hardcoded stoplight hex in `pv-07*`/`pv.css` bypasses the CSS-var layer; re-sync/rebuild into the skill.
2. R2 deep-dive review batch: global reskin G1-G4 + per-tab fixes (Supplier Summary, Company/Ownership, Capabilities, Financial & Market quadrant, Risk & Resilience accordion/events, Lilly-Fit); Overview funnel + single score scale.
3. Seed bugs: score-scale drift, 7-vs-9 supplier count, ESG mis-shown. Remove dead code (`pvDDSection`). **[DONE 2026-07-29, A10]** `pvRequestDataCard` did not exist in code, so nothing to remove. 7-vs-9 resolved by disambiguating the elimination label, NOT by reinstating the funnel (removed earlier at the owner's request).
4. `[Marc]` Resolve contradictions: H2H launcher add (P6) vs remove (OV1); P2 deep-dive "complete" vs "remaining 5 tabs' viz."
5. **GREEN LIT (Marc 2026-07-26):** supplier-type-aware deep-dive layout; segmentation-quadrant tuning; D&B/Bloomberg firmographic/financial enrichment.

## WS3a — Skills file CLEANUP  `[next]` (Phase 2, BEFORE WS3; prerequisite to WS9)
Marc 2026-07-26: make every skill file CLEAN so Claude isn't weeding through retired material at runtime, and so
the ARIA recipes convert from clean sources. Across all 31 skills + shared assets:
1. Remove retired **reference-JSX** dashboards (the per-skill React examples superseded by the deterministic-dashboard architecture) once each hub carries its locked dashboard.
2. Remove **dead code** / superseded functions in the vendored `.py` + `assets/` (the documented-as-dead blocks).
3. Retire orphaned/superseded **static dashboard HTML** (`_dashboards_ORIGINAL/`, `_dashboard_previews/`, the retired PCC HTML, decision-deck dead content) — confirm reference-only + call out anything ambiguous BEFORE deleting.
4. Prune **stale instructions** (old mode pickers, superseded IA prose, routing lists duplicated once the JSON manifest exists).
5. **Never-regress:** keep every skill's standalone deliverable + working logic intact — this is decluttering, not feature removal; branch + malicious-scan per the usual rules.
Output: lean, retired-content-free skill files that parse fast and convert cleanly to ARIA recipes.

## WS3 — Skills review & enhancement (all 31)  `[next]` (Phase 2, after WS3a)
All 31 rated data-source "clear" and output "clear" — this is enhancement, not repair.
1. **Deterministic Python where it makes sense** (ranked): (1) **category-strategy** — highest; Pareto/HHI/CAGR/YoY/tail-threshold/anomaly all run unvendored. (2) **negotiation-playbook-learning** — rate/CI/N-gates/0-15->0-100 normalization in-model. (3) **rfp-engine** — light; weight-sum-to-100 + NPV self-checks -> kernel call. (4) **negotiation-simulator** — narrow; `capture%` edge-case helper. (All others already vendor `numeric_kernel.py`/dedicated engines.)
2. **Data sources** — add staleness/citation-age flags where web-research freshness drives numbers (commercial-negotiation-prep, market-rate-benchmarking, should-cost-builder); propagate process-navigator's connector-check/gap-state pattern to the 6 skills using bespoke Inputs sections (cosmetic consistency).
3. **Outputs / hub contribution** — D1: rewrite each lens skill's `dashboard-canonical.md` to the deterministic-dashboard architecture, retiring reference-JSX (lilly-contract-review, scope-sow-architect, pro-forma-builder; sweep the rest); D3: formalize the redesigned Deal tabs as a skill spec; author a "hub contribution / output slice" section into each lens skill and strip "build your own dashboard" instructions (never regress standalone deliverables).
4. **Works-as-designed verification** — exercise the flagged logic: evaluation-engine AI-vs-stakeholder reconciliation; rfp-response <-> evaluation-engine no double-weighting; pro-forma NPV t=0 propagation to consumers; contract-review Contract-Stack-Mapper path.
5. `lilly-brand-assets` drift check — inlined copies in other skills vs the master.
6. **Verify the cross-cutting mandates per skill:** CC1 commodity-agnostic (takes a commodity context and adapts), CC2 efficient deep research + performance-as-usability, CC3 Cowork-ready workflow structure (discrete confirmable steps + guardrails). This is where CC1-CC3 get inspected/retrofitted across the suite before WS9.
7. **Non-numeric decision kernels (GREEN LIT, Marc 2026-07-26):** encode deterministic decision logic for legal-negotiation-prep (issue tier-tree), comment-cleanup (keep/resolve/delete matrix), workflow-map (step/dependency cascade).
8. **Heuristic->semantic upgrade (GREEN LIT, Marc 2026-07-26):** audit the suite; wherever heuristic review is used but SEMANTIC would be more accurate/higher-quality, upgrade to semantic (deterministic + semantic primary, heuristic fallback).

## WS4 — Conversational intake / routing / the orchestration web  `[Marc]` gate, then build
1. **#108** Rebuild Theo as a true conversational intake (diagnose -> recommend -> confirm -> hand off); retire the static menu-as-default; keep direct trigger phrases for named tasks.
2. **#110** Collapse routing into ONE JSON manifest (source of truth); render the widget, Markdown fallback, teach-mode lists, and chain table FROM it (today: 4-5 hand-synced files).
3. **#109** Per-skill handoff redesign: top-3 CONTEXT-RANKED successors + a 4th standing "back to Theo with context" (today: unranked prose lists, no back-to-Theo).
4. **Routing web** — `routing-and-chains.md` already maps 33 skills (predecessor/successor) + 7 named journeys, no-fabrication; evolve from a lookup table toward the generated, executable web; keep it generated from the manifest.
5. Cross-session journey state (persist a user's position in a guided path) — after hubs.
6. Live smoke test of the launcher (widget render + Teach-mode) — today verified by static analysis only.

## WS5 — Conversational PCC  `[next]`
1. Supersede task #115 (the old locked "My Work" PCC-dashboard plan) with the conversation-led decision — write it up.
2. Build a thin PCC orchestrator skill (NO dashboard-canonical, no locked artifact): reads/aggregates `theos-field-guide` work-graph state; converses about the user's plate/meetings/timelines; on demand asks Claude to generate an ad-hoc grounded widget scoped to the question (not a fixed multi-tab dashboard).
2b. **Cowork next-best-action loop (CC3):** from the work knowledge graph, assess and PROPOSE the user's next best action -> confirm with the user -> on confirmation, Claude Cowork carries out the next steps with guardrails + HITL. Design this loop now even if Cowork isn't fully wired yet.
3. Reconcile with the existing 6-skill PCC pipeline (voice-profile, theos-field-guide, process-navigator, timeline-builder, workflow-map, meeting-prep-brief) — subsume vs thin-router.
4. Retire/repurpose the 2 static PCC dashboard HTML files (confirm reference-only, not shipped).
5. Apply the data-grounding + materialized-artifact discipline to the ad-hoc views.

## WS6 — Conversational help guides  `[Marc]` + `[blocked]`
1. `[Marc]` Decide: `procurement-help-desk` as a sibling skill vs fold into `process-navigator` as a second mode.
2. `[blocked/Lilly network]` Run the 6 network-gated harvest steps for help-desk (validate all 4 sources, harvest the vendored-fallback corpus, tune the End-User Intent Taxonomy, re-verify the ProtectLilly retrieval gap).
3. Once shipped: add help-desk to `routing-and-chains.md` + the Theo widget/count.
4. `process-navigator` is fully built (the reference pattern); Teach-mode is built but needs the live smoke test (WS4.6).

## WS7 — Foundation / cross-cutting / release
1. Shared-shell consistency: Title-Case the Deal/Landscape section headers to match RFx; reconcile any Deal-vs-Landscape shell diffs into one canonical shell.
2. Full-codebase malicious-code pass (incl. each new dashboard + single-file demos) — owed per dashboard before lock.
3. `[release]` Repackage the installable `.skill` zip (#68/#87 — no in-repo packaging script yet); pre-packaging integrity sweep; refresh the "Lilly Theo" Desktop delivery folder; spot-check the 4 doc generators' demo data.
4. `[Marc]` decision-deck Stage-5 split + dead-content deletion (supervised; call out before deleting).

## WS8 — Data layer / kernels  (mostly `[Marc]`/`[held]` — sensitive)
1. `[Marc]` #113 playbook-learning aggregate-stats kernel -> canonical `numeric_kernel.py` (shared-infra, care).
2. numeric_kernel gaps: ROI/payback/waterfall, sensitivity/perturbation, correlated-drivers.
3. `[held]` #114 contract-review Protection-Score deduction-kernel (sensitive).
4. `[held]` #80 contract-review hybrid clause-analysis pipeline (sensitive).
5. **#102 cross-cut scoring layer — GREEN LIT but DEFERRED to here (Marc 2026-07-26):** one shared scoring/ranking engine so a score/tier means the same thing across skills; site-wide + risky, so sequence it AFTER the per-skill kernels (#113/#114/#80) + the cleanup. Must be done, just late. (#86 invoice-rate-card = SHELVED, not deprecated — needs invoices + contracts together, not yet available.)

## WS9 — Convert to ARIA recipes + build the procurement ARIA plugin  `[capstone]`
The final layer, after WS1-WS8 and once CC1-CC3 are baked in. Per ARIA-BUILD-PLAN.md: execute AFTER the
dashboards/skills optimization; the Phase-0 native-tool co-orchestration spike is the gate.
0. **BRANCH, do NOT mutate (Marc 2026-07-26).** The current/updated Claude-Desktop skills set stays AS-IS,
   untouched. The ARIA recipe versions + the plugin are a SEPARATE BRANCH built into a SEPARATE folder on Marc's
   Desktop. Never convert the existing skills in place - the two sets coexist (Desktop skills + ARIA recipes/plugin).
1. Convert the ENTIRE skill set (including the dashboards/hubs) to ARIA "recipes."
2. Build the **procurement skills plugin for ARIA.**
3. Design every skill to work with ARIA in the best possible ways: participate in and utilize ARIA's
   capabilities, its learning/knowledge loops, and its telemetry (e.g. `skill_outcome` records feeding ARIA
   Fabric). This is why CC1-CC3 come first - commodity-agnostic, efficient-deep-research, and Cowork-ready
   skills are what make good ARIA recipes.
4. Prereqs: CC1 (commodity-agnostic) + CC2 (efficient deep research) + CC3 (Cowork-ready) verified in WS3, and
   WS1-WS8 optimized. Full phased plan already written (ARIA-BUILD-PLAN.md).

---

## Decisions log (Marc 2026-07-26)
- **A1 Landscape H2H — RESOLVED.** Remove ONLY the "Compare candidates head-to-head" LAUNCHER BUTTON at the bottom of the Overview tab (P6 add / OV1 remove-directive). KEEP the full Head-to-Head TAB (spine + per-supplier analysis, `pvH2HHtml`/pv-07b) — the one built carefully. Do in WS2.
- **A2 Landscape Deep-Dive completeness** — Marc reviewing live in Edge; he confirms complete or lists gaps.
- **A3 help-desk — design for EFFICIENCY / USABILITY / QUALITY / ACCURACY.** Lean MERGE into `process-navigator` (one skill): determine the user's role/intent via the M365 connector if on, else from the question or a quick clarifier — NO up-front mode picker. Leave help-desk AS-IS for now; finalize at Phase 3/WS6 on the efficiency criterion.
- **A4 #114** contract-review Protection-Score deduction-kernel: **GREEN LIT** — also evaluate the most accurate method (deterministic deduction vs SEMANTIC vs heuristic); prefer semantic where more accurate.
- **A4 #80** contract-review hybrid clause pipeline: **GREEN LIT.**
- **A4 #113** playbook-learning stats kernel -> `numeric_kernel`: **GREEN LIT** — design for with/without ARIA/Cowork; enhance via them later.
- **A4 #102** cross-cut scoring layer: **GREEN LIT, DEFERRED to WS8/Phase 4** (Marc 2026-07-26) — must be done, sequenced after the per-skill kernels + cleanup (site-wide, so late).
- **A4 #86** invoice-rate-card platform mapping: **SHELVED** (not deprecated) — system can't yet see invoices + contracts together; ahead of its time.
- **NEW cross-cutting — HEURISTIC->SEMANTIC upgrade (add to WS3):** audit suite-wide; where heuristic review is used but SEMANTIC would be more accurate/higher-quality, upgrade to semantic (deterministic + semantic primary, heuristic fallback).
- **NEW task — SKILL INVENTORY + SHELVING (not yet):** later, list every skill + what it does + what data it needs, so Marc can decide which to SHELVE (not deprecate) for now (skills ahead of current data access, e.g. #86).
- **re-paper-SOW: GREEN LIT** — NEW skill: port content FROM a supplier's paper/SOW ONTO Lilly's template; likely its own skill, may reuse parts of `lilly-contract-review`. Add to the build list.
- **#32 dashboard-as-code** = the deterministic-build standard ALREADY adopted (Python builds each dashboard; only the DATA changes, which may vary specific panels / how fully built, but tabs/panels/organization/design stay consistent). NOT a separate task — it IS the approach.
- **GREEN LIT (Marc 2026-07-26):** Landscape enrichments (all 3) -> WS2; #44 handover/custody brief -> built WITH the My Work dashboard (WS1); the 3 non-numeric decision kernels -> WS3; the heuristic->semantic upgrade -> WS3.
- **Still deferred:** Landscape narrative reconciliation (parked, not needed now); ARIA Fabric telemetry / `skill_outcome` loop (returns in/after WS9).

## Still open (your call)
1. **A2** Landscape Deep-Dive completeness — you're reviewing it in Edge now. (Everything else from the A/B review is now decided.)

## Sequence
See **PRIORITY ORDER (phased)** near the top. In brief:
**Phase 1 dashboards** (WS0 RFx -> WS1 Category Strategy -> Deep Dive -> My Work -> WS2 finish Landscape; all five
locked) -> **Phase 2 skills** (WS3a cleanup -> WS3 review/enhancement + CC1-CC3) -> **Phase 3 conversational**
(WS4 orchestration web -> WS5 PCC + Cowork NBA -> WS6 help) -> **Phase 4** (WS7 foundation/release -> WS8
data-layer/kernels) -> **Phase 5 ARIA LAST** (WS9 recipes + plugin, branched, gated by CC1-CC3 + Phase-0 spike).
CC1-CC3 woven through every phase.
