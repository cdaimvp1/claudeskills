# Trackers-C: skill-handoff cross-check against redesign/handoff/history docs

Cross-checks `_audit/SYNTHESIS.md` findings against skill-level redesign proposals, handoff specs,
changelogs, and session history. Evidence-first; UNKNOWN where unverifiable.

---

## 1. HUB AND SLICE — is the slice-contract design already done?

**Answer: designed and field-owner-assigned, but explicitly not yet authored into the skills. F3 is a
scoped, tracked, outstanding item, not an undiscovered gap.**

Evidence, `MASTER-REMAINING-WORK.md:320`:

> `[Marc, after D0-D2]` **dashboardData SLICE CONTRACT** — author "Deal-tab hub contribution — output
> slice" into each lens skill's SKILL.md: contract-review owns `issues[]`/`documentConflicts[]`/
> `protection{}`/`obligations[]`/`tacticFlag`; scope-sow owns `scope{}`+scope `issues[]`; pro-forma owns
> `commercialLines[]`/`scenarios[]`/`assumptions[]`/`proforma{}`/`benchmarks[]`. Strip competing "build
> your own dashboard" instructions. (= the "skill-alignment spec"; sequenced after dashboards per Marc)

This is the exact field-ownership table the audit asked whether it exists — it does, verbatim, with
per-skill field names already assigned. It is tagged `[Marc, after D0-D2]`, i.e. approved-in-direction
but explicitly sequenced to come after the Deal-tab-hub skill-home decision (D0) and the no-green
palette fix (D1/D2), neither of which is closed yet (`MASTER-REMAINING-WORK.md:365`, M1: "D2 no-green
rule... Deferred by Marc").

A second, independent slice-contract design exists for the RFx side, richer and further along than the
Deal one: `_redesign_proposals/RFx-REDESIGN-SPEC.md:157-168` (section D):

> Feeding pattern (each keeps its standalone deliverables — never-regress, branch don't replace):
> - **rfp-engine** → feeds `requirements[]` + weights + pricing template + addenda... Hub consumes as
>   source, never rebuilds a competing matrix.
> - **rfp-case-manager** → feeds `event`, `participation`, `keyDates`, `qa`, `caseHealth`...
> - **rfp-response-analysis** → feeds `scores.aiFirstPass`, `coverage`, `commercial` bid-leveling...
>   Its output is labeled **proposed** in the hub.
> - **evaluation-engine** → feeds `scores.panel`, `ranking`, `sensitivity`, `dispersion`, `calibration`,
>   `auditTrail`, `readiness`... Its output is labeled **official** in the hub.
> Each feeder returns a **bounded, cited slice** (only its owned fields, each carrying `sourceRef`); the
> hub composes, never re-scores.

Status per `MASTER-REMAINING-WORK.md:9B` item 1-2: `rfx-hub` skill itself is still unbuilt ("Buildable
now, no decision needed... 1. `rfx-hub` skill — carry the locked RFx dashboard; model authors data
only. 2. RFx to Deal handoff emitter — the contract is written; the emitter side was deferred until
rfx-hub exists"). So the RFx-side slice contract is fully specified (phases, kernel-sharing rule,
proposed-vs-official lens) but zero code/skill-text exists yet.

**Verdict on F3:** the audit's count (1 of 31 skills has a written slice contract) is factually accurate
for what's IN the SKILL.md files today. But the design work — exact field ownership per skill, for both
Deal and RFx — is done and Marc-approved in direction; it is unimplemented-but-designed, sequenced
behind other locked-dependency work (D0/D1/D2 for Deal; rfx-hub's own build for RFx), not a fresh design
gap. Recommend the tracker read as "author the two already-designed slice contracts" rather than
"design slice contracts."

---

## 2. HANDOFF CONTRACTS — was canonical discipline already defined? Is the rfp-engine/rfp-case-manager
drift a process violation?

**Answer: yes for RFx→Deal (a real, enforced canon exists); no equivalent discipline exists for
rfp-engine↔rfp-case-manager, and the in-repo text itself already documents the drift as known and
unresolved. The kernel has the discipline the handoff schemas lack.**

**RFx→Deal handoff — canonical, single-sourced, versioned by convention:**
`_redesign_proposals/RFX-DEAL-HANDOFF-AND-COMMS-EVIDENCE.md:14`:

> The authoritative schema is `RfxToDealHandoff` in `RFx-REDESIGN-SPEC.md` section C (do not fork it).

And governance at line 6: "never-regress the feeding/consuming skills (branch, do not replace their
standalone deliverables); compose-not-duplicate; integrate-or-don't-ship (the consumer side, deal-room,
is wired now; the emitter side, rfx-hub, implements this when it is built)." This is a real "one named
source, one file, do-not-fork" rule, matching the SYNTHESIS's own description of good discipline (quote
below). Status: consumer wired (`MASTER-REMAINING-WORK.md:136-143`, "#3/#6 DONE 2026-07-25... WIRED the
existing consumer: deal-room Phase 1 accepts an RfxToDealHandoff seed"); emitter (rfx-hub's "Send winner
to Deal" action) explicitly deferred until rfx-hub is built.

**rfp-engine ↔ rfp-case-manager — no equivalent discipline; the drift is documented in-repo, not
hidden.** `rfp-engine-1c344a/SKILL.md:396,499`: rfp-engine emits `case_handoff.json` per
`references/case-handoff-schema.md`, its own companion file (the source copy).
`rfp-case-manager-1c344a/SKILL.md:721-723`:

> ## Reference: Case Handoff Schema
> Mirror of the rfp-engine case-handoff-schema reference (its own companion file). Schema for
> `case_handoff.json`... (Note: rfp-engine's source copy still describes legacy provisioning actions on
> receipt; under the v2.0 "no provisioning spec" decision, rfp-case-manager does NOT create SharePoint
> folders or Teams sites on receipt: it adapts to whatever exists and builds the case file.)

This is the drift the audit's F7 found, stated by rfp-case-manager's own SKILL.md as a known,
unresolved discrepancy between its "mirror" and rfp-engine's "source" — not something the deep-read
audit discovered independently; it is visible on inspection of either file, and no fix has been applied
to rfp-engine's copy.

**Why this qualifies as a process violation, not a fresh design need — the kernel shows what the
missing discipline looks like.** `SUITE-MODERNIZATION-FINDINGS.md:26-30`:

> copies are byte-identical. The maths agrees everywhere. The pattern in place is good practice, not
> drift: a named source of truth (`lilly-procurement-kernels-1c344a`), verbatim vendored copies, and a
> header in every copy saying do not hand-edit, edit the source and re-vendor.

And the same file, line 157-159, explicitly names the handoff schema as the SAME category of problem
still unaddressed: "Handoff is not limited to RFx-to-Deal. `rfp-engine → rfp-case-manager` has a formal
`case-handoff-schema.md` with a schema, validation rules, and an actions-on-receipt section, carried in
`case_handoff.json`." No "do not hand-edit / re-vendor from source" header exists on either copy, and no
version-bump discipline is stated for the schema itself (contrast the kernel's own hard-refusal-on-
missing-function behavior, G11). **Verdict: ALREADY KNOWN OPEN, self-documented, unresolved — the
missing artifact is a "named source + do-not-fork header + re-vendor-on-change" rule applied to
`case-handoff-schema.md`, exactly mirroring what already exists for the kernel and (separately, newer)
for RfxToDealHandoff.**

---

## 3. GUARDRAILS — the full G-set, and does any guardrail require kernel use for arithmetic?

Defined in `lilly-brand-assets-1c344a/SKILL.md:962-1130` ("INLINED: references/execution-guardrails.md"),
12 guardrails, G1-G12 (the v10.6.6 README/CHANGELOG_G10 still cite "G1-G10"; G11 and G12 were added
afterward — see `docs/master-plan.md:97-100` for G11's origin and `MASTER-REMAINING-WORK.md` / STATUS
line "#5 claim-gate DONE (foundation guardrail G12, ebdc557)" for G12's):

- **G1** (line 970): Tool Selection by Document Context (HARD RULE)
- **G2** (983): Mandatory Gate Checks Between Phases
- **G3** (1002): Existing Document Context Is Primary Input (Negotiation Documents)
- **G4** (1016): Cross-Reference Tracing for Defined Terms
- **G5** (1028): Dashboard Data-Model-First (HARD RULE for Dashboard-Producing Skills)
- **G6** (1047): Pre-Delivery Self-Test
- **G7** (1061): Research Minimums (Skills That Perform Web Search)
- **G8** (1072): Pass Artifact Enforcement (HARD RULE for Multi-Pass Skills)
- **G9** (1080): Anti-Collapse Signal (HARD RULE)
- **G10** (1091): Chunked Artifact Assembly (HARD RULE for Large Single-File Deliverables) — added per
  `CHANGELOG_G10.md`, "surfaced on the 11-tab category-strategy dashboard."
- **G11** (1104): Kernel-Backed Computation (HARD RULE for Kernel-Consuming Skills)
- **G12** (1113): Claim-Gate, Cite or Abstain (HARD RULE, suite-wide)

**Does a guardrail require kernel use for arithmetic, making audit F1 a compliance failure rather than a
design gap? Answer: only partially, and the scope limitation is explicit and load-bearing.**

G11's own text (`lilly-brand-assets-1c344a/SKILL.md:1104-1110`):

> Where a skill vendors a numeric/decision kernel... all arithmetic and lookups covered by that kernel
> MUST be computed by calling the kernel, never performed in prose or by model judgment... **Scope: this
> guardrail applies only to the specific skills that vendor a kernel**... It does not require every
> skill in the suite to have a kernel; it requires that skills which do have one actually use it for
> everything the kernel covers.

This means:
- For skills that **vendor a kernel and skip it for a covered figure**, F1 IS a G11 compliance failure.
  `lilly-contract-review`'s hand-summed Protection Score is the closest candidate, but the audit itself
  notes the kernel has no Protection Score function ("absent even from the kernel's own 'not yet
  covered' list," `_audit/SYNTHESIS.md:37-38`) — so this is a **kernel-coverage gap**, not a G11
  violation: there is nothing to call. `lilly-brand-assets` Protection Score is the same figure,
  same gap.
- For skills that **never vendored a kernel at all** — negotiation-playbook-learning, supplier-
  landscape, category-strategy, negotiation-simulator (audit's list, `_audit/SYNTHESIS.md:22-31`) — G11
  does not reach them by its own stated scope. Doing HHI/CAGR/weighted-average arithmetic in prose is
  not a guardrail violation under G11 as written; it is a genuine design gap (should these skills vendor
  a kernel, or a shared one) that G11 explicitly declines to mandate.

**Verdict: F1 is a mix.** The two contract-review-family Protection Score cases are a kernel-coverage
gap (the function doesn't exist to call), not a compliance failure. The kernel-less skills' prose
arithmetic (HHI, CAGR, weighted composites, reciprocity ratios) is outside G11's stated scope entirely —
genuinely a design decision still open, not an enforcement failure. `negotiation-playbook-learning`'s
proven v2.1 scaling-overshoot bug (`_audit/SYNTHESIS.md:23`) is the strongest evidence FOR closing that
design gap, but it is not evidence of a rule being broken today.

---

## 4. Remaining findings, cross-checked

### F2 — 3,383 lines of dead generator code (should-cost, market-rate)
**GENUINELY NEW.** No document in the redesign-proposals/changelog/session-history set mentions
`should_cost_generator.py` or `market_rate_generator.py` by name, wiring status, or any decision to
leave them unwired. `pro-forma-builder`'s wired-generator pattern is referenced only in the dashboard-
architecture context (`DASHBOARD-ARCHITECTURE-DECISION.md`), never as a template explicitly slated for
the other two. Not tracked anywhere in `MASTER-REMAINING-WORK.md`.

### F4 — Category Strategy teaches the retired pattern (11-tab JSX-clone spec, SKILL.md:1588)
**ALREADY KNOWN OPEN — an approved rebuild is in flight, just not yet landed in SKILL.md text.**
Two separate, Marc-approved decisions already supersede the 11-tab JSX-clone spec the audit quoted:
1. `_redesign_proposals/CATEGORY-STRATEGY-REBUILD-PLAN.md:7-8,67-70`: "Direction... 11 tabs -> 7 + a new
   Execution tab + canonical fixes + remove fabricated defaults... Marc APPROVED all 3 [decisions]."
2. `_redesign_proposals/DASHBOARD-ARCHITECTURE-DECISION.md:12-16,38`: the per-skill "reference JSX" is
   suite-wide RETIRED in favor of one locked deterministic engine per hub; row for Category Strategy:
   "(to build)... Lock it. category-strategy carries it; model authors data."
`MASTER-REMAINING-WORK.md:9B` item context and the `>>> RESUME 2026-07-29 <<<` banner
(`MASTER-REMAINING-WORK.md:12-13`) confirm Category Strategy's dashboard was actually LOCKED 2026-07-29
at "5 tabs / 7 subtabs," i.e. the rebuild executed after these docs were written — meaning the SKILL.md's
still-inlined 11-tab/JSX-clone spec (line 1588, per the audit) is now a stale-documentation problem, not
an open design question: the design that supersedes it exists, was approved, and (per session history)
has already been built as a dashboard artifact. The remaining work is purely textual: rewrite
`category-strategy-1c344a/SKILL.md`'s canonical spec to match, per `CATEGORY-STRATEGY-REBUILD-PLAN.md`
Phase 1-4.

### F5 — Slowness has four causes, none is file size
**GENUINELY NEW**, with one partial, indirect precedent. None of the redesign proposals, changelogs, or
session-history files address runtime/token performance of multi-pass reopens, per-line kernel loops, or
uncapped web search. `CHANGELOG_G10.md` addresses a related but distinct failure mode (delivery
mechanics — write-size truncation risk), explicitly scoped as separate: "This is a delivery-mechanics
failure, not an analysis failure" (`CHANGELOG_G10.md:5`). G7 (Research Minimums) sets a floor on search
count for depth, which is the opposite pressure from the audit's "cap the searches" recommendation — no
document reconciles the two. Not tracked in `MASTER-REMAINING-WORK.md`.

### F6 — procurement-help-desk is an inert scaffold
**ALREADY KNOWN OPEN, tracked and gated on the same blocker the audit identified.**
`README.md:12` and `INSTALL.md:44`: shipped explicitly as "OFFLINE SCAFFOLD"; "cited content harvest is
network-gated (must be run on the Lilly network)." `MASTER-REMAINING-WORK.md:8` ("BLOCKED — needs Lilly
network"): "Help-desk network-gated harvest — build per-source snapshot files from real page reads on
the Lilly network... Real content only, never inferred." The audit's "undecided fork... ship as a
sibling skill, or fold into process-navigator" is also independently tracked:
`MASTER-REMAINING-WORK.md:9A` row M17: "help-desk | new skill vs extend process-navigator | needs Marc,"
and `MASTER-REMAINING-WORK.md:6`: "`[Marc]` help-desk: new-skill vs extend-process-navigator decision."
Nothing here changes the audit's characterization; it confirms both the version stamp and the fork are
already correctly identified as the two open items, with the network block as the one genuinely
network-gated item in the whole backlog (matching the audit's own phrasing almost verbatim).

---

## Summary table

| Finding | Status |
|---|---|
| F1 kernel-shaped prose arithmetic | MIXED: contract-review/brand-assets Protection Score = kernel-coverage gap (G11 doesn't cover it); kernel-less skills' prose math = outside G11's stated scope, a genuine open design question, not a violation |
| F2 dead should-cost/market-rate generators | GENUINELY NEW |
| F3 slice contracts (1 of 31) | ALREADY DESIGNED, not yet authored — exact field-ownership tables exist for both Deal (`MASTER-REMAINING-WORK.md:320`) and RFx (`RFx-REDESIGN-SPEC.md` §D), sequenced behind other locked work |
| F4 Category Strategy retired-pattern spec | ALREADY KNOWN OPEN — rebuild approved, direction locked, dashboard already rebuilt per session history; SKILL.md text update is the only remaining step |
| F5 slowness (4 causes) | GENUINELY NEW (G10 addresses a related but distinct delivery-mechanics issue only) |
| F6 help-desk inert scaffold | ALREADY KNOWN OPEN — version stamp, network gate, and new-skill-vs-fold fork all independently tracked in README/INSTALL/MASTER-REMAINING-WORK |
| F7 (from synthesis) case-handoff-schema drift | ALREADY KNOWN OPEN AND SELF-DOCUMENTED — rfp-case-manager's own SKILL.md (line 723) states its copy is a "mirror" and flags rfp-engine's source as describing a superseded ("legacy") behavior; no source-of-truth/re-vendor discipline exists for this schema, unlike the kernel (`SUITE-MODERNIZATION-FINDINGS.md:26-30,157-159`) |

UNKNOWN: whether any work has begun on the case-handoff-schema fix itself (no tracker entry found for
it specifically, unlike the RfxToDealHandoff and slice-contract items, which are explicitly scheduled).
