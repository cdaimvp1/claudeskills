import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList, ComposedChart, Line, ReferenceLine } from "recharts";

// ---------------------------------------------------------------------------
// Pro-Forma Builder - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure. 5 tabs, identical on every run for every deal/category.
// Only the data changes per run. See references/dashboard-canonical.md for the
// full spec this file implements. House style: SUITE STANDARD (Arial body,
// Georgia titles, dark #212121 header with red rule, Lilly-approved palette).
// Components copied verbatim from lilly-brand-assets-1c344a,
// references/dashboard-components.md. Data below is ILLUSTRATIVE (Atlas
// Systems ERP consolidation, a 5-year build-vs-status-quo business case).
// Clone the structure, swap the data.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green
// anywhere; positive signal uses Bold Blue (BLU) / Neutral Sky (OK), never a
// "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Chart palette: exactly the 6 on-brand hexes from dashboard-components.md.
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

const TABS = ["Headline", "Scenario Projection", "Savings Waterfall", "Assumptions & Sources", "Sensitivity"];
const NEEDS_INPUT = {}; // no tab is pending input in this fully-populated illustrative run

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

// --- numeric_kernel.py mirrors (escalate, npv) ----------------------------------------------
// Source of truth: pro-forma-builder-1c344a/numeric_kernel.py (vendored from
// lilly-procurement-kernels). Signatures and formulas copied verbatim; do not
// hand-edit the math independently of that file. Same mirror pattern used by
// commercial-negotiation-prep's escalation-cap lever (shared engine).
//   escalate(base, rate, year, compounding): year is 1-indexed periods elapsed.
//     compounding: base * (1+rate)^year   |   simple: base * (1 + rate*year)
//   npv(cashflows, discount_rate): cashflows[0] is Year-0 (undiscounted); Year n >= 1
//     discounted by n full periods, end-of-year convention (SKILL.md Financial Methodology).
// TCO escalation wiring (per SKILL.md "Deterministic computation"): Year 1 is the base
// value itself (no escalate() call); Year N (N >= 2) calls escalate(base, rate, N-1, compounding)
// so the year argument carries escalation STEPS elapsed, not the 1-indexed calendar year.
function escalateJS(base, rate, year, compounding) {
  if (year < 1) return base;
  return compounding ? base * Math.pow(1 + rate, year) : base * (1 + rate * year);
}
function npvJS(cashflows, rate) {
  var total = cashflows[0];
  for (var n = 1; n < cashflows.length; n++) total += cashflows[n] / Math.pow(1 + rate, n);
  return total;
}
// Generic bisection break-even finder: returns the value of a single scalar input at
// which f(value) crosses zero, or null if no sign change exists in [lo, hi].
function bisectBreakEven(f, lo, hi, iters) {
  var flo = f(lo), fhi = f(hi);
  if ((flo > 0) === (fhi > 0)) return null;
  for (var i = 0; i < (iters || 60); i++) {
    var mid = (lo + hi) / 2, fm = f(mid);
    if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else { hi = mid; }
  }
  return (lo + hi) / 2;
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

// --- ILLUSTRATIVE DATA (replace entirely per run) --------------------------------------------
// NUMBERS RECONCILE: every headline figure below (NPV, ROI, payback, TCO, savings waterfall,
// tornado, break-even) is DERIVED at render time from COMPONENTS + BASELINE via the kernel
// mirrors above, never hand-typed. Change a base rate or escalation and every KPI, chart, and
// table that depends on it moves together, the same discipline as the CNP escalation-cap lever.
const META = {
  dealName: "Atlas ERP Platform Consolidation - 5-Year Business Case",
  supplier: "Atlas Systems, Inc.",
  category: "Enterprise ERP Platform (Finance + Supply Chain modules)",
  decision: "Consolidate 3 legacy point solutions (finance, procurement, inventory) onto a single cloud ERP platform, 5-year term",
  preparedDate: "July 21, 2026",
  preparedFor: "Global IT Procurement",
  horizonYears: 5,
  currency: "USD",
};

const HORIZON = META.horizonYears;

// Cost components: License/Subscription and Support escalate annually; Implementation and
// Other (Training/Integration/Change Management) are one-time, landing in Year 0 with a Year-1
// stabilization tail. Extensible to further one-time lines (T&E, Change-orders, Admin) by
// adding entries with the same shape.
const COMPONENTS = [
  { key: "license", name: "License / Subscription", oneTime: false, base: 1150000, escalation: 0.030, compounding: true },
  { key: "implementation", name: "Implementation", oneTime: true, year0: 850000, year1Tail: 150000 },
  { key: "support", name: "Support & Maintenance", oneTime: false, base: 310000, escalation: 0.025, compounding: true },
  { key: "other", name: "Training / Integration / Change Mgmt", oneTime: true, year0: 120000, year1Tail: 60000 },
];

// Baseline (status-quo counterfactual): continuing to run the 3 legacy platforms, no
// consolidation, at the current uncapped escalation the incumbents have historically applied.
const BASELINE = { year1: 2400000, escalation: 0.040, compounding: true, source: "FY2026 actuals for the 3 legacy platforms, Finance cost center report" };

const ASSUMPTIONS = {
  currency: "USD",
  fx_rates: [],
  discount_rate: { value: 0.08, status: "CONFIRMED", basis: "nominal" },
  horizon_years: HORIZON,
  discounting_convention: "end_of_year",
  escalation_rate: { license: 0.030, support: 0.025, compounding: "annual", source: "Atlas order form Section 4.2, CPI-linked cap negotiated at signing" },
  baseline: { type: "status_quo_counterfactual", value: BASELINE.year1, source: BASELINE.source },
  volumes: [{ item: "Named users (Finance + Supply Chain)", qty: 640, unit: "seats" }],
  scenarios: { low: "escalation -1.0pt, implementation -10%", base: "as modeled", high: "escalation +1.5pt, implementation +15%, Year 3 scope add" },
  sensitivity_drivers: ["discount_rate", "future_state_escalation", "baseline_escalation", "implementation_cost_variance"],
};

const SCENARIO_ADJUST = {
  low: { escalationDelta: -0.010, implementationMult: 0.90, label: "Low" },
  base: { escalationDelta: 0, implementationMult: 1.00, label: "Base" },
  high: { escalationDelta: 0.015, implementationMult: 1.15, scopeAddYear: 3, scopeAddAmount: 200000, label: "High" },
};

// Named savings-waterfall levers, weighted shares of gross recurring savings. The last lever
// (escalation-rate improvement) is the PLUG: computed as the remainder so the steps always
// reconcile exactly to Baseline minus Net Future-State (no silent netting, per Rule 5).
const WATERFALL_LEVER_WEIGHTS = [
  { label: "Platform consolidation (rate reduction)", weight: 0.53 },
  { label: "Enterprise volume commitment discount", weight: 0.23 },
  { label: "Duplicate-license demand reduction", weight: 0.17 },
];

const RESEARCH_LOG = [
  { row: "Enterprise ERP TCO benchmark, comparable 3-to-1 consolidation deals", source: "market-rate-benchmarking output", date: "July 15, 2026", confidence: "MEDIUM" },
  { row: "Cloud ERP escalation-clause norms (CPI-linked caps)", source: "should-cost-builder bottoms-up analysis", date: "July 10, 2026", confidence: "MEDIUM" },
  { row: "Lilly WACC / discount rate for IT capital business cases", source: "Finance-confirmed rate, kickoff call", date: "July 18, 2026", confidence: "HIGH" },
];

// --- Derived data model (build once, module scope; G5 "complete data object before rendering") -
function buildComponentYearly(comp, horizon, escRateOverride, implMult) {
  var years = [];
  var mult = implMult == null ? 1 : implMult;
  for (var n = 0; n <= horizon; n++) {
    var amt;
    if (comp.oneTime) {
      if (n === 0) amt = comp.year0 * mult;
      else if (n === 1) amt = comp.year1Tail * mult;
      else amt = 0;
    } else {
      var rate = escRateOverride == null ? comp.escalation : escRateOverride;
      if (n === 0) amt = 0;
      else if (n === 1) amt = comp.base;
      else amt = escalateJS(comp.base, rate, n - 1, comp.compounding);
    }
    years.push(amt);
  }
  return years;
}
function buildBaselineYearly(horizon, escRateOverride) {
  var years = [];
  var rate = escRateOverride == null ? BASELINE.escalation : escRateOverride;
  for (var n = 0; n <= horizon; n++) {
    if (n === 0) years.push(0);
    else if (n === 1) years.push(BASELINE.year1);
    else years.push(escalateJS(BASELINE.year1, rate, n - 1, BASELINE.compounding));
  }
  return years;
}
function sumArr(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

// Scenario builder (Low/Base/High): applies a relative escalation delta per component and an
// implementation-cost multiplier, plus an optional one-time scope addition in a given year.
function buildScenario(escDelta, implMult, scopeAddYear, scopeAddAmount) {
  var comps = COMPONENTS.map(function (c) {
    var esc = c.oneTime ? null : (c.escalation + escDelta);
    var mult = c.oneTime ? implMult : null;
    return { key: c.key, name: c.name, oneTime: c.oneTime, yearly: buildComponentYearly(c, HORIZON, esc, mult) };
  });
  var totalYearly = new Array(HORIZON + 1).fill(0);
  comps.forEach(function (c) { c.yearly.forEach(function (v, i) { totalYearly[i] += v; }); });
  if (scopeAddYear != null) totalYearly[scopeAddYear] += scopeAddAmount;
  return { comps: comps, totalYearly: totalYearly };
}

const LOW_SCENARIO = buildScenario(SCENARIO_ADJUST.low.escalationDelta, SCENARIO_ADJUST.low.implementationMult, null, 0);
const BASE_SCENARIO = buildScenario(0, 1, null, 0);
const HIGH_SCENARIO = buildScenario(SCENARIO_ADJUST.high.escalationDelta, SCENARIO_ADJUST.high.implementationMult, SCENARIO_ADJUST.high.scopeAddYear, SCENARIO_ADJUST.high.scopeAddAmount);
const BASELINE_YEARLY = buildBaselineYearly(HORIZON, 0);

const NET_CASH_FLOW_BASE = BASE_SCENARIO.totalYearly.map(function (v, i) { return BASELINE_YEARLY[i] - v; });
const TCO5_BASE = sumArr(BASE_SCENARIO.totalYearly);
const BASELINE5_TOTAL = sumArr(BASELINE_YEARLY);
const NET_SAVINGS_BASE = BASELINE5_TOTAL - TCO5_BASE;
const NPV_BASE = npvJS(NET_CASH_FLOW_BASE, ASSUMPTIONS.discount_rate.value);

// ROI: undiscounted, per SKILL.md Financial Methodology. Total investment = sum of future-state
// cost outflows; total net benefit = cumulative net cash flow (baseline avoided cost minus
// future-state cost). Annualized ROI is SIMPLE (ROI / horizon), labeled as such, not compounded.
const ROI_CUMULATIVE_PCT = (NET_SAVINGS_BASE / TCO5_BASE) * 100;
const ROI_ANNUALIZED_PCT = ROI_CUMULATIVE_PCT / HORIZON;

// Payback: cumulative net cash flow crossing zero, linear interpolation within the crossover
// year. Simple = undiscounted series; discounted = same crossover logic on discounted series.
function computePayback(netCF) {
  var cum = 0, prevCum = 0;
  for (var n = 0; n < netCF.length; n++) {
    prevCum = cum;
    cum += netCF[n];
    if (cum >= 0) {
      if (n === 0) return 0;
      var unrecovered = -prevCum;
      var flowThisYear = netCF[n];
      var frac = flowThisYear !== 0 ? unrecovered / flowThisYear : 0;
      return (n - 1) + frac;
    }
  }
  return null;
}
const DISCOUNTED_NET_CF_BASE = NET_CASH_FLOW_BASE.map(function (v, n) { return n === 0 ? v : v / Math.pow(1 + ASSUMPTIONS.discount_rate.value, n); });
const PAYBACK_SIMPLE = computePayback(NET_CASH_FLOW_BASE);
const PAYBACK_DISCOUNTED = computePayback(DISCOUNTED_NET_CF_BASE);

// Biggest cost driver as % of TCO (insight stat reused by both the Headline lever narrative and
// the Cost Component Buildup narrative, per the same-computation-once discipline).
const COMPONENT_5YR_TOTALS = BASE_SCENARIO.comps.map(function (c) { return { key: c.key, name: c.name, total: sumArr(c.yearly) }; });
const BIGGEST_DRIVER = COMPONENT_5YR_TOTALS.slice().sort(function (a, b) { return b.total - a.total; })[0];
const BIGGEST_DRIVER_PCT = (BIGGEST_DRIVER.total / TCO5_BASE) * 100;

// Savings waterfall (vs baseline), computed programmatically so it reconciles exactly by
// construction: Baseline (Year1-5 recurring) minus the named + plug levers, plus one-time cost
// to achieve, equals Net Future-State (Year0-5, all-in) -- which equals TCO5_BASE exactly.
const BASELINE_RECURRING_TOTAL = sumArr(BASELINE_YEARLY.slice(1));
const RECURRING_COMPONENTS = BASE_SCENARIO.comps.filter(function (c) { return !c.oneTime; });
const ONETIME_COMPONENTS = BASE_SCENARIO.comps.filter(function (c) { return c.oneTime; });
const FUTURE_RECURRING_TOTAL = sumArr(RECURRING_COMPONENTS.map(function (c) { return sumArr(c.yearly.slice(1)); }));
const ONETIME_TOTAL = sumArr(ONETIME_COMPONENTS.map(function (c) { return sumArr(c.yearly); }));
const GROSS_RECURRING_SAVINGS = BASELINE_RECURRING_TOTAL - FUTURE_RECURRING_TOTAL;
const NAMED_LEVER_AMOUNTS = WATERFALL_LEVER_WEIGHTS.map(function (l) { return GROSS_RECURRING_SAVINGS * l.weight; });
const NAMED_LEVER_SUM = sumArr(NAMED_LEVER_AMOUNTS);
const ESCALATION_IMPROVEMENT_LEVER = GROSS_RECURRING_SAVINGS - NAMED_LEVER_SUM; // plug, guarantees exact reconciliation
const NET_FUTURE_STATE = BASELINE_RECURRING_TOTAL - GROSS_RECURRING_SAVINGS + ONETIME_TOTAL;

const WATERFALL_STEPS = [
  { label: "Baseline (status quo, 3 legacy platforms)", type: "start", value: BASELINE_RECURRING_TOTAL },
  { label: WATERFALL_LEVER_WEIGHTS[0].label, type: "delta", value: -NAMED_LEVER_AMOUNTS[0] },
  { label: WATERFALL_LEVER_WEIGHTS[1].label, type: "delta", value: -NAMED_LEVER_AMOUNTS[1] },
  { label: WATERFALL_LEVER_WEIGHTS[2].label, type: "delta", value: -NAMED_LEVER_AMOUNTS[2] },
  { label: "Escalation-rate improvement (3.0%/2.5% vs 4.0% status quo)", type: "delta", value: -ESCALATION_IMPROVEMENT_LEVER },
  { label: "One-time costs to achieve (implementation, training, integration)", type: "delta", value: ONETIME_TOTAL },
  { label: "Net Future-State (5-yr, all-in)", type: "end", value: NET_FUTURE_STATE },
];
(function () { // running-total pass, sets .base/.display for the waterfall chart
  var running = 0;
  WATERFALL_STEPS.forEach(function (s) {
    if (s.type === "start") { running = s.value; s.base = 0; s.display = s.value; s.color = MUT; }
    else if (s.type === "end") { s.base = 0; s.display = s.value; s.color = BLU; }
    else {
      var start = running, end = running + s.value;
      s.base = Math.min(start, end);
      s.display = Math.abs(s.value);
      s.color = s.value < 0 ? BLU : R;
      running = end;
    }
  });
})();

// Sensitivity: npvAt() sweeps ONE named driver (relative delta from its own base, or an
// absolute discount rate) while holding the rest at base. Same kernel mirrors as above.
function npvAt(overrides) {
  var dr = overrides.discountRate != null ? overrides.discountRate : ASSUMPTIONS.discount_rate.value;
  var escDelta = overrides.escDelta || 0;
  var baseEscDelta = overrides.baseEscDelta || 0;
  var implMult = overrides.implMult != null ? overrides.implMult : 1;
  var scenario = buildScenario(escDelta, implMult, null, 0);
  var baseline = buildBaselineYearly(HORIZON, baseEscDelta);
  var netCF = scenario.totalYearly.map(function (v, i) { return baseline[i] - v; });
  return npvJS(netCF, dr);
}
const DRIVER_DEFS = [
  { key: "discountRate", label: "Discount rate (WACC)", low: 0.05, high: 0.11, fmt: function (v) { return fP(v * 100); }, bracket: [0, 5] },
  { key: "escDelta", label: "Future-state escalation, License + Support (delta)", low: -0.015, high: 0.020, fmt: function (v) { return (v >= 0 ? "+" : "") + (v * 100).toFixed(1) + "pt"; }, bracket: [-0.05, 0.15] },
  { key: "baseEscDelta", label: "Status-quo baseline escalation (delta)", low: -0.020, high: 0.020, fmt: function (v) { return (v >= 0 ? "+" : "") + (v * 100).toFixed(1) + "pt"; }, bracket: [-0.04, 0.10] },
  { key: "implMult", label: "Implementation cost variance", low: 0.85, high: 1.25, fmt: function (v) { return ((v - 1) * 100 >= 0 ? "+" : "") + ((v - 1) * 100).toFixed(0) + "%"; }, bracket: [0, 4] },
];
const TORNADO_ROWS = DRIVER_DEFS.map(function (d) {
  var ovLow = {}; ovLow[d.key] = d.low;
  var ovHigh = {}; ovHigh[d.key] = d.high;
  var npvLow = npvAt(ovLow), npvHigh = npvAt(ovHigh);
  return { key: d.key, label: d.label, low: d.low, high: d.high, npvLow: npvLow, npvHigh: npvHigh, delta: Math.abs(npvHigh - npvLow), fmt: d.fmt, bracket: d.bracket };
}).sort(function (a, b) { return b.delta - a.delta; });
const TOP_DRIVER = TORNADO_ROWS[0];
const TOP_DRIVER_BREAKEVEN = (function () {
  var ov = {};
  var val = bisectBreakEven(function (x) { ov = {}; ov[TOP_DRIVER.key] = x; return npvAt(ov); }, TOP_DRIVER.bracket[0], TOP_DRIVER.bracket[1]);
  return val;
})();
// Driver-agnostic phrase for the top sensitivity driver's break-even, used on the Headline
// "what would change this conclusion" line. Never fabricates a 0.0%-style value when no sign
// change exists in the tested bracket; states the robustness fact honestly instead. Pronoun-
// friendly (no repeated driver name) so the calling sentence can name the driver once.
const TOP_DRIVER_BREAKEVEN_PHRASE = TOP_DRIVER_BREAKEVEN == null
  ? "NPV stays " + (NPV_BASE >= 0 ? "positive" : "negative") + " across the full tested range for it, so no break-even value exists within that band"
  : "its break-even is " + TOP_DRIVER.fmt(TOP_DRIVER_BREAKEVEN);

// Live lever (Headline + Sensitivity sliders): an ABSOLUTE escalation cap applied uniformly to
// BOTH recurring components (License and Support), the same "escalation cap -> multi-year TCO"
// framing commercial-negotiation-prep uses for its own lever. Discount rate reprices the SAME
// validated net-cash-flow series, pure client-side arithmetic per the kernel mirrors above.
function buildLeverScenario(escCapAbs) {
  var comps = COMPONENTS.map(function (c) {
    var esc = c.oneTime ? null : escCapAbs;
    return { key: c.key, yearly: buildComponentYearly(c, HORIZON, esc, c.oneTime ? 1 : null) };
  });
  var totalYearly = new Array(HORIZON + 1).fill(0);
  comps.forEach(function (c) { c.yearly.forEach(function (v, i) { totalYearly[i] += v; }); });
  return { comps: comps, totalYearly: totalYearly };
}
function leverNetCF(escCapAbs) {
  var scenario = buildLeverScenario(escCapAbs);
  return scenario.totalYearly.map(function (v, i) { return BASELINE_YEARLY[i] - v; });
}

// --- Chart data (module scope, static) --------------------------------------------------------
const COMPONENT_CHART_DATA = (function () {
  var out = [];
  for (var n = 0; n <= HORIZON; n++) {
    var row = { year: "Year " + n };
    BASE_SCENARIO.comps.forEach(function (c) { row[c.name] = c.yearly[n]; });
    out.push(row);
  }
  return out;
})();
const SCENARIO_CHART_DATA = (function () {
  var out = [];
  for (var n = 0; n <= HORIZON; n++) out.push({ year: "Year " + n, Low: LOW_SCENARIO.totalYearly[n], Base: BASE_SCENARIO.totalYearly[n], High: HIGH_SCENARIO.totalYearly[n] });
  return out;
})();
const TORNADO_CHART_DATA = TORNADO_ROWS.slice(0, 3).map(function (r) {
  var lo = Math.min(r.npvLow, r.npvHigh), hi = Math.max(r.npvLow, r.npvHigh);
  return { name: r.label, base: lo, span: hi - lo, lowLabel: r.fmt(r.low), highLabel: r.fmt(r.high), npvLow: r.npvLow, npvHigh: r.npvHigh };
});

// ---------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------------------------
export default function ProFormaDashboard() {
  var _t = useState("Headline"); var tab = _t[0]; var setTab = _t[1];
  var _dr = useState(ASSUMPTIONS.discount_rate.value); var discountRate = _dr[0]; var setDiscountRate = _dr[1];
  var _ec = useState(0.030); var escCap = _ec[0]; var setEscCap = _ec[1];

  var lever = useMemo(function () {
    var netCF = leverNetCF(escCap);
    var scenario = buildLeverScenario(escCap);
    var tco5 = sumArr(scenario.totalYearly);
    return { netCF: netCF, npv: npvJS(netCF, discountRate), tco5: tco5, scenario: scenario };
  }, [escCap, discountRate]);

  var leverAtTarget = useMemo(function () {
    var netCF = leverNetCF(0.030);
    return { npv: npvJS(netCF, discountRate), tco5: sumArr(buildLeverScenario(0.030).totalYearly) };
  }, [discountRate]);
  var leverAtCeiling = useMemo(function () {
    var netCF = leverNetCF(0.060);
    return { npv: npvJS(netCF, discountRate), tco5: sumArr(buildLeverScenario(0.060).totalYearly) };
  }, [discountRate]);

  var npvCurve = useMemo(function () {
    var netCF = leverNetCF(escCap);
    var pts = [];
    for (var pct = 2; pct <= 20; pct++) pts.push({ ratePct: pct, npv: npvJS(netCF, pct / 100) });
    return pts;
  }, [escCap]);

  var breakEvenAtCurrentEscCap = useMemo(function () {
    var netCF = leverNetCF(escCap);
    return bisectBreakEven(function (r) { return npvJS(netCF, r); }, 0, 5);
  }, [escCap]);

  var capBand = escCap * 100 <= 3 ? "at or below the negotiated target" : escCap * 100 <= 6 ? "between target and the walk-away ceiling" : "beyond the walk-away ceiling";
  var capColor = escCap * 100 <= 3 ? BLU : escCap * 100 <= 6 ? AMB : R;

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Pro-Forma Builder | Financial Model</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.dealName}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{META.preparedDate} | {META.horizonYears}-year horizon<br />Prepared for {META.preparedFor}</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto" }}>
        {TABS.map(function (t) {
          var active = t === tab;
          return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}{NEEDS_INPUT[t] ? <span style={{ color: AMB, marginLeft: 4 }}>*</span> : null}</button>;
        })}
      </div>

      <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {tab === "Headline" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Metric label="NPV" value={f$(NPV_BASE)} sub={"@ " + fP(ASSUMPTIONS.discount_rate.value * 100) + " discount rate"} good={NPV_BASE >= 0} warn={NPV_BASE < 0} />
            <Metric label="ROI" value={fP(ROI_CUMULATIVE_PCT)} sub={"annualized " + fP(ROI_ANNUALIZED_PCT) + " (simple, undiscounted)"} good />
            <Metric label="Payback" value={(PAYBACK_SIMPLE == null ? "beyond horizon" : PAYBACK_SIMPLE.toFixed(1) + " yrs")} sub={"discounted " + (PAYBACK_DISCOUNTED == null ? "beyond horizon" : PAYBACK_DISCOUNTED.toFixed(1) + " yrs")} />
            <Metric label="Net 5-Yr TCO" value={f$(TCO5_BASE)} sub="nominal, Year 0-5, Base scenario" accent />
            <Metric label="Total Net Savings vs Baseline" value={f$(NET_SAVINGS_BASE)} sub={fP((NET_SAVINGS_BASE / BASELINE_RECURRING_TOTAL) * 100) + " vs status-quo baseline"} good />
          </div>
          <div style={{ background: CARD, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: DK }}>
            <b>What would change this conclusion:</b> {TOP_DRIVER.label} is the single most influential input (see Sensitivity); {TOP_DRIVER_BREAKEVEN_PHRASE}. The case weakens fastest if implementation cost overruns exceed the modeled High-scenario band or the status-quo baseline stops escalating at its historical 4.0% run rate.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Cost Component Buildup" note="Base scenario, Year 0-5">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={COMPONENT_CHART_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={f$} tick={{ fontSize: 11 }} width={56} />
                  <Tooltip content={<Tip />} />
                  {BASE_SCENARIO.comps.map(function (c, i) { return <Bar key={c.key} dataKey={c.name} stackId="a" fill={PAL[i]} />; })}
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
                {BASE_SCENARIO.comps.map(function (c, i) {
                  return <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: PAL[i], display: "inline-block" }} />{c.name}
                  </div>;
                })}
              </div>
            </Card>
            <Card title="Reading the Buildup">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{BIGGEST_DRIVER.name} is the largest single component at {fP(BIGGEST_DRIVER_PCT)} of the five-year TCO ({f$(BIGGEST_DRIVER.total)}), which is why it drives the top sensitivity row on the Sensitivity tab rather than Implementation or the Training/Integration line.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Year 0 carries {f$(BASE_SCENARIO.totalYearly[0])} of one-time Implementation and Other spend with no offsetting baseline cost, which is why the net cash flow is negative in Year 0 even though every year from Year 1 onward is net-positive versus the status-quo counterfactual.</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 4 }}>
            <Card title="What-If: Discount Rate and Escalation Cap" note="Live reprice, drag to model">
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginBottom: 4 }}>
                  <span>Discount rate (WACC)</span>
                  <span style={{ fontWeight: 700, color: BLU, fontFamily: "Georgia,serif", fontSize: 16 }}>{fP(discountRate * 100)}</span>
                </div>
                <input type="range" min={0.02} max={0.20} step={0.0025} value={discountRate} onChange={function (e) { setDiscountRate(parseFloat(e.target.value)); }} style={{ width: "100%", accentColor: BLU }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginBottom: 4 }}>
                  <span>Recurring cost escalation cap (License + Support, uniform)</span>
                  <span style={{ fontWeight: 700, color: capColor, fontFamily: "Georgia,serif", fontSize: 16 }}>{fP(escCap * 100)}</span>
                </div>
                <input type="range" min={0} max={0.08} step={0.005} value={escCap} onChange={function (e) { setEscCap(parseFloat(e.target.value)); }} style={{ width: "100%", accentColor: capColor }} />
                <div style={{ position: "relative", height: 16, fontSize: 9, color: MUT }}>
                  <span style={{ position: "absolute", left: "37.5%", transform: "translateX(-50%)" }}>Target 3.0%</span>
                  <span style={{ position: "absolute", left: "75%", transform: "translateX(-50%)" }}>Ceiling 6.0%</span>
                </div>
                <div style={{ fontSize: 11, color: capColor, fontWeight: 700, marginTop: 14 }}>Currently {capBand}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <Metric label="NPV @ current inputs" value={f$(lever.npv)} good={lever.npv >= 0} warn={lever.npv < 0} />
                <Metric label="5-Yr TCO @ current inputs" value={f$(lever.tco5)} accent />
              </div>
            </Card>
            <Card title="Reading the Lever">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>At the current {fP(escCap * 100)} cap and {fP(discountRate * 100)} discount rate, NPV is {f$(lever.npv)} and the 5-year TCO is {f$(lever.tco5)}. Holding the cap at the 3.0% target instead of the current setting moves NPV to {f$(leverAtTarget.npv)}; letting it drift to the 6.0% ceiling moves it to {f$(leverAtCeiling.npv)}.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Every figure on this card is computed from the same validated net-cash-flow series that produced the headline NPV above, using the identical kernel-mirrored escalate() and npv() formulas commercial-negotiation-prep uses for its own escalation-cap lever, so a change here is directly comparable across both skills' outputs.</p>
            </Card>
          </div>
        </div>}

        {tab === "Scenario Projection" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Low / Base / High Cost Projection" note="Total cost by year, all components">
              <ResponsiveContainer width="100%" height={230}>
                <ComposedChart data={SCENARIO_CHART_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={f$} tick={{ fontSize: 11 }} width={56} />
                  <Tooltip content={<Tip />} />
                  <Line type="monotone" dataKey="Low" stroke={BLU} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Base" stroke={BRN} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="High" stroke={R} strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}><span style={{ width: 9, height: 9, borderRadius: 2, background: BLU, display: "inline-block" }} />Low</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}><span style={{ width: 9, height: 9, borderRadius: 2, background: BRN, display: "inline-block" }} />Base</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}><span style={{ width: 9, height: 9, borderRadius: 2, background: R, display: "inline-block" }} />High</div>
              </div>
            </Card>
            <Card title="Year 1 vs Steady State">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Year 1 total cost is {f$(BASE_SCENARIO.totalYearly[1])}, already the largest recurring-cost year because License and Support both start at full base rate with no escalation yet applied. By Year {HORIZON} (steady state), the Base-scenario total reaches {f$(BASE_SCENARIO.totalYearly[HORIZON])}, a {fP(((BASE_SCENARIO.totalYearly[HORIZON] - BASE_SCENARIO.totalYearly[1]) / BASE_SCENARIO.totalYearly[1]) * 100)} increase driven entirely by compounding escalation, not by volume growth.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The Low-to-High band widens from {f$(HIGH_SCENARIO.totalYearly[0] - LOW_SCENARIO.totalYearly[0])} in Year 0 (implementation-cost variance only) to {f$(HIGH_SCENARIO.totalYearly[HORIZON] - LOW_SCENARIO.totalYearly[HORIZON])} in Year {HORIZON}, because escalation-rate uncertainty compounds while implementation-cost uncertainty does not.</p>
            </Card>
          </div>

          <Card title="Cost Component Buildup, by Year" note="Base scenario, expandable matrix">
            <STable
              columns={[{ l: "Component" }].concat([0, 1, 2, 3, 4, 5].map(function (n) { return { l: "Year " + n, a: "right" }; })).concat([{ l: "5-Yr Total", a: "right" }])}
              rows={BASE_SCENARIO.comps.map(function (c) {
                var total = sumArr(c.yearly);
                return [{ d: c.name, b: true }].concat(c.yearly.map(function (v) { return { d: fF(v), v: v, a: "right" }; })).concat([{ d: fF(total), v: total, b: true, c: BLU, a: "right" }]);
              }).concat([[{ d: "TOTAL", b: true, c: R }].concat(BASE_SCENARIO.totalYearly.map(function (v) { return { d: fF(v), v: v, b: true, a: "right" }; })).concat([{ d: fF(TCO5_BASE), v: TCO5_BASE, b: true, c: R, a: "right" }])])}
            />
          </Card>
        </div>}

        {tab === "Savings Waterfall" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Metric label="Baseline (status quo)" value={f$(BASELINE_RECURRING_TOTAL)} sub="Year 1-5, no consolidation" />
            <Metric label="Gross Recurring Savings" value={f$(GROSS_RECURRING_SAVINGS)} sub={fP((GROSS_RECURRING_SAVINGS / BASELINE_RECURRING_TOTAL) * 100) + " of baseline"} good />
            <Metric label="One-Time Cost to Achieve" value={f$(ONETIME_TOTAL)} sub="implementation + training/integration" accent />
            <Metric label="Net Savings" value={f$(NET_SAVINGS_BASE)} sub="gross savings less one-time cost" good />
            <Metric label="Net Future-State (5-yr, all-in)" value={f$(NET_FUTURE_STATE)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
            <Card title="Baseline to Net Future-State" note="Signed steps, reconciles exactly">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={WATERFALL_STEPS} margin={{ top: 20, right: 8, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} height={90} />
                  <YAxis tickFormatter={f$} tick={{ fontSize: 11 }} width={56} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="base" stackId="w" fill="transparent" />
                  <Bar dataKey="display" stackId="w">
                    <LabelList dataKey="value" position="top" formatter={f$} style={{ fontSize: 10, fill: DK }} />
                    {WATERFALL_STEPS.map(function (s, i) { return <Cell key={i} fill={s.color} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Reading the Waterfall">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Four levers carry the {f$(GROSS_RECURRING_SAVINGS)} in gross recurring savings: platform consolidation ({f$(NAMED_LEVER_AMOUNTS[0])}) is the largest single lever, followed by the enterprise volume commitment ({f$(NAMED_LEVER_AMOUNTS[1])}), duplicate-license elimination ({f$(NAMED_LEVER_AMOUNTS[2])}), and the escalation-rate improvement of holding License/Support at 3.0%/2.5% against the incumbents' 4.0% run rate ({f$(ESCALATION_IMPROVEMENT_LEVER)}).</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>The {f$(ONETIME_TOTAL)} one-time cost to achieve (implementation plus training/integration) consumes {fP((ONETIME_TOTAL / GROSS_RECURRING_SAVINGS) * 100)} of the gross savings, leaving {f$(NET_SAVINGS_BASE)} net over the 5-year horizon: the same net-savings figure shown on the Headline KPI row, computed from these same steps, not netted separately.</p>
            </Card>
          </div>
        </div>}

        {tab === "Assumptions & Sources" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title="Assumptions Register">
              <STable
                columns={[{ l: "Assumption" }, { l: "Value" }, { l: "Source" }, { l: "Confidence" }]}
                rows={[
                  [{ d: "Currency", b: true }, { d: ASSUMPTIONS.currency }, { d: "Deal currency, no conversion required" }, { d: <ConfBadge c="HIGH" /> }],
                  [{ d: "Discount rate (WACC)", b: true }, { d: fP(ASSUMPTIONS.discount_rate.value * 100) + " (" + ASSUMPTIONS.discount_rate.basis + ", " + ASSUMPTIONS.discount_rate.status + ")" }, { d: RESEARCH_LOG[2].source + ", " + RESEARCH_LOG[2].date }, { d: <ConfBadge c={RESEARCH_LOG[2].confidence} /> }],
                  [{ d: "Horizon", b: true }, { d: ASSUMPTIONS.horizon_years + " years" }, { d: "Deal term, order form" }, { d: <ConfBadge c="HIGH" /> }],
                  [{ d: "Discounting convention", b: true }, { d: ASSUMPTIONS.discounting_convention.replace("_", "-") }, { d: "pro-forma-builder canonical convention" }, { d: <ConfBadge c="HIGH" /> }],
                  [{ d: "Escalation, License", b: true }, { d: fP(ASSUMPTIONS.escalation_rate.license * 100) + " compounding annual" }, { d: ASSUMPTIONS.escalation_rate.source }, { d: <ConfBadge c="HIGH" /> }],
                  [{ d: "Escalation, Support", b: true }, { d: fP(ASSUMPTIONS.escalation_rate.support * 100) + " compounding annual" }, { d: ASSUMPTIONS.escalation_rate.source }, { d: <ConfBadge c="HIGH" /> }],
                  [{ d: "Baseline (status quo)", b: true }, { d: fF(ASSUMPTIONS.baseline.value) + "/yr, " + fP(BASELINE.escalation * 100) + " escalation" }, { d: ASSUMPTIONS.baseline.source }, { d: <ConfBadge c="HIGH" /> }],
                  [{ d: "ERP TCO benchmark anchor", b: true }, { d: "Consolidation-deal comparables" }, { d: RESEARCH_LOG[0].source + ", " + RESEARCH_LOG[0].date }, { d: <ConfBadge c={RESEARCH_LOG[0].confidence} /> }],
                  [{ d: "Escalation-clause norms", b: true }, { d: "CPI-linked cap comparables" }, { d: RESEARCH_LOG[1].source + ", " + RESEARCH_LOG[1].date }, { d: <ConfBadge c={RESEARCH_LOG[1].confidence} /> }],
                  [{ d: "EU data-residency cost premium", b: true }, { d: "Not established" }, { d: "2 external searches, no usable anchor" }, { d: <ConfBadge c="LOW" /> }],
                ]}
              />
            </Card>
            <Card title="Research Log">
              {RESEARCH_LOG.map(function (r, i) {
                return <div key={i} style={{ padding: "8px 0", borderBottom: i < RESEARCH_LOG.length - 1 ? "1px solid " + BD : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{r.row}</div>
                  <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{r.source}, {r.date}</div>
                </div>;
              })}
              <div style={{ marginTop: 10 }}>
                <StateBanner kind="RESEARCH_PENDING" msg="EU data-residency cost premium: 2 external searches run (Gartner ERP TCO 2025, IDC Cloud ERP Pricing Trends), neither isolated a residency-specific premium for this platform tier. Flagged for should-cost-builder follow-up before final sign-off; not assumed to be zero." />
              </div>
            </Card>
          </div>
        </div>}

        {tab === "Sensitivity" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Tornado: NPV Sensitivity by Driver" note="Top 3 of 4 modeled drivers">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={TORNADO_CHART_DATA} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" tickFormatter={f$} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={230} tick={{ fontSize: 10 }} />
                  <Tooltip content={<Tip />} />
                  <ReferenceLine x={NPV_BASE} stroke={R} strokeDasharray="4 2" label={{ value: "Base case NPV", position: "top", fontSize: 10, fill: R }} />
                  <Bar dataKey="base" stackId="t" fill="transparent" />
                  <Bar dataKey="span" stackId="t" fill={BLU} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 10, color: MUT, marginTop: 4 }}>Bars span each driver's low-to-high NPV outcome, swung one at a time, others held at base. Full driver list and the low/high values used are in Assumptions and Sources.</div>
            </Card>
            <Card title="Break-Even and Robustness">
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>Top driver</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: DK }}>{TOP_DRIVER.label}</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>NPV swings {f$(TOP_DRIVER.delta)} across the tested range ({TOP_DRIVER.fmt(TOP_DRIVER.low)} to {TOP_DRIVER.fmt(TOP_DRIVER.high)})</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>Break-even</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: TOP_DRIVER_BREAKEVEN == null ? MUT : BLU }}>{TOP_DRIVER_BREAKEVEN == null ? "Not reached in tested range" : TOP_DRIVER.fmt(TOP_DRIVER_BREAKEVEN)}</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{TOP_DRIVER_BREAKEVEN == null ? "NPV stays " + (NPV_BASE >= 0 ? "positive" : "negative") + " across the full tested band for this driver; never extrapolated beyond it." : "The value of " + TOP_DRIVER.label.toLowerCase() + " at which NPV crosses zero, holding every other driver at base."}</div>
              </div>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}><b>Robustness verdict:</b> at the base case ({fP(ASSUMPTIONS.discount_rate.value * 100)} discount rate, {fP(ASSUMPTIONS.escalation_rate.license * 100)}/{fP(ASSUMPTIONS.escalation_rate.support * 100)} escalation), NPV is {f$(NPV_BASE)}{NPV_BASE >= 0 ? " and stays positive across a meaningful band of every tested driver" : " and is already negative before any adverse swing is applied"}, {TOP_DRIVER.key === "discountRate" ? "resilient specifically to escalation and implementation-cost variance, since the discount rate would need to move well outside a defensible WACC range to flip the sign" : "sensitive to " + TOP_DRIVER.label.toLowerCase() + " in particular, which is the term to revisit first if leadership asks what could change the recommendation"}.</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 4 }}>
            <Card title="NPV vs Discount Rate" note={"Live curve at current " + fP(escCap * 100) + " escalation cap"}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginBottom: 4 }}>
                  <span>Discount rate (WACC)</span>
                  <span style={{ fontWeight: 700, color: BLU, fontFamily: "Georgia,serif", fontSize: 16 }}>{fP(discountRate * 100)}</span>
                </div>
                <input type="range" min={0.02} max={0.20} step={0.0025} value={discountRate} onChange={function (e) { setDiscountRate(parseFloat(e.target.value)); }} style={{ width: "100%", accentColor: BLU }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginTop: 10, marginBottom: 4 }}>
                  <span>Escalation cap (License + Support)</span>
                  <span style={{ fontWeight: 700, color: capColor, fontFamily: "Georgia,serif", fontSize: 16 }}>{fP(escCap * 100)}</span>
                </div>
                <input type="range" min={0} max={0.08} step={0.005} value={escCap} onChange={function (e) { setEscCap(parseFloat(e.target.value)); }} style={{ width: "100%", accentColor: capColor }} />
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <ComposedChart data={npvCurve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis dataKey="ratePct" tickFormatter={function (v) { return v + "%"; }} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={f$} tick={{ fontSize: 11 }} width={56} />
                  <Tooltip content={<Tip />} />
                  <ReferenceLine y={0} stroke={MUT} strokeDasharray="2 2" />
                  <ReferenceLine x={Math.round(discountRate * 100)} stroke={BLU} strokeDasharray="4 2" label={{ value: "Current", position: "top", fontSize: 10, fill: BLU }} />
                  {breakEvenAtCurrentEscCap != null && <ReferenceLine x={Math.round(breakEvenAtCurrentEscCap * 100)} stroke={R} strokeDasharray="4 2" label={{ value: "Break-even", position: "insideTopRight", fontSize: 10, fill: R }} />}
                  <Line type="monotone" dataKey="npv" stroke={R} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Reading the Curve">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>At the current {fP(escCap * 100)} escalation cap, NPV crosses zero at {breakEvenAtCurrentEscCap == null ? "a rate outside the tested 2-20% band" : fP(breakEvenAtCurrentEscCap * 100)}, well {breakEvenAtCurrentEscCap != null && breakEvenAtCurrentEscCap > discountRate ? "above" : "below"} the {fP(discountRate * 100)} rate currently selected, which is why the case reads as robust to reasonable WACC revisions.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Raising the escalation cap shifts the entire curve down (less future benefit, same discounting), moving the break-even rate to the left; lowering it shifts the curve up. Drag either slider to see both effects at once, the same lever shown on the Headline tab, sharing the identical computation.</p>
            </Card>
          </div>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Model built on stated assumptions to structure a financial case, not an audited forecast. Finance owns the numbers.</div>
        <div>Eli Lilly and Company - Confidential | Pro-Forma Builder | 2026</div>
      </div>
    </div>
  );
}
