# Category Strategy rebuild - phased plan (#4, Phase 0 for review)

Status: DRAFT plan for Marc's approval. This is a REAL skill rebuild (Marc's words), so it is scoped and
phased here before any build, per separate-design-from-build + the UI-change approval gate. Nothing in
`category-strategy-1c344a` is edited until this plan is approved.

Direction (from the overnight review, green-lit item 4): **11 tabs -> 7 + a new Execution tab + canonical
fixes + remove fabricated defaults.** It is a real rebuild, not a recolor.

Governance: never-regress. The three modes (DEVELOP / MANAGE / PREPARE) and their standalone deliverables
(the DEVELOP/MANAGE JSX dashboard, the PREPARE cleaned XLSX + exception log) are all kept. PREPARE is
untouched by this rebuild (it does not use the dashboard). Desktop-runnable + efficient (no new Opus dep).

---

## 1. Current state

- LOCKED 11-tab dashboard (DEVELOP + MANAGE): **Overview, Pareto & Tail, Suppliers, Subcategories,
  Market & Kraljic, Risk, Strategy, Savings & Scorecard, Supplier Development, Rationalization, Trend & Change.**
- Uses the DOCUMENT palette (Lilly Red / Bold Blue / dark-red header), not the MCM Dashboard Palette.
- Review flagged: too many thin tabs; fabricated illustrative defaults + demo data (a claim-gate violation);
  and structural/canonical issues.

## 2. Target: 7 tabs (the 11 consolidated; Execution added; Trend folded)

| # | Target tab | Consolidates | Note |
|---|------------|--------------|------|
| 1 | **Overview** | Overview (+ Trend & Change deltas in MANAGE mode) | headline KPIs, findings, category summary; Trend becomes the MANAGE prior-vs-current delta band here rather than its own tab |
| 2 | **Spend & Suppliers** | Pareto & Tail + Suppliers + Subcategories | the spend analytics: Pareto/tail, supplier concentration, subcategory breakdown |
| 3 | **Market & Risk** | Market & Kraljic + Risk | market structure, Kraljic positioning, risk register |
| 4 | **Strategy** | Strategy | strategic options + recommended approach |
| 5 | **Savings & Scorecard** | Savings & Scorecard | savings pipeline + scorecard |
| 6 | **Supplier Program** | Supplier Development + Rationalization | SD status + supplier rationalization / consolidation |
| 7 | **Execution** (NEW) | (new) | how the strategy is executed: sourcing waves, RACI, timeline/milestones, next actions, owner per action. The gap the review named. |

(Alternative if Marc prefers Execution as an 8th tab rather than folding Trend: keep Trend & Change as its
own tab -> 8 total. Recommended: 7 with Trend folded, since Trend is a MANAGE-only delta, thin in DEVELOP.)

## 3. Canonical fixes

- **MCM Dashboard Palette** (interactive dashboard, per the two-palette model #2): plum / teal / burnt-orange,
  non-stoplight status (settled = teal, attention = burnt-orange, critical = deep rust, info = muted blue),
  outline pills, no pale-orange fills, grey/black tab strips, no dark mode. Replaces the document palette +
  dark-red header (matches Deal / Landscape / RFx).
- **Claim-gate (remove fabricated defaults):** every KPI, benchmark, supplier figure, and finding cites a
  source (evidence badge) or abstains with `[CONFIRM ...]` / NEEDS_INPUT. Remove the fabricated illustrative
  defaults and demo-data-as-fact; the worked example is clearly labeled illustrative, and a real run never
  invents a number to fill a tab.
- **Structural:** every one of the 7 tabs always renders (NEEDS_INPUT / NOT APPLICABLE / RESEARCH PENDING
  states), keep the one-shared-kernel discipline (G11) for any weighted/NPV/escalation math, keep G10
  chunked assembly for the single-file artifact.

## 4. Phased build sequence (after approval)

- **Phase 1 - spec:** rewrite `references/dashboard-canonical.md` to the 7-tab structure + MCM palette +
  claim-gate rules + the consolidation mapping. Reviewable diff.
- **Phase 2 - reference JSX:** rebuild the canonical example JSX to the 7 tabs in MCM (candidate for a Sonnet
  subagent per cheaper-workflow-models, then verify: brackets balanced, numbers reconcile, 0 banned hexes,
  claim-gate abstains present, malicious-scan clean, screenshot).
- **Phase 3 - workflow + interpretive content:** update the DEVELOP/MANAGE phase text + the "Mandatory
  Interpretive Content" spec to the 7-tab model + the Execution content; update the 11-tab references
  (effort tiers, multi-category, historical-deck incorporation) to 7.
- **Phase 4 - verify + package:** full self-test, malicious scan, repackage the .skill, update the tracker.

## 5. Open decisions for Marc (before Phase 1)

1. The 11 -> 7 consolidation mapping above - approve, or adjust which tabs merge?
2. Execution as the 7th tab with Trend folded into Overview (recommended), OR keep Trend and make Execution an 8th?
3. Confirm the MCM palette conversion applies here too (it should, for Deal/Landscape/RFx parity), turning
   this into the document-palette-to-MCM change for a 4th dashboard.
