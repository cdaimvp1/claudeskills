# ARIA Enrichment (optional capability layer)

**Status:** optional. Every skill in this suite is fully functional without ARIA. This document defines an OPTIONAL data layer that, when ARIA is available in the session, enriches certain skills with live Lilly internal data and authoritative public-company financials. When ARIA is not available, skills behave exactly as their own instructions specify.

This spec is the single source of truth for the enrichment layer. Individual skills carry a short `ARIA ENRICHMENT (optional)` pointer that names which capabilities apply to them and defers here for the method.

---

## 0. Prime directive: graceful degradation (HARD RULE)

- The suite must work for users who do not have ARIA. ARIA enrichment is additive, never required.
- Never fail, block, stall, or instruct the user to install ARIA because an enrichment is unavailable.
- If a skill's output would have shown an enrichment and ARIA is absent, show ONE neutral line in that spot: `Lilly internal enrichment (ARIA) not available in this session.` Then continue with the skill's normal output.
- Never fabricate an ARIA-sourced figure. Absent data is reported as absent, not as zero and not as an estimate dressed up as internal data.

## 1. Reachability test (run silently at the start of any enriched skill)

You are on the ARIA path only if BOTH are true this run:
1. An ARIA session is active (or can be activated) in this conversation, and
2. The `aria_*` data tools are present and callable.

If either is false, you are on the NON-ARIA path: ignore every enrichment, emit the neutral line only where an enrichment slot exists, and run the skill as written. Do not narrate the check.

Do not assume ARIA is present just because a prior turn used it; re-confirm the tools are callable before relying on them.

## 2. Capability 1 - Lilly internal footprint

**What it adds:** for a named vendor (or vendor code), a compact internal picture - is this an active Lilly vendor, what we have spent (total, by year, by commodity), payment terms, the IKC risk flag, and the supplier-performance score where available.

**How to get it (Canon-first):**
1. `aria_canon_find_recipe` / `aria_canon_discover` to route to the right source for the question (do not guess table or measure names).
2. Spend: the S2P Purchase Order Product (Fabric semantic model) via prebuilt measures - third-party spend is the default; intercompany is included by design, so label scope. Recipes: `s2p_vendor_spend_top_n`, `procurement_spend_summary`.
3. Invoice-posted actuals (when invoice-level detail is needed rather than PO commitments): the HANA AP / P2P views (FIAP family, `CV_P2P_TRANSACTIONS`, `CV_PO_VS_INVOICE`). S2P is PO/commitment-centric and excludes invoice/payment status.
4. Vendor attributes and risk flag: the CAS vendor-master family (`CV_VENDOR_MASTER`, `CV_VENDOR_MASTER_COMP_CODE` for `IKC_RISK_FLAG`, `HCP_FLAG`, payment terms `ZTERM`).
5. Supplier performance: `ZCV_SUPP_PERF` (on-time, quality, compliance). Quality detail: `ZCV_V_QM03_ZS324`.
6. Commodity classification of what we buy from the vendor: `ZCV_COMMODITYCODE` plus commodity text on `V_PUR01` / `D_PUR12`.

**Hard constraints:**
- The vendor-master views are sensitive and require role `FGL__00605`; the CAS schema may be data-engines-only. If vendor attributes return nothing even with ARIA present, treat them as UNAVAILABLE, not zero. Spend and performance may still be reachable when vendor-master attributes are not.
- Procurement category-management enrichments (sourceability MGC/IKC, diversity classifications, category-owner / Senior Director, IBU Hub, Wave Cycles) live in the Global Procurement spend cube ABOVE SAP and are NOT in Canon. Do not promise to reproduce them from ARIA. ARIA supplies the transactional spine and the commodity hierarchy; the cube still owns the management overlay.

## 3. Capability 2 - Public-company financials (SEC)

**What it adds:** for a publicly traded supplier (or peer), authoritative financials and disclosure text - revenue, margin, liquidity, segment detail, and risk-factor / going-concern language, each with a filing citation. This is a CITABLE source that satisfies the anti-fabrication rule in `supplier-risk.md`, so it converts hedged risk language into grounded, sourced claims.

**How to get it:** the `aria_sec_*` tools - `aria_sec_concept_value` for a specific figure, `aria_sec_concept_series` for a trend, `aria_sec_filing_list` / `aria_sec_filing_sections` / `aria_sec_filing_text` for narrative (MD&A, risk factors, going concern), `aria_sec_audit_opinion` for the auditor view, `aria_sec_concept_inventory` before declaring a concept unreported.

**Hard constraints:**
- Public companies only. For a private supplier, do not assert financials; route to the formal screen per `supplier-risk.md`.
- SEC figures are reported to the million; never claim penny-level agreement with an internal ledger.
- Always cite the form and date (for example "SEC 10-K FY2025").

## 4. Capability 3 - Spend forecast

**What it adds:** a forward projection of a spend (or rate) time series - category run-rate, renewal-horizon projection, or escalation modeling - rather than only historical reporting.

**How to get it:** the forecasting tools - `aria_forecast_pipeline` (profile, select method, run, verify in one call) or `aria_forecast` for a single run; build the series first from Capability 1 spend.

**Hard constraints:**
- Forecast from closed periods only; flag open/partial periods.
- Always label output as a projection and state the method and horizon. Never present a forecast as actuals.

## 5. Output labeling (always, when ARIA data is used)

- Internal data: tag `Lilly internal (ARIA)` with the period and scope (third-party vs all-in).
- Public data: tag `SEC <form> <date>`.
- Forecast: tag `Projection (ARIA forecast, <method>, horizon <n>)`.
- Keep ARIA-sourced content visually distinct from web research and inference so the reader can see provenance at a glance. This preserves each skill's existing confidence-labeling discipline (observed vs inferred vs missing).

## 6. Per-skill applicability

| Skill | Footprint | SEC | Forecast | Notes |
|-------|-----------|-----|----------|-------|
| supplier-deep-dive | yes | yes | - | Footprint fills the "prior Lilly relationship" section; SEC fills financial signals for public vendors. |
| supplier-landscape | yes | yes | - | Per shortlisted vendor: active-at-Lilly line; SEC financial-health read for public names. |
| category-strategy | yes | - | yes | Footprint = live spend spine by vendor/cost center/commodity; overlay columns remain cube-only. Forecast = category trajectory. |
| commercial-negotiation-prep | yes | yes | - | Footprint = internal spend history with the supplier; SEC = supplier margin as a lever. |
| market-rate-benchmarking | yes | yes | - | Footprint powers INTERNAL and RATIONALIZATION modes (cross-vendor rate/spend, redundant-tool consolidation); SEC adds public-supplier pricing context to EXTERNAL mode. |
| pro-forma-builder | yes | - | yes | Footprint = baseline spend + actual payment terms; Forecast = escalation / run-rate. |
| rfp-engine | yes | - | - | Seed requirements / pricing template with category baseline spend and incumbent flag. |
| legal-negotiation-prep | yes | yes | - | Supplier spend/leverage and payment-terms baseline; SEC for financial leverage. |
| lilly-contract-review | yes | - | - | Commercial-analysis panel only: counterparty active-vendor status, current spend, risk flag, rate context. The legal/redline passes are unchanged and do not use ARIA. |
| executive-summary-package | yes | - | - | Spend and vendor-status context into the ATC/ATS summary. |
| negotiation-simulator | yes | yes | - | Ground the supplier persona in real spend/leverage; SEC financials for realism. |
| should-cost-builder | yes (light) | - | yes | Commodity/material reference for the cost stack; forecast input-cost trend. Lowest-fit; keep optional and light. |
| rfp-response-analysis | yes | - | - | Incumbent detection and current-spend context for responding suppliers. |
| evaluation-engine | yes | - | - | Incumbent flag and spend context into scoring. |

Skills NOT enriched (no transactional-data appetite or already sourced elsewhere): workflow-map, timeline-builder, process-navigator, comment-cleanup, voice-profile, procurement-launcher, meeting-prep-brief, theos-field-guide, rfp-case-manager, negotiation-playbook-learning. (meeting-prep-brief and theos-field-guide draw their data from the M365 connector, which is the correct source for inbox/calendar/Teams.)

## 7. Maintainer note (so this survives regeneration)

Current architecture (do not inline this file): this file loads as a companion file only. The
foundation `lilly-brand-assets-1c344a/SKILL.md` explicitly keeps it out of the single-file inline
merge (large, changes independently of the enforcement content) and a placeholder in that SKILL.md's
`## INLINED: references/aria-enrichment.md` section states the companion file is the single source
of truth. To make this layer durable across your next regeneration:
1. Keep THIS file at `lilly-brand-assets-1c344a/references/aria-enrichment.md` as a companion file; do NOT inline it into the foundation `SKILL.md`.
2. Add the `ARIA ENRICHMENT (optional)` pointer block to your shared per-skill template / generator, gated to the 14 skills in the table above with each skill's capability list. The pointer is delimited by `<!-- ARIA-ENRICHMENT:START -->` / `<!-- ARIA-ENRICHMENT:END -->` and sits immediately after each skill's YAML front matter, outside the generated SHARED-BLOCK region.
3. Re-run your normal build. No other change is required; the layer is self-contained and removable.
