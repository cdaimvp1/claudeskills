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
- [ ] **P2 Deep Dive** — 6 subtabs (Summary / Company&Ownership / Capabilities&Operations / Financial&Market /
      Risk&Resilience / Lilly Fit&Diligence), each dominant-viz-first. Replace 2 header bands w/ compact decision
      header. OPEN for review.
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
