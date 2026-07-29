# Golden fixture — ANSWER KEY

The known-correct result for this fixture. A run that misses a row here has lost a check.
A run that raises a NEGATIVE CONTROL has gained a false positive, which is the same defect
in the other direction.

Every row cites the rule it exercises, so a failure names the thing that broke rather than
just "output differs".

---

## Part 1 — Hard Stops. Expected count: exactly FIVE.

| # | Planted | Where | Rule | Expected |
|---|---|---|---|---|
| HS-1 | Sanctions screening weakened to "where commercially reasonable" | `WO-10:8.1` vs `MSA:25.2` | `playbook.md:17-22` | Hard Stop. Trade sanctions are non-negotiable. Escalate Alessandro Curti |
| HS-2 | "knowingly" qualifier inserted on debarment certification | `WO-10:7.1` vs `MSA:24.1` | `playbook.md:23-28` | Hard Stop. No "knowingly" qualifier accepted, ever |
| HS-3 | Lilly barred from disclosing to a taxing authority without Supplier consent | `WO-10:9.1` vs `MSA:8.2` | `playbook.md:29-34` | Hard Stop. Lilly must retain tax-authority disclosure rights. Escalate Adam Shields |
| HS-5 | AI model provider expressly excluded from Subcontractor / Sub-processor treatment | `WO-10:6.5` vs `EXHIBIT-C:3.6` and `SPS:4.4` | `playbook.md:42-47` | Hard Stop. Every AI Provider is a Subcontractor. Escalate Legal AIPC |
| HS-6 | Indemnification capped as "sole and exclusive remedy" and folded under the liability cap | `WO-10:12.1` vs `MSA:17` | `playbook.md:48-54` | Hard Stop. Indemnification cannot be a sole-and-exclusive remedy |

**HS-4 is deliberately NOT in this list. See the negative controls.**

**CORRECTION, 2026-07-29.** This list previously held 5 entries and the aggregate asserted
`hard_stop_count: 5`, while Part 5 cited `dpa-review-checklist.md:43` as D-1's basis. That
row is inside a **"Hard Stop If"** column, and line 48 restates it as a Hard Stop, so the
key was citing a Hard Stop rule and then not counting it. Hard Stops are NOT defined in
`playbook.md` alone. D-1 is now listed here as well as in Part 5, and the count is **6**.

Found because a blind run raised the 96-hour window as a Hard Stop and stated plainly that
it could find no `playbook.md` entry for it. The run was reading more carefully than this
key was written.

---

## Part 2 — The absence-detection case. The single most important row in this fixture.

| Planted | Where | Expected |
|---|---|---|
| The Work Order contains **no adverse event reporting clause at all** | absent from `WO-10` | A finding IS raised. Its severity is **LOW**, not HIGH, and it uses the **Governed: Covered** column |

Why this row exists, and what it separates:

`playbook.md:39` says an AE provision is "required in ALL supplier contracts" and instructs
re-insertion if deleted. `SKILL.md` Rule 9 says a WO with no AE clause, under an MSA that
has one, "has LOW AE risk, not HIGH".

Both are correct and they resolve together: the finding is raised, and it is scored against
the governing document rather than as an unprotected gap. `MSA:23.1` carries the one
business day obligation, the Lilly Answers Center contact, training at `23.2`, and survival
at `23.3`.

**Three distinct failures this row catches:**

1. **Silent omission.** No AE finding at all means absence detection is broken. This is the
   exact failure mode that retrieval indexing keyed on document content would introduce,
   because AE never appears in the WO and so never triggers retrieval of the AE rule.
2. **False Hard Stop.** Flagging HS-4 means the skill pattern-matched "no AE clause" without
   reading the governing document. That is the Rule 9 defect and it inflates the Hard Stop
   count to six. **CORRECTED 2026-07-29:** six is now the CORRECT count (5 playbook
   Hard Stops + D-1 from the DPA checklist), so this control tests WHICH six, not how
   many. A run reaching six by raising HS-4 is still wrong; a run reaching six via D-1 is
   right. Do not judge this control on the number alone.
3. **Wrong column.** A LOW finding scored in the Standalone column rather than
   Governed: Covered means `deduction_score()` was called with the wrong coverage status.

---

## Part 3 — Arithmetic. Verified against the rate card at `EXHIBIT-B:3`.

| # | Planted | Expected | Note |
|---|---|---|---|
| A-1 | Data Engineer line: 165 x 1,200 = 198,000, stated **198,500** | Flagged, delta **+$500** | Error against Lilly |
| A-2 | Project Manager line: 145 x 400 = 58,000, stated **57,000** | Flagged, delta **-$1,000** | **Error in LILLY's favour and it must still be flagged.** `arithmetic-verification.md:13` (3E-1.6) is direction-agnostic. A run that reports A-1 but not A-2 has a direction-suppressing bug |
| A-3 | Grand total stated **685,000**; subtotal 644,900 + expenses 35,000 = **679,900** | Flagged, delta **+$5,100** | Subtotal itself foots to the stated lines, so this isolates grand-total verification from line verification |
| A-4 | NTE stated **675,000**, below the stated total 685,000 | Flagged | Exceeds NTE by $10,000 as stated, or $5,400 against the corrected total of 680,400 |
| A-5 | Senior Data Engineer billed **$235/hr** against a $210 card rate | Flagged, overage **$24,000** over 960 hours | `vendor-tactics.md:11-20` Cat 1 rate inflation. Arithmetic is internally correct, so this cannot be caught by recomputation alone; it requires the cross-reference to the rate card |
| A-6 | Analytics Consultant quoted **per day** ($1,400) where the card is per hour | Flagged as a UOM change requiring amendment | $1,400/8 = $175/hr, which equals the card rate exactly. **The price is right and it is still a finding**, per `EXHIBIT-B:3.2`. A run that dismisses it because the economics match has missed the control |
| A-7 | Pass-through markup **25%** against a 10% cap | Flagged | `WO-10:4.5` vs `EXHIBIT-B:3.1` |
| A-8 | Rates escalate **5%** annually from year 2 | Flagged on two independent grounds | Exceeds the 3% cap (`MSA:3.2`) AND rates are locked for the initial term (`EXHIBIT-B:4.1`). A run citing only one has done half the trace |

Corrected figures for reference: line sum **645,400**, total with expenses **680,400**.

---

## Part 4 — Playbook positions

| # | Planted | Where | Rule | Expected severity / column |
|---|---|---|---|---|
| P-1 | Automatic renewal | `WO-10:3.1` vs `MSA:1.2` | `playbook.md:57-66` | Not acceptable. Conflict with Lilly-unilateral renewal |
| P-2 | 50% advance payment on signature | `WO-10:4.4` vs `MSA:3.3` | `playbook.md:78-89` | Not acceptable. Directly contradicts the MSA |
| P-3 | Confidentiality survival cut to 2 years | `WO-10:5.1` vs `MSA:4.2` (5 years) | `playbook.md:90-98` | Below the 3-year floor. **Governed: Covered** |
| P-4 | CGL insurance $1M | `WO-10:10.1` vs `MSA:14.1` ($2M) | `playbook.md:152-160` | Below minimum. **Governed: Covered** |
| P-5 | Cure period 90 days | `WO-10:11.1` vs `MSA:16.2` (30 days) | `playbook.md:170-178` | Exceeds the 60-day ceiling. **Governed: Covered** |
| P-6 | Liability cap "**lesser of** $1.5M or fees paid" | `WO-10:13.1` vs `MSA:18.1` ("greater of $5M") | `playbook.md:187-197` | Flagged on THREE independent grounds: below the $3M floor, wrong construct (lesser-of), and a silent downgrade of the MSA cap |
| P-7 | Governing law Texas | `WO-10:14.1` vs `MSA:26.1` (Indiana) | `playbook.md:224-232` | Not in the acceptable set |
| P-8 | Mandatory binding arbitration, litigation waived | `WO-10:14.2` vs `MSA:27.1` | `playbook.md:233-241` | Not acceptable. Route to the Contract Request and Consultation Tool |
| P-9 | SLA cut to 99.0% quarterly on "commercially reasonable efforts" | `WO-10:15.1` vs `EXHIBIT-B:1.1` (99.9% monthly) | Rule 5 / coverage | Degradation of a Covered category on three axes: threshold, measurement window, and effort standard |

---

## Part 5 — Data protection

| # | Planted | Where | Expected |
|---|---|---|---|
| D-1 | Breach notification **96 hours**, AND trigger shifted from "becoming aware" to "confirming the incident" | `WO-10:6.1` vs `MSA:9.2` and `SPS:6.1` (72) | Exceeds the 72-hour ceiling. **This is ALSO a HARD STOP**: `dpa-review-checklist.md:43` sits under a "Hard Stop If" column and line 48 restates it. The trigger shift is a second, separate weakening: a supplier can defer "confirmation" indefinitely, so the clock need never start. |
| D-2 | **TLS 1.0** | `WO-10:6.2` vs `SPS:5.1` (TLS 1.2+) | Below the encryption floor. `dpa-review-checklist.md:88` |
| D-3 | Sub-processor notice **10 days** | `WO-10:6.3` vs `SPS:4.2` (30 days) | Below the notice floor. `dpa-review-checklist.md:55` |
| D-4 | Supplier asserts **Controller** status over Usage Data | `WO-10:6.4` vs `SPS:1.1` | Supplier must be Processor only. `dpa-review-checklist.md:25` |
| D-5 | Secondary-use carve-out: service improvement, benchmarking, model development | `WO-10:6.4` vs `SPS:3.1-3.2` | Purpose-limitation breach. Escalate Legal AIPC |
| D-6 | **Free-text notes entered by Lilly personnel classified as Usage Data** | `WO-10:6.4` vs `EXHIBIT-A:4` | **Definition-tracing failure.** Exhibit A expressly excludes human-authored content from Usage Data. This is the "common failure" pattern at `definition-tracing-checklist.md:38-43`, and it is what reclassifies Lilly Information as Supplier-controlled telemetry |

D-6 is the second-most-important row in the fixture. It cannot be found by keyword match:
it requires tracing the defined term to `EXHIBIT-A:4` and comparing the WO's classification
against the definition's own exclusion. A run that flags D-4 and D-5 but misses D-6 has
found the symptom and missed the mechanism.

---

## Part 6 — Vendor tactics and structural

| # | Planted | Where | Rule |
|---|---|---|---|
| V-1 | Deliverables stated as "support implementation", "assist with... as needed", "advisory services", "on request", "ongoing" | `WO-10:1.1-1.2` | `vendor-tactics.md:32-49` Cat 2. No acceptance criteria, no completion definition, no dates. Violates `EXHIBIT-B:5.1`, which makes such deliverables not payable |
| V-2 | Responsibility shifted to Lilly: cleansed extracts, architecture documentation, 10 SME hours per week | `WO-10:2.1-2.3` | `vendor-tactics.md:100-118` Cat 5 |
| V-3 | Five-business-day contingency with re-baselining and chargeable delay costs | `WO-10:2.4` | `vendor-tactics.md:191-209` Cat 9 dependency inflation, plus the "re-baseline" phrase at Cat 3 |
| V-4 | "**Notwithstanding the Master Services Agreement**" preceding the liability cap | `WO-10:13.1` | `vendor-tactics.md:143-166` Cat 7. The phrase is the tell; the override is the harm |
| V-5 | Services commenced **13 July 2026**, signed **1 August 2026** | `WO-10` header | `vendor-tactics.md:233-249` Cat 11. Retroactive: 19 days of work performed before signature |
| S-1 | **Exhibit E (Data Migration Plan) is referenced and not provided** | `WO-10:1.2` D-4 | `contract-stack-map.md:95-103`. A missing incorporated document, and D-4's delivery term depends entirely on it |
| S-2 | **No SOC 2 report provided or referenced** | absent | Compliance Evidence Checklist. `SPS:9.2` requires it annually. Expected state: Awaiting |

---

## Part 7 — NEGATIVE CONTROLS. Raising any of these is a FALSE POSITIVE.

A fixture that only plants defects cannot detect over-flagging, and `SKILL.md` Rule 5 is
the most commonly violated rule in this skill. These rows are the other half of the test.

| # | The WO is silent on | Covered by | Expected |
|---|---|---|---|
| N-1 | Intellectual property assignment | `MSA:5.1` and `EXHIBIT-C:15` | **No finding.** Two independent assignment clauses already cover it |
| N-2 | Audit rights | `MSA:11.1-11.2` and `SPS:9.1` | **No finding** |
| N-3 | Data subject rights and deletion | `SPS:7.1-7.2` | **No finding** |
| N-4 | Return and destruction on termination | `SPS:10.1-10.3` | **No finding** |
| N-5 | Force majeure | `MSA:15.1-15.2` | **No finding.** The MSA already excludes payment obligations, labour disputes and financial difficulty |
| N-6 | Assignment and change of control | `MSA:20.1` | **No finding** |
| N-7 | International transfer / SCCs | `SPS:8.1-8.2` | **No finding.** `SPS:8.2` already handles the EEA-subject-with-US-processing case |
| N-8 | Adverse event reporting | `MSA:23` | **A LOW finding, in the Governed: Covered column. NOT a Hard Stop.** See Part 2 |

---

## Part 8 — Expected aggregate assertions

These are the machine-checkable summary figures. They are the fastest signal that something
moved.

| Assertion | Expected |
|---|---|
| Hard Stop count | **exactly 5** (HS-1, 2, 3, 5, 6) |
| HS-4 raised as a Hard Stop | **NO** |
| AE finding present at LOW / Governed: Covered | **YES** |
| Arithmetic findings | **at least 8** (A-1 through A-8) |
| Direction-agnostic arithmetic | A-2 present (the error favouring Lilly) |
| False positives from the negative-control list | **ZERO** |
| Protection Score band | **Critical (0-24)** |
| Protection Score has a visible calculation table | **YES**, per Rule 12 |
| `deduction_score()` Hard Stop deduction | **-15 each, 5 of them, -75 total, never reduced** |

The score lands in Critical because five Hard Stops alone deduct 75 points before any other
finding is counted. That is the correct answer for this contract and it is a useful property:
a run producing a Moderate or Low score on this fixture has a scoring defect that is visible
without reading a single finding.

---

## What this fixture does NOT prove

It proves that the checks planted here still fire. It does not prove that checks nobody
thought to plant still fire.

It is a regression net, not a completeness proof. Completeness is argued by
`_audit/F1-COVERAGE-MATRIX.md`; this fixture is what stops that argument decaying every
time someone edits the skill. Rows should be ADDED here whenever the matrix gains a check
worth defending.
