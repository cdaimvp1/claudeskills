# Cross-check: SYNTHESIS.md findings vs the program/planning corpus

Read in full: PROGRAM-MASTER-PLAN.md, MASTER-REMAINING-WORK.md, docs/master-plan.md,
ARIA-BUILD-PLAN.md, PLATFORM-CONSOLIDATION-TRACKER.md,
CONVERGED-DASHBOARD-OPERATING-RULES.md,
_redesign_proposals/DASHBOARD-ARCHITECTURE-DECISION.md, OVERNIGHT-DECISIONS-NEEDED.md,
docs/OVERNIGHT-BUILD-TRACKER.md, docs/theo-redesign-plan.md.

Method: evidence over impression. UNKNOWN where the corpus doesn't say. No em dashes.

---

## F1 — Kernel-shaped prose arithmetic (negotiation-playbook-learning, rfp-response-analysis
Bid Leveling, Protection Score x2)

**Verdict: MIXED — mostly ALREADY DECIDED/OPEN, one piece the corpus actively corrects.**

- **negotiation-playbook-learning kernel gap.** ALREADY KNOWN, OPEN. `PROGRAM-MASTER-PLAN.md:146`
  ("`[Marc]` #113 playbook-learning aggregate-stats kernel -> canonical `numeric_kernel.py`
  (shared-infra, care)") and `:175` ("A4 #113 ... GREEN LIT"). Sequenced in **WS8, Phase 4**
  (`PROGRAM-MASTER-PLAN.md:62,145-150`), i.e. deliberately late, after dashboards + cleanup +
  kernel-adoption-pass elsewhere. `docs/master-plan.md:126-136` records that a DIFFERENT kernel
  for this skill (the amendment-trigger evaluation) was built, tested, then **deliberately
  discarded** because it made an institutional claim from single-user data ("FAILS the test").
  That is not the same defect the audit names (Difficulty Score / 11-code composite / scaling
  bug) — the corpus's discarded kernel and the audit's flagged bug are different pieces of the
  same skill. Net: the corpus agrees a kernel gap exists here and has it queued (#113), but has
  not seen the specific scaling-overshoot bug the audit traced to the v2.1 changelog.

- **rfp-response-analysis Bid Leveling.** GENUINELY NEW. The corpus's RFx work (`ARIA-BUILD-PLAN.md`,
  `MASTER-REMAINING-WORK.md:115-260`) discusses a "Bid-Leveling Gate" only as a **dashboard panel**
  to promote/display, never as a prose-arithmetic defect gating the ranking. `docs/master-plan.md:40-64`
  (Stage 1a/1c) covers rfp-response-analysis's scoring-ownership dispute with evaluation-engine, not
  the Bid Leveling price-normalization math itself. No document names this as a kernel gap.

- **Protection Score (lilly-contract-review + lilly-brand-assets).** ALREADY DECIDED / ALREADY
  KNOWN, OPEN, and the corpus **actively corrects a mis-diagnosis of the same shape of finding**.
  `PLATFORM-CONSOLIDATION-TRACKER.md:172`: *"CORRECTNESS FLAG — contract-review Protection Score:
  the audit said 'wire it to weighted_score()' but that is MIS-DIAGNOSED — the Protection Score is
  a DEDUCTION model (start 100, subtract severity x coverage-column deductions, hard-stops not
  reduced), NOT a weighted average... Real enhancement = a deterministic `deduction_score()` kernel
  fn; but contract-review is the sensitive skill we agreed NOT to casually modify (B4). HOLD for
  explicit Marc go."* This is GREEN LIT as **#114** (`PROGRAM-MASTER-PLAN.md:148,173`: "contract-review
  Protection-Score deduction-kernel: GREEN LIT — also evaluate ... deterministic deduction vs
  SEMANTIC vs heuristic") and held in **WS8** (sensitive, `[held]`). `docs/master-plan.md:157-161`
  independently confirms lilly-contract-review is "the ONE remaining PASS-the-test consumer NOT yet
  vendored/wired (sequenced deliberately last as the largest/most-companion file)." The current
  audit's finding does not repeat the old "weighted_score()" misdiagnosis, but also doesn't name the
  deduction shape — so it agrees with the corpus's conclusion (gap real, kernel missing) without
  contradicting it. Second inline copy in lilly-brand-assets is not separately named in the corpus.

## F2 — 3,383 lines of dead Python (should_cost_generator.py, market_rate_generator.py)

**Verdict: GENUINELY NEW as a "dead code" finding — the corpus's most recent status treats this
as an open TODO, not as already-built-and-unwired.**

`PLATFORM-CONSOLIDATION-TRACKER.md:171,145`: "File-generator gap (kernel math, no code-generated
file): should-cost (xlsx), market-rate (xlsx)..." listed under "P3 — file generators" as **#104**
and **#105**, open build tasks as of 2026-07-23, with pro-forma's generator named as "the P3
template." Nothing in any tracker records these two generators as completed. If the audit found
1,763- and 1,620-line finished `.py` files sitting unreferenced, that build happened in a session
this corpus does not capture the outcome of, or the wiring step that pro-forma got was silently
skipped for its two siblings. Either way: **the corpus does not know these files exist unwired.**
This is the one finding with no planning-corpus counterpart at all — flag as a real discovery, not
a rediscovery.

## F3 — Slice contracts (1 of 31, deal-tab only)

**Verdict: ALREADY KNOWN, OPEN, agrees with audit, already sequenced.**

`PROGRAM-MASTER-PLAN.md:110` (WS3 item 3): "author a 'hub contribution / output slice' section
into each lens skill and strip 'build your own dashboard' instructions." `MASTER-REMAINING-WORK.md:320`:
"`[Marc, after D0-D2]` **dashboardData SLICE CONTRACT** — author 'Deal-tab hub contribution — output
slice' into each lens skill's SKILL.md: contract-review owns `issues[]`/... ; scope-sow owns
`scope{}`+... ; pro-forma owns `commercialLines[]`/... Strip competing 'build your own dashboard'
instructions. (= the 'skill-alignment spec'; sequenced after dashboards per Marc)." Sequencing:
**WS3, Phase 2**, after the five hub dashboards lock (`PROGRAM-MASTER-PLAN.md:41-56`). Matches the
audit's finding exactly (deal-tab is the only one with a contract today) and its own recommended
fix, already planned and already ordered.

## F4 — category-strategy teaches the retired JSX-clone pattern, 11 tabs vs 5 locked

**Verdict: ALREADY KNOWN, OPEN. Agrees with audit; the retirement of exactly this pattern is a
named, locked, and explicitly sequenced cleanup task not yet executed on category-strategy's
SKILL.md.**

`_redesign_proposals/DASHBOARD-ARCHITECTURE-DECISION.md:1-16` (LOCKED 2026-07-25): "The per-skill
inlined 'reference JSX' ... is RETIRED. Those were an earlier way to force a specific output before
the deterministic build existed." Line 38: "Category Strategy | (to build) | Build ONCE = the
workflow's 7-tab draft, put on the shared shell + made data-driven. Lock it. category-strategy
carries it; model authors data." `PROGRAM-MASTER-PLAN.md:96-104` (**WS3a, Skills file CLEANUP**,
sequenced in Phase 2, *before* WS3 and explicitly *before* ARIA): "Remove retired reference-JSX
dashboards (the per-skill React examples superseded by the deterministic-dashboard architecture)
once each hub carries its locked dashboard." `MASTER-REMAINING-WORK.md:12-15` confirms Category
Strategy's dashboard is now locked (2026-07-29, 5 tabs / 7 subtabs, tag
`category-strategy-locked-2026-07-29`) — so the hub now exists and WS3a's trigger condition is met;
the SKILL.md itself (11-tab JSX-clone spec) is exactly the stale content WS3a exists to strip, and
it has not yet been run on this file. The corpus also shows the tab-count history (11 -> 7 -> 5,
`docs/master-plan.md:204-214`, `MASTER-REMAINING-WORK.md:144-152`), so "11 tabs" in the SKILL.md is
a known-stale number, not a surprise. Net: audit's finding is correct, tracked, and its fix
(WS3a) is a named, locked, not-yet-run task.

## F5 — Slowness has four mechanisms, not instruction-file size

**Verdict: MIXED. The general principle (perf as a usability factor, not raw file size) is a
locked cross-cutting mandate (CC2); the four SPECIFIC mechanisms the audit names are GENUINELY
NEW — no document identifies multi-pass reopens, per-item unbatched loops, uncapped per-line web
search, or model-assembled documents as the cost driver.**

`PROGRAM-MASTER-PLAN.md:27-31` (CC2, locked, Marc 2026-07-26): "Efficient deep research +
performance as a usability factor... Treat speed / quality / depth as balanced usability factors:
recall-don't-recompute (materialized artifacts), right-effort-per-task, right-model-for-task,
works on Desktop default/Sonnet without burning usage. No needless heavy recompute." This already
rejects "trim the instruction file" as the fix and points at the same class of remedy the audit
implies (batch, cap, materialize) — but at the mandate level, not diagnosed per-mechanism. No
tracker names contract-review's 4-pass reopens, invoice-rate-card-auditor's per-line kernel calls,
the 3 web-research-heavy skills' uncapped search counts, or "documents assembled token by token" as
the actual slowness source. CC2 is scheduled to be **verified/retrofitted in WS3** (Phase 2,
`PROGRAM-MASTER-PLAN.md:20,113`) — so there is a home for this finding, but the finding itself is new.

## F6 — procurement-help-desk is an inert scaffold

**Verdict: ALREADY KNOWN, OPEN, matches almost exactly, already has an assigned but undecided
fork.**

`docs/master-plan.md:248-311` (Stage 7) built it as a deliberate offline scaffold: "**BUILDABLE
OFFLINE NOW... NETWORK-GATED STEPS**" and confirms `:394-399` "Stage 7: end-user help-desk scaffold
DONE 2026-07-22 ... 6 network-gated harvest steps marked TODO (zero fabricated Lilly content)."
`MASTER-REMAINING-WORK.md:347`: "`[blocked]` Help-desk network-gated harvest ... (offline now)."
`PROGRAM-MASTER-PLAN.md:133-136` (WS6, `[Marc]` + `[blocked]`): "Decide: procurement-help-desk as a
sibling skill vs fold into process-navigator as a second mode" then "Run the 6 network-gated
harvest steps." `MASTER-REMAINING-WORK.md:172` (A3, Marc 2026-07-26): "Lean MERGE into
process-navigator (one skill)... Leave help-desk AS-IS for now; finalize at Phase 3/WS6." So the
"undecided fork" the audit surfaces is the SAME fork already recorded, with Marc's current lean
(merge) recorded but not finalized, and finalization deliberately deferred to WS6/Phase 3, gated on
Lilly-network access exactly as the audit says.

## F7 — Orchestration: new skill vs expanded THEO; timeline-builder as template; stale
case-handoff-schema

**Verdict: THE AUDIT'S HEADLINE RECOMMENDATION CONTRADICTS A LOCKED DECISION.** The rest is mixed
(routing infra = already known-good; timeline-builder-as-template and the stale schema = genuinely
new).

- **Contradiction.** The audit recommends *"a new dedicated orchestration skill, not an expanded
  THEO."* The corpus's explicit, worked plan is the opposite and has already shipped a first pass
  under this framing. `docs/theo-redesign-plan.md` is titled *"THEO (procurement-launcher)
  redesign plan"* and states at `docs/master-plan.md:312-345` (Stage 8, the capstone before ARIA):
  *"This is the MATURATION of procurement-launcher (THEO), NOT a new skill."* Line 405-407 records
  it as **DONE 2026-07-22**: "THEO/procurement-launcher matured into a guided orchestrator
  (free-text intent -> full ordered path -> primed step-by-step handoffs...)." `PROGRAM-MASTER-PLAN.md:117-124`
  (WS4, Phase 3) continues the same framing: "#108 Rebuild Theo as a true conversational intake
  (diagnose -> recommend -> confirm -> hand off); retire the static menu-as-default" — still an
  evolution of the THEO skill, not a new sibling. The audit's own evidence for its recommendation
  (THEO "self-describes as a dispatcher, not an orchestrator... deliberately kept context-light")
  is real (`docs/theo-redesign-plan.md:20-30` makes the same "cannot call or run other skills"
  observation) but the corpus's answer to that constraint was to mature THEO's guided-handoff role
  within its existing bounds (never claiming auto-dispatch, `docs/theo-redesign-plan.md:144-151`),
  not to spin out a second orchestration skill. Marc should be shown this conflict explicitly
  before any orchestration work proceeds under either name.

- **Routing is in good shape.** ALREADY KNOWN, agrees. `docs/master-plan.md:504-518` (Stage 3) built
  `routing-and-chains.md` from a full 26/31-skill Consumes/Feeds compilation; `PROGRAM-MASTER-PLAN.md:121`
  confirms it "already maps 33 skills (predecessor/successor) + 7 named journeys, no-fabrication."
  Remaining refinement is tracked, not undiscovered: `PROGRAM-MASTER-PLAN.md:118-123` (#109 top-3
  context-ranked handoffs, #110 collapse to one JSON manifest, cross-session journey state after hubs).

- **timeline-builder's state file as the orchestration template.** GENUINELY NEW. The corpus
  documents `timeline_calibration.json` / `timeline_engine.py` only as a numeric kernel
  (`docs/master-plan.md:137-142`, 21/21 tests), never as a candidate pattern for orchestration
  state-persistence. No document connects it to THEO/orchestration design.

- **Stale case-handoff-schema.md drift (rfp-engine vs rfp-case-manager).** GENUINELY NEW. No
  tracker or plan names this file or this specific drift.

---

## What the audit missed entirely (major)

1. **A locked, suite-wide architectural decision the audit's own F3/F4 sit inside, without citing
   it.** `_redesign_proposals/DASHBOARD-ARCHITECTURE-DECISION.md` (LOCKED 2026-07-25): exactly ONE
   deterministic, locked dashboard per hub, carried inside the skill; the model authors ONLY the
   data object; all per-skill reference-JSX is RETIRED suite-wide, not just for category-strategy.
   This is the single biggest piece of missing context: F3 (slice contracts) and F4 (category-strategy's
   retired pattern) are both downstream symptoms of this one decision still propagating through the
   remaining skills. The corpus's own program sequence (`DASHBOARD-ARCHITECTURE-DECISION.md:47-56`,
   `PROGRAM-MASTER-PLAN.md:96-104` WS3a) is the actual fix vehicle for both, already scheduled.

2. **A prior decision that directly answers F2 and half of F5.** `docs/master-plan.md:182-198`
   ("Dashboard-as-code, new workstream... rather than an LLM hand-writing JSX/PPTX fresh every run
   ... move to a pattern where Claude gathers data and makes the analytical judgment calls, and a
   deterministic template script mechanically renders the validated data object") is the corpus's
   own diagnosis of "model-assembled documents" as a cost/quality problem, with `rfp-engine`'s
   `lilly_rfx_template.js` and `pro_forma_generator.py` named as the working precedent to extend to
   the rest of the suite. `ARIA-BUILD-PLAN.md` extends this further with `aria_procurement_build_dashboard`
   as a shared deterministic-assembly tool. The audit's F2 (two orphaned generators) and F5's
   mechanism #4 (model-assembled documents) are exactly the gap this workstream exists to close,
   and the audit does not connect either finding to it.

3. **Marc's approved phase order may put the audit's own "recommended order" out of sequence.**
   `PROGRAM-MASTER-PLAN.md:41-70` locks a 5-phase, WS0-WS9 sequence: dashboards first (Phase 1),
   THEN a skills-file cleanup pass (WS3a) and skills review/enhancement (WS3, Phase 2) — which is
   where kernel adoption, generator-wiring, and CC1-CC3 verification are explicitly homed — THEN
   conversational/orchestration (Phase 3), THEN foundation/release and the cross-cut scoring layer
   + remaining kernels (WS8, Phase 4, `[held]`/`[Marc]`, deliberately LATE), THEN ARIA last (Phase 5).
   The audit's "recommended order" (wire dead generators first, then handoff-schema fix, then kernel
   adoption, then category-strategy rehome, then slowness, then orchestration/slice-contracts last)
   broadly rhymes with WS3a -> WS3 -> WS4, but never states it is reconciling against the
   already-approved phase order, and the audit is silent on the dashboards-first gate: per
   `MASTER-REMAINING-WORK.md:12-25`, the corpus is still mid-Phase-1 (rfx-hub, Deep Dive, My Work
   dashboards not yet built) — none of the audit's Stage-2-shaped fixes are supposed to start until
   that finishes, per Marc's own locked sequencing.

4. **Cost/runtime constraint already exists as a hard rule, not just a design nicety.** Beyond CC2
   (finding F5 above), the user's standing memory rule ("Skills Desktop-usage-EFFICIENT (HARD)":
   skills must not require Opus or burn usage, must work on Sonnet, recall-not-recompute) and
   `ARIA-BUILD-PLAN.md`'s repeated "works on Desktop default/Sonnet" framing are a harder constraint
   on any slowness fix than the audit's framing suggests — a fix that adds LLM calls (e.g. more
   passes for verification) would itself need to clear this bar.

5. **#102 cross-cut scoring layer, GREEN LIT but deliberately DEFERRED, is directly relevant to F1's
   Protection Score gap and is not mentioned by the audit.** `PROGRAM-MASTER-PLAN.md:150,176`: "one
   shared scoring/ranking engine so a score/tier means the same thing across skills... sequenced
   AFTER the per-skill kernels ... + the cleanup. Must be done, just late." Any kernel work the audit
   recommends for Protection Score should be read against this eventual convergence, not treated as
   the final shape.

6. **ARIA's kernel-governance model (generate, never hand-copy) is the corpus's answer to future
   kernel drift**, which is adjacent to F1's "kernel missing a function" framing.
   `ARIA-BUILD-PLAN.md:351-361` (Section 7): plugin tools are generated from the canonical kernel
   modules with a CI parity test, never hand-copied, specifically to prevent the kind of divergence
   the audit is implicitly worried about when it flags prose-computed duplicates of kernel-shaped
   math. This is future-facing (WS9, last) but shows the corpus already has a considered position
   on divergence risk that the audit doesn't reference.

---

## Confidence notes

- All quotes above are verified against the files as read in this session; none are paraphrased
  from memory.
- Where the corpus's status may be stale (F2 in particular — the corpus's most recent read shows
  should-cost/market-rate generators as still-open TODOs #104/#105, while the audit found them
  built), that discrepancy is called out explicitly rather than resolved, since resolving it
  requires checking file timestamps/git history outside this task's scope.
- No file in this task was written to other than this one.
