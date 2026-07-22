# Lilly Contract Negotiation Playbook - General MPT

Positions, fallbacks, Hard Stops, and redline instructions for the General Master Procurement Terms playbook. This is the primary reference for `lilly-contract-review`.

## How to Use This Playbook

For each contract section:
1. **Check the Lilly Position** - what does the playbook require?
2. **Compare to the document** - does the contract match?
3. **If deviation:** check if it's a Hard Stop (never accept), has an acceptable fallback, or requires SME escalation
4. **Generate the redline** with the appropriate comment format

## Hard Stops - Never Accept Without Escalation

These are non-negotiable. If the supplier insists, escalate to the identified SME. Do NOT send a redline accepting any Hard Stop deviation.

### HS-1: Trade Sanctions (§25)
- **Position:** NO modifications to trade sanctions provisions whatsoever
- **Rationale:** Lilly has zero tolerance for sanctions risk. OFAC compliance is mandatory.
- **If supplier modifies:** Delete all supplier changes. Add comment: "Trade sanctions provisions are non-negotiable per Lilly policy."
- **Escalation:** Alessandro Curti (curti_alessandro@lilly.com)

### HS-2: Debarment Certification (§26)
- **Position:** NO "knowingly" qualifier on debarment certification
- **Rationale:** Lilly must certify to FDA that suppliers are not debarred. "Knowingly" creates an escape clause that FDA does not accept.
- **If supplier adds "knowingly":** Delete the word. Add comment: "Lilly's FDA certification obligations require unqualified debarment representations. The 'knowingly' qualifier is not acceptable."
- **Escalation:** N/A - this is a regulatory requirement, not a negotiable position

### HS-3: Tax Disclosure Rights (§8)
- **Position:** Lilly MUST retain the right to disclose contract details to tax authorities
- **Rationale:** Tax reporting obligations require transparency with tax authorities
- **If supplier restricts:** Restore Lilly's disclosure right. Add comment: "Lilly requires the right to disclose to tax authorities per corporate tax compliance requirements."
- **Escalation:** Adam C Shields (shields_adam@lilly.com)

### HS-4: Adverse Event Reporting (§23)
- **Position:** 1 business day reporting timeline is mandatory. Contact: Lilly Answers Center 1-800-LillyRx
- **Rationale:** FDA pharmacovigilance requirements. Patient safety is paramount.
- **If supplier modifies timeline:** Restore 1 business day. Add comment: "Adverse event reporting timeline is a regulatory requirement and cannot be modified."
- **If supplier deletes section:** Re-insert the full adverse event provision. This section is required in ALL supplier contracts.
- **Escalation:** Merry Chu (chu_merry@lilly.com)

### HS-5: AI/ML Standard (§19)
- **Position:** Third-party AI providers MUST be treated as Subcontractors with full data protection flow-down
- **Rationale:** Lilly's AI governance requires complete oversight of AI systems processing Lilly data
- **If supplier excludes AI providers from subcontractor treatment:** Redline to include them. Add comment: "Per Lilly AI Standard, all third-party AI/ML providers must be treated as Subcontractors with full data protection and audit flow-down."
- **Escalation:** Legal AIPC (Mailbox_Privacy_Contracts@lilly.com)

### HS-6: Indemnification Structure (§17)
- **Position:** Cannot limit indemnification to "sole and exclusive remedy." Background IP indemnification required.
- **Rationale:** Indemnification must survive alongside other contractual remedies. Background IP infringement risk must be covered.
- **If supplier adds "sole and exclusive remedy":** Delete the limitation. Add comment: "Indemnification cannot be limited to sole and exclusive remedy. Lilly requires indemnification to survive alongside other remedies."
- **If supplier deletes background IP indemnification:** Restore it. Add comment: "Background IP indemnification is required per Lilly playbook."
- **Escalation:** Contract Request and Consultation Tool

## Section-by-Section Positions

### §1: Term and Renewal

| Position | Detail |
|---|---|
| **Standard** | Lilly unilateral renewal option |
| **Acceptable fallback** | Mutual agreement for renewal; longer notice periods acceptable |
| **Not acceptable** | Auto-renewal without notice; supplier unilateral renewal |
| **Escalation** | None unless supplier demands auto-renewal |

**Redline instruction:** If supplier changes to auto-renewal, redline to mutual renewal with 90-day notice period. Comment: "Lilly standard requires mutual agreement for renewal. Auto-renewal is not acceptable without adequate notice provisions."

### §2: Scope of Services

| Position | Detail |
|---|---|
| **Standard** | Scope defined in SOW(s) attached to MSA |
| **Watch for** | Overly broad scope language that could expand obligations without new SOW |
| **Not acceptable** | Scope language that gives supplier unilateral right to change deliverables |

**Redline instruction:** If scope is vague, add: "Services shall be performed solely as described in the applicable Statement of Work."

### §3: Fees and Payment

| Position | Detail |
|---|---|
| **Standard** | Payment terms: Net-45 (Lilly standard); invoicing per SOW/WO |
| **Acceptable fallback** | Net-30 acceptable for small suppliers |
| **Not acceptable** | Payment on receipt; advance payment; payment before acceptance |
| **Rate escalation** | Annual escalation acceptable if capped (3% max) and tied to CPI or equivalent. Open-ended escalation not acceptable. |
| **Escalation** | Diane Elizabeth Coey (coey_diane@lilly.com) for payment term deviations |

**Redline instruction:** If supplier demands Net-30 or shorter, first check contract value. For <$100K contracts with small/diverse suppliers, Net-30 is acceptable. For larger contracts, hold Net-45.

### §4: Confidentiality

| Position | Detail |
|---|---|
| **Standard** | Mutual confidentiality; 5-year survival post-expiration |
| **Acceptable fallback** | 3-year survival minimum |
| **Not acceptable** | No confidentiality provision; one-way (Lilly-only) confidentiality |
| **Watch for** | Carve-outs that are too broad (e.g., "information known to supplier" without qualification) |

### §5: Intellectual Property (§5-6)

| Position | Detail |
|---|---|
| **Standard** | Lilly owns all work product created under the contract. Supplier retains pre-existing background IP with license to Lilly. |
| **Acceptable fallback** | Joint ownership of specifically identified deliverables with Lilly perpetual license. Must be negotiated per SOW. |
| **Not acceptable** | Supplier owns work product; supplier retains rights to reuse Lilly-specific work for competitors |
| **Critical for pharma** | IP created in connection with Lilly compounds, formulations, or clinical data MUST be Lilly-owned. No exceptions. |
| **Escalation** | Contract Request and Consultation Tool for any IP deviation |

**Redline instruction:** If supplier claims ownership of work product, redline to Lilly ownership. If supplier insists on retaining certain IP, require explicit identification of pre-existing IP and a perpetual, royalty-free license to Lilly.

### §7: Representations and Warranties

| Position | Detail |
|---|---|
| **Standard** | Mutual representations (authority, no conflicts) + supplier-specific (professional standards, no infringement, compliance with laws) |
| **Watch for** | Supplier removing or watering down warranty of professional performance |
| **Not acceptable** | Supplier disclaiming all warranties ("AS-IS" for services); removing compliance-with-laws representation |

### §8: Tax (see also HS-3)

| Position | Detail |
|---|---|
| **Standard** | Each party responsible for own taxes. Lilly retains right to withhold per applicable law. Lilly retains right to disclose to tax authorities (Hard Stop). |
| **Escalation** | Adam C Shields (shields_adam@lilly.com) for any tax provision changes |

### §9-10: Data Protection and Privacy

| Position | Detail |
|---|---|
| **Standard** | DPA required when supplier processes personal data. HIPAA BAA required when PHI involved. |
| **Watch for** | Missing DPA when data processing is in scope; supplier restricting Lilly's data rights; inadequate breach notification (must be 72 hours or less) |
| **Escalation** | Legal AIPC (Mailbox_Privacy_Contracts@lilly.com) for all privacy/data protection changes |

### §11: Audit Rights

| Position | Detail |
|---|---|
| **Standard** | Lilly right to audit supplier records and systems with reasonable notice |
| **Acceptable fallback** | Third-party attestations (SOC 2, ISO 27001) can supplement but NOT replace Lilly's direct audit right. Reasonable frequency limits acceptable (e.g., once per year). |
| **Not acceptable** | Supplier removing audit rights entirely; supplier requiring Lilly to accept third-party attestation as sole audit mechanism |
| **Escalation** | Carina Horacek Roth (horacek_roth_carina@lilly.com) |

### §12-13: Compliance and Anti-Corruption

| Position | Detail |
|---|---|
| **Standard** | Supplier compliance with all applicable laws, including FCPA, UK Bribery Act, and applicable local anti-corruption laws |
| **Watch for** | Supplier limiting compliance obligation to "material" laws; supplier removing anti-corruption provisions |
| **Not acceptable** | Any weakening of anti-corruption provisions |
| **Escalation** | Joshua Stine (stine_joshua@lilly.com) for anti-bribery concerns |

### §14: Insurance (§16 in some templates)

| Position | Detail |
|---|---|
| **Standard** | Commercial General Liability ($2M per occurrence), Professional Liability / E&O ($5M), Workers Comp (statutory), Auto ($1M) |
| **Acceptable fallback** | Aggregate reductions for small companies. Tech E&O can substitute professional liability. Cyber insurance required if data access involved ($5M minimum). |
| **Not acceptable** | No insurance requirement; supplier self-insurance without demonstrated financial capacity |
| **Escalation** | Christopher T Edwards (edwards_christopher_t@lilly.com) |

### §15: Force Majeure

| Position | Detail |
|---|---|
| **Standard** | Mutual force majeure with enumerated events. Lilly right to terminate if force majeure exceeds 90 days. |
| **Acceptable fallback** | 120-day termination trigger (instead of 90). Mutual termination right (instead of Lilly-only). |
| **Not acceptable** | Force majeure excusing payment obligations; force majeure covering labor disputes or supplier financial difficulties; unlimited force majeure period without termination right |
| **Escalation** | Contract Request and Consultation Tool |

### §16: Termination

| Position | Detail |
|---|---|
| **Standard** | Lilly termination for convenience with 30-day notice. Mutual termination for cause with 30-day cure period. |
| **Acceptable fallback** | 60-day notice for termination for convenience. 45-day cure period for cause. |
| **Not acceptable** | No termination for convenience; cure period >60 days; supplier-only termination for convenience |
| **Escalation** | Contract Request and Consultation Tool |

### §17: Indemnification (see also HS-6)

| Position | Detail |
|---|---|
| **Standard** | Mutual indemnification. Supplier indemnifies for: negligence, IP infringement (including background IP), breach of confidentiality, data breach, violation of law. |
| **Watch for** | Supplier narrowing indemnification to "gross negligence" only; supplier removing background IP indemnification; supplier adding "sole and exclusive remedy" limitation (Hard Stop) |
| **Escalation** | Contract Request and Consultation Tool |

### §18: Limitation of Liability

| Position | Detail |
|---|---|
| **Standard** | Cap must be mutual. "Greater of" construct required (not "lesser of"). |
| **Minimum** | $3M cap - escalate to Legal if supplier insists on lower |
| **Acceptable fallback** | Cap equal to fees paid/payable in the 12-month period. Multiple of annual contract value (2x-3x). |
| **Not acceptable** | "Lesser of" construct; unilateral cap favoring supplier; cap below $3M without Legal approval; unlimited liability for Lilly with capped liability for supplier |
| **Carve-outs** | Indemnification obligations, confidentiality breaches, IP infringement, and willful misconduct are typically carved out of the liability cap |
| **Escalation** | Contract Request and Consultation Tool for any cap below $3M |

### §19: AI/ML Provisions (see also HS-5)

| Position | Detail |
|---|---|
| **Standard** | Per Lilly AI Standard: all AI/ML providers treated as Subcontractors; data protection flow-down; model transparency requirements; no training on Lilly data without consent; audit rights over AI systems |
| **Watch for** | AI providers carved out of subcontractor treatment; supplier claiming AI model is proprietary and exempt from audit; supplier using Lilly data to train models without restriction |
| **Escalation** | Legal AIPC (Mailbox_Privacy_Contracts@lilly.com) |

### §20-22: Assignment, Notices, General Provisions

| Position | Detail |
|---|---|
| **Assignment** | Lilly may assign to affiliates without consent. Supplier requires Lilly consent. Change-of-control = assignment. |
| **Notices** | Written notice to designated contacts. Email acceptable for operational notices. |
| **Entire Agreement** | Standard entire agreement clause. Amendments in writing signed by both parties. |
| **Severability** | Standard severability. |
| **Waiver** | No waiver by course of conduct. |

### §23: Adverse Events (see HS-4)

Mandatory in ALL supplier contracts. See Hard Stops section.

### §24-25: Trade Sanctions and Export Control (see HS-1)

Mandatory and non-negotiable. See Hard Stops section.

### §26: Governing Law

| Position | Detail |
|---|---|
| **Standard** | Indiana law |
| **Acceptable** | Delaware, New York (US contracts) |
| **International** | Swiss or English law for OUS contracts |
| **Not acceptable** | Supplier's home state if not Indiana/Delaware/NY (creates unpredictable outcomes) |

### §27: Dispute Resolution

| Position | Detail |
|---|---|
| **Standard** | Marion County, Indiana (exclusive jurisdiction) |
| **Acceptable** | NY or Delaware if governing law was changed to match |
| **Not acceptable** | Mandatory arbitration (Lilly prefers court jurisdiction); supplier's home jurisdiction |
| **Escalation** | Contract Request and Consultation Tool |

## Rate Card and Pricing Review

When the contract includes a rate card or pricing schedule:

1. **Compare against market benchmarks** - if `commercial-negotiation-prep` or `market-rate-benchmarking` data is available, note where rates are above/below market
2. **Check for escalation clauses** - annual increases must be capped (3% or CPI, whichever is less). Open-ended escalation is not acceptable.
3. **Check UOM consistency** - rates should use consistent units (per hour, per day, per month) with clear conversion assumptions
4. **Volume commitments** - if the contract has volume-based pricing, verify the commitment is achievable and the penalty for underperformance is proportionate
5. **Most-favored-customer clause** - for strategic suppliers, consider requesting MFC pricing protection

## Review Output Checklist

Before delivering the review, verify:
- [ ] Every Hard Stop flagged with 🔴 and escalation SME identified
- [ ] Every modification flagged with 🟡 and playbook reference cited
- [ ] Every SME escalation flagged with 🔵 and contact email included
- [ ] Template origin correctly identified (Lilly paper vs. supplier paper)
- [ ] Amendment context noted (if reviewing an amendment)
- [ ] Rate card reviewed against benchmarks (if pricing is included)
- [ ] Pharma-specific requirements checked (adverse events, debarment, GxP)
- [ ] Review summary produced with risk assessment and recommended next steps

---