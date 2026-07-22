# Pass Artifacts: Mandatory Intermediate Outputs

**Each pass must produce a named working artifact before the next pass begins.** This prevents the
most common failure mode for this skill: reading a draft SOW once and generating a plausible-sounding
"looks fine" or "here are some gaps" reaction without a structural map, a per-dimension scoring pass,
or a reconciled rewrite. Four passes, each building on the one before.

## Why This Exists

- Pass 1 establishes what document(s) exist and what type of SOW/scope input this is.
- Pass 2 maps what SOW content is present, partial, or missing against the canonical section
  skeleton (requires Pass 1's classification of what was actually provided).
- Pass 3 runs the objective quality tests on every present section and produces the findings ledger
  (requires Pass 2's structure map so findings are not raised against sections that do not exist in
  this SOW's applicable scope).
- Pass 4 scores, reconciles, and rebuilds: the Scope Definition Score, the rate-card/payment
  reconciliation, the RACI, and the rewritten SOW (requires Pass 3's findings so the score and the
  rewrite both trace to the same evidence).

## Pass 1: Intake & Classification

**Artifact name:** `PASS_1_INTAKE`
**Must exist before starting Pass 2.**

Contents:
- Input classification: existing draft SOW upload (DOCX/PDF), a prior/executed SOW being used as a
  template, email/proposal text, a verbal description, or a combination. Note which.
- Document identity (if a document was provided): parties, category/domain, stated term, stated
  total value, governing MSA reference (if any), document status (Draft / Under Negotiation /
  Executed).
- Engagement-type read: fixed-price deliverables-based, time-and-materials staff-augmentation,
  managed-service/subscription, or hybrid. This determines which dimensions below apply at full
  weight versus a labeled NOT APPLICABLE (e.g., a pure T&M staff-aug SOW may have a thin Deliverables
  dimension by design; say so rather than penalizing it as if it were a fixed-price build).
- Source-document election result (per SUITE INTERACTION PROTOCOL S1): what the user chose and
  what was actually ingested.

**Gate check before Pass 2:**
- [ ] `PASS_1_INTAKE` artifact exists in working notes
- [ ] Input type and engagement type are both classified (not left implicit)
- [ ] If a governing MSA was referenced but not provided, this is noted as a labeled gap (does not
  block the scope-quality diagnostic, which is a WORK-definition question independent of the MSA;
  it DOES cap confidence on any finding that depends on MSA content, e.g. whether change-control
  routes through an existing MSA change-order mechanism)

## Pass 2: Structure Map

**Artifact name:** `PASS_2_STRUCTURE`
**Must exist before starting Pass 3.**

Contents:
- Section coverage matrix: for each of the 10 canonical SOW sections (Scope Statement / In-Scope,
  Out-of-Scope, Deliverables, Assumptions & Dependencies, Roles & Responsibilities, Milestones &
  Schedule, Acceptance Criteria, SLAs & KPIs, Staffing & Rate Card, Payment Schedule, Change
  Control), record Present / Partial / Missing with a one-line reason.
- Deliverables inventory (raw extraction, not yet scored): every distinct deliverable found, with
  its source location (section/paragraph) or "not stated."
- Milestone/payment raw extraction: every milestone, date or trigger, payment amount or percentage,
  and the deliverable(s) it claims to tie to (or "not tied to a deliverable").
- Rate-card raw extraction: every role, level, rate, and unit found.

**Gate check before Pass 3:**
- [ ] `PASS_2_STRUCTURE` artifact exists in working notes
- [ ] All 10 canonical sections assessed (Present/Partial/Missing), none skipped
- [ ] Deliverables inventory and milestone/payment extraction both populated (or explicitly empty
  with a reason, e.g. "no milestones stated; SOW is described verbally with no draft document")

## Pass 3: Quality Analysis & Findings

**Artifact name:** `PASS_3_FINDINGS`
**Must exist before starting Pass 4.**

Contents:
- Complete findings list with severity (BLOCKING/HIGH/MEDIUM/LOW per
  `references/scope-quality-scoring.md`), each carrying:
  - The owning dimension (one of the 10)
  - Specific source reference (section/paragraph, or "absent from the document at the expected
    location")
  - VERIFIED (quoted or paraphrased from the actual input) vs ASSUMED/INFERRED (a category-standard
    expectation the input did not address) flag
  - Impact: what breaks downstream if unresolved (a dispute, an unpriceable change, a stalled
    payment, an unenforceable SLA)
  - Recommended fix, stated as an action, not just a description of the problem
- Acceptance-criteria objectivity scan: every acceptance clause tested against the objectivity rule
  (a named, measurable, third-party-verifiable test); subjective language ("satisfactory,"
  "industry standard," "as reasonably determined," "to Lilly's satisfaction" with no named standard)
  flagged with a rewrite suggestion.
- Payment-to-deliverable alignment check: `verify_line_math()`-style reconciliation of milestone
  payments against the stated total contract value, and a per-milestone check that each payment is
  tied to a specific deliverable or acceptance gate (not a bare calendar date, unless a retainer or
  subscription rationale is stated).
- Rate-card internal-consistency check: for every rate-card row with both a rate and an hours/unit
  figure, `verify_line_math()` confirms rate x hours = the stated line total; any row that does not
  foot is a MEDIUM or HIGH finding depending on the dollar delta.

**Gate check before Pass 4:**
- [ ] `PASS_3_FINDINGS` artifact exists in working notes
- [ ] Every finding is tagged to one of the 10 dimensions (no orphaned findings)
- [ ] Acceptance-criteria objectivity scan covers every stated acceptance clause, not a sample
- [ ] Payment-to-deliverable reconciliation ran (kernel-called, not eyeballed) and its pass/fail
  result is recorded
- [ ] Rate-card consistency check ran on every row that has both a rate and a quantity

## Pass 4: Score, Reconcile & Rebuild

**Artifact name:** `PASS_4_REBUILD`
**Must exist before generating any output (dashboard, diagnostic report, rewritten SOW).**

Contents:
- Scope Definition Score calculation table: all 10 dimension scores (each capped per its owning
  findings' severity per `scope-quality-scoring.md`), the weight set, and the `weighted_score()`
  output, rescaled to 0-100.
- RACI matrix: every workstream/deliverable mapped to a Responsible, Accountable, Consulted, and
  Informed party on both the Lilly and supplier side; orphaned items (no Responsible party) flagged.
- Reconciled rate card and payment schedule: the corrected/completed rate-card table and milestone
  payment table, with the kernel-verified reconciliation shown (not just asserted).
- Change-control trigger register: threshold(s), approval authority, and pricing mechanism for
  changes, either extracted (if present) or drafted from `references/sow-clause-library.md` category
  defaults (labeled DRAFT - confirm with the requesting stakeholder).
- Rewrite map: for every BLOCKING and HIGH finding, the specific rewritten language that resolves it,
  ready to drop into the rewritten SOW section by section.

**Gate check before output generation:**
- [ ] `PASS_4_REBUILD` artifact exists in working notes
- [ ] Scope Definition Score calculation table is complete and every dimension score traces to
  `PASS_3_FINDINGS` (no dimension scored without a documented basis)
- [ ] RACI matrix has zero orphaned deliverables, or each orphan is explicitly flagged as an open
  finding (not silently dropped)
- [ ] Payment/rate-card reconciliation in the rebuilt tables actually foots (if it still does not,
  the rewritten SOW carries the same defect it was meant to fix; do not ship an unreconciled rewrite)
- [ ] Rewrite map covers every BLOCKING and HIGH finding; MEDIUM findings addressed where the rewrite
  budget allows, LOW findings noted for the user's own cleanup pass

## Anti-Collapse Signal

If you find yourself writing the dashboard, the diagnostic report, or the rewritten SOW without
having produced all four artifacts, STOP. You collapsed the passes. Go back and produce the missing
artifact before continuing.

Specific signals that indicate pass collapse:
- Producing a Scope Definition Score with no calculation table (Pass 4 skipped or faked)
- Flagging "no acceptance criteria" without having scanned every acceptance clause for objectivity
  (Pass 3 scan incomplete)
- A payment schedule presented as reconciled without a visible `verify_line_math()`-style check
  (Pass 3/4 reconciliation skipped)
- A rewritten SOW that repeats the same milestone-payment total mismatch the diagnostic flagged
  (Pass 4 rebuild did not actually fix what Pass 3 found)
- Dimension scores that do not move even though the findings list changed between two runs on the
  same input (scores decoupled from findings; re-derive per the coupling rule in
  `scope-quality-scoring.md`)
- A RACI matrix with deliverables that have no Responsible party and no flag calling that out

---
