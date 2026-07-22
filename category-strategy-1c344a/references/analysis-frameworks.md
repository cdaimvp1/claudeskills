# Analysis Frameworks

Strategic frameworks for category analysis, supplier segmentation, spend decomposition, and risk scoring.

## Kraljic Matrix

The foundational framework for category positioning. Every category (or subcategory) sits in one of four quadrants based on two axes.

### Axis 1: Supply Risk (X-axis)
How difficult is it to switch suppliers or ensure continued supply?

**High supply risk indicators:**
- Few qualified suppliers (<3 viable options)
- High switching costs (integration, retraining, validation)
- Long qualification cycles (FDA validation, IT security review)
- Supplier-proprietary technology or IP dependency
- Geographic concentration (single region/country)
- Capacity constraints in the market
- Regulatory barriers to entry for new suppliers
- Long lead times with limited buffer options

**Low supply risk indicators:**
- Many qualified suppliers (>5 viable options)
- Low switching costs (standard specs, commodity)
- Short qualification cycles
- Open standards, no proprietary lock-in
- Global supply base with geographic diversification
- Ample market capacity
- Low barriers to entry

### Axis 2: Profit Impact (Y-axis)
How significant is this category's impact on Lilly's financial performance or business outcomes?

**High profit impact indicators:**
- Large annual spend (>$10M or >2% of total procurement spend)
- Direct impact on product quality or patient outcomes
- Significant impact on speed-to-market
- High cost of failure (regulatory, operational, reputational)
- Affects revenue-generating activities directly
- High volume purchased relative to total market (Lilly has buyer power)

**Low profit impact indicators:**
- Small annual spend (<$2M)
- Indirect/support function spend
- Standard quality requirements
- Low business criticality
- Small share of supplier's revenue (limited leverage)

### Quadrant Strategies

```
                    HIGH PROFIT IMPACT
                         │
    ┌────────────────────┼────────────────────┐
    │   LEVERAGE          │   STRATEGIC         │
    │                     │                     │
    │ • Competitive bid   │ • Partnership       │
    │ • Volume consolidate│ • Joint innovation  │
    │ • Short-term deals  │ • Long-term contract│
    │ • Benchmark often   │ • Exec relationship │
    │ • Maximize savings  │ • Risk sharing      │
    │ • Multiple suppliers│ • Deep integration  │
LOW ├─────────────────────┼─────────────────────┤ HIGH
RISK│   ROUTINE           │   BOTTLENECK        │ RISK
    │                     │                     │
    │ • Simplify, automate│ • Supply assurance  │
    │ • Reduce transaction│ • Develop alternates│
    │ • P-card / catalog  │ • Buffer inventory  │
    │ • Consolidate to 1-2│ • Long-term lock    │
    │ • Minimize mgmt time│ • Contingency plan  │
    │ • Delegate to BU    │ • Monitor closely   │
    └─────────────────────┴─────────────────────┘
                    LOW PROFIT IMPACT
```

### Scoring Methodology

Score each axis 1-5 to precisely position the category:

**Supply Risk Score (1-5):**

| Factor | Weight | 1 (Low) | 3 (Medium) | 5 (High) |
|--------|--------|---------|------------|----------|
| Supplier count | 25% | >10 viable | 3-10 viable | <3 viable |
| Switching cost | 20% | <$50K, <3mo | $50K-$500K, 3-12mo | >$500K, >12mo |
| Market capacity | 15% | Surplus | Balanced | Constrained |
| Lead time | 15% | <2 weeks | 2-12 weeks | >12 weeks |
| Qualification cycle | 15% | <1 month | 1-6 months | >6 months |
| Geographic concentration | 10% | Global, diversified | Regional | Single country/site |

**Profit Impact Score (1-5):**

| Factor | Weight | 1 (Low) | 3 (Medium) | 5 (High) |
|--------|--------|---------|------------|----------|
| Annual spend | 30% | <$1M | $1M-$10M | >$10M |
| Business criticality | 25% | Support function | Operational | Revenue/patient impact |
| Quality sensitivity | 20% | Standard | Important | Regulatory-critical |
| Cost of failure | 15% | Inconvenience | Disruption | Regulatory/safety risk |
| Buyer power | 10% | <1% of supplier revenue | 1-10% | >10% |

**Composite:** Supply Risk Score = weighted average; Profit Impact Score = weighted average.
- Quadrant assignment: Risk ≤ 2.5 = Low, > 2.5 = High; Impact ≤ 2.5 = Low, > 2.5 = High

### Movement Strategy

Categories can be moved between quadrants through deliberate action:

| From → To | How | Example |
|-----------|-----|---------|
| Bottleneck → Routine | Develop alternative suppliers, reduce switching cost | Qualify second-source CRO |
| Strategic → Leverage | Reduce supply risk through standardization | Move from proprietary to open-standard platform |
| Routine → Leverage | Consolidate fragmented spend | Aggregate BU-level office supplies into single contract |
| Leverage → Strategic | Recognize strategic value, invest in partnership | Elevate key IT staffing partner to managed services |

## Spend Analysis Methodology

### Step 1: Data Preparation
- Obtain AP/spend data: minimum 12 months, ideally 36 months
- Required fields: supplier name, amount, date, cost center/BU, description/category, PO number
- Normalize supplier names (merge variants: "Accenture LLP" = "Accenture Federal Services" = parent)
- Remove non-addressable spend (intercompany, taxes, utilities unless in-scope)
- Classify by subcategory using description mapping

### Step 2: Pareto Analysis
```
Calculate:
- Top 1 supplier % of spend
- Top 3 suppliers % of spend
- Top 5 suppliers % of spend
- Top 10 suppliers % of spend
- Tail count (suppliers below $50K annual)

Visualization: Pareto chart with cumulative % line
```

### Step 3: Trend Analysis
```
For each of last 3 years (or available periods):
- Total spend
- Supplier count
- Average spend per supplier
- Largest supplier spend
- YoY growth rate

Flag: Abnormal growth (>20% YoY), new large suppliers, disappearing suppliers
```

### Step 4: Contract Coverage
```
For each supplier:
- Is there an active contract? (Y/N)
- Contract end date
- Contract type (MSA, SOW, PO-based)
- Spend vs. contract value (utilization %)

Aggregate: % of total spend under contract
Target: >85% contract coverage for managed categories
```

### Step 5: Maverick Spend
```
Identify spend that bypasses preferred suppliers or contracts:
- Purchases from non-preferred suppliers when preferred exists
- Spend above contract ceiling without amendment
- Purchases without PO (invoice-only)

Flag: Maverick spend > 15% of category indicates governance gap
```

## Supplier Segmentation Model

Beyond Kraljic (which is category-level), segment individual suppliers within a category:

### Supplier Tiers

| Tier | Criteria | Relationship Model | Management Intensity |
|------|----------|-------------------|---------------------|
| **Strategic Partner** | >20% of category spend, deep integration, co-innovation, long tenure | Executive sponsorship, joint planning, quarterly business reviews | High - dedicated category manager time |
| **Preferred Supplier** | 5-20% of category spend, strong performance, competitive pricing | Regular business reviews, performance scorecards, development plans | Medium - structured governance |
| **Approved Supplier** | <5% of category spend, meets minimum standards, tactical use | Annual review, standard contract terms, price benchmarking | Low - standard process |
| **Transactional** | Spot purchases, one-time needs, tail spend | Minimal - PO or P-card, no relationship management | Minimal - automate |
| **Under Review** | Performance issues, pricing concerns, compliance findings | Active management - remediation plan or exit plan | High - focused remediation |

### Supplier Performance Scoring

Rate each supplier 1-5 on standardized dimensions:

| Dimension | Weight (default) | 1 | 3 | 5 |
|-----------|-----------------|---|---|---|
| Delivery/SLAs | 20% | Frequent misses | Occasional issues | Consistently meets/exceeds |
| Quality | 20% | Defects, rework needed | Acceptable | Zero defects, high quality |
| Responsiveness | 15% | Slow, unresponsive | Adequate | Proactive, fast |
| Pricing | 20% | Above P75 | P50-P65 | Below P50 |
| Innovation | 10% | No value-add | Some ideas | Active innovation partner |
| Compliance | 10% | Findings, violations | Clean | Exemplary |
| Relationship | 5% | Difficult | Professional | Collaborative, trusted |

**Composite score:** Weighted average (adjust weights by category - e.g., quality weight higher for GxP categories, pricing weight higher for leverage categories).

**Score interpretation:**
- 4.0-5.0: Strategic Partner candidate
- 3.0-3.9: Preferred Supplier
- 2.0-2.9: Under Review - improvement plan needed
- <2.0: Phase Out candidate

## Risk Scoring Framework

### Likelihood × Impact Matrix

```
              │ Low Impact (1) │ Med Impact (2) │ High Impact (3) │
──────────────┼────────────────┼────────────────┼─────────────────│
High (3)      │ 3 - Monitor    │ 6 - Mitigate   │ 9 - Critical    │
──────────────┼────────────────┼────────────────┼─────────────────│
Medium (2)    │ 2 - Accept     │ 4 - Monitor    │ 6 - Mitigate    │
──────────────┼────────────────┼────────────────┼─────────────────│
Low (1)       │ 1 - Accept     │ 2 - Accept     │ 3 - Monitor     │
```

**Risk score = Likelihood × Impact (1-9)**
- 1-2: Accept - document and monitor annually
- 3-4: Monitor - track quarterly, have contingency identified
- 6: Mitigate - active mitigation plan required
- 9: Critical - immediate action, escalate to procurement leadership

### Risk Category Definitions

**Supply Continuity Risk:**
- Likelihood: Based on supplier count, financial health, concentration, geographic spread
- Impact: Based on business criticality, time to qualify alternative, buffer availability

**Quality Risk:**
- Likelihood: Based on defect history, process maturity, regulatory track record
- Impact: Based on patient safety exposure, regulatory consequence, rework cost

**Pricing Risk:**
- Likelihood: Based on market volatility, contract protections (rate locks), competitive dynamics
- Impact: Based on spend volume, escalation trajectory, budget sensitivity

**Regulatory Risk:**
- Likelihood: Based on regulatory change pipeline, enforcement trends, supplier compliance history
- Impact: Based on regulatory severity (FDA warning letter, consent decree), remediation cost

**Operational Risk:**
- Likelihood: Based on complexity of integration, supplier process maturity, change frequency
- Impact: Based on downstream process dependency, recovery time, workaround availability

**Geopolitical Risk:**
- Likelihood: Based on country stability, trade policy trajectory, sanctions exposure
- Impact: Based on supply chain dependency, alternative availability, transition time

**Technology Risk:**
- Likelihood: Based on technology lifecycle stage, vendor roadmap, market evolution
- Impact: Based on migration cost, data portability, business process dependency

## Savings Classification

### Hard Savings (P&L Impact)
Cost reductions that directly reduce actual expenditure vs. prior period.
- Rate reductions on existing volume
- Volume discounts that reduce unit cost
- Supplier switches to lower-cost alternatives
- Scope reductions that eliminate unnecessary services
- **Measurement:** Year-over-year spend comparison at constant volume

### Cost Avoidance (Soft Savings)
Prevented cost increases that would have occurred without procurement intervention.
- Rate hold / escalation cap below market inflation
- Demand management reducing planned growth
- Specification changes that prevent cost increase
- Competitive process that prevents sole-source markup
- **Measurement:** Proposed cost vs. negotiated cost, or projected cost vs. actual

### Value Creation (Non-Financial)
Improvements that don't directly reduce cost but create business value.
- Faster delivery / shorter lead times
- Quality improvements reducing rework
- Innovation / new capabilities enabled
- Risk reduction / supply assurance
- Process efficiency / reduced admin burden
- **Measurement:** Qualitative assessment with specific examples

### Savings Target Benchmarks by Kraljic Quadrant

| Quadrant | Typical Savings Target | Primary Lever |
|----------|----------------------|---------------|
| Leverage | 5-15% of spend | Competitive sourcing, volume consolidation |
| Strategic | 2-5% of spend | Partnership value, demand management, innovation |
| Bottleneck | 1-3% of spend (focus on risk, not cost) | Alternative development, spec flexibility |
| Routine | 3-8% of spend | Process efficiency, consolidation, automation |
