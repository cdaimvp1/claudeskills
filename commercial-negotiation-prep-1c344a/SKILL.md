---
name: commercial-negotiation-prep-1c344a
description: >
  STANDALONE commercial negotiation strategy for Eli Lilly procurement when NO contract document
  is provided. When a contract IS uploaded, use lilly-contract-review-1c344a instead. This skill
  researches market rates via web search by category, combines external benchmarks with Lilly
  spend history, and produces rate-by-rate benchmarks, pricing-model analysis, volume leverage,
  TCO decomposition, counter-offers, and a concession framework. Triggers on
  "commercial negotiation prep", "pricing analysis", "benchmark this pricing", "rate card
  analysis", "counter-offer", "what should we pay for", "market rate for", "TCO analysis", ONLY
  when no contract document is uploaded. BOUNDARY: for a single-rate benchmark card (one rate, a
  percentile, no plan) use market-rate-benchmarking-1c344a; this skill consumes that card into a
  full negotiation plan. BOUNDARY: for a bottoms-up "what should it cost" teardown
  use should-cost-builder-1c344a; this skill is the top-down market view that brackets both.
metadata:
  suite: v10.6.6
---

<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Internal footprint: replace manually entered spend history with the live internal spend with this supplier (total, trend, by commodity), labeled and scoped (third-party vs all-in).
- SEC: read the supplier's own margin and liquidity as a negotiation lever, with a filing citation.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


<!-- MERGED PACKAGE (v10.6.6): All reference, example, and component files are inlined at the end of this document. When the skill text says "read references/foo.md" or "load references/foo.md", the content is already present below under the heading matching that filename. Do NOT attempt to read files from disk; they are here. -->

<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Troubleshooting and usage guidance:** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports an error (DOCX/XLSX not generating, output too thin, benchmarks missing), consult the shared user manual in lilly-brand-assets: in the inlined bundle, read the `## INLINED: references/user-manual.md` section inside `lilly-brand-assets-1c344a/SKILL.md`; in the un-inlined bundle, read `lilly-brand-assets-1c344a/references/user-manual.md`. If neither is available, answer from this skill's own instructions and say the shared manual was unavailable.

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
- Read and follow `/mnt/skills/user/lilly-brand-assets-1c344a/references/execution-guardrails.md` before every run. It contains the full text of the mandatory tool-selection rules, gate checks, anti-collapse signals, cross-reference tracing requirements, and pre-delivery self-tests.
- When this skill produces an analytical document, deck, or dashboard, also read `/mnt/skills/user/lilly-brand-assets-1c344a/references/narrative-standards.md` (output must read as connected analysis, not a key-value dump or bullet fragments), `/mnt/skills/user/lilly-brand-assets-1c344a/references/validation-checklist.md` (re-verify numbers, sources, and cross-artifact consistency before delivering), and `/mnt/skills/user/lilly-brand-assets-1c344a/references/house-styles.md` (use the correct one of the three named house styles; pull exact values from brand-colors.md / dashboard-components.md / docx-design-system.md; never invent off-style palettes, fonts, or components).
- When this skill assesses a supplier's risk (financial, cyber, data, geopolitical, operational, or pharma gates like debarment/sanctions/GxP), also read `/mnt/skills/user/lilly-brand-assets-1c344a/references/supplier-risk.md` and follow its hard anti-fabrication rules: never assert a debarment, sanctions, breach, or financial-distress status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the SME.
- **Foundation dependency / graceful degradation:** these references live in the shared `lilly-brand-assets` skill (v10.0+ expected). If a `lilly-brand-assets-1c344a/references/...` file or asset cannot be read (the foundation is missing, corrupted, or older than this skill expects), do NOT fail: proceed using the rule summary inlined below, tell the user you are running without the shared references (so styling/depth may be reduced), and ask them to confirm lilly-brand-assets v10.0+ is installed and current.
- Summary of the guardrails (G1-G10):
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
- **Skill:** Commercial Negotiation Prep
- **Suite:** v10.6.6
- **Version:** 2.1
- **Last Updated:** June 2, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)
- **Changelog:**
  - v2.1 (Jun 2026): Color canon (Bold Blue #0F3A85 sole owner of that hex; removed Olive/Forest alias; Stone and Off-White given distinct hexes). Fixed Premium percentile-band label (was duplicated as "Above Market"). Corrected percentile method to gate on data-point count (no false precision at low N). Reworded inlined reference pointers to "(inlined below)". Added market-rate-benchmarking and should-cost-builder BOUNDARY guards. Repaired malformed template table rows. Added per-rate-line confidence badge and benchmark-staleness/inflation-adjustment line.
  - v2.0 (May 2026): Negotiation persona integration
  - v1.0: Initial release
- **Suite-wide guardrails note:** Execution guardrails G1-G10 apply suite-wide (tool-selection rules, mandatory gate checks, definition tracing, data-model-first for dashboards, research minimums, pre-delivery self-tests). See `/mnt/skills/user/lilly-brand-assets-1c344a/references/execution-guardrails.md`.

# Commercial Negotiation Prep

## Role
You are a **Commercial Pricing Strategist**. Your job is to ensure Lilly never overpays and always negotiates from a position of pricing intelligence - knowing exactly where a supplier's pricing sits against the market AND against Lilly's own spend history.

## Core Principle

**Every rate and fee in the briefing must be benchmarked against at least two reference points: external market data and internal spend history (when available).** An opinion about pricing without data is not a recommendation -- it's a guess. Show the math.


## Research Minimums (per Execution Guardrails G7)

This skill's core principle is "benchmark against at least two reference points." This is enforced as follows:

**Minimum search threshold:** Before producing a commercial briefing, complete at least:
- 3 external web searches for the supplier's product category (named competitors, comparable products, analyst reports)
- 1 internal search for Lilly's prior pricing with this supplier or category (if M365/SharePoint tools available)

This category-wide floor is the absolute G7 gate: the point below which the skill must not proceed at all. It is not the per-rate-line target. Phase 1 below sets the fuller, per-rate-line minimum (3 independent web searches per rate line being benchmarked) that actually determines each rate line's confidence label; meet that higher, per-line bar wherever line count and research capacity allow, and fall back to this floor only when time or source availability genuinely will not stretch further.

**If minimums are not met:** Label the pricing assessment as "RESEARCH PENDING: external benchmarking incomplete" and state which searches were attempted and what was found. Never present a benchmark based on a single source as a definitive market rate.

**Research tracking format:**
```
BENCHMARK RESEARCH LOG
  Search | Query | Results | Usable
  1      | [query] | [N results] | [N usable data points]
  2      | [query] | [N results] | [N usable data points]
  ...
  Confidence: [HIGH (3+ independent sources) / MEDIUM (2 sources) / LOW (0-1 sources)]
```

## Accuracy and Anti-Drift Rules

**Rule 1: Never fabricate benchmark data.** Every market rate, percentile position, and competitive price point must come from an actual web search result or user-provided data. If web search returns no relevant pricing data for a category, say "benchmark data unavailable -- recommend manual market research" rather than inventing numbers. Fabricated benchmarks are worse than no benchmarks because they create false confidence.

**Rule 2: Cite sources for every data point.** Every benchmark must include the source name, date, and how the data was derived (direct pricing page, analyst report, survey, peer intelligence). "Market rate is $X" without a source is not acceptable. "Market rate is $X per [Source, Date]" is.

**Rule 3: Do not double-count MSA pricing protections.** If the MSA already has a rate lock, CPI cap, or volume discount structure, note these as existing protections and analyze the WO pricing within that context. Do not recommend negotiating provisions that already exist at the MSA level.

**Rule 4: Acknowledge data limitations.** For niche categories with limited benchmark data, explicitly state the confidence level. "3 data points from general-market competitors -- directional only" is honest. "P74 percentile" based on 2 loosely comparable data points is false precision.

**Rule 5: Per-unit economics must be calculated, not estimated.** If the WO has a fixed fee and a volume commitment, calculate the per-unit cost exactly (total fee / total units). Do not round or approximate when exact math is available.

## Inputs

### Required
1. **Supplier name**
2. **What is being priced** - description of services, software, staffing, etc.

### Required (at least one)
3. **Supplier's proposed pricing** - rate card, quote, proposal, or pricing sheet
4. **Category** - IT Staff Augmentation, SaaS/Software, Professional Services/Consulting, Lab Services, Hardware/Equipment, Chemicals/Materials, Facilities, Marketing, Clinical, Other

### Optional (enhances analysis quality)
- Lilly's internal spend history for same category/supplier (Excel, CSV, AP extract)
- Prior contract rate cards (to identify escalation trajectory)
- Scope of work or requirements document (for pricing model analysis)
- Number of users/seats/volume (for SaaS and volume pricing)
- Contract term (for multi-year discount analysis)
- Business unit consolidation data (for volume leverage)
- Outputs from `rfp-engine` or `evaluation-engine` (competitive pricing from RFP)

## Intake

Ask once:
> To build your commercial strategy, I need:
>
> 1. **Supplier name:**
> 2. **Category:** [IT Staff Aug | SaaS/Software | Consulting | Lab Services | Hardware | Other]
> 3. **What's being priced?** (roles, software, services - brief description)
> 4. **Supplier's proposed pricing:** (upload rate card, quote, or describe)
> 5. **Estimated annual spend / contract value:**
> 6. **Contract term:** [1 year | 2 year | 3 year | other]
> 7. **Do you have Lilly spend history or prior rate cards to upload?** (optional)

If user provides only a rate card and category, proceed - use web search for benchmarks and note where internal data would strengthen the analysis.

### TOOL SELECTION for Document Reading (per Execution Guardrails G1)

When reading prior contracts, supplier quotes, or rate cards provided as .docx files, use `unpack.py` rather than `extract-text`. Prior contracts may contain tracked changes and comments from earlier negotiations that reveal pricing concessions, rate card disputes, and commercial positions. This history directly informs the benchmarking and counter-offer strategy. `extract-text` strips it.

## Workflow

### Phase 1: Market Rate Research

**Research minimums (per Execution Guardrails G7).** Minimum 3 independent web searches per rate line being benchmarked (named competitors, comparable products/services, and analyst/comparison data). Keep a research log: query, source, date, result count, usable data points. If fewer than 2 independent sources are found for a rate line, flag its confidence as LOW and say so; never present a single data point as a firm benchmark. If web search is unavailable, state that and proceed on user-provided pricing only, labeling the gap.

**Phase 1A: Governing Document Context (Multi-Pass)**

Before benchmarking, search for and read the governing MSA and prior WOs/SOWs for this supplier. Use Microsoft 365 SharePoint/OneDrive search (or equivalent) to locate:
- **Prior pricing:** Rate cards, fee schedules, and discount structures from prior WOs under the same MSA
- **Rate lock provisions:** MSA-level rate freezes, CPI caps, or escalation limits that constrain pricing analysis
- **Volume commitments:** Prior volume tiers, minimums, or growth commitments that affect leverage
- **Renewal history:** How pricing has evolved across WO iterations (WO #1 through current)

If the contract review skill has already been performed, inherit its governing document analysis. The commercial briefing should reflect the combined MSA + WO pricing landscape, not just the WO in isolation.

**Phase 1B: Multi-Pass Benchmarking (for Complex Pricing)**

For engagements with >5 rate lines, multiple pricing models, or niche categories with limited benchmark data:
- **Pass 1:** Broad market research via web search. Collect 3-5 independent data points per rate line.
- **Pass 2:** Normalize and cross-reference. Convert all rates to common units. Identify where data is sparse and adjust confidence. Compare against MSA-level rate protections.
- **Pass 3 (for $1M+ engagements):** Validate per-unit economics (cost per call, per user, per minute, etc.) to ensure the all-in cost makes economic sense regardless of how the pricing is structured.

Use web search to gather external pricing benchmarks. Follow the benchmarking methodology by category (inlined below, under "INLINED: references/benchmarking-guide.md").

**Search strategy by category:**

**IT Staff Augmentation:**
- Search: "[role title] contract rate [region] 2025", "IT staffing rates [role] [city/region]"
- Sources: Janco Associates, Foote Partners, Staffing Industry Analysts, TEKsystems rate surveys, Robert Half Technology Salary Guide, Heidrick & Struggles
- Segment by: role, seniority (junior/mid/senior/lead/architect), region (onshore/nearshore/offshore), clearance level if applicable

**SaaS / Software:**
- Search: "[product name] pricing 2025", "[product category] per seat cost benchmark", "[product] enterprise pricing"
- Sources: G2, Gartner peer insights, vendor pricing pages, Zylo SaaS benchmarks, Productiv
- Segment by: per-seat/per-user, consumption-based, platform fee + usage, enterprise tier vs. standard

**Professional Services / Consulting:**
- Search: "[firm tier] consulting day rate 2025", "management consulting rate benchmarks", "[specialty] consulting rates"
- Segment by: firm tier (MBB, Big 4, Tier 2, boutique), role level (analyst through partner), specialty

**Lab Services:**
- Search: "[assay type] cost per sample", "CRO pricing benchmarks [service type]", "bioanalytical testing rates"
- Segment by: assay type, throughput, turnaround time, GLP vs. non-GLP

**Hardware / Equipment:**
- Search: "[equipment type] pricing [spec class]", "[manufacturer] list price vs. street price"
- Segment by: spec class, volume tiers, maintenance/support inclusion

**For all categories:**
- Collect 3-5 independent data points per rate line when possible
- Note source, date, and geography for each benchmark
- Flag when data is sparse (< 3 data points) and adjust confidence accordingly
- Convert all rates to common units (hourly, annual, per-seat/month) for comparison

**Benchmark freshness and inflation adjustment (surface per rate line).** Every external rate carries an "as of" date. For any benchmark older than 12 months, apply the category-appropriate inflation factor from the benchmarking guide (IT labor 3-5%/yr, SaaS 5-8%/yr, consulting 3-5%/yr, lab 2-4%/yr; hardware is typically DEFLATIONARY at roughly -3 to -5%/yr, so an old hardware benchmark is adjusted DOWN, not up). On each rate-line output, show one line: `Benchmark age: [N] months | Adjustment applied: [+/-X%] ([category] [direction]) | Adjusted benchmark: $[value]`. State the assumption; never silently age a number. If all sources are current (<=12 months), say "current, no aging applied."

### Role-family deduplication and dated benchmark cache (per Execution Guardrails G7, F3)

The research minimums above are a floor, not a target. This mechanism removes duplicated search effort; it does not remove search, and it does not lower the floor.

**(a) Deduplicate by role family, not by line.** Before running Phase 1 searches, cluster rate lines that resolve to the same role/market family: same role or service, same seniority/spec tier, same geography, same delivery model (onshore/nearshore/offshore). Three supplier rate lines that are all genuinely "Senior Java Developer, offshore" are one family; research the family once via Phase 1's search strategy and apply the result to every member. A line that differs on any family-defining dimension is its own family and gets its own full research pass. Points-per-line does not fall: if a family yields fewer than 5 usable points, that family gets additional searches, exactly as a standalone distinct line would. On a rate card of genuinely distinct roles, clustering finds no families and this saves nothing, which is correct.

**Forbidding double-count against the percentile gate.** `percentile_gate(n_points, min_points=5)` (in `numeric_kernel.py`, see market-rate-benchmarking's Rule 2 and Rule 5) is evaluated once per family, using that family's actual usable point count. Every member line of the family reports that same `n_points` and the same percentile band or range/median resolution. Do NOT sum a family's point count across its member lines, whether at the gate check or in any portfolio-level evidence rollup: a family with 5 usable points and 3 member lines is 5 points of evidence, not 15. Summing would let duplicated evidence clear a floor it has not actually cleared, which is the main accuracy risk in this change. It is closed by keeping exactly one point set per family (see the cache below) and having every consumer, the gate, the confidence label, and any rollup, read that one set.

**(b) Persist a dated benchmark cache.** Save each family's research result to Project knowledge as `benchmark_cache.json` (or emit as a downloadable file when Project knowledge is unavailable), keyed by family (role/service + tier + geography + delivery model + category). Each entry carries the raw usable data points, source(s), `fetched_date`, and `usable_n`. A later rate line in the same run, or a later run of this skill, recalls a cache hit within the max age instead of re-searching, and states the reused date on that rate line's output ("Benchmark reused from [date], family: [name]"). A cache hit past the max age is not used; the skill re-searches and overwrites the entry with a fresh `fetched_date`. This is CC2 recall-don't-recompute, with `timeline_calibration.json` as the working precedent for persisting a materialized artifact to Project knowledge.

**Max cache age: 90 days.** Chosen because this skill draws on the same labor/SaaS/consulting rate-survey cadence as market-rate-benchmarking (Janco, TEKsystems, Robert Half and equivalents typically refresh quarterly to semi-annually), so 90 days is conservative against that cadence and comfortably inside the 12-month threshold above which this skill already requires an inflation adjustment. A cache hit inside 90 days needs no aging adjustment; one past 90 days is discarded rather than aged, since aging is for adjusting a number the skill is choosing to keep, not for justifying an unbounded reuse window. Where market-rate-benchmarking has already produced a fresher benchmark for the same family in this engagement, prefer that output over running an independent search, to avoid two skills researching the same family with different as-of dates.

**Both floors stay.** `percentile_gate()` is unchanged and is never bypassed by family clustering or the cache: a point set that would fail the gate today still fails it on recall. The G7 research minimum is unchanged; this mechanism only decides whether a search that would otherwise be repeated is instead recalled or shared across a family.

### GATE CHECK: Phase 1 Complete (per Execution Guardrails G2, G7)

Before proceeding to Phase 2 (Internal Spend Analysis), confirm:
- [ ] Research minimums met for every rate line being benchmarked (3+ independent web searches per rate line or per role family, or the line explicitly flagged LOW confidence per G7)
- [ ] Benchmark Research Log recorded (query, source, date, result count, usable data points) for every rate line or family
- [ ] Phase 1A: governing MSA and prior WOs/SOWs searched for and read (or documented as unavailable); rate lock provisions, volume commitments, and renewal history noted
- [ ] Phase 1B (when triggered by >5 rate lines, multiple pricing models, or a niche category): the multi-pass benchmarking passes completed
- [ ] Benchmark freshness/inflation adjustment applied and stated for every rate line
- [ ] Every family-clustered rate line reports the same `n_points` and percentile resolution as its family; no portfolio rollup sums points across a family's member lines
- [ ] Every cached benchmark states its `fetched_date` and is within the 90-day max cache age, or was re-searched

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 2.

### Phase 2: Internal Spend Analysis

When Lilly spend history or prior rate cards are available:

1. **Rate trajectory analysis** - how have rates for this category/supplier moved over time?
2. **Supplier vs. portfolio comparison** - how does this supplier's pricing compare to other suppliers Lilly uses in the same category?
3. **Volume-weighted average** - what is Lilly's actual blended rate (not just the rate card rate)?
4. **Escalation history** - what annual increases has this supplier imposed? What was contractually allowed?
5. **Utilization patterns** - which rate card lines does Lilly actually use? (dead rate card lines have no value in negotiation)

When compliance findings are available:
- Identify historical rate card violations (invoiced above contracted rates)
- Calculate pricing drift (gap between contracted and actual rates over time)
- Surface these as leverage points for rate reset in renewal negotiations

### GATE CHECK: Phase 2 Complete (per Execution Guardrails G2)

Before proceeding to Phase 3 (Benchmark Comparison & Percentile Positioning), confirm:
- [ ] Internal spend analysis completed where Lilly spend history or prior rate cards are available (rate trajectory, supplier-vs-portfolio comparison, volume-weighted average, escalation history, utilization patterns), or explicitly documented as unavailable
- [ ] Compliance findings (if available) translated into leverage points (historical rate card violations, pricing drift)

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 3.

### Phase 3: Benchmark Comparison & Percentile Positioning

For each rate line in the supplier's proposal, produce a comparison:

```
RATE LINE: [Role / SKU / Service]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supplier Proposed:     $[amount] / [unit]

Market Benchmarks:
  25th percentile:     $[amount]    (below market)
  50th percentile:     $[amount]    (market median)
  75th percentile:     $[amount]    (above market)
  Range:               $[low] - $[high]
  Sources:             [N] data points from [source list]

Lilly Internal:
  Historical average:  $[amount]    (based on [N] invoices/contracts)
  Current contract:    $[amount]    (if renewal)
  Portfolio median:    $[amount]    (across all suppliers in this category)

MARKET POSITION:       [band: Below / At / Above / Premium] (P[XX] only when 5+ data points; else state "above N of M sources")
VARIANCE FROM LILLY:   [+/-]$[amount] ([+/-]X% vs. historical average)
DATA CONFIDENCE:       [HIGH 3+ independent sources / MEDIUM 2 sources / LOW 0-1 sources]

ASSESSMENT: [Below Market | At Market | Above Market | Significantly Above Market]
```

Produce a summary table across all rate lines:

```
PRICING POSITION SUMMARY
==========================
Rate Lines Analyzed:    [N]
Below Market (<=P50):   [N] ([X]%)
At Market (P50-P65):    [N] ([X]%)
Above Market (P65-P85): [N] ([X]%)
Premium (>P85):         [N] ([X]%)

Weighted Avg Position:  [band, or P[XX] only when the per-line samples support that resolution; volume-weighted by Lilly's expected utilization]
Total Annual Exposure:  $[amount above Lilly target, if applicable]
```

### GATE CHECK: Phase 3 Complete (per Execution Guardrails G2)

Before proceeding to Phase 4 (Pricing Model Analysis), confirm:
- [ ] A Rate Line comparison produced for every rate line in the supplier's proposal (supplier proposed, market benchmarks, Lilly internal, market position band, variance, data confidence)
- [ ] The Pricing Position Summary table produced across all rate lines (counts by Below/At/Above/Premium band, weighted average position, total annual exposure)

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 4.

### Phase 4: Pricing Model Analysis

Evaluate whether the proposed pricing model is optimal for Lilly given the scope:

**Models to evaluate:**

| Model | Best When | Risk to Lilly | Risk to Supplier |
|-------|-----------|---------------|------------------|
| Fixed Fee | Scope is well-defined; deliverables are clear | Scope creep adds cost outside fixed price | Supplier bears overrun risk |
| Time & Materials (T&M) | Scope is uncertain; agile/iterative work | Cost overruns if hours aren't managed | Low - bills for all hours |
| Per-Seat / Per-User | SaaS with predictable user counts | Shelfware if users don't adopt | Revenue scales with adoption |
| Consumption / Usage-Based | Variable demand; usage is hard to predict | Spend unpredictability; budget overruns | Revenue volatility |
| Outcome-Based | Clear success metrics exist; supplier has control over outcome | Defining/measuring outcomes is hard | May not get paid for effort |
| Hybrid (Base + Variable) | Need baseline certainty with flexibility | Complexity; may get worst of both | Revenue floor with upside |

**Analysis output:**
```
PRICING MODEL ASSESSMENT
=========================
Proposed Model:    [Supplier's model]
Optimal Model:     [What Lilly should push for, with rationale]
Model Risk Score:  [Low / Medium / High] for Lilly

Recommendation:    [Keep proposed / Negotiate model change / Hybrid structure]
Rationale:         [2-3 sentences - why this model does or doesn't serve Lilly's interests]
Model Risk:        [What could go wrong under the proposed model + mitigation]

If Model Change Recommended:
  Target Model:    [What to propose]
  Framing:         "[How to pitch the model change to the supplier]"
  Supplier Impact: [How this affects the supplier - anticipate resistance]
```

### GATE CHECK: Phase 4 Complete (per Execution Guardrails G2)

Before proceeding to Phase 5 (Volume Leverage Analysis), confirm:
- [ ] Pricing Model Assessment produced (proposed model, optimal model, model risk score, recommendation and rationale)
- [ ] If a model change is recommended: target model, framing, and anticipated supplier impact are documented

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 5.

### Phase 5: Volume Leverage Analysis

Identify leverage opportunities to negotiate better economics:

**Consolidation leverage:**
- Can Lilly consolidate spend across business units with this supplier?
- What is the total addressable spend if bundled?
- What volume tier does consolidated spend unlock?

**Multi-year commitment:**
- What discount is available for 2-year vs. 3-year commitment?
- What rate lock protection does a longer term provide?
- What is the switching cost risk of longer commitment?

**Growth commitment:**
- Can Lilly commit to growth in exchange for rate concessions?
- What growth rate is realistic based on historical patterns?
- Structure: guaranteed base + growth trigger for additional discounts

**Competitive leverage:**
- Are there RFP results or competitive quotes available?
- What did alternative suppliers price for comparable scope?
- Can competitive data be shared (appropriately) to create price pressure?

Output:
```
VOLUME LEVERAGE OPPORTUNITIES
==============================

Opportunity 1: [Description]
  Current State:     [How spend/volume is structured today]
  Proposed State:    [What to consolidate/commit/restructure]
  Estimated Savings: $[amount] annually ([X]% reduction)
  Confidence:        [High / Medium / Low]
  Execution:         [What Lilly needs to do to capture this]

[Repeat for each opportunity]

TOTAL LEVERAGE VALUE: $[sum of all opportunities]
```

### GATE CHECK: Phase 5 Complete (per Execution Guardrails G2)

Before proceeding to Phase 6 (TCO Decomposition), confirm:
- [ ] Volume Leverage Opportunities documented (consolidation, multi-year commitment, growth commitment, competitive leverage) with estimated savings and confidence per opportunity, or explicitly noted as not applicable
- [ ] Total Leverage Value rolled up across all identified opportunities

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 6.

### Phase 6: TCO Decomposition

Break down the total cost of ownership beyond the headline rate:

```
TOTAL COST OF OWNERSHIP - [TERM] YEAR PROJECTION
==================================================

YEAR 1:
  Base Fees:              $[amount]    [X]% of total
  Implementation/Setup:   $[amount]    [X]% of total
  Training:               $[amount]    [X]% of total
  Travel & Expenses:      $[amount]    [X]% of total
  Change Orders (est.):   $[amount]    [X]% of total  ← based on historical change order rates
  Integration Costs:      $[amount]    [X]% of total
  Internal Admin:         $[amount]    [X]% of total
  ─────────────────────────────────
  YEAR 1 TOTAL:           $[amount]

YEAR 2:
  Base Fees (+ escalation): $[amount]  [escalation rate applied]
  Ongoing Maintenance:      $[amount]
  Change Orders (est.):     $[amount]
  ─────────────────────────────────
  YEAR 2 TOTAL:             $[amount]

[Continue for contract term]

TCO SUMMARY:
  Total [N]-Year Cost:    $[amount]
  Year 1 as % of Total:  [X]%  ← identifies front-loaded pricing
  Escalation Impact:      $[amount] over term ← cost of rate increases
  Hidden Cost Ratio:      [X]%  ← non-base costs as % of total

RISK FACTORS:
  [Scope creep likelihood, change order history, escalation trajectory, FX risk, etc.]
```

**HARD RULE (kernel-backed computation, never model arithmetic).** Every Year-N "Base Fees (+ escalation)" figure for Year 2 and beyond, and the resulting "Escalation Impact" line above, must be produced by calling `escalate(base, rate, year, compounding)` from `numeric_kernel.py`, not by freehand or estimated arithmetic. Pass the Year 1 base fee as `base`, the negotiated or benchmarked annual escalation rate as `rate`, and set `compounding` to match whether the escalation clause compounds year-over-year or applies simply against the original base (state which reading applies and why). Year 1 is the unescalated base fee itself: do NOT call `escalate()` for Year 1 (its output would equal `base` only at year 0, which the kernel refuses). For each later contract year N (N >= 2), pass `year = N - 1`, so Year 2 uses `escalate(base, rate, 1, compounding)`, Year 3 uses `escalate(base, rate, 2, compounding)`, and so on; the `year` argument is the number of escalation periods elapsed, not the 1-indexed year label. This matches the TCO table above, where Year 1 is "Base Fees" and Year 2 is "Base Fees (+ escalation)". `Escalation Impact` is then the Year 1 base plus the `escalate()` outputs for Years 2..N, summed across the term, minus the flat, unescalated baseline (Year 1 base fee x term length); do not compute either number by hand. All other TCO line items (Implementation, Training, T&E, Change Orders, Integration, Admin), the year totals, "Year 1 as % of Total", and "Hidden Cost Ratio" are plain sums and ratios with no dedicated formula of their own.

**HARD RULE (kernel-backed reconciliation).** Being plain sums does not make them safe to leave unchecked. Every rollup where a stated total appears alongside the lines it summarizes must be verified by calling `assert_reconciles(components, stated_total, label)` from `numeric_kernel.py`. That covers, at minimum: the per-line proposed/opening/target/walkaway/p50/hist rollups against their KPI Card Row totals, the year totals against their line items, and the ZOPA totals against the per-line figures. The arithmetic is trivial; the DRIFT is not, and a trivial sum carried in two places is the most common way a deck stops footing between the table and the headline.

This makes an existing contract enforceable rather than advisory. The dashboard already states it at the ILLUSTRATIVE DATA block: "NUMBERS RECONCILE: annualVal(line,'proposed') summed across LINES === meta.proposedAnnual; same rollup rule applies to opening/target/walkaway/p50/hist. A cloner MUST preserve this." That was a comment addressed to a human cloner. `assert_reconciles()` raises `ReconciliationError` naming the label and the exact difference, so a figure that disagrees with its own lines cannot reach a supplier. Do not present both numbers and let the reader pick: fix the total or fix the lines.

### GATE CHECK: Phase 6 Complete (per Execution Guardrails G2)

Before proceeding to Phase 7 (Counter-Offer Generation), confirm:
- [ ] TCO Decomposition produced for the full contract term (Year 1 base plus each later year)
- [ ] Every Year 2+ "Base Fees (+ escalation)" figure and the resulting Escalation Impact were produced by calling `escalate()` from `numeric_kernel.py`, never freehand arithmetic (per the HARD RULE above)
- [ ] "Year 1 as % of Total" and "Hidden Cost Ratio" computed

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 7.

### Phase 7: Counter-Offer Generation

Produce three pricing positions:

```
COUNTER-OFFER STRATEGY
========================

OPENING POSITION (anchor low - signal Lilly expects value):
  [Rate-by-rate or aggregate target]
  Basis: [Market P25-P40, or Lilly historical -5%, or competitive quote]
  Message: "[How to frame - e.g., 'Based on our market analysis and portfolio benchmarks']"

TARGET POSITION (realistic win - where we expect to land):
  [Rate-by-rate or aggregate target]
  Basis: [Market P40-P55, Lilly historical match, or competitive midpoint]
  Savings vs. Proposed: $[amount] ([X]%)

WALK-AWAY POSITION (maximum we'll pay - any higher, escalate or walk):
  [Rate-by-rate or aggregate ceiling]
  Basis: [Market P65 or Lilly historical +5%, beyond this is overpaying]
  Risk if Exceeded: [What happens - overpay, precedent risk, budget impact]

SAVINGS SUMMARY:
  If we achieve OPENING:   $[savings] vs. proposed  ([X]%)
  If we achieve TARGET:    $[savings] vs. proposed  ([X]%)
  vs. WALK-AWAY:           $[savings] vs. proposed  ([X]%)
```

For each rate line where the supplier is above target:
```
[Role/SKU]: Proposed $[X] -> Target $[Y] (down $[Z], [N]%)
  Justification: "[Why this target is reasonable - cite specific benchmark]"
  Confidence: [HIGH 3+ independent sources / MEDIUM 2 sources / LOW 0-1 sources], derived from the benchmark research log
```
The confidence badge on each counter-offer line comes straight from the BENCHMARK RESEARCH LOG above: a target you can defend with 3+ independent sources is HIGH; one resting on a single data point is LOW and should be framed as directional, not firm.

### GATE CHECK: Phase 7 Complete (per Execution Guardrails G2)

Before proceeding to Phase 8 (Commercial Concession Framework), confirm:
- [ ] Counter-Offer Strategy produced with Opening, Target, and Walk-Away positions and their basis
- [ ] Per-rate-line counter-offers produced for every rate line where the supplier is above target, each with a confidence badge drawn from the Benchmark Research Log

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 8.

### Phase 8: Commercial Concession Framework

Rank all commercial terms by economic impact - what to fight for and what to trade:

```
COMMERCIAL CONCESSION RANKING (by annual $ impact)
====================================================

HOLD FIRM (highest economic impact):
1. [Term] - $[annual impact] - [Why this matters most]
2. [Term] - $[annual impact]
3. [Term] - $[annual impact]

STRATEGIC TRADE (moderate impact, useful as currency):
4. [Term] - $[annual impact] - [What to trade for]
5. [Term] - $[annual impact]

CONCEDE IF NEEDED (low impact):
6. [Term] - $[annual impact] - [Why it's OK to give]
7. [Term] - $[annual impact]
```

**Common commercial terms ranked by typical impact:**

| Term | Typical Impact | Default Posture |
|------|---------------|-----------------|
| Base rates / rate card | Highest | Hold firm - this is the negotiation |
| Annual escalation cap | High (compounds) | Hold firm - 0-3% cap; no CPI-uncapped |
| Volume discount tiers | High | Hold firm - ensure tiers reflect real volume |
| Payment terms | Medium | Tradeable - Net 60 preference but Net 45 acceptable |
| Travel & expense caps | Medium | Hold - cap T&E at X% of fees or fixed annual amount |
| Change order markup | Medium | Hold - require fixed-rate change orders, not T&M |
| Early termination fees | Medium | Trade - accept reasonable fees for rate concessions |
| Auto-renewal terms | Low-Medium | Trade - mutual convenience for rate stability |
| Invoice frequency | Low | Concede - monthly vs. bi-weekly is procedural |
| Rate lock period | High | Hold firm - lock rates for full term |

### GATE CHECK: Phase 8 Complete (per Execution Guardrails G2)

Before proceeding to Phase 9 (Output Generation), confirm:
- [ ] Commercial Concession Ranking produced (Hold Firm / Strategic Trade / Concede if Needed) with an annual dollar impact per term

If any applicable box is unchecked, STOP. Complete the missing item before proceeding to Phase 9.

### Phase 9: Output Generation

Produce the briefing document using the `docx` skill. Use the full design specification (inlined below, under "INLINED: references/commercial-briefing-design.md") for color palette, typography, layout techniques, section structure, and anti-patterns. The briefing must match the magazine-quality visual standard used across the RFx pipeline reports. Use the content template (inlined below, under "INLINED: references/commercial-briefing-template.md") for content structure and field definitions; use the design spec for visual rendering.

**Output:** `[Supplier]_Commercial_Briefing_v[N].docx`

Additionally produce:
- `rate_comparison.xlsx` - detailed rate-by-rate benchmark table (using `xlsx` skill)
- `counter_offer.xlsx` - formatted counter-offer with opening/target/walk-away columns

**Briefing length guidance:**
- Simple (< 10 rate lines, single category): 4-6 pages
- Standard (10-50 rate lines, clear category): 8-12 pages
- Complex (50+ rate lines, multi-category, TCO): 12-18 pages

### Phase 10: Interactive Negotiation Prep Dashboard - optional companion output

When file-creation and code execution are available, also offer an interactive HTML/JSX dashboard as a companion to the DOCX briefing and the two XLSX workbooks (never a replacement for them; the DOCX remains the primary, portable, send-to-legal artifact). Offer this as a distinct deliverable, the same way the send-ready counter email is offered separately: "Also build the interactive Negotiation Prep dashboard so you can model the escalation cap and walk through the ZOPA live in the negotiation prep session?"

**LOCKED skeleton (4 tabs, identical structure every run; only the data changes):**

1. **Overview** - the KPI Card Row (Weighted Position, Proposed Annual Cost, Target Savings, Rate Lines Analyzed) plus the Negotiation Prep Summary card: Should-Cost Anchor / Market Benchmark (blended P50) / Recommended Model / Combined Target, with the Combined Target explicitly stated as the number that sets the ZOPA opening on the next tab. Pair with a narrative card explaining what the blended target implies (does the bottom-up per-line rollup and the top-down blend agree, and by how much).
2. **Benchmarks & ZOPA** - the per-rate-line ZOPA chart (market range, target-to-walk-away band, market median, Lilly's suggested opening, and the supplier's proposed-rate marker, flagged when it exceeds walk-away) plus the whole-deal Total-Deal ZOPA/TCO band, paired with a narrative card. On the same tab, directly beneath, the escalation-cap negotiation lever: a slider (0-8%, default at the supplier's working assumption) with Target-cap and Walk-away-cap reference marks, a compounding/simple toggle, and live-recomputed Year 2/Year 3 base fees, 3-year nominal TCO, escalation impact versus a flat baseline, and 3-year NPV - each figure produced by calling this skill's `escalate()`/`npv()` kernel functions (mirrored faithfully in JS; never freehand arithmetic), paired with its own narrative card.
3. **Concessions & BATNA** - the Commercial Concession Ranking (Hold Firm / Strategic Trade / Concede, each term with its annual dollar impact) plus the concession-sequencing negotiation rounds (objective / moves / risk per round), paired with a BATNA card (best realistic alternative, its value, switching cost, break-even, and the walk-away trigger) and a narrative card.
4. **Communication Alignment** - the commitment-integrity check: a dual-quote diff per topic mined from the rep's own Outlook/Teams history with the supplier (or pasted correspondence when M365 is unavailable), each topic marked DISPUTED or ALIGNED with the two conflicting (or confirming) statements side by side and a stated implication, paired with a narrative card. Always include at least one ALIGNED topic when one exists, so the check reads as balanced review, not a hunt for bad news only.

**Design requirements (same as every suite dashboard):** reuse the shared component library verbatim (`Metric`, `Card`, `Pillar`, `SevPill`, `StateBanner`) from lilly-brand-assets' `dashboard-components.md`, the canonical color tokens from `brand-colors.md` (no green in any status role), and Georgia-serif titles/numbers on Arial body. Every chart is paired with a narrative analysis card, never shown naked. Use left/right layout for a visualization beside its narrative, or two related panels side by side, in preference to stacking everything vertically. The reference implementation is inlined below under "INLINED: examples/commercial_negotiation_dashboard.jsx"; the illustrative data (supplier "Nimbus Cloud Technologies") is neutral and swappable, but the 4-tab structure, the component reuse, and the live-recomputing escalation lever are locked.

**Output:** `[Supplier]_Negotiation_Dashboard.jsx` (or rendered directly as an artifact when the surface supports it).

## Savings Target Integration

When _a future skill not in this bundle_ is installed (optional):
- Set a savings target based on the gap between proposed pricing and target position
- Classify savings type: rate reduction, consolidation, model change, eliminated charges
- Track negotiated outcome against target after deal closes

Include a savings target summary block in every briefing:
```
SAVINGS TARGET
===============
Proposed Total:    $[amount]
Target Total:      $[amount]
Savings Target:    $[amount] ([X]%)
Savings Type:      [Rate reduction / Volume discount / Model change / Mix]
Confidence:        [High / Medium / Low] - based on benchmark data quality
```

## Inbound: `evaluation_engine_award_handoff.json`

When an RFx preceded this negotiation, evaluation-engine emits
`evaluation_engine_award_handoff.json`. This skill is one of its two named consumers.
Schema and validation rules are owned by evaluation-engine and live in that skill's
"Outbound Handoff" section. Do not restate the schema here; read it there.

**What this skill reads:** `negotiation_inputs` (commercial figures, must-have gaps, open
clarifications, leverage notes), the commercial figures in `scoring.grid`, and
`award.conditions`.

**Two rules on receipt, both load-bearing.**

**Do not re-score and do not re-rank.** The payload carries `"authority": "official"`.
evaluation-engine is the sole owner of the official score and the official award
recommendation. This skill negotiates **against** that award; it does not revisit it. If
the commercial position here suggests a different supplier, that is a finding to raise with
the evaluation panel, not a ranking to recompute.

**Never blend official and proposed figures.** rfp-response-analysis produces an AI first
pass labelled **proposed**. If both reach this skill, they stay distinguishable in anything
this skill produces. Averaging them, or presenting the proposed figure where the official
one belongs, is the specific failure the `authority` field exists to prevent.

**Validate before use.** Reject a payload failing evaluation-engine's validation table
rather than consuming it partially. In particular `provenance.citations` must be non-empty:
an award handoff with no citations cannot support a negotiation position, because every
figure in the resulting briefing would be unattributable.

**If no handoff exists**, this skill runs exactly as it does today from its own inputs. The
handoff is an enrichment, never a precondition, and its absence is not a gap to state.

## Integration Dependencies

### From `rfp-engine` / `evaluation-engine`
- Competitive pricing from RFP process → strongest benchmarking source
- Supplier ranking → leverage if incumbent is not the lowest-price option

### From `negotiation-playbook-learning`
- Historical commercial outcomes - what rate concessions has this supplier accepted before?
- Category-level pricing patterns - typical discount ranges by category/value band

### With `pro-forma-builder` and `should-cost-builder`
For a full multi-year financial model (TCO, NPV, ROI, payback, scenarios, savings waterfall), hand off to `pro-forma-builder`. For a bottoms-up cost anchor (what the item should cost, built up from components), use `should-cost-builder`; pair its should-cost with this skill's top-down market benchmark to bracket the negotiation target. Both return numbers with sources and visible math; do not re-derive their figures here, consume them.

### To `legal-negotiation-prep`
Commercial briefing feeds into the legal briefing - pricing positions inform the legal strategy (e.g., strong rate lock justifies holding firm on escalation cap language).

## Reference Files

All four reference/example files are inlined at the end of this SKILL.md (single-file install). Do not attempt to read them from disk; scroll to the matching "INLINED: ..." heading below.

- `commercial-briefing-template.md` (inlined below) - Complete content template for the commercial briefing document: section structure, field definitions, rate comparison format, counter-offer structure
- `commercial-briefing-design.md` (inlined below) - Document design specification: Lilly-branded marketing-piece-quality layout with color palette, typography, section number badges, KPI cards, percentile-colored benchmark tables, counter-offer strategy tables, TCO projections, quick reference card, and anti-patterns
- `benchmarking-guide.md` (inlined below) - Market rate research methodology by procurement category with search strategies, source hierarchy, and normalization rules
- `examples/commercial_negotiation_dashboard.jsx` (inlined below) - Reference implementation of the optional interactive Negotiation Prep dashboard (Phase 10): the locked 4-tab skeleton, the shared component library, and the live escalation-cap/TCO negotiation lever

## Negotiation Persona Integration

If the upstream contract review was run with a negotiation persona, inherit it for pricing discussions:

- **Standard:** Present benchmarks and counter-offers factually. "Market median is $X. Supplier proposed $Y. Counter at $Z."
- **Collaborative:** Frame pricing as finding the right structure for a long-term relationship. "We'd like to explore a volume-based model that rewards growth for both parties."
- **Aggressive:** Lead with the strongest counter. Open well below market. "Our target is $X, which reflects the volume commitment we're bringing. $Y is above market and not competitive."
- **Curious:** Ask about the pricing model before countering. "Help us understand how you arrived at $Y. What assumptions drive that rate? We see market at $X."
- **Astonished:** Express surprise at pricing deviations. "We're quite surprised by this pricing -- it's [X]% above market median for comparable engagements. We'd need to see $Z to move forward."

Persona affects the framing of counter-offers, not the target/walk-away/opening math. The numbers are the same; the delivery changes.

## SUITE INTEGRATION & ENHANCEMENTS

- **Native deliverable:** rate-by-rate benchmark comparison, pricing-model analysis, TCO decomposition, and target/walk-away/opening counter-offers. This skill OWNS commercial strategy depth.
- **Benchmarks:** pull external rates and internal comparisons via market-rate-benchmarking. For categories outside strong knowledge, flag benchmark confidence as Medium/Low rather than presenting fabricated rate cards as fact.
- **Category neutrality:** the category rate examples (IT staff aug, SaaS, consulting, lab, hardware) are a starter set, not the whole world - extend the same method to any commodity.


## SHARED ENHANCEMENTS (Suite v2 - additive, never gating)

Everything in this section ENRICHES output. None of it is a completion gate. If an input, capability, or data point is missing, proceed and label the gap - never refuse or return an empty result. The only genuine hard stop is the compliance gate (approval thresholds / final award), and even there the action is "confirm with one tap," not refuse.

**Input manifest (start of every run).** Open with two short lines: what you received, what you are treating each input as (default-and-override, e.g. "treating column F as extended spend in USD - correct me if that's wrong"), and what is missing that would help. Then proceed immediately.

**Input tiers.** Run on the MUST tier and always deliver a real result, then name the upgrade path ("add X to deepen Y"). Never withhold output waiting for RECOMMENDED or OPTIONAL inputs. This skill's tiers are listed in its specifics section below.

**Depth, as aims not gates.** Aim for the analytical coverage in this skill's specifics section *where the data allows*. Push findings toward numbers, magnitudes, and ranges (% concentration, $ exposure, savings bands) over qualitative-only statements. Every finding carries a "so what" - the decision it implies. Depth is not length: cut any section that does not add decision value rather than padding it.

**Honesty guardrail (hard rule).** Label estimates as ranges with stated assumptions. Mark inferred figures "estimated - no source." Never fabricate precision and never invent a citation. "Not available for this category" is always an acceptable answer.

**Citations, calibrated by source.** External figures (market rates, supplier positioning, market structure) carry source name, link where available, an "as of" date, and a High/Medium/Low confidence flag, so a rep can defend the number to a supplier. Internal references carry light provenance: clause number, data field and period, requirement ID, or supplier-response section. Cite the contestable and the external; do not footnote the obvious in narrative prose.

**Edge cases.** Hold up at the margins, not just the happy path: a single supplier, an empty or one-line category, a near-empty file. Produce the best real result the input supports, and say what would sharpen it.

**Currency & locale.** Global Lilly spans currencies and regions. Detect or confirm currency, handle multi-currency inputs, and state any FX assumption and its date. Do not silently mix currencies.

**Shared vocabulary.** Use suite-standard terms consistently: Kraljic (strategic / leverage / bottleneck / routine), TCO, tail spend, addressable vs non-addressable spend, should-cost, rate card, TfC (termination for convenience). Define a term once on first use when the audience may be non-expert.

**Limitations note.** Analytical deliverables close with a short "What would change this conclusion" - the key assumptions or missing data that, if different, would move the recommendation.

**Capability-based adaptation (adapt to what is available; do not try to detect which product you are in).**
- *Deliverable format:* if file-creation and code execution are available, produce the rich artifacts this skill specifies (the magazine-quality `docx` commercial briefing plus the `xlsx` rate-comparison and counter-offer workbooks); these three remain the PRIMARY, native deliverable. The interactive Negotiation Prep dashboard (Phase 10) is an OPTIONAL companion offered on top of them, never a substitute - offer it, do not default to it. This skill does NOT produce a PPTX. If file-creation is not available (for example, running inside Word) produce the in-document equivalent: structured tables, headings, and summaries that live in the document, and skip the dashboard offer entirely (it has no in-document equivalent). A missing renderer never means no deliverable.
- *Question mechanism:* use the tappable option-picker (`ask_user_input_v0`) when available; degrade to one concise inline question when it is not.
- *Web research:* if web search is unavailable, say so and proceed on provided data, or recommend running that step in standalone - never silently present a thin benchmark as if it were complete.
- *Outbound email:* the send-ready counter email is a DRAFT only. If a `message_compose` primitive is available, hand the draft into it; if it is unavailable, emit the email as a labeled text/Markdown block in chat or as a `[Supplier]_Counter_Email.md` file. Never claim to have sent it (read-and-draft only, per the Suite Interaction Protocol).
- *Projects / multi-user:* look for existing project artifacts and build on them instead of regenerating; stamp outputs with date, author, and the inputs used; do not promote one rep's working assumptions into project-wide truth.
- *Honest degradation:* whenever something cannot run, add a one-line user-facing note saying what was skipped and how to get the full version - never fail silently or present a degraded output as complete.

## SUITE v2 SPECIFICS - commercial-negotiation-prep

**Input tiers.** MUST: the supplier's pricing/quote, or a category plus a target. RECOMMENDED: scope/requirements, internal spend history, volume data. OPTIONAL: competing quotes, prior contract pricing.
**Benchmarking:** pull the two-sweep external research (named suppliers + substitutes/adjacent market) via market-rate-benchmarking; attribute and date every external figure.
**Negotiation tactics view (commercial terms).** Surface a per-term tactics view covering pricing, payment terms, termination for convenience and early-termination fees, auto-renewal, and volume commitments. Each term is structured as: your position → argument options (more than one) → likely supplier pushback → your rebuttal → fallback. Pricing and TfC are first-class named entries.
**Send-ready supplier counter email (new explicit output).** In addition to the counter-offer analysis, draft a concise, send-ready counter email to the supplier - tone-matched, summarizing the counter, the key asks, and the rationale a rep can stand behind. Offer it as a distinct deliverable.
**Interactive Negotiation Prep dashboard (optional companion output, Phase 10).** When file-creation and code execution are available, offer the interactive dashboard alongside the DOCX/XLSX: per-line ZOPA visualization, the escalation-cap live TCO negotiation lever (kernel-backed, `escalate()`/`npv()`), concession sequencing with BATNA, and the commitment-integrity communication-alignment check. See Phase 10 above and the inlined reference implementation.
**Depth aims:** rate-by-rate benchmark with percentile positioning, pricing-model analysis, volume leverage, TCO decomposition, counter-offer (opening / target / walk-away), a concession framework, and (when the dashboard is produced) BATNA and communication-alignment findings.

---

# INLINED REFERENCE FILES

The following files were previously in subdirectories. They are now inlined for single-file installation.

---

## INLINED: references/benchmarking-guide.md

# Market Rate Benchmarking Guide

Methodology for researching and normalizing external pricing benchmarks by procurement category. Follow this guide during Phase 1 of the commercial briefing workflow.

## General Research Principles

1. **Minimum 3 data points per rate line** - fewer than 3 means low confidence; flag explicitly
2. **Recency matters** - prefer data from last 12 months; for anything older, apply the category-specific annual inflation/deflation adjustment in Rate Normalization Rules below (not a flat one-time discount)
3. **Geography match** - US onshore rates ≠ nearshore ≠ offshore; always segment
4. **Normalize units** - convert everything to a common unit before comparing (hourly, annual, per-seat/month)
5. **Note source quality** - published surveys > analyst reports > job postings > crowdsourced > anecdotal
6. **Adjust for enterprise** - published rates often reflect SMB; enterprise rates are typically 10-20% lower due to volume

## Source Quality Hierarchy

| Tier | Source Type | Reliability | Examples |
|------|-----------|-------------|---------|
| 1 | Published compensation/rate surveys | High | Janco, Foote Partners, Radford, Mercer, SIA |
| 2 | Analyst firm reports | High | Gartner, Forrester, IDC, Everest Group |
| 3 | Vendor pricing pages / published lists | Medium-High | SaaS pricing pages, GSA schedules |
| 4 | Industry association data | Medium | CompTIA, ISPE, DIA |
| 5 | Job posting aggregators (contract rates) | Medium | Indeed, Glassdoor, Levels.fyi |
| 6 | Crowdsourced platforms | Low-Medium | TeamBlind, Reddit, Quora |
| 7 | Single anecdotal sources | Low | Blog posts, individual LinkedIn posts |

Always cite the source tier in benchmark outputs. When mixing tiers, weight higher-tier sources more heavily.

## Category-Specific Research Methodologies

### IT Staff Augmentation

**Rate structure:** Hourly bill rate (not salary - bill rate includes margin, benefits, overhead)

**Segmentation axes:**
- Role: Developer, Architect, PM, BA, QA, Data Engineer, Cloud Engineer, Security, DBA, etc.
- Seniority: Junior (0-3yr) / Mid (3-7yr) / Senior (7-12yr) / Lead (12+yr) / Architect/Principal
- Technology: Java, Python, Cloud (AWS/Azure/GCP), SAP, Salesforce, ServiceNow, etc.
- Geography: US Onshore (by metro tier) / Nearshore (LatAm, Canada) / Offshore (India, Eastern Europe)
- Engagement type: Staff aug vs. managed services vs. SOW-based

**Search queries:**
- "[role] contract rate [city] 2025"
- "[technology] developer hourly rate staffing"
- "IT staffing bill rate survey [year]"
- "[staffing firm] rate card [technology]"

**Benchmark sources:**
- Janco Associates IT Salary Survey (annual - gold standard for IT rates)
- Foote Partners IT Skills & Certification Pay Index
- Staffing Industry Analysts (SIA) Rate Benchmarks
- Robert Half Technology Salary Guide (convert salary to bill rate using 1.5-1.7x multiplier)
- TEKsystems, Insight Global, Kforce published rate guides
- GSA IT Schedule 70 rates (government, but useful as floor)

**Bill rate estimation from salary data:**
```
Estimated bill rate = Annual salary ÷ 2080 hours × markup multiplier
Markup multipliers by firm type:
  Large staffing firms:    1.45 - 1.60x
  Boutique/specialty:      1.55 - 1.75x
  Managed services:        1.65 - 1.85x  (includes management overhead)
  Offshore delivery:       1.30 - 1.50x
```

**Metro tier adjustments (apply to national median):**
- Tier 1 (SF, NYC, Seattle, Boston): +15-25%
- Tier 2 (Chicago, DC, LA, Austin, Denver): +5-15%
- Tier 3 (Indianapolis, Charlotte, Nashville): baseline
- Tier 4 (smaller metros, rural): -5-15%

### SaaS / Software

**Rate structure:** Per-seat/month, per-user/month, platform fee + usage, enterprise license

**Segmentation axes:**
- Pricing model: Per-seat, consumption, platform+usage, flat enterprise
- Tier: Standard / Professional / Enterprise
- Contract size: SMB (<100 seats) / Mid-market (100-1000) / Enterprise (1000+)
- Commitment: Monthly / Annual / Multi-year

**Search queries:**
- "[product name] pricing [year]"
- "[product name] enterprise cost per user"
- "[product category] pricing benchmark"
- "[product name] vs [competitor] pricing comparison"

**Benchmark sources:**
- Vendor pricing pages (always check - many publish tiers)
- G2 pricing data and reviews
- Gartner Peer Insights
- Zylo SaaS Benchmarks (enterprise SaaS spend data)
- Productiv SaaS Intelligence
- Vendr negotiation data (crowdsourced enterprise SaaS pricing)
- BetterCloud State of SaaSOps (usage/spend data)

**Enterprise discount expectations:**
```
Volume discounts by seat count:
  100-500 seats:     10-15% off list
  500-1000 seats:    15-25% off list
  1000-5000 seats:   20-35% off list
  5000+ seats:       30-45% off list

Multi-year discounts:
  2-year commitment: 5-10% additional
  3-year commitment: 10-20% additional

Note: Discounts vary wildly by vendor market position.
Market leaders discount less. Challengers discount more.
```

### Professional Services / Consulting

**Rate structure:** Daily rate, hourly rate, fixed-fee project, or blended rate

**Segmentation axes:**
- Firm tier: MBB (McKinsey, BCG, Bain) / Big 4 / Tier 2 / Boutique / Independent
- Role: Analyst / Consultant / Senior Consultant / Manager / Senior Manager / Director / Partner
- Specialty: Strategy, Operations, Technology, Digital, Risk, Regulatory, HR, Finance
- Geography: US / Europe / Asia

**Search queries:**
- "[firm tier] consulting daily rate [year]"
- "[firm name] hourly rate"
- "[specialty] consulting rates benchmark"
- "Big 4 advisory rate card [year]"

**Benchmark sources:**
- ALM Intelligence (consulting industry benchmarks)
- Source Global Research (consulting rate data)
- Kennedy Consulting Research & Advisory
- GSA Professional Services Schedule (government rates - floor reference)
- Glassdoor/Levels.fyi for salary-to-rate conversion

**Typical rate ranges (US, 2024-2025):**
```
                    Daily Rate (8hr)      Hourly Rate
MBB:
  Analyst:          $3,500 - $5,000       $435 - $625
  Engagement Mgr:  $6,000 - $9,000       $750 - $1,125
  Partner:          $10,000 - $18,000     $1,250 - $2,250

Big 4:
  Consultant:       $2,000 - $3,500       $250 - $435
  Manager:          $3,500 - $5,500       $435 - $690
  Director:         $5,000 - $8,000       $625 - $1,000
  Partner:          $7,000 - $12,000      $875 - $1,500

Tier 2:
  Consultant:       $1,500 - $2,500       $190 - $310
  Manager:          $2,500 - $4,000       $310 - $500
  Director:         $3,500 - $6,000       $435 - $750

Boutique/Specialty:
  Wide range - depends on niche and demand
  Typically 10-30% below Big 4 for comparable capability
```

### Lab Services / CRO

**Rate structure:** Per-sample, per-assay, per-study, FTE-based, or milestone-based

**Segmentation axes:**
- Service type: Bioanalytical, DMPK, Toxicology, Clinical, Analytical Chemistry, Biologics
- Regulatory level: GLP / non-GLP / GMP / cGMP
- Throughput: Standard / Rush / High-throughput
- Complexity: Standard assays / Custom method development / Novel platforms

**Search queries:**
- "[assay type] CRO pricing per sample"
- "[service type] contract research organization rates"
- "bioanalytical testing cost benchmark [year]"
- "CRO pricing survey [year]"

**Benchmark sources:**
- CRO industry surveys (limited public data - use web search for recent reports)
- BioPharma benchmarking services
- Outsourced Pharma / Contract Pharma rate discussions
- ISR Reports CRO analytics

**GLP premium:** GLP-compliant work typically carries 25-50% premium over non-GLP equivalent.

### Hardware / Equipment

**Rate structure:** Unit price, per-spec-class, lease vs. purchase, maintenance-included vs. separate

**Segmentation axes:**
- Equipment type and specification class
- Manufacturer (OEM vs. authorized reseller vs. refurbished)
- Volume (single unit vs. fleet)
- Maintenance: included / separate contract / per-incident

**Search queries:**
- "[equipment type] pricing [spec] [year]"
- "[manufacturer] [model] list price"
- "[equipment category] total cost of ownership"

**Benchmark sources:**
- Manufacturer published list prices (MSRP)
- GSA Advantage (government pricing - often 15-30% below list)
- Reseller/distributor pricing (CDW, SHI, Insight for IT hardware)
- Gartner TCO models for IT infrastructure

**Discount expectations from list:**
```
Standard volume:     15-25% off list
Large volume:        25-40% off list
Strategic/enterprise: 30-50% off list (with multi-year commitment)
End-of-quarter:      Additional 5-15% (timing leverage)
```

## Percentile Calculation Method

A percentile computed from a handful of benchmark points is COARSE, not precise. With N data points, the only percentile values the rank position can produce are multiples of 100/N (for N=5: 0, 20, 40, 50, 60, 80, 100; for N=3: 0, 17, 33, 50, 67, 83, 100). Reporting "P72" or "P74" off 3-5 data points is false precision: the underlying rank cannot land on those numbers. Round to the granularity the data supports, and never report a two-digit percentile more precise than 100/N.

**HARD RULE (kernel-backed gate, never a freehand threshold check).** Before choosing which of the three branches below applies to a rate line, call `percentile_gate(n_points, min_points=5)` from `numeric_kernel.py` with the count of usable data points for that line. Only report a numeric percentile band when it returns True (N >= 5); otherwise follow the 3-4 or exactly-2 branch as the gate result dictates.

When you have 5+ data points for a rate line:

1. Sort all benchmark values ascending.
2. Compute the rank position: `pct = (count of values strictly below supplier rate + 0.5 * count of values equal to supplier rate) / (total values) * 100`.
3. Round to the nearest multiple of 100/N (the real resolution of the sample), and label the band (Below / At / Above / Premium), not a spurious exact number. Example: 4 of 6 sources below the supplier rate -> roughly P67, report as "upper third, Above Market (6 sources)" rather than a fabricated "P72".

When you have 3-4 data points:
- Report the BAND only (Below / At / Above market relative to the median of the points), not a numeric percentile.
- State the count, e.g. "above 3 of 4 sources, Above Market, LOW-MEDIUM confidence."

When you have exactly 2 data points:
- Report as range only, not a percentile or a band.
- Note "insufficient data for percentile positioning."

The illustrative tables in this skill that show a numeric P[XX] are placeholders to be filled ONLY when 5+ data points justify that resolution; otherwise emit the band label and source count in that cell.

**Percentile interpretation:**
- P0-P25: Below market - supplier is competitive; limited room to negotiate further
- P25-P50: Market lower half - good position for Lilly; modest additional savings possible
- P50-P65: Market median zone - acceptable but room for improvement
- P65-P85: Above market - Lilly should push back; target P50 or below
- P85-P100: Premium pricing - strong pushback required; need justification or alternatives

## Rate Normalization Rules

All rates must be converted to common units for comparison:

| Input Format | Normalize To | Conversion |
|---|---|---|
| Annual salary | Hourly rate | ÷ 2,080 (standard hours) |
| Daily rate | Hourly rate | ÷ 8 |
| Monthly fee | Annual | × 12 |
| Per-seat/month | Per-seat/annual | × 12 |
| Per-FTE/month | Hourly equivalent | ÷ 173 (monthly hours) |

**HARD RULE (kernel-backed computation, never freehand division).** Perform every hourly-rate conversion in the table above by calling `to_hourly(value, unit)` from `numeric_kernel.py`, not by dividing freehand. It refuses unknown units rather than guessing a conversion factor.

**Currency:** Normalize to USD using current exchange rates. Note the rate and date used.

**Inflation adjustment:** For benchmarks older than 12 months, apply category-appropriate inflation:
- IT labor: 3-5% annual
- SaaS: 5-8% annual (higher due to feature additions)
- Consulting: 3-5% annual
- Lab services: 2-4% annual
- Hardware: -3-5% annual (deflation for most hardware)

---

## INLINED: references/commercial-briefing-design.md

# Commercial Briefing - Document Design Specification

## Design Principle

The commercial briefing is the pricing intelligence package a procurement rep uses to negotiate rates, fees, and deal structure. It must be designed like a marketing piece: magazine-quality layout with visual hierarchy, table-based design elements, and professional typographic treatment. It should feel like it belongs in the same visual family as the supplier landscape report, the RFP response analysis report, and the contract review summary.

Produce using the `docx` skill. Filename: `[Supplier]_Commercial_Briefing_v[N].docx`.

---

## DOCX Design (Marketing-Piece Style)

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Lilly Red | #E1251B | Title page accent bar, table header rows, Above Market indicators, Premium indicators |
| Dark Red | #521207 | Title page header bar background |
| Charcoal | #212121 | All body text (NOT #000000 per Lilly brand rules) |
| Bold Blue | #0F3A85 | Section header text, Below Market indicators, positive savings callouts, target position labels, benchmark source citations |
| Amber | #B45309 | At Market indicators, walk-away position labels |
| Stone | #E4EBF1 | Callout box backgrounds, label columns in tables |
| Off-White | #F4F7FB | Secondary callout backgrounds (lighter tint than Stone) |

Bold Blue (#0F3A85) is the single canonical name for this hex; no other token may carry it (no Olive/Forest alias). No two tokens share a hex. Per the suite no-green rule, no status indicator renders green or teal; "Below Market" (a good position for Lilly) is signalled in Bold Blue, not green.

**Percentile color scale (for rate benchmark cells):**

| Percentile Range | Cell Background | Text Color | Label |
|-----------------|----------------|------------|-------|
| <=P50 (Below Market) | #D4E5F7 (light blue) | #0F3A85 (Bold Blue) | Below Market |
| P50-P65 (At Market) | #FFF0D8 (light yellow) | #B45309 (Amber) | At Market |
| P65-P85 (Above Market) | #FEF3C4 (light amber) | #E1251B (Lilly Red) | Above Market |
| >P85 (Premium) | #FDE8E5 (light red) | #E1251B (Lilly Red) | Premium |

### Typography

Calibri throughout:
- **Body:** 10.5-11pt, Charcoal (#212121), 1.15 line spacing
- **H1 (section titles):** 14pt, Bold Blue (#0F3A85), bold
- **H2 (subsection titles):** 12pt, Charcoal (#212121), bold
- **H3 (rate line titles):** 11pt, Charcoal (#212121), bold
- **Footnotes / secondary text:** 9pt, gray (#666666)
- **KPI large numbers:** 28-32pt, colored by context
- **Percentile badges:** 10pt, bold, white text on percentile-color background
- **Dollar figures in callouts:** 24pt, bold, Bold Blue (#0F3A85, savings) or Lilly Red (exposure)

### Layout Techniques

**Section number badges:** Use 1x2 table cells as visual section dividers. Left cell: large section number (01, 02, 03...) in 28pt bold, Lilly Red on white. Right cell: section title in H1 style. No visible borders; light bottom border only.

**KPI highlight cards:** 1x4 table row on page 1, below the title page metadata. Each cell contains a large number (28pt, bold, colored) with a label below (9pt, gray). The four KPI cards for a commercial briefing:
1. **Weighted Position** - the band label (Below / At / Above / Premium), or P[XX] only when the per-line samples support that resolution; colored by the percentile scale
2. **Proposed Annual Cost** - dollar figure, Charcoal
3. **Target Savings** - dollar figure and percentage, Bold Blue (#0F3A85)
4. **Rate Lines Analyzed** - count with assessment breakdown in label (e.g., "3 Below / 4 At / 2 Above")

**Rate benchmark table:** The centerpiece of Section 1. Formatted as a proper data table:
- Header row: Lilly Red (#E1251B) background, white text
- Columns: Rate Line | Proposed | Market P25 | Market P50 | Lilly History | Sources (N) | Position | Assessment
- Position column: state the rank against the actual sample (band, or a numeric P[XX] ONLY when 5+ data points justify that resolution per the Percentile Calculation Method); shade the Assessment cell per the percentile color scale above. No green.
- Assessment column: compact badge (colored pill) with label (Below / At / Above / Premium)
- Bottom summary row: bold, Stone background, weighted position (band or P[XX] as the samples allow)

**Rate line detail cards:** For each rate line flagged above target, a bordered table cell:
- Left border: 4pt stripe colored by percentile
- Rate line name in bold
- Proposed vs. Market Median vs. Gap as a compact inline comparison
- Annual exposure calculated and highlighted
- Benchmark sources as a numbered list (9pt)
- Counter-position as a callout line in bold

**Counter-offer strategy table:** comparison table:
- Columns: Rate Line | Proposed | Opening Position | Target Position | Walk-Away Position | Confidence
- Row for each rate line; the Confidence cell is a compact badge (HIGH / MEDIUM / LOW) derived from the benchmark research log for that line (HIGH = 3+ independent sources behind the target; LOW = 0-1 sources, frame as directional)
- Summary row: Annual Totals with savings vs. proposed
- Color-coded: Opening in Bold Blue tint (#D4E5F7), Target in Stone, Walk-Away in amber tint; Confidence badge in Bold Blue (HIGH), amber (MEDIUM), red (LOW)
- Below the table: scripted talking points in callout boxes (Opening Script, Target Justification, Walk-Away Trigger)

**TCO projection:** Rendered as a year-over-year table with:
- Rows: Base Fees, Implementation, Training, T&E, Change Orders, Integration, Admin
- Columns: Year 1, Year 2, ..., Year N, Total, % of Total
- Total row in bold with Lilly Red bottom border
- Key TCO Insights as a 1x3 KPI card row below: Escalation Cost, Hidden Cost Ratio, Year-over-Year Trend

**Volume leverage opportunities:** Table with visual impact ranking:
- Columns: # | Opportunity | Savings | Confidence | Complexity
- Confidence and Complexity cells use colored badges (H=Bold Blue, M=amber, L=red for confidence; reverse the mapping for complexity)
- Total Identified Leverage as a large KPI callout below the table

**Commercial concession ranking:** Three-tier visual:
- HOLD FIRM section: Lilly Red left border, each term as a compact card with dollar impact
- STRATEGIC TRADE section: Amber left border, each term with "trade for" link
- CONCEDE section: Bold Blue (#0F3A85) left border, each term with rationale
- Trade Packages as callout boxes at bottom

**Quick Reference Card:** Final page, single-page designed summary:
- Dark Red header bar with "COMMERCIAL QUICK REFERENCE" in white
- Top strip: Pricing Position badge, Proposed/Target/Walk-Away as a horizontal bar graphic
- Left column: Top Rate Issues (3 items, each a compact row)
- Right column: Key Commercial Holds + Trade Chips (compact lists)
- Footer strip: Leverage Points + Savings Target

**Callout boxes:** 1x1 bordered/shaded table cells (Stone background, thin gray border) for:
- Bottom Line assessment on page 1
- TCO risk factors
- Compliance leverage talking points
- Trade package suggestions

**Lilly logo:** Include on the title page using a bundled transparent Lilly logo from the shared `/mnt/skills/user/lilly-brand-assets-1c344a/assets/logos/` directory (Black or Red variant on light pages, White on dark; backgrounds are transparent). No external skill is required.

### Formatting Rules

- No excessive whitespace; consistent spacing (3-4pt after paragraphs)
- Page breaks before each section number badge
- No orphaned headings
- Tight table cell padding (0.05" vertical, 0.08" horizontal)
- Tables span full page width
- Footer: "Eli Lilly and Company - Confidential - Internal Use Only" left, page number right
- Header (pages 2+): "[Supplier Name] - Commercial Briefing" right-aligned, italic, gray

---

## Document Structure with Design Mapping

### Title Page
- Dark Red (#521207) header bar across top
- Lilly logo centered
- "COMMERCIAL NEGOTIATION BRIEFING" in 20pt bold
- "CONFIDENTIAL - LILLY INTERNAL USE ONLY" subtitle
- Metadata table (Stone background): Supplier, Category, Scope, Proposed Value, Contract Term, Prepared date, Prepared For

### KPI Card Row (page 1, below metadata)
4 KPI cards: Weighted Percentile, Proposed Annual Cost, Target Savings, Rate Lines Analyzed

### Executive Summary (callout box)
- Pricing Position badge (Below/At/Above Market)
- Rate lines breakdown (below/at/above counts)
- Key Findings (top 3, one sentence each)
- Bottom Line (1-2 sentences in bold - "Is this a good deal?" in plain English)

### Section 01: Rate-by-Rate Benchmark Comparison
- Section number badge (01)
- Introductory paragraph on benchmark methodology and data sources
- Full benchmark table with percentile-colored cells
- Rate line detail cards for each above-target line
- Benchmark source notes in 9pt footer

### Section 02: Pricing Model Assessment
- Section number badge (02)
- Current/Proposed Model description as narrative paragraph
- Model Risk assessment as a colored badge
- Modification recommendation table (if applicable): Element | Proposed | Recommended
- Talking points for model change in a callout box

### Section 03: Volume Leverage Opportunities
- Section number badge (03)
- Opportunity table with confidence/complexity badges
- Total Identified Leverage as KPI callout
- Per-opportunity detail cards: Current State, Proposed Change, Savings Basis, Execution Requirements, Supplier Motivation

### Section 04: Total Cost of Ownership
- Section number badge (04)
- Year-over-year TCO table
- TCO Insights as 1x3 KPI row
- TCO Risk factors in a callout box

### Section 05: Counter-Offer Strategy
- Section number badge (05)
- Three-position comparison table (Opening / Target / Walk-Away)
- Scripted talking points in callout boxes
- Per-rate-line counter justifications

### Section 06: Commercial Concession Framework
- Section number badge (06)
- Three-tier concession ranking (Hold Firm / Trade / Concede) with colored stripes
- Trade Package suggestions as callout boxes

### Section 07: Compliance Leverage (conditional)
- Section number badge (07) - only present when compliance findings exist
- Finding cards with dollar impact and talking points
- Pricing drift analysis as a mini table
- Deployment sequencing recommendations

### Section 08: Savings Target & Tracking
- Section number badge (08)
- Savings breakdown table: Proposed | Target | Savings | %
- Savings classification (Hard / Soft / Structural) as a 1x3 KPI row
- Confidence assessment

### Quick Reference Card (final page)
- Single-page designed summary per layout above

---

## Anti-Patterns (Explicitly Prohibited)

1. **No monospace code blocks.** Unicode box-drawing characters (═, ━, ─, ┌, └, ┼) must NOT appear in the DOCX. Use proper table formatting.

2. **No emoji as assessment indicators.** Do not use ✅, ⚠️, 🔴 in the DOCX. Use colored cell backgrounds, colored text, and colored badges.

3. **No flat text lists for rate comparisons.** Each rate line gets a properly formatted table row with percentile-colored cells, or a detail card with a colored stripe.

4. **No key-value dump metadata.** The title page uses a designed metadata table, not a monospaced text block.

5. **No orphaned tables.** Every table has preceding narrative context.

6. **No generic "professional formatting."** Follow the specific design system above.

---

## Content Template (within the design)

The content structure in the commercial-briefing-template (inlined below) remains the canonical source for WHAT goes in each section. This design spec governs HOW it is rendered. When the two are used together:

1. Use the commercial-briefing-template (inlined below) for section content, field definitions, and analytical methodology
2. Use this design spec for visual rendering: colors, typography, layout, card formats, anti-patterns

Where the inlined content template specifies a monospace code block format, render the equivalent content using the designed table/card format from this spec instead.

---

## INLINED: references/commercial-briefing-template.md

# Commercial Briefing Template

Structure for the `commercial_briefing.docx` output. Generate using the `docx` skill with professional formatting - tables, conditional formatting for percentile colors, and clear action items.

---

## Page 1: Cover & Executive Summary

```
COMMERCIAL NEGOTIATION BRIEFING
=================================
CONFIDENTIAL - LILLY INTERNAL USE ONLY

Supplier:           [Name]
Category:           [IT Staff Aug / SaaS / Consulting / Lab / Hardware / Other]
Scope:              [1-2 sentence description]
Proposed Value:     $[total proposed cost] over [term]
Contract Term:      [N] years
Prepared:           [Date]
Prepared For:       [Procurement rep name, if known]

EXECUTIVE SUMMARY
------------------

Pricing Position:     [Below Market / At Market / Above Market]
Weighted Position:    [band, or P[XX] only when the underlying samples support that resolution; volume-weighted against market benchmarks]
Rate Lines Analyzed:  [N]
  Below market:       [N] lines
  At market:          [N] lines
  Above market:       [N] lines

Proposed Annual Cost:   $[amount]
Target Annual Cost:     $[amount]
Potential Savings:      $[amount] ([X]%)

Pricing Model:        [Proposed model] - [Optimal / Suboptimal / Needs Change]
Volume Leverage:      $[available savings from consolidation/commitment]
TCO Risk:             [Low / Medium / High] - [1-sentence basis]

Key Findings:
  1. [Most impactful finding - e.g., "Senior architect rate sits above 6 of 7 benchmark sources, $37/hr above market median (7 sources, HIGH confidence)"]
  2. [Second finding]
  3. [Third finding]

Bottom Line: [1-2 sentences - "Is this a good deal?" in plain English]
```

## Section 1: Rate-by-Rate Benchmark Comparison

Present as a formatted table. Color-code percentile column per the percentile color scale in the design spec: Bold Blue tint (<=P50), yellow (P50-P65), amber (P65-P85), red (>P85). No green.

```
┌──────────────────────┬──────────┬──────────┬──────────┬──────────┬─────────┬───────────────┬───────────┐
│ Rate Line            │ Proposed │ Market   │ Market   │ Lilly    │ Sources │ Position      │ Assessment│
│                      │          │ P25      │ P50      │ History  │ (N)     │               │           │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┼─────────┼───────────────┼───────────┤
│ Sr Cloud Architect   │ $285/hr  │ $225/hr  │ $255/hr  │ $248/hr  │ 6       │ above 5 of 6  │ Above     │
│ Java Developer Sr    │ $175/hr  │ $155/hr  │ $170/hr  │ $168/hr  │ 5       │ at median     │ At Market │
│ QA Engineer Mid      │ $95/hr   │ $100/hr  │ $115/hr  │ $110/hr  │ 4       │ below 3 of 4  │ Below     │
│ [...]                │          │          │          │          │         │               │           │
└──────────────────────┴──────────┴──────────┴──────────┴──────────┴─────────┴───────────────┴───────────┘

NOTES:
- The "Position" column states the rank against the actual sample (e.g. "above 5 of 6 sources"); a numeric P[XX] appears ONLY when 5+ data points justify that resolution, per the Percentile Calculation Method. Do not invent a two-digit percentile off 3-4 points.
- Market data based on [N] sources; see appendix for full source list
- Lilly historical based on [N] invoices/contracts from [date range]
- Rates normalized to [unit] for comparison
- [Any data quality caveats]
```

For each rate line flagged above market (P65+), include a detail block:

```
RATE LINE DETAIL: [Role/SKU]
  Proposed:         $[X]/hr
  Market Median:    $[Y]/hr
  Gap:              +$[Z]/hr (+[N]%)
  Annual Exposure:  $[gap × estimated annual hours] (based on [N] hours projected)
  
  Benchmark Sources:
    1. [Source] ([date]): $[rate] - [geography, context]
    2. [Source] ([date]): $[rate]
    3. [Source] ([date]): $[rate]
  
  Counter-Position: Target $[target rate], citing [specific benchmark]
```

## Section 2: Pricing Model Assessment

```
PRICING MODEL ANALYSIS
=======================

Current/Proposed Model:  [Description]
Model Risk to Lilly:     [Low / Medium / High]

Assessment:
  [2-3 paragraph analysis - why this model does or doesn't serve Lilly]

Recommendation:          [Keep / Modify / Change entirely]

If Modification Recommended:
  ┌────────────────────┬──────────────────────┬──────────────────────┐
  │ Element            │ Proposed              │ Recommended          │
  ├────────────────────┼──────────────────────┼──────────────────────┤
  │ Base structure     │ [e.g., T&M]          │ [e.g., Fixed + T&M]  │
  │ Rate escalation    │ [e.g., CPI-linked]   │ [e.g., 3% annual cap]│
  │ Volume structure   │ [e.g., flat rate]    │ [e.g., tiered]       │
  │ Payment terms      │ [e.g., Net 30]       │ [e.g., Net 60]       │
  │ Commitment         │ [e.g., annual]       │ [e.g., 2-year]       │
  └────────────────────┴──────────────────────┴──────────────────────┘

Talking Points:
  "[How to pitch the model change to the supplier]"
```

## Section 3: Volume Leverage Opportunities

```
VOLUME LEVERAGE ANALYSIS
=========================

┌───┬──────────────────────────┬──────────┬────────────┬────────────┐
│ # │ Opportunity              │ Savings  │ Confidence │ Complexity │
├───┼──────────────────────────┼──────────┼────────────┼────────────┤
│ 1 │ [BU consolidation]       │ $[amt]   │ [H/M/L]   │ [H/M/L]    │
│ 2 │ [Multi-year commitment]  │ $[amt]   │ [H/M/L]   │ [H/M/L]    │
│ 3 │ [Growth commitment]      │ $[amt]   │ [H/M/L]   │ [H/M/L]    │
│ 4 │ [Competitive leverage]   │ $[amt]   │ [H/M/L]   │ [H/M/L]    │
└───┴──────────────────────────┴──────────┴────────────┴────────────┘

TOTAL IDENTIFIED LEVERAGE: $[sum]

For each opportunity, detail block:

OPPORTUNITY [N]: [Title]
  Current State:       [How it works today]
  Proposed Change:     [What to negotiate]
  Savings Basis:       [Show the math]
  Execution Requires:  [What Lilly needs to do - internal alignment, data gathering, etc.]
  Risk:                [What could go wrong]
  Supplier Motivation: [Why supplier might accept - what's in it for them]
```

## Section 4: Total Cost of Ownership

```
TCO PROJECTION - [N]-YEAR VIEW
================================

         Year 1      Year 2      Year 3      Total       % of Total
Base     $[amt]      $[amt]      $[amt]      $[amt]      [X]%
Setup    $[amt]      $0          $0          $[amt]      [X]%
T&E      $[amt]      $[amt]      $[amt]      $[amt]      [X]%
Changes  $[amt]      $[amt]      $[amt]      $[amt]      [X]%
Admin    $[amt]      $[amt]      $[amt]      $[amt]      [X]%
─────────────────────────────────────────────────────────────────
TOTAL    $[amt]      $[amt]      $[amt]      $[amt]      100%

KEY TCO INSIGHTS:
  Escalation Cost:    $[total added cost from rate increases over term]
  Hidden Cost Ratio:  [X]% of total spend is non-base-fee cost
  Year-over-Year:     [trend - flat / increasing / front-loaded]

TCO RISKS:
  1. [Risk]: $[estimated exposure] - [mitigation recommendation]
  2. [Risk]: $[estimated exposure]
```

## Section 5: Counter-Offer Strategy

```
COUNTER-OFFER POSITIONS
=========================

┌──────────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Rate Line            │ Proposed │ Opening  │ Target   │ Walk-Away│
├──────────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Sr Cloud Architect   │ $285/hr  │ $235/hr  │ $255/hr  │ $270/hr  │
│ Java Developer Sr    │ $175/hr  │ $155/hr  │ $168/hr  │ $175/hr  │
│ [...]                │          │          │          │          │
├──────────────────────┼──────────┼──────────┼──────────┼──────────┤
│ ANNUAL TOTAL         │ $[amt]   │ $[amt]   │ $[amt]   │ $[amt]   │
│ SAVINGS vs PROPOSED  │    -     │ $[amt]   │ $[amt]   │ $[amt]   │
│                      │          │ ([X]%)   │ ([X]%)   │ ([X]%)   │
└──────────────────────┴──────────┴──────────┴──────────┴──────────┘

OPENING POSITION SCRIPT:
  "[Exact language the procurement rep can use to anchor the first counter]"

TARGET POSITION JUSTIFICATION:
  "[How to defend the target - cite benchmarks, internal history, competitive data]"

WALK-AWAY TRIGGER:
  "[Under what circumstances to escalate or walk - specific rate thresholds or total cost ceiling]"
```

## Section 6: Commercial Concession Framework

```
COMMERCIAL TERMS - CONCESSION PRIORITY
========================================

HOLD FIRM (do not concede without management approval):
  1. [Term]: $[annual impact] - [rationale]
  2. [Term]: $[annual impact]
  3. [Term]: $[annual impact]

TRADE (use as currency for rate concessions):
  4. [Term]: $[annual impact] - trade for [what]
  5. [Term]: $[annual impact]

CONCEDE (low impact - build goodwill):
  6. [Term]: $[annual impact]
  7. [Term]: $[annual impact]

SUGGESTED TRADE PACKAGES:
  Package A: "Accept [Term 4] + [Term 5] in exchange for [rate reduction target]"
  Package B: "Accept [Term 6] + [Term 7] early; use to pressure [Term 1] + [Term 2]"
```

## Section 7: Compliance Leverage (if applicable)

Include only when _a future skill not in this bundle_ findings are available (optional; proceed without if not installed).

```
PRICING COMPLIANCE FINDINGS
=============================
Source: Contract Compliance Detection
Period: [dates]

Finding: [Description]
  Dollar Impact:     $[amount]
  Contract Clause:   [Reference]
  Relevance:         [How this strengthens the commercial position]
  Talking Point:     "[Scripted language for the rep]"
  When to Deploy:    [During rate discussion / After initial counter / As escalation]

PRICING DRIFT ANALYSIS (for renewals):
  Original Contracted Rate:  $[amount]
  Current Invoiced Rate:     $[amount]
  Drift:                     +$[amount] (+[X]%)
  Implication:               "[Use to justify rate reset to contracted level before discussing any increase]"
```

## Section 8: Savings Target & Tracking

```
SAVINGS TARGETS
================

                        Proposed     Target       Savings      %
Base Rates:             $[amt]       $[amt]       $[amt]       [X]%
Model Changes:          $[amt]       $[amt]       $[amt]       [X]%
Volume Leverage:        $[amt]       $[amt]       $[amt]       [X]%
Eliminated Charges:     $[amt]       $0           $[amt]       100%
────────────────────────────────────────────────────────────────────
TOTAL ANNUAL:           $[amt]       $[amt]       $[amt]       [X]%
TOTAL [N]-YEAR:         $[amt]       $[amt]       $[amt]       [X]%

Savings Classification:
  Hard savings (rate reduction):      $[amt]
  Soft savings (cost avoidance):      $[amt]
  Structural savings (model change):  $[amt]
```

## Quick Reference Card (Final Page)

```
COMMERCIAL QUICK REFERENCE - [Supplier]
=========================================

PRICING POSITION: [band, or P[XX] when sample supports it] against market - [Below/At/Above]
PROPOSED: $[total]  |  TARGET: $[total]  |  WALK-AWAY: $[total]

TOP 3 RATE ISSUES:
  1. [Role/SKU] at $[X] - target $[Y] (cite: [benchmark])
  2. [Role/SKU] at $[X] - target $[Y]
  3. [Role/SKU] at $[X] - target $[Y]

KEY COMMERCIAL HOLDS:
  - [Rate escalation cap at X%]
  - [Volume discount at tier Y]
  - [Rate lock for full term]

LEVERAGE POINTS:
  - $[amount] in [finding type] - use when discussing [rates/audit/terms]
  - [Competitive data point if available]

TRADE CHIPS:
  - [Payment terms] traded for [rate reduction]
  - [Early termination fee] traded for [rate lock]

SAVINGS TARGET: $[amount] ([X]%) - [confidence level]
```

---

## INLINED: examples/commercial_negotiation_dashboard.jsx

Reference implementation of the optional interactive Negotiation Prep dashboard described in "Phase 10: Interactive Negotiation Prep Dashboard" above. LOCKED 4-tab structure (Overview, Benchmarks & ZOPA, Concessions & BATNA, Communication Alignment); only the data changes per run. This is an ADDITIVE companion to the native `.docx` briefing and the two `.xlsx` workbooks (Phase 9) - never a replacement. Illustrative data below uses a neutral example supplier, "Nimbus Cloud Technologies" (a managed cloud hosting and IT professional services renewal); clone the structure, swap the data. Reuses the shared component library and color tokens from lilly-brand-assets' `dashboard-components.md` / `brand-colors.md` verbatim.

```jsx
import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Commercial Negotiation Prep - INTERACTIVE NEGOTIATION PREP DASHBOARD (reference implementation)
// LOCKED structure. See "Interactive Negotiation Prep Dashboard" earlier in this file.
// 4 tabs, identical on every run for every supplier/category. Only the data changes per run.
// This is an ADDITIVE companion to the native DOCX + XLSX briefing (Phase 9); it does not
// replace them. Data below is ILLUSTRATIVE (Nimbus Cloud Technologies, a hosting + managed
// services renewal). Clone the structure, swap the data.
// House style: SUITE STANDARD (Arial body, Georgia titles, dark #212121 header with red rule,
// Lilly-approved palette). Same family as every other suite dashboard. See
// lilly-brand-assets-1c344a, references/dashboard-components.md for component implementations.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green anywhere; positive
// signal uses Bold Blue (BLU) / Neutral Sky (OK), never a "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

const TABS = ["Overview", "Benchmarks & ZOPA", "Concessions & BATNA", "Communication Alignment"];

// --- Currency / percent helpers (copied verbatim from dashboard-components.md) ------------
function f$(v) {
  if (v == null) return "";
  var a = Math.abs(v);
  if (a >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}
function fF(v) { return "$" + Math.round(v).toLocaleString("en-US"); }
function fP(v) { return v == null ? "" : v.toFixed(1) + "%"; }

// --- numeric_kernel.py mirrors (escalate, npv) --------------------------------------------
// Source of truth: commercial-negotiation-prep-1c344a/numeric_kernel.py (vendored from
// lilly-procurement-kernels). Signatures and formulas copied verbatim; do not hand-edit
// the math independently of that file.
//   escalate(base, rate, year, compounding): year is 1-indexed periods elapsed.
//     compounding: base * (1+rate)^year   |   simple: base * (1 + rate*year)
//   npv(cashflows, discount_rate): cashflows[0] is Year-0 (undiscounted); Year n >= 1
//     discounted by n full periods, end-of-year convention.
function escalateJS(base, rate, year, compounding) {
  if (year < 1) return base;
  return compounding ? base * Math.pow(1 + rate, year) : base * (1 + rate * year);
}
function npvJS(cashflows, rate) {
  var total = cashflows[0];
  for (var n = 1; n < cashflows.length; n++) total += cashflows[n] / Math.pow(1 + rate, n);
  return total;
}

// --- Shared components (verbatim from dashboard-components.md) ----------------------------
function Metric({ label, value, sub, accent, warn, good }) {
  var bar = accent ? R : warn ? R : good ? BLU : BD;
  return <div style={{ background: accent ? WARM : warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: accent ? R : MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: warn ? R : good ? BLU : DK, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{sub}</div>}
  </div>;
}
function Card({ title, note, children }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 18, border: "1px solid " + BD, marginBottom: 14 }}>
    {title && <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: DK, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 14, background: R, borderRadius: 2 }} />{title}
      {note && <span style={{ fontFamily: "Arial", fontSize: 10, fontWeight: 600, color: MUT, marginLeft: "auto" }}>{note}</span>}
    </div>}{children}
  </div>;
}
function Pillar({ c, k, t, d }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 16, border: "1px solid " + BD, borderTop: "3px solid " + c, flex: 1, minWidth: 0 }}>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: c }}>{k}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: DK, marginTop: 4 }}>{t}</div>
    <div style={{ fontSize: 11, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{d}</div>
  </div>;
}
function StateBanner({ kind, msg }) {
  var map = { NEEDS_INPUT: [AMB, WARM, "Needs input"], NOT_APPLICABLE: [MUT, CARD, "Not applicable"], RESEARCH_PENDING: [MUT, CARD, "Research pending"] };
  var c = map[kind] || map.NOT_APPLICABLE;
  return <div style={{ background: c[1], border: "1px solid " + c[0] + "55", borderLeft: "4px solid " + c[0], borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: c[0], textTransform: "uppercase" }}>{c[2]}</span>
    <div style={{ fontSize: 12, color: DK, marginTop: 4, lineHeight: 1.5 }}>{msg}</div>
  </div>;
}
// SevPill: severity indicator (Critical/High/Medium/Low). No green; Low = Bold Blue.
const SEV = { Critical: R, High: R, Medium: AMB, Low: BLU };
const SEVBG = { Critical: RISK, High: RISK, Medium: WARM, Low: OK };
function SevPill({ s }) {
  return <span style={{ color: SEV[s], background: SEVBG[s], border: "1px solid " + SEV[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}

// --- Dashboard-specific pills (same color discipline as SevPill; no new hexes) -------------
const ASSESS = { "Below Market": [BLU, OK], "At Market": [AMB, WARM], "Above Market": [R, RISK], "Premium": [R, RISK] };
function AssessPill({ a }) {
  var c = ASSESS[a] || [MUT, CARD];
  return <span style={{ color: c[0], background: c[1], border: "1px solid " + c[0] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{a}</span>;
}
const CONF = { HIGH: [BLU, OK], MEDIUM: [AMB, WARM], LOW: [R, RISK] };
function ConfBadge({ c }) {
  var col = CONF[c] || [MUT, CARD];
  return <span style={{ color: col[0], background: col[1], border: "1px solid " + col[0] + "40", fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{c} confidence</span>;
}
const ALIGN = { DISPUTED: [R, RISK], ALIGNED: [BLU, OK] };
function AlignPill({ s }) {
  var c = ALIGN[s] || [MUT, CARD];
  return <span style={{ color: c[0], background: c[1], border: "1px solid " + c[0] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}

// --- ILLUSTRATIVE DATA (replace entirely per run) ------------------------------------------
// NUMBERS RECONCILE: annualVal(line,"proposed") summed across LINES === meta.proposedAnnual;
// same rollup rule applies to opening/target/walkaway/p50/hist. A cloner MUST preserve this:
// change a line and the KPI row, ZOPA totals, and Negotiation Prep Summary all move together
// because they are computed from LINES below, not hand-typed separately.
const META = {
  supplier: "Nimbus Cloud Technologies",
  category: "Managed Cloud Hosting + IT Professional Services",
  scope: "3-year renewal of production hosting, premium support, EU data-residency add-on and disaster recovery, plus migration/integration labor",
  contractTermYears: 3,
  preparedDate: "July 21, 2026",
  preparedFor: "Global IT Procurement",
  shouldCostAnchor: 3920000,
  recommendedModel: "Hybrid: fixed platform + support fee, capped T&M for migration labor, 3% annual escalation cap",
};

const LINES = [
  { id: 1, name: "Managed Hosting Platform Fee (Production Tier)", unit: "$/yr", proposed: 2150000, low: 1780000, p50: 1950000, high: 2230000, hist: 1890000, sources: 6, opening: 1850000, target: 1980000, walkaway: 2120000, confidence: "HIGH", assessment: "Above Market" },
  { id: 2, name: "Premium Support & SLA Uplift (24x7, Sev-1 15min)", unit: "$/yr", proposed: 340000, low: 255000, p50: 290000, high: 325000, hist: 265000, sources: 5, opening: 262000, target: 288000, walkaway: 312000, confidence: "HIGH", assessment: "Above Market" },
  { id: 3, name: "Data Residency / EU Region Compliance Add-on", unit: "$/yr", proposed: 185000, low: 140000, p50: 158000, high: 178000, hist: 150000, sources: 3, opening: 145000, target: 160000, walkaway: 172000, confidence: "MEDIUM", assessment: "Above Market" },
  { id: 4, name: "Disaster Recovery / Backup Tier", unit: "$/yr", proposed: 210000, low: 195000, p50: 205000, high: 222000, hist: 200000, sources: 4, opening: 198000, target: 208000, walkaway: 218000, confidence: "MEDIUM", assessment: "At Market" },
  { id: 5, name: "Sr Cloud Architect (migration lead)", unit: "$/hr", hours: 1600, proposed: 285, low: 225, p50: 255, high: 278, hist: 248, sources: 6, opening: 232, target: 255, walkaway: 270, confidence: "HIGH", assessment: "Above Market" },
  { id: 6, name: "Cloud Integration Developer (API/ETL)", unit: "$/hr", hours: 2400, proposed: 175, low: 155, p50: 170, high: 182, hist: 168, sources: 5, opening: 158, target: 170, walkaway: 178, confidence: "HIGH", assessment: "At Market" },
  { id: 7, name: "DevOps / SRE Engineer", unit: "$/hr", hours: 1800, proposed: 165, low: 140, p50: 158, high: 172, hist: 150, sources: 3, opening: 144, target: 158, walkaway: 168, confidence: "MEDIUM", assessment: "Above Market" },
  { id: 8, name: "QA Engineer - Mid", unit: "$/hr", hours: 1200, proposed: 95, low: 100, p50: 115, high: 128, hist: 110, sources: 4, opening: 95, target: 110, walkaway: 118, confidence: "MEDIUM", assessment: "Below Market" },
];
function annualVal(line, key) { return line.unit === "$/hr" ? line[key] * line.hours : line[key]; }

// Year-1 recurring run-rate that the escalation-cap lever compounds (the four $/yr lines
// above: platform + support + residency + DR). Migration/integration labor is a declining,
// non-escalating implementation schedule shown separately in the TCO build.
const BASE_YEAR1 = LINES.filter(function (l) { return l.unit === "$/yr"; }).reduce(function (s, l) { return s + l.proposed; }, 0);
const IMPL = { y1: LINES.filter(function (l) { return l.unit === "$/hr"; }).reduce(function (s, l) { return s + annualVal(l, "proposed"); }, 0), y2: 420000, y3: 0 };

const CONCESSIONS = [
  { tier: "HOLD FIRM", note: "Highest economic impact - do not concede without a matching benchmark-justified floor.", terms: [
    { name: "Base platform fee / rate card", impact: 303600, why: "Core of the negotiation; the full per-line target rollup below." },
    { name: "Annual escalation cap (compounding, per Nimbus's own clause language)", impact: 177716, why: "Difference between holding the cap at 3% and the 5% currently on the table, over the 3-year term; see the TCO lever below." },
    { name: "Rate lock for the full 3-year term", impact: 95000, why: "Nimbus has requested an off-cycle re-rate in 2 of the last 3 renewals; lock closes that door." },
  ]},
  { tier: "STRATEGIC TRADE", note: "Moderate impact - useful as currency, not worth losing the deal over.", terms: [
    { name: "Change order / scope-change markup (T&M vs fixed-rate)", impact: 42000, tradeFor: "Multi-year volume-commitment discount tier" },
    { name: "Payment terms (Net 45 vs Net 60)", impact: 28000, tradeFor: "0.5-point reduction on the platform fee (about $11K/yr)" },
  ]},
  { tier: "CONCEDE", note: "Low impact - give early to build goodwill and earn reciprocity.", terms: [
    { name: "Auto-renewal notice window (90 to 60 days)", impact: 6000, why: "Low direct cost; offer as the Round 1 opener." },
    { name: "Invoice frequency (monthly vs biweekly)", impact: 4000, why: "Purely procedural; concede immediately." },
  ]},
];

const ROUNDS = [
  { n: 1, label: "Opening", objective: "Anchor low on the base platform fee and escalation cap; establish market-benchmarked credibility.", moves: ["Open at the aggregate Opening position ($3.58M), citing the P25-P40 benchmark band and the should-cost anchor.", "Concede invoice frequency immediately as a low-cost goodwill signal."], risk: "Nimbus may push back hard on the residency add-on price in isolation. Low relationship risk; this is a routine commercial ask." },
  { n: 2, label: "Middle", objective: "Trade payment terms and the renewal-notice window for movement on the base fee and the escalation cap.", moves: ["Offer Net 45 (up from insisting on Net 60) and a 60-day renewal notice in exchange for a 3-4% escalation cap and movement toward the per-line Target position.", "Hold the data-residency and DR lines separate from the base-fee discussion (see Communication Alignment)."], risk: "Nimbus may try to re-couple residency pricing to the base-fee discount as a package. Hold the two apart; they are different commercial questions." },
  { n: 3, label: "Close", objective: "Lock the Target position using the 3-year volume commitment as the final lever; apply BATNA pressure if needed.", moves: ["Offer the 3-year commitment explicitly as the rate-lock trigger for the full term.", "Reference the Meridian Systems alternative (BATNA) if Nimbus will not move off a walk-away-adjacent number."], risk: "If Nimbus's final offer exceeds the per-line Walk-Away rollup or the escalation cap exceeds 6%, execute the BATNA transition plan rather than accept it." },
];

const BATNA = {
  alternative: "Meridian Systems",
  basis: "Shortlisted in the original RFP; scored 8% lower than Nimbus on relationship depth and implementation experience, but priced at an estimated $3.95M/yr all-in per their RFP submission (2 independent quotes on file).",
  value: 3950000,
  switchingCost: 410000,
  breakEvenMonths: 14,
  trigger: "Initiate transition planning with Meridian if Nimbus's final offer exceeds the per-line Walk-Away rollup, or if the escalation cap exceeds 6%.",
};

const ALIGNMENT = [
  { topic: "Data Residency Commitment", status: "DISPUTED",
    a: { channel: "Email", date: "Jun 13, 2026", who: "Nimbus Sales Director", text: "Confirmed - all Lilly production data will remain in the EU-West region for the duration of the agreement, per your compliance requirement." },
    b: { channel: "Scoping Call", date: "Jul 1, 2026", who: "Nimbus Solutions Engineer", text: "EU-West is our default, but disaster recovery failover currently routes through our US-East facility; a fully EU-contained DR posture would be a custom SKU with an incremental fee." },
    implication: "The $185K/yr Data Residency add-on may not cover DR failover as understood. Re-confirm the residency commitment in writing, or re-scope the $210K/yr DR line, before signing. Flag to legal-negotiation-prep." },
  { topic: "Annual Escalation Cap", status: "DISPUTED",
    a: { channel: "Email", date: "May 28, 2026", who: "Nimbus Account Executive", text: "We're comfortable capping annual increases at 4% for a 3-year term." },
    b: { channel: "Renewal Proposal (PDF)", date: "Jun 20, 2026", who: "Nimbus, standard terms section", text: "Annual fee adjustment: per CPI, uncapped." },
    implication: "The written proposal does not reflect the verbal 4% cap. Treat 4% as a soft anchor only, not a confirmed starting point, until Nimbus corrects the proposal document. Resolve before Round 1 of the escalation-cap negotiation." },
  { topic: "Support SLA Response Time", status: "ALIGNED",
    a: { channel: "Kickoff Call", date: "Apr 10, 2026", who: "Nimbus Delivery Lead", text: "15-minute response time for Sev-1 tickets, 24x7." },
    b: { channel: "SOW Draft", date: "Jun 5, 2026", who: "Nimbus, SOW Section 4.2", text: "Sev-1 response target: 15 minutes, 24x7x365." },
    implication: "Consistent across channels; no action needed. Retained here to show the check covers confirmations, not only disputes." },
];

// --- ZOPA bullet-row chart (per-line range/target/walk-away/proposed marker) ---------------
function fmtLine(line, v) { return line.unit === "$/hr" ? ("$" + v.toFixed(0) + "/hr") : f$(v); }
function ZopaRow({ line }) {
  var padLow = Math.min(line.low, line.opening) * 0.94;
  var padHigh = Math.max(line.walkaway, line.proposed) * 1.06;
  var span = padHigh - padLow;
  function pct(v) { return Math.max(0, Math.min(100, (v - padLow) / span * 100)); }
  var aboveWalk = line.proposed > line.walkaway;
  var bandLeft = pct(Math.min(line.target, line.walkaway));
  var bandWidth = Math.abs(pct(line.walkaway) - pct(line.target));
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{line.name}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <ConfBadge c={line.confidence} />
          <AssessPill a={line.assessment} />
        </div>
      </div>
      <div style={{ position: "relative", height: 26, background: CARD, borderRadius: 6 }}>
        <div style={{ position: "absolute", left: pct(line.low) + "%", width: (pct(line.high) - pct(line.low)) + "%", top: 6, height: 14, background: BD, border: "1px solid " + MUT + "66", borderRadius: 4 }} title="Market range (low to high)" />
        <div style={{ position: "absolute", left: bandLeft + "%", width: bandWidth + "%", top: 2, height: 22, background: OK + "cc", border: "1px dashed " + BLU, borderRadius: 4 }} title="ZOPA band (target to walk-away)" />
        <div style={{ position: "absolute", left: pct(line.p50) + "%", top: 0, width: 2, height: 26, background: MUT }} title={"Market median: " + fmtLine(line, line.p50)} />
        <div style={{ position: "absolute", left: "calc(" + pct(line.opening) + "% - 5px)", top: 8, width: 10, height: 10, borderRadius: "50%", background: BLU, border: "2px solid #fff" }} title={"Suggested opening: " + fmtLine(line, line.opening)} />
        <div style={{ position: "absolute", left: "calc(" + pct(line.proposed) + "% - 6px)", top: -3, width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "10px solid " + (aboveWalk ? R : AMB) }} title={"Supplier proposed: " + fmtLine(line, line.proposed) + (aboveWalk ? " (exceeds walk-away)" : "")} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT, marginTop: 3, flexWrap: "wrap", gap: 4 }}>
        <span>Opening {fmtLine(line, line.opening)}</span>
        <span>Target {fmtLine(line, line.target)}</span>
        <span>Median {fmtLine(line, line.p50)}</span>
        <span>Walk-away {fmtLine(line, line.walkaway)}</span>
        <span style={{ color: aboveWalk ? R : DK, fontWeight: aboveWalk ? 700 : 400 }}>Proposed {fmtLine(line, line.proposed)}{aboveWalk ? " - exceeds walk-away" : ""}</span>
      </div>
    </div>
  );
}

function TotalDealBand({ totals }) {
  var padLow = totals.opening * 0.94, padHigh = totals.proposed * 1.06, span = padHigh - padLow;
  function pct(v) { return Math.max(0, Math.min(100, (v - padLow) / span * 100)); }
  var aboveWalk = totals.proposed > totals.walkaway;
  return (
    <div style={{ marginTop: 4, paddingTop: 14, borderTop: "1px solid " + BD }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: DK, marginBottom: 6 }}>Total-Deal ZOPA - Annualized TCO Band</div>
      <div style={{ position: "relative", height: 30, background: CARD, borderRadius: 6 }}>
        <div style={{ position: "absolute", left: pct(totals.target) + "%", width: (pct(totals.walkaway) - pct(totals.target)) + "%", top: 3, height: 24, background: OK + "cc", border: "1px dashed " + BLU, borderRadius: 4 }} />
        <div style={{ position: "absolute", left: pct(totals.p50) + "%", top: 0, width: 2, height: 30, background: MUT }} />
        <div style={{ position: "absolute", left: "calc(" + pct(totals.opening) + "% - 6px)", top: 9, width: 12, height: 12, borderRadius: "50%", background: BLU, border: "2px solid #fff" }} />
        <div style={{ position: "absolute", left: "calc(" + pct(totals.proposed) + "% - 7px)", top: -4, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "12px solid " + (aboveWalk ? R : AMB) }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginTop: 4, flexWrap: "wrap", gap: 6 }}>
        <span><b style={{ color: BLU }}>Opening</b> {f$(totals.opening)}</span>
        <span><b style={{ color: DK }}>Target</b> {f$(totals.target)}</span>
        <span>Median {f$(totals.p50)}</span>
        <span><b style={{ color: AMB }}>Walk-away</b> {f$(totals.walkaway)}</span>
        <span style={{ color: R, fontWeight: 700 }}>Proposed {f$(totals.proposed)}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  var _t = useState("Overview"); var tab = _t[0]; var setTab = _t[1];
  var _cap = useState(5.0); var capRate = _cap[0]; var setCapRate = _cap[1];
  var _comp = useState(true); var compounding = _comp[0]; var setCompounding = _comp[1];

  var totals = useMemo(function () {
    var out = { proposed: 0, opening: 0, target: 0, walkaway: 0, p50: 0, hist: 0 };
    LINES.forEach(function (l) {
      out.proposed += annualVal(l, "proposed");
      out.opening += annualVal(l, "opening");
      out.target += annualVal(l, "target");
      out.walkaway += annualVal(l, "walkaway");
      out.p50 += annualVal(l, "p50");
      out.hist += annualVal(l, "hist");
    });
    return out;
  }, []);

  var combinedTarget = 0.35 * META.shouldCostAnchor + 0.40 * totals.p50 + 0.25 * totals.hist;
  var aboveCount = LINES.filter(function (l) { return l.assessment === "Above Market"; }).length;
  var atCount = LINES.filter(function (l) { return l.assessment === "At Market"; }).length;
  var belowCount = LINES.filter(function (l) { return l.assessment === "Below Market"; }).length;
  var savingsAtTarget = totals.proposed - totals.target;
  var savingsPct = (savingsAtTarget / totals.proposed) * 100;

  // Escalation-cap -> multi-year TCO lever (recomputes live from capRate/compounding).
  var lever = useMemo(function () {
    var rate = capRate / 100;
    function build(r) {
      var y1Base = BASE_YEAR1, y2Base = escalateJS(BASE_YEAR1, r, 1, compounding), y3Base = escalateJS(BASE_YEAR1, r, 2, compounding);
      var tcoY1 = y1Base + IMPL.y1, tcoY2 = y2Base + IMPL.y2, tcoY3 = y3Base + IMPL.y3;
      var tcoTotal = tcoY1 + tcoY2 + tcoY3;
      var flat = BASE_YEAR1 * 3 + IMPL.y1 + IMPL.y2 + IMPL.y3;
      return { y1Base: y1Base, y2Base: y2Base, y3Base: y3Base, tcoY1: tcoY1, tcoY2: tcoY2, tcoY3: tcoY3, tcoTotal: tcoTotal, flat: flat, escImpact: tcoTotal - flat, npv: npvJS([0, tcoY1, tcoY2, tcoY3], 0.08) };
    }
    return { current: build(rate), atTarget: build(0.03), atWalkaway: build(0.06) };
  }, [capRate, compounding]);

  var capBand = capRate <= 3 ? "at/below target" : capRate <= 6 ? "between target and walk-away" : "beyond walk-away";
  var capColor = capRate <= 3 ? BLU : capRate <= 6 ? AMB : R;

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Commercial Negotiation Prep | Interactive Prep Dashboard</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.supplier} - {META.category}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{META.preparedDate} | {META.contractTermYears}-year term<br />Prepared for {META.preparedFor}</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto" }}>
        {TABS.map(function (t) {
          var active = t === tab;
          return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}</button>;
        })}
      </div>

      <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {tab === "Overview" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Metric label="Weighted Position" value="Above Market" sub={aboveCount + " of " + LINES.length + " lines above"} warn />
            <Metric label="Proposed Annual Cost (Yr 1)" value={f$(totals.proposed)} sub={fF(totals.proposed) + " / yr"} />
            <Metric label="Target Savings" value={f$(savingsAtTarget)} sub={fP(savingsPct) + " vs proposed"} good />
            <Metric label="Rate Lines Analyzed" value={LINES.length} sub={belowCount + " Below / " + atCount + " At / " + aboveCount + " Above"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card title="Negotiation Prep Summary" note="Sets the ZOPA opening">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}><tbody>
                <tr><td style={{ padding: "7px 4px", color: MUT, borderBottom: "1px solid " + BD }}>Should-Cost Anchor</td><td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid " + BD }}>{fF(META.shouldCostAnchor)}</td><td style={{ padding: "7px 4px", fontSize: 10, color: MUT, borderBottom: "1px solid " + BD }}>weight 0.35, from should-cost-builder</td></tr>
                <tr><td style={{ padding: "7px 4px", color: MUT, borderBottom: "1px solid " + BD }}>Market Benchmark (blended P50)</td><td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid " + BD }}>{fF(totals.p50)}</td><td style={{ padding: "7px 4px", fontSize: 10, color: MUT, borderBottom: "1px solid " + BD }}>weight 0.40, this briefing's research</td></tr>
                <tr><td style={{ padding: "7px 4px", color: MUT, borderBottom: "1px solid " + BD }}>Lilly Historical Average</td><td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid " + BD }}>{fF(totals.hist)}</td><td style={{ padding: "7px 4px", fontSize: 10, color: MUT, borderBottom: "1px solid " + BD }}>weight 0.25, internal spend history</td></tr>
                <tr><td style={{ padding: "9px 4px", fontWeight: 700 }}>Recommended Model</td><td colSpan={2} style={{ padding: "9px 4px", fontSize: 11 }}>{META.recommendedModel}</td></tr>
                <tr style={{ background: OK }}><td style={{ padding: "9px 4px", fontWeight: 700, color: BLU }}>Combined Target</td><td style={{ padding: "9px 4px", textAlign: "right", fontWeight: 700, color: BLU, fontFamily: "Georgia,serif", fontSize: 15 }}>{fF(combinedTarget)}</td><td style={{ padding: "9px 4px", fontSize: 10, color: BLU }}>sets the ZOPA opening on the next tab</td></tr>
              </tbody></table>
            </Card>
            <Card title="Reading the Summary">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>The top-down Combined Target ({fF(combinedTarget)}) and the bottom-up per-line Target rollup ({fF(totals.target)}) converge within {fP(Math.abs(combinedTarget - totals.target) / totals.target * 100)}, which is the kind of agreement between two independent methods that makes a target defensible in the room: it is not just one benchmark read, it is should-cost, market research, and Lilly's own spend history all pointing to the same $3.8-3.9M band.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>{aboveCount} of {LINES.length} rate lines price above market, concentrated in the platform fee, support uplift, residency add-on and two of the four labor roles. The QA Engineer line already sits below market and needs no pushback. Weighted across the full deal, Nimbus's proposal carries roughly {fP(savingsPct)} of headroom before it clears the market median band, which is the number to open with.</p>
            </Card>
          </div>
        </div>}

        {tab === "Benchmarks & ZOPA" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
            <Card title="ZOPA by Line Item" note={LINES.length + " rate lines"}>
              {LINES.map(function (l) { return <ZopaRow key={l.id} line={l} />; })}
              <TotalDealBand totals={totals} />
            </Card>
            <Card title="Reading the ZOPA Chart">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>The blue dashed band on each row is the zone of possible agreement: target on the left, walk-away on the right. The red flag marks where Nimbus's ask lands; five of eight lines fall to the right of the band's midpoint, and none currently exceeds its own walk-away line, which means there is room to negotiate without an early escalation.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}><b>Hold hardest</b> on the Hosting Platform Fee and the Sr Cloud Architect rate: both carry HIGH confidence (6 independent sources each) and the largest dollar gaps to target ({fF(LINES[0].proposed - LINES[0].target)} and {fF((LINES[4].proposed - LINES[4].target) * LINES[4].hours)} respectively at full volume).</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The Data Residency add-on carries only MEDIUM confidence (3 sources) - defensible as directional, not a firm anchor. See Communication Alignment before pricing that line at all; the DR failover commitment behind it is disputed.</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 4 }}>
            <Card title="Escalation Cap -> Multi-Year TCO" note="Negotiation lever - drag to model">
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginBottom: 4 }}>
                  <span>Annual escalation cap</span>
                  <span style={{ fontWeight: 700, color: capColor, fontFamily: "Georgia,serif", fontSize: 16 }}>{capRate.toFixed(1)}%</span>
                </div>
                <input type="range" min={0} max={8} step={0.5} value={capRate} onChange={function (e) { setCapRate(parseFloat(e.target.value)); }} style={{ width: "100%", accentColor: capColor }} />
                <div style={{ position: "relative", height: 16, fontSize: 9, color: MUT }}>
                  <span style={{ position: "absolute", left: "37.5%", transform: "translateX(-50%)" }}>Target 3%</span>
                  <span style={{ position: "absolute", left: "75%", transform: "translateX(-50%)" }}>Walk-away 6%</span>
                  <span style={{ position: "absolute", left: "90%", transform: "translateX(-50%)" }}>CPI history ~7.2%</span>
                </div>
                <div style={{ fontSize: 11, color: capColor, fontWeight: 700, marginTop: 14 }}>Currently {capBand}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={function () { setCompounding(true); }} style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 14, border: "1px solid " + (compounding ? BLU : BD), background: compounding ? OK : "#fff", color: compounding ? BLU : MUT, cursor: "pointer" }}>Compounding</button>
                <button onClick={function () { setCompounding(false); }} style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 14, border: "1px solid " + (!compounding ? BLU : BD), background: !compounding ? OK : "#fff", color: !compounding ? BLU : MUT, cursor: "pointer" }}>Simple</button>
                <span style={{ fontSize: 10, color: MUT, alignSelf: "center" }}>Nimbus's clause reads "each year builds on the prior year" - compounding is the correct reading.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Metric label="Year 2 Base Fees" value={f$(lever.current.y2Base)} sub={"Yr 1 was " + f$(BASE_YEAR1)} />
                <Metric label="Year 3 Base Fees" value={f$(lever.current.y3Base)} />
                <Metric label="3-Yr TCO (nominal)" value={f$(lever.current.tcoTotal)} sub="base + implementation" accent />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <Metric label="Escalation Impact vs Flat" value={f$(lever.current.escImpact)} sub="added cost from the cap alone" warn />
                <Metric label="3-Yr TCO, NPV @ 8%" value={f$(lever.current.npv)} sub="pro-forma-builder discount convention" />
              </div>
            </Card>
            <Card title="Reading the Lever">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>At the current {capRate.toFixed(1)}% cap, the 3-year TCO is {f$(lever.current.tcoTotal)}, or {f$(lever.current.escImpact)} above a flat, unescalated baseline. Holding the cap at the 3% target instead saves {f$(lever.current.tcoTotal - lever.atTarget.tcoTotal)} over the term versus the current position.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Letting the cap drift to the 6% walk-away line costs {f$(lever.atWalkaway.tcoTotal - lever.atTarget.tcoTotal)} more than holding at target, which is the number to use when framing why the cap deserves a HOLD FIRM posture in the Concessions tab rather than trade-bait.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Nimbus's written proposal currently states an uncapped, CPI-linked adjustment (see Communication Alignment) - roughly 7.2% on recent history. Anchoring the room on 3%, with 6% as the line beyond which Lilly walks, keeps the ask inside a range Nimbus has already verbally accepted (4%) while leaving room to trade.</p>
            </Card>
          </div>
        </div>}

        {tab === "Concessions & BATNA" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
            <div>
              <Card title="Commercial Concession Ranking" note="by annual $ impact">
                {CONCESSIONS.map(function (group) {
                  var stripe = group.tier === "HOLD FIRM" ? R : group.tier === "STRATEGIC TRADE" ? AMB : BLU;
                  return <div key={group.tier} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: stripe, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{group.tier}</div>
                    <div style={{ fontSize: 11, color: MUT, marginBottom: 6 }}>{group.note}</div>
                    {group.terms.map(function (t, i) {
                      return <div key={i} style={{ borderLeft: "3px solid " + stripe, background: "#fff", borderRadius: 6, padding: "8px 10px", marginBottom: 6, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{t.tradeFor ? "Trade for: " + t.tradeFor : t.why}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: stripe, fontFamily: "Georgia,serif", flexShrink: 0 }}>{fF(t.impact)}/yr</div>
                      </div>;
                    })}
                  </div>;
                })}
              </Card>
              <Card title="Concession Sequencing - Negotiation Rounds">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {ROUNDS.map(function (rnd) {
                    return <div key={rnd.n} style={{ background: "#fff", border: "1px solid " + BD, borderTop: "3px solid " + BRN, borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: BRN, textTransform: "uppercase", letterSpacing: "0.05em" }}>Round {rnd.n} - {rnd.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: DK, marginTop: 4, marginBottom: 6 }}>{rnd.objective}</div>
                      <ul style={{ margin: "0 0 6px", paddingLeft: 16, fontSize: 11, color: DK, lineHeight: 1.5 }}>
                        {rnd.moves.map(function (mv, i) { return <li key={i}>{mv}</li>; })}
                      </ul>
                      <div style={{ fontSize: 10, color: AMB, borderTop: "1px solid " + BD, paddingTop: 6, marginTop: 6 }}><b>Risk:</b> {rnd.risk}</div>
                    </div>;
                  })}
                </div>
              </Card>
            </div>
            <div>
              <Pillar c={BLU} k={fF(BATNA.value)} t={"BATNA - " + BATNA.alternative} d={BATNA.basis} />
              <div style={{ height: 12 }} />
              <Card title="BATNA and Walk-Away Trigger">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 10 }}><tbody>
                  <tr><td style={{ padding: "6px 4px", color: MUT, borderBottom: "1px solid " + BD }}>Alternative value</td><td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid " + BD }}>{fF(BATNA.value)}/yr</td></tr>
                  <tr><td style={{ padding: "6px 4px", color: MUT, borderBottom: "1px solid " + BD }}>Switching cost</td><td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid " + BD }}>{fF(BATNA.switchingCost)} one-time</td></tr>
                  <tr><td style={{ padding: "6px 4px", color: MUT }}>Break-even</td><td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700 }}>{BATNA.breakEvenMonths} months</td></tr>
                </tbody></table>
                <div style={{ fontSize: 12, color: DK, lineHeight: 1.6 }}>{BATNA.trigger}</div>
              </Card>
              <Card title="Reading the Sequence">
                <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The three HOLD FIRM terms total {fF(CONCESSIONS[0].terms.reduce(function (s, t) { return s + t.impact; }, 0))}/yr in combined value, over 20 times the {fF(CONCESSIONS[2].terms.reduce(function (s, t) { return s + t.impact; }, 0))}/yr on the table in CONCEDE items. Give the cheap items away early in Round 1 to build reciprocity credit, then spend that credit pulling on the two STRATEGIC TRADE terms in Round 2 before touching the base fee or the escalation cap at all. Meridian's {fF(BATNA.value)}/yr all-in bid sits inside the Total-Deal ZOPA band, which is exactly what makes it a credible walk-away reference rather than a bluff.</p>
              </Card>
            </div>
          </div>
        </div>}

        {tab === "Communication Alignment" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Commitment Integrity Check" note={ALIGNMENT.length + " topics reviewed"}>
              {ALIGNMENT.map(function (item, i) {
                return <div key={i} style={{ border: "1px solid " + BD, borderLeft: "4px solid " + (item.status === "DISPUTED" ? R : BLU), borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{item.topic}</div>
                    <AlignPill s={item.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: CARD, borderRadius: 6, padding: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.a.channel} - {item.a.date}</div>
                      <div style={{ fontSize: 10, color: MUT, marginBottom: 4 }}>{item.a.who}</div>
                      <div style={{ fontSize: 11, color: DK, fontStyle: "italic" }}>"{item.a.text}"</div>
                    </div>
                    <div style={{ background: CARD, borderRadius: 6, padding: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.b.channel} - {item.b.date}</div>
                      <div style={{ fontSize: 10, color: MUT, marginBottom: 4 }}>{item.b.who}</div>
                      <div style={{ fontSize: 11, color: DK, fontStyle: "italic" }}>"{item.b.text}"</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: DK, marginTop: 8, lineHeight: 1.5 }}><b style={{ color: item.status === "DISPUTED" ? R : BLU }}>{item.status === "DISPUTED" ? "Implication: " : "Note: "}</b>{item.implication}</div>
                </div>;
              })}
            </Card>
            <Card title="Reading the Alignment Check">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Mined from the rep's own Outlook and Teams history with Nimbus ({ALIGNMENT.filter(function (a) { return a.status === "DISPUTED"; }).length} of {ALIGNMENT.length} topics reviewed here contradict across channels). This is not a communications audit for its own sake: both disputes sit directly on top of commercial terms already in play elsewhere in this briefing.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>The escalation-cap dispute matters most: the 4% figure driving the "currently accepted" framing on the TCO lever is a verbal-only commitment that the written proposal does not reflect. Get it in writing before Round 1, or open the negotiation from the proposal's uncapped CPI language instead.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The residency dispute is a legal exposure, not just a commercial one - route it to legal-negotiation-prep alongside this briefing. The one ALIGNED topic (support SLA) is shown for balance: the check surfaces confirmations as well as contradictions, not only bad news.</p>
            </Card>
          </div>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Interactive companion to the Commercial Negotiation Briefing (.docx) and rate_comparison.xlsx / counter_offer.xlsx</div>
        <div>Company Confidential | Commercial Negotiation Prep | 2026</div>
      </div>
    </div>
  );
}
```

