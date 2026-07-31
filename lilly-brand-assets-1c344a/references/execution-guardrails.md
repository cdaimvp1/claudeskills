**This file is a convenience copy.** The canonical text is the `## INLINED: references/execution-guardrails.md` section inside `lilly-brand-assets-1c344a/SKILL.md` — that is the copy every consuming skill's operative rule actually points at and the copy that has always been readable. If the two ever disagree, `SKILL.md`'s inlined section wins; update both together.

# Execution Guardrails (Suite-Wide, v8.2)

Shared enforcement module for all Lilly procurement skills. These guardrails prevent the most common failure mode: reading a skill's workflow and then collapsing it into a single shallow pass that produces plausible-looking but analytically thin output.

**These guardrails are structural, not advisory.** They create mandatory intermediate artifacts, tool prescriptions, and gate checks that make skipping analytical work impossible without visibly skipping a required step.

## G1: Tool Selection by Document Context (HARD RULE)

The wrong tool silently destroys input the skill depends on. Every skill that reads .docx files must follow these rules:

| Context | Required Tool | Prohibited Tool | Reason |
|---------|--------------|-----------------|--------|
| Any .docx in the contracting-and-negotiations pipeline (lilly-contract-review, legal-negotiation-prep, commercial-negotiation-prep, negotiation-playbook-learning, comment-cleanup), ALL modes, ALL rounds | `unpack.py` to extract XML; read `word/comments.xml` for comments, scan `word/document.xml` for `<w:ins>`, `<w:del>`, `<w:commentRangeStart>` elements | `extract-text` | There is no scenario in the contracting pipeline where `extract-text` is the better choice. `unpack.py` gives everything `extract-text` gives plus tracked changes, comments, and authorship. Supplier-returned documents in round 2+ have tracked changes. Order-form governing agreements may have tracked changes. The speed advantage of `extract-text` is exactly what causes analytical collapse. |
| .docx for content extraction only (executive summaries, spend data documents, RFP submissions, scope documents with no negotiation history) | `extract-text` is acceptable; `unpack.py` also acceptable | Neither prohibited | Content is the input, not change history. |
| .docx for comment inventory (comment-cleanup, post-review hygiene) | `unpack.py` to extract XML; read `word/comments.xml` directly | `extract-text` | Comment metadata (author, classification, threading) is not preserved by text extraction. |
| .pdf | Use the pdf-reading skill or `extract-text` | N/A | PDFs do not have tracked changes. |

**The test:** If the .docx is in the contracting-and-negotiations pipeline, use `unpack.py`. Always. The only .docx files where `extract-text` is acceptable are those outside the contracting pipeline (RFP submissions, spend reports, scope documents) where tracked changes are never analytically relevant.

## G2: Mandatory Gate Checks Between Phases

Every multi-phase workflow in the suite must produce intermediate artifacts at phase boundaries. A gate check is a list of items that must exist before the next phase begins. If an item is missing, STOP and complete it.

**Gate check format (insert at each phase boundary in the skill):**

```
GATE CHECK: [Phase N] complete before proceeding to [Phase N+1]
Confirm the following exist in your working notes:
- [ ] [Artifact 1 from Phase N]
- [ ] [Artifact 2 from Phase N]
- [ ] [Artifact 3 from Phase N]
If any box is unchecked, STOP. Complete the missing item before proceeding.
```

**The anti-collapse signal:** If you find yourself producing the final deliverable (the .docx, the dashboard, the briefing) without having produced the intermediate artifacts from each phase, you have collapsed the workflow. Stop, go back to the first phase you skipped, and produce the intermediate artifacts.

Gate checks are skill-specific and defined in each skill's workflow section. This module defines the principle; the skills define the checkpoints.

## G3: Existing Document Context Is Primary Input (Negotiation Documents)

For any document that contains existing tracked changes, comments, or multi-author history:

1. **Read the existing context FIRST.** Before adding any new analysis, inventory what is already in the document:
   - Count and classify all tracked changes by author (Lilly side / Supplier side / Unknown)
   - Count and classify all comments by author
   - Build the Party Map (who is on each side)
   - Determine the negotiation round (how many author/date clusters exist)

2. **Respond to the existing context BEFORE adding new findings.** The existing tracked changes and comments are positions from Lilly stakeholders and supplier contacts. Every existing item must receive a response (accept, reject, counter, build on, or note as settled) before the review adds new findings.

3. **The signal of skipping this step:** If the review output contains no references to existing comments or tracked changes, and the document had them, the primary analytical step was skipped.

## G4: Cross-Reference Tracing for Defined Terms

When a finding involves data rights, IP ownership, AI/ML training, confidentiality, or any concept that has a defined term in the governing agreement:

1. **Identify the relevant defined term(s).** Look up the exact definition in the governing agreement's Definitions section or exhibit.

2. **State which definition applies and why.** Example: "Call recordings are 'Lilly Information' per MSA A.1.19 (information Supplier receives from Lilly or gains access to through Lilly as a result of performance under the Agreement), NOT 'Usage Data' per A.1.37 (usage and operations data in connection with Customer's use of the Service). This distinction matters because MSA 9.1.4 authorizes Supplier to use Usage Data to improve its products, but does not authorize use of Lilly Information for that purpose."

3. **A finding that references a contractual concept without tracing it to the governing definition is incomplete.** "The AI training language raises concerns about Lilly data" is not a finding. "HITL/Supervised Training uses Lilly call recordings, which are Lilly Information (A.1.19), not Usage Data (A.1.37), to train Supplier A models; MSA 9.1.4 does not authorize this use" is a finding.

**When to apply:** Any finding where the conclusion depends on which contractual definition applies. If two reasonable people could disagree about which definition covers the data or activity in question, the tracing is mandatory.

## G5: Dashboard Data-Model-First (HARD RULE for Dashboard-Producing Skills)

Skills that produce interactive dashboards (.jsx artifacts) must build the complete data model as an intermediate artifact before writing any rendering code.

**Required sequence:**
1. Complete all analytical phases (findings, benchmarks, positions, coverage, etc.)
2. Assemble the full data object as a structured JavaScript object at the top of the .jsx file
3. Only then write the rendering components that consume the data object
4. The data object must be complete and self-contained: if you delete the rendering code, the data object alone should document the full analytical output

**The anti-collapse signal:** If you are writing JSX component code (tabs, tables, cards, charts) before the data object is complete, you are collapsing analysis into rendering. Stop, complete the data object, then render it.

**Data model minimum for dashboard-producing skills:**
- All findings with tier, section reference, evidence, action, and impact
- All benchmarks with source, date, and confidence flag
- All coverage/protection items with status and governing-document reference
- All negotiation positions with rationale, fallback, and acceptance history (where applicable)
- All SME escalations with contact, topic, urgency, and brief

## G6: Pre-Delivery Self-Test

Before producing the final deliverable, every skill must run its own delivery checklist. The checklist is skill-specific and defined in the skill's workflow. This module defines the principle.

**Minimum universal checks (all skills):**
- [ ] Every section/tab of the deliverable is populated (no blank sections without a labeled state explaining why)
- [ ] Every finding, position, or recommendation has a specific action and a reason
- [ ] Every external data point has a source citation and confidence flag
- [ ] Every cross-reference to a governing document cites a specific section number (not "the MSA covers this")
- [ ] The deliverable matches the skill's locked structure (no tabs dropped, no sections reordered)
- [ ] No em dashes anywhere in the output

**The anti-shallow check:** Read the executive summary or decision tab. Does it contain specific numbers, specific section references, and specific actions? Or does it read like it could apply to any contract? If the latter, the analysis was shallow.

## G7: Research Minimums (Skills That Perform Web Search)

Skills that include external research phases must meet minimum search thresholds before producing output. The threshold is skill-specific, but the principle is universal:

- **State the minimum.** Each research phase declares its search minimum (e.g., "minimum 3 broad searches" or "minimum 5 searches per top-5 vendor").
- **Track searches performed.** Maintain a research log: query, source, result count, usable results.
- **If minimums are not met, label the output.** "RESEARCH PENDING: [N] of [minimum] searches completed. Results may be incomplete."
- **Never present thin research as complete.** If you found one data point, say "single source, LOW confidence," not "market rate is $X."

**When the floor CANNOT be met because search is unavailable (H9).** The rules above cover
thin research. They did not cover the case where the sources simply are not reachable, and
no rule said what happens then, which left three bad options available by default: lower the
floor quietly, refuse the entire run, or produce the figure anyway.

None of those. The rule is:

1. **Produce the deliverable.** A run that cannot search still has the provided documents,
   the governing policy and the structural analysis. Refusing everything because one input
   is missing throws away work the user can use.
2. **Suppress the affected band, do not estimate it.** A percentile band, a market rate, a
   benchmark range: if the research floor behind it was not met, the band does not render.
   `percentile_gate()` in the vendored kernel already does exactly this for percentiles and
   is the precedent to follow, not a special case.
3. **Label the section as below the research floor**, stating the minimum and what was
   actually achieved: "below the research floor: 1 of 5 searches, external search
   unavailable this run."
4. **Never lower the floor silently.** Redefining "minimum 5" as "5 if convenient" turns a
   guardrail into a preference, and nothing in the output would show it happened.

**This is G13 rung 5 applied to a band rather than a fact.** The band abstains; the rest of
the deliverable proceeds at whatever rung its own sources support. A suppressed band with a
stated reason is more useful than an estimated one, because the reader knows to go and get
the number rather than trusting it.

**Skills with research phases:** supplier-landscape (has minimums), category-strategy (has minimums), market-rate-benchmarking (has minimums), commercial-negotiation-prep (add minimums), lilly-contract-review Order Form / governing-agreement benchmarking (add minimums).

## G8: Pass Artifact Enforcement (HARD RULE for Multi-Pass Skills)

Skills that run a multi-pass workflow must produce a named intermediate artifact at the end of each pass and confirm it exists before starting the next pass.

- Name the artifact for each pass (for example PASS_1_STRUCTURE, PASS_2_COVERAGE, PASS_3_ANALYSIS, PASS_4_PREP for contract review; the analogous per-pass artifacts for response-analysis, category-strategy, and supplier-landscape).
- Before starting pass N+1, confirm the pass N artifact exists in your working notes. If it does not, STOP and produce it first.
- **The anti-collapse signal:** if you are writing the final deliverable (dashboard, DOCX, deck) without having produced every named pass artifact, you collapsed the passes. Go back and produce the missing artifact, then continue.

## G9: Anti-Collapse Signal (HARD RULE)

If the output shows any of the skill-specific collapse patterns below, the analysis was shallow. Stop generating and re-run the missing analysis:

- A finding that asserts a gap ("no renewal protection," "no AE clause") without first checking whether the governing MSA or an exhibit already covers it.
- A data, AI, or IP finding stated without tracing the controlling defined term through the governing documents (see G4).
- A volume-based engagement with no per-unit economics calculated.
- A Protection Score that does not reference governing-document protections, or was produced without the combined-protection-weighted method defined in the inlined `risk-scoring.md` section below.
- A locked-structure dashboard that is missing a canonical tab or sub-tab, or position cards missing their required persona variants.
- Any deliverable whose executive summary reads as if it could apply to any contract, supplier, or category (no specific numbers, sections, or vendor names).

## G10: Chunked Artifact Assembly (HARD RULE for Large Single-File Deliverables)

Applies to any large single-file artifact: an interactive JSX/React dashboard, a self-contained HTML page, or any inlined file likely to exceed ~150 lines. These MUST be assembled across multiple writes, never emitted in one create_file call. A single oversized write can exceed the response length limit and truncate the file mid-stream, especially late in a long session when less headroom remains. This is a delivery-mechanics rule, separate from G5: G5 says assemble the full data model before rendering; G10 says write the file itself in pieces.

Procedure:

1. Write to the persisted outputs directory (`/mnt/user-data/outputs`), never to scratch. A truncated turn loses scratch work.
2. Scaffold first: create the file with imports, the empty top-level component shell, and the export. Confirm it wrote.
3. Append one section per write: the data object, then the shared components, then each tab, panel, or slide group. Keep every write small enough to finish on its own.
4. Before `present_files`, run a structural self-test: balanced braces and parentheses, no truncated trailing token, no em dashes, no literal escape sequences shown as text, and totals reconcile to the sum of their parts.

If a write does not visibly complete, re-issue that one section. Do not proceed past an incomplete write.

## G11: Kernel-Backed Computation (HARD RULE for Kernel-Consuming Skills)

Where a skill vendors a numeric/decision kernel (a Python module such as numeric_kernel.py, frap_chain_kernel.py or timeline_engine.py, shipped in THAT skill's own directory, not in this foundation), all arithmetic and lookups covered by that kernel MUST be computed by calling the kernel, never performed in prose or by model judgment.

- **The rule:** if a kernel function exists for a computation (a weighted score, an NPV, a percentile gate, an FRAP chain lookup, a critical-path calculation, an escalation threshold, or any other figure the kernel covers), that function is called and its return value is used verbatim. The model does not re-derive, sanity-check by re-computing, round differently, or "correct" the kernel's output through its own arithmetic.
- **A figure produced without the kernel is invalid.** If the kernel is missing, fails to import, or errors on the given input, the skill STOPS and reports the failure; it does not fall back to estimating the figure in prose. A plausible-looking number that did not come from calling the kernel is not a substitute and must not be presented as the computed result.
- **Scope:** this guardrail applies only to the specific skills that vendor a kernel (see each such skill's own HARD RULE kernel-wiring text for the exact function(s) and call sites). It does not require every skill in the suite to have a kernel; it requires that skills which do have one actually use it for everything the kernel covers.
- **The anti-collapse signal:** if the output contains a number that falls inside the kernel's covered scope but the working notes show no corresponding kernel call, the computation was collapsed into prose arithmetic. Stop, call the kernel, and replace the figure with its return value before continuing.

## G12: Claim-Gate, Cite or Abstain (HARD RULE, suite-wide)

Every CLAIM a skill emits is either cited or abstained. A claim is any assertion of fact, status, number, benchmark, score rationale, risk, or recommendation placed in a deliverable (dashboard, DOCX, deck, workbook, redline, or chat analysis). This consolidates the anti-fabrication rules already stated in GLOBAL OPERATING RULES 3 and 8 and the supplier-risk reference into one enforceable guardrail. It is an output-integrity discipline, not a computation: it adds no material token cost and requires no heavier model (a quick check still gets a light pass; a signing-stage deliverable gets the careful one).

- **CITED:** carries a specific, checkable source shown as a small evidence badge (not prose): a document plus section/page, a dated communication (email / Teams / call), a named dataset plus field, an accessed web source with URL plus capture date, or an explicit input the user supplied.
- **ABSTAINED:** if a claim cannot be cited, do NOT soften it into a vague generality and do NOT invent a plausible value. Emit an explicit gap marker: `[CONFIRM: exactly what is needed]` in prose or DOCX, or a labeled NEEDS_INPUT / NOT VERIFIED / RESEARCH PENDING / NOT APPLICABLE state in a dashboard (never a blanked or dropped section).
- **DROP, do not dilute:** a generated finding that cannot cite a source is dropped, not reworded into an unsupported observation.

Hard prohibitions:

1. **No fabricated "illustrative defaults."** Never fill a missing operational input with a made-up plausible value (a delivery-model split, a percentage, a sample supplier or rate) and disclose it afterward. Missing input means an abstain marker up front, never a guess.
2. **No premium or licensed-source leakage.** Never present a Gartner, Forrester, IDC, S&P Capital IQ, D&B, or Bloomberg finding as if it were queried unless it was actually accessed in this session. If it was not accessed, abstain. Canonical examples must not contain such results either.
3. **No unverified status assertions.** Never assert a debarment, sanctions, breach, financial-distress, or certification-held status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the named SME (the supplier-risk reference stays authoritative for the SME-routing specifics).

Confidence: when a claim is cited but the inference is soft, label it (a High / Moderate / Low band or an `Estimate` tag with the basis on hover or expand), never a bare "confidence: 73%."

**The anti-collapse signal:** if a deliverable contains a finding, number, status, or recommendation with no cited source and no abstain marker, the claim-gate was skipped. Stop, attach the citation, convert the claim to an abstain marker, or drop it.

## G13: The Source Ladder (HARD RULE, suite-wide)

**Every fact in every deliverable carries which rung it came from.** One ladder, five rungs,
same labels everywhere.

| # | Rung | Label it carries |
|---|---|---|
| 1 | **Live authoritative source**, read this run | cited, with the as-of date |
| 2 | **Vendored snapshot** of that source | snapshot, as-of date, and "verify against live" |
| 3 | **User-provided document** | user-supplied, with the document name and date |
| 4 | **General principle, not Lilly-verified** | labelled explicitly as such |
| 5 | **Abstain** | name the field AND the source that would resolve it |

**Rung 5 is an answer, not a failure.** "I could not establish this, and here is what would"
is a usable result. An invented rung-4 answer dressed as rung 1 is not.

**Why one ladder rather than each skill wording its own.** Three different ladders existed
before this guardrail: help-desk's "general principles, labeled not Lilly-verified",
process-navigator's retry-once-then-fallback, evaluation-engine's "if the foundation cannot
be read, follow the Rule 9 inlined summary". Each was individually sensible. Together they
meant a reader could not learn the convention once and trust it, which is the entire purpose
of a ladder. Thirty independently-worded ladders can disagree about what "degraded" means.

**Rules of use:**

1. **Never silently promote a rung.** A snapshot is not a live read; a general principle is
   not a Lilly position. Promoting a rung is the specific dishonesty this guardrail exists
   to prevent, because the reader's trust is calibrated to the label.
2. **Descend, and say you descended.** When rung 1 is unavailable, fall to rung 2 and label
   it rung 2. The descent itself is information: it tells the reader what the run could see.
3. **Mixed deliverables are normal.** Most real outputs carry facts from several rungs. Label
   per fact, not per document, so a rung-1 figure beside a rung-4 one is distinguishable.
4. **Do not lower the floor to avoid rung 5.** If the honest answer is abstain, abstain.
   Reaching for a weaker source to produce *something* is how a deliverable ends up
   confidently wrong.

**Interaction with G12.** G12 decides whether a claim may be made at all (cite or abstain).
G13 decides how a claim that IS made must be labelled. A cited claim still needs its rung: a
citation to a vendored snapshot and a citation to a live read are both "cited", and they are
not equally strong.

**Interaction with G7.** Where a research floor cannot be met because the sources it needs
are unavailable, see G7's own rule on suppression: the deliverable is produced with the
affected band suppressed and the section labelled as below the floor. The floor is never
lowered silently.

### G13a: Source-availability detection, the canonical step (H1)

**This is the step that decides which rung of G13 a run can reach.** It belongs here rather
than in each skill, for a reason found while canonicalising it: three skills
(`meeting-prep-brief`, `sole-source-challenge`, `workflow-map`) carry the short form
*"S0 / S1 / S2 / S3 / S4 / S5 as per the shared suite protocol"* while **no shared
definition existed anywhere in this foundation skill.** They pointed at something undefined,
which is the same dangling-pointer class as the brand-assets references B7 fixed. This
section is what those pointers now resolve to.

**S1, canonical text.** Before searching for or ingesting source documents (governing
contracts, prior strategies, spend extracts, supplier records, case files), ask ONCE how to
source them:

- **I'll provide them** (the user uploads or points to attachments)
- **Search M365 for them** (SharePoint / OneDrive / Outlook / Teams via the connector)
- **Both** (the user provides some AND you search)
- **No additional inputs** (proceed with what is already in context)

**Do NOT auto-search before asking.** The M365 connector can only see what lives in M365; it
CANNOT see Ariba, LEAH, an ERP/AP system or any other external system. Say that plainly
rather than letting a user believe an absent result means the data does not exist. **If M365
is not connected, proceed on provided and uploaded documents and label the gap** at the
appropriate G13 rung.

**When the user chooses "I'll provide them" or "Both": STOP and WAIT.** End the turn after
asking. Do not produce analysis in the same turn on assumptions.

**Detection feeds the ladder.** The answer to S1 determines the HIGHEST rung available to
this run, and every fact is then labelled at the rung it actually came from, never at the
best rung that was theoretically available. A run with the connector live can still contain
rung-4 facts, and must say so.

**Exemptions, recorded rather than assumed.** Skills that execute no task and ingest no
source documents do not run this step: `deal-tab`, `rfx-hub` (both build a dashboard
artifact from a supplied data object), `lilly-brand-assets` and
`lilly-procurement-kernels` (both are foundation content, not runnable skills). `rfx-hub`
is on this list because it was created after the original exemption list was written and
would otherwise read as an oversight.


### G13b: Per-fact provenance, the `$src` sidecar (H4)

G13 says every fact carries its rung. **G13b is the mechanism that makes that checkable.**

Provenance lives BESIDE the values, keyed by field, not inside them:

```json
"meta": { "s23": 214800000, "yoy2425": 15.2 },
"$src": {
  "s23":     [{"name":"ARIA S2P, PO Product pull","tier":1,
               "confidence":"Medium","asOf":"2026-06-01","stub":true}],
  "yoy2425": {"kind":"derived","by":"annual[] FY24-FY25 delta"}
}
```

**Two forms, because facts come in two kinds.**

| form | for | shape |
|---|---|---|
| sourced | a value read from somewhere | a LIST of `{name, tier, confidence, asOf, stub}` |
| derived | a value computed from other fields | `{kind:"derived", by:"<formula>"}` |

**A derived figure has no source and must not be given one.** A CAGR computed from three
spend figures is provenanced by its formula. Forcing a source onto it would fabricate
provenance inside the guardrail written to prevent fabrication. A fact claiming to be both
derived and sourced is refused: one of the two is untrue.

**Why a sidecar rather than wrapping each value.** Inlining `{value, source, as_of,
confidence}` was the original proposal. It breaks every consumer at once, since each reads
`meta.s23` as a number, and it cannot express a derived figure honestly. The sidecar keeps
values plain, supports SEVERAL sources per fact, and preserves two signals the flat shape
has no room for: `tier` (which maps onto G13's rungs) and `stub`.

**`stub: true` is legitimate and must never fail a build.** It marks illustrative or
placeholder data, honestly labelled. What is NOT legitimate is shipping a deliverable built
on stubs without saying so, which is why the validator reports them separately rather than
either ignoring or rejecting them.

**The sidecar's one weakness, and the rule that answers it.** Because provenance sits beside
the value, a field can be added and its `$src` entry forgotten. So: **every field carries
either a source list or a derived block. Silence is refused.** A field with no provenance is
not rung 5 (abstain); it is unlabelled, which is the state G13 exists to eliminate.

**Exempt fields are DECLARED by name, never inferred.** Identifiers, labels, free-text
commentary and dataset metadata are not claims about the world. A heuristic exemption would
quietly widen; a named list has to be edited on purpose, and the edit shows up in review.

### G13c: Citations must RESOLVE, not merely exist (H5)

G13b makes every fact carry a source. G13c asks the next question: **can a reader actually
follow it?**

| verdict | meaning |
|---|---|
| **OK** | names a URL, a document, or a recognised system or filing, and is inside its staleness window |
| **STALE** | followable, but captured longer ago than the window allows. The age is stated |
| **UNDATED** | followable, but carries no usable capture date |
| **UNRESOLVABLE** | names nothing a reader can reach |

**UNRESOLVABLE is the finding this exists to surface.** "Internal analysis", "industry
knowledge", "our experience": these read as citations and point at nothing. A citation
nobody can follow is worse than an abstention, because it stops the reader looking.

**It REPORTS rather than refuses.** Some deliverables legitimately rest on an internal
read. The right response is to LABEL that as G13 rung 4, not to fail the run. Refusing
would push authors toward dressing an internal read as an external source, which is worse
than the thing being prevented.

**Honest limit, stated rather than implied.** Offline, "resolve" cannot mean fetching the
URL. This proves a citation is well-formed enough for a human to follow and current enough
to trust. It cannot prove the source says what the citing text claims. Anything stronger
would be the fabrication these guardrails exist to prevent.

Run against the shipped category seed it checked 110 citations: 100 OK, **10 UNRESOLVABLE**
("Benchmark & savings model, reflect-only estimate" names no followable source).

Reference implementation: the shared `provenance` validator (29 assertions), vendored into
each consuming skill alongside `numeric_kernel` and run there by that skill's own provenance
check. `category-strategy` is the wired example. Paths are deliberately not given here: an
installed skill has no sibling directory to reach across.
