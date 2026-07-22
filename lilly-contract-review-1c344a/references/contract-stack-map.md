# Contract Stack Mapper: Content Spec, DOCX Layout, and Manifest Schema

Reference module for `lilly-contract-review`, Step 0.5. Loaded only when `output_mode` is `Stack Map only`, or when a stack map is requested alongside another mode. This file defines what the Governing Document Stack Map (.docx) and Governing Document Manifest (.json) must contain, how the DOCX is laid out, and the manifest's schema.

## Purpose and Non-Duplication

This mode exposes Layer 1 (Governing Document Discovery, Step 0/Phase 0A-0B) as a standalone, reusable artifact. It answers "what governs this, how are these documents related, and is anything missing" -- a structural question -- not "is this safe to sign, and what should we redline" -- the substantive question the four review modes (Full review, Redline only, Dashboard only, Briefing only) answer.

**This mode never produces:** playbook findings, tracked changes or comments, a Protection Score, risk tiers, position cards, concession strategy, SME escalation routing, or a Go/No-Go recommendation. If the working notes start to contain any of those, stop -- that is Steps 1-6 leaking into a mode that does not run them. Point the user at Full review, Redline only, Dashboard only, or Briefing only for that analysis.

**This mode is not the Documents dashboard sub-tab.** The Documents sub-tab (`dashboard-canonical.md` v3.2, Panel 1) is a records-management register: what documents exist, their retention class, and whether required compliance evidence has been filed. This mode is a structural and legal-hierarchy analysis: what governs what, what supersedes what, where the family conflicts with itself, and what is missing from it. The two are complementary and never merge; a dashboard-producing run still gets the Documents sub-tab exactly as specified, unchanged.

## Inputs and Partial Families

Unlike the substantive review (one document under review against a governing baseline), this mode maps a document FAMILY. The family can include, in any combination and any completeness: the MSA/master agreement, addenda/exhibits, a DPA or BAA, amendments, SOWs/WOs/COs/order forms, and referenced standards (AI Standard, InfoSec Standard, Supplier Privacy Standard, or supplier-published terms referenced by URL). A partial family is a valid, expected input, not a blocking condition -- an incomplete family is exactly what "Missing Incorporated Documents" (item 6 below) is built to surface. Never withhold the map because the family is incomplete; map what was provided and name every gap.

## Content Spec

Produce all nine items below. Each carries the same VERIFIED / ASSUMED / NOT REVIEWED labeling used everywhere else in this skill (Anti-Drift Rules 1 and 3): VERIFIED means the relationship was read and confirmed in the document text; ASSUMED means it was inferred from a title, filename, exhibit letter, or context clue but not confirmed by reading the actual incorporation language; NOT REVIEWED means the document is referenced but was not provided. Never upgrade an ASSUMED or NOT REVIEWED item to VERIFIED without having actually read the confirming text.

### 1. Document Hierarchy Map

A tree showing what governs what, root-down: MSA/master agreement at the top, addenda/exhibits and the DPA/BAA as direct children (they modify or extend the MSA, they do not stand alone), amendments shown against the specific document they amend, and SOWs/WOs/COs/order forms as children of the MSA (and, where an addendum specifically governs that order type, as children of the addendum instead). Referenced standards (AI Standard, InfoSec Standard) that are incorporated by reference but not amendments in their own right are shown as a distinct "incorporated standards" branch, not nested under amendments.

```
GOVERNING DOCUMENT HIERARCHY -- [Supplier Name]
────────────────────────────────────────────────────────
[MSA Name] (executed [date], MPT [version if Lilly paper])
 ├─ Exhibit A: Definitions [VERIFIED]
 ├─ Exhibit C: AI Standard [VERIFIED]
 ├─ Amendment No. 1 ([date]) -- modifies Section [N] [VERIFIED]
 │   └─ Amendment No. 2 ([date]) -- modifies Amendment No. 1 Section [N] [VERIFIED]
 ├─ IT Professional Services Addendum [VERIFIED]
 │   └─ SOW-2024-014 ([date]) [VERIFIED]
 │   └─ SOW-2025-002 ([date]) [ASSUMED -- title indicates it pairs with this Addendum, incorporation clause not read]
 ├─ DPA / BAA: [status -- Executed/Pending/None] [VERIFIED or NOT REVIEWED]
 └─ Order Form [OF-2025-08] [NOT REVIEWED -- referenced in SOW-2025-002 Section 2.1, not provided]
────────────────────────────────────────────────────────
```

Cross-check the shape of the tree against `references/lilly-templates.md`'s template hierarchy when the family is, or pairs with, Lilly paper (MSA/Addenda/Transaction Documents/Standalone Agreements). For supplier paper, build the tree from the documents' own incorporation language ("subject to," "governed by," "incorporated herein by reference," "as defined in the Master Agreement") rather than assuming a Lilly-shaped structure.

### 2. Effective Dates

One row per document: execution date, effective date (if different from execution), term, and expiration or next-renewal date where stated. Do not calculate a renewal date the document itself does not state or derive from an unstated formula; if the term is "co-terminous with the MSA" or similar, say so rather than computing a number.

```
EFFECTIVE DATES -- [Supplier Name]
Document              Executed      Effective     Term              Expires / Renews
MSA                   2023-03-01    2023-03-01    3 years           2026-03-01 (auto-renews 1yr unless 90-day notice)
Amendment No. 1        2024-06-15    2024-06-15    N/A (amends MSA) N/A
SOW-2024-014           2024-07-01    2024-07-01    12 months         2025-07-01
SOW-2025-002           2025-02-10    2025-03-01    Co-terminous with MSA   2026-03-01
```

### 3. Superseded Provisions

Where a later document replaces specific provisions of an earlier one. Name the topic, the prior text's location, the current controlling location, and what actually changed -- not just that a change occurred.

```
SUPERSEDED PROVISIONS
Topic                Prior (superseded)              Current (controls)              What Changed
Liability Cap        MSA Section 12.1 (1x fees)       Amendment No. 1 Section 3 (2x fees)   Cap doubled
Payment Terms        MSA Section 8.2 (Net-30)         Amendment No. 2 Section 1 (Net-45)    Aligned to Lilly standard
```

### 4. Amendment Relationships

The chain of amendments resolved to CURRENT cumulative terms, not a flat date list. If Amendment 2 amends Amendment 1 (not the base MSA directly), show that nesting and state the net current position after both are applied.

```
AMENDMENT CHAIN -- [Base Document]
Amendment No. 1 (2024-06-15): amends MSA Section 3 (Liability Cap: 1x -> 2x fees)
  └─ Amendment No. 2 (2025-01-20): amends Amendment No. 1 Section 3 (Liability Cap: 2x -> 3x fees, data-breach carve-out added)
CUMULATIVE CURRENT POSITION: Liability Cap = 3x fees, with an uncapped carve-out for data breach (per Amendment No. 2; supersedes both the MSA's original 1x cap and Amendment No. 1's 2x cap).
```

### 5. Conflicting Provisions

Apply the same order-of-precedence resolver used in the substantive review's "Order Form / Governing Agreement Assessment" section, but across the WHOLE family rather than one document under review at a time. For every topic addressed differently in two or more documents: which instrument controls under the family's own precedence clause, and whether the conflict is harmless (the controlling document is stronger, no action needed), a silent downgrade (a lower-precedence document weakens a protection a reader might not realize is overridden), or a genuine ambiguity (no precedence clause resolves it, needs an explicit statement added).

```
CONFLICTING PROVISIONS
[C1] SLA Uptime: WO-2025-002 states 98%; MSA Exhibit B Section 4.1 states 99.50%.
     Controls: MSA Exhibit B (per MSA Section 1.3 order of precedence: Exhibit > WO).
     Type: Silent downgrade -- the WO's 98% reads as the deal but is unenforceable; net enforceable position is 99.50%. Recommend the WO not restate a weaker number.

[C2] Data Retention: MSA Section 9.4 requires destruction within 30 days of termination; DPA Section 6.2 states 60 days.
     Controls: Ambiguous -- no precedence clause in either document resolves DPA-vs-MSA conflicts on this topic.
     Type: Genuine ambiguity -- recommend an explicit precedence statement be added at the next amendment.
```

### 6. Missing Incorporated Documents

Every document, exhibit, or standard referenced by name, letter, or URL anywhere in the family but not provided or found. This is the single most load-bearing output of this mode for a rep who suspects the file handed to them is incomplete.

```
MISSING INCORPORATED DOCUMENTS
[M1] "Exhibit C: AI Standard" -- referenced in MSA Section 4.2, Order Form OF-2025-08 Section 1.1. NOT PROVIDED.
     Risk: AI governance terms for OF-2025-08 cannot be confirmed; OF references an AI-driven feature.
[M2] "DPA" -- referenced in MSA Section 9.1 ("as further detailed in the Data Processing Addendum"). NOT FOUND in provided family.
     Risk: Data protection terms for the whole family rest on an unreviewed document.
```

### 7. Governing Term Map (per service/order)

For every SOW/WO/CO/order form in the family, which document and section actually governs each key term for that specific order, and whether the order-level paper overrides anything it should not.

```
GOVERNING TERM MAP -- SOW-2025-002
Term              Governed By                    Overridden at Order Level?
Pricing           SOW-2025-002 Section 3          N/A (order-specific by design)
Liability Cap      MSA Section 12.1 (as amended)  No -- SOW is silent, MSA controls
Data Terms         DPA Section 4 [NOT REVIEWED]   Unknown -- DPA not provided
Termination        MSA Section 15                 SOW Section 8 adds a 30-day transition obligation (additive, not a conflict)
IP Ownership        MSA Section 11 (Work Product)   No -- SOW deliverables fall within MSA's Work Product definition
```

### 8. Renewal/Termination Relationships

How termination of the MSA affects in-flight SOWs/WOs, how each order's term and renewal relate to the MSA term, whether ending one order affects others, and any auto-renewal triggers across the family.

```
RENEWAL / TERMINATION RELATIONSHIPS
MSA: 3-year term, auto-renews 1 year absent 90-day written notice (Section 2.1).
  If MSA terminates: Section 2.3 states in-flight SOWs survive termination through their own stated term
  unless terminated separately -- SOW-2024-014 and SOW-2025-002 are NOT automatically terminated by MSA termination.
SOW-2024-014: independent 12-month term, does not affect SOW-2025-002 if terminated separately.
SOW-2025-002: co-terminous with MSA -- if the MSA does not renew, this SOW expires with it (no independent survival clause found).
```

### 9. Definitions Reused Across Documents

A family-wide inventory of key defined terms, extending `references/definition-tracing-checklist.md` from a single WO-scope classification (used in a substantive review, where the question is "does this WO's data fall inside or outside the definition") into a cross-document consistency check (used here, where the question is "is the definition itself stable across the family"). Trace at minimum: Confidential Information, Work Product, Lilly Information, Usage Data, and any others the family's own documents define; add AI/data-specific terms (Automated System, Lilly Automated Property, Services Supportive Technology) when an AI Standard or similar exhibit is in the family.

```
DEFINITIONS REUSED ACROSS DOCUMENTS
Term                     Defined In                          Consistent?
Confidential Information MSA Exhibit A Section 1.1            Yes -- no other document in the family redefines it
Work Product             MSA Exhibit A Section 1.4;            No -- SOW-2025-002 Section 9 uses "Deliverables" as if
                          SOW-2025-002 Section 9 (undefined)    synonymous with Work Product without cross-referencing
                                                                 the MSA definition. Drift risk: SOW usage is narrower
                                                                 on its face than the MSA's broader Work Product scope.
Lilly Information        MSA Exhibit A Section 1.7;            Yes -- AI Standard explicitly cross-references the MSA
                          AI Standard Section 2.1 (cross-ref)    definition rather than restating it
```

## DOCX Design (Governing Document Stack Map)

Magazine Report house style, per the shared `docx-design-system.md` and `docx-title-page-spec.md` (Lilly Red `#E1251B`, Bold Blue `#0F3A85`, Bold Brown `#521207`, Neutral Stone `#E4EBF1`, Calibri throughout). Do not invent a different palette or component set for this deliverable; it belongs in the same visual family as the review summary.

**Title page:** Lilly logo (Black or Red variant), title "GOVERNING DOCUMENT STACK MAP", subtitle with supplier name and document count (e.g., "[Supplier Name] -- 7 Documents Mapped, 2 Missing"), horizontal Lilly Red rule, scope line ("[N] documents provided | [N] referenced but missing | [N] conflicts identified"), prepared-by line, confidential notice. Same layout mechanics as the review summary title page.

**Section badges (01-09):** one numbered section per content-spec item above, in document order: 01 Document Hierarchy Map, 02 Effective Dates, 03 Superseded Provisions, 04 Amendment Relationships, 05 Conflicting Provisions, 06 Missing Incorporated Documents, 07 Governing Term Map, 08 Renewal/Termination Relationships, 09 Definitions Reused Across Documents. Same badge treatment as the review summary (Bold Brown rounded number badge, Bold Blue section title).

**KPI row (page 1, below title):** Documents Mapped, Documents Missing, Conflicts Found, Definitions with Drift -- same 4-card KPI treatment as the review summary's Protection Score row, colored Lilly Red for the Missing and Conflicts counts when non-zero, Bold Blue when zero.

**Hierarchy tree (Section 01):** render as a single-column table with monospace or consistently indented text preserving the tree structure from the content spec above; do not attempt to force it into a multi-column table that loses the nesting.

**Tables (Sections 02-09):** standard data-table treatment (Bold Brown header row, white text, alternating Neutral Stone body rows) exactly as specified in `docx-design-system.md`. The Missing Incorporated Documents and Conflicting Provisions sections use the risk-callout tint (Neutral Rose background) for any row representing an unresolved gap or an unresolved ambiguity, consistent with the suite's status palette.

**Narrative requirement:** per the shared narrative standards, every section opens with 1-2 sentences of connected prose before its table (what this section covers for this specific family, and why it matters), not a raw table with no lead-in. A stack map that is only tables is incomplete.

**Closing section:** a short "What this map does not tell you" note pointing to Full review / Redline only / Dashboard only / Briefing only for the substantive legal analysis of the terms this map has located, so the reader never mistakes the structural map for a legal opinion.

## Manifest JSON Schema (Governing Document Manifest)

Machine-readable sidecar mirroring the DOCX content, generated from the same working notes, not authored separately (same principle as the Findings ledger). Never let the manifest and the DOCX disagree; if they do, fix the data, not just one of the two files.

```json
{
  "supplier": "string",
  "family_name": "string",
  "as_of_date": "YYYY-MM-DD",
  "documents": [
    {
      "id": "D1",
      "title": "string",
      "type": "MSA | Amendment | Addendum/Exhibit | SOW | WO | CO | Order Form | DPA | BAA | Standard | CDA | Other",
      "status": "Provided | Referenced-Not-Provided",
      "execution_date": "YYYY-MM-DD or null",
      "effective_date": "YYYY-MM-DD or null",
      "term": "string or null",
      "expiration_or_renewal_date": "YYYY-MM-DD or null",
      "governed_by": ["D-id of parent/governing document, empty array if this document is the root"],
      "verification": "VERIFIED | ASSUMED | NOT_REVIEWED"
    }
  ],
  "hierarchy_edges": [
    { "parent": "D-id", "child": "D-id", "relationship": "governs | amends | incorporates" }
  ],
  "superseded_provisions": [
    { "topic": "string", "prior_document": "D-id", "prior_section": "string", "current_document": "D-id", "current_section": "string", "what_changed": "string", "verification": "VERIFIED | ASSUMED" }
  ],
  "amendment_chain": [
    { "amendment_id": "D-id", "amends": "D-id", "sections_modified": ["string"], "cumulative_effective_terms": "string" }
  ],
  "conflicts": [
    { "topic": "string", "documents_in_conflict": ["D-id"], "controlling_document": "D-id", "controlling_basis": "string", "conflict_type": "harmless | silent_downgrade | ambiguous", "narrative": "string" }
  ],
  "missing_documents": [
    { "referenced_as": "string", "referenced_in": "D-id", "referenced_section": "string", "status": "Not Provided | Not Found", "risk": "string" }
  ],
  "governing_term_map": [
    { "order_document": "D-id", "term": "Pricing | Liability Cap | Data Terms | Termination | IP | Other", "governed_by": "D-id", "section": "string", "overridden_by_order": true, "note": "string" }
  ],
  "renewal_termination": [
    { "document": "D-id", "term_relationship_to_msa": "string", "auto_renewal": true, "notice_days": 90, "termination_cascade": "string" }
  ],
  "definitions": [
    { "term": "string", "defined_in": ["D-id"], "consistent": true, "drift_note": "string or null" }
  ],
  "coverage_summary": {
    "documents_mapped": 0,
    "documents_missing": 0,
    "conflicts_found": 0,
    "definitions_with_drift": 0
  }
}
```

`coverage_summary` counts MUST equal the length of the corresponding arrays (`documents_missing` = count of `missing_documents`, `conflicts_found` = count of `conflicts`, `definitions_with_drift` = count of `definitions` where `consistent` is `false`); if they do not foot, fix the count, not the array. This is the same single-source-of-truth discipline the findings ledger applies to `risk_score`.

## Gate Check (before presenting the map)

- [ ] Every document in `documents` was either read (VERIFIED) or explicitly marked ASSUMED/NOT_REVIEWED -- no silent upgrades
- [ ] The hierarchy tree and `hierarchy_edges` describe the same structure (DOCX and manifest do not disagree)
- [ ] Every conflict in Section 05 states which document controls and cites the precedence basis, not just that a conflict exists
- [ ] Every missing document names where it was referenced (document + section), not just that something is missing
- [ ] Every order-level document (SOW/WO/CO/OF) in the family has a Governing Term Map entry
- [ ] `coverage_summary` counts foot to the arrays
- [ ] No finding, redline instruction, Protection Score, or negotiation position appears anywhere in the output (Steps 1-6 did not leak in)
- [ ] The closing note points to the correct substantive-review mode for legal analysis of the located terms

---
