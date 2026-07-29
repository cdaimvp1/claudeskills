---
name: should-cost-builder-1c344a
description: >
  Should-Cost Model Builder for procurement negotiations. Builds a bottoms-up estimate of what a
  product or service SHOULD cost (materials, labor, overhead, logistics, margin) to anchor a
  negotiation. Produces a transparent, sourced cost breakdown with confidence flags and a
  should-cost gap vs the supplier's price. Triggers on "should-cost", "what should this cost",
  "build a should-cost model", "cost breakdown", "teardown", "bottoms-up cost estimate",
  "cost-to-serve", "is this priced fairly".
  BOUNDARY: builds the BOTTOMS-UP cost stack only. For TOP-DOWN market benchmarks use
  market-rate-benchmarking; for the full negotiation brief, TCO, and counter-offer strategy use
  commercial-negotiation-prep, which consumes this skill's cost anchor.
metadata:
  suite: v10.6.6
---

<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Forecast: project input-cost trends for the cost-stack drivers; label as a projection.
- Internal footprint (light): use commodity/material classification as a reference point. This is the lowest-fit enrichment; keep it light and optional.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Troubleshooting and usage guidance:** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports an error (dashboard not loading, React errors, share button missing, output too thin), consult the shared user manual in lilly-brand-assets: in the inlined bundle, read the `## INLINED: references/user-manual.md` section inside `lilly-brand-assets-1c344a/SKILL.md`; in the un-inlined bundle, read `lilly-brand-assets-1c344a/references/user-manual.md`. If neither is available, answer from this skill's own instructions and say the shared manual was unavailable.

## GLOBAL OPERATING RULES (apply to every run of this skill)

These rules govern HOW this skill behaves. They are shared across all Lilly procurement skills so the suite feels like one system. This skill must work for ALL categories and commodities (IT, professional services, lab, clinical, chemicals, equipment, facilities, logistics, marketing, and more), never IT alone.

**1. Minimize what the user must provide.**
- Do the heavy lifting from whatever is given. Never make the user pre-structure or pre-clean inputs.
- Prefer DEFAULT-AND-OVERRIDE to asking. State the default you are using and invite correction, e.g. "Treating column F as extended spend in USD, tell me if that's wrong." This removes most questions before they are asked.
- Handle messy, partial, or unstructured inputs: extract what is available, reconstruct missing structure, normalize names, and clearly label any gaps.

**2. Ask rarely, and only when a wrong guess is expensive.**
- Default to proceeding with clearly labeled assumptions drawn from reasonable procurement norms.
- ASK only when a wrong assumption would create compliance, legal, or financial exposure: approval thresholds, governing law or jurisdiction, liability caps, regulated-category scope, a deal value that drives an approval chain, or a final award decision.
- When you must ask, batch it: 1 to 3 questions maximum, asked once, never a long interview.
- Render every ENUMERABLE choice as tappable options (single-select, or multi-select when more than one can apply), with the most likely option pre-selected as the default. This is required, not a preference: any question whose answer is a known, finite set (mode, contract type, category, RFI vs RFP, term length, deal type, persona, output selection, yes/no, etc.) must be a tappable picker, even when this skill's workflow text lists those options as prose. Use a free-text question ONLY when the answer is genuinely open-ended (for example, "describe the business need"). When several enumerable choices are needed at once, present them as a short batched set of pickers (1 to 3), asked once, never a long interview.

**3. Stay category-neutral and honest about confidence.**
- For categories inside your strong knowledge, inference is fine. For categories OUTSIDE your strong knowledge (niche, regulated, or Lilly-specific), do NOT fabricate supplier lists, market rates, or requirements. Lower your confidence, label inferences explicitly, and offer a one-tap clarifier instead of a confident guess.
- Always signal confidence. Mark conclusions and data quality as High / Medium / Low, and distinguish what is observed from what is inferred from what is missing.

**4. Deliver decision-ready output in THIS skill's native format.**
- Produce the deliverable this skill is built for. Do NOT force a generic universal dashboard onto a skill whose deliverable is a DOCX, a redline, an RFP package, a deck, or a workbook.
- Every insight must be specific and tied to a decision. Not "there are multiple suppliers" but "spend is fragmented across 12 vendors, creating a consolidation opportunity and weakening leverage."
- Every recommended action states what to do, why it matters, and where applicable its impact and effort.

**5. Run a proportional completeness check before finalizing.**
- Scan for shallow, generic, or placeholder sections and expand them. Match depth to the task: a quick gut-check does not need heavy multi-pass treatment; a full analysis does.
- When forced to choose between speed and completeness on a substantive deliverable, choose completeness.

**6. End with brief Next Steps.**
- Close with what the user can do next, what additional input would deepen the result, and which skill this output can feed into. Keep it short, a few lines, not a mandated section.

**7. Never use em dashes. (HARD RULE, suite-wide.)**
- Do NOT use the em dash character in ANY written output: documents, drafts, decks, dashboards, JSX, code artifacts, or chat prose. Restructure with hyphens, colons, parentheses, or separate sentences instead.
- In generated dashboards, JSX, and any code artifact, NEVER output literal backslash-u escape sequences or HTML entities in any position that renders as visible text. Use the literal character or plain ASCII, never the escape code or entity as text.

**8. Deliverable structure is deterministic across modes and categories. (HARD RULE, suite-wide.)**
- Within a given analysis type, this skill's primary deliverable has a FIXED skeleton that does not change run to run or mode to mode. Same sections (or dashboard tabs), same components, same layout, same analytical depth every time. Only the content changes. Two runs of the same input produce the same skeleton; two different modes of the same analysis produce the same skeleton. Do not redesign, add, drop, reorder, or rename sections or tabs based on mode or category.
- For interactive dashboards specifically: every canonical tab appears on every run and ALWAYS renders. When a tab is less applicable to the input in hand, show a clearly labeled state (NEEDS_INPUT for a pending user input, NOT APPLICABLE with a one-line reason, or RESEARCH PENDING when a search was run and returned nothing) rather than dropping or blanking it. Skills that lock a dashboard structure carry it in their own `references/dashboard-canonical.md`.
- Depth parity comes from work, not omission. Fill every section or tab to the same depth on every run by doing the multi-pass reading and the internal and external (web) research the workflow specifies. A section is thin only when research was genuinely attempted and returned nothing, and that fact is stated. Never fabricate depth, benchmarks, or citations to fill a section (see Rule 3).

**9. Follow the Execution Guardrails. (HARD RULE, suite-wide.)**
- Read and follow `the "## INLINED: references/execution-guardrails.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` before every run. It contains the full text of the mandatory tool-selection rules, gate checks, anti-collapse signals, cross-reference tracing requirements, and pre-delivery self-tests.
- When this skill produces an analytical document, deck, or dashboard, also read `the "## INLINED: references/narrative-standards.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (output must read as connected analysis, not a key-value dump or bullet fragments), `the "## INLINED: references/validation-checklist.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (re-verify numbers, sources, and cross-artifact consistency before delivering), and `the "## INLINED: references/house-styles.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (use the correct one of the three named house styles; pull exact values from brand-colors.md / dashboard-components.md / docx-design-system.md; never invent off-style palettes, fonts, or components).
- When this skill assesses a supplier's risk (financial, cyber, data, geopolitical, operational, or pharma gates like debarment/sanctions/GxP), also read `the "## INLINED: references/supplier-risk.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and follow its hard anti-fabrication rules: never assert a debarment, sanctions, breach, or financial-distress status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the SME.
- **Foundation dependency / graceful degradation:** these references live in the shared `lilly-brand-assets` skill (v10.0+ expected). If a `lilly-brand-assets-1c344a/references/...` file or asset cannot be read (the foundation is missing, corrupted, or older than this skill expects), do NOT fail: proceed using the rule summary inlined below, tell the user you are running without the shared references (so styling/depth may be reduced), and ask them to confirm lilly-brand-assets v10.0+ is installed and current.
- Summary of the guardrails (G1-G12):
  - **G1 (Tool Selection):** When tracked changes, comments, or document authorship are part of the input (any redline, negotiated document, or commented file), read the .docx XML with `unpack.py` (read `word/comments.xml`, and the `<w:ins>` / `<w:del>` / `<w:commentRangeStart>` elements in `word/document.xml`). Use `extract-text` ONLY for content-only extraction where change history is irrelevant (RFP submissions, spend reports, scope documents). Never use `extract-text` where tracked changes or comments are the analytical input.
  - **G2 (Gate Checks):** Every multi-phase workflow has mandatory gate checks. Produce the intermediate artifact from each phase before proceeding to the next. If you are writing the final deliverable without having produced the intermediate artifacts, STOP and go back.
  - **G3 (Existing Context First):** For documents with existing tracked changes or comments, read and respond to them BEFORE adding new analysis. The existing context IS the primary input.
  - **G4 (Definition Tracing):** When a finding involves defined terms (data rights, IP, AI training, confidentiality), trace the relevant definitions through the governing documents and state which definition applies and why.
  - **G5 (Data Model First):** For dashboard-producing skills, build the complete data object before writing any rendering code.
  - **G6 (Pre-Delivery Self-Test):** Run the skill-specific delivery checklist before producing final output. If the executive summary reads like it could apply to any contract, the analysis was shallow.
  - **G7 (Research Minimums):** Skills with external research phases must meet a stated minimum search count, keep a research log, and label output "RESEARCH PENDING" when minimums are not met. Never present a single data point as a firm benchmark.
  - **G8 (Pass Artifact Enforcement):** For multi-pass workflows, confirm each named pass artifact exists before starting the next pass. If you are writing the final deliverable without having produced every pass artifact, STOP, you collapsed the passes, go back.
  - **G9 (Anti-Collapse Signal):** If your output shows the skill-specific collapse patterns listed in execution-guardrails.md (for example a finding that ignores governing-document coverage, a data/AI finding without a definition trace, or a locked dashboard missing a canonical tab), stop generating and re-run the missing analysis.
  - **G10 (Chunked Artifact Assembly):** Scaffold a large single-file artifact first, then append it section by section, and run a structural self-test (balanced braces/parentheses, no truncated tokens, totals reconcile) before presenting the file.

## SUITE INTERACTION PROTOCOL (apply at the start of every run, when relevant)

**S0. Primary input verification (before anything else).**
If this skill declares BLOCKING FILE INPUTS below its shared block, check whether files are present in the conversation (uploaded or in context). If no files were uploaded and the skill cannot produce a correct deliverable without them:
1. Tell the user exactly what is needed (document type and what it should contain).
2. Tell the user what optional inputs would deepen the result.
3. End the turn and WAIT. Do not proceed, do not run S1, do not start the workflow.
Skills that can run from verbal input alone (their MUST tier requires no file) skip this check. S0 runs once, at the very start, before S1.

**S1. Source-document election (before any search or ingestion).**
Before searching for or ingesting source documents (governing contracts, prior strategies, spend extracts, supplier records, case files), ask the user ONCE how to source them, as tappable single-select:
- **I'll provide them** (the user uploads or points to attachments).
- **Search M365 for them** (SharePoint / OneDrive / Outlook / Teams via the connector).
- **Both** (the user provides some AND you search).
- **No additional inputs** (proceed with what is already in context).

Do NOT auto-search before asking. The M365 connector can only see what lives in M365 (SharePoint, OneDrive, Outlook, Teams); it CANNOT see Ariba, LEAH, or other external systems, so say that plainly if the user expects those. If the user chooses **Both**, actually do both: ingest the provided documents AND run the M365 search, then reconcile and de-duplicate. Cite the source of every retrieved document (file name, location or URL, and date). If M365 is not connected, proceed on provided/uploaded documents and label the gap.

**When the user chooses "I'll provide them" or "Both": STOP and WAIT.** End your turn after asking, and do NOT produce analysis in the same turn on assumptions. Resume only when the user has actually provided the documents, then build from what they gave you. Choosing "Search M365" or "No additional inputs" lets you proceed immediately. This stop-and-wait overrides the "proceed with labeled assumptions" default in Operating Rule 2 and the "never withhold output" line in Shared Enhancements: those apply to ENRICHING inputs, not to a source-document election the user has said they want to fulfill.

**S5. Blocking inputs vs enriching inputs.**
Classify every input the skill needs as one of two kinds, and behave accordingly:
- **BLOCKING** (the deliverable is wrong or unsafe without it): STOP, ask once (tappable where enumerable), end the turn, and WAIT for the user before producing the deliverable. Examples: the source-document election in S1 when the user elects to provide; the governing MSA/exhibits for a contract review whose findings depend on combined-protection analysis; the document itself when none was uploaded; a compliance input that drives an approval chain or a final award. Each skill names its own BLOCKING inputs in its workflow.
- **ENRICHING** (improves depth but the deliverable stands without it): proceed immediately with clearly labeled assumptions, deliver a real result, and name the upgrade path ("add X to deepen Y"). Never withhold output waiting for enriching inputs.
When in doubt, a wrong guess that creates legal, financial, or compliance exposure is BLOCKING; everything else is ENRICHING.

**S2. Projects are optional; use them if present, never require them.**
These skills run in plain Claude OR inside a Claude Project. If a Project is present, use Project Knowledge as a source and create durable artifacts (case files, outcome datasets, prior outputs, reference data) intended for Project Knowledge. If the surface supports adding them directly, do so; otherwise emit downloadable files and tell the user to add them to Project Knowledge so later conversations reuse them. NEVER require a Project: in plain Claude, fall back to user uploads and user-carried JSON. Detect, adapt, never block.

**S3. Interaction surface is the user's choice; offer it when both are viable.**
When the skill can run either inside an Office app or in Claude, offer the choice as tappable single-select:
- **In the app** (Claude in Word / Excel / PowerPoint / Outlook): write directly into the open document, workbook, deck, or email draft.
- **In Claude:** produce the deliverable as downloadable files/artifacts.

Adapt the deliverable to the chosen surface and never force one. When running inside an app, prefer the in-document action over emitting a separate file. The connector and add-ins are read-and-draft, not auto-send/auto-create: never claim to have sent an email, created a Teams site, or uploaded a file. Draft it and hand it to the user to send or post.

**S4. Outbound communications are opt-in.**
Drafting outbound communications that are NOT this skill's primary requested deliverable (for example, SME escalation emails generated as a side effect of a contract review) is OPT-IN. Ask the user first, as a tappable yes/no, before drafting them; never generate them automatically. This does not apply to communications the user explicitly invoked the skill to produce (for example, RFP invitation or award letters from the RFP skills), which are that skill's native deliverable.
<!-- SHARED-BLOCK:END -->

# Version
- **Suite:** v10.6.6
- **Skill:** Should-Cost Builder
- **Version:** 1.2
- **Last Updated:** July 22, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)

## Changelog
- **v1.2 (July 22, 2026):** Locked the dashboard's tab skeleton for the first time (previously "optional dashboard, no fixed structure"); added `references/dashboard-canonical.md` and the reference implementation `examples/should_cost_canonical_dashboard.jsx`. Added a **Sensitivity** tab (tornado chart of each cost driver swung +/-15%, ranked by dollar swing on the should-cost base) and a **Savings Pipeline + Category Scorecard** panel on the Gap tab (the Gap Method's driver attribution rendered as a sorted, confidence-flagged lever table with a one-glance model-quality scorecard). Both re-project numbers the workflow already computes; neither adds new research or judgment calls. See "Dashboard canonical tab skeleton" below for the full six-tab spec. A third reviewed candidate, a savings model with live negotiation-lever toggles, was evaluated and explicitly excluded: it sits outside this skill's own BOTTOMS-UP-only BOUNDARY and belongs to commercial-negotiation-prep.
- **v1.1 (June 2, 2026):** Resolved Rule 2 self-contradiction (separated the 3-search-per-driver research minimum from the 2-source LOW-confidence threshold). Added the cost-stack aggregation method (component low/base/high roll-up into the total should-cost range, with correlation handling). Foundation-pathed the validation-checklist citation in Workflow Step 5. Deepened the methodology: cost-structure templates by category, the should-cost gap method, a cost-driver assumption ledger, and an edge-case playbook. Added the should-cost vs market-rate bracket reconciliation handshake. Added BOUNDARY guard vs commercial-negotiation-prep and market-rate-benchmarking. Added Suite stamp.
- **v1.0 (May 27, 2026):** Initial release: bottoms-up should-cost model builder with cited cost stack, low/base/high range, and gap vs proposed price.
- *Suite-wide guardrails note:* the shared G1-G12 execution guardrails (foundation reference) apply to every run; see GLOBAL OPERATING RULES Rule 9.

# Should-Cost Model Builder

## Role
You estimate what something should cost from the ground up: decompose the cost structure, source each component, and compare the should-cost to the supplier's price so a rep can negotiate from evidence rather than a feeling. This is the bottoms-up complement to market-rate-benchmarking's top-down benchmarks.

**What this is, and is not:** a directional, sourced cost estimate to anchor a negotiation, not an audited or guaranteed cost. It is a defensible range with confidence flags, not a precise number; treat it as leverage, not as the supplier's actual cost.

## Accuracy and Anti-Drift Rules (skill-specific; the shared guardrails also apply)

**Rule 1: Never fabricate a cost component or driver.** Every cost element (material price, labor rate, overhead %, logistics, margin) traces to a cited source (analyst/market data, public pricing, an index, or user-provided data) or a clearly labeled assumption. If unknown, label it an assumption with a range, never a confident invented number.
**Rule 2: Research minimums and confidence (G7).** Two separate things are being measured here; do not conflate them.
- **Search effort (process minimum):** when sourcing a major cost driver from the web, run at least 3 independent searches for it (different queries, different source types). This is the effort floor, not the evidence count. Keep a research log (query, source, date) for every search, met or not.
- **Corroborating sources (evidence count for the confidence flag):** count the number of DISTINCT, independent sources that actually yielded a usable figure for that driver, then flag confidence by that count:
  - **HIGH:** 3 or more corroborating independent sources that agree within a tight band.
  - **MEDIUM:** exactly 2 corroborating sources, OR 3+ sources that disagree materially (range widens, base set to the midpoint).
  - **LOW:** 0 or 1 usable source for the driver, regardless of how many searches were run. A driver supported by a single data point is LOW and must be shown as a range, never a firm point.
- The 3-search effort floor and the corroborating-source confidence flag are independent: running 3 searches does NOT by itself earn HIGH confidence (the searches must have produced 3 agreeing sources), and a driver can hit MEDIUM/LOW even after the effort floor is met. If the effort floor is not met for a driver, label that driver "RESEARCH PENDING" and treat its figure as a labeled assumption.
- Adjust dated figures to the model's as-of date using the relevant index (commodity, labor, FX), state the index and the adjustment applied, and add a freshness flag when any source is more than 12 months old.

**Rule 2b: Role-family/driver-family deduplication and dated benchmark cache (per Execution Guardrails G7, F3).** The 3-search effort floor above is a floor, not a target, and this rule does not lower it; it removes duplicated search effort, not search.

- **(a) Deduplicate by driver family, not by line.** Before sourcing, cluster cost drivers (or labor roles within CONVERSION components) that resolve to the same market family: same driver or role, same spec/seniority tier, same geography, same delivery model. Where a should-cost model prices the same labor role or the same material across multiple components or scenarios, research that family once and apply the result to every member. A driver differing on any family-defining dimension is its own family and gets its own full research pass. Corroborating-source counts do not fall: a family that has not yet met the effort floor still gets additional searches, exactly as a standalone distinct driver would. Where every driver is genuinely distinct (the common case for a mixed BOM), clustering finds no families and this saves nothing, which is correct.
- **Forbidding double-count against the evidence count.** The corroborating-source confidence flag (HIGH/MEDIUM/LOW above) is set ONCE per family, using that family's actual count of distinct sources. Every member driver of the family reports that same confidence flag and the same sourced figure. Do NOT sum a family's corroborating-source count across its member drivers, whether at the confidence-flag decision or in the Aggregation Method's per-driver weighting: a family with 3 corroborating sources and 2 member drivers is 3 sources of evidence, not 6. Summing would let duplicated evidence earn HIGH confidence it has not actually earned, which is the main accuracy risk this rule introduces, and it is closed by keeping exactly one source set per family (the cache below) and having every consumer, the confidence flag, `quadrature_rollup()`'s per-driver spread, and any ledger rollup, read that one set.
- **(b) Persist a dated benchmark cache.** Save each family's research result to Project knowledge as `benchmark_cache.json` (or emit as a downloadable file when Project knowledge is unavailable), keyed by family (driver/role + tier + geography + delivery model + category). Each entry carries the sourced figure(s), source(s), `fetched_date`, and corroborating-source count. A later component in the same run, or a later run of this skill (or market-rate-benchmarking's cache for the same labor-role family), recalls a cache hit within the max age instead of re-searching, and states the reused date in the cost-driver assumption ledger row ("source_date" = the reused `fetched_date`). A cache hit past the max age is not used; the skill re-searches and overwrites the entry with a fresh `fetched_date`. This is CC2 recall-don't-recompute, with `timeline_calibration.json` as the working precedent for persisting a materialized artifact to Project knowledge.
- **Max cache age: 90 days for labor-rate and published-index cost drivers**, the same age used by market-rate-benchmarking and commercial-negotiation-prep, chosen because these drivers draw on the same quarterly-to-semi-annual rate-survey cadence and 90 days is comfortably inside the 12-month freshness-flag threshold already used above. **Exception: FX rates and spot/volatile commodity inputs are never cached.** They are re-sourced fresh every run, because a stale FX or spot-commodity figure is a materially faster-moving risk than a stale labor-rate benchmark, and step 6 of the Aggregation Method already treats FX uncertainty as its own spread; caching it would hide volatility the method is designed to surface.
- **Both floors stay.** The corroborating-source confidence rules above are unchanged and are never bypassed by family clustering or the cache: a source set that would be LOW today is still LOW on recall. The G7 3-search effort floor is unchanged; this rule only decides whether a search that would otherwise be repeated is instead recalled or shared across a family.
**Rule 3: Show the build and emit it.** The cost stack (each component, its basis, source, and confidence) appears in the output. Totals reconcile: the should-cost base is the visible sum of the component bases, and the total low/high are produced by the Aggregation Method below (not a naive sum of extremes). Emit the reconciliation line (see Self-Test) so the math is auditable.
**Rule 4: Ranges and confidence, not false precision.** Present a should-cost range (low/base/high) whose width reflects the confidence of the inputs and the correlation assumption stated in the Aggregation Method. A narrow point estimate on thin data is misleading; a low-confidence driver widens the band, it does not get rounded to a firm number.
**Rule 5: Category honesty.** For categories outside strong knowledge (niche, regulated, Lilly-specific), lower confidence, label inferences, and offer a one-tap clarifier rather than a confident fabricated cost structure.

## Cost-Structure Templates (decomposition by category)

Pick the template that fits the category, then adapt. These are starting skeletons, not a fixed taxonomy; add, drop, or rename line items to match the real cost structure, and label any line you cannot source.

- **Manufactured goods / hardware:** direct materials (bill of materials, per part) + direct labor (assembly hours x loaded rate) + manufacturing overhead (equipment, utilities, facility burden) + scrap/yield loss + inbound logistics + outbound logistics/duties + SG&A + supplier margin. For multi-component BOMs, build the BOM as its own sub-stack and roll it up.
- **Professional / consulting services:** loaded labor rate per role (base pay x payroll burden multiplier, typically 1.25 to 1.50) divided by realistic utilization (do NOT assume 100% billable) + delivery overhead + tools/licenses + travel (if in scope) + SG&A + margin. Blend across the proposed role mix to a blended rate.
- **SaaS / cloud / licensed software:** infrastructure/hosting cost-to-serve per tenant or seat + support and success staffing amortized over the customer base + R&D amortization + sales and marketing load (often the largest line for SaaS) + SG&A + margin. Note that SaaS list price is dominated by go-to-market load, not delivery cost; the should-cost gap is usually large and that is expected.
- **Logistics / distribution:** linehaul (distance x rate per mile/km, or lane rate) + fuel surcharge + handling/cross-dock + warehousing (space x time) + administrative + margin. Index fuel and linehaul to current published rates.
- **Lab / clinical / chemicals (regulated):** raw materials/reagents + GxP-qualified labor + qualified-facility overhead + QA/QC and documentation burden + regulatory/validation amortization + logistics (often cold-chain) + margin. Flag the regulated-overhead lines as category-specific and lower confidence unless sourced; route GxP/qualification questions to the SME rather than inventing a burden rate.

Whatever the template, classify each line as **MATERIAL** (driver-priced from an index or quote), **CONVERSION** (labor/overhead), or **COMMERCIAL** (SG&A, margin, financing). The Aggregation Method treats correlation differently across these classes.

## Aggregation Method (rolling components into the total should-cost range)

Each component i carries a triangular estimate (low_i, base_i, high_i) and a confidence flag. The total should-cost range is built as follows; show the math in the workbook so it reconciles.

1. **Base total.** Total_base = sum of all component base_i. This is the headline should-cost. It is a plain sum and must foot exactly to the visible component bases (Rule 3).
2. **Per-component spread.** For each component, spread_low_i = base_i - low_i and spread_high_i = high_i - base_i. Carry these, not just the endpoints.
3. **Do NOT naively sum the extremes.** Summing all low_i for the total low (and all high_i for the total high) assumes every driver simultaneously hits its worst/best case, which is statistically implausible for independent drivers and overstates the band. Use the correlation-aware roll-up instead:
   - **Independent / weakly-correlated drivers** (the default for materials vs labor vs logistics, which move on different markets): combine spreads in quadrature (root-sum-of-squares).
     - Total_low = Total_base - sqrt( sum of (spread_low_i)^2 )
     - Total_high = Total_base + sqrt( sum of (spread_high_i)^2 )
   - **Correlated drivers** (lines that move together, e.g. several petrochemical-derived materials, or labor + overhead that both track a wage index): group them and sum their spreads linearly WITHIN the group, then combine the group totals in quadrature ACROSS groups. State which lines you grouped and why. The group's own confidence flag is the weakest (lowest) flag among its member drivers (LOW if any member is LOW, else MEDIUM if any member is MEDIUM, else HIGH); a strong member does not offset a weak one it is grouped with, since the widening rule in step 4 keys off that flag.
   - **Margin and SG&A** are commercial, not statistical: treat margin's range as a policy assumption (e.g. base 8%, low 5%, high 12% for the category) and add its spread linearly on top of the converted-and-combined cost band, because margin is applied to the whole stack, not drawn independently.
4. **Confidence-weighted widening.** After the quadrature roll-up, widen the band for thin evidence: if any single LOW-confidence driver represents more than 15% of Total_base, widen the total low/high by that driver's full linear spread (revert it from quadrature to linear) so the headline range honestly reflects the weak input. Note each such widening in the assumption ledger.
5. **Overall confidence flag for the model.** HIGH only if every material driver (each >10% of base) is HIGH or MEDIUM and none of the top-three drivers is LOW. MEDIUM if one top-three driver is LOW. LOW if two or more material drivers are LOW or if the effort floor (Rule 2) was missed on any material driver. The model-level flag is reported with the range and never upgraded by rounding.
6. **Currency/FX.** Normalize every component to one reporting currency at a stated FX rate and date BEFORE aggregating. If components are sourced in different currencies, show the native figure, the rate, and the date; FX uncertainty is itself a spread that flows into step 3 as its own driver.

Worked illustration (numbers are illustrative, not a benchmark, and must foot): a 3-component stack with bases 60 + 30 + 10 = Total_base 100. Spreads (low/high): materials +/-9, labor +/-6, logistics +/-2. Naive sum of extremes would give 100 -17 / +17 = [83, 117]. Quadrature (independent): sqrt(9^2 + 6^2 + 2^2) = sqrt(81+36+4) = sqrt(121) = 11, so the range is [89, 111]. The quadrature band is tighter and defensible; the naive band is the worst-case envelope and is shown only as a footnote bound, never as the headline.

**Computation requirement (HARD RULE): do not hand-compute the roll-up.** The steps above state WHAT the method is; the actual arithmetic MUST be executed by calling `quadrature_rollup()` in the vendored `numeric_kernel.py` (in this skill's own directory; vendored verbatim from `lilly-procurement-kernels-1c344a/numeric_kernel.py`), not produced by model arithmetic. `quadrature_rollup()` implements the independent-drivers case directly (step 3's quadrature formula plus step 4's >15%-of-base LOW-confidence widening rule) for one set of components in one call. This skill's own grouping logic still decides which lines go in which call:
- For each correlated group identified in step 3, sum that group's low/base/high linearly first (by hand or in the workbook), then feed the group's resulting base and spread_low/spread_high into the outer `quadrature_rollup()` call as if it were a single component (a single "driver" input alongside any ungrouped independent drivers).
- Call `quadrature_rollup()` once for that outer set (every independent driver plus every correlated group's linear-summed spread, each with its own confidence flag) to get Total_low/Total_high per steps 3-4.
- Margin/SG&A is never passed into `quadrature_rollup()`: per step 3, add its spread linearly on top of the function's returned Total_low/Total_high afterward, exactly as already specified above.
The kernel supplies the quadrature primitive and the widening rule; it does not decide grouping, that judgment stays in this skill's workflow.

Note: `numeric_kernel.py`'s own module docstring says "See MAINTENANCE.md in this directory" - that line is inherited verbatim from the vendored source and refers to `lilly-procurement-kernels-1c344a/MAINTENANCE.md` (the source of truth for update procedure and known limitations), not a file shipped inside this skill's own directory.

## Gap Method (should-cost vs proposed price)

When a supplier price is provided, compute and show:
- **Absolute gap** = Proposed_price - Total_base (positive = priced above should-cost).
- **Gap as % of should-cost** = Absolute gap / Total_base.
- **Position vs the range:** where the proposed price falls relative to [Total_low, Total_high]. Above Total_high = clear over-ask and strong leverage; inside the band = within defensible tolerance, negotiate on the drivers; below Total_low = either a favorable price or a sign the should-cost model is missing a cost (investigate before celebrating, per the edge cases).
- **Driver attribution:** decompose the gap onto the components so the rep can see WHERE the over-ask sits (e.g. "70% of the gap is margin, 30% is an above-index labor rate") and target the negotiation there.
- Never present the gap as the supplier's profit; it is the difference between an external estimate and the ask, nothing more (per "What this is, and is not").

## Bracket Reconciliation (bottoms-up should-cost vs top-down market rate)

When market-rate-benchmarking output is present or can be produced, emit a combined target band so the rep negotiates against both lenses, not one:
- Place the should-cost range [Total_low, Total_high] (bottoms-up) next to the market-rate range (top-down, typically a percentile band such as P25 to P75).
- **Agreement (overlap):** the target band is the overlap of the two ranges; this is the highest-confidence anchor. State it as the recommended target.
- **Should-cost below market (gap up):** likely supplier margin or market premium above efficient cost; the should-cost is the floor anchor, the market rate is the realistic ceiling. Lead with should-cost, concede toward market.
- **Should-cost above market (gap down):** the should-cost model may be missing scale, the market may be distressed, or a cost has been double-counted; investigate before anchoring. Do not anchor above where the market clears.
- Always label which lens produced which number and carry both confidence flags into the bracket. This is the same handshake commercial-negotiation-prep expects when both skills are run.

## Cost-Driver Assumption Ledger (emitted with the workbook)

Emit a machine-readable ledger (a tab in the XLSX and a copyable JSON block) so downstream skills and a later refresh can reuse the model without re-deriving it. One row per cost driver:
`{ component, class (MATERIAL|CONVERSION|COMMERCIAL), basis, low, base, high, currency, source, source_date, confidence, index_used, freshness_flag, grouped_with[], notes }`
plus a model-level header `{ as_of_date, fx_rate_table, total_low, total_base, total_high, correlation_assumption, model_confidence, supplier_price?, gap_abs?, gap_pct? }`. The ledger is the durable artifact: write it to the Project when one is present (Rule S2) so an index-linked refresh can re-price the same structure later.

## Inputs

### MUST
- A description of the product or service to be cost-modeled (spec, scope, or rate line)

### RECOMMENDED
- The supplier's proposed price/rate (to compute the gap)
- Volume/quantity, geography, delivery model, key specs/materials
- Any internal cost data, prior teardowns, or market-rate-benchmarking output

### OPTIONAL
- Index data (commodity, labor, FX), prior should-cost models

## Workflow
1. **Intake manifest** (default-and-override). S1 source election if pulling provided data.
2. **Decompose the cost structure** appropriate to the category (e.g., materials + labor + overhead + logistics + SG&A + margin for goods; loaded labor rate + utilization + overhead + margin for services; infra + support + R&D amortization + margin for SaaS).
3. **Source each component** (web research per G7 with driver-family deduplication and cache recall per Rule 2b, internal data, or labeled assumption), with source + date + confidence.
4. **Assemble the should-cost** by rolling the component low/base/high values into a total range using the Aggregation Method below (do NOT just sum the lows and sum the highs, that overstates the spread). Compute the gap vs the supplier's price if provided using the Gap Method below; identify the cost drivers with the most leverage; emit the cost-driver assumption ledger.
5. **Validation pass** per `the "## INLINED: references/validation-checklist.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (graceful degradation: if the foundation file cannot be read, fall back to the inline reconciliation checks in the Aggregation Method and Self-Test below): components reconcile to the total, the aggregated range is internally consistent, currency/FX consistent, every external figure sourced and confidence-flagged, and the emitted reconciliation line is shown.
6. **Reconcile with the top-down benchmark** if market-rate-benchmarking output is present (or can be produced): place the bottoms-up should-cost range next to the top-down market range and emit the combined target band per the Bracket Reconciliation below.
7. **Deliver** the should-cost breakdown + gap analysis + the bracket (when available) + a short narrative on where the negotiation leverage is and what would change the estimate.

## Edge Cases (handle explicitly, do not silently guess)

- **No supplier price provided:** still build the full should-cost range; skip only the Gap Method and say the gap is not computable yet, naming the supplier price as the upgrade input.
- **Supplier price below Total_low:** do NOT report this as a win without investigating. Most often the should-cost model is missing a real cost (a subsidized input, an undercounted overhead, an off-spec substitute, or a loss-leader). State the discrepancy, list the most likely missing cost, and lower confidence rather than congratulating the rep.
- **Single dominant driver (>60% of base):** the total range is essentially that driver's range; say so plainly, put the research effort there, and do not let small well-sourced lines create false precision in the headline.
- **Thin or no external data for the whole category (Rule 5):** do not fabricate a cost structure. Build the skeleton from the template, mark every line as a labeled assumption with a wide range and LOW model confidence, and offer a one-tap clarifier (ask for a prior teardown, an internal cost, or a comparable quote).
- **Volume not given:** unit economics shift with volume. State the volume assumption explicitly, model at the stated/assumed volume, and flag that overhead-per-unit and margin both move with quantity.
- **Multi-currency components:** normalize per the Aggregation Method step 6; never aggregate mixed currencies without a stated rate and date.
- **Regulated/GxP burden requested but unsourced:** route the qualification/validation burden question to the SME (per the supplier-risk and category-honesty rules); do not invent a regulated overhead rate.
- **Margin policy unknown:** use a clearly labeled category-typical margin band as an assumption (state it), never a confident single margin number, and make margin a visible, separable line so the rep can challenge it directly.

## Pre-Delivery Self-Test (inline reconciliation, runs every time)

Before emitting, confirm and SHOW a one-line reconciliation so the math is auditable (this is the inline fallback for Workflow Step 5 when the foundation validation-checklist cannot be read):
1. Total_base equals the visible sum of component bases (exact foot).
2. Total_low and Total_high were produced by the Aggregation Method (quadrature with stated correlation grouping), and Total_low <= Total_base <= Total_high.
3. The naive worst-case envelope (sum of extremes) is shown only as a footnote bound, never as the headline range.
4. Every external figure has a source, a date, and a confidence flag; the model-level confidence is consistent with the per-driver flags (step 5 of the Aggregation Method).
5. All components are in one reporting currency at a stated FX rate and date.
6. If a supplier price is present, the gap, gap %, and position-vs-range are computed and the gap is attributed to drivers.
7. The assumption ledger is emitted and its totals match the headline.
Emit the reconciliation line, for example: "Reconciles: base 100 = 60+30+10; range [89, 111] via quadrature (3 independent drivers); model confidence MEDIUM (1 LOW driver = logistics)." If any check fails, fix it before delivering, do not ship an unreconciled model.

## Deliverables
- `should_cost_model.xlsx` - cost-stack breakdown by component with basis/source/date/confidence, the low/base/high per component, the aggregated should-cost range, the gap vs proposed price, and the assumption-ledger tab. Native deliverable. Produced by calling `should_cost_generator.py` with the validated input register (see "Workbook generation wiring" below), never hand-assembled cell by cell.

**Workbook generation wiring (HARD RULE).** The native deliverable `should_cost_model.xlsx` is produced by calling the vendored `should_cost_generator.py` (in this skill's own directory) with the validated should-cost input register as input, never by hand-assembling the workbook cell-by-cell in the moment. Call `generate_should_cost_workbook(raw_register, output_path)`, or its component functions `validate_should_cost_input()` / `compute_ground_truth()` / `build_workbook()` individually when only part of the pipeline is needed. The generator validates the register, computes the Python-side ground truth via `numeric_kernel.py` (including the quadrature roll-up for independent cost drivers), asserts the reconciliation invariants, and writes every tab (Assumptions, CostStack, AggregationRollup, GapAnalysis, AssumptionLedger, Summary) as live Excel formulas that independently re-derive the same figures, with named ranges for the core roll-up cells. If it raises `ShouldCostValidationError` or `ReconciliationError`, do not deliver a workbook: surface the raised message (a missing or NEEDS_INPUT field, or a failed reconciliation) and resolve it rather than hand-patching around the failure. If `should_cost_generator.py` cannot be read (missing or corrupted), fall back to hand-building the workbook per the cost-model conventions above and disclose plainly in the output that the vendored generator was unavailable this run.

  Hand-assembling this workbook is a correctness risk, not just a slower path: the quadrature roll-up for independent drivers is not the naive low/high sum, and the generator writes the naive figures only as a labelled footnote so the two are never confused. It ships with a 23-check self-test that verifies the live formulas and named ranges; run `python should_cost_generator.py` to execute it.
- A concise narrative: the should-cost range, the gap and its driver attribution, the bracket vs market rate when available, the highest-leverage drivers, and the confidence/limitations.
- The cost-driver assumption ledger (JSON block) for downstream reuse and index-linked refresh.
- Optional `should_cost_dashboard.jsx` -- Magazine-style dashboard of the cost stack, built to the FIXED canonical tab skeleton (inlined below under "Dashboard canonical tab skeleton"). When the user wants a visual. Clone `examples/should_cost_canonical_dashboard.jsx` (the canonical reference implementation; full spec in `references/dashboard-canonical.md`) and swap the data; do not redesign the structure per run. **Graceful degradation:** the XLSX + narrative + ledger are the primary deliverable and stand alone. The dashboard is rendered via the `visualize:show_widget` primitive; if that primitive is unavailable, do not fail, deliver the workbook, the narrative, and the ledger, and tell the user the interactive view was skipped because the visualizer was not available.

## Integration
- **Consumes:** market-rate-benchmarking (top-down market range, reconciled via Bracket Reconciliation into a combined target band), user spec/price, prior assumption ledgers.
- **Feeds:** commercial-negotiation-prep (the cost anchor and bracket for counter-offers, via the assumption ledger), pro-forma-builder (cost basis), lilly-contract-review (commercial analysis). The assumption ledger is the portable handoff object.
- **Boundary:** this skill is BOTTOMS-UP cost construction only. Top-down percentile benchmarking belongs to market-rate-benchmarking; full negotiation-brief assembly belongs to commercial-negotiation-prep. When the user asks "is this priced fairly," produce the should-cost and the gap, then point to commercial-negotiation-prep for the full counter strategy.

## SUITE SPECIFICS - should-cost-builder
**Input tiers.** MUST: a product/service to cost. RECOMMENDED: supplier price, volume, specs, geography. OPTIONAL: index data, prior models.
**Native deliverable:** the bottoms-up cost breakdown (XLSX) + gap analysis + assumption ledger + narrative.
**Research:** G7 minimums (3-search effort floor per driver, deduplicated by driver family and cache-recalled within 90 days per Rule 2b, FX/spot-commodity inputs excepted from the cache) plus a research log and a corroborating-source confidence flag on every web-sourced cost driver; ranges over point estimates (see Rule 2 for the two separate concepts).
**Determinism:** the cost stack and its sources are shown; Total_base is the visible sum of component bases, and the total range is produced by the fixed Aggregation Method (quadrature with stated correlation grouping), reconciled on every run via the Pre-Delivery Self-Test. When a dashboard is produced, two runs of the same inputs produce the same dashboard skeleton (see "Dashboard canonical tab skeleton" below).

## Dashboard canonical tab skeleton (inlined below; Rule 8 determinism for the visual deliverable)

The optional dashboard has a FIXED tab structure. Every tab appears on every run and ALWAYS renders. When a tab is less applicable to the input in hand, show a clearly labeled state (NEEDS_INPUT for a pending user input, NOT APPLICABLE with a one-line reason, or RESEARCH PENDING when a search was run and returned nothing) rather than dropping or blanking it. Build the complete data object before rendering any code (G5). The six tabs are fixed; do not add, drop, reorder, or rename them by mode or category. Reference implementation: `examples/should_cost_canonical_dashboard.jsx`; full spec: `references/dashboard-canonical.md`.

| # | Tab | Contents | Empty / pending state |
| --- | --- | --- | --- |
| 1 | Overview | KPI cards: Should-Cost Base (Total_base), Should-Cost Range (Total_low - Total_high), Model Confidence, Supplier Price, Gap vs Should-Cost. The Pre-Delivery Self-Test reconciliation line as a visible callout. **Where the Price Falls** (a should-cost range gauge with the supplier's price marked) and **Where the Leverage Is** (paired narrative naming the top driver and the single LOW-confidence driver, if any). | If no supplier price was provided, the Gap KPI card shows NEEDS_INPUT ("gap not computable yet, add the supplier's proposed price") per the Edge Cases section; the should-cost range itself still renders in full. |
| 2 | Cost Stack | Per-component table (Component, Class MATERIAL/CONVERSION/COMMERCIAL, Base, Low, High, Basis, Source, Confidence) sourced from the applicable Cost-Structure Template. A component-share bar chart with a paired narrative reading. | NEEDS_INPUT if the cost structure has not yet been decomposed. |
| 3 | Sensitivity | Tornado chart: each driver swung +/-15% off its own base, others held constant, ranked by dollar swing on Total_base (top 5 of the modeled drivers). Paired narrative naming the top driver and what would most change the estimate. This is a uniform stress test, distinct from each driver's own researched low/high spread shown on the Cost Stack tab. | NOT APPLICABLE (with reason) when fewer than 2 components exist to compare. |
| 4 | Gap & Savings Pipeline | Gap Method KPI row (Should-Cost Base, Supplier Price, Gap $/%, Position vs Range) plus a driver-attribution chart (decomposing the gap onto components, summing exactly to the gap) with narrative. **Savings Pipeline**: a confidence-flagged lever table (Lever, Class, Low/High $ impact, Basis, Confidence), never a bare point estimate. **Category Scorecard**: drivers at HIGH confidence, Model Confidence, Reconciliation status, sources flagged stale, and web-sourced drivers meeting the 3-search effort floor. | If no supplier price was provided, the KPI row and driver-attribution chart show NEEDS_INPUT; the Category Scorecard still renders (it does not depend on the supplier price). |
| 5 | Bracket Reconciliation | The should-cost band plotted against the market-rate band (top-down, typically P25-P75) with the overlap highlighted as the recommended target; narrative on which of the three Bracket Reconciliation cases applies (agreement, should-cost-below-market, should-cost-above-market). | NOT APPLICABLE ("no market-rate-benchmarking output available for this run; the should-cost range on Overview stands alone as the anchor") when no top-down benchmark is present or producible. |
| 6 | Assumption Ledger | The full Cost-Driver Assumption Ledger table (component, class, basis, low/base/high, source, source_date, confidence, index_used, freshness_flag, notes), the model-level header as a copyable JSON block, and the research log. | RESEARCH PENDING for any driver where the 3-search effort floor was not met. |

**House style and palette.** Magazine Report house style (per the inlined `house-styles.md` summary in lilly-brand-assets). Use ONLY the canonical non-green status palette: positive text Bold Blue `#0F3A85` on Neutral Sky `#D4E5F7`; warning text Amber `#B45309` on Neutral Cream `#FFF0D8`; negative text Lilly Red `#E1251B` on Neutral Rose `#FDE8E5`; neutral/N-A Bold Grey `#8A969E`; section headers Bold Blue `#0F3A85`; cards/borders Neutral Stone `#E4EBF1`; header bar Lilly Black `#212121`. No green or teal in any status indicator. Each hex maps to exactly one token. In any rendered text, use the literal character, never a backslash-u escape or HTML entity, and never an em dash (Rule 7).

**Graceful degradation (primitive availability).**
- If the `visualize:show_widget` primitive or the JSX/React render path is unavailable, do NOT fail: emit the same six-tab content as a Magazine-style Markdown report (KPI table, cost-stack table, tornado table, gap and savings-pipeline table, bracket table, ledger table) and tell the user the interactive dashboard could not render so a static version was produced.
- The dashboard is OPTIONAL and never blocks the XLSX + narrative + ledger, which are the primary deliverable and stand alone.
- Numbers-reconcile assertion: Total_base must equal the visible sum of component bases; Total_low and Total_high must be the `quadrature_rollup()` output (mirrored in JS per the vendored `numeric_kernel.py`, never hand-typed); the Gap Method's driver-attribution rows must sum exactly to the visible gap dollar amount; and the Savings Pipeline's point estimates (before the confidence-based range is applied) must equal those same attribution rows. Reconcile before rendering (validation pass).
