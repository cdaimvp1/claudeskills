# Category Strategy dashboard — build spec

Written 2026-07-27. Basis: the two files Marc supplied — `platform-category-strategy.html`
(most current) and `category-strategy-dashboard.html` (older, the donor) — plus the seed data
captured from the platform's own Deep Analysis renderer.

## 1. What was verified, not assumed

Read directly from the platform file in a browser:

- The outer **Strategy & Plays / Deep Analysis** switch is real. Deep Analysis carries 11 tabs:
  Overview · Pareto & Tail · Suppliers · Subcategories · Market & Kraljic · Risk · Strategy ·
  Savings & Scorecard · Supplier Development\* · Rationalization · Trend & Change.
- The standalone Strategy & Plays view carries **Supplier Landscape, Portfolio Risk Overview,
  Opportunities and Porter** — four panels that duplicate Suppliers, Risk and Market & Kraljic.
  This is the duplication to remove.
- A category selector already sits above the tab row (5 categories). The redundancy is the
  outer mode switch, not the selector.
- `Supplier Development*` carries an asterisk: the platform's own data-gated marker.
- **The live path is API-dependent.** The page POSTs to `/api/category-strategy` and
  `/api/supplier-risk`; offline these return 501/404 and it falls back to seed. This is the real
  cause of the "two rendering paths". **Our artifact has no API, so the seed path IS the product** —
  one skeleton, data availability decides whether a panel is populated or gap-stated.

Donor-module check (old file vs platform), verified by search:

| Module | Old | Platform | Verdict |
|---|---|---|---|
| Spend Under Contract | yes | no | restore |
| Fragmentation Map | yes | no | restore |
| Execution Pillars | yes | no | restore |
| Sequenced Actions | yes | no | restore |
| Spend Forecast | yes | no | restore, improved |
| Most Fragmented Subcategories | yes | no | restore |
| Delivery Model Split | yes | no | merge into segment mix |
| Citation Log | yes | no | restore as evidence drawer |
| Escalation Triggers | yes | **yes** | already present — surface, don't "restore" |
| Strategy Options | yes | **yes** | already present — surface, don't "restore" |
| Rate vs volume | no | yes | platform-only, keep |

The last three correct the assessment Marc shared: Escalation Triggers and Strategy Options are
already in the platform file, and rate-vs-volume is a platform strength the old file lacks.

## 2. Structure — 7 tabs, not 11

The approved #4 plan is 7 tabs; the assessment argued for keeping 11. Its own panel logic keeps
moving panels between tabs and concedes Supplier Development could fold into Suppliers, so the
11-tab shape is not load-bearing. Every panel it wants is kept; the navigation is shallower.

| # | Tab | Absorbs (from the 11) |
|---|---|---|
| 1 | Overview | Overview |
| 2 | Spend & Suppliers | Suppliers + Pareto & Tail + Subcategories |
| 3 | Market & Risk | Market & Kraljic + Risk |
| 4 | Strategy & Plays | Strategy + the standalone Strategy & Plays view |
| 5 | Savings & Scorecard | Savings & Scorecard |
| 6 | Supplier Program | Supplier Development + Rationalization |
| 7 | Execution | Trend & Change + roadmap / decision windows |

Removed: the outer mode switch. One category selector stays above the tabs.

## 3. Data availability — the column the assessment could not provide

Captured seed: 5 categories, each with `meta` (38 fields), `annual`, `suppliers`, `others`,
`newVendors`, `exitVendors`, `pareto`, `subcats`, `splitTotals`, `forces`, `risks`, `savings`,
`kpis`, `swing`, `diversity`, `narr` (20 narrative fields) and a **`$src` provenance block for
15 sections**.

**HOLD — build fully:**

| Panel | Fields |
|---|---|
| Category KPIs, spend trend | `meta.s23/s24/s25/s26ytd`, `yoy2425`, `cagr2325`, `annual[]` |
| Concentration | `hhi`, `topShare`, `top5/10/20Share`, `p80` |
| Pareto + A/B/C/D tiering | `pareto[]` with `cumPct` |
| Tail thresholds | `tail50/100/250` + `Spend` + `Pct`, `tailHoursLo/Hi` |
| Supplier table + tiers | `suppliers[]` (`r,n,cc,s3..s6,tot,share,yoy,tier`), `others[]` |
| New / exiting vendors | `newVendors[]`, `exitVendors[]` |
| Subcategory spend + mix | `subcats[]` (`n,host,tot,pct`), `splitTotals{a,b}` |
| Porter + net leverage | `forces[]` (`f,s,c,d`) |
| Kraljic position | `narr.kraljicPos/kraljicHigh/kraljicImpl` |
| Risk register | `risks[]` (`risk,driver,l,i,mit`) |
| Savings pipeline | `savings[]` (`lever,type,lo,hi,basis,conf`) |
| Scorecard | `kpis[]` (`kpi,cur,tgt,note,cadence,needs`) |
| Diverse spend | `diversity{target,years}` |
| Swing drivers | `swing[]` (`n,delta,cause`) |
| Data quality | `unclassified`, `fieldCompletenessPct`, `narr.dq` |
| Evidence / citations | `$src` per section — build the Citation Log from this |

**DERIVABLE — build, clearly labelled as derived:**

| Panel | Derivation |
|---|---|
| Spend Forecast (low/base/high) | `annual[]` + `cagr2325`; band from history, not a slider |
| Fragmentation Map | `subcats[]` spend — **needs vendor-count per subcategory (absent)**; render spend-only until added |
| Change decomposition | `newVendors` + `exitVendors` + existing growth from `s4→s5` |
| Effort-to-value on the tail | `tailHoursLo/Hi` against tail spend |
| Multi-subcategory anchors | `suppliers[].cc` — single code per supplier, so partial |

**GAP — do NOT build populated; render as a stated gap with the field needed:**

| Panel | Missing field |
|---|---|
| Spend Under Contract | contract coverage / agreement status per supplier |
| Renewal exposure & decision windows | renewal + notice dates |
| Utilization / shelfware | licence vs active-user counts |
| Rate vs volume decomposition | rate and quantity split (only totals held) |
| Escalation triggers | trigger thresholds per risk (`risks[]` has `mit`, no trigger) |
| Execution pillars / sequenced actions | owner, sequence, dependency fields |
| Software overlap register | capability tags per supplier |
| Supplier performance / risk scores | no score field in this seed |

This is the discipline from Landscape: a missing field produces a stated gap and the name of the
field that would fill it, never an invented number.

## 4. Panel disposition — tab by tab

Verdicts: **KEEP** as-is · **CHANGE** rework · **MOVE** different tab · **TRASH** remove ·
**ADD** new · **GAP** render as stated gap.

### Tab 1 — Overview
| Panel | Verdict | Note |
|---|---|---|
| Category KPI strip | KEEP | Spend, YoY, vendors, HHI, savings pipeline |
| Annual spend trend | KEEP | From `annual[]`, all modes |
| Top suppliers (8–10) | KEEP | Orientation only; detail on tab 2 |
| Key data-driven findings | KEEP | Cap at 4, each with a "so what" |
| Concentration snapshot | CHANGE | Fold into KPIs; tab 2 owns the analysis |
| Scope & data quality | CHANGE | Demote to a coverage chip + drawer |
| Geographic distribution | MOVE | To Market & Risk |
| Spend under contract | GAP | Needs contract coverage |
| Renewal exposure | GAP | Needs renewal dates |

### Tab 2 — Spend & Suppliers
| Panel | Verdict | Note |
|---|---|---|
| Ranked supplier table | KEEP | + tier badges, YoY, subcategory |
| Supplier drawer | CHANGE | Absorbs "Other notable suppliers" |
| Other notable suppliers | TRASH | Into the main table via filter |
| New / exiting vendors | KEEP | Conditional on data |
| Pareto distribution | KEEP | Top 25 + All Others |
| A/B/C/D cutoff control | KEEP | With management posture per tier |
| Tail thresholds ×3 | CHANGE | One horizontal panel, not three cards |
| Effort-to-value | KEEP | Concise callout |
| Spend by subcategory | KEEP | Stacked by year |
| Subcategory detail | CHANGE | + share, YoY, action signal |
| Fragmentation map | ADD | Spend-only until vendor counts exist |
| Delivery / hosting mix | CHANGE | One configurable dimension from `splitTotals` |

### Tab 3 — Market & Risk
| Panel | Verdict | Note |
|---|---|---|
| Pricing environment | KEEP | From `narr.pricing` |
| Porter's five forces | MOVE | From the standalone view |
| Net leverage read | KEEP | Under Porter |
| Kraljic 2×2 | KEEP | Core positioning |
| Category positioning | CHANGE | Position → why → implication |
| Citation log | ADD | Built from `$src`, collapsed |
| Portfolio risk overview | MOVE | From the standalone view |
| Risk register | KEEP | `risks[]` with likelihood × impact |
| Geographic concentration | MOVE | From Overview |
| Single-source exposure | MOVE | From Strategy |
| Escalation triggers | GAP | Needs trigger thresholds |

### Tab 4 — Strategy & Plays
| Panel | Verdict | Note |
|---|---|---|
| Strategy thesis | KEEP | `narr.strategyRec`, 1–3 sentences |
| Strategy options | KEEP | `narr.strategyOptions` — already in platform |
| Recommended plays | KEEP | Core interaction |
| Ask Theo / add your own play | KEEP | Extensibility |
| Model the impact | KEEP | Savings / risk / effort / time-to-value |
| Yr1 / 3yr / 5yr | KEEP | Inline control |
| Strategy narrative | CHANGE | Collapsed, below the visual strategy |
| Supplier landscape | TRASH | Tab 2 owns it |
| Portfolio risk overview | TRASH | Tab 3 owns it |
| Porter | TRASH | Tab 3 owns it |
| Opportunities | TRASH | Become plays or savings items |
| Generation status card | MOVE | Header status, not content |
| Execution pillars / sequenced actions | GAP | Needs owner + sequence fields |

### Tab 5 — Savings & Scorecard
| Panel | Verdict | Note |
|---|---|---|
| Savings pipeline | CHANGE | Stage it: identified → modelled → validated → realised |
| Indicative total | CHANGE | Never blur estimate with approved or realised |
| Category scorecard | KEEP | `kpis[]` incl. cadence and `needs` |
| Savings vs target trend | ADD | From `savings[]` lo/hi |
| Play-to-value traceability | ADD | Link each item to its play |
| Model the impact | TRASH | One modelling engine, on tab 4 |

### Tab 6 — Supplier Program
| Panel | Verdict | Note |
|---|---|---|
| Diverse spend trend + SBE/WBE/MBE | KEEP | `diversity` |
| Target | CHANGE | Read from data, never hardcoded |
| Top diverse suppliers | KEEP | |
| Development pipeline | GAP | Needs pipeline records |
| Rationalization levers | CHANGE | Rank by value × effort |
| Most fragmented subcategories | ADD | From `subcats[]` |
| Overlap & consolidation candidates | KEEP | Structured, not prose |
| Multi-subcategory anchors | CHANGE | Partial — one code per supplier |
| Classification remediation | CHANGE | Demote to data-quality |
| Utilization / shelfware | GAP | Needs licence vs usage |
| Action matrix | ADD | Retain / renegotiate / consolidate / retire / replace |

### Tab 7 — Execution
| Panel | Verdict | Note |
|---|---|---|
| Change KPI strip | KEEP | YoY, CAGR, vendor movement |
| Spend trend | KEEP | Same series as Overview |
| Top swing drivers | KEEP | `swing[]` with cause |
| Change decomposition | KEEP | New + exiting + existing growth |
| Spend forecast | ADD | Low/base/high from history, not a slider |
| Forecast methodology | CHANGE | Drawer, not a card |
| Rate vs volume | GAP | Needs rate/quantity split |
| Roadmap 0–3 / 3–6 / 6–12 | GAP | Needs sequence + dependency fields |
| What changed since last strategy | GAP | Needs a prior approved snapshot |

## 5. Build approach

Same deterministic pattern as Landscape / Deal / RFx: engine in `_category_build/`, model authors
only the data object, single self-contained HTML on the shared platform chrome.

- Type: the locked scale — 9 label · 11 meta · 13 body · 16 title · 20 heading · 28 display.
- Colour: plum primary, teal secondary, burnt orange for emphasis only, solid. No pale washes.
  Panel-by-panel, never a blanket pass.
- Every GAP panel renders the gap plus the field name that would fill it.
- `$src` drives per-section provenance and the citation log.
