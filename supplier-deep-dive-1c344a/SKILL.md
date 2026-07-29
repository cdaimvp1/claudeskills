---
name: supplier-deep-dive-1c344a
description: >
  Single-supplier deep-dive profile for procurement decisions. Takes one supplier name (plus any
  available Lilly context) and produces a defensible vendor brief: corporate identity, capability
  map, market position, financial signals, risk posture, prior Lilly relationship history, fit
  against the stated need, and a recommended next move. Standalone, and the per-supplier brief
  other skills draw on (supplier-landscape entries, rfp-response-analysis, evaluation-engine,
  category-strategy). Triggers on "profile this supplier", "deep dive on [vendor]",
  "vendor brief on", "supplier overview for", "tell me about [supplier]", "is [vendor] a fit for",
  "what do we know about [supplier]", "supplier one-pager", "vendor profile".
  BOUNDARY: this skill profiles ONE named supplier in depth. For a market-wide "who are the top
  suppliers for X" comparison across many vendors, use supplier-landscape instead.
metadata:
  suite: v10.6.6
---

> **Build discipline (G10):** This skill emits a large single-file artifact. Assemble it across multiple writes, never one create_file call: scaffold first (imports, component shell, export), then append one section per write to /mnt/user-data/outputs, and run a structural self-test before present_files. A single oversized write can truncate the file mid-stream. Full rule: lilly-brand-assets guardrail G10.


<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Internal footprint: in the prior-Lilly-relationship section, populate active-vendor status, spend history (total, by year, by commodity), payment terms, IKC risk flag, and supplier-performance score where available.
- SEC: in the financial-signals section, for a publicly traded supplier pull revenue, margin, liquidity, and risk-factor / going-concern text with the filing citation, replacing hedged placeholders.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Troubleshooting and usage guidance:** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports an error (dashboard not loading, React errors, share button missing, output too thin), read the user-manual section inlined inside the shared `lilly-brand-assets-1c344a` skill (its SKILL.md carries the manual content inline) and answer from it. If `lilly-brand-assets` is not installed, answer from this skill's own rules below.

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
- Read and follow the execution-guardrails content carried inside the shared `lilly-brand-assets-1c344a` skill (its SKILL.md inlines this content) before every run. It contains the full text of the mandatory tool-selection rules, gate checks, anti-collapse signals, cross-reference tracing requirements, and pre-delivery self-tests.
- When this skill produces an analytical document, deck, or dashboard, also read the narrative-standards content inlined in `lilly-brand-assets-1c344a` (output must read as connected analysis, not a key-value dump or bullet fragments), the validation-checklist content inlined there (re-verify numbers, sources, and cross-artifact consistency before delivering), and the house-styles content inlined there (use the correct one of the three named house styles; pull exact values from the brand-colors / dashboard-components / docx-design-system sections; never invent off-style palettes, fonts, or components).
- When this skill assesses a supplier's risk (financial, cyber, data, geopolitical, operational, or pharma gates like debarment/sanctions/GxP), also read the supplier-risk content inlined in `lilly-brand-assets-1c344a` and follow its hard anti-fabrication rules: never assert a debarment, sanctions, breach, or financial-distress status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the SME (the SME routing matrix is also inlined in that foundation skill).
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
- **Skill:** Supplier Deep-Dive
- **Version:** 1.2
- **Last Updated:** July 21, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)
- **Changelog:**
  - v1.2 (July 2026): Added a Lilly supplier-context strip (relationship, T12M spend, TPRM, Defender) to the Identity tab. Replaced the Lilly Fit tab's single value-at-risk string with a structured six-row renewal dossier. Added a new Relationship section to the Lilly Fit tab: a five-tile communication KPI strip, communication rollups (by channel/direction/topic/sentiment) with a paired narrative, a governance-flags panel (contact-gap / off-channel / open-commitment / unresolved-thread / adverse-sentiment) with a paired narrative, a reverse-chronological communication timeline with sentiment and off-channel/unresolved chips paired with a synthesis narrative, and a Spend-with-Lilly FY23-FY26 forecast panel (ARIA/SHARP) with a live client-side growth-rate slider and a narrative that recomputes with it. The five-tab skeleton is unchanged; every addition lives inside the existing Identity and Lilly Fit tabs per Hard Rule 6.
  - v1.1 (June 2026): Authored the locked dashboard-canonical spec and the example JSX the skill had previously locked but never shipped (inlined below). Defined the structured profile object schema for cross-skill handoffs. Reworded all foundation pointers to the inlined sections of lilly-brand-assets (no broken on-disk references). Batched the Mode / Identity-source / Source-document questions into one picker set per the suite batch-questions rule. Added the VENDOR_PARENT2 "fall back to Vendor Name when blank" convention. Added the create_file shareability instruction inline. Added the BOUNDARY guard vs supplier-landscape to the description. Confirmed suite color canon (Bold Blue positive, green-free status palette) and the 0.0-5.0 evaluation scale for any scored fit. Suite stamp added.
  - v1.0 (May 2026): Initial release. Single-supplier deep-dive profile complementing supplier-landscape (which produces a multi-supplier Top 10 shortlist). Five-section canonical structure (Identity / Capability / Market & Financials / Risk / Lilly Fit) + Recommendation. Category-neutral. Reuses supplier-risk and dashboard-components from lilly-brand-assets.

# Supplier Deep-Dive Profile

## Purpose

Take ONE supplier name plus any available context and produce a defensible vendor brief a procurement leader can put in front of stakeholders without further homework. This is the per-supplier companion to `supplier-landscape` (which compares many suppliers). Same evidence discipline, opposite scope: one supplier, deep.

**When to use this vs supplier-landscape:**
- **supplier-landscape:** "Who are the top 10 suppliers for X?" (market-wide, comparative)
- **supplier-deep-dive (this skill):** "Tell me everything about supplier Y." (single-supplier, exhaustive)

This skill is used at any point in the lifecycle: before an RFP (vetting a candidate), during evaluation (deepening one shortlisted vendor), at renewal (re-assessing an incumbent), or post-award (briefing leadership on a chosen partner).

## Inputs

### MUST
- Supplier name (legal entity or common name). One supplier per run.

### RECOMMENDED
- The Lilly need or use case (what we're considering them for)
- Category / commodity context (drives risk lens and capability map)
- Prior Lilly relationship signals (incumbent status, prior RFP outcomes, known issues)

### OPTIONAL
- Any uploaded documents (vendor decks, prior assessments, contracts, financials)
- RFP context if this profile feeds an active sourcing event
- Specific risk lenses to emphasize (cyber, GxP, financial, geopolitical)

If the supplier name is ambiguous (multiple companies share the name, or the user gives a brand that belongs to a parent), resolve identity FIRST and confirm before proceeding.

## Workflow

### Step 0: Opening picker set (batched, asked ONCE)

When invoked, ask the two upfront enumerable choices together as a single batched picker set, per the suite batch-questions rule (Operating Rule 2: 1 to 3 questions, asked once, never a long interview). Do NOT split mode and source election into separate turns. Identity disambiguation is a CONDITIONAL third question that you ADD to this same batch only when the supplier name is ambiguous (see below); when the name is unambiguous, ask only the two questions.

**IMPLEMENTATION REQUIREMENT.** Render this as ONE `ask_user_input_v0` call with the questions array below. Do NOT output the options as a prose bullet list, and do NOT emit one call per question. Defaults: depth = Standard; source = Search M365 (pre-selected). Exact call (add the third question only when the name is ambiguous):

```
ask_user_input_v0(questions=[
  {
    "question": "How deep should this profile go?",
    "type": "single_select",
    "options": [
      "Quick brief (one-pager, internal/external scan only, no dashboard)",
      "Standard profile (default: full canonical sections + dashboard)",
      "Risk-emphasis (Standard + extended risk section with named gating items)",
      "Renewal lens (Standard + Lilly relationship history weighted, value-at-risk view)"
    ]
  },
  {
    "question": "How should I source supporting documents (contracts, prior assessments, spend)?",
    "type": "single_select",
    "options": [
      "Search M365 for them (SharePoint / OneDrive / Outlook / Teams via the connector)",
      "I'll provide them (you upload or point to attachments)",
      "Both (you provide some AND I search M365)",
      "No additional inputs (proceed with what is already in context)"
    ]
  }
  /* THIRD QUESTION, ADD ONLY IF THE NAME IS AMBIGUOUS:
  {
    "question": "Which entity do you mean? (the name you gave matches more than one company)",
    "type": "single_select",
    "options": ["<Candidate A, HQ, ownership>", "<Candidate B, HQ, ownership>", "Other / none of these (let me clarify)"]
  } */
])
```

Map the depth selection to depth + emphasis. All four modes produce the SAME canonical section skeleton (per Operating Rule 8). They differ in (a) length per section, and (b) which section gets the deepest pass.

After the batched answer:
- **Source = "I'll provide them" or "Both":** STOP and WAIT for the documents before producing analysis (S1 / S5 blocking rule). Do not analyze on assumptions in the same turn.
- **Source = "Search M365" or "No additional inputs":** proceed immediately.
- The M365 connector can only see M365 (SharePoint, OneDrive, Outlook, Teams). It CANNOT see Ariba, LEAH, or other external systems; say so plainly if the user expects those. If M365 is not connected, proceed on provided/uploaded documents and label the gap (graceful degradation). If "Both" was chosen, do both and reconcile/de-duplicate, citing the source of every retrieved document (file name, location or URL, date).

### Step 1: Identity Resolution (gate check, G2)

Resolve WHO before any research. Produce an Identity Card as the first pass artifact:
- Legal entity name + common/brand names + DBAs
- Parent / ultimate owner (if subsidiary)
- HQ country + jurisdiction
- Ticker / ownership type (public / private / PE-backed / subsidiary)
- VENDOR_PARENT2 match if the user has provided Lilly's master data (label confidence)
- Known aliases that have caused vendor-master confusion

**Ambiguity handling (batched, not a separate turn).** Detect ambiguity from the user's first message, before you ask anything. If the name is ambiguous (e.g., "Atlas" could be Atlas Copco or Atlas Air or others) OR the user gave a brand that belongs to a parent, ADD the identity-disambiguation picker as the third question in the Step 0 batched call above, so the user answers depth, source, and identity in ONE turn. Only when ambiguity surfaces LATER (it was not detectable up front, e.g. mid-research two entities collide) do you ask a single follow-up picker on its own. Never run research against an unconfirmed identity: a profile of the wrong company is worse than no profile.

**VENDOR_PARENT2 convention (suite-locked).** When matching against Lilly vendor master data, `VENDOR_PARENT2` is the parent-company field. Per the suite-locked convention, **when `VENDOR_PARENT2` is blank, fall back to the Vendor Name** as the parent for display and matching, and label that fallback ("parent inferred from vendor name; master data not populated"). Never render a blank parent and never invent a parent that the master data does not assert.

### Step 2: Internal Research Pass (Priority #1)

Search what Lilly already knows. If M365 is available, search for:
- Existing contracts, SOWs, POs, MSAs (note dates and status)
- Spend history if a spend extract is provided or accessible
- Prior assessments, security reviews, GxP qualifications
- Prior RFP outcomes (winner / shortlisted / declined / blocked)
- Internal vendor decks, capability briefings, or scorecards
- Known issues, escalations, or relationship history

Cite every internal source: file title, location, date.

**Hard rule:** if the supplier is on a known blocked or restricted list at Lilly and the user has indicated this, surface it FIRST and ask whether to continue the profile or stop.

### GATE CHECK: Step 2 Complete (per Execution Guardrails G2)

Before proceeding to Step 3 (External Research Pass), confirm:
- [ ] M365 internal search completed (or documented as unavailable), covering existing contracts/SOWs/POs/MSAs, spend history, prior assessments, prior RFP outcomes, internal vendor decks, and known issues/escalations
- [ ] Every internal source found is cited (file title, location, date)
- [ ] Blocked/restricted-list status checked; if flagged, surfaced first and the continue/stop decision confirmed with the user

If any applicable box is unchecked, STOP. Complete before proceeding.

### Step 3: External Research Pass (Priority #2)

Per G7 (Research Minimums): minimum 8 distinct web searches across these dimensions, log them, and cite. If the web search tool is unavailable, do not fabricate: mark the affected dimensions RESEARCH PENDING, state that the external pass could not run, and proceed on internal + provided data only (graceful degradation). Cover:
- Corporate basics (HQ, leadership, headcount, ownership, founding year)
- Capability map relevant to the stated need
- Customer base + named reference customers (especially pharma / regulated if relevant)
- Market position (analyst placement: Gartner / Forrester / IDC quadrants if applicable)
- Recent news (last 18 months: M&A, leadership changes, product launches, layoffs, breaches, lawsuits)
- Financial signals: revenue, growth, profitability if public; funding history + investor list if private; debt or distress signals; analyst credit ratings if available
- Regulatory posture: certifications (ISO 27001, SOC 2, HITRUST, etc.), debarment/sanctions screen status (per the supplier-risk content inlined in lilly-brand-assets, never assert without source)
- Geographic and geopolitical exposure (manufacturing footprint, data residency, sanctions-adjacent jurisdictions)

Evidence discipline (G7): every claim cites name + date + confidence. Mark "Not Publicly Disclosed" rather than guess. NEVER fabricate certifications, customers, or financial figures.

### GATE CHECK: Step 3 Complete (per Execution Guardrails G2, G7)

Before proceeding to Step 4 (Lilly Fit Assessment), confirm:
- [ ] Minimum 8 distinct web searches completed across the required dimensions (corporate basics, capability map, customer base, market position, recent news, financial signals, regulatory posture, geographic/geopolitical exposure), or the affected dimensions labeled RESEARCH PENDING
- [ ] Research log kept (search, source, date) per G7
- [ ] Every claim carries a name + date + confidence citation; nothing fabricated where evidence is absent ("Not Publicly Disclosed" used instead of guessing)

If any applicable box is unchecked, STOP. Complete before proceeding.

### Step 4: Lilly Fit Assessment

Now synthesize internal + external into a Lilly-specific judgment:
- **Capability fit:** matches the stated need (High / Medium / Low + one-line evidence)
- **Relationship status:** Net new / Prior engagement (with outcome) / Active incumbent / Disengaged / Blocked
- **Pharma-fit gates:** GxP-relevant? Data privacy posture aligns with Lilly requirements? Any debarment / sanctions hits requiring SME confirmation?
- **Risk posture:** financial + cyber + operational + geopolitical, summarized to a 3-band signal (Low / Medium / High, rendered with the green-free status palette: Bold Blue for Low, Amber for Medium, Lilly Red for High) with named gating items. Do not use a green "good" band: the suite status palette is green-free (Operating Rule 8 and the foundation Canonical Status Palette).
- **Strategic fit:** does this supplier support or work against the category strategy (if one exists in Project knowledge)

### GATE CHECK: Step 4 Complete (per Execution Guardrails G2)

Before proceeding to Step 5 (Recommendation), confirm:
- [ ] Capability fit rated (High / Medium / Low) with one-line evidence
- [ ] Relationship status determined (Net new / Prior engagement / Active incumbent / Disengaged / Blocked)
- [ ] Pharma-fit gates checked (GxP relevance, data privacy posture, debarment/sanctions hits requiring SME confirmation)
- [ ] Risk posture summarized to the 3-band signal (Low / Medium / High, green-free palette) with named gating items
- [ ] Strategic fit assessed against the category strategy, if one exists in Project knowledge

If any applicable box is unchecked, STOP. Complete before proceeding.

### Step 5: Recommendation

Close with a clear next-move recommendation:
- **Proceed:** include in shortlist / advance to RFP / negotiate renewal / award
- **Proceed with conditions:** what to verify before commitment (cite the specific gating items)
- **Defer:** what additional input or screen is needed first
- **Decline:** the disqualifying finding, cited

The recommendation MUST be specific to the stated Lilly need. Not "a capable vendor" but "well-fit for the [X] requirement given [Y]; advance to RFP shortlist contingent on a formal cyber assessment."

## Deliverables

### Canonical structure (fixed skeleton per Operating Rule 8)

The profile DOCX and dashboard ALWAYS contain these five sections in this order:
1. **Identity** (legal entity, parent, HQ, ownership, aliases, VENDOR_PARENT2 match)
2. **Capability** (offerings mapped to the stated need, technology stack if relevant, delivery model, geographic coverage)
3. **Market & Financials** (market position, named customers, revenue/growth/ownership signals, recent news)
4. **Risk** (financial / cyber / operational / geopolitical / regulatory gates, named items, confidence labels)
5. **Lilly Fit** (capability fit, relationship status, pharma gates, strategic fit, value-at-risk if renewal lens)

Followed by **Recommendation** (a separate closing section, not part of the canonical five).

Each section renders on every run. When a section has thin input (e.g., a private foreign vendor with limited public data), it shows clearly labeled states ("Not Publicly Disclosed", "RESEARCH PENDING after 8 searches", "Requires formal screen") per Rule 5 and G7. Never drop a section.

### Files produced
- `supplier_profile_[vendor_slug].docx` - the canonical brief (Magazine Report house style, per the house-styles content inlined in lilly-brand-assets). Always produced. Native deliverable.
- `supplier_profile_[vendor_slug]_dashboard.jsx` - one-page dashboard of the same five sections + recommendation strip. Built to the locked spec in the "INLINED: dashboard-canonical (inlined below)" section of this file, cloning the example JSX there. Produced for Standard / Risk-emphasis / Renewal modes. Skipped in Quick brief.
- A short chat-side summary: the headline judgment, the top three findings, the recommendation, and the upgrade path ("provide X to sharpen Y").

**Dashboard build requirement (shareability).** Create the `.jsx` with the `create_file` tool directly to `/mnt/user-data/outputs/`. Never write it via `bash_tool` with cat/heredoc: files written that way do not register as shareable artifacts and the share button will be missing. Import React hooks explicitly (`import { useState } from "react";`), use named function components, one default export, and only valid camelCase CSS property names in inline styles. Follow the suite dashboard build rules in the dashboard-components content inlined in lilly-brand-assets. If the `create_file` tool is unavailable, deliver the same dashboard as a fenced `.jsx` code block in chat and tell the user to save it as a `.jsx` file (graceful degradation); never silently skip the deliverable.

**House style (declared).** Both deliverables use the suite **Magazine Report** house style (the default for analytical DOCX and dashboards). supplier-deep-dive is a Magazine Report skill alongside supplier-landscape, lilly-contract-review, rfp-response-analysis, evaluation-engine, category-strategy, and market-rate-benchmarking; the foundation's house-styles "Used by" list should include it.

## Cross-Skill Handoffs

This skill feeds:
- **supplier-landscape:** drop the profile into the landscape as an enriched single entry.
- **rfp-engine / rfp-response-analysis:** advance the supplier into an RFx with the profile pre-loaded.
- **evaluation-engine:** carry the profile's risk + capability data into scoring.
- **category-strategy:** add as a supplier-of-interest into the category dashboard.

**BOUNDARY vs evaluation-engine (scoring authority).** This skill's `lilly_fit.capability_score` and `recommendation.verdict` are this skill's own standalone-use output: when a user asks for a deep dive on its own, that score and verdict are the primary deliverable. When the profile feeds an active RFx evaluation, those same figures become descriptive signal only, not a competing score: evaluation-engine is the sole owner of the official score and the official award recommendation for an RFx (see evaluation-engine's own Scoring Authority statement). Do not present this skill's verdict as if it settles or overrides an in-flight evaluation-engine scoring run; feed the capability and risk data in, but the official number and the official recommendation are evaluation-engine's to make.

When the user invokes this skill from inside one of those flows, this skill returns the **structured profile object** (not just the DOCX) so the calling skill can ingest it. Emit it as a fenced JSON block titled "Supplier profile handoff object" at the end of the run (and, when a Project is present, persist it there per S2 so later conversations reuse it). The schema is locked below.

### Structured profile object (handoff schema, locked)

One JSON object per run, on the canonical 0.0-5.0 evaluation scale wherever a fit/score is expressed (suite scale; see scoring-scales in lilly-brand-assets). Use `null` for genuinely undisclosed values and a `confidence` of `"Low"` plus a `RESEARCH_PENDING` note rather than fabricating. Field shape:

```json
{
  "schema": "supplier-deep-dive/profile@1.1",
  "generated": "2026-06-02",
  "as_of": "2026-06-02",
  "staleness": { "refresh_after_days": 90, "reason": "financials and risk posture age; re-run before any award or renewal decision" },
  "mode": "Standard | Quick brief | Risk-emphasis | Renewal lens",
  "lilly_need": "free-text statement of what we are considering them for, or null",
  "identity": {
    "legal_name": "string",
    "common_names": ["string"],
    "dbas": ["string"],
    "parent": "string (VENDOR_PARENT2; falls back to legal_name when master data blank)",
    "parent_source": "master-data | inferred-from-vendor-name | external | null",
    "hq_country": "string",
    "jurisdiction": "string",
    "ownership_type": "public | private | PE-backed | subsidiary | unknown",
    "ticker": "string or null",
    "vendor_master_match": { "matched": true, "vendor_id": "string or null", "confidence": "High | Medium | Low" },
    "identity_confidence": "Confirmed | Best-guess",
    "aliases_causing_confusion": ["string"]
  },
  "capability": { "summary": "string", "offerings": ["string"], "delivery_model": "string or null", "geo_coverage": ["string"], "fit_to_need": { "rating": "High | Medium | Low", "evidence": "string" } },
  "market_financials": { "market_position": "string or null", "named_customers": ["string"], "revenue": "string or null", "growth": "string or null", "ownership_signals": "string or null", "recent_news": [ { "headline": "string", "date": "YYYY-MM", "source": "string" } ] },
  "risk": {
    "band": "Low | Medium | High",
    "dimensions": [ { "dimension": "financial | cyber | operational | geopolitical | regulatory", "level": "Low | Medium | High", "note": "string", "confidence": "High | Medium | Low", "source": "string or null" } ],
    "gating_items": [ { "type": "debarment | sanctions | GxP | privacy | other", "status": "REQUIRES_FORMAL_SCREEN", "route_to_sme": "string (SME function from the foundation SME matrix)" } ]
  },
  "lilly_fit": { "capability_fit": "High | Medium | Low", "capability_score": "number, 0.0-5.0, or null", "relationship_status": "Net new | Prior engagement | Active incumbent | Disengaged | Blocked", "pharma_gates": "string", "strategic_fit": "supports | neutral | works-against | unknown", "value_at_risk": "string or null" },
  "recommendation": { "verdict": "Proceed | Proceed with conditions | Defer | Decline", "rationale": "string tied to lilly_need", "conditions": ["string"], "cited_gating_items": ["string"] },
  "research_log": { "internal_sources": [ { "title": "string", "location": "string", "date": "YYYY-MM-DD" } ], "web_searches_run": 0, "web_sources": [ { "claim": "string", "source": "string", "date": "YYYY-MM", "confidence": "High | Medium | Low" } ] }
}
```

A consuming skill should treat any field with `confidence: "Low"` or a `RESEARCH_PENDING` note as provisional and re-verify before a decision. The `staleness` block tells downstream skills when to re-run the profile.

## Hard Rules (skill-specific; the shared guardrails also apply)

**Rule 1: One supplier per run.** If the user asks for multiple suppliers, route them to `supplier-landscape` instead, or produce ONE deep-dive and offer to run others sequentially.

**Rule 2: Never fabricate a fact.** Per G7 and the supplier-risk content inlined in lilly-brand-assets, every claim about certifications, customers, financials, breaches, sanctions, or debarments cites a source with name + date. "Not verified" is the right answer when the data isn't there. NEVER assert a debarment or sanctions hit without a cited source; gating items route to the SME for a formal screen.

**Rule 3: Resolve identity before researching.** A profile of the wrong company is worse than no profile. Confirm identity on any ambiguous name.

**Rule 4: Lilly fit is the point, not a generic profile.** If the user gave a use case, every section ties back to it. A profile that could be sold to any pharma is shallow; one that says "good fit for the regulated batch records use case because X, weak for our cell-therapy footprint because Y" is the goal.

**Rule 5: Confidence labels are mandatory.** High / Medium / Low on every conclusion. The reader must be able to tell observation from inference.

**Rule 6: Five-section skeleton is fixed.** Per Operating Rule 8, do not drop, rename, reorder, or merge the canonical sections. Thin sections show labeled states, never disappear.

**Rule 7: SME routing for gating and specialist items.** When a finding is a gating item (debarment, sanctions, GxP) or a specialist judgment (legal, cyber, privacy, finance, tax, insurance), do NOT adjudicate it here: flag it and route it to the named SME function using the SME Routing Matrix inlined inside `lilly-brand-assets-1c344a` (the suite single source of truth for who owns which issue class). The skill surfaces and drafts; the SME decides. If the foundation skill is unavailable, route using the default mapping (Legal/Contracting Counsel for legal terms; Cyber ISS for security; Privacy Office for data handling; Compliance/Trade Compliance for debarment/sanctions; Quality/GxP for regulated-process posture; Finance for credit/going-concern) and note that the shared matrix could not be read.

## Next Steps (closing template)

End every run with:
- Headline judgment in one line ("Proceed to shortlist with cyber-screen condition", etc.)
- Top open questions or upgrade items
- Which adjacent skill this should feed (supplier-landscape entry / RFP shortlist / etc.)

---

## INLINED: dashboard-canonical (inlined below)

# Supplier Deep-Dive Dashboard - Canonical Structure (LOCKED)

This spec is mandatory. Every dashboard this skill produces, in Standard / Risk-emphasis / Renewal modes and for EVERY category or commodity (IT, professional services, lab, clinical, chemicals, equipment, facilities, logistics, marketing, and any other), follows this exact structure. Only the data and the category-specific research change. Do not redesign the tabs, components, or styling per run or per mode. Quick brief mode skips the dashboard (one-pager only); the other three modes always build it with the same five tabs + recommendation strip. Two runs of the same input produce the same dashboard.

Shared component implementations live in the dashboard-components content inlined inside `lilly-brand-assets-1c344a` (Metric, Card, STable, Pillar, SevPill, StateBanner, Tip, and the color tokens). Copy them verbatim; do not hand-roll equivalents or rename them. The complete reference implementation is the example JSX at the end of this section: clone its structure and swap the data.

### The determinism guarantee

1. **Same skeleton, always.** The five canonical tabs below, in this order, on every run, in every applicable mode, for every category. Header, footer, tab nav, palette, typography, and components are identical run to run.
2. **Content varies, structure does not.** A tab is never removed because a mode or category "does not need it"; it is reframed or shown in a labeled state.
3. **Depth parity.** Every tab is filled to the same depth on every run, through internal + external research (see the workflow), never by omission.
4. **Every tab always renders.** No blank panels. Use the three labeled states.

### Three labeled states (use instead of dropping or blanking content)

- **NEEDS_INPUT** (Amber accent, cream banner): pending a specific user input. State what unblocks it.
- **NOT APPLICABLE** (Bold Grey accent, stone banner, one-line reason): genuinely does not apply to this supplier or category.
- **RESEARCH PENDING** (Bold Grey accent, stone banner): the research that would populate the area was run and returned nothing usable, or the data is genuinely undisclosed (for example, a private company's financials). State what was tried. Never fabricate a figure (Global Rule 3, anti-fabrication). If a search tool is unavailable, the affected area shows RESEARCH PENDING, not a fabricated fill.

### Hard formatting rules (Global Operating Rules 7 and 8)

- NO em dashes anywhere. Use hyphens, colons, parentheses, or separate clauses.
- NO literal backslash-u escape sequences and NO HTML entities in any position that renders as visible text. Use the literal character or plain ASCII. Risk and confidence states use colored text and colored cell backgrounds, not emoji.
- Single-file React artifact (`.jsx`), built with `create_file` for shareability (never `bash_tool`/cat). `useState` from react. One default export.
- Status is GREEN-FREE. Positive / good / low-risk is carried by Bold Blue (`#0F3A85`) and Neutral Sky (`#D4E5F7`), never by a green. Do not declare a `GRN` token.

### Color tokens (the shared suite palette; do not change)

These match the Canonical Status Palette and chart palette owned by `lilly-brand-assets`. No two status/severity-role tokens share a hex (CARD and BD, and MUT and LT, are intentional neutral-tone pairs that share a hex by design); none is a green.

```jsx
const R = "#E1251B",   // Lilly Red - negative / high-risk / critical
  DK = "#212121",      // Lilly Black - body text, header/footer bars
  BRN = "#521207",     // Bold Brown - metadata, secondary chart series
  BLU = "#0F3A85",     // Bold Blue - positive / low-risk / pass / section headers / links
  CARD = "#E4EBF1",    // Neutral Stone - label cells, NOT APPLICABLE / RESEARCH PENDING banners
  WARM = "#FFF0D8",    // Neutral Cream - warning / NEEDS_INPUT banner background
  RISK = "#FDE8E5",    // Neutral Rose - negative / high-risk cell background
  OK = "#D4E5F7",      // Neutral Sky - positive / low-risk cell + KPI background
  BD = "#E4EBF1",      // border
  MUT = "#8A969E",     // Bold Grey - muted secondary text, neutral chips, N/A
  LT = "#8A969E",      // Bold Grey - light label text
  AMB = "#B45309";     // Amber - warning / medium-risk text
```

Risk severity map (positive = Bold Blue, never green): `Low: BLU on OK`, `Medium: AMB on WARM`, `High: R on RISK`. Any scored fit uses the canonical 0.0-5.0 evaluation scale: 4.0+ = strong (BLU on OK), 3.0-3.9 = adequate (AMB on WARM), below 3.0 = gap (R on RISK).

### Layout shell (suite house style, locked)

- **Header bar:** dark charcoal (`#212121`) with a 4px red (`#E1251B`) left rule, uppercase red eyebrow "Eli Lilly and Company - Procurement", Georgia-serif white title "{Supplier} - Supplier Deep-Dive", muted meta line (month/year, mode, identity-confidence, as-of date). The Lilly WHITE monogram sits top-right of the header per the foundation dashboard-logo rule, with its graceful-degradation chain (white script wordmark, then text eyebrow, then silent omit).
- **Tab nav:** white bar, red active underline, charcoal-to-red on select; NEEDS_INPUT tabs carry an amber dot.
- **Body:** max-width 1180 container on `#FFFFFF`.
- **Footer:** dark charcoal bar, left fine print (confidence-scale note: High/Medium/Low and the 0.0-5.0 fit scale), right "Company Confidential | supplier-deep-dive | procurement guidance, not legal advice".

### Canonical tabs (all 5, every applicable mode, every category) + recommendation strip

The dashboard mirrors the DOCX five-section skeleton exactly (Identity / Capability / Market & Financials / Risk / Lilly Fit), plus a recommendation strip pinned above the tabs.

1. **Identity** - 4 KPI cards (ownership type, HQ country, founded/entity age, identity-confidence: Confirmed vs Best-guess), a second 4-tile **Lilly supplier-context strip** (relationship status, trailing-12-month spend sourced from ARIA/SHARP, TPRM posture, Defender fraud-signature signal), and an identity narrative card (legal name, parent with the VENDOR_PARENT2-or-vendor-name fallback labeled, DBAs, aliases that have caused vendor-master confusion, and the same Lilly-context figures woven into prose) plus a vendor-master match line. TPRM and Defender are system-of-record-only checks this skill cannot reach directly: they always render their labeled "Not verified" / "Data not available" state with a one-line reason, never a fabricated status.
2. **Capability** - a capability narrative card, an offerings-to-need fit table (offering, maps-to-need, fit rating on the 0.0-5.0 scale with ScoreCell coloring), and delivery-model + geographic-coverage KPIs.
3. **Market & Financials** - market-position narrative, named reference customers (pharma/regulated flagged), a financial-signals KPI row (revenue, growth, profitability or funding/investors for private), and a recent-news STable (headline, date, source). Undisclosed financials render RESEARCH PENDING, never invented.
4. **Risk** - per-dimension risk cards (financial / cyber / operational / geopolitical / regulatory), each with a SevPill (Low/Medium/High), a one-line note, a confidence label, and a source; plus a gating-items panel (debarment / sanctions / GxP) that always shows "REQUIRES FORMAL SCREEN, routed to {SME}" and never asserts a clean status.
5. **Lilly Fit** - capability-fit and strategic-fit cards tied to the stated need, a relationship-status pill (Net new / Prior engagement / Active incumbent / Disengaged / Blocked), a pharma-gates summary, and (Renewal lens) a structured **renewal dossier**: a six-row table (expiry and notice window, spend commitment vs floor, performance, compliance, market alternatives, price exposure) that replaces the old single value-at-risk string. The dossier's spend-commitment and price-exposure rows are what the handoff object's `lilly_fit.value_at_risk` string summarizes for downstream consumers. If no Lilly need was given, this tab shows NEEDS_INPUT with what to provide.

   Below the fit content, every Standard / Risk-emphasis / Renewal run also carries a **Relationship** section (a labeled sub-section within this tab, not a new tab, so the locked five-tab skeleton stays intact) that gives the relationship-status pill its evidence:
   - A five-tile **communication KPI strip**: interactions in the trailing window, days since last contact, average contact cadence vs. an expected-cadence benchmark, open commitments, and unresolved threads.
   - A **communication rollups** panel (mini-bar breakdowns by channel, direction, topic, and sentiment) paired left/right with a **relationship health** narrative card that reads the mix and calls out whether any single negative signal is a trend or an isolated event.
   - A **governance flags** panel (contact-gap, off-channel, open-commitment, unresolved-thread, adverse-sentiment - reusing the Risk tab's SevPill/severity pattern so it reads as the same component family) paired left/right with a **governance read** narrative that names the highest-severity flag and the recommended follow-up action.
   - A reverse-chronological **communication timeline**: each row carries date, channel, direction, the Lilly-side contact, a one-line summary, a sentiment chip with its confidence label, and off-channel / unresolved chips where applicable; paired (wide-left / narrow-right) with a **timeline synthesis** narrative that reads the arc of the relationship rather than restating the rows.
   - A **Spend with Lilly - FY forecast** panel: an FY23-FY25 actual-spend bar chart (ARIA/SHARP) plus a live FY26 projection bar driven by a client-side growth-rate slider (recomputes on every move, no server round-trip), paired left/right with a **spend forecast read** narrative restating the three-year total, share of category, year-over-year growth, a rate-vs-volume note, and a sentence that itself recomputes as the slider moves.

**Recommendation strip** (pinned, above the tabs, every run): the verdict (Proceed / Proceed with conditions / Defer / Decline) as a colored Pillar, a one-line rationale tied to the stated need, and the cited gating conditions. Colored by verdict using the green-free palette (Proceed BLU, Proceed-with-conditions AMB, Defer MUT, Decline R).

### Mode content mapping (content only, structure fixed)

- **Standard:** all five tabs and the strip, full depth from internal + external research, including the Identity context strip and the Lilly Fit tab's Relationship section.
- **Risk-emphasis:** same five tabs; the Risk tab carries the deepest pass and names every gating item; the Relationship section's governance-flags panel gets the same emphasis; structure unchanged.
- **Renewal lens:** same five tabs; the Lilly Fit tab adds the renewal dossier and weights relationship history (the Relationship section's communication timeline and spend forecast are the primary evidence for that weighting); structure unchanged.
- **Quick brief:** no dashboard (one-pager DOCX only). The other three modes always build the dashboard.

### Numbers-reconcile assertion (clone-safety)

When you clone the example data object, the illustrative numbers MUST foot: any KPI that is a count of cards/items equals the array length it summarizes, and any fit score shown in a cell uses the same 0.0-5.0 value carried in the data object. Do not let a cloner propagate an inconsistent headline count. The example below is internally consistent (5 risk dimensions counted as 5; fit scores match their cells; the Relationship section's 27 tracked interactions reconcile exactly across all four communication rollups; its 3 open commitments and 1 unresolved thread reconcile against the governance-flags panel and against the timeline rows that carry those flags; and the FY23-FY25 spend figures sum to the stated three-year total).

### Anti-patterns (explicitly prohibited)

1. No per-run redesign, no vanishing tabs, no thin-by-skipping (run the searches; show RESEARCH PENDING only for a genuine gap).
2. No fabricated facts, scores, financials, certifications, or sanctions/debarment statuses (Global Rule 3 and Hard Rule 2).
3. No key-value dump tabs. Each tab opens with narrative prose; tables carry the data.
4. No emoji, box-drawing, backslash-u escapes, or HTML entities as visible text.
5. No em dashes anywhere. No green in any status role.

### Reference implementation (example JSX, neutral illustrative data)

Clone this structure and swap the data. The data here is illustrative and internally consistent (it foots per the assertion above). Built with `create_file` to `/mnt/user-data/outputs/` for shareability.

```jsx
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

// Suite palette (matches lilly-brand-assets Canonical Status Palette; no two status-role tokens share a hex; CARD/BD and MUT/LT are intentional neutral-tone pairs; none is green)
const R = "#E1251B", DK = "#212121", BRN = "#521207", BLU = "#0F3A85",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7",
  BD = "#E4EBF1", MUT = "#8A969E", LT = "#8A969E", AMB = "#B45309";

// Severity (positive = Bold Blue, never green)
const SEV = { Low: BLU, Medium: AMB, High: R };
const SEVBG = { Low: OK, Medium: WARM, High: RISK };
// Fit score on the canonical 0.0-5.0 scale
function scC(v) { return v >= 4.0 ? BLU : v >= 3.0 ? AMB : R; }
function scBg(v) { return v >= 4.0 ? OK : v >= 3.0 ? WARM : RISK; }

// Currency and percentage helpers (verbatim from the shared dashboard-components reference)
function f$(v) {
  if (v == null) return "";
  const a = Math.abs(v);
  if (a >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (a >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}
function fF(v) { return "$" + v.toLocaleString("en-US"); }
function fP(v) { return v == null ? "" : v.toFixed(1) + "%"; }
function maxOf(arr) { return Math.max.apply(null, arr.map(function (x) { return x.v; })); }

// Illustrative data object (swap with real, sourced data; keep the shape)
const D = {
  supplier: "Northwind Components GmbH",
  meta: "June 2026 | Standard | Identity: Confirmed | as-of 2026-06-30",
  need: "single-source elastomer seals for a regulated fill-finish line",
  identity: {
    legalName: "Northwind Components GmbH", parent: "Northwind Industrial AG",
    parentSource: "master-data", hq: "Germany", ownership: "Subsidiary (public parent)",
    founded: "1971", dbas: ["Northwind Seals"], aliases: ["Northwind GmbH (vendor-master variant)"],
    masterMatch: "Matched to VENDOR_ID 100482 (High confidence)", confidence: "Confirmed"
  },
  context: {
    relationship: "Active incumbent (net new evaluation for the stated seal need)",
    t12mSpend: 2430000, t12mSpendNote: "ARIA active-vendor spend, trailing 12 months through 2026-06-30",
    tprmStatus: "Not verified", tprmNote: "requires a formal Aravo/WWTP third-party risk screen, not reachable from this profile",
    defenderStatus: "Data not available", defenderNote: "Defender fraud-signature findings are system-of-record only, not reachable from this profile"
  },
  capability: {
    narrative: "Mid-size elastomer and precision-seal manufacturer with a regulated-industry track record. Offerings map closely to the fill-finish seal need; cleanroom molding and validation support are the differentiators.",
    offerings: [
      { o: "Cleanroom elastomer molding", maps: "Core to the stated seal need", fit: 4.4 },
      { o: "Material validation / extractables support", maps: "Supports GxP qualification", fit: 4.1 },
      { o: "Custom tooling", maps: "Adjacent, lengthens lead time", fit: 3.2 }
    ],
    delivery: "Two EU plants, direct supply", geo: "EU primary, limited US distribution"
  },
  market: {
    narrative: "Niche specialist rather than a market leader; recognized in regulated-seal supply but not analyst-rated. No public revenue at the subsidiary level.",
    customers: ["Two top-20 pharma (named in press, regulated)", "Several medical-device OEMs"],
    revenue: null, growth: null, ownership: "Parent is public (Frankfurt-listed); subsidiary financials not broken out",
    news: [
      { h: "Parent reported flat FY revenue", date: "2026-03", src: "Parent annual report 2025" },
      { h: "New EU cleanroom line commissioned", date: "2025-11", src: "Company press release" }
    ]
  },
  risk: [
    { dim: "Financial", level: "Medium", note: "Subsidiary financials undisclosed; parent stable but flat", conf: "Medium", src: "Parent annual report 2025" },
    { dim: "Cyber", level: "Medium", note: "No public SOC 2 / ISO 27001 found; questionnaire needed", conf: "Low", src: "RESEARCH PENDING" },
    { dim: "Operational", level: "Low", note: "Two-plant footprint, single-source concentration is the watch item", conf: "Medium", src: "Company site" },
    { dim: "Geopolitical", level: "Low", note: "EU manufacturing, no sanctions-adjacent exposure found", conf: "Medium", src: "Web screen" },
    { dim: "Regulatory", level: "Medium", note: "GxP-relevant supply; ISO / quality certifications not yet verified, formal qualification pending", conf: "Low", src: "RESEARCH PENDING" }
  ],
  gating: [
    { type: "Debarment / sanctions", status: "REQUIRES FORMAL SCREEN", sme: "Compliance / Trade Compliance" },
    { type: "GxP qualification", status: "REQUIRES FORMAL SCREEN", sme: "Quality / GxP" }
  ],
  fit: {
    capability: "High", capabilityScore: 4.2, relationship: "Net new", pharma: "GxP touchpoint confirmed; quality agreement and formal screens required before award",
    strategic: "supports",
    renewal: {
      expiry: "Contract term ends 2027-03-31. The 90-day notice-to-terminate window opens 2026-12-31.",
      spendCommitment: "FY25 actual spend $2.43M against a $2.10M annual minimum commitment (116% of floor; no shortfall exposure).",
      performance: "On-time delivery 96.4% trailing 12 months; the 3 open commitments and 1 unresolved thread in the Relationship section below are the main watch items.",
      compliance: "GxP qualification current. The Cyber ISS questionnaire and the Compliance debarment/sanctions screen (Risk tab) remain outstanding gating items.",
      marketAlternatives: "3 credible EU alternates identified in the external scan; requalification lead time is approximately 9 months, which favors starting any re-bid by Q1 2027 at the latest.",
      priceExposure: "Elastomer input costs are up roughly 4% year-over-year industry-wide; the current MSA carries no price-protection clause, so renewal negotiation should address a cap or index."
    }
  },
  comms: {
    window: "trailing 90 days, 2026-04-02 to 2026-06-30",
    interactions: 27, lastContactDays: 2, cadenceDays: 6, cadenceBenchmark: 14,
    openCommitments: 3, unresolvedThreads: 1,
    narrative: "Engagement has run well ahead of the expected cadence for a subsidiary of this size (a 6-day average gap against a 14-day benchmark), and the channel mix stays mostly on the named Lilly distribution. The two items to watch are concentrated, not spread: a cluster of three open commitments (an overdue quality-agreement addendum, an in-flight ISO recertification, and a pricing update) and one thread that has gone unanswered longer than the service norm.",
    byChannel: [{ k: "Email", v: 13 }, { k: "Teams / chat", v: 7 }, { k: "Calls", v: 4 }, { k: "Meetings", v: 3 }],
    byDirection: [{ k: "Inbound (supplier-initiated)", v: 17 }, { k: "Outbound (Lilly-initiated)", v: 10 }],
    byTopic: [{ k: "Qualification / onboarding", v: 9 }, { k: "Delivery & quality", v: 7 }, { k: "Commercial / pricing", v: 5 }, { k: "Escalation", v: 4 }, { k: "Other", v: 2 }],
    bySentiment: [{ k: "Positive", v: 15 }, { k: "Neutral", v: 10 }, { k: "Negative", v: 2 }]
  },
  governance: [
    { flag: "Contact-gap", level: "Low", note: "Average interaction gap is 6 days against a 14-day expected cadence for this relationship tier; no gap concern.", conf: "High" },
    { flag: "Off-channel", level: "Medium", note: "1 of 27 interactions in the window used a personal email address outside the named Lilly distribution (2026-06-09 call); redirected to the official channel on contact.", conf: "Medium" },
    { flag: "Open commitment", level: "High", note: "3 open commitments outstanding, including a signed quality-agreement addendum that was due 2026-06-01 and a revised ISO 27001 certificate now expected 2026-07-15.", conf: "High" },
    { flag: "Unresolved thread", level: "Medium", note: "1 thread (tooling lead-time, opened 2026-06-14) has gone unanswered longer than the 14-day service norm.", conf: "High" },
    { flag: "Adverse sentiment", level: "Low", note: "1 of 27 interactions carried negative sentiment (the ISO delay notice); isolated, not a pattern.", conf: "Medium" }
  ],
  timeline: [
    { date: "2026-06-28", channel: "Email", direction: "Inbound", topic: "Qualification / onboarding", facing: "Sourcing Lead", summary: "Supplier flagged the ISO 27001 recertification is delayed at the certifying body; revised target 2026-07-15.", sentiment: "Negative", sentConf: "Medium", commitment: "Revised ISO 27001 certificate by 2026-07-15", commitmentOpen: true, threadUnresolved: false, offChannel: false },
    { date: "2026-06-21", channel: "Teams", direction: "Outbound", topic: "Commercial / pricing", facing: "Category Manager", summary: "Lilly requested updated per-unit pricing ahead of the FY27 volume forecast.", sentiment: "Neutral", sentConf: "High", commitment: "Updated per-unit pricing by 2026-07-05", commitmentOpen: true, threadUnresolved: false, offChannel: false },
    { date: "2026-06-14", channel: "Email", direction: "Inbound", topic: "Delivery & quality", facing: "Sourcing Lead", summary: "Supplier raised a question on tooling lead-time for the custom-tooling option; Lilly has not yet replied.", sentiment: "Neutral", sentConf: "Medium", commitment: null, commitmentOpen: false, threadUnresolved: true, offChannel: false },
    { date: "2026-06-09", channel: "Call", direction: "Inbound", topic: "Escalation", facing: "Category Manager", summary: "A plant-level contact emailed the category manager's personal address instead of the named Lilly distribution; redirected to the official channel on the call.", sentiment: "Neutral", sentConf: "Medium", commitment: null, commitmentOpen: false, threadUnresolved: false, offChannel: true },
    { date: "2026-06-02", channel: "Meeting", direction: "Outbound", topic: "Qualification / onboarding", facing: "Quality/GxP", summary: "Cleanroom line walkthrough with Quality; no material findings.", sentiment: "Positive", sentConf: "High", commitment: null, commitmentOpen: false, threadUnresolved: false, offChannel: false },
    { date: "2026-05-26", channel: "Email", direction: "Inbound", topic: "Delivery & quality", facing: "Sourcing Lead", summary: "Confirmed two-plant capacity and lead time for the seal line.", sentiment: "Positive", sentConf: "High", commitment: "Capacity confirmation (received)", commitmentOpen: false, threadUnresolved: false, offChannel: false },
    { date: "2026-05-19", channel: "Teams", direction: "Outbound", topic: "Qualification / onboarding", facing: "Sourcing Lead", summary: "Shared the Lilly supplier-onboarding packet and vendor-master intake form.", sentiment: "Neutral", sentConf: "High", commitment: "Vendor-master intake form (received 2026-06-01)", commitmentOpen: false, threadUnresolved: false, offChannel: false },
    { date: "2026-05-04", channel: "Email", direction: "Inbound", topic: "Delivery & quality", facing: "Quality/GxP", summary: "Supplier committed to a signed quality-agreement addendum ahead of the cleanroom walkthrough.", sentiment: "Neutral", sentConf: "Medium", commitment: "Signed quality agreement addendum by 2026-06-01", commitmentOpen: true, threadUnresolved: false, offChannel: false }
  ],
  spend: {
    fy23: 1860000, fy24: 2110000, fy25: 2430000, threeYrTotal: 6400000,
    yoy: 15.2, shareOfCategory: 11.4, baseGrowth: 6,
    rateVsVolumeNote: "FY25 growth was driven roughly two-thirds by unit-rate increases (input-cost pass-through) and one-third by incremental volume from the new cleanroom line; treat rate increases as the primary lever to watch at renewal."
  },
  rec: { verdict: "Proceed with conditions", rationale: "Strong capability fit for the regulated seal need; advance to shortlist contingent on a Cyber ISS questionnaire and a Quality/GxP qualification.", conditions: ["Cyber ISS security questionnaire", "Quality/GxP qualification", "Compliance debarment/sanctions screen"] }
};

const VERDICT_C = { "Proceed": BLU, "Proceed with conditions": AMB, "Defer": MUT, "Decline": R };
const VERDICT_BG = { "Proceed": OK, "Proceed with conditions": WARM, "Defer": CARD, "Decline": RISK };

function Card({ title, note, children }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 18, border: "1px solid " + BD, marginBottom: 14 }}>
    {title && <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: DK, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 14, background: R, borderRadius: 2 }} />{title}
      {note && <span style={{ fontSize: 10, fontWeight: 600, color: MUT, marginLeft: "auto" }}>{note}</span>}</div>}
    {children}
  </div>;
}
function Metric({ label, value, sub, good, warn }) {
  const bar = warn ? R : good ? BLU : BD;
  return <div style={{ background: warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: warn ? R : good ? BLU : DK, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{sub}</div>}
  </div>;
}
function SevPill({ s }) {
  return <span style={{ color: SEV[s], background: SEVBG[s], border: "1px solid " + SEV[s] + "55", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}
function StateBanner({ kind, msg }) {
  const map = { NEEDS_INPUT: [AMB, WARM, "Needs input"], NOT_APPLICABLE: [MUT, CARD, "Not applicable"], RESEARCH_PENDING: [MUT, CARD, "Research pending"] };
  const c = map[kind] || map.NOT_APPLICABLE;
  return <div style={{ background: c[1], border: "1px solid " + c[0] + "55", borderLeft: "4px solid " + c[0], borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: c[0], textTransform: "uppercase" }}>{c[2]}</span>
    <div style={{ fontSize: 12, color: DK, marginTop: 4, lineHeight: 1.5 }}>{msg}</div>
  </div>;
}
function SectionHeading({ label, sub }) {
  return <div style={{ margin: "22px 0 12px", paddingTop: 16, borderTop: "1px solid " + BD }}>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700, color: DK, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 15, background: BLU, borderRadius: 2 }} />{label}
    </div>
    {sub && <div style={{ fontSize: 11, color: MUT, marginTop: 4, marginLeft: 11 }}>{sub}</div>}
  </div>;
}
function MiniBarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return <div style={{ marginBottom: 9 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: DK, marginBottom: 3 }}>
      <span>{label}</span><span style={{ fontWeight: 700, color: MUT }}>{value}</span>
    </div>
    <div style={{ background: CARD, borderRadius: 4, height: 7, overflow: "hidden" }}>
      <div style={{ width: pct + "%", background: color, height: "100%", borderRadius: 4 }} />
    </div>
  </div>;
}
function GovFlagRow({ g, last }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: last ? "none" : "1px solid " + BD, flexWrap: "wrap" }}>
    <div style={{ minWidth: 150 }}><span style={{ fontSize: 12, fontWeight: 700, color: DK }}>{g.flag}</span></div>
    <div style={{ flex: 1, minWidth: 220, fontSize: 12, color: DK }}>{g.note}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <SevPill s={g.level} /><span style={{ fontSize: 10, color: MUT }}>Conf: {g.conf}</span>
    </div>
  </div>;
}
function CommRow({ r, last }) {
  const sentC = { Positive: BLU, Neutral: MUT, Negative: R }[r.sentiment];
  const sentBg = { Positive: OK, Neutral: CARD, Negative: RISK }[r.sentiment];
  return <div style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: last ? "none" : "1px solid " + BD }}>
    <div style={{ width: 78, flexShrink: 0, fontSize: 11, color: MUT, fontWeight: 700 }}>{r.date}</div>
    <div style={{ width: 96, flexShrink: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.channel}</div>
      <div style={{ fontSize: 10, color: MUT, marginTop: 1 }}>{r.direction}</div>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{r.topic}{r.facing ? " - " + r.facing : ""}</div>
      <div style={{ fontSize: 12, color: DK, marginTop: 2, lineHeight: 1.5 }}>{r.summary}</div>
      {r.commitment && <div style={{ fontSize: 11, color: BRN, marginTop: 4 }}>Commitment: {r.commitment}{r.commitmentOpen ? " (open)" : ""}</div>}
      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: sentC, background: sentBg, padding: "2px 7px", borderRadius: 20 }}>{r.sentiment} ({r.sentConf})</span>
        {r.offChannel && <span style={{ fontSize: 10, fontWeight: 700, color: AMB, background: WARM, padding: "2px 7px", borderRadius: 20 }}>Off-channel</span>}
        {r.threadUnresolved && <span style={{ fontSize: 10, fontWeight: 700, color: R, background: RISK, padding: "2px 7px", borderRadius: 20 }}>Unresolved</span>}
      </div>
    </div>
  </div>;
}
function Tip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div style={{ background: DK, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 12 }}>
    {label && <div style={{ fontWeight: 600, color: LT }}>{label}</div>}
    {payload.map(function (p, i) { return <div key={i}><strong>{f$(p.value)}</strong></div>; })}
  </div>;
}

const TABS = ["Identity", "Capability", "Market & Financials", "Risk", "Lilly Fit"];

export default function App() {
  const [tab, setTab] = useState(TABS[0]);
  const [growth, setGrowth] = useState(D.spend.baseGrowth);
  const v = D.rec.verdict;
  const fy26Projected = D.spend.fy25 * (1 + growth / 100);
  const spendChartData = [
    { fy: "FY23", v: D.spend.fy23, kind: "actual" },
    { fy: "FY24", v: D.spend.fy24, kind: "actual" },
    { fy: "FY25", v: D.spend.fy25, kind: "actual" },
    { fy: "FY26 (proj.)", v: fy26Projected, kind: "projected" }
  ];
  const projDelta = (fy26Projected - D.spend.fy25) / D.spend.fy25 * 100;
  const maxChannel = maxOf(D.comms.byChannel);
  const maxDirection = maxOf(D.comms.byDirection);
  const maxTopic = maxOf(D.comms.byTopic);
  const maxSentiment = maxOf(D.comms.bySentiment);
  return <div style={{ fontFamily: "Arial,Helvetica,sans-serif", background: "#f4f5f7", minHeight: "100vh", color: DK }}>
    {/* Header */}
    <div style={{ background: DK, padding: "12px 24px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Eli Lilly and Company - Procurement</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{D.supplier} - Supplier Deep-Dive</div>
          </div>
        </div>
        {/* Logo slot per foundation rule; text fallback shown here */}
        <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{D.meta}<div style={{ color: "#fff", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em" }}>ELI LILLY AND COMPANY</div></div>
      </div>
    </div>
    {/* Recommendation strip (pinned) */}
    <div style={{ padding: "12px 24px 0", maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ background: VERDICT_BG[v], borderRadius: 8, padding: "12px 16px", borderLeft: "4px solid " + VERDICT_C[v], display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: VERDICT_C[v] }}>{v}</span>
        <span style={{ fontSize: 12, color: DK, flex: 1, minWidth: 240 }}>{D.rec.rationale}</span>
        <span style={{ fontSize: 11, color: MUT }}>Conditions: {D.rec.conditions.join("; ")}</span>
      </div>
    </div>
    {/* Tab nav */}
    <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto", maxWidth: 1180, margin: "12px auto 0" }}>
      {TABS.map(function (t) {
        const active = t === tab;
        return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}</button>;
      })}
    </div>
    {/* Body */}
    <div style={{ padding: "18px 24px 40px", maxWidth: 1180, margin: "0 auto" }}>
      {tab === "Identity" && <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 12 }}>
          <Metric label="Ownership" value={D.identity.ownership} />
          <Metric label="HQ" value={D.identity.hq} />
          <Metric label="Founded" value={D.identity.founded} />
          <Metric label="Identity confidence" value={D.identity.confidence} good={D.identity.confidence === "Confirmed"} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
          <Metric label="Lilly relationship" value={D.context.relationship} />
          <Metric label="T12M spend" value={f$(D.context.t12mSpend)} sub="ARIA/SHARP" />
          <Metric label="TPRM posture" value={D.context.tprmStatus} sub="Requires formal screen" />
          <Metric label="Defender signal" value={D.context.defenderStatus} sub="System-of-record only" />
        </div>
        <Card title="Corporate identity" note="Resolve WHO before research (G2)">
          <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            <strong>{D.identity.legalName}</strong> is a {D.identity.ownership.toLowerCase()}. Parent: <strong>{D.identity.parent}</strong> (source: {D.identity.parentSource}; when VENDOR_PARENT2 is blank the parent falls back to the vendor name, labeled as inferred). DBAs: {D.identity.dbas.join(", ")}. Aliases that have caused vendor-master confusion: {D.identity.aliases.join(", ")}. Vendor-master match: {D.identity.masterMatch}. Lilly relationship context: {D.context.relationship}, with trailing-12-month spend of {f$(D.context.t12mSpend)} ({D.context.t12mSpendNote}). TPRM posture is {D.context.tprmStatus.toLowerCase()} ({D.context.tprmNote}); the Defender fraud-signature check reads {D.context.defenderStatus.toLowerCase()} ({D.context.defenderNote}). Neither is fabricated: both render their labeled not-available state until the system of record is reachable.
          </p>
        </Card>
      </div>}

      {tab === "Capability" && <div>
        <Card title="Capability map (tied to the stated need)">
          <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>{D.capability.narrative}</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["Offering", "Maps to the need", "Fit (0.0-5.0)"].map(function (h, i) { return <th key={i} style={{ textAlign: i === 2 ? "right" : "left", padding: "7px 8px", color: MUT, fontSize: 11, borderBottom: "2px solid " + BD }}>{h}</th>; })}</tr></thead>
            <tbody>{D.capability.offerings.map(function (o, i) {
              return <tr key={i} style={{ background: i % 2 ? CARD : "#fff" }}>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD }}>{o.o}</td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD }}>{o.maps}</td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD, textAlign: "right" }}>
                  <span style={{ color: scC(o.fit), background: scBg(o.fit), fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{o.fit.toFixed(1)}</span>
                </td></tr>;
            })}</tbody>
          </table>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Metric label="Delivery model" value={D.capability.delivery} />
          <Metric label="Geographic coverage" value={D.capability.geo} />
        </div>
      </div>}

      {tab === "Market & Financials" && <div>
        <Card title="Market position">
          <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>{D.market.narrative}</p>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
          <Metric label="Revenue" value={D.market.revenue || "Not disclosed"} sub={D.market.revenue ? "" : "Subsidiary not broken out"} />
          <Metric label="Growth" value={D.market.growth || "Not disclosed"} />
          <Metric label="Ownership signal" value="Public parent" sub="Frankfurt-listed parent" />
        </div>
        {!D.market.revenue && <StateBanner kind="RESEARCH_PENDING" msg="Subsidiary-level financials are not publicly disclosed. Parent-level signals are summarized above. Request audited financials from the supplier to upgrade Finance's credit view." />}
        <Card title="Named reference customers">
          <ul style={{ fontSize: 12, lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>{D.market.customers.map(function (c, i) { return <li key={i}>{c}</li>; })}</ul>
        </Card>
        <Card title="Recent news (last 18 months)">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["Headline", "Date", "Source"].map(function (h, i) { return <th key={i} style={{ textAlign: "left", padding: "7px 8px", color: MUT, fontSize: 11, borderBottom: "2px solid " + BD }}>{h}</th>; })}</tr></thead>
            <tbody>{D.market.news.map(function (n, i) {
              return <tr key={i} style={{ background: i % 2 ? CARD : "#fff" }}>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD }}>{n.h}</td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD }}>{n.date}</td>
                <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD, color: MUT }}>{n.src}</td></tr>;
            })}</tbody>
          </table>
        </Card>
      </div>}

      {tab === "Risk" && <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 14 }}>
          {D.risk.map(function (rk, i) {
            return <div key={i} style={{ background: "#fff", borderRadius: 8, padding: 16, border: "1px solid " + BD, borderTop: "3px solid " + SEV[rk.level] }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 13 }}>{rk.dim}</strong><SevPill s={rk.level} />
              </div>
              <div style={{ fontSize: 12, color: DK, marginTop: 8, lineHeight: 1.5 }}>{rk.note}</div>
              <div style={{ fontSize: 11, color: MUT, marginTop: 6 }}>Confidence: {rk.conf} | Source: {rk.src}</div>
            </div>;
          })}
        </div>
        <Card title="Gating items (route to SME, never adjudicated here)">
          {D.gating.map(function (g, i) {
            return <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < D.gating.length - 1 ? "1px solid " + BD : "none" }}>
              <span style={{ fontSize: 12 }}>{g.type}</span>
              <span><span style={{ color: R, fontWeight: 700, fontSize: 11 }}>{g.status}</span> <span style={{ fontSize: 11, color: MUT }}>routed to {g.sme}</span></span>
            </div>;
          })}
        </Card>
      </div>}

      {tab === "Lilly Fit" && <div>
        {!D.need ? <StateBanner kind="NEEDS_INPUT" msg="No Lilly need or use case was provided. Add the use case to make every fit judgment specific to the decision." /> : <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
            <Metric label="Capability fit" value={D.fit.capability + " (" + D.fit.capabilityScore.toFixed(1) + ")"} good={D.fit.capabilityScore >= 4.0} warn={D.fit.capabilityScore < 3.0} />
            <Metric label="Relationship" value={D.fit.relationship} />
            <Metric label="Strategic fit" value={D.fit.strategic} good={D.fit.strategic === "supports"} />
          </div>
          <Card title={"Fit for: " + D.need}>
            <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>Pharma gates: {D.fit.pharma}</p>
          </Card>

          {D.fit.renewal && <Card title="Renewal dossier" note="Renewal lens">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <tbody>
                {[
                  ["Expiry & notice window", D.fit.renewal.expiry],
                  ["Spend commitment", D.fit.renewal.spendCommitment],
                  ["Performance", D.fit.renewal.performance],
                  ["Compliance", D.fit.renewal.compliance],
                  ["Market alternatives", D.fit.renewal.marketAlternatives],
                  ["Price exposure", D.fit.renewal.priceExposure]
                ].map(function (row, i) {
                  return <tr key={i} style={{ background: i % 2 ? CARD : "#fff" }}>
                    <td style={{ padding: "8px 10px", borderBottom: "1px solid " + BD, fontWeight: 700, color: DK, width: 190, verticalAlign: "top" }}>{row[0]}</td>
                    <td style={{ padding: "8px 10px", borderBottom: "1px solid " + BD, color: DK, lineHeight: 1.5 }}>{row[1]}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </Card>}

          <SectionHeading label="Relationship" sub={"Evidence behind the relationship-status pill above - " + D.comms.window} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 14 }}>
            <Metric label="Interactions" value={D.comms.interactions} sub="Outlook / Teams, 90d" />
            <Metric label="Last contact" value={D.comms.lastContactDays + "d ago"} good={D.comms.lastContactDays <= 7} />
            <Metric label="Cadence" value={D.comms.cadenceDays + "d avg gap"} sub={"Benchmark " + D.comms.cadenceBenchmark + "d"} good={D.comms.cadenceDays <= D.comms.cadenceBenchmark} />
            <Metric label="Open commitments" value={D.comms.openCommitments} warn={D.comms.openCommitments > 0} />
            <Metric label="Unresolved threads" value={D.comms.unresolvedThreads} warn={D.comms.unresolvedThreads > 0} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card title="Communication rollups" note={D.comms.window}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>By channel</div>
                  {D.comms.byChannel.map(function (r, i) { return <MiniBarRow key={i} label={r.k} value={r.v} max={maxChannel} color={BRN} />; })}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>By direction</div>
                  {D.comms.byDirection.map(function (r, i) { return <MiniBarRow key={i} label={r.k} value={r.v} max={maxDirection} color={BLU} />; })}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>By topic</div>
                  {D.comms.byTopic.map(function (r, i) { return <MiniBarRow key={i} label={r.k} value={r.v} max={maxTopic} color={AMB} />; })}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>By sentiment</div>
                  {D.comms.bySentiment.map(function (r, i) { return <MiniBarRow key={i} label={r.k} value={r.v} max={maxSentiment} color={r.k === "Positive" ? BLU : r.k === "Negative" ? R : MUT} />; })}
                </div>
              </div>
            </Card>
            <Card title="Relationship health read">
              <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>{D.comms.narrative}</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>Channel mix stays mostly on Email and Teams with the named Lilly contacts; the one off-channel event below was self-corrected on contact. Sentiment is 15 positive against 2 negative out of 27, so the single negative reading (the ISO delay) is not read as a trend.</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card title="Governance flags" note="Reuses the Risk tab's severity-pill pattern">
              {D.governance.map(function (g, i) { return <GovFlagRow key={i} g={g} last={i === D.governance.length - 1} />; })}
            </Card>
            <Card title="Governance read">
              <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>One high-severity flag drives this section: 3 open commitments, most notably a quality-agreement addendum that is now 4 weeks past its 2026-06-01 due date. Paired with the unresolved tooling-lead-time thread, this is a follow-up problem more than a relationship-health problem; the cadence and sentiment readings above stay strong.</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>Recommended action: have the Category Manager request written confirmation on the addendum and the ISO recertification date in the same message, and close the tooling-lead-time thread before it crosses 30 days open.</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <Card title="Communication timeline" note={D.timeline.length + " most recent of " + D.comms.interactions + " in the last 90 days"}>
              {D.timeline.map(function (r, i) { return <CommRow key={i} r={r} last={i === D.timeline.length - 1} />; })}
            </Card>
            <Card title="Timeline synthesis">
              <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>The arc across the last 90 days is qualification-and-onboarding work settling into steady commercial and delivery contact, interrupted once by an off-channel routing slip that self-corrected. The most recent entry (2026-06-28) is the ISO delay notice that anchors both the highest-severity governance flag and the one negative-sentiment reading.</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>Net read: healthy, well-cadenced relationship with three follow-up items to close before the recommendation's conditions can be marked satisfied.</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card title="Spend with Lilly - FY forecast" note="ARIA / SHARP">
              <div style={{ width: "100%", height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendChartData} margin={{ top: 18, right: 6, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={BD} vertical={false} />
                    <XAxis dataKey="fy" tick={{ fontSize: 11, fill: MUT }} axisLine={{ stroke: BD }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: MUT }} axisLine={false} tickLine={false} tickFormatter={f$} width={50} />
                    <Tooltip content={<Tip />} cursor={{ fill: CARD }} />
                    <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="v" position="top" formatter={f$} style={{ fontSize: 11, fill: DK, fontWeight: 700 }} />
                      {spendChartData.map(function (d, i) { return <Cell key={i} fill={d.kind === "projected" ? BLU : BRN} fillOpacity={d.kind === "projected" ? 0.82 : 1} />; })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginBottom: 4 }}>
                  <span>FY26 growth assumption</span><span style={{ fontWeight: 700, color: DK }}>{growth >= 0 ? "+" : ""}{growth}%</span>
                </div>
                <input type="range" min={-10} max={25} step={1} value={growth} onChange={function (e) { setGrowth(Number(e.target.value)); }} style={{ width: "100%" }} />
              </div>
            </Card>
            <Card title="Spend forecast read">
              <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 0 }}>Three-year spend with {D.supplier.split(" ")[0]} totals {fF(D.spend.threeYrTotal)}, growing from {fF(D.spend.fy23)} in FY23 to {fF(D.spend.fy25)} in FY25 ({fP(D.spend.yoy)} year-over-year), and representing {fP(D.spend.shareOfCategory)} of the elastomer-seals category. {D.spend.rateVsVolumeNote}</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>At a {growth >= 0 ? "+" : ""}{growth}% growth assumption, FY26 projected spend is <strong style={{ color: BLU }}>{f$(fy26Projected)}</strong>, {projDelta >= 0 ? "up" : "down"} {fP(Math.abs(projDelta))} from FY25. Move the slider to stress-test the renewal-year spend against the $2.10M FY25 minimum-commitment floor.</p>
            </Card>
          </div>
        </div>}
      </div>}
    </div>
    {/* Footer */}
    <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT, flexWrap: "wrap", gap: 8 }}>
      <div>Confidence: High / Medium / Low. Fit on the 0.0-5.0 scale. Positive carried by Bold Blue, never green.</div>
      <div>Company Confidential | supplier-deep-dive | procurement guidance, not legal advice</div>
    </div>
  </div>;
}
```

## Enhancement: identity-confidence gate (v1.1)

Before spending any external-research budget, set an explicit identity-confidence flag: `Confirmed` (the entity is unambiguously resolved, by a vendor-master match, a confirmed picker selection, or a single unambiguous public match) or `Best-guess` (more than one entity could match and the user has not yet confirmed). When the flag is `Best-guess`, do the cheapest disambiguating pass first (1-2 searches to enumerate candidates) and confirm via the batched identity picker before the full 8-search external pass, so research budget is never spent profiling the wrong company. Carry the flag into the handoff object (`identity.identity_confidence`) and show it as a KPI on the Identity tab. This is a low-cost guard that directly serves Hard Rule 3.
