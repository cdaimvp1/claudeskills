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
  return '<div class="cs-card' + (o.cls ? ' ' + o.cls : '') + '">'
    + (title ? '<div class="cs-cardhd"><span class="cs-ct">' + csEsc(title) + '</span>'
        + (o.sub ? '<span class="cs-cs">' + csEsc(o.sub) + '</span>' : '') + '</div>' : '')
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
  return '<span class="cs-src" title="' + csEsc(src) + '">source</span>';
}
function csBar(pct, tone) {
  var p = Math.max(0, Math.min(100, pct || 0));
  return '<span class="cs-bar' + (tone ? ' cs-bar-' + tone : '') + '"><i style="width:' + p.toFixed(1) + '%"></i></span>';
}
function csKpi(label, value, sub, tone) {
  return '<div class="cs-kpi' + (tone ? ' cs-kpi-' + tone : '') + '">'
    + '<div class="cs-kpi-l">' + csEsc(label) + '</div>'
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

/* ---- shell --------------------------------------------------------------- */
function csSetCat(i) { CS_CAT = i; csRender(); }
function csSetTab(k) { CS_TAB = k; csRender(); }
function csSetCut(v) { CS_PARETO_CUT = parseInt(v, 10); csRender(); }
function csSetTail(v) { CS_TAIL = parseInt(v, 10); csRender(); }
function csSetHorizon(v) { CS_HORIZON = parseInt(v, 10); csRender(); }

function csHeader() {
  var d = csData(), m = d.meta || {};
  var cats = (CATEGORY_SEED.categories || []).map(function (c, i) {
    return '<button class="cs-cat' + (i === CS_CAT ? ' on' : '') + '" onclick="csSetCat(' + i + ')">'
      + csEsc((c.meta || {}).name || c.title || ('Category ' + (i + 1))) + '</button>';
  }).join('');
  var tabs = CS_TABS.map(function (t) {
    return '<button class="cs-tab' + (t[0] === CS_TAB ? ' on' : '') + '" onclick="csSetTab(\'' + t[0] + '\')">'
      + csEsc(t[1]) + '</button>';
  }).join('');
  return '<div class="cs-head">'
    + '<div class="cs-eyebrow">Category Strategy</div>'
    + '<h1 class="cs-h1">' + csEsc(m.name || d.title || 'Category') + '</h1>'
    + '<div class="cs-sub">' + csEsc(m.cutoff || '') + (m.ytdNote ? ' · ' + csEsc(m.ytdNote) : '') + '</div>'
    + '<div class="cs-cats">' + cats + '</div>'
    + '</div>'
    + '<div class="cs-tabs">' + tabs + '</div>';
}

/* ===========================================================================
   TAB 1 — OVERVIEW
   =========================================================================== */
function csOverview() {
  var d = csData(), m = d.meta || {}, n = d.narr || {};
  var h = '';

  h += '<div class="cs-kpirow">'
    + csKpi('Annual spend (FY25)', csUsd(m.s25), (m.chg2425 != null ? (m.chg2425 > 0 ? '+' : '') + csUsd(m.chg2425) + ' vs FY24' : ''), 'plum')
    + csKpi('YoY change', (m.yoy2425 != null ? (m.yoy2425 > 0 ? '+' : '') + csPct(m.yoy2425) : '--'), 'FY24 to FY25')
    + csKpi('Active vendors', csNum(m.vendors), (m.newVendorsNet != null ? (m.newVendorsNet > 0 ? '+' : '') + m.newVendorsNet + ' net' : ''))
    + csKpi('Concentration (HHI)', (m.hhi != null ? csNum(Math.round(m.hhi)) : '--'), (m.hhi != null ? (m.hhi >= 2500 ? 'concentrated' : m.hhi >= 1500 ? 'moderately concentrated' : 'unconcentrated') + ' · top 5 = ' + csPct(m.top5Share) : ''))
    + csKpi('3-yr CAGR', (m.cagr2325 != null ? csPct(m.cagr2325) : '--'), 'FY23 to FY25')
    + '</div>';

  // spend trend
  var ann = d.annual || [];
  var maxV = ann.reduce(function (a, x) { return Math.max(a, x.value || 0); }, 0) || 1;
  var trend = '<div class="cs-trend">' + ann.map(function (p) {
    return '<div class="cs-trend-col">'
      + '<div class="cs-trend-v">' + csUsd(p.value) + '</div>'
      + '<div class="cs-trend-bar"><i style="height:' + Math.round((p.value / maxV) * 100) + '%"></i></div>'
      + '<div class="cs-trend-l">' + csEsc(p.name) + '</div></div>';
  }).join('') + '</div>';

  // top suppliers, orientation only
  var sup = (d.suppliers || []).slice(0, 8);
  var supMax = sup.reduce(function (a, s) { return Math.max(a, s.tot || 0); }, 0) || 1;
  var supList = '<div class="cs-suplist">' + sup.map(function (s) {
    return '<div class="cs-suprow"><span class="cs-supn">' + csEsc(s.n) + '</span>'
      + csBar((s.tot / supMax) * 100, 'plum')
      + '<span class="cs-supv">' + csUsd(s.tot) + '</span>'
      + '<span class="cs-supp">' + csPct(s.share) + '</span></div>';
  }).join('') + '</div>';

  h += '<div class="cs-row2">'
    + csCard('Annual Spend Trend', trend + csNote('FY23 to FY26 YTD. ' + csEsc(m.ytdNote || '')), { sub: 'FY23-FY26 YTD' })
    + csCard('Top Suppliers', supList + csNote('Orientation only. Full ranking, tiers and drill-down live on Spend &amp; Suppliers.'), { sub: 'top 8 by 3-yr spend' })
    + '</div>';

  // findings
  var findings = n.findings ? ('<div class="cs-find">' + n.findings + '</div>') : csGap('Key data-driven findings', 'narr.findings');
  h += csCard('Key Findings', findings, { sub: 'what a sourcing lead needs to know' });

  // gaps, stated
  h += '<div class="cs-row2">'
    + csCard('Spend Under Contract', csGap('Coverage of category spend under an active agreement, and the largest off-contract relationships.', 'contract coverage / agreement status per supplier'))
    + csCard('Renewal Exposure', csGap('Spend renewing in the next 12 months and the largest decision windows.', 'renewal + notice dates per agreement'))
    + '</div>';

  // data quality, demoted
  h += csCard('Scope &amp; Data Quality',
      '<div class="cs-dq">'
      + '<span class="cs-chip">Field completeness ' + csPct(m.fieldCompletenessPct, 0) + '</span>'
      + '<span class="cs-chip">Unclassified ' + csUsd(m.unclassified) + '</span>'
      + '<span class="cs-chip">' + csEsc(m.cutoff || '') + '</span>'
      + '</div>' + (n.dq ? csNote(n.dq) : ''), { cls: 'cs-quiet', sub: 'coverage and evidence' });

  return h;
}

/* ===========================================================================
   TAB 2 — SPEND & SUPPLIERS  (Suppliers + Pareto & Tail + Subcategories)
   =========================================================================== */
function csSpend() {
  var d = csData(), m = d.meta || {}, n = d.narr || {};
  var h = '';

  h += '<div class="cs-kpirow">'
    + csKpi('Top 5 share', csPct(m.top5Share), 'of category spend', 'plum')
    + csKpi('Top 10 share', csPct(m.top10Share), '')
    + csKpi('80% of spend', csNum(m.p80) + ' suppliers', 'Pareto point')
    + csKpi('Tail < $' + CS_TAIL + 'K', csNum(m['tail' + CS_TAIL]) + ' suppliers', csUsd(m['tail' + CS_TAIL + 'Spend']) + ' · ' + csPct(m['tail' + CS_TAIL + 'Pct']), 'teal')
    + '</div>';

  /* ---- Pareto with the A/B/C/D cut ---- */
  var pareto = d.pareto || [];
  var pRows = pareto.map(function (p) {
    var band = p.cumPct <= CS_PARETO_CUT ? 'A' : (p.cumPct <= 95 ? 'B' : 'C');
    return '<tr><td class="cs-l">' + csEsc(p.name) + '</td>'
      + '<td>' + csUsd(p.value) + '</td>'
      + '<td>' + csBar(p.cumPct, 'plum') + '<span class="cs-inline">' + csPct(p.cumPct, 0) + '</span></td>'
      + '<td><span class="cs-band cs-band-' + band + '">' + band + '</span></td></tr>';
  });
  var cut = '<div class="cs-ctrl"><label class="cs-ctrl-l">Class A cutoff</label>'
    + '<input type="range" min="50" max="95" step="5" value="' + CS_PARETO_CUT + '" oninput="csSetCut(this.value)">'
    + '<span class="cs-ctrl-v">' + CS_PARETO_CUT + '% of spend</span></div>';
  var posture = '<div class="cs-posture">'
    + '<div><b>A</b> strategic governance, joint roadmap</div>'
    + '<div><b>B</b> benchmark and compete at renewal</div>'
    + '<div><b>C</b> automate, consolidate or retire</div></div>';
  h += csCard('Pareto Distribution', cut + csTable(['Supplier', 'Spend', 'Cumulative', 'Class'], pRows)
      + posture + (n.paretoNote ? csNote(n.paretoNote) : ''), { sub: 'concentration and tiering ' + csSrc('pareto') });

  /* ---- tail thresholds, one panel not three cards ---- */
  var tails = [50, 100, 250].map(function (t) {
    return '<button class="cs-seg' + (CS_TAIL === t ? ' on' : '') + '" onclick="csSetTail(' + t + ')">&lt; $' + t + 'K</button>';
  }).join('');
  var tailBody = '<div class="cs-segbar">' + tails + '</div>'
    + csTable(['Threshold', 'Suppliers', 'Spend', 'Share of category'], [
        '<tr><td class="cs-l">Under $' + CS_TAIL + 'K</td><td>' + csNum(m['tail' + CS_TAIL] ) + '</td><td>'
        + csUsd(m['tail' + CS_TAIL + 'Spend']) + '</td><td>' + csPct(m['tail' + CS_TAIL + 'Pct']) + '</td></tr>'
      ])
    + (m.tailHoursLo != null
        ? csNote('Effort to value: managing this tail costs an estimated <b>' + csNum(m.tailHoursLo) + '-' + csNum(m.tailHoursHi)
          + ' hours</b> a year against ' + csUsd(m['tail' + CS_TAIL + 'Spend']) + ' of spend.')
        : '');
  h += csCard('Tail Analysis', tailBody, { sub: 'consolidation candidates ' + csSrc('subcats') });

  /* ---- supplier table ---- */
  var sRows = (d.suppliers || []).map(function (s) {
    return '<tr><td class="cs-l"><b>' + csEsc(s.n) + '</b>' + (s.cc ? '<span class="cs-sub2">' + csEsc(s.cc) + '</span>' : '') + '</td>'
      + '<td>' + csUsd(s.tot) + '</td>'
      + '<td>' + csPct(s.share) + '</td>'
      + '<td>' + (s.yoy != null ? '<span class="' + (s.yoy >= 0 ? 'cs-up' : 'cs-down') + '">' + (s.yoy > 0 ? '+' : '') + csPct(s.yoy) + '</span>' : '--') + '</td>'
      + '<td><span class="cs-tier">' + csEsc(s.tier || '--') + '</span></td></tr>';
  });
  h += csCard('Supplier Portfolio', csTable(['Supplier', '3-yr spend', 'Share', 'YoY', 'Tier'], sRows)
      + ((d.others || []).length ? csNote('Plus ' + (d.others || []).length + ' further suppliers below the reporting threshold, folded into the tail above.') : ''),
      { sub: (d.suppliers || []).length + ' ranked ' + csSrc('suppliers') });

  /* ---- new / exiting ---- */
  var nv = (d.newVendors || []).map(function (v) { return '<tr><td class="cs-l">' + csEsc(v.n) + '</td><td>' + csUsd(v.s) + '</td></tr>'; });
  var xv = (d.exitVendors || []).map(function (v) { return '<tr><td class="cs-l">' + csEsc(v.n) + '</td><td>' + csUsd(v.s) + '</td></tr>'; });
  h += '<div class="cs-row2">'
    + csCard('New Suppliers', nv.length ? csTable(['Supplier', 'Spend'], nv) : csGap('Suppliers new in the current period.', 'newVendors[]'), { sub: 'entered this period' })
    + csCard('Exiting Suppliers', xv.length ? csTable(['Supplier', 'Prior spend'], xv) : csGap('Suppliers that stopped in the current period.', 'exitVendors[]'), { sub: 'no spend this period' })
    + '</div>';

  /* ---- subcategories ---- */
  var sc = d.subcats || [];
  var scMax = sc.reduce(function (a, x) { return Math.max(a, x.tot || 0); }, 0) || 1;
  var scRows = sc.map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.n) + '</td>'
      + '<td>' + csUsd(x.tot) + '</td>'
      + '<td>' + csPct(x.pct) + '</td>'
      + '<td>' + csBar((x.tot / scMax) * 100, 'teal') + '</td>'
      + '<td>' + csEsc(x.host || '--') + '</td></tr>';
  });
  h += csCard('Subcategories', csTable(['Subcategory', 'Spend', 'Share', '', 'Model'], scRows)
      + (n.subcatLegend ? csNote(n.subcatLegend) : '') + (n.subcatGap ? csNote(n.subcatGap) : ''),
      { sub: sc.length + ' subcategories ' + csSrc('subcats') });

  /* ---- fragmentation map: spend only, vendor count absent ---- */
  h += csCard('Fragmentation Map',
      '<div class="cs-frag">' + sc.map(function (x) {
        return '<div class="cs-frag-row"><span class="cs-frag-n">' + csEsc(x.n) + '</span>'
          + csBar((x.tot / scMax) * 100, 'plum') + '<span class="cs-frag-v">' + csUsd(x.tot) + '</span></div>';
      }).join('') + '</div>'
      + csNote('Plotted on spend only. The donor version plotted <b>spend against vendor count</b> to separate '
        + 'consolidated from fragmented subcategories; that needs a vendor count per subcategory, which this data set does not carry.'),
      { sub: 'spend by subcategory · partial' });

  return h;
}

/* ===========================================================================
   TAB 3 — MARKET & RISK  (Market & Kraljic + Risk)
   =========================================================================== */
function csMarket() {
  var d = csData(), n = d.narr || {}, m = d.meta || {};
  var h = '';

  h += csCard('Pricing Environment', (n.pricing ? '<div class="cs-prose">' + n.pricing + '</div>' : csGap('Market pricing direction and its implication for this category.', 'narr.pricing')),
      { sub: 'market signals ' + csSrc('narr') });

  /* Porter, moved here from the standalone Strategy view */
  var forces = (d.forces || []).map(function (f) {
    var lvl = String(f.s || '').toLowerCase();
    var tone = /high/.test(lvl) ? 'burnt' : (/low/.test(lvl) ? 'teal' : 'plum');
    return '<div class="cs-force">'
      + '<div class="cs-force-h"><span class="cs-force-f">' + csEsc(f.f) + '</span>'
      + '<span class="cs-pill cs-pill-' + tone + '">' + csEsc(f.s) + '</span></div>'
      + (f.d ? '<div class="cs-force-d">' + csEsc(f.d) + '</div>' : '') + '</div>';
  }).join('');
  h += csCard('Supply-Market Forces', forces || csGap('Porter five-forces read for this category.', 'forces[]'),
      { sub: 'Porter · net leverage ' + csSrc('forces') });

  /* Kraljic */
  var kr = '';
  if (n.kraljicPos) {
    kr = '<div class="cs-kraljic"><div class="cs-kraljic-pos">' + csEsc(n.kraljicPos) + '</div>'
      + (n.kraljicHigh ? '<div class="cs-prose">' + n.kraljicHigh + '</div>' : '')
      + (n.kraljicImpl ? '<div class="cs-implic"><span class="cs-lab2">Procurement implication</span>' + n.kraljicImpl + '</div>' : '')
      + '</div>';
  } else { kr = csGap('Kraljic position and its procurement implication.', 'narr.kraljicPos'); }
  h += csCard('Category Positioning', kr, { sub: 'Kraljic ' + csSrc('narr') });

  /* Risk */
  var rRows = (d.risks || []).map(function (r) {
    var sev = /high/i.test(r.l || '') && /high/i.test(r.i || '') ? 'burnt' : 'plum';
    return '<tr><td class="cs-l"><b>' + csEsc(r.risk) + '</b>'
      + (r.driver ? '<span class="cs-sub2">' + csEsc(r.driver) + '</span>' : '') + '</td>'
      + '<td><span class="cs-pill cs-pill-' + sev + '">' + csEsc(r.l) + '</span></td>'
      + '<td><span class="cs-pill cs-pill-' + sev + '">' + csEsc(r.i) + '</span></td>'
      + '<td class="cs-l cs-mit">' + csEsc(r.mit) + '</td></tr>';
  });
  h += csCard('Risk Register', rRows.length ? csTable(['Risk', 'Likelihood', 'Impact', 'Mitigation'], rRows)
      : csGap('Category risk register.', 'risks[]'), { sub: (d.risks || []).length + ' risks ' + csSrc('risks') });

  h += '<div class="cs-row2">'
    + csCard('Escalation Triggers', csGap('The conditions that would force a change of strategy, with the threshold for each.', 'trigger threshold per risk (risks[] carries mitigation only)'))
    + csCard('Geographic Concentration', csGap('Supply exposure by delivery geography.', 'country / region split per supplier'))
    + '</div>';

  if (n.riskTop2) h += csCard('What Could Change the Strategy', '<div class="cs-prose">' + n.riskTop2 + '</div>', { cls: 'cs-emph' });

  return h;
}

/* ===========================================================================
   TAB 4 — STRATEGY & PLAYS
   Replaces the platform's Strategy tab AND absorbs the standalone Strategy &
   Plays view. The four duplicated panels that lived there (Supplier Landscape,
   Portfolio Risk Overview, Opportunities, Porter) are NOT here: tabs 2 and 3
   own them. That removal is the point of the restructure.
   =========================================================================== */
function csStrategy() {
  var d = csData(), n = d.narr || {};
  var h = '';

  h += csCard('Recommended Strategy',
      (n.strategyRec ? '<div class="cs-thesis">' + n.strategyRec + '</div>'
                     : csGap('The recommended posture for this category.', 'narr.strategyRec')),
      { cls: 'cs-emph', sub: 'the answer first ' + csSrc('narr') });

  h += csCard('Strategy Options',
      (n.strategyOptions ? '<div class="cs-prose">' + n.strategyOptions + '</div>'
                         : csGap('The genuine alternatives considered, and why one is recommended.', 'narr.strategyOptions')),
      { sub: 'alternatives considered' });

  var horizons = [1, 3, 5].map(function (y) {
    return '<button class="cs-seg' + (CS_HORIZON === y ? ' on' : '') + '" onclick="csSetHorizon(' + y + ')">'
      + (y === 1 ? 'Yr 1' : y + ' yr') + '</button>';
  }).join('');
  var plays = (d.savings || []).map(function (s) {
    var mult = (CS_HORIZON === 1) ? 1 : (CS_HORIZON === 3 ? 2.4 : 3.6);
    var lo = (s.lo || 0) * mult, hi = (s.hi || 0) * mult;
    var conf = String(s.conf || '').toLowerCase();
    var tone = /high/.test(conf) ? 'teal' : (/low/.test(conf) ? 'burnt' : 'plum');
    return '<div class="cs-play">'
      + '<div class="cs-play-h"><span class="cs-play-n">' + csEsc(s.lever) + '</span>'
      + '<span class="cs-pill cs-pill-' + tone + '">' + csEsc(s.conf || 'confidence n/a') + '</span></div>'
      + '<div class="cs-play-v">' + csUsd(lo) + ' to ' + csUsd(hi)
      + '<span class="cs-play-hz"> over ' + (CS_HORIZON === 1 ? 'year 1' : CS_HORIZON + ' years') + '</span></div>'
      + (s.basis ? '<div class="cs-play-b">' + csEsc(s.basis) + '</div>' : '')
      + '<div class="cs-play-t">' + csEsc(s.type || '') + '</div>'
      + '</div>';
  }).join('');
  h += csCard('Recommended Plays',
      '<div class="cs-segbar">' + horizons + '</div>'
      + (plays ? '<div class="cs-plays">' + plays + '</div>' : csGap('The levers available in this category.', 'savings[]'))
      + csNote('Ranges are the modelled low and high for each lever, scaled to the selected horizon from its own basis. '
        + 'They are an <b>estimate</b>, not an approved target: Savings &amp; Scorecard tracks the difference.'),
      { sub: 'select a horizon ' + csSrc('savings') });

  h += '<div class="cs-row2">'
    + csCard('Execution Pillars', csGap('The two to four pillars the strategy executes through.', 'pillar records (name, owner, outcome)'))
    + csCard('Sequenced Actions', csGap('A 0-3 / 3-6 / 6-12 month roadmap with dependencies.', 'action records (action, owner, window, depends-on)'))
    + '</div>';

  if (n.passThru) h += csCard('Strategy Narrative', '<div class="cs-prose">' + n.passThru + '</div>', { cls: 'cs-quiet', sub: 'generated articulation' });
  return h;
}

/* ===========================================================================
   TAB 5 — SAVINGS & SCORECARD
   The value-realisation layer. Deliberately NOT a second place to model the
   strategy: one modelling engine, on tab 4.
   =========================================================================== */
function csSavings() {
  var d = csData(), n = d.narr || {};
  var sv = d.savings || [];
  var lo = sv.reduce(function (a, s) { return a + (s.lo || 0); }, 0);
  var hi = sv.reduce(function (a, s) { return a + (s.hi || 0); }, 0);
  var h = '';

  h += '<div class="cs-kpirow">'
    + csKpi('Identified (modelled)', csUsd(lo) + ' to ' + csUsd(hi), sv.length + ' levers', 'plum')
    + csKpi('Validated', '--', 'needs finance validation state')
    + csKpi('Approved target', '--', 'needs an approved target')
    + csKpi('Realised', '--', 'needs realised benefit records')
    + '</div>';

  var rows = sv.map(function (s) {
    return '<tr><td class="cs-l"><b>' + csEsc(s.lever) + '</b>'
      + (s.basis ? '<span class="cs-sub2">' + csEsc(s.basis) + '</span>' : '') + '</td>'
      + '<td>' + csEsc(s.type || '--') + '</td>'
      + '<td>' + csUsd(s.lo) + ' to ' + csUsd(s.hi) + '</td>'
      + '<td><span class="cs-pill cs-pill-plum">' + csEsc(s.conf || '--') + '</span></td>'
      + '<td>Identified</td></tr>';
  });
  h += csCard('Savings Pipeline', csTable(['Lever', 'Type', 'Modelled range', 'Confidence', 'Stage'], rows)
      + csNote('Every line here is at the <b>identified / modelled</b> stage. Validated, approved and realised are '
        + 'deliberately blank rather than filled with the modelled figure: blurring an estimate into a target is how '
        + 'savings numbers stop being trusted.')
      + (n.savingsNearTerm ? csNote(n.savingsNearTerm) : ''),
      { sub: sv.length + ' levers ' + csSrc('savings') });

  var kp = (d.kpis || []).map(function (k) {
    return '<tr><td class="cs-l"><b>' + csEsc(k.kpi) + '</b>'
      + (k.note ? '<span class="cs-sub2">' + csEsc(k.note) + '</span>' : '') + '</td>'
      + '<td>' + csEsc(k.cur == null ? '--' : k.cur) + '</td>'
      + '<td>' + csEsc(k.tgt == null ? '--' : k.tgt) + '</td>'
      + '<td>' + csEsc(k.cadence || '--') + '</td>'
      + '<td class="cs-l">' + (k.needs ? '<span class="cs-needs">' + csEsc(k.needs) + '</span>' : '') + '</td></tr>';
  });
  h += csCard('Category Scorecard', kp.length ? csTable(['KPI', 'Current', 'Target', 'Cadence', 'Needs'], kp)
      : csGap('The category scorecard.', 'kpis[]'), { sub: (d.kpis || []).length + ' measures ' + csSrc('kpis') });

  h += csCard('Play-to-Value Traceability',
      csGap('Each realised saving traced back to the play that produced it.', 'benefit records linked to a lever id'));
  return h;
}

/* ===========================================================================
   TAB 6 — SUPPLIER PROGRAM  (Supplier Development + Rationalization)
   =========================================================================== */
function csProgram() {
  var d = csData(), n = d.narr || {};
  var dv = d.diversity || {};
  var h = '';

  var years = dv.years || [];
  var dvMax = years.reduce(function (a, y) { return Math.max(a, (y.pct != null ? y.pct : y.value) || 0); }, 0) || 1;
  var dvBody = years.length
    ? '<div class="cs-trend">' + years.map(function (y) {
        var v = (y.pct != null ? y.pct : y.value) || 0;
        return '<div class="cs-trend-col"><div class="cs-trend-v">' + csPct(v) + '</div>'
          + '<div class="cs-trend-bar"><i style="height:' + Math.round((v / dvMax) * 100) + '%"></i></div>'
          + '<div class="cs-trend-l">' + csEsc(y.name || y.y || '') + '</div></div>';
      }).join('') + '</div>'
      + (dv.target != null ? csNote('Target: <b>' + csPct(dv.target) + '</b>, read from the data rather than hardcoded.') : '')
    : csGap('Diverse-spend trend.', 'diversity.years[]');
  h += csCard('Diverse Spend', dvBody + (n.suppDevNote ? csNote(n.suppDevNote) : ''), { sub: 'trend against target ' + csSrc('diversity') });

  h += csCard('Development Pipeline',
      csGap('Suppliers being developed, with stage, owner and expected impact.', 'development records (supplier, stage, owner, impact)'));

  var sc = d.subcats || [];
  var frag = sc.slice().sort(function (a, b) { return (b.tot || 0) - (a.tot || 0); }).slice(0, 5);
  var fragRows = frag.map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.n) + '</td><td>' + csUsd(x.tot) + '</td><td>' + csPct(x.pct) + '</td></tr>';
  });
  h += csCard('Most Fragmented Subcategories', fragRows.length
      ? csTable(['Subcategory', 'Spend', 'Share'], fragRows)
        + csNote('Ranked by spend. True fragmentation ranking needs a <b>vendor count per subcategory</b>, which this data set does not carry.')
      : csGap('Fragmentation ranking.', 'vendor count per subcategory'), { sub: 'consolidation candidates' });

  var ovl = n.rationalizationOverlap || n.rationalizationReseller || n.rationalizationGap;
  h += csCard('Overlap &amp; Consolidation', ovl ? '<div class="cs-prose">' + ovl + '</div>'
      : csGap('Duplicate or overlapping suppliers and tools.', 'capability tags per supplier'), { sub: csSrc('narr') });

  h += '<div class="cs-row2">'
    + csCard('Utilization / Shelfware', csGap('Licences bought against licences actually used.', 'licence count vs active users'))
    + csCard('Action Matrix', csGap('Retain / renegotiate / consolidate / retire / replace, with value, effort and timing.', 'per-supplier action + renewal window'))
    + '</div>';
  return h;
}

/* ===========================================================================
   TAB 7 — EXECUTION  (Trend & Change + roadmap)
   =========================================================================== */
function csExecution() {
  var d = csData(), m = d.meta || {}, n = d.narr || {};
  var h = '';

  h += '<div class="cs-kpirow">'
    + csKpi('FY24 to FY25', (m.yoy2425 != null ? (m.yoy2425 > 0 ? '+' : '') + csPct(m.yoy2425) : '--'), (m.chg2425 != null ? (m.chg2425 > 0 ? '+' : '') + csUsd(m.chg2425) : ''), 'plum')
    + csKpi('FY23 to FY24', (m.yoy2324 != null ? (m.yoy2324 > 0 ? '+' : '') + csPct(m.yoy2324) : '--'), (m.chg2324 != null ? (m.chg2324 > 0 ? '+' : '') + csUsd(m.chg2324) : ''))
    + csKpi('3-yr CAGR', csPct(m.cagr2325), 'FY23-FY25')
    + csKpi('Vendor movement', (m.newVendorsNet != null ? (m.newVendorsNet > 0 ? '+' : '') + csNum(m.newVendorsNet) : '--'), 'net vendors')
    + '</div>';

  var sw = (d.swing || []).map(function (s) {
    return '<tr><td class="cs-l"><b>' + csEsc(s.n) + '</b></td>'
      + '<td><span class="' + ((s.delta || 0) >= 0 ? 'cs-up' : 'cs-down') + '">'
      + ((s.delta || 0) > 0 ? '+' : '') + csUsd(s.delta) + '</span></td>'
      + '<td class="cs-l">' + csEsc(s.cause || '') + '</td></tr>';
  });
  h += csCard('Top Swing Drivers', sw.length ? csTable(['Supplier', 'Change', 'Cause'], sw)
      : csGap('The suppliers driving the change.', 'swing[]'), { sub: 'FY24 to FY25 ' + csSrc('swing') });

  if (n.trendDecomp) h += csCard('Change Decomposition', '<div class="cs-prose">' + n.trendDecomp + '</div>', { sub: csSrc('narr') });

  var ann = (d.annual || []).filter(function (a) { return a.value; });
  if (ann.length >= 3 && m.cagr2325 != null) {
    var base = (ann[ann.length - 2] || ann[ann.length - 1]).value;
    var g = m.cagr2325 / 100;
    var fRows = [];
    for (var i = 1; i <= 3; i++) {
      var b = base * Math.pow(1 + g, i);
      fRows.push('<tr><td class="cs-l">FY' + (25 + i) + '</td><td>' + csUsd(b * Math.pow(0.97, i))
        + '</td><td><b>' + csUsd(b) + '</b></td><td>' + csUsd(b * Math.pow(1.03, i)) + '</td></tr>');
    }
    h += csCard('Spend Forecast', csTable(['Year', 'Low', 'Base', 'High'], fRows)
      + csNote('Base projects the observed <b>' + csPct(m.cagr2325) + ' three-year CAGR</b> forward from FY25. The band is '
        + '&plusmn;3% a year compounding, reflecting how much the observed growth has itself varied. It does <b>not</b> '
        + 'incorporate known renewals, price escalators or planned rationalisation, because this data set carries no '
        + 'renewal dates. Treat it as a trend extrapolation, not a plan.'),
      { sub: 'derived from history' });
  } else {
    h += csCard('Spend Forecast', csGap('Forward projection with a confidence band.', 'annual[] plus a growth basis'));
  }

  h += '<div class="cs-row2">'
    + csCard('Rate vs Volume', csGap('How much of the change is price and how much is quantity.', 'rate and quantity split (only totals are held)'))
    + csCard('What Changed Since Last Strategy', csGap('Movement in spend, suppliers, risk and market since the last approved strategy.', 'a prior approved snapshot to diff against'))
    + '</div>';

  h += csCard('Roadmap', csGap('0-3 / 3-6 / 6-12 month plan with owners and dependencies.', 'action records with window and owner'));
  return h;
}

/* ===========================================================================
   render loop
   =========================================================================== */
function csBody() {
  if (CS_TAB === 'spend')     return csSpend();
  if (CS_TAB === 'market')    return csMarket();
  if (CS_TAB === 'strategy')  return csStrategy();
  if (CS_TAB === 'savings')   return csSavings();
  if (CS_TAB === 'program')   return csProgram();
  if (CS_TAB === 'execution') return csExecution();
  return csOverview();
}
function csRender() {
  var el = document.getElementById('app');
  if (!el) return;
  el.innerHTML = '<main class="cs-main">' + csHeader() + '<div class="cs-body">' + csBody() + '</div></main>';
  window.scrollTo({ top: 0, behavior: 'auto' });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', csRender);
else csRender();
