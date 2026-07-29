---
name: timeline-builder-1c344a
description: >
  Produces a loose, defensible procurement timeline estimate for any request: sourcing, contract
  negotiation, risk reviews (TPRM/SAE/Privacy/AIR), Ariba ATC/ATS approval, and execution. Reads
  the request (or an uploaded SOW/email), picks the relevant phases and factors (instrument, reviews,
  supplier status, redline turns, pilots), builds a critical-path estimate from per-phase durations
  (parallel phases combined with max, not summed), then adds sequential ATC/ATS and execution.
  Output: phase-by-phase Low/Base/High range, named delay drivers, and a confidence label. First-run
  calibration asks ONLY three questions. Triggers on "build a timeline", "estimate the timeline",
  "how long will this take", "when will this be done", "rough schedule for", "timeline for this
  request", "estimate remaining weeks", "draft a status timeline". BOUNDARY: estimates DURATION only;
  use workflow-map for the phase diagram and process-navigator for "what process applies".
metadata:
  suite: v10.7.0
---

<!-- MERGED PACKAGE (v10.7.0): The canonical dashboard example and its spec are inlined at the end of this document, under "## INLINED: examples/timeline_builder_canonical_dashboard.jsx" and "## INLINED: references/dashboard-canonical.md". When the "Deliverables" section below or the dashboard spec refers to either file, the content is already present in this same document; do not attempt to read them from disk. -->

<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Suite:** v10.7.0
>
> **Troubleshooting and usage guidance (inlined below):** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports an error, answer from this inline note. (The shared `lilly-brand-assets-1c344a` user manual is the fuller reference when that foundation is installed; this skill never hard-depends on it.) Common cases: (a) **estimate looks too large/too small** - confirm the contract instrument, deal-size band, and which risk reviews are actually triggered; an over-broad tier or a summed (instead of max) parallel band is the usual cause. (b) **output too thin** - the skill ran without a document; provide the SOW/email or answer the three Step 1 pickers. (c) **calibration keeps re-asking** - the `timeline_calibration.json` file is not in the conversation or Project; paste it back or re-run the three-question calibration. (d) **which model** - Opus for the full estimate and reasoning; Sonnet is fine for a quick re-render of an already-computed estimate. This skill is chat-first; it does not render a React dashboard by default, so React/share-button errors do not apply unless the optional Gantt view was requested.

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
- The full guardrail set (G1-G13) is **inlined below** in this rule, so this skill is self-sufficient. When the shared `lilly-brand-assets-1c344a` foundation (v10.0+) is installed, its `references/execution-guardrails.md` is the fuller, canonical text; defer to it when present, but never hard-depend on it.
- When this skill produces an analytical document, deck, or dashboard, also apply the **narrative-standards** summary (output must read as connected analysis, not a key-value dump or bullet fragments), the **validation-checklist** summary (re-verify numbers, sources, and cross-artifact consistency before delivering), and the **house-styles** summary (this skill uses the Magazine-Report house style; pull exact palette/typography from the foundation's brand-colors / dashboard-components when present, and never invent off-style palettes, fonts, or components). These summaries are inlined in the "Inlined foundation summaries" note below.
- When this skill assesses a supplier's risk (financial, cyber, data, geopolitical, operational, or pharma gates like debarment/sanctions/GxP), apply the **supplier-risk** anti-fabrication summary (also inlined below): never assert a debarment, sanctions, breach, or financial-distress status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the SME. (Note: this skill estimates duration and does not itself screen supplier risk; this rule applies only if a run is asked to characterize a review's risk posture.)
- **Foundation dependency / graceful degradation:** the canonical references live in the shared `lilly-brand-assets` skill (v10.0+ expected). If that foundation cannot be read (missing, corrupted, or older than expected), do NOT fail: proceed using the summaries inlined below, tell the user you are running without the shared references (so styling/depth may be reduced), and ask them to confirm lilly-brand-assets v10.0+ is installed and current.
- Summary of the guardrails (G1-G13):
  - **G1 (Tool Selection):** When tracked changes, comments, or document authorship are part of the input (any redline, negotiated document, or commented file), read the .docx XML with `unpack.py` (read `word/comments.xml`, and the `<w:ins>` / `<w:del>` / `<w:commentRangeStart>` elements in `word/document.xml`). Use `extract-text` ONLY for content-only extraction where change history is irrelevant (RFP submissions, spend reports, scope documents). Never use `extract-text` where tracked changes or comments are the analytical input.
  - **G2 (Gate Checks):** Every multi-phase workflow has mandatory gate checks. Produce the intermediate artifact from each phase before proceeding to the next. If you are writing the final deliverable without having produced the intermediate artifacts, STOP and go back.
  - **G3 (Existing Context First):** For documents with existing tracked changes or comments, read and respond to them BEFORE adding new analysis. The existing context IS the primary input.
  - **G4 (Definition Tracing):** When a finding involves defined terms (data rights, IP, AI training, confidentiality), trace the relevant definitions through the governing documents and state which definition applies and why.
  - **G5 (Data Model First):** For dashboard-producing skills, build the complete data object before writing any rendering code.
  - **G6 (Pre-Delivery Self-Test):** Run the skill-specific delivery checklist before producing final output. If the executive summary reads like it could apply to any contract, the analysis was shallow.
  - **G7 (Research Minimums):** Skills with external research phases must meet a stated minimum search count, keep a research log, and label output "RESEARCH PENDING" when minimums are not met. Never present a single data point as a firm benchmark.
  - **G8 (Pass Artifact Enforcement):** For multi-pass workflows, confirm each named pass artifact exists before starting the next pass. If you are writing the final deliverable without having produced every pass artifact, STOP, you collapsed the passes, go back.
  - **G9 (Anti-Collapse Signal):** If your output shows the skill-specific collapse patterns (for this skill: a total that ignores the parallel-band max rule, a tier multiplier applied on top of phases that already encode the tier, or a single hard date), stop generating and re-run the missing analysis.
  - **G10 (Chunked Artifact Assembly):** Scaffold a large single-file artifact first, then append it section by section, and run a structural self-test (balanced braces/parentheses, no truncated tokens, totals reconcile) before presenting the file.

**Inlined foundation summaries (referenced by Rule 9; this skill is self-sufficient without the foundation).**
- **narrative-standards (summary):** Write connected analysis, not a key-value dump. Each phase line names its driver and what would change it. The estimate reads as a reasoned critical-path walk-through, not a table of numbers with no logic.
- **validation-checklist (summary):** Before delivering, re-derive the total once independently and confirm: (1) parallel bands used max, not sum; (2) the friction adjustment was applied once, not compounded; (3) Low/Base/High propagated from per-phase Low/Base/High (no flat percentage); (4) sequential ATC/ATS and execution added after, unscaled; (5) the single-effort sanity ceiling did not trip (or, if it did, the caveat is shown). Emit the one-line reconciliation in the output.
- **house-styles (summary):** This skill uses the **Magazine-Report** house style. The optional Gantt view pulls exact palette and typography from the foundation's brand-colors / dashboard-components when present. Status/severity colors use the foundation's canonical non-green palette (no green or teal in status bars). Never invent off-style palettes, fonts, or components.
- **supplier-risk (summary):** Never assert a debarment, sanctions, breach, or financial-distress status without a cited source. "Not verified, requires a formal screen" is the answer; gating items route to the SME. (Duration estimation does not screen risk; this applies only if a run is asked to characterize a review's risk posture.)

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
- **Skill:** Timeline Builder
- **Suite:** v10.7.0
- **Version:** 1.2
- **Last Updated:** July 22, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation; this skill degrades gracefully without it)
- **Calibration:** Per-user, saved to Project knowledge as `timeline_calibration.json`. First-run prompt asks ONLY three questions; from them the skill derives ONE domain scale factor that adjusts every baked-in default (not just the three negotiation rows).
- **Changelog:**
  - v1.2 (July 2026): Added the optional interactive dashboard's canonical structure (LOCKED 3-tab skeleton: Overview, Portfolio, Deal & Renew), inlined at the end of this document as `examples/timeline_builder_canonical_dashboard.jsx` and specified in `references/dashboard-canonical.md`. Replaced the prior one-line "Gantt-style dashboard" description with the two anchor visuals (the SLA-vs-deadline Live Steps lane view and the portfolio gate-by-date Gantt), a backward-planned renewal-runway view, a generic task-level critical-path panel, and a two-week status calendar. All panels pair a visualization with a narrative-analysis card and share a client-side JS port of `timeline_engine.py`'s math for live recompute; the text estimate remains the sole source of truth (Rule 10 unchanged).
  - v1.1 (June 2026): Estimation-model correction. The complexity tier no longer multiplies phase durations that already encode complexity (that double-count produced 3-6x inflation); the tier now maps to a small, interpolated unmodeled-friction factor (1.00-1.25) applied once to the critical-path base only. Parallel risk reviews and onboarding combine with a single rule (max, never sum). The output range now propagates per-phase Low/Base/High through the same critical-path logic instead of a flat plus or minus 20%. Calibration derives a single domain scale factor applied to all defaults. Added a worked end-to-end example and a single-effort sanity-ceiling self-check (~78 weeks). Tightened the description and reworded foundation pointers to inlined summaries. Suite stamp added.
  - v1.0 (June 2026): Initial release. Phase model (Sourcing, Negotiation + Reviews, Ariba PR ATC/ATS, Execution). Calibration via three-question first-run prompt. Calibrated to IT/R&D defaults.
  - Suite-wide guardrails note: the cross-skill guardrails G1-G13 (not a per-skill version) are summarized inline in Operating Rule 9.

# Timeline Builder

## Purpose

Produce a loose but credible procurement timeline for any request: how long it will take, what's driving the duration, what could tighten or extend it. "Loose-but-credible" is the design: ranges, not promises; honest about confidence; every range driven by named factors.

This is also the engine called by **theos-field-guide's status-request flow** to compose a "where are we" reply, and by other skills that need duration estimates.

## Inputs

### MUST
- A description of the request, OR an uploaded SOW / proposal / email / requirement that the skill can extract from.

### RECOMMENDED
- Confirmed contract instrument (PO T&Cs / SOW under existing MSA / new MSA / amendment / etc.)
- Confirmed risk reviews triggered (TPRM / SAE / Privacy / AIR)
- New supplier vs existing supplier
- Expected redline turn count
- Pilot / PoC details if applicable
- Dollar value (for Ariba PR ATC/ATS routing)

### OPTIONAL
- Stakeholder OOO windows
- Specific Lilly holidays in the window
- Confidentiality level

If the request is sparse, the skill applies its defaults and labels each assumption explicitly. Always proceed with labeled defaults; never block on enriching inputs.

## Calibration (per-user, first-run only)

On first invocation in a given Project (or with no calibration file present in conversation), ask THREE questions only. Everything else uses baked-in defaults.

**Graceful degradation for the picker primitive (applies to every `ask_user_input_v0` block in this skill).** If `ask_user_input_v0` is unavailable in the running surface, do NOT fail: ask the same questions inline as numbered chat prose with the options listed, and accept a typed reply. The questions and their options are unchanged; only the rendering degrades from tappable to typed. If the user gives no answer to the calibration prompt, proceed with `K = 1.0` (un-calibrated IT/R&D defaults) and say so, rather than blocking.

**IMPLEMENTATION REQUIREMENT.** Render via `ask_user_input_v0`:

```
ask_user_input_v0(questions=[
  {
    "question": "Typical duration for a SOW under an existing MSA (no MSA changes), in your domain. Average weeks?",
    "type": "free_text"
  },
  {
    "question": "Typical duration for a NEW MSA (full negotiation), in your domain. Average weeks?",
    "type": "free_text"
  },
  {
    "question": "Typical duration for a SOW under existing MSA when the MSA needs an amendment. Average weeks?",
    "type": "free_text"
  }
])
```

Save the three values to `timeline_calibration.json` in Project knowledge (preferred) or emit as a downloadable file. The skill labels the user's calibration as their domain anchor.

**Deriving the domain scale factor (so calibration reaches the whole model, not just three rows).**
The three answers do two things:
1. **Direct override** of the three matching negotiation rows (Q1 = SOW under existing MSA; Q2 = New MSA full negotiation; Q3 = SOW with MSA amendment). The user's number replaces the baked-in Average for that row.
2. **One domain scale factor `K`** that adjusts EVERY other baked-in default (sourcing, the other negotiation rows, risk reviews, onboarding, redline turns, pilots) so the model is not left IT/R&D-anchored after calibration. Compute `K` as the ratio of the user's answers to the baked-in averages they overrode, then clamp it:

```
K_raw = mean( Q1/6 , Q2/20 , Q3/10 )      # 6, 20, 10 are the baked-in averages for those three rows
K     = clamp(K_raw, 0.6, 1.8)            # never let three numbers swing the whole model wildly
```

Apply `K` multiplicatively to the Low, Base, and High of every NON-overridden duration row (sourcing, risk reviews, onboarding, per-turn redline, pilots, and the negotiation rows the user did not answer). Do NOT apply `K` to the three directly-overridden rows (they are already the user's own numbers), and do NOT apply `K` to the sequential Lilly-system phases (ATC/ATS and execution are Lilly-system constants, not domain-scaled). Store `K` in `timeline_calibration.json` and state it in the output ("scaled to your domain, K = 1.15"). If no calibration is present, `K = 1.0` and the output says it is running on un-calibrated IT/R&D defaults.

The user can request to recalibrate finer factors at any time ("recalibrate timeline-builder"), but is never asked beyond the three questions on the default first-run path (Hard Rule 8).

## Defaults (baked in; IT/R&D anchored, then domain-scaled by K)

All durations are calendar weeks. Every row carries **Low / Base / High** and ALL THREE are carried through the math: Base drives the headline estimate, and Low/High propagate to the output range (see Step 5). There is no separate flat percentage. The domain scale factor `K` from calibration multiplies Low/Base/High of every non-overridden row.

> Note on terminology: rows below are no longer split into "multiplier-eligible" vs "no-multiplier". The estimate is a **critical-path sum of phase durations**; the tier maps only to a small unmodeled-friction factor (see "Unmodeled-friction factor" table). Sequential Lilly-system phases (ATC/ATS, execution) are added last and never scaled by the friction factor or by K.

### Phase durations

**Sourcing phase (pick one or none):**

| Type | Low | Base | High |
|---|---|---|---|
| None (direct buy) | 0 | 0 | 0 |
| RFI only | 3 | 4 | 5 |
| RFQ (pricing-driven) | 4 | 5 | 6 |
| RFP (full, 4-6 suppliers, mid complexity) | 8 | 11 | 14 |
| Multi-stage (RFI then RFP) | 10 | 14 | 18 |

**Negotiation phase by contract instrument (pick one):**

| Instrument | Low | Base | High |
|---|---|---|---|
| PO with Lilly T&Cs | 2 | 3 | 4 |
| Short form / evaluation agreement | 4 | 6 | 8 |
| SOW under existing MSA (no MSA changes) | 4 | 6 (overridden by calibration Q1) | 8 |
| SOW under existing MSA (MSA amendment needed) | 8 | 10 (overridden by calibration Q3) | 12 |
| New MSA, full negotiation | 14 | 20 (overridden by calibration Q2) | 26 |
| Master agreement amendment | 4 | 6 | 8 |

**Risk reviews (run in PARALLEL with negotiation; only the single longest TRIGGERED review enters the critical path):**

| Review | Low | Base | High |
|---|---|---|---|
| TPRM / WwTP (full) | 2 | 3 | 4 |
| SAE (cyber security) | 4 | 15 | 26 |
| Privacy review | 4 | 8 | 12 |
| AIR (AI review) | 4 | 8 | 12 |

When more than one review is triggered, take `max` across them (per review, on each of Low / Base / High independently). NEVER sum reviews (Hard Rule 3).

**Concurrent work that overlaps negotiation (combined with the SAME max rule, never summed):**

| Factor | Low | Base | High |
|---|---|---|---|
| New supplier SAP onboarding | 3 | 4 | 5 |
| Pilot / PoC (shallow eval) | 2 | 2.5 | 3 |
| Pilot / PoC (medium pilot) | 5 | 7.5 | 10 |
| Pilot / PoC (deep PoC, 3-6 months) | 14 | 20 | 26 |

**Redline turns (these DO extend the negotiation phase, because each turn is sequential round-trip work, not concurrent):**

| Factor | Low | Base | High |
|---|---|---|---|
| Per supplier redline turn (added to the negotiation duration) | 1.5 | 2.25 | 3 |

### Unmodeled-friction factor (small; covers ONLY what the phase durations do NOT already price in)

The phase durations above already encode complexity: a New MSA is already 20 weeks, a triggered SAE is already up to 26 weeks, each redline turn already adds time. The complexity tier therefore must NOT re-multiply those phases (doing so double-counts and inflated v1.0 estimates 3-6x). Instead the tier maps to a **small** factor that covers only friction the phase model does NOT capture: internal scheduling queues, approver availability, handoff latency between functions, and clustering of holidays/OOO. This factor multiplies the critical-path BASE once; it never touches the sequential ATC/ATS or execution phases.

To avoid a cliff at the tier boundaries (the old discrete 0.75 -> 1.0 -> 2.0 -> 4.0 jumps caused large estimate discontinuities), the factor is **interpolated continuously** from the same complexity score used in Step 2:

```
friction(score) = clamp( 1.00 + 0.025 * max(0, score) , 1.00 , 1.25 )
```

So each complexity point adds 2.5% friction, capped at +25%. Reference points (for sanity, not as discrete bands):

| Complexity score | Tier label (display only) | friction |
|---|---|---|
| 0-2 | Quick | 1.00 - 1.05 |
| 3-5 | Standard | 1.075 - 1.125 |
| 6-9 | Complex | 1.15 - 1.225 |
| 10+ | Major | 1.25 (capped) |

The tier label is shown to the user for readability, but the math uses the continuous `friction(score)` value, so two requests that differ by one point differ by ~2.5%, never by 2x.

### Sequential Lilly-system phases (added AFTER the friction factor, never scaled by friction or by K)

| Phase | Weeks | Notes |
|---|---|---|
| PR ATC/ATS approval in Ariba (under $15M) | 2 | Sequential, post-negotiation, pre-execution |
| PR ATC/ATS approval in Ariba ($15M and over) | 4 | Sequential, post-negotiation, pre-execution |
| Contract execution / signature | 1 | Sequential, post-ATC/ATS (target less) |

These are Lilly-system constants. They are added once, after friction, and are NOT multiplied by the friction factor or by the domain scale factor K.

## Workflow

### Step 1: Extract or confirm the inputs

If a document was uploaded (SOW, proposal, email), extract:
- Contract instrument intent (look for SOW vs MSA references, exhibits)
- Dollar value (for ATC/ATS routing)
- Supplier name (and infer new vs existing if you have any signal)
- Triggers for risk reviews (data handling = SAE; personal data = Privacy; AI/ML = AIR; third party = TPRM)
- Pilot / PoC language
- Confidentiality level (NDA terms, classification markings, or explicit Red/Orange labels; anything else is baseline)
- Cross-functional stakeholder count (named approvers, reviewers, or functions cc'd or referenced)
- Redline intensity signal (heavily marked-up draft, multiple prior rounds referenced, "extensive comments" language)

If verbal-only, ask once (batched picker) for the load-bearing few:

**IMPLEMENTATION REQUIREMENT.** Render via `ask_user_input_v0`:

```
ask_user_input_v0(questions=[
  {
    "question": "Contract instrument?",
    "type": "single_select",
    "default": "SOW under existing MSA (no MSA changes)",
    "options": [
      "PO with Lilly T&Cs",
      "Short form / evaluation agreement",
      "SOW under existing MSA (no MSA changes)",
      "SOW under existing MSA (MSA amendment needed)",
      "New MSA, full negotiation",
      "Master agreement amendment",
      "Not sure (I'll guess based on context)"
    ]
  },
  {
    "question": "Sourcing event?",
    "type": "single_select",
    "default": "None",
    "options": ["None", "RFI only", "RFQ", "RFP (4-6 suppliers)", "Multi-stage RFI then RFP"]
  },
  {
    "question": "Approximate deal size?",
    "type": "single_select",
    "default": "Under $15M",
    "options": ["Under $15M", "$15M and over", "Not sure"]
  }
])
```

Then proceed; everything else (risk reviews, supplier status, redline turns) defaults unless overridden.

### Step 2: Score complexity (drives the friction factor only, NOT the phase durations)

Score the request:
- New MSA -> +2
- New supplier -> +2
- Each risk review needed (TPRM, SAE, Privacy, AIR) -> +1
- RFP with 4+ suppliers -> +1
- 3+ cross-functional stakeholders -> +1
- Confidentiality: Red -> +2, Orange -> +1
- Heavy supplier redlines flagged -> +1
- Pilot / PoC requested -> +1

The score maps to the **continuous friction factor** `friction(score) = clamp(1.00 + 0.025 * max(0, score), 1.00, 1.25)` and to a display-only tier label (Quick 0-2, Standard 3-5, Complex 6-9, Major 10+). Because the factor is interpolated, there is no estimate cliff at the boundaries, so you do NOT need to ask the user to disambiguate a boundary score: a score of 5 (1.125) and a score of 6 (1.15) differ by ~2.5%, not by a tier jump. Only ask the user a clarifying question if a SCORING INPUT itself is genuinely unknown after extraction (per Step 1) and would move the score by 2+ points (for example, "is this a brand-new supplier?" or "is this Red confidentiality?"), and then only as a tappable yes/no per Operating Rule 2. This ad hoc clarifier is separate from, and not counted against, the three-question calibration cap (Hard Rule 8), which applies only to the first-run domain-scale prompt.

Important: these scoring inputs (New MSA, new supplier, reviews, RFP) ALSO select the phase-duration rows in Step 3. That is intentional and is the reason the friction factor is kept small: the duration of the work lives in the phases; the friction factor covers only the scheduling/queue overhead the phases do not model.

### Step 3: Build the critical-path base (do the whole calculation on Low, Base, AND High in parallel)

Do every step below three times: once on the **Low** column, once on **Base**, once on **High**. This is how the output range is produced (Step 5), so there is no separate flat percentage. First apply the domain scale factor `K` to every non-overridden row (per the Calibration section), then:

**3a. Sequential spine (these run one after another).**
- `sourcing` = selected sourcing row (0 if direct buy).
- `negotiation` = selected contract instrument row (use the calibration override for Q1/Q2/Q3 rows; those are NOT scaled by K). Then add redline turns to negotiation, because turns are sequential round-trips: `negotiation += (expected turns) * (per-turn row)`. If turn count is unknown, default to the instrument's typical (PO/short-form = 1, SOW = 2, Master agreement amendment = 2, New MSA = 3) and label it assumed.

**3b. Concurrent band (these overlap negotiation; combine with ONE rule = `max`, never sum).**
This is the single combine rule for everything that runs in parallel with negotiation. Compute:

```
concurrent_band = max(
    negotiation,                       # the negotiation itself sets the floor of the band
    longest_triggered_review,          # max across triggered reviews (TPRM/SAE/Privacy/AIR); 0 if none
    onboarding_if_new_supplier,        # 0 if existing supplier
    pilot_if_requested                 # 0 if no pilot
)
```

`longest_triggered_review` is `max` across the triggered reviews (not a sum). Onboarding and pilot do NOT add to negotiation and do NOT add to each other; they are concurrent, so they only matter if one of them is the longest thing happening, in which case `max` already captures it. This resolves the old "added vs max" contradiction: the rule is `max` for everything concurrent, full stop.

**3c. Critical-path base before friction.**

```
base_path = sourcing + concurrent_band
```

(Sourcing is sequential and precedes negotiation, so it is added; the concurrent band is the single longest parallel stream during negotiation.)

**3d. Apply the friction factor ONCE.**

```
core = base_path * friction(score)
```

`friction` is the continuous factor from Step 2 (1.00 to 1.25). It is applied once, to `base_path` only. It is NOT applied to the sequential Lilly-system phases in Step 4.

### Step 4: Add the sequential Lilly-system phases (after friction, unscaled)

```
total = core + atc_ats + execution
```

- `atc_ats` = 2 weeks (under $15M) or 4 weeks ($15M+). If deal size is unknown, default to 2 and label it assumed.
- `execution` = 1 week.

These are added once, after friction, and are NOT multiplied by friction or by K.

### Step 4b: Sanity-ceiling self-check (run before emitting anything)

Before showing the total, check the BASE result against a ceiling. A single procurement effort (one request, one supplier, one instrument) almost never legitimately exceeds **~78 weeks (18 months)** of elapsed critical-path time. If `total_base > 78`:
1. STOP and re-derive once. The usual causes are: a parallel band that was accidentally summed instead of `max`-ed; the friction factor applied more than once or applied to the sequential phases; or `K` applied to an already-overridden calibration row.
2. If the number survives an honest re-derivation (for example, a deep PoC plus a New MSA plus a full SAE genuinely stacked on the critical path), KEEP it but show an explicit caveat line: "Sanity check: this exceeds the ~78-week single-effort ceiling; that is driven by [the specific stacked factors]. Confirm these are truly on the critical path and not parallelizable." Never silently emit a >78-week base.
3. Also compare `total_high` (already returned alongside `total_base`) against the same ~78-week ceiling. If `total_high > 78` while `total_base` does not trip, show the same caveat line scoped to the High estimate only ("the High end of the range exceeds the ~78-week ceiling; driven by [factors]") rather than letting a high-end breach pass unflagged.

### Step 5: Express the range (propagate Low/Base/High; no flat percentage)

The output range is the Low and High columns carried through the exact same Steps 3-4 math, NOT a flat plus or minus on the Base:
- **Low estimate** = the `total` computed entirely on the Low column.
- **Headline / best estimate** = the `total` computed on the Base column.
- **High estimate** = the `total` computed entirely on the High column.

Round each to the nearest week. Because the per-phase Low/High already encode the real spread (a SAE is 4-26, a New MSA is 14-26), this produces an honest, phase-driven range instead of an arbitrary +/-20% that discards the table columns.

- **Confidence label** = based on how many load-bearing factors were CONFIRMED vs assumed: High if >=80% confirmed; Medium if >=50% and <80%; Low if <50%. State the count ("4 of 6 factors confirmed").

### Step 6: Render the output (deterministic skeleton)

Per Operating Rule 8, the output ALWAYS has this structure:

```
ESTIMATED TIMELINE: [low]-[high] weeks (best estimate ~[base] weeks)
Complexity: [Tier label] (score [N], friction x[F])  |  Domain scale K = [K]

Phase breakdown (Low / Base / High weeks):
- Sourcing ([type]): [L] / [B] / [H]                          (sequential)
- Negotiation ([instrument], incl. [n] redline turns): [L] / [B] / [H]   (sequential)
- Concurrent band during negotiation (max of negotiation, longest review [name], onboarding, pilot): [L] / [B] / [H]
- Critical-path base (sourcing + concurrent band): [L] / [B] / [H]
- After friction (x[F]): [L] / [B] / [H]
- PR ATC/ATS approval (Ariba, [under/over $15M]): +[2 or 4] (unscaled)
- Execution / signature: +1 (unscaled)

Total: [low_total] / [base_total] / [high_total] weeks
Confidence: [High / Medium / Low] ([k] of [n] load-bearing factors confirmed)
Reconciliation: parallel band used max not sum; friction applied once; range from per-phase Low/High; sanity ceiling [OK | flagged].

Driven by:
- [Factor 1]
- [Factor 2]
- [Factor 3]

What would tighten this:
- [Missing input 1]
- [Missing input 2]

Notes:
- Domain scale K = [K] (derived from your calibration). For requests far outside your calibrated domain, treat as directional.
- Ranges assume no major escalation. Holidays / OOO in window reduce working days.
- [If tripped: Sanity check caveat line from Step 4b.]
```

### Worked end-to-end example (illustrative; not real Lilly data)

Request: a NEW supplier, NEW MSA (full negotiation), full RFP (5 suppliers), SAE and Privacy reviews both triggered, no pilot, deal at $18M, 3 expected redline turns. User has NOT calibrated, so `K = 1.0`.

1. **Complexity score:** New MSA +2, new supplier +2, SAE +1, Privacy +1, RFP 4+ suppliers +1 = **7** -> tier label "Complex", `friction(7) = 1.00 + 0.025*7 = 1.175`.
2. **Phase rows (Base):** sourcing RFP = 11; negotiation New MSA = 20; redline turns = 3 * 2.25 = 6.75 -> negotiation = 20 + 6.75 = **26.75**; SAE Base = 15, Privacy Base = 8 -> `longest_triggered_review = max(15, 8) = 15`; onboarding (new supplier) = 4; pilot = 0.
3. **Concurrent band (Base):** `max(negotiation 26.75, review 15, onboarding 4, pilot 0) = 26.75`.
4. **Critical-path base (Base):** `sourcing 11 + concurrent 26.75 = 37.75`.
5. **After friction (Base):** `37.75 * 1.175 = 44.4`.
6. **Sequential ($18M -> $15M+):** `+ atc_ats 4 + execution 1`. `total_base = 44.4 + 5 = 49.4 -> ~49 weeks`.
7. **Range (repeat on Low / High columns):**
   - Low: sourcing 8; negotiation 14 + 3*1.5=4.5 = 18.5; review max(SAE 4, Privacy 4)=4; onboarding 3 -> band max(18.5,4,3)=18.5; base 8+18.5=26.5; friction *1.175 = 31.1; +5 = **~36 weeks**.
   - High: sourcing 14; negotiation 26 + 3*3=9 = 35; review max(SAE 26, Privacy 12)=26; onboarding 5 -> band max(35,26,5)=35; base 14+35=49; friction *1.175 = 57.6; +5 = **~63 weeks**.
8. **Sanity ceiling:** base 49 and high 63 are both under ~78 -> OK, no caveat.

Result line: `ESTIMATED TIMELINE: 36-63 weeks (best estimate ~49 weeks)`.

Compare to the OLD v1.0 math, which summed the same factors then multiplied by the discrete x2.0 "Complex" tier: `(11 + 26.75 + 15) * 2.0 + 5 = 110.5 weeks`, then +/-20% = 88-133 weeks. The v1.0 number was ~2.2x larger and breached the sanity ceiling, because the x2.0 tier re-multiplied phases that already encoded the complexity. The corrected model keeps the same drivers but does not double-count them.

## Deliverables

- The estimate output above (chat-side by default; in-document when Claude-in-Outlook or similar surface is active). This text skeleton is ALWAYS the default and complete deliverable; the dashboard below is presentational only and never the source of truth for the numbers.
- Optional: an interactive dashboard (Magazine house style, LOCKED 3-tab structure: Overview, Portfolio, Deal & Renew). See "## INLINED: references/dashboard-canonical.md" for the full spec and "## INLINED: examples/timeline_builder_canonical_dashboard.jsx" for the canonical reference implementation, both inlined at the end of this document. Render on request ("show me the timeline dashboard", "Gantt view", "show my workload", "renewal runway"). The dashboard's two anchor visuals are:
  - **Live Steps: Time vs. Deadline** (Overview tab) - a date-driven SLA lane view. Every phase row from the Defaults tables (sourcing, negotiation, each of the four named risk reviews individually, onboarding, pilot, the scheduling-friction buffer, ATC/ATS, execution) gets its own lane, anchored to real calendar dates from today, with a target-deadline reference line and an SLA status read (Comfortable / At risk / Breach risk).
  - **Portfolio Timeline (My Workload)** (Portfolio tab) - a multi-project, gate-by-date Gantt: one lane per project with its stage-gate dates plotted on a real week axis, a cross-project bottleneck read, and a sortable project table.
  - The **Deal & Renew** tab runs the same critical-path machinery backward from a contract's notice-by date to answer "when must we start renewing/renegotiating/recompeting."
  - All modeling controls (contract instrument, sourcing event, risk reviews, redline turns, domain scale K, deal size, target deadline, portfolio horizon, renewal action) recompute the dashboard live, client-side, via a JS port of `timeline_engine.py`'s Low/Base/High math (verified against the engine's own golden worked example: New MSA + RFP + SAE/Privacy + new supplier + $18M + 3 redline turns = 36-63 weeks, best estimate ~49 weeks, score 7, friction x1.175). The delivered TEXT estimate is still always produced by calling `timeline_engine.py` directly per Rule 10; this client-side port is presentation-layer only and never the source of truth.
  - **Graceful degradation:** this optional view renders via `visualize:show_widget`. If that primitive is unavailable, do NOT fail or block: deliver the full estimate as the text skeleton above and tell the user the interactive dashboard was skipped because the visualizer was unavailable. If the Portfolio tab's project/gate dates or the Deal & Renew tab's contract dates are not reachable this run (no M365 connector, no uploaded plan or contract), render `StateBanner({kind:"NEEDS_INPUT", ...})` in that card in place of the illustrative content, per the shared component library, rather than fabricating dates.

## Cross-Skill Handoffs

- **theos-field-guide** calls this skill in its status-request compose flow.
- **process-navigator** answers prerequisite questions ("does this need TPRM?", "what's the contract instrument typically?") that feed this skill's factor extraction.
- **voice-profile** drafts any status email built from this estimate.
- **workflow-map** renders the phase diagram for the same request this skill produces a duration estimate for (per the BOUNDARY note above: this skill estimates duration only, workflow-map draws the diagram).

## Hard Rules (skill-specific; the shared guardrails also apply)

**Rule 1: The phase durations ARE the estimate; the friction factor does NOT re-multiply them.** Complexity is already priced into the phase rows (a New MSA is 20 weeks, a triggered SAE is up to 26). The friction factor (1.00 to 1.25) covers ONLY unmodeled scheduling/queue overhead and is applied ONCE to the critical-path base. Never apply a 2x or 4x tier multiplier to the phases (that was the v1.0 double-count bug).

**Rule 2: PR ATC/ATS and Execution are NEVER scaled.** They are sequential Lilly-system constants added after the friction factor; they are not multiplied by friction or by the domain scale factor K.

**Rule 3: Everything concurrent combines with `max`, never `sum`.** Risk reviews, new-supplier onboarding, and a pilot all run in parallel with negotiation. The concurrent band is `max(negotiation, longest triggered review, onboarding, pilot)`. Take the single longest triggered review (max across them), not their sum. Onboarding and pilot do not add to negotiation. This is the ONE combine rule; there is no "added vs max" choice.

**Rule 4: Carry Low/Base/High through the whole calculation.** The output range is the Low and High columns run through the same Steps 3-4 math, not a flat plus or minus on the Base. Do not invent a +/-20% band; do not discard the table columns.

**Rule 5: Never produce a single hard date.** Ranges only. The output frames remaining time, not a deadline.

**Rule 6: Domain scale honesty.** State the domain scale factor K and that it was derived from the user's three calibration answers. If K = 1.0 (no calibration), say the estimate is on un-calibrated IT/R&D defaults. For requests far outside the calibrated domain, label as directional.

**Rule 7: No fabricated factors.** If a factor's value is not given or extractable, use the default and label it as assumed. Never hardcode a confident factor value the input did not support.

**Rule 8: Three-question calibration is the cap.** Do not expand the first-run calibration prompt beyond the three baseline questions; the derived K reaches the rest of the model. The user can request finer recalibration explicitly later.

**Rule 9: Run the sanity-ceiling self-check (Step 4b) before emitting any total.** Flag any single-effort base over ~78 weeks, re-derive, and either correct the error or show the explicit caveat.

**Rule 10: The critical-path computation is performed by `timeline_engine.py`, never by model arithmetic.** The critical-path computation (phase scoring, friction factor, parallel-max combination, Low/Base/High range) is performed by the vendored `timeline_engine.py` in this skill's own directory, never by model arithmetic. Build the typed `Facts` input from the calibration answers and the request's complexity signals, call `compute_timeline()`, and report exactly the range and reasoning it returns. Do not compute the estimate in prose.

## Next Steps (closing template)

End every run with:
- Headline range
- The single biggest unknown that, if confirmed, would tighten the range most
- A pointer to running this through the status-update flow in theos-field-guide if the user wants to draft a "where are we" reply

---

# INLINED REFERENCE FILES

Both files below were previously described only in prose (the "Deliverables" section's single-line "optional Gantt-style dashboard"). They are now inlined here per the suite's single-file-install convention. When this skill or another skill says "read references/dashboard-canonical.md" or "read examples/timeline_builder_canonical_dashboard.jsx" for timeline-builder, the content is already present below; do not attempt to read either from disk.

---

## INLINED: references/dashboard-canonical.md

# Timeline Builder - Canonical Dashboard Structure

This is the LOCKED structure for timeline-builder's optional interactive dashboard (Operating Rule 8). The dashboard is presentational only: the text estimate skeleton in SKILL.md Step 6, produced by calling `timeline_engine.py` (Rule 10), is always the source of truth. Render the dashboard only on request ("show me the timeline dashboard", "Gantt view", "show my workload", "renewal runway", or equivalent), via `visualize:show_widget`. Same tabs, same components, same layout, same depth on every run; only the data (the request being modeled, the portfolio's projects, the renewal facts) changes.

## Tabs (3, always render, never reorder or drop)

1. **Overview** - the single-request view. KPI strip, scenario controls, the Live Steps SLA-vs-deadline Gantt (anchor visual), a Two-Week Calendar, and a generic task-level critical path.
2. **Portfolio** - the multi-request "My Workload" view. The gate-by-date Portfolio Gantt (anchor visual) plus a cross-project bottleneck read and a sortable project table.
3. **Deal & Renew** - the backward-planning view for an existing engagement's renewal, renegotiation, or recompete, expressed as a runway against the contract's notice-by date.

## Component reuse (verbatim from lilly-brand-assets-1c344a/references/dashboard-components.md)

`Metric`, `Card`, `Pillar`, `StateBanner`, `STable`, color tokens (`R, DK, BRN, CARD, WARM, RISK, OK, BD, MUT, BLU, AMB`), and the header/tab-nav/footer Layout Shell are reused exactly as specified in the shared library. Do not hand-roll an off-palette or off-component element. This dashboard adds a small set of dashboard-specific presentational components on top of that library (`GanttLane`, `LiveStepsGantt`, `ScenarioControls`, `TwoWeekCalendar`, `RemainingCriticalPath`, `PortfolioGantt`, `TimingRunway`, `StatusPill`) - these follow the same styling conventions (Georgia-serif Card titles, Arial body, the same border-radius/spacing scale) so they read as native additions, not bolted-on widgets.

## Color rule specific to this dashboard: pacing/critical-path emphasis is never red

Per the canonical status palette, Lilly Red (`R`) is reserved strictly for an actual SLA-breach or overdue signal (the deadline reference line, the "Breach risk" status pill, a portfolio project whose slack has gone negative). Being the pacing lane in the concurrent band, or being on a generic task's critical path, is a STRUCTURAL fact, not a risk verdict, so those are marked with Bold Brown (`BRN`, the suite's accent/highlight token) instead. This keeps red meaning exactly one thing everywhere on the dashboard. Positive/on-track states use Bold Blue (`BLU`) and Neutral Sky (`OK`); caution states use Amber (`AMB`) and Neutral Cream (`WARM`); never a green.

## Panel-by-panel spec

### Overview tab

- **KPI strip (5 tiles, `Metric`):** Estimated range (Low-High, `accent`), Complexity (tier + score + friction factor), Domain scale (K), Target deadline (weeks out + date), Sanity ceiling (OK/Flagged vs the ~78-week ceiling, `good`/`warn`).
- **Model It: Scenario Controls (`Card`, full width):** contract instrument, sourcing event, pilot/PoC, deal size (selects); redline turns, domain scale K, target deadline (sliders); risk reviews triggered, new supplier, 3+ cross-functional stakeholders (checkboxes). Every control writes to the shared `facts` state and recomputes `computeTimeline(facts)` on every keystroke - pure client-side JS, no server round-trip.
- **Live Steps: Time vs. Deadline (`Card`, left ~65%) + Critical-Path Read (`Card`, right ~35%).** ANCHOR VISUAL. One `GanttLane` per phase row from the Defaults tables: Sourcing; Negotiation (+ redline turns); each of the four named risk reviews individually (TPRM/WwTP, SAE/Cyber/ServiceNow, Privacy/LEAH, AIR), greyed "not triggered" when inapplicable; New-supplier onboarding (SAP), greyed "existing supplier" when inapplicable; Pilot/PoC, greyed "none requested" when inapplicable; a Scheduling-friction buffer bar (the one place the friction factor is drawn, as its own segment, never baked into another phase's bar, so the "friction applied once" rule is visible, not just asserted); PR ATC/ATS approval; Execution/signature. A target-deadline reference line plus an `SLA status` `StatusPill` (Comfortable / At risk / Breach risk) closes the panel. The paired narrative card names the pacing driver, restates the reconciliation line (parallel band max not sum; friction applied once; range from per-phase Low/High; sanity ceiling read), and names what would tighten the estimate.
- **Two-Week Calendar (`Card`, left) + What's Active This Window (`Card`, right).** A 7x2 day grid; cells are Done / Active / Upcoming / a named needs-you event (tied to a real model output - e.g. a redline turn or review-questionnaire follow-up actually due that day - never a mechanical day-of-week rule). Today is ringed.
- **Remaining Critical Path (`Card`, left ~57%) + Bottleneck Task Read (`Card`, right ~43%).** A GENERIC longest-path calculation over an illustrative internal task-dependency graph (independent of the procurement-phase taxonomy above - for when a user has their own workstream plan), rendered as connected node chips plus an `STable` (Task, Duration, Earliest finish, Slack, On critical path). A contingency-buffer slider adds days to every task and recomputes live. The paired narrative names the critical-path chain and the effect of any buffer applied.

### Portfolio tab

- **Portfolio Controls (`Card`):** a horizon slider (8-52 weeks) and a "highlight bottleneck project" toggle.
- **Portfolio Timeline (My Workload) (`Card`, left ~65%) + Cross-Project Bottleneck Read (`Card`, right ~35%).** ANCHOR VISUAL. One lane per project, each with its own stage-gate dots (Intake/Triage/Legal/Cyber(SAE)/TPRM/ATC/Contract/PO or the subset that applies) plotted on a real calendar-week axis, plus each project's own target-deadline reference line. The project with the least slack against its own deadline is highlighted; the highlight color follows the SIGN of slack (Lilly Red only if slack is actually negative/overdue; Amber if merely the tightest but still non-negative) so red is never used for a project that is simply the relative bottleneck of a healthy portfolio. The narrative names the bottleneck project and any shared-queue concentration risk (e.g., how many projects share the same named review).
- **Portfolio Detail (`Card`, full width):** an `STable` (Project, Last cleared gate, Target deadline, Slack, Status) sorted by slack ascending, so the same bottleneck read is available as a searchable/sortable table, not only as a chart.

### Deal & Renew tab

- **Runway Controls (`Card`):** weeks-until-contract-expiry and contractual-notice-period sliders, plus a recommended-action select (Renew as-is / Renegotiate via SOW amendment / Recompete via full RFP + New MSA). Selecting an action swaps the underlying `sourcing`/`instrument`/`newSupplier` facts fed to `computeTimeline` (renew = SOW, no sourcing; renegotiate = SOW + MSA amendment; recompete = RFP + New MSA), so the same critical-path engine runs backward for whichever action is selected.
- **Timing & Runway (`Card`, left ~57%) + Recommendation & Rationale (`Card`, right ~43%).** A single unambiguous bar: the filled segment is the status-colored time the critical path NEEDS; anything past that up to contract expiry is a light "spare buffer" segment; anything the need overruns past expiry is a red overrun segment. Two reference lines mark the notice-by date (Amber) and the contract expiry date (Red). A `Runway status` `StatusPill` (Comfortable / At risk / Breach risk) and a narrative recommendation close the panel.

## Graceful degradation

If the M365 connector or an uploaded plan/contract cannot supply real project-gate dates (Portfolio tab) or real contract dates (Deal & Renew tab) for a given run, render `StateBanner({kind:"NEEDS_INPUT", msg:"..."})` in that card in place of the illustrative content, per the shared component library, rather than fabricating dates. The Overview tab's scenario is always renderable from the request's own extracted or assumed facts (Operating Rule 1), so it never needs this banner.

## Illustrative dataset invariants (a cloner MUST preserve these)

1. The default `facts` reproduce SKILL.md's own worked example verbatim: RFP sourcing, New MSA instrument, new supplier, SAE + Privacy triggered, no pilot, $18M deal, 3 redline turns, K = 1.0 -> score 7, friction x1.175, total 36/49/63 weeks. This is a live regression check: if a future edit to the JS engine port changes this default output, the port has drifted from `timeline_engine.py` and must be fixed before shipping.
2. The client-side engine (`computeTimeline` and its helpers) is a line-for-line port of `timeline_engine.py`'s Steps 2-5: `lMax` (never sum) for the concurrent band; friction applied once to `criticalPathBase` only; ATC/ATS and execution added unscaled after friction; Low/Base/High carried through every step. Do not let the dashboard's port drift from the vendored engine's math.

---

## INLINED: examples/timeline_builder_canonical_dashboard.jsx

```jsx
import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Timeline Builder - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure. See references/dashboard-canonical.md.
// 3 tabs (Overview, Portfolio, Deal & Renew), identical every run. Only the
// data (the request being modeled, the portfolio's projects, the renewal
// facts) changes per run. This dashboard is OPTIONAL and on-demand per the
// skill's Deliverables section (visualize:show_widget); the text estimate
// skeleton in SKILL.md Step 6 is always the source of truth and always the
// default deliverable. Data below is NEUTRAL and ILLUSTRATIVE. Clone the
// structure, swap the data.
// House style: SUITE STANDARD (Arial body, Georgia titles, dark #212121
// header with red rule, Lilly-approved palette). Same family as every other
// dashboard. See lilly-brand-assets-1c344a/references/dashboard-components.md.
// The Low/Base/High critical-path math below is a client-side JS port of
// timeline_engine.py (Rule 10: the vendored engine, never model arithmetic,
// is authoritative for the delivered text estimate; this port exists so the
// optional dashboard's sliders/toggles recompute live in the browser without
// a server round-trip, and is verified against the engine's own golden
// worked example - see "SELF-CHECK" below).
// ---------------------------------------------------------------------------

// Color tokens: every token has a DISTINCT hex (no duplicates). Lilly's brand palette
// has NO pure green; positive/good roles use Bold Blue (#0F3A85), positive/success
// backgrounds use Neutral Sky (#D4E5F7). There is no "GRN" token: anything positive
// uses BLU. See lilly-brand-assets-1c344a/references/brand-colors.md (no-green rule).
const R="#E1251B",DK="#212121",BRN="#521207",CARD="#E4EBF1",WARM="#FFF0D8",RISK="#FDE8E5",OK="#D4E5F7",BD="#E4EBF1",MUT="#8A969E",BLU="#0F3A85",AMB="#B45309";
// Chart palette: 6 distinct, non-green hexes, matching brand-colors.md exactly.
const PAL=[R,BLU,BRN,"#F58E7D","#FFC709","#99BFE5"];
const TABS=["Overview","Portfolio","Deal & Renew"];
const NEEDS_INPUT={};

// ---------------------------------------------------------------------------
// timeline_engine.py PORT (Low/Base/High vector math, ported verbatim from
// the vendored Python kernel so the dashboard's interactive controls recompute
// live client-side per the platform's interaction-model rule). Any skill run
// producing the TEXT estimate must still call timeline_engine.py directly
// (Rule 10); this port is presentation-layer only.
// ---------------------------------------------------------------------------
const SOURCING_TABLE={none:[0,0,0],rfi:[3,4,5],rfq:[4,5,6],rfp:[8,11,14],multi:[10,14,18]};
const NEGOTIATION_TABLE={po:[2,3,4],shortform:[4,6,8],sow:[4,6,8],sow_amend:[8,10,12],new_msa:[14,20,26],amendment:[4,6,8]};
const DEFAULT_TURNS={po:1,shortform:1,sow:2,sow_amend:2,new_msa:3,amendment:2};
const PER_TURN=[1.5,2.25,3.0];
const REVIEW_TABLE={tprm:[2,3,4],sae:[4,15,26],privacy:[4,8,12],air:[4,8,12]};
const REVIEW_LABEL={tprm:"TPRM / WwTP",sae:"SAE (Cyber / ServiceNow)",privacy:"Privacy (LEAH)",air:"AIR (AI Review)"};
const ONBOARDING=[3,4,5];
const PILOT_TABLE={none:[0,0,0],shallow:[2,2.5,3],medium:[5,7.5,10],deep:[14,20,26]};

function lbh(l,b,h){return {low:l,base:b,high:h};}
function lAdd(a,b){return typeof b==="number"?lbh(a.low+b,a.base+b,a.high+b):lbh(a.low+b.low,a.base+b.base,a.high+b.high);}
function lScale(a,f){return lbh(a.low*f,a.base*f,a.high*f);}
function lMax(){var items=Array.prototype.slice.call(arguments);return lbh(Math.max.apply(null,items.map(function(i){return i.low;})),Math.max.apply(null,items.map(function(i){return i.base;})),Math.max.apply(null,items.map(function(i){return i.high;})));}
function lRound(a){return lbh(Math.round(a.low),Math.round(a.base),Math.round(a.high));}

// Step 2: complexity score -> continuous friction factor (SKILL.md lines 340-352, 262-281).
function complexityScore(f){
  var s=0;
  if(f.instrument==="new_msa")s+=2;
  if(f.newSupplier)s+=2;
  s+=f.reviews.length;
  if(f.rfp4plus)s+=1;
  if(f.crossFunctional3plus)s+=1;
  if(f.confidentiality==="red")s+=2; else if(f.confidentiality==="orange")s+=1;
  if(f.heavyRedlines)s+=1;
  if(f.pilot!=="none")s+=1;
  return s;
}
function friction(score){return Math.min(Math.max(1.00+0.025*Math.max(0,score),1.00),1.25);}
function tierLabel(score){return score<=2?"Quick":score<=5?"Standard":score<=9?"Complex":"Major";}

// Steps 3-5: critical-path base, friction once, sequential Lilly-system tail,
// Low/Base/High carried through the whole calculation (Rules 1-4).
function computeTimeline(f){
  var score=complexityScore(f);
  var fr=friction(score);
  var tier=tierLabel(score);
  var src=lScale(lbh.apply(null,SOURCING_TABLE[f.sourcing]),f.K);
  var neg=lbh.apply(null,NEGOTIATION_TABLE[f.instrument]);
  var negOverridden=false;
  if(f.calibrationOverrides && f.calibrationOverrides[f.instrument]!=null){neg=lbh(neg.low,f.calibrationOverrides[f.instrument],neg.high);negOverridden=true;}
  else{neg=lScale(neg,f.K);}
  var turnsUsed=f.redlineTurns!=null?f.redlineTurns:DEFAULT_TURNS[f.instrument];
  var perTurn=lScale(lbh.apply(null,PER_TURN),f.K);
  var turnAdd=lScale(perTurn,turnsUsed);
  var negotiation=lAdd(neg,turnAdd);
  var reviewRows=f.reviews.map(function(r){return lScale(lbh.apply(null,REVIEW_TABLE[r]),f.K);});
  var review=reviewRows.length?lMax.apply(null,reviewRows):lbh(0,0,0);
  var onboarding=f.newSupplier?lScale(lbh.apply(null,ONBOARDING),f.K):lbh(0,0,0);
  var pilot=lScale(lbh.apply(null,PILOT_TABLE[f.pilot]),f.K);
  var band=lMax(negotiation,review,onboarding,pilot); // Rule 3: max, never sum
  var criticalPathBase=lAdd(src,band);
  var core=lScale(criticalPathBase,fr); // Rule 1: friction applied once, to the base only
  var atcAts=f.dealSizeUsd==null?2:(f.dealSizeUsd>=15000000?4:2); // Rule 2: unscaled
  var execution=1; // Rule 2: unscaled
  var total=lAdd(core,atcAts+execution);
  return {score:score,fr:fr,tier:tier,K:f.K,src:src,negotiation:negotiation,review:review,onboarding:onboarding,pilot:pilot,band:band,criticalPathBase:criticalPathBase,core:core,atcAts:atcAts,execution:execution,total:total,totalRounded:lRound(total),turnsUsed:turnsUsed,negOverridden:negOverridden};
}

// SELF-CHECK (dev-time only, not rendered): the default facts below reproduce
// SKILL.md's own worked example verbatim - score 7, friction x1.175, total
// 36/49/63 weeks - proving this port matches timeline_engine.py's golden test.
// New supplier, New MSA (full negotiation), RFP (5 suppliers), SAE + Privacy
// triggered, no pilot, $18M deal, 3 redline turns, K = 1.0 (un-calibrated).
var DEFAULT_FACTS={sourcing:"rfp",instrument:"new_msa",newSupplier:true,reviews:["sae","privacy"],rfp4plus:true,crossFunctional3plus:false,confidentiality:null,heavyRedlines:false,pilot:"none",redlineTurns:3,K:1.0,dealSizeUsd:18000000,calibrationOverrides:{}};

// Illustrative "as of" anchor date; a live run anchors to the actual current date.
var TODAY=new Date(2026,6,21);
function addWeeks(d,w){var r=new Date(d);r.setDate(r.getDate()+Math.round(w*7));return r;}
function fmtDate(d){return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function fW(v){return v.toFixed(0)+"wk";}

// --- Illustrative task-dependency graph for "Remaining Critical Path" (id 77):
// a GENERIC longest-path calculation, independent of the procurement-phase
// taxonomy above - for when a user has their own internal workstream plan. ---
var TASKS=[
  {id:"draft_sow",name:"Draft SOW",dur:5,deps:[]},
  {id:"internal_review",name:"Internal Stakeholder Review",dur:4,deps:["draft_sow"]},
  {id:"legal_redline",name:"Legal Redline (Supplier)",dur:8,deps:["internal_review"]},
  {id:"sae_review",name:"SAE Security Review",dur:15,deps:["internal_review"]},
  {id:"signature",name:"Signature Routing",dur:2,deps:["legal_redline","sae_review"]},
  {id:"atc_ats",name:"ATC/ATS Approval",dur:4,deps:["signature"]},
  {id:"po_cut",name:"PO Cut & Kickoff",dur:1,deps:["atc_ats"]}
];
function computeCriticalPathTasks(contingencyDays){
  var byId={};TASKS.forEach(function(t){byId[t.id]=Object.assign({},t,{dur:t.dur+contingencyDays/7});});
  var order=[],visited={};
  function visit(id){if(visited[id])return;visited[id]=true;byId[id].deps.forEach(visit);order.push(id);}
  TASKS.forEach(function(t){visit(t.id);});
  order.forEach(function(id){var t=byId[id];t.es=t.deps.length?Math.max.apply(null,t.deps.map(function(d){return byId[d].ef;})):0;t.ef=t.es+t.dur;});
  var projectEnd=Math.max.apply(null,order.map(function(id){return byId[id].ef;}));
  order.slice().reverse().forEach(function(id){var t=byId[id];var dependents=order.filter(function(o){return byId[o].deps.indexOf(id)>=0;});t.lf=dependents.length?Math.min.apply(null,dependents.map(function(o){return byId[o].ls;})):projectEnd;t.ls=t.lf-t.dur;t.slack=t.ls-t.es;});
  return {order:order.map(function(id){return byId[id];}),projectEnd:projectEnd};
}

// --- Illustrative portfolio for "Portfolio Timeline (My Workload)" (id 78) ---
var PROJECTS=[
  {name:"CRM Platform Renewal",gates:[["Intake",0],["Triage",1],["Legal",9],["Cyber (SAE)",24],["TPRM",9],["ATC",26],["Contract",29],["PO",30]],deadline:32},
  {name:"Cloud Hosting - New MSA",gates:[["Intake",0],["Triage",1],["Legal",6],["Cyber (SAE)",5],["TPRM",5],["ATC",22],["Contract",24],["PO",25]],deadline:22},
  {name:"Data Analytics Tool - SOW",gates:[["Intake",0],["Triage",1],["Legal",3],["Cyber (SAE)",null],["TPRM",4],["ATC",7],["Contract",8],["PO",9]],deadline:14},
  {name:"Marketing Automation - RFP",gates:[["Intake",0],["Triage",2],["Legal",13],["Cyber (SAE)",16],["TPRM",8],["ATC",17],["Contract",18],["PO",19]],deadline:20},
  {name:"Facilities Services - Amendment",gates:[["Intake",0],["Triage",1],["Legal",5],["Cyber (SAE)",null],["TPRM",null],["ATC",6],["Contract",7],["PO",8]],deadline:10}
];

// --- Illustrative "what's due" events on the Two-Week Calendar, tied to real
// model outputs (not a mechanical day-of-week rule) ---
function calendarEvent(dayOffset,res){
  if(dayOffset===0)return {status:"needs-you",label:"Redline turn due"};
  if(dayOffset===7)return {status:"needs-you",label:"SAE questionnaire follow-up"};
  return null;
}

// ---------------------------------------------------------------------------
// SHARED COMPONENT LIBRARY (verbatim from lilly-brand-assets-1c344a
// references/dashboard-components.md). Restyle only via the color tokens
// above; do not redesign per run.
// ---------------------------------------------------------------------------
function Metric({label,value,sub,accent,warn,good}){var bar=accent?R:warn?R:good?BLU:BD;return <div style={{background:accent?WARM:warn?RISK:good?OK:"#fff",borderRadius:8,padding:"14px 16px",borderLeft:"4px solid "+bar,minWidth:0}}><div style={{fontSize:10,fontWeight:700,color:accent?R:MUT,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div><div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:warn?R:good?BLU:DK,marginTop:4}}>{value}</div>{sub&&<div style={{fontSize:11,color:MUT,marginTop:2}}>{sub}</div>}</div>;}
function Card({title,note,children}){return <div style={{background:"#fff",borderRadius:8,padding:18,border:"1px solid "+BD,marginBottom:14}}>{title&&<div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:DK,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:14,background:R,borderRadius:2}}/>{title}{note&&<span style={{fontFamily:"Arial",fontSize:10,fontWeight:600,color:MUT,marginLeft:"auto"}}>{note}</span>}</div>}{children}</div>;}
function Pillar({c,k,t,d}){return <div style={{background:"#fff",borderRadius:8,padding:16,border:"1px solid "+BD,borderTop:"3px solid "+c,flex:1,minWidth:0}}><div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:c}}>{k}</div><div style={{fontSize:12,fontWeight:700,color:DK,marginTop:4}}>{t}</div><div style={{fontSize:11,color:MUT,marginTop:4,lineHeight:1.5}}>{d}</div></div>;}
function StateBanner({kind,msg}){var map={NEEDS_INPUT:[AMB,WARM,"Needs input"],NOT_APPLICABLE:[MUT,CARD,"Not applicable"],RESEARCH_PENDING:[MUT,CARD,"Research pending"]};var c=map[kind]||map.NOT_APPLICABLE;return <div style={{background:c[1],border:"1px solid "+c[0]+"55",borderLeft:"4px solid "+c[0],borderRadius:8,padding:"12px 16px",marginBottom:14}}><span style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",color:c[0],textTransform:"uppercase"}}>{c[2]}</span><div style={{fontSize:12,color:DK,marginTop:4,lineHeight:1.5}}>{msg}</div></div>;}
function sortKey(cell){if(cell==null)return"";if(cell.v!=null)return cell.v;var d=cell.d;return (typeof d==="string"||typeof d==="number")?d:"";}
function cmp(a,b){var an=typeof a==="number",bn=typeof b==="number";if(an&&bn)return a-b;if(an)return -1;if(bn)return 1;return String(a).toLowerCase()<String(b).toLowerCase()?-1:String(a).toLowerCase()>String(b).toLowerCase()?1:0;}
function STable({columns,rows}){
  var _s=useState({col:0,dir:"asc"});var sort=_s[0];var setSort=_s[1];
  var _q=useState("");var q=_q[0];var setQ=_q[1];
  var filtered=useMemo(function(){var r=rows;if(q){var lq=q.toLowerCase();r=rows.filter(function(row){return row.some(function(c){return String(c&&c.d!=null?(typeof c.d==="string"||typeof c.d==="number"?c.d:""):"").toLowerCase().indexOf(lq)>=0;});});}return r.slice().sort(function(a,b){var d=cmp(sortKey(a[sort.col]),sortKey(b[sort.col]));return sort.dir==="asc"?d:-d;});},[rows,sort,q]);
  return <div><div style={{marginBottom:8}}><input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Search..." style={{padding:"6px 12px",borderRadius:6,border:"1px solid "+BD,fontSize:12,width:220}}/><span style={{fontSize:11,color:MUT,marginLeft:8}}>{filtered.length} of {rows.length}</span></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{columns.map(function(h,i){var active=sort.col===i;return <th key={i} onClick={function(){setSort({col:i,dir:active&&sort.dir==="desc"?"asc":"desc"});}} style={{padding:"7px 8px",fontWeight:600,color:active?R:MUT,fontSize:11,borderBottom:"2px solid "+BD,cursor:"pointer",textAlign:h.a||"left",whiteSpace:"nowrap"}}>{h.l}{active?(sort.dir==="asc"?" ^":" v"):""}</th>;})}</tr></thead><tbody>{filtered.map(function(row,ri){return <tr key={ri} style={{background:ri%2===0?"#fff":CARD}}>{row.map(function(cell,ci){return <td key={ci} style={{padding:"6px 8px",fontSize:12,borderBottom:"1px solid "+BD,textAlign:columns[ci].a||"left",fontWeight:cell.b?700:400,color:cell.c||DK}}>{cell.d}</td>;})}</tr>;})}</tbody></table></div></div>;
}
function statusColor(status){return status==="Comfortable"?[BLU,OK]:status==="At risk"?[AMB,WARM]:[R,RISK];}
function StatusPill({text,status}){var c=statusColor(status);return <span style={{display:"inline-block",padding:"2px 9px",borderRadius:10,fontSize:10,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",color:c[0],background:c[1],border:"1px solid "+c[0]+"40"}}>{text}</span>;}

// ---------------------------------------------------------------------------
// DASHBOARD-SPECIFIC PRESENTATIONAL COMPONENTS
// ---------------------------------------------------------------------------

// One lane of the Live Steps Gantt. `pacing` marks the lane that is currently
// the driver of the concurrent band - a STRUCTURAL fact, not a risk verdict,
// so it is rendered in BRN (accent/highlight), never R. R is reserved
// strictly for the SLA-breach signal (the deadline marker + status pill), so
// red keeps one meaning across the whole dashboard.
function GanttLane({label,startW,endW,maxW,pacing,muted,tag}){
  var color=muted?BD:(pacing?BRN:BLU);
  return <div style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0"}}>
    <div style={{width:168,flex:"0 0 168px",fontSize:11,color:muted?MUT:DK,fontWeight:muted?400:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</div>
    <div style={{position:"relative",flex:1,height:20,background:CARD,borderRadius:4}}>
      {endW>startW&&<div style={{position:"absolute",left:(startW/maxW*100)+"%",width:Math.max((endW-startW)/maxW*100,0.6)+"%",top:2,height:16,background:color,borderRadius:3,opacity:muted?0.5:1}}/>}
    </div>
    <div style={{width:128,flex:"0 0 128px",fontSize:10,color:muted?MUT:(pacing?BRN:MUT),fontWeight:pacing?700:400,textAlign:"right"}}>{tag}</div>
  </div>;
}

function LiveStepsGantt({res,facts,deadlineWeeks}){
  var srcEnd=res.src.base;
  var bandStart=srcEnd;
  var negEnd=bandStart+res.negotiation.base;
  var frictionStart=bandStart+res.band.base;
  var atcStart=res.core.base;
  var atcEnd=atcStart+res.atcAts;
  var execEnd=atcEnd+res.execution;
  var maxW=Math.max(execEnd,deadlineWeeks)+6;

  var status="Comfortable";
  if(deadlineWeeks<res.total.base)status="Breach risk";
  else if(deadlineWeeks<res.total.high)status="At risk";
  var sc=statusColor(status)[0];

  return <div>
    <div style={{display:"flex",gap:10,fontSize:10,color:MUT,marginBottom:4}}>
      <div style={{width:168,flex:"0 0 168px"}}>Phase</div>
      <div style={{flex:1,position:"relative",height:14}}>
        {[0,Math.round(maxW/2),Math.round(maxW)].map(function(w,i){return <div key={i} style={{position:"absolute",left:(w/maxW*100)+"%"}}>{fmtDate(addWeeks(TODAY,w))}</div>;})}
      </div>
      <div style={{width:128,flex:"0 0 128px"}}/>
    </div>
    <GanttLane label={"Sourcing ("+facts.sourcing.toUpperCase()+")"} startW={0} endW={srcEnd} maxW={maxW} pacing={false} muted={facts.sourcing==="none"} tag={fW(res.src.base)}/>
    <GanttLane label={"Negotiation + "+res.turnsUsed+" redline turns"} startW={bandStart} endW={negEnd} maxW={maxW} pacing={res.band.base===res.negotiation.base} muted={false} tag={fW(res.negotiation.base)+(res.band.base===res.negotiation.base?" (paces the band)":"")}/>
    {["tprm","sae","privacy","air"].map(function(r){
      var on=facts.reviews.indexOf(r)>=0;
      var dur=on?lScale(lbh.apply(null,REVIEW_TABLE[r]),facts.K).base:0;
      var paces=on&&dur>0&&res.band.base===dur;
      return <GanttLane key={r} label={REVIEW_LABEL[r]} startW={bandStart} endW={on?bandStart+dur:bandStart} maxW={maxW} pacing={paces} muted={!on} tag={on?(fW(dur)+(paces?" (paces the band)":"")):"not triggered"}/>;
    })}
    <GanttLane label="New-supplier onboarding (SAP)" startW={bandStart} endW={facts.newSupplier?bandStart+res.onboarding.base:bandStart} maxW={maxW} pacing={facts.newSupplier&&res.band.base===res.onboarding.base} muted={!facts.newSupplier} tag={facts.newSupplier?fW(res.onboarding.base):"existing supplier"}/>
    <GanttLane label="Pilot / PoC" startW={bandStart} endW={facts.pilot!=="none"?bandStart+res.pilot.base:bandStart} maxW={maxW} pacing={facts.pilot!=="none"&&res.band.base===res.pilot.base} muted={facts.pilot==="none"} tag={facts.pilot!=="none"?fW(res.pilot.base):"none requested"}/>
    <GanttLane label={"Scheduling friction (x"+res.fr.toFixed(3)+")"} startW={frictionStart} endW={res.core.base} maxW={maxW} pacing={false} muted={false} tag={"+"+fW(res.core.base-res.criticalPathBase.base)}/>
    <GanttLane label="PR ATC/ATS approval (Ariba)" startW={atcStart} endW={atcEnd} maxW={maxW} pacing={false} muted={false} tag={fW(res.atcAts)}/>
    <GanttLane label="Execution / signature" startW={atcEnd} endW={execEnd} maxW={maxW} pacing={false} muted={false} tag={fW(res.execution)}/>
    <div style={{display:"flex",gap:10,marginTop:6,position:"relative"}}>
      <div style={{width:168,flex:"0 0 168px",fontSize:10,fontWeight:700,color:sc}}>Target deadline</div>
      <div style={{flex:1,position:"relative",height:14}}>
        <div style={{position:"absolute",left:(deadlineWeeks/maxW*100)+"%",top:-72,width:2,height:78,background:sc,opacity:0.7}}/>
        <div style={{position:"absolute",left:(deadlineWeeks/maxW*100)+"%",transform:"translateX(-50%)",fontSize:10,color:sc,fontWeight:700,top:0}}>{fmtDate(addWeeks(TODAY,deadlineWeeks))}</div>
      </div>
      <div style={{width:128,flex:"0 0 128px"}}/>
    </div>
    <div style={{marginTop:8}}><StatusPill text={"SLA status: "+status} status={status}/></div>
  </div>;
}

function ScenarioControls({facts,setFacts,deadlineWeeks,setDeadlineWeeks}){
  function set(patch){setFacts(Object.assign({},facts,patch));}
  function toggleReview(r){var reviews=facts.reviews.indexOf(r)>=0?facts.reviews.filter(function(x){return x!==r;}):facts.reviews.concat([r]);set({reviews:reviews});}
  var label={fontSize:10,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4};
  var selStyle={width:"100%",padding:"6px 8px",border:"1px solid "+BD,borderRadius:6,fontSize:12};
  return <Card title="Model It: Scenario Controls" note="Recomputes live, no server round-trip">
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
      <div><div style={label}>Contract instrument</div><select style={selStyle} value={facts.instrument} onChange={function(e){set({instrument:e.target.value});}}>
        <option value="po">PO w/ Lilly T&Cs</option><option value="shortform">Short form</option><option value="sow">SOW under MSA</option><option value="sow_amend">SOW + MSA amendment</option><option value="new_msa">New MSA (full)</option><option value="amendment">Master agmt amendment</option>
      </select></div>
      <div><div style={label}>Sourcing event</div><select style={selStyle} value={facts.sourcing} onChange={function(e){set({sourcing:e.target.value});}}>
        <option value="none">None</option><option value="rfi">RFI only</option><option value="rfq">RFQ</option><option value="rfp">RFP (4-6 suppliers)</option><option value="multi">Multi-stage</option>
      </select></div>
      <div><div style={label}>Pilot / PoC</div><select style={selStyle} value={facts.pilot} onChange={function(e){set({pilot:e.target.value});}}>
        <option value="none">None</option><option value="shallow">Shallow eval</option><option value="medium">Medium pilot</option><option value="deep">Deep PoC</option>
      </select></div>
      <div><div style={label}>Deal size</div><select style={selStyle} value={facts.dealSizeUsd>=15000000?"over":"under"} onChange={function(e){set({dealSizeUsd:e.target.value==="over"?18000000:5000000});}}>
        <option value="under">Under $15M</option><option value="over">$15M and over</option>
      </select></div>
      <div><div style={label}>Redline turns: {facts.redlineTurns}</div><input type="range" min={0} max={6} value={facts.redlineTurns} style={{width:"100%"}} onChange={function(e){set({redlineTurns:Number(e.target.value)});}}/></div>
      <div><div style={label}>Domain scale K: {facts.K.toFixed(2)}</div><input type="range" min={0.6} max={1.8} step={0.05} value={facts.K} style={{width:"100%"}} onChange={function(e){set({K:Number(e.target.value)});}}/></div>
      <div><div style={label}>Target deadline: {deadlineWeeks}wk out ({fmtDate(addWeeks(TODAY,deadlineWeeks))})</div><input type="range" min={20} max={80} value={deadlineWeeks} style={{width:"100%"}} onChange={function(e){setDeadlineWeeks(Number(e.target.value));}}/></div>
    </div>
    <div style={{marginTop:12}}>
      <div style={label}>Risk reviews triggered</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {["tprm","sae","privacy","air"].map(function(r){return <label key={r} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:DK}}><input type="checkbox" checked={facts.reviews.indexOf(r)>=0} onChange={function(){toggleReview(r);}}/>{r.toUpperCase()}</label>;})}
      </div>
      <div style={{display:"flex",gap:14,marginTop:8}}>
        <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:DK}}><input type="checkbox" checked={facts.newSupplier} onChange={function(e){set({newSupplier:e.target.checked});}}/>New supplier</label>
        <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:DK}}><input type="checkbox" checked={facts.crossFunctional3plus} onChange={function(e){set({crossFunctional3plus:e.target.checked});}}/>3+ cross-functional stakeholders</label>
      </div>
    </div>
  </Card>;
}

function TwoWeekCalendar({res}){
  var start=new Date(TODAY);start.setDate(start.getDate()-start.getDay());
  var srcEndDate=addWeeks(TODAY,res.src.base);
  var cells=[];
  for(var i=0;i<14;i++){
    var d=new Date(start);d.setDate(d.getDate()+i);
    var dayOffset=Math.round((d-TODAY)/(1000*60*60*24));
    var isToday=d.toDateString()===TODAY.toDateString();
    var evt=calendarEvent(dayOffset,res);
    var status,bg,fg;
    if(evt){status=evt.label;bg=WARM;fg=AMB;}
    else if(d<TODAY){status="done";bg="#fff";fg=MUT;}
    else if(d<=srcEndDate){status="active";bg=OK;fg=BLU;}
    else {status="upcoming";bg=CARD;fg=MUT;}
    var isWeekend=d.getDay()===0||d.getDay()===6;
    cells.push(<div key={i} style={{background:bg,border:isToday?"2px solid "+R:"1px solid "+BD,borderRadius:6,padding:"6px 4px",minHeight:48,opacity:isWeekend?0.5:1}}>
      <div style={{fontSize:10,color:fg,fontWeight:isToday?700:400}}>{d.getDate()}</div>
      <div style={{fontSize:9,color:fg,marginTop:2,textTransform:"uppercase",letterSpacing:"0.02em"}}>{status}</div>
    </div>);
  }
  return <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(function(d){return <div key={d} style={{fontSize:10,color:MUT,fontWeight:700,textAlign:"center"}}>{d}</div>;})}
    {cells}
  </div>;
}

function RemainingCriticalPath({contingencyDays,setContingencyDays}){
  var cp=computeCriticalPathTasks(contingencyDays);
  var order=cp.order,projectEnd=cp.projectEnd;
  var critical=order.filter(function(t){return Math.abs(t.slack)<0.01;}).map(function(t){return t.name;});
  var rows=order.map(function(t){var onPath=Math.abs(t.slack)<0.01;return [
    {d:t.name,b:onPath},
    {d:t.dur.toFixed(1)+"d",v:t.dur,a:"right"},
    {d:t.ef.toFixed(1)+"d",v:t.ef,a:"right"},
    {d:t.slack.toFixed(1)+"d",v:t.slack,a:"right",c:onPath?BRN:DK},
    {d:onPath?"Yes":"No",c:onPath?BRN:MUT,b:onPath}
  ];});
  return <div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Contingency buffer: {contingencyDays} days / task</div>
      <input type="range" min={0} max={10} value={contingencyDays} style={{width:"100%"}} onChange={function(e){setContingencyDays(Number(e.target.value));}}/>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
      {order.map(function(t,i){
        var onPath=Math.abs(t.slack)<0.01;
        return <span key={t.id} style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:onPath?WARM:CARD,border:"1px solid "+(onPath?BRN:BD),borderTop:"3px solid "+(onPath?BRN:MUT),borderRadius:6,padding:"8px 10px",minWidth:120}}>
            <div style={{fontSize:11,fontWeight:700,color:onPath?BRN:DK}}>{t.name}</div>
            <div style={{fontSize:10,color:MUT,marginTop:2}}>{t.dur.toFixed(1)}d | slack {t.slack.toFixed(1)}d</div>
          </div>
          {i<order.length-1&&<span style={{color:MUT,fontSize:14}}>{"→"}</span>}
        </span>;
      })}
    </div>
    <STable columns={[{l:"Task"},{l:"Duration",a:"right"},{l:"Earliest finish",a:"right"},{l:"Slack",a:"right"},{l:"On critical path",a:"right"}]} rows={rows}/>
    <div style={{fontSize:11,color:MUT,marginTop:8}}>Project length: {projectEnd.toFixed(1)} days across {order.length} tasks. Brown-bordered tasks sit on the critical path (zero slack).</div>
  </div>;
}

function PortfolioGantt({horizonWeeks,highlightBottleneck}){
  var projects=PROJECTS.map(function(p){return Object.assign({},p,{slack:p.deadline-p.gates[p.gates.length-1][1]});});
  var sorted=projects.slice().sort(function(a,b){return a.slack-b.slack;});
  var maxW=Math.max.apply(null,projects.map(function(p){return Math.max(p.deadline,p.gates[p.gates.length-1][1]);}))+4;
  var visW=Math.min(maxW,horizonWeeks);
  return <div>
    <div style={{fontSize:10,color:MUT,marginBottom:6}}>TODAY = {fmtDate(TODAY)} | showing next {visW} weeks</div>
    {projects.map(function(p){
      var isBottleneck=highlightBottleneck&&p.name===sorted[0].name;
      var bnColor=p.slack<0?R:AMB, bnBg=p.slack<0?RISK:WARM;
      return <div key={p.name} style={{marginBottom:10,padding:6,borderRadius:6,border:isBottleneck?"1px solid "+bnColor:"1px solid transparent",background:isBottleneck?bnBg+"88":"transparent"}}>
        <div style={{fontSize:11,fontWeight:700,color:isBottleneck?bnColor:DK,marginBottom:3}}>{p.name}{isBottleneck?"  ("+(p.slack<0?"overdue by "+Math.abs(p.slack).toFixed(0)+"wk":"least slack: "+p.slack.toFixed(0)+"wk")+")":""}</div>
        <div style={{position:"relative",height:22,background:CARD,borderRadius:4,overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:MUT,opacity:0.5}}/>
          {p.gates.map(function(g,gi){
            if(g[1]==null||g[1]>visW)return null;
            var isLast=gi===p.gates.length-1;
            return <div key={g[0]} title={g[0]+": wk "+g[1]} style={{position:"absolute",left:(g[1]/visW*100)+"%",top:3,width:16,height:16,borderRadius:"50%",background:isLast?BRN:"#fff",border:"2px solid "+(isLast?BRN:BLU),transform:"translateX(-50%)"}}/>;
          })}
          <div style={{position:"absolute",left:(p.deadline/visW*100)+"%",top:-4,bottom:-4,width:2,background:p.slack<0?R:AMB,opacity:0.8}}/>
        </div>
      </div>;
    })}
  </div>;
}

function TimingRunway({res,expiryWeeks,noticeWeeks}){
  var noticeByWeek=expiryWeeks-noticeWeeks;
  var weeksNeeded=res.totalRounded.base;
  var runwayAvailable=noticeByWeek;
  var status="Comfortable";
  if(runwayAvailable<0)status="Breach risk";
  else if(runwayAvailable<weeksNeeded)status="At risk";
  var sc=statusColor(status)[0];
  var maxW=Math.max(expiryWeeks,weeksNeeded)+6;
  var neededW=Math.min(weeksNeeded,maxW);
  return <div>
    <div style={{position:"relative",height:28,background:CARD,borderRadius:6,marginTop:10,overflow:"hidden"}}>
      <div style={{position:"absolute",left:0,width:(neededW/maxW*100)+"%",top:4,height:20,background:sc,borderRadius:4}}/>
      {expiryWeeks>weeksNeeded&&<div style={{position:"absolute",left:(weeksNeeded/maxW*100)+"%",width:((expiryWeeks-weeksNeeded)/maxW*100)+"%",top:4,height:20,background:OK,borderRadius:"0 4px 4px 0"}}/>}
      {weeksNeeded>expiryWeeks&&<div style={{position:"absolute",left:(expiryWeeks/maxW*100)+"%",width:((weeksNeeded-expiryWeeks)/maxW*100)+"%",top:4,height:20,background:R,opacity:0.55,borderRadius:"0 4px 4px 0"}}/>}
      <div style={{position:"absolute",left:(expiryWeeks/maxW*100)+"%",top:-4,bottom:-4,width:2,background:R}}/>
      <div style={{position:"absolute",left:(noticeByWeek/maxW*100)+"%",top:-4,bottom:-4,width:2,background:AMB}}/>
    </div>
    <div style={{display:"flex",gap:16,marginTop:8,fontSize:10,color:MUT,flexWrap:"wrap"}}>
      <div><span style={{color:sc}}>{"■"}</span> weeks needed ({weeksNeeded}wk, {status.toLowerCase()})</div>
      <div><span style={{color:OK}}>{"■"}</span> spare buffer to expiry</div>
      <div><span style={{color:AMB}}>|</span> notice-by ({fmtDate(addWeeks(TODAY,noticeByWeek))})</div>
      <div><span style={{color:R}}>|</span> contract expiry ({fmtDate(addWeeks(TODAY,expiryWeeks))})</div>
    </div>
    <div style={{marginTop:10}}><StatusPill text={"Runway status: "+status} status={status}/></div>
  </div>;
}

// ---------------------------------------------------------------------------
// TAB BODIES
// ---------------------------------------------------------------------------
function OverviewTab({facts,setFacts,deadlineWeeks,setDeadlineWeeks,contingencyDays,setContingencyDays}){
  var res=useMemo(function(){return computeTimeline(facts);},[facts]);
  var longest=res.band.base===res.negotiation.base?"negotiation (incl. redline turns)":res.band.base===res.review.base&&res.review.base>0?"the longest triggered risk review":res.band.base===res.onboarding.base&&res.onboarding.base>0?"new-supplier onboarding":res.band.base===res.pilot.base&&res.pilot.base>0?"the pilot / PoC":"negotiation (incl. redline turns)";
  var cp=computeCriticalPathTasks(contingencyDays);
  var criticalNames=cp.order.filter(function(t){return Math.abs(t.slack)<0.01;}).map(function(t){return t.name;});

  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
      <Metric label="Estimated range" value={res.totalRounded.low+"-"+res.totalRounded.high+" wk"} sub={"best estimate ~"+res.totalRounded.base+"wk"} accent/>
      <Metric label="Complexity" value={res.tier} sub={"score "+res.score+" | friction x"+res.fr.toFixed(3)}/>
      <Metric label="Domain scale" value={res.K.toFixed(2)} sub={res.K===1?"un-calibrated default":"calibrated"}/>
      <Metric label="Target deadline" value={deadlineWeeks+"wk out"} sub={fmtDate(addWeeks(TODAY,deadlineWeeks))}/>
      <Metric label="Sanity ceiling" value={res.total.base>78?"Flagged":"OK"} sub={res.total.base.toFixed(0)+"wk vs ~78wk ceiling"} warn={res.total.base>78} good={res.total.base<=78}/>
    </div>

    <ScenarioControls facts={facts} setFacts={setFacts} deadlineWeeks={deadlineWeeks} setDeadlineWeeks={setDeadlineWeeks}/>

    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
      <Card title="Live Steps: Time vs. Deadline (SLA lane view)" note="Anchor visual - date-driven">
        <LiveStepsGantt res={res} facts={facts} deadlineWeeks={deadlineWeeks}/>
      </Card>
      <Card title="Critical-Path Read">
        <div style={{fontSize:12,lineHeight:1.6,color:DK}}>
          The concurrent band is bounded by <strong>{longest}</strong>, which sets the pace of the parallel work running alongside negotiation.
          {" "}Sourcing runs first and sequentially (~{fW(res.src.base)}), then the concurrent band adds ~{fW(res.band.base)} before scheduling friction (x{res.fr.toFixed(3)}) and the unscaled ATC/ATS + execution tail.
          {" "}Reconciliation: parallel band used max not sum; friction applied once to the base only; range propagated from per-phase Low/High; sanity ceiling {res.total.base>78?"flagged":"OK"}.
        </div>
        <div style={{fontSize:11,color:MUT,marginTop:10}}>What would tighten this: confirm redline-turn count with legal; confirm SAE scope early to de-risk the longest review.</div>
      </Card>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card title="Two-Week Calendar"><TwoWeekCalendar res={res}/></Card>
      <Card title="What's Active This Window">
        <div style={{fontSize:12,lineHeight:1.6,color:DK}}>Days ringed today mark the current position on the critical path. Active-now items sit inside the concurrent band; upcoming items are gated behind sourcing or the negotiation spine. Needs-you days are where the model shows a sequential handoff (redline turn, questionnaire follow-up) that cannot proceed without action.</div>
      </Card>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
      <Card title="Remaining Critical Path (task-level)" note="Generic longest-path, independent of the phase model">
        <RemainingCriticalPath contingencyDays={contingencyDays} setContingencyDays={setContingencyDays}/>
      </Card>
      <Card title="Bottleneck Task Read">
        <div style={{fontSize:12,lineHeight:1.6,color:DK}}>
          The critical path runs through <strong>{criticalNames.join(" → ")}</strong>, totaling {cp.projectEnd.toFixed(1)} days.
          {" "}{contingencyDays>0?("A "+contingencyDays+"-day/task contingency buffer is applied, stretching every task including the ones with slack."):"No contingency buffer applied; slack columns show float other tasks could safely absorb."}
          {" "}Any slip on the critical-path tasks moves the finish date directly; non-critical tasks (SAE Security Review in this scenario) have float and are not the pacing item unless they slip past their slack.
        </div>
      </Card>
    </div>
  </div>;
}

function PortfolioTab({horizonWeeks,setHorizonWeeks,highlightBottleneck,setHighlightBottleneck}){
  var projects=PROJECTS.map(function(p){return Object.assign({},p,{slack:p.deadline-p.gates[p.gates.length-1][1]});});
  var sorted=projects.slice().sort(function(a,b){return a.slack-b.slack;});
  var saeCount=projects.filter(function(p){return p.gates.some(function(g){return g[0].indexOf("Cyber")===0&&g[1]!=null;});}).length;
  var tableRows=sorted.map(function(p){return [
    {d:p.name,b:p.name===sorted[0].name},
    {d:p.gates[p.gates.length-1][0]+" wk"+p.gates[p.gates.length-1][1],v:p.gates[p.gates.length-1][1]},
    {d:"wk"+p.deadline,v:p.deadline},
    {d:(p.slack<0?"-":"+")+Math.abs(p.slack).toFixed(0)+"wk",v:p.slack,c:p.slack<0?R:(p.slack<=2?AMB:BLU),b:true},
    {d:p.slack<0?"Overdue":p.slack<=2?"Tight":"On track",c:p.slack<0?R:(p.slack<=2?AMB:BLU)}
  ];});
  return <div>
    <Card title="Portfolio Controls">
      <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:220}}>
          <div style={{fontSize:10,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Horizon: {horizonWeeks} weeks</div>
          <input type="range" min={8} max={52} value={horizonWeeks} style={{width:"100%"}} onChange={function(e){setHorizonWeeks(Number(e.target.value));}}/>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}><input type="checkbox" checked={highlightBottleneck} onChange={function(e){setHighlightBottleneck(e.target.checked);}}/>Highlight bottleneck project</label>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
      <Card title="Portfolio Timeline (My Workload)" note="Anchor visual - gate-by-date Gantt">
        <PortfolioGantt horizonWeeks={horizonWeeks} highlightBottleneck={highlightBottleneck}/>
      </Card>
      <Card title="Cross-Project Bottleneck Read">
        <div style={{fontSize:12,lineHeight:1.6,color:DK}}>
          <strong>{sorted[0].name}</strong> carries the least slack ({sorted[0].slack.toFixed(0)}wk) against its own target date and is the portfolio's near-term bottleneck.
          {" "}Cyber (SAE) review gates appear on {saeCount} of {projects.length} active projects, a shared-queue concentration risk if the security review team's capacity is fixed.
        </div>
        <div style={{fontSize:11,color:MUT,marginTop:10}}>Reference lines mark each project's own target deadline; red = deadline already behind the projected PO date, amber = tight but ahead.</div>
      </Card>
    </div>
    <Card title="Portfolio Detail">
      <STable columns={[{l:"Project"},{l:"Last cleared gate"},{l:"Target deadline"},{l:"Slack",a:"right"},{l:"Status"}]} rows={tableRows}/>
    </Card>
  </div>;
}

function DealRenewTab({facts,expiryWeeks,setExpiryWeeks,noticeWeeks,setNoticeWeeks,action,setAction}){
  var actionFacts={
    renew:{sourcing:"none",instrument:"sow",newSupplier:false},
    renegotiate:{sourcing:"none",instrument:"sow_amend",newSupplier:false},
    recompete:{sourcing:"rfp",instrument:"new_msa",newSupplier:false}
  };
  var f2=Object.assign({},facts,actionFacts[action]);
  var res=useMemo(function(){return computeTimeline(f2);},[f2.sourcing,f2.instrument,f2.newSupplier,f2.reviews,f2.K,f2.redlineTurns,f2.dealSizeUsd,f2.pilot]);
  var noticeByWeek=expiryWeeks-noticeWeeks;
  var weeksNeeded=res.totalRounded.base;
  var runwayAvailable=noticeByWeek;
  var status="Comfortable";
  if(runwayAvailable<0)status="Breach risk"; else if(runwayAvailable<weeksNeeded)status="At risk";
  var actLabel={renew:"renew as-is",renegotiate:"renegotiate via SOW amendment",recompete:"recompete via full RFP and a New MSA"}[action];
  var selStyle={width:"100%",padding:"6px 8px",border:"1px solid "+BD,borderRadius:6,fontSize:12};
  var label={fontSize:10,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4};

  return <div>
    <Card title="Runway Controls">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <div><div style={label}>Weeks until contract expiry: {expiryWeeks}</div><input type="range" min={8} max={60} value={expiryWeeks} style={{width:"100%"}} onChange={function(e){setExpiryWeeks(Number(e.target.value));}}/></div>
        <div><div style={label}>Contractual notice period: {noticeWeeks}wk</div><input type="range" min={2} max={26} value={noticeWeeks} style={{width:"100%"}} onChange={function(e){setNoticeWeeks(Number(e.target.value));}}/></div>
        <div><div style={label}>Recommended action</div><select style={selStyle} value={action} onChange={function(e){setAction(e.target.value);}}>
          <option value="renew">Renew as-is (SOW, no changes)</option>
          <option value="renegotiate">Renegotiate (SOW amendment)</option>
          <option value="recompete">Recompete (full RFP + New MSA)</option>
        </select></div>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
      <Card title="Timing & Runway" note="Backward-planned from the contract deadline">
        <TimingRunway res={res} expiryWeeks={expiryWeeks} noticeWeeks={noticeWeeks}/>
      </Card>
      <Card title="Recommendation & Rationale">
        <div style={{fontSize:12,lineHeight:1.6,color:DK}}>
          At the selected action (<strong>{actLabel}</strong>), the critical path needs ~{weeksNeeded}wk. Working back from the {noticeWeeks}wk contractual notice period, the notice-by date is {fmtDate(addWeeks(TODAY,noticeByWeek))}, {runwayAvailable}wk from today.
          {" "}{status==="Comfortable"?"That leaves a comfortable buffer to start.":status==="At risk"?"That is tighter than the estimated need: start now to protect the notice-by date.":"The notice-by date has already effectively passed the estimated need: escalate immediately, this is overdue to start."}
        </div>
        <div style={{fontSize:11,color:MUT,marginTop:10}}>What would tighten this: confirmed notice-period language from the governing MSA; confirmed recommended action (renew/renegotiate/recompete) from the category owner.</div>
      </Card>
    </div>
  </div>;
}

// ---------------------------------------------------------------------------
// ROOT
// ---------------------------------------------------------------------------
export default function Dashboard(){
  var _t=useState("Overview");var tab=_t[0];var setTab=_t[1];
  var _f=useState(DEFAULT_FACTS);var facts=_f[0];var setFacts=_f[1];
  var _dl=useState(55);var deadlineWeeks=_dl[0];var setDeadlineWeeks=_dl[1];
  var _cd=useState(0);var contingencyDays=_cd[0];var setContingencyDays=_cd[1];
  var _hz=useState(26);var horizonWeeks=_hz[0];var setHorizonWeeks=_hz[1];
  var _hb=useState(true);var highlightBottleneck=_hb[0];var setHighlightBottleneck=_hb[1];
  var _ew=useState(30);var expiryWeeks=_ew[0];var setExpiryWeeks=_ew[1];
  var _nw=useState(10);var noticeWeeks=_nw[0];var setNoticeWeeks=_nw[1];
  var _ac=useState("recompete");var action=_ac[0];var setAction=_ac[1];

  return (
    <div style={{fontFamily:"Arial,sans-serif",background:"#FFFFFF",minHeight:"100vh",color:DK,fontSize:13}}>
      <div style={{background:DK,padding:"12px 24px 8px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:4,height:40,background:R,borderRadius:2}}/><div><div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:R}}>Timeline Builder</div><div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#fff",marginTop:1}}>Cloud Hosting Platform - New MSA + RFP</div></div></div><div style={{fontSize:11,color:MUT,textAlign:"right"}}>As of {fmtDate(TODAY)}, 2026<br/>Critical-path estimate | timeline_engine.py v1.1</div></div></div>
      <div style={{background:"#fff",borderBottom:"1px solid "+BD,padding:"0 24px",display:"flex",overflowX:"auto"}}>{TABS.map(function(t){var active=t===tab;return <button key={t} onClick={function(){setTab(t);}} style={{padding:"10px 14px",fontSize:11,fontWeight:active?700:500,color:active?R:MUT,background:"transparent",border:"none",borderBottom:active?"2.5px solid "+R:"2.5px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>{t}{NEEDS_INPUT[t]?<span style={{color:AMB,marginLeft:4}}>*</span>:null}</button>;})}</div>
      <div style={{padding:"18px 24px 40px",maxWidth:1280,margin:"0 auto"}}>
        {tab==="Overview"&&<OverviewTab facts={facts} setFacts={setFacts} deadlineWeeks={deadlineWeeks} setDeadlineWeeks={setDeadlineWeeks} contingencyDays={contingencyDays} setContingencyDays={setContingencyDays}/>}
        {tab==="Portfolio"&&<PortfolioTab horizonWeeks={horizonWeeks} setHorizonWeeks={setHorizonWeeks} highlightBottleneck={highlightBottleneck} setHighlightBottleneck={setHighlightBottleneck}/>}
        {tab==="Deal & Renew"&&<DealRenewTab facts={facts} expiryWeeks={expiryWeeks} setExpiryWeeks={setExpiryWeeks} noticeWeeks={noticeWeeks} setNoticeWeeks={setNoticeWeeks} action={action} setAction={setAction}/>}
      </div>
      <div style={{background:DK,padding:"10px 24px",display:"flex",justifyContent:"space-between",fontSize:10,color:MUT}}>
        <div>Illustrative data | not a real Lilly engagement</div>
        <div>Company Confidential | Timeline Builder | 2026</div>
      </div>
    </div>
  );
}
```
