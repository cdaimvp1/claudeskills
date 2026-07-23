# Deal Tab Map — reference for the Deal-tab bundle build (task #77 output)

Reference project: **`acme` / P-1042** — "AI-powered employee-analytics platform" (Acme Analytics, sole-source, $1.8M TCO).

## 0. Canonical version (which Deal tab to bundle)
- **`project-view.html` is the canonical/live path** for `acme` (`projects.html` links to `project-view.html#p=<id>`).
- `project-view-vanilla.html` = same `pv-08/11/12/13` Deal scripts → **byte-identical Deal output**; only the Comms tab/React island differs. Not the live path.
- `project-view-rfx.html` = unrelated legacy standalone (~130KB all-inline, no `pv-*.js`, no `PROJECTS`/`CURPROJ`/`acme`). **Not used by acme.**
- Trait gating in `dealHTML()` (pv-13:783): `PROJECTS.acme.traits = {competitive:false, existingMSA:null, renewal:false, supplierPaper:true, supplierChosen:true}` → all of `dealIsRfx()`/`dealIsBuyMsa()`/`dealIsRenewal()` are FALSE → acme renders the **standard 3-mode Deal tab** (Negotiate / Pro-forma / Review), no RFx/buy-under-MSA/Renew variant.

## 1. Sub-tabs (modes)
- State: `DEAL_MODE` (pv-10:145, default `'negotiate'`). Dispatch: `dealHTML()` / `dealMode(m)` (pv-13:780-811).
- For acme: **Negotiate · Pro-forma · Review** (Renew only appears for renewals).

## 2. Panels per mode
**Negotiate:** contract-status strip (always on) · Key issues · Negotiation strategy (4-tier KPI: Red Line/Hold Firm/Strategic Trade/Easy Concede) · Position playbook (5-persona tone toggle) · Leverage read · Position map · Talking points · Red lines · Concession sequencing (R1/R2/R3 + BATNA) · SME pre-engagement · "MSA already covers" toggle · **Commercial analysis** block (pv-12, see below) · Negotiation-prep summary · Contracted rate card (empty for acme) · ZOPA by line item + Total-deal ZOPA/TCO roll-up.

**Commercial analysis** (inside Negotiate, pv-12): Pricing-model recommendation (6 models) · External benchmark bands (P10/P50/P90, N≥5 gate) · Ranked counter-proposal + trade matrix · Value-at-risk + assumptions register · Discount-architecture waterfall (gross→net) · **Levers & Protection Score model (INTERACTIVE: lever toggles + Yr1/3yr switch, live recompute)** · Volume/consolidation leverage · Counter-email draft (5-persona, draft-don't-send).

**Pro-forma** (own mode, pv-12): Pro-forma/TCO summary + **Export to Excel (real CSV)** + "Open full model" → P&L/cashflow-by-year matrix + **what-if discount-rate slider `PF_DISC` (0-15%) repricing NPV live** · Scenarios (Low/Base/High) · Sensitivity (driver tornado, ±15%) · TCO teardown (hidden costs + escalation buttons 0/3/4/6%/yr). **No WACC-labeled control.**

**Review** (pv-13): Overview (Protection Score gauge + Go/No-Go + methodology + governing-agreement + conditions-before-signature) · Document type · Findings (grouped H/M/L: Evidence/Cross-ref/Impact/Action) · Risk heatmap (14-cat Covered/Confirm/Gap) · Protection & coverage · Vendor tactics (12-cat FLAG/CLEAR) · Act on the review (vendor-response draft) · Contract versions · Push-to-LEAH (type-gated).

## 3. Bundle dependency set (self-contained, acme-only)
pv-01 (helpers/globals) · pv-03 (PROJECTS.acme) · pv-04 (domain fallbacks NEGPREP/CONTRACT/DEAL_CATEGORIES/…) · pv-08 (status strip, versions, LEAH, rerenderDeal) · pv-10 (ZOPA_LINES/DEAL_TCO/DEAL_ISSUES/PRICING/DEAL_MODE) · pv-11 · pv-12 · pv-13 (the tab) · **pv-14** (load-bearing: `escD`/`escapeHtmlPV`/`safeHref`/`toast`) · pv.css + theo-color.css. NOT pv-09 (no infoHover in Deal) or pv-07.
- **GOTCHA (offline):** `dealReviewLoad()` + `dealDraftVendorResponse()` call `LillyAPI.tryLive(...)` with NO `!window.LillyAPI` guard → need a minimal `LillyAPI` stub (or guard) so Review mode is safe self-contained.

## 4. Data contract — IMPORTANT (differs from Landscape)
- **`PROJECTS.acme` has NO `deal` key.** The Deal content comes from GLOBAL fallback constants (`ZOPA_LINES`, `DEAL_ISSUES`, `CONTRACT`, `DEAL_CATEGORIES`, `PRICING`, `DEAL_TCO`, `NEGPREP`, `RENEWAL`, `CM_*`, …) via a single non-project-keyed `Theo.data.projectViewSeed()`, PLUS Acme-specific prose **hardcoded inline** in render functions (e.g. "$600K/yr", "$1.8M TCO (3-yr)", "1,500/seat @ 400 seats", "Acme", "AI Standard §3.5").
- The override mechanism exists (`PROJECTS.acme.deal = {zopa, issues, contract, dealCats, cm:{…}, renewal, cversions, supplierContact, paper}`) but is **unused** — acme's Deal tab is a hardcoded demo narrative on the shared fallback path, not a data-driven render like Landscape.
- **Implication for "pick a real supplier + enrich":** enrichment must populate a `PROJECTS.acme.deal` override AND/OR edit the global constants, AND replace hardcoded inline prose. More surgical than Landscape's clean seed swap.

## 5. Lens mapping + merge candidates (steer #2)
| Skill | Deal mode | Platform already covers | Skill ADDS (pull in) |
|---|---|---|---|
| **contract-review** = Legal Protection (+ its own Commercial Analysis panel) | **Review** (legal); its Commercial Analysis overlaps the pv-12 Commercial block in **Negotiate** | Review is already deep (Protection Score, 14-cat heatmap, findings, 12-cat vendor tactics, Go/No-Go, versions, LEAH); Negotiate already has a rich commercial block | Marginal on new panels; value is redline-generation depth/breadth. Reconcile contract-review's Commercial Analysis vs the platform's already-rich pv-12 commercial block (dedupe, favor richer). Still to mine: April-2026 export references (commercial-analysis/playbook/sme-matrix/pharma-req/dpa/vendor-tactics) + real Lilly templates. |
| **pro-forma** = Deal Economics | **Pro-forma** | TCO summary, cost-component table, P&L/cashflow matrix, Low/Base/High scenarios, driver tornado, hidden-cost teardown + escalation | 6 genuinely additive: (1) **WACC-labeled discount control w/ governance band** (Target 3%/Ceiling 6%) — platform slider is unnamed/unbenchmarked; (2) **NPV-vs-discount-rate live curve + break-even marker**; (3) **Break-Even & Robustness** section; (4) **Payback-period KPI**; (5) **Savings Waterfall vs Baseline/incumbent** (platform waterfall is supplier list-to-net only, no incumbent comparison); (6) **Assumptions Register w/ dated Research Log + Confidence** for modeling assumptions (WACC/escalation/horizon/currency). |
| **scope-sow** = Scope Definition | **none — no Deal sub-tab owns scope today** | nothing | **100% additive → a new sub-tab's worth:** Scope Definition Score (10 weighted 0-5 dims) · Deliverables Register (verification/testability) · In/Out-of-Scope + Section Coverage Map (Present/Partial/Missing) · RACI · Assumptions/Dependencies registers · Milestone Schedule w/ payment-% reconciliation to contract value · Acceptance-Criteria Objectivity Scan · SLA/KPI Register (measurement/cadence/credit) · Staffing & Rate Card (role-based, footing checks) · Change-Control Trigger Register. |

**Bottom line:** the merge is NOT a light reskin — scope-sow adds a whole new **Scope Definition** dimension the Deal tab lacks entirely, and pro-forma adds rate-governance / break-even / baseline-comparison the platform doesn't have. contract-review is already well-covered on Review; its main add is redline depth + reconciling its Commercial Analysis against the platform's existing commercial block.
