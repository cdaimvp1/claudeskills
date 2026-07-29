# Analysis Methodology Reference

## Table of Contents
1. Spend Cube Construction
2. Pareto Analysis Methodology
3. Concentration Metrics
4. Classification Taxonomy
5. Tail Spend Framework
6. Trend Decomposition
7. Contract Coverage Analysis
8. Business Unit Fragmentation Analysis
9. Supplier Development Analysis
10. Geographic Analysis
11. Sourceability & Addressable Spend

---

## 1. Spend Cube Construction

The spend cube is the core analytical structure. It is a multidimensional model where every spend record sits at the intersection of standardized dimensions, enabling slicing, dicing, and drill-down from any angle.

### Dimension Definitions

**Supplier Dimension:**
```
Level 0: Parent Company     (e.g., Accenture plc)
Level 1: Operating Entity   (e.g., Accenture Federal Services, Avanade)
Level 2: Remit-To Name      (e.g., Accenture LLP - as appears on invoice)
```

Parent-child resolution: If the user provides a supplier hierarchy or parent mapping, use it. Otherwise, attempt automated resolution:
1. Exact subsidiary match from known enterprise supplier databases
2. Name-similarity grouping (e.g., "IBM" / "IBM Corporation" / "IBM Consulting" → IBM parent)
3. Flag unresolved cases for user confirmation

Do NOT silently merge suppliers that may be distinct legal entities. When in doubt, keep separate and note in data quality log.

**Category Dimension:**
```
Level 1: Domain             (8-12 top-level domains)
Level 2: Category           (30-50 procurement categories)
Level 3: Subcategory        (100-200 specific subcategories)
```

Standard Lilly Domain Taxonomy:

| L1 Domain | Example L2 Categories |
|-----------|----------------------|
| IT | Cloud Infrastructure, Software/SaaS, Staff Augmentation, Hardware, Telecom, IT Consulting, Cybersecurity, Data & Analytics |
| Lab & Scientific | Lab Supplies & Consumables, Lab Equipment, Scientific Services, Reagents & Chemicals, Instruments, CRO Services |
| Professional Services | Management Consulting, Legal Services, Audit & Tax, Staffing (non-IT), Training & Development |
| Facilities & Real Estate | FM Services, Construction, Utilities, Security, Office Supplies, Furniture |
| Manufacturing & Operations | Raw Materials, Packaging, CMO/CDMO, Logistics, Warehousing, Quality Services |
| Marketing & Commercial | Advertising, Market Research, Events & Conferences, Digital Marketing, HCP Engagement |
| Clinical & Regulatory | Clinical Trials, Regulatory Consulting, Pharmacovigilance, Medical Writing, Biostatistics |
| HR & Benefits | Benefits Administration, Payroll Services, Recruitment, Relocation, Employee Programs |
| Travel & Expense | Travel Management, Corporate Card Programs, Ground Transportation, Lodging |
| Other / Unclassified | Catch-all for records that cannot be classified with confidence |

**Time Dimension:**
```
Level 0: Year               (CY or FY depending on data)
Level 1: Quarter            (Q1-Q4)
Level 2: Month              (Jan-Dec)
Level 3: Week               (optional, only if daily data provided)
```

Fiscal year handling: Lilly's fiscal year aligns with calendar year (Jan-Dec). If data uses a different fiscal calendar, note the mapping.

**Business Unit Dimension:**
```
Level 0: Division           (e.g., R&D, Commercial, Manufacturing, Corporate)
Level 1: Function           (e.g., IT, Finance, HR, Supply Chain)
Level 2: Cost Center        (specific department or cost center code)
```

If BU data is provided as cost center codes only, map to functional groupings where possible. Unresolvable codes go to "Unknown BU" with a data quality flag.

**Contract Coverage Dimension:**
```
Under Contract:    Transaction references a known contract/agreement
Off-Contract:      No contract reference (maverick/spot buy)
Unknown:           Contract reference field is blank (could be either)
```

### Cube Aggregation Rules

1. **Additive measures** (can be summed across any dimension): Spend ($), transaction count
2. **Semi-additive measures** (can be summed across some dimensions): Supplier count (cannot sum across suppliers - use distinct count)
3. **Derived measures** (calculated from aggregates): Average transaction size, % of total, YoY change, concentration metrics

**Handling double-counting:** When a transaction maps to multiple categories (rare but possible with split coding), allocate proportionally. Never count the same dollar twice in the total.

---

## 2. Pareto Analysis Methodology

### Standard Pareto Construction

1. Rank all suppliers by total spend (descending)
2. Calculate each supplier's share of total spend
3. Calculate cumulative share
4. Identify the Pareto break point (80% cumulative threshold)

**HARD RULE, kernel usage (per Execution Guardrails G11).** Steps 1-4, the A/B/C/D
segment assignment, the p80/p95/p99 counts and the Pareto Efficiency ratio are all
produced by calling `pareto_segments()` in the vendored `numeric_kernel.py`, not by
model arithmetic over the spend cube. This is the largest-N input this skill handles,
and a single mis-summed cumulative silently reorders supplier tiers.

`pareto_segments()` also resolves an ambiguity this document contains. Segment A is
defined here as "top suppliers up to 80% cumulative", while Pareto Efficiency below
is defined using "number of suppliers covering 80% of spend". Those two readings
differ for the one supplier whose spend straddles the line. The kernel resolves it in
favour of the second: a straddling supplier IS counted, so `p80_count` is the smallest
N whose cumulative actually reaches 80%. On a 50/25/25 split that gives p80 = 3, not
2, because two suppliers reach only 75%. Where suppliers land exactly on 80.0, no
extra supplier is added. Supplier ranking is also made order-independent (ties broken
by name) so two runs of the same data rank identically, per the skill's determinism
guarantee.

### Pareto Segments

| Segment | Definition | Typical Characteristic |
|---------|-----------|----------------------|
| Strategic (A) | Top suppliers up to 80% cumulative | Largest contracts, highest risk |
| Important (B) | Next suppliers from 80% to 95% cumulative | Significant but not dominant |
| Tactical (C) | Next suppliers from 95% to 99% cumulative | Managed with lighter touch |
| Tail (D) | Bottom 1% of spend (99% to 100% cumulative) | Remainder, often 50-70% of supplier count |

### Pareto Efficiency Ratio

```
Pareto Efficiency = (Number of suppliers covering 80% of spend) / (Total supplier count)

Interpretation:
  <10%: Highly concentrated - few suppliers dominate
  10-20%: Typical procurement portfolio
  20-30%: Moderately fragmented
  >30%: Highly fragmented - consolidation likely needed
```

### Pareto Visualization

Primary chart: Horizontal bar chart (spend) with cumulative line overlay.
- Bars: Individual supplier spend (left axis, $)
- Line: Cumulative % (right axis, 0-100%)
- Horizontal reference line at 80%
- Color-code bars by segment (A/B/C/D)

Show top 20-30 suppliers in the chart. Aggregate the remainder as "All Others."

---

## 3. Concentration Metrics

### Herfindahl-Hirschman Index (HHI)

```
HHI = Σ(market_share_i²) for all suppliers

Where market_share_i = supplier_i_spend / total_spend (as a percentage, 0-100)

HARD RULE, kernel usage (per Execution Guardrails G11): do NOT compute this by
hand. Call hhi() and hhi_band() in the vendored numeric_kernel.py. Shares are
PERCENTAGES, not fractions, which is what puts a monopoly at 10,000 rather than
1.0; the kernel pins that with a test because getting it wrong is a silent
factor-of-10,000 error. hhi() refuses an all-zero or empty spend distribution
rather than reporting 0, which would read as perfect competition.

Interpretation:
  HHI < 1,500:    Low concentration - competitive/diversified
  1,500-2,500:    Moderate concentration - some dependency risk
  HHI > 2,500:    High concentration - significant supplier dependency
  HHI = 10,000:   Monopoly - single supplier

Example:
  If 3 suppliers split spend 50/30/20:
  HHI = 50² + 30² + 20² = 2500 + 900 + 400 = 3,800 (High)
```

Calculate HHI at three levels:
1. **Portfolio-wide:** Across all suppliers
2. **Per category:** Within each L2 category
3. **Per business unit:** Within each BU's spend

### Concentration Ratios

```
CR1  = Top 1 supplier share - flags single-supplier dependency
CR3  = Top 3 supplier share - flags oligopoly risk
CR5  = Top 5 supplier share - standard portfolio concentration
CR10 = Top 10 supplier share - broad concentration view
```

### Risk Thresholds

| Metric | Low Risk | Medium Risk | High Risk | Critical |
|--------|---------|-------------|-----------|----------|
| CR1 | <20% | 20-35% | 35-50% | >50% |
| CR3 | <40% | 40-60% | 60-75% | >75% |
| HHI | <1,500 | 1,500-2,500 | 2,500-4,000 | >4,000 |
| Single-source categories | 0 | 1-2 | 3-5 | >5 |

---

## 4. Classification Taxonomy

### Auto-Classification Rules

When category data is missing, classify using this priority order:

**Priority 1: Supplier-Name Classification**
Known large suppliers map directly to categories:

```
Accenture, Deloitte, McKinsey, BCG, Bain     → Professional Services > Management Consulting
Cognizant, Infosys, TCS, Wipro, HCLTech      → IT > Staff Augmentation
AWS, Microsoft Azure, Google Cloud             → IT > Cloud Infrastructure
Salesforce, ServiceNow, Workday, SAP           → IT > Software/SaaS
Fisher Scientific, VWR, Sigma-Aldrich          → Lab & Scientific > Lab Supplies
IQVIA, Parexel, PPD, Covance                   → Clinical & Regulatory > CRO Services
CBRE, JLL, Cushman & Wakefield                 → Facilities & Real Estate > FM Services
```

This list should be extended based on the user's data. If a supplier is well-known in a specific industry, classify accordingly.

**Priority 2: Description-Based Classification**
Parse transaction descriptions for category keywords:

```
"cloud", "hosting", "server", "compute"       → IT > Cloud Infrastructure
"license", "subscription", "SaaS"              → IT > Software/SaaS
"consulting", "advisory", "strategy"           → Professional Services > Management Consulting
"staffing", "contractor", "temp"               → depends on context (IT vs. general)
"lab", "reagent", "assay", "instrument"        → Lab & Scientific
"construction", "renovation", "HVAC"           → Facilities & Real Estate
"clinical", "trial", "protocol", "CRO"        → Clinical & Regulatory
```

**Priority 3: GL Account Classification**
If GL account codes are provided, map using standard GL ranges:

```
6000-6099: Salaries & Benefits                 → Internal (exclude from procurement spend)
6100-6199: Professional Services               → Professional Services
6200-6299: IT Services & Software              → IT
6300-6399: Facilities                          → Facilities & Real Estate
6400-6499: Lab & Research                      → Lab & Scientific
6500-6599: Marketing                           → Marketing & Commercial
6600-6699: Travel                              → Travel & Expense
```

Note: GL mappings are company-specific. If Lilly's GL structure differs, ask the user for a mapping file.

**Priority 4: Amount-Based Heuristics**
As a last resort, use transaction amount patterns:
- Very small ($0-500): Likely supplies, subscriptions, or P-Card purchases
- Small ($500-5K): Likely supplies, small services, or software
- Medium ($5K-100K): Likely SOW-based services or equipment
- Large ($100K-1M): Likely project-based services, large equipment, or annual contracts
- Very large (>$1M): Likely enterprise contracts (IT platforms, large outsourcing, CRO)

These are weak signals. Use only when no other classification method works, and flag as "Low Confidence" classification.

### Classification Confidence Levels

| Level | Criteria | Dashboard Display |
|-------|---------|------------------|
| High | Exact category field populated and validated against taxonomy | No flag |
| Medium | Classified by supplier name or clear description match | Italic text |
| Low | Classified by heuristic or partial description match | Yellow highlight |
| Unclassified | Cannot classify with any confidence | Red, "Unclassified" label |

---

## 5. Tail Spend Framework

### Tail Definition Methods

**Method 1: Pareto-Based (Default)**
Tail = the D segment: all suppliers beyond the 99% cumulative spend line (the bottom 1% of spend), per the Phase 1.2 segmentation (A 0-80% / B 80-95% / C 95-99% / D 99-100%).

**Method 2: Absolute Threshold**
Tail = all suppliers with annual spend below $[threshold].
Common thresholds: $50K, $100K, $250K.

**Method 3: Transaction-Based**
Tail = suppliers with fewer than [N] transactions per year.
Common thresholds: 3, 5, 10 transactions.

Use Method 1 as default. If user specifies a threshold, use Method 2 or 3.

### Tail Spend Cost Model

```
TRANSACTION COST MODEL
========================
Average cost to process a PO:              $150-300
Average cost to manage a vendor (annual):  $2,500-5,000
Average cost to onboard a new vendor:      $3,000-8,000

For each tail supplier:
  Management Cost  = $3,500/year (midpoint)
  Transaction Cost = transaction_count × $200 (midpoint)
  Total Overhead   = Management Cost + Transaction Cost
  Spend Efficiency = supplier_spend / Total Overhead

  If Spend Efficiency < 3.0: Flag as inefficient
  If Spend Efficiency < 1.0: Flag as "costs more to manage than we pay them"
```

### Consolidation Opportunity Scoring

For each category with multiple tail suppliers:

```
Consolidation Score = (Tail Supplier Count × 0.3) 
                    + (Combined Tail Spend / Category Spend × 0.2)
                    + (Existing Strategic Supplier Available × 0.3)
                    + (Category Complexity Inverse × 0.2)

Score > 0.7: Strong consolidation candidate
Score 0.4-0.7: Moderate opportunity - evaluate further
Score < 0.4: Low priority - other factors likely prevent consolidation
```

---

## 6. Trend Decomposition

### Period-over-Period Change Decomposition

Total spend change is decomposed into four components:

```
ΔSpend = ΔExisting + ΔNew + ΔLost + ΔRate

Where:
  ΔExisting = Change in spend from suppliers present in BOTH periods
  ΔNew      = Total spend from suppliers in Period 2 but NOT Period 1
  ΔLost     = Total spend from suppliers in Period 1 but NOT Period 2 (negative)
  ΔRate     = Residual (price vs. volume effect within existing suppliers)
```

### Rate vs. Volume Decomposition (for existing suppliers)

```
For each supplier present in both periods:
  Volume Effect = (Quantity_P2 - Quantity_P1) × Price_P1
  Price Effect  = (Price_P2 - Price_P1) × Quantity_P1
  Mix Effect    = (Quantity_P2 - Quantity_P1) × (Price_P2 - Price_P1)

If quantity data is unavailable, use transaction count as a proxy:
  Volume Proxy = (TxnCount_P2 - TxnCount_P1) × AvgTxnSize_P1
  Price Proxy  = (AvgTxnSize_P2 - AvgTxnSize_P1) × TxnCount_P1
```

### Growth Rate Calculations

```
Simple Growth:           (P2 - P1) / P1 × 100
CAGR (multi-year):       (P_end / P_start)^(1/years) - 1
                         HARD RULE: call cagr() in numeric_kernel.py. It REFUSES
                         a zero or negative start value rather than returning a
                         huge number. Growth off a zero base is undefined, not
                         large, and reporting it would manufacture exactly the
                         phantom ">50% CAGR rapid growth vendor" the Phase 1.7
                         anomaly check exists to surface honestly. A vendor with
                         no prior-year spend is NEW; say so.
YoY (most recent pair):  (current - prior) / prior
                         HARD RULE: call yoy(). Same zero-base refusal.
Annualized Run Rate:     Last 3 months spend × 4 (quarterly annualization)
Rolling 12-Month:        Sum of most recent 12 months
```

### Seasonality Detection

```
For monthly data spanning 2+ years:
  1. Calculate monthly averages across all years
  2. Calculate the coefficient of variation (CV) across months
  3. If CV > 0.15: Flag potential seasonality
  4. Identify peak months and trough months
  5. Calculate seasonal index (month_avg / grand_avg)

Common procurement seasonality patterns:
  - Q4 budget flush (December/November spike)
  - Q1 new contract ramp (January/February)
  - Fiscal year start surge
  - Summer slowdown (July/August dip)
```

---

## 7. Contract Coverage Analysis

### Coverage Calculation

```
Contract Coverage Rate = Spend Under Contract / Total Addressable Spend × 100

Addressable Spend = Total Spend - Non-Addressable Spend
Non-Addressable includes:
  - Utilities (regulated rates)
  - Government fees and taxes
  - Intercompany transfers
  - Employee reimbursements
  - Petty cash / P-Card below threshold
```

### Coverage by Category

Calculate coverage rate per L2 category. Flag categories with coverage below threshold:

```
Coverage Thresholds:
  Strategic categories (>$5M):   Target >90% coverage
  Important categories ($1-5M):  Target >75% coverage
  Tactical categories (<$1M):    Target >50% coverage
```

### Maverick Spend Identification

Maverick spend = purchases from non-preferred suppliers or outside contracted terms.

```
Maverick Indicators:
  1. Supplier not on approved supplier list (if list provided)
  2. Transaction has no PO reference (spot buy / invoice-only)
  3. Spend in a category where a preferred contract exists but a different supplier was used
  4. Transaction amount exceeds single-purchase authority without PO
```

---

## 8. Business Unit Fragmentation Analysis

### Fragmentation Score

```
For each category:
  BU_count = number of distinct BUs purchasing in this category
  Spend_HHI_by_BU = Σ(BU_share²)
  
  Fragmentation = BU_count / Expected_BU_count
  (Expected = 1-3 for specialized categories, 3-5 for shared services)

  High Fragmentation: >5 BUs purchasing same category independently
  Indication: Demand aggregation opportunity - consolidate requirements
```

### Cross-BU Supplier Overlap

```
For each supplier appearing in 3+ BUs:
  Overlap Score = count of distinct BUs / total BU count
  
  High overlap (>50% of BUs): Enterprise supplier - ensure enterprise contract exists
  Medium overlap (25-50%):    Growing supplier - consider enterprise agreement
  Low overlap (<25%):         Localized use - may be appropriate
```

---

## 9. Supplier Development Analysis

### Development Classification Handling

SHARP and similar SAP systems track Supplier Development classifications as individual binary fields per supplier per transaction. A single supplier may carry multiple classifications simultaneously (e.g., both MBE and SBE).

**Classification hierarchy:**

```
TIER 1 (Federal/Standard):
  SBE - Small Business Enterprise
  MBE - Minority Business Enterprise
  WBE - Women Business Enterprise
  VOSB - Veteran-Owned Small Business
  SDVOSB - Service-Disabled Veteran-Owned Small Business
  HubZone - Historically Underutilized Business Zone
  SDB - Small Disadvantaged Business

TIER 2 (Composite / Intersectional):
  MWBE - Minority and Women Business Enterprise (MBE + WBE)
  MBE+WBE - Combined MBE and WBE (may differ from MWBE in some systems)
  WOSB - Women-Owned Small Business (WBE + SBE intersection)

TIER 3 (Extended):
  LGBTQ - LGBTQ-Owned Business
  8(a) - SBA 8(a) certified (may not appear in SHARP)
```

### Counting Rules (Avoid Double-Counting)

```
TOTAL SUPPLIER DEVELOPMENT SPEND = Sum of spend where ANY Supplier Development classification is positive
  (count each dollar ONCE regardless of how many classifications the supplier holds)

PER-CLASSIFICATION SPEND = Sum of spend where THAT SPECIFIC classification is positive
  (a supplier with MBE + WBE counts in BOTH classification totals)

Therefore: Sum of per-classification spend > Total Supplier Development spend (expected, not an error)

To determine if a supplier IS Supplier Development-classified:
  is_supplier_development = any of [SBE, MBE, WBE, VOSB, SDVOSB, HubZone, SDB, MWBE, LGBTQ, WOSB] is positive

Value detection for "positive":
  Positive: "SBE", "MBE", "Yes", "Certified", "Applicable", "Y", "1", true
  Negative: "Not SBE", "Not MBE", "No", "Not Certified", "N/A", "0", false, "", null
  
  Pattern: If value starts with "Not " → negative. Otherwise if non-empty → positive.
```

### Development Metrics

```
Development Rate = Total Supplier Development Spend / Total Addressable Spend × 100

Industry benchmarks (pharma/life sciences):
  Leading:    >15% Supplier Development spend
  Average:    8-12% Supplier Development spend
  Lagging:    <8% Supplier Development spend

Lilly targets (check with user - targets change annually):
  Overall:    Typically 10-15% of addressable spend
  MBE target: Varies by category
  WBE target: Varies by category
```

### Development Analysis Dimensions

```
1. OVERALL: Total Supplier Development vs. non-Supplier Development (donut chart)
2. BY CLASSIFICATION: Spend per classification (horizontal bar)
3. BY CATEGORY: Development rate per L1/L2 category (heat map - identifies gaps)
4. BY SUPPLIER: Top Supplier Development suppliers ranked by spend (table)
5. TREND: Development rate over time (line chart - are we improving?)
6. OPPORTUNITY: Categories with low Development rate but high supplier count 
   (suggests Supplier Development alternatives exist but aren't being used)
```

### Development Insight Rules

```
Rule DIV-001: Category Below Target
  Trigger: Any L2 category with Development rate < company target AND spend > $1M
  Type: Development Gap
  Action: Identify Supplier Development suppliers in this category for consideration

Rule DIV-002: Supplier Development Underutilization
  Trigger: Supplier Development supplier exists in a category but receives <10% of category spend
  Type: Development Gap
  Action: Evaluate shifting volume to the Supplier Development supplier

Rule DIV-003: No Supplier Development Suppliers
  Trigger: Category with >$500K spend and zero Supplier Development spend
  Type: Development Gap  
  Priority: Immediate
  Action: Supplier landscape search for Supplier Development alternatives

Rule DIV-004: Development Concentration
  Trigger: >50% of total Supplier Development spend goes to a single supplier
  Type: Concentration
  Action: Broaden the Supplier Development supplier base itself
```

---

## 10. Geographic Analysis

### Geographic Dimensions

SHARP and SAP provide multiple geographic lenses:

```
LILLY ENTITY (Company Code Country):
  Where the Lilly entity that made the purchase is located.
  Maps to: legal entity, tax jurisdiction, currency zone
  
VENDOR ORIGIN (Vendor Origin Country):
  Where the supplier is headquartered / registered.
  Maps to: supply chain risk, sanctions screening, trade compliance

AFFILIATE (Affiliate Country):
  The Lilly affiliate the spend is allocated to.
  May differ from company code for shared services or intercompany allocations.

VENDOR REGION (Region/State):
  Sub-country geographic detail (US state, EU region).
```

### Cross-Border Analysis

```
Classification:
  Domestic:      company_country == vendor_country
  Cross-Border:  company_country != vendor_country
  
  If SHARP provides a Cross_Border_Spend field, use it directly.
  If not, derive from company code country vs. vendor origin country.

Cross-Border Corridor = "{Lilly Country} → {Vendor Country}"
  Aggregate spend by corridor
  Top corridors reveal trade pattern concentration

Risk Signals:
  - >30% of category spend from single non-domestic country → supply chain concentration risk
  - Spend in sanctioned or restricted countries → compliance alert
  - High cross-border % in a category with domestic alternatives → potential reshoring opportunity
```

### Geographic Metrics

```
Domestic/Cross-Border Split:
  Domestic %:       [X]% of total spend
  Cross-Border %:   [X]% of total spend

Country Concentration (on vendor origin):
  Top country:      [Country] [X]% of total
  Top 3 countries:  [X]% combined
  Country count:    [N] unique countries

Entity Coverage:
  [N] Lilly entities across [N] countries represented in data
  Largest entity:   [Entity] $[amount]
```

---

## 11. Sourceability & Addressable Spend

### Sourceability Definition

Not all spend is addressable by procurement. Sourceability flags indicate whether procurement can influence the spend decision.

```
SOURCEABLE (Addressable):
  Procurement can negotiate, consolidate, or influence vendor/price selection.
  Examples: IT software, consulting, lab supplies, staff augmentation

NON-SOURCEABLE (Non-Addressable):
  Spend determined by business requirements, regulation, or monopoly.
  Examples: Utilities, government fees, royalties, intercompany transfers,
  sole-source scientific instruments with no alternative

UNKNOWN:
  Sourceability not classified in the data.
```

### Resolution When Multiple Flags Disagree

SHARP provides up to three sourceability flags that may conflict:

```
Priority Order:
  1. Mapped Sourceability (manually curated, highest authority)
  2. IKC Sourceable Status (IKC functional area classification)  
  3. MGC Sourceable Status (material group classification)

Resolution:
  If Mapped Sourceability exists → use it
  Else if IKC and MGC agree → use the shared value
  Else if IKC and MGC disagree → classify as "Non-Sourceable" (conservative)
    AND flag the discrepancy in data quality log

Report the conflict rate:
  "Sourceability flags disagree on [N] records ($[amount]), 
   defaulted to Non-Sourceable per conservative rule."
```

### Impact on Analysis

```
All primary analyses (Pareto, concentration, tail, insights) should be calculated 
on SOURCEABLE spend unless the user explicitly requests total.

Dashboard should:
  1. Show total spend as context (top banner)
  2. Default all charts/tables to sourceable spend
  3. Provide a toggle: "Show All Spend / Sourceable Only"
  4. Annotate when a view excludes non-sourceable spend

Report both:
  Total Spend:         $[amount]
  Addressable Spend:   $[amount] ([X]%)
  Non-Addressable:     $[amount] ([X]%)
  
  "Primary analysis covers $[addressable] in sourceable spend. 
   An additional $[non-addressable] is classified non-sourceable 
   and excluded from supplier rankings and concentration metrics."
```
