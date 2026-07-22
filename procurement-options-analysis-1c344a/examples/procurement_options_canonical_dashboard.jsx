import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from "recharts";

// ---------------------------------------------------------------------------
// Procurement Options Analysis - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure. 5 tabs, identical on every run for every request/category.
// Only the data changes per run. See references/dashboard-canonical.md for the
// full spec this file implements. House style: SUITE STANDARD (Arial body,
// Georgia titles, dark #212121 header with red rule, Lilly-approved palette).
// Components copied verbatim from lilly-brand-assets-1c344a,
// references/dashboard-components.md. Data below is ILLUSTRATIVE (an EU
// cold-chain track-and-trace visibility platform decision for a new
// Rotterdam-Frankfurt distribution lane). Clone the structure, swap the data.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green
// anywhere; positive signal uses Bold Blue (BLU) / Neutral Sky (OK), never a
// "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Chart palette: exactly the 6 on-brand hexes from dashboard-components.md.
// Also doubles as the fixed per-dimension color assignment for the Scored
// Comparison stacked bar (Cost/Time/Feasibility/SwitchingBurden/Risk/Optionality).
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

const TABS = ["Overview & Recommendation", "Options Matrix", "Scored Comparison", "Recommendation & Rationale", "Evidence & Assumptions"];
const NEEDS_INPUT = {}; // no tab is pending input in this fully-populated illustrative run

// --- Formatting helpers -----------------------------------------------------------------------
function fScore(v) { return v == null ? "" : v.toFixed(2); }
function fPct(v) { return v == null ? "" : v.toFixed(0) + "%"; }

// Score-to-color on the canonical 0.0-5.0 suite scale (verbatim from
// dashboard-components.md scC/scBg; 4.0+ favorable, 3.0-3.9 caution, below 3.0 unfavorable).
function scC(v) { return v == null ? MUT : v >= 4.0 ? BLU : v >= 3.0 ? AMB : R; }
function scBg(v) { return v == null ? CARD : v >= 4.0 ? OK : v >= 3.0 ? WARM : RISK; }

// --- numeric_kernel.py mirror (weighted_score) ------------------------------------------------
// Source of truth: procurement-options-analysis-1c344a/numeric_kernel.py (vendored from
// lilly-procurement-kernels). Signature and refusal behavior copied verbatim; do not hand-edit
// the math independently of that file. weighted_score(scores, weights) = sum(scores[k]*weights[k]),
// refusing (here: returning null and flagging) if weights do not foot to 1.0 within tolerance.
function weightSumOk(weights) {
  var sum = 0;
  for (var k in weights) sum += weights[k];
  return Math.abs(sum - 1.0) <= 0.001;
}
function weightedScoreJS(scores, weights) {
  if (!weightSumOk(weights)) return null; // mirrors WeightSumError: refuse, never silently renormalize
  var total = 0;
  for (var k in weights) total += (scores[k] == null ? 0 : scores[k]) * weights[k];
  return total;
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
function StateBanner({ kind, msg }) {
  var map = { NEEDS_INPUT: [AMB, WARM, "Needs input"], NOT_APPLICABLE: [MUT, CARD, "Not applicable"], RESEARCH_PENDING: [MUT, CARD, "Research pending"], RECONCILE: [R, RISK, "Score vs. evidence conflict"] };
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
    {payload.map(function (p, i) { return <div key={i}>{p.name ? p.name + ": " : ""}<strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong></div>; })}
  </div>;
}
// Confidence pill (HIGH/MEDIUM/LOW), same color discipline as SevPill; no new hexes.
// Local addition, same pattern pro-forma-builder and commercial-negotiation-prep use for
// their own confidence badges.
const CONF = { HIGH: [BLU, OK], MEDIUM: [AMB, WARM], LOW: [R, RISK] };
function ConfBadge({ c }) {
  var col = CONF[c] || [MUT, CARD];
  return <span style={{ color: col[0], background: col[1], border: "1px solid " + col[0] + "40", fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{c}</span>;
}
// Applicability pill (Applicable / Not Applicable). Local addition, same shape as ConfBadge.
function ApplPill({ applicable }) {
  var col = applicable ? [BLU, OK] : [MUT, CARD];
  return <span style={{ color: col[0], background: col[1], border: "1px solid " + col[0] + "40", fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{applicable ? "APPLICABLE" : "NOT APPLICABLE"}</span>;
}

// --- ILLUSTRATIVE DATA (replace entirely per run) --------------------------------------------
// NUMBERS RECONCILE: every Overall Score below is DERIVED at render time from the six raw
// dimension scores and the active weight profile via weightedScoreJS() above, never hand-typed.
// Switching the weight profile recomputes every score and the ranking together.
const META = {
  requestName: "EU Cold-Chain Track-and-Trace Visibility Platform, Rotterdam-Frankfurt Lane",
  category: "Logistics Technology / Supply Chain Visibility",
  decision: "A new cold-chain distribution lane needs temperature and location visibility coverage; no current supplier serves this specific lane today",
  preparedDate: "July 22, 2026",
  preparedFor: "Global IT Procurement",
};

// Dimension order is fixed suite-wide for this skill; do not reorder, add, or drop.
const DIMENSIONS = [
  { key: "cost", label: "Cost" },
  { key: "time", label: "Time" },
  { key: "feasibility", label: "Feasibility" },
  { key: "switching_burden", label: "Switching Burden" },
  { key: "risk", label: "Risk" },
  { key: "optionality", label: "Optionality" },
];

// Three named profiles plus the Custom slot (not shown as a live slider set in this reference
// implementation; the switcher below offers the three named profiles, per SKILL.md's "or a
// profile switcher" alternative to freeform six-way sliders). All three foot to 1.00.
const WEIGHT_PROFILES = {
  "Default": { cost: 0.25, time: 0.15, feasibility: 0.20, switching_burden: 0.10, risk: 0.20, optionality: 0.10 },
  "Time-Critical": { cost: 0.15, time: 0.35, feasibility: 0.20, switching_burden: 0.10, risk: 0.15, optionality: 0.05 },
  "Risk-Sensitive": { cost: 0.15, time: 0.10, feasibility: 0.15, switching_burden: 0.10, risk: 0.35, optionality: 0.15 },
};

// Ten fixed options. NOT_APPLICABLE options carry no scores (reason only); applicable options
// carry a score + a one-line rationale + an evidence status (VERIFIED/INFERRED/ASSUMED) per
// dimension. blockingItem (top-ranked option only, when present) drives the gate-vs-score
// reconciliation banner regardless of the confidence label, per SKILL.md's reconciliation rule.
const OPTIONS = [
  {
    key: "buy_externally", name: "Buy externally", applicable: true,
    scores: { cost: 3.0, time: 2.0, feasibility: 3.5, switching_burden: 3.0, risk: 3.5, optionality: 4.5 },
    evidence: { cost: "ASSUMED", time: "INFERRED", feasibility: "INFERRED", switching_burden: "INFERRED", risk: "ASSUMED", optionality: "INFERRED" },
    rationale: {
      cost: "Open competition could beat incumbent pricing, but new-supplier onboarding and dual-running costs during transition erode the near-term advantage; no RFP pricing exists yet.",
      time: "A full RFP-to-award cycle for a specialized cold-chain visibility platform runs 5 to 7 months before any go-live, per category norms; timeline-builder has not yet been run for a firm estimate.",
      feasibility: "A quick market scan surfaces at least 4 to 5 credible EU cold-chain track-and-trace vendors; nothing structurally blocks this path.",
      switching_burden: "New integration to the WMS/TMS is required, but the lane itself is new, so there is no existing state to migrate off of.",
      risk: "An unproven new-supplier relationship, but the category itself is not high-risk; pending a supplier-risk screen on any shortlisted candidate.",
      optionality: "No prior lock-in on this lane; a new, right-sized contract preserves the most future flexibility of any path.",
    },
  },
  {
    key: "build_internally", name: "Build internally", applicable: false,
    reason: "IT has no cold-chain track-and-trace / logistics-visibility engineering capability or precedent; this is not a realistic build candidate for this category.",
  },
  {
    key: "expand_incumbent", name: "Expand incumbent", applicable: true,
    scores: { cost: 4.0, time: 4.5, feasibility: 4.0, switching_burden: 4.5, risk: 3.5, optionality: 2.0 },
    evidence: { cost: "VERIFIED", time: "VERIFIED", feasibility: "VERIFIED", switching_burden: "VERIFIED", risk: "INFERRED", optionality: "INFERRED" },
    rationale: {
      cost: "The incumbent TMS supplier's published add-on module pricing sits materially below a new-supplier RFP, based on the existing volume-tier discount on file.",
      time: "No new onboarding or integration is required; the module activates on the existing TMS contract within weeks, per the incumbent's implementation SOW.",
      feasibility: "The incumbent confirmed in writing that the module supports the Rotterdam-Frankfurt lane's cold-chain sensor specification.",
      switching_burden: "This adds to an existing, already-integrated contract; there is no new system to stand up.",
      risk: "A known supplier with an existing performance record on other lanes, but this path deepens single-supplier dependency in the category.",
      optionality: "Further concentrates the logistics-visibility category on one supplier, reducing leverage and future flexibility at the next renewal.",
    },
  },
  {
    key: "reuse_existing", name: "Reuse existing", applicable: true,
    scores: { cost: 4.5, time: 3.0, feasibility: 2.0, switching_burden: 4.0, risk: 2.5, optionality: 3.5 },
    evidence: { cost: "VERIFIED", time: "ASSUMED", feasibility: "ASSUMED", switching_burden: "INFERRED", risk: "ASSUMED", optionality: "INFERRED" },
    rationale: {
      cost: "The license inventory confirms Lilly already owns a track-and-trace platform used on the US network; marginal cost is limited to EU sensor hardware and configuration.",
      time: "Faster than a new buy, but EU cold-chain regulatory configuration (GDP, temperature-excursion reporting) adds real setup time with no prior EU deployment to anchor the estimate.",
      feasibility: "The platform was built to a US regulatory and carrier-network profile; EU technical fit has not yet been validated, so this is a labeled assumption, not a confirmed fit.",
      switching_burden: "No new procurement or contract is required; this extends an owned platform to a new lane.",
      risk: "The unvalidated technical fit for EU cold-chain compliance is a real execution risk until a fit check confirms it either way.",
      optionality: "Keeps spend on an already-owned asset rather than adding a new supplier relationship.",
    },
  },
  {
    key: "consolidate_suppliers", name: "Consolidate suppliers", applicable: false,
    reason: "No existing supplier currently serves this specific new Rotterdam-Frankfurt lane; there is nothing yet to consolidate in this exact scope.",
  },
  {
    key: "defer", name: "Defer", applicable: true,
    scores: { cost: 5.0, time: 0.5, feasibility: 5.0, switching_burden: 5.0, risk: 2.0, optionality: 4.0 },
    evidence: { cost: "VERIFIED", time: "VERIFIED", feasibility: "VERIFIED", switching_burden: "VERIFIED", risk: "INFERRED", optionality: "VERIFIED" },
    rationale: {
      cost: "Zero incremental cost until the decision is revisited.",
      time: "This directly delays the outcome the lane needs; by definition it is the slowest path.",
      feasibility: "Trivially executable; there is no constraint to deferring.",
      switching_burden: "No execution burden at all.",
      risk: "Leaves the new lane without cold-chain visibility coverage in the interim, which is itself a compliance and product-quality exposure worth naming plainly.",
      optionality: "Keeps every other path fully open for later re-scoring.",
    },
  },
  {
    key: "run_rfi", name: "Run RFI", applicable: true,
    scores: { cost: 4.0, time: 3.0, feasibility: 4.5, switching_burden: 4.5, risk: 4.0, optionality: 4.5 },
    evidence: { cost: "VERIFIED", time: "INFERRED", feasibility: "INFERRED", switching_burden: "VERIFIED", risk: "INFERRED", optionality: "VERIFIED" },
    rationale: {
      cost: "Low direct cost; this is mainly internal time, confirmed against comparable prior RFI efforts.",
      time: "Adds an estimated 4 to 6 weeks ahead of any buy, but shortens the eventual RFP cycle by pre-narrowing the field.",
      feasibility: "Straightforward to run given the credible vendor pool already identified in the market scan.",
      switching_burden: "No commitment; this is pure information-gathering with nothing to unwind.",
      risk: "Low risk; the main exposure is the delay itself, not a new obligation.",
      optionality: "Preserves every downstream path (buy, direct-negotiate, pilot) while sharpening the market picture first.",
    },
    blockingItem: "Whether this lane requires a GDP-specific supplier qualification review before any RFI is issued has not been confirmed with process-navigator; that is a BLOCKING approval-chain question per S5, independent of this option's own Medium evidence confidence.",
  },
  {
    key: "run_rfp", name: "Run RFP", applicable: true,
    scores: { cost: 3.5, time: 2.0, feasibility: 3.5, switching_burden: 3.0, risk: 3.5, optionality: 4.0 },
    evidence: { cost: "INFERRED", time: "INFERRED", feasibility: "INFERRED", switching_burden: "INFERRED", risk: "INFERRED", optionality: "INFERRED" },
    rationale: {
      cost: "Competitive tension typically improves price versus a direct negotiation, but the RFP process cost itself is non-trivial for a specialized category.",
      time: "The longest realistic path to award among the buy-side options.",
      feasibility: "Viable given the identified vendor pool, but requires building a cold-chain-specific requirements matrix from scratch.",
      switching_burden: "New integration work is required regardless of which finalist wins.",
      risk: "A competitive process reduces single-supplier dependency risk relative to direct-negotiate.",
      optionality: "A fresh, competitively tested contract preserves strong future flexibility.",
    },
  },
  {
    key: "direct_negotiate", name: "Direct-negotiate-with-validation", applicable: true,
    scores: { cost: 3.5, time: 4.0, feasibility: 4.0, switching_burden: 4.0, risk: 3.0, optionality: 2.5 },
    evidence: { cost: "ASSUMED", time: "INFERRED", feasibility: "VERIFIED", switching_burden: "INFERRED", risk: "ASSUMED", optionality: "INFERRED" },
    rationale: {
      cost: "The should-cost anchor has not yet been run; the incumbent's list pricing is a reasonable but unverified starting point for negotiation.",
      time: "Faster than a full RFP since only one supplier's terms are being negotiated.",
      feasibility: "The incumbent already confirmed technical fit for this lane, the same confirmation used for Expand incumbent.",
      switching_burden: "Builds on the existing TMS relationship, similar ease of execution to Expand incumbent.",
      risk: "There is no competitive benchmark to validate price fairness without the should-cost step.",
      optionality: "Also deepens single-supplier concentration, similar to Expand incumbent.",
    },
  },
  {
    key: "pilot_first", name: "Pilot-first", applicable: true,
    scores: { cost: 4.0, time: 3.5, feasibility: 4.0, switching_burden: 3.5, risk: 4.0, optionality: 4.5 },
    evidence: { cost: "VERIFIED", time: "INFERRED", feasibility: "INFERRED", switching_burden: "INFERRED", risk: "VERIFIED", optionality: "VERIFIED" },
    rationale: {
      cost: "Bounded, small-scale spend versus a full commitment; the pilot scope is capped by design.",
      time: "Adds a pilot window before full-scale go-live, but de-risks the larger commitment.",
      feasibility: "Any of the credible vendors identified can support a bounded, single-lane pilot.",
      switching_burden: "Limited integration scope during the pilot; full-scale integration is deferred to the follow-on decision.",
      risk: "Bounds the technical and compliance exposure to a single lane before a wider commitment, by design.",
      optionality: "Explicitly designed to keep the full-scale path open pending pilot results.",
    },
  },
];

const RESEARCH_LOG = [
  { row: "EU cold-chain track-and-trace vendor pool (credible candidate count)", source: "Quick web market scan, 3 searches", date: "July 18, 2026", confidence: "MEDIUM" },
  { row: "Incumbent TMS add-on module pricing and SOW", source: "Nexlane Logistics rate card and implementation SOW, contract file", date: "July 12, 2026", confidence: "HIGH" },
  { row: "Should-cost anchor for direct-negotiate pricing validation", source: "Not yet run; should-cost-builder follow-up planned", date: "n/a", confidence: "LOW" },
];

// Native next-step skill per option, shown in Recommendation & Rationale and Next Steps.
const NEXT_STEP_SKILL = {
  buy_externally: "supplier-landscape (build the shortlist)",
  build_internally: "pro-forma-builder (internal build cost model)",
  expand_incumbent: "commercial-negotiation-prep (or lilly-contract-review if a document is in hand)",
  reuse_existing: "market-rate-benchmarking, RATIONALIZATION mode",
  consolidate_suppliers: "market-rate-benchmarking, RATIONALIZATION mode, then commercial-negotiation-prep",
  defer: "none immediately; re-run this skill at the stated trigger",
  run_rfi: "rfp-engine, RFI mode",
  run_rfp: "rfp-engine",
  direct_negotiate: "should-cost-builder and/or market-rate-benchmarking, then commercial-negotiation-prep",
  pilot_first: "pro-forma-builder for the pilot-scale business case; re-run this skill after the pilot",
};

// --- Derived data model (build once per profile; G5 "complete data object before rendering") --
function nonVerifiedCount(evidence) {
  var n = 0;
  DIMENSIONS.forEach(function (d) { if (evidence[d.key] !== "VERIFIED") n++; });
  return n;
}
function confidenceLabel(count) { return count <= 1 ? "HIGH" : count <= 3 ? "MEDIUM" : "LOW"; }

// Ranks every APPLICABLE option under a given weight profile. Overall Score and each dimension's
// weighted contribution are both computed here, once, from the same weightedScoreJS() call, so
// the stacked-bar contributions on Scored Comparison always sum to the Overall Score shown
// everywhere else (numbers-reconcile assertion).
function computeRanked(profileKey) {
  var weights = WEIGHT_PROFILES[profileKey];
  var applicable = OPTIONS.filter(function (o) { return o.applicable; });
  var withScores = applicable.map(function (o) {
    var overall = weightedScoreJS(o.scores, weights);
    var contributions = {};
    DIMENSIONS.forEach(function (d) { contributions[d.key] = o.scores[d.key] * weights[d.key]; });
    var confCount = nonVerifiedCount(o.evidence);
    return Object.assign({}, o, {
      overallScore: overall,
      contributions: contributions,
      confidenceCount: confCount,
      confidence: confidenceLabel(confCount),
    });
  });
  withScores.sort(function (a, b) { return b.overallScore - a.overallScore; });
  return withScores;
}
const NOT_APPLICABLE_OPTIONS = OPTIONS.filter(function (o) { return !o.applicable; });

// Flattened evidence rows for the Evidence & Assumptions tab: one row per scored dimension of
// every applicable option (8 options x 6 dimensions = 48 rows here).
const EVIDENCE_ROWS = [];
OPTIONS.filter(function (o) { return o.applicable; }).forEach(function (o) {
  DIMENSIONS.forEach(function (d) {
    EVIDENCE_ROWS.push({ option: o.name, dimension: d.label, score: o.scores[d.key], status: o.evidence[d.key], rationale: o.rationale[d.key] });
  });
});

// ---------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------------------------
export default function ProcurementOptionsDashboard() {
  var _t = useState(TABS[0]); var tab = _t[0]; var setTab = _t[1];
  var _p = useState("Default"); var profileKey = _p[0]; var setProfileKey = _p[1];

  var ranked = useMemo(function () { return computeRanked(profileKey); }, [profileKey]);
  var weights = WEIGHT_PROFILES[profileKey];
  var top = ranked[0];
  var runnerUp = ranked[1];
  var closeMargin = top && runnerUp && Math.abs(top.overallScore - runnerUp.overallScore) <= 0.2;
  var reconcileTriggered = !!(top && (top.confidence === "LOW" || top.blockingItem));

  // Derived, not hardcoded: which of the three named profiles change the leader, computed by
  // actually re-ranking under each one (same computeRanked() used for the live switcher).
  var profileLeaders = useMemo(function () {
    return Object.keys(WEIGHT_PROFILES).map(function (p) { return { profile: p, leader: computeRanked(p)[0] }; });
  }, []);
  var divergentProfiles = profileLeaders.filter(function (pl) { return pl.leader.key !== profileLeaders[0].leader.key; });
  var whatWouldChangeText = divergentProfiles.length === 0
    ? (top ? top.name : "") + " leads under all three named weight profiles (Default, Time-Critical, Risk-Sensitive); no reasonable re-weighting in this run flips the recommendation."
    : "Switching to the " + divergentProfiles.map(function (pl) { return pl.profile; }).join(" or ") + " weight profile flips the recommendation to " + divergentProfiles[0].leader.name + ", the dimension-weight shift most likely to change this conclusion.";

  var RANK_CHART_DATA = ranked.map(function (o) { return { name: o.name, score: o.overallScore }; });
  var STACK_CHART_DATA = ranked.map(function (o) {
    var row = { name: o.name };
    DIMENSIONS.forEach(function (d) { row[d.label] = o.contributions[d.key]; });
    return row;
  });
  var topDimensionForLeader = top ? DIMENSIONS.slice().sort(function (a, b) { return top.contributions[b.key] - top.contributions[a.key]; })[0] : null;

  // Options Matrix rows: FIXED option order (the ten-option framework order), never re-sorted by
  // rank, so the skeleton is identical run to run. The table's own column-sort control lets a
  // user re-order by any column, including Overall Score, without changing the underlying order.
  var MATRIX_ROWS = OPTIONS.map(function (o) {
    var scored = o.applicable ? ranked.filter(function (r) { return r.key === o.key; })[0] : null;
    var dimCells = DIMENSIONS.map(function (d) {
      if (!o.applicable) return { d: "N/A", v: -1, c: MUT, a: "center" };
      var v = o.scores[d.key];
      return { d: fScore(v), v: v, c: scC(v), b: true, a: "center" };
    });
    var overallCell = o.applicable
      ? { d: fScore(scored.overallScore), v: scored.overallScore, c: scC(scored.overallScore), b: true, a: "center" }
      : { d: "N/A", v: -1, c: MUT, a: "center" };
    var confCell = o.applicable
      ? { d: <ConfBadge c={scored.confidence} />, v: scored.confidenceCount, a: "center" }
      : { d: <span style={{ color: MUT }}>{"-"}</span>, v: -1, a: "center" };
    var applCell = { d: <ApplPill applicable={o.applicable} />, v: o.applicable ? 1 : 0, a: "center" };
    var nameCell = { d: o.applicable ? o.name : (o.name + " (" + o.reason.split(";")[0] + ")"), v: o.name, b: true, c: o.applicable ? DK : MUT };
    return [nameCell].concat(dimCells, [overallCell, confCell, applCell]);
  });

  var EVIDENCE_TABLE_ROWS = EVIDENCE_ROWS.map(function (r) {
    return [
      { d: r.option, v: r.option, b: true },
      { d: r.dimension, v: r.dimension },
      { d: fScore(r.score), v: r.score, c: scC(r.score), b: true, a: "center" },
      { d: <ConfBadge c={r.status === "VERIFIED" ? "HIGH" : r.status === "INFERRED" ? "MEDIUM" : "LOW"} />, v: r.status, a: "center" },
      { d: r.rationale, v: r.rationale },
    ];
  });

  // Shared What-If control: live client-side weight-profile switcher (the reference
  // implementation's chosen variant of SKILL.md's "six sliders re-summing to 1.0, OR a profile
  // switcher"). Lifted state (profileKey) means Overview and Scored Comparison stay in sync.
  function ProfileSwitcher() {
    return <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: MUT, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Weight profile:</span>
      {Object.keys(WEIGHT_PROFILES).map(function (p) {
        var active = p === profileKey;
        return <button key={p} onClick={function () { setProfileKey(p); }} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid " + (active ? BLU : BD), background: active ? BLU : "#fff", color: active ? "#fff" : DK }}>{p}</button>;
      })}
      <span style={{ fontSize: 10, color: MUT, marginLeft: 4 }}>
        {DIMENSIONS.map(function (d) { return d.label + " " + fPct(weights[d.key] * 100); }).join(" | ")}
      </span>
    </div>;
  }

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Procurement Options Analysis | Path Comparison</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.requestName}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{META.preparedDate} | {META.category}<br />Prepared for {META.preparedFor}</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto" }}>
        {TABS.map(function (t) {
          var active = t === tab;
          return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}{NEEDS_INPUT[t] ? <span style={{ color: AMB, marginLeft: 4 }}>*</span> : null}</button>;
        })}
      </div>

      <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {tab === "Overview & Recommendation" && <div>
          <div style={{ marginBottom: 12 }}><ProfileSwitcher /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Metric label="Recommended path" value={top.name} sub={"Overall Score " + fScore(top.overallScore) + " of 5.0"} good />
            <Metric label="Overall score" value={fScore(top.overallScore)} sub={"@ " + profileKey + " weighting"} good={top.overallScore >= 4.0} warn={top.overallScore < 3.0} />
            <Metric label="Evidence confidence" value={top.confidence} sub={top.confidenceCount + " of 6 dimensions not fully verified"} warn={top.confidence === "LOW"} accent={top.confidence === "MEDIUM"} good={top.confidence === "HIGH"} />
            <Metric label="Runner-up" value={runnerUp.name} sub={"Overall Score " + fScore(runnerUp.overallScore) + (closeMargin ? " (within 0.2 of the leader)" : "")} accent={closeMargin} />
          </div>
          <div style={{ background: CARD, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: DK }}>
            <b>What would change this conclusion:</b> {whatWouldChangeText}
          </div>

          {reconcileTriggered && <StateBanner kind="RECONCILE" msg={top.blockingItem
            ? (top.name + " has the leading Overall Score (" + fScore(top.overallScore) + ") but carries an unresolved BLOCKING item: " + top.blockingItem)
            : (top.name + " has the leading Overall Score (" + fScore(top.overallScore) + ") but Evidence Confidence is LOW (" + top.confidenceCount + " of 6 dimensions not verified). The score cannot be treated as final until the open items close; see Recommendation & Rationale for the reconciliation detail and Evidence & Assumptions for what to close.")} />}

          <Card title="Options ranked by Overall Score" note={profileKey + " weighting, applicable paths only"}>
            <ResponsiveContainer width="100%" height={Math.max(220, ranked.length * 34)}>
              <BarChart data={RANK_CHART_DATA} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={210} tick={{ fontSize: 10 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="score">
                  <LabelList dataKey="score" position="right" formatter={fScore} style={{ fontSize: 10, fill: DK }} />
                  {RANK_CHART_DATA.map(function (r, i) { return <Cell key={i} fill={scC(r.score)} />; })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 10, color: MUT, marginTop: 4 }}>NOT_APPLICABLE paths ({NOT_APPLICABLE_OPTIONS.map(function (o) { return o.name; }).join(", ")}) are screened out before scoring; see Options Matrix for their reasons.</div>
          </Card>
        </div>}

        {tab === "Options Matrix" && <div>
          <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 12px" }}>All ten fixed paths appear below in the framework's fixed order, scored under the {profileKey} weight profile. {NOT_APPLICABLE_OPTIONS.length} of 10 are NOT_APPLICABLE to this request (shown dimmed, with a reason) and are never dropped from the table. Column headers are sortable; the Overall Score column matches the ranking on Overview.</p>
          <Card title="All ten options" note={ranked.length + " applicable of 10 total"}>
            <STable
              columns={[{ l: "Option" }].concat(DIMENSIONS.map(function (d) { return { l: d.label, a: "center" }; }), [{ l: "Overall Score", a: "center" }, { l: "Confidence", a: "center" }, { l: "Applicability", a: "center" }])}
              rows={MATRIX_ROWS}
            />
          </Card>
          <Card title={"Why the " + NOT_APPLICABLE_OPTIONS.length + " NOT_APPLICABLE path" + (NOT_APPLICABLE_OPTIONS.length === 1 ? " was" : "s were") + " screened out"}>
            {NOT_APPLICABLE_OPTIONS.map(function (o, i) {
              return <div key={o.key} style={{ padding: "8px 0", borderBottom: i < NOT_APPLICABLE_OPTIONS.length - 1 ? "1px solid " + BD : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{o.name}</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2, lineHeight: 1.5 }}>{o.reason}</div>
              </div>;
            })}
          </Card>
        </div>}

        {tab === "Scored Comparison" && <div>
          <div style={{ marginBottom: 12 }}><ProfileSwitcher /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
            <Card title="Weighted contribution by dimension" note={profileKey + " weighting; segments sum to each bar's Overall Score"}>
              <ResponsiveContainer width="100%" height={Math.max(240, ranked.length * 30)}>
                <BarChart data={STACK_CHART_DATA} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={210} tick={{ fontSize: 10 }} />
                  <Tooltip content={<Tip />} />
                  {DIMENSIONS.map(function (d, i) { return <Bar key={d.key} dataKey={d.label} stackId="s" fill={PAL[i]} />; })}
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
                {DIMENSIONS.map(function (d, i) {
                  return <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: PAL[i], display: "inline-block" }} />{d.label}
                  </div>;
                })}
              </div>
            </Card>
            <Card title="Reading the Comparison">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{topDimensionForLeader ? (topDimensionForLeader.label + " is the single largest contributor to " + top.name + "'s Overall Score under " + profileKey + " weighting (" + fScore(top.contributions[topDimensionForLeader.key]) + " of " + fScore(top.overallScore) + "), which is why it leads even though it is not the top scorer on every dimension.") : ""}</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Switching the weight profile above recomputes every bar segment live, using the same `weightedScoreJS()` mirror of the workbook's kernel-computed `weighted_score()`; the bars, the Overview ranking, and the Options Matrix Overall Score column always move together and never disagree.</p>
            </Card>
          </div>
        </div>}

        {tab === "Recommendation & Rationale" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title={"Why " + top.name + " leads"} note={profileKey + " weighting"}>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{top.name} scores {fScore(top.overallScore)} of 5.0, {(top.overallScore - runnerUp.overallScore).toFixed(2)} points ahead of the runner-up, {runnerUp.name} ({fScore(runnerUp.overallScore)}){closeMargin ? ", a margin inside the 0.2 band this skill treats as close enough to weigh the trade-off explicitly rather than treat the ranking as decisive on its own" : ""}. {top.rationale[topDimensionForLeader ? topDimensionForLeader.key : "cost"]}</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}><b>Key trade-off versus {runnerUp.name}:</b> {runnerUp.name} scores higher on {DIMENSIONS.slice().sort(function (a, b) { return (runnerUp.scores[b.key] - top.scores[b.key]) - (runnerUp.scores[a.key] - top.scores[a.key]); })[0].label.toLowerCase()} ({fScore(runnerUp.scores[DIMENSIONS.slice().sort(function (a, b) { return (runnerUp.scores[b.key] - top.scores[b.key]) - (runnerUp.scores[a.key] - top.scores[a.key]); })[0].key])} vs {fScore(top.scores[DIMENSIONS.slice().sort(function (a, b) { return (runnerUp.scores[b.key] - top.scores[b.key]) - (runnerUp.scores[a.key] - top.scores[a.key]); })[0].key])}), which is the single dimension most worth re-checking if that trade-off matters more to this decision than the current weighting assumes.</p>
              {reconcileTriggered && <StateBanner kind="RECONCILE" msg={top.blockingItem
                ? ("Gate-vs-score reconciliation: " + top.blockingItem + " Route this to the SME per sme-matrix.md before the recommendation is treated as final; the compensatory Overall Score does not resolve a BLOCKING approval-chain question on its own.")
                : (top.name + "'s Evidence Confidence is LOW (" + top.confidenceCount + " of 6 dimensions not verified). Close the open items in Evidence & Assumptions before committing to this path; the ranking is advisory until they do.")} />}
            </Card>
            <Card title="Next steps">
              <ol style={{ fontSize: 12, color: DK, lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
                <li>Close the evidence gaps listed on Evidence & Assumptions for {top.name}, prioritizing any dimension marked ASSUMED.</li>
                {top.blockingItem && <li>Resolve the BLOCKING item above before proceeding: {top.blockingItem.split(";")[0]}.</li>}
                <li>Hand off to <b>{NEXT_STEP_SKILL[top.key]}</b>, the native next step for {top.name}.</li>
                <li>If {runnerUp.name} is preferred instead once the trade-off above is weighed, its native next step is <b>{NEXT_STEP_SKILL[runnerUp.key]}</b>.</li>
              </ol>
            </Card>
          </div>
        </div>}

        {tab === "Evidence & Assumptions" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title="Per-dimension evidence log" note={EVIDENCE_ROWS.length + " scored cells across " + ranked.length + " applicable options"}>
              <STable
                columns={[{ l: "Option" }, { l: "Dimension" }, { l: "Score", a: "center" }, { l: "Status", a: "center" }, { l: "Rationale" }]}
                rows={EVIDENCE_TABLE_ROWS}
              />
            </Card>
            <Card title="Research log">
              {RESEARCH_LOG.map(function (r, i) {
                return <div key={i} style={{ padding: "8px 0", borderBottom: i < RESEARCH_LOG.length - 1 ? "1px solid " + BD : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{r.row}</div>
                  <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{r.source}, {r.date}</div>
                  <div style={{ marginTop: 4 }}><ConfBadge c={r.confidence} /></div>
                </div>;
              })}
              <div style={{ marginTop: 10 }}>
                <StateBanner kind="RESEARCH_PENDING" msg="Should-cost anchor for direct-negotiate pricing validation: not yet run. should-cost-builder follow-up is planned before Direct-negotiate-with-validation's Cost score (currently ASSUMED) can be upgraded to VERIFIED; not assumed favorable in the meantime." />
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Active weight profile</div>
                <div style={{ fontSize: 12, color: DK, lineHeight: 1.7 }}>
                  {DIMENSIONS.map(function (d) { return d.label + ": " + fPct(weights[d.key] * 100); }).join(", ")}
                  {" "}(sums to 100%, kernel-enforced via weighted_score()'s WeightSumError refusal).
                </div>
              </div>
            </Card>
          </div>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>A decision snapshot built on stated evidence and labeled assumptions for one request, not an audited business case or an ongoing demand-management system. Procurement owns the final call.</div>
        <div>Eli Lilly and Company - Confidential | Procurement Options Analysis | 2026</div>
      </div>
    </div>
  );
}

