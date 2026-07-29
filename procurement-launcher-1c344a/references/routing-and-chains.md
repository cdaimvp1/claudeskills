# Routing and Chain Data (THEO's own operational data)

This file is THEO's routing and pipeline-sequencing data. It lives inside
procurement-launcher, not lilly-brand-assets, per the suite owner's explicit
instruction: lilly-brand-assets' scope is branding and design references only, and
routing/sequencing is THEO's own job.

Loaded on every THEO invocation (routing is this skill's core job, unlike
teach-mode content which is genuinely conditional and lives in its own companion).

**2026-07-22 update:** decision-deck and procurement-options-analysis were retired
(owner-approved roster cut). Both skills' rows are removed from this table; every
other skill's Predecessors/Successors text below has been re-derived to drop
references to either retired skill, per the same no-fabrication discipline as the
rest of this file (a skill that named one of them as a successor and states no
other successor now reads "none stated" for that direction, not a fabricated
replacement).

## What this file is, and is not

This is a "what's next" lookup, not a decision kernel with invented business rules.
Every predecessor/successor relationship below is transcribed from the consuming or
producing skill's OWN stated text (Consumes/Feeds/Integration/Cross-Skill Handoffs/
Skill Chain Position sections, or an explicit BOUNDARY statement). Nothing here was
inferred or fabricated. Where no skill states a relationship, that is recorded
explicitly as "none stated" rather than guessed. Compiled 2026-07-21 from the 26
skills as they existed at that point in this working folder; re-derived 2026-07-22
(Stage 8) to add the five new skills (procurement-options-analysis, scope-sow-architect,
deal-room, invoice-rate-card-auditor, sole-source-challenge), each row transcribed from
that skill's OWN Integration/Cross-Skill-Handoffs/BOUNDARY text, and to reflect the
corrected suite (evaluation-engine as sole scoring owner per Stage 1a; the
requirements grid built inside rfp-engine per Stage 1b). If a skill's own
Integration/Consumes/Feeds text changes in a later edit, re-derive the affected row
here rather than letting this file drift from the skills it describes.

The pending procurement-help-desk (Stage 7, network-gated content build) is an end-user
front door, not a link in these producer/consumer chains; it is intentionally NOT given
a chain row until it ships and states its own handoffs.

## How THEO uses this file

1. **Hard gate first.** If the user's request unambiguously names a skill or its
   trigger phrase, route directly. Do not consult the chain table first; the user
   already told you what they want.
2. **Chain-continuation check.** If the conversation or Project is already mid-sequence
   on a prior skill's output (the user references "the shortlist I just got," "the
   evaluation I just ran," etc., or a Project contains a recent artifact from one of
   the skills in the table below), look up that skill's stated successors below before
   considering the raw request in isolation. Offer the stated next step(s), not a guess.
3. **Otherwise, classify from the routing table** (in SKILL.md) as today, using the
   trigger phrases and attachment hints there.
4. **Never state a chain relationship not listed below.** If a skill's own text states
   no successor, say so plainly ("no defined next step from here") rather than
   inventing one that sounds plausible. A wrong guess about what comes next is worse
   than admitting the chain ends here or the user should decide.
5. **This file does not replace the routing table.** The routing table in SKILL.md
   answers "which skill handles this request." This file answers the second, different
   question: "given a skill just ran, what comes next." Both may be consulted in the
   same turn.

## Chain table

Format: for each skill, Predecessors (what feeds it, per its own text) and
Successors (what it feeds, per its own text), with the source phrasing preserved
closely enough to trace back to the origin file. "None stated" means exactly that:
the skill's own SKILL.md has no Integration/Consumes/Feeds/Cross-Skill Handoffs
section naming a relationship in that direction.

| Skill | Predecessors (feeds INTO this skill) | Successors (this skill feeds INTO) |
|---|---|---|
| category-strategy | supplier-landscape (market research/profiles), commercial-negotiation-prep (pricing benchmarks), market-rate-benchmarking (rate benchmarks sizing savings), negotiation-playbook-learning (difficulty scores/patterns) | rfp-engine (category, shortlisted suppliers, target events, when competitive sourcing is recommended) |
| comment-cleanup | lilly-contract-review (called inline from Step 5D after producing a redline) | none stated separately (it is the terminus of that inline call) |
| commercial-negotiation-prep | rfp-engine / evaluation-engine (competitive pricing, supplier ranking), negotiation-playbook-learning (historical commercial outcomes), market-rate-benchmarking (external/internal rate comparisons) | legal-negotiation-prep (commercial briefing feeds the legal briefing), pro-forma-builder (full multi-year model), should-cost-builder (bottoms-up cost anchor to bracket the negotiation target) |
| deal-room | commercial-negotiation-prep OR legal-negotiation-prep (either seeds the Phase 1 opening strategy at open, the preferred way to open a deal); process-navigator (threshold/FRAP-policy lookup mid-run, a lookup not a sequence step); meeting-prep-brief (complementary for the same meeting, not sequential) | negotiation-playbook-learning (at close only: the round-by-round history collapses into a single negotiation_outcome.json record feeding its historical dataset - the one place the two skills touch) |
| evaluation-engine | rfp-engine, rfp-response-analysis (handoff payload), rfp-case-manager (case file) | commercial-negotiation-prep and lilly-contract-review, via `evaluation_engine_award_handoff.json` (schema owned by evaluation-engine; carries the official award, the scoring grid, negotiation inputs and citation provenance). Never auto-advanced: the payload is emitted and the user is told which skill consumes it. |
| executive-summary-package | none stated | none stated |
| invoice-rate-card-auditor | none stated (audits a user-supplied invoice population against an ALREADY-EXECUTED contract/rate card/PO/timesheets; no upstream skill feeds it) | commercial-negotiation-prep (questioned-amount findings feed a renewal negotiation), market-rate-benchmarking (when a rate is contractually correct but no longer competitive at renewal), executive-summary-package (downstream consumer of the findings ledger for governance approval or executive readout) |
| legal-negotiation-prep | lilly-contract-review (playbook positions, Hard Stop definitions, SME matrix, pharma requirements), negotiation-playbook-learning (supplier-specific outcomes, acceptance rates, difficulty scores) | lilly-contract-review (informs the eventual contract review), negotiation-simulator (tiered positions and fallback sequencing for rehearsal, optional) |
| lilly-brand-assets | none stated (passive shared foundation) | none stated |
| lilly-contract-review | negotiation-playbook-learning (outcome data if available), market-rate-benchmarking (rate benchmarking if installed) | negotiation-playbook-learning (outcomes recorded after negotiation); absorbs the legal-negotiation-prep and commercial-negotiation-prep panels natively when a contract is present |
| market-rate-benchmarking | none stated | commercial-negotiation-prep (pricing intelligence for counter-offers), rfp-engine (informs RFP pricing evaluation criteria), evaluation-engine (pricing context for scoring), category-strategy (portfolio inconsistencies, rationalization savings), pro-forma-builder (sourced cost anchors) |
| meeting-prep-brief | theos-field-guide (when a meeting has no prep file), rfp-case-manager Schedule workflow (after drafting an invite) | process-navigator (policy/threshold questions), voice-profile (opt-in follow-on drafts), workflow-map (opt-in workflow diagram) |
| negotiation-playbook-learning | lilly-contract-review (redlined contracts as ideal RECORD-mode input, Hard Stop flags, SME escalation outcomes) | lilly-contract-review (feedback loop: acceptance rates, supplier history), evaluation-engine (difficulty score, duration benchmarks, term-structuring patterns) |
| negotiation-simulator | lilly-contract-review (playbook, SME matrix, findings), negotiation-playbook-learning (supplier history, difficulty), legal/commercial-negotiation-prep (the briefing to practice against) | the real negotiation; negotiation-playbook-learning (after the actual call, including opt-in simulation-outcome records) |
| pro-forma-builder | market-rate-benchmarking (external rate anchors), should-cost-builder (bottoms-up cost), commercial-negotiation-prep (counter-offer economics), lilly-contract-review (deal terms), evaluation-engine (shortlisted suppliers/rankings, enriching) | executive-summary-package (deal value), commercial-negotiation-prep (TCO/walk-away economics), evaluation-engine (sourced TCO figures; two-way relationship, see note) |
| process-navigator | theos-field-guide (status-request flow), timeline-builder (which review/process factors apply), workflow-map (confirm canonical step order), any skill needing a process/threshold answer | offers (default no) to start supplier-landscape, rfp-engine, timeline-builder, or workflow-map after answering |
| procurement-launcher (THEO) | none stated (user-invoked, not called by other skills) | routes to all 27 built routable skills via the routing table (plus the pending procurement-help-desk once it ships); explicitly a dispatcher, not an orchestrator - it names paths and hands off one skill at a time, it does not itself call or run another skill |
| rfp-case-manager | rfp-engine (via case_handoff.json), supplier-landscape, category-strategy | rfp-response-analysis, evaluation-engine |
| rfp-engine | supplier-landscape, category-strategy, market-rate-benchmarking (all optional) | rfp-case-manager (workflow), rfp-response-analysis (post-submission); produces the scoring scale/requirements grid evaluation-engine applies (see Stage 1c reconciliation) |
| rfp-response-analysis | rfp-engine (requirements matrix), rfp-case-manager (case file, submissions) | evaluation-engine (formal scoring - proposed/preliminary only, see Stage 1a) |
| scope-sow-architect | rfp-engine (post-award SOW drafting), supplier-landscape, market-rate-benchmarking (rate context) - all optional/upstream | lilly-contract-review (legal-protection pass on the rewritten SOW), rfp-case-manager (case handoff when the SOW is part of an active case), market-rate-benchmarking (external rate comparison on the reconciled rate card). Note: it asks whether the WORK is well-defined; lilly-contract-review asks whether the DOCUMENT legally protects Lilly - complementary passes on the same SOW |
| should-cost-builder | market-rate-benchmarking (top-down market range), user spec/price, prior assumption ledgers | commercial-negotiation-prep (cost anchor for counter-offers), pro-forma-builder (cost basis), lilly-contract-review (commercial analysis) |
| sole-source-challenge | supplier-landscape (excluded_vendors.csv / supplier_registry.csv seed the alternatives register), market-rate-benchmarking / should-cost-builder (Price Validation Substitute evidence), supplier-deep-dive (dossier findings support the Unique Capability / Constraint Basis dimensions), process-navigator (mid-run threshold/policy lookup) | process-navigator (the sole_source_justification_handoff.json is the evidence its New-Supplier Governance widget checks as Filed), commercial-negotiation-prep (on a DEFENSIBLE verdict, the price-validation band becomes the negotiation anchor), executive-summary-package (verdict/evidence populate the ATC/ATS governance fields), rfp-engine / supplier-landscape (on a WEAK verdict, run the competitive process instead) |
| supplier-deep-dive | none stated | supplier-landscape (enriched entry), rfp-engine / rfp-response-analysis (advance supplier into RFx), evaluation-engine (risk + capability data as signal only, see Stage 1a boundary), category-strategy (supplier-of-interest) |
| supplier-landscape | none stated | supplier-deep-dive (single-supplier follow-up), rfp-engine (shortlist via landscape_handoff.json; market context enriches the Background section - note: this handoff does not include a requirements grid, see rfp-engine's own requirements-grid workflow added in Stage 1b) |
| theos-field-guide | none stated in its own text (other skills state they call it, but that is their text, not its own) | voice-profile, process-navigator, timeline-builder, supplier-deep-dive (full canonical profile), rfp-case-manager (informational link only) |
| timeline-builder | theos-field-guide (status-request compose flow), process-navigator (prerequisite questions feeding factor extraction) | voice-profile (drafts a status email from the estimate) |
| voice-profile | none stated as a predecessor | opt-in drafting service for executive-summary-package, rfp-engine (invitation/award emails), commercial/legal-negotiation-prep (talking points), lilly-contract-review (SME escalation emails, opt-in) |
| workflow-map | theos-field-guide, rfp-case-manager (Initialize and Refresh workflows) | process-navigator (which phases/reviews apply), timeline-builder (duration labels), theos-field-guide / rfp-case-manager (stakeholder roster, read-only) |

## Known open items reflected as-is (not silently resolved here)

- **supplier-landscape -> rfp-engine handoff has no requirements grid.** Confirmed gap
  from the design audit; partially addressed in Stage 1b by adding a requirements-grid
  workflow step INSIDE rfp-engine itself (so rfp-engine builds the grid whether or not
  a landscape handoff preceded it). supplier-landscape's own handoff schema still does
  not carry a grid. Do not claim it does when routing.
- **rfp-engine / evaluation-engine scoring-matrix direction** was reconciled in Stage
  1c: rfp-engine builds and confirms criteria pre-response; evaluation-engine applies
  them post-response as the default source. Reflected above as the current, correct
  state.
- **Scoring authority** (evaluation-engine as sole owner of the official score and
  award recommendation, with rfp-response-analysis and supplier-deep-dive's own scores
  demoted to proposed/descriptive signal) was reconciled in Stage 1a. Reflected above
  as the current, correct state - when routing "next step after rfp-response-analysis"
  or "next step after supplier-deep-dive," present evaluation-engine's scoring as the
  official outcome, not theirs.

## What this file explicitly does not do

It does not invoke another skill as a function call - THEO still hands off one skill
at a time and steps aside, per its own Role statement. It surfaces the likely next
step(s) so the user isn't rediscovering the chain turn by turn; it does not run a
pipeline automatically. If a future capability allows sub-agent dispatch, this table
is written to be reusable as that dispatch data without a redesign, but nothing in
this file claims that capability today.
