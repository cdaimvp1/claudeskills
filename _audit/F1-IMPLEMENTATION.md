# F1 implementation record

Item: `_audit/UPGRADE-PLAN.md` WS F, F1 ("Separate analysis passes from assembly passes in
lilly-contract-review"), redesign analysis in section 3.1. Read `_audit/OPTIMIZATION-PRINCIPLES.md`,
`_audit/F2-IMPLEMENTATION.md`, and the full four-pass workflow in
`lilly-contract-review-1c344a/SKILL.md` before concluding anything.

## Pass classification (SKILL.md "Phase 0B: Multi-Pass Review Planning", lines 644-648,
cross-checked against `references/pass-artifacts.md`)

1. **Pass 1 - Structural Scan** (SKILL.md:645): "Document classification, party
   identification, commercial terms extraction, deliverable inventory, timeline mapping. Do
   NOT apply playbook yet - just understand the document." ANALYSIS. Produces
   `PASS_1_STRUCTURE` (`pass-artifacts.md:15-31`): document classification, governing-document
   landscape, exhibit catalog, commercial terms extraction, definition inventory. No
   document-assembly mechanic present.
2. **Pass 2 - Substantive Review with Governing Document Cross-Reference** (SKILL.md:646):
   "Apply the playbook section by section. For every provision, check whether the governing
   MSA already covers it. Flag only genuine WO-level gaps... This is where most findings are
   generated." ANALYSIS. Produces `PASS_2_COVERAGE`: the 14-category Protection & Coverage
   matrix and the completed definition traces. No document-assembly mechanic present.
3. **Pass 3 - Vendor Tactics & Commercial Analysis** (SKILL.md:647): "Apply the 12-category
   vendor tactics framework... Run commercial analysis (pricing, benchmarks, discount
   structure). Cross-reference with prior WO pricing." ANALYSIS. Produces `PASS_3_ANALYSIS`:
   the complete findings list with tier/citation/VERIFIED-ASSUMED flag, commercial
   decomposition, vendor-tactics scan, pharma volume-scaled risk. No document-assembly
   mechanic present.
4. **Pass 4 - Output Quality Assurance** (SKILL.md:648): "Re-read all findings against the
   governing document landscape. Verify that every finding is accurate given MSA
   protections. Remove false positives... Ensure every finding has: (a) specific contract
   reference, (b) playbook or regulatory citation, (c) recommended action, (d) impact
   assessment." ANALYSIS. Produces `PASS_4_PREP`: validated findings, the Protection Score
   calculation table, position cards (5 fields x 5 personas), concession sequencing,
   counter-proposal, obligation register, SME briefs, Go/No-Go. No document-assembly
   mechanic present.

**Verdict: all four passes are analysis. None is assembly, and none contains an
assembly mechanic braided into it.** This is a different shape from F2. In
rfp-response-analysis, each of the three passes ended with an explicit "open the saved
document and append... Save" instruction (F2-IMPLEMENTATION.md quotes this at SKILL.md
549-559 pre-edit) -- the model was reopening and re-rendering a partially-built `.docx`
mid-analysis, three times. I searched this SKILL.md specifically for that shape
(`grep` for "open the saved", "reopen", "append the", "Save the document") and found none
in the four-pass section or anywhere in Steps 0-4. Document assembly here happens exactly
once, after all four passes are complete, in Step 5 ("Output emission is controlled by
`output_mode`... The analytical workflow (Steps 0-4, 6.5) has already produced all the
data each output needs; this step is purely artifact generation," SKILL.md:1038), using
the generic `docx` skill (SKILL.md:1062, :1296), not a bespoke multi-pass reopen loop.
There is no redundant reopen cycle here to collapse, because none exists.

## What the plan actually proposes for this skill, and why it is not safe to build now

Section 3.1 and the F1 entry (UPGRADE-PLAN.md:562-576) do NOT propose cutting or merging
passes ("keep all four passes"). The proposal is two additive pieces:
1. Deterministic clause segmentation before Pass 1, so each pass reads a structured clause
   register with stable IDs instead of re-reading raw contract text four times.
2. A generator that assembles the redlined DOCX and the findings ledger from the
   `PASS_4_PREP` register, replacing today's model-hand-assembled Step 5 output.

Both are legitimate accuracy-preserving-or-improving redesigns in principle (segmentation
reduces raw-text misreads; a generator makes the findings ledger and the DOCX
structurally unable to drift from the validated register, the same reasoning F2 used).
I did not build them, for three concrete, checkable reasons rather than a general
caution:

1. **The plan's own dependency line refuses to let this ship standalone.** UPGRADE-PLAN.md:576:
   "Depends on: A11, C1." C1 (`protection_score()` in the canonical kernel) does not
   exist yet -- confirmed by `PLATFORM-CONSOLIDATION-TRACKER.md:172`: "Real enhancement =
   a deterministic `deduction_score()` kernel fn; but contract-review is the sensitive
   skill we agreed NOT to casually modify (B4). HOLD for explicit Marc go." A generator
   built now would have to either (a) hand-sum the Protection Score in Python from the
   same prose deduction table Rule 12 already uses (which reproduces the exact hand-sum
   problem C1 exists to fix, just relocated into a script instead of fixed), or (b) omit
   the Protection Score from the generator and leave it model-assembled anyway, which is
   a half-built generator for the skill's single highest-stakes number. Per this task's
   own instruction, I do not invent a half one.
2. **A11 (all five hubs locked) gates this whole phase** (UPGRADE-PLAN.md:174-179,
   1362-1364: "F1 through F9 the efficiency redesigns... after the kernels, because F2
   depends on C3... K1, K2 packaging; C1 Protection Score deduction kernel; F1
   contract-review pass redesign") and is not something this task verified or was asked
   to verify.
3. **Marc's own decision gate for this specific item is unresolved.** UPGRADE-PLAN.md:1469-1476,
   decision 6: "contract-review: authorize F1 and C1, or keep both held?... If you want
   zero risk here, skip F1 entirely: the rest of the plan does not depend on it." No
   record exists in this repo of that decision being made explicit-go. Combined with the
   standing hold at `PLATFORM-CONSOLIDATION-TRACKER.md:75,172` ("contract-review is the
   biggest skill; NOT modified this session" / "HOLD for explicit Marc go"), building the
   generator now would be modifying the sensitive skill's core workflow without the
   authorization the plan itself says is required first.

## What changed

**Nothing in `lilly-contract-review-1c344a/SKILL.md`.** No other file in that skill
directory was touched. No other skill was touched.

This is a deliberate zero-change outcome, not an oversight: the four passes are
confirmed-analysis with no assembly braided into them (so there is nothing to
"un-braid" the way F2 had), and the one piece of this skill that genuinely is
model-hand-assembly today (Step 5's single DOCX/dashboard/summary generation from
`PASS_4_PREP`) is the exact piece the plan gates behind C1 and A11, neither of which is
done.

## What is blocked, on what, and why

- **The clause-segmentation preprocessing and the redline/findings-ledger generator
  (the F1 build itself):** blocked on C1 (`protection_score()` kernel function) and A11
  (all-five-hubs-locked gate), per UPGRADE-PLAN.md:576, and on an unresolved Marc
  authorization gate specific to this skill (decision 6, UPGRADE-PLAN.md:1469-1476;
  standing hold `PLATFORM-CONSOLIDATION-TRACKER.md:172`).
- **The Protection Score hand-sum itself (item C1, separately flagged per this task's
  step 5):** Rule 12 (SKILL.md:205) and the Pass 4 gate check (`pass-artifacts.md:98-106`)
  both mandate a "calculation table" for the deduction-model score (start at 100, subtract
  severity x coverage-column deductions, Hard Stops never reduced), but that formula is
  computed in prose against `references/risk-scoring.md`, not via a kernel call. Unlike
  invoice-rate-card-auditor or rfp-response-analysis, `numeric_kernel.py` in this skill's
  own directory has no `protection_score()` or `deduction_score()` function to call --
  confirmed by reading the vendored kernel file directly (NORMALIZATION / VERIFICATION /
  COMPUTATION faces only: `to_hourly`, `convert_currency`, `percentile_gate`,
  `verify_line_math`, `escalate`, `weighted_score`, `npv`, `quadrature_rollup`; none of
  these is a deduction-model scorer, and `weighted_score()` is explicitly the wrong shape
  for a deduction model per the tracker note quoted above). This is blocked on C1, not
  fixable by editing this skill's SKILL.md, and is recorded here only as confirmation of
  the tracker's existing flag, not as new work performed.
- **Recorded as owed under F9 (generator sweep, not built here):** once C1 lands, this
  skill still has no generator of any kind (no `*_generator.py` exists in
  `lilly-contract-review-1c344a/`, confirmed by directory listing -- only `numeric_kernel.py`).
  Every one of the five preserved deliverables (Redline only / Dashboard only / Briefing
  only / Full review / Stack Map only, SKILL.md:213-246) is today produced by direct model
  authorship via the generic `docx` skill or in-chat JSX, not by a dedicated Python
  builder. F9's generator sweep is the right place to size and build that per-deliverable,
  once C1 supplies the score function the findings register needs.

## The five preserved output modes -- confirmed unchanged

Verified unchanged in SKILL.md (no edits made): `Redline only` (:215,242), `Dashboard only`
(:216,243), `Briefing only` (:217,244), `Full review` (:245), `Stack Map only`
(:218,246). The mode -> emission matrix (Step 5, SKILL.md:1042-1047) and Step 0.5's
separate Stack Map emission (SKILL.md:743-746) are both untouched.

## Verify

- Analysis passes before: 4 (Structural Scan / Governing Cross-Reference & Definition
  Tracing / Commercial+Tactics+Pharma / QA & Negotiation Prep). Analysis passes after: the
  same 4, unchanged text, unchanged gate checks. Zero analysis passes removed, zero added,
  zero merged.
- `grep -c "—"` was not re-run against this file because it was not edited; no em dash was
  introduced (no edit occurred to introduce one).
- No other skill's file was opened for editing in this task.

## Cost effect, stated honestly

No cost change was made or measured. This record intentionally does not claim a token or
wall-clock saving, because no code or SKILL.md text changed. The heaviest-runtime finding
from the audit (four-pass, per-clause workflow) stands as-is, by design, pending C1 and the
explicit Marc authorization the plan itself requires before this specific skill's core
workflow is touched.
