# Lilly Universal RFI/RFP Instructions Document Template

## Source

Synthesized from 7 historical Lilly RFI/RFP instructions documents (2019-2024) spanning IT Procurement, HR, Supply Chain, Discovery Chemistry, and Commercial Learning. Represents the institutional standard for supplier-facing sourcing communications.

## Design Principle

**One unified structure for both RFI and RFP.** The skeleton is identical. The difference is content depth and which optional sections are active. The skill determines which optional sections to include by (1) auto-inferring from context, or (2) asking the user once.

---

## Section Map

Legend: **CORE** = always included. **OPT** = optional, governed by inclusion rules below.

```
FRONT MATTER
  Title Page                                          CORE
  Table of Contents                                   CORE
  Revision History                                    CORE
  Glossary / Definitions                              CORE

SECTION 0: PREFACE
  0.1  Overview                                       CORE
  0.2  Contact Information                            CORE
  0.3  Resources and Help Guides                      CORE
  0.4  Copyright                                      CORE
  0.5  Confidentiality Notice                         CORE

SECTION 1: BACKGROUND & INSTRUCTIONS
  1.1  Background                                     CORE
  1.2  Definitions                                    CORE
  1.3  Response Expectations                          CORE
  1.4  Supporting Documents                           CORE
  1.5  Timeline                                       CORE
  1.6  Questions and Q&A                              CORE
  1.7  Evaluation Criteria                            OPT

SECTION 2: SERVICE REQUIREMENTS & SPECIFICATIONS
  2.1  Current Environment                            OPT
  2.2  Project Objectives / Desired Future State      CORE
  2.3  Requirements                                   CORE
  2.4  Data and Integration Landscape                 OPT
  2.5  Information Security Requirements              OPT
  2.6  Supplier Diversity Expectations                OPT

SECTION 3: CONTRACTING & COMMERCIAL PRINCIPLES
  3.1  Contracting                                    OPT-SECTION
  3.2  Pricing & Commercial Principles                OPT-SECTION
  3.3  Service Levels / Credits                       OPT
  3.4  Protocol                                       OPT-SECTION
  3.5  No Implied Offer                               OPT-SECTION

SECTION 4: PRESENTATION & DEMO GUIDANCE
  4.1  Presentation Topics                            OPT-SECTION
  4.2  Demo Scenarios                                 OPT
  4.3  Additional Questions for Presentation          OPT
```

**OPT-SECTION** means the entire section is optional, but if the section is included, all OPT-SECTION subsections within it are included together as a unit. Individual OPT subsections within an active section can still be toggled independently.

---

## Optional Section Inclusion Rules

### Auto-Include (infer from context, no user prompt needed)

| Section | Auto-Include When |
|---------|-------------------|
| 1.7 Evaluation Criteria | RFP mode AND user has not said "do not disclose weights" |
| 2.1 Current Environment | User mentions replacing, migrating, upgrading, or augmenting an existing system or process |
| 2.4 Data & Integration | Sourcing domain is technology, software, SaaS, or platform |
| 2.5 InfoSec Requirements | Any cloud, SaaS, data processing, AI/ML, or regulated data scenario |
| 2.6 Diversity Expectations | User mentions diversity, or category historically has diversity targets |
| 3 (entire section) | RFP mode |
| 3.3 Service Levels | SaaS, managed services, outsourcing, or any recurring-service sourcing |
| 4 (entire section) | Timeline includes a demo, presentation, or proof-of-concept milestone |
| 4.2 Demo Scenarios | RFP mode AND demos are in the timeline |
| 4.3 Additional Questions | Professional services, lab services, or CRO sourcing (where deep operational Q&A is standard) |

### Ask-the-User (cannot infer, prompt once)

After determining RFI/RFP mode and Brief/Full package, present any sections whose inclusion is ambiguous as a single consolidated prompt:

> "A few optional sections I can include based on your sourcing context. Which of these apply?"
>
> - **Current Environment** -- there is an existing system/process being replaced or augmented
> - **Data & Integration Landscape** -- the solution will integrate with Lilly systems (SAP, Ariba, SuccessFactors, etc.)
> - **Information Security Requirements** -- the solution will process, store, or transmit Lilly data
> - **Supplier Diversity Expectations** -- this category has diversity spend goals
> - **Contracting & Commercial Principles** -- you want to signal commercial expectations in the RFI (auto-included for RFP)
> - **Presentation / Demo Guidance** -- you plan to have suppliers present or demonstrate
> - **Evaluation Criteria** -- you want to disclose evaluation category weights to suppliers

Only show options that were NOT already auto-included. If all options were auto-resolved, skip this prompt entirely.

---

## Section Specifications

### FRONT MATTER

#### Title Page
```
[Project Name]
Request for [Proposal | Information] ([RFP | RFI])
Eli Lilly and Company
[Date]
[Business Unit / Function] (optional)
```

#### Revision History
| Version | Date | Revision Details | Revised By |
|---------|------|------------------|------------|

#### Glossary
| Term | Definition |
|------|------------|

---

### SECTION 0: PREFACE

#### 0.1 Overview
> "This document provides suppliers bidding on this project with information on the scope of the service and instructions/guidance on how to provide a response to Lilly."

#### 0.2 Contact Information
```
Please limit communication regarding this [RFI | RFP] to the Lilly Procurement Contact
below or through the Ariba Sourcing Portal. You may be disqualified if this information
is inappropriately dispersed or shared.

[Procurement Contact Name]
[Title]
[Organization]
Lilly Corporate Center Indianapolis, IN 46285
[Email]
[Phone] (optional)
```

#### 0.3 Resources and Help Guides
```
For help related to system access in Ariba, please rely on the links below available
within Lilly's Supplier website or contact Lilly Procurement's Support Desk provided
on the Supplier website.

https://www.lilly.com/suppliers/supplier-resources
https://www.ariba.com/support/supplier-support
```

#### 0.4 Copyright
> "This document is copyright and contains proprietary information of Eli Lilly and Company and as such shall not be reproduced or disclosed to a third party without the prior written consent of Lilly.
>
> Lilly assumes no responsibility for any errors that may appear in this document.
>
> Copyright (c) [YEAR] Eli Lilly and Company
> All Rights Reserved"

#### 0.5 Confidentiality Notice
> "CONFIDENTIALITY NOTICE: This [RFI | RFP] from Eli Lilly and Company (including all attachments) is for the sole use of the intended recipient(s) and contains confidential and privileged information. Any unauthorized review, use, disclosure, copying, or distribution is strictly prohibited. In addition, all [RFI | RFP] content is expected to be treated in accordance with the confidentiality provisions of the effective master agreement."

---

### SECTION 1: BACKGROUND & INSTRUCTIONS

#### 1.1 Background
**Paragraph 1 -- Lilly boilerplate** (update figures annually):
> "Eli Lilly and Company ("Lilly") is a global pharmaceutical company headquartered in Indianapolis, IN, U.S.A. [Current revenue figure], with products marketed in more than 120 countries. With a heritage of over 145 years, our mission is to make medicines that help people live longer, healthier, more active lives.
>
> Our businesses include diabetes and obesity, oncology, immunology, and neuroscience. Lilly has over [employee count] employees, approximately [percentage] of which are located outside the United States. Lilly also employs a wide range of contract labor supporting various business areas."

**Paragraph 2+ -- Project-specific context.** This is the primary section that varies between sourcing events. Describe the business need, problem statement, and what Lilly is looking for.

#### 1.2 Definitions
Table of project-specific terms and acronyms. If a Glossary already appears in front matter, this can cross-reference it or add project-specific terms only.

#### 1.3 Response Expectations
Describes what suppliers must submit and in what format.

**RFP approach (table format):**

| Document Type & Count | Response Description | Format |
|-|-|-|

Standard components (mark REQUIRED or OPTIONAL):
- REQUIRED: Master Service Agreement / applicable addendum
- REQUIRED: Solution Pricing Quotes
- REQUIRED: Requirements Document (completed spreadsheet)
- REQUIRED: Technical Diagram(s)
- REQUIRED: Implementation Plan and Approach
- OPTIONAL: Supplemental Information

**RFI approach (bulleted list):**
- Executive Summary (max 2 pages)
- General description of proposed solution
- Responses to requirements spreadsheet
- Licensing and pricing metrics
- List pricing with typical discount levels
- Implementation support and training overview
- Product roadmap and vision
- Support model description
- Customer case studies (2, similar scale)

The skill selects the appropriate format based on RFI/RFP mode and adapts the component list to the sourcing domain.

#### 1.4 Supporting Documents
Lists all documents in the sourcing package:

| Document | Description |
|----------|-------------|
| [RFI/RFP] Instructions | This document |
| Requirements | Requirements spreadsheet |
| [Additional documents] | [Descriptions] |

#### 1.5 Timeline

| Milestone | Date |
|-----------|------|

Standard milestones (include all that apply):
1. Release [RFI | RFP]
2. Supplier Intent to Respond Due
3. Questions Close / Q&A Session
4. Q&A Response Distribution
5. Proposals / Responses Due
6. Lilly Evaluations
7. Supplier Follow-Ups / Clarifications
8. Customer Reference Calls
9. Supplier Presentations / Demos
10. Negotiations
11. Vendor Selection
12. Contract Execution
13. Project Start

For RFI, typically milestones 1, 3, 5, 9 plus "Further steps will be defined at this point."
For RFP, typically all milestones.

Include note:
- RFI: "Please note these timescales are indicative and not a commitment to complete the process in this timescale."
- RFP: "Responses must be submitted by [Time] on [Date] in Lilly's Ariba tool."

#### 1.6 Questions and Q&A
> "There will be an opportunity for all suppliers to join a [duration] Question & Answer session via [Teams | WebEx] on [date and time]. Dial-in information will be shared with each individual supplier contact via email.
>
> Please utilize this time to test your understanding of our requirements and ask clarifying questions. Each supplier will receive an anonymous ID prior to the call, and you are encouraged to use this ID during the call to promote candid discussion.
>
> All further inquiries and questions after the Q&A meeting must be submitted via email or Ariba to the [RFI | RFP] Contact no later than [date and time]. Any questions that the Lilly team can answer will be sent to all [RFI | RFP] participants."

For simpler sourcing events (especially RFI), a shorter variant is acceptable:
> "Any questions relating to the project must be submitted via the eSourcing tool (Discussion section) and can be submitted at any time up to the Questions Close date. Answers may be shared with all suppliers if relevant."

#### 1.7 Evaluation Criteria (OPTIONAL)
Discloses the evaluation category weights so suppliers understand what Lilly values most.

| Evaluation Category | Weight |
|---------------------|--------|
| [e.g., Functional Fit] | [X]% |
| [e.g., Technical Architecture] | [X]% |
| [e.g., Pricing & Commercial] | [X]% |
| [e.g., Implementation Approach] | [X]% |
| [e.g., Company Viability & References] | [X]% |

Note: "Evaluation methodology details are not disclosed. Weights reflect relative importance to Lilly's decision."

---

### SECTION 2: SERVICE REQUIREMENTS & SPECIFICATIONS

#### 2.1 Current Environment (OPTIONAL)
Describes what exists today: current systems, processes, pain points, volumes, user counts. Gives suppliers context for proposing a solution.

#### 2.2 Project Objectives / Desired Future State
What Lilly wants to achieve. Bulleted list of specific, measurable objectives.

#### 2.3 Requirements
Requirements category overview table:

| Requirement Category | Definition |
|---------------------|------------|

For RFP, include the standard Lilly 5-tier response scale:
- Meets out of the box
- Meets with Standard Configuration
- Meets with Major Configuration
- Meets with Vendor Customization
- Does Not Meet

(Full text of each tier is in the Boilerplate Text Registry below.)

For RFI, a simpler instruction: "Please respond to each requirement in the attached spreadsheet with a description of how your solution addresses it."

Always reference the separate requirements spreadsheet. Note: "It is important that you do not add or insert rows within the requirements response spreadsheet."

#### 2.4 Data and Integration Landscape (OPTIONAL)
Describes Lilly's technology environment relevant to the sourcing:
- Key systems the solution must integrate with (SAP, Ariba, SuccessFactors, Workday, etc.)
- Data flows and expected integration points
- Authentication requirements (SSO, Okta/Entra)
- Data residency or sovereignty requirements

#### 2.5 Information Security Requirements (OPTIONAL)
High-level summary of Lilly's InfoSec expectations before the detailed questionnaire:
- Data classification level
- Required certifications (SOC 2 Type II, ISO 27001, etc.)
- Key areas: data security and privacy, access control, audit and accountability, secure integration, resilience, secure development, incident response, compliance
- Reference to the separate InfoSec questionnaire

> "Lilly Information Security Standard is non-negotiable. A detailed security questionnaire will be provided separately. Suppliers should be prepared to provide evidence of their security posture including certifications, audit reports, and incident response capabilities."

#### 2.6 Supplier Diversity Expectations (OPTIONAL)
> "Lilly is committed to supplier diversity and inclusion. [Category-specific diversity goals or expectations]. Suppliers are encouraged to include information about their diversity certifications, subcontracting plans with diverse suppliers, and commitment to diverse hiring practices."

---

### SECTION 3: CONTRACTING & COMMERCIAL PRINCIPLES (OPTIONAL SECTION)

Auto-included for RFP. For RFI, include when the user wants to signal commercial expectations early.

#### 3.1 Contracting
> "All suppliers will be required to agree to a [Master Service Agreement with SaaS Addendum | Master Professional Services Agreement | applicable agreement type] with Lilly to be awarded the business."
>
> - The master set of terms will be contracted with Eli Lilly and Company (the US parent company).
> - Pricing for the services will be in USD.
> - Irrespective of any existing master agreement, payment terms are 60 days from date of receipt of a valid invoice.
> - Invoicing will be through Lilly's e-invoicing system: Ariba.
> - Lilly Information Security Standard, Supplier Privacy Standard, and Anti-Bribery Policies are non-negotiable. They can also be found in the Supplier Resources section on www.lilly.com/suppliers.

#### 3.2 Pricing & Commercial Principles
> - Lilly seeks a supplier who can meet the requirements at the most competitive price and provide a basis for future expansion.
> - Pricing must separately show any one-time charges, recurring charges, training, support/maintenance, and professional services costs.
> - Pricing for additional/optional modules that Lilly may require should be shown.
> - List and discounted price, including all units of measure, must be shown.
> - A proposed/typical project timeline for implementation should also be included.

#### 3.3 Service Levels / Credits (OPTIONAL within section)
> "Please include any information about Service Levels/Credits in terms of service/platform uptime and response/resolution of reported faults."

Include for SaaS, managed services, outsourcing. Omit for one-time purchases, professional services engagements, or equipment.

#### 3.4 Protocol
> "The Supplier must comply fully with the engagement protocols and terms and conditions set forth in this [RFI | RFP] or as otherwise communicated by Lilly.
>
> The Supplier should comply with the 'Lilly Supplier Code of Business Conduct', a copy of which is available on the Eli Lilly and Company Supplier Portal at: https://www.lilly.com/suppliers/supplier-resources/operating-responsibly
>
> No Supplier personnel should make any contact with any Lilly personnel related to this [RFI | RFP], including senior management, without first having obtained the primary contact's approval.
>
> The Supplier must not provide any form of special incentive to Lilly representatives during this [RFI | RFP] process.
>
> Lilly will accept no requests for exclusivity during the evaluation process."

#### 3.5 No Implied Offer
> "The issuance of this [RFI | RFP] does not imply that Lilly is making an offer to do business with any [RFI | RFP] recipient or respondent. No Agreement or other binding obligation on Lilly is implied or will occur unless and until a definitive Services Agreement is executed. The issuance of this [RFI | RFP] and the submission of the Supplier's proposal do not create any obligation upon Lilly to purchase goods or Services from the Supplier, or to enter into any binding legal relationship with any one or more of the Suppliers."

---

### SECTION 4: PRESENTATION & DEMO GUIDANCE (OPTIONAL SECTION)

Include when the timeline includes supplier presentations, demos, or proof-of-concept sessions. Can be included in both RFI (vendor presentations are common) and RFP.

**Design note:** Section 4 is the single vendor-facing location for all demo/presentation content. Lilly-internal evaluation content (scoring dimensions, evaluator assignments, calibration plan) belongs in `demo_evaluation_guide.docx`, not here. This separation prevents accidental disclosure of scoring mechanics to vendors and eliminates duplication between the Instructions document and a standalone demo prep artifact.

#### 4.1 Presentation Topics
Agenda for the supplier presentation. Structured as a bulleted list of topics the supplier should prepare to cover. Adapt to the sourcing domain.

#### 4.2 Demo Scenarios (OPTIONAL within section)
For RFP with live demos. This is the authoritative source of scenario detail for vendors. Each scenario must be written at full depth -- not as a stub or placeholder.

**Required fields per scenario:**

| Field | Description |
|-------|-------------|
| Scenario ID | S-01, S-02, etc. |
| Title | Short descriptive name |
| Time Allocation | Minutes allocated |
| Business Context | 2-5 sentences of realistic business context. Gives the vendor the narrative frame for the demonstration. Should reference specific business challenges relevant to Lilly's industry/domain. |
| Task | Specific actions the vendor must demonstrate, listed as lettered sub-items (a, b, c...). Each sub-item is a discrete capability being tested. |
| Success Criteria | What Lilly evaluators are looking for. Include specific capabilities, performance benchmarks (e.g., "sub-minute scenario execution"), UX expectations, and domain-specific quality indicators. |
| Mapped Requirements | Requirement category and Req_ID range from the requirements matrix that this scenario tests. |

**Minimum 3 scenarios for any RFP with demos. Target 5-7 for full-scope platform evaluations.**

Each scenario should test a different major requirement domain. Coverage across the requirements matrix is more valuable than depth in a single area. The scenario set should collectively touch the highest-priority and most-differentiating requirement categories.

**Technical Setup Requirements** (include after scenarios):
- What vendors must prepare in advance (environment, data sets, connectivity)
- Environment expectations (live system vs. sandbox vs. slides -- specify which)
- Connectivity and screen-share platform
- Pre-demo readiness confirmation timeline (e.g., "confirm 48 hours before session")
- Session duration, format (morning/afternoon split, break schedule), and recording notice

#### 4.3 Additional Questions for Presentation (OPTIONAL within section)
Supplementary questions suppliers should answer during or before the presentation. Common for professional services, lab services, and CRO sourcing where operational depth matters. (Pattern from the Discovery Chemistry Gateway RFP.)

---

### FOOTER (every page)
```
Eli Lilly and Company - Confidential
```

---

## Formatting Standards

| Element | Standard |
|---------|----------|
| Font (body) | Arial 11pt |
| Font (headings) | Arial, bold, sized by level (H1: 16pt, H2: 13pt, H3: 12pt) |
| Page size | US Letter (8.5 x 11) |
| Margins | 1 inch all sides |
| Section numbering | 0, 1, 2, 3, 4 |
| Tables | Light gray header row (#D9D9D9), thin gray borders, left-aligned |
| Bullets | Standard bullet via list formatting (not unicode) |
| Footer | "Eli Lilly and Company - Confidential" left, page number right |
| Header | "[RFI|RFP] -- [Project Name]" right-aligned, italic, gray |

---

## Boilerplate Text Registry

The following text blocks are LOCKED institutional language. Use verbatim, substituting only [BRACKETED] variables.

### BOILERPLATE_OVERVIEW
```
This document provides suppliers bidding on this project with information on the scope of the service and instructions/guidance on how to provide a response to Lilly.
```

### BOILERPLATE_COPYRIGHT
```
This document is copyright and contains proprietary information of Eli Lilly and Company and as such shall not be reproduced or disclosed to a third party without the prior written consent of Lilly.

Lilly assumes no responsibility for any errors that may appear in this document.

Copyright (c) [YEAR] Eli Lilly and Company
All Rights Reserved
```

### BOILERPLATE_CONFIDENTIALITY
```
CONFIDENTIALITY NOTICE: This [RFI | RFP] from Eli Lilly and Company (including all attachments) is for the sole use of the intended recipient(s) and contains confidential and privileged information. Any unauthorized review, use, disclosure, copying, or distribution is strictly prohibited. In addition, all [RFI | RFP] content is expected to be treated in accordance with the confidentiality provisions of the effective master agreement.
```

### BOILERPLATE_LILLY_INTRO
```
Eli Lilly and Company ("Lilly") is a global pharmaceutical company headquartered in Indianapolis, IN, U.S.A. [REVENUE_FIGURE], with products marketed in more than 120 countries. With a heritage of over 145 years, our mission is to make medicines that help people live longer, healthier, more active lives.

Our businesses include diabetes and obesity, oncology, immunology, and neuroscience. Lilly has over [EMPLOYEE_COUNT] employees, approximately [INTL_PERCENTAGE] of which are located outside the United States. Lilly also employs a wide range of contract labor supporting various business areas.
```

### BOILERPLATE_CONTRACTING
```
All suppliers will be required to agree to a [AGREEMENT_TYPE] with Lilly to be awarded the business.

- The master set of terms will be contracted with Eli Lilly and Company (the US parent company).
- Pricing for the services will be in USD.
- Irrespective of any existing master agreement, payment terms are 60 days from date of receipt of a valid invoice.
- Invoicing will be through Lilly's e-invoicing system: Ariba.
- Lilly Information Security Standard, Supplier Privacy Standard, and Anti-Bribery Policies are non-negotiable. They can also be found in the Supplier Resources section on www.lilly.com/suppliers.
```

### BOILERPLATE_PROTOCOL
```
The Supplier must comply fully with the engagement protocols and terms and conditions set forth in this [RFI | RFP] or as otherwise communicated by Lilly.

The Supplier should comply with the "Lilly Supplier Code of Business Conduct", a copy of which is available on the Eli Lilly and Company Supplier Portal at: https://www.lilly.com/suppliers/supplier-resources/operating-responsibly

No Supplier personnel should make any contact with any Lilly personnel related to this [RFI | RFP], including senior management, without first having obtained the primary contact's approval.

The Supplier must not provide any form of special incentive to Lilly representatives during this [RFI | RFP] process.

Lilly will accept no requests for exclusivity during the evaluation process.
```

### BOILERPLATE_NO_IMPLIED_OFFER
```
The issuance of this [RFI | RFP] does not imply that Lilly is making an offer to do business with any [RFI | RFP] recipient or respondent. No Agreement or other binding obligation on Lilly is implied or will occur unless and until a definitive Services Agreement is executed. The issuance of this [RFI | RFP] and the submission of the Supplier's proposal do not create any obligation upon Lilly to purchase goods or Services from the Supplier, or to enter into any binding legal relationship with any one or more of the Suppliers.
```

### BOILERPLATE_QA_FULL
```
There will be an opportunity for all suppliers to join a [DURATION] Question & Answer session via [PLATFORM] on [DATE_TIME]. Dial-in information will be shared with each individual supplier contact via email.

Please utilize this time to test your understanding of our requirements and ask clarifying questions. Each supplier will receive an anonymous ID prior to the call, and you are encouraged to use this ID during the call to promote candid discussion.

All further inquiries and questions after the Q&A meeting must be submitted via email or Ariba to the [RFI | RFP] Contact no later than [QUESTION_DEADLINE]. Any questions that the Lilly team can answer will be sent to all [RFI | RFP] participants.
```

### BOILERPLATE_QA_SIMPLE
```
Any questions relating to the project must be submitted via the eSourcing tool (Discussion section) and can be submitted at any time up to the Questions Close date. Answers may be shared with all suppliers if relevant.
```

### BOILERPLATE_REQUIREMENTS_SCALE
```
For each requirement, respond by placing an X in the appropriate column in the spreadsheet and add comments or explanation in the far right column:

- Meets out of the box: The current production version of the solution satisfies the requirement as stated without any software modifications.

- Meets with Standard Configuration: The current production version can satisfy the requirement but requires non-programming standard configuration through the system user interface or config files, accomplishable by a Lilly system administrator without writing code.

- Meets with Major Configuration: The solution can satisfy the requirement but requires significant configuration effort. If it cannot be configured through the provided user interface and/or requires scripting, the configuration is considered major. Such configuration should be included in implementation services pricing.

- Meets with Vendor Customization: New functionality not part of standard product and/or cannot be configured using existing tools. Supplier is offering customization exclusively for Lilly, not maintained across future standard releases. Such customization should be included in implementation services pricing.

- Does Not Meet: Functionality is not available or the solution is not designed to meet the requirement. Vendor can explain alternative approaches or future roadmap.

In addition to the responses listed above you are encouraged to add additional detail within the spreadsheet (in the Supplier Comments column) or reference and attach additional documentation.

Note: It is important that you do not add or insert rows within the requirements response spreadsheet.
```

### BOILERPLATE_INFOSEC
```
Lilly Information Security Standard is non-negotiable. A detailed security questionnaire will be provided separately. Suppliers should be prepared to provide evidence of their security posture including certifications, audit reports, and incident response capabilities.
```

---