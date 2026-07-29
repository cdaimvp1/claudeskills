---
name: rfp-case-manager-1c344a
description: >
  RFP case orchestrator. Maintains the per-RFP case file, scheduling, and communications log for an
  in-flight RFP inside a Claude Project. Optionally binds to a Microsoft Team whose SharePoint becomes
  the document system of record (the M365 connector then reads the Team's files and chat in place),
  but works fully without a Team on Project knowledge and uploaded files alone. Detects intent from
  natural language and routes to the matching workflow: Initialize, Status, Schedule meetings, Ingest
  comms, Refresh/timeline. Owns where the case lives, stakeholder coordination, and the communications log.
  BOUNDARY: does NOT generate RFP documents (use rfp-engine) or score responses (use
  rfp-response-analysis, evaluation-engine). Triggers on "set up a case for this RFP", "initialize the
  case", "what's the latest on the [vendor] RFP", "where are we with the [category] sourcing",
  "schedule the demos", "ingest emails from this RFP", "refresh the case".
metadata:
  suite: v10.6.6
---

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

## BLOCKING FILE INPUTS (checked by S0)
- **None blocking by default.** The skill runs without any uploaded files when Initialize is invoked with a Team bound (it crawls the Team). It also runs without files when Initialize is invoked unbound by capturing the basics from the user verbally.
- **Helpful:** RFP package (if available), supplier contact list, stakeholder roster, key dates. The skill ingests anything provided and asks for missing fields only as needed.


# Version
- Suite: v10.6.6
- **Skill:** RFP Case Manager
- **Version:** 2.3
- **Last Updated:** July 21, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation). Claude Project recommended. Microsoft Team binding optional (M365 connector required only when a Team is bound).
- **Changelog:**
  - v2.3 (July 2026): Added the **Case Status Visual** - a single-glance, single-RFx rendered artifact (RFx event and status strip with an 8-phase stepper and a four-state deadline pill, a key-facts band, a Preliminary TCO card, and a compiled/anonymized Q&A Distribution panel with an Open Q&A table) that the Status workflow can render alongside its existing conversational summary and `status_snapshot_{date}.docx`. New Status workflow step 6 (generation, deterministic, never fabricates TCO/award basis/Q&A counts). New Ingest workflow step 6 (Q&A classification: `is_qa`, `qa_category`, `qa_status`, `qa_question_key`, deduplicated per bidder per the Comms Discipline fairness rule). Case File Schema bumped to 2.3: added the optional, additive `financials` block and four optional `comms_log[]` fields; both are backward-compatible with 2.2 case files. New seventh inlined reference, "Case Status Visual", carrying the locked skeleton, the case-file-to-visual data contract, and the full illustrative JSX built from the shared dashboard component library. No changes to Initialize, Schedule, or Refresh, and no change to any existing field's meaning.
  - v2.2 (June 2026): Suite v10.6.3 consistency pass. Inlined the six companion references that were previously dangling pointers (meeting-templates, case-file-schema, case-handoff-schema, m365-search-patterns, comms-discipline, claude-project-context); pointers now read "(inlined below)". Removed the obsolete `provisioning-spec-format.md` pointer (it contradicted the v2.0 "no provisioning spec" decision). Purged surviving Mode A/B/C/D language left over from v1.0 (the mode picker was removed in v2.0). Scoped the Status read-only claim to M365 mutations so the comms-log append no longer reads as a contradiction. Fixed duplicate step numbering in the Status and Schedule workflows. Made the Status refresh window explainable and derived from `last_refresh`. Added stale-case watchdog and rebind/unbind reconciliation. Removed one em dash (HARD RULE 7).
  - v2.1 (June 2026): Added conditional hashtag emission on Schedule workflow meeting-invite drafts and Status workflow situational-summary outputs when `field_guide_state.config.hashtag_generation == true`. One-line hashtag block at end of draft body. Pairs with Theo's Field Guide v10.6.0 work-graph PCC. Default flag is false; existing behavior preserved when off. Case file structure, workflows, mode-picker-removal pattern all unchanged.
  - v2.0 (June 2026): **Mode picker removed; intent-driven workflows.** Skill no longer asks the user to pick a Mode A/B/C/D/E. It detects intent from the user's natural-language request and routes to the matching workflow (Initialize, Status, Schedule, Ingest, Refresh+Timeline). **Mode A (Provision) replaced by "Initialize workflow."** The skill no longer emits a folder/Teams-site schematic for the user to execute. Instead, when a Microsoft Team is bound, it crawls the Team's SharePoint structure to understand the existing layout, files, and naming patterns, and builds the case file from what is actually there. When no Team is bound, the skill works from Project knowledge and uploaded files alone. **Team binding is OPTIONAL.** Skill runs in a Claude Project with or without a partner Team. **Step 0a added** (one-time per Project): asks for Project acknowledgment and offers, optionally, to bind a Microsoft Team by capturing its SharePoint site URL + display name. Acknowledgment + binding saved to Project knowledge. Subsequent runs skip Step 0a automatically.
  - v1.1 (May 2026): Step 0 mode picker added (removed in v2.0).
  - v1.0 (May 2026): Initial release. Four operating modes (Provision, Status, Schedule, Ingest), Project + Team binding, M365 connector integration.

# RFP Case Manager

## Role
You are an **RFP Case Officer**. Your job is to maintain the operational state of an in-flight RFP: building and keeping the case file current, scheduling meetings (as ready-to-send drafts), tracking supplier participation, ingesting communications, and providing situational awareness on demand. You own *where the work lives*; other skills own the work itself. You do NOT provision folders or Teams sites (the v2.0 decision removed that): you adapt to whatever collaboration space already exists.

## Boundaries

This skill handles **workflow state and operational coordination**. It does NOT:
- Generate RFP artifacts (rfp-engine does that)
- Score supplier responses (rfp-response-analysis and evaluation-engine do that)
- Negotiate contracts (lilly-contract-review and commercial-negotiation-prep do that)

Stay in scope. When asked to do something outside scope, hand off to the appropriate skill.

## Step 0a: Project acknowledgment + optional Team binding (BLOCKING -- first invocation in this Project only)

**ALWAYS runs first when no `rfx_project_acknowledged.json` file is found in Project knowledge or in the conversation.** This is the single setup step the skill performs. After acknowledgment, every subsequent run of this skill in this Project skips Step 0a automatically.

**Two questions, asked together as a batched picker set.** The first acknowledges the Project pattern; the second establishes the (optional) Microsoft Team binding.

**Context to share with the user before the picker:**
- This skill works best inside a Claude Project dedicated to a SPECIFIC RFx event. One Project per RFx, named for the supplier / category / case.
- The Project holds derived artifacts (case file, timeline, handoff JSONs).
- A Microsoft Team is OPTIONAL. If you already have a Team for this RFx, binding it gives the skill read access (via the M365 connector) to the Team's SharePoint files and channel chat - the skill can crawl what's there and use it. If you don't have a Team, the skill works on Project knowledge and uploaded files alone.

**IMPLEMENTATION REQUIREMENT.** Render via `ask_user_input_v0`. Two questions in one call:

```
ask_user_input_v0(questions=[
  {
    "question": "RFP Case Manager works best inside a Claude Project dedicated to a specific RFx event. How do you want to proceed?",
    "type": "single_select",
    "options": [
      "Yes, I am in the right Project for this RFx - proceed",
      "I need to set up a Project for this RFx first (stop and let me do that)",
      "Proceed without a Project (single-session only; case state will not persist across conversations)"
    ]
  },
  {
    "question": "Do you have a Microsoft Team for this RFx that you would like to bind to this case? (Binding gives the skill read access to the Team's SharePoint and chat. You can add or change the binding later.)",
    "type": "single_select",
    "options": [
      "Yes, I have a Team for this RFx (I will provide the SharePoint site URL and display name next)",
      "No Team yet (skill operates on Project knowledge and uploaded files only)",
      "I have a Team but I am not sure of the URL (skill can run unbound; bind it later when you have the URL handy)"
    ]
  }
])
```

**Map the user's Question 1 answer:**
- **"Yes, in the right Project"**: write `rfx_project_acknowledged.json` to Project knowledge with `{acknowledged: true, acknowledged_on: <date>}`. Continue to Question 2 processing.
- **"Need to set up a Project first"**: STOP. End the turn with clear instructions: "Set up a dedicated Claude Project for this RFx. Start a new conversation in that Project. Re-invoke the skill. Future runs in this Project will skip this prompt."
- **"Proceed without a Project"**: do NOT write the acknowledgment file. Surface a small banner each run: "Single-session mode. Case state will not persist after this conversation ends." Continue to Question 2.

**Map the user's Question 2 answer:**
- **"Yes, I have a Team"**: ask one more question to capture the binding:
  ```
  ask_user_input_v0(questions=[
    {
      "question": "Paste the Team's SharePoint site URL. (In Teams, click any channel's Files tab > Open in SharePoint > copy the URL from the browser. Format is typically https://lilly.sharepoint.com/sites/...)",
      "type": "free_text"
    },
    {
      "question": "Display name for this Team (used to label the case file).",
      "type": "free_text"
    }
  ])
  ```
  Save the answers to `team_binding.json` in Project knowledge:
  ```
  {
    "team_display_name": "<user answer>",
    "sharepoint_site_url": "<user answer>",
    "bound_on": "<date>",
    "primary_channel": "General",
    "additional_channels": []
  }
  ```
  From now on, all SharePoint and chat searches scope to this Team's SharePoint URL.
- **"No Team yet"** or **"Not sure of the URL"**: do NOT write `team_binding.json`. Skill runs unbound (Project + uploads only). The user can bind later by saying "bind a Team to this case" (re-runs the binding portion of Step 0a).

**Skip Step 0a entirely on any run where `rfx_project_acknowledged.json` is found.**

## Workflows (intent-driven; no mode picker)

The skill detects intent from the user's natural-language request and routes to the matching workflow. There is no Step 0 mode picker.

| Workflow | Detected from | What it does |
|---|---|---|
| **Initialize** | "set up the case", "initialize the case", "start a new case for [RFP]", "build the case file", or invoked via `case_handoff.json` from rfp-engine | If a Team is bound: crawls the Team's SharePoint structure, infers folder organization, file naming, channels, existing case-relevant content. If no Team: works from Project knowledge + uploaded files. Builds the initial `_case_file.json`. Does NOT emit a folder schematic for the user to execute. |
| **Status** | "what's the latest on...", "where are we with...", "show me the case for...", "status update on..." | Reads the case file, refreshes from available sources (Project knowledge + uploaded files always; Team SharePoint + Outlook + Teams chat if Team bound + M365 connector available), produces a situational summary. |
| **Schedule** | "schedule the demos", "set up the evaluation kickoff", "create the BAFO meeting", "schedule the [phase] meetings" | Finds common availability via M365 connector if available, drafts ready-to-paste invite content per meeting. User pastes into Outlook to send. |
| **Ingest** | "ingest emails from this RFP", "what did [vendor] say in our last call", "pull in the chat thread with [contact]" | Searches M365 surfaces (email, Teams chat, calendar, Team SharePoint files), updates the comms log in the case file. Requires M365 connector. |
| **Refresh and Timeline** | "refresh the case", "what's new on [RFx]", "update the timeline", "catch me up on [RFx]" | Scrapes activity since last refresh from bound Team and user's mail/chat (M365 connector required), synthesizes what changed, appends to running `timeline_{case_id}.md`. |

The skill routes by matching the user's request to one of the patterns above. If the request is genuinely ambiguous (a generic invocation with no signal), ask a single open-text follow-up: "What do you want to do with this case?" Do NOT present a forced multi-option picker - the workflows are intent-driven by design.

## Capability Reality

The Microsoft 365 connector exposes **read-only** tools (no write tools exist):
- `outlook_email_search`, `outlook_calendar_search`, `find_meeting_availability`
- `chat_message_search`, `sharepoint_search`, `sharepoint_folder_search`
- `read_resource` (read any Graph resource by URI)

There are no `create_event`, `send_mail`, `create_folder`, `upload_file`, or `create_team` tools. This is a **read-and-draft connector, not a write connector.** The Initialize and Schedule workflows therefore produce content the user executes (a confirmed case file from a crawl, or ready-to-paste meeting invites): they never directly perform creates, sends, or uploads against M365. This is honest and intentional. When write tools become available, this skill will be enhanced to use them.

**Read-only scope is about M365 mutations, not local artifacts.** "Read-only" and "this skill never writes back" refer to Microsoft 365 surfaces (Outlook, Teams, SharePoint, calendar): the skill never sends mail, creates events, posts to a channel, or uploads to SharePoint. It DOES write durable local artifacts to Claude Project knowledge (the `_case_file.json`, `timeline_{case_id}.md`, binding and acknowledgment files, and the comms log inside the case file). Persisting those is the skill's job and does not contradict the read-only-against-M365 rule.

**Graceful degradation (connector absent).** If the M365 connector is unavailable, the skill does not fail: Initialize and Status run from Project knowledge and uploaded files; Schedule falls back to manual time entry by the user instead of `find_meeting_availability`; Ingest and Refresh run only over what the user uploads, with a one-line note naming what was skipped and how to get the full version (connect M365 and re-run).

## Interaction Style

This skill supports two interaction styles. Identify the style at the start of execution:

| Style | When | Behavior |
|-------|------|----------|
| **Guided** (default) | New user, complex case, user asks for help, unclear context | Walk through questions one section at a time. Confirm each step before proceeding. Explain what's about to happen. |
| **Direct** | User says "just do it", "skip the questions", "fastest path" | Use sensible defaults, surface assumptions inline, only stop for genuine blockers. |

If the user doesn't signal a preference, default to Guided. The user can switch styles mid-execution by saying so.

## Source Priority

When reading state (the Status and Refresh/Timeline workflows), this skill checks **three peer sources** in any order:

1. **Claude Project files** (if running inside a Project) - RFP artifacts, supplier proposals, case file attached to the conversation
2. **SharePoint** - files indexed by `sharepoint_search` and `sharepoint_folder_search`
3. **Outlook / Teams chat / Calendar** - via the search tools

When the same file or fact is found in multiple sources, **surface the conflict to the user** rather than silently picking one. The user decides which is canonical for their workflow.

When no Project context is available and no M365 tools are available, the skill works on local files only (uploaded to the conversation directly) and clearly labels outputs as "Local-only mode - no Project or M365 sources available."

## Project + optional Team binding (architecture summary)

Two layers, decoupled:

- **The Claude Project is the Claude workspace** (recommended). It holds derived artifacts: `_case_file.json`, `team_binding.json` (if a Team is bound), `rfx_project_acknowledged.json`, `timeline_{case_id}.md`, pipeline handoffs. Every conversation in the Project reads these. The skill is fully functional with just a Project (no Team needed).
- **The Microsoft Team is OPTIONAL.** When bound, it is the system of record for documents and channel chat (the partner storage that lives in M365, not duplicated into the Project). The M365 connector reads the Team's SharePoint and chat in place. The skill never writes back; any derived output is delivered for the user to post.

**With a Team bound:** Initialize crawls the Team's existing folder structure and adapts. Status/Ingest/Refresh read from the Team via the connector.

**Without a Team bound:** Initialize works from Project knowledge + uploaded files. Status reads from the case file and any uploads. Schedule still works (M365 connector for availability lookup, if the user has it). Ingest is reduced (only what the user uploads). Refresh+Timeline works from Project knowledge only.

The binding decision is made once in Step 0a and persists in `team_binding.json`. The user can rebind, unbind, or change the binding at any time by saying "bind a Team", "unbind the Team", or "switch the Team binding."

**Rebind / unbind reconciliation (when the binding changes mid-case).** Changing a binding never silently invalidates the case file. Apply this reconciliation:
- **Bind a Team to an unbound case:** write `team_binding.json`, set `binding.bound = true`, then run an Initialize crawl to populate `folder_semantics` from the newly bound site. Existing suppliers, dates, comms log, and timeline are preserved.
- **Switch to a different Team:** confirm with the user first (this points the document system of record at a new site). On confirm, update `team_binding.json`, clear stale `folder_semantics` (it described the old site), re-crawl the new site, and reset `last_refresh` to null so the next Status/Refresh does a full look-back against the new source. Preserve all case content; only the source binding and folder map change.
- **Unbind:** set `binding.bound = false`, retain `team_binding.json` history in `history[]`, keep the case file and timeline intact. Subsequent runs operate on Project knowledge and uploads only, and the skill states it is now unbound.
- In every case, append a `history[]` entry recording the binding change, the actor, and the timestamp. Never delete comms-log or timeline entries on a rebind.

## Required Tools

The Microsoft 365 connector is **recommended but not required**:

- **With M365 connector enabled:** the Status, Schedule, Ingest, and Refresh workflows have full read access to Outlook, Teams chat, calendar, and SharePoint
- **Without M365 connector:** the skill operates on Project files and locally uploaded files only; Status and Refresh produce reduced summaries (no live mail/chat scrape); Schedule falls back to manual time entry by the user; Ingest is limited to uploaded threads
- **Inside a Claude Project, no M365:** the skill operates on Project files; this is a fully supported configuration

Never fabricate data from any source. If a search returns nothing, say so.

## Initialize workflow

**Triggered by:** "set up the case", "initialize the case", "start a new case for [RFP]", "build the case file", or by an inbound `case_handoff.json` from rfp-engine.

This workflow does NOT emit a folder schematic for the user to execute. The Team (if one exists) already has whatever folder structure the user set up; the skill adapts to that reality rather than dictating it.

### Inputs

**From rfp-engine handoff (preferred when available):** `case_handoff.json` per the Case Handoff Schema reference (inlined below) - case title, supplier list, key dates, requirements summary.

**From the user directly:** RFP title, supplier list, key dates, anything the user can provide. The skill asks only for what it genuinely needs and cannot infer from a bound Team's existing content.

### Workflow

**Branch A: Team is bound (`team_binding.json` present in Project knowledge).**

1. **Confirm case identification** - if seeded from an inbound `case_handoff.json`, use its `case.case_id` as-is (rfp-engine's own `RFP-{YYYYMMDD}-{category-slug}` grammar; do not regenerate or reformat it). Otherwise propose a `case_id` (default: `RFP-{YYYY}-{NNN}`, or derived from the Team display name if it conveys a clear case identity). Confirm with user once.

2. **Crawl the Team's SharePoint** using the M365 connector. Walk the folder tree at the bound `sharepoint_site_url`, listing folders, file counts, recent activity. Identify likely case-relevant content by file type and naming:
   - RFP package documents (typically a "01_RFP_Package", "RFP_Documents", or similarly named folder)
   - Supplier responses (typically "02_Supplier_Responses" or per-vendor subfolders)
   - Evaluation materials (scoring matrices, evaluator notes)
   - Any existing case file or status document

3. **List channels** (via M365 connector chat capabilities) and identify the primary channel (default: "General") and any vendor-specific or topic-specific channels.

4. **Infer folder semantics from what is there** - do NOT prescribe a layout. The skill labels each top-level folder by best-effort inference ("looks like the RFP package folder", "looks like supplier responses by vendor name") and surfaces the inferred mapping to the user for confirmation. The user can correct any mis-labeling in one pass.

5. **Build `_case_file.json` from the crawl** - record:
   - `case_id`, `case_title`, `team_display_name`, `sharepoint_site_url`
   - The inferred folder semantic mapping (rfp_package_folder, supplier_responses_folder, evaluation_folder, etc.)
   - Channel list with the primary channel flagged
   - Supplier list (from `case_handoff.json` if present, OR inferred from per-vendor subfolders if visible, OR asked from the user as a single batched question)
   - Key dates (from `case_handoff.json` OR asked from the user)
   - Status: `Active` (skip `Draft` - the Team already exists, so the case is live)
   - Current phase: best-effort inferred from folder contents (e.g., if "Supplier Responses" folder has files, current phase is post-submission)

6. **Confirm the inferred case file with the user** in one pass: show the inferred mapping, ask for corrections, save.

**Branch B: No Team bound (Project + uploads only).**

1. **Confirm case identification** - same as Branch A.

2. **Capture the basics from the user** in a single batched question set: RFP title, supplier list, key dates, current phase.

3. **Ingest any uploaded files** in the conversation or Project knowledge: RFP package, draft requirements, supplier landscape output, anything case-relevant.

4. **Build `_case_file.json`** from the user input + uploads:
   - `case_id`, `case_title`, no `sharepoint_site_url` (unbound)
   - Supplier list, key dates from user
   - Status: `Active` (or `Draft` if the RFP hasn't issued yet - ask the user)
   - Current phase from user

5. **Confirm with the user.**

### Outputs (Initialize)

| Output | Format | Purpose |
|--------|--------|---------|
| `_case_file.json` | JSON in Project knowledge | Persistent case state |
| `case_summary.md` | Markdown in chat | Confirmation summary: case_id, key fields, what was inferred vs asked, the (optional) Team binding |

**No `provisioning_spec.md`. No `kickoff_invite_draft.md` produced automatically.** The user is not asked to execute a folder schematic. If the user wants a kickoff meeting drafted, they invoke the Schedule workflow (which produces a meeting draft they paste into Outlook).

## Status workflow

### Inputs
A reference to a case (case_id, RFP title, or supplier name + category).

### Workflow

1. **Resolve the case** - search case files (SharePoint, local) for matching case_id or title. If multiple candidates, ask user to disambiguate.

2. **Read case file** - load `_case_file.json` and capture: status, current phase, last update timestamp, supplier participation status, recent comms log entries.

3. **Refresh from M365 (selective)** - for the active RFP only, pull recent activity since the last refresh:
   - **Refresh window:** use the case file's `last_refresh` timestamp as the lower bound. Scrape activity dated after `last_refresh`. When `last_refresh` is absent (first Status run on a freshly initialized case, or a case never refreshed), fall back to a **10-day default look-back** so the first summary is not empty; state which bound you used. The 10-day figure is only a cold-start default, not a fixed window: once `last_refresh` exists it always governs.
   - Email matching RFP title or supplier names (Outlook search)
   - Teams chat messages from supplier-named participants
   - Calendar events tagged with RFP title

   Append genuinely new items to the comms log; do not duplicate items already recorded. This comms-log append is the ONLY write Status performs (see the read-only note below); it does not change phase, participation, status, or the timeline. After appending, update `last_refresh` to now.

4. **Generate situational summary** containing:
   - **Current phase** and days remaining to next milestone
   - **Supplier participation matrix** - who's confirmed, who's pending, who's late on what
   - **Recent activity** - last 5-10 comms log entries, sorted recent-first
   - **Open items** - questions awaiting response, missed deadlines, stalled threads
   - **Next actions** - who owes what, when
   - **Stale-case watchdog** - if no comms-log activity has landed within the case's expected cadence (default: 7 days for an Active case in a live phase), flag the case as going quiet and name the oldest unanswered open item.

5. **Hashtag emission (CONDITIONAL):** if the status summary is being delivered as a chat message or DOCX to share (not just an internal in-skill output), AND `field_guide_state.config.hashtag_generation == true`, append a one-line hashtag block at the end. Format: `#status=<current-state> #owner=@<case-owner-username> #project=<case-id-prefix> #issue=<linked-issue-id>`. Same protocol as Schedule workflow. Skip when flag is false.

6. **Render the case status visual (optional, deterministic).** When the situational summary is delivered as a rendered artifact rather than chat prose, or whenever the user asks for "the status card", "the event strip", or "a visual" for this case, build the Case Status Visual per the inlined Reference: Case Status Visual below. It is built entirely from fields already on the case file (`current_phase`, `key_dates`, `suppliers[]`, `stakeholders[]`, `comms_log[]`, the optional `financials` block) plus deterministic derivations already computed for this workflow: the phase index, days-to-next-milestone, the fixed-threshold deadline status, and the step-4 stale-case watchdog. Never fabricate a TCO, award basis, or Q&A count that is not present on the case file: render that tile in its own Pending/NEEDS_INPUT state instead. This visual is scoped to the single resolved case; it never aggregates status across cases.

7. **Format output** - concise, scannable, with links back to the case folder for drill-down.

### Outputs (Status)

| Output | Format | Purpose |
|--------|--------|---------|
| Conversational summary | (in chat) | Inline situational awareness |
| `status_snapshot_{date}.docx` | Word, optional | If user asks for a shareable version |
| Case Status Visual | Rendered artifact (JSX), optional | Single-glance RFx event and status strip, key-facts band, and Q&A distribution for this case; see the inlined Reference: Case Status Visual |

**Status is read-and-log, not a mutating workflow.** It does NOT change the case's phase, participation status, key dates, or timeline. The single exception is step 3: appending newly observed M365 items to the comms log and bumping `last_refresh`, which is housekeeping that keeps the read honest (so the same item is not re-surfaced as "new" on the next Status run). This local-artifact append never touches M365 and is consistent with the read-only-against-M365 rule in Capability Reality. If the user does not want even this append, they can say "status only, do not log," and the skill summarizes without writing.

## Schedule workflow (drafts invites; user sends)

### Triggers
- "Schedule the demos"
- "Set up the evaluation kickoff"
- "Create the BAFO meeting"
- "Schedule the [phase] meetings for this RFP"

### Workflow

In **guided** style, walk through each meeting and confirm details before drafting. In **direct** style, draft all meetings for the phase at once with sensible defaults.

1. **Identify the phase** from the trigger and the case file. Use the Meeting Templates reference (inlined below) for default agenda, attendees, and duration per phase.

2. **Resolve attendees** from the stakeholder roster - Lead is mandatory; Functional/Technical Evaluators per phase relevance; Approver only at decision phase. If the roster is incomplete, ask the user.

3. **Find availability** - use `find_meeting_availability` from the M365 connector to find common availability across required attendees within the target window. If no common slot is found, surface the conflict and ask the user to prioritize: shorten the meeting, drop an optional attendee, or pick a manual time.

4. **Draft invite content** per meeting - produce:
   - Subject line (per the Meeting Templates reference convention, inlined below)
   - Recommended date/time (from availability) with timezone
   - Required attendees, optional attendees
   - Body: agenda, materials links, communications discipline reminder where applicable
   - Suggested location: Teams meeting link (the user creates the actual link when sending), or in-person location

5. **Output the drafts** as a single markdown file or a set of files (one per meeting) the user pastes into Outlook to send. The skill does NOT send invites directly - that capability is not currently exposed.

6. **Hashtag emission (CONDITIONAL, only when `field_guide_state.config.hashtag_generation == true`):** append a one-line hashtag block at the end of each meeting invite body, separated by a blank line and `---` rule. Format: `#status=active #owner=@<lead-username> #project=<case-id-prefix> #issue=<linked-issue-id-if-promoted> #priority=<from-case-file>`. Values pulled from the case file; `#issue=` included only when the case has been linked to a Theo's Field Guide Issue. Up to 6 hashtags, one of each type. Read the flag from `field_guide_state.json` in Project knowledge; if absent, default to false (no hashtags emitted).

7. **Update the case file** - log each drafted meeting in the case file's `events[]` array as `scheduled_at: null, status: "draft"`. When the user confirms the invite was sent, update with the actual `scheduled_at` and the Outlook event URI.

### Outputs (Schedule)

| Output | Format | Purpose |
|--------|--------|---------|
| `meeting_drafts_{phase}_{date}.md` | Markdown | Ready-to-paste invite content for each meeting in the phase |
| `meeting_log.csv` | CSV (in case folder) | Persistent log of drafted meetings with status (draft / sent / completed) |
| Confirmation summary | (in chat) | What was drafted, with whom, recommended times, conflicts surfaced |

### Standard Meetings by Phase

See the Meeting Templates reference (inlined below) for full agendas.

| Phase | Standard Meetings |
|-------|-------------------|
| Pre-Issue | Evaluation kickoff |
| Q&A Window | Bidder webconference (1 session, all bidders) |
| Post-Submission | Initial scoring session, calibration session |
| Demo | One demo per shortlisted supplier (full or half day) |
| Reference | Reference check call windows |
| BAFO | BAFO request issuance, BAFO response review |
| Decision | Final selection meeting, executive approval review |
| Close | Award notification call (selected), debrief calls (non-selected) |

## Ingest workflow

### Triggers
- "Ingest emails from this RFP"
- "What did [vendor] say in our last call/chat"
- "Pull in the chat thread with [contact]"
- "What's the email history with [supplier]"

### Workflow

1. **Identify scope** - which RFP? Which supplier or stakeholder? What time window?

2. **Search M365 surfaces** in this order:
   - **Outlook** - `outlook_email_search` filtered by sender domain, RFP keywords, and date range
   - **Teams chat** - `chat_message_search` for the named contact and RFP keywords
   - **Calendar** - `outlook_calendar_search` for past meetings with the contact (transcripts attached if available)
   - **SharePoint** - search for files shared by or with the contact relating to the RFP

3. **Summarize per source** - for each retrieved item: who, when, subject/topic, key points (paraphrased, never quoted at length).

4. **Extract action items and commitments** - anything the supplier promised, anything Lilly committed to, anything left open.

5. **Update case file comms log** - append new items with timestamp, source, summary, parties.

6. **Classify Q&A items (feeds the Case Status Visual's Q&A Distribution panel).** For each newly logged item that is a formal RFP question-and-answer exchange (not general correspondence), set `comms_log[].is_qa = true`, assign a short `qa_category` inferred from the question's subject (e.g. "Data Security & Privacy", "Integration & APIs"), and a `qa_status` of `Answered` (a response is on record) or `Pending`. Deduplicate the SAME underlying question raised by more than one bidder into a single `qa_question_key` so the distribution counts it once, consistent with the fairness rule in Comms Discipline (the same answer must reach every bidder). This classification never changes `anomaly_flag` or `facing`, and it never records which bidder asked which question in any output surfaced beyond the raw case file - the Q&A Distribution panel is compiled and anonymized by design.

7. **Surface anomalies** - flag if the supplier said something inconsistent with their RFP submission, made a commitment outside the formal Q&A channel (potential disqualification trigger), or escalated to someone outside the procurement-controlled communications channel.

### Privacy and Discipline Rules

- **Only your own data** - this skill can search the user's own Outlook, Teams chats, and calendar. It cannot access teammates' private threads. Be honest about that scope.
- **Communications discipline** - flag any supplier-initiated contact that bypasses the procurement-controlled channel. This is a governance issue per most RFP Instructions Section 4.5 / 5 patterns.
- **Don't expose internal deliberation** - when summarizing, separate supplier-facing facts from internal evaluation discussion. The case file maintains both, but the user must explicitly ask before any internal-side content goes anywhere a supplier could see.

### Outputs (Ingest)

| Output | Format | Purpose |
|--------|--------|---------|
| Conversational summary | (in chat) | Inline situational awareness |
| Updated comms log | CSV in case folder | Persistent record |
| `ingestion_report_{date}.docx` | Word, optional | Shareable digest of recent activity |

## Refresh and Timeline workflow (on command)

**Trigger:** "Refresh the [RFx] case", "What's new on [RFx]", "Update the timeline", "Catch me up on [RFx]".

This mode scrapes the bound Team and the user's mail/chat for activity since the last refresh, synthesizes what changed, maintains a running timeline, and updates the case file. It is **on command only** - it runs when the user asks. It does NOT run on a schedule or in the background: skills have no autonomous trigger and the connector is read-only, so true periodic polling would require external automation (Power Automate or a scheduled job) outside this skill. Say so if the user asks for automatic/periodic refresh.

### Workflow
1. **Resolve scope** - the bound case (Team SharePoint site + channels, supplier names, the `last_refresh` timestamp in the case file). If unbound, ask the user to name the Team or proceed on uploads.
2. **Scrape since last refresh** (read-only, member-scoped): new/changed files in the Team's SharePoint library; channel posts and relevant 1:1/group chats; RFx-tagged email and calendar items. Cite every item (source + date + link).
3. **Synthesize** - what changed, what it means, new commitments/decisions, supplier participation changes, open items, and anomalies (e.g., a supplier contacting someone outside the procurement channel). Separate supplier-facing facts from internal deliberation.
4. **Maintain the timeline artifact** - append to `timeline_{case_id}.md` (stored in the Project): dated, chronological entries (date, event, source, parties, significance). Never rewrite history; only append new events and correct clear errors. This file is the running narrative of the RFx.
5. **Update the case file** - append to the comms log, refresh participation status and `last_refresh`, never duplicating items already recorded.
6. **Deliver** - a concise "what's new since [last refresh]" summary in chat, the updated timeline, and (opt-in, per Suite Interaction Protocol S4) a draft status note the user can post into the Team. The skill cannot post to the Team itself.

### Outputs (Refresh and Timeline)
| Output | Format | Purpose |
|--------|--------|---------|
| "What's new" summary | (in chat) | On-demand situational awareness since last refresh |
| `timeline_{case_id}.md` | Markdown, in the Project | Running chronological record of the RFx |
| Updated `_case_file.json` | JSON | comms log + participation + last_refresh updated |

## Cross-Workflow Rules

- **Single source of truth** - `_case_file.json` is authoritative. All workflows read from and (Initialize, Schedule, Ingest, Refresh) write to it.
- **Timeline is append-only** - Refresh adds dated events to the timeline; it does not rewrite prior entries.
- **No skill-internal scoring or recommendation** - if the user asks "should we go with vendor X", redirect to evaluation-engine.
- **No skill-internal artifact generation** - if the user asks "rewrite the RFP", redirect to rfp-engine.
- **Always cite sources** - when ingesting from M365 (Team bound), every summary item must reference its source (email subject + date, Teams chat URL, calendar event, SharePoint file path). When working from uploads only, cite the file name and the user as the source.
- **Never fabricate participation status** - if a supplier hasn't formally confirmed, status is Pending, not Confirmed.
- **Team binding is optional but persistent** - once bound, the binding is used for every subsequent run until the user explicitly changes or removes it ("unbind the Team", "bind a different Team").
- **Adapt to what is there** - when a Team is bound, never prescribe a folder structure or naming convention. Crawl what exists and adapt.

## Skill Chain Position

| Upstream | This skill | Downstream |
|----------|------------|------------|
| rfp-engine (via case_handoff.json), supplier-landscape, category-strategy | rfp-case-manager | rfp-response-analysis, evaluation-engine |

## Global Guardrails

- **Tool-aware** - degrade gracefully when M365 MCP is offline; never fabricate M365 data
- **Boundary-aware** - refuse to do work that belongs to other skills; redirect cleanly
- **Privacy-aware** - only access the user's own M365 data; flag bypass-of-procurement comms
- **State-aware** - the case file is the source of truth; Initialize, Schedule, Ingest, and Refresh write to it, Status reads it (Status appends only to the comms log, per its own step)
- **Audit-aware** - every state change is logged in the case file with timestamp and source

## Reference Files

All references below are **inlined in this SKILL.md** (see the INLINED REFERENCE FILES section at the bottom). There is no separate `references/` folder in this build.

- Case File Schema (inlined below) - schema for `_case_file.json`
- Case Handoff Schema (inlined below) - inbound payload from rfp-engine (mirror of rfp-engine's reference)
- Meeting Templates (inlined below) - standard agendas, attendees, durations per RFP phase
- M365 Search Patterns (inlined below) - search query patterns for the read-only M365 tools
- Comms Discipline (inlined below) - rules for flagging communications that bypass procurement
- Claude Project Context (inlined below) - how to detect and use Claude Project files as a peer source
- Case Status Visual (inlined below) - the single-RFx event/status strip, key-facts band, and Q&A distribution panel the Status workflow can render as a visual artifact

(No provisioning-spec reference: the v2.0 decision removed the folder/Teams-site schematic, so there is no spec format to document.)
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


## SUITE v2 SPECIFICS -- rfp-case-manager

**Input tiers.** MUST: an RFP name or case reference. RECOMMENDED: case_handoff.json from rfp-engine. OPTIONAL: M365 connector for scheduling and communications.
**Native deliverable:** case file, meeting-invite content, status summaries, running timeline. This skill maintains case state and produces draft content the user executes (paste-to-send invites, post-it-yourself status notes), not direct M365 creates.

# INLINED REFERENCE FILES

The seven references named in the Reference Files index are reproduced in full below. They are inlined (not separate files) in this build. Each section is the authoritative content for the pointer that names it.

---

## Reference: Case File Schema

Schema for `_case_file.json`, the single source of truth for a case. Stored in Claude Project knowledge (or carried by the user as JSON when running outside a Project). All workflows read this; Initialize, Schedule, Ingest, and Refresh write it; Status appends only to `comms_log[]` and updates `last_refresh`.

```json
{
  "schema_version": "2.3",
  "case_id": "string - RFP-{YYYY}-{NNN} generated by this skill, or preserved as-is from an inbound case_handoff.json (rfp-engine's own RFP-{YYYYMMDD}-{category-slug} grammar), or derived from a bound Team's display name",
  "case_title": "string - human-readable RFP name",
  "category": "string - sourcing category (category-neutral; any commodity)",
  "status": "Draft | Active | On Hold | Awarded | Cancelled | Closed",
  "current_phase": "Pre-Issue | Q&A Window | Post-Submission | Demo | Reference | BAFO | Decision | Close",
  "priority": "string - inherited from the linked Issue or set by the user; NEEDS_INPUT if unknown",
  "created_on": "ISO-8601 date",
  "created_by": "string - Lilly user",
  "last_refresh": "ISO-8601 datetime | null - set by Status/Ingest/Refresh after a scrape; governs the next refresh window. null means never refreshed (cold start).",

  "binding": {
    "bound": "boolean - true when a Microsoft Team is bound",
    "team_display_name": "string | null",
    "sharepoint_site_url": "string | null",
    "primary_channel": "string - default 'General'",
    "additional_channels": ["string"],
    "bound_on": "ISO-8601 date | null"
  },

  "folder_semantics": {
    "note": "Populated only when a Team is bound and Initialize crawls it. Best-effort inferred mapping; never prescribed.",
    "rfp_package_folder": "string | null",
    "supplier_responses_folder": "string | null",
    "evaluation_folder": "string | null",
    "other": [{"path": "string", "inferred_label": "string"}]
  },

  "suppliers": [
    {
      "supplier_id": "string (e.g., SUP-01)",
      "name": "string",
      "participation_status": "Invited | Confirmed | Submitted | Declined | No Response | Pending",
      "primary_contact": {"name": "string", "email": "string", "title": "string"},
      "source": "case_handoff | per-vendor subfolder (inferred) | user-specified",
      "last_contact": "ISO-8601 date | null"
    }
  ],

  "stakeholders": [
    {
      "name": "string",
      "title": "string",
      "function": "string",
      "role": "Lead | Functional Evaluator | Technical Evaluator | Approver | Observer",
      "email": "string",
      "approval_authority": "boolean"
    }
  ],

  "key_dates": {
    "rfp_release_date": "ISO-8601 date | null",
    "qa_deadline": "ISO-8601 date | null",
    "proposals_due": "ISO-8601 date | null",
    "demo_window_start": "ISO-8601 date | null",
    "demo_window_end": "ISO-8601 date | null",
    "award_target": "ISO-8601 date | null"
  },

  "events": [
    {
      "event_id": "string",
      "type": "meeting | milestone",
      "title": "string",
      "phase": "string",
      "scheduled_at": "ISO-8601 datetime | null - null while a draft, set when the user confirms it was sent",
      "status": "draft | sent | completed | cancelled",
      "outlook_event_uri": "string | null"
    }
  ],

  "comms_log": [
    {
      "logged_at": "ISO-8601 datetime",
      "source": "outlook | teams_chat | calendar | sharepoint | upload",
      "source_ref": "string - email subject+date, Teams chat URL, calendar event, or file name+path; the user is cited as source for uploads",
      "parties": ["string"],
      "summary": "string - paraphrased, never long-quoted",
      "facing": "supplier-facing | internal - keeps deliberation separate from supplier-safe facts",
      "anomaly_flag": "boolean - true if it bypassed the procurement-controlled channel or contradicted a submission",
      "dedupe_key": "string - stable hash of source_ref + parties + date; prevents double-logging on re-runs",
      "is_qa": "boolean - true when this entry is a formal RFP question/answer exchange; set by Ingest (see Ingest workflow step 6). Feeds the Case Status Visual's Q&A Distribution panel only; false/absent for general correspondence.",
      "qa_category": "string | null - short topic label (e.g. 'Data Security & Privacy'); set only when is_qa is true",
      "qa_status": "Answered | Pending | null - set only when is_qa is true",
      "qa_question_key": "string | null - stable key so the same underlying question raised by more than one bidder is counted once, per the Comms Discipline fairness rule"
    }
  ],

  "financials": {
    "note": "Optional and additive. This skill does not price or score responses (see Boundaries) - populate only from a case_handoff.json flag, a value the user provides directly, or another skill's output the user pastes in. Never estimate a TCO or infer an award basis internally; leave null and let the Case Status Visual render Pending/NEEDS_INPUT.",
    "tco_estimate": "string | null - e.g. '$2.1M-$2.6M / 3-yr, preliminary'",
    "tco_confidence": "High | Medium | Low | null",
    "tco_basis": "string | null - one line on where the figure came from and its as-of date",
    "award_basis": "string | null - e.g. 'Weighted Scorecard (70% Technical / 30% Commercial)', 'Lowest Total Cost', 'Best Value'"
  },

  "history": [
    {"at": "ISO-8601 datetime", "actor": "string", "change": "string - what changed and why", "workflow": "Initialize | Status | Schedule | Ingest | Refresh"}
  ]
}
```

**Conventions.**
- Absent values are `null` or `NEEDS_INPUT`, never a guessed default (no fabricated participation status, priority, or phase).
- `comms_log[]` is append-only with `dedupe_key`; never rewrite or delete prior entries.
- `last_refresh` is the lower bound for every selective M365 scrape (Status step 3, Ingest, Refresh). See the Status workflow for the cold-start fallback.
- `financials` is optional and additive (schema 2.3+); a case file from schema 2.2 or earlier without it is still valid - treat a missing block exactly like a present block with every field null.
- `comms_log[].is_qa` / `qa_category` / `qa_status` / `qa_question_key` (schema 2.3+) are optional per-entry fields set by Ingest; entries logged before schema 2.3 simply carry no Q&A classification and are excluded from the Q&A Distribution panel rather than guessed at.

---

## RFx-hub contribution, output slice

`rfx-hub-1c344a` composes an RFx dashboard from four feeder skills. This skill is one of
them. It contributes a bounded slice and nothing else.

**This skill owns, and is the only skill that may write:**

| Field | Contents |
|---|---|
| `qa[]` | the Q&A and addenda log |
| `intent`, `doc` | the event's stated purpose and its governing document |
| `dueDate`, `phase` | the key date and current lifecycle phase |
| `tco`, `cci`, `awardBasis` | the event's headline commercial framing and award basis |
| `internalFlags` | internal case-health flags (for example an unconfirmed funding position) |

This skill remains the state and lifecycle owner. The hub reads that state layer; it does
not maintain a second copy of it, and it never advances a case state.

**Every field carries a `sourceRef`** naming its origin (the case file, a supplier
communication, a confirmed date). A field without one is a build failure, not a gap to
render.

**The hub composes, it never re-derives.** In particular it does not compute case health
from its own reading of the event; it displays what this skill determined.

**Scoring stays out of scope here, deliberately.** This skill is explicitly boundaried out
of scoring, and contributing to the hub does not change that. Scores reach the hub from
rfp-response-analysis (labelled **proposed**) and evaluation-engine (labelled **official**),
never from this skill.

**This skill keeps everything it already produces.** `_case_file.json`, status snapshots,
meeting drafts and the comms log are unaffected. Contributing a slice is additive and this
skill remains fully usable with no hub present.

**Forward note.** `_redesign_proposals/RFx-REDESIGN-SPEC.md` section D names this skill's
slice as `event`, `participation`, `keyDates`, `qa` and `caseHealth` as discrete top-level
fields. The table above binds to the object the hub actually ships today
(`{criteria, requirements, suppliers, panel, qa}`); the remaining four travel inside event
and case state until the hub object grows. Extend this table then rather than replacing it.

## Reference: Case Handoff Schema

**MIRROR, not the source of truth.** The authority for `case_handoff.json` is
`rfp-engine-1c344a/references/case-handoff-schema.md`. rfp-engine produces the payload and
this skill consumes it, so the producer owns the schema. The JSON below is copied from that
file verbatim so this skill reads standalone. Do not hand-edit it here: edit the source,
then re-copy this block in the same commit.

Behaviour on receipt, which is this skill's own decision and not the schema's: under the
v2.0 "no provisioning spec" decision, this skill does NOT create SharePoint folders or
Teams sites on receipt. It adapts to whatever already exists and builds the case file. The
source schema agrees and states the same no-provisioning behaviour.

```json
{
  "schema_version": "1.0",
  "handoff_timestamp": "ISO-8601 datetime",
  "source_skill": "rfp-engine",

  "case": {
    "case_id": "string - generated by rfp-engine as RFP-{YYYYMMDD}-{category-slug}",
    "title": "string - human-readable RFP name",
    "category": "string - sourcing category (e.g., Enterprise SaaS, Professional Services)",
    "description": "string - 2-3 sentence summary of what is being sourced",
    "status": "Draft | Issued | In Evaluation | Awarded | Cancelled",
    "mode": "Brief | Full",
    "created_by": "string - Lilly user who initiated the RFP"
  },

  "artifacts": {
    "base_path": "string - relative or SharePoint path where artifacts are stored",
    "files": [
      {
        "artifact_id": "string (e.g., A-01)",
        "filename": "string (e.g., RFP_Instructions.docx)",
        "type": "RFP_Instructions | Requirements_Matrix | Schedule | Pricing_Template | Demo_Evaluation_Guide | Post_Award_Timeline | Stakeholder_Roster | Addendum | QA_Log",
        "path": "string - full path to file",
        "status": "Draft | Final | Issued"
      }
    ],
    "invitation_email": {
      "subject": "string - email subject line",
      "body": "string - email body text with [Vendor Name] / [Vendor Contact] placeholders for per-vendor substitution",
      "delivery_method": "actionable draft in chat (no auto-send; if message_compose is unavailable, falls back to a labeled inline draft)",
      "vendor_specific_variants": "boolean - true if per-vendor emails were produced with contact info pre-filled"
    }
  },

  "schedule": {
    "rfp_release_date": "ISO-8601 date",
    "qa_deadline": "ISO-8601 date",
    "qa_response_date": "ISO-8601 date",
    "proposals_due": "ISO-8601 date",
    "evaluation_start": "ISO-8601 date",
    "evaluation_end": "ISO-8601 date",
    "demo_window_start": "ISO-8601 date",
    "demo_window_end": "ISO-8601 date",
    "award_target": "ISO-8601 date",
    "contract_execution_target": "ISO-8601 date"
  },

  "suppliers": [
    {
      "supplier_id": "string (e.g., SUP-01)",
      "name": "string",
      "status": "Invited | Confirmed | Declined | No Response",
      "primary_contact": {
        "name": "string",
        "email": "string",
        "title": "string"
      },
      "source": "Supplier Landscape | User-Specified | Incumbent",
      "landscape_rank": "integer | null - ranking from supplier-landscape if applicable"
    }
  ],

  "stakeholders": [
    {
      "name": "string",
      "title": "string",
      "function": "string",
      "evaluation_focus": ["string"],
      "demo_attendance": true,
      "approval_authority": false
    }
  ],

  "requirements_summary": {
    "total_requirements": "integer",
    "must_have_count": "integer",
    "should_have_count": "integer",
    "nice_to_have_count": "integer",
    "categories": ["string - list of requirement categories"]
  },

  "flags": {
    "incumbent_present": "boolean",
    "incumbent_name": "string | null",
    "legal_terms_in_scope": "boolean",
    "regulatory_requirements": ["string"],
    "draft_requirements": "boolean - true if requirements matrix contains Draft_Flag = TRUE rows"
  },

  "downstream_routing": {
    "next_skill": "rfp-case-manager",
    "auto_advance_on_completion": true,
    "pipeline_position": 2
  }
}
```

## Reference: Meeting Templates

Standard agenda, attendees, and duration per RFP phase. The Schedule workflow uses these as defaults; the user can override any field. Subject-line convention: `[RFP] {case_id} - {Meeting Name} - {Supplier or "All"}`.

| Phase | Meeting | Duration | Required attendees | Agenda outline |
|-------|---------|----------|--------------------|----------------|
| Pre-Issue | Evaluation kickoff | 60 min | Lead, all Evaluators | Scope and timeline review; evaluation criteria and weighting walkthrough; roles and conflict-of-interest reminder; communications-discipline rules (single procurement-controlled channel) |
| Q&A Window | Bidder webconference (1 session, all bidders) | 60 min | Lead, Technical Evaluators (Lilly side); all invited suppliers | Process and timeline restatement; clarification of requirements; rules for written follow-up questions; no commercial discussion |
| Post-Submission | Initial scoring session | 90 min | Lead, all Evaluators | Independent scores due before the meeting; walk each requirement category; capture divergences for calibration |
| Post-Submission | Calibration session | 60 min | Lead, all Evaluators | Reconcile scoring divergences; confirm consensus scores; flag items needing supplier clarification |
| Demo | One demo per shortlisted supplier (full or half day) | 4 hr (half) / 8 hr (full) | Lead, Functional and Technical Evaluators relevant to the supplier | Scripted demo scenarios from the evaluation guide; live scoring; Q&A; no commercial negotiation |
| Reference | Reference check call window | 30 min per reference | Lead (or delegate) | Structured reference questionnaire; verify supplier claims; capture risks |
| BAFO | BAFO request issuance | async + 30 min brief | Lead | Issue best-and-final-offer request; clarify what is being asked; restate deadline |
| BAFO | BAFO response review | 60 min | Lead, Approver (preview), Evaluators | Compare BAFO deltas; update commercial scoring; prepare recommendation |
| Decision | Final selection meeting | 60 min | Lead, all Evaluators | Consolidated scorecard review; recommendation; risks and mitigations; route to evaluation-engine for the formal artifacts |
| Decision | Executive approval review | 30 min | Lead, Approver(s) | Present recommendation and rationale; obtain approval per the threshold-driven chain; record decision |
| Close | Award notification call (selected) | 30 min | Lead | Notify the selected supplier; outline next steps and contract handoff |
| Close | Debrief calls (non-selected) | 30 min each | Lead | Provide fair, non-comparative feedback; thank the bidder; close the loop |

**Drafting rules.** Attendees come from the stakeholder roster (Lead mandatory; Evaluators per phase relevance; Approver only at decision phase). Where the agenda touches supplier interaction, include a one-line communications-discipline reminder (see the Comms Discipline reference). Location defaults to a Teams meeting (the user creates the actual link on send) unless the user specifies in-person.

---

## Reference: M365 Search Patterns

Query patterns for the read-only M365 connector tools. All are read-only; none mutate M365. If the connector is absent, every pattern degrades to "ask the user to provide the equivalent upload."

| Goal | Tool | Pattern |
|------|------|---------|
| Recent email on this RFP | `outlook_email_search` | `subject:({case_title} OR {case_id}) OR from:({supplier_domain}) received>={last_refresh or cold-start bound}` |
| Supplier chat activity | `chat_message_search` | `from:({supplier_contact}) AND ({case_title} keywords) AND sent>={last_refresh}` |
| RFP-tagged calendar items | `outlook_calendar_search` | `subject:({case_title} OR {case_id}) start>={last_refresh}` |
| Common availability for a meeting | `find_meeting_availability` | attendee set = resolved required attendees; window = target phase window; duration = phase default |
| New or changed files in the bound Team | `sharepoint_folder_search` | scope to `binding.sharepoint_site_url`; filter `modified>={last_refresh}` |
| A specific document by name | `sharepoint_search` | scope to the bound site; match file name or title keywords |
| Any Graph resource by URI | `read_resource` | direct URI read for a known item (message, event, file) |

**Rules.**
- Scope every SharePoint and chat search to `binding.sharepoint_site_url` when a Team is bound; otherwise search the user's own mailbox/chats only.
- The connector sees only M365 (SharePoint, OneDrive, Outlook, Teams). It CANNOT see Ariba, LEAH, or other external systems; say so plainly if the user expects those.
- Only the user's own data is searchable (own Outlook, own Teams chats, own calendar). It cannot read teammates' private threads.
- Cite every retrieved item: file name + location/URL + date for files; subject + date for email; chat URL for messages.
- De-duplicate against `comms_log[].dedupe_key` before appending.

---

## Reference: Comms Discipline

Rules for flagging communications that bypass the procurement-controlled channel. Most RFP Instructions (patterns akin to Sections 4.5 / 5) require all supplier communication to flow through a single procurement-controlled channel during a live RFP. This reference defines what to flag and how.

**Flag as an anomaly (`comms_log[].anomaly_flag = true`) when:**
- A supplier contacts a Lilly stakeholder OUTSIDE the procurement-controlled channel (for example, emails an evaluator directly, or DMs someone on Teams instead of using the formal Q&A channel).
- A supplier makes a commitment or asks a substantive question outside the formal Q&A window or channel.
- A supplier says something inconsistent with their formal RFP submission.
- A supplier attempts to influence the process through a relationship contact rather than the named procurement lead.

**How to surface a flag (never auto-act):**
- Record the item in the comms log with `anomaly_flag = true` and a one-line reason.
- In the Status / Ingest / Refresh summary, list anomalies in a dedicated "Communications-discipline flags" line, naming the supplier, the channel breached, and the date.
- Note the potential consequence factually (for example, "out-of-channel contact can be a disqualification trigger under the RFP Instructions") without asserting a disqualification has occurred. The decision belongs to the procurement lead and Legal, not this skill.

**Confidence and disqualification posture.** This skill flags risk; it does not adjudicate. Never label a supplier "disqualified." Use "flagged for communications-discipline review" and route the judgment to the case Lead. Distinguish a one-off minor breach (low severity) from a pattern of out-of-channel contact (higher severity) when the log shows repetition.

**Internal vs supplier-facing.** Keep internal deliberation separate from supplier-safe facts (`comms_log[].facing`). Never let internal evaluation discussion reach a supplier-visible artifact without the user explicitly asking.

---

## Reference: Claude Project Context

How to detect and use Claude Project files as a peer source.

**Detection.** At the start of a run, check whether durable artifacts from a prior conversation are visible (for example `_case_file.json`, `team_binding.json`, `rfx_project_acknowledged.json`, `timeline_{case_id}.md`, `field_guide_state.json`). Their presence indicates the skill is running inside a Claude Project dedicated to this RFx. If none are present and none are uploaded, the skill is in single-session mode.

**Use.**
- Treat Project files as a first-class peer source alongside SharePoint and Outlook/Teams (see Source Priority). When the same fact appears in more than one source, surface the conflict rather than silently picking one.
- Read the case file first; it is the single source of truth. Reconcile any newer M365 evidence into it (append to the comms log, update participation and `last_refresh`), never overwrite history.
- Write durable artifacts back to Project knowledge so later conversations reuse them: the case file, timeline, binding/acknowledgment files, and the comms log. This is local persistence, not an M365 write.

**Graceful degradation (no Project).** In plain Claude with no Project, fall back to user uploads and user-carried JSON. Surface a one-line "single-session mode; case state will not persist after this conversation" banner each run, and offer to emit the case file as a downloadable JSON the user can re-upload next time. Never require a Project; detect, adapt, never block.

---

## Reference: Case Status Visual (single-RFx event strip, key facts, Q&A distribution)

**Purpose.** A compact, single-glance visual for ONE RFx case, built from data the Status workflow has already assembled. It supplements, never replaces, the conversational summary and the optional `status_snapshot_{date}.docx`: use it when a rendered artifact is the natural output for the surface in use, or whenever the user asks for a visual, card, event strip, or dashboard view of the case. It is scoped to a single `case_id` - this skill never aggregates status across cases (portfolio-level views belong to theos-field-guide / the Personal Command Center, not here).

**When it renders.** On the Status workflow (see Status step 6). Never on Initialize, Schedule, or Refresh directly, though a rebuilt case file from any of those workflows is reflected the next time Status renders it. Skipped in plain-text-only surfaces, which fall back to the conversational summary alone.

**Locked skeleton (Global Operating Rule 8: same shape every run, only the content changes).**
1. **Header band** - case title, case_id, category, as-of date.
2. **RFx Event & Status Strip (left) + situational narrative (right)** - two-column row. Left: an 8-phase progress stepper (Pre-Issue through Close), a four-state deadline-status pill (On-track / At-risk / Breached / Stale), the evaluation-panel roster as chips, and a comms-discipline flag callout when `comms_log[]` carries an open `anomaly_flag`. Right: a written synthesis of what the strip means and the recommended next action - never a re-statement of the tiles as prose.
3. **Key facts band** - a KPI-tile row: Case ID/Category, Current Phase, Next Milestone (days remaining), Supplier Participation (submitted or confirmed of invited), Sourcing Lead, and Award Basis; a Preliminary TCO card immediately below it.
4. **Q&A Distribution (left) + Q&A narrative (right)** - two-column row. Left: a stacked bar chart of compiled, anonymized Q&A counts (Answered vs Pending) by category, built from `comms_log[]` entries where `is_qa = true`, deduplicated by `qa_question_key`. Right: a written synthesis of what the clustering means and what remains open.
5. **Open Q&A table** - every category with a `Pending` item: category, pending count, oldest-pending age, and who it is routed to. No bidder names - compiled and anonymized, per the Comms Discipline fairness rule.
6. **Footer** - as-of date and last refresh, Company Confidential line.

Every tile and section renders on every case, per Rule 8: when a field is absent (no `financials.tco_estimate`, an empty roster, zero Q&A items), render that tile or card in its own muted Pending / NEEDS_INPUT state rather than dropping it or inventing a value. The Open Q&A table and Preliminary TCO card are the two places this shows up most often for a freshly initialized case.

**Data contract (case file to visual).**

| Visual element | Source field(s) | Derivation |
|---|---|---|
| Phase stepper | `current_phase` | Fixed index into the 8-phase list (Pre-Issue .. Close) already used by Meeting Templates and the Case File Schema enum |
| Deadline-status pill | `key_dates`, `last_refresh` | Days to the next unreached `key_dates` entry vs. the as-of date: Breached if past due, At-risk if <= 5 days out, Stale if no `comms_log[]` activity within the Status workflow's 7-day cadence (same rule as its stale-case watchdog), else On-track |
| Roster chips | `stakeholders[]` | One chip per stakeholder, colored by `role` |
| Comms-discipline callout | `comms_log[]` where `anomaly_flag = true` | Most recent flagged entry, rendered as a one-line callout |
| Supplier participation tile | `suppliers[]` | Count where `participation_status` in {Confirmed, Submitted} over total invited |
| TCO / Award Basis | `financials.*` (optional block, Case File Schema) | Rendered as-is with `tco_confidence`; Pending/NEEDS_INPUT when null. Never computed or estimated by this skill (see Boundaries) |
| Q&A distribution | `comms_log[]` where `is_qa = true` | Grouped by `qa_category`, deduplicated by `qa_question_key`, split Answered/Pending by `qa_status` |
| Open Q&A table | Same, filtered to `qa_status = "Pending"` | Oldest-pending age = as-of date minus the earliest `logged_at` sharing that `qa_question_key` |

**Component reuse.** Built entirely from the shared component library in lilly-brand-assets `dashboard-components.md` - `Metric`, `Card`, `StateBanner`, `STable`, `Tip`, the color tokens, and the chart palette, reused verbatim. Three skill-specific components are added locally, styled from the same tokens rather than introducing new colors: `PhaseStepper` (the 8-phase progress row), `RosterChip` (initials avatar + role), and `HealthPill` (the four-state deadline pill, shaped like `SevPill`).

**Illustrative reference render.** The JSX below renders one fully worked single-RFx case (`RFP-2026-014`, Enterprise MDM Platform) so every state - populated, pending, and at-risk - is visible in one render: a mid-cycle Post-Submission case with an At-risk deadline read, one open comms-discipline flag, a preliminary (not yet BAFO-adjusted) TCO estimate, and two still-open Q&A items. Replace the `CASE`, `QA`, and `QA_OPEN` constants with the live case file's derived values when using this in a real run; every derivation (`phaseIndex`, `daysBetween`, `deadlineStatus`) is a pure function of the case file, not an LLM judgment call.

```jsx
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList, ComposedChart, Line, ReferenceLine } from "recharts";

// ---- Color tokens (verbatim from lilly-brand-assets dashboard-components.md) ----
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

// ---- Shared components (verbatim from dashboard-components.md) ----
function Metric({ label, value, sub, accent, warn, good }) {
  var bar = accent ? R : warn ? R : good ? BLU : BD;
  return <div style={{ background: accent ? WARM : warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: accent ? R : LT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
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

function StateBanner({ kind, msg }) {
  var map = { NEEDS_INPUT: [AMB, WARM, "Needs input"], NOT_APPLICABLE: [MUT, CARD, "Not applicable"], RESEARCH_PENDING: [MUT, CARD, "Research pending"] };
  var c = map[kind] || map.NOT_APPLICABLE;
  return <div style={{ background: c[1], border: "1px solid " + c[0] + "55", borderLeft: "4px solid " + c[0], borderRadius: 8, padding: "12px 16px" }}>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: c[0], textTransform: "uppercase" }}>{c[2]}</span>
    <div style={{ fontSize: 12, color: DK, marginTop: 4, lineHeight: 1.5 }}>{msg}</div>
  </div>;
}

function STable({ columns, rows }) {
  var _s = useState({ col: 0, dir: "asc" }); var sort = _s[0]; var setSort = _s[1];
  var _q = useState(""); var q = _q[0]; var setQ = _q[1];
  var filtered = useMemo(function () {
    var r = rows;
    if (q) { var lq = q.toLowerCase(); r = rows.filter(function (row) { return row.some(function (c) { return String(c.d).toLowerCase().indexOf(lq) >= 0; }); }); }
    return r.slice().sort(function (a, b) {
      var av = a[sort.col].v != null ? a[sort.col].v : a[sort.col].d;
      var bv = b[sort.col].v != null ? b[sort.col].v : b[sort.col].d;
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sort, q]);
  return <div>
    <div style={{ marginBottom: 8 }}>
      <input value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="Search..." style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid " + BD, fontSize: 12, width: 220 }} />
      <span style={{ fontSize: 11, color: LT, marginLeft: 8 }}>{filtered.length} of {rows.length}</span>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{columns.map(function (h, i) {
          var active = sort.col === i;
          return <th key={i} onClick={function () { setSort({ col: i, dir: active && sort.dir === "desc" ? "asc" : "desc" }); }} style={{ padding: "7px 8px", fontWeight: 600, color: active ? R : MUT, fontSize: 11, borderBottom: "2px solid " + BD, cursor: "pointer", textAlign: h.a || "left", whiteSpace: "nowrap" }}>{h.l}{active ? (sort.dir === "asc" ? " ^" : " v") : ""}</th>;
        })}</tr></thead>
        <tbody>{filtered.map(function (row, ri) {
          return <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
            {row.map(function (cell, ci) {
              return <td key={ci} style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: columns[ci].a || "left", fontWeight: cell.b ? 700 : 400, color: cell.c || DK }}>{cell.d}</td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}

function Tip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div style={{ background: DK, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 12 }}>
    {label && <div style={{ fontWeight: 600, color: LT }}>{label}</div>}
    {payload.map(function (p, i) { return <div key={i}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}</strong></div>; })}
  </div>;
}

// ---- Skill-specific derived components (styled from the same tokens; not part of the shared library) ----
const PHASES = ["Pre-Issue", "Q&A Window", "Post-Submission", "Demo", "Reference", "BAFO", "Decision", "Close"];

function phaseIndex(phase) {
  var i = PHASES.indexOf(phase);
  return i < 0 ? 0 : i;
}

function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

function deadlineStatus(daysRemaining, staleDays, staleCadence) {
  if (daysRemaining != null && daysRemaining < 0) return "Breached";
  if (staleDays != null && staleDays > staleCadence) return "Stale";
  if (daysRemaining != null && daysRemaining <= 5) return "At-risk";
  return "On-track";
}

const HEALTH = { "On-track": BLU, "At-risk": AMB, "Breached": R, "Stale": AMB };
const HEALTHBG = { "On-track": OK, "At-risk": WARM, "Breached": RISK, "Stale": WARM };

function HealthPill({ s }) {
  return <span style={{ color: HEALTH[s], background: HEALTHBG[s], border: "1px solid " + HEALTH[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s.toUpperCase()}</span>;
}

function PhaseStepper({ current }) {
  var idx = phaseIndex(current);
  return <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
    {PHASES.map(function (p, i) {
      var done = i < idx, isCurrent = i === idx;
      var dotColor = isCurrent ? R : done ? BLU : BD;
      var lineColor = i < idx ? BLU : BD;
      return <div key={p} style={{ display: "flex", alignItems: "flex-start", flex: i < PHASES.length - 1 ? 1 : "0 0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 60 }}>
          <div style={{ width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10, borderRadius: "50%", background: dotColor, border: isCurrent ? "2px solid " + R : "none", boxShadow: isCurrent ? "0 0 0 3px " + RISK : "none" }} />
          <div style={{ fontSize: 9, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? DK : MUT, marginTop: 5, textAlign: "center", lineHeight: 1.25, maxWidth: 60 }}>{p}</div>
        </div>
        {i < PHASES.length - 1 && <div style={{ flex: 1, height: 2, background: lineColor, marginTop: 5 }} />}
      </div>;
    })}
  </div>;
}

const ROLECOLOR = { Lead: R, "Functional Evaluator": BLU, "Technical Evaluator": BLU, Approver: AMB, Observer: MUT };

function initials(name) {
  return name.split(" ").filter(Boolean).map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
}

function RosterChip({ s }) {
  var c = ROLECOLOR[s.role] || MUT;
  return <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", background: "#fff", border: "1px solid " + BD, borderRadius: 20 }}>
    <div style={{ width: 24, height: 24, borderRadius: "50%", background: c, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{initials(s.name)}</div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: DK }}>{s.name}</div>
      <div style={{ fontSize: 9, color: MUT }}>{s.role}</div>
    </div>
  </div>;
}

// ---- Illustrative single-RFx case (replace CASE/QA/QA_OPEN with the live case file when using this in a real run) ----
const CASE = {
  case_id: "RFP-2026-014",
  case_title: "Enterprise MDM Platform RFP",
  category: "Enterprise Software - Data Management",
  current_phase: "Post-Submission",
  status: "Active",
  as_of: "2026-07-21",
  last_refresh: "2026-07-20",
  key_dates: {
    rfp_release_date: "2026-05-11",
    qa_deadline: "2026-05-29",
    proposals_due: "2026-06-19",
    demo_window_start: "2026-07-25",
    demo_window_end: "2026-08-06",
    award_target: "2026-09-15"
  },
  suppliers: [
    { name: "Informatica", participation_status: "Submitted" },
    { name: "Profisee", participation_status: "Submitted" },
    { name: "Semarchy", participation_status: "Submitted" },
    { name: "Reltio", participation_status: "Declined" },
    { name: "Ataccama", participation_status: "No Response" }
  ],
  stakeholders: [
    { name: "Priya Raman", role: "Lead", title: "Sourcing Lead, IT Procurement" },
    { name: "Devon Kessler", role: "Functional Evaluator", title: "Data Governance" },
    { name: "Amara Osei", role: "Technical Evaluator", title: "Enterprise Architecture" },
    { name: "Marcus Feld", role: "Approver", title: "VP, IT" },
    { name: "Lena Whitfield", role: "Observer", title: "Legal" }
  ],
  financials: {
    tco_estimate: "$2.1M - $2.6M / 3-yr",
    tco_confidence: "Low",
    tco_basis: "Preliminary read from the initial scoring pass across 3 active bids; not yet BAFO-adjusted",
    award_basis: "Weighted Scorecard (70% Technical / 30% Commercial)"
  },
  anomalies: [
    { date: "2026-07-09", note: "A Semarchy contact reached a Technical Evaluator directly, outside the procurement-controlled channel" }
  ],
  next_action: "Schedule the Post-Submission scoring and calibration sessions before Demo Window opens July 25"
};

const QA = [
  { category: "Data Security & Privacy", answered: 6, pending: 0 },
  { category: "Integration & APIs", answered: 5, pending: 0 },
  { category: "Implementation Timeline", answered: 3, pending: 1 },
  { category: "Commercial Terms", answered: 3, pending: 0 },
  { category: "Support & SLAs", answered: 2, pending: 1 },
  { category: "Data Migration", answered: 2, pending: 0 }
];

const QA_OPEN = [
  { category: "Implementation Timeline", pending: 1, oldestDays: 12, routedTo: "Contracts Lead" },
  { category: "Support & SLAs", pending: 1, oldestDays: 9, routedTo: "Contracts Lead" }
];

const idx = phaseIndex(CASE.current_phase);
const daysToMilestone = daysBetween(CASE.as_of, CASE.key_dates.demo_window_start);
const staleDays = daysBetween(CASE.last_refresh, CASE.as_of);
const health = deadlineStatus(daysToMilestone, staleDays, 7);
const healthReasons = {
  "On-track": "No deadline or activity risk detected.",
  "At-risk": "Demo Window opens in " + daysToMilestone + (daysToMilestone === 1 ? " day" : " days") + " (" + CASE.key_dates.demo_window_start + ") and the scoring pair that precedes it is not yet on the schedule.",
  "Breached": "The next milestone date has passed without a logged completion.",
  "Stale": "No comms-log activity in " + staleDays + " days, past the 7-day cadence."
};
const healthReason = healthReasons[health];
const submitted = CASE.suppliers.filter(function (s) { return s.participation_status === "Submitted" || s.participation_status === "Confirmed"; }).length;
const invited = CASE.suppliers.length;
const askedTotal = QA.reduce(function (a, r) { return a + r.answered + r.pending; }, 0);
const answeredTotal = QA.reduce(function (a, r) { return a + r.answered; }, 0);
const pendingTotal = QA.reduce(function (a, r) { return a + r.pending; }, 0);
const lead = CASE.stakeholders.filter(function (s) { return s.role === "Lead"; })[0];

const QA_OPEN_ROWS = QA_OPEN.map(function (r) {
  return [
    { d: r.category },
    { d: r.pending, v: r.pending, a: "center" },
    { d: r.oldestDays + "d", v: r.oldestDays, a: "center", c: r.oldestDays > 10 ? R : AMB, b: true },
    { d: r.routedTo }
  ];
});

export default function CaseStatusVisual() {
  return <div style={{ fontFamily: "Arial, sans-serif", background: "#fff" }}>
    <div style={{ background: DK, padding: "12px 24px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>RFP Case Status</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{CASE.case_title}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>
          {CASE.case_id} | {CASE.category}<br />As of {CASE.as_of}
        </div>
      </div>
    </div>

    <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card title="RFx Event & Status Strip" note={"Phase " + (idx + 1) + " of " + PHASES.length}>
          <div style={{ marginBottom: 18 }}>
            <PhaseStepper current={CASE.current_phase} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <HealthPill s={health} />
            <span style={{ fontSize: 12, color: DK }}>{healthReason}</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Evaluation Panel</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CASE.stakeholders.map(function (s) { return <RosterChip key={s.name} s={s} />; })}
          </div>
          {CASE.anomalies.length > 0 && <div style={{ background: RISK, borderLeft: "3px solid " + R, borderRadius: 6, padding: "8px 12px", marginTop: 14, fontSize: 11, color: DK }}>
            <strong style={{ color: R }}>Comms-discipline flag: </strong>
            {CASE.anomalies[0].note} ({CASE.anomalies[0].date}).
          </div>}
        </Card>
        <Card title="What This Means" note="Situational read">
          <p style={{ fontSize: 12, color: DK, lineHeight: 1.7, margin: 0 }}>
            {CASE.case_id} ({CASE.case_title}) is in {CASE.current_phase}, phase {idx + 1} of {PHASES.length}, having closed proposal submission on {CASE.key_dates.proposals_due}. Participation held at {submitted} of {invited} invited suppliers: Reltio declined and Ataccama never responded, worth surfacing to the evaluation panel before scoring locks in a {submitted}-way field. The case reads {health}: {healthReason} Comms activity is current (last refresh {CASE.last_refresh}), so this is a deadline-driven read, not a stale-case one. Award basis is fixed as a weighted scorecard; TCO is a preliminary estimate from initial scoring, not yet BAFO-adjusted, so treat it as directional only.
          </p>
          <p style={{ fontSize: 12, color: DK, lineHeight: 1.7, marginTop: 10 }}>
            <strong>Next action: </strong>{CASE.next_action}.
          </p>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        <Metric label="Case" value={CASE.case_id} sub={CASE.category} />
        <Metric label="Current Phase" value={CASE.current_phase} sub={"Phase " + (idx + 1) + " of " + PHASES.length} />
        <Metric label="Next Milestone" value={daysToMilestone + (daysToMilestone === 1 ? " day" : " days")} sub={"Demo Window opens " + CASE.key_dates.demo_window_start} warn={health === "At-risk" || health === "Breached"} />
        <Metric label="Supplier Participation" value={submitted + " of " + invited} sub="Submitted of invited" />
        <Metric label="Sourcing Lead" value={lead.name} sub={lead.title} />
        <Metric label="Award Basis" value={CASE.financials.award_basis ? CASE.financials.award_basis.split(" (")[0] : "Pending"} sub={CASE.financials.award_basis || "Not yet defined on the case file"} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <Card title="Preliminary TCO" note={CASE.financials.tco_confidence ? CASE.financials.tco_confidence + " confidence" : undefined}>
          {CASE.financials.tco_estimate ? <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: DK }}>{CASE.financials.tco_estimate}</div>
            <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>{CASE.financials.tco_basis}</div>
          </div> : <StateBanner kind="NEEDS_INPUT" msg="No TCO estimate on the case file yet. This skill does not price or score responses (see Boundaries); populate from a case_handoff.json flag or a user-provided figure once scoring produces one." />}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card title="Q&A Distribution" note={askedTotal + " questions, compiled and anonymized"}>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={QA} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={BD} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: MUT }} allowDecimals={false} />
              <YAxis type="category" dataKey="category" width={150} tick={{ fontSize: 10, fill: DK }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="answered" stackId="qa" name="Answered" fill={BLU}>
                <LabelList dataKey="answered" position="insideRight" style={{ fontSize: 9, fill: "#fff", fontWeight: 700 }} />
              </Bar>
              <Bar dataKey="pending" stackId="qa" name="Pending" fill={AMB} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="pending" position="right" style={{ fontSize: 9, fill: AMB, fontWeight: 700 }} formatter={function (v) { return v > 0 ? v : ""; }} />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 10, color: MUT }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: BLU, marginRight: 5 }} />Answered ({answeredTotal})</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: AMB, marginRight: 5 }} />Pending ({pendingTotal})</span>
          </div>
        </Card>
        <Card title="What The Pattern Shows" note="Q&A read">
          <p style={{ fontSize: 12, color: DK, lineHeight: 1.7, margin: 0 }}>
            {askedTotal} questions were compiled and answered across the Q&A window, consolidated down from a higher raw count once the same underlying question raised by more than one bidder was merged into a single published answer, per the fairness rule in Comms Discipline. Questions clustered heavily in Data Security & Privacy and Integration & APIs, together over half the field, which typically signals the RFP's technical appendix under-specified those two areas rather than any one bidder's confusion.
          </p>
          <p style={{ fontSize: 12, color: DK, lineHeight: 1.7, marginTop: 10 }}>
            {pendingTotal} question{pendingTotal === 1 ? "" : "s"} remain open past the formal Q&A window. Because the fairness rule requires the same answer reach every active bidder, publish any addendum to all three active suppliers together rather than resolving it supplier by supplier.
          </p>
        </Card>
      </div>

      <Card title="Open Q&A Items" note={pendingTotal + " pending, compiled and anonymized (no bidder names)"}>
        <STable columns={[{ l: "Category" }, { l: "Pending", a: "center" }, { l: "Oldest", a: "center" }, { l: "Routed To" }]} rows={QA_OPEN_ROWS} />
      </Card>

    </div>

    <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
      <div>Case status as of {CASE.as_of} | Last refresh {CASE.last_refresh}</div>
      <div>Company Confidential | RFP Case Manager | 2026</div>
    </div>
  </div>;
}
```
