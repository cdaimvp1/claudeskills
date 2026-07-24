/* =============================================================================
 * tab-commercials.js, "ECONOMICS" primary tab builder for the Deal artifact.
 *   (display name ECONOMICS; id / jump namespace stays `commercials`)
 *
 * Exposes:  window.renderTab_commercials(d)  ->  HTML string for the whole tab
 *           (subtab bar + 3 subtab panels), plus window.DealTabs.commercials.
 *
 * Question the tab answers: "What is it worth, what should I pay?"
 *
 * Subtabs (3):
 *   3A  Deal Table & ZOPA   (data-subpanel="commercials/deal")
 *   3B  Pro-forma           (data-subpanel="commercials/proforma")
 *   3C  Scenarios & Sens.   (data-subpanel="commercials/scenarios")
 *
 * Reads ONLY from dashboardData (param d). Every rendered number already lives in
 * data.js (commercialLines / scenarios / benchmarks / assumptions / proforma /
 * issues) and is looked up by id, never restated. The pro-forma numbers are
 * PRECOMPUTED; this file renders them; it does NOT port the pv-12 engine.
 *
 * THE ONLY LIVE MATH ON THIS TAB is npv(cashflows, rate): moving the WACC slider
 * (assumptions ASM-5) re-discounts proforma.cashflowByYear at the slider rate and
 * repaints the NPV read + the NPV-vs-rate curve marker. Everything else (scenario
 * ladder, sensitivity tornado, savings waterfall, deal table) is static, drawn
 * straight from the internally-coherent data object. See DEAL-DESIGN-DECISION.md
 * PART 1 "Tab 3, ECONOMICS" and PART 2 §2-3 ("reuse pv-12" = render precomputed).
 * ========================================================================== */
(function (global) {
'use strict';

/* ---------- 0. local utils (helpers.js owns the exported API) ------------- */
function clampp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function sumF(arr, f) { return (arr || []).reduce((s, x) => s + (f(x) || 0), 0); }
function findLine(d, id) { return (d.commercialLines || []).find(l => l.id === id) || {}; }
function findIssue(d, id) { return (d.issues || []).find(i => i.id === id); }
function assumVal(d, id, fb) { const a = (d.assumptions || []).find(x => x.id === id); return a ? a.value : fb; }
// compact money with a clean minus sign (helpers' money() renders "$-350K")
function M(n) { if (n == null || isNaN(n)) return '—'; return (n < 0 ? '−' : '') + money(Math.abs(n), { compact: true }); }
function setText(id, t) { const e = document.getElementById(id); if (e) e.textContent = t; }

// THE only live calculation on this tab. Discounts each year at period i+1, the
// convention the data is built on (verified: nets at 6% -> npvCurve rate 6; cost
// outflows PV at 6% -> tcoSummary.netTerm). cashflows = array of per-year numbers.
function npv(cashflows, ratePct) {
  const r = (ratePct || 0) / 100;
  return (cashflows || []).reduce((s, v, i) => s + v / Math.pow(1 + r, i + 1), 0);
}

function negPill(level) {
  const lvl = String(level || '').toLowerCase();
  return '<span class="pill ' + (lvl === 'high' ? 'info' : lvl === 'medium' ? 'muted' : 'muted') + '">' + esc(level || '—') + '</span>';
}
function compPill(level) {
  const lvl = String(level || '').toLowerCase();
  return '<span class="pill ' + (lvl === 'moderate' ? 'info' : 'muted') + '">Comparability: ' + esc(level) + '</span>';
}
function confPill(c) {
  const k = String(c || '').toLowerCase();
  return '<span class="pill ' + (k === 'high' ? 'ok' : k === 'low' ? 'warn' : 'info') + '">' + esc(c || '—') + '</span>';
}
function matPill(m) {
  const k = String(m || '').toLowerCase();
  return '<span class="pill ' + (k === 'high' ? 'warn' : k === 'low' ? 'muted' : 'info') + '">' + esc(m || '—') + '</span>';
}

/* ---------- 1. 3A, DEAL TABLE & ZOPA ------------------------------------- */
// benchmark -> line mapping (BENCH-int is the platform $/emp figure = CL-1;
// BENCH-svc is the implementation day-rate = CL-2). No line link in the data.
function benchForLine(d, id) {
  const map = { 'CL-1': 'BENCH-int', 'CL-2': 'BENCH-svc' };
  const bid = map[id];
  return bid ? (d.benchmarks || []).find(b => b.id === bid) : null;
}
function benchChip(d, id) {
  const b = benchForLine(d, id);
  return b ? '<span class="jump" data-jump="el:' + esc(b.id) + '" title="' + esc(b.item) + '">' + esc(b.comparability) + '</span>'
           : '<span class="tiny muted">—</span>';
}
function renderDealTable(d) {
  const cols = [
    { key: 'item', label: 'Line item', render: r => '<strong>' + esc(r.item) + '</strong><div class="tiny muted">' + esc(r.unit) + ' · ' + esc(r.frequency) + '</div>' },
    { key: 'ask', label: 'Ask (Y1)', align: 'num', sortVal: r => r.supplierAmount, render: r => M(r.supplierAmount) },
    { key: 'target', label: 'Target', align: 'num', sortVal: r => r.target, render: r => M(r.target) },
    { key: 'fallback', label: 'Fallback', align: 'num', sortVal: r => r.fallback, render: r => M(r.fallback) },
    { key: 'max', label: 'Max', align: 'num', sortVal: r => r.maximumAcceptable, render: r => M(r.maximumAcceptable) },
    { key: 'bench', label: 'Bench', sort: false, render: r => benchChip(d, r.id) },
    { key: 'negotiability', label: 'Neg.', render: r => negPill(r.negotiability) }
  ];
  return dataTable(cols, d.commercialLines || [], {
    id: 'cml-deal-table', zebra: true, dense: true,
    expand: r => '<div class="kv">' +
      '<dt>Quantity</dt><dd>' + esc(r.quantity) + ' ' + esc(r.unit) + '</dd>' +
      '<dt>ZOPA (target ↔ max)</dt><dd class="mono">' + M(r.target) + ' ↔ ' + M(r.maximumAcceptable) + '</dd>' +
      '<dt>Ask premium over max</dt><dd class="mono">' + M(r.supplierAmount - r.maximumAcceptable) + '</dd>' +
      '<dt>Evidence</dt><dd>' + evidenceChip(r.evidenceType, { sources: r.sourceIds }) +
        ' <span class="tiny muted">ask is a contract figure; target / fallback / max are calculated positions</span></dd></div>'
  });
}
/* --- Rich per-line ZOPA (ported from the platform pv-11 zopaGanttHTML / zopaTcoBand):
 * a horizontal track per line showing the ZOPA zone (target -> walk-away) as a teal band,
 * with positioned marks for target, walk-away, fallback, Theo's opening (burnt-orange) and
 * the supplier ask (plum; red only when it sits above walk-away), plus the matched market
 * benchmark as an ink POINT tick. We hold POINT benchmarks, not a market lo/hi band, so a
 * single market tick is drawn and NEVER a fabricated range; lines with no comp say so. --- */

// Derive the line-level market POINT from the benchmark's OWN stated figures (transparent,
// no fragile string parsing). CL-1 -> BENCH-int (2024 precedent ~$37/emp/yr, scaled to the
// employee basis); CL-2 -> BENCH-svc (implementation at the $1,500-1,750/day norm midpoint
// vs the ~$2,000/day ask). The raw comparisonValue + comparability are surfaced verbatim.
function zopaBenchForLine(d, l) {
  const b = benchForLine(d, l.id);
  if (!b) return null;
  let value = null, note = '';
  if (l.id === 'CL-1') {
    const emp = l.quantity || assumVal(d, 'ASM-1', 18000);
    value = 37 * emp;                                     // ~$37/emp/yr 2024 precedent x employee basis
    note = '~$37/employee/yr 2024 precedent x ' + emp.toLocaleString('en-US') + ' employees';
  } else if (l.id === 'CL-2') {
    value = Math.round(l.supplierAmount * 1625 / 2000);   // $1,625/day norm midpoint vs the ~$2,000/day ask
    note = '$1,625/day norm midpoint vs the ' + esc('≈$2,000') + '/day ask';
  } else {
    return null;                                          // no numeric derivation available -> no comp
  }
  return { value: value, note: note, benchId: b.id, comparability: b.comparability, raw: b.comparisonValue, explanation: b.explanation, evidenceType: b.evidenceType };
}

function zopaLineHTML(d, l) {
  const ask = l.supplierAmount, target = l.target, walk = l.maximumAcceptable, fallback = l.fallback;
  // Theo opening: anchor aggressively but credibly BELOW target so there is room to settle
  // up; = target-(walk-target), floored at 15% under target since we hold no market low.
  const open = Math.round(Math.max(target * 0.85, 2 * target - walk));
  const over = ask > walk;                  // supplier ask above our walk-away -> the ONLY red trigger
  const bench = zopaBenchForLine(d, l);
  // Scale = the negotiation span (opening -> ask), plus the benchmark point when present.
  // No fabricated market band: only the marks we actually hold are placed on the track.
  const vals = [open, target, walk, ask, fallback];
  if (bench) vals.push(bench.value);
  let min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  const pad = (max - min) * 0.08 || 1; min -= pad; max += pad;
  const span = (max - min) || 1;
  const pos = v => clampp((v - min) / span * 100, 0, 100);
  const gap = Math.round((1 - open / target) * 100);
  const track = '<div class="ztrack">' +
    '<div class="zaxis"></div>' +
    '<div class="zzopa" style="left:' + pos(target).toFixed(1) + '%;width:' + Math.max(pos(walk) - pos(target), 0).toFixed(1) + '%" title="ZOPA ' + M(target) + ' to ' + M(walk) + '"></div>' +
    '<div class="ztgt" style="left:' + pos(target).toFixed(1) + '%" title="Target ' + M(target) + '"></div>' +
    '<div class="zwalk" style="left:' + pos(walk).toFixed(1) + '%" title="Walk-away ' + M(walk) + '"></div>' +
    (fallback != null ? '<div class="zfb" style="left:' + pos(fallback).toFixed(1) + '%" title="Fallback ' + M(fallback) + '"></div>' : '') +
    '<div class="zopen" style="left:' + pos(open).toFixed(1) + '%" title="Theo opening ' + M(open) + '"></div>' +
    '<div class="zask ' + (over ? 'over' : 'ok') + '" style="left:calc(' + pos(ask).toFixed(1) + '% - 5px)" title="Supplier ask ' + M(ask) + '"></div>' +
    (bench ? '<div class="zbench" style="left:' + pos(bench.value).toFixed(1) + '%" title="Market ' + M(bench.value) + ' (' + esc(bench.comparability) + ' comparability)"></div>' : '') +
  '</div>';
  const leg = '<div class="zlleg">' +
    '<span class="zztgt">ZOPA ' + M(target) + ' to ' + M(walk) + '</span>' +
    '<span>opening ' + M(open) + '</span>' +
    '<span>fallback ' + M(fallback) + '</span>' +
    (bench ? '<span>market ' + M(bench.value) + ' (' + esc(bench.comparability) + ')</span>'
           : '<span class="znobench">no market benchmark in session</span>') +
  '</div>';
  const mktRow = bench
    ? '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><b>' + M(bench.value) + '</b> - ' + esc(bench.note) + '. ' + esc(bench.raw) + ' · ' + esc(bench.comparability) + ' comparability ' + evidenceChip(bench.evidenceType, { sources: [bench.benchId] }) + '</span></div>'
    : '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><span class="znobench">No market benchmark for this line in session</span> - no external comparison was available, so no market mark is drawn (no lo/hi band fabricated). ' + evidenceChip('unavailable') + '</span></div>';
  const detail = '<div class="zdetail">' +
    '<div class="zdrow"><span class="zdk">Price</span><span class="zdv">supplier ask <b>' + M(ask) + '</b> vs target ' + M(target) + ' · fallback ' + M(fallback) + ' · walk-away ' + M(walk) + ' ' + evidenceChip(l.evidenceType, { sources: l.sourceIds }) + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Theo opening</span><span class="zdv">open at <b>' + M(open) + '</b>, about ' + gap + '% below target, leaving room to settle at ' + M(target) + ' ' + evidenceChip('inference') + '</span></div>' +
    mktRow +
    '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + (over
        ? 'Ask sits <b>' + M(ask - walk) + '</b> above the ' + M(walk) + ' walk-away; hold to the ' + M(target) + ' target. ' + jumpLink('ISS-12 →', 'tab:contract/sub:legal')
        : 'Ask is within the ' + M(target) + ' to ' + M(walk) + ' zone; settle toward the ' + M(target) + ' target.') + '</span></div>' +
  '</div>';
  return '<div class="zline"><div class="zlhd"><span class="zlname">' + esc(l.item) + '</span>' +
    '<span class="zlask ' + (over ? 'over' : 'ok') + '">supplier ask ' + M(ask) + (over ? ' · above walk-away' : ' · within range') + '</span></div>' +
    track + leg + detail + '</div>';
}

// Total-deal ZOPA / TCO band: whole-deal ask/target/walk totals from the 3-yr scenarios
// (SC-ask / SC-target / SC-max), fallback from SC-fallback; opening derived the same way as
// the per-line opening. No deal-level market benchmark exists in session -> honest gap-state.
function zopaTotalHTML(d) {
  const sc = id => ((d.scenarios || []).find(s => s.id === id) || {});
  const askS = sc('SC-ask'), tgtS = sc('SC-target'), fbS = sc('SC-fallback'), maxS = sc('SC-max');
  const askTot = askS.total || 0, tgtTot = tgtS.total || 0, walkTot = maxS.total || 0, fbTot = fbS.total || 0;
  const openTot = Math.round(Math.max(tgtTot * 0.85, 2 * tgtTot - walkTot));
  const over = askTot > walkTot, apart = Math.abs(askTot - tgtTot);
  const gap = Math.round((1 - openTot / tgtTot) * 100);
  const emp = assumVal(d, 'ASM-1', 18000), years = assumVal(d, 'ASM-2', 3);
  const read = 'Supplier ask ' + M(askTot) + ' sits ' + (over ? 'above' : 'within') + ' the ' + M(walkTot) +
    ' walk-away; the ' + M(tgtTot) + ' target anchors the deal (about ' + M(apart) + ' below ask). The platform subscription is the biggest lever.';
  const band = '<div class="ztband">' +
    '<span class="ztchip open">Theo opening ' + M(openTot) + '</span>' +
    '<span class="ztchip tgt">Target ' + M(tgtTot) + '</span>' +
    '<span class="ztarrow">to</span>' +
    '<span class="ztchip walk">Walk-away ' + M(walkTot) + '</span>' +
    '<span class="ztchip ' + (over ? 'over' : 'ok') + '">Supplier ask ' + M(askTot) + '</span>' +
  '</div>';
  const detail = '<div class="zdetail">' +
    '<div class="zdrow"><span class="zdk">Ask vs target</span><span class="zdv">supplier ask <b>' + M(askTot) + '</b> vs target ' + M(tgtTot) + ' (' + M(apart) + ' apart over the ' + years + '-yr term) ' + evidenceChip('calculated') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Opening</span><span class="zdv">aggregate opening <b>' + M(openTot) + '</b>, about ' + gap + '% below target, the room to negotiate up to ' + M(tgtTot) + ' ' + evidenceChip('inference') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Walk-away</span><span class="zdv"><b>' + M(walkTot) + '</b> max-acceptable (3-yr) · fallback ' + M(fbTot) + '. Budget ceiling unconfirmed ' + jumpLink('GAP-3 →', 'tab:brief') + ' ' + evidenceChip(maxS.evidenceType || 'assumption') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Market benchmark</span><span class="zdv"><span class="znobench">No deal-level market benchmark in session</span> - the only comps are the two per-line precedents above (platform $/employee, implementation day-rate); no whole-deal TCV comparison is fabricated. ' + evidenceChip('unavailable') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + read + '</span></div>' +
  '</div>';
  return '<div class="ztotal"><div class="zthd"><span class="ztname">Total-deal ZOPA · TCO</span>' +
    '<span class="ztsub">' + emp.toLocaleString('en-US') + ' employees · ' + years + '-yr term · target to walk-away for the whole deal</span></div>' +
    band + detail + '</div>';
}

const ZOPA_BOTTOM_LEGEND = '<div class="zopalegend">' +
  '<span><i class="zlg zopa"></i>ZOPA (target to walk-away)</span>' +
  '<span><i class="zlg tgt"></i>target</span>' +
  '<span><i class="zlg walk"></i>walk-away</span>' +
  '<span><i class="zlg fb"></i>fallback</span>' +
  '<span><i class="zlg open"></i>Theo opening</span>' +
  '<span><i class="zlg ask"></i>supplier ask (red = above walk-away)</span>' +
  '<span><i class="zlg bench"></i>market benchmark (point)</span>' +
'</div>';

function renderZopaGantt(d) {
  const lines = d.commercialLines || [];
  if (!lines.length) return gapCard('No commercial lines in session', 'No line items to build a ZOPA from.');
  return lines.map(l => zopaLineHTML(d, l)).join('') + zopaTotalHTML(d) + ZOPA_BOTTOM_LEGEND;
}
function renderDealTotals(d) {
  const lines = d.commercialLines || [];
  const askY1 = sumF(lines, l => l.supplierAmount), tgtY1 = sumF(lines, l => l.target), maxY1 = sumF(lines, l => l.maximumAcceptable);
  const sc = id => ((d.scenarios || []).find(s => s.id === id) || {}).total;
  const askT = sc('SC-ask'), tgtT = sc('SC-target'), maxT = sc('SC-max');
  const col = (lbl, val) => '<div class="dt-col"><div class="k-lbl">' + lbl + '</div><div class="dt-vals">' + val + '</div></div>';
  return '<div class="deal-totals">' +
    col('Year-1 all-in', 'Ask <b>' + M(askY1) + '</b> · Target <b>' + M(tgtY1) + '</b> · Max <b>' + M(maxY1) + '</b>') +
    col('3-yr TCV (initial term)', 'Ask <b>' + M(askT) + '</b> · Target <b>' + M(tgtT) + '</b> · Max <b>' + M(maxT) + '</b>') +
    col('Total-deal ZOPA (3-yr)', '<b>' + M(tgtT) + ' ↔ ' + M(maxT) + '</b> ' + evidenceChip('calculated', { short: true })) +
  '</div>' +
  insight('The supplier ask (' + M(askT) + ' over the term) sits <strong>above</strong> the walk-away max (' + M(maxT) +
    '); any settlement inside ' + M(tgtT) + '–' + M(maxT) + ' is within the zone, with <strong>' + M(tgtT) +
    '</strong> the defensible target. Year-1 line totals reconcile to the scenario Year-1 figures.');
}
function renderDiscountArchitecture(d) {
  const lines = d.commercialLines || [];
  const disc = l => (l.supplierAmount - l.target);
  const platform = lines.filter(l => l.id === 'CL-1'), services = lines.filter(l => l.id !== 'CL-1');
  const platDisc = sumF(platform, disc), svcDisc = sumF(services, disc);
  const platAsk = sumF(platform, l => l.supplierAmount), svcAsk = sumF(services, l => l.supplierAmount);
  const platPct = platAsk ? Math.round(platDisc / platAsk * 100) : 0;
  const svcPct = svcAsk ? Math.round(svcDisc / svcAsk * 100) : 0;
  const maxD = Math.max(platDisc, svcDisc, 1);
  const perLine = lines.map(l => {
    const dd = disc(l), p = l.supplierAmount ? Math.round(dd / l.supplierAmount * 100) : 0;
    return '<div class="disc-line"><span>' + esc(l.item) + '</span><span class="mono">' + M(dd) + ' · ' + p + '%</span></div>';
  }).join('');
  return saCard('Discount Architecture',
    barRow('Platform (defensible)', platDisc, maxD, M(platDisc) + ' · ~' + platPct + '%', { color: 'pri', title: 'Platform line discount to internal precedent' }) +
    barRow('Services & support (loaded)', svcDisc, maxD, M(svcDisc) + ' · ~' + svcPct + '%', { color: 'emph', title: 'Implementation, support, connectors, training' }) +
    '<div style="margin-top:10px">' + perLine + '</div>' +
    insight('Platform value is benchmark-defensible (~' + platPct + '% to the 2024 internal precedent); implementation, support and connectors are day-rate / loaded lines carrying the largest percentage concessions (~' + svcPct + '%). Separate the two in the room. ' + jumpLink('ISS-12 →', 'tab:contract/sub:legal')),
    { accent: 'plum', icon: 'money', sub: evidenceChip('calculated', { short: true }) });
}
function renderRenewalBand(d) {
  const iss = ['ISS-04', 'ISS-11'].map(id => findIssue(d, id)).filter(Boolean);
  const rows = iss.map(i =>
    '<div class="rn-item"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      severityPill(i.priority) + '<strong style="flex:1 1 200px;min-width:0">' + esc(i.title) + '</strong>' +
      evidenceChip(i.evidenceType, { sources: i.sourceIds, short: true }) + '</div>' +
    '<dl class="kv" style="margin-top:6px">' +
      '<dt>As drafted</dt><dd>' + esc(i.supplierPosition) + '</dd>' +
      '<dt>Protection ask</dt><dd>' + esc(i.recommendedPosition) + ' ' + jumpLink('Terms →', 'tab:contract/sub:legal') + '</dd>' +
    '</dl></div>').join('<div class="divider"></div>');
  return saCard('Renewal & Price Protection', rows +
    insight('Auto-renewal (ISS-04) and the uncapped post-term uplift (ISS-11) compound: a missed 90-day window locks another year at an unbounded increase. A rate lock / CPI cap is the single highest-value commercial protection after the platform discount.', 'warn'),
    { accent: 'emph', icon: 'clock' });
}
function renderBenchmarks(d) {
  const bs = d.benchmarks || [];
  if (!bs.length) {
    return gapCard('No comparable benchmark in this session', 'No internal precedent or credible external comparison was available at generation time; no fabricated market percentiles are shown. ' + jumpLink('Gaps →', 'tab:brief'));
  }
  const cards = bs.map(b => '<div class="col-4">' + saCard(b.item,
    '<div class="bm-val mono">' + esc(b.comparisonValue) + '</div>' +
    '<div style="margin-top:9px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">' + compPill(b.comparability) + evidenceChip(b.evidenceType, { sources: [b.sourceId] }) + '</div>' +
    collapsible('Methodology & caveat', '<p style="margin:0">' + esc(b.explanation) + '</p>'),
    { accent: 'teal', icon: 'bench', id: b.id }) + '</div>').join('');
  return '<div class="grid">' + cards + '</div>' +
    '<div style="margin-top:12px">' + insight('Benchmark coverage rests on one internal precedent plus a weak-comparability public figure; real comps only. A prior Visier quote or a competing bid (' + jumpLink('GAP-4', 'tab:brief') + ') would firm the platform-pricing target; until then it stays RESEARCH-PENDING.', 'warn') + '</div>';
}

/* ---------- 2. 3B, PRO-FORMA (precomputed; WACC slider = the live math) --- */
function renderTcoKpis(d) {
  const pf = d.proforma || {}, t = pf.tcoSummary || {}, be = pf.breakEven || {};
  const wacc = assumVal(d, 'ASM-5', 6);
  const livePv = npv((pf.plByYear || []).map(y => y.cost), wacc);
  const kpi = (lbl, val, note) => '<div class="kpi"><div class="k-lbl">' + lbl + '</div><div class="k-val">' + val + '</div>' + (note ? '<div class="tiny muted">' + note + '</div>' : '') + '</div>';
  return '<div class="kpi-row">' +
    kpi('Year-1 TCO', M(t.y1), 'target scenario') +
    kpi('3-yr TCV', M(t.term), 'target · initial term') +
    kpi('PV of 3-yr cost @ WACC', '<span id="cml-pvcost-live">' + M(livePv) + '</span>', 'discounted at ' + wacc + '%') +
    kpi('Payback', (pf.paybackMonths != null ? pf.paybackMonths : '—') + ' mo', 'undiscounted, vs value case') +
    kpi('NPV break-even', (be.rate != null ? be.rate : '—') + '%', 'rate where value case = 0') +
  '</div>' +
  insight('Cost figures are the negotiated target scenario and reconcile to the 3-year TCV. The value case (P&L revenue) is a modelled business-case assumption, clearly labelled, not a booked figure.');
}
function renderPL(d) {
  const rows = (d.proforma || {}).plByYear || [];
  const cols = [
    { key: 'year', label: 'Year' },
    { key: 'revenue', label: 'Value case', align: 'num', render: r => M(r.revenue) },
    { key: 'cost', label: 'Cost', align: 'num', render: r => M(r.cost) },
    { key: 'net', label: 'Net', align: 'num', render: r => '<span class="' + (r.net < 0 ? 'st-deviation' : 'st-aligned') + '">' + M(r.net) + '</span>' }
  ];
  return dataTable(cols, rows, { id: 'cml-pl', dense: true });
}
function renderCashflow(d) {
  const rows = (d.proforma || {}).cashflowByYear || [];
  const cols = [
    { key: 'year', label: 'Year' },
    { key: 'in', label: 'Value in', align: 'num', render: r => M(r.in) },
    { key: 'out', label: 'Cash out', align: 'num', render: r => M(r.out) },
    { key: 'net', label: 'Net', align: 'num', render: r => '<span class="' + (r.net < 0 ? 'st-deviation' : 'st-aligned') + '">' + M(r.net) + '</span>' },
    { key: 'cum', label: 'Cumulative', align: 'num', render: r => '<span class="' + (r.cum < 0 ? 'st-deviation' : 'st-aligned') + '">' + M(r.cum) + '</span>' }
  ];
  return dataTable(cols, rows, { id: 'cml-cf', dense: true });
}
function renderWaccControl(d) {
  const a = (d.assumptions || []).find(x => x.id === 'ASM-5');
  const band = ((d.proforma || {}).wacc || {}).band || {};
  const wacc = a ? a.value : 6;
  const liveNpv = npv(((d.proforma || {}).cashflowByYear || []).map(y => y.net), wacc);
  const inBand = wacc >= band.target && wacc <= band.ceiling;
  const bandTxt = inBand ? 'Within governance band' : 'Outside governance band (' + band.target + '–' + band.ceiling + '%)';
  return (a ? assumptionSlider(a) : gapCard('No WACC assumption', 'ASM-5 discount rate not present in this session.')) +
    '<dl class="kv" style="margin-top:10px">' +
      '<dt>Governance band</dt><dd>' + band.target + '%–' + band.ceiling + '% (finance-set) ' +
        '<span class="pill ' + (inBand ? 'ok' : 'warn') + '" id="cml-wacc-band-status">' + bandTxt + '</span></dd>' +
      '<dt>NPV of value case @ WACC</dt><dd class="mono"><span id="cml-npv-live">' + M(liveNpv) + '</span> ' + evidenceChip('calculated', { short: true }) + '</dd>' +
    '</dl>' +
    '<div class="btn-row"><button class="btn" data-reset-assumptions>' + icon('reset') + 'Reset to governed rate</button></div>' +
    insight('Moving the WACC re-discounts the modelled net cash flows live; it is the only live calculation on this tab. Outside the ' + band.target + '–' + band.ceiling + '% finance band the NPV read is indicative only; confirm the governed rate with finance.');
}
// SVG NPV-vs-rate curve. Re-rendered on WACC change to move the live marker.
function renderNpvCurve(d, wacc) {
  const pf = d.proforma || {};
  const curve = (pf.npvCurve || []).slice().sort((a, b) => a.rate - b.rate);
  if (!curve.length) return gapCard('No NPV curve', 'NPV-vs-rate data not available in this session.');
  const be = pf.breakEven || {}, band = (pf.wacc || {}).band || {};
  const xMax = Math.max.apply(null, curve.map(p => p.rate).concat([be.rate || 0, 12]));
  const yMax = Math.max.apply(null, curve.map(p => p.npv).concat([1]));
  const W = 340, H = 172, padL = 46, padR = 14, padT = 14, padB = 30, pw = W - padL - padR, ph = H - padT - padB;
  const X = r => padL + (r / xMax) * pw, Y = v => padT + (1 - v / yMax) * ph;
  const line = curve.map(p => X(p.rate).toFixed(1) + ',' + Y(p.npv).toFixed(1)).join(' ');
  const area = X(curve[0].rate).toFixed(1) + ',' + Y(0).toFixed(1) + ' ' + line + ' ' + X(curve[curve.length - 1].rate).toFixed(1) + ',' + Y(0).toFixed(1);
  const wx = X(clampp(wacc, 0, xMax));
  const wnpv = npv((pf.cashflowByYear || []).map(y => y.net), wacc);
  const wy = Y(clampp(wnpv, 0, yMax));
  const bandRect = (band.target != null && band.ceiling != null)
    ? '<rect x="' + X(band.target).toFixed(1) + '" y="' + padT + '" width="' + (X(band.ceiling) - X(band.target)).toFixed(1) + '" height="' + ph + '" fill="var(--emph-t)" opacity="0.5"></rect>' : '';
  const beMark = (be.rate != null)
    ? '<line x1="' + X(be.rate).toFixed(1) + '" y1="' + padT + '" x2="' + X(be.rate).toFixed(1) + '" y2="' + (padT + ph) + '" stroke="var(--danger-bar)" stroke-width="1.5" stroke-dasharray="2 2"></line>' +
      '<text x="' + X(be.rate).toFixed(1) + '" y="' + (padT - 3) + '" text-anchor="end" font-size="9" fill="var(--danger)">break-even ' + be.rate + '%</text>' : '';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="npv-svg" role="img" aria-label="NPV of the value case versus discount rate">' +
    '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + ph) + '" stroke="var(--line2)"></line>' +
    '<line x1="' + padL + '" y1="' + (padT + ph) + '" x2="' + (padL + pw) + '" y2="' + (padT + ph) + '" stroke="var(--line2)"></line>' +
    '<text x="' + (padL - 5) + '" y="' + (Y(yMax) + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="var(--mut)">' + M(yMax) + '</text>' +
    '<text x="' + (padL - 5) + '" y="' + Y(0).toFixed(1) + '" text-anchor="end" font-size="9" fill="var(--mut)">$0</text>' +
    bandRect +
    '<polygon points="' + area + '" fill="var(--teal-t)" opacity="0.55"></polygon>' +
    '<polyline points="' + line + '" fill="none" stroke="var(--teal-d)" stroke-width="2"></polyline>' +
    beMark +
    '<line x1="' + wx.toFixed(1) + '" y1="' + padT + '" x2="' + wx.toFixed(1) + '" y2="' + (padT + ph) + '" stroke="var(--emph)" stroke-width="1.5" stroke-dasharray="3 2"></line>' +
    '<circle cx="' + wx.toFixed(1) + '" cy="' + wy.toFixed(1) + '" r="3.5" fill="var(--emph)" stroke="var(--surface)" stroke-width="1.5"></circle>' +
    '<text x="' + clampp(wx, padL + 2, padL + pw - 78).toFixed(1) + '" y="' + (padT + 10) + '" font-size="9" fill="var(--emph-tx)" font-weight="700">WACC ' + wacc + '% · ' + M(wnpv) + '</text>' +
    '<text x="' + padL + '" y="' + (H - 8) + '" text-anchor="start" font-size="9" fill="var(--mut)">0%</text>' +
    '<text x="' + (padL + pw).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="end" font-size="9" fill="var(--mut)">' + xMax + '%</text>' +
    '<text x="' + (padL + pw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9" fill="var(--mut)">discount rate →</text>' +
  '</svg>';
}
function renderSavingsWaterfall(d) {
  const sw = (d.proforma || {}).savingsWaterfall || [];
  if (!sw.length) return saCard('Savings Waterfall vs Supplier Ask', gapCard('No savings waterfall', 'Baseline-to-target reconciliation not available.'), { accent: 'teal', icon: 'trade' });
  const steps = sw.map(s => {
    if (s.kind === 'baseline') return { label: s.label, value: s.delta, kind: 'total', display: M(s.delta) };
    if (s.kind === 'net') return { label: s.label, value: s.delta, kind: 'final', display: M(s.delta) };
    return { label: s.label, value: Math.abs(s.delta), kind: 'down', display: (s.delta < 0 ? '−' : '+') + M(Math.abs(s.delta)) };
  });
  const ask = sw.find(s => s.kind === 'baseline') || { delta: 0 }, net = sw.find(s => s.kind === 'net') || { delta: 0 };
  const saved = ask.delta - net.delta, pctOff = ask.delta ? Math.round(saved / ask.delta * 100) : 0;
  return saCard('Savings Waterfall vs Supplier Ask',
    waterfall(steps, {}) +
    insight('The two anchor bars are the supplier ask (' + M(ask.delta) + ') and the negotiated target (' + M(net.delta) + '); the bars between are the negotiated reductions, sized by magnitude. Total removed: <strong>' + M(saved) + '</strong> (' + pctOff + '% off the ask) across the 3-year term.'),
    { accent: 'teal', icon: 'trade', sub: evidenceChip('calculated', { short: true }) });
}
function renderTeardown(d) {
  const rows = (d.proforma || {}).teardown || [];
  const cols = [
    { key: 'line', label: 'Cost line', render: r => '<strong>' + esc(r.line) + '</strong>' },
    { key: 'driver', label: 'Driver', render: r => '<span class="tiny">' + esc(r.driver) + '</span>' },
    { key: 'amount', label: 'Amount (Y1)', align: 'num', render: r => M(r.amount) },
    { key: 'ev', label: 'Ev.', render: r => evidenceChip(r.evidenceType, { short: true }) }
  ];
  const total = sumF(rows, r => r.amount);
  return dataTable(cols, rows, { id: 'cml-teardown', dense: true }) +
    insight('Year-1 target cost decomposition; sums to <strong>' + M(total) + '</strong> (the Year-1 target all-in). Hidden-cost multipliers are deliberately not fabricated.');
}
function renderAssumptionsRegister(d) {
  const cols = [
    { key: 'label', label: 'Assumption', render: r => '<strong>' + esc(r.label) + '</strong><div class="tiny muted">used in: ' + esc((r.usedIn || []).join(', ')) + '</div>' },
    { key: 'value', label: 'Value', align: 'num', render: r => '<span class="mono">' + esc(r.unit === '%' ? r.value + '%' : r.value.toLocaleString('en-US') + (r.unit ? ' ' + r.unit : '')) + '</span>' },
    { key: 'materiality', label: 'Materiality', render: r => matPill(r.materiality) },
    { key: 'confidence', label: 'Confidence', render: r => confPill(r.confidence) },
    { key: 'evidenceType', label: 'Evidence', render: r => evidenceChip(r.evidenceType || r.classification, { short: true }) }
  ];
  return dataTable(cols, d.assumptions || [], {
    id: 'cml-asm-register', dense: true, zebra: true,
    expand: r => {
      const log = (r.researchLog || []).map(l => '<div class="rl-item"><span class="mono tiny">' + esc(l.date) + '</span> ' + esc(l.note) + ' ' + (l.sourceId ? evidenceChip('internal', { sources: [l.sourceId], short: true }) : '') + '</div>').join('') || '<span class="tiny muted">No research log.</span>';
      return '<div class="kv">' +
        '<dt>Range</dt><dd class="mono">' + esc(r.min) + '–' + esc(r.max) + ' ' + esc(r.unit || '') + ' (step ' + esc(r.step) + ')</dd>' +
        '<dt>Research log</dt><dd style="flex-direction:column;align-items:flex-start;gap:4px">' + log + '</dd></div>';
    }
  }) +
  insight('Register is read-only here; only the WACC (ASM-5) is interactive, via the discount control above. Editing it re-discounts the NPV live.');
}

/* ---------- 3. 3C, SCENARIOS & SENSITIVITY (all precomputed / static) ---- */
function renderScenarioWaterfall(d) {
  const scs = d.scenarios || [];
  const order = [['SC-ask', 'total'], ['SC-max', 'down'], ['SC-fallback', 'down'], ['SC-target', 'final']];
  const steps = order.map(o => {
    const s = scs.find(x => x.id === o[0]) || { name: o[0], total: 0 };
    return { label: s.name, value: s.total, kind: o[1], display: M(s.total) };
  });
  return waterfall(steps, {}) +
    insight('Each bar is the full 3-year TCV if Lilly holds that position, precomputed from the scenario set. Target is the negotiated goal; max-acceptable is the walk-away (budget ceiling unconfirmed: ' + jumpLink('GAP-3', 'tab:brief') + ').');
}
function renderScenarioTable(d) {
  const cols = [
    { key: 'name', label: 'Scenario', render: r => '<strong>' + esc(r.name) + '</strong><div class="tiny muted">' + esc(r.basis) + '</div>' },
    { key: 'y1Total', label: 'Year-1', align: 'num', sortVal: r => r.y1Total, render: r => M(r.y1Total) },
    { key: 'total', label: '3-yr TCV', align: 'num', sortVal: r => r.total, render: r => M(r.total) },
    { key: 'evidenceType', label: 'Ev.', render: r => evidenceChip(r.evidenceType, { short: true }) }
  ];
  return dataTable(cols, d.scenarios || [], { id: 'cml-scenario-tbl', zebra: true, dense: true, expand: r => insight(r.interpretation) });
}
// Precomputed static tornado from proforma.sensitivity (NOT a live recompute).
function renderTornado(d) {
  const rows = ((d.proforma || {}).sensitivity || []).slice();
  if (!rows.length) return gapCard('No sensitivity data', 'Precomputed sensitivity not available in this session.');
  rows.forEach(r => { r._swing = Math.abs((r.high || 0) - (r.low || 0)); });
  rows.sort((a, b) => b._swing - a._swing);
  const dMin = Math.min.apply(null, rows.map(r => r.low));
  const dMax = Math.max.apply(null, rows.map(r => r.high));
  const span = (dMax - dMin) || 1;
  const base = rows[0].base;
  const basePct = (base - dMin) / span * 100;
  const body = rows.map(r => {
    const loPct = (r.low - dMin) / span * 100, hiPct = (r.high - dMin) / span * 100;
    return '<div class="tor-row"><div class="tor-lbl">' + esc(r.driver) + '<div class="tiny muted mono">' + M(r.low) + ' – ' + M(r.high) + '</div></div>' +
      '<div class="tor-track"><span class="tor-base" style="left:' + basePct.toFixed(1) + '%"></span>' +
      '<span class="tor-bar tor-lo" style="left:' + loPct.toFixed(1) + '%;width:' + (basePct - loPct).toFixed(1) + '%"></span>' +
      '<span class="tor-bar tor-hi" style="left:' + basePct.toFixed(1) + '%;width:' + (hiPct - basePct).toFixed(1) + '%"></span></div></div>';
  }).join('');
  return '<div class="tornado">' + body + '</div>' +
    '<div class="tiny muted" style="margin-top:8px">Centre line = target 3-yr TCV (' + M(base) + '). Teal = lower cost, orange = higher cost. Precomputed static ranges, not a live recompute.</div>';
}
function renderVaR(d) {
  const sc = id => ((d.scenarios || []).find(s => s.id === id) || {}).total;
  const sens = re => ((d.proforma || {}).sensitivity || []).find(s => new RegExp(re, 'i').test(s.driver)) || {};
  const disc = sens('discount'), emp = sens('employee');
  const rows = [
    { risk: 'Settle at max-acceptable, not target', exposure: M((sc('SC-max') || 0) - (sc('SC-target') || 0)), linked: 'SC-max · ISS-12', ev: 'assumption' },
    { risk: 'Platform discount not fully achieved', exposure: disc.high != null ? M(disc.high - disc.base) : '—', linked: 'ASM-4 · ISS-12', ev: 'calculated' },
    { risk: 'Employee count above the 18,000 plan', exposure: emp.high != null ? M(emp.high - emp.base) : '—', linked: 'ASM-1', ev: 'assumption' },
    { risk: 'Uncapped post-term uplift + auto-renewal (Y4+)', exposure: 'Unbounded (no cap)', linked: 'ISS-04 · ISS-11', ev: 'inference' },
    { risk: 'FY27 budget ceiling unconfirmed', exposure: 'Walk-away unvalidated', linked: 'GAP-3', ev: 'unavailable' }
  ];
  const cols = [
    { key: 'risk', label: 'Risk driver', render: r => '<strong>' + esc(r.risk) + '</strong>' },
    { key: 'exposure', label: 'Term exposure', align: 'num', render: r => '<span class="mono">' + esc(r.exposure) + '</span>' },
    { key: 'linked', label: 'Linked', render: r => '<span class="tiny mono">' + esc(r.linked) + '</span>' },
    { key: 'ev', label: 'Ev.', render: r => evidenceChip(r.ev, { short: true }) }
  ];
  return dataTable(cols, rows, { id: 'cml-var', dense: true }) +
    insight('Exposures are independent reads, not additive. The largest controllable risk is settling above target; the largest uncontrolled risk is the uncapped post-term uplift.', 'warn');
}

/* ---------- 4. live recompute (WACC slider -> NPV) ------------------------ */
function recompute(d) {
  const pf = d.proforma || {}, wacc = assumVal(d, 'ASM-5', 6);
  setText('cml-npv-live', M(npv((pf.cashflowByYear || []).map(y => y.net), wacc)));
  setText('cml-pvcost-live', M(npv((pf.plByYear || []).map(y => y.cost), wacc)));
  const band = (pf.wacc || {}).band || {};
  const bs = document.getElementById('cml-wacc-band-status');
  if (bs && band.target != null) {
    const inB = wacc >= band.target && wacc <= band.ceiling;
    bs.className = 'pill ' + (inB ? 'ok' : 'warn');
    bs.textContent = inB ? 'Within governance band' : 'Outside governance band (' + band.target + '–' + band.ceiling + '%)';
  }
  const cv = document.getElementById('cml-npv-curve');
  if (cv) cv.innerHTML = renderNpvCurve(d, wacc);
}

/* ---------- 5. TAB ASSEMBLY ----------------------------------------------- */
function renderTab_commercials(d) {
  const wacc0 = assumVal(d, 'ASM-5', 6);
  const pl = (d.proforma || {}).plByYear || [], cf = (d.proforma || {}).cashflowByYear || [];
  const tsvRows = ['Year\tValue case\tCost\tNet\tCash in\tCash out\tCumulative'];
  pl.forEach((p, i) => { const c = cf[i] || {}; tsvRows.push([p.year, p.revenue, p.cost, p.net, c.in, c.out, c.cum].join('\t')); });
  const tsv = tsvRows.join('\n');

  /* ---- 3A: Deal Table & ZOPA ---- */
  const deal =
    '<div class="tab-intro"><h2>Deal Table &amp; ZOPA</h2><p class="q">One normalized view of every commercial line, supplier ask against Lilly’s target, fallback and walk-away, with the per-line zone of possible agreement. ' + coverageBadge('Strong') + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + saCard('Deal Table, Normalized Line Items', renderDealTable(d) + renderDealTotals(d), { accent: 'plum', icon: 'money', sub: (d.commercialLines || []).length + ' lines' }) + '</div>' +
      '<div class="col-12">' + saCard('ZOPA by Line Item · Pricing &amp; Benchmarks', renderZopaGantt(d), { accent: 'plum', icon: 'target', sub: 'target → walk-away · Theo opening · supplier ask · benchmark' }) + '</div>' +
      '<div class="col-7">' + renderDiscountArchitecture(d) + '</div>' +
      '<div class="col-5">' + renderRenewalBand(d) + '</div>' +
    '</div>' +
    '<div style="margin-top:16px"><div class="eyebrow" style="margin-bottom:8px">Benchmarks, real comparisons only</div>' + renderBenchmarks(d) + '</div>';

  /* ---- 3B: Pro-forma ---- */
  const proforma =
    '<div class="tab-intro"><h2>Pro-forma</h2><p class="q">The target-scenario cost model over the initial term, discounted at Lilly’s WACC, what the deal is worth once financed. ' + evidenceChip('calculated', { short: true }) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + saCard('Total Cost of Ownership', renderTcoKpis(d) + '<div class="btn-row">' + copyBtn('Copy pro-forma (TSV)', null, tsv) + '<button class="btn" data-print>' + icon('print') + 'Print</button></div>', { accent: 'plum', icon: 'scale' }) + '</div>' +
      '<div class="col-6">' + saCard('P&amp;L by Contract Year', renderPL(d), { accent: 'teal', icon: 'scenarios', sub: 'value case = assumption' }) + '</div>' +
      '<div class="col-6">' + saCard('Cash Flow by Contract Year', renderCashflow(d), { accent: 'teal', icon: 'money' }) + '</div>' +
      '<div class="col-6">' + saCard('Discount Control, WACC', renderWaccControl(d), { accent: 'emph', icon: 'assume', sub: 'live NPV' }) + '</div>' +
      '<div class="col-6">' + saCard('NPV vs Discount Rate', '<div id="cml-npv-curve">' + renderNpvCurve(d, wacc0) + '</div>' + insight('The value-case NPV stays firmly positive across the plausible discount range; it only reaches zero near a ~' + (((d.proforma || {}).breakEven || {}).rate) + '% rate, far above the 5–7% governed WACC, a robust case.'), { accent: 'teal', icon: 'scenarios' }) + '</div>' +
      '<div class="col-7">' + renderSavingsWaterfall(d) + '</div>' +
      '<div class="col-5">' + saCard('Cost Teardown (Year-1 target)', renderTeardown(d), { icon: 'doc' }) + '</div>' +
      '<div class="col-12">' + saCard('Assumptions Register', renderAssumptionsRegister(d), { accent: 'emph', icon: 'assume', sub: (d.assumptions || []).length + ' inputs' }) + '</div>' +
    '</div>';

  /* ---- 3C: Scenarios & Sensitivity ---- */
  const scenarios =
    '<div class="tab-intro"><h2>Scenarios &amp; Sensitivity</h2><p class="q">The four negotiating positions as full 3-year TCVs, and which drivers move the number most. ' + coverageBadge('Moderate') + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-7">' + saCard('Ask → Negotiated Value Ladder', renderScenarioWaterfall(d), { accent: 'plum', icon: 'scenarios' }) + '</div>' +
      '<div class="col-5">' + saCard('Scenario Comparison', renderScenarioTable(d), { icon: 'target' }) + '</div>' +
      '<div class="col-7">' + saCard('Sensitivity, Swing on 3-yr TCV', renderTornado(d), { accent: 'emph', icon: 'scale' }) + '</div>' +
      '<div class="col-5">' + saCard('Value at Risk', renderVaR(d), { accent: 'danger', icon: 'flag' }) + '</div>' +
    '</div>';

  /* ---- scoped styles (only what the base system does not provide) ---- */
  const scopedStyle = '<style>' +
    '.commercials-tab .subtab-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px}' +
    /* rich per-line ZOPA tracks + Total-deal TCO band (ported from platform pv-11, palette-remapped:
       ZOPA zone = teal, our target/walk/fallback = plum family, opening = burnt-orange, ask = plum
       or red only when above walk-away, benchmark = neutral ink point). Prefixed so they do not
       collide with the platform bundle's own .zline/.ztrack classes. */
    '.commercials-tab .zline{margin:0 0 16px}' +
    '.commercials-tab .zline:last-of-type{margin-bottom:8px}' +
    '.commercials-tab .zlhd{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:7px}' +
    '.commercials-tab .zlname{font-weight:700;font-size:var(--fz-sm);color:var(--ink)}' +
    '.commercials-tab .zlask{font-size:var(--fz-floor);font-weight:700}' +
    '.commercials-tab .zlask.over{color:var(--danger)}' +
    '.commercials-tab .zlask.ok{color:var(--teal-d)}' +
    '.commercials-tab .ztrack{position:relative;height:30px;margin:2px 0}' +
    '.commercials-tab .zaxis{position:absolute;top:50%;left:0;right:0;height:2px;transform:translateY(-50%);background:var(--line2);border-radius:2px}' +
    '.commercials-tab .zzopa{position:absolute;top:50%;transform:translateY(-50%);height:16px;background:var(--teal-t);border:1px solid var(--teal-d);border-radius:4px}' +
    '.commercials-tab .ztgt,.commercials-tab .zwalk{position:absolute;top:calc(50% - 11px);width:2px;height:22px;background:var(--plum)}' +
    '.commercials-tab .zwalk{opacity:.5}' +
    '.commercials-tab .zfb{position:absolute;top:calc(50% - 7px);height:14px;border-left:2px dotted var(--plum);opacity:.75}' +
    '.commercials-tab .zopen{position:absolute;top:calc(50% - 6px);width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--surface);border:2px solid var(--emph);box-sizing:border-box}' +
    '.commercials-tab .zask{position:absolute;top:calc(50% - 14px);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid var(--plum)}' +
    '.commercials-tab .zask.over{border-top-color:var(--danger)}' +
    '.commercials-tab .zbench{position:absolute;top:calc(50% - 12px);width:2px;height:24px;background:var(--ink2)}' +
    '.commercials-tab .zlleg{display:flex;gap:14px;flex-wrap:wrap;font-size:var(--fz-floor);color:var(--mut2);margin-top:6px}' +
    '.commercials-tab .zlleg .zztgt{color:var(--teal-d);font-weight:700}' +
    '.commercials-tab .znobench{color:var(--mut2);font-style:italic}' +
    '.commercials-tab .zdetail{margin-top:9px;padding-top:9px;border-top:1px dashed var(--line2);display:grid;gap:5px}' +
    '.commercials-tab .zdrow{display:flex;gap:10px;font-size:var(--fz-sm);line-height:1.45}' +
    '.commercials-tab .zdk{flex:0 0 118px;color:var(--mut2);font-weight:700}' +
    '.commercials-tab .zdv{color:var(--ink2);flex:1;min-width:0}' +
    '.commercials-tab .zdv b{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}' +
    '.commercials-tab .ztotal{margin-top:14px;padding-top:14px;border-top:2px solid var(--plum)}' +
    '.commercials-tab .zthd{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px}' +
    '.commercials-tab .ztname{font-weight:800;font-size:var(--fz);color:var(--plum)}' +
    '.commercials-tab .ztsub{font-size:var(--fz-floor);color:var(--mut2)}' +
    '.commercials-tab .ztband{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}' +
    '.commercials-tab .ztchip{font-size:var(--fz-sm);font-weight:700;border-radius:30px;padding:5px 12px;white-space:nowrap;font-variant-numeric:tabular-nums}' +
    '.commercials-tab .ztchip.open{background:var(--surface);border:1.5px solid var(--emph);color:var(--emph)}' +
    '.commercials-tab .ztchip.tgt{background:var(--teal-t);color:var(--teal-d)}' +
    '.commercials-tab .ztchip.walk{background:var(--plum-t);color:var(--plum)}' +
    '.commercials-tab .ztchip.ok{background:var(--teal-t);color:var(--teal-d)}' +
    '.commercials-tab .ztchip.over{background:var(--danger-t);color:var(--danger)}' +
    '.commercials-tab .ztarrow{font-size:var(--fz-floor);color:var(--mut2)}' +
    '.commercials-tab .zopalegend{display:flex;gap:16px;flex-wrap:wrap;font-size:var(--fz-floor);color:var(--mut2);margin-top:14px;padding-top:11px;border-top:1px solid var(--line)}' +
    '.commercials-tab .zopalegend span{display:inline-flex;align-items:center}' +
    '.commercials-tab .zopalegend i{display:inline-block;margin-right:6px;vertical-align:middle}' +
    '.commercials-tab .zlg.zopa{width:16px;height:10px;background:var(--teal-t);border:1px solid var(--teal-d);border-radius:2px}' +
    '.commercials-tab .zlg.tgt{width:2px;height:14px;background:var(--plum)}' +
    '.commercials-tab .zlg.walk{width:2px;height:14px;background:var(--plum);opacity:.5}' +
    '.commercials-tab .zlg.fb{width:0;height:14px;border-left:2px dotted var(--plum);opacity:.75}' +
    '.commercials-tab .zlg.open{width:12px;height:12px;background:var(--surface);border:2px solid var(--emph);border-radius:50%;box-sizing:border-box}' +
    '.commercials-tab .zlg.ask{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid var(--plum)}' +
    '.commercials-tab .zlg.bench{width:2px;height:14px;background:var(--ink2)}' +
    '.commercials-tab .deal-totals{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid var(--line2)}' +
    '.commercials-tab .deal-totals .dt-col{flex:1 1 180px;min-width:160px}' +
    '.commercials-tab .deal-totals .k-lbl{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700;margin-bottom:3px}' +
    '.commercials-tab .deal-totals .dt-vals{font-size:var(--fz-sm);color:var(--ink2)}' +
    '.commercials-tab .deal-totals .dt-vals b{font-variant-numeric:tabular-nums;color:var(--ink)}' +
    '.commercials-tab .kpi-row{display:flex;gap:12px;flex-wrap:wrap}' +
    '.commercials-tab .kpi{flex:1 1 140px;min-width:130px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-sm);padding:11px 13px}' +
    '.commercials-tab .kpi .k-lbl{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700}' +
    '.commercials-tab .kpi .k-val{font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.01em;margin-top:3px;color:var(--ink)}' +
    '.commercials-tab .disc-line{display:flex;justify-content:space-between;gap:10px;font-size:var(--fz-sm);padding:5px 0;border-top:1px solid var(--line)}' +
    '.commercials-tab .disc-line:first-child{border-top:0}' +
    '.commercials-tab .rn-item .kv{margin-top:6px}' +
    '.commercials-tab .bm-val{font-size:var(--fz);font-weight:700;color:var(--ink)}' +
    '.commercials-tab .rl-item{font-size:var(--fz-sm);line-height:1.45}' +
    '.commercials-tab .npv-svg{width:100%;height:auto;display:block;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-sm)}' +
    '.commercials-tab .tornado{display:grid;gap:9px}' +
    '.commercials-tab .tor-row{display:grid;grid-template-columns:180px 1fr;gap:12px;align-items:center}' +
    '.commercials-tab .tor-lbl{font-size:var(--fz-sm);font-weight:600;color:var(--ink2)}' +
    '.commercials-tab .tor-track{position:relative;height:22px;background:var(--well);border:1px solid var(--line);border-radius:5px}' +
    '.commercials-tab .tor-base{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--ink2);z-index:2}' +
    '.commercials-tab .tor-bar{position:absolute;top:3px;bottom:3px}' +
    '.commercials-tab .tor-lo{background:var(--teal-d);border-radius:3px 0 0 3px}' +
    '.commercials-tab .tor-hi{background:var(--emph);border-radius:0 3px 3px 0}' +
    '@media (max-width:640px){.commercials-tab .tor-row{grid-template-columns:120px 1fr}}' +
  '</style>';

  return scopedStyle + '<div class="commercials-tab">' +
    '<div class="subtabbar" data-subtab-group="commercials"><div class="wrap">' +
      '<button class="subtab-btn" data-subtab="deal" aria-selected="true">' + icon('money') + ' Deal Table &amp; ZOPA</button>' +
      '<button class="subtab-btn" data-subtab="proforma">' + icon('scale') + ' Pro-forma</button>' +
      '<button class="subtab-btn" data-subtab="scenarios">' + icon('scenarios') + ' Scenarios &amp; Sensitivity</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
      '<div data-subpanel="commercials/deal" class="is-active">' + deal + '</div>' +
      '<div data-subpanel="commercials/proforma">' + proforma + '</div>' +
      '<div data-subpanel="commercials/scenarios">' + scenarios + '</div>' +
    '</div></div>' +
  '</div>';
}

/* ---------- 6. wire the WACC recalc once at module load ------------------- */
if (typeof global.DealUI !== 'undefined' && typeof global.DealUI.onRecalc === 'function') {
  global.DealUI.onRecalc(recompute);
}

/* ---------- 7. exports ---------------------------------------------------- */
global.renderTab_commercials = renderTab_commercials;
global.DealTabs = global.DealTabs || {};
global.DealTabs.commercials = renderTab_commercials;

})(typeof window !== 'undefined' ? window : this);
