---
name: decision-deck-1c344a
description: >
  Executive Business Case and Decision Deck Builder for any procurement decision needing leadership
  buy-in. Story-first: reads any combination of inputs (an evaluation report, a contract review
  dashboard, a category strategy, spend or financial data, a pro-forma, prior decks, or just a
  described situation), drafts a text storyboard, iterates with the user, then builds the PPTX
  (and optional one-page brief). Works standalone or downstream of any suite skill. Triggers on
  "create executive deck", "build a deck", "build a presentation", "build a business case",
  "prepare a decision brief", "leadership presentation", "approval deck", "deal summary deck",
  "category strategy deck", "present this to the CFO / CPO / leadership", "build a deck from this
  dashboard", "turn this into a presentation". Transforms inputs into concise, decision-oriented
  slides that state the ask, quantify impact, and call out conditions and risks.
metadata:
  suite: v10.6.6
---

<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Internal footprint: use live spend figures for the impact and baseline slides, labeled and scoped.
- SEC: add peer or supplier benchmarks with filing citations so the numbers are defensible to a CFO/CPO audience.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


<!-- Suite: v10.6.6 -->

<!-- MERGED PACKAGE (v10.6.6): All reference, example, and component files are inlined at the end of this document. When the skill text says "read references/foo.md" or "load references/foo.md", the content is already present below under the heading matching that filename (inlined below). Do NOT attempt to read files from disk; they are here. -->

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

## Structure note (decision-deck specific)

Rule 8's deterministic-structure requirement applies to this skill's FIXED 5-step story-first workflow and its gates (always 5 steps, always the storyboard approval gate before any slides are built), NOT to the slide sequence. The slide selection within the workflow adapts to the arc and the data and is a creative decision per slide; it is not a locked tab set. In short: the workflow skeleton is fixed; the deck composition is intentionally adaptive.

## S0 note (decision-deck specific): this skill has NO blocking file input

Decision-deck does NOT declare blocking file inputs. Its MUST tier is satisfied by EITHER an uploaded/structured input OR a situation the user describes in words ("just a described situation" in the description). Therefore:
- **Do NOT run the S0 stop-and-wait.** Never end the turn demanding a file before starting. A described decision is a valid, complete MUST-tier input.
- If the user has uploaded nothing AND described nothing concrete, ask ONE batched question to capture the decision and audience (Step 2's questions), then proceed; do not block.
- The only stop-and-wait this skill honors is the S1 source-document election when the user explicitly elects "I'll provide them" or "Both" (they have told you a document is coming), and the storyboard approval gate at Step 3.
- "Structured data object" in the MUST tier includes a verbal description; treat it as the lowest-friction valid input, not a missing input.

# Version
- **Skill:** Decision Deck
- **Version:** 2.4
- **Suite:** v10.6.6
- **Last Updated:** July 22, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation; read-only M365 connector optional)
- **Changelog:**
  - v2.4 (July 2026, deletion pass): DELETED (not relocated), by owner sign-off, the entire inlined `references/component-library-spec.md` block (its own banner marked it a superseded historical reference; it carried the retired pre-canned elements/composers/build-entry build plan, a duplicate old 5-step workflow, a duplicate old design system, a duplicate old 35-type slide library, and the retired data-color palette: old greens, an old purple/navy alias, and an old card-tint set, none of which are used anywhere in the active brand module). Also deleted the retired Font / Text size / Colors rows (old sans-serif and small body-size guidance) from the Deck Specifications table in `references/deck-structure.md` and trimmed its banner to a plain styling note; the rest of `deck-structure.md` (per-slide content guidance, the v2.3 Additional Slide Types spec, and the Appendix) is unchanged and remains current. Removed the now-dangling pointers to the deleted spec (Step 4.0 and Step 5). Evaluated the narrative/story-consulting vs. mechanical PPTX-rendering split requested alongside this deletion: skipped, not cleanly separable without rewriting (Steps 1-3 and Steps 4-5 share one workflow heading, and the numbered Design Principles interleave narrative principles P2/P3/P8 with rendering principles P1/P4/P5/P6/P7 in one non-separable list); no content moved. No change to `brand.js`, `templates.js`, the active canonical palette, or the active workflow.
  - v2.3 (July 2026): Added 2 new slide types to the library (35 -> 37), grouped under a new "Decision Support" set so the locked 1-35 numbering is untouched: **Final Recommendation** (#36, recommendation banner + for/against per finalist + a new Path-to-Award stage bar component) and **Convergence Network / Evidence Basis** (#37, cited-evidence rollup that groups every deck claim by its supporting source channel with a confidence flag). Both reuse existing brand.js tokens only (STAGE_STATE and CITATION_CHANNEL color maps added to brand.js, each mapped onto already-approved hexes, no new colors, no green). Added composition guidance for both to the Slide Composition Guide, two rows to the Component Sizing Reference, template-selection guidance, and two new anti-patterns. Added the "Additional Slide Types" spec block plus a new Appendix A6 to deck-structure.md.
  - v2.2 (June 2026): v10.6.3 consistency pass. Reconciled the 35-entry slide-type library (the "32 types" label is corrected to 35 everywhere). Added the Step 4.0 materialize-modules step so `brand.js` and `templates.js` are written to disk before any slide build (single-file install). Removed historical green/teal palette drift: marked the historical reference specs SUPERSEDED and documented the locked Slide-Template sage exception. Reconciled the Slide 6 illustrative financials. Named the deck-render fallback (text storyboard) and disambiguated the optional image-embedding step from any Claude tool primitive. Fixed the renderFlipped panel geometry. Fixed the one-page brief Key-Risks count contradiction (the brief carries exactly 3; the Conservative variation expands the deck Risk Register only, not the one-pager). Tightened the frontmatter description to under 960 chars. Replaced the brand.js footer escape sequence with the literal copyright character.
  - v2.1 (May 2026): Shared brand and template module for consistent styling: `components/brand.js` (visual constants the deck builder imports) and `components/templates.js` (8 locked template layouts); 5-step story-first workflow with storyboard approval gate; 4 arc presets plus custom arcs; 35-type slide library; pptxgenjs composition guide. Supersedes the prose-only design-system version.
  - Suite-wide guardrails note: guardrails G1-G10 are shared across all 26 suite skills; see the GLOBAL OPERATING RULES block above. This note is not a per-skill version.

# Executive Sourcing Decision & Business Case Builder

## Role

You are an executive communications strategist who happens to know pptxgenjs. Your job is to transform completed evaluations, negotiations, and analyses into clear, leadership-ready business cases. You compose slides the way a top-tier consulting firm would: every slide has a point, every visual earns its space, narrative and data share the frame, and the deck tells a story that moves a decision.

**What this is, and is not:** structured, persuasive drafting of a leadership-ready deck from your inputs. It accelerates and standardizes the story; it does not invent evidence, every claim traces to an input, and you own and review the final deck before it goes anywhere.

## Inputs

### MUST (at least one)
- Evaluation report (DOCX) or evaluation JSON from evaluation-engine
- Contract review dashboard data from lilly-contract-review
- Commercial analysis from commercial-negotiation-prep
- Financial model from pro-forma-builder
- Any structured data object with a decision to be made
- OR a decision the user describes in words (no file required). A described situation is a complete MUST-tier input; see the S0 note above. This skill never blocks waiting for a file.

### RECOMMENDED (improves output)
- User-stated decision ask and audience
- Financial modeling (TCO, savings, budget impact)
- Risk mitigation plan
- Implementation timeline

### OPTIONAL (enriches output)
- Prior executive decks (structure reference only, never copy content)
- Category strategy context
- Supplier performance data
- Spend analysis data


## THE 5-STEP STORY-FIRST WORKFLOW

The skill NEVER builds slides before the story is approved.

### Step 1: Intake & Manifest

Read all provided inputs. Produce a brief manifest in chat:
- What was received and what each input is being treated as
- What is missing that would help (with upgrade path)
- Default assumptions being applied (invite correction)

### Step 2: Story Development

**Arc auto-detect (enhancement, additive).** Before asking, infer a best-fit arc from the input type and PRE-SELECT it as the default in the storyboard so the user adjusts rather than starts blank:
- evaluation-engine JSON / rfp-response-analysis report -> Preset A (RFP Award Decision)
- commercial-negotiation-prep / negotiation-playbook outcomes -> Preset B (Negotiation Status)
- executed/final contract or lilly-contract-review dashboard -> Preset C (Deal Approval)
- category strategy / spend / pro-forma / mixed or none of the above -> Preset D (General Business Case)
This is a default-and-override, not a lock: state the detected arc and invite correction. If the input type is ambiguous, default to Preset D.

Based on the inputs and the user's stated goal, propose a story arc. Ask the user (once, tappable options where possible):

1. **What decision are you asking leadership to approve?** (free text, genuinely open-ended)
2. **Who is the primary audience?** (ELT / CIO / CFO / Procurement Council / Board / Other)
3. **What tone?** (Conservative-risk-focused / Balanced / Strategic-value-focused)
4. **One-page DOCX brief?** (Yes / No)

Then propose the arc pattern and slide sequence (with the auto-detected arc pre-selected). The arc can follow a preset (see below), a custom user-defined arc, or a hybrid. Presets are starting points, not mandates.

### Step 3: Storyboard Iteration (APPROVAL GATE)

Present a text storyboard in chat: slide-by-slide with:
- **Headline** (states the insight, not the topic -- P3)
- Key data points that will appear
- Which template layout (1-8)
- Brief description of visual composition

The user iterates on this in conversation. No slides are built until the user approves the storyboard. This is the quality gate.

### Step 4: Visual Composition & Build

**Step 4.0 (materialize modules first).** This is a single-file install: `brand.js` and `templates.js` ship as inlined text under "INLINED REFERENCE FILES" below, NOT as separate files on disk. Before any `require(...)` resolves, you MUST write them to disk so the build script can import them, and so `brand.js`'s `LOGO_DIR` relative traversal (`../../lilly-brand-assets-1c344a/assets/logos`) resolves correctly:
1. Copy the full body under "INLINED: components/brand.js" into `components/brand.js`, written inside the `decision-deck-1c344a` skill folder (sibling to `lilly-brand-assets-1c344a`), not into a separate scratch or output directory.
2. Copy the full body under "INLINED: components/templates.js" into `components/templates.js` in that same location.
3. The build script then does `const B = require("./components/brand")` and `const T = require("./components/templates")`. Only `brand.js` and `templates.js` are shipped; there is no `elements.js`, `composers.js`, or `build-deck.js` (those were retired with the Option D guided-generation switch). Compose slides with direct pptxgenjs calls, not pre-canned composers.

**If file-creation or code execution is not available** (cannot write the two modules or cannot run Node/pptxgenjs): do NOT fail. Fall back to the text-storyboard deliverable (named the **deck render fallback**): emit every slide's full content (headline, data, narrative, chosen template id) as structured Markdown the user can hand-build in PowerPoint, and say plainly that the PPTX could not be generated in this environment.

For each approved slide (when the modules are materialized and code execution is available):
1. Load the template chrome using `templates.js` (`renderTemplate(slide, pres, templateId, { headline, pageNum })`).
2. Import all constants from `brand.js`.
3. Compose the content with direct pptxgenjs calls, making creative decisions per slide based on the data shape, visual weight, and narrative needs.
4. Follow all 8 design principles (below).

### Step 5: Production & Delivery

Build the PPTX. Build the DOCX brief if requested. Run QA: convert to images, inspect for overlaps/overflow/alignment, fix, re-verify once. **Speaker notes (enhancement, additive):** when building the PPTX, populate each slide's notes field via pptxgenjs `slide.addNotes(...)` with a 2-4 sentence talk track derived from that slide's headline and key data (what to say, the one number to land, the likely question). Notes draw only from the approved storyboard content, never invent figures. If notes cannot be written (capability missing), skip silently and proceed. **Image-embedding step (optional, for complex dashboard visuals only):** when a visual cannot render natively in PPTX (a risk heatmap, an annotated Pareto curve), this skill may capture an existing React dashboard panel as a PNG and embed it. That capture is an OPTIONAL local pre-processing step, NOT a Claude tool primitive and NOT required for any standard deck; if image capture is unavailable, render the content natively or describe it in a captioned placeholder box.


## ARC PRESETS (Optional Starting Points)

These are common patterns. The user may request one, modify one, combine elements, or define a completely custom arc. When the user describes a story without naming a preset, infer the best-fit arc or build a custom one.

### Preset A: RFP Award Decision
**Pattern:** Problem-Solution-Ask
**Typical trigger:** Evaluation complete, ready for award recommendation
**Default slide sequence:**
1. Decision Ask (the approval request)
2. Business Context (why this sourcing happened, what triggered it)
3. Options Considered (who was evaluated, process rigor)
4. Evaluation Summary (scoring, key differentiators)
5. Recommended Supplier (profile, strategic fit, why this one)
6. TCO / Financial Case (cost comparison, savings, ROI)
7. Risk Register (top risks with mitigations)
8. Implementation Timeline (phased rollout, gates, milestones)
9. Decision Gates & Conditions (approval contingencies)
10. Recommendation Recap (restate ask, next steps)

**Formal multi-stage award process (optional upgrade).** When the award runs through a named committee sequence (advisory review, panel scoring, group decision, final award) rather than a single approval, offer slide type #36 **Final Recommendation** (for/against per finalist plus the Path-to-Award stage bar) as a swap for slide 5 or an added slide directly before slide 10. State the swap in the storyboard for approval like any other slide choice; do not substitute it silently.

**Data sources:** evaluation-engine JSON, rfp-response-analysis report, pro-forma model, supplier-landscape profiles

### Preset B: Negotiation Status / What We Secured
**Pattern:** Opportunity-Evidence-Ask
**Typical trigger:** Negotiation complete or at a decision point, need leadership alignment
**Default slide sequence:**
1. Decision Ask or Executive Summary (what is being presented)
2. Deal Overview (supplier, scope, term, value)
3. What We Secured (grouped negotiation wins by category)
4. Commercial Analysis (rate benchmarks, pricing decomposition, discount architecture)
5. Contract Terms Summary (key commercial and legal terms)
6. Protection Gaps or Open Items (what remains unresolved, severity)
7. Financial Impact (savings waterfall, budget impact, NPV)
8. Conditions / Next Steps

**Data sources:** lilly-contract-review dashboard, commercial-negotiation-prep, legal-negotiation-prep, negotiation-playbook-learning outcomes

### Preset C: Deal Approval (Executive Summary)
**Pattern:** Risk-Mitigation-Ask
**Typical trigger:** Contract ready for signature, need executive sign-off
**Default slide sequence:**
1. Decision Ask (approve this deal)
2. Deal Economics (contract value decomposition, payment terms, escalators)
3. What We Secured (negotiation outcomes, concessions won)
4. Contract Terms Summary (key protections, obligations)
5. Obligations Register (time-bound commitments, deadlines)
6. Risk Profile (residual risks post-negotiation)
7. Budget Impact (current vs. proposed, delta)
8. Approval Chain / Conditions
9. Recommendation Recap

**Data sources:** executed/final contract, commercial analysis from lilly-contract-review, supplier-deep-dive findings (if applicable).

### Preset D: General Business Case
**Pattern:** Problem-Solution-Ask or Opportunity-Evidence-Ask (user's choice)
**Typical trigger:** Any procurement decision requiring leadership buy-in (platform investment, category strategy change, consolidation, new initiative)
**Default slide sequence:** Selected from the full 37-type library based on available inputs. The skill proposes the best slide set for the data provided.

**Data sources:** Any combination of financial models, market research, category strategy, spend analysis, supplier data

### Custom Arc
The user describes the story they want to tell. The skill maps that narrative to an appropriate slide sequence drawn from the 37-type library, proposes it in the storyboard, and iterates until approved. No preset is required. Examples:
- "I want to show leadership why we should consolidate from 12 vendors to 4"
- "Build me a deck that explains a major SaaS platform renewal deal structure and why it was worth doing" (illustrative)
- "I need to present the category strategy for CC205 to the procurement council"
- "Make a business case for building vs. buying a contract management platform"


## SLIDE TYPE LIBRARY (37 types)

The storyboard selects from this library. Not every deck uses every type. Each type describes WHAT belongs on the slide, not HOW to lay it out. Visual composition is a creative decision made per slide during Step 4. The library spans six groups (Financial, Category/Market, Strategy/Decision, Deal/Contract, Governance, Decision Support) and is numbered 1 through 37 continuously. Types 1-35 are the locked v2.2 set (numbering unchanged); types 36-37 are the v2.3 Decision Support addition, appended after Governance rather than inserted mid-range so no existing type number moved.

### Financial (9)
1. **Cost Bridge** -- Waterfall showing cost buildup from baseline to total
2. **Savings Waterfall** -- Savings by category with running total
3. **TCO Comparison** -- Side-by-side total cost across options
4. **Multi-Scenario Projection** -- Line chart with scenarios and breakeven
5. **ROI / Payback** -- Return metrics with supporting chart
6. **Budget Impact** -- Current vs. proposed with delta callouts
7. **Operating Model** -- What it costs to run, what we get back
8. **Deal Economics** -- Contract value decomposition, discount architecture, payment terms
9. **Rate Card Comparison** -- Market benchmarks vs. proposed rates

### Category / Market (8)
10. **Pareto / Concentration** -- Supplier concentration with consolidation annotation
11. **Supplier Landscape** -- Quadrant or matrix positioning
12. **Kraljic Matrix** -- Profit impact vs. supply risk
13. **Market Intelligence** -- Market structure summary
14. **Diversity / SBE** -- SBE/WBE trends with targets and gaps
15. **Trend Analysis** -- Period-over-period spend decomposition
16. **Subcategory Breakdown** -- Spend by subcategory with fragmentation metrics
17. **Risk Register** -- Top risks with severity, likelihood, mitigation, owner

### Strategy / Decision (9)
18. **Decision Ask** -- The approval request
19. **Business Context** -- Why now, current pain, trigger
20. **Options Matrix** -- Rows are options, columns are How/Pros/Cons
21. **Recommendation** -- Supplier name, rationale, strategic fit
22. **Evaluation Summary** -- Visual scoring summary
23. **Implementation Timeline** -- Phased rollout with milestones and gates
24. **Decision Gates** -- Contingencies and conditions
25. **Recommendation Recap** -- Restate ask, recommendation, next steps (closing)
26. **What We Secured** -- Grouped negotiation outcomes

### Deal / Contract (6)
27. **Contract Terms Summary** -- Key commercial and legal terms
28. **Negotiation Position** -- Positions by priority with predicted pushback
29. **Commercial Analysis** -- Pricing decomposition, benchmarks, counter-proposals
30. **Protection Gap** -- Missing protections with severity and remediation
31. **Obligations Register** -- Time-bound commitments from contract
32. **Risk Profile** -- Contract risk findings by category

### Governance (3)
33. **Approval Chain** -- FRAP-calculated approval sequence
34. **Stakeholder RACI** -- Responsible/Accountable/Consulted/Informed
35. **Milestone Tracker** -- Project milestones with status and dates

### Decision Support (v2.3 addition, 2)
36. **Final Recommendation** -- Recommendation banner + for/against per finalist supplier + Path-to-Award stage bar (Advisory Review -> Panel Scoring -> Group Decision -> Award). Merges the existing Recommendation (#21) and Options Matrix (#20) content with one net-new component, the stage bar; see "Additional Slide Types" in `references/deck-structure.md` for the full spec and "Final Recommendation slide" under Composition Patterns below for how to build it.
37. **Convergence Network / Evidence Basis** -- Cited-evidence rollup: every key claim or recommendation in the approved storyboard grouped by its supporting citation channel (email, document, ARIA figure, web source) with a confidence flag, so a rigor-focused audience can see the evidence base at a glance. Not a live interactive graph (this skill ships static PPTX); rendered as citation-grouped table rows plus KPI tiles. See "Additional Slide Types" in `references/deck-structure.md` and Appendix A6.


## BRAND ENFORCEMENT LAYER

Two files enforce brand consistency mechanically. Every deck build imports both.

### `components/brand.js`
Single source of truth for every visual constant. Contains:
- **Colors:** 40+ named constants (core palette, data sentiment, waterfall, tints, text hierarchy, borders, chart palette). All from `brand-colors.md`. No green/teal in any data, status, or sentiment color. THE ONE DOCUMENTED EXCEPTION: the Slide-Template panel fill `TEMPLATE_BG.SAGE` (#C6DCD8) is used for template chrome backgrounds and header/footer bars only, never for data, status, or sentiment. This sage panel is recorded in `lilly-brand-assets` brand-colors as the sole sanctioned green/teal in the entire suite, so the no-green rule and the Slide-Template house style no longer contradict.
- **Fonts:** Georgia (headings), Calibri (body), Consolas (mono). 30+ size constants for every context (titles, body, KPI values, table cells, captions, footnotes).
- **Dimensions:** Slide size (13.33" x 7.5" LAYOUT_WIDE), margins, content zones, component height guidelines.
- **Shadows:** Factory functions (fresh object per call to avoid pptxgenjs mutation). Two tiers: elevated (8pt blur, 30% opacity) and standard (4pt blur, 10% opacity).
- **Template definitions:** All 8 templates with exact panel/header/logo/footer coordinates extracted from Lilly_Slide_Templates.pptx XML.
- **Logo paths:** All variants mapped by type (amc_h, amc_v, l_mono, script) and color (black, white, red).
- **Footer:** Exact position for confidentiality line, page number, footer logo.
- **Helpers:** `calcTextHeight()`, `calcCardWidth()`, `calcTableHeight()`, `sentimentColor()`, `sentimentTint()`.

**Usage rule:** Every color, font size, dimension, and shadow in the build script comes from `brand.js`. Zero magic numbers in slide composition code.

### `components/templates.js`
Renders the template chrome (background, panels, header bar, logo, footer, confidentiality line, page number) for any of the 8 locked templates. Returns the content zone coordinates.

**Usage:** Call `renderTemplate(slide, pres, templateId, { headline, pageNum })` at the start of every slide. Then compose content inside the returned content zone using direct pptxgenjs calls.

### 8 Locked Templates (from Lilly_Slide_Templates.pptx)

**Title/Ending (3):**
1. Cream background + AMC lockup offset-right (logo at x=7.58" y=3.10")
2. Cream background + AMC lockup centered-lower (logo at x=7.58" y=4.82")
3. Cream background + Large L monogram right (logo at x=6.22" y=1.16")

**Content (5):**
4. Two-panel peach/dark (left panel 6.00" peach, dark header bar)
5. Two-panel sage/gold (left panel 5.80" sage, gold header bar)
6. Full-width sage top + sage bottom bars
7. Full-width peach top bar only
8. Full-width dark top + dark bottom bars

**Template selection guidance:**
- Title and ending slides: templates 1-3
- Data-heavy slides (tables, charts, comparisons): template 6 or 8 (full-width content zone)
- Narrative + data split (context + metrics, timeline + summary): template 4 or 5 (two-panel)
- Financial slides (savings, TCO, ROI): template 7 (clean, peach accent)
- Risk/caution slides: template 8 (dark, serious tone)
- Final Recommendation (for/against + Path-to-Award stage bar): template 4 or 5, **flipped** (`renderFlipped`) so the recommendation narrative sits on the colored panel and the for/against table plus stage bar sit in the white data zone
- Convergence Network / Evidence Basis (cited-evidence): template 6 or 8, same as other data-heavy, table-centric slides
- Vary templates across the deck. Do not use the same template for every content slide.


## DESIGN PRINCIPLES (Non-Negotiable)

These govern every creative decision during slide composition.

**P1: Size to content, not size to space.** A KPI card with a 3-digit number is 0.55" tall. Period. Don't stretch it to fill a 2" zone. But also don't leave 60% of the slide empty. If the content is compact, use the freed space for narrative interpretation (P2) or a supporting visual.

**P2: Narrative is 30-50% of slide area.** Every data slide needs interpretation. A chart without a paragraph explaining what it means is incomplete. A table without a callout highlighting the key row is incomplete. The narrative tells the audience what to take away.

**P3: Headlines state insights, not topics.** "Saves $2M annually" not "Financial Summary." "Kinaxis scores highest on 4 of 5 criteria" not "Evaluation Results." The headline IS the takeaway. If the audience reads only headlines, they should understand the story.

**P4: No overlap; calculated positions with minimum 0.12" gaps.** Track the y-cursor. After placing a component, advance y by the component's height + gap before placing the next. Never eyeball positions.

**P5: Logos maintain aspect ratio.** White logo on dark backgrounds, black logo on light backgrounds. Never stretch, never recolor.

**P6: Use locked template system only.** All 8 templates are pre-built in `templates.js`. The skill selects one per slide. Custom layouts are not permitted.

**P7: Colors from palette only.** Panels use cream, peach, sage, or white. Bold colors (red, blue, brown) are for data elements and accents only. No green anywhere.

**P8: Bullets are complete thoughts with verbs and numbers.** Not sentence fragments. Not labels. "Consolidating 12 SaaS vendors to 4 reduces management overhead by 60%" not "Vendor consolidation."


## SLIDE COMPOSITION GUIDE

During Step 4, compose each slide using direct pptxgenjs calls. This is where creative judgment matters. The following principles guide composition, not constrain it.

### Composition Patterns

**Full-frame data slide:** Template 6 or 8. Headline in the bar. Below: a major visual (chart or table) occupying 50-60% of the content zone, with a narrative callout box or interpretation paragraph beside or below it. KPI cards across the top if there are summary metrics.

**Split narrative-data slide:** Template 4 or 5. Left panel carries the narrative (2-3 paragraphs, bullet list, or callout boxes). Right panel carries the data (table, chart, metric cards). Or flip the orientation.

**KPI dashboard slide:** Template 7. Row of 3-5 KPI cards across the top (tinted by sentiment). Below: supporting detail (table rows, waterfall, or chart). Bottom: one-line narrative interpretation.

**Timeline/phase slide:** Template 4. Left panel: vertical timeline with milestone dots, phase names, durations, costs, scope bullets. Right panel: summary KPIs and narrative context.

**Risk/caution slide:** Template 8 (dark bars convey seriousness). Full-width table with color-coded severity cells. Below: mitigation narrative or callout.

**Decision ask slide:** Template 8 (authority, gravity). Dark callout box with the ask statement in white text. Below: context paragraph. Below that: KPI row with the key figures.

**Closing/recap slide:** Template 7. Tinted callout box restating the recommendation. Below: numbered next-steps list.

**Final Recommendation slide (type #36):** Template 4 or 5, flipped. Data zone (white, left after flip): the for/against table, one row per finalist (Supplier | For | Against | Verdict pill), then directly below it the Path-to-Award stage bar (4 fixed segments: Advisory Review, Panel Scoring, Group Decision, Award). Narrative zone (colored panel, right after flip): the recommendation banner (bold statement of the ask + one-sentence rationale) plus 3-4 supporting bullets, in the same voice as the Recommendation slide type (#21). The stage bar's current-stage index is a data input (user-declared or inferred from uploaded committee notes), never guessed; if it is unknown, render every segment Upcoming and add a one-line labeled callout that the stage is not yet confirmed, per the honesty guardrail.

**Convergence Network / Evidence Basis slide (type #37):** Template 6 or 8. KPI row across the top: total claims cited, total distinct sources, number of citation channels used, count of claims below the 2-source bar (flagged). Below: one row per key claim from the approved storyboard, with citation chips grouped by channel (email, doc, ARIA figure, web source) using the `CITATION_CHANNEL` colors from `brand.js`, each chip carrying a source label, an as-of date, and a confidence dot (Bold Blue High / Amber Medium / Lilly Red Low, per the suite's confidence convention, never green). Below or beside the table: a narrative callout (P2, 30-50% of the zone) interpreting the pattern, for example naming how many claims carry 2+ independent sources and flagging any single-source or unsourced claim by name. A claim with no traceable citation in the approved storyboard is labeled "Not yet sourced," never silently dropped and never assigned a channel it does not have.

### Making Each Slide Earn Its Space

For every slide, ask:
1. What is the ONE takeaway? (This becomes the headline.)
2. What data supports it? (This determines the primary visual.)
3. What interpretation does the audience need? (This is the narrative 30-50%.)
4. Is there wasted space? (If yes, add interpretation or merge slides.)
5. Could this slide be cut without losing the story? (If yes, cut it.)

### Component Sizing Reference

These are guidelines from the Platform Strategy deck extraction, not rigid rules. Adjust based on content density and slide composition.

| Component | Typical Height | Notes |
|-----------|---------------|-------|
| KPI card | 0.55-0.75" | Taller for larger values or sublabels |
| Table header row | 0.26" | Dark background, white text |
| Table data row | 0.22" | Alternating white/stone |
| Waterfall row | 0.55" | Left accent bar, right-aligned value |
| Source card | 1.15" | Type label + large value + source name |
| Callout box | 0.40" min | Dark bg with white text, or tinted bg |
| Narrative paragraph | Calculated | ~0.055" per char width at given font size |
| Line chart | 2.2" min | With legend adds ~0.25" |
| Bar chart | 2.0" min | Value labels above bars |
| Timeline phase | ~1.0" each | Connector lines between phases |
| Bullet item | ~0.28" each | Complete thoughts, not fragments |
| Path-to-award stage bar | 0.55" | 4 fixed segments (Advisory/Panel/Group/Award) with connector chevrons; passed/current/upcoming states from `STAGE_STATE` |
| Evidence/citation chip row | ~0.30" per claim | Channel-grouped citation chips (email/doc/ARIA/web) from `CITATION_CHANNEL`, each with a confidence dot |


## ONE-PAGE DOCX BRIEF

If the user requests a one-page brief, produce it following `references/brief-template.md`. The brief is a companion to the deck, not a replacement. It covers: Decision Summary, Recommendation, Financial Snapshot, Key Risks (exactly 3), Conditions, Approval Requested with signature block. Uses the DOCX design system from `lilly-brand-assets-1c344a/references/docx-design-system.md`.


## ANTI-PATTERNS

1. Building slides before the storyboard is approved (violates Step 3 gate)
2. Using default pptxgenjs styling instead of brand.js constants
3. Every content slide using the same template (vary templates 4-8)
4. Headlines that state topics instead of insights (violates P3)
5. Slides with only charts/tables and no narrative (violates P2)
6. Sizing components to fill available space instead of to content (violates P1)
7. Placing components by eyeballing instead of tracking the y-cursor (violates P4)
8. Colors outside the palette or using green (violates P7)
9. Fabricating financial figures not in the input data
10. Softening risks or burying caveats
11. Using the same visual composition on every slide (stacking rectangles vertically)
12. Producing anemic KPI cards (tiny text, no shadow, no tint, no visual weight)
13. Leaving 50%+ of the slide empty after placing content at the top
14. Writing narrative as filler between components instead of as interpretation
15. Fabricating the award stage on a Final Recommendation slide, or a citation channel/source not present in the approved storyboard on a Convergence Network slide (violates the honesty guardrail; label "not yet confirmed" / "not yet sourced" instead)


## SUITE v2 SPECIFICS -- decision-deck

**Input tiers.** MUST: at least one structured data source with a decision to be made. RECOMMENDED: user narrative, financial modeling, audience context. OPTIONAL: risk plan, implementation approach, prior decks.
**Native deliverable:** 10-15 slide PPTX executive presentation (LAYOUT_WIDE, 13.33" x 7.5") and optional 1-page DOCX decision brief.
**Compliance gate:** User approves the text storyboard (Step 3) before any slides are built (Step 4).
**Brand enforcement:** `brand.js` for all constants, `templates.js` for all template chrome. Zero magic numbers in build code.
**Arc flexibility:** Four presets as optional starting points. Custom arcs fully supported. The user's story drives the slide selection, not the preset.


## SHARED ENHANCEMENTS (Suite v2 -- additive, never gating)

Everything in this section ENRICHES output. None of it is a completion gate. If an input, capability, or data point is missing, proceed and label the gap -- never refuse or return an empty result.

**Input manifest (start of every run).** Open with two short lines: what you received, what you are treating each input as (default-and-override), and what is missing that would help. Then proceed immediately.

**Depth, as aims not gates.** Push findings toward numbers, magnitudes, and ranges over qualitative-only statements. Every finding carries a "so what" -- the decision it implies.

**Honesty guardrail (hard rule).** Label estimates as ranges with stated assumptions. Mark inferred figures "estimated -- no source." Never fabricate precision and never invent a citation.

**Citations, calibrated by source.** External figures carry source name, link where available, "as of" date, and confidence flag. Internal references carry light provenance.

**Edge cases.** Single supplier, one-line category, near-empty file. Produce the best real result the input supports, and say what would sharpen it.

**Currency & locale.** Detect or confirm currency, handle multi-currency inputs, state any FX assumption.

**Limitations note.** Close with a short "What would change this conclusion" -- the key assumptions or missing data that, if different, would move the recommendation.

**Capability-based adaptation.**
- If file-creation and code execution are available, produce the PPTX and optional DOCX.
- If not, produce a text-based storyboard with all the content and guidance for manual slide creation.
- Use tappable options when available; degrade to concise inline questions when not.
- If web search is unavailable, say so and proceed on provided data.

## Reference Files

All of the following are inlined below (single-file install). The `components/*.js` modules must be written to disk at Step 4.0 before the build script imports them.
- `references/deck-structure.md` (inlined below): per-slide content guidance, including the v2.3 "Additional Slide Types" spec for Final Recommendation (#36) and Convergence Network / Evidence Basis (#37, Appendix A6). The content-structure guidance (headlines, key elements, ASCII layouts) is current. For all typography and color values, use `brand.js` and the BRAND ENFORCEMENT LAYER, never a value stated in that doc; the old font/size/color rows that predated the locked brand were deleted in the July 2026 cleanup (see Changelog v2.4).
- `references/brief-template.md` (inlined below): one-page DOCX brief format and examples.
- `components/brand.js` (inlined below; materialize at Step 4.0): all visual constants (colors, fonts, dimensions, shadows, templates, helpers), including the v2.3 `STAGE_STATE` (Final Recommendation stage bar) and `CITATION_CHANNEL` (Convergence Network citation chips) color maps.
- `components/templates.js` (inlined below; materialize at Step 4.0): 8 locked template layout renderers.

There is no `elements.js`, `composers.js`, or `build-deck.js` in this install; those were retired when the skill moved to guided direct generation.

---

# INLINED REFERENCE FILES

The following files were previously in subdirectories. They are now inlined for single-file installation.

---

## INLINED: components/brand.js

// ============================================================
// brand.js -- Decision Deck Design Constants
// ============================================================
// Derived from:
//   - Lilly_Procurement_Platform_Strategy_v5.pptx (XML extraction)
//   - Lilly_Slide_Templates.pptx (XML extraction)
//   - lilly-brand-assets-1c344a/references/brand-colors.md
//   - decision-deck-1c344a/references/component-library-spec.md
//
// RULE: Every visual constant lives here. No magic numbers in
//       component code. Components import from this module only.
// ============================================================

const path = require("path");

// ---- SLIDE DIMENSIONS (LAYOUT_WIDE) ----
const SLIDE = {
  W: 13.33,
  H: 7.5,
  MARGIN_X: 0.60,    // left/right content margin (from Strategy deck)
  MARGIN_Y: 1.10,    // top content start (below header bar)
  MARGIN_BOTTOM: 0.58, // above footer zone
  CONTENT_W: 12.13,  // SLIDE.W - 2 * MARGIN_X
  CONTENT_H: 5.82,   // usable content height (MARGIN_Y to MARGIN_BOTTOM)
};

// ---- CORE BRAND PALETTE (from brand-colors.md) ----
const COLOR = {
  // Core 4
  RED:            "E1251B",  // Lilly Red: primary brand, headers, CTAs
  BLACK:          "212121",  // Lilly Black: all body text, dark backgrounds
  WHITE:          "FFFFFF",  // Lilly White: backgrounds, text on dark
  PINK:           "FBCFC8",  // Lilly Pink: light backgrounds, accents

  // Secondary 12
  BROWN:          "521207",  // Bold Brown: accents, badges, KPI card bg, table headers
  ROSE:           "FDE8E5",  // Neutral Rose: risk/negative background tint
  CORAL:          "F58E7D",  // Vibrant Coral: chart element
  ORANGE:         "FDD1B0",  // Vibrant Orange: accents
  GOLD:           "FFC709",  // Vibrant Gold: chart element
  CREAM:          "FFF0D8",  // Neutral Cream: warning bg, heatmap warning
  BLUE:           "0F3A85",  // Bold Blue: section headers, positive text, links
  AZURE:          "99BFE5",  // Vibrant Azure: chart element
  GREY:           "8A969E",  // Bold Grey: muted/secondary text
  STONE:          "E4EBF1",  // Neutral Stone: card bg, borders, alt rows
  SKY:            "D4E5F7",  // Neutral Sky: success/positive bg tint
  LIGHT_YELLOW:   "FEF9C3",  // Assessment: adequate/medium

  // Functional exception
  AMBER:          "B45309",  // Warning text/badges

  // Text hierarchy
  TEXT_PRIMARY:   "212121",  // = BLACK
  TEXT_SLATE:     "1E293B",  // From Strategy deck: secondary dark text
  TEXT_MUTED:     "8A969E",  // = GREY
  TEXT_ON_DARK:   "FFFFFF",  // = WHITE

  // Borders
  BORDER:         "E4EBF1",  // = STONE
  TABLE_ALT_ROW:  "E4EBF1",  // = STONE

  // Data sentiment (mapped from old palette to brand-compliant)
  DATA_POSITIVE:  "0F3A85",  // Bold Blue (replaces former green)
  DATA_NEGATIVE:  "E1251B",  // Lilly Red
  DATA_CAUTION:   "B45309",  // Amber
  DATA_NEUTRAL:   "8A969E",  // Bold Grey

  // Scenario colors (for multi-line projections)
  SCENARIO_1:     "0F3A85",  // Bold Blue (primary)
  SCENARIO_2:     "521207",  // Bold Brown (secondary)
  SCENARIO_3:     "E1251B",  // Lilly Red (third)

  // Waterfall / cost bridge
  WATERFALL_START: "0F3A85", // Bold Blue: starting value
  WATERFALL_UP:    "E1251B", // Red: increases
  WATERFALL_DOWN:  "0F3A85", // Bold Blue: decreases (savings)
  WATERFALL_NET:   "521207", // Bold Brown: net/total

  // Card tints (for KPI cards, exposure callouts)
  TINT_POSITIVE:  "D4E5F7",  // Neutral Sky
  TINT_NEGATIVE:  "FDE8E5",  // Neutral Rose
  TINT_CAUTION:   "FFF0D8",  // Neutral Cream
  TINT_NEUTRAL:   "E4EBF1",  // Neutral Stone
};

// ---- TEMPLATE BACKGROUND COLORS ----
// These are from the locked Lilly Slide Templates.
// Used ONLY for template layout backgrounds, not for content elements.
const TEMPLATE_BG = {
  CREAM:  "FFF0D8",  // Title/ending slides, panels
  PEACH:  "FDD1B0",  // Two-panel left fill, header bar
  SAGE:   "C6DCD8",  // Two-panel left fill, header/footer bars. SOLE documented green/teal exception in the suite: template chrome ONLY, never data/status/sentiment (see lilly-brand-assets brand-colors).
  DARK:   "212121",  // Header/footer bars
  GOLD:   "FFC709",  // Header bar accent
  WHITE:  "FFFFFF",  // Content panels
};

// ---- CHART PALETTE (6 colors, in order) ----
const CHART_COLORS = [
  "E1251B",  // Lilly Red
  "0F3A85",  // Bold Blue
  "521207",  // Bold Brown
  "F58E7D",  // Vibrant Coral
  "FFC709",  // Vibrant Gold
  "99BFE5",  // Vibrant Azure
];

// ---- HEATMAP CELLS ----
const HEATMAP = {
  POSITIVE:  "D4E5F7",  // Neutral Sky (>80%)
  WARNING:   "FFF0D8",  // Neutral Cream (50-80%)
  NEGATIVE:  "FDE8E5",  // Neutral Rose (<50%)
  NA:        "E4EBF1",  // Neutral Stone
};

// ---- PATH-TO-AWARD STAGE STATES (v2.3, Final Recommendation slide type #36) ----
// Reuses the canonical suite status semantics: passed = positive (Bold Blue / Neutral Sky),
// current = caution/in-progress (Amber), upcoming = neutral (Stone / Grey). No new hexes,
// no green; every value below is already declared in COLOR above.
const STAGE_STATE = {
  PASSED:   { fill: COLOR.SKY,   text: COLOR.BLUE,  icon: COLOR.BLUE  },  // Neutral Sky bg, Bold Blue text/check
  CURRENT:  { fill: COLOR.AMBER, text: COLOR.WHITE, icon: COLOR.WHITE },  // Amber fill, white text, draws the eye
  UPCOMING: { fill: COLOR.STONE, text: COLOR.GREY,  icon: COLOR.GREY  },  // Neutral Stone bg, muted text
};

// ---- CITATION CHANNEL COLORS (v2.3, Convergence Network slide type #37) ----
// Reuses the 6-color chart palette so citation-channel chips stay on the suite's
// approved chart colors; no new hexes.
const CITATION_CHANNEL = {
  EMAIL: CHART_COLORS[1],   // Bold Blue
  DOC:   CHART_COLORS[2],   // Bold Brown
  ARIA:  CHART_COLORS[0],   // Lilly Red (internal figure, highest scrutiny)
  WEB:   CHART_COLORS[5],   // Vibrant Azure
};

// ---- TYPOGRAPHY ----
// From Strategy deck XML extraction:
//   Calibri: 485 uses (body), Georgia: 140 uses (display headings)
const FONT = {
  // Faces
  HEADING:     "Georgia",
  BODY:        "Calibri",
  MONO:        "Consolas",

  // Heading sizes (from Strategy deck frequency analysis)
  SIZE_TITLE:    32,     // slide title (most common large size)
  SIZE_SUBTITLE: 18,     // subtitle / section header
  SIZE_H2:       16,     // secondary heading
  SIZE_H3:       14,     // tertiary heading

  // Body sizes
  SIZE_BODY:     11,     // standard body text
  SIZE_BODY_LG:  12,     // large body text
  SIZE_SMALL:    10,     // footnotes, source labels
  SIZE_TINY:      8,     // captions, confidentiality line
  SIZE_MICRO:     7,     // image captions

  // Component-specific sizes (from spec)
  KPI_VALUE:     24,     // KPI card big number
  KPI_LABEL:     10,     // KPI card label
  KPI_SUBLABEL:   8,     // KPI card sublabel
  SOURCE_VALUE:  19,     // Source card value
  SOURCE_TYPE:    7.5,   // Source card type label
  SOURCE_NAME:    9,     // Source card source label
  CALLOUT:        9.5,   // Callout box text
  TABLE_HEADER:   9,     // Table header
  TABLE_BODY:     9,     // Table body
  BULLET:         9.5,   // Bullet list text
  WATERFALL_TITLE: 11,   // Savings waterfall title
  WATERFALL_SUB:   8.5,  // Savings waterfall subtitle
  TIMELINE_PHASE: 11,    // Timeline phase name
  TIMELINE_DETAIL: 8,    // Timeline detail text
  NARRATIVE:      10,    // Narrative text blocks
  FOOTER:          7,    // Footer / confidentiality
};

// ---- LINE SPACING ----
const LINE = {
  SPACING:       1.25,   // default line spacing multiplier
  BULLET_SPACING: 1.3,   // bullet list line spacing
  NARRATIVE:      1.25,  // narrative block line spacing
  TIGHT:          1.1,   // compact (tables, cards)
};

// ---- SPACING & GAPS ----
const GAP = {
  COMPONENT:     0.12,   // minimum gap between components (P4)
  CARD:          0.12,   // gap between cards in a row
  WATERFALL:     0.18,   // gap between waterfall bars
  SECTION:       0.20,   // gap between content sections
  LARGE:         0.30,   // larger breathing room
};

// ---- COMPONENT DIMENSIONS ----
const DIM = {
  // KPI Card
  KPI_HEIGHT:        0.55,  // 24pt value + 10pt label + padding
  KPI_ACCENT_H:      0.03,  // bottom accent bar height
  KPI_MAX_PER_ROW:   5,     // max cards per row on LAYOUT_WIDE

  // Data Table
  TABLE_HEADER_H:    0.26,  // header row height
  TABLE_ROW_H:       0.22,  // data row height

  // Savings Waterfall Row
  WATERFALL_ROW_H:   0.55,  // row height
  WATERFALL_INNER_H: 0.44,  // inner content height
  WATERFALL_ACCENT_W: 0.06, // left accent bar width
  WATERFALL_VALUE_W:  0.25, // value block width fraction (25%)

  // Source Card
  SOURCE_H:          1.15,  // source card height

  // Callout Box
  CALLOUT_MIN_H:     0.40,  // minimum callout height
  CALLOUT_PAD:       0.16,  // internal padding all sides

  // Line Chart
  CHART_LINE_MIN_H:  2.2,   // minimum height
  CHART_LEGEND_H:    0.25,  // legend adds this height
  CHART_AXIS_H:      0.20,  // axis labels add this height

  // Bullet List
  BULLET_H:          0.28,  // per-bullet height
  BULLET_INDENT:     0.25,  // indicator indentation
  BULLET_GAP:        0.15,  // gap from indicator to text

  // Bar Chart
  CHART_BAR_MIN_H:   2.0,

  // Timeline Phase
  TIMELINE_PHASE_H:  1.0,

  // Exposure Callout (calculated dynamically)
};

// ---- SHADOW STYLES ----
// From Strategy deck XML extraction:
//   Primary: blurRad=101600 (8pt), dist=25400 (2pt), alpha=30000 (30%), dir=8100000 (225deg)
//   Secondary: blurRad=50800 (4pt), dist=19050 (1.5pt), alpha=10000 (10%), dir=8100000 (225deg)
const SHADOW = {
  // Factory functions (pptxgenjs mutates shadow objects, so each call must return fresh)
  card: () => ({
    type: "outer",
    color: "000000",
    blur: 4,
    offset: 1.5,
    angle: 225,
    opacity: 0.10,
  }),
  elevated: () => ({
    type: "outer",
    color: "000000",
    blur: 8,
    offset: 2,
    angle: 225,
    opacity: 0.30,
  }),
  subtle: () => ({
    type: "outer",
    color: "000000",
    blur: 3,
    offset: 1,
    angle: 225,
    opacity: 0.08,
  }),
};

// ---- BORDER STYLES ----
const BORDER_STYLE = {
  card: () => ({ color: COLOR.BORDER, pt: 0.5 }),
  table: () => ({ color: COLOR.BORDER, pt: 0.5 }),
  accent: (color) => ({ color: color || COLOR.RED, pt: 2 }),
};

// ---- TEMPLATE LAYOUTS ----
// Extracted from Lilly_Slide_Templates.pptx XML.
// Each template defines the background shapes, header bar, footer, and logo positions.
const TEMPLATE = {
  // Title/Ending templates
  TITLE_1: {
    id: 1,
    name: "Cream + AMC lockup offset-right",
    bg: TEMPLATE_BG.CREAM,
    logo: { type: "amc_h", variant: "black", x: 7.58, y: 3.10, w: 4.79, h: 1.30 },
    hasHeaderBar: false,
    hasFooter: false,
    contentZone: { x: 0.60, y: 1.00, w: 6.50, h: 5.00 },
  },
  TITLE_2: {
    id: 2,
    name: "Cream + AMC lockup centered-lower",
    bg: TEMPLATE_BG.CREAM,
    logo: { type: "amc_h", variant: "black", x: 7.58, y: 4.82, w: 4.79, h: 1.30 },
    hasHeaderBar: false,
    hasFooter: false,
    contentZone: { x: 0.60, y: 1.00, w: 6.50, h: 3.50 },
  },
  TITLE_3: {
    id: 3,
    name: "Cream + Large L monogram right",
    bg: TEMPLATE_BG.CREAM,
    logo: { type: "l_mono", variant: "black", x: 6.22, y: 1.16, w: 8.66, h: 7.50 },
    hasHeaderBar: false,
    hasFooter: true,
    contentZone: { x: 0.60, y: 1.00, w: 5.50, h: 5.50 },
  },

  // Content templates
  CONTENT_4: {
    id: 4,
    name: "Two-panel peach/dark",
    bg: TEMPLATE_BG.WHITE,
    panels: [
      { x: 0.00, y: 0.00, w: 6.00, h: 7.50, fill: TEMPLATE_BG.PEACH },
    ],
    headerBar: { x: 0.00, y: 0.34, w: 13.33, h: 0.56, fill: TEMPLATE_BG.DARK },
    logo: { type: "amc_h", variant: "white", x: 10.52, y: 0.26, w: 2.90, h: 0.78 },
    hasFooter: true,
    leftZone:  { x: 0.60, y: 1.10, w: 5.00, h: 5.60 },
    rightZone: { x: 6.30, y: 1.10, w: 6.43, h: 5.60 },
    contentZone: { x: 0.60, y: 1.10, w: 12.13, h: 5.60 },
  },
  CONTENT_5: {
    id: 5,
    name: "Two-panel sage/gold",
    bg: TEMPLATE_BG.WHITE,
    panels: [
      { x: 0.00, y: 0.00, w: 5.80, h: 7.50, fill: TEMPLATE_BG.SAGE },
    ],
    headerBar: { x: 0.00, y: 0.34, w: 13.33, h: 0.56, fill: TEMPLATE_BG.GOLD },
    logo: { type: "amc_h", variant: "black", x: 10.52, y: 0.26, w: 2.90, h: 0.79 },
    hasFooter: true,
    leftZone:  { x: 0.60, y: 1.10, w: 4.80, h: 5.60 },
    rightZone: { x: 6.10, y: 1.10, w: 6.63, h: 5.60 },
    contentZone: { x: 0.60, y: 1.10, w: 12.13, h: 5.60 },
  },
  CONTENT_6: {
    id: 6,
    name: "Full-width sage top + sage bottom",
    bg: TEMPLATE_BG.WHITE,
    panels: [
      { x: 0.00, y: 0.34, w: 13.33, h: 0.56, fill: TEMPLATE_BG.SAGE },
      { x: 0.00, y: 6.97, w: 13.33, h: 0.56, fill: TEMPLATE_BG.SAGE },
    ],
    headerBar: null,
    logo: { type: "amc_h", variant: "black", x: 10.52, y: 0.26, w: 2.90, h: 0.79 },
    hasFooter: true,
    contentZone: { x: 0.60, y: 1.10, w: 12.13, h: 5.60 },
  },
  CONTENT_7: {
    id: 7,
    name: "Full-width peach top only",
    bg: TEMPLATE_BG.WHITE,
    panels: [
      { x: 0.00, y: 0.34, w: 13.33, h: 0.56, fill: TEMPLATE_BG.PEACH },
    ],
    headerBar: null,
    logo: { type: "amc_h", variant: "black", x: 10.52, y: 0.26, w: 2.90, h: 0.79 },
    hasFooter: true,
    contentZone: { x: 0.60, y: 1.10, w: 12.13, h: 5.60 },
  },
  CONTENT_8: {
    id: 8,
    name: "Full-width dark top + dark bottom",
    bg: TEMPLATE_BG.WHITE,
    panels: [
      { x: 0.00, y: 0.34, w: 13.33, h: 0.56, fill: TEMPLATE_BG.DARK },
      { x: 0.00, y: 6.97, w: 13.33, h: 0.56, fill: TEMPLATE_BG.DARK },
    ],
    headerBar: null,
    logo: { type: "amc_h", variant: "white", x: 10.52, y: 0.26, w: 2.90, h: 0.78 },
    hasFooter: true,
    contentZone: { x: 0.60, y: 1.10, w: 12.13, h: 5.60 },
  },
};

// ---- LOGO PATHS ----
// Maps logo type + variant to file path relative to brand-assets
const LOGO_DIR = path.join(__dirname, "..", "..", "lilly-brand-assets-1c344a", "assets", "logos");
const LOGO = {
  amc_h: {
    black: path.join(LOGO_DIR, "Lilly-AMC-Lockup-H-Small-Black-RGB.png"),
    white: path.join(LOGO_DIR, "Lilly-AMC-Lockup-H-Small-White-RGB.png"),
    red:   path.join(LOGO_DIR, "Lilly-AMC-Lockup-H-Small-Red-RGB.png"),
  },
  amc_v: {
    black: path.join(LOGO_DIR, "Lilly-AMC-Lockup-V-Black-RGB.png"),
    white: path.join(LOGO_DIR, "Lilly-AMC-Lockup-V-White-RGB.png"),
    red:   path.join(LOGO_DIR, "Lilly-AMC-Lockup-V-Red-RGB.png"),
  },
  l_mono: {
    black: path.join(LOGO_DIR, "Lilly-L-Monogram-Black-RGB.png"),
    white: path.join(LOGO_DIR, "Lilly-L-Monogram-White-RGB.png"),
    red:   path.join(LOGO_DIR, "Lilly-L-Monogram-Red-RGB.png"),
  },
  script: {
    black: path.join(LOGO_DIR, "Lilly-Script-Black-RGB.png"),
    white: path.join(LOGO_DIR, "Lilly-Script-White-RGB.png"),
    red:   path.join(LOGO_DIR, "Lilly-Script-Red-RGB.png"),
  },
  footer_black: path.join(LOGO_DIR, "logo-blk-footer.png"),
  footer_white: path.join(LOGO_DIR, "logo-script-wht.png"),
};

// ---- FOOTER ----
const FOOTER = {
  // Confidentiality line
  text: "Company Confidential  © 2026 Eli Lilly and Company",
  y: 7.15,
  h: 0.13,
  fontSize: FONT.SIZE_MICRO,
  color: COLOR.TEXT_MUTED,
  // Footer logo (small script mark, bottom-left)
  logo: {
    x: 0.00,
    y: 6.92,
    w: 0.83,
    h: 0.59,
  },
  // Page number position
  pageNum: {
    x: 12.76,
    y: 7.15,
    w: 0.33,
    h: 0.13,
  },
  // Confidentiality line position
  confLine: {
    x: 8.88,
    y: 7.15,
    w: 3.84,
    h: 0.13,
  },
};

// ---- HELPER: Calculate text height ----
// At given fontSize in Calibri: ~110 chars per inch of width, ~0.18" per line at 1.25x
function calcTextHeight(text, width, fontSize, lineSpacing) {
  const sz = fontSize || FONT.NARRATIVE;
  const ls = lineSpacing || LINE.SPACING;
  // Calibri avg char width: ~0.055" at 10pt, scales linearly with size
  const avgCharW = 0.055 * (sz / 10);
  const charsPerLine = Math.floor(width / avgCharW);
  const lineCount = Math.ceil((text || "").length / Math.max(charsPerLine, 1));
  const lineHeight = (sz / 72) * ls;     // convert pt to inches, apply spacing
  return Math.max(lineCount * lineHeight + 0.04, 0.20); // 0.04" padding buffer
}

// ---- HELPER: Calculate KPI card width ----
function calcCardWidth(totalWidth, cardCount) {
  const gaps = (cardCount - 1) * GAP.CARD;
  return (totalWidth - gaps) / cardCount;
}

// ---- HELPER: Calculate table height ----
function calcTableHeight(rowCount) {
  return DIM.TABLE_HEADER_H + (rowCount * DIM.TABLE_ROW_H);
}

// ---- HELPER: Sentiment color ----
function sentimentColor(sentiment) {
  switch ((sentiment || "").toLowerCase()) {
    case "positive": case "good": case "green": return COLOR.DATA_POSITIVE;
    case "negative": case "bad":  case "red":   return COLOR.DATA_NEGATIVE;
    case "caution":  case "warn": case "amber": return COLOR.DATA_CAUTION;
    default: return COLOR.DATA_NEUTRAL;
  }
}

// ---- HELPER: Sentiment tint ----
function sentimentTint(sentiment) {
  switch ((sentiment || "").toLowerCase()) {
    case "positive": case "good": case "green": return COLOR.TINT_POSITIVE;
    case "negative": case "bad":  case "red":   return COLOR.TINT_NEGATIVE;
    case "caution":  case "warn": case "amber": return COLOR.TINT_CAUTION;
    default: return COLOR.TINT_NEUTRAL;
  }
}

module.exports = {
  SLIDE,
  COLOR,
  TEMPLATE_BG,
  CHART_COLORS,
  HEATMAP,
  STAGE_STATE,
  CITATION_CHANNEL,
  FONT,
  LINE,
  GAP,
  DIM,
  SHADOW,
  BORDER_STYLE,
  TEMPLATE,
  LOGO,
  LOGO_DIR,
  FOOTER,
  // Helpers
  calcTextHeight,
  calcCardWidth,
  calcTableHeight,
  sentimentColor,
  sentimentTint,
};

---

## INLINED: components/templates.js

// ============================================================
// templates.js -- 8 Locked Template Layouts
// ============================================================
// Each function: (slide, pres, options?) => { contentZone }
// Renders the template chrome (background, panels, header bar,
// footer, logo, confidentiality line, page number).
// Returns the content zone where components should be placed.
// ============================================================

const fs = require("fs");
const B = require("./brand");

// ---- Logo helper ----
function _addLogo(slide, logoDef) {
  if (!logoDef) return;
  const logoPath = B.LOGO[logoDef.type]?.[logoDef.variant]
    || B.LOGO[logoDef.type];
  if (!logoPath || !fs.existsSync(logoPath)) return;
  slide.addImage({
    path: logoPath,
    x: logoDef.x, y: logoDef.y, w: logoDef.w, h: logoDef.h,
  });
}

// ---- Footer helper ----
function _addFooter(slide, pres, pageNum) {
  // Footer logo (small script, bottom-left)
  const footerLogoPath = B.LOGO.footer_black;
  if (fs.existsSync(footerLogoPath)) {
    slide.addImage({
      path: footerLogoPath,
      x: B.FOOTER.logo.x, y: B.FOOTER.logo.y,
      w: B.FOOTER.logo.w, h: B.FOOTER.logo.h,
    });
  }

  // Page number
  if (pageNum !== undefined && pageNum !== null) {
    slide.addText(String(pageNum), {
      x: B.FOOTER.pageNum.x, y: B.FOOTER.pageNum.y,
      w: B.FOOTER.pageNum.w, h: B.FOOTER.pageNum.h,
      fontSize: B.FONT.SIZE_TINY, fontFace: B.FONT.BODY,
      color: B.COLOR.TEXT_MUTED, align: "right", margin: 0,
    });
  }

  // Confidentiality line
  slide.addText(B.FOOTER.text, {
    x: B.FOOTER.confLine.x, y: B.FOOTER.confLine.y,
    w: B.FOOTER.confLine.w, h: B.FOOTER.confLine.h,
    fontSize: B.FONT.SIZE_MICRO, fontFace: B.FONT.BODY,
    color: B.COLOR.TEXT_MUTED, align: "right", margin: 0,
  });
}

// ---- Slide headline helper ----
// Places the headline on top of the header bar (if present) or below the top panel bar
function _addHeadline(slide, template, headline) {
  if (!headline) return;
  // For two-panel templates, headline sits left of the logo in the header bar
  if (template.headerBar) {
    slide.addText(String(headline), {
      x: 0.60, y: template.headerBar.y + 0.06,
      w: 9.50, h: template.headerBar.h - 0.12,
      fontSize: B.FONT.SIZE_H2, fontFace: B.FONT.HEADING,
      color: B.COLOR.TEXT_ON_DARK, bold: true, margin: 0,
    });
  } else if (template.panels && template.panels.length > 0) {
    // Full-width panel bar: headline overlaid on the top panel
    const topPanel = template.panels[0];
    const isBarDark = topPanel.fill === B.TEMPLATE_BG.DARK;
    slide.addText(String(headline), {
      x: 0.60, y: topPanel.y + 0.06,
      w: 9.50, h: topPanel.h - 0.12,
      fontSize: B.FONT.SIZE_H2, fontFace: B.FONT.HEADING,
      color: isBarDark ? B.COLOR.TEXT_ON_DARK : B.COLOR.TEXT_PRIMARY,
      bold: true, margin: 0,
    });
  }
}

// ============================================================
// Template builder: renders chrome for any template config
// ============================================================
function _renderTemplate(slide, pres, templateDef, options) {
  const opts = options || {};

  // 1. Background
  slide.background = { color: templateDef.bg };

  // 2. Panels (colored regions)
  if (templateDef.panels) {
    for (const panel of templateDef.panels) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: panel.x, y: panel.y, w: panel.w, h: panel.h,
        fill: { color: panel.fill },
      });
    }
  }

  // 3. Header bar
  if (templateDef.headerBar) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: templateDef.headerBar.x,
      y: templateDef.headerBar.y,
      w: templateDef.headerBar.w,
      h: templateDef.headerBar.h,
      fill: { color: templateDef.headerBar.fill },
    });
  }

  // 4. Logo
  _addLogo(slide, templateDef.logo);

  // 5. Footer
  if (templateDef.hasFooter) {
    _addFooter(slide, pres, opts.pageNum);
  }

  // 6. Headline
  _addHeadline(slide, templateDef, opts.headline);

  // Return usable content zones
  return {
    contentZone: templateDef.contentZone,
    leftZone: templateDef.leftZone || null,
    rightZone: templateDef.rightZone || null,
  };
}

// ============================================================
// Public template functions
// ============================================================

// Title templates
function title1(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.TITLE_1, opts);
}
function title2(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.TITLE_2, opts);
}
function title3(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.TITLE_3, opts);
}

// Content templates
function content4(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.CONTENT_4, opts);
}
function content5(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.CONTENT_5, opts);
}
function content6(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.CONTENT_6, opts);
}
function content7(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.CONTENT_7, opts);
}
function content8(slide, pres, opts) {
  return _renderTemplate(slide, pres, B.TEMPLATE.CONTENT_8, opts);
}

// ---- Template selector by ID ----
const TEMPLATE_MAP = {
  1: title1, 2: title2, 3: title3,
  4: content4, 5: content5, 6: content6, 7: content7, 8: content8,
};

function renderTemplate(slide, pres, templateId, options) {
  const fn = TEMPLATE_MAP[templateId];
  if (!fn) throw new Error(`Unknown template ID: ${templateId}`);
  return fn(slide, pres, options);
}

// ---- Flipped two-panel variant ----
// Swaps left/right panel orientation: the colored panel moves to the RIGHT side,
// and the two content zones mirror across the slide so each zone still sits over
// the same surface (the narrative zone stays over the colored panel; the data zone
// stays over the white area), just on the opposite side.
function renderFlipped(slide, pres, templateId, options) {
  const def = templateId === 4 ? B.TEMPLATE.CONTENT_4
            : templateId === 5 ? B.TEMPLATE.CONTENT_5
            : null;
  if (!def) throw new Error(`Only templates 4 and 5 support flipping. Got: ${templateId}`);

  const M = B.SLIDE.MARGIN_X;        // outer content margin (0.60)
  const GUTTER = 0.30;               // gap between the two zones

  // Deep-copy so we never mutate the locked TEMPLATE definition.
  const flipped = JSON.parse(JSON.stringify(def));

  // 1) Move the colored panel to the right side.
  let panelW = 0;
  let panelRightStart = B.SLIDE.W;   // x where the colored panel begins
  if (flipped.panels && flipped.panels[0]) {
    const p = flipped.panels[0];
    panelW = p.w;
    panelRightStart = B.SLIDE.W - p.w;   // panel now spans [SLIDE.W - w, SLIDE.W]
    p.x = panelRightStart;
  }

  // 2) Recompute the two zones from the panel's NEW position (do not reuse the
  //    original x values, which were anchored to the un-flipped left panel).
  //    - narrativeZone (formerly leftZone, lives over the colored panel) -> RIGHT
  //    - dataZone      (formerly rightZone, lives over the white area)   -> LEFT
  const origNarrative = def.leftZone;   // height (and y) we want to preserve
  const origData = def.rightZone;

  // Narrative zone sits inside the colored panel on the right, inset by M on
  // both sides. Always derive the width from the panel itself (not from
  // origNarrative.w, which was sized for the un-flipped layout and can be
  // wider than the flipped panel allows, eating into the M margin).
  const narrativeX = panelRightStart + M;
  const narrativeW = panelW - 2 * M;

  // Data zone fills the white area on the left, from the left margin up to the gutter.
  const dataX = M;
  const dataW = panelRightStart - GUTTER - M;

  flipped.leftZone = { x: narrativeX, y: origNarrative.y, w: narrativeW, h: origNarrative.h };
  flipped.rightZone = { x: dataX, y: origData.y, w: dataW, h: origData.h };

  return _renderTemplate(slide, pres, flipped, options);
}

module.exports = {
  title1, title2, title3,
  content4, content5, content6, content7, content8,
  renderTemplate,
  renderFlipped,
};

---

## INLINED: references/brief-template.md

# Executive Decision Brief Template

## Purpose
A one-page written artifact that executives can:
- Review quickly (2-3 minutes)
- Forward for approval via email
- Use as official decision record
- Reference in governance documentation

## Format Requirements

| Attribute | Requirement |
|-----------|-------------|
| Length | **One page maximum** (no exceptions) |
| Margins | 0.75" - 1" |
| Font | 10-11pt body, 12-14pt headers |
| Spacing | Single or 1.15 |
| Format | Professional letterhead or memo format |

---

## Template Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [COMPANY LOGO/LETTERHEAD]                                              │
│                                                                         │
│  EXECUTIVE DECISION BRIEF                                               │
│  [Initiative Name] - Supplier Selection                                 │
│  Date: [Date]                                                           │
│  Prepared by: [Name, Title]                                             │
│  For: [Decision Authority/Committee]                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DECISION SUMMARY                                                       │
│  ─────────────────────────────────────────────────────────────────────  │
│  [2-3 sentences: What decision is needed and why it's needed now.       │
│  Include the trigger and consequence of inaction.]                      │
│                                                                         │
│  RECOMMENDATION                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  We recommend [Supplier Name] for [Initiative] based on:               │
│  • [Key reason 1 - e.g., "Highest evaluation score (4.2/5.0)"]         │
│  • [Key reason 2 - e.g., "Strongest pharma industry fit"]              │
│  • [Key reason 3 - e.g., "Best total cost of ownership"]               │
│                                                                         │
│  [1 sentence on strategic alignment]                                    │
│                                                                         │
│  FINANCIAL SNAPSHOT                                                     │
│  ─────────────────────────────────────────────────────────────────────  │
│  ┌──────────────────────┬──────────────────────────────────────────┐   │
│  │ Total Investment     │ $X.XM over X years                       │   │
│  │ Annual Cost          │ $XXX,XXX (Year 1) / $XXX,XXX (ongoing)  │   │
│  │ Expected Savings     │ $XXX,XXX annually                        │   │
│  │ Payback Period       │ X.X years                                │   │
│  │ Budget Status        │ Funded / Requires allocation             │   │
│  └──────────────────────┴──────────────────────────────────────────┘   │
│                                                                         │
│  KEY RISKS                                                              │
│  ─────────────────────────────────────────────────────────────────────  │
│  1. [Risk]: [One-line mitigation]                                       │
│  2. [Risk]: [One-line mitigation]                                       │
│  3. [Risk]: [One-line mitigation]                                       │
│                                                                         │
│  CONDITIONS                                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  Approval is subject to:                                                │
│  • [Condition 1 - e.g., "Legal approval of contract terms"]            │
│  • [Condition 2 - e.g., "Security sign-off"]                           │
│  • [Condition 3 - e.g., "Final pricing within budget"]                 │
│                                                                         │
│  APPROVAL REQUESTED                                                     │
│  ─────────────────────────────────────────────────────────────────────  │
│  ☐ Approve selection of [Supplier] for [Initiative]                    │
│  ☐ Authorize contract negotiation to proceed                           │
│  ☐ Confirm budget allocation of $X.XM                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Approved: _________________ Date: _________ Title: ___________ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Attachments: Full Evaluation Report, Scoring Matrix (available upon   │
│  request)                                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Section-by-Section Guidance

### Decision Summary
**Length:** 2-3 sentences
**Content:**
- What decision is being requested
- Why it's needed now (trigger)
- Consequence of delay or inaction

**Example:**
> "We are requesting approval to select Vendor B as our enterprise third-party risk management platform. Current manual processes cannot scale to meet Q3 regulatory audit requirements. Delay past April will result in audit findings and potential remediation costs of $500K+." (illustrative)

### Recommendation
**Length:** 3 bullets + 1 sentence
**Content:**
- Supplier name
- Top 3 reasons (quantified where possible)
- Strategic alignment statement

**Example:**
> We recommend **Vendor B** for Enterprise TPRM based on:
> - Highest evaluation score (4.2/5.0) across 45 requirements
> - Strongest pharma/life sciences industry positioning with PHI focus
> - Third-Party Risk Exchange reduces assessment workload by 40%
> 
> This selection aligns with our digital transformation strategy and GRC platform consolidation initiative.

### Financial Snapshot
**Format:** Table preferred for scannability
**Required Elements:**
- Total investment (full contract term)
- Annual cost breakdown
- Expected savings/value (if quantified)
- Payback period (if calculated)
- Budget status

**If financials incomplete:**
> "Financial analysis in progress. Estimated range: $X-$Y. Final TCO to be confirmed during negotiation."

### Key Risks
**Length:** Exactly 3 risks on the one-page brief (no more, no less). This holds for every tone, including Conservative. Additional risks live in the deck's Risk Register / Risk Profile slide, not on the one-pager.
**Format:** Risk: Mitigation (one line each)

**Example:**
> 1. **Implementation delay:** Phased rollout with milestone-based payments
> 2. **Integration complexity:** Technical validation completed pre-contract
> 3. **User adoption:** Change management plan with executive sponsorship

### Conditions
**Length:** 2-4 conditions
**Content:** What must happen for this approval to be effective

**Example:**
> Approval is subject to:
> - Legal approval of negotiated contract terms
> - CISO sign-off on security assessment
> - Final pricing within approved $2.5M budget envelope

### Approval Requested
**Format:** Checkbox list + signature block
**Content:**
- Specific approvals being requested
- Space for signature, date, title

---

## Tone Variations

### Conservative/Risk-Focused Version
- Lead Recommendation section with risk mitigation
- The one-page brief still carries EXACTLY 3 Key Risks (the one-pager constraint never changes); pick the 3 highest-severity risks and put the rest in the deck's Risk Register / Risk Profile slide, which a Conservative tone may expand to 4-5. Do not exceed 3 on the one-pager.
- Add qualifier: "Recommended as the lowest-risk option among evaluated alternatives"
- Conditions section more prominent

### Strategic/Value-Focused Version
- Lead with business value and opportunity
- Financial Snapshot emphasizes ROI and savings
- Risks framed as "manageable" with confidence
- Add strategic alignment callout

### Balanced Version (Default)
- Equal weight to value and risk
- Neutral professional tone
- Let the facts speak

---

## Common Mistakes to Avoid

| Mistake | Correction |
|---------|------------|
| Too much detail | Compress ruthlessly; link to full report |
| Burying the ask | Lead with decision requested |
| Vague financials | Use specific numbers or state "TBD" |
| Too many risks | Pick top 3; put rest in appendix |
| Missing conditions | Always include approval contingencies |
| No signature block | Always include for governance trail |
| Exceeds one page | Edit until it fits; no exceptions |

---

## Email Cover Note (When Forwarding Brief)

When sending the brief for approval, include a brief email:

```
Subject: Decision Brief: [Initiative] Supplier Selection - Approval Requested

[Name],

Attached is the decision brief for [Initiative] supplier selection. 

Summary: We recommend [Supplier] at $X.XM over X years, pending [key condition].

The full evaluation report is available upon request.

Please reply with your approval or let me know if you have questions.

[Signature]
```

---

## INLINED: references/deck-structure.md

# Executive Decision Deck Structure

> **Styling note (content guidance only, not styling).** Use this doc for per-slide content ideas only. For all typography and color values, use `brand.js` and the BRAND ENFORCEMENT LAYER in SKILL.md: the active typography is **Georgia** (display headings) and **Calibri** (body) at the sizes in `brand.js` (titles 32pt, body 11pt, etc.); the active color palette is the brand palette in `brand.js` with the suite no-green rule (the only sanctioned green/teal is the Slide-Template SAGE panel fill). The ASCII-art slide mockups below are layout sketches, not the rendered output; real slides are built with `templates.js` + `brand.js` per the BRAND ENFORCEMENT LAYER in SKILL.md.

## Deck Specifications

| Attribute | Requirement |
|-----------|-------------|
| Slide count | 10-15 slides (excluding appendix) |
| Aspect ratio | 16:9 widescreen (LAYOUT_WIDE, 13.33" x 7.5") |
| Font / text size / colors | Use `brand.js` and the BRAND ENFORCEMENT LAYER in SKILL.md; do not use values from this doc. |

---

## Slide 1: Decision Ask (Always First)

### Purpose
Immediately orient the audience to what is being requested. No buildup.

### Headline Formula
`"Approve [Action] for [Initiative]"`

Examples:
- "Approve Selection of Vendor B for Third-Party Risk Management"
- "Authorize $2.4M Contract with Vendor A for GRC Platform"
- "Proceed to Final Negotiation with ProcessUnity"

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  APPROVE SELECTION OF [SUPPLIER] FOR [INITIATIVE]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Decision Requested:                                        │
│  • [Specific approval being sought]                         │
│  • Contract value: $X.XM over X years                       │
│                                                             │
│  If Approved:                          If Delayed:          │
│  • [Outcome 1]                         • [Risk 1]           │
│  • [Outcome 2]                         • [Risk 2]           │
│  • Target start: [Date]                • [Cost of delay]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Do's and Don'ts
✅ State the ask in the headline
✅ Include contract value if known
✅ Show consequences of delay
❌ Don't bury the ask in body text
❌ Don't start with background

---

## Slide 2: Business Context & Why Now

### Purpose
Establish urgency and relevance. Answer "Why should I care about this today?"

### Headline Formula
`"[Problem/Opportunity] Requires Action Now"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  [PROBLEM/OPPORTUNITY] REQUIRES ACTION NOW                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Current State:              │  Trigger for Decision:       │
│  • [Pain point 1]            │  • [Why now - deadline]      │
│  • [Pain point 2]            │  • [Why now - risk event]    │
│  • [Pain point 3]            │  • [Why now - opportunity]   │
│                              │                              │
│  ─────────────────────────────────────────────────────────  │
│  Impact of Inaction: [Quantified consequence]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Current state pain (brief, quantified if possible)
- Trigger: What makes this decision timely?
  - Regulatory deadline
  - Contract expiration
  - Risk event
  - Strategic initiative
  - Budget cycle
- Cost of inaction (quantified)

---

## Slide 3: Options Considered

### Purpose
Show due diligence. Demonstrate that alternatives were evaluated.

### Headline Formula
`"[X] Suppliers Evaluated; [Y] Advanced to Final Consideration"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  3 SUPPLIERS EVALUATED; 1 RECOMMENDED                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │  Vendor B    │  Vendor A    │  ProcessUnity │            │
│  │  ★ RECOMMENDED│              │               │            │
│  ├──────────────┼──────────────┼──────────────┤            │
│  │  Score: 4.2  │  Score: 3.8  │  Score: 3.6  │            │
│  │  Best fit    │  Strong #2   │  Viable      │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
│  Evaluation: RFP with 45 requirements, 3 demos, 2 rounds   │
│                                                             │
│  Why Others Not Selected:                                   │
│  • Vendor A: Higher cost, less pharma-specific             │
│  • ProcessUnity: Smaller company, integration concerns     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Visual comparison (2-4 finalists)
- One-line evaluation methodology
- Brief elimination rationale for non-selected options
- No detailed scores (save for appendix)

---

## Slide 4: Recommended Supplier

### Purpose
Introduce the recommended supplier with strategic framing.

### Headline Formula
`"[Supplier]: [One-Line Value Proposition]"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  VENDOR B: BEST-FIT SOLUTION FOR ENTERPRISE TPRM           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                        │
│  │   [Supplier     │   Company Profile:                     │
│  │    Logo]        │   • Headquarters: Atlanta, GA          │
│  │                 │   • Employees: 2,500+                   │
│  └─────────────────┘   • Revenue: $500M+ ARR                │
│                        • Customers: 14,000+ globally        │
│                                                             │
│  Why Vendor B:                                              │
│  ✓ Strongest pharma/life sciences positioning              │
│  ✓ Third-Party Risk Exchange (18K+ assessments)            │
│  ✓ Integrated privacy & compliance platform                │
│  ✓ Proven enterprise scale                                  │
│                                                             │
│  Strategic Alignment:                                       │
│  "[How this supports company strategy in 1-2 sentences]"   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Supplier credibility markers (size, customers, financials)
- 3-4 key differentiators (why this one)
- Strategic alignment statement

---

## Slide 5: Evaluation Summary

### Purpose
Provide confidence in the rigor of evaluation without overwhelming detail.

### Headline Formula
`"[Supplier] Scored Highest Across Key Criteria"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  VENDOR B SCORED HIGHEST ACROSS KEY CRITERIA               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [VISUAL: Horizontal bar chart or radar chart]             │
│                                                             │
│  Category        Vendor B   Vendor A     ProcessUnity      │
│  ────────────────────────────────────────────────────      │
│  Functional      ████████░░  ███████░░░   ██████░░░░       │
│  Technical       ███████░░░  ████████░░   ██████░░░░       │
│  Security        ████████░░  ███████░░░   ███████░░░       │
│  Commercial      ███████░░░  ██████░░░░   ████████░░       │
│  ────────────────────────────────────────────────────      │
│  OVERALL         4.2         3.8          3.6              │
│                                                             │
│  Key Differentiators:                                       │
│  • Pharma industry fit: Vendor B significantly stronger    │
│  • Assessment network: Vendor B's exchange is largest      │
│  • Integration: Vendor A leads, but Vendor B adequate      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Visual comparison (chart preferred over table)
- Interpretive summary, not raw scores
- 2-3 key differentiators highlighted
- Do NOT include full scoring matrix (appendix only)

---

## Slide 6: Financial Impact

### Purpose
Quantify the decision. Show total cost and value.

### Headline Formula
`"$[X]M Investment Delivers [Value Statement]"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  $2.4M INVESTMENT OVER 5 YEARS; $800K ANNUAL SAVINGS       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cost Summary:                    Value Drivers (annual):   │
│  ┌────────────────────────┐      • Labor savings: $500K/yr │
│  │ Year 1: $800K          │      • Risk reduction: $200K/yr│
│  │ Year 2: $400K          │      • Compliance avoid:$100K/yr│
│  │ Year 3: $400K          │      ──────────────────────────│
│  │ Year 4: $400K          │      Total savings: $800K/yr   │
│  │ Year 5: $400K          │      Payback: 3.0 years        │
│  ├────────────────────────┤      5-Year NPV: $1.2M         │
│  │ TOTAL: $2.4M           │      (illustrative)            │
│  └────────────────────────┘                                │
│                                                             │
│  Budget Status: ✓ Funded in FY26 IT Capital Plan           │
│                                                             │
│  Payback basis: $800K/yr savings vs $2.4M cumulative cost;  │
│  net cumulative turns positive at end of Year 3 (3.0 yrs).  │
│                                                             │
│  Key Assumptions:                                           │
│  • 100 users Year 1, growing to 250 by Year 3              │
│  • Implementation includes data migration                   │
│  • Excludes integration development (separate budget)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **Numbers-reconcile note (for any cloner of this example).** This illustrative slide must foot before use. Here: cost = $800K + 4 x $400K = $2.4M total (matches TOTAL). Annual value drivers = $500K + $200K + $100K = $800K (matches the headline "$800K annual savings"). Payback is stated WITH its basis (cumulative savings vs cumulative cost), so the 3.0-year figure is traceable, not asserted. NPV is labeled illustrative because the discount rate is not given in this example. Never ship a Financial Impact slide whose value drivers, totals, and payback do not reconcile; recompute and show the basis.

### Key Elements
- Total cost (not just Year 1)
- Value/savings quantified, and the value drivers must SUM to the headline annual-savings figure
- Payback period or NPV if calculated, stated WITH its basis (so it is traceable, never an unexplained number)
- Budget status (funded/unfunded)
- Assumptions explicitly stated

### If Financials Not Provided
```
Financial analysis pending. Estimated range: $X-$Y based on 
comparable implementations. Full TCO to be validated during 
contract negotiation.
```

---

## Slide 7: Risk Profile

### Purpose
Demonstrate awareness of risks. Show mitigation plans.

### Headline Formula
`"[X] Key Risks Identified; Mitigation Plans in Place"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  4 KEY RISKS IDENTIFIED; MITIGATION PLANS IN PLACE         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Risk                  Severity   Mitigation                │
│  ─────────────────────────────────────────────────────────  │
│  Implementation        ●●●○○      Phased rollout; dedicated │
│  timeline slippage     Medium     PM; milestone payments    │
│                                                             │
│  Integration           ●●○○○      Pre-contract technical    │
│  complexity            Low        validation; API review    │
│                                                             │
│  Vendor financial      ●●○○○      Strong ARR ($500M+);      │
│  stability             Low        escrow for source code    │
│                                                             │
│  User adoption         ●●●○○      Change management plan;   │
│                        Medium     executive sponsorship     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  No HIGH severity risks identified.                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Top 3-5 risks only (not exhaustive list)
- Severity indicator (visual)
- One-line mitigation for each
- Overall risk posture statement

### Risk Categories to Consider
- Implementation / Delivery
- Integration / Technical
- Vendor stability / Financial
- Security / Compliance
- Adoption / Change management
- Contractual / Legal

---

## Slide 8: Contract & Commercial Considerations

### Purpose
Set expectations for negotiation. Flag approval dependencies.

### Headline Formula
`"Contract [Ready for Signature / Requires Negotiation]"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  CONTRACT REQUIRES 3-4 WEEKS NEGOTIATION                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MSA Status:                                                │
│  • Supplier provided standard terms                         │
│  • Legal redline complete; 12 items in negotiation         │
│  • No deal-breakers identified                              │
│                                                             │
│  Key Negotiation Items:           Resolution Path:          │
│  • Liability cap                  Standard escalation       │
│  • Data processing terms          DPA template accepted     │
│  • Termination for convenience    Likely to resolve         │
│  • Price protection (Years 2-5)   BAFO addressed this       │
│                                                             │
│  Negotiation Complexity: MEDIUM                             │
│  Estimated Timeline: 3-4 weeks post-approval                │
│                                                             │
│  Dependencies:                                              │
│  • Security review: Complete ✓                              │
│  • Privacy review: In progress (ETA: 1 week)               │
│  • Legal approval: Pending negotiation                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- MSA status (ready / in negotiation / not started)
- Key terms requiring negotiation
- Complexity assessment
- Timeline estimate
- Approval dependencies

---

## Slide 9: Implementation Approach

### Purpose
Show the path forward. Build confidence in executability.

### Headline Formula
`"[X]-Month Implementation; Go-Live [Target Date]"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  6-MONTH IMPLEMENTATION; GO-LIVE SEPTEMBER 2026            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [VISUAL: Timeline/Gantt chart]                            │
│                                                             │
│  Mar    Apr    May    Jun    Jul    Aug    Sep             │
│  ├──────┼──────┼──────┼──────┼──────┼──────┤              │
│  │ Kickoff &   │ Config &    │ UAT &      │ Go-Live       │
│  │ Discovery   │ Integration │ Training   │               │
│  └─────────────┴─────────────┴────────────┘               │
│                                                             │
│  Key Milestones:                 Internal Ownership:        │
│  • Kickoff: Mar 15              • Executive Sponsor: [TBD]  │
│  • Config complete: May 30      • Project Lead: [TBD]       │
│  • UAT start: Jul 1             • IT Lead: [TBD]            │
│  • Training: Aug 1-31           • Business Lead: [TBD]      │
│  • Go-Live: Sep 15                                          │
│                                                             │
│  Success Criteria:                                          │
│  • 95% user adoption within 90 days                         │
│  • All critical integrations operational                    │
│  • No P1 defects at go-live                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Visual timeline
- Key milestones with dates
- Internal ownership (roles, not names if unknown)
- Success criteria

---

## Slide 10: Decision Gates & Conditions

### Purpose
Make approval contingencies explicit. No surprises.

### Headline Formula
`"Approval Contingent on [X] Conditions"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  APPROVAL CONTINGENT ON 4 CONDITIONS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This approval is subject to:                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Legal approval of final contract terms           │   │
│  │    Owner: General Counsel  │  Target: +3 weeks      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2. Security sign-off on vendor assessment           │   │
│  │    Owner: CISO            │  Target: +1 week        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 3. Final pricing within approved budget envelope    │   │
│  │    Owner: Procurement     │  Target: +2 weeks       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 4. CFO approval for capital expenditure             │   │
│  │    Owner: Finance         │  Target: This meeting   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  If conditions not met by [Date]:                           │
│  Decision will return to [Committee] for reassessment.     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Numbered list of conditions
- Owner for each condition
- Target resolution date
- Consequence if conditions not met

---

## Slide 11: Recommendation Recap

### Purpose
Close with clear action. Make approval easy.

### Headline Formula
`"Recommendation: Approve [Action]"`

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  RECOMMENDATION: APPROVE VENDOR B SELECTION                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  We recommend approval of Vendor B as the           │   │
│  │  enterprise TPRM solution.                          │   │
│  │                                                     │   │
│  │  • Best fit for pharma requirements                 │   │
│  │  • Strongest evaluation score (4.2/5.0)             │   │
│  │  • $2.4M investment; 3.0-year payback               │   │
│  │  • Manageable risk profile                          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Decision Requested:                                        │
│  ☐ Approve selection of Vendor B                           │
│  ☐ Authorize contract negotiation to proceed               │
│  ☐ Confirm budget allocation ($2.4M / 5 years)             │
│                                                             │
│  Next Step: Contract execution targeting [Date]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- Restate recommendation (1-2 sentences)
- Key supporting points (3-4 bullets)
- Explicit approval checkboxes
- Immediate next step

---

## Additional Slide Types (v2.3)

The two entries below are types #36 and #37 in the SKILL.md SLIDE TYPE LIBRARY (37 types). They are optional, like every other library entry: the storyboard proposes them only when the input and arc call for them, and the user approves them at the Step 3 gate like any other slide.

## Additional Slide Type: Final Recommendation (For/Against + Path to Award) -- Slide Type #36

### Purpose
One slide that combines the recommendation, the head-to-head for/against defense of that choice, and exactly where the decision sits in a formal multi-stage award process. Use it in place of, or directly before, Slide 10/11 when the audience needs the process-rigor view in one frame, most commonly a Procurement Council or Board gated by a named committee sequence.

### Headline Formula
`"[Supplier]: Recommended for Award, Stage [N] of 4"`

Examples:
- "Vendor B: Recommended for Award, Stage 3 of 4 (Group Decision)"
- "Recommend Vendor B for Award: 2 of 4 Committee Gates Cleared"

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  VENDOR B: RECOMMENDED FOR AWARD, STAGE 3 OF 4               │
├─────────────────────────────────────────────────────────────┤
│  FOR / AGAINST                    │  RECOMMENDATION           │
│                                    │                           │
│  Vendor B          [RECOMMENDED]  │  We recommend award to    │
│  For: Pharma fit, largest TPRM    │  Vendor B.                │
│  exchange, proven scale           │                           │
│  Against: Premium price point     │  - Highest evaluation     │
│                                    │    score (4.2 / 5.0)      │
│  Vendor A        [NOT SELECTED]   │  - Strongest pharma /     │
│  For: Best integration depth      │    life-sciences fit      │
│  Against: Weaker pharma fit,      │  - $2.4M / 5yr, 3.0-yr    │
│  higher cost                      │    payback                │
│                                    │  - Manageable risk        │
│  ProcessUnity    [NOT SELECTED]   │    profile                │
│  For: Lowest cost                 │                           │
│  Against: Smaller company,        │                           │
│  integration concerns             │                           │
│  ──────────────────────────────── │                           │
│  PATH TO AWARD                    │                           │
│  [Advisory]-[Panel]-[Group*]-[Award]                          │
│   Passed    Passed   Current  Upcoming                        │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- For/Against is per finalist, not a generic pros/cons list; 2-3 bullets each side, sourced from the same evaluation data as Slide 3 (Options Considered) and Slide 5 (Evaluation Summary), never re-derived independently
- Verdict pill uses the suite's status palette: Recommended = Bold Blue text / Neutral Sky background, Not Selected = Bold Grey text / Neutral Stone background. Never a green "winner" tag
- The Path-to-Award stage bar is always exactly 4 segments (Advisory Review, Panel Scoring, Group Decision, Award). Do not add or remove stages to fit a shorter process; collapse a skipped stage into "Passed" instead and say so in the speaker notes
- Current-stage index is a declared or inferred input (user-declared or read from uploaded committee notes/correspondence), never guessed. If unknown, render all 4 segments Upcoming with a labeled callout ("Award stage not yet confirmed"), per the honesty guardrail
- The Recommendation column restates only what earlier slides already established (score, financial case, risk posture); it does not introduce new figures

### Where it fits
Optional. Swap for Slide 5 (Recommended Supplier) or insert directly before Slide 10 (Decision Gates & Conditions) when the arc is Preset A (RFP Award Decision) and the award runs through a named multi-stage committee. Template 4 or 5, flipped, per the Slide Composition Guide in SKILL.md. State the swap in the storyboard for approval like any other slide choice.

---

## Additional Slide Type: Convergence Network / Evidence Basis -- Slide Type #37 (Appendix A6)

### Purpose
Show that every material claim in the deck traces to a real, dated, confidence-flagged source, for audiences (Procurement Council, Board, Legal) that will ask "how do we know that." This turns the skill's existing citation and honesty-guardrail requirements into a single visual instead of leaving them as inline footnotes scattered across slides. Not a live interactive graph: this skill ships static PPTX, so the "network" is rendered as a citation-grouped table, not a force-directed diagram.

### Headline Formula
`"[N] Key Claims, [M] Independently Sourced Citations"`

Examples:
- "11 Key Claims, 19 Independently Sourced Citations"
- "Recommendation Rests on Sources Across 4 Channels; 2 Claims Flagged Medium Confidence"

### Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│  11 KEY CLAIMS, 19 INDEPENDENTLY SOURCED CITATIONS            │
├─────────────────────────────────────────────────────────────┤
│  CLAIMS         SOURCED    CHANNELS   FLAGGED (<2 sources)    │
│    11             11          4              2                │
├─────────────────────────────────────────────────────────────┤
│  Claim                          Email  Doc  ARIA  Web  Conf.  │
│  ─────────────────────────────────────────────────────────   │
│  Vendor B scores highest          1     2     1    -   High   │
│  overall (4.2/5.0)                                             │
│  $2.4M investment, 3.0-yr         -     1     2    -   High   │
│  payback                                                       │
│  Vendor B's exchange is the       -     -     -    1   Med    │
│  largest in the category                                      │
│  No HIGH-severity risks           1     2     -    -   High   │
│  identified                                                    │
│  (7 additional claims, same format)                           │
│  ─────────────────────────────────────────────────────────   │
│  9 of 11 claims carry 2+ independent sources. The 2 below the │
│  bar (market-exchange size, one risk item) rest on a single   │
│  web source each and are flagged Medium confidence pending    │
│  validation, not asserted as fact.                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Elements
- One row per material claim actually made elsewhere in the deck (the recommendation, the financial case, the top risks), not every sentence in the storyboard
- Citation chips grouped by channel (email, document, ARIA figure, web source) using the `CITATION_CHANNEL` colors from `brand.js`; a chip's count is the number of distinct sources of that type backing the claim, never a re-count of the same source
- Confidence dot per claim: High (Bold Blue), Medium (Amber), Low (Lilly Red). Never green, matching the suite's canonical confidence convention
- Narrative callout beneath the table (P2) explicitly names which claims fall below the 2-source bar, so the gap is visible rather than buried
- A claim with zero traceable citations in the approved storyboard is labeled "Not yet sourced" in the Sourced column, not silently omitted from the table
- Belongs in the appendix by default (Appendix A6); promote it into the main deck only when the audience specifically wants a sourcing-rigor slide up front (Board, Legal-heavy review)

---

## Appendix Slides (Optional)

Include only if audience may want detail. Keep out of main flow.

### A1: Detailed Scoring Matrix
- Full criterion-level scores
- All suppliers compared

### A2: Supplier Comparison Detail
- Extended profiles
- Capability-by-capability comparison

### A3: Risk Register
- Complete risk list with all mitigations
- Risk ownership

### A4: Financial Model Backup
- Detailed cost buildup
- Assumption details
- Sensitivity analysis

### A5: Implementation Plan Detail
- Full milestone list
- Resource requirements
- Dependency map

### A6: Evidence & Citation Basis
- Full claim-by-claim citation table (Slide Type #37, Convergence Network / Evidence Basis)
- Every material claim in the deck with its supporting sources grouped by channel and a confidence flag
- See "Additional Slide Type: Convergence Network / Evidence Basis" above for the full spec

