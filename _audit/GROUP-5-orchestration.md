# Group 5 Deep Read: Conversational, Routing, and Process Skills

Scope: procurement-launcher-1c344a, procurement-help-desk-1c344a, process-navigator-1c344a,
workflow-map-1c344a, timeline-builder-1c344a, meeting-prep-brief-1c344a.

All line numbers below refer to the file as read during this audit (2026-07-28). Evidence-only;
UNKNOWN marked where unverifiable from the files.

---

## 1. procurement-launcher-1c344a (THEO)

**Q1 ROLE.** "Your job is to orient the user in a few seconds and route them to the ONE skill
they need." (SKILL.md:147). Restated at :150: "It is a light router."

**Q2 ROUTING BEHAVIOUR.** Two mechanisms, both naming-only, never invocation:
- Single-hop routing table (SKILL.md:316-349): a markdown table (Pipeline/Skill/Helps
  you/Say this/Upload) THEO matches a request against, then fires the target skill's own
  trigger phrase. THEO does not call the skill programmatically; the trigger phrase is what
  actually launches it (the runtime, not THEO, dispatches on trigger match).
- Chain-aware "Guided path" (SKILL.md:180-249): given a free-text need, THEO (1) classifies
  intent, (2) "Names the full ordered path up front" from `references/routing-and-chains.md`,
  (3) "Hands off to step 1 with primed context. Fire that skill's trigger phrase... THEO does
  not run the skill; it launches it and steps aside," (4) "After each step, surfaces and primes
  the next" when the user returns.
- Explicit self-declaration, repeated twice: "It is a dispatcher, not an orchestrator. It
  cannot call or run other skills; it routes the user to the right one, which then activates on
  its own." (SKILL.md:152) and again in routing-and-chains.md:87: "explicitly a dispatcher, not
  an orchestrator - it names paths and hands off one skill at a time, it does not itself call or
  run another skill."
- **Never re-invokes itself with more data.** There is no case in the file where THEO re-runs
  a skill; "guided handoff" only means THEO tells the user what to say next when they return,
  it does not carry state that would let it re-fire a skill with accumulated data itself
  (SKILL.md:205-215, explicit "Auto-dispatch (NOT available today)").

**Q3 STATE.** None. No JSON, case file, or ledger is read or written by THEO itself. THEO's
only "memory" across a conversation is the chat transcript; chain-continuation detection
(routing-and-chains.md:45-49) works off "the conversation or Project is already mid-sequence,"
i.e., it reads what already exists (a Project artifact from another skill), it does not persist
its own record of what happened. THEO cannot itself tell first run from second run except by
re-reading conversation context or a downstream skill's own artifact.

**Q4 OVERLAP / BOUNDARY.** THEO's own BOUNDARY line (frontmatter, SKILL.md:11-14): "THEO owns
'what can these skills do / which skill should I use / get me started / teach me the suite';
lilly-brand-assets owns only brand tokens, the user manual, and troubleshooting, not menu
routing." Also "When NOT to launch" (SKILL.md:251-252): concrete tasks bypass THEO entirely and
go straight to the specialist skill (e.g., "review this contract" -> lilly-contract-review). No
explicit BOUNDARY text versus process-navigator or procurement-help-desk in THEO's own file;
the split there is carried entirely by the routing table's per-row `Say this` phrases (task
routing) vs THEO's own frontmatter triggers ("what can these skills do"/orientation-only).

**Q5 GAP TO ORCHESTRATION.**
- No persisted "session/user state" object THEO can read or write, so it cannot durably know
  which step of a guided path a user is on beyond the current chat's own memory; it only reads
  what a downstream skill already wrote (e.g., a Project artifact), which is not guaranteed to
  exist or be structured for this purpose.
- No mechanism to compose a request across a slice of multiple skills in one hop, only
  sequential single-skill handoff.
- Explicitly documents that "auto-dispatch" (sub-agent invocation of the next skill) does not
  exist in stock Desktop (SKILL.md:210-215) but says the chain data is "structured to become
  dispatch data" without a redesign - i.e., routing-and-chains.md is a buildable substrate for
  (b), not (b) itself.

**Q6 RUNTIME.** 10,258 words in SKILL.md (largest of the six); +1,866 words
routing-and-chains.md; +2,536 words teach-mode.md (loaded conditionally only). No numeric
kernel, no live search; the only "slow" mechanism is the widget HTML render (`assets/
theo-widget.html`, not read in this audit's Bash word count but referenced as a large inline
asset) via `visualize:show_widget`. Companion files are explicitly NOT inlined into SKILL.md
"so context stays light" (SKILL.md:22, 363-367) - this is the one skill in the group designed
around deliberately avoiding large single-file bloat.

---

## 2. procurement-help-desk-1c344a

**Q1 ROLE.** "Answer the practical 'how do I get this done' questions that Lilly END-USER
STAKEHOLDERS (not procurement reps) ask... This is the front door for a stakeholder who does
not know or care what the internal policy machinery is called." (SKILL.md:88-89).

**Q2 ROUTING BEHAVIOUR.** This skill does not route to other skills as its primary job; it
answers questions itself, citing sources. Its only "routing" is a Q2 handoff mention: "If the
question is actually a process-navigator question... say so explicitly and offer the handoff"
(Step 6, SKILL.md:262) and an opt-in offer to hand off to supplier-landscape/rfp-engine/etc.
when the stakeholder's question reveals a bigger sourcing need (SKILL.md:263). It never
re-invokes itself with more data in any documented step; each run is a single Q&A turn.

**Q3 STATE.** None persisted. It is explicitly "chat-only... this is a read-only Q&A skill"
(SKILL.md:66-67, S2). No case file, ledger, or JSON. Cannot distinguish first vs second run;
every invocation is stateless.

**Q4 OVERLAP / BOUNDARY.** Has the clearest, most explicit BOUNDARY section of the six skills:
"## BOUNDARY vs process-navigator (read before routing any question)" (SKILL.md:95-114),
stating this skill owns "stakeholder, transactional, 'how do I get this done' questions,"
process-navigator owns "procurement-REP policy, threshold, and system-requirement questions,"
and gives explicit "Trigger-collision handling" examples for when the two could be confused
(SKILL.md:109-114). This is a real, well-specified boundary (by audience + question type over
the SAME four sources), not accidental duplication - the two skills deliberately share
machinery (live-fetch-first / vendored-fallback pattern, SKILL.md:133-140) while splitting who
answers.

**Q5 GAP TO ORCHESTRATION.** Two separate gaps:
1. **The skill itself is not shippable yet.** Version stamp: "0.1 (OFFLINE SCAFFOLD - INERT
   until the network-gated steps below are run)" (SKILL.md:77). Its own vendored-fallback file
   is a placeholder: `references/TODO-network-gated-harvest.md` states "STATUS: placeholder
   only. This file contains NO Lilly content." (TODO file:1-3). Six NETWORK-GATED STEPS remain
   undone (SKILL.md:308-319), and Marc has NOT yet decided between shipping it as a sibling
   skill vs folding it into process-navigator as a mode (SKILL.md:319).
2. **Confirmed: it is NOT wired into THEO's live routing yet**, despite being described
   conversationally. procurement-launcher's own routing table explicitly marks it: "a 28th
   entry, procurement-help-desk (last row below), is a PENDING end-user/stakeholder front door
   whose content build is network-gated (Stage 7); it is listed so it is not stranded but is
   NOT counted in the 27 built and is not on the interactive widget yet." (procurement-launcher
   SKILL.md:318). The Markdown fallback menu lists it as "(pending)" (procurement-launcher
   SKILL.md:289, 298). routing-and-chains.md:36-38 confirms: "The pending procurement-help-desk
   (Stage 7, network-gated content build) is an end-user front door, not a link in these
   producer/consumer chains; it is intentionally NOT given a chain row until it ships."

**Q6 RUNTIME.** 4,846 words. No numeric kernel. Slow mechanism: live M365 connector fetch of 4
named SharePoint/intranet pages per question (same as process-navigator); one source (Global
ProtectLilly) is flagged as "the source most likely to fail retrieval" because it lives on
now.lilly.com, outside SharePoint indexing (SKILL.md:129-131, 219-222).

---

## 3. process-navigator-1c344a

**Q1 ROLE.** "Answer process, threshold, and system-requirement questions for any Lilly user
(end-user, requester, buyer, SME) by reading authoritative Lilly content at runtime. This is
the front-door Q&A skill: the one that handles 'how do I do this' before any other skill is
invoked." (SKILL.md:90).

**Q2 ROUTING BEHAVIOUR.** Answers the question itself; routing is a post-answer, opt-in,
default-no suggestion only: "Step 5: Cross-skill suggestion... offer to invoke a downstream
skill: 'Want me to start a supplier landscape...' / 'Want me to draft an RFP package?' / 'Want
me to estimate the timeline?' / 'Want me to draw a workflow diagram...' Render as a tappable
single-select single-select; default to no." (SKILL.md:241-249). It never invokes another skill
itself; it only offers the phrase. It is also called INBOUND by other skills as a
sub-routine (theos-field-guide, timeline-builder, workflow-map, "Any other skill that needs a
process or threshold answer" - Cross-Skill Handoffs, SKILL.md:365-369), returning "the
structured answer block (not just the prose) so the calling skill can ingest the citations...
and confidence label" (SKILL.md:377). This is the one clear instance in the group of one
skill's OUTPUT being built for machine (not just human) consumption by a sibling skill, though
still human-relayed since Desktop cannot sub-agent-call.

**Q3 STATE.** None persisted by this skill. Chat-only, no case file (SKILL.md:65-66, S2:
"Do not write durable artifacts here: this is a read-only Q&A skill"). One exception: the
optional "New-Supplier Governance Rows" light artifact (SKILL.md:258-333) is generated fresh
each run from whatever document set the user has shared IN THAT conversation; it is not a
persisted ledger and explicitly disclaims being a system of record ("Not a system of record"
banner, SKILL.md:319).

**Q4 OVERLAP / BOUNDARY.** Frontmatter BOUNDARY: "answers questions about a process; use
workflow-map to DRAW a process diagram and timeline-builder to ESTIMATE durations."
(SKILL.md:13). Cross-Skill Handoffs section also states the bidirectional split with
lilly-contract-review (SKILL.md:373-376) and confirms it is called BY workflow-map/
timeline-builder as a sub-routine, not a peer that duplicates their output. This is a real
functional boundary (rules vs diagram vs duration), each with its own deliverable shape.

**Q5 GAP TO ORCHESTRATION.** No state object to support a re-run with more data; each answer is
independent. The Step 5 cross-skill suggestion mechanism proves the pattern THEO's guided-path
already generalizes (name the next skill, default-no picker) but process-navigator does not
carry forward what was asked/answered for a later composed request; a second question in the
same conversation re-runs Steps 1-5 from scratch with no memory of the first beyond raw chat
context.

**Q6 RUNTIME.** 5,043 words. Slow mechanism: same 4-source live M365 fetch pattern as
procurement-help-desk, with retry-once-then-fallback per source (SKILL.md:202-207) and an
optional `visualize:show_widget` decision-tree / governance-table render (SKILL.md:255-268,
graceful markdown degrade).

---

## 4. workflow-map-1c344a

**Q1 ROLE.** "Produce a clear visual of what needs to happen on a procurement request, in what
order, and by whom. The diagram answers 'what does this process look like?' The checklist
answers 'what do I (and others) actually need to do?'" (SKILL.md:92).

**Q2 ROUTING BEHAVIOUR.** Not a router in the THEO sense; it is a COMPOSER. "Rule 6: Compose,
do not re-derive. When process-navigator and timeline-builder are available, call them. Do not
re-implement the rule engine or the duration logic inside this skill." (SKILL.md:342).
Concretely: Step 2 "Call process-navigator (if available)... Call timeline-builder (if
available)..." (SKILL.md:137-139). This is the clearest example in the group of one skill's
workflow actually consuming another skill's structured output as an input step, not just
naming it. It never re-invokes ITSELF with more data as a documented step, though Cross-Skill
Handoffs note rfp-case-manager's "Refresh workflow: the map can be regenerated with current
state markers... if the user wants a state-aware view" (SKILL.md:321-322) - i.e., a caller
(rfp-case-manager) can ask for a second, refreshed run, but workflow-map itself has no
internal "run 2" logic distinct from "run 1."

**Q3 STATE.** No file this skill itself owns/persists across runs. It reads roster sources
(harvested per-run from M365 + Project) and, when given, a Field Guide `issue_id` (SKILL.md:
108-111, 152-194) - but that state belongs to theos-field-guide, not to workflow-map. An
"Optional machine-readable checklist sidecar (opt-in)" JSON block (SKILL.md:292-307) is emitted
as OUTPUT for downstream ingestion, not read back by workflow-map on a future run. So
workflow-map cannot itself tell "first run" from "second run" of the same request; only a
CALLER (rfp-case-manager) can, by holding its own case file and asking for a "state-aware"
regeneration.

**Q4 OVERLAP / BOUNDARY.** Frontmatter BOUNDARY: "process-navigator ANSWERS the rule questions
(need TPRM, which threshold, PO vs MSA); workflow-map DRAWS the resulting phases and tasks.
Want a picture or task list, use this skill." (SKILL.md:13). Purpose section restates it as
"the visual companion to timeline-builder... and the actionable companion to process-navigator"
(SKILL.md:94-95). This is a genuine, non-duplicative boundary: process-navigator produces facts,
timeline-builder produces durations, workflow-map renders both into a diagram/checklist. No
functional overlap found; the three compose rather than duplicate.

**Q5 GAP TO ORCHESTRATION.** The `roster_kernel.py` classification step (Step 3, SKILL.md:
152-194, Kernel Wiring G11 at :348-358) is the one deterministic, non-model-judgment piece of
state-like machinery in the whole group - it is a good template for a future "session state"
object (typed record, kernel-computed, never model-guessed) but it is scoped only to roster
classification, not to cross-skill orchestration state.

**Q6 RUNTIME.** 5,502 words SKILL.md + 3,929-word `roster_kernel.py` (a vendored deterministic
Python kernel, not LLM arithmetic, per Rule 8: "Roster classification is kernel-computed, never
a prose guess (G11)," SKILL.md:346). Slow mechanism: M365 harvest across Outlook/Teams/Calendar
plus Project members (Step 3a, SKILL.md:158-167) before the kernel call; three output modes
(in-chat/artifact/email) each with their own render path (Step 4, SKILL.md:196-260).

---

## 5. timeline-builder-1c344a

**Q1 ROLE.** "Produce a loose but credible procurement timeline for any request: how long it
will take, what's driving the duration, what could tighten or extend it." (SKILL.md:144-146).

**Q2 ROUTING BEHAVIOUR.** Not a router; a computation engine. It is CALLED by
theos-field-guide's status-request flow and BY workflow-map for duration labels (Cross-Skill
Handoffs, SKILL.md:496-501). Its own routing is limited to closing "Next Steps" pointer text
("A pointer to running this through the status-update flow in theos-field-guide," SKILL.md:
528-530) and citing process-navigator as an upstream input source for factor extraction
(SKILL.md:499). It DOES have a genuine "re-run with more data" behavior, but the re-run is of
its OWN state, not another skill: "The user can request to recalibrate finer factors at any
time ('recalibrate timeline-builder')" (SKILL.md:209), and any run can be re-invoked with newly
confirmed factors, in which case Step 1's extracted/confirmed inputs simply change and the
same deterministic engine (`timeline_engine.py`) recomputes. This is the ONE skill in the group
with an explicit, named "first run vs later run" distinction.

**Q3 STATE.** Yes - the clearest state object in the whole group: `timeline_calibration.json`,
"saved to Project knowledge (preferred) or emit as a downloadable file" (SKILL.md:195), holding
the user's three calibration answers and the derived domain scale factor K (SKILL.md:197-207).
Explicitly used to tell first run from later runs: "On first invocation in a given Project (or
with no calibration file present in conversation), ask THREE questions only." (SKILL.md:172).
Troubleshooting note also names the exact failure mode: "calibration keeps re-asking - the
`timeline_calibration.json` file is not in the conversation or Project; paste it back or re-run
the three-question calibration." (SKILL.md:23).

**Q4 OVERLAP / BOUNDARY.** Frontmatter BOUNDARY: "estimates DURATION only; use workflow-map for
the phase diagram and process-navigator for 'what process applies'." (SKILL.md:13). No overlap
found with workflow-map (duration numbers vs diagram rendering) or process-navigator (duration
math vs policy facts); genuine division of labor, and workflow-map's own Rule 6 (SKILL.md:342,
group item 4 above) confirms it defers to timeline-builder rather than re-deriving durations.

**Q5 GAP TO ORCHESTRATION.** `timeline_calibration.json` is scoped to THIS skill's own
calibration only (three numbers + derived K); it is not a general-purpose "session/task state"
object that other skills or THEO could read to know what step of a cross-skill flow the user is
on. It is the best available MODEL for what such an object should look like (small, typed,
Project-knowledge-persisted, explicitly checked for presence/absence to gate first-run
behavior) but its scope is narrow (single skill's calibration, not orchestration state).

**Q6 RUNTIME.** 11,662 words SKILL.md (largest of the six, driven by the inlined canonical
dashboard JSX and dashboard-canonical spec) + 3,558-word `timeline_engine.py`. Hard rule: "The
critical-path computation is performed by `timeline_engine.py`, never by model arithmetic."
(Rule 10, SKILL.md:523). `MAINTENANCE.md` documents a regression guard
(`DoubleCountRegressionError`) and a sanity-ceiling self-check (~78 weeks) as the two most
important correctness checks in the kernel (MAINTENANCE.md:39-51, SKILL.md:413-419). The optional
interactive dashboard is presentation-only, "never the source of truth" (SKILL.md:493, 544),
which limits how much extra latency the dashboard can introduce relative to correctness risk.

---

## 6. meeting-prep-brief-1c344a

**Q1 ROLE.** "Walk into any procurement meeting with the context already gathered. The brief is
a one-page artifact... It exists to replace the 20 minutes of pre-meeting hunting through email
+ SharePoint + the contract folder." (SKILL.md:79).

**Q2 ROUTING BEHAVIOUR.** Not a router; a synthesis skill over read-only M365 surfaces. Routing
is entirely opt-in, post-delivery, default-no: "Step 5: Optional follow-on actions... Draft any
required pre-meeting reply (via voice-profile)... Build the workflow map... (via
workflow-map)... Pull spend / pricing benchmarks (via market-rate-benchmarking or
pro-forma-builder)... Open the contract review (via lilly-contract-review)... Never auto-fire
any of these." (SKILL.md:209-217). It is CALLED by theos-field-guide ("a meeting today/tomorrow
has no prep file: the digest's 'Today/Tomorrow' tab can offer 'Prep me for this'") and by
rfp-case-manager's Schedule workflow (Cross-Skill Handoffs, SKILL.md:233-236). No
re-invocation-with-more-data logic of its own; each meeting gets one brief per resolve.

**Q3 STATE.** No persisted file of its own ("this is a read-only Q&A skill" pattern extended to
"produces local DOCX and unsent self-drafts only," Rule 1, SKILL.md:248). One RECOMMENDED input
gestures at cross-run memory without specifying a mechanism: "A prior brief from this skill (for
series meetings: the brief gets richer when state accumulates across meetings with the same
counterparty)." (SKILL.md:97) - but no named file, no schema, no read/write step describing HOW
that accumulation happens; this is aspirational prose, not an implemented state object. UNKNOWN
whether any such accumulation is actually wired (no Step describes reading a prior brief).
Separately, it DOES read another skill's persisted state as an input: `field_guide_state.json`
(Related Issues subsection, SKILL.md:167) - reading, not writing.

**Q4 OVERLAP / BOUNDARY.** Frontmatter BOUNDARY: "prepares the USER to attend a meeting; an
organizer's own meeting agenda is out of scope (no dedicated agenda skill exists in this
suite), and for daily triage across all meetings use theos-field-guide." (SKILL.md:13-15).
"What this is not: an agenda-builder for the meeting organizer... a strategy doc, or a
substitute for the meeting itself." (SKILL.md:83-84). Clean, real boundary versus
theos-field-guide (per-meeting depth vs daily cross-meeting triage); no overlap found with any
other Group 5 skill (it does not compete with process-navigator, workflow-map, or
timeline-builder; it calls them opt-in instead).

**Q5 GAP TO ORCHESTRATION.** The "brief gets richer... when state accumulates" line
(SKILL.md:97) is the one concrete, named place in this skill where cross-run memory is implied
but not built: there is no schema, no file name, no read-back step. This is the most direct,
buildable gap of the six: define a `meeting_prep_state.json` (or fold into
`field_guide_state.json`) keyed by counterparty, and add a Step 1.5 "read prior brief for this
counterparty if present" the way timeline-builder reads `timeline_calibration.json`.

**Q6 RUNTIME.** 6,968 words, including a large inlined canonical dashboard JSX
(`meeting_prep_brief_canonical_dashboard.jsx`, SKILL.md:275-674) that is presentation-only; the
default deliverable is chat markdown (SKILL.md:186). Slow mechanism: parallel M365 pulls
(Outlook 14-day thread search, Teams chat search, SharePoint document search, optional Fabric
spend view; Step 2, SKILL.md:111-126), each independently gated for connector availability.

---

## Orchestration design recommendation

**Where orchestration should live: a NEW skill, not procurement-launcher, and not fully
distributed.**

Justification from the evidence read:
1. procurement-launcher (THEO) is explicitly, repeatedly, and by design a **dispatcher, not an
   orchestrator** (SKILL.md:152, routing-and-chains.md:87, and the "Auto-dispatch (NOT available
   today)" honesty section at SKILL.md:205-215). This is not an accidental limitation the skill
   forgot to lift; it is a stated architectural choice ("THEO does not chain-invoke, does not run
   a pipeline automatically"). Overloading THEO with real orchestration would contradict its own
   documented Role and would bloat the already-largest SKILL.md in the group (10,258 words) that
   is deliberately kept light by NOT inlining its companion files (SKILL.md:22, 363-367).
2. Distributing orchestration purely into each skill's own "Cross-Skill Handoffs" section (the
   current pattern) works for simple compose-one-sibling cases (workflow-map calling
   process-navigator and timeline-builder, SKILL.md:137-139) but has no answer for (c) - serving
   a request from a COMBINATION OF SLICES across skills that do not already call each other. No
   skill in this group declares a "slice" contract (a partial, addressable piece of its own
   output) that another skill or a coordinator could request; they declare only whole
   deliverables (a brief, a diagram, a timeline).
3. Full distribution also does not solve re-running-with-more-data across DIFFERENT skills: only
   timeline-builder solves it for itself (`timeline_calibration.json`), and workflow-map's
   `roster_kernel.py` shows the right pattern (kernel-computed, typed, non-model-guessed) but is
   scoped to one function.
4. Therefore: a new, thin, dedicated orchestration skill (not a menu, not a Q&A skill) that owns
   (i) a state object schema, (ii) a slice-request contract, and (iii) the actual "call skill A,
   then B, then reconcile" logic that THEO's own text says it deliberately does NOT do. THEO
   remains the front door / classifier that hands off to this orchestrator when a request is
   multi-step or multi-slice, exactly the same way it already hands off to any other skill
   (single trigger phrase, one hop) - it does not need to change its own Role.

**Minimum state object for re-running a skill with more data, and where it lives.**

The evidence already contains the best template: `timeline_calibration.json`
(timeline-builder SKILL.md:135, 172-209), which is:
- small and typed (three numeric answers + one derived scale factor K),
- persisted to Project knowledge when a Project exists, else emitted as a downloadable file
  (S2 pattern, shared suite-wide),
- explicitly checked for presence/absence to gate behavior ("no calibration file present in
  conversation" -> first-run path, SKILL.md:172),
- self-describing about staleness/recovery (the troubleshooting note tells the user to "paste it
  back" if lost, SKILL.md:23).

A minimum general-purpose version for orchestration would need, at minimum: a `request_id` (or
counterparty/entity key, as meeting-prep-brief's unbuilt "prior brief... state accumulates"
idea at SKILL.md:97 implies), the LAST skill that ran and what it produced (artifact name/type,
not full content), which inputs were CONFIRMED vs ASSUMED (the same confirmed/assumed
distinction timeline-builder already tracks per-factor, SKILL.md:429 and MAINTENANCE.md:124-132
for why that tracking is a chat-turn concern, not a kernel concern), and the NEXT suggested hop
per routing-and-chains.md's own Predecessor/Successor table. It should live in Project knowledge
(the same S2 pattern every skill in this group already implements: "use Project Knowledge as a
source... NEVER require a Project... fall back to user uploads and user-carried JSON" -
verbatim S2 text, e.g. timeline-builder SKILL.md:114-115), not in a new location, so it degrades
the same way every other suite artifact already does when no Project exists.

**What a "slice composition" request would mechanically require.**

None of the six skills in this group currently declare a "slice" of their output as an
independently addressable unit - every skill's Deliverables section names a whole artifact (a
brief, a diagram+checklist, a timeline estimate, an answer block). The closest things to a
slice contract found:
- process-navigator's structured answer block, explicitly built for machine consumption by a
  caller ("return the structured answer block (not just the prose) so the calling skill can
  ingest the citations, the as-of date, and the confidence label," SKILL.md:377) - this is a
  genuine sub-output contract, but only one skill (process-navigator) does it, and only for
  itself as an input to others, not as a general pattern.
- workflow-map's optional JSON checklist sidecar (SKILL.md:292-307) - a partial, structured
  slice of its own output, opt-in, for downstream ingestion.
- routing-and-chains.md's Predecessor/Successor table (lines 61-99) already names WHICH
  artifact one skill hands to another (e.g., "rfp-case-manager: rfp-engine (via
  case_handoff.json)"), which is evidence that named handoff artifacts already exist in the
  suite for SOME pairs but not as a universal schema.

To actually serve (c), each skill would need to additionally declare, in its own SKILL.md, a
short list of NAMED, independently-producible slices (e.g., timeline-builder's "phase breakdown
table only" vs its full text skeleton; workflow-map's "roster only" vs the full diagram) with a
stable schema, the way process-navigator's answer block and workflow-map's checklist JSON
already partially do. The new orchestration skill would then request named slices from named
skills (still one hop at a time, per Desktop's real constraint) and assemble them, rather than
requesting whole deliverables and discarding the unused parts.

**Is procurement-help-desk already sufficient as the conversational help skill?**

No, on two independent grounds, both confirmed directly in the files:
1. **It is not built.** Its own version stamp is "0.1 (OFFLINE SCAFFOLD - INERT until the
   network-gated steps below are run)" (SKILL.md:77), its vendored fallback content file is a
   placeholder with "NO Lilly content" (TODO-network-gated-harvest.md:1-3), and six
   NETWORK-GATED STEPS remain undone, including the basic live-validation of its four source
   URLs (SKILL.md:308-317).
2. **It is confirmed NOT wired into THEO's live routing**, exactly as the task brief suspected.
   procurement-launcher's routing table explicitly excludes it from the counted, routable skill
   set: "NOT counted in the 27 built and is not on the interactive widget yet" (procurement-
   launcher SKILL.md:318), listed only as "(PENDING)" in the Markdown fallback (procurement-
   launcher SKILL.md:289, 298), and routing-and-chains.md independently confirms: "intentionally
   NOT given a chain row until it ships" (routing-and-chains.md:36-38).

Additionally, Marc has an open, undecided architectural fork explicitly flagged in the skill's
own text: ship it as a new sibling skill (current scaffold) vs fold it into process-navigator as
a second, end-user-facing MODE reusing process-navigator's machinery directly
(procurement-help-desk SKILL.md:319, "Alternative build path... not yet decided"). This decision
should be made BEFORE investing further in either the harvest work or the routing wiring, since
the two paths have different implications for state/dedup: as a sibling it needs its OWN
BOUNDARY-guard logic against process-navigator (already drafted, SKILL.md:95-114) and its own
routing-table row; folded in, process-navigator's own file would need an audience-mode picker
instead.
