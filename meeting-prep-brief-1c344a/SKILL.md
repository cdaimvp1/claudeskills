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

## INLINED: examples/meeting_prep_brief_canonical_dashboard.jsx

```jsx
import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Meeting Prep Brief - CANONICAL VISUAL REFERENCE (one-page brief)
// This is the visual / DOCX-parity reference for the fixed five-section skeleton
// documented in Step 3 of SKILL.md. The skill's default delivery is structured
// chat markdown (see Step 4); this reference keeps the optional one-page DOCX
// and any rich rendering of the brief on-brand and consistent with every other
// dashboard in the suite. ONE PAGE, no tab navigation: this skill is
// deliberately not a multi-tab dashboard.
// Data below is NEUTRAL and ILLUSTRATIVE (Kinaxis renewal scenario). Clone the
// structure, swap the data entirely.
// House style: SUITE STANDARD (Arial body, Georgia titles, dark #212121 header
// with red rule, Lilly-approved palette, no green). See
// lilly-brand-assets-1c344a references/dashboard-components.md for the shared
// component implementations (Metric, Card, Pillar, STable, StateBanner) and
// references/brand-colors.md for the canonical palette.
// v1.3 additions: the Communication detail cards in Section 2 (deep links,
// Clarity/Confidence/Alignment reads, related cross-references) and the
// unified Open Items tracker in Section 3 (Overdue/Unresolved/Open/Completed
// status), merging what were two separate candidate panels into one table.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. Distinct hexes, no
// duplicates. Lilly's palette has no pure green; positive/resolved roles use
// Bold Blue (BLU), never green.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

function fP(v) { return v == null ? "" : v.toFixed(1) + "%"; }
function pcC(p) { return p >= 90 ? BLU : p >= 70 ? AMB : R; }
function pcBg(p) { return p >= 90 ? OK : p >= 70 ? WARM : RISK; }

// --- ILLUSTRATIVE DATA (replace entirely per run) --------------------------
const D = {
  meta: {
    title: "Kinaxis Contract Renewal: Commercial Terms Review",
    date: "Thursday, July 23, 2026", time: "2:00 - 2:45 PM ET",
    location: "Microsoft Teams", asOf: "Brief generated July 22, 2026, 9:10 AM ET",
    connector: "Connector: Outlook, Teams, SharePoint reachable | Fabric spend not reachable this session"
  },
  attendees: {
    lilly: [
      { n: "Marc Lane", r: "Associate Director, Global IT Procurement (Lead)" },
      { n: "Priya Nandakumar", r: "IT Category Manager" },
      { n: "Rina Osei", r: "Senior Counsel, Legal (optional, on request)" }
    ],
    counterparty: [
      { n: "David Chen", r: "Account Executive, Kinaxis" },
      { n: "Sarah Whitfield", r: "Customer Success Director, Kinaxis", firstTime: true }
    ]
  },
  exchanges: [
    { source: "Teams", linkKind: "teams", date: "Jul 19, 2026", who: "Priya Nandakumar to David Chen, Sarah Whitfield",
      quote: "We need the 3 year term to land at flat pricing, not just a smaller annual bump.",
      clarity: 90, confidence: 70, alignment: 65, related: null },
    { source: "Email", linkKind: "outlook", date: "Jul 20, 2026", who: "David Chen to Marc Lane",
      quote: "Still validating the three year discount with finance, hoping to confirm by end of week.",
      clarity: 60, confidence: 40, alignment: 50, related: "2 earlier messages on this thread (Jul 18, Jun 15)" },
    { source: "Email", linkKind: "outlook", date: "Jul 18, 2026", who: "David Chen to Marc Lane, Priya Nandakumar",
      quote: "We are proposing a 4% increase reflecting the RapidResponse platform expansion delivered this year.",
      clarity: 85, confidence: 60, alignment: 55, related: "1 related message (Jun 15 QBR recap)" },
    { source: "Prior meeting recap", linkKind: "sharepoint", date: "Jun 15, 2026", who: "June QBR notes",
      quote: "Liability cap language flagged as an open legal item pending Kinaxis review.",
      clarity: 75, confidence: 55, alignment: 45, related: null }
  ],
  openItems: [
    { item: "Confirm multi-year discount pricing", owner: "David Chen (Kinaxis)", due: "Jul 21, 2026", status: "Overdue", source: "Email, Jul 20", linkKind: "outlook" },
    { item: "Clarify payment terms: Net 45 vs Net 60", owner: "Kinaxis Finance", due: "No date set (5+ weeks open)", status: "Unresolved", source: "Meeting recap, Jun 15", linkKind: "sharepoint" },
    { item: "Return liability cap redline", owner: "Rina Osei (Lilly Legal)", due: "Jul 24, 2026", status: "Open", source: "Teams, Jul 19", linkKind: "teams" },
    { item: "Send updated SOW: RapidResponse module 2", owner: "Sarah Whitfield (Kinaxis)", due: "Jul 25, 2026", status: "Open", source: "Email, Jul 18", linkKind: "outlook" },
    { item: "Confirm renewal effective date (MSA expires Sep 1, 2026)", owner: "Marc Lane", due: "Jul 28, 2026", status: "Open", source: "Calendar event", linkKind: "outlook" },
    { item: "Confirm auto-renewal opt-out notice window", owner: "Marc Lane", due: "Jul 30, 2026", status: "Open", source: "SharePoint, Kinaxis MSA 2024", linkKind: "sharepoint" },
    { item: "Security questionnaire refresh", owner: "Priya Nandakumar", due: "Completed Jul 10, 2026", status: "Completed", source: "Email, Jul 10", linkKind: "outlook" }
  ],
  relatedIssues: [
    { title: "Kinaxis SSO integration delay", state: "In Progress", owner: "IT Security", last: "Jul 17, 2026" },
    { title: "Kinaxis invoice discrepancy, Q2", state: "Escalated", owner: "Accounts Payable", last: "Jul 14, 2026" }
  ],
  talking: [
    { c: BLU, k: "3-year term", t: "Hold the line on term for rate protection", d: "Playbook position: a multi-year commitment trades term length for rate protection, not just a bigger discount. Do not accept 4% flat if the term stays 1 year." },
    { c: AMB, k: "1x vs 2x fees", t: "Liability cap is not yet aligned", d: "Current draft caps liability at 1x fees; Legal's redline asks for 2x on cyber exposure. Know this number cold if David raises the SOW before Legal responds." },
    { c: R, k: "Escalation trigger", t: "If pricing will not move today, table it", d: "If Kinaxis will not move off 4% on this call, confirm SOW and security items only and do not concede on pricing live. Route back to Legal and Category for the next round." }
  ],
  agenda: [
    { item: "Renewal pricing and multi-year term", min: 15, sme: "Legal (redline authority)" },
    { item: "RapidResponse module 2 SOW review", min: 10, sme: null },
    { item: "Liability cap language", min: 10, sme: "Legal" },
    { item: "Security questionnaire and SSO integration status", min: 5, sme: null },
    { item: "Next steps and dates", min: 5, sme: null }
  ],
  citations: [
    { type: "Email", who: "David Chen to Marc Lane", date: "Jul 20, 2026", linkKind: "outlook" },
    { type: "Email", who: "David Chen to Marc Lane, Priya Nandakumar", date: "Jul 18, 2026", linkKind: "outlook" },
    { type: "Teams", who: "Priya Nandakumar to David Chen, Sarah Whitfield", date: "Jul 19, 2026", linkKind: "teams" },
    { type: "Calendar", who: "Kinaxis Contract Renewal: Commercial Terms Review", date: "Jul 23, 2026", linkKind: "outlook" },
    { type: "SharePoint", who: "Kinaxis_MSA_2024_Executed.pdf", date: "Modified Jul 5, 2026", linkKind: "sharepoint" },
    { type: "SharePoint", who: "Kinaxis_QBR_Recap_Jun2026.docx", date: "Jun 16, 2026", linkKind: "sharepoint" },
    { type: "Teams", who: "David Chen: RapidResponse module 2 scope note", date: "Jul 15, 2026", linkKind: "teams" },
    { type: "Email", who: "Rina Osei to Marc Lane: liability cap redline draft", date: "Jul 12, 2026", linkKind: "outlook" },
    { type: "Prior meeting recap", who: "June QBR notes", date: "Jun 15, 2026", linkKind: "sharepoint" }
  ]
};

// STable: copied verbatim from dashboard-components.md.
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

// Metric, Card, Pillar, StateBanner: copied verbatim from dashboard-components.md.
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
function Pillar({ c, k, t, d }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 16, border: "1px solid " + BD, borderTop: "3px solid " + c, flex: 1, minWidth: 0 }}>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: c }}>{k}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: DK, marginTop: 4 }}>{t}</div>
    <div style={{ fontSize: 11, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{d}</div>
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

// --- SKILL-SPECIFIC (v1.3): DeepLink, MeterRow, CommCard, StatusPill, OpenItemsTable ---

// DeepLink: "Open in Outlook / Teams / SharePoint" chip (candidate #67). Static href in
// this illustrative reference; at runtime resolves to the real OWA message-id link, the
// Teams deep-link scheme, or the SharePoint file URL, or renders "Deep link unavailable"
// when the connector cannot resolve a message ID. Never fabricate a URL.
var LINK_LABEL = { outlook: "Open in Outlook", teams: "Open in Teams", sharepoint: "Open in SharePoint" };
function DeepLink({ kind }) {
  return <a href="#" onClick={function (e) { e.preventDefault(); }} style={{ fontSize: 10, fontWeight: 700, color: BLU, textDecoration: "none", border: "1px solid " + BLU + "40", borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap", background: "#fff" }}>{(LINK_LABEL[kind] || "Open source") + " ->"}</a>;
}

// MeterRow: Clarity / Confidence / Alignment, a synthesized 0-100 read per exchange (not a
// supplier-provided score), colored on the same pcC/pcBg percentage scale used everywhere
// else in the suite (candidate #67).
function MeterRow({ clarity, confidence, alignment }) {
  var items = [["Clarity", clarity], ["Confidence", confidence], ["Alignment", alignment]];
  return <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
    {items.map(function (it, i) {
      return <div key={i} style={{ minWidth: 92 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: MUT, marginBottom: 2 }}>
          <span>{it[0]}</span><span style={{ fontWeight: 700, color: pcC(it[1]) }}>{fP(it[1])}</span>
        </div>
        <div style={{ height: 5, background: BD, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: it[1] + "%", background: pcC(it[1]), borderRadius: 3 }} />
        </div>
      </div>;
    })}
  </div>;
}

// CommCard: one exchange, rendered as a compact card (candidate #67). Replaces plain prose
// bullets in Section 2 with citation + deep link + verbatim quote + meters + related
// cross-reference.
function CommCard({ c }) {
  return <div style={{ background: "#fff", border: "1px solid " + BD, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.source} | {c.date}</div>
      <DeepLink kind={c.linkKind} />
    </div>
    <div style={{ fontSize: 12, color: DK, fontStyle: "italic", marginTop: 5, lineHeight: 1.5 }}>"{c.quote}"</div>
    <div style={{ fontSize: 10, color: MUT, marginTop: 3 }}>{c.who}</div>
    <MeterRow clarity={c.clarity} confidence={c.confidence} alignment={c.alignment} />
    {c.related && <div style={{ fontSize: 10, color: MUT, marginTop: 7, borderTop: "1px dashed " + BD, paddingTop: 6 }}>Related: {c.related}</div>}
  </div>;
}

// StatusPill: per-skill adaptation of the shared SevPill/PrioPill pattern (see "Semantic
// Color Maps, adapt per skill" in dashboard-components.md) for open-item status.
// Positive/resolved = BLU, never green. Maps 1:1 onto the four canonical status roles:
// Overdue = NEG, Unresolved = WARN, Open = NEU, Completed = POS.
var STATUS_C = { Overdue: R, Unresolved: AMB, Open: MUT, Completed: BLU };
var STATUS_BG = { Overdue: RISK, Unresolved: WARM, Open: CARD, Completed: OK };
function StatusPill({ s }) {
  return <span style={{ color: STATUS_C[s], background: STATUS_BG[s], border: "1px solid " + STATUS_C[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}

// OpenItemsTable: unified open-items tracker (candidates #68 Open Commitments and #71
// Open-loop/unresolved, merged into ONE structured treatment per the reconciliation note on
// both candidates). Fixed priority order (Overdue, then Unresolved, then Open, then
// Completed) is a deterministic business rule, not a user sort preference, so this is a
// bespoke ordered table rather than the resortable STable used for the Citation appendix.
function OpenItemsTable({ rows }) {
  var order = { Overdue: 0, Unresolved: 1, Open: 2, Completed: 3 };
  var sorted = rows.slice().sort(function (a, b) { return order[a.status] - order[b.status]; });
  return <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>
        {["Item", "Owner", "Due", "Status", "Source"].map(function (h, i) {
          return <th key={i} style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: i >= 3 ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>;
        })}
      </tr></thead>
      <tbody>{sorted.map(function (row, ri) {
        return <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
          <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, color: DK }}>{row.item}</td>
          <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, color: DK }}>{row.owner}</td>
          <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, color: DK, textAlign: "center", whiteSpace: "nowrap" }}>{row.due}</td>
          <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD, textAlign: "center" }}><StatusPill s={row.status} /></td>
          <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD, textAlign: "center" }}><DeepLink kind={row.linkKind} /><div style={{ fontSize: 9, color: MUT, marginTop: 2 }}>{row.source}</div></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

export default function Dashboard() {
  var m = D.meta;
  var overdue = D.openItems.filter(function (r) { return r.status === "Overdue"; }).length;
  var unresolved = D.openItems.filter(function (r) { return r.status === "Unresolved"; }).length;
  var openCount = D.openItems.filter(function (r) { return r.status !== "Completed"; }).length;
  var firstTimers = D.attendees.counterparty.filter(function (a) { return a.firstTime; }).length;

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: CARD, minHeight: "100vh", color: DK, fontSize: 13, padding: "24px 0" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>

        <div style={{ background: DK, padding: "12px 24px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Meeting Prep Brief</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{m.title}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{m.date} | {m.time}<br />{m.location}</div>
          </div>
        </div>
        <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "6px 24px", fontSize: 10, color: MUT }}>{m.asOf} | {m.connector}</div>

        <div style={{ padding: "18px 24px 30px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <Metric label="Attendees" value={D.attendees.lilly.length + D.attendees.counterparty.length} sub={firstTimers + " first-time"} />
            <Metric label="Open Items" value={openCount} sub={"of " + D.openItems.length + " total"} />
            <Metric label="Overdue" value={overdue} warn={overdue > 0} sub={unresolved + " unresolved, no deadline"} />
            <Metric label="Citations" value={D.citations.length} sub="all M365-sourced" />
          </div>

          {/* SECTION 1: WHO IS IN THE ROOM */}
          <Card title="1. Who Is In The Room">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: BLU, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Lilly</div>
                {D.attendees.lilly.map(function (a, i) { return <div key={i} style={{ fontSize: 12, marginBottom: 5 }}><strong>{a.n}</strong><span style={{ color: MUT }}> - {a.r}</span></div>; })}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: R, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Kinaxis</div>
                {D.attendees.counterparty.map(function (a, i) {
                  return <div key={i} style={{ fontSize: 12, marginBottom: 5 }}>
                    <strong>{a.n}</strong><span style={{ color: MUT }}> - {a.r}</span>
                    {a.firstTime && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: AMB, background: WARM, padding: "1px 6px", borderRadius: 10, textTransform: "uppercase" }}>First time</span>}
                  </div>;
                })}
              </div>
            </div>
          </Card>

          {/* SECTION 2: WHAT WAS LAST DISCUSSED (Communication detail panel, candidate #67) */}
          <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: DK, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 3, height: 14, background: R, borderRadius: 2 }} />2. What Was Last Discussed
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: MUT, marginBottom: 8 }}>Clarity / Confidence / Alignment are a synthesized read (0-100, banded High/Medium/Low), not a supplier-provided score.</div>
              {D.exchanges.map(function (c, i) { return <CommCard key={i} c={c} />; })}
            </div>
            <Card title="What It Means" note="Synthesized, Medium confidence">
              <div style={{ fontSize: 12, lineHeight: 1.6, color: DK }}>Kinaxis is anchored at a 4% flat increase and has not moved despite the 3-year-term ask raised Jul 19. Confidence is trending down (70 to 40) as the multi-year discount promise stalls past its own end-of-week estimate: treat that as the crux of this meeting, not a settled point. Alignment sits at 45-65% across the thread: directional agreement that a renewal happens, no agreement yet on price or the liability cap carried over from the June QBR.</div>
            </Card>
          </div>

          {/* SECTION 3: WHAT IS OPEN (unified Open Items tracker, candidates #68 + #71) */}
          <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: DK, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 3, height: 14, background: R, borderRadius: 2 }} />3. What Is Open
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 10 }}>
            <div style={{ background: "#fff", border: "1px solid " + BD, borderRadius: 8, padding: 14 }}>
              <OpenItemsTable rows={D.openItems} />
            </div>
            <Card title="Open Items Read" note="Escalation flag">
              <div style={{ fontSize: 12, lineHeight: 1.6, color: DK }}>The multi-year discount confirmation is 1 day overdue and is the single blocker for today's call: lead with it. The Net 45 vs Net 60 payment-terms question has gone unresolved for 5+ weeks with no reply: raise it explicitly rather than letting it stall again. {overdue + unresolved >= 2 ? "2 or more items are Overdue or Unresolved: flag for Category Manager follow-up regardless of how today's call goes." : "Below the escalation threshold; no routing change needed yet."}</div>
            </Card>
          </div>
          <Card title="Related Issues" note="From Field Guide">
            {D.relatedIssues.map(function (r, i) {
              var c = r.state === "Escalated" ? R : r.state === "In Progress" ? AMB : BLU;
              var bg = r.state === "Escalated" ? RISK : r.state === "In Progress" ? WARM : OK;
              return <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < D.relatedIssues.length - 1 ? "1px solid " + BD : "none", flexWrap: "wrap", gap: 6 }}>
                <div style={{ fontSize: 12, color: DK }}>{r.title}<span style={{ color: MUT }}> - {r.owner} - last activity {r.last}</span></div>
                <span style={{ fontSize: 10, fontWeight: 700, color: c, background: bg, padding: "2px 8px", borderRadius: 20 }}>{r.state}</span>
              </div>;
            })}
          </Card>

          {/* SECTION 4: WHAT YOU SHOULD WALK IN READY TO SAY */}
          <Card title="4. What You Should Walk In Ready To Say">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {D.talking.map(function (p, i) { return <Pillar key={i} c={p.c} k={p.k} t={p.t} d={p.d} />; })}
            </div>
          </Card>

          {/* SECTION 5: SUGGESTED AGENDA */}
          <Card title="5. Suggested Agenda" note="35 min total">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ padding: "6px 8px", fontSize: 11, color: MUT, textAlign: "left", borderBottom: "2px solid " + BD }}>Item</th>
                <th style={{ padding: "6px 8px", fontSize: 11, color: MUT, textAlign: "center", borderBottom: "2px solid " + BD }}>Minutes</th>
                <th style={{ padding: "6px 8px", fontSize: 11, color: MUT, textAlign: "center", borderBottom: "2px solid " + BD }}>SME Needed</th>
              </tr></thead>
              <tbody>{D.agenda.map(function (a, i) {
                return <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : CARD }}>
                  <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD }}>{a.item}</td>
                  <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: "center" }}>{a.min}</td>
                  <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: "center", color: a.sme ? AMB : MUT, fontWeight: a.sme ? 700 : 400 }}>{a.sme || "No"}</td>
                </tr>;
              })}</tbody>
            </table>
          </Card>

          <StateBanner kind="NOT_APPLICABLE" msg="Spend data unavailable this session: Fabric was not reachable. Commercial terms above are sourced from email and Teams only; pull spend context separately before committing to a multi-year number." />

          {/* CITATION APPENDIX */}
          <Card title="Citation Appendix" note={D.citations.length + " sources"}>
            <STable
              columns={[{ l: "Type" }, { l: "Who / What" }, { l: "Date" }, { l: "Source", a: "center" }]}
              rows={D.citations.map(function (c) {
                return [{ d: c.type }, { d: c.who }, { d: c.date, v: c.date }, { d: <DeepLink kind={c.linkKind} /> }];
              })}
            />
          </Card>

        </div>
        <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
          <div>Read-only across external M365. No email sent, no Teams post, no file changed.</div>
          <div>Company Confidential | Meeting Prep Brief | 2026</div>
        </div>
      </div>
    </div>
  );
}
```
