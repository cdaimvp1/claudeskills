# Commercial Analysis Framework

Reference module for the `lilly-contract-review` skill. Loaded selectively for documents containing pricing, commitment structures, or commercial terms (SOWs, Work Orders, Change Orders, Order Forms, MSAs with embedded pricing).

## Framework

Every contract has a commercial dimension. For some documents (Order Forms, subscription agreements, rate cards), commercial analysis is the primary review concern. For others (MSAs, DPAs), it's secondary but still relevant - liability caps, termination fee structures, and payment terms all have financial impact.

**When to perform full commercial analysis:**
- Order Forms: Always - commercial terms are the core of the review
- SOWs and Work Orders: Always - verify pricing against rate card, assess commitment structure
- MSAs with embedded pricing: When pricing terms, rate cards, or commitment structures are present
- Amendments that change commercial terms: Assess financial impact of modifications

**When to perform limited commercial analysis:**
- MSAs without embedded pricing: Note payment terms, liability cap adequacy, and termination cost exposure
- CDAs, DPAs, SLAs: Commercial analysis not applicable (note any fee provisions if present)

**Commercial analysis framework:**

```
COMMERCIAL ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRICING ASSESSMENT:
  Proposed Rate: [Rate and unit - e.g., $200/seat/month]
  Market Benchmark: [Range for this category - see benchmark methodology below]
  Position vs. Market: [At market / X% above / X% below]
  Volume Consideration: [Does the volume warrant a discount? What tier?]
  Rate Justification: [Is the premium justified by features, service level, exclusivity?]
  Benchmark Sources: [List each source with date and relevance - see below]

COMMITMENT STRUCTURE:
  Total Commitment: [Dollar amount]
  Commitment Type: [Fixed / Minimum + overage / Usage-based / Hybrid]
  Survives Termination: [Yes / No / Partial - describe]
  Flexibility: [Can Lilly reduce scope? Add scope? At what cost?]
  Risk Exposure: [Maximum amount Lilly could owe if the engagement fails]

SCOPE DEFINITION & CREEP RISK:
  Scope Clarity: [Well-defined / Ambiguous / Open-ended - describe]
  Scope Creep Risk: [Low / Medium / High - see assessment below]
  Change Order Mechanism: [Defined / Absent / Inadequate - describe]
  Out-of-Scope Triggers: [What happens when work falls outside the defined scope?]

ASSUMPTIONS & DEPENDENCIES:
  Pricing Assumptions: [What must remain true for the pricing to hold?]
  Assumption Risk: [What happens if assumptions break? Who bears the cost?]
  Change Request Process: [Structured / Ad hoc / Absent - describe]

TERM & RENEWAL:
  Initial Term: [Duration]
  Term Adequacy: [Appropriate for engagement? Too short to evaluate? Too long to commit?]
  Renewal Options: [Auto-renewal / Option / None]
  Price Protection: [Cap on increases? CPI? Fixed? None?]
  Switching Cost: [What does it cost Lilly to leave at term end?]

PAYMENT TERMS:
  Terms: [Net-30 / Net-45 / Net-60 / Other]
  Lilly Standard: [Net-45 minimum - deviation noted if applicable]
  Billing Frequency: [Monthly / Quarterly / Annual / Milestone]
  Early Payment Discount: [Available? Terms?]

VALUE AT RISK:
  Overpayment Risk: [$ range - difference between proposed and market rate × volume × term]
  Commitment Risk: [$ amount - maximum locked-in spend if engagement underperforms]
  Scope Creep Risk: [$ estimate - potential unbudgeted spend from scope expansion]
  Renewal Risk: [$ impact - cost exposure if no price protection at renewal]
  Total Value at Risk: [$ range - aggregate of above]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Pricing Benchmark Methodology:**

The skill must actively benchmark pricing - not just note that benchmarking should happen. For every full commercial analysis:

1. **Search for market rates.** Use web search to find current pricing data for the supplier's product category. Search for: published list prices (vendor's own website), competitor pricing for equivalent products, analyst reports or comparison sites, enterprise volume pricing reports, and Gartner/Forrester/IDC market data if available.

2. **Build a benchmark table.** Present every data point found with its source and date:
```
BENCHMARK DATA
  Source                          | Rate           | Date       | Notes
  ─────────────────────────────────────────────────────────────────────────
  [Vendor website - list price]   | $X/unit/mo     | [Date]     | Published list
  [Competitor A - list price]     | $Y/unit/mo     | [Date]     | Comparable product
  [Competitor B - enterprise]     | $Z/unit/mo     | [Date]     | Volume deal
  [Analyst report / article]      | $W range       | [Date]     | Market survey
  [Lilly internal - prior deal]   | $V/unit/mo     | [Date]     | Prior contract with this vendor
  ─────────────────────────────────────────────────────────────────────────
```

3. **Disclose benchmark quality.** Rate the benchmark confidence:
   - **HIGH:** Multiple independent sources, recent data (< 6 months), direct product comparisons
   - **MEDIUM:** Limited sources, some comparable but not identical products, data 6-12 months old
   - **LOW:** Single source, indirect comparisons, old data (> 12 months), or no public pricing found
   
   If benchmark confidence is LOW, state it explicitly: "Limited publicly available pricing data for this category. The benchmark should be supplemented by `commercial-negotiation-prep` with direct vendor quotes or Lilly's internal pricing history."

4. **Never fabricate benchmark data.** If web search returns no usable pricing data, say so. A stated "no public benchmark available" is infinitely more useful than a fabricated range. In this case, recommend that the rep engage `commercial-negotiation-prep` for primary market research or reference Lilly's internal rate card database.

**Scope Creep Risk Assessment:**

Scope creep is the most common source of unbudgeted procurement spend. Every SOW, Work Order, and service agreement should be assessed for scope creep exposure. Evaluate:

1. **Scope boundary definition:** Is the scope described in terms of specific deliverables, or in terms of effort/activities?
   - **Deliverable-based scope** (e.g., "build X system with Y features") has clear boundaries - anything not listed is out of scope. Lower creep risk.
   - **Activity-based scope** (e.g., "provide consulting services related to X") has fuzzy boundaries - almost anything can be argued as "related to." Higher creep risk.
   - **Unlimited/open-ended scope** (e.g., "provide services as requested by Lilly") has no boundaries. Maximum creep risk.

2. **Pricing model alignment with scope:** Does the pricing model incentivize or constrain scope expansion?
   - **Fixed price per deliverable:** Supplier bears creep risk - they're incentivized to constrain scope. Low Lilly risk.
   - **T&M / hourly:** Lilly bears creep risk - more hours = more cost regardless of scope definition. High Lilly risk without caps.
   - **Per-seat / subscription:** Neutral on scope, but creep can come from feature requirements that push to higher tiers.
   - **T&M with cap / not-to-exceed:** Moderate - cap limits total exposure but doesn't prevent creep within the cap.

3. **Change order / change request mechanism:** Does the contract define how scope changes are handled?
   - **Structured change order process:** Changes must be documented, priced, and approved before work begins. Flag if absent.
   - **Informal process:** Changes happen via email or verbal agreement. High risk - cost disputes after the fact.
   - **No process defined:** Any scope discussion is a negotiation from scratch. Maximum risk.

4. **Exclusions and assumptions:** Are there explicit exclusions ("this SOW does not include...")? Are there assumptions that, if wrong, trigger scope changes? The clearer the exclusions, the lower the creep risk.

**Scope creep risk output:**
```
SCOPE CREEP ASSESSMENT: [Low / Medium / High]
  Scope Type: [Deliverable-based / Activity-based / Open-ended]
  Pricing Model: [Fixed / T&M / Subscription / T&M with cap]
  Change Order Process: [Defined / Informal / Absent]
  Exclusions: [Explicit / Implicit / None]
  Key Risk: [One-line description of the most likely creep scenario]
  Recommended Mitigation: [Add change order provision / Cap T&M / Define exclusions / etc.]
```

**Assumptions and Change Request Assessment:**

Every pricing model is built on assumptions. When those assumptions break, one party absorbs the cost. The review must identify those assumptions and determine who bears the risk when they fail.

1. **Identify embedded assumptions.** Read the pricing, scope, and term provisions and extract every assumption the pricing depends on:
   - **Volume assumptions:** "30 seats" assumes Lilly needs exactly 30. What if they need 15? Or 60?
   - **Usage assumptions:** Subscription pricing assumes usage within a "fair use" or stated band. What are the overage mechanics?
   - **Resource assumptions:** T&M pricing assumes specific role levels and rates. What if the supplier staffs junior resources at senior rates?
   - **Timeline assumptions:** Project pricing assumes a timeline. What happens if Lilly-caused delays extend the project?
   - **Dependency assumptions:** The pricing may assume Lilly provides certain inputs (data, access, resources). What if Lilly is late?
   - **Technology assumptions:** The pricing may assume a specific platform version or infrastructure. What if a migration is required?

2. **Assess assumption risk.** For each assumption:
   - How likely is it to break during the term?
   - Who bears the financial impact - Lilly, supplier, or shared?
   - Is there a contractual mechanism for adjusting when the assumption breaks?

3. **Evaluate the change request process.** Beyond scope changes, assess how the contract handles mid-term adjustments:
   - **Seat/volume changes:** Can Lilly increase or decrease? At what cost? With what notice?
   - **Feature/scope changes:** Is there a process for requesting new features or modified scope? Who prices it?
   - **Rate changes:** Can rates change mid-term? Under what conditions?
   - **Resource substitutions:** If the supplier changes personnel, can Lilly object? Does it affect pricing?
   - **Timeline changes:** What happens if milestones slip? Is there a formal replanning process?

**Assumptions and change request output:**
```
ASSUMPTIONS REGISTER:
  # | Assumption                    | Risk if Broken           | Bearer    | Contractual Protection
  ──────────────────────────────────────────────────────────────────────────────────────────────────
  1 | [Volume = 30 seats]           | [Overpay if <30 needed]  | [Lilly]   | [None - no reduction right]
  2 | [Usage within fair-use band]  | [Overage fees]           | [Lilly]   | [Unclear - no overage cap]
  3 | [Project timeline = 6 months] | [Additional T&M charges] | [Shared]  | [Change order required]
  ──────────────────────────────────────────────────────────────────────────────────────────────────

CHANGE REQUEST PROCESS:
  Defined: [Yes / Partial / No]
  Covers: [Scope changes / Volume changes / Rate changes / Resource changes / Timeline changes]
  Missing: [List what the process doesn't cover]
  Approval Required: [Mutual / Lilly only / Supplier only / Silent]
  Recommended Action: [Add change order exhibit / Define process / Add adjustment rights]
```

The commercial analysis feeds into the review summary (Step 6) and, when commercial terms are present, into the counter-proposal output.
---