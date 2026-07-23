# Landscape Dashboard — Spec-Gap Review + Build Tracker
Authoritative working doc for finishing the Supplier Landscape dashboard against Marc's research-grounded spec
(the D&B/Bloomberg data dictionary + per-subtab redesign + cross-tab standards, pasted 2026-07-23).
Purpose: survive context compaction. Read this FIRST when resuming landscape work.

## The spec in one screen (the bar)
Each Deep Dive subtab = **ONE dominant visualization** answering the tab's main question + **2-3 supporting visuals**
+ **a compact evidence/detail table** + **<=3 short narrative insights** + **a visible data-confidence indicator**.
Roughly **60% visual / 25% tables / 15% narrative**. **Data-driven viz selection**: draw a trend only where >=3 real
periods exist, a map only where real locations exist, an ownership tree only where parent/UBO differs, a network only
where real dependencies exist; **absent data is gap-stated, never faked**. Kill duplicate visuals. Every panel earns
its width (no chart in the left half with an empty/3-line right half). One card = one focused idea (no crammed cards).
Standardize scoring (ONE fit scale; risk = semantic level + confidence; evidence = verified/partial/asserted/proxy/
missing; recommendation = Advance / Advance-with-conditions / Hold-as-alternate / Do-not-advance / Screened-out).
Palette: plum/teal primary + burnt-orange emphasis; functional severity colours only where meaning requires.

## Approach: EXEMPLAR-FIRST
Rebuild ONE subtab fully to spec, self-verify in the browser (Playwright over http://127.0.0.1:8747), get Marc's
sign-off on the bar, THEN propagate. Financial & Market is the shipped exemplar.

## Visual QA loop (NOW WORKING — use it every time)
- Serve: `python -m http.server 8747` in `_platform_build` (bg id may change). file:// is blocked; must use http.
- Drive: `mcp__plugin_playwright_playwright__browser_navigate` to the http URL, `browser_evaluate` to click tabs
  (buttons carry text; click by textContent), `browser_take_screenshot` (viewport only — fullPage TIMES OUT on this
  3MB doc; scroll + shoot in 2-3 slices). Screenshots: pass an absolute path; MCP cwd = C:\Users\marcs so it lands in
  the scratchpad. Read the jpeg back to actually LOOK. Never ship a page unlooked-at again.

---

## STATUS BY TAB (current panels -> spec gap -> ADD / CUT-FIX)

### DD1. Supplier Summary  [current: Recommendation · Assessment across eight dimensions · Requirements fit · Opportunities & concerns · Evidence coverage]
Main Q: should Lilly advance this supplier, and why? Must read like a TOP SHEET.
- ADD: fuller **Recommendation** rationale (what it is · why it ranks here · conditions to clear · what would change the
  call) — currently ~2 sentences, too thin for the one summary page.
- CUT/RESHAPE: the full-width **"Assessment across eight dimensions"** bars (Marc: eats horizontal space without
  earning it). Replace with a **compact confidence-encoded scorecard** (dimension · rating · one-line read · confidence
  fill: solid=verified / striped=partial / outline=insufficient). Do NOT average into one composite. Free the freed
  column for strengths/concerns/gates.
- KEEP: Requirements fit (confirm it's the 6 GROUPS, not 36 rows; add a "validate" state + evidence-confidence),
  Opportunities & concerns (<=3 each — good), Evidence coverage bar (good).

### DD2. Company & Ownership  [current: Identity Verification · Ownership & Control · Firmographics · Operating Footprint]
Main Q: who is it, who controls it, where are the operations that matter?
- FIX (dominant): **Ownership & Control tree** must scale — collapsible nodes, connector lines, horizontal scroll, and
  status markers per node (public/private · sanctions match · ownership unresolved · Lilly vendor-master match ·
  contracting-entity confirmed · beneficial-owner confirmed). Currently a fixed stack that "barely fits."
- CUT -> ADD: **Operating Footprint** region-cards (US/EU/APAC boxes) -> a real **geographic map** with plotted dots at
  the actual locations + hovers, and **different marker types** by role (HQ / data centre / mfg / service-delivery /
  support / critical subcontractor). Plot only decision-relevant locations, not every office.
- KEEP: Identity Verification matrix (has public/private, ultimate parent, beneficial ownership, sanctions, vendor-
  master, contracting-entity — matches spec). Firmographics OK; optional reshape to a compact company-scale strip
  (founded / employees / revenue range / countries / facilities / public-private).

### DD3. Capabilities & Operations  [current: Capability Read · Capability to Requirement · Reference Relevance · Fit to Requirements · Offering & Delivery]
Main Q: can this supplier deliver the required scope at the required scale?
- KEEP (dominant): **Capability to Requirement** heatmap — ensure status taxonomy (confirmed / partially-confirmed /
  supplier-asserted / not-demonstrated / gap / N-A) + evidence-confidence channel; cell opens the evidence.
- KEEP: Reference Relevance matrix (pharma / similar-scale / similar-use-case / independently-verified per reference).
- ADD: **Delivery-readiness** staged visual (product maturity · implementation model · Lilly-architecture fit ·
  capacity · support model, each Complete / Demonstrated / Partially-validated / Proxy / Confirmation-needed).
- ADD: **Dependency diagram** (Lilly -> supplier -> cloud infra / implementation partner / critical component /
  support subcontractor), tagged criticality/geography/substitutability/confidence; **gap-state** honestly if no
  sub-tier data ("Critical dependencies not yet disclosed").
- CUT/MERGE: redundancy among **Capability Read** (narrative), **Fit to Requirements**, **Offering & Delivery** — "Fit
  to Requirements" overlaps the heatmap; fold to <=1 supporting narrative + the heatmap.

### DD4. Financial & Market  — DONE (shipped exemplar)  [Financial Health · Financial Health Bridge · Peer Position · Commercial Model]
Matches spec: trend (5 real periods) + metric rail (dominant) · health bridge (growth/profitability/cash/leverage,
gap-stated) · ONE peer scatter + read · commercial-model drivers · collapsible comparative-financials that names what
is NOT in the snapshot (balance sheet, ratios, PAYDEX, default probability). Remaining POLISH (do in propagation):
- Peer-scatter dots are navy (#0F3A85) -> palette plum/teal; scatter labels collide top-right (Snowflake/Databricks/
  Google/Amazon overlap) — de-collide.
- Peer Position right column leaves whitespace under the 3-bullet read -> add a small **peer comps mini-table**
  (supplier · capability fit · financial-risk) to fill it and add value.
- "Cash generation" evidence truncated at "$1" — regex `[^.;]*` breaks on the decimal in "$1.12B"; fix to capture the
  whole figure.
- Commercial Model bars still red/navy/amber (pvDD2VarColor #A23A30/#0F3A85/#8A5A00) -> teal(low)/amber(moderate)/
  emph(high) ramp.

### DD5. Risk & Resilience  [current: Impact × Likelihood · Risk Read · Risk Posture by Dimension · Material Events]
Main Q: what could prevent performance, and how should Lilly respond?
- KEEP (dominant): **Impact × Likelihood** matrix — add per-risk encoding of confidence / mitigation-status / owner
  (incomplete-data risk must look different from verified), beyond the current gate-ring + impact colour.
- FIX: **Risk Read** is a thin 3-line narrative in a big box (whitespace). Replace/augment with a **Top material risks
  ranked register** (risk · severity · confidence · relevance · mitigation) so the row earns its width.
- KEEP: Risk Posture by Dimension accordion (good). Material Events typed/filterable timeline (good; confirm event
  directness tags service/division/parent + resolution + source-confidence).
- ADD: **Resilience dependency map** (critical Lilly service -> supplier -> regions / cloud / subcontractor; mark
  single-point-of-failure / alternate-available / RTO-known / geo-concentration / unverified). Gap-state if no data.
- DECISION (Marc): the spec wants a **Risk mitigation board** here (risk · treatment · status · gate). In R2 I dropped
  it, deferring to the Lilly Action Board. Reconcile: (a) restore mitigation board on Risk, or (b) keep only Action
  Board on Lilly Fit. NEEDS MARC.

### DD6. Lilly Fit & Diligence  [current: Lilly-Specific Fit · Diligence Funnel · Action Board]
Main Q: how well does the supplier fit Lilly, and what must happen before selection?
- KEEP: Lilly-fit matrix (consideration · fit · confidence), Diligence funnel (%), Action board (grouped by owner ·
  gate · status). All match spec.
- ADD: **Internal relationship** panel (existing contracts / spend / owners / prior sourcing -> a relationship
  timeline). Gap-state honestly: "No Lilly contractual or performance history found" when internal data is absent.

---

### TOP1. Overview  — Marc LIKES IT; light touch only  [current: Executive Summary · Evaluation Summary · Segmentation & Differentiators]
- FIX: supplier counts (mixes ranked vs screened) -> reviewed 9 · passed screen 7 · screened out 2 · recommended 4.
- FIX: score standardization — one visible fit scale (89, not 89.37 vs 90), risk semantic + one decimal (Low-moderate ·
  1.6), composite whole, category one decimal. Kill "score theatre".
- CUT: evaluation prose that merely restates the ranking table immediately below it.
- Disposition labels consistent (Advance / Advance-with-conditions / Hold-as-alternate / Do-not-advance / Screened-out),
  separate from quadrant position labels.
- H2H teaser already removed and H2H is its own tab (done). Keep structure otherwise.

### TOP2. Requirements Heatmap  — Marc earlier said "leave alone"; spec says refine -> FLAG (optional, Marc's call)  [current: single Requirements Heatmap; svg 16 table 4]
- Precision 4.51 -> 4.5 + semantic (Strong / Meets / Partial / Gap / Unknown).
- Add evidence-confidence channel per cell (solid=verified / hatched=asserted / outline=proxy / gray-?=unknown /
  red-outline=must-have gap).
- Rename "coverage 100% (5/5 >=3.5)" -> "Requirements meeting threshold" (it is NOT evidence coverage).
- Replace category-leadership prose with a compact leadership strip.
- Decision-leverage = importance x differentiation x confidence (not just score spread).
- Cell/row click -> evidence panel (requirement · status · score · evidence · source · confidence · Lilly relevance ·
  validation question · last-verified), not paragraphs.

### TOP3. Head-to-Head  [current: Competitive Dynamics & Head-to-Head · Risk Difference · Evidence Confidence · Commercial Model]
- FIX (Marc, pending from last session): **fold Risk Difference / Evidence Confidence / Commercial Model INTO the
  Competitive Dynamics panel** in its own style — they are currently 3 separate stacked cards below it.
- ADD to the comparison summary strip: requirements met · partial · must-have gaps · evidence-confidence (currently
  composite/fit/risk only).
- KEEP: selectors, category delta bars (good). ADD: explicit validation-action chips at the decision conclusion.
- Optional: a requirements **differences-only** heatmap with a show-all toggle.

### TOP4. Risk Assessment  — MAJOR (partly done in R2)  [current: Portfolio summary · Risk by dimension · Selected supplier]
- KEEP: Portfolio summary + cross-supplier Risk-by-dimension heatmap (semantic cells from R2). ADD the specific
  portfolio metrics (suppliers with critical / high / unresolved-gates · most-common exposure · least-assessed
  dimension · highest-confidence dimension) and a SEPARATE confidence marker channel on the heatmap.
- FIX: **Selected-supplier** panel is a long event text-wall (Marc). Convert to (a) **Top material risks table**
  (risk · severity · confidence · relevance · mitigation) + risk disposition, and (b) a **filtered event timeline**
  (direct / operational / cyber / regulatory / financial / parent-context / resolved) — not prose.
- FIX: false precision (1.04 / 0.94 -> semantic Low/Moderate/High/Critical/Unknown); hard gates + critical single risk
  OVERRIDE the average (stop 6/7 reading "Contained").
- ADD: risk **taxonomy classification** (supplier-inherent / solution-design / commercial / diligence-unknown /
  Lilly-specific) — each implies a different response.
- FIX: **event directness** classification (directly-affects-service / affects-division / parent-context / indirect);
  public-visibility caveat ("no material event found" != "verified low risk"); move **ESG** out of the scored grid
  into an assessment-coverage note ("not assessed for 7/7").
- ADD/RECONCILE: risk mitigation board (see DD5 decision).

---

## CROSS-CUTTING (site-wide, applies to all tabs)
- **One scoring system**: fit on a single visible scale; risk = semantic level + confidence (drop raw decimals as the
  headline); evidence = verified / partial / supplier-asserted / proxy / missing; recommendation = the 5 dispositions.
- **Consistent evidence layer** on every material conclusion: source type · date · confidence · availability.
- **Data-driven viz selection** everywhere (trend/map/tree/network/matrix/heatmap/table only when the data supports it;
  otherwise a gap/required-information card).
- Palette plum/teal + burnt-orange; every panel earns its width; one card = one idea.

## D&B / Bloomberg research = the SOURCE for "what belongs on a profile"
288-field deduplicated dictionary + 33 visualization types (Marc's research, pasted 2026-07-23). Not everything is
included; pull the decision-relevant items we can ground. Highlights we do NOT yet surface but could (schema-ready,
gap-stated): corporate-family & UBO tree with markers (have partial), operating-footprint geo map, dependency/
supply-chain network, comparative financial-statement table, industry-ratio benchmarking, sanctions/watchlist +
ownership-exposure, ESG scorecard (coverage-only until data), trade-payment / default-risk (D&B — absent, gap-state).

## PROGRESS LOG
- 2026-07-23  Visual QA loop established (Playwright over http). Financial & Market rebuilt to spec as the exemplar
  (dominant Financial Health trend+metrics · bridge · single peer scatter+read · commercial model · gap-stated detail);
  redundant second quadrant removed; self-verified in browser. Polish items logged under DD4. Gap review written.
