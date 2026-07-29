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
- **Drop, do not dilute (G12).** A finding you cannot cite is DELETED, not softened. Rewriting "the MSA sets no data-breach notification window" into "the agreement may not fully address breach notification" does not make the finding safer, it makes it unfalsifiable, and it hides the fact that nothing was found. Abstaining is visible; diluting is not. If the source is not there, the finding does not ship.

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
- **Skill:** Supplier Landscape
- **Version:** 3.0
- **Suite:** v10.6.6
- **Last Updated:** July 21, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)
- **Changelog:** (newest first)
  - v3.0 (July 2026): LOCKED the platform-fidelity dashboard. The dashboard is now a self-contained HTML artifact built DETERMINISTICALLY by the shipped Python engine (`dashboard/build_dashboard.py` + `dashboard/assets/`), NOT a hand-authored React/JSX file. Structure: Overview, Supplier Deep Dive (six subtabs: Summary, Company & Ownership, Capabilities & Operations, Financial & Market, Risk & Resilience, Lilly Fit & Diligence), Head-to-Head, Requirements Heatmap, Risk Assessment. Palette plum #5C2B50 / teal #2F6E6B / burnt-orange #C15E19 (no blue, no green). Head-to-Head comparisons and Evidence Confidence render on a shared center spine; real projected geo map + right-branching ownership/dependency trees; every visible "reflect-only"/"illustrative" hedge removed. The LLM authors ONLY the data object (`dashboard/assets/landscape-data.js`); the locked engine renders every tab. Retired the inlined React/JSX canonical and the old five-tab / Bold-Blue #0F3A85 spec.
  - v2.5 (July 2026): Executive Summary tab gains the signature Fit x Risk Segmentation plane (a quadrant positioning every evaluated vendor by weighted fit score against a derived 0-5 risk index, with two live-recomputing threshold sliders) paired with a Segments card (Leader / Challenger / Niche / Caution tiles plus a Disqualified tile, each with vendor chips and a synthesis paragraph), and a Market Structure card (share-of-fit stacked bar with HHI / Top-1 / Top-3 concentration stats, explicitly labeled "share of fit, not market share," paired with a Concentration Read narrative). The Recommendation card is expanded (still the same card, not a new one) with an "also in the running" runner-up list, an "eliminated before the shortlist" list, a fixed-taxonomy Next Action chip with rationale, and data-basis coverage chips, backed by two new companion arrays (`EXCLUDED`, `NEXT_ACTION`) that mirror the existing `excluded_vendors.csv` and Step 6 next-action schema. Risk Assessment tab gains a Cross-vendor risk roll-up heatmap (dimension x vendor severity grid, adding Legal & Regulatory and ESG as dimensions) ahead of the existing per-vendor risk cards. Head-to-Head tab gains a Competitive Dynamics strip (leader gap, vendors within band, clear-leader/close-race/fragmented-field read) computed from the full ranking, ahead of the existing pairwise selector. Added an optional `inc` (incumbent) boolean field to the vendor data shape (additive, defaults falsy). No tabs added, removed, or reordered; all five canonical tabs and every existing element are unchanged in place and structure.
  - v2.4 (June 2026): v10.6.3 fix pass. Removed the residual brief-mode language and JSON enum (this skill has no brief mode). Removed the off-allow-list cloud-drive entry from internal-search sources, leaving the M365 connector (SharePoint / OneDrive / Outlook / Teams) only. Canonicalized the palette to one set with the #0F3A85 token named "Bold Blue" and no green in any status band; removed the dead retired BRN token; fixed the changelog/canonical-doc/code palette-naming drift. Example dashboard S array now carries all 10 evaluated vendors. Overall score (os) is now DERIVED from the per-category sc weighted average in code (it can no longer drift from the live data, fixing the prior hardcoded 8.70 vs computed 8.88). Made the dashboard category-neutral: the requirements table is "all categories" not a fixed 15, and the KPI/profile templates no longer hardcode the supply-chain-planning "years in SCP" field. Scoped the no-"+" content rule to DOCX prose and switched the dashboard strength marker to a non-"+" tick. Pinned the heatmap WEIGHTED AVERAGE summary row so sorting cannot reorder it into the data. Quoted the description triggers and added a supplier-deep-dive BOUNDARY guard.
  - v2.3 (May 2026): All-vendor dashboard parity (vendors 6-10 in main S array, all 5 tabs). Page breaks restricted to title page and TOC only. Authorship line made generic (not hardcoded to any user). Citation rules added: internal docs cite full title/version/section; external web sources include URL; analyst reports cite title/author/date. Updated the inlined dashboard-canonical spec tab specs to explicitly reference all evaluated vendors in every tab.
  - v2.2 (May 2026): Dashboard re-skinned to the SHARED SUITE house style (Arial + Georgia, charcoal #212121 header with red rule, the shared suite palette of Red / Charcoal / Bold Blue accents, Metric/Card/STable/SevPill/Pillar components). Retired the RFx-only DM Sans / #521207 dark-red / Stone-Forest palette so all suite dashboards are one visual family. Five-tab structure unchanged.
  - v2.1 (May 2026): LOCKED canonical dashboard (the dashboard-canonical spec plus the canonical dashboard example JSX, both inlined below). Five mode-invariant tabs identical across Full Report and Supplement modes and every category; content varies, structure does not. Every tab always renders (labeled states). Depth parity from internal and external research, never fabrication. Category-neutral KPI labeling.
  - v2.0 (May 2026): Scoring matrix, contract flexibility, ESG, research methodology, section depth requirements, requirements-as-input best practice, universal commodity support
  - v1.0: Initial release
- **Suite-wide guardrails note:** The shared Execution Guardrails G1-G12 (tool selection, gate checks, existing-context-first, definition tracing, data-model-first for dashboards, pre-delivery self-test, research minimums, pass-artifact enforcement, anti-collapse) apply to every run of this skill. This is a cross-cutting suite convention, not a per-skill version; see the GLOBAL OPERATING RULES (Rule 9) above for the full G1-G12 text.

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
2. **Supplier landscape dashboard** - a self-contained interactive HTML artifact built DETERMINISTICALLY by `dashboard/build_dashboard.py`. Do NOT hand-author JSX/React or CSS: your only job is the data object (`dashboard/assets/landscape-data.js`); the shipped, locked engine renders every tab. See "## INLINED: references/dashboard-canonical.md" for build steps and the data contract
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

**Scoring:** Rate each supplier 0-10 per category. Include 1-sentence rationale per score.

**HARD RULE, kernel usage (per Execution Guardrails G11).** The weighted sum is NOT computed by model arithmetic. Call `weighted_score()` in the vendored `numeric_kernel.py`, once per supplier, and write the returned figure into both the report table and `weighted_scoring_matrix.csv`.

```
from numeric_kernel import weighted_score

WEIGHTS = {
    "alignment_to_business_need": 0.30, "technical_operational": 0.15,
    "risk_profile": 0.15, "pricing_model": 0.15, "contract_flexibility": 0.10,
    "lilly_vendor_status": 0.05, "industry_regulatory_experience": 0.05,
    "integration_fit": 0.05,
}
total = weighted_score(supplier_scores_0_to_10, WEIGHTS)
```

The eight default weights above sum to exactly 1.00. If the user customizes them, `weighted_score()` refuses with `WeightSumError` when the customized set does not foot to 1.0 within 0.001, rather than scoring against un-footed weights. That is the same guard that catches the market-rate-benchmarking v2.1 defect (weights summing to 1.05), and a customized weight set is exactly where that defect would recur here. Do not renormalize to work around a refusal: fix the weights with the user and re-call, because silently rescaling changes the ranking the user asked for.

The same rule applies to the separate requirement-count-weighted score in `requirements_fit_matrix.csv`. Both are weighted sums and both go through the kernel; they remain two distinct scoring systems per the note below, computed the same way.

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
- **Title page, Table of Contents, header, footer, page setup (LOCKED):** `the "## INLINED: references/docx-title-page-spec.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`. This skill's report title is **"SUPPLIER MARKET LANDSCAPE"**; the subtitle is the sourcing event or category; metadata line 1 reflects this skill's counts (e.g., "{N} Vendors Evaluated | {N} Categories"); metadata line 2 is "Prepared by Eli Lilly and Company | {Month Year}". Everything left-aligned.
- **Colors, fonts, section badges, KPI cards, callouts, tables:** `the "## INLINED: references/docx-design-system.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and `the "## INLINED: references/brand-colors.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`.
- **Which house style applies and why:** `the "## INLINED: references/house-styles.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`.
- **Lilly logo** on the title page from `/mnt/skills/user/lilly-brand-assets-1c344a/assets/logos/` (Black or Red on light pages); if unavailable, extract it from a prior report in the conversation.

**Formatting rules:** No excessive whitespace, consistent spacing (200 twips after for body, 264 twips line spacing), tight table cell padding (60 top/bottom, 100 left/right). Page breaks ONLY after the title page and after the Table of Contents page. Do NOT insert page breaks between supplier profiles, sections, or anywhere else in the body. Let content flow naturally with section badges and headings providing visual separation.

**Authorship line:** The title page "Prepared by" line must NOT be hardcoded to any specific person, title, or team name. Use a generic default ("Prepared by Eli Lilly and Company | [current month/year]") unless the user explicitly provides an author name or team. Do not pull authorship from memory, conversation context, or inferred user identity. The skill is used across all categories and commodities by any procurement rep.

**Citation rules (mandatory for Research Methodology and all sourced claims):**
- **Internal documents:** Cite the full document title, version/date, and relevant section or clause number (e.g., "2024 Concur Technologies GTC, enUS.v.2-2022b, Section 4.3" or "Scenario Planning RFP Functional Requirements Matrix, v1.0, May 2023, Demand Planning tab").
- **External web sources:** Include the source name, publication date (or "as of" date), and the full URL (e.g., "Kinaxis Q4 2025 Earnings Press Release, March 5, 2026, https://ir.kinaxis.com/..."). URLs enable the reader to verify the claim independently.
- **Analyst reports:** Cite the report title, author(s), publisher, and publication date (e.g., "Gartner Magic Quadrant for Supply Chain Planning Solutions: Process Industries, Pia Orup Lund et al., March 18, 2026"). Do not include URLs for paywalled analyst content.
- **Confidence flags:** Every external figure in the Research Methodology section carries a High / Medium / Low confidence flag per the suite standard.

### Dashboard (deterministic build - LOCKED)

**The supplier-landscape dashboard is a platform-fidelity, self-contained HTML artifact built by Python, not a hand-authored React/JSX file.** The finished design is locked and shipped inside this skill under `dashboard/`. Do not reinvent it, do not clone a JSX reference, do not restyle it per run.

**The two-layer split:**
- **Deterministic layer (never touched per run):** `dashboard/build_dashboard.py` inlines a fixed rendering engine (`dashboard/assets/pv/*.js` + `pv.css` + `theo-color.css` + fonts + the world-map asset + a light Lilly/Theo chrome) into ONE self-contained ~3.3MB HTML file. The engine does ALL calculation and rendering in the browser: weighted-fit rollups, rank ordering, the heatmaps, the head-to-head center-spine bars, the geo map, layout. You never author or edit this code.
- **Content layer (your job):** produce the data object `dashboard/assets/landscape-data.js` as `PROJECTS['<key>'] = { ...project... }; CURPROJ='<key>';`. Research per the workflow above, then populate it. The engine renders whatever is in it. The `landscape-data.js` shipped here is a complete worked example: it IS the schema, match its shape.

**Build command (after writing landscape-data.js):**

`python dashboard/build_dashboard.py --out /mnt/user-data/outputs/supplier-landscape.html --user "Procurement User"`

`--subject` is read automatically from the data's `category`/`title`. Output is one shareable, self-contained HTML file; never emit the HTML by hand.

**Canonical structure (LOCKED, mode- and category-invariant):** five top-level tabs, one carrying six deep-dive subtabs. Every tab always renders; genuinely-absent data is gap-stated in place, never dropped or faked.
- **Overview** - executive summary + recommendation (ranked table with dispositions), fit x risk segmentation quadrant, market structure.
- **Supplier Deep Dive** (vendor selector), six subtabs: Supplier Summary (top-sheet recommendation), Company & Ownership (merged firmographics/identity, right-branching ownership tree, real geo map), Capabilities & Operations (capability-to-requirement heatmap, delivery readiness, dependency tree), Financial & Market (revenue trend, health bridge, peer scatter, commercial model), Risk & Resilience (impact x likelihood matrix, ranked material-risks register, posture, mitigation), Lilly Fit & Diligence (fit read, internal relationship, diligence funnel, action board).
- **Head-to-Head** - pick any two suppliers; per-requirement, risk-difference, commercial-model, and evidence-confidence comparisons ALL on a shared center spine.
- **Requirements Heatmap** - category x supplier fit grid (plum single-hue ramp, darker = stronger), rank-ordered columns, per-category leadership + knockout matrix.
- **Risk Assessment** - portfolio summary, cross-supplier risk-by-dimension heatmap (rank-ordered, teal/burnt-orange/red ramp), selected-supplier register + material events.

**Palette (LOCKED):** plum `#5C2B50` primary + teal `#2F6E6B` secondary + burnt-orange `#C15E19` emphasis; critical-red reserved for gaps/critical only. No blue, no green. The engine encodes this; do not override it per run.

**Honesty rules (unchanged, Global Rule 3):** reflect-only / advisory, no vendor selected or contacted; never fabricate suppliers, scores, financials, or citations; genuinely-missing figures read "Data not available"; provenance labeled (internal / external public / not validated).

Full locked spec + data contract: "## INLINED: references/dashboard-canonical.md" below.

### Report and CSV Generation (single pass, code-assembled)

```bash
python landscape_report_generator.py <landscape.json> <outdir>
python landscape_report_selftest.py                            # run after any edit
```

The report and ALL FIVE CSVs are emitted by one call, from one data object. Your job is the
data object and the narrative for each section; the generator assembles the document.

**This REPLACES the old three-pass open/append/save instruction.** That pattern told you to
write a partial document, reopen it, append and save, three times. F2 removed exactly that
from rfp-response-analysis.

**Do not "fix" it by writing the whole report in one model pass instead.** That is the
truncation failure G10 warns about: a long document silently comes out short and looks
finished. Because the generator ASSEMBLES the document rather than writing it, length stops
being a generation-time risk at all, however many suppliers are in scope.

**The CSVs come from the same call as the report, on purpose.** Emitting them separately is
how a report and its own appendix end up disagreeing, and a reader who notices cannot tell
which one is wrong. The generator refuses when a supplier appears in one artifact and not
another.

**The two scoring systems stay separate, and the generator enforces it.**

| system | scale | artifact | feeds |
|---|---|---|---|
| requirements-fit, requirement-count-weighted | 0-10 | `requirements_fit_matrix.csv` | the dashboard headline score |
| 8-pillar, percentage-weighted | 0-10 against weights summing to 100 | `weighted_scoring_matrix.csv` | a report table ONLY |

Writing one into the other's artifact produces a figure that is individually correct and
completely wrong in context. Both go through `weighted_score()` in the vendored kernel (G11).

**It refuses rather than emitting a plausible artifact set:**

| refusal | why |
|---|---|
| pillar weights not summing to 100 | the kernel's `WeightSumError` |
| a fit score outside 0-10 | a score off its own scale is a unit error, and it ranks this supplier against others measured differently |
| a stated `overall_fit` contradicting its own score | the band is derived; a disagreement means one of the two was hand-edited, and this value feeds the rfp-engine handoff |
| a supplier in one artifact and missing from another | artifacts from one run must describe one supplier set |
| a score written into `supplier_registry.csv` | the registry is profile data only; a duplicated score will eventually disagree with the original |
| a blank pillar cell | it silently reweights every other pillar for that supplier |
| a blank `evidence_source` on a risk row | "Not Determined" is the honest answer; blank reads as evidence never looked for |

**Absence is stated, never left blank.** A supplier with no evidence on a requirement scores
`Information Not Provided`, not `0.0`, because a zero ranks them last on merit when nothing
was measured. An empty exclusion list still writes a row reading "none excluded", because an
empty file is indistinguishable from a step that never ran, and this file exists to make the
shortlist defensible.

Every section maintains full depth regardless of supplier count.

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

Follow the suite DOCX spacing in `the "## INLINED: references/docx-design-system.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`: paragraph after-spacing and section before-spacing, body line height, no empty spacer paragraphs, and page breaks only after the title page and the table of contents (the document otherwise flows continuously).

## Dashboard Creation Rules (Mandatory)

The dashboard is built by the shipped Python engine, not hand-authored:
- Write the data object to `dashboard/assets/landscape-data.js` (shape = the worked example already there), then run `python dashboard/build_dashboard.py --out /mnt/user-data/outputs/supplier-landscape.html --user "<name>"`, and present the resulting HTML file.
- NEVER hand-write the dashboard HTML/JSX, and NEVER edit `dashboard/assets/pv/*.js`, `pv.css`, or `theo-color.css` per run. The engine and its palette are LOCKED; per-run variation lives ONLY in the data object.
- If code execution is unavailable this session, say so and fall back to the DOCX report + CSVs; do not try to emit the ~3.3MB HTML as text.
- All suite honesty rules apply to the data you author (Global Rule 3): no fabricated suppliers, scores, or citations; gap-state genuinely-missing data.

## Acronym and Terminology Rules

Per `the "## INLINED: references/narrative-standards.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`: spell out every acronym on first use in both DOCX and dashboards; include a glossary when more than 5 unique acronyms appear (DOCX) or a footer legend (dashboard).

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

## INLINED: references/dashboard-canonical.md

# Supplier Landscape Dashboard - Canonical Structure (LOCKED, platform-fidelity build)

**This supersedes the earlier React/JSX canonical.** The dashboard is a self-contained HTML artifact assembled by `dashboard/build_dashboard.py` from a fixed rendering engine (`dashboard/assets/`) plus a per-run data object. The engine is the source of truth for layout and styling; this records the locked decisions and the data contract. Do NOT hand-author JSX.

## Build (deterministic)
1. Research per the workflow, then write `dashboard/assets/landscape-data.js`:
   `var PROJECTS=PROJECTS||{}; PROJECTS['<key>']={ ...project object... }; CURPROJ='<key>';`
   The object shape is defined by example: the `landscape-data.js` shipped in this skill is a complete, valid instance. Match its keys (title/category; suppliers[]; requirements[]; per-supplier coverage/scores; risk dimensions; financials; ownership; capabilities; references; events; etc.).
2. Run: `python dashboard/build_dashboard.py --out /mnt/user-data/outputs/supplier-landscape.html --user "Procurement User"`.
3. Present the single HTML file. It is fully self-contained (fonts, world map, chrome inlined) with no network calls, so it renders as a Claude Desktop artifact.

## Canonical tabs (LOCKED - same every run, mode, and category)
- Overview: executive summary + recommendation (ranked table, dispositions), fit x risk segmentation quadrant, market structure.
- Supplier Deep Dive (vendor selector) with six subtabs: Supplier Summary; Company & Ownership; Capabilities & Operations; Financial & Market; Risk & Resilience; Lilly Fit & Diligence.
- Head-to-Head: per-requirement, risk-difference, commercial-model, and evidence-confidence, ALL on a shared center spine.
- Requirements Heatmap: category x supplier fit grid (plum single-hue ramp), rank-ordered columns, leadership + knockout matrix.
- Risk Assessment: portfolio summary, cross-supplier risk-by-dimension heatmap (rank-ordered), selected-supplier register + material events.

## Palette (LOCKED)
plum #5C2B50 primary, teal #2F6E6B secondary, burnt-orange #C15E19 emphasis; critical-red for gaps/critical only. No blue, no green. Encoded in the engine (theo-color.css + pv.css tokens + render code); never overridden per run.

## Determinism guarantee
Same data object in => byte-identical dashboard out. Structure, tabs, components, palette, and layout never change per run or mode; only the data changes. Every tab always renders; genuinely-absent data is gap-stated in place ("Data not available" / "not assessed"), never dropped, blanked, or fabricated.

## Honesty (unchanged, suite-wide)
Reflect-only / advisory; no vendor selected or contacted. Never fabricate suppliers, scores, financials, or citations. Provenance labeled (internal / external public / not validated). Gates are risk signals to clear downstream, not SME routing.

## Engine files (LOCKED - do not edit per run)
`dashboard/build_dashboard.py` (assembler) and `dashboard/assets/` (`pv/pv-01-boot-helpers.js`, `pv/pv-04-domain-data.js`, `pv/pv-07-landscape-render.js`, `pv/pv-07a-assess-model.js`, `pv/pv-07b-deepdive.js`, `pv/pv.css`, `theo-color.css`, `fonts-inline.css`, `app-shell.css`, `app-shell.js`, `theo-brand.js`, `pv-worldmap.js`, `pv-extracted-helpers.js`, `theo-dino-mark.png`, `landscape-data.js`). Changing these changes the LOCKED design and is a deliberate, owner-approved design change, never a per-run edit.

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

> **FALLBACK COPY, not the source of truth.** The authority for `landscape_handoff.json` is
> `rfp-engine-1c344a/references/landscape-intake-schema.md`. rfp-engine is the CONSUMER of
> this handoff and owns the schema, because the consumer is the party that breaks when the
> shape is wrong. Steps 5 and the handoff section above already say this.
>
> What follows is inlined so the handoff stays complete and self-describing when rfp-engine
> is not installed. Do not hand-edit it as though it were the schema: change the source
> first, then re-sync this block in the same commit. If the two disagree, the source wins
> and this copy is the defect.

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
- Headers, body fonts, and exact hex values: pull from the Magazine Report house style in `the "## INLINED: references/docx-design-system.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and `the "## INLINED: references/brand-colors.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`. Do NOT use the retired olive/forest #6F7D45 heading color or any green: section headings are charcoal #212121 with a Lilly Red rule, per the suite no-green rule.
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

