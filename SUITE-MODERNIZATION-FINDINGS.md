# Suite modernization: what the census found, and what it does not yet answer

Started 2026-07-29, after the four dashboards were locked.

Marc's question, restated: are these 31 skills the most advanced versions of
themselves? Specifically (1) are the dashboards deterministic Python, (2) what
else should be Python for accuracy and token cost, (3) are the hub/slice
deliverables defined, (4) is each skill the best version of itself, (5) do they
run fast enough to be usable, (6) is there a conversational help skill, (7) is
there an intake/router that hands off to the next right skill, including
re-running one with more data or composing slices of several.

This document holds what a mechanical census across all 31 skills established as
fact. Where the census cannot answer a question, it says so rather than guessing.
**Sections marked OPEN still need the deeper read.**

---

## Finding 1 (NOT A BUG — verified clean) — the shared numeric kernel is correctly vendored

**Corrected before reporting.** The census flagged this as a likely correctness
incident on MD5 evidence alone. Diffing the four versions disproved it: every
difference is the vendoring header comment (a `2026-07-21` vs `2026-07-22` date),
plus one extra documentation comment in scope-sow-architect listing which kernel
functions that skill actually calls. **Ignoring comments and whitespace, all 12
copies are byte-identical. The maths agrees everywhere.**

The pattern in place is good practice, not drift: a named source of truth
(`lilly-procurement-kernels-1c344a`), verbatim vendored copies, and a header in
every copy saying do not hand-edit, edit the source and re-vendor. It is working
as designed.

Recording the false alarm because the lesson generalises: **four distinct MD5s
across copies of one file is not evidence of drift.** A one-line comment changes
the hash exactly as loudly as a changed formula. Any future audit of this suite
must diff ignoring comments before raising severity.

The one real (minor) item: re-vendoring stamps two different dates, so a future
reader sees 07-21 and 07-22 copies and has to repeat this diff to learn they are
the same. Worth normalising on the next re-vendor. Not urgent.

The original census evidence is kept below for the record.

### Original census evidence

`numeric_kernel.py` is duplicated into 12 skills. The copies are not identical.
By MD5:

| Version | Copies | Skills |
|---|---|---|
| `b55a4115` | 7 | commercial-negotiation-prep, evaluation-engine, lilly-contract-review, market-rate-benchmarking, pro-forma-builder, rfp-response-analysis, should-cost-builder |
| `5d5f4d66` | 3 | deal-room, invoice-rate-card-auditor, sole-source-challenge |
| `e6b88c98` | 1 | scope-sow-architect (652 lines, not 651) |
| `830d8c9f` | 1 | **lilly-procurement-kernels** |

Four distinct hashes across 12 copies, which is what triggered the alarm. Resolved
above: comment-only. **CLOSED.**

---

## Finding 2 — two of the four locked dashboards have no skill home

| Dashboard | Build engine | Carried by a skill? |
|---|---|---|
| Deal | `_deal_build/` -> `deal-tab-1c344a/dashboard/` | **yes** (created this session) |
| Landscape | `supplier-landscape-1c344a/dashboard/` | **yes** |
| RFx | `_rfx_build/` | **no** — loose build directory |
| Category Strategy | `_category_build/` | **no** — loose build directory |

`rfx-hub` was already tracked as owed. Category Strategy is a **new** gap created
by locking it: `category-strategy-1c344a` exists as a skill, but it carries 0
Python files and 0 dashboard. The dashboard locked today lives outside it.

Consequence: neither RFx nor Category Strategy can currently be installed and run
by a user. They exist only in this repo. Deal and Landscape can.

---

## Finding 3 — 12 of 31 skills contain no Python at all

Zero `.py` files: category-strategy, lilly-brand-assets, meeting-prep-brief,
negotiation-playbook-learning, negotiation-simulator, process-navigator,
procurement-help-desk, procurement-launcher, rfp-case-manager, rfp-engine,
supplier-deep-dive, theos-field-guide, voice-profile.

Some of these are correctly prose-only. `lilly-brand-assets` is a reference,
`voice-profile` is a style guide, `theos-field-guide` is documentation. Those need
no code.

Others are doing real computation in the model that should not be:

- **rfp-engine** emits `.csv` / `.xlsx` / `.json` with no code to build them
- **rfp-case-manager** emits `.csv` / `.docx` / `.json` with no code to build them
- **supplier-deep-dive** is a hub with no engine
- **category-strategy** produces a `.docx` with no generator

**Not yet known:** for each of these, whether the model is doing arithmetic (must
move to Python) or only assembling prose (fine as-is). **OPEN.**

---

## Finding 4 (SPEED) — the instruction files are very large, which is the likeliest cause of the slowness

Total across 31 `SKILL.md` files: **377,670 words**, roughly half a million tokens.

Heaviest, in words:

| Skill | Words | ~tokens |
|---|---|---|
| rfp-response-analysis | 29,273 | ~39,000 |
| category-strategy | 25,176 | ~34,000 |
| lilly-contract-review | 23,446 | ~31,000 |
| commercial-negotiation-prep | 20,202 | ~27,000 |
| theos-field-guide | 15,952 | ~21,000 |
| rfp-case-manager | 15,373 | ~20,000 |
| legal-negotiation-prep | 15,159 | ~20,000 |

Marc's example was contract review taking 30 minutes. `lilly-contract-review` is
the third-heaviest file in the suite at ~31,000 tokens of instructions, read
before any contract is looked at, on every run.

This is a strong candidate for the cause but it is **not yet proven**. A large
instruction file costs a fixed amount at the start; 30 minutes suggests something
that scales with the work, such as re-reading the contract per clause or per
playbook rule. Both could be true.

**Not yet known:** where the time actually goes. This needs one instrumented run
of contract review against a real document, not more static analysis. **OPEN.**

---

## Finding 5 (WRONG — corrected after reading the skills) — the routing layer already exists and is well built

Marc pushed back and was right. The census counted files; it did not read them.
Corrected on the evidence:

**A complete 31-skill chain map exists**:
`procurement-launcher-1c344a/references/routing-and-chains.md`, 126 lines, headed
"THEO's own operational data". It carries a Predecessors / Successors table for
every skill in the suite, at a level of detail the census had no way to see. For
example deal-room's entry names not just its neighbours but the exact shape of the
one place it touches negotiation-playbook-learning (a `negotiation_outcome.json`
written at close), and distinguishes a mid-run *lookup* (process-navigator) from a
*sequence step*.

**The launcher already names the next step after a skill finishes.** SKILL.md
line 157 onward: THEO names "the next step or two after a skill finishes, using
`references/routing-and-chains.md`", and knows that an absent successor means an
endpoint rather than a gap. It carries chain context forward in words: "you have
the shortlist from supplier-landscape; the next step is rfp-engine".

**A conversational help skill already exists.** `procurement-help-desk` is a
stakeholder-facing help desk over the four Lilly sources, with an intent taxonomy
that routes a question to a source AND a system, and an explicit handoff to
process-navigator when a question crosses into policy.

**Handoff is not limited to RFx-to-Deal.** `rfp-engine → rfp-case-manager` has a
formal `case-handoff-schema.md` with a schema, validation rules, and an
actions-on-receipt section, carried in `case_handoff.json`.

### What is genuinely missing, stated in the suite's own words

The routing file draws the line itself, describing THEO as:

> "explicitly a dispatcher, not an orchestrator - it names paths and hands off one
> skill at a time, it does not itself call or run another skill"

That sentence is the real answer to Marc's question 7. The suite has **routing**
(knowing what comes next, and saying so). It does not have **orchestration**
(running the next thing, or running several and composing them). Specifically
absent:

1. **Execution.** THEO names the next skill; the user re-invokes it by hand.
2. **Re-run with more data.** Nothing models "same skill, second pass, now that
   the POC is done" as distinct from a first run.
3. **Slice composition.** The chain table is one-skill-to-one-skill. There is no
   representation of an answer assembled from bounded slices of several skills,
   which is the hub/slice idea. The only place a slice contract is actually
   written into a SKILL.md is `deal-tab-1c344a`.
4. `procurement-help-desk` is listed as "pending ... once it ships", so the
   routing table may not yet route to it.

This reframes the work: not "build a router", which exists and is good, but
"promote a dispatcher into an orchestrator, and add slice composition."

---

## Finding 6 (also corrected) — rfp-engine has a builder; it is JavaScript, not Python

The census said rfp-engine declares `.csv`/`.xlsx`/`.json` with no code to build
them. Wrong: `assets/lilly_rfx_template.js` is a Node.js DOCX builder supporting
`--mode RFP|RFI`, `--branded --logo`, and optional section flags.

The real question is therefore not "does code exist" but "is JavaScript the right
runtime". Non-Python code by skill: deal-tab 36 JS files, supplier-landscape 10,
rfp-engine 1. The dashboard engines are deliberately JS (the renderer runs in the
browser). rfp-engine's document builder is the odd one out, and whether it should
be Python is a real question for Marc's item 2. **OPEN.**

## What the census could not establish

These need reading, not counting, and they are the substance of Marc's question:

1. ~~Whether the four kernel versions differ mathematically~~ — ANSWERED, no.
2. Where contract-review's 30 minutes actually goes (Finding 4 cause)
3. Which of the 12 Python-free skills are computing in the model
4. Whether the hub/slice output contract is written into each lens skill's
   SKILL.md, or only into the three that were done as D1
5. ~~Whether any skill-to-skill handoff exists beyond RFx-to-Deal~~ — ANSWERED,
   yes: a full 31-skill chain map plus a formal rfp-engine to rfp-case-manager
   schema. The gap is orchestration and slice composition, not routing.
6. Whether the "best version of itself" question has any answer other than a
   skill-by-skill read

## Recommended order

1. ~~Diff the four kernel versions.~~ **DONE — clean, comment-only.**
2. **Instrument one contract-review run.** Turns the speed question from
   speculation into a number.
3. **Read the 12 Python-free skills** for in-model arithmetic.
4. **Then** the orchestration design, which is a design question rather than an
   audit question and deserves its own pass.
