# Landscape Redesign v3 — Build Tracker (resume from here)
Specs: DEEP-DIVE-REDESIGN-SPEC-v3.md (deep dive) + LANDSCAPE-REDESIGN-SPEC-v3-TOPLEVEL.md (top-level).
Marc chose: **Foundation first, then tab-by-tab** (open + steer each). Deep Dive = all 6 subtabs in one pass.
Files: renderer `assets/pv/pv-07-landscape-render.js` (+ new `pv-07a-assess-model.js`), data `assets/landscape-data.js`,
build `build_dashboard.py`, checks `smoke.cjs` / `verify_deepdive.cjs`. Self-contained, offline, grounded-only.

## Phases
- [x] **P1 Foundation** — DONE 2026-07-23. `assets/pv/pv-07a-assess-model.js`: `pvAssess(a,cand,input)` (one fit
      scale, semantic risk+confidence, disposition vocab, gate detection incl. must-have/financial, 8-dimension
      rollup, evidence coverage) + primitives (pvDispBadge, pvConfDots, pvEvidChip, pvConcernPill, pvAssessBars,
      pvEvidCoverageBar, pvReqGroupMini, pvOppConcern, pvDecisionHeaderStrip, pvSemanticRiskCell). Snowflake
      Summary-level `ASSESS_AUTHORED.nimbus` grounded; others derive+gap. Wired into build_dashboard.py + smoke.cjs.
      Verified: verify_assess.cjs 15/15 + smoke no-regression. NOTE: richer per-tab authored data (ownership tree,
      locations, events, capability map, references, dependencies, diligence, actions) is authored per tab in P2.
- [~] **P2 Deep Dive** — IN PROGRESS. `assets/pv/pv-07b-deepdive.js`: 6-subtab dispatch (PVDD2_TABS + pvDD2Section),
      wired into pvDeepDiveTabHtml (compact pvDecisionHeaderStrip replaces the 2 bands + visible composite; default
      = summary). Verified smoke (6 tabs) + verify_dd2.cjs 28/28. **Summary tab DONE** (assessment bars, req
      mini-heatmap, opp/concern, evidence coverage, gates). Other 5 tabs = FIRST PASS (real grounded content, but
      dominant viz still "to follow"). **DO NOT OPEN until dominant viz built.** REMAINING per tab:
      - Company&Ownership: ownership TREE diagram (currently text tree) + footprint (map/table).
      - Capabilities&Operations: capability-to-requirement HEATMAP (evidence cells) + reference-relevance matrix +
        delivery-readiness bar + dependency diagram.
      - Financial&Market: peer-position SCATTER + commercial-driver matrix + financial-health bridge (trend guard).
      - Risk&Resilience: impact x likelihood MATRIX + event TIMELINE (directness) + mitigation board.
      - Lilly Fit&Diligence: lilly-fit matrix + diligence FUNNEL + owner-grouped action board + relationship timeline.
      Author the grounded per-tab data (ASSESS_AUTHORED.nimbus: ownership, locations, capabilities cells, references,
      dependencies, events, mitigations, diligence, actions) as each viz is built. THEN rebuild + verify + OPEN.
      Old pvDDSection / pvVerdictHeaderHtml / pvCompPositionHtml now dead (remove in P7).
- [~] **P3-P6 TOP-LEVEL TABS** — IN PROGRESS (Marc: "roll into the top level tabs"). Building myself on the
      pvAssess spine (modify existing renderers + 1 new tab). Mapping workflow wf_ee3f9580-dab ran 3 parallel
      Sonnet readers over pvExecSummaryHtml / pvHeatmapHtml / pvRiskHtml first. Order: Risk Assessment rebuild ->
      Requirements Heatmap improve -> Head-to-Head (new) -> Overview tweaks. OPEN each.
      SEQUENCING (Marc, 2026-07-23): (1) finish Landscape top-level tabs, THEN (2) Marc gives Deal dashboard review,
      (3) Marc will send documented CHANGES to the Landscape (incl. deep dive) once written up — fold those in when
      they arrive. Deal notes + deep-dive-change-list both QUEUED behind top-level tabs.
- [x] **P3 Risk Assessment** — DONE 2026-07-23. New `pvRiskHtml2` (pv-07b) on pvAssess; rerouted landscapeHTML
      dispatch (line 2056). Portfolio summary + semantic cross-supplier heatmap (level + confidence dots, gates
      override) + responsible-sourcing coverage callout + selected-supplier material risks / disposition (accept /
      mitigate / evidence-required / escalate / hard-stop) / event timeline (pvDD2EventTimeline directness) /
      mitigation board. Old pvRiskHtml + helpers now DEAD (remove in P7). Verified smoke (risk marker updated) +
      rendered evidence. Content check: non-authored suppliers derive events via pvDeriveEvents (Redshift AWS outage).
- [ ] **P4 Requirements Heatmap** — improve (1-decimal+semantic, evidence-confidence 2nd channel, leadership strip,
      decision-leverage, evidence panel, filters, rename "coverage"). OPEN.
- [ ] **P5 Head-to-Head** — new tab (selectors, compare strip, delta bars, req-diff heatmap, risk-diff, evidence
      compare, cost-driver compare, conclusion+chips). OPEN.
- [ ] **P6 Overview** — 3 changes (fix score/count consistency, tighten dup narrative, move H2H out + teaser). OPEN.
- [ ] **P7** — cleanup dead code, re-integrity, final verify, refresh Desktop folder.

## Seed bug fixes (Marc-caught)
- [x] risksNarr "ML / data-science depth" -> "Cybersecurity / customer-credential exposure" (DONE, landscape-data.js).
- [ ] Score-scale drift (fit 4.5/5 vs 89/100 vs 90; financial Watch vs "low"): resolve via single pvAssess source.
- [ ] 7-vs-9 supplier count (ranked vs screened-out) -> reviewed/passed/screened-out/RFx counts.
- [ ] ESG shown as scored dash -> move to assessment-coverage, not a scored row.

## Progress log
- 2026-07-23: specs written (deep-dive v3 + top-level v3). Sequence confirmed. Starting P1.
- 2026-07-23: P1 Foundation DONE (pv-07a spine + primitives, wired, 15/15 verified, no regression). Cyber
  mislabel fixed. NEXT: P2 Deep Dive 6 subtabs on pvAssess -> replace pvDDSection branches + tab list + compact
  decision header (drop the 2 big bands + composite from the visible surface). Author per-tab grounded data as built.
- Also (side task): bundled platform My Work page -> Desktop\Lilly Procurement Dashboards\My-Work.html (build_my_work.py).
- 2026-07-23: P2 STRUCTURE + Summary done (pv-07b, 6-tab dispatch, compact decision header, 28/28 verify_dd2).
  Other 5 tabs first-pass. NEXT: build the dominant visualization + authored data for each of the 5, then OPEN.
- 2026-07-23: **P2 DEEP DIVE COMPLETE** — all 6 tabs visual-first. Company (ownership tree + footprint + marker
  matrix), Capabilities (capability->requirement heatmap + reference-relevance matrix), Financial&Market
  (peer-position SVG scatter across all suppliers + financial summary + revenue history + commercial-driver matrix),
  Risk (impact x likelihood matrix + event timeline + mitigation board), Lilly (diligence funnel + owner-grouped
  action board). Authored nimbus per-tab data (ownership/locations/capabilities/references/commercialDrivers/
  diligence/actions). Verified: verify_assess + verify_dd2 all green, 12/12 dominant-viz present, smoke clean,
  style comments balanced, 0 external refs. OPENED for Marc. NEXT: P3 Risk Assessment (top-level) rebuild.
- 2026-07-23: Risk & Resilience dominant viz DONE — impact x likelihood matrix (gate rings, zone tint) +
  classified event timeline (directness: service/division/parent) + mitigation board. Authored nimbus.risks +
  nimbus.events; pvAssess returns risks/events; pvDeriveEvents for non-authored. Verified (grounded: matrix GATEs,
  UNC5537 + Patel timeline, mitigation board). REMAINING dominant viz: Company (ownership tree + footprint),
  Capabilities (capability-to-requirement heatmap + reference matrix), Financial&Market (peer scatter + commercial
  drivers), Lilly Fit (diligence funnel + action board). THEN rebuild + verify + OPEN.
