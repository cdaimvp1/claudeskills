---
name: meeting-prep-brief-1c344a
description: >
  Produces a one-page meeting prep brief for any upcoming procurement meeting. Reads the
  calendar invite, the recent email thread with the counterparty (supplier or stakeholder),
  related contracts or RFP documents in SharePoint, and (if reachable) spend data, then
  assembles a five-section brief: who is in the room, what was discussed last, what is open,
  what to walk in ready to say, and a suggested agenda. Read-only across external M365;
  produces local DOCX and unsent self-drafts only. Uses per-RFx Project context; composes
  with voice-profile and workflow-map. Triggers on "prep me for the
  [supplier] meeting", "build a prep brief", "meeting prep for [date/event]", "what should I
  bring to this meeting", "brief me on [vendor] before [meeting]", "ready me for the [phase]
  kickoff". BOUNDARY: prepares the USER to attend a meeting; an organizer's own meeting agenda
  is out of scope (no dedicated agenda skill exists in this suite), and for daily triage across
  all meetings use theos-field-guide.
metadata:
  author: "Marc Lane, Associate Director, Global IT Procurement"
  suite: v10.7.0
---

<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Suite:** v10.7.0

> **Troubleshooting and usage guidance (inlined below):** If the user asks how to use this skill, what output to expect, or reports a problem, answer from this inlined guidance:
> - **What it does:** gathers M365 context for one upcoming meeting and produces a one-page, five-section brief (chat markdown by default; optional one-page DOCX or an unsent Outlook draft to yourself).
> - **Model:** Opus is the default for the synthesis and "walk-in-ready" reasoning. Routine extraction/search sub-steps can run on Sonnet; keep Opus for the judgment calls.
> - **Output looks thin:** usually means little context exists in M365 for this counterparty/topic, or the M365 connector is unavailable. Thin sections show labeled states (for example "No recent thread found") rather than disappearing. Confirm the connector posture and the supplier/topic keywords.
> - **No connector:** the skill degrades to a brief built from whatever the user provides plus the per-RFx Project case file, and it labels each missing M365 surface explicitly. See "M365 connector posture" below.
> - **DOCX/draft not appearing:** the brief is always delivered in chat first; the DOCX and self-draft are optional outputs chosen via the destination picker.

## GLOBAL OPERATING RULES (apply to every run of this skill)

These rules govern HOW this skill behaves. They are shared across all Lilly procurement skills so the suite feels like one system. This skill must work for ALL categories and commodities, never IT alone.

**1. Minimize what the user must provide.** Default-and-override. Handle messy inputs.

**2. Ask rarely, and only when a wrong guess is expensive.** Render enumerable choices as tappable options via `ask_user_input_v0`.

**3. Stay category-neutral and honest about confidence.** Signal High/Medium/Low.

**4. Deliver decision-ready output in THIS skill's native format.**

**5. Run a proportional completeness check before finalizing.**

**6. End with brief Next Steps.**

**7. Never use em dashes. (HARD RULE)** Restructure with hyphens, colons, parentheses.

**8. Deliverable structure is deterministic.** (HARD RULE) Brief follows a fixed five-section skeleton; missing sections show labeled states rather than disappearing.

**9. Follow the Execution Guardrails. (HARD RULE)** The relevant guardrails are inlined below (the shared foundation file is not packaged separately in this build):
- Cite every retrieved fact with source and date; never fabricate a fact, attendee, commitment, or number. Absent data is shown as a labeled state, never as a guessed value.
- Scope all "read-only / no write" language to external M365 mutations: the skill must not send, post, or modify anything in Outlook, Teams, SharePoint, or Fabric. Producing a local DOCX and an unsent draft addressed to the user is allowed.
- Signal confidence as High/Medium/Low on any synthesized judgment.
- State the M365 connector posture (see "M365 connector posture" below) and degrade gracefully when a surface is unavailable.
- No em dashes, no replacement characters, forward-slash paths only; the deliverable structure is deterministic (the fixed five-section skeleton).

## SUITE INTERACTION PROTOCOL

**S0 / S1 / S2 / S3 / S4 / S5** as per the shared suite protocol.
<!-- SHARED-BLOCK:END -->

# Version
- **Suite:** v10.7.0
- **Skill:** Meeting Prep Brief
- **Version:** 1.3
- **Last Updated:** July 22, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation); M365 connector (Outlook + Calendar + SharePoint + Teams chat) recommended for full operation, plus Fabric for the optional spend-context surface; degrades gracefully when partial or absent.
- **Changelog:**
  - v1.3 (July 2026): Added the Communication detail treatment within Section 2 (What Was Last Discussed): each exchange now carries an Outlook/Teams/SharePoint deep link back to the source message, a synthesized Clarity/Confidence/Alignment read, and a Related cross-reference to other messages on the same thread, replacing plain prose bullets. Added a unified Open Items tracker within Section 3 (What Is Open): outstanding asks, commitments, and unresolved no-deadline items now render as one structured table with deterministic Overdue/Unresolved/Open/Completed status, merging what were two separately proposed panels (an Open Commitments tracker and an Open-loop/unresolved tracker) into a single treatment per the design review's own reconciliation note. Added `examples/meeting_prep_brief_canonical_dashboard.jsx` (inlined below) as the canonical visual reference for both, built on the shared suite component library; no change to the fixed five-section skeleton, the read-only rule, or the default chat-markdown delivery.
  - v1.2 (June 2026): Suite v10.6.3 alignment. Removed all em dashes (Hard Rule 7). Scoped the read-only rule to external M365 mutations so the permitted local DOCX and unsent self-draft no longer contradict it. Reworded foundation pointers (troubleshooting + execution guardrails) to inlined summaries since this build does not package the shared reference files separately. Made the no-/partial-M365-connector degradation path explicit in the workflow and added degradation notes for the delivery primitives. Added a BOUNDARY disambiguation guard and trimmed the description to the suite soft cap.
  - v1.1 (June 2026): Added "Related Issues" subsection within section 3 (What's Open) of the brief. When `field_guide_state.json` is present and Issues match the meeting's counterparty or topic, surface up to 5 matching Issues with state + owner + last activity. Skip cleanly when no Field Guide state or no matches. Five-section skeleton, read-only M365 access, and all other behavior unchanged.
  - v1.0 (June 2026): Initial release. Reads calendar invite + recent email thread + related SharePoint contract / RFP docs + (optional) spend snapshot. Produces a one-page brief with fixed five-section skeleton (Who's in the room / What was last discussed / What's open / What you should walk in ready to say / Suggested agenda). Read-only; no writes. Composes with voice-profile and workflow-map.

# Meeting Prep Brief

## Purpose

Walk into any procurement meeting with the context already gathered. The brief is a one-page artifact you read on your phone or laptop on the way in. It exists to replace the 20 minutes of pre-meeting hunting through email + SharePoint + the contract folder.

**What this is:** a structured digest of what matters for THIS meeting based on what already exists in M365.

**What this is not:** an agenda-builder for the meeting organizer (separate skill if needed), a strategy doc, or a substitute for the meeting itself.

## Inputs

### MUST (one of these)
- A calendar event reference: the event title, the meeting time, OR an Outlook event ID. The skill resolves the event via the M365 connector.
- OR the user explicitly names the supplier / counterparty + the meeting date.

### RECOMMENDED
- Per-RFx Project context: when invoked inside a per-RFx Project ([[project_lilly_rfp_case_manager_v2]]), the skill pulls the case file automatically. Massive time-saver.
- The user's role in the meeting (lead / participant / observer): drives what "walk in ready to say" emphasizes.

### OPTIONAL
- Specific topics the user wants emphasized.
- A prior brief from this skill, or a `journey_state.json` for this counterparty. For series meetings the brief gets richer as state accumulates, and that is now a real mechanism rather than a hope: see "Journey state" below. Absent either, this is a first meeting and the brief says so.

## Journey state (J3): telling a first run from a later one

`journey_state.py` persists a small typed record so this skill knows what already happened
instead of re-reading the chat or re-asking.

```bash
python journey_state.py <state.json>    # validate and print the resume brief
```

**The pattern is copied, not invented.** `timeline-builder`'s `timeline_calibration.json`
already solved this properly: small, typed, saved to Project knowledge with a downloadable
file fallback, its PRESENCE gating first-run behaviour, and a troubleshooting note telling
the user how to recover it. J3's instruction was to copy that shape rather than add a
second one to the suite, and this does.

**Save to** Project knowledge (preferred), or emit as a downloadable file.

### What it stores, and the one thing it refuses to

Request key, the skills already run, what each produced **as a name and a type**, which
inputs were CONFIRMED versus ASSUMED, and the next suggested hop.

**It never stores artifact content, and the validator refuses a record that carries any.**
A state file accumulating contract text or supplier data becomes a quiet second copy of
governed material, sitting in Project knowledge under nobody's retention rule. "You have
the shortlist from supplier-landscape" needs a name, not the shortlist.

### CONFIRMED versus ASSUMED is the point of the record

Re-asking something already answered is the friction this removes. But carrying an
ASSUMPTION forward silently is worse than re-asking: it hardens a guess into a fact across
sessions and the user never sees the moment it happened.

So a later run may skip what was **CONFIRMED**, and must **surface what was ASSUMED** for
reconfirmation rather than treat it as settled. There is deliberately no third state:
"probably" is an assumption wearing a confirmation's clothes.

### Absence is never an error

No file means first run. A corrupt file, or one from a different schema version, means
first run **plus a message saying how to recover it** ("the state file is not in the
conversation or Project; paste it back to continue where you left off"). The skill proceeds
either way and never blocks: stale state silently misapplied is worse than no state.

## Workflow

### Step 1: Resolve the meeting

Find the event via M365 connector:
- If the user gave an event ID, fetch directly.
- If the user gave a title + date, search Outlook calendar.
- If the user gave just a supplier / counterparty name, search the next 5 working days for any event matching that name; if multiple, ask via picker.
- If nothing matches, ask the user to confirm the event details (title, date, attendees).

Capture from the event: subject, organizer, required attendees, optional attendees, location / Teams link, agenda (if in the body), attached files (if any), recurring-meeting context (if any).

### Step 2: Gather context (read-only M365 surfaces)

In parallel, pull:
1. **Email thread:** last 14 days of email between the user and any required attendees, filtered to the supplier / topic / RFP keywords from the event subject. Use Outlook search.
2. **Teams chat:** chat messages with the same attendees, same window, same filters.
3. **SharePoint documents:** files in the per-RFx Project's bound Team (if applicable per [[project_lilly_rfp_case_manager_v2]]) OR a general SharePoint search for documents naming the supplier / RFP. Prioritize the most recently modified.
4. **Contract context:** if a contract is associated with the supplier (find via SharePoint or Project knowledge), summarize its key commercial + risk terms (effective dates, term length, payment terms, liability cap, governing law, auto-renewal). Cite the source.
5. **Spend context (optional):** if a spend view is reachable (Fabric or uploaded), pull the supplier's spend trend for the last 4 quarters. Skip cleanly if not available.

Cite every retrieved item: file name, location / URL, date.

**M365 connector posture (graceful degradation, explicit).** Each surface above is read-only and optional. Before pulling, check connector availability; do not hard-stop if it is absent or partial:
- **No connector at all:** build the brief from the user-provided meeting details plus the per-RFx Project case file (when present). State at the top "M365 connector unavailable: brief built from provided context only", and label every M365-sourced section as unavailable rather than empty.
- **Partial connector** (for example Outlook reachable but Fabric spend not): pull what is reachable, and mark each missing surface with its labeled state ("Spend data unavailable", "Teams chat not searchable").
- **Web search** is not used by this skill; all facts come from M365 or user-provided context, so there is no external-fetch degradation path to manage here.

### Step 3: Synthesize into the fixed five-section brief

Per Operating Rule 8, the brief ALWAYS has this skeleton:

```
MEETING PREP BRIEF
[Meeting title] | [Date / time] | [Location or Teams link]

1. WHO IS IN THE ROOM
   - Lilly attendees: [name + role]
   - Counterparty attendees: [name + role + company]
   - Any first-time / unfamiliar attendees flagged

2. WHAT WAS LAST DISCUSSED
   - Last 3-5 substantive exchanges on this thread, chronological
   - Open questions or commitments from prior meetings
   - Cite source (email date, Teams date, prior meeting recap)
   - **Communication detail** (NEW v1.3): each exchange renders as a compact card rather than a
     plain bullet: a short verbatim quote (25 words or fewer), a Clarity / Confidence / Alignment
     read (synthesized judgment, banded High/Medium/Low, signaled per the confidence rule, never
     presented as a supplier-provided score), an "Open in Outlook" or "Open in Teams" deep link
     back to the source message, and a Related line when other messages share the same
     thread/topic (count + dates). When the connector cannot resolve a message ID, the card states
     "Deep link unavailable" rather than guessing a URL; the quote, read, and citation still render.

3. WHAT IS OPEN
   - Outstanding asks / commitments / decisions awaiting action
   - Who owes what to whom
   - Any deadlines or escalations in play
   - **Open items tracker** (NEW v1.3): outstanding asks, commitments, and decisions render as one
     structured table (Item | Owner | Due | Status | Source), not prose bullets. Status is computed
     deterministically as of the brief's generation date: Overdue (due date has passed, not
     completed), Open (due date not yet reached), Unresolved (no due date was ever set and the item
     has gone 14+ days without a reply, a quiet risk rather than a hard breach), or Completed.
     Overdue rows lead, then Unresolved, then Open, then Completed. Each row carries the same
     Outlook/Teams/SharePoint deep link as the Communication detail cards above. This merges what
     were two separately proposed panels (an "Open Commitments tracker" and an "Open-loop /
     unresolved-item tracker") into the one treatment, since both draw on the same underlying
     owner/promise/due-date/citation data. Close with a one- or two-sentence read naming the single
     most urgent item and, when 2 or more items are Overdue or Unresolved, an escalation flag.
   - **Related Issues** (NEW v1.1): if `field_guide_state.json` is present in Project knowledge AND any Issues match the meeting's counterparty (vendor name in title/project/tags) OR the meeting's topic (subject-line entity match), list up to 5 matching Issues here. Each row: title, current state, owner, last activity. Sorted by `last_activity` recency. Adds context the user might forget mid-meeting. Skip the subsection if no Field Guide state OR no matches.

4. WHAT YOU SHOULD WALK IN READY TO SAY
   - Specific talking points the user should have ready
   - Any positions / numbers / clauses the user needs to know cold
   - Tactical reminders (e.g., "supplier requested X; playbook position is Y")
   - If contract review is in scope: cite the relevant playbook position via process-navigator
   - If commercial negotiation is in scope: cite relevant benchmarks if available

5. SUGGESTED AGENDA
   - 3-6 agenda items in proposed order
   - Estimated minutes per item
   - Flag any item that needs an SME on the line
```

Sections with thin input show labeled states ("No recent thread found", "Contract not located in M365", "Spend data unavailable") rather than disappearing. Never fabricate.

### Step 4: Format and deliver

**Default delivery:** chat-side as structured markdown that reads cleanly on phone or laptop.

**Optional outputs (picker if invoked with no destination signal):**

**IMPLEMENTATION REQUIREMENT.** Render via `ask_user_input_v0`:

```
ask_user_input_v0(questions=[{
  "question": "Where do you want this brief?",
  "type": "single_select",
  "options": [
    "In-chat (markdown; quickest, default)",
    "Word document (one-page DOCX in Magazine house style; printable, local artifact)",
    "Outlook self-draft (an UNSENT draft reminder addressed to you, or copy-ready text for a calendar event note; never dispatched to anyone else)"
  ]
}])
```

**Graceful degradation (delivery primitives):**
- If `ask_user_input_v0` is unavailable, skip the picker and deliver in-chat markdown by default, then state in one line that DOCX and self-draft are available on request.
- If the DOCX generation primitive is unavailable, deliver the brief as chat markdown and say the printable DOCX could not be produced.
- If the Outlook draft primitive (or `message_compose`) is unavailable, do not attempt any send: emit the self-reminder as a clearly labeled inline draft (subject + body) that the user can copy into Outlook manually.

### Step 5: Optional follow-on actions

After delivering the brief, OPT-IN per S4 (one tappable yes/no per action):
- **Draft any required pre-meeting reply** (via voice-profile): e.g., "we are still waiting on the redline; will discuss tomorrow"
- **Build the workflow map** for the project (via workflow-map) if useful context for the room
- **Pull spend / pricing benchmarks** (via market-rate-benchmarking or pro-forma-builder) if pricing is on the agenda
- **Open the contract review** (via lilly-contract-review) if the meeting is a contract redline discussion

Never auto-fire any of these.

## Visual Reference (DOCX / rich rendering)

`examples/meeting_prep_brief_canonical_dashboard.jsx` (inlined below under "INLINED REFERENCE FILES") is the canonical visual reference for this skill's one-page brief. It renders the same fixed five-section skeleton above, including the v1.3 Communication detail cards and the unified Open Items tracker, using the suite's shared component library (Metric, Card, Pillar, STable, StateBanner) and the canonical Lilly palette, so the optional one-page DOCX and any rich rendering of the brief stay visually consistent with every other dashboard in the suite. It is ONE PAGE with no tab navigation, matching this skill's default in-chat markdown delivery; it does not add a fourth delivery format. Illustrative data only (a Kinaxis renewal scenario); clone the structure, not the numbers.

## Deliverables

- **Brief output** in the chosen format (chat markdown / local DOCX / unsent Outlook self-draft).
- **Communication detail** on each exchange in Section 2: verbatim quote, Clarity/Confidence/Alignment read, Outlook/Teams/SharePoint deep link, and Related cross-reference (NEW v1.3).
- **Open items tracker** in Section 3: one structured table with deterministic Overdue/Unresolved/Open/Completed status and a source deep link per row (NEW v1.3).
- **Citation appendix** at the bottom listing every source pulled (email, Teams message, SharePoint file, calendar event) with date and link.
- Short chat-side summary: "Brief produced. X attendees, Y open items, Z citations. Want me to [proposed follow-on]?"

## Cross-Skill Handoffs

This skill is called by:
- **theos-field-guide** when a meeting today/tomorrow has no prep file: the digest's "Today/Tomorrow" tab can offer "Prep me for this" as a one-tap action.
- **rfp-case-manager** Schedule workflow: after drafting an invite, offer to also produce the prep brief for that meeting.

This skill calls:
- M365 connector tools (Outlook search, Teams chat search, SharePoint search, calendar events).
- Read of per-RFx Project case file when present.
- **process-navigator** when the meeting involves a policy / threshold / system-requirement question.
- **voice-profile** (opt-in) for follow-on email drafts.
- **workflow-map** (opt-in) when a workflow diagram would help the conversation.
- **market-rate-benchmarking** or **pro-forma-builder** (opt-in) to pull spend / pricing benchmarks if pricing is on the agenda.
- **lilly-contract-review** (opt-in) to open the contract review if the meeting is a contract redline discussion.

## Hard Rules (skill-specific; the shared guardrails also apply)

**Rule 1: Read-only for external M365 systems; no M365 mutations.** This skill never sends an email, posts to Teams, creates a calendar event, or modifies any file in Outlook, Teams, SharePoint, or Fabric. It reads those surfaces only. PERMITTED local outputs: generating a one-page DOCX of the brief, and preparing an unsent Outlook draft addressed to the user as a self-reminder. Both stay with the user; the user reviews and acts. Nothing is dispatched to a counterparty.

**Rule 2: Cite every fact.** Email date, Teams date, SharePoint file path + date, calendar event ID. Every claim in sections 2-3 references its source.

**Rule 3: Privacy + scope.** Only the user's own M365 surface. The skill cannot read teammates' private threads. State that scope when relevant.

**Rule 4: Five-section skeleton is fixed.** Per Operating Rule 8, do not drop/rename/reorder. Thin sections show labeled states.

**Rule 5: No fabrication.** If a section has no input (e.g., no recent thread), it says "No recent thread found in M365", not invented context.

**Rule 6: Brief is for the user, not a transcript.** Synthesize and prioritize. The user does not want every email; they want the 3-5 things that matter for this meeting.

## Next Steps (closing template)

End every run with:
- One-line summary (e.g., "Brief produced for [meeting], 6 attendees, 3 open items, 11 citations")
- The single most important "walk-in-ready" point
- One opt-in suggestion for a follow-on action (per S4)

---

# INLINED REFERENCE FILES

The following file was previously a separate example file. It is now inlined for single-file installation.

---

> **The optional hand-authored dashboard was REMOVED (2026-07-30).** It was a
> secondary artifact with no deterministic builder, so every run produced a
> differently shaped one. For a decision artifact that is worse than not having
> it. This skill's deliverables are its documents and its analysis; if a rendered
> surface is needed, the locked hubs provide one.

