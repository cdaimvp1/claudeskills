# Master plan - Lilly Procurement Skills Suite, July 2026 update

Working directory: this folder. Plain-folder versioning, no git (confirmed - git is
not installed on this machine). Baseline: the v10.6.6 bundle (ARIA + G10), copied in
verbatim; see `_BASELINE_MANIFEST.md` for a SHA256 of every skill's original
SKILL.md to verify against.

## The rule that governs every workstream below

A large amount of deliberate work went into this suite's dashboards: consistent
component libraries, locked canonical tab structures, per-panel depth requirements
enforced by G7/G8/G9, and multi-pass workflows specifically designed so depth cannot
be skipped under time pressure. None of the work below is about that content being
wrong. It is about where large reference/methodology blocks are LOADED FROM and
WHEN, and about a small number of genuine logic defects (duplicated scoring
ownership, missing gates, prose-only decision tables) found independently of the
dashboard design work.

**Operating rule:** any time analytical content, a dashboard spec, a worked example,
or a pass-gate definition moves from inline-in-SKILL.md into a companion file, the
move is a byte-for-byte relocation, verified by diff against the baseline manifest,
never a rewrite. If a genuine content change is needed (fixing a duplicated-scoring
defect, adding a missing gate), that change is called out explicitly as a content
change, separately from any relocation happening in the same pass, so it is never
possible to mistake "we moved this" for "we also quietly edited this."

## Sequencing

### Stage 0 - done
- Working folder seeded with the full v10.6.6 bundle, baseline manifest with SHA256
  hashes written for every skill's SKILL.md.
- THEO redesign plan drafted (`docs/theo-redesign-plan.md`) - a companion-file split
  for load speed, plus a chain-aware routing/decision layer, kept as THEO's own data,
  not lilly-brand-assets.

### Stage 1 - highest-impact, do first
These two are coupled (both touch the RFx pipeline's scoring/handoff seam) and were
the most consequential findings across the whole review.

**1a. Resolve duplicated scoring ownership.** supplier-deep-dive, rfp-response-
analysis, and evaluation-engine each independently compute a fit/adequacy score over
the same suppliers today; evaluation-engine runs a 3-mode arbitration system
(Trusted/Reference/Disabled) specifically to cope with this. Decision needed: which
skill owns scoring (evaluation-engine is the natural owner, since it is the one built
for award defensibility). The other two become descriptive-signal-only. This is a
content change to those 3 skills' own text (their Boundaries/Integration sections
already claim single ownership in places and contradict it elsewhere - the fix
reconciles stated boundary with actual behavior, it does not invent new boundaries).

**1b. Build the requirements-grid capability.** Confirmed gap: rfp-engine's own text
expects a requirements matrix as an input but nothing upstream produces one as a
structured, requirement-ID'd, weighted artifact; supplier-landscape's handoff carries
market context but no grid. Recommend building this as a workflow addition to
rfp-engine itself (a first step that elicits and structures requirements before
package generation) rather than a 27th skill, since rfp-engine already owns "build
the requirements matrix" as a stated deliverable - it currently just does it from a
cold start every time instead of from a structured intake.

**1c. Reconcile the rfp-engine / evaluation-engine criteria-ownership contradiction.**
rfp-engine's text says it produces the scoring scale evaluation-engine consumes;
evaluation-engine's chain-position table lists rfp-engine as upstream, never the
reverse - but evaluation-engine's own workflow also independently builds scoring
matrices. Needs one canonical direction stated in both files' own text.

### Stage 2 - foundation cleanup (pays off for every other skill)
**lilly-brand-assets split.** 79% of its 231KB is the human-facing user manual,
bundled into the same file all 25 dependent skills load just to reach G1-G10
enforcement content. Per your correction, this file's scope should be branding and
design references only. Move:
- The user manual -> its own companion (still generated on demand as a branded DOCX,
  per the skill's existing "generate the manual" capability - that capability moves
  with the content, unchanged).
- The optional ARIA enrichment block -> stays a companion (it already mostly is).
- What remains inline: brand colors, dashboard component library, DOCX design
  system, execution guardrails (G1-G10), scoring scales, SME matrix, risk scoring,
  house styles, narrative standards, supplier-risk - i.e., the things every skill
  actually needs to read for enforcement on every run.
This is the highest-leverage single change in the whole plan because it reduces
what all 25 dependent skills carry into context, not just one skill's own footprint.

### Stage 3 - THEO redesign
Per `docs/theo-redesign-plan.md`: companion-file split for teach-mode and the widget
(load-speed fix), plus the chain-aware routing/decision layer (the real orchestration
upgrade), with the routing/chain data living inside procurement-launcher itself.
Recommend shipping the companion-file split alone first (pure relocation, lowest
risk) before the routing-logic change (which needs test invocations to confirm
existing trigger phrases still route correctly).

### Stage 4 - numeric kernel (from the Phase 1 kernel assessment, UPDATED)
**Architecture decision, confirmed with the user before Stage 4 began (supersedes the
original Phase-1 assessment's "lives in lilly-brand-assets" recommendation, which
predates the user's branding-only correction to that skill's scope):**
- **Kernel home: a new dedicated foundation skill**, not lilly-brand-assets. Holds the
  Python modules and versioned JSON reference tables; vendored into each consuming
  skill. Mirrors the same separation already applied to the manual (Stage 2) and the
  routing table (Stage 3) - lilly-brand-assets stays branding/design references only.
- **Guardrail label: new G11**, not folded into G9. G9 already has a specific meaning
  (anti-collapse for multi-pass workflow skipping); this is a distinct failure class
  (prose arithmetic substituting for a deterministic kernel), and a separate label
  keeps future "does this skill honor G_" audits unambiguous.

The original numeric-kernel build order stands: shared kernel first, then
market-rate-benchmarking and negotiation-playbook-learning (smallest surface,
named shipped bugs), should-cost-builder, pro-forma-builder, evaluation-engine +
rfp-response-analysis together (paired because of the Stage 1a scoring-ownership
fix), commercial-negotiation-prep, lilly-contract-review last (largest file,
most companions, most care needed). timeline-builder's dedicated kernel can run in
parallel with any of the above, since it has no shared-kernel dependency.

Two non-numeric decision-kernel candidates surfaced by the design audits, evaluated
against a single test confirmed with the user during Stage 4: **a kernel is right
when it protects a single user's own output from wrong arithmetic or a wrong
lookup; it is wrong when it would compute or recommend something that only means
something in aggregate, across people or over time, which one Claude Desktop
session has no legitimate way to observe.**

- executive-summary-package's FRAP chain-construction rule (ATC/ATS ceiling and
  start-grade lookup) - PASSES the test (this user's own approval-chain arithmetic
  for the deal in front of them). Built and tested (`frap_chain_kernel.py`, 9/9
  tests pass). Given a live-fetch-first, vendored-fallback layer per the user's
  correction below (SharePoint FRAP tables go stale/superseded; only the exact
  named page is safe to trust). WIRED 2026-07-21 into executive-summary-package/
  SKILL.md L408-412 (calls compute_chain(); live-fetch-first, vendored-fallback,
  refuse-on-ambiguous-provenance). Confirmed by independent full-suite audit
  2026-07-21 (tests re-run 9/9, wiring re-checked).
- negotiation-playbook-learning's amendment-trigger evaluation - FAILS the test.
  User correctly identified that "recommend fallback as new standard" is an
  institutional claim (the skill's own Role text says "generate evidence-based
  recommendations that make Lilly's playbook positions smarter... turning
  individual experience into institutional intelligence") built from one person's
  own logged negotiation history, with no aggregation across reps and no shared
  dataset - a platform-scale claim from single-user data. **Discarded entirely**
  (`amendment_trigger_kernel.py` and its MAINTENANCE.md deleted). The skill's own
  SKILL.md prose still contains this language; not yet revisited, flagged for a
  later pass if the user wants the prose itself softened to personal-advisory
  framing.
- timeline-builder's critical-path engine - PASSES the test (this user's own
  timeline estimate, not a cross-user claim). Built and tested
  (`timeline_engine.py`, 21/21 tests pass, reproduces the file's own worked
  example exactly and the regression case for the shipped 3-6x inflation bug).
  WIRED 2026-07-21 into timeline-builder/SKILL.md L506 (Rule 10, calls
  compute_timeline()). Confirmed by independent audit 2026-07-21.

**Kernel-worthy candidates confirmed by re-running every remaining numeric
candidate through the same pass/fail test (user asked for this sweep explicitly):**
pro-forma-builder, should-cost-builder, market-rate-benchmarking, evaluation-engine,
rfp-response-analysis, commercial-negotiation-prep, and lilly-contract-review's
arithmetic-verification checks all PASS (each is correctness on the specific
deal/document/RFx the user is looking at right now, not an aggregate claim). All
are covered by the shared numeric kernel (`numeric_kernel.py`, built and tested,
24/24 tests pass - see `lilly-procurement-kernels-1c344a/`). WIRED 2026-07-21:
six of the seven are now vendored + wired via explicit HARD-RULE calls -
commercial-negotiation-prep (L459, escalate()), evaluation-engine (L536,
weighted_score()), market-rate-benchmarking (L185/L1026, percentile_gate()/
weighted_score()), pro-forma-builder (L206, npv()/escalate()), rfp-response-
analysis (L343, weighted_score()), should-cost-builder (L200, quadrature_rollup()).
lilly-contract-review is the ONE remaining PASS-the-test consumer NOT yet
vendored/wired (sequenced deliberately last as the largest/most-companion file;
see the Stage-4 build order above and the deliverables checklist). Confirmed by
independent audit 2026-07-21 (all six vendored bodies byte-identical to canonical;
wiring re-checked).

**SharePoint sources named by the user during Stage 4 (do not lose track of
these):**
1. FRAP thresholds: `https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/SitePages/FRAP---Procurement-Transactions.aspx`
   - wired into `frap_chain_kernel.py`'s live-fetch layer (see above).
2. Global Procurement Playbook 2.0 site root: `https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/`
   - user: "hundreds of SharePoint pages" of procurement knowledge live here.
   - DONE (verified 2026-07-21): process-navigator-1c344a/SKILL.md already names
     this site as a canonical source (Playbook 2.0 landing page, L100). No change
     needed.
3. BuyLilly site: `https://collab.lilly.com/sites/Buylilly`
   - user: "the majority of the help that our stakeholders would need" - supplier
     onboarding/creation, invoice status, PO open/close, and more.
   - DONE (verified 2026-07-21): process-navigator-1c344a/SKILL.md already names
     BuyLilly as a canonical source (L103, exact URL match), alongside Playbook 2.0,
     the Global Following FRAP PDF, and ProtectLilly, each with per-source
     retrieval-failure handling. No change needed; both site checks are complete.
     (Live invoice-status / PO-state LOOKUPS remain out of scope - they need
     Ariba/LEAH system access the M365 connector cannot reach, not a doc fix.)

**Dashboard-as-code (new workstream, added by the user mid-Stage-4, slots into
Stage 5 per prior agreement):** rather than an LLM hand-writing JSX/PPTX fresh
every run (the mechanism behind the category-strategy truncation incident), move
to a pattern where Claude gathers data and makes the analytical judgment calls,
and a deterministic template script mechanically renders the validated data object
into the dashboard/deck structure. Precedent already exists in the suite:
rfp-engine ships `assets/lilly_rfx_template.js`, a real generator script, not just
a static reference example. Requires reading every dashboard-producing skill
closely to determine which already have a generator-shaped precedent to extend
and which only have a static `.jsx` reference file to imitate (the latter is the
riskier case and the more common one). Candidate list to review: category-strategy,
decision-deck, evaluation-engine, rfp-response-analysis, supplier-landscape,
supplier-deep-dive, pro-forma-builder, market-rate-benchmarking,
executive-summary-package, lilly-contract-review. This is a design task before
it is a build task - do not start writing generator scripts before the per-skill
review identifies what each skill's dashboard actually needs and where the data
model currently lives (or doesn't).

### Stage 5 - large-monolith splits (highest content-preservation risk, most scrutiny)
Two candidates, both needing the byte-diff verification rule applied with extra
care since these are the skills carrying the dashboard depth you flagged:

**category-strategy.** Confirmed root cause of the documented truncation incident:
78% of its 207KB is generic reference/ingestion/methodology material (SHARP/SAP
column mapping, Kraljic framework text, generic savings-classification rules), not
dashboard code (the dashboard JSX is only ~10% of the file). Split the reference
material into conditionally-loaded companions the way lilly-contract-review already
does, so the G10 chunked-write discipline this file already specifies has less
irrelevant material to survive before reaching the write step it protects. The
dashboard JSX, the locked 11-tab canonical spec, and the CS_1/CS_2/CS_3 pass-gate
definitions do NOT move as reference material - they stay exactly where the split
plan calls for the actively-used-every-run content to remain, or move only under the
byte-diff rule if relocated at all.

**decision-deck.** Two distinct jobs glued together (narrative/story-consulting vs.
mechanical PPTX-rendering), evidenced by the skill's own fallback design (the
story half already functions independently when code execution is unavailable).
Also retains actively superseded content (an old color palette, old font/sizing
guidance) that the model must consciously suppress rather than simply not encounter -
this is a content deletion of dead/retired material, not a relocation, and should be
called out to you explicitly before it happens since "delete this, it says not to
use it" still touches a file with real design history in it.

### Stage 6 - remaining per-skill fixes (long tail, lower individual impact)
Gate-check additions (commercial-negotiation-prep has zero anywhere in its 9-phase
workflow; legal-negotiation-prep has one of the four it likely needs; supplier-deep-
dive has one of four workflow steps named), a small number of additional non-numeric
decision-kernel candidates (legal-negotiation-prep's tier-assignment tree,
comment-cleanup's audience-strip matrix, workflow-map's roster-source cascade), and
the comment-cleanup "Finalize for Execution" split (a materially higher-stakes job
currently hidden inside a lower-stakes skill). None of these are urgent; sequence
them opportunistically once Stages 1-5 are done.

### Explicitly out of scope for now
- Renewal/expiry/SRM tracking - confirmed missing from the suite, but you do not
  currently have access to the data needed to design it effectively. Not being
  designed blind; revisit when the data situation changes.
- process-navigator's threshold-evaluator kernel - previously flagged as a Phase-5
  "recommend, don't build without sign-off" item; still gated on your call, not
  re-opened here.
- rfp-engine's "light" numeric work - the original kernel assessment's hypothesis
  that rfp-engine needed numeric-kernel work did not hold up under inspection (its
  pricing content is template structure, consumed by evaluation-engine/rfp-response-
  analysis for actual scoring, not resident computation); no action needed there
  beyond whatever Stage 1b's requirements-grid work naturally touches.

### Stage 7 - end-user procurement help-desk skill (NEW; network-gated build, added 2026-07-21)

User goal: an "advanced chatbot" that answers basic questions from Lilly END USERS /
stakeholders (not the procurement rep) - how to do a thing, what to do, when, where to
go, who to contact - grounded in the named SharePoint sources, which ALSO serve as a
reference corpus for deeper understanding of how Lilly does procurement/sourcing.

RELATIONSHIP TO process-navigator (must reconcile before build): process-navigator
ALREADY live-reads all four sources (Playbook 2.0, BuyLilly, Global Following FRAP,
ProtectLilly) and answers process/threshold/system-requirement questions. It is framed
for the procurement REP. Recommendation: build this as a NEW end-user-facing SIBLING
skill that REUSES process-navigator's live-fetch-first source machinery, with a strict
BOUNDARY guard both directions:
- process-navigator = procurement-rep policy/threshold/"do I need TPRM/SAE/AIR" Q&A.
- new help-desk = stakeholder transactional "how do I get this done" (onboard/create a
  supplier, check an invoice's status, open/close a PO, where to start a buy, which
  form/system, who to contact), BuyLilly-primary.
They share the four sources but serve different users and question types. ALTERNATIVE
(user's call): fold this into process-navigator as a second, end-user mode instead of a
new skill. Decide before building the file.

BUILDABLE OFFLINE NOW (no Lilly network needed) - the scaffold:
- Frontmatter + end-user trigger phrases ("how do I onboard a supplier", "how do I
  check an invoice status", "how do I open/close a PO", "where do I start to buy X",
  "who do I contact for Y", "what's the process/form/system for Z").
- The live-fetch-first / vendored-fallback source pattern, mirroring the ALREADY-PROVEN
  suite pattern (process-navigator's policy live-read; the FRAP kernel; the Stage-2
  SharePoint-primary user manual): try the M365 SharePoint read of each named source
  first; on failure, fall back to a vendored snapshot; ALWAYS disclose source +
  confidence; ABSTAIN / never fabricate when unsourced (honors the suite's
  deterministic+semantic-primary, ground+cite+confidence rule).
- End-user intent taxonomy (how-to / where-to-go / who-to-contact / which-form /
  status-check / timing) mapped to the right source AND the right SYSTEM to act in
  (BuyLilly, Ariba, LEAH, Aravo) - ANSWER-ONLY, never taking the action itself.
- Cited, confidence-scored, step-by-step answer skeleton with a "where to go / which
  system / who to contact" block and a next-step handoff.
- Graceful degradation + G-guardrail alignment + the trigger-collision BOUNDARY note
  vs process-navigator.
- Explicit out-of-scope: it cannot PERFORM transactional actions (open a PO, submit an
  invoice); those need Ariba/LEAH/Aravo system access the M365 connector cannot reach.
  It is guidance-only ("go here to do it"), same limitation process-navigator already
  states.

>>> NETWORK-GATED STEPS - MUST BE DONE WHEN MARC IS ON CLAUDE WITHIN THE LILLY NETWORK
    (the scaffold above is inert until these run; I have NO access to the source
    material, so these cannot be done from this environment):
    1. Live-validate each source resolves via the M365 connector: Playbook 2.0
       (https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/), BuyLilly
       (https://collab.lilly.com/sites/Buylilly), the Global Following FRAP PDF, and
       ProtectLilly (on now.lilly.com - flagged as the one most likely to fail). Note
       whether folder-listing reads work as reliably as single-page reads.
    2. Harvest a CURATED vendored fallback snapshot/index of the key BuyLilly + Playbook
       pages (supplier onboarding/creation, invoice status, PO open/close, "how to start
       a buy", top stakeholder FAQs) into references/*.md WITH provenance + capture date,
       so the skill degrades gracefully offline like the user-manual/FRAP fallback.
    3. Build the "how Lilly does procurement/sourcing" reference corpus (operating model,
       roles, systems map, request-to-PO flow) from the real site content.
    4. Run an end-user question battery against the real pages; confirm every answer
       traces to a real, cited page; tune the intent taxonomy to what the sites actually
       cover.
    5. Confirm which questions are answer-only vs which reference actions needing
       Ariba/LEAH/Aravo, and route the latter as "go here to do it," never "I'll do it."
    6. Re-verify the ProtectLilly/now.lilly.com retrieval gap and set its fallback.

### Stage 8 - orchestration capstone: THEO as a guided workflow (do LAST, after the fixes)

User goal: a user says, in their own words, "@Theo, I need procurement help - I want to
buy software for X" (or "I need an AI tool that does X, Y, then Z"), and THEO understands
the intent, routes to the right FIRST skill, then leads them to the next right skill, and
the next - the suite runs like a guided workflow instead of a pile of skills the user has
to already know to invoke.

This is the MATURATION of procurement-launcher (THEO), NOT a new skill. The groundwork
already exists: THEO's routing table (26 skills / 7 pipelines) plus Stage 3's chain-aware
routing (references/routing-and-chains.md) already let it name a producing skill's stated
next step(s). This stage completes and hardens that into a genuine end-to-end guided path.

Two levels - be honest about which is achievable in stock Claude Desktop:
- GUIDED HANDOFF (achievable today, human-in-the-loop): THEO classifies the free-text
  need -> names the full path up front ("here's your path: supplier-landscape ->
  rfp-engine -> rfp-response-analysis -> evaluation-engine -> decision-deck") -> hands off
  to step 1 with primed context -> after each step, surfaces and primes the next. The user
  drives; THEO leads. This is largely what Stage 3 enabled; it needs completion + hardening.
- AUTO-DISPATCH (NOT possible in stock Claude Desktop today): THEO invoking the next skill
  as a sub-agent and auto-passing artifacts. Desktop hands off one skill at a time; there
  is no sub-agent spin-up. The chain data is deliberately structured (per the THEO redesign
  plan B6) so it can BECOME dispatch data later (e.g. if Cowork-style sub-agent execution
  becomes available) WITHOUT a redesign. Do not claim this capability today.

Why this is the CAPSTONE (must be last): the chain table must encode CORRECT handoffs.
Several fixes above change the real chains (requirements-grid gap closed in 1b, scoring
authority settled, the supplier-landscape / rfp-response defects). Orchestrating over a
suite that still contradicts itself would bake broken handoffs into the guide - the THEO
plan's own rule was "do not have the chain table quietly paper over a defect that is still
open elsewhere." So: fixes first, then re-derive the chain table from the corrected suite,
then harden THEO's intent -> path -> step-by-step guidance. Also fold in the audit's THEO
discoverability defects here (the 26-vs-24 count; the 2 skills stranded from the widget /
fallback menu) - a guide that cannot surface a skill cannot route to it.

## Deliverables checklist
- [x] Baseline seeded, manifest written (Stage 0)
- [x] THEO redesign plan drafted (Stage 0)
- [x] This master plan
- [x] Stage 1: scoring-ownership fix (rfp-response-analysis, evaluation-engine,
      supplier-deep-dive), requirements-grid capability (rfp-engine), criteria-ownership
      reconciliation (rfp-engine + evaluation-engine). See per-file changes below.
- [x] Stage 2: lilly-brand-assets split (user manual + ARIA enrichment extracted to
      companions, verified byte-identical by diff, all cross-references and framing
      text updated). See per-file changes below.
- [x] Stage 3: THEO companion split + chain-aware routing (includes a corrupted-file
      incident found and fixed mid-stage; see `_BASELINE_MANIFEST.md` Stage 3 log and
      `docs/stage3-test-trace.md`)
- [~] Stage 4: numeric + non-numeric kernels - kernels BUILT + TESTED (numeric
      24/24, timeline 21/21, FRAP 9/9, all re-verified 2026-07-21) and WIRED into
      8 consuming skills; amendment-trigger kernel correctly discarded; both
      SharePoint site checks DONE. (b) DONE 2026-07-21: G11 (Kernel-Backed
      Computation) added to lilly-brand-assets-1c344a/SKILL.md's inlined
      execution-guardrails section, in the same style/format as G1-G10, as the
      one canonical definition - "where a skill vendors a numeric/decision
      kernel, all covered arithmetic and lookups MUST be computed by calling
      that kernel, never by prose or model judgment; a figure produced without
      the kernel is invalid." Kept CONTAINED per the user's explicit scope
      instruction: this is not a G10-style suite-wide guardrail (G10 applies to
      any skill emitting a large artifact; G11 applies only to the kernel-
      consuming skills), so the per-skill inlined "G1-G10" summaries (e.g.
      negotiation-playbook-learning's "Suite-wide guardrails note, v8.2") were
      deliberately left unrenumbered rather than rewritten to "G1-G11" - those
      skills already enforce G11's behavior via their own existing kernel-wiring
      HARD RULE text (e.g. evaluation-engine's weighted_score() call). REMAINING
      for pickup: (a) vendor+wire numeric_kernel into lilly-contract-review (the
      deliberately-last 7th consumer); (c) wire or formally park
      pro_forma_generator.py (built, 15/15 tests, but UNWIRED - the session ended
      on an API budget cap mid-build); (d) hygiene: remove __pycache__/*.pyc (3
      files, 2 skills), standardize the 6 vendored-kernel provenance headers,
      reconcile the procurement-launcher manifest hash.
- [~] Stage 5: category-strategy split DONE 2026-07-22 (generic methodology -> 3 conditionally-
      loaded companions, byte-diff 3/3 IDENTICAL, SKILL.md 3851->2179 lines, JSX + 11-tab spec +
      CS gates intact, v4.4). decision-deck split + dead-content deletion DEFERRED (plan gates the
      deletion on Marc's explicit sign-off; sweep already fixed its content defects) - flagged in
      docs/OVERNIGHT-BUILD-TRACKER.md.
- [~] Stage 6: gate-checks DONE 2026-07-22 (commercial-negotiation-prep 0->8, legal-negotiation-prep
      1->5, supplier-deep-dive 1->4; suite gate style). comment-cleanup "Finalize for Execution"
      BOUNDED in-file (higher-stakes banner + Mode Selection; full extraction to its own skill
      flagged for Marc). Non-numeric decision kernels (legal tier-tree, comment-cleanup audience
      matrix, workflow-map roster cascade) DEFERRED per the plan's "recommend, don't build without
      sign-off."
- [x] Stage 7: end-user help-desk scaffold DONE 2026-07-22 - NEW procurement-help-desk-1c344a
      (SKILL.md + references/TODO-network-gated-harvest.md), SHARED-BLOCK byte-identical to
      process-navigator, BOUNDARY vs process-navigator, live-fetch-first pattern, intent taxonomy,
      6 network-gated harvest steps marked TODO (zero fabricated Lilly content). Built as a new
      SIBLING per this plan's own recommendation; the fold-into-process-navigator alternative is
      flagged inside the scaffold for Marc's call.
- [x] Critical-defect fixes DONE: C1-C6 fixed + verified; ~46 high-severity defects fixed (tasks
      #21-30); then the medium/low SWEEP (2026-07-22, 26 agents: 116 fixed, 68 already-fixed, 23
      wont-fix all legit) + suite-wide version/G10/mojibake hygiene. Post-sweep integrity CLEAN
      (32 skills valid YAML, desc<=1024, 0 em-dash/mojibake, all real JSX parse, kernel bodies
      byte-identical, PCC frozen keys intact).
- [x] Stage 8 (capstone) DONE 2026-07-22: THEO/procurement-launcher matured into a guided
      orchestrator (free-text intent -> full ordered path -> primed step-by-step handoffs along the
      corrected chains; guided-handoff only, auto-dispatch not claimed, chain data dispatch-ready).
      5 new skills added to widget/routing/fallback/teach-mode/chain-table; help-desk placed as a
      pending routing entry (not stranded); counts reconciled (29 routable + pending; 31-row chain
      table); every chain traced to a real stated handoff.
- [x] PACKAGED 2026-07-22: Lilly_Procurement_Skills_v10.6.6_July2026_Expansion.zip (working-folder
      root) - 32 installable .skill files (SKILL.md at each zip root) + README/INSTALL/manifest +
      regenerated clean v10.6.6 user-manual.docx + lilly-procurement-kernels as a maintainer
      reference folder (no SKILL.md). -1c344a suffixes preserved suite-wide (update-match key).
- [x] Personal Command Center (theos-field-guide) rebuilt data-object-first (2026-07-22).
      DEFERRED/flagged for Marc: decision-deck split+deletion; the 3 non-numeric decision kernels;
      help-desk new-skill-vs-extend decision; per-skill dashboard doc/deck previews (optional).

## Stage 1 - what actually changed

- `rfp-response-analysis-1c344a/SKILL.md`: Boundaries section, Rule 5, Section 13
  heading, and the Recommendation Rules now state its scores/rankings are proposed,
  evidence-cited starting points, not final. Locked 6-tab dashboard, all depth
  requirements, and every table/section structure unchanged (verified: line counts
  and the six canonical tab names checked post-edit).
- `evaluation-engine-1c344a/SKILL.md`: added an explicit Scoring Authority statement
  to the Role section naming it sole owner of the official score and award
  recommendation. Reworded the Scoring Matrix Source prompt so the rfp-engine-produced
  matrix is the stated default, not an equal alternative to building one from scratch.
- `supplier-deep-dive-1c344a/SKILL.md`: added a BOUNDARY statement to Cross-Skill
  Handoffs (mirrors the existing supplier-landscape boundary pattern) - its own
  verdict/score is primary in standalone use, descriptive signal only when feeding an
  RFx evaluation.
- `rfp-engine-1c344a/SKILL.md`: the "Requirements Document as Input" section's
  "if not provided" path now runs the same requirement-ID'd, weighted, user-confirmed
  grid construction the "if provided" path already produced, closing the asymmetry.
  Also added the reciprocal ownership-direction statement next to the existing
  evaluation-weight sanity check.

## Stage 2 - what actually changed

`lilly-brand-assets-1c344a/SKILL.md`: 2853 -> 1305 lines (54% reduction).
- Inlined user manual (1467 lines, was lines 1217-2683) extracted verbatim to
  `references/user-manual.md`. Verified byte-identical by diff BEFORE the original
  was removed (see `_BASELINE_MANIFEST.md` Stage 2 log).
- Duplicated inlined ARIA enrichment block (97 lines) removed; it was already
  shipping as `references/aria-enrichment.md` per the ARIA changelog, verified
  byte-identical by diff before removal.
- Both removals replaced with a pointer sentence explaining where the content now
  lives, never silently dropped.
- Updated the "References" section header and framing sentence (previously claimed
  every reference is inlined; now correctly states 2 of 15 load as companions).
- Updated "Producing the user manual as a branded document" instructions to read
  from the companion file instead of an inlined section.
- Updated the "INLINED REFERENCE FILES" divider sentence for the same reason.
- All 20 other skills' SHARED-BLOCK pointer text (which already used dual-path
  wording: "in the inlined bundle... in the un-inlined bundle...") required no
  changes - checked and confirmed still resolves correctly. procurement-launcher's
  own teach-mode text likewise already had correct dual-path wording.
- What did NOT move: brand colors, dashboard component library, DOCX design system,
  execution guardrails (G1-G10), scoring scales, SME matrix, risk scoring, house
  styles, narrative standards, supplier-risk - all still inlined exactly as before,
  since these are read by every skill on every run for enforcement purposes.

## Stage 2 addendum - SharePoint-primary manual (per user follow-up)

After the split above, the user asked whether the manual should be hosted on
SharePoint instead of only the local companion file. Decision: SharePoint-primary
with the local companion as fallback (mirrors process-navigator's existing
live-fetch-then-fallback pattern for Lilly policy content). Only
`lilly-brand-assets-1c344a/SKILL.md` changed; no other skill needed edits since they
all reference the manual generically through lilly-brand-assets.

- Canonical source: `https://collab.lilly.com/sites/TechLillyProcurement/Procurement
  Claude Skills/Forms/AllItems.aspx` (direct SharePoint library path, confirmed more
  reliable for the M365 connector than the share-link URL first offered).
- New "Reading the user manual" section added: try the SharePoint library via the
  M365 connector first; on success, use it and say once that it came from the live
  copy; on any failure (connector unavailable, not connected, fetch error), fall back
  to `references/user-manual.md` and say once it is the locally-shipped snapshot, not
  confirmed current.
- Explicit, stated limitation: the local fallback cannot self-update at runtime (it
  lives inside the packaged skill); keeping it current is a rebuild/redistribution
  concern, same as the ARIA layer's vendored snapshot.
- "Producing the user manual as a branded document" updated to read per this same
  order and to note on the generated document which source (SharePoint or local
  fallback) was actually used.
- The "References" section bullet and framing sentence updated to describe
  `user-manual.md` as SharePoint-primary rather than companion-file-only.

**Follow-up: library link vs. direct file link.** User asked whether to point at the
library folder or a direct link to today's dated manual file. Library link confirmed
correct: this suite's own convention (visible across the Desktop bundle history -
dated zip filenames added alongside old ones, never overwritten) is that a new upload
gets a new dated filename, so a direct link to today's file would go stale on the next
upload while the library link always sees what's current. Added a file-selection rule
to the read order: list the library, select the item whose name contains
"User_Manual" (most recently modified if more than one matches), never guess or
construct a filename. Unverified assumption to test live: whether the M365 connector
supports "list this folder and pick a match" as reliably as "fetch this one known
document" - folder-listing and single-document reads may not be equivalent
capabilities under the connector.

## Stage 3 - what actually changed

`procurement-launcher-1c344a/SKILL.md`: 704 -> 298 lines (58% reduction). Ran three
independent extraction/compilation tasks in parallel (per user instruction to
parallelize where possible), each separately verified before use:
- Teach mode section (186 lines) extracted verbatim to `references/teach-mode.md`,
  byte-diff verified against the baseline before the original was removed.
- Widget HTML body (261 lines) extracted verbatim to `assets/theo-widget.html`,
  byte-diff verified against the baseline before the original was removed (the
  extraction agent independently caught and fixed a trailing-newline discrepancy via
  its own diff, then re-verified - the correct process this stage's incident, below,
  should have followed from the start).
- A full 26-skill compilation of every stated Consumes/Feeds/Integration/
  Cross-Skill-Handoffs relationship, quote-sourced with no inferred relationships, used
  to author the new `references/routing-and-chains.md` companion.

SKILL.md itself was then edited to add a "Chain-aware routing" section (the actual
orchestration upgrade: THEO can now name a producing skill's stated next step(s) using
routing-and-chains.md, with a hard no-fabrication rule and explicit "hard gate first"
precedence so an explicit skill request is never overridden by a chain suggestion),
replace both extracted blocks with pointers, and add a companion-file-unreadable case
to Graceful Degradation. Full test-trace verification (static text-tracing against 15
scenarios covering ordinary routing, the two new companion-load paths, and chain
lookups including the critical "no fabrication when nothing is stated" case) is in
`docs/stage3-test-trace.md`, along with an explicit list of what this verification
does NOT cover (no live Claude Desktop run was possible) and a recommended smoke test.

**Incident, found and fixed within this stage:** the first attempt at removing the two
extracted blocks used an unsafe PowerShell encoding default that corrupted every
non-ASCII character in the whole file (not just the edited parts) into mojibake. Found
via direct byte-level inspection (not a visual skim), root-caused to a missing
explicit-UTF8 parameter, and fixed by rebuilding the entire file fresh from the
hash-verified original using correct byte-level UTF-8 handling throughout. A follow-up
sweep of all 58 markdown/HTML files across all 26 skills confirmed the corruption was
isolated to this one file and did not affect anything from Stage 1 or Stage 2. Full
detail in `_BASELINE_MANIFEST.md`'s Stage 3 log - read that before trusting this
summary's brevity, since an incident like this is exactly the kind of thing worth
checking rather than taking on faith.

## Before any of this goes into Claude Desktop (reminder, not yet done)

Everything in this working folder is plain files on disk; none of it is installed or
live anywhere yet. Claude Desktop only sees a skill after it is packaged back into a
`.skill` zip (matching the original bundle's own format) and re-installed/re-uploaded,
the same way the v10.6.6 bundle was originally installed. Before that packaging step,
plan to run one more full-suite integrity sweep (all 26 skills, not just the ones
touched by name) mirroring the check that caught this stage's incident, given that a
corruption bug of this kind is silent until someone looks for it byte-by-byte.

**RECONCILIATION 2026-07-21 (supersedes the italic line below).** An independent
full-suite audit (27 readers + 4 command-backed audits + adversarial verify) re-ran
every kernel test and re-checked every wiring. Verified state: Stage 4's kernel
builds and 8-skill wiring are DONE (numeric 24/24, timeline 21/21, FRAP 9/9,
pro_forma_generator 15/15; amendment-trigger correctly discarded; process-navigator
SharePoint checks already complete). The "NOT YET WIRED" / "none wired yet" notes
earlier in this plan were STALE - written before the wiring agents ran; the session
then ended on an API budget cap, so the plan was never reconciled. Remaining Stage-4
items are itemized in the deliverables-checklist Stage-4 row above. The audit also
surfaced 7 critical + ~46 high internal-consistency defects across the suite (dual
Protection-Score formula in lilly-contract-review, escalation-convention conflict in
pro-forma-builder, dual report structures in supplier-landscape, a dead-on-load
ReferenceError in theos-field-guide's dashboard engine, suite-wide version-stamp
drift, a G10 label-vs-content gap in ~13 skills, and surviving mojibake in 2
foundation files) - independent of Stage 4/5 and to be folded into the pre-packaging
sweep. Original note:

_"Awaiting your review before Stage 4 (numeric + non-numeric kernels) begins."_
