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
- [ ] **P3 Risk Assessment** — rebuild (8-row taxonomy, semantic+confidence, gates override, event directness +
      timeline, mitigation board, coverage-not-scored for unassessed). OPEN.
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
