/* =============================================================================
 * helpers.js, shared render + interaction helpers for the Deal artifact.
 * The 5 tab builders (Brief / Contract / Commercials / Negotiation / Sources)
 * MUST use these verbatim so the artifact reads as one system.
 *
 * ─────────────────────────  BUILDER CONVENTION  ─────────────────────────────
 * 1. Every helper that renders returns an HTML STRING. Compose with template
 *    literals; never build detached DOM in a builder.
 * 2. Each tab builder is a function on window.DealTabs, e.g.
 *        window.DealTabs.brief = (d) => `...html...`;   // d === dashboardData
 *    The shell calls it once and injects the string into the tab panel.
 * 3. STRUCTURE the shell (built by the shell author, not the tab builders):
 *        <div class="tabbar"><div class="wrap">
 *           <button class="tab-btn" data-tab="brief" ...>…</button> … </div></div>
 *        <div data-tabpanel="brief">…</div>  (one per tab)
 *    Subtabs INSIDE a panel:
 *        <div class="subtabbar" data-subtab-group="contract"><div class="wrap">
 *           <button class="subtab-btn" data-subtab="map">…</button> …</div></div>
 *        <div data-subpanel="contract/map">…</div>  (id = "group/key")
 * 4. Interaction is DELEGATED and wired on load by DealUI.init(), builders only
 *    emit the right data-attributes (documented per helper below). No inline
 *    onclick. Allowed controls ONLY: show-evidence, expand/collapse, filter,
 *    sort, change-assumption+recalc+reset, copy, print, jump. Nothing else.
 * 5. Assumptions: emit assumptionSlider(a); register a recompute callback with
 *    DealUI.onRecalc(fn). Editing any slider updates dashboardData.assumptions
 *    live value and runs every registered fn. resetAssumptions() restores.
 * 6. EVERY material value must be followed by evidenceChip(type). No exceptions.
 * ─────────────────────────────────────────────────────────────────────────── */
(function (global) {
'use strict';

/* ---------- 0. tiny utils ------------------------------------------------- */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const money = (n, opts) => {
  if (n == null || isNaN(n)) return '—';
  const o = opts || {};
  if (o.compact && Math.abs(n) >= 1000) {
    const m = n / 1e6;
    return '$' + (Math.abs(m) >= 1 ? m.toFixed(2).replace(/\.00$/, '') + 'M'
                                   : (n / 1e3).toFixed(0) + 'K');
  }
  return '$' + Math.round(n).toLocaleString('en-US');
};
const pct = (n, d) => (n == null ? '—' : (d ? n.toFixed(d) : Math.round(n)) + '%');
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const uid = (() => { let i = 0; return (p) => (p || 'u') + '-' + (++i); })();

/* ---------- 0b. shared data/format helpers (used by 2+ tab builders) ------
 * Moved here from tab-commercials.js during the ZOPA extraction (2026-07-23):
 * each was defined locally in that file but used by BOTH the ZOPA render and
 * the rest of the Economics tab (and now also by zopa.js), so one global
 * copy replaces what were two independently-drifting local definitions. --- */
const clampp = clamp;                                     // alias: same clamp(), the name the ZOPA/Economics code uses
// compact money with a clean minus sign (money() alone renders "$-350K")
const M = (n) => { if (n == null || isNaN(n)) return '—'; return (n < 0 ? '−' : '') + money(Math.abs(n), { compact: true }); };
function assumVal(d, id, fb) { const a = (d.assumptions || []).find(x => x.id === id); return a ? a.value : fb; }
// benchmark -> line mapping (BENCH-int is the platform $/emp figure = CL-1;
// BENCH-svc is the implementation day-rate = CL-2). No line link in the data.
function benchForLine(d, id) {
  const map = { 'CL-1': 'BENCH-int', 'CL-2': 'BENCH-svc' };
  const bid = map[id];
  return bid ? (d.benchmarks || []).find(b => b.id === bid) : null;
}

/* ---------- 1. ICON LIBRARY (inline SVG, no external assets) -------------- */
// Usage: icon('scale')  ->  '<svg …>…</svg>'. Add new icons HERE only.
const ICONS = {
  brief:     '<path d="M4 4h16v16H4z" opacity=".0"/><path d="M6 4h9l4 4v12H6z"/><path d="M15 4v4h4"/><path d="M9 13h6M9 16h4"/>',
  doc:       '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h6M10 15h6M10 18h3"/>',
  scale:     '<path d="M12 3v18"/><path d="M6 7h12"/><path d="M6 7l-3 6h6z"/><path d="M18 7l-3 6h6z"/><path d="M8 21h8"/>',
  shield:    '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',
  money:     '<path d="M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.3-5 3.2c0 4.3 10 2.2 10 6.6 0 1.9-2.2 3.2-5 3.2s-5-1.1-5-3"/>',
  scenarios: '<path d="M4 19V5M4 19h16"/><path d="M8 15l3-4 3 2 4-6"/>',
  bench:     '<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>',
  handshake: '<path d="M8 12l3 3 2-2 3 3"/><path d="M3 8l4-2 5 3 5-3 4 2v6l-4 3-5-4-5 4-4-3z"/>',
  target:    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  trade:     '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  meeting:   '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8M12 18v3"/>',
  sources:   '<path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/>',
  assume:    '<path d="M12 3a9 9 0 100 18 9 9 0 000-18z"/><path d="M9.5 9a2.5 2.5 0 013.9-2c1.3.8 1 2.4-.4 3.2-.9.5-1 .9-1 1.8"/><path d="M12 17h.01"/>',
  gap:       '<path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.4 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  raci:      '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
  clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flag:      '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  eye:       '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  copy:      '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/>',
  print:     '<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M8 17h8v4H8z"/>',
  reset:     '<path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.3M3 3v4h4"/>',
  chevron:   '<path d="M9 6l6 6-6 6"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
};
function icon(name) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.info) + '</svg>';
}

/* ---------- 2. EVIDENCE + COVERAGE ---------------------------------------- */
// evidenceType set (matches data.js): contract|internal|public|calculated|inference|assumption|unavailable
const EV_META = {
  contract:    { label: 'Contract fact',   cls: 'ev-contract' },
  internal:    { label: 'Internal fact',   cls: 'ev-internal' },
  public:      { label: 'Public fact',     cls: 'ev-public' },
  calculated:  { label: 'Calculated',      cls: 'ev-calculated' },
  inference:   { label: 'Claude inference',cls: 'ev-inference' },
  assumption:  { label: 'User assumption', cls: 'ev-assumption' },
  unavailable: { label: 'Unavailable',     cls: 'ev-unavailable' }
};
// evidenceChip(type, {short, sources}) -> chip; if sources given, becomes a jump-to-source affordance.
function evidenceChip(type, opts) {
  const o = opts || {}; const m = EV_META[type] || EV_META.inference;
  const txt = o.short ? m.label.split(' ')[0] : m.label;
  const src = (o.sources && o.sources.length)
    ? ' data-jump="tab:brief" title="' + esc(m.label) + ' · ' + esc(o.sources.join(', ')) + '"'
    : ' title="' + esc(m.label) + '"';
  return '<span class="ev ' + m.cls + '"' + src + '>' + esc(txt) + '</span>';
}
// coverageBadge('Strong'|'Moderate'|'Limited')
function coverageBadge(level) {
  const key = String(level || '').toLowerCase();
  const cls = key === 'strong' ? 'cov-strong' : key === 'limited' ? 'cov-limited' : 'cov-moderate';
  return '<span class="cov ' + cls + '"><span class="dots"><i></i><i></i><i></i></span>' +
         esc(level || 'Moderate') + ' evidence</span>';
}

/* ---------- 3. SEVERITY / STATUS PILLS ------------------------------------ */
const SEV_LABEL = { 'hard-stop':'Hard stop', high:'High', medium:'Medium', low:'Low' };
// Severity is icon-led: hard-stop is a GATE (stop sign), high/medium/low a magnitude ramp
// (arrow-up / straight line / arrow-down). Colour comes from CSS (.sev-*); the icon inherits it
// via currentColor. The word stays for legibility + carries the aria-label/title.
const SEV_ICON = {
  'hard-stop':'<svg class="sev-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/></svg>',
  high:'<svg class="sev-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  medium:'<svg class="sev-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  low:'<svg class="sev-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>'
};
function severityPill(priority) {
  const p = priority || 'medium';
  const label = SEV_LABEL[p] || p;
  // icon-only chip: the shape + colour carry the severity; the word is kept as a hover title
  // and a visually-hidden label so tables stay scannable and screen readers still read it.
  return '<span class="pill sev-' + esc(p) + ' sev-iconly" title="' + esc(label) + '" aria-label="' + esc(label) + '">' +
    (SEV_ICON[p] || '') + '<span class="sev-sr">' + esc(label) + '</span></span>';
}
function statusPill(status, label) {
  const map = { aligned:'ok', partial:'warn', deviation:'danger', missing:'muted',
                accept:'ok', reject:'danger', trade:'info', pending:'warn' };
  return '<span class="pill ' + (map[status] || 'muted') + '">' + esc(label || status) + '</span>';
}

/* ---------- 4. SA-CARD ---------------------------------------------------- */
// saCard(title, innerHTML, {accent:'plum'|'teal'|'emph'|'danger'|'warn', icon:'scale',
//                           sub:'right-aligned meta html', id, bodyClass})
function saCard(title, inner, opts) {
  const o = opts || {};
  const acc = o.accent && o.accent !== 'plum' ? ' accent-' + o.accent : '';
  const ic = o.icon ? '<span class="ch-ic">' + icon(o.icon) + '</span>' : '';
  const sub = o.sub ? '<span class="cs">' + o.sub + '</span>' : '';
  const id = o.id ? ' id="' + esc(o.id) + '"' : '';
  const bc = o.bodyClass ? ' ' + o.bodyClass : '';
  return '<section class="sa-card' + acc + '"' + id + '>' +
    '<header class="card-hd">' + ic + '<span class="ct">' + esc(title) + '</span>' + sub + '</header>' +
    '<div class="card-bd' + bc + '">' + (inner || '') + '</div></section>';
}
// insight(text, tone), a SHORT supporting narrative line (never a wall). tone: ''|'warn'|'danger'
function insight(text, tone) {
  return '<div class="insight ' + (tone || '') + '"><span class="ib"></span><span>' + text + '</span></div>';
}

/* ---------- 5. TABLE ------------------------------------------------------ */
// dataTable(cols, rows, opts)
//   cols: [{ key, label, align:'left'|'num', width, sort:true, render:(row)=>html }]
//   rows: array of plain objects
//   opts: { zebra, dense, id, sortable:true, filterId, rowClass:(row)=>'', expand:(row)=>html|null }
// Emits sortable headers (th[data-sort]) and, when expand() returns html, expandable rows.
function dataTable(cols, rows, opts) {
  const o = opts || {}; const tid = o.id || uid('tbl');
  const head = '<tr>' + cols.map(c => {
    const cls = (c.align === 'num' ? 'num' : '');
    const st = (o.sortable !== false && c.sort !== false) ? ' data-sort="' + esc(c.key) + '"' : '';
    const w = c.width ? ' style="width:' + esc(c.width) + '"' : '';
    return '<th class="' + cls + '"' + st + w + '>' + esc(c.label) + '</th>';
  }).join('') + '</tr>';
  const body = rows.map((r, i) => {
    const rc = o.rowClass ? o.rowClass(r) : '';
    const exp = o.expand ? o.expand(r) : null;
    const key = (r.id != null ? r.id : i);
    let tr = '<tr class="' + rc + (exp ? ' expandable' : '') + '"' +
      (exp ? ' data-exprow="' + esc(tid + '-' + key) + '"' : '') +
      ' data-rowkey="' + esc(key) + '">' +
      cols.map(c => {
        const cls = (c.align === 'num' ? 'num' : '');
        const val = c.render ? c.render(r) : esc(r[c.key]);
        const sv = c.sortVal ? ' data-sv="' + esc(c.sortVal(r)) + '"' : '';
        return '<td class="' + cls + '"' + sv + '>' + val + '</td>';
      }).join('') + '</tr>';
    if (exp) tr += '<tr class="expander-row is-hidden" data-expfor="' + esc(tid + '-' + key) +
      '"><td colspan="' + cols.length + '"><div class="exp-inner">' + exp + '</div></td></tr>';
    return tr;
  }).join('');
  const cls = 'dt' + (o.zebra ? ' zebra' : '') + (o.dense ? ' dense' : '');
  const filterAttr = o.filterId ? ' data-filter-target="' + esc(o.filterId) + '"' : '';
  return '<div class="tbl-wrap"><table class="' + cls + '" id="' + esc(tid) + '"' + filterAttr +
    '><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
}

/* ---------- 6. COLLAPSIBLE / EXCERPT -------------------------------------- */
// collapsible(summaryHTML, innerHTML, {open, tone}) -> <details>
function collapsible(summary, inner, opts) {
  const o = opts || {};
  return '<details class="collapsible"' + (o.open ? ' open' : '') + '>' +
    '<summary>' + summary + '</summary><div class="cl-body">' + inner + '</div></details>';
}
function excerpt(text) { return '<div class="excerpt">' + esc(text) + '</div>'; }

/* ---------- 7. VIZ PRIMITIVES --------------------------------------------- */
// miniBar(value, max, {color:'teal'|'pri'|'emph'|'danger'|'warn', title}) -> inline bar
function miniBar(value, max, opts) {
  const o = opts || {}; const w = clamp(max ? (value / max) * 100 : 0, 0, 100);
  const c = o.color && o.color !== 'teal' ? ' ' + o.color : '';
  const t = o.title ? ' title="' + esc(o.title) + '"' : '';
  return '<span class="minibar' + c + '"' + t + '><span style="width:' + w.toFixed(1) + '%"></span></span>';
}
// barRow(label, value, max, formatted, opts) -> a labelled comparison bar row
function barRow(label, value, max, formatted, opts) {
  return '<div class="bar-row"><span class="bl">' + esc(label) + '</span>' +
    miniBar(value, max, opts) + '<span class="bv">' + (formatted != null ? formatted : value) + '</span></div>';
}
// heatCell(value, {scale:5, label, title}) -> intensity cell (0..scale -> heat-0..heat-5)
function heatCell(value, opts) {
  const o = opts || {}; const scale = o.scale || 5;
  const lvl = clamp(Math.round((value / scale) * 5), 0, 5);
  const t = o.title ? ' title="' + esc(o.title) + '"' : '';
  return '<span class="heatcell heat-' + lvl + '"' + t + '>' + esc(o.label != null ? o.label : value) + '</span>';
}
// matrixPlot(points, {xLabel, yLabel, xMax, yMax, quadrants:[tl,tr,bl,br]})
//   points: [{ x, y, label, color:'pri'|'teal'|'emph'|'danger', title, jump }]
function matrixPlot(points, opts) {
  const o = opts || {}; const xMax = o.xMax || 5, yMax = o.yMax || 5;
  const pts = points.map(p => {
    const left = clamp((p.x / xMax) * 100, 2, 98);
    const bottom = clamp((p.y / yMax) * 100, 2, 98);
    const c = p.color ? ' ' + p.color : '';
    const j = p.jump ? ' data-jump="' + esc(p.jump) + '"' : '';
    return '<button class="mx-pt' + c + '" style="left:' + left.toFixed(1) + '%;bottom:' + bottom.toFixed(1) +
      '%"' + j + ' title="' + esc(p.title || p.label) + '">' + esc(p.label) + '</button>';
  }).join('');
  const q = o.quadrants || [];
  const quad = (q.length === 4) ?
    '<span class="mx-quad" style="left:2%;top:4%">' + esc(q[0]) + '</span>' +
    '<span class="mx-quad" style="right:2%;top:4%">' + esc(q[1]) + '</span>' +
    '<span class="mx-quad" style="left:2%;bottom:4%">' + esc(q[2]) + '</span>' +
    '<span class="mx-quad" style="right:2%;bottom:4%">' + esc(q[3]) + '</span>' : '';
  return '<div style="padding:0 10px 26px 20px"><div class="matrix">' + quad + pts +
    '<span class="mx-axis-x">' + esc(o.xLabel || '') + '</span>' +
    '<span class="mx-axis-y">' + esc(o.yLabel || '') + '</span></div></div>';
}
// waterfall(steps, {height}) steps:[{label, value, kind:'total'|'up'|'down'|'final', display}]
//   Bars are sized to each step's absolute value against the max; kind sets colour + meaning.
function waterfall(steps, opts) {
  const o = opts || {}; const max = Math.max.apply(null, steps.map(s => Math.abs(s.value))) || 1;
  const cols = steps.map(s => {
    const h = clamp((Math.abs(s.value) / max) * 100, 3, 100);
    return '<div class="wf-col"><span class="wf-val">' + (s.display != null ? s.display : s.value) + '</span>' +
      '<div class="wf-bar ' + (s.kind || 'total') + '" style="height:' + h.toFixed(1) + '%"></div>' +
      '<span class="wf-lbl">' + esc(s.label) + '</span></div>';
  }).join('');
  return '<div class="waterfall">' + cols + '</div>';
}
// timeline(items) items:[{date, name, meta, tone:'pri'|'emph'|''}]
function timeline(items) {
  return '<div class="timeline"><span class="tl-track"></span>' + items.map(it =>
    '<div class="tl-item ' + (it.tone || '') + '"><div class="tl-date">' + esc(it.date) + '</div>' +
    '<div class="tl-name">' + esc(it.name) + '</div>' +
    (it.meta ? '<div class="tl-meta">' + it.meta + '</div>' : '') + '</div>').join('') + '</div>';
}
// gantt(rows, {start, end}) rows:[{label, start, end, tone}] dates as YYYY-MM-DD; positions by day.
function gantt(rows, opts) {
  const o = opts || {}; const t0 = +new Date(o.start), t1 = +new Date(o.end); const span = (t1 - t0) || 1;
  const body = rows.map(r => {
    const a = clamp(((+new Date(r.start) - t0) / span) * 100, 0, 100);
    const b = clamp(((+new Date(r.end) - t0) / span) * 100, 0, 100);
    return '<div class="gantt-row"><span class="bl" style="font-weight:600">' + esc(r.label) + '</span>' +
      '<div class="gantt-track"><div class="gantt-fill ' + (r.tone || '') + '" style="left:' + a.toFixed(1) +
      '%;width:' + Math.max(b - a, 4).toFixed(1) + '%">' + esc(r.badge || '') + '</div></div></div>';
  }).join('');
  return '<div class="gantt">' + body + '</div>';
}

/* ---------- 8. ASSUMPTION SLIDER (LOCAL) ---------------------------------- */
// assumptionSlider(a), a is a dashboardData.assumptions[] entry.
// Emits a range input wired to DealUI; editing updates a.value and runs recalc callbacks.
function assumptionSlider(a, extra) {
  const disp = a.unit === '%' ? a.value + '%' : (a.value.toLocaleString('en-US') + (a.unit ? ' ' + a.unit : ''));
  return '<div class="asm-ctrl">' +
    '<div class="asm-top"><label for="asm-' + esc(a.id) + '">' + esc(a.label) + '</label>' +
    '<span class="asm-val" data-asm-out="' + esc(a.id) + '">' + esc(disp) + '</span>' + (extra || '') + '</div>' +
    '<input type="range" id="asm-' + esc(a.id) + '" data-assumption="' + esc(a.id) + '" data-unit="' + esc(a.unit || '') +
    '" min="' + a.min + '" max="' + a.max + '" step="' + a.step + '" value="' + a.value + '">' +
    '<div class="asm-badge">' + evidenceChip(a.evidenceType || a.classification, { short: true }) +
    ' <span class="local-flag">Local</span> · materiality: ' + esc(a.materiality) + '</div></div>';
}

/* ---------- 9. GAP CARD (renders instead of a fabricated empty panel) ----- */
function gapCard(title, note) {
  return '<div class="gap-card"><div class="gc-hd">' + icon('gap') + esc(title) + '</div>' +
    '<div class="card-note" style="margin-top:6px">' + note + '</div></div>';
}

/* ---------- 10. jump helper (for building data-jump strings) -------------- */
// jumpLink(text, target) target: "tab:commercials/sub:deal" or "el:SOME-ID"
function jumpLink(text, target) {
  return '<span class="jump" data-jump="' + esc(target) + '">' + esc(text) + '</span>';
}
function copyBtn(label, targetSel, rawText) {
  const data = rawText != null ? ' data-copy-text="' + esc(rawText) + '"' : ' data-copy="' + esc(targetSel) + '"';
  return '<button class="btn"' + data + '>' + icon('copy') + esc(label || 'Copy') + '</button>';
}

/* =========================================================================
 *  INTERACTION LAYER, DealUI  (wired once on load via DealUI.init())
 * ========================================================================= */
const recalcFns = [];
const assumptionOriginals = {};

const DealUI = {
  onRecalc(fn) { if (typeof fn === 'function') recalcFns.push(fn); },
  recalc() { recalcFns.forEach(fn => { try { fn(global.dashboardData); } catch (e) { console.error(e); } }); },

  // ---- tab + subtab routing ----
  showTab(key) {
    if (!document.querySelector('[data-tabpanel="' + key + '"]')) return;  // guard: never blank the page on a stale jump
    document.querySelectorAll('[data-tab]').forEach(b =>
      b.setAttribute('aria-selected', b.getAttribute('data-tab') === key ? 'true' : 'false'));
    document.querySelectorAll('[data-tabpanel]').forEach(p =>
      p.classList.toggle('is-active', p.getAttribute('data-tabpanel') === key));
    if (history.replaceState) history.replaceState(null, '', '#' + key);
    window.scrollTo({ top: 0, behavior: 'auto' });
  },
  showSubtab(group, key) {
    document.querySelectorAll('[data-subtab-group="' + group + '"] [data-subtab]').forEach(b =>
      b.setAttribute('aria-selected', b.getAttribute('data-subtab') === key ? 'true' : 'false'));
    document.querySelectorAll('[data-subpanel]').forEach(p => {
      const id = p.getAttribute('data-subpanel');
      if (id.indexOf(group + '/') === 0) p.classList.toggle('is-active', id === group + '/' + key);
    });
  },
  jump(target) {
    // "tab:contract/sub:terms"  |  "tab:brief"  |  "el:ISS-01"
    if (target.indexOf('el:') === 0) {
      const el = document.getElementById(target.slice(3));
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1200); }
      return;
    }
    const tabM = target.match(/tab:([^/]+)/); const subM = target.match(/sub:([^/]+)/);
    if (tabM) this.showTab(tabM[1]);
    if (subM && tabM) this.showSubtab(tabM[1], subM[1]);
  },

  gotoFinding(id) {
    // Deep-link from the Protection Scorecard / Cross-Doc panel to the EXACT finding
    // row in the Findings Register (Legal & Protection subtab): switch there, expand
    // that row, scroll it into view + flash. Used by [data-gotofinding="ISS-xx"].
    this.jump('tab:contract/sub:legal');
    const open = () => {
      const row = document.querySelector('[data-exprow="' + id + '"]');
      if (!row) return;
      row.classList.remove('is-hidden');                 // in case a filter hid it
      if (!row.classList.contains('is-open')) {
        row.classList.add('is-open');
        const exp = document.querySelector('[data-expfor="' + id + '"]');
        if (exp) exp.classList.remove('is-hidden');
      }
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('flash'); setTimeout(() => row.classList.remove('flash'), 1400);
    };
    setTimeout(open, 60);
  },

  toast(msg) {
    let t = document.querySelector('.copied-toast');
    if (!t) { t = document.createElement('div'); t.className = 'copied-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 1500);
  },

  init() {
    if (this._inited) return; this._inited = true;   // idempotent: the shell owns mount+init timing
    // snapshot originals for reset
    (global.dashboardData.assumptions || []).forEach(a => { assumptionOriginals[a.id] = a.value; });

    // one delegated click handler for the whole document
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tab],[data-subtab],[data-jump],[data-gotofinding],[data-copy],[data-copy-text],[data-print],[data-reset-assumptions],[data-exprow],tr.expandable,[data-filterchip],[data-theme-toggle],[data-lpview],[data-lpclear],[data-scpick],[data-pf-view]');
      if (!t) return;

      if (t.hasAttribute('data-tab')) { this.showTab(t.getAttribute('data-tab')); return; }
      if (t.hasAttribute('data-subtab')) {
        const grp = t.closest('[data-subtab-group]');
        if (grp) this.showSubtab(grp.getAttribute('data-subtab-group'), t.getAttribute('data-subtab'));
        return;
      }
      if (t.hasAttribute('data-jump')) { this.jump(t.getAttribute('data-jump')); return; }
      if (t.hasAttribute('data-gotofinding')) { this.gotoFinding(t.getAttribute('data-gotofinding')); return; }
      // Legal & Protection navigator: segmented toggle between the Protections and
      // Obligations accordion groups. Scoped to the nearest .lp-nav so it never
      // touches other tabs; drives the seg-button aria-selected + group [hidden].
      if (t.hasAttribute('data-lpview')) {
        const view = t.getAttribute('data-lpview');
        const nav = t.closest('.lp-nav') || document;
        nav.querySelectorAll('[data-lpview]').forEach(b =>
          b.setAttribute('aria-selected', b.getAttribute('data-lpview') === view ? 'true' : 'false'));
        nav.querySelectorAll('[data-lpgroup]').forEach(g => { g.hidden = (g.getAttribute('data-lpgroup') !== view); });
        return;
      }
      // Legal & Protection register: clear the search box + un-press every chip in
      // this filter scope, then re-run the (now empty) filter so all rows show.
      if (t.hasAttribute('data-lpclear')) {
        const scope = t.closest('[data-filter-scope]') || document;
        const box = scope.querySelector('[data-filter-input]');
        if (box) box.value = '';
        scope.querySelectorAll('[data-filterchip][aria-pressed="true"]').forEach(c => c.setAttribute('aria-pressed', 'false'));
        this.applyChipFilters(scope);
        return;
      }
      // Scope reconciliation master-detail: clicking a list row (data-scpick="id") selects it and
      // reveals the matching detail panel (data-scpanel="id") within the nearest [data-scmaster].
      if (t.hasAttribute('data-scpick')) {
        const id = t.getAttribute('data-scpick');
        const m = t.closest('[data-scmaster]') || document;
        m.querySelectorAll('[data-scpick]').forEach(r => r.classList.toggle('sc-sel', r === t));
        m.querySelectorAll('[data-scpanel]').forEach(p => { p.hidden = p.getAttribute('data-scpanel') !== id; });
        return;
      }
      // Financial Model pro-forma: Summary <-> Detailed column toggle, scoped to the nearest table.
      if (t.hasAttribute('data-pf-view')) {
        const view = t.getAttribute('data-pf-view');
        const wrap = t.closest('[data-pf-mode]');
        if (wrap) {
          wrap.setAttribute('data-pf-mode', view);
          wrap.querySelectorAll('[data-pf-view]').forEach(b => b.classList.toggle('is-on', b.getAttribute('data-pf-view') === view));
        }
        return;
      }
      if (t.hasAttribute('data-print')) { window.print(); return; }
      if (t.hasAttribute('data-theme-toggle')) {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : (cur === 'light' ? 'dark'
          : (matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark'));
        document.documentElement.setAttribute('data-theme', next); return;
      }
      if (t.hasAttribute('data-reset-assumptions')) { this.resetAssumptions(); return; }
      if (t.hasAttribute('data-copy') || t.hasAttribute('data-copy-text')) {
        let text = t.getAttribute('data-copy-text');
        if (text == null) { const el = document.querySelector(t.getAttribute('data-copy')); text = el ? el.innerText : ''; }
        this.copy(text); return;
      }
      // expandable table rows
      const rowKey = t.getAttribute('data-exprow') || (t.matches('tr.expandable') ? t.getAttribute('data-exprow') : null);
      if (rowKey) {
        t.classList.toggle('is-open');
        const exp = document.querySelector('[data-expfor="' + rowKey + '"]');
        if (exp) exp.classList.toggle('is-hidden');
        return;
      }
    });

    // keyboard activation for NON-native controls (role="button" divs/spans in the
    // Legal & Protection scorecard, navigator, and cross-links): Enter/Space fire the
    // same delegated click. Native <button>/<a> handle these keys themselves, so they
    // are excluded to avoid double-firing. Space is prevent-defaulted so it activates
    // the control instead of scrolling the page.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      const t = e.target.closest('[role="button"]');
      if (!t || t.tagName === 'BUTTON' || t.tagName === 'A') return;
      e.preventDefault();
      t.click();
    });

    // assumptions: live update + recalc
    document.addEventListener('input', (e) => {
      const inp = e.target.closest('[data-assumption]');
      if (!inp) return;
      const id = inp.getAttribute('data-assumption');
      const a = (global.dashboardData.assumptions || []).find(x => x.id === id);
      if (!a) return;
      a.value = parseFloat(inp.value);
      const out = document.querySelector('[data-asm-out="' + id + '"]');
      if (out) out.textContent = a.unit === '%' ? a.value + '%'
        : (a.value.toLocaleString('en-US') + (a.unit ? ' ' + a.unit : ''));
      this.recalc();
    });

    // filter inputs (search box) + sortable headers
    document.addEventListener('input', (e) => {
      const box = e.target.closest('[data-filter-input]');
      if (box) this.applyFilter(box);
    });
    document.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-filter-select]');
      if (sel) this.applyFilter(sel);
    });
    document.querySelectorAll('table.dt th[data-sort]').forEach(th =>
      th.addEventListener('click', () => this.sortTable(th)));
    // chip filters (aria-pressed toggles)
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-filterchip]');
      if (!chip) return;
      const on = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', on ? 'false' : 'true');
      this.applyChipFilters(chip.closest('[data-filter-scope]') || document);
    });

    // deep-link to a tab via hash
    const h = (location.hash || '').replace('#', '');
    if (h && document.querySelector('[data-tabpanel="' + h + '"]')) this.showTab(h);
    else { const first = document.querySelector('[data-tab]'); if (first) this.showTab(first.getAttribute('data-tab')); }

    this.recalc();
  },

  copy(text) {
    const done = () => this.toast('Copied to clipboard');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => this.fallbackCopy(text, done));
    } else this.fallbackCopy(text, done);
  },
  fallbackCopy(text, cb) {
    const ta = document.createElement('textarea'); ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) {} document.body.removeChild(ta);
  },

  resetAssumptions() {
    (global.dashboardData.assumptions || []).forEach(a => {
      a.value = assumptionOriginals[a.id];
      const inp = document.querySelector('[data-assumption="' + a.id + '"]');
      if (inp) inp.value = a.value;
      const out = document.querySelector('[data-asm-out="' + a.id + '"]');
      if (out) out.textContent = a.unit === '%' ? a.value + '%'
        : (a.value.toLocaleString('en-US') + (a.unit ? ' ' + a.unit : ''));
    });
    this.recalc(); this.toast('Assumptions reset');
  },

  // free-text filter over a target table (data-filter-input has data-filter-for="tableId")
  applyFilter(control) {
    const scope = control.closest('[data-filter-scope]') || document;
    const tableId = control.getAttribute('data-filter-for');
    const table = tableId ? document.getElementById(tableId) : scope.querySelector('table.dt');
    if (!table) return;
    const q = (scope.querySelector('[data-filter-input]') || {}).value || '';
    this._filterTable(table, q.toLowerCase(), scope);
  },
  applyChipFilters(scope) {
    const table = scope.querySelector('table.dt'); if (!table) return;
    const box = scope.querySelector('[data-filter-input]');
    this._filterTable(table, ((box && box.value) || '').toLowerCase(), scope);
  },
  _filterTable(table, q, scope) {
    const chips = Array.from(scope.querySelectorAll('[data-filterchip][aria-pressed="true"]'))
      .map(c => c.getAttribute('data-filterchip').toLowerCase());
    let shown = 0, total = 0;
    table.querySelectorAll('tbody tr').forEach(tr => {
      // expander bodies and group-header bands are not filterable data rows
      if (tr.classList.contains('expander-row') || tr.hasAttribute('data-grouphd')) { return; }
      total++;
      const txt = tr.textContent.toLowerCase();
      const facet = (tr.getAttribute('data-facet') || '').toLowerCase();
      const okText = !q || txt.indexOf(q) !== -1;
      const okChip = !chips.length || chips.some(c => facet.split(' ').indexOf(c) !== -1 || facet.indexOf(c) !== -1);
      const show = okText && okChip;
      tr.classList.toggle('is-hidden', !show);
      const exp = tr.getAttribute('data-exprow');
      if (exp) { const e2 = table.querySelector('[data-expfor="' + exp + '"]');
        if (e2 && !tr.classList.contains('is-open')) e2.classList.add('is-hidden');
        if (e2 && !show) e2.classList.add('is-hidden'); }
      if (show) shown++;
    });
    const cnt = scope.querySelector('.filter-count');
    if (cnt) cnt.textContent = shown + ' of ' + total + ' shown';
    // optional group-header bands ([data-grouphd="{facetKey}"]): recount visible rows in
    // each group, update its count, and hide the band when its group is fully filtered out.
    table.querySelectorAll('tr[data-grouphd]').forEach(h => {
      const key = h.getAttribute('data-grouphd');
      let n = 0;
      table.querySelectorAll('tr[data-facet]').forEach(r => {
        if (!r.classList.contains('is-hidden') && (r.getAttribute('data-facet') || '').split(' ').indexOf(key) !== -1) n++;
      });
      const c = h.querySelector('[data-groupcount]'); if (c) c.textContent = n;
      h.classList.toggle('is-hidden', n === 0);
    });
    // optional empty-state ([data-filter-empty]): show it only when nothing matches.
    const empty = scope.querySelector('[data-filter-empty]');
    if (empty) empty.hidden = shown !== 0;
  },

  sortTable(th) {
    const table = th.closest('table'); const tbody = table.querySelector('tbody');
    const idx = Array.from(th.parentNode.children).indexOf(th);
    const cur = th.getAttribute('aria-sort');
    const dir = cur === 'ascending' ? 'descending' : 'ascending';
    table.querySelectorAll('th[data-sort]').forEach(h => h.removeAttribute('aria-sort'));
    th.setAttribute('aria-sort', dir);
    // group main rows with their (optional) expander rows
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.classList.contains('expander-row'));
    const getVal = (tr) => {
      const td = tr.children[idx]; if (!td) return '';
      const sv = td.getAttribute('data-sv'); if (sv != null) { const n = parseFloat(sv); return isNaN(n) ? sv : n; }
      const n = parseFloat(td.textContent.replace(/[^0-9.\-]/g, ''));
      return isNaN(n) ? td.textContent.trim().toLowerCase() : n;
    };
    rows.sort((a, b) => {
      const va = getVal(a), vb = getVal(b);
      if (va < vb) return dir === 'ascending' ? -1 : 1;
      if (va > vb) return dir === 'ascending' ? 1 : -1;
      return 0;
    });
    rows.forEach(r => {
      tbody.appendChild(r);
      const exp = r.getAttribute('data-exprow');
      if (exp) { const e2 = tbody.querySelector('[data-expfor="' + exp + '"]'); if (e2) tbody.appendChild(e2); }
    });
  }
};

/* ---------- EXPORTS ------------------------------------------------------- */
const api = {
  // formatting
  esc, money, pct, uid, icon, M, clampp,
  // evidence + status
  evidenceChip, coverageBadge, severityPill, statusPill,
  // layout
  saCard, insight, dataTable, collapsible, excerpt, gapCard, jumpLink, copyBtn,
  // viz
  miniBar, barRow, heatCell, matrixPlot, waterfall, timeline, gantt, assumptionSlider,
  // data lookups (used by 2+ tab builders, e.g. tab-commercials.js + zopa.js)
  assumVal, benchForLine,
  // interaction
  DealUI
};
Object.assign(global, api);            // expose helpers as globals for terse builders
global.DealUI = DealUI;
global.DealTabs = global.DealTabs || {};   // builders attach: DealTabs.brief = d => '...'
global.dealRecalc = () => DealUI.recalc();  // brief-named recalc hook

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', () => DealUI.init());
else DealUI.init();

})(typeof window !== 'undefined' ? window : this);
