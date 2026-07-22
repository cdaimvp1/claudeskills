# Pricing Templates - Domain-Specific Patterns

Base template structure is defined in `artifact-schemas.md` (Tab list for pricing_template.xlsx). This file adds domain-specific tabs and fields.

---

## Domain: Enterprise SaaS / Cloud Software

**Additional tabs:**
- `SaaS_Subscription` - per-user or per-seat pricing with tier breaks; annual vs. monthly; multi-year discount schedule
- `API_Usage` - per-call or consumption-based pricing tiers (if applicable)
- `Storage_Overage` - data storage pricing beyond included allotment
- `Add_On_Modules` - optional module pricing (itemized, not bundled)
- `Support_Tiers` - Standard vs. Premium vs. Enterprise support pricing

**Key fields in License_Subscription tab:**
- Metric (per user / per seat / per transaction / per API call / flat)
- Base quantity (Year 1)
- Escalator cap (% per year)
- Multi-year discount (%) applied at what term
- Named user vs. concurrent user model

---

## Domain: Professional Services / Consulting

**Additional tabs:**
- `Rate_Card` - role-by-role hourly/daily rates; onshore vs. nearshore vs. offshore
- `Blended_Rate_Scenarios` - blended rate at 3 team compositions
- `Fixed_Fee_Milestones` - milestone-based fixed fee schedule (if hybrid model)
- `Expenses_Policy` - travel and expense cap as % of fees; reimbursable categories

**Key fields in Implementation_Services tab:**
- Role name
- Seniority level
- Rate (hourly or daily)
- Location (onshore / nearshore / offshore)
- Estimated hours per phase
- Total fees per phase

---

## Domain: Lab / Clinical Services

**Additional tabs:**
- `Test_Menu_Pricing` - per-test or per-assay pricing with volume tiers
- `Sample_Logistics` - collection, shipping, storage per sample unit
- `Turnaround_SLAs` - standard vs. expedited pricing
- `Regulatory_Surcharges` - GLP/GMP compliance fees, audit fees

---

## Domain: Hardware / Equipment

**Additional tabs:**
- `Unit_Pricing` - per-unit pricing at 3 volume scenarios
- `Maintenance_Support` - annual maintenance as % of list price; extended warranty
- `Installation_Services` - per-unit installation cost; site survey fees
- `Spare_Parts` - critical spare parts kit pricing
- `End_of_Life` - decommissioning or trade-in terms

---

## Domain: Chemicals / Materials

**Additional tabs:**
- `Catalog_Pricing` - per-SKU pricing with volume breaks (kg, L, unit)
- `Custom_Synthesis` - FTE or milestone-based pricing for custom work
- `Hazmat_Logistics` - shipping, handling, and disposal surcharges
- `Regulatory_Compliance` - COA, regulatory documentation fees

---

## Domain: Facilities / Real Estate Services

**Additional tabs:**
- `Service_Rates` - per-service-type unit pricing (cleaning, maintenance, security)
- `Management_Fee` - base management fee structure
- `Pass_Through_Costs` - how vendor-managed subcontractor costs are passed through
- `Performance_Incentives` - gain-share or penalty structure tied to SLAs

---

## Universal Fields (All Domains)

The `Commercial_Summary` tab must always include:

| Row | Description | Formula |
|-----|-------------|---------|
| Year 1 Total | Sum of all costs in Year 1 | `=SUM(License_Subscription!Y1, Implementation_Services!Y1, ...)` |
| Year 2 Total | Escalated per stated caps | `=Year1 * (1 + Escalator_Cap)` or reference detail tabs |
| Year 3 Total | | Same pattern |
| Year N Total | Continue through contract term | Same pattern |
| Contract Total | Sum of all years | `=SUM(Year1:YearN)` |
| NPV (7% WACC) | For multi-year deals; Year 1 occurs at contract start (t=0), not end of period 1 | `=Year1 + NPV(0.07, Year2:YearN)` |
| Implementation One-Time | Separated from recurring | `=SUM(Implementation_Services!Total)` |
| Total Contract Value (TCV) | Implementation + recurring | `=Implementation_OneTime + Contract_Total` |

### Volume_Scenarios Tab (Required)

Three volume scenarios must be formula-driven from the detail tabs:

| Scenario | Description | Approach |
|----------|-------------|----------|
| Base | User's stated sizing | Direct reference to detail tabs |
| Growth (+25%) | Volume increase | `=Base * 1.25` applied to volume-dependent lines |
| Growth (+50%) | Larger expansion | `=Base * 1.50` applied to volume-dependent lines |

Each scenario row must auto-calculate TCV and NPV. Delta columns: `$ vs Base` and `% vs Base`.

### Formula Standards

- All formulas must reference named ranges or cell references, never hardcoded values
- Escalator calculations: `=PRIOR_YEAR * (1 + Escalator_Rate)` where Escalator_Rate is a named cell in Assumptions
- NPV convention (apply everywhere NPV is computed, including each Volume_Scenarios row): Year 1 cash flow occurs at contract start (t=0) and must NOT be discounted. Excel's `NPV()` discounts its first listed value by one full period, so never pass Year 1 inside `NPV()`. Use `=Year1 + NPV(WACC, Year2:YearN)`. Passing `NPV(WACC, Year1:YearN)` understates present value by discounting Year 1 a year too early; do not use that form. State the discount rate (default 7% WACC) and the t=0 assumption in the Assumptions tab.
- Volume-dependent pricing: use `VLOOKUP` or `INDEX/MATCH` against tier break tables
- Currency: all amounts in USD unless multi-currency is explicitly required
- Rounding: display to nearest dollar, calculate with full precision

---

## Domain: Contingent Labor / Staff Augmentation

**Additional tabs:**
- `Rate_Card` -- role-by-role bill rates; onshore vs. nearshore vs. offshore
- `Volume_Discounts` -- discount tiers by FTE count or total spend
- `Conversion_Fees` -- temp-to-perm conversion fee schedule
- `Overtime_Holiday` -- overtime and holiday rate multipliers
- `Markup_Transparency` -- supplier markup percentage by role tier

---

## Domain: Marketing / Creative Services

**Additional tabs:**
- `Retainer_Model` -- monthly retainer by service tier
- `Project_Pricing` -- per-project pricing by deliverable type
- `Production_Costs` -- print, digital, video production rates
- `Media_Buying` -- agency fee structure for media placement
- `Usage_Rights` -- licensing and rights fees for creative assets

---

## Domain: Logistics / Transportation

**Additional tabs:**
- `Lane_Pricing` -- per-lane or per-shipment rates by mode
- `Accessorial_Charges` -- fuel surcharges, detention, lumper fees
- `Volume_Commitments` -- minimum volume requirements and penalties
- `Technology_Fees` -- TMS, visibility platform, EDI fees
- `Cold_Chain` -- temperature-controlled surcharges and compliance

---

## Guardrails

- All cells containing supplier-entered pricing must be unlocked (white background)
- All formula cells must be locked (light gray background, protection enabled)
- No hardcoded values in formula cells
- `Assumptions` tab must be completed -- blank is not acceptable
- `Exclusions` tab must be completed -- "None" is acceptable but must be stated
- Commercial_Summary must be 100% formula-driven from detail tabs -- no manual entry
- Volume_Scenarios must auto-calculate from Base inputs -- suppliers enter Base only

---