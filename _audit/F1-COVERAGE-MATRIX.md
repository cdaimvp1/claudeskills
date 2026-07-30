# F1 Coverage Matrix

Merged from `F1-COVERAGE-MATRIX-PART1-mechanical.md`, `PART2-judgment.md` and
`PART3-outputs-rules.md`, 2026-07-29. The three part files remain in `_audit/` as the
provenance record; this file is the one to read. Built against
`_audit/F1-CONTRACT-REVIEW-REDESIGN-SPEC.md`.

**What this document is for.** F1 redesigns `lilly-contract-review` around a
deterministic Stage 0/Stage 1 front end feeding the four existing judgment passes. This
matrix is the coverage guarantee: every check the skill performs today has a row here
naming where it lands in the new design, whether the judgment changes, and how that is
verified. A check with no row is a check that gets silently dropped at implementation.

---

## Status: NOT a finished gate

**307 rows. 0 strict BLOCKERs.** Every row lands somewhere.

But the matrix is **incomplete in two respects** and must not be treated as a passed
gate until both are closed: the output-mode hole, and an unreconciled row count. A gate
that reports PASS wrongly is worse than one that fails.

| Part | Scope | Rows | Self-reported |
|---|---|---|---|
| 1 | `definition-tracing-checklist.md` 15, `arithmetic-verification.md` 16, `dpa-review-checklist.md` 49, `risk-scoring.md` 9, `contract-stack-map.md` 30 | **119** | 118 |
| 2 | `playbook.md` 34, `vendor-tactics.md` 19, `commercial-analysis.md` 23, `pharma-requirements.md` 14 | **90** | 89 |
| 3 | dashboard rescue 23, `review-summary-design.md` 23, `pass-artifacts.md` 10, `sme-matrix.md` 15, `lilly-templates.md` 5, `ai-standard.md` 10, the 12 Rules 12 | **98** | 135 |
| | **Total** | **307** | 342 |

### The row count does not reconcile, and Part 3's does not reconcile by a lot

The counts in the "Rows" column are **counted from the merged tables** and are
authoritative. The self-reported figures come from each part's own summary paragraph.

Parts 1 and 2 are off by one each, in opposite directions within their own sections, and
are not interesting: `contract-stack-map.md` has 30 rows not 29;
`commercial-analysis.md` has 23 not 21; `pharma-requirements.md` has 14 not 15.

**Part 3 reported 135 and delivered 98.** That gap is 37 rows and it is not a counting
slip. Two readings, and they have very different consequences:

1. The summary figure was estimated up front against the source line count and never
   reconciled against the rows actually written. Harmless.
2. Rows were scoped and then not written, in which case there are source items in
   `review-summary-design.md`, `pass-artifacts.md`, `sme-matrix.md`, `lilly-templates.md`
   or `ai-standard.md` with **no row at all**, which is precisely the silent drop this
   matrix exists to prevent.

**RESOLVED. See the "Part 3 coverage sweep" section below.** Both readings were right.
The 135 was a stale estimate never reconciled against the rows actually written, AND the
sweep found genuinely uncovered content: `dashboard-canonical.md:124-223`, Panels 2 and
3, 100 lines that Part 3 never walked. Most of that survives via `pass-artifacts.md:64`,
but **four items have no surviving home anywhere in the skill** and are a fourth rescue
candidate Marc has not yet seen.

Part 3's coverage is now KNOWN. Parts 1 and 2 have not had the same sweep; they are
believed complete because their citation coverage is materially denser, but that is a
belief, not a measurement.

Destination split across the whole matrix: deterministic Stage 0 location and extraction
feeding a pass; Stage 1 candidates that propose but never decide; pass judgment
unchanged; and output specs that become validated schemas plus generator templates.
Zero rows anywhere name Stage 1 as a sole destination. Every mechanical sliver is stated
as "Stage 1 proposes, Pass N adjudicates", which is the spec's completeness constraint
held at row level.

---

## The output-mode hole: what is still owed (Marc, 2026-07-29)

Each part assigned destinations without checking **which output modes each destination
actually reaches**. That is a systematic hole, not a one-off error.

A row mapped to "the Review Summary generator" is silently lost on every run that does
not produce a Review Summary. The redline-only run is the strictest case, and plausibly
the most common real use of this skill, which makes it the worst one to have quietly
degraded.

**DONE, see the "Output-mode audit" section below.** It found five at-risk clusters. The
severe one is that several completeness gates are wired to the Review Summary generator,
which never executes in redline-only mode, so those gates silently do not fire in the
DEFAULT mode. Summary of the rest: the Protection Score and the whole commercial
analysis currently have no redline surface.

The original brief, retained for the record:

1. Add a column: **"Which output modes does this reach?"**
2. Re-audit all 342 rows against the test: *if the user requests ONLY the redlined,
   commented, track-changes .docx, does this check still run, and does its result still
   reach the user?* If the answer is no and the check matters standalone, the
   destination is wrong.
3. Suspects first: any row mapped to `review-summary-design.md` or to the Review Summary
   generator.

The governing principle, stated once rather than re-litigated per row: **a check that
affects whether the contract should be signed must reach the user in whatever single
deliverable they asked for.** The redline is the minimum deliverable, so it is the floor
every such check has to clear.

Tracked as O1 in `_audit/OVERNIGHT-QUEUE.md`.

---

## The three rescues from `dashboard-canonical.md` (all DECIDED, all required)

Part 3 read the 353 lines of `dashboard-canonical.md` before its retirement and found
three things the deletion would have silently destroyed. None was visible without
reading the file. This is the regression the coverage guarantee exists to prevent.

**1. The Deal-tab contribution section (lines 224-353) IS the D1 slice contract.** Added
2026-07-29, in the same session that retired the file. It documents this skill's data
slice into `deal-tab-1c344a` (`issues[]`, `documentConflicts[]`, `protection{}`,
`obligations[]`, `tacticFlag`). **RELOCATE to `references/deal-tab-contribution.md`
before any deletion.** Correct "five deliverables" to four during the move. Preserve the
"#114 deduction kernel is HELD" warning verbatim and cross-reference it against
`deduction_score()`.

This also corrects an earlier audit finding. The claim "only deal-tab has a slice
contract" is **wrong**: contract-review has one too, buried in the file being retired.
Re-check the other lens skills before trusting that finding.

**2. Obligations analysis. DECIDED by Marc: it survives.** Register, imbalance analysis,
deadline-urgency ordering, verbatim-source-sentence field. Reasoning: obligations matter
in a standalone review even when the only requested output is the redline, because a
missing, one-sided or unbalanced obligation is exactly what a reviewer raises as a
comment in the document.

Part 3 mapped this into `review-summary-design.md`. **That destination is wrong**, and it
is the case that exposed the output-mode hole above. Correct destination, one analysis
across three surfaces, none conditional on the others:

- The analysis runs in a pass **regardless of output mode**.
- Findings surface as **comments in the redline .docx**, anchored to the clause that
  creates or omits the obligation.
- **And** in the Review Summary in fuller register form, when that is requested.
- **And** in the deal-tab slice, when a Deal build is running.

**3. The Compliance Evidence Checklist. DECIDED by Marc: it survives too.** Fixed
required-evidence list (W-9, SOC 2, ISS Questionnaire, Data Escrow Decision Memo,
SCC/TIA, Data Residency Screen, Risk Acceptance Memo) with Filed / Draft / Pending /
Awaiting states, plus the document-family register. Reasoning: missing evidence is a
reason to comment on the document and a reason not to sign it. A reviewer handed only a
redline, and not told the SOC 2 report is outstanding, has had an incomplete review
whatever the redline says about the clauses.

Same three-surface correction applies. Its deterministic parts map to Stage 1 as Part 3
proposed; what changes is only where the result has to reach.

`retentionClass()` and `evidenceStatus()` are pure lookups and port to the kernel at no
cost.

**Dependencies on the retirement:** `SKILL.md` has 9 references to
`dashboard-canonical.md`, and `examples/contract_review_canonical_dashboard.jsx` is
wholly dependent and retires with it. Retiring the file is **blocked** until the rescues
above are done as separate reviewed changes, and `lilly-contract-review` is under the
documented HOLD at `PLATFORM-CONSOLIDATION-TRACKER.md:172`.

---

## Effect on the 12 Rules

All 12 survive in substance.

- **Rules 7, 9, 12** move from instruction to code-enforced via `deduction_score()`.
- **Rule 12 also needs a text edit**: it names "the dashboard's Protection Score panel"
  as an emission target that will no longer exist. This is the only Rule whose wording
  the retirement forces a change to.
- **Rules 5, 10, 11** gain a deterministic first pass that narrows but never decides.
- **Rules 1-4, 6, 8** unchanged.

---

## Spec correction carried out of Part 1

`deduction_score()` needs **TWO** calibration assertions, not one. The spec named only
the too-harsh direction (Rule 12: zero Hard Stops plus 10+ categories Covered must not
exceed a 30-point deduction). `risk-scoring.md:83-84` also carries the converse: a
standalone document with 5+ findings must not come in under 25 points. The too-generous
case is the more dangerous one, because it understates risk and nobody questions a good
number. **Spec already corrected.** Both directions raise.

---

## Open items rolled up from the three parts

Neither of these blocks implementation; both need closing before the affected code ships.

1. **DPA checklist pass assignment is unconfirmed.** `dpa-review-checklist.md` does not
   state which pass loads it, and neither did the SKILL.md sections read. Part 1
   assigned scope and definition items to Pass 2 and substantive risk items to Pass 3 by
   content. Confirm against SKILL.md's actual pass list before implementation. The rows
   land in a pass either way; only the pass number is unconfirmed.
2. **`contract-stack-map.md:11` cross-references the retired dashboard's Documents
   sub-tab.** Update the pointer to the successor surface before the Stack Map generator
   ships, rather than leaving it aimed at a deleted file.

## Shared implementations, so they are built once and not three times

Several rows across Parts 1 and 2 describe the **same** mechanical check reached from
different reference documents. Implement each once:

- **Payment-term threshold** (Net-45 / Net-30 / the $100K value gate):
  `playbook.md:78-89`, `commercial-analysis.md:58-63`, `sme-matrix.md:88-93`.
- **Breach-notification 72-hour ceiling**: `playbook.md:126-133`,
  `pharma-requirements.md:41-47`, `dpa-review-checklist.md:43`.
- **Escalation cap 3% / CPI tie**: `playbook.md:85`, `playbook.md:242-251` item 2,
  `commercial-analysis.md:51-57` price protection.
- **Unit-of-measure consistency**: `playbook.md:242-251` item 3,
  `vendor-tactics.md:19`.
- **Insurance minimums**: `playbook.md:152-160` and `pharma-requirements.md:114-127` are
  **additive, not duplicative**. Both sets are checked and the higher applicable minimum
  governs. State this explicitly so a later reader does not drop one as a duplicate.
- **Hard Stops** duplicated between `playbook.md` and `pharma-requirements.md` (AE
  reporting, debarment, trade sanctions, FCPA): playbook.md is the single source of
  truth for the Hard Stop itself; pharma-requirements.md contributes only its genuinely
  additive elements.

## Retrieval indexing verdict

Viable for all four judgment corpora, with the win coming from different places. The
biggest new saving is `playbook.md` and `pharma-requirements.md`, both loaded "Always",
in full, with zero narrowing today (`SKILL.md:658, 666`). `vendor-tactics.md` and
`commercial-analysis.md` are already conditional at document level, so their new win is
intra-file narrowing. Detail and index keys in Part 2 section 5.

**The rule that is easy to erode later, so it is stated here as well: a retrieval miss
NEVER means skip the check. It means fall back to loading the full corpus for that
pass.**

## Seven pre-existing ambiguities, for Marc independently of this work

Part 2 section 6 lists seven places in the judgment corpora where two reviewers would
reach different answers today. One is a real contradiction: **`playbook.md:187-197` sets
a $3M liability-cap floor AND a 2x to 3x annual-value fallback, with no resolution when
the fallback computes below the floor.** The rest are unbounded or untestable terms.

These are not redesign defects and the redesign neither fixes nor worsens them. They do
get MORE visible after it, because Stage 1 proposing candidates against an ambiguous
rule produces inconsistent candidates rather than absorbing the ambiguity in prose.

---

## How to read the rows

Every row carries the same five columns:

| Column | Meaning |
|---|---|
| Source | `file:line` in `lilly-contract-review-1c344a`, so the claim is checkable |
| What it does today | the current behavior, stated without reference to the redesign |
| Handled in the new design by | Stage 0, Stage 1, a pass, a schema, a generator, or a named combination |
| Same or different | whether the JUDGMENT changes, not whether the plumbing does |
| How it is verified | the specific test that proves the check survived |

"Different" in column four is not automatically a warning. It marks the rows to read
closely: an instruction becoming a code-enforced assertion is an improvement, an
instruction becoming nothing is a loss, and the column is where the two are told apart.

---


---

# Output-mode audit (O1, 2026-07-29)

The re-audit Marc's correction called for. Answers, for every row in this matrix, the
test: *if the user requests ONLY the redlined track-changes .docx, does this check still
run, and does its result reach them?*

## Method, and one deliberate deviation from the O1 brief

O1 said "add a column". I did not add a sixth column to 307 verbatim rows, and that is a
deliberate deviation, stated here rather than left for a reader to notice.

Reason: the rows are the provenance record, carried word for word from three separate
authoring passes. Rewriting all 307 to append a cell risks corrupting the thing the
matrix exists to protect, and for roughly 85 percent of rows the answer is the same
three words. Instead every row is classified by GROUP below, with each exception named
individually. Coverage is the same, the classification is checkable per row, and the
verbatim rows stay untouched.

If a later reader wants the literal column, it can be generated from the group
classification plus the exception register without re-reading the sources.

## What the modes actually are

Evidence, all from `lilly-contract-review-1c344a/SKILL.md`:

Five modes today (`:225-248`), four after the dashboard retires: **Redline only**,
**Briefing only**, **Full review**, **Stack map only**. Dashboard only retires with the
deliverable.

**Redline only is the DEFAULT** (`:248`, "Default to Redline only if the user does not
respond"), and the reasoning given is that most users on a typical contract want the
marked-up DOCX and nothing else.

The emission matrix (`:1040-1047`):

| Mode | 5A Redline | 5B Vendor Response | 5C Dashboard | 6 Review Summary |
|---|---|---|---|---|
| Full review | YES | YES | YES | YES |
| Redline only | **YES** | NO | NO | **NO** |
| Dashboard only | NO | NO | YES | NO |
| Briefing only | NO | NO | NO | YES |

`Stack map only` is not in the matrix. It exits at Step 0.5, never reaches Steps 1-7,
and produces no findings, redline or Protection Score (`:1049`, `:720`, `:1742`).

**The critical structural fact, and the good news** (`:1038`, `:1051`): the analytical
workflow runs identically regardless of mode. Only emission varies.

So the first half of the test is answered once, for every row: **yes, the check still
runs.** Nothing is skipped in redline-only mode. The entire question is the second half,
whether the RESULT reaches the user, and that reduces to a single question per row:
**does this row's output have a surface in the redline?**

## Surface classes

| Class | Surface | Reaches a redline-only user |
|---|---|---|
| **S1** | Redline .docx: tracked change or comment | **YES** |
| **S2** | Review Summary .docx | NO |
| **S3** | Vendor response draft | NO (Full review only) |
| **S4** | Dashboard | RETIRED |
| **S5** | Stack Map .docx + manifest | NO (separate mode) |
| **S6** | Internal: working notes, pass artifacts, findings ledger, kernel, schema | Only via S1/S2/S3/S5 |

S6 is not a loss in itself. Pass artifacts are internal by design and always have been.
S6 becomes a loss only where it has no onward S1 path.

The model row for how this should be done already exists in the matrix:
`arithmetic-verification.md:91` carries `must_appear_in: [redline_tracked_change,
redline_comment, review_summary_commercial]`. One ledger entry, three generators reading
it, so they cannot disagree. Every correction below is an instruction to look like that
row.

## Group classification, all 307 rows

| Group | Rows | Class | Reaches redline-only |
|---|---|---|---|
| P1 definition-tracing | 15 | S1 via findings, 4 rows S6 gates | YES |
| P1 arithmetic-verification | 16 | S1, explicit at `:91` | YES, 1 exception |
| P1 dpa-review-checklist | 49 | S1 via findings and clause-anchored escalation comments | YES, 1 exception |
| **P1 risk-scoring** | **9** | **S2 only** | **NO, all 9** |
| P1 contract-stack-map | 30 | S5, mode-scoped by design | NO, and correct, 1 exception |
| P2 playbook | 34 | S1 via findings | YES, 1 exception |
| P2 vendor-tactics | 19 | S1 via findings | YES |
| **P2 commercial-analysis** | **23** | **S2 Section 04** | **NO, 20 of 23** |
| P2 pharma-requirements | 14 | S1 via findings | YES, 1 exception |
| P3 dashboard rescue | 23 | corrected to S1+S2+slice by Marc | YES, 1 exception |
| P3 review-summary-design | 23 | S2 by definition, it IS the spec | N/A, not a loss |
| P3 pass-artifacts | 10 | S6 internal, always run | N/A, not a loss |
| P3 sme-matrix | 15 | S1 clause-anchored comments | YES, table is S2 |
| P3 lilly-templates | 5 | S6 internal classification | N/A |
| P3 ai-standard | 10 | S1 via findings | YES |
| P3 the 12 Rules | 12 | mixed | 3 exceptions |

**Findings reach the redline. Analysis about the contract as a whole does not.** That is
the shape of the problem in one sentence. The redline is a per-clause instrument, so
anything anchored to a clause surfaces naturally, and anything that is a judgment about
the document as a whole currently has nowhere to go.

---

## AT-RISK register

Five clusters. Cluster C is the severe one.

### Cluster A: the Protection Score and everything that explains it

**Rows:** all 9 of P1 risk-scoring, Rules 7, 9 and 12 in P3G, the KPI card row in P3B,
plus the rescued methodology narrative, coverage rollup and severity-versus-coverage
cross-reference in P3A.

**The problem, and it is worse than a missing number.** `SKILL.md:205` (Rule 12): the
calculation table "must exist in Pass 4 working notes before the score is finalized AND
be emitted in the output (the review summary and the dashboard's Protection Score
panel), so the score is auditable and reproducible by the reader. **A score produced
without this visible calculation table is invalid.**"

Rule 12 names exactly two emission targets. One is being retired. The other is not
emitted in redline-only mode. So on a default-mode run, after the retirement, the skill
either omits its headline number entirely or emits one that is invalid by its own rule.

The Protection Score is the most sign-or-not-sign relevant single output the skill
produces. It clears the redline floor by any reading of Marc's principle.

**Correction required:** the score, its band label, and the Rule 12 calculation table
need an S1 surface. A front-matter block or a document-level comment on the redline is
the natural home, since the score is a document-level judgment with no single clause to
anchor to. Rule 12's text has to change anyway to drop the dashboard panel; make that
edit add the redline target rather than just remove the dead one.

### Cluster B: the commercial analysis

**Rows:** 20 of the 23 P2 commercial-analysis rows. Value at Risk (overpayment,
commitment, scope creep, renewal, and the total), the pricing assessment, benchmark
table and confidence rating, commitment structure, term and renewal, scope-boundary and
pricing-model risk mappings.

**The problem:** commercial analysis is Section 04 of the Review Summary and has no
other surface. The only commercial content that crosses into the redline today is
arithmetic ERRORS, via `arithmetic-verification.md:91`. So a redline-only user is told
the vendor's math is wrong, but not that the rate is 40 percent above market or that
total Value at Risk is $2M.

The three rows that are already safe are the arithmetic-error rows covered by `:91`.

**Correction required:** Value at Risk and the market-position conclusion need an S1
surface, on the same footing as an arithmetic error. Both change whether a reasonable
person signs. The supporting benchmark methodology table can stay S2 without loss, since
it is evidence for the conclusion rather than the conclusion.

### Cluster C: completeness gates wired to generators that never run

**Rows:** `playbook.md:252-263` (the 8-item Review Output Checklist),
`pharma-requirements.md:128-143` (the 11-item pharma checklist),
`commercial-analysis.md:25-31` and `:129` (the benchmark-sources and no-fabrication
assertions).

**This is the most severe finding in the audit, and the least visible.** The matrix
correctly upgrades each of these from a prose self-check to a code-enforced assertion:
the generator refuses to emit if a Hard Stop lacks its escalation contact, or if any of
the 11 pharma items lacks a stored disposition. That is exactly the pattern
`OPTIMIZATION-PRINCIPLES.md` calls the strongest available mechanism, because an
exception cannot be forgotten and an instruction can.

But each assertion is wired to the **Review Summary or Briefing generator**. In
redline-only mode that generator never executes, so the assertion never fires.

The upgrade therefore makes enforcement stronger in the two modes users rarely pick and
weaker in the default one. Nothing looks wrong on such a run: no output is missing, no
error is raised, the quality gate simply is not there. A silently absent gate is worse
than a prose instruction, because a prose instruction at least still gets read.

**Correction required:** completeness assertions belong at the **ledger** boundary, not
the generator boundary. The ledger is built in every mode. Assert on ledger completeness
before emission begins, then let each generator render from an already-validated ledger.
This is a structural fix, and it should be applied as a rule to every gate in the matrix
rather than to these four rows one at a time.

### Cluster D: two output-format rows with no named redline destination

`arithmetic-verification.md:82-88` (General Arithmetic Findings Format) and
`dpa-review-checklist.md:123-139` (DPA Review Output Format). Both say "ledger schema
plus generator" without naming which. Almost certainly intended to behave like `:91`.

**Correction required:** name the destination explicitly, matching `:91`. Cheap.

### Cluster E: a decided rescue routed into a mode redline-only users never invoke

Part 3 proposed carrying the **Compliance Evidence Checklist** into
`contract-stack-map.md` as a Stage 1 check, because that file is already the
document-family authority.

The Stage 1 placement is right. The SURFACE is not: the Stack Map is class S5, a
separate mode that exits at Step 0.5 and never runs Steps 1-7. A redline-only user never
invokes it. Marc has already decided this checklist survives precisely because it
matters on a redline-only run, so routing its output into the Stack Map would reintroduce
the loss his correction removed.

**Correction required:** keep the Stage 1 check where Part 3 put it, but its result
surfaces on the three decided surfaces (redline comment or front matter, Review Summary
register, deal-tab slice). The Stack Map may ALSO render it. It may not be the only
place.

---

## What this does not change

Most of the matrix is fine, and the reason is worth recording so the re-audit is not
re-run later on a hunch. Findings are clause-anchored, the redline is a clause-anchored
instrument, and SME escalation comments are inserted at the relevant clause
(`sme-matrix.md:5-20`). So the great majority of rows, roughly 240 of 307, reach a
redline-only user without any change at all.

The losses cluster in exactly one place: **judgments about the document as a whole**,
which have no clause to attach to and were therefore given to the two deliverables that
have room for a document-level narrative. That is a coherent design, and it was correct
while the dashboard existed and the score had a panel of its own. It stops being correct
once the default mode is the only one many users ever see.

## Status of O1 after this pass

- Output-mode column: DONE as a group classification plus exception register, with the
  deviation from "a literal column" stated above.
- Row-count reconciliation: DONE, 307 not 342.
- **Part 3 coverage sweep: STILL OWED.** Part 3's 37-row gap is not settled, so its
  coverage remains UNKNOWN and this matrix is still not a passed gate.

---

# Part 3 coverage sweep (O1, 2026-07-29)

Settles the 37-row gap. Part 3 reported 135 rows and delivered 98.

**Method.** Extracted every `file:line` citation in Part 3, built the covered line set per
source file, and inspected every uncited span of 5 lines or more against the source.

**Citation coverage by file:**

| File | Lines cited | Uncited spans of 5+ lines |
|---|---|---|
| `review-summary-design.md` | 118/165, 71% | 1-6, 8-14, 33-37, 83-87 |
| `pass-artifacts.md` | 99/123, 80% | 1-14 |
| `sme-matrix.md` | 119/139, 85% | none |
| `lilly-templates.md` | 147/164, 89% | 84-90 |
| `ai-standard.md` | 190/207, 91% | 1-8 |
| **`dashboard-canonical.md`** | **217/353, 61%** | 76-82, 85-95, 97-103, 105-109, 113-118, **124-223** |

## Verdict: both readings were right

The stale-estimate reading was right (Part 3 wrote 98 rows and reported a number it never
reconciled) **and** the never-written reading was right. The sweep found genuinely
uncovered content, and it is concentrated in exactly one span.

**`dashboard-canonical.md:124-223` is Panels 2 and 3, Legal Negotiation and Commercial
Analysis, 100 lines, and Part 3 never walked them.** Part A covered the layout shell,
Panel 1's sub-tabs, the anti-patterns and the Deal-tab contribution section. Panels 2 and
3 were skipped entirely.

Most of that content does survive, which is why this is a gap and not a disaster:
`pass-artifacts.md:64` already requires "pricing decomposition, per-unit economics,
discount architecture, value at risk, assumptions register, benchmark data with sources
and confidence" as Pass 3 output, `:73` and `:119` gate on it, `:90` carries historical
acceptance rate, and `review-summary-design.md` Section 06 carries negotiation strategy
and BATNA. Part 3 simply never connected Panels 2 and 3 to those homes.

## Four items with NO surviving home anywhere in the skill

Verified by grepping every reference file and `SKILL.md`. Each appears in
`dashboard-canonical.md` and nowhere else.

| Source | What it is | Status |
|---|---|---|
| `dashboard-canonical.md:132` | **Compliance Leverage** KPI on the Panel 2 Strategy sub-tab | No home. Not in any reference file or SKILL.md |
| `dashboard-canonical.md:132` | **Difficulty** KPI on the same row | No home in this skill. The concept exists in `negotiation-playbook-learning` but nothing in contract-review carries it |
| `dashboard-canonical.md:204` | **Governance carry-forward recommendations** (Renewal Strategy) | No home |
| `dashboard-canonical.md:205` | **Volume optimization opportunities** (Renewal Strategy) | No home |

`dashboard-canonical.md:183` cost waterfall chart is presentation only and correctly
retires with the dashboard. `:198-200` Discount Architecture survives via
`pass-artifacts.md:64`. `:202-203` renewal pricing protection survives via
`commercial-analysis.md:51-57`.

**These four are a fourth rescue candidate and are NOT decided.** Marc decided obligations
and the Compliance Evidence Checklist. He has not seen these, because Part 3 never
surfaced them. They are lower stakes than the first three: two are dashboard KPI tiles
whose underlying data may be reconstructible, and two are renewal-strategy
recommendations. But "lower stakes" is a judgment for Marc, and the same test applies:
does this change whether the contract should be signed, or how it should be negotiated.
Governance carry-forward and volume optimization are negotiation recommendations, which
argues they matter on any run that produces negotiation output.

## Two minor presentation gaps, no action needed

- `review-summary-design.md:7` fixes the output filename convention
  (`[Supplier]_Review_Summary_v[N].docx`). Not rowed. Generator template detail.
- `review-summary-design.md:33-37` section-number-badge layout technique. Not rowed,
  but covered in substance by Part 3's rows on the palette, typography and formatting
  rules all becoming generator template constants.

The other uncited spans (`pass-artifacts.md:1-14`, `ai-standard.md:1-8`,
`review-summary-design.md:1-6`) are titles and rationale framing, already covered by
Part 3's row on `pass-artifacts.md:15-19`. No loss.

## Cross-cutting catch: the insurance threshold check needs to know which paper governs

Not a coverage gap, but the sweep surfaced it and it affects the shared-implementation
list above.

`lilly-templates.md:90` records that the **US PO Terms & Conditions carry materially
different thresholds from the MSA templates: $25M cyber insurance versus $5M or more in
MSAs, and a 15-day cure period versus 30 days.**

The shared-implementation list names two insurance threshold sources, `playbook.md:152-160`
and `pharma-requirements.md:114-127`, and says the higher applicable minimum governs.
**There is a third**, and it is nearly an order of magnitude higher on cyber. A single
shared insurance check that is not aware of which paper governs will validate a PO-governed
contract against a $5M floor when the real floor is $25M, and pass it.

Same applies to the cure-period threshold in `playbook.md:170-178`, which assumes the MSA's
30 days.

**Correction required:** the shared threshold checks take the governing template as an
input. Stage 1 already identifies the template (`lilly-templates.md:37-83`, Part 3 Part E),
so the input is available. This is cheap to get right now and expensive to discover later,
because the failure mode is a silent pass.

## O1 status

All three parts of O1 are now done. Part 3's coverage is **KNOWN**, not UNKNOWN: 98 rows,
four named items with no surviving home, two minor presentation gaps, one cross-cutting
threshold catch.

**This matrix is still not a passed gate**, because the four rescue candidates above are
undecided and the five at-risk clusters from the output-mode audit are unapplied. It is
now an accurate map of what is owed, which it was not this morning.
# Part 1: mechanical and structural group

*Verbatim from `F1-COVERAGE-MATRIX-PART1-mechanical.md`. 119 rows (its own summary says 118).*


Covers `references/definition-tracing-checklist.md`, `references/arithmetic-verification.md`,
`references/dpa-review-checklist.md`, `references/risk-scoring.md`, `references/contract-stack-map.md`.
Built against `_audit/F1-CONTRACT-REVIEW-REDESIGN-SPEC.md` sections 3-6, 12.

**Summary.** 118 rows: 15 from definition-tracing-checklist.md, 16 from arithmetic-verification.md,
49 from dpa-review-checklist.md, 9 from risk-scoring.md, 29 from contract-stack-map.md. Destination
split: 6 rows land wholly in Stage 0 (deterministic location/extraction), 34 rows have a Stage 0/1
deterministic component feeding a pass, 61 rows are pass judgment (mostly Pass 2 and Pass 3, with
Pass 4 for scoring and QA), 17 rows are generator/schema output-spec requirements. **Zero hard
BLOCKERS.** Two soft open items are flagged (not blockers): the DPA checklist's exact pass number
is not stated anywhere in the current skill text I read, so I assigned it by content (scope/definition
items to Pass 2, substantive risk items to Pass 3) and flagged it for Marc's confirmation against
SKILL.md's actual pass list; and several SME-escalation lines depend on `sme-matrix.md`, which is
out of scope for this pass and will be covered in Part 2. `risk-scoring.md` was checked against spec
section 6 and matches exactly: starts at 100, Hard Stop is -15 in every column and never reduced. No
discrepancy found.

---

## A. `references/definition-tracing-checklist.md` (15 rows)

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| definition-tracing-checklist.md:16-19 Confidential Information | Trace definition location (MSA Exhibit A), flag broad carve-outs, check whether WO scope creates new info categories | Stage 0 defined-terms register locates the definition and every use (deterministic: where defined, everywhere used); Pass 2 (Governing Cross-Reference and Definition Tracing) performs the carve-out judgment and WO-scope classification | Different: location lookup moves to Stage 0 (was manual reading); judgment stays with Pass 2, now reading the register instead of raw prose | Unit test: Stage 0 register contains a "Confidential Information" entry with correct anchor for a fixture MSA; Pass 2 fixture test asserts a finding is raised when WO scope introduces a category not in the carve-out list |
| definition-tracing-checklist.md:21-24 Work Product/Deliverables | Trace what is assigned to Lilly, whether assignment covers everything under the WO or only named items | Stage 0 register locates definition; Pass 2 classifies WO deliverables against it | Same judgment, different input (register vs. raw text) | Golden-fixture test: Pass 2 finding on Work Product scope present in both old and new runs |
| definition-tracing-checklist.md:26-29 Lilly Property | Trace full scope of what Lilly owns/controls, including data derivatives, model outputs, AI insights | Stage 0 register locates definition; Pass 2 judges whether WO scope excludes something that should be included | Same judgment, relocated input | Golden-fixture test: Lilly Property finding present in both runs |
| definition-tracing-checklist.md:33-36 Personal Information/PHI | Trace SPS Exhibit A data-subject categories against WO scope | Stage 0 register locates SPS definition; Pass 2 (or Pass 3 if DPA checklist is loaded there — see dpa-review-checklist.md rows below) classifies new data-subject categories | Same judgment, relocated input | Golden-fixture test: PI/PHI category finding present in both runs |
| definition-tracing-checklist.md:38-43 Lilly Information vs. Usage Data | Trace where supplier's data-use rights end; flag mislabeled human-generated content as "Usage Data" | Stage 0 register locates both definitions and their exclusions; Pass 2 performs the classification, including the "common failure" mislabeling check | Different: Stage 0 can flag the SAME two definitions existing (structural fact) as a Stage 1 candidate ("both terms defined, in scope for check"); the classification of specific data types remains Pass 2 judgment — this needs meaning per spec section 5, so it cannot become Stage 1 alone | Golden-fixture test: mislabeling finding (human labels as Usage Data) present in both runs; Pass 2 unit test on a synthetic clause exercising the failure pattern |
| definition-tracing-checklist.md:45-48 Services Supportive Technology | Trace whether definition covers AI/ML tools, cross-reference AI Standard for a differently-named same concept | Stage 0 register locates both terms; Pass 2 judges conceptual overlap between differently-worded definitions | Same judgment (this is exactly the "novel wording, same effect" case spec section 5 reserves for the model) | Golden-fixture test: cross-reference finding present in both runs |
| definition-tracing-checklist.md:52-55 Automated System/AI System/AI Model | Trace whether supplier platform meets definition, HITL component, High/Low-Impact classification trigger | Stage 0 register locates the AI Standard definition; Pass 2 judges platform-fit and impact classification | Same judgment, relocated input | Golden-fixture test: AI System classification finding present in both runs |
| definition-tracing-checklist.md:57-61 Supplier Training Content vs. Lilly Training Content vs. Lilly Content | Trace what supplier can use for training vs. restricted-to-Lilly use; flag conflict with WO's HITL description | Stage 0 register locates all three definitions and the AI Standard restriction section; Pass 2 performs the conflict judgment against the WO's HITL text | Same judgment, relocated input | Golden-fixture test: HITL/training conflict finding present in both runs |
| definition-tracing-checklist.md:63-66 Output/Lilly Automated Property/Supplier Automated Property | Trace output and trained-model ownership; cross-reference MSA Work Product assignment clause | Stage 0 register locates both the AI Standard and MSA Work Product clauses (this is exactly a cross-reference-graph case, Pass 2's strongest deterministic win per spec:94-96); Pass 2 judges whether both clauses actually assign the same thing | Different: the cross-reference RESOLUTION (does the MSA clause exist and is it the one referenced) becomes a Stage 1 candidate check; whether the assignment is COMPLETE is Pass 2 judgment | Golden-fixture test: ownership finding present in both runs; Stage 1 unit test that the MSA Work Product cross-reference resolves |
| definition-tracing-checklist.md:68-71 AR Provider | Trace whether supplier uses third-party AI providers, disclosure, Subcontractor treatment | Stage 0 register locates definition and any Addendum A disclosure form; Pass 2 judges adequacy of disclosure | Same judgment, relocated input | Golden-fixture test: AR Provider disclosure finding present in both runs |
| definition-tracing-checklist.md:73-86 Trace Output Format (structured working-notes template) | Requires each traced definition be recorded in a fixed template (Source/Text/Includes/Excludes/WO Scope Classification/Conflict/Finding Impact) | Pass-artifact schema (part of the Stage 1/pass-artifact validated schema the spec calls for in section 12, "Output specs... become generator templates, enforced rather than merely described"); Pass 2 populates it, schema validator enforces required fields are present per traced term | Same content requirement, enforcement moves from instruction to schema validation (was prose instruction, becomes an assertion, mirroring what section 6 does for Rule 12) | Schema unit test: a working-notes record missing any of the seven required fields fails validation before the run can proceed to Pass 4 |
| definition-tracing-checklist.md:90 Anti-Drift bullet 1: relevant definition has been traced | Manual instruction to verify a working-notes entry exists before a finding is generated | Pass 2 gate check, enforced by the same schema validator as the output-format row above (a finding citing a term with no corresponding trace entry fails validation) | Different: moves from an instruction the model must remember to a code-enforced precondition | Unit test: attempting to emit a data/AI/IP/confidentiality finding with no matching trace record raises a validation error |
| definition-tracing-checklist.md:91 Anti-Drift bullet 2: finding cites the specific definition and explains why it applies | Manual instruction that findings must cite their governing definition | Findings-ledger schema requires a `definition_citation` field for findings in the covered categories; Pass 2 populates it | Different: schema-enforced field, not a style reminder | Schema unit test: finding record in the affected categories missing `definition_citation` fails validation |
| definition-tracing-checklist.md:92 Anti-Drift bullet 3: ambiguity between definitions must be stated with protective-classification recommendation | Manual instruction for handling conflicting definitions | Pass 2 judgment, unchanged — this is squarely "obligation interpretation where drafting is ambiguous," which spec section 5 reserves for the model | Same, no change | Golden-fixture test: an ambiguity finding present in the fixture states both conflicting definitions and recommends the protective classification |
| definition-tracing-checklist.md:93 Anti-Drift bullet 4: finding must not flag a risk the governing documents already resolve | Manual instruction against false-positive findings that duplicate a resolved point | Pass 2 judgment, unchanged, cross-checked against Stage 0's cross-reference graph (code can at least confirm the "resolving" clause exists, which narrows but does not decide) | Same judgment; Stage 0 narrows by confirming the resolving clause is real | Golden-fixture test: no finding in the fixture output duplicates a point the MSA definitions already resolve |

## B. `references/arithmetic-verification.md` (16 rows)

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| arithmetic-verification.md:8 3E-1.1 Verify line-item math (rate × hours = line total) | Model recomputes every row of every pricing table | Stage 1 deterministic candidate check: numeric register holds every rate/hours/total triple; code recomputes and flags mismatches as candidates | Different: was model arithmetic, now code arithmetic with model adjudicating only flagged mismatches | Unit test: `numeric_kernel` (or equivalent) fixture with a deliberately wrong line total is flagged; a correct table produces zero candidates |
| arithmetic-verification.md:9 3E-1.2 Verify category subtotals | Model sums line items and compares to stated subtotal | Stage 1 deterministic candidate check | Different, same reasoning as above | Unit test: fixture with a wrong subtotal is flagged |
| arithmetic-verification.md:10 3E-1.3 Verify grand total | Model sums subtotals + expenses + taxes vs. stated total | Stage 1 deterministic candidate check | Different | Unit test: fixture with wrong grand total is flagged |
| arithmetic-verification.md:11 3E-1.4 Verify NTE/commitment | Model checks fees + expenses = NTE | Stage 1 deterministic candidate check | Different | Unit test: fixture with NTE mismatch is flagged |
| arithmetic-verification.md:12 3E-1.5 Cross-reference rate tables for consistency across tables | Model compares equivalent roles/skill levels across multiple rate tables | Stage 1 deterministic candidate check (numeric register keyed by role, cross-table diff) | Different | Unit test: fixture with two tables quoting different rates for the same role is flagged |
| arithmetic-verification.md:13 3E-1.6 Flag discrepancies regardless of direction, including errors favoring Lilly | Model rule: always flag, regardless of who benefits | Stage 1 rule: candidate generation is direction-agnostic by construction (it flags any nonzero delta); Pass 3 confirms disposition and keeps the credibility framing in the finding text | Same rule, code-enforced rather than remembered | Unit test: a fixture error in Lilly's favor still produces a candidate; regression test asserts no direction-based suppression exists in the candidate generator |
| arithmetic-verification.md:19-25 3E-2.1 Identify escalation mechanism and its pattern (fixed %, CPI, tiered, negotiated, step-up) | Model reads and classifies the escalation clause type | Stage 0 extracts the escalation clause text into the numeric/date register (deterministic location); Pass 3 (Commercial) classifies which pattern applies, since pattern classification from prose is judgment, not a true/false fact | Different: location becomes Stage 0; classification stays Pass 3 | Golden-fixture test: escalation clause classification finding matches between old and new runs |
| arithmetic-verification.md:26-29 3E-2.2 Determine compounding vs. simple, flag ambiguity and calculate both | Model determines method, or computes both if ambiguous | Stage 1 computes both compounding and simple results as candidates whenever the register cannot determine method from an unambiguous keyword match; Pass 3 judges which applies or confirms genuine ambiguity | Different: the "calculate both" arithmetic moves to Stage 1 (free, deterministic); the ambiguity call and clarification-item disposition stays Pass 3 | Unit test: given an ambiguous escalation string, Stage 1 emits both computed values; golden-fixture test confirms Pass 3 still flags it as a clarification item |
| arithmetic-verification.md:31-36 3E-2.3 Verify every stated increased rate against the formula, same precision as document | Model applies formula step by step and compares to stated rate | Stage 1 deterministic candidate check, precision-matched to the document's stated decimal places (numeric register carries precision) | Different, same reasoning as 3E-1 rows | Unit test: fixture with a rate that fails formula verification at stated precision is flagged; a rate correct to the penny is not falsely flagged by floating-point rounding (explicit precision-matching test) |
| arithmetic-verification.md:38-41 3E-2.4 Verify cumulative totals reflect correct escalated rates, recalculate period and grand totals | Model recalculates full escalation schedule totals | Stage 1 deterministic candidate check | Different | Unit test: fixture with a wrong cumulative total across periods is flagged |
| arithmetic-verification.md:43-48 3E-2.5 Verify renewal pricing against governing agreement's cap; flag absence of cap as protection gap; flag new rates for benchmarking | Model checks renewal increase against MSA cap, flags missing cap, flags new uncarded rates | Stage 1 candidate: numeric comparison of stated increase vs. extracted cap value is deterministic (policy-threshold check, spec:81 "a numeric value sits outside a policy threshold"); "cap absent = protection gap" and "flag new rate for benchmarking" require judgment about materiality, so those stay Pass 3 | Different: the numeric cap comparison narrows to Stage 1; the protection-gap characterization and benchmarking recommendation stay Pass 3 | Golden-fixture test: cap-exceeded HIGH RISK finding present in both runs; unit test that Stage 1 correctly extracts and compares the cap number |
| arithmetic-verification.md:50-56 3E-2.6 Check for hidden increases (role reclassification, scope restructuring, fee restructuring, volume/rate tradeoffs, duplicate line items, unbundled fees) | Model pattern-matches six vendor tactics from vendor-tactics.md's effort-padding detection | Pass 3, unchanged — this is retrieval-plus-judgment over a judgment corpus (vendor-tactics.md), explicitly the kind of check spec section 12 says "mostly stay with the model"; Stage 0 can index vendor-tactics.md so Pass 3 loads only relevant entries (token saving, not an accuracy change) | Same judgment; token-cost optimization only | Golden-fixture test: hidden-increase findings (e.g., role reclassification) present in both runs |
| arithmetic-verification.md:58-64 3E-2.7 Change-Order-specific verification (additive vs. replacement, rate-card match, revised NTE math, credit-rate consistency, hours reasonableness) | Model checks five CO-specific conditions, one of which (hours reasonableness) explicitly calls vendor-tactics.md | The four arithmetic sub-checks (additive math, rate match, revised NTE, credit-rate consistency) are Stage 1 deterministic candidates; "hours reasonableness" is Pass 3 judgment via vendor-tactics.md, same as the row above | Different for the four arithmetic items; same for hours reasonableness | Unit test: fixture CO with a miscalculated revised NTE is flagged by Stage 1; golden-fixture test for hours-reasonableness finding continuity |
| arithmetic-verification.md:67-78 3E-3 Price Increase Findings Format (fixed output template) | Model authors a finding block with 8 named fields | Findings-ledger schema (validated); a generator renders it into the Redline/.docx and Review Summary outputs from ledger fields, not free model prose | Different: schema-enforced structure, generator-rendered, not model-formatted text | Schema unit test: a Stage 1/Pass 3 price-increase finding missing any of the 8 required fields fails validation; generator snapshot test on the rendered block |
| arithmetic-verification.md:82-88 3E-4 General Arithmetic Findings Format (fixed output template) | Model authors a finding block with 5 named fields | Findings-ledger schema (validated), generator-rendered | Different, same reasoning as row above | Schema unit test on required fields; generator snapshot test |
| arithmetic-verification.md:91 Critical rule: arithmetic/pricing errors always flagged as tracked change AND comment AND included in Review Summary Commercial Analysis; cap-exceeding errors always HIGH RISK | Cross-deliverable consistency rule spanning three outputs | Findings-ledger single source of truth: a finding tagged `category: arithmetic` or `category: pricing` carries `must_appear_in: [redline_tracked_change, redline_comment, review_summary_commercial]` and `severity: HIGH` is enforced when `cap_exceeded: true`; the three generators all read the same ledger entry, so they cannot disagree | Different: was a rule the model had to remember across three separate authoring passes, becomes a single ledger record three generators read | Cross-deliverable consistency test: for every arithmetic/pricing finding in the ledger, assert it appears in all three rendered outputs, and that `cap_exceeded: true` implies `severity: HIGH` |

## C. `references/dpa-review-checklist.md` (49 rows)

Open item flagged once here rather than per-row: this file does not state which pass loads it, and
neither did the portions of SKILL.md read for this pass. I have assigned scope/definition items to
Pass 2 (Governing Cross-Reference and Definition Tracing, since DPA scope questions are definitional)
and substantive risk/liability items to Pass 3 (Commercial, Tactics, Pharma). **Confirm the actual
pass assignment against SKILL.md before implementation**; this does not block the matrix because the
row lands in "a pass" either way, only the specific pass number is unconfirmed.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| dpa-review-checklist.md:7-11 When This Applies (4 trigger conditions) | Manual instruction for when to load this checklist | Stage 0 document-family map flags DPA-in-scope deterministically (document under review IS a DPA, or a DPA/BAA is referenced/attached, or PI/Lilly Information processing is present in scope) — this is a structural fact, not judgment | Different: trigger condition becomes a Stage 0 flag rather than a manual read-and-decide | Unit test: fixture family containing a DPA exhibit sets the `dpa_in_scope` flag; a family without one does not |
| dpa-review-checklist.md:23 Processing scope completeness | Lilly requires DPA cover all PI processed by/for Lilly; flag vendor narrowing | Pass 2/3 judgment (semantic scope comparison) | Same | Golden-fixture test: scope-narrowing finding present in both runs |
| dpa-review-checklist.md:24 Personal Information definition breadth | Must align with broadest applicable definition (GDPR+CCPA+local); flag narrow vendor definition | Pass 2/3 judgment | Same | Golden-fixture test: narrow-definition finding present in both runs |
| dpa-review-checklist.md:25 Processor/Controller roles | Vendor must be Processor, not claim Controller | Stage 1 candidate: exact-string check for "Controller" self-designation is a deterministic text-match candidate; Pass 2/3 confirms materiality | Different: exact-match narrows, judgment confirms | Unit test: fixture vendor DPA asserting Controller status produces a Stage 1 candidate; golden-fixture test confirms the finding survives to output |
| dpa-review-checklist.md:26 Sub-processing consent mechanism | Must address sub-processor use with Lilly consent; flag no-notification claim | Pass 2/3 judgment | Same | Golden-fixture test: consent-mechanism finding present in both runs |
| dpa-review-checklist.md:32 Purpose limitation | Vendor processes only per Lilly instructions; flag "legitimate business purposes"/"service improvement" reservations | Pass 2/3 judgment (this is precisely playbook-position matching beyond exact-clause match, spec section 5) | Same | Golden-fixture test: purpose-limitation finding present in both runs |
| dpa-review-checklist.md:33 No secondary use | Flag analytics/benchmarking/aggregated-data carve-outs | Pass 2/3 judgment | Same | Golden-fixture test: secondary-use carve-out finding present in both runs |
| dpa-review-checklist.md:34 AI/ML training restriction | No training use without separate written agreement; flag silence or broad consent | Pass 2/3 judgment, cross-referenced with AI Standard definitions (Stage 0 register supplies the cross-reference) | Same judgment; Stage 0 narrows the lookup | Golden-fixture test: AI-training finding present in both runs |
| dpa-review-checklist.md:35 Aggregation/anonymization restriction | Flag vendor claiming aggregated/anonymized data as non-personal | Pass 2/3 judgment | Same | Golden-fixture test: aggregation-claim finding present in both runs |
| dpa-review-checklist.md:37 Escalation: secondary use/AI training/aggregation carve-out → Legal AIPC | SME routing instruction | Pass 4 QA/routing step reads sme-matrix.md (out of scope for this pass, covered in Part 2); ledger `sme_routing` field populated with the mailbox | Same, routing target unchanged; enforcement moves to a required ledger field | Golden-fixture test: SME routing entry for Legal AIPC present when any of the three triggering findings exist |
| dpa-review-checklist.md:43 Breach notification timeline (72 hours) | Flag/Hard-Stop if timeline exceeds 72 hours | Stage 1 deterministic candidate: numeric/date register extracts the stated hour value, compares to the 72-hour policy threshold (spec:81, exact case of "numeric value outside a policy threshold") | Different: numeric comparison becomes Stage 1; Pass 3 confirms Hard Stop disposition and escalation | Unit test: fixture stating "96 hours" produces a Stage 1 Hard-Stop candidate; a fixture at "72 hours" or less produces none |
| dpa-review-checklist.md:44 Breach notification content requirements | Flag vague/incomplete notification content spec | Pass 2/3 judgment (semantic completeness check against 4 named content elements) | Same | Golden-fixture test: content-vagueness finding present in both runs |
| dpa-review-checklist.md:45 Cooperation with investigation | Flag "commercially reasonable efforts" limitation | Pass 2/3 judgment | Same | Golden-fixture test: cooperation-limitation finding present in both runs |
| dpa-review-checklist.md:46 Law enforcement delay discretion | Flag vendor discretion to delay notification | Pass 2/3 judgment | Same | Golden-fixture test: delay-discretion finding present in both runs |
| dpa-review-checklist.md:48 Hard Stop: breach notification >72 hours → escalate Legal AIPC | Explicit Hard Stop rule tied to row above | Stage 1 candidate feeds Pass 3, which applies the Hard Stop severity and the deduction_score() -15 (never reduced, section 6); ledger records `hard_stop: true` | Different: numeric detection is Stage 1; Hard Stop severity assignment and scoring stays a pass/kernel function, unchanged in judgment | Unit test: `deduction_score()` unit test asserts a Hard-Stop finding always deducts exactly -15 regardless of coverage column |
| dpa-review-checklist.md:54 Prior consent for sub-processors | Flag general-authorization-without-notification pattern | Pass 2/3 judgment | Same | Golden-fixture test: prior-consent finding present in both runs |
| dpa-review-checklist.md:55 Notification before engaging new sub-processors, ≥30-day notice | Flag missing mechanism or <30-day notice | Stage 1 candidate for the numeric 30-day threshold (date register); Pass 2/3 judges mechanism adequacy beyond the number | Different: numeric piece narrows to Stage 1; mechanism-adequacy stays judgment | Unit test: fixture stating a 10-day notice period produces a Stage 1 candidate; golden-fixture test on the full finding |
| dpa-review-checklist.md:56 Flow-down of equivalent obligations to sub-processors | Flag absence of equivalent-protection flow-down | Pass 2/3 judgment | Same | Golden-fixture test: flow-down finding present in both runs |
| dpa-review-checklist.md:57 Sub-processor list maintained and shared | Flag no list or refusal to disclose | Pass 2/3 judgment (existence check on a factual claim, but "refuses to disclose" requires reading surrounding negotiation context, so kept as judgment rather than Stage 1) | Same | Golden-fixture test: sub-processor-list finding present in both runs |
| dpa-review-checklist.md:58 AI providers treated as sub-processors | Flag exclusion of LLM/AI providers from sub-processor treatment, cross-ref AI Standard §9 | Pass 2/3 judgment, cross-referenced via Stage 0's document-family map to the AI Standard exhibit | Same judgment; Stage 0 narrows the cross-reference | Golden-fixture test: AI-provider-exclusion finding present in both runs |
| dpa-review-checklist.md:59 Sub-processor liability | Flag vendor disclaiming liability for sub-processor actions | Pass 2/3 judgment | Same | Golden-fixture test: liability-disclaimer finding present in both runs |
| dpa-review-checklist.md:61 Critical note: AI/LLM providers must be sub-processors with flow-down | Elevated emphasis note, same substance as row above | Folded into the same Pass 2/3 finding and ledger `category: AI Governance` tag; not a separate check, a severity/emphasis instruction | Same, no separate mechanism needed | Covered by the golden-fixture test on the row above |
| dpa-review-checklist.md:67 DSAR cooperation, no fee-limiting | Flag assistance limits or DSAR fees | Pass 2/3 judgment | Same | Golden-fixture test: DSAR-cooperation finding present in both runs |
| dpa-review-checklist.md:68 DSAR response timeline ≤10 business days | Flag timeline exceeding 10 business days | Stage 1 candidate for the numeric 10-day threshold; Pass 2/3 confirms materiality against Lilly's own regulatory deadline | Different: numeric piece narrows to Stage 1 | Unit test: fixture stating 20 business days produces a Stage 1 candidate |
| dpa-review-checklist.md:69 Deletion capability, individual not just bulk | Flag inability to delete individual records | Pass 2/3 judgment | Same | Golden-fixture test: deletion-capability finding present in both runs |
| dpa-review-checklist.md:70 Data portability format/fees | Flag limited export formats or portability fees | Pass 2/3 judgment | Same | Golden-fixture test: portability finding present in both runs |
| dpa-review-checklist.md:76 Transfer mechanism (SCCs/adequacy/BCRs) | Flag absence of any transfer mechanism when data crosses borders | Pass 2/3 judgment (requires identifying whether cross-border transfer occurs at all, itself a judgment call on described data flows) | Same | Golden-fixture test: transfer-mechanism finding present in both runs |
| dpa-review-checklist.md:77 US data residency for pharma data | Flag processing/storage outside US without Lilly consent | Pass 2/3 judgment (pharma-specific, may also load pharma-requirements.md, out of scope for this pass) | Same | Golden-fixture test: residency finding present in both runs |
| dpa-review-checklist.md:78 Transfer impact assessment availability | Flag no TIA or refusal to share | Pass 2/3 judgment | Same | Golden-fixture test: TIA finding present in both runs |
| dpa-review-checklist.md:79 Government access disclosure process | Flag no disclosure process | Pass 2/3 judgment | Same | Golden-fixture test: government-access finding present in both runs |
| dpa-review-checklist.md:81 Escalation: cross-border transfer without mechanism → Legal AIPC + Cyber ISS | SME routing instruction | Pass 4 routing step, ledger `sme_routing` field (both mailboxes) | Same target, enforcement via required field | Golden-fixture test: dual SME routing entries present when transfer-mechanism finding exists |
| dpa-review-checklist.md:87 ISS compliance reference | Flag DPA silent on or refusing ISS compliance | Pass 2/3 judgment, cross-referenced to InfoSec Standard exhibit via Stage 0 document-family map | Same judgment; Stage 0 narrows lookup | Golden-fixture test: ISS-compliance finding present in both runs |
| dpa-review-checklist.md:88 Encryption minimums (TLS 1.2+, AES-256) | Flag weaker standards or no commitment | Stage 1 candidate: exact-string/threshold match against named standards (TLS version number, AES key length) is deterministic; Pass 2/3 confirms materiality of any gap found | Different: version/key-length matching narrows to Stage 1 | Unit test: fixture stating "TLS 1.0" produces a Stage 1 candidate |
| dpa-review-checklist.md:89 Access controls (RBAC, least privilege, MFA) | Flag no access-control requirements or MFA resistance | Pass 2/3 judgment | Same | Golden-fixture test: access-control finding present in both runs |
| dpa-review-checklist.md:90 Incident response plan, tested annually | Flag no commitment or untested plan | Pass 2/3 judgment | Same | Golden-fixture test: incident-response finding present in both runs |
| dpa-review-checklist.md:91 Security audit rights | Flag limited/eliminated audit rights | Pass 2/3 judgment | Same | Golden-fixture test: audit-rights finding present in both runs |
| dpa-review-checklist.md:93 Escalation: security concerns → Cyber ISS Review | SME routing instruction | Pass 4 routing step, ledger field | Same target, field-enforced | Golden-fixture test: Cyber ISS routing entry present when a security finding exists |
| dpa-review-checklist.md:99 Post-termination return ≥90 days, usable format | Flag return period <90 days or unspecified format | Stage 1 candidate for the numeric 90-day threshold; Pass 2/3 judges format adequacy | Different: numeric piece narrows to Stage 1 | Unit test: fixture stating 30-day return produces a Stage 1 candidate |
| dpa-review-checklist.md:100 Destruction certification | Flag no certification requirement or vendor retains copies | Pass 2/3 judgment | Same | Golden-fixture test: destruction-certification finding present in both runs |
| dpa-review-checklist.md:101 Residual data (no copies except by law) | Flag vendor retaining "anonymized"/"aggregated" copies post-termination | Pass 2/3 judgment | Same | Golden-fixture test: residual-data finding present in both runs |
| dpa-review-checklist.md:102 Backup destruction within reasonable period | Flag claimed inability to delete from backups or indefinite retention | Pass 2/3 judgment | Same | Golden-fixture test: backup-destruction finding present in both runs |
| dpa-review-checklist.md:108 Audit right over data processing | Flag DPA eliminating/limiting audit rights | Pass 2/3 judgment | Same | Golden-fixture test: audit-right finding present in both runs |
| dpa-review-checklist.md:109 Third-party attestation (SOC 2/ISO 27001) | Flag no attestation or attestation not covering data processing | Stage 1 candidate for named-standard presence check (exact string match on "SOC 2 Type II"/"ISO 27001"); Pass 2/3 judges coverage adequacy | Different: presence check narrows to Stage 1 | Unit test: fixture with no named attestation string produces a Stage 1 candidate |
| dpa-review-checklist.md:110 Audit for cause, no annual limitation | Flag restricted/eliminated for-cause audit right | Pass 2/3 judgment | Same | Golden-fixture test: for-cause audit finding present in both runs |
| dpa-review-checklist.md:111 Compliance demonstration on request | Flag vendor limiting to attestation only | Pass 2/3 judgment | Same | Golden-fixture test: compliance-demonstration finding present in both runs |
| dpa-review-checklist.md:117 Data breach liability (notification/monitoring/remediation costs) | Flag vendor capping or excluding breach costs | Pass 2/3 judgment | Same | Golden-fixture test: breach-liability finding present in both runs |
| dpa-review-checklist.md:118 Indemnification for DPA non-compliance | Flag no indemnification or low cap | Pass 2/3 judgment; low-cap numeric comparison against Lilly's floor value is a Stage 1 candidate if a floor threshold exists in policy, otherwise pure judgment | Same, with a possible Stage 1 numeric narrowing when a policy floor is defined | Golden-fixture test: indemnification finding present in both runs |
| dpa-review-checklist.md:119 Regulatory fines liability | Flag vendor excluding regulatory fines from liability | Pass 2/3 judgment | Same | Golden-fixture test: regulatory-fines finding present in both runs |
| dpa-review-checklist.md:123-139 DPA Review Output Format (fixed template: source, baseline assessment, gaps found, SME routing, recommendation) | Model authors this block from findings | Findings-ledger schema plus generator; the "Baseline Assessment" line and gap count are generated arithmetic (count of gaps by severity), not authored prose; the Recommendation line is Pass 3/4 judgment rendered into the template | Different for structure/counts (schema+generator); same for the Recommendation judgment | Schema unit test: gap count in the rendered block equals `len(ledger.findings where category==DPA)`; golden-fixture test on Recommendation continuity |

## D. `references/risk-scoring.md` (9 rows)

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| risk-scoring.md:11 Starting point 100 | Score always starts at 100 | `deduction_score()` in `lilly-procurement-kernels` (kernel, item C1 per spec:140) | Same, now an enforced constant in code rather than an instruction | Unit test: `deduction_score([])` returns 100 |
| risk-scoring.md:13-21 Deduction table (severity × coverage-column ranges) | Look up a deduction range by severity and PASS_2_COVERAGE status | `deduction_score()` encodes the table as a lookup structure (dict or match) returning the applicable range per (severity, coverage_status) pair; model still supplies severity and coverage status per finding (spec:147-148, unchanged judgment inputs) | Same table, same judgment inputs; arithmetic and range lookup move to code | Unit test: for every (severity, coverage_status) pair in the table, `deduction_score()` returns a value inside the documented range; parametrized test enumerates all 20 cells |
| risk-scoring.md:17,31 Hard Stop is always -15, never reduced, in every coverage column | Explicit invariant that Hard Stops do not vary by coverage status | `deduction_score()` enforces this as a hard branch: `if severity == "Hard Stop": deduction = -15` before any coverage-column lookup, matching spec:146-148's requirement that this be an invariant the function enforces and raises on if violated | **Verified against spec section 6: matches exactly, no discrepancy.** Spec says "Hard Stops always -15 and never reduced" and the table independently shows -15 in all four columns for Hard Stop | Unit test: `deduction_score()` returns -15 for a Hard Stop finding regardless of which coverage_status is passed; test explicitly tries all four coverage values and asserts identical output |
| risk-scoring.md:23-30 "How to use" procedure (identify category, look up PASS_2_COVERAGE, select range column, use judgment within range, sum) | Five-step manual procedure a reviewer/model follows by hand | Steps 1-2 (category identification, PASS_2_COVERAGE lookup) are Pass 2 output already in the ledger by the time Pass 4 runs; step 3 (column selection) and the sum are `deduction_score()` arithmetic; step 4 (judgment within the range, e.g. low end for editing errors) remains model judgment, supplied as the specific deduction value passed into the function, not computed by it | Different: steps 1-3 and 5 move to code/ledger lookup; step 4's judgment call is unchanged, it just becomes a function input instead of freeform arithmetic | Unit test: `deduction_score()` correctly sums a list of per-finding deductions and subtracts from 100; golden-fixture test that the model's within-range judgment values match the worked example |
| risk-scoring.md:37-42 Scale/Label/Color/Meaning table (75-100 Low ... 0-24 Critical) | Maps final score to a residual-risk label and color | `deduction_score()` (or a thin wrapper) returns the label alongside the numeric score, since the band boundaries are exact deterministic thresholds | Same thresholds, now code-enforced rather than a lookup the model performs by eye | Unit test: scores of 100, 75, 74, 50, 49, 25, 24, 0 map to the correct label at each boundary (off-by-one boundary test) |
| risk-scoring.md:46-50 Score Methodology Display (dashboard/Review Summary narrative beneath the score) | Model authors a prose paragraph following a fixed template with N-of-14 covered count, Hard Stop count, brief characterization | Generator renders the fixed-structure parts (score, covered-category count, Hard Stop count) directly from `deduction_score()`'s output and the ledger, so the numbers cannot disagree with the score (spec:150-151, "It becomes generator output rather than model prose, so it cannot disagree with the score"); the one free-text clause ("brief characterization of findings") remains model-authored narrative slotted into the template | Different: numeric parts become generator output; the one-sentence characterization stays model prose | Generator snapshot test: rendered methodology text's numbers match `deduction_score()` output exactly; golden-fixture test that the characterization sentence still appears |
| risk-scoring.md:52-72 Worked Example (Supplier A WO 10, -36 deductions, score 64) | Illustrative worked example used to teach the formula | Becomes the **unit fixture for `deduction_score()`** per spec:184-185 ("the natural first unit fixture") | Same content, repurposed as an executable test fixture rather than documentation prose | Unit test: feeding the 11 findings and their documented severity/coverage/deduction values into `deduction_score()` reproduces -36 total and score 64 exactly |
| risk-scoring.md:76-81 Anti-Drift Calibration, Rule 12: zero Hard Stops + 10+/14 categories Covered + mostly-alignment findings should not exceed 30-point deduction | Instruction to re-check for Standalone-column misuse when this pattern occurs | `deduction_score()` **raises** on this condition per spec:145-146 ("raises on the Rule 12 calibration check ... rather than leaving it as an instruction") rather than the model being asked to remember to re-check | Different: moves from an instruction the model might skip to a hard assertion the function enforces | Unit test: constructing a finding set meeting all three conditions with a deduction >30 causes `deduction_score()` to raise; a set at exactly 30 does not raise |
| risk-scoring.md:83-84 Anti-Drift Calibration, converse check: standalone document with 5+ findings and <25-point deduction is too generous | Instruction to re-check for over-generous Standalone scoring | Not explicitly named as a `raise` condition in spec section 6, which only names the Rule 12 (>30-point) direction. This converse check should be added to `deduction_score()`'s validation as a second assertion for parity, since the spec's stated invariant ("raises on the Rule 12 calibration check") does not on its face cover this direction. **Flagged for confirmation, not a blocker**: implement as a second raise condition unless Marc says this direction is advisory only | Different: proposed to move from instruction to a second hard assertion, pending confirmation this was intended to be included under "the Rule 12 calibration check" or is a separate check | Unit test (pending the above confirmation): a standalone document with 5+ findings and <25-point total deduction causes `deduction_score()` to raise or warn, mirroring the >30-point test |

## E. `references/contract-stack-map.md` (29 rows)

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| contract-stack-map.md:7-9 Purpose/non-duplication: this mode never produces findings, redlines, Protection Score, tiers, position cards, concession strategy, SME routing, or Go/No-Go | Scope-boundary rule for the Stack Map generator | Generator-level constraint: the Stack Map generator template has no fields for any of those items; a schema validator rejects a manifest containing them | Same rule, enforced by schema absence rather than an instruction to "stop" | Unit test: manifest schema has no `findings`, `risk_score`, `sme_routing`, or `recommendation` fields; any such key present fails validation |
| contract-stack-map.md:11 Distinction from Documents dashboard sub-tab (dashboard-canonical.md Panel 1) | Clarifies this mode is legal-hierarchy analysis, not records-management register; both run unchanged and independently | Retained as a design note in the generator's documentation; since dashboard-canonical.md is RETIRED per spec section 2/12 item 3, this cross-reference needs updating to point at whatever surfaces the Documents sub-tab post-retirement (likely the Deal dashboard) rather than the retired JSX file | Different: the cross-reference target changes because of the JSX retirement, though the distinction itself is unchanged | Review-note check: confirm the successor surface for the "Documents sub-tab" exists and this file's cross-reference is updated before the Stack Map generator ships, not silently left pointing at a retired file |
| contract-stack-map.md:21-39 Content item 1: Document Hierarchy Map (tree, VERIFIED/ASSUMED/NOT REVIEWED labeling) | Model builds a hierarchy tree from incorporation language or template shape | Stage 0 document-family map builds the tree structurally (deterministic: which document references which, by filename/exhibit letter/title); the VERIFIED vs. ASSUMED distinction requires the model to have actually read confirming incorporation language, so labeling stays a pass judgment (Pass 1/2, verifying Stage 0's structural guess against real text, matching spec:89-92's Pass-1-verifies-Stage-0 principle exactly) | Different: raw tree assembly narrows to Stage 0; the VERIFIED/ASSUMED/NOT REVIEWED confidence label per edge stays a pass judgment, and per the HARD RULE, a Stage 0 guess may never be silently upgraded to VERIFIED | Golden-fixture test: hierarchy tree structure matches; unit test that Stage 0 never auto-labels an edge VERIFIED (only a pass step can) |
| contract-stack-map.md:41 Cross-check tree shape against lilly-templates.md hierarchy | Model compares tree shape to the reference template hierarchy | Stage 0 can do the structural comparison (deterministic diff against a known template shape) for Lilly-paper families; Pass 1/2 judges supplier-paper families since template shape does not apply | Different for Lilly paper (narrows to Stage 0); same judgment for supplier paper | Unit test: a Lilly-paper fixture's tree diffed against the template shape flags a structural deviation; golden-fixture test for supplier-paper judgment continuity |
| contract-stack-map.md:44-54 Content item 2: Effective Dates table, do not calculate unstated renewal dates | Model extracts dates per document, explicit prohibition on inferring an unstated formula | Stage 0 date register extracts all stated dates deterministically (this is exactly the numeric/date register from spec:65-66); the "do not calculate what isn't stated" rule is enforced by the register only ever emitting dates it actually found, never a derived one, with a pass check confirming no derived date leaked in | Different: extraction narrows to Stage 0; the non-inference guardrail becomes a code invariant instead of a model instruction | Unit test: date register never contains a `derived: true` date without an explicit source anchor; golden-fixture test the effective-dates table matches |
| contract-stack-map.md:57-65 Content item 3: Superseded Provisions (topic, prior location, current location, what changed) | Model identifies where a later document replaces an earlier provision and states the change | Stage 0's cross-reference/document-family map can surface CANDIDATE supersession pairs (same topic-keyword appearing in two documents with an amendment relationship between them, a Stage 1 candidate); Pass 2 judges whether it is a true supersession and what actually changed | Different: candidate detection narrows to Stage 1; the substantive "what changed" characterization stays Pass 2 | Golden-fixture test: superseded-provision entries match; unit test that Stage 1 raises a candidate pair when a later document's amendment section references the same topic anchor |
| contract-stack-map.md:68-76 Content item 4: Amendment Relationships, resolved to cumulative current position | Model resolves nested amendment chains to net current terms | Stage 0 builds the amendment chain structurally (which document amends which, deterministic from filenames/references); Pass 2 computes the cumulative net position (judgment: which numeric value is actually controlling after multiple amendments, plus interpretation of any partial overlaps) | Different: chain structure narrows to Stage 0; net-position judgment stays Pass 2, though the terminal numeric value itself (e.g., "3x fees") is a candidate Stage 1 can extract once Pass 2 identifies which clause controls | Golden-fixture test: cumulative current position matches; unit test that Stage 0 chain-building correctly orders nested amendments |
| contract-stack-map.md:79-91 Content item 5: Conflicting Provisions, order-of-precedence resolution, harmless/silent-downgrade/ambiguous typing | Model applies the family's precedence clause across the whole family, per-topic | Stage 1 candidate: numeric/text register can detect that the SAME topic (e.g., SLA percentage) has two different stated values in two documents (a Stage 1 candidate per spec:81, "the same figure is stated inconsistently in two places"); Pass 2 resolves precedence and classifies harmless/silent-downgrade/ambiguous, which is squarely judgment | Different: the raw inconsistency detection narrows to Stage 1; the precedence resolution and conflict-type classification stays Pass 2 | Unit test: Stage 1 flags an SLA figure stated differently in WO vs. MSA Exhibit; golden-fixture test the conflict-type classification (silent_downgrade in the worked example) matches |
| contract-stack-map.md:95-103 Content item 6: Missing Incorporated Documents, named where referenced | Model finds every document/exhibit/standard referenced but not provided | Stage 0 deterministically: any reference to a document title/exhibit letter/URL that does not resolve to a provided file is exactly the cross-reference-resolution-failure case (spec:78, "a cross-reference points at a section/document that does not exist"), extended from sections to whole documents | Different: this becomes a Stage 1 candidate list rather than a manual scan; Pass 1 verifies the list is complete (a parser miss here is the worst-case silent-drop bug spec:117-119 warns about) | Unit test: fixture referencing an exhibit not in the provided file set produces a Stage 1 missing-document candidate; golden-fixture test the full missing-documents list matches, including the risk narrative which stays Pass 2 |
| contract-stack-map.md:106-117 Content item 7: Governing Term Map per order document | Model states which document/section governs each key term for each order, and whether order-level paper overrides | Stage 0 supplies the candidate governing clause per term (cross-reference graph); Pass 2 judges whether an override is a conflict or an additive, non-conflicting term (explicitly judgment: "SOW Section 8 adds a 30-day transition obligation, additive, not a conflict" requires reading both clauses' effect) | Different: candidate sourcing narrows to Stage 0; override characterization stays Pass 2 | Golden-fixture test: governing term map entries match, including the additive-vs-conflict characterizations |
| contract-stack-map.md:120-129 Content item 8: Renewal/Termination Relationships across the family | Model traces how MSA termination affects in-flight orders, auto-renewal triggers | Stage 0 date/cross-reference register supplies the structural facts (term lengths, notice-day thresholds, survival-clause citations); Pass 2 judges the cascade logic in prose ("in-flight SOWs survive unless terminated separately") | Different: structural facts narrow to Stage 0; cascade-logic judgment stays Pass 2 | Golden-fixture test: renewal/termination narrative matches; unit test that Stage 0 correctly extracts the notice-day threshold (90 days in the worked example) |
| contract-stack-map.md:132-146 Content item 9: Definitions Reused Across Documents, consistency check | Extends definition-tracing-checklist.md from single-WO classification to family-wide consistency; model checks whether a term is defined the same way everywhere | Stage 0 defined-terms register already tracks every definition site across the family (this is its core deterministic function per spec:63); Stage 1 candidate: flags when the SAME term string has more than one definition site with materially different text (deterministic diff on definition text, or absence of a definition where a synonym is used, e.g. "Deliverables" vs. "Work Product"); Pass 2 judges whether the drift is meaningful and states the risk | Different: multi-site detection and raw text-diff narrow to Stage 0/1; the "is this drift risk-bearing" judgment stays Pass 2 | Unit test: Stage 1 flags "Work Product" defined in one document and referenced as "Deliverables" undefined in another; golden-fixture test the drift-risk narrative matches |
| contract-stack-map.md:19 VERIFIED/ASSUMED/NOT REVIEWED labeling requirement, never silently upgraded | Cross-cutting labeling discipline for every item above | Schema-enforced field (`verification: VERIFIED | ASSUMED | NOT_REVIEWED`) on every manifest entry; code can only ever set ASSUMED or NOT_REVIEWED from structural inference, only a pass step (having read the confirming text) may set VERIFIED | Different: was a discipline the model had to remember, becomes a schema constraint plus a code/pass write-permission boundary | Unit test: attempting to set `verification: VERIFIED` from Stage 0 code (rather than a pass) raises; schema rejects any manifest entry missing the field |
| contract-stack-map.md:152 DOCX title page (title, subtitle with doc count, Lilly Red rule, scope line, prepared-by, confidential notice) | Model authors the title page following house style | Generator template, fields populated from manifest `coverage_summary` and document count; matches spec:41-43's generator-not-model-assembly principle | Different: generator output, not model-assembled prose | Generator snapshot test against a fixture manifest |
| contract-stack-map.md:154 Section badges 01-09 in fixed order | Model lays out nine numbered sections in document order | Generator template, fixed section order hard-coded | Different: layout mechanics move to code | Generator snapshot test: rendered document has exactly nine sections in the specified order |
| contract-stack-map.md:156 KPI row (Documents Mapped/Missing, Conflicts Found, Definitions with Drift), conditional coloring on non-zero | Model computes four counts and colors them | Generator computes counts directly from `coverage_summary` (which itself must foot to the arrays per the rule at contract-stack-map.md:222) and applies the color rule as a pure function of the count | Different: arithmetic and conditional formatting move to code | Unit test: KPI colors switch from Bold Blue to Lilly Red exactly at count >0, for each of the four KPIs |
| contract-stack-map.md:158 Hierarchy tree rendering, single-column monospace/indented, not forced into multi-column table | Layout instruction for the DOCX tree | Generator template constraint | Different: layout mechanics move to code | Generator snapshot test: hierarchy section renders as a single-column block, not a multi-column table |
| contract-stack-map.md:160 Tables (Sections 02-09) standard treatment; risk-callout tint on unresolved-gap/ambiguity rows | Model applies conditional row styling | Generator applies the tint as a pure function of `conflict_type`/`status` fields already in the manifest (ambiguous, silent_downgrade, Not Provided/Not Found) | Different: styling logic moves to code, driven by manifest fields the passes already populate | Unit test: a manifest row with `conflict_type: ambiguous` or `status: Not Provided` renders with the Neutral Rose tint; a harmless/resolved row does not |
| contract-stack-map.md:162 Narrative requirement: 1-2 sentences of lead-in prose before each table | Requires connected prose, not a raw table | Pass 2 authors the narrative sentences (this stays model prose — it is section-specific interpretive framing, not a mechanical fact); generator enforces the field is non-empty before rendering | Same authoring, code enforces presence | Unit test: generator rejects a section with an empty narrative field; golden-fixture test the narrative content is present and section-specific |
| contract-stack-map.md:164 Closing section: "What this map does not tell you," pointing to the correct substantive-review mode | Model authors a fixed disclaimer pointing elsewhere | Generator template, mostly fixed boilerplate text; the specific mode pointer is a static template string since the four substantive modes are fixed | Different: near-fully generator output, minimal model input | Generator snapshot test: closing section text matches the template exactly |
| contract-stack-map.md:171-219 Manifest JSON Schema (all top-level fields: supplier, family_name, as_of_date, documents[], hierarchy_edges[], superseded_provisions[], amendment_chain[], conflicts[], missing_documents[], governing_term_map[], renewal_termination[], definitions[], coverage_summary) | Defines the machine-readable sidecar structure | Formalized as a validated schema (JSON Schema or dataclass), generated from the SAME working notes as the DOCX per contract-stack-map.md:168 ("mirroring the DOCX content, generated from the same working notes, not authored separately") — this is precisely spec section 3's "formalize the findings ledger and coverage map as validated schemas" applied to the Stack Map's own manifest | Different: today this is a spec for the model to follow when authoring JSON by hand; in the redesign it is a real schema the generator validates against, and the DOCX and manifest are two renderings of one underlying data structure rather than two independently authored documents | Schema validation unit test: a generated manifest validates against the JSON Schema; consistency test: DOCX and manifest generated from the same run never disagree, since both are rendered from the same ledger object rather than composed twice |
| contract-stack-map.md:222 coverage_summary counts must foot to array lengths | Explicit self-consistency rule ("if they do not foot, fix the count, not the array") | Generator computes `coverage_summary` fields as `len()` of the corresponding arrays, structurally impossible to disagree, rather than the model computing both independently and needing them to match by discipline | Different: was a rule for the model to hold two independently-produced numbers consistent; becomes structurally impossible to violate since one is derived from the other | Unit test: `coverage_summary.documents_missing == len(missing_documents)` and the same for the other three counts, enforced as a computed property, not an independent field |
| contract-stack-map.md:226 Gate check 1: every document VERIFIED or explicitly ASSUMED/NOT_REVIEWED, no silent upgrades | Pre-presentation self-check item 1 | Schema validation, same mechanism as the VERIFIED/ASSUMED row above | Different: instruction to code-enforced pre-render check | Unit test: generator refuses to render if any document entry lacks a `verification` value |
| contract-stack-map.md:227 Gate check 2: hierarchy tree and hierarchy_edges describe the same structure | Pre-presentation self-check item 2 | Since both DOCX and manifest render from one shared data object (per the schema-formalization row above), this check becomes structurally guaranteed rather than a check that can fail | Different: was a manual cross-check, becomes a design property (single source of truth) that eliminates the failure mode rather than merely detecting it | Consistency test: rendering the same run's data twice (DOCX path and manifest path) never produces divergent structures, verified by re-parsing the DOCX tree and diffing against `hierarchy_edges` |
| contract-stack-map.md:228 Gate check 3: every conflict states controlling document and precedence basis | Pre-presentation self-check item 3 | Findings/manifest schema requires `controlling_document` and `controlling_basis` as non-nullable fields on every `conflicts[]` entry; Pass 2 populates them | Different: schema-required fields instead of a manual check | Unit test: schema validation fails on a conflict entry missing either field |
| contract-stack-map.md:229 Gate check 4: every missing document names where it was referenced | Pre-presentation self-check item 4 | Schema requires `referenced_in` and `referenced_section` as non-nullable on every `missing_documents[]` entry | Different: schema-required fields | Unit test: schema validation fails on a missing-document entry lacking either field |
| contract-stack-map.md:230 Gate check 5: every order-level document has a Governing Term Map entry | Pre-presentation self-check item 5 | Generator cross-checks that every `documents[]` entry with `type` in {SOW, WO, CO, Order Form} has at least one `governing_term_map[]` entry with matching `order_document` | Different: instruction to code-enforced completeness check | Unit test: fixture with an order-level document missing a governing-term-map entry fails generation with a named error, not a silent gap |
| contract-stack-map.md:231 Gate check 6: coverage_summary counts foot to arrays | Duplicate of the row at contract-stack-map.md:222 as a pre-presentation checklist item | Same mechanism as that row (computed property) | Same | Same test as that row |
| contract-stack-map.md:232 Gate check 7: no finding/redline/score/negotiation position leaked into this mode's output | Pre-presentation self-check item 7 | Same mechanism as the Purpose/non-duplication row above (schema has no such fields) | Same | Same test as that row |
| contract-stack-map.md:233 Gate check 8: closing note points to the correct substantive-review mode | Pre-presentation self-check item 8 | Generator template is static boilerplate (per the closing-section row above), so this is guaranteed by construction rather than checked after the fact | Different: guaranteed by template design rather than a post-hoc check | Generator snapshot test on the closing section text |

---

# Part 2: the judgment corpora

*Verbatim from `F1-COVERAGE-MATRIX-PART2-judgment.md`. 90 rows (its own summary says 89).*


Scope: `references/playbook.md` (263 lines), `references/vendor-tactics.md` (289
lines), `references/commercial-analysis.md` (176 lines), `references/pharma-
requirements.md` (143 lines) in `lilly-contract-review-1c344a`. 871 lines, the
largest reference group in the skill.

Summary: 89 rows below. 71 rows land on a PASS as their primary destination
(Pass 2, Governing Cross-Reference and Definition Tracing, for playbook.md;
Pass 3, Commercial, Tactics, Pharma, for vendor-tactics.md, commercial-
analysis.md and pharma-requirements.md), matching the spec's framing that this
group is mostly judgment and mostly stays with the model. 18 rows carry a
genuine mechanical sliver (a numeric threshold, an exact-string presence check,
or an arithmetic computation over model-supplied inputs) that is split out as a
named Stage 1 candidate or a kernel function, always feeding the pass rather
than replacing it. Zero rows are marked Stage 1 as a sole destination; every
mechanical sliver is stated as "Stage 1 proposes, Pass N adjudicates." Zero
BLOCKERS: every row lands somewhere. Retrieval indexing verdict: viable and
worth building for all four documents, but the four documents differ sharply in
where the win comes from (detail below) - vendor-tactics.md and commercial-
analysis.md already have document-level (whole-file) conditional loading today,
so the new win there is intra-file, category-level narrowing; playbook.md and
pharma-requirements.md are currently loaded "Always," in full, with zero
narrowing, so the section-keyed index is a wholly new saving for those two.
Seven positions are flagged as pre-existing ambiguity worth Marc's attention,
not redesign defects - see section 6.

---

## 1. playbook.md (34 rows)

Destination default: **Pass 2, Governing Cross-Reference and Definition
Tracing** (spec section 3). This is where the original skill already applies
"the playbook section by section" (SKILL.md:646), so the redesign changes only
what Pass 2 reads (the compact `contract_index` plus the cross-reference graph
and defined-terms register) and not what it decides.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| playbook.md:17-22 (HS-1 Trade Sanctions) | No modification to trade sanctions provisions accepted, ever; escalate to Alessandro Curti | Pass 2, as a Hard Stop rule. Stage 1 proposes a candidate match (clause tagged "trade sanctions" or "§25" in contract_index); Pass 2 rules whether any supplier edit exists and confirms the Hard Stop | Same (judgment on "was this modified" unchanged; only the candidate-flagging step is new) | Golden fixture: a contract with an untouched §25 produces no HS-1 finding; a contract with any edit to §25 produces one, with the escalation contact intact |
| playbook.md:23-28 (HS-2 Debarment "knowingly") | No "knowingly" qualifier accepted on debarment certification | Stage 1 mechanical sliver: exact-string search for "knowingly" within the clause Stage 0 tags as the debarment provision, feeding Pass 2 as a candidate. Pass 2 rules (a supplier could phrase the same escape hatch without the literal word) | Same ruling; sliver is new and free | Fixture contract with literal "knowingly" inserted must produce HS-2; a contract achieving the same effect with different wording (e.g. "to its knowledge") must still be caught by Pass 2 judgment, not missed because the string didn't match |
| playbook.md:29-34 (HS-3 Tax Disclosure Rights) | Lilly must retain the right to disclose to tax authorities; escalate to Adam Shields | Pass 2, Hard Stop rule; Stage 1 candidate = presence/absence of a disclosure-restriction clause near the tax section | Same | Fixture: contract restricting disclosure to tax authorities produces HS-3 with the escalation contact |
| playbook.md:35-41 (HS-4 Adverse Event Reporting) | 1 business day reporting timeline, Lilly Answers Center contact, mandatory in ALL contracts; escalate to Merry Chu | Pass 2 Hard Stop rule. Stage 1 mechanical sliver: numeric threshold check, extract the stated reporting window from Stage 0's numeric/date register and compare to "1 business day"; also a presence check (section exists at all) | Same, plus this is also stated independently in pharma-requirements.md:19-28 - see row there for the cross-document duplication note | Fixture with a 2-business-day AE clause must be flagged as a threshold violation, not merely "different from Lilly standard"; fixture with the section deleted entirely must trigger the "re-insert" instruction, not a silent gap |
| playbook.md:42-47 (HS-5 AI/ML Standard) | Third-party AI providers must be Subcontractors with full data-protection flow-down; escalate to Legal AIPC | Pass 2/3 boundary: the Hard Stop rule lives in Pass 2, but detailed AI provisions overlap ai-standard.md, which is Pass 3 territory (out of scope for this matrix - flagged for cross-check with the Part 1 or mechanical-checklist matrix covering ai-standard.md) | Same | Fixture contract excluding AI providers from subcontractor treatment produces HS-5 |
| playbook.md:48-54 (HS-6 Indemnification Structure) | Cannot cap indemnification to "sole and exclusive remedy"; background IP indemnification required | Pass 2 Hard Stop rule. Stage 1 sliver: exact-phrase search for "sole and exclusive remedy" co-located with the indemnification clause, plus a presence check for a background-IP indemnification clause | Same | Fixture with the phrase inserted produces HS-6; fixture with background IP indemnification deleted also produces HS-6 (two independent trigger conditions, both must be tested) |
| playbook.md:57-66 (§1 Term and Renewal) | Standard = Lilly unilateral renewal; fallback = mutual with longer notice; not acceptable = auto-renewal or supplier-unilateral | Pass 2, playbook position match. Stage 1 candidate: presence of the string/pattern "automatic renewal" or "auto-renew" in the term clause | Same | Fixture with auto-renewal language produces the §1 redline instruction verbatim |
| playbook.md:68-76 (§2 Scope of Services) | Standard = SOW-defined scope; watch for overly broad language; not acceptable = supplier unilateral right to expand deliverables | Pass 2, playbook position match (judgment - "overly broad" has no mechanical test) | Same | Fixture with a unilateral-expansion clause produces the §2 finding |
| playbook.md:78-84,86-89 (§3 Fees and Payment, core position) | Standard Net-45; fallback Net-30 for small suppliers/<$100K; not acceptable payment-on-receipt or advance payment | Pass 2, playbook position match. Stage 1 sliver: numeric threshold check, payment-term days extracted from Stage 0's numeric register compared against 45/30, plus the $100K contract-value gate is a second numeric threshold | Same | Fixture: a Net-30 term on a $250K contract must be flagged (value gate fails); a Net-30 term on a $60K small-supplier contract must be accepted per fallback |
| playbook.md:85 (§3 rate escalation cap) | Annual escalation acceptable only if capped at 3% max and tied to CPI or equivalent; open-ended escalation not acceptable | Stage 1 mechanical sliver: numeric threshold, extract the stated escalation % from the numeric register and compare to 3%; also a presence/absence check for a CPI tie. Pass 2 rules on "or equivalent" (judgment) | Same | Fixture with a 5% flat escalation clause must be flagged as exceeding the cap; fixture with 3% CPI-linked must pass |
| playbook.md:90-98 (§4 Confidentiality) | Standard mutual, 5-yr survival; fallback 3-yr minimum; not acceptable no confidentiality or one-way; watch broad carve-outs | Pass 2, playbook position match. Stage 1 sliver: numeric threshold on survival-period years (extracted vs. 3/5-yr floor) | Same | Fixture with a 2-year survival clause is flagged below the 3-yr floor |
| playbook.md:99-109 (§5 Intellectual Property) | Standard Lilly owns work product, supplier keeps pre-existing IP under license; fallback joint ownership per SOW; critical pharma override for compound/formulation/clinical-data IP | Pass 2, playbook position match, heavily judgment (novel IP-retention wording is exactly what spec section 5 reserves to the model) | Same | Fixture with supplier claiming ownership of Lilly-compound-related work product must produce the "critical for pharma, no exceptions" finding, not a generic IP finding |
| playbook.md:111-118 (§7 Reps and Warranties) | Standard mutual reps + supplier professional-standards reps; not acceptable AS-IS disclaimer or removed compliance-with-laws rep | Pass 2, playbook position match. Stage 1 sliver: presence/absence check for a compliance-with-laws representation clause (a required-clause-present check, same shape as definition-tracing-checklist.md's domain) | Same | Fixture with the compliance-with-laws rep deleted is flagged |
| playbook.md:119-125 (§8 Tax, non-HS) | Each party responsible for own taxes; Lilly withholding right; escalate any change to Adam Shields | Pass 2, playbook position match | Same | Fixture with a withholding-right restriction is flagged and routed to Adam Shields |
| playbook.md:126-133 (§9-10 Data Protection) | DPA required when personal data processed; HIPAA BAA when PHI; watch missing DPA, restricted Lilly data rights, breach notice worse than 72 hours | Pass 2, playbook position match. Stage 1 sliver: numeric threshold, breach-notification hours extracted vs. 72-hour ceiling (identical sliver to pharma-requirements.md:44 - single source of truth needed, see ambiguity note in section 6) | Same | Fixture with a 96-hour breach notice window is flagged as exceeding 72 hours |
| playbook.md:134-142 (§11 Audit Rights) | Standard Lilly direct audit right; fallback SOC2/ISO27001 supplementing (not replacing) direct audit, reasonable frequency (e.g. annual); not acceptable removal of audit rights or attestation-only | Pass 2, playbook position match (judgment - "reasonable frequency" and "supplementing not replacing" are not mechanical; see ambiguity note) | Same | Fixture removing Lilly's direct audit right and substituting SOC2-only produces the §11 finding routed to Carina Horacek Roth |
| playbook.md:143-151 (§12-13 Compliance/Anti-Corruption) | Compliance with all applicable laws incl. FCPA/UK Bribery Act; watch "material laws only" narrowing; not acceptable any weakening | Pass 2, playbook position match. Stage 1 sliver: exact-phrase search for "material" qualifier adjacent to the compliance-with-laws clause | Same. Overlaps pharma-requirements.md:50-63 (FCPA) - see duplication note in section 6 | Fixture narrowing compliance to "material breaches of law" is flagged |
| playbook.md:152-160 (§14 Insurance) | Dollar-minimum table: CGL $2M, Professional/EO $5M, Workers Comp statutory, Auto $1M; fallback aggregate reductions for small companies, Tech EO substitution, cyber $5M if data access | Pass 2, playbook position match. Stage 1 sliver: numeric threshold, each stated coverage limit in the numeric register compared against its named minimum, per coverage type | Same. Overlaps pharma-requirements.md:114-127 which ADDS pharma-specific minimums on top - the two files are additive, not duplicative, and the matrix should say so explicitly | Fixture with CGL stated at $1M is flagged as below the $2M minimum; fixture omitting cyber coverage where data access is in scope is flagged |
| playbook.md:161-169 (§15 Force Majeure) | Standard mutual FM, Lilly right to terminate after 90 days; fallback 120-day trigger, mutual termination right; not acceptable FM excusing payment, covering labor disputes/financial difficulty, or unlimited period | Pass 2, playbook position match. Stage 1 sliver: numeric threshold on the stated termination-trigger day count (90/120), plus exact-phrase search for "labor dispute" or "financial difficulty" inside the FM enumerated-events list | Same | Fixture with a 180-day, no-termination-right FM clause is flagged as exceeding both the standard and the fallback |
| playbook.md:170-178 (§16 Termination) | Standard 30-day TFC notice, mutual 30-day cure; fallback 60-day notice, 45-day cure; not acceptable no TFC, cure >60 days, supplier-only TFC | Pass 2, playbook position match. Stage 1 sliver: numeric thresholds on notice days and cure days | Same | Fixture with a 90-day cure period is flagged as exceeding the 60-day ceiling |
| playbook.md:179-186 (§17 Indemnification, non-HS content) | Mutual indemnification; supplier indemnifies for negligence/IP infringement/confidentiality breach/data breach/law violation; watch narrowing to "gross negligence" only | Pass 2, playbook position match. Stage 1 sliver: exact-phrase search for "gross negligence" as the sole negligence standard | Same | Fixture narrowing to gross-negligence-only is flagged |
| playbook.md:187-197 (§18 Limitation of Liability) | Cap must be mutual, "greater of" construct; minimum $3M cap; fallback 12-month fees paid or 2x-3x annual value; not acceptable "lesser of," unilateral cap, cap <$3M without Legal, unlimited-for-Lilly/capped-for-supplier | Pass 2, playbook position match. Stage 1 sliver: numeric threshold on the stated cap dollar amount vs. $3M floor, and exact-phrase search for "lesser of" vs. "greater of" | Same | Fixture with a $1.5M cap and "lesser of" construct is flagged on both grounds independently; fixture with a symmetric $3M cap passes |
| playbook.md:198-205 (§19 AI/ML Provisions, non-HS content) | Subcontractor treatment, data-protection flow-down, model transparency, no training without consent, audit rights over AI systems | Pass 2/3 boundary, same note as HS-5 row above - out of scope detail lives in ai-standard.md | Same | Fixture excluding audit rights over the AI system is flagged |
| playbook.md:206-215 (§20-22 Assignment/Notices/General) | Lilly may assign to affiliates without consent; supplier needs consent; change-of-control = assignment; written notice; entire-agreement; severability; no-waiver-by-conduct | Pass 2, playbook position match, largely boilerplate-consistency judgment | Same | Fixture with a supplier-favorable assignment clause (Lilly needs supplier consent to assign) is flagged |
| playbook.md:216-219 (§23 Adverse Events cross-ref) | "Mandatory in ALL supplier contracts. See Hard Stops." | Pass 2, routes to the HS-4 rule already covered above - this is a pointer, not a new check | Same (no new content to cover) | Covered by the HS-4 fixture test above |
| playbook.md:220-223 (§24-25 Trade Sanctions cross-ref) | "Mandatory and non-negotiable. See Hard Stops." | Pass 2, routes to HS-1 - pointer only | Same | Covered by the HS-1 fixture test above |
| playbook.md:224-232 (§26 Governing Law) | Standard Indiana; acceptable Delaware/NY (US), Swiss/English (OUS); not acceptable supplier's home state otherwise | Pass 2, playbook position match. Stage 1 sliver: the acceptable-jurisdiction list is a small enum; a lookup against it is mechanical narrowing (candidate: "is the stated jurisdiction in {Indiana, Delaware, NY, Swiss, English}"), but the OUS-vs-US routing decision and any edge case (e.g. jurisdiction not named in the list at all) stays with Pass 2 | Same | Fixture naming Texas law (not in the acceptable set, not Indiana) is flagged |
| playbook.md:233-241 (§27 Dispute Resolution) | Standard Marion County IN exclusive jurisdiction; acceptable NY/DE if law matches; not acceptable mandatory arbitration or supplier's home jurisdiction | Pass 2, playbook position match. Stage 1 sliver: exact-phrase search for "arbitration" as a candidate, since Lilly's standard is a hard preference against it | Same | Fixture with a mandatory-arbitration clause is flagged, routed to Contract Request and Consultation Tool |
| playbook.md:242-251 item 2 (Rate Card: escalation cap) | Annual increases capped 3%/CPI, open-ended not acceptable | Duplicate of playbook.md:85 sliver above - one Stage 1 check serves both citations, not two separate implementations | Same (dedup opportunity, not a new requirement) | Same fixture as playbook.md:85 |
| playbook.md:242-251 item 1 (Rate Card: benchmark comparison) | Compare rates against market benchmarks if commercial-negotiation-prep / market-rate-benchmarking data is available | Pass 3 (Commercial, Tactics, Pharma), since this is a cross-skill data pull and a judgment comparison, not a Pass 2 playbook-position match despite living in playbook.md | Same | Fixture: when benchmark data is supplied, the review cites it; when absent, the review says so rather than fabricating a comparison (Rule 4) |
| playbook.md:242-251 item 3 (Rate Card: UOM consistency) | Verify rates use consistent units matching the rate card's UOM definition | Stage 1 mechanical sliver: unit-of-measure string match/consistency check across every named rate in the numeric register (hour/day/month), same shape as vendor-tactics.md Category 1's "incorrect unit pricing" sub-check - see that row, this is the same mechanical check applied via a different reference doc and should share one implementation | Same, dedup opportunity | Fixture with a rate quoted "per day" in one place and "per hour" elsewhere for the same role is flagged |
| playbook.md:242-251 item 4 (Rate Card: volume commitments) | Verify volume commitment is achievable and underperformance penalty is proportionate | Pass 3, judgment (achievability and proportionality are not mechanical) | Same | Fixture with a penalty clause charging 3x the shortfall value is flagged as disproportionate |
| playbook.md:242-251 item 5 (Rate Card: MFC clause) | Consider requesting most-favored-customer pricing for strategic suppliers | Pass 3, judgment (strategic-supplier determination and the recommendation itself) | Same | N/A for mechanical test; verified by confirming the recommendation appears when a strategic-supplier signal is present in context |
| playbook.md:252-263 (Review Output Checklist, 8 items) | Pre-delivery checklist: Hard Stops flagged 🔴, modifications flagged 🟡, escalations flagged 🔵 with SME email, template origin identified, amendment context noted, rate card benchmarked, pharma items checked, summary produced | This is an OUTPUT-COMPLETENESS gate, not a playbook position. It moves to the generator layer (spec section 3, "the three generators") as an enforced pre-emit assertion, e.g. the review-summary generator refuses to emit if any Hard Stop lacks its escalation contact, rather than relying on the model remembering to self-check | Different: was an instruction to self-check in prose; becomes a generator-side assertion that can fail the build | A malformed findings ledger (a Hard Stop finding with no escalation contact field) must cause the generator to raise, not silently emit |

## 2. vendor-tactics.md (19 rows)

Destination default: **Pass 3, Commercial, Tactics, Pharma** (SKILL.md:647,
"Apply the 12-category vendor tactics framework"). The applicability table at
vendor-tactics.md:276-289 already narrows which categories apply to which
document type; that narrowing is itself the retrieval-indexing opportunity
described in section 5.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| vendor-tactics.md:1-10 (applicability framing) | States when the module applies at all: always for SOW/WO/CO/amendment, selectively for MSA (item 8 + rate card only), never for CDA/DPA without pricing | Stage 0/document-classification narrowing feeds Pass 3 which document-type slice to load - this is the retrieval index key, see section 5 | Same rule, new mechanism for applying it | Fixture: a CDA review produces no vendor-tactics findings at all; an MSA review produces only category-8 and rate-card findings |
| vendor-tactics.md:11-20 (Cat 1, rate inflation) | Compare every named role/rate against the rate card; any overage, even $1, is a finding; calculate total overage impact | Stage 1 mechanical sliver: numeric comparison, document rate vs. rate-card rate per named role, extracted via Stage 0's numeric register; arithmetic total-overage-over-term is a kernel computation (`numeric_kernel.py` pattern). Pass 3 adjudicates whether the "named role" in the document actually maps to the rate card's role taxonomy (judgment when titles don't match verbatim) | Same finding, but the arithmetic and the exact-match comparison are now free instead of model-computed | Fixture with a role billed $5/hr over its rate-card rate across a 1000-hr term must produce a $5,000 overage figure that matches a hand calculation exactly |
| vendor-tactics.md:17 (Cat 1, duplicate charges) | Cross-reference change-order scope against original SOW/base agreement scope for re-billed items | Pass 3, judgment (matching "is this the same task" across documents is retrieval plus interpretation, not exact-match) | Same | Fixture with an identically-worded task appearing in both documents is the easy case; the harder case (same task, reworded) stays a judgment test, not a mechanical one |
| vendor-tactics.md:18 (Cat 1, bundled costs) | Flag lump-sum line items over $25K without a component breakdown | Stage 1 mechanical sliver: numeric threshold, $25K, against each lump-sum figure in the numeric register, plus a presence/absence check for an itemized breakdown nearby | Same | Fixture with a $30K unbroken lump sum is flagged; a $30K lump sum with an attached breakdown table is not |
| vendor-tactics.md:19 (Cat 1, incorrect unit pricing) | Verify units match rate-card UOM definition (hour vs day, seat vs user, monthly vs annual) | Stage 1 mechanical sliver: UOM string consistency check, shared implementation with playbook.md:242-251 item 3 above | Same, dedup opportunity | Same fixture as the playbook.md UOM row |
| vendor-tactics.md:20 (Cat 1, unapproved markups) | Compare pass-through markups (travel, subcontractor, equipment) against MSA-stated caps (e.g. 10%) | Stage 1 mechanical sliver: numeric threshold, extracted markup % vs. the MSA's stated cap (itself extracted, not hardcoded, since the cap is contract-specific) | Same | Fixture with a 25% subcontractor markup against a 10%-cap MSA is flagged with the exact overage |
| vendor-tactics.md:32-49 (Cat 2, deliverable ambiguity, red-flag phrases) | Flag any deliverable containing a list of ~12 soft-language phrases ("support implementation," "assist with," "as needed," etc.) | Stage 1 mechanical sliver: exact-phrase/fuzzy-string match against the fixed red-flag phrase list, feeding candidates to Pass 3. Whether a MATCHED phrase actually represents unacceptable ambiguity in context stays a Pass 3 call (e.g. "best efforts" may be fine in a boilerplate warranty disclaimer but not in a deliverable description) | Same finding, cheaper detection | Fixture deliverable text containing "provide advisory services" must surface as a Stage 1 candidate that Pass 3 either confirms or dismisses with a stated reason |
| vendor-tactics.md:46-49 (Cat 2, three required elements) | Every deliverable needs acceptance criteria, completion definition, and timeline; flag missing elements | Timeline is partly mechanical (presence/absence of a date or milestone trigger, Stage 1 sliver); acceptance criteria and completion-definition adequacy are judgment (Pass 3) | Different for timeline (split out), same for the other two | Fixture with no date anywhere near a deliverable is flagged on the timeline element by Stage 1; a deliverable with a date but no acceptance test is flagged by Pass 3 on the other element |
| vendor-tactics.md:60-78 (Cat 3, timeline manipulation) | Unjustified extensions, pre-existing dependencies restated as new, re-baselining language, artificial milestone splitting | Pass 3, judgment throughout - the doc itself gives no ratio or threshold for "minor scope addition shouldn't justify a 3-month extension" (see ambiguity note, section 6). "Re-baseline" phrase detection is a Stage 1 sliver (exact-phrase search) that still requires Pass 3 to assess intent | Same | Fixture with literal "re-baseline the project schedule" language is surfaced as a Stage 1 candidate; the extension-vs-scope-delta judgment stays Pass 3 |
| vendor-tactics.md:80-98 (Cat 4, resource substitution) | Role/experience/location downgrades vs. original proposal or SOW; rate-to-role mismatch | Partially mechanical: if named roles and rates appear in both the original and current document (Stage 0 extracts both), a Stage 1 diff can propose a candidate role change. Whether it constitutes a "downgrade" (Analyst vs Consultant seniority ordering isn't given anywhere as an enum) is Pass 3 judgment | Same | Fixture proposing "Senior Architect" then billing "Consultant" at the same rate is a strong Stage 1 candidate (role string changed, rate unchanged) that Pass 3 confirms as a downgrade |
| vendor-tactics.md:100-118 (Cat 5, responsibility shifting) | Cross-reference every "Lilly shall"/"Client will"/"Customer is responsible for" clause against the original agreement to detect shifts | Stage 1 mechanical sliver: exact-phrase extraction of every such clause (this is a grep, not a judgment), feeding Pass 3 which determines whether the extracted obligation is actually NEW versus the original document | Same | Fixture with "Client will provide architecture documentation" appearing only in the change order (not in the original SOW) is a Stage 1 candidate that Pass 3 confirms as a shift |
| vendor-tactics.md:120-141 (Cat 6, hidden recurring costs) | Detect one-time-labeled costs that are actually recurring (licensing, retainers, hosting, subscriptions); compute annualized cost and 3-year projection | Classification (is this cost actually recurring) is Pass 3 judgment. Once classified, "annualized cost" and "3-year projection" are Stage 1/kernel arithmetic | Different for the arithmetic half (was model-computed, becomes kernel-computed and therefore cannot arithmetically drift) | Fixture with a $10K/quarter "project cost" that is actually a subscription must produce $40K annualized and $120K 3-year figures that match hand calculation |
| vendor-tactics.md:143-166 (Cat 7, contractual conflicts) | Flag "notwithstanding" language, liability-cap changes, indemnification narrowing, warranty-term changes, IP-ownership changes, termination-rights changes, governing-law/venue changes vs. the parent MSA | Stage 1 mechanical sliver: exact-phrase search for "notwithstanding the master agreement" / "notwithstanding anything to the contrary" as candidates. The substantive comparison (does this actually override a protection, and how severe) is Pass 3, and overlaps the order-of-precedence resolver already described in SKILL.md:374 (out of this matrix's scope but worth noting as the same mechanism) | Same, sliver is new | Fixture with "Notwithstanding the Master Agreement, liability shall not exceed $50,000" against an MSA $3M cap is flagged as High severity by Pass 3 after the phrase surfaces as a Stage 1 candidate |
| vendor-tactics.md:168-189 (Cat 8, compliance/security gaps) | Offshore resources, new third-party tools/subcontractors, new data handling, architecture changes, new regulatory exposure, bypassed security review | Pass 3, judgment throughout; this is the one category that also applies to a standalone MSA (per the applicability table), so it is never fully skipped regardless of document type | Same | Fixture introducing an offshore delivery location with no data-residency clause is flagged and routed to InfoSec/Privacy |
| vendor-tactics.md:191-209 (Cat 9, dependency inflation) | New Lilly dependencies not logically required by new scope; restated pre-existing dependencies as new blockers; vaguely defined dependencies; aggressive contingency timelines ("if Client does not provide X within 5 business days...") | The "N business days" contingency language is a Stage 1 sliver (numeric extraction), legitimacy assessment is Pass 3 judgment | Same | Fixture with a 5-business-day trigger tied to an undefined "data cleansing" deliverable is flagged as vague by Pass 3 after Stage 1 surfaces the day-count clause |
| vendor-tactics.md:211-231 (Cat 10, hidden scope reduction) | Deliverable downgrades, relaxed quality specs ("enterprise-grade" to "production-ready"), narrowed coverage, removed features without price reduction | Pass 3, judgment throughout - this is exactly the kind of semantic-equivalence-with-different-words case the spec reserves to the model | Same | Fixture replacing "24/7 support" with "business hours support" at the same price is flagged |
| vendor-tactics.md:233-249 (Cat 11, approval manipulation) | Retroactive change orders, work started before approval (date check), urgency-bypass language, authority bypass / salami-slicing against FRAP thresholds | Two Stage 1 slivers here: (a) date comparison, work-performed dates vs. change-order signature date, both extractable from Stage 0's date register; (b) if the FRAP threshold is known, a numeric comparison of the CO's stated value against it. Salami-slicing across MULTIPLE change orders needs Pass 3 (or a cross-document Stage 1 aggregation, which is a larger build, flagged as a design question rather than assumed free) | Same, dates/thresholds sliver is new | Fixture with a change order dated for work performed two weeks before its signature date is flagged by the date-comparison sliver |
| vendor-tactics.md:251-270 (Cat 12, effort padding) | Disproportionate hours vs. scope complexity; effort increase without scope increase; vague justification language ("project management," "coordination" without specifics); historical comparison if available | Pass 3, judgment throughout. The doc itself states this is "the hardest category to detect without historical data" (vendor-tactics.md:253) - do not attempt to force a threshold here; there is no defensible number to compare against absent historical data from negotiation-playbook-learning | Same | Verified by confirming the review states its confidence level (High/Medium/Low per the doc's own output format) rather than asserting padding without qualification |
| vendor-tactics.md:272-289 (applicability matrix table) | Maps each of the 12 categories to Primary/Applicable/Not-applicable per document type (CO, SOW, WO, Amendment, Order Form, MSA) | This table itself becomes the retrieval index (section 5) - a small, already-authored lookup keyed on document type, code-readable as-is | Same content, new consumption mechanism (structured lookup instead of the model re-reading prose to figure out applicability every run) | Fixture: an Order Form review loads only categories 1, 6 and 8 (the only three marked applicable), confirmed by checking which category headers appear in the run's working notes |

## 3. commercial-analysis.md (21 rows)

Destination default: **Pass 3, Commercial, Tactics, Pharma**. This file is
explicitly a judgment corpus per spec section 12, but it is also the one
document in this group that contains genuine arithmetic (Value at Risk), which
is the sharpest mechanical sliver found across all four documents.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| commercial-analysis.md:9-17 (when full vs. limited analysis applies) | Routes Order Forms/SOWs/WOs to full analysis, MSAs-with-pricing to full, MSAs-without-pricing and CDAs/DPAs/SLAs to limited or N/A | Document-type/pricing-presence classification, already partly mechanical (does the document contain a rate table at all is a Stage 0 structural fact); the full-vs-limited threshold decision stays a small Pass 3 gate | Same | Fixture: a CDA with no fee schedule anywhere in the numeric register produces no commercial analysis section, per "Commercial analysis not applicable" |
| commercial-analysis.md:25-31 (Pricing Assessment fields) | Proposed rate, market benchmark, position vs. market, volume consideration, rate justification, benchmark sources | Pass 3, judgment (benchmark research, justification narrative). Output shape enforced by the Legal/Commercial Briefing generator, not authored freely each time | Same content, output shape now enforced | Generator refuses to emit a Pricing Assessment block missing a benchmark-sources field |
| commercial-analysis.md:33-38 (Commitment Structure fields) | Total commitment, type, survival on termination, flexibility, risk exposure | Pass 3, judgment | Same | N/A mechanical test; verified via generator schema completeness |
| commercial-analysis.md:40-44 (Scope Definition & Creep Risk summary fields) | Scope clarity, creep risk, change-order mechanism, out-of-scope triggers | Pass 3, judgment, feeding from the detailed assessment rows below | Same | Covered by the detailed rows below |
| commercial-analysis.md:46-49 (Assumptions & Dependencies summary fields) | Pricing assumptions, assumption risk, change-request process | Pass 3, judgment, feeding from the detailed assessment rows below | Same | Covered by the detailed rows below |
| commercial-analysis.md:51-57 (Term & Renewal fields) | Initial term, adequacy, renewal options, price protection, switching cost | Pass 3, judgment. Price-protection presence (is there a cap, is it CPI-tied) is a Stage 1 sliver shared with playbook.md:85 | Same, sliver shared/deduped | Fixture with no price-protection language anywhere near the renewal clause is flagged as "None" by the shared sliver |
| commercial-analysis.md:58-63 (Payment Terms fields) | Terms, Lilly standard comparison (Net-45 minimum), billing frequency, early-payment discount | Stage 1 mechanical sliver: identical numeric threshold to playbook.md:78-89, one shared implementation | Same, dedup opportunity | Same fixture as the playbook.md §3 payment-terms row |
| commercial-analysis.md:64-70 (Value at Risk: Overpayment Risk) | (proposed rate − market rate) × volume × term | Stage 1/kernel arithmetic. Proposed rate, market rate, volume and term are Pass 3 judgment/research inputs (market rate especially, since it depends on web-search benchmarking); once those four numbers exist, the multiplication is a pure kernel function, same family as `numeric_kernel.py`'s existing verification functions | Different: was fully model-computed prose arithmetic; becomes a kernel call that cannot silently arithmetic-drift from its own inputs | Unit test: given rate delta $20/unit, volume 30, term 24 months, kernel must return exactly $14,400, not an approximation |
| commercial-analysis.md:64-70 (Value at Risk: Commitment Risk) | Maximum locked-in spend if the engagement underperforms | Stage 1 sliver: extraction of the stated minimum-commitment dollar figure from the numeric register, which IS the answer in a fixed-minimum contract structure; Pass 3 judgment only for hybrid/usage-based structures where "maximum" requires interpreting an overage formula | Partially different (extraction-only case is new and free) | Fixture with an explicit "$500K minimum commitment" clause returns $500K via extraction, no model computation needed |
| commercial-analysis.md:64-70 (Value at Risk: Scope Creep Risk estimate) | A dollar estimate of potential unbudgeted spend from scope expansion | Pass 3, judgment - inherently an estimate, no mechanical basis | Same | N/A mechanical test; verified only by confirming the estimate cites its basis (e.g. "historical T&M overrun on comparable engagements") rather than an unsourced number, per Rule 4 |
| commercial-analysis.md:64-70 (Value at Risk: Renewal Risk) | Cost exposure if no price protection exists at renewal | Pass 3, judgment for the exposure narrative; Stage 1 sliver for the underlying fact (is there price protection at all, shared with the Term & Renewal row above) | Same | Shared fixture with the Term & Renewal price-protection sliver |
| commercial-analysis.md:64-70 (Value at Risk: Total Value at Risk) | Aggregate of the four risk lines above into a $ range | Stage 1/kernel arithmetic: a sum of the four component figures, once each is computed | Different: pure summation moves to the kernel so the total cannot fail to foot to its components | Unit test: kernel-summed total must equal the sum of the four inputs to the cent; a golden-fixture check that the displayed total in the generator output matches the kernel sum (same discipline as risk-scoring.md's Rule 12 calibration) |
| commercial-analysis.md:75-99 (Pricing Benchmark Methodology: search requirement) | Web search for list prices, competitor pricing, analyst reports, enterprise volume reports, Gartner/Forrester/IDC | Pass 3, judgment/research; not deterministic by nature (web search results vary) | Same | Verified via G7 research-minimums guardrail already in SKILL.md (out of this matrix's scope but the enforcement point) |
| commercial-analysis.md:80-90 (Benchmark table format) | Source/rate/date/notes table listing every data point found | Output-spec item; becomes a generator template field, same treatment as review-summary-design.md/pass-artifacts.md (out of this matrix's document scope, noted for cross-reference) | Different: enforced generator field instead of free-form table | Generator refuses to emit a benchmark table row missing a source or date |
| commercial-analysis.md:92-97 (Benchmark confidence rating HIGH/MEDIUM/LOW) | HIGH = multiple independent sources, <6mo old, direct comparison; MEDIUM = limited sources, 6-12mo, indirect; LOW = single source, >12mo, or none | Stage 1 mechanical sliver: GIVEN structured source metadata (source count, most-recent date, comparability flag) already logged by Pass 3's research step, the HIGH/MEDIUM/LOW classification itself is a deterministic lookup, not a fresh judgment call each time. The research and the comparability flag remain Pass 3 judgment; only the final classification given that metadata is mechanical | Different: classification is new-mechanical, the underlying research stays judgment | Unit test: 3 sources, most recent 2 months old, direct comparison flagged true, must classify HIGH; boundary case at exactly 6 and 12 months should be tested explicitly since the doc's own wording ("< 6 months" vs "6-12 months") leaves the exact 6-month mark ambiguous (see section 6) |
| commercial-analysis.md:99 (Never fabricate benchmark data rule) | If web search returns nothing, say so explicitly rather than inventing a range | This is a hard behavioral/anti-fabrication rule (same family as Rule 4 in SKILL.md), stays an instruction to the model, not something code can enforce except by checking that a benchmark section isn't present without a benchmark-sources citation | Same | Generator-side check: a Pricing Assessment block cannot be emitted with a benchmark range but zero rows in the benchmark table |
| commercial-analysis.md:106-108 (Scope boundary classification -> risk level) | Deliverable-based = lower risk; activity-based = higher risk; open-ended = maximum risk | Classification (which of the three the scope resembles) is Pass 3 judgment; the label-to-risk-tier MAPPING, once classified, is a Stage 1/deterministic lookup (a 3-entry table) | Different for the mapping step only | Unit test: given classification="open-ended", the lookup must return "Maximum," not a model re-derivation each time |
| commercial-analysis.md:110-114 (Pricing model -> risk mapping) | Fixed-price = supplier bears risk, low Lilly risk; T&M = high Lilly risk; per-seat = neutral; T&M-with-cap = moderate | Same pattern as the row above: classification is judgment, the 4-entry lookup table is Stage 1/deterministic | Different for the mapping step only | Unit test on the 4-entry table, same shape as above |
| commercial-analysis.md:116-119 (Change order/change request mechanism assessment) | Structured process = lower risk; informal = high risk; none defined = maximum risk | Presence/absence of a defined change-order process is a Stage 1 sliver (does a change-order clause exist in the contract_index at all); the risk-level assignment given that presence/absence is again a small deterministic lookup | Different for the sliver and lookup | Fixture with no change-order clause anywhere in the clause tree returns "none defined -> maximum risk" without model re-reasoning |
| commercial-analysis.md:121 (Exclusions/assumptions explicitness check) | Are exclusions explicit, implicit, or absent | Pass 3, judgment (explicit vs. implicit is a reading-comprehension distinction, not mechanical) | Same | N/A mechanical test |
| commercial-analysis.md:138-144 (Identify embedded assumptions: volume/usage/resource/timeline/dependency/technology) | Extract every assumption the pricing depends on, across six named categories | Pass 3, judgment - this is generative extraction, not a lookup | Same | Verified by the assumptions-register output requiring at least one row per category where applicable, per the generator schema |
| commercial-analysis.md:146-149 (Assess assumption risk / bearer / contractual protection) | For each assumption: likelihood of breaking, who bears the cost, is there a contractual mechanism | Pass 3, judgment throughout | Same | N/A mechanical test |
| commercial-analysis.md:151-156 (Change request process evaluation: seat/volume/feature/rate/resource/timeline changes) | Assess how the contract handles six kinds of mid-term adjustment | Pass 3, judgment, though each of the six is a presence/absence-of-a-clause check that a Stage 1 sliver can propose as a candidate (does the contract mention seat reduction rights at all), with Pass 3 judging adequacy | Same, presence-check sliver is new | Fixture with zero mention of seat-count adjustment anywhere in the clause tree surfaces as a Stage 1 candidate gap |

## 4. pharma-requirements.md (15 rows)

Destination default: **Pass 3, Commercial, Tactics, Pharma** (loaded "Always,"
per SKILL.md:666, since pharma requirements apply industry-wide regardless of
document type). Several rows here duplicate Hard Stops already defined in
playbook.md; the matrix calls that out explicitly rather than silently
double-counting coverage.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| pharma-requirements.md:13-18 (21 CFR Part 11) | Applies when supplier operates GxP systems; requires IQ/OQ/PQ validation, audit trail, e-signature compliance, change control, periodic review | Pass 3, judgment on applicability (does the supplier's system "touch GxP data" - not always obvious from text alone) plus judgment on adequacy of the clause once applicability is established | Same | Fixture: a lab-information-system SOW with no Part 11 language is flagged; a marketing-services SOW with no GxP exposure correctly produces no finding |
| pharma-requirements.md:19-28 (Adverse Event Reporting) | Same 1-business-day requirement and Lilly Answers Center contact as playbook.md HS-4, plus additional detail: reportable-event definition, personnel training obligation, survival-past-termination clause | Pass 2 handles the Hard Stop itself (via the playbook.md:35-41 row); Pass 3 handles the pharma-specific ADDITIONS not in playbook.md: the reportable-event definition, training obligation, and survival clause, each a presence/absence check feeding Pass 3 | Same finding for the Hard Stop portion (explicit duplication, single source of truth should be playbook.md's HS-4 rule, this file's mention should reference rather than re-implement it); different/additive for the three extra elements, which are genuinely new content not in playbook.md | Fixture with the AE clause present but no survival-past-termination language is flagged distinctly from a missing-AE-clause finding, since these are two different gaps |
| pharma-requirements.md:29-38 (Debarment) | Same "no knowingly qualifier" requirement as HS-2, plus additional detail: notify-on-status-change obligation, immediate-termination right, OIG/FDA list cross-check (handled by onboarding, out of scope) | Pass 2 handles the Hard Stop (via playbook.md:23-28); Pass 3 handles the two additional obligations (notify-on-change, immediate-termination right) as presence checks | Same duplication note as the AE row above | Fixture missing the notify-on-status-change clause (but with clean "knowingly"-free language) is flagged on the additional-obligation gap, distinct from HS-2 |
| pharma-requirements.md:41-47 (HIPAA BAA) | BAA required when PHI in scope; must cover permitted uses, safeguards, 72hr breach notice, return/destroy at termination, subcontractor flow-down, audit rights; watch resistance or improper "not a Business Associate" claims | Pass 3, judgment on PHI-in-scope determination and on adequacy of each BAA element. Stage 1 mechanical sliver: numeric threshold on the 72-hour breach-notice window, identical sliver to playbook.md:126-133 (§9-10) - single shared implementation, not two | Same, dedup opportunity noted (also see ambiguity note, section 6, on the "clearly handle PHI" standard) | Same fixture as the playbook.md §9-10 72-hour row |
| pharma-requirements.md:50-57 (FCPA/anti-corruption baseline) | Anti-bribery reps, FCPA/UK Bribery Act/local-law compliance, Lilly audit right, immediate notification of investigation, termination right | Pass 2/3 boundary: overlaps playbook.md §12-13 (compliance/anti-corruption). Pass 2 covers the compliance-with-laws baseline; Pass 3 covers the pharma-specific additions (immediate notification of investigation, explicit anti-corruption audit right) not spelled out in playbook.md | Same duplication note; additive for the two extra elements | Fixture with anti-corruption language present but no explicit audit right is flagged on the additive element |
| pharma-requirements.md:58-62 (Enhanced anti-corruption for high-risk suppliers) | Annual training, ACDD Entry Point Criteria assessment, periodic compliance certifications, for suppliers interacting with government officials on Lilly's behalf | Pass 3, judgment - "high-risk" / "interacts with government officials" determination is not mechanical from text alone, it requires understanding what the supplier actually does | Same | Fixture: a supplier scope description mentioning "regulatory affairs liaison with health authorities" should trigger Pass 3 to apply the enhanced tier; verified by confirming the review states its reasoning for the tier decision |
| pharma-requirements.md:64-73 (Trade Sanctions / Export Control) | Same non-negotiable requirement as HS-1, plus OFAC rep, screening obligation, EAR/ITAR compliance, notification-if-listed, termination right | Pass 2 handles the Hard Stop (via playbook.md:17-22); Pass 3 handles the additive detail (EAR/ITAR compliance specifically, screening obligation) not spelled out in playbook.md's HS-1 | Same duplication note | Fixture with sanctions language present but no EAR/ITAR-specific compliance clause is flagged on the additive element for an export-controlled engagement |
| pharma-requirements.md:77-88 (GxP Supplier Qualification) | Quality Agreement as an associated (not child) document, quality-audit right, change-notification requirement, CAPA procedures, deviation reporting, annual quality review | Pass 3, judgment on GxP applicability ("could affect quality/safety/efficacy of a Lilly product" is a judgment call, not a keyword match) and on adequacy of each element once applicable | Same | Fixture: a manufacturing-support SOW missing CAPA procedures is flagged; the "associated_with not child_of" relationship classification is verified against contract-stack-map.md's document-family model (out of this matrix's scope, cross-referenced) |
| pharma-requirements.md:90-93 (Pharmacovigilance Agreement) | Required when clinical trials, medical information, or patient support programs are in scope; supplementary (associated_with) relationship to the MSA | Pass 3, judgment on applicability | Same | Fixture: a clinical-trial-support SOW with no Pharmacovigilance Agreement referenced anywhere is flagged as a missing required instrument |
| pharma-requirements.md:97-102 (Clinical Trial Data handling) | No use beyond Lilly's services; Lilly-owned; destroy/return at termination, no retained copies; encryption TLS 1.2+ in transit, AES-256 at rest | Stage 1 mechanical sliver: exact-string/version-number presence check for "TLS 1.2" (or higher) and "AES-256" in the data-handling clause. The broader "no other use," ownership, and destruction obligations stay Pass 3 judgment | Same, sliver is new for the encryption-standard piece only | Fixture stating "TLS 1.0" is flagged as below the 1.2 floor by the Stage 1 sliver; the no-retained-copies obligation is verified separately by Pass 3 as a presence check |
| pharma-requirements.md:103-108 (Patient Data handling) | HIPAA BAA when PHI (dup of the BAA row above); GDPR DPA for EU patient data even when processed in the US; data minimization; right to erasure | Pass 3, judgment, EXCEPT the "even if processed in the US" nuance is worth flagging precisely because it is a rule a naive keyword search (looking only for "processed in the EU") would miss - Pass 3 must reason about data SUBJECT location, not processing location | Same | Fixture: a US-processed dataset that includes EU patient records must trigger the GDPR DPA requirement; a fixture testing only "is processing physically in the EU" would produce a false negative, which is exactly why this stays Pass 3 rather than becoming a Stage 1 sliver |
| pharma-requirements.md:109-113 (Regulatory Submission Data retention) | Data used in FDA/EMA submissions retained "per regulatory timelines"; Part 11 integrity for electronic modifications; audit trail for changes | Pass 3, judgment - "per regulatory timelines" is not a number anywhere in this document (see ambiguity note, section 6); Part 11 audit-trail requirement duplicates the Part 11 row above | Same | Fixture with no data-retention clause at all for submission-related data is flagged as a gap, but the review cannot cite a specific year count from this document alone; it should say so rather than inventing one (Rule 4) |
| pharma-requirements.md:114-127 (Insurance pharma-specific additions table) | Product Liability $5M, Clinical Trial Liability $5M, Professional Liability/EO $5M standard/$10M clinical, Cyber $5M, Environmental per HSE assessment | Stage 1 mechanical sliver: numeric threshold per coverage type against the stated minimum, extracted from the numeric register, ADDITIVE to (not replacing) the playbook.md §14 general insurance thresholds - both sets of minimums must be checked, and the higher applicable minimum governs when they overlap (e.g. Professional Liability jumps to $10M for clinical engagements) | Same, sliver is new; the additive relationship with playbook.md §14 must be stated explicitly so a future reader doesn't treat them as duplicative and drop one | Fixture: a clinical-trial-support SOW carrying only $5M Professional Liability (the general standard) must be flagged as below the $10M clinical-specific floor |
| pharma-requirements.md:128-143 (Pharma Contract Review Checklist, 11 items) | Pre-delivery checklist restating: AE clause present, debarment cert present, sanctions unmodified, anti-corruption present, Quality Agreement if GxP, HIPAA BAA if PHI, DPA if personal data, Pharmacovigilance Agreement if clinical, AI Standard if AI/ML, insurance minimums met, data-retention addressed | This is a consolidated PRESENCE SWEEP over checks already covered individually in the rows above; it maps 1:1 onto them rather than introducing new substantive content. In the new design it becomes an enforced generator-side assertion (same treatment as playbook.md's Review Output Checklist row above): the Legal/Commercial Briefing generator will not emit "pharma requirements reviewed" without a stored disposition for each of the 11 items | Different: was a prose self-check instruction; becomes a generator-enforced completeness assertion, backed by the individual findings already produced above | Generator unit test: a findings ledger missing a disposition for any of the 11 checklist items (e.g. no explicit "GxP: not applicable, no quality/safety/efficacy touchpoint" entry) causes the generator to raise rather than silently omit the line from the review summary |

---

## 5. Retrieval indexing verdict, per document

All four documents are viable candidates for retrieval indexing. The strength
of the win differs, and it is worth separating "index exists at all today" from
"index is fine-grained."

**playbook.md - viable, and the biggest new win of the four.** Today it is
loaded "Always," in full, every run (SKILL.md:658) with zero narrowing. The
natural key is NOT the numeric section label alone, because the document itself
records that numbering drifts across templates ("§14 Insurance (§16 in some
templates)," playbook.md:152). The index should be keyed on a normalized TOPIC
tag (term, ip, confidentiality, indemnification, liability-cap, insurance,
force-majeure, termination, ai-ml, governing-law, dispute-resolution, and the
six Hard Stop tags), resolved from each clause's heading/keyword content during
Stage 0 clause-tree construction, with the numeric section label carried as a
secondary alias, not the primary key. **On a retrieval miss** (a clause Stage 0
could not confidently tag to any known topic), the fallback is to load the
FULL playbook, never to skip the clause - this must be stated as an explicit
rule in the index implementation, not an assumption. Given the clause-by-clause
narrowing above, a typical WO/SOW review that only touches 8-10 of the ~27
sections could plausibly load a fifth of the file's judgment content rather
than all of it, while never losing a section it needed.

**vendor-tactics.md - viable, and partially already done.** Document-level
loading is already conditional (SKILL.md:662: "SOW/WO/CO/Amendment reviews,
supplier paper" vs. skip for CDAs/DPAs). The NEW win is intra-file: the
applicability matrix at vendor-tactics.md:276-289 already gives an exact
document-type-to-category key, unused today (the model re-reads all 12
category definitions in full even for an Order Form, which the table says only
needs categories 1, 6 and 8). Index key = document type (CO/SOW/WO/Amendment/
OF/MSA), value = the list of applicable category numbers, sourced directly
from the existing table rather than invented. **On a miss** (a document type
not in the table, e.g. a novel instrument type), fallback is to load all 12
categories in full, never to guess a subset.

**commercial-analysis.md - viable, narrower win than the other three.** Also
already document-level-conditional (SKILL.md:663). Because Pass 3 handles
commercial analysis as one integrated pass rather than category-by-category (unlike
vendor-tactics' 12 discrete categories), there is less natural sub-file
structure to key an index on. The one clean sub-index is the full-vs-limited
gate (commercial-analysis.md:9-17): when the gate resolves to "limited," only
the short conditional-note section is needed, not the benchmark methodology,
scope-creep framework, or assumptions framework (roughly 100 of the 176 lines).
Key = the full/limited classification already made by Pass 3's own routing
logic. **On a miss** (ambiguous whether pricing is embedded, e.g. a partially
redacted rate schedule), fallback is full-document load, treating the document
as "full analysis" rather than silently downgrading to limited.

**pharma-requirements.md - viable, second-biggest new win.** Also loaded
"Always," in full, with zero narrowing today (SKILL.md:666). Every subsection
already states its own trigger condition in the source text ("Applies when:
supplier provides or operates GxP systems," "Applies when: ALL supplier
contracts," etc.), so the index key is a set of boolean contract-attribute
flags (has_gxp, has_phi, has_clinical_trial, has_ai_ml, is_export_controlled,
has_offshore) that a lightweight classification step (itself a small Pass 3
judgment call, not a mechanical extraction) sets once per review. The four
"ALL supplier contracts" items (AE reporting, debarment, FCPA baseline, trade
sanctions) are NEVER filtered by this index; they always load, matching that
they are Hard Stops or Hard-Stop-adjacent. **On a miss** (the classification
step cannot confidently determine whether GxP/PHI/clinical data applies),
fallback is to load the full corpus rather than assume the flag is false -
an unclassified contract must be treated as "might apply" for pharma
requirements specifically, given the FDA/patient-safety stakes described in
the document's own rationale (pharma-requirements.md:7).

**General rule stated for all four, since it is easy to erode later:** a
retrieval miss NEVER means skip the check. It means fall back to loading the
full corpus for that pass. This directly implements spec section 4's
completeness constraint ("regions with no deterministic finding still get
model eyes") one level up, at the reference-corpus layer rather than the
contract-clause layer.

---

## 6. Pre-existing ambiguities worth surfacing (not redesign defects)

These are quality issues in the CURRENT documents. They exist regardless of
whether the redesign proceeds, and forcing them into a mechanical check would
paper over the ambiguity rather than resolve it, so each stays a Pass
judgment call with the ambiguity noted for Marc.

1. **playbook.md:62 ("longer notice periods acceptable")** for §1 renewal
   fallback - no ceiling is given. Two reviewers could accept a 91-day notice
   and reject a 6-month notice, or vice versa, with no textual basis for either
   call.
2. **playbook.md:139 ("reasonable frequency limits acceptable (e.g., once per
   year)")** for §11 audit rights - the "e.g." explicitly signals the example
   is not binding, so "reasonable" is left to reviewer judgment with no floor
   or ceiling.
3. **playbook.md:157 ("Aggregate reductions for small companies")** for §14
   insurance - "small companies" has no size definition (revenue, employee
   count, or contract value) anywhere in this document or cross-referenced
   elsewhere in this group.
4. **playbook.md:192-196 interaction between the $3M minimum cap and the
   "2x-3x annual contract value" fallback** - for a contract where 2x annual
   value is less than $3M, the document does not state which figure controls.
   A literal reading allows a fallback below the stated minimum, which is
   likely not the intent.
5. **vendor-tactics.md:65 ("a minor scope addition shouldn't justify a 3-month
   extension")** - "minor" and the 3-month reference point are illustrative,
   not thresholds; the document supplies no ratio a reviewer could apply
   consistently.
6. **commercial-analysis.md:93-95 boundary at exactly 6 and 12 months** for
   benchmark confidence rating - "< 6 months" (HIGH) and "6-12 months old"
   (MEDIUM) leave the instant of exactly 6 months undefined as HIGH or MEDIUM,
   and by implication exactly 12 months is similarly undefined between MEDIUM
   and LOW.
7. **pharma-requirements.md:45 ("supplier claiming they're not a Business
   Associate when they clearly handle PHI")** - "clearly" is doing the work
   here with no test for what makes PHI-handling clear versus arguable, which
   matters because the consequence (forcing a BAA) is significant.

None of these block the redesign; all seven stay exactly as ambiguous under
Stage 0/Stage 1/Pass 2/Pass 3 as they are today, because determinism cannot
resolve an ambiguity the source document itself leaves open, only surface it
consistently. Recommend Marc or Legal tighten the source wording independently
of this redesign.

---

# Part 3: output specs, routing and standards, the 12 Rules

*Verbatim from `F1-COVERAGE-MATRIX-PART3-outputs-rules.md`. 98 rows, though its own summary claims 135. See the row-count note above: Part 3 coverage is UNKNOWN until the O1 sweep.*


Scope: `review-summary-design.md`, `pass-artifacts.md`, `sme-matrix.md`, `lilly-templates.md`,
`ai-standard.md`, `dashboard-canonical.md` (retirement + rescue), and the 12 numbered Rules in
`SKILL.md`. Companion to Parts 1 and 2 (Stage 0/1, judgment corpora, risk-scoring.md).

## Summary

135 rows below. **0 BLOCKERs** in the strict sense (every row lands somewhere), but the
dashboard-canonical.md rescue surfaces **two high-priority open gaps** that must be closed
before implementation, not merely noted: (1) the Obligations register/imbalance-analysis/
deadline-urgency content that lived in the dashboard's Obligations sub-tab has **no surfacing
destination in `review-summary-design.md`**, which has no Obligations section at all today; (2)
the Documents sub-tab's Compliance Evidence Checklist and document-family register likewise have
no destination in any surviving output spec. Both are real analysis requirements, not
presentation, and retiring the dashboard would silently drop them unless `review-summary-design.md`
(or the Stack Map) is extended. Separately, the "Deal-tab contribution" section appended to
`dashboard-canonical.md` (lines 224-353, dated 2026-07-29) is **not part of the retirement** --
it documents this skill's data slice into `deal-tab-1c344a` and must be relocated to a file that
survives, or `deal-tab-1c344a` inherits a dangling reference. Two files depend on
`dashboard-canonical.md` directly: `SKILL.md` (9 distinct references) and
`examples/contract_review_canonical_dashboard.jsx` (the reference implementation, wholly
dependent, retires with it). `contract-stack-map.md` mentions "Dashboard only" only as a sibling
mode name, not a structural dependency. Two of the 12 Rules are materially upgraded by the
redesign (Rule 12 becomes code-enforced; Rule 9/5 get a Stage 1 assist); none are lost.

---

## Part A: dashboard-canonical.md -- RETIREMENT, rescue, and dependencies

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| dashboard-canonical.md (entire file, 353 lines) | Locks the 3-panel JSX dashboard (Contract Review / Legal Negotiation / Commercial Analysis, v3.2) as a deliverable, Mode-invariant skeleton | **RETIRED, 2026-07-29.** Marc: the Deal dashboard (`deal-tab-1c344a`) replaces it. Per redesign spec §2, this is the one deliverable eliminated outright. | Different: the deliverable is gone, not reproduced elsewhere | Verified by absence: the redesigned skill's deliverable list (spec §2, four items) has no JSX/dashboard entry. Golden-fixture test (spec §8) does not check for a dashboard artifact. |
| examples/contract_review_canonical_dashboard.jsx | Reference implementation Marc's "clone the structure, swap the data" instruction points at | **RETIRED alongside dashboard-canonical.md.** It is wholly dependent on the retired spec; nothing else in the skill reads it. | Different: deleted | Grep for `contract_review_canonical_dashboard` returns zero references once SKILL.md Step 5C and the reference-file tables (below) are rewritten in Step 6 of the sequencing plan. |
| SKILL.md:82 (Rule 8, dashboard tab-rendering rule) | Generic suite-wide rule: canonical tabs always render, labeled states instead of blanking | Rule survives as written; it is suite-wide and applies to any OTHER skill's dashboard, not specific to this retirement | Same, but no longer exercised by this skill | N/A to this skill after retirement; still tested by other dashboard-producing skills |
| SKILL.md:267, 1210, 1737 (dashboard build instructions, "Follow dashboard-canonical.md v3.2") | Directs the model to clone the canonical JSX structure at build time | **DELETE these instructions in Step 6 rewire** (spec §9 step 6). Replace Step 5C with "no dashboard output; direct the user to the Deal tab for the negotiation-ready view." | Different: instruction removed, not replaced 1:1 | SKILL.md diff review confirms no remaining "clone dashboard-canonical.md" instruction; golden-fixture run produces no dashboard file |
| SKILL.md:661, 669, 1570 (conditional reference-loading table rows for dashboard-canonical.md) | Says "load dashboard-canonical.md when Dashboard output selected" | **DELETE the row.** Also delete "Dashboard only" as a selectable `output_mode` in the Output Selection prompt (SKILL.md:225-248), since there is no dashboard to build. | Different: mode removed | Output Selection picker in the rebuilt SKILL.md no longer offers "Dashboard only"; re-entry patterns section (SKILL.md:254) loses its "Dashboard only from an existing redlined DOCX" row |
| SKILL.md:695-696 (Phase 0C checklist, "Dashboard follows the LOCKED 3-panel canonical") | Pre-delivery self-test line for dashboard structure | **DELETE.** Replace with a check that the four surviving generators ran (spec §2 table) and that any content formerly dashboard-only (see rescues below) landed in its new home. | Different | Updated Phase 0C checklist reviewed against spec §2's four-deliverable list |
| SKILL.md:1040-1058 (mode -> emission matrix, "Dashboard only" column and row 2 "3-panel interactive dashboard") | Defines which modes emit the dashboard | **DELETE the column and the deliverable row.** Matrix becomes three deliverables (Redline, Review Summary, Vendor Response) plus Stack Map as its own row, matching spec §2. | Different | Rebuilt matrix has no dashboard column; "Dashboard only" no longer appears as an `output_mode` value anywhere in SKILL.md |
| dashboard-canonical.md:83-84 -- Protection Score Methodology display (mandatory narrative: starting 100, Covered-category count, Hard Stop count, deduction approach, scale bands) | Mandatory narrative paired with the Overview gauge, explaining the score so it is auditable | **RESCUE.** Maps to `deduction_score()`'s generated calculation table (spec §6, "Rule 12's visible calculation table stays... becomes generator output") and to the Review Summary's Protection Score KPI card (review-summary-design.md:42-46), which reserves the number but not today the prose methodology -- **extend review-summary-design.md's KPI Card Row spec to require the methodology sentence Rule 12 already mandates.** | Same requirement, different renderer (generated table + docx narrative instead of gauge-paired card) | Generator unit test: methodology fields (start=100, covered_count, hard_stop_count, band thresholds) are non-null before the calculation table is emitted; review-summary-design.md updated to name this explicitly |
| dashboard-canonical.md:104,10 -- Protection & Coverage rollup (Covered/Confirm/Gap stat tiles + stacked-proportion bar + "Coverage posture" narrative) | Aggregate view of the 14-category coverage matrix, paired with interpretive narrative | **RESCUE.** The counts already live in PASS_2_COVERAGE; the narrative sentence is new content that must be added to review-summary-design.md Section 02 (Risk Heatmap) or a new subsection, since it does not exist there today. | Same intent; **requires a spec addition to review-summary-design.md**, not yet present -- track as an action item before generator build, not a silent loss | Golden-fixture test compares rescued rollup counts to today's dashboard rollup numbers on the same contract |
| dashboard-canonical.md:96,10 -- Severity-vs-coverage cross-reference callout (ties HIGH/MEDIUM/LOW tier counts to true coverage Gap vs Covered/Confirm) | Narrative connecting Risk Heatmap tier counts to Protection & Coverage status | **RESCUE**, same destination and same caveat as the row above: review-summary-design.md Section 02 does not currently instruct this cross-reference sentence and must be extended to require it. | Same intent; requires spec addition | Reviewer checklist item added to Phase 0C: "Risk Heatmap narrative in the Review Summary states which tier findings trace to a Gap vs Covered/Confirm" |
| dashboard-canonical.md:110 -- Tracked Dates & Deadlines chip strip (urgency-colored, sorted soonest-first by normalized day-offset) + "Deadline risk" narrative | Obligations sub-tab visual: every obligation as a dated, urgency-colored chip | **RESCUE, HIGH PRIORITY GAP.** `pass-artifacts.md` Pass 4 already requires the obligation register and imbalance analysis to be produced as a working artifact (line 94), but review-summary-design.md's Document Structure (Title Page through Deliverables List, lines 88-143) **has no Obligations section at all.** Retiring the dashboard removes the only place this ever surfaced to a user outside a Deal build. **Action required:** add an Obligations section to review-summary-design.md (or extend Section 01), carrying the register, imbalance ratio (>3:1 flag), missing-obligation callout, and a day-offset field per obligation for sorting. | Different: new section must be authored; content itself unchanged | New Phase 0C checklist item: "Obligations register appears in the Review Summary / Briefing output, not only in working notes"; golden-fixture diff confirms obligation count and imbalance ratio match today's dashboard |
| dashboard-canonical.md:111 -- By Party / By Date sort toggle over the obligation register | Pure client-side re-sort, no new data | Presentation-only; the underlying day-offset and Who fields are the real requirement, captured in the row above. No separate rescue needed once the register itself has a home. | Different: toggle (a UI affordance) is dropped; the data it sorted is preserved | Same test as row above; no separate toggle test needed since there is no interactive surface left to toggle |
| dashboard-canonical.md:112 -- verbatim source sentence attached to each obligation's Source cell | Every obligation traces to the exact contract sentence it was extracted from | **RESCUE.** This is a data requirement, not styling: add "verbatim source sentence" as a required field in the obligation register wherever it lands (see two rows up), and in pass-artifacts.md's Pass 4 description of the obligation register (currently line 94 says "Obligation register extracted... with imbalance analysis" without naming the verbatim-sentence field). | Same intent; requires a one-line addition to pass-artifacts.md Pass 4 contents | Spot-check: every obligation row in the rescued output carries a non-empty verbatim-sentence field, checked in Phase 0C |
| dashboard-canonical.md:119-123 -- Documents sub-tab: document-family register (MSA/Exhibits/Addenda/WOs/evidence/invoices), deterministic retention class, Compliance Evidence Checklist against a fixed required-evidence list (W-9, SOC 2, ISS Questionnaire, Data Escrow Decision Memo, SCC/TIA, Data Residency Screen, Risk Acceptance Memo), gate-blocking narrative | Records and status-checks the document family plus compliance evidence, states which sign-off gate each open item blocks | **RESCUE, HIGH PRIORITY GAP.** No surviving output spec names a home for this. Closest existing relative is `pass-artifacts.md` Pass 1's "Exhibit and attachment catalog with status" (line 23) and `contract-stack-map.md`'s document-family mapping, but neither carries the fixed Compliance Evidence Checklist. **Recommend:** extend `contract-stack-map.md` (already the document-family authority per redesign spec §3 Stage 0) to carry the Compliance Evidence Checklist as a Stage 1 deterministic check (each required-evidence item is TRUE/FALSE present-in-register), surfaced in the Stack Map DOCX and, for Full/Briefing modes, in a new Review Summary subsection. | Different: moves from a dashboard sub-tab to a Stage 1 check plus a Stack Map / Review Summary narrative; content requirement unchanged | Stage 1 unit test: `evidenceStatus(item)` never returns Filed without a matching register row (the dashboard's own invariant, preserved verbatim); golden-fixture diff confirms same Filed/Draft/Pending/Awaiting counts |
| dashboard-canonical.md:75 -- `retentionClass(type)` / `evidenceStatus(item)`, "pure lookup functions... no chart, deterministic" | Deterministic doc-type -> retention-class mapping and evidence-status mapping | **RESCUE, direct port.** These are explicitly already deterministic and chart-free -- the easiest possible port into `lilly-procurement-kernels` alongside `deduction_score()`, or into Stage 1. No judgment involved. | Same logic, different execution context (kernel/Stage-1 function instead of a JSX pure function); pure win | Unit test ported 1:1 from the dashboard's implicit lookup table; same inputs produce same retention class and evidence status |
| dashboard-canonical.md:120 -- Documents KPI row (Documents in Family, Executed/Filed count, Draft count, Evidence Awaiting count) | Aggregate counts over the Document Register | **RESCUE** as a derived output of the same register wherever it lands (Stack Map / Review Summary subsection above); these are simple aggregations over rescued data, not a separate requirement | Same, computed differently (Stage 1 aggregation instead of dashboard KPI tiles) | Counts reconcile against the Document Register row count in the golden fixture |
| dashboard-canonical.md:121 -- List / Folder Tree view toggle for the Document Register | Re-groups the same rows by folder path, "no new data between views" | **No rescue needed.** Purely a presentation toggle over data already captured above; correctly retired as UI-only. | Different: dropped | N/A -- confirmed no data-only content in this toggle by its own text ("no new data between views") |
| dashboard-canonical.md:1-74 -- Layout shell, color tokens, typography, reusable components (Metric, Card, STable, Gauge, Sub, Callout, Src, PositionCard, SubHead) | Visual design system for the JSX dashboard | **No rescue needed, correctly retired.** These are rendering-only; the Review Summary already has its own independent docx design system in `review-summary-design.md`. The `Gauge` component specifically (semicircular Protection Score arc) has no docx equivalent and is not required to; the Review Summary already renders the score as a KPI number tile. | Different: dropped, replaced by the pre-existing separate docx design system | Confirmed no shared component names appear in review-summary-design.md; the two design systems were always independent |
| dashboard-canonical.md anti-patterns 1-5 (no per-run redesign, no vanishing sub-tabs, no thin-by-skipping, no fabricated depth, no risk inflation) | Dashboard-specific guardrails | **No rescue needed as dashboard rules**, but the underlying principles (depth parity, no fabrication, correct combined-protection scoring) are already suite-wide via SKILL.md Rule 8 (deliverable structure deterministic) and Rules 7/9/12 (scoring), which apply regardless of dashboard existence | Same principle, already duplicated at the suite level, not lost | Rule 8 / Rule 12 checklist items already in Phase 0C cover this independent of the dashboard |
| dashboard-canonical.md anti-pattern 6 ("no analytical-only output... MUST have negotiation positions, concession sequencing, counter-proposals") | Guards against a dashboard that is data-only with no negotiation prep | **Already covered independently** by review-summary-design.md Section 06 (Negotiation Strategy, mandatory) and pass-artifacts.md Pass 4 (position cards, concession sequencing mandatory gate items). Not a dashboard-only requirement. | Same, pre-existing duplicate coverage | Pass 4 gate check already requires position cards and concession sequencing to exist before any output is finalized |
| dashboard-canonical.md:224-353 -- "Deal-tab contribution (D1/D3)" section, dated 2026-07-29 | Documents the data SLICE this skill contributes to `deal-tab-1c344a` (`issues[]`, `documentConflicts[]`, `protection{}`, `obligations[]`, `tacticFlag`), where each lands in the Deal tab's four panels, and the D3 panel specs (Legal & Protection accordion, Positions master-detail, Communications alignment map, Scope & Performance) | **NOT part of this retirement -- this section is about a different artifact than the JSX dashboard and explicitly says so ("nothing above this line changed... this skill's standalone outputs are unaffected").** It must be relocated to a file that survives the deletion of `dashboard-canonical.md`, e.g. a new `references/deal-tab-contribution.md`, since `deal-tab-1c344a` and any other consuming skill currently read it from inside this file. | Different: same content, different host file | Grep confirms no remaining in-repo reference expects this content to live inside `dashboard-canonical.md`; `deal-tab-1c344a`'s own docs point at the new filename |
| dashboard-canonical.md:279 -- "Held, do not touch: Protection-Score deduction kernel is HELD (#114)" | Warns that changing the deduction calculation is not a documentation task | **Preserve verbatim wherever the D1/D3 section relocates**, and cross-reference it against Rule 12 / `deduction_score()` (Part 2 / redesign spec §6), since the redesign explicitly builds `deduction_score()` in the kernel -- confirm with Marc that the #114 hold is understood to already be reflected in (not contradicted by) that kernel work. | Same restriction, now cross-referenced in two places instead of one | Whoever builds `deduction_score()` first confirms #114's scope against the new kernel function before merging |
| dashboard-canonical.md:281-286 -- "Preserved, unchanged by D1/D3" list (five output modes) | States the Deal-tab work does not affect the skill's own five (now four) deliverables | Superseded by spec §2's explicit four-deliverable list, which already records the JSX dashboard's retirement; this line in the D1/D3 section becomes stale once relocated and must be corrected to "four" during the move, not copied verbatim | Different: the list this line refers to has itself changed | Reviewer confirms the relocated D1/D3 file says "four" deliverables, not "five," when it moves |

---

## Part B: review-summary-design.md -- output spec becomes a generator template

Owning generator per redesign spec §2: **Review Summary `.docx`, generated from the findings ledger.**

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| review-summary-design.md:7 -- "produced as .docx via the docx skill" | Fixes output format | Review Summary generator invokes the `docx` skill mechanics; unchanged | Same | Generator smoke test produces a valid .docx |
| review-summary-design.md:15-22 -- Color palette (6 tokens: Lilly Red, Charcoal, Bold Blue, Amber, Stone, Dark Red) | Fixed brand palette for the docx | Generator hard-codes the palette as constants; no longer merely described in prose the model must remember | **Different (improvement):** enforced by code, cannot drift per-run | Generator unit test asserts exact hex values used for each semantic role |
| review-summary-design.md:26-32 -- Typography spec (Calibri, sizes/colors per level) | Body/H1/H2/H3/footnote/KPI type spec | Generator template constants | Different (improvement): code-enforced | Generated docx style inspection confirms font/size/color per level |
| review-summary-design.md:38-46 -- KPI highlight cards (4 cards: Protection Score, Hard Stops, Total Findings, Negotiation Rounds) with color-by-threshold rule | Fixed 4-card KPI row with threshold-based coloring | Generator reads `risk_score`/`hard_stops`/finding counts/complexity directly from the findings ledger header block (SKILL.md ledger schema) and applies the threshold coloring function | Different (improvement): thresholds are a pure function, not prose the model re-derives each run | Unit test: score 74 -> amber, 75 -> Bold Blue, etc., boundary-tested |
| review-summary-design.md:48-54 -- Risk heatmap table shading rules (High/Medium/Low/N/A backgrounds) | Cell-shading rule keyed to tier | Generator lookup table keyed to `coverage_status`/tier, applied when rendering the table | Different (improvement): deterministic lookup | Unit test on all four tier values maps to the documented hex pairs |
| review-summary-design.md:56-60 -- Finding cards (colored left-border stripe, number+topic, description+action, cross-ref) | Per-finding rendering spec | Generator renders one card per ledger finding entry, pulling `id, title, category, recommended_action` directly; no re-authoring of structure per run | Different (improvement): structure enforced, content still model-authored (recommended_action prose) | Golden-fixture diff: same finding count and same fields populated as today's docx |
| review-summary-design.md:62-65 -- Negotiation strategy two-column layout (Must/Should-Have vs Nice-to-Have/Compromises) | Fixed layout mapping position tiers to columns | Generator maps `HOLD FIRM/RED LINE` -> left column, `TRADE/CONCEDE` -> right column, sourced from Pass 4 position cards | Same, generator-enforced | Unit test: position tier -> column mapping is exhaustive and exclusive |
| review-summary-design.md:67-71 -- Callout boxes (elevator pitch, supplier context, warnings) | Three named callout uses | Generator template reserves these three slots; content is model-authored narrative dropped into a fixed box style | Same content requirement, enforced container | Structural self-test (G10-style) confirms three callout slots present and non-empty |
| review-summary-design.md:72 -- Lilly logo placement, bundled asset path | Fixed asset reference and placement rule | Generator reads the same bundled asset path; unchanged | Same | Generator asserts the asset file exists before emitting page 1 |
| review-summary-design.md:76-82 -- Formatting rules (whitespace, page breaks, no orphaned headings, tight cell padding, full-width tables, footer/header text) | Micro-layout rules | Generator template constants (padding, break rules); "no orphaned headings" becomes a post-render check | Different (improvement): most became code constants; orphan check becomes an automated pass rather than a reminder | Structural self-test flags any heading with fewer than 2 lines following it on the same page |
| review-summary-design.md:88-94 -- Title Page content (header bar, logo, title, metadata table, confidentiality line) | Fixed title page structure | Generator template, metadata pulled from ledger header block (`supplier, document, governing_agreement, as_of_date`) | Same, generator-enforced | Unit test: title page renders all five required metadata fields |
| review-summary-design.md:95-96 -- KPI Card Row placement (page 1, below title) | Placement rule | Generator template ordering | Same | Visual/structural check: KPI row is the second content block after title page |
| review-summary-design.md:98-99 -- Executive Elevator Pitch (3-sentence callout, "can we sign this?") | Content + placement + length constraint | Generator reserves the slot; content remains model-authored (this is judgment, per redesign spec §5's "what cannot be made deterministic" -- narrative authoring) | Same, model still authors the sentences | Phase 0C checklist: elevator pitch present, 3 sentences, answers the sign/no-sign question |
| review-summary-design.md:101-106 -- Section 01 (Supplier Context & Doc Stats: narrative, party map table, 2x4 KPI grid, badge row) | Fixed section structure | Generator template; party map and doc stats pulled from `PASS_1_STRUCTURE` fields (document classification, party map, exhibit catalog) | Same, generator-sourced from Stage 0/Pass 1 data instead of re-authored | Golden-fixture diff on party map and doc-stat counts |
| review-summary-design.md:108-112 -- Section 02 (Risk Heatmap: 12-category table with shading, multi-supplier variant) | Fixed heatmap section | Generator template + rescued coverage-rollup/cross-reference callouts (see Part A rows) | **Different: content requirement grows** (rescue additions), structure otherwise same | Golden-fixture diff on category count and tier distribution; new Phase 0C item for the rescued callouts |
| review-summary-design.md:113-118 -- Section 03 (Findings by Risk Tier: HIGH/MEDIUM/LOW/PROTECTION GAPS subsections, sorted by financial exposure) | Fixed findings section, sort rule | Generator groups ledger findings by `severity`, sorts by `impact` dollar value -- a pure sort, code-enforced | Different (improvement): sort is deterministic code, not a per-run instruction to remember | Unit test: output order matches descending `impact` within each tier |
| review-summary-design.md:119-123 -- Section 04 (Commercial Analysis, conditional on pricing presence) | Conditional section | Generator checks `has_commercial_terms` flag from Pass 1/Layer 2 output; renders or shows NOT APPLICABLE | Same, condition now an explicit boolean rather than an inferred judgment call | Unit test: absent-pricing fixture renders NOT APPLICABLE, not a blank section |
| review-summary-design.md:125-128 -- Section 05 (SME Escalation Routing table: Name/Email/Topic/Finding#/Urgency, Bold Blue row highlight for urgent items) | Fixed routing table | Generator renders directly from the SME routing decisions (see Part D); highlight rule keyed to `urgency == "Urgent"` | Same, generator-enforced highlight rule | Unit test on urgency-flag boundary |
| review-summary-design.md:130-134 -- Section 06 (Negotiation Strategy: two-column layout, numbered concession timeline, BATNA callout) | Fixed section | Generator template; content from Pass 4 concession sequencing and BATNA fields | Same | Golden-fixture diff on round count and BATNA presence |
| review-summary-design.md:136-139 -- Section 07 (Recommended Next Steps: numbered actions with owners/deadlines, supplier-transmission warning callout) | Fixed section | Generator template; the "strip internal comments" warning is a static required string, not model-authored | Same, warning text now a constant | Unit test: warning callout text matches the mandated string exactly |
| review-summary-design.md:141-143 -- Deliverables List (final element, clean table of produced files) | Lists all produced files with descriptions | Generator populates this from the actual four (now four, not five) deliverables actually emitted this run, per the mode -> emission matrix | Different: list now generated from actual emission state, cannot drift from what was really produced (previously a manually-authored table that could go stale) | Unit test: Deliverables List entries match the files actually written to disk this run |
| review-summary-design.md:148-158 -- Anti-Patterns 1-6 (no monospace/box-drawing, no emoji indicators, no key-value dump headers, no flat bullet findings, no orphaned tables, no generic "professional formatting") | Explicit prohibitions on the docx output | **Generator enforcement replaces most of these outright:** monospace/emoji/flat-bullet-findings become structurally impossible because the generator only emits the designed constructs (tables, colored cells, finding cards). "No orphaned tables" becomes the same automated post-render check as the heading-orphan rule above. | Different (improvement): several anti-patterns move from "the model must remember not to do this" to "the generator's grammar cannot produce this" | Structural self-test scans generated docx XML for absence of box-drawing/emoji code points; orphan-table check as above |
| review-summary-design.md:162-165 -- Compatibility Note (Word-plugin mode still produces a separate docx alongside in-document edits) | Clarifies the Review Summary is always a standalone file even in application modes | Generator behavior unchanged; still always emits a standalone file regardless of Application Mode (Auto/Walk-through/Comment) | Same | Application-mode integration test confirms the Review Summary docx is produced in all three Application Modes |

---

## Part C: pass-artifacts.md -- mandatory pass artifacts, now assembled from `contract_index`

Per redesign spec §3, Stages 2-5 are "the four existing passes, unchanged in judgment." What changes
is the input (compact `contract_index` slices instead of re-parsed prose) and, for Pass 1, that it
now verifies Stage 0's segmentation rather than performing it from scratch.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| pass-artifacts.md:15-19 -- Why pass artifacts exist (prevents single-pass collapse; cites the Supplier A WO 10 regression) | Rationale/anti-collapse framing | Same rationale, now reinforced by Stage 0/1: collapse is harder because Pass 2 literally cannot start without the coverage matrix input existing, and the gate checks below are unchanged | Same | N/A -- framing, not a testable requirement on its own |
| pass-artifacts.md:17-31 -- Pass 1 (PASS_1_STRUCTURE): doc classification, governing-doc landscape, exhibit catalog, commercial terms extraction, party map, definition inventory; gate check (artifact exists, governing docs read or labeled unavailable, definition inventory populated) | First pass artifact and its gate | **Same artifact, sourced differently:** Pass 1 now *verifies* Stage 0's clause tree/document-family map/definition register rather than deriving them from a first raw read (spec §3, "Pass 1... now verifies Stage 0's segmentation rather than performing it. That is Marc's 'check the work'... the most important single safeguard"). If Stage 0 mis-split a clause, Pass 1 must catch it and the run states the result. | **Same content requirement; different provenance and an added verification duty.** This is the single most load-bearing change in Part C. | Golden-fixture test includes a deliberately malformed Stage 0 output to confirm Pass 1 flags the discrepancy rather than silently trusting it |
| pass-artifacts.md:28-31 -- Pass 1 gate check items (3 bullets) | Explicit checklist before Pass 2 starts | Same three checks; add a fourth, implicit in the redesign: "Stage 0 segmentation verified, discrepancies (if any) stated" | Different: one item added | Gate-check review confirms the new verification bullet is present in the rebuilt pass-artifacts.md |
| pass-artifacts.md:35-44 -- Pass 2 (PASS_2_COVERAGE): 14-category Protection & Coverage matrix (Covered/Confirm/Gap), definition tracing output, MSA coverage summary; gate check | Second pass artifact and its gate | **Same artifact; benefits most from Stage 0** (spec §3: "This pass benefits most, because tracing is exactly what code does better than prose"). Consumes the cross-reference graph and defined-terms register directly instead of manually tracing through prose. Coverage status itself (Covered/Confirm/Gap) remains model judgment per redesign spec §5 ("Coverage status... is retrieval plus judgment. Code can propose candidate matches; it cannot rule."). | Same judgment, faster/more reliable retrieval | Golden-fixture diff: same 14-category statuses, same section references, on the reference contract |
| pass-artifacts.md:46-50 -- Pass 2 gate check items (4 bullets, incl. "delete any finding already written that PASS_2_COVERAGE resolves") | Explicit checklist before Pass 3 | Unchanged; Stage 1's cross-reference-graph candidates make the "all 14 categories assessed" check easier to confirm mechanically (code can confirm all 14 keys are populated; it cannot confirm the judgment behind each is correct) | Same, with a cheap mechanical assist on completeness (not correctness) | Stage 1 completeness check: all 14 category keys present in PASS_2_COVERAGE before Pass 3 begins (structural, not judgmental) |
| pass-artifacts.md:52-67 -- Pass 3 (PASS_3_ANALYSIS): findings list (tier, doc reference, citation, VERIFIED/ASSUMED, impact, action), commercial analysis, vendor tactics scan (12 categories), pharma requirements check, volume-scaled risk calculations; gate check | Third pass artifact and its gate | **Unchanged.** Redesign spec §3 states this plainly: "Pass 3... is unchanged. It is judgment throughout and nothing here is deterministic." | Same | Golden-fixture diff on finding count, tier distribution, and volume-scaled numbers |
| pass-artifacts.md:69-74 -- Pass 3 gate check items (5 bullets) | Explicit checklist before Pass 4 | Unchanged | Same | Same golden-fixture diff as above |
| pass-artifacts.md:76-96 -- Pass 4 (PASS_4_PREP): validated findings, Protection Score calculation (per risk-scoring.md), position cards (5 fields + 5 persona variants), concession sequencing, counter-proposal, obligation register + imbalance analysis, SME pre-engagement briefs, Go/No-Go; gate check | Fourth pass artifact and its gate | **Protection Score calculation becomes `deduction_score()`** (Part B/redesign spec §6): the kernel computes the score and RAISES on the Rule 12 calibration violation instead of leaving it as an instruction to self-check. Model still supplies severity and coverage status per finding. Position cards, concession sequencing, counter-proposal, SME briefs remain full model judgment (redesign spec §5: "Redline wording," "Obligation interpretation" stay with the model). Obligation register gains the two rescued fields from Part A (verbatim source sentence, day-offset for sorting). | **Different for scoring (enforced instead of instructed, improvement); same for everything else** | Unit test: feeding a zero-Hard-Stop, 10+-Covered fixture into `deduction_score()` raises if deductions exceed 30, matching Rule 12's calibration check as an assertion rather than a reminder |
| pass-artifacts.md:98-106 -- Pass 4 gate check items (7 bullets, incl. the Protection Score anti-drift check) | Explicit checklist before output generation | The anti-drift bullet ("if zero Hard Stops and 10+ Covered, deductions should not exceed 30... re-verify") becomes literally unnecessary as a human checklist item because `deduction_score()` enforces it by raising; the other 6 bullets (position cards, concession sequencing, obligation register, Go/No-Go) remain human/model gate checks | Different for the one bullet (enforced, can be retired from the manual checklist); same for the rest | Kernel unit test replaces the manual checklist item; remaining 6 items stay in Phase 0C |
| pass-artifacts.md:108-122 -- Anti-Collapse Signal list (10 specific collapse patterns, e.g. "writing findings while still reading the document for the first time," "Protection Score below 70 for zero-Hard-Stop/10+-Covered document," "Dashboard missing Obligations/Playbook sub-tab") | Concrete tells that passes collapsed | Nine of ten survive unchanged as diagnostic signals for the model to self-check during Passes 1-4. **The tenth ("Dashboard missing Obligations sub-tab or Playbook sub-tab with persona toggle") is now moot** since the dashboard is retired; replace it with an equivalent signal for the surviving deliverables, e.g. "Review Summary missing its Obligations section" or "Position cards missing a persona variant," tied to the rescued Part A gap. | Nine same, one retired-and-replaced | Updated anti-collapse list reviewed against the four surviving deliverables; new signal added for the rescued Obligations section |

---

## Part D: sme-matrix.md -- routing lookup (deterministic on exact trigger match, model on fuzzy)

Miss behavior for every row below is uniform and already specified in the source document itself:
an issue that does not match any SME's trigger keywords, and is not one of the six named Contract
Request and Consultation Tool topics, routes to "Any provision not covered above -> Novel or unusual
provisions not in the standard playbook" (sme-matrix.md:129), which is model judgment, not a silent
drop. That fallback is preserved unchanged in the new design.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| sme-matrix.md:5-20 -- Escalation Comment Format (fixed template: topic, @SME, change summary, Lilly impact, playbook ref, urgency) | Fixed comment template inserted at the relevant clause | Generator/redline-authoring template constant; content (change summary, impact, citation) remains model-authored | Same content requirement, template now a constant rather than restated prose | Redline generator unit test: escalation comments contain all 6 required fields |
| sme-matrix.md:24-31 -- Tax SME (Adam C Shields), triggers, scope (owns HS-3), common issues, turnaround, "no de minimis exception" | Routing entry | Deterministic keyword match (tax, VAT, withholding, gross-up, etc.) against the defined-terms/clause index from Stage 0; on exact-keyword hit, route directly; HS-3 Hard Stop status flows into `deduction_score()` as a Hard Stop, never reduced | Same routing; the exact-keyword case is now code-fast, the "is this really a tax provision" edge case stays model | Unit test: sample clauses containing each trigger keyword route to Adam C Shields |
| sme-matrix.md:32-38 -- Insurance SME (Christopher T Edwards), triggers, scope, common issues, turnaround, threshold | Routing entry | Same mechanism as above | Same | Same test pattern |
| sme-matrix.md:40-46 -- Audit Rights SME (Carina Horacek Roth), triggers, scope, common issues, turnaround, threshold | Routing entry | Same mechanism | Same | Same test pattern |
| sme-matrix.md:48-54 -- AI/Privacy SME (Legal AIPC mailbox), triggers, scope (owns HS-5), common issues, turnaround, "any AI/ML involvement" threshold | Routing entry | Same mechanism; HS-5 flows into Hard Stop handling in `deduction_score()`; also gates the conditional loading of ai-standard.md (Part F) | Same | Unit test: AI/ML trigger keyword co-activates both the AIPC route and the ai-standard.md conditional load |
| sme-matrix.md:56-62 -- Adverse Events SME (Merry Chu), triggers, scope (owns HS-4), common issues, turnaround, "no modification" threshold | Routing entry | Same mechanism | Same | Same test pattern |
| sme-matrix.md:64-70 -- Trade Sanctions SME (Alessandro Curti), triggers, scope (owns HS-1), common issues, turnaround, "zero tolerance" threshold | Routing entry | Same mechanism | Same | Same test pattern |
| sme-matrix.md:72-78 -- InfoSec SME (Cyber_ISS_Review mailbox), triggers, scope, common issues, turnaround, "any supplier with system/network/data access" threshold | Routing entry; this is the SME Rule 6 explicitly names ("do not escalate everything to the CISO... route to Cyber ISS") | Same mechanism; Rule 6 (Part G) is directly enforced by this being the deterministic default match for security keywords rather than an executive escalation | Same | Unit test confirms security-keyword clauses route to Cyber_ISS_Review@lilly.com, not a CISO contact, absent an explicit board/breach trigger |
| sme-matrix.md:80-86 -- HSE SME (Donna U Carroll), triggers, scope, common issues, turnaround, "on-site work" threshold | Routing entry | Same mechanism | Same | Same test pattern |
| sme-matrix.md:88-93 -- Payment Terms SME (Diane Elizabeth Coey), triggers, scope, turnaround, "shorter than Net-45" threshold | Routing entry | Same mechanism; the Net-45 threshold is also a numeric register check (Stage 0/1 candidate: "payment term < 45 days") that can flag the trigger deterministically | **Different (improvement): the threshold check itself becomes a Stage 1 numeric candidate**, not just a keyword match | Unit test: a contract with Net-30 payment terms produces both a Stage 1 numeric flag and the Diane Coey routing entry |
| sme-matrix.md:95-100 -- Records Retention SME (Mike Boland), triggers, scope, turnaround, "shorter than Lilly's schedule" threshold | Routing entry | Same mechanism | Same | Same test pattern |
| sme-matrix.md:102-108 -- Brand/Publicity SME (Lina Polimeni), triggers, scope, common issues, turnaround, "any use of Lilly name/logo" threshold | Routing entry | Same mechanism | Same | Same test pattern |
| sme-matrix.md:110-115 -- Anti-Bribery SME (Joshua Stine), triggers, scope, turnaround, "any weakening" threshold | Routing entry | Same mechanism | Same | Same test pattern |
| sme-matrix.md:117-129 -- Contract Request and Consultation Tool (6 routing rows: indemnification deviations, liability cap <$3M, choice of law/forum, TfC modifications, force majeure changes, IP disputes) plus the catch-all "any provision not covered above" | Non-SME-specific routing table, including the universal fallback | Same table; the catch-all row IS the documented miss behavior for the entire matrix -- confirmed non-silent | Same | Unit test: a synthetic clause matching none of the 13 SME triggers and none of the first 5 tool rows routes to the catch-all, with a non-empty routing result (never null) |
| sme-matrix.md:131-138 -- Multiple SME Escalation Handling (separate comments per SME, cross-note each other, wait for all before finalizing, escalate conflicts to the Tool) | Procedural rule for overlapping triggers | Unchanged; when Stage 1 keyword matching flags more than one SME for the same clause, this procedure governs, now triggered by a deterministic co-occurrence check rather than the model noticing unaided | Same procedure, deterministic trigger for when it applies | Unit test: a clause containing both an AI keyword and a security keyword produces two escalation comments per this procedure |

---

## Part E: lilly-templates.md -- template detection lookup (deterministic on phrase match, model on ambiguity)

Miss behavior: when no template's key phrases match, SKILL.md already instructs "Determine the
document origin. If unclear, ask" (SKILL.md:381) -- an explicit non-silent fallback to a user
question, preserved unchanged.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| lilly-templates.md:5-33 -- Template Hierarchy tree (Full MSA templates, Addenda, Transaction Documents, Standalone Agreements, Fallback Terms) | Structural map of the Lilly template family | Encoded as a Stage 0 lookup table (template name -> tier -> pairing rules); read once, used by the document-family map component of `contract_index` | Different: tree becomes a data structure Stage 0 consults, not prose the model re-reads each run | Unit test: each of the 13 named templates classifies to the correct tier |
| lilly-templates.md:37-83 -- Template Detection Signals (9 templates: SaaS, Software License, Short Form IT, Short Form License, CDA 2-Way, IT Eval/POC, DHT Eval, US PO T&C, plus title/key-phrase/section signals for each) | Per-template detection signals (title strings, key phrases, unique sections) | **Deterministic Stage 1 candidate:** regex/phrase match against Stage 0's clause tree headings and body text proposes a template match; exact multi-signal match (title + 2+ key phrases) is high-confidence and can auto-populate `document_type`, but the model confirms before it drives downstream review scope, since a misclassified template silently changes which playbook sections apply | **Different: proposal is code, decision stays model** (redesign spec §5's "Playbook position matching" boundary applies by extension: template identity gates playbook scope, so a wrong auto-classification is a correctness risk, not just a labeling one) | Unit test: each of the 9 templates' documented key phrases produces the correct candidate match; a document matching zero templates yields no candidate (not a wrong guess) and the model is prompted to classify manually |
| lilly-templates.md:91-98 -- Addenda Detection and Pairing table (4 addenda: IT Prof Svcs, Hosting, Data Licensing, DHT; detection phrase, key additions) | Same kind of lookup, for addenda specifically, plus pairing to a parent MSA | Same Stage 1 candidate mechanism as above, plus a pairing check: "does the identified addendum's parent-MSA reference resolve to a document actually in the family" -- this pairing check is a pure Stage 1 cross-reference-graph query, fully deterministic | Different (improvement): the pairing validity check (not the addendum's substantive content) becomes a hard Stage 1 fact | Unit test: an addendum referencing a non-existent parent MSA raises a Stage 1 "unresolved pairing" candidate |
| lilly-templates.md:100-140 -- Template-Specific Review Considerations (7 subsections: SaaS, Software License, Addendum, Short Form, WO/CO, Evaluation/POC, CDA -- each naming what to check/verify once the template is identified) | Per-template review checklists (verify Uptime definition preserved, verify Source Code Escrow triggers, etc.) | These remain model judgment applied during Pass 2/3 once Stage 1 has proposed the template identity; the checklist items themselves are candidates for Stage 1 only where they reduce to a presence/absence check (e.g., "is there a Trial Period section" is a Stage 1 structural candidate; "is the Warranty Period definition preserved and unweakened" is judgment) | Mixed: some sub-items become Stage 1 presence checks feeding Pass 2/3; the substantive judgment items are unchanged | Golden-fixture diff on template-specific findings for the reference contract |
| lilly-templates.md:142-163 -- Template Availability for Diff Comparison (13 clean templates with filenames, used when tracked changes are flattened) | Names the clean-template corpus for diffing against a flattened supplier return | Unchanged mechanism (diff against the named clean template); Stage 0 can perform the mechanical diff (line-level differences) as a deterministic pass, with the model interpreting which differences are substantive vs. cosmetic | Different (improvement): the diff computation itself is free Stage 0 work; interpretation of significance stays model | Unit test: a flattened document diffed against its clean template surfaces the same hidden modifications the manual process found on the reference contract |

---

## Part F: ai-standard.md -- judgment corpus, indexed for retrieval

Per redesign spec §12's own categorization, `ai-standard.md` is a "judgment corpus" that "mostly
stays with the model. Code can index them for retrieval so a pass loads only relevant entries
rather than the whole corpus." SKILL.md's Phase 0B.5 conditional-loading table (line 664) already
gates this file's load on "AI/ML detected in scope," which the sme-matrix.md AI/Privacy trigger
(Part D) also activates -- the two are the same detection event today and should stay the same
event in the new design.

| Source | What it does today | Handled in the new design by | Same or different | How it is verified |
|---|---|---|---|---|
| ai-standard.md:9-11 -- §3.2 Permitted Uses / §3.6 Third-Party AI Providers as Subcontractors (HARD STOP HS-5) | Critical-section summary: AI provider = subcontractor unless Low-Impact use, requiring Lilly approval | Model-owned finding generation, indexed so Pass 2/3 retrieves only §3.2/§3.6 when AI/ML is in scope rather than loading the full standard; HS-5 status flows to `deduction_score()` as a never-reduced Hard Stop | Same judgment; retrieval is now scoped instead of full-document load | Golden-fixture diff: HS-5 finding present and correctly flagged Hard Stop on an AI-provider fixture |
| ai-standard.md:13-14 -- §3.4 Lilly Content (sole-benefit use only, no training-content use) | Critical-section summary | Same, indexed retrieval | Same | Same fixture check |
| ai-standard.md:15-16 -- §3.10 Storage and Purging (certified deletion on cessation) | Critical-section summary | Same, indexed retrieval; also a candidate Stage 1 presence check ("does the contract contain a purging/certification clause at all") feeding the model's substantive judgment on adequacy | Mixed: presence check deterministic, adequacy judgment model | Same fixture check plus a presence-check unit test |
| ai-standard.md:17 -- §3.5 Security/Hosting (Lilly-only accessible environment, no supplier oversight) | Critical-section summary | Same, indexed retrieval | Same | Same fixture check |
| ai-standard.md:19-21 -- §3.3 Low-Impact Use exceptions (ancillary tool / no storage-retention) | Defines when §3.2 approval is NOT required | Same, indexed retrieval; this is the definitional gate the model must apply correctly per contract facts -- pure judgment, not automatable | Same | Golden-fixture includes a Low-Impact-use fixture and confirms no false HS-5 finding is raised |
| ai-standard.md:23 -- §3.8 Cost Impact (AI use cannot increase Compensation; must reduce it if introduced post-signature) | Critical-section summary | Same, indexed retrieval | Same | Same fixture check |
| ai-standard.md:25-29 -- Definitions to Watch (High-Impact Use, Lilly Automated Property, AI Provider) | Definitions the review must trace per Rule 10 / definition-tracing-checklist.md | Feeds directly into the defined-terms register component of `contract_index` (Stage 0) so Pass 2's definition tracing (Rule 10) resolves these mechanically once located; whether a given clause's use actually IS "High-Impact" remains model judgment | Mixed: location is Stage 0, classification is model | Golden-fixture diff: same definition-trace output for High-Impact Use classification on the reference contract |
| ai-standard.md:31-32 -- Representations and Warranties (§3.11, 12-item list) | Corpus of required representations to check for | Model-owned; indexed so Pass 2/3 retrieves the §3.11 list only when AI/ML in scope; a Stage 1 presence check can flag which of the 12 items has no textual match at all (candidate only) | Mixed | Unit test: a fixture missing 2 of the 12 reps produces 2 Stage 1 "no match" candidates, both confirmed as real gaps by the model |
| ai-standard.md:34-37 -- Notice and Remediation (48-hour notification, 48-hour cure, termination on failure) | Fixed numeric thresholds (48 hours) | **Deterministic candidate:** a Stage 1 numeric-register check can flag if the contract's own notification/cure window differs from 48 hours (e.g., states 72 hours), same mechanism as the sme-matrix.md Net-45 check in Part D | Different (improvement): threshold deviation becomes a Stage 1 numeric flag | Unit test: a fixture stating a 72-hour cure window produces a Stage 1 deviation candidate against the 48-hour standard |
| ai-standard.md:41-207 -- Full Standard Text (definitions, general terms §3.1-3.16, Exhibit A) | Complete source text for verification against the distilled summary above | Retained as the retrieval corpus itself; SKILL.md's `templates/` cross-check instruction (line 1573, "consult to verify a distilled figure... whenever a finding hinges on getting it exactly right") already governs when the model reads the full text rather than the distilled summary -- unchanged | Same | Spot-check: any finding citing a specific AI Standard section number resolves correctly against the full text on request |

---

## Part G: the 12 numbered Rules (SKILL.md:183-205)

| Rule | What it does today | Survives unchanged / code-enforced / affected by dashboard retirement | Detail |
|---|---|---|---|
| Rule 1 (never cite an unread provision) | Anti-fabrication rule for governing-document citations | **Survives unchanged.** Judgment/honesty rule, not automatable; Stage 0 does not read documents the model hasn't been given, so the rule's premise is untouched. | Not affected by dashboard retirement. |
| Rule 2 (every finding traces to specific text) | Requires section/quote/location per finding | **Survives unchanged**, and is *strengthened* by Stage 0: the clause tree gives every finding a precise anchor (id, page/paragraph) to cite, making compliance easier to produce though the rule itself is unchanged in substance. | Not affected by retirement. |
| Rule 3 (VERIFIED vs ASSUMED) | Distinguishes read-and-confirmed from searched-but-unread governing docs | **Survives unchanged.** Judgment call about what was actually read; Stage 0 cannot infer this. | Not affected by retirement. |
| Rule 4 (never fabricate benchmark data) | Anti-fabrication for market rates/acceptance percentages | **Survives unchanged.** Not automatable; this is precisely the kind of judgment corpus discipline the redesign spec §5 preserves. | Not affected by retirement. |
| Rule 5 (do not flag issues the governing docs already resolve) | The core false-positive guard; requires reading governing docs before generating findings | **Partially code-assisted.** Stage 1's cross-reference/coverage candidates make it mechanically easier to check "does PASS_2_COVERAGE already mark this Covered" before writing a finding, but the actual adjudication (is this genuinely resolved) remains model judgment per redesign spec §4 constraint 1 ("Every Stage 1 candidate is adjudicated by the model. Code never closes a finding."). | Not affected by dashboard retirement; this rule's output (findings) used to feed the dashboard's Findings tab and now feeds the Review Summary and findings ledger instead -- same content, different downstream consumer. |
| Rule 6 (don't escalate everything to the CISO) | Routes security/AI issues to Cyber ISS Review, not an executive, absent board/breach-level triggers | **Survives unchanged**, enforced by the sme-matrix.md deterministic routing default (Part D) which already resolves security keywords to Cyber_ISS_Review@lilly.com rather than a CISO contact. | Not affected by retirement. |
| Rule 7 (do not overstate risk / do not deflate the Protection Score) | Score must reflect combined protection, not standalone-document risk | **Code-enforced via `deduction_score()`** (redesign spec §6): the kernel selects the coverage-column deduction and cannot silently apply the Standalone column to a Covered category; this was previously an instruction to remember and is now a code path that must be explicitly invoked with the right column. | Not affected by dashboard retirement (the score was never dashboard-only; it also drives the Review Summary KPI card and the findings ledger header). |
| Rule 8 (do not add findings for emphasis) | Anti-padding rule | **Survives unchanged.** Judgment call about genuineness of a finding; not automatable, and arguably harder to violate accidentally once Stage 1 candidates already narrow the field to real signals rather than the model padding for volume. | Not affected by retirement. |
| Rule 9 (score combined protection, always) | Requires reading governing docs before scoring any category | **Code-enforced via `deduction_score()`**, same mechanism as Rule 7 -- these two rules describe the same discipline from two angles (don't overstate given protection / do check protection before scoring) and are unified by the single kernel function requiring a coverage-status argument per finding. | Not affected by retirement. |
| Rule 10 (trace definitions before data/AI/IP findings) | Requires definition-tracing-checklist.md tracing before such findings | **Partially code-assisted.** Stage 0's defined-terms register (location of every definition, everywhere it's used) does the mechanical tracing; the model still decides which definition applies and why (redesign spec: "Code can propose candidate matches; it cannot rule" applies here by direct analogy to coverage status). | Not affected by retirement; this rule's findings used to populate the dashboard's data/AI/IP findings and Playbook position cards, now populate the Review Summary Findings section and Positions/Playbook content directly (no dashboard intermediary either way -- the Review Summary always existed as a parallel deliverable). |
| Rule 11 (calculate pharma-specific risk at stated volume) | Volume-scaled impact arithmetic (e.g., 1% of 780K calls/year) | **Could be lifted to a Stage 1 arithmetic check** (multiplication given a stated rate and a stated volume is pure arithmetic, akin to `arithmetic-verification.md`'s domain, which is Part 2 scope) but the *rate itself* (1% false-negative, 0.1% leakage) and its applicability to the specific service being reviewed remain model judgment. As scoped to this Part, the rule survives unchanged; flag for Part 2 to confirm whether the arithmetic step moves into the kernel. | Not affected by retirement. |
| Rule 12 (calculate Protection Score using the combined-protection-weighted formula, with a visible calculation table) | Mandates `risk-scoring.md`'s formula, a visible per-finding calculation table, and the anti-drift calibration check (>30-point deduction ceiling absent Hard Stops/with 10+ Covered) | **Code-enforced, the clearest single upgrade in this matrix.** `deduction_score()` (redesign spec §6) computes the score, and "Rule 12's visible calculation table stays. It becomes generator output rather than model prose, so it cannot disagree with the score." The calibration check becomes a `raise`, not an instruction to self-verify. | Not affected by dashboard retirement directly, but the calculation table's *destination* changes: previously emitted in both "the review summary and the dashboard's Protection Score panel" (Rule 12's own text, SKILL.md:205); now emitted in the Review Summary and the findings ledger only, since there is no dashboard panel left to emit it to. This is a genuine, explicit change to Rule 12's text that must be made when SKILL.md is rewired in Step 6 -- flagged here so it is not missed. |

**Net for Part G:** all 12 Rules survive in substance. Rules 7, 9, and 12 move from instruction to
enforced code (`deduction_score()`); Rules 5, 10, and 11 gain a deterministic first pass that
narrows without deciding; Rules 1-4, 6, 8 are unchanged. Rule 12's own text requires a small,
explicit edit to drop its "dashboard's Protection Score panel" destination once the dashboard is
retired -- the only Rule whose wording (not substance) the retirement forces a change to.
