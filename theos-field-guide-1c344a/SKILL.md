---
name: theos-field-guide-1c344a
description: >
  Theo's Field Guide - work-graph personal command center. Organizes
  procurement work as Issues with Tasks, owner, state, evidence. Reads inbox/calendar/Teams via
  M365 connector. Classifies each inbound item (ACTIONABLE-ASK / WAITING / FYI-EVIDENCE / NOISE),
  then infers state from machine signals (Ariba, Adobe Sign / DocuSign / Ironclad, LEAH at
  contractpod.com) and closure cues across three confidence tiers; never auto-closes or
  auto-creates on a guess. Optional hashtag protocol with a terminal-state provenance guard.
  Self-contained HTML artifact dashboard that persists the work graph across sessions via window.storage, plus one-tap stale review. Migrates legacy
  daily_digest_state.json on first run. Triggers on "field guide", "what's on my plate", "show my
  issues", "morning briefing", "what needs my attention", "what's stale", "daily digest" (legacy
  alias). BOUNDARY: personal work tracker; for the skills catalog use procurement-launcher, for
  Lilly policy use process-navigator.
metadata:
  suite: v10.6.6
---

> **Build discipline (G10):** This skill emits a large single-file artifact. Assemble it across multiple writes, never one create_file call: scaffold first (imports, component shell, export), then append one section per write to /mnt/user-data/outputs, and run a structural self-test before present_files. A single oversized write can truncate the file mid-stream. Full rule: lilly-brand-assets guardrail G10.


<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Suite: v10.6.6**
>
> **Troubleshooting and usage guidance:** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports an error (dashboard not loading, widget not rendering, search box missing, output too thin), consult the shared user manual in lilly-brand-assets: in the inlined bundle, read the `## INLINED: references/user-manual.md` section inside `lilly-brand-assets-1c344a/SKILL.md`; in the un-inlined bundle, read `lilly-brand-assets-1c344a/references/user-manual.md`. If neither is available, answer from this skill's own instructions and say the shared manual was unavailable.

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
- **Suite:** v10.6.6
- **Skill:** Theo's Field Guide 🦖 (Personal Command Center, work-graph)
- **Version:** 2.5
- **Last Updated:** July 21, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation); M365 connector (Outlook, Teams, Calendar) preferred but degradable (see Hard Prerequisites); STRONGLY RECOMMENDED to run inside a dedicated Claude Project ("Daily Command Center")
- **Companion skills:** voice-profile (drafts, emits hashtag block when enabled), process-navigator (Lilly policy Q&A), timeline-builder (estimates), workflow-map (Issue task diagrams), meeting-prep-brief (one-page briefs), supplier-deep-dive (supplier context)
- **Renames:** daily-digest-1c344a (v1.0/v1.1) renamed to theos-field-guide-1c344a (v2.0). State file `daily_digest_state.json` renamed to `field_guide_state.json`. Trigger aliases preserved (including the legacy "daily digest" alias). **Deprecation horizon:** the "daily digest" trigger is a backward-compatibility alias kept through the v2.x line for users who learned the old name; on a first match in a fresh Project, the skill notes once that this is now Theo's Field Guide. Planned for removal at the next major (v3.0).
- **Changelog:**
  - v2.5 (July 21, 2026): **Personal Command Center: data-object-first JSON isolation; work-graph KPI strip; filter/lens; abstaining NBA; comms river + topic flow; renewal radar; savings; report card.** The engine's per-run payload moved out of an inline JS `FG_DELTA` literal into an inert `<script type="application/json" id="fgData">` island parsed defensively (`readDelta`, try/catch), so a malformed run can never break the main script or blank the board: it degrades to the saved/stored board with a non-blocking banner. The board's display name is promoted to **Personal Command Center** (label-only; skill id, storage key `theo.fieldguide.workgraph.v1`, export file `theo-workgraph.json`, and schema name `field_guide_state.json` are unchanged). Additive surfaces: a deterministic KPI strip; an Issues filter + lens bar (search + party/status/topic/channel chips); an abstaining Next-Best-Action zone (per-issue `confidence` pill and a grounded abstention state instead of a fabricated rec); a third **Comms** lane (SVG river of convergence + per-topic flow heat rows); and on-demand **Renewals radar**, **My Savings**, and **Report Card** views offered only when their data is present. Prune candidate id-24 (org-wide portfolio scale band) was intentionally NOT built (needs cross-user/org aggregation, a locked suite HARD-NO). No other skills changed.
  - v2.4 (June 10, 2026): **Dashboard moved to a self-contained, persistent artifact.** The board is no longer an inline widget; it is emitted as a single self-contained HTML artifact (`references/field-guide-engine.html`) that persists the work graph in the browser's per-user `window.storage` and carries it across conversations on its own. Each run the skill writes only a per-run delta (the current view) into the engine's `FG_DELTA` slot; the engine upserts it into the stored graph by issue id, so issues accumulate and update instead of being re-derived. Issue ids are now **deterministic slugs** (e.g. `veeva/vault-crm-transition`) rather than `<username>/<sequential>`, so the same real issue maps to the same id every run without the engine reading prior state back to Claude. Export / Import JSON in the board header is the portability net and the way to hand the full graph back into Claude's context. The Project-knowledge `field_guide_state.json` re-upload is retired as the persistence path (now an optional Export backup). Fonts dropped to system stacks with Sacramento kept only for the wordmark. Dual Submit preserved (`sendPrompt` where the host provides it, clipboard otherwise). Caveat: `window.storage` is readable only by the artifact, not by Claude, and cross-conversation persistence should be confirmed once on the tenant; the engine degrades gracefully (renders from the delta each run) and Export/Import is the fallback. No other skills changed.
  - v2.3 (June 2026): **Tabbed-card dashboard redesign + canonical lock + wider first-run scan.** Locked the dashboard into `references/dashboard-canonical.md` (Rule 8): five metric cards as nav/filter (Action / Waiting / Calendar / New / Stale; active card outlines in Lilly red), one list per view to kill the long scroll, inline accordion rows, a small red `×` to mark an item done with on-deck backfill, grouped Now what? / Refresh / Sync, a 7-day Calendar view with Prep buttons on Issue/counterparty meetings only, and the header wordmark `Personal Command Center`. Step 3 first-run scan widened from 24h to **1 to 2 weeks** with **unread inbound as a primary inclusion signal**. Step 7 now points at the canonical file; the legacy master-detail prose and inlined widget.html remain as fallback. No other skills changed.
  - v2.2 (June 2026): **v2.1 design port + canon fixes (Suite v10.6.3).** (1) Inlined the full **hashtag protocol** (grammar, 6-tag cap, precedence, terminal-state provenance guard, namespace-scoped authority) below; Step 4 Pass 1 now points to the inlined section instead of a missing hashtag-protocol companion file. (2) Added the named **classification vocabulary** (ACTIONABLE-ASK / WAITING / FYI-EVIDENCE / NOISE) with a single-pass `{class, issue_match[closed-set], confidence, reason}` judgment, deterministic TO/CC + Sent-items pre-filter, and auditable noise drops to `run_log`. (3) **Confirm-required inbound to Issue/Task proposal** (never auto-create). (4) Schema upgraded to **v2.2**: `history` is now an OBJECT (fixes `history.rejected_inferences[]` / `history.weekly_reviews[]` writes); added `waiting_since`, `repeat_request_count`, `ooo_until`, and `history.weekly_reviews[]`; asserting author recorded on every applied state change. (5) **"Who asserted this" confirm chip** on the Proposed Updates strip. (6) Fixed duplicate Step 10c numbering (Teach Mode is now Step 10a). (7) Reworded the Step 7 data-binding pointer to the inlined widget data-binding section. (8) Documented the previously-orphan `cowork_bridge_enabled` / `cowork_bridge_path` / `execution_mode` config fields as RESERVED (no behavior today). (9) Softened End-of-Day micro-action verbs from "sends/posts" to read-and-draft, consistent with S3/S4 and Rule 5. (10) Removed all em dashes (suite HARD RULE 7); zero U+2014 in this file. No other skills changed.
  - v2.1 (June 2026): **PCC enhancement wave: 4 new modes + 4 new features.** (1) **End-of-day mode** (Step 10c): 5-minute close-out ritual showing what completed today, what's stale and untouched, and the single first thing for tomorrow. (2) **Weekly review mode** (Step 10d): 15-minute Sunday/Monday ritual walking all Issues with state validation; surfaces "quiet but should be moving" and "waiting but worth checking" buckets via per-Issue picker walkthrough. (3) **"Now what?" suggestion engine** (Step 10e): single-output workflow returning the highest-leverage Issue for your next free time block, with reasoning; bypasses decision fatigue. (4) **Quick capture mode** (Step 10f): single-message Issue creation with smart-default inference and one-pass confirmation picker. (5) **OOO-aware inference** (Step 5 Tier M): parses inbound auto-replies; annotates Issues waiting on OOO people with their return date; dashboard sub-groups under "Waiting on people who are out." (6) **Cross-Issue relationship view** (Step 10): "show me all Issues involving [entity]" surfaces every Issue matching by title/project/owner/evidence. (7) **Email-to-Issue paste** (Step 10): paste an email body, get an Issue back with email attached as first evidence; inferred title/project/owner; one-pass confirmation. (8) **Owner-handoff drafter** (Step 10): when reassigning Issue owner, voice-profile drafts a handoff message to the new owner with Issue context summary. All additions preserve the v2.0 work-graph data model, dashboard structure, inference confidence tiers, and S4 opt-in discipline. No changes to other skills (composes with existing voice-profile, workflow-map, meeting-prep-brief, etc.).
  - v2.0 (June 2026): **MAJOR REFACTOR + RENAME** from daily-digest to Theo's Field Guide. The work-graph model replaces the flat-entry-list model. Issues are first-class objects with child Tasks, owner, state, project, evidence references. Issue IDs use `<username>/<sequential>` format (e.g., `lee_jordan/001`) for cross-user uniqueness. **Hashtag protocol** added: keyed format (`#status=` / `#owner=` / `#project=` / `#issue=` / `#priority=` / `#due=`), 6-tag cap per message, opt-in via `hashtag_generation` flag; Claude proposes hashtags in drafts so users don't memorize them; parse always-on inbound. **Inference rules** extended: three confidence tiers (high auto-update on machine signals from Ariba/Adobe Sign/DocuSign/Ironclad/LEAH-at-contractpod.com; medium auto-update with revert badge on textual closure cues; low surface as candidates for user confirmation). **Dashboard restructured** as inline HTML widget via `visualize:show_widget` (same pattern as procurement-launcher v2.4), master-detail layout, real clickable buttons via `sendPrompt()`; markdown fallback for environments without widget support. **Stale-review walkthrough** added: one-tap action in Stale section, auto-update attempt first, then per-Issue picker (Keep / Complete / Cancel / Snooze / Skip). **Migration** from legacy `daily_digest_state.json` on first install: copy backup, translate projects → Issues, entries → evidence under Issues or ungrouped[]. All status-request compose-flow logic preserved (composes process-navigator + timeline-builder + voice-profile). All existing actions (Draft Reply, Snooze, Mark Closed, etc.) preserved.
  - v1.1 (June 2026): Step 0a (Project acknowledgment) added to daily-digest. Preserved through the v2.0 rename into theos-field-guide.
  - v1.0 (June 2026): Initial release as **daily-digest**. Persistent stateful digest with stable-key entry merging. (Renamed to theos-field-guide at v2.0.)

# Theo's Field Guide 🦖

## Purpose

The personal work-graph for procurement. **You think in Issues, not emails** - this skill organizes your work that way. An Issue is a thing-being-worked (illustrative: SaaS Platform Renewal Negotiation, Adobe ELA Renewal, Vendor X Onboarding). Tasks are discrete actions inside it. Emails, meetings, chats, and documents become evidence attached to the right Issue.

The Field Guide reads your M365 surface, clusters cross-thread evidence to Issues, infers state from explicit signals (machine notifications, closure phrases, your own replies), respects explicit signals (hashtag protocol) when present, and renders a single dashboard answering "what's on my plate right now."

**Display name:** the board presents as your **Personal Command Center** (the primary wordmark), with "Theo's Field Guide" kept as the secondary signature tag. This is a label only: the skill id (`theos-field-guide-1c344a`), the storage key, the export filename, and the state-file schema name are all unchanged. The many internal "Field Guide" references throughout this skill keep their names.

**What this is:** your external brain for procurement work. The thing that knows which 47 emails belong to the SaaS platform renewal Issue, that the TPRM Task on that Issue is `complete` because the TPRM contact emailed yesterday with `Cleared with no findings`, and that the next action waiting on you is the pricing approval (due Friday).

**What this is not:** an auto-replier, an inbox monitor that fires in real time, a task ledger that auto-creates Tasks from every email, or a system that takes actions for you. It drafts, you send. It infers, you confirm ambiguous changes. The hashtag protocol gives you explicit signaling when you want it; the inference engine handles state when you don't.

**What changed from v1.x (daily-digest):** the abstraction. v1.x organized around communication primitives (entries per email/approval/signature). v2.0 organizes around work primitives (Issues with Tasks and evidence). Existing daily-digest users get migrated automatically - their `projects` become Issues, their entries with `project_key` become evidence under those Issues, standalone entries become `ungrouped[]` items.

## Persistence model (v2.4, authoritative)

The board is a self-contained artifact that holds the work graph itself, in the browser's per-user `window.storage`. This replaces the old pattern of re-uploading `field_guide_state.json` into Project knowledge every run.

Each run:
1. Scan and classify the M365 surface (Steps 3 to 6) into the current view: the issues that are live right now.
2. Build that view as JSON and write it as the CONTENTS of the engine's inert data island `<script type="application/json" id="fgData">` (`references/field-guide-engine.html`, Step 7). The engine parses it defensively (`readDelta`, try/catch); emitting DATA (JSON) rather than CODE (a JS literal) is the safety win, because a syntax error inside a `type="application/json"` block is not executed and cannot break the script. A malformed payload degrades to the last saved/stored board with a non-blocking banner, never a blank screen.
3. The engine loads whatever graph is already in `window.storage`, upserts the delta by issue id (new ids added, existing ids updated in place), writes the merged graph back, and renders. Meetings, `hidden_note`, `comms`, `savings`, and `reportCard` are replaced when the delta provides them and preserved when it passes null.

Two hard constraints follow from how artifact storage works, and this skill must honor both:

- **`window.storage` is readable only by the artifact, never by Claude.** Persistence makes the BOARD carry the graph across sessions. It does NOT give Claude memory of the graph in a fresh chat. Do not assume you can read prior issues back. When the user needs you to reason over the full accumulated graph (for example, "summarize everything open"), ask them to use the board's **Export** button and paste or upload that JSON, which rehydrates your context. Export/Import is also the backup if storage is cleared.
- **Issue ids must be deterministic slugs.** Because you cannot read prior ids back, the only way the engine upserts correctly instead of duplicating is if the same real issue produces the same id every run. Mint each id as `<supplier-or-owner-slug>/<topic-slug>`, lowercase and hyphenated, from the most stable anchor available (supplier name plus the core topic noun). Examples: `veeva/vault-crm-transition`, `sap/rise-security-exhibit`, `workday/flexcredits-renewal`. Do NOT put dates, status, or the full evolving title in the id. If two ids drift apart for one issue and duplicate, the user merges them with a staged direction.

Closure is explicit. An issue leaves the board only when the delta carries `close:true` for it, which you set after the user stages a "remove this" or "this is done" direction, or on a verified terminal machine signal per Step 5. The board never auto-closes on a guess. Stale issues no one has closed surface under the Aged view; the user prunes them.

A Claude Project is still recommended, now as the anchor for one canonical board artifact and the home for related files, not as the place a state file must be re-uploaded. The optional `field_guide_state.json` / Export JSON (appendix schema) is the bridge when you need the full graph in context, and a backup; it is no longer required for the board to persist.

Graceful degradation: if `window.storage` is absent (the board is opened outside an artifact host), the engine renders from the delta alone, so a run still produces a correct board for the current view; only cross-session accumulation is lost until storage is available.

## Hard Prerequisites

- **M365 connector** (Outlook, Teams, Calendar) is the primary input. It powers the automatic scan-and-classify of inbound work. **Graceful degradation when the connector is absent:** do NOT silently fail. Tell the user the connector is not available, then offer a **manual-tracker mode**: the user can still create and evolve Issues by hand and via Quick Capture (Step 10f) and Email-to-Issue paste (Step 10, paste an email body into chat), and the dashboard, hashtag protocol, state file, drafting, and on-demand actions all still work. The only capability lost without the connector is the automatic inbound scan (Step 3). State the gap plainly and proceed in manual-tracker mode; do not pretend a scan ran.
- **Recommended: run inside a Claude Project** ("Daily Command Center" or similar) to anchor one canonical board artifact and keep related files together. Persistence now lives in the board artifact via window.storage (see Persistence model), so the work graph carries across conversations without re-uploading a state file. Without a Project the board still persists per user; a Project only keeps you anchored to one canonical artifact.
- **Other primitives degrade gracefully too:** if `visualize:show_widget` is unavailable, render the Markdown fallback (Step 7). If `ask_user_input_v0` is unavailable, present the same enumerable choices as a numbered prose list and ask the user to reply with a number. Drafting goes through voice-profile; if voice-profile is not installed, produce a plainly-labeled draft inline. Per S3/S4 and Rule 5, no primitive ever auto-sends.

## Inputs

### MUST
- M365 connector access (Outlook mailbox, Calendar, Teams chats you participate in).

### RECOMMENDED
- A dedicated Claude Project to anchor one canonical board artifact (persistence lives in the artifact; see Persistence model).
- On first run: user confirmation of identity (name + work email) so the skill can detect "addressed to you" cleanly.

### OPTIONAL
- Named SharePoint sites for active RFx projects (scopes the search to those sites in addition to your inbox).
- A short list of active projects with stakeholder rosters (lets the digest tag mentions to projects and pre-populate the status-update flow).

## Workflow

### Step 0a: Project Recommendation + Acknowledgment (first invocation only)

**ALWAYS runs first when no state file is found.** Before doing any scanning, building, or asking about mode, surface the Project guidance and get explicit acknowledgment from the user. This is a BLOCKING step.

**Context to share with the user:**
- This skill works best when run from inside a single dedicated Claude Project (e.g., "Daily Command Center"). One Project, many conversations.
- Persistence lives in the board artifact via window.storage (see Persistence model). The work graph carries across conversations on its own; you do not re-upload a state file each run.
- The Project's job is to anchor you to one canonical board artifact and hold related files. Export the board's JSON anytime as a backup or to hand the full graph back into a chat.

**IMPLEMENTATION REQUIREMENT.** Render the picker via `ask_user_input_v0`. Exact call:

```
ask_user_input_v0(questions=[{
  "question": "Theo's Field Guide works best inside a single dedicated Claude Project (e.g., 'Daily Command Center'). One Project, one canonical board; the board itself persists your work graph across sessions. How do you want to proceed?",
  "type": "single_select",
  "options": [
    "Yes, I'm in the right Project - proceed",
    "I need to set up / switch to a dedicated Project first (stop and let me do that)",
    "Proceed without a Project (the board still persists; I just won't be anchored to one canonical artifact)"
  ]
}])
```

**Map the user's choice:**
- **"Yes, in the right Project"**: record `project_acknowledged: true`. Proceed to Step 0 (mode selection). Skip Step 0a on every subsequent run.
- **"Need to set up / switch"**: STOP. End the turn with clear instructions: "Set up a Claude Project (recommend naming it 'Daily Command Center'). Start a new conversation inside that Project. Re-invoke this skill. Your future runs will persist state automatically." Do not proceed.
- **"Proceed without a Project"**: record `project_acknowledged: true` and `no_project_mode: true` in the board's stored graph (or in an Export JSON if you keep one). Proceed to Step 0. The board still persists the work graph across sessions via window.storage; a Project would only keep you anchored to one canonical artifact and hold related files. No per-run state upload is required.

**Skip Step 0a entirely on any run where the state file exists AND `project_acknowledged: true`.** The user has already established their setup; do not re-prompt.

### Step 0: Mode Selection

Default mode is **Daily Run** if no `field_guide_state` is present, or **Refresh** if state exists and the last run was today. Ask explicitly only on ambiguous invocations.

**IMPLEMENTATION REQUIREMENT.** Render this picker by calling the `ask_user_input_v0` tool. Do NOT output the options as a prose bullet list. Exact call:

```
ask_user_input_v0(questions=[{
  "question": "What do you want to do?",
  "type": "single_select",
  "options": [
    "Daily Run (morning briefing, build/refresh full digest)",
    "Refresh (re-scan since last run, update existing entries, add new)",
    "End-of-day mode (close out today: what you completed, what's stale, first thing for tomorrow)",
    "Weekly review (walk all Issues, validate state, catch what fell off this week)",
    "Now what? (suggest the highest-leverage Issue for your next free time block)",
    "Quick capture (single-message Issue creation; minimal friction)",
    "On-demand action (specify: draft reply / status update / pull context / cross-Issue view / etc.)",
    "Manage state (snooze items / mark closed / edit roster / first-time setup)"
  ]
}])
```

### Step 1: State Load (BLOCKING for everything except first-run setup)

Persistence lives in the board artifact (window.storage), which Claude cannot read (see Persistence model). So the normal run does NOT load a prior state file: you scan the M365 surface, build the current view, and let the board upsert it into the graph it already holds. Continuity across runs comes from deterministic issue ids, not from re-reading state.

Load a prior state file ONLY in these cases:
- **The user uploads an Export JSON** (or one is in Project knowledge) and wants Claude to reason over the full accumulated graph this run. Read it, use it as context, and reflect it back into the delta.
- **First run / no board yet:** there is nothing to load. Build fresh from the scan; the board creates the stored graph on first render.

The optional Export / `field_guide_state.json` schema is in the appendix.

### Step 2: Identity + Scope Confirmation (first run only)

Confirm:
- User's work email address (used to detect "you're addressed", "you sent", "you're in CC")
- User's display name variants (used for @-mention detection)
- Optional: named SharePoint sites for active RFx scopes (multi-select). Default: none.

### Step 3: Scan + Classify

For the time window since the last run, pull from the M365 connector. On a first run (no prior state), look back **1 to 2 weeks**, not 24 hours, to catch items that should already be on the board. **Unread inbound is a primary inclusion signal:** an unread email addressed to the user is treated as likely board-worthy work unless it classifies as NOISE. Pull:
- **Inbox messages received** (including reads/unreads, flagged status, importance flag)
- **Sent items** (used for "you replied" detection and "you're the asker" detection)
- **Calendar events** for the next **7 days** (grouped by day in the dashboard; conflicts flagged; meetings tied to an Issue or an external counterparty get a Prep action, holds and personal/OOO blocks do not)
- **Teams chats** you participate in (1:1 + channels), filtered to messages mentioning you, addressed to you, or in threads you've replied to recently
- **Named SharePoint sites** if scoped: document/comment activity where you're tagged

**Classify each inbound item with the named work vocabulary.** This is the engine that answers "is this work?" - the suite's core job. Tagging does NOT solve this on its own: a hashtag only helps on a thread that already carries one, and the hard-to-classify items (a supplier's free-text ask, a colleague's "can you take a look?") have no hashtag. Classification identifies work in untagged inbound; hashtags are a confirmation and override layer for work already known.

Every inbound item (email, Teams message, doc comment) is classified into exactly ONE class:

| Class | Means | Routes to |
|---|---|---|
| `ACTIONABLE-ASK` | A request, assignment, or approval where the next move is on YOU | `ungrouped[]` Direct Ask, then surfaces as a confirm-required new-Issue/Task PROPOSAL in the chat turn (Step 6). Never auto-created. |
| `WAITING` | Continuation of known work where the next move is on someone ELSE | State change on the matched Issue/Task (per the confidence tiers in Step 5) |
| `FYI-EVIDENCE` | Relevant to known work but no action (status note, attachment, cc) | Append as `evidence`, bump `last_activity`. No state change. |
| `NOISE` | Newsletter, notification, reply-all chatter, personal: not work | Drop, auditably (see below) |

**How the classification runs (one pass, not four):**

1. **Deterministic pre-filter (free, no model tokens):** thread role (you on the **TO** line vs **CC**; BCC is not reliably exposed on received mail) plus the Sent-items cross-check. "Addressed to me on TO + imperative + not yet replied" is a near-deterministic `ACTIONABLE-ASK`. A machine-signal sender (Ariba / Adobe Sign / DocuSign / Ironclad / LEAH) routes straight to the high-confidence parsers in Step 5. Items already on a known thread (stable-key match in Step 4 Pass 2) skip straight to `WAITING` or `FYI-EVIDENCE`.
2. **Single structured judgment** over whatever survives the pre-filter, returning `{ class, issue_match, confidence, reason }` in one call. This folds the three former clustering passes (subject, entity, time) plus classification into one judgment.
   - `issue_match` is constrained to a **closed set**: an existing open Issue id, or `NONE`. Pass the model the current open Issues; it may NEVER invent a new Issue id. This keeps matching trustworthy.
   - `reason` is a one-line justification ("matched SaaSRenewal entity + closure phrase") that powers the Tier-M "tap to revert" chip and the confirm prompts.
3. **`confidence` maps to the three tiers in Step 5**, which decide whether the routing auto-applies, applies-with-revert, or surfaces as a candidate.

**Precision-favoring default:** when the work signal is weak, classify `NOISE` and drop, rather than flooding the dashboard with false work. But drops are **auditable**: increment an `items_dropped` count in `run_log` and surface a collapsed "N filtered as noise - show?" line in the chat turn that hands back the board (Step 6), so a misclassified ask is always recoverable, never silently invisible.

**Learning loop (reuse what exists):** the per-pair rejection suppression in Step 5 already teaches the system. An optional first-run calibration (at most 3 questions: "any distros or newsletters I always ignore?") seeds it. No probabilistic sender-reputation scoring; this is deterministic, clean-binary-signal classification.

An item may also carry a secondary category tag (e.g., an `ACTIONABLE-ASK` that is also a Status Request) used only for routing the right action surface; the primary class above is what drives state.

### Step 4: Match Against Existing State (KEYED MERGE + ISSUE CLUSTERING)

**v2.4 framing.** In the default run the board holds the work graph (window.storage), which Claude cannot read, so you are not matching against a state file you load. Do two things instead: (1) cluster the current scan's cross-thread evidence into issues, and (2) mint each issue's deterministic id (Persistence model) so the board upserts onto the right issue. The keyed-merge logic below applies (a) within the current scan to cluster evidence, and (b) against an uploaded Export JSON on runs where the user wants full-graph context.

For each scanned item, perform a multi-pass match against `field_guide_state.json`:

**Pass 1: Hashtag override (highest priority).**
If the item body contains a hashtag block, parse keyed hashtags (`#issue=`, `#task=`, `#status=`, etc.) per the **Hashtag Protocol section (inlined below)**. When `#issue=<id>` is present, the item is evidence on that Issue - skip all clustering inference. When `#status=` is present to a NON-terminal state (`open` / `active` / `waiting` / `blocked`), override inferred state with no confirmation. When `#status=` is present to a TERMINAL state (`complete` / `cancelled`), apply the **terminal-state provenance guard** (inlined below): auto-apply only when the verified Microsoft Graph sender is you; from anyone else, route it through the Tier-L confirm candidate instead of auto-closing. Read only the FIRST hashtag block in the body (ignore quoted blocks from earlier messages).

**Pass 2: Stable-key evidence match.**
Match against existing evidence entries in any Issue (or in `ungrouped[]`) by the category's stable key:

| Category | Stable Key |
|---|---|
| Email thread items | Outlook conversationId |
| Calendar / RSVP | event id |
| Teams messages | chat thread id + message id |
| Ariba approval request | requisition number (parsed from email body) |
| Ariba watch / approved | requisition number |
| Signature requests (Adobe Sign / DocuSign / Ironclad) | envelope or document ID |
| LEAH notifications (sender @contractpod.com) | case or contract ID (parsed from email body) |
| Document/comment tag | source doc ID + comment ID |
| Status request | conversationId + project tag (if identifiable) |

On stable-key match: update `last_seen`, increment age, detect closure signals (see Step 5), increment `repeat_request_count` if a bump signal is present.

**Pass 3: Issue clustering (only if no stable-key match).**
Try to infer which existing Issue this item belongs to, in order of confidence:
1. **Exact subject match** (stripping `Re:` / `Fwd:`) against any Issue's evidence titles → propose link with `confidence: medium`, `confidence_source: subject_exact`
2. **Entity match** - extract named entities (supplier name, project name) from subject + first paragraph; match against Issues' `project`, `title`, `tags` → propose with `confidence: medium`, `confidence_source: entity_match`
3. **Participant + topic + time-proximity match** → propose with `confidence: low`, `confidence_source: time_proximity`

Clustering threshold: at most 3 cluster proposals per item. If more than 3 Issues match, surface as a "pick which Issue" picker.

**Pass 4: No match → ungrouped.**
If passes 1-3 yield nothing, create entry in `ungrouped[]` with the stable key and category. The item is now a standalone Action item the user can later promote to an Issue.

### Step 5: Update / Close Logic (CONFIDENCE-TIERED)

**Tier H (HIGH - auto-update, no badge):**
- Hashtag-driven NON-terminal state changes (`#status=open/active/waiting/blocked` applied verbatim). Hashtag-driven TERMINAL state changes (`#status=complete/cancelled`) auto-apply at Tier H ONLY when the verified Graph sender is you; from any other sender they drop to Tier L (confirm candidate). Provenance is read from the verified Microsoft Graph sender (`message.from`), never from the body `#owner=` text (which anyone can type). See the inlined Hashtag Protocol, "Provenance & trust."
- Machine-emitted closure signals from system senders:
  - Ariba: subject contains "Approved" + matching requisition number → mark approval Task complete
  - Adobe Sign / DocuSign / Ironclad: "Signed by all parties" / "Completed" → mark signature Task complete
  - **LEAH (sender @contractpod.com):** "Executed" → mark contract Task complete; "In Negotiation" → state active; "Cancelled" → mark cancelled
- Calendar API confirms RSVP submitted → mark RSVP Task complete
- User-as-last-author in a thread (cross-check sent items) on an Issue/Task that was `waiting` for the user's reply → mark Task complete

**Tier M (MEDIUM - auto-update WITH visible "✓ inferred - tap to revert" badge):**
- Closure-phrase detection in inbound from Issue's owner or user: "this is done", "all set", "no further action", "completed", "resolved", "closed out" → Issue/Task → complete
- Thread gone quiet past `stale_threshold_days` (default 14) on an `active` Issue → propose state → `waiting`
- "Blocked by" / "waiting on" phrases with named party → state → `blocked` or `waiting`
- **OOO-aware update (v2.1, extended v2.2):** when an inbound automatic-reply ("I'm out of office until [date]") is received from a person who is the `owner` on any Issue in state `waiting`, annotate that Issue with an `ooo_until: <parsed-date>` field. The engine renders an "OOO until [date]" badge next to those Issues in the Issues lane (they already sit under `state: waiting`). Does not change Issue state, just adds context so the user stops wondering why Bob hasn't replied. **OOO-clear (v2.2):** the annotation auto-clears once the current date passes `ooo_until`, AND on any new inbound activity from that owner (which proves they are back), whichever comes first. **OOO-conflict surface (v2.2):** if the user schedules or proposes a meeting (visible on calendar) with an owner whose `ooo_until` is still in the future, surface a gentle "[owner] is out until [date]" note on that meeting's Meeting Prep entry so the user does not waste a slot waiting on someone who is away.

**Tier L (LOW - surface as candidate, DON'T auto-update):**
- Issue gone quiet past `auto_close_quiet_days` (default 30) with no closure signal → "Mark complete?" confirm candidate surfaced in the chat turn (Step 6), not on the board
- Owner-change inference (someone else's name keeps appearing as the responsible party) → "Reassign owner to X?" candidate
- Weak clustering matches from Pass 3 → "This might belong to Issue Y - link it?" candidate
- Foreign-sender terminal-state hashtag (`#status=complete/cancelled` from someone who is not you) → "[asserting author] marked this complete - confirm?" candidate, naming who asserted it (from the verified Graph sender)
- **New-work proposal (confirm-required inbound to Issue/Task).** An `ACTIONABLE-ASK` (Step 3) with `issue_match: NONE` surfaces as a one-tap proposal: "This looks like new work - track it as an Issue?" Claude has already read the thread and pre-drafted the Issue title / owner / due. Accept creates the Issue (and links the asserting evidence); Reject or Dismiss logs the rejection and leaves the item in `ungrouped[]`. **Nothing is ever created without the user's tap.** Fully autonomous, no-confirm Issue creation remains deferred (see RESERVED config note in the schema).

**Never auto-close, never auto-create, on a guess.** Complete and Cancelled states, and creation of any new Issue or Task from inbound, require explicit user action (button, your own hashtag, or manual command). Inference can propose; only the user (or their own explicit hashtag) commits.

**Rejected inferences log.** When a user reverts a Tier-M change or rejects a Tier-L candidate, log it to `history.rejected_inferences[]` (the `history` object, see schema) to suppress re-suggestion of the same change on the same Issue+source pair.

**Asserting author recorded.** Every APPLIED state change records who asserted it in `history.state_changes[]`: `self`, `assistant-draft`, or the verified external sender identity, alongside the old-to-new state and timestamp. This gives a procurement-defensible "who said this was done" trail and powers the chat-turn "[asserter] marked this complete - confirm?" confirm candidate (Step 6).

**Snoozed items:** respect `snooze_until` dates. Do not surface before the date. There is no Snoozed tab; a snoozed item simply does not appear in the Issues lane until `snooze_until` passes (Step 6), and any snooze or unsnooze is handled in-conversation.

### Step 6: Categorize for the Board (ISSUE-CENTRIC)

The engine is a two-lane board (see `references/dashboard-canonical.md`): an **Issues** lane and a **Meeting Prep** lane. Map each item to a lane and, for issues, to a `state` ("action" or "waiting") plus the fields the Priority / Aged / Newest sorts read. Keep the categorization ISSUE-CENTRIC: the unit is the Issue, and sub-Tasks show inside their parent, never as independent rows.

| Lane / field | Contains |
|---|---|
| **Issues lane, `state: "action"`** | Issues where the next action belongs to the user (formerly "Action Needed"): state `open` or `active` with the ball in your court, plus ungrouped items requiring user action (Direct Asks, Approvals awaiting you, Signature requests for you, LEAH/Ariba items, doc/comment @-tags, RSVPs not yet sent) promoted to Issues. |
| **Issues lane, `state: "waiting"`** | Issues where another party owns the next move (formerly "Waiting On"): state `waiting` or `blocked`, plus Approvals you submitted still pending, Replies you're awaiting, and OOO signals on people you're waiting for (informational). |
| **Issues lane, `dueSoon` + Priority sort** | Deadlines today / tomorrow on any Issue set `dueSoon: true` and a `due` label so the **Priority** sort floats them to the top; there is no separate "Today / Tomorrow" bucket for issue deadlines. |
| **Issues lane, `age` + Aged sort** | Aged work (formerly "Stale"): Issues past `stale_threshold_days` (default 14) carry an `age` label and surface via the **Aged** sort. The Aged-Review walkthrough (Step 10b) runs over them. There is no separate Stale tab or `[ Review stale ]` button. |
| **Meeting Prep lane** | Meetings today and tomorrow (and the near forward set), linked to their Issue via `link` when matchable, each with `prep_md` notes. Read-only. |

Snoozed items are simply not surfaced until `snooze_until` passes (respect the date per Step 5); the board has no Snoozed tab. A single Issue appears once, in the Issues lane, under whichever `state` its primary state qualifies for. Sub-Tasks may show within their parent Issue's expanded view but don't appear independently.

**Tier-L confirm candidates surface in the chat turn, not on the board.** The engine has no "Proposed Updates" strip. When Tier-L candidates are pending (Step 5), surface them in the conversation as part of the turn that hands back the board, each as an explicit ask the user answers in chat - never auto-applied (Step 5's "never auto-close, never auto-create, on a guess" still holds). Three kinds:
- **Confirm-candidate state change, naming WHO asserted it** (not a bare "inferred"): "TPRM marked 'Aravo TPRM submission' (lee_jordan/001.2) complete - confirm?" A terminal-state hashtag from anyone other than you lands here, never auto-applied.
- **New-work proposal** (the confirm-required inbound to Issue flow): "New work? 'Review the SaaS vendor's audit-rights redline by Fri' (from John Smith) - track as an Issue?"
- **Auditable noise drops:** a "N filtered as noise - show?" line so dropped items are recoverable.

Reject / Dismiss logs the rejection (to `history.rejected_inferences[]`) to suppress re-suggestion. Accept records the asserting author in `history.state_changes[]`.

### Step 7: Render Dashboard (SELF-CONTAINED ARTIFACT - primary)

**CANONICAL DESIGN (authoritative):** the layout is the shipped engine `references/field-guide-engine.html`, with `references/dashboard-canonical.md` as its written spec. It is a two-lane board: an **Issues** lane (a left rail of issue rows sorted by Priority / Aged / Newest, with a right detail panel showing current state and the recommended next move) and a **Meeting Prep** lane (your next meetings with prep notes). The wordmark reads `Theo's Field Guide` in the Sacramento webfont; Theo paces the footer. You do not rebuild the board; you fill it with data.

**Primary output: a self-contained HTML artifact that persists via window.storage.** This is the v2.4 change: the board is no longer an inline `visualize:show_widget`, because inline widgets do not persist across sessions. Emit the engine as a downloadable artifact so its window.storage carries the work graph across conversations (see Persistence model).

**How to render each run:**
1. Read `references/field-guide-engine.html`. It is a complete board carrying an inert JSON data island `<script type="application/json" id="fgData">` (its contents are an illustrative seed you overwrite).
2. Build the current view as a JSON object: `synced` (a short stamp like "Jul 22, 9:12 AM CDT"; keep it ASCII), `today` (ISO date `YYYY-MM-DD`, used for deterministic days-to-expiry), `issues` (array; fields below), `meetings` (the current forward-looking set, or null to keep what is stored), `hidden_note` (string or null), and the optional `comms` / `savings` / `reportCard` objects (or null to keep what is stored; omit to hide). Every issue id is a deterministic slug (Persistence model).
3. Replace the CONTENTS of the `#fgData` block with your JSON (do NOT reintroduce a JS `FG_DELTA` literal), write the result to `/mnt/user-data/outputs/theo-field-guide.html`, and present it with `present_files`. **The contract is: emit valid JSON as the data island's contents each run.** It is parsed defensively; a bad payload degrades to the saved board with a banner, never a blank screen. Per guardrail G10, write the file in segments (scaffold, then the `#fgData` block, then the remainder) rather than one oversized create_file call, and JSON-validate the island before presenting. The storage key `theo.fieldguide.workgraph.v1` and export filename `theo-workgraph.json` are frozen; do not rename them.

**#fgData issue fields:** `id` (deterministic slug), `title`, `party` (supplier or owner), `priority` ("high" or "med"), `state` ("action" or "waiting"), `state_md` (an HTML paragraph on where it stands), `rec_md` (an HTML paragraph on the recommended next move), `due` (short label like "Jul 25" or "Past due"; optional), `dueSoon` (boolean), `opened` (short label like "Jul 8"; optional), `age` (short label like "14d"; optional), `close` (true to drop the issue; omit otherwise). Keep `state_md` and `rec_md` as connected prose per the narrative standards, not bullet fragments. New optional fields (absence hides that surface): `confidence` ("high" | "med" | "low"), `abstain` (boolean), `abstain_reason` (string; the grounded signal that is missing), `abstain_resolve` (string; what would resolve it), `topic` and `channel` (strings; drive the filter/lens chips), `unblocks` (string; drives a why-chip), and `renewal` (`{ expiry, notice_by, auto_renew }`, ISO dates; drives the Renewals radar). When the model cannot ground a confident next move, set `abstain:true` (or `confidence:"low"`) and fill `abstain_reason`; the engine renders the grounded abstention state instead of a fabricated recommendation (Marc HARD RULE: ground + confidence + abstain).

**Personal Command Center views (what the engine renders from `#fgData`):**
- **KPI strip** (always): deterministic counts over the projected graph (Open issues, Action now, Waiting, Meetings ahead, Aged 7d+). No fabrication.
- **Issues lane** (always): the two states (action / waiting) with Priority / Aged / Newest sorts, PLUS a filter + lens bar (search over title/party/id and toggle chips built from the parties, states, and any `topic`/`channel` tags present), a per-issue `confidence` pill, and the abstaining Next-Best-Action zone. The Issues home (no row selected) shows a ranked **Next best actions** block with deterministic why-chips, a muted "N item(s) need more signal" line linking to abstaining issues, and a "Waiting on others" mini-list.
- **Meeting Prep lane** (always): the forward meetings with `prep_md`. Read-only.
- **Comms lane** (always present in the toggle; empty state when no `comms`): the `comms` object `{ topics:[{id,label}], nodes:[{topic,date,status,label,cite}], flow:[{topic,days:[0..3 intensities]}] }` renders a deterministic SVG river of convergence (fixed horizontal topic lanes, status-ringed nodes; statuses Agreed=blue, Open=neutral, Disputed=amber, Flagged=red) plus per-topic flow heat rows with an active / stalled tempo read. Clicking a node shows its label and citation.
- **Renewals radar** (on-demand; offered only when any issue carries `renewal{}`): soonest-first list with days-to-expiry (from `today`), notice-by date (overdue flagged red), auto-renew pill, and the Renew / Renegotiate / Recompete recommendation carried in the issue's `rec_md`.
- **My Savings** (on-demand; offered only when `savings{}` present): `{ committed, achieved, ci, ca, target, pipeline:[{name,amount,status}] }` renders an achieved hero, a target-progress bar, a cost-improvement vs cost-avoidance split bar, and the pipeline with status pips. All sums deterministic.
- **Report Card** (on-demand, optional; offered only when `reportCard{}` present): `{ gpa, categories:[{name,value,target,grade}], bandwidth:{load,sustainable} }` renders a GPA, a graded category list, and a load-vs-sustainable bandwidth gauge.

**Reconciliation gate (F8), runs before either figure view paints.** `savings{}` and
`reportCard{}` are model-populated per run, so a bad number would otherwise render silently
and read as fact. The engine now refuses the affected VIEW, naming the field and the
problem, and leaves the rest of the board alone. Refusing the whole board over one savings
typo would trade a wrong number for a dead screen, which is the opposite of the engine's
standing promise that a bad payload never blanks it.

Asserted on `savings{}`: `achieved <= committed`; `ci + ca == achieved`, so the split bar
and the hero cannot disagree; every monetary field numeric and non-negative; every pipeline
amount numeric (a `"TBD"` would otherwise coerce to `$0` and render as a real figure).

Asserted on `reportCard{}`: grades come from a recognised set, and values/targets are
numeric.

**NOT asserted, deliberately: the relationship between `gpa` and `categories`.** No formula
is defined anywhere in this skill, and **the shipped seed does not foot under the obvious
reading**: its grades (B, C, B, A, D) average 2.60 against a stated GPA of 3.4. Asserting a
rule here would INVENT one rather than enforce it, and would then fail the engine's own
seed. **This is an open question for Marc**: either the GPA is weighted (in which case the
weights need stating), or it is an independent self-assessment (in which case it should be
labelled as one rather than presented above a category list that implies it is their
average). Until then it renders as supplied, with the categories beside it, and neither
claims to derive the other.

**Not built (documented skip):** prune candidate id-24, the org-wide "portfolio scale band" ($X org portfolio / N reps), was intentionally not built. It requires cross-user / org aggregation, which is a locked suite-wide HARD-NO. A purely personal spend tile could be added later if a personal spend source (ARIA / SHARP) is wired; it is out of scope now.

**The board, the user, and Submit:** the user reads the board, opens rows, types a direction per item ("draft the reply and cc Liza", "move to waiting", "this is done, remove it"), and stages them. One **Submit** sends all staged directions back to you in a single turn via `sendPrompt` where the host provides it, or the clipboard hand-off otherwise (the engine does both). You carry out the directions, and on the next render fold the results into the delta, including `close:true` for anything the user marked done.

**Export / Import:** the board header carries Export and Import. Export downloads the full stored work graph as JSON; Import loads one back. Point the user to Export when they want a backup or want you to reason over the whole graph (they paste or upload the JSON to rehydrate your context).

**Graceful degradation:** if the artifact surface or `present_files` is unavailable, render the same content as a Markdown board (same two lanes, per-row actions via `ask_user_input_v0` pickers) and tell the user the interactive board was not available this run. Cross-session persistence resumes when the artifact surface is back.

### Step 8: On-Demand Actions per Issue / Task / Ungrouped item

In widget mode, each row in the right-panel detail view exposes real clickable buttons that fire `sendPrompt(<text>)` to invoke the action - same mechanism as launcher's "Go" rows. The Field Guide skill catches the fired message via its trigger phrases or natural-language routing.

**Per-Issue actions:**

| Button | Fires via sendPrompt | What it does |
|---|---|---|
| **Open ▸** | `open issue <issue-id>` | Renders the Issue detail view (Issue's Tasks, evidence, full action set) |
| **Draft reply** | `draft reply on issue <issue-id>` | Composes via voice-profile DRAFT, using the most recent thread on the Issue as context |
| **Draft status update** | `draft status update on issue <issue-id>` | Triggers the status-request compose flow (see Step 9) |
| **Build workflow map** | `build workflow map for issue <issue-id>` | Invokes workflow-map with issue_id parameter |
| **Prep for next meeting** | `prep me for the next meeting on issue <issue-id>` | Invokes meeting-prep-brief with the Issue's next calendar event |
| **Mark complete** | `mark issue <issue-id> complete` | User-asserted closure; moves Issue to `history.closed_issues[]` and records the change in `history.state_changes[]` (asserter `self`) |
| **Update state** | (fires inline state picker) | Open/active/waiting/blocked/cancelled choices |
| **Add task** | `add a task to issue <issue-id>` | Walks user through new Task creation |
| **Reassign owner** | (fires inline owner picker) | User selects from past owners or types new |
| **Snooze** | (fires inline date picker) | Snooze until selected date |
| **Explain this state (v2.2)** | `explain the state of issue <issue-id>` | Reads `history.state_changes[]` for this Issue and answers, in plain language, why the Issue is in its current state, who last asserted the change, when, and via which signal (hashtag / machine signal / inference tier / manual). A one-tap inference-audit affordance. Read-only. |

**Per-Task actions** (in Issue detail view):

| Button | What it does |
|---|---|
| **✓ Complete** | Marks Task complete; updates parent Issue's progress count |
| **Reassign** | Owner picker |
| **Add due date** | Date picker |
| **Edit title** | Inline edit field |

**Per-Ungrouped-item actions** (type-specific):

| Item type | Actions available |
|---|---|
| Direct ask (email) | Draft Reply / Forward to SME / Snooze / Mark Closed / Promote to Issue |
| Ariba approval | Approve via Ariba ▸ (deep link to Ariba) / Defer 24h / Promote to Issue |
| Signature request | Sign via Adobe/DocuSign ▸ (deep link) / Defer 24h / Promote to Issue |
| RSVP | Pre-fill RSVP / Defer / Promote to Issue |
| LEAH notification | Open in LEAH ▸ / Mark seen / Promote to Issue |

**Markdown-fallback mode** for ALL of these: same actions, but presented via `ask_user_input_v0` pickers when the user invokes any "expand" action on a row. Equivalent function, less polished.

Per S4, every outbound action produces a DRAFT that the user reviews and sends. The Field Guide never auto-sends.

### Step 9: Status-Request Compose Flow (called from Step 8 for status-request entries OR on demand)

When the user invokes "Draft Status Update" on a status-request entry, or asks "draft a status update on [project]":

1. **Identify the project.** From thread context, project tag, or one-tap pick from the user's tracked project list.
2. **Pull current state** from the project's record in `field_guide_state` (last known milestones, current phase, stakeholder roster, open dependencies, last update date).
3. **Check freshness.** If last update is within configurable threshold (default: 7 days), proceed to draft. If stale, surface the choice:

**IMPLEMENTATION REQUIREMENT.** Render via `ask_user_input_v0`:

```
ask_user_input_v0(questions=[{
  "question": "Project info is stale. How do you want to proceed?",
  "type": "single_select",
  "options": [
    "Draft based on what I have, with caveats noted (fastest)",
    "Draft stakeholder outreach first, send status once they reply (most accurate)",
    "Both: draft outreach now AND draft the status update with current best estimate"
  ]
}])
```

4. **Process navigator** answers "what phase are we in" given current state and answers downstream questions (does this need TPRM? what's the contract instrument?).
5. **Timeline builder** takes phase + factor values + complexity tier and produces the remaining-time range with delay drivers named.
6. **Voice-profile DRAFT** composes the reply in the user's voice, applying the executive or peer register based on who asked.
7. **If "draft outreach" was selected,** also produce one targeted email per stakeholder asking the specific question needed. Per S4, present as drafts only.
8. **Emit** the status reply draft + (optional) the outreach drafts. User taps to send.

The status reply has a structured shape (per Operating Rule 8):
- Headline: estimated remaining duration as a range
- Driven by: 2-4 factor callouts (e.g., "TPRM full review running in parallel", "negotiation on 3rd of typical 4 turns")
- Confidence label
- What would tighten it (named missing inputs)

### Step 10: Other On-Demand Actions (invoked outside a specific entry)

- **Summarize this thread:** user pastes or names a thread; skill collapses to "what happened + what's open."
- **Find prior context on a topic:** searches the user's own mail/Teams history for anything relevant to a given topic; returns a structured list with links.
- **Pull everything on supplier X / project Y:** cross-source aggregation across email, Teams, files (M365-reachable only), calendar. Returns a structured brief with links. (Equivalent to a "mini deep-dive" if the supplier is the subject; can call supplier-deep-dive if the user wants the full canonical profile.)
- **What did I commit to in this thread?:** extracts the user's own commitments from a conversation (their replies, their action items). Useful for "what did I promise?"
- **Stakeholder roster edit:** add / edit / remove a project's roster.
- **Snooze / unsnooze a specific item.**
- **Mark closed by key:** force-close a specific entry (used when the user knows it's done offline).
- **Cross-Issue relationship view (v2.1):** triggered by "show me all issues involving [supplier/project/entity]" - surfaces every Issue whose title, project tag, owner, or evidence references match the entity. Output is a compact list grouped by state with last-activity ordering. Useful for vendor-relationship reviews and category-strategy moments.
- **Email-to-Issue paste (v2.1):** user pastes an email body (or quotes one) into chat and says "turn this into an Issue" / "capture this email as an Issue." Skill creates an Issue with the email body summary as `title`, attempts to infer `project` and `owner` from the content, attaches the email as the first evidence entry, and surfaces the new Issue for the user to refine. One round of inline pickers offered for editable fields.
- **Owner-handoff drafter (v2.1):** when reassigning an Issue's owner, the skill calls voice-profile to draft a handoff message to the new owner (in the user's voice, with appropriate register for "handing off ownership"). The draft references the Issue's context, summarizes current state, and lists open Tasks. User reviews and sends per S4.

- **Help options menu (v2.2):** triggered by the `?` button in the widget header or by the phrase "show me Theo's Field Guide help options" / "Field Guide help." Renders an `ask_user_input_v0` single-select with two paths:

  ```
  ask_user_input_v0(questions=[{
    "question": "How can I help?",
    "type": "single_select",
    "options": [
      "Teach me how to use the Field Guide",
      "Open the user manual (full suite reference)"
    ]
  }])
  ```

  - **"Teach me..."** runs the **Teach Mode** flow (Step 10a). It explains: (a) what the Field Guide is and how the work-graph model differs from inbox triage; (b) the persistent-list nature: this Project remembers your Issues, Tasks, evidence, and stakeholders across every session; (c) how to use the **hashtag protocol** in conversation (e.g., `#status=waiting`, `#owner=sarah.k`, `#project=qms-rollout`, `#priority=high`, `#due=2026-07-15`); (d) how to use **@-mentions in emails and messages** so that when the Field Guide reads inbound from M365, it picks up the right person, project, or supplier (`@vendor:Workday`, `@project:QMS-Rollout`, `@stakeholder:sarah.k@lilly.com`); (e) which natural-language phrases route to which actions; (f) the always-available action surface from the right-side panel.
  - **"Open the user manual..."** fires `generate the user manual as a Word document` (reaches lilly-brand-assets' inlined manual + builder), or, if the user already has the current user-manual DOCX on their Desktop, instructs them to open it directly.

### Step 10a: Teach Mode (Field Guide-specific)

Five short blocks, each ~6-10 sentences, paced one at a time with a "next" picker so the user can stop whenever:

1. **What the Field Guide actually is.** Issues (not emails) as the unit of work. Two-level tree: Issue → Tasks. Evidence is what the Issue connects to in M365 (emails, meetings, files). State persists in this Claude Project forever.
2. **The persistent list.** This Project holds your live operating state - Issues, Tasks, owners, project tags, evidence. It updates every time you open the Field Guide and every time you (or the skill) edit an Issue. Don't recreate Projects; reuse this one.
3. **Hashtags in your messages to me.** When you tell me something I can structure, drop a hashtag and I'll capture it cleanly. Examples: `add an issue: legal hasn't returned the DPA redline #status=waiting #owner=lisa.m #project=workday-renewal #priority=high #due=2026-07-08`. Cap 6 hashtags per message - past that, it's noise.
4. **@-mentions in emails and messages.** If you mark people, vendors, or projects with `@`-prefix in the text you send me (or in your sent mail that I read via the connector), I anchor on them: `@sarah.k`, `@vendor:Workday`, `@project:QMS-Rollout`. Helps me cluster correctly across disconnected threads.
5. **Right-side panel actions.** Status, reassign, add task, snooze, edit, add note, mark complete, cancel, archive - all always available. Open-source / draft-reply / mark-complete / snooze are quick icons top-right. Recommended next steps appear contextually based on Issue age, evidence type, and stakeholder pattern. Evidence items link back to the source email / meeting / file.

After block 5, offer: "Want a worked example? I'll walk through creating a fresh Issue with hashtags, then evolving it across a week."

### Step 10b: Aged-Review Walkthrough (invoked over the Issues lane's Aged sort)

When the user asks to review their aged issues (the ones the Issues lane surfaces under its **Aged** sort, past `stale_threshold_days`), run the walkthrough in the chat turn:

**Pre-walkthrough: auto-update attempt.**
Before showing any prompts, run inference ONE more time on every stale item:
- Re-check for any new inbound activity since last refresh
- Re-evaluate closure-phrase detection in recent messages
- Re-check system signals (Ariba/Adobe Sign/DocuSign/Ironclad/LEAH)
- Items that resolve at this step are auto-updated and DROP OUT of the walkthrough

**The walkthrough.**
For each remaining stale Issue (or stale ungrouped item), present one inline picker. Walks through items one at a time, not as a batch table - matches a low-friction, one-at-a-time attention pattern.

**IMPLEMENTATION REQUIREMENT.** Render via `ask_user_input_v0`:

```
ask_user_input_v0(questions=[{
  "question": "[N of M] <Issue title>. Last activity: <X days ago>. Owner: <owner>. Project: <project>. What do you want to do?",
  "type": "single_select",
  "options": [
    "Keep open",
    "Mark complete ✓",
    "Mark cancelled ✗",
    "Snooze 30 days",
    "Skip (decide later)"
  ]
}])
```

Apply the user's pick, advance to next item. Typical run handles 3-5 items in under 60 seconds.

**Why this design:**
- Auto-update attempt first means we don't bother the user about things the system can decide
- One Issue at a time means focused attention (not a 20-item table)
- Five options cover every common user intent
- "Skip" lets users defer ambiguous items without committing
- No mandatory cadence - user invokes when they have a minute

### Step 10c: End-of-Day Mode (v2.1)

Triggered by selecting "End-of-day mode" in Step 0, or by user saying "end of day" / "close out today" / "wrap up today" / "EOD field guide".

**Different focus from Daily Run.** Daily Run is "what landed and needs attention." End-of-day is "what closed, what didn't, and what's first tomorrow." Designed as a 5-minute end-of-workday ritual.

**Workflow:**

1. **Scan since the morning run (or since last activity)** - pull inbox/calendar/Teams updates the same as a Refresh, but with date-bounded today-only filter.

2. **Categorize differently from Daily Run.** Use three sections (an in-conversation walkthrough, distinct from the board's two lanes):
   - **Completed today** - Issues / Tasks that closed (auto or manual) during today's working hours. Celebrates progress.
   - **Stale and untouched** - Issues you didn't make progress on AND that were already stale entering today. Surface these gently; the question is "snooze, recommit tomorrow, or accept it's not happening."
   - **First thing tomorrow** - the single Issue most worth grabbing tomorrow morning. Suggested by ranking: due-soonest with high priority, then waiting-on-you that's been stale, then anything you flagged "tomorrow" today.

3. **Optional micro-actions per section** (all read-and-draft; nothing is auto-sent or auto-posted, per S3 and Rule 5):
   - On "Completed today": one-tap "celebrate" closure note WRITTEN to your personal log file in Project knowledge (a local state write, not an outbound send). Optional.
   - On "Stale and untouched": one-tap snooze-to-Monday OR mark cancelled (for things you've decided to drop). These are local state changes you initiate.
   - On "First thing tomorrow": one-tap calendar-block DRAFT, prepared as a calendar-event proposal for tomorrow morning's first hour and handed to you to place in Claude-in-Outlook. The Field Guide drafts it; you confirm and create it. It never creates the event for you.

4. **Brief closing line:** "🦖 Today: closed N · stalled M · tomorrow start with: [Issue title]. Field Guide will pick this up in your morning run."

End-of-day mode does NOT auto-mark anything. It surfaces, you decide.

### Step 10d: Weekly Review Mode (v2.1)

Triggered by selecting "Weekly review" in Step 0, or by user saying "weekly review" / "weekly check-in" / "sunday review" / "what fell off this week".

**Designed as a 15-minute Sunday-evening or Monday-morning ritual.** Catches Issues that drifted during the week - the things work-management loses track of without an external trigger.

**Workflow:**

1. **Compute the working-week window** - default Monday-Friday of the week being reviewed (configurable). Pull all Issues with `last_activity` in that window AND all Issues that were `active` or `waiting` at any point during the week (regardless of activity).

2. **Group into four review buckets:**
   - **Moved this week** - Issues that progressed (state changed, Tasks closed, evidence added). Read-only "good news" section.
   - **Quiet but should be moving** - Issues in `active` or `open` with no activity all week. These are the danger zone.
   - **Waiting but worth checking** - Issues in `waiting` with no inbound activity. Decide whether to nudge.
   - **Newly created this week** - Issues born this week. Confirm they're well-defined.

3. **Per-Issue picker walkthrough** for the "Quiet but should be moving" and "Waiting but worth checking" buckets only:

```
ask_user_input_v0(questions=[{
  "question": "[N of M] <Issue title>. Last activity: <X days ago>. State: <state>. What do you want to do?",
  "type": "single_select",
  "options": [
    "Keep on track (commit to action next week)",
    "Snooze 1 week",
    "Move to blocked (name what's blocking)",
    "Mark complete or cancelled",
    "Reassign to someone else",
    "Skip (decide later)"
  ]
}])
```

4. **Summary at end:** "🦖 This week: N moved · M quiet · K waiting · L new · J reviewed. Next week: [top recommended focus]."

The summary saves to `field_guide_state.json.history.weekly_reviews[]` so over time the user can see week-over-week patterns. Privacy-respecting: just counts, not contents.

### Step 10e: "Now What" Suggestion Engine (v2.1)

Triggered by selecting "Now what?" in Step 0, or by user saying "what should I do next" / "now what" / "best next action" / "what's the highest-leverage thing right now".

**Single-output workflow.** Not a dashboard. The Field Guide returns ONE suggestion with reasoning, and offers to start it.

**Workflow:**

1. **Estimate available time block:** check calendar for the next free window (≥30 minutes between meetings). Default assumption: 60-90 minutes free if nothing else is on the calendar.

2. **Rank candidate Issues** by leverage:
   - **Due soonest with high priority** - heaviest weight
   - **Waiting on you that's been stale** - the things rotting because you've been distracted
   - **Quick-win-eligible** - Issues where one drafting action (reply, status, signature) would unblock the next move
   - **Recent activity from a counterparty** - the iron is hot
   - **Promised something today** - commitments you made earlier
   
   Pure ranking, no machine learning. Deterministic from state.

3. **Return ONE suggestion with reasoning:**
```
🦖 Next-best: SaaS Platform Renewal Negotiation (Issue lee_jordan/001)

Why: Due in 3 days. The pricing approval Task has been waiting on you for 4 days
and the steering committee meeting is tomorrow morning. Closing this Task this
afternoon clears the meeting and unblocks the next negotiation round.

Estimated effort: 30-45 min.

[ Open this Issue ▸ ]   [ Show me another option ]   [ Not now ]
```

4. **If the user picks "Show me another option,"** rank-2 surfaces. Up to 3 alternatives.

Never produces a list of N options up front. The point is to bypass decision fatigue.

### Step 10f: Quick Capture Mode (v2.1)

Triggered by selecting "Quick capture" in Step 0, or by user saying "quick capture" / "remember this" / "I just heard about [thing], capture it" / "capture this" / "make this an Issue".

**Minimal-friction Issue creation.** User describes the thing in one message; skill creates the Issue with smart defaults.

**Workflow:**

1. **Parse the user's message** for: title (the main subject), project (any project keywords detected), priority (any urgency cues), owner (default to user; override if user mentions someone else).

2. **Default everything else:**
   - `state` = `open`
   - `created` = today
   - `due` = null (unless user mentioned a deadline)
   - `tasks[]` = empty (Issue starts taskless; user adds Tasks as the work emerges)
   - `evidence[]` = empty (no inbound evidence at creation)

3. **Confirm via one inline picker** showing the inferred fields:

```
ask_user_input_v0(questions=[{
  "question": "🦖 Captured: '<inferred title>'. Project: <inferred project or 'none'>. Owner: @<inferred owner>. Priority: <inferred priority or 'medium'>. Looks right?",
  "type": "single_select",
  "options": [
    "Yes - create the Issue with these defaults",
    "Edit the title",
    "Edit the project tag",
    "Edit the priority",
    "Edit the owner",
    "Cancel - don't create"
  ]
}])
```

4. **On confirmation** (or after user edits any field), save to `field_guide_state.json.issues[]` and return: "🦖 Captured as lee_jordan/<N>. Tap to open: [open Issue]. Or keep working."

5. **No mandatory follow-up.** User can immediately get back to whatever they were doing. The Issue exists; details can be added later.

Designed for the failure mode "I'll remember to track that" - captured in 15 seconds, no ceremony.

### Step 11: Persist State

Persistence is automatic: when the board renders, the engine writes the merged work graph back to window.storage (see Persistence model). You do not emit or ask the user to re-upload a state file to keep the board.

Offer an Export only when it helps: as a backup, or when the user wants the full graph in a fresh chat. The board's Export button produces that JSON; the appendix documents its shape.

## Deliverables

- **Dashboard** -- a self-contained HTML artifact that persists the work graph across sessions via window.storage; always rendered on Daily Run / Refresh.
- **Export JSON** (optional) -- the board's Export button produces the full work graph as a backup or to rehydrate Claude's context; no per-run state upload is required.
- **Drafts** (replies, status updates, outreach) -- only when invoked, never automatic.
- **On-demand outputs** (thread summaries, prior-context lists, cross-source pulls, commitment extracts).

## Cross-Skill Handoffs

This skill orchestrates:
- **voice-profile** for any drafting action.
- **process-navigator** for process / threshold / system-requirement answers feeding the status flow.
- **timeline-builder** for duration estimates in the status flow.
- **supplier-deep-dive** when the user invokes the full canonical supplier profile from a Pull-Everything action.
- **rfp-case-manager** when an active RFx project's daily updates align with case-manager state (informational link only; this skill doesn't write into case-manager's case files).

## Hard Rules (skill-specific; the shared guardrails also apply)

**Rule 1: M365 connector is the primary input, with graceful degradation.** The connector powers the automatic inbound scan. If it is unavailable, do not hard-fail: tell the user clearly, then run in manual-tracker mode (Quick Capture, Email-to-Issue paste, manual Issue editing, dashboard, drafts, and state all still work; only the automatic scan is lost). Never pretend a scan ran when the connector is absent. See Hard Prerequisites.

**Rule 2: Scope is the user's own M365 surface only.** Their inbox, sent items, calendar, Teams chats. Plus named SharePoint sites only when explicitly scoped. NEVER reads anyone else's mailbox, shared mailboxes the user isn't a member of, or systems outside M365.

**Rule 3: Stable keys mandatory.** Every entry has a stable key per category (see Step 4 table). Without a key, the entry is logged once and not persisted across runs.

**Rule 4: Auto-update on clear signal only.** Auto-close requires a documented closure signal (Approved, Signed, Cancelled, you-replied, prep-attached, RSVP-submitted). Ambiguous closures are proposed to the user, never auto-decided.

**Rule 5: Never auto-send.** Per S4, every outbound (reply, RSVP, status update, stakeholder outreach, forward) is drafted and presented. The user taps to send. The skill never claims to have sent anything.

**Rule 6: No fabrication of state.** If the data doesn't show a deadline, don't invent one. If a thread is silent, don't guess it's closed. If a stakeholder role is unknown, don't assign one. Honest "unknown" beats invented certainty.

**Rule 7: The board shape is fixed.** Per Operating Rule 8, do not add / drop / rename the board's two lanes (Issues and Meeting Prep) or the Issues-lane sorts (Priority / Aged / Newest) based on the day's content. A lane with nothing in it renders empty; it is not replaced by a bespoke section invented for the day.

**Rule 8: Repeat-request escalation (display-only).** When `repeat_request_count >= 2` on any item, the dashboard SORTS that entry to the top of the Issues lane (within its `state`, "action" or "waiting") and adds a "bumped" badge, so the user sees they have been chased. This is a render-time ordering and a badge only: it does NOT mutate the item's `priority` or `state` (consistent with the schema note that `repeat_request_count` is non-actuating, and with Rule 6 no-fabrication).

**Rule 9: Data stays in user-controlled surfaces.** This skill reads only from M365-accessible sources you have explicitly connected, and writes state only to the Claude Project Knowledge of the Project you have designated as your Daily Command Center, or to downloadable files you control. It does not write to external endpoints, does not POST to Fabric, and does not push state to any other destination.

**Rule 10: User is the reconciler.** When in doubt, surface to the user. Snooze, mark-closed, ambiguous-closure confirm: all are user actions. The skill never decides for them on judgment calls.

## Hashtag Protocol (inlined below)

The hashtag protocol is the user-controlled signaling layer. When hashtags appear in email bodies, Teams messages, or document comments, the Field Guide reads them as explicit directives that bypass inference. It is **opt-in, optional, and additive**: the Field Guide works with zero hashtags in circulation (inference is the default mode). Hashtags reduce inference burden over time as users adopt them.

### Grammar and the 6-tag cap

Keyed format. One hashtag per piece of metadata. Lowercase keys, free-form values. **Hard cap of 6 hashtags per message, on one line, at the bottom of the body.** Past the cap it is noise; ignore extras beyond the first six.

```
#status=<state> #owner=<identity> #project=<tag> #issue=<issue-id> #priority=<level> #due=<YYYY-MM-DD>
```

Most messages use fewer (3-4 typical). One of each type per message. `#task=<id>` may appear in place of `#issue=` when the message refers to a specific Task (the Task ID format `<username>/<NNN>.<K>` makes the parent Issue derivable).

| Key | Allowed values | Example |
|---|---|---|
| `#status=` | `open` / `active` / `waiting` / `blocked` / `complete` / `cancelled` | `#status=waiting` |
| `#owner=` | M365 @-mention for Lilly identities; `external/<label>` for non-Lilly | `#owner=@lee_jordan`, `#owner=external/SaaSVendor` |
| `#project=` | Free-form tag, no spaces (camelCase or hyphens) | `#project=SaaSRenewal` |
| `#priority=` | `high` / `medium` / `low` | `#priority=high` |
| `#due=` | ISO date `YYYY-MM-DD` | `#due=2026-08-15` |
| `#issue=` | An existing Issue id, `<username>/<sequential>` | `#issue=lee_jordan/001` |
| `#task=` | An existing Task id, `<username>/<sequential>.<K>` | `#task=lee_jordan/001.3` |

Six is the natural set: status, owner, project, issue, priority, due. These map 1:1 to fields the Field Guide uses. The cap keeps the block visually contained (one line, roughly 100 characters).

### Discoverability: users do not memorize hashtags

Claude proposes hashtags in drafts; users edit or accept. When `config.hashtag_generation: true`, the voice-profile and rfp-case-manager drafting paths auto-populate the block from draft context (recipient to `#owner=`, intent to `#status=`, matched Issue to `#issue=`/`#project=`, body deadline to `#due=`). The user glances at the suggested block, edits anything wrong, and sends. Users who type their own mail in Outlook without hashtags lose nothing: the Field Guide infers state from those messages via the connector.

### Precedence (when hashtag and inference disagree)

1. **Explicit hashtag wins over inference for NON-terminal states.** A thread carrying `#status=open/active/waiting/blocked` moves the Issue/Task there regardless of other inference, with no confirmation and no revert badge. The author explicitly signaled it.
2. **Terminal-state provenance guard.** A `#status=` that sets a TERMINAL state (`complete` or `cancelled`) auto-applies ONLY when the verified sender is you (the Field Guide owner). From anyone else (counterparty, SME, colleague) a terminal `#status=` becomes a LOW/confirm candidate ("[author] marked this complete - confirm?"), never a silent auto-close. This upholds "complete requires explicit user action."
3. **Provenance comes from the verified Microsoft Graph sender** (`message.from`), NEVER from the body `#owner=` value (which is plain text anyone can type, and is therefore spoofable). Self is matched against the user's stored `name_variants`. Note: "it is in my Sent items" is not by itself proof of self-authorship, because a tag can ride inside a quoted block in a message you merely forwarded; self-authorship detection considers block position, not just folder.
4. **No-confirmation cases:** non-terminal hashtag-driven changes, and terminal changes asserted by verified-self, do not require confirmation.
5. **Conflict handling:** if multiple recent messages in a thread carry conflicting `#status=` values, the most recent message wins (subject to the terminal-state guard). Read only the FIRST hashtag block in a body; ignore quoted blocks from earlier messages.

### TERMINAL-STATE PROVENANCE GUARD (the core v2.1 rule)

In one line: provenance is derived from the verified Graph sender; a terminal-state assertion (`#status=complete`/`cancelled`) auto-applies only when that sender is you; from anyone else it is a confirm-candidate. All other hashtag fields keep their existing behavior. Surfacing: the dashboard shows WHO asserted the change ("TPRM marked this complete - confirm?") rather than a bare "inferred," and the asserting author is recorded in `history.state_changes[]`. This reuses the existing LOW/confirm machinery: no new subsystem, no enum, no cryptographic signing.

### Namespace-scoped authority

A `#status=`/`#owner=` directive drives a LOCAL Issue's state only when its `#issue=`/`#task=` is in YOUR OWN namespace. A foreign-namespace tag (`#issue=lee_jordan/001` arriving in Jane's inbox) is recorded as evidence on whatever local Issue the thread clusters to, but never drives Jane's state machine. A tag governs its author's own object. Issue IDs are username-namespaced (`<username>/<sequential>`) precisely so two users can never mint the same ID; cross-user federation is out of scope.

### Owner parsing

`#owner=@JordanLee` and `#owner=JordanLee` both resolve to Jordan (strip the leading `@`). Identity resolution against the M365 directory is best-effort; if no match, the literal string is used as the owner label. `#owner=` is single-valued; a comma-list like `#owner=@a,@b` is treated as one literal label (it does not create co-owners). To track two parties in parallel, create two Tasks. Owner changes follow the same provenance discipline: a foreign-authored `#owner=` is recorded but surfaced as a candidate, never auto-applied.

### Issue and Task linkage

`#issue=lee_jordan/001` links the message as evidence to that Issue with `confidence: high`, `confidence_source: hashtag` (skips clustering). `#task=lee_jordan/001.3` additionally links to a specific Task; if the Task does not exist, the Field Guide proposes creating it. Evidence linkage is never gated by the terminal-state guard: only the state transition is gated. A hashtag never auto-creates an Issue (`#issue=new-thing` does not conjure one); it must already exist, or the Field Guide proposes creation.

### Provenance & trust

Anyone may write a tag (you, Claude in drafts, a counterparty) because a hashtag is plain text in a message body and restricting authorship is unenforceable. The real control is not who may write a tag but which author is trusted to auto-apply state, which is what the terminal-state provenance guard above governs. No cryptographic signing (explicitly rejected: it needs key management this design forbids and solves a threat that does not exist at this trust level).

### Visibility and on-wire posture

For Phase 1 (Claude.ai with the read-only M365 connector) the hashtag block, when emitted, appears at the bottom of the body separated by a horizontal rule and a blank line, visible to recipients, one line, up to 6 hashtags. **The durable source of truth is your `field_guide_state.json`, anchored to the work object, not the wire.** A visible footer travels only when you want the signal to reach another tool-user (reciprocity); with `hashtag_generation` defaulting off, that is opt-in and rare. "Hidden tag today" means the tag is tracked in your state and the visible footer is toggled off on the draft. Truly-invisible on-wire tags (custom `X-` headers, zero-width steganography, HTML comments, Graph open extensions) are NOT pursued: headers do not survive a reply, steganography is the exact ASCII-smuggling pattern Purview/DLP will flag, and the rest die on plain-text replies or copy-paste. The voice-profile DRAFT output offers a per-draft "include hashtag block" toggle (defaults ON when `hashtag_generation` is true) so the user can strip the block for any specific external recipient.

### Worked example (inbound terminal tag from a counterparty)

Jordan receives, from their TPRM contact:

```
Jordan - TPRM full review on the SaaS platform renewal is complete. Cleared with no findings.

---
#status=complete #owner=external/TPRM #project=SaaSRenewal #task=lee_jordan/001.2
```

Parse: the verified Graph sender is the TPRM contact, not Jordan, so the terminal `#status=complete` does NOT auto-apply. It becomes a LOW/confirm candidate surfaced in the chat turn (Step 6) ("TPRM marked lee_jordan/001.2 complete - confirm?"). The `#task=` evidence link is applied immediately (linkage is not gated). On Jordan's one-tap confirm, the Task moves to `complete` and the asserting author (TPRM contact) is recorded in `history.state_changes[]`; on reject, the Task stays and the rejection is logged to suppress re-suggestion. Had Jordan sent `#status=complete` from their own account, it would auto-apply with no confirmation.

### Opt-in mechanism

Default `config.hashtag_generation: false`: drafts emit without blocks. Turn on via "enable hashtag generation"; turn off via "disable hashtag generation." Inbound parsing reads hashtags REGARDLESS of this flag; the flag only controls whether the user's own drafts include the block. Invalid hashtags are ignored silently (the thread is still tracked via inference); the parse failure is logged for debugging.

## Appendix: field_guide_state.json Schema (v2.2 - work-graph)

> **v2.4 note:** this Claude-side schema is now OPTIONAL. The board persists the work graph itself in window.storage, and the board's Export button produces JSON in this shape. Use it as a backup or to hand the full graph back into a chat; it is no longer re-uploaded each run as the persistence path. See Persistence model.

```json
{
  "version": "2.2",
  "user": {
    "display_name": "[User Name]",
    "email": "[user]@lilly.com",
    "username": "[username]",
    "name_variants": ["[User Name]", "[First Initial]. [Last Name]", "[First Name]"]
  },
  "scope": {
    "named_sharepoint_sites": []
  },
  "setup": {
    "project_acknowledged": true,
    "no_project_mode": false,
    "acknowledged_on": "2026-06-01"
  },
  "config": {
    "hashtag_generation": false,
    "state_backend": "project_knowledge",
    "send_mode": "draft_only",
    "stale_threshold_days": 14,
    "auto_close_quiet_days": 30,
    "end_of_day_enabled": true,
    "_reserved": {
      "execution_mode": "on_demand",
      "cowork_bridge_enabled": false,
      "cowork_bridge_path": null
    }
  },
  "next_issue_number": 1,
  "issues": [
    {
      "id": "lee_jordan/001",
      "title": "SaaS Platform Renewal Negotiation",
      "state": "open",
      "owner": "@lee_jordan",
      "project": "SaaSRenewal",
      "priority": "high",
      "due": "2026-08-15",
      "created": "2026-06-15",
      "last_activity": "2026-06-20",
      "waiting_since": null,
      "repeat_request_count": 0,
      "ooo_until": null,
      "tasks": [
        {
          "id": "lee_jordan/001.1",
          "parent_issue_id": "lee_jordan/001",
          "title": "Submit Aravo for TPRM",
          "state": "complete",
          "owner": "@lee_jordan",
          "due": "2026-07-01",
          "depends_on": [],
          "created": "2026-06-15",
          "completed_at": "2026-06-22",
          "evidence_refs": []
        }
      ],
      "evidence": [
        {
          "key_type": "outlook_thread",
          "key": "AAQkADAxYmIxAAA...",
          "title": "Re: SaaS Platform Renewal Steering Committee",
          "counterparty": "John Smith (SaaS vendor)",
          "captured": "2026-06-20",
          "last_seen": "2026-06-22",
          "deep_link": "https://outlook.office.com/...",
          "confidence": "high",
          "confidence_source": "hashtag"
        }
      ],
      "user_notes": "",
      "tags": [],
      "confidence": "high",
      "abstain": false,
      "abstain_reason": null,
      "abstain_resolve": null,
      "topic": "Renewal",
      "channel": "Email",
      "unblocks": "steering review",
      "renewal": { "expiry": "2026-08-20", "notice_by": "2026-08-05", "auto_renew": true }
    }
  ],
  "ungrouped": [
    {
      "key_type": "ariba_approval_request",
      "key": "PR-12345",
      "title": "Approve PR-12345 from John Smith",
      "deadline": "2026-06-25",
      "state": "open",
      "first_seen": "2026-06-22",
      "last_activity": "2026-06-22",
      "deep_link": "https://ariba.com/...",
      "snooze_until": null,
      "repeat_request_count": 0
    }
  ],
  "snoozed": [],
  "history": {
    "closed_issues": [],
    "state_changes": [
      {
        "object_id": "lee_jordan/001.2",
        "old_state": "waiting",
        "new_state": "complete",
        "asserted_by": "external/TPRM (tprm.contact@lilly.com)",
        "at": "2026-06-23 14:05",
        "via": "user_confirmed_candidate"
      }
    ],
    "rejected_inferences": [],
    "weekly_reviews": []
  },
  "run_log": [
    {
      "ran_at": "2026-06-22 08:00",
      "mode": "daily_run",
      "items_added": 12,
      "items_updated": 4,
      "items_auto_closed": 2,
      "items_proposed_closure": 1,
      "items_dropped": 9
    }
  ],
  "today": "2026-07-22",
  "comms": null,
  "savings": null,
  "reportCard": null
}
```

### Schema notes
- `version` is `2.2`. v2.2 changes from v2.0: `history` became an OBJECT (was an array); added `waiting_since`, `repeat_request_count`, `ooo_until` on the Issue; added `history.weekly_reviews[]`; added asserting-author capture in `history.state_changes[]`; added `run_log[].items_dropped`. Migration from a v2.0 state file wraps the old `history[]` array into `history.closed_issues` and the old top-level `rejected_inferences[]` into `history.rejected_inferences`.
- `next_issue_number` tracks the sequential counter for generating new Issue IDs. Format: `<username>/<zero-padded-3-digit>`. Increments on Issue creation.
- `issues[]` is the work graph. Each Issue carries its tasks and evidence directly (not in a separate table).
- `waiting_since` (Issue): date the Issue most recently entered `waiting`/`blocked`; null on any non-waiting transition. Drives the "gone dark" nudge (how long the counterparty has been silent). Distinct from `repeat_request_count`.
- `repeat_request_count` (Issue and ungrouped): count of times the counterparty re-pinged the same open ask (the "chasing me" signal). Display-only and non-actuating: surfaced in the dashboard, never auto-changes priority or state. Incremented at most once per inbound message via a message-id idempotency set so on-demand re-scans do not double-count.
- `ooo_until` (Issue): parsed return date when an OOO auto-reply is received from the Issue owner the user is waiting on; clears automatically after the date passes (Step 5, Tier M).
- `ungrouped[]` is standalone Action items not yet promoted to an Issue. Same field structure as evidence + a `state` field.
- `history` is an OBJECT, not an array. Its members:
  - `history.closed_issues[]` is for closed Issues and resolved ungrouped items. Searchable but not in the main dashboard.
  - `history.state_changes[]` is the audit trail of APPLIED state changes. Each record names the asserting author (`self` / `assistant-draft` / the verified external sender identity), the old-to-new state, the timestamp, and `via` (how it was applied). Powers the "[asserter] marked this complete - confirm?" chip.
  - `history.rejected_inferences[]` logs Tier-M reverts and Tier-L candidate rejections to suppress re-suggestion of the same change on the same Issue+source pair.
  - `history.weekly_reviews[]` stores Weekly Review summaries (counts only, not contents) for week-over-week patterns (Step 10d).
- **Board / render fields (v2.5, all OPTIONAL; absence hides that surface).** These are carried in the `#fgData` per-run delta and persisted onto the stored graph (and therefore appear in an Export). On the Issue: `confidence` ("high" | "med" | "low"; renders a pill), `abstain` (boolean) and `abstain_reason` / `abstain_resolve` (strings; when set, the board shows a grounded abstention state instead of a fabricated recommendation), `topic` and `channel` (strings; drive the Issues filter/lens chips), `unblocks` (string; drives a Next-Best-Action why-chip), and `renewal` (`{ expiry, notice_by, auto_renew }`, ISO dates; drives the Renewals radar and the days-to-expiry chip). Top-level board objects: `today` (ISO date; anchors deterministic days-to-expiry), `comms` (`{ topics[], nodes[], flow[] }`; the Comms river + topic flow), `savings` (`{ committed, achieved, ci, ca, target, pipeline[] }`; the My Savings view), and `reportCard` (`{ gpa, categories[], bandwidth{load,sustainable} }`; the Report Card view). Like `meetings` and `hidden_note`, a top-level board object is replaced when the delta provides it and preserved when it passes null. None of these fabricate: counts, sums, days-to-expiry, and tempo reads are computed deterministically from the values given, and a low-confidence or abstaining issue never shows a confident action.

### Migration from `daily_digest_state.json`

On first invocation of Theo's Field Guide in a Project that has the legacy file:

1. Copy `daily_digest_state.json` to `daily_digest_state.json.backup` (preserves the original).
2. Resolve user's username from `user.email` field (split on `@`, take left side).
3. Translate structure:
   - `user`, `scope`, `setup` → carry over verbatim (add `username` field)
   - `config` → carry over + add new fields with defaults (`hashtag_generation: false`, `state_backend: "project_knowledge"`, `send_mode: "draft_only"`, `stale_threshold_days: 14`, `auto_close_quiet_days: 30`, `end_of_day_enabled: true`, and the RESERVED block `_reserved: { execution_mode: "on_demand", cowork_bridge_enabled: false, cowork_bridge_path: null }`)
   - `projects.{key}` → each becomes a new Issue with id `<username>/<NNN>`, title from `name` or `key`, state `open`, owner `@<username>`, project = key, `last_known_milestones` + `open_dependencies` → tasks[], `stakeholder_roster` → owners distributed across tasks. Initialize `waiting_since: null`, `repeat_request_count: 0`, `ooo_until: null` on each new Issue.
   - `entries[]` → for each: if has `project_key` matching a migrated Issue, append to that Issue's `evidence[]`; otherwise append to `ungrouped[]`
   - legacy `history[]` array → `history.closed_issues[]`; legacy top-level `rejected_inferences[]` (if any) → `history.rejected_inferences[]`; initialize `history.state_changes: []` and `history.weekly_reviews: []`
   - `run_log` → carry over verbatim
   - A v2.0 `field_guide_state.json` (from this skill at v2.0/v2.1 of the skill version) migrates the same way: wrap its `history[]` array into `history.closed_issues`, lift any `rejected_inferences[]` into `history.rejected_inferences`, add the v2.1 Issue fields plus the v2.2 fields (`repeat_request_count`, `waiting_since`), wrap any flat `history[]` into the object form, and set `version` to `2.2`.
4. Save as `field_guide_state.json`.
5. Show user a summary: "Migrated N projects → Issues, M entries → evidence under Issues, K entries → ungrouped. Review and edit any you want to adjust. Original daily_digest_state.json backed up."
6. WAIT for user confirmation before running the first full Field Guide pass on the new data.

## Next Steps (closing template)

End every run with:
- **Headline counts** (action / waiting / today)
- **The single thing worth doing first** (highest-value next action, named explicitly)
- **Snoozed items unsnooze status** if any unsnoozed today
- **Suggested re-run time** ("re-run end of day" or "tomorrow morning")


---

# CANONICAL BOARD IMPLEMENTATION

The board is the shipped engine `references/field-guide-engine.html` (written spec: `references/dashboard-canonical.md`). Render it per Step 7 by replacing the contents of the engine's `#fgData` JSON island with your per-run JSON; do not rebuild the board inline, and do not reintroduce a JS `FG_DELTA` literal.

The former inlined `references/widget.html` (a deprecated v2.2 `visualize:show_widget` template built on the retired five-section model, with a Proposed Updates strip and Stale / Snoozed sections) was removed in v2.4. It is superseded by the two-lane engine above and is no longer a render path.
