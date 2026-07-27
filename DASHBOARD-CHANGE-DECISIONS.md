# Dashboard Change Decisions (mockup triage) — 2026-07-27

Triage of the 14 change-mockups (`OneDrive\Desktop\dashboard-mockups\`). Locked dashboards get a batched
rebuild per dashboard once the PENDING items resolve. "Do" = label/CSS-level, no mock. Legend: BUILD / MOCK
(show first) / PENDING (needs Marc) / REJECTED / DO.

## RFx
- R1 banner "Final Recommendation" -> "Recommendation to Award" — DO.
- R2 tab "Business Case" -> "Business Case & Approval" — DO (lands with the subtab split, see R4).
- R3 gate label "Merit Leader - Gated" + "Conforming Leader" — DO (enumerate every spot).
- R4 **What-Changed-Since-Recommendation** panel — ADDITIVE. **Split Business Case into SUBTABS**: "The Case"
  (Rationale · Deal Terms & the Field · Deal Economics + Mini P&L) | "The Ask & Approval" (The Ask · R4 · Path to
  Close). R4 lives in "The Ask & Approval". **MOCK the subtab structure first (PENDING Marc approval).**
- R5 value map -> panel-score x NORMALIZED all-in — BUILD, **GRAPH ONLY**; everything else in that panel stays
  exactly as-is (Marc: do not change anything except the graph).
- R6 Risk Roll-Up provenance split (RFx-issues vs diligence/context) — **PENDING** (Marc: "don't see the
  improvement"; explained = provenance/evidence integrity, not polish; Marc to say build/skip).
- R7 `--` + hover "Data not available" for zero-data cells — BUILD. + fix heading "Completeness & risk roll-up"
  -> "Completeness & Risk Roll-up". + **FLIP rows/columns** on BOTH the Participation and Completeness & Risk
  Roll-up panels to fit better — **MOCK the flipped panels first** (visual judgment).
- R8 label "3-Yr TCV (simple)" -> "3-Yr Subscription Baseline" — DO.
- R9 trim Overview Evaluation Summary — **REJECTED** (leave as-is).
- R10 pull ZOPA from Analysis — **DO NOT DO**.
- R11 CSS cleanup (inert dark tokens) — DO.

## Deal
- D1 footer overlay fix + static Landscape/RFx footer — DO.
- D2 inference labeling — **PENDING**: chips-everywhere rejected. Cleaner = ONE convention (dotted underline / ◦)
  + ONE key + hover-for-basis, no per-item chip. **MOCK the dotted-underline convention first.**
- D3 Financial Model when no inputs — BUILD **Option A** (collapsed + labeled + non-expandable).
- D4 "Protection Score" -> "Playbook Alignment Score" — DO.
- D5 + D6 Overview reorder / compact ZOPA — **REJECTED** (leave Deal Overview as-is).
- D7 sticky secondary subnav — DO, **must match the tab design**.
- D8 Legal Findings Register scroll — BUILD **Option B** (nested scroll + obvious affordance: visible scrollbar +
  "N of M / scroll for more" + fade edge).
- D9 CSS cleanup (~3MB, dead dark theme, dup :root, ~59 @font-face) — DO.

## Landscape (all ADDITIVE unless noted; nothing existing changes unless stated)
- OVERVIEW: ADD the summary cards (Credible field 7 · Advance to RFx 3 · Keep as leverage 2 · Excluded hard-screen
  2 · Open uncertainties 4) + the full **Market Decision Brief** Sections 1-5 (exact content Marc pasted: The
  Credible Field · Recommended Advance Slate · Keep as Leverage / Exclude · Uncertainties That Could Change the
  Slate · Critical RFx Questions / Landscape->RFx handoff). **DO NOT change the evaluation-summary or recommendation
  panels.** **REMOVE the Segmentation & Differentiators panel** (false-precision veneer on inferred data - confirmed).
- DEEP-DIVE: ADD "Coverage by Section" + "Full Schema, Field-by-Field" sections somewhere; **do not change the
  existing deep-dive** (L1/L3/L14/L13 redesign NOT applied - only these 2 additive sections).
- FINANCIAL & MARKET: change **Peer Position** panel (-> categorical quadrant) + **Credit & Market Enrichment**
  panel (-> no D&B/Bloomberg placeholder, schema-ready) to the mock; **LEAVE the Financial Health panel alone**.
- HEAD-TO-HEAD: leave alone; at most ADD the **"Decision Could Turn On"** section (L10).
- REQUIREMENTS HEATMAP: BUILD **decision leverage** = weight x must-have x differentiation x confidence (L9/L14).
- H2H launcher button on Overview (A1 remove) — **PENDING confirm** (only non-additive Landscape change).
- L15 deep-dive tab consolidation — **DO NOT DO**.

## Shared
- S1 Title-Case Deal + Landscape section headers to match RFx — DO.

## Next
MOCK (pending Marc nod): D2 dotted-underline · R4 Business-Case subtabs · R7 flipped panels. Then batch per
dashboard: RFx (R1/R2/R3/R5/R7/R8/R11 + approved R4 + R6 if greenlit), Deal (D1/D3/D4/D7/D8/D9 + approved D2),
Landscape (all approved additive + heatmap + Segmentation removal + S1). One rebuild per dashboard.
