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
3. **My Work** (NEW) — deterministic port of the platform's My Work page; My Work hub skill.

## WS2 — Finish Landscape  `[next]` (more than optional)
1. Recolor the render ENGINE to MCM — hardcoded stoplight hex in `pv-07*`/`pv.css` bypasses the CSS-var layer; re-sync/rebuild into the skill.
2. R2 deep-dive review batch: global reskin G1-G4 + per-tab fixes (Supplier Summary, Company/Ownership, Capabilities, Financial & Market quadrant, Risk & Resilience accordion/events, Lilly-Fit); Overview funnel + single score scale.
3. Seed bugs: score-scale drift, 7-vs-9 supplier count, ESG mis-shown. Remove dead code (`pvRequestDataCard`/`pvDDSection`).
4. `[Marc]` Resolve contradictions: H2H launcher add (P6) vs remove (OV1); P2 deep-dive "complete" vs "remaining 5 tabs' viz."
5. `[opt/Marc]` supplier-type-aware deep-dive layout; segmentation quadrant tuning; D&B/Bloomberg enrichment backlog.

## WS3 — Skills review & enhancement (all 31)  `[next]`
All 31 rated data-source "clear" and output "clear" — this is enhancement, not repair.
1. **Deterministic Python where it makes sense** (ranked): (1) **category-strategy** — highest; Pareto/HHI/CAGR/YoY/tail-threshold/anomaly all run unvendored. (2) **negotiation-playbook-learning** — rate/CI/N-gates/0-15->0-100 normalization in-model. (3) **rfp-engine** — light; weight-sum-to-100 + NPV self-checks -> kernel call. (4) **negotiation-simulator** — narrow; `capture%` edge-case helper. (All others already vendor `numeric_kernel.py`/dedicated engines.)
2. **Data sources** — add staleness/citation-age flags where web-research freshness drives numbers (commercial-negotiation-prep, market-rate-benchmarking, should-cost-builder); propagate process-navigator's connector-check/gap-state pattern to the 6 skills using bespoke Inputs sections (cosmetic consistency).
3. **Outputs / hub contribution** — D1: rewrite each lens skill's `dashboard-canonical.md` to the deterministic-dashboard architecture, retiring reference-JSX (lilly-contract-review, scope-sow-architect, pro-forma-builder; sweep the rest); D3: formalize the redesigned Deal tabs as a skill spec; author a "hub contribution / output slice" section into each lens skill and strip "build your own dashboard" instructions (never regress standalone deliverables).
4. **Works-as-designed verification** — exercise the flagged logic: evaluation-engine AI-vs-stakeholder reconciliation; rfp-response <-> evaluation-engine no double-weighting; pro-forma NPV t=0 propagation to consumers; contract-review Contract-Stack-Mapper path.
5. `lilly-brand-assets` drift check — inlined copies in other skills vs the master.
6. **Verify the cross-cutting mandates per skill:** CC1 commodity-agnostic (takes a commodity context and adapts), CC2 efficient deep research + performance-as-usability, CC3 Cowork-ready workflow structure (discrete confirmable steps + guardrails). This is where CC1-CC3 get inspected/retrofitted across the suite before WS9.

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
5. `[Marc]` #86 invoice-rate-card platform mapping; #102 cross-cut scoring layer (risky, site-wide).

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

## Open contradictions needing your call
1. Landscape H2H launcher: add (P6) vs remove (OV1).
2. Landscape P2 deep-dive: "complete" vs "remaining 5 tabs' viz."
3. Help-desk: sibling skill vs fold into process-navigator.

## Suggested sequence
CC1-CC3 are woven THROUGHOUT (every build from here designs for them; verified/retrofitted in WS3), then:
WS0 (RFx) -> WS1 (Category Strategy -> Deep Dive -> My Work + hubs) -> WS2 (finish Landscape) -> WS3 (skills
review/enhancement incl. deterministic kernels + CC1-CC3 verification) -> WS4 (orchestration web) -> WS5
(conversational PCC + Cowork NBA loop) + WS6 (help) -> WS7 (foundation/release) -> WS8 (data-layer/kernels, as
you green-light the sensitive ones) -> **WS9 (ARIA recipes + procurement ARIA plugin, the capstone; gated by
CC1-CC3 + the Phase-0 native-tool spike).**
