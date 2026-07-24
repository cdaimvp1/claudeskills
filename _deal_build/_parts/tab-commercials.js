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

/* ---------- 0. local utils (helpers.js owns the exported API) -------------
 * clampp / assumVal / M / benchForLine used to live here too, but they are
 * used by BOTH this file and the ZOPA render, so they now live in
 * helpers.js as globals (see the ZOPA extraction to zopa.js, 2026-07-23) and
 * are referenced here unqualified, same as esc/evidenceChip/money always were. */
function sumF(arr, f) { return (arr || []).reduce((s, x) => s + (f(x) || 0), 0); }
function findLine(d, id) { return (d.commercialLines || []).find(l => l.id === id) || {}; }
function findIssue(d, id) { return (d.issues || []).find(i => i.id === id); }
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
// benchForLine(d, id) now lives in helpers.js (global): used here by
// benchChip AND by zopa.js's zopaBenchForLine, so one copy serves both.
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
/* --- Rich per-line ZOPA + total-deal ZOPA/TCO band now live in zopa.js
 * (window.DealZopa.render(d)), so the Economics tab and the Overview tab can
 * render byte-identical output. See zopa.js for zopaBenchForLine /
 * zopaLineHTML / zopaTotalHTML / ZOPA_BOTTOM_LEGEND / renderZopaGantt and
 * the .zopa-viz CSS (moved from this file's scoped <style> block below,
 * 2026-07-23 extraction). --- */
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
  return saCard('Where the Room Is',
    barRow('Platform (defensible)', platDisc, maxD, M(platDisc) + ' · ~' + platPct + '%', { color: 'pri', title: 'Platform line discount to internal precedent' }) +
    barRow('Services & support (loaded)', svcDisc, maxD, M(svcDisc) + ' · ~' + svcPct + '%', { color: 'emph', title: 'Implementation, support, connectors, training' }) +
    '<div style="margin-top:10px">' + perLine + '</div>' +
    insight('Where to push: the platform is benchmark-defensible (~' + platPct + '% to the 2024 internal precedent), so the room is in the loaded lines &mdash; implementation, support and connectors carry the largest percentage concessions (~' + svcPct + '%). Separate the two in the room. ' + jumpLink('ISS-12 →', 'tab:contract/sub:legal')),
    { accent: 'plum', icon: 'money', sub: 'the negotiable levers by line ' + evidenceChip('calculated', { short: true }) });
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
  // uniform compact strip (was ragged col-4 cards): each comparison is one cell of equal size,
  // sitting right under the ZOPA because it is the EVIDENCE that makes the target defensible.
  const cells = bs.map(b => '<div class="bm-cell" id="' + esc(b.id) + '">' +
    '<div class="bm-cell-t">' + esc(b.item) + '</div>' +
    '<div class="bm-cell-v mono">' + esc(b.comparisonValue) + '</div>' +
    '<div class="bm-cell-f">' + compPill(b.comparability) + evidenceChip(b.evidenceType, { sources: [b.sourceId], short: true }) + '</div>' +
    '<div class="bm-cell-m" title="' + esc(b.explanation) + '">' + esc(b.explanation) + '</div>' +
  '</div>').join('');
  return saCard('Benchmarks', '<div class="bm-strip">' + cells + '</div>' +
    insight('Real comparisons only &mdash; one internal precedent plus a weak-comparability public figure. A prior Visier quote or a competing bid (' + jumpLink('GAP-4', 'tab:brief') + ') would firm the platform-pricing target; until then it stays research-pending.', 'warn'),
    { accent: 'teal', icon: 'bench', sub: bs.length + ' comparisons &middot; support the target' });
}
/* ---- should-cost: bottoms-up cost build per driver, vs the ask, sizing the headroom ---- */
function renderShouldCost(d) {
  const scd = d.shouldCost;
  if (!scd || !(scd.drivers || []).length) return saCard('Should-Cost, Bottoms-Up', gapCard('No should-cost model', 'No bottoms-up cost build in this session. ' + evidenceChip('unavailable')), { icon: 'scale' });
  const usd = n => '$' + Number(n).toLocaleString('en-US');
  const segCols = ['var(--teal-d)', 'color-mix(in srgb,var(--sec) 48%,white)', 'var(--plum)', 'var(--mut2)', 'var(--emph)'];
  const drivers = scd.drivers.map(dr => {
    const scPct = clampp((dr.shouldCost / dr.ask) * 100, 0, 100);
    const segs = dr.buildup.map((b, i) => '<div class="scst-seg" style="width:' + (b.v / dr.ask * 100).toFixed(1) + '%;background:' + segCols[i % segCols.length] + '" title="' + esc(b.k) + ': ' + usd(b.v) + '"></div>').join('');
    const legend = dr.buildup.map((b, i) => '<span class="scst-lg"><i style="background:' + segCols[i % segCols.length] + '"></i>' + esc(b.k) + ' <b>' + usd(b.v) + '</b></span>').join('');
    return '<div class="scst-driver">' +
      '<div class="scst-hd"><strong>' + esc(dr.item) + '</strong> <span class="tiny muted">' + esc(dr.unit) + '</span>' +
        '<span class="scst-head-lbl">should-cost <b>' + usd(dr.shouldCost) + '</b> vs ask <b>' + usd(dr.ask) + '</b> &middot; headroom <b class="scst-hr">' + usd(dr.headroom) + '</b></span></div>' +
      '<div class="scst-track">' + segs +
        '<div class="scst-gap" style="left:' + scPct.toFixed(1) + '%" title="Headroom to the ask"></div>' +
        '<div class="scst-ask" title="Ask ' + usd(dr.ask) + '"></div></div>' +
      '<div class="scst-lgs">' + legend + '</div>' +
      insight(esc(dr.note), 'warn') +
    '</div>';
  }).join('');
  return saCard('Should-Cost, Bottoms-Up', drivers + insight('<strong>Read:</strong> ' + esc(scd.note) + ' ' + evidenceChip(scd.evidenceType, { short: true })),
    { accent: 'teal', icon: 'scale', sub: scd.drivers.length + ' cost drivers &middot; headroom to target' });
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
    '<div class="tab-intro"><h2>Deal Table &amp; ZOPA</h2><p class="q">Every commercial line: the supplier ask against Lilly’s target, fallback and walk-away, the per-line zone of possible agreement, and how defensible the price is. ' + coverageBadge('Strong') + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + saCard('ZOPA by Line Item · Pricing & Benchmarks',
        window.DealZopa.render(d) + renderDealTotals(d) +
        collapsible('<span>Normalized line-item table</span>', renderDealTable(d), { open: false }),
        { accent: 'plum', icon: 'target', sub: (d.commercialLines || []).length + ' lines · target → walk-away · supplier ask' }) + '</div>' +
      '<div class="col-12">' + renderBenchmarks(d) + '</div>' +
      '<div class="col-12">' + renderShouldCost(d) + '</div>' +
      '<div class="col-6">' + renderDiscountArchitecture(d) + '</div>' +
      '<div class="col-6">' + renderRenewalBand(d) + '</div>' +
    '</div>';

  /* ---- 3B: Pro-forma ---- */
  const proforma =
    '<div class="tab-intro"><h2>Pro-forma</h2><p class="q">The target-scenario cost model over the initial term, discounted at Lilly’s WACC, what the deal is worth once financed. ' + evidenceChip('calculated', { short: true }) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + saCard('Total Cost of Ownership', renderTcoKpis(d) + '<div class="btn-row">' + copyBtn('Copy pro-forma (TSV)', null, tsv) + '<button class="btn" data-print>' + icon('print') + 'Print</button></div>', { accent: 'plum', icon: 'scale' }) + '</div>' +
      '<div class="col-6">' + saCard('P&L by Contract Year', renderPL(d), { accent: 'teal', icon: 'scenarios', sub: 'value case = assumption' }) + '</div>' +
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
    /* ZOPA track CSS (.zline/.ztrack/.zzopa/.ztotal/.zopalegend/etc.) moved to
       zopa.js's injected `.zopa-viz` stylesheet as part of the 2026-07-23
       extraction, so it is no longer scoped under `.commercials-tab` here. */
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
    /* benchmarks as a uniform strip */
    '.commercials-tab .bm-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}' +
    '.commercials-tab .bm-cell{border:1px solid var(--line2);border-radius:8px;padding:11px 13px;background:var(--surface2)}' +
    '.commercials-tab .bm-cell-t{font:800 10px/1.2 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--mut);margin-bottom:5px}' +
    '.commercials-tab .bm-cell-v{font-size:13px;font-weight:700;color:var(--ink);line-height:1.35}' +
    '.commercials-tab .bm-cell-f{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:7px 0}' +
    '.commercials-tab .bm-cell-m{font-size:10px;color:var(--mut2);line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
    /* should-cost bottoms-up bars */
    '.commercials-tab .scst-driver{margin-bottom:14px;padding-bottom:13px;border-bottom:1px solid var(--line)}' +
    '.commercials-tab .scst-driver:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}' +
    '.commercials-tab .scst-hd{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:8px}' +
    '.commercials-tab .scst-head-lbl{margin-left:auto;font-size:11px;color:var(--ink2)}' +
    '.commercials-tab .scst-hr{color:var(--emph)}' +
    '.commercials-tab .scst-track{position:relative;height:22px;border-radius:5px;overflow:hidden;background:var(--nested);display:flex}' +
    '.commercials-tab .scst-seg{height:100%}' +
    '.commercials-tab .scst-gap{position:absolute;top:0;bottom:0;right:0;background:repeating-linear-gradient(45deg,var(--line2),var(--line2) 3px,transparent 3px,transparent 7px)}' +
    '.commercials-tab .scst-ask{position:absolute;top:-3px;bottom:-3px;right:0;width:2px;background:var(--ink2)}' +
    '.commercials-tab .scst-lgs{display:flex;flex-wrap:wrap;gap:10px;margin-top:9px;margin-bottom:6px}' +
    '.commercials-tab .scst-lg{font-size:10.5px;color:var(--mut2);display:inline-flex;align-items:center;gap:4px}' +
    '.commercials-tab .scst-lg i{width:9px;height:9px;border-radius:2px;display:inline-block}' +
    '.commercials-tab .scst-lg b{color:var(--ink2)}' +
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
