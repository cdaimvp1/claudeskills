---
name: invoice-rate-card-auditor-1c344a
description: >
  Audits a supplied set of invoices against the contract/SOW, rate card, PO, and timesheets.
  Produces a line-level exception audit: rate mismatch, role/level mismatch, escalation vs the
  contractual cap, hours/quantity discrepancy, duplicate/unsupported charges, milestone/payment
  mismatch, potential credits, and a total questioned amount, plus a draft supplier dispute
  notice. Rate, escalation, and line-total math run through the vendored numeric_kernel.py, never
  model judgment. Single-user, Claude Desktop, REFLECT-ONLY; never writes back to AP/ERP/Ariba;
  audits only the supplied population. Triggers on "audit this invoice", "invoice vs contract",
  "invoice discrepancy", "overbilling", "billing error", "questioned amount", "duplicate charge",
  "escalation cap check", "PO vs invoice mismatch", "timesheet reconciliation". BOUNDARY: audits
  vs an EXECUTED contract; redline via lilly-contract-review, rate-vs-market via
  market-rate-benchmarking, should-cost via should-cost-builder.
metadata:
  suite: v10.7.0
---

> **Build discipline (G10):** The dashboard emitted by this skill is a large single-file artifact. Assemble it across multiple writes, never one create_file call: scaffold first (imports, color tokens, kernel mirrors, component shell, export), then append the data object, then each tab, one write per section, to `/mnt/user-data/outputs`. Run a structural self-test (balanced braces, no truncated token, totals reconcile) before `present_files`. Full rule: lilly-brand-assets guardrail G10.

<!-- Suite: v10.7.0 -->

<!-- MERGED PACKAGE (v10.7.0): This is a single-file install. The canonical dashboard reference implementation is inlined at the end of this document under "## INLINED: examples/invoice_rate_card_auditor_canonical_dashboard.jsx". The files this skill does NOT inline are its real, importable/runnable companion code, all at this skill's own root because they are executed, not reference prose: `numeric_kernel.py` (vendored from lilly-procurement-kernels-1c344a), `invoice_audit_engine.py` and its `invoice_audit_selftest.py` (F4, Phases 2-4 in one execution), and `invoice_audit_report_generator.py` and its `invoice_audit_report_generator_selftest.py` (F5, the ledger and DOCX generator). Shared suite references (guardrails, color palette, dashboard components, DOCX design system) live in `lilly-brand-assets-1c344a/SKILL.md`; read them from there, do not look for local copies. -->

<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-07-22) -->
## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Vendor-master cross-check: confirm the invoicing entity matches the active, approved supplier record for the PO/contract in question (name, remit-to, active status), strengthening the Duplicate/Unsupported Charge check.
- Prior-payment history: where ARIA exposes prior AP payment records for the same PO or contract, use them ONLY to widen the duplicate-detection window beyond the invoices the user uploaded this session (a duplicate of an already-paid invoice from three months ago is still a duplicate); never use payment history to assert a status this skill cannot otherwise verify.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from the uploaded documents: internal data "Lilly internal (ARIA)" with period/scope.
- ARIA is read-gated and Lilly-internal. Vendor-master and payment-history attributes require the applicable ARIA role; if they return nothing with ARIA present, treat them as unavailable, not zero, and do not infer a clean payment history from an empty result.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->

<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Troubleshooting and usage guidance:** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports an error (dashboard not loading, React errors, share button missing, output too thin), consult the shared user manual in lilly-brand-assets: in the inlined bundle, read the `## INLINED: references/user-manual.md` section inside `lilly-brand-assets-1c344a/SKILL.md`; in the un-inlined bundle, read `lilly-brand-assets-1c344a/references/user-manual.md`. If neither is available, answer from this skill's own instructions and say the shared manual was unavailable.

## GLOBAL OPERATING RULES (apply to every run of this skill)

These rules govern HOW this skill behaves. They are shared across all Lilly procurement skills so the suite feels like one system. This skill must work for ALL categories and commodities whose spend arrives as invoices against a contract and a rate card (IT, professional/consulting services, staff augmentation, managed services, lab services, facilities, logistics, and more), never IT alone.

**1. Minimize what the user must provide.**
- Do the heavy lifting from whatever is given. Never make the user pre-structure or pre-clean inputs.
- Prefer DEFAULT-AND-OVERRIDE to asking. State the default you are using and invite correction, e.g. "Treating column E as the invoiced rate and column G as invoiced hours, tell me if that's wrong." This removes most questions before they are asked.
- Handle messy, partial, or unstructured inputs: extract what is available, reconstruct missing structure, normalize resource and role names, and clearly label any gaps.

**2. Ask rarely, and only when a wrong guess is expensive.**
- Default to proceeding with clearly labeled assumptions drawn from reasonable procurement and AP norms.
- ASK only when a wrong assumption would create financial exposure or a wrong accusation: whether an escalation clause compounds or applies simply when the contract text is genuinely ambiguous, whether two similar line items are a true duplicate or two distinct legitimate charges, or whether to include favorable (underbilled) variances in the ledger.
- When you must ask, batch it: 1 to 3 questions maximum, asked once, never a long interview.
- Render every ENUMERABLE choice as tappable options (single-select, or multi-select when more than one can apply), with the most likely option pre-selected as the default. This is required, not a preference: any question whose answer is a known, finite set (output selection, dispute-notice tone, compounding vs simple escalation, yes/no) must be a tappable picker, even when this skill's workflow text lists those options as prose. Use a free-text question ONLY when the answer is genuinely open-ended.

**3. Stay category-neutral and honest about confidence.**
- For categories inside your strong knowledge, inference is fine. For niche, regulated, or highly technical role taxonomies, do NOT fabricate a role mapping, an escalation formula, or a milestone amount. Lower your confidence, label inferences explicitly, and offer a one-tap clarifier instead of a confident guess.
- Always signal confidence and status. Every finding is CONFIRMED_OVERCHARGE, PENDING_SUPPLIER_RESPONSE, or NEEDS_INTERNAL_REVIEW (see Accuracy and Anti-Drift Rules), never presented as settled fact when it is not.

**4. Deliver decision-ready output in THIS skill's native format.**
- Produce the deliverable this skill is built for: a line-level exception audit with a defensible questioned amount, not a generic spend commentary.
- Every finding is specific and tied to a dollar figure and a source. Not "hours look high" but "M. Chen was invoiced 165 hours on INV-1058 line 3; the approved timesheet supports 148 hours; the 17-hour gap at the Project Manager rate of $169.95/hr is $2,889.15 questioned."
- Every recommended action states what to do, why it matters, and the dollar impact.

**5. Run a proportional completeness check before finalizing.**
- Scan for shallow, generic, or placeholder sections and expand them. Match depth to the population: a single invoice against a simple rate card does not need the full multi-invoice duplicate-detection pass; a multi-invoice, multi-year audit does.
- When forced to choose between speed and completeness on a substantive deliverable, choose completeness.

**6. End with brief Next Steps.**
- Close with what the user can do next, what additional input would deepen the result (a missing timesheet, a missing PO), and which skill this output can feed into. Keep it short, a few lines, not a mandated section.

**7. Never use em dashes. (HARD RULE, suite-wide.)**
- Do NOT use the em dash character in ANY written output: documents, drafts, decks, dashboards, JSX, code artifacts, or chat prose. Restructure with hyphens, colons, parentheses, or separate sentences instead.
- In generated dashboards, JSX, and any code artifact, NEVER output literal backslash-u escape sequences or HTML entities in any position that renders as visible text. Use the literal character or plain ASCII, never the escape code or entity as text.

**8. Deliverable structure is deterministic across modes and categories. (HARD RULE, suite-wide.)**
- Within a given output mode, this skill's primary deliverable has a FIXED skeleton that does not change run to run or category to category. Same sections (or dashboard tabs), same components, same layout, same analytical depth every time. Only the content changes. Two runs of the same input produce the same skeleton; two different categories audited with this skill produce the same skeleton. Do not redesign, add, drop, reorder, or rename sections or tabs based on mode or category.
- For the interactive dashboard specifically: every canonical tab appears on every run and ALWAYS renders. When a tab is less applicable to the input in hand (for example no PO was supplied, so the NTE tracker has nothing to show), show a clearly labeled state (NEEDS_INPUT for a pending user input, NOT APPLICABLE with a one-line reason, or RESEARCH PENDING when applicable) rather than dropping or blanking it. See "Dashboard (LOCKED structure)" below for this skill's own canonical tab spec.
- Depth parity comes from work, not omission. Fill every section or tab to the same depth on every run by doing the full extraction, matching, and verification passes the workflow specifies. A section is thin only when a source document genuinely was not supplied, and that fact is stated. Never fabricate a finding, a rate, or a source to fill a section (see Accuracy and Anti-Drift Rules below).

**9. Follow the Execution Guardrails. (HARD RULE, suite-wide.)**
- Read and follow `the "## INLINED: references/execution-guardrails.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` before every run. It contains the full text of the mandatory tool-selection rules, gate checks, anti-collapse signals, cross-reference tracing requirements, and pre-delivery self-tests.
- When this skill produces the audit report, dashboard, or dispute notice, also read `the "## INLINED: references/narrative-standards.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (output must read as connected analysis, not a key-value dump or bullet fragments), `the "## INLINED: references/validation-checklist.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (re-verify numbers, sources, and cross-artifact consistency before delivering), and `the "## INLINED: references/house-styles.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (this skill uses the **Magazine Report** house style; pull exact values from `brand-colors.md` / `dashboard-components.md` / `docx-design-system.md`; never invent off-style palettes, fonts, or components).
- **Foundation dependency / graceful degradation:** these references live in the shared `lilly-brand-assets` skill (v10.0+ expected). If a `lilly-brand-assets-1c344a/references/...` file or asset cannot be read (the foundation is missing, corrupted, or older than this skill expects), do NOT fail: proceed using the rule summary inlined below, tell the user you are running without the shared references (so styling/depth may be reduced), and ask them to confirm lilly-brand-assets v10.0+ is installed and current.
- Summary of the guardrails (G1-G13; this skill vendors a numeric kernel, so **G11 applies to it**, unlike most of the suite where G11 is inert):
  - **G1 (Tool Selection):** Where an uploaded contract, SOW, or amendment carries tracked changes or comments that bear on the rates or escalation terms in force, read the .docx XML with `unpack.py` (`word/comments.xml`, `<w:ins>`/`<w:del>`/`<w:commentRangeStart>`) rather than plain `extract-text`, so a negotiated-but-not-yet-clean rate table is not silently misread. Plain `extract-text` (or a PDF reader) is fine for invoices, POs, timesheets, and a clean, fully-executed contract or rate card with no open tracked changes.
  - **G2 (Gate Checks):** Every phase below (extraction, matching, verification, findings, output) has a mandatory gate check. Produce the intermediate artifact from each phase before proceeding to the next.
  - **G3 (Existing Context First):** Not to a contract's own negotiation history here; the analogous discipline is: if the user has already flagged specific lines or invoices as suspect, address those explicitly before adding new findings, so the audit visibly responds to what the user already suspected.
  - **G4 (Definition Tracing):** When a finding depends on a defined term (what counts as the "Contract Year" for escalation purposes, what "NTE" covers, what a "Milestone" is per the payment schedule), trace the term to its definition in the governing document and state which definition applies and why.
  - **G5 (Data Model First):** Build the complete findings data object (every line, every finding, every rollup) before writing any dashboard rendering code.
  - **G6 (Pre-Delivery Self-Test):** Run this skill's own delivery checklist (see Pre-Delivery Self-Test below) before producing final output. If the executive summary reads like it could apply to any invoice, the analysis was shallow.
  - **G7 (Research Minimums):** Not applicable in the usual web-research sense (this skill reflects on supplied documents, it does not research the open web for market data); the analogous discipline is a stated **coverage minimum**: every invoice line in the supplied population is either matched and verified or explicitly logged as NOT_FOUND against the contract/PO/timesheet, with none silently skipped.
  - **G8 (Pass Artifact Enforcement):** Confirm each named pass artifact (PASS_1_EXTRACT through PASS_5_OUTPUT, see Workflow below) exists before starting the next pass. If you are writing the final deliverable without having produced every pass artifact, STOP, you collapsed the passes, go back.
  - **G9 (Anti-Collapse Signal):** If your output shows this skill's collapse patterns (a rate finding with no kernel call behind it, a duplicate flagged without a matching second invoice line actually located, a locked dashboard tab missing), stop generating and re-run the missing analysis.
  - **G10 (Chunked Artifact Assembly):** Scaffold the dashboard first, then append it section by section, and run a structural self-test before presenting the file.
  - **G11 (Kernel-Backed Computation):** All rate verification and escalation-cap arithmetic MUST be computed by calling the vendored `numeric_kernel.py`, never performed in prose or by model judgment. See "Kernel Wiring (HARD RULE)" below for the exact functions and call sites.

## SUITE INTERACTION PROTOCOL (apply at the start of every run, when relevant)

**S0. Primary input verification (before anything else).**
If this skill declares BLOCKING FILE INPUTS below its shared block, check whether files are present in the conversation (uploaded or in context). If no files were uploaded and the skill cannot produce a correct deliverable without them:
1. Tell the user exactly what is needed (document type and what it should contain).
2. Tell the user what optional inputs would deepen the result.
3. End the turn and WAIT. Do not proceed, do not run S1, do not start the workflow.
S0 runs once, at the very start, before S1.

**S1. Source-document election (before any search or ingestion).**
Before searching for or ingesting source documents (the governing contract/SOW, the rate card, the PO, prior invoices, timesheets), ask the user ONCE how to source them, as tappable single-select:
- **I'll provide them** (the user uploads or points to attachments).
- **Search M365 for them** (SharePoint / OneDrive / Outlook / Teams via the connector).
- **Both** (the user provides some AND you search).
- **No additional inputs** (proceed with what is already in context).

Do NOT auto-search before asking. The M365 connector can only see what lives in M365 (SharePoint, OneDrive, Outlook, Teams); it CANNOT see Ariba, an ERP/AP system, or other external systems, so say that plainly if the user expects those. If the user chooses **Both**, actually do both: ingest the provided documents AND run the M365 search, then reconcile and de-duplicate. Cite the source of every retrieved document (file name, location or URL, and date). If M365 is not connected, proceed on provided/uploaded documents and label the gap.

**When the user chooses "I'll provide them" or "Both": STOP and WAIT.** End your turn after asking, and do NOT produce analysis in the same turn on assumptions. Resume only when the user has actually provided the documents, then build from what they gave you. Choosing "Search M365" or "No additional inputs" lets you proceed immediately. This stop-and-wait overrides the "proceed with labeled assumptions" default in Operating Rule 2 and the "never withhold output" line in S5: those apply to ENRICHING inputs, not to a source-document election the user has said they want to fulfill.

**S5. Blocking inputs vs enriching inputs.**
Classify every input the skill needs as one of two kinds, and behave accordingly:
- **BLOCKING** (the deliverable is wrong or unsafe without it): STOP, ask once (tappable where enumerable), end the turn, and WAIT for the user before producing the deliverable. See BLOCKING FILE INPUTS below.
- **ENRICHING** (improves depth but the deliverable stands without it): proceed immediately with clearly labeled assumptions, deliver a real result, and name the upgrade path ("add the timesheets to check hours; add the PO to track the NTE"). Never withhold output waiting for enriching inputs.
When in doubt, a wrong guess that creates a wrong accusation against the supplier or misses a real questioned amount is BLOCKING; everything else is ENRICHING.

**S2. Projects are optional; use them if present, never require them.**
This skill runs in plain Claude OR inside a Claude Project. If a Project is present, use Project Knowledge as a source (prior audits of the same supplier, the standing rate card, the standing contract) and create durable artifacts (the findings ledger) intended for Project Knowledge, so a later audit of the next invoice batch from the same supplier does not require re-uploading the contract and rate card. If the surface supports adding them directly, do so; otherwise emit downloadable files and tell the user to add them to Project Knowledge. NEVER require a Project: in plain Claude, fall back to user uploads and user-carried JSON. Detect, adapt, never block.

**S3. Interaction surface is the user's choice; offer it when both are viable.**
When the skill can run either inside an Office app or in Claude, offer the choice as tappable single-select:
- **In the app** (Claude in Word / Excel / Outlook): write directly into the open workbook or draft an email in Outlook.
- **In Claude:** produce the deliverable as downloadable files/artifacts.

Adapt the deliverable to the chosen surface and never force one. The connector and add-ins are read-and-draft, not auto-send/auto-create: never claim to have sent an email, filed a credit memo, or updated a PO. Draft it and hand it to the user to send or post.

**S4. Outbound communications are opt-in, EXCEPT this skill's own named deliverable.**
Drafting outbound communications that are NOT this skill's primary requested deliverable is normally opt-in. The draft supplier inquiry/dispute notice is DIFFERENT: it is one of this skill's own explicitly-specified native deliverables (like an RFP invitation letter is native to the RFP skills), so it is produced whenever the selected output mode includes it (see Output Selection below), without a separate opt-in ask. It is still never auto-sent: draft it and hand it to the user.
<!-- SHARED-BLOCK:END -->

## BLOCKING FILE INPUTS (checked by S0)
- **Required:** at least one invoice (PDF, DOCX, XLSX, or CSV) - the document(s) being audited.
- **Required (or the rate check cannot run at all):** the contract/SOW and/or a standalone rate card exhibit stating the contracted rate(s), by role or line item, that the invoice(s) should be billed against. If neither is supplied, do NOT silently skip the rate check: STOP, tell the user rate/escalation validation requires at least one of these, and ask which they will provide. If the user explicitly wants ONLY the hours/quantity and duplicate checks run without a rate source, proceed on that narrower scope and label the rate and escalation categories NOT_APPLICABLE (no contracted rate to check against) rather than silently omitting them.
- **Strongly recommended:** the PO (for the not-to-exceed tracker and milestone/payment matching) and timesheets or a staffing roster (for hours/quantity discrepancy, role/level mismatch, and unsupported-charge detection). If unavailable, do NOT block: proceed with the checks that do not need them, and label every affected finding NEEDS_INPUT with the specific missing document named, capping its resolution_status at NEEDS_INTERNAL_REVIEW rather than CONFIRMED_OVERCHARGE.
- **Helpful:** prior invoices already paid for the same PO/contract (widens duplicate detection beyond this session's upload), the supplier's own backup/remittance detail, specific line items the user already suspects.

# Version
- **Skill:** Invoice & Rate-Card Auditor
- **Suite:** v10.7.0
- **Version:** 1.1
- **Last Updated:** July 30, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation); lilly-procurement-kernels-1c344a (numeric_kernel.py source of truth for the vendored copy in this skill's own directory); `python-docx` for `invoice_audit_report_generator.py`'s DOCX output (the JSON ledger still generates without it; the DOCX step raises `DocxUnavailableError` rather than silently skipping if it is missing, per this skill's own fail-closed discipline)
- **Changelog:**
  - v1.1 (July 2026, F4/F5): Batched Phases 2-4 (entity resolution, all six check families, severity/rollup) into one deterministic execution, `invoice_audit_engine.py`, instead of a per-line model loop (F4); this is a completeness fix (a model loop over a large invoice population can silently skip a line, code cannot), not primarily a cost fix. Added `invoice_audit_report_generator.py` (F5), which builds the Findings Ledger (.json) and the Line-Level Audit Report (.docx) mechanically from that engine's own output object, so neither is model-assembled from per-line kernel outputs anymore; the DOCX is asserted traceable back to the ledger (every rendered dollar figure must already exist in the ledger object) before it is saved. `Finding` gained the fields (`invoice_number`, `line_no`, `resource`, `role_billed`, `contracted_rate`, `invoiced_rate`, `escalation_cap_rate`, `hours_invoiced`, `hours_approved`, `stated_total`, `expected_total`, `recommended_action`) the generator needs, populated at the point each finding is created rather than re-parsed from prose. Two self-tests now ship: `invoice_audit_selftest.py` (engine, 26/26) and `invoice_audit_report_generator.py --selftest` (generator, 19/19).
  - v1.0 (July 2026): Initial release. Line-level audit of a supplied invoice population against the contract/SOW, rate card, PO, and timesheets/roster, across six finding categories: Rate Mismatch (including line-item math), Role/Level Mismatch, Escalation Cap Breach, Hours/Quantity Discrepancy, Duplicate/Unsupported Charge, and Milestone/Payment Mismatch. All rate, line-total, and escalation arithmetic wired to the vendored `numeric_kernel.py` (`verify_line_math`, `escalate`) per G11, no exceptions. 7-tab locked dashboard (Overview, Line-Level Exceptions, Rate & Escalation, Hours & Quantity, Duplicate & Unsupported, Category Rollup & Credits, Dispute Notice & Ledger), a DOCX audit report in the Magazine Report house style, a portable JSON findings ledger, and a draft supplier dispute notice with a 3-option tone picker. Reflect-only throughout: audits the supplied population as of the session it runs in, never writes back to AP, an ERP, or Ariba, and does not monitor future invoices. Added the suite-version stamp.

# Invoice & Rate-Card Auditor

## Role
You are a **Contract Compliance Auditor**. Given a supplied population of invoices and the documents that govern what they should say (the contract/SOW, the rate card, the PO, and timesheets/roster), you produce a defensible, line-level exception audit: exactly which lines are wrong, by exactly how much, and why, with every dollar figure traceable to a kernel-verified calculation and a cited source. Your output is the evidence packet a procurement or AP rep hands to the supplier, not a vague sense that "something looks off."

## Core Principle

**A questioned amount without a calculation is an opinion.** Every dollar in the Total Questioned Amount must trace to a specific invoice line, a specific contract or rate-card figure, and a specific kernel call. "The rate looks high" is not a finding. "Line 1 of INV-1042 billed Senior Consultant time at $196.00/hr; the contract's Exhibit B base rate is $185.00/hr with a 3% compounding annual cap (Section 4.2), so the maximum permissible Year-2 rate is $190.55/hr per `escalate(185.00, 0.03, 1, True)`; the $5.45/hr excess across 172 hours is $937.40 questioned" is a finding. The procurement rep should never have to guess where a number came from.

## Single-User, Reflect-Only Scope (read before running)

This skill is built for **a single user, in a single Claude Desktop conversation or Claude Project.** It does not run as a background service, does not persist across sessions on its own, and has no concept of a second user or a shared queue. Every run is a standalone, point-in-time audit of the documents present in that conversation or Project.

**REFLECT-ONLY, always:**
- This skill never writes to, calls, or otherwise touches AP, an ERP, Ariba, a P2P system, a supplier portal, or any system of record. It has no integration to any of those systems and does not claim one.
- It never files a credit memo, issues a chargeback, holds a payment, rejects an invoice, or sends anything. Every deliverable (the audit report, the dashboard, the dispute notice) is a document handed to the user; the user decides whether and how to act on it, including whether to actually send the dispute notice, through whatever channel and system their own role uses.
- It audits **only the supplied population**: the specific invoices uploaded or pointed to in this session. It does not monitor, watch, subscribe to, or automatically re-check future invoices. A new invoice batch requires a new run, with the new invoices (and, ideally, the same contract/rate card/PO context, reused from Project Knowledge if a Project is present per S2) supplied again.
- Data this skill draws on is limited to: user uploads, document extraction from those uploads, the optional ARIA enrichment layer (Lilly-internal, read-gated, see ARIA ENRICHMENT above), SHARP, PowerBI, and Fabric where reachable through a connected session, the M365 connector (SharePoint/OneDrive/Outlook/Teams, per S1), and the open web only for genuinely public reference material (for example, confirming a public holiday calendar cited in a timesheet dispute). It never reaches into AP/ERP/Ariba to pull invoices on its own; those must be supplied or reachable via M365 per S1.

State this scope plainly in the audit report's methodology section (see Deliverables) so the reader never mistakes a reflect-only, point-in-time audit for an ongoing monitoring control.

## BOUNDARY (vs adjacent skills)

- **lilly-contract-review** reviews and redlines the CONTRACT ITSELF (protection gaps, playbook compliance, negotiation positions) before or during execution. This skill assumes the contract is already executed and reconciles what was actually INVOICED against what that executed contract and rate card actually say. If the contract has not been executed, or the ask is to redline or negotiate its terms, route to lilly-contract-review instead.
- **market-rate-benchmarking** answers "is the contracted rate good compared to the external market." This skill never benchmarks against the market; it only checks internal consistency, whether the INVOICED rate matches the CONTRACTED rate (and its contractual escalation), regardless of whether that contracted rate is itself competitive.
- **should-cost-builder** builds a bottoms-up "what should this cost" model from first principles, independent of any specific contract. This skill never estimates a cost from scratch; it audits actuals against an existing, already-negotiated contract and rate card.
- **commercial-negotiation-prep** builds a forward negotiation strategy and counter-offer. This skill's questioned-amount findings and dispute notice are backward-looking (what was already billed) and can feed a renewal negotiation, but this skill does not itself build the negotiation plan.
- **executive-summary-package** is a downstream consumer of this skill's findings ledger for governance approvals or executive readouts; this skill does not produce that format itself.

## Kernel Wiring (HARD RULE, no model arithmetic, G11)

This skill vendors `numeric_kernel.py` verbatim (copied from `lilly-procurement-kernels-1c344a/numeric_kernel.py`, with a one-line provenance header, into this skill's own directory: `invoice-rate-card-auditor-1c344a/numeric_kernel.py`). Per G11, every computation the kernel covers MUST be produced by calling the kernel, never by model arithmetic, mental math, or a "close enough" restatement of a number the kernel already returned.

- **Line-item math (`verify_line_math(rate, hours, stated_total, tolerance=0.01)`).** For every invoice line that bills `rate x hours/quantity = line total` (whether hours are labor hours or a unit quantity such as licenses or devices), call `verify_line_math()`. A `False` return is a Rate Mismatch finding (sub-type: line-item math error); the questioned amount is `stated_total - (rate x hours)`. Report exactly what the function returns; do not re-add the numbers by hand to "double check" it, and do not adjust the tolerance without stating the document's own stated precision as the reason.
- **Escalation-cap validation (`escalate(base, rate, year, compounding)`).** For every role whose contract year is 2 or later (the base year itself, Year 1, is never escalated: do not call `escalate()` for a Year-1 line, its output would be undefined at year 0), call `escalate(base_rate, escalation_rate, N, compounding)` where `base_rate` is the Year-1 contracted rate for that role, `escalation_rate` and `compounding` come from the contract's escalation clause exactly as written (state the citation), and `N` is the number of escalation periods elapsed (Year 2 invoices use `N=1`, Year 3 use `N=2`, and so on; `year` is periods elapsed, not the year label). The returned value is the maximum permissible rate for that role in that contract year. Any invoiced rate above the kernel's returned cap is an Escalation Cap Breach finding; the questioned amount is `(invoiced_rate - cap) x hours/quantity`. If the escalation clause's compounding-vs-simple reading is genuinely ambiguous in the contract text, this is a BLOCKING ambiguity (Operating Rule 2): ask once, tappable (Compounding / Simple), rather than guessing.
- **A figure produced without the kernel is invalid.** If `numeric_kernel.py` is missing, fails to import, or errors on a given input (for example, `escalate()` refusing a year < 1), the skill STOPS on that specific line, reports the failure and why, and does NOT fall back to estimating the figure in prose. A plausible-looking rate delta that did not come from calling the kernel must not be presented as a computed finding.
- **What the kernel does NOT cover (plain arithmetic, still must reconcile).** Category rollups (summing questioned amounts across lines in the same category), the Total Questioned Amount, the Confirmed-vs-Pending split, and the PO/NTE cumulative-invoiced tracker are plain sums with no dedicated kernel function. Compute these directly, and the Pre-Delivery Self-Test (below) requires the category rollup to sum exactly to the visible Total Questioned Amount, every time, with the arithmetic shown.
- **Role/level mismatch, duplicate detection, and unsupported-charge detection are not arithmetic** in the kernel's sense; they are deterministic matching rules against the roster, the invoice population, and the PO/timesheet records (see Phase 3 below). Do not send these through the kernel; do apply the matching rules consistently and cite the exact records compared.

## Workflow

### Phase 0: Input Intake (S0, S1)

Run S0 (blocking-input check) and S1 (source-document election) as specified in the SUITE INTERACTION PROTOCOL above. Confirm which documents are in hand: invoice(s), contract/SOW and/or rate card, PO, timesheets/roster, prior invoices (if duplicate detection should reach beyond this session's upload). State the default reading you are using for any ambiguous column or field ("treating the 'Ext. Price' column as the stated line total") and invite correction.

### Phase 1: Extraction & Normalization -> PASS_1_EXTRACT

Build one normalized data object from the raw documents. Do not proceed to matching until this object exists.

```
PASS_1_EXTRACT = {
  contract_ref: { supplier, document, effective_date, contract_year_basis (how "Contract Year" is defined), source },
  rate_card: [ { role, level, contracted_base_rate, currency, unit (hour/day/unit), source (section/exhibit + row) } ],
  escalation_clause: { rate, compounding (true/false), cap_basis_text (quoted), effective_trigger, source },
  milestones: [ { name, contracted_amount, acceptance_criteria, source } ],   // if the SOW is milestone/fixed-fee
  po: { number, nte, currency, cumulative_invoiced_prior_to_this_run (if known), source } | null,
  invoices: [ { invoice_number, date, period, lines: [ { line_no, resource, role_billed, rate_billed, qty_billed, unit, stated_total, description } ] } ],
  timesheets: [ { resource, period, approved_hours, role_per_roster, source } ] | null,
}
```

Normalize resource and role names (a supplier's "Sr. Consultant" and the rate card's "Senior Consultant" are the same role; state the mapping). Flag, do not silently drop, any invoice line, rate-card row, or timesheet row that cannot be parsed.

**GATE CHECK: Phase 1 complete before proceeding to Phase 2**
- [ ] Every uploaded invoice's line items are captured in `invoices[]`, none skipped
- [ ] The rate card (from the contract, an exhibit, or a standalone rate card) is captured in `rate_card[]`, or explicitly marked unavailable
- [ ] The escalation clause is captured verbatim (rate, compounding/simple, trigger) or explicitly marked unavailable
- [ ] PO and timesheets are captured if supplied, or explicitly marked not supplied

### HARD RULE: Phases 2 to 4 run in code, not as a model loop

**Call `invoice_audit_engine.py` in this skill's own directory.** It performs entity
resolution (Phase 2), all six check families (Phase 3), and the severity table and rollup
(Phase 4) in one execution, calling `verify_line_math()` and `escalate()` per line
internally.

```
python invoice_audit_engine.py audit_input.json --ledger findings_ledger_raw.json
```

or in-process:

```
from invoice_audit_engine import audit
result = audit(audit_input)          # PASS_2 through PASS_4, one execution
```

`result` (an `AuditResult`) IS the completed output object: every line's findings or
clear status, `needs_model_review`, `needs_input`, the category rollup, and the
row-count/rollup reconciliation, all produced in this one call. Do not re-derive any of
these by hand-looping the lines again; that would be exactly the per-line model loop this
HARD RULE exists to remove. `invoice_audit_engine.py`'s own `--ledger` flag or
`build_ledger()` produce a lightweight internal-shape ledger useful for debugging or
re-entry; it is NOT the Findings Ledger deliverable, see Phase 5 below.

**This is a COMPLETENESS fix before it is a cost fix.** Invoice populations are the
largest-N input in this suite. A model loop over several thousand lines can skip one and
nothing says so; code cannot. Lower token cost is a side effect and would not justify the
change on its own.

**What the engine does NOT do, deliberately.** It never guesses an ambiguous match. A line
whose `role_billed` is absent from the rate card, or whose roster level is higher than
billed (a favourable variance under Rule 7), is emitted in `needs_model_review` with the
reason. **The model judges only those lines, not all of them.** Judgment is narrowed, never
removed.

It also REFUSES rather than assuming in three cases:

- **The escalation clause's compounding-vs-simple reading is unstated.** Raises
  `BlockingAmbiguityError`. Operating Rule 2 makes this a blocking ambiguity to be asked
  once, tappable, and the two readings produce different caps and therefore different
  findings.
- **The kernel is missing or refuses on a line.** Raises `KernelUnavailableError`, naming
  the line. Per Kernel Wiring above, a figure produced without the kernel is invalid and
  there is deliberately no estimated fallback.
- **Row counts or rollups do not foot.** Raises `ReconciliationError`. Lines in must equal
  lines verified, the category rollup must sum to the Total Questioned Amount, and
  confirmed plus pending must equal that total.

**Self-test before trusting a run:**

```
python invoice_audit_selftest.py                    # engine, 26/26 expected
python invoice_audit_report_generator.py --selftest  # generator, 19/19 expected
```

It runs a golden invoice set with six seeded defects (rate above contract, line-item math
error, escalation over cap, duplicate across invoices, unsupported charge, hours
discrepancy) and **three deliberately clean lines**. The clean lines matter as much as the
seeded ones: an engine that flags everything passes a test that only checks the defects
were caught. The suite asserts exact questioned amounts, every severity-escalation trigger,
that the duplicate rule flags the LATER occurrence rather than the original, that a $5
variance on a $20,000 line is CLEAR rather than a padded exception, and all three refusals
above.

The Phase 2 to 4 specifications below remain the authority for WHAT the engine does. Read
them to understand or change a rule; do not hand-execute them line by line.

### Phase 2: Entity Resolution / Matching -> PASS_2_MATCH

For every invoice line, resolve it against the other documents:

```
PASS_2_MATCH = {
  lines: [ {
    line_id, invoice_number, line_no,
    rate_card_match: { role, contracted_base_rate, unit } | "NOT_FOUND",
    po_match: { po_line, description } | "NOT_FOUND" | "NO_PO_SUPPLIED",
    timesheet_match: [ { period, approved_hours, role_per_roster } ] | "NOT_FOUND" | "NO_TIMESHEETS_SUPPLIED",
    duplicate_signature: resource + "|" + role_billed + "|" + period + "|" + rate_billed + "|" + qty_billed,
  } ],
  duplicate_candidate_groups: [ [line_id, line_id, ...] ],  // lines sharing an identical duplicate_signature across DIFFERENT invoice_numbers
}
```

A duplicate candidate requires an identical signature (resource, role, period, rate, and quantity) across two DIFFERENT invoice numbers; a repeat of the same resource in the same role in a different period is normal recurring billing, not a duplicate. Two lines with a similar but not identical signature (for example, one hour different) are not a duplicate candidate; note them for NEEDS_INTERNAL_REVIEW if genuinely close, per Accuracy and Anti-Drift Rules below.

**GATE CHECK: Phase 2 complete before proceeding to Phase 3**
- [ ] Every invoice line has a rate-card match result (found, or explicitly NOT_FOUND)
- [ ] Every invoice line has a PO match result and a timesheet match result (found, NOT_FOUND, or explicitly "not supplied")
- [ ] Duplicate candidate groups are built from exact-signature matches across different invoice numbers only

### Phase 3: Line-Level Verification -> PASS_3_VERIFY

Run all six check families against every matched line. Every check that produces a dollar figure calls the kernel per "Kernel Wiring" above; log the call and its return value.

**3A. Rate Mismatch (contracted-vs-invoiced rate, and line-item math).**
For every line with a rate-card match: (1) compare `rate_billed` to the applicable contracted rate for that contract year (the Year-1 base rate, or the kernel-computed cap for Year 2+, see 3C) and flag any excess; (2) call `verify_line_math(rate_billed, qty_billed, stated_total)` and flag any `False` result. A line can have both a rate-vs-contract issue and a line-math issue; log them as two distinct finding rows if both fire, tagged with a `check_type` of `RATE_VS_CONTRACT` or `LINE_MATH_ERROR` respectively, but both roll up under the "Rate Mismatch" category.

**3B. Role/Level Mismatch.**
Where a timesheet/roster match exists, compare `role_billed` to `role_per_roster`. A mismatch where the billed role/level carries a higher contracted rate than the roster-confirmed level is a finding; the questioned amount is `(rate for role_billed - rate for role_per_roster) x qty_billed`, both rates read from the rate card (or kernel-capped per 3C if the contract year requires it). A mismatch where the roster level is HIGHER than what was billed is a favorable variance, logged per Rule 7 below, not a questioned amount.

**3C. Escalation Cap Breach (vs the contractual cap).**
For every rate-card-matched line whose contract year is 2 or later, call `escalate()` per "Kernel Wiring" above to get the cap for that role and year. Any `rate_billed` above the returned cap is a finding; the questioned amount is `(rate_billed - cap) x qty_billed`. This check is independent of, and can co-occur with, 3A: a line can bill exactly the Year-1 base rate correctly and still separately breach the escalation cap in a later year, or vice versa.

**3D. Hours/Quantity Discrepancy.**
Where a timesheet match exists, compare `qty_billed` to the sum of `approved_hours` for the matching resource and period. A discrepancy is `qty_billed - approved_hours` (positive = overbilled hours); the questioned amount is `discrepancy x rate_billed` (or the kernel-capped rate if 3C also applies to that line; use the LOWER of the two rates the line could defensibly be billed at, so the hours finding and the rate finding are never double-counted on the same excess dollars). Where no timesheet match exists at all for that resource/period, this is NOT a discrepancy finding, it is 3E (Unsupported Charge) instead.

**3E. Duplicate/Unsupported Charge.**
For every group in `duplicate_candidate_groups`, flag every line in the group AFTER the first (chronologically, by invoice date) as a Duplicate finding; the questioned amount is the full `stated_total` of each duplicate line. Separately, for every line whose `timesheet_match` is `"NOT_FOUND"` (a timesheet population was supplied, but this specific resource/period is not in it) and whose `po_match` is also `"NOT_FOUND"`, flag it as an Unsupported Charge finding; the questioned amount is the full `stated_total`, and the finding states plainly that "unsupported" means the supplied documents contain no substantiating record for this charge, not an assertion of wrongdoing (Rule 6 below). A line with `timesheet_match = "NO_TIMESHEETS_SUPPLIED"` (no timesheet population was supplied at all) is NOT flagged as unsupported; it is labeled NEEDS_INPUT instead, since the absence of any timesheet population is a data gap, not evidence against that specific line.

**3F. Milestone/Payment Mismatch.**
For milestone/fixed-fee SOWs, compare each invoiced milestone amount to the `contracted_amount` for that milestone in `milestones[]`. An invoiced amount above the contracted amount is a finding; the questioned amount is the excess. Separately, track cumulative invoiced-to-date against the PO's `nte` (if a PO was supplied); an invoice that would push cumulative invoiced above the NTE is flagged even if no single line is individually wrong, since it is a payment-authorization problem, not a rate problem.

**GATE CHECK: Phase 3 complete before proceeding to Phase 4**
- [ ] Every rate-card-matched line has a 3A result (pass or fail) with the kernel call logged
- [ ] Every line with a contract year of 2+ has a 3C result with the `escalate()` call logged
- [ ] Every timesheet-matched line has a 3B and 3D result
- [ ] Every duplicate candidate group and every NOT_FOUND-on-both-timesheet-and-PO line has a 3E result
- [ ] Every milestone-based SOW's invoiced milestones are checked in 3F, and the PO NTE tracker is updated

### Phase 4: Severity & Questioned-Amount Rollup -> PASS_4_FINDINGS

Classify every Phase 3 finding by category, severity, and resolution status, then roll up.

**Severity table (deterministic; do not assign severity by feel):**

| Category | Default severity | Escalates to the next tier when |
|---|---|---|
| Duplicate charge | Critical | always (no escalation needed, it is already the ceiling) |
| Unsupported charge | High | escalates to Critical when the line's `stated_total` is $10,000 or more |
| Escalation Cap Breach | High | escalates to Critical when the invoiced rate exceeds the kernel-computed cap by more than 5% |
| Role/Level Mismatch | High | escalates to Critical when the same resource recurs with the same mismatch on 2 or more invoices |
| Milestone/Payment Mismatch | High | escalates to Critical when the invoiced amount exceeds the contracted milestone amount by more than 10%, or the PO NTE would be breached |
| Hours/Quantity Discrepancy | Medium | escalates to High when the discrepancy exceeds 10% of the line's invoiced hours/quantity |
| Rate Mismatch (incl. line-item math error) | Medium | escalates to High when the line's questioned amount is $1,000 or more |

A variance that rounds to $0 questioned or falls within a stated immateriality tolerance ($10 or 0.1% of the line, whichever is greater, consistent with `verify_line_math`'s own tolerance discipline) is logged as CLEAR, not scored as a finding: never pad the exception count with immaterial rounding (Rule 8 below).

**Resolution status (assign per Accuracy and Anti-Drift Rules, Rule 2):**
- `CONFIRMED_OVERCHARGE`: grounded entirely in documents already read this session (the contract's own stated rate/cap/milestone amount, or the invoice's own arithmetic). Counts toward **Confirmed Potential Credit**.
- `PENDING_SUPPLIER_RESPONSE`: depends on a fact only the supplier can confirm or correct (an hours gap that might be an approved-but-unlogged overtime, an unsupported charge the supplier may be able to substantiate). Counts toward **Total Questioned Amount** but NOT toward Confirmed Potential Credit; the dispute notice asks the supplier to substantiate rather than asserting a credit.
- `NEEDS_INTERNAL_REVIEW`: depends on a fact only Lilly's own business owner can confirm (an apparently-expanded milestone that might reflect an unlogged internal change order). Counts toward Total Questioned Amount, flagged for internal follow-up before it goes to the supplier at all.

Roll up: `total_questioned = sum(all finding questioned_amount)`; `confirmed_credit_total = sum(questioned_amount where resolution_status = CONFIRMED_OVERCHARGE)`; `pending_total = total_questioned - confirmed_credit_total`; `category_rollup[category] = sum(questioned_amount where category = category)`. **Numbers-reconcile assertion:** `sum(category_rollup.values()) MUST equal total_questioned` and `confirmed_credit_total + pending_total MUST equal total_questioned`, exactly, every run; if they do not foot, find the arithmetic error before presenting anything.

**GATE CHECK: Phase 4 complete before proceeding to Phase 5**
- [ ] Every Phase 3 finding has a category, a severity (per the table), and a resolution status
- [ ] `category_rollup` sums exactly to `total_questioned`
- [ ] `confirmed_credit_total + pending_total` sums exactly to `total_questioned`
- [ ] The PO NTE tracker (cumulative invoiced vs NTE) is finalized if a PO was supplied

### Phase 5: Output Generation -> PASS_5_OUTPUT (F5, code-generated, not model-assembled)

**Call `invoice_audit_report_generator.py` in this skill's own directory.** It takes the
`AuditResult` object Phase 2-4's engine already produced (never re-run, never
hand-re-derived) and mechanically produces the two deliverables that were previously
model-assembled from per-line kernel outputs: the Findings Ledger (.json) and the Line-Level
Audit Report (.docx).

```
python invoice_audit_report_generator.py audit_input.json \
    --ledger findings_ledger.json --docx audit_report.docx [--header header.json]
```

or in-process:

```
from invoice_audit_engine import audit
from invoice_audit_report_generator import build_full_ledger, write_ledger_json, build_document

result = audit(audit_input)                                  # Phase 2-4, one execution
ledger = build_full_ledger(audit_input, result, header=header)  # F5: the documented ledger schema
write_ledger_json(ledger, "findings_ledger.json")
doc = build_document(ledger)                                  # reads ONLY the ledger object
doc.save("audit_report.docx")
```

`header` supplies the engagement facts the flattened `audit_input` does not itself carry
(`supplier`, `contract_reference`, `rate_card_reference`, `audit_period`, `as_of_date`); any
field omitted is rendered `"NOT PROVIDED"` rather than guessed, per Rule 3. `build_full_ledger`
raises `ReconciliationError` if any invoice line does not appear in EXACTLY ONE of (a finding)
or (the clear-lines list): the same row-count reconciliation F4 verifies, checked again at the
ledger boundary. `build_document` reads only the ledger dict it is handed, so every figure the
DOCX renders is, by construction, a figure the ledger already carries; this is asserted by a
post-build scan (`_assert_docx_traceable_to_ledger`) that raises if a rendered dollar figure
cannot be matched back to the ledger, and by `_assert_no_forbidden_content` (no em dash
anywhere in the rendered text, Operating Rule 7), before the file is saved.

The dashboard (.jsx) and the dispute notice remain model-assembled from the same ledger object
(the dashboard per "Dashboard (LOCKED structure)" below, the dispute notice per Deliverables
item 4); only the ledger and the DOCX report have a code generator as of F5.

Produce the deliverables selected in Output Selection below. See Deliverables for the full spec of each.

### Pre-Delivery Self-Test (G6)

Before presenting anything, confirm:
- [ ] Every questioned dollar traces to a specific line, a specific source citation, and (where applicable) a specific kernel call whose return value is shown
- [ ] `category_rollup` and `confirmed_credit_total + pending_total` both foot to `total_questioned`, shown in the output, not just in working notes
- [ ] Every line in the supplied population appears somewhere in the output, either as a finding or explicitly marked CLEAR; none silently omitted
- [ ] Every finding's `resolution_status` is one of the three defined values, never left blank or implied
- [ ] The dashboard's 7 canonical tabs all render (populated or a labeled state); the DOCX report's sections all appear; the ledger's header block and per-finding schema match what is shown elsewhere
- [ ] No em dashes; no literal escape codes or HTML entities rendered as visible text
- [ ] The methodology section states plainly that this is a reflect-only, point-in-time audit of the supplied population (Single-User, Reflect-Only Scope above)

## Output Selection

### Phrase-Carried Mode Detection

Before showing the Output Selection prompt, check the user's invoking phrase against the patterns below. If matched, set `output_mode` and SKIP the prompt.

| Invoking phrase pattern | output_mode |
|---|---|
| "audit this invoice", "audit these invoices", "line-level audit", "just the audit report" | `Audit report only` |
| "build the invoice audit dashboard", "exceptions dashboard only", "just the dashboard" | `Dashboard only` |
| "draft the dispute notice", "just the dispute letter", "supplier inquiry only" | `Dispute notice only` |
| "full audit", "audit and dispute notice", "give me everything" | `Full audit` |

If no phrase pattern matches, show the prompt below.

### Output Selection Prompt (when no phrase match)

```
ask_user_input_v0(questions=[{
  "question": "What output do you need for this audit?",
  "type": "single_select",
  "options": [
    "Audit report only (default)",
    "Dashboard only",
    "Dispute notice only",
    "Full audit (all outputs)"
  ]
}])
```

If `ask_user_input_v0` is unavailable, present the four options as a short numbered list, state the default is "Audit report only," and proceed on that default if the user does not pick one.

- **Audit report only** -> the DOCX line-level audit report + the JSON findings ledger. No dashboard, no dispute notice draft.
- **Dashboard only** -> the interactive 7-tab exceptions dashboard. No DOCX report, no dispute notice.
- **Dispute notice only** -> from an existing findings ledger (re-entry pattern, see below), draft just the supplier inquiry letter.
- **Full audit** -> all four deliverables.

Default to **Audit report only** if the user does not respond. Most users want the concrete findings and the questioned amount first; the dashboard and dispute notice can follow in a later turn against the same ledger. The full six-check workflow (Phases 1-4) runs identically regardless of output selection; the selection only controls which deliverables are EMITTED at the end.

### Dispute Notice Tone (asked once, only when the dispute notice is in scope)

```
ask_user_input_v0(questions=[{
  "question": "What tone should the draft dispute notice take?",
  "type": "single_select",
  "options": [
    "Standard (default): factual, cites the contract/rate card, asks for a response by a stated date",
    "Collaborative: partnership framing, invites the supplier to explain before asserting a credit",
    "Formal pre-escalation: firmer tone, references the questioned amount as a condition of continued payment processing"
  ]
}])
```

Default to **Standard** if the user does not respond. The tone changes wording only, never the underlying findings, dollar amounts, or resolution statuses.

### Re-Entry Patterns

- **"Dashboard only" from an existing findings ledger:** "build the dashboard for [supplier] invoice audit" + upload the findings ledger (.json). Skips Phases 1-4, builds the dashboard from the ledger's findings directly.
- **"Dispute notice only" from an existing findings ledger:** "draft the dispute notice for [supplier] invoice audit" + upload the ledger. Skips Phases 1-4, drafts the letter from the ledger's CONFIRMED_OVERCHARGE and PENDING_SUPPLIER_RESPONSE findings.
- These patterns support auditing now and holding the heavier artifacts (dashboard, dispute notice) for a later session against the same underlying findings, without re-reading the whole document population.

## Accuracy and Anti-Drift Rules

These rules are non-negotiable. A single fabricated finding, or one confirmed finding that turns out to be an honest misread, destroys the credibility of the entire audit and of the working relationship with the supplier.

**Rule 1: Never assert an overcharge without a verified kernel-computed delta.** Every questioned dollar amount traces to a `verify_line_math()` or `escalate()` call (for the categories those cover) or to a plainly-shown, reconciled sum built from kernel-verified lines (for the categories that are plain arithmetic, per Kernel Wiring above). A hand-estimated "looks like about $X" figure is never presented as a finding.

**Rule 2: Distinguish CONFIRMED from PENDING from NEEDS_REVIEW, always.** Assign `resolution_status` per the definitions in Phase 4. A finding grounded entirely in documents already read this session is CONFIRMED_OVERCHARGE. A finding that depends on a document not provided, or a fact only the supplier or Lilly's own business owner can confirm, is PENDING_SUPPLIER_RESPONSE or NEEDS_INTERNAL_REVIEW respectively, never silently upgraded to confirmed.

**Rule 3: Never fabricate a contracted rate, cap, or milestone amount.** If the rate card or SOW payment schedule does not state a figure for a role or milestone actually being invoiced, say "rate/milestone not found in the supplied documents, cannot verify this line" and mark the line NEEDS_INPUT. Do not infer a missing rate from a similar-sounding role.

**Rule 4: Every finding traces to a specific source.** A contract section or rate-card row (with its exhibit/row reference), an invoice number and line number, a timesheet row, or a PO line. No finding cites a source that was not actually read this session.

**Rule 5: Duplicate detection requires an exact signature match across different invoices.** Resource, role, period, rate, and quantity must all match, on two DIFFERENT invoice numbers. A coincidental partial similarity (same resource and period but a different rate, or an hour different) is NOT a duplicate finding; flag it NEEDS_INTERNAL_REVIEW at most, and say why it fell short of a duplicate match.

**Rule 6: "Unsupported" is a data-gap label, not an accusation.** State plainly, every time, that "unsupported" means the supplied documents contain no substantiating timesheet, roster, or PO record for that specific charge, not an assertion of fraud or bad faith. The dispute notice for these lines asks the supplier to substantiate the charge; it does not assert wrongdoing.

**Rule 7: Underbilling is noted, never converted into a claim against Lilly.** Where the invoiced rate or hours are BELOW the contracted/escalated figure or the roster-confirmed level, log it as a favorable variance in the working notes and, if the user wants full two-directional reconciliation, in the ledger, but it never adds to Total Questioned Amount or appears in the dispute notice as something Lilly owes.

**Rule 8: Do not pad the exception count.** A review with 7 real, material exceptions is more valuable than one with 7 real exceptions and 5 immaterial-variance lines dressed up as findings. Apply the immateriality tolerance in Phase 4 (Severity & Questioned-Amount Rollup) consistently, and log immaterial variances as CLEAR, not as low-severity findings.

**Rule 9: Escalation math always runs through `escalate()`, with the compounding argument matched to the contract's actual language, stated and cited.** Never assume compounding vs simple; if the contract text is genuinely ambiguous, this is a BLOCKING question per Operating Rule 2 and Kernel Wiring above, not a silent default.

**Rule 10: This is a point-in-time, reflect-only audit of the supplied population, and the output must say so.** Never imply ongoing monitoring, a recurring monitoring cadence, or an "I will catch this automatically going forward" claim. See Single-User, Reflect-Only Scope above; restate the scope in the audit report's methodology section every time.

## Dashboard (LOCKED structure)

Seven tabs, identical on every run for every audit. Only the content changes; do not redesign panels or tabs based on category or SOW type. Every tab always renders (populated, or a labeled NEEDS_INPUT / NOT APPLICABLE state).

1. **Overview** - KPI row (Total Questioned Amount, Confirmed Potential Credit, Pending Investigation, Lines Audited / Exception Rate, Cumulative Invoiced vs PO NTE), a left/right narrative-paired panel: left = the exception-rate and severity-mix read (a horizontal severity bar), right = the headline narrative naming the top category and top single finding.
2. **Line-Level Exceptions** - the master `STable` of every audited line (exceptions AND clean lines), sortable/searchable, with a `SevPill`, a `StatusBadge` (Confirmed/Pending/Needs Review/Clear), category, and questioned amount per row.
3. **Rate & Escalation** - a grouped bar chart of contracted base rate vs the kernel-computed escalation cap vs the actually-invoiced rate, per role, left/right paired with a narrative on which roles breach the cap and by how much.
4. **Hours & Quantity** - a bar chart of invoiced vs timesheet-approved hours per exception line, left/right paired with a narrative on the total hours gap and its dollar impact.
5. **Duplicate & Unsupported** - a list of matched duplicate pairs (with both invoice numbers shown side by side) and a list of unsupported lines, left/right paired with a narrative on the matching method used (Rule 5) so the reader can see why each pair or line qualified.
6. **Category Rollup & Credits** - a horizontal bar chart of `category_rollup`, a Confirmed-vs-Pending stacked view, and the PO NTE tracker (a `RangeGauge`-style bar showing cumulative invoiced against the NTE ceiling), left/right paired with a narrative reconciling the numbers.
7. **Dispute Notice & Ledger** - a preview of the drafted dispute notice text (or a NOT_APPLICABLE state if that output was not selected) and the portable JSON findings ledger in a copyable code block.

Component registry: reuse `Metric`, `Card`, `STable`, `SevPill`, `Tip`, `StateBanner` verbatim from `dashboard-components.md`. This skill adds two small, genuinely new-purpose components consistent with that registry's precedent (should-cost-builder's `ConfBadge`/`PositionPill`, market-rate-benchmarking's `ConfPill`): `StatusBadge` (Confirmed/Pending/Needs Review/Clear, a dimension no existing component covers) and `DupPairCard` (a paired-line duplicate display). No new hex colors: both reuse the existing `BLU`/`AMB`/`R`/`MUT` tokens.

## Deliverables

**1. Line-Level Audit Report (.docx, Magazine Report house style).** **F5: generated by `build_document()` in `invoice_audit_report_generator.py`, not model-assembled.** The generator reads only the Findings Ledger object (item 3 below), so every figure it renders is a figure the ledger already carries; this is asserted by a post-build scan before the file is saved (`_assert_docx_traceable_to_ledger`, `_assert_no_forbidden_content`), not left to the model to get right by eye. Title page (title "INVOICE & RATE-CARD AUDIT", subtitle = supplier name + audit period, red rule, scope line = "N invoices | N lines audited | N exceptions | $X questioned", prepared-by, confidential notice, a 2-3 sentence abstract). Table of contents. Numbered sections: 01 Executive Summary; 02 Population & Methodology (what was audited, date range, documents used, the Single-User/Reflect-Only Scope statement, the kernel-wiring disclosure); 03 Rate & Line-Math Findings; 04 Role & Level Findings; 05 Escalation Cap Findings; 06 Hours & Quantity Findings; 07 Duplicate & Unsupported Charges; 08 Milestone & PO/NTE Findings; 09 Category Rollup & Recommended Actions; Appendix A, the full line-level ledger table (every audited line, exceptions and clean); Appendix B, assumptions and data gaps. Colors and fonts follow the Magazine Report palette (Lilly Red #E1251B, Lilly Black #212121, Bold Blue #0F3A85, Bold Brown #521207, Muted Grey #8A969E for footer text), copied verbatim from the inlined `docx-design-system.md` / `brand-colors.md` values; do not invent formatting.

**2. Interactive Dashboard (.jsx).** Per "Dashboard (LOCKED structure)" above. Emitted for `Dashboard only` and `Full audit`.

**3. Findings Ledger (.json).** **F5: generated by `build_full_ledger()` in `invoice_audit_report_generator.py`**, directly from the engine's `AuditResult` object (Phase 2-4, one execution), never authored separately and never re-derived by re-walking the lines by hand (so it cannot drift from the human-readable artifacts). `build_full_ledger` raises `ReconciliationError` if any invoice line does not land in EXACTLY ONE of (a finding) or (the clear-lines list), which is F4/F5's shared row-count reconciliation criterion enforced a second time at the ledger boundary. Each finding also carries an additive `line_id` and `is_invoice_line` field beyond the schema below (useful for grouping a line's multiple findings and for tracing Appendix A's line count; harmless to a consumer reading only the named fields). Schema:

```
{
  "header": {
    "supplier": "", "contract_reference": "", "rate_card_reference": "", "po_number": "",
    "audit_period": "", "invoices_audited": ["INV-...", "..."],
    "lines_audited": 0, "exceptions_found": 0,
    "total_questioned_amount": 0, "confirmed_credit_total": 0, "pending_total": 0,
    "po_nte": 0, "cumulative_invoiced": 0,
    "as_of_date": ""
  },
  "findings": [
    {
      "finding_id": "", "invoice_number": "", "line_no": 0, "resource": "", "role_billed": "",
      "category": "RATE_MISMATCH|ROLE_LEVEL_MISMATCH|ESCALATION_CAP_BREACH|HOURS_QUANTITY_DISCREPANCY|DUPLICATE_UNSUPPORTED|MILESTONE_PAYMENT_MISMATCH",
      "check_type": "", "severity": "Critical|High|Medium|Low",
      "resolution_status": "CONFIRMED_OVERCHARGE|PENDING_SUPPLIER_RESPONSE|NEEDS_INTERNAL_REVIEW",
      "contracted_rate": null, "invoiced_rate": null, "escalation_cap_rate": null,
      "hours_invoiced": null, "hours_approved": null,
      "stated_total": null, "expected_total": null, "questioned_amount": 0,
      "basis": "", "recommended_action": "", "kernel_calls": []
    }
  ],
  "category_rollup": {}
}
```

Emitted for `Audit report only` and `Dashboard only`; offered for `Dispute notice only` re-entry. `total_questioned_amount` and every per-finding `questioned_amount` MUST equal the values shown in the DOCX and dashboard; if they do not foot, fix the calculation, not the ledger. This is a local artifact only: never auto-sent or written to any system.

**4. Draft Supplier Inquiry / Dispute Notice.** Per S4, this is a native deliverable of this skill (not a separate opt-in), produced for `Dispute notice only` and `Full audit`. Structure: a short opening naming the invoice(s) and the audit period; one paragraph per finding category present, each stating the specific lines, the contract/rate-card basis, the kernel-verified dollar delta, and whether it is presented as a confirmed credit request (CONFIRMED_OVERCHARGE findings) or a request to substantiate (PENDING_SUPPLIER_RESPONSE findings, per Rule 6); a total questioned amount and a requested response date; a closing per the selected Dispute Notice Tone. NEEDS_INTERNAL_REVIEW findings are NOT included in the version drafted for the supplier; they appear only in the audit report and ledger, flagged for the user's own internal follow-up first. Draft only; never sent by this skill (S3, S4).

## Next Steps

Close every run with a short Next Steps block: what additional input would deepen the result (the specific missing document, named), whether the dispute notice or dashboard is still pending against this same ledger (re-entry patterns above), and that market-rate-benchmarking or commercial-negotiation-prep are the next skills to reach for if the audit surfaces a rate that is contractually correct but no longer competitive at renewal.

---

## INLINED: examples/invoice_rate_card_auditor_canonical_dashboard.jsx

```jsx
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from "recharts";

// ---------------------------------------------------------------------------
// Invoice & Rate-Card Auditor - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure. 7 tabs, identical on every run for every audit. Only the
// data changes per run. House style: Magazine Report (Arial body, Georgia
// titles, dark #212121 header with red rule, Lilly-approved palette).
// Components copied verbatim from lilly-brand-assets-1c344a,
// references/dashboard-components.md. Data below is ILLUSTRATIVE (a
// professional-services SOW, 2 invoices, Meridian Advisory Partners). Clone
// the structure, swap the data. Every dollar figure below was independently
// reconciled against the vendored numeric_kernel.py before being hardcoded
// here (see the source skill's Phase 3/4 worked example); this file mirrors
// verify_line_math() and escalate() in JS rather than re-deriving numbers by
// hand, the same discipline should-cost-builder's canonical dashboard uses
// for quadrature_rollup().
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green
// anywhere; positive signal uses Bold Blue (BLU) / Neutral Sky (OK), never a
// "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Severity tiers: copied verbatim from dashboard-components.md (positive = BLU, never green).
const SEV = { Critical: R, High: R, Medium: AMB, Low: BLU };
const SEVBG = { Critical: RISK, High: RISK, Medium: WARM, Low: OK };

// Chart palette: exactly the 6 on-brand hexes from dashboard-components.md.
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

const TABS = ["Overview", "Line-Level Exceptions", "Rate & Escalation", "Hours & Quantity", "Duplicate & Unsupported", "Category Rollup & Credits", "Dispute Notice & Ledger"];
const NEEDS_INPUT = {}; // no tab is pending input in this fully-populated illustrative run (contract, rate card, PO, and timesheets are all present)

// --- Currency / percent helpers (copied verbatim from dashboard-components.md) -------------
function f$(v) {
  if (v == null) return "";
  var a = Math.abs(v);
  if (a >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}
function fF(v) { return "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fP(v) { return v == null ? "" : v.toFixed(1) + "%"; }

// --- numeric_kernel.py mirrors (verify_line_math, escalate) --------------------------------
// Source of truth: invoice-rate-card-auditor-1c344a/numeric_kernel.py (vendored from
// lilly-procurement-kernels-1c344a). Signatures and formulas copied verbatim; do not
// hand-edit the math independently of that file (SKILL.md "Kernel Wiring (HARD RULE, no
// model arithmetic, G11)"). Every INVOICE_LINES entry below was checked against these
// exact functions before being hardcoded (see the worked-example reconciliation in the
// skill's Phase 3/4 text).
function verifyLineMathJS(rate, hours, statedTotal, tolerance) {
  var tol = tolerance == null ? 0.01 : tolerance;
  var expected = rate * hours;
  return Math.abs(expected - statedTotal) <= tol;
}
function escalateJS(base, rate, year, compounding) {
  if (year < 1) { throw new Error("year must be >= 1 (1-indexed, per arithmetic-verification.md 3E-2)."); }
  return compounding ? base * Math.pow(1 + rate, year) : base * (1 + rate * year);
}

// --- Shared components (verbatim from dashboard-components.md) ------------------------------
function Metric({ label, value, sub, accent, warn, good }) {
  var bar = accent ? R : warn ? R : good ? BLU : BD;
  return <div style={{ background: accent ? WARM : warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: accent ? R : MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: warn ? R : good ? BLU : DK, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{sub}</div>}
  </div>;
}
function Card({ title, note, children }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 18, border: "1px solid " + BD, marginBottom: 14 }}>
    {title && <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: DK, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 14, background: R, borderRadius: 2 }} />{title}
      {note && <span style={{ fontFamily: "Arial", fontSize: 10, fontWeight: 600, color: MUT, marginLeft: "auto" }}>{note}</span>}
    </div>}{children}
  </div>;
}
function StateBanner({ kind, msg }) {
  var map = { NEEDS_INPUT: [AMB, WARM, "Needs input"], NOT_APPLICABLE: [MUT, CARD, "Not applicable"], RESEARCH_PENDING: [MUT, CARD, "Research pending"] };
  var c = map[kind] || map.NOT_APPLICABLE;
  return <div style={{ background: c[1], border: "1px solid " + c[0] + "55", borderLeft: "4px solid " + c[0], borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: c[0], textTransform: "uppercase" }}>{c[2]}</span>
    <div style={{ fontSize: 12, color: DK, marginTop: 4, lineHeight: 1.5 }}>{msg}</div>
  </div>;
}
function SevPill({ s }) {
  return <span style={{ color: SEV[s], background: SEVBG[s], border: "1px solid " + SEV[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}
function STable({ columns, rows }) {
  var _s = useState({ col: 0, dir: "asc" }); var sort = _s[0]; var setSort = _s[1];
  var _q = useState(""); var q = _q[0]; var setQ = _q[1];
  var filtered = useMemo(function () {
    var r = rows;
    if (q) { var lq = q.toLowerCase(); r = rows.filter(function (row) { return row.some(function (c) { return String(c.d).toLowerCase().indexOf(lq) >= 0; }); }); }
    return r.slice().sort(function (a, b) {
      var av = a[sort.col].v != null ? a[sort.col].v : a[sort.col].d;
      var bv = b[sort.col].v != null ? b[sort.col].v : b[sort.col].d;
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sort, q]);
  return <div>
    <div style={{ marginBottom: 8 }}>
      <input value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="Search..." style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid " + BD, fontSize: 12, width: 220 }} />
      <span style={{ fontSize: 11, color: LT, marginLeft: 8 }}>{filtered.length} of {rows.length}</span>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{columns.map(function (h, i) {
          var active = sort.col === i;
          return <th key={i} onClick={function () { setSort({ col: i, dir: active && sort.dir === "desc" ? "asc" : "desc" }); }} style={{ padding: "7px 8px", fontWeight: 600, color: active ? R : MUT, fontSize: 11, borderBottom: "2px solid " + BD, cursor: "pointer", textAlign: h.a || "left", whiteSpace: "nowrap" }}>{h.l}{active ? (sort.dir === "asc" ? " ^" : " v") : ""}</th>;
        })}</tr></thead>
        <tbody>{filtered.map(function (row, ri) {
          return <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
            {row.map(function (cell, ci) {
              return <td key={ci} style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: columns[ci].a || "left", fontWeight: cell.b ? 700 : 400, color: cell.c || DK }}>{cell.d}</td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}
function Tip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div style={{ background: DK, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 12 }}>
    {label && <div style={{ fontWeight: 600, color: LT }}>{label}</div>}
    {payload.map(function (p, i) { return <div key={i}>{p.name ? p.name + ": " : ""}<strong>{typeof p.value === "number" ? f$(p.value) : p.value}</strong></div>; })}
  </div>;
}

// Status badge (Confirmed / Pending / Needs Review / Clear): a genuinely new dimension
// not covered by SevPill (severity) or any registry component; reuses existing tokens only.
const STATUS_STYLE = {
  CONFIRMED_OVERCHARGE: [R, RISK, "Confirmed Overcharge"],
  PENDING_SUPPLIER_RESPONSE: [AMB, WARM, "Pending Supplier Response"],
  NEEDS_INTERNAL_REVIEW: [BLU, OK, "Needs Internal Review"],
  CLEAR: [MUT, CARD, "Clear"],
};
function StatusBadge({ s }) {
  var st = STATUS_STYLE[s] || STATUS_STYLE.CLEAR;
  return <span style={{ color: st[0], background: st[1], border: "1px solid " + st[0] + "40", fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{st[2]}</span>;
}

// Paired-line duplicate display (pure layout, no chart library).
function DupPairCard({ original, dup }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + BD }}>
    <div>
      <div style={{ fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: "0.04em" }}>Original</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{original.invoiceNumber} - Line {original.lineNo}</div>
      <div style={{ fontSize: 11, color: MUT }}>{original.resource}, {original.roleBilled}, {original.period}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{fF(original.statedTotal)}</div>
    </div>
    <div style={{ fontSize: 16, color: R, fontWeight: 700 }}>=</div>
    <div>
      <div style={{ fontSize: 10, color: R, textTransform: "uppercase", letterSpacing: "0.04em" }}>Duplicate (flagged)</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{dup.invoiceNumber} - Line {dup.lineNo}</div>
      <div style={{ fontSize: 11, color: MUT }}>{dup.resource}, {dup.roleBilled}, {dup.period}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: R }}>{fF(dup.questionedAmount)} questioned</div>
    </div>
  </div>;
}

// --- ILLUSTRATIVE DATA (replace entirely per run) --------------------------------------------
const META = {
  auditTitle: "Invoice & Rate-Card Audit",
  supplierName: "Meridian Advisory Partners",
  category: "Professional / Consulting Services",
  contractRef: "MSA-2024-1187, SOW-3 (Requirements & Delivery Advisory), Exhibit B Rate Card",
  poNumber: "PO-4471102",
  poNte: 650000.00,
  auditPeriod: "Contract Year 2 (May-June 2026)",
  currency: "USD",
  asOfDate: "July 22, 2026",
  preparedFor: "Global IT Procurement",
};

// Rate Card (Exhibit B, Year-1 base) and the contract's escalation clause (Section 4.2:
// "annual escalation not to exceed 3%, compounding, effective each contract-year
// anniversary"). Year-2 caps below are escalateJS(base, 0.03, 1, true), i.e. escalate()
// with 1 elapsed escalation period, matching the SKILL.md Kernel Wiring convention
// (Year 2 uses year=1, Year 3 would use year=2).
const ESCALATION = { rate: 0.03, compounding: true, source: "Exhibit B Section 4.2 (quoted): 'annual escalation not to exceed 3%, compounding, effective each contract-year anniversary'" };
const ROLES = [
  { key: "sr_consultant", name: "Senior Consultant", baseRate: 185.00 },
  { key: "consultant", name: "Consultant", baseRate: 145.00 },
  { key: "business_analyst", name: "Business Analyst", baseRate: 110.00 },
  { key: "project_manager", name: "Project Manager", baseRate: 165.00 },
].map(function (r) { return Object.assign({}, r, { year2Cap: escalateJS(r.baseRate, ESCALATION.rate, 1, ESCALATION.compounding) }); });
function roleByName(n) { return ROLES.filter(function (r) { return r.name === n; })[0]; }

const MILESTONES = [
  { name: "Milestone 3: Requirements Sign-off", contractedAmount: 75000.00, source: "SOW-3 Exhibit A Payment Schedule" },
];

// Raw invoice lines. Every stated_total/expected_total pair below was verified with
// verifyLineMathJS (mirroring numeric_kernel.py's verify_line_math exactly); every
// role's Year-2 cap was verified with escalateJS (mirroring escalate() exactly).
const RAW_LINES = [
  { id: "L1", invoiceNumber: "INV-1042", lineNo: 1, resource: "J. Alvarez", roleBilled: "Senior Consultant", rosterRole: "Senior Consultant", period: "May 2026", rateBilled: 196.00, hoursBilled: 172, statedTotal: 33712.00, approvedHours: 172, poFound: true, timesheetSupplied: true },
  { id: "L2", invoiceNumber: "INV-1042", lineNo: 2, resource: "T. Brooks", roleBilled: "Consultant", rosterRole: "Business Analyst", period: "May 2026", rateBilled: 149.35, hoursBilled: 180, statedTotal: 26883.00, approvedHours: 180, poFound: true, timesheetSupplied: true },
  { id: "L3", invoiceNumber: "INV-1042", lineNo: 3, resource: "M. Chen", roleBilled: "Project Manager", rosterRole: "Project Manager", period: "May 2026", rateBilled: 169.95, hoursBilled: 165, statedTotal: 28041.75, approvedHours: 148, poFound: true, timesheetSupplied: true },
  { id: "L4", invoiceNumber: "INV-1042", lineNo: 4, resource: "R. Osei", roleBilled: "Business Analyst", rosterRole: "Business Analyst", period: "May 2026", rateBilled: 113.30, hoursBilled: 190, statedTotal: 21850.00, approvedHours: 190, poFound: true, timesheetSupplied: true },
  { id: "L5", invoiceNumber: "INV-1058", lineNo: 1, resource: "J. Alvarez", roleBilled: "Senior Consultant", rosterRole: "Senior Consultant", period: "May 2026", rateBilled: 196.00, hoursBilled: 172, statedTotal: 33712.00, approvedHours: 172, poFound: true, timesheetSupplied: true, isDuplicateOf: "L1" },
  { id: "L6", invoiceNumber: "INV-1058", lineNo: 2, resource: "T. Brooks", roleBilled: "Consultant", rosterRole: null, period: "June 2026", rateBilled: 149.35, hoursBilled: 175, statedTotal: 26136.25, approvedHours: null, poFound: false, timesheetSupplied: true },
  { id: "L7", invoiceNumber: "INV-1058", lineNo: 4, resource: "M. Chen", roleBilled: "Project Manager", rosterRole: "Project Manager", period: "June 2026", rateBilled: 169.95, hoursBilled: 150, statedTotal: 25492.50, approvedHours: 150, poFound: true, timesheetSupplied: true },
];
const MILESTONE_LINE = { id: "L8", invoiceNumber: "INV-1058", lineNo: 3, description: "Milestone 3: Requirements Sign-off", invoicedAmount: 95000.00 };

// --- Derived data model (build once, module scope; G5 "complete data object before rendering") -
var LINES = RAW_LINES.map(function (ln) {
  var role = roleByName(ln.roleBilled);
  var expectedTotal = ln.rateBilled * ln.hoursBilled;
  var lineMathOk = verifyLineMathJS(ln.rateBilled, ln.hoursBilled, ln.statedTotal);
  var capRate = role.year2Cap;
  var capBreach = ln.rateBilled > capRate;
  var roleMismatch = ln.rosterRole && ln.rosterRole !== ln.roleBilled;
  var hoursGap = (ln.approvedHours != null) ? (ln.hoursBilled - ln.approvedHours) : null;
  var unsupported = !ln.poFound && ln.timesheetSupplied && ln.approvedHours == null;
  return Object.assign({}, ln, { role: role, expectedTotal: expectedTotal, lineMathOk: lineMathOk, capRate: capRate, capBreach: capBreach, roleMismatch: roleMismatch, hoursGap: hoursGap, unsupported: unsupported });
});

function findLine(id) { return LINES.filter(function (l) { return l.id === id; })[0]; }

// Findings, one row per Phase 3 check that actually fired. Category/severity/status follow
// the SKILL.md Phase 4 severity table and resolution-status definitions exactly.
var FINDINGS = [
  {
    id: "F1", lineId: "L1", category: "ESCALATION_CAP_BREACH", checkType: "ESCALATION_CAP",
    severity: "High", status: "CONFIRMED_OVERCHARGE",
    basis: "Senior Consultant billed at $196.00/hr; Exhibit B base $185.00/hr, Section 4.2 caps Year-2 at escalate(185.00, 0.03, 1, true) = $190.55/hr. Excess $5.45/hr x 172 hrs.",
    questionedAmount: Math.round((196.00 - roleByName("Senior Consultant").year2Cap) * 172 * 100) / 100,
  },
  {
    id: "F2", lineId: "L2", category: "ROLE_LEVEL_MISMATCH", checkType: "ROLE_LEVEL",
    severity: "High", status: "CONFIRMED_OVERCHARGE",
    basis: "T. Brooks billed as Consultant ($149.35/hr, at the Year-2 cap); the approved roster lists T. Brooks as Business Analyst ($113.30/hr cap). Excess $36.05/hr x 180 hrs.",
    questionedAmount: Math.round((149.35 - roleByName("Business Analyst").year2Cap) * 180 * 100) / 100,
  },
  {
    id: "F3", lineId: "L3", category: "HOURS_QUANTITY_DISCREPANCY", checkType: "HOURS_GAP",
    severity: "High", status: "PENDING_SUPPLIER_RESPONSE",
    basis: "M. Chen invoiced 165 hrs on INV-1042 line 3; the approved timesheet supports 148 hrs, a 17-hr (10.3%) gap at the Project Manager rate of $169.95/hr.",
    questionedAmount: Math.round(169.95 * (165 - 148) * 100) / 100,
  },
  {
    id: "F4", lineId: "L4", category: "RATE_MISMATCH", checkType: "LINE_MATH_ERROR",
    severity: "Medium", status: "CONFIRMED_OVERCHARGE",
    basis: "R. Osei line: $113.30/hr x 190 hrs = $21,527.00; the invoice states $21,850.00. verify_line_math(113.30, 190, 21850.00) returns False.",
    questionedAmount: Math.round((21850.00 - 21527.00) * 100) / 100,
  },
  {
    id: "F5", lineId: "L5", category: "DUPLICATE_UNSUPPORTED", checkType: "DUPLICATE",
    severity: "Critical", status: "CONFIRMED_OVERCHARGE",
    basis: "INV-1058 line 1 (J. Alvarez, Senior Consultant, May 2026, $196.00/hr x 172 hrs = $33,712.00) is an identical signature match to INV-1042 line 1, billed on a different invoice number.",
    questionedAmount: 33712.00,
  },
  {
    id: "F6", lineId: "L6", category: "DUPLICATE_UNSUPPORTED", checkType: "UNSUPPORTED",
    severity: "Critical", status: "PENDING_SUPPLIER_RESPONSE",
    basis: "T. Brooks, INV-1058 line 2, June 2026: no matching PO line and no matching timesheet row found in the supplied timesheet population. Amount exceeds the $10,000 Critical threshold.",
    questionedAmount: 26136.25,
  },
  {
    id: "F7", lineId: "L8_MILESTONE", category: "MILESTONE_PAYMENT_MISMATCH", checkType: "MILESTONE",
    severity: "Critical", status: "NEEDS_INTERNAL_REVIEW",
    basis: "INV-1058 line 3 invoices Milestone 3 (Requirements Sign-off) at $95,000.00; SOW-3 Exhibit A Payment Schedule states $75,000.00 for this milestone, a 26.7% excess.",
    questionedAmount: Math.round((95000.00 - 75000.00) * 100) / 100,
  },
];

const CATEGORY_LABEL = {
  RATE_MISMATCH: "Rate Mismatch", ROLE_LEVEL_MISMATCH: "Role/Level Mismatch", ESCALATION_CAP_BREACH: "Escalation Cap Breach",
  HOURS_QUANTITY_DISCREPANCY: "Hours/Quantity Discrepancy", DUPLICATE_UNSUPPORTED: "Duplicate/Unsupported Charge", MILESTONE_PAYMENT_MISMATCH: "Milestone/Payment Mismatch",
};

const TOTAL_QUESTIONED = Math.round(FINDINGS.reduce(function (a, f) { return a + f.questionedAmount; }, 0) * 100) / 100;
const CONFIRMED_TOTAL = Math.round(FINDINGS.filter(function (f) { return f.status === "CONFIRMED_OVERCHARGE"; }).reduce(function (a, f) { return a + f.questionedAmount; }, 0) * 100) / 100;
const PENDING_TOTAL = Math.round((TOTAL_QUESTIONED - CONFIRMED_TOTAL) * 100) / 100;

var CATEGORY_ROLLUP = {};
FINDINGS.forEach(function (f) { CATEGORY_ROLLUP[f.category] = Math.round(((CATEGORY_ROLLUP[f.category] || 0) + f.questionedAmount) * 100) / 100; });
const CATEGORY_ROLLUP_SUM = Math.round(Object.keys(CATEGORY_ROLLUP).reduce(function (a, k) { return a + CATEGORY_ROLLUP[k]; }, 0) * 100) / 100;
const RECONCILE_OK = CATEGORY_ROLLUP_SUM === TOTAL_QUESTIONED && Math.round((CONFIRMED_TOTAL + PENDING_TOTAL) * 100) / 100 === TOTAL_QUESTIONED;

const CUMULATIVE_INVOICED = Math.round((LINES.reduce(function (a, l) { return a + l.statedTotal; }, 0) + MILESTONE_LINE.invoicedAmount) * 100) / 100;
const NTE_PCT_USED = Math.round((CUMULATIVE_INVOICED / META.poNte) * 1000) / 10;

const LINES_AUDITED = LINES.length + 1; // + the milestone line
const EXCEPTION_COUNT = FINDINGS.length;
const EXCEPTION_RATE = Math.round((EXCEPTION_COUNT / LINES_AUDITED) * 1000) / 10;

const SEVERITY_COUNTS = { Critical: 0, High: 0, Medium: 0, Low: 0 };
FINDINGS.forEach(function (f) { SEVERITY_COUNTS[f.severity] += 1; });

const CATEGORY_CHART_DATA = Object.keys(CATEGORY_ROLLUP).map(function (k) { return { name: CATEGORY_LABEL[k], amount: CATEGORY_ROLLUP[k] }; }).sort(function (a, b) { return b.amount - a.amount; });

const RATE_CHART_DATA = ROLES.map(function (r) {
  var invoicedLine = LINES.filter(function (l) { return l.roleBilled === r.name; }).sort(function (a, b) { return b.rateBilled - a.rateBilled; })[0];
  return { name: r.name, base: r.baseRate, cap: r.year2Cap, invoiced: invoicedLine ? invoicedLine.rateBilled : r.year2Cap };
});

const HOURS_CHART_DATA = LINES.filter(function (l) { return l.approvedHours != null; }).map(function (l) {
  return { name: l.resource + " (" + l.invoiceNumber + " L" + l.lineNo + ")", invoiced: l.hoursBilled, approved: l.approvedHours };
});

const DUP_PAIRS = LINES.filter(function (l) { return l.isDuplicateOf; }).map(function (l) { return { original: findLine(l.isDuplicateOf), dup: Object.assign({}, l, { questionedAmount: (FINDINGS.filter(function (f) { return f.lineId === l.id; })[0] || {}).questionedAmount || 0 }) }; });
const UNSUPPORTED_LINES = LINES.filter(function (l) { return l.unsupported; });

// Portable ledger JSON (mirrors SKILL.md's Findings Ledger schema)
const LEDGER_JSON = {
  header: {
    supplier: META.supplierName, contract_reference: META.contractRef, po_number: META.poNumber,
    audit_period: META.auditPeriod, invoices_audited: ["INV-1042", "INV-1058"],
    lines_audited: LINES_AUDITED, exceptions_found: EXCEPTION_COUNT,
    total_questioned_amount: TOTAL_QUESTIONED, confirmed_credit_total: CONFIRMED_TOTAL, pending_total: PENDING_TOTAL,
    po_nte: META.poNte, cumulative_invoiced: CUMULATIVE_INVOICED, as_of_date: META.asOfDate,
  },
  findings: FINDINGS.map(function (f) {
    return { finding_id: f.id, category: f.category, check_type: f.checkType, severity: f.severity, resolution_status: f.status, questioned_amount: f.questionedAmount, basis: f.basis };
  }),
  category_rollup: CATEGORY_ROLLUP,
};

const DISPUTE_NOTICE_PREVIEW = "Subject: Invoice Reconciliation Inquiry, INV-1042 and INV-1058 (" + META.supplierName + ")\n\n" +
  "We have completed a line-level reconciliation of INV-1042 and INV-1058 against SOW-3 (" + META.contractRef + ") for the " + META.auditPeriod + " billing period. " +
  "This review identified " + EXCEPTION_COUNT + " line items totaling " + fF(TOTAL_QUESTIONED) + " that do not reconcile to the contracted rate card, the approved escalation cap, the approved timesheets, or the SOW payment schedule.\n\n" +
  "Of this amount, " + fF(CONFIRMED_TOTAL) + " is a confirmed overcharge under the terms of SOW-3 Exhibit B and Section 4.2, for which we are requesting a credit memo. The remaining " + fF(PENDING_TOTAL) + " relates to charges we could not substantiate against the documentation in hand; we ask that you provide supporting detail (timesheets, change-order approvals, or milestone acceptance records) within 10 business days.\n\n" +
  "A full line-level breakdown is enclosed. Please contact us to discuss.";

// ---------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------------------------
export default function InvoiceRateCardAuditorDashboard() {
  var _t = useState("Overview"); var tab = _t[0]; var setTab = _t[1];

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Invoice & Rate-Card Auditor</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.supplierName} - {META.auditPeriod}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{META.asOfDate} | {META.category}<br />{META.contractRef}</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto" }}>
        {TABS.map(function (t) {
          var active = t === tab;
          return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}{NEEDS_INPUT[t] ? <span style={{ color: AMB, marginLeft: 4 }}>*</span> : null}</button>;
        })}
      </div>

      <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {tab === "Overview" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Metric label="Total Questioned" value={fF(TOTAL_QUESTIONED)} sub={EXCEPTION_COUNT + " of " + LINES_AUDITED + " lines"} accent />
            <Metric label="Confirmed Credit" value={fF(CONFIRMED_TOTAL)} sub="grounded in read documents" warn />
            <Metric label="Pending Investigation" value={fF(PENDING_TOTAL)} sub="awaiting supplier/internal response" />
            <Metric label="Exception Rate" value={fP(EXCEPTION_RATE)} sub={EXCEPTION_COUNT + " exceptions"} warn={EXCEPTION_RATE > 25} />
            <Metric label="PO NTE Used" value={fP(NTE_PCT_USED)} sub={fF(CUMULATIVE_INVOICED) + " of " + fF(META.poNte)} good={NTE_PCT_USED < 90} />
          </div>

          <div style={{ background: RECONCILE_OK ? CARD : RISK, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: DK }}>
            <b>Reconciliation:</b> Category rollup sums to {fF(CATEGORY_ROLLUP_SUM)}; Confirmed ({fF(CONFIRMED_TOTAL)}) plus Pending ({fF(PENDING_TOTAL)}) sums to {fF(CONFIRMED_TOTAL + PENDING_TOTAL)}. Both equal Total Questioned ({fF(TOTAL_QUESTIONED)}): {RECONCILE_OK ? "reconciles." : "DOES NOT RECONCILE, fix before delivery."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
            <Card title="Exceptions by Severity" note={LINES_AUDITED + " lines audited"}>
              {["Critical", "High", "Medium", "Low"].map(function (s) {
                var w = (SEVERITY_COUNTS[s] / Math.max(1, EXCEPTION_COUNT)) * 100;
                return <div key={s} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}><SevPill s={s} /><span style={{ color: MUT }}>{SEVERITY_COUNTS[s]} line(s)</span></div>
                  <div style={{ height: 8, background: CARD, borderRadius: 4, overflow: "hidden" }}><div style={{ width: w + "%", height: "100%", background: SEV[s] }} /></div>
                </div>;
              })}
            </Card>
            <Card title="Reading the Audit">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{EXCEPTION_COUNT} of {LINES_AUDITED} audited lines ({fP(EXCEPTION_RATE)}) carry a finding, totaling {fF(TOTAL_QUESTIONED)} questioned across two invoices. The single largest category is {CATEGORY_CHART_DATA[0].name} at {fF(CATEGORY_CHART_DATA[0].amount)}, driven by an exact-signature duplicate of J. Alvarez's Senior Consultant time between INV-1042 and INV-1058.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>{fF(CONFIRMED_TOTAL)} is confirmed against documents already in hand (the rate card, the escalation clause, and the invoice's own arithmetic) and is ready to include in a credit request. The remaining {fF(PENDING_TOTAL)} depends on a supplier response or an internal confirmation before it can be asserted as a credit; see Category Rollup & Credits.</p>
            </Card>
          </div>
        </div>}

        {tab === "Line-Level Exceptions" && <div>
          <Card title="All Audited Lines" note="Exceptions and clean lines, both invoices">
            <STable
              columns={[{ l: "Invoice/Line" }, { l: "Resource" }, { l: "Role Billed" }, { l: "Category" }, { l: "Severity", a: "center" }, { l: "Status", a: "center" }, { l: "Questioned", a: "right" }]}
              rows={FINDINGS.map(function (f) {
                var ln = f.lineId === "L8_MILESTONE" ? { invoiceNumber: MILESTONE_LINE.invoiceNumber, lineNo: MILESTONE_LINE.lineNo, resource: "(milestone)", roleBilled: MILESTONE_LINE.description } : findLine(f.lineId);
                return [
                  { d: ln.invoiceNumber + " L" + ln.lineNo, b: true },
                  { d: ln.resource },
                  { d: ln.roleBilled },
                  { d: CATEGORY_LABEL[f.category] },
                  { d: <SevPill s={f.severity} />, a: "center" },
                  { d: <StatusBadge s={f.status} />, a: "center" },
                  { d: fF(f.questionedAmount), v: f.questionedAmount, a: "right", b: true, c: R },
                ];
              }).concat([
                (function () { var l = findLine("L3"); return [{ d: l.invoiceNumber + " L" + l.lineNo, b: true }, { d: l.resource }, { d: l.roleBilled }, { d: "Rate Mismatch" }, { d: <SevPill s="Low" />, a: "center" }, { d: <StatusBadge s="CLEAR" />, a: "center" }, { d: "$0.00", v: 0, a: "right" }]; })(),
                (function () { var l = findLine("L7"); return [{ d: l.invoiceNumber + " L" + l.lineNo, b: true }, { d: l.resource }, { d: l.roleBilled }, { d: "All checks" }, { d: <SevPill s="Low" />, a: "center" }, { d: <StatusBadge s="CLEAR" />, a: "center" }, { d: "$0.00", v: 0, a: "right" }]; })(),
              ])}
            />
          </Card>
        </div>}

        {tab === "Rate & Escalation" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Base vs Escalation Cap vs Invoiced Rate, by Role" note="Year-2 cap = escalate(base, 0.03, 1, true)">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={RATE_CHART_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tickFormatter={function (v) { return "$" + v; }} tick={{ fontSize: 11 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="base" name="Base Rate" fill={MUT} />
                  <Bar dataKey="cap" name="Escalation Cap" fill={BLU} />
                  <Bar dataKey="invoiced" name="Invoiced Rate">
                    {RATE_CHART_DATA.map(function (d, i) { return <Cell key={i} fill={d.invoiced > d.cap ? R : OK} stroke={d.invoiced > d.cap ? R : BLU} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Reading the Rates">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Only Senior Consultant breaches the escalation cap: invoiced at $196.00/hr against a $190.55/hr Year-2 ceiling per {ESCALATION.source}, a $5.45/hr (2.9%) excess.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Consultant and Business Analyst rates are billed exactly at their respective caps; their exceptions on the Line-Level Exceptions tab are a role/level mismatch and a line-item math error, not a rate-vs-cap issue. Project Manager time carries no rate finding in this population.</p>
            </Card>
          </div>
        </div>}

        {tab === "Hours & Quantity" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Invoiced vs Approved Hours" note="Lines with a timesheet match">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={HOURS_CHART_DATA} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 10 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="invoiced" name="Invoiced Hours" fill={R}><LabelList dataKey="invoiced" position="right" style={{ fontSize: 10, fill: DK }} /></Bar>
                  <Bar dataKey="approved" name="Approved Hours" fill={BLU}><LabelList dataKey="approved" position="right" style={{ fontSize: 10, fill: DK }} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Reading the Gap">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>M. Chen's INV-1042 line 3 is the only hours discrepancy: 165 hrs invoiced against 148 hrs approved on the timesheet, a 17-hr (10.3%) gap worth {fF(169.95 * 17)} at the Project Manager rate.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>This is flagged PENDING_SUPPLIER_RESPONSE, not confirmed: a 17-hour gap can reflect a legitimate approved-but-unlogged adjustment, so the dispute notice asks for substantiation rather than asserting the full amount as a credit.</p>
            </Card>
          </div>
        </div>}

        {tab === "Duplicate & Unsupported" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title="Duplicate Charges" note="Exact signature match across different invoice numbers">
              {DUP_PAIRS.map(function (p, i) { return <DupPairCard key={i} original={p.original} dup={p.dup} />; })}
            </Card>
            <Card title="Matching Method">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>A duplicate requires an identical resource, role, period, rate, and quantity on two DIFFERENT invoice numbers. INV-1058 line 1 matches INV-1042 line 1 on all five fields, so it is flagged as a duplicate for its full {fF(33712.00)}, not a rate or hours issue.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>A near match (same resource and period but a different rate or hour count) does not qualify as a duplicate under this rule; it would instead be logged NEEDS_INTERNAL_REVIEW. No lines in this population fell into that near-match case.</p>
            </Card>
          </div>
          <Card title="Unsupported Charges" note="No matching PO line and no matching timesheet row">
            <STable
              columns={[{ l: "Invoice/Line" }, { l: "Resource" }, { l: "Period" }, { l: "Stated Total", a: "right" }, { l: "Status", a: "center" }]}
              rows={UNSUPPORTED_LINES.map(function (l) {
                return [{ d: l.invoiceNumber + " L" + l.lineNo, b: true }, { d: l.resource }, { d: l.period }, { d: fF(l.statedTotal), v: l.statedTotal, a: "right", b: true, c: R }, { d: <StatusBadge s="PENDING_SUPPLIER_RESPONSE" />, a: "center" }];
              })}
            />
            <div style={{ marginTop: 10 }}>
              <StateBanner kind="NOT_APPLICABLE" msg="Unsupported means the supplied documents contain no substantiating timesheet, roster, or PO record for this charge. It is not an assertion of wrongdoing; the dispute notice asks the supplier to substantiate the charge." />
            </div>
          </Card>
        </div>}

        {tab === "Category Rollup & Credits" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title="Questioned Amount by Category" note="Sums exactly to Total Questioned">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CATEGORY_CHART_DATA} layout="vertical" margin={{ top: 8, right: 50, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" tickFormatter={f$} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 10 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="amount" fill={BRN}>
                    <LabelList dataKey="amount" position="right" formatter={function (v) { return fF(v); }} style={{ fontSize: 10, fill: DK }} />
                    {CATEGORY_CHART_DATA.map(function (d, i) { return <Cell key={i} fill={PAL[i % PAL.length]} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Confirmed vs Pending">
              <div style={{ display: "flex", height: 34, borderRadius: 6, overflow: "hidden", border: "1px solid " + BD, marginBottom: 8 }}>
                <div style={{ width: fP(CONFIRMED_TOTAL / TOTAL_QUESTIONED * 100), background: R, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{fP(CONFIRMED_TOTAL / TOTAL_QUESTIONED * 100)}</span></div>
                <div style={{ width: fP(PENDING_TOTAL / TOTAL_QUESTIONED * 100), background: AMB, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{fP(PENDING_TOTAL / TOTAL_QUESTIONED * 100)}</span></div>
              </div>
              <div style={{ fontSize: 11, color: MUT }}><span style={{ color: R, fontWeight: 700 }}>Confirmed</span> {fF(CONFIRMED_TOTAL)} - <span style={{ color: AMB, fontWeight: 700 }}>Pending</span> {fF(PENDING_TOTAL)}</div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + BD }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>PO NTE Tracker</div>
                <div style={{ height: 10, background: CARD, borderRadius: 5, marginTop: 6, overflow: "hidden" }}><div style={{ width: fP(NTE_PCT_USED), height: "100%", background: NTE_PCT_USED > 90 ? R : BLU }} /></div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>{fF(CUMULATIVE_INVOICED)} invoiced of {fF(META.poNte)} NTE ({fP(NTE_PCT_USED)})</div>
              </div>
            </Card>
          </div>
        </div>}

        {tab === "Dispute Notice & Ledger" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
            <Card title="Draft Supplier Dispute Notice" note="Standard tone (default); draft only, never sent by this skill">
              <pre style={{ fontFamily: "Arial,sans-serif", fontSize: 12, lineHeight: 1.6, color: DK, whiteSpace: "pre-wrap", margin: 0 }}>{DISPUTE_NOTICE_PREVIEW}</pre>
            </Card>
            <Card title="Scope Reminder">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>This is a reflect-only, point-in-time audit of the two invoices supplied this session. It does not write to AP, an ERP, or Ariba, and it does not monitor future invoices from {META.supplierName}.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The user decides whether and how to send this notice. A new invoice batch requires a new audit run.</p>
            </Card>
          </div>
          <Card title="Portable Findings Ledger (JSON)" note="Copyable block, mirrors the .json deliverable">
            <div style={{ overflowX: "auto" }}>
              <pre style={{ background: DK, color: "#fff", fontSize: 10, lineHeight: 1.5, padding: 14, borderRadius: 6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(LEDGER_JSON, null, 2)}</pre>
            </div>
          </Card>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Reflect-only audit of the supplied invoice population. Not a system of record; does not monitor future invoices; does not write back to AP, an ERP, or Ariba.</div>
        <div>Eli Lilly and Company - Confidential | Invoice & Rate-Card Auditor | 2026</div>
      </div>
    </div>
  );
}
```
