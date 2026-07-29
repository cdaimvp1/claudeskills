# Deep per-skill read: synthesis

31 skills read in full by six independent readers, 2026-07-29. Per-group detail in
`_audit/GROUP-1..6-*.md`. This answers Marc's seven questions.

Reader coverage was uneven: group 4 used 2 tool calls against group 3's 27. Its
three claims were therefore spot-verified directly and all three held (finding 4).

---

## 1. The kernel is correctly vendored. Adoption is not.

**Verdict on the pattern (closes an earlier false alarm):** verbatim vendoring
into 11 skills is CORRECT for Claude Desktop, where each skill installs standalone
and no cross-package import exists. It is disciplined, not sloppy: quote-traced
docstrings, hard refusal gates, do-not-hand-edit headers.

**The real problem is that about a third of the suite does kernel-shaped
arithmetic in prose anyway:**

| Skill | Prose-computed | Why it matters |
|---|---|---|
| negotiation-playbook-learning | Difficulty Score, 11-code weighted composite | **No kernel at all.** Its own v2.1 changelog records a scaling-overshoot bug that `weighted_score()` and its `WeightSumError` guard exist to prevent. Proven in the wild. |
| rfp-response-analysis | Bid Leveling price normalization | This is the input that **gates the ranking**. The most decision-bearing number in an RFx is model arithmetic. |
| lilly-contract-review | Protection Score sum | Calls the kernel for line math and escalation, then hand-sums this. |
| lilly-brand-assets | Protection Score formula, inlined | The SAME number, prose-derived in a second place. |
| supplier-landscape | HHI, CAGR, weighted averages | Zero Python in the skill. |
| category-strategy | scores, CAGR, HHI | Zero Python in the skill. |
| negotiation-simulator | reciprocity ratios, anchor capture | Edge cases in prose. |
| rfp-engine | weight-sum checks | In prose. |
| commercial-negotiation-prep, should-cost-builder, market-rate-benchmarking | rollup percentages, summary tables | Kernel wired for escalation and percentile only. |

Doing it right: evaluation-engine, sole-source-challenge (codified as hard rule
G11), pro-forma-builder, invoice-rate-card-auditor (adds fail-closed G11),
legal-negotiation-prep, scope-sow-architect, deal-room.

**Missing kernel function:** Protection Score is prose-derived in two skills and is
absent even from the kernel's own "not yet covered" list.

## 2. 3,383 lines of finished, tested Python are dead code

`should-cost-builder/should_cost_generator.py` (1,763 lines) and
`market-rate-benchmarking/market_rate_generator.py` (1,620 lines) are never named
or called anywhere in their own SKILL.md. Confirmed by full-text grep. The model
hand-assembles those xlsx deliverables on every run instead.

`pro-forma-builder` wires its generator via an explicit HARD RULE. The pattern
exists and works; it was never applied to the two siblings.

**Cheapest large win in the audit.** No new code. Wire what is already built.

## 3. Slice contracts: 1 of 31

`deal-tab-1c344a` is the only skill in the suite with an output-slice contract (a
field-ownership table). Confirmed across all six groups.

Closest precedents to build on: process-navigator's structured answer block (built
for machine ingestion by callers) and workflow-map's optional JSON sidecar.

Slice composition requires every contributing skill to name independently
addressable outputs with stable schemas. None do.

## 4. Category Strategy actively teaches the retired pattern (verified directly)

SKILL.md line 1588: *"The reference implementation is
`examples/category_strategy_canonical_dashboard.jsx` ... Clone the structure, swap
the data entirely."* Zero mentions of `data.js`, `build_dashboard` or
"deterministic" anywhere in 25,176 words.

Contrast supplier-landscape line 230: *"Do NOT hand-author JSX/React or CSS: your
only job is the data object; the shipped, locked engine renders every tab."*

Worse, line 746 specifies **11 tabs** as the locked structure. The dashboard locked
2026-07-29 has **5**. Anyone running this skill today gets the pre-deterministic
pattern and a contradicted spec.

RFx is equally homeless but has no competing spec, because `rfx-hub` was never
written.

## 5. Slowness has four distinct causes. None is instruction-file size.

The census blamed the ~500k tokens of SKILL.md. That is a fixed cost paid once.
The mechanisms that actually scale with the work:

1. **Multi-pass document reopens.** contract-review: four passes, per clause.
   rfp-response-analysis: three passes, with a full supplier x scenario Bid
   Leveling pass gating any scoring.
2. **Per-item unbatched loops.** invoice-rate-card-auditor calls the kernel per
   invoice line, and invoice populations are the largest-N input in the suite.
3. **Unbounded per-line web search.** commercial-negotiation-prep,
   should-cost-builder and market-rate-benchmarking each require 3+ searches per
   rate line or cost driver, with no cap.
4. **Model-assembled documents.** Every DOCX/XLSX/JSX outside the wired generators
   is written token by token.

Trimming the instruction files would not have moved any of these.

## 6. The conversational help skill does not exist

`procurement-help-desk` version stamp: **"0.1 (OFFLINE SCAFFOLD - INERT)"**. Its
vendored fallback has "NO Lilly content". The routing table excludes it from the 27
routable skills, listing it "(PENDING)". It is blocked on the Lilly-network
harvest, the one genuinely network-blocked item on the backlog.

An undecided fork sits in its own file: ship as a sibling skill, or fold into
process-navigator as a mode. **Needs Marc.**

## 7. Orchestration: new skill, and copy timeline-builder's state file

**Recommendation: a new dedicated orchestration skill,** not an expanded THEO.
THEO self-describes as "a dispatcher, not an orchestrator" and is deliberately kept
context-light; loading multi-skill orchestration into the suite's largest SKILL.md
would contradict its stated role and bloat it further.

**The re-run-with-more-data template already exists in exactly one place.**
`timeline-builder` persists `timeline_calibration.json` to Project knowledge and
explicitly checks it to distinguish a first run from a later one. Nothing else has
anything comparable; meeting-prep-brief has an aspirational "state accumulates"
line that was never built. Copy that mechanism rather than inventing one.

**Routing itself is in good shape** and does not need rebuilding: a full 31-skill
Predecessors/Successors chain table, plus versioned validated JSON handoffs in
rfp-engine, rfp-response-analysis, evaluation-engine and sole-source-challenge.

**One real drift bug:** rfp-engine's copy of `case-handoff-schema.md` is stale
against rfp-case-manager's corrected copy. Two versions of a contract governing
what passes between two skills. This is precisely the failure the kernel avoids
with a named source of truth and a do-not-hand-edit header; the handoff schemas
have neither.

---

## Recommended order

1. **Wire the two dead generators.** Highest value per unit of work in the audit.
2. **Fix the stale handoff schema**, and give handoff schemas the kernel's
   source-of-truth discipline.
3. **Kernel adoption pass**, starting with negotiation-playbook-learning (proven
   bug) and rfp-response-analysis (gates the ranking). Add Protection Score to the
   kernel.
4. **Rehome Category Strategy** into its skill and delete the 11-tab JSX-clone
   spec. Then build `rfx-hub`.
5. **Attack the four slow mechanisms** individually: batch the invoice loop, cap
   the web searches, collapse the multi-pass reopens.
6. **Then** design orchestration and slice contracts, which is design work rather
   than repair.
