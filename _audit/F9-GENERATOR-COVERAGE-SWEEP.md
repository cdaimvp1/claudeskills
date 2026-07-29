# F9: generator coverage sweep

**2026-07-29. Findings and decisions, not builds.**

F9's requirement: *"per deliverable, decide build-a-generator or accept-as-prose, with a
written reason."*

## The decision rule, taken from the suite's own precedent

`_audit/GROUP-6-output-foundations.md:36-41` records the correct split, established for
executive-summary-package:

> **Code owns validation, arithmetic, assembly and invariants. The model owns narrative.**

That is the rule applied below. Prose is the RIGHT answer where content is genuinely
narrative, and a generator that tries to author argument produces worse output than a model
does. The failure this item exists to catch is the opposite one: a **structured** artifact
(a schema, a rate table, a scored matrix) assembled by hand, where the model is doing
clerical work it will eventually get wrong at scale.

## Current coverage

13 skills ship a `.py`. Of those, 8 are real document or data generators; the rest are
decision kernels (`tier_kernel`, `roster_kernel`, `audience_kernel`, `frap_chain_kernel`)
or the shared numeric kernel.

**Two generators landed tonight**, which changes the cost of several rows below:
`invoice_audit_engine.py` (F4/F5) and `dashboard_adapter.py` (F6).

---

## Decisions, ranked by value

### 1. scope-sow-architect — BUILD. Highest value remaining.

| Deliverable | Verdict | Reason |
|---|---|---|
| `rate_card_and_payment_schedule.xlsx` | **BUILD** | A rate table with payment milestones. Pure structure and arithmetic, hand-assembled today. This is the same shape as pro-forma's workbook, which already has a generator, and the same shape as the invoice rate card, which got one tonight |
| `raci_matrix.csv` | **BUILD** | A matrix. There is no narrative in a RACI grid |
| `change_control_log_template.xlsx` | **BUILD** | A template with fixed columns |
| `scope_findings.json` | **BUILD** | A schema. Hand-authored JSON is the drift case E1 and E2 exist to prevent |
| `Rewritten_SOW.docx` | **PROSE** | Genuinely narrative. A rewritten scope is argument and specification, not assembly. Preserved explicitly at `MASTER-REMAINING-WORK.md:316` |
| `scope_diagnostic_dashboard.jsx` | **DEFER to D1** | The IA is being rewritten to the converged 4-tab spec. Build the data adapter after, following pro-forma's F6 pattern |

**Why this ranks first:** four structured artifacts, zero generators, and the arithmetic
(rate x quantity, milestone sums) is already available in the vendored kernel via
`verify_line_math()` and `assert_reconciles()`. Effort M, not L.

### 2. supplier-landscape DOCX — BUILD. Already identified, still open.

| Deliverable | Verdict | Reason |
|---|---|---|
| The landscape report `.docx` | **BUILD** | Carries the identical three-pass open/append/save pattern F2 removed from rfp-response-analysis (`SKILL.md:626-631`) |

This was deferred by name in F2's commit (`d5f3c46`): *"supplier-landscape's analogous three
DOCX passes, because its generator does not yet cover the full document."* Its
`build_dashboard.py` builds the DASHBOARD, not the DOCX.

**Do not fix it the way F2 was fixed.** Collapsing three appends into one write is the
truncation failure guardrail G10 warns about, so it needs a real generator first. Effort L,
comparable to `rfp_analysis_report_generator.py` at ~2,900 lines.

The CSVs (`weighted_scoring_matrix.csv`, `requirements_fit_matrix.csv`,
`supplier_registry.csv`, `excluded_vendors.csv`) should be emitted by the same generator
rather than separately, so the report and the CSVs cannot disagree. That is the F6 lesson.

### 3. negotiation-playbook-learning — BUILD, and it is now cheap.

| Deliverable | Verdict | Reason |
|---|---|---|
| `outcome_dataset.json` | **BUILD** | A dataset. The partition arithmetic it carries is already kernel-backed as of tonight |
| `negotiation_outcome.json` | **BUILD** | Same |
| `outcome_summary.md` | **PROSE** | A human-readable narrative summary. Correctly model-authored |

**Cost changed tonight.** `outcome_partition()` and `difficulty_score()` (O4) already
compute and validate every figure these files carry, including the sum-to-1.0 integrity
check. The generator is now serialization plus assertion, not arithmetic. Effort S.

### 4. rfp-case-manager — BUILD the schemas, keep the drafts as prose.

| Deliverable | Verdict | Reason |
|---|---|---|
| `_case_file.json`, `team_binding.json`, `rfx_project_acknowledged.json` | **BUILD** | State schemas. This skill is the suite's state owner, so hand-assembled state is the worst place for drift |
| `meeting_log.csv` | **BUILD** | A log |
| `case_handoff.json` | **BUILD** | Already has a formal schema after E1; a generator makes the schema enforceable rather than described |
| Meeting drafts, comms, status snapshots | **PROSE** | Communication. Genuinely narrative |
| Case Status Visual | **DEFER** | Presentation; follows whatever hub decision lands |

### 5. legal-negotiation-prep — SPLIT.

| Deliverable | Verdict | Reason |
|---|---|---|
| Briefing `.docx` skeleton, tier tables, position counts | **BUILD** | Structure and arithmetic. `tier_kernel.py` already exists and computes the tiering; nothing assembles the document from it |
| The negotiation argument itself | **PROSE** | This is the skill's whole value. A generator authoring negotiation rationale would produce worse output than the model |

The split is the same one executive-summary-package already implements, and that skill is
the working precedent to copy.

### 6. supplier-deep-dive — DEFER to A5.

The dossier dashboard is A5 (Deep Dive), blocked on Marc's hub-home decision. When it lands
it should follow supplier-landscape's pattern: a deterministic Python engine renders, and
the model authors ONLY the data object. Building a generator before the hub decision would
be building against an IA that is about to change.

The dossier's narrative sections stay **PROSE**.

### 7. rfp-engine — already scoped as E4.

`requirements_matrix.xlsx` and `pricing_template.xlsx` claim data validation and conditional
formatting that no code produces. Tracked as E4, whose A11 dependency was resolved as
spurious on 2026-07-29. Effort M, openpyxl confirmed available, pattern to copy is
`pro_forma_generator.py`.

---

## Accepted as prose, deliberately

These are the right answer and should not be revisited:

- `Rewritten_SOW.docx`, negotiation argument, meeting and comms drafts, debrief drafts,
  `outcome_summary.md`, every dossier narrative section, and contract-review's redline
  wording and position cards.

The test each passes: **a reader would be worse off if a template wrote it.** That is the
line between assembly and authorship, and it is the line `GROUP-6` drew for
executive-summary-package.

---

## What this sweep does NOT cover

`lilly-contract-review` is HELD, so its deliverables are excluded. Its generator question is
F1's, and the coverage matrix already answers it in detail.

## Priority, if only some of this gets built

1. **scope-sow-architect** — four structured artifacts, no generator, arithmetic already in the kernel
2. **rfp-engine E4** — a documented claim (validation dropdowns) that nothing implements, which is a correctness gap rather than a cost one
3. **negotiation-playbook-learning** — now cheap, because tonight's kernel work did the arithmetic
4. **rfp-case-manager schemas** — the state owner should not hand-assemble state
5. **legal-negotiation-prep split**
6. **supplier-landscape DOCX** — highest value per the F2 lesson, but genuinely large
