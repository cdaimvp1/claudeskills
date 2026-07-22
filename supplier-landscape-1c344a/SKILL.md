---
name: supplier-landscape-1c344a
description: >
  Supplier Market Landscape and Shortlist Generator for enterprise sourcing decisions. Use when
  users need to identify potential vendors before an RFP, ask who to talk to or what vendors
  exist for a category, provide a business need and want supplier recommendations, or need a
  defensible evidence-based supplier shortlist. Accepts sparse input (single sentence) to rich
  context (full business case). Produces Top 10 supplier shortlist with profiles, fit analysis,
  risk assessment, and next-step recommendations. Triggers on "find vendors for", "who should
  we talk to", "what vendors exist for", "supplier landscape for", "market scan for a category",
  "shortlist for".
  BOUNDARY: this skill scans a MARKET to build a shortlist of many candidate suppliers before
  an RFP. For a deep single-supplier profile or due-diligence dossier on ONE named vendor, use
  supplier-deep-dive instead.
metadata:
  suite: v10.6.6
---

> **Build discipline (G10):** This skill emits a large single-file artifact. Assemble it across multiple writes, never one create_file call: scaffold first (imports, component shell, export), then append one section per write to /mnt/user-data/outputs, and run a structural self-test before present_files. A single oversized write can truncate the file mid-stream. Full rule: lilly-brand-assets guardrail G10.


<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Internal footprint: add one 'Active at Lilly' line to each shortlisted profile (active-vendor yes/no, trailing spend, payment terms, IKC risk flag) and let incumbency inform the recommendation.
- SEC: add a financial-health read for each publicly traded shortlist name in the risk assessment, with a filing citation.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


Suite: v10.6.6

<!-- MERGED PACKAGE (v10.6.6): All reference, example, and component files are inlined at the end of this document. When the skill text says "read references/foo.md" or "load references/foo.md" or "see references/foo.md", the content is already present below under the heading matching that filename (the pointers are reworded "(inlined below)" at each site). Do NOT attempt to read files from disk; they are here. -->

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
- **Skill:** Supplier Landscape
- **Version:** 2.5
- **Suite:** v10.6.6
- **Last Updated:** July 21, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)
- **Changelog:** (newest first)
  - v2.5 (July 2026): Executive Summary tab gains the signature Fit x Risk Segmentation plane (a quadrant positioning every evaluated vendor by weighted fit score against a derived 0-5 risk index, with two live-recomputing threshold sliders) paired with a Segments card (Leader / Challenger / Niche / Caution tiles plus a Disqualified tile, each with vendor chips and a synthesis paragraph), and a Market Structure card (share-of-fit stacked bar with HHI / Top-1 / Top-3 concentration stats, explicitly labeled "share of fit, not market share," paired with a Concentration Read narrative). The Recommendation card is expanded (still the same card, not a new one) with an "also in the running" runner-up list, an "eliminated before the shortlist" list, a fixed-taxonomy Next Action chip with rationale, and data-basis coverage chips, backed by two new companion arrays (`EXCLUDED`, `NEXT_ACTION`) that mirror the existing `excluded_vendors.csv` and Step 6 next-action schema. Risk Assessment tab gains a Cross-vendor risk roll-up heatmap (dimension x vendor severity grid, adding Legal & Regulatory and ESG as dimensions) ahead of the existing per-vendor risk cards. Head-to-Head tab gains a Competitive Dynamics strip (leader gap, vendors within band, clear-leader/close-race/fragmented-field read) computed from the full ranking, ahead of the existing pairwise selector. Added an optional `inc` (incumbent) boolean field to the vendor data shape (additive, defaults falsy). No tabs added, removed, or reordered; all five canonical tabs and every existing element are unchanged in place and structure.
  - v2.4 (June 2026): v10.6.3 fix pass. Removed the residual brief-mode language and JSON enum (this skill has no brief mode). Removed the off-allow-list cloud-drive entry from internal-search sources, leaving the M365 connector (SharePoint / OneDrive / Outlook / Teams) only. Canonicalized the palette to one set with the #0F3A85 token named "Bold Blue" and no green in any status band; removed the dead retired BRN token; fixed the changelog/canonical-doc/code palette-naming drift. Example dashboard S array now carries all 10 evaluated vendors. Overall score (os) is now DERIVED from the per-category sc weighted average in code (it can no longer drift from the live data, fixing the prior hardcoded 8.70 vs computed 8.88). Made the dashboard category-neutral: the requirements table is "all categories" not a fixed 15, and the KPI/profile templates no longer hardcode the supply-chain-planning "years in SCP" field. Scoped the no-"+" content rule to DOCX prose and switched the dashboard strength marker to a non-"+" tick. Pinned the heatmap WEIGHTED AVERAGE summary row so sorting cannot reorder it into the data. Quoted the description triggers and added a supplier-deep-dive BOUNDARY guard.
  - v2.3 (May 2026): All-vendor dashboard parity (vendors 6-10 in main S array, all 5 tabs). Page breaks restricted to title page and TOC only. Authorship line made generic (not hardcoded to any user). Citation rules added: internal docs cite full title/version/section; external web sources include URL; analyst reports cite title/author/date. Updated the inlined dashboard-canonical spec tab specs to explicitly reference all evaluated vendors in every tab.
  - v2.2 (May 2026): Dashboard re-skinned to the SHARED SUITE house style (Arial + Georgia, charcoal #212121 header with red rule, the shared suite palette of Red / Charcoal / Bold Blue accents, Metric/Card/STable/SevPill/Pillar components). Retired the RFx-only DM Sans / #521207 dark-red / Stone-Forest palette so all suite dashboards are one visual family. Five-tab structure unchanged.
  - v2.1 (May 2026): LOCKED canonical dashboard (the dashboard-canonical spec plus the canonical dashboard example JSX, both inlined below). Five mode-invariant tabs identical across Full Report and Supplement modes and every category; content varies, structure does not. Every tab always renders (labeled states). Depth parity from internal and external research, never fabrication. Category-neutral KPI labeling.
  - v2.0 (May 2026): Scoring matrix, contract flexibility, ESG, research methodology, section depth requirements, requirements-as-input best practice, universal commodity support
  - v1.0: Initial release
- **Suite-wide guardrails note:** The shared Execution Guardrails G1-G10 (tool selection, gate checks, existing-context-first, definition tracing, data-model-first for dashboards, pre-delivery self-test, research minimums, pass-artifact enforcement, anti-collapse) apply to every run of this skill. This is a cross-cutting suite convention, not a per-skill version; see the GLOBAL OPERATING RULES (Rule 9) above for the full G1-G10 text.

# Supplier Market Landscape & Shortlist Generator

## Purpose

Take any input from a single sentence to a full business case and produce a defensible, evidence-based supplier landscape answering: **"Who are the top 10 suppliers that best fit this need - and why?"**

This skill is used **before an RFP exists**.

## Workflow

### Step 1: Mode Selection (mandatory first interaction)

Before any analysis, ask exactly once, as tappable single-select:

> "Do you want a full landscape built from scratch, or to supplement a list you already have?"
>
> - **Full Report** -- build a complete Top-10 supplier landscape from internal and external research.
> - **Supplement** -- keep the suppliers you already have as fixed entries and add newly researched suppliers to fill out the shortlist (no duplicates).

Do not generate both. Do not proceed without an answer.

### Step 2: Clarifying Questions (strict rules)

Ask **only if required** to avoid nonsense output, and only as the single consolidated prompt in "Complete Input Collection" below, not a separate round. Maximum 3 questions (per Global Operating Rule 2's 1-to-3 cap), drawn from this list:

- Must-have capabilities or constraints
- Disqualifiers (deal breakers)
- Required integrations (e.g., SAP, M365)
- Regulatory or data sensitivity requirements
- Budget range or urgency (if relevant)

**Never ask about**: RFP format, scoring weights, evaluation process - that's downstream.

### Step 3: Internal Research Pass (Priority #1)

If M365 or internal search is available, search for:

- Active or former suppliers providing similar capabilities
- Existing contracts, SOWs, or POs
- Prior evaluations or assessments
- Internal presentations or vendor decks
- Known blocked or disqualified vendors

**Rules for internal suppliers**:
- Include in Top 10 if they match the need
- Flag as "Existing Vendor"
- They are NOT auto-recommended - must pass fit/risk logic

### Step 4: External Research Pass (Priority #2)

Identify up to 10 suppliers based on:

- Capability alignment
- Industry fit (especially regulated industries like pharma)
- Enterprise maturity
- Deployment model
- Geographic coverage (if relevant)

**Evidence discipline** - for every supplier:
- Separate facts from inference
- Explicitly mark "Information Not Provided" or "Not Publicly Disclosed"
- Never invent pricing, certifications, customers, or financials

### Step 5: Generate Outputs

Produce all required outputs per the output schemas (output-schemas, inlined below):

1. **supplier_landscape_report.docx** - Main report (marketing-piece-quality design, Lilly branded)
2. **supplier_landscape_dashboard.jsx** - Interactive companion dashboard (**MUST use `create_file` to ensure shareability**)
3. **supplier_registry.csv** - Structured supplier data
4. **requirements_fit_matrix.csv** - Fit analysis per requirement
5. **risk_matrix.csv** - Risk assessment per supplier
6. **supplier_landscape_ui.json** - Structured data for UI rendering
7. **excluded_vendors.csv** - Disqualifier audit trail: every vendor that surfaced in research but was kept OFF the shortlist, with the reason (failed disqualifier, out of scope, insufficient evidence, duplicate, or buyer-excluded). Columns: `vendor_name,reason_code,reason_detail,source,date`. This makes the shortlist defensible by showing what was considered and why it was dropped, not just what made the cut. If no vendors were excluded, emit the file with a single row stating "none excluded".

See the report-structure section (inlined below) for report templates.

### Step 6: Recommendation

End with explicit guidance:

- **Top 3** strongest candidates with rationale
- **Eliminations** - who should be removed and why
- **Next action**:
  - Proceed to RFP?
  - Run pilot / POC?
  - Engage incumbents directly?
  - Re-scope requirements?
  - Eliminate category?

## Input Handling

**Minimum input** (allowed): One sentence describing what the user is trying to buy.

Example: *"We need a SaaS tool to manage third-party vendor risk globally."*

**Optional inputs** (any combination):
- Business case (PDF/DOCX)
- Requirements matrix
- Prior RFPs
- Internal policy docs (security, privacy, legal)
- Prior vendor decks
- Current supplier lists
- Known disqualifiers
- Budget or timeline hints

**Conflict rule**: If inputs conflict, do not resolve silently. Flag conflicts explicitly.

## Guardrails (hard rules)

- **No fabricated data** - never invent information
- **No "helpful" assumptions** - mark unknowns explicitly
- **No boilerplate filler** - every sentence must add value
- **Always decision-oriented** - outputs support procurement decisions
- **Examples = structure only** - never copy example content into real outputs

## Supplement Mode

This is the Supplement path selected via the Step 1 mode-selection question above (do not ask the mode question a second time here). If the user already has a partial supplier list:

**If supplementing:**
1. Accept the user's existing vendors as fixed entries (include in the Top 10 regardless of research findings)
2. Do not duplicate existing vendors in search results
3. Position new findings relative to existing vendors (e.g., "This vendor is a direct competitor to [existing Vendor A] with stronger analytics but weaker integration")
4. Fill remaining slots (up to 10 total) with new research
5. Mark existing vendors as "User-Provided" in the supplier registry; new vendors as "Research-Identified"

## Citation Discipline for Market Research

All market intelligence must follow these rules:

**Source tiers:**
| Tier | Source Type | Reliability | Example |
|------|-----------|-------------|---------|
| 1 | Published analyst reports (Gartner, Forrester, Everest, IDC) | High | "Gartner Magic Quadrant for CLM, Oct 2025" |
| 2 | Company filings, press releases, verified databases | High | "10-K filing, SEC EDGAR, FY2025" |
| 3 | Industry publications, trade press | Medium | "Healthcare IT News, Jan 2026" |
| 4 | Job postings, LinkedIn, marketing materials | Low | Flag as "Unverified marketing claim" |

**Rules:**
- Cite report title, publisher, and date for every market claim
- Never reproduce Gartner/Forrester quadrant positions or specific scores -- paraphrase as "positioned as a leader in the [X] category by [Analyst], [Year]"
- When only gated content is available, note: "Based on publicly available summary; full report behind paywall"
- When only marketing materials are available, flag confidence as Low
- Never fabricate market size numbers, growth rates, or competitive positions

## Market Context Output

In addition to supplier profiles, produce a `market_context` object in `landscape_handoff.json` per the sibling rfp-engine skill's landscape-intake schema. (That schema lives in the rfp-engine skill, which is the consumer of this handoff. If rfp-engine is not installed, still emit the object using the Market Context Schema inlined below in this file, so the handoff is complete and self-describing.) This includes:
- Porter's Five Forces assessment
- Market size and growth (if findable from public sources)
- Pricing trends and model prevalence
- Key market trends (3-5) with impact on Lilly
- Key risks
- Sources consulted with dates

This market context flows into rfp-engine to enrich the Background section of the instructions document and into the evaluation criteria.

## Landscape Handoff

At the end of Step 5, produce `landscape_handoff.json` per the landscape-intake schema owned by the sibling rfp-engine skill (the consumer of this handoff). This is the formal handoff contract between supplier-landscape and rfp-engine. If rfp-engine is not installed, emit the handoff using the Market Context Schema and supplier fields inlined below, and label it as a self-describing draft so a later rfp-engine run can ingest it.

## Universal Commodity Support

This skill works across ALL procurement categories, not just IT. Sourcing domains include but are not limited to:
- Enterprise SaaS / Cloud Software
- Professional Services / Consulting
- Lab & Clinical Services (CROs, assay services, bioanalytics)
- Chemicals & Raw Materials
- Equipment & Instrumentation
- Facilities & Real Estate Services
- Contingent Labor / Staff Augmentation
- Marketing & Creative Services
- Logistics & Transportation
- Construction & Capital Projects
- Manufacturing & CMO Services

Adapt research strategy, profile fields, and risk categories to the sourcing domain. The output schema is universal; the content varies by commodity.

## Weighted Scoring Matrix (Full Report Mode)

When producing a Full report, include a formal weighted scoring matrix in addition to the qualitative fit analysis. The matrix makes the recommendation defensible and comparable.

**Default weights (user may customize):**

| Category | Weight | What It Measures |
|----------|--------|-----------------|
| Alignment to Business Need | 30% | How well the supplier's offering matches Lilly's requirements |
| Technical/Operational Capabilities | 15% | Platform maturity, scalability, integration readiness |
| Risk Profile | 15% | Legal, cybersecurity, operational, geopolitical, ESG |
| Pricing Model | 15% | Competitiveness, transparency, flexibility |
| Contract Flexibility | 10% | Willingness to negotiate, template flexibility (take-it-or-leave-it vs fully negotiable MSA) |
| Lilly Vendor Status | 5% | Existing relationship, prior performance, active MSA |
| Industry/Regulatory Experience | 5% | Pharma, life sciences, regulated industry track record |
| Integration Fit | 5% | SAP, M365, Ariba, Veeva, Workday compatibility |

**Scoring:** Rate each supplier 0-10 per category. Multiply by weight. Sum for final weighted score. Include 1-sentence rationale per score.

**Output:** Include the scored matrix as a table in the report and as its own artifact, `weighted_scoring_matrix.csv` (the 8-pillar percentage-weighted category matrix). Do NOT write it to `requirements_fit_matrix.csv`, which is reserved for the per-requirement, requirement-count-weighted scores (see CSV Schemas). `supplier_registry.csv` carries supplier profile data only, not scores.

**Note:** These are two distinct scoring systems. The dashboard headline "weighted score" (the supplier ranking and the per-vendor Weighted Score KPI) is derived from the requirements-fit, requirement-count-weighted scores in `requirements_fit_matrix.csv`; the 8-pillar percentage-weighted Weighted Scoring Matrix above is a separate report table (`weighted_scoring_matrix.csv`) and does not feed the dashboard headline number.



## Comparative Summary Table (Both Modes)

Always produce a side-by-side comparison with standardized columns:

| Supplier | Fit to Need | Financial Health | Risk | Pricing Model | Contract Flexibility | Lilly Vendor Status | Industry Fit | Integration | ESG | Overall Assessment |
|----------|------------|-----------------|------|---------------|---------------------|---------------|-------------|-------------|-----|---------|

Use numeric scores from the scoring matrix.

## Enhanced Supplier Profile Fields

Add these fields to every supplier profile (in addition to existing fields):

**Contract Flexibility:** Assess the supplier's negotiation posture. Rate as High / Moderate / Low (same scale as the Contracting Considerations subsection):
- "High" -- will work with Lilly's MSA, open to custom terms
- "Moderate" -- standard agreement with some flexibility on commercial terms
- "Low" -- non-negotiable terms, clickwrap or standard ToS only

**ESG / Sustainability:** Elevate from a sub-item of risk to a standalone profile field:
- Sustainability commitments and certifications
- Diversity certifications (SBE, MBE, WBE, etc.)
- Carbon/environmental initiatives
- Rate as "Strong / Moderate / Limited / Not Disclosed" (same scale as the ESG & Sustainability subsection)

**Top Pharma/Life Sciences Clients:** List known regulated-industry clients, especially pharmaceutical. Up to 10 if publicly disclosed. Note: "Not publicly disclosed" if not findable.

## Research Methodology Section

Every report must include a Research Methodology section (max 1 page) documenting:
- Sources consulted (by tier: analyst reports, filings, trade press, marketing materials)
- Inclusion/exclusion criteria for the supplier shortlist
- Date research was conducted
- Any assumptions made (e.g., pricing inferred from public data, market size from gated reports)
- Limitations (e.g., private company financials not available, gated analyst content not accessible)

## Section Depth Requirements

Minimums ensure the analysis has substance. Maximums prevent bloat. Claude should aim for the minimum and exceed it when the data warrants -- not pad to fill space.

| Section | Requirement |
|---------|-----------|
| Executive Summary | Min 1 page, max 3 pages |
| Per-Supplier Profile (Top 5) | Min 1 page, max 2 pages (all 12 subsections) |
| Per-Supplier Profile (6-10) | Min 0.5 page condensed |
| Comparative Table | Min 1 table, expand to 2 pages if 7+ suppliers |
| Scoring Matrix | Min 1 page with full weighted calculation and rationale |
| Requirements Fit Scoring | Per-vendor tables + cross-vendor comparison |
| Market Context | Min 1 page, max 3 pages (Porter's Five Forces, trends, pricing) |
| Research Methodology | Min 0.5 page, max 1 page |
| Recommendation | Min 1 page with primary, secondary, tradeoffs, and next steps |

**Quality over length.** A 0.5-page supplier profile that captures business model, fit assessment, top risk, and pricing model is better than a 2-page profile padded with marketing language. If a section hits the minimum and has said everything material, stop.

## Requirements Document as Input (Best Practice, Not Required)

After collecting the initial description of what the user is sourcing, ask:

> "Do you have a **requirements document** for this sourcing event? (A spreadsheet or list of functional, technical, and operational requirements.) This isn't required, but if you have one, I'll use the actual requirements to score each supplier's fit instead of inferring from their marketing materials. It makes the shortlist significantly more accurate."

**If provided:** Read the requirements. Use them to:
- Score supplier alignment against specific requirements (not general capabilities)
- Identify which requirements are commonly met vs. niche (helps predict competitive field)
- Weight the scoring matrix categories based on requirement distribution (if 40% of requirements are demand planning, that category carries more weight)
- Flag requirements that may narrow the field to very few suppliers (potential disqualifiers)

**If not provided:** The skill needs to understand the business need through other means. Ask:

> "No problem. To make sure I find the right suppliers, I need to understand what you're looking for. A few options:
>
> 1. **Upload other documents** that describe the need -- business cases, project proposals, presentations, budget requests, prior RFPs, internal memos, stakeholder emails. Anything that explains what you're trying to accomplish.
> 2. **Explain it to me in detail** -- what problem are you solving, what capabilities matter most, what systems does it need to work with, how many users, what's the budget range, what's the timeline?
> 3. **Let me interview you** -- I'll ask targeted questions based on the sourcing domain to build out the requirements together.
>
> The more context I have, the better the shortlist. A sentence gets you a generic landscape. A detailed description or a few uploaded documents gets you a shortlist you can actually act on."

Adapt the interview questions to the sourcing domain. For SaaS: integration, user count, data sensitivity, deployment model. For professional services: scope, timeline, team size, required expertise. For lab services: assay types, throughput, regulatory requirements. For equipment: specifications, throughput, compliance standards.

After gathering context through any of these paths, synthesize into a working requirements set that drives the supplier scoring. Note in the report which requirements were provided vs. developed through conversation.

## Enforced Research Methodology

The supplier landscape skill MUST follow a two-phase, multi-pass research methodology. Do NOT generate the report until minimum research thresholds are met.

**Pass artifacts (per Execution Guardrails G8).** Each phase produces a named artifact that must exist before the next begins: SL_1_BROADSCAN (10-15 candidate universe with one-line positioning + the Phase 1 research log, presented to the user for confirmation), SL_2_DEEPDIVE (top-5 profiles with the per-vendor research log meeting the minimums), SL_3_SCORING (weighted scoring matrix + requirements-fit tables), SL_4_REPORT (DOCX + dashboard + CSVs). If you are generating the report or dashboard without SL_1-SL_3 complete, STOP, you collapsed the workflow, go back.

### Phase 1: Broad Scan (Minimum 3 searches)

Purpose: Identify the initial vendor universe (10-15 candidates).

Required searches:
1. "[category] software vendors [year] Gartner Magic Quadrant" -- analyst positioning
2. "[category] vendors [industry] [specific domain]" -- industry-specific players
3. "[category] vendor comparison review [year]" -- competitive analyses and user reviews

Output: An initial list of 10+ candidates with one-line positioning for each. Present to user for confirmation before proceeding to Phase 2.

### Phase 2: Deep Dive (Minimum 5 searches per top-5 vendor)

Purpose: Build comprehensive profiles for the top 5 vendors.

Required searches per vendor (minimum 5, target 8):
1. "[vendor] revenue employees funding financial health [year]" -- financials
2. "[vendor] [category] capabilities platform features" -- product depth
3. "[vendor] pharmaceutical life sciences clients case studies" -- industry experience
4. "[vendor] implementation methodology timeline approach" -- deployment model
5. "[vendor] pricing model licensing SaaS subscription" -- commercial structure

Additional searches as needed:
6. "[vendor] SAP S/4HANA integration" or "[vendor] [target ERP] integration" -- integration specifics
7. "[vendor] user reviews Gartner Peer Insights G2" -- customer sentiment
8. "[vendor] recent news acquisitions partnerships [year]" -- current developments

For each search, use `web_fetch` on the most relevant result to read the full page content instead of relying on search snippets. Snippets give you a sentence. Full pages give you paragraphs with context, financials, client names, and implementation details.

### Research Tracking

Track research passes explicitly. Before generating the report, verify:

```
RESEARCH COMPLETENESS CHECK
Phase 1: [N] broad searches completed (minimum 3)
Phase 2 deep dives:
  Vendor 1: [N] searches + [N] full-page reads (minimum 5 searches)
  Vendor 2: [N] searches + [N] full-page reads (minimum 5 searches)
  Vendor 3: [N] searches + [N] full-page reads (minimum 5 searches)
  Vendor 4: [N] searches + [N] full-page reads (minimum 5 searches)
  Vendor 5: [N] searches + [N] full-page reads (minimum 5 searches)
Vendors 6-10: [N] total searches (minimum 1-2 per vendor)
TOTAL: [N] searches, [N] full-page reads
```

Do NOT generate the report if Phase 2 minimums are not met. Tell the user: "I need [N] more research passes on [vendors] before I can produce a report at the required depth. Continuing research."



## Required 12-Subsection Vendor Profile Template

Every vendor profile in the top 5 MUST cover ALL of the following content areas. The profile should read as a coherent narrative about the supplier, not a checklist of fields. Open each profile with a 2-3 paragraph narrative introduction, then organize the remaining content into headed subsections with flowing prose, proper bulleted lists, and compact data tables where appropriate.

### Profile Opening (Narrative Introduction)

Start each supplier profile with 2-3 paragraphs of connected prose introducing the company: who they are, how long they've been in business, their market position (Gartner/analyst recognition), their relevance to this specific evaluation, their financial posture, and their pharma/life sciences footprint. This should read like a magazine profile, not a data table. Follow with a compact KPI card showing 4-5 critical numbers (revenue, employees, years focused on the relevant category, pharma %, fit score). Choose the "domain depth" metric to fit the commodity being sourced (for example years in the category, relevant deployments, or certified practitioners); do not hardcode a single domain's metric.

### Subsections (Narrative with Supporting Data)

Each subsection below should contain at least one full paragraph of connected prose. Use proper bulleted lists for genuinely list-worthy items. Use compact tables only for numeric comparisons.

1. **Financial Health:** Write a paragraph on the company's financial position, citing specific revenue figures, growth rates, profitability, and balance sheet health. For public companies, reference market cap and debt levels. For private companies, note what is and isn't disclosed. A compact 3-4 row financial summary table can follow the narrative.

2. **Alignment to Requirements:** Map capabilities against actual requirement categories. Write a paragraph summarizing overall fit, then use a scored table (10-point scale with rationale per category). Highlight where the vendor excels and where gaps exist.

3. **Strengths & Differentiators:** Write as flowing prose with bold-label-then-description entries. Each strength gets a bold name followed by 2-3 sentences of explanation and evidence. Not raw bullet fragments.

4. **Limitations & Risks:** Same treatment as strengths. Bold label, then explanation with mitigation notes. Organized by risk category (legal, cyber, operational, geopolitical, financial).

5. **Business & Pricing Model:** Write a paragraph describing the pricing structure, then a compact pricing summary table if specific figures are available.

6. **Contracting Considerations:** Narrative paragraph on contracting posture. Rate flexibility as High / Moderate / Low with explanation.

7. **Lilly Vendor Status:** Current / Former / New / In Process with context.

8. **Key Clients & Partners:** Narrative paragraph, then a bulleted list of named clients (especially pharma) and implementation partners.

9. **Regulatory & Industry Experience:** Narrative paragraph. Rate depth as Extensive / Significant / Growing / Limited.

10. **Integration Fit:** Narrative paragraph on how the vendor connects to Lilly's stack. Rate as Excellent / Good / Moderate / Poor.

11. **ESG & Sustainability:** Brief paragraph. Rate as Strong / Moderate / Limited / Not Disclosed.

12. **Implementation Approach:** Methodology, typical timeline, SI partners, and team composition.

### Vendors 6-10: Condensed Profiles

For vendors ranked 6-10, produce a condensed narrative profile in the DOCX report: 2-3 paragraph overview, one paragraph on why they weren't shortlisted, and a single-row entry in the comparative summary table.

**Dashboard data parity (critical):** In the dashboard, vendors 6-10 MUST be included in the same `S` data array as the top 5, with the same data shape (all fields populated: overview, whyLilly, solution, arch, str[], rsk[], reqNarr, commNarr, opsNarr, clients, ecosystem, esg{r,d}, and the per-category scores sc{}). The overall score `os` is not authored per vendor; it is derived in code from `sc`. Content will be shorter than the top-5 profiles but the structure must be identical so all 10 vendors appear in ALL 5 dashboard tabs: the Deep Dive selector, the Requirements Heatmap columns, the Risk Assessment cards, and the Head-to-Head comparison selector. Do NOT create a separate condensed array that only renders in the Executive Summary. The dashboard is the interactive companion; a stakeholder should be able to drill into any of the 10 evaluated vendors from any tab.

## Minimum Content Depth

| Section | Minimum Length |
|---------|---------------|
| Executive Summary | 500 words |
| Market Context (with Porter's Five Forces) | 800 words |
| Per top-5 vendor profile | 800 words each |
| Per vendor 6-10 condensed profile | 200 words each |
| Requirements Coverage Matrix | Full table, all categories x all top 5 vendors (DOCX); all categories x ALL evaluated vendors (dashboard) |
| Scoring Matrix | Full table with 1-sentence rationale per score |
| Recommendation | 400 words with specific next steps |
| Research Methodology | 200 words with sources by tier |
| TOTAL MINIMUM | ~8,000 words |

Do NOT produce a report under 8,000 words for a Full report. If the content falls short, the research was insufficient -- go back and do more searches.

## Report Formatting Standards

The report is a deliverable for executive and stakeholder consumption. It should be designed like a marketing piece: magazine-quality layout with visual hierarchy, table-based design elements, and professional typographic treatment.

### DOCX Design (Magazine Report house style)

This report uses the suite **Magazine Report** house style. Do not restate the spec here; follow the canonical references and pull exact values from them so the document matches every other suite report:
- **Title page, Table of Contents, header, footer, page setup (LOCKED):** `/mnt/skills/user/lilly-brand-assets-1c344a/references/docx-title-page-spec.md`. This skill's report title is **"SUPPLIER MARKET LANDSCAPE"**; the subtitle is the sourcing event or category; metadata line 1 reflects this skill's counts (e.g., "{N} Vendors Evaluated | {N} Categories"); metadata line 2 is "Prepared by Eli Lilly and Company | {Month Year}". Everything left-aligned.
- **Colors, fonts, section badges, KPI cards, callouts, tables:** `/mnt/skills/user/lilly-brand-assets-1c344a/references/docx-design-system.md` and `/mnt/skills/user/lilly-brand-assets-1c344a/references/brand-colors.md`.
- **Which house style applies and why:** `/mnt/skills/user/lilly-brand-assets-1c344a/references/house-styles.md`.
- **Lilly logo** on the title page from `/mnt/skills/user/lilly-brand-assets-1c344a/assets/logos/` (Black or Red on light pages); if unavailable, extract it from a prior report in the conversation.

**Formatting rules:** No excessive whitespace, consistent spacing (200 twips after for body, 264 twips line spacing), tight table cell padding (60 top/bottom, 100 left/right). Page breaks ONLY after the title page and after the Table of Contents page. Do NOT insert page breaks between supplier profiles, sections, or anywhere else in the body. Let content flow naturally with section badges and headings providing visual separation.

**Authorship line:** The title page "Prepared by" line must NOT be hardcoded to any specific person, title, or team name. Use a generic default ("Prepared by Eli Lilly and Company | [current month/year]") unless the user explicitly provides an author name or team. Do not pull authorship from memory, conversation context, or inferred user identity. The skill is used across all categories and commodities by any procurement rep.

**Citation rules (mandatory for Research Methodology and all sourced claims):**
- **Internal documents:** Cite the full document title, version/date, and relevant section or clause number (e.g., "2024 Concur Technologies GTC, enUS.v.2-2022b, Section 4.3" or "Scenario Planning RFP Functional Requirements Matrix, v1.0, May 2023, Demand Planning tab").
- **External web sources:** Include the source name, publication date (or "as of" date), and the full URL (e.g., "Kinaxis Q4 2025 Earnings Press Release, March 5, 2026, https://ir.kinaxis.com/..."). URLs enable the reader to verify the claim independently.
- **Analyst reports:** Cite the report title, author(s), publisher, and publication date (e.g., "Gartner Magic Quadrant for Supply Chain Planning Solutions: Process Industries, Pia Orup Lund et al., March 18, 2026"). Do not include URLs for paywalled analyst content.
- **Confidence flags:** Every external figure in the Research Methodology section carries a High / Medium / Low confidence flag per the suite standard.

### Dashboard (supplier_landscape_dashboard.jsx)

**CRITICAL: MUST be created using `create_file` directly to `/mnt/user-data/outputs/`. Never use `bash_tool` with cat/heredoc. Files written via bash do not register as shareable artifacts.**

The dashboard is the interactive companion to the DOCX report. It must match the report's depth -- every narrative section in the report should have a corresponding panel in the dashboard with equivalent analytical content. A sparse dashboard with single-paragraph tabs is not acceptable.

**The dashboard structure is LOCKED and mode-invariant. Follow the canonical dashboard structure (dashboard-canonical, inlined below), demonstrated by the canonical dashboard example JSX (supplier_landscape_canonical_dashboard, inlined below).** The same five tabs, sub-sections, components, palette, and layout appear on every run, in Full Report mode and Supplement mode alike, and for every category or commodity. Clone the reference and swap the data; do not redesign, add, drop, reorder, or rename tabs per run. Every tab always renders: when an area is less applicable or its data is genuinely undisclosed (for example, a private company's financials), show a labeled state (NEEDS_INPUT / NOT APPLICABLE with a reason / RESEARCH PENDING) rather than a blank panel. Achieve depth parity through the internal and external research the workflow specifies, never by fabricating suppliers, scores, or figures (Global Rule 3). The tab specification below is the canonical content map.

**Tab 1: Executive Summary**
- 4 KPI cards across the top (Vendors Evaluated, Total Requirements, Top Weighted Score, Recommended supplier)
- Two-column layout: Evaluation Summary card (a narrative describing the sourcing need, how the field was narrowed, and the ranked supplier list) and Recommendation card (one-line rationale for the primary and secondary vendors)
- Vendor ranking as a horizontal weighted-score bar chart (10-point scale, weighted by requirement count). All evaluated vendors (including ranks 6-10, which live in the same data array) appear in the ranking; there is no separate condensed-vendor section on this tab
- Fit x risk segmentation plane: a two-card row pairing an interactive scatter (every evaluated vendor positioned by weighted fit score against a derived risk index, with draggable fit-threshold and risk-threshold sliders that reclassify vendors live) with a "Segments" card of segment tiles (Leader / Challenger / Niche / Caution counts, description, and vendor chips per segment, plus a "Disqualified pre-shortlist" tile and a narrative on what the current segmentation means for the shortlist)
- Market Structure panel: a two-card row with HHI / Top-1 share / Top-3 share KPIs and a stacked share-of-fit bar (explicitly labeled "share of fit, not market share"), paired with a "Concentration read" narrative card interpreting the shortlisted field's competitiveness

**Tab 2: Supplier Deep Dive** (dropdown vendor selector)
- 5 KPI cards per vendor (Weighted Score, Fit Score, Employees, Revenue, Domain Depth -- the sector-fit field, labeled for the category)
- 6 sub-section tabs: Profile & Fit, Solution & Architecture, Strengths & Risks, Requirements Analysis, Commercial & Operational, Clients & Ecosystem
- **Profile & Fit:** Two-column layout: full overview narrative (minimum 1 substantial paragraph) plus "Why This Vendor for Lilly" card. 8-field attribute grid below.
- **Solution & Architecture:** Full paragraph on the platform architecture and a separate card on financial health with narrative.
- **Strengths & Risks:** Two-column layout. Strengths as full-sentence entries with a CSS-drawn bullet marker (a small colored shape, not a typed "+"). Risks with severity tags (Low/Medium/High) and category labels. Severity legend at bottom.
- **Requirements Analysis:** Explanatory paragraph on the scoring scale, then a full requirements-category table (one row per evaluated category for THIS sourcing event, whatever the count) with score badges and a weighted-average row. Do not hardcode a fixed number of categories: the categories are whatever the requirements document or the inferred capability themes yield for the commodity at hand. Scores on the 10-point scale.
- **Commercial & Operational:** 2x2 grid of narrative cards: Contracting, Regulatory, Implementation, Integration. Each card has a label header and minimum one full paragraph.
- **Clients & Ecosystem:** Full paragraph listing named clients and system integrator partners.

**Tab 3: Requirements Heatmap**
- Introductory paragraph explaining the color scale and weighting methodology
- Full cross-vendor comparison table (all requirement categories x ALL evaluated vendors) with color-coded score cells
- Analysis paragraph below the table identifying which vendor leads each category and calling out notable patterns

**Tab 4: Risk Assessment**
- Introductory paragraph defining severity scale and risk categories
- Per-vendor risk cards with severity-tagged risk items in a responsive grid
- Cross-cutting observations card at the bottom synthesizing the overall risk landscape

**Tab 5: Head-to-Head Comparison** (dual dropdown selectors)
- Side-by-side vendor summary cards with score, attributes, and financial status
- Full category-by-category comparison table with delta column and explanatory paragraph
- Contextual tradeoff analysis card at the bottom providing specific narrative comparison (e.g., "Kinaxis offers broader coverage; OMP offers deeper production planning")

**Dashboard Design Rules (suite house style):** follow `/mnt/skills/user/lilly-brand-assets-1c344a/references/dashboard-components.md` (components, color tokens, and the Layout Shell header/footer), `/mnt/skills/user/lilly-brand-assets-1c344a/references/brand-colors.md` (palette), and `/mnt/skills/user/lilly-brand-assets-1c344a/references/house-styles.md` (Magazine Report dashboard chrome + the top-right Lilly logo). This dashboard's footer reads "Company Confidential | supplier-landscape | procurement guidance, not legal advice." Every tab has narrative, not just tables (see `/mnt/skills/user/lilly-brand-assets-1c344a/references/narrative-standards.md`). Clone the canonical dashboard example JSX (supplier_landscape_canonical_dashboard, inlined below) and swap the data.

### Multi-Pass Generation

For reports covering 5+ suppliers, the DOCX may exceed what can be generated in a single pass. Use sequential passes:
1. **Pass 1:** Title page, executive summary, market context, first 3 supplier profiles. Save.
2. **Pass 2:** Open saved document, append remaining supplier profiles. Save.
3. **Pass 3:** Open saved document, append cross-vendor comparison, requirements fit matrix, risk matrix, recommendation. Save.

Every section must maintain full depth regardless of which pass generates it.

## Requirements Fit Scoring (10-Point Scale)

Do NOT use "Strong / Moderate / Limited" for requirements coverage. These labels provide no differentiation between vendors.

Use a 10-point numeric scale with up to 2 decimal places:
- 9.00-10.00: Mature, proven native capability with pharma-specific depth
- 7.00-8.99: Solid capability, may require configuration or lacks pharma-specific proof points
- 5.00-6.99: Capability exists but is nascent, requires significant configuration, or depends on partner/integration
- 3.00-4.99: Minimal capability, would require custom development or external tool
- 0.00-2.99: Not addressed by the platform

Score based on: (1) breadth of coverage within the category, (2) depth/maturity of the capability, (3) pharmaceutical-specific features, (4) evidence from deployments or case studies.

**Example:** For Production Planning (36 requirements):
- OMP: 9.50 (purpose-built for process manufacturing, campaign scheduling, shelf-life, 20+ pharma deployments)
- Kinaxis: 8.25 (strong concurrent planning but detailed scheduling via OEM partner PlanetTogether)
- o9: 8.00 (capable but pharma manufacturing depth unproven)
- Oracle: 7.50 (functional but not differentiated for pharma)
- Blue Yonder: 7.75 (Detailed Scheduling module is strong but limited pharma manufacturing evidence)

## Per-Supplier Requirements Fit Table

Each top-5 supplier profile MUST include its own requirements fit scoring table. This table appears within the Alignment to Requirements subsection of that vendor's profile.

Format per vendor:

```
[VENDOR NAME] -- Requirements Fit Assessment
| Requirement Category (# reqs) | Score | Rationale |
|-------------------------------|-------|-----------|
| Demand Planning (78)          | 8.75  | [1-2 sentence explanation of score] |
| Inventory Planning (46)       | 9.00  | [1-2 sentence explanation of score] |
| ...                           | ...   | ... |
| WEIGHTED AVERAGE              | X.XX  | [Based on requirement count weighting] |
```

The Rationale column is critical -- it explains WHY the vendor received that score, citing specific product features, known deployments, or gaps. Without rationale, the number is meaningless.

## Cross-Vendor Requirements Comparison Table

In addition to per-vendor tables, produce a single cross-vendor comparison table (Section 6) using the same 10-point scale:

```
| Requirement Category (# reqs) | o9 | OMP | Kinaxis | Oracle | Blue Yonder |
|-------------------------------|:---:|:---:|:---:|:---:|:---:|
| Demand Planning (78)          | 8.75 | 9.00 | 8.50 | 8.00 | 8.25 |
| ...                           | ... | ... | ... | ... | ... |
| WEIGHTED AVERAGE              | X.XX | X.XX | X.XX | X.XX | X.XX |
```

This table provides the at-a-glance comparison. The per-vendor tables provide the rationale.

## Complete Input Collection

This is the single consolidated prompt referenced in Step 2 (Clarifying Questions); it is the same interaction, not a second round of questions. After the user describes what they're sourcing and provides requirements (or context in lieu of requirements), collect the following before proceeding. Ask in a single consolidated prompt, not one at a time:

> "Before I start research, a few things that will sharpen the results:
>
> 1. **Priority use cases or pain points** -- what are the 2-3 most important things this solution must solve?
> 2. **Disqualifiers** -- any hard requirements that would eliminate a vendor? (e.g., must support GxP, must integrate with SAP S/4HANA, must operate in specific geographies, GDPR/HIPAA compliance)
> 3. **Budget range** -- even a rough range helps me assess pricing fit (e.g., $1-5M annually, or 'enterprise scale')
> 4. **Timeline** -- how urgently does this need to move? (e.g., RFP in 60 days, decision by Q4, exploratory)
>
> Any of these you can't answer yet, just say so and I'll proceed without."

Use these inputs to:
- Weight scoring categories (if the user says "integration is critical," increase Integration weight)
- Apply disqualifiers as hard filters (vendors that fail a disqualifier are excluded from the shortlist and noted as excluded with the reason)
- Calibrate pricing assessments against the stated budget
- Adjust depth based on urgency (exploratory = lighter research phase; RFP in 60 days = maximum depth with actionable next steps)

## Output Guardrails

- **Write narrative prose with structure.** Use flowing paragraphs for analysis, context, and supplier profiles. Use bulleted and numbered lists where items are genuinely list-worthy (capabilities, risks, next steps). Use tables for data (scoring, pricing, requirements fit). Do NOT produce walls of unstructured prose, but also do NOT reduce everything to terse bullet fragments.
- **Avoid filler or boilerplate language.** Every sentence must help the reader make a decision. If a sentence could be deleted without losing decision-relevant information, delete it.
- **Only include content that drives decision-making.** The reader is a procurement professional or business stakeholder choosing which vendors to invite to an RFP. Content that doesn't help that decision doesn't belong in the report.
- **Include page numbers** in document footers.
- **Include a Table of Contents** at the beginning of the report with section names. Use heading styles (H1, H2, H3) so the TOC is navigable in Word.

## Complete Report Structure (Required Sections)

Every report must include these sections in this order:

1. **Table of Contents** -- auto-generated from heading styles
2. **Executive Summary** -- purpose, scope, top suppliers, key differentiators, market insights, recommendation
3. **Supplier Profiles** -- narrative-style profiles per the 12-subsection template (top 5 deep with 2-3 paragraph narrative opening, 6-10 condensed with 2-3 paragraph overview)
4. **Comparative Summary Table** -- side-by-side with these exact columns:

| Supplier | Fit to Need | Financial Health | Risk | Pricing Model | Contract Flexibility | Lilly Vendor Status | Industry Fit | Integration | ESG | Overall Assessment |

The "Overall Assessment" column is a single-line verdict per vendor (e.g., "Recommended -- strongest pharma pedigree" or "Not recommended -- integration gap with SAP").

5. **Weighted Scoring Matrix** (Full only) -- with scoring rationale
6. **Requirements Fit Scoring** -- per-vendor tables with 10-point decimal scale and cross-vendor comparison
7. **Final Recommendation** -- must explicitly include:
   - Top recommended supplier(s) with rationale
   - Runners-up and why they are runners-up (not just "also good")
   - Key tradeoffs between the top candidates (what you gain and lose with each choice)
   - Risks or concerns that must be addressed
   - Concrete next steps (not generic -- specific to this sourcing event)
8. **Research Methodology** -- sources by tier, inclusion/exclusion criteria, assumptions, limitations
9. **Glossary / Appendix** (optional) -- include only if the report uses technical or procurement terms the audience may not know. For pharmaceutical audiences, supply chain planning acronyms (MEIO, APS, S&OP, IBP, MES, GxP) should be defined. For non-technical audiences, all acronyms should be defined.

## Risk Categories (Required in Every Profile)

The Limitations & Risks subsection of each profile must address ALL of the following risk categories explicitly. If a category has no identified risk, state "No identified risk" -- do not skip the category.

- **Legal risk:** Pending litigation, regulatory actions, IP disputes, contract enforceability concerns
- **Cybersecurity risk:** Known breaches, security posture, SOC 2/ISO 27001 status, data handling practices
- **Operational risk:** Implementation capacity, support quality, vendor concentration, key-person dependencies, product stability
- **Geopolitical risk:** Headquarters location, data residency, sanctions exposure, supply chain disruption from geopolitical events, regulatory jurisdiction
- **Financial risk:** Covered in the Financial Health subsection but flag here if there are concerns (pre-profitability, PE exit pressure, acquisition uncertainty)

## Lilly Vendor Status (Complete Classification)

The Vendor Status subsection must classify the vendor using one of these categories AND address affiliate status:

- **Current** -- active deployment or contract at Lilly. Specify: what is deployed, when, which MSA governs.
- **Former** -- prior relationship, no current deployment. Specify: what was previously in place, when it ended, why.
- **New** -- no prior relationship. Note if any pre-qualification or MSA drafting has occurred.
- **In Process** -- under active evaluation or contracting.

**Affiliate status:** State whether the vendor has any affiliate, subsidiary, or parent-company relationship with a current Lilly vendor. Example: "Blue Yonder is a subsidiary of Panasonic. Panasonic is not a known Lilly vendor in the supply chain domain." Example: "SAP is the parent company of Concur and SuccessFactors, both current Lilly vendors."

## Report Standards

The supplier landscape report is always produced at full depth. There is no brief mode. Adhere to these standards:

| Element | Requirement |
|---------|:---|
| Page Limit | Up to 30 pages |
| Suppliers Profiled | Top 5-10 (deep profiles for top 5, condensed for 6-10) |
| Executive Summary | Max 3 pages |
| Supplier Profiles | 1-2 pages each (12 subsections) |
| Requirements Fit Scoring | Per-vendor tables with rationale + cross-vendor comparison |
| Weighted Scoring Matrix | Included with full calculation |
| Comparative Summary Table | Included |
| Glossary / Appendix | Optional |

## Weighted Scoring Matrix Format (Full Version)

The scoring matrix must show the weighted calculation, not just the final score. For each vendor, show: raw score, weight, and weighted score per category, plus total.

Format:

| Criteria | Weight | Vendor A Score | Vendor A Weighted | Vendor B Score | Vendor B Weighted | ... |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Alignment to Business Need | 30% | 9 | 2.70 | 8 | 2.40 | ... |
| Technical/Operational | 15% | 9 | 1.35 | 8 | 1.20 | ... |
| Risk Profile | 15% | 7 | 1.05 | 8 | 1.20 | ... |
| Pricing Model | 15% | 7 | 1.05 | 7 | 1.05 | ... |
| Contract Flexibility | 10% | 8 | 0.80 | 7 | 0.70 | ... |
| Lilly Vendor Status | 5% | 3 | 0.15 | 3 | 0.15 | ... |
| Industry/Regulatory | 5% | 8 | 0.40 | 9 | 0.45 | ... |
| Integration Fit | 5% | 7 | 0.35 | 7 | 0.35 | ... |
| **TOTAL** | **100%** | | **7.85** | | **7.50** | ... |

This format makes the math transparent and allows the user to adjust weights and immediately see the impact on rankings.

## Content Writing Rules (Anti-Patterns to Avoid)

**The report must read like a magazine feature, not a database export.** These anti-patterns are explicitly prohibited:

1. **No key-value dump profiles.** A supplier profile is NOT a 2-column table with "Headquarters | Ottawa, Canada" rows. Instead, write a 2-3 paragraph narrative introduction: "Kinaxis is a publicly traded supply chain planning company headquartered in Ottawa, Canada, with approximately 1,700 employees globally. Founded in 1984, Kinaxis has spent 39 years focused exclusively on supply chain planning, making it one of the longest-tenured pure-play vendors in the market. The company has been recognized as a Gartner Magic Quadrant Leader since 2014 and derives 40% of its revenue from pharmaceutical clients, including 8 of the top 10 global pharma companies." (That example uses a supply-chain-planning vendor; adapt the domain language to the commodity you are actually sourcing.) Use a compact data card table only for the 4-5 most critical numeric fields (revenue, employees, a domain-depth metric chosen for the commodity, pharma %, fit score).

2. **No compressed single-sentence fragments.** "Implementation. Agile methodology with 6-month pilot timeline." is not analysis. Write actual paragraphs: "Kinaxis proposes an agile implementation methodology delivered through their Professional Services team in partnership with one of four named system integrators. The approach begins with a rapid prototyping phase to establish a baseline model, followed by iterative configuration sprints. The 6-month pilot timeline is among the most aggressive in this evaluation, reflecting the vendor's confidence in their pre-built industry templates and certified SAP adapters."

3. **Use proper bulleted and numbered lists** where items are genuinely list-worthy (specific capabilities, named clients, risk factors, next steps). In DOCX prose, do not type "+" or "-" characters as bullet substitutes: use actual Word bullet formatting with proper indentation. (This rule governs typed text in the report. In the JSX dashboard, list markers are CSS-drawn shapes, not typed "+"/"-" characters, which is compliant.)

4. **Use columns where appropriate.** Strengths and risks should be presented in a 2-column layout (strengths on left, risks on right) when both are being listed for a single supplier. Key metrics can use multi-column KPI card layouts.

5. **Tables are for data, not for narrative.** Use tables for: requirements fit scoring matrices, financial comparison grids, pricing model comparisons, and weighted scoring matrices. Do NOT use tables as the primary container for supplier profile information or analysis content. Narrative belongs in paragraphs.

6. **Every section needs at least one full paragraph of connected prose.** Not a sequence of bold-label sentence fragments. The reader should be able to read a section start-to-finish as flowing text, with data tables, bulleted lists, and callout boxes interspersed where they add value.

7. **Section transitions matter.** Each major section should open with 1-2 sentences establishing what the section covers and why it matters, before diving into the detail. Do not start a section with a raw table.

## Document Spacing Rules

Follow the suite DOCX spacing in `/mnt/skills/user/lilly-brand-assets-1c344a/references/docx-design-system.md`: paragraph after-spacing and section before-spacing, body line height, no empty spacer paragraphs, and page breaks only after the title page and the table of contents (the document otherwise flows continuously).

## Dashboard Creation Rules (Mandatory)

Follow the suite dashboard build rules in `/mnt/skills/user/lilly-brand-assets-1c344a/references/dashboard-components.md`: write the .jsx with `create_file` (never `bash_tool`/cat) directly to `/mnt/user-data/outputs/`, import React hooks explicitly, use named function components, and use only valid camelCase CSS property names in inline styles.

## Acronym and Terminology Rules

Per `/mnt/skills/user/lilly-brand-assets-1c344a/references/narrative-standards.md`: spell out every acronym on first use in both DOCX and dashboards; include a glossary when more than 5 unique acronyms appear (DOCX) or a footer legend (dashboard).

## SUITE INTEGRATION & ENHANCEMENTS

- **Native deliverable:** a Top-10 evidence-based shortlist with profiles, fit, and risk.
- **Low-input default:** accept anything from a single sentence to a full business case. Ask for category and region as one tap ONLY when genuinely absent for an unfamiliar commodity.
- **Category neutrality (critical):** for categories outside strong knowledge, present an explicitly evidence-flagged, lower-confidence shortlist and offer a one-tap clarifier - never a confident but fabricated vendor list.
- **Downstream handoffs.** This skill scans a market to build a shortlist. For a deep single-vendor dossier on any one shortlisted supplier, hand off to the sibling **supplier-deep-dive** skill (pass the vendor name and the `landscape_handoff.json` so it can build on what is already researched, not re-research from scratch). To turn the shortlist into an RFP, hand off to **rfp-engine** via `landscape_handoff.json` (the Market Context object enriches the RFP Background and evaluation criteria). State the relevant handoff in the closing Next Steps; do not auto-invoke another skill.


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
- *Deliverable format:* if file-creation and code execution are available, produce the rich artifacts this skill specifies (JSX dashboard, XLSX, PPTX). If they are not - e.g. running inside Word - produce the in-document equivalent: structured tables, headings, and summaries that live in the document. A missing renderer never means no deliverable.
- *Question mechanism:* use the tappable option-picker when available; degrade to one concise inline question when it is not.
- *Web research:* if web search is unavailable, say so and proceed on provided data, or recommend running that step in standalone - never silently present a thin benchmark as if it were complete.
- *Projects / multi-user:* look for existing project artifacts and build on them instead of regenerating; stamp outputs with date, author, and the inputs used; do not promote one rep's working assumptions into project-wide truth.
- *Honest degradation:* whenever something cannot run, add a one-line user-facing note saying what was skipped and how to get the full version - never fail silently or present a degraded output as complete.

## SUITE v2 SPECIFICS - supplier-landscape

**Input tiers.** MUST: a one-line need. RECOMMENDED: incumbents, must-haves, geography. OPTIONAL: budget, prior shortlists, regulatory constraints.
**External search runs two sweeps:** (1) named suppliers - incumbent and known alternatives; (2) substitutes and the adjacent market - other providers, alternative models, options the rep may not know. Searching suppliers by name is ordinary market research.
**Attribution:** sources carry an "as of" date and confidence flag; for thin-data categories, present an explicitly lower-confidence, evidence-flagged shortlist and offer a one-tap clarifier rather than a confident but fabricated list.
**Depth aims:** a Top-10 evidence-based shortlist with profiles, fit analysis, risk assessment, and next steps.

---

# INLINED REFERENCE FILES

The following files were previously in subdirectories. They are now inlined for single-file installation.

---

## INLINED: examples/supplier_landscape_canonical_dashboard.jsx

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from "recharts";

// ---------------------------------------------------------------------------
// Supplier Landscape - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure. See the inlined dashboard-canonical spec below.
// 5 tabs, identical in Full Report mode and Supplement mode and for every
// category or commodity. Only the data and research change per run.
// Data below is NEUTRAL and ILLUSTRATIVE (Supplier Alpha through Kappa,
// generic capability categories). Clone the structure, swap the data.
// House style: SUITE STANDARD (Arial body, Georgia titles, dark #212121 header
// with red rule, the shared suite palette below). Same family as every other
// dashboard. NO green/teal in any status band (brand no-green rule): the
// "strong / positive" state renders in a deep Bold-Blue navy, not green.
// ---------------------------------------------------------------------------

// Shared suite palette. Every token has a DISTINCT hex (no two tokens share one).
// #0F3A85 canonical name = "Bold Blue".
const R = "#E1251B",        // Lilly Red (alert / brand rule)
  DK = "#212121",            // Charcoal (text, header, footer)
  BLU = "#0F3A85",           // Bold Blue (comparison accent, NEEDS_INPUT accent)
  POS = "#0A2A5E",           // Positive Navy (strong-score / award / positive-delta status; NOT green)
  AMB = "#B45309",           // Amber (adequate-score / medium-severity status)
  CARD = "#E4EBF1",          // Card / panel tint fill
  BD = "#DCE4EC",            // Border / hairline (distinct from CARD)
  WARM = "#FFF0D8",          // Warm tint (adequate / accent background)
  RISK = "#FDE8E5",          // Risk tint (gap / high-severity background)
  OK = "#D4E5F7",            // Cool tint (strong / low-severity background)
  MUT = "#8A969E",           // Muted text
  LT = "#A8B2BA";            // Lighter muted text (distinct from MUT)

function scC(v) { return v >= 8.5 ? POS : v >= 7 ? AMB : R; }
function scBg(v) { return v >= 8.5 ? OK : v >= 7 ? WARM : RISK; }
const SEV = { High: R, Medium: AMB, Low: POS };
const SEVBG = { High: RISK, Medium: WARM, Low: OK };

const cats = [
  { k: "core", n: "Core Capability", c: 90 },
  { k: "integ", n: "Integration & Data", c: 55 },
  { k: "scale", n: "Scalability & Performance", c: 40 },
  { k: "impl", n: "Implementation & Delivery", c: 45 },
  { k: "support", n: "Support & SLAs", c: 35 },
  { k: "security", n: "Security & Compliance", c: 50 },
  { k: "commercial", n: "Commercial Model", c: 25 },
  { k: "roadmap", n: "Roadmap & Innovation", c: 20 },
];
const TOTAL = cats.reduce(function (a, c) { return a + c.c; }, 0);

// Overall score (os) is DERIVED from the weighted average of the per-category
// scores (sc), weighted by requirement count, never stored. This guarantees the
// headline score always equals the live category data and can never drift
// (the previous build hardcoded os: 8.7 while the data computed to 8.88).
function wavg(sc) { return cats.reduce(function (a, c) { return a + sc[c.k] * c.c; }, 0) / TOTAL; }

const S = [
  {
    r: 1, nm: "Supplier Alpha", hq: "City A, Country A", emp: "1,800", rev: "$540M (FY2025)", fin: "Public",
    pd: "Extensive", ig: "Excellent", cf: "High", fs: 9.0,
    sc: { core: 9.3, integ: 9.0, scale: 8.8, impl: 8.5, support: 8.6, security: 9.0, commercial: 8.0, roadmap: 8.9 },
    overview: "Supplier Alpha is an established category leader recognized by major analyst firms for several consecutive years. The illustrative profile shows a public company with disciplined growth and the deepest reference base in this evaluation. Replace this narrative with the actual researched company overview for the run.",
    whyLilly: "Strongest overall fit for the stated requirements, with the broadest native coverage and a proven enterprise integration story. Replace with the run-specific rationale tied to the buyer's priorities.",
    solution: "Cloud-based platform with a unified data model and modular capability set. Replace with the supplier's actual architecture, deployment model, and release cadence.",
    arch: "Multi-tenant SaaS with documented APIs and certified connectors to common enterprise systems. Replace with verified architecture detail.",
    str: ["Broadest native coverage across the weighted categories", "Deep reference base in the relevant domain", "Mature, documented integration toolkit", "Financially disciplined and profitable"],
    rsk: [
      { c: "Operational", d: "One capability area depends on an OEM partner rather than native function. Confirm licensing and support implications.", s: "Medium" },
      { c: "Operational", d: "Leadership transition noted; confirm permanent appointment.", s: "Low" },
      { c: "Cybersecurity", d: "SOC 2 Type II certified; no known breaches.", s: "Low" },
      { c: "Geopolitical", d: "Data centers in two regions; no jurisdictional concerns identified.", s: "Low" },
    ],
    reqNarr: "Leads or ties in most weighted categories. Replace with category-by-category fit analysis citing the requirement counts.",
    commNarr: "Per-user subscription with module entitlements. Pricing not yet submitted in this illustrative run; see the labeled state. Replace with the verified commercial model.",
    opsNarr: "Implementations delivered with named system-integrator partners; typical timelines run several months to full deployment. Replace with verified delivery model.",
    clients: "Counts a majority of the top peers in the domain among its clients. Replace with named, verified references.",
    ecosystem: "Broad partner and integrator ecosystem. Replace with the verified ecosystem map.",
    esg: { r: "Strong", d: "Publishes an annual sustainability report with science-based emissions targets and holds recognized diversity certifications. Strongest ESG posture in this illustrative set. Replace with verified ESG detail." },
  },
  {
    r: 2, nm: "Supplier Beta", hq: "City B, Country B", emp: "1,300+", rev: "Not disclosed", fin: "Private",
    pd: "Extensive", ig: "Good", cf: "Moderate", fs: 8.6,
    sc: { core: 8.6, integ: 8.2, scale: 8.5, impl: 8.7, support: 8.4, security: 8.5, commercial: 8.2, roadmap: 8.3 },
    overview: "Supplier Beta is a privately held specialist with deep domain expertise and strong delivery references. Financials are not publicly disclosed, which is reflected as a labeled research gap rather than a fabricated figure. Replace with the actual researched overview.",
    whyLilly: "Strong domain depth and delivery track record. Replace with run-specific rationale.",
    solution: "Purpose-built platform for the domain with strong delivery tooling. Replace with verified solution detail.",
    arch: "Cloud-enabled with standard connectors; certification ecosystem is narrower than the leader. Replace with verified detail.",
    str: ["Deep domain specialization", "Strong delivery and implementation references", "Competitive, flexible commercial posture"],
    rsk: [
      { c: "Financial", d: "Private company; financial health cannot be independently verified from public sources.", s: "Medium" },
      { c: "Operational", d: "Smaller scale may constrain capacity on very large programs.", s: "Medium" },
      { c: "Cybersecurity", d: "SOC 2 certified; no known breaches.", s: "Low" },
    ],
    reqNarr: "Competitive across core categories; trails the leader on integration breadth. Replace with verified fit analysis.",
    commNarr: "Usage-based model; historically flexible with large enterprise clients. Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Delivered via in-house consultants and a global alliance partner. Replace with verified delivery model.",
    clients: "Strong named references in the domain. Replace with verified client list.",
    ecosystem: "Focused partner ecosystem. Replace with verified detail.",
    esg: { r: "Moderate", d: "Has stated sustainability commitments and some diversity credentials, but discloses less than the public leaders. Replace with verified ESG detail." },
  },
  {
    r: 3, nm: "Supplier Gamma", hq: "City C, Country C", emp: "2,400", rev: "$700M (est.)", fin: "PE-backed",
    pd: "Moderate", ig: "Good", cf: "Moderate", fs: 8.0,
    sc: { core: 8.0, integ: 8.3, scale: 8.4, impl: 7.4, support: 7.6, security: 8.1, commercial: 8.4, roadmap: 9.0 },
    overview: "Supplier Gamma is a growth-stage, PE-backed challenger with the most modern platform architecture in this illustrative set and the strongest innovation roadmap. Replace with the actual researched overview.",
    whyLilly: "Most architecturally advanced option; strongest roadmap. Replace with run-specific rationale.",
    solution: "Modern, AI-forward platform. Replace with verified solution detail.",
    arch: "Cloud-native with an extensible model. Replace with verified detail.",
    str: ["Most modern platform architecture", "Strongest innovation roadmap", "Likely aggressive commercial posture to win references"],
    rsk: [
      { c: "Financial", d: "Pre-profitability with private-equity exit pressure may affect long-term pricing stability.", s: "Medium" },
      { c: "Operational", d: "Less proven depth in the specific domain than the top two.", s: "Medium" },
      { c: "Operational", d: "Rapid growth may strain implementation and support capacity.", s: "Medium" },
    ],
    reqNarr: "Leads on roadmap and commercial model; trails on implementation depth. Replace with verified fit analysis.",
    commNarr: "Aggressive subscription pricing likely. Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Delivery capacity is a watch item given growth. Replace with verified delivery model.",
    clients: "Fewer named domain references. Replace with verified client list.",
    ecosystem: "Growing ecosystem. Replace with verified detail.",
    esg: { r: "Moderate", d: "Growth-stage challenger with an emerging ESG program and early carbon-reduction commitments; reporting is still maturing. Replace with verified ESG detail." },
  },
  {
    r: 4, nm: "Supplier Delta", hq: "City D, Country D", emp: "8,000+", rev: "$3B+ (segment)", fin: "Public (subsidiary)", inc: true,
    pd: "Moderate", ig: "Excellent", cf: "Low", fs: 7.2,
    sc: { core: 7.2, integ: 9.0, scale: 8.0, impl: 6.8, support: 7.0, security: 8.2, commercial: 6.5, roadmap: 7.0 },
    overview: "Supplier Delta is a large incumbent whose chief advantage is native integration with the buyer's existing stack, offset by a functional gap versus the pure-play leaders. Replace with the actual researched overview.",
    whyLilly: "Native integration with existing systems reduces friction. Replace with run-specific rationale.",
    solution: "Broad enterprise suite; the relevant module is one of many. Replace with verified solution detail.",
    arch: "Native integration is the differentiator; cloud migration may still be in progress. Replace with verified detail.",
    str: ["Native integration with the existing enterprise stack", "Existing vendor relationship reduces procurement friction", "Enterprise-grade infrastructure"],
    rsk: [
      { c: "Operational", d: "Functional gap versus pure-play leaders in the core category.", s: "High" },
      { c: "Operational", d: "Platform modernization may still be in progress; migration risk.", s: "Medium" },
      { c: "Financial", d: "Segment-level transparency limited as a subsidiary.", s: "Medium" },
    ],
    reqNarr: "Strong on integration; materially behind on core capability. Replace with verified fit analysis.",
    commNarr: "Bundling may obscure standalone pricing; request apples-to-apples terms. Replace with verified terms.",
    opsNarr: "Implementations can be complex and lengthy. Replace with verified delivery model.",
    clients: "Large installed base; fewer references specific to the core category. Replace with verified client list.",
    ecosystem: "Very broad integrator ecosystem. Replace with verified detail.",
    esg: { r: "Strong", d: "Large public parent maintains formal ESG governance, published carbon targets, and supplier-diversity programs. Replace with verified ESG detail." },
  },
  // Vendors 5-10: condensed in the DOCX, but in the dashboard they MUST live in
  // this SAME S array with the SAME field shape so all 10 appear in every tab
  // (Deep Dive selector, Heatmap columns, Risk cards, Head-to-Head selector).
  // Content is shorter than the top 5; structure is identical.
  {
    r: 5, nm: "Supplier Epsilon", hq: "City E, Country E", emp: "950", rev: "$210M (FY2025)", fin: "Public",
    pd: "Significant", ig: "Good", cf: "Moderate", fs: 7.3,
    sc: { core: 7.4, integ: 7.2, scale: 7.0, impl: 7.1, support: 7.3, security: 7.5, commercial: 7.6, roadmap: 7.2 },
    overview: "Supplier Epsilon is a mid-market specialist with a balanced, well-rounded offering and a competitive commercial posture. Condensed illustrative profile: replace with the researched overview.",
    whyLilly: "Solid all-round fit and flexible commercials; a credible value option. Replace with run-specific rationale.",
    solution: "Cloud platform covering the core categories at adequate depth. Replace with verified detail.",
    arch: "Standard SaaS with common connectors. Replace with verified detail.",
    str: ["Balanced coverage with no major gaps", "Flexible, value-oriented commercial posture"],
    rsk: [
      { c: "Operational", d: "Smaller scale than the leaders; confirm capacity for a large program.", s: "Medium" },
      { c: "Cybersecurity", d: "SOC 2 Type II certified; no known breaches.", s: "Low" },
    ],
    reqNarr: "Adequate across most categories; no standout strength. Replace with verified fit analysis.",
    commNarr: "Competitive subscription pricing. Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Delivered via in-house consultants. Replace with verified delivery model.",
    clients: "Mid-market reference base. Replace with verified client list.",
    ecosystem: "Modest partner ecosystem. Replace with verified detail.",
    esg: { r: "Moderate", d: "Mid-market provider with basic sustainability disclosures and no major certifications noted. Replace with verified ESG detail." },
  },
  {
    r: 6, nm: "Supplier Zeta", hq: "City F, Country F", emp: "1,100", rev: "Not disclosed", fin: "Private",
    pd: "Significant", ig: "Moderate", cf: "Moderate", fs: 7.0,
    sc: { core: 7.0, integ: 6.8, scale: 7.2, impl: 6.9, support: 6.7, security: 7.4, commercial: 7.1, roadmap: 6.6 },
    overview: "Supplier Zeta is a privately held challenger with respectable security posture and steady delivery. Condensed illustrative profile: replace with the researched overview.",
    whyLilly: "Reasonable fit with a strong security story. Replace with run-specific rationale.",
    solution: "Cloud platform with adequate category coverage. Replace with verified detail.",
    arch: "Standard SaaS; narrower connector ecosystem. Replace with verified detail.",
    str: ["Strong security and compliance posture", "Steady, reference-backed delivery"],
    rsk: [
      { c: "Financial", d: "Private company; financials not independently verifiable from public sources.", s: "Medium" },
      { c: "Operational", d: "Integration breadth trails the leaders.", s: "Medium" },
    ],
    reqNarr: "Middle of the field; strongest on security. Replace with verified fit analysis.",
    commNarr: "Usage-based pricing. Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Delivered via in-house team and one alliance partner. Replace with verified delivery model.",
    clients: "Regional reference base. Replace with verified client list.",
    ecosystem: "Focused partner ecosystem. Replace with verified detail.",
    esg: { r: "Moderate", d: "Private challenger reports selective sustainability initiatives; limited public ESG disclosure. Replace with verified ESG detail." },
  },
  {
    r: 7, nm: "Supplier Eta", hq: "City G, Country G", emp: "620", rev: "$130M (est.)", fin: "VC-backed",
    pd: "Limited", ig: "Moderate", cf: "High", fs: 6.6,
    sc: { core: 6.6, integ: 6.4, scale: 6.8, impl: 6.5, support: 6.3, security: 6.9, commercial: 6.7, roadmap: 6.2 },
    overview: "Supplier Eta is a venture-backed newcomer with flexible commercials and growing but unproven depth. Condensed illustrative profile: replace with the researched overview.",
    whyLilly: "Aggressive, flexible commercials; useful as a stalking horse. Replace with run-specific rationale.",
    solution: "Newer platform; coverage is still maturing. Replace with verified detail.",
    arch: "Cloud-native but lightly integrated today. Replace with verified detail.",
    str: ["Highly flexible, aggressive commercial posture", "Modern, fast-moving roadmap"],
    rsk: [
      { c: "Financial", d: "Venture-backed and pre-scale; funding runway is a watch item.", s: "High" },
      { c: "Operational", d: "Limited proven depth and a thin reference base.", s: "Medium" },
    ],
    reqNarr: "Below the field on depth; competitive only on commercials. Replace with verified fit analysis.",
    commNarr: "Likely to discount aggressively to win references. Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Small delivery team; capacity is a watch item. Replace with verified delivery model.",
    clients: "Few named references. Replace with verified client list.",
    ecosystem: "Nascent ecosystem. Replace with verified detail.",
    esg: { r: "Limited", d: "Early-stage vendor with no formal ESG program or disclosures identified to date. Replace with verified ESG detail." },
  },
  {
    r: 8, nm: "Supplier Theta", hq: "City H, Country H", emp: "3,200", rev: "$1.1B (segment)", fin: "Public (subsidiary)",
    pd: "Limited", ig: "Good", cf: "Low", fs: 6.2,
    sc: { core: 6.2, integ: 6.0, scale: 6.5, impl: 6.1, support: 6.0, security: 6.4, commercial: 6.6, roadmap: 5.8 },
    overview: "Supplier Theta is a large generalist for which this category is non-core, offset by an existing enterprise footprint. Condensed illustrative profile: replace with the researched overview.",
    whyLilly: "Incumbent relationship in adjacent areas may ease procurement. Replace with run-specific rationale.",
    solution: "Category capability is a small part of a broad suite. Replace with verified detail.",
    arch: "Legacy-leaning architecture; modernization in progress. Replace with verified detail.",
    str: ["Existing enterprise relationship in adjacent areas", "Enterprise-grade infrastructure and support"],
    rsk: [
      { c: "Operational", d: "Category is non-core for this vendor; roadmap investment is uncertain.", s: "High" },
      { c: "Operational", d: "Implementations can be lengthy and complex.", s: "Medium" },
    ],
    reqNarr: "Trails on core capability; relevant mainly for incumbency. Replace with verified fit analysis.",
    commNarr: "Bundling may obscure standalone pricing. Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Large but generalist delivery org. Replace with verified delivery model.",
    clients: "Broad installed base; few category-specific references. Replace with verified client list.",
    ecosystem: "Very broad but not category-focused ecosystem. Replace with verified detail.",
    esg: { r: "Moderate", d: "Inherits enterprise-level ESG programs from its parent, though category-specific commitments are unclear. Replace with verified ESG detail." },
  },
  {
    r: 9, nm: "Supplier Iota", hq: "City I, Country I", emp: "410", rev: "Not disclosed", fin: "Private",
    pd: "Limited", ig: "Moderate", cf: "Moderate", fs: 5.8,
    sc: { core: 5.8, integ: 5.6, scale: 6.1, impl: 5.7, support: 5.5, security: 6.0, commercial: 6.2, roadmap: 5.4 },
    overview: "Supplier Iota is a niche regional provider with a narrow but functional offering. Condensed illustrative profile: replace with the researched overview.",
    whyLilly: "Possible fit for a narrow scope or a specific region only. Replace with run-specific rationale.",
    solution: "Narrow platform; gaps outside its niche. Replace with verified detail.",
    arch: "Limited integration tooling. Replace with verified detail.",
    str: ["Focused niche capability", "Local-market familiarity"],
    rsk: [
      { c: "Operational", d: "Narrow scope leaves material capability gaps for a global program.", s: "High" },
      { c: "Financial", d: "Private and small; financials not verifiable from public sources.", s: "Medium" },
    ],
    reqNarr: "Below the field except within its niche. Replace with verified fit analysis.",
    commNarr: "Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Small delivery footprint. Replace with verified delivery model.",
    clients: "Regional references only. Replace with verified client list.",
    ecosystem: "Minimal ecosystem. Replace with verified detail.",
    esg: { r: "Limited", d: "Small regional provider; no material ESG commitments or certifications disclosed. Replace with verified ESG detail." },
  },
  {
    r: 10, nm: "Supplier Kappa", hq: "City J, Country J", emp: "180", rev: "Not disclosed", fin: "Private",
    pd: "Limited", ig: "Poor", cf: "Moderate", fs: 5.4,
    sc: { core: 5.4, integ: 5.2, scale: 5.7, impl: 5.3, support: 5.1, security: 5.6, commercial: 5.8, roadmap: 5.0 },
    overview: "Supplier Kappa is an emerging entrant included to round out the field; it is below the bar on most dimensions today. Condensed illustrative profile: replace with the researched overview.",
    whyLilly: "Watch-list only at present; not a near-term shortlist candidate. Replace with run-specific rationale.",
    solution: "Early-stage platform with significant gaps. Replace with verified detail.",
    arch: "Minimal integration capability today. Replace with verified detail.",
    str: ["Low entry price", "Willingness to co-develop"],
    rsk: [
      { c: "Operational", d: "Material capability and scale gaps across most categories.", s: "High" },
      { c: "Financial", d: "Very small and private; viability not verifiable from public sources.", s: "High" },
    ],
    reqNarr: "Lowest in the field; below requirement bar on most categories. Replace with verified fit analysis.",
    commNarr: "Lowest list price but highest delivery risk. Pricing not yet submitted. Replace with verified terms.",
    opsNarr: "Very small delivery team. Replace with verified delivery model.",
    clients: "Few or no relevant references. Replace with verified client list.",
    ecosystem: "Effectively no ecosystem yet. Replace with verified detail.",
    esg: { r: "Limited", d: "Emerging entrant with no published ESG initiatives; area is undisclosed. Replace with verified ESG detail." },
  },
];

// Vendors that surfaced in research but never entered the scored shortlist
// above (S). Mirrors excluded_vendors.csv: kept short and illustrative here,
// but every real run emits the full disqualifier audit trail in that file.
const EXCLUDED = [
  { nm: "Supplier Omicron", reason: "FAILED_DISQUALIFIER", detail: "No documented GxP validation experience; disqualifying for a regulated deployment.", source: "Vendor website, analyst brief", date: "Jun 2026" },
  { nm: "Supplier Sigma", reason: "INSUFFICIENT_EVIDENCE", detail: "No verifiable public information on financial stability or a comparable client base; evidence bar not met for shortlist inclusion.", source: "3 web searches, no usable result", date: "Jun 2026" },
];

// Fixed next-action taxonomy per the skill's Step 6 (RFP / Pilot / Direct
// Negotiation / Re-scope / Eliminate Category). Replace rationale per run.
const NEXT_ACTION = {
  recommendation: "Proceed to RFP",
  rationale: "The top of the field is close (the leader's margin over #2 is inside half a point; see Head-to-Head) and the broader field is fragmented on a share-of-fit basis (see Market Structure), so a formal RFP across the top four to five vendors will sharpen pricing and confirm fit before an award, rather than moving straight to single-source negotiation.",
};

const DATA_BASIS = ["Internal search: M365 connector, 6 sources reviewed", "External research: 34 searches across 10 vendors (Phase 1 + Phase 2)", "Requirements basis: 8 categories, 360 weighted points", "Research as of June 2026"];

// Derive the overall weighted score for every vendor from its sc data (see wavg).
// os is never authored by hand, so the headline score always matches the table.
S.forEach(function (s) { s.os = wavg(s.sc); });

// --- Fit x risk segmentation helpers (Executive Summary) --------------------
// Deterministic derivation, not a new Claude judgment call: reuses the same
// os (weighted fit, 0-10) already computed above and the same rsk[] severity
// items already authored per vendor. riskIdx folds each vendor's risk items
// into a single 0-5 index (High=3, Medium=2, Low=1 per item, averaged and
// rescaled to a 5-point ceiling) so it sits on a comparable scale to os.
const RISK_W = { High: 3, Medium: 2, Low: 1 };
function riskIdx(s) {
  if (!s.rsk || !s.rsk.length) return 0;
  var sum = s.rsk.reduce(function (a, r) { return a + (RISK_W[r.s] || 0); }, 0);
  return Math.min(5, (sum / s.rsk.length) * (5 / 3));
}
function segmentOf(s, fitCut, riskCut) {
  var strongFit = s.os >= fitCut, containedRisk = riskIdx(s) <= riskCut;
  if (strongFit && containedRisk) return "Leader";
  if (strongFit && !containedRisk) return "Challenger";
  if (!strongFit && containedRisk) return "Niche";
  return "Caution";
}
const SEG_COLOR = { Leader: POS, Challenger: AMB, Niche: MUT, Caution: R };
const SEG_BG = { Leader: OK, Challenger: WARM, Niche: CARD, Caution: RISK };
const SEG_DESC = {
  Leader: "Strong fit with contained risk. Prioritize for the shortlist and the RFP.",
  Challenger: "Strong fit but elevated risk. Advance with targeted mitigation and closer diligence.",
  Niche: "Contained risk but a narrower fit. Consider for a limited scope or as a fallback.",
  Caution: "Weaker fit combined with elevated risk. Deprioritize absent a compelling reason.",
};

// --- Cross-vendor risk dimension helpers (Risk Assessment) ------------------
// Same rsk[] items feed this pivot; a dimension a vendor never flagged shows
// a dash, never a fabricated "Low". ESG reuses the existing esg.r rating.
const DIMS = ["Operational", "Financial", "Cybersecurity", "Geopolitical", "Legal & Regulatory", "ESG"];
const ESG_SEV = { Strong: "Low", Moderate: "Medium", Limited: "High", "Not Disclosed": "Medium" };
const SEV_RANK = { High: 3, Medium: 2, Low: 1 };
function maxSevFor(s, cat) {
  var found = null;
  (s.rsk || []).forEach(function (r) { if (r.c === cat && (!found || SEV_RANK[r.s] > SEV_RANK[found])) found = r.s; });
  return found;
}
function dimSeverity(s, dim) {
  if (dim === "ESG") return ESG_SEV[s.esg.r] || "Medium";
  if (dim === "Legal & Regulatory") return null;
  return maxSevFor(s, dim);
}

const tabNames = ["Executive Summary", "Supplier Deep Dive", "Requirements Heatmap", "Risk Assessment", "Head-to-Head"];
const ddSections = ["Profile & Fit", "Solution & Architecture", "Strengths & Risks", "Requirements Analysis", "Commercial & Operational", "Clients & Ecosystem"];

function fF(v) { return "$" + v.toLocaleString("en-US"); }

function SevPill({ s }) { return <span style={{ color: SEV[s], background: SEVBG[s], border: "1px solid " + SEV[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>; }
function Metric({ label, value, sub, accent, warn, good }) {
  var bar = accent ? R : warn ? R : good ? POS : BD;
  return <div style={{ background: accent ? WARM : warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: accent ? R : LT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: warn ? R : good ? POS : DK, marginTop: 4 }}>{value}</div>
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
function Tip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div style={{ background: DK, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 12 }}>
    {label && <div style={{ fontWeight: 600, color: LT }}>{label}</div>}
    {payload.map(function (p, i) { return <div key={i}><strong>{typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}</strong></div>; })}
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
// Comparable sort key for a cell. Prefer the typed value v (number); otherwise
// the searchable text d. A cell whose d is a JSX element (no v) is treated as an
// empty string so a mixed typed/untyped column never compares a number against
// a React object and produces unstable ordering.
function cellKey(cell) {
  if (cell && cell.v != null) return cell.v;
  if (cell && (typeof cell.d === "string" || typeof cell.d === "number")) return cell.d;
  return "";
}
function STable({ columns, rows }) {
  var _s = useState({ col: 0, dir: "asc" }); var sort = _s[0]; var setSort = _s[1];
  var _q = useState(""); var q = _q[0]; var setQ = _q[1];
  // A row whose first cell carries pin:true (e.g. a WEIGHTED AVERAGE summary row)
  // is never sorted or filtered into the body; it is always appended at the bottom.
  var pinned = rows.filter(function (row) { return row[0] && row[0].pin; });
  var sortable = rows.filter(function (row) { return !(row[0] && row[0].pin); });
  var filtered = useMemo(function () {
    var r = sortable;
    if (q) { var lq = q.toLowerCase(); r = sortable.filter(function (row) { return row.some(function (c) { return String(c.d).toLowerCase().indexOf(lq) >= 0; }); }); }
    var sorted = r.slice().sort(function (a, b) {
      var av = cellKey(a[sort.col]);
      var bv = cellKey(b[sort.col]);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted.concat(pinned);
  }, [rows, q, sort]);
  return <div>
    <input value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="Search..."
      style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px", border: "1px solid " + BD, borderRadius: 6, fontSize: 12, marginBottom: 8, fontFamily: "Arial" }} />
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr>{columns.map(function (c, i) {
          return <th key={i} onClick={function () { setSort({ col: i, dir: sort.col === i && sort.dir === "asc" ? "desc" : "asc" }); }}
            style={{ textAlign: c.a || "left", padding: "8px 10px", background: DK, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>
            {c.h}{sort.col === i ? (sort.dir === "asc" ? " ^" : " v") : ""}
          </th>;
        })}</tr></thead>
        <tbody>{filtered.map(function (row, ri) {
          return <tr key={ri} style={{ background: ri % 2 ? "#fff" : "#FAFBFC" }}>{row.map(function (c, ci) {
            return <td key={ci} style={{ padding: "8px 10px", textAlign: c.a || "left", color: c.c || DK, fontWeight: c.b ? 700 : 400, borderBottom: "1px solid " + BD, verticalAlign: "top" }}>{c.d}</td>;
          })}</tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}
function ScoreCell({ v }) { return <span style={{ background: scBg(v), color: scC(v), fontWeight: 700, padding: "2px 9px", borderRadius: 12, fontSize: 12 }}>{v.toFixed(2)}</span>; }

// Signature Executive Summary visual: positions every evaluated vendor on a
// fit (x) x risk (y) plane and pairs it with segment tiles. Thresholds are
// interactive (pure client-side recompute, no server round trip): dragging
// either slider reclassifies every vendor, redraws the quadrant lines, and
// updates the tile counts and chip lists in the Segments card on the right.
function SegmentationPanel() {
  var _f = useState(7.5); var fitCut = _f[0]; var setFitCut = _f[1];
  var _r = useState(2.75); var riskCut = _r[0]; var setRiskCut = _r[1];
  var W = 620, H = 340, padL = 60, padR = 16, padT = 18, padB = 40;
  var plotW = W - padL - padR, plotH = H - padT - padB;
  var fitMin = 4, fitMax = 10;
  function xPos(fit) { return padL + (fit - fitMin) / (fitMax - fitMin) * plotW; }
  function yPos(risk) { return padT + (risk / 5) * plotH; }
  var cutX = xPos(fitCut), cutY = yPos(riskCut);
  var buckets = { Leader: [], Challenger: [], Niche: [], Caution: [] };
  S.forEach(function (s) { buckets[segmentOf(s, fitCut, riskCut)].push(s); });

  return <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14 }}>
    <Card title="Fit x risk segmentation" note="all evaluated vendors">
      <div style={{ fontSize: 12, lineHeight: 1.6, color: MUT, marginBottom: 10 }}>
        Positions every evaluated vendor by weighted fit score (horizontal, 0 to 10, from the ranking above) against a derived risk index (vertical, 0 to 5, folded from each vendor's rated risk items). Drag the thresholds to test how the segmentation shifts.
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: DK, display: "flex", alignItems: "center", gap: 8 }}>
          Fit threshold <input type="range" min="5.5" max="9" step="0.1" value={fitCut} onChange={function (e) { setFitCut(+e.target.value); }} style={{ width: 110 }} /> <strong>{fitCut.toFixed(1)}</strong>
        </label>
        <label style={{ fontSize: 11, color: DK, display: "flex", alignItems: "center", gap: 8 }}>
          Risk threshold <input type="range" min="1" max="4.5" step="0.1" value={riskCut} onChange={function (e) { setRiskCut(+e.target.value); }} style={{ width: 110 }} /> <strong>{riskCut.toFixed(1)}</strong>
        </label>
      </div>
      <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "auto" }}>
        <rect x={padL} y={padT} width={cutX - padL} height={cutY - padT} fill={SEG_BG.Niche} />
        <rect x={cutX} y={padT} width={W - padR - cutX} height={cutY - padT} fill={SEG_BG.Leader} />
        <rect x={padL} y={cutY} width={cutX - padL} height={H - padB - cutY} fill={SEG_BG.Caution} />
        <rect x={cutX} y={cutY} width={W - padR - cutX} height={H - padB - cutY} fill={SEG_BG.Challenger} />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke={BD} strokeWidth="1.5" />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={BD} strokeWidth="1.5" />
        <line x1={cutX} y1={padT} x2={cutX} y2={H - padB} stroke={MUT} strokeWidth="1" strokeDasharray="4,3" />
        <line x1={padL} y1={cutY} x2={W - padR} y2={cutY} stroke={MUT} strokeWidth="1" strokeDasharray="4,3" />
        <text x={W - padR - 4} y={padT + 12} textAnchor="end" style={{ fontSize: 9.5, fontWeight: 700, fill: SEG_COLOR.Leader, letterSpacing: "0.04em" }}>LEADERS</text>
        <text x={padL + 4} y={padT + 12} style={{ fontSize: 9.5, fontWeight: 700, fill: SEG_COLOR.Niche, letterSpacing: "0.04em" }}>NICHE</text>
        <text x={W - padR - 4} y={H - padB - 6} textAnchor="end" style={{ fontSize: 9.5, fontWeight: 700, fill: SEG_COLOR.Challenger, letterSpacing: "0.04em" }}>CHALLENGERS</text>
        <text x={padL + 4} y={H - padB - 6} style={{ fontSize: 9.5, fontWeight: 700, fill: SEG_COLOR.Caution, letterSpacing: "0.04em" }}>CAUTION</text>
        <text x={padL - 8} y={padT + 4} textAnchor="end" style={{ fontSize: 9.5, fill: MUT }}>Lower risk</text>
        <text x={padL - 8} y={H - padB} textAnchor="end" style={{ fontSize: 9.5, fill: MUT }}>Higher risk</text>
        <text x={(padL + (W - padR)) / 2} y={H - 6} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: DK }}>Weighted fit score (0 to 10)</text>
        {S.map(function (s, i) {
          var seg = segmentOf(s, fitCut, riskCut), x = xPos(s.os), y = yPos(riskIdx(s));
          return <g key={i}>
            {s.inc && <circle cx={x} cy={y} r="11" fill="none" stroke={DK} strokeWidth="1.2" strokeDasharray="2,2" />}
            <circle cx={x} cy={y} r="7" fill={SEG_COLOR[seg]} stroke="#fff" strokeWidth="1.5" />
            <text x={x} y={y - 11} textAnchor="middle" style={{ fontSize: 9.5, fontWeight: s.r <= 3 ? 700 : 500, fill: DK }}>{s.nm.replace("Supplier ", "")}</text>
          </g>;
        })}
      </svg>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 10.5, color: MUT }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: SEG_COLOR.Leader, marginRight: 4 }} />Leader</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: SEG_COLOR.Challenger, marginRight: 4 }} />Challenger</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: SEG_COLOR.Niche, marginRight: 4 }} />Niche</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: SEG_COLOR.Caution, marginRight: 4 }} />Caution</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "1.2px dashed " + DK, marginRight: 4 }} />Existing Lilly vendor</span>
      </div>
    </Card>
    <Card title="Segments" note={S.length + " vendors"}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {["Leader", "Challenger", "Niche", "Caution"].map(function (seg, i) {
          var list = buckets[seg];
          return <div key={i} style={{ background: SEG_BG[seg], borderRadius: 8, padding: "10px 12px", borderLeft: "3px solid " + SEG_COLOR[seg] }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: SEG_COLOR[seg], textTransform: "uppercase", letterSpacing: "0.04em" }}>{seg}</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: DK, marginTop: 2 }}>{list.length}</div>
            <div style={{ fontSize: 10, color: MUT, marginTop: 2, lineHeight: 1.4 }}>{SEG_DESC[seg]}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {list.map(function (s, j) { return <span key={j} style={{ fontSize: 9.5, background: "#fff", color: DK, padding: "1px 6px", borderRadius: 10, border: "1px solid " + BD }}>{s.nm.replace("Supplier ", "")}</span>; })}
            </div>
          </div>;
        })}
      </div>
      <div style={{ background: CARD, borderRadius: 8, padding: "10px 12px", borderLeft: "3px solid " + MUT, marginBottom: 10 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.04em" }}>Disqualified pre-shortlist</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: DK, marginTop: 2 }}>{EXCLUDED.length}</div>
        <div style={{ fontSize: 10, color: MUT, marginTop: 2, lineHeight: 1.4 }}>Failed a hard disqualifier or lacked sufficient evidence in Phase 1 to 2 research; never entered the scored field above. Full trail in excluded_vendors.csv.</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
          {EXCLUDED.map(function (e, j) { return <span key={j} style={{ fontSize: 9.5, background: "#fff", color: DK, padding: "1px 6px", borderRadius: 10, border: "1px solid " + BD }}>{e.nm}</span>; })}
        </div>
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.65, color: DK }}>
        At the current thresholds the field splits into {buckets.Leader.length} Leader{buckets.Leader.length === 1 ? "" : "s"} ({buckets.Leader.map(function (s) { return s.nm; }).join(", ") || "none"}), {buckets.Challenger.length} Challenger{buckets.Challenger.length === 1 ? "" : "s"} carrying strong fit alongside elevated risk, {buckets.Niche.length} Niche vendor{buckets.Niche.length === 1 ? "" : "s"}, and {buckets.Caution.length} in Caution. Replace with the run's read of what the segmentation means for the shortlist and where diligence should concentrate.
      </div>
    </Card>
  </div>;
}

// Secondary lens on the same fit data: how concentrated is the evaluated
// field? Deliberately labeled "share of fit," never "market share" (the
// vendors' real market shares are a separate, web-researched figure).
function MarketStructure() {
  var totalFit = S.reduce(function (a, s) { return a + s.os; }, 0);
  var shares = S.map(function (s) { return { nm: s.nm, pct: (s.os / totalFit) * 100 }; }).sort(function (a, b) { return b.pct - a.pct; });
  var hhi = shares.reduce(function (a, x) { return a + x.pct * x.pct; }, 0);
  var top1 = shares[0], top3 = shares.slice(0, 3).reduce(function (a, x) { return a + x.pct; }, 0);
  var bucket = hhi > 2500 ? "Concentrated" : hhi >= 1500 ? "Moderate" : "Fragmented";
  var segs = [
    { nm: shares[0].nm, pct: shares[0].pct, c: POS },
    { nm: shares[1].nm, pct: shares[1].pct, c: BLU },
    { nm: shares[2].nm, pct: shares[2].pct, c: AMB },
    { nm: "Remaining " + (shares.length - 3), pct: 100 - top3, c: MUT },
  ];
  return <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginTop: 14 }}>
    <Card title="Market structure" note="share of fit, not market share">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
        <Metric label="HHI (share of fit)" value={hhi.toFixed(0)} sub={bucket} />
        <Metric label="Top-1 share" value={top1.pct.toFixed(1) + "%"} sub={top1.nm} />
        <Metric label="Top-3 share" value={top3.toFixed(1) + "%"} sub="of combined fit score" />
      </div>
      <div style={{ display: "flex", height: 30, borderRadius: 6, overflow: "hidden", border: "1px solid " + BD }}>
        {segs.map(function (g, i) {
          return <div key={i} style={{ width: g.pct + "%", background: g.c, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 2 }} title={g.nm + " " + g.pct.toFixed(1) + "%"}>
            {g.pct > 8 && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", padding: "0 4px" }}>{g.nm.replace("Supplier ", "")} {g.pct.toFixed(0)}%</span>}
          </div>;
        })}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, fontSize: 10.5, color: MUT }}>
        {segs.map(function (g, i) { return <span key={i}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: g.c, marginRight: 4 }} />{g.nm} ({g.pct.toFixed(1)}%)</span>; })}
      </div>
    </Card>
    <Card title="Concentration read">
      <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
        {top1.nm} alone holds an estimated {top1.pct.toFixed(1)}% share of the field's combined fit-weighted score; the top three vendors together hold about {top3.toFixed(1)}%, leaving the remaining {shares.length - 3} vendors splitting the rest. An HHI of {hhi.toFixed(0)} on this share-of-fit basis places the shortlisted field in {bucket} territory (below 1,500 is Fragmented, 1,500 to 2,500 is Moderate, above 2,500 is Concentrated), consistent with a genuinely competitive field rather than a foregone conclusion. This is a share of FIT among the {S.length} shortlisted suppliers, not a measure of real-world market share; treat it as a competitiveness signal for the RFP process, not a market-size claim. Replace with the run's actual computed distribution and concentration read.
      </div>
    </Card>
  </div>;
}

export default function App() {
  var _t = useState(0); var tab = _t[0]; var setTab = _t[1];
  var _s = useState(0); var si = _s[0]; var setSi = _s[1];
  var _sec = useState(0); var sec = _sec[0]; var setSec = _sec[1];
  var _a = useState(0); var cA = _a[0]; var setCA = _a[1];
  var _b = useState(1); var cB = _b[0]; var setCB = _b[1];

  return <div style={{ fontFamily: "Arial,Helvetica,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
    <div style={{ background: DK, borderLeft: "4px solid " + R, padding: "18px 24px" }}>
      <div style={{ color: R, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Eli Lilly and Company - Procurement</div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 2 }}>[Category] - Supplier Landscape</div>
      <div style={{ color: LT, fontSize: 12, marginTop: 4 }}>[Month Year] | {TOTAL} requirements | {S.length} vendors evaluated | [N] deep profiles</div>
    </div>
    <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 14px", display: "flex", overflowX: "auto" }}>
      {tabNames.map(function (t, i) {
        var active = tab === i;
        return <button key={i} onClick={function () { setTab(i); }} style={{ border: "none", background: "none", padding: "13px 16px", fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? R : MUT, borderBottom: active ? "3px solid " + R : "3px solid transparent", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Arial" }}>{t}</button>;
      })}
    </div>
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 50px" }}>
      {tab === 0 && <ExecTab />}
      {tab === 1 && <DDTab si={si} setSi={function (v) { setSi(v); setSec(0); }} sec={sec} setSec={setSec} />}
      {tab === 2 && <HeatTab />}
      {tab === 3 && <RiskTab />}
      {tab === 4 && <CmpTab a={cA} b={cB} setA={setCA} setB={setCB} />}
    </div>
    <div style={{ background: DK, color: LT, padding: "14px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 11 }}>
      <span>Scores on a 10-point scale, weighted by requirement count. Replace placeholders and illustrative data with researched values.</span>
      <span>Company Confidential | supplier-landscape | procurement guidance, not legal advice</span>
    </div>
  </div>;
}

function ExecTab() {
  return <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
      <Metric label="Vendors evaluated" value={S.length} sub="profiled in depth" />
      <Metric label="Total requirements" value={TOTAL} sub={cats.length + " categories"} />
      <Metric label="Top weighted score" value={S[0].os.toFixed(2)} good />
      <Metric label="Recommended" value={S[0].nm} sub="subject to validation" good />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Card title="Evaluation summary">
        <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>This illustrative landscape evaluates {S.length} suppliers against {TOTAL} weighted requirements across {cats.length} categories. Replace with the run-specific summary describing the sourcing need and how the field was narrowed. Ranking: {S.map(function (s) { return s.nm + " (" + s.os.toFixed(2) + ")"; }).join(", ")}.</div>
      </Card>
      <Card title="Recommendation">
        <div style={{ fontSize: 12.5, lineHeight: 1.7 }}><strong>Primary: {S[0].nm} ({S[0].os.toFixed(2)})</strong>. {S[0].whyLilly}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.7, marginTop: 8 }}><strong>Secondary: {S[1].nm} ({S[1].os.toFixed(2)})</strong>. Strong alternative; see Head-to-Head for the tradeoff.</div>

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid " + BD }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Also in the running</div>
          {S.slice(2, 4).map(function (s, i) { return <div key={i} style={{ fontSize: 12, lineHeight: 1.6, padding: "3px 0" }}><strong>{"#" + s.r + " " + s.nm}</strong> ({s.os.toFixed(2)}): {s.whyLilly.split(".")[0]}.</div>; })}
        </div>

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid " + BD }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Eliminated before the shortlist</div>
          {EXCLUDED.map(function (e, i) { return <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 0" }}><span style={{ flex: "0 0 auto", width: 7, height: 7, marginTop: 5, borderRadius: 2, background: R }} aria-hidden="true" /><div style={{ fontSize: 12, lineHeight: 1.6 }}><strong>{e.nm}</strong>: {e.detail}</div></div>; })}
          <div style={{ fontSize: 10, color: MUT, marginTop: 4 }}>Full audit trail in excluded_vendors.csv.</div>
        </div>

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid " + BD, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next action</span>
          <span style={{ background: OK, color: POS, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid " + POS + "40" }}>{NEXT_ACTION.recommendation}</span>
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 6, color: DK }}>{NEXT_ACTION.rationale}</div>

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid " + BD, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DATA_BASIS.map(function (c, i) { return <span key={i} style={{ fontSize: 10, color: MUT, background: CARD, padding: "3px 8px", borderRadius: 12 }}>{c}</span>; })}
        </div>
      </Card>
    </div>
    <Card title="Supplier ranking" note="weighted score, 10-point">
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={S.map(function (s) { return { name: s.nm, score: s.os }; })} layout="vertical" margin={{ left: 20, right: 40 }}>
          <CartesianGrid horizontal={false} stroke={BD} />
          <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} />
          <Tooltip content={<Tip />} cursor={{ fill: "#00000008" }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>{S.map(function (s, i) { return <Cell key={i} fill={scC(s.os)} />; })}<LabelList dataKey="score" position="right" formatter={function (v) { return v.toFixed(2); }} style={{ fontSize: 12, fontWeight: 700 }} /></Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <div style={{ marginTop: 14 }}><SegmentationPanel /></div>
    <MarketStructure />
  </div>;
}

function DDTab({ si, setSi, sec, setSec }) {
  var s = S[si];
  return <div>
    <div style={{ marginBottom: 12 }}>
      <select value={si} onChange={function (e) { setSi(+e.target.value); }} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid " + BD, fontSize: 13, fontWeight: 600, minWidth: 260, fontFamily: "Arial" }}>
        {S.map(function (x, i) { return <option key={i} value={i}>#{x.r} {x.nm} - Score {x.os.toFixed(2)}</option>; })}
      </select>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 14 }}>
      <Metric label="Weighted score" value={s.os.toFixed(2)} good={s.os >= 8.5} accent={s.os >= 7 && s.os < 8.5} warn={s.os < 7} />
      <Metric label="Fit score" value={s.fs.toFixed(2)} />
      <Metric label="Employees" value={s.emp} />
      <Metric label="Revenue" value={s.rev.split("(")[0].trim()} />
      <Metric label="Domain depth" value={s.pd} good={s.pd === "Extensive"} accent={s.pd !== "Extensive"} />
    </div>
    <div style={{ display: "flex", marginBottom: 14, borderBottom: "1px solid " + BD, flexWrap: "wrap" }}>
      {ddSections.map(function (ps, i) { return <button key={i} onClick={function () { setSec(i); }} style={{ padding: "8px 14px", fontSize: 12, fontWeight: sec === i ? 700 : 500, color: sec === i ? R : MUT, background: "none", border: "none", borderBottom: sec === i ? "2px solid " + R : "2px solid transparent", cursor: "pointer", fontFamily: "Arial" }}>{ps}</button>; })}
    </div>

    {sec === 0 && <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
      <Card title="Company overview"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.overview}</div></Card>
      <Card title="Why this vendor"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.whyLilly}</div></Card>
    </div>}
    {sec === 1 && <div>
      <Card title="Solution"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.solution}</div></Card>
      <Card title="Architecture & integration"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.arch}</div></Card>
    </div>}
    {sec === 2 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Card title="Strengths">{s.str.map(function (x, i) { return <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, lineHeight: 1.6, padding: "5px 0", borderBottom: i < s.str.length - 1 ? "1px solid " + BD : "none" }}><span style={{ flex: "0 0 auto", width: 7, height: 7, marginTop: 4, borderRadius: 2, background: POS }} aria-hidden="true" /><span>{x}</span></div>; })}</Card>
      <Card title="Risks">{s.rsk.map(function (r, i) { return <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderBottom: i < s.rsk.length - 1 ? "1px solid " + BD : "none" }}><SevPill s={r.s} /><div style={{ fontSize: 12, lineHeight: 1.6 }}><strong style={{ color: MUT }}>{r.c}: </strong>{r.d}</div></div>; })}</Card>
    </div>}
    {sec === 3 && <Card title="Requirements analysis" note="10-point, by category">
      <div style={{ fontSize: 12.5, lineHeight: 1.7, marginBottom: 10 }}>{s.reqNarr}</div>
      <STable columns={[{ h: "Category (requirements)" }, { h: "Score", a: "center" }]}
        rows={cats.map(function (c) { var v = s.sc[c.k]; return [{ d: c.n + " (" + c.c + ")", b: true }, { d: <ScoreCell v={v} />, v: v, a: "center" }]; })} />
    </Card>}
    {sec === 4 && <div>
      {s.fin === "Private" && <StateBanner kind="RESEARCH_PENDING" msg="Financial figures are not publicly disclosed for this private company. Shown as a labeled gap rather than a fabricated number. Provide filings or a submitted financial statement to populate." />}
      <Card title="Commercial model"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.commNarr}</div></Card>
      <Card title="Implementation & operations"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.opsNarr}</div></Card>
      <Card title="ESG & sustainability" note={"Rated " + s.esg.r}><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.esg.d}</div></Card>
    </div>}
    {sec === 5 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Card title="Reference clients"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.clients}</div></Card>
      <Card title="Partner ecosystem"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>{s.ecosystem}</div></Card>
    </div>}
  </div>;
}

function HeatTab() {
  return <Card title="Cross-vendor requirements fit heatmap" note="10-point, weighted by requirement count">
    <div style={{ fontSize: 12.5, lineHeight: 1.7, marginBottom: 10 }}>Blue (8.5+) strong, amber (7-8.49) adequate, red (below 7) significant gap. Replace illustrative values with researched scores.</div>
    <STable columns={[{ h: "Category (requirements)" }].concat(S.map(function (s) { return { h: s.nm, a: "center" }; }))}
      rows={cats.map(function (cat) {
        return [{ d: cat.n + " (" + cat.c + ")", b: true }].concat(S.map(function (s) { var v = s.sc[cat.k]; return { d: <ScoreCell v={v} />, v: v, a: "center" }; }));
      }).concat([
        [{ d: "WEIGHTED AVERAGE", b: true, pin: true }].concat(S.map(function (s) { var w = wavg(s.sc); return { d: <ScoreCell v={w} />, v: w, a: "center" }; }))
      ])} />
    <div style={{ fontSize: 12, color: MUT, marginTop: 10, lineHeight: 1.6 }}>Replace with the run's read of who leads each category and what the gaps mean for the buyer's priorities.</div>
  </Card>;
}

function RiskTab() {
  return <div>
    <div style={{ fontSize: 12.5, lineHeight: 1.7, marginBottom: 12 }}>Risk across all profiled vendors, classified by category (Operational, Financial, Legal, Cybersecurity, Geopolitical) and severity (Low / Medium / High). Replace illustrative risks with researched findings.</div>
    <Card title="Cross-vendor risk roll-up" note="severity by dimension, all evaluated vendors">
      <div style={{ fontSize: 12.5, lineHeight: 1.7, marginBottom: 10 }}>Pivots the risk items above into one dimension-by-vendor grid, adding Legal & Regulatory and ESG as standalone dimensions (ESG reuses each vendor's ESG & Sustainability rating from the Deep Dive tab). A dash means no item was flagged for that vendor in that dimension, not a verified "Low"; it is a gap in what research surfaced, never a fabricated clean bill.</div>
      <STable columns={[{ h: "Dimension" }].concat(S.map(function (s) { return { h: s.nm, a: "center" }; }))}
        rows={DIMS.map(function (dim) {
          return [{ d: dim, b: true }].concat(S.map(function (s) {
            var sev = dimSeverity(s, dim);
            return sev ? { d: <SevPill s={sev} />, v: SEV_RANK[sev], a: "center" } : { d: <span style={{ color: MUT }}>-</span>, v: 0, a: "center" };
          }));
        })} />
      <div style={{ fontSize: 12, color: MUT, marginTop: 10, lineHeight: 1.6 }}>Operational risk is the most widely flagged dimension in this illustrative set and reaches High severity for the lowest-ranked vendors; Financial risk clusters among the smaller and privately held vendors, reflecting limited public disclosure rather than confirmed distress; no vendor carries a flagged Legal & Regulatory item in this illustrative data (a real run populates this column from actual legal findings, never a default); ESG severity tracks the existing Strong / Moderate / Limited ratings. Replace with the run's cross-vendor synthesis.</div>
    </Card>
    {S.map(function (s, i) {
      return <Card key={i} title={"#" + s.r + " " + s.nm} note={"Score " + s.os.toFixed(2) + " | " + s.hq}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(" + Math.min(s.rsk.length, 3) + ",1fr)", gap: 10 }}>
          {s.rsk.map(function (r, j) { return <div key={j} style={{ background: SEVBG[r.s], borderRadius: 6, padding: "10px 12px", borderLeft: "3px solid " + SEV[r.s] }}><div style={{ fontSize: 9, fontWeight: 700, color: SEV[r.s], textTransform: "uppercase", marginBottom: 4, letterSpacing: "0.04em" }}>{r.c} | {r.s}</div><div style={{ fontSize: 11, lineHeight: 1.55 }}>{r.d}</div></div>; })}
        </div>
      </Card>;
    })}
    <Card title="Cross-cutting risk observations"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>Replace with the run's synthesis of where risk concentrates across the field and what it means for the award.</div></Card>
  </div>;
}

function CmpTab({ a, b, setA, setB }) {
  var sA = S[a], sB = S[b];
  var ranked = S.slice().sort(function (x, y) { return y.os - x.os; });
  var gap = ranked[0].os - ranked[1].os;
  var band = ranked.filter(function (s) { return ranked[0].os - s.os <= 0.5; });
  var othersInBand = band.length - 1;
  var read = gap >= 1.0 ? "Clear Leader" : othersInBand >= 3 ? "Fragmented Field" : "Close Race";
  return <div>
    <Card title="Competitive dynamics" note="derived from the full weighted-score ranking">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 10 }}>
        <Metric label="Leader gap" value={gap.toFixed(2) + " pts"} sub={ranked[0].nm + " vs " + ranked[1].nm} />
        <Metric label="Within 0.5 pts of leader" value={band.length} sub={band.map(function (s) { return s.nm; }).join(", ")} />
        <Metric label="Field read" value={read} good={read === "Clear Leader"} />
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.6, color: MUT }}>This read comes from the same weighted-score ranking driving the Executive Summary bar chart, independent of which two vendors are selected below. Replace with the run's assessment of whether the gap at the top is wide enough to support a lean toward one vendor, or whether it warrants continued competitive tension through BAFO or negotiation.</div>
    </Card>
    <Card title="Head-to-head comparison">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <select value={a} onChange={function (e) { setA(+e.target.value); }} style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid " + BD, fontSize: 12.5, fontWeight: 600, fontFamily: "Arial" }}>{S.map(function (s, i) { return <option key={i} value={i}>{s.nm}</option>; })}</select>
        <span style={{ fontWeight: 800, color: R, fontSize: 14 }}>vs</span>
        <select value={b} onChange={function (e) { setB(+e.target.value); }} style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid " + BD, fontSize: 12.5, fontWeight: 600, fontFamily: "Arial" }}>{S.map(function (s, i) { return <option key={i} value={i}>{s.nm}</option>; })}</select>
      </div>
    </Card>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
      {[sA, sB].map(function (s, idx) {
        return <Pillar key={idx} c={idx === 0 ? R : BLU} k={s.os.toFixed(2)} t={s.nm} d={s.hq + " | " + s.fin + " | Fit " + s.fs.toFixed(2) + " | Integration " + s.ig + " | Contract " + s.cf} />;
      })}
    </div>
    <Card title="Category-by-category comparison" note="delta = first minus second">
      <STable columns={[{ h: "Category (requirements)" }, { h: sA.nm, a: "center" }, { h: sB.nm, a: "center" }, { h: "Delta", a: "center" }]}
        rows={cats.map(function (c) { var va = sA.sc[c.k], vb = sB.sc[c.k], d = va - vb; return [
          { d: c.n + " (" + c.c + ")", b: true },
          { d: <ScoreCell v={va} />, v: va, a: "center" },
          { d: <ScoreCell v={vb} />, v: vb, a: "center" },
          { d: (d > 0 ? "+" : "") + d.toFixed(2), v: d, a: "center", b: true, c: d > 0 ? POS : d < 0 ? R : MUT },
        ]; })} />
    </Card>
    <Card title="Key tradeoff"><div style={{ fontSize: 12.5, lineHeight: 1.7 }}>Compare {sA.nm} ({sA.os.toFixed(2)}) against {sB.nm} ({sB.os.toFixed(2)}) across the breakdown above. Replace with the run's plain-language read of the tradeoff between these two.</div></Card>
  </div>;
}

---

## INLINED: references/dashboard-canonical.md

# Supplier Landscape Dashboard - Canonical Structure (LOCKED)

Shared component implementations are at `/mnt/skills/user/lilly-brand-assets-1c344a/references/dashboard-components.md`. Copy them verbatim. The canonical dashboard example JSX (inlined above under "INLINED: examples/supplier_landscape_canonical_dashboard.jsx") demonstrates the complete implementation with neutral illustrative data.

This spec is mandatory. Every supplier landscape dashboard this skill produces, in Full Report mode and Supplement mode alike, and for EVERY category or commodity (IT, professional services, lab, clinical, chemicals, equipment, facilities, logistics, marketing, and any other), must follow this exact structure. Only the data and the category-specific research change. Do not redesign the layout, tabs, components, or styling per run. Do not add, drop, reorder, or rename tabs based on mode or category. The reference implementation is the canonical dashboard example JSX inlined above. Clone its structure, swap the data.

The dashboard is the interactive companion to the supplier landscape report (DOCX). It must be as deep as the report: every profiled supplier, every requirement category, every risk. It is not a teaser for the document. Two runs of the same inputs produce the same dashboard. Full Report mode and Supplement mode produce the same five tabs and the same depth; only the content differs.

## The determinism guarantee (what "same every run" means)

1. **Same skeleton, always.** The five canonical tabs below appear in this order on every run, in every mode, for every category. Header, footer, tab nav, palette, typography, and components are identical run to run.
2. **Content varies, structure does not.** A tab is never removed because a mode or category "does not need it"; it is reframed or shown in a labeled state.
3. **Depth parity.** Every tab and every deep-dive sub-section is filled to the same depth on every run, achieved through research (see below), not omission.
4. **Every tab always renders.** No blank panels. Use the labeled states below.

## Three labeled states (use instead of dropping or blanking content)

- **NEEDS_INPUT** (Bold Blue accent, cream banner): pending a specific user input. State what unblocks it.
- **NOT APPLICABLE** (charcoal accent, stone banner, one-line reason): genuinely does not apply to this category or supplier.
- **RESEARCH PENDING** (charcoal accent, stone banner): research that would populate the area was run and returned nothing usable, or the data is genuinely undisclosed (for example, a private company's financials). State what was tried. Never fabricate a figure to fill the gap.

## Depth parity through research (required to fill every tab)

Fill every tab and sub-section by doing the discovery the SKILL workflow specifies before building the dashboard:
- **Internal search** (M365 connector: SharePoint / OneDrive / Outlook / Teams): prior landscapes, incumbent contracts, prior RFx, spend history for the category, known supplier relationships. The connector sees only M365; it cannot reach Ariba, LEAH, or other external systems. If the connector is unavailable, proceed on provided/uploaded documents and label the gap (do not fabricate internal history).
- **External web search**: the minimum per-vendor search depth the workflow mandates for the top profiles (company, financials, analyst position, domain footprint, implementation model, pricing model, security posture, ESG). Every external figure carries a source and a High / Medium / Low confidence flag. Never fabricate a supplier list, a market rate, or a requirement score (Global Rule 3, anti-fabrication).

If a search tool is unavailable, the affected area shows RESEARCH PENDING, not a fabricated fill.

## Hard formatting rules (see Global Operating Rules 7 and 8)

- NO em dashes anywhere. Use hyphens, colons, parentheses, or separate clauses.
- NO literal backslash-u escape sequences and NO HTML entities in any position that renders as visible text. Use literal characters or plain ASCII. Risk and score states use colored text and colored cell backgrounds, not emoji.
- Single-file React artifact (`.jsx`), built with `create_file` for shareability. `useState` from react. One default export. No chart library is required; the reference uses styled divs and tables.

## Layout shell (suite house style, locked - same family as every other dashboard)

- **Header bar:** dark charcoal (`#212121`) background with a 4px red (`#E1251B`) left rule, uppercase red eyebrow "Eli Lilly and Company - Procurement", Georgia-serif white title "{Category} - Supplier Landscape", muted meta line (month/year, requirement count, vendors evaluated, deep profiles).
- **Tab nav:** white bar, red active underline, charcoal-to-red on select.
- **Body:** max-width 1180 container on `#FFFFFF`.
- **Footer:** dark charcoal bar, left fine print (scoring scale and weighting note), right "Company Confidential | {skill} | procurement guidance, not legal advice".

## Color tokens (do not change - the shared suite palette)

This dashboard uses the SAME palette as every other dashboard in the suite (spend, category-strategy, contract-review). Every token has a DISTINCT hex (no two tokens share one) and there is NO green or teal in any status band (brand no-green rule):
- `R` `#E1251B` (Lilly Red: alert and brand rule)
- `DK` `#212121` (Charcoal: text, header, footer)
- `BLU` `#0F3A85` (Bold Blue: comparison accent, NEEDS_INPUT accent). #0F3A85 canonical name is "Bold Blue".
- `POS` `#0A2A5E` (Positive Navy: strong-score, award, and positive-delta status. This is the "strong/positive" status color and is intentionally a deep blue, NOT green.)
- `AMB` `#B45309` (Amber: adequate-score and medium-severity status)
- `CARD` `#E4EBF1` (card and panel tint fill)
- `BD` `#DCE4EC` (border and hairline; distinct from CARD)
- `WARM` `#FFF0D8` (warm tint: adequate and accent background)
- `RISK` `#FDE8E5` (risk tint: gap and high-severity background)
- `OK` `#D4E5F7` (cool tint: strong and low-severity background)
- `MUT` `#8A969E` (muted text)
- `LT` `#A8B2BA` (lighter muted text; distinct from MUT)

Score bands (10-point): 8.5+ strong POS text on OK background, 7-8.49 adequate AMB on WARM, below 7 gap R on RISK. Risk severity: Low POS/OK, Medium AMB/WARM, High R/RISK. No status state renders green or teal.

## Typography

Arial (Helvetica) body throughout; Georgia serif for the title, card titles, and large numbers (Metric values, scores). No DM Sans, no dark-red `#521207`, no Stone/Forest/Cream palette: those earlier RFx-only tokens are retired in favor of the shared suite palette so all dashboards are one visual family.

## Reusable components (suite standard, carry forward verbatim)

- `Metric({label,value,sub,accent,warn,good})` - left-rule stat card (WARM/RISK/OK tints by state).
- `Card({title,note,children})` - white panel with a Georgia title, red tick, optional right-aligned note.
- `Badge` / `SevPill({s})` / `PrioPill({p})` - status chips (severity Critical/High/Medium/Low; clarification GATING/HIGH/MEDIUM).
- `STable({columns,rows})` - sortable and searchable table; cells are `{d,v,b,c,a}`; sort glyphs `^`/`v`. Used for heatmaps, scoring, pricing, and delta tables.
- `Pillar({c,k,t,d})` - top-rule comparison card (head-to-head, award).
- `Tip` - recharts tooltip. `StateBanner({kind,msg})` - the NEEDS_INPUT / NOT_APPLICABLE / RESEARCH_PENDING labeled states.
- `ScoreCell`/`PctCell` - colored score and coverage chips. Helpers: 10-point score color/background, coverage color/background, severity color/background.
- recharts (`BarChart`) for ranking and score-distribution bars.

## All-vendor data parity (critical dashboard rule)

Every evaluated vendor (typically 10: 5 deep + 5 condensed in the report) MUST be included in the single `S` data array that drives the dashboard. All vendors share the same data shape (r, nm, hq, emp, rev, fin, pd, ig, cf, fs, sc{}, overview, whyLilly, solution, arch, str[], rsk[], reqNarr, commNarr, opsNarr, clients, ecosystem, esg{r,d}). The overall weighted score `os` is NOT authored on each vendor; it is DERIVED in code from `sc` (the per-category scores, weighted by requirement count) via `S.forEach(s => s.os = wavg(s.sc))`, so the headline number can never drift from the table. Top-5 profiles have richer content; vendors 6-10 have shorter content but identical field structure. This ensures all vendors are selectable and visible in ALL five tabs: Executive Summary ranking, Deep Dive selector, Heatmap columns, Risk cards, and Head-to-Head comparison. Do NOT create a separate condensed/secondary array that only appears in the Executive Summary. If a vendor was evaluated, it appears everywhere.

**Optional per-vendor field.** `inc: true` (boolean) may be set on a vendor to flag it as an existing/incumbent Lilly relationship; the Executive Summary segmentation plane rings an incumbent's marker. It is optional and additive, not part of the required shape above, and defaults to falsy (not incumbent) when absent.

**Companion arrays (Executive Summary).** Two small top-level arrays sit alongside `S` and feed the Recommendation card and the segment tiles: `EXCLUDED` (vendors that surfaced in research but never entered the scored shortlist; mirrors `excluded_vendors.csv`: `nm`, `reason` [one of the fixed `excluded_vendors.csv` reason codes], `detail`, `source`, `date`) and `NEXT_ACTION` (`recommendation`, one of the fixed Step 6 taxonomy: RFP / Pilot / Direct Negotiation / Re-scope / Eliminate Category, plus `rationale`). A `DATA_BASIS` array of short strings (internal search coverage, external search count, requirements basis, research date) renders as chips at the foot of the Recommendation card so the recommendation states what it stands on.

## Canonical tabs (all 5, every mode, every category)

1. **Executive Summary** - 4 KPI cards (vendors evaluated, total requirements, top weighted score, recommended supplier); a two-column row of an Evaluation Summary narrative card and an expanded Recommendation card (primary + secondary rationale, an "also in the running" runner-up list, an "eliminated before the shortlist" list sourced from `EXCLUDED`, a Next Action chip from the fixed taxonomy with rationale, and data-basis coverage chips); the supplier ranking as a horizontal weighted-score bar list; a two-column **Fit x Risk Segmentation** section (a quadrant plane positioning every evaluated vendor by weighted fit score against a derived 0-5 risk index, with two interactive threshold sliders that live-reclassify every vendor, paired with a **Segments** card of four segment tiles - Leader / Challenger / Niche / Caution - each with a vendor-chip list plus a disqualified-count tile sourced from `EXCLUDED` and a synthesis paragraph); and a two-column **Market Structure** section (a share-of-fit stacked bar with HHI, Top-1, and Top-3 share stat tiles, explicitly labeled "share of fit, not market share," paired with a Concentration Read narrative card).
2. **Supplier Deep Dive** - a supplier selector (ALL evaluated vendors, not just deep profiles), a 5-KPI row (weighted score, fit score, employees, revenue, domain depth), and six locked sub-sections: **Profile & Fit**, **Solution & Architecture**, **Strengths & Risks**, **Requirements Analysis** (per-category 10-point table), **Commercial & Operational** (commercial model + implementation + ESG & sustainability rating; private-company financials shown as RESEARCH PENDING, never invented), **Clients & Ecosystem**. Top-5 profiles have full depth; vendors 6-10 have shorter content but the same data structure and sub-sections so they render identically.
3. **Requirements Heatmap** - category-by-vendor 10-point heatmap with ALL evaluated vendors as columns and a weighted-average row, weighted by requirement count. Followed by a read of who leads each category and what the gaps mean.
4. **Risk Assessment** - an introductory paragraph, then a **Cross-vendor risk roll-up** card: a dimension-by-vendor severity grid (Operational, Financial, Cybersecurity, Geopolitical, Legal & Regulatory, ESG - the last two added dimensions; ESG derives from each vendor's existing ESG rating, Legal & Regulatory shows a dash rather than a fabricated rating where no item was flagged) with a synthesis paragraph, followed by the per-vendor risk cards for ALL evaluated vendors (not just deep profiles), each risk classified by category and severity (Low / Medium / High), plus a cross-cutting risk observation card at the bottom.
5. **Head-to-Head** - a **Competitive Dynamics** card atop the tab (leader-gap, vendors-within-band, and clear-leader/close-race/fragmented-field stat tiles derived from the full ranking, independent of which two vendors are selected, with a short narrative), then the two-vendor selector (ALL evaluated vendors selectable), side-by-side summary cards, a category-by-category delta table (positive delta in Bold-Blue navy POS, negative in Lilly Red; no green), and a key-tradeoff synthesis.

## Mode content mapping (content only, structure fixed)

- **Full Report mode:** all five tabs populated from the full field of suppliers and the deep profiles, with the full per-vendor research depth.
- **Supplement mode:** same five tabs and same depth, applied to the supplement's added or updated suppliers; the ranking, heatmap, and head-to-head incorporate the new entrants alongside the carried-forward field. The tab set, components, and layout are identical.

## Anti-patterns (explicitly prohibited)

1. No per-run redesign, no vanishing tabs, no thin-by-skipping (run the searches; show RESEARCH PENDING only for a genuine gap).
2. No fabricated suppliers, scores, financials, or market rates (Global Rule 3).
3. No key-value dump profiles. Profiles open with narrative prose; tables are for the requirement scores and numeric comparisons only.
4. No emoji, box-drawing, escapes, or entities as visible text.
5. No em dashes anywhere.

---

## INLINED: references/output-schemas.md

# Output Schemas

## Supplier Profile Schema

Each supplier profile must include these fields:

| Field | Description | Required |
|-------|-------------|----------|
| supplier_name | Legal entity name | Yes |
| headquarters | City, Country | Yes |
| company_size | Employee count or range (if known) | No |
| financial_health | Public signals only (e.g., "Publicly traded", "Series C funded") | No |
| core_offering_summary | 2-3 sentence capability description | Yes |
| alignment_to_need | Qualitative fit assessment | Yes |
| known_risks | Object with categories: legal, cybersecurity, operational, geopolitical, financial (matches Risk Categories Required in Every Profile; ESG is tracked separately as its own standalone profile field, not a risk category) | Yes |
| pricing_model | Only if publicly disclosed (e.g., "Per-seat SaaS", "Usage-based") | No |
| contracting_considerations | High-level only (e.g., "Requires BAA", "Standard MSA") | No |
| internal_vendor_status | Active / Former / None / Unknown | Yes |
| industry_experience | Regulated industry experience (esp. pharma, healthcare, finance) | Yes |
| integration_fit | Compatibility with SAP, M365, etc. | Yes |

**Evidence markers** - use these exact strings when information is unavailable:
- `"Information Not Provided"` - supplier didn't disclose
- `"Not Publicly Disclosed"` - confidential/proprietary
- `"Not Determined"` - research couldn't confirm

## CSV Schemas

### supplier_registry.csv

```csv
supplier_name,headquarters,company_size,financial_health,core_offering,internal_status,industry_experience,integration_fit,pricing_model,website
```

### requirements_fit_matrix.csv

```csv
supplier_name,requirement_1,requirement_2,requirement_3,...,weighted_score,overall_fit
```

This is the scored matrix. Each `requirement_N` cell carries the 0-10 capability-fit score (up to 2 decimals) used in the report's scored table. `weighted_score` is the requirement-count-weighted average (0-10). `overall_fit` is the categorical band derived from the weighted score, and is the value that feeds the rfp-engine handoff: `Strong` (8.5 and up), `Partial` (7 to 8.49), `Weak` (below 7), or `Information Not Provided` when evidence is missing.

If no requirements provided, use inferred capability themes and label column headers as `[Inferred] Theme Name`.

### risk_matrix.csv

```csv
supplier_name,risk_category,risk_description,severity,evidence_source
```

Risk categories: `Legal`, `Cybersecurity`, `Operational`, `Geopolitical`, `Financial` (matches Risk Categories Required in Every Profile; the dashboard's Risk Assessment heatmap adds an ESG column separately, sourced from each vendor's existing ESG & Sustainability rating, not from a row in this CSV)

Severity values: `Low`, `Medium`, `High`

Evidence source: URL, document name, or `"Not Determined"`

### excluded_vendors.csv

```csv
vendor_name,reason_code,reason_detail,source,date
```

`reason_code` values: `FAILED_DISQUALIFIER`, `OUT_OF_SCOPE`, `INSUFFICIENT_EVIDENCE`, `DUPLICATE`, `BUYER_EXCLUDED`. The `reason_detail` states the specific disqualifier or rationale (for example, "no GxP track record" or "does not operate in required geography"). This is the disqualifier audit trail that makes the shortlist defensible: it records what was considered and dropped, not just what made the cut. If nothing was excluded, emit one row with `vendor_name` blank and `reason_detail` = "none excluded".

## JSON Schema (supplier_landscape_ui.json)

```json
{
  "metadata": {
    "generated_at": "ISO-8601 timestamp",
    "mode": "full_report | supplement",
    "business_need_summary": "string",
    "total_suppliers_evaluated": number
  },
  "suppliers": [
    {
      "rank": number,
      "name": "string",
      "headquarters": "string",
      "internal_status": "Active | Former | None | Unknown",
      "overall_fit": "Strong | Partial | Weak",
      "overall_risk": "Low | Medium | High",
      "core_offering": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "requirements_fit": {
        "requirement_name": "Strong | Partial | Weak | Information Not Provided"
      },
      "risks": [
        {
          "category": "string",
          "description": "string",
          "severity": "Low | Medium | High"
        }
      ]
    }
  ],
  "recommendations": {
    "top_3": [
      {
        "rank": number,
        "name": "string",
        "rationale": "string"
      }
    ],
    "eliminations": [
      {
        "name": "string",
        "reason": "string"
      }
    ],
    "next_action": {
      "recommendation": "RFP | Pilot | Direct Negotiation | Re-scope | Eliminate Category",
      "rationale": "string"
    }
  },
  "comparative_summary": [
    {
      "supplier": "string",
      "fit_to_need": "string",
      "risk_level": "Low | Medium | High",
      "pricing_model": "string",
      "integration_fit": "string",
      "internal_status": "string",
      "overall_assessment": "string"
    }
  ]
}
```

---

## Market Context Schema

Included in `landscape_handoff.json` and optionally in `supplier_landscape_ui.json`:

| Field | Description | Required |
|-------|-------------|----------|
| `porter_forces` | Object with 5 forces, each having level (H/M/L) and summary | Yes |
| `market_size` | Object with value, source, confidence | If publicly available |
| `pricing_trend` | Object with direction, range, detail | Yes |
| `key_trends` | Array of {title, detail, impact_on_lilly} | Yes (3-5 items) |
| `key_risks` | Array of {title, detail} | Yes |
| `research_date` | ISO date of when research was conducted | Yes |
| `sources_consulted` | Array of source strings with dates | Yes |

This data flows into rfp-engine's Background section and evaluation criteria. Must be web-researched, not fabricated. Every claim must cite its source.

---

## INLINED: references/report-structure.md

# Report Structure

> **One report depth only.** This skill has TWO modes (Full Report and Supplement), and BOTH produce the same full-depth report and the same locked five-tab dashboard. There is no brief mode and no abbreviated report variant: the only difference between the two modes is which suppliers are carried forward as fixed entries (see Supplement Mode). The single canonical report structure for both modes is defined above, in the "Complete Report Structure (Required Sections)" section.

## Full Report (up to 30 pages)

### Structure

The required report sections, their names, and their order are defined once, above, in the **"Complete Report Structure (Required Sections)"** section. This inlined reference deliberately does not restate that list, so the two cannot drift apart. The Full Report uses that canonical section list at full depth; the Supplement carries forward fixed supplier entries but is otherwise identical in structure. Any page counts are budget guidance only and do not override the canonical section names or order.

## Formatting Standards

- Use docx skill for document creation
- **Lilly logo** on title page (bundled transparent PNG from the shared `/mnt/skills/user/lilly-brand-assets-1c344a/assets/logos/` directory: Black/Red on light, White on dark)
- **Section number badges:** 1x2 table cells (Lilly Red number cell + dark title cell) as section dividers
- **KPI highlight cards** on title page and per-supplier (4-5 key metrics in table cells)
- **Callout boxes** (shaded 1x1 table cells) for key findings and recommendations
- Headers, body fonts, and exact hex values: pull from the Magazine Report house style in `/mnt/skills/user/lilly-brand-assets-1c344a/references/docx-design-system.md` and `/mnt/skills/user/lilly-brand-assets-1c344a/references/brand-colors.md`. Do NOT use the retired olive/forest #6F7D45 heading color or any green: section headings are charcoal #212121 with a Lilly Red rule, per the suite no-green rule.
- Body text: Charcoal (#212121), per the docx-design-system body spec
- Tables: Lilly Red (#E1251B) header rows with white text, alternating row shading
- Color-coded heatmap cells for scoring matrices using the suite score bands (no green): strong = Bold Blue text on a cool-blue tint, adequate = amber on a warm tint, gap = Lilly Red on a red tint. Match the dashboard score bands so the DOCX and dashboard agree.
- Page numbers in footer
- Confidentiality notice: "Company Confidential  (c) 2026 Eli Lilly and Company"

## Writing Standards

- **Narrative prose for profiles and analysis.** Supplier profiles open with 2-3 flowing paragraphs, not key-value tables. Analysis is connected prose with proper paragraph structure.
- **Bold-label-then-description** for capability and feature lists (bold the name, then explanation in regular weight on same paragraph)
- **Proper bulleted and numbered lists** where items are genuinely list-worthy (in DOCX prose, do not type "+" or "-" as bullet substitutes; the dashboard uses CSS-drawn markers, not typed characters)
- **Tables for data only** -- scoring matrices, pricing comparisons, requirements fit grids. Not for narrative content.
- **No filler** -- every sentence advances understanding
- **Evidence-based** -- cite sources or mark as inference
- **Decision-oriented** -- frame for procurement decisions
- **Section transitions** -- each section opens with 1-2 sentences of context before the detail

