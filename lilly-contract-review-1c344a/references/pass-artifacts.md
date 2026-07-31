# Pass Artifacts: Mandatory Intermediate Outputs

**Each pass must produce a named working artifact before the next pass begins.** This prevents the most common failure mode: collapsing four analytical passes into a single shallow read that generates surface-level findings without cross-reference reasoning.

**Stage 0 input (v3.8, item F1).** Before Pass 1, `CLAUSE_REGISTER` is built once (SKILL.md Phase 0A.5) by `contract_segmenter.py` and is the structured input every pass below reads clauses from by `clause_id`, instead of each pass independently re-parsing the raw contract text or .docx XML. This changes where each pass gets its text, not what each pass below decides; the four artifacts, their contents, and their gate checks are otherwise exactly as documented below, unchanged.

**Persistence (v3.8, item F1).** `PASS_4_PREP`, as specified below, is the single persistent findings register: `contract_review_generator.py` reads this exact object (not a re-narrated summary of it) to produce the findings ledger and the redline instruction set. The shape below is used verbatim; nothing about `PASS_4_PREP`'s own contents changed to accommodate the generator.

## Why This Exists

The contract review workflow specifies 3-4 passes for a reason. Each pass builds on the previous one:
- Pass 1 understands the document structure and the contractual landscape
- Pass 2 determines what is already protected and what is not (requires Pass 1's governing document read)
- Pass 3 generates findings based on commercial analysis, vendor tactics, and pharma requirements (requires Pass 2's coverage matrix to avoid false positives)
- Pass 4 validates findings, removes false positives, and builds negotiation-ready output (requires Pass 3's findings)

When passes collapse, the result is predictable: findings that flag issues the MSA already covers, missing the cross-reference insights that only emerge from definition tracing, a deflated Protection Score, and shallow commercial analysis. The Supplier A WO 10 regression was caused by exactly this collapse.

## Pass 1: Structural Scan

**Artifact name:** `PASS_1_STRUCTURE`
**Must exist before starting Pass 2.**

Contents:
- Document classification (type, template origin, parties, effective date, term, value)
- Governing document landscape (MSA name/date/template, exhibits with precedence order, BAA status, amendments, prior WOs, compliance history)
- Exhibit and attachment catalog with status (Attached-Reviewed / Attached-Pending / Not Attached / External URL)
- Commercial terms extraction (pricing summary, payment terms, term/renewal, commitment structure)
- Party map (if existing tracked changes or comments)
- Definition inventory: list of key defined terms found in governing documents, with section references (DO NOT trace yet; just inventory)

**Gate check before Pass 2:**
- [ ] PASS_1_STRUCTURE artifact exists in working notes
- [ ] Governing documents identified and read (or "not available" documented)
- [ ] Definition inventory populated (at least: Confidential Information, Work Product, Lilly Information, Usage Data; plus AI/data definitions if in scope)

## Pass 2: Governing Cross-Reference and Definition Tracing

**Artifact name:** `PASS_2_COVERAGE`
**Must exist before starting Pass 3.**

Contents:
- Protection & Coverage matrix: for every protection category (Termination, SLA, Data Protection, AI Governance, Security, Audit, IP, Indemnification, Liability, Insurance, Renewal/Price Protection, Flexibility, Pharma-specific, Commitment Structure), record whether it is:
  - **Covered** (governing document provides protection, with section reference)
  - **Confirm** (governing document likely covers but needs verification or WO-level enhancement)
  - **Gap** (not covered in governing documents or in the document under review)
- Definition tracing output: for every definition on the tracing checklist that is in scope, the completed trace (per `references/definition-tracing-checklist.md`)
- MSA coverage summary: compact grid of key MSA provisions with section references and "covered" status

**Gate check before Pass 3:**
- [ ] PASS_2_COVERAGE artifact exists in working notes
- [ ] All 14 protection categories assessed with governing document cross-reference
- [ ] Definition traces completed for all in-scope definitions
- [ ] No finding has been generated yet that flags an issue the governing documents resolve (if you already wrote a finding, re-check it against PASS_2_COVERAGE and delete if it is a false positive)

## Pass 3: Commercial + Tactics + Pharma Analysis

**Artifact name:** `PASS_3_ANALYSIS`
**Must exist before starting Pass 4.**

Contents:
- Complete findings list with tier (HIGH/MEDIUM/LOW), each carrying:
  - Specific document reference (section, clause, page)
  - Playbook, regulatory, or definition citation
  - VERIFIED/ASSUMED flag (per Anti-Drift Rule 3)
  - Impact assessment with dollar amounts where calculable
  - Recommended action
- Commercial analysis (if pricing present): pricing decomposition, per-unit economics, discount architecture, value at risk, assumptions register, benchmark data with sources and confidence
- Vendor tactics scan results (12 categories, each flagged/clear/not applicable with triggering text)
- Pharma requirements check (AE reporting, debarment, sanctions, anti-corruption, BAA, GxP)
- Volume-scaled risk calculations (e.g., at X calls/year, a Y% error rate means Z missed signals)

**Gate check before Pass 4:**
- [ ] PASS_3_ANALYSIS artifact exists in working notes
- [ ] Every finding cross-referenced against PASS_2_COVERAGE (no false positives from governed provisions)
- [ ] Every finding involving data/AI/IP cites a specific traced definition from PASS_2_COVERAGE
- [ ] Commercial analysis includes per-unit economics (not just totals)
- [ ] If volume-based engagement: pharma risk calculated at stated volume

## Pass 4: QA + Negotiation Prep

**Artifact name:** `PASS_4_PREP`
**Must exist before generating any output (dashboard, DOCX, vendor response).**

Contents:
- Validated findings list (false positives removed, Protection Score reflecting combined protection)
- Protection Score calculation using `references/risk-scoring.md` formula: for each finding, cross-reference its protection category against PASS_2_COVERAGE, select the appropriate deduction column (Standalone / Governed: Covered / Governed: Confirm / Governed: Gap), apply deduction, sum, subtract from 100. Show the calculation table in working notes.
- Position cards for every contested or recommended term:
  - Lilly position with rationale and definition/playbook citation
  - Arguments (list of specific supporting points)
  - Likely supplier pushback (predicted counter-argument)
  - Lilly rebuttal (scripted response to the pushback)
  - Fallback with trade value
  - Historical acceptance rate (if available from negotiation-playbook-learning)
  - Persona variants: all five persona phrasings (Standard, Collaborative, Aggressive, Curious, Astonished) of the position's argument
- Concession sequencing (what to concede in Round 1, what to hold for Round 2, what never to concede)
- Counter-proposal (prioritized list of commercial and legal asks)
- Obligation register: extracted from WO and governing documents per Step 6.5, with imbalance analysis
- SME pre-engagement briefs (full briefs, not just a routing table)
- Go/No-Go assessment with blocking issues and conditions

**Gate check before output generation:**
- [ ] PASS_4_PREP artifact exists in working notes
- [ ] Every finding in PASS_3_ANALYSIS either survives into PASS_4_PREP or has a documented reason for removal (false positive, governed by MSA, etc.)
- [ ] Protection Score calculated using `references/risk-scoring.md` formula with PASS_2_COVERAGE cross-reference. Each finding's deduction references its coverage status and the column used. If any finding's deduction does not reference its coverage status, the score is invalid.
- [ ] Protection Score anti-drift check: if zero Hard Stops and 10+ Covered categories, total deductions should not exceed 30 points unless genuinely unprotected exposures exist. If they do exceed 30, re-verify each deduction against the correct column.
- [ ] Position cards exist for every HOLD FIRM and TRADE position, with all five fields (position, arguments, pushback, rebuttal, fallback) and all five persona variants
- [ ] At least one concession sequence is defined (Round 1 items + Round 2 items)
- [ ] Obligation register extracted with imbalance analysis
- [ ] Go/No-Go assessment is specific to this contract (not a generic "proceed with changes")

## Anti-Collapse Signal

If you find yourself writing the final dashboard or DOCX without having produced all four artifacts, STOP. You collapsed the passes. The output will be shallow. Go back and produce the missing artifacts.

Specific signals that indicate pass collapse:
- Writing findings while still reading the document for the first time (Pass 1 and Pass 3 merged)
- Scoring risk on a category without having checked the governing document for that category (Pass 2 skipped)
- Generating a position card without a fallback or trade value (Pass 4 skipped)
- Generating a position card without all five persona variants (Pass 4 incomplete)
- Flagging "no renewal protection" or "no price lock" without checking Exhibit B Section 4.1 or equivalent (Pass 2 skipped)
- Producing a findings list with no definition citations for data/AI/IP items (Pass 2 definition tracing skipped)
- Producing a commercial analysis with no per-unit economics or discount architecture (Pass 3 commercial incomplete)
- Protection Score that uses the Standalone deduction column for a finding whose protection category is Covered in PASS_2_COVERAGE (scoring formula misapplied)
- Protection Score below 70 for a document with zero Hard Stops and 10+ Covered categories (likely inflation; re-check per references/risk-scoring.md anti-drift calibration)
- Dashboard missing Obligations sub-tab or Playbook sub-tab with persona toggle (canonical structure incomplete)

---