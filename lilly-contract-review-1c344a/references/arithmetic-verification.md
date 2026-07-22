# Arithmetic & Pricing Verification Procedure
#### 3E: Arithmetic & Pricing Verification

For any document containing pricing, rates, hours, totals, financial calculations, or price increase/escalation language, perform **all applicable** checks below. This is critical for Change Orders, Renewals, Amendments with pricing changes, and any multi-year or multi-period commitment.

**3E-1: Basic Arithmetic**

1. **Verify line-item math:** Rate × hours = line total for every row in every pricing table.
2. **Verify category subtotals:** Sum of line items = stated subtotal for each category.
3. **Verify grand total:** Sum of subtotals + expenses + taxes = stated total.
4. **Verify NTE/commitment:** Total fees + expenses = NTE amount.
5. **Cross-reference rate tables:** If multiple rate tables exist, verify consistency for equivalent roles and skill levels.
6. **Flag discrepancies:** Any math error is a finding, regardless of direction. Errors in Lilly's favor are still corrected - credibility matters.

**3E-2: Price Increase & Escalation Verification**

When the document contains any price increase, escalation, or adjustment language - whether in a renewal, change order, amendment, or multi-year pricing schedule - perform the following:

1. **Identify the escalation mechanism.** Extract the exact contractual language governing increases. Common patterns:
   - Fixed percentage annual increase (e.g., "rates increase by 3% annually")
   - CPI-indexed increase (e.g., "adjusted by CPI-U, not to exceed 5%")
   - Tiered increases (e.g., "3% in Year 2, 4% in Year 3")
   - Negotiated increase (e.g., "as mutually agreed")
   - Step-up pricing (e.g., specific rates stated per year)

2. **Determine compounding vs. simple increase.** If the contract says "3% annual increase," determine whether the supplier applied:
   - **Compounding** (Year N = Year N-1 × 1.03) - each year's increase builds on the prior year's increased rate
   - **Simple** (Year N = Base Year × (1 + 0.03 × N)) - each year's increase is calculated from the original base rate
   - If the contract is ambiguous, flag it as a clarification item and calculate both to show the financial delta.

3. **Verify every stated increased rate against the formula.** For each rate, role, or line item that changes across periods:
   - Start with the base rate (Year 1 / initial period rate)
   - Apply the stated escalation formula step by step
   - Compare your calculated result to the supplier's stated increased rate
   - Flag any rate where the supplier's stated amount ≠ the formula-derived amount
   - **Round to the same precision as the document** - if rates are stated to the cent, verify to the cent.

4. **Verify cumulative totals reflect the correct escalated rates.** If the document includes annual or period totals:
   - Recalculate: escalated rate × volume/hours × months/periods = period total
   - Verify the grand total across all periods sums correctly
   - Verify the aggregate contract value reflects the correct compounded/simple totals

5. **Verify renewal pricing against the governing agreement.** For renewals and change orders:
   - Identify the applicable price increase provision in the MSA or prior agreement
   - Confirm the increase applied in the renewal/CO is within the contractual cap
   - If the increase exceeds the contractual cap, flag as 🔴 HIGH RISK
   - If no cap exists in the governing agreement, flag the absence as a protection gap
   - If the renewal introduces new rates not in the original rate card, flag each new rate for benchmarking

6. **Check for hidden increases.** Suppliers sometimes embed price increases in ways that don't trigger the escalation cap:
   - Role reclassification (same person, new title, higher rate - "Senior Consultant" becomes "Principal Consultant")
   - Scope restructuring (same work, fewer hours at higher rate - total looks flat but rate increased)
   - Fee restructuring (moving costs from hourly to fixed fee, or adding new fee categories)
   - Volume reduction with rate increase (supplier proposes fewer units at a higher unit price - total stays flat but unit economics worsen)
   - New line items that duplicate existing scope under different names
   - Platform/license fees that were previously included in service fees now broken out separately

7. **For Change Orders specifically:** Verify that:
   - The CO price is additive to (or properly modifies) the existing contract value, not a replacement unless explicitly stated
   - Rates in the CO match the contracted rate card (or the escalated rate card if mid-term)
   - The revised NTE/total contract value is correctly calculated: original value + CO value (or original value - removed scope + added scope)
   - If the CO removes scope, verify the credit amount uses the same rates as the original, not discounted rates
   - Hours/quantities are reasonable for the scope described (apply effort padding detection from vendor-tactics.md)

**3E-3: Price Increase Findings Format**

```
🔢 PRICING VERIFICATION FINDING: [Description]
  Escalation Language: [Exact contractual provision quoted]
  Base Rate: [Original rate from base period]
  Expected Rate (calculated): [Rate derived from applying the stated formula]
  Stated Rate (document): [Rate the supplier actually listed]
  Discrepancy: [$ amount per unit and direction, e.g., "$12/hr overcharge"]
  Annualized Impact: [Estimated $ impact across the period, e.g., "$14,400/yr if 1,200 hrs"]
  Cumulative Impact: [Total $ impact across remaining contract term]
  Location: [Section/table/exhibit reference]
  Action: [Correct / Reject increase / Clarify formula / Counter with correct calculation]
```

**3E-4: General Arithmetic Findings Format**

```
🔢 ARITHMETIC FINDING: [Description]
  Stated: [What the document says]
  Calculated: [What the math produces]
  Discrepancy: [$ amount and direction]
  Location: [Section/table reference]
  Action: [Correct / Clarify with supplier]
```

**Critical rule:** Arithmetic and pricing errors are always flagged in the redlined .docx as tracked changes (correcting the wrong numbers) AND as comments (explaining the discrepancy with the calculation shown). They are also always included in the Review Summary under Commercial Analysis. Pricing errors that exceed the contractual escalation cap are flagged as 🔴 HIGH RISK.


---