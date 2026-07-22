# Stakeholder Patterns - Default Rosters by Sourcing Domain

Used when user says "help me build the stakeholder roster" in Step 2 of rfp-engine. Propose this roster, then let the user edit before generation continues.

All roles below are suggestions. User must confirm names and may add, remove, or modify roles.

---

## Pattern: Enterprise SaaS / Cloud Software

| Role | Function | Evaluation Focus | Demo | Approval |
|------|----------|-----------------|------|----------|
| Procurement Lead | Procurement | Commercial, Contract | N | Y |
| IT Product Owner | Technology | Functional fit, Integration | Y | Y |
| Enterprise Architect | IT Architecture | Technical architecture, Security | Y | N |
| Cybersecurity Analyst | Information Security | Security certifications, Data residency | Y | N |
| Business Sponsor | Business Unit | Business requirements, Usability | Y | Y |
| Legal Counsel | Legal | MSA terms, IP, Liability | N | Y |
| Finance Analyst | Finance | Pricing model, Budget impact | N | N |
| Data Privacy Officer | Legal / Compliance | DPA, GDPR, CCPA compliance | N | Y (if applicable) |

---

## Pattern: Professional Services / Consulting

| Role | Function | Evaluation Focus | Demo | Approval |
|------|----------|-----------------|------|----------|
| Procurement Lead | Procurement | Commercial, Rate card | N | Y |
| Project Sponsor | Business Unit | Methodology, Credentials, Team quality | Y | Y |
| Project Manager | PMO | Approach, Timeline, Governance | Y | N |
| Legal Counsel | Legal | SOW terms, IP ownership, Liability | N | Y |
| Finance Analyst | Finance | Fee structure, Budget compliance | N | N |
| Subject Matter Expert | Relevant Function | Technical depth, Domain expertise | Y | N |

---

## Pattern: Lab / Clinical Services (CRO / Lab)

| Role | Function | Evaluation Focus | Demo | Approval |
|------|----------|-----------------|------|----------|
| Procurement Lead | Procurement | Commercial, Contract | N | Y |
| Scientific Sponsor | R&D / Medical | Scientific capability, Methodology | Y | Y |
| Quality Assurance Lead | Quality | GLP/GMP compliance, Audit readiness | Y | Y |
| Regulatory Affairs | Regulatory | Submission support, Compliance posture | N | Y (if applicable) |
| Legal Counsel | Legal | CTA terms, IP, Confidentiality | N | Y |
| Finance Analyst | Finance | Budget compliance | N | N |

---

## Pattern: Hardware / Equipment

| Role | Function | Evaluation Focus | Demo | Approval |
|------|----------|-----------------|------|----------|
| Procurement Lead | Procurement | Commercial, Warranty terms | N | Y |
| Technical Owner | Engineering / IT | Specifications, Integration | Y | Y |
| Facilities Lead | Facilities | Installation, Site requirements | Y | N |
| EHS Representative | EHS | Safety certifications, Hazmat | N | Y (if applicable) |
| Finance Analyst | Finance | CapEx vs. OpEx model, Budget | N | N |
| Legal Counsel | Legal | Terms, Liability | N | Y |

---

## Pattern: Source-to-Pay / Procurement Technology

| Role | Function | Evaluation Focus | Demo | Approval |
|------|----------|-----------------|------|----------|
| Procurement Lead | Procurement | Commercial, Contract | N | Y |
| S2P Platform Owner | Procurement / IT | Functional fit, Integration | Y | Y |
| Enterprise Architect | IT Architecture | SAP integration, Security | Y | N |
| Cybersecurity Analyst | Information Security | SOC 2, Data residency | N | N |
| Business Procurement Lead | Procurement Operations | Usability, Process fit | Y | Y |
| Legal Counsel | Legal | MSA, DPA | N | Y |
| Finance Analyst | Finance | Pricing model | N | N |
| Change Management Lead | HR / Comms | Adoption, Training | Y | N |

---

## Stakeholder Roster Rules

1. **Minimum roster for a Full RFP:** 4 roles - Procurement Lead, a business-owner-equivalent role (Business Sponsor, or whichever label the domain pattern above uses: Project Sponsor, Scientific Sponsor, Business Procurement Lead; for Hardware/Equipment, where no dedicated sponsor role exists, Technical Owner or Facilities Lead satisfies this slot), Legal Counsel, Finance Analyst.
2. **Demo attendance:** At least 2 Lilly attendees per demo session. More than 6 makes demos unwieldy.
3. **Approval authority:** Must include at least one person with contract signature authority.
4. **Do not invent names** - if the user can't provide names, leave `[Name TBD]` as placeholder.
5. **Evaluation Focus** drives which requirements categories that person scores in evaluation-engine.

---

## BINARY ASSETS (shipped as companion files; no manual upload needed)

As of v2.2, the branded template binaries ship inside this skill's `assets/` folder and load directly from disk. They are NOT inlined and do NOT need to be uploaded separately to Project Knowledge. **The Generation Workflow's `assets/lilly_rfx_template.js --branded` (Template Rule 4) is the path that governs every run** - it builds the branded `[RFP|RFI]_Instructions.docx` programmatically and is what actually produces the deliverable; the builder script does not read either binary below:

- `assets/Lilly_RFP_Template_Branded.docx` (reference copy of the branded RFP layout, all optional sections)
- `assets/Lilly_RFI_Template_Branded.docx` (reference copy of the branded RFI layout, minimal)

These pre-built files are kept as a visual reference for the builder's output and as a manual fallback. If for some reason `assets/lilly_rfx_template.js` cannot be run (code execution unavailable), fall back to editing the closest pre-built binary above directly, and tell the user the programmatic build path was unavailable.