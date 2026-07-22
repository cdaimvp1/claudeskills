import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from "recharts";

// ---------------------------------------------------------------------------
// Sole-Source Challenge and Justification - CANONICAL DASHBOARD (reference implementation)
// LOCKED structure. 4 tabs, identical on every run for every challenge.
// Only the data changes per run. See SKILL.md "Dashboard canonical tab
// skeleton" for the full spec this file implements. House style: Magazine
// Report (Arial body, Georgia titles, dark #212121 header with red rule,
// Lilly-approved palette). Components copied verbatim from
// lilly-brand-assets-1c344a, references/dashboard-components.md.
//
// Data below is ILLUSTRATIVE (a GxP Environmental Monitoring System renewal,
// sole-sourced to an incumbent instrumentation vendor). Clone the structure,
// swap the data. The seven dimension scores and the resulting Defensibility
// Score (3.475) match the worked example in SKILL.md Phase 4 exactly, so the
// prose example and this reference dashboard reconcile.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md. No green
// anywhere; positive signal uses Bold Blue (BLU) / Neutral Sky (OK), never a
// "GRN" token.
const R = "#E1251B", DK = "#212121", BRN = "#521207",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Chart palette: the 6 on-brand hexes from dashboard-components.md.
const PAL = [R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"];

const TABS = ["Challenge and Verdict", "Scorecard", "Alternatives and Price Check", "Evidence and Handoff"];
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

// --- numeric_kernel.py mirror (weighted_score) ------------------------------------------------
// Source of truth: sole-source-challenge-1c344a/numeric_kernel.py (vendored
// from lilly-procurement-kernels). Signature and formula copied verbatim; do
// not hand-edit the math independently of that file (SKILL.md Phase 4,
// "Computation requirement (HARD RULE): do not hand-compute the total").
// Refuses (throws) if the weights do not sum to 1.0 within tolerance, exactly
// like the Python weighted_score()'s WeightSumError.
function weightedScoreJS(scores, weights, tolerance) {
  tolerance = tolerance == null ? 0.001 : tolerance;
  var keys = Object.keys(scores);
  var wkeys = Object.keys(weights);
  if (keys.length !== wkeys.length || !keys.every(function (k) { return wkeys.indexOf(k) >= 0; })) {
    throw new Error("scores and weights must have exactly the same set of keys.");
  }
  var totalWeight = wkeys.reduce(function (a, k) { return a + weights[k]; }, 0);
  if (Math.abs(totalWeight - 1.0) > tolerance) {
    throw new Error("Weights sum to " + totalWeight.toFixed(4) + ", not 1.0 (tolerance " + tolerance + "). Refusing to score against un-footed weights.");
  }
  return keys.reduce(function (sum, k) { return sum + scores[k] * weights[k]; }, 0);
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
  return <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>{columns.map(function (h, i) {
        return <th key={i} style={{ padding: "7px 8px", fontWeight: 600, color: MUT, fontSize: 11, borderBottom: "2px solid " + BD, textAlign: h.a || "left", whiteSpace: "nowrap" }}>{h.l}</th>;
      })}</tr></thead>
      <tbody>{rows.map(function (row, ri) {
        return <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : CARD }}>
          {row.map(function (cell, ci) {
            return <td key={ci} style={{ padding: "6px 8px", fontSize: 12, borderBottom: "1px solid " + BD, textAlign: columns[ci].a || "left", fontWeight: cell.b ? 700 : 400, color: cell.c || DK }}>{cell.d}</td>;
          })}
        </tr>;
      })}</tbody>
    </table>
  </div>;
}
function Tip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div style={{ background: DK, borderRadius: 6, padding: "10px 14px", color: "#fff", fontSize: 12 }}>
    {label && <div style={{ fontWeight: 600, color: LT }}>{label}</div>}
    {payload.map(function (p, i) { return <div key={i}><strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong></div>; })}
  </div>;
}
// Confidence pill (HIGH/MEDIUM/LOW), same color discipline as SevPill; no new hexes.
const CONF = { HIGH: [BLU, OK], MEDIUM: [AMB, WARM], LOW: [R, RISK] };
function ConfBadge({ c }) {
  var col = CONF[c] || [MUT, CARD];
  return <span style={{ color: col[0], background: col[1], border: "1px solid " + col[0] + "40", fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{c}</span>;
}
// Evidence-label pill (VERIFIED/ASSERTED/INFERRED), per Hard Rule 2.
const LABELCOL = { VERIFIED: [BLU, OK], ASSERTED: [AMB, WARM], INFERRED: [MUT, CARD] };
function EvidenceBadge({ l }) {
  var col = LABELCOL[l] || [MUT, CARD];
  return <span style={{ color: col[0], background: col[1], border: "1px solid " + col[0] + "40", fontSize: 9, fontWeight: 700, letterSpacing: "0.03em", padding: "1px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{l}</span>;
}
// Score cell colored by the 0.0-5.0 dimension score (this skill's own scale; see SKILL.md Phase 4).
function scC(v) { return v >= 4.0 ? BLU : v >= 2.75 ? AMB : R; }
function scBg(v) { return v >= 4.0 ? OK : v >= 2.75 ? WARM : RISK; }
function ScoreCell({ v }) {
  return <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, textAlign: "center", color: scC(v), background: scBg(v), borderBottom: "1px solid " + BD }}>{v.toFixed(1)}</td>;
}
// Viability pill (Alternatives register).
const VIAB = { "Not Viable": [MUT, CARD], "Viable With Gaps": [AMB, WARM], "Viable": [BLU, OK] };
function ViabilityPill({ v }) {
  var col = VIAB[v] || [MUT, CARD];
  return <span style={{ color: col[0], background: col[1], border: "1px solid " + col[0] + "40", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 12, whiteSpace: "nowrap" }}>{v}</span>;
}

// Horizontal range gauge (pure CSS, no chart library): a should-cost/market
// low/base/high band with a marker (the sole-source ask price). Reused from
// should-cost-builder's own RangeGauge pattern.
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

// --- ILLUSTRATIVE DATA (replace entirely per run) --------------------------------------------
// NUMBERS RECONCILE: DEFENSIBILITY_SCORE is weightedScoreJS()'s return value
// (mirrors numeric_kernel.py's weighted_score() exactly, never hand-typed),
// and matches the worked example in SKILL.md Phase 4 (3.475).
const META = {
  requestTitle: "GxP Environmental Monitoring System (EMS) - Renewal, 3 Manufacturing Sites",
  supplier: "Vaisala viewLinc (incumbent)",
  category: "Lab and Clinical - Validated Instrumentation / GxP Software",
  mode: "RENEWAL",
  requester: "Site Quality and Validation, Indianapolis",
  estValue: 1240000,
  term: "3 years, annual license plus calibration services",
  asOfDate: "July 22, 2026",
};

const WEIGHTS = {
  unique_capability: 0.20, constraint_basis: 0.20, competition_history: 0.15,
  requirements_separability: 0.15, alt_availability: 0.10,
  urgency_legitimacy: 0.10, price_validation: 0.10,
};

const DIMENSIONS = [
  {
    key: "unique_capability", label: "Unique Capability", weight: WEIGHTS.unique_capability, score: 4.5,
    rationale: "viewLinc is the only continuously-monitoring EMS with completed IQ/OQ/PQ validation across all 3 controlled environments; swapping platforms would trigger a multi-month revalidation before any site could go live again.",
    evidence: "Validation master plan VMP-EMS-2024, Site Quality file (uploaded)", label_kind: "VERIFIED", confidence: "HIGH",
  },
  {
    key: "constraint_basis", label: "Constraint Basis", weight: WEIGHTS.constraint_basis, score: 4.0,
    rationale: "Safety/regulatory qualification: the existing sensor network and 21 CFR Part 11 audit trail are already qualified against this specific instrument base; re-qualifying a different vendor's hardware is a structural, not preferential, constraint.",
    evidence: "21 CFR Part 11 qualification record, Site Quality file (uploaded)", label_kind: "VERIFIED", confidence: "HIGH",
  },
  {
    key: "competition_history", label: "Competition History", weight: WEIGHTS.competition_history, score: 2.0,
    rationale: "No formal market scan was conducted at this renewal. The last competitive review was at original installation in 2019, over 6 years ago; the requester's claim that 'nothing else was considered' is accurate but weak on its own.",
    evidence: "No RFP/RFI on file for this renewal cycle (M365 search, this run)", label_kind: "VERIFIED", confidence: "MEDIUM",
  },
  {
    key: "requirements_separability", label: "Requirements Separability", weight: WEIGHTS.requirements_separability, score: 3.5,
    rationale: "Core continuous monitoring and alarming cannot be split from the validated instrumentation without breaking the qualification. The reporting/analytics layer, however, is architecturally separable and could in principle be competitively sourced at the next platform upgrade.",
    evidence: "System architecture diagram, EMS-ARCH-2024 (uploaded)", label_kind: "VERIFIED", confidence: "MEDIUM",
  },
  {
    key: "alt_availability", label: "Alternative Supplier Availability", weight: WEIGHTS.alt_availability, score: 2.5,
    rationale: "A light 2-search market-check surfaced two plausible alternative EMS platforms (Rees Scientific, Veriteq/GE Vionic). Neither has been seriously evaluated against the validated instrument base; a full supplier-landscape run would firm this up before the next renewal.",
    evidence: "Light market-check research log, this run (2 searches, RESEARCH PENDING for a full shortlist)", label_kind: "ASSERTED", confidence: "LOW",
  },
  {
    key: "urgency_legitimacy", label: "Urgency Legitimacy", weight: WEIGHTS.urgency_legitimacy, score: 3.0,
    rationale: "The renewal date is fixed by the existing license term (external), but the request arrived inside the standard renewal window with adequate lead time; this is a mix, not a hard external emergency.",
    evidence: "License term end date, existing MSA exhibit (uploaded)", label_kind: "VERIFIED", confidence: "HIGH",
  },
  {
    key: "price_validation", label: "Price Validation Substitute", weight: WEIGHTS.price_validation, score: 4.0,
    rationale: "A should-cost-builder range exists for the annual license plus calibration-services fee. The sole-source ask sits within the modeled range, independently validating the price despite no competitive bid.",
    evidence: "should_cost_model.xlsx (should-cost-builder output, consumed this run)", label_kind: "VERIFIED", confidence: "HIGH",
  },
];

const DEFENSIBILITY_SCORE = weightedScoreJS(
  DIMENSIONS.reduce(function (o, d) { o[d.key] = d.score; return o; }, {}),
  WEIGHTS
);

function verdictFor(score) {
  if (score >= 4.0) return { key: "DEFENSIBLE", color: BLU, bg: OK, label: "Defensible" };
  if (score >= 2.75) return { key: "DEFENSIBLE_WITH_MITIGATIONS", color: AMB, bg: WARM, label: "Defensible With Mitigations" };
  return { key: "WEAK", color: R, bg: RISK, label: "Weak, Recommend Competitive Alternative" };
}
const VERDICT = verdictFor(DEFENSIBILITY_SCORE);
const WEAKEST = DIMENSIONS.slice().sort(function (a, b) { return a.score - b.score; })[0];

const MITIGATIONS = [
  { dimension: "Competition History", action: "Document a formal market scan before the next renewal cycle, not just an informal check.", owner: "Site Quality and Validation lead", due: "Before next renewal (24 months)" },
  { dimension: "Alternative Supplier Availability", action: "Formalize the 2 alternative EMS platforms surfaced in this run's light market-check as a standing comparison set; consider a full supplier-landscape run given the contract value.", owner: "Requester", due: "90 days" },
  { dimension: "Requirements Separability", action: "Evaluate decoupling the reporting/analytics layer from the core monitoring at the next platform upgrade so at least part of the scope can be competed.", owner: "IT Procurement category lead", due: "Next major upgrade cycle" },
];

const ALTERNATIVES = [
  { candidate: "Rees Scientific", origin: "market-check", exclusion: "n/a, newly surfaced this run", gap: "No existing validation on Lilly's controlled environments; would require full IQ/OQ/PQ revalidation across 3 sites.", viability: "Viable With Gaps", confidence: "MEDIUM", source: "Web market-check, this run", date: "Jul 2026" },
  { candidate: "Veriteq / GE Vionic", origin: "market-check", exclusion: "n/a, newly surfaced this run", gap: "Comparable sensor network but no current Lilly site integration; migration cost not modeled.", viability: "Viable With Gaps", confidence: "LOW", source: "Web market-check, this run", date: "Jul 2026" },
  { candidate: "ClimateCheck Systems", origin: "supplier-landscape-excluded", exclusion: "insufficient_evidence: no disclosed GxP validation track record (excluded_vendors.csv)", gap: "No public evidence of pharma-grade qualification support.", viability: "Not Viable", confidence: "HIGH", source: "supplier-landscape excluded_vendors.csv (consumed this run)", date: "Jun 2026" },
];

const PRICE_VALIDATION = {
  method: "should-cost", low: 380000, base: 410000, high: 445000, askPrice: 402000, position: "WITHIN",
  source: "should_cost_model.xlsx (should-cost-builder, annual license + calibration services)", date: "Jul 2026", confidence: "HIGH",
};

const RESEARCH_LOG = [
  { query: "GxP environmental monitoring system alternative to Vaisala viewLinc", source: "Web search", date: "Jul 21, 2026", results: 6 },
  { query: "continuous temperature monitoring pharma manufacturing vendor comparison 2026", source: "Web search", date: "Jul 21, 2026", results: 5 },
  { query: "sole-source renewal history, EMS platform", source: "M365 (SharePoint, this tenant)", date: "Jul 21, 2026", results: 0 },
];
const LABEL_COUNTS = DIMENSIONS.reduce(function (o, d) { o[d.label_kind] = (o[d.label_kind] || 0) + 1; return o; }, {});

const SME_ROUTING = [
  { issue: "GxP qualification status of any alternative EMS platform", route_to: "Quality / GxP", reason: "Any alternative must clear a validation review before it can be treated as viable; this skill flags, Quality decides." },
  { issue: "Whether this renewal value re-triggers FRAP review", route_to: "process-navigator", reason: "Threshold and system-requirement questions route to process-navigator's live policy read, not asserted here." },
];

const HANDOFF_JSON = {
  request: { supplier: META.supplier, need_description: META.requestTitle, category: META.category, est_value_usd: META.estValue, term: META.term, mode: META.mode, requester: META.requester, date: META.asOfDate },
  dimension_scores: DIMENSIONS.map(function (d) { return { dimension: d.key, weight: d.weight, score: d.score, label: d.label_kind, confidence: d.confidence, evidence: d.evidence }; }),
  defensibility_score: Number(DEFENSIBILITY_SCORE.toFixed(3)),
  verdict: VERDICT.key === "DEFENSIBLE_WITH_MITIGATIONS" ? "DEFENSIBLE_WITH_MITIGATIONS" : VERDICT.key === "DEFENSIBLE" ? "DEFENSIBLE" : "WEAK_RECOMMEND_COMPETITION",
  mitigations: MITIGATIONS,
  alternatives: ALTERNATIVES.map(function (a) { return { candidate_name: a.candidate, reassessed_viability: a.viability, source: a.source }; }),
  recommended_next_action: "Close the 3 mitigations above before the next renewal; no competitive process required this cycle given the DEFENSIBLE WITH MITIGATIONS verdict.",
  price_validation: { method: PRICE_VALIDATION.method, source: PRICE_VALIDATION.source, band_low: PRICE_VALIDATION.low, band_high: PRICE_VALIDATION.high, sole_source_price: PRICE_VALIDATION.askPrice, position: "within" },
  sme_routing: SME_ROUTING,
  provenance: { generated_at: META.asOfDate, generated_by: "sole-source-challenge-1c344a", suite: "v10.6.6" },
};

const CHART_DATA = DIMENSIONS.map(function (d) { return { name: d.label, contribution: Number((d.score * d.weight).toFixed(3)) }; });

// ---------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// ---------------------------------------------------------------------------------------------
export default function SoleSourceChallengeDashboard() {
  var _t = useState("Challenge and Verdict"); var tab = _t[0]; var setTab = _t[1];

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#FFFFFF", minHeight: "100vh", color: DK, fontSize: 13 }}>
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Sole-Source Challenge and Justification</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>{META.requestTitle}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>{META.asOfDate} | {META.category}<br />Supplier: {META.supplier} | Mode: {META.mode}</div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid " + BD, padding: "0 24px", display: "flex", overflowX: "auto" }}>
        {TABS.map(function (t) {
          var active = t === tab;
          return <button key={t} onClick={function () { setTab(t); }} style={{ padding: "10px 14px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? R : MUT, background: "transparent", border: "none", borderBottom: active ? "2.5px solid " + R : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>{t}{NEEDS_INPUT[t] ? <span style={{ color: AMB, marginLeft: 4 }}>*</span> : null}</button>;
        })}
      </div>

      <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {tab === "Challenge and Verdict" && <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ background: VERDICT.bg, border: "1px solid " + VERDICT.color + "55", borderLeft: "5px solid " + VERDICT.color, borderRadius: 8, padding: "14px 18px", flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: VERDICT.color, textTransform: "uppercase" }}>Verdict</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: DK, marginTop: 4 }}>{VERDICT.label}</div>
              <div style={{ fontSize: 12, color: DK, marginTop: 4, lineHeight: 1.5 }}>Recommendation only, not an approval. Route the formal sole-source sign-off through Lilly's sourcing governance process.</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Metric label="Defensibility Score" value={DEFENSIBILITY_SCORE.toFixed(2) + " / 5.0"} sub="kernel weighted_score()" accent={VERDICT.key === "WEAK"} good={VERDICT.key === "DEFENSIBLE"} warn={VERDICT.key === "DEFENSIBLE_WITH_MITIGATIONS"} />
            <Metric label="Weakest Dimension" value={WEAKEST.label} sub={WEAKEST.score.toFixed(1) + " / 5.0"} warn />
            <Metric label="Alternatives Identified" value={String(ALTERNATIVES.length)} sub="see Alternatives tab" />
            <Metric label="Price Validation" value={PRICE_VALIDATION.confidence} sub={PRICE_VALIDATION.method} good={PRICE_VALIDATION.confidence === "HIGH"} />
            <Metric label="Mode" value={META.mode} sub={"Est. " + f$(META.estValue)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card title="Request Summary">
              <div style={{ fontSize: 12, color: DK, lineHeight: 1.8 }}>
                <div><b>Need:</b> {META.requestTitle}</div>
                <div><b>Proposed supplier:</b> {META.supplier}</div>
                <div><b>Category:</b> {META.category}</div>
                <div><b>Estimated value:</b> {f$(META.estValue)}, {META.term}</div>
                <div><b>Requester:</b> {META.requester}</div>
                <div><b>Stated urgency:</b> Renewal date fixed by existing license term; adequate lead time.</div>
              </div>
            </Card>
            <Card title="Verdict Read">
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>The case is anchored by two strong dimensions: <b>Unique Capability</b> (4.5, the only validated instrument base across all 3 sites) and <b>Constraint Basis</b> (4.0, a genuine safety/regulatory qualification lock-in), together carrying 40% of the weighted total. <b>Price Validation</b> (4.0) independently confirms the renewal ask is not being taken on faith.</p>
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>What keeps this from a clean DEFENSIBLE verdict is <b>{WEAKEST.label}</b> ({WEAKEST.score.toFixed(1)}): no formal market scan has been run since original installation in 2019, and the light market-check this run surfaced two plausible alternatives that have not been seriously evaluated. The three mitigations on the Evidence and Handoff tab close this gap before the next renewal rather than blocking this one.</p>
            </Card>
          </div>
        </div>}

        {tab === "Scorecard" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Seven-Dimension Scorecard" note="Weights sum to 1.00, kernel-verified">
              <STable
                columns={[{ l: "Dimension" }, { l: "Weight", a: "center" }, { l: "Score", a: "center" }, { l: "Evidence" }, { l: "Label", a: "center" }]}
                rows={DIMENSIONS.map(function (d) {
                  return [
                    { d: d.label, b: true },
                    { d: (d.weight * 100).toFixed(0) + "%", a: "center" },
                    { d: d.score.toFixed(1), a: "center", c: scC(d.score), b: true },
                    { d: d.evidence },
                    { d: <EvidenceBadge l={d.label_kind} />, a: "center" },
                  ];
                })}
              />
            </Card>
            <Card title="Weighted Contribution by Dimension">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={CHART_DATA} layout="vertical" margin={{ top: 8, right: 30, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BD} />
                  <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 9 }} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="contribution">
                    <LabelList dataKey="contribution" position="right" formatter={function (v) { return v.toFixed(2); }} style={{ fontSize: 9, fill: DK }} />
                    {CHART_DATA.map(function (d, i) { return <Cell key={i} fill={PAL[i % PAL.length]} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card title="Scorecard Read">
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>The two weakest dimensions are <b>Competition History</b> (2.0) and <b>Alternative Supplier Availability</b> (2.5), together the reason the total lands in the DEFENSIBLE WITH MITIGATIONS band rather than clean DEFENSIBLE. Both are evidence gaps, not structural weaknesses: the underlying constraint (validated instrumentation, safety qualification) is genuinely strong, but the case has not been formally re-tested against the market since 2019.</p>
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>What would move them: a documented market scan (even a lightweight 3-quote comparison, not necessarily a full RFP) would lift Competition History toward 4.0, and a full supplier-landscape run on the two surfaced alternatives (Rees Scientific, Veriteq/GE Vionic) would let Alternative Supplier Availability move from ASSERTED/LOW confidence to a VERIFIED, evidence-backed score.</p>
          </Card>
        </div>}

        {tab === "Alternatives and Price Check" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Card title="Alternatives Register" note="From supplier-landscape excluded_vendors.csv plus this run's light market-check">
              <STable
                columns={[{ l: "Candidate" }, { l: "Origin" }, { l: "Capability Gap" }, { l: "Reassessed Viability", a: "center" }, { l: "Confidence", a: "center" }]}
                rows={ALTERNATIVES.map(function (a) {
                  return [
                    { d: a.candidate, b: true },
                    { d: a.origin },
                    { d: a.gap },
                    { d: <ViabilityPill v={a.viability} />, a: "center" },
                    { d: <ConfBadge c={a.confidence} />, a: "center" },
                  ];
                })}
              />
              <div style={{ fontSize: 10, color: MUT, marginTop: 8 }}>Full audit trail, including original exclusion reasons where sourced from supplier-landscape, in alternatives_register.csv.</div>
            </Card>
            <Card title="Price Validation" note={PRICE_VALIDATION.source}>
              <RangeGauge low={PRICE_VALIDATION.low} base={PRICE_VALIDATION.base} high={PRICE_VALIDATION.high} marker={PRICE_VALIDATION.askPrice} markerLabel="Ask" markerColor={BLU} />
              <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "10px 0 0" }}>The sole-source ask ({f$(PRICE_VALIDATION.askPrice)}/yr) sits <b>within</b> the should-cost range ({f$(PRICE_VALIDATION.low)} to {f$(PRICE_VALIDATION.high)}), independently validating the price without a competitive bid. Confidence: <ConfBadge c={PRICE_VALIDATION.confidence} />.</p>
            </Card>
          </div>
          <Card title="Alternatives Read">
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: "0 0 10px" }}>None of the three candidates in this register is currently a viable substitute this cycle. ClimateCheck Systems was already excluded by a prior supplier-landscape run for insufficient GxP validation evidence, a finding this challenge re-affirms rather than re-litigates. Rees Scientific and Veriteq/GE Vionic are technically plausible but unevaluated: both carry real revalidation cost that has not been modeled, so neither displaces the incumbent's Unique Capability and Constraint Basis scores today.</p>
            <p style={{ fontSize: 12, color: DK, lineHeight: 1.6, margin: 0 }}>This is exactly the evidence gap the Competition History and Alternative Supplier Availability mitigations target: formalizing this comparison, ideally via a full supplier-landscape run given the {f$(META.estValue)} contract value, converts these ASSERTED, LOW-confidence entries into a VERIFIED comparison set before the next renewal.</p>
          </Card>
        </div>}

        {tab === "Evidence and Handoff" && <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card title="Research Log" note={LABEL_COUNTS.VERIFIED + " VERIFIED, " + (LABEL_COUNTS.ASSERTED || 0) + " ASSERTED, " + (LABEL_COUNTS.INFERRED || 0) + " INFERRED"}>
              {RESEARCH_LOG.map(function (r, i) {
                return <div key={i} style={{ padding: "8px 0", borderBottom: i < RESEARCH_LOG.length - 1 ? "1px solid " + BD : "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{r.query}</div>
                  <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{r.source}, {r.date} ({r.results} usable results)</div>
                </div>;
              })}
              <div style={{ marginTop: 10 }}>
                <StateBanner kind="RESEARCH_PENDING" msg="The light market-check (2 searches) meets this skill's own research-effort floor but is not a substitute for a full supplier-landscape shortlist; Alternative Supplier Availability stays LOW confidence until one is run." />
              </div>
            </Card>
            <Card title="SME Routing and Mitigations">
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>SME Routing</div>
                {SME_ROUTING.map(function (s, i) {
                  return <div key={i} style={{ padding: "6px 0", borderBottom: i < SME_ROUTING.length - 1 ? "1px solid " + BD : "none" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{s.issue}</div>
                    <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>Route to: {s.route_to}. {s.reason}</div>
                  </div>;
                })}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Mitigations (DEFENSIBLE WITH MITIGATIONS verdict)</div>
                {MITIGATIONS.map(function (m, i) {
                  return <div key={i} style={{ padding: "6px 0", borderBottom: i < MITIGATIONS.length - 1 ? "1px solid " + BD : "none" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DK }}>{m.dimension}</div>
                    <div style={{ fontSize: 11, color: DK, marginTop: 2 }}>{m.action}</div>
                    <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>Owner: {m.owner} | Due: {m.due}</div>
                  </div>;
                })}
              </div>
            </Card>
          </div>
          <Card title="What This Feeds" note="Cross-Skill Handoffs">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              <Pillar c={BLU} k="1" t="process-navigator" d="This handoff is the evidence a later run cites as 'Filed' for the Sole-Source Justification Captured governance row." />
              <Pillar c={BRN} k="2" t="commercial-negotiation-prep" d="The price-validation band becomes the negotiation anchor since there is no competitive tension to lean on." />
              <Pillar c={R} k="3" t="executive-summary-package" d="The verdict and mitigations populate the governance fields of the plain ATC/ATS submission." />
            </div>
          </Card>
          <Card title="Handoff JSON (preview)" note="sole_source_justification_handoff.json">
            <div style={{ overflowX: "auto" }}>
              <pre style={{ background: DK, color: "#fff", fontSize: 10, lineHeight: 1.5, padding: 14, borderRadius: 6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(HANDOFF_JSON, null, 2)}</pre>
            </div>
          </Card>
        </div>}

      </div>

      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Recommendation and evidence trail, not an approval. Reflect-only: never writes back to ARIA, Ariba, LEAH, Aravo, ServiceNow, or SAP.</div>
        <div>Eli Lilly and Company - Confidential | Sole-Source Challenge and Justification | 2026</div>
      </div>
    </div>
  );
}
