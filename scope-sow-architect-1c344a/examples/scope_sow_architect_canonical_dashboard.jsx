import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

// ---------------------------------------------------------------------------
// Scope & SOW Architect - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure per SKILL.md / references/dashboard-canonical.md v1.0: 7 tabs,
// identical on every run for every engagement type and input source (Overview,
// Scope Boundary & Deliverables, Roles/Assumptions & Dependencies, Milestones &
// Acceptance, SLAs & KPIs, Staffing/Rate Card & Payment, Change Control &
// Rewrite Plan). Only the data changes. House style: Magazine Report (Arial
// body, Georgia titles, dark #212121 header with a red rule, Bold-Blue
// palette, no green anywhere). Components copied verbatim from
// lilly-brand-assets-1c344a, references/dashboard-components.md.
//
// Data below is ILLUSTRATIVE (a mid-size Data Platform Migration SOW from a
// fictional supplier, "Meridian Analytics", under an existing Lilly MSA).
// Clone the structure, swap the data. Any resemblance to a real supplier,
// contract, or dollar figure is coincidental; this is a worked example only.
//
// NUMBERS RECONCILE: the Scope Definition Score, the payment-milestone
// reconciliation, and the rate-card footing check below are all DERIVED at
// render time from the source data via the kernel-mirrored weightedScoreJS(),
// verifyLineMathJS(), and toHourlyJS() (JS mirrors of numeric_kernel.py),
// never hand-typed. This is the dashboard's own numbers-reconcile assertion
// made structurally true rather than merely stated.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green
// anywhere; positive signal uses Bold Blue (BLU) / Neutral Sky (OK), never a
// "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Chart palette: exactly the 6 on-brand hexes from dashboard-components.md.
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

const TABS = ["Overview", "Scope Boundary & Deliverables", "Roles, Assumptions & Dependencies", "Milestones & Acceptance", "SLAs & KPIs", "Staffing, Rate Card & Payment", "Change Control & Rewrite Plan"];
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
// Per-dimension score scale is 0.0-5.0, restated for scope quality in
// references/scope-quality-scoring.md (Fully/Largely/Partially/Minimally Defined, Not Defined),
// using the same band boundaries as the suite canonical scoring-scales.md.
function scC(v) { return v >= 4.0 ? BLU : v >= 3.0 ? AMB : R; }
function scBg(v) { return v >= 4.0 ? OK : v >= 3.0 ? WARM : RISK; }
function pcC(p) { return p >= 90 ? BLU : p >= 70 ? AMB : R; }
function pcBg(p) { return p >= 90 ? OK : p >= 70 ? WARM : RISK; }

// Severity map (BLOCKING/HIGH/MEDIUM/LOW). BLOCKING and HIGH share the Lilly Red signal
// (BLOCKING is the more severe label, not a new color) per dashboard-canonical.md.
const SEV = { BLOCKING: R, HIGH: R, MEDIUM: AMB, LOW: BLU };
const SEVBG = { BLOCKING: RISK, HIGH: RISK, MEDIUM: WARM, LOW: OK };
function SevPill({ s }) {
  return <span style={{ color: SEV[s], background: SEVBG[s], border: "1px solid " + SEV[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}

// Structure-map status (Present/Partial/Missing), used on Overview and Scope Boundary tab.
const STRUCT = { Present: BLU, Partial: AMB, Missing: R };
const STRUCTBG = { Present: OK, Partial: WARM, Missing: RISK };
function StructPill({ s }) {
  return <span style={{ color: STRUCT[s], background: STRUCTBG[s], border: "1px solid " + STRUCT[s] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{s}</span>;
}

// --- numeric_kernel.py mirrors -----------------------------------------------------------
// Source of truth: scope-sow-architect-1c344a/numeric_kernel.py (vendored verbatim from
// lilly-procurement-kernels-1c344a). Signatures and refusal behavior copied verbatim.

// weighted_score(): used for the Scope Definition Score composite (Overview tab).
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

// verify_line_math(): used for the payment-milestone footing check and the rate-card
// row footing check (Staffing, Rate Card & Payment tab).
function verifyLineMathJS(rate, hours, statedTotal, tolerance) {
  tolerance = tolerance == null ? 0.01 : tolerance;
  var expected = rate * hours;
  return { expected: expected, ok: Math.abs(expected - statedTotal) <= tolerance, delta: statedTotal - expected };
}

// to_hourly(): used to normalize mixed-unit rate-card rows (daily/monthly) onto one
// hourly basis before computing the blended rate.
var HOURLY_DIVISORS = { hour: 1, day: 8, week: 40, month: 173, year: 2080 };
function toHourlyJS(value, unit) {
  var key = unit.trim().toLowerCase();
  if (!(key in HOURLY_DIVISORS)) { throw new Error("toHourlyJS: unknown unit '" + unit + "'."); }
  return value / HOURLY_DIVISORS[key];
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
function ScoreCell({ v, a }) {
  return <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, textAlign: a || "center", color: scC(v), background: scBg(v), borderBottom: "1px solid " + BD }}>{v == null ? "" : v.toFixed(1)}</td>;
}
function PctCell({ p, a }) {
  return <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, textAlign: a || "center", color: pcC(p), background: pcBg(p), borderBottom: "1px solid " + BD }}>{fP(p)}</td>;
}

// ---------------------------------------------------------------------------------------------
// DATA MODEL
// ---------------------------------------------------------------------------------------------
const META = {
  supplier: "Meridian Analytics", title: "SOW 4: Real-World Evidence Data Platform - Phase 2 Migration & Enablement",
  engagementType: "Professional Services (fixed-deliverables, hybrid T&M rate card)",
  totalValue: 1240000, term: "Oct 1, 2026 to Jul 31, 2027 (10 months, single-year, no option periods)",
  msa: "Master Services Agreement (executed Jan 2025)", preparedDate: "Jul 22, 2026", inputSource: "Uploaded draft SOW (DOCX)",
};

// Scope Definition Score: 10 dimensions, weights sum to 1.0.
const DIMENSIONS = [
  { key: "deliv", label: "Deliverables Definition & Testability", weight: 0.15, score: 3.0,
    note: "3 of 5 deliverables fully testable (named, described, format stated, verification method stated); 2 lack a stated verification method." },
  { key: "bound", label: "In-Scope / Out-of-Scope Boundary", weight: 0.10, score: 1.5,
    note: "In-scope list present and specific. No out-of-scope section at all; capped at Minimally Defined per the HIGH finding." },
  { key: "accept", label: "Acceptance Criteria Objectivity", weight: 0.15, score: 2.0,
    note: "3 of 5 acceptance clauses use a subjective standard ('satisfactory to Lilly') with no named test; capped at Partially Defined per the HIGH finding." },
  { key: "assump", label: "Assumptions & Dependencies", weight: 0.10, score: 3.0,
    note: "1 assumption and 3 dependencies stated; 2 dependencies have no named owner or needed-by date." },
  { key: "raci", label: "Roles & Responsibilities (RACI)", weight: 0.10, score: 2.5,
    note: "2 of 5 workstreams have no named Accountable party (End-User Training, Legacy System Decommission)." },
  { key: "mile", label: "Milestones & Schedule", weight: 0.10, score: 3.5,
    note: "4 of 5 milestones dated; 1 ('Go-Live Readiness Review') has no explicit date, described only as 'prior to go-live'." },
  { key: "sla", label: "SLAs / KPIs Measurability", weight: 0.10, score: 2.5,
    note: "2 metrics named (availability, ticket response) but neither states a measurement method or reporting cadence." },
  { key: "rate", label: "Staffing & Rate-Card Soundness", weight: 0.10, score: 2.0,
    note: "1 of 6 rate-card rows does not foot (Senior Data Engineer line total overstated by $10,000); capped at Partially Defined per the HIGH finding." },
  { key: "pay", label: "Payment-to-Deliverable Alignment", weight: 0.05, score: 1.5,
    note: "Milestone payments sum to $1,190,000 against a stated $1,240,000 total contract value, a $50,000 (4.0%) shortfall; capped at Minimally Defined per the footing-failure rule." },
  { key: "cc", label: "Change-Control Trigger Definition", weight: 0.05, score: 0.5,
    note: "No change-control section anywhere in the document. On a 10-month, $1.24M engagement this is a BLOCKING gap, capped at Not Defined." },
];
const DIM_WEIGHTS = {}; var DIM_SCORES = {};
DIMENSIONS.forEach(function (d) { DIM_WEIGHTS[d.key] = d.weight; DIM_SCORES[d.key] = d.score; });
const COMPOSITE_0TO5 = weightedScoreJS(DIM_SCORES, DIM_WEIGHTS);
const SCOPE_SCORE = Math.round(COMPOSITE_0TO5 * 20);
function scopeBand(v) {
  if (v >= 75) return { label: "Low gap / Ready to Issue", c: BLU };
  if (v >= 50) return { label: "Moderate gap / Needs Targeted Fixes", c: AMB };
  if (v >= 25) return { label: "High gap / Major Rework", c: R };
  return { label: "Critical gap / Not Priceable", c: R };
}
const BAND = scopeBand(SCOPE_SCORE);

// Findings ledger: one per dimension in this illustrative run (a real run typically has more
// than one finding per dimension; this worked example uses one each for clarity).
const FINDINGS = [
  { id: 1, sev: "BLOCKING", dim: "cc", title: "No change-control section", where: "Entire document (absent)",
    ev: "No section anywhere in the SOW addresses how a scope, schedule, or cost change is triggered, approved, or priced. The engagement spans 10 months and $1.24M, well past the suggested change-control threshold band in the clause library.",
    impact: "Any scope evolution (a common risk on a data migration engagement) has no priced, approved path; disputes over 'is this in scope' default to informal negotiation with no governing process.",
    action: "Add a Change Control section: trigger (any material scope change, cost delta beyond 5%, or schedule slip beyond 4-6 weeks), approval authority (category lead / change-control board), and pricing mechanism (rate-card reference or a priced change proposal within 5 business days)." },
  { id: 2, sev: "HIGH", dim: "bound", title: "No out-of-scope section", where: "Section 2 (Scope) - out-of-scope subsection absent",
    ev: "Section 2 lists in-scope work (ETL migration, training, decommission, data quality report) but never states what is excluded. The most likely adjacent asks for this engagement type (custom development beyond configuration, migration of non-production/archival datasets, ongoing post-go-live support beyond the stated 30-day hypercare) are all unaddressed.",
    impact: "Scope-creep risk: the supplier or the business can reasonably read 'migrate the RWE platform' as including any of the three adjacent asks above.",
    action: "Add an explicit out-of-scope list naming the 3 adjacent asks above, plus a pointer to the change-control process (once added) for anything the business later wants included." },
  { id: 3, sev: "HIGH", dim: "pay", title: "Milestone payments do not foot to the stated total contract value", where: "Section 7.2 (Payment Schedule), Milestone 3",
    ev: "Milestone 3 ('Go-Live Readiness Review') is stated as 25% of total value but its dollar figure is listed as $260,000. 25% of the stated $1,240,000 total is $310,000, a $50,000 understatement. Milestone sum as written: $186,000 + $248,000 + $260,000 + $310,000 + $186,000 = $1,190,000, which is $50,000 (4.0%) short of the stated $1,240,000 total contract value.",
    impact: "The payment schedule as written under-collects $50,000 relative to the stated deal value, or the deal value itself is wrong; either way the two numbers cannot both be signed as-is.",
    action: "Correct Milestone 3 to $310,000 (25% x $1,240,000) so the schedule foots, or restate the total contract value to $1,190,000 if that was the intended figure. Confirm which number is correct with the requesting stakeholder before issuing." },
  { id: 4, sev: "HIGH", dim: "accept", title: "Subjective acceptance standard on 3 of 5 deliverables", where: "Section 6.3 (Acceptance Criteria)",
    ev: "Data Quality Report, Migration Runbook, and the Go-Live Readiness Review milestone all use 'satisfactory to Lilly' or equivalent language with no named test, checklist, or reviewer.",
    impact: "No objective gate for 3 of 5 payment-linked deliverables; acceptance (and the payment behind it) can stall on an undefined standard, or be disputed after the fact.",
    action: "Rewrite each to a named, verifiable test: Data Quality Report against a stated QC checklist and error-rate threshold; Migration Runbook against a stated completeness checklist reviewed by a named IT Ops reviewer; Go-Live Readiness Review against the same checklist plus a stated go/no-go scorecard." },
  { id: 5, sev: "HIGH", dim: "rate", title: "Rate-card line does not foot", where: "Section 8.2 (Rate Card), Senior Data Engineer row",
    ev: "Senior Data Engineer is listed at $185/hr for 640 hours with a stated line total of $128,400. $185 x 640 = $118,400. The stated line total is $10,000 higher than the rate-times-hours calculation supports.",
    impact: "The rate card's own arithmetic does not reconcile, which puts the $1,240,000 total contract value itself in question (see Finding 3, a separate but related footing issue on the payment side).",
    action: "Correct the Senior Data Engineer line total to $118,400 (and true up the total contract value calculation), or confirm the $128,400 figure includes an unstated adjustment (e.g., a rate change mid-engagement) and disclose it explicitly." },
  { id: 6, sev: "MEDIUM", dim: "deliv", title: "Two deliverables lack a stated verification method", where: "Section 3 (Deliverables): Data Quality Report, Migration Runbook",
    ev: "Both deliverables have a name and a one-line description but no stated format/medium and no stated verification method (who confirms it is complete and how).",
    impact: "Without a verification method these two deliverables cannot be objectively gated at their linked milestones (compounds Finding 4).",
    action: "State the format (e.g., a PDF report against a named QC template; a versioned runbook document in the shared repo) and the verification method (named reviewer, checklist, or test) for each." },
  { id: 7, sev: "MEDIUM", dim: "sla", title: "SLA metrics named with no measurement method or cadence", where: "Section 5 (Service Levels)",
    ev: "'99% platform availability' and 'priority ticket response' are both named with a target-like phrase but neither states how availability is measured (uptime monitoring tool, measurement window) or the ticket response SLA's actual numeric target, measurement method, or reporting cadence.",
    impact: "Neither metric is enforceable or auditable as written; 'priority' response has no numeric floor at all.",
    action: "Add a measurement method and window for availability (e.g., monthly, via the hosting platform's uptime dashboard) and a numeric target plus severity tiers for ticket response, per the SLA pattern bank for managed-service engagements." },
  { id: 8, sev: "MEDIUM", dim: "raci", title: "Two workstreams have no named Accountable party", where: "RACI (constructed from Section 4, Roles & Responsibilities)",
    ev: "End-User Training and Legacy System Decommission both have a Responsible party named (Meridian Analytics leads) but no Lilly- or Meridian-side Accountable owner named for either.",
    impact: "Two deliverables have work assigned but no single accountable owner if something slips; this is a governance gap independent of whether the work itself gets done.",
    action: "Name an Accountable party for both workstreams (a Meridian Engagement Director is the natural fit for internal accountability; confirm the Lilly-side sponsor for each as well)." },
  { id: 9, sev: "MEDIUM", dim: "assump", title: "Two dependencies have no named owner or needed-by date", where: "Section 2.4 (Dependencies)",
    ev: "'Lilly to provide production data access' and 'Lilly IT to complete network firewall exception' are both stated as dependencies but neither names a specific Lilly owner or a needed-by date, unlike the third dependency (data mapping spec approval, which names Lilly Data Governance and a Week 3 date).",
    impact: "Two of the three stated dependencies cannot actually be tracked or escalated if they slip, because there is no named owner or date to hold to.",
    action: "Name a specific Lilly owner and a needed-by date for both, using the same pattern already applied correctly to the third dependency." },
  { id: 10, sev: "LOW", dim: "mile", title: "One milestone has no explicit date", where: "Section 7.1 (Milestones), Milestone 3",
    ev: "'Go-Live Readiness Review' is described only as occurring 'prior to go-live' with no stated date or trigger window.",
    impact: "Minor scheduling ambiguity; does not block pricing or delivery on its own, but compounds Finding 4's acceptance-criteria gap on the same milestone.",
    action: "Add an explicit date or a stated trigger window (e.g., 'within 5 business days before the planned cutover date in Milestone 4')." },
];
const BLOCKING_COUNT = FINDINGS.filter(function (f) { return f.sev === "BLOCKING"; }).length;
const HIGH_COUNT = FINDINGS.filter(function (f) { return f.sev === "HIGH"; }).length;
const DIMS_READY = DIMENSIONS.filter(function (d) { return d.score >= 3.5; }).length;

// Deliverables register (Scope Boundary & Deliverables tab).
const DELIVERABLES = [
  { name: "Data Migration Execution", desc: "ETL of production RWE datasets from Legacy Platform X to the target platform", format: "Working system + migration execution log", verify: "UAT sign-off by Lilly Data Governance", testable: true, milestone: "Production Cutover & Go-Live" },
  { name: "Data Quality Report", desc: "Post-migration data quality and reconciliation summary", format: "Not stated", verify: "Not stated", testable: false, milestone: "Go-Live Readiness Review" },
  { name: "Migration Runbook", desc: "Step-by-step operational runbook for the migration and cutover", format: "Not stated (implied document)", verify: "Not stated", testable: false, milestone: "Go-Live Readiness Review" },
  { name: "End-User Training", desc: "3 live training sessions plus recorded video for end users", format: "Live sessions + recorded video", verify: "Attendance log + completion survey", testable: true, milestone: "Training & Decommission Complete" },
  { name: "Legacy System Decommission", desc: "Decommission and data-retention closeout of the legacy platform", format: "Decommission certificate", verify: "Lilly IT Ops sign-off", testable: true, milestone: "Training & Decommission Complete" },
];
const IN_SCOPE = [
  "ETL migration of production Real-World Evidence datasets from Legacy Platform X to the target data platform",
  "Three (3) end-user training sessions, live and recorded",
  "Legacy system decommission and data-retention closeout",
  "One (1) post-migration data quality and reconciliation report",
];
const OUT_OF_SCOPE = []; // absent from the document; rendered as a flagged gap, not silently empty

// RACI (Roles, Assumptions & Dependencies tab).
const RACI = [
  { item: "Data Migration Execution", r: "Meridian Migration Lead", a: "Meridian Engagement Director", c: "Lilly Data Governance", i: "Lilly IT Security", orphan: false },
  { item: "Data Quality Report", r: "Meridian QA Lead", a: "Meridian Engagement Director", c: "Lilly Data Governance", i: "-", orphan: false },
  { item: "Migration Runbook", r: "Meridian Migration Lead", a: "Meridian Engagement Director", c: "Lilly IT Ops", i: "Lilly Data Governance", orphan: false },
  { item: "End-User Training", r: "Meridian Training Lead", a: "Not named", c: "Lilly Change Management", i: "Lilly HR", orphan: true },
  { item: "Legacy System Decommission", r: "Meridian Migration Lead", a: "Not named", c: "Lilly IT Security", i: "Lilly IT Ops", orphan: true },
];
const ASSUMPTIONS = [
  { text: "Existing production data is in a migratable relational format", owner: "Meridian Analytics", risk: "Schedule slip if data requires additional transformation work", stated: true },
];
const DEPENDENCIES = [
  { text: "Lilly to provide production data access", owner: "Not named", neededBy: "Not stated", status: "Open" },
  { text: "Lilly IT to complete network firewall exception", owner: "Not named", neededBy: "Not stated", status: "Open" },
  { text: "Lilly Data Governance to approve the data mapping specification", owner: "Lilly Data Governance", neededBy: "Week 3", status: "Open" },
];

// Milestones & payment schedule (Milestones & Acceptance tab, Staffing/Rate Card & Payment tab).
const MILESTONES = [
  { name: "Kickoff & Data Mapping Spec Approved", date: "Oct 15, 2026", tied: "Data Mapping Spec", pct: 15, statedAmt: 186000, accept: "Data Mapping Spec approved by Lilly Data Governance", objective: true },
  { name: "Migration Environment Build Complete", date: "Dec 1, 2026", tied: "Environment Build", pct: 20, statedAmt: 248000, accept: "Environment passes the smoke-test checklist", objective: true },
  { name: "Go-Live Readiness Review", date: "Not stated ('prior to go-live')", tied: "Data Quality Report, Migration Runbook", pct: 25, statedAmt: 260000, accept: "Readiness review satisfactory to Lilly", objective: false },
  { name: "Production Cutover & Go-Live", date: "Mar 1, 2027", tied: "Data Migration Execution", pct: 25, statedAmt: 310000, accept: "System live in production; UAT signed off", objective: true },
  { name: "Training & Decommission Complete", date: "Jul 31, 2027", tied: "End-User Training, Legacy System Decommission", pct: 15, statedAmt: 186000, accept: "Training attendance and completion confirmed; decommission certificate issued", objective: true },
];
const MILESTONE_SUM = MILESTONES.reduce(function (s, m) { return s + m.statedAmt; }, 0);
const PAYMENT_GAP = META.totalValue - MILESTONE_SUM;
const PAYMENT_RECONCILES = Math.abs(PAYMENT_GAP) <= 0.01;

// Rate card (Staffing, Rate Card & Payment tab). unit: hour/day/week/month/year, per to_hourly().
const RATE_CARD = [
  { role: "Engagement Director", level: "Principal", rate: 245, unit: "hour", qty: 160, statedTotal: 39200 },
  { role: "Senior Data Engineer", level: "Senior", rate: 185, unit: "hour", qty: 640, statedTotal: 128400 },
  { role: "Data Migration Analyst", level: "Mid", rate: 145, unit: "hour", qty: 960, statedTotal: 139200 },
  { role: "QA Lead", level: "Senior", rate: 160, unit: "hour", qty: 320, statedTotal: 51200 },
  { role: "Training Lead", level: "Mid", rate: 1200, unit: "day", qty: 12, statedTotal: 14400 },
  { role: "Change Management Lead", level: "Senior", rate: 9500, unit: "month", qty: 4, statedTotal: 38000 },
];
const RATE_CARD_CHECKED = RATE_CARD.map(function (row) {
  var hoursEq = toHourlyJS(row.rate, row.unit) === row.rate ? row.qty : (row.unit === "day" ? row.qty * 8 : row.unit === "month" ? row.qty * 173 : row.qty);
  var check = verifyLineMathJS(row.rate, row.qty, row.statedTotal);
  var hourly = toHourlyJS(row.rate, row.unit);
  return Object.assign({}, row, { hourly: hourly, hoursEq: hoursEq, ok: check.ok, expected: check.expected, delta: check.delta });
});
const RATE_TOTAL_HOURS = RATE_CARD_CHECKED.reduce(function (s, r) { return s + r.hoursEq; }, 0);
const RATE_TOTAL_STATED = RATE_CARD_CHECKED.reduce(function (s, r) { return s + r.statedTotal; }, 0);
const BLENDED_RATE = RATE_TOTAL_STATED / RATE_TOTAL_HOURS;

// SLA / KPI register.
const SLAS = [
  { metric: "Platform availability", target: "99%", method: "Not stated", cadence: "Not stated", credit: "Not stated" },
  { metric: "Priority ticket response", target: "Not stated (no numeric floor)", method: "Not stated", cadence: "Not stated", credit: "Not stated" },
];

// Change control (drafted default, since none exists in the source document).
const CC_DRAFT = {
  trigger: "Any material scope change, or a cost delta beyond 5%, or a schedule slip beyond 4-6 weeks",
  authority: "Formal change-control board (or the same approval chain that authorized this SOW)",
  pricing: "Priced change proposal submitted within 5 business days of the trigger, referencing the Section 8.2 rate card",
};

// Rewrite map (Change Control & Rewrite Plan tab).
const REWRITE_MAP = [
  { findingId: 1, section: "Section 9 (new)", fix: "Added Change Control section with trigger, approval authority, and pricing mechanism (DRAFT default; confirm with requesting stakeholder)." },
  { findingId: 2, section: "Section 2.2 (new)", fix: "Added Out-of-Scope subsection naming the 3 most likely adjacent asks." },
  { findingId: 3, section: "Section 7.2", fix: "Corrected Milestone 3 amount to $310,000 so the payment schedule foots to the stated $1,240,000 total; flagged for stakeholder confirmation." },
  { findingId: 4, section: "Section 6.3", fix: "Rewrote 3 acceptance clauses to named, checklist-based tests." },
  { findingId: 5, section: "Section 8.2", fix: "Corrected the Senior Data Engineer line total to $118,400; flagged for stakeholder confirmation." },
  { findingId: 6, section: "Section 3", fix: "Added format and verification method for Data Quality Report and Migration Runbook." },
  { findingId: 7, section: "Section 5", fix: "Added measurement method, window, and a numeric ticket-response target." },
  { findingId: 8, section: "Section 4 (RACI)", fix: "Named an Accountable party for both orphaned workstreams." },
  { findingId: 9, section: "Section 2.4", fix: "Named an owner and needed-by date for both open dependencies." },
  { findingId: 10, section: "Section 7.1", fix: "Added an explicit trigger window for Milestone 3." },
];

// Dimension score chart data (Overview tab).
function dimensionChartData() {
  return DIMENSIONS.map(function (d) { return { name: d.label.length > 22 ? d.label.slice(0, 21) + "." : d.label, score: d.score, fill: scC(d.score) }; });
}

// Section coverage matrix (Scope Boundary tab and Overview reference).
const SECTION_MAP = [
  { section: "Scope Statement / In-Scope", status: "Present" },
  { section: "Out-of-Scope", status: "Missing" },
  { section: "Deliverables", status: "Partial" },
  { section: "Assumptions & Dependencies", status: "Partial" },
  { section: "Roles & Responsibilities", status: "Partial" },
  { section: "Milestones & Schedule", status: "Present" },
  { section: "Acceptance Criteria", status: "Partial" },
  { section: "SLAs & KPIs", status: "Partial" },
  { section: "Staffing & Rate Card", status: "Present" },
  { section: "Payment Schedule", status: "Present" },
  { section: "Change Control", status: "Missing" },
];

// ---------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------------------------
export default function ScopeSowArchitectDashboard() {
  var _t = useState("Overview"); var tab = _t[0]; var setTab = _t[1];
  var chartData = dimensionChartData();

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Scope & SOW Architect | {META.engagementType}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.supplier} - {META.title}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{fF(META.totalValue)} Total Value | {META.term}<br />Prepared {META.preparedDate} | Source: {META.inputSource}</div>
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
            <Metric label="Scope Definition Score" value={SCOPE_SCORE + " / 100"} sub={BAND.label} warn={SCOPE_SCORE < 50} good={SCOPE_SCORE >= 75} />
            <Metric label="Total Contract Value" value={f$(META.totalValue)} sub={META.term} />
            <Metric label="Payment Reconciliation" value={PAYMENT_RECONCILES ? "Reconciles" : "Does Not Reconcile"} sub={PAYMENT_RECONCILES ? "Milestones foot to total value" : fF(Math.abs(PAYMENT_GAP)) + " gap vs. stated total"} warn={!PAYMENT_RECONCILES} good={PAYMENT_RECONCILES} />
            <Metric label="Open Blocking + High Findings" value={String(BLOCKING_COUNT + HIGH_COUNT)} sub={BLOCKING_COUNT + " blocking, " + HIGH_COUNT + " high"} warn={BLOCKING_COUNT + HIGH_COUNT > 0} />
            <Metric label="Dimensions Ready" value={DIMS_READY + " / 10"} sub="Largely or Fully Defined" good={DIMS_READY >= 7} />
          </div>

          <div style={{ background: CARD, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: DK }}>
            <b>Recommendation:</b> This SOW scores {SCOPE_SCORE}/100 ({BAND.label}). The single biggest blocker is the complete absence of a change-control section on a 10-month, {f$(META.totalValue)} engagement; close behind are a payment schedule that does not foot to the stated total value and three acceptance clauses that rely on a subjective standard. None of these require restarting the SOW: each has a specific, targeted fix in the Rewrite Plan tab. Do not issue or price against this draft until Findings 1, 2, 3, 4, and 5 are resolved.
          </div>

          <Card title="Scope Definition Score - Calculation" note="weighted_score() composite, rescaled 0.0-5.0 to 0-100">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "left" }}>Dimension</th>
                  <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "right" }}>Weight</th>
                  <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "center" }}>Score (0.0-5.0)</th>
                  <th style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: "right" }}>Weighted Contribution</th>
                </tr></thead>
                <tbody>
                  {DIMENSIONS.map(function (d, i) {
                    return <tr key={d.key} style={{ background: i % 2 === 0 ? "#fff" : CARD }}>
                      <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD }}>{d.label}</td>
                      <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: "right" }}>{(d.weight * 100).toFixed(0)}%</td>
                      <ScoreCell v={d.score} />
                      <td style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: "right", fontWeight: 700 }}>{(d.weight * d.score).toFixed(3)}</td>
                    </tr>;
                  })}
                  <tr style={{ background: "#fff", fontWeight: 700 }}>
                    <td style={{ padding: "6px 8px", fontSize: 12, borderTop: "2px solid " + BD }}>Composite (0.0-5.0)</td>
                    <td style={{ padding: "6px 8px", fontSize: 12, borderTop: "2px solid " + BD, textAlign: "right" }}>100%</td>
                    <td style={{ padding: "6px 8px", fontSize: 12, borderTop: "2px solid " + BD, textAlign: "center", color: scC(COMPOSITE_0TO5) }}>{COMPOSITE_0TO5.toFixed(3)}</td>
                    <td style={{ padding: "6px 8px", fontSize: 13, borderTop: "2px solid " + BD, textAlign: "right", color: BAND.c }}>{SCOPE_SCORE} / 100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
            <Card title="Dimension Scores" note="Colored by band">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10, fill: MUT }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: DK }} />
                  <Tooltip formatter={function (v) { return v.toFixed(1); }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {chartData.map(function (entry, i) { return <Cell key={i} fill={entry.fill} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Where This Stands">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>The three lowest-scoring dimensions, Change-Control Trigger Definition (0.5), Payment-to-Deliverable Alignment (1.5), and In-Scope / Out-of-Scope Boundary (1.5), account for more than a third of the total weighted gap despite carrying only 25% of the weight combined. Fixing the change-control gap alone (adding a single new section) moves that dimension from Not Defined toward Largely Defined and is the single highest-leverage edit available.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>Acceptance Criteria Objectivity and Staffing & Rate-Card Soundness are both capped by a HIGH finding each (subjective acceptance language; a rate-card line that does not foot) rather than being genuinely absent, so both are quick, high-confidence fixes once the specific language and the specific dollar correction are applied.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>Milestones & Schedule is the strongest dimension (3.5) and needs only the one missing date to clear the Largely Defined threshold.</p>
            </Card>
          </div>

          <Card title="Top Findings" note={FINDINGS.length + " total findings across 10 dimensions"}>
            <STable
              columns={[{ l: "Severity", a: "center" }, { l: "Finding" }, { l: "Dimension" }, { l: "Where" }]}
              rows={FINDINGS.filter(function (f) { return f.sev === "BLOCKING" || f.sev === "HIGH"; }).map(function (f) {
                var dimLabel = DIMENSIONS.filter(function (d) { return d.key === f.dim; })[0].label;
                return [
                  { d: <SevPill s={f.sev} />, v: f.sev === "BLOCKING" ? 0 : 1, a: "center" },
                  { d: f.title, v: f.title, b: true },
                  { d: dimLabel, v: dimLabel },
                  { d: f.where, v: f.where },
                ];
              })}
            />
          </Card>

          <div style={{ background: CARD, borderLeft: "4px solid " + BLU, borderRadius: "0 6px 6px 0", padding: "12px 16px", fontSize: 12, color: DK, lineHeight: 1.6 }}>
            <b>Boundary note:</b> This dashboard assesses whether the WORK described in this SOW is defined well enough to price, deliver, accept, and govern. It does not assess whether the DOCUMENT legally protects Lilly (liability, indemnification, IP ownership, termination rights); route this SOW to lilly-contract-review for that separate legal-protection pass once the scope-definition gaps above are resolved.
          </div>
        </div>}

        {tab === "Scope Boundary & Deliverables" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
            <Card title="Deliverables Register" note={DELIVERABLES.filter(function (d) { return d.testable; }).length + " of " + DELIVERABLES.length + " fully testable"}>
              <STable
                columns={[{ l: "Deliverable" }, { l: "Format" }, { l: "Verification Method" }, { l: "Testable", a: "center" }, { l: "Milestone" }]}
                rows={DELIVERABLES.map(function (d) {
                  return [
                    { d: d.name, v: d.name, b: true },
                    { d: d.format, v: d.format, c: d.format === "Not stated" ? R : DK },
                    { d: d.verify, v: d.verify, c: d.verify === "Not stated" ? R : DK },
                    { d: d.testable ? "Yes" : "No", v: d.testable ? 1 : 0, a: "center", c: d.testable ? BLU : R },
                    { d: d.milestone, v: d.milestone },
                  ];
                })}
              />
            </Card>
            <div>
              <Card title="In-Scope">
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: DK, lineHeight: 1.7 }}>
                  {IN_SCOPE.map(function (s, i) { return <li key={i}>{s}</li>; })}
                </ul>
              </Card>
              <Card title="Out-of-Scope">
                {OUT_OF_SCOPE.length === 0
                  ? <StateBanner kind="NEEDS_INPUT" msg="No out-of-scope section exists in the source document (Finding 2, HIGH). Recommend explicitly excluding: custom development beyond configuration, migration of non-production/archival datasets, and ongoing post-go-live support beyond the stated 30-day hypercare window." />
                  : <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: DK, lineHeight: 1.7 }}>{OUT_OF_SCOPE.map(function (s, i) { return <li key={i}>{s}</li>; })}</ul>}
              </Card>
            </div>
          </div>
          <Card title="Section Coverage Map" note="Present / Partial / Missing against the 10 canonical SOW sections">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SECTION_MAP.map(function (s, i) {
                return <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid " + BD, borderRadius: 20, padding: "4px 10px" }}>
                  <span style={{ fontSize: 11, color: DK }}>{s.section}</span><StructPill s={s.status} />
                </div>;
              })}
            </div>
          </Card>
        </div>}

        {tab === "Roles, Assumptions & Dependencies" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
            <Card title="RACI Matrix" note={RACI.filter(function (r) { return r.orphan; }).length + " orphaned workstream(s)"}>
              <STable
                columns={[{ l: "Workstream / Deliverable" }, { l: "Responsible" }, { l: "Accountable" }, { l: "Consulted" }, { l: "Informed" }]}
                rows={RACI.map(function (r) {
                  return [
                    { d: r.item, v: r.item, b: true },
                    { d: r.r, v: r.r },
                    { d: r.a, v: r.a, c: r.orphan ? R : DK, b: r.orphan },
                    { d: r.c, v: r.c },
                    { d: r.i, v: r.i },
                  ];
                })}
              />
            </Card>
            <div>
              <Card title="Assumptions Register">
                <STable
                  columns={[{ l: "Assumption" }, { l: "Owner" }, { l: "Risk if Wrong" }]}
                  rows={ASSUMPTIONS.map(function (a) { return [{ d: a.text, v: a.text }, { d: a.owner, v: a.owner }, { d: a.risk, v: a.risk }]; })}
                />
              </Card>
              <Card title="Dependencies Register" note={DEPENDENCIES.filter(function (d) { return d.owner === "Not named"; }).length + " missing an owner"}>
                <STable
                  columns={[{ l: "Dependency" }, { l: "Owner" }, { l: "Needed By" }, { l: "Status" }]}
                  rows={DEPENDENCIES.map(function (d) {
                    return [
                      { d: d.text, v: d.text },
                      { d: d.owner, v: d.owner, c: d.owner === "Not named" ? R : DK, b: d.owner === "Not named" },
                      { d: d.neededBy, v: d.neededBy, c: d.neededBy === "Not stated" ? R : DK },
                      { d: d.status, v: d.status },
                    ];
                  })}
                />
              </Card>
            </div>
          </div>
          <div style={{ background: CARD, borderLeft: "4px solid " + AMB, borderRadius: "0 6px 6px 0", padding: "12px 16px", fontSize: 12, color: DK, lineHeight: 1.6, marginTop: 4 }}>
            End-User Training and Legacy System Decommission both have work assigned (a Responsible party) but no single Accountable owner on either side; if either slips, there is no named person to escalate to. Two of three dependencies (production data access, the firewall exception) are stated but not ownable as written; without a named owner and date they cannot be tracked against the Dec 1 environment-build milestone they gate.
          </div>
        </div>}

        {tab === "Milestones & Acceptance" && <div>
          <Card title="Milestone Schedule" note={PAYMENT_RECONCILES ? "Payment reconciles to total value" : "Payment does not reconcile - see Finding 3"}>
            <STable
              columns={[{ l: "Milestone" }, { l: "Date" }, { l: "Deliverable(s)" }, { l: "Payment %", a: "right" }, { l: "Amount", a: "right" }, { l: "Objective?", a: "center" }]}
              rows={MILESTONES.map(function (m) {
                return [
                  { d: m.name, v: m.name, b: true },
                  { d: m.date, v: m.date, c: m.date.indexOf("Not stated") === 0 ? R : DK },
                  { d: m.tied, v: m.tied },
                  { d: m.pct + "%", v: m.pct, a: "right" },
                  { d: fF(m.statedAmt), v: m.statedAmt, a: "right" },
                  { d: m.objective ? "Yes" : "No", v: m.objective ? 1 : 0, a: "center", c: m.objective ? BLU : R },
                ];
              })}
            />
          </Card>
          <Card title="Acceptance-Criteria Objectivity Scan">
            <STable
              columns={[{ l: "Milestone / Deliverable" }, { l: "Stated Language" }, { l: "Verdict", a: "center" }, { l: "Objective Rewrite" }]}
              rows={MILESTONES.map(function (m) {
                return [
                  { d: m.name, v: m.name, b: true },
                  { d: m.accept, v: m.accept },
                  { d: m.objective ? "Pass" : "Flag", v: m.objective ? 1 : 0, a: "center", c: m.objective ? BLU : R, b: true },
                  { d: m.objective ? "-" : "Named QC checklist + go/no-go scorecard, reviewed by a named IT Ops reviewer (see Finding 4)", v: m.objective ? "" : "rewrite" },
                ];
              })}
            />
          </Card>
        </div>}

        {tab === "SLAs & KPIs" && <div>
          <Card title="SLA / KPI Register" note="2 metrics named; neither fully measurable as stated">
            <STable
              columns={[{ l: "Metric" }, { l: "Target" }, { l: "Measurement Method" }, { l: "Cadence" }, { l: "Credit / Remedy" }]}
              rows={SLAS.map(function (s) {
                return [
                  { d: s.metric, v: s.metric, b: true },
                  { d: s.target, v: s.target, c: s.target.indexOf("Not stated") === 0 ? R : DK },
                  { d: s.method, v: s.method, c: s.method === "Not stated" ? R : DK },
                  { d: s.cadence, v: s.cadence, c: s.cadence === "Not stated" ? R : DK },
                  { d: s.credit, v: s.credit, c: s.credit === "Not stated" ? R : DK },
                ];
              })}
            />
          </Card>
          <Card title="Expected-vs-Present Read">
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>For a hybrid professional-services engagement with an ongoing 30-day hypercare window post go-live, the SLA pattern bank expects an availability target, an incident/ticket response SLA, and a defect/rework-rate ceiling on delivered artifacts. This SOW states the first two by name but neither carries a measurement method, so as written they cannot actually be enforced or reported against; the defect/rework-rate metric is absent entirely.</p>
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>This is a MEDIUM finding (Finding 7), not a BLOCKING one, because the underlying engagement can still be delivered and accepted via the milestone-based acceptance criteria on the Milestones tab; the SLA gap specifically weakens Lilly's ability to hold Meridian to a service standard during the hypercare period.</p>
          </Card>
        </div>}

        {tab === "Staffing, Rate Card & Payment" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
            <Card title="Rate Card" note={"Blended rate: $" + BLENDED_RATE.toFixed(2) + "/hr (normalized via to_hourly())"}>
              <STable
                columns={[{ l: "Role" }, { l: "Level" }, { l: "Rate" }, { l: "Unit" }, { l: "Qty" }, { l: "Line Total", a: "right" }, { l: "Foots?", a: "center" }]}
                rows={RATE_CARD_CHECKED.map(function (r) {
                  return [
                    { d: r.role, v: r.role, b: true },
                    { d: r.level, v: r.level },
                    { d: fF(r.rate), v: r.rate },
                    { d: r.unit, v: r.unit },
                    { d: r.qty, v: r.qty },
                    { d: fF(r.statedTotal), v: r.statedTotal, a: "right", c: r.ok ? DK : R, b: !r.ok },
                    { d: r.ok ? "Yes" : ("No (expected " + fF(r.expected) + ")"), v: r.ok ? 1 : 0, a: "center", c: r.ok ? BLU : R, b: !r.ok },
                  ];
                })}
              />
              <div style={{ fontSize: 10, color: MUT, marginTop: 8 }}>Foots check: verify_line_math() confirms rate x quantity equals the stated line total for every row. The Senior Data Engineer row fails by {fF(Math.abs(RATE_CARD_CHECKED.filter(function (r) { return r.role === "Senior Data Engineer"; })[0].delta))} (Finding 5). Escalation check: NOT APPLICABLE - single-year term, no option periods stated for escalate() to verify.</div>
            </Card>
            <Card title="Payment Milestone Reconciliation" note={PAYMENT_RECONCILES ? "Reconciles" : fF(Math.abs(PAYMENT_GAP)) + " gap"}>
              <STable
                columns={[{ l: "Milestone" }, { l: "%", a: "right" }, { l: "Stated Amount", a: "right" }, { l: "Expected (% x Total)", a: "right" }]}
                rows={MILESTONES.map(function (m) {
                  var expected = META.totalValue * (m.pct / 100);
                  var ok = Math.abs(expected - m.statedAmt) <= 1;
                  return [
                    { d: m.name, v: m.name },
                    { d: m.pct + "%", v: m.pct, a: "right" },
                    { d: fF(m.statedAmt), v: m.statedAmt, a: "right", c: ok ? DK : R, b: !ok },
                    { d: fF(expected), v: expected, a: "right" },
                  ];
                })}
              />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 8px 0", fontSize: 12, fontWeight: 700, borderTop: "2px solid " + BD, marginTop: 6 }}>
                <span>Milestone sum</span><span style={{ color: PAYMENT_RECONCILES ? BLU : R }}>{fF(MILESTONE_SUM)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 12 }}>
                <span>Stated total contract value</span><span>{fF(META.totalValue)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 12, fontWeight: 700 }}>
                <span>Gap</span><span style={{ color: R }}>{fF(Math.abs(PAYMENT_GAP))} ({(Math.abs(PAYMENT_GAP) / META.totalValue * 100).toFixed(1)}%)</span>
              </div>
            </Card>
          </div>
        </div>}

        {tab === "Change Control & Rewrite Plan" && <div>
          <Card title="Change-Control Trigger Register" note="No section exists in the source document; DRAFT default shown">
            <StateBanner kind="NEEDS_INPUT" msg="This SOW has no change-control section (Finding 1, BLOCKING). The trigger, approval authority, and pricing mechanism below are a DRAFT default from the clause library, not sourced from this document; confirm with the requesting stakeholder before issuing." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Pillar c={AMB} k="Trigger" t="Scope / cost / schedule threshold" d={CC_DRAFT.trigger} />
              <Pillar c={AMB} k="Authority" t="Who approves" d={CC_DRAFT.authority} />
              <Pillar c={AMB} k="Pricing" t="How a change is priced" d={CC_DRAFT.pricing} />
            </div>
          </Card>
          <Card title="Rewrite Map" note="Every finding, the SOW section it lives in, and the fix applied in the rewritten SOW">
            <STable
              columns={[{ l: "Finding" }, { l: "Severity", a: "center" }, { l: "Section" }, { l: "Fix Applied" }]}
              rows={REWRITE_MAP.map(function (rm) {
                var f = FINDINGS.filter(function (x) { return x.id === rm.findingId; })[0];
                return [
                  { d: f.title, v: f.title, b: true },
                  { d: <SevPill s={f.sev} />, v: f.sev === "BLOCKING" ? 0 : f.sev === "HIGH" ? 1 : f.sev === "MEDIUM" ? 2 : 3, a: "center" },
                  { d: rm.section, v: rm.section },
                  { d: rm.fix, v: rm.fix },
                ];
              })}
            />
          </Card>
          <Card title="Next Steps">
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 8px" }}>Once Findings 1 through 5 are resolved in the rewritten SOW, route the document to lilly-contract-review for the separate legal-protection pass (liability, indemnification, IP ownership, and playbook compliance are outside this skill's scope). If this SOW is part of an active sourcing case, hand off to rfp-case-manager to keep the case file current. If the rate card needs an external market comparison beyond the internal footing check performed here, run market-rate-benchmarking on the corrected rate card.</p>
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>This dashboard and the Rewritten_SOW.docx artifact are cross-referenced by section number above; the two are generated from the same PASS_4_REBUILD data and will never disagree on which finding maps to which fix.</p>
          </Card>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Reflects the work as defined; does not assess legal protection - see lilly-contract-review for that lens.</div>
        <div>Company Confidential | Scope & SOW Architect | 2026</div>
      </div>
    </div>
  );
}
