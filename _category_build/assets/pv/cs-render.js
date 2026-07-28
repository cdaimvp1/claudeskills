/* =============================================================================
   Category Strategy dashboard — renderer.

   Deterministic build, same pattern as Landscape / Deal / RFx: the model authors
   ONLY the data object (assets/seed/category-data.js); this file renders it.

   Structure: 7 tabs (the approved #4 plan), not the platform's 11. The outer
   Strategy & Plays / Deep Analysis switch is gone -- it produced two competing
   versions of the same category strategy.

   Type scale (locked): 9 label · 11 meta · 13 body · 16 title · 20 heading · 28 display
   Colour: plum primary, teal secondary, burnt orange = emphasis only, solid.

   HONESTY RULE: a panel with no field to populate it renders csGap() -- the gap
   plus the NAME of the field that would fill it. Nothing is invented.
   ============================================================================= */

var CS_TABS = [
  ['overview',  'Overview'],
  ['spend',     'Spend & Suppliers'],
  ['market',    'Market & Risk'],
  ['strategy',  'Strategy & Plays'],
  ['savings',   'Savings & Scorecard'],
  ['program',   'Supplier Program'],
  ['execution', 'Execution']
];

var CS_CAT = 0;        // selected category index
var CS_TAB = 'overview';
var CS_PARETO_CUT = 80;
var CS_TAIL = 100;     // 50 | 100 | 250
var CS_HORIZON = 3;    // 1 | 3 | 5
var CS_FORECAST = false;
var CS_KEEPSCROLL = false;  // in-page interactions hold position; tab changes do not  // spend-trend forecast overlay, off by default

function csData() { return (CATEGORY_SEED.categories || [])[CS_CAT] || {}; }
function csEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function csUsd(n) {
  if (n == null || isNaN(n)) return '--';
  var a = Math.abs(n), sign = n < 0 ? '-' : '';   // sign OUTSIDE the $, not $-3.9M
  if (a >= 1e9) return sign + '$' + (a / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return sign + '$' + (a / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return sign + '$' + Math.round(a / 1e3) + 'K';
  return sign + '$' + Math.round(a);
}
function csPct(n, d) { return (n == null || isNaN(n)) ? '--' : n.toFixed(d == null ? 1 : d) + '%'; }
function csNum(n) { return (n == null || isNaN(n)) ? '--' : n.toLocaleString('en-US'); }

/* ---- panel icons, from the .ch-ic set in the restyle protocol ------------ */
var CS_ICON = {
  doc:      'M7 3h7l4 4v14H7z M14 3v4h4 M10 12h6M10 15h6M10 18h3',
  clock:    '',
  cal:      '',
  shield:   'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z',
  flag:     'M5 21V4M5 4h11l-2 4 2 4H5',
  scales:   'M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.3-5 3.2c0 4.3 10 2.2 10 6.6 0 1.9-2.2 3.2-5 3.2s-5-1.1-5-3',
  warn:     'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.4 3.9a2 2 0 00-3.4 0z M12 9v4M12 17h.01',
  list:     'M4 6h16M4 12h16M4 18h10',
  balance:  'M12 3v18 M6 7h12 M6 7l-3 6h6z M18 7l-3 6h6z M8 21h8',
  chart:    'M3 3v18h18 M7 14l4-4 3 3 5-6',
  bars:     'M4 20V10M10 20V4M16 20v-7M22 20V8',
  users:    'M9 11a3 3 0 100-6 3 3 0 000 6z M3 20a6 6 0 0112 0 M17 11a3 3 0 100-6',
  grid:     'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  target:   'M12 21a9 9 0 100-18 9 9 0 000 18z M12 16a4 4 0 100-8 4 4 0 000 8z M12 13a1 1 0 100-2 1 1 0 000 2z',
  star:     'M12 3l2.4 5 5.6.8-4 3.9 1 5.5L12 16.5 6.4 18.2l1-5.5-4-3.9 5.6-.8z',
  globe:    'M12 21a9 9 0 100-18 9 9 0 000 18z M3 12h18 M12 3a14 14 0 000 18 14 14 0 000-18',
  refresh:  'M21 12a9 9 0 11-6.2-8.5 M21 4v5h-5',
  money:    'M12 2v20 M16 7c0-1.7-1.8-2.5-4-2.5S8 5.4 8 7c0 3.6 8 1.8 8 5.5 0 1.6-1.8 2.5-4 2.5s-4-.9-4-2.5'
};
CS_ICON.clock = 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5l3 2';
CS_ICON.cal = 'M3 4h18v14H3z M3 9h18M8 21h8M12 18v3';
function csIcon(k) {
  var d = CS_ICON[k];
  if (!d) return '';
  return '<span class="cs-chic"><svg viewBox="0 0 24 24" aria-hidden="true">'
    + d.split(' M').map(function (p, i) { return '<path d="' + (i ? 'M' + p : p) + '"/>'; }).join('')
    + '</svg></span>';
}

/* ---- primitives ---------------------------------------------------------- */
function csCard(title, body, opts) {
  var o = opts || {};
  /* opts.conf renders the 3-dot evidence badge. opts.icon and opts.role come
     from the restyle protocol: every panel carries an icon and a deliberate
     role, at most one 'solid' and one 'emph' per screen. */
  var role = o.role ? ' cs-role-' + o.role : '';
  return '<div class="cs-card' + role + (o.cls ? ' ' + o.cls : '') + '">'
    + (title ? '<div class="cs-cardhd">' + (o.icon ? csIcon(o.icon) : '')
        + '<span class="cs-ct">' + title + '</span>'
        + (o.sub ? '<span class="cs-cs">' + csEsc(o.sub) + '</span>' : '')
        + (o.conf ? csConf(o.conf, o.confWhy) : '') + '</div>' : '')
    + '<div class="cs-cardbd">' + body + '</div></div>';
}
/* A named band above a group of panels. Required once a screen carries 4+. */
function csSect(title) {
  return '<div class="cs-sect cs-secthd"><span class="t">' + csEsc(title) + '</span></div>';
}
function csLabel(t) { return '<div class="cs-lab">' + csEsc(t) + '</div>'; }
function csNote(t) { return '<div class="cs-note">' + t + '</div>'; }

/* A panel we cannot populate. States the gap AND the field that would fill it.
   This is the Landscape discipline: never fabricate to fill a prettier layout. */
function csGap(what, field) {
  return '<div class="cs-gap"><div class="cs-gap-k">Not held in this data set</div>'
    + '<div class="cs-gap-t">' + csEsc(what) + '</div>'
    + '<div class="cs-gap-f">Needs: <b>' + csEsc(field) + '</b></div></div>';
}
/* provenance chip, driven by the seed's own $src block */
function csSrc(section) {
  var d = csData(), src = (d.$src || {})[section];
  if (!src) return '';
  // $src is an array of source records, or a {kind:'derived', by:...} note.
  // It used to be concatenated straight into a title attribute, which printed
  // [object Object]. Read the label out of whichever shape arrived.
  var label;
  if (Array.isArray(src)) {
    label = src.map(function (x) { return (x && x.name) ? x.name : String(x); }).join('; ');
  } else if (src && src.kind === 'derived') {
    label = 'Derived: ' + (src.by || 'calculated in this view');
  } else if (src && typeof src === 'object') {
    label = src.name || Object.keys(src).map(function (k) { return k + ': ' + src[k]; }).join('; ');
  } else {
    label = String(src);
  }
  return { text: 'sourced', title: label };
}
/* csSrc for a card subtitle, which is plain text. */
function csSrcText(section) {
  var s = csSrc(section);
  return s ? s.text : '';
}
/* csSrc as the inline chip, for use inside a card body. */
function csSrcChip(section) {
  var s = csSrc(section);
  return s ? '<span class="cs-src" title="' + csEsc(s.title) + '">' + csEsc(s.text) + '</span>' : '';
}
/* A lever with no modelled low/high is unquantified. Printing it as $0 to $0
   states a value the model never produced. */
function csRange(lo, hi, suffix) {
  if (lo == null && hi == null) return '<span class="cs-unq">not yet quantified</span>';
  return csUsd(lo || 0) + ' to ' + csUsd(hi || 0) + (suffix || '');
}
function csBar(pct, tone) {
  var p = Math.max(0, Math.min(100, pct || 0));
  return '<span class="cs-bar' + (tone ? ' cs-bar-' + tone : '') + '"><i style="width:' + p.toFixed(1) + '%"></i></span>';
}
function csKpi(label, value, sub, tone) {
  // label may carry a csHelp marker, so it is trusted HTML built in this file
  return '<div class="cs-kpi' + (tone ? ' cs-kpi-' + tone : '') + '">'
    + '<div class="cs-kpi-l">' + label + '</div>'
    + '<div class="cs-kpi-v">' + value + '</div>'
    + (sub ? '<div class="cs-kpi-s">' + csEsc(sub) + '</div>' : '') + '</div>';
}
function csTable(headers, rows, opts) {
  var o = opts || {};
  return '<div class="cs-tblwrap"><table class="cs-tbl' + (o.cls ? ' ' + o.cls : '') + '"><thead><tr>'
    + headers.map(function (h, i) {
        return '<th' + (i === 0 ? ' class="cs-l"' : '') + '>' + csEsc(h) + '</th>';
      }).join('')
    + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
}

/* ---- narrative -----------------------------------------------------------
   narr carries three shapes: a plain string, a {c,k,t,d} finding record, or an
   array of those. csNarr renders whichever it is given rather than letting a
   record fall through String() and print as [object Object].
   The `c` code is the platform's own tone flag: R = needs attention,
   AMB = watch, G = favourable. It maps to a rule colour, never a wash.       */
function csTone(c) {
  return c === 'R' ? 'emph' : c === 'AMB' ? 'plum' : c === 'G' ? 'teal' : '';
}
function csNarrOne(x) {
  if (x == null) return '';
  if (typeof x === 'string') return '<div class="cs-prose">' + x + '</div>';
  if (typeof x !== 'object') return '<div class="cs-prose">' + csEsc(x) + '</div>';
  var tone = csTone(x.c);
  var head = (x.t || x.title)
    ? '<div class="cs-nr-hd"><span class="cs-nr-t">' + csEsc(x.t || x.title) + '</span>'
      + (x.k ? '<span class="cs-nr-k">' + csEsc(x.k) + '</span>' : '')
      + (x.conf ? '<span class="cs-nr-c">' + csEsc(x.conf) + ' confidence</span>' : '')
      + '</div>' : '';
  var body = x.d || x.lead || x.desc || '';
  var rest = '';
  if (!body && !head) {
    // an unlabelled record: show its fields rather than dropping them
    rest = Object.keys(x).map(function (k) {
      return '<div class="cs-nr-kv"><span>' + csEsc(k) + '</span>' + csEsc(x[k]) + '</div>';
    }).join('');
  }
  return '<div class="cs-nr' + (tone ? ' cs-nr-' + tone : '') + '">'
    + head + (body ? '<div class="cs-nr-d">' + body + '</div>' : '') + rest + '</div>';
}
function csNarr(x) {
  if (x == null) return '';
  if (Array.isArray(x)) return '<div class="cs-nrs">' + x.map(csNarrOne).join('') + '</div>';
  return csNarrOne(x);
}
/* Narrative used where only a short line fits (a note under a panel). */
function csNarrNote(x) {
  if (x == null) return '';
  if (typeof x === 'string') return csNote(x);
  if (Array.isArray(x)) return x.map(csNarrNote).join('');
  var parts = Object.keys(x).map(function (k) {
    return '<b>' + csEsc(k) + '</b> ' + csEsc(x[k]);
  });
  return csNote(parts.join(' &middot; '));
}

/* ---- shell ---------------------------------------------------------------
   5 tabs, 12 screens. The platform's Deep Analysis carries 11 sections; folding
   them into 7 flat tabs is what made these pages read as walls of table. Each
   section now gets its own screen under a tab, the same hub pattern as Deal and
   RFx: one screen, one job.
   Supplier Development is intentionally absent.                              */
/* Order is the argument: what the category IS, what we buy and from whom, what
   changed and why, what is happening outside and what could go wrong, and
   therefore what we do. Strategy sits last because it is the conclusion, and
   Trend & Change sits before Market & Risk because "spend jumped 28.8%" is the
   question the market panel answers. */
var CS_NAV = [
  ['overview', 'Overview',          null],
  ['spend',    'Spend & Suppliers', [['pareto', 'Pareto & Tail'], ['suppliers', 'Suppliers'], ['subcats', 'Subcategories']]],
  ['trend',    'Trend & Change',    [['trend', 'Trend'], ['rational', 'Rationalization'], ['tail', 'Tail & Contracts']]],
  ['market',   'Market & Risk',     null],
  ['strategy', 'Strategy & Plays',  [['strategy', 'Strategy'], ['savings', 'Savings & Scorecard']]]
];
var CS_SUBSTATE = { spend: 'pareto', market: 'kraljic', strategy: 'strategy', trend: 'trend' };

function csNavFor(tab) {
  for (var i = 0; i < CS_NAV.length; i++) if (CS_NAV[i][0] === tab) return CS_NAV[i];
  return CS_NAV[0];
}
function csSetCat(i) { CS_CAT = i; csRender(); }
function csSetTab(k) { CS_TAB = k; csRender(); }
function csSetSub(k) { CS_SUBSTATE[CS_TAB] = k; csRender(); }
function csSetCut(v) { CS_KEEPSCROLL = true; CS_PARETO_CUT = parseInt(v, 10); csRender(); }
function csSetTail(v) { CS_KEEPSCROLL = true; CS_TAIL = parseInt(v, 10); csRender(); }
function csSetHorizon(v) { CS_KEEPSCROLL = true; CS_HORIZON = parseInt(v, 10); csRender(); }
function csToggleFc() { CS_KEEPSCROLL = true; CS_FORECAST = !CS_FORECAST; csRender(); }

function csHeader() {
  var d = csData(), m = d.meta || {};
  var cats = (CATEGORY_SEED.categories || []).map(function (c, i) {
    return '<button class="cs-cat' + (i === CS_CAT ? ' on' : '') + '" onclick="csSetCat(' + i + ')">'
      + csEsc((c.meta || {}).name || c.title || ('Category ' + (i + 1))) + '</button>';
  }).join('');
  var tabs = CS_NAV.map(function (t) {
    return '<button class="cs-tab' + (t[0] === CS_TAB ? ' on' : '') + '" onclick="csSetTab(\'' + t[0] + '\')">'
      + csEsc(t[1]) + '</button>';
  }).join('');
  var nav = csNavFor(CS_TAB), subs = '';
  if (nav[2]) {
    var cur = CS_SUBSTATE[CS_TAB];
    subs = '<div class="cs-subtabs">' + nav[2].map(function (s) {
      return '<button class="cs-subtab' + (s[0] === cur ? ' on' : '') + '" onclick="csSetSub(\'' + s[0] + '\')">'
        + csEsc(s[1]) + '</button>';
    }).join('') + '</div>';
  }
  var demo = CATEGORY_SEED.__demo
    ? '<div class="cs-demo">Illustrative data. Every figure on this page is invented for layout '
      + 'review and must not be quoted, exported or treated as fact.</div>' : '';
  return demo + '<div class="cs-head">'
    + '<div class="cs-eyebrow">Category Strategy</div>'
    + '<h1 class="cs-h1">' + csEsc(m.name || d.title || 'Category') + '</h1>'
    + '<div class="cs-sub">' + csEsc(m.cutoff || '') + (m.ytdNote ? ' · ' + csEsc(m.ytdNote) : '') + '</div>'
    + ((CATEGORY_SEED.categories || []).length > 1 ? '<div class="cs-cats">' + cats + '</div>' : '')
    + '</div>'
    + '<div class="cs-tabs">' + tabs + '</div>' + subs;
}

/* ===========================================================================
   SCREEN 1 — OVERVIEW
   =========================================================================== */
function scOverview() {
  var d = csData(), m = d.meta || {}, n = d.narr || {};
  var h = '';

  var hhiBand = m.hhi == null ? ''
    : (m.hhi >= 2500 ? 'concentrated' : m.hhi >= 1500 ? 'moderately concentrated' : 'unconcentrated');
  h += '<div class="cs-kpirow">'
    + csKpi('Annual spend (FY25)', csUsd(m.s25), (m.chg2425 != null ? (m.chg2425 > 0 ? '+' : '') + csUsd(m.chg2425) + ' vs FY24' : ''), 'plum')
    + csKpi('YoY change', (m.yoy2425 != null ? (m.yoy2425 > 0 ? '+' : '') + csPct(m.yoy2425) : '--'), 'FY24 to FY25')
    + csKpi('Active vendors', csNum(m.vendors), (m.newVendorsNet != null ? (m.newVendorsNet > 0 ? '+' : '') + m.newVendorsNet + ' net' : ''))
    + csKpi('Concentration (HHI)' + csHelp(CS_HHI_HELP),
        (m.hhi != null ? csNum(Math.round(m.hhi)) : '--'),
        (m.hhi != null ? hhiBand + ' · top 5 = ' + csPct(m.top5Share) : ''))
    + csKpi('3-yr CAGR', (m.cagr2325 != null ? csPct(m.cagr2325) : '--'), 'FY23 to FY25')
    + '</div>';

  h += '<div class="cs-row2">'
    + csCard('Annual Spend Trend', csTrendChart(d),
        { icon: 'chart', sub: 'FY23-FY26 YTD' + (CS_FORECAST ? ' + forecast' : ''), conf: csConfFor(d, 'annual') })
    + csCard('Top Suppliers', csTopSuppliers(d),
        { icon: 'users', sub: 'ranked by 3-yr spend', conf: csConfFor(d, 'suppliers') })
    + '</div>';

  h += csCard('Key Findings', csFindings(d),
      { icon: 'star', role: 'solid', sub: 'what a sourcing lead needs to know', conf: csConfFor(d, 'narr') });

  h += '<div class="cs-row2">'
    + csCard('Spend Under Contract', d.contractCoverage ? csCoverage(d.contractCoverage)
        : csGap('Coverage of category spend under an active agreement, and the largest off-contract relationships.', 'contract coverage / agreement status per supplier'),
        { icon: 'doc', sub: d.contractCoverage ? csPct(d.contractCoverage.pct, 0) + ' of FY25 spend' : '',
          conf: d.contractCoverage ? 'Moderate' : 'Limited' })
    + csCard('Renewal Exposure', d.renewals ? csRenewals(d.renewals)
        : csGap('Spend renewing in the next 12 months and the largest decision windows.', 'renewal + notice dates per agreement'),
        { icon: 'cal', role: 'emph', sub: d.renewals ? 'next 12 months' : '', conf: d.renewals ? 'Moderate' : 'Limited' })
    + '</div>';
  return h;
}

/* ===========================================================================
   SCREEN 2 — SPEND & SUPPLIERS > PARETO & TAIL
   =========================================================================== */
function scPareto() {
  var d = csData(), m = d.meta || {}, n = d.narr || {};
  var h = '';

  h += '<div class="cs-kpirow">'
    + csKpi('Top 5 share', csPct(m.top5Share), 'of category spend', 'plum')
    + csKpi('Top 10 share', csPct(m.top10Share), 'of category spend')
    + csKpi('Suppliers to 80%', csParetoCount(d), 'carry four fifths of spend', 'teal')
    + (function () {
        var a = csTailAt(d, CS_TAIL);
        return csKpi('Tail under ' + csTailLabel(CS_TAIL),
          a ? csNum(a.n) + ' suppliers' : '--',
          a ? csUsd(a.spend) + ' · ' + csPct(a.pct) + ' of spend' : 'not held at this threshold');
      }())
    + '</div>';

  h += '<div class="cs-paretorow">'
    + csCard('Pareto Distribution', csParetoChart(d),
        { icon: 'bars', role: 'solid', sub: 'spend by supplier with cumulative share', conf: csConfFor(d, 'pareto') })
    + csCard('Tail Analysis', csTailStats(d),
        { icon: 'list', cls: 'cs-tailcard', conf: csConfFor(d, 'subcats') })
    + '</div>';

  h += csCard('What the curve says', csParetoRead(d) + csTailRead(d), { icon: 'warn', role: 'emph' });
  return h;
}

/* ===========================================================================
   SCREEN 3 - SPEND & SUPPLIERS > SUPPLIERS
   =========================================================================== */
function scSuppliers() {
  var d = csData(), m = d.meta || {};
  var h = '';
  var nNew = (d.newVendors || []).length, nOut = (d.exitVendors || []).length;
  h += '<div class="cs-kpirow">'
    + csKpi('Active suppliers', csNum(m.vendors), 'in the FY25 window', 'plum')
    + csKpi('Entered', nNew ? '+' + csNum(nNew) : (m.newVendorsNet != null ? '+' + csNum(m.newVendorsNet) : '--'),
        nNew ? csUsd((d.newVendors || []).reduce(function (a, v) { return a + (v.s || 0); }, 0)) + ' of new spend' : 'net movement')
    + csKpi('Exited', nOut ? '-' + csNum(nOut) : '--',
        nOut ? csUsd((d.exitVendors || []).reduce(function (a, v) { return a + (v.s || 0); }, 0)) + ' of lapsed spend' : '')
    + csKpi('Prior period', csNum(m.vendorsPrior), 'FY24 active')
    + '</div>';

  /* Movement sits directly under the counts it explains, not at the foot of the
     page where it reads as an afterthought. */
  var nv = (d.newVendors || []).map(function (v) {
    return '<tr><td class="cs-l">' + csEsc(v.n) + '</td><td class="cs-num">' + csUsd(v.s) + '</td></tr>'; });
  var xv = (d.exitVendors || []).map(function (v) {
    return '<tr><td class="cs-l">' + csEsc(v.n) + '</td><td class="cs-num">' + csUsd(v.s) + '</td></tr>'; });
  h += '<div class="cs-row2">'
    + csCard('New large vendors', nv.length ? csTable(['Supplier', 'Spend'], nv)
        : csGap('Suppliers new in the current period.', 'newVendors[]'), { icon: 'refresh', role: 'teal', sub: 'entered this period' })
    + csCard('Exiting vendors', xv.length ? csTable(['Supplier', 'Prior spend'], xv)
        : csGap('Suppliers that stopped in the current period.', 'exitVendors[]'), { icon: 'refresh', sub: 'no spend this period' })
    + '</div>';

  h += csCard('All suppliers', csSupTable(d),
      { icon: 'users', role: 'solid', sub: 'click a name for the deep dive', conf: csConfFor(d, 'suppliers') });

  h += csSupDeep(d);

  h += csCard('Supplier tiering', csTieringLines(d),
      { icon: 'grid', sub: 'how each tier is managed', conf: csConfFor(d, 'suppliers') });
  return h;
}

/* ===========================================================================
   SCREEN 4 - SPEND & SUPPLIERS > SUBCATEGORIES
   Map on the left, detail pane on the right; both below with csSubcatPane.
   =========================================================================== */

/* ===========================================================================
   SCREEN 8 — STRATEGY & PLAYS > STRATEGY

   This is the platform's OUTER Strategy & Plays tab, not the Deep Analysis
   Strategy section. Reproduced from renderPlays() / model() / modelBars() /
   horizonBtns():

     metric strip      Annual spend · Suppliers · Contracts · Savings YTD · Avg cycle
     .plays-head       star icon, "Recommended plays", reflect-only pill right
     .rechead          the thesis line, then the paragraph, then
                       "Select plays to model them individually or as a combination."
     .plays-wrap       1.5fr / 1fr
       .plays-col      one .pcard per lever: checkbox, icon, name, effort pill,
                       sub, then four figures (year-1, 3-yr, risk/time, confidence)
       .modelp         sticky dark-header panel: horizon Yr1/3yr/5yr, big number,
                       per-year bars, category risk before -> after, effort in
                       FTE-weeks, time to first value, three actions
     .draftcard        the generated narrative, once it exists

   The modelling is the platform's arithmetic, not an approximation of it:
   Year-1 realisation ramps by effort, stacking plays applies an overlap
   discount so two plays cannot bank the same pound twice, and category risk
   moves by a per-kind delta off a derived base.
   =========================================================================== */
var CS_EFFORT_RAMP = { lo: 0.70, md: 0.50, hi: 0.35 };   // Year-1 realisation by effort
var CS_EFFORT_TTV  = { lo: 2,    md: 5,    hi: 9    };   // months to first value
var CS_EFFORT_WK   = { lo: 3,    md: 8,    hi: 16   };   // rough FTE-weeks
var CS_OVERLAP     = [1, 1, 0.97, 0.92, 0.87, 0.83];     // combined-efficiency by count
var CS_SEL = {};            // category index -> Set of selected play indices
var CS_HZ = '3yr';          // 'y1' | '3yr' | '5yr'
var CS_PLAYMSG = '';        // reflect-only action feedback

/* Risk delta by what the play actually does. Falls back rather than guessing. */
function csLeverRisk(name) {
  var s = String(name || '').toLowerCase();
  if (/consolidat|rationali|tail/.test(s)) return -7;
  if (/recompet|compet|rfx|tender/.test(s)) return -5;
  if (/standardi|catalog|govern/.test(s)) return -6;
  if (/renegotiat|defen|price|commit/.test(s)) return -3;
  return -4;
}
/* Effort is not carried per lever in the seed. Where it is absent every play is
   treated as medium and the panel says so, rather than a number appearing from
   nowhere. */
function csPlayEffort(s) {
  if (s.eff) return s.eff;
  var c = String(s.conf || '').toLowerCase();
  return /high/.test(c) ? 'lo' : /low/.test(c) ? 'hi' : 'md';
}
function csPlays(d) {
  return (d.savings || []).map(function (s, i) {
    var eff = csPlayEffort(s);
    /* Midpoint of the modelled range. A range is what the seed carries; a
       single figure is what the model needs. */
    var annual = (s.lo == null && s.hi == null) ? 0 : Math.round(((s.lo || 0) + (s.hi || s.lo || 0)) / 2);
    return { i: i, k: s.lever, kind: s.type || 'Lever', sub: s.basis || '', eff: eff, annual: annual,
             quantified: !(s.lo == null && s.hi == null),
             y1: Math.round(annual * CS_EFFORT_RAMP[eff]),
             risk: csLeverRisk(s.lever), ttv: CS_EFFORT_TTV[eff], wk: CS_EFFORT_WK[eff] };
  });
}
/* Base category risk, derived from concentration and tail rather than invented:
   a thin tail and a dominant supplier both raise it. */
function csBaseRisk(d) {
  var m = d.meta || {};
  var tail = m.tail250Pct != null ? m.tail250Pct : (m.tail100Pct || 0);
  var top = m.topShare || 0;
  return Math.round(Math.min(85, 30 + tail * 0.7 + top * 0.3));
}
function csDefaultSel(d) {
  var ps = csPlays(d).filter(function (p) { return p.quantified; })
    .sort(function (a, b) { return b.annual - a.annual; });
  return ps.slice(0, 2).map(function (p) { return p.i; });
}
function csSelSet(d) {
  if (!CS_SEL[CS_CAT]) CS_SEL[CS_CAT] = csDefaultSel(d);
  return CS_SEL[CS_CAT];
}
function csTogglePlay(i) { CS_KEEPSCROLL = true;
  var d = csData(), sel = csSelSet(d), at = sel.indexOf(i);
  if (at >= 0) sel.splice(at, 1); else sel.push(i);
  CS_PLAYMSG = '';
  csRender();
}
function csSetHz(h) { CS_KEEPSCROLL = true; CS_HZ = h; csRender(); }
function csHzYears() { return CS_HZ === 'y1' ? 1 : CS_HZ === '5yr' ? 5 : 3; }
function csPlayAct(msg) { CS_KEEPSCROLL = true; CS_PLAYMSG = msg; csRender(); }

function csModel(d) {
  var ps = csPlays(d), sel = csSelSet(d);
  var chosen = ps.filter(function (p) { return sel.indexOf(p.i) >= 0; });
  var n = chosen.length;
  var ovf = CS_OVERLAP[Math.min(n, 5)];
  if (ovf == null) ovf = 0.83;
  var annual = Math.round(chosen.reduce(function (a, p) { return a + p.annual; }, 0) * ovf);
  var y1 = Math.round(chosen.reduce(function (a, p) { return a + p.y1; }, 0) * ovf);
  var base = csBaseRisk(d);
  var modeledRisk = Math.max(8, Math.min(95, base + chosen.reduce(function (a, p) { return a + p.risk; }, 0)));
  return { chosen: chosen, n: n, total: ps.length, annual: annual, y1: y1,
           threeYr: y1 + annual + annual, fiveYr: y1 + annual * 4, base: base, modeledRisk: modeledRisk,
           wk: chosen.reduce(function (a, p) { return a + p.wk; }, 0),
           ttv: n ? Math.max.apply(null, chosen.map(function (p) { return p.ttv; })) : 0,
           anyUnquantified: chosen.some(function (p) { return !p.quantified; }) };
}
function csRiskTone(v) { return v >= 60 ? 'var(--cs-burnt)' : v >= 40 ? 'var(--cs-plum)' : 'var(--cs-teal)'; }

function csHorizonBtns() {
  return '<div class="cs-horizon">'
    + [['y1', 'Yr 1'], ['3yr', '3 yr'], ['5yr', '5 yr']].map(function (h) {
        return '<button class="' + (CS_HZ === h[0] ? 'on' : '') + '" onclick="csSetHz(\'' + h[0] + '\')">' + h[1] + '</button>';
      }).join('') + '</div>';
}
function csModelBars(m) {
  var n = csHzYears(), arr = [];
  for (var y = 1; y <= n; y++) arr.push(['Yr ' + y, y === 1 ? m.y1 : m.annual]);
  var mx = Math.max.apply(null, [1].concat(arr.map(function (b) { return b[1]; })));
  return arr.map(function (b) {
    return '<div class="cs-bar3"><span class="bv">' + csUsd(b[1]) + '</span>'
      + '<i style="height:' + Math.round((b[1] / mx) * 100) + '%"></i>'
      + '<span class="bl">' + b[0] + '</span></div>';
  }).join('');
}

var CS_CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>';
var CS_KIND_SVG = {
  consolidate: '<svg viewBox="0 0 24 24"><path d="M4 7h16M8 12h8M11 17h2"/></svg>',
  recompete:   '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-6.2-8.5"/><path d="M21 4v5h-5"/></svg>',
  renegotiate: '<svg viewBox="0 0 24 24"><path d="M3 12h12M11 8l4 4-4 4"/><path d="M21 5v14"/></svg>',
  standardize: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12l2 2 4-4"/></svg>'
};
function csPlayIcon(name) {
  var s = String(name || '').toLowerCase();
  if (/consolidat|rationali|tail/.test(s)) return CS_KIND_SVG.consolidate;
  if (/recompet|compet|rfx|tender/.test(s)) return CS_KIND_SVG.recompete;
  if (/standardi|catalog|govern|transparen/.test(s)) return CS_KIND_SVG.standardize;
  return CS_KIND_SVG.renegotiate;
}

function scStrategy() {
  var d = csData(), m = d.meta || {}, n = d.narr || {};
  var ps = csPlays(d);
  if (!ps.length) return csCard('Recommended plays', csGap('The levers available in this category.', 'savings[]'));
  var sel = csSelSet(d), mo = csModel(d);

  /* ---- metric strip ---- */
  var realised = (d.benefits || []).reduce(function (a, b) { return a + (b.amt || 0); }, 0);
  var strip = '<div class="cs-metrics">'
    + csMetric('Annual spend', csUsd(m.s25), 'trailing 12 mo · commodity ' + csEsc(m.commodity || '--'))
    + csMetric('Suppliers', csNum(m.vendors), 'active in category')
    + csMetric('Contracts', d.contractCount != null ? csNum(d.contractCount) : '--',
        d.contractCount != null ? 'active agreements' : 'agreement count not held')
    + csMetric('Savings YTD', d.benefits ? csUsd(realised) : '--',
        d.benefits ? 'booked to a lever' : 'realised benefits not held')
    + csMetric('Avg cycle', d.avgCycleDays != null ? d.avgCycleDays + ' d' : '--',
        d.avgCycleDays != null ? 'intake to award' : 'cycle time not held')
    + '</div>';

  /* ---- header + thesis ---- */
  var star = '<svg viewBox="0 0 24 24"><path d="M12 3l2.4 5 5.6.8-4 3.9 1 5.5L12 16.5 6.4 18.2l1-5.5-4-3.9 5.6-.8z"/></svg>';
  var rec = n.strategyRec || {};
  var thesis = (typeof rec === 'string') ? rec : (rec.title || '');
  var lead = (typeof rec === 'string') ? '' : (rec.lead || rec.d || '');
  var head = '<div class="cs-plays-head">' + star
    + '<span class="pk">Recommended plays</span>'
    + '<span class="reflect">Reflect-only · model is a directional draft</span></div>'
    + '<div class="cs-rechead"><b>' + csEsc(thesis) + '</b><br>' + csEsc(lead)
    + ' <b>Select plays to model them individually or as a combination.</b></div>';

  /* ---- play cards ---- */
  var cards = ps.map(function (p) {
    var on = sel.indexOf(p.i) >= 0;
    var rk = (p.risk < 0 ? '−' : '+') + Math.abs(p.risk);
    var conf = p.eff === 'lo' ? 'High' : p.eff === 'hi' ? 'Low' : 'Medium';
    return '<div class="cs-pcard' + (on ? ' on' : '') + '" onclick="csTogglePlay(' + p.i + ')" '
      + 'role="button" tabindex="0" aria-pressed="' + on + '">'
      + '<div class="pcrow"><span class="pcheck">' + CS_CHECK + '</span>'
      + '<span class="pcic">' + csPlayIcon(p.k) + '</span>'
      + '<span class="pcname">' + csEsc(p.k) + '</span>'
      + '<span class="cs-effort ' + p.eff + '">'
        + (p.eff === 'lo' ? 'Low effort' : p.eff === 'md' ? 'Med effort' : 'High effort') + '</span></div>'
      + '<div class="pcsub">' + csEsc(p.sub) + '</div>'
      + '<div class="pcfig">'
        + '<span class="pcf"><span class="v">' + (p.quantified ? csUsd(p.y1) : '--') + '</span><span class="k">Year-1 savings</span></span>'
        + '<span class="pcf"><span class="v">' + (p.quantified ? csUsd(p.annual * 3) : '--') + '</span><span class="k">3-yr savings</span></span>'
        + '<span class="pcf"><span class="v">' + rk + ' pts</span><span class="k">risk · ' + p.ttv + 'mo to value</span></span>'
        + '<span class="pcf"><span class="v">' + conf + '</span><span class="k">confidence · est.</span></span>'
      + '</div></div>';
  }).join('');

  /* ---- model panel ---- */
  var headline = CS_HZ === 'y1' ? mo.y1 : CS_HZ === '5yr' ? mo.fiveYr : mo.threeYr;
  var headK = (CS_HZ === 'y1' ? 'modeled Year-1 savings' : CS_HZ === '5yr' ? 'modeled 5-year savings' : 'modeled 3-year savings')
    + (mo.n ? '' : ' · select plays');
  var chart = '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>';
  var panel = '<div class="cs-modelp">'
    + '<div class="mph">' + chart + '<span class="mt">Model the Impact</span>'
      + '<span class="mn">' + mo.n + ' of ' + mo.total + ' selected</span></div>'
    + '<div class="mpb">' + csHorizonBtns()
      + '<div class="cs-bignum">' + csUsd(headline) + '</div>'
      + '<div class="cs-bignum-k">' + csEsc(headK) + '</div>'
      + '<div class="cs-bars3">' + (mo.n ? csModelBars(mo) : '<div class="cs-miniload">Select plays to model.</div>') + '</div>'
      + '<div class="cs-mrow"><span class="mk">Category risk</span><span class="mv">' + mo.base
        + ' &rarr; <b style="color:' + csRiskTone(mo.modeledRisk) + '">' + mo.modeledRisk + '</b> <span class="mu">/100</span></span></div>'
      + '<div class="cs-riskbar"><i style="width:' + mo.modeledRisk + '%;background:' + csRiskTone(mo.modeledRisk) + '"></i></div>'
      + '<div class="cs-mrow"><span class="mk">Effort to execute</span><span class="mv">~' + mo.wk + ' FTE-weeks</span></div>'
      + '<div class="cs-mrow"><span class="mk">Time to first value</span><span class="mv">' + (mo.ttv ? mo.ttv + ' mo' : '-') + '</span></div>'
      + '<div class="cs-prow">'
        + '<button class="cs-pbtn primary" onclick="csPlayAct(\'A strategy narrative would be drafted from the selected plays for your confirmation. Nothing was initiated.\')">Generate strategy narrative</button>'
        + '<button class="cs-pbtn" onclick="csPlayAct(\'The modelled value would be surfaced to the savings pipeline as a draft. Finance confirms realisation. Nothing was initiated.\')">Surface to savings</button>'
        + '<button class="cs-pbtn" onclick="csPlayAct(\'An RFx would be drafted from the selected plays and created in intake. Nothing was initiated.\')">Start RFx</button>'
      + '</div>'
      + (CS_PLAYMSG ? '<div class="cs-playmsg">' + csEsc(CS_PLAYMSG) + '</div>' : '')
      + csNote('Stacking plays applies an overlap discount (' + Math.round(CS_OVERLAP[Math.min(mo.n, 5)] * 100)
        + '% at ' + mo.n + ' selected) so two plays cannot bank the same pound twice. Year-1 is ramped by effort. '
        + (mo.anyUnquantified ? 'One or more selected plays carry no modelled range and contribute nothing to the figure. ' : '')
        + 'Directional draft, not an approved target.')
    + '</div></div>';

  var draft = n.passThru
    ? '<div class="cs-draftcard"><div class="dch"><span class="dt">Strategy Narrative</span>'
      + '<span class="dbadge">Draft, pending your confirmation</span></div>'
      + '<div class="dcb">' + csNarr(n.passThru) + '</div></div>'
    : '';

  return strip + head
    + '<div class="cs-plays-wrap"><div class="cs-plays-col">' + cards + '</div>' + panel + '</div>'
    + draft;
}
function csMetric(lab, val, note) {
  return '<div class="cs-metric"><div class="lab">' + csEsc(lab) + '</div>'
    + '<div class="val">' + val + '</div>'
    + '<div class="note">' + csEsc(note) + '</div></div>';
}

/* ===========================================================================
   SCREEN 9 — STRATEGY & PLAYS > SAVINGS & SCORECARD
   =========================================================================== */
function scSavings() {
  var d = csData(), n = d.narr || {};
  var sv = d.savings || [];
  var lo = sv.reduce(function (a, s) { return a + (s.lo || 0); }, 0);
  var hi = sv.reduce(function (a, s) { return a + (s.hi || 0); }, 0);
  var realised = (d.benefits || []).reduce(function (a, b) { return a + (b.amt || 0); }, 0);
  var h = '';

  h += '<div class="cs-kpirow">'
    + csKpi('Identified', csUsd(lo) + ' to ' + csUsd(hi), sv.length + ' levers modelled', 'plum')
    + csKpi('Validated', d.benefits ? csUsd((d.benefits || []).filter(function (b) { return b.state === 'validated'; })
        .reduce(function (a, b) { return a + (b.amt || 0); }, 0)) : '--', d.benefits ? 'finance-confirmed' : 'needs a validation state')
    + csKpi('Approved target', '--', 'needs an approved target')
    + csKpi('Realised', d.benefits ? csUsd(realised) : '--', d.benefits ? 'booked to a lever' : 'needs benefit records', 'teal')
    + '</div>';

  h += csCard('Savings Waterfall', csSavingsWaterfall(d),
      { icon: 'money', role: 'solid', sub: 'modelled to realised', conf: csConfFor(d, 'savings') });

  h += csCard('Category Scorecard', csScorecard(d),
      { icon: 'target', sub: (d.kpis || []).length + ' measures', conf: csConfFor(d, 'kpis') });

  if (d.benefits) h += csCard('Play-to-Value Traceability', csBenefits(d.benefits),
      { icon: 'scales', role: 'teal', sub: 'each saving traced to its lever', conf: 'Moderate' });
  h += csNarrNote(n.savingsNearTerm);
  return h;
}

/* ===========================================================================
   SCREEN 10 — TREND & CHANGE > TREND
   =========================================================================== */
function scTrend() {
  var d = csData(), m = d.meta || {}, n = d.narr || {};
  var h = '';

  h += '<div class="cs-kpirow">'
    + csKpi('FY24 to FY25', (m.yoy2425 != null ? (m.yoy2425 > 0 ? '+' : '') + csPct(m.yoy2425) : '--'),
        (m.chg2425 != null ? (m.chg2425 > 0 ? '+' : '') + csUsd(m.chg2425) : ''), 'plum')
    + csKpi('FY23 to FY24', (m.yoy2324 != null ? (m.yoy2324 > 0 ? '+' : '') + csPct(m.yoy2324) : '--'),
        (m.chg2324 != null ? (m.chg2324 > 0 ? '+' : '') + csUsd(m.chg2324) : ''))
    + csKpi('3-yr CAGR', csPct(m.cagr2325), 'FY23 to FY25')
    + csKpi('Vendor movement', (m.newVendorsNet != null ? (m.newVendorsNet > 0 ? '+' : '') + csNum(m.newVendorsNet) : '--'), 'net vendors')
    + '</div>';

  h += csCard('Spend Trend and Forecast', csTrendChart(d),
      { icon: 'chart', role: 'solid', sub: CS_FORECAST ? 'actual and projected' : 'actual', conf: csConfFor(d, 'annual') });

  var sw = (d.swing || []).slice().sort(function (a, b) { return Math.abs(b.delta || 0) - Math.abs(a.delta || 0); });
  var swMax = sw.reduce(function (a, s) { return Math.max(a, Math.abs(s.delta || 0)); }, 0) || 1;
  var swRows = sw.map(function (s) {
    var up = (s.delta || 0) >= 0;
    return '<tr><td class="cs-l"><b>' + csEsc(s.n) + '</b></td>'
      + '<td class="cs-barcell"><span class="cs-tornado">'
        + '<i class="' + (up ? 'cs-tor-up' : 'cs-tor-dn') + '" style="width:'
        + ((Math.abs(s.delta || 0) / swMax) * 100).toFixed(1) + '%"></i></span></td>'
      + '<td class="cs-num"><span class="' + (up ? 'cs-up' : 'cs-down') + '">'
        + (up ? '+' : '') + csUsd(s.delta) + '</span></td>'
      + '<td class="cs-why">' + csEsc(s.cause || '') + '</td></tr>';
  });
  h += csCard('Top Swing Drivers', swRows.length ? csTable(['Supplier', '', 'Change', 'Cause'], swRows)
      : csGap('The suppliers driving the change.', 'swing[]'),
      { icon: 'bars', sub: 'FY24 to FY25', conf: csConfFor(d, 'swing') });

  h += '<div class="cs-row2">'
    + csCard('Rate vs Volume', d.rateVolume ? csRateVolume(d.rateVolume)
        : csGap('How much of the change is price and how much is quantity.', 'rate and quantity split (only totals are held)'),
        { icon: 'scales', sub: d.rateVolume ? 'change decomposed' : '', conf: d.rateVolume ? 'Moderate' : 'Limited' })
    + csCard('What Changed Since Last Strategy', d.sinceLast ? csSinceLast(d.sinceLast)
        : csGap('Movement in spend, suppliers, risk and market since the last approved strategy.', 'a prior approved snapshot to diff against'),
        { icon: 'clock', sub: d.sinceLast ? d.sinceLast.asOf : '', conf: d.sinceLast ? 'Moderate' : 'Limited' })
    + '</div>';

  if (n.trendDecomp) h += csCard('Change Decomposition', csNarr(n.trendDecomp), { icon: 'chart', conf: csConfFor(d, 'narr') });
  return h;
}

/* ===========================================================================
   SCREEN 11 — TREND & CHANGE > RATIONALIZATION
   =========================================================================== */
function scRational() {
  var d = csData(), n = d.narr || {};
  var h = '';
  var ovl = n.rationalizationOverlap || n.rationalizationReseller || n.rationalizationGap;

  h += csCard('Overlap & Consolidation',
      d.overlaps ? csOverlaps(d.overlaps) : (ovl ? csNarr(ovl)
        : csGap('Duplicate or overlapping suppliers and tools.', 'capability tags per supplier')),
      { icon: 'grid', role: 'solid', sub: d.overlaps ? d.overlaps.length + ' overlapping capabilities' : 'narrative',
        conf: d.overlaps ? 'Moderate' : 'Limited' });

  h += csCard('Utilization / Shelfware', d.utilization ? csUtilization(d.utilization)
      : csGap('Licences bought against licences actually used.', 'licence count vs active users'),
      { icon: 'warn', role: 'emph', sub: d.utilization ? 'licences bought against active' : '', conf: d.utilization ? 'Moderate' : 'Limited' });

  h += csCard('Action Matrix', d.actionMatrix ? csActionMatrix(d.actionMatrix)
      : csGap('Retain / renegotiate / consolidate / retire / replace, with value, effort and timing.', 'per-supplier action + renewal window'),
      { icon: 'list', sub: d.actionMatrix ? d.actionMatrix.length + ' suppliers dispositioned' : '',
        conf: d.actionMatrix ? 'Moderate' : 'Limited' });
  return h;
}

/* ===========================================================================
   SCREEN 12 — TREND & CHANGE > TAIL & CONTRACTS
   =========================================================================== */
function scTail() {
  var d = csData();
  var h = '';
  h += csCard('Tail Consolidation Opportunities', d.tailOpps ? csTailOpps(d.tailOpps)
      : csGap('Groups of tail suppliers that can be consolidated, with the receiving vehicle and the saving.',
              'tail grouping records (group, vendors, combined spend, target vehicle, estimated saving)'),
      { icon: 'list', role: 'solid', sub: d.tailOpps ? d.tailOpps.length + ' groups' : '', conf: d.tailOpps ? 'Moderate' : 'Limited' });

  h += csCard('Contract Opportunities', d.contractOpps ? csContractOpps(d.contractOpps)
      : csGap('Expiring agreements and off-contract spend, with the action and the window.',
              'agreement records with expiry, notice window and at-risk value'),
      { icon: 'cal', role: 'emph', sub: d.contractOpps ? d.contractOpps.length + ' at risk' : '', conf: d.contractOpps ? 'Moderate' : 'Limited' });
  return h;
}

/* ===========================================================================
   POPULATED PANEL RENDERERS

   Each of these draws a structure the production seed does not carry. Every
   call site is guarded, so with the real seed the panel still states its gap.
   These exist so the layout can be reviewed fully populated.
   =========================================================================== */

/* Overview: spend under contract.
   Was two numbers and a table. Now one bar that is the whole story: the covered
   block, then every uncovered relationship as its own segment of the same bar,
   so the size of each exposure is read against the category, not against itself. */
function csCoverage(c) {
  var off = (c.off || []).slice().sort(function (a, b) { return (b.v || 0) - (a.v || 0); });
  var total = (c.covered || 0) + (c.uncovered || 0);
  if (!total) return csGap('Contract coverage.', 'contract coverage per supplier');
  var segs = '<span class="cs-cvseg cs-cvseg-ok" style="width:' + ((c.covered / total) * 100).toFixed(2) + '%" '
    + 'title="' + csEsc('Under contract: ' + csUsd(c.covered)) + '"></span>'
    + off.map(function (o, i) {
        return '<span class="cs-cvseg cs-cvseg-x' + (i % 2) + '" style="width:' + ((o.v / total) * 100).toFixed(2) + '%" '
          + 'title="' + csEsc(o.n + ': ' + csUsd(o.v) + ' · ' + o.why) + '"></span>';
      }).join('');

  var rows = off.map(function (o) {
    return '<div class="cs-cvrow">'
      + '<span class="cs-cvsw"></span>'
      + '<span class="cs-cvn">' + csEsc(o.n) + '</span>'
      + '<span class="cs-cvw">' + csEsc(o.why) + '</span>'
      + '<span class="cs-cvv">' + csUsd(o.v) + '</span>'
      + '<span class="cs-cvp">' + csPct((o.v / total) * 100, 1) + '</span></div>';
  }).join('');

  return '<div class="cs-cvhead">'
      + '<div class="cs-cvbig"><b>' + csPct(c.pct, 0) + '</b><span>under contract</span></div>'
      + '<div class="cs-cvbig cs-cvbig-x"><b>' + csUsd(c.uncovered) + '</b><span>exposed</span></div></div>'
    + '<div class="cs-cvbar">' + segs + '</div>'
    + '<div class="cs-cvlist">' + rows + '</div>'
    + (c.note ? csNote(csEsc(c.note)) : '');
}

/* Overview: renewal exposure.
   Was a table of dates, which makes you do the arithmetic. Now a twelve-month
   timeline: each agreement sits where its notice deadline actually falls, and
   the bar runs from the notice date to expiry, which is the window you get. */
var CS_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function csParseDay(str) {
  var m = String(str || '').match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (!m) return null;
  var mi = CS_MONTHS.indexOf(m[2].slice(0, 3));
  if (mi < 0) return null;
  return { y: +m[3], m: mi, d: +m[1], ord: (+m[3]) * 12 + mi + (+m[1]) / 31 };
}
/* The clock starts at the data's own cutoff, not at whatever today happens to be. */
function csAnchor(d) {
  var c = String((d.meta || {}).cutoff || '');
  var ym = c.match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (ym) {
    var mi = CS_MONTHS.indexOf(ym[1].slice(0, 3));
    if (mi >= 0) return (+ym[2]) * 12 + mi;
  }
  return null;
}
function csRenewals(r) {
  var d = csData();
  var w = (r.windows || []).slice();
  if (!w.length) return csGap('Renewal windows.', 'renewal + notice dates per agreement');
  var a0 = csAnchor(d);
  var dated = w.map(function (x) { return { x: x, n: csParseDay(x.notice), e: csParseDay(x.expiry) }; });
  var known = dated.filter(function (t) { return t.e; });
  if (!a0 && known.length) a0 = Math.floor(Math.min.apply(null, known.map(function (t) { return t.e.ord; }))) - 1;
  var span = 12, a1 = a0 + span;

  var scale = function (ord) { return Math.max(0, Math.min(100, ((ord - a0) / span) * 100)); };
  var months = [];
  for (var i = 0; i <= span; i += 3) {
    var mm = (a0 + i) % 12, yy = Math.floor((a0 + i) / 12);
    months.push('<span class="cs-tlm" style="left:' + ((i / span) * 100).toFixed(2) + '%">'
      + CS_MONTHS[mm] + ' ' + String(yy).slice(-2) + '</span>');
  }

  var rows = dated.sort(function (p, q) {
    return ((p.e ? p.e.ord : 9e9) - (q.e ? q.e.ord : 9e9));
  }).map(function (t) {
    var x = t.x, urgent = x.state === 'critical', none = !t.e;
    var startOrd = t.n ? t.n.ord : (t.e ? t.e.ord - 0.5 : a0);
    var l = scale(startOrd), rr = t.e ? scale(t.e.ord) : 100;
    var wdt = Math.max(1.5, rr - l);
    var past = t.n && t.n.ord < a0;
    var bar = none
      ? '<span class="cs-tlbar cs-tlbar-none" style="left:0;width:100%" title="'
        + csEsc('Rolling, no notice right') + '"></span>'
      : '<span class="cs-tlbar' + (urgent ? ' is-urgent' : '') + '" style="left:' + l.toFixed(2)
        + '%;width:' + wdt.toFixed(2) + '%" title="'
        + csEsc('Notice by ' + x.notice + ', expires ' + x.expiry) + '"></span>'
        + (past ? '<span class="cs-tlpast" style="left:0;width:' + l.toFixed(2) + '%" title="'
            + csEsc('Notice window already open') + '"></span>' : '');
    return '<div class="cs-tlrow' + (urgent ? ' is-urgent' : '') + '">'
      + '<span class="cs-tln">' + csEsc(x.n) + '<small>' + csEsc(x.vehicle || '') + '</small></span>'
      + '<span class="cs-tlv">' + csUsd(x.v) + '</span>'
      + '<span class="cs-tltrack">' + bar + '</span>'
      + '<span class="cs-tld">' + csEsc(none ? 'rolling' : x.expiry) + '</span></div>';
  }).join('');

  return '<div class="cs-cvhead">'
      + '<div class="cs-cvbig"><b>' + csUsd(r.next12m) + '</b><span>renews within 12 months</span></div>'
      + '<div class="cs-cvbig"><b>' + csPct(r.pctOfSpend, 0) + '</b><span>of category spend</span></div></div>'
    + '<div class="cs-timeline"><div class="cs-tlaxis">' + months.join('') + '</div>' + rows + '</div>'
    + csNote('The bar is the decision window: it opens at the notice deadline and closes at expiry. '
      + 'A bar that starts at the left edge means the notice window is <b>already open</b>.');
}

/* Market & Risk: escalation triggers */
function csTriggers(t) {
  return '<div class="cs-trig">' + t.map(function (x) {
    return '<div class="cs-trig-row">'
      + '<div class="cs-trig-hd"><span class="cs-trig-r">' + csEsc(x.risk) + '</span>'
        + '<span class="cs-trig-t">' + csEsc(x.thr) + '</span></div>'
      + '<div class="cs-trig-c">' + csEsc(x.cond) + '</div>'
      + '<div class="cs-trig-a"><b>Then</b> ' + csEsc(x.act)
        + '<span class="cs-trig-o">' + csEsc(x.owner) + '</span></div></div>';
  }).join('') + '</div>';
}

/* Market & Risk: geographic concentration */
function csGeo(g) {
  var max = (g.regions || []).reduce(function (a, r) { return Math.max(a, r.pct || 0); }, 0) || 1;
  var rows = (g.regions || []).map(function (r) {
    return '<tr><td class="cs-l">' + csEsc(r.r) + '</td>'
      + '<td class="cs-barcell">' + csBar((r.pct / max) * 100, 'teal') + '</td>'
      + '<td class="cs-num">' + csPct(r.pct, 0) + '</td>'
      + '<td class="cs-num">' + csUsd(r.v) + '</td>'
      + '<td class="cs-why">' + csEsc(r.sup) + '</td></tr>';
  });
  return csTable(['Region', '', 'Share', 'Spend', 'Principal suppliers'], rows)
    + (g.note ? csNote(csEsc(g.note)) : '');
}

/* Strategy: execution pillars */
function csPillars(p) {
  return '<div class="cs-pillars">' + p.map(function (x, i) {
    return '<div class="cs-pillar">'
      + '<div class="cs-pillar-n"><span class="cs-pillar-i">' + (i + 1) + '</span>' + csEsc(x.n) + '</div>'
      + '<div class="cs-pillar-o">' + csEsc(x.outcome) + '</div>'
      + '<div class="cs-pillar-m"><span>' + csEsc(x.owner) + '</span><span>' + csEsc(x.measure) + '</span></div></div>';
  }).join('') + '</div>';
}

/* Strategy: sequenced actions */
function csActions(a) {
  var rows = a.map(function (x) {
    return '<tr class="cs-st-' + csEsc(x.state || 'open') + '">'
      + '<td class="cs-l">' + csEsc(x.a) + '</td>'
      + '<td class="cs-num"><span class="cs-win cs-win-' + csEsc(String(x.w).replace('-', '')) + '">' + csEsc(x.w) + ' mo</span></td>'
      + '<td class="cs-num">' + csEsc(x.owner) + '</td>'
      + '<td class="cs-why">' + csEsc(x.dep) + '</td></tr>';
  });
  return csTable(['Action', 'Window', 'Owner', 'Depends on'], rows);
}

/* Savings: realised benefits traced to the lever that produced them */
function csBenefits(b) {
  var tot = b.reduce(function (a, x) { return a + (x.amt || 0); }, 0);
  var rows = b.map(function (x) {
    return '<tr class="cs-st-' + csEsc(x.state || 'open') + '">'
      + '<td class="cs-l">' + csEsc(x.lever) + '</td>'
      + '<td class="cs-num">' + (x.amt == null ? '--' : csUsd(x.amt)) + '</td>'
      + '<td class="cs-num">' + csEsc(x.type) + '</td>'
      + '<td class="cs-num">' + csEsc(x.when) + '</td>'
      + '<td class="cs-num"><span class="cs-state">' + csEsc(x.state) + '</span></td>'
      + '<td class="cs-why">' + csEsc(x.evid) + '</td></tr>';
  });
  return '<div class="cs-split2"><div class="cs-stat"><div class="cs-stat-v">' + csUsd(tot) + '</div>'
      + '<div class="cs-stat-l">booked against a named lever</div></div></div>'
    + csTable(['Lever', 'Amount', 'Type', 'Booked', 'State', 'Evidence'], rows);
}

/* Supplier Program: development pipeline */
function csDevelopment(dv) {
  var rows = dv.map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.n) + '</td>'
      + '<td class="cs-num"><span class="cs-state">' + csEsc(x.stage) + '</span></td>'
      + '<td class="cs-num">' + csEsc(x.owner) + '</td>'
      + '<td class="cs-why">' + csEsc(x.impact) + '</td>'
      + '<td class="cs-why">' + csEsc(x.next) + '</td>'
      + '<td class="cs-num">' + csEsc(x.due) + '</td></tr>';
  });
  return csTable(['Supplier', 'Stage', 'Owner', 'Expected impact', 'Next step', 'Due'], rows);
}

/* Supplier Program: overlapping capability */
function csOverlaps(ov) {
  return '<div class="cs-ovl">' + ov.map(function (x) {
    return '<div class="cs-ovl-row">'
      + '<div class="cs-ovl-hd"><span class="cs-ovl-c">' + csEsc(x.cap) + '</span>'
        + '<span class="cs-ovl-v">' + csUsd(x.v) + '</span></div>'
      + '<div class="cs-ovl-s">' + (x.sup || []).map(function (s) {
          return '<span class="cs-chip">' + csEsc(s) + '</span>';
        }).join('') + '</div>'
      + '<div class="cs-ovl-r">' + csEsc(x.read) + '</div></div>';
  }).join('') + '</div>';
}

/* Supplier Program: utilization / shelfware */
function csUtilization(u) {
  var rows = u.map(function (x) {
    var poor = x.pct < 70;
    return '<tr' + (poor ? ' class="cs-st-critical"' : '') + '>'
      + '<td class="cs-l">' + csEsc(x.n) + '</td>'
      + '<td class="cs-barcell">' + csBar(x.pct, poor ? 'emph' : 'teal') + '</td>'
      + '<td class="cs-num">' + csPct(x.pct, 0) + '</td>'
      + '<td class="cs-num">' + csNum(x.active) + ' / ' + csNum(x.bought) + '</td>'
      + '<td class="cs-num">' + (x.waste == null ? '--' : csUsd(x.waste)) + '</td>'
      + '<td class="cs-why">' + csEsc(x.note) + '</td></tr>';
  });
  return csTable(['Supplier', '', 'Used', 'Active / bought', 'At risk', 'Read'], rows)
    + csNote('Anything under 70% is flagged. Licence counts are point-in-time, not an average over the term.');
}

/* Supplier Program: action matrix */
function csActionMatrix(am) {
  var rows = am.map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.n) + '</td>'
      + '<td class="cs-num"><span class="cs-act cs-act-' + csEsc(String(x.act).toLowerCase()) + '">' + csEsc(x.act) + '</span></td>'
      + '<td class="cs-num">' + (x.v == null ? '--' : csUsd(x.v)) + '</td>'
      + '<td class="cs-num">' + csEsc(x.effort) + '</td>'
      + '<td class="cs-num">' + csEsc(x.when) + '</td>'
      + '<td class="cs-why">' + csEsc(x.why) + '</td></tr>';
  });
  return csTable(['Supplier', 'Action', 'Value at stake', 'Effort', 'Window', 'Why'], rows);
}

/* Execution: spend forecast with a band */
function csForecast(f) {
  var all = (f.hist || []).map(function (h) { return { y: h.y, v: h.v, hist: true }; })
    .concat((f.years || []).map(function (p) { return { y: p.y, v: p.v, lo: p.lo, hi: p.hi }; }));
  var max = all.reduce(function (a, p) { return Math.max(a, p.hi || p.v || 0); }, 0) || 1;
  var cols = all.map(function (p) {
    var band = (p.lo != null && p.hi != null)
      ? '<i class="cs-fc-band" style="bottom:' + ((p.lo / max) * 100).toFixed(1) + '%;height:'
          + (((p.hi - p.lo) / max) * 100).toFixed(1) + '%"></i>' : '';
    return '<div class="cs-fc-col' + (p.hist ? ' is-hist' : ' is-proj') + '">'
      + '<div class="cs-fc-v">' + csUsd(p.v) + '</div>'
      + '<div class="cs-fc-plot">' + band
        + '<i class="cs-fc-bar" style="height:' + ((p.v / max) * 100).toFixed(1) + '%"></i></div>'
      + '<div class="cs-fc-l">' + csEsc(p.y) + '</div></div>';
  }).join('');
  return '<div class="cs-fc">' + cols + '</div>'
    + '<div class="cs-fc-key"><span class="cs-k-hist">actual</span><span class="cs-k-proj">projected</span>'
      + '<span class="cs-k-band">range</span></div>'
    + csNote('<b>Basis.</b> ' + csEsc(f.basis));
}

/* Execution: rate vs volume decomposition */
function csRateVolume(rv) {
  var ratePct = rv.total ? (rv.rate / rv.total) * 100 : 0;
  var rows = (rv.rows || []).map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.n) + '</td>'
      + '<td class="cs-num">' + csUsd(x.d) + '</td>'
      + '<td class="cs-num">' + csUsd(x.rate) + '</td>'
      + '<td class="cs-num">' + csUsd(x.vol) + '</td>'
      + '<td class="cs-why">' + csEsc(x.read) + '</td></tr>';
  });
  return '<div class="cs-rv"><div class="cs-rv-bar">'
      + '<i class="cs-rv-rate" style="width:' + ratePct.toFixed(1) + '%"></i>'
      + '<i class="cs-rv-vol" style="width:' + (100 - ratePct).toFixed(1) + '%"></i></div>'
    + '<div class="cs-rv-key"><span class="cs-k-rate">Rate ' + csUsd(rv.rate) + '</span>'
      + '<span class="cs-k-vol">Volume ' + csUsd(rv.volume) + '</span></div></div>'
    + csTable(['Supplier', 'Change', 'Rate', 'Volume', 'Read'], rows)
    + csNote(csEsc(rv.note));
}

/* Execution: movement since the last approved strategy */
function csSinceLast(sl) {
  var rows = (sl.rows || []).map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.k) + '</td>'
      + '<td class="cs-num cs-was">' + csEsc(x.was) + '</td>'
      + '<td class="cs-num"><span class="cs-dir cs-dir-' + csEsc(x.dir) + '">'
        + (x.dir === 'up' ? '&#9650;' : '&#9660;') + '</span></td>'
      + '<td class="cs-num"><b>' + csEsc(x.now) + '</b></td>'
      + '<td class="cs-why">' + csEsc(x.read) + '</td></tr>';
  });
  return csTable(['Measure', 'Was', '', 'Now', 'Read'], rows);
}

/* Execution: roadmap, the same action records grouped by window */
function csRoadmap(a) {
  var wins = ['0-3', '3-6', '6-12'];
  return '<div class="cs-road">' + wins.map(function (w) {
    var items = a.filter(function (x) { return x.w === w; });
    return '<div class="cs-road-col">'
      + '<div class="cs-road-hd">' + csEsc(w) + ' months<span>' + items.length + '</span></div>'
      + items.map(function (x) {
          return '<div class="cs-road-i cs-st-' + csEsc(x.state || 'open') + '">'
            + '<div class="cs-road-a">' + csEsc(x.a) + '</div>'
            + '<div class="cs-road-m">' + csEsc(x.owner) + '</div></div>';
        }).join('')
      + '</div>';
  }).join('') + '</div>';
}

/* ===========================================================================
   COMPONENTS ADDED IN THE RESTRUCTURE
   =========================================================================== */

/* ---- evidence strength, the 3-dot badge used on Deal and Landscape --------
   Replaces the Scope & Data Quality panel. Confidence belongs on the panel it
   qualifies, not parked in a box at the bottom of the page.                  */
function csConf(level, why) {
  var key = String(level || 'Moderate').toLowerCase();
  var cls = key === 'strong' ? 'cs-cov-strong' : key === 'limited' ? 'cs-cov-limited' : 'cs-cov-moderate';
  var lbl = key.charAt(0).toUpperCase() + key.slice(1);
  return '<span class="cs-cov ' + cls + '"' + (why ? ' title="' + csEsc(why) + '"' : '') + '>'
    + '<span class="cs-dots"><i></i><i></i><i></i></span>' + csEsc(lbl) + ' evidence</span>';
}
/* Strength read off the seed's own provenance: a tier-1 system of record is
   strong, a modelled estimate is limited, anything else moderate. */
function csConfFor(d, section) {
  var src = ((d || csData()).$src || {})[section];
  if (!src) return 'Limited';
  if (src.kind === 'derived') return 'Moderate';
  var arr = Array.isArray(src) ? src : [src];
  var tier = arr.reduce(function (a, x) { return Math.min(a, (x && x.tier) || 3); }, 9);
  var conf = arr.map(function (x) { return String((x && x.confidence) || '').toLowerCase(); }).join(' ');
  if (tier <= 1 && !/low/.test(conf)) return 'Strong';
  if (tier >= 3 || /low/.test(conf)) return 'Limited';
  return 'Moderate';
}
/* an inline "what is this" marker */
function csHelp(text) {
  return '<span class="cs-help" tabindex="0" title="' + csEsc(text) + '">?</span>';
}
var CS_HHI_HELP = 'Herfindahl-Hirschman Index. Sum of every supplier\'s squared percentage share, '
  + 'on a 0 to 10,000 scale. One supplier with all the spend scores 10,000; a thousand equal suppliers '
  + 'score 10. Under 1,500 is unconcentrated, 1,500 to 2,500 moderately concentrated, above 2,500 '
  + 'concentrated. Low means competition to use; high means dependency to manage.';

/* ---- Overview: top suppliers, 10 visible then scroll ---------------------- */
function csTopSuppliers(d) {
  var sup = (d.suppliers || []).slice(0, 20);
  if (!sup.length) return csGap('Ranked suppliers.', 'suppliers[]');
  var max = sup.reduce(function (a, s) { return Math.max(a, s.tot || 0); }, 0) || 1;
  var rows = sup.map(function (s, i) {
    return '<div class="cs-suprow"><span class="cs-supr">' + (i + 1) + '</span>'
      + '<span class="cs-supn" title="' + csEsc(s.n) + '">' + csEsc(s.n) + '</span>'
      + csBar((s.tot / max) * 100, 'plum')
      + '<span class="cs-supv">' + csUsd(s.tot) + '</span>'
      + '<span class="cs-supp">' + csPct(s.share) + '</span></div>';
  }).join('');
  var head = '<div class="cs-suprow cs-suphead">'
    + '<span class="cs-supr">#</span><span class="cs-supn">Supplier</span>'
    + '<span class="cs-suphb">3-yr spend</span><span class="cs-supv">Total</span>'
    + '<span class="cs-supp">Share</span></div>';
  return '<div class="cs-suplist cs-scroll10">' + head + rows + '</div>'
    + csNote('Top ' + sup.length + ' of ' + csNum((d.meta || {}).vendors) + ' active suppliers. Ten shown, scroll for the rest.');
}

/* ===========================================================================
   SHARED SPEND TREND
   One SVG chart used by the category Overview, Trend & Change, and the supplier
   deep dive. Carries bars, the stacked current-year projection, a fitted trend
   line and a confidence band, so the three do not drift apart.
   =========================================================================== */

/* Least-squares fit through the completed years. The trend line is what the
   history alone implies; the projected bars may differ, and where they do the
   gap is the point. */
function csFit(pts) {
  var n = pts.length;
  if (n < 2) return null;
  var sx = 0, sy = 0, sxy = 0, sxx = 0;
  pts.forEach(function (p, i) { sx += i; sy += p; sxy += i * p; sxx += i * i; });
  var den = n * sxx - sx * sx;
  if (!den) return null;
  var m = (n * sxy - sx * sy) / den;
  return { m: m, b: (sy - m * sx) / n };
}

/* series: [{y, v, kind:'hist'|'ytd', banked, total, lo, hi}] already ordered */
function csTrendSvg(series, opts) {
  var o = opts || {};
  if (!series.length) return '';
  var max = series.reduce(function (a, p) { return Math.max(a, p.hi || p.total || p.v || 0); }, 0) || 1;
  max = max * 1.12;
  var n = series.length;
  var pct = function (v) { return (v / max) * 100; };
  var xAt = function (i) { return ((i + 0.5) / n) * 100; };

  /* columns: HTML, so the labels keep the size they are given */
  var cols = series.map(function (p, i) {
    var top = p.total != null ? p.total : p.v;
    var bar;
    if (p.total != null && p.banked != null) {
      bar = '<i class="cs-fc-bar" style="height:' + pct(p.banked).toFixed(2) + '%"></i>'
          + '<i class="cs-fc-add" style="bottom:' + pct(p.banked).toFixed(2) + '%;height:'
          + pct(p.total - p.banked).toFixed(2) + '%"></i>';
    } else {
      bar = '<i class="cs-fc-bar" style="height:' + pct(p.v).toFixed(2) + '%"></i>';
    }
    var tip = p.total != null
      ? p.y + ': ' + csUsd(p.banked) + ' spent so far, ' + csUsd(p.total - p.banked)
        + ' projected for the rest of the year, ' + csUsd(p.total) + ' full year'
      : p.y + ': ' + csUsd(p.v) + (p.kind === 'proj' ? ' projected' : p.kind === 'ytd' ? ' year to date' : '');
    return '<div class="cs-fc-col is-' + p.kind + '" title="' + csEsc(tip) + '">'
      + '<div class="cs-fc-v">' + csUsd(top) + '</div>'
      + '<div class="cs-fc-plot">' + bar + '</div>'
      + '<div class="cs-fc-l">' + csEsc(p.y) + '</div></div>';
  }).join('');

  /* band + line: SVG stretched over the plot, no text inside it */
  var layers = '';
  var withBand = series.map(function (p, i) { return { i: i, p: p }; })
    .filter(function (x) { return x.p.lo != null && x.p.hi != null; });
  if (withBand.length > 1) {
    var up = withBand.map(function (x) { return xAt(x.i).toFixed(2) + ',' + (100 - pct(x.p.hi)).toFixed(2); });
    var dn = withBand.slice().reverse().map(function (x) { return xAt(x.i).toFixed(2) + ',' + (100 - pct(x.p.lo)).toFixed(2); });
    layers += '<polygon points="' + up.concat(dn).join(' ') + '" class="cs-tband"/>';
  }
  if (o.trend !== false) {
    var hi = [], hv = [];
    series.forEach(function (p, i) { if (p.kind === 'hist') { hi.push(i); hv.push(p.v); } });
    var f = csFit(hv);
    if (f && hi.length > 1) {
      var pts = series.map(function (p, i) {
        var v = Math.max(0, f.b + f.m * (i - hi[0]));
        return xAt(i).toFixed(2) + ',' + (100 - pct(v)).toFixed(2);
      });
      layers += '<polyline points="' + pts.join(' ') + '" class="cs-tline"/>';
    }
  }
  var over = layers
    ? '<svg class="cs-tover" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'
      + layers + '</svg>' : '';

  return '<div class="cs-fc">' + over + cols + '</div>';
}

/* Build the series for a category from annual[] + forecast, or project it. */
function csTrendSeries(d, showFc) {
  var m = d.meta || {};
  var act = (d.annual || []).filter(function (a) { return a.value; })
    .map(function (a) { return { y: a.name, v: a.value, kind: /YTD|partial/i.test(a.name || '') ? 'ytd' : 'hist' }; });
  if (!act.length) return [];
  var ytdIdx = -1;
  for (var i = 0; i < act.length; i++) if (act[i].kind === 'ytd') ytdIdx = i;
  if (!showFc) return act;

  var fy = (d.forecast && d.forecast.years) || [];
  var ytdYear = ytdIdx >= 0 ? String(act[ytdIdx].y).replace(/[^0-9]/g, '').slice(-4) : null;
  var proj = [];
  fy.forEach(function (p) {
    var yr = String(p.y).replace(/[^0-9]/g, '').slice(-4);
    if (ytdYear && yr === ytdYear) {
      act[ytdIdx].banked = act[ytdIdx].v;
      act[ytdIdx].total = Math.max(p.v, act[ytdIdx].v);
      act[ytdIdx].lo = p.lo; act[ytdIdx].hi = p.hi;
    } else proj.push({ y: p.y, v: p.v, lo: p.lo, hi: p.hi, kind: 'proj' });
  });
  if (!fy.length && m.cagr2325 != null) {
    var lastFull = act[ytdIdx >= 0 ? ytdIdx - 1 : act.length - 1];
    if (lastFull) {
      var g = m.cagr2325 / 100;
      if (ytdIdx >= 0) {
        var full = Math.max(lastFull.v * (1 + g), act[ytdIdx].v);
        act[ytdIdx].banked = act[ytdIdx].v; act[ytdIdx].total = full;
        act[ytdIdx].lo = full * 0.97; act[ytdIdx].hi = full * 1.03;
      }
      var base = parseInt(String(lastFull.y).replace(/[^0-9]/g, '').slice(-4), 10);
      for (var k = 1; k <= 3; k++) {
        var step = k + (ytdIdx >= 0 ? 1 : 0);
        var b = lastFull.v * Math.pow(1 + g, step);
        proj.push({ y: 'FY' + (base + step), v: b, lo: b * Math.pow(0.97, step), hi: b * Math.pow(1.03, step), kind: 'proj' });
      }
    }
  }
  return act.concat(proj);
}

function csTrendKey(showFc, hasProj) {
  return '<div class="cs-fc-key"><span class="cs-k-hist">actual</span>'
    + (showFc ? '<span class="cs-k-add">rest of year, projected</span>' : '<span class="cs-k-ytd">year to date</span>')
    + (showFc && hasProj ? '<span class="cs-k-proj">projected</span><span class="cs-k-band">range</span>' : '')
    + '<span class="cs-k-trend">trend</span></div>';
}
function csFcToggle(fn, on) {
  return '<div class="cs-ctrlbar"><button class="cs-toggle' + (on ? ' on' : '') + '"'
    + ' onclick="' + fn + '" aria-pressed="' + (on ? 'true' : 'false') + '">'
    + '<span class="cs-toggle-t"></span>Forecast</button></div>';
}

function csTrendChart(d) {
  var m = d.meta || {};
  var series = csTrendSeries(d, CS_FORECAST);
  if (!series.length) return csGap('Annual spend trend.', 'annual[]');
  var hasProj = series.some(function (p) { return p.kind === 'proj'; });
  var basis = CS_FORECAST
    ? csNote('<b>Forecast basis.</b> ' + (d.forecast && d.forecast.basis
        ? csEsc(d.forecast.basis)
        : 'The observed ' + csPct(m.cagr2325) + ' three-year CAGR carried forward, with a &plusmn;3% a year band. '
          + 'It does <b>not</b> incorporate known renewals or price escalators, because this data set carries no '
          + 'renewal dates.')
        + ' The current year shows what is already spent with the projected remainder stacked on top. '
        + 'The line is a least-squares fit through the completed years only.')
    : csNote(csEsc(m.ytdNote ? 'The current year is a part year: ' + m.ytdNote + '.' : 'The current year is a part year.'));
  return csFcToggle('csToggleFc()', CS_FORECAST)
    + '<div class="cs-twrap">' + csTrendSvg(series, {}) + '</div>'
    + csTrendKey(CS_FORECAST, hasProj) + basis;
}

/* ---- supplier deep dive: the same chart on that supplier's own history ---- */
var CS_SUP_FC = false;
function csSupToggleFc() { CS_KEEPSCROLL = true; CS_SUP_FC = !CS_SUP_FC; csRender(); }
function csSupTrend(s) {
  var act = [['FY2023', s.s3], ['FY2024', s.s4], ['FY2025', s.s5], ['FY2026 YTD', s.s6]]
    .filter(function (y) { return y[1] != null; })
    .map(function (y) { return { y: y[0], v: y[1], kind: /YTD/.test(y[0]) ? 'ytd' : 'hist' }; });
  if (!act.length) return { series: [], cagr: null };

  var hist = act.filter(function (p) { return p.kind === 'hist'; });
  var cagr = hist.length >= 2
    ? (Math.pow(hist[hist.length - 1].v / hist[0].v, 1 / (hist.length - 1)) - 1) : null;
  if (!CS_SUP_FC || cagr == null) return { series: act, cagr: cagr };

  var g = cagr, last = hist[hist.length - 1];
  var ytdIdx = -1;
  for (var i = 0; i < act.length; i++) if (act[i].kind === 'ytd') ytdIdx = i;
  var base = parseInt(String(last.y).replace(/[^0-9]/g, '').slice(-4), 10);
  var proj = [];
  if (ytdIdx >= 0) {
    var full = Math.max(last.v * (1 + g), act[ytdIdx].v);
    act[ytdIdx].banked = act[ytdIdx].v; act[ytdIdx].total = full;
    act[ytdIdx].lo = full * 0.94; act[ytdIdx].hi = full * 1.06;
  }
  for (var k = 1; k <= 3; k++) {
    var step = k + (ytdIdx >= 0 ? 1 : 0);
    var v = last.v * Math.pow(1 + g, step);
    proj.push({ y: 'FY' + (base + step), v: v, lo: v * Math.pow(0.94, k), hi: v * Math.pow(1.06, k), kind: 'proj' });
  }
  return { series: act.concat(proj), cagr: cagr };
}

/* ---- Overview: key findings as cards, not three stacked paragraphs -------- */
function csFindings(d) {
  var f = (d.narr || {}).findings;
  if (!f) return csGap('Key data-driven findings', 'narr.findings');
  var arr = Array.isArray(f) ? f : [f];
  if (typeof arr[0] === 'string') return csNarr(f);
  return '<div class="cs-mis">' + arr.map(function (x) {
    var tone = csTone(x.c) || 'plum';
    var k = x.k || '';
    return '<div class="cs-mi cs-mi-' + tone + '">'
      + (k ? '<div class="cs-mi-k">' + csEsc(k)
             + (/hhi/i.test(k) ? csHelp(CS_HHI_HELP) : '') + '</div>' : '')
      + '<div class="cs-mi-t">' + csEsc(x.t || x.title || '') + '</div>'
      + '<div class="cs-mi-d">' + csEsc(x.d || '') + '</div></div>';
  }).join('') + '</div>';
}

/* ---- Pareto: bars with a cumulative line, the 80/20 rule and a tail band --- */
/* The 80% point has to be read off the FULL curve. Reading it off the named
   megavendors alone answers a different question and gets it badly wrong. */
function csParetoSeries(d) { return d.paretoFull || d.pareto || []; }
function csPareto80(d) {
  var p = csParetoSeries(d);
  for (var i = 0; i < p.length; i++) if ((p[i].cumPct || 0) >= 80) return i;
  return -1;
}
function csParetoCount(d) {
  var i = csPareto80(d);
  if (i >= 0) return csNum(i + 1);
  var m = d.meta || {};
  return (m.p80 && m.p80 !== '~') ? csNum(m.p80) : 'beyond the resolved set';
}
function csParetoChart(d) {
  var m = d.meta || {};
  var named = (d.pareto || []).slice();
  if (!named.length) return csGap('Supplier Pareto.', 'pareto[]');

  /* The seed resolves the megavendors by name and describes everything else in
     aggregate. Where a full curve exists we draw it; otherwise the remainder is
     drawn as one honest tail band rather than invented per-supplier bars. */
  var full = d.paretoFull || null;
  var whole = full || named;
  var i80 = csPareto80(d);
  /* Show the crossing plus a little of the flat stretch beyond it, so the
     80/20 split is on screen rather than off the right-hand edge. */
  var window = i80 >= 0 ? Math.min(whole.length, i80 + 14) : Math.min(whole.length, 60);
  var series = whole.slice(0, window);
  var truncated = Math.max(0, whole.length - window);
  var totalSup = m.vendors || whole.length;

  var max = series.reduce(function (a, p) { return Math.max(a, p.value || 0); }, 0) || 1;
  var W = 960, H = 300, PADL = 66, PADR = 48, PADB = 26, PADT = 16;
  var plotW = W - PADL - PADR, plotH = H - PADT - PADB;
  var bw = plotW / series.length;

  var idx80 = (i80 >= 0 && i80 < series.length) ? i80 : -1;
  /* Direct labels never run past the 80/20 line, and never past twelve either.
     In a fragmented category the line can sit at supplier 246, and 246 rotated
     labels is not a chart, it is a wall. Everything else is tooltip-only. */
  var labelTo = Math.min(idx80 >= 0 ? idx80 : series.length - 1, 11);

  var bars = series.map(function (p, i) {
    var hgt = Math.max(1, (p.value / max) * plotH);
    var x = PADL + i * bw, inA = (i80 < 0) ? true : i <= i80;
    return '<rect x="' + (x + bw * 0.15).toFixed(1) + '" y="' + (PADT + plotH - hgt).toFixed(1) + '" '
      + 'width="' + (bw * 0.7).toFixed(1) + '" height="' + hgt.toFixed(1) + '" rx="1.5" '
      + 'class="' + (inA ? 'cs-pb-a' : 'cs-pb-b') + '">'
      + '<title>' + csEsc(p.name + ' · ' + csUsd(p.value) + ' · ' + csPct(p.cumPct, 1) + ' cumulative') + '</title></rect>';
  }).join('');

  var pts = series.map(function (p, i) {
    return (PADL + i * bw + bw / 2).toFixed(1) + ',' + (PADT + plotH - ((p.cumPct || 0) / 100) * plotH).toFixed(1);
  }).join(' ');
  var line = '<polyline points="' + pts + '" class="cs-pline"/>'
    + series.map(function (p, i) {
        return '<circle cx="' + (PADL + i * bw + bw / 2).toFixed(1) + '" cy="'
          + (PADT + plotH - ((p.cumPct || 0) / 100) * plotH).toFixed(1) + '" r="2.6" class="cs-pdot">'
          + '<title>' + csEsc(p.name + ' · ' + csPct(p.cumPct, 1) + ' cumulative') + '</title></circle>';
      }).join('');

  /* the 80/20 split */
  var rule = '';
  if (idx80 >= 0) {
    var xr = PADL + (idx80 + 1) * bw;
    var flip = xr > W - PADR - 190;   // no room on the right; label to the left
    rule = '<line x1="' + xr.toFixed(1) + '" y1="' + PADT + '" x2="' + xr.toFixed(1) + '" y2="' + (PADT + plotH)
      + '" class="cs-p80"/>'
      + '<text x="' + (flip ? xr - 6 : xr + 6).toFixed(1) + '" y="' + (PADT + 12)
      + '" class="cs-p80t"' + (flip ? ' text-anchor="end"' : '') + '>80% of spend at supplier '
      + csNum(idx80 + 1) + '</text>';
  }
  var y80 = PADT + plotH - 0.8 * plotH;
  rule += '<line x1="' + PADL + '" y1="' + y80.toFixed(1) + '" x2="' + (W - PADR) + '" y2="' + y80.toFixed(1) + '" class="cs-p80h"/>';

  /* labels only before the 80/20 line; everything past it is tooltip-only */
  /* No direct labels at all. A Pareto of a few hundred suppliers cannot carry
     them, and half-labelling invites the eye to read rank off position. Every
     bar and every point on the curve carries its name in a tooltip. */
  var labels = '', strip = '';

  /* Two axes: spend on the left, cumulative share on the right. The old build
     printed the top value as a floating label, which the tallest bar then sat
     on top of. */
  var axis = '<line x1="' + PADL + '" y1="' + (PADT + plotH) + '" x2="' + (W - PADR) + '" y2="' + (PADT + plotH) + '" class="cs-pax"/>'
    + '<line x1="' + PADL + '" y1="' + PADT + '" x2="' + PADL + '" y2="' + (PADT + plotH) + '" class="cs-pax"/>'
    + [0, 25, 50, 75, 100].map(function (t) {
        var y = PADT + plotH - (t / 100) * plotH;
        return (t ? '<line x1="' + PADL + '" y1="' + y.toFixed(1) + '" x2="' + (W - PADR) + '" y2="'
                  + y.toFixed(1) + '" class="cs-pgrid"/>' : '')
          + '<text x="' + (W - PADR + 7) + '" y="' + (y + 3).toFixed(1) + '" class="cs-pyr">' + t + '%</text>'
          + '<text x="' + (PADL - 7) + '" y="' + (y + 3).toFixed(1) + '" class="cs-pyl">'
          + csUsd(max * (t / 100)) + '</text>';
      }).join('')
;   // no axis captions: the $ and % on the ticks already say which is which,
       // and captions here collide with the topmost tick label

  var tailNote = '';
  if (truncated) {
    var tailSpend = whole.slice(window).reduce(function (a, x) { return a + (x.value || 0); }, 0);
    tailNote = '<text x="' + (W - PADR - 8) + '" y="' + (PADT + plotH - 22) + '" class="cs-ptail">'
      + csNum(truncated) + ' more suppliers in the tail</text>'
      + '<text x="' + (W - PADR - 8) + '" y="' + (PADT + plotH - 9) + '" class="cs-ptail cs-ptail2">'
      + csUsd(Math.round(tailSpend / truncated)) + ' average each</text>';
  }

  return '<div class="cs-pwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="cs-psvg" role="img" '
    + 'aria-label="Pareto of supplier spend with cumulative share">'
    + rule + bars + line + axis + labels + tailNote + '</svg></div>' + strip
    + '<div class="cs-fc-key"><span class="cs-k-a">to 80% of spend</span><span class="cs-k-b">remainder</span>'
    + '<span class="cs-k-line">cumulative share</span></div>'
    + (full ? '' : csNote('Only the ' + named.length + ' suppliers with resolved detail are plotted by name. The other '
        + csNum(Math.max(0, totalSup - named.length)) + ' are described in aggregate below rather than drawn as invented bars.'));
}
function csParetoRead(d) {
  var m = d.meta || {}, p = d.pareto || [];
  if (!p.length) return '';
  var n80 = csParetoCount(d), i80 = csPareto80(d);
  var lead = p[0];
  var line80 = i80 >= 0
    ? 'Four fifths of this category is carried by <b>' + n80 + '</b> of ' + csNum(m.vendors) + ' suppliers'
    : 'The 80% point sits beyond the suppliers this data set resolves by name, which is itself the finding: '
      + 'spend is spread thin enough that no small group carries four fifths of it';
  var conc = m.hhi == null ? '' : (m.hhi >= 2500 ? 'concentrated' : m.hhi >= 1500 ? 'moderately concentrated' : 'unconcentrated');
  return '<div class="cs-read">'
    + '<div class="cs-read-d">' + line80 + ', and the largest single relationship, <b>' + csEsc(lead.name) + '</b>, '
    + 'is ' + csPct(lead.cumPct, 1) + ' of it on its own. At an HHI' + csHelp(CS_HHI_HELP) + ' of '
    + csNum(Math.round(m.hhi || 0)) + ' the category is '
    + conc + ', which means leverage comes from <b>competing the top</b> rather than from breaking a monopoly. '
    + 'The flat right-hand stretch is the cost problem: ' + (function () {
      var a = csTailAt(d, CS_TAIL);
      return a ? csNum(a.n) + ' suppliers under ' + csTailLabel(CS_TAIL) + ' account for ' + csPct(a.pct) : 'the tail';
    }()) + ' of spend but consume the same contracting and vendor-management effort as the top.'
    + '</div></div>';
}
var CS_TAIL_STOPS = [50, 100, 250, 500, 1000];
function csTailLabel(v) { return v >= 1000 ? '$' + (v / 1000) + 'M' : '$' + v + 'K'; }
function csTailSlider() {
  var at = CS_TAIL_STOPS.indexOf(CS_TAIL);
  if (at < 0) at = 1;
  return '<div class="cs-tslider">'
    + '<input type="range" min="0" max="' + (CS_TAIL_STOPS.length - 1) + '" step="1" value="' + at + '" '
    + 'aria-label="Tail threshold" oninput="csSetTail(CS_TAIL_STOPS[+this.value])">'
    + '<div class="cs-tsticks">' + CS_TAIL_STOPS.map(function (v, i) {
        return '<span class="' + (i === at ? 'on' : '') + '">' + csTailLabel(v) + '</span>';
      }).join('') + '</div>'
    + '<div class="cs-tslab">suppliers spending under this each year</div></div>';
}
/* The seed carries tail counts at 50/100/250 only. Where a full supplier curve
   exists the count at any threshold is read off it; where it does not, the two
   new stops say so rather than showing a number nobody computed. */
function csTailAt(d, t) {
  var m = d.meta || {};
  if (m['tail' + t] != null) {
    return { n: m['tail' + t], spend: m['tail' + t + 'Spend'], pct: m['tail' + t + 'Pct'], derived: false };
  }
  var full = d.paretoFull;
  if (!full || !full.length) return null;
  var lim = t * 1000, n = 0, spend = 0, total = 0;
  full.forEach(function (p) {
    total += p.value || 0;
    if ((p.value || 0) < lim) { n++; spend += p.value || 0; }
  });
  return { n: n, spend: spend, pct: total ? (spend / total) * 100 : 0, derived: true };
}
/* Two concentric rings, because the point is the gap between them: the outer
   ring is how many suppliers the tail is, the inner is how little it buys. */
function csTailDonut(supPct, spendPct) {
  var R1 = 54, R2 = 36, C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2;
  var ring = function (r, c, pct, cls) {
    return '<circle cx="70" cy="70" r="' + r + '" class="cs-dnbg"/>'
      + '<circle cx="70" cy="70" r="' + r + '" class="' + cls + '" '
      + 'stroke-dasharray="' + ((pct / 100) * c).toFixed(1) + ' ' + c.toFixed(1) + '" '
      + 'transform="rotate(-90 70 70)"/>';
  };
  return '<svg viewBox="0 0 140 140" class="cs-donut" role="img" '
    + 'aria-label="Share of suppliers against share of spend">'
    + ring(R1, C1, supPct, 'cs-dnsup') + ring(R2, C2, spendPct, 'cs-dnspend') + '</svg>';
}
function csTailStats(d) {
  var m = d.meta || {};
  var t = CS_TAIL, at = csTailAt(d, t);
  if (!at) return csTailSlider()
    + csGap('How many suppliers sit under ' + csTailLabel(t) + ' a year, and what they cost.',
            'a tail count at this threshold, or a full supplier curve to read it from');
  var n = at.n, sp = at.spend, pc = at.pct;
  var supPct = m.vendors ? (n / m.vendors) * 100 : 0;
  return csTailSlider()
    + '<div class="cs-tdwrap">' + csTailDonut(supPct, pc)
      + '<div class="cs-tdmid"><b>' + csNum(n) + '</b><span>suppliers</span></div></div>'
    + '<div class="cs-tdkey">'
      + '<div class="cs-tdk"><i class="k-sup"></i><span>Share of suppliers</span><b>' + csPct(supPct, 0) + '</b></div>'
      + '<div class="cs-tdk"><i class="k-spend"></i><span>Share of spend</span><b>' + csPct(pc) + '</b></div>'
    + '</div>'
    + '<div class="cs-tdfig"><div><b>' + csUsd(sp) + '</b><span>total</span></div>'
      + '<div><b>' + csUsd(Math.round(sp / (n || 1))) + '</b><span>average each</span></div></div>';
}
function csTailRead(d) {
  var m = d.meta || {}, at = csTailAt(d, CS_TAIL);
  if (m.tailHoursLo == null || !at) return '';
  return csNote('<b>Effort against value.</b> Managing this tail costs an estimated <b>' + csNum(m.tailHoursLo)
    + ' to ' + csNum(m.tailHoursHi) + ' hours</b> a year, against ' + csUsd(at.spend)
    + ' of spend. That is the case for a catalogue route rather than a sourcing event.');
}

/* ---- tier derivation, used by the platform's Supplier tiering block -------
   The seed carries a tier on each supplier record but no tiering summary, so
   the summary is grouped from those tiers rather than invented.             */
var CS_TIER_APPROACH = {
  'Strategic': 'Joint roadmap, executive sponsor and quarterly business review. Competed only at renewal, and only with a credible alternative in hand.',
  'Preferred': 'Benchmarked every cycle and competed at renewal. The default posture for anything not genuinely unique.',
  'Under Review': 'Scope and value under active challenge. Renew, reduce or replace within this planning cycle.',
  'Transactional': 'Catalogue or standing order. No sourcing event unless the spend crosses the threshold.'
};
/* The platform renders tiering as prose seqlines, not a table. */
function csTieringLines(d) {
  var t = d.supplierTiering || csDeriveTiers(d);
  if (!t.length) return csGap('Supplier tiering.', 'supplierTiering[] or a tier per supplier');
  return '<div class="cs-prose">' + t.map(function (x) {
    return '<div class="cs-seqline"><strong>' + csEsc(x.label) + ' (tier ' + csEsc(x.tier) + '):</strong> '
      + csNum(x.supplierCount) + ' suppliers, ' + csPct(x.spendShare) + ' of spend. ' + csEsc(x.approach) + '</div>';
  }).join('') + '</div>';
}

function csDeriveTiers(d) {
  var sup = d.suppliers || [];
  if (!sup.length) return [];
  var order = ['Strategic', 'Preferred', 'Under Review', 'Transactional'];
  var groups = {};
  sup.forEach(function (s) { var k = s.tier || 'Untiered'; (groups[k] = groups[k] || []).push(s); });
  var out = Object.keys(groups).sort(function (a, b) {
    var ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  }).map(function (k, i) {
    var g = groups[k];
    return { label: k, tier: i + 1, supplierCount: g.length,
             spendShare: g.reduce(function (a, s) { return a + (s.share || 0); }, 0),
             approach: CS_TIER_APPROACH[k] || 'No posture recorded for this tier.' };
  });
  var named = sup.reduce(function (a, s) { return a + (s.share || 0); }, 0);
  var tailN = (d.meta || {}).vendors ? d.meta.vendors - sup.length : 0;
  if (tailN > 0) out.push({ label: 'Transactional tail', tier: out.length + 1, supplierCount: tailN,
                            spendShare: 100 - named, approach: CS_TIER_APPROACH.Transactional });
  return out;
}

/* ---- Subcategories: fragmentation as spend against vendor count ----------- */
function csFragMap(d) {
  var sc = (d.subcats || []).slice();
  if (!sc.length) return csGap('Subcategory breakdown.', 'subcats[]');
  var hasVc = sc.some(function (x) { return x.vc != null; });
  if (!hasVc) {
    var mx = sc.reduce(function (a, x) { return Math.max(a, x.tot || 0); }, 0) || 1;
    return '<div class="cs-frag">' + sc.sort(function (a, b) { return (b.tot || 0) - (a.tot || 0); }).map(function (x) {
        return '<div class="cs-frag-row"><span class="cs-frag-n">' + csEsc(x.n) + '</span>'
          + csBar((x.tot / mx) * 100, 'plum') + '<span class="cs-frag-v">' + csUsd(x.tot) + '</span></div>';
      }).join('') + '</div>'
      + csNote('Plotted on spend only. Separating a <b>consolidated</b> subcategory from a <b>fragmented</b> one needs a '
        + 'vendor count per subcategory, which this data set does not carry.');
  }
  var W = 660, H = 360, PADL = 74, PADB = 54, PADT = 26, PADR = 26;
  var pw = W - PADL - PADR, ph = H - PADT - PADB;
  var maxV = sc.reduce(function (a, x) { return Math.max(a, x.vc || 0); }, 0) || 1;
  var maxS = sc.reduce(function (a, x) { return Math.max(a, x.tot || 0); }, 0) || 1;
  var medV = maxV / 2, medS = maxS / 2;
  var xm = PADL + (medV / maxV) * pw, ym = PADT + ph - (medS / maxS) * ph;

  /* The dots are the picker: clicking one drives the detail pane beside the map. */
  var dots = sc.map(function (x, i) {
    var cx = PADL + ((x.vc || 0) / maxV) * pw;
    var cy = PADT + ph - ((x.tot || 0) / maxS) * ph;
    var frag = (x.vc || 0) > medV, on = (i === CS_SC_SEL);
    return '<g class="cs-fdg' + (on ? ' on' : '') + '" onclick="csScPick(' + i + ')" role="button" tabindex="0">'
      + '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (on ? 11 : 8) + '" class="'
      + (frag ? 'cs-fd-hot' : 'cs-fd') + '"><title>' + csEsc(x.n + ' · ' + csNum(x.vc) + ' vendors · '
      + csUsd(x.tot) + ' · ' + csUsd(Math.round(x.tot / (x.vc || 1))) + ' average each') + '</title></circle>'
      + (on ? '<text x="' + (cx < PADL + pw * 0.62 ? cx + 15 : cx - 15).toFixed(1) + '" y="'
              + (cy + 4).toFixed(1) + '" class="cs-fdlab"'
              + (cx < PADL + pw * 0.62 ? '' : ' text-anchor="end"') + '>'
              + csEsc(String(x.n).slice(0, 26)) + '</text>' : '')
      + '</g>';
  }).join('');

  return '<div class="cs-pwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="cs-fragsvg" role="img" '
    + 'aria-label="Subcategory spend against vendor count">'
    + '<line x1="' + xm.toFixed(1) + '" y1="' + PADT + '" x2="' + xm.toFixed(1) + '" y2="' + (PADT + ph) + '" class="cs-p80h"/>'
    + '<line x1="' + PADL + '" y1="' + ym.toFixed(1) + '" x2="' + (W - PADR) + '" y2="' + ym.toFixed(1) + '" class="cs-p80h"/>'
    + '<text x="' + (W - PADR - 2) + '" y="' + (PADT - 9) + '" class="cs-quadl">big and fragmented · consolidate here</text>'
    + '<line x1="' + PADL + '" y1="' + (PADT + ph) + '" x2="' + (W - PADR) + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + '<line x1="' + PADL + '" y1="' + PADT + '" x2="' + PADL + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + [0, 0.5, 1].map(function (t) {
        return '<text x="' + (PADL - 8) + '" y="' + (PADT + ph - t * ph + 4).toFixed(1) + '" class="cs-pyl">'
          + csUsd(maxS * t) + '</text>';
      }).join('')
    + [0, 0.5, 1].map(function (t) {
        return '<text x="' + (PADL + t * pw).toFixed(1) + '" y="' + (PADT + ph + 32) + '" class="cs-pyr" text-anchor="middle">'
          + csNum(Math.round(maxV * t)) + '</text>';
      }).join('')
    + '<text x="' + (PADL + pw / 2) + '" y="' + (H - 6) + '" class="cs-axt">vendors in the subcategory &rarr;</text>'
    + '<text x="14" y="' + (PADT + ph / 2) + '" class="cs-axt" transform="rotate(-90 14,' + (PADT + ph / 2) + ')">spend &rarr;</text>'
    + dots + '</svg></div>'
    + csNote('Top right is where consolidation pays: real money spread across many suppliers. Bottom left is noise, '
      + 'and chasing it costs more than it returns.');
}

/* ---- Kraljic as a positioned grid, not a paragraph ------------------------ */
function csKraljicGrid(d) {
  var n = d.narr || {};
  if (!n.kraljicPos) return csGap('Kraljic position and its procurement implication.', 'narr.kraljicPos');
  var pos = String(n.kraljicPos).toUpperCase();
  var CELLS = [
    { k: 'LEVERAGE',   l: 'Leverage',   x: 0, y: 0, d: 'High spend, many sources. Compete it.' },
    { k: 'STRATEGIC',  l: 'Strategic',  x: 1, y: 0, d: 'High spend, few sources. Partner and protect.' },
    { k: 'ROUTINE',    l: 'Routine',    x: 0, y: 1, d: 'Low spend, many sources. Automate it.' },
    { k: 'BOTTLENECK', l: 'Bottleneck', x: 1, y: 1, d: 'Low spend, few sources. Secure supply.' }
  ];
  var grid = '<div class="cs-kgrid">' + CELLS.map(function (c) {
    return '<div class="cs-kcell' + (pos.indexOf(c.k) >= 0 ? ' on' : '') + '">'
      + '<div class="cs-kcell-l">' + csEsc(c.l) + '</div>'
      + '<div class="cs-kcell-d">' + csEsc(c.d) + '</div></div>';
  }).join('') + '</div>'
    + '<div class="cs-kaxis"><span>&larr; supply risk &rarr;</span><span>&larr; profit impact &rarr;</span></div>';
  return grid
    + (n.kraljicHigh ? csNarr(n.kraljicHigh) : '')
    + (n.kraljicImpl ? '<div class="cs-implic"><span class="cs-lab2">What that means for how we buy</span>'
        + csNarr(n.kraljicImpl) + '</div>' : '');
}

/* ---- Porter: scored, with a net-leverage verdict -------------------------- */
var CS_FORCE_SCORE = { 'low': 1, 'low-medium': 1.5, 'medium-low': 1.5, 'medium': 2, 'medium-high': 2.5, 'high-medium': 2.5, 'high': 3, 'very high': 3.5 };
function csForceVal(s) {
  var k = String(s || '').toLowerCase().trim();
  return CS_FORCE_SCORE[k] != null ? CS_FORCE_SCORE[k] : 2;
}
function csForceVerdict(d) {
  var f = d.forces || [];
  /* Supplier power and rivalry pull in opposite directions for a buyer: strong
     rivalry among suppliers is leverage FOR us, strong supplier power is against. */
  var sup = f.filter(function (x) { return /supplier power/i.test(x.f); }).map(function (x) { return csForceVal(x.s); })[0] || 2;
  var riv = f.filter(function (x) { return /rivalry/i.test(x.f); }).map(function (x) { return csForceVal(x.s); })[0] || 2;
  var sub = f.filter(function (x) { return /substitut/i.test(x.f); }).map(function (x) { return csForceVal(x.s); })[0] || 2;
  var ent = f.filter(function (x) { return /entrant|new/i.test(x.f); }).map(function (x) { return csForceVal(x.s); })[0] || 2;
  var net = ((riv + sub + ent) / 3) - sup;   // positive = buyer has room
  var verdict = net >= 0.5 ? 'Buyer has room' : net <= -0.5 ? 'Supplier holds the cards' : 'Balanced, contested';
  var tone = net >= 0.5 ? 'teal' : net <= -0.5 ? 'burnt' : 'plum';
  var pct = Math.max(0, Math.min(100, ((net + 2) / 4) * 100));
  var read = net >= 0.5
    ? 'Alternatives exist and suppliers compete for the work. Leverage comes from running a real competition, not from posturing.'
    : net <= -0.5
      ? 'Few credible alternatives and concentrated supplier power. Leverage has to be manufactured: bundle scope, lengthen term, or build a switching threat before the renewal window opens.'
      : 'Neither side is dominant. Outcomes turn on preparation and timing rather than on structural advantage.';
  return '<div class="cs-verdict cs-verdict-' + tone + '">'
    + '<div class="cs-verdict-v">' + csEsc(verdict) + '</div>'
    + '<div class="cs-leverbar"><i style="left:' + pct.toFixed(1) + '%"></i>'
      + '<span class="cs-lb-l">supplier holds the cards</span><span class="cs-lb-r">buyer has room</span></div>'
    + '<div class="cs-verdict-d">' + csEsc(read) + '</div></div>';
}
function csForceChart(d) {
  var f = (d.forces || []).slice().sort(function (a, b) { return csForceVal(b.s) - csForceVal(a.s); });
  return '<div class="cs-forces">' + f.map(function (x) {
    var v = csForceVal(x.s), pct = (v / 3.5) * 100;
    var tone = v >= 2.75 ? 'emph' : v <= 1.75 ? 'teal' : 'plum';
    return '<div class="cs-force">'
      + '<div class="cs-force-h"><span class="cs-force-f">' + csEsc(x.f) + '</span>'
      + csBar(pct, tone)
      + '<span class="cs-pill cs-pill-' + (tone === 'emph' ? 'burnt' : tone) + '">' + csEsc(x.s) + '</span></div>'
      + (x.d ? '<div class="cs-force-d">' + csEsc(x.d) + '</div>' : '') + '</div>';
  }).join('') + '</div>';
}

/* ---- Market intelligence, externally sourced ------------------------------ */
function csMarketIntel(mk) {
  var head = (mk.headlines || []).map(function (x) {
    return '<div class="cs-mi"><div class="cs-mi-k">' + csEsc(x.k) + '</div>'
      + '<div class="cs-mi-t">' + csEsc(x.t) + '</div>'
      + '<div class="cs-mi-d">' + csEsc(x.d) + '</div>'
      + '<div class="cs-mi-s">' + (x.src || []).map(function (s) {
          return '<a class="cs-cite" href="' + csEsc(s.u) + '" target="_blank" rel="noopener">' + csEsc(s.n) + '</a>';
        }).join('') + '</div></div>';
  }).join('');
  var impl = (mk.implications || []).length
    ? '<div class="cs-read"><div class="cs-read-t">What it means for this category</div><ul class="cs-ul">'
      + mk.implications.map(function (s) { return '<li>' + csEsc(s) + '</li>'; }).join('') + '</ul></div>' : '';
  return '<div class="cs-mis">' + head + '</div>' + impl
    + csNote('Externally sourced and dated. Every claim links to its source; nothing here is derived from Lilly spend data.');
}

/* ---- Risk heat map -------------------------------------------------------- */
var CS_LI = { 'low': 1, 'low-medium': 1.5, 'medium-low': 1.5, 'medium': 2, 'medium-high': 2.5, 'high-medium': 2.5, 'high': 3, 'very high': 3.5 };
function csLI(v) { var k = String(v || '').toLowerCase().trim(); return CS_LI[k] != null ? CS_LI[k] : 2; }
function csRiskMatrix(d, rows) {
  var r = rows || d.risks || [];
  if (!r.length) return csGap('Category risk register.', 'risks[]');
  var W = 620, H = 380, PAD = 56;
  var pw = W - PAD * 2, ph = H - PAD * 2;
  var dots = r.map(function (x, i) {
    var cx = PAD + ((csLI(x.l) - 0.5) / 3.2) * pw;
    var cy = PAD + ph - ((csLI(x.i) - 0.5) / 3.2) * ph;
    var hot = csLI(x.l) >= 2.5 && csLI(x.i) >= 2.5;
    return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="13" class="' + (hot ? 'cs-rk-hot' : 'cs-rk') + '">'
      + '<title>' + csEsc(x.risk + ' · likelihood ' + x.l + ' · impact ' + x.i) + '</title></circle>'
      + '<text x="' + cx.toFixed(1) + '" y="' + (cy + 4).toFixed(1) + '" class="cs-rknum">' + (i + 1) + '</text>';
  }).join('');
  var legend = '<ol class="cs-rkleg">' + r.map(function (x) {
    var hot = csLI(x.l) >= 2.5 && csLI(x.i) >= 2.5;
    return '<li' + (hot ? ' class="hot"' : '') + '>' + csEsc(x.risk) + '</li>';
  }).join('') + '</ol>';
  return '<div class="cs-rkwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="cs-rksvg" role="img" aria-label="Risk likelihood against impact">'
    + '<rect x="' + (PAD + pw / 2) + '" y="' + PAD + '" width="' + pw / 2 + '" height="' + ph / 2 + '" class="cs-rkzone"/>'
    + '<line x1="' + PAD + '" y1="' + (PAD + ph) + '" x2="' + (W - PAD) + '" y2="' + (PAD + ph) + '" class="cs-pax"/>'
    + '<line x1="' + PAD + '" y1="' + PAD + '" x2="' + PAD + '" y2="' + (PAD + ph) + '" class="cs-pax"/>'
    + '<text x="' + (PAD + pw / 2) + '" y="' + (H - 16) + '" class="cs-axt">likelihood &rarr;</text>'
    + '<text x="16" y="' + (PAD + ph / 2) + '" class="cs-axt" transform="rotate(-90 16,' + (PAD + ph / 2) + ')">impact &rarr;</text>'
    + '<text x="' + (W - PAD - 4) + '" y="' + (PAD + 16) + '" class="cs-quadl">act now</text>'
    + dots + '</svg>' + legend + '</div>';
}

/* ---- Savings: a waterfall instead of a third table ------------------------ */
function csSavingsWaterfall(d) {
  var sv = d.savings || [];
  if (!sv.length) return csGap('Savings levers.', 'savings[]');
  var lo = sv.reduce(function (a, s) { return a + (s.lo || 0); }, 0);
  var hi = sv.reduce(function (a, s) { return a + (s.hi || 0); }, 0);
  var ben = d.benefits || [];
  var val = ben.filter(function (b) { return b.state === 'validated'; }).reduce(function (a, b) { return a + (b.amt || 0); }, 0);
  var app = ben.filter(function (b) { return b.state === 'approved'; }).reduce(function (a, b) { return a + (b.amt || 0); }, 0);
  var stages = [
    { l: 'Identified', v: hi, sub: 'modelled high', tone: 'plum' },
    { l: 'Defensible', v: lo, sub: 'modelled low', tone: 'plum' },
    { l: 'Validated', v: ben.length ? val : null, sub: ben.length ? 'finance-confirmed' : 'no validation state held', tone: 'teal' },
    { l: 'Approved', v: ben.length ? val + app : null, sub: ben.length ? 'in the plan' : 'no approved target held', tone: 'teal' }
  ];
  var max = hi || 1;
  return '<div class="cs-wf">' + stages.map(function (s) {
    return '<div class="cs-wf-row"><span class="cs-wf-l">' + csEsc(s.l) + '</span>'
      + '<span class="cs-wf-bar">' + (s.v == null ? '<i class="cs-wf-none"></i>'
        : '<i class="cs-wf-' + s.tone + '" style="width:' + ((s.v / max) * 100).toFixed(1) + '%"></i>') + '</span>'
      + '<span class="cs-wf-v">' + (s.v == null ? '--' : csUsd(s.v)) + '</span>'
      + '<span class="cs-wf-s">' + csEsc(s.sub) + '</span></div>';
  }).join('') + '</div>'
    + csNote('Validated, approved and realised stay blank rather than repeating the modelled figure. Blurring an '
      + 'estimate into a target is how savings numbers stop being believed.');
}

/* ---- Scorecard: status per measure, not a wall of cells ------------------- */
function csScorecard(d) {
  var k = d.kpis || [];
  if (!k.length) return csGap('The category scorecard.', 'kpis[]');
  var tr = d.kpiTrend || {};
  return '<div class="cs-scards">' + k.map(function (x) {
    var need = x.needs || x.cur == null || x.cur === 'NEEDS_INPUT';
    var series = tr[x.kpi];
    var spark = '';
    if (series && series.length > 1) {
      var mx = Math.max.apply(null, series), mn = Math.min.apply(null, series), rg = (mx - mn) || 1;
      spark = '<svg class="cs-spark" viewBox="0 0 100 24" preserveAspectRatio="none"><polyline points="'
        + series.map(function (v, i) {
            return ((i / (series.length - 1)) * 100).toFixed(1) + ',' + (22 - ((v - mn) / rg) * 20).toFixed(1);
          }).join(' ') + '"/></svg>';
    }
    return '<div class="cs-scard' + (need ? ' is-need' : '') + '">'
      + '<div class="cs-scard-k">' + csEsc(x.kpi)
        + (/hhi/i.test(x.kpi || '') ? csHelp(CS_HHI_HELP) : '') + '</div>'
      + '<div class="cs-scard-r"><span class="cs-scard-c">' + csEsc(need ? 'not measured' : x.cur) + '</span>'
      + '<span class="cs-scard-a">&rarr;</span><span class="cs-scard-t">' + csEsc(x.tgt || '--') + '</span></div>'
      + spark
      + '<div class="cs-scard-n">' + csEsc(x.note || '') + '</div>'
      + '<div class="cs-scard-f">' + csEsc(x.cadence || '') + '</div></div>';
  }).join('') + '</div>';
}

/* ---- Tail & contract opportunities ---------------------------------------- */
function csTailOpps(t) {
  return '<div class="cs-opps">' + t.map(function (x) {
    return '<div class="cs-opp">'
      + '<div class="cs-opp-h"><span class="cs-opp-n">' + csEsc(x.group) + '</span>'
      + '<span class="cs-pill cs-pill-plum">' + csEsc(x.effort) + ' effort</span>'
      + '<span class="cs-opp-v">' + csUsd(x.saving) + '</span></div>'
      + '<div class="cs-opp-v2">' + csNum((x.vendors || []).length) + ' suppliers · ' + csUsd(x.combined) + ' combined</div>'
      + '<div class="cs-opp-s">' + (x.vendors || []).map(function (v) {
          return '<span class="cs-chip">' + csEsc(v) + '</span>'; }).join('') + '</div>'
      + '<div class="cs-opp-r"><b>Do this.</b> ' + csEsc(x.action) + '</div></div>';
  }).join('') + '</div>';
}
function csContractOpps(c) {
  var rows = c.map(function (x) {
    var urgent = x.days != null && x.days <= 90;
    return '<tr' + (urgent ? ' class="cs-st-critical"' : '') + '>'
      + '<td class="cs-l"><b>' + csEsc(x.n) + '</b><span class="cs-sub2">' + csEsc(x.kind) + '</span></td>'
      + '<td class="cs-num">' + (x.days != null ? csNum(x.days) + ' days' : '--') + '</td>'
      + '<td class="cs-num">' + csUsd(x.atRisk) + '</td>'
      + '<td class="cs-why">' + csEsc(x.action) + '</td></tr>';
  });
  return csTable(['Agreement', 'Window', 'At risk', 'Action'], rows)
    + csNote('Window is time to the notice deadline, not to expiry. Past the notice date the decision is made for us.');
}

/* ===========================================================================
   SUPPLIERS: searchable list, click a name for the deep dive
   =========================================================================== */
var CS_SUP_Q = '';        // search text
var CS_SUP_TIER = '';     // tier filter
var CS_SUP_SORT = 'tot';  // tot | n | share | yoy
var CS_SUP_DIR = -1;      // 1 asc, -1 desc
var CS_SUP_SEL = null;    // supplier name, or null when the panel is closed

function csSupQ(v) { CS_KEEPSCROLL = true; CS_SUP_Q = v; csRender(); }
function csSupTier(v) { CS_KEEPSCROLL = true; CS_SUP_TIER = v; csRender(); }
function csSupSort(k) { CS_KEEPSCROLL = true;
  if (CS_SUP_SORT === k) CS_SUP_DIR = -CS_SUP_DIR; else { CS_SUP_SORT = k; CS_SUP_DIR = -1; }
  csRender();
}
function csSupPick(n) { CS_KEEPSCROLL = true; CS_SUP_SEL = (CS_SUP_SEL === n) ? null : n; csRender(); }

function csSupRows(d) {
  var q = CS_SUP_Q.toLowerCase().trim();
  var out = (d.suppliers || []).filter(function (s) {
    if (CS_SUP_TIER && (s.tier || '') !== CS_SUP_TIER) return false;
    if (!q) return true;
    return String(s.n).toLowerCase().indexOf(q) >= 0 || String(s.tier || '').toLowerCase().indexOf(q) >= 0;
  });
  var k = CS_SUP_SORT, dir = CS_SUP_DIR;
  return out.sort(function (a, b) {
    if (k === 'n') return String(a.n).localeCompare(String(b.n)) * -dir;
    return (((a[k] || 0) - (b[k] || 0)) * dir);
  });
}
function csSupTable(d) {
  var rows = csSupRows(d), all = (d.suppliers || []).length;
  var tiers = {};
  (d.suppliers || []).forEach(function (s) { if (s.tier) tiers[s.tier] = 1; });
  var th = function (k, label, cls) {
    return '<th' + (cls ? ' class="' + cls + '"' : '') + '><button class="cs-sortb'
      + (CS_SUP_SORT === k ? ' on' : '') + '" onclick="csSupSort(\'' + k + '\')">' + csEsc(label)
      + '<i>' + (CS_SUP_SORT === k ? (CS_SUP_DIR < 0 ? '&#9660;' : '&#9650;') : '') + '</i></button></th>';
  };
  var controls = '<div class="cs-supctl">'
    + '<input id="cs-supq" class="cs-search" type="search" placeholder="Search suppliers" value="'
      + csEsc(CS_SUP_Q) + '" oninput="csSupQ(this.value)" aria-label="Search suppliers">'
    + '<select class="cs-filter" onchange="csSupTier(this.value)" aria-label="Filter by tier">'
      + '<option value="">All tiers</option>'
      + Object.keys(tiers).map(function (t) {
          return '<option value="' + csEsc(t) + '"' + (CS_SUP_TIER === t ? ' selected' : '') + '>' + csEsc(t) + '</option>';
        }).join('')
    + '</select>'
    + '<span class="cs-supcount">' + rows.length + ' of ' + all + '</span>'
    + ((CS_SUP_Q || CS_SUP_TIER) ? '<button class="cs-clearb" onclick="csSupQ(\'\');">Clear</button>' : '')
    + '</div>';

  if (!rows.length) return controls + '<div class="cs-empty">No supplier matches that filter.</div>';

  var body = rows.map(function (s) {
    var on = CS_SUP_SEL === s.n;
    return '<tr class="' + (on ? 'is-open' : '') + '">'
      + '<td class="cs-num">' + csNum(s.r || '') + '</td>'
      + '<td class="cs-l"><button class="cs-suplink" onclick="csSupPick(\''
        + csEsc(String(s.n).replace(/'/g, "\\'")) + '\')">' + csEsc(s.n) + '</button></td>'
      + '<td class="cs-num">' + csUsd(s.tot) + '</td>'
      + '<td class="cs-num">' + csPct(s.share) + '</td>'
      + '<td class="cs-num">' + csUsd(s.s3) + '</td>'
      + '<td class="cs-num">' + csUsd(s.s4) + '</td>'
      + '<td class="cs-num">' + csUsd(s.s5) + '</td>'
      + '<td class="cs-num">' + (s.yoy != null ? '<span class="' + (s.yoy >= 20 ? 'cs-down' : s.yoy >= 0 ? 'cs-up' : 'cs-down') + '">'
          + (s.yoy > 0 ? '+' : '') + csPct(s.yoy) + '</span>' : '--') + '</td>'
      + '<td class="cs-num"><span class="cs-tier">' + csEsc(s.tier || '--') + '</span></td></tr>';
  });
  return controls + csTable(['Rank', 'Supplier', '3-yr total', 'Share', 'FY23', 'FY24', 'FY25', 'YoY', 'Tier'], body, { cls: 'cs-suptbl' })
    .replace('<th class="cs-l">Rank</th>', th('r', 'Rank', 'cs-l'))
    .replace('<th>Supplier</th>', th('n', 'Supplier'))
    .replace('<th>3-yr total</th>', th('tot', '3-yr total'))
    .replace('<th>Share</th>', th('share', 'Share'))
    .replace('<th>YoY</th>', th('yoy', 'YoY'));
}

/* ---- deep dive ------------------------------------------------------------ */
function csSupDeep(d) {
  var s = (d.suppliers || []).filter(function (x) { return x.n === CS_SUP_SEL; })[0];
  if (!s) return '';
  var tr = csSupTrend(s);
  var hasProj = tr.series.some(function (p) { return p.kind === 'proj'; });
  var bars = csFcToggle('csSupToggleFc()', CS_SUP_FC)
    + '<div class="cs-twrap">' + csTrendSvg(tr.series, {}) + '</div>'
    + csTrendKey(CS_SUP_FC, hasProj);

  var kpis = '<div class="cs-kpirow">'
    + csKpi('3-year total', csUsd(s.tot), 'FY23 to FY25', 'plum')
    + csKpi('FY2025', csUsd(s.s5), 'most recent complete year')
    + csKpi('Share of category', csPct(s.share), 'of FY25 spend')
    + csKpi('YoY growth', (s.yoy != null ? (s.yoy > 0 ? '+' : '') + csPct(s.yoy) : '--'), 'FY24 to FY25',
        (s.yoy != null && s.yoy >= 20) ? 'emph' : 'teal')
    + '</div>';

  var body = kpis + bars
    + csNote(CS_SUP_FC
        ? '<b>Forecast basis.</b> This supplier\'s own '
          + (tr.cagr != null ? csPct(tr.cagr * 100) + ' compound growth' : 'growth')
          + ' across its completed years, carried forward three years with a &plusmn;6% a year band. '
          + 'Wider than the category band because a single relationship moves further than a portfolio does, '
          + 'and it ignores the renewal calendar entirely. The line is fitted on completed years only.'
        : 'Subcategory, business-unit and contract-coverage breakdowns would populate from source data. '
          + 'Rate-versus-volume decomposition would show whether the YoY change is price or consumption.');

  return csCard('Deep dive: ' + csEsc(s.n), body,
      { sub: 'click the name again to close', conf: csConfFor(d, 'suppliers') })
    + csCard('Renewal Decision Matrix', csRenewalMatrix(d, s),
      { icon: 'target', sub: 'performance against market attractiveness',
        conf: (d.renewalMatrix ? 'Moderate' : 'Limited') });
}

/* Performance and market attractiveness are judgements, not spend facts. Where
   the data set does not carry them the panel says so rather than plotting a
   position it made up. */
/* Two-line quadrant labels. One line ran off both edges of the plot. */
function csQuadLabel(x, y, anchor, lines) {
  return '<text x="' + x + '" y="' + y + '" class="cs-quadl" text-anchor="' + anchor + '">'
    + lines.map(function (t, i) {
        return '<tspan x="' + x + '" dy="' + (i ? '1.15em' : '0') + '">' + csEsc(t) + '</tspan>';
      }).join('') + '</text>';
}
function csRenewalMatrix(d, sel) {
  var rm = d.renewalMatrix;
  if (!rm) return csGap('Where each supplier sits on performance against market attractiveness, and what that implies at renewal.',
      'a performance score and a market-attractiveness score per supplier');
  var pts = (d.suppliers || []).map(function (s) { return { s: s, m: rm[s.n] }; })
    .filter(function (p) { return p.m; });
  if (!pts.length) return csGap('Renewal position for this supplier.', 'renewalMatrix entry for ' + sel.n);

  var W = 620, H = 400, PADL = 84, PADR = 22, PADT = 46, PADB = 58;
  var pw = W - PADL - PADR, ph = H - PADT - PADB;
  var mxs = pts.reduce(function (a, p) { return Math.max(a, p.s.tot || 0); }, 0) || 1;
  var dots = pts.map(function (p) {
    var cx = PADL + (p.m.perf / 5) * pw;
    var cy = PADT + ph - (p.m.attr / 5) * ph;
    var r = 6 + 12 * Math.sqrt((p.s.tot || 0) / mxs);
    var on = p.s.n === sel.n;
    return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1)
      + '" class="' + (on ? 'cs-rm-on' : 'cs-rm') + '"><title>'
      + csEsc(p.s.n + ' · performance ' + p.m.perf + '/5 · market attractiveness ' + p.m.attr + '/5 · ' + csUsd(p.s.tot))
      + '</title></circle>';
  }).join('');

  var me = rm[sel.n];
  var quad = me ? (me.perf >= 2.5
      ? (me.attr >= 2.5 ? 'Renew and Expand' : 'Renew, Protect Terms')
      : (me.attr >= 2.5 ? 'Replace or Compete' : 'Exit or Remediate')) : null;

  var read = me
    ? '<div class="cs-rmread"><div class="cs-lab2">Quadrant</div>'
      + '<div class="cs-rmq">' + csEsc(quad) + '</div>'
      + '<div class="cs-rmd">' + csEsc(me.read || '') + '</div>'
      + (me.blocked ? '<div class="cs-rmblock">' + csEsc(me.blocked) + '</div>' : '') + '</div>'
    : '<div class="cs-rmread">' + csGap('Renewal position for this supplier.', 'renewalMatrix entry for ' + sel.n) + '</div>';

  return '<div class="cs-rmwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" '
    + 'aria-label="Performance against market attractiveness" class="cs-rmsvg">'
    + '<line x1="' + (PADL + pw / 2) + '" y1="' + PADT + '" x2="' + (PADL + pw / 2) + '" y2="' + (PADT + ph) + '" class="cs-p80h"/>'
    + '<line x1="' + PADL + '" y1="' + (PADT + ph / 2) + '" x2="' + (W - PADR) + '" y2="' + (PADT + ph / 2) + '" class="cs-p80h"/>'
    + csQuadLabel(PADL + 6, PADT - 20, 'start', ['Replace', 'or Compete'])
    + csQuadLabel(W - PADR - 2, PADT - 20, 'end', ['Renew', 'and Expand'])
    + csQuadLabel(PADL + 6, PADT + ph + 14, 'start', ['Exit', 'or Remediate'])
    + csQuadLabel(W - PADR - 2, PADT + ph + 14, 'end', ['Renew,', 'Protect Terms'])
    + '<line x1="' + PADL + '" y1="' + (PADT + ph) + '" x2="' + (W - PADR) + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + '<line x1="' + PADL + '" y1="' + PADT + '" x2="' + PADL + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + [1, 2, 3, 4, 5].map(function (t) {
        return '<text x="' + (PADL + (t / 5) * pw).toFixed(1) + '" y="' + (PADT + ph + 30) + '" class="cs-pyr" text-anchor="middle">' + t + '</text>';
      }).join('')
    + [1, 3, 5].map(function (t) {
        return '<text x="' + (PADL - 8) + '" y="' + (PADT + ph - (t / 5) * ph + 3).toFixed(1) + '" class="cs-pyl">' + t + '</text>';
      }).join('')
    + '<text x="' + (PADL + pw / 2) + '" y="' + (H - 6) + '" class="cs-axt">Performance (1 to 5)</text>'
    + '<text x="14" y="' + (PADT + ph / 2) + '" class="cs-axt" transform="rotate(-90 14,' + (PADT + ph / 2) + ')">Market attractiveness</text>'
    + dots + '</svg>' + read + '</div>';
}

/* ===========================================================================
   SUBCATEGORIES: map left, analysis right, opportunities named
   =========================================================================== */
var CS_SC_SEL = 0;
function csScPick(i) {
  CS_KEEPSCROLL = true; CS_SC_SEL = i; csRender();
  /* The detail pane sits above the table, so a click from a row further down
     changed something the reader could not see. Bring it into view. */
  var pane = document.querySelector('.cs-scpane');
  if (pane && pane.scrollIntoView) pane.scrollIntoView({ block: 'nearest' });
}

function csSubcatPane(d) {
  var sc = d.subcats || [];
  if (!sc.length) return csGap('Subcategory breakdown.', 'subcats[]');
  var x = sc[Math.min(CS_SC_SEL, sc.length - 1)];
  var per = x.vc ? Math.round((x.tot || 0) / x.vc) : null;

  var head = '<div class="cs-scname">' + csEsc(x.n) + '</div>'
    + '<div class="cs-scmeta">' + csEsc(x.host || '') + '</div>'
    + '<div class="cs-scfig">'
      + '<div><b>' + csUsd(x.tot) + '</b><span>spend</span></div>'
      + '<div><b>' + csPct(x.pct) + '</b><span>of category</span></div>'
      + (x.vc != null ? '<div><b>' + csNum(x.vc) + '</b><span>vendors</span></div>' : '')
      + (per != null ? '<div><b>' + csUsd(per) + '</b><span>average each</span></div>' : '')
    + '</div>';

  var opps = (x.opps || []).map(function (o) {
    return '<div class="cs-scopp cs-scopp-' + csEsc(o.kind || 'supplier') + '">'
      + '<div class="cs-scopp-h"><span class="cs-scopp-k">'
        + csEsc(o.kind === 'volume' ? 'Volume consolidation' : 'Supplier reduction') + '</span>'
        + '<span class="cs-scopp-v">' + (o.value != null ? csUsd(o.value) : 'not sized') + '</span></div>'
      + '<div class="cs-scopp-t">' + csEsc(o.t) + '</div>'
      + '<div class="cs-scopp-d">' + csEsc(o.d) + '</div>'
      + (o.from ? '<div class="cs-scopp-f"><b>' + csNum(o.from) + ' &rarr; ' + csNum(o.to) + ' suppliers</b>'
          + (o.vehicle ? ' · ' + csEsc(o.vehicle) : '') + '</div>' : '')
      + '</div>';
  }).join('');

  return head + '<div class="cs-lab2" style="margin-top:14px">Consolidation opportunities</div>'
    + (opps || csGap('Named volume-consolidation and supplier-reduction opportunities inside this subcategory.',
        'per-subcategory opportunity records (kind, what, vendors from/to, receiving vehicle, value)'));
}

function scSubcats() {
  var d = csData(), n = d.narr || {};
  var sc = d.subcats || [];
  var hasVc = sc.some(function (x) { return x.vc != null; });
  var h = '';

  h += '<div class="cs-screl">'
    + csCard('Fragmentation Map', csFragMap(d),
        { icon: 'grid', role: 'solid', sub: hasVc ? 'spend against vendor count' : 'spend by subcategory', conf: csConfFor(d, 'subcats') })
    + csCard('Subcategory Detail', csSubcatPane(d),
        { icon: 'target', cls: 'cs-scpane', sub: 'click a subcategory', conf: csConfFor(d, 'subcats') })
    + '</div>';

  h += csCard('All Subcategories', csSubcatTable(d),
      { icon: 'list', sub: sc.length + ' subcategories', conf: hasVc ? 'Moderate' : 'Limited' })
    + csNarrNote(n.subcatLegend) + csNarrNote(n.subcatGap);
  return h;
}
function csSubcatTable(d) {
  var sc = d.subcats || [];
  var hasVc = sc.some(function (x) { return x.vc != null; });
  var scMax = sc.reduce(function (a, x) { return Math.max(a, x.tot || 0); }, 0) || 1;
  var vcMax = sc.reduce(function (a, x) { return Math.max(a, x.vc || 0); }, 0) || 1;
  var order = sc.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) {
    return hasVc ? (b.x.vc || 0) - (a.x.vc || 0) : (b.x.tot || 0) - (a.x.tot || 0);
  });
  var rows = order.map(function (o) {
    var x = o.x, nOpp = (x.opps || []).length;
    return '<tr class="' + (CS_SC_SEL === o.i ? 'is-open' : '') + '">'
      + '<td class="cs-l"><button class="cs-suplink" onclick="csScPick(' + o.i + ')">' + csEsc(x.n) + '</button>'
        + '<span class="cs-sub2">' + csEsc(x.host || '') + '</span></td>'
      + (hasVc ? '<td class="cs-barcell">' + csBar((x.vc / vcMax) * 100, 'emph') + '</td>'
                 + '<td class="cs-num">' + csNum(x.vc) + '</td>'
                 + '<td class="cs-num">' + csUsd(Math.round((x.tot || 0) / (x.vc || 1))) + '</td>' : '')
      + '<td class="cs-barcell">' + csBar((x.tot / scMax) * 100, 'plum') + '</td>'
      + '<td class="cs-num">' + csUsd(x.tot) + '</td>'
      + '<td class="cs-num">' + csPct(x.pct) + '</td>'
      + '<td class="cs-num">' + (nOpp ? '<span class="cs-oppn">' + nOpp + '</span>' : '--') + '</td></tr>';
  });
  return csTable(hasVc ? ['Subcategory', '', 'Vendors', 'Avg each', '', 'Spend', 'Share', 'Opps']
                       : ['Subcategory', '', 'Spend', 'Share', 'Opps'], rows)
    + csNote(hasVc
        ? 'Ranked by vendor count, not spend. A large subcategory bought from a handful of suppliers is not fragmented; a small one bought from a hundred is.'
        : 'Ranked by spend. A true fragmentation ranking needs a <b>vendor count per subcategory</b>, which this data set does not carry.');
}

/* ===========================================================================
   MARKET & RISK — one screen, three bands
   Replaces the Market & Kraljic / Porter / Risk Register subtabs. Kraljic and
   Porter share one segmentation toggle, and the selected segment filters the
   risk band too, so the whole screen answers for one segment at a time.
   =========================================================================== */
var CS_SEG_MODE = 'purpose';   // purpose | delivery | lineitem
var CS_SEG_SEL = null;         // segment key, or null for the whole category
var CS_SEG_SIZE = 'spend';     // spend | vendors

function csSegMode(m) { CS_KEEPSCROLL = true; CS_SEG_MODE = m; CS_SEG_SEL = null; csRender(); }
function csSegPick(k) { CS_KEEPSCROLL = true; CS_SEG_SEL = (CS_SEG_SEL === k) ? null : k; csRender(); }
function csSegSize(v) { CS_KEEPSCROLL = true; CS_SEG_SIZE = v; csRender(); }

/* Business purpose is already carried in the subcategory name; the delivery
   model is already carried in `host`. Neither needs new data. The line-item
   view does, and says so rather than inventing one. */
function csSegments(d) {
  var sc = d.subcats || [];
  if (!sc.length) return [];
  if (CS_SEG_MODE === 'lineitem') return d.lineItems || [];

  var groups = {};
  sc.forEach(function (x) {
    var key;
    if (CS_SEG_MODE === 'delivery') {
      key = /iaas/i.test(x.n) ? 'IaaS' : /paas/i.test(x.n) ? 'PaaS' : (x.host || 'Unclassified');
    } else {
      /* strip the delivery suffix: "Marketing/Sales SaaS" -> "Marketing / Sales" */
      key = String(x.n).replace(/\s*(SaaS|SW|Software)\b.*$/i, '').trim();
      if (/^IaaS$|^PaaS$/i.test(x.n)) key = 'Cloud infrastructure';
      if (/on-prem/i.test(x.n)) key = 'IT operations';
      key = key.replace(/\//g, ' / ');
    }
    var g = groups[key] || (groups[key] = { key: key, tot: 0, vc: 0, pct: 0, parts: [] });
    g.tot += x.tot || 0; g.vc += x.vc || 0; g.pct += x.pct || 0; g.parts.push(x.n);
  });
  return Object.keys(groups).map(function (k) { return groups[k]; })
    .sort(function (a, b) { return b.tot - a.tot; });
}

/* Kraljic axes, both derived from held data rather than asserted.

   Profit impact = share of category spend.

   Supply risk = average spend per vendor in the segment, log-scaled. A raw
   vendor count is the wrong proxy and produced a wrong answer: Scientific
   Research has the most vendors in the portfolio, which made it look like the
   SAFEST segment, when 142 niche scientific tools are not 142 alternatives for
   any one of them. Concentration is the honest read: where the money sits in a
   few large relationships the incumbent is hard to replace, and where it is
   spread thin across many small ones it is not. */
function csSegKraljic(segs) {
  /* Line-item segments are MARKET segments: placed by market concentration and
     the share of market value moving through that unit, not by anything in
     Lilly's ledger. This tab is about the outside world. */
  if (segs.length && segs[0].market) {
    return segs.map(function (s) {
      return { seg: s, x: s.concentration, y: s.impact, perVendor: null };
    });
  }
  var maxPct = segs.reduce(function (a, s) { return Math.max(a, s.pct || 0); }, 0) || 1;
  var per = segs.map(function (s) { return s.vc ? (s.tot || 0) / s.vc : 0; });
  var loP = Math.min.apply(null, per.filter(function (v) { return v > 0; }).concat([1e9]));
  var hiP = Math.max.apply(null, per.concat([1]));
  var span = Math.log(hiP / (loP || 1)) || 1;
  return segs.map(function (s, i) {
    var risk = per[i] > 0 ? Math.max(0, Math.min(1, Math.log(per[i] / loP) / span)) : 0.5;
    return { seg: s, x: risk, y: Math.min(1, (s.pct || 0) / maxPct), perVendor: per[i] };
  });
}
function csKraljicQuad(p) {
  return p.y >= 0.5
    ? (p.x >= 0.5 ? 'Strategic' : 'Leverage')
    : (p.x >= 0.5 ? 'Bottleneck' : 'Routine');
}

function csSegToggle(d) {
  var modes = [['purpose', 'Business purpose'], ['delivery', 'Delivery model'], ['lineitem', 'Line item']];
  var has = { purpose: true, delivery: true, lineitem: !!(d.lineItems && d.lineItems.length) };
  return '<div class="cs-segrow">'
    + '<div class="cs-seg2">' + modes.map(function (m) {
        var on = CS_SEG_MODE === m[0], gap = !has[m[0]];
        return '<button class="' + (on ? 'on' : '') + (gap ? ' gap' : '') + '" onclick="csSegMode(\'' + m[0] + '\')">'
          + csEsc(m[1]) + (gap ? ' · needs data' : (m[0] === 'lineitem' ? ' · market' : '')) + '</button>';
      }).join('') + '</div>'
    + '<div class="cs-seg2 cs-seg2-r"><span class="cs-seglab">size by</span>'
      + [['spend', 'Spend'], ['vendors', 'Vendors']].map(function (v) {
          return '<button class="' + (CS_SEG_SIZE === v[0] ? 'on' : '') + '" onclick="csSegSize(\'' + v[0] + '\')">'
            + v[1] + '</button>';
        }).join('') + '</div>'
    + '</div>';
}

function csKraljicPlot(d) {
  var segs = csSegments(d);
  if (!segs.length) {
    return csSegToggle(d) + csGap('Where each part of the category sits on supply risk against profit impact.',
      CS_SEG_MODE === 'lineitem'
        ? 'a unit type and unit count per invoice or rate-card line'
        : 'subcats[] with a vendor count');
  }
  var pts = csSegKraljic(segs);
  var W = 620, H = 340, PADL = 62, PADR = 26, PADT = 26, PADB = 48;
  var pw = W - PADL - PADR, ph = H - PADT - PADB;
  var maxSize = segs.reduce(function (a, s) {
    return Math.max(a, CS_SEG_SIZE === 'vendors' ? (s.vc || 0) : (s.tot || 0));
  }, 0) || 1;

  var avgX = pts.reduce(function (a, p) { return a + p.x; }, 0) / pts.length;
  var avgY = pts.reduce(function (a, p) { return a + p.y; }, 0) / pts.length;

  var dots = pts.map(function (p) {
    var s = p.seg;
    var v = s.market ? (CS_SEG_SIZE === 'vendors' ? (1 - s.buyerPower) : s.impact)
                     : (CS_SEG_SIZE === 'vendors' ? (s.vc || 0) : (s.tot || 0));
    var r = 9 + 17 * Math.sqrt(Math.max(0, v) / (s.market ? 1 : maxSize));
    var cx = PADL + p.x * pw, cy = PADT + ph - p.y * ph;
    var q = csKraljicQuad(p);
    var tone = q === 'Strategic' ? 'var(--emph)' : q === 'Leverage' ? 'var(--plum)'
             : q === 'Bottleneck' ? 'var(--emph-tx)' : 'var(--teal)';
    var on = CS_SEG_SEL === s.key, dim = CS_SEG_SEL && !on;
    return '<g class="cs-kdot' + (on ? ' on' : '') + (dim ? ' dim' : '') + '" onclick="csSegPick(\''
      + csEsc(String(s.key).replace(/'/g, "\\'")) + '\')" role="button" tabindex="0">'
      + '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1)
      + '" fill="' + tone + '"><title>' + csEsc(s.market
          ? s.key + ' · ' + q + ' · ' + s.headline
          : s.key + ' · ' + q + ' · ' + csUsd(s.tot)
            + (s.vc ? ' · ' + csNum(s.vc) + ' vendors · ' + csUsd(Math.round(p.perVendor)) + ' average each' : ''))
      + '</title></circle>'
      + '<text x="' + cx.toFixed(1) + '" y="' + (cy + r + 13).toFixed(1) + '" class="cs-kdlab">'
      + csEsc(String(s.key).slice(0, 22)) + '</text></g>';
  }).join('');

  return csSegToggle(d)
    + '<div class="cs-pwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="cs-kplot" role="img" '
      + 'aria-label="Supply risk against profit impact by segment">'
    + '<line x1="' + (PADL + pw / 2) + '" y1="' + PADT + '" x2="' + (PADL + pw / 2) + '" y2="' + (PADT + ph) + '" class="cs-p80h"/>'
    + '<line x1="' + PADL + '" y1="' + (PADT + ph / 2) + '" x2="' + (W - PADR) + '" y2="' + (PADT + ph / 2) + '" class="cs-p80h"/>'
    + csQuadLabel(PADL + 4, PADT - 10, 'start', ['Leverage', 'compete it'])
    + csQuadLabel(W - PADR - 2, PADT - 10, 'end', ['Strategic', 'partner and protect'])
    + csQuadLabel(PADL + 4, PADT + ph + 16, 'start', ['Routine', 'automate it'])
    + csQuadLabel(W - PADR - 2, PADT + ph + 16, 'end', ['Bottleneck', 'secure supply'])
    + '<circle cx="' + (PADL + avgX * pw).toFixed(1) + '" cy="' + (PADT + ph - avgY * ph).toFixed(1)
      + '" r="15" class="cs-kavg"><title>Category average</title></circle>'
    + '<line x1="' + PADL + '" y1="' + (PADT + ph) + '" x2="' + (W - PADR) + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + '<line x1="' + PADL + '" y1="' + PADT + '" x2="' + PADL + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + '<text x="' + (PADL + pw / 2) + '" y="' + (H - 6) + '" class="cs-axt">Supply risk · spend concentrated in fewer relationships to the right</text>'
    + '<text x="14" y="' + (PADT + ph / 2) + '" class="cs-axt" transform="rotate(-90 14,' + (PADT + ph / 2) + ')">Profit impact</text>'
    + dots + '</svg></div>'
    + csKraljicRead(d, pts);
}

function csKraljicRead(d, pts) {
  var n = d.narr || {};
  /* In market mode the read is about the market, not the portfolio. */
  if (CS_SEG_MODE === 'lineitem' && pts.length && pts[0].seg.market) {
    var lm = d.lineItemsMeta || {};
    var worst = pts.slice().sort(function (a, b) { return b.seg.concentration - a.seg.concentration; })[0];
    var best = pts.slice().sort(function (a, b) { return b.seg.buyerPower - a.seg.buyerPower; })[0];
    return '<div class="cs-read"><div class="cs-read-d">'
      + 'This plots the <b>market</b>, not the portfolio. '
      + (worst ? '<b>' + csEsc(worst.seg.key) + '</b> is the hardest market a software buyer faces: '
          + csEsc(String(worst.seg.headline).toLowerCase()) + '. ' : '')
      + (best ? '<b>' + csEsc(best.seg.key) + '</b> is the easiest: ' + csEsc(String(best.seg.headline).toLowerCase())
          + '. ' : '')
      + 'They sit in the same category and behave nothing alike, which is why one category-level posture '
      + 'produces the wrong play for at least two units.'
      + '</div></div>'
      + csNote(csEsc(lm.basis || ''));
  }
  var strat = pts.filter(function (p) { return csKraljicQuad(p) === 'Strategic'; });
  var names = strat.map(function (p) { return '<b>' + csEsc(p.seg.key) + '</b>'; });
  var list = names.length <= 1 ? names.join('')
    : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  var lead = strat.length
    ? 'The category average sits in <b>' + csEsc(n.kraljicPos ? String(n.kraljicPos).toLowerCase() : 'leverage')
      + '</b>, which reads as "compete it". Segmented, ' + list + ' sit in <b>Strategic</b>: they carry the '
      + 'largest share of spend AND the money is concentrated in relatively few relationships, so switching '
      + 'costs land on a small number of large contracts rather than spreading across many small ones. '
      + 'Competing the whole segment is the wrong instrument there; the lever is renewal timing and '
      + 'governance on the named few. That distinction is invisible at category level.'
    : 'Every segment sits on the same side of the supply-risk divide as the category average, so the '
      + 'category-level read holds at this grain.';
  return '<div class="cs-read"><div class="cs-read-d">' + lead + '</div></div>'
    + (n.kraljicImpl ? '<div class="cs-implic"><span class="cs-lab2">What that means for how we buy</span>'
        + csNarr(n.kraljicImpl) + '</div>' : '')
    + csNote('Profit impact is share of category spend. Supply risk is <b>average spend per vendor</b> in '
      + 'the segment, log-scaled: where the money sits in a few large relationships the incumbent is hard '
      + 'to replace, and where it is spread thin across many small ones it is not. A raw vendor count was '
      + 'the obvious proxy and it was wrong, because it made Scientific Research, which has the most '
      + 'vendors in the portfolio, look like the safest segment. Both axes are read off held data; neither '
      + 'is a judgement.');
}

/* ---- Porter, per segment, on the same toggle ---- */
function csForcesBySeg(d) {
  var segs = csSegments(d);
  var fs = (CS_SEG_MODE === 'lineitem') ? (d.lineItemForces || null) : (d.forcesBySegment || null);
  if (!fs) {
    return csGap('How the five forces differ between segments, and therefore where competing works.',
      'a five-force read per segment (forcesBySegment)');
  }
  var show = CS_SEG_SEL ? segs.filter(function (s) { return s.key === CS_SEG_SEL; })
                        : segs.slice(0, 3);
  if (!show.length) show = segs.slice(0, 3);
  var AX = ['Rivalry', 'Supplier power', 'Substitutes', 'New entrants', 'Buyer power'];

  var cards = show.map(function (s) {
    var f = fs[s.key];
    if (!f) return '<div class="cs-fcard"><div class="cs-fcard-t">' + csEsc(s.key) + '</div>'
      + csGap('Five-force read for this segment.', 'forcesBySegment["' + s.key + '"]') + '</div>';
    var R = 54, cxy = 70;
    var pt = function (i, v) {
      var a = (Math.PI * 2 * i / 5) - Math.PI / 2, r = (v / 3.5) * R;
      return (cxy + r * Math.cos(a)).toFixed(1) + ',' + (cxy + r * Math.sin(a)).toFixed(1);
    };
    var ring = AX.map(function (_, i) { return pt(i, 3.5); }).join(' ');
    var shape = AX.map(function (k, i) { return pt(i, csForceVal(f[k])); }).join(' ');
    var tone = /^high/i.test(f['Supplier power'] || '') ? 'var(--emph)' : 'var(--plum)';
    return '<div class="cs-fcard">'
      + '<svg viewBox="0 0 140 140" class="cs-radar" role="img" aria-label="' + csEsc(s.key + ' five forces') + '">'
      + '<polygon points="' + ring + '" class="cs-rring"/>'
      + '<polygon points="' + AX.map(function (_, i) { return pt(i, 1.75); }).join(' ') + '" class="cs-rring"/>'
      + '<polygon points="' + shape + '" fill="' + tone + '" fill-opacity=".22" stroke="' + tone + '" stroke-width="2"/>'
      + '</svg>'
      + '<div class="cs-fcard-t">' + csEsc(s.key) + '</div>'
      + '<div class="cs-fcard-d">' + csEsc(f.read || '') + '</div></div>';
  }).join('');

  return '<div class="cs-fcards">' + cards + '</div>'
    + csNote('Five axes clockwise from the top: rivalry, supplier power, substitutes, new entrants, '
      + 'buyer power. A larger area toward an axis means that force is stronger. One radar for the whole '
      + 'category would average a near-monopoly and a commodity market into a market that does not exist.'
      + (CS_SEG_SEL ? '' : ' Showing the three largest segments; select one to isolate it.'));
}

/* ---- risk, filtered by the selected segment ---- */
function csRisksFor(d) {
  var all = d.risks || [];
  if (!CS_SEG_SEL) return { rows: all, filtered: false };
  var hit = all.filter(function (r) {
    return (r.segments || []).indexOf(CS_SEG_SEL) >= 0;
  });
  return { rows: hit.length ? hit : all, filtered: hit.length > 0, missing: !hit.length };
}
function csSegBanner(d) {
  if (!CS_SEG_SEL) return '';
  var segs = csSegments(d);
  var s = segs.filter(function (x) { return x.key === CS_SEG_SEL; })[0];
  return '<div class="cs-segbanner">'
    + '<span class="cs-segb-k">Filtered to</span>'
    + '<span class="cs-segb-n">' + csEsc(CS_SEG_SEL) + '</span>'
    + (s ? '<span class="cs-segb-m">' + csUsd(s.tot) + (s.vc ? ' · ' + csNum(s.vc) + ' vendors' : '') + '</span>' : '')
    + '<button class="cs-segb-x" onclick="csSegPick(\'' + csEsc(String(CS_SEG_SEL).replace(/'/g, "\\'")) + '\')">'
    + 'Show whole category</button></div>';
}

/* ---- the screen ---- */
function scMarket() {
  var d = csData(), n = d.narr || {};
  var h = csSegBanner(d);

  h += csSect('Where we stand');
  h += '<div class="cs-row2">'
    + csCard('Category position', csKraljicPlot(d),
        { icon: 'balance', role: 'solid', sub: 'Kraljic · click a segment', conf: csConfFor(d, 'subcats') })
    + csCard('Supply-market forces', csForcesBySeg(d),
        { icon: 'scales', role: 'teal', sub: 'Porter · same segmentation', conf: csConfFor(d, 'forces') })
    + '</div>';

  h += csSect('What the market is doing');
  h += csCard('Market intelligence', d.market ? csMarketIntelSplit(d.market)
      : csGap('What the supply market is doing, and what it means for this category.', 'market research records with sources'),
      { icon: 'globe', sub: d.market ? (d.market.asOf || 'current') : '', conf: d.market ? 'Strong' : 'Limited' });
  h += csCard('Pricing environment', n.pricing ? csNarr(n.pricing)
      : csGap('Market pricing direction and its implication for this category.', 'narr.pricing'),
      { icon: 'money', sub: 'category read', conf: csConfFor(d, 'narr') });

  h += csSect('What would change it');
  if (n.riskTop2) h += csCard('What could change the strategy', csNarr(n.riskTop2),
      { icon: 'warn', role: 'emph', sub: 'timing-critical' });

  var rk = csRisksFor(d);
  h += '<div class="cs-row2">'
    + csCard('Risk heat map', csRiskMatrix(d, rk.rows),
        { icon: 'shield', sub: 'likelihood against impact', conf: csConfFor(d, 'risks') })
    + csCard('Escalation triggers', d.triggers ? csTriggers(csTriggersFor(d))
        : csGap('The conditions that would force a change of strategy, with the threshold for each.', 'trigger threshold per risk'),
        { icon: 'warn', sub: d.triggers ? csTriggersFor(d).length + ' triggers' : '', conf: d.triggers ? 'Moderate' : 'Limited' })
    + '</div>';

  var rRows = rk.rows.map(function (r) {
    var hot = /high/i.test(r.l || '') && /high/i.test(r.i || '');
    return '<tr' + (hot ? ' class="cs-st-critical"' : '') + '><td class="cs-l"><b>' + csEsc(r.risk) + '</b>'
      + (r.driver ? '<span class="cs-sub2">' + csEsc(r.driver) + '</span>' : '') + '</td>'
      + '<td class="cs-num"><span class="cs-pill cs-pill-' + (hot ? 'burnt' : 'plum') + '">' + csEsc(r.l) + '</span></td>'
      + '<td class="cs-num"><span class="cs-pill cs-pill-' + (hot ? 'burnt' : 'plum') + '">' + csEsc(r.i) + '</span></td>'
      + '<td class="cs-why">' + csEsc(r.mit) + '</td></tr>';
  });
  h += csCard('Risk register', rRows.length ? csTable(['Risk', 'Likelihood', 'Impact', 'Mitigation'], rRows)
      + (CS_SEG_SEL && rk.missing ? csNote('No risk on the register is tagged to <b>' + csEsc(CS_SEG_SEL)
          + '</b>, so the whole register is shown. Tagging risks by segment would narrow this.') : '')
      : csGap('Category risk register.', 'risks[]'),
      { icon: 'flag', sub: rk.rows.length + ' risks' + (rk.filtered ? ' · filtered' : ''), conf: csConfFor(d, 'risks') });

  h += csCard('Geographic concentration', d.geo ? csGeo(d.geo)
      : csGap('Supply exposure by delivery geography.', 'country / region split per supplier'),
      { icon: 'globe', sub: d.geo ? 'delivery geography' : '', conf: d.geo ? 'Moderate' : 'Limited' });
  return h;
}
function csTriggersFor(d) {
  var t = d.triggers || [];
  if (!CS_SEG_SEL) return t;
  var hit = t.filter(function (x) { return (x.segments || []).indexOf(CS_SEG_SEL) >= 0; });
  return hit.length ? hit : t;
}

/* Market intelligence: the read on one side, the sourced headlines on the other. */
function csMarketIntelSplit(mk) {
  var acc = (mk.headlines || []).map(function (x, i) {
    return '<details class="cs-acc"' + (i === 0 ? ' open' : '') + '>'
      + '<summary class="cs-acch"><b>' + csEsc(x.k) + '</b><u>' + csEsc(x.t) + '</u></summary>'
      + '<div class="cs-accb">' + csEsc(x.d)
      + '<div class="cs-mi-s">' + (x.src || []).map(function (s) {
          return '<a class="cs-cite" href="' + csEsc(s.u) + '" target="_blank" rel="noopener">' + csEsc(s.n) + '</a>';
        }).join('') + '</div></div></details>';
  }).join('');
  var means = (mk.implications || []).length
    ? '<div class="cs-means"><div class="cs-lab2">What it means for this category</div><ul class="cs-ul">'
      + mk.implications.map(function (s) { return '<li>' + csEsc(s) + '</li>'; }).join('') + '</ul></div>'
    : '';
  return '<div class="cs-misplit">' + means + '<div class="cs-miacc">' + acc + '</div></div>'
    + csNote('Externally sourced and dated. Every claim links to its source; nothing here is derived '
      + 'from Lilly spend data.');
}

/* ===========================================================================
   render loop
   =========================================================================== */
function csBody() {
  var sub = CS_SUBSTATE[CS_TAB];
  if (CS_TAB === 'spend')    return sub === 'suppliers' ? scSuppliers() : sub === 'subcats' ? scSubcats() : scPareto();
  if (CS_TAB === 'market')   return scMarket();
  if (CS_TAB === 'strategy') return sub === 'savings' ? scSavings() : scStrategy();
  if (CS_TAB === 'trend')    return sub === 'rational' ? scRational() : sub === 'tail' ? scTail() : scTrend();
  return scOverview();
}
function csRender() {
  var el = document.getElementById('app');
  if (!el) return;
  /* Every interaction re-renders the whole screen. Remember the caret and the
     scroll position first, or typing in the search box loses focus on the first
     keystroke and every click throws the page back to the top. */
  var act = document.activeElement;
  var focusId = act && act.id ? act.id : null;
  var caret = null;
  try { if (focusId && act.selectionStart != null) caret = act.selectionStart; } catch (e) {}
  var y = window.pageYOffset;

  el.innerHTML = '<main class="cs-main">' + csHeader() + '<div class="cs-body">' + csBody() + '</div></main>';

  if (focusId) {
    var back = document.getElementById(focusId);
    if (back) {
      back.focus();
      try { if (caret != null) back.setSelectionRange(caret, caret); } catch (e2) {}
    }
  }
  if (CS_KEEPSCROLL) { window.scrollTo(0, y); CS_KEEPSCROLL = false; }
  else window.scrollTo({ top: 0, behavior: 'auto' });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', csRender);
else csRender();
