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
var CS_FORECAST = false;  // spend-trend forecast overlay, off by default

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

/* ---- primitives ---------------------------------------------------------- */
function csCard(title, body, opts) {
  var o = opts || {};
  // opts.conf renders the 3-dot evidence badge in the header, the same control
  // Deal and Landscape use. Confidence sits on the panel it qualifies.
  return '<div class="cs-card' + (o.cls ? ' ' + o.cls : '') + '">'
    + (title ? '<div class="cs-cardhd"><span class="cs-ct">' + title + '</span>'
        + (o.sub ? '<span class="cs-cs">' + csEsc(o.sub) + '</span>' : '')
        + (o.conf ? csConf(o.conf, o.confWhy) : '') + '</div>' : '')
    + '<div class="cs-cardbd">' + body + '</div></div>';
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
var CS_NAV = [
  ['overview', 'Overview',          null],
  ['spend',    'Spend & Suppliers', [['pareto', 'Pareto & Tail'], ['suppliers', 'Suppliers'], ['subcats', 'Subcategories']]],
  ['market',   'Market & Risk',     [['kraljic', 'Market & Kraljic'], ['porter', 'Porter Five Forces'], ['risk', 'Risk Register']]],
  ['strategy', 'Strategy & Plays',  [['strategy', 'Strategy'], ['savings', 'Savings & Scorecard']]],
  ['trend',    'Trend & Change',    [['trend', 'Trend'], ['rational', 'Rationalization'], ['tail', 'Tail & Contracts']]]
];
var CS_SUBSTATE = { spend: 'pareto', market: 'kraljic', strategy: 'strategy', trend: 'trend' };

function csNavFor(tab) {
  for (var i = 0; i < CS_NAV.length; i++) if (CS_NAV[i][0] === tab) return CS_NAV[i];
  return CS_NAV[0];
}
function csSetCat(i) { CS_CAT = i; csRender(); }
function csSetTab(k) { CS_TAB = k; csRender(); }
function csSetSub(k) { CS_SUBSTATE[CS_TAB] = k; csRender(); }
function csSetCut(v) { CS_PARETO_CUT = parseInt(v, 10); csRender(); }
function csSetTail(v) { CS_TAIL = parseInt(v, 10); csRender(); }
function csSetHorizon(v) { CS_HORIZON = parseInt(v, 10); csRender(); }
function csToggleFc() { CS_FORECAST = !CS_FORECAST; csRender(); }

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
        { sub: 'FY23-FY26 YTD' + (CS_FORECAST ? ' + forecast' : ''), conf: csConfFor(d, 'annual') })
    + csCard('Top Suppliers', csTopSuppliers(d),
        { sub: 'ranked by 3-yr spend', conf: csConfFor(d, 'suppliers') })
    + '</div>';

  h += csCard('Key Findings', csFindings(d),
      { sub: 'what a sourcing lead needs to know', conf: csConfFor(d, 'narr') });

  h += '<div class="cs-row2">'
    + csCard('Spend Under Contract', d.contractCoverage ? csCoverage(d.contractCoverage)
        : csGap('Coverage of category spend under an active agreement, and the largest off-contract relationships.', 'contract coverage / agreement status per supplier'),
        { sub: d.contractCoverage ? csPct(d.contractCoverage.pct, 0) + ' of FY25 spend' : '',
          conf: d.contractCoverage ? 'Moderate' : 'Limited' })
    + csCard('Renewal Exposure', d.renewals ? csRenewals(d.renewals)
        : csGap('Spend renewing in the next 12 months and the largest decision windows.', 'renewal + notice dates per agreement'),
        { sub: d.renewals ? 'next 12 months' : '', conf: d.renewals ? 'Moderate' : 'Limited' })
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
    + csKpi('Tail under $' + CS_TAIL + 'K', csNum(m['tail' + CS_TAIL]) + ' suppliers',
        csUsd(m['tail' + CS_TAIL + 'Spend']) + ' · ' + csPct(m['tail' + CS_TAIL + 'Pct']) + ' of spend')
    + '</div>';

  h += '<div class="cs-paretorow">'
    + csCard('Pareto Distribution', csParetoChart(d),
        { sub: 'spend by supplier with cumulative share', conf: csConfFor(d, 'pareto') })
    + csCard('Tail Analysis', csTailStats(d),
        { cls: 'cs-tailcard', conf: csConfFor(d, 'subcats') })
    + '</div>';

  h += csCard('What the curve says', csParetoRead(d) + csTailRead(d), { cls: 'cs-emph' });
  return h;
}

/* ===========================================================================
   SCREEN 3 — SPEND & SUPPLIERS > SUPPLIERS
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

  var sRows = (d.suppliers || []).map(function (s) {
    return '<tr><td class="cs-l"><b>' + csEsc(s.n) + '</b></td>'
      + '<td class="cs-num">' + csUsd(s.tot) + '</td>'
      + '<td class="cs-num">' + csPct(s.share) + '</td>'
      + '<td class="cs-num">' + (s.yoy != null ? '<span class="' + (s.yoy >= 0 ? 'cs-up' : 'cs-down') + '">'
          + (s.yoy > 0 ? '+' : '') + csPct(s.yoy) + '</span>' : '--') + '</td>'
      + '<td class="cs-num"><span class="cs-tier">' + csEsc(s.tier || '--') + '</span></td></tr>';
  });
  h += csCard('Supplier tiering', csTieringLines(d),
      { sub: 'how each tier is managed', conf: csConfFor(d, 'suppliers') });

  h += csCard('Ranked Suppliers', csTable(['Supplier', '3-yr spend', 'Share', 'YoY', 'Tier'], sRows),
      { sub: (d.suppliers || []).length + ' with resolved detail', conf: csConfFor(d, 'suppliers') });
  return h;
}

/* ===========================================================================
   SCREEN 4 — SPEND & SUPPLIERS > SUBCATEGORIES
   The spend-only table and the fragmentation map read the same subcats[]. Only
   the fragmentation view survives: it answers a question the table did not.
   =========================================================================== */
function scSubcats() {
  var d = csData(), n = d.narr || {};
  var sc = d.subcats || [];
  var h = '';
  var hasVc = sc.some(function (x) { return x.vc != null; });

  h += csCard('Fragmentation Map', csFragMap(d),
      { sub: hasVc ? 'spend against vendor count' : 'spend by subcategory', conf: csConfFor(d, 'subcats') });

  var scMax = sc.reduce(function (a, x) { return Math.max(a, x.tot || 0); }, 0) || 1;
  var vcMax = sc.reduce(function (a, x) { return Math.max(a, x.vc || 0); }, 0) || 1;
  var rows = sc.slice().sort(function (a, b) {
    return hasVc ? (b.vc || 0) - (a.vc || 0) : (b.tot || 0) - (a.tot || 0);
  }).map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.n) + '<span class="cs-sub2">' + csEsc(x.host || '') + '</span></td>'
      + (hasVc ? '<td class="cs-barcell">' + csBar((x.vc / vcMax) * 100, 'emph') + '</td>'
                 + '<td class="cs-num">' + csNum(x.vc) + '</td>'
                 + '<td class="cs-num">' + csUsd(Math.round((x.tot || 0) / (x.vc || 1))) + '</td>' : '')
      + '<td class="cs-barcell">' + csBar((x.tot / scMax) * 100, 'plum') + '</td>'
      + '<td class="cs-num">' + csUsd(x.tot) + '</td><td class="cs-num">' + csPct(x.pct) + '</td></tr>';
  });
  h += csCard('Consolidation Candidates',
      csTable(hasVc ? ['Subcategory', '', 'Vendors', 'Avg per vendor', '', 'Spend', 'Share']
                    : ['Subcategory', '', 'Spend', 'Share'], rows)
      + csNote(hasVc
          ? 'Ranked by vendor count, not spend. A large subcategory bought from a handful of suppliers is not fragmented; a small one bought from a hundred is.'
          : 'Ranked by spend. A true fragmentation ranking needs a <b>vendor count per subcategory</b>, which this data set does not carry.')
      + csNarrNote(n.subcatLegend) + csNarrNote(n.subcatGap),
      { sub: sc.length + ' subcategories', conf: hasVc ? 'Moderate' : 'Limited' });
  return h;
}

/* ===========================================================================
   SCREEN 5 — MARKET & RISK > MARKET & KRALJIC
   =========================================================================== */
function scKraljic() {
  var d = csData(), n = d.narr || {};
  var h = '';

  h += csCard('Category Positioning', csKraljicGrid(d),
      { sub: 'Kraljic', conf: csConfFor(d, 'narr') });

  h += csCard('Market Intelligence', d.market ? csMarketIntel(d.market)
      : csGap('What the supply market is doing, and what it means for this category.', 'market research records with sources'),
      { sub: d.market ? (d.market.asOf || 'current') : '', conf: d.market ? 'Strong' : 'Limited' });

  h += csCard('Pricing Environment', n.pricing ? csNarr(n.pricing)
      : csGap('Market pricing direction and its implication for this category.', 'narr.pricing'),
      { sub: 'category read', conf: csConfFor(d, 'narr') });
  return h;
}

/* ===========================================================================
   SCREEN 6 — MARKET & RISK > PORTER
   Five forces as a scored read with a net-leverage verdict, not five paragraphs.
   =========================================================================== */
function scPorter() {
  var d = csData();
  var h = '';
  if (!(d.forces || []).length) {
    return csCard('Porter Five Forces', csGap('Porter five-forces read for this category.', 'forces[]'));
  }
  h += csCard('Net Buyer Leverage', csForceVerdict(d), { sub: 'the answer first', cls: 'cs-emph' });
  h += csCard('Five Forces', csForceChart(d), { sub: 'scored, strongest constraint first', conf: csConfFor(d, 'forces') });
  return h;
}

/* ===========================================================================
   SCREEN 7 — MARKET & RISK > RISK REGISTER
   =========================================================================== */
function scRisk() {
  var d = csData(), n = d.narr || {};
  var h = '';
  if (n.riskTop2) h += csCard('What Could Change the Strategy', csNarr(n.riskTop2), { cls: 'cs-emph', sub: 'timing-critical' });

  h += csCard('Risk Heat Map', csRiskMatrix(d), { sub: 'likelihood against impact', conf: csConfFor(d, 'risks') });

  var rRows = (d.risks || []).map(function (r) {
    var hot = /high/i.test(r.l || '') && /high/i.test(r.i || '');
    return '<tr' + (hot ? ' class="cs-st-critical"' : '') + '><td class="cs-l"><b>' + csEsc(r.risk) + '</b>'
      + (r.driver ? '<span class="cs-sub2">' + csEsc(r.driver) + '</span>' : '') + '</td>'
      + '<td class="cs-num"><span class="cs-pill cs-pill-' + (hot ? 'burnt' : 'plum') + '">' + csEsc(r.l) + '</span></td>'
      + '<td class="cs-num"><span class="cs-pill cs-pill-' + (hot ? 'burnt' : 'plum') + '">' + csEsc(r.i) + '</span></td>'
      + '<td class="cs-why">' + csEsc(r.mit) + '</td></tr>';
  });
  h += csCard('Risk Register', rRows.length ? csTable(['Risk', 'Likelihood', 'Impact', 'Mitigation'], rRows)
      : csGap('Category risk register.', 'risks[]'),
      { sub: (d.risks || []).length + ' risks', conf: csConfFor(d, 'risks') });

  h += '<div class="cs-row2">'
    + csCard('Escalation Triggers', d.triggers ? csTriggers(d.triggers)
        : csGap('The conditions that would force a change of strategy, with the threshold for each.', 'trigger threshold per risk (risks[] carries mitigation only)'),
        { sub: d.triggers ? d.triggers.length + ' triggers' : '', conf: d.triggers ? 'Moderate' : 'Limited' })
    + csCard('Geographic Concentration', d.geo ? csGeo(d.geo)
        : csGap('Supply exposure by delivery geography.', 'country / region split per supplier'),
        { sub: d.geo ? 'delivery geography' : '', conf: d.geo ? 'Moderate' : 'Limited' })
    + '</div>';
  return h;
}

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
function csTogglePlay(i) {
  var d = csData(), sel = csSelSet(d), at = sel.indexOf(i);
  if (at >= 0) sel.splice(at, 1); else sel.push(i);
  CS_PLAYMSG = '';
  csRender();
}
function csSetHz(h) { CS_HZ = h; csRender(); }
function csHzYears() { return CS_HZ === 'y1' ? 1 : CS_HZ === '5yr' ? 5 : 3; }
function csPlayAct(msg) { CS_PLAYMSG = msg; csRender(); }

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
      { sub: 'modelled to realised', conf: csConfFor(d, 'savings') });

  h += csCard('Category Scorecard', csScorecard(d),
      { sub: (d.kpis || []).length + ' measures', conf: csConfFor(d, 'kpis') });

  if (d.benefits) h += csCard('Play-to-Value Traceability', csBenefits(d.benefits),
      { sub: 'each saving traced to its lever', conf: 'Moderate' });
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
      { sub: CS_FORECAST ? 'actual and projected' : 'actual', conf: csConfFor(d, 'annual') });

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
      { sub: 'FY24 to FY25', conf: csConfFor(d, 'swing') });

  h += '<div class="cs-row2">'
    + csCard('Rate vs Volume', d.rateVolume ? csRateVolume(d.rateVolume)
        : csGap('How much of the change is price and how much is quantity.', 'rate and quantity split (only totals are held)'),
        { sub: d.rateVolume ? 'change decomposed' : '', conf: d.rateVolume ? 'Moderate' : 'Limited' })
    + csCard('What Changed Since Last Strategy', d.sinceLast ? csSinceLast(d.sinceLast)
        : csGap('Movement in spend, suppliers, risk and market since the last approved strategy.', 'a prior approved snapshot to diff against'),
        { sub: d.sinceLast ? d.sinceLast.asOf : '', conf: d.sinceLast ? 'Moderate' : 'Limited' })
    + '</div>';

  if (n.trendDecomp) h += csCard('Change Decomposition', csNarr(n.trendDecomp), { conf: csConfFor(d, 'narr') });
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
      { sub: d.overlaps ? d.overlaps.length + ' overlapping capabilities' : 'narrative',
        conf: d.overlaps ? 'Moderate' : 'Limited' });

  h += csCard('Utilization / Shelfware', d.utilization ? csUtilization(d.utilization)
      : csGap('Licences bought against licences actually used.', 'licence count vs active users'),
      { sub: d.utilization ? 'licences bought against active' : '', conf: d.utilization ? 'Moderate' : 'Limited' });

  h += csCard('Action Matrix', d.actionMatrix ? csActionMatrix(d.actionMatrix)
      : csGap('Retain / renegotiate / consolidate / retire / replace, with value, effort and timing.', 'per-supplier action + renewal window'),
      { sub: d.actionMatrix ? d.actionMatrix.length + ' suppliers dispositioned' : '',
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
      { sub: d.tailOpps ? d.tailOpps.length + ' groups' : '', conf: d.tailOpps ? 'Moderate' : 'Limited' });

  h += csCard('Contract Opportunities', d.contractOpps ? csContractOpps(d.contractOpps)
      : csGap('Expiring agreements and off-contract spend, with the action and the window.',
              'agreement records with expiry, notice window and at-risk value'),
      { sub: d.contractOpps ? d.contractOpps.length + ' at risk' : '', conf: d.contractOpps ? 'Moderate' : 'Limited' });
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
  return '<div class="cs-suplist cs-scroll10">' + rows + '</div>'
    + csNote('Top ' + sup.length + ' of ' + csNum((d.meta || {}).vendors) + ' active suppliers. Ten shown, scroll for the rest.');
}

/* ---- Overview / Trend: spend trend with an optional forecast overlay ------
   The current year is a part year. Toggling the forecast on does NOT redraw it
   as a whole-year actual: the projected remainder stacks on top of what has
   actually been spent, so the bar reads "this is banked, that is expected".  */
function csTrendChart(d) {
  var m = d.meta || {};
  var act = (d.annual || []).filter(function (a) { return a.value; })
    .map(function (a) { return { y: a.name, v: a.value, ytd: /YTD|partial/i.test(a.name || '') }; });
  if (!act.length) return csGap('Annual spend trend.', 'annual[]');

  var ytdIdx = -1;
  for (var i = 0; i < act.length; i++) if (act[i].ytd) ytdIdx = i;

  /* full-year view of the part year, and the years after it */
  var ytdFull = null, proj = [];
  if (CS_FORECAST) {
    var fy = (d.forecast && d.forecast.years) || [];
    var ytdYear = ytdIdx >= 0 ? String(act[ytdIdx].y).replace(/[^0-9]/g, '').slice(-4) : null;
    fy.forEach(function (p) {
      var yr = String(p.y).replace(/[^0-9]/g, '').slice(-4);
      if (ytdYear && yr === ytdYear) ytdFull = p;
      else proj.push({ y: p.y, v: p.v, lo: p.lo, hi: p.hi });
    });
    if (!fy.length && m.cagr2325 != null && act.length >= 2) {
      var g = m.cagr2325 / 100;
      var lastFull = act[ytdIdx >= 0 ? ytdIdx - 1 : act.length - 1];
      if (lastFull) {
        if (ytdIdx >= 0) ytdFull = { y: act[ytdIdx].y, v: lastFull.v * (1 + g) };
        for (var k = 1; k <= 2; k++) {
          var b = lastFull.v * Math.pow(1 + g, k + (ytdIdx >= 0 ? 1 : 0));
          proj.push({ y: 'FY' + (parseInt(String(lastFull.y).replace(/[^0-9]/g, '').slice(-4), 10) + k + (ytdIdx >= 0 ? 1 : 0)),
                      v: b, lo: b * Math.pow(0.97, k), hi: b * Math.pow(1.03, k) });
        }
      }
    }
    /* never project below what is already banked */
    if (ytdFull && ytdIdx >= 0 && ytdFull.v < act[ytdIdx].v) ytdFull = { y: ytdFull.y, v: act[ytdIdx].v };
  }

  var all = act.map(function (a, i) {
    var o = { y: a.y, v: a.v, ytd: a.ytd, kind: a.ytd ? 'ytd' : 'hist' };
    if (a.ytd && ytdFull) { o.total = ytdFull.v; o.banked = a.v; o.kind = 'stack'; }
    return o;
  }).concat(proj.map(function (p) { return { y: p.y, v: p.v, lo: p.lo, hi: p.hi, kind: 'proj' }; }));

  var max = all.reduce(function (a, p) { return Math.max(a, p.hi || p.total || p.v || 0); }, 0) || 1;

  var cols = all.map(function (p) {
    var band = (p.lo != null && p.hi != null)
      ? '<i class="cs-fc-band" style="bottom:' + ((p.lo / max) * 100).toFixed(1) + '%;height:'
        + (((p.hi - p.lo) / max) * 100).toFixed(1) + '%"></i>' : '';
    var bar, top;
    if (p.kind === 'stack') {
      var bankedH = (p.banked / max) * 100, addH = ((p.total - p.banked) / max) * 100;
      bar = '<i class="cs-fc-bar" style="height:' + bankedH.toFixed(1) + '%"></i>'
          + '<i class="cs-fc-add" style="bottom:' + bankedH.toFixed(1) + '%;height:' + addH.toFixed(1) + '%"></i>';
      top = csUsd(p.total);
    } else {
      bar = '<i class="cs-fc-bar" style="height:' + ((p.v / max) * 100).toFixed(1) + '%"></i>';
      top = csUsd(p.v);
    }
    var tip = p.kind === 'stack'
      ? p.y + ': ' + csUsd(p.banked) + ' spent so far, ' + csUsd(p.total - p.banked)
        + ' projected for the rest of the year, ' + csUsd(p.total) + ' full year'
      : p.y + ': ' + csUsd(p.v) + (p.kind === 'proj' ? ' projected' : p.kind === 'ytd' ? ' year to date' : '');
    return '<div class="cs-fc-col is-' + p.kind + '" title="' + csEsc(tip) + '">'
      + '<div class="cs-fc-v">' + top + '</div>'
      + '<div class="cs-fc-plot">' + band + bar + '</div>'
      + '<div class="cs-fc-l">' + csEsc(p.y) + '</div></div>';
  }).join('');

  var toggle = '<div class="cs-ctrlbar"><button class="cs-toggle' + (CS_FORECAST ? ' on' : '') + '"'
    + ' onclick="csToggleFc()" aria-pressed="' + (CS_FORECAST ? 'true' : 'false') + '">'
    + '<span class="cs-toggle-t"></span>Forecast</button></div>';

  var key = '<div class="cs-fc-key"><span class="cs-k-hist">actual</span>'
    + (CS_FORECAST && ytdFull ? '<span class="cs-k-add">rest of year, projected</span>'
                              : '<span class="cs-k-ytd">year to date</span>')
    + (proj.length ? '<span class="cs-k-proj">projected</span><span class="cs-k-band">range</span>' : '') + '</div>';

  var basis = CS_FORECAST
    ? csNote('<b>Forecast basis.</b> ' + (d.forecast && d.forecast.basis
        ? csEsc(d.forecast.basis)
        : 'The observed ' + csPct(m.cagr2325) + ' three-year CAGR carried forward, with a &plusmn;3% a year band. '
          + 'It does <b>not</b> incorporate known renewals or price escalators, because this data set carries no '
          + 'renewal dates. A trend extrapolation, not a plan.')
        + (ytdFull ? ' The current year shows what is already spent, with the projected remainder stacked on top.' : ''))
    : csNote(csEsc(m.ytdNote ? 'The current year is a part year: ' + m.ytdNote + '.' : 'The current year is a part year.'));

  return toggle + '<div class="cs-fc">' + cols + '</div>' + key + basis;
}

/* ---- Overview: key findings as cards, not three stacked paragraphs -------- */
function csFindings(d) {
  var f = (d.narr || {}).findings;
  if (!f) return csGap('Key data-driven findings', 'narr.findings');
  var arr = Array.isArray(f) ? f : [f];
  if (typeof arr[0] === 'string') return csNarr(f);
  return '<div class="cs-mis">' + arr.map(function (x) {
    var tone = csTone(x.c) || 'plum';
    return '<div class="cs-mi cs-mi-' + tone + '">'
      + (x.k ? '<div class="cs-mi-k">' + csEsc(x.k) + '</div>' : '')
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
  var W = 960, H = 300, PADL = 52, PADR = 46, PADB = 46, PADT = 14;
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

  var axis = '<line x1="' + PADL + '" y1="' + (PADT + plotH) + '" x2="' + (W - PADR) + '" y2="' + (PADT + plotH) + '" class="cs-pax"/>'
    + [0, 25, 50, 75, 100].map(function (t) {
        var y = PADT + plotH - (t / 100) * plotH;
        return '<text x="' + (W - PADR + 6) + '" y="' + (y + 3).toFixed(1) + '" class="cs-pyr">' + t + '%</text>';
      }).join('')
    + '<text x="' + (PADL - 8) + '" y="' + (PADT + 8) + '" class="cs-pyl">' + csUsd(max) + '</text>';

  var tailNote = '';
  if (truncated) {
    var tailSpend = whole.slice(window).reduce(function (a, x) { return a + (x.value || 0); }, 0);
    tailNote = '<text x="' + (W - PADR - 4) + '" y="' + (PADT + plotH - 20) + '" class="cs-ptail">'
      + csNum(truncated) + ' more suppliers in the tail</text>'
      + '<text x="' + (W - PADR - 4) + '" y="' + (PADT + plotH - 7) + '" class="cs-ptail cs-ptail2">'
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
    + 'is ' + csPct(lead.cumPct, 1) + ' of it on its own. At an HHI of ' + csNum(Math.round(m.hhi || 0)) + ' the category is '
    + conc + ', which means leverage comes from <b>competing the top</b> rather than from breaking a monopoly. '
    + 'The flat right-hand stretch is the cost problem: ' + csNum(m['tail' + CS_TAIL]) + ' suppliers under $' + CS_TAIL + 'K '
    + 'account for ' + csPct(m['tail' + CS_TAIL + 'Pct']) + ' of spend but consume the same contracting and vendor-management effort as the top.'
    + '</div></div>';
}
function csTailSlider() {
  var stops = [50, 100, 250], at = stops.indexOf(CS_TAIL);
  if (at < 0) at = 1;
  return '<div class="cs-tslider">'
    + '<input type="range" min="0" max="2" step="1" value="' + at + '" aria-label="Tail threshold" '
    + 'oninput="csSetTail([50,100,250][+this.value])">'
    + '<div class="cs-tsticks">' + stops.map(function (v, i) {
        return '<span class="' + (i === at ? 'on' : '') + '">$' + v + 'K</span>';
      }).join('') + '</div>'
    + '<div class="cs-tslab">suppliers spending under this each year</div></div>';
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
  var t = CS_TAIL, n = m['tail' + t], sp = m['tail' + t + 'Spend'], pc = m['tail' + t + 'Pct'];
  if (n == null) return csTailSlider() + csGap('Tail distribution.', 'tail counts per threshold');
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
  var m = d.meta || {}, t = CS_TAIL;
  if (m.tailHoursLo == null) return '';
  return csNote('<b>Effort against value.</b> Managing this tail costs an estimated <b>' + csNum(m.tailHoursLo)
    + ' to ' + csNum(m.tailHoursHi) + ' hours</b> a year, against ' + csUsd(m['tail' + t + 'Spend'])
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
  var W = 900, H = 340, PADL = 62, PADB = 48, PADT = 16, PADR = 20;
  var pw = W - PADL - PADR, ph = H - PADT - PADB;
  var maxV = sc.reduce(function (a, x) { return Math.max(a, x.vc || 0); }, 0) || 1;
  var maxS = sc.reduce(function (a, x) { return Math.max(a, x.tot || 0); }, 0) || 1;
  var medV = maxV / 2, medS = maxS / 2;
  var xm = PADL + (medV / maxV) * pw, ym = PADT + ph - (medS / maxS) * ph;

  var dots = sc.map(function (x) {
    var cx = PADL + ((x.vc || 0) / maxV) * pw;
    var cy = PADT + ph - ((x.tot || 0) / maxS) * ph;
    var frag = (x.vc || 0) > medV;
    return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="8" class="'
      + (frag ? 'cs-fd-hot' : 'cs-fd') + '"><title>' + csEsc(x.n + ' · ' + csNum(x.vc) + ' vendors · '
      + csUsd(x.tot) + ' · ' + csUsd(Math.round(x.tot / (x.vc || 1))) + ' average each') + '</title></circle>'
      + '<text x="' + (cx + 12).toFixed(1) + '" y="' + (cy + 4).toFixed(1) + '" class="cs-fdlab">'
      + csEsc(String(x.n).slice(0, 22)) + '</text>';
  }).join('');

  return '<div class="cs-pwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="cs-psvg" role="img" '
    + 'aria-label="Subcategory spend against vendor count">'
    + '<line x1="' + xm.toFixed(1) + '" y1="' + PADT + '" x2="' + xm.toFixed(1) + '" y2="' + (PADT + ph) + '" class="cs-p80h"/>'
    + '<line x1="' + PADL + '" y1="' + ym.toFixed(1) + '" x2="' + (W - PADR) + '" y2="' + ym.toFixed(1) + '" class="cs-p80h"/>'
    + '<text x="' + (W - PADR - 4) + '" y="' + (PADT + 14) + '" class="cs-quadl">big and fragmented · consolidate here</text>'
    + '<text x="' + (PADL + 4) + '" y="' + (PADT + ph - 6) + '" class="cs-quadl">small and consolidated · leave alone</text>'
    + '<line x1="' + PADL + '" y1="' + (PADT + ph) + '" x2="' + (W - PADR) + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + '<line x1="' + PADL + '" y1="' + PADT + '" x2="' + PADL + '" y2="' + (PADT + ph) + '" class="cs-pax"/>'
    + '<text x="' + (PADL + pw / 2) + '" y="' + (H - 8) + '" class="cs-axt">vendors in the subcategory &rarr;</text>'
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
function csRiskMatrix(d) {
  var r = d.risks || [];
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
  return '<div class="cs-rkwrap"><svg viewBox="0 0 ' + W + ' ' + H + '" class="cs-psvg" role="img" aria-label="Risk likelihood against impact">'
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
      + '<div class="cs-scard-k">' + csEsc(x.kpi) + '</div>'
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
   render loop
   =========================================================================== */
function csBody() {
  var sub = CS_SUBSTATE[CS_TAB];
  if (CS_TAB === 'spend')    return sub === 'suppliers' ? scSuppliers() : sub === 'subcats' ? scSubcats() : scPareto();
  if (CS_TAB === 'market')   return sub === 'porter' ? scPorter() : sub === 'risk' ? scRisk() : scKraljic();
  if (CS_TAB === 'strategy') return sub === 'savings' ? scSavings() : scStrategy();
  if (CS_TAB === 'trend')    return sub === 'rational' ? scRational() : sub === 'tail' ? scTail() : scTrend();
  return scOverview();
}
function csRender() {
  var el = document.getElementById('app');
  if (!el) return;
  el.innerHTML = '<main class="cs-main">' + csHeader() + '<div class="cs-body">' + csBody() + '</div></main>';
  window.scrollTo({ top: 0, behavior: 'auto' });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', csRender);
else csRender();
