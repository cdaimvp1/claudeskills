# Definition Tracing Checklist

**Mandatory during Pass 2 (Governing Cross-Reference).** Every review involving data processing, AI/ML, or IP must trace these definitions through the governing documents before generating findings. A finding that involves data rights, AI training, IP ownership, or confidentiality without citing the specific applicable definition is incomplete.

## How to Use

For each definition below that is in scope for the review, record:
1. The definition text (quoted or paraphrased)
2. Where it lives (document, section, exhibit)
3. What it includes and excludes
4. Whether the WO/SOW scope language falls within or outside the definition
5. Any conflicts between definitions in different documents

## Always Trace (Every Review)

### Confidential Information
- **Find in:** MSA definitions exhibit (typically Exhibit A)
- **Key question:** What is carved out? Watch for broad carve-outs ("information known to supplier" without temporal qualification)
- **Cross-reference:** Does the WO scope create new categories of information not contemplated by the MSA definition?

### Work Product / Deliverables
- **Find in:** MSA definitions exhibit
- **Key question:** What is assigned to Lilly? Does the assignment cover everything created under the WO, or only specifically identified items?
- **Cross-reference:** Do the WO deliverables fall within the MSA's Work Product definition? Custom models, custom classifiers, custom scoring rubrics, and custom reports are typically Work Product. Platform features are not.

### Lilly Property
- **Find in:** MSA definitions exhibit
- **Key question:** Full scope of what Lilly owns or controls. Does it include data derivatives, model outputs, and AI-generated insights?
- **Cross-reference:** Is anything in the WO scope excluded from Lilly Property that should be included?

## Trace When Data Processing Is in Scope

### Personal Information / PHI
- **Find in:** Supplier Privacy Standard (SPS), BAA if executed
- **Key question:** What categories of data subjects are covered? Does the WO introduce new data subject categories not in the SPS exhibit?
- **Cross-reference:** SPS Exhibit A (Data Processing Information Form) against actual WO scope

### Lilly Information vs. Usage Data
- **Find in:** MSA definitions exhibit (critical distinction)
- **Key question:** Where does the supplier's right to use data end?
- **Why this matters:** Usage Data (typically operational telemetry: query logs, metadata) often has broader supplier use rights than Lilly Information (anything from Lilly or created in connection with services). If call recordings, transcripts, or AI-generated labels are "Lilly Information" rather than "Usage Data," the supplier cannot use them for cross-client model training, product improvement, or benchmarking without explicit permission.
- **Common failure:** Supplier treats human-generated labels, annotations, or training feedback as "Usage Data" when they are derived from Lilly content and should be classified as "Lilly Information."
- **Trace chain:** Read the Lilly Information definition, read the Usage Data definition, read any exclusions in each, then classify every data type flowing through the WO scope.

### Services Supportive Technology
- **Find in:** MSA definitions exhibit
- **Key question:** Does this definition cover AI/ML tools the supplier uses? If yes, are there use restrictions?
- **Cross-reference:** Does the AI Standard (Exhibit C) use a different term for the same concept?

## Trace When AI/ML Is in Scope

### Automated System / AI System / AI Model
- **Find in:** AI Standard exhibit (typically Exhibit C)
- **Key question:** Does the supplier's platform meet the definition? Does it include the HITL/supervised training component?
- **Cross-reference:** Is the system classified as High-Impact Use or Low-Impact Use? What triggers each classification?

### Supplier Training Content vs. Lilly Training Content vs. Lilly Content
- **Find in:** AI Standard exhibit
- **Key question:** What can the supplier use to train models? What is restricted to Lilly-only use?
- **Why this matters:** If Lilly call recordings, transcripts, or human labels are "Lilly Content," the AI Standard likely bars their use as "Supplier Training Content." If the WO's HITL section describes training on Lilly data, this creates a conflict that must be resolved with an explicit WO-level clause.
- **Trace chain:** Read Lilly Content definition, read Supplier Training Content definition, read the restriction in the AI Standard (typically Section 3.4/3.5), then determine whether the WO's HITL/training description falls within or outside the permitted use.

### Output / Lilly Automated Property / Supplier Automated Property
- **Find in:** AI Standard exhibit
- **Key question:** Who owns the outputs? Who owns trained models? Are custom classifiers and custom quality models "Lilly Automated Property"?
- **Cross-reference:** MSA Work Product assignment clause. Do AI outputs get assigned to Lilly through both the MSA and the AI Standard?

### AR Provider
- **Find in:** AI Standard exhibit
- **Key question:** Does the supplier use third-party AI providers? If yes, are they disclosed and treated as Subcontractors?
- **Cross-reference:** Supplier's Addendum A (AI description form) for disclosure of any external AI components

## Trace Output Format

For each traced definition, record in working notes:

```
DEFINITION TRACE: [Term]
  Source: [Document, Section/Exhibit]
  Text: [Quoted or paraphrased definition]
  Includes: [Key inclusions]
  Excludes: [Key exclusions]
  WO Scope Classification: [WO data/activity falls WITHIN / OUTSIDE / AMBIGUOUS]
  Conflict: [None / Conflict with {other definition} because {reason}]
  Finding Impact: [How this affects the analysis]
```

## Anti-Drift Check

Before generating any finding involving data, AI, IP, or confidentiality, verify:
- [ ] The relevant definition has been traced (entry exists in working notes)
- [ ] The finding cites the specific definition and explains why it applies
- [ ] If there is ambiguity between definitions (e.g., Lilly Information vs Usage Data), the finding states the ambiguity and recommends the protective classification
- [ ] The finding is not flagging a risk that the governing documents already resolve through their definitions

---