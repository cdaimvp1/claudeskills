# SME Escalation Matrix

Complete directory of subject matter experts for contract review escalations. Each SME entry includes trigger conditions, scope of review, expected turnaround, and escalation format.

**Source of truth:** the live SharePoint list at `collab.lilly.com/sites/GlobalProcurement/Lists/MPT  Functional SMEs`. Reconciled against that list (via its OneDrive mirror, `SME Escalation List.xlsx`) on 2026-07-30 — every name/email/confirmation-date below was cross-checked, not assumed. Two entries that look like non-standard email formats (`mike.boland@lilly.com`, `lina.polimeni@lilly.com`) were specifically re-verified against the live list and are correct as written (confirmed 1/7/2026 and 3/26/2024 respectively) — do not "fix" them to the `lastname_firstname@` pattern used elsewhere.

## Escalation Comment Format

Insert this comment format in the contract document at the relevant clause:

```
🔵 SME ESCALATION: [Topic]
@[SME Name] ([email])

Counterparty has [inserted/deleted/modified] language related to [issue].
Please review and advise on Lilly position.

Change Summary: [Description of what the supplier changed]
Lilly Impact: [Why this matters - what risk does the change create]
Playbook Reference: [Section in playbook.md]
Urgency: [Standard / Urgent - with reason if urgent]
```

## SME Directory

### Tax - Adam C Shields
- **Email:** shields_adam@lilly.com
- **Triggers:** tax, VAT, withholding, gross-up, tax disclosure, transfer pricing, tax indemnity, tax representations
- **Scope:** All tax-related contract provisions. Owns the Hard Stop on tax disclosure rights (HS-3).
- **Common issues:** Supplier removing Lilly's right to disclose to tax authorities; supplier adding gross-up requirements; withholding rate disputes; international tax structuring
- **Turnaround:** 3-5 business days (standard), 1-2 business days (urgent)
- **Escalation threshold:** Any modification to tax provisions - no de minimis exception

### Insurance - Christopher T Edwards
- **Email:** edwards_christopher_t@lilly.com
- **Triggers:** insurance, coverage, COI, certificate of insurance, cyber insurance, E&O, professional liability, workers comp, auto liability, umbrella, excess, additional insured, waiver of subrogation
- **Scope:** Insurance coverage requirements, acceptable policy types and limits, small company accommodations
- **Common issues:** Supplier requesting reduced coverage limits; cyber insurance adequacy for data-handling suppliers; Tech E&O vs. Professional Liability substitution; self-insurance requests
- **Turnaround:** 2-3 business days
- **Escalation threshold:** Any coverage below playbook minimums; self-insurance requests; missing coverage types

### Audit Rights - Carina Horacek Roth
- **Email:** horacek_roth_carina@lilly.com
- **Triggers:** audit, inspection, right to audit, SOC 2, SOC 1, ISO 27001, attestation, records access, books and records
- **Scope:** Audit right provisions, attestation acceptability, audit frequency, audit cost allocation
- **Common issues:** Supplier replacing direct audit rights with attestation-only; supplier restricting audit frequency; supplier requiring Lilly to pay audit costs; supplier limiting audit scope
- **Turnaround:** 3-5 business days
- **Escalation threshold:** Any attempt to eliminate direct audit rights; attestation substitution proposals

### AI/Privacy - Legal AIPC
- **Email:** Mailbox_Privacy_Contracts@lilly.com
- **Triggers:** AI, LLM, machine learning, artificial intelligence, privacy, DPA, data processing agreement, GDPR, personal data, data subject rights, data breach, data transfer, subprocessor, data controller, data processor, automated decision-making
- **Scope:** All AI governance provisions, data protection agreements, privacy impact assessments, cross-border data transfer mechanisms. Owns Hard Stop on AI subcontractor treatment (HS-5).
- **Common issues:** AI providers excluded from subcontractor treatment; missing DPA when personal data is processed; inadequate breach notification timelines; cross-border transfer mechanisms insufficient for EU data; supplier training AI models on Lilly data without consent
- **Turnaround:** 5-7 business days (complex AI/privacy reviews), 2-3 business days (standard DPA)
- **Escalation threshold:** Any AI/ML involvement; any personal data processing; any cross-border data transfer

### Adverse Events - Merry Chu
- **Email:** chu_merry@lilly.com
- **Co-contact:** Jennifer Elaine Wilson (wilson_jennifer_elaine@lilly.com) — same topic, same confirmation date (4/15/2024); CC both on any AE escalation.
- **Triggers:** adverse event, AE, product complaint, pharmacovigilance, safety reporting, medical information, product safety, patient safety
- **Scope:** Adverse event reporting provisions, reporting timelines, Lilly Answers Center contact requirements. Owns Hard Stop on AE reporting timeline (HS-4).
- **Common issues:** Supplier modifying reporting timelines (must be 1 business day); supplier deleting AE section entirely; supplier not including Lilly Answers Center contact information
- **Turnaround:** 2-3 business days
- **Escalation threshold:** Any modification to AE provisions - this is a regulatory requirement

### Trade Sanctions / Export & Import Compliance - Alessandro Curti (primary)
- **Email:** curti_alessandro@lilly.com
- **Co-contacts:** Mary Elizabeth Marbaugh (marbaugh_mary_e@lilly.com) and Debra M Roehrdanz (roehrdanz_debra_m@lilly.com) also cover Export/Trade Sanctions on the live SME list; Curti and Nicole Lea Pierce (pierce_nicole@lilly.com) additionally cover **Import** specifically; Marbaugh and Roehrdanz also cover **Subcontractor Requirements (government restrictions)** under this same Import/Export Compliance function. Curti remains primary POC per the live list's own notes.
- **Triggers:** sanctions, OFAC, export control, import, embargo, restricted party, denied party, specially designated national, SDN, trade compliance, anti-money laundering, subcontractor government restrictions
- **Scope:** All trade sanctions, export control, and import compliance provisions. Owns Hard Stop on sanctions modifications (HS-1).
- **Common issues:** Supplier attempting to modify or limit sanctions representations; supplier in a sanctioned or high-risk jurisdiction; contract scope involving export-controlled technology
- **Turnaround:** 3-5 business days (standard), 1 business day (sanctions flag on new supplier)
- **Escalation threshold:** ANY modification to sanctions provisions. Zero tolerance.

### InfoSec - Cyber ISS Review
- **Email:** Cyber_ISS_Review@lilly.com
- **Triggers:** security, cybersecurity, information security, penetration testing, vulnerability assessment, SOC report, encryption, access controls, incident response, security standards
- **Scope:** Cybersecurity requirements, supplier security posture assessment, InfoSec questionnaire review, security-specific contract provisions
- **Common issues:** Supplier resisting security audit rights; inadequate encryption standards; missing incident response requirements; supplier not meeting Lilly's security baseline
- **Turnaround:** 5-10 business days (security assessment), 3-5 business days (contract provision review)
- **Escalation threshold:** Any supplier with access to Lilly systems, networks, or data

### HSE - Donna U Carroll
- **Email:** carroll_donna_u@lilly.com
- **Co-contact:** Prem Pyreddy (premchandra.pyreddy@lilly.com) — backup resource for the same topic, same confirmation date (6/26/2025); CC as backup.
- **Triggers:** health and safety, environmental, OSHA, EHS, workplace safety, hazardous materials, environmental compliance, on-site work, contractor safety
- **Scope:** Health, safety, and environmental provisions for suppliers performing on-site work at Lilly facilities
- **Common issues:** Supplier not meeting Lilly's contractor safety requirements; missing HSE pre-qualification; inadequate environmental compliance provisions
- **Turnaround:** 3-5 business days
- **Escalation threshold:** Any supplier performing physical work at Lilly facilities

### Payment Terms - Diane Elizabeth Coey
- **Email:** coey_diane@lilly.com
- **Co-contact:** Brid Creedon (creedon_brid@lilly.com) — same topic, same confirmation date (3/26/2024).
- **Triggers:** payment terms, invoice, net 30, net 45, net 60, early payment, payment discount, prompt payment
- **Scope:** Payment term negotiations, early payment discount programs, small/diverse supplier accommodations
- **Turnaround:** 1-2 business days
- **Escalation threshold:** Payment terms shorter than Net-45 (except small/diverse suppliers)

### Global Transparency (Covered Recipients / Open Payments Law, Subcontractor Requirements) - Brenda Kay Dalton
- **Email:** dalton_brenda@lilly.com
- **Triggers:** covered recipient, open payments, sunshine act, transparency reporting, HCP payment disclosure, government transparency subcontractor requirements
- **Scope:** Covered Recipients & Open Payments Law provisions, and subcontractor-requirement clauses filed under Global Transparency. Confirmed 4/4/2024 on the live SME list; not previously in this matrix.
- **Turnaround:** not stated on the live list — confirm directly with Brenda before committing a timeline to the user.
- **Escalation threshold:** Any HCP/covered-recipient payment or transparency-reporting obligation in the contract.

### Logistics - David M Wadsworth
- **Email:** wadsworth_david_m@lilly.com
- **Triggers:** warehousing, trucking, freight, carrier, logistics, shipping terms, Incoterms, distribution
- **Scope:** Can assist with understanding Lilly security policy SEC STD 200 as it relates to warehousing and trucking in manufacturing/logistics agreements. Confirmed 3/26/2024; not previously in this matrix.
- **Turnaround:** not stated on the live list.
- **Escalation threshold:** Any warehousing/trucking/logistics-specific security or operational provision.

### Accessibility / Diversity - Jamie N Samuels
- **Email:** samuels_jamie_n@lilly.com
- **Triggers:** accessibility, WCAG, ADA, Section 508, supplier diversity, diverse-owned business
- **Scope:** Covers both Accessibility and Diversity under Procurement per the live SME list (same person, both confirmed 3/26/2024 and 4/15/2024 respectively); not previously in this matrix.
- **Turnaround:** not stated on the live list.
- **Escalation threshold:** Any accessibility-standard commitment or supplier-diversity representation in the contract.

### Code of Conduct (PSCI) - John A. Hamilton
- **Email:** hamilton_john_a@lilly.com
- **Triggers:** PSCI, Pharmaceutical Supply Chain Initiative, supplier code of conduct, ethical sourcing
- **Scope:** Can explain PSCI background for Code of Conduct provisions under Procurement. Confirmed 3/26/2024; not previously in this matrix.
- **Turnaround:** not stated on the live list.
- **Escalation threshold:** Any PSCI/supplier code-of-conduct provision.

### AI Registry Use Case Submission - Alicia M Sunga
- **Email:** sunga_alicia_m@lilly.com
- **Triggers:** AI registry, AI use case submission, Protect Lilly AI intake
- **Scope:** Supports AI registry use-case submissions under Protect Lilly. Distinct from the AI/Privacy (Legal AIPC) entry above — this is the intake/registry process, not the contractual DPA/AI-governance review. Confirmation date blank on the live list; not previously in this matrix.
- **Turnaround:** not stated on the live list.
- **Escalation threshold:** Any new AI use case that needs registry submission alongside the contract review.

### Travel Services - Karen Sue Morgan
- **Email:** morgan_karen_sue@lilly.com
- **Triggers:** travel services, corporate travel, travel booking, travel policy
- **Scope:** Global Business Solutions travel-services provisions. Confirmed 3/26/2024; not previously in this matrix.
- **Turnaround:** not stated on the live list.
- **Escalation threshold:** Any travel-services-specific contract provision.

### Subcontractor Requirements (Affirmative Action / EEO) - UNASSIGNED
- **Scope:** Human Resources subject area. The live SME list shows no name or email assigned to this topic (confirmed 3/9/2022, oldest entry on the list — likely stale). **Do not invent a contact.** Route as "no SME currently assigned per the live list — confirm with HR directly" until this is filled in at the source.

### Records Retention - Mike Boland
- **Email:** mike.boland@lilly.com
- **Triggers:** records retention, document retention, record keeping, data preservation, litigation hold
- **Scope:** Records retention provisions, alignment with Lilly corporate retention schedule
- **Turnaround:** 3-5 business days
- **Escalation threshold:** Supplier requesting shorter retention than Lilly's policy requires

### Brand/Publicity - Lina Polimeni
- **Email:** lina.polimeni@lilly.com
- **Triggers:** publicity, trademark, logo, press release, marketing, public announcement, brand, social media, endorsement
- **Scope:** Publicity restrictions, trademark usage, press release approval rights
- **Common issues:** Supplier wanting to use Lilly name/logo in marketing materials; supplier wanting to issue press release about the relationship
- **Turnaround:** 2-3 business days
- **Escalation threshold:** Any supplier request to use Lilly name, logo, or reference the relationship publicly

### Anti-Bribery - Joshua Stine
- **Email:** stine_joshua@lilly.com
- **Triggers:** anti-bribery, FCPA, Foreign Corrupt Practices Act, corruption, gifts, entertainment, government official, facilitation payment, anti-corruption
- **Scope:** Anti-corruption provisions, FCPA compliance, high-risk supplier assessment, Entry Point Criteria per ACDD
- **Turnaround:** 3-5 business days
- **Escalation threshold:** Any weakening of anti-corruption provisions; any supplier interacting with government officials on Lilly's behalf

## Contract Request and Consultation Tool

Use the Contract Request and Consultation Tool (not a specific SME) for these escalations:

| Topic | When to Use |
|---|---|
| Indemnification deviations | Supplier changing indemnification structure beyond acceptable fallbacks |
| Liability cap below $3M | Supplier insisting on cap below Lilly minimum |
| Choice of Law/Forum changes | Supplier requesting non-standard jurisdiction |
| Termination for Convenience modifications | Supplier restricting Lilly's termination rights |
| Force Majeure changes | Supplier expanding force majeure beyond acceptable scope |
| IP ownership disputes | Supplier claiming ownership of work product |
| Any provision not covered above | Novel or unusual provisions not in the standard playbook |

## Multiple SME Escalation Handling

When a single clause triggers multiple SME escalations (e.g., an AI data processing provision triggers both AI/Privacy and InfoSec):

1. Create separate escalation comments for each SME
2. Note in each comment that the other SME is also reviewing
3. The procurement rep should wait for ALL triggered SMEs to respond before finalizing the position
4. If SME positions conflict, escalate to Contract Request and Consultation Tool for resolution

---