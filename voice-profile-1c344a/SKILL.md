---
name: voice-profile-1c344a
description: >
  Personal writing-voice profile for any Lilly user, plus voice-applied drafting. BUILDS a
  recipient-segmented voice profile from a sample of the user's own sent emails (M365 connector if
  available, otherwise pasted samples). DRAFTS emails, memos, talking points, or replies that sound
  like the user, applying discipline rules (smart brevity, em-dash ban, grammar) and a purpose
  register (request, answer, decline, escalate, brief, negotiate-commercial, negotiate-legal) within
  the matching recipient segment (executive, peer/internal, direct report, supplier, legal,
  cross-functional). Also AUDITS a draft against the profile and UPDATES the profile. The profile is
  a user-carried JSON file; no external store, no shared write path.
  Triggers on "build my voice profile", "set up my writing voice", "draft this in my voice",
  "rewrite this in my style", "make this sound like me", "voice profile setup", "draft an email
  in my voice", "personal writing style", "audit this against my voice profile", "update my
  voice profile".
metadata:
  suite: v10.7.0
---

<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Suite:** v10.7.0

> **Troubleshooting and usage guidance (inlined below):** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports a problem, answer from this inlined guidance:
> - **What it does:** captures the user's personal writing voice once (BUILD), then applies it on demand to draft emails, memos, talking points, or replies (DRAFT). It also audits a draft against the saved voice (AUDIT) and edits the saved profile (UPDATE). The profile is a user-carried JSON file; there is no shared store and no inbox monitoring.
> - **Model:** Opus is the default for the BUILD extraction and the DRAFT register reasoning. Short audit or mechanical edits can run on Sonnet; keep Opus for the "does this sound like me" judgment.
> - **Output looks thin:** in BUILD this usually means too small a sent-mail sample or too few messages in a segment (segments with thin sample are labeled "Thin", not averaged across recipients). Provide a larger sample (50-200 sent items) to deepen segment fidelity.
> - **No connector:** BUILD degrades to pasted or uploaded sent-mail samples; nothing about this skill requires the M365 connector. See the graceful-degradation note in Global Operating Rule 9.
> - **Draft does not sound like me:** check that the correct `voice_profile.json` is loaded, that the recipient segment matches, and read the "what I matched" note the DRAFT step emits. Run AUDIT on the draft to see specific deviations, or UPDATE the profile to correct a mis-extracted pattern.
> - **This skill is chat-and-file only:** it produces a JSON profile and text drafts. It has no dashboard, no React artifact, and no share button, so dashboard/React/share errors do not apply here.

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

# Version
- **Skill:** Voice Profile (Personal Writing Voice)
- **Version:** 1.2
- **Suite:** v10.7.0
- **Last Updated:** June 2, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation; this skill degrades gracefully if it is absent)
- **Changelog:**
  - v1.2 (June 2026): Suite v10.6.3 alignment. Removed three em dashes that violated the suite-wide HARD RULE 7. Made the DRAFT-mode hashtag layer explicitly OPT-IN per draft (it is never emitted silently): even when the suite `hashtag_generation` flag is on, the user is asked per draft, and the toggle DEFAULTS OFF for external suppliers / legal counterparties / non-Lilly recipients per the Field Guide v2.1 external-recipient guard. Reworded the troubleshooting pointer to inlined guidance (no external `references/` path in this build). Aligned the frontmatter register list with the body's intent and segment taxonomy.
  - v1.1 (June 2026): Added the conditional fourth layer in DRAFT-mode composition: when `field_guide_state.config.hashtag_generation == true`, a hashtag block (`#status=` / `#owner=` / `#project=` / `#issue=` / `#priority=` / `#due=`) may be appended at the end of the draft body. Values auto-derived from draft context. The hashtag protocol enables Theo's Field Guide (v10.6.0+) to track work state from outbound drafts. Default flag value is false; existing behavior preserved when the flag is off. Format: 6 hashtags max, one line at bottom, separated by a `---` rule from the draft body.
  - v1.0 (May 2026): Initial release. Four-mode skill (BUILD a recipient-segmented voice profile from a sent-mail sample; DRAFT in the user's voice with layered discipline rules and purpose registers; AUDIT a draft against the profile; UPDATE the saved profile). User-carried JSON profile, no external store, no shared write path. Suite-compatible: feeds drafting steps in negotiation-prep, executive-summary-package, rfp-engine emails, contract-review SME notes when the user opts in.
  - Suite-wide guardrails note: guardrails G1-G13 and the shared house styles are defined in the lilly-brand-assets foundation; see Global Operating Rule 9.

# Voice Profile and Voice-Applied Drafting

## Purpose

Capture the user's actual writing voice once, then apply it consistently to anything they have Claude draft. Four modes:

1. **BUILD** : produce a rich, recipient-segmented voice profile from a sample of the user's own sent emails (M365 connector if available, otherwise pasted samples). Output is a portable JSON file the user saves and re-uploads on later runs.
2. **DRAFT** : given the saved profile plus a draft request, produce a draft that sounds like the user, with layered discipline rules and a purpose register matched to the intent.
3. **AUDIT** : compare a draft the user already wrote against the saved profile and report voice match, deviations, and discipline violations.
4. **UPDATE** : load the saved profile and edit its segments, registers, or rules (or refresh from a new sent-mail sample).

The profile lives only as a user file. There is no shared write path, no SharePoint, no Fabric, no inbox monitoring. The user owns and carries their own profile.

## What this skill is, and is not

- **Is:** a personal voice asset that other drafting work can apply. A voice fingerprint, not a content library.
- **Is not:** an inbox monitor, a task extractor, an auto-replier, or a content store. It does not read mail without a user instruction; it does not draft anything without a profile in hand.

## Inputs

### MUST (mode-dependent)

**BUILD mode:**
- Either (a) permission to read the user's sent-mail sample via the M365 Outlook connector, or (b) a pasted/uploaded sample of 10-20 representative sent emails covering the recipient types the user writes to.

**DRAFT mode:**
- The user's saved `voice_profile.json` (uploaded to the conversation).
- A draft request: at minimum, the recipient (name + role/type), the intent (request / answer / decline / escalate / negotiate / brief / etc.), and the key points.

### RECOMMENDED

**BUILD mode:**
- A larger sample (50-200 sent emails) for better segment fidelity.
- The user's stated voice intuitions ("I write tight to executives, warmer to my team") to seed the segmentation.

**DRAFT mode:**
- The thread the draft is replying to (so register can match).
- Any constraint: length cap, must-include points, must-avoid topics.
- A purpose-mode override if the recipient type doesn't determine register clearly.

### OPTIONAL

- Existing style notes the user keeps (a one-pager, a memo, a prior coach's feedback) -- enriching, not required.

## Workflow

### Step 0: Mode Selection

When invoked, ask once via the picker below. Default is **DRAFT** if a `voice_profile.json` is already in the conversation, **BUILD** otherwise.

**IMPLEMENTATION REQUIREMENT.** Render this picker by calling the `ask_user_input_v0` tool. Do NOT output the options as a prose bullet list. Exact call:

```
ask_user_input_v0(questions=[{
  "question": "What do you want to do?",
  "type": "single_select",
  "options": [
    "Build my voice profile (first-time setup or refresh)",
    "Draft something in my voice (profile required)",
    "Update / edit my existing profile (load and adjust segments or rules)",
    "Audit a draft I already wrote (does this sound like me?)"
  ]
}])
```

Route to the matching mode workflow below.

---

### BUILD Mode

#### Step 1: Source Election

Per S1, ask once how to source the sent-mail sample:

**IMPLEMENTATION REQUIREMENT.** Render this picker by calling `ask_user_input_v0`. Exact call:

```
ask_user_input_v0(questions=[{
  "question": "How should I get your sent-mail sample?",
  "type": "single_select",
  "options": [
    "Search Outlook via the M365 connector (last ~200 sent items)",
    "I'll paste a sample (10-20 representative sent emails)",
    "I'll upload a file (mbox, .eml exports, or a doc with sent samples)",
    "Both (I'll provide samples AND search M365, then reconcile)",
    "No additional inputs (use sent-mail samples already in this conversation)"
  ]
}])
```

If the user picks paste/upload: STOP and WAIT (per S1).
If the user picks M365: confirm the connector is available before running. If it isn't, explain and fall back to paste/upload.
If the user picks Both: ingest what they provide AND search M365, then reconcile and de-duplicate before extraction; STOP and WAIT if they still need to provide the samples.
If the user picks No additional inputs: proceed immediately using sent-mail samples already present in this conversation.

#### Step 2: Segment Frame (gate G2)

Before extraction, propose recipient segments and confirm. Default segments:
- **Executive** (skip-level + above, exec sponsors)
- **Peer / Internal team** (direct collaborators, same level)
- **Direct reports** (if user has any)
- **External supplier / vendor**
- **Legal / contracting counterparty**
- **Cross-functional stakeholder** (Finance, IT, Quality, etc.)

Show the proposed segments and ask the user to adjust before running extraction. A voice that's averaged across all recipients is worse than one segmented.

#### Step 3: Extraction Pass

For each segment with sufficient sample (target ~10 messages minimum per segment, label segments with less):
- **Greetings and closings:** the actual openers and sign-offs the user uses, in rank order
- **Sentence-length distribution:** median + range, and how it shifts by segment
- **Formality dial:** contractions yes/no, first-name basis, salutation style
- **Recurring phrases / verbal tells:** the user's actual signature phrasings (verbatim, with frequency)
- **How they structure a request:** front-load the ask? bury it? state the why first?
- **How they decline / push back:** soft or direct? hedge or assert?
- **Paragraph shape:** length, frequency of one-liners, use of lists vs prose
- **Tells:** em-dash usage (auto-detect; profile records this for the discipline layer to override), Oxford comma, capitalization habits, ALL-CAPS use, exclamation frequency
- **Length norms by segment:** what's a short message to an exec vs to a peer

Output a structured `voice_profile.json` (schema in the appendix below).

#### Step 4: Confirmation Pass (G2)

Show the extracted profile back to the user as a structured summary:
- Each segment with its top 5-10 extracted patterns
- The auto-detected tells (em-dash usage, etc.)
- A "did I read this right?" pass

Let the user adjust segments, override an extraction the model got wrong, or strike a pattern that's noise. The human read is what makes the profile trustworthy. Do NOT skip this step.

#### Step 5: Discipline Layer (HARD RULE)

Append the suite-wide discipline rules to the profile. These OVERRIDE voice on collisions:
- **No em dashes.** Suite-wide hard rule. Profile records "em_dash_enforced: false" -- whatever the user's habit is, the discipline layer enforces no em dash in any output.
- **Smart brevity.** Default cap of 150 words for emails unless overridden per draft. Lead with the ask or the headline. One idea per paragraph.
- **Grammar enforcement.** Standard English grammar regardless of the user's habit; the voice carries through phrasing, tells, and structure, not through typos.
- **No fabrication.** Voice does not invent facts. If a draft would need a fact the user didn't give, ask before drafting.

These four are NOT user-editable in the profile. They're shipped with the skill.

#### Step 6: Emit the Profile

Produce `voice_profile.json` as a downloadable file. Tell the user to save it (OneDrive, Project knowledge, or a local folder) and to upload it on any future draft run.

If a Claude Project is present (per S2), also create the voice profile as a durable artifact intended for Project Knowledge: if the surface supports adding it directly, do so; otherwise emit it as a downloadable file and tell the user to add it to Project Knowledge so subsequent conversations pick it up.

---

### DRAFT Mode

#### Step 1: Profile Check (BLOCKING)

Confirm `voice_profile.json` is in the conversation OR in Project knowledge. If not, STOP and ask the user to upload it OR offer to run BUILD mode first.

#### Step 2: Draft Request Capture

Ask once, as a batched set of pickers + one free-text field:

**IMPLEMENTATION REQUIREMENT.** Render via `ask_user_input_v0`:

```
ask_user_input_v0(questions=[
  {
    "question": "Who is this for?",
    "type": "single_select",
    "options": [
      "Executive (skip-level or above)",
      "Peer / Internal team",
      "Direct report",
      "External supplier / vendor",
      "Legal / contracting counterparty",
      "Cross-functional stakeholder",
      "Other (specify in the request)"
    ]
  },
  {
    "question": "What's the intent?",
    "type": "single_select",
    "options": [
      "Request something",
      "Answer a question",
      "Decline or push back",
      "Escalate",
      "Brief / inform",
      "Negotiate (commercial)",
      "Negotiate (legal)",
      "Other (specify)"
    ]
  },
  {
    "question": "Describe what you need to say (key points, context, any thread you are replying to).",
    "type": "free_text"
  }
])
```

#### Step 3: Apply Voice + Discipline + Register + Hashtags

Compose the draft in four stacked layers:
1. **Voice layer:** select the matching segment from the profile, apply greetings/closings, sentence-length norms, tells, structural habits.
2. **Discipline layer:** enforce the four hard rules (no em dashes, smart brevity word cap, grammar, no fabrication).
3. **Purpose register:** apply the intent's register profile. Request leads with the ask and states what's needed by when. Answer is direct and complete, closing the loop without padding. Brief is scannable and led by the headline. Negotiation-legal pulls in legal-register vocabulary (without overdoing it). Negotiation-commercial leans on pricing and term language. Decline is direct but face-saving. Escalate is short, factual, and names the ask.
4. **Hashtag metadata (CONDITIONAL and OPT-IN, default OFF):** a work-tracking hashtag block is NEVER appended silently. It is emitted only when BOTH of these are true: (a) the suite flag `field_guide_state.config.hashtag_generation == true`, AND (b) the user explicitly opts in for THIS draft via the per-draft gate below. When emitted, append a one-line block at the bottom of the draft body, separated by a blank line and a `---` rule. Up to 6 hashtags, one of each type, in this order: `#status= #owner= #project= #issue= #priority= #due=`. Values auto-derived from draft context:
   - `#owner=@<recipient-username>` when recipient is a Lilly identity (M365 directory match); `#owner=external/<label>` for external parties.
   - `#status=` from the user's intent: `request` to `open`, `decline` to `cancelled` (if final), `escalate` to `blocked`, `inform/answer` to `waiting` (awaiting their reply) or `complete` (if closing out).
   - `#project=` and `#issue=` from the matched Issue in `field_guide_state.json` (if drafting on an Issue's thread).
   - `#priority=` pulled from parent Issue's `priority` field; omitted if no Issue match.
   - `#due=` if a date was mentioned in the draft body or pulled from the Issue's `due` field.
   - Skip individual hashtags when value can't be derived (don't emit a blank `#status=` and so on).

**Hashtag opt-in gate (HARD RULE: never silent).** Even when the suite flag `hashtag_generation` is on, do NOT append the block automatically. Offer a per-draft tappable yes/no via `ask_user_input_v0` ("Include the work-tracking hashtag block on this draft? It is visible to the recipient."), and only append the block if the user says yes. Defaults follow the v2.1 external-recipient guard:
   - When the recipient segment is **External supplier / vendor** or **Legal / contracting counterparty** (or the recipient is otherwise not a Lilly identity), the toggle DEFAULTS to **OFF** (suppressed). External parties without context should not receive internal work-tracking metadata unless the user deliberately turns it on.
   - For internal Lilly recipients, the toggle DEFAULTS to **ON** when `hashtag_generation` is true, but the user can still switch it OFF for any specific draft before sending.
   - If `hashtag_generation` is false (the suite default), do not show the gate at all and never emit the block.
   The block is visible to the recipient; it is a transparency-and-reciprocity signal, not hidden metadata. Never use zero-width, Unicode-tag, white-on-white, or HTML-comment smuggling to hide it. If the user declines, the draft ships with no block and nothing is logged about that recipient.

Where voice and discipline collide, discipline wins. Where voice and register collide, register wins for vocabulary; voice wins for structure and tells. The hashtag layer is purely additive: it doesn't modify the user-facing body, it only appends metadata, and only after the user opts in for that draft (see the opt-in gate above).

**Reading the flag (graceful degradation):** check `field_guide_state.json.config.hashtag_generation` in Project knowledge. If the file doesn't exist (Field Guide not yet installed in this Project), check legacy `daily_digest_state.json.config.hashtag_generation`. If neither file nor flag exists, or Project knowledge cannot be read, default to `false`: no gate is shown and no hashtag block is emitted. The skill never blocks on the flag being present.

#### Step 4: Emit the Draft + Match Note

Produce:
- The draft (chat-side by default; if Claude-in-Outlook is the surface per S3, write into the open email). Per S3, the connector and add-ins are read-and-draft: never claim to have sent the email. Hand the draft to the user to send.
- A short "what I matched" note: which segment, which register, which voice tells were applied, and (when the hashtag layer is active) whether the hashtag block was included or suppressed for this draft and why. The user can read it to confirm the draft passes the "sounds like me" check.

If the user asks for variants, produce 2-3 (e.g., direct vs softened, or short vs long). Otherwise one draft and an offer to revise.

---

### AUDIT Mode

User pastes a draft they wrote (or one Claude generated elsewhere). The skill compares it against the profile and emits:
- Voice match score per segment (does this sound like the user for this recipient type?)
- Specific deviations (e.g., "you don't usually open with 'I hope this finds you well'")
- Discipline violations (em dashes, length, fabricated-sounding claims)
- A suggested revision the user can accept or ignore

---

### UPDATE Mode

Load the existing `voice_profile.json` and walk through the segments, letting the user edit, add a segment, strike a pattern that's noise, or refresh from a new sent-mail sample. Emit the updated JSON.

## Deliverables

- `voice_profile.json` -- the portable, user-carried profile (BUILD / UPDATE modes). Always produced.
- The draft itself (DRAFT mode), chat-side or in-app per S3.
- An audit report (AUDIT mode), structured short-form.

## Cross-Skill Handoffs

Other skills in the suite can OPT IN to applying the voice profile when they draft user-facing text. They check for a `voice_profile.json` in the conversation or Project knowledge; if present, they pass it to this skill's DRAFT subroutine before emitting:
- **executive-summary-package** -- exec briefing tone
- **rfp-engine** -- invitation emails, award letters
- **commercial-negotiation-prep** / **legal-negotiation-prep** -- talking points
- **lilly-contract-review** -- SME escalation emails (per S4, opt-in)

A skill calling the voice profile MUST still respect S4 (outbound communications are opt-in) -- the voice layer doesn't change the consent rule.

## Hard Rules (skill-specific; the shared guardrails also apply)

**Rule 1: The profile is user-carried.** It lives in the user's OneDrive, Project knowledge, or a local file they upload. No external store, no shared write, no auto-persist anywhere.

**Rule 2: BUILD reads, never writes outside the user's own files.** Sent-mail reading is bounded, one-time per refresh, and only with user opt-in via the S1 picker. The skill never sets up monitoring, scheduled sweeps, or background ingestion.

**Rule 3: Discipline overrides voice.** Em-dash ban, smart brevity, grammar, and no-fabrication are NOT optional, and not user-editable in the profile. Voice carries the rest.

**Rule 4: Confirmation is mandatory in BUILD.** Step 4's review pass is not skippable. A profile the user hasn't confirmed is not a profile.

**Rule 5: Segment, don't average.** A flat voice profile is worse than no profile. If a segment has too little sample, label it "thin" rather than averaging across segments.

**Rule 6: Never fabricate to fill a draft.** If the draft needs a fact the user didn't give (a number, a deadline, a name), STOP and ask. The voice can't hide a fabricated claim.

**Rule 7: The profile contains no confidential content.** The extracted patterns describe HOW the user writes, not WHAT they've written about. Names, deal values, and other content from the sample do not enter the profile. If the user's voice profile JSON gets shared accidentally, no business content is exposed.

**Rule 8: One person's voice, with consent (anti-impersonation).** BUILD only ever profiles the operating user's OWN sent mail; never profile another person from their mail to mimic them. If a loaded `voice_profile.json` was clearly built by someone other than the current user (different `user.display_name` than the operator, or the user says it is a colleague's profile), do not use it to ghost-write as that person. Flag it once, confirm intent, and proceed only if the user states they are the profile owner or have that person's explicit consent. `build_metadata.confirmed_by_user` records that the profile owner reviewed and confirmed their own profile.

## Appendix: voice_profile.json Schema (illustrative)

```json
{
  "version": "1.0",
  "user": {
    "display_name": "",
    "role": "",
    "function": ""
  },
  "discipline": {
    "em_dash_enforced": false,
    "smart_brevity_word_cap_default": 150,
    "grammar_enforcement": true,
    "no_fabrication": true
  },
  "segments": {
    "executive": {
      "sample_size": 0,
      "confidence": "High|Medium|Low|Thin",
      "greetings_ranked": [],
      "closings_ranked": [],
      "sentence_length": {"median": 0, "range": [0, 0]},
      "formality": {"contractions": true, "first_name_basis": true, "salutation_style": ""},
      "recurring_phrases": [],
      "request_structure": "",
      "decline_style": "",
      "paragraph_shape": "",
      "length_norm_words": 0,
      "tells": []
    },
    "peer_internal": {},
    "direct_report": {},
    "external_supplier": {},
    "legal_counterparty": {},
    "cross_functional": {}
  },
  "registers": {
    "request": {},
    "answer": {},
    "negotiation_commercial": {},
    "negotiation_legal": {},
    "decline": {},
    "escalate": {},
    "brief": {}
  },
  "auto_detected": {
    "em_dash_natural_usage": false,
    "oxford_comma": true,
    "all_caps_for_emphasis": false,
    "exclamation_frequency": "low|medium|high"
  },
  "build_metadata": {
    "built_on": "YYYY-MM-DD",
    "source": "M365 connector | pasted sample | uploaded file",
    "sample_count": 0,
    "confirmed_by_user": true
  }
}
```

This is illustrative. The actual emitted profile is populated from extraction, confirmed by the user, and trimmed of empty segments.

## Next Steps (closing template)

End every run with:
- **BUILD:** "Profile saved as voice_profile.json. Upload it next time you ask for a draft. Refresh anytime by running build again."
- **DRAFT:** "Draft below. Want a shorter / softer / more direct variant? Want me to apply this voice to the next reply in the thread?"
- **AUDIT / UPDATE:** the specific suggested adjustment or refreshed profile, with the upgrade path.
