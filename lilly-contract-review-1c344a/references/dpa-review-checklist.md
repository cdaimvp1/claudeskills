# Data Processing Agreement Review Checklist

Reference module for the `lilly-contract-review` skill. Loaded when a DPA is in scope - either as the document under review or as an exhibit/attachment to an MSA, SOW, or Order Form.

## When This Applies

Load this checklist when:
- The document under review IS a DPA
- The contract references or attaches a DPA as an exhibit
- A vendor proposes using their own DPA instead of Lilly's Supplier Privacy Standard
- The contract involves processing of Personal Information or Lilly Information by the supplier

## Lilly Baseline: Supplier Privacy Standard

Lilly's standard is the Supplier Privacy Standard (SPS) and the Supplier Data Protection Addendum (DPA) referenced in the MSA. When a vendor proposes their own DPA, every provision below must be assessed against the Lilly baseline. Accept the vendor DPA only if it meets or exceeds each requirement.

## DPA Review Checklist

### 1. Scope and Definitions

| Check | Lilly Requirement | Common Vendor Deviation |
|---|---|---|
| Processing scope | DPA must cover all Personal Information processed by or on behalf of Lilly | Vendor narrows scope to exclude certain data types or processing activities |
| Personal Information definition | Must align with broadest applicable definition (GDPR + CCPA + applicable local law) | Vendor uses narrow definition that excludes business contact data, usage data, or metadata |
| Processor/Controller roles | Vendor is Processor; Lilly is Controller (or joint controller if applicable) | Vendor claims Controller status, which reduces Lilly's control over data handling |
| Sub-processing | Must address sub-processor use with Lilly consent mechanism | Vendor claims right to use sub-processors without notification or consent |

### 2. Processing Instructions and Purpose Limitation

| Check | Lilly Requirement | Flag If |
|---|---|---|
| Purpose limitation | Vendor processes data only per Lilly's documented instructions | Vendor reserves right to process for "legitimate business purposes" or "service improvement" |
| No secondary use | Vendor may not use Lilly data for any purpose other than performing services | Vendor includes carve-outs for analytics, benchmarking, or aggregated data use |
| AI/ML training | No use of Lilly data for model training without separate written agreement | Vendor's DPA is silent on AI training or includes broad consent |
| Aggregation/anonymization | Vendor may not aggregate or anonymize Lilly data for its own use | Vendor claims right to aggregated/anonymized data as non-personal |

**Escalation:** Any secondary use, AI training, or aggregation carve-out → Legal AIPC (Mailbox_Privacy_Contracts@lilly.com)

### 3. Breach Notification

| Check | Lilly Requirement | Hard Stop If |
|---|---|---|
| Timeline | Notification within 72 hours of discovery | Timeline exceeds 72 hours (72 hours aligns with the GDPR standard and Lilly's Supplier Privacy Standard §3.5 baseline) |
| Content | Notification must include: nature of breach, categories and approximate number of data subjects, likely consequences, measures taken or proposed | Notification requirements are vague or don't specify content |
| Cooperation | Vendor must cooperate with Lilly's investigation and remediation | Vendor limits cooperation to "commercially reasonable efforts" |
| Law enforcement delay | Vendor may delay notification only if required by law enforcement - not at vendor's discretion | Vendor has discretion to delay notification |

**Hard Stop:** Breach notification timeline > 72 hours. Escalate to Legal AIPC.

### 4. Sub-processor Controls

| Check | Lilly Requirement | Flag If |
|---|---|---|
| Prior consent | Lilly must have right to approve or object to sub-processors | Vendor uses general authorization without notification |
| Notification | Vendor must notify Lilly before engaging new sub-processors with reasonable advance notice | No notification mechanism or notice period < 30 days |
| Flow-down | Sub-processor agreements must impose equivalent data protection obligations | Vendor doesn't require equivalent protections from sub-processors |
| Sub-processor list | Vendor must maintain and share current list of sub-processors | No list available or vendor refuses to disclose |
| AI providers | LLM providers, AI model providers, and cloud AI services must be treated as sub-processors | Vendor excludes AI/LLM providers from sub-processor treatment (see AI Standard §9) |
| Liability | Vendor remains liable for sub-processor actions | Vendor disclaims liability for sub-processor breaches |

**Critical for AI/SaaS contracts:** If the vendor uses third-party AI providers (OpenAI, Anthropic, Google, etc.), these MUST be treated as sub-processors with data protection flow-down. This is the most commonly contested provision in modern SaaS DPAs.

### 5. Data Subject Rights (DSARs)

| Check | Lilly Requirement | Flag If |
|---|---|---|
| Cooperation | Vendor must assist Lilly in responding to data subject requests (access, deletion, portability, restriction, objection) | Vendor limits assistance or charges fees for DSAR support |
| Timeline | Vendor must respond to Lilly DSAR requests within timeline that permits Lilly to meet its regulatory deadlines | Vendor's response timeline exceeds 10 business days |
| Deletion capability | Vendor must be able to delete specific data subject's data on request | Vendor cannot delete individual records (only bulk) or claims technical inability |
| Data portability | Vendor must export data in machine-readable format on request | Vendor limits export formats or charges for data portability |

### 6. Cross-Border Data Transfer

| Check | Lilly Requirement | Flag If |
|---|---|---|
| Transfer mechanism | Appropriate legal mechanism for international transfers (SCCs, adequacy decision, BCRs) | No transfer mechanism identified when data crosses borders |
| US data residency | For pharma data: US data residency commitment unless specific business need requires otherwise | Data may be processed or stored outside the US without Lilly consent |
| Transfer impact assessment | Vendor has conducted transfer impact assessment for relevant jurisdictions | No TIA available or vendor refuses to share |
| Government access | Vendor discloses any government access requests and notifies Lilly to extent permitted by law | Vendor has no process for government access disclosure |

**Escalation:** Cross-border transfer without adequate mechanism → Legal AIPC + Cyber ISS Review

### 7. Security Requirements

| Check | Lilly Requirement | Flag If |
|---|---|---|
| ISS compliance | Vendor must comply with Lilly Information Security Standard | DPA doesn't reference ISS or vendor refuses ISS compliance |
| Encryption | TLS 1.2+ in transit, AES-256 at rest (minimum) | Weaker encryption standards or no encryption commitment |
| Access controls | Role-based access, least privilege, MFA for administrative access | No access control requirements or vendor resists MFA |
| Incident response | Documented incident response plan, tested annually | No incident response commitment or untested plan |
| Audit rights | Lilly right to audit security practices (direct or via third-party attestation) | DPA limits or eliminates security audit rights |

**Escalation:** Security concerns → Cyber ISS Review (Cyber_ISS_Review@lilly.com)

### 8. Data Return and Destruction

| Check | Lilly Requirement | Flag If |
|---|---|---|
| Post-termination return | Vendor must return all Lilly data within 90 days of termination in usable format | Return period < 90 days or format not specified |
| Destruction certification | Vendor must certify destruction of all copies after return period | No certification requirement or vendor retains copies |
| Residual data | No residual copies except as required by law (with notification to Lilly) | Vendor retains "anonymized" or "aggregated" copies post-termination |
| Backup destruction | Vendor must destroy data in backups within a reasonable period | Vendor claims inability to delete from backups or retains backup copies indefinitely |

### 9. Audit and Compliance

| Check | Lilly Requirement | Flag If |
|---|---|---|
| Audit right | Lilly right to audit data processing activities | DPA eliminates or materially limits audit rights |
| Third-party attestation | SOC 2 Type II, ISO 27001, or equivalent as primary mechanism | No attestation available or attestation doesn't cover data processing |
| Audit for cause | Lilly right to audit upon suspected breach without annual limitation | Audit for cause restricted or eliminated |
| Compliance demonstration | Vendor must demonstrate compliance on request | Vendor limits compliance evidence to attestation only |

### 10. Liability and Indemnification

| Check | Lilly Requirement | Flag If |
|---|---|---|
| Data breach liability | Vendor bears costs of breach notification, credit monitoring, remediation | Vendor caps or excludes data breach costs |
| Indemnification | Vendor indemnifies Lilly for losses from vendor's non-compliance with DPA | No indemnification for DPA breaches or indemnity is capped at a low amount |
| Regulatory fines | Vendor bears regulatory fines resulting from vendor's non-compliance | Vendor excludes regulatory fines from liability |

## DPA Review Output Format

```
DPA REVIEW - [Supplier Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DPA Source: [Lilly SPS / Vendor DPA / Negotiated]
Baseline Assessment: [Meets Lilly baseline / Below baseline - [N] gaps]

Gaps Found:
  [N]. [Category] - [Specific gap] - [Severity: Hard Stop / High / Medium]
  ...

SME Routing:
  🔵 Legal AIPC - [Topics requiring privacy review]
  🔵 Cyber ISS - [Topics requiring security review]

Recommendation: [Accept / Accept with modifications / Reject - use Lilly SPS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---