/* =============================================================================
 * tab-commercials.js — "Commercials" primary tab builder for the Deal artifact.
 *
 * Exposes:  window.renderTab_commercials(d)  ->  HTML string for the whole tab
 *           (subtab bar + 3 subtab panels), plus window.DealTabs.commercials
 *           as an alias (builder convention in helpers.js).
 *
 * Subtabs: Proposal (line items + cash flow + terms + concerns) ·
 *          Scenarios (ask/target/fallback/max + editable assumptions + recalc
 *          + tornado sensitivity) · Benchmarks (only real comparisons).
 *
 * Reads ONLY from dashboardData (param d). No fact is hard-coded here that
 * already lives in data.js — commercialLines / scenarios / benchmarks /
 * assumptions / issues are looked up by id and rendered, never restated.
 *
 * LIVE RECALC DESIGN (see helpers.js comment on DealUI.onRecalc):
 *   Moving an assumption slider must not fabricate new precision — it re-runs
 *   a transparent, locally-defined model and shows the delta from the
 *   generation-time snapshot. At the assumptions' ORIGINAL values the model
 *   reproduces the original scenario figures exactly (ratio = 1); away from
 *   the original values it scales proportionally. Sortable-table headers are
 *   bound once at DealUI.init() and are NOT delegated, so recalculation never
 *   replaces a <table> — it patches only the value spans + their data-sv
 *   sort-cache in place.
 * ========================================================================== */
(function (global) {
'use strict';

/* ---------- 0. small local utils (not exported — helpers.js owns the API) - */
function assumVal(d, id, fallback, overrides) {
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, id)) return overrides[id];
  const a = (d.assumptions || []).find(x => x.id === id);
  return a ? a.value : fallback;
}
function findLine(d, id) { return (d.commercialLines || []).find(l => l.id === id) || {}; }
function findIssue(d, id) { return (d.issues || []).find(i => i.id === id); }
function negPill(level) {
  const lvl = String(level || '').toLowerCase();
  return '<span class="pill ' + (lvl === 'high' ? 'info' : 'muted') + '">' + esc(level) + '</span>';
}
function compPill(level) {
  const lvl = String(level || '').toLowerCase();
  return '<span class="pill ' + (lvl === 'moderate' ? 'info' : 'muted') + '">Comparability: ' + esc(level) + '</span>';
}

/* ---------- 1. the pricing model (drives waterfall / table / tornado) ----- */
// Year-by-year cash for one scenario under given (or current) assumption
// overrides. Only the platform line (CL-1) is headcount/discount-sensitive,
// matching ASM-1.usedIn / ASM-4.usedIn in data.js; everything else uses the
// scenario's own values{} as drafted.
function yearlyCashFlow(d, scenario, overrides) {
  const empRatio = assumVal(d, 'ASM-1', 18000, overrides) / 18000;
  const term = Math.max(1, Math.round(assumVal(d, 'ASM-2', 3, overrides)));
  const uplift = assumVal(d, 'ASM-3', 4, overrides) / 100;
  const discount = assumVal(d, 'ASM-4', 18, overrides) / 100;
  const askCL1 = findLine(d, 'CL-1').supplierAmount || 0;
  let cl1 = scenario.values['CL-1'] || 0;
  if (scenario.id === 'SC-target') cl1 = askCL1 * (1 - discount);
  cl1 = cl1 * empRatio;
  const cl3 = scenario.values['CL-3'] || 0;
  const oneTime = (scenario.values['CL-2'] || 0) + (scenario.values['CL-4'] || 0) + (scenario.values['CL-5'] || 0);
  const annual = cl1 + cl3;
  const years = [];
  for (let k = 0; k < term; k++) years.push(annual * Math.pow(1 + uplift, k) + (k === 0 ? oneTime : 0));
  return years;
}
function scenarioModel(d, scenario, overrides) {
  const years = yearlyCashFlow(d, scenario, overrides);
  return { y1: years[0] || 0, total: years.reduce((a, b) => a + b, 0) };
}
function npv(years, ratePct) {
  const r = (ratePct || 0) / 100;
  return years.reduce((sum, v, idx) => sum + v / Math.pow(1 + r, idx), 0);
}
// baseline captured once, at first render (i.e. the generation-time values),
// so a moved-then-reset slider reproduces the original figures exactly.
let _baseline = null;
function baseline(d) {
  if (_baseline) return _baseline;
  _baseline = {};
  (d.scenarios || []).forEach(s => { _baseline[s.id] = scenarioModel(d, s); });
  return _baseline;
}
// scenarios re-scaled: at unmoved assumptions this returns the ORIGINAL
// s.y1Total / s.total exactly; away from baseline it scales by the model's
// ratio. Never invents a number unrelated to the generation-time snapshot.
function liveScenarios(d) {
  const base = baseline(d);
  return (d.scenarios || []).map(s => {
    const m = scenarioModel(d, s);
    const b = base[s.id] || { y1: 1, total: 1 };
    return Object.assign({}, s, {
      liveY1: s.y1Total * (m.y1 / (b.y1 || 1)),
      liveTotal: s.total * (m.total / (b.total || 1))
    });
  });
}
function liveAsk(d) {
  const empRatio = assumVal(d, 'ASM-1', 18000) / 18000;
  const l = findLine(d, 'CL-1');
  return (l.supplierAmount || 0) * empRatio;
}
function liveTarget(d, line) {
  if (line.id !== 'CL-1') return line.target;
  const askCL1 = findLine(d, 'CL-1').supplierAmount || 0;
  const discount = assumVal(d, 'ASM-4', 18) / 100;
  const empRatio = assumVal(d, 'ASM-1', 18000) / 18000;
  return askCL1 * (1 - discount) * empRatio;
}

/* ---------- 2. PROPOSAL — render fns (each re-invoked on recalc) ---------- */
function renderLineChart(d) {
  const lines = d.commercialLines || [];
  const recurring = lines.filter(l => l.frequency === 'annual');
  const oneTime = lines.filter(l => l.frequency === 'one-time');
  const group = (title, rows) => {
    const max = Math.max.apply(null, rows.map(l => Math.max(l.id === 'CL-1' ? liveAsk(d) : l.supplierAmount, liveTarget(d, l))).concat([1]));
    return '<div class="eyebrow" style="margin:10px 0 4px">' + esc(title) + '</div>' +
      rows.map(l => {
        const ask = l.id === 'CL-1' ? liveAsk(d) : l.supplierAmount;
        const tgt = liveTarget(d, l);
        return barRow(esc(l.item) + ' — ask', ask, max, money(ask, { compact: true }), { color: 'pri', title: l.item + ' as drafted' }) +
          barRow(esc(l.item) + ' — target', tgt, max, money(tgt, { compact: true }), { color: 'teal', title: l.item + ' target position' });
      }).join('<div style="height:6px"></div>');
  };
  return group('Recurring (annual)', recurring) + group('One-time (services)', oneTime);
}
function renderLineItemsTable(d) {
  const cols = [
    { key: 'item', label: 'Line item', render: r => '<strong>' + esc(r.item) + '</strong><div class="tiny muted">' + esc(r.unit) + ' · ' + esc(r.frequency) + '</div>' },
    { key: 'ask', label: 'Ask (Y1)', align: 'num', sortVal: r => (r.id === 'CL-1' ? liveAsk(d) : r.supplierAmount),
      render: r => '<span id="li-ask-' + esc(r.id) + '">' + money(r.id === 'CL-1' ? liveAsk(d) : r.supplierAmount, { compact: true }) + '</span>' },
    { key: 'target', label: 'Target', align: 'num', sortVal: r => liveTarget(d, r),
      render: r => '<span id="li-target-' + esc(r.id) + '">' + money(liveTarget(d, r), { compact: true }) + '</span>' },
    { key: 'fallback', label: 'Fallback', align: 'num', sortVal: r => r.fallback, render: r => money(r.fallback, { compact: true }) },
    { key: 'maximumAcceptable', label: 'Max acceptable', align: 'num', sortVal: r => r.maximumAcceptable, render: r => money(r.maximumAcceptable, { compact: true }) },
    { key: 'negotiability', label: 'Negotiability', render: r => negPill(r.negotiability) },
    { key: 'evidenceType', label: 'Evidence', render: r => evidenceChip(r.evidenceType, { sources: r.sourceIds, short: true }) }
  ];
  return dataTable(cols, d.commercialLines || [], {
    id: 'cml-lineitems-tbl', zebra: true, dense: true,
    expand: r => '<div class="kv"><dt>Quantity</dt><dd>' + esc(r.quantity) + ' ' + esc(r.unit) + '</dd>' +
      '<dt>Sources</dt><dd>' + evidenceChip(r.evidenceType, { sources: r.sourceIds }) + '</dd></div>'
  });
}
function renderCashFlow(d) {
  const ask = (d.scenarios || []).find(s => s.id === 'SC-ask') || {};
  const years = yearlyCashFlow(d, ask);
  const max = Math.max.apply(null, years.concat([1]));
  return years.map((v, i) => barRow('Year ' + (i + 1), v, max, money(v, { compact: true }), { color: 'pri', title: 'Modeled Year ' + (i + 1) + ' cash, supplier-ask basis' })).join('');
}

/* ---------- 3. SCENARIOS — render fns (each re-invoked on recalc) -------- */
function renderWaterfall(d) {
  const scs = liveScenarios(d);
  const order = [
    ['SC-ask', 'total'], ['SC-max', 'down'], ['SC-fallback', 'down'], ['SC-target', 'final']
  ];
  const steps = order.map(([id, kind]) => {
    const s = scs.find(x => x.id === id) || { name: id, liveTotal: 0 };
    return { label: s.name, value: s.liveTotal, kind, display: money(s.liveTotal, { compact: true }) };
  });
  return waterfall(steps, {});
}
function renderTornado(d) {
  const target = (d.scenarios || []).find(s => s.id === 'SC-target');
  if (!target) return '';
  const rows = (d.assumptions || []).map(a => {
    const lo = scenarioModel(d, target, { [a.id]: a.min }).total;
    const hi = scenarioModel(d, target, { [a.id]: a.max }).total;
    return { a, lo: Math.min(lo, hi), hi: Math.max(lo, hi), swing: Math.abs(hi - lo) };
  }).sort((x, y) => y.swing - x.swing);
  const max = Math.max.apply(null, rows.map(r => r.swing).concat([1]));
  return rows.map(r => barRow(
    esc(r.a.label), r.swing, max, money(r.swing, { compact: true }),
    { color: 'emph', title: 'Range if set to min/max: ' + money(r.lo, { compact: true }) + ' – ' + money(r.hi, { compact: true }) + ' · materiality: ' + r.a.materiality }
  )).join('');
}
function patchScenarioTable(d) {
  liveScenarios(d).forEach(s => {
    const y1 = document.getElementById('sc-y1-' + s.id);
    if (y1) { y1.textContent = money(s.liveY1, { compact: true }); const td = y1.closest('td'); if (td) td.setAttribute('data-sv', String(s.liveY1)); }
    const tot = document.getElementById('sc-tot-' + s.id);
    if (tot) { tot.textContent = money(s.liveTotal, { compact: true }); const td = tot.closest('td'); if (td) td.setAttribute('data-sv', String(s.liveTotal)); }
  });
}
function patchLineTable(d) {
  (d.commercialLines || []).forEach(l => {
    const ask = document.getElementById('li-ask-' + l.id);
    if (ask) { const v = l.id === 'CL-1' ? liveAsk(d) : l.supplierAmount; ask.textContent = money(v, { compact: true }); const td = ask.closest('td'); if (td) td.setAttribute('data-sv', String(v)); }
    const tgt = document.getElementById('li-target-' + l.id);
    if (tgt) { const v = liveTarget(d, l); tgt.textContent = money(v, { compact: true }); const td = tgt.closest('td'); if (td) td.setAttribute('data-sv', String(v)); }
  });
}
function patchMisc(d) {
  const scs = liveScenarios(d);
  const ask = scs.find(s => s.id === 'SC-ask'), tgt = scs.find(s => s.id === 'SC-target');
  const gap = document.getElementById('cml-tcv-gap');
  if (gap && ask && tgt) gap.textContent = money(tgt.liveTotal - ask.liveTotal, { compact: true }) + ' vs. ask';
  const term = document.getElementById('cml-term-mirror');
  if (term) term.textContent = assumVal(d, 'ASM-2', 3) + ' yrs';
  const up = document.getElementById('cml-uplift-mirror');
  if (up) up.textContent = assumVal(d, 'ASM-3', 4) + '%';
  const npvEl = document.getElementById('cml-npv-target');
  if (npvEl && tgt) {
    const years = yearlyCashFlow(d, (d.scenarios || []).find(s => s.id === 'SC-target'));
    npvEl.textContent = money(npv(years, assumVal(d, 'ASM-5', 6)), { compact: true });
  }
}

/* ---------- 4. BENCHMARKS — numeric extraction from grounded strings ----- */
// Only the 3 real comparisons in d.benchmarks are used; numbers are parsed
// from the model's own comparisonValue / issue text, never invented.
function benchNumbers(bench, d) {
  if (bench.id === 'BENCH-int') {
    const nums = (bench.comparisonValue.match(/[\d.]+/g) || []).map(Number);
    return { ours: nums[0], compare: nums[1], oursLabel: 'This ask', compareLabel: 'Internal precedent', fmt: v => '$' + v };
  }
  if (bench.id === 'BENCH-svc') {
    const oursM = bench.comparisonValue.match(/\$([\d,]+)\/day/);
    const rangeM = bench.comparisonValue.match(/\$([\d,]+)[–-]([\d,]+)/);
    const ours = oursM ? parseFloat(oursM[1].replace(/,/g, '')) : null;
    const lo = rangeM ? parseFloat(rangeM[1].replace(/,/g, '')) : null;
    const hi = rangeM ? parseFloat(rangeM[2].replace(/,/g, '')) : null;
    const compare = (lo != null && hi != null) ? (lo + hi) / 2 : null;
    return { ours, compare, oursLabel: 'This SOW ($/day)', compareLabel: 'Internal norm (' + (lo != null ? '$' + lo.toLocaleString() + '–$' + hi.toLocaleString() : 'range') + ')', fmt: v => '$' + Math.round(v).toLocaleString() };
  }
  if (bench.id === 'BENCH-pub') {
    const iss = findIssue(d, 'ISS-04');
    const oursM = iss && iss.supplierPosition ? iss.supplierPosition.match(/(\d+)\s*days/i) : null;
    const ours = oursM ? parseFloat(oursM[1]) : null;
    const nums = (bench.comparisonValue.match(/\d+/g) || []).map(Number);
    const compare = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : null;
    return { ours, compare, oursLabel: 'Our draft (notice days)', compareLabel: 'Market typical (' + bench.comparisonValue + ')', fmt: v => Math.round(v) + 'd' };
  }
  return { ours: null, compare: null, fmt: v => String(v) };
}
function renderBenchmarkCard(bench, d) {
  const n = benchNumbers(bench, d);
  const max = Math.max(n.ours || 0, n.compare || 0, 1) * 1.15;
  const chart = (n.ours != null && n.compare != null)
    ? barRow(n.oursLabel, n.ours, max, n.fmt(n.ours), { color: 'pri' }) + barRow(n.compareLabel, n.compare, max, n.fmt(n.compare), { color: 'teal' })
    : gapCard('Not directly comparable', 'This benchmark is context only — no like-for-like figure to bar-chart.');
  return saCard(bench.item, chart +
    '<div style="margin-top:9px; display:flex; gap:8px; align-items:center; flex-wrap:wrap">' +
      compPill(bench.comparability) + evidenceChip(bench.evidenceType, { sources: [bench.sourceId] }) +
    '</div>' +
    collapsible('Methodology & caveat', '<p style="margin:0">' + esc(bench.explanation) + '</p>'),
    { accent: 'teal', icon: 'bench' }
  );
}

/* ---------- 5. TAB ASSEMBLY ----------------------------------------------- */
function renderTab_commercials(d) {
  baseline(d); // lock in generation-time figures before any interaction

  const scs = liveScenarios(d);
  const concernIssues = (d.issues || []).filter(i => i.category === 'Commercial' || i.id === 'ISS-04');

  /* ---- PROPOSAL subtab ---- */
  const proposal =
    '<div class="tab-intro"><h2>Proposal</h2><p class="q">What Visier is proposing, normalized against Lilly’s internal ' +
    'negotiating positions — a sample session-snapshot read of DOC-01/02/03.</p></div>' +
    '<div class="grid">' +
      '<div class="col-7">' + saCard('Ask vs. Target — By Line Item', '<div id="cml-linechart">' + renderLineChart(d) + '</div>' +
        insight('Ask reflects the Order Form / SOW figure (contract fact); target, fallback and maximum-acceptable are calculated negotiation positions, not contract terms.'),
        { accent: 'plum', icon: 'money', sub: coverageBadge('Strong') }) + '</div>' +
      '<div class="col-5">' + saCard('Normalized Line Items', '<div id="cml-lineitems-table">' + renderLineItemsTable(d) + '</div>',
        { icon: 'doc', sub: '5 lines · ' + esc((d.commercialLines || []).length) + ' rows' }) + '</div>' +
      '<div class="col-6">' + saCard('Cash Flow by Contract Year', '<div id="cml-cashflow">' + renderCashFlow(d) + '</div>' +
        insight('Supplier-ask basis; one-time services land in Year 1 only, recurring lines carry the post-term uplift assumption from Year 2 onward.'),
        { accent: 'teal', icon: 'scenarios' }) + '</div>' +
      '<div class="col-6">' + saCard('Commercial Terms', (function () {
        const term = findIssue(d, 'ISS-04'); const uplift = findIssue(d, 'ISS-11');
        const initTerm = (d.assumptions || []).find(a => a.id === 'ASM-2') || { value: 3, evidenceType: 'contract' };
        const upliftA = (d.assumptions || []).find(a => a.id === 'ASM-3') || { value: 4, evidenceType: 'assumption' };
        return '<dl class="kv">' +
          '<dt>Initial term</dt><dd><span id="cml-term-mirror">' + esc(initTerm.value) + ' yrs</span> ' + evidenceChip(initTerm.evidenceType, { short: true }) + '</dd>' +
          '<dt>Auto-renewal</dt><dd>' + (term ? severityPill(term.priority) : '') + ' ' + (term ? esc(term.title) : 'n/a') + ' ' + jumpLink('view →', 'tab:contract/sub:terms') + '</dd>' +
          '<dt>Post-term uplift (model input)</dt><dd><span id="cml-uplift-mirror">' + esc(upliftA.value) + '%</span> ' + evidenceChip(upliftA.evidenceType, { short: true }) + ' <span class="tiny muted">local assumption, used for Y2+ modeling only</span></dd>' +
          '<dt>Post-term price cap</dt><dd>' + (uplift ? severityPill(uplift.priority) : '') + ' ' + (uplift ? esc(uplift.title) : 'n/a') + ' ' + jumpLink('view →', 'tab:contract/sub:terms') + '</dd>' +
          '<dt>Payment / invoicing schedule</dt><dd>' + evidenceChip('unavailable') + ' <span class="tiny muted">not specified in this session</span></dd>' +
        '</dl>';
      })(), { icon: 'scale' }) + '</div>' +
      '<div class="col-12">' + saCard('Commercial Concerns Feeding This Analysis', concernIssues.map(i =>
        '<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:8px 0">' +
          severityPill(i.priority) + '<strong style="flex:1 1 260px; min-width:0">' + esc(i.title) + '</strong>' +
          '<span class="tiny muted" style="flex:2 1 320px">' + esc(i.deviation) + '</span>' +
          evidenceChip(i.evidenceType, { sources: i.sourceIds, short: true }) +
          jumpLink('Register →', 'tab:contract/sub:terms') +
        '</div>'
      ).join('<div class="divider"></div>'), { accent: 'emph', icon: 'flag' }) + '</div>' +
    '</div>';

  /* ---- SCENARIOS subtab ---- */
  const scenarioTable = dataTable(
    [
      { key: 'name', label: 'Scenario', render: r => '<strong>' + esc(r.name) + '</strong><div class="tiny muted">' + esc(r.basis) + '</div>' },
      { key: 'liveY1', label: 'Year-1', align: 'num', sortVal: r => r.liveY1, render: r => '<span id="sc-y1-' + esc(r.id) + '">' + money(r.liveY1, { compact: true }) + '</span>' },
      { key: 'liveTotal', label: 'TCV (initial term)', align: 'num', sortVal: r => r.liveTotal, render: r => '<span id="sc-tot-' + esc(r.id) + '">' + money(r.liveTotal, { compact: true }) + '</span>' },
      { key: 'evidenceType', label: 'Evidence', render: r => evidenceChip(r.evidenceType, { short: true }) }
    ],
    scs,
    { id: 'cml-scenario-tbl', zebra: true, expand: r => insight(r.interpretation) }
  );
  const assumptionsHtml = (d.assumptions || []).map(a => assumptionSlider(a)).join('');
  const scenarios =
    '<div class="tab-intro"><h2>Scenarios</h2><p class="q">If Lilly holds firm at each position, what is the total contract value over the ' +
    'initial term — and which assumption moves that number most? <span class="tiny muted">Sliders are local to this snapshot; reset restores the generated figures exactly.</span></p></div>' +
    '<div class="grid">' +
      '<div class="col-7">' + saCard('Ask → Negotiated Value Ladder', '<div id="cml-waterfall">' + renderWaterfall(d) + '</div>' +
        '<div class="kv" style="margin-top:10px">' +
          '<dt>Target vs. ask (initial term)</dt><dd><span id="cml-tcv-gap" class="mono">' + money((scs.find(s => s.id === 'SC-target') || {}).liveTotal - (scs.find(s => s.id === 'SC-ask') || {}).liveTotal, { compact: true }) + ' vs. ask</span></dd>' +
          '<dt>NPV of target (at prepay discount rate)</dt><dd><span id="cml-npv-target" class="mono">' + money(npv(yearlyCashFlow(d, (d.scenarios || []).find(s => s.id === 'SC-target')), assumVal(d, 'ASM-5', 6)), { compact: true }) + '</span> ' + evidenceChip('calculated', { short: true }) + '</dd>' +
        '</div>',
        { accent: 'plum', icon: 'scenarios', sub: coverageBadge('Moderate') }) + '</div>' +
      '<div class="col-5">' + saCard('Scenario Comparison', scenarioTable, { icon: 'target' }) + '</div>' +
      '<div class="col-6">' + saCard('Assumptions (editable, local)', assumptionsHtml +
        '<div class="btn-row"><button class="btn" data-reset-assumptions>' + icon('reset') + 'Reset to generated values</button></div>',
        { icon: 'assume', accent: 'emph' }) + '</div>' +
      '<div class="col-6">' + saCard('Sensitivity — Swing on the Target TCV', '<div id="cml-tornado">' + renderTornado(d) + '</div>' +
        insight('Each bar is the target scenario’s total swing when that assumption moves across its full min–max range, others held at current value; sorted by size.'),
        { icon: 'scale' }) + '</div>' +
    '</div>';

  /* ---- BENCHMARKS subtab ---- */
  const benches = d.benchmarks || [];
  const benchmarks = benches.length
    ? '<div class="tab-intro"><h2>Benchmarks</h2><p class="q">Only comparisons backed by a real source are shown here — no fabricated ' +
      'market percentiles or should-cost precision.</p></div>' +
      '<div class="grid">' + benches.map(b => '<div class="col-4">' + renderBenchmarkCard(b, d) + '</div>').join('') + '</div>' +
      '<div style="margin-top:14px">' + insight('Benchmark coverage rests on a single internal precedent plus one weak-comparability public figure; a prior Visier quote or competing bid (' + jumpLink('GAP-4', 'tab:sources') + ') would firm the platform-pricing target.', 'warn') + '</div>'
    : '<div class="tab-intro"><h2>Benchmarks</h2></div>' + gapCard('No comparable benchmark in this session', 'No internal precedent or credible external comparison was available at generation time.');

  /* ---- assemble ---- */
  const html =
    '<div class="subtabbar" data-subtab-group="commercials"><div class="wrap">' +
      '<button class="subtab-btn" data-subtab="proposal" aria-selected="true">Proposal</button>' +
      '<button class="subtab-btn" data-subtab="scenarios">Scenarios</button>' +
      '<button class="subtab-btn" data-subtab="benchmarks">Benchmarks</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
      '<div data-subpanel="commercials/proposal" class="is-active">' + proposal + '</div>' +
      '<div data-subpanel="commercials/scenarios">' + scenarios + '</div>' +
      '<div data-subpanel="commercials/benchmarks">' + benchmarks + '</div>' +
    '</div></div>';

  return html;
}

/* ---------- 6. wire recalculation once at module load -------------------- */
if (typeof global.DealUI !== 'undefined' && typeof global.DealUI.onRecalc === 'function') {
  global.DealUI.onRecalc(function (d) {
    const wf = document.getElementById('cml-waterfall'); if (wf) wf.innerHTML = renderWaterfall(d);
    const tornado = document.getElementById('cml-tornado'); if (tornado) tornado.innerHTML = renderTornado(d);
    const lc = document.getElementById('cml-linechart'); if (lc) lc.innerHTML = renderLineChart(d);
    const cf = document.getElementById('cml-cashflow'); if (cf) cf.innerHTML = renderCashFlow(d);
    patchScenarioTable(d);
    patchLineTable(d);
    patchMisc(d);
  });
}

/* ---------- 7. exports ----------------------------------------------------*/
global.renderTab_commercials = renderTab_commercials;
global.DealTabs = global.DealTabs || {};
global.DealTabs.commercials = renderTab_commercials;

})(typeof window !== 'undefined' ? window : this);
