---
name: rfp-response-analysis-1c344a
description: >
  Supplier response extraction, profiling, cross-vendor comparison, and evaluation report generation.
  Use when supplier RFP submissions have arrived and the user needs a comprehensive evaluation report
  with per-supplier analysis, cross-cutting comparisons, weighted scoring, and preliminary recommendations.
  Triggers on phrases like "summarize the supplier responses", "build supplier profiles",
  "compare what each vendor said", "analyze supplier responses against the requirements",
  "what did each vendor say about [topic]", "where do the suppliers differ", "show me the
  gaps in supplier coverage", "extract pricing from the responses", "evaluate the RFP responses",
  "produce the supplier evaluation report". Produces analysis_summary.docx (the primary,
  standalone deliverable) and pipeline artifacts for evaluation-engine. Cross-vendor data
  (coverage, commercial, citations, an AI first-pass score) renders in the suite's locked
  rfx-hub-1c344a dashboard, not a standalone dashboard of its own.
metadata:
  author: "Marc Lane, Associate Director, Global IT Procurement"
  suite: v10.7.0
---


<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Internal footprint: flag which responding suppliers are current Lilly vendors (incumbent detection) and surface current spend as context, labeled.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


<!-- MERGED PACKAGE (v10.7.0): All reference, example, and component files are inlined at the end of this document. When the skill text says "read references/foo.md" or "load references/foo.md", the content is already present below under the heading matching that filename. Do NOT attempt to read files from disk; they are here. -->

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
- Before asking the user anything about where this RFx's documents live, check for an existing Teams-site binding first (rfp-case-manager's `_case_file.json` or a `case_handoff.json` upstream). Read `the "## INLINED: references/rfx-teams-site-binding.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and follow it -- bind once per RFx event, reuse across every skill that touches it.
- When this skill produces an analytical document, deck, or dashboard, also read `the "## INLINED: references/narrative-standards.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (output must read as connected analysis, not a key-value dump or bullet fragments), `the "## INLINED: references/validation-checklist.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (re-verify numbers, sources, and cross-artifact consistency before delivering), and `the "## INLINED: references/house-styles.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (use the correct one of the three named house styles; pull exact values from brand-colors.md / dashboard-components.md / docx-design-system.md; never invent off-style palettes, fonts, or components).
- When this skill assesses a supplier's risk (financial, cyber, data, geopolitical, operational, or pharma gates like debarment/sanctions/GxP), also read `the "## INLINED: references/supplier-risk.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and follow its hard anti-fabrication rules: never assert a debarment, sanctions, breach, or financial-distress status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the SME.
- **Foundation dependency / graceful degradation:** these references live in the shared `lilly-brand-assets` skill (v10.0+ expected). If a `lilly-brand-assets-1c344a/references/...` file or asset cannot be read (the foundation is missing, corrupted, or older than this skill expects), do NOT fail: proceed using the rule summary inlined below, tell the user you are running without the shared references (so styling/depth may be reduced), and ask them to confirm lilly-brand-assets v10.0+ is installed and current.
- Summary of the guardrails (G1-G13):
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

## BLOCKING FILE INPUTS (checked by S0)
- **Required:** Supplier submissions (one folder or zip per vendor) plus the completed requirements matrix from the RFP.
- **Helpful:** Pricing templates, MSA redlines per vendor, the original RFP instructions.

# Version
- **Suite:** v10.7.0
- **Skill:** RFP Response Analysis
- **Version:** 3.6
- **Last Updated:** July 22, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)
- **Suite-wide guardrails note:** Execution guardrails G1-G13 apply suite-wide (tool selection, gate checks, definition tracing, data-model-first for dashboards, pass-artifact enforcement, anti-collapse). See the GLOBAL OPERATING RULES block above and `the "## INLINED: references/execution-guardrails.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`. This is a suite convention, not a per-skill version.
- **Changelog:**
  - v3.7 (July 2026): Removed the standalone `response_analysis_dashboard.jsx` (the 6-tab canonical dashboard, its dashboard-canonical spec, and its inlined reference build) per the suite's own rfx-hub-1c344a rule, "No lens skill builds its own version of this dashboard." This skill's cross-vendor data (coverage, commercial, citations, the proposed AI first-pass score) already renders in the locked rfx-hub-1c344a dashboard as one of its four feeder slices; the standalone tab set duplicated that surface without adding analytical content, since every tab (Executive Summary, Supplier Deep Dive, Coverage Heatmap, Scoring & Pricing, Risks & Clarifications, Award Recommendation) mapped to a DOCX section that already carries the same analysis at greater narrative depth (the DOCX's own standing rule already required it to be complete on its own, never a pointer to the dashboard). No analytical content was removed: nothing in the DOCX changed. Fixed several now-stale references to the removed dashboard elsewhere in this file (the Bid Leveling gate check, the pass-artifact rule, the branding line, the profile schema, and a stale generic "(JSX dashboard, XLSX, PPTX)" capability line corrected to name the real deliverable). Older changelog entries below (v2.0-v3.6) describe the removed dashboard's history and are left as the historical record.
  - v3.6 (July 2026): Added a formal, GATED **Bid Leveling** stage (Workflow Phase 4, new analysis_summary.docx Section 5) that runs after the per-supplier sections and before any cross-vendor ranking, scoring, or recommendation. Bid Leveling normalizes differently-structured supplier proposals to one comparable basis before Sections 6-13, and before the dashboard's Executive Summary ranking, Scoring & Pricing tab, and Award Recommendation tab, may be produced: a stated common comparison basis, a scope-compliance map, an assumption and exclusion register, normalized price by unit/scenario, labeled missing-cost placeholders (never a silent zero), a one-time vs. recurring split, a reported-vs-normalized TCO, and a questions-before-final-evaluation list (new `Bid_Leveling_Gap` value added to `clarification_questions.csv`'s `Source_Type` column). A new **GATE CHECK: Bid Leveling Complete** (per Execution Guardrails G2) blocks the renumbered Phase 5 (formerly Phase 4, Cross-Vendor Comparison), Section 13, the vendor ranking, and the weighted scoring pricing dimension until every supplier that submitted pricing clears it; a supplier that never submitted pricing at all remains labeled NEEDS_INPUT / PENDING and excluded from the normalized comparison, which is the pre-existing non-fabrication behavior, not a new restriction. Workflow phases renumbered (old Phase 4 Cross-Vendor Comparison -> Phase 5, old Phase 5 Pipeline Handoff -> Phase 6, old Phase 6 Supplier Debrief -> Phase 7); pass artifacts renumbered to match (new `RA_4_LEVELING`; `RA_4_CROSSCUT` -> `RA_5_CROSSCUT`; `RA_5_HANDOFF` -> `RA_6_HANDOFF`; `RA_6_DEBRIEF` -> `RA_7_DEBRIEF`). Two new pipeline artifacts, `bid_leveling_worksheet.csv` (per-supplier, per-scenario normalized pricing and TCO) and `bid_leveling_register.csv` (scope-compliance and assumption/exclusion line items), both added to `evaluation_engine_handoff.json` under a new `bid_leveling` object (`gate_passed`, `comparison_basis`, `worksheet_path`, `register_path`) with a matching Validation Rules row, and to `{supplier}_profile.json` under a new `bid_leveling` object. New inlined reference `references/bid-leveling.md` documents the methodology, the normalization formulas (including when to call `escalate()` in `numeric_kernel.py` per G11 for multi-year escalated TCO), and both CSV schemas. **The 6-tab dashboard is unchanged in tab count; no 7th tab was added.** The Scoring & Pricing tab (Tab 4) gains a Bid Leveling Gate status strip, one card per vendor (Complete / Pending), ahead of the existing Weighted Scoring Matrix and pricing comparisons, derived entirely from each vendor's already-modeled pricing fields via a new `bidLevelingStatus()` helper in the reference build; no new per-vendor data fields were required. `comparison-patterns.md` gains DOCX Section 5 (Bid Leveling & Normalization (Gate)) between the supplier evaluation sections and the Section 6-13 cross-cutting block; the cross-cutting block's own numbering (6-13) is unchanged.
  - v3.5 (July 2026): Three dashboard additions to the canonical structure, still 6 tabs, mode-invariant. (1) **Coverage Heatmap** gains a Per-requirement detail panel (category selector plus an `STable` of representative individual requirements with MoSCoW priority, per-vendor Met/Partial/Not Met status, confidence, and source citation, and the per-row leader) so the requirement-level detail that previously existed only in the `requirements_coverage_matrix.csv` pipeline artifact is now surfaced to the user, not just the category rollup. (2) **Scoring & Pricing** gains a Normalized Pricing Comparison (a bar chart of $-per-named-user-per-year list price versus fully loaded, amortized annualized total cost of ownership, paired with narrative analysis) beneath the existing raw Cross-Vendor Pricing Comparison, so once vendors submit pricing the evaluation team gets an apples-to-apples read, not just the raw terms; illustrative pricing was populated for two of the three reference vendors (the third stays NEEDS_INPUT) to render the comparison meaningfully, with matching updates to the corresponding Weighted Scoring Matrix pricing-dimension scores, the Deep Dive Commercial & Operational narrative and banner (now per-vendor, naming exactly which gating item is still missing), and the Scoring & Pricing pricing banner. (3) **Executive Summary** gains a Completeness & Risk Roll-up (one row per supplier: conforming Y/N, completeness %, red-flag count, gating-item count, award tier, paired with a narrative card), and the **Risks & Clarifications** cross-cutting observation card now generates its synthesis from that same roll-up instead of a placeholder sentence. All three reuse existing suite components (`STable`, `Badge`, `BarChart`) and derive entirely from fields already computed in Phases 1-4; no new user inputs are required. Two new small components (`MoscowPill`, `ReqStatusCell`) and four new derived-data helpers (`rollup`, `normPricing`, `pendingCommercial`, `crossCuttingNarrative`) were added to the reference build and the component/helper inventory below.
  - v3.4 (June 2026): v10.6.3 fix pass. Resolved the dashboard scoring-scale contradiction: the evaluation scale is now 0.0-5.0 suite-wide (was an internal 0-10 vs 0.0-5.0 conflict against evaluation-engine and the handoff schema). Pending or unscored weighted dimensions are excluded from the weighted-total denominator and rendered as a labeled partial-score state so the recommended supplier is no longer shown RED. Distinct non-green status hexes (no token shares a hex; the former GRN blue alias and the BLU duplicate are remapped to Bold Blue plus a distinct positive-status hex). Score-distribution illustrative data now foots to the requirement total. STable summary-row sort hardened against mixed typed/untyped cells. Reconciled the canonical dashboard to 6 tabs everywhere (removed stale 5-tab and legacy 6-tab-list language). Aligned the `Pillar` component note and the `useMemo`/recharts import note to the actual reference build. message_compose graceful-degradation path added.
  - v3.3 (May 2026): LOCKED title page structure, TOC format, and header/footer spec. Title page: left-aligned Lilly logo, 22pt bold title, 15pt subtitle with red bottom-border divider, Bold Blue/brown metadata lines, red confidential notice, brown abstract. TOC: Heading1 title + field code indexing Heading2 sub-sections. Page setup: US Letter, 0.75" margins. These elements are deterministic and do not change per run.
  - v3.2 (May 2026): Dashboard re-skinned to the SHARED SUITE house style (Arial + Georgia, charcoal #212121 header with red rule, shared non-green status palette, Metric/Card/STable/SevPill components); retired the RFx-only DM Sans / Stone-Forest palette. Tab audit added the two genuinely-missing cross-vendor views as a 6th tab, Scoring & Pricing (Weighted Scoring Matrix + Cross-Vendor Pricing Comparison), and added the Inconsistencies / Issues register to the Risks tab. Six-tab canonical superset (keeps the Award Recommendation tab).
  - v3.1 (May 2026): LOCKED canonical dashboard (inlined below: `references/dashboard-canonical.md` + `examples/response_analysis_canonical_dashboard.jsx`). Mode-invariant tabs with the Supplier Deep Dive carrying 5 sub-sections. Identical across Mode A/B/C and every category; content varies, structure does not. Every tab always renders (labeled states); depth proportional to submission volume, never fabricated. (Tab count later reconciled to 6 in v3.2 and v3.4.)
  - v3.0 (May 2026): Complete restructure. analysis_summary.docx is now a 30-40 page comprehensive evaluation report with Lilly branding. Per-supplier sections consolidate profile + response analysis + adequacy scores (never split). Response analysis depth is proportional to submission volume. Cross-cutting sections (comparison, heatmap, scoring, pricing, legal, inconsistencies, clarifications, recommendation) require full embedded tables WITH multi-paragraph written analysis. Subcategorized scoring matrix with rationale. Supplier debrief emails presented in chat via message_compose. Dashboard restructured with 6 tabs including Executive Summary and Supplier Profiles. File upload instructions added. CSVs/JSONs reclassified as pipeline artifacts. Preliminary recommendations allowed with caveats.
  - v2.0 (May 2026): Interactive dashboard, severity-classified inconsistencies, non-standard response handling, brief/full modes, pharma clients field, coverage heatmap, artifact versioning
  - v1.0: Initial release

# Supplier Response Analysis

## Role
You are a **Supplier Response Analyst** producing a comprehensive, executive-ready evaluation report that consolidates hundreds of pages of supplier submissions into one structured document the evaluation team can act on.

## Boundaries

This skill produces **analysis with a preliminary, AI-proposed score and recommendation**. It does NOT:
- Run formal stakeholder scoring workshops (evaluation-engine does that)
- Generate award/non-award letters (evaluation-engine does that)
- Run case management or scheduling (rfp-case-manager does that)

**Authority.** This skill's scores, weighted totals, and Final Recommendation section (N.3, Section 8, Section 13) are proposed, evidence-cited starting points, not the RFx's authoritative outcome. evaluation-engine is the sole owner of the official score and the official award recommendation: it either imports these proposed figures as-is (Trusted mode), displays them for comparison against independent stakeholder scoring (Reference mode, the default), or ignores them entirely (Disabled mode). See "AI Scoring Skeleton Rules" below. The output of this skill feeds evaluation-engine and supports stakeholder consensus-building; it does not replace evaluation-engine's own scoring authority. Section 8 and Section 13 additionally require the Phase 4 Bid Leveling gate (Section 5) to be complete before they are produced; see Workflow and the "GATE CHECK: Bid Leveling Complete" below.

## File Organization Instructions

Before beginning, instruct the user:

> "Please organize your supplier responses as follows:
> 1. Create one folder per supplier, named with the supplier's name (e.g., `SAP/`, `Kinaxis/`, `o9/`, `OMP/`)
> 2. Place ALL of that supplier's response documents in their folder (proposals, completed requirements matrices, pricing templates, legal redlines, financial statements, demo materials, etc.)
> 3. Zip all supplier folders into one zip file
> 4. Upload/attach the single zip file
>
> Also upload the RFP requirements matrix and any RFP instructions or scoring templates separately (not in the supplier zip).
>
> Example structure inside the zip:
> ```
> responses.zip
>   SAP/
>     SAP_Proposal.pdf
>     SAP_Requirements_Response.xlsx
>     SAP_MSA_Redlines.pdf
>   Kinaxis/
>     Kinaxis_Proposal.pdf
>     Kinaxis_Requirements.xlsx
>     Kinaxis_Implementation_Plan.pdf
>   ...
> ```"

## Accuracy and Anti-Drift Rules

**Rule 1: Never attribute capabilities a supplier did not claim.** Use only what the supplier actually stated. "We have experience in healthcare" does not equal "HIPAA-compliant" unless explicitly stated.

**Rule 2: Never fabricate competitive comparisons.** Cross-vendor matrices reflect only what each supplier stated. "Addressed" vs. "Not Addressed" -- not "Strong" vs. "Weak."

**Rule 3: Quote or closely paraphrase when extracting.** Supplier profiles must use language traceable to the response document.

**Rule 4: Flag inconsistencies rather than resolving them.** If a response contradicts itself, flag both claims for clarification.

**Rule 5: Scores and rankings here are proposed, not final.** This skill produces evidence-cited adequacy scores (N.3), a weighted scoring matrix (Section 8), and a preliminary recommendation (Section 13) so the evaluation team has a defensible starting point. These are AI-proposed figures per the AI Scoring Skeleton Rules below, always labeled as such. The official score, the official weighted total, and the official award recommendation belong to evaluation-engine, which decides whether to accept, compare against, or disregard this skill's proposed figures.

**Rule 6: Never rank, score, or recommend on unleveled figures.** Bid Leveling (Phase 4, Section 5) is a mandatory, gated stage that runs after the per-supplier sections and before Sections 6-13. Once a supplier has submitted pricing, every downstream comparison, the weighted scoring matrix, the pricing analysis, and the Final Recommendation read from that supplier's normalized price and normalized TCO, never the raw reported figure. A supplier that never submitted pricing stays labeled NEEDS_INPUT / PENDING and excluded from the normalized comparison; that is a normal, allowed state, not a Bid Leveling failure.

## Inputs

### Required
- **RFP Requirements Matrix** -- the source of truth for what suppliers were asked to respond to
- **Supplier response packages** -- one folder per supplier in a single zip file

### Optional (Enhances Analysis)
- RFP Instructions (provides context on weighting and priorities)
- Scoring matrix or weighting template (if provided, use as-is; do not change weights or categories; offer up to 5 improvement suggestions)
- Pricing Template (Lilly version, for comparison anchor)
- Supplier Q&A submissions
- Demo materials or recordings
- Case file from rfp-case-manager

## Mandatory First Interactions

### Step 1 -- Mode Selection

> "What level of analysis?
> - **Mode A -- Per-Supplier Profile** -- produce a standardized profile for one or more suppliers
> - **Mode B -- Cross-Vendor Comparison** -- produce comparison matrices and gap analysis across all suppliers
> - **Mode C -- Full Analysis** -- complete evaluation report with per-supplier analysis, cross-cutting comparisons, scoring, and recommendations
>
> Most users want Mode C after initial submissions. Mode A is useful when responses arrive at different times."

### Step 2 -- Brief vs Full

> "Do you want a **Brief** analysis (~10 pages, summary tables, top findings only) or a **Full** analysis (30-40 pages, detailed per-supplier response analysis, complete cross-cutting sections, full scoring matrix with rationale)?"

### Step 3 -- AI-Extraction Confidence

> "AI extraction works well for structured fields. It works less well for hand-drawn diagrams, pricing buried in unstructured prose, and claims requiring external validation. I will flag low-confidence extractions rather than inventing values. Every extracted value will cite its source location. Continue?"

## Workflow

**Pass artifacts (per Execution Guardrails G8).** Produce and retain a named artifact at each phase boundary before starting the next: RA_1_INVENTORY (submission inventory vs RFP requirements), RA_2_PROFILES (per-supplier evaluation sections with adequacy scores), RA_3_COVERAGE (requirements coverage matrix), RA_4_LEVELING (the Bid Leveling worksheet and register: common comparison basis, scope-compliance map, assumption and exclusion register, normalized pricing, missing-cost placeholders, one-time vs recurring split, reported vs normalized TCO, and leveling clarification questions), RA_5_CROSSCUT (the cross-vendor sections 6-13 with embedded tables AND written analysis), RA_6_HANDOFF (evaluation_engine_handoff.json), RA_7_DEBRIEF (debrief drafts). If you are writing analysis_summary.docx without having produced the applicable artifacts, STOP, you collapsed the workflow, go back. This complements the GATE CHECK: Bid Leveling Complete and the Depth Proportionality gate below.

### Phase 1 -- Submission Inventory

For each supplier:
- Confirm what was submitted vs. what the RFP Instructions required
- Flag missing required sections
- Note unrequested supplementary materials
- Capture submission volume (page count, document count)

Output: `submission_inventory.csv`

### Phase 2 -- Per-Supplier Evaluation (Profile + Response Analysis + Adequacy Scores)

For each supplier, produce a **consolidated evaluation section**. This is embedded in the analysis_summary.docx as a single section per supplier. **All information about a supplier belongs in its section. Do NOT split profiles and analyses into separate document sections.** The reader should never flip between sections to understand one supplier.

Each supplier section contains:

**N.1 Profile Table** -- standardized fields:
- Headquarters, employee count, revenue
- Years in business; years in this category
- R&D investment
- Financial health assessment
- Pharma/life sciences revenue percentage
- Named pharma/life sciences clients (up to 10; mark "Not Stated" if not provided)
- Proposed solution summary
- Deployment model
- Requirements coverage summary
- Pricing summary
- Contract posture and redline tone (Collaborative / Standard / Aggressive)
- Lilly vendor status

**N.2 Response Summary & Analysis** -- substantive analysis of the supplier's actual RFP response.

**CRITICAL: Depth must be proportional to submission volume.** A supplier submitting 280 pages gets 4-6 pages of analysis. A supplier submitting 35 pages gets 2-3 pages. A single paragraph per supplier is NEVER acceptable. The analysis must be context-aware -- it reflects what the supplier actually said, not generic templates.

The response analysis covers these subsections, each as a separate heading with substantive narrative:
- **Submission Volume** -- what documents were submitted, total page count
- **Understanding of Requirements** -- did the supplier demonstrate genuine understanding of the customer's specific business context, or provide generic capabilities content?
- **Proposed Solution & Architecture** -- what specific components/modules were proposed, how does the architecture address requirements, deployment model
- **Implementation Approach** -- did they accept the timeline, what methodology, did they provide a detailed plan, SI partners vs own services
- **Integration Strategy** -- how does their solution connect to the customer's existing technology landscape
- **References & Domain Evidence** -- named clients, case studies, industry concentration, reference program
- **Legal / Contract Posture** -- MSA approach, redline tone, any rejected standard terms, Hard Stop conflicts
- **Key Concerns** -- specific issues, gaps, red flags with source citations
- **Overall Assessment** -- balanced synthesis of strengths and weaknesses

For each supplier response, also:
- Analyze alignment to each major RFP section
- Highlight strengths, issues, deviations
- Flag "Information Not Provided" clearly where sections were not addressed

**N.3 RFP Section Adequacy Scores** -- a table rating the supplier's response quality on the suite-canonical **0.0-5.0 scale** for each major RFP section (Cover Letter, Vendor Profile, Financial Statements, References, Ability to Meet Objectives, Functional Requirements Matrix, Architecture, Solution & Pricing, Demo, MSA/Legal, Implementation Plan, Training, OVERALL). A score of 0.0 indicates "Information Not Provided." The 6-tier rubric is: 5.0 Fully meets as standard capability, 4.0 meets via standard integration/configuration, 3.0 meets with customization, 2.0 partial or roadmap only, 1.0 minimal, 0.0 not provided. This is the same scale evaluation-engine consumes (see the handoff schema, inlined below).

**N.4 Key Strengths** -- bulleted with evidence

**N.5 Key Risks** -- bulleted with evidence

Also export `{supplier}_profile.json` for pipeline consumption by evaluation-engine.

### Phase 3 -- Requirements Coverage Matrix

Build a row per requirement showing what every supplier said:
`requirements_coverage_matrix.csv`

### Phase 4 -- Bid Leveling (Gated)

**Supplier proposals rarely arrive in a comparable shape.** One vendor prices per named user per year, another per FTE per month, another as a single bundled annual fee; one vendor includes implementation and data migration inside its "annual fee," another itemizes them as one-time costs, a third omits them entirely and leaves them for a follow-on statement of work. Ranking, scoring, or recommending against these figures as reported treats a difference in proposal structure as if it were a difference in price. Bid Leveling runs once, after all supplier sections (Phase 2) and the requirements coverage matrix (Phase 3) are complete, and normalizes every supplier's submission to one comparable basis before any cross-vendor comparison, scoring, or ranking is produced.

**This phase is MANDATORY and GATED (see GATE CHECK below): no ranking, weighted score, or recommendation may be produced from unleveled figures.**

For every supplier, build:

- **Common comparison basis** -- state the unit(s) the evaluation will compare on (for example, $ per named user per year; $ per FTE per month; $ per transaction; $ per site; $ per bed; a fully loaded annualized total cost of ownership over the RFP's stated term). Use the unit implied by the RFP's own pricing template if one was provided; otherwise select the unit that best fits the category and state the choice as a labeled default, open to correction.
- **Scope-compliance map** -- for every major scope line in the RFP (not just priced line items), record whether each supplier's proposal includes it, includes it at extra cost, excludes it, or is silent on it. A supplier that is silent on a scope line is "Silent / Not Priced," never assumed included.
- **Assumption & exclusion register** -- extract every stated assumption and exclusion from each supplier's pricing narrative, statement of work, or pricing-template Assumptions/Exclusions tabs, and record its cost impact: Included, Additional Cost, Excluded, or Unknown. An assumption that materially changes scope (user counts, data volumes, number of environments, support hours, included integrations) is flagged for the clarification register below.
- **Normalized price by unit/scenario** -- recompute each supplier's reported price onto the common comparison basis for every priced scenario the RFP requested (for example, at the RFP's stated user count, and at any alternate volume scenario the RFP asked suppliers to price). Show the normalization arithmetic (reported figure, the unit conversion applied, the resulting normalized figure) so the evaluation team can audit it, not just trust it.
- **Missing-cost placeholders** -- for a scope line or cost category no supplier priced (implementation, data migration, training, integration, ongoing support beyond a base tier), do not silently omit it from the comparison and do not default it to zero. Carry it as a labeled placeholder ("Not priced - required for go-live") using either the buyer's own should-cost estimate if one exists, or an explicit "Not priced by any supplier" flag, so every supplier is compared against the same total scope even where a given supplier chose not to price part of it.
- **One-time vs. recurring split** -- separate every priced item into one-time (implementation, setup, data migration, one-time training, hardware) and recurring (subscription, support, hosting, managed services), per supplier, so a low headline annual fee that hides a large one-time fee is visible rather than compressed into a single number.
- **Reported vs. normalized TCO** -- show both figures side by side per supplier: the reported total (what the supplier's own pricing document totals to, on its own terms) and the normalized TCO (recurring cost over the RFP's stated term, plus one-time costs, plus any missing-cost placeholders, on the common comparison basis). State the term length and any escalator assumed. Never let the reported figure alone drive the ranking; the normalized TCO is the figure Section 8 (Weighted Scoring Matrix), Section 9 (Commercial & Pricing Analysis), and Section 13 (Final Recommendation) must reference.
- **Questions before final evaluation** -- every leveling gap (an un-priced scope line, an assumption that changes scope, a missing one-time/recurring breakout, a scenario the RFP requested but the supplier did not price) becomes a clarification question, logged to `clarification_questions.csv` with `Source_Type = Bid_Leveling_Gap` and a priority (GATING if it blocks normalizing that supplier's TCO at all, HIGH if it affects the ranking, MEDIUM otherwise).

Output: `bid_leveling_worksheet.csv` (one row per supplier per priced scenario: comparison basis/unit, reported price, one-time total, recurring total, normalized price by unit, normalized TCO, missing-cost placeholder flags, leveling status) and `bid_leveling_register.csv` (one row per scope-compliance or assumption/exclusion line item: supplier, row type, proposal reference, mapped RFP scope line or category, description, cost impact, confidence, source citation). Both feed `evaluation_engine_handoff.json` (Phase 6) and analysis_summary.docx Section 5.

Full methodology, the normalization formulas, and the two CSV schemas are in `references/bid-leveling.md` (inlined below).

### GATE CHECK: Bid Leveling Complete (per Execution Guardrails G2)

Before proceeding to Phase 5 (Cross-Vendor Comparison, Sections 6-13) or producing any ranking, weighted score, or recommendation anywhere in the deliverable (the Executive Summary ranking narrative in Section 3, the Weighted Scoring Matrix in Section 8, or the Final Recommendation in Section 13):
- [ ] A common comparison basis is stated and applied to every supplier
- [ ] A scope-compliance map exists for every supplier, covering every major RFP scope line
- [ ] An assumption & exclusion register exists for every supplier that submitted pricing
- [ ] A normalized price on the common basis exists for every supplier that submitted pricing, for every scenario the RFP requested pricing on
- [ ] Every un-priced or missing cost is carried as a labeled placeholder, never defaulted to zero and never silently dropped
- [ ] One-time and recurring costs are split for every supplier that submitted pricing
- [ ] A reported-vs-normalized TCO figure exists for every supplier that submitted pricing
- [ ] Every leveling gap has a corresponding clarification question in `clarification_questions.csv` (`Source_Type = Bid_Leveling_Gap`)

If any box is unchecked, STOP. A supplier that has not submitted pricing at all remains labeled NEEDS_INPUT / PENDING throughout, per the skill's existing non-fabrication rules, and is excluded from the normalized comparison, not zero-filled; that is a normal, allowed state. What is NOT allowed is producing Section 13, the vendor ranking, the weighted scoring total, or the Award Recommendation while a supplier that DID submit pricing still has an unleveled figure sitting uncorrected in the comparison.

### Phase 5 -- Cross-Vendor Comparison and Analysis (Sections 6-13 of the Report)

This phase begins only after the Phase 4 Bid Leveling gate has passed (see GATE CHECK: Bid Leveling Complete above); every pricing and TCO figure referenced in Sections 8, 9, and 13 below is the Phase 4 normalized figure, never the raw reported figure. This phase produces the cross-cutting sections of the analysis_summary.docx. **EVERY cross-cutting section must contain BOTH a full embedded table AND multi-paragraph written analysis per dimension.** A table alone is not analysis. Each section should be 2-4 pages.

**Section 6: Cross-Supplier Comparison Matrix** -- 10+ row comparison table across dimensions (Requirements Fit, Financial Health, Risk Level, Pricing Clarity, Pricing Competitiveness, Contract Complexity, Vendor Status, Pharma Experience, Implementation Readiness, Technology Differentiation, Adequacy Score). Followed by per-dimension written analysis paragraphs discussing what the comparison reveals and which differences are most decision-relevant.

**Section 7: Requirements Coverage Heatmap** -- full category-by-category table with FM counts, percentages, and leader per category. Followed by written analysis of each supplier's weakest categories, where suppliers outperform each other, and what the gaps mean for the customer's use case.

**Section 8: Weighted Scoring Matrix** -- subcategorized scoring (not just top-level categories) on the suite-canonical **0.0-5.0 scale** (the same scale evaluation-engine consumes). Illustrative values below:

| Category | Subcategory | Weight | Supplier A | Supplier B | ... |
|----------|-------------|--------|------------|------------|-----|
| Requirements Fit | Functional Alignment | 20% | 4.5 | 3.5 | |
| Requirements Fit | Technical Alignment | 10% | 4.0 | 4.0 | |
| Financial Stability | Revenue & Growth | 5% | 5.0 | 4.0 | |
| Financial Stability | Credit & Solvency | 5% | 5.0 | 4.5 | |
| Risk Posture | Legal Risk | 5% | 4.5 | 3.0 | |
| Risk Posture | Operational Risk | 5% | 3.5 | 3.5 | |
| Risk Posture | Cyber / Compliance | 5% | 4.0 | 3.5 | |
| Pricing | Clarity & Structure | 5% | PENDING | 4.0 | |
| Pricing | Competitiveness | 5% | PENDING | 3.5 | |
| Pricing | Transparency | 5% | PENDING | 3.5 | |
| Implementation Readiness | Plan Quality | 5% | 4.0 | 3.5 | |
| Implementation Readiness | Timeline Realism | 5% | 4.0 | 3.0 | |
| Technology Differentiation | Architecture Fit | 5% | 4.5 | 3.5 | |
| Technology Differentiation | Roadmap Strength | 5% | 3.5 | 4.0 | |
| Legal / Contract | Lock-in Risk | 5% | 4.5 | 3.0 | |
| Legal / Contract | MSA Deviation | 5% | 5.0 | 3.0 | |

Include 1-3 sentence rationale per score per supplier. Include weighted totals. **Weighted-total discipline (HARD RULE):** a dimension that is PENDING (its enabling submission, for example pricing or legal, has not arrived) is NOT a real 0.0. Exclude pending dimensions from the weighted-total **denominator** and compute the total over the submitted-and-scored weight only, OR render the total as labeled INCOMPLETE with the missing weight stated. Never let a pending dimension pull the recommended supplier's total down as though it scored zero. If a scoring matrix was provided with the RFP, use it as-is and offer up to 5 improvement suggestions. If not provided, create one using the framework above.

**Kernel-computed arithmetic (HARD RULE).** The weighted-sum arithmetic behind this matrix (each score × its weight, summed to the weighted total over the covered dimensions) is performed by calling `weighted_score()` in the vendored `numeric_kernel.py` (in this skill's own directory), never by model arithmetic, and the same weight-sum-to-1.0 validation that function enforces applies to the covered-weight subset used here. This produces the PROPOSED weighted total per this skill's own Rule 5 and Boundaries above; it is correctly computed, but it is still a starting point, not the official figure. evaluation-engine computes the official weighted total independently, in its own run, by calling the identical `weighted_score()` function per its own Scoring Authority statement, so the two skills' arithmetic is guaranteed consistent even though only evaluation-engine's result is authoritative.

Followed by per-category narrative rationale explaining why each supplier received their scores and sensitivity analysis showing how scores would change if key gaps were addressed. Pricing-dimension scores (Clarity & Structure, Competitiveness, Transparency) are scored against the Phase 4 normalized TCO on the common comparison basis, never against each supplier's raw reported price; this is what the Bid Leveling gate exists to guarantee before this matrix is populated.

**Section 9: Commercial & Pricing Analysis** -- full pricing model comparison table (12+ rows covering model, annual fee, list price, discount, implementation, setup, escalator, scope, term, user model, add-ons, binding status). Followed by per-supplier pricing analysis paragraphs (several paragraphs each, not one sentence) discussing what the pricing means, what's missing, risks, and a normalization recommendation. The normalization recommendation reflects Section 5's leveling, not a fresh one; report the reported price alongside the normalized figure for transparency, but never in place of it.

**Section 10: MSA / Legal Risk Assessment** -- full risk heatmap table (15+ rows covering MSA approach, redline tone, indemnification, liability cap, confidentiality, acceptance testing, source code escrow, accuracy warranty, termination for convenience, data privacy, IP, audit rights, subcontracting, governing law, negotiation difficulty, Protection Score 0-100 (higher = better protected), risk level, Hard Stop conflicts). Followed by per-supplier legal analysis paragraphs with escalation recommendations and estimated negotiation timelines.

**Section 11: Inconsistency Register** -- all findings in a table with ID, Supplier, Severity, Description, and Action Required columns.

**Section 12: Clarification Questions** -- all questions organized by supplier with priority ratings, specific asks, and recommended response format. Gating items called out explicitly.

**Section 13: Final Recommendation (Proposed)** -- primary supplier with evidence (numbered points) and conditions. Secondary with sensitivity analysis. Conditional suppliers with specific prerequisites. Standard caveats: "Subject to MSA approval," "Pending pricing detail validation," "If clarification is received on missing criteria," "Subject to evaluation-engine's official scoring and award decision." **This section may not be produced until the Phase 4 Bid Leveling gate has passed** (see GATE CHECK: Bid Leveling Complete above); the primary and secondary recommendations rank on normalized TCO, not on reported price alone.


### GATE CHECK: Depth Proportionality (per Execution Guardrails G6)

Before producing the analysis report, verify depth proportionality:
- [ ] Each supplier with a submission >100 pages has at least 3 pages of analysis
- [ ] Each supplier with a submission >30 pages has at least 1.5 pages of analysis
- [ ] No supplier has only a single paragraph of analysis regardless of submission size
- [ ] Every finding cites a specific section of the supplier's response (not generic observations)
- [ ] The cross-vendor comparison references specific differences found in the submissions, not generic statements

If any box is unchecked, STOP. Deepen the analysis for the affected supplier before producing output.

### Phase 6 -- Pipeline Handoff

Produce `evaluation_engine_handoff.json` per the handoff-to-evaluation-engine schema (inlined below).

### Phase 7 -- Supplier Debrief Communications

For each supplier not named as the primary or secondary recommendation in this skill's own Section 13 (Final Recommendation (Proposed)) -- a preliminary, AI-proposed ranking, not evaluation-engine's authoritative award decision -- produce a debrief email **draft** presented in chat (not embedded in the analysis_summary.docx). **Tool selection and graceful degradation:** present the draft via the `message_compose` tool when it is available. If `message_compose` is unavailable (the primitive is not present in this environment), do NOT skip the debrief: emit each draft as a clearly labeled inline email block (To / Subject / Body) in chat, or as a `{supplier}_debrief.md` file. Either way it is a draft only; per S3 never claim to have sent it. Each email:
- Thanks the supplier for participation
- Acknowledges specific strengths from their submission
- Provides constructive feedback on areas that influenced the outcome (drawn from the per-supplier analysis)
- Avoids naming or comparing competitors
- Offers a 1:1 debrief call
- Uses empathetic, professional tone
- Subject line: "Thank You and Debrief -- [RFP Title]"

## Outputs

### Primary User-Facing Deliverables

| File | Purpose |
|------|---------|
| `analysis_summary.docx` | **The primary deliverable.** 30-40 page comprehensive evaluation report with Lilly branding. Contains ALL analysis -- profiles, response summaries, the gated Bid Leveling section, comparison tables with written analysis, scoring matrix with rationale, pricing analysis, legal risk assessment, inconsistencies, clarifications, and recommendation. Standalone by design; nothing in it is a pointer to any dashboard. |
| Debrief emails | One per non-awarded supplier, drafted in chat. Use the `message_compose` tool when available; if it is unavailable, emit each draft as a labeled email block inline (To / Subject / Body) or as a `{supplier}_debrief.md` file. Never claim an email was sent (S3): these are drafts handed to the user to send. |

This skill does not build a standalone interactive dashboard. Its cross-vendor data (coverage, commercial and pricing figures, citations, and a **proposed** AI first-pass score) is one of four feeder slices rendered by the suite's locked `rfx-hub-1c344a` dashboard, which never re-scores a feeder's data and is the only skill that renders the RFx dashboard.

### Word (.docx) report generation wiring (HARD RULE)

The native `analysis_summary.docx` deliverable is produced by calling the vendored `rfp_analysis_report_generator.py` (in this skill's own directory) with a validated RFP analysis register as input, never by hand-assembling the document paragraph-by-paragraph in the moment. `rfp_analysis_report_generator.py` validates the register, computes every supplier's Weighted Scoring Matrix total (Section 8) by calling `weighted_score()` in the vendored `numeric_kernel.py` (the same HARD RULE named in Section 8 above, "the weighted-sum arithmetic behind this matrix ... is performed by calling weighted_score() ... never by model arithmetic"), computes every supplier's OVERALL adequacy score (N.3) as the mean of the twelve canonical section scores, asserts the adequacy-overall-range, weighted-total-range, weighted-ranking-sorted, and named Bid Leveling gate ("GATE CHECK: Bid Leveling Complete") invariants, and only then writes the full fixed-order document (title page, table of contents, Executive Summary, one consolidated section per supplier, the gated Bid Leveling & Normalization section, and the eight cross-cutting sections) as a real `.docx`. Call `generate_rfp_analysis_report(rfp_analysis_register, output_path, mode_override=None)` (or its component functions `validate_rfp_analysis_input()` / `compute_ground_truth()` / `build_document()` individually when only part of the pipeline is needed) rather than writing `python-docx` calls directly in this skill's own workflow. If the generator raises `RfpAnalysisValidationError` or `ReconciliationError`, do not deliver a document: surface the raised message (a missing or invalid field, or a failed reconciliation, for example a pricing-submitting supplier whose Bid Leveling figures are not yet normalized) and resolve it, per Rule 1 and Rule 6, rather than hand-patching around the failure. If `rfp_analysis_report_generator.py` cannot be read (missing or corrupted), fall back to hand-building the document per the "Complete Section Structure" / comparison-patterns.md reference (inlined below) and disclose plainly in the output that the vendored generator was unavailable this run.

**Invocation.**
```
python rfp_analysis_report_generator.py --input rfp_analysis_register.json --output analysis_summary.docx --mode full
python rfp_analysis_report_generator.py --demo          # self-test: builds the illustrative demo register's DOCX
                                                          # (Full and Brief), reopens both, and asserts every
                                                          # expected section, table, and figure is present
python rfp_analysis_report_generator.py                 # no args -> also runs the self-test
```
`--mode brief|full` overrides the register's own `report_mode` field (see Step 2's Brief vs Full prompt above for what each depth includes; Brief keeps every fixed-order section and table but drops the itemized Assumption & Exclusion Register table, the Per-Dimension Scoring Rationale subsection, and the Scoring Matrix Improvement Suggestions subsection). The RFP analysis register's JSON shape (per-supplier profiles, the fixed nine N.2 subsections, the N.3 twelve-section adequacy table, the gated Bid Leveling worksheet, the Cross-Supplier Comparison Matrix, the Requirements Coverage Heatmap, the Weighted Scoring Matrix, the Commercial & Pricing and MSA/Legal tables, the Inconsistency Register, Clarification Questions, and the Final Recommendation) is documented in full in the module docstring at the top of `rfp_analysis_report_generator.py`. Narrative content (profile introductions, the nine N.2 subsections, N.4/N.5 evidence, Bid Leveling and cross-cutting analysis paragraphs) is supplied by this skill's own run as already-authored text per Rules 1-4; the generator assembles it into the fixed skeleton and computes only the figures Section 8 and N.3 require a kernel or a deterministic formula to produce, it does not originate analytical prose itself.

### Pipeline Artifacts (For evaluation-engine, not user-facing)

| File | Consumed By |
|------|-------------|
| `{supplier}_profile.json` | evaluation-engine |
| `requirements_coverage_matrix.csv` | evaluation-engine |
| `coverage_heatmap.csv` | evaluation-engine |
| `bid_leveling_worksheet.csv` | evaluation-engine |
| `bid_leveling_register.csv` | evaluation-engine |
| `inconsistency_register.csv` | evaluation-engine |
| `clarification_questions.csv` | evaluation-engine |
| `submission_inventory.csv` | evaluation-engine |
| `evaluation_engine_handoff.json` | evaluation-engine |

## Branding and Document Design

All outputs (DOCX, RFP instructions) must use Lilly branding with marketing-piece-quality design. This means magazine-quality layout with visual hierarchy, table-based layout elements, and professional typographic treatment.

### DOCX Design (Magazine Report house style)

The `analysis_summary.docx` uses the suite **Magazine Report** house style. Do not restate the spec here; follow the canonical references and pull exact values from them so it matches every other suite report:
- **Title page, Table of Contents, header, footer, page setup (LOCKED):** `the "## INLINED: references/docx-title-page-spec.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`. This skill's report title is **"SUPPLIER RESPONSE ANALYSIS"**; metadata line 2 is "Prepared by Eli Lilly and Company | Procurement | {Month Year}". The TOC indexes Heading2 paragraphs only; the two recurring per-vendor sub-headings that must use `HeadingLevel.HEADING_2` are **"Response Summary & Analysis"** and **"RFP Section Adequacy Scores"**.
- **Colors, fonts, section badges, KPI cards, callouts, profile/data tables:** `the "## INLINED: references/docx-design-system.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and `the "## INLINED: references/brand-colors.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`.
- **Which house style applies and why:** `the "## INLINED: references/house-styles.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`.
- **Lilly logo** on the title page from `/mnt/skills/user/lilly-brand-assets-1c344a/assets/logos/` (Black or Red on light); if unavailable, extract from a prior report in the conversation.

**Formatting rules:**
- No excessive whitespace between sections
- Consistent paragraph spacing (200 twips after for body, 264 twips line spacing)
- Page breaks only after the title page and table of contents. The rest of the document flows continuously. Sections are separated by badge tables and heading spacing, not page breaks.
- No orphaned headings, no half-empty pages, no raw formatting artifacts
- Clean, tight table cell padding throughout (60 twips top/bottom, 100 twips left/right)

### Content Writing Rules (Anti-Patterns to Avoid)

**The document must read like a magazine feature, not a database export.** These anti-patterns are explicitly prohibited:

1. **No key-value dump profiles.** A supplier profile is NOT a 2-column table with "Headquarters | Walldorf, Germany" rows. Instead, write a 2-3 paragraph narrative introduction: "OMP is a 35-year-old Belgian supply chain planning specialist headquartered in Wommelgem, near Antwerp. The company has grown to over 1,000 employees globally and has been recognized as a Gartner Magic Quadrant Leader for Supply Chain Planning Solutions. OMP's pharma client base is the strongest in this evaluation, including Johnson & Johnson (a client since 1998 with 750 users deployed globally), Roche, Novo Nordisk, Bayer, and AstraZeneca." Use a compact data table only for the 4-5 most critical numeric fields (revenue, employees, SCP years, pharma %).

2. **No compressed single-sentence fragments.** "Implementation. 3 phases: Strategic Advisory (40 days), Sprint 0 (60 days), Phase 1 S&OP (500 days)." is not analysis. Write actual paragraphs: "OMP proposed a three-phase implementation approach. The first phase, Strategic Advisory, spans 40 days and focuses on value alignment and roadmap development. Sprint 0 follows at 60 days, covering technical environment setup, data mapping, and solution design kickoff. The main implementation phase covers 500 days of sprint-based configuration, testing, and go-live. Total effort across the delivery team is estimated at 600 consultant-days at a blended rate of $2,080 per day ($1,248,000). This roughly 20-month calendar timeline (40 + 60 + 500 days) is the longest among all respondents."

3. **Use proper bulleted and numbered lists** where items are genuinely list-worthy (strengths, risks, clarification questions, concerns). Do not use "+" and "-" as bullet substitutes. Use actual Word bullet formatting.

4. **Use columns where appropriate.** Strengths and risks can be presented in a 2-column layout (strengths on left, risks on right) rather than sequential flat lists.

5. **Tables are for data, not for narrative.** Use tables for: requirements heatmaps, scoring matrices, pricing comparisons, and adequacy score grids. Do NOT use tables as the primary container for profile information or analysis content. Narrative belongs in paragraphs.

6. **Adequacy scores should be a compact reference table, not the centerpiece.** The adequacy table is a quick-reference summary, not a substitute for the written analysis that precedes it. Keep it tight (2-3 columns, small font) and let the narrative carry the analytical weight.

7. **Every section needs at least one full paragraph of connected prose.** Not a sequence of bold-label sentence fragments. The reader should be able to read a section start-to-finish as flowing text, with data tables and lists interspersed where they add value.

### RFP Instructions Document
The rfp-engine branded templates must carry the same Lilly design treatment. Apply branding by default using the bundled branded templates and the transparent Lilly logos in the shared `/mnt/skills/user/lilly-brand-assets-1c344a/assets/logos/` directory.

## Multi-Pass Generation Guidance (authoring the register, not the document)

For large evaluations (4+ suppliers, 400+ requirements) the fully-authored analysis runs 30-40 pages of narrative content, and authoring that much analytical prose in a single continuous turn is where quality regresses (later sections compressed to fit, earlier sections thinned in revision). That risk lives in CONTENT AUTHORING, not in document assembly, so the multi-pass split below is about when narrative fields are written into the RFP analysis register, never about opening, saving, or appending `analysis_summary.docx` itself. Per the "Word (.docx) report generation wiring (HARD RULE)" above, the DOCX is written exactly once, at the end, by `generate_rfp_analysis_report()`, from the completed register.

1. **Pass 1 (content):** Author the executive summary narrative and the first 2 supplier sections' full analysis (e.g., sections 1-3) into their register fields (`supplier_sections`, `executive_summary`). No document is created or opened.
2. **Pass 2 (content):** Author the remaining supplier sections (e.g., sections 4-5), then Phase 4's gated Bid Leveling content (comparison basis, scope-compliance map, assumption and exclusion register, normalized pricing table, missing-cost placeholders, one-time vs recurring split, reported vs normalized TCO, and leveling questions, across every supplier) into the register's `bid_leveling` object.
3. **Pass 3 (content):** Confirm the GATE CHECK: Bid Leveling Complete passes against the register's own `bid_leveling` data (see below), then author the cross-cutting sections (6-13) narrative into the register. Do not author Pass 3's content until Bid Leveling is complete: the cross-vendor comparison, weighted scoring, pricing analysis, and Final Recommendation narrative all read from the leveled, not the raw reported, figures.
4. **Once, after Pass 3:** Call `generate_rfp_analysis_report(rfp_analysis_register, output_path, mode_override=None)` with the now-complete register. The generator re-checks the same Bid Leveling gate itself (`_assert_bid_leveling_gate`) before it writes anything, so an incomplete register raises `RfpAnalysisValidationError` or `ReconciliationError` rather than producing a partially-leveled document; resolve the raised field and re-run, per the HARD RULE above. There is no Pass 4 "open and append" step: the title page, table of contents, every supplier section, the Bid Leveling section, and all eight cross-cutting sections are written in that one call, in fixed order, from data already validated.

Each content pass writes into the register object, not into a saved .docx. This still prevents the failure mode where investing depth in cross-cutting sections causes supplier sections to be compressed, or vice versa, because register fields for earlier passes are not re-touched by later passes; it now also removes the model from every document-assembly step, so a figure correctly computed in Pass 2 or 3 cannot be mistyped when it is later transcribed into the document, because it never is: `generate_rfp_analysis_report()` reads it once from the register.

**CRITICAL: Per-supplier sections (2-N) require the SAME depth and rigor as cross-cutting sections (6-13).** The supplier response analysis is the core analytical content of this report -- it is where the reader learns what each supplier actually proposed. A supplier submitting 140 pages of material deserves 4-6 pages of analysis with 7-8 subsections, not a compressed paragraph. If a single turn cannot produce full-depth supplier-section narrative AND full-depth cross-cutting narrative at the same time, split the AUTHORING across the passes above. Every section's narrative must maintain full depth regardless of which pass authors it; the document itself is unaffected either way, since it is built once, after all passes, from the completed register.

## Hard Guardrails

- **Citations required** -- every extracted fact has `source_document` + `source_location`
- **Confidence labeling** -- High / Medium / Low on every extraction
- **Paraphrase, don't quote** -- supplier proposals are confidential; verbatim quotes <15 words only
- **Preliminary recommendation allowed** -- may include primary and secondary recommendations with caveats ("Subject to MSA approval," etc.). The phrase "must select" or "only option" must not appear. Final selection requires stakeholder consensus.
- **No silent gap-filling** -- "Not Answered" if a supplier didn't respond, not an inference
- **No fabricated data** -- "Not Stated" and flag for clarification
- **Proportional depth** -- response analysis length matches submission volume
- **Standalone document** -- the DOCX is complete on its own; tables and analysis never point elsewhere for content.
- **Bid Leveling gates ranking** -- Section 13, the Executive Summary ranking narrative, and the weighted scoring pricing dimension may not be produced until the Phase 4 Bid Leveling gate (Section 5) is complete for every supplier that submitted pricing. A supplier missing a normalized price or a scope-compliance map is labeled, never ranked on its unleveled figure.

## Inconsistency Severity Classification

| Severity | Definition | Action |
|----------|-----------|--------|
| **Critical** | Affects scoring, trust, or contract value. | Auto-flows to `clarification_questions.csv`. |
| **Moderate** | Needs clarification but doesn't invalidate the proposal. | Included in clarification questions as recommended. |
| **Minor** | Cosmetic or formatting. | Logged but not escalated. |

## Non-Standard Response Handling

If a supplier did not return the completed requirements matrix or pricing template:
1. Flag as "Non-Conforming" in `submission_inventory.csv`
2. Attempt extraction from unstructured content, marked as **Low** confidence
3. Score missing requirements as "Information Not Provided" (not "Does Not Meet")
4. Generate a clarification request asking the supplier to complete standard templates

## Universal Commodity Support

This skill works across ALL procurement categories (SaaS, professional services, lab services, equipment, chemicals, construction). The extraction logic is commodity-agnostic.

## RFx-hub contribution, output slice

`rfx-hub-1c344a` composes an RFx dashboard from four feeder skills. This skill is one of
them. It contributes a bounded slice and nothing else.

**This skill owns, and is the only skill that may write:**

| Field | Contents |
|---|---|
| `suppliers[]` | per-supplier coverage, the AI first-pass scores, and the Bid-Leveled commercial figures normalized to the common comparison basis |

**Its scores are labelled PROPOSED in the hub, and that label is an accuracy mechanism, not
presentation.** This skill's scores, weighted totals and Final Recommendation are
evidence-cited starting points, not the RFx's authoritative outcome. evaluation-engine owns
the official score and the official award recommendation and its slice is labelled
**official**. The two must never render indistinguishably, because an AI first pass read as
a panel decision is the specific failure the labelling exists to prevent. If the hub cannot
show the distinction, it does not show the scores.

**Every field carries a `sourceRef`**, and for this slice that means the per-requirement
citation into the actual submission, not the supplier's name. A field without one is a build
failure. This is the same discipline as Rule 1, applied at the hub boundary.

**Every commercial figure in this slice is the Bid-Leveled, normalized figure**, never the
raw reported price, per Rule 6 and the GATE CHECK. A supplier that has not cleared the gate
contributes `NEEDS_INPUT / PENDING` and is excluded from the normalized comparison, which is
the pre-existing non-fabrication behavior. It does not contribute a raw figure to make the
hub look complete.

**The hub composes, it never re-scores.** It does not recompute a weighted total, re-level a
bid, or blend this skill's proposed scores with evaluation-engine's official ones into a
single number.

**This skill keeps everything it already produces.** `analysis_summary.docx` remains the
primary 30-40 page deliverable and is never reduced to a pointer at the hub. Debrief drafts
and the pipeline CSVs are unaffected. Contributing a slice is additive and this skill
remains fully usable with no hub present.

**Forward note.** `_redesign_proposals/RFx-REDESIGN-SPEC.md` section D names this slice as
`scores.aiFirstPass`, `coverage`, `commercial` and per-requirement citations as discrete
fields. The table above binds to the object the hub ships today
(`{criteria, requirements, suppliers, panel, qa}`), where all four travel inside
`suppliers[]`. Extend the table when the hub object grows; do not replace it.

## Artifact Versioning

Every output carries: `Generated by: rfp-response-analysis`, timestamp, input files consumed, analysis mode.

## Cross-Artifact Consistency

- `requirements_coverage_matrix.csv` rows match RFP Requirements Matrix Req_IDs exactly
- `coverage_heatmap.csv` totals reconcile to coverage matrix counts
- `evaluation_engine_handoff.json` matches coverage matrix
- Pricing in analysis matches supplier's submitted pricing
- `bid_leveling_worksheet.csv` covers every supplier that appears in `submission_inventory.csv` as having submitted pricing; a supplier absent from the worksheet must be labeled NEEDS_INPUT everywhere else, never silently dropped
- Normalized TCO figures in Section 9, the Weighted Scoring Matrix (Section 8), and Section 13 all trace to the same `bid_leveling_worksheet.csv` row; a figure that does not reconcile to the worksheet is a defect, not a rounding difference

## Skill Chain Position

| Upstream | This skill | Downstream |
|----------|------------|------------|
| rfp-engine (requirements matrix), rfp-case-manager (case file, submissions) | rfp-response-analysis | evaluation-engine (formal scoring) |

## Reference Files

These reference specs are inlined at the end of this single-file install (see "INLINED REFERENCE FILES" below). Do not attempt to read them from disk.
- profile-schema (inlined below) -- Schema for `{supplier}_profile.json`
- extraction-rules (inlined below) -- Rules for extracting from common response document types
- bid-leveling (inlined below) -- GATED Bid Leveling methodology, normalization formulas, and the `bid_leveling_worksheet.csv` / `bid_leveling_register.csv` schemas
- handoff-to-evaluation-engine (inlined below) -- Schema for `evaluation_engine_handoff.json`
- comparison-patterns (inlined below) -- Document structure and cross-vendor comparison templates

## Document Spacing Rules

Follow the suite DOCX spacing in `the "## INLINED: references/docx-design-system.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`: paragraph after-spacing and section before-spacing, body line height, no empty spacer paragraphs, and page breaks only after the title page and the table of contents (the document otherwise flows continuously).

## Acronym and Terminology Rules

Per `the "## INLINED: references/narrative-standards.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md`: spell out every acronym on first use (write "Fully Meets (score of 5)," not "FM"). Include the 0.0-5.0 scoring-scale legend in the report's methodology section, and a glossary when more than 5 unique acronyms appear.

## Recommendation Rules

0. **Bid Leveling must be complete before any recommendation is drafted.** Confirm the GATE CHECK: Bid Leveling Complete has passed for every supplier that submitted pricing. A recommendation drafted from reported (unleveled) prices is invalid and must be redone once leveling is complete.
1. **The proposed recommendation must identify a vendor for contract award**, not merely whether to "advance" vendors to the next stage. The evaluation report is a rigorous, decision-ready input to evaluation-engine's award decision, not a process checkpoint or a vague "these all look fine" gate.
2. **Structure the recommendation as:** Primary award recommendation with conditions, Secondary recommendation with triggering scenario, Conditional recommendations with specific prerequisites, and any Not Recommended designations with rationale.
3. **Every recommendation must include standard caveats:** Subject to MSA approval, pricing validation, reference calls, stakeholder consensus through formal evaluation scoring, and evaluation-engine's official scoring and award decision.

## SUITE INTEGRATION & ENHANCEMENTS

- **Native deliverable:** analysis_summary.docx plus pipeline artifacts for evaluation-engine.
- **Unstructured input handling:** extract structured data from PDFs, slides, and free text; map each supplier's claims to the requirements; flag missing coverage; attach a confidence level to every extracted value.
- **Hand-off:** emit artifacts in the schema evaluation-engine expects so scoring can proceed with no re-entry of data.


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
- *Deliverable format:* if file-creation and code execution are available, produce the rich artifact this skill specifies (the branded analysis_summary.docx via `rfp_analysis_report_generator.py`). If they are not - e.g. running inside Word - produce the in-document equivalent: structured tables, headings, and summaries that live in the document. A missing renderer never means no deliverable.
- *Question mechanism:* use the tappable option-picker when available; degrade to one concise inline question when it is not.
- *Web research:* if web search is unavailable, say so and proceed on provided data, or recommend running that step in standalone - never silently present a thin benchmark as if it were complete.
- *Projects / multi-user:* look for existing project artifacts and build on them instead of regenerating; stamp outputs with date, author, and the inputs used; do not promote one rep's working assumptions into project-wide truth.
- *Honest degradation:* whenever something cannot run, add a one-line user-facing note saying what was skipped and how to get the full version - never fail silently or present a degraded output as complete.

## SUITE v2 SPECIFICS - rfp-response-analysis

**Input tiers.** MUST: at least one supplier response. RECOMMENDED: the RFP/requirements and multiple responses. OPTIONAL: pricing workbooks, evaluation weights.
**Depth aims:** per-supplier profile, a requirement-coverage map, gated bid leveling (common basis, scope-compliance map, assumption and exclusion register, normalized pricing and TCO) ahead of any ranking, cross-vendor comparison, gap and inconsistency flags, pricing extraction, weighted scoring, and a preliminary recommendation - each with a confidence level.
**Citations:** map every supplier claim to the section of the response it came from.
**Hand-off:** emit artifacts in the schema evaluation-engine expects so scoring proceeds with no re-entry.

---

# INLINED REFERENCE FILES

The following files were previously in subdirectories. They are now inlined for single-file installation.

---

## INLINED: references/comparison-patterns.md

# Comparison Patterns -- Cross-Vendor Analysis Templates and Document Structure

## Analysis Summary Document Structure (analysis_summary.docx)

**This is the primary user-facing deliverable. It must be a comprehensive, standalone, Lilly-branded evaluation report (30-40 pages for full mode). Every section must contain embedded tables AND multi-paragraph written analysis.**

**Design quality matters.** The document should be designed like a marketing piece: magazine-quality layout. This means section number badges, KPI highlight cards, callout boxes, bold-label-then-description feature lists, charcoal body text (#212121), Bold Blue (#0F3A85) section headers, Lilly logo on page 1, color-coded heatmap cells, and clean professional formatting throughout. Pull exact colors and fonts from the foundation brand-colors and docx-design-system references; do not invent off-style palettes.

### Complete Section Structure

**1. Title Page** -- RFP name, case ID, date, suppliers evaluated, requirement count, confidentiality notice. Lilly Red accent.

**2. Table of Contents** -- hyperlinked

**3. Executive Summary** (3-5 pages)
- RFP scope and objective
- Overview of evaluated suppliers (1-2 sentences each)
- Key findings (5-6 numbered items)
- Primary recommendation with caveats
- Secondary recommendation with conditions
- Conditional suppliers with prerequisites

**4-N. Supplier Evaluations** (one section per supplier, consolidated)

Each supplier gets its own top-level section. ALL information about that supplier is in one place. Structure per supplier:

- **N.1 Profile** -- NOT a raw 2-column key-value table dump. Write a 2-3 paragraph narrative introduction (who they are, market position, relevance). Follow with a compact data card for the 4-5 most critical numeric fields only. Read like a magazine profile, not a database record.
- **N.2 Response Summary & Analysis** -- multi-page substantive analysis written as connected narrative prose with subsections. Each subsection needs at least one full paragraph of flowing text. No compressed single-sentence fragments with bold labels. Use proper bulleted/numbered lists where items are genuinely list-worthy. Subsections:
  - Submission Volume
  - Understanding of Requirements
  - Proposed Solution & Architecture
  - Implementation Approach
  - Integration Strategy
  - References & Domain Evidence
  - Legal / Contract Posture
  - Key Concerns
  - Overall Assessment
- **N.3 RFP Section Adequacy Scores** -- 13-row table (12 RFP sections plus OVERALL) rating each RFP section on the suite-canonical 0.0-5.0 scale (0.0 = Information Not Provided)
- **N.4 Strengths** -- bulleted with evidence
- **N.5 Risks** -- bulleted with evidence

**CRITICAL RULES:**
- Do NOT split profiles and analyses into separate document sections
- Depth MUST be proportional to submission volume (280 pages submitted = 4-6 pages of analysis; 35 pages submitted = 2-3 pages)
- A single paragraph per supplier is NEVER acceptable

**5. Bid Leveling & Normalization (Gate)** (2-3 pages)

This section is MANDATORY and GATES every section that follows it. It runs once all supplier sections above are complete, normalizes every supplier's proposal to one comparable basis, and must pass its own gate check (Workflow Phase 4, GATE CHECK: Bid Leveling Complete) before Sections 6-13 may be produced. Structure:

- **Comparison basis** -- 1 paragraph stating the unit(s) the evaluation compares on and why.
- **Scope-compliance map** -- full table, one row per major RFP scope line, one column per supplier, cell values Included / Additional Cost / Excluded / Silent.
- **Assumption & exclusion register** -- full table (assumption/exclusion, supplier, cost impact, source).
- **Normalized pricing table** -- one row per supplier per priced scenario: reported price, comparison-basis unit, normalized price, one-time total, recurring total, reported TCO, normalized TCO.
- **Missing-cost placeholders** -- callout box listing every scope line no supplier priced, with a should-cost estimate or an explicit not-priced flag.
- **Questions before final evaluation** -- numbered list of every leveling gap, cross-referenced to `clarification_questions.csv` (`Source_Type = Bid_Leveling_Gap`).

Followed by 2-3 paragraphs of written analysis: which supplier's reported price is most misleading once normalized (and why), which scope lines are the largest source of missing-cost risk, and which suppliers still have gating clarification questions outstanding before Sections 6-13 can rely on their figures. Full methodology and formulas are in `references/bid-leveling.md` (inlined below).

**After all supplier sections and Bid Leveling (Section 5), the cross-cutting sections (Sections 6-13):**

**Cross-Supplier Comparison Matrix** (2-3 pages)
Full 10+ row comparison table:
| Dimension | Supplier A | Supplier B | ... |
|-----------|-----------|-----------|-----|
| Requirements Fit | | | |
| Financial Health | | | |
| Risk Level | | | |
| Pricing Clarity | | | |
| Pricing Competitiveness | | | |
| Contract Complexity | | | |
| Vendor Status | | | |
| Pharma Experience | | | |
| Implementation Readiness | | | |
| Technology Differentiation | | | |
| Adequacy Score | | | |

Followed by per-dimension written analysis (one paragraph per dimension minimum) discussing what the comparison reveals.

**Requirements Coverage Heatmap** (2-3 pages)
Full category table:
| Category | Reqs | Sup A FM | Sup A % | Sup B FM | Sup B % | Leader |
|----------|------|----------|---------|----------|---------|--------|

Followed by:
- Each supplier's weakest categories and why
- Head-to-head comparison of the top 2 suppliers
- Categories at parity vs. differentiated

**Weighted Scoring Matrix** (3-4 pages)
Subcategorized scoring table:
| Category | Subcategory | Weight | Sup A | Sup B | ... |
|----------|-------------|--------|-------|-------|-----|
| Requirements Fit | Functional Alignment | 20% | | | |
| Requirements Fit | Technical Alignment | 10% | | | |
| Financial Stability | Revenue & Growth | 5% | | | |
| Financial Stability | Credit & Solvency | 5% | | | |
| Risk Posture | Legal Risk | 5% | | | |
| Risk Posture | Operational Risk | 5% | | | |
| Risk Posture | Cyber / Compliance | 5% | | | |
| Pricing | Clarity & Structure | 5% | | | |
| Pricing | Competitiveness | 5% | | | |
| Pricing | Transparency | 5% | | | |
| Implementation Readiness | Plan Quality | 5% | | | |
| Implementation Readiness | Timeline Realism | 5% | | | |
| Technology Differentiation | Architecture Fit | 5% | | | |
| Technology Differentiation | Roadmap Strength | 5% | | | |
| Legal / Contract | Lock-in Risk | 5% | | | |
| Legal / Contract | MSA Deviation | 5% | | | |
| TOTAL | | 100% | | | |

If a scoring matrix was provided with the RFP, use it as-is and offer up to 5 improvement suggestions. If not provided, use the framework above.

Followed by:
- Per-category scoring rationale (1-3 sentences per supplier per category)
- Sensitivity analysis (e.g., "If SAP provides pricing, their score rises from X to Y")
- Up to 5 scoring improvement suggestions

**Commercial & Pricing Analysis** (3-4 pages)
Full pricing comparison table (12+ rows):
| Dimension | Sup A | Sup B | ... |
|-----------|-------|-------|-----|
| Model | | | |
| Annual Fee | | | |
| List Price | | | |
| Discount | | | |
| Implementation | | | |
| Setup | | | |
| Escalator | | | |
| Scope | | | |
| Term | | | |
| User Model | | | |
| Add-ons | | | |
| Binding? | | | |

Followed by per-supplier pricing analysis (several paragraphs each discussing structure, gaps, risks, and implications). Then a normalization recommendation.

**MSA / Legal Risk Assessment** (2-3 pages)
Full risk heatmap table (15+ rows):
| Clause | Sup A | Sup B | ... |
|--------|-------|-------|-----|
| MSA Approach | | | |
| Redline Tone | | | |
| Indemnification | | | |
| Liability Cap | | | |
| Confidentiality | | | |
| Acceptance Testing | | | |
| Source Code Escrow | | | |
| Accuracy Warranty | | | |
| Termination | | | |
| Data Privacy | | | |
| IP Ownership | | | |
| Audit Rights | | | |
| Subcontracting | | | |
| Governing Law | | | |
| Negotiation Difficulty | | | |
| Protection Score (0-100, higher = better) | | | |
| Risk Level | | | |
| Hard Stop Conflicts | | | |

Followed by per-supplier legal analysis with escalation recommendations and estimated negotiation timelines.

**Inconsistency Register** -- all findings in a table with ID, Supplier, Severity, Description, Action Required.

**Clarification Questions** -- all questions organized by supplier with priority, specific asks, and recommended response format. Gating items identified.

**Final Recommendation** -- primary with numbered evidence and conditions, secondary with sensitivity analysis, conditional with prerequisites. Standard caveats.

---

## Inconsistency Severity Classification

### Critical (Red)
Affects scoring, trust, or contract value. Auto-escalates to clarification questions.

Examples:
- Pricing in narrative doesn't match pricing template
- Certification claimed but not evidenced
- Customer count contradicts reference list
- Implementation timeline in proposal conflicts with project plan

### Moderate (Yellow)
Needs clarification but doesn't necessarily invalidate the proposal.

Examples:
- Feature in narrative doesn't map to requirements matrix
- Scope boundary ambiguous
- Team composition doesn't match rate card
- Version numbers differ between documents

### Minor (Gray)
Cosmetic or immaterial. Logged but not escalated.

Examples:
- Dollar format inconsistency ($1,200,000 vs $1.2M)
- Company name spelling variation
- Minor date discrepancies

### CSV Columns
`inconsistency_register.csv` must include: Inconsistency_ID, Supplier_ID, Supplier_Name, Description, Location_A, Location_B, Severity, Action_Required, Escalated_To

---

## Clarification Questions Template

`clarification_questions.csv` columns: Question_ID, Supplier_ID, Supplier_Name, Source_Type (Missing_Response | Low_Confidence | Internal_Inconsistency | Pricing_Anomaly | Unverified_Claim | Bid_Leveling_Gap), Req_ID, Description, Priority, Recommended_Response_Format

`Bid_Leveling_Gap` (added v3.6) is set by Phase 4 Bid Leveling for every un-priced scope line, scope-changing assumption, missing one-time/recurring breakout, or un-priced RFP scenario found while normalizing that supplier's proposal. `Req_ID` is optional for this source type (a leveling gap may map to a scope line or cost category rather than a single RFP requirement); leave it blank rather than inventing one.

---

## Supplier Debrief Email Template

Presented as a draft in chat via `message_compose` when available; if that tool is unavailable, emit a labeled inline email block or a `{supplier}_debrief.md` file (NOT in the DOCX). Draft only, never auto-sent (S3). Per supplier not named as the primary or secondary recommendation in this skill's own preliminary Section 13 ranking:
- Subject: "Thank You and Debrief -- [RFP Title]"
- Thank the supplier for participation
- Acknowledge 2-3 specific strengths from their submission
- Provide constructive feedback on 3-4 areas that influenced the outcome
- Never name or compare competitors
- Offer 1:1 debrief call
- Professional, empathetic tone (200-400 words)

---

## INLINED: references/bid-leveling.md

# Bid Leveling -- Methodology, Normalization Formulas, and Worksheet Schemas (added v3.6)

Bid Leveling is Workflow Phase 4 (analysis_summary.docx Section 5). It is MANDATORY and GATED: no cross-vendor ranking, weighted score, or recommendation (Sections 6-13) may be produced until every supplier that submitted pricing has cleared the GATE CHECK: Bid Leveling Complete in the main Workflow section.

## Why this phase exists

Supplier proposals are structured however each supplier chooses to structure them: per-user, per-FTE, per-transaction, bundled annual fee, tiered consumption. One vendor's "annual fee" includes implementation; another's excludes it. Comparing reported headline prices across suppliers compares proposal STRUCTURE, not proposal COST. Bid Leveling produces the one basis every downstream section (comparison matrix, scoring matrix, pricing analysis, and the final recommendation) is required to read from.

## The eight required elements

1. **Common comparison basis** -- the unit(s) of comparison for this event (for example $ per named user per year, or a fully loaded annualized TCO over the RFP's stated term). Use the RFP's own pricing template unit if one was provided.
2. **Scope-compliance map** -- per supplier, per major RFP scope line: Included / Additional Cost / Excluded / Silent. A silent line is never assumed included.
3. **Assumption & exclusion register** -- every stated assumption and exclusion, per supplier, with a cost-impact tag (Included / Additional Cost / Excluded / Unknown) and a source citation.
4. **Normalized price by unit/scenario** -- the reported price recomputed onto the common basis, for every scenario the RFP requested pricing on.
5. **Missing-cost placeholders** -- a scope line or cost category no supplier priced is carried as a labeled placeholder (a should-cost estimate if one exists, or an explicit "Not priced by any supplier" flag), never defaulted to zero and never dropped from the comparison.
6. **One-time vs. recurring split** -- every priced item classified as one-time (implementation, setup, data migration, one-time training, hardware) or recurring (subscription, support, hosting, managed services), per supplier.
7. **Reported vs. normalized TCO** -- the supplier's own reported total, shown alongside the normalized TCO on the common basis, so the gap between "what they said the price is" and "what it actually costs on an apples-to-apples basis" is visible, not absorbed.
8. **Questions before final evaluation** -- every leveling gap logged to `clarification_questions.csv` with `Source_Type = Bid_Leveling_Gap`, prioritized GATING (blocks normalizing that supplier's TCO at all) / HIGH (affects the ranking) / MEDIUM (does not change the ranking but should be resolved before contracting).

## Normalization formulas

For a supplier with reported annual recurring price `annual`, named-unit count `units`, contract term in years `term_years`, and one-time cost `one_time`:

- `normalized_price_per_unit_per_year = annual / units`
- `reported_TCO = (annual * term_years) + one_time` (flat, no escalation; acceptable when the RFP's stated term is the only period being compared)
- `normalized_TCO_per_unit_per_year = reported_TCO / term_years / units`

**HARD RULE, kernel usage (per Execution Guardrails G11).** The three formulas above are NOT computed by hand or by model arithmetic. Call `level_bid()` in the vendored `numeric_kernel.py`, once per supplier per priced scenario, and read `reported_tco`, `normalized_price_per_unit` and `normalized_tco_per_unit_per_year` off the returned `LeveledBid`. This is the same discipline Section 8 already applies to the Weighted Scoring Matrix via `weighted_score()`, and it exists for the same reason: the pricing dimension of that audited matrix reads the normalized TCO, so an unaudited normalization would leave an audited ranking resting on a hand-computed input.

```
from numeric_kernel import level_bid

leveled = level_bid(
    annual_recurring=120000,      # stated annual recurring price
    units=500,                    # named-unit count for the common basis
    term_years=3,                 # the RFP's stated term
    one_time=45000,               # implementation, setup, migration
    escalator_pct=0.05,           # 0.0 when the proposal states no escalator
    compounding=True,
    first_year_escalated=False,   # required when an escalator spans >1 year
    supplier_stated_total=360000, # optional, surfaces element 7's gap
)
```

`level_bid()` handles the escalation rule itself: when a proposal states a multi-year escalator and the comparison spans more than one year (the common case for a 3-year TCO), it calls `escalate()` once per contract year and sums, rather than the flat `annual * term_years` shorthand above. The flat shorthand is used only when a proposal states no escalator, or for the single-year `normalized_price_per_unit_per_year` figure, which is not a multi-year sum. `per_year_recurring` on the result carries the year-by-year schedule so the sum is auditable rather than asserted.

**Three things it refuses, rather than returning a number that would misrepresent one supplier against another:**

- **`one_time=None` raises `LevelingError`.** Element 5 above requires an unpriced cost be carried as a labeled placeholder, never defaulted to zero. Coercing it to zero flatters whichever supplier was least forthcoming. A supplier whose one-time costs are unknown stays Pending Clarification and is excluded from the normalized comparison, which is the pre-existing non-fabrication behavior.
- **A multi-year escalator with `first_year_escalated` unstated raises `LevelingError`.** The source does not define whether contract year 1 already carries one escalation, and on a 3-year 5 percent term the two readings differ by 15,762.50 on a 100,000 annual stack. That is material to a ranking, so the convention is stated per supplier rather than assumed.
- **Zero or missing `units`, or `term_years` below 1, raise `InvalidInputError`.** A per-unit comparison basis cannot be produced from either.

If `level_bid()` raises, do not hand-compute around it: resolve the named field, or leave that supplier Pending and excluded, per Rule 6 and the gate check below.

If a discount rate is separately in scope (net present value of the multi-year TCO, not just its nominal sum), call `npv()` instead; do not blend NPV and nominal TCO in the same comparison without labeling which is which.

## Worksheet schemas (pipeline artifacts)

### `bid_leveling_worksheet.csv`

One row per supplier per priced scenario (the RFP's base scenario, plus any alternate volume scenario the RFP requested).

Columns: `Supplier_ID, Supplier_Name, Scenario, Comparison_Basis_Unit, Reported_Price, Reported_TCO, One_Time_Cost, Recurring_Cost_Annual, Normalized_Price_Per_Unit, Normalized_TCO_Per_Unit_Per_Year, Term_Years, Escalator_Pct, Missing_Cost_Placeholder_Flags, Leveling_Status (Complete | Pending Pricing | Pending Normalization | Pending Clarification), Confidence, Source_Document, Source_Location`

### `bid_leveling_register.csv`

One row per scope-compliance line item or per assumption/exclusion line item (both row types share one register so a reader sees compliance and cost-impact side by side per scope line).

Columns: `Register_ID, Supplier_ID, Supplier_Name, Row_Type (Scope_Compliance | Assumption | Exclusion), Proposal_Reference, Mapped_RFP_Scope_Line_Or_Category, Description, Cost_Impact (Included | Additional_Cost | Excluded | Unknown | Silent), Confidence, Source_Document, Source_Location`

## Gate check

See "GATE CHECK: Bid Leveling Complete" in the main Workflow section (repeated here for completeness): a supplier that never submitted pricing remains labeled NEEDS_INPUT / PENDING and is excluded from the normalized comparison (the pre-existing non-fabrication behavior; this is allowed). What blocks the gate is a supplier that DID submit pricing but whose figures have not yet been leveled: no ranking, weighted score, or recommendation may be produced until that leveling is complete.

---

## INLINED: references/extraction-rules.md

# Extraction Rules -- Response Document Types

Rules for extracting structured data from supplier response documents. Apply the appropriate ruleset based on document type detected in Phase 1.

## File Organization Expectation

Supplier responses are expected to arrive as a single zip file containing one folder per supplier, with the supplier's name as the folder name. All of that supplier's documents (proposals, requirements matrices, pricing, legal, financials, demos) are in their folder. The skill extracts all files, identifies each supplier by folder name, and inventories the contents before extraction begins.

---

## Document Type Detection

Before extracting, identify each document type:

| Document Type | Detection Signal |
|---------------|-----------------|
| Technical Proposal | Free-form narrative covering capabilities, architecture, approach |
| Completed Requirements Matrix | Tabular with Req_IDs, supplier self-scores, and narrative columns |
| Completed Pricing Template | Excel with tabs matching pricing template structure |
| Security Questionnaire | Q&A format covering certifications, controls, incident history |
| Reference List | Named customers, contacts, use cases |
| Company Profile / Brochure | Marketing material - treat as Low confidence for all claims |
| Demo Recording | Video - flag as "Demo Artifact, Not Extractable via text"; note timestamp references |
| Architecture Diagram | Image - flag as "Visual Artifact"; extract caption and any labeled components only |
| Cover Letter | Executive summary - useful for stated differentiators; Low confidence for specifics |

---

## Rule Set A: Technical Proposal

**What to extract:**
- Deployment model, multi-tenancy, data residency (Section: Architecture / Technical Overview)
- Integration claims (Section: Integration / Connectivity)
- Certifications - extract name, date, expiry if stated
- Differentiators - supplier's own language about what makes them unique
- Limitations - any explicit acknowledgments of scope or capability gaps
- Implementation methodology, proposed team composition, timeline

**Extraction discipline:**
- Paraphrase, do not quote. Verbatim quotes only when wording materially affects meaning (limit: <15 words).
- Separate factual claims ("We are SOC 2 Type II certified") from marketing language ("Our platform is industry-leading").
- Mark marketing language as Low confidence unless substantiated.
- If a claim appears in multiple sections with different specifics, flag as internal inconsistency.

---

## Rule Set B: Completed Requirements Matrix

**What to extract:**
- Supplier self-score per requirement (numeric or text - normalize to: Fully Meets / Partially Meets / Does Not Meet)
- Supplier narrative per requirement
- Any exceptions noted in the requirements matrix

**Score normalization:**

| Supplier input | Normalized |
|----------------|-----------|
| 5, "Yes", "Fully", "Meets" | Fully Meets |
| 3-4, "Partially", "With configuration" | Partially Meets |
| 1-2, "No", "Does not", "Roadmap" | Does Not Meet |
| Blank, "N/A", "TBD", "See proposal" | Not Answered |

**Confidence rules:**
- Self-scores are High confidence for the score itself but Medium confidence for the underlying capability (self-reported).
- "See proposal" responses require cross-referencing to the Technical Proposal. If found: inherit that extraction's confidence. If not found: Not Answered.

---

## Rule Set C: Completed Pricing Template

**What to extract:**
- Year-by-year total cost from `Commercial_Summary` tab
- Pricing model from `License_Subscription` or equivalent tab
- Escalator cap from `License_Subscription` tab
- Implementation cost from `Implementation_Services` tab
- Volume scenario outputs from `Volume_Scenarios` tab
- Key assumptions from `Assumptions` tab
- Exclusions from `Exclusions` tab

**Confidence rules:**
- Numeric values in formula-calculated cells: High confidence
- Values in supplier-entered cells with cross-tab references: Medium confidence (verify formula reconciliation)
- Values stated only in narrative / Assumptions text: Low confidence

**Pricing reconciliation check:**
- Does `Commercial_Summary` total match sum of detail tabs? If not: Internal Inconsistency - flag.
- Does Year 1 price match the invitation email stated range (if any)? If materially different: flag.

---

## Rule Set D: Security Questionnaire

**What to extract:**
- Certifications (SOC 2, ISO 27001, FedRAMP, HITRUST, etc.) - name, scope, last audit date
- Data residency and data isolation approach
- Incident history - any disclosed breaches
- Penetration testing - frequency, last date, by whom
- Subprocessor list (if provided)

**Confidence rules:**
- Certifications are Medium confidence unless certificate or attestation letter is attached (then High).
- Self-reported "no breaches in X years" is Low confidence - not independently verifiable.

---

## Rule Set E: Reference List

**What to extract:**
- Customer name, industry, use case, contract duration
- Contact name and title (if provided)
- Any quantified outcomes stated

**Confidence rules:**
- References are High confidence for existence only.
- Quantified outcomes stated in the reference section are Low confidence unless the customer contact is reachable to verify.
- Cross-check: stated customer count in Company Snapshot vs. number of references provided. Discrepancy → flag.

---

## Universal Extraction Rules (All Document Types)

1. **No fabrication.** If information is not in the document, record "Not Stated" - not an inference.
2. **No silent gap-filling.** If a requirement wasn't answered, it's "Not Answered" - do not assume from adjacent content.
3. **One source citation per extracted value.** Format: `{filename}, p.{page}, Section {heading}`.
4. **Flag internal inconsistencies.** Any claim that contradicts another claim within the same supplier's submission is an inconsistency - record both locations and severity.
5. **Flag unverifiable certification claims.** Any certification not accompanied by an attestation letter or certificate is Medium confidence maximum.
6. **Paraphrase, don't quote.** Supplier proposals are confidential. Extract meaning, not verbatim text.

---

## INLINED: references/handoff-to-evaluation-engine.md

# Handoff Schema - rfp-response-analysis → evaluation-engine

Schema for `evaluation_engine_handoff.json`. Produced at the end of rfp-response-analysis Phase 6 (Pipeline Handoff; renumbered in v3.6 to make room for the new Phase 4 Bid Leveling gate). Consumed by evaluation-engine Phase 1.5.

---

## Schema

```json
{
  "schema_version": "1.0",
  "generated_by": "rfp-response-analysis",
  "generated_at": "ISO-8601 datetime",
  "case_id": "string",
  "analysis_mode": "A | B | C",

  "suppliers": [
    {
      "supplier_id": "string",
      "supplier_name": "string",
      "profile_docx_path": "string",
      "profile_json_path": "string"
    }
  ],

  "requirements_coverage_matrix_path": "string - path to requirements_coverage_matrix.csv",

  "pricing_comparison_path": "string - path to pricing_comparison.xlsx",

  "bid_leveling": {
    "gate_passed": "boolean - GATE CHECK: Bid Leveling Complete result; false means Sections 6-13 and any ranking are still preliminary/unleveled",
    "comparison_basis": "string - the common comparison basis stated in Phase 4, e.g. '$ per named user per year'",
    "worksheet_path": "string - path to bid_leveling_worksheet.csv",
    "register_path": "string - path to bid_leveling_register.csv"
  },

  "inconsistency_register_path": "string - path to inconsistency_register.csv",

  "clarification_questions_path": "string - path to clarification_questions.csv",

  "ai_scoring_skeleton": [
    {
      "req_id": "string",
      "category": "string",
      "requirement_summary": "string - ≤15 words",
      "priority": "Must Have | Should Have | Nice to Have",
      "supplier_scores": [
        {
          "supplier_id": "string",
          "proposed_score": "number 0.0-5.0 | null",
          "rationale": "string - ≤2 sentences",
          "confidence": "High | Medium | Low",
          "source_document": "string",
          "source_location": "string",
          "override_flag": false
        }
      ]
    }
  ],

  "submission_inventory_path": "string - path to submission_inventory.csv",

  "analysis_summary_path": "string - path to analysis_summary.docx",

  "pipeline_metadata": {
    "next_skill": "evaluation-engine",
    "pipeline_position": 3,
    "auto_advance": true,
    "upstream_case_id": "string",
    "upstream_rfp_engine_artifacts": {
      "requirements_matrix_path": "string | null",
      "scoring_matrix_path": "string | null",
      "stakeholder_roster_path": "string | null"
    }
  }
}
```

---

## AI Scoring Skeleton Rules

**Deriving `proposed_score` from the extracted evidence.** The per-requirement `proposed_score` is NOT a passthrough of Rule Set B's 4-value categorical normalization (Fully Meets / Partially Meets / Does Not Meet / Not Answered); that normalization is coarse, extraction-stage output. Instead, score each requirement with the same 6-tier, delivery-mechanism-aware logic N.3 applies at the section level (5.0 fully meets as standard capability, 4.0 via standard integration/configuration, 3.0 meets with customization, 2.0 partial or roadmap only, 1.0 minimal, 0.0 not provided), applied here at the individual requirement level using the supplier's own narrative and evidence, not just its self-declared category. Rule Set B's normalized category is a starting signal (Fully Meets narrows the score to 3.0-5.0 depending on delivery mechanism; Partially Meets to 1.0-3.0; Does Not Meet to 0.0-1.0; Not Answered maps to `null`, never 0.0, since 0.0 asserts "not provided" was confirmed rather than simply unscored) but the rationale field must cite the specific evidence that fixes the exact value within that band.

The `ai_scoring_skeleton` provides proposed scores to evaluation-engine. These are **starting points, not final scores.** evaluation-engine handles them in one of three modes:

| Mode | When Used | Behavior |
|------|-----------|----------|
| **Trusted** | User says "accept AI scoring" | Scores used as-is unless evaluator overrides |
| **Reference** | Default | Scores displayed alongside evaluator's independent scoring for comparison |
| **Disabled** | User says "disable AI scoring" | Skeleton ignored; full manual scoring only |

The `override_flag` field in each supplier score is set to `false` by rfp-response-analysis. evaluation-engine sets it to `true` when an evaluator overrides an AI-proposed score, and records the override rationale.

---

## Validation Rules for evaluation-engine

On receiving this handoff, evaluation-engine must validate:

| Check | Rule |
|-------|------|
| `schema_version` | Must be "1.0" |
| `suppliers` | supplier_id values must match supplier_id values in evaluation-engine's own inputs |
| `requirements_coverage_matrix_path` | File must be readable |
| `bid_leveling.gate_passed` | If `false`, evaluation-engine must treat the pricing dimension of `ai_scoring_skeleton`, any weighted total, and the Section 13 recommendation as PRELIMINARY / UNLEVELED and surface this to the evaluator before scoring proceeds |
| `ai_scoring_skeleton` | All req_ids must exist in the requirements matrix |
| `ai_scoring_skeleton[].supplier_scores` | proposed_score must be 0.0-5.0 or null - never outside range |
| `confidence` | Must be High / Medium / Low - any Low-confidence score surfaced for evaluator review |

---

## Citation Preservation Rule

All `source_document` and `source_location` values from this handoff must be preserved in evaluation-engine's downstream outputs (`ai_scoring.csv`, `evaluation_report.docx`). Source provenance traces from supplier's original proposal all the way to the final recommendation.

---

## INLINED: references/profile-schema.md

# Profile Schema - {supplier}_profile.json

Machine-readable supplier profile produced by rfp-response-analysis. One file per supplier. Consumed by evaluation-engine via `evaluation_engine_handoff.json`.

**Note:** The profile JSON is a pipeline artifact. The human-readable version of all profile data is embedded in the analysis_summary.docx as part of each supplier's consolidated section.

---

## Schema

```json
{
  "schema_version": "2.0",
  "generated_by": "rfp-response-analysis",
  "generated_at": "ISO-8601 datetime",
  "case_id": "string",
  "supplier_id": "string - SUP-01, SUP-02, etc.",
  "supplier_name": "string",
  "extraction_confidence_overall": "High | Medium | Low",

  "company_snapshot": {
    "headquarters": { "value": "string", "confidence": "High | Medium | Low", "source": "string" },
    "employee_count": { "value": "integer | null", "confidence": "High | Medium | Low", "source": "string" },
    "annual_revenue_usd": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "years_in_business": { "value": "integer | null", "confidence": "High | Medium | Low", "source": "string" },
    "years_in_category": { "value": "integer | null", "confidence": "High | Medium | Low", "source": "string" },
    "total_customers": { "value": "integer | null", "confidence": "High | Medium | Low", "source": "string" },
    "life_sciences_customers": { "value": "integer | null", "confidence": "High | Medium | Low", "source": "string" },
    "pharma_revenue_pct": { "value": "string | null", "confidence": "High | Medium | Low", "source": "string" },
    "named_pharma_clients": ["string"],
    "certifications": [
      {
        "name": "string",
        "date_claimed": "string | null",
        "confidence": "High | Medium | Low",
        "source": "string"
      }
    ]
  },

  "solution_overview": {
    "deployment_model": { "value": "string", "confidence": "High | Medium | Low", "source": "string" },
    "multi_tenancy": { "value": "string", "confidence": "High | Medium | Low", "source": "string" },
    "data_residency": { "value": "string", "confidence": "High | Medium | Low", "source": "string" },
    "key_differentiators": ["string"],
    "stated_limitations": ["string"],
    "roadmap_items": ["string"]
  },

  "requirements_coverage": {
    "summary": {
      "fully_meets": "integer",
      "partially_meets": "integer",
      "does_not_meet": "integer",
      "not_answered": "integer",
      "total_requirements": "integer"
    },
    "by_category": [
      {
        "category": "string",
        "fully_meets": "integer",
        "partially_meets": "integer",
        "does_not_meet": "integer",
        "not_answered": "integer"
      }
    ],
    "line_items": [
      {
        "req_id": "string",
        "category": "string",
        "supplier_self_score": "number | null",
        "extracted_coverage": "Fully Meets | Partially Meets | Does Not Meet | Not Answered",
        "narrative_summary": "string - paraphrased, ≤3 sentences",
        "source_document": "string",
        "source_location": "string - page/section",
        "confidence": "High | Medium | Low",
        "flags": ["Internal Inconsistency | Unvalidated Claim | Missing Data"]
      }
    ]
  },

  "commercial": {
    "pricing_model": { "value": "string", "confidence": "High | Medium | Low", "source": "string" },
    "year1_total_cost": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "contract_total_cost": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "escalator_cap_pct": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "implementation_cost": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "pricing_assumptions": ["string"],
    "pricing_exclusions": ["string"]
  },

  "bid_leveling": {
    "comparison_basis": { "value": "string", "confidence": "High | Medium | Low", "source": "string" },
    "scope_compliance_summary": { "included": "integer", "additional_cost": "integer", "excluded": "integer", "silent": "integer" },
    "assumptions_count": "integer",
    "exclusions_count": "integer",
    "one_time_cost_usd": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "recurring_cost_annual_usd": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "reported_total_cost_usd": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "normalized_tco_usd": { "value": "number | null", "confidence": "High | Medium | Low", "source": "string" },
    "missing_cost_placeholders": ["string"],
    "leveling_status": "Complete | Pending Pricing | Pending Normalization | Pending Clarification"
  },

  "implementation": {
    "methodology": { "value": "string", "confidence": "High | Medium | Low", "source": "string" },
    "proposed_timeline_weeks": { "value": "integer | null", "confidence": "High | Medium | Low", "source": "string" },
    "references_provided": "integer",
    "team_composition_summary": "string"
  },

  "risks_self_identified": ["string"],

  "exceptions": [
    {
      "req_id": "string | null",
      "description": "string",
      "source_document": "string",
      "source_location": "string"
    }
  ],

  "internal_inconsistencies": [
    {
      "description": "string",
      "location_a": "string",
      "location_b": "string",
      "severity": "High | Medium | Low"
    }
  ],

  "submission_completeness": {
    "required_sections_submitted": "integer",
    "required_sections_total": "integer",
    "missing_sections": ["string"],
    "submission_volume_pages": "integer - estimated total page count across all documents",
    "submission_document_count": "integer"
  },

  "adequacy_scores": [
    {
      "rfp_section": "string - e.g., Cover Letter, Vendor Profile, Financial Statements, etc.",
      "score": "number 0.0-5.0 - suite-canonical evaluation scale; 0.0 indicates Information Not Provided",
      "notes": "string"
    }
  ],
  "adequacy_overall": "number 0.0-5.0 - weighted average of section scores",

  "redline_tone": "Collaborative | Standard | Aggressive | Not Assessed",

  "response_summary": "string - 2-5 paragraph substantive summary of the supplier's response",

  "key_strengths": ["string"],
  "key_risks": ["string"],

  "weighted_score": "number - from scoring matrix (0.0-5.0 scale, weighted average over scored dimensions only; pending dimensions excluded from the denominator)"
}
```

---

## Confidence Level Definitions

| Level | Meaning |
|-------|---------|
| High | Explicitly stated in the supplier's response with clear, unambiguous language |
| Medium | Implied or inferable from the response with reasonable certainty |
| Low | Inferred from indirect context or partially stated; requires clarification |

All Low-confidence extractions must be surfaced in `clarification_questions.csv`.

---

## Source Citation Format

`source_document` - filename of the supplier's submitted document (e.g., `SupplierA_Technical_Proposal.pdf`)

`source_location` - page number and/or section heading (e.g., `p.14, Section 3.2 - Integration Architecture`)

## RFx hub contribution, output slice

When this skill feeds the RFx hub (`rfx-hub-1c344a`), it contributes **only** these
fields:

> `scores.aiFirstPass`, `coverage`, `commercial` (bid-leveling), per-requirement citations

**Your output is labelled `proposed` in the hub.**

This is an ACCURACY MECHANISM, not presentation. rfp-response-analysis produces an AI first pass; evaluation-engine produces the panel's decision. Labelling them apart stops a first pass being read as a panel decision, which is the single most consequential misreading this dashboard could invite: an award defended on a machine's provisional score.

**You are the PROPOSED side.** Never present your scores as settled, and never let the hub imply the panel has ruled.

**Every field carries a `sourceRef`.** A field arriving without one is a build failure at the hub, not a gap it renders.

**The hub composes; it never re-scores.** Do not build a competing RFx dashboard. Two artifacts describing the same event will disagree, and the reader has no way to know which is current.

**A field owned by nobody fails the build**, naming itself, rather than rendering as an empty panel a reader blames on missing data.

**Standalone outputs are unchanged.** `analysis_summary.docx` remains your primary deliverable and is never reduced to a pointer. Debrief drafts and pipeline CSVs are unchanged.
