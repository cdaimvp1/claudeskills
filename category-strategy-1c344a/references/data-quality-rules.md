# Data Quality Rules Reference

## Table of Contents
0. Adaptive Format Detection (SHARP and Similar)
1. Column Mapping Rules
2. Supplier Name Normalization
3. Amount Validation
4. Date Validation
5. Deduplication Logic
6. Currency Handling
7. Quarantine Criteria
8. Data Quality Scoring

---

## 0. Adaptive Format Detection (SHARP and Similar)

Enterprise spend data rarely arrives in a clean, standardized format. SAP data flows through reporting layers (SHARP/Power BI, BW, Ariba, custom extracts) that add prefixes, restructure columns, pre-parse dimensions, and rename fields. This section defines adaptive detection logic that handles known formats AND gracefully degrades for unknown-but-similar formats.

### Design Principle: Fuzzy-First, Confirm-If-Ambiguous

Never hard-code exact column names. Always:
1. Strip known prefixes and suffixes
2. Normalize to lowercase with underscores
3. Match against semantic alias groups using substring and fuzzy matching
4. If confidence < 80% on any critical mapping, show the user the proposed mapping and ask for confirmation

### Step 0.1: Prefix/Wrapper Detection and Stripping

Many reporting tools wrap field names in a source-identifying pattern. Detect and strip:

```python
KNOWN_PREFIXES = [
    r"SHARP_Procurement view\[(.+?)\]",    # SHARP Power BI extract
    r"SHARP_Finance view\[(.+?)\]",         # SHARP finance variant
    r"BW_\w+\[(.+?)\]",                     # SAP BW reports
    r"Ariba_\w+\[(.+?)\]",                  # Ariba Analytics
    r"S4_\w+\[(.+?)\]",                     # S/4HANA direct
    r"PowerBI_\w+\[(.+?)\]",               # Generic Power BI
]

# If no known prefix matches, check for a common pattern:
# If >50% of columns share a prefix pattern like "Source[FieldName]", strip it
GENERIC_PATTERN = r"^(.+?)\[(.+?)\]$"

# After stripping, normalize:
# 1. Replace spaces with underscores
# 2. Lowercase
# 3. Strip leading/trailing underscores
# 4. Collapse multiple underscores
```

### Step 0.2: SHARP-Specific Field Mapping

After prefix stripping, SHARP fields map to the standard schema. This mapping handles known SHARP column names and their common variants across different SHARP report configurations:

```
SHARP → Standard Schema Mapping (fuzzy match, not exact):

SUPPLIER FIELDS:
  vendor_name, vendor name                    → supplier_name (remit-to)
  vendor_parent                               → supplier_parent
  vendor_parent2                              → supplier_ultimate_parent
  vendor_code, vendor code                    → supplier_id
  
AMOUNT FIELDS:
  net_spend_in_usd, net_spend__in_usd         → amount (primary, USD-converted)
  invoice_loc_amount                           → local_amount
  loc_currcy                                   → currency

DATE FIELDS (pre-parsed dimensions - special handling):
  posting_date_(year), posting date (year)     → date_year
  posting_date_(quarter), posting date (quarter) → date_quarter
  posting_date_(month), posting date (month)   → date_month
  posting_date_year_&_qtr                      → date_year_quarter (composite)
  posting_date_year_&_month                    → date_year_month (composite)
  document_date_(year)                         → doc_date_year (secondary date)
  document_date_(month)                        → doc_date_month
  
  NOTE: SHARP provides dates as pre-parsed dimensions, NOT as a single date field.
  Reconstruct a transaction_date from year + month:
    transaction_date = parse(f"{date_year}-{date_month}-01")
  Handle month names (e.g., "April" → 4) and quarter labels (e.g., "Q2" → quarter number).

CATEGORY FIELDS:
  commodity_code_name                          → category_l3 (most specific commodity)
  l1_commodity_name                            → category_l1 (domain level)
  commodity_combined                           → category_combined
  commodity_code_use                           → category_code
  level_1_commodity_code                       → category_l1_code
  mgc_description                              → material_group
  description_of_the_material_group            → material_group_desc
  category_tree_groups                         → category_tree (strategic grouping)

BUSINESS UNIT FIELDS:
  business_area_description, mapped_business_area_description → division
  profit_ctr_name                              → profit_center
  cost_center_name                             → cost_center
  functional_group                             → functional_area
  business_unit_allocation                     → business_unit_code
  new_ibu_hub, ibu_hubs                        → ibu_hub

GEOGRAPHY FIELDS:
  company_code_country, company code_country   → geography_company
  vendor_origin_country_description            → geography_vendor
  vendor_origin_country_key                    → geography_vendor_code
  affiliate_country                            → affiliate_country
  cross_border_spend                           → cross_border

DIVERSITY FIELDS:
  sbe_classification                           → diversity_sbe
  mbe_classification                           → diversity_mbe
  wbe_classification                           → diversity_wbe
  mwbe_classification                          → diversity_mwbe
  mbe+wbe_classification                       → diversity_mbe_wbe
  lgbtq_classification                         → diversity_lgbtq
  sdvosb_classification                        → diversity_sdvosb
  hubzone_classification                       → diversity_hubzone
  vosb_classification                          → diversity_vosb
  wosb_classification                          → diversity_wosb
  sdb_classification                           → diversity_sdb

SOURCEABILITY FIELDS:
  mapped_sourceability                         → sourceability (primary - highest authority)
  ikc_sourceable_status                        → sourceability_ikc
  mgc_sourceable_status                        → sourceability_mgc

PO FIELDS:
  po_number                                    → po_number
  po_vs_non-po, po vs non-po                  → po_flag
  purchase_order_family_type                    → po_family_type
  po_line_number                               → po_line
  po_line_short_text                           → po_description

INVOICE FIELDS:
  invoice_number                               → invoice_number
  item_text                                    → line_item_description

PAYMENT FIELDS:
  payment_term_name                            → payment_terms
  po_terms_of_payment                          → payment_terms_code

GL FIELDS:
  gl_account_desc                              → gl_account_name
  gl_account                                   → gl_account_code

ADDITIONAL CONTEXT:
  company_code_desc                            → company_name
  plant_name                                   → plant
  region                                       → vendor_region
  city                                         → vendor_city
  wave_cycles                                  → sourcing_wave
  order_number                                 → order_number
  order_name                                   → order_name
  ac_doc_type_desc                             → doc_type
  post_key_desc                                → posting_type
  co_code_&_acc._doc_number                    → composite_doc_id
```

### Step 0.3: Handling Variant SHARP Reports

SHARP reports are configurable. Different users pull different column sets. The skill must handle:

**Missing columns gracefully:**
- If no diversity columns → skip diversity analysis, note in data quality log
- If no sourceability columns → treat all spend as addressable, note assumption
- If no geography columns → skip geographic analysis
- If no parent hierarchy → use supplier_name as its own parent
- If no composite date fields → reconstruct from individual year/quarter/month
- If no PO fields → skip PO vs. non-PO analysis

**Extra/unknown columns:**
- Ignore columns that don't map to any standard field
- Log unmapped columns in data quality report (user may want custom analysis on them)

**Column name variations:**
- SHARP column names may change between report versions
- Use fuzzy matching: if a column name has >70% token overlap with a known mapping, propose the match
- Example: "Vendor_Origin_Country_Key" vs. "Vendor Origin Country" → same field, different label

### Step 0.4: Non-SHARP SAP-Derived Formats

Apply the same adaptive logic for other SAP reporting paths:

**Ariba Analytics exports:**
- Columns may be prefixed with "Ariba_" or report name
- Amount fields: "Spend (USD)", "Total Amount", "PO Value"
- Supplier: "Supplier Name", "Supplier ID"
- Category: "Commodity", "Category L1/L2/L3"
- Date: Usually a single date field (not pre-parsed like SHARP)

**SAP ME2M (PO List):**
- Columns: "Vendor", "Net Order Value", "Material Group", "Document Date"
- Very different structure from SHARP - fewer columns, PO-centric

**SAP FBL1N (Vendor Line Items):**
- Columns: "Vendor Name", "Amount in local currency", "Posting Date", "G/L Account"
- AP-centric, invoice-level detail

**Generic CSV/Excel:**
- No prefix pattern
- Fall back to the alias dictionary in Section 1 below
- More likely to need user confirmation on mapping

### Step 0.5: SharePoint Data Discovery Patterns

When searching SharePoint for spend data (Phase 0 of SKILL.md), recognize these common file patterns:

```
SHARP reports:
  "Global Category Owner Report*"
  "SHARP_Procurement*"
  "Category Spend Report*"
  "Spend by Commodity*"
  
Ariba exports:
  "Ariba Spend*"
  "Sourcing Analytics*"
  
SAP direct:
  "ME2M*", "FBL1N*", "S_ALR_87012078*"
  
Custom reports:
  "*spend*analysis*" or "*spend*report*"
  "*supplier*spend*"
  "*procurement*report*"
```

When multiple files are found, prefer SHARP > Ariba > SAP direct > custom, and prefer the most recent version.

---

## 1. Column Mapping Rules

### Auto-Detection Algorithm

For each column in the source data:
1. Normalize header: lowercase, strip whitespace, remove special characters
2. Match against alias dictionary (below)
3. If no header match, sample first 20 non-null values and infer by data pattern
4. If still ambiguous, present mapping to user for confirmation

### Alias Dictionary

**supplier_name** (required):
```
Exact matches: vendor, vendor name, vendor_name, supplier, supplier name, supplier_name,
  payee, remit to, remit_to, trading partner, trading_partner, vendor_desc,
  supplier_desc, company, company name, company_name, bp name, business partner
Pattern matches: *vendor*, *supplier*, *payee*
Data pattern: Text, high cardinality (many unique values), no numeric-only values
```

**amount** (required):
```
Exact matches: amount, spend, total, net amount, net_amount, invoice amount,
  invoice_amount, po amount, po_amount, usd amount, usd_amount, value, 
  extended amount, extended_amount, line amount, line_amount, gross amount,
  total amount, total_amount, net value, commitment, spend amount
Pattern matches: *amount*, *spend*, *total*
Data pattern: Numeric, may contain currency symbols ($, EUR, etc.), decimals
```

**transaction_date** (required):
```
Exact matches: date, invoice date, invoice_date, po date, po_date, 
  payment date, payment_date, transaction date, transaction_date,
  posting date, posting_date, document date, doc date, created date,
  creation date, entry date, accounting date, period, fiscal period
Pattern matches: *date*, *period*
Data pattern: Date-parseable (YYYY-MM-DD, MM/DD/YYYY, DD-Mon-YY, etc.)
```

**category** (preferred):
```
Exact matches: category, commodity, commodity code, commodity_code,
  gl account, gl_account, account, spend category, spend_category,
  material group, material_group, purchasing group, purchasing_group,
  product category, product_category, unspsc, class, subclass,
  procurement category, cost element, expense type, expense_type
Pattern matches: *category*, *commodity*, *gl*, *account*
Data pattern: Text or alphanumeric code, medium cardinality (20-200 unique values)
```

**business_unit** (preferred):
```
Exact matches: bu, business unit, business_unit, cost center, cost_center,
  department, dept, org, organization, requesting org, plant, company code,
  company_code, profit center, profit_center, wbs, project, division, function
Pattern matches: *cost cent*, *business unit*, *department*, *org*
Data pattern: Text or code, low-medium cardinality (5-50 unique values)
```

**po_number** (optional):
```
Exact matches: po, po number, po_number, purchase order, purchase_order,
  po #, po#, order number, order_number, document number, doc number
Pattern matches: *po*, *purchase order*, *order num*
Data pattern: Alphanumeric, often has prefix (e.g., "45XXXXXXXX" for SAP POs)
```

**invoice_number** (optional):
```
Exact matches: invoice, invoice number, invoice_number, invoice #, inv #,
  invoice_no, inv_no, document, voucher, voucher number
Pattern matches: *invoice*, *voucher*
Data pattern: Alphanumeric, high cardinality
```

**contract_reference** (optional):
```
Exact matches: contract, contract number, contract_number, contract #,
  agreement, agreement number, outline agreement, scheduling agreement,
  master agreement, contract id, contract_id, contract ref
Pattern matches: *contract*, *agreement*
Data pattern: Alphanumeric code, medium cardinality
```

**supplier_parent** (preferred when available):
```
Exact matches: vendor parent, vendor_parent, parent company, parent_company,
  parent vendor, parent_vendor, parent name, parent_name, ultimate parent
Pattern matches: *parent*, *holding*
Data pattern: Text, lower cardinality than supplier_name (many-to-one)
Note: If two parent fields exist (e.g., Vendor_Parent and VENDOR_PARENT2), map the
first to supplier_parent and the second to supplier_ultimate_parent.
```

**geography_company** (optional):
```
Exact matches: company code country, company_code_country, entity country,
  lilly country, co code country, affiliate country
Pattern matches: *company*country*, *entity*country*, *affiliate*
Data pattern: Country names or ISO codes, low cardinality (5-20)
```

**geography_vendor** (optional):
```
Exact matches: vendor origin country, vendor_origin_country, vendor country,
  supplier country, supplier_country, vendor_origin_country_description
Pattern matches: *vendor*country*, *supplier*country*, *origin*country*
Data pattern: Country names or ISO codes
```

**diversity_classifications** (optional - multiple columns):
```
Detection: Look for columns containing classification keywords:
  *sbe*, *mbe*, *wbe*, *mwbe*, *lgbtq*, *sdvosb*, *hubzone*, *vosb*, *wosb*, *sdb*,
  *minority*, *diversity*, *small business*, *veteran*, *disadvantaged*
Data pattern: Binary-like values - "SBE" / "Not SBE", "Yes" / "No", "Certified" / "", 
  "Applicable" / "Not Applicable", or boolean
NOTE: Many diversity columns is expected (10+ in SHARP). Map each to its own field.
Do NOT collapse into a single column.
```

**sourceability** (optional - may be multiple columns):
```
Exact matches: mapped sourceability, sourceability, sourceable status,
  ikc sourceable status, ikc_sourceable_status, mgc sourceable status,
  mgc_sourceable_status, addressable, addressable spend
Pattern matches: *sourceab*, *addressab*
Data pattern: Binary - "Sourceable" / "Non-Sourceable", "Addressable" / "Non-Addressable"
Priority when multiple: Mapped Sourceability > IKC > MGC
```

**payment_terms** (optional):
```
Exact matches: payment terms, payment_terms, payment term name, payment_term_name,
  terms of payment, net terms, pay terms
Pattern matches: *payment*term*, *pay*term*, *net*days*
Data pattern: Text like "Net 30 Days", "Net 45", "2/10 Net 30", or numeric code
```

**po_flag** (optional):
```
Exact matches: po vs non-po, po_vs_non_po, po backed, po_backed, purchase order flag
Pattern matches: *po*vs*, *po*non*
Data pattern: Binary - "PO" / "Non-PO"
```

**gl_account** (optional):
```
Exact matches: gl account, gl_account, gl account desc, gl_account_desc,
  general ledger, g/l account, g_l account, account description
Pattern matches: *gl*account*, *general*ledger*, *g/l*
Data pattern: Numeric code (gl number) or text (gl description) - accept either
```

### Pre-Parsed Date Dimension Handling

Some formats (especially SHARP) provide dates as separate year, quarter, and month columns rather than a single date field. When this pattern is detected:

```python
# Detection: Look for year column + (quarter OR month column)
has_year = any column matching *year* with values like 2023, 2024, 2025
has_quarter = any column matching *quarter* with values like Q1, Q2, Q3, Q4
has_month = any column matching *month* with values like January, February, ... or 1-12

if has_year and (has_quarter or has_month):
    # Pre-parsed date dimensions detected
    # Reconstruct a transaction_date:
    
    if has_month:
        # Map month names to numbers
        MONTH_MAP = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        }
        transaction_date = date(year, MONTH_MAP[month.lower()], 1)
    
    elif has_quarter:
        # Map quarter to mid-quarter month
        QUARTER_MAP = {'Q1': 2, 'Q2': 5, 'Q3': 8, 'Q4': 11}
        transaction_date = date(year, QUARTER_MAP[quarter], 1)
    
    # Also check for composite fields like "2024-Q2" or "2024-April"
    # Parse these as backup if individual fields are missing
```

### Multi-Format Handling

**SAP Extracts (ME2M, FBL1N, S_ALR_87012078):**
- Vendor field: "Vendor" or "Name 1"
- Amount: "Net order value" or "Amount in LC" or "Amount in doc. currency"
- Date: "Document Date" or "Posting Date"
- Category: "Material Group" or "Purchasing Group"
- BU: "Plant" or "Cost Center" or "Company Code"
- PO: "Purchasing Document" or "Document Number"

**Ariba Reports:**
- Vendor: "Supplier" or "Supplier Name"
- Amount: "Amount (USD)" or "Spend"
- Date: "Created Date" or "Approved Date"
- Category: "Commodity" or "Commodity Name"
- BU: "Requisitioner Department" or "Business Unit"

**Generic AP Extract:**
- Vendor: "Vendor Name" or "Payee"
- Amount: "Invoice Amount" or "Payment Amount"
- Date: "Invoice Date" or "Payment Date"
- No category or BU fields expected (will need classification)

---

## 2. Supplier Name Normalization

### Step 1: Basic Cleaning
```
1. Trim leading/trailing whitespace
2. Remove double spaces
3. Convert to Title Case (preserve known acronyms: IBM, AWS, SAP, etc.)
4. Remove trailing punctuation (periods, commas)
5. Remove trailing legal entity suffixes for grouping purposes:
   Strip: Inc, Inc., Incorporated, LLC, L.L.C., LLP, Ltd, Ltd., Limited,
   Corp, Corp., Corporation, Co, Co., Company, PLC, plc, AG, GmbH, S.A.,
   S.A.S., B.V., N.V., SE, LP, L.P., Partners, & Co, and Co
   NOTE: Retain original name in raw data - normalization is for grouping only
```

### Step 2: Common Alias Resolution

Maintain a running alias map. Initialize with known large vendors:

```
"Accenture" = ["Accenture LLP", "Accenture Federal Services", "Accenture Song", "Avanade"]
"Deloitte" = ["Deloitte Consulting LLP", "Deloitte & Touche LLP", "Deloitte Tax LLP"]
"IBM" = ["IBM Corporation", "IBM Consulting", "International Business Machines"]
"Microsoft" = ["Microsoft Corporation", "Microsoft Licensing", "GitHub"]
"AWS" = ["Amazon Web Services", "Amazon.com Services LLC"]
"Google" = ["Google LLC", "Google Cloud", "Alphabet"]
"Cognizant" = ["Cognizant Technology Solutions", "Cognizant Worldwide"]
"Infosys" = ["Infosys Limited", "Infosys BPO"]
"SAP" = ["SAP America", "SAP SE", "SAP Labs"]
```

### Step 3: Fuzzy Matching
For suppliers not caught by alias resolution:
```
1. Calculate Levenshtein distance between all unique supplier names
2. Group names with distance < 3 (for names > 8 characters) or distance < 2 (shorter names)
3. Within each group, select the most frequent spelling as canonical
4. Present groupings to user for confirmation if more than 5 groups found
```

### Step 4: Parent-Child Resolution
If parent company mapping is provided:
```
1. Map each remit-to entity to its parent company
2. Create a supplier hierarchy: Parent → Operating Entity → Remit-To
3. Calculate spend at each level
4. Dashboard defaults to parent-level view with drill-down
```

---

## 3. Amount Validation

### Validation Rules

```
Rule AMT-001: Amount must be numeric
  Test: Can value be parsed as a number after removing currency symbols and commas?
  Fail action: Quarantine record

Rule AMT-002: Amount must not be zero (unless explicitly a $0 PO or amendment)
  Test: amount != 0
  Fail action: Flag as data quality issue, exclude from analysis unless user confirms inclusion

Rule AMT-003: Amount outlier detection
  Test: amount > (category_mean + 3 × category_stddev) OR amount > $10M (absolute cap)
  Fail action: Flag for review - may be valid (large contract) or data error (wrong decimal)

Rule AMT-004: Negative amount handling
  Test: amount < 0
  Action: Tag as credit/reversal. Net against supplier total. If net supplier spend < 0, 
  flag as anomaly (more credits than charges).

Rule AMT-005: Currency symbol stripping
  Action: Remove $, USD, EUR, GBP, JPY, etc. before parsing
  Retain original currency code in separate field

Rule AMT-006: Decimal/comma ambiguity
  Test: Does data use European formatting (1.000,50 vs 1,000.50)?
  Action: Detect by examining sample - if ambiguous, ask user
  Default: US formatting (comma = thousands, period = decimal)

Rule AMT-007: Unit price vs. extended amount
  Test: If both unit_price and quantity fields exist, verify: unit_price × quantity ≈ amount
  Fail action: Flag mathematical discrepancy, use amount field as authoritative
```

---

## 4. Date Validation

### Validation Rules

```
Rule DT-001: Date must be parseable
  Supported formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, DD-Mon-YY, 
  YYYYMMDD, M/D/YY, Mon DD YYYY, ISO 8601
  Fail action: Quarantine record

Rule DT-002: Date must not be in the future
  Test: transaction_date <= today
  Fail action: Flag - likely data entry error. Check if year is off by 1.

Rule DT-003: Date must be within reasonable range
  Test: transaction_date >= 2015-01-01 (10-year lookback max)
  Fail action: Flag - likely legacy data or date parsing error

Rule DT-004: Date completeness check
  Test: Are there gaps in the monthly series? (e.g., data for Jan-Jun and Aug-Dec but no July)
  Fail action: Flag missing periods in data quality scorecard. Note which months are absent.

Rule DT-005: Fiscal period resolution
  If date field contains fiscal periods (e.g., "2025-003" meaning March 2025 or period 3):
  Action: Convert to calendar date using fiscal calendar. Default: period 1 = January.
  If fiscal year ≠ calendar year, ask user for mapping.
```

---

## 5. Deduplication Logic

### Deduplication Tiers

**Tier 1: Exact Duplicate (highest confidence)**
```
Match on ALL of: supplier_name + amount + transaction_date + (invoice_number OR po_number)
Action: Remove duplicate, keep first occurrence. Log removal.
```

**Tier 2: Likely Duplicate (high confidence)**
```
Match on: supplier_name + amount + transaction_date (within 3 days)
AND: description similarity > 0.85 (if description available)
Action: Flag as likely duplicate. Remove if user confirms, otherwise keep both.
```

**Tier 3: Possible Duplicate (medium confidence)**
```
Match on: supplier_name + amount (exact) + transaction_date (within 30 days)
Action: Flag for user review. Do NOT auto-remove.
```

**Tier 4: Split Transaction**
```
Detect: Multiple records for same supplier on same date where amounts sum to a round number
Example: Two records for $50,000 and $50,000 on same date = possible split of $100,000
Action: Flag but keep separate (may be legitimate line items)
```

### Dedup Report

```
DEDUPLICATION SUMMARY
======================
Total records before dedup:    [N]
Tier 1 (exact) removed:       [N] records, $[amount]
Tier 2 (likely) flagged:       [N] records, $[amount]
Tier 3 (possible) flagged:     [N] records, $[amount]
Total records after dedup:     [N]
Net spend impact of removals:  $[amount]
```

---

## 6. Currency Handling

### Multi-Currency Detection
```
1. Check for currency code field in data
2. Check for currency symbols in amount field
3. If all amounts appear to be in one currency, assume USD unless told otherwise
4. If multiple currencies detected, require exchange rate source
```

### Conversion Rules
```
Priority 1: User-provided exchange rates
Priority 2: Transaction-date spot rates (if available in data)
Priority 3: Period-average rates (ask user for rates by period)
Priority 4: Current spot rate (warn that this introduces conversion variance)

Always:
  - Store original currency and amount
  - Store converted USD amount separately
  - Note conversion rate and date used
  - Calculate and report FX impact if > 2% of total spend
```

**HARD RULE, kernel usage (per Execution Guardrails G11).** Perform the conversion
itself by calling `convert_currency(value, currency, fx_table)` in the vendored
`numeric_kernel.py`, once per record, not by multiplying freehand across a spend
cube. `fx_table` maps a currency code to its multiplier to reach USD, and carries
the rate the priority ladder above selected.

The reason this one matters more than its arithmetic suggests: this is the
largest-N monetary dataset the suite handles, and a conversion applied
inconsistently across a few thousand rows does not announce itself. It shows up
as a supplier whose spend looks smaller than it is, which then ranks lower in the
Pareto, which then changes its tier.

`convert_currency()` **refuses an unknown currency code rather than assuming
parity**. That refusal is the point. Detection step 3 above ("if all amounts
appear to be in one currency, assume USD unless told otherwise") is a reasonable
default for a single-currency file, but it must never become a silent fallback
for an unrecognized code inside a multi-currency file: those records are
quarantined per Q-002's spirit, or the user supplies the rate. A record converted
at an invented parity rate is worse than a quarantined one, because it still
counts toward every total.

---

## 7. Quarantine Criteria

Records are quarantined (excluded from analysis) when they fail critical validations:

```
Q-001: Missing supplier name AND missing amount      → Cannot analyze
Q-002: Amount not parseable as numeric                → Cannot calculate spend
Q-003: Date not parseable                             → Cannot place in time dimension
Q-004: Negative net supplier spend after netting      → Anomalous, needs manual review
Q-005: Amount > $50M single transaction               → Likely data error, review needed
Q-006: Identified as internal transfer or intercompany → Not procurement spend
Q-007: Exact duplicate (Tier 1)                       → Removed to prevent double-counting
```

Quarantined records are:
1. Excluded from all analysis and dashboard views
2. Retained in the spend cube workbook on a "Quarantined" tab
3. Summarized in the data quality scorecard with reasons
4. Available for user review and override

---

## 8. Data Quality Scoring

### Composite Score Calculation

```
DQ Score = Weighted average of dimension scores (0-100)

Dimensions and Weights:
  Completeness (30%):  % of required fields populated across all records
  Validity (25%):      % of records passing all validation rules
  Consistency (20%):   % of supplier names resolved, categories consistent
  Uniqueness (15%):    Inverse of duplicate rate
  Timeliness (10%):    Most recent transaction within expected recency window

Interpretation:
  90-100: High quality - analysis results are reliable
  75-89:  Medium quality - results are directional with some gaps
  60-74:  Low quality - significant gaps, treat as preliminary
  <60:    Poor quality - recommend data remediation before analysis
```

### Dimension Scoring Detail

**Completeness Score:**
```
= (supplier_populated% × 0.35) + (amount_populated% × 0.35) + 
  (date_populated% × 0.20) + (category_populated% × 0.05) + 
  (bu_populated% × 0.05)
```

**Validity Score:**
```
= records_passing_all_rules / total_records × 100
```

**Consistency Score:**
```
= (1 - unresolved_supplier_variants / total_unique_suppliers) × 50 +
  (1 - unclassified_records / total_records) × 50
```

**Uniqueness Score:**
```
= (1 - duplicate_records / total_records) × 100
```

**Timeliness Score:**
```
If most_recent_transaction within last 90 days: 100
If within last 180 days: 75
If within last 365 days: 50
If older: 25
```

### Quality Issue Codes

| Code | Issue | Severity | Impact on Analysis |
|------|-------|----------|-------------------|
| DQ-001 | Supplier name missing | Critical | Record excluded from supplier analysis |
| DQ-002 | Amount missing or non-numeric | Critical | Record quarantined |
| DQ-003 | Date missing or unparseable | Critical | Record quarantined |
| DQ-004 | Category missing | Medium | Classification attempted, confidence reduced |
| DQ-005 | Business unit missing | Low | BU analysis incomplete |
| DQ-006 | Duplicate detected | Medium | May inflate spend totals |
| DQ-007 | Supplier name variant | Low | May fragment supplier totals |
| DQ-008 | Amount outlier | Medium | May skew averages and totals |
| DQ-009 | Date gap in series | Medium | Trend analysis may be misleading |
| DQ-010 | Currency inconsistency | High | Conversion errors affect all totals |
| DQ-011 | Negative net supplier | Low | Anomalous, excluded from rankings |
| DQ-012 | Contract ref missing | Low | Contract coverage analysis limited |
| DQ-013 | PO ref missing | Low | Maverick spend identification limited |
| DQ-014 | Mixed fiscal/calendar dates | Medium | Period alignment may be wrong |
| DQ-015 | Description too vague | Low | Classification confidence reduced |
