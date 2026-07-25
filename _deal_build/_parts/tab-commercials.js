/* =============================================================================
 * tab-commercials.js, "ECONOMICS" primary tab builder for the Deal artifact.
 *   (display name ECONOMICS; id / jump namespace stays `commercials`)
 *
 * Exposes:  window.renderTab_commercials(d)  ->  HTML string for the whole tab
 *           (subtab bar + 3 subtab panels), plus window.DealTabs.commercials.
 *
 * Question the tab answers: "What is it worth, what should I pay?"
 *
 * Subtabs (2):
 *   3A  Deal Table & ZOPA   (data-subpanel="commercials/deal")   incl. sensitivity + ladder
 *   3B  Pro-forma           (data-subpanel="commercials/proforma")
 *
 * Reads ONLY from dashboardData (param d). Values live in data.js (commercialLines /
 * scenarios / benchmarks / assumptions / proforma / issues) and are looked up by id.
 *
 * LIVE MATH ON THIS TAB:
 *  - Financial Model: pfModel(d) computes the whole multi-year cost + value model from the
 *    commercial lines (at target) plus the term (ASM-2), in-term uplift (ASM-3) and WACC
 *    (ASM-5) sliders; the pro-forma / P&L / cash-flow tables, top-line and NPV curve repaint
 *    live. (The old precomputed pl/cashflow/npv-curve tables were removed; the engine is the
 *    single source of truth.)
 *  - Deal tab: the ZOPA sensitivity sliders (ASM-1 employee count, ASM-4 platform discount)
 *    recompute the platform line live (see zopa.js).
 * The negotiated-value ladder + deal table are static, drawn from the coherent data object.
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

// npv(cashflows, ratePct): discounts each per-year value at period i+1 (the convention the
// engine is built on). Used by pfModel + the WACC-driven renders (NPV read, NPV-vs-rate
// curve, break-even). cashflows = array of per-year numbers.
function npv(cashflows, ratePct) {
  const r = (ratePct || 0) / 100;
  return (cashflows || []).reduce((s, v, i) => s + v / Math.pow(1 + r, i + 1), 0);
}

function negPill(level) {
  const lvl = String(level || '').toLowerCase();
  return '<span class="pill ' + (lvl === 'high' ? 'info' : lvl === 'medium' ? 'muted' : 'muted') + '">' + esc(level || '—') + '</span>';
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
/* renderDealTotals moved into zopa.js as zopaDealTotalsStrip (it must live inside the repainted
 * ZOPA container so the Year-1 / term totals update live with the delta-based total-deal band). */
function renderDiscountArchitecture(d) {
  const lines = d.commercialLines || [];
  const disc = l => (l.supplierAmount - l.target);
  const platform = lines.filter(l => l.id === 'CL-1'), services = lines.filter(l => l.id !== 'CL-1');
  const platDisc = sumF(platform, disc), svcDisc = sumF(services, disc);
  const platAsk = sumF(platform, l => l.supplierAmount), svcAsk = sumF(services, l => l.supplierAmount);
  const platPct = platAsk ? Math.round(platDisc / platAsk * 100) : 0;
  const svcPct = svcAsk ? Math.round(svcDisc / svcAsk * 100) : 0;
  // one compact per-line table (sorted by room), each line tagged defensible / loaded, with a
  // mini-bar sized to its share of the room. Replaces the redundant two-bar summary + list.
  const maxD = Math.max.apply(null, lines.map(disc).concat([1]));
  const rows = lines.slice().sort((a, b) => disc(b) - disc(a));
  const cols = [
    { key: 'item', label: 'Line', render: r => '<strong>' + esc(r.item) + '</strong> ' +
        (r.id === 'CL-1' ? '<span class="room-tag def">defensible</span>' : '<span class="room-tag load">loaded</span>') },
    { key: 'room', label: 'Room', align: 'num', sortVal: r => disc(r), render: r => M(disc(r)) },
    { key: 'pct', label: '% of ask', align: 'num', sortVal: r => r.supplierAmount ? disc(r) / r.supplierAmount : 0,
      render: r => (r.supplierAmount ? Math.round(disc(r) / r.supplierAmount * 100) : 0) + '%' },
    { key: 'bar', label: 'Share of the room', sort: false, render: r => miniBar(disc(r), maxD, { color: r.id === 'CL-1' ? 'pri' : 'emph' }) }
  ];
  return saCard('Where the Room Is',
    dataTable(cols, rows, { id: 'cml-room', dense: true, zebra: true }) +
    insight('The platform line is benchmark-defensible (~' + platPct + '% room to the 2024 internal precedent), so the real room is in the loaded lines: implementation, support and connectors carry the largest percentage concessions (~' + svcPct + '%). Separate the two in the room. ' + jumpLink('ISS-12 →', 'tab:contract/sub:legal')),
    { accent: 'plum', icon: 'money', sub: 'negotiable room by line ' + evidenceChip('calculated', { short: true }) });
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
/* renderBenchmarks retired: the two per-line benchmarks now render as burnt-orange ticks
 * directly on each ZOPA line, with the methodology + comparability in that line's expand
 * (zopa.js zopaBenchForLine / zopaLineHTML). No separate benchmark panel. */

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
/* ---- live financial-model engine -----------------------------------------
 * Builds a multi-year model from the commercial lines (at target) + the drivers:
 * term (ASM-2), in-term uplift (ASM-3), WACC (ASM-5). Recurring lines compound at
 * the uplift; one-time lines fall in Year 1. Value case is the modelled component
 * stream (proforma.valueComponents), held flat past its ramp for a longer term. All
 * money is computed here, not read from precomputed arrays, so the term/uplift/WACC
 * sliders reshape the whole model live. */
function pfModel(d) {
  const pf = d.proforma || {};
  const years = Math.max(1, Math.round(assumVal(d, 'ASM-2', 3)));
  const uplift = assumVal(d, 'ASM-3', 4) / 100;
  const wacc = assumVal(d, 'ASM-5', 6) / 100;
  const yr = i => 'Y' + (i + 1) + ' (FY' + (27 + i) + ')';
  const costLines = (d.commercialLines || []).map(l => {
    const recurring = l.frequency === 'annual';
    const byYear = [];
    for (let i = 0; i < years; i++) byYear.push(recurring ? Math.round(l.target * Math.pow(1 + uplift, i)) : (i === 0 ? l.target : 0));
    return { id: l.id, label: l.item, recurring: recurring, byYear: byYear, total: byYear.reduce((s, v) => s + v, 0) };
  });
  const valueLines = (pf.valueComponents || []).map(c => {
    const byYear = [];
    for (let i = 0; i < years; i++) byYear.push(c.byYear[Math.min(i, c.byYear.length - 1)]);
    return { label: c.label, byYear: byYear, total: byYear.reduce((s, v) => s + v, 0), evidenceType: c.evidenceType };
  });
  const sumAt = (lines, i) => lines.reduce((s, l) => s + l.byYear[i], 0);
  const costByYear = [], valueByYear = [], netByYear = [], cumByYear = [], dfByYear = [], dnByYear = [], dcByYear = [];
  let cum = 0, dcum = 0;
  for (let i = 0; i < years; i++) {
    const c = sumAt(costLines, i), v = sumAt(valueLines, i), net = v - c;
    cum += net;
    const df = 1 / Math.pow(1 + wacc, i + 1), dn = net * df; dcum += dn;
    costByYear.push(c); valueByYear.push(v); netByYear.push(net); cumByYear.push(cum);
    dfByYear.push(df); dnByYear.push(dn); dcByYear.push(dcum);
  }
  const costTotal = costByYear.reduce((s, v) => s + v, 0);
  const valueTotal = valueByYear.reduce((s, v) => s + v, 0);
  let payback = null;
  for (let i = 0; i < years; i++) {
    if (cumByYear[i] >= 0) {
      const prev = i === 0 ? 0 : cumByYear[i - 1];
      const frac = netByYear[i] ? (0 - prev) / netByYear[i] : 0;
      payback = Math.round((i + clampp(frac, 0, 1)) * 12);
      break;
    }
  }
  return {
    years: years, uplift: uplift, wacc: wacc, yearLabels: costByYear.map((_, i) => yr(i)),
    costLines: costLines, valueLines: valueLines, costByYear: costByYear, valueByYear: valueByYear,
    netByYear: netByYear, cumByYear: cumByYear, dfByYear: dfByYear, dnByYear: dnByYear, dcByYear: dcByYear,
    costTotal: costTotal, valueTotal: valueTotal, netTotal: valueTotal - costTotal, npv: dcum, payback: payback
  };
}
function renderTopline(d) {
  const m = pfModel(d);
  const tgt = ((d.scenarios || []).find(s => s.id === 'SC-target') || {}).total;
  const up = Math.round(m.uplift * 100);
  const kpi = (lbl, val, note) => '<div class="kpi"><div class="k-lbl">' + lbl + '</div><div class="k-val">' + val + '</div>' + (note ? '<div class="tiny muted">' + note + '</div>' : '') + '</div>';
  const signed = v => '<span class="' + (v < 0 ? 'st-deviation' : 'st-aligned') + '">' + M(v) + '</span>';
  return '<div class="kpi-row">' +
    kpi(m.years + '-yr cost (modelled)', M(m.costTotal), 'target + ' + up + '% in-term uplift') +
    kpi(m.years + '-yr value case', M(m.valueTotal), 'modelled benefit') +
    kpi('Net (' + m.years + '-yr)', signed(m.netTotal), 'value case less cost') +
    kpi('NPV @ WACC', signed(m.npv), 'discounted at ' + Math.round(m.wacc * 100) + '%') +
    kpi('Payback', (m.payback != null ? m.payback : '—') + ' mo', 'undiscounted') +
  '</div>' +
  insight('Internal analysis, not contract terms. Cost is the negotiated target scenario plus a modelled ' + up + '% in-term uplift on the recurring lines; the negotiation target TCV is ' + M(tgt) + ' before uplift (Deal tab). The value case is a modelled assumption, not a booked figure.');
}
// transposed table (years across the top, line items down the side). rows: {label,values,total}
// or {section} header, with optional signed / pct / dec formatting.
function pfTable(m, rows) {
  const cell = (v, r) => {
    if (v == null || v === '') return '';
    if (r.dec) return v.toFixed(3);
    if (r.pct) return v + '%';
    if (r.signed) return '<span class="' + (v < 0 ? 'st-deviation' : 'st-aligned') + '">' + M(v) + '</span>';
    return M(v);
  };
  const head = '<tr><th class="pf-rl"></th>' + m.yearLabels.map(y => '<th class="pf-n">' + esc(y) + '</th>').join('') + '<th class="pf-n pf-tot-col">Total</th></tr>';
  const body = rows.map(r => {
    if (r.section) return '<tr class="pf-section pf-lineitem"><td class="pf-rl" colspan="' + (m.years + 2) + '">' + esc(r.section) + '</td></tr>';
    const cls = ((r.cls || '') + (r.lineitem ? ' pf-lineitem' : '')).trim();
    const cells = r.values.map(v => '<td class="pf-n">' + cell(v, r) + '</td>').join('');
    const tot = r.dec ? '' : (r.pct ? (r.total == null ? '' : r.total + '%') : cell(r.total, r));
    return '<tr class="' + cls + '"><td class="pf-rl">' + esc(r.label) + '</td>' + cells + '<td class="pf-n pf-tot-col">' + tot + '</td></tr>';
  }).join('');
  return '<div class="pf-scroll"><table class="pf-table pf-transposed"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
}
// rows tagged lineitem:true (and section headers) are hidden in Summary depth, leaving the roll-ups.
function pfViewProforma(m) {
  const rows = [{ section: 'Cost outflows (target scenario)' }];
  m.costLines.forEach(l => rows.push({ label: l.label, values: l.byYear, total: l.total, lineitem: true }));
  rows.push({ label: 'Total cost', values: m.costByYear, total: m.costTotal, cls: 'pf-subtot' });
  rows.push({ section: 'Value case (modelled assumption)' });
  m.valueLines.forEach(l => rows.push({ label: l.label, values: l.byYear, total: l.total, lineitem: true }));
  rows.push({ label: 'Total value case', values: m.valueByYear, total: m.valueTotal, cls: 'pf-subtot' });
  rows.push({ label: 'Net', values: m.netByYear, total: m.netTotal, cls: 'pf-net', signed: true });
  rows.push({ label: 'Cumulative net', values: m.cumByYear, total: m.cumByYear[m.years - 1], cls: 'pf-cum', signed: true });
  rows.push({ section: 'Discounted @ WACC ' + Math.round(m.wacc * 100) + '%' });
  rows.push({ label: 'Discount factor', values: m.dfByYear, dec: true, lineitem: true });
  rows.push({ label: 'Discounted net', values: m.dnByYear, signed: true, lineitem: true });
  rows.push({ label: 'NPV (cumulative PV)', values: m.dcByYear, total: m.npv, cls: 'pf-npvrow', signed: true });
  return rows;
}
function pfViewPL(m) {
  const rows = [{ section: 'Revenue (value case, modelled)' }];
  m.valueLines.forEach(l => rows.push({ label: l.label, values: l.byYear, total: l.total, lineitem: true }));
  rows.push({ label: 'Total revenue', values: m.valueByYear, total: m.valueTotal, cls: 'pf-subtot' });
  rows.push({ section: 'Operating cost' });
  m.costLines.forEach(l => rows.push({ label: l.label, values: l.byYear, total: l.total, lineitem: true }));
  rows.push({ label: 'Total cost', values: m.costByYear, total: m.costTotal, cls: 'pf-subtot' });
  rows.push({ label: 'Net result', values: m.netByYear, total: m.netTotal, cls: 'pf-net', signed: true });
  const margin = m.netByYear.map((n, i) => m.valueByYear[i] ? Math.round(n / m.valueByYear[i] * 100) : 0);
  rows.push({ label: 'Net margin', values: margin, total: m.valueTotal ? Math.round(m.netTotal / m.valueTotal * 100) : 0, pct: true, cls: 'pf-margin' });
  return rows;
}
function pfViewCashflow(m) {
  const oneTime = m.costLines.filter(l => !l.recurring), recur = m.costLines.filter(l => l.recurring);
  const byYear = lines => m.costByYear.map((_, i) => lines.reduce((s, l) => s + l.byYear[i], 0));
  const otY = byYear(oneTime), reY = byYear(recur);
  const sum = a => a.reduce((s, v) => s + v, 0);
  return [
    { label: 'Cash in (value realized)', values: m.valueByYear, total: m.valueTotal },
    { section: 'Cash out' },
    { label: 'One-time (implementation, connectors, training)', values: otY, total: sum(otY), lineitem: true },
    { label: 'Recurring (subscription, support)', values: reY, total: sum(reY), lineitem: true },
    { label: 'Total cash out', values: m.costByYear, total: m.costTotal, cls: 'pf-subtot' },
    { label: 'Net cash flow', values: m.netByYear, total: m.netTotal, cls: 'pf-net', signed: true },
    { label: 'Cumulative cash', values: m.cumByYear, total: m.cumByYear[m.years - 1], cls: 'pf-cum', signed: true }
  ];
}
// the model card body: a Pro-forma / P&L / Cash Flow view toggle over the transposed engine output
function renderFinancial(d, view, depth) {
  const m = pfModel(d);
  if (!m.costLines.length) return gapCard('No commercial lines', 'No cost lines to build a model from. ' + evidenceChip('unavailable'));
  const v = view || 'proforma', dp = depth || 'summary';
  const vbtn = (id, label) => '<button class="pf-tab' + (v === id ? ' is-on' : '') + '" data-pf-view="' + id + '">' + label + '</button>';
  const dbtn = (id, label) => '<button class="pf-tab' + (dp === id ? ' is-on' : '') + '" data-pf-setdepth="' + id + '">' + label + '</button>';
  const toolbar = '<div class="pf-toolbar"><div class="pf-toggles">' +
    '<div class="pf-toggle" role="group" aria-label="Statement view">' + vbtn('proforma', 'Pro-forma') + vbtn('pl', 'P&amp;L') + vbtn('cashflow', 'Cash Flow') + '</div>' +
    '<div class="pf-toggle" role="group" aria-label="Detail level">' + dbtn('summary', 'Summary') + dbtn('full', 'Full') + '</div>' +
    '</div>' +
    '<span class="pf-note">Modelled over ' + m.years + ' year' + (m.years === 1 ? '' : 's') + ' at ' + Math.round(m.uplift * 100) + '% in-term uplift; value case is a modelled assumption.</span></div>';
  const views = '<div class="pf-view pf-view-proforma">' + pfTable(m, pfViewProforma(m)) + '</div>' +
    '<div class="pf-view pf-view-pl">' + pfTable(m, pfViewPL(m)) + '</div>' +
    '<div class="pf-view pf-view-cashflow">' + pfTable(m, pfViewCashflow(m)) + '</div>';
  return '<div class="pf-vwrap" data-pf-mode="' + v + '" data-pf-depth="' + dp + '">' + toolbar + views + '</div>';
}
// term + in-term-uplift sliders (uplift shown only when the offer has recurring lines: trait-driven)
function renderFinancialDrivers(d) {
  const a2 = (d.assumptions || []).find(x => x.id === 'ASM-2');
  const a3 = (d.assumptions || []).find(x => x.id === 'ASM-3');
  const hasRecurring = (d.commercialLines || []).some(l => l.frequency === 'annual');
  const sliders = (a2 ? assumptionSlider(a2) : '') + (a3 && hasRecurring ? assumptionSlider(a3) : '');
  if (!sliders) return '';
  return '<div class="zopa-viz"><div class="zopa-sens pf-drivers">' +
    '<div class="zopa-sens-hd"><span class="zss-t">Model drivers · adapt to the offer</span></div>' +
    '<div class="zopa-sens-grid">' + sliders + '</div>' +
    (hasRecurring ? '<div class="zopa-sens-live">The in-term uplift slider shows because this deal has recurring subscription lines; a one-time-only purchase would not display it. WACC is on the discount control below.</div>' : '') +
  '</div></div>';
}
function renderWaccControl(d) {
  const a = (d.assumptions || []).find(x => x.id === 'ASM-5');
  const band = ((d.proforma || {}).wacc || {}).band || {};
  const wacc = a ? a.value : 6;
  const liveNpv = pfModel(d).npv;   // NPV of the modelled net stream at the current WACC
  const inBand = wacc >= band.target && wacc <= band.ceiling;
  const bandTxt = inBand ? 'Within governance band' : 'Outside governance band (' + band.target + '–' + band.ceiling + '%)';
  const resetBtn = '<button class="btn-icon asm-reset" data-reset-assumptions title="Reset to the governed rate" aria-label="Reset to the governed rate">' + icon('reset') + '</button>';
  return (a ? assumptionSlider(a, resetBtn) : gapCard('No WACC assumption', 'ASM-5 discount rate not present in this session.')) +
    '<dl class="kv" style="margin-top:10px">' +
      '<dt>Governance band</dt><dd>' + band.target + '%–' + band.ceiling + '% (finance-set) ' +
        '<span class="pill ' + (inBand ? 'ok' : 'warn') + '" id="cml-wacc-band-status">' + bandTxt + '</span></dd>' +
      '<dt>NPV of value case @ WACC</dt><dd class="mono"><span id="cml-npv-live">' + M(liveNpv) + '</span> ' + evidenceChip('calculated', { short: true }) + '</dd>' +
    '</dl>' +
    insight('Moving the WACC re-discounts the modelled net flows live, including the pro-forma table above. Outside the ' + band.target + '–' + band.ceiling + '% finance band the NPV read is indicative only; confirm the governed rate with finance.');
}
// SVG NPV-vs-rate curve, computed live from the engine net stream (reshapes with term/uplift).
function renderNpvCurve(d, wacc) {
  const m = pfModel(d), band = ((d.proforma || {}).wacc || {}).band || {};
  const curve = [];
  for (let r = 0; r <= 36; r += 2) curve.push({ rate: r, npv: npv(m.netByYear, r) });
  if (!curve.length) return gapCard('No NPV curve', 'NPV-vs-rate data not available in this session.');
  // break-even = first rate where NPV crosses to <= 0 (linearly interpolated)
  let beRate = null;
  for (let i = 1; i < curve.length; i++) {
    if (curve[i - 1].npv >= 0 && curve[i].npv < 0) {
      const a2 = curve[i - 1], b2 = curve[i];
      beRate = Math.round(a2.rate + (b2.rate - a2.rate) * (a2.npv / (a2.npv - b2.npv)));
      break;
    }
  }
  const be = { rate: beRate };
  const xMax = Math.max.apply(null, curve.map(p => p.rate).concat([beRate || 0, 12]));
  const yMax = Math.max.apply(null, curve.map(p => p.npv).concat([1]));
  const W = 340, H = 172, padL = 46, padR = 14, padT = 14, padB = 30, pw = W - padL - padR, ph = H - padT - padB;
  const X = r => padL + (r / xMax) * pw, Y = v => padT + (1 - v / yMax) * ph;
  const line = curve.map(p => X(p.rate).toFixed(1) + ',' + Y(p.npv).toFixed(1)).join(' ');
  const area = X(curve[0].rate).toFixed(1) + ',' + Y(0).toFixed(1) + ' ' + line + ' ' + X(curve[curve.length - 1].rate).toFixed(1) + ',' + Y(0).toFixed(1);
  const wx = X(clampp(wacc, 0, xMax));
  const wnpv = npv(m.netByYear, wacc);
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
/* renderSavingsWaterfall retired: it duplicated the Negotiated Value Ladder (renderScenarioWaterfall),
 * which now lives on the Deal tab. renderTeardown (Year-1 cost decomposition) was cut as low-signal;
 * the per-line cost build lives in Should-Cost + the ZOPA line detail. */
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
  insight('Register is read-only here. Interactive elsewhere: term (ASM-2) and in-term uplift (ASM-3) via the model drivers above, WACC (ASM-5) via the discount control, and employee count (ASM-1) + platform discount (ASM-4) via the sensitivity drivers on the Deal Table &amp; ZOPA tab.');
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
/* renderScenarioTable / renderTornado / renderVaR retired with the Scenarios subtab:
 * the four scenario TCVs are the marks on the total-deal ZOPA bar, the tornado is replaced
 * by per-line leverage + the live driver sliders on the Deal tab, and value-at-risk was cut
 * as redundant. renderScenarioWaterfall (above) survives as the Negotiated Value Ladder. */

/* ---------- 4. live recompute (term / uplift / WACC sliders -> whole model) --- */
function recompute(d) {
  const pf = d.proforma || {}, wacc = assumVal(d, 'ASM-5', 6), m = pfModel(d);
  setText('cml-npv-live', M(m.npv));
  const band = (pf.wacc || {}).band || {};
  const bs = document.getElementById('cml-wacc-band-status');
  if (bs && band.target != null) {
    const inB = wacc >= band.target && wacc <= band.ceiling;
    bs.className = 'pill ' + (inB ? 'ok' : 'warn');
    bs.textContent = inB ? 'Within governance band' : 'Outside governance band (' + band.target + '–' + band.ceiling + '%)';
  }
  const cv = document.getElementById('cml-npv-curve');
  if (cv) cv.innerHTML = renderNpvCurve(d, wacc);
  // repaint the live model (preserving the active Pro-forma / P&L / Cash Flow view) + the top-line
  const fin = document.getElementById('cml-financial');
  if (fin) {
    const vwEl = fin.querySelector('[data-pf-mode]');
    const view = vwEl ? vwEl.getAttribute('data-pf-mode') : 'proforma';
    const depth = vwEl ? vwEl.getAttribute('data-pf-depth') : 'summary';
    fin.innerHTML = renderFinancial(d, view, depth);
  }
  const tl = document.getElementById('cml-topline');
  if (tl) tl.innerHTML = renderTopline(d);
}

/* ---------- 5. TAB ASSEMBLY ----------------------------------------------- */
function renderTab_commercials(d) {
  const wacc0 = assumVal(d, 'ASM-5', 6);

  /* ---- 3A: Deal Table & ZOPA (order: room + renewal on top, then the interactive ZOPA
       (sensitivity drivers + benchmark ticks), then should-cost and the negotiated-value ladder) ---- */
  const deal =
    '<div class="tab-intro"><h2>Deal Table &amp; ZOPA</h2><p class="q">Where the negotiable room is, the supplier ask against Lilly’s target, fallback and walk-away, per-line leverage, and how the number moves with the deal’s drivers. ' + coverageBadge('Strong') + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-6">' + renderDiscountArchitecture(d) + '</div>' +
      '<div class="col-6">' + renderRenewalBand(d) + '</div>' +
      '<div class="col-12">' + saCard('Total-Deal ZOPA · Sensitivity & Benchmarks',
        window.DealZopa.sensitivity(d) + '<div id="cml-zopa-live">' + window.DealZopa.render(d) + '</div>' +
        collapsible('<span>Normalized line-item table</span>', renderDealTable(d), { open: false }),
        { accent: 'plum', icon: 'target', sub: (d.commercialLines || []).length + ' lines · leverage · benchmark ticks · live drivers' }) + '</div>' +
      '<div class="col-12">' + renderShouldCost(d) + '</div>' +
      '<div class="col-12">' + saCard('Ask → Negotiated Value Ladder', renderScenarioWaterfall(d),
        { accent: 'plum', icon: 'scenarios', sub: 'supplier ask down to target, step by step' }) + '</div>' +
    '</div>';

  /* ---- 3B: Financial Model (live engine: pro-forma / P&L / cash-flow + term/uplift/WACC drivers) ---- */
  const financial =
    '<div class="tab-intro"><h2>Financial Model</h2><p class="q">Internal analysis, not contract terms: a live cost + value model over the initial term, discounted at Lilly’s WACC. Move the drivers to reshape the deal. ' + evidenceChip('calculated', { short: true }) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + saCard('Top-Line Summary', '<div id="cml-topline">' + renderTopline(d) + '</div>', { accent: 'plum', icon: 'scale', sub: 'target scenario · modelled value' }) + '</div>' +
      '<div class="col-12">' + saCard('Financial Modeling', renderFinancialDrivers(d) + '<div id="cml-financial">' + renderFinancial(d, 'proforma', 'summary') + '</div>', { accent: 'teal', icon: 'scenarios', sub: 'pro-forma · P&amp;L · cash flow · live' }) + '</div>' +
      '<div class="col-6">' + saCard('Discount Control · WACC', renderWaccControl(d), { accent: 'emph', icon: 'assume', sub: 'live' }) + '</div>' +
      '<div class="col-6">' + saCard('NPV vs Discount Rate', '<div id="cml-npv-curve">' + renderNpvCurve(d, wacc0) + '</div>' + insight('The value-case NPV stays positive across the plausible discount range and falls to zero only well above the 5–7% governed WACC, a robust case. The curve reshapes as you move the model drivers.'), { accent: 'teal', icon: 'scenarios' }) + '</div>' +
      '<div class="col-12">' + saCard('Assumptions Register', renderAssumptionsRegister(d), { accent: 'emph', icon: 'assume', sub: (d.assumptions || []).length + ' inputs' }) + '</div>' +
    '</div>';

  /* ---- 3C (Scenarios & Sensitivity) is retired: the Negotiated Value Ladder moved onto the
       Deal tab, per-line leverage + live driver sliders replaced the tornado, and the scenario
       comparison + value-at-risk panels were cut as redundant with the ZOPA marks. ---- */

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
    /* Where-the-Room per-line table: defensible / loaded tags + a share-of-room mini-bar */
    '.commercials-tab .room-tag{font:700 9px/1.4 var(--sans);letter-spacing:.03em;text-transform:uppercase;padding:1px 6px;border-radius:4px;white-space:nowrap}' +
    '.commercials-tab .room-tag.def{color:var(--sec-tx);background:var(--sec-t)}' +
    '.commercials-tab .room-tag.load{color:var(--emph-tx);background:var(--emph-t)}' +
    '.commercials-tab #cml-room .minibar{min-width:70px}' +
    /* icon-only reset tucked to the right of a slider heading */
    '.commercials-tab .asm-reset{width:22px;height:22px;flex:0 0 auto;align-self:center;margin-left:4px}' +
    '.commercials-tab .asm-reset svg{width:13px;height:13px}' +
    '.commercials-tab .rn-item .kv{margin-top:6px}' +
    /* equal-height cards within a grid row (Where the Room Is | Renewal sit level) */
    '.commercials-tab .grid>[class*="col-"]>.sa-card{height:100%}' +
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
    /* Financial Model: transposed pro-forma / P&L / cash-flow table + a view toggle */
    '.commercials-tab .pf-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px}' +
    '.commercials-tab .pf-toggles{display:flex;gap:10px;flex-wrap:wrap}' +
    '.commercials-tab .pf-vwrap[data-pf-depth="summary"] .pf-lineitem{display:none}' +
    '.commercials-tab .pf-toggle{display:inline-flex;border:1px solid var(--line2);border-radius:7px;overflow:hidden}' +
    '.commercials-tab .pf-tab{appearance:none;border:0;background:var(--surface);color:var(--mut);font:700 11px/1 var(--sans);padding:7px 13px;cursor:pointer}' +
    '.commercials-tab .pf-tab+.pf-tab{border-left:1px solid var(--line2)}' +
    '.commercials-tab .pf-tab.is-on{background:var(--plum);color:#fff}' +
    '.commercials-tab .pf-note{font-size:11px;color:var(--mut2)}' +
    '.commercials-tab .pf-scroll{overflow-x:auto}' +
    '.commercials-tab .pf-table{width:100%;border-collapse:collapse;font-size:var(--fz-sm)}' +
    '.commercials-tab .pf-table th,.commercials-tab .pf-table td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}' +
    '.commercials-tab .pf-table th{font:700 10px/1.2 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--mut);background:var(--surface2)}' +
    '.commercials-tab .pf-table td.pf-n,.commercials-tab .pf-table th.pf-n{text-align:right;font-variant-numeric:tabular-nums}' +
    '.commercials-tab .pf-table td.pf-rl,.commercials-tab .pf-table th.pf-rl{text-align:left;white-space:normal;min-width:150px;max-width:250px;color:var(--ink2)}' +
    '.commercials-tab .pf-table .pf-tot-col{border-left:1px solid var(--line2);font-weight:700}' +
    '.commercials-tab .pf-section td{font:800 9.5px/1.3 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--mut);background:var(--surface2);padding-top:9px}' +
    '.commercials-tab .pf-subtot td{font-weight:800;color:var(--ink);border-top:1px solid var(--line2)}' +
    '.commercials-tab .pf-net td,.commercials-tab .pf-cum td,.commercials-tab .pf-npvrow td,.commercials-tab .pf-margin td{font-weight:800;color:var(--ink)}' +
    '.commercials-tab .pf-net td{border-top:2px solid var(--plum)}' +
    '.commercials-tab .pf-vwrap .pf-view{display:none}' +
    '.commercials-tab .pf-vwrap[data-pf-mode="proforma"] .pf-view-proforma,.commercials-tab .pf-vwrap[data-pf-mode="pl"] .pf-view-pl,.commercials-tab .pf-vwrap[data-pf-mode="cashflow"] .pf-view-cashflow{display:block}' +
    /* icon-only button (WACC reset) */
    '.commercials-tab .btn-icon{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:1px solid var(--line2);border-radius:7px;background:var(--surface);color:var(--mut);cursor:pointer}' +
    '.commercials-tab .btn-icon:hover{color:var(--plum);border-color:var(--plum)}' +
    '.commercials-tab .btn-icon svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2}' +
  '</style>';

  return scopedStyle + '<div class="commercials-tab">' +
    '<div class="subtabbar" data-subtab-group="commercials"><div class="wrap">' +
      '<button class="subtab-btn" data-subtab="deal" aria-selected="true">' + icon('money') + ' Deal Table &amp; ZOPA</button>' +
      '<button class="subtab-btn" data-subtab="proforma">' + icon('scale') + ' Financial Model</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
      '<div data-subpanel="commercials/deal" class="is-active">' + deal + '</div>' +
      '<div data-subpanel="commercials/proforma">' + financial + '</div>' +
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
