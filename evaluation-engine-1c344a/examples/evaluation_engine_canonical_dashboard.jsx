import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

// ---------------------------------------------------------------------------
// Evaluation Engine - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure per SKILL.md "Canonical Dashboard": 6 tabs, identical on
// every run for every RFx (Overview, Scoring Detail, Requirements Coverage,
// Risk, Sensitivity, Award Scenario). Only the data changes per run. House
// style: SUITE STANDARD (Arial body, Georgia titles, dark #212121 header with
// red rule, Lilly-approved palette, no green anywhere). Components copied
// verbatim from lilly-brand-assets-1c344a, references/dashboard-components.md.
// Data below is ILLUSTRATIVE (an ITSM Platform Replacement RFx, 4 finalists
// carried into evaluation-engine from supplier-landscape / rfp-response-
// analysis). Clone the structure, swap the data.
//
// This file is normally rendered by the suite-standard `visualize:show_widget`
// primitive against `supplier_evaluation_ui.json` (see SKILL.md, "Render
// primitive"); this JSX is the canonical worked reference an implementer
// clones when building that JSON payload and its renderer, the same role
// pro_forma_canonical_dashboard.jsx and contract_review_canonical_dashboard.jsx
// play for their own skills.
//
// NUMBERS RECONCILE: every Grand Total, coverage %, rank, delta, gate flag,
// sensitivity row, and Award Scenario blend below is DERIVED at build/render
// time from the CRITERIA / COVERAGE_PCT_BY_CAT / COMMERCIAL source data via
// the kernel-mirrored weightedScoreJS(), never hand-typed. This is the
// dashboard's own "numbers-reconcile assertion" (SKILL.md, Canonical
// Dashboard) made structurally true rather than merely asserted.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green
// anywhere; positive signal uses Bold Blue (BLU) / Neutral Sky (OK), never a
// "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Chart palette: exactly the 6 on-brand hexes from dashboard-components.md.
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

const TABS = ["Overview", "Scoring Detail", "Requirements Coverage", "Risk", "Sensitivity", "Award Scenario"];
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

// --- Score-to-color / percent-to-color helpers (verbatim from dashboard-components.md) -----
// Scale is 0.0-5.0 per scoring-scales.md: 4.0+ Fully/Largely Meets, 3.0-3.9 Partially Meets,
// below 3.0 Minimally/Does Not Meet.
function scC(v) { return v >= 4.0 ? BLU : v >= 3.0 ? AMB : R; }
function scBg(v) { return v >= 4.0 ? OK : v >= 3.0 ? WARM : RISK; }
function pcC(p) { return p >= 90 ? BLU : p >= 70 ? AMB : R; }
function pcBg(p) { return p >= 90 ? OK : p >= 70 ? WARM : RISK; }

// Severity map (Low/Medium/High), reused verbatim for the Risk tab; positive = BLU, never green.
const SEV = { High: R, Medium: AMB, Low: BLU };
const SEVBG = { High: RISK, Medium: WARM, Low: OK };
function SevPill({ s }) {
  return <span style={{ color: SEV[s], background: SEVBG[s], border: "1px solid " + SEV[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}

// --- numeric_kernel.py mirror (weighted_score) ------------------------------------------------
// Source of truth: evaluation-engine-1c344a/numeric_kernel.py, weighted_score(). Signature and
// refusal behavior copied verbatim: refuses (throws) if weights do not sum to 1.0 within
// tolerance, exactly the WeightSumError guard the kernel raises. Used for BOTH the criterion-
// weighted Grand Total (Scoring Detail / Overview) and the Award Scenario allocation blend
// (Award Scenario tab) -- the SAME official kernel function, applied to a different weight set,
// which is the concrete mechanism behind "the Award Scenario Modeler consumes the official
// evaluation scores and does not re-score."
function weightedScoreJS(scores, weights, tolerance) {
  tolerance = tolerance == null ? 0.001 : tolerance;
  var sKeys = Object.keys(scores).slice().sort();
  var wKeys = Object.keys(weights).slice().sort();
  if (sKeys.join(",") !== wKeys.join(",")) {
    throw new Error("weightedScoreJS: scores and weights must share the same keys.");
  }
  var totalWeight = wKeys.reduce(function (s, k) { return s + weights[k]; }, 0);
  if (Math.abs(totalWeight - 1.0) > tolerance) {
    throw new Error("weightedScoreJS: weights sum to " + totalWeight.toFixed(4) + ", not 1.0 (tolerance " + tolerance + "). Mirrors numeric_kernel.py weighted_score() WeightSumError; refusing to score against un-footed weights.");
  }
  return sKeys.reduce(function (s, k) { return s + scores[k] * weights[k]; }, 0);
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
    {payload.map(function (p, i) { return <div key={i}>{p.name ? p.name + ": " : ""}<strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong></div>; })}
  </div>;
}

// --- New pill variants for this skill (same color-formula/sizing as SevPill/PrioPill; ------
// documented as analogues in SKILL.md, not a new one-off style) ------------------------------
const TIER_COLOR = { "Preferred": BLU, "Competitive": AMB, "Below Threshold": R };
const TIER_BG = { "Preferred": OK, "Competitive": WARM, "Below Threshold": RISK };
function TierPill({ tier }) {
  return <span style={{ color: TIER_COLOR[tier], background: TIER_BG[tier], border: "1px solid " + TIER_COLOR[tier] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{tier.toUpperCase()}</span>;
}
function GatePill({ fail }) {
  return fail
    ? <span style={{ color: R, background: RISK, border: "1px solid " + R + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>GATE FAIL</span>
    : <span style={{ color: BLU, background: OK, border: "1px solid " + BLU + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>CLEAR</span>;
}
const COV_COLOR = { "Fully Meets": BLU, "Partially Meets": AMB, "Does Not Meet": R, "Not Addressed": MUT };
const COV_BG = { "Fully Meets": OK, "Partially Meets": WARM, "Does Not Meet": RISK, "Not Addressed": CARD };
function CoveragePill({ label }) {
  return <span style={{ color: COV_COLOR[label], background: COV_BG[label], border: "1px solid " + COV_COLOR[label] + "40", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{label}</span>;
}
// Milestone glyph for the Participation & Scoring Roll-up (check / half / flag / not-applicable).
// Literal Unicode characters only (no escape sequences, no HTML entities).
const GLYPH = { complete: ["✓", BLU, "Complete"], partial: ["◑", AMB, "In progress"], flagged: ["⚑", R, "Needs attention"], na: ["-", MUT, "Not applicable"] };
function MilestoneGlyph({ state }) {
  var g = GLYPH[state] || GLYPH.na;
  return <span title={g[2]} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 5, fontSize: 12, fontWeight: 700, color: g[1], background: state === "na" ? "transparent" : g[1] + "1A", border: state === "na" ? "1px dashed " + BD : "1px solid " + g[1] + "55" }}>{g[0]}</span>;
}
// Inline coverage bar (compact, used on the Participation & Scoring Roll-up).
function MiniBar({ pct, w }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ width: w || 60, height: 7, borderRadius: 4, background: CARD, overflow: "hidden" }}>
      <div style={{ width: Math.max(0, Math.min(100, pct)) + "%", height: "100%", background: pcC(pct), borderRadius: 4 }} />
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: pcC(pct), minWidth: 38 }}>{fP(pct)}</span>
  </div>;
}

// --- ILLUSTRATIVE DATA (replace entirely per run) --------------------------------------------
const META = {
  rfxName: "ITSM Platform Replacement",
  category: "Enterprise IT Service Management (ITSM) Platform",
  requirementsCount: 210,
  categoriesCount: 6,
  suppliersEvaluated: 4,
  preparedDate: "July 21, 2026",
  aiScoringMode: "Enabled - Trusted (rfp-response-analysis handoff accepted)",
  stakeholderEvaluators: 5,
  reportMode: "Full",
};

const SUPPLIERS = [
  { id: "VSC", name: "Vantage Service Cloud" },
  { id: "NPS", name: "NorthPeak Systems" },
  { id: "BWT", name: "Bluewater Technologies" },
  { id: "ADP", name: "Atlas Digital Partners" },
];
function supplierName(id) { return (SUPPLIERS.filter(function (s) { return s.id === id; })[0] || {}).name || id; }

// Headline AI / Team / Landscape scores: context columns on the Scoring Grid, distinct from the
// criterion-weighted Grand Total below (that total is the official kernel-computed figure).
const HEADLINE = {
  VSC: { ai: 4.35, team: 4.20, landscape: 4.40 },
  NPS: { ai: 3.95, team: 4.15, landscape: 3.90 },
  BWT: { ai: 3.70, team: 3.55, landscape: 3.60 },
  ADP: { ai: 3.05, team: 2.85, landscape: 2.70 },
};

// Participation milestones (RFx tracker, from rfp-response-analysis handoff / user upload).
const MILESTONES = [
  { key: "agreed", label: "Agreed" },
  { key: "cda", label: "CDA" },
  { key: "msa", label: "MSA w/ Lilly" },
  { key: "response", label: "Response" },
  { key: "demoSet", label: "Demo Set" },
  { key: "demoDone", label: "Demo Done" },
];
const PARTICIPATION = {
  VSC: { agreed: "complete", cda: "complete", msa: "complete", response: "complete", demoSet: "complete", demoDone: "complete" },
  NPS: { agreed: "complete", cda: "complete", msa: "na", response: "complete", demoSet: "complete", demoDone: "complete" },
  BWT: { agreed: "complete", cda: "complete", msa: "na", response: "complete", demoSet: "complete", demoDone: "partial" },
  ADP: { agreed: "complete", cda: "partial", msa: "na", response: "complete", demoSet: "flagged", demoDone: "na" },
};

// Category weights (fractions, sum to 1.0) and requirement counts (sum to META.requirementsCount).
const CATEGORIES = [
  { key: "FF", name: "Functional Fit", weight: 0.30, count: 63 },
  { key: "TI", name: "Technical & Integration", weight: 0.20, count: 42 },
  { key: "SC", name: "Security & Compliance", weight: 0.15, count: 32 },
  { key: "CM", name: "Commercial", weight: 0.20, count: 42 },
  { key: "IS", name: "Implementation & Support", weight: 0.10, count: 21 },
  { key: "SR", name: "Supplier Risk", weight: 0.05, count: 10 },
];
function baseCategoryWeights() {
  var out = {};
  CATEGORIES.forEach(function (c) { out[c.key] = c.weight; });
  return out;
}

// Criterion-level scoring (12 representative criteria, 2 per category). Weight_In_Category_Frac
// sums to 1.0 within each category; Effective_Weight_Frac = wInCat * categoryWeight sums to 1.0
// across all 12. Scores are Final_Score (0.0-5.0, post AI+stakeholder blend per Phase 6).
const CRITERIA = [
  { id: "F1", cat: "FF", label: "Core ITSM processes (incident/problem/change) out of the box", priority: "Must Have", wInCat: 0.55, evidenceLoc: "Technical Response Sec 2.1; Demo Session",
    scores: { VSC: 4.8, NPS: 4.3, BWT: 4.0, ADP: 3.2 },
    rationale: { VSC: "All three ITIL processes fully configured out of box, confirmed live in demo.", NPS: "Incident and change fully native; problem management requires an add-on module.", BWT: "Core processes present but the change workflow needs custom scripting for approvals.", ADP: "Incident management solid; problem and change are third-party bolt-ons." } },
  { id: "F2", cat: "FF", label: "Self-service portal and knowledge management", priority: "Should Have", wInCat: 0.45, evidenceLoc: "Technical Response Sec 2.4",
    scores: { VSC: 4.3, NPS: 4.0, BWT: 3.6, ADP: 2.8 },
    rationale: { VSC: "Modern self-service portal with AI-suggested articles; strong knowledge-base tooling.", NPS: "Solid portal; knowledge management is functional but less mature than VSC's.", BWT: "Portal present, limited customization of the request catalog.", ADP: "Basic portal; knowledge base is a flat FAQ list, no suggestion engine." } },
  { id: "T1", cat: "TI", label: "REST API coverage and webhook support", priority: "Must Have", wInCat: 0.6, evidenceLoc: "Technical Response Sec 4.1; API Docs Appendix",
    scores: { VSC: 4.2, NPS: 4.6, BWT: 3.8, ADP: 2.6 },
    rationale: { VSC: "Comprehensive REST API; webhooks cover most event types.", NPS: "Extensive REST API and webhook coverage, strongest of the four responses.", BWT: "REST API present; webhook coverage has gaps for asset-management events.", ADP: "Limited API surface; several endpoints marked roadmap-only." } },
  { id: "T2", cat: "TI", label: "Native integration connectors (AD, Workday, monitoring tools)", priority: "Should Have", wInCat: 0.4, evidenceLoc: "Technical Response Sec 4.3",
    scores: { VSC: 3.8, NPS: 4.5, BWT: 3.5, ADP: 2.4 },
    rationale: { VSC: "Native AD and monitoring-tool connectors; Workday via partner integration.", NPS: "Native connectors for all three named systems, no third-party dependency.", BWT: "AD native; Workday and monitoring both require custom middleware.", ADP: "Only the AD connector is native; the others are not addressed." } },
  { id: "S1", cat: "SC", label: "SOC 2 Type II and ISO 27001 certification", priority: "Must Have", wInCat: 0.5, evidenceLoc: "Security Questionnaire Sec 1; Certificates Appendix",
    scores: { VSC: 4.5, NPS: 4.4, BWT: 4.0, ADP: 3.4 },
    rationale: { VSC: "Both certifications current, certificates provided.", NPS: "SOC 2 Type II current; ISO 27001 in progress, expected this quarter.", BWT: "SOC 2 Type II current; ISO 27001 not pursued.", ADP: "SOC 2 Type I only; Type II audit not yet scheduled." } },
  { id: "S2", cat: "SC", label: "EU data residency, dedicated region hosting commitment", priority: "Must Have", wInCat: 0.5, evidenceLoc: "Security Questionnaire Sec 3; Data Residency Addendum",
    scores: { VSC: 4.6, NPS: 4.3, BWT: 0.0, ADP: 3.0 },
    rationale: { VSC: "Dedicated EU region committed in writing with named data center.", NPS: "EU region hosting available and committed for this engagement.", BWT: "No EU-dedicated region offered; data residency handled via encryption only. Does not meet the requirement.", ADP: "EU region available as a paid add-on, committed for this engagement at added cost." } },
  { id: "C1", cat: "CM", label: "Total 3-year cost competitiveness", priority: "Should Have", wInCat: 0.6, evidenceLoc: "Pricing Sheet; Commercial Response Sec 1",
    scores: { VSC: 3.6, NPS: 3.2, BWT: 4.5, ADP: 3.5 },
    rationale: { VSC: "Mid-range pricing, in line with the shortlist median.", NPS: "Highest 3-year TCV of the four responses.", BWT: "Lowest 3-year TCV of the four responses, notably below the field.", ADP: "Second-lowest TCV, but bundled implementation costs push the effective total closer to median." } },
  { id: "C2", cat: "CM", label: "Pricing model transparency, no hidden fees", priority: "Should Have", wInCat: 0.4, evidenceLoc: "Pricing Sheet Notes; Clarification Response #4",
    scores: { VSC: 3.9, NPS: 3.5, BWT: 4.3, ADP: 3.2 },
    rationale: { VSC: "Clear per-agent pricing; overage terms spelled out.", NPS: "Pricing model has several optional-module line items that add complexity.", BWT: "Simple flat-rate model, few optional add-ons.", ADP: "Base price is clear; implementation and training are billed separately and not fully itemized." } },
  { id: "I1", cat: "IS", label: "Implementation timeline of 16 weeks or less, named team", priority: "Should Have", wInCat: 0.55, evidenceLoc: "Implementation Plan; Response Sec 5.1",
    scores: { VSC: 4.4, NPS: 3.9, BWT: 3.7, ADP: 2.5 },
    rationale: { VSC: "14-week plan with a named implementation lead and two named engineers.", NPS: "18-week plan, slightly over the target window; team named.", BWT: "15-week plan; team composition to be confirmed post-award.", ADP: "20-week plan, longest of the four, reflecting a smaller delivery bench." } },
  { id: "I2", cat: "IS", label: "24x7 Sev-1 support with 30-minute response SLA", priority: "Must Have", wInCat: 0.45, evidenceLoc: "Support SLA Exhibit",
    scores: { VSC: 4.7, NPS: 4.2, BWT: 3.4, ADP: 2.2 },
    rationale: { VSC: "24x7 Sev-1 with 30-minute response, financially backed credits.", NPS: "24x7 Sev-1 with 45-minute response; close to, but does not meet, the 30-minute target.", BWT: "24x7 coverage confirmed; Sev-1 response time not explicitly committed in writing.", ADP: "Business-hours support is standard; 24x7 is available as a paid upgrade." } },
  { id: "R1", cat: "SR", label: "Financial stability (D&B rating / public filings)", priority: "Should Have", wInCat: 0.5, evidenceLoc: "Financial Disclosure; D&B Report",
    scores: { VSC: 4.5, NPS: 4.0, BWT: 3.5, ADP: 2.8 },
    rationale: { VSC: "Strong D&B rating, profitable, low leverage.", NPS: "Solid financials, recently raised a growth round, moderate leverage.", BWT: "Adequate financials for current scale; thinner cash reserves than the top two.", ADP: "Smaller balance sheet; dependent on a small number of large customers." } },
  { id: "R2", cat: "SR", label: "Reference-checked implementation track record at comparable scale", priority: "Nice to Have", wInCat: 0.5, evidenceLoc: "Reference Calls (3 completed); Case Studies Appendix",
    scores: { VSC: 4.6, NPS: 3.8, BWT: 3.6, ADP: 2.6 },
    rationale: { VSC: "Three references at comparable scale, consistently positive.", NPS: "Two of three references at comparable scale; one reference project ran over schedule.", BWT: "References available but at smaller deployment scale than this engagement.", ADP: "Limited reference base at this scale; two references, both smaller deployments." } },
];

function effectiveWeight(criterion, catWeights) {
  return criterion.wInCat * catWeights[criterion.cat];
}
function grandTotalFor(supplierId, catWeights) {
  var scores = {}; var weights = {};
  CRITERIA.forEach(function (c) { scores[c.id] = c.scores[supplierId]; weights[c.id] = effectiveWeight(c, catWeights); });
  return weightedScoreJS(scores, weights);
}
const BASE_CAT_WEIGHTS = baseCategoryWeights();
const GRAND = {};
SUPPLIERS.forEach(function (s) { GRAND[s.id] = grandTotalFor(s.id, BASE_CAT_WEIGHTS); });

// Must Have Zero Flag: any supplier scoring 0.0 on a Must Have criterion (Recommendation Logic,
// gate-vs-compensatory-scoring reconciliation).
const GATE_FAIL = {};
const GATE_DETAIL = {};
SUPPLIERS.forEach(function (s) {
  var hit = CRITERIA.filter(function (c) { return c.priority === "Must Have" && c.scores[s.id] === 0; });
  GATE_FAIL[s.id] = hit.length > 0;
  GATE_DETAIL[s.id] = hit;
});

function tierFor(grand) { return grand >= 4.0 ? "Preferred" : grand >= 3.0 ? "Competitive" : "Below Threshold"; }

// Requirements coverage, by category, as FM/PM/DNM/NA percentages (sum to 100 per category per
// supplier). Coverage % (used on Overview) is the category-weighted blend of (FM + 0.5*PM).
const COVERAGE_PCT_BY_CAT = {
  VSC: { FF: { fm: 92, pm: 6, dnm: 2, na: 0 }, TI: { fm: 78, pm: 17, dnm: 5, na: 0 }, SC: { fm: 93, pm: 7, dnm: 0, na: 0 }, CM: { fm: 85, pm: 12, dnm: 3, na: 0 }, IS: { fm: 90, pm: 8, dnm: 2, na: 0 }, SR: { fm: 95, pm: 5, dnm: 0, na: 0 } },
  NPS: { FF: { fm: 85, pm: 10, dnm: 5, na: 0 }, TI: { fm: 90, pm: 8, dnm: 2, na: 0 }, SC: { fm: 88, pm: 9, dnm: 3, na: 0 }, CM: { fm: 75, pm: 15, dnm: 10, na: 0 }, IS: { fm: 82, pm: 12, dnm: 6, na: 0 }, SR: { fm: 86, pm: 10, dnm: 4, na: 0 } },
  BWT: { FF: { fm: 82, pm: 12, dnm: 6, na: 0 }, TI: { fm: 78, pm: 14, dnm: 8, na: 0 }, SC: { fm: 55, pm: 10, dnm: 35, na: 0 }, CM: { fm: 90, pm: 8, dnm: 2, na: 0 }, IS: { fm: 80, pm: 12, dnm: 8, na: 0 }, SR: { fm: 78, pm: 14, dnm: 8, na: 0 } },
  ADP: { FF: { fm: 70, pm: 15, dnm: 15, na: 0 }, TI: { fm: 62, pm: 18, dnm: 20, na: 0 }, SC: { fm: 72, pm: 13, dnm: 15, na: 0 }, CM: { fm: 76, pm: 14, dnm: 10, na: 0 }, IS: { fm: 60, pm: 20, dnm: 20, na: 0 }, SR: { fm: 68, pm: 17, dnm: 15, na: 0 } },
};
function coveragePctFor(supplierId) {
  var byCat = COVERAGE_PCT_BY_CAT[supplierId];
  return CATEGORIES.reduce(function (sum, c) {
    var cell = byCat[c.key];
    return sum + c.weight * (cell.fm + 0.5 * cell.pm);
  }, 0);
}
const COVERAGE_PCT = {};
SUPPLIERS.forEach(function (s) { COVERAGE_PCT[s.id] = coveragePctFor(s.id); });

// Ranked list (Overview): sort by Grand Total desc, compute rank and delta-to-#1.
const RANKED = SUPPLIERS.slice()
  .map(function (s) { return { id: s.id, name: s.name, grand: GRAND[s.id], coverage: COVERAGE_PCT[s.id], tier: tierFor(GRAND[s.id]), gateFail: GATE_FAIL[s.id] }; })
  .sort(function (a, b) { return b.grand - a.grand; });
RANKED.forEach(function (r, i) { r.rank = i + 1; r.delta = r.grand - RANKED[0].grand; });
const RANK1_ID = RANKED[0].id;

// Risk heatmap (severity Low/Medium/High per category per supplier).
const RISK_CATEGORIES = ["Data Privacy", "Financial Stability", "Technical Fit", "Contract Complexity", "Cyber/Security", "Operational", "Geopolitical", "ESG"];
const RISK_MATRIX = {
  VSC: { "Data Privacy": "Low", "Financial Stability": "Low", "Technical Fit": "Low", "Contract Complexity": "Medium", "Cyber/Security": "Low", "Operational": "Low", "Geopolitical": "Low", "ESG": "Low" },
  NPS: { "Data Privacy": "Low", "Financial Stability": "Medium", "Technical Fit": "Low", "Contract Complexity": "Medium", "Cyber/Security": "Low", "Operational": "Medium", "Geopolitical": "Low", "ESG": "Medium" },
  BWT: { "Data Privacy": "High", "Financial Stability": "Medium", "Technical Fit": "Medium", "Contract Complexity": "Low", "Cyber/Security": "Medium", "Operational": "Medium", "Geopolitical": "Medium", "ESG": "Medium" },
  ADP: { "Data Privacy": "Medium", "Financial Stability": "High", "Technical Fit": "High", "Contract Complexity": "Medium", "Cyber/Security": "Medium", "Operational": "High", "Geopolitical": "Low", "ESG": "Medium" },
};

// Sensitivity: perturb one category's weight by +/-5pp, redistribute the delta proportionally
// across the other categories' base weights, recompute Grand Totals, flag if rank 1 changes.
function perturbedCategoryWeights(catKey, deltaFrac) {
  var others = CATEGORIES.filter(function (c) { return c.key !== catKey; });
  var othersSum = others.reduce(function (s, c) { return s + c.weight; }, 0);
  var out = {};
  CATEGORIES.forEach(function (c) {
    if (c.key === catKey) out[c.key] = c.weight + deltaFrac;
    else out[c.key] = c.weight - deltaFrac * (c.weight / othersSum);
  });
  return out;
}
const SENSITIVITY_ROWS = [];
CATEGORIES.forEach(function (cat) {
  [0.05, -0.05].forEach(function (delta) {
    var w = perturbedCategoryWeights(cat.key, delta);
    var totals = {};
    SUPPLIERS.forEach(function (s) { totals[s.id] = grandTotalFor(s.id, w); });
    var rank1Adj = SUPPLIERS.slice().sort(function (a, b) { return totals[b.id] - totals[a.id]; })[0].id;
    SENSITIVITY_ROWS.push({
      category: cat.name, baseWeight: cat.weight, testWeight: cat.weight + delta, delta: delta,
      rank1Base: RANK1_ID, rank1Adjusted: rank1Adj, changed: rank1Adj !== RANK1_ID,
    });
  });
});
const SENSITIVITY_CHANGED_COUNT = SENSITIVITY_ROWS.filter(function (r) { return r.changed; }).length;
const RANKING_ROBUST = SENSITIVITY_CHANGED_COUNT === 0;

// Award Scenario: commercial figures for the two Preferred-tier, gate-clear suppliers only.
// Bluewater Technologies is excluded (Must Have gate fail on S2); Atlas Digital Partners is
// excluded (Below Threshold tier). This is a deliberate scope limit of the modeler, not an
// oversight -- see the guardrail note rendered on the tab itself.
const COMMERCIAL = {
  VSC: { year1: 1850000, tcv3yr: 5400000 },
  NPS: { year1: 2050000, tcv3yr: 5950000 },
};
const AWARD_ELIGIBLE = ["VSC", "NPS"];

// --- Chart data (module scope, static) --------------------------------------------------------
function categoryBreakdownData(supplierId) {
  return CATEGORIES.map(function (cat, i) {
    var criteriaInCat = CRITERIA.filter(function (c) { return c.cat === cat.key; });
    var avg = criteriaInCat.reduce(function (s, c) { return s + c.scores[supplierId]; }, 0) / criteriaInCat.length;
    return { name: cat.name, score: avg, fill: PAL[i % PAL.length] };
  });
}
function classifyScore(v) {
  if (v >= 4.0) return "Fully Meets";
  if (v >= 2.5) return "Partially Meets";
  if (v > 0) return "Does Not Meet";
  return "Does Not Meet";
}
const SAMPLE_REQ_IDS = ["F1", "T1", "S1", "S2", "C1", "I1", "I2", "R2"];

// ---------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------------------------
export default function EvaluationEngineDashboard() {
  var _t = useState("Overview"); var tab = _t[0]; var setTab = _t[1];
  var _sel = useState(RANK1_ID); var selectedSupplierId = _sel[0]; var setSelectedSupplierId = _sel[1];
  var _mode = useState("single"); var awardMode = _mode[0]; var setAwardMode = _mode[1];
  var _winner = useState(RANK1_ID); var singleWinnerId = _winner[0]; var setSingleWinnerId = _winner[1];
  var _alloc = useState(65); var vscAllocPct = _alloc[0]; var setVscAllocPct = _alloc[1];

  function resetToRecommendation() { setAwardMode("single"); setSingleWinnerId(RANK1_ID); setVscAllocPct(65); }

  var alloc = useMemo(function () {
    if (awardMode === "single") {
      return singleWinnerId === "VSC" ? { VSC: 100, NPS: 0 } : { VSC: 0, NPS: 100 };
    }
    return { VSC: vscAllocPct, NPS: 100 - vscAllocPct };
  }, [awardMode, singleWinnerId, vscAllocPct]);

  var blended = useMemo(function () {
    var weights = { VSC: alloc.VSC / 100, NPS: alloc.NPS / 100 };
    var scoreInput = { VSC: GRAND.VSC, NPS: GRAND.NPS };
    var covInput = { VSC: COVERAGE_PCT.VSC, NPS: COVERAGE_PCT.NPS };
    var y1Input = { VSC: COMMERCIAL.VSC.year1, NPS: COMMERCIAL.NPS.year1 };
    var tcvInput = { VSC: COMMERCIAL.VSC.tcv3yr, NPS: COMMERCIAL.NPS.tcv3yr };
    return {
      grand: weightedScoreJS(scoreInput, weights),
      coverage: weightedScoreJS(covInput, weights),
      year1: weightedScoreJS(y1Input, weights),
      tcv3yr: weightedScoreJS(tcvInput, weights),
      vendorCount: (alloc.VSC > 0 ? 1 : 0) + (alloc.NPS > 0 ? 1 : 0),
    };
  }, [alloc]);

  var recBlended = useMemo(function () {
    var weights = RANK1_ID === "VSC" ? { VSC: 1, NPS: 0 } : { VSC: 0, NPS: 1 };
    return {
      grand: weightedScoreJS({ VSC: GRAND.VSC, NPS: GRAND.NPS }, weights),
      coverage: weightedScoreJS({ VSC: COVERAGE_PCT.VSC, NPS: COVERAGE_PCT.NPS }, weights),
      year1: weightedScoreJS({ VSC: COMMERCIAL.VSC.year1, NPS: COMMERCIAL.NPS.year1 }, weights),
      tcv3yr: weightedScoreJS({ VSC: COMMERCIAL.VSC.tcv3yr, NPS: COMMERCIAL.NPS.tcv3yr }, weights),
    };
  }, []);

  var breakdownData = categoryBreakdownData(selectedSupplierId);
  var selectedRanked = RANKED.filter(function (r) { return r.id === selectedSupplierId; })[0];

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Evaluation Engine | Supplier Scoring and Recommendation</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.rfxName} - Supplier Evaluation</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{META.requirementsCount} Requirements | {META.categoriesCount} Categories | {META.suppliersEvaluated} Finalists Scored<br />{META.preparedDate}</div>
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
            <Metric label="Recommended Award" value={RANKED[0].name} sub={"Grand Total " + RANKED[0].grand.toFixed(2) + " / 5.0"} good />
            <Metric label="Runner-Up" value={RANKED[1].name} sub={"Delta to #1: " + RANKED[1].delta.toFixed(2)} />
            <Metric label="Suppliers Evaluated" value={String(SUPPLIERS.length)} sub={GATE_FAIL[RANKED.filter(function (r) { return r.gateFail; })[0] ? RANKED.filter(function (r) { return r.gateFail; })[0].id : RANK1_ID] ? "1 Must-Have gate fail" : "0 Must-Have gate fails"} />
            <Metric label="AI Scoring" value="Trusted" sub="rfp-response-analysis handoff accepted" accent />
            <Metric label="Confidence" value="High" sub={META.stakeholderEvaluators + " evaluators, full completion"} good />
          </div>

          <div style={{ background: CARD, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: DK }}>
            <b>Recommendation:</b> {RANKED[0].name} leads on weighted total ({RANKED[0].grand.toFixed(2)}/5.0) with the strongest requirements coverage ({fP(RANKED[0].coverage)}) and no Must-Have gaps. {RANKED[1].name} is the secondary option ({RANKED[1].grand.toFixed(2)}/5.0), trading Functional Fit and Supplier Risk strength for a lead in Technical & Integration. Subject to successful negotiation of commercial terms and validation of the implementation timeline.
          </div>

          {RANKED.filter(function (r) { return r.gateFail; }).map(function (r) {
            return <StateBanner key={r.id} kind="NEEDS_INPUT" msg={r.name + " scored 0.0 on Must Have requirement " + GATE_DETAIL[r.id][0].id + " (" + GATE_DETAIL[r.id][0].label + "). Its weighted total of " + r.grand.toFixed(2) + " does not override this gap: compensatory scoring cannot offset a hard requirement gap. Recommend leadership review before proceeding to award; both the compensatory ranking above and a gate-pass-only ranking should be presented to the evaluation team."} />;
          })}

          <Card title="Ranked Suppliers" note="Weighted total, 0.0-5.0 scale">
            <STable
              columns={[{ l: "Rank", a: "center" }, { l: "Supplier" }, { l: "Grand Total", a: "right" }, { l: "Delta to #1", a: "right" }, { l: "Coverage", a: "right" }, { l: "Tier" }]}
              rows={RANKED.map(function (r) {
                return [
                  { d: "#" + r.rank, v: r.rank, a: "center" },
                  { d: r.name, v: r.name, b: r.rank === 1 },
                  { d: r.grand.toFixed(2), v: r.grand, b: true, c: scC(r.grand), a: "right" },
                  { d: r.rank === 1 ? "-" : r.delta.toFixed(2), v: r.delta, a: "right" },
                  { d: fP(r.coverage), v: r.coverage, c: pcC(r.coverage), a: "right" },
                  { d: <TierPill tier={r.tier} />, v: r.grand },
                ];
              })}
            />
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginTop: 4 }}>
            <Card title="Supplier Participation & Scoring Roll-up" note="Milestone status, coverage, grand total">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "left" }}>Supplier</th>
                      {MILESTONES.map(function (m) { return <th key={m.key} style={{ padding: "7px 6px", fontWeight: 600, color: MUT, fontSize: 10, borderBottom: "2px solid " + BD, textAlign: "center" }}>{m.label}</th>; })}
                      <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "left" }}>Coverage</th>
                      <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "right" }}>Grand Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RANKED.map(function (r, ri) {
                      var isMax = r.grand === RANKED[0].grand;
                      return <tr key={r.id} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
                        <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, fontWeight: 600 }}>{r.name}</td>
                        {MILESTONES.map(function (m) { return <td key={m.key} style={{ padding: "5px 6px", borderBottom: "1px solid " + BD, textAlign: "center" }}><MilestoneGlyph state={PARTICIPATION[r.id][m.key]} /></td>; })}
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid " + BD }}><MiniBar pct={r.coverage} /></td>
                        <td style={{ padding: "6px 8px", fontSize: 13, borderBottom: "1px solid " + BD, textAlign: "right", fontWeight: 700, color: scC(r.grand), background: isMax ? OK : "transparent", borderRadius: isMax ? 4 : 0 }}>{r.grand.toFixed(2)}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 10, color: MUT, marginTop: 8 }}>Glyphs: {GLYPH.complete[0]} complete - {GLYPH.partial[0]} in progress - {GLYPH.flagged[0]} needs attention - {GLYPH.na[0]} not applicable. Highlighted cell marks the column-max Grand Total.</div>
            </Card>
            <Card title="Participation & Readiness Read">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{RANKED[0].name} and {RANKED.filter(function (r) { return r.id === "NPS"; })[0] ? "NorthPeak Systems" : RANKED[1].name} are fully compliant across all six participation milestones, giving high confidence to proceed on process grounds alone.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Bluewater Technologies completed only a partial product demo (the security deep-dive session was rescheduled), which lines up with its Security & Compliance score gap above: the demo gap reads as a genuine capability gap, not a scheduling accident.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Atlas Digital Partners has not signed its CDA (redlines still in Legal review) and no-showed its original demo slot, now flagged and rescheduled. Recommend a hard readiness check before including Atlas in any further round, independent of its below-threshold score.</p>
            </Card>
          </div>

          <Card title="Supplier Scoring Grid" note="Sortable - click a supplier name to drill into its category breakdown below">
            <STable
              columns={[{ l: "Supplier" }, { l: "AI Score", a: "right" }, { l: "Team Score", a: "right" }, { l: "Landscape Fit", a: "right" }, { l: "Coverage %", a: "right" }, { l: "Grand Total", a: "right" }, { l: "Award Tier" }, { l: "Gate" }]}
              rows={RANKED.map(function (r) {
                var h = HEADLINE[r.id];
                return [
                  { d: <button onClick={function () { setSelectedSupplierId(r.id); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", fontSize: 12, fontWeight: selectedSupplierId === r.id ? 700 : 400, color: selectedSupplierId === r.id ? R : BLU }}>{r.name}</button>, v: r.name },
                  { d: h.ai.toFixed(2), v: h.ai, a: "right" },
                  { d: h.team.toFixed(2), v: h.team, a: "right" },
                  { d: h.landscape.toFixed(2), v: h.landscape, a: "right" },
                  { d: fP(r.coverage), v: r.coverage, c: pcC(r.coverage), a: "right" },
                  { d: r.grand.toFixed(2), v: r.grand, b: true, c: scC(r.grand), a: "right" },
                  { d: <TierPill tier={r.tier} />, v: r.grand },
                  { d: <GatePill fail={r.gateFail} />, v: r.gateFail ? 0 : 1 },
                ];
              })}
            />
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginTop: 4 }}>
            <Card title={"Category Breakdown - " + supplierName(selectedSupplierId)} note="Average criterion score per category, 0.0-5.0">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={breakdownData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="score">
                    {breakdownData.map(function (d, i) { return <Cell key={i} fill={scC(d.score)} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Score Drivers">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{supplierName(selectedSupplierId)} lands at {selectedRanked.grand.toFixed(2)}/5.0 (rank #{selectedRanked.rank}, {selectedRanked.tier.toLowerCase()} tier). {selectedRanked.gateFail ? "It carries a Must-Have gate fail (see the callout above) that the weighted total alone does not surface." : "It carries no Must-Have gate fails."}</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>{breakdownData.slice().sort(function (a, b) { return b.score - a.score; })[0].name} is this supplier's strongest category ({breakdownData.slice().sort(function (a, b) { return b.score - a.score; })[0].score.toFixed(2)}); {breakdownData.slice().sort(function (a, b) { return a.score - b.score; })[0].name} is the weakest ({breakdownData.slice().sort(function (a, b) { return a.score - b.score; })[0].score.toFixed(2)}), the category to prioritize in any BAFO or clarification round.</p>
            </Card>
          </div>
        </div>}

        {tab === "Scoring Detail" && <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {SUPPLIERS.map(function (s) {
              var active = s.id === selectedSupplierId;
              return <button key={s.id} onClick={function () { setSelectedSupplierId(s.id); }} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid " + (active ? BLU : BD), background: active ? BLU : "#fff", color: active ? "#fff" : DK, fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer" }}>{s.name}</button>;
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Metric label="Grand Total" value={GRAND[selectedSupplierId].toFixed(2)} sub="0.0-5.0 scale" good={GRAND[selectedSupplierId] >= 4.0} warn={GRAND[selectedSupplierId] < 3.0} />
            <Metric label="Award Tier" value={tierFor(GRAND[selectedSupplierId])} />
            <Metric label="Must-Have Gate" value={GATE_FAIL[selectedSupplierId] ? "FAIL" : "CLEAR"} warn={GATE_FAIL[selectedSupplierId]} good={!GATE_FAIL[selectedSupplierId]} />
            <Metric label="Effective Weight Check" value="1.000" sub="Sum of Effective_Weight_Frac across all criteria" />
          </div>
          <Card title={"Per-Criterion Weighted Score - " + supplierName(selectedSupplierId)} note="Raw score x Effective_Weight_Frac = weighted contribution">
            <STable
              columns={[{ l: "Criterion" }, { l: "Category" }, { l: "Priority" }, { l: "Eff. Weight", a: "right" }, { l: "Score", a: "right" }, { l: "Weighted", a: "right" }, { l: "Evidence" }]}
              rows={CRITERIA.map(function (c) {
                var w = effectiveWeight(c, BASE_CAT_WEIGHTS);
                var s = c.scores[selectedSupplierId];
                var wc = s * w;
                return [
                  { d: c.label, v: c.label },
                  { d: (CATEGORIES.filter(function (k) { return k.key === c.cat; })[0] || {}).name },
                  { d: c.priority, c: c.priority === "Must Have" ? R : c.priority === "Should Have" ? AMB : MUT },
                  { d: (w * 100).toFixed(1) + "%", v: w, a: "right" },
                  { d: s.toFixed(1), v: s, b: true, c: scC(s), a: "right" },
                  { d: wc.toFixed(3), v: wc, b: true, a: "right" },
                  { d: c.evidenceLoc },
                ];
              }).concat([[{ d: "GRAND TOTAL", b: true, c: R }, { d: "" }, { d: "" }, { d: "1.000", v: 1, a: "right" }, { d: "" }, { d: GRAND[selectedSupplierId].toFixed(3), v: GRAND[selectedSupplierId], b: true, c: R, a: "right" }, { d: "" }]])}
            />
          </Card>
          <Card title="Rationale">
            {CRITERIA.map(function (c) {
              return <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid " + BD }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{c.id} - {c.label} <span style={{ color: scC(c.scores[selectedSupplierId]), fontWeight: 700 }}>({c.scores[selectedSupplierId].toFixed(1)})</span></div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{c.rationale[selectedSupplierId]}</div>
              </div>;
            })}
          </Card>
        </div>}

        {tab === "Requirements Coverage" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Metric label="Total Requirements" value={String(META.requirementsCount)} sub={META.categoriesCount + " categories"} />
            <Metric label="Must-Have Criteria (sampled)" value={String(CRITERIA.filter(function (c) { return c.priority === "Must Have"; }).length)} sub="of 12 sampled criteria" />
            <Metric label="Gate Fails" value={String(SUPPLIERS.filter(function (s) { return GATE_FAIL[s.id]; }).length)} warn={SUPPLIERS.some(function (s) { return GATE_FAIL[s.id]; })} good={!SUPPLIERS.some(function (s) { return GATE_FAIL[s.id]; })} />
            <Metric label="Avg. Coverage" value={fP(SUPPLIERS.reduce(function (s, sup) { return s + COVERAGE_PCT[sup.id]; }, 0) / SUPPLIERS.length)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title="Coverage by Category" note="Fully Meets + half-credit Partially Meets, category-weighted">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "left" }}>Category</th>
                    {SUPPLIERS.map(function (s) { return <th key={s.id} style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "center" }}>{s.id}</th>; })}
                  </tr></thead>
                  <tbody>
                    {CATEGORIES.map(function (cat, ci) {
                      return <tr key={cat.key} style={{ background: ci % 2 === 0 ? "#fff" : CARD }}>
                        <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, fontWeight: 600 }}>{cat.name}</td>
                        {SUPPLIERS.map(function (s) {
                          var cell = COVERAGE_PCT_BY_CAT[s.id][cat.key];
                          var v = cell.fm + 0.5 * cell.pm;
                          return <td key={s.id} style={{ padding: "6px 8px", fontSize: 12, textAlign: "center", borderBottom: "1px solid " + BD, background: pcBg(v), color: pcC(v), fontWeight: 700 }}>{fP(v)}</td>;
                        })}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card title="Reading Coverage">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Bluewater Technologies' Security & Compliance coverage ({fP(COVERAGE_PCT_BY_CAT.BWT.SC.fm + 0.5 * COVERAGE_PCT_BY_CAT.BWT.SC.pm)}) is the single weakest cell on the matrix, driven by the same EU-residency gap that trips its Must-Have gate on the Overview tab: the two views corroborate each other rather than showing independent problems.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Atlas Digital Partners is the only supplier below {fP(80)} coverage in more than one category (Technical & Integration and Implementation & Support), consistent with its below-threshold Grand Total.</p>
            </Card>
          </div>
          <Card title="Sample Requirement Detail" note="8 of 210 requirements shown, drawn from the scored criteria set">
            <STable
              columns={[{ l: "Req" }, { l: "Category" }, { l: "Priority" }].concat(SUPPLIERS.map(function (s) { return { l: s.id, a: "center" }; }))}
              rows={SAMPLE_REQ_IDS.map(function (id) {
                var c = CRITERIA.filter(function (x) { return x.id === id; })[0];
                var row = [
                  { d: c.label, v: c.label },
                  { d: (CATEGORIES.filter(function (k) { return k.key === c.cat; })[0] || {}).name },
                  { d: c.priority, c: c.priority === "Must Have" ? R : c.priority === "Should Have" ? AMB : MUT },
                ];
                SUPPLIERS.forEach(function (s) {
                  var label = classifyScore(c.scores[s.id]);
                  row.push({ d: <CoveragePill label={label} />, v: c.scores[s.id], a: "center" });
                });
                return row;
              })}
            />
          </Card>
        </div>}

        {tab === "Risk" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Metric label="High-Severity Flags" value={String(SUPPLIERS.reduce(function (s, sup) { return s + RISK_CATEGORIES.filter(function (rc) { return RISK_MATRIX[sup.id][rc] === "High"; }).length; }, 0))} warn />
            <Metric label="Risk Categories Assessed" value={String(RISK_CATEGORIES.length)} />
            <Metric label="Suppliers with 0 High Flags" value={String(SUPPLIERS.filter(function (sup) { return RISK_CATEGORIES.every(function (rc) { return RISK_MATRIX[sup.id][rc] !== "High"; }); }).length)} good />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Risk Heatmap" note="Low / Medium / High, non-green status palette">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "left" }}>Category</th>
                    {SUPPLIERS.map(function (s) { return <th key={s.id} style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "center" }}>{s.id}</th>; })}
                  </tr></thead>
                  <tbody>
                    {RISK_CATEGORIES.map(function (rc, ri) {
                      return <tr key={rc} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
                        <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, fontWeight: 600 }}>{rc}</td>
                        {SUPPLIERS.map(function (s) { return <td key={s.id} style={{ padding: "6px 8px", textAlign: "center", borderBottom: "1px solid " + BD }}><SevPill s={RISK_MATRIX[s.id][rc]} /></td>; })}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card title="Top Risks">
              <div style={{ padding: "8px 0", borderBottom: "1px solid " + BD }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: R }}>Bluewater Technologies - Data Privacy (High)</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>Directly tied to the S2 Must-Have gate fail: no dedicated EU hosting region offered. Not resolvable by negotiation alone without a platform-level commitment from the supplier.</div>
              </div>
              <div style={{ padding: "8px 0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: R }}>Atlas Digital Partners - Financial Stability & Operational (High)</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>Smaller vendor scale relative to this engagement's rollout size; thinner balance sheet and a smaller delivery bench raise execution risk independent of its below-threshold score.</div>
              </div>
            </Card>
          </div>
        </div>}

        {tab === "Sensitivity" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <Card title="Weight-Perturbation Matrix" note="+/-5pp per category, redistributed proportionally">
              <STable
                columns={[{ l: "Category Adjusted" }, { l: "Base Weight", a: "right" }, { l: "Test Weight", a: "right" }, { l: "Rank 1 (Base)" }, { l: "Rank 1 (Adjusted)" }, { l: "Changed?" }]}
                rows={SENSITIVITY_ROWS.map(function (r) {
                  return [
                    { d: r.category, v: r.category },
                    { d: fP(r.baseWeight * 100), v: r.baseWeight },
                    { d: fP(r.testWeight * 100) + " (" + (r.delta >= 0 ? "+" : "") + (r.delta * 100).toFixed(0) + ")", v: r.testWeight },
                    { d: supplierName(r.rank1Base) },
                    { d: supplierName(r.rank1Adjusted), c: r.changed ? R : DK, b: r.changed },
                    { d: r.changed ? "YES" : "No", c: r.changed ? R : BLU, b: r.changed },
                  ];
                })}
              />
            </Card>
            <Card title="Robustness Verdict">
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>Perturbations tested</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: DK }}>{SENSITIVITY_ROWS.length} (6 categories, +/-5pp each)</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rank-1 changes</div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: RANKING_ROBUST ? BLU : R }}>{SENSITIVITY_CHANGED_COUNT} of {SENSITIVITY_ROWS.length}</div>
              </div>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}><b>{RANKING_ROBUST ? "Recommendation is robust" : "Recommendation is sensitive"}</b> - {RANKING_ROBUST
                ? "the ranking holds under every tested weight variation. " + supplierName(RANK1_ID) + "'s lead over " + supplierName(RANKED[1].id) + " (" + RANKED[1].delta.toFixed(2) + ") is wide enough that no single-category +/-5pp shift changes the top recommendation."
                : "the ranking changes under at least one tested weight variation. Evaluation team should confirm alignment on category weight priorities before finalizing the award."}</p>
            </Card>
          </div>
        </div>}

        {tab === "Award Scenario" && <div>
          <Card title="How This Works" note="Consumes official scores - does not re-score">
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>This modeler recomputes blended cost and coverage from the official Phase 6 weighted Grand Totals and Phase 3 commercial figures already produced for {supplierName("VSC")} and {supplierName("NPS")}, the two Preferred-tier, gate-clear suppliers. Adjusting allocation never changes a Grand Total; it only changes how already-scored suppliers are blended across a single-award or split-award scenario, using the same kernel-mirrored weighted_score() function the official scoring uses (allocation percentages as the weights). Bluewater Technologies is excluded from split modeling because of its Must-Have gate fail on {GATE_DETAIL.BWT[0] ? GATE_DETAIL.BWT[0].id : "S2"}; Atlas Digital Partners is excluded as Below Threshold.</p>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
            <Card title="Allocation Controls" note="Single vs split award, live recompute">
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <button onClick={function () { setAwardMode("single"); }} style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid " + (awardMode === "single" ? BLU : BD), background: awardMode === "single" ? BLU : "#fff", color: awardMode === "single" ? "#fff" : DK, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Single Award</button>
                <button onClick={function () { setAwardMode("split"); }} style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid " + (awardMode === "split" ? BLU : BD), background: awardMode === "split" ? BLU : "#fff", color: awardMode === "split" ? "#fff" : DK, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Split Award</button>
              </div>

              {awardMode === "single" && <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: MUT, marginBottom: 6 }}>Winner (100% allocation)</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {AWARD_ELIGIBLE.map(function (id) {
                    var active = singleWinnerId === id;
                    return <button key={id} onClick={function () { setSingleWinnerId(id); }} style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid " + (active ? BLU : BD), background: active ? OK : "#fff", color: active ? BLU : DK, fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer" }}>{supplierName(id)}{id === RANK1_ID ? " (Recommended)" : ""}</button>;
                  })}
                </div>
              </div>}

              {awardMode === "split" && <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUT, marginBottom: 4 }}>
                  <span>{supplierName("VSC")} allocation</span>
                  <span style={{ fontWeight: 700, color: BLU, fontFamily: "Georgia,serif", fontSize: 16 }}>{vscAllocPct}%</span>
                </div>
                <input type="range" min={0} max={100} step={5} value={vscAllocPct} onChange={function (e) { setVscAllocPct(parseInt(e.target.value, 10)); }} style={{ width: "100%", accentColor: BLU }} />
                <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>{supplierName("NPS")} allocation: <b style={{ color: BRN }}>{100 - vscAllocPct}%</b></div>
              </div>}

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: MUT, marginBottom: 6 }}>Current allocation</div>
                <div style={{ display: "flex", height: 22, borderRadius: 5, overflow: "hidden", border: "1px solid " + BD }}>
                  {alloc.VSC > 0 && <div style={{ width: alloc.VSC + "%", background: BLU, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{alloc.VSC > 12 ? alloc.VSC + "%" : ""}</div>}
                  {alloc.NPS > 0 && <div style={{ width: alloc.NPS + "%", background: BRN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{alloc.NPS > 12 ? alloc.NPS + "%" : ""}</div>}
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}><span style={{ width: 9, height: 9, borderRadius: 2, background: BLU, display: "inline-block" }} />{supplierName("VSC")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}><span style={{ width: 9, height: 9, borderRadius: 2, background: BRN, display: "inline-block" }} />{supplierName("NPS")}</div>
                </div>
              </div>

              <button onClick={resetToRecommendation} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid " + BD, background: "#fff", color: DK, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Reset to Recommendation</button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                <Metric label="Blended Grand Total" value={blended.grand.toFixed(2)} sub="0.0-5.0 scale" good={blended.grand >= 4.0} />
                <Metric label="Blended Coverage" value={fP(blended.coverage)} good={blended.coverage >= 90} />
                <Metric label="Blended Year-1 Cost" value={f$(blended.year1)} accent />
                <Metric label="Blended 3-Yr TCV" value={f$(blended.tcv3yr)} accent />
              </div>
            </Card>

            <Card title="Reading This Scenario">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>{awardMode === "single"
                ? "A single award to " + supplierName(singleWinnerId) + " carries the full Year-1 cost of " + f$(alloc.VSC === 100 ? COMMERCIAL.VSC.year1 : COMMERCIAL.NPS.year1) + " on one contract, with all delivery and renewal risk concentrated in one vendor relationship."
                : "The current " + alloc.VSC + "/" + alloc.NPS + " split blends to a " + blended.grand.toFixed(2) + "/5.0 weighted quality read and " + fP(blended.coverage) + " requirements coverage, at a blended Year-1 cost of " + f$(blended.year1) + " across " + blended.vendorCount + " concurrent contracts."}</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Trade-offs to weigh: a single award is simpler to govern and typically prices better per unit, but concentrates all execution risk in one supplier. A split award hedges vendor risk and can let each supplier deliver the lot it scored strongest on ({supplierName("VSC")} leads Functional Fit and Supplier Risk; {supplierName("NPS")} leads Technical & Integration), at the cost of coordinating two concurrent implementations and an estimated incremental vendor-management overhead.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Against the recommended single award ({supplierName(RANK1_ID)} at 100%, {recBlended.grand.toFixed(2)}/5.0, {f$(recBlended.year1)} Year-1), the current scenario is {blended.year1 > recBlended.year1 ? "more expensive by " + f$(blended.year1 - recBlended.year1) : blended.year1 < recBlended.year1 ? "less expensive by " + f$(recBlended.year1 - blended.year1) : "identical in Year-1 cost"} and {blended.coverage > recBlended.coverage ? "higher" : blended.coverage < recBlended.coverage ? "lower" : "equal"} on blended coverage.</p>
            </Card>
          </div>

          <Card title="Scenario Compare" note="Recommended single award vs current scenario">
            <STable
              columns={[{ l: "Scenario" }, { l: supplierName("VSC") + " %", a: "right" }, { l: supplierName("NPS") + " %", a: "right" }, { l: "Blended Grand Total", a: "right" }, { l: "Year-1 Cost", a: "right" }, { l: "3-Yr TCV", a: "right" }, { l: "Coverage %", a: "right" }, { l: "Vendors", a: "right" }]}
              rows={[
                [{ d: "Recommended Single Award", b: true }, { d: RANK1_ID === "VSC" ? "100" : "0", a: "right" }, { d: RANK1_ID === "NPS" ? "100" : "0", a: "right" }, { d: recBlended.grand.toFixed(2), b: true, c: scC(recBlended.grand), a: "right" }, { d: fF(recBlended.year1), a: "right" }, { d: fF(recBlended.tcv3yr), a: "right" }, { d: fP(recBlended.coverage), a: "right" }, { d: "1", a: "right" }],
                [{ d: "Current Scenario", b: true, c: BLU }, { d: String(alloc.VSC), a: "right" }, { d: String(alloc.NPS), a: "right" }, { d: blended.grand.toFixed(2), b: true, c: scC(blended.grand), a: "right" }, { d: fF(blended.year1), a: "right" }, { d: fF(blended.tcv3yr), a: "right" }, { d: fP(blended.coverage), a: "right" }, { d: String(blended.vendorCount), a: "right" }],
              ]}
            />
          </Card>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Decision support, not an automated decision. Scores are evidence-cited; a human owns the award.</div>
        <div>Eli Lilly and Company - Confidential | Evaluation Engine | 2026</div>
      </div>
    </div>
  );
}
