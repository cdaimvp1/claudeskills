# Lilly Contract Template Detection & Hierarchy Guide

Reference module for the `lilly-contract-review` skill. Used in Step 1 (Document Classification) to identify which Lilly template is in use and, when reviewing a modification of a Lilly-paper template, to understand what standard provisions should be present.

## Template Hierarchy

```
Lilly Contract Framework
├── Full MSA Templates (contain all core legal provisions)
│   ├── SaaS Agreement (MPT 5.2) - cloud/hosted software
│   ├── Commercial Unmodified Software License (MPT 5.2) - on-premise software
│   ├── Short Form IT - low-value IT services/deliverables (governed by PO T&C)
│   └── Short Form License - low-value services (governed by PO T&C)
│
├── Addenda (pair with MSAs - extend/modify for specific service types)
│   ├── IT Professional Services Addendum (MPT 5.2)
│   ├── Hosting Services Addendum (MPT 5.2)
│   ├── Data Licensing Addendum (MPT 5.2)
│   └── Digital Health Technology Addendum (MPT 5.2)
│
├── Transaction Documents (executed under MSAs)
│   ├── Work Order Template - scopes specific engagements
│   ├── Change Order Template - modifies existing Work Orders
│   └── Amendment Template - modifies the MSA itself
│
├── Standalone Agreements
│   ├── CDA 2-Way (MPT 5.0) - confidentiality only
│   ├── IT Evaluation Agreement (Green CI) - POC/trial, no purchase obligation
│   └── DHT Evaluation License - clinical device/software evaluation
│
└── Fallback Terms
    └── US PO Terms & Conditions - governs all Purchase Orders without an MSA
```

## Template Detection Signals

### SaaS Agreement (MPT 5.2)
- **Title:** "Software as a Service Agreement"
- **Key phrases:** "SaaS Services," "Third Party Host," "Scheduled Downtime," "Unscheduled Downtime," "Uptime"
- **Unique sections (not in other MSAs):** Trial Period, Lilly Information (standalone section), Access/Support/Availability, SLA/Uptime provisions
- **Paired addenda:** Hosting Services, IT Professional Services
- **Transaction docs:** Work Order, Change Order
- **Standards referenced:** ISS, Supplier Privacy Standard (DPA), AI Standard, Anti-Bribery

### Commercial Unmodified Software License (MPT 5.2)
- **Title:** "Commercial Unmodified Software License Agreement"
- **Key phrases:** "Commercial Unmodified Software," "Source Code Escrow," "Maintenance Services," "Acceptance Testing"
- **Unique sections (not in SaaS):** Source Code Escrow, Acceptance Testing, Maintenance Services, Use of Software and Documentation, Warranty Period
- **Paired addenda:** IT Professional Services
- **Transaction docs:** Work Order, Change Order
- **Standards referenced:** ISS, Supplier Privacy Standard (DPA), AI Standard, Anti-Bribery

### Short Form IT
- **Title:** "SERVICE/DELIVERABLE ORDER FORM"
- **Key phrases:** "Service/Deliverable Order Form," "Price List," "Lilly Order"
- **Structure:** Very short (1-2 pages), references PO T&C as governing terms
- **Governed by:** US PO Terms & Conditions (not a standalone MSA)
- **Use case:** Low-value IT purchases where a full MSA is not warranted

### Short Form License
- **Title:** "Services Agreement"
- **Key phrases:** References "Terms" (= US PO T&C), "Seller" (not "Supplier"), simple section numbering (2.1, 3.1, etc.)
- **Structure:** Short, references PO T&C as governing terms
- **Governed by:** US PO Terms & Conditions
- **Use case:** Low-value service engagements

### CDA 2-Way (MPT 5.0)
- **Title:** "Confidential Disclosure Agreement"
- **Key phrases:** "Acquiring Party," "Disclosing Party," "Confidential Information"
- **Scope:** Confidentiality only - no services, no deliverables, no pricing
- **No paired addenda or transaction documents

### IT Evaluation / POC (Green CI)
- **Title:** "Evaluation License Agreement"
- **Key phrases:** "Evaluation Period," "Proof of Concept," "Green CI," "no obligation to purchase"
- **Scope:** Time-limited evaluation - no ongoing commitment, return requirements
- **Unique provisions:** Future Contract Obligation (no obligation to buy), Return of Hardware/Software, limited warranty (evaluation only)

### DHT Evaluation License
- **Title:** "DIGITAL HEALTH TECHNOLOGY EVALUATION LICENSE AGREEMENT"
- **Key phrases:** "Digital Health Technology," "Hardware," "Software Product," "Evaluation Period"
- **Scope:** Clinical technology evaluation - patients, HCPs, wearables
- **Unique provisions:** Similar to IT Eval but with clinical/device context

### US PO Terms & Conditions
- **Not a template the supplier modifies** - it's Lilly's published terms that govern all Purchase Orders
- **Detection:** Referenced in Short Form agreements, governs POs without MSAs
- **Key provisions:** AE reporting, debarment, sanctions, indemnification, insurance ($25M cyber!), audit, termination, third-party hosts, IP ownership, force majeure
- **Important:** The PO T&C contains materially different terms from the MSA templates in some areas (e.g., 15-day cure period vs. 30-day in MSAs, $25M cyber insurance vs. $5M+ in MSAs)

## Addenda Detection and Pairing

| Addendum | Pairs With | Detection Phrase | Key Additions |
|---|---|---|---|
| **IT Professional Services** | Any MSA | "IT Professional Services," "Acceptance Testing Period," "Rate Card," "Deliverable Acceptance Certificate" | Acceptance testing framework, rate cards, deliverable acceptance process, warranty work |
| **Hosting Services** | Any MSA | "Hosting Services," "Lilly Site," "Site Backup," "Content Control" | Site backup requirements, content control, artistic control, hosting availability |
| **Data Licensing** | Any MSA | "Licensed Data," "Data Licensing," "Quality Review" | Data quality review, licensed data as deliverable, data verification requirements |
| **Digital Health Technology** | Any MSA (typically SaaS) | "Clinical Research Technology," "Patient," "HCP," "Study," "Hardware" | Clinical trial context, patient data, hardware lease/purchase, study-specific provisions |

## Template-Specific Review Considerations

### When reviewing a SaaS Agreement modification (Lilly-paper template):
- Check SaaS-specific sections that Software License doesn't have: Trial Period, SLA/Uptime, Third Party Hosts, Data Connection Software, Lilly Information section
- Verify Uptime definition, Scheduled/Unscheduled Downtime definitions preserved
- Verify Third Party Host requirements (subcontractor treatment, US data residency, 60-day transition notice)

### When reviewing a Software License modification (Lilly-paper template):
- Check Software License-specific sections: Source Code Escrow, Acceptance Testing, Maintenance Services
- Verify Warranty Period definition and scope preserved
- Verify Source Code Escrow trigger events (bankruptcy, discontinuation, material breach)
- Verify Acceptance Testing timeline (90 days) and process

### When reviewing an Addendum:
- Confirm the parent MSA is identified and the Order of Precedence states the Addendum governs over the MSA for conflicting terms
- Addenda add provisions - they should not delete or weaken MSA provisions
- Check that the Addendum doesn't create gaps by replacing MSA terms with weaker alternatives

### When reviewing a Short Form agreement:
- These are governed by the PO T&C, not an MSA
- The PO T&C provides baseline legal protections (indemnification, IP ownership, audit, AE reporting)
- Review focus is on the commercial terms in the Short Form itself (pricing, scope, term)
- Flag if the engagement complexity warrants a full MSA rather than a Short Form

### When reviewing a Work Order or Change Order:
- Confirm the parent MSA is identified and referenced
- Apply the full vendor tactics framework (3C) - WOs and COs are where commercial manipulation occurs
- Verify rate card compliance against the MSA or IT Professional Services Addendum rate card
- Check that the WO/CO doesn't silently modify MSA terms (contractual conflict detection - 3C category 7)

### When reviewing an Evaluation/POC agreement:
- These are time-limited, zero-commitment instruments
- Key provisions: evaluation period defined, return requirements, no purchase obligation, confidentiality, IP ownership during evaluation
- Red flags: hidden commitments, auto-conversion to paid license, data retention post-evaluation
- These should NOT contain: pricing for production use, volume commitments, renewal terms

### When reviewing a CDA:
- Simplest review - confidentiality terms only
- Key checks: definition of Confidential Information, exclusions, term, return/destruction, permitted disclosures
- The CDA should NOT contain commercial terms, service obligations, or IP assignments
- Playbook and pharma-requirements are sufficient - commercial-analysis and vendor-tactics not needed

## Template Availability for Diff Comparison

The following clean Lilly templates are available for diff comparison when a supplier returns a modified Lilly-paper template with tracked changes already accepted (flattened):

| Template | Available | Filename |
|---|---|---|
| SaaS Agreement (MPT 5.2) | ✅ | Software_as_a_Service_Agreement__MPT_5_2_.docx |
| Software License (MPT 5.2) | ✅ | Commercial_Unmodified_Software_License_Agreement__5_2_.docx |
| IT Prof Svcs Addendum (MPT 5.2) | ✅ | IT_Professional_Services_Addendum__MPT_5_2_.docx |
| Hosting Addendum (MPT 5.2) | ✅ | Hosting_Services_Addendum__MPT_5_2_.docx |
| Data Licensing Addendum (MPT 5.2) | ✅ | Data_Licensing_Addendum__MPT_5_2_.docx |
| DHT Addendum (MPT 5.2) | ✅ | Digital_Health_Technology_Addendum__MPT_5_2_.docx |
| Work Order Template | ✅ | IT_-_Work_Order_Template_.docx |
| Change Order Template | ✅ | IT_-_Change_Order_Template.docx |
| Amendment Template | ✅ | Amendment_Template.docx |
| CDA 2-Way (MPT 5.0) | ✅ | MPT_5_0_CDA_2-Way__Lilly_and_Supplier_.docx |
| Short Form IT | ✅ | Short_Form_Agreement_-_IT.docx |
| Short Form License | ✅ | Short_Form_License_Agreement.docx |
| IT Eval (Green CI) | ✅ | Evaluation_Agreement_for_IT__Proof_of_Concept_-_Green_CI_Use_Only_.docx |
| DHT Eval License | ✅ | Digital_Health_Technology_Evaluation_License_Agreement__1_.docx |

When reviewing a modified Lilly-paper template where tracked changes have been accepted, request the template name from the user and run a diff against the clean version to detect hidden modifications.

---