# Supplier Deep Dive — Redesign Spec v3 (Marc's analysis, 2026-07-23) — SUPERSEDES v2

## The reframe (the whole point)
The Deep Dive must be a **visual decision system**, not a company profile / investment terminal.
It answers ONE question first: *is this supplier worth advancing in THIS sourcing event, what
should Lilly care about, and what must we validate next?* Organize everything by
**decision → evidence → materiality → next action**, delivered **visually**.

Target mix per view: **~60% visual analysis · ~25% structured tables · ~15% narrative.**
Narrative is limited to: what the visual means · why it matters to Lilly · what action follows.
The rich D&B/Bloomberg-style fields are NOT the surface; they are **conditional evidence
underneath** that populates normalized fields when available.

## What was wrong with v2 (my current build) — fix all of these
- Trying to be profile + terminal + evaluation + risk report + requirements matrix + recommender at once.
- **No hierarchy** between verified fact / external research / internal Lilly info / Claude inference /
  calculated score / recommended action — all shown with equal authority.
- **Internal inconsistencies**: fit 4.5/5 vs competitive 89/100 vs 90/100 elsewhere; financial tagged
  "Watch" while its own narrative says viability risk low; security "contained; no material concern"
  while narrative describes 165+ breached tenants + litigation.
- **Misclassified risk**: the "ML / data-science depth" risksNarr entry actually describes the 2024
  UNC5537 credential-stuffing incident — that is a **cybersecurity** risk. (Fix in seed.)
- **Duplication**: whyLilly repeated on Profile + Lilly Fit + recommendation; financials repeated on
  Profile + Market&Financials (narrative + table + chart + additional-detail); full 7-supplier
  Requirements Heatmap repeated inside every supplier's Deep Dive; risk-dimensions table duplicates the
  top-level Risk Assessment tab.
- **False precision**: composite score (89/100) — demote/remove from the visible interface; per-dimension
  concern levels + confidence are safer than an unsupported 73/100.
- **Decorative viz**: revenue chart adds nothing after the summary already says "strong growth + FCF".
- **Risky fabrication**: "~$3.1M/yr commercial estimate" reads like a bid; public consumption pricing
  can't reliably estimate Lilly TCO. Remove precise $ unless supported by bids/internal/benchmark.
- **Disclaimer noise**: "external / illustrative / reflect-only / not validated" repeated so often it's
  wallpaper — replace with a per-field STATUS + one compact evidence-coverage summary.
- **Not supplier-type aware**: same layout can't sensibly evaluate Snowflake (public) vs Databricks/
  ClickHouse/Firebolt (private) vs Redshift/BigQuery/Fabric (products inside Amazon/Google/Microsoft).
  Lilly contracts an ENTITY, evaluates an OFFERING, depends on specific SERVICES — three different things.
- **Weakest where it should be strongest**: Lilly Fit says "Strategic fit: Supports" (says nothing);
  open-questions generator finds only 2 partials — nowhere near real diligence for a new critical supplier.

## Normalized supplier-assessment model: 30 data points → 8 dimensions
Each data point carries: `assessment · raw_value · normalized_value · source_name · source_type ·
source_date · confidence · availability_status · materiality · supporting_evidence · recommended_action`.

**8 decision dimensions** (the rollups):
1. Identity & ownership (legal identity/IDs · operating status & age · HQ & critical locations · ownership
   & corporate hierarchy · ultimate beneficial ownership)
2. Capability & sourcing fit (relevant products/services · pharma/regulated experience · geo & service
   coverage · capacity & scalability · relevant customer / Lilly experience)
3. Financial viability (size & revenue · profitability & cash · liquidity · leverage/debt · credit &
   failure risk — D&B Failure/SER/SSI/Viability/PAYDEX, Bloomberg PoD, ratings)
4. Operational resilience (critical footprint · critical sub-tier dependencies · concentration exposure ·
   continuity/disruption exposure · substitutability & alternates)
5. Integrity, legal & compliance (direct sanctions/watchlist · ownership-derived sanctions · material
   legal/regulatory events · adverse media · trade/sourcing restrictions — UFLPA/889/BIS/export)
6. Quality, regulatory & EHS (required certs/qualifications GMP/GxP/ISO · inspection/enforcement/recall ·
   quality & EHS performance) — dynamically emphasized for regulated categories
7. Cyber, privacy & data (rating · breaches/incidents · certs · controls · privacy posture · data
   locations · subprocessors · level of Lilly system/data access) — subfields when PII/PHI/IP/network/AI/regulated
8. Responsible sourcing & evidence confidence (material human-rights/labor/environmental/diversity +
   overall data completeness, source quality, unresolved gaps). No generic ESG score as a decision by itself.

**Fallback / retrieval states** per field (this is a FEATURE, shown visually, never a silent gap):
`Verified · Partially verified · Supplier asserted · Proxy used · Data source required · Not found · Not applicable`.
Separate "no issue found" from "not enough information." Claude researches in **8 grouped passes** (one per
dimension), NOT 30 independent searches.

## Decision gates (override the aggregate — never a simple average)
**Potential HARD STOP**: confirmed applicable sanctions/exclusion · can't meet a mandatory quality/regulatory
requirement · disqualifying forced-labor/trade restriction · unacceptable cyber/privacy exposure for scope ·
material misrepresentation of identity/ownership/capability.
**Mandatory ESCALATION**: high financial-failure risk · unresolved UBO · severe regulatory/quality/criminal
event · critical single-source dependency · material adverse media (corroborated) · insufficient data for a
high-criticality supplier.

## New IA: 6 subtabs (replaces Profile / Market&Fin / Strengths&Risks / Lilly Fit / Requirements Fit)
Each subtab = **one dominant visualization** + 2-3 supporting visuals + a compact evidence/detail table +
≤3 narrative insights + a visible data-confidence indicator.

**0. Supplier Summary (DEFAULT)** — "Should Lilly advance this supplier, and why?"
   - Compact **decision header** strip: Recommendation · Rank · Requirements fit · Risk posture · Data
     confidence · Open issues (replaces the two big repetitive header bands).
   - **8-dimension assessment bars** (horizontal): bar = relative position, label = actual assessment
     (High / Strong / Moderate / Insufficient evidence). Confidence via FILL: solid=verified · striped=partial
     · outline=insufficient. NEVER one averaged composite.
   - **Requirements-group mini-heatmap** (groups, not 36 rows); row click → detail.
   - **Opportunities vs concerns**: two side-by-side visual lists, ≤3 each.
   - **Evidence-coverage segmented bar**: Verified / Partial / Supplier input / Missing (%).

**1. Company & Ownership** — "Who is it, who controls it, where are the operations that matter?"
   - Dominant: **corporate ownership tree** (ultimate parent → immediate parent → contracting entity →
     operating/product/service entities) with markers: public/private · sanctions match · UBO unresolved ·
     Lilly vendor-master match · contracting-entity confirmed.
   - **Operating-footprint map** (only delivery-relevant locations; marker types per function) — fallback:
     grouped location table.
   - **Identity-verification matrix** (element · status · source).
   - **Company-scale strip** (founded · employees · revenue RANGE · countries · relevant facilities · public/private).

**2. Capabilities & Operations** — "Can it deliver the scope at the required scale?"
   - Dominant: **capability-to-requirement heatmap** (evidence-based, NOT keyword offering-mapping);
     cells: Confirmed / Partially confirmed / Supplier asserted / Not demonstrated / Gap / N-A; click → evidence.
   - **Delivery-readiness** staged bar (product maturity · implementation · Lilly-arch fit · capacity · support).
   - **Reference-relevance matrix** (pharma? · similar scale? · similar use case? · independently verified?).
   - **Dependency diagram** (cloud/impl-partner/component/support subcontractor; tag criticality/geo/
     substitutability/confidence). If none: visibly state "Critical dependencies not yet disclosed."

**3. Financial & Market** — "Financially viable, commercially sustainable, appropriately positioned?"
   - **Financial-health trend** LINE chart ONLY with ≥3 comparable periods; else directional bars (2) /
     metric card (1) / score+scale+peer (risk score only) / required-information card (none). No fake trend line.
   - **Financial-health bridge** (growth · profitability · liquidity · leverage → assessment + evidence; expandable).
   - **Peer-position scatterplot** (x=financial viability · y=capability fit · bubble=scale · candidates as points).
   - **Commercial-model** driver visualization (compute/storage/transfer/support/impl/exit variability), NOT a
     fabricated annual $; precise $ only if bids/internal/benchmark/prior-spend support it.

**4. Risk & Resilience** — "What could stop performance, and how should Lilly respond?"
   - Dominant: **impact × likelihood risk matrix**; each plotted risk encodes severity · confidence ·
     mitigation status · owner · is-it-a-gate. Incomplete-data risk looks different from verified.
   - **Material-events timeline** (breach/enforcement/recall/distress/ownership/sanctions/litigation/
     disruption/M&A) — only MATERIAL events; date · event · impact · resolution · source confidence.
   - **Resilience dependency map** (delivery chain; mark SPOF · alternate · recovery-time · geo concentration · unverified).
   - **Mitigation status board** (risk · treatment · status: open/proposed/not-started) — turns risk into a workplan.

**5. Lilly Fit & Diligence** — "How well does it fit Lilly, and what must happen before selection?"
   - **Lilly-fit matrix** (architecture · pharma experience · internal compatibility · existing relationship ·
     regulatory fit · implementation readiness · commercial leverage → fit + confidence; evidence on click).
   - **Internal-relationship timeline** (contracts/spend/owners/implementations/performance/prior sourcing);
     if none: "No Lilly contractual or performance history found."
   - **Diligence funnel** (research / supplier-evidence / security / quality / financial-TPRM / references /
     contract-readiness as % complete) — replaces the long open-questions list.
   - **Action board** grouped by owner (action · owner · gate? · status).

### Requirements analysis placement
Full 7-supplier Requirements Heatmap stays on the **top-level Requirements Heatmap tab** (don't repeat inside
each Deep Dive). Inside the Deep Dive: only the supplier-specific summary (group heatmap · must-have gaps ·
partials · evidence confidence · confirmation items) + a "View full cross-supplier heatmap" control.

## Data-driven visualization selection (Claude picks by what data EXISTS)
- Trend chart: ≥3 comparable dated periods, consistent metric, known source. Else fall back.
- Map: location materially affects delivery/risk AND real facility/service/data-center locations exist
  (more precise than country-of-domicile). Offline = SVG schematic or grouped table.
- Ownership tree: parent/subsidiary/UBO exists OR contracting entity ≠ brand/product OR ownership creates risk.
- Network diagram: real identified suppliers/subcontractors/partners, supported, matters to delivery.
- Risk matrix: impact & likelihood separately assessed; unknowns visually differentiated.
- Heatmap: multiple comparable dimensions, standardized status categories.
- Table: exact values/sources/actions matter; sorting/filter/export; a chart would obscure.
Never fabricate a network/trend/map from weak web references.

## Viz REMOVED from default (drilldown/evidence only, not searched-for by default)
Competitor map · standalone PAYDEX graph · payment-habits matrix · detailed litigation tables · UCC filing
table · individual sanctions-list tables · default-risk histogram · market-implied PoD chart · CDS model-vs-
market · share-price chart · 52-wk high/low · P/E & dividend stats · ESG factor/subissue table · commodity
table · separate climate map · separate supplier-qualification report · separate supply-base quintile report.

## Supplier-type awareness (compose-by-traits)
Layout adapts to entity type: public company · private company · product/platform inside a hyperscaler.
For a hyperscaler product (Redshift/BigQuery/Fabric): "company" = the parent; no standalone financials;
ownership tree + entity-vs-offering-vs-service separation is essential; financial-viability reads at parent level.

## Build stages (proposed)
0. Capture this spec (done) + reshape Snowflake deepDive into the normalized evidence/confidence/8-dimension
   model + gate fields; fix the mislabeled cyber risk + the score-scale inconsistencies in the seed/derivation.
1. Build **Supplier Summary** (the new default) end-to-end as the visual-first EXEMPLAR: decision header,
   8-dimension assessment bars w/ confidence fill, requirements-group mini-heatmap, opportunities/concerns,
   evidence-coverage bar, gate logic. Sign-off gate.
2. Roll the pattern to the other 5 subtabs (Company&Ownership, Capabilities&Operations, Financial&Market,
   Risk&Resilience, Lilly Fit&Diligence) with their dominant + supporting viz.
3. Supplier-type adaptation across all 7 (public / private / hyperscaler-product).
All vanilla JS/SVG/CSS, self-contained (offline). Grounded data only; every unknown is an explicit status,
not a silent gap or a fabricated value. Verify each stage (node --check + smoke + rendered-evidence checks).
