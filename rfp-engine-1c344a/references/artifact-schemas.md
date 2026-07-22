# Artifact Schemas - RFP Engine

Required sections, columns, and structure for all outputs.

---

## 1. Invitation Email(s)

**Delivery:** Invitation emails are produced as labeled draft text. If an approved message-compose surface is available, the skill MAY open an unsent draft for user review; if it is unavailable, the email is emitted as Markdown/text for the user to copy into Outlook. Never sent automatically.

**When vendor contacts are provided:** One labeled draft per vendor, pre-filled with vendor name, contact name, and email address (opened as an unsent draft where a message-compose surface is available, otherwise emitted as text).

**When vendor contacts are NOT provided:** One labeled draft with `[Vendor Name]` / `[Vendor Contact]` placeholders.

**Required Content Elements:**
1. Subject line - RFP name, category, Lilly reference number
2. Salutation - addressed to vendor contact by name (or `[Vendor Contact]` placeholder)
3. Introduction - who Lilly is, purpose of the RFP, statement that vendor was pre-qualified
4. Category description - what is being sourced, scope summary
5. Participation instructions - how to confirm intent to respond, deadline, what to provide (confirmation, primary contact details, signed confidentiality acknowledgment)
6. RFP package contents - bulleted list of documents vendor will receive upon confirmation
7. Key dates - table or list: participation deadline, Q&A session, questions deadline, submission deadline, demo window, award target
8. Confidentiality notice - reference to effective agreement or attached acknowledgment
9. Contact restriction - all communications through procurement contact only, contact with other Lilly personnel prohibited
10. Primary procurement contact - name, title, organization, address, email

**Draft fields (used when a message-compose surface is available; otherwise rendered as text):**
- `kind`: `"email"`
- `summary_title`: `"RFP Invitation: [Category] | [Vendor Name]"` (or generic if no vendor contacts)
- `variants`: one variant labeled with vendor name (e.g., `"Kinaxis invitation"`) or `"Formal RFP invitation"` for generic
- `subject`: `"Invitation to Participate: [RFP/RFI] for [Category] | Eli Lilly and Company"`

**Tone:** Formal, non-preferential, professional.

---

## 2. RFP_Instructions.docx (or RFI_Instructions.docx)

**Purpose:** Supplier-facing instructions document. The authoritative source of truth for what Lilly is buying and how suppliers should respond.

**CRITICAL:** This document MUST be generated from the Lilly institutional template (`assets/lilly_rfx_template.js`). The template structure, section numbering, and boilerplate language are locked. See `references/lilly-rfx-template-spec.md` for the full specification and boilerplate text registry.

**Required Sections (RFP mode -- Section 0-3):**
1. Introduction & Background
   - Lilly business context (non-confidential)
   - Purpose of the RFP
   - Sourcing objectives
2. Scope of Work
   - In-scope capabilities
   - Out-of-scope (explicit)
   - Deployment model expectations
   - Integration requirements
3. RFP Process & Schedule
   - Reference to RFP_schedule.csv milestones
   - Q&A process and submission method
   - Proposal submission format and deadline
   - Demo/presentation expectations
4. Proposal Requirements
   - Required response sections (must map 1:1 to requirements_matrix.xlsx categories)
   - Required certifications and attachments
   - Pricing template instructions
   - Page limits (if applicable)
5. Evaluation Criteria
   - Category weights (%) - must match scoring matrix
   - Evaluation process description (do not disclose scoring details)
6. Terms & Conditions
   - Governing agreement reference (MSA or Lilly standard terms)
   - Confidentiality obligations
   - Right to reject / right to cancel
   - No commitment language
7. Supplier Questions
   - Q&A submission method and deadline
   - Statement that all Q&A responses distributed to all participants
8. Submission Instructions
   - Format (PDF + Excel pricing template)
   - Submission portal or email
   - File naming convention
9. Contacts
   - Primary procurement contact (from stakeholder roster)
   - Statement that all supplier communications go through procurement only

---

## 3. requirements_matrix.xlsx

**Purpose:** Structured requirements -- the canonical list of what Lilly needs. XLSX format with built-in data validation, conditional formatting, and locked structure.

**Required Columns:**

| Column | Description |
|--------|-------------|
| `Req_ID` | Unique identifier (e.g., REQ-001) |
| `Category` | Functional grouping (e.g., Security, Integration, Reporting) |
| `Subcategory` | Optional finer grouping |
| `Requirement` | Full requirement statement |
| `Priority` | Must Have / Should Have / Nice to Have |
| `Response_Format` | How supplier should respond: Meets Scale (5-tier) / Narrative / Yes-No / File Upload |
| `Evaluation_Weight` | Weight within category (%) -- must sum to 100% per category |
| `Source` | Where requirement came from (Business Stakeholder / Regulatory / Security / Landscape Analysis / Prior RFP) |
| `Supplier_Response` | Data validation dropdown: Meets OOB / Standard Config / Major Config / Vendor Customization / Does Not Meet |
| `Supplier_Comments` | Free-text with text wrapping preset |
| `Draft_Flag` | TRUE if requirement is draft/unvalidated |

**XLSX formatting rules:**
- Header row: locked, bold, light gray fill (#D9D9D9), auto-filter enabled
- `Supplier_Response` column: data validation dropdown list (5-tier scale)
- Conditional formatting on `Supplier_Response` (5-tier scale, no green per the suite no-green status-palette rule; each tier a distinct, uniquely-named hex): strong blue (#0F3A85 "Bold Blue", white text) for Meets OOB, light blue (#D4E5F7 "Pale Blue") for Standard Config, yellow (#FFF3CD "Amber") for Major Config, orange (#FFE0CC "Orange") for Vendor Customization, red (#FDE8E5 "Pale Red") for Does Not Meet
- `Supplier_Comments` column: text wrapping enabled, minimum width 300px
- Structure columns (Req_ID through Source): locked, light gray fill
- Supplier columns (Supplier_Response, Supplier_Comments): unlocked, white fill
- Sheet protection enabled with unlocked supplier columns only

**Minimum rows:** 20 requirements across at least 4 categories for a Full package. 10 requirements across at least 3 categories for a Brief package.

**Additive optional columns (present only when populated; base schema above is unchanged otherwise):**

| Column | Populated when | Description |
|--------|-----------------|-------------|
| `Dependencies` | The Stakeholder Requirements Synthesizer captured a dependency between requirements | `Depends on: [Req_ID]` - which other requirement must be met first |
| `Amendment_Ref` | RFP Q&A Consolidation issued an addendum that amended this row | Addendum number and date (for example, "Addendum 2, 2026-08-14") |

Testable acceptance conditions elicited by the Stakeholder Requirements Synthesizer are not a separate column: they are appended to the `Requirement` cell as a labeled clause ("Acceptance: ...") so the locked structure column count does not change when the synthesizer was not used.

---

## 4. RFP_schedule.csv

**Purpose:** Process milestone tracker - RFP timeline from release to award.

**Required Columns:**

| Column | Description |
|--------|-------------|
| `Milestone_ID` | Unique ID (e.g., M-01) |
| `Milestone` | Name (e.g., "RFP Release", "Q&A Deadline", "Proposals Due") |
| `Owner` | Lilly or Supplier |
| `Target_Date` | ISO date (YYYY-MM-DD) or relative offset (e.g., Day+14) |
| `Notes` | Any dependencies or conditions |

**Required Milestones (in order):**
1. RFP Release
2. Supplier Confirmation of Participation Deadline
3. Q&A Submission Deadline
4. Q&A Response Distribution
5. Proposal Submission Deadline
6. Evaluation Period (start-end)
7. Clarification / BAFO Round (if applicable)
8. Demo / Presentation Window (start-end)
9. Award Decision Target
10. Contract Execution Target

---

## 5. post_award_timeline.csv

**Purpose:** Implementation / onboarding timeline after contract execution.

**Required Columns:**

| Column | Description |
|--------|-------------|
| `Phase` | Implementation phase name |
| `Milestone` | Specific deliverable or checkpoint |
| `Owner` | Lilly / Supplier / Joint |
| `Lilly_Owner` | Specific Lilly role (from stakeholder roster if available) |
| `Duration` | Estimated duration (e.g., "2 weeks") |
| `Offset_From_Execution` | Weeks after contract execution |
| `Dependencies` | Prior milestones this depends on |
| `Notes` | Risk flags, assumptions |

**Standard Phases (adapt to domain):**
- Contracting & Onboarding
- Environment Setup / Provisioning
- Data Migration / Integration
- Configuration & Customization
- Testing (UAT)
- Training
- Go-Live
- Hypercare / Stabilization

---

## 6. demo_evaluation_guide.docx

**Purpose:** Lilly-internal evaluation guide for demo sessions. **Never distributed to vendors.** Vendor-facing demo content (scenarios, technical setup, presentation topics) lives in Section 4 of the RFP Instructions document.

**Required Sections:**
1. Evaluation Overview
   - Purpose of the evaluation guide
   - Relationship to RFP Instructions Section 4 (scenarios are there, scoring is here)
   - Confidentiality reminder (this document is internal only)
2. Evaluator Roster and Assignments
   - Table: Name, Title, Function, Scenarios Assigned, Scoring Focus
   - Populated from stakeholder_roster.csv (Demo_Attendance = Y)
3. Scoring Dimensions and Weights
   - Dimensions with percentage weights (must align with RFP Instructions Section 1.7 Evaluation Criteria)
   - Description of what each dimension measures
   - Per-scenario scoring focus (which dimensions are most relevant to each scenario)
4. Scoring Instructions
   - Independent scoring requirement (score before group discussion)
   - Scoring scale (0.0-5.0 with anchor descriptions: 5 = Fully Meets, 0 = Does Not Meet; the suite-canonical evaluation scale)
   - Submission method and deadline
   - What to document: strengths, weaknesses, open questions per scenario
5. Calibration Session Plan
   - When calibration occurs (after all vendor demos complete)
   - Facilitation approach
   - Consensus-building protocol
   - Tie-breaking rules
6. Q&A Protocol
   - When questions are permitted during demo
   - Who moderates
   - How questions and vendor responses are documented
   - Which questions are deferred to the formal Q&A process

**Design Rationale:** The prior `supplier_demo_prep.docx` mixed vendor-facing content (scenarios, setup instructions) with Lilly-internal content (scoring dimensions, evaluator assignments). This created a distribution risk (internal scoring criteria accidentally shared with vendors) and a duplication problem (scenarios described in both the demo prep and RFP Instructions Section 4). The split puts vendor-facing demo content where suppliers already look (the Instructions document) and keeps evaluation mechanics in a separate internal-only artifact.

---

## Section 4.2 Demo Scenarios (in RFP Instructions)

When Section 4.2 is active in the RFP Instructions document, demo scenarios must be written at full depth, not as stubs. Each scenario includes all fields from the scenario schema:

**Scenario Schema (rendered in Section 4.2 of Instructions):**

| Field | Content |
|-------|---------|
| Scenario_ID | S-01, S-02, etc. |
| Title | Short scenario name |
| Business Context | 2-5 sentences of realistic business context the vendor uses to frame the demonstration |
| Task | Specific actions the vendor must demonstrate, listed as lettered sub-items (a, b, c...) |
| Success Criteria | What Lilly evaluators are looking for, including specific capabilities, performance benchmarks, and UX expectations |
| Mapped Requirements | Requirement category and Req_ID range from the requirements matrix |
| Time Allocation | Minutes allocated for this scenario |

**Minimum 3 scenarios for any RFP with demos. Target 5-7 for full-scope platform evaluations.** Each scenario should test a different major requirement domain to ensure coverage across the requirements matrix.

**Technical Setup Requirements** (also in Section 4 of Instructions): What vendors must prepare in advance, environment requirements (live system vs. sandbox vs. slides only), connectivity and screen-share instructions, pre-demo readiness confirmation timeline.

---

## 7. pricing_template.xlsx

**Purpose:** Standardized pricing response template. All suppliers complete the same template to enable apples-to-apples comparison.

**Required Tabs:**

| Tab | Content |
|-----|---------|
| `Instructions` | How to complete the template; what's mandatory |
| `Commercial_Summary` | Year-by-year total cost summary (formula-driven from detail tabs) |
| `License_Subscription` | Per-unit pricing, volume tiers, escalator caps |
| `Implementation_Services` | Phase-by-phase services pricing with role/rate breakdown |
| `Volume_Scenarios` | Pricing at 3 volume levels (Base, +25%, +50%) |
| `Assumptions` | Free-text assumptions that affect pricing |
| `Exclusions` | What is NOT included in quoted price |

**Domain-specific tabs** (add as appropriate): see `pricing-templates.md`.

---

## 8. stakeholder_roster.csv

**Purpose:** Tracks Lilly-side evaluation team - who evaluates, who attends demos, who approves.

**Required Columns:**

| Column | Description |
|--------|-------------|
| `Name` | Full name (or [Name] if not yet collected) |
| `Title` | Job title |
| `Function` | Business unit / function (e.g., Procurement, IT, Legal) |
| `Evaluation_Focus` | Which requirement categories this person evaluates |
| `Demo_Attendance` | Y / N |
| `Approval_Authority` | Y / N |
| `Notes` | Availability constraints, proxy instructions |

---

## 9. case_handoff.json

**Purpose:** Structured payload for rfp-case-manager to initialize or update the case file. If a Microsoft Team is bound, rfp-case-manager maps artifacts to the existing Teams/SharePoint structure. It does not provision Teams sites, create SharePoint folders, move files, send notifications, or return a live case URL.

See `case-handoff-schema.md` for full schema.

---

## 10. [RFP|RFI]_Addendum_[N].docx

**Purpose:** Formal, supplier-facing amendment produced by RFP Q&A Consolidation once a Q&A batch is confirmed. N increments per addendum issued for a given RFP/RFI. Styled from `docx-design-system.md` (Calibri, Lilly Red / Bold Blue / Bold Brown palette, branded title treatment, no green) - the same institutional look as the Instructions document, but its own document, not a re-run of `assets/lilly_rfx_template.js`.

**Required Sections:**
1. Header block - RFP/RFI name and reference number, addendum number, issue date, precedence statement (this addendum takes precedence over any conflicting prior RFP language)
2. Section A - Clarifications - non-binding, informational; question theme, consolidated question text (no supplier attribution), answer
3. Section B - Formal Amendments - binding changes only: what is superseded, added, or deleted; affected `Req_ID`(s); revised requirement text or term; effective date
4. Section C - Affected Requirements Cross-Reference - table: `Req_ID`, Original Text or Term, Revised Text or Term, Addendum Section reference
5. Distribution and contact statement - confirms simultaneous distribution to all participating suppliers; single-point-of-contact language consistent with the Instructions document

**Rule:** A requirement-changing answer is never issued to suppliers as an informal Q&A response alone. It reaches suppliers only through this document, so every supplier receives the identical binding change at the same time.

---

## 11. qa_log.xlsx

**Purpose:** Lilly-internal durable record of every supplier question raised during the Q&A window and how it was resolved. Distinct from the addendum: the addendum is the formal, supplier-facing amendment; this log is the internal working record and is never distributed to vendors.

**Required Columns:**

| Column | Description |
|--------|-------------|
| `Group_ID` | Unique group identifier (e.g., QG-01) |
| `Tags` | Theme(s): Scope/Technical, Pricing/Commercial, Contractual/Legal, Timeline/Deliverables, Evaluation/Scoring, Submission Process, Miscellaneous |
| `Type` | Clarification or Scope-Negotiation |
| `Grouped_Questions` | The consolidated/merged question text (no supplier attribution in the vendor-facing view; internal log may retain attribution for traceability) |
| `Drafted_Answer` | The consolidated answer as issued or drafted |
| `Requirement_Changing` | Y / N |
| `Affected_Req_IDs` | `Req_ID`(s) from `requirements_matrix.xlsx`, if any |
| `Addendum_Reference` | Addendum number and date that formalized this group, if applicable |
| `Status` | Draft / Distributed / Superseded |

---