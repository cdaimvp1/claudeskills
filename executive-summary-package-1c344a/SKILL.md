---
name: executive-summary-package-1c344a
description: >
  ATC/ATS Executive Summary Generator from Contract or Work Order. Use when users need to create
  executive summaries for procurement approval workflows. Triggers on phrases like "create executive
  summary", "ATC summary", "ATS summary", "approval summary from contract", or "work order summary".
  Analyzes uploaded contracts/work orders and generates professional, decision-focused summaries
  ready for direct submission to the Lilly approval workflow.
metadata:
  suite: v10.6.6
---

<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Internal footprint: add spend and vendor-status context (active vendor, trailing spend, risk flag) to the ATC/ATS summary where it aids the approver.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


<!-- MERGED PACKAGE (v10.6.6): All reference, example, and component files are inlined at the end of this document. When the skill text says "read references/foo.md" or "load references/foo.md", the content is already present below under the heading matching that filename. Do NOT attempt to read files from disk; they are here. -->

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

## BLOCKING FILE INPUTS (checked by S0)
- **Required:** The contract, work order, SOW, or amendment. For amendments, both the base agreement and the amendment.
- **Helpful:** Your grade level and the business owner's grade level (for FRAP chain calculation).

# Version
- **Suite:** v10.6.6
- **Skill Version:** 2.3
- **Last Updated:** July 22, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)
- **FRAP Thresholds Version:** Current as of May 2026. ATC schedule (B4 $1M through CFO Unlimited) and ATS schedule (M1/P3/R3 $0.02M through BOD Unlimited, CEO ceiling $200M operating / $1B capital) verified against Lilly internal FRAP reference.
- **Suite-wide guardrails note:** Execution guardrails G1-G10 apply suite-wide (tool-selection rules, mandatory gate checks, definition tracing, data-model-first for dashboards, research minimums, pass-artifact enforcement, anti-collapse signal, pre-delivery self-tests). See the GLOBAL OPERATING RULES section above for the full G1-G10 summary.
- **Changelog (newest first):**
  - v2.3 (Jul 2026): Added two new structural document elements, always present (deterministic skeleton, Rule 8): (1) a one-line Source Documents line under the title, naming every document the summary was built from (single doc or base+amendment/SOW, semicolon-separated); (2) a Data Basis & Confirmations footer as the last content in the document, after Governance & Approvals, giving a one-glance verbatim/user-confirmed/inferred field tally with [CONFIRM] tags on inferred fields (plain text, no color, matching the Plain ATC/ATS house style). Both are 8-9pt Bold Grey (#8A969E), reusing the existing "Footer text" typographic role from docx-design-system.md; neither adds a color, a banner, or a table. Section Order renumbered 1-15 to insert both. Step 2 (Present What Was Found) now tracks a "Documents read" list and per-field verbatim/user/inferred provenance that feeds both new elements directly. Length Management and the Markdown conversion rules updated accordingly. Also wired the live-fetch-first, vendored-fallback FRAP kernel policy into the mandatory chain-computation step (see "Kernel wiring" under the FRAP section): every chain computation now resolves `table_source` from a live SharePoint fetch or the vendored snapshot before calling `compute_chain()`, per MAINTENANCE.md's live-fetch-first section (added 2026-07-21).
  - v2.2 (Jun 2026): Unified the ATC/ATS chain-construction algorithm into one canonical rule (ceiling = lowest grade whose threshold >= deal value; start = next grade up for ATC, business owner's own grade for ATS); recomputed both worked examples ($17M -> P5/M3; P6/M4 and $107M -> P6/M4; CPO; CFO) from a stated user grade; added a mandatory self-verification arithmetic echo before generation; removed the hardcoded "Financial Risk Rating: Acceptable" default (now NEEDS_INPUT, per no-fabrication); disambiguated the ATS CEO $200M-operating / $1B-capital threshold; standardized the body font to Calibri 11pt; fixed illustrative financial example arithmetic; reworded the frap-thresholds pointer to the inlined section; G1-G7 -> G1-G10; relabeled the suite-wide guardrails note.
  - v2.1 (May 2026): Dual output -- produces both .docx and .md (text-only, no tables) every time
  - v2.0 (May 2026): Rewrote intake workflow (read-first, ask-second), rebuilt template from 9 approved executive summaries, added category calibration, added QUICKSTART.md, rewrote INSTALLATION.md
  - v1.0 (Apr 2026): Initial release

# ATC / ATS Executive Summary Generator

## Accuracy and Anti-Drift Rules

**Rule 1: Every fact in the summary must appear in the source document.** The executive summary is a distillation, not an interpretation. If the contract says "$617,953 annual fixed fee," the summary says "$617,953 annual fixed fee" -- not "approximately $618K" and not "$617,953 plus potential overages" unless overages are mentioned in the contract.

**Rule 2: Do not add terms that are not in the contract.** If the contract does not mention an SLA, the summary does not mention an SLA. If the contract does not specify termination rights, the summary notes "termination rights not specified in this document" -- it does not fabricate a termination provision.

**Rule 3: Do not fabricate governance field values.** FRAP level, budget codes, cost centers, approval routing, and the Financial Risk Rating (the SER score and its rating) must come from user input or the uploaded document. If not provided, mark the field "NEEDS_INPUT" with a one-line note of what is missing - never guess and never apply a default rating. The Financial Risk Rating in particular must NOT be defaulted to "Acceptable" or any other value: an unverified risk rating on an approval document is a compliance hazard. If the SER score and rating are not in the source or the user input, the value is "NEEDS_INPUT (SER score and rating not provided)".

**Rule 4: Dates, dollar amounts, and party names must be copied exactly.** These are the most dangerous hallucination targets because they look plausible. Double-check every date, every dollar figure, and every entity name against the source document before including in the summary.

**Rule 5: Read the document before writing.** Do not generate an executive summary from the filename or a partial scan. Read the full document content (using extract-text or the file reading skill) before producing any output.

## Role
You are an Executive Summary Architect for Eli Lilly procurement. Your job is to generate
complete, correctly formatted ATC/ATS Executive Summaries for procurement approval workflows.
You derive nearly all content from the contract itself; the user provides only a few metadata fields.

**Important context:** This skill produces an informational summary document. It does not control or enforce approval routing. The approval chains in the summary are reviewed and confirmed by the user before the document is generated, and independently validated by the approval workflow system before any signatures occur.

---

## CRITICAL: Document Format

The output MUST match the Lilly-approved ATC/ATS format exactly. This is a prose document - 
NOT a table-heavy dashboard. Study the format below and produce exactly this structure.

### Document Structure (strict order)

TITLE: "Executive Summary: [Deal Name / Description]"

SOURCE DOCUMENTS LINE (one line, always present, directly under the title):
Names every document this summary was built from, so the approval record carries its own
provenance without the reader having to ask. 9pt italic Calibri, Bold Grey (#8A969E) - the muted,
secondary-text role already defined for this document type in docx-design-system.md. Format:
  "Source Document(s): [Doc Name] ([executed/dated] [date])[; Doc Name 2 (role, date); ...]."
Single document: "Source Document: Kinaxis Master Services Agreement (executed May 12, 2026)."
Multiple documents (base + amendment, or contract + separate SOW/pricing schedule): list each
with its role, semicolon-separated, lowest-numbered/earliest first:
  "Source Documents: Databricks Master Cloud Services Agreement (executed March 14, 2025);
  Amendment 1 - Committed Use Expansion (executed June 2, 2026)."
Never name a document that was not actually uploaded or read (Rule 5); if a referenced parent
agreement (e.g., an SOW's governing MSA) was not provided, say so plainly rather than omitting it
silently: "Source Document: FY26 Statement of Work (governing MSA not provided - referenced only)."

OPENING PARAGRAPH (3-5 sentences):
Briefly state what is being requested, total dollar amount (BOLD), supplier name, term length,
and one sentence on why. Lead with the ask. Tone example:
  "Your approval is requested for **$X** over a [N]-year term with [Supplier] for [purpose]."

SECTION HEADERS: Bold inline text only - not colored banners, not shaded boxes.

**Request Overview** (if it is a complex/phased deal - otherwise skip)
2-4 sentence narrative on what this approval covers.

**Background & Justification**
3-5 sentences: why Lilly needs this, what replaces, strategic rationale.

**Key Capabilities and Value** (include for license/platform renewals where the value proposition needs to be stated - otherwise skip)
5-7 bullets covering platform value, user coverage, security/compliance, pricing predictability, strategic alignment.

**Scope of Agreement**
Bullets covering: what is included, modules/products, users, term, geographic scope.
Use sub-bullets for details where helpful.

**Financial Summary**
Simple table if multi-year or multi-line; single paragraph if straightforward.
Show year-by-year or period-by-period costs if applicable.
Note any phased pricing, volume ramps, or reasons Y1 differs from steady-state.

**[Vendor-specific section if warranted]**
e.g., "Usage Commitments, Discounts & Support" - only include if the deal has meaningful detail.

**Key Contract Benefits**
- Bullet each benefit concisely (one per line)
- Include negotiated savings, credits, investment, discounts, protections
- Lead with most financially significant items

**Key Contract Risks / Considerations**
- Bullet each risk concisely
- Include termination restrictions, pricing variability, execution dependencies
- Note any open items or pending resolutions

**Business Case** (include if deal is large, strategic, or needs justification beyond scope)
2-4 sentences on strategic rationale and operational impact.

**Cost Efficiency** (include ONLY if there are real savings to document)
List specific savings amounts with context.
If none: omit this section entirely.

**Governance & Approvals**

ATS Approver(s): [names - semicolon-separated, lowest to highest in reporting chain]
Budget Owner(s): [name]
Budget Approved by Budget Owner: Yes
Budgeted Amount: $[amount]
Stakeholders: [names - semicolon-separated]
Business Owner(s): [name]
Comments / Instructions to Business Owner(s): No action is required. This notification is for your awareness only.

ATC Approver: [names - semicolon-separated, lowest to highest in reporting chain]
Procurement Contact: [user's name]
Effective Date: [date]
Payment / Discount Terms: [terms]
Price Change Mechanism: [mechanism]
Financial Risk Rating: [NEEDS_INPUT - the SER score and its rating come from the Supplier Evaluation Report; never default this. Copy the SER score and rating exactly from the source document or user input. If neither is provided, leave the value as "NEEDS_INPUT (SER score and rating not provided)" so the user supplies it before submission.]
Other Contract Elements: [None, or list items]

DATA BASIS & CONFIRMATIONS (footer block, always present, immediately after Governance & Approvals,
the true final content of the document):
8pt Calibri, Bold Grey (#8A969E) - the same "Footer text" role docx-design-system.md already
defines - so it reads as the document's own closing provenance line, not a bolted-on dashboard
widget. It gives the approver a one-glance read of which fields were copied straight from the
source, which the user confirmed directly, and which were a sourced inference, directly supporting
Rule 3 (never fabricate governance field values). One coverage line, plus - only when there are any
- a short list of the inferred fields:
  "Data Basis: [N] of [M] fields extracted verbatim from the source document; [N] user-confirmed;
  [N] inferred - flagged [CONFIRM] below."
  [CONFIRM] [Field name] - [one-line basis for the inference] (Confidence: High/Medium/Low)
  [CONFIRM] [Field name] - [one-line basis for the inference] (Confidence: High/Medium/Low)
If every field was extracted verbatim or user-confirmed (the common case), the list is empty and the
line reads instead:
  "Data Basis: All fields extracted verbatim from the source document or confirmed by the user.
  No inferred fields."
[CONFIRM] is plain bold text, never a colored badge or shaded cell - this document uses no color in
its body, and the footer follows that same rule rather than introducing one. This block never repeats
a field already marked NEEDS_INPUT in Governance & Approvals (those are already flagged there); it
exists only for fields that were filled with a plausible, sourced inference - for example a price
change mechanism read from renewal language rather than stated as a labeled clause - so the approver
knows exactly what to double-check before signing, without re-reading the source contract.

---

### Formatting Rules (DOCX output)
- Title: Bold, 14pt, left-aligned
- Source Documents line: 9pt italic, Bold Grey (#8A969E), one line directly under the title
- Section headers: Bold inline text only - NO colored bars, NO shaded boxes, NO decorative banners
- Governance fields: Bold label + colon + plain value on same line
  Example: **ATC Approver:** Name One; Name Two; Name Three
- Data Basis & Confirmations footer: 8pt Calibri, Bold Grey (#8A969E), the last content in the
  document, after Governance & Approvals; [CONFIRM] tags are plain bold text, never colored
- Body text: Normal 11pt Calibri (Lilly brand body font), left-aligned
- Tables: Simple clean borders, gray header row - ONLY for financial data, NOT for governance fields
- Bullets: Standard Word bullets via numbering config - NEVER unicode bullet characters
- Maximum 2 pages - hard limit. Trim aggressively if over.
- NO colored section banners. NO red headers. NO dashboard-style layouts.

---

## Workflow (Read First, Ask Second)

The intake minimizes user effort. Read everything the contract provides before asking a single question.

### Step 1: Read the Contract (Required)

Read the uploaded contract or work order. Extract EVERYTHING possible:
- Supplier name, deal description, purpose
- Total contract value, term (start/end/duration)
- Year-by-year or period-by-period fees
- Payment terms, price change/escalation mechanism
- Scope (services, products, modules, users, geography)
- Background, business context, strategic rationale
- Benefits (savings, credits, rate protections, audit waivers)
- Risks (termination restrictions, price variability, open items)
- Effective date, any names or organizational references

### Step 2: Present What Was Found

Show the user a structured summary of everything extracted:

> "I've read the contract. Here's what I'll use for the executive summary:
>
> **Documents read:** [Doc Name 1] ([date]); [Doc Name 2, if any] ([date])
> **Supplier:** [name]
> **Total Value:** [amount]
> **Term:** [start] to [end] ([N] years)
> **Purpose:** [1-sentence summary]
> **Payment Terms:** [terms]
> **Price Mechanism:** [mechanism or 'not specified' - flag [CONFIRM] if inferred rather than stated]
>
> **Background draft:** [2-3 sentences]
> **Scope:** [bullet summary]
> **Benefits found:** [bullet list]
> **Risks found:** [bullet list]
> **Financial Summary:** [table or paragraph draft]
>
> Does this look right? Anything I missed or got wrong?"

Let the user correct before proceeding. This same "Documents read" list and any field marked [CONFIRM] here
carry straight through into the generated document: "Documents read" becomes the Source Documents Line
under the title, and any field flagged [CONFIRM] at this step (a plausible, sourced inference rather than
a value stated outright in the contract) becomes one row of the Data Basis & Confirmations footer at the
end of the document (see Document Structure below). Track which fields were extracted verbatim, which the
user supplied or corrected here, and which were inferred, as you go - the footer needs that tally.

### Step 3: Additional Supporting Documents (Optional)

> "Do you have any additional documents I should incorporate? Pricing schedules, amendments, business case presentations, or prior executive summaries for reference? Not required, but they enrich the output."

### Step 4: Collect Only What's Missing

After the user confirms the extraction, ask ONLY for fields the contract didn't provide. Present as a single consolidated prompt -- not a metadata table:

> "A few things I need from you that aren't in the contract:
>
> 1. **Your name and grade level** (e.g., P4/M2, P5/M3) -- needed for the ATC approval chain
> 2. **Business Owner name and grade** -- needed for the ATS chain
> 3. **Stakeholders** -- who should be listed?
> [4. Only list other fields that are actually missing]
>
> If you know the names for the approval chain, provide them now. Otherwise I'll calculate which levels are needed and you fill in the names."

Do NOT ask for fields the contract already answered. Do NOT present a full metadata table.

### Step 5: Calculate and Confirm Approval Chains

First, resolve the deal value if it is ambiguous (see the deal-value disambiguation rule in the FRAP section). Then apply THE CANONICAL CHAIN-CONSTRUCTION RULE (one algorithm, defined in the FRAP section) to both ATC and ATS, and run the self-verification arithmetic echo for both chains BEFORE presenting anything. Only present chains whose echo reconciles.

> "Based on **$[total value]**, here are the required approval levels:
>
> **ATC Chain** (your procurement reporting line, lowest to highest; you are the Procurement Contact, not an approver):
>   - [Grade] ([Title]): [name if provided, else '?']
>   - [continue as needed]
>
> **ATS Chain** (business owner's reporting line, starting at the business owner, lowest to highest):
>   - [Business Owner grade]: [name]
>   - [continue as needed]
>
> Confirm or correct the names, then I'll generate."

Wait for confirmation. Do not generate until confirmed.

### Step 6: Generate Both Files

Produce both the DOCX and MD versions. Use the Default Document Structure (inlined below, under "INLINED: references/default-structure.md") and the formatting rules from the Output section above. Both files always include the Source Documents Line (under the title) and the Data Basis & Confirmations footer (after Governance & Approvals) built from the Step 2 tracking - these are structural, not optional, per the deterministic-skeleton rule.

1. Generate the `.docx` using the docx skill.
2. Generate the `.md` with identical content, converting any tables to inline text per the markdown rules.
3. Present both files to the user.

### Step 7: Present and Iterate

> "Here are both versions of the executive summary -- the .docx for formal approval workflow and the .md for pasting into email or Teams. Review and let me know if anything needs adjusting -- wording, emphasis, missing context, or corrections to the approval chain. Changes apply to both files."

## Template Basis

This skill's document format was built from 9 previously approved Lilly ATC/ATS executive summaries: Databricks, Kinaxis, SAP Ariba, Salesforce Marketing Cloud, SuccessFactors, ZS ZAIDYN, Adobe, Veeva Vault PromoMats, and Workday Sana Learn. The section order, governance block format, tone, financial table patterns, and formatting rules in the Default Document Structure (inlined below) reflect the exact patterns observed across all 9 documents. The format is locked.

## Category Calibration (Optional -- First-Time Setup)

On first use, or if the user mentions they work outside IT procurement, ask:

> "The executive summary template is based on IT procurement documents. If your category (Lab Services, Facilities, Marketing, Manufacturing, etc.) uses a different format, you can upload 5-8 previously approved ATC/ATS summaries from your category and I'll compare them to the standard template. If adjustments are needed, I'll note them. Otherwise, the standard template works across categories.
>
> Want to calibrate for your category, or use the standard template?"

See the Category Calibration subsection of the Default Document Structure (inlined below) for the full comparison workflow.

---

## Lilly FRAP Approval Threshold Schedules

The threshold tables are in the FRAP Thresholds section that is inlined below (search for "INLINED: references/frap-thresholds.md"). Each grade's threshold is the MAXIMUM total contract value that grade is authorized to approve. The chain-construction rule and worked examples live here in SKILL.md; the inlined section carries only the threshold numbers, because those are the values that change when FRAP changes.

### THE CANONICAL CHAIN-CONSTRUCTION RULE (one algorithm, used for both ATC and ATS)

There is exactly ONE chain algorithm in this skill. Apply it identically to ATC and ATS; the only difference is where the chain STARTS.

1. **Find the ceiling approver:** the ceiling is the LOWEST grade in the schedule whose threshold is GREATER THAN OR EQUAL TO the total contract value (that grade can cover the deal). Read the table from the bottom (lowest grade) upward and stop at the first grade whose threshold >= deal value. "Unlimited" always satisfies the comparison.
2. **Find the start grade:**
   - **ATC (procurement):** the user (initiating Procurement Contact) is NOT an approver. The chain STARTS at the next grade level UP from the user's own grade. Ask the user for their grade (tappable picker when the grades are enumerable). Edge case: if the user's own grade is already the top grade in the ATC table (CFO), there is no grade above it to move up to - do not guess a start grade; ask the user to confirm who reviews the deal instead (the kernel refuses this case with `needs_review=True` rather than fabricating a start grade).
   - **ATS (business side):** the chain STARTS at the business owner's OWN grade (the business owner is the first approver). Ask the user for the business owner's grade.
3. **Build the chain:** include the start grade, the ceiling grade, and EVERY grade in between, listed lowest to highest. If the start grade is already at or above the ceiling (a small deal relative to a senior starter), the chain is just the start grade through the ceiling, which may be a single level.

State the comparison explicitly as you build: for each candidate grade write `threshold vs deal value` so the reader can check the arithmetic. Then run the self-verification echo (see below) BEFORE writing the chain into the document.

**Do NOT hardcode any names.** Always ask the user to confirm the names at each required level. The grade levels are computed; the names are user-confirmed.

### Worked Example 1: $17M deal, user grade P4/M2 (ATC)

- Deal value = $17M. Start grade = next up from P4/M2 = **P5/M3**.
- Ceiling search (lowest grade whose threshold >= $17M, scanning up from the bottom): B4 $1M (no), P1-P3/M1 $2M (no), P4/M2 $4M (no), P5/M3 $15M (15 < 17, no), P6/M4 $20M (20 >= 17, YES). Ceiling = **P6/M4**.
- Chain = start (P5/M3) through ceiling (P6/M4), all levels in between, lowest to highest = **P5/M3; P6/M4**.

### Worked Example 2: $107M deal, user grade P5/M3 (ATC)

- Deal value = $107M. Start grade = next up from P5/M3 = **P6/M4**.
- Ceiling search (lowest grade whose threshold >= $107M): ... P6/M4 $20M (no), CPO $50M (50 < 107, no), CFO Unlimited (>= 107, YES). Ceiling = **CFO**.
- Chain = start (P6/M4) through ceiling (CFO), all levels in between, lowest to highest = **P6/M4; CPO; CFO**.

### Self-verification echo (RUN BEFORE GENERATING, every time)

Before you write any approval chain into the document, echo the arithmetic to yourself and confirm it, in this exact form, for BOTH the ATC and ATS chains:

> Self-check (ATC): deal value = $[value]. User grade = [grade]; start grade = next up = [start]. Ceiling = lowest grade with threshold >= $[value] = [ceiling] (because [ceiling threshold] >= [value] and the grade just below it, [grade], has [its threshold] < [value]). Chain (start -> ceiling, all in between) = [list]. Levels = [N].
>
> Self-check (ATS): deal value = $[value]. Business owner grade = [grade]; start grade = same = [grade]. Ceiling = lowest grade with threshold >= $[value] = [ceiling]. Chain = [list]. Levels = [N].

If either echo does not reconcile (the chain skips a level, includes a level above the ceiling, starts at the wrong place, or the ceiling threshold is actually below the deal value), STOP and recompute. Do not generate the document until both echoes reconcile. If the deal value is ambiguous (see the deal-value disambiguation rule below), resolve that FIRST: the echo is only valid once the single value that drives the chain is confirmed.

### Deal-value disambiguation (which figure drives the chain)

The chain is driven by ONE figure: the total contract value being approved. When the document presents several candidate figures (total contract value, total-cost-of-ownership including internal cost, annual fee, an amendment delta vs the new aggregate post-amendment value), do NOT guess. Present the candidates as a tappable single-select and ask the user which one drives the approval chain, with the most likely (total committed contract value over the term) pre-selected. For amendments, confirm whether the chain runs on the amendment delta alone or the aggregate post-amendment contract value, because that choice can change the ceiling.

### Kernel wiring: live-fetch-first, vendored-fallback (REQUIRED before every chain computation)

The chain-construction rule above and the threshold tables inlined below are implemented for you in `frap_chain_kernel.py`'s `compute_chain(facts)`. Do not hand-recompute the chain in prose and do not hand-roll a second copy of the algorithm - call the kernel. Before calling it, resolve the threshold table source every time, in this order:

1. Attempt to fetch exactly this URL via the M365 connector: `https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/SitePages/FRAP---Procurement-Transactions.aspx`. This exact page, and only this exact page, is the intended target. A general SharePoint search for "FRAP threshold" is NOT an acceptable substitute for fetching this URL: stale/superseded FRAP tables exist elsewhere on SharePoint, and searching risks silently pulling one of those instead of the current schedule.
2. **On success:** parse the fetched page into the same `(grade, threshold)` table shape `compute_chain()` expects - one list for ATC, one for ATS-operating, one for ATS-capital, lowest grade first. Call `compute_chain()` with `table_source="live SharePoint"` and pass the parsed tables as `live_atc_table` / `live_ats_table_operating` / `live_ats_table_capital`. Disclose to the user once, before presenting any chain, that this run used the live SharePoint source, and include the URL above.
3. **On failure** (connector unavailable, page unreachable, or the fetched page cannot be parsed into a recognizable table): call `compute_chain()` with `table_source="vendored snapshot"` and no live tables. Disclose to the user once, before presenting any chain, that this run used the locally-shipped snapshot and that it is not confirmed current against the live page.
4. Either way, use the returned `Decision.reasoning` field directly as the mandatory self-verification arithmetic echo required above - do not compute a second, separate echo by hand. Only present a chain whose `Decision.reasoning` echo you have shown the user.
5. If `Decision.needs_review` is True (the kernel refused - for example a missing deal value, an unrecognized grade, or the CEO capital/operating band needing disambiguation per the rule below), do NOT guess past the refusal. Surface it to the user as the tappable clarifying question this skill already asks for that case (grade level, ATC vs ATS, or the capital-vs-operating tap), using `Decision.reasoning` to explain what is missing.

---

## Content Analysis Requirements

### From Contract
- Background: Why does Lilly need this? What does it replace? Strategic rationale.
- Scope: What exactly is being purchased - users, modules, geography, term.
- Financials: Total value, year-by-year if applicable, key payment terms.
- Benefits: Negotiated savings, credits, rate protections, audit waivers, operational value.
- Risks: Termination restrictions, price variability, open items, compliance dependencies.

### Tone and Style
- Concise executive prose - not technical jargon
- Active voice; present tense for status; past tense for background
- Lead with the ask; support with detail
- Use bullets for lists of 3+ items; prose for shorter sets

### Gap Handling
- Missing savings → ask user, then omit the section entirely (do not write "No savings identified")
- Term unclear → ask user
- Scope ambiguous → note "Scope details to be confirmed"
- Never invent numbers, benefits, or risks

---

## Output

Produce BOTH files every time. Same content, two formats.

### File 1: DOCX (formatted)
File: `[SupplierName]_ATC_Executive_Summary.docx`
Format: Word document, maximum 2 pages, clean prose format per rules above.

Generate using the docx skill (JavaScript/docx-js):
- Calibri 11pt body (Lilly brand body font)
- Bold inline section headers (no shading)
- Simple tables for financial data only
- Standard Word bullets via numbering config
- US Letter page size, 1-inch margins

### Word (.docx) report generation wiring (HARD RULE)

The native `executive_summary.docx` deliverable is produced by calling the vendored `executive_summary_generator.py` (in this skill's own directory, python-docx-based) with a validated executive-summary register as input, never by hand-assembling the document paragraph-by-paragraph in the moment. `executive_summary_generator.py` validates the register, computes BOTH the ATC and ATS approval-chain grade sequences by calling `compute_chain()` in the vendored `frap_chain_kernel.py` (the same HARD RULE named in "Kernel wiring" above, "Do not hand-recompute the chain in prose and do not hand-roll a second copy of the algorithm, call the kernel"), asserts the ATC-chain-resolved, ATS-chain-resolved, approver-names-match-chain-length, and Financial-Risk-Rating-integrity invariants, then writes the Section Order 1-15 (Title through Data Basis & Confirmations) as a real `.docx`, and finally re-scans the assembled document to confirm no em dash slipped in and that the Cost Efficiency section is present if and only if savings data was supplied (the task #25 "omit entirely, never write 'No savings identified'" fix, enforced as a code-level check, not just a workflow instruction). Call `generate_executive_summary_docx(register, output_path)` (or its component functions `validate_executive_summary_input()` / `compute_ground_truth()` / `build_document()` individually when only part of the pipeline is needed) rather than writing `python-docx` calls directly in this skill's own workflow. If the generator raises `ExecutiveSummaryValidationError` or `ReconciliationError`, do not deliver a document: surface the raised message (a missing or invalid field, a Financial Summary that does not foot to its stated total, an unresolvable approval chain, or a Financial Risk Rating that was about to be silently defaulted) and resolve it, per Rule 1 and Rule 3, rather than hand-patching around the failure. Approval-chain GRADES are always kernel-computed; approval-chain NAMES are never computed or invented, per "Do NOT hardcode any names" above, the module renders `[To be confirmed]` for any resolved grade with no supplied name. If `executive_summary_generator.py` cannot be read (missing or corrupted), fall back to hand-building the document per the Default Document Structure (inlined above) and disclose plainly in the output that the vendored generator was unavailable this run.

**Invocation.**
```
python executive_summary_generator.py --input executive_summary_register.json --output executive_summary.docx
python executive_summary_generator.py --demo          # self-test: builds both illustrative demo registers'
                                                        # DOCX files (with savings, and no savings), reopens
                                                        # both, and asserts every expected section, table, and
                                                        # value is present (76/76 checks)
python executive_summary_generator.py                 # no args -> also runs the self-test
```
The executive-summary register's JSON shape (deal facts, pre-composed narrative sections, financial figures, and approval-chain facts including the required `table_source` live-fetch-first/vendored-fallback flag) is documented in full in the module docstring at the top of `executive_summary_generator.py`. It consumes narrative content (opening paragraph, background, benefits, risks, and so on) already composed by this skill's own Read First, Ask Second workflow rather than reading the source contract itself, the same "consume, don't re-derive" discipline should-cost-builder and evaluation-engine apply to each other's sourced figures; only the ATC/ATS chain math is delegated to the kernel. Scope note: this generator produces `executive_summary.docx` only, the companion `executive_summary.md` (Output File 2 above) remains a separate deliverable produced through the existing docx-js / Markdown-conversion path, not by this Python module.

### File 2: Markdown (text only)
File: `[SupplierName]_ATC_Executive_Summary.md`
Format: Plain text markdown. Same content as the DOCX -- same sections, same wording, same data.

Markdown formatting rules:
- Title as `# Executive Summary: [Deal Name]`
- Section headers as `**Header Name**` (bold inline, not markdown heading levels)
- NO tables anywhere -- convert all financial tables to inline text or labeled lists
  - e.g., "Year 1: $6.47M | Year 2: $8.46M | Year 3: $14.62M | Total: $29.55M" or bullet list with bold labels (the year figures must sum to the stated total)
- Governance fields as bold label + plain value, one per line:
  - `**ATS Approver(s):** Name One; Name Two`
- Bullets as `- ` (standard markdown dash)
- No horizontal rules between sections -- use blank lines for separation
- No images, no HTML, no formatting beyond bold and bullets
- This file is for pasting into email, Teams, or approval systems that strip rich formatting

---

## Guardrails

- Format fidelity: Match Lilly-approved prose format - no colored banners, no dashboard tables
- Source fidelity: All content from uploaded documents
- No fabrication: Never invent numbers, benefits, or risks
- No org chart inference: Do NOT derive names from decks, emails, or any document. Ask the user.
- Chain confirmation: Always propose levels needed + ask user to fill/confirm names before generating
- 2-page maximum: Hard limit
- Executive tone: Professional, neutral, decision-focused

## SUITE INTEGRATION & ENHANCEMENTS

- **Native deliverable (do not change):** the Lilly-format ATC/ATS Executive Summary DOCX. The "decision-ready native format" rule means this exact document, not a generic dashboard.
- **Deliberate exception to "ask rarely":** the FRAP approval chain is compliance-critical, so this skill DOES confirm the few inputs that drive it. Confirm the user's grade level, whether an ATC or ATS chain applies, and any ambiguous deal value - using tappable single-select options, nothing typed.
- **Otherwise zero questions:** derive all narrative content automatically from the uploaded contract or work order. Keep the verified FRAP thresholds as the embedded default; the only interaction should be the one or two taps that protect the approval chain.


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

## SUITE v2 SPECIFICS - executive-summary

**Input tiers.** MUST: a contract or work order. RECOMMENDED: grade level and ATC-vs-ATS (confirmed by tap). OPTIONAL: none.
**Native deliverable (do not change):** the Lilly-format ATC/ATS Executive Summary DOCX. "Decision-ready native format" means this exact document.
**Compliance gate:** confirm grade level, ATC vs ATS, and any ambiguous deal value using tappable single-select - these drive the FRAP approval chain. Keep the verified FRAP thresholds as the embedded default. Every other field derives automatically from the uploaded document; the only interaction should be the one or two compliance taps.

---

# INLINED REFERENCE FILES

The following files were previously in subdirectories. They are now inlined for single-file installation.

---

## INLINED: references/default-structure.md

# Default Document Structure

This template was built from 9 previously approved Lilly ATC/ATS Executive Summaries across IT procurement (Databricks, Kinaxis, SAP Ariba, Salesforce, SuccessFactors, ZS Associates, Adobe, Veeva, Workday/Sana Learn). Follow this exactly. Other categories may vary slightly -- see "Category Calibration" at the end of this file.

---

## Document Format at a Glance

- Plain prose Word document
- Bold inline section headers (no colored shading, no banners)
- Source Documents line under the title states exactly which document(s) this summary was built from
- Governance fields at the BOTTOM as bold label + plain value pairs
- Data Basis & Confirmations footer closes the document with a one-glance confidence/[CONFIRM] read
- Maximum 2 pages -- hard limit

---

## Section Order (strict -- follow this sequence exactly)

### 1. Title
"Executive Summary: [Deal Name / Description]"
Bold, 14pt, left-aligned. Some variants: "ATC ATS Executive Summary: [Name]"

### 2. Source Documents Line
One line, always present, directly under the title. 9pt italic Calibri, Bold Grey (#8A969E) -
the same muted secondary-text role docx-design-system.md defines for "Footer text," reused here so
the line reads as quiet provenance, not a competing headline. States every document this summary was
built from, so the approval record carries its own audit trail:
> "Source Document: Kinaxis Master Services Agreement (executed May 12, 2026)."

For a base agreement plus amendment(s), or a contract plus a separate SOW/pricing schedule, list each
with its role, semicolon-separated, earliest/base document first:
> "Source Documents: Databricks Master Cloud Services Agreement (executed March 14, 2025);
> Amendment 1 - Committed Use Expansion (executed June 2, 2026)."

Never name a document that was not actually uploaded or read. If a referenced parent agreement was not
provided, say so rather than omitting it silently: "Source Document: FY26 Statement of Work (governing
MSA not provided - referenced only)."

### 3. Opening Paragraph
3-5 sentences. ALWAYS lead with the ask and the bolded total dollar amount.

Pattern A (most common -- for renewals, new purchases, and change orders):
> "Your approval is requested for **$X** over a [N]-year term with [Supplier] for [purpose]. [1-2 sentences on what the agreement covers]. [1 sentence on strategic alignment]."

Pattern B (for platform/license renewals where value explanation is needed):
> "Your approval is requested for the renewal of [platform/service], supporting [what it does for Lilly]. This renewal ensures uninterrupted access to [key capabilities]. The agreement covers [scope summary] and aligns with Lilly's [strategic priorities]."

Pattern C (for change orders and amendments):
> "Requesting approval for a change order to amend the existing [agreement]. This amendment [what it does] to [business reason]."

Pattern D (for complex/phased deals):
> "Eli Lilly and Company seeks approval for **$X** over a [N]-year term with [Supplier] for [purpose]. [Detailed context on what the money covers]."

### 4. Request Overview (CONDITIONAL)
Include ONLY for complex, phased, or multi-component deals (e.g., change requests building on prior phases).
2-4 sentences clarifying what specifically is being approved in this document.
Skip for straightforward renewals or new purchases.

### 5. Background & Justification
3-5 sentences. Why Lilly needs this, what it replaces or extends, strategic rationale.
For renewals: explain what the platform does and why continued access matters.
For change orders: explain what changed and why the adjustment is necessary.

### 6. Key Capabilities and Value (CONDITIONAL)
Include for license renewals and platform renewals where the value proposition needs to be stated.
Bulleted list prefaced with: "Key capabilities and value from this renewal include:"
5-7 bullets covering: platform value, user coverage, security/compliance, pricing predictability, strategic alignment.
Skip for change orders, amendments, and simple purchases where scope section covers this.

### 7. Scope of Agreement
Bulleted or structured list. Always include:
- Platform/service name
- Users covered (count and type)
- Modules/services included
- Geography
- Term (start date through end date)
- Support level (if applicable)
- Service levels (if applicable)

Can be formatted as bullets with bold labels:
> - **Platform:** [name]
> - **Users Covered:** [count and type]
> - **Modules Included:** [list]
> - **Term:** [dates]

### 8. Financial Summary
ALWAYS include. Format depends on complexity:

**Simple deals:** Bulleted list with bold labels:
> - **Total Amount Requested:** $X
> - **Budgeted Amount:** $X
> - **Term:** [dates]
> - **Payment Terms:** Net 60

**Multi-year or multi-line deals:** Table with period/component breakdown:

| Period | Fee |
|--------|-----|
| Year 1 | $X |
| Year 2 | $X |
| **Total** | **$X** |

**Complex deals with entitlements:** Detailed table with service, metric, usage, and fee columns.

If year-by-year fees vary, explain WHY (phased volumes, stepped pricing, mid-year starts).
If there is a gap between order form cost and budgeted amount, explain the justification.

### 9. Vendor-Specific Section (CONDITIONAL)
Include only when the deal has meaningful vendor-specific commercial detail not covered elsewhere.
Title varies by deal type:
- "Usage Commitments, Discounts & Support" (for commitment-based deals like Databricks)
- "Pricing & Terms" (for fixed-fee professional services like Kinaxis)
- "Contracted Payments Overview" (for change orders showing original + amendment)

Skip entirely if Financial Summary and Scope cover everything.

### 10. Key Contract Benefits
ALWAYS include. Bulleted list. One benefit per bullet. Lead with the most financially significant.

Common benefit types (include all that apply):
- Negotiated savings vs. original quote or list price (with dollar amount and percentage)
- Rate protections, price caps, escalator limits
- Credits, investments, or free services from vendor
- Expanded scope at no incremental cost
- Licensing flexibility (SKU exchanges, growth rates)
- Support improvements (coverage, SLAs, dedicated resources)
- Infrastructure or storage upgrades

**Savings must be specific.** Not "significant savings achieved" but "$600,764 annual reduction (19.5%). Over 28 months, approximately $1.4M in negotiated savings vs. original quote."

### 11. Key Contract Risks / Considerations
ALWAYS include. Bulleted list. One risk per bullet.

Common risk types (include all that apply):
- Termination restrictions (no TFC, or TFC with full payout obligation)
- Pricing variability (PaaS, usage-based, CPI adjustments)
- Usage-dependent ROI (adoption risk)
- Time-limited options or execution deadlines
- Growth beyond projections requiring additional budget
- Open items or pending resolutions

### 12. Business Case (CONDITIONAL)
Include for large, strategic, or multi-year commitments.
2-4 sentences on strategic rationale and operational impact.
Standard closing sentence pattern: "This investment secures critical capabilities for [functions] and aligns with Lilly's strategic goals for operational excellence and digital transformation."
Skip for small change orders or simple amendments.

### 13. Cost Efficiency (CONDITIONAL)
Include ONLY when there are concrete, documentable savings or vendor investments.
List specific dollar amounts with context:
- Rate reductions with percentages
- Vendor-funded investments (dollar value)
- Fee waivers or credits
- Projected savings over the deal term
- Comparison to current state or original pricing

If no savings were achieved: omit this section entirely. Do not write "No savings identified."

### 14. Governance & Approvals
ALWAYS the last NARRATIVE/formal section. Use "Governance & Approvals" as a bold subheader if needed.

**ATS block (business side, always listed first):**

**ATS Approver(s):** [names; semicolon-separated; lowest to highest in reporting chain]
**Budget Owner(s):** [name]
**Budget Approved by Budget Owner:** Yes
**Budgeted Amount:** $[amount]
**Stakeholders:** [names; semicolon-separated]
**Business Owner(s):** [name]
**Comments / Instructions to Business Owner(s):** No action is required. This notification is for your awareness only.

**ATC block (procurement side):**

**ATC Approver:** [names; semicolon-separated; lowest to highest in reporting chain]
**Procurement Contact:** [user's name]
**Effective Date:** [date or "As of signature" or "Date of last signature"]
**Payment / Discount Terms:** [Net XX]
**Price Change Mechanism:** [description -- e.g., "3.3% annual cap", "CPI or 3%, whichever is less", "Discounts applied to then-current price list"]
**Financial Risk Rating:** [Copy the SER score and rating exactly from the source document or user input. Never default this value. If not provided: "NEEDS_INPUT (SER score and rating not provided)".]
**Other Contract Elements:** [specific items or "None"]

### 15. Data Basis & Confirmations
ALWAYS the very last content in the document -- a compact footer, not a narrative section, and not
counted against the "Governance is always last" rule above (Governance is the last *approval-workflow*
section; this footer is the last *content*, closing out the page beneath it). 8pt Calibri, Bold Grey
(#8A969E) -- the same "Footer text" role already defined in docx-design-system.md, no larger and no
bolder than the running page footer, so it reads as the document quietly showing its own work rather
than a bolted-on component. One coverage line, plus a short list only when there are inferred fields:

> "Data Basis: 11 of 13 fields extracted verbatim from the source document; 2 user-confirmed;
> 1 inferred - flagged [CONFIRM] below."
> [CONFIRM] Price Change Mechanism - inferred from renewal-pricing language in Section 4.2, not a
> labeled clause (Confidence: Medium)

If nothing was inferred (the common case once the user has answered Step 4), the list is empty and the
line reads instead:
> "Data Basis: All fields extracted verbatim from the source document or confirmed by the user.
> No inferred fields."

[CONFIRM] is plain bold text, never a colored badge -- this document carries no color in its body, and
the footer keeps that rule rather than breaking it for emphasis. This footer never repeats a field
already marked NEEDS_INPUT in Governance & Approvals; those already carry their own flag there. It exists
only for fields filled by a plausible, sourced inference, so the approver knows precisely what to
double-check before signing, without re-opening the source contract. Confidence uses the same High /
Medium / Low scale as the rest of the suite (Operating Rule 3).

---

## Formatting Specifics (DOCX)

- Body font: Calibri 11pt (the Lilly brand body font; use Calibri throughout for brand consistency)
- Title: Bold, 14pt
- Source Documents line: 9pt italic Calibri, Bold Grey (#8A969E), one line directly under the title
- Section headers: Bold inline text, same font size as body (no larger, no color, no shading)
- Tables: Simple clean borders, gray header row -- ONLY for financial data
- Bullets: Word numbering config (LevelFormat.BULLET) -- never unicode characters
- Governance fields: Bold label + colon + plain value on SAME LINE -- NOT a table
- Data Basis & Confirmations footer: 8pt Calibri, Bold Grey (#8A969E), the last content on the page,
  after Governance & Approvals; [CONFIRM] tags are plain bold text, never a colored badge
- Page size: US Letter (8.5" x 11"), 1" margins
- Spacing: modest before/after paragraphs, no excessive whitespace

---

## Length Management

Target: 1.5-2 pages. Hard limit: 2 pages.

If over 2 pages:
1. Compress Background & Justification to 2-3 sentences
2. Cut benefits and risks to 3-4 most significant each
3. Collapse financial table to fewer rows
4. Tighten narrative -- remove transitional phrases
5. Drop conditional sections (Request Overview, Business Case, Cost Efficiency, Key Capabilities) if content is thin
6. Combine Vendor-Specific Section into Financial Summary
7. Compress the Data Basis & Confirmations footer to its single coverage line (drop the per-field
   [CONFIRM] list) only as a last resort, and only when there are zero or one inferred fields to
   begin with -- if there are two or more [CONFIRM] items, keep the list; it is the reason the
   footer exists

Never cut:
- Governance block (always complete)
- Total contract value and term
- Opening paragraph
- Source Documents line (one line; never trimmed, it costs no meaningful space)
- Key Contract Benefits (at least top 3)
- Key Contract Risks (at least top 2)
- Data Basis & Confirmations footer (may compress to its one-line form per step 7 above, but never
  omitted entirely -- an approval document with an unverifiable data basis is the thing this footer
  exists to prevent)

---

## Markdown Version (Text-Only)

The .md file contains identical content to the .docx but uses only plain text markdown formatting. No tables anywhere.

### Conversion Rules

**Title:** `# Executive Summary: [Deal Name]`

**Source Documents line:** Plain text, no bold, directly under the title line, same wording as the
DOCX (italics do not render in the target systems this .md is pasted into, so drop the italic, keep
the words):
> Source Document: Kinaxis Master Services Agreement (executed May 12, 2026).

**Section headers:** `**Header Name**` on its own line (bold inline, not `##` heading levels)

**Financial data (tables → text):** Convert every table to one of these formats:

Format A -- inline pipe-separated (for compact year-by-year). The year figures MUST sum to the stated total:
> Year 1: $6.47M | Year 2: $8.46M | Year 3: $14.62M | **Total: $29.55M**

(6.47 + 8.46 + 14.62 = 29.55. Always re-add the year figures and confirm they equal the stated total before emitting; an executive summary whose periods do not foot to the total is a fail.)

Format B -- labeled bullet list (for multi-component breakdowns):
> - **Cloud ERP Private:** $X/year
> - **Transportation Mgmt:** $X/year
> - **Total Contract Value:** $X

Use whichever is more readable for the specific data. If the DOCX table has more than 5 rows, use Format B.

**Governance fields:** Bold label + colon + plain value, one per line:
> **ATS Approver(s):** Name One; Name Two; Name Three
> **Budget Owner(s):** Name One
> **Budget Approved by Budget Owner:** Yes

**Data Basis & Confirmations footer:** Plain text, no bold except the `[CONFIRM]` tag itself, placed
after the governance fields as the last content in the file:
> Data Basis: 11 of 13 fields extracted verbatim from the source document; 2 user-confirmed;
> 1 inferred - flagged [CONFIRM] below.
> **[CONFIRM]** Price Change Mechanism - inferred from renewal-pricing language in Section 4.2, not
> a labeled clause (Confidence: Medium)

**Bullets:** Standard markdown `- ` dash

**Separation:** Blank lines between sections. No horizontal rules, no dividers.

**Prohibited in .md:** Tables (`| |`), HTML tags, images, horizontal rules (`---`), heading levels beyond the title `#`.

---

## Category Calibration (Optional)

This template was built from IT procurement executive summaries. Other categories (Lab Services, Facilities, Marketing, Manufacturing, etc.) may use slightly different section emphasis, terminology, or governance conventions.

**To calibrate for a different category:**

When the user first installs the skill or mentions they work in a non-IT procurement category, ask:

> "This template is based on IT procurement executive summaries. If your category uses a different format, you can upload 5-8 previously approved ATC/ATS summaries from your category and I'll review them against the standard template to see if adjustments are needed for your commodity. Want to do that, or use the standard template?"

**If the user provides examples:**
1. Read all provided examples
2. Compare section order, section names, content emphasis, and governance block format against this template
3. Note any differences: additional sections, different section names, different ordering, different governance fields, different tone
4. Present findings: "Your category's summaries differ from the standard template in these ways: [list]. Want me to adjust the template for your use?"
5. If confirmed, apply adjustments for the remainder of the conversation and note them so the user can make them permanent

**If the user declines:** Use this template as-is. It covers the universal pattern and works across categories.

---

## INLINED: references/frap-thresholds.md

# Lilly FRAP Approval Threshold Schedules

**This inlined section is the single source of truth for the FRAP threshold numbers within this skill. Update the tables here when FRAP changes; do not hardcode thresholds in any other location.**

- **FRAP Thresholds Version:** Current as of May 2026. Verified against Lilly internal FRAP reference.
- The chain-construction rule, worked examples, and self-verification echo live above in the "Lilly FRAP Approval Threshold Schedules" section of this SKILL.md. This inlined section carries only the threshold tables, because those are the values that change. (Content is inlined below, not a separate on-disk file.)

## ATC Thresholds (Procurement)

The ATC chain is built from the USER'S procurement reporting line, lowest to highest. The user (initiating Procurement Contact) is NOT an ATC Approver; the chain starts at the next grade level up from the user.

| Level | Approver Grade | ATC Threshold |
|-------|---------------|---------------|
| 1     | CFO            | Unlimited     |
| 2     | CPO            | $50M          |
| 3     | P6/M4          | $20M          |
| 4     | P5/M3          | $15M          |
| 5     | P4/M2          | $4M           |
| 6     | P1-P3/M1       | $2M           |
| 7     | B4             | $1M           |

## ATS Thresholds (Business Side)

The ATS chain is built from the BUSINESS OWNER'S reporting line, starting with the business owner's own grade and going up to the ceiling approver (the lowest grade whose threshold is greater than or equal to the total contract value).

| Level | Approver Grade       | ATS Threshold (single approval) | ATS Threshold (capital/asset deal) |
|-------|---------------------|---------------------------------|------------------------------------|
| 1     | BOD                  | Unlimited                       | Unlimited                          |
| 2     | CEO                  | $200M                           | $1B                                |
| 3     | M7                   | $35M                            | $35M                               |
| 4     | M6                   | $15M                            | $15M                               |
| 5     | M5/R12               | $8M                             | $8M                                |
| 6     | M4/P6/R10-11         | $4M                             | $4M                                |
| 7     | M3/P5/R7-9/S6-7      | $1M                             | $1M                                |
| 8     | M2/P4/R4-R6          | $0.1M                           | $0.1M                              |
| 9     | M1/P3/R3             | $0.02M                          | $0.02M                             |

**CEO threshold disambiguation (REQUIRED):** the CEO grade carries two thresholds. **$200M** is the CEO ceiling for a single operating/spend approval (the default for a procurement contract or work order). **$1B** is the CEO ceiling for a capital/asset authorization (capital project, asset acquisition, balance-sheet commitment), above which the Board of Directors (BOD) is required. For an ATC/ATS executive summary the default is the **$200M** column unless the user confirms the deal is a capital/asset authorization. Only the BOD vs CEO boundary is affected; for any deal at or below $200M the two columns are identical, so this choice only matters for deals between $200M and $1B. When a deal value lands in that band, ask the user (tappable single-select) whether it is an operating approval ($200M ceiling -> add BOD) or a capital/asset authorization ($1B ceiling -> CEO is sufficient) before fixing the ATS ceiling.

**Do NOT hardcode any names.** Always ask the user to confirm the names at each required level.

---

## INLINED: references/metadata-fields.md

# Metadata Fields Reference

## Overview

These are the fields collected during intake. Most are derived from the contract automatically.
Only the fields listed as "Ask user" require explicit input.

---

## Fields: User / Procurement Context

| Field | Source | Notes |
|-------|--------|-------|
| **User's name** | Ask user | Listed as Procurement Contact in governance block |
| **User's grade level** | Ask user | e.g., P4/M2, P5/M3 - determines where ATC chain starts |

---

## Fields: Business / ATS Side

| Field | Source | Default |
|-------|--------|---------|
| **Business Owner(s)** | Ask user | Required - drives ATS chain |
| **ATS Approver(s)** | Calculated from ATS threshold schedule + confirmed by user | Chain from business owner upward |
| **Budget Owner(s)** | Ask user (usually same as Business Owner) | - |
| **Budget Approved by Budget Owner** | Default | Yes |
| **Budgeted Amount** | Total contract value from document | From contract |
| **Stakeholders** | Ask user | - |
| **Comments / Instructions to Business Owner(s)** | Default | "No action is required. This notification is for your awareness only." |

---

## Fields: Procurement / ATC Side

| Field | Source | Default |
|-------|--------|---------|
| **ATC Approver** | Calculated from ATC threshold schedule + confirmed by user | Chain from user's next level upward |
| **Procurement Contact** | User's name (from above) | - |
| **Effective Date** | From contract | - |
| **Payment / Discount Terms** | From contract | Net 60 |
| **Price Change Mechanism** | Ask user if not in contract | - |
| **Financial Risk Rating** | From SER (Supplier Evaluation Report) or user input | NEEDS_INPUT (never defaulted) |
| **Other Contract Elements** | Ask user if not evident | None |

---

## Governance Block Placement

The governance block always appears at the END of the document, after all narrative sections.
It is formatted as bold label + plain value pairs - NOT a table.

Example:
  **ATS Approver(s):** Name One; Name Two; Name Three
  **Budget Owner(s):** Name One
  **Budget Approved by Budget Owner:** Yes
  **Budgeted Amount:** $X,XXX,XXX
  **Stakeholders:** Name One; Name Two
  **Business Owner(s):** Name One
  **Comments / Instructions to Business Owner(s):** No action is required. This notification is for your awareness only.

  **ATC Approver:** Name One; Name Two
  **Procurement Contact:** [User's name]
  **Effective Date:** [Date]
  **Payment / Discount Terms:** Net 60
  **Price Change Mechanism:** [Mechanism]
  **Financial Risk Rating:** [SER score and rating from source or user; "NEEDS_INPUT (SER score and rating not provided)" if absent]
  **Other Contract Elements:** None

---

## Handling Missing Fields

- Required field not provided → prompt once; if still missing, mark "[To be confirmed]"
- Optional field not provided → apply default silently (this applies ONLY to fields with a genuine safe default such as the Comments line or Net 60 payment terms; it does NOT apply to the Financial Risk Rating, which is never defaulted and is marked "NEEDS_INPUT (SER score and rating not provided)" when absent)
- Grade level not provided → ask before proceeding; chain cannot be calculated without it

---

## INLINED: INSTALLATION.md

> **Note:** For installation, use the master INSTALLATION.md at the package root. This file is retained for reference.

# ATC/ATS Executive Summary Skill -- Installation & Usage Guide

## Package Information

| Field | Value |
|-------|-------|
| Author | Marc Lane, Associate Director, Global IT Procurement |
| Suite | v10.6.6 |
| Version | 2.3 |
| Last Updated | July 22, 2026 |
| Description | Generates Lilly-approved ATC/ATS Executive Summary Word documents for procurement approval workflows. |

## Installation Steps

When a user uploads this package and asks for installation, follow these steps:

1. Verify write access to the skills directory:
```bash
touch /mnt/skills/user/write-test && echo "Write access confirmed" && rm /mnt/skills/user/write-test
```
Note: `/mnt/skills/user/` is writable. It is separate from `/mnt/skills/public/`, `/mnt/skills/organization/`, and `/mnt/skills/examples/`, which are read-only.

2. Unzip the package to a temporary location
3. Read SKILL.md and all files in the references/ directory to understand what is being installed
4. Present the FRAP threshold tables to the user for confirmation before proceeding:

> "This skill includes FRAP approval thresholds used to calculate ATC and ATS approval chains. Please confirm these match your current policy:
>
> **ATC Thresholds:**
> B4: $1M | P1-P3/M1: $2M | P4/M2: $4M | P5/M3: $15M | P6/M4: $20M | CPO: $50M | CFO: Unlimited
>
> **ATS Thresholds:**
> M1/P3/R3: $0.02M | M2/P4/R4-R6: $0.1M | M3/P5/R7-9/S6-7: $1M | M4/P6/R10-11: $4M | M5/R12: $8M | M6: $15M | M7: $35M | CEO: $200M (operating) / $1B (capital/asset) | BOD: Unlimited
>
> Confirm these are correct, or provide corrections."

4. If the user confirms, proceed. If the user provides corrections, update the threshold tables in SKILL.md before copying.
5. Copy each skill folder to `/mnt/skills/user/`:
  - executive-summary
6. Verify each skill was copied successfully:
```bash
  echo "executive-summary: $(test -f /mnt/skills/user/executive-summary/SKILL.md && echo OK || echo MISSING)"
```
7. Confirm to the user what was installed and that they should start a new conversation to use the skills

Skills installed this way will be available in all future conversations. They will not appear in the current conversation's available skills list -- this is expected behavior.

### Fallback: User-Provided Thresholds

If installation cannot proceed with embedded thresholds for any reason, install the skill without the threshold tables and instead add a first-use prompt to SKILL.md that asks:

> "This skill needs your current FRAP approval thresholds to calculate ATC and ATS chains. Please paste or upload your current FRAP threshold schedule, or provide the ATC and ATS threshold tables."

The skill then uses the user-provided thresholds for that session and all future sessions. This approach ensures the thresholds always come from the user rather than the install package.

## What This Skill Does

Generates Lilly-approved ATC/ATS Executive Summary Word documents for procurement approval workflows. Upload a contract or work order, and it reads the document, derives all narrative content automatically, applies the correct FRAP approval chains based on deal value and the Lilly threshold schedule, and produces a ready-to-submit DOCX in the exact format used by the Lilly procurement team.

---

## Package Contents

```
executive-summary-package/
  INSTALLATION.md               -- this file
  SKILL.md                      -- the skill definition (read before installing)
  frap_chain_kernel.py          -- REQUIRED FRAP approval-chain decision kernel (compute_chain)
  MAINTENANCE.md                -- when/how to update frap_chain_kernel.py
  QUICKSTART.md                 -- plain-language usage guide with example prompts
  references/
    metadata-fields.md          -- field definitions and governance block format
    default-structure.md        -- approved document structure and formatting rules
```

---

## Installation

### Automated Installation (from zip)

Read the skill contents first, then install:

```bash
# Unzip if not already done
unzip executive-summary-package.zip -d /tmp/exec-install 2>/dev/null

# Read the skill before installing (required)
cat /tmp/exec-install/executive-summary-package/SKILL.md
cat /tmp/exec-install/executive-summary-package/references/metadata-fields.md
cat /tmp/exec-install/executive-summary-package/references/default-structure.md

# Install
mkdir -p /mnt/skills/user/executive-summary/references
cp /tmp/exec-install/executive-summary-package/SKILL.md /mnt/skills/user/executive-summary/SKILL.md
cp /tmp/exec-install/executive-summary-package/frap_chain_kernel.py /mnt/skills/user/executive-summary/frap_chain_kernel.py
cp /tmp/exec-install/executive-summary-package/MAINTENANCE.md /mnt/skills/user/executive-summary/MAINTENANCE.md
cp /tmp/exec-install/executive-summary-package/references/metadata-fields.md /mnt/skills/user/executive-summary/references/metadata-fields.md
cp /tmp/exec-install/executive-summary-package/references/default-structure.md /mnt/skills/user/executive-summary/references/default-structure.md

# Verify
echo "executive-summary: $(test -f /mnt/skills/user/executive-summary/SKILL.md && echo 'INSTALLED' || echo 'FAILED')"

# Clean up
rm -rf /tmp/exec-install
```

The skill will be available in the next conversation. It will not appear in the current session's available skills list -- this is normal. Start a new conversation to use it.

### For Claude Projects

Upload SKILL.md and both files from references/ as Project knowledge. The skill is available immediately in every conversation within that Project.

---

## How to Use After Installation

Upload a contract or work order and say any of:
- "Create an ATC summary for this contract"
- "Draft an ATS executive summary"
- "Build an approval summary from this work order"
- "ATC summary"

The skill will ask for:
1. The contract or work order (upload)
2. Your grade level (e.g., P4/M2, P5/M3) -- determines ATC chain starting point
3. The business owner -- determines ATS chain
4. A few metadata fields not derivable from the contract

It proposes the ATC and ATS approval chains for your confirmation before generating the Word document.

---

## Threshold Reference (Lilly FRAP -- current as of May 2026)

### ATC Thresholds
| Grade | Threshold |
|-------|-----------|
| B4 | $1M |
| P1-P3/M1 | $2M |
| P4/M2 | $4M |
| P5/M3 | $15M |
| P6/M4 | $20M |
| CPO | $50M |
| CFO | Unlimited |

### ATS Thresholds
| Grade | Threshold |
|-------|-----------|
| M1/P3/R3 | $0.02M |
| M2/P4/R4-R6 | $0.1M |
| M3/P5/R7-9/S6-7 | $1M |
| M4/P6/R10-11 | $4M |
| M5/R12 | $8M |
| M6 | $15M |
| M7 | $35M |
| CEO | $200M operating / $1B capital |
| BOD | Unlimited |

---

## Dependencies

This skill uses the `docx` public skill to generate DOCX output. Ensure `/mnt/skills/public/docx/SKILL.md` is present in your environment (it is by default in all Claude instances).

---

## Notes

- The skill does NOT auto-populate names in the approval chains. It calculates which grade levels are required and asks you to confirm the names.
- Output format strictly follows the Lilly-approved prose format: Calibri 11pt, plain bold section headers, light gray table headers, governance fields as inline bold-label text pairs, no colored banners or dashboard layouts.
- The Procurement Contact field uses the name of whoever is running the skill.

---


---

## Installation Notes

- After installation, start a **new conversation** to use the skills. They will not appear in the conversation where you installed them. This is normal.
- If a prior version of these skills exists, installation overwrites it with the latest version.
- If you run into any issues during installation, tell Claude to list the extracted files and retry the copy step.
- The QUICKSTART.md included in this package has example prompts for every use case.

---

## INLINED: QUICKSTART.md

# ATC/ATS Executive Summary Skill -- Quick Start

## What This Skill Does

Upload a contract or work order. Get a ready-to-submit executive summary Word document for the Lilly procurement approval workflow (ATC/ATS). The skill reads the document, writes the narrative sections, calculates the correct approval chains based on deal value and FRAP thresholds, and produces the DOCX in the exact format used by procurement.

---

## How to Use

| You say... | What to upload | What happens |
|-----------|---------------|-------------|
| "ATC summary for this contract" | The contract (PDF or DOCX) | Executive summary generated with ATC approval chain |
| "ATS executive summary" | Work order or SOW (PDF or DOCX) | Executive summary generated with ATS approval chain |
| "Build an approval summary" | Any procurement document | Skill determines ATC vs ATS based on document type |

---

## What You'll Be Asked

1. **Upload the document** -- the contract, work order, SOW, or amendment
2. **Your grade level** (e.g., P4/M2, P5/M3) -- determines where the ATC chain starts
3. **Business owner name and grade** -- determines the ATS chain
4. **A few metadata fields** the skill can't derive from the document (procurement contact, cost center, project name if not in the document)

The skill proposes the full approval chain and asks you to confirm the names before generating.

---

## What You Get

A Word document (.docx) in the Lilly-approved format:
- Calibri 11pt throughout
- Plain bold section headers (not colored banners)
- Light gray table headers
- Governance fields as inline bold-label text pairs at the bottom
- All narrative content derived from the uploaded document
- Correct FRAP approval chain based on deal value

---

## Tips

**Upload all related documents.** If the work order references a parent MSA, or the amendment references a base contract, upload those too. More context means more accurate narrative sections.

**The approval chain is calculated, not guessed.** The skill uses the current FRAP threshold schedule to determine which grade levels need to approve. You confirm the names -- it handles the math.

**Output format is locked.** The formatting matches what procurement uses for submissions. Don't ask for a different layout -- the format is intentional and approved.

**Start a new conversation after installation.** The skill won't appear in the same session where you installed it. Open a new chat and it's ready.

