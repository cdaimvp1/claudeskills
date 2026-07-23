/* =============================================================================
   pv-07b-deepdive.js — Supplier Deep Dive v3 (6 visual subtabs on pvAssess)
   Supplier Summary (default) / Company & Ownership / Capabilities & Operations /
   Financial & Market / Risk & Resilience / Lilly Fit & Diligence.
   Each subtab leads with its dominant read; decision -> evidence -> materiality ->
   action; ~60% visual. Consumes pvAssess() (pv-07a) + the existing deepDive data.
   Loaded after pv-07a and pv-07 in the bundle.
   ============================================================================= */

function pvDD2Card(title, inner, accent, sub) {
  return '<div class="sa-card" style="border-left:3px solid ' + (accent || 'var(--ddacc,var(--navy))') + '">'
    + '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:12px">'
    + '<h3 style="font-size:13.5px;font-weight:700;margin:0;color:var(--ink)">' + title + '</h3>'
    + (sub ? '<span style="font-size:11px;color:var(--mut2)">' + sub + '</span>' : '') + '</div>'
    + '<div>' + inner + '</div></div>';
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
function pvDD2Company(x, a, cand, input) {
  var dd = cand.deepDive || {}, idn = dd.identity || {}, comp = dd.company || {}, at = dd.attrs || {};
  var clean = function(v){ return v == null ? '' : String(v); };
  var beforeSemi = function(v){ v = clean(v); return v ? v.split(';')[0].trim() : ''; };
  var beforeParen = function(v){ v = clean(v); return v ? v.split('(')[0].trim() : ''; };
  var stripHQ = function(v){ v = clean(v); return v ? v.replace(/^Legal HQ[^;]*;\s*/i, '').trim() : ''; };
  // ownership as a simple text tree (dominant relationship view; full diagram later)
  var parent = idn.parent || 'Independent (no parent)';
  var tree = '<div style="font-family:var(--mono,monospace);font-size:12px;line-height:1.9;color:var(--ink)">'
    + '<div><b>Ultimate parent</b> &middot; ' + pvAEsc(/independent|no parent/i.test(parent) ? 'None — independent' : beforeSemi(parent)) + '</div>'
    + '<div style="padding-left:14px">&#9492;&#9472; <b>Contracting entity</b> &middot; ' + pvAEsc(idn.legal || a.name) + ' <span style="color:var(--mut2)">' + pvAEsc(beforeParen(idn.ownership) || '') + '</span></div>'
    + (comp.footprint ? '<div style="padding-left:32px">&#9492;&#9472; Operating footprint &middot; multi-region</div>' : '')
    + '</div>';
  var matrix = pvDD2StatusMatrix([
    ['Legal entity', idn.legal ? 'Verified' : 'Missing', 'Public filings / company site'],
    ['Ultimate parent', /independent|public/i.test(parent) ? 'Verified' : 'Partial', 'Public filings'],
    ['Beneficial ownership', /public/i.test(idn.ownership || '') ? 'Verified' : 'Missing', /public/i.test(idn.ownership || '') ? 'Widely held public co (UBO n/a)' : 'UBO verification required'],
    ['Lilly vendor-master match', 'Missing', 'Internal vendor master — not checked'],
    ['Contracting entity confirmed', 'Supplier asserted', 'Confirm in RFx']
  ]);
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
  return pvDD2Card('Company &amp; ownership', pvDD2DimLead(x, 'identity'), (THEO_CONCERN[(x.dimensions.find(function(d){return d.id==='identity';})||{}).concern] || {}).c)
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start">'
    +   pvDD2Card('Ownership &amp; control', tree + pvDD2Foot('Lilly contracts an <b>entity</b>, evaluates an <b>offering</b>, and depends on specific <b>services</b> &mdash; three different things. Full ownership diagram to follow.'), 'var(--navy,#0F3A85)')
    +   pvDD2Card('Identity verification', matrix, 'var(--teal-d,#2F6E6B)')
    + '</div>'
    + pvDD2Card('Firmographics', scale, 'var(--mut2,#6a655f)');
}

/* --------------------------------------------- 2. CAPABILITIES & OPERATIONS */
function pvDD2Caps(x, a, cand, input) {
  var dd = cand.deepDive || {}, idn = dd.identity || {};
  var offs = (dd.offerings || []).map(function(o){
    return '<tr><td class="dt" style="white-space:nowrap;vertical-align:top">' + pvAEsc(o.name) + '</td><td class="dd">' + pvAEsc(o.note || '') + '</td></tr>';
  }).join('');
  var offTable = offs ? '<div style="overflow-x:auto"><table class="pvdl"><tbody>' + offs + '</tbody></table></div>' : '<div style="font-size:12px;color:var(--mut2)">No offerings on file.</div>';
  var refsTxt = dd.clients || (dd.company && dd.company.refs) || '';
  return pvDD2Card('Capabilities &amp; operations', pvDD2DimLead(x, 'capability'), (THEO_CONCERN[(x.dimensions.find(function(d){return d.id==='capability';})||{}).concern] || {}).c)
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:start">'
    +   pvDD2Card('Offering &amp; delivery', (idn.delivery ? '<div style="font-size:12.5px;margin-bottom:10px"><b style="color:var(--mut2)">Delivery model &middot;</b> ' + pvAEsc(idn.delivery) + '</div>' : '') + offTable, 'var(--navy,#0F3A85)')
    +   pvDD2Card('Fit to requirements', pvReqGroupMini(x.reqGroups) + pvDD2Foot('Capability read against each requirement group. A validated capability map (evidence per cell) replaces keyword matching in the next pass.'), 'var(--teal-d,#2F6E6B)')
    + '</div>'
    + (refsTxt ? pvDD2Card('Reference customers', '<div style="font-size:12.5px;color:var(--ink);line-height:1.55">' + pvAEsc(refsTxt) + '</div>' + pvDD2Foot('Reference-relevance (pharma? similar scale? similar use case? independently verified?) to follow.'), 'var(--mut2,#6a655f)') : '');
}

/* ------------------------------------------------ 3. FINANCIAL & MARKET */
function pvDD2FinMkt(x, a, cand, input) {
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
  return pvDD2Card('Financial &amp; market', pvDD2DimLead(x, 'financial'), (THEO_CONCERN[(x.dimensions.find(function(d){return d.id==='financial';})||{}).concern] || {}).c)
    + pvDD2Card('Financial viability', summary + (fin.sources && fin.sources.length ? pvDD2Foot('<b>Sources.</b> ' + fin.sources.map(function(s){return pvAEsc(s);}).join(' &middot; ')) : ''), 'var(--navy,#0F3A85)')
    + (revSvg ? pvDD2Card('Revenue history', '<div style="max-width:520px">' + revSvg + '</div>' + pvDD2Foot('Trend shown only where multiple comparable periods exist.'), 'var(--teal-d,#2F6E6B)') : '')
    + pvDD2Card('Market position', mkt + pvDD2Foot('Commercial model driver-matrix (compute / storage / transfer / support / exit variability) and peer-position scatter to follow &mdash; precise TCO comes from RFx bids, never a public-data proxy.'), 'var(--mut2,#6a655f)');
}

/* ------------------------------------------------ 4. RISK & RESILIENCE */
function pvDD2Risk(x, a, cand, input) {
  var dd = cand.deepDive || {};
  var riskDims = x.dimensions.filter(function(d){ return ['financial','resilience','integrity','quality','cyber','responsible'].indexOf(d.id) >= 0; });
  var cells = '<div style="display:flex;flex-direction:column;gap:9px">' + riskDims.map(function(d){
      return '<div style="display:grid;grid-template-columns:200px 1fr;gap:12px;align-items:start;padding:7px 0;border-bottom:1px solid var(--line)">'
        + '<span style="font-size:12.5px;font-weight:600;color:var(--ink)">' + pvAEsc(d.label) + '</span>'
        + '<div><div style="margin-bottom:4px">' + pvConcernPill(d.concern, d.confidence) + '</div><div style="font-size:11.5px;color:var(--mut);line-height:1.45">' + pvAEsc(d.evidence) + '</div></div></div>';
    }).join('') + '</div>';
  var risks = (dd.risksNarr || []).map(function(r){
      var sev = r.sev === 'high' ? 'High' : r.sev === 'med' ? 'Moderate' : 'Low';
      var c = r.sev === 'high' ? '#A23A30' : r.sev === 'med' ? '#8A5A00' : '#0F3A85';
      return '<div style="padding:9px 0;border-bottom:1px solid var(--line)"><div style="display:flex;gap:8px;align-items:baseline"><b style="font-size:12.5px;color:var(--ink)">' + pvAEsc(r.cat) + '</b><span style="font:700 9px var(--mono,monospace);text-transform:uppercase;color:' + c + '">' + sev + '</span></div><div style="font-size:12px;color:var(--mut);line-height:1.5;margin-top:3px">' + pvAEsc(r.detail) + '</div></div>';
    }).join('');
  var events = ((dd.riskPosture && dd.riskPosture.recentIssues) || []).map(function(ev){
      return '<div style="display:grid;grid-template-columns:120px 1fr;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)"><span style="font-family:var(--mono,monospace);font-size:10.5px;color:var(--mut2)">' + pvAEsc(ev.date || '') + '</span><div><div style="font-size:12.5px;font-weight:600;color:var(--ink)">' + pvAEsc(ev.title || '') + '</div>' + (ev.detail ? '<div style="font-size:11.5px;color:var(--mut);line-height:1.5;margin-top:3px">' + pvAEsc(ev.detail) + '</div>' : '') + '</div></div>';
    }).join('');
  var gates = x.gates.map(function(g){ return '<tr><td class="dt">' + pvAEsc(g.label) + '</td><td class="dd">' + pvAEsc(g.why) + '</td><td class="dd" style="white-space:nowrap"><b style="color:#8A5A00">' + (g.kind === 'hard' ? 'Hard stop' : 'Escalate') + '</b></td></tr>'; }).join('');
  return pvDD2Card('Risk &amp; resilience', '<div style="font-size:12.5px;color:var(--mut);line-height:1.55">What could prevent successful performance, and how Lilly should respond. A hard flag disqualifies; a critical single risk overrides the average.</div>', 'var(--riskred,#A23A30)')
    + pvDD2Card('Risk posture by dimension', cells + pvDD2Foot('Impact &times; likelihood matrix to follow; each score already carries its plain-English read and confidence.'), 'var(--navy,#0F3A85)')
    + (risks ? pvDD2Card('Material risks', risks, 'var(--amber-d,#8A5A00)') : '')
    + (events ? pvDD2Card('Material events', events + pvDD2Foot('Timeline with directness classification (direct / division / parent-context) to follow.'), 'var(--teal-d,#2F6E6B)') : '')
    + (gates ? pvDD2Card('Mitigation &amp; gates', '<div style="overflow-x:auto"><table class="pvdl"><tbody>' + gates + '</tbody></table></div>', 'var(--riskred,#A23A30)') : '');
}

/* ------------------------------------------------ 5. LILLY FIT & DILIGENCE */
function pvDD2Lilly(x, a, cand, input) {
  var dd = cand.deepDive || {}, lf = dd.lillyFit || {};
  var fitRows = pvDD2KV([
    ['Relationship', lf.relation],
    ['Strategic fit', lf.strategic],
    ['Pharma / GxP', lf.pharma],
    ['Value / next move', lf.value]
  ]);
  var oq = (typeof pvOpenQuestionsList === 'function') ? pvOpenQuestionsList(a, cand, input, (typeof pvReqFitRead === 'function' ? pvReqFitRead(a, cand, input) : null)) : [];
  var diligence = '';
  if (oq && oq.length) {
    diligence = '<ol style="margin:0;padding-left:20px;font-size:12.5px;line-height:1.6">' + oq.map(function(q){ return '<li>' + (q.plain ? pvAEsc((typeof pvStripTags === 'function' ? pvStripTags(q.plain) : q.plain)) : pvAEsc(q.tag || '')) + '</li>'; }).join('') + '</ol>';
  } else {
    diligence = '<div style="font-size:12px;color:var(--mut2)">No open items derived; standard pre-award confirmations still apply.</div>';
  }
  var actions = x.gates.map(function(g){ return '<tr><td class="dt">' + pvAEsc(g.label) + '</td><td class="dd">' + pvAEsc(g.why) + '</td></tr>'; }).join('');
  return pvDD2Card('Lilly fit &amp; diligence', pvDD2DimLead(x, 'capability'), (THEO_CONCERN[(x.dimensions.find(function(d){return d.id==='capability';})||{}).concern] || {}).c)
    + pvDD2Card('Lilly-specific fit', fitRows || '<div style="font-size:12px;color:var(--mut2)">No Lilly-fit read on file.</div>', 'var(--ai,#5C2B50)')
    + pvDD2Card('Required diligence before advancement', diligence + pvDD2Foot('The companion outreach skill turns these into supplier requests; responses (M365) flow back to re-enrich. A diligence funnel + owner-grouped action board to follow.'), 'var(--navy,#0F3A85)')
    + (actions ? pvDD2Card('Action board', '<div style="overflow-x:auto"><table class="pvdl"><tbody>' + actions + '</tbody></table></div>', 'var(--amber-d,#8A5A00)') : '');
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

function pvDD2Section(ddt, a, cand, refl, input) {
  var x = pvAssess(a, cand, input);
  if (ddt === 'company') return pvDD2Company(x, a, cand, input);
  if (ddt === 'caps')    return pvDD2Caps(x, a, cand, input);
  if (ddt === 'finmkt')  return pvDD2FinMkt(x, a, cand, input);
  if (ddt === 'risk')    return pvDD2Risk(x, a, cand, input);
  if (ddt === 'lilly')   return pvDD2Lilly(x, a, cand, input);
  return pvDD2Summary(x, a, cand, input);
}
