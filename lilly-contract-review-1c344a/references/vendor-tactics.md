# Pricing Integrity & Vendor Tactics Detection

Reference module for the `lilly-contract-review` skill. Loaded selectively for SOWs, Work Orders, Change Orders, and amendments. The playbook and commercial framework assume good faith. This module does not.

## Detection Categories

The playbook and commercial framework assume good faith. This section does not. SOWs, Work Orders, Change Orders, and amendments are where vendors introduce commercial terms that erode value - sometimes deliberately, sometimes through template drift. The skill must actively scan for these patterns. Every finding becomes a 🟡 or 🔴 issue in the review output depending on severity.

**When to apply:** Always for SOWs, Work Orders, Change Orders, and amendments. Selectively for MSAs (focus on item 8, Compliance/Security Gaps; per the applicability matrix below, items 7 and 11 check a subordinate document against its parent MSA and so do not apply to the MSA itself). Not applicable for CDAs, DPAs (unless they contain pricing or scope provisions).

**Detection Category 1: Pricing Integrity**

Pricing manipulation is the most common issue in change orders and SOW amendments. The skill must verify that every rate, fee, and charge in the document is consistent with the governing rate card, contract caps, and original pricing assumptions.

Flag:
- **Rate inflation:** Hourly or daily rates higher than the master agreement rate card allows. Compare every named role and rate in the document against the governing rate card. Any rate exceeding the contracted rate is a finding - even by $1. Calculate the total overage impact across the full term.
- **Duplicate charges:** Tasks, deliverables, or activities that are already covered in the original SOW or base agreement being billed again in a change order. Cross-reference the change order scope against the original scope document.
- **Bundled costs:** Multiple line items grouped into a single lump-sum figure that obscures the per-component pricing. Flag any lump-sum line item over $25K that doesn't have a breakdown. Request decomposition.
- **Incorrect unit pricing:** Misapplication of pricing units - e.g., per-hour rates applied as per-day, per-seat charged as per-user, or monthly rates quoted as annual without adjustment. Verify that units match the rate card definition.
- **Unapproved markups:** Travel, subcontractor, equipment, or materials markups that exceed contract-permitted limits. If the MSA says "subcontractor markup not to exceed 10%," and the SOW embeds a 25% markup, that's a finding. Check pass-through costs against any markup caps in the governing agreement.

**Output format:**
```
💰 PRICING INTEGRITY FINDING: [Type]
  Document Rate: [What the document charges]
  Contracted Rate: [What the rate card/MSA allows]
  Overage: [$ per unit and $ total impact over term]
  Evidence: [Section/line reference in document and rate card]
  Action: [Correct to contracted rate / Request breakdown / Escalate]
```

**Detection Category 2: Deliverable Ambiguity**

Vague deliverable language creates billable work with no measurable output and no acceptance criteria. The vendor gets paid for activity, not results. The skill must flag any deliverable that uses soft language.

**Red flag phrases** (flag any deliverable containing these):
- "Support implementation" / "support the development of"
- "Assist with" / "assist in"
- "Provide advisory services" / "provide guidance on"
- "Help coordinate" / "facilitate coordination of"
- "Participate in" / "contribute to"
- "Oversee" / "monitor" (without specific metrics or deliverables)
- "As needed" / "as required" / "as requested" (open-ended effort)
- "Best efforts" / "reasonable efforts" (without definition of what constitutes success)

For every deliverable in the document, check for three required elements. If any are missing, flag:
- **Acceptance criteria:** How does Lilly determine the deliverable is complete and acceptable? If there's no acceptance test, sign-off process, or quality standard defined, the vendor decides when they're done.
- **Completion definition:** What is the specific, tangible output? "Architecture documentation" is defined. "Architecture support" is not.
- **Timeline:** When is the deliverable due? If no date or milestone trigger, the vendor controls the schedule.

**Output format:**
```
📋 DELIVERABLE AMBIGUITY: [Deliverable Name/Description]
  Language: "[Exact vague language from the document]"
  Missing: [Acceptance criteria / Completion definition / Timeline - list all that apply]
  Risk: [Lilly pays for activity with no measurable outcome]
  Recommended Fix: [Rewrite to: "Deliver [specific output] by [date], accepted upon [criteria]"]
```

**Detection Category 3: Timeline Manipulation**

Change orders sometimes extend project timelines without legitimate justification, creating additional billable time.

Flag:
- **Unjustified schedule extensions:** The change order extends the timeline but the new scope doesn't warrant it. Compare the scope delta to the time delta - a minor scope addition shouldn't justify a 3-month extension.
- **Pre-existing dependencies:** Dependencies listed in the change order that already existed in the original project plan. The vendor is using known constraints as justification for new timeline extensions.
- **Re-baselining attempts:** Language like "re-baseline the project schedule" or "reset milestones" that effectively restarts the clock on delivery commitments without reducing cost.
- **Artificial milestone splitting:** A single deliverable from the original agreement broken into multiple sub-milestones in the change order, each billed separately. This inflates the apparent scope while delivering the same output. Example: "System deployment" becomes three separately billed milestones: "Deployment preparation," "Deployment execution," "Deployment validation."

**Output format:**
```
⏱️ TIMELINE FINDING: [Type]
  Original Timeline: [What the base agreement committed to]
  Proposed Change: [What the change order requests]
  Justification Provided: [Vendor's stated reason - or "None"]
  Assessment: [Justified / Unjustified / Needs clarification]
  Financial Impact: [Additional cost from extended timeline]
```

**Detection Category 4: Resource Substitution**

One of the most common vendor tactics. The proposal names senior resources to win the work. The change order or staffing plan quietly substitutes junior resources - at the same or similar rate.

Check for:
- **Role downgrades:** Senior Architect proposed → Consultant assigned. Solution Lead proposed → Analyst assigned. Compare named roles in the current document against the original proposal or SOW.
- **Experience downgrades:** "10+ years experience" in proposal → no experience requirement in SOW. "Industry expertise required" → "familiarity with industry preferred."
- **Location shifts:** Onshore resources proposed → offshore resources executed. This affects rate (offshore should be significantly cheaper), data residency, time zone coverage, and sometimes regulatory compliance.
- **Rate-to-role mismatch:** If the contract has a rate card by role, verify that the roles listed in the SOW/WO are being billed at the correct rate for the actual role level, not the originally proposed higher level.

**Output format:**
```
👤 RESOURCE SUBSTITUTION FINDING: [Type]
  Original Commitment: [Role/level/location as proposed or contracted]
  Current Document: [Role/level/location as stated in this document]
  Rate Impact: [Is Lilly paying senior rates for junior resources?]
  Contractual Basis: [What the MSA/rate card requires]
  Action: [Reject substitution / Require rate adjustment / Escalate]
```

**Detection Category 5: Responsibility Shifting**

Vendors sometimes shift their contractual responsibilities to Lilly through change orders or SOW amendments. Work that the vendor committed to perform becomes a Lilly dependency.

Check for:
- **Direct responsibility shifts:** A task assigned to the vendor in the original agreement now appears as a Lilly responsibility. Example: "Vendor responsible for architecture documentation" becomes "Client will provide architecture documentation."
- **Hidden client deliverables:** New Lilly obligations introduced in the change order that weren't in the original scope - data preparation, environment provisioning, resource allocation, stakeholder coordination.
- **New client dependencies:** The vendor's delivery timeline now depends on Lilly completing tasks that weren't previously required. This shifts delivery risk to Lilly - if Lilly is late on a dependency, the vendor has a contractual excuse for delay.

Cross-reference every "Lilly shall" / "Client will" / "Customer is responsible for" clause against the original agreement to detect shifts.

**Output format:**
```
🔄 RESPONSIBILITY SHIFT: [Description]
  Original Assignment: [Who owned this in the base agreement]
  Current Document: [Who owns it now]
  Impact: [Delivery risk / Additional Lilly effort / Cost exposure]
  Action: [Restore original assignment / Price the shift / Escalate]
```

**Detection Category 6: Hidden Recurring Costs**

Some change orders introduce ongoing financial obligations disguised as one-time project costs. The change order gets approved as a $50K project cost, but it quietly creates a $120K/year recurring obligation.

Flag when a change order or SOW introduces:
- **Tool or platform licensing** that continues beyond the project term
- **Support retainers** or ongoing maintenance commitments
- **Hosting or infrastructure costs** that become Lilly's responsibility post-implementation
- **Subscription fees** embedded in project costs that auto-renew
- **Recurring staffing** described as project resources but with no end date

For every cost element, determine: is this a one-time cost or does it create a future financial obligation? If recurring, calculate the annualized cost and total cost over a reasonable projection (3 years).

**Output format:**
```
🔁 HIDDEN RECURRING COST: [Description]
  Presented As: [How it appears in the document - one-time / project cost]
  Actual Nature: [Recurring - monthly/quarterly/annual]
  Annualized Cost: [$X/year]
  3-Year Projection: [$X total]
  Action: [Separate from project cost / Negotiate independently / Add termination right]
```

**Detection Category 7: Contractual Conflicts**

Change orders and amendments sometimes override master agreement protections - intentionally or through sloppy drafting.

Flag any language that:
- Uses **"Notwithstanding the Master Agreement..."** or **"Notwithstanding anything to the contrary..."** - these phrases introduce legal overrides of the governing agreement. Every instance must be reviewed to determine what protection is being overridden.
- Modifies **liability caps** - a change order that introduces a lower liability cap than the MSA effectively reduces Lilly's protection.
- Alters **indemnification obligations** - narrowing the vendor's indemnification or broadening Lilly's.
- Changes **warranty terms** - reducing warranty periods or scope.
- Modifies **IP ownership** - changing who owns work product, deliverables, or derivative works.
- Alters **termination rights** - restricting Lilly's TFC rights or adding termination fees not present in the MSA.
- Changes **governing law or venue** - a change order should never modify jurisdiction.

Cross-reference every legal provision in the change order / SOW against the parent MSA. The Order of Precedence clause determines which document controls in case of conflict - verify it and flag if the change order attempts to reverse precedence.

**Output format:**
```
⚖️ CONTRACTUAL CONFLICT: [Description]
  Document Language: "[Override language from the change order]"
  MSA Provision: [What the MSA says]
  Impact: [What protection Lilly loses]
  Severity: [High - alters material protection / Medium - modifies non-critical term / Low - clarification only]
  Action: [Delete override / Restore MSA language / Escalate to Legal]
```

**Detection Category 8: Compliance & Security Gaps**

Change orders that modify scope can introduce compliance and security implications not present in the original agreement - particularly relevant for regulated industries.

Flag when a change order:
- **Introduces offshore resources** without addressing data residency implications
- **Adds third-party tools or subcontractors** not covered by the original security assessment
- **Changes data handling** - new data types, new data flows, new storage locations
- **Modifies the technology architecture** in ways that affect security posture - new integrations, new APIs, new infrastructure
- **Creates new regulatory exposure** - clinical data handling, PHI/PII processing, cross-border data transfer
- **Bypasses the original security review** - the base agreement may have been reviewed by InfoSec, but the change order introduces new risk that hasn't been assessed

**Output format:**
```
🔒 COMPLIANCE/SECURITY GAP: [Description]
  Change Introduced: [What the change order adds or modifies]
  Compliance Impact: [Data residency / HIPAA / GDPR / InfoSec standard / AI Standard]
  Original Assessment: [What the initial security review covered]
  Gap: [What the initial review did NOT cover that this change introduces]
  Action: [Route to InfoSec / Route to Privacy / Require updated DPA / etc.]
  SME Escalation: [Required - @SME Name (email)]
```

**Detection Category 9: Dependency Inflation**

Vendors sometimes add artificial dependencies on Lilly actions to create contractual excuses for delays or to shift delivery risk.

Flag when:
- A change order introduces **new Lilly dependencies** that weren't in the original agreement and aren't logically required by the new scope
- Dependencies that **already existed in the original scope** are restated in the change order as new blockers - the vendor is retroactively creating excuse clauses for existing obligations
- Dependencies are **vaguely defined** - "Client must complete data cleansing" without specifying what "complete" means, what data, or by when
- The change order makes **vendor delivery contingent on Lilly actions** with aggressive timelines - "if Client does not provide X within 5 business days, timeline extends by 30 days"

**Output format:**
```
🔗 DEPENDENCY INFLATION: [Description]
  Stated Dependency: "[Vendor's language]"
  Previously Existed: [Yes - already in original scope / No - newly introduced]
  Legitimacy: [Legitimate - new scope requires this / Artificial - no logical basis]
  Risk: [Delivery excuse / Timeline extension / Cost increase if Lilly is "late"]
  Action: [Remove / Redefine with clear criteria / Accept with mutual timeline protection]
```

**Detection Category 10: Hidden Scope Reduction**

The reverse of scope creep - the vendor quietly reduces what they're delivering without reducing the price.

Flag when:
- A deliverable in the change order is a **downgrade** from the original commitment. Example: "Build automated reporting dashboard" becomes "Provide reporting data extracts." The output is less valuable, but the cost is the same or higher.
- **Quality specifications are relaxed** - "enterprise-grade" becomes "production-ready," "fully automated" becomes "semi-automated," "real-time" becomes "batch."
- **Coverage is narrowed** - "all Lilly business units" becomes "North America initially," "full integration" becomes "API documentation," "24/7 support" becomes "business hours."
- **Features are removed** without cost reduction - compare the feature list or scope of work item-by-item against the original.

Cross-reference every deliverable and scope item in the change order against the original SOW. Any reduction in output, quality, or coverage without a corresponding price reduction is a finding.

**Output format:**
```
📉 SCOPE REDUCTION: [Description]
  Original Commitment: [What the base agreement promised]
  Current Document: [What the change order delivers]
  Reduction: [Specific downgrade - output / quality / coverage / features]
  Price Impact: [Same cost / Higher cost / Reduced cost - by how much]
  Action: [Restore original scope / Require commensurate price reduction / Reject]
```

**Detection Category 11: Approval Manipulation**

Some change orders attempt to bypass or circumvent formal procurement governance.

Flag:
- **Retroactive change orders:** Work already performed, now seeking retroactive approval. Language like "this change order covers work performed between [date] and [date]." This eliminates Lilly's right to negotiate or reject.
- **Work started before approval:** Any indication that the vendor began work covered by the change order before Lilly signed it. Check dates - if the change order describes work already underway, the vendor is creating a fait accompli.
- **Urgency language designed to bypass review:** "Urgent execution required," "time-sensitive - approval needed by [date]," "delay will impact go-live." Artificial urgency is a negotiation tactic to prevent thorough review.
- **Authority bypass:** Change order routed to an approver below the FRAP threshold for the total value, or submitted as multiple small change orders that individually fall below approval thresholds but collectively exceed them (salami slicing).

**Output format:**
```
🚨 APPROVAL MANIPULATION: [Type]
  Evidence: [Specific language or dates indicating the issue]
  Governance Impact: [What process is being bypassed]
  Action: [Reject retroactive approval / Require formal process / Escalate to management]
```

**Detection Category 12: Effort Padding**

Inflated hours or FTE estimates increase cost without increasing output. This is the hardest category to detect without historical data, but the skill should flag statistically unusual effort estimates.

Flag when:
- **Hours seem disproportionate to scope:** 300 hours to configure a standard SaaS integration. 500 hours for a report. The skill should note when effort levels appear high relative to the complexity of the described work.
- **Effort increases without scope increase:** A change order that adds minimal scope but significantly increases hours or FTEs.
- **Vague effort justification:** Large hour blocks justified by terms like "project management," "coordination," "oversight," or "governance" without specific activities.
- **Historical comparison available:** If prior SOWs or change orders for similar work exist (via `negotiation-playbook-learning` if outcome data is available), compare the current effort estimate against historical actuals.

**Output format:**
```
📊 EFFORT PADDING CONCERN: [Description]
  Estimated Effort: [Hours / FTEs / Duration]
  Scope Description: [What the effort is for]
  Concern: [Why the estimate appears high - compare to scope complexity, industry norms, or historical data]
  Benchmark: [Historical comparison if available - "similar work in WO-2024-015 took X hours"]
  Confidence: [High - clear padding / Medium - appears high but may be justified / Low - flagging for review]
  Action: [Request effort breakdown / Compare to historical / Accept with cap]
```

**Applying the 12 categories:**

Not every category applies to every document. Use this guide:

| Category | Change Order | SOW | Work Order | Amendment | Order Form | MSA |
|---|---|---|---|---|---|---|
| 1. Pricing Integrity | ✅ Primary | ✅ | ✅ | ✅ | ✅ | Rate card only |
| 2. Deliverable Ambiguity | ✅ Primary | ✅ Primary | ✅ | ✅ | - | - |
| 3. Timeline Manipulation | ✅ Primary | ✅ | ✅ | ✅ | - | - |
| 4. Resource Substitution | ✅ Primary | ✅ Primary | ✅ | ✅ | - | - |
| 5. Responsibility Shifting | ✅ Primary | ✅ | ✅ | ✅ | - | - |
| 6. Hidden Recurring Costs | ✅ Primary | ✅ | ✅ | ✅ | ✅ | - |
| 7. Contractual Conflicts | ✅ Primary | ✅ | ✅ | ✅ Primary | - | - |
| 8. Compliance/Security Gaps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9. Dependency Inflation | ✅ Primary | ✅ | ✅ | ✅ | - | - |
| 10. Hidden Scope Reduction | ✅ Primary | ✅ | ✅ | ✅ | - | - |
| 11. Approval Manipulation | ✅ Primary | - | - | ✅ | - | - |
| 12. Effort Padding | ✅ Primary | ✅ Primary | ✅ | ✅ | - | - |
---