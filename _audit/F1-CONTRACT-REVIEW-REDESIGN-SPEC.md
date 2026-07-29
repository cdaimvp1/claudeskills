# lilly-contract-review: hybrid deterministic redesign

Spec, 2026-07-29. Design work only. Nothing here is implemented, and the skill is
under a documented hold (`PLATFORM-CONSOLIDATION-TRACKER.md:172`) that this spec
does not lift.

Governed by `_audit/OPTIMIZATION-PRINCIPLES.md`: accuracy, quality and
completeness first; time and token cost second.

---

## 1. Why the original F1 came back empty

F1 was written as "separate analysis passes from assembly passes". An agent
checked exactly that and found all four passes are analysis with no
open-append-save cycle braided through them. Correct, and useless: it answered the
question as scoped rather than the question asked, which was why a review takes
thirty minutes.

The cost is in three places the pass-level check could not see:

1. **Each pass re-reads raw contract text** and re-derives structure. Four passes,
   four independent acts of finding the clauses.
2. **Every deliverable is model-assembled.** No generator exists for any of them
   (recorded as owed under F9).
3. **The Protection Score is hand-summed**, and its calibration check is an
   instruction rather than an assertion.

## 2. Deliverables: four, not five

**The JSX dashboard deliverable is RETIRED.** Marc, 2026-07-29: the Deal dashboard
replaces it. This is the single largest model-assembled artifact in the skill and
removing it is the biggest cost reduction available, at zero accuracy cost,
because the replacement is a locked deterministic build.

Remaining four:

| Deliverable | After redesign |
|---|---|
| Redline `.docx` | Model authors the wording. Code performs the .docx tracked-changes mechanics. |
| Review Summary `.docx` | Generated from the findings ledger. |
| Stack Map | Generated from the coverage map. |
| Legal/Commercial Briefing | Generated from the ledger, model authors narrative sections only. |

This supersedes the "five preserved output modes" constraint in D1 and B4. Record
the retirement there so a later reader does not restore it as a regression.

## 3. The architecture Marc proposed, made concrete

Marc: "a temporary deterministic extraction of every single clause in a contract,
then the necessary passes/reviews, some could arguably be initial deterministic
passes... with the llm follow up on anything where determinism couldn't answer it
and/or to check the work on the deterministic review."

That is the right shape. Stated precisely:

### Stage 0: deterministic extraction (new, Python)

Runs once. Produces a `contract_index` object, the single structured input every
later pass reads instead of raw text:

- clause tree with numbering, headings, hierarchy, page/paragraph anchors
- defined-terms register: where each term is defined, everywhere it is used
- cross-reference graph: every "Section X.Y" reference and whether it resolves
- numeric and date register: caps, payment terms, notice periods, durations,
  every figure with its location
- document-family map: MSA, WO, SOW, exhibits, order of precedence
- tracked changes and comments where present, via the existing `unpack.py` XML
  machinery already proven in comment-cleanup

### Stage 1: deterministic findings (new, Python)

Things that are TRUE OR FALSE and need no judgment. These are **candidates**, not
verdicts:

- a cross-reference points at a section that does not exist
- a term is used before it is defined, or defined twice, or never used
- the same figure is stated inconsistently in two places
- a required clause from the checklist has no candidate match anywhere
- a numeric value sits outside a policy threshold
- order-of-precedence conflicts between MSA and WO

### Stages 2 to 5: the four existing passes, unchanged in judgment

Each keeps its full scope. What changes is only that it reads `contract_index`
rather than re-parsing prose, and it receives Stage 1 candidates to adjudicate.

**Pass 1 Structural Scan** now verifies Stage 0's segmentation rather than
performing it. That is Marc's "check the work on the deterministic review" and it
is the most important single safeguard in this design: if the parser mis-split a
clause, the model catches it, and the run says so.

**Pass 2 Governing Cross-Reference and Definition Tracing** consumes the
cross-reference graph and defined-terms register directly. This pass benefits most,
because tracing is exactly what code does better than prose.

**Pass 3 Commercial, Tactics, Pharma** is unchanged. It is judgment throughout and
nothing here is deterministic.

**Pass 4 QA and Negotiation Prep** consumes the ledger and calls `deduction_score()`.

## 4. The rule that keeps completeness intact

**Determinism NARROWS, it never DECIDES, and it never drops.**

Three hard constraints:

1. **Every Stage 1 candidate is adjudicated by the model.** Code never closes a
   finding. It proposes; the model rules.
2. **Regions with no deterministic finding still get model eyes.** Absence of a
   deterministic hit is not evidence of absence. This is the constraint that
   protects completeness, and it is the one most likely to be quietly eroded by a
   later optimization. If a future change makes the model read only flagged
   regions, this design has failed.
3. **Stage 0 output is verified by Pass 1, not trusted.** A parser failure that
   silently drops a clause would be the worst possible bug in this skill, because
   the output would look complete. Pass 1 exists to catch it and the run must
   state the result.

## 5. What CANNOT be made deterministic

Stated plainly so nobody tries later:

- **Severity.** Whether a finding is HIGH or MEDIUM is judgment about commercial
  and legal exposure.
- **Coverage status.** Whether an MSA section genuinely covers a WO category is
  retrieval plus judgment. Code can propose candidate matches; it cannot rule.
- **Playbook position matching** beyond exact clause matches. Novel wording that
  achieves a prohibited effect is precisely what the model is for.
- **Redline wording.** What to change and how to phrase it.
- **Obligation interpretation.** Who owes what by when, where the drafting is
  ambiguous.

Roughly: code owns structure, arithmetic and consistency. The model owns meaning,
severity and wording.

## 6. Protection Score

Build `deduction_score()` in `lilly-procurement-kernels` (item C1). Not
`weighted_score()`: this is a deduction model, starts at 100, subtracts severity x
coverage-column deductions, Hard Stops always -15 and never reduced.

The function computes the score, enforces the invariants, and **raises** on the
Rule 12 calibration check (zero Hard Stops plus 10+ covered categories should not
exceed 30 points of deduction) rather than leaving it as an instruction. Model
still supplies severity and coverage status per finding; the kernel does arithmetic
and validation only.

Rule 12's visible calculation table stays. It becomes generator output rather than
model prose, so it cannot disagree with the score.

## 7. Honest cost expectation

No measurement has been taken and none is claimed. Expected direction only:

- Retiring the JSX dashboard: **large**, and certain, since it deletes an artifact
- Generators for three deliverables: **large**, replaces token-by-token assembly
- Stage 0 and 1: **moderate**, four re-parses become one, and passes read a
  compact index rather than full prose
- `deduction_score()`: **negligible** cost effect. It is an accuracy change.

Stage 0 and 1 ADD Python execution time. Wall clock may not fall as much as token
cost. Say so rather than overclaiming.

## 8. The gate this must pass before shipping

**A golden-fixture test. Non-negotiable.**

Take one real, representative contract. Run today's skill, capture the full output.
Run the redesign. Compare:

- **Finding set:** every finding present before must be present after. A finding
  that disappears is a FAILURE, not an improvement, unless it was demonstrably
  wrong.
- **Protection Score:** identical, or different with a written explanation of
  which deduction changed and why.
- **Coverage map:** identical.
- **Deliverables:** materially equivalent content.

New findings that the old path missed are a WIN and should be reported, but they
must be verified as real before being counted.

The worked example already in `references/risk-scoring.md` (total deductions -36,
score 64) is the natural first unit fixture for `deduction_score()`.

## 9. Sequencing

1. `deduction_score()` in the kernel. **Unblocked now**, touches only
   `lilly-procurement-kernels`, changes contract-review's behaviour not at all
   until wired.
2. Retire the JSX dashboard deliverable. Small, and Marc has decided it.
3. Formalize the findings ledger and coverage map as validated schemas.
4. Build Stage 0 extraction and Stage 1 findings, standalone, testable against
   real contracts before anything is wired.
5. Build the three generators from the ledger.
6. Rewire SKILL.md. **This is the step the hold governs**, and it should be the
   last one, by which point everything it depends on is built and tested.

Steps 1 to 5 are buildable without touching the sensitive skill. The hold only
gates step 6.

## 10. Open for Marc

1. Confirm the JSX dashboard retirement propagates to D1 and B4 rather than being
   treated as a regression later.
2. Confirm the golden fixture: which contract, and is a real one available, or
   does this need a representative synthetic?
3. Whether the redline .docx mechanics move to code in this piece of work or a
   later one. It is the highest-risk deliverable and could reasonably be deferred.

---

# Addendum (Marc, 2026-07-29)

## 11. Is the deterministic work free? Mostly, with one real exception

**Free:** the Python execution itself. Parsing a contract, resolving
cross-references, tracing defined terms, checking numeric consistency consumes no
model tokens. A Stage 1 check reporting "Section 12.3 does not exist" costs nothing
to compute and produces a one-line finding. Those checks are as close to free as
anything in this design, and they are strictly additive to accuracy.

**NOT free:** the OUTPUT of Stage 0. The `contract_index` only helps if the model
reads it, and everything the model reads costs tokens. A verbose index could cost
MORE than the raw text it replaces.

That makes compactness a hard design constraint, not a nicety:

- **The index must be smaller than the prose it replaces**, or it is a regression.
  Store anchors and structure, never restated clause text. A clause entry is an id,
  a heading, a span reference and any extracted facts, not a copy of the clause.
- **Passes read SLICES, not the whole index.** Pass 2 needs the cross-reference
  graph and the defined-terms register. It does not need the numeric register. Each
  pass loads only what its job requires.
- **Full clause text is fetched on demand**, by id, for the clauses a pass is
  actually reasoning about.

Two other honest costs. Python execution is fast but not instant, so wall clock
falls less than token cost. And the extraction code is real software that must be
maintained and can have bugs, which is precisely why Pass 1 verifying it is
mandatory rather than optional.

Net expectation: Stage 1 checks are effectively free. Stage 0 is a large win only
if the index is disciplined. Design the index for compactness first, richness
second.

## 12. COVERAGE GUARANTEE (mandatory gate)

Marc: "the current design and reference documents should be 100% covered in the new
design even if handled a different way."

This is the governing acceptance criterion. Handling something differently is
allowed. Losing it is not.

### The spine

The current skill carries **15 reference documents, 2,669 lines**, plus **12
numbered Rules** in SKILL.md:

| Reference | Lines | Reference | Lines |
|---|---|---|---|
| ai-standard.md | 207 | pass-artifacts.md | 123 |
| arithmetic-verification.md | 93 | pharma-requirements.md | 143 |
| commercial-analysis.md | 176 | playbook.md | 263 |
| contract-stack-map.md | 235 | review-summary-design.md | 165 |
| dashboard-canonical.md | 353 | risk-scoring.md | 84 |
| definition-tracing-checklist.md | 95 | sme-matrix.md | 139 |
| dpa-review-checklist.md | 140 | vendor-tactics.md | 289 |
| lilly-templates.md | 164 | | |

### Required artifact: a coverage matrix

Before any implementation begins, produce `F1-COVERAGE-MATRIX.md` with one row per
discrete check, rule, checklist item and output requirement in the current skill.
Each row states:

| Column | Meaning |
|---|---|
| Source | reference doc plus section, or Rule number |
| What it does today | the check or requirement, in one line |
| Handled in the new design by | Stage 0, Stage 1, a named pass, a generator, or the kernel |
| Same or different | identical, or changed and how |
| How it is verified | the specific test proving it still happens |

Rules for the matrix:

1. **Every row must land somewhere.** A row with no destination is a blocker, not a
   footnote. Implementation does not start with an unresolved row.
2. **"Handled by Stage 1" is not sufficient on its own** for anything requiring
   judgment. If a check needs meaning, it maps to a pass, with Stage 1 at most
   proposing candidates.
3. **`dashboard-canonical.md` is the one legitimate deletion**, because Marc retired
   that deliverable. Record it as RETIRED with the reason, not as covered. Check
   whether any other reference depends on it before deleting.
4. **Where a check moves from model to code, the matrix must say what the code does
   when it cannot decide.** Abstain and escalate to the model is correct. Silently
   passing is not.

### The reference documents are not all the same kind of thing

They need different treatment and the matrix must reflect it:

- **Mechanical checklists** (`definition-tracing-checklist.md`,
  `arithmetic-verification.md`, `dpa-review-checklist.md`) are the strongest Stage 1
  candidates. Much of their content is genuinely true or false.
- **Judgment corpora** (`playbook.md`, `vendor-tactics.md`, `commercial-analysis.md`,
  `pharma-requirements.md`) mostly stay with the model. Code can index them for
  retrieval so a pass loads only relevant entries rather than the whole corpus,
  which is a real token saving at no accuracy cost.
- **Output specs** (`review-summary-design.md`, `contract-stack-map.md`,
  `pass-artifacts.md`) become generator templates, and are enforced rather than
  merely described.
- **Routing and standards** (`sme-matrix.md`, `lilly-templates.md`,
  `ai-standard.md`) are lookups. Deterministic where the key is exact, model where
  it is fuzzy.
- **`risk-scoring.md`** becomes `deduction_score()` plus its generated calculation
  table.

### Relationship to the golden fixture

The coverage matrix and the golden fixture test different things and both are
required. The matrix proves no check was LOST in the design. The fixture proves no
finding was lost in PRACTICE. A design can pass the matrix and still regress, and a
fixture can pass on one contract while a check has silently disappeared for another.
