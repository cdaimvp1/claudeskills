import { useState } from "react";

// ---------------------------------------------------------------------------
// Negotiation Simulator - POSITION PLAYBOOK (reference artifact)
// Reference implementation for the single item approved in the 2026-07 suite
// review: "Deal/Negotiate - Position playbook (5-persona tone toggle)". See
// the "Position Playbook (reference artifact)" section of SKILL.md for the
// spec this file implements. Offered ONCE, optionally, at the end of Step 1
// setup (Setup, all modes) as a scannable pre-session take-away. It does NOT
// turn this skill into a tabbed dashboard: the live roleplay/observe/drill
// and the coaching debrief stay chat-native and low-artifact exactly as
// before (SUITE SPECIFICS: "low-artifact and chat-based to stay light on
// context"). This is one optional, self-contained view, not a new tab set.
//
// House style: Magazine Report (Arial body, Georgia titles, dark #212121
// header with red rule, Lilly-approved palette). Components (Metric, Card)
// copied verbatim from lilly-brand-assets-1c344a, references/
// dashboard-components.md. TierPill mirrors SevPill's exact structure per
// that file's own guidance ("PrioPill... mirrors the severity color logic");
// no new component pattern invented. Colors are the canonical suite tokens
// only (brand-colors.md): no green, no off-palette purple/teal, no invented
// hex.
//
// Data below is ILLUSTRATIVE (a Cloud ERP renewal against a fictional
// vendor, "NorthPeak Cloud ERP", following this skill's own Scenario
// Template 4: Cloud ERP - Complex Multi-Issue). Positions and playbook
// references are grounded in lilly-contract-review's playbook.md (Audit
// Rights S11, Data Protection S9-10, Termination S16, Fees/Payment S3).
// Clone the structure, swap the data per run. Market-acceptance figures
// follow negotiation-playbook-learning's own "X% (N=count)" convention and
// STRONG/WATCH/WEAK threshold logic (>=60% strong, 35-59% watch, <35% weak
// here; see benchColor below for why the breakpoints differ from that
// skill's own 70/40 split). One position (Pricing Transparency) is shown
// with NO benchmark, "Not available", to demonstrate the anti-fabrication
// rule this skill and G7 both require: a thin or missing data point is
// labeled, never invented.
// ---------------------------------------------------------------------------

// Color tokens: copied verbatim from dashboard-components.md (BRN omitted, unused on this panel).
const R = "#E1251B", DK = "#212121",
  CARD = "#E4EBF1", WARM = "#FFF0D8", RISK = "#FDE8E5", OK = "#D4E5F7", BD = "#E4EBF1",
  MUT = "#8A969E", LT = "#8A969E", BLU = "#0F3A85", AMB = "#B45309";

// Chart palette token used for the Curious persona (Vibrant Azure), the 6th
// entry of the canonical 6-color chart palette in dashboard-components.md.
const AZURE = "#99BFE5";

function fP(v) { return v == null ? "" : v.toFixed(0) + "%"; }

// --- Shared components (verbatim from dashboard-components.md) -----------------------------
function Metric({ label, value, sub, accent, warn, good }) {
  var bar = accent ? R : warn ? R : good ? BLU : BD;
  return <div style={{ background: accent ? WARM : warn ? RISK : good ? OK : "#fff", borderRadius: 8, padding: "14px 16px", borderLeft: "4px solid " + bar, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: accent ? R : LT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
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

// --- Position-tier taxonomy (adapts SevPill's exact pattern to this skill's own vocabulary:
// Hard Stop / Hold Firm / Trade Chip, drawn from lilly-contract-review's playbook.md language) ---
const TIER_C = { "Hard Stop": R, "Hold Firm": BLU, "Trade Chip": AMB };
const TIER_BG = { "Hard Stop": RISK, "Hold Firm": OK, "Trade Chip": WARM };
function TierPill({ t }) {
  return <span style={{ color: TIER_C[t], background: TIER_BG[t], border: "1px solid " + TIER_C[t] + "40", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{t.toUpperCase()}</span>;
}

// --- Market-acceptance color thresholds. This reads a 0-100% acceptance rate, not the
// suite's canonical 0.0-5.0 score, so per dashboard-components.md ("adjust these breakpoints
// locally and say so") it gets its own breakpoints. Still only the three canonical status
// tokens (POS/WARN/NEG = BLU/AMB/R from brand-colors.md); no new hex introduced. ---
function benchColor(pct) { return pct == null ? MUT : pct >= 60 ? BLU : pct >= 35 ? AMB : R; }
function benchBg(pct) { return pct == null ? CARD : pct >= 60 ? OK : pct >= 35 ? WARM : RISK; }

function Confidence({ level }) {
  return <span style={{ fontSize: 10, color: MUT, border: "1px solid " + BD, borderRadius: 20, padding: "2px 8px", marginLeft: 6, whiteSpace: "nowrap" }}>Confidence: {level}</span>;
}

// --- PERSONA LABELS (5-persona tone toggle; live-repaints the same substance, never the
// position, argument, or fallback). Colors are 5 distinct canonical hexes, no purple. ---
const PERSONAS = ["Standard", "Collaborative", "Aggressive", "Curious", "Astonished"];
const PERSONA_COLORS = { Standard: MUT, Collaborative: BLU, Aggressive: R, Curious: AZURE, Astonished: AMB };

// --- DATA: illustrative Cloud ERP renewal (Scenario Template 4) ---------------------------
const SUPPLIER = "NorthPeak Cloud ERP";
const CONTEXT = "Cloud subscription renewal, multi-year digital transformation. Migration cost $50M+. Difficulty: Aggressive. Profile: precedent-focused, data-driven, reports to Legal (risk-focused), strong leverage (platform lock-in) - but NorthPeak also needs Lilly as a reference customer while under its own regulatory pressure, which is the counter-lever.";

const POSITIONS = [
  {
    id: 1,
    title: "Audit Rights",
    tier: "Hard Stop",
    ref: "Playbook S11 (Audit Rights)",
    position: "Lilly retains a direct right to audit NorthPeak's records and systems relevant to this engagement, with reasonable notice. SOC 2 Type II and ISO 27001 attestations may supplement but do not replace that right. Frequency capped at once per 12 months absent a triggering incident.",
    args: [
      "Playbook S11 draws this line explicitly: third-party attestation may supplement, never replace, Lilly's direct audit right.",
      "At $50M+ of platform lock-in, Lilly's downside from an unaudited control failure is severe; a capped, reasonable-notice right is proportionate to that exposure, not excessive.",
      "NorthPeak's own SOC 2 report already discloses the scope Lilly is asking to verify directly; this is a right to confirm, not a new obligation."
    ],
    pushback: "Our enterprise customers all accept SOC 2 and ISO 27001 in place of direct audit; extending direct-audit rights to every customer isn't operationally scalable for us.",
    rebuttal: "A direct audit right capped at once per 12 months with reasonable notice does not create the operational burden of an open-ended right. Lilly is asking for the standard playbook floor, not a bespoke enhancement.",
    fallback: "Direct audit right retained, but exercised only if the SOC 2 or ISO 27001 report shows a qualified opinion or a control exception; otherwise the certifications stand for the year.",
    benchmark: { pct: 72, n: 19, source: "negotiation-playbook-learning, IT SaaS/cloud category", asOf: "Jun 2026", confidence: "Medium" },
    personas: {
      Standard: "Per our playbook, we require a direct audit right over the systems and records relevant to this engagement, with reasonable notice. SOC 2 and ISO 27001 can supplement, not replace it.",
      Collaborative: "We'd like to keep this simple for both teams: your SOC 2 and ISO 27001 reports cover most of what we need, and we just want to retain a light, reasonable-notice audit right as a backstop, capped at once a year.",
      Aggressive: "Direct audit rights are non-negotiable at this contract value. Certifications alone do not satisfy our risk posture. Retain the clause as drafted or we escalate.",
      Curious: "Help us understand what makes a direct audit right operationally harder for you than the SOC 2 process you already run every year. Is it the notice window, the frequency, or something else?",
      Astonished: "We're surprised NorthPeak is asking Lilly to give up a direct audit right at this contract size. For a platform this central to our operations, that's a bigger ask than it might look on paper."
    }
  },
  {
    id: 2,
    title: "Data Sovereignty and Breach Notification",
    tier: "Hold Firm",
    ref: "Playbook S9-10 (Data Protection and Privacy)",
    position: "Lilly-designated data must be hosted in a named, fixed set of regions with no unilateral relocation, and NorthPeak must notify Lilly of a confirmed breach within 24 hours of confirmation, consistent with Lilly's internal escalation timeline.",
    args: [
      "The playbook floor is 72 hours or less; 24 hours sits inside that floor and matches Lilly's own internal incident-response SLA, so downstream reporting isn't bottlenecked by the vendor.",
      "Unrestricted hosting-location flexibility creates a data-residency exposure Legal cannot pre-clear once and forget; a fixed region list keeps the compliance footprint known.",
      "NorthPeak's own public trust center already commits to a small number of named regions; codifying that in contract restates an existing commitment, it does not add a new one."
    ],
    pushback: "We need flexibility to shift workloads across our global data centers for performance and failover; locking to named regions limits our ability to route around outages.",
    rebuttal: "Failover within a pre-approved region list solves the same problem without opening residency risk. Add a secondary named region for failover rather than open-ended flexibility.",
    fallback: "Primary plus one pre-approved secondary region, with 5 business days' advance notice before any change to the named list. Breach notification at 48 hours if 24 cannot be met, with an interim 'confirmed incident, assessment ongoing' notice at 24 hours.",
    benchmark: { pct: 44, n: 16, source: "market-rate-benchmarking web read, comparable cloud-ERP renewals", asOf: "Jun 2026", confidence: "Medium" },
    personas: {
      Standard: "We require Lilly data to stay within a named set of regions, with no unilateral relocation, and breach notification within 24 hours of confirmation.",
      Collaborative: "We know infrastructure flexibility matters to you, so let's agree on a short, named list of regions, including a failover region, so you still have resilience and we still know exactly where our data lives.",
      Aggressive: "Open-ended hosting flexibility is not something Legal will clear. Lock the region list in the contract and hold to a 24-hour breach notification. This is not a point we will trade away.",
      Curious: "What's driving the need for unrestricted region flexibility, is it latency, cost, or disaster recovery? If it's DR, would a named secondary region solve that without going fully open-ended?",
      Astonished: "We're a little surprised a vendor processing this much of our operational data doesn't already commit to a fixed region list; that's usually table stakes at this contract size."
    }
  },
  {
    id: 3,
    title: "Termination for Convenience",
    tier: "Hold Firm",
    ref: "Playbook S16 (Termination)",
    position: "Lilly retains the right to terminate for convenience with 30-day written notice. NorthPeak's request to remove termination for convenience entirely, or lock Lilly into the full multi-year term, is not acceptable given the size of the platform commitment.",
    args: [
      "The playbook floor requires a termination-for-convenience right; removing it entirely is listed as Not Acceptable regardless of deal size.",
      "At $50M+ of platform investment, Lilly is already accepting substantial switching-cost lock-in; removing the one contractual release valve compounds that risk instead of balancing it.",
      "A termination-for-convenience right with reasonable notice does not threaten a well-performing relationship; it only matters if the relationship deteriorates, which is exactly when Lilly needs it."
    ],
    pushback: "This is a multi-year platform investment on our side too; removing termination for convenience protects the mutual commitment behind the discounted multi-year pricing.",
    rebuttal: "The pricing commitment and the exit right are two different questions. Lilly can commit to the volume and pricing structure for the term while still holding a termination-for-convenience right, paired with an early-termination fee that compensates for the specific multi-year discount if exercised.",
    fallback: "60-day notice (instead of 30) plus an early-termination fee equal to a defined percentage of the remaining committed fees if termination for convenience is exercised in years 1 or 2.",
    benchmark: { pct: 28, n: 22, source: "negotiation-playbook-learning, platform/ERP subcategory", asOf: "Jun 2026", confidence: "Medium" },
    personas: {
      Standard: "We require a termination-for-convenience right with 30-day notice. Removing it entirely is not something we can accept regardless of deal size.",
      Collaborative: "We understand the multi-year pricing reflects a mutual commitment. We're glad to structure an early-termination fee that protects that commitment while still keeping a standard termination-for-convenience right in place.",
      Aggressive: "No termination for convenience is a non-starter at this contract value. Restore a 30-day right or the multi-year pricing structure is off the table.",
      Curious: "Is the concern here really about losing the multi-year revenue, or about losing the reference-customer relationship? Those call for different solutions; an early-termination fee solves the first.",
      Astonished: "We're surprised to see a request to remove termination for convenience altogether on a contract this size. Most of our vendor relationships at this scale still carry a standard exit right, just with an appropriate fee attached."
    }
  },
  {
    id: 4,
    title: "Pricing Transparency on Future Modules",
    tier: "Trade Chip",
    ref: "Playbook S3 (Fees and Payment) - transparency principle, not a Hard Stop",
    position: "NorthPeak discloses list price and the applicable discount methodology for any future module Lilly adds during the term, rather than negotiating each addition from an undisclosed base. Any cross-module bundling discount is itemized, not blended.",
    args: [
      "Playbook S3 already requires rate escalation to be capped and tied to a transparent index; opaque module pricing defeats that same transparency principle at the point of expansion.",
      "Lilly is a reference-scale customer for NorthPeak; a standing disclosure norm removes the need to renegotiate pricing transparency from scratch every time a new module is added.",
      "Itemized bundling discounts let Lilly evaluate each module on its own economics instead of accepting a blended number that could mask an above-market component."
    ],
    pushback: "Our module pricing is customized per customer based on scale and use case; a published rate card doesn't reflect the value we deliver to an account like yours.",
    rebuttal: "Custom pricing is fine. The ask is disclosure of the methodology and base list price behind the custom number, not a fixed public rate card; that is a lower bar than what's being resisted.",
    fallback: "NorthPeak discloses list price and discount percentage (not full methodology) for any module added in the first 24 months of the term, with itemized, not blended, bundling.",
    benchmark: { pct: null, n: null, source: "", asOf: "", confidence: "Not available", note: "No comparable outcome records for module-pricing-transparency clauses yet. RESEARCH PENDING; treat this position qualitatively, not against a firm rate." },
    personas: {
      Standard: "We're asking for disclosed list pricing and discount methodology for any module added during the term, with bundling discounts itemized rather than blended.",
      Collaborative: "We'd like a simple standing agreement: when we add a module, we see the list price and discount basis up front, so neither side has to renegotiate transparency every time. That should be easy given the reference relationship we have.",
      Aggressive: "Blended, undisclosed module pricing is not acceptable going forward. Every future module needs a disclosed list price and discount percentage, itemized, not folded into a bundle.",
      Curious: "Would it work to share the list price and discount percentage, without the full internal methodology, just so we can evaluate each module's economics on its own?",
      Astonished: "We're a bit surprised pricing on future modules would stay opaque given how much of our roadmap already runs through your platform; that level of transparency is usually the norm for an account at our scale."
    }
  },
];

const TIER_COUNTS = ["Hard Stop", "Hold Firm", "Trade Chip"].map(t => ({ t, n: POSITIONS.filter(p => p.tier === t).length }));
const BENCHMARKED_N = POSITIONS.filter(p => p.benchmark.pct != null).length;
const RANKED = [...POSITIONS].sort((a, b) => (b.benchmark.pct ?? -1) - (a.benchmark.pct ?? -1));

// --- MAIN COMPONENT ---------------------------------------------------------------------
export default function PositionPlaybook() {
  const [persona, setPersona] = useState("Standard");

  return (
    <div style={{ fontFamily: "Arial,sans-serif", background: "#F8FAFC", minHeight: "100vh", color: DK }}>
      {/* Header bar */}
      <div style={{ background: DK, padding: "12px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: R, borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: R }}>Negotiation Simulator - Pre-Session Artifact</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 1 }}>Position Playbook: {SUPPLIER} Renewal</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: MUT, textAlign: "right" }}>4 positions - Aggressive difficulty - Scenario Template 4</div>
        </div>
      </div>

      <div style={{ padding: "18px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {/* Simulation disclaimer (Rule 1) */}
        <div style={{ background: CARD, border: "1px solid " + BD, borderLeft: "4px solid " + MUT, borderRadius: 8, padding: "12px 16px", marginBottom: 14, fontSize: 12, color: DK, lineHeight: 1.6 }}>
          <b>Simulation prep, not fact.</b> Positions, pushback, and benchmarks below model {SUPPLIER}'s likely posture from the MPT playbook, market norms, and (where cited) recorded negotiation history. These are NOT {SUPPLIER}'s actual stated positions. {CONTEXT}
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          <Metric label="Positions in Playbook" value={POSITIONS.length} />
          <Metric label="Hard Stop" value={TIER_COUNTS[0].n} warn sub="Never concede without escalation" />
          <Metric label="Hold Firm" value={TIER_COUNTS[1].n} good sub="Anchor; move only via fallback" />
          <Metric label="Trade Chip" value={TIER_COUNTS[2].n} accent sub="Lower priority; tradeable early" />
          <Metric label="Benchmarked" value={BENCHMARKED_N + " of " + POSITIONS.length} sub="Has a market-acceptance read" />
        </div>

        {/* LEFT: market-acceptance viz / RIGHT: opening posture narrative */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 14, marginBottom: 14 }}>
          <Card title="Market Acceptance by Position" note="negotiation-playbook-learning + market-rate-benchmarking">
            {RANKED.map(p => {
              const pct = p.benchmark.pct;
              return (
                <div key={p.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, gap: 8 }}>
                    <span style={{ fontWeight: 700, color: DK }}>{p.title}</span>
                    <span style={{ color: benchColor(pct), fontWeight: 700, whiteSpace: "nowrap" }}>{pct == null ? "Not available" : fP(pct) + " (N=" + p.benchmark.n + ")"}</span>
                  </div>
                  <div style={{ background: BD, borderRadius: 20, height: 8, overflow: "hidden" }}>
                    {pct != null && <div style={{ width: pct + "%", height: "100%", background: benchColor(pct), borderRadius: 20 }} />}
                  </div>
                  <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>
                    {pct == null ? p.benchmark.note : p.benchmark.source + ", as of " + p.benchmark.asOf}
                  </div>
                </div>
              );
            })}
          </Card>
          <Card title="Opening Posture and Sequencing">
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>
              {SUPPLIER} enters this renewal with strong leverage (migration cost exceeds $50M) but also needs Lilly as a reference account while it works through its own regulatory pressure; that mutual need is the lever to use. Open on <b>Audit Rights</b>, framed as confirming {SUPPLIER}'s own SOC 2 and ISO 27001 disclosures rather than a new demand: it is a Hard Stop for Lilly, but historically the easiest of the four to land (72%, N=19). Hold <b>Data Sovereignty and Breach Notification</b> as a compliance floor, not a negotiable ask, and be ready to trade the secondary-region fallback if {SUPPLIER} pushes on hosting flexibility. <b>Termination for Convenience</b> is the hardest position in this set (28%, N=22) precisely because it cuts against {SUPPLIER}'s multi-year pricing structure; plan to concede the notice window (30 to 60 days) and attach an early-termination fee before {SUPPLIER} forces the issue, rather than holding the line to a stalemate. Save <b>Pricing Transparency on future modules</b> as the trade chip: it is not playbook-mandated, so it is the natural item to give ground on late in the session in exchange for movement on Termination for Convenience.
            </p>
          </Card>
        </div>

        {/* Persona tone toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Argument Tone:</span>
          {PERSONAS.map(p => (
            <button key={p} onClick={() => setPersona(p)} style={{ padding: "6px 14px", borderRadius: 20, border: persona === p ? "2px solid " + PERSONA_COLORS[p] : "1px solid " + BD, background: persona === p ? "#fff" : "#fff", fontWeight: persona === p ? 700 : 400, color: persona === p ? PERSONA_COLORS[p] : MUT, cursor: "pointer", fontSize: 12 }}>{p}</button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: MUT, marginBottom: 16 }}>Each card below shows the same position, arguments, pushback, rebuttal, and fallback. Toggle the tone above to see how you might frame the opening line in the room; the substance and the bottom line never change, only the delivery.</p>

        {/* Position cards */}
        {POSITIONS.map(p => (
          <div key={p.id} style={{ border: "1px solid " + BD, background: "#fff", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ background: DK, color: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14 }}>{p.title}</span>
                <TierPill t={p.tier} />
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.12)", padding: "2px 8px", borderRadius: 10 }}>
                  {p.benchmark.pct == null ? "Acceptance: not available" : "Acceptance: " + fP(p.benchmark.pct) + " (N=" + p.benchmark.n + ")"}
                </span>
                <Confidence level={p.benchmark.confidence} />
              </div>
            </div>
            <div style={{ padding: 16, fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontSize: 10, color: MUT, marginBottom: 10 }}>{p.ref}</div>

              {/* Persona-framed argument */}
              <div style={{ background: CARD, borderRadius: 6, padding: "10px 14px", marginBottom: 10, borderLeft: "4px solid " + PERSONA_COLORS[persona] }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: PERSONA_COLORS[persona], marginBottom: 4 }}>{persona} Tone</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{p.personas[persona]}</div>
              </div>

              <div style={{ marginBottom: 8 }}><span style={{ color: BLU, fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>Position: </span>{p.position}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: MUT, fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>Arguments</span>
                {p.args.map((a, j) => <div key={j} style={{ display: "flex", gap: 6, marginTop: 3 }}><span style={{ color: R, flexShrink: 0 }}>{">"}</span><span>{a}</span></div>)}
              </div>
              <div style={{ marginBottom: 8 }}><span style={{ color: AMB, fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>Likely Pushback: </span>{p.pushback}</div>
              <div style={{ marginBottom: 8 }}><span style={{ color: DK, fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>Rebuttal: </span>{p.rebuttal}</div>
              <div><span style={{ color: LT, fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>Fallback: </span>{p.fallback}</div>
            </div>
          </div>
        ))}

        <div style={{ fontSize: 11, color: MUT, marginTop: 4 }}>Generated for pre-session prep at the end of Setup. Enter Practice, Observe, or Drill when ready; the difficulty and counterparty profile carry over from this Setup.</div>
      </div>

      {/* Footer */}
      <div style={{ background: DK, padding: "10px 24px", display: "flex", justifyContent: "space-between", fontSize: 10, color: MUT }}>
        <div>Simulation prep, not {SUPPLIER}'s actual positions</div>
        <div>Company Confidential | Negotiation Simulator | 2026</div>
      </div>
    </div>
  );
}
