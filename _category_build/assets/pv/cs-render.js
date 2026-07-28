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
  var demo = CATEGORY_SEED.__demo
    ? '<div class="cs-demo">Illustrative data. Every figure on this page is invented for layout '
      + 'review and must not be quoted, exported or treated as fact.</div>' : '';
  return demo + '<div class="cs-head">'
    + '<div class="cs-eyebrow">Category Strategy</div>'
    + '<h1 class="cs-h1">' + csEsc(m.name || d.title || 'Category') + '</h1>'
    + '<div class="cs-sub">' + csEsc(m.cutoff || '') + (m.ytdNote ? ' · ' + csEsc(m.ytdNote) : '') + '</div>'
    + ((CATEGORY_SEED.categories || []).length > 1 ? '<div class="cs-cats">' + cats + '</div>' : '')
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
  var findings = n.findings ? csNarr(n.findings) : csGap('Key data-driven findings', 'narr.findings');
  h += csCard('Key Findings', findings, { sub: 'what a sourcing lead needs to know' });

  // gaps, stated
  h += '<div class="cs-row2">'
    + csCard('Spend Under Contract', d.contractCoverage ? csCoverage(d.contractCoverage)
        : csGap('Coverage of category spend under an active agreement, and the largest off-contract relationships.', 'contract coverage / agreement status per supplier'),
        d.contractCoverage ? { sub: csPct(d.contractCoverage.pct, 0) + ' of FY25 spend' } : null)
    + csCard('Renewal Exposure', d.renewals ? csRenewals(d.renewals)
        : csGap('Spend renewing in the next 12 months and the largest decision windows.', 'renewal + notice dates per agreement'),
        d.renewals ? { sub: 'next 12 months' } : null)
    + '</div>';

  // data quality, demoted
  h += csCard('Scope & Data Quality',
      '<div class="cs-dq">'
      + '<span class="cs-chip">Field completeness ' + csPct(m.fieldCompletenessPct, 0) + '</span>'
      + '<span class="cs-chip">Unclassified ' + csUsd(m.unclassified) + '</span>'
      + '<span class="cs-chip">' + csEsc(m.cutoff || '') + '</span>'
      + '</div>' + csNarrNote(n.dq), { cls: 'cs-quiet', sub: 'coverage and evidence' });

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
      + posture + csNarrNote(n.paretoNote), { sub: 'concentration and tiering · ' + csSrcText('pareto') });

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
  h += csCard('Tail Analysis', tailBody, { sub: 'consolidation candidates · ' + csSrcText('subcats') });

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
      { sub: (d.suppliers || []).length + ' ranked · ' + csSrcText('suppliers') });

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
      + csNarrNote(n.subcatLegend) + csNarrNote(n.subcatGap),
      { sub: sc.length + ' subcategories · ' + csSrcText('subcats') });

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

  h += csCard('Pricing Environment', (n.pricing ? csNarr(n.pricing) : csGap('Market pricing direction and its implication for this category.', 'narr.pricing')),
      { sub: 'market signals · ' + csSrcText('narr') });

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
      { sub: 'Porter · net leverage · ' + csSrcText('forces') });

  /* Kraljic */
  var kr = '';
  if (n.kraljicPos) {
    kr = '<div class="cs-kraljic"><div class="cs-kraljic-pos">' + csEsc(n.kraljicPos) + '</div>'
      + csNarr(n.kraljicHigh)
      + (n.kraljicImpl ? '<div class="cs-implic"><span class="cs-lab2">Procurement implication</span>' + csNarr(n.kraljicImpl) + '</div>' : '')
      + '</div>';
  } else { kr = csGap('Kraljic position and its procurement implication.', 'narr.kraljicPos'); }
  h += csCard('Category Positioning', kr, { sub: 'Kraljic · ' + csSrcText('narr') });

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
      : csGap('Category risk register.', 'risks[]'), { sub: (d.risks || []).length + ' risks · ' + csSrcText('risks') });

  h += '<div class="cs-row2">'
    + csCard('Escalation Triggers', d.triggers ? csTriggers(d.triggers)
        : csGap('The conditions that would force a change of strategy, with the threshold for each.', 'trigger threshold per risk (risks[] carries mitigation only)'),
        d.triggers ? { sub: d.triggers.length + ' triggers' } : null)
    + csCard('Geographic Concentration', d.geo ? csGeo(d.geo)
        : csGap('Supply exposure by delivery geography.', 'country / region split per supplier'),
        d.geo ? { sub: 'delivery geography' } : null)
    + '</div>';

  if (n.riskTop2) h += csCard('What Could Change the Strategy', csNarr(n.riskTop2), { cls: 'cs-emph' });

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
      (n.strategyRec ? '<div class="cs-thesis">' + csNarr(n.strategyRec) + '</div>'
                     : csGap('The recommended posture for this category.', 'narr.strategyRec')),
      { cls: 'cs-emph', sub: 'the answer first · ' + csSrcText('narr') });

  h += csCard('Strategy Options',
      (n.strategyOptions ? csNarr(n.strategyOptions)
                         : csGap('The genuine alternatives considered, and why one is recommended.', 'narr.strategyOptions')),
      { sub: 'alternatives considered' });

  var horizons = [1, 3, 5].map(function (y) {
    return '<button class="cs-seg' + (CS_HORIZON === y ? ' on' : '') + '" onclick="csSetHorizon(' + y + ')">'
      + (y === 1 ? 'Yr 1' : y + ' yr') + '</button>';
  }).join('');
  var plays = (d.savings || []).map(function (s) {
    var mult = (CS_HORIZON === 1) ? 1 : (CS_HORIZON === 3 ? 2.4 : 3.6);
    var lo = s.lo == null ? null : s.lo * mult, hi = s.hi == null ? null : s.hi * mult;
    var conf = String(s.conf || '').toLowerCase();
    var tone = /high/.test(conf) ? 'teal' : (/low/.test(conf) ? 'burnt' : 'plum');
    return '<div class="cs-play">'
      + '<div class="cs-play-h"><span class="cs-play-n">' + csEsc(s.lever) + '</span>'
      + '<span class="cs-pill cs-pill-' + tone + '">' + csEsc(s.conf || 'confidence n/a') + '</span></div>'
      + '<div class="cs-play-v">' + csRange(lo, hi)
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
      { sub: 'select a horizon · ' + csSrcText('savings') });

  h += '<div class="cs-row2">'
    + csCard('Execution Pillars', d.pillars ? csPillars(d.pillars)
        : csGap('The two to four pillars the strategy executes through.', 'pillar records (name, owner, outcome)'),
        d.pillars ? { sub: d.pillars.length + ' pillars' } : null)
    + csCard('Sequenced Actions', d.actions ? csActions(d.actions)
        : csGap('A 0-3 / 3-6 / 6-12 month roadmap with dependencies.', 'action records (action, owner, window, depends-on)'),
        d.actions ? { sub: d.actions.length + ' actions' } : null)
    + '</div>';

  if (n.passThru) h += csCard('Strategy Narrative', csNarr(n.passThru), { cls: 'cs-quiet', sub: 'generated articulation' });
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
      + '<td>' + csRange(s.lo, s.hi) + '</td>'
      + '<td><span class="cs-pill cs-pill-plum">' + csEsc(s.conf || '--') + '</span></td>'
      + '<td>Identified</td></tr>';
  });
  h += csCard('Savings Pipeline', csTable(['Lever', 'Type', 'Modelled range', 'Confidence', 'Stage'], rows)
      + csNote('Every line here is at the <b>identified / modelled</b> stage. Validated, approved and realised are '
        + 'deliberately blank rather than filled with the modelled figure: blurring an estimate into a target is how '
        + 'savings numbers stop being trusted.')
      + csNarrNote(n.savingsNearTerm),
      { sub: sv.length + ' levers · ' + csSrcText('savings') });

  var kp = (d.kpis || []).map(function (k) {
    return '<tr><td class="cs-l"><b>' + csEsc(k.kpi) + '</b>'
      + (k.note ? '<span class="cs-sub2">' + csEsc(k.note) + '</span>' : '') + '</td>'
      + '<td>' + csEsc(k.cur == null ? '--' : k.cur) + '</td>'
      + '<td>' + csEsc(k.tgt == null ? '--' : k.tgt) + '</td>'
      + '<td>' + csEsc(k.cadence || '--') + '</td>'
      + '<td class="cs-l">' + (k.needs ? '<span class="cs-needs">' + csEsc(k.needs) + '</span>' : '') + '</td></tr>';
  });
  h += csCard('Category Scorecard', kp.length ? csTable(['KPI', 'Current', 'Target', 'Cadence', 'Needs'], kp)
      : csGap('The category scorecard.', 'kpis[]'), { sub: (d.kpis || []).length + ' measures · ' + csSrcText('kpis') });

  h += csCard('Play-to-Value Traceability',
      d.benefits ? csBenefits(d.benefits)
        : csGap('Each realised saving traced back to the play that produced it.', 'benefit records linked to a lever id'),
      d.benefits ? { sub: 'traced to lever' } : null);
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
  h += csCard('Diverse Spend', dvBody + csNarrNote(n.suppDevNote), { sub: 'trend against target · ' + csSrcText('diversity') });

  h += csCard('Development Pipeline',
      d.development ? csDevelopment(d.development)
        : csGap('Suppliers being developed, with stage, owner and expected impact.', 'development records (supplier, stage, owner, impact)'),
      d.development ? { sub: d.development.length + ' in programme' } : null);

  var sc = d.subcats || [];
  var hasVc = sc.some(function (x) { return x.vc != null; });
  var frag = sc.slice().sort(function (a, b) {
    return hasVc ? (b.vc || 0) - (a.vc || 0) : (b.tot || 0) - (a.tot || 0);
  }).slice(0, 5);
  var vcMax = sc.reduce(function (a, x) { return Math.max(a, x.vc || 0); }, 0) || 1;
  var fragRows = frag.map(function (x) {
    return '<tr><td class="cs-l">' + csEsc(x.n) + '</td>'
      + (hasVc ? '<td class="cs-barcell">' + csBar((x.vc / vcMax) * 100, 'emph') + '</td>'
                 + '<td class="cs-num">' + csNum(x.vc) + '</td>'
                 + '<td class="cs-num">' + csUsd(Math.round((x.tot || 0) / (x.vc || 1))) + '</td>' : '')
      + '<td class="cs-num">' + csUsd(x.tot) + '</td><td class="cs-num">' + csPct(x.pct) + '</td></tr>';
  });
  h += csCard('Most Fragmented Subcategories', fragRows.length
      ? csTable(hasVc ? ['Subcategory', '', 'Vendors', 'Avg per vendor', 'Spend', 'Share']
                      : ['Subcategory', 'Spend', 'Share'], fragRows)
        + csNote(hasVc ? 'Ranked by vendor count, not spend. A large subcategory bought from few suppliers is not fragmented; a small one bought from a hundred is.'
                       : 'Ranked by spend. True fragmentation ranking needs a <b>vendor count per subcategory</b>, which this data set does not carry.')
      : csGap('Fragmentation ranking.', 'vendor count per subcategory'), { sub: 'consolidation candidates' });

  var ovl = n.rationalizationOverlap || n.rationalizationReseller || n.rationalizationGap;
  h += csCard('Overlap & Consolidation', ovl ? csNarr(ovl)
      : d.overlaps ? csOverlaps(d.overlaps)
      : csGap('Duplicate or overlapping suppliers and tools.', 'capability tags per supplier'),
      { sub: d.overlaps ? d.overlaps.length + ' overlapping capabilities' : csSrcText('narr') });

  h += '<div class="cs-row2">'
    + csCard('Utilization / Shelfware', d.utilization ? csUtilization(d.utilization)
        : csGap('Licences bought against licences actually used.', 'licence count vs active users'),
        d.utilization ? { sub: 'licences bought vs active' } : null)
    + csCard('Action Matrix', d.actionMatrix ? csActionMatrix(d.actionMatrix)
        : csGap('Retain / renegotiate / consolidate / retire / replace, with value, effort and timing.', 'per-supplier action + renewal window'),
        d.actionMatrix ? { sub: d.actionMatrix.length + ' suppliers dispositioned' } : null)
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
      : csGap('The suppliers driving the change.', 'swing[]'), { sub: 'FY24 to FY25 · ' + csSrcText('swing') });

  if (n.trendDecomp) h += csCard('Change Decomposition', csNarr(n.trendDecomp), { sub: csSrcText('narr') });

  var ann = (d.annual || []).filter(function (a) { return a.value; });
  // A bottom-up forecast, where one exists, beats extrapolating the CAGR.
  if (d.forecast) {
    h += csCard('Spend Forecast', csForecast(d.forecast), { sub: 'FY26 to FY28, bottom-up' });
  } else if (ann.length >= 3 && m.cagr2325 != null) {
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
    h += csCard('Spend Forecast',
      csGap('Forward projection with a confidence band.', 'annual[] plus a growth basis'));
  }

  h += '<div class="cs-row2">'
    + csCard('Rate vs Volume', d.rateVolume ? csRateVolume(d.rateVolume)
        : csGap('How much of the change is price and how much is quantity.', 'rate and quantity split (only totals are held)'),
        d.rateVolume ? { sub: 'FY24 to FY25 change decomposed' } : null)
    + csCard('What Changed Since Last Strategy', d.sinceLast ? csSinceLast(d.sinceLast)
        : csGap('Movement in spend, suppliers, risk and market since the last approved strategy.', 'a prior approved snapshot to diff against'),
        d.sinceLast ? { sub: d.sinceLast.asOf } : null)
    + '</div>';

  h += csCard('Roadmap', d.actions ? csRoadmap(d.actions)
      : csGap('0-3 / 3-6 / 6-12 month plan with owners and dependencies.', 'action records with window and owner'),
      d.actions ? { sub: '0-3 / 3-6 / 6-12 months' } : null);
  return h;
}


/* ===========================================================================
   POPULATED PANEL RENDERERS

   Each of these draws a structure the production seed does not carry. Every
   call site is guarded, so with the real seed the panel still states its gap.
   These exist so the layout can be reviewed fully populated.
   =========================================================================== */

/* Overview: spend under contract */
function csCoverage(c) {
  var rows = (c.off || []).map(function (o) {
    return '<tr><td class="cs-l">' + csEsc(o.n) + '</td>'
      + '<td class="cs-num">' + csUsd(o.v) + '</td>'
      + '<td class="cs-why">' + csEsc(o.why) + '</td></tr>';
  });
  return '<div class="cs-split2">'
      + '<div class="cs-stat"><div class="cs-stat-v">' + csPct(c.pct, 0) + '</div>'
        + '<div class="cs-stat-l">under contract</div>'
        + '<div class="cs-stat-s">' + csUsd(c.covered) + '</div></div>'
      + '<div class="cs-stat cs-stat-emph"><div class="cs-stat-v">' + csPct(100 - c.pct, 0) + '</div>'
        + '<div class="cs-stat-l">not under contract</div>'
        + '<div class="cs-stat-s">' + csUsd(c.uncovered) + '</div></div>'
    + '</div>'
    + csBar(c.pct, 'plum')
    + csLabel('Largest off-contract relationships')
    + csTable(['Relationship', 'FY25 spend', 'Why it is uncovered'], rows)
    + (c.note ? csNote(csEsc(c.note)) : '');
}

/* Overview: renewal exposure */
function csRenewals(r) {
  var max = (r.windows || []).reduce(function (a, w) { return Math.max(a, w.v || 0); }, 0) || 1;
  var rows = (r.windows || []).map(function (w) {
    return '<tr class="cs-st-' + csEsc(w.state || 'open') + '">'
      + '<td class="cs-l">' + csEsc(w.n) + (w.vehicle ? '<span class="cs-sub2">' + csEsc(w.vehicle) + '</span>' : '') + '</td>'
      + '<td class="cs-barcell">' + csBar((w.v / max) * 100, w.state === 'critical' ? 'emph' : 'teal') + '</td>'
      + '<td class="cs-num">' + csUsd(w.v) + '</td>'
      + '<td class="cs-num">' + csEsc(w.notice) + '</td>'
      + '<td class="cs-num">' + csEsc(w.expiry) + '</td></tr>';
  });
  return '<div class="cs-split2">'
      + '<div class="cs-stat"><div class="cs-stat-v">' + csUsd(r.next12m) + '</div>'
        + '<div class="cs-stat-l">renews within 12 months</div>'
        + '<div class="cs-stat-s">' + csPct(r.pctOfSpend, 0) + ' of FY25 spend</div></div>'
    + '</div>'
    + csTable(['Agreement', '', 'Value', 'Notice by', 'Expires'], rows);
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
