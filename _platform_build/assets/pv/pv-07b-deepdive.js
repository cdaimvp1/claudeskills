/* =============================================================================
   pv-07b-deepdive.js — Supplier Deep Dive v3 (6 visual subtabs on pvAssess)
   Supplier Summary (default) / Company & Ownership / Capabilities & Operations /
   Financial & Market / Risk & Resilience / Lilly Fit & Diligence.
   Each subtab leads with its dominant read; decision -> evidence -> materiality ->
   action; ~60% visual. Consumes pvAssess() (pv-07a) + the existing deepDive data.
   Loaded after pv-07a and pv-07 in the bundle.
   ============================================================================= */

// Platform card style (.sa-card > .card-hd > .scc-b), matching the rest of the dashboard (Marc: panels must match
// the platform). Accent normalized to the platform PANEL palette: PLUM/TEAL primary + BURNT-ORANGE (--emph)
// emphasis; the old per-panel navy/rainbow accents fold into this scheme. Per-supplier + functional-severity
// colours are handled separately inside each viz.
// Panel heading (Marc refs): LEFT plum accent bar + UPPERCASE letter-spaced title (style 1) + an ICON (style 2).
// Accent normalized to the platform palette (plum/teal primary + burnt-orange emphasis). Optional icon param
// (SVG path body); defaults to a grid glyph.
function pvDD2Card(title, inner, accent, sub, icon) {
  var a = String(accent || '');
  var ac = /emph|amber|orange|risk|red|A23A30|8A5A00|C15E19|D2691E/i.test(a) ? 'var(--emph,#C15E19)'
         : /teal|2F6E6B|1F7A5A/i.test(a) ? 'var(--teal-d,#2F6E6B)'
         : 'var(--plum,#5C2B50)';
  var ic = icon || '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>';
  return '<div class="sa-card">'
    + '<div class="card-hd" style="border-left:4px solid ' + ac + ';gap:9px">'
    + '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="' + ac + '" stroke-width="2" style="flex:none">' + ic + '</svg>'
    + '<span style="font:800 12px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--ink)">' + title + '</span>'
    + (sub ? '<span style="margin-left:auto;font-size:11px;font-weight:400;letter-spacing:0;text-transform:none;color:var(--mut2)">' + sub + '</span>' : '') + '</div>'
    + '<div class="scc-b">' + inner + '</div></div>';
}

function pvDD2Foot(t) { return '<div class="footbound" style="margin-top:9px">' + t + '</div>'; }

/* dimension lead band: concern pill + the grounded evidence sentence(s) */
function pvDD2DimLead(x, id) {
  var d = x.dimensions.find(function(v){ return v.id === id; });
  if (!d) return '';
  return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:10px">'
    + '<span style="font-size:13px;font-weight:700;color:var(--ink)">' + pvAEsc(d.label) + '</span>'
    + pvConcernPill(d.concern, d.confidence) + '</div>'
    + '<div style="font-size:12.5px;color:var(--mut);line-height:1.5">' + pvAEsc(d.evidence) + '</div>';
}

/* compact DE-CARDED assessment strip (Marc G3: the dimension lead should not be its own card): a slim plum-barred
   strip with the dimension label + concern pill + a one-line read, sitting on the page, not in a panel. */
function pvDD2AssessStrip(x, id) {
  var d = x.dimensions.find(function(v){ return v.id === id; });
  if (!d) return '';
  return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:0 0 14px;padding:9px 13px;background:var(--nested,#f1efec);border-left:3px solid var(--plum,#5C2B50);border-radius:8px">'
    + '<span style="font:800 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--ink)">' + pvAEsc(d.label) + '</span>'
    + pvConcernPill(d.concern, d.confidence)
    + '<span style="font-size:11.5px;color:var(--mut);line-height:1.4;flex:1;min-width:220px">' + pvAEsc(d.evidence) + '</span></div>';
}

function pvDD2KV(rows) {
  return rows.filter(function(r){ return r[1]; }).map(function(r){
    return '<div style="display:grid;grid-template-columns:158px 1fr;gap:14px;padding:8px 0;border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.55">'
      + '<span style="color:var(--mut2);font-weight:600">' + r[0] + '</span>'
      + '<span style="color:var(--ink)">' + pvAEsc(r[1]) + '</span></div>';
  }).join('');
}

/* status matrix (element / status / source) with evidence chips */
function pvDD2StatusMatrix(rows) {
  return '<div style="overflow-x:auto"><table class="pvdl" style="width:100%"><tbody>'
    + rows.map(function(r){
        return '<tr><td class="dt" style="white-space:nowrap;vertical-align:top">' + pvAEsc(r[0]) + '</td>'
          + '<td class="dd" style="vertical-align:top">' + pvEvidChip(r[1]) + '</td>'
          + '<td class="dd" style="vertical-align:top;color:var(--mut)">' + pvAEsc(r[2] || '') + '</td></tr>';
      }).join('')
    + '</tbody></table></div>';
}

/* ---------------------------------------------------------------- 0. SUMMARY */
function pvDD2Summary(x, a, cand, input) {
  var gates = x.gates.length ? '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' + x.gates.map(function(g){
      var hard = g.kind === 'hard';
      var c = hard ? '#A23A30' : '#8A5A00', bg = hard ? 'var(--ti-red,#FBE7E3)' : 'var(--ti-amber,#FBF1DA)';
      return '<span title="' + pvAEsc(g.why) + '" style="display:inline-flex;align-items:center;gap:6px;font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:4px 10px;border-radius:20px;color:' + c + ';background:' + bg + '">' + (hard ? 'HARD STOP' : 'ESCALATE') + ' &middot; ' + pvAEsc(g.label) + '</span>';
    }).join('') + '</div>' : '';
  return pvDD2Card('Assessment across eight dimensions',
        pvAssessBars(x.dimensions)
        + pvDD2Foot('Bar length reads favorability, colour reads concern, dots read evidence confidence. No blended score &mdash; a strong dimension never offsets a gate below.')
        + gates, 'var(--ai,#5C2B50)')
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start">'
    +   pvDD2Card('Requirements fit', pvReqGroupMini(x.reqGroups), 'var(--navy,#0F3A85)')
    +   pvDD2Card('Opportunities &amp; concerns', pvOppConcern(x.opportunities, x.concerns), 'var(--teal-d,#2F6E6B)')
    + '</div>'
    + pvDD2Card('Evidence coverage', pvEvidCoverageBar(x.evidenceCoverage)
        + pvDD2Foot('What the automated read actually knows versus what still needs a source. Missing is not the same as low risk.'), 'var(--mut2,#6a655f)');
}

/* ------------------------------------------------ 1. COMPANY & OWNERSHIP */
function pvDD2OwnTag(t){ return t === 'public' ? '#1F7A5A' : t === 'entity' ? '#0F3A85' : t === 'offering' ? '#2F6E6B' : 'var(--mut2,#6a655f)'; }

/* ownership tree: indented node cards with elbow connectors + a marker matrix */
function pvDD2OwnershipTree(ownership, a, cand) {
  var dd = (cand && cand.deepDive) || {}, idn = dd.identity || {};
  var nodes = (ownership && ownership.tree) || [
    {label:'Ultimate parent', value:/independent|no parent/i.test(idn.parent || '') ? 'None — independent' : (idn.parent || 'Not verified'), tag:'public'},
    {label:'Contracting entity', value:(idn.legal || (a && a.name) || ''), note:idn.ownership || '', tag:'entity'}
  ];
  return '<div>' + nodes.map(function(n, i){
      return '<div style="position:relative;margin-left:' + (i * 26) + 'px;margin-bottom:12px">'
        + (i > 0 ? '<span style="position:absolute;left:-16px;top:-12px;height:28px;width:0;border-left:2px solid var(--line)"></span><span style="position:absolute;left:-16px;top:16px;width:13px;height:0;border-top:2px solid var(--line)"></span>' : '')
        + '<div style="display:inline-block;background:var(--surface,#fff);border:1px solid var(--line);border-left:3px solid ' + pvDD2OwnTag(n.tag) + ';border-radius:9px;padding:8px 12px">'
        + '<div style="font:600 9.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2)">' + pvAEsc(n.label) + '</div>'
        + '<div style="font-size:13px;font-weight:700;color:var(--ink)">' + pvAEsc(n.value) + '</div>'
        + (n.note ? '<div style="font-size:11px;color:var(--mut)">' + pvAEsc(n.note) + '</div>' : '')
        + '</div></div>';
    }).join('') + '</div>';
}

function pvDD2Footprint(locations) {
  if (!locations || !locations.length) return '<div style="font-size:12px;color:var(--mut2)">No delivery-relevant locations on file.</div>';
  return '<div style="overflow-x:auto"><table class="pvdl"><tbody>' + locations.map(function(l){
      return '<tr><td class="dt" style="white-space:nowrap;vertical-align:top">' + pvAEsc(l.name) + '</td>'
        + '<td class="dd" style="vertical-align:top"><span style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:var(--teal-d,#2F6E6B);background:var(--teal-t,#DCEBE9);border-radius:20px;padding:2px 8px">' + pvAEsc(l.type) + '</span></td>'
        + '<td class="dd" style="vertical-align:top;color:var(--mut)">' + pvAEsc(l.region) + '</td>'
        + '<td class="dd" style="vertical-align:top">' + pvEvidChip(l.conf) + '</td></tr>';
    }).join('') + '</tbody></table></div>'
    + pvDD2Foot('Only delivery-relevant locations, not every registered office. A geographic map can follow where precise coordinates are sourced.');
}

function pvDD2Company(x, a, cand, input) {
  var dd = cand.deepDive || {}, idn = dd.identity || {}, comp = dd.company || {}, at = dd.attrs || {};
  var clean = function(v){ return v == null ? '' : String(v); };
  var beforeSemi = function(v){ v = clean(v); return v ? v.split(';')[0].trim() : ''; };
  var beforeParen = function(v){ v = clean(v); return v ? v.split('(')[0].trim() : ''; };
  var stripHQ = function(v){ v = clean(v); return v ? v.replace(/^Legal HQ[^;]*;\s*/i, '').trim() : ''; };
  var markerRows = (x.ownership && x.ownership.markers) || [
    ['Legal entity', idn.legal ? 'Verified' : 'Missing', 'Public filings'],
    ['Ultimate parent', /independent|public/i.test(idn.parent || '') ? 'Verified' : 'Partial', 'Public filings'],
    ['Beneficial ownership', /public/i.test(idn.ownership || '') ? 'Verified' : 'Missing', /public/i.test(idn.ownership || '') ? 'Widely held (UBO n/a)' : 'UBO verification required'],
    ['Lilly vendor-master match', 'Missing', 'Not checked'],
    ['Contracting entity confirmed', 'Supplier asserted', 'Confirm in RFx']
  ];
  var scale = pvDD2KV([
    ['Legal entity', idn.legal],
    ['Ownership / structure', idn.parent || idn.ownership],
    ['Incorporation', beforeParen(idn.jurisdiction)],
    ['Corporate address (HQ)', beforeSemi(at.hq) || beforeSemi(comp.footprint)],
    ['Footprint', stripHQ(comp.footprint)],
    ['Founded', comp.founded || at.founded],
    ['Leadership', comp.leadership],
    ['Headcount', comp.headcount]
  ]);
  return pvDD2AssessStrip(x, 'identity')
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start">'
    +   pvDD2Card('Ownership &amp; control', pvDD2OwnershipTree(x.ownership, a, cand) + pvDD2Foot('Lilly contracts an <b>entity</b>, evaluates an <b>offering</b>, and depends on specific <b>services</b> &mdash; three different things.'), 'var(--navy,#0F3A85)')
    +   pvDD2Card('Identity verification', pvDD2StatusMatrix(markerRows), 'var(--teal-d,#2F6E6B)')
    + '</div>'
    + pvDD2Card('Operating footprint', pvDD2Footprint(x.locations), 'var(--ai,#5C2B50)')
    + pvDD2Card('Firmographics', scale, 'var(--mut2,#6a655f)');
}

/* --------------------------------------------- 2. CAPABILITIES & OPERATIONS */
function pvDD2CapCell(s) {
  return s === 'Confirmed' ? {c:'#0F3A85', bg:'var(--ti-blue,#E4EBF1)', t:'Confirmed'}
    : s === 'Partially confirmed' ? {c:'#2F6E6B', bg:'#DCEBE9', t:'Partial'}
    : s === 'Supplier asserted' ? {c:'#8A5A00', bg:'var(--ti-amber,#FBF1DA)', t:'Asserted'}
    : s === 'Not demonstrated' ? {c:'#A23A30', bg:'var(--ti-red,#FBE7E3)', t:'Not dem.'}
    : s === 'Gap' ? {c:'#A23A30', bg:'var(--ti-red,#FBE7E3)', t:'Gap'}
    : {c:'var(--mut2,#6a655f)', bg:'var(--nested,#f1efec)', t:'N/A'};
}
/* capability-to-requirement heatmap (evidence-based cells, replaces keyword mapping) */
function pvDD2CapHeatmap(capabilities) {
  if (!capabilities || !capabilities.rows) return '<div style="font-size:12px;color:var(--mut2)">No validated capability map on file.</div>';
  var head = '<tr><th></th>' + capabilities.cols.map(function(c){ return '<th style="font:700 9px var(--mono,monospace);text-transform:uppercase;color:var(--mut2);padding:4px 5px;text-align:center">' + pvAEsc(c) + '</th>'; }).join('') + '</tr>';
  var rows = capabilities.rows.map(function(r){
    return '<tr><td style="font-size:12px;font-weight:600;color:var(--ink);padding:5px 8px 5px 0;white-space:nowrap">' + pvAEsc(r.cap) + '</td>'
      + r.cells.map(function(s){ var m = pvDD2CapCell(s); return '<td style="padding:3px"><div title="' + pvAEsc(s) + '" style="font:700 8.5px var(--mono,monospace);text-transform:uppercase;color:' + m.c + ';background:' + m.bg + ';border-radius:6px;padding:5px 3px;text-align:center;line-height:1.1">' + m.t + '</div></td>'; }).join('')
      + '</tr>';
  }).join('');
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>'
    + pvDD2Foot('Each cell is an evidence read, not a keyword match. Confirmed / Partial / Asserted / Not demonstrated / Gap / N-A &mdash; click-through evidence to follow.');
}
function pvDD2RefTick(v) {
  return v === true ? '<span style="color:#1F7A5A;font-weight:800">&#10003;</span>'
    : v === 'partial' ? '<span style="color:#8A5A00;font-weight:700">~</span>'
    : '<span style="color:var(--mut2,#6a655f)">&mdash;</span>';
}
function pvDD2RefMatrix(refs) {
  if (!refs || !refs.length) return '';
  var cols = ['Pharma', 'Similar scale', 'Similar use case', 'Independently verified'];
  var head = '<tr><th style="text-align:left;font-size:11px;color:var(--mut2);padding-bottom:4px">Reference</th>' + cols.map(function(c){ return '<th style="font-size:10px;color:var(--mut2);padding:0 8px 4px;text-align:center">' + c + '</th>'; }).join('') + '</tr>';
  var rows = refs.map(function(r){ return '<tr style="border-top:1px solid var(--line)"><td style="font-size:12px;font-weight:600;color:var(--ink);padding:6px 8px 6px 0">' + pvAEsc(r.name) + '</td><td style="text-align:center">' + pvDD2RefTick(r.pharma) + '</td><td style="text-align:center">' + pvDD2RefTick(r.scale) + '</td><td style="text-align:center">' + pvDD2RefTick(r.useCase) + '</td><td style="text-align:center">' + pvDD2RefTick(r.verified) + '</td></tr>'; }).join('');
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>'
    + pvDD2Foot('Stops "has major customers" counting as validated evidence &mdash; a reference matters only if it is pharma, similar scale, similar use case, and independently verified.');
}
function pvDD2Caps(x, a, cand, input) {
  var dd = cand.deepDive || {}, idn = dd.identity || {};
  var offs = (dd.offerings || []).map(function(o){
    return '<tr><td class="dt" style="white-space:nowrap;vertical-align:top">' + pvAEsc(o.name) + '</td><td class="dd">' + pvAEsc(o.note || '') + '</td></tr>';
  }).join('');
  var offTable = offs ? '<div style="overflow-x:auto"><table class="pvdl"><tbody>' + offs + '</tbody></table></div>' : '<div style="font-size:12px;color:var(--mut2)">No offerings on file.</div>';
  var refCard = x.references ? pvDD2Card('Reference relevance', pvDD2RefMatrix(x.references), 'var(--ai,#5C2B50)')
    : (dd.clients ? pvDD2Card('Reference customers', '<div style="font-size:12.5px;color:var(--ink);line-height:1.55">' + pvAEsc(dd.clients) + '</div>', 'var(--mut2,#6a655f)') : '');
  return pvDD2AssessStrip(x, 'capability')
    + pvDD2Card('Capability to requirement', pvDD2CapHeatmap(x.capabilities), 'var(--navy,#0F3A85)')
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start">'
    +   pvDD2Card('Offering &amp; delivery', (idn.delivery ? '<div style="font-size:12.5px;margin-bottom:10px"><b style="color:var(--mut2)">Delivery model &middot;</b> ' + pvAEsc(idn.delivery) + '</div>' : '') + offTable, 'var(--teal-d,#2F6E6B)')
    +   pvDD2Card('Fit to requirements', pvReqGroupMini(x.reqGroups), 'var(--amber-d,#8A5A00)')
    + '</div>'
    + refCard;
}

/* ------------------------------------------------ 3. FINANCIAL & MARKET */
/* peer-position scatter: every eligible candidate by financial viability (x) and
   capability fit (y); selected supplier highlighted. Both axes from the shared model. */
function pvDD2PeerScatter(refl, input, selId) {
  var asmts = (refl && refl.landscape && refl.landscape.assessments) || [];
  if (asmts.length < 2 || typeof pvCandById !== 'function') return '';
  var W = 520, H = 300, padL = 46, padB = 40, padT = 14, padR = 16;
  var plotW = W - padL - padR, plotH = H - padT - padB;
  var sx = function(v){ return padL + (v / 5) * plotW; };
  var sy = function(v){ return padT + plotH - (v / 5) * plotH; };
  var grid = '';
  for (var g = 1; g < 5; g++) grid += '<line x1="' + sx(g) + '" y1="' + padT + '" x2="' + sx(g) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/><line x1="' + padL + '" y1="' + sy(g) + '" x2="' + (padL + plotW) + '" y2="' + sy(g) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/>';
  var dots = asmts.map(function(av){
    var pv = pvAssess(av, pvCandById(av.id), input);
    var finDim = pv.dimensions.find(function(d){ return d.id === 'financial'; }) || {};
    var fav = (THEO_CONCERN[finDim.concern] || {fav:0.5}).fav;
    var x = sx(fav * 5), y = sy(pv.fit.score5 || 0), sel = av.id === selId;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (sel ? 7 : 5) + '" fill="' + (sel ? '#A23A30' : '#0F3A85') + '" opacity="' + (av.eligible ? 0.9 : 0.35) + '"/><text x="' + (x + 8) + '" y="' + (y + 3) + '" font-family="var(--mono,monospace)" font-size="9" fill="' + (sel ? '#A23A30' : 'var(--mut,#4A443C)') + '">' + pvAEsc((av.name || '').split(/[ ,]/)[0]) + '</text>';
  }).join('');
  return '<div style="overflow-x:auto"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px;height:auto">'
    + grid
    + '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (padL + plotW) + '" y2="' + (padT + plotH) + '" stroke="var(--line2)" stroke-width="1"/><line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH) + '" stroke="var(--line2)" stroke-width="1"/>'
    + '<text x="' + (padL + plotW / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="var(--mut2)">Financial viability &rarr;</text>'
    + '<text x="13" y="' + (padT + plotH / 2) + '" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="var(--mut2)" transform="rotate(-90 13 ' + (padT + plotH / 2) + ')">Capability fit &rarr;</text>'
    + dots + '</svg></div>'
    + pvDD2Foot('Each supplier plotted by financial viability (x) and capability fit (y); the selected supplier is highlighted. Surfaces strong-capability / weak-financial vs. balanced candidates.');
}
function pvDD2VarColor(v){ return /high|significant|exposure/i.test(v) ? '#A23A30' : /moderate/i.test(v) ? '#8A5A00' : '#0F3A85'; }
function pvDD2CommercialDrivers(drivers) {
  if (!drivers || !drivers.length) return '';
  var w = function(v){ return /high|significant/i.test(v) ? 92 : /exposure/i.test(v) ? 68 : /moderate/i.test(v) ? 52 : 28; };
  return '<div style="display:flex;flex-direction:column;gap:8px">' + drivers.map(function(d){
      var c = pvDD2VarColor(d.variability);
      return '<div style="display:grid;grid-template-columns:150px 1fr 160px;gap:12px;align-items:center" title="' + pvAEsc(d.note || '') + '"><span style="font-size:12px;font-weight:600;color:var(--ink)">' + pvAEsc(d.driver) + '</span><div style="height:8px;border-radius:30px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:' + w(d.variability) + '%;background:' + c + '"></i></div><span style="font-size:11px;color:' + c + ';font-weight:600">' + pvAEsc(d.variability) + '</span></div>';
    }).join('') + '</div>' + pvDD2Foot('Cost-driver variability, not a fabricated annual $ &mdash; precise TCO comes from RFx bids and internal usage assumptions.');
}
function pvDD2FinMkt(x, a, cand, input, refl) {
  var dd = cand.deepDive || {}, fin = cand.financials || dd.financials || {}, at = dd.attrs || {};
  var finRow = function(k, v){ v = v == null ? '' : String(v); return v ? '<tr><td class="dt" style="white-space:nowrap;vertical-align:top">' + pvAEsc(k) + '</td><td class="dd">' + pvAEsc(v) + '</td></tr>' : ''; };
  var summary = '<div style="overflow-x:auto"><table class="pvdl"><tbody>'
    + finRow('Latest revenue', fin.latestRevenue || fin.revenue)
    + finRow('Revenue growth', fin.growth)
    + finRow('Product revenue / ARR', fin.arr)
    + finRow('Net income / cash flow', fin.margin)
    + finRow('Profitability', fin.profitability)
    + finRow('Market capitalization', fin.valuationOrMarketCap || fin.cash)
    + finRow('Forward guidance', fin.guidance)
    + '</tbody></table></div>';
  var revSvg = (typeof pvRevHistSvg === 'function' && fin.revenueHistory) ? pvRevHistSvg(fin.revenueHistory) : '';
  var mkt = at.gartner ? '<div style="font-size:12.5px;line-height:1.55"><b style="color:var(--mut2)">Analyst position &middot;</b> ' + pvAEsc(at.gartner) + '</div>' : '<div style="font-size:12px;color:var(--mut2)">No analyst position on file.</div>';
  var scatter = pvDD2PeerScatter(refl, input, a && a.id);
  return pvDD2AssessStrip(x, 'financial')
    + (scatter ? pvDD2Card('Peer position', scatter, 'var(--navy,#0F3A85)') : '')
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start">'
    +   pvDD2Card('Financial viability', summary + (fin.sources && fin.sources.length ? pvDD2Foot('<b>Sources.</b> ' + fin.sources.map(function(s){return pvAEsc(s);}).join(' &middot; ')) : ''), 'var(--teal-d,#2F6E6B)')
    +   (revSvg ? pvDD2Card('Revenue history', '<div>' + revSvg + '</div>' + pvDD2Foot('Trend shown only where multiple comparable periods exist.'), 'var(--amber-d,#8A5A00)') : '')
    + '</div>'
    + (x.commercialDrivers ? pvDD2Card('Commercial model', pvDD2CommercialDrivers(x.commercialDrivers), 'var(--ai,#5C2B50)') : '')
    + pvDD2Card('Market position', mkt, 'var(--mut2,#6a655f)');
}

/* ------------------------------------------------ 4. RISK & RESILIENCE */
var PVDD2_LVL = {Low:1, Medium:2, High:3};
function pvDD2ImpColor(imp){ return imp === 'High' ? '#A23A30' : imp === 'Medium' ? '#8A5A00' : '#0F3A85'; }

/* impact x likelihood matrix: 3x3 grid, risks placed in their cell as chips; gate
   risks get a ring, colour = impact, zone tint = combined severity. */
function pvDD2RiskMatrix(risks) {
  if (!risks || !risks.length) return '<div style="font-size:12px;color:var(--mut2)">No plotted risks on file.</div>';
  var byCell = {};
  risks.forEach(function(rk){ var k = rk.impact + '|' + rk.likelihood; (byCell[k] = byCell[k] || []).push(rk); });
  var impacts = ['High','Medium','Low'], likes = ['Low','Medium','High'];
  var zoneBg = function(imp, lk){ var s = (PVDD2_LVL[imp] || 1) + (PVDD2_LVL[lk] || 1); return s >= 5 ? 'var(--ti-red,#FBE7E3)' : s >= 4 ? 'var(--ti-amber,#FBF1DA)' : 'var(--ti-blue,#E4EBF1)'; };
  var rows = impacts.map(function(imp){
    var cells = likes.map(function(lk){
      var items = (byCell[imp + '|' + lk] || []).map(function(rk){
        return '<div title="' + pvAEsc(rk.type + ' · ' + rk.mitigation) + '" style="display:flex;align-items:center;gap:5px;font-size:10px;line-height:1.2;padding:3px 6px;border-radius:6px;background:var(--surface,#fff);border:1px solid ' + pvDD2ImpColor(imp) + (rk.gate ? ';box-shadow:0 0 0 2px ' + pvDD2ImpColor(imp) + '33' : '') + '"><span style="width:7px;height:7px;border-radius:50%;background:' + pvDD2ImpColor(imp) + ';flex:none"></span><span>' + pvAEsc(rk.label) + (rk.gate ? ' <b style="font:700 7px var(--mono,monospace);color:' + pvDD2ImpColor(imp) + '">GATE</b>' : '') + '</span></div>';
      }).join('');
      return '<div style="min-height:56px;background:' + zoneBg(imp, lk) + ';border:1px solid var(--line);border-radius:8px;padding:5px;display:flex;flex-direction:column;gap:4px">' + items + '</div>';
    }).join('');
    return '<div style="font:700 10px var(--mono,monospace);color:' + pvDD2ImpColor(imp) + ';text-transform:uppercase;display:flex;align-items:center;justify-content:flex-end;padding-right:8px">' + imp + '</div>' + cells;
  }).join('');
  var xlabels = '<div></div>' + likes.map(function(lk){ return '<div style="font:700 10px var(--mono,monospace);color:var(--mut2);text-align:center;padding-top:6px;text-transform:uppercase">' + lk + '</div>'; }).join('');
  return '<div style="max-width:560px"><div style="display:grid;grid-template-columns:58px 1fr 1fr 1fr;gap:6px">' + rows + xlabels + '</div>'
    + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mut2);margin-top:5px"><span>Impact &darr; (rows)</span><span>Likelihood &rarr; (columns)</span></div></div>';
}

/* material-events timeline with directness classification */
function pvDD2EventTimeline(events) {
  if (!events || !events.length) return '';
  var dcol = function(d){ return /service/i.test(d) ? '#A23A30' : /division/i.test(d) ? '#8A5A00' : '#8FA3BE'; };
  return '<div style="position:relative;padding-left:6px">'
    + '<div style="position:absolute;left:4px;top:5px;bottom:5px;width:2px;background:var(--line)"></div>'
    + events.map(function(ev){
        return '<div style="position:relative;padding:0 0 15px 18px">'
          + '<span style="position:absolute;left:-1px;top:3px;width:10px;height:10px;border-radius:50%;background:' + dcol(ev.directness) + ';border:2px solid var(--surface,#fff)"></span>'
          + '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:baseline"><span style="font-family:var(--mono,monospace);font-size:10px;color:var(--mut2)">' + pvAEsc(ev.date || '') + '</span><b style="font-size:12.5px;color:var(--ink)">' + pvAEsc(ev.title || '') + '</b><span style="font:700 8px var(--mono,monospace);text-transform:uppercase;color:' + dcol(ev.directness) + ';border:1px solid ' + dcol(ev.directness) + ';border-radius:20px;padding:1px 7px">' + pvAEsc(ev.directness || '') + '</span></div>'
          + (ev.detail ? '<div style="font-size:11.5px;color:var(--mut);line-height:1.5;margin-top:3px">' + pvAEsc(ev.detail) + '</div>' : '')
          + (ev.resolution ? '<div style="font-size:11px;color:var(--mut2);margin-top:2px"><b>Resolution &middot;</b> ' + pvAEsc(ev.resolution) + '</div>' : '')
          + '</div>';
      }).join('') + '</div>';
}

function pvDD2Risk(x, a, cand, input) {
  var riskDims = x.dimensions.filter(function(d){ return ['financial','resilience','integrity','quality','cyber','responsible'].indexOf(d.id) >= 0; });
  var cells = '<div style="display:flex;flex-direction:column;gap:9px">' + riskDims.map(function(d){
      return '<div style="display:grid;grid-template-columns:200px 1fr;gap:12px;align-items:start;padding:7px 0;border-bottom:1px solid var(--line)">'
        + '<span style="font-size:12.5px;font-weight:600;color:var(--ink)">' + pvAEsc(d.label) + '</span>'
        + '<div><div style="margin-bottom:4px">' + pvConcernPill(d.concern, d.confidence) + '</div><div style="font-size:11.5px;color:var(--mut);line-height:1.45">' + pvAEsc(d.evidence) + '</div></div></div>';
    }).join('') + '</div>';
  var mitig = (x.risks || []).map(function(rk){
      return '<tr><td class="dt" style="vertical-align:top;white-space:nowrap">' + pvAEsc(rk.label) + '</td>'
        + '<td class="dd" style="vertical-align:top;color:var(--mut2);white-space:nowrap">' + pvAEsc(rk.type) + '</td>'
        + '<td class="dd" style="vertical-align:top">' + pvAEsc(rk.mitigation) + '</td>'
        + '<td class="dd" style="vertical-align:top;white-space:nowrap">' + (rk.gate ? '<b style="color:#8A5A00">Gate</b>' : 'Monitor') + '</td></tr>';
    }).join('');
  return pvDD2Card('Risk &amp; resilience', '<div style="font-size:12.5px;color:var(--mut);line-height:1.55">What could prevent successful performance, and how Lilly should respond. A hard flag disqualifies; a critical single risk overrides the average &mdash; no risk is averaged away.</div>', 'var(--riskred,#A23A30)')
    + pvDD2Card('Impact &times; likelihood', pvDD2RiskMatrix(x.risks) + pvDD2Foot('Each risk placed by impact (rows) and likelihood (columns); a ring marks a sourcing gate. Hover a chip for its type and mitigation.'), '#A23A30')
    + pvDD2Card('Risk posture by dimension', cells, 'var(--navy,#0F3A85)')
    + (x.events && x.events.length ? pvDD2Card('Material events', pvDD2EventTimeline(x.events), 'var(--teal-d,#2F6E6B)') : '')
    + (mitig ? pvDD2Card('Mitigation board', '<div style="overflow-x:auto"><table class="pvdl"><tbody>' + mitig + '</tbody></table></div>', 'var(--amber-d,#8A5A00)') : '');
}

/* ------------------------------------------------ 5. LILLY FIT & DILIGENCE */
function pvDD2DiligenceFunnel(stages) {
  if (!stages || !stages.length) return '';
  return '<div style="display:flex;flex-direction:column;gap:7px">' + stages.map(function(s){
      var c = s.pct >= 75 ? '#1F7A5A' : s.pct >= 40 ? '#2E5E8C' : s.pct > 0 ? '#8A5A00' : 'var(--mut2,#6a655f)';
      return '<div style="display:grid;grid-template-columns:200px 1fr 40px;gap:12px;align-items:center"><span style="font-size:12px;color:var(--ink)">' + pvAEsc(s.stage) + '</span><div style="height:9px;border-radius:30px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:' + s.pct + '%;background:' + c + '"></i></div><span style="font-family:var(--mono,monospace);font-size:11px;font-weight:700;color:' + c + ';text-align:right">' + s.pct + '%</span></div>';
    }).join('') + '</div>' + pvDD2Foot('Progress toward advancement, not a wall of open questions.');
}
function pvDD2ActionBoard(actions) {
  if (!actions || !actions.length) return '';
  var rows = actions.map(function(act){
      var sc = act.status === 'Open' ? '#8A5A00' : act.status === 'Not started' ? '#A23A30' : '#1F7A5A';
      return '<tr><td class="dt" style="vertical-align:top">' + pvAEsc(act.action) + '</td><td class="dd" style="vertical-align:top;white-space:nowrap;color:var(--mut2)">' + pvAEsc(act.owner) + '</td><td class="dd" style="vertical-align:top;text-align:center">' + (act.gate ? '<b style="color:#8A5A00">Yes</b>' : '&mdash;') + '</td><td class="dd" style="vertical-align:top;white-space:nowrap;color:' + sc + ';font-weight:600">' + pvAEsc(act.status) + '</td></tr>';
    }).join('');
  return '<div style="overflow-x:auto"><table class="pvdl"><thead><tr><th style="text-align:left;font-size:10px;color:var(--mut2)">Action</th><th style="text-align:left;font-size:10px;color:var(--mut2)">Owner</th><th style="font-size:10px;color:var(--mut2)">Gate?</th><th style="text-align:left;font-size:10px;color:var(--mut2)">Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}
function pvDD2Lilly(x, a, cand, input) {
  var dd = cand.deepDive || {}, lf = dd.lillyFit || {};
  var fitRows = pvDD2KV([
    ['Relationship', lf.relation],
    ['Strategic fit', lf.strategic],
    ['Pharma / GxP', lf.pharma],
    ['Value / next move', lf.value]
  ]);
  var funnel = pvDD2DiligenceFunnel(x.diligence);
  var board = pvDD2ActionBoard(x.actions);
  var oqFallback = '';
  if (!board) {
    var oq = (typeof pvOpenQuestionsList === 'function') ? pvOpenQuestionsList(a, cand, input, (typeof pvReqFitRead === 'function' ? pvReqFitRead(a, cand, input) : null)) : [];
    oqFallback = (oq && oq.length)
      ? '<ol style="margin:0;padding-left:20px;font-size:12.5px;line-height:1.6">' + oq.map(function(q){ return '<li>' + (q.plain ? pvAEsc((typeof pvStripTags === 'function' ? pvStripTags(q.plain) : q.plain)) : pvAEsc(q.tag || '')) + '</li>'; }).join('') + '</ol>'
      : '<div style="font-size:12px;color:var(--mut2)">No open items derived; standard pre-award confirmations still apply.</div>';
  }
  return pvDD2AssessStrip(x, 'capability')
    + pvDD2Card('Lilly-specific fit', fitRows || '<div style="font-size:12px;color:var(--mut2)">No Lilly-fit read on file.</div>', 'var(--ai,#5C2B50)')
    + (funnel ? pvDD2Card('Diligence funnel', funnel, 'var(--navy,#0F3A85)') : pvDD2Card('Required diligence before advancement', oqFallback + pvDD2Foot('The companion outreach skill turns these into supplier requests; responses (M365) flow back to re-enrich.'), 'var(--navy,#0F3A85)'))
    + (board ? pvDD2Card('Action board', board + pvDD2Foot('Diligence turned into a workplan; gated actions must clear before advancement.'), 'var(--amber-d,#8A5A00)') : '');
}

/* ------------------------------------------------ dispatch */
var PVDD2_TABS = [
  ['summary', 'Supplier Summary'],
  ['company', 'Company & Ownership'],
  ['caps',    'Capabilities & Operations'],
  ['finmkt',  'Financial & Market'],
  ['risk',    'Risk & Resilience'],
  ['lilly',   'Lilly Fit & Diligence']
];

/* =============================================================================
   TOP-LEVEL RISK ASSESSMENT (v3) — pvRiskHtml2, replaces pvRiskHtml on the spine.
   Portfolio summary -> semantic cross-supplier heatmap (level + confidence, gates
   override the average) -> coverage callout for unassessed dims -> selected-supplier
   material risks + disposition + event timeline (directness) + mitigation board.
   ============================================================================= */
var PVR2_RISK_DIMS = [
  ['financial', 'Financial viability'], ['resilience', 'Operational resilience'],
  ['cyber', 'Cyber & privacy'], ['integrity', 'Integrity & compliance'],
  ['quality', 'Quality & regulatory'], ['responsible', 'Responsible sourcing']
];
function pvR2ConcernToRisk(c){ return c === 'Insufficient evidence' ? 'Unknown' : c === 'Strong' ? 'Low' : c; }
function pvR2Cell(level, confidence) {
  var m = THEO_RISKBAND[level] || THEO_RISKBAND['Unknown'];
  var ab = level === 'Unknown' ? '?' : level.charAt(0);
  return '<div title="' + pvAEsc(level + ' · confidence ' + (confidence || 'n/a')) + '" style="display:flex;align-items:center;justify-content:center;gap:5px;background:' + m.bg + ';border-radius:7px;padding:6px 4px"><span style="font:800 12px var(--mono,monospace);color:' + m.c + '">' + ab + '</span>' + (confidence ? '<span style="display:inline-flex;gap:1.5px">' + (function(){ var n = confidence === 'High' ? 3 : confidence === 'Medium' ? 2 : 1, s = ''; for (var i = 0; i < 3; i++) s += '<i style="width:3px;height:3px;border-radius:50%;background:' + (i < n ? m.c : 'var(--line2,#CECCC7)') + '"></i>'; return s; })() + '</span>' : '') + '</div>';
}
function pvR2Disposition(x) {
  if (x.gates.some(function(g){ return g.kind === 'hard'; })) return {l:'Hard stop', c:'#A23A30'};
  if (x.gates.length) return {l:'Escalate', c:'#8A5A00'};
  if (x.risk.level === 'High' || x.risk.level === 'Critical') return {l:'Mitigate', c:'#8A5A00'};
  if (x.risk.level === 'Unknown') return {l:'Evidence required', c:'var(--mut2,#6a655f)'};
  return {l:'Accept / monitor', c:'#1F7A5A'};
}
function pvRiskHtml2(refl) {
  var input = (typeof PVSL_INPUT !== 'undefined' && PVSL_INPUT) || {};
  var L = (refl && refl.landscape) || {};
  var asmts = (L.assessments || []).slice().sort(function(p, q){ if (p.eligible !== q.eligible) return p.eligible ? -1 : 1; return (p.riskScore || 0) - (q.riskScore || 0); });
  if (!asmts.length || typeof pvCandById !== 'function') return '<div class="sa-card"><div class="scc-b">No suppliers to assess.</div></div>';
  var rows = asmts.map(function(av){ return {av: av, x: pvAssess(av, pvCandById(av.id), input)}; });
  if (typeof PVSL_RK_VEND === 'undefined') { try { PVSL_RK_VEND = null; } catch (e) {} }
  var selId = (typeof PVSL_RK_VEND !== 'undefined' && PVSL_RK_VEND && rows.some(function(r){ return r.av.id === PVSL_RK_VEND; })) ? PVSL_RK_VEND : rows[0].av.id;
  try { PVSL_RK_VEND = selId; } catch (e) {}
  var sel = rows.find(function(r){ return r.av.id === selId; });

  // ---- portfolio summary ----
  var critHigh = rows.filter(function(r){ return ['High','Critical'].indexOf(r.x.risk.level) >= 0; }).length;
  var withGates = rows.filter(function(r){ return r.x.gates.length > 0; }).length;
  var dimBad = {}, dimUnk = {}, dimConf = {};
  rows.forEach(function(r){ r.x.dimensions.forEach(function(d){ if (PVR2_RISK_DIMS.every(function(rd){ return rd[0] !== d.id; })) return; var lv = pvR2ConcernToRisk(d.concern); if (['High','Critical','Moderate'].indexOf(lv) >= 0) dimBad[d.label] = (dimBad[d.label] || 0) + 1; if (lv === 'Unknown') dimUnk[d.label] = (dimUnk[d.label] || 0) + 1; if (d.confidence === 'High') dimConf[d.label] = (dimConf[d.label] || 0) + 1; }); });
  var topKey = function(o){ var k = null, m = -1; for (var x in o) if (o[x] > m) { m = o[x]; k = x; } return k; };
  var pcell = function(lab, val){ return '<div style="min-width:0"><div style="font:600 9.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2);margin-bottom:4px">' + lab + '</div><div style="font-size:14px;font-weight:800;color:var(--ink)">' + val + '</div></div>'; };
  var portfolio = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px 20px">'
    + pcell('High / critical risk', critHigh + ' <span style="font-size:11px;color:var(--mut2);font-weight:600">of ' + rows.length + '</span>')
    + pcell('Unresolved gates', String(withGates))
    + pcell('Most common exposure', '<span style="font-size:12.5px">' + pvAEsc(topKey(dimBad) || 'None') + '</span>')
    + pcell('Least-assessed', '<span style="font-size:12.5px">' + pvAEsc(topKey(dimUnk) || 'None') + '</span>')
    + pcell('Highest-confidence', '<span style="font-size:12.5px">' + pvAEsc(topKey(dimConf) || 'None') + '</span>')
    + '</div>';

  // ---- heatmap: risk dims (rows) x suppliers (cols) ----
  var heads = '<th style="text-align:left;padding:4px 8px 8px 0"></th>' + rows.map(function(r){
      var sc = r.av.id === selId;
      return '<th onclick="if(typeof pvRkVend===\'function\')pvRkVend(\'' + pvAEsc(r.av.id) + '\')" style="padding:4px 4px 8px;cursor:pointer;text-align:center;border-bottom:2px solid ' + (sc ? '#A23A30' : 'transparent') + '"><div style="font-size:10.5px;font-weight:700;color:' + (sc ? '#A23A30' : 'var(--ink)') + ';white-space:nowrap">' + pvAEsc((r.av.name || '').split(/[ ,]/)[0]) + '</div>' + (r.av.rank ? '<div style="font:600 9px var(--mono,monospace);color:var(--mut2)">#' + r.av.rank + (r.av.eligible ? '' : ' · out') + '</div>' : '') + '</div></th>';
    }).join('');
  var body = PVR2_RISK_DIMS.map(function(rd){
      var cells = rows.map(function(r){ var d = r.x.dimensions.find(function(v){ return v.id === rd[0]; }) || {}; return '<td style="padding:3px">' + pvR2Cell(pvR2ConcernToRisk(d.concern), d.confidence) + '</td>'; }).join('');
      return '<tr><td style="font-size:12px;font-weight:600;color:var(--ink);padding:5px 8px 5px 0;white-space:nowrap">' + pvAEsc(rd[1]) + '</td>' + cells + '</tr>';
    }).join('');
  var overall = '<tr><td style="font-size:11px;font-weight:700;color:var(--mut2);padding:8px 8px 3px 0;text-transform:uppercase;letter-spacing:.03em">Overall</td>' + rows.map(function(r){ var m = THEO_RISKBAND[r.x.risk.level] || THEO_RISKBAND['Unknown']; return '<td style="padding:3px;text-align:center"><span style="font:700 9px var(--mono,monospace);text-transform:uppercase;color:' + m.c + '">' + pvAEsc(r.x.risk.level) + '</span></td>'; }).join('') + '</tr>';
  var heatmap = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr>' + heads + '</tr></thead><tbody>' + body + overall + '</tbody></table></div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;font-size:11px;color:var(--mut)">' + ['Low','Moderate','High','Critical','Unknown'].map(function(l){ var m = THEO_RISKBAND[l]; return '<span style="display:flex;align-items:center;gap:6px"><i style="width:11px;height:9px;border-radius:2px;background:' + m.bg + ';border:1px solid ' + m.c + '"></i>' + l + '</span>'; }).join('') + '<span style="color:var(--mut2)">· dots = confidence · gates override the average, no risk is averaged away</span></div>';

  // ---- coverage callout for unassessed dims ----
  var unassessedNote = '';
  var respUnk = rows.filter(function(r){ var d = r.x.dimensions.find(function(v){ return v.id === 'responsible'; }) || {}; return pvR2ConcernToRisk(d.concern) === 'Unknown'; }).length;
  if (respUnk) unassessedNote = pvDD2Foot('Responsible sourcing is <b>not assessed</b> for ' + respUnk + ' of ' + rows.length + ' suppliers &mdash; shown as Unknown, never a scored "no issue". "Not assessed" is not "low risk".');

  // ---- selected supplier detail ----
  var sx = sel.x, disp = pvR2Disposition(sx);
  var matRisks = (sx.risks && sx.risks.length) ? sx.risks : sx.dimensions.filter(function(d){ return PVR2_RISK_DIMS.some(function(rd){ return rd[0] === d.id; }) && ['High','Critical','Moderate'].indexOf(pvR2ConcernToRisk(d.concern)) >= 0; }).map(function(d){ return {label: d.label, impact: pvR2ConcernToRisk(d.concern), type: 'Dimension', mitigation: d.evidence, gate: false}; });
  var mitig = matRisks.map(function(rk){ return '<tr><td class="dt" style="vertical-align:top;white-space:nowrap">' + pvAEsc(rk.label) + '</td><td class="dd" style="vertical-align:top;color:var(--mut2);white-space:nowrap">' + pvAEsc(rk.type || '') + '</td><td class="dd" style="vertical-align:top">' + pvAEsc(rk.mitigation || '') + '</td><td class="dd" style="vertical-align:top;white-space:nowrap">' + (rk.gate ? '<b style="color:#8A5A00">Gate</b>' : 'Monitor') + '</td></tr>'; }).join('');
  var selName = pvAEsc(sel.av.name);
  var selHead = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:13px;font-weight:700;color:var(--ink)">' + selName + '</span>' + pvSemanticRiskCell(sx.risk.level, sx.risk.confidence) + '<span style="font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:' + disp.c + '">Disposition: ' + disp.l + '</span></div>';
  var timeline = (typeof pvDD2EventTimeline === 'function' && sx.events && sx.events.length) ? pvDD2EventTimeline(sx.events) : '';

  return pvDD2Card('Risk Assessment', '<div style="font-size:12.5px;color:var(--mut);line-height:1.55">Cross-supplier risk on the shared assessment model &mdash; one consistent taxonomy, semantic levels with a separate confidence read, and gates that override the blended average.</div>', 'var(--riskred,#A23A30)')
    + pvDD2Card('Portfolio summary', portfolio, 'var(--ai,#5C2B50)')
    + pvDD2Card('Risk by dimension', heatmap + unassessedNote, '#A23A30')
    + pvDD2Card('Selected supplier &middot; ' + selName, selHead
        + (mitig ? '<div style="overflow-x:auto"><table class="pvdl"><thead><tr><th style="text-align:left;font-size:10px;color:var(--mut2)">Risk</th><th style="text-align:left;font-size:10px;color:var(--mut2)">Type</th><th style="text-align:left;font-size:10px;color:var(--mut2)">Response</th><th style="font-size:10px;color:var(--mut2)">Gate</th></tr></thead><tbody>' + mitig + '</tbody></table></div>' : '<div style="font-size:12px;color:var(--mut2)">No material risks above threshold for this supplier.</div>')
        + (timeline ? '<div style="margin-top:14px"><div style="font:700 10px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2);margin-bottom:8px">Material events</div>' + timeline + '</div>' : ''), 'var(--navy,#0F3A85)');
}

/* =============================================================================
   TOP-LEVEL HEAD-TO-HEAD (v3) — pvH2HHtml. Compare any two eligible suppliers on the
   shared spine: summary strip (with tie-vs-meaningful), category delta bars, risk
   difference, evidence-confidence compare, commercial-model compare, conclusion.
   ============================================================================= */
var PVH2H_A = null, PVH2H_B = null;
function pvH2HPick(which, id) { if (which === 'a') PVH2H_A = id; else PVH2H_B = id; if (typeof pvRerender === 'function') pvRerender(); }
function pvH2HCounts(x) {
  var g = x.reqGroups || [];
  return {
    met: g.filter(function(r){ return r.fitLabel === 'Strong' || r.fitLabel === 'Meets'; }).length,
    partial: g.filter(function(r){ return r.fitLabel === 'Partial'; }).length,
    gap: g.filter(function(r){ return r.fitLabel === 'Gap'; }).length,
    mustGap: g.filter(function(r){ return r.must && r.fitLabel === 'Gap'; }).length
  };
}
function pvH2HBarCell(v, color) {
  if (v == null) return '<div style="font-size:11px;color:var(--mut2)">Unknown</div>';
  return '<div style="display:flex;align-items:center;gap:7px"><div style="flex:1;height:7px;border-radius:30px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:' + (v / 5 * 100) + '%;background:' + color + '"></i></div><span style="font-family:var(--mono,monospace);font-size:11px;font-weight:700;color:' + color + '">' + v.toFixed(1) + '</span></div>';
}
function pvH2HHtml(refl) {
  var input = (typeof PVSL_INPUT !== 'undefined' && PVSL_INPUT) || {};
  var L = (refl && refl.landscape) || {};
  var elig = (L.assessments || []).filter(function(a){ return a.eligible; }).sort(function(p, q){ return (p.rank || 99) - (q.rank || 99); });
  if (elig.length < 2 || typeof pvCandById !== 'function') return '<div class="sa-card"><div class="scc-b">Need at least two eligible suppliers to compare.</div></div>';
  var ids = elig.map(function(a){ return a.id; });
  var aId = (PVH2H_A && ids.indexOf(PVH2H_A) >= 0) ? PVH2H_A : ids[0];
  var bId = (PVH2H_B && ids.indexOf(PVH2H_B) >= 0 && PVH2H_B !== aId) ? PVH2H_B : (ids[1] === aId ? ids[0] : ids[1]);
  PVH2H_A = aId; PVH2H_B = bId;
  var mk = function(id){ var av = elig.find(function(a){ return a.id === id; }); return {av: av, x: pvAssess(av, pvCandById(id), input)}; };
  var A = mk(aId), B = mk(bId);
  var nm = function(av){ return (av.name || '').split(/[ ,]/)[0]; };

  var sel = function(which, cur){ return '<select onchange="pvH2HPick(\'' + which + '\',this.value)" style="font:600 13px var(--sans);padding:6px 10px;border:1px solid var(--line2,#CECCC7);border-radius:8px;background:var(--surface,#fff);color:var(--ink)">' + elig.map(function(a){ return '<option value="' + pvAEsc(a.id) + '"' + (a.id === cur ? ' selected' : '') + '>' + pvAEsc(a.name) + (a.rank ? ' · #' + a.rank : '') + '</option>'; }).join('') + '</select>'; };
  var pickers = '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><span style="font-size:12px;color:var(--mut2)">Compare</span>' + sel('a', aId) + '<span style="font-weight:700;color:var(--mut2)">vs</span>' + sel('b', bId) + '</div>';

  var ca = pvH2HCounts(A.x), cb = pvH2HCounts(B.x);
  var fa = A.x.fit.score5, fb = B.x.fit.score5;
  var adv = (fa == null || fb == null) ? 'Insufficient data' : Math.abs(fa - fb) < 0.15 ? 'Effectively a tie on fit' : (fa > fb ? nm(A.av) : nm(B.av)) + ' leads fit by ' + Math.abs(fa - fb).toFixed(1);
  var strip = '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:10px;align-items:center">'
    + '<div></div><div style="font-size:13px;font-weight:800;color:#0F3A85;text-align:center">' + pvAEsc(A.av.name) + '</div><div style="font-size:13px;font-weight:800;color:#2F6E6B;text-align:center">' + pvAEsc(B.av.name) + '</div>'
    + [['Requirements fit', (fa != null ? fa + '/5 · ' + A.x.fit.label : '—'), (fb != null ? fb + '/5 · ' + B.x.fit.label : '—')],
       ['Risk posture', A.x.risk.level, B.x.risk.level],
       ['Requirements met', ca.met, cb.met],
       ['Partial', ca.partial, cb.partial],
       ['Must-have gaps', ca.mustGap, cb.mustGap],
       ['Evidence confidence', A.x.evidenceConfidence, B.x.evidenceConfidence]
      ].map(function(r){ return '<div style="font-size:12px;color:var(--mut2);padding:6px 0;border-top:1px solid var(--line)">' + r[0] + '</div><div style="font-size:12.5px;font-weight:600;color:var(--ink);text-align:center;padding:6px 0;border-top:1px solid var(--line)">' + pvAEsc(String(r[1])) + '</div><div style="font-size:12.5px;font-weight:600;color:var(--ink);text-align:center;padding:6px 0;border-top:1px solid var(--line)">' + pvAEsc(String(r[2])) + '</div>'; }).join('')
    + '</div><div style="margin-top:10px;padding:8px 12px;background:var(--nested,#f1efec);border-radius:8px;font-size:12.5px;font-weight:600;color:var(--ink);text-align:center">' + pvAEsc(adv) + '</div>';

  var deltas = (A.x.reqGroups || []).map(function(ga, i){
    var gb = (B.x.reqGroups || [])[i] || {}, va = ga.fit, vb = gb.fit;
    var a2 = (va == null || vb == null) ? '—' : Math.abs(va - vb) < 0.15 ? 'Tie' : (va > vb ? nm(A.av) : nm(B.av)) + ' +' + Math.abs(va - vb).toFixed(1);
    return '<div style="display:grid;grid-template-columns:150px 1fr 1fr 120px;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line)"><span style="font-size:12px;font-weight:600;color:var(--ink)">' + pvAEsc(ga.label) + (ga.must ? ' <span style="font:700 8px var(--mono,monospace);color:#A23A30">MUST</span>' : '') + '</span>' + pvH2HBarCell(va, '#0F3A85') + pvH2HBarCell(vb, '#2F6E6B') + '<span style="font-size:11px;font-weight:600;color:var(--mut)">' + pvAEsc(a2) + '</span></div>';
  }).join('');

  var riskDiff = PVR2_RISK_DIMS.map(function(rd){
    var da = A.x.dimensions.find(function(d){ return d.id === rd[0]; }) || {}, db = B.x.dimensions.find(function(d){ return d.id === rd[0]; }) || {};
    return '<tr><td style="font-size:12px;font-weight:600;color:var(--ink);padding:6px 8px 6px 0">' + pvAEsc(rd[1]) + '</td><td style="padding:4px;text-align:center">' + pvSemanticRiskCell(pvR2ConcernToRisk(da.concern), da.confidence) + '</td><td style="padding:4px;text-align:center">' + pvSemanticRiskCell(pvR2ConcernToRisk(db.concern), db.confidence) + '</td></tr>';
  }).join('');

  var cov = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div style="font-size:12px;font-weight:700;color:#0F3A85;margin-bottom:8px">' + pvAEsc(A.av.name) + '</div>' + pvEvidCoverageBar(A.x.evidenceCoverage) + '</div><div><div style="font-size:12px;font-weight:700;color:#2F6E6B;margin-bottom:8px">' + pvAEsc(B.av.name) + '</div>' + pvEvidCoverageBar(B.x.evidenceCoverage) + '</div></div>';

  var commA = A.x.commercialDrivers, commB = B.x.commercialDrivers;
  var commCard = (commA || commB) ? pvDD2Card('Commercial model', '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div style="font-size:12px;font-weight:700;color:#0F3A85;margin-bottom:8px">' + pvAEsc(A.av.name) + '</div>' + (commA ? pvDD2CommercialDrivers(commA) : '<div style="font-size:12px;color:var(--mut2)">Not on file.</div>') + '</div><div><div style="font-size:12px;font-weight:700;color:#2F6E6B;margin-bottom:8px">' + pvAEsc(B.av.name) + '</div>' + (commB ? pvDD2CommercialDrivers(commB) : '<div style="font-size:12px;color:var(--mut2)">Not on file.</div>') + '</div></div>', 'var(--ai,#5C2B50)') : '';

  var chips = (A.x.concerns || []).slice(0, 2).concat((B.x.concerns || []).slice(0, 1)).map(function(c){ return '<span style="display:inline-block;font-size:11.5px;color:var(--mut);background:var(--nested,#f1efec);border:1px solid var(--line);border-radius:20px;padding:3px 10px;margin:0 6px 6px 0">' + pvAEsc(c) + '</span>'; }).join('');
  var conclusion = '<div style="font-size:12.5px;color:var(--ink);line-height:1.55">' + pvAEsc(nm(A.av)) + ' and ' + pvAEsc(nm(B.av)) + ' are separated mostly by the categories above; ' + pvAEsc(adv.toLowerCase()) + '. The decision most likely turns on the open validation items below.</div><div style="margin-top:12px">' + chips + '</div>';

  return pvDD2Card('Head-to-Head', pickers, 'var(--navy,#0F3A85)')
    + pvDD2Card('Comparison summary', strip, 'var(--ai,#5C2B50)')
    + pvDD2Card('Category delta', deltas || '<div style="font-size:12px;color:var(--mut2)">No requirement groups to compare.</div>', 'var(--teal-d,#2F6E6B)')
    + pvDD2Card('Risk difference', '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th></th><th style="font-size:11px;color:#0F3A85;padding-bottom:6px">' + pvAEsc(nm(A.av)) + '</th><th style="font-size:11px;color:#2F6E6B;padding-bottom:6px">' + pvAEsc(nm(B.av)) + '</th></tr></thead><tbody>' + riskDiff + '</tbody></table></div>', 'var(--amber-d,#8A5A00)')
    + pvDD2Card('Evidence confidence', cov, 'var(--mut2,#6a655f)')
    + commCard
    + pvDD2Card('Conclusion', conclusion, 'var(--navy,#0F3A85)');
}

function pvDD2Section(ddt, a, cand, refl, input) {
  var x = pvAssess(a, cand, input);
  if (ddt === 'company') return pvDD2Company(x, a, cand, input);
  if (ddt === 'caps')    return pvDD2Caps(x, a, cand, input);
  if (ddt === 'finmkt')  return pvDD2FinMkt(x, a, cand, input, refl);
  if (ddt === 'risk')    return pvDD2Risk(x, a, cand, input);
  if (ddt === 'lilly')   return pvDD2Lilly(x, a, cand, input);
  return pvDD2Summary(x, a, cand, input);
}
