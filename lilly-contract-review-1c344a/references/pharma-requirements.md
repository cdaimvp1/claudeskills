# Pharmaceutical-Specific Contract Requirements

Requirements unique to pharmaceutical industry supplier contracts. These apply in addition to the General MPT Playbook positions and often override standard commercial contract norms.

## Why Pharma Contracts Are Different

Lilly operates in a heavily regulated industry where supplier contracts carry regulatory implications beyond normal commercial risk. A missing adverse event clause doesn't just create commercial exposure - it creates FDA compliance risk. A weak debarment certification doesn't just create legal risk - it can result in product seizure. These requirements are not negotiable preferences; many are legal mandates.

## Regulatory Framework

### FDA Requirements

#### 21 CFR Part 11 - Electronic Records and Signatures
- **Applies when:** Supplier provides or operates GxP systems (clinical data systems, manufacturing systems, quality systems, lab systems)
- **Contract must include:** System validation requirements (IQ/OQ/PQ), audit trail requirements, electronic signature compliance, change control procedures, periodic review obligations
- **Watch for:** Supplier disclaiming Part 11 compliance; supplier limiting Lilly's ability to validate the system; supplier restricting access to audit trails
- **Redline instruction:** If supplier's system touches GxP data, Part 11 compliance is mandatory. Add: "Supplier shall maintain its systems in compliance with 21 CFR Part 11 and shall cooperate with Lilly's validation and audit requirements."

#### Adverse Event Reporting (21 CFR 314.81, 314.98)
- **Applies when:** ALL supplier contracts - any supplier may encounter product-related information
- **Contract must include:**
  - 1 business day reporting timeline to Lilly (Hard Stop - non-negotiable)
  - Contact information: Lilly Answers Center 1-800-LillyRx
  - Definition of what constitutes a reportable event
  - Supplier obligation to train relevant personnel on reporting
  - Survival clause - AE reporting obligation survives contract termination
- **This is a Hard Stop.** See playbook.md HS-4.

#### Debarment (Generic Drug Enforcement Act, 21 USC 335a)
- **Applies when:** ALL supplier contracts
- **Contract must include:**
  - Unqualified representation that supplier and its employees are not debarred
  - Obligation to notify Lilly immediately if debarment status changes
  - Lilly right to terminate immediately upon debarment
  - NO "knowingly" qualifier (Hard Stop - see playbook.md HS-2)
- **Rationale:** Lilly must certify to FDA that it does not use debarred individuals or firms. A "knowingly" qualifier undermines Lilly's ability to make this certification.
- **Additional check:** Verify supplier against OIG exclusion list and FDA debarment list during onboarding (handled by supplier onboarding processes)

### HIPAA Requirements

#### Business Associate Agreement (45 CFR 164.502(e), 164.504(e))
- **Applies when:** Supplier will create, receive, maintain, or transmit Protected Health Information (PHI) on behalf of Lilly
- **Contract must include:** BAA as separate exhibit or incorporated into DPA
- **BAA requirements:** Permitted uses/disclosures, safeguards, breach notification (within 72 hours of discovery), return/destruction of PHI at termination, subcontractor flow-down, audit rights
- **Watch for:** Supplier resisting BAA when PHI is clearly in scope; supplier limiting breach notification timeline beyond 72 hours; supplier claiming they're not a Business Associate when they clearly handle PHI
- **Escalation:** Legal AIPC for PHI scope determination

### Anti-Corruption Requirements

#### FCPA (Foreign Corrupt Practices Act)
- **Applies when:** ALL supplier contracts (domestic and international)
- **Contract must include:**
  - Anti-bribery representations and warranties
  - Compliance with FCPA, UK Bribery Act, and applicable local anti-corruption laws
  - Right for Lilly to audit anti-corruption compliance
  - Immediate notification of any investigation or allegation
  - Right to terminate for anti-corruption violation
- **Enhanced for high-risk suppliers:** Suppliers interacting with government officials on Lilly's behalf require:
  - Annual anti-corruption training
  - Entry Point Criteria assessment per Lilly's ACDD (Anti-Corruption Due Diligence) program
  - Periodic compliance certifications
- **Escalation:** Joshua Stine (stine_joshua@lilly.com)

#### Trade Sanctions and Export Control
- **Applies when:** ALL supplier contracts
- **Hard Stop:** No modifications permitted. See playbook.md HS-1.
- **Contract must include:**
  - OFAC compliance representation
  - Restricted/denied party screening obligation
  - Export control compliance (EAR, ITAR if applicable)
  - Immediate notification if supplier or any principal appears on any restricted party list
  - Lilly right to immediate termination for sanctions violation
- **Escalation:** Alessandro Curti (curti_alessandro@lilly.com)

## Quality Requirements

### GxP Supplier Qualification
- **Applies when:** Supplier provides services or products that could affect the quality, safety, or efficacy of Lilly pharmaceutical products
- **GxP categories:** GMP (manufacturing), GLP (laboratory), GCP (clinical), GDP (distribution)
- **Contract additions for GxP suppliers:**
  - Quality Agreement (separate document, associated with the MSA - not a child/amendment)
  - Right to audit quality systems
  - Change notification requirements (supplier must notify Lilly before making changes that could affect product quality)
  - CAPA (Corrective and Preventive Action) procedures
  - Deviation reporting and investigation requirements
  - Annual quality review obligations
- **Watch for:** Supplier attempting to limit quality audit rights; supplier not agreeing to change notification; supplier resisting CAPA obligations
- **Note:** Quality Agreements are handled as associated documents tracked alongside the parent MSA, not as amendments to the MSA

### Pharmacovigilance Agreement
- **Applies when:** Supplier involved in clinical trials, medical information, patient support programs, or any activity where they may encounter adverse event information
- **Must include:** Detailed AE reporting procedures, responsible persons, escalation timelines, training requirements, periodic reconciliation of safety data
- **Relationship to MSA:** Supplementary agreement (associated_with, not child_of)

## Data Protection - Pharma-Specific

### Clinical Trial Data
- Supplier cannot use clinical trial data for any purpose other than performing services for Lilly
- All clinical data remains Lilly property
- Destruction or return upon contract termination - no retained copies
- Encryption in transit (TLS 1.2+) and at rest (AES-256)

### Patient Data
- HIPAA BAA required when PHI is involved
- GDPR DPA required when EU patient data is involved (even if processed in the US)
- Data minimization - supplier receives only the minimum necessary data
- Right to erasure provisions for patient data

### Regulatory Submission Data
- Data used in regulatory submissions (FDA, EMA, etc.) must be retained per regulatory timelines
- Supplier must maintain data integrity per 21 CFR Part 11 (if electronic)
- Audit trail requirements for any modifications to submission-related data

## Insurance - Pharma-Specific Additions

Beyond standard insurance requirements:

| Coverage Type | When Required | Minimum |
|---|---|---|
| Product Liability | Supplier provides components used in Lilly products | $5M per occurrence |
| Clinical Trial Liability | Supplier involved in clinical trials | $5M per occurrence |
| Professional Liability / E&O | All service suppliers | $5M (standard), $10M (clinical) |
| Cyber Liability | Supplier handles Lilly data electronically | $5M minimum |
| Environmental Liability | Supplier handles hazardous materials | Per HSE assessment |

**Escalation for all insurance:** Christopher T Edwards (edwards_christopher_t@lilly.com)

## Contract Review Checklist - Pharma Items

When reviewing any contract, verify these pharma-specific items:

- [ ] Adverse event reporting provision present (1 business day, Lilly Answers Center)
- [ ] Debarment certification present (no "knowingly" qualifier)
- [ ] Trade sanctions provision present (unmodified)
- [ ] Anti-corruption provisions present (FCPA + applicable local laws)
- [ ] If GxP scope: Quality Agreement referenced or in progress
- [ ] If patient data: HIPAA BAA required and addressed
- [ ] If personal data: DPA required and addressed (GDPR if EU data)
- [ ] If clinical trial involvement: Pharmacovigilance Agreement required
- [ ] If AI/ML involved: AI Standard provisions present (subcontractor treatment, no model training on Lilly data)
- [ ] Insurance coverage meets pharma-specific minimums for this engagement type
- [ ] Regulatory data retention requirements addressed in records provisions

---