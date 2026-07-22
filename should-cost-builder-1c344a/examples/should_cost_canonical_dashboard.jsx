import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList, ReferenceLine } from "recharts";

// ---------------------------------------------------------------------------
// Should-Cost Builder - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure. 6 tabs, identical on every run for every cost model.
// Only the data changes per run. See references/dashboard-canonical.md for the
// full spec this file implements. House style: Magazine Report (Arial body,
// Georgia titles, dark #212121 header with red rule, Lilly-approved palette).
// Components copied verbatim from lilly-brand-assets-1c344a,
// references/dashboard-components.md. Data below is ILLUSTRATIVE (an IT
// Service Desk / managed-support should-cost model, bottoms-up cost stack
// vs a supplier's proposed price). Clone the structure, swap the data.
//
// Two panels below are new (2026-07 suite review): the Sensitivity tab
// (driver +/-15% tornado) and the Savings Pipeline + Category Scorecard on
// the Gap & Savings Pipeline tab. See references/dashboard-canonical.md for
// why a third reviewed candidate ("savings model with live lever toggles")
// was excluded as out of this skill's own BOTTOMS-UP-only boundary.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green
// anywhere; positive signal uses Bold Blue (BLU) / Neutral Sky (OK), never a
// "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Chart palette: exactly the 6 on-brand hexes from dashboard-components.md.
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

const TABS = ["Overview", "Cost Stack", "Sensitivity", "Gap & Savings Pipeline", "Bracket Reconciliation", "Assumption Ledger"];
const NEEDS_INPUT = {}; // no tab is pending input in this fully-populated illustrative run (supplier price and market band are both present)

// --- Currency / percent helpers (copied verbatim from dashboard-components.md) -------------
function f$(v) {
  if (v == null) return "";
  var a = Math.abs(v);
  if (a >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}
function fF(v) { return "$" + Math.round(v).toLocaleString("en-US"); }
function fP(v) { return v == null ? "" : v.toFixed(1) + "%"; }

// --- numeric_kernel.py mirror (quadrature_rollup) ---------------------------------------------
// Source of truth: should-cost-builder-1c344a/numeric_kernel.py (vendored from
// lilly-procurement-kernels). Signature and formula copied verbatim; do not
// hand-edit the math independently of that file (SKILL.md "Computation
// requirement (HARD RULE): do not hand-compute the roll-up"). Implements the
// independent-drivers quadrature path (Aggregation Method step 3) plus the
// >15%-of-base LOW-confidence widening rule (step 4). The naive worst-case
// envelope is returned for the footnote bound only, never the headline.
function quadratureRollupJS(bases, spreadsLow, spreadsHigh, confidenceFlags) {
  var n = bases.length;
  var totalBase = bases.reduce(function (a, b) { return a + b; }, 0);
  var widened = [];
  var quadLowSq = 0, quadHighSq = 0, linearLowAdd = 0, linearHighAdd = 0;
  for (var i = 0; i < n; i++) {
    var isLow = confidenceFlags[i] === "LOW";
    var share = bases[i] / totalBase;
    if (isLow && share > 0.15) {
      widened.push(i);
      linearLowAdd += spreadsLow[i];
      linearHighAdd += spreadsHigh[i];
    } else {
      quadLowSq += spreadsLow[i] * spreadsLow[i];
      quadHighSq += spreadsHigh[i] * spreadsHigh[i];
    }
  }
  var totalLow = totalBase - Math.sqrt(quadLowSq) - linearLowAdd;
  var totalHigh = totalBase + Math.sqrt(quadHighSq) + linearHighAdd;
  var naiveLow = totalBase - spreadsLow.reduce(function (a, b) { return a + b; }, 0);
  var naiveHigh = totalBase + spreadsHigh.reduce(function (a, b) { return a + b; }, 0);
  return { totalBase: totalBase, totalLow: totalLow, totalHigh: totalHigh, widened: widened, naiveLow: naiveLow, naiveHigh: naiveHigh };
}

// --- Shared components (verbatim from dashboard-components.md) ------------------------------
function Metric({ label, value, sub, accent, warn, good }) {
  var bar = accent ? R : warn ? R : good ? BLU : BD;
  return <div style={{ background: accent ? WARM : warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: accent ? R : MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: warn ? R : good ? BLU : DK, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{sub}</div>}
  </div>;
}
function Card({ title, note, children }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 18, border: "1px solid " + BD, marginBottom: 14 }}>
    {title && <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: DK, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 14, background: R, borderRadius: 2 }} />{title}
      {note && <span style={{ fontFamily: "Arial", fontSize: 10, fontWeight: 600, color: MUT, marginLeft: "auto" }}>{note}</span>}
    </div>}{children}
  </div>;
}
function Pillar({ c, k, t, d }) {
  return <div style={{ background: "#fff", borderRadius: 8, padding: 16, border: "1px solid " + BD, borderTop: "3px solid " + c, flex: 1, minWidth: 0 }}>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: c }}>{k}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: DK, marginTop: 4 }}>{t}</div>
    <div style={{ fontSize: 11, color: MUT, marginTop: 4, lineHeight: 1.5 }}>{d}</div>
  </div>;
}
function StateBanner({ kind, msg }) {
  var map = { NEEDS_INPUT: [AMB, WARM, "Needs input"], NOT_APPLICABLE: [MUT, CARD, "Not applicable"], RESEARCH_PENDING: [MUT, CARD, "Research pending"] };
  var c = map[kind] || map.NOT_APPLICABLE;
  return <div style={{ background: c[1], border: "1px solid " + c[0] + "55", borderLeft: "4px solid " + c[0], borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: c[0], textTransform: "uppercase" }}>{c[2]}</span>
    <div style={{ fontSize: 12, color: DK, marginTop: 4, lineHeight: 1.5 }}>{msg}</div>
  </div>;
}
function STable({ columns, rows }) {
  var _s = useState({ col: 0, dir: "asc" }); var sort = _s[0]; var setSort = _s[1];
  var _q = useState(""); var q = _q[0]; var setQ = _q[1];
  var filtered = useMemo(function () {
    var r = rows;
    if (q) { var lq = q.toLowerCase(); r = rows.filter(function (row) { return row.some(function (c) { return String(c.d).toLowerCase().indexOf(lq) >= 0; }); }); }
    return r.slice().sort(function (a, b) {
      var av = a[sort.col].v != null ? a[sort.col].v : a[sort.col].d;
      var bv = b[sort.col].v != null ? b[sort.col].v : b[sort.col].d;
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sort, q]);
  return <div>
    <div style={{ marginBottom: 8 }}>
      <input value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="Search..." style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid " + BD, fontSize: 12, width: 220 }} />
      <span style={{ fontSize: 11, color: LT, marginLeft: 8 }}>{filtered.length} of {rows.length}</span>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{columns.map(function (h, i) {
          var active = sort.col === i;
          return <th key={i} onClick={function () { setSort({ col: i, dir: active && sort.dir === "desc" ? "asc" : "desc" }); }} style={{ padding: "7px 8px", fontWeight: 600, color: active ? R : MUT, fontSize: 11, borderBottom: "2px solid " + BD, cursor: "pointer", textAlign: h.a || "left", whiteSpace: "nowrap" }}>{h.l}{active ? (sort.dir === "asc" ? " ^" : " v") : ""}</th>;
        })}</tr></thead>
        <tbody>{filtered.map(function (row, ri) {
          return <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
            {row.map(function (cell, ci) {
              return <td key={ci} style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: columns[ci].a || "left", fontWeight: cell.b ? 700 : 400, color: cell.c || DK }}>{cell.d}</td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}
function Tip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div style={{ background: DK, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 12 }}>
    {label && <div style={{ fontWeight: 600, color: LT }}>{label}</div>}
    {payload.map(function (p, i) { return <div key={i}>{p.name ? p.name + ": " : ""}<strong>{typeof p.value === "number" ? f$(p.value) : p.value}</strong></div>; })}
  </div>;
}
// Confidence pill (HIGH/MEDIUM/LOW), same color discipline as SevPill; no new hexes.
const CONF = { HIGH: [BLU, OK], MEDIUM: [AMB, WARM], LOW: [R, RISK] };
function ConfBadge({ c }) {
  var col = CONF[c] || [MUT, CARD];
  return <span style={{ color: col[0], background: col[1], border: "1px solid " + col[0] + "40", fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{c}</span>;
}
// Position-vs-range pill (Gap Method): above the range is a clear over-ask (strong
// leverage), within the range is defensible tolerance, below the range needs
// investigation before it is treated as a win (Edge Cases, SKILL.md).
const POSITION_STYLE = { ABOVE: [R, RISK, "Above Should-Cost Range"], WITHIN: [BLU, OK, "Within Should-Cost Range"], BELOW: [AMB, WARM, "Below Should-Cost Range"] };
function PositionPill({ p }) {
  var s = POSITION_STYLE[p];
  return <span style={{ color: s[0], background: s[1], border: "1px solid " + s[0] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.03em", padding: "2px 9px", borderRadius: 12, whiteSpace: "nowrap" }}>{s[2]}</span>;
}

// Horizontal range gauge (pure CSS, no chart library): a should-cost low/base/high
// band with an optional marker (e.g. the supplier's proposed price). Reused on the
// Overview and Gap & Savings Pipeline tabs.
function RangeGauge({ low, base, high, marker, markerLabel, markerColor }) {
  var domainLow = Math.min(low, marker != null ? marker : low);
  var domainHigh = Math.max(high, marker != null ? marker : high);
  var pad = (domainHigh - domainLow) * 0.10;
  var dLow = domainLow - pad, dHigh = domainHigh + pad;
  var pct = function (v) { return ((v - dLow) / (dHigh - dLow)) * 100; };
  return <div style={{ position: "relative", height: 54, marginTop: 10, marginBottom: 6 }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 22, height: 10, background: CARD, borderRadius: 6 }} />
    <div style={{ position: "absolute", left: pct(low) + "%", width: (pct(high) - pct(low)) + "%", top: 22, height: 10, background: OK, border: "1px solid " + BLU, borderRadius: 6 }} />
    <div style={{ position: "absolute", left: pct(base) + "%", top: 14, width: 2, height: 26, background: BLU }} />
    <div style={{ position: "absolute", left: pct(base) + "%", top: 0, transform: "translateX(-50%)", fontSize: 9, color: BLU, fontWeight: 700, whiteSpace: "nowrap" }}>Base {f$(base)}</div>
    {marker != null && <div style={{ position: "absolute", left: pct(marker) + "%", top: 14, width: 2, height: 26, background: markerColor }} />}
    {marker != null && <div style={{ position: "absolute", left: pct(marker) + "%", top: 40, transform: "translateX(-50%)", fontSize: 9, color: markerColor, fontWeight: 700, whiteSpace: "nowrap" }}>{markerLabel} {f$(marker)}</div>}
    <div style={{ position: "absolute", left: pct(low) + "%", top: 34, transform: "translateX(-50%)", fontSize: 9, color: MUT }}>{f$(low)}</div>
    <div style={{ position: "absolute", left: pct(high) + "%", top: 34, transform: "translateX(-50%)", fontSize: 9, color: MUT }}>{f$(high)}</div>
  </div>;
}

// Two-band bracket visual (bottoms-up should-cost vs top-down market rate) plus the
// overlap "recommended target" band, pure CSS. Used on Bracket Reconciliation.
function BracketChart({ costLow, costHigh, marketLow, marketHigh, overlapLow, overlapHigh, hasOverlap }) {
  var domainLow = Math.min(costLow, marketLow);
  var domainHigh = Math.max(costHigh, marketHigh);
  var pad = (domainHigh - domainLow) * 0.06;
  var dLow = domainLow - pad, dHigh = domainHigh + pad;
  var pct = function (v) { return ((v - dLow) / (dHigh - dLow)) * 100; };
  var rows = [
    { label: "Should-Cost (bottoms-up)", low: costLow, high: costHigh, color: BLU, bg: OK },
    { label: "Market Rate (top-down, P25-P75)", low: marketLow, high: marketHigh, color: BRN, bg: WARM },
  ];
  return <div>
    {rows.map(function (r, i) {
      return <div key={i} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{r.label}</div>
        <div style={{ position: "relative", height: 22 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: 10, background: CARD, borderRadius: 6 }} />
          <div style={{ position: "absolute", left: pct(r.low) + "%", width: (pct(r.high) - pct(r.low)) + "%", top: 6, height: 10, background: r.bg, border: "1px solid " + r.color, borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT, marginTop: 2 }}>
          <span>{f$(r.low)}</span><span>{f$(r.high)}</span>
        </div>
      </div>;
    })}
    {hasOverlap && <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: R, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Recommended Target Band (overlap)</div>
      <div style={{ position: "relative", height: 22 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: 10, background: CARD, borderRadius: 6 }} />
        <div style={{ position: "absolute", left: pct(overlapLow) + "%", width: (pct(overlapHigh) - pct(overlapLow)) + "%", top: 6, height: 10, background: R, opacity: 0.20, border: "2px solid " + R, borderRadius: 6 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: R, fontWeight: 700, marginTop: 2 }}>
        <span>{f$(overlapLow)}</span><span>{f$(overlapHigh)}</span>
      </div>
    </div>}
  </div>;
}

// Single-stack component share bar (pure CSS): shows each cost-stack component as a
// proportional colored segment. Used on Cost Stack and the Overview leverage panel.
function StackedCostBar({ components, total }) {
  return <div>
    <div style={{ display: "flex", width: "100%", height: 34, borderRadius: 6, overflow: "hidden", border: "1px solid " + BD }}>
      {components.map(function (c, i) {
        var w = (c.base / total) * 100;
        return <div key={c.key} title={c.name} style={{ width: w + "%", background: PAL[i % PAL.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
          {w > 8 && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{fP(w)}</span>}
        </div>;
      })}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
      {components.map(function (c, i) {
        return <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: PAL[i % PAL.length], display: "inline-block" }} />{c.name} ({f$(c.base)})
        </div>;
      })}
    </div>
  </div>;
}

// --- ILLUSTRATIVE DATA (replace entirely per run) --------------------------------------------
// NUMBERS RECONCILE: Total_base is the visible sum of component bases; Total_low/
// Total_high come from quadratureRollupJS (mirrors numeric_kernel.py's
// quadrature_rollup exactly), never hand-typed. The Gap Method's driver-attribution
// rows are a plug decomposition that sums exactly to the visible gap dollar amount,
// the same discipline pro-forma-builder's savings waterfall uses for its own plug lever.
const META = {
  modelName: "IT Service Desk Managed Support (Tier 1-3) - Annual Run-Rate Should-Cost",
  supplierName: "Meridian Technology Solutions",
  category: "Professional / Managed Services - IT Service Desk",
  asOfDate: "July 21, 2026",
  currency: "USD",
  preparedFor: "Global IT Procurement",
};

// Cost-Structure Template: Professional / consulting services (loaded labor rate x
// utilization + delivery overhead + tools/licenses + SG&A + margin), per SKILL.md's
// Cost-Structure Templates section. Classified MATERIAL / CONVERSION / COMMERCIAL
// per the Aggregation Method; MATERIAL and CONVERSION lines are independent /
// weakly-correlated (different markets: labor rate cards vs. tooling license lists)
// and roll up via quadrature. COMMERCIAL (SG&A, margin) is added linearly on top
// (Aggregation Method step 3), never drawn independently.
const COMPONENTS = [
  {
    key: "tier1", name: "Tier 1 Support Labor (loaded, 25 FTE)", cls: "CONVERSION",
    base: 1850000, spreadLow: 140000, spreadHigh: 165000, confidence: "HIGH",
    basis: "Blended loaded rate ($71.20/hr) x 2,080 hrs/FTE x 25 FTE x 85% utilization",
    source: "Radford IT Support Compensation Survey 2026 + 2 published MSP rate cards",
    sourceDate: "June 2026", indexUsed: "US IT support wage index, 2026Q2", freshness: "CURRENT",
  },
  {
    key: "tier23", name: "Tier 2/3 Support Labor (loaded, 9 FTE)", cls: "CONVERSION",
    base: 980000, spreadLow: 210000, spreadHigh: 240000, confidence: "LOW",
    basis: "Blended loaded rate ($124.60/hr) x 2,080 hrs/FTE x 9 FTE x 82% utilization",
    source: "1 comparable MSA rate schedule (no second corroborating source found)",
    sourceDate: "May 2026", indexUsed: "Not applied (single source)", freshness: "CURRENT",
  },
  {
    key: "tooling", name: "Tooling and Licensing (ITSM + monitoring)", cls: "MATERIAL",
    base: 210000, spreadLow: 15000, spreadHigh: 20000, confidence: "HIGH",
    basis: "Published seat pricing, ITSM platform + monitoring stack, 640 endpoints",
    source: "Vendor published price list, cross-checked against 2 reseller quotes",
    sourceDate: "July 2026", indexUsed: "None (list pricing)", freshness: "CURRENT",
  },
  {
    key: "overhead", name: "Delivery Overhead (facilities, mgmt, QA)", cls: "CONVERSION",
    base: 340000, spreadLow: 45000, spreadHigh: 60000, confidence: "MEDIUM",
    basis: "16% delivery-overhead loading on Tier 1 + Tier 2/3 labor, per category norm",
    source: "Regional facilities-and-management-burden index",
    sourceDate: "May 2025", indexUsed: "Regional facilities burden index, 2025 edition", freshness: "STALE",
  },
  {
    key: "sga", name: "SG&A Allocation", cls: "COMMERCIAL",
    base: 185000, spreadLow: 20000, spreadHigh: 25000, confidence: "HIGH",
    basis: "4.7% of direct cost, category-typical SG&A load for managed IT services",
    source: "should-cost-builder category-typical SG&A assumption (labeled)",
    sourceDate: "July 2026", indexUsed: "None (policy assumption)", freshness: "CURRENT",
  },
  {
    key: "margin", name: "Supplier Margin", cls: "COMMERCIAL",
    base: 410000, spreadLow: 80000, spreadHigh: 110000, confidence: "MEDIUM",
    basis: "10.3% of cost-plus-SG&A base; category-typical band 7%-14% for managed IT services",
    source: "should-cost-builder category-typical margin-band assumption (labeled)",
    sourceDate: "July 2026", indexUsed: "None (policy assumption)", freshness: "CURRENT",
  },
];

const QUAD_COMPONENTS = COMPONENTS.filter(function (c) { return c.cls !== "COMMERCIAL"; });
const LINEAR_COMPONENTS = COMPONENTS.filter(function (c) { return c.cls === "COMMERCIAL"; });

// --- Derived data model (build once, module scope; G5 "complete data object before rendering") -
const QUAD_RESULT = quadratureRollupJS(
  QUAD_COMPONENTS.map(function (c) { return c.base; }),
  QUAD_COMPONENTS.map(function (c) { return c.spreadLow; }),
  QUAD_COMPONENTS.map(function (c) { return c.spreadHigh; }),
  QUAD_COMPONENTS.map(function (c) { return c.confidence; })
);
var linearBaseSum = LINEAR_COMPONENTS.reduce(function (a, c) { return a + c.base; }, 0);
var linearLowSum = LINEAR_COMPONENTS.reduce(function (a, c) { return a + c.spreadLow; }, 0);
var linearHighSum = LINEAR_COMPONENTS.reduce(function (a, c) { return a + c.spreadHigh; }, 0);

const TOTAL_BASE = QUAD_RESULT.totalBase + linearBaseSum;
const TOTAL_LOW = QUAD_RESULT.totalLow + linearBaseSum - linearLowSum;
const TOTAL_HIGH = QUAD_RESULT.totalHigh + linearBaseSum + linearHighSum;
const NAIVE_LOW = QUAD_RESULT.naiveLow + linearBaseSum - linearLowSum;
const NAIVE_HIGH = QUAD_RESULT.naiveHigh + linearBaseSum + linearHighSum;
const WIDENED_NAMES = QUAD_RESULT.widened.map(function (i) { return QUAD_COMPONENTS[i].name; });

// Model-level confidence (Aggregation Method step 5): HIGH only if every driver
// >10% of base is HIGH/MEDIUM and none of the top-three (by base $) is LOW; MEDIUM
// if exactly one of the top-three is LOW; LOW if two-plus material drivers are LOW.
const TOP3 = COMPONENTS.slice().sort(function (a, b) { return b.base - a.base; }).slice(0, 3);
var lowInTop3 = TOP3.filter(function (c) { return c.confidence === "LOW"; }).length;
const MODEL_CONFIDENCE = lowInTop3 >= 2 ? "LOW" : lowInTop3 === 1 ? "MEDIUM" : "HIGH";

const RECONCILE_LINE = "Reconciles: base " + fF(TOTAL_BASE) + " = " +
  COMPONENTS.map(function (c) { return fF(c.base); }).join(" + ") +
  "; range [" + fF(TOTAL_LOW) + ", " + fF(TOTAL_HIGH) + "] via quadrature (" +
  (WIDENED_NAMES.length === 0 ? "no widened drivers" : WIDENED_NAMES.length + " widened driver: " + WIDENED_NAMES.join(", ")) +
  "); model confidence " + MODEL_CONFIDENCE + " (" + lowInTop3 + " of top-3 drivers by base $ is LOW).";

// Gap Method
const SUPPLIER_PRICE = 4650000;
const GAP_ABS = SUPPLIER_PRICE - TOTAL_BASE;
const GAP_PCT = (GAP_ABS / TOTAL_BASE) * 100;
const POSITION = SUPPLIER_PRICE > TOTAL_HIGH ? "ABOVE" : SUPPLIER_PRICE < TOTAL_LOW ? "BELOW" : "WITHIN";
const COST_EX_MARGIN = COMPONENTS.filter(function (c) { return c.key !== "margin"; }).reduce(function (a, c) { return a + c.base; }, 0);
const IMPLIED_MARGIN_DOLLAR = SUPPLIER_PRICE - COST_EX_MARGIN;
const IMPLIED_MARGIN_PCT = (IMPLIED_MARGIN_DOLLAR / SUPPLIER_PRICE) * 100;
const MARGIN_COMPONENT = COMPONENTS.filter(function (c) { return c.key === "margin"; })[0];

// Driver attribution of the gap ("70% of the gap is margin, 30% is an above-index
// labor rate", per the Gap Method). Two named shares plus a plug (guarantees exact
// reconciliation to GAP_ABS, the same plug discipline pro-forma-builder's savings
// waterfall uses).
const GAP_ATTRIBUTION_SHARES = [
  { key: "margin", label: "Margin above the category-typical policy band", cls: "COMMERCIAL", share: 0.62, confidence: "MEDIUM", basis: "Implied margin " + fP(IMPLIED_MARGIN_PCT) + " vs the 7%-14% category-typical band" },
  { key: "tier23", label: "Tier 2/3 labor rate above index", cls: "CONVERSION", share: 0.23, confidence: "LOW", basis: "Single-source rate schedule; effort floor met but only 1 corroborating source" },
];
var namedSum = GAP_ATTRIBUTION_SHARES.reduce(function (a, s) { return a + GAP_ABS * s.share; }, 0);
const GAP_ATTRIBUTION = GAP_ATTRIBUTION_SHARES.map(function (s) { return { key: s.key, label: s.label, cls: s.cls, amount: GAP_ABS * s.share, confidence: s.confidence, basis: s.basis }; }).concat([
  { key: "overhead_tooling", label: "Delivery overhead and tooling bundle", cls: "MATERIAL/CONVERSION", amount: GAP_ABS - namedSum, confidence: "MEDIUM", basis: "Combined overhead-loading and tooling-seat variance vs. should-cost basis (plug: remainder of the gap)" },
]).sort(function (a, b) { return b.amount - a.amount; });

// Savings Pipeline: the same driver-attribution point estimates, widened into a
// range whose width reflects confidence (Rule 4: never a bare point estimate).
// Convention used for this illustration: HIGH +/-10%, MEDIUM +/-20%, LOW +/-35%.
var BAND_PCT = { HIGH: 0.10, MEDIUM: 0.20, LOW: 0.35 };
const SAVINGS_PIPELINE = GAP_ATTRIBUTION.map(function (a) {
  var pct = BAND_PCT[a.confidence] || 0.25;
  return { key: a.key, label: a.label, cls: a.cls, low: a.amount * (1 - pct), high: a.amount * (1 + pct), basis: a.basis, confidence: a.confidence };
}).sort(function (a, b) { return b.high - a.high; });
const PIPELINE_LOW_SUM = SAVINGS_PIPELINE.reduce(function (a, r) { return a + r.low; }, 0);
const PIPELINE_HIGH_SUM = SAVINGS_PIPELINE.reduce(function (a, r) { return a + r.high; }, 0);

// Category Scorecard
const CONF_COUNTS = { HIGH: 0, MEDIUM: 0, LOW: 0 };
COMPONENTS.forEach(function (c) { CONF_COUNTS[c.confidence] += 1; });
const STALE_COUNT = COMPONENTS.filter(function (c) { return c.freshness === "STALE"; }).length;
const WEB_SOURCED = COMPONENTS.filter(function (c) { return c.cls !== "COMMERCIAL"; }); // labeled policy assumptions (SG&A, margin) are not web-sourced
const SEARCH_FLOOR_MET = WEB_SOURCED.length; // all 4 web-sourced drivers met the 3-search effort floor in this illustrative run
const RECONCILE_STATUS = (TOTAL_LOW <= TOTAL_BASE && TOTAL_BASE <= TOTAL_HIGH) ? "PASS" : "FAIL";

// Sensitivity tornado: each driver swung +/-15% off its own base, others held
// constant, ranked by dollar swing on Total_base. Distinct from the researched
// low/high spread on the Cost Stack tab; this is a uniform stress test answering
// "which driver would most change the estimate," per Workflow Step 4.
const TORNADO_ROWS = COMPONENTS.map(function (c) {
  var delta = c.base * 0.15;
  return { key: c.key, label: c.name, delta: delta, low: TOTAL_BASE - delta, high: TOTAL_BASE + delta };
}).sort(function (a, b) { return b.delta - a.delta; }).slice(0, 5);
const TOP_TORNADO_DRIVER = TORNADO_ROWS[0];
const TORNADO_CHART_DATA = TORNADO_ROWS.map(function (r) { return { name: r.label, base: r.low, span: r.high - r.low }; });

// Gap driver-attribution chart data
const ATTRIBUTION_CHART_DATA = GAP_ATTRIBUTION.map(function (a) { return { name: a.label, amount: a.amount, pct: (a.amount / GAP_ABS) * 100 }; });

// Bracket Reconciliation (top-down market-rate-benchmarking output, when present)
const MARKET_BAND = { low: 4100000, high: 4900000, source: "market-rate-benchmarking output, IT Service Desk category (N=7 comparable engagements)", date: "July 15, 2026", confidence: "HIGH" };
const OVERLAP_LOW = Math.max(TOTAL_LOW, MARKET_BAND.low);
const OVERLAP_HIGH = Math.min(TOTAL_HIGH, MARKET_BAND.high);
const HAS_OVERLAP = OVERLAP_LOW <= OVERLAP_HIGH;
const BRACKET_CASE = TOTAL_HIGH < MARKET_BAND.low ? "BELOW_MARKET" : TOTAL_LOW > MARKET_BAND.high ? "ABOVE_MARKET" : "OVERLAP";

// Research log (Rule 2: 3-search effort floor per web-sourced driver, kept as a log)
const RESEARCH_LOG = [
  { row: "Tier 1 support loaded labor rate", source: "Radford IT Support Compensation Survey 2026", date: "June 2026", confidence: "HIGH", searches: 3 },
  { row: "Tier 2/3 support loaded labor rate", source: "1 comparable MSA rate schedule", date: "May 2026", confidence: "LOW", searches: 3 },
  { row: "ITSM and monitoring tooling seat pricing", source: "Vendor list price + 2 reseller quotes", date: "July 2026", confidence: "HIGH", searches: 3 },
  { row: "Delivery-overhead burden loading", source: "Regional facilities-and-management-burden index", date: "May 2025", confidence: "MEDIUM", searches: 3 },
  { row: "IT Service Desk market-rate benchmark (top-down)", source: "market-rate-benchmarking output", date: "July 15, 2026", confidence: "HIGH", searches: 4 },
];

// Cost-Driver Assumption Ledger (portable JSON block, per SKILL.md's ledger schema)
const LEDGER_JSON = {
  as_of_date: META.asOfDate,
  fx_rate_table: {},
  total_low: Math.round(TOTAL_LOW),
  total_base: Math.round(TOTAL_BASE),
  total_high: Math.round(TOTAL_HIGH),
  correlation_assumption: "Tier 1 labor, Tier 2/3 labor, tooling, and delivery overhead treated as independent/weakly-correlated (quadrature); SG&A and margin added linearly on top as commercial lines.",
  model_confidence: MODEL_CONFIDENCE,
  supplier_price: SUPPLIER_PRICE,
  gap_abs: Math.round(GAP_ABS),
  gap_pct: Number(GAP_PCT.toFixed(1)),
  drivers: COMPONENTS.map(function (c) {
    return {
      component: c.name, class: c.cls, basis: c.basis, low: c.base - c.spreadLow, base: c.base, high: c.base + c.spreadHigh,
      currency: META.currency, source: c.source, source_date: c.sourceDate, confidence: c.confidence, index_used: c.indexUsed,
      freshness_flag: c.freshness, grouped_with: [], notes: c.key === "tier23" ? "LOW confidence, >15% of base: widened per Aggregation Method step 4." : "",
    };
  }),
};

// ---------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------------------------
export default function ShouldCostDashboard() {
  var _t = useState("Overview"); var tab = _t[0]; var setTab = _t[1];

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Should-Cost Builder | Bottoms-Up Cost Model</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.modelName}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{META.asOfDate} | {META.category}<br />Supplier: {META.supplierName}</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto" }}>
        {TABS.map(function (t) {
          var active = t === tab;
          return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}{NEEDS_INPUT[t] ? <span style={{ color: AMB, marginLeft: 4 }}>*</span> : null}</button>;
        })}
      </div>

      <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {tab === "Overview" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Metric label="Should-Cost Base" value={f$(TOTAL_BASE)} sub="sum of component bases" accent />
            <Metric label="Should-Cost Range" value={f$(TOTAL_LOW) + " - " + f$(TOTAL_HIGH)} sub="quadrature roll-up" />
            <Metric label="Model Confidence" value={MODEL_CONFIDENCE} sub={lowInTop3 + " of top-3 drivers LOW"} good={MODEL_CONFIDENCE === "HIGH"} warn={MODEL_CONFIDENCE === "LOW"} />
            <Metric label="Supplier Price" value={f$(SUPPLIER_PRICE)} sub={META.supplierName} />
            <Metric label="Gap vs Should-Cost" value={f$(GAP_ABS) + " (" + fP(GAP_PCT) + ")"} sub="proposed price minus should-cost base" warn />
          </div>

          <div style={{ background: CARD, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: DK }}>
            <b>Reconciliation:</b> {RECONCILE_LINE} Naive worst-case envelope (footnote only, never headline): [{fF(NAIVE_LOW)}, {fF(NAIVE_HIGH)}].
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Where the Price Falls" note="Should-cost range vs proposed price">
              <RangeGauge low={TOTAL_LOW} base={TOTAL_BASE} high={TOTAL_HIGH} marker={SUPPLIER_PRICE} markerLabel="Supplier" markerColor={R} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}><PositionPill p={POSITION} /></div>
            </Card>
            <Card title="Where the Leverage Is">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{META.supplierName}'s price sits {fP(GAP_PCT)} above the should-cost base and above the top of the aggregated range ({f$(TOTAL_HIGH)}), which is a clear over-ask rather than a defensible-tolerance case. The implied margin at the proposed price is {fP(IMPLIED_MARGIN_PCT)} ({f$(IMPLIED_MARGIN_DOLLAR)}), well above the {fP(MARGIN_COMPONENT.base / COST_EX_MARGIN * 100)} modeled base and the 7%-14% category-typical band.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The single LOW-confidence driver is {COMPONENTS.filter(function (c) { return c.confidence === "LOW"; })[0].name} ({fP(COMPONENTS.filter(function (c) { return c.confidence === "LOW"; })[0].base / TOTAL_BASE * 100)} of base), which is why it was widened from quadrature to linear in the roll-up and is the term most worth a second corroborating source before this model is finalized.</p>
            </Card>
          </div>
        </div>}

        {tab === "Cost Stack" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Cost Stack by Component" note="Share of should-cost base">
              <StackedCostBar components={COMPONENTS} total={TOTAL_BASE} />
            </Card>
            <Card title="Reading the Stack">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{COMPONENTS[0].name} is the largest single line at {fP(COMPONENTS[0].base / TOTAL_BASE * 100)} of the should-cost base ({f$(COMPONENTS[0].base)}), typical for a labor-heavy managed-services stack where CONVERSION cost (labor plus delivery overhead) dominates MATERIAL cost (tooling and licensing).</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>COMMERCIAL lines (SG&A and margin) total {f$(linearBaseSum)}, {fP(linearBaseSum / TOTAL_BASE * 100)} of the base, added linearly on top of the quadrature roll-up per the Aggregation Method: margin and SG&A apply to the whole stack rather than being drawn as an independent statistical driver.</p>
            </Card>
          </div>
          <Card title="Cost-Stack Component Table" note="Basis, source, and confidence per driver">
            <STable
              columns={[{ l: "Component" }, { l: "Class" }, { l: "Base", a: "right" }, { l: "Low", a: "right" }, { l: "High", a: "right" }, { l: "Basis" }, { l: "Confidence", a: "center" }]}
              rows={COMPONENTS.map(function (c) {
                return [
                  { d: c.name, b: true },
                  { d: c.cls },
                  { d: fF(c.base), v: c.base, a: "right", b: true },
                  { d: fF(c.base - c.spreadLow), v: c.base - c.spreadLow, a: "right" },
                  { d: fF(c.base + c.spreadHigh), v: c.base + c.spreadHigh, a: "right" },
                  { d: c.basis },
                  { d: <ConfBadge c={c.confidence} />, a: "center" },
                ];
              })}
            />
          </Card>
        </div>}

        {tab === "Sensitivity" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Tornado: Should-Cost Base Sensitivity by Driver" note="Each driver swung +/-15%, top 5 of 6">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={TORNADO_CHART_DATA} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" tickFormatter={f$} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={230} tick={{ fontSize: 10 }} />
                  <Tooltip content={<Tip />} />
                  <ReferenceLine x={TOTAL_BASE} stroke={R} strokeDasharray="4 2" label={{ value: "Should-cost base", position: "top", fontSize: 10, fill: R }} />
                  <Bar dataKey="base" stackId="t" fill="transparent" />
                  <Bar dataKey="span" stackId="t" fill={BLU} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 10, color: MUT, marginTop: 4 }}>Bars span the should-cost base at -15% to +15% of each driver's own value, one driver at a time, others held at base. This is a uniform stress test, distinct from the researched low/high spread shown on the Cost Stack tab.</div>
            </Card>
            <Card title="What Would Change This Estimate">
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>Top driver</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: DK }}>{TOP_TORNADO_DRIVER.label}</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>Should-cost base swings +/-{f$(TOP_TORNADO_DRIVER.delta)} on a 15% move in this driver alone</div>
              </div>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}><b>Reading:</b> {TOP_TORNADO_DRIVER.label} is the single most influential line because it is both the largest base $ component and a CONVERSION line without a fixed-price ceiling. A rep revisiting this model before a final round should put research effort here first, and treat {COMPONENTS.filter(function (c) { return c.confidence === "LOW"; })[0].name} as the second priority since it is already flagged LOW confidence on the Cost Stack tab.</p>
            </Card>
          </div>
        </div>}

        {tab === "Gap & Savings Pipeline" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Metric label="Should-Cost Base" value={f$(TOTAL_BASE)} accent />
            <Metric label="Supplier Price" value={f$(SUPPLIER_PRICE)} />
            <Metric label="Gap" value={f$(GAP_ABS) + " (" + fP(GAP_PCT) + ")"} warn />
            <Metric label="Position vs Range" value={POSITION === "ABOVE" ? "Above" : POSITION === "BELOW" ? "Below" : "Within"} sub="see Position pill below" warn={POSITION === "ABOVE"} good={POSITION === "WITHIN"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Gap Driver Attribution" note="Sums exactly to the gap dollar amount">
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={ATTRIBUTION_CHART_DATA} layout="vertical" margin={{ top: 8, right: 40, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" tickFormatter={f$} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 10 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="amount" fill={BRN}>
                    <LabelList dataKey="pct" position="right" formatter={function (v) { return fP(v); }} style={{ fontSize: 10, fill: DK }} />
                    {ATTRIBUTION_CHART_DATA.map(function (d, i) { return <Cell key={i} fill={PAL[i % PAL.length]} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Reading the Gap">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{fP(GAP_ATTRIBUTION[0].amount / GAP_ABS * 100)} of the {f$(GAP_ABS)} gap is {GAP_ATTRIBUTION[0].label.toLowerCase()} ({f$(GAP_ATTRIBUTION[0].amount)}), the single largest lever; the remainder splits across {GAP_ATTRIBUTION.slice(1).map(function (a) { return a.label.toLowerCase(); }).join(" and ")}.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Never present this gap as the supplier's profit; it is the difference between the should-cost estimate and the ask, decomposed onto the drivers most likely to be negotiable, per the Gap Method.</p>
            </Card>
          </div>

          <Card title="Savings Pipeline" note="Confidence-flagged ranges, never a bare point estimate">
            <STable
              columns={[{ l: "Lever" }, { l: "Class" }, { l: "Low Impact", a: "right" }, { l: "High Impact", a: "right" }, { l: "Basis" }, { l: "Confidence", a: "center" }]}
              rows={SAVINGS_PIPELINE.map(function (r) {
                return [
                  { d: r.label, b: true },
                  { d: r.cls },
                  { d: fF(r.low), v: r.low, a: "right" },
                  { d: fF(r.high), v: r.high, a: "right", b: true, c: BLU },
                  { d: r.basis },
                  { d: <ConfBadge c={r.confidence} />, a: "center" },
                ];
              }).concat([[
                { d: "TOTAL PIPELINE", b: true, c: R }, { d: "" },
                { d: fF(PIPELINE_LOW_SUM), v: PIPELINE_LOW_SUM, a: "right", b: true, c: R },
                { d: fF(PIPELINE_HIGH_SUM), v: PIPELINE_HIGH_SUM, a: "right", b: true, c: R },
                { d: "Brackets the " + f$(GAP_ABS) + " point gap" }, { d: "", a: "center" },
              ]])}
            />
          </Card>

          <Card title="Category Scorecard" note="One-glance model-quality read before negotiation use">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
              <Metric label="Drivers at HIGH Confidence" value={CONF_COUNTS.HIGH + " of " + COMPONENTS.length} good={CONF_COUNTS.HIGH >= COMPONENTS.length / 2} />
              <Metric label="Model Confidence" value={MODEL_CONFIDENCE} good={MODEL_CONFIDENCE === "HIGH"} warn={MODEL_CONFIDENCE === "LOW"} />
              <Metric label="Reconciliation" value={RECONCILE_STATUS} good={RECONCILE_STATUS === "PASS"} warn={RECONCILE_STATUS === "FAIL"} />
              <Metric label="Sources Flagged Stale" value={STALE_COUNT + " of " + COMPONENTS.length} sub=">12 months old" warn={STALE_COUNT > 0} />
              <Metric label="Search Effort Floor Met" value={SEARCH_FLOOR_MET + " of " + WEB_SOURCED.length} sub="web-sourced drivers, 3-search minimum" good={SEARCH_FLOOR_MET === WEB_SOURCED.length} />
            </div>
          </Card>
        </div>}

        {tab === "Bracket Reconciliation" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Should-Cost vs Market Rate" note="Bottoms-up range against the top-down benchmark">
              <BracketChart costLow={TOTAL_LOW} costHigh={TOTAL_HIGH} marketLow={MARKET_BAND.low} marketHigh={MARKET_BAND.high} overlapLow={OVERLAP_LOW} overlapHigh={OVERLAP_HIGH} hasOverlap={HAS_OVERLAP} />
            </Card>
            <Card title="Reading the Bracket">
              {BRACKET_CASE === "OVERLAP" && <div>
                <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>The should-cost range and the market-rate range overlap between {f$(OVERLAP_LOW)} and {f$(OVERLAP_HIGH)}: this is the highest-confidence anchor and the recommended target for the negotiation, since it is defensible from both the bottoms-up build and the top-down market read.</p>
                <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The should-cost base ({f$(TOTAL_BASE)}) sits below the market band's floor ({f$(MARKET_BAND.low)}), the expected "gap up" pattern for a bottoms-up build against a market that carries supplier margin and go-to-market load the should-cost model deliberately excludes: lead with should-cost, concede toward market, not the reverse.</p>
              </div>}
              {BRACKET_CASE === "BELOW_MARKET" && <StateBanner kind="NOT_APPLICABLE" msg="Should-cost range sits entirely below the market band with no overlap. Should-cost is the floor anchor; market is the realistic ceiling." />}
              {BRACKET_CASE === "ABOVE_MARKET" && <StateBanner kind="NOT_APPLICABLE" msg="Should-cost range sits entirely above the market band. Investigate before anchoring: the should-cost model may be missing scale, or a cost line may be double-counted." />}
            </Card>
          </div>
          <Card title="Market-Rate Benchmark Source">
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>{MARKET_BAND.source}, {MARKET_BAND.date}. Confidence: <ConfBadge c={MARKET_BAND.confidence} />. Per the Bracket Reconciliation handshake, both lenses' confidence flags travel with the combined target band into commercial-negotiation-prep.</p>
          </Card>
        </div>}

        {tab === "Assumption Ledger" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title="Cost-Driver Assumption Ledger">
              <STable
                columns={[{ l: "Component" }, { l: "Class" }, { l: "Basis" }, { l: "Source" }, { l: "Date" }, { l: "Confidence", a: "center" }, { l: "Freshness", a: "center" }]}
                rows={COMPONENTS.map(function (c) {
                  return [
                    { d: c.name, b: true }, { d: c.cls }, { d: c.basis }, { d: c.source }, { d: c.sourceDate },
                    { d: <ConfBadge c={c.confidence} />, a: "center" },
                    { d: c.freshness, a: "center", c: c.freshness === "STALE" ? R : MUT, b: c.freshness === "STALE" },
                  ];
                })}
              />
            </Card>
            <Card title="Research Log">
              {RESEARCH_LOG.map(function (r, i) {
                return <div key={i} style={{ padding: "8px 0", borderBottom: i < RESEARCH_LOG.length - 1 ? "1px solid " + BD : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{r.row}</div>
                  <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{r.source}, {r.date} ({r.searches} searches run)</div>
                </div>;
              })}
              {STALE_COUNT > 0 && <div style={{ marginTop: 10 }}>
                <StateBanner kind="RESEARCH_PENDING" msg={"Delivery-overhead burden index is " + STALE_COUNT + " source(s) older than 12 months (dated May 2025). Freshness flag applied; not silently treated as current."} />
              </div>}
            </Card>
          </div>
          <Card title="Portable Ledger (JSON)" note="Copyable block for commercial-negotiation-prep and pro-forma-builder">
            <div style={{ overflowX: "auto" }}>
              <pre style={{ background: DK, color: "#fff", fontSize: 10, lineHeight: 1.5, padding: 14, borderRadius: 6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(LEDGER_JSON, null, 2)}</pre>
            </div>
          </Card>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Directional, sourced cost estimate to anchor a negotiation, not an audited or guaranteed cost. Treat as leverage, not the supplier's actual cost.</div>
        <div>Eli Lilly and Company - Confidential | Should-Cost Builder | 2026</div>
      </div>
    </div>
  );
}
