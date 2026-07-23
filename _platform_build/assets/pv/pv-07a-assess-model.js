/* =============================================================================
   pv-07a-assess-model.js — SHARED ASSESSMENT SPINE (Landscape redesign v3)
   One source of truth every Landscape tab reads from, so fit / risk / disposition
   / evidence never drift apart across tabs (the inconsistencies Marc caught:
   4.5 vs 89 vs 90, financial "Watch" vs "low"). Pure model + render primitives;
   no tab-specific layout here. Loaded BEFORE pv-07 in the bundle.

   Vocabularies (used everywhere):
   - Disposition: Advance / Advance with conditions / Hold as alternate /
     Do not advance / Screened out   (SEPARATE from quadrant labels)
   - Risk level: Low / Moderate / High / Critical / Unknown  (+ separate confidence)
   - Concern:    Low / Moderate / High / Critical / Insufficient evidence
   - Evidence:   Verified / Partial / Supplier asserted / Proxy / Missing
   - Confidence: High / Medium / Low
   ============================================================================= */

var THEO_DISPO = {
  'Advance':                {c:'var(--teal-d,#2F6E6B)', bg:'var(--teal-t,#DCEBE9)'},
  'Advance with conditions':{c:'var(--plum,#5C2B50)', bg:'var(--plum-t,#EDDFE9)'},
  'Hold as alternate':      {c:'#8A5A00', bg:'var(--ti-amber,#FBF1DA)'},
  'Do not advance':         {c:'#A23A30', bg:'var(--ti-red,#FBE7E3)'},
  'Screened out':           {c:'var(--mut2,#6a655f)', bg:'var(--nested,#f1efec)'}
};
// Palette (Marc, LOCKED): teal-primary for good/low, amber moderate, BURNT-ORANGE (--emph) high, red critical,
// gray unknown/insufficient. No navy-as-primary.
var THEO_CONCERN = {
  'Low':                    {c:'var(--teal-d,#2F6E6B)', bg:'var(--teal-t,#DCEBE9)',   fav:0.90},
  'Strong':                 {c:'var(--teal-d,#2F6E6B)', bg:'var(--teal-t,#DCEBE9)',   fav:0.92},
  'Moderate':               {c:'#8A5A00', bg:'var(--ti-amber,#FBF1DA)',fav:0.58},
  'High':                   {c:'var(--emph,#C15E19)', bg:'#FBEAD9',    fav:0.32},
  'Critical':               {c:'#A23A30', bg:'var(--ti-red,#FBE7E3)', fav:0.15},
  'Insufficient evidence':  {c:'var(--mut2,#6a655f)', bg:'var(--nested,#f1efec)', fav:0}
};
var THEO_RISKBAND = {
  'Low':     {c:'var(--teal-d,#2F6E6B)', bg:'var(--teal-t,#DCEBE9)'},
  'Moderate':{c:'#8A5A00', bg:'var(--ti-amber,#FBF1DA)'},
  'High':    {c:'var(--emph,#C15E19)', bg:'#FBEAD9'},
  'Critical':{c:'#A23A30', bg:'var(--ti-red,#FBE7E3)'},
  'Unknown': {c:'var(--mut2,#6a655f)', bg:'var(--nested,#f1efec)'}
};
var THEO_EVID = {
  'Verified':         {c:'var(--teal-d,#2F6E6B)', fill:'solid',  key:'verified'},
  'Partial':          {c:'#8A5A00', fill:'hatch',  key:'partial'},
  'Supplier asserted':{c:'var(--plum,#5C2B50)', fill:'outline',key:'supplier'},
  'Proxy':            {c:'var(--mut2,#6a655f)', fill:'outline', key:'proxy'},
  'Missing':          {c:'var(--mut2,#6a655f)', fill:'none',    key:'missing'}
};

/* ---- authored, grounded overrides (per supplier id). Summary-level here; the
   richer per-tab authored data (ownership tree, locations, events, capability
   map, references, dependencies, diligence, actions) is added as each tab is
   built. Only Snowflake (nimbus) is authored; every other supplier derives from
   existing scores + honest gap-states. -------------------------------------- */
var ASSESS_AUTHORED = {
  nimbus: {
    disposition: 'Advance with conditions',
    criticality: 'High',
    evidenceConfidence: 'Medium',
    riskConfidence: 'Medium',
    openIssues: 5,
    gates: [
      {kind:'escalate', label:'Consumption-cost exposure', why:'Consumption billing means peak concurrency and cost volatility must be modeled before any commitment.'},
      {kind:'escalate', label:'Data residency unconfirmed', why:'US / EU residency and support-location scope for regulated data are not yet confirmed.'},
      {kind:'escalate', label:'Tenant credential control', why:'2024 UNC5537 breaches hit customer tenants lacking MFA (Snowflake infra itself not breached); MFA / key-pair / network-policy must be mandated on any Lilly tenant.'}
    ],
    dimensions: [
      {id:'identity',   label:'Identity & ownership',   concern:'Low',                   confidence:'High',   evidence:'Public, NYSE-listed (SNOW), independent with no parent; contracting entity Snowflake Inc. UBO not applicable (widely held public company).'},
      {id:'capability', label:'Capability & fit',       concern:'Strong',                confidence:'Medium', evidence:'Gartner MQ Leader; strongest functional shape in the field for a warehouse-led estate. First-party ML is served through partners rather than natively.'},
      {id:'financial',  label:'Financial viability',    concern:'Low',                   confidence:'High',   evidence:'$4.68B FY2026 revenue (+29% YoY), $1.12B free cash flow, ~$93.2B market cap. Not yet GAAP-profitable (mostly stock-based comp); an active securities class action (Patel v. Snowflake) is a governance item to monitor, not a viability threat.'},
      {id:'resilience', label:'Operational resilience', concern:'Moderate',              confidence:'Medium', evidence:'Multi-cloud (AWS / Azure / GCP) reduces hyperscaler lock-in, but single-platform concentration plus consumption pricing create switching and cost exposure. Sub-tier dependencies undisclosed.'},
      {id:'integrity',  label:'Integrity & compliance', concern:'Low',                   confidence:'Low',    evidence:'No adverse sanctions / watchlist signal found in public sources; UBO not applicable. A formal sanctions / watchlist screen has NOT been run — "no issue found" is not the same as screened.'},
      {id:'quality',    label:'Quality & regulatory',   concern:'Moderate',              confidence:'Medium', evidence:'FedRAMP Moderate, HITRUST CSF, SOC 2 Type II and ISO 27001 are in place. GxP applicability and Lilly US / EU residency scope need a formal screen before award.'},
      {id:'cyber',      label:'Cyber & privacy',        concern:'Moderate',              confidence:'Medium', evidence:'2024 UNC5537 credential-stuffing hit 165+ customer tenants lacking MFA (Snowflake infrastructure not breached); co-defendant in consolidated litigation (MDL 3126). Tenant security is configuration-dependent — mandate MFA / key-pair / network policy.'},
      {id:'responsible',label:'Responsible sourcing',   concern:'Insufficient evidence', confidence:'Low',    evidence:'Company-stated net-zero / DEI commitments, not independently validated; no material human-rights / labor / environmental signal found. Not assessed.'}
    ],
    opportunities: [
      'Strongest functional shape in the field for a warehouse-led estate (Gartner MQ Leader).',
      'Deep certification stack (FedRAMP Moderate, HITRUST, SOC 2, ISO 27001) suited to regulated pharma.',
      'Named pharma / life-sciences references (Novartis, Sanofi, IQVIA) plus multi-cloud portability.'
    ],
    concerns: [
      'Consumption pricing: peak concurrency and cost volatility must be modeled before commitment.',
      'US / EU data residency and support-location scope unconfirmed for regulated data.',
      'Single-platform lock-in and exit / portability terms to be negotiated up front.'
    ],
    evidenceCoverage: {verified:48, partial:24, supplier:17, missing:11},
    risks: [
      {label:'Consumption-cost volatility', impact:'High',   likelihood:'Medium', confidence:'Medium', type:'Commercial',        gate:true,  mitigation:'Model peak concurrency; negotiate committed-use pricing with caps.'},
      {label:'Data residency (US / EU)',    impact:'High',   likelihood:'Medium', confidence:'Low',    type:'Diligence unknown', gate:true,  mitigation:'Confirm service + support locations for regulated data before award.'},
      {label:'Tenant credential control',   impact:'Medium', likelihood:'Medium', confidence:'Medium', type:'Lilly exposure',    gate:true,  mitigation:'Mandate MFA / key-pair auth / network policy on any Lilly tenant.'},
      {label:'Single-platform lock-in',     impact:'Medium', likelihood:'Medium', confidence:'High',   type:'Solution / design',  gate:false, mitigation:'Negotiate portability + exit terms; validate open-table (Iceberg) path.'},
      {label:'Not yet GAAP-profitable',     impact:'Low',    likelihood:'Low',    confidence:'High',   type:'Supplier-inherent',  gate:false, mitigation:'Monitor; strong free cash flow ($1.12B) and scale offset.'},
      {label:'Securities class action',     impact:'Low',    likelihood:'Low',    confidence:'Medium', type:'Supplier-inherent',  gate:false, mitigation:'Monitor Patel v. Snowflake governance outcome.'}
    ],
    events: [
      {date:'Apr-Jun 2024', title:'UNC5537 customer-credential breach campaign', directness:'Affects the service', resolution:'Several claims dismissed with prejudice Dec 2025; litigation ongoing (MDL 3126).', detail:'Infostealer-harvested credentials accessed 165+ customer tenants lacking MFA; Snowflake infrastructure itself not breached.'},
      {date:'Feb 2026',      title:'Patel v. Snowflake securities class action filed', directness:'Affects the operating division', resolution:'Ongoing.', detail:'Over a withdrawn 2029 revenue target; a governance matter to track, not a viability threat.'},
      {date:'~May 2026',     title:'~$6B multi-year AWS partnership announced', directness:'Affects the service', resolution:'Positive signal.', detail:'Deepens multi-cloud footing and marketplace reach.'}
    ],
    ownership: {
      tree: [
        {label:'Global ultimate', value:'Snowflake Inc.', note:'Independent — no parent company', tag:'public'},
        {label:'Contracting entity', value:'Snowflake Inc. (NYSE: SNOW)', note:'The entity Lilly would contract with', tag:'entity'},
        {label:'Product / service entities', value:'Data Cloud · Snowpark · Cortex AI · Marketplace', note:'Delivered on AWS, Azure and GCP', tag:'offering'}
      ],
      markers: [
        ['Public / private', 'Verified', 'Public (NYSE: SNOW)'],
        ['Ultimate parent', 'Verified', 'None — independent'],
        ['Beneficial ownership', 'Verified', 'Widely held; no single UBO (n/a)'],
        ['Sanctions / watchlist', 'Missing', 'Formal screen not run'],
        ['Lilly vendor-master match', 'Missing', 'Not checked'],
        ['Contracting entity confirmed', 'Supplier asserted', 'Confirm in RFx']
      ]
    },
    locations: [
      {name:'Bozeman, Montana, US', type:'Registered HQ', region:'US', conf:'Verified'},
      {name:'Bay Area, California, US', type:'Largest operational hub', region:'US', conf:'Verified'},
      {name:'AWS / Azure / GCP regions', type:'Service delivery', region:'US · EU · APAC', conf:'Verified'},
      {name:'Support locations', type:'Support', region:'To confirm for regulated data', conf:'Missing'}
    ],
    capabilities: {
      cols: ['Core', 'Integration', 'Security', 'Scale', 'Governance'],
      rows: [
        {cap:'Data platform / warehouse',   cells:['Confirmed','Confirmed','Confirmed','Confirmed','Partially confirmed']},
        {cap:'AI / ML (Cortex, Snowpark)',   cells:['Confirmed','Supplier asserted','Not demonstrated','Confirmed','Partially confirmed']},
        {cap:'SAP / legacy integration',     cells:['Partially confirmed','Partially confirmed','Confirmed','Confirmed','N/A']},
        {cap:'Regulated / GxP workloads',    cells:['Confirmed','Confirmed','Confirmed','Confirmed','Partially confirmed']}
      ]
    },
    references: [
      {name:'Capital One', pharma:false, scale:true,      useCase:true,      verified:true},
      {name:'Novartis',    pharma:true,  scale:true,      useCase:true,      verified:false},
      {name:'Sanofi',      pharma:true,  scale:true,      useCase:'partial', verified:false},
      {name:'IQVIA',       pharma:true,  scale:true,      useCase:true,      verified:false},
      {name:'Adobe',       pharma:false, scale:true,      useCase:false,     verified:true}
    ],
    commercialDrivers: [
      {driver:'Compute',               variability:'High',                    note:'Consumption-based; peak concurrency drives cost'},
      {driver:'Storage',               variability:'Moderate',                note:'Separated, priced independently'},
      {driver:'Data transfer / egress',variability:'Potential exposure',      note:'Cross-cloud / cross-region egress'},
      {driver:'Support',               variability:'Fixed / tiered',          note:'Tiered support plans'},
      {driver:'Implementation',        variability:'Moderate',                note:'One-time; partner-led'},
      {driver:'Exit / migration',      variability:'Potentially significant', note:'Single-platform lock-in'}
    ],
    diligence: [
      {stage:'Research complete',           pct:85},
      {stage:'Supplier evidence received',  pct:20},
      {stage:'Security review',             pct:15},
      {stage:'Quality / regulatory review', pct:0},
      {stage:'Financial / TPRM review',     pct:40},
      {stage:'References validated',        pct:25},
      {stage:'Contract readiness',          pct:0}
    ],
    actions: [
      {action:'Model peak consumption and negotiate committed-use caps', owner:'Finance / Sourcing',   gate:true,  status:'Open'},
      {action:'Confirm US / EU data residency and support locations',    owner:'Supplier',             gate:true,  status:'Open'},
      {action:'Complete cyber / privacy review; mandate MFA + key-pair', owner:'Information Security',  gate:true,  status:'Not started'},
      {action:'Validate SAP / legacy integration path',                  owner:'Architecture',         gate:false, status:'Open'},
      {action:'Obtain independent pharma references',                    owner:'Sourcing',             gate:false, status:'Open'},
      {action:'Negotiate exit / portability terms',                      owner:'Sourcing / Legal',     gate:false, status:'Not started'}
    ]
  }
};

/* ---- pvAssess(a, cand, input): the normalized assessment for ANY supplier ---- */
function pvAssess(a, cand, input) {
  input = input || {}; cand = cand || {};
  var auth = ASSESS_AUTHORED[a && a.id] || {};
  var rnd = (typeof pvRound === 'function') ? pvRound : function(n,d){var p=Math.pow(10,d||0);return Math.round(n*p)/p;};

  // FIT — one scale (score5 primary, score100 available)
  var f100 = (a && a.fitScore != null) ? a.fitScore : null;
  var f5 = f100 != null ? rnd(f100 / 20, 1) : null;
  var fitLabel = f5 == null ? 'Unknown' : f5 >= 4.25 ? 'High' : f5 >= 3.75 ? 'Moderate-high' : f5 >= 3.0 ? 'Moderate' : 'Low';

  // RISK — semantic + confidence
  var r5 = (a && a.riskScore != null) ? a.riskScore : null;
  var riskLevel = r5 == null ? 'Unknown' : r5 < 1.75 ? 'Low' : r5 < 2.5 ? 'Moderate' : r5 < 3.25 ? 'High' : 'Critical';

  // DIMENSIONS (8) — authored or derived
  var dims = auth.dimensions || pvDeriveDimensions(a, cand);

  // GATES — authored or derived
  var gates = (auth.gates || pvDeriveGates(a, cand, input)).slice();

  // DISPOSITION
  var disposition = auth.disposition || pvDeriveDisposition(a, f5, riskLevel, gates);

  // REQ GROUPS (mini heatmap)
  var reqGroups = pvDeriveReqGroups(a, cand, input, auth);

  // COVERAGE
  var cov = auth.evidenceCoverage || pvDeriveCoverage(a, cand, dims);

  // OPEN ISSUES
  var openIssues = auth.openIssues != null ? auth.openIssues :
    (gates.length + dims.filter(function(d){return d.concern === 'Insufficient evidence';}).length);

  return {
    id: a && a.id, name: a && a.name, rank: a && a.rank,
    ofN: ((input.suppliers || []).length) || null,
    eligible: !!(a && a.eligible),
    disposition: disposition,
    fit: {score5: f5, score100: f100, label: fitLabel},
    risk: {level: riskLevel, score5: r5 != null ? rnd(r5, 1) : null, confidence: auth.riskConfidence || 'Low'},
    evidenceConfidence: auth.evidenceConfidence || 'Low',
    criticality: auth.criticality || '—',
    openIssues: openIssues,
    gates: gates,
    dimensions: dims,
    reqGroups: reqGroups,
    opportunities: auth.opportunities || pvDeriveOpps(cand),
    concerns: auth.concerns || pvDeriveConcerns(cand),
    evidenceCoverage: cov,
    risks: auth.risks || [],
    events: auth.events || pvDeriveEvents(cand),
    ownership: auth.ownership || null,
    locations: auth.locations || null,
    capabilities: auth.capabilities || null,
    references: auth.references || null,
    commercialDrivers: auth.commercialDrivers || null,
    diligence: auth.diligence || null,
    actions: auth.actions || null,
    _authored: !!auth.dimensions
  };
}

function pvDeriveEvents(cand) {
  var dd = (cand && cand.deepDive) || {};
  var ri = (dd.riskPosture && dd.riskPosture.recentIssues) || [];
  return ri.map(function(ev){
    var cat = String(ev.category || '').toLowerCase();
    var direct = /outage|breach|cyber|security|incident|recall|enforcement/.test(cat) ? 'Affects the service'
               : /financ|governance|litig|earnings/.test(cat) ? 'Affects the operating division'
               : 'Parent-company context';
    return {date: ev.date || '', title: ev.title || '', directness: direct, detail: ev.detail || '', resolution: ''};
  });
}

function pvDeriveDimensions(a, cand) {
  var risk = (cand && cand.risk) || {};
  var f5 = (a && a.fitScore != null) ? a.fitScore / 20 : null;
  var inv = function(v){ return v == null ? {c:'Insufficient evidence', cf:'Low'} : v < 1.75 ? {c:'Low', cf:'Medium'} : v < 2.5 ? {c:'Moderate', cf:'Medium'} : v < 3.25 ? {c:'High', cf:'Medium'} : {c:'Critical', cf:'Medium'}; };
  var capC = f5 == null ? {c:'Insufficient evidence', cf:'Low'} : f5 >= 4 ? {c:'Strong', cf:'Medium'} : f5 >= 3 ? {c:'Moderate', cf:'Medium'} : {c:'High', cf:'Low'};
  var insuf = {c:'Insufficient evidence', cf:'Low'};
  var mk = function(id, label, o, ev){ return {id:id, label:label, concern:o.c, confidence:o.cf, evidence:ev || ''}; };
  return [
    mk('identity',   'Identity & ownership',   insuf, 'Not independently verified from public sources.'),
    mk('capability', 'Capability & fit',       capC,  'Derived from the requirements-fit score.'),
    mk('financial',  'Financial viability',    inv(risk.financial), 'Derived from the financial-stability signal.'),
    mk('resilience', 'Operational resilience', inv(risk.lockin != null ? risk.lockin : risk.geo), 'Derived from lock-in / concentration signals.'),
    mk('integrity',  'Integrity & compliance', insuf, 'No public screening performed.'),
    mk('quality',    'Quality & regulatory',   insuf, 'No certification / inspection evidence gathered.'),
    mk('cyber',      'Cyber & privacy',        inv(risk.security), 'Derived from the security-posture signal.'),
    mk('responsible','Responsible sourcing',   insuf, 'Not assessed.')
  ];
}

function pvDeriveGates(a, cand, input) {
  var gates = [];
  var risk = (cand && cand.risk) || {};
  if (risk.financial != null && risk.financial >= 3.25) gates.push({kind:'escalate', label:'Financial-failure risk', why:'Elevated financial-stability risk on the public signal; verify viability before advancing.'});
  // must-have gap → escalation
  var reqs = (input.requirements || []); var rf = (cand && cand.reqFit) || {};
  var gap = reqs.filter(function(r){ return r.must && rf[r.id] != null && rf[r.id] < 3.5; });
  if (gap.length) gates.push({kind:'escalate', label:'Must-have below threshold', why:gap.length + ' must-have requirement(s) score below 3.5/5; confirm before advancing.'});
  return gates;
}

function pvDeriveDisposition(a, f5, riskLevel, gates) {
  if (!(a && a.eligible)) return 'Screened out';
  if (gates.some(function(g){ return g.kind === 'hard'; })) return 'Do not advance';
  if (f5 == null) return 'Hold as alternate';
  var hasEsc = gates.some(function(g){ return g.kind === 'escalate'; });
  if (f5 >= 3.75 && riskLevel !== 'Critical' && riskLevel !== 'High') return hasEsc ? 'Advance with conditions' : 'Advance';
  if (f5 >= 3.0) return 'Hold as alternate';
  return 'Do not advance';
}

function pvDeriveReqGroups(a, cand, input, auth) {
  var reqs = (input.requirements) || [], rf = (cand && cand.reqFit) || {};
  var over = (auth && auth.reqGroupOverride) || {};
  return reqs.map(function(r){
    var v = rf[r.id];
    var lbl = over[r.id] || (v == null ? 'Unknown' : v >= 4.25 ? 'Strong' : v >= 3.75 ? 'Meets' : v >= 2.75 ? 'Partial' : 'Gap');
    return {id:r.id, label:r.label, fit:v, fitLabel:lbl, must:!!r.must};
  });
}

function pvDeriveCoverage(a, cand, dims) {
  var known = dims.filter(function(d){ return d.concern !== 'Insufficient evidence'; }).length;
  var tot = dims.length || 8;
  var verified = Math.round(known / tot * 40);
  var partial = Math.round(known / tot * 25);
  var supplier = 15;
  var missing = Math.max(0, 100 - verified - partial - supplier);
  return {verified:verified, partial:partial, supplier:supplier, missing:missing};
}

function pvDeriveOpps(cand) {
  var dd = (cand && cand.deepDive) || {};
  return (dd.strengths || []).slice(0, 3);
}
function pvDeriveConcerns(cand) {
  var dd = (cand && cand.deepDive) || {};
  return (dd.risksNarr || []).slice(0, 3).map(function(r){ return r.detail || r.cat; });
}

/* ============================ RENDER PRIMITIVES ============================ */
function pvAEsc(s){ return (typeof escD === 'function') ? escD(s) : String(s == null ? '' : s); }

function pvDispBadge(disp) {
  var m = THEO_DISPO[disp] || THEO_DISPO['Screened out'];
  return '<span style="display:inline-flex;align-items:center;font:700 10px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;padding:4px 11px;border-radius:30px;color:' + m.c + ';background:' + m.bg + '">' + pvAEsc(disp) + '</span>';
}

function pvConfDots(level) {
  var n = level === 'High' ? 3 : level === 'Medium' ? 2 : 1;
  var dots = '';
  for (var i = 0; i < 3; i++) dots += '<i style="width:5px;height:5px;border-radius:50%;background:' + (i < n ? 'var(--mut,#4A443C)' : 'var(--line2,#CECCC7)') + '"></i>';
  return '<span title="Confidence: ' + pvAEsc(level) + '" style="display:inline-flex;gap:2px;align-items:center;vertical-align:1px">' + dots + '</span>';
}

function pvEvidChip(state) {
  var m = THEO_EVID[state] || THEO_EVID['Missing'];
  var box = m.fill === 'solid' ? 'background:' + m.c :
            m.fill === 'hatch' ? 'background:repeating-linear-gradient(45deg,' + m.c + ' 0 2px,transparent 2px 4px);border:1px solid ' + m.c :
            m.fill === 'outline' ? 'border:1.5px solid ' + m.c :
            'border:1px dashed var(--line2,#CECCC7)';
  return '<span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--mut,#4A443C)"><i style="width:10px;height:10px;border-radius:3px;flex:none;' + box + '"></i>' + pvAEsc(state) + '</span>';
}

function pvConcernPill(concern, confidence) {
  var m = THEO_CONCERN[concern] || THEO_CONCERN['Insufficient evidence'];
  return '<span style="display:inline-flex;align-items:center;gap:7px;font:700 10px var(--mono,monospace);letter-spacing:.03em;text-transform:uppercase;padding:3px 9px;border-radius:20px;color:' + m.c + ';background:' + m.bg + '">' + pvAEsc(concern) + (confidence ? ' ' + pvConfDots(confidence) : '') + '</span>';
}

/* 8-dimension assessment bars: bar length = favorability, colour = concern,
   fill style = confidence (solid=High, striped=Medium, outline=Low). */
function pvAssessBars(dims) {
  var rows = dims.map(function(d){
    var m = THEO_CONCERN[d.concern] || THEO_CONCERN['Insufficient evidence'];
    var pct = Math.round((m.fav || 0) * 100);
    var fill = d.confidence === 'High' ? 'background:' + m.c :
               d.confidence === 'Medium' ? 'background:repeating-linear-gradient(90deg,' + m.c + ' 0 6px,transparent 6px 9px)' :
               'background:transparent;border:1.5px solid ' + m.c;
    var track = pct === 0 ? '<div style="height:9px;border-radius:30px;border:1px dashed var(--line2,#CECCC7)"></div>'
      : '<div style="height:9px;border-radius:30px;background:var(--line,#E1E0DC);overflow:hidden"><i style="display:block;height:100%;width:' + pct + '%;border-radius:30px;' + fill + '"></i></div>';
    return '<div style="display:grid;grid-template-columns:168px 1fr 150px;gap:12px;align-items:center;padding:6px 0">'
      + '<span style="font-size:12.5px;font-weight:600;color:var(--ink,#1A1A1A)">' + pvAEsc(d.label) + '</span>'
      + track
      + '<span style="display:flex;align-items:center;gap:7px;justify-content:flex-end"><span style="font-size:11.5px;font-weight:700;color:' + m.c + '">' + pvAEsc(d.concern) + '</span>' + pvConfDots(d.confidence) + '</span>'
      + '</div>';
  }).join('');
  return '<div>' + rows + '</div>';
}

/* segmented evidence-coverage bar */
function pvEvidCoverageBar(cov) {
  cov = cov || {};
  var segs = [
    ['Verified', cov.verified || 0, 'var(--teal-d,#2F6E6B)'],
    ['Partial', cov.partial || 0, '#8A5A00'],
    ['Supplier input', cov.supplier || 0, 'var(--plum,#5C2B50)'],
    ['Missing', cov.missing || 0, 'var(--line2,#CECCC7)']
  ];
  var bar = '<div style="display:flex;height:12px;border-radius:30px;overflow:hidden;border:1px solid var(--line,#E1E0DC)">'
    + segs.map(function(s){ return s[1] > 0 ? '<i title="' + pvAEsc(s[0]) + ' ' + s[1] + '%" style="width:' + s[1] + '%;background:' + s[2] + '"></i>' : ''; }).join('') + '</div>';
  var key = '<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:8px;font-size:11.5px;color:var(--mut,#4A443C)">'
    + segs.map(function(s){ return '<span style="display:flex;align-items:center;gap:6px"><i style="width:10px;height:9px;border-radius:2px;background:' + s[2] + '"></i>' + pvAEsc(s[0]) + ' <b style="font-family:var(--mono,monospace);color:var(--ink,#1A1A1A)">' + s[1] + '%</b></span>'; }).join('') + '</div>';
  return bar + key;
}

/* requirements-group mini heatmap (semantic cells) */
function pvReqGroupMini(reqGroups) {
  var col = function(lbl){ return lbl === 'Strong' ? '#0F3A85' : lbl === 'Meets' ? '#2F6E6B' : lbl === 'Partial' ? '#8A5A00' : lbl === 'Validate' ? '#8A5A00' : lbl === 'Gap' ? '#A23A30' : 'var(--mut2,#6a655f)'; };
  var bg = function(lbl){ return lbl === 'Strong' ? 'var(--ti-blue,#E4EBF1)' : lbl === 'Meets' ? '#DCEBE9' : lbl === 'Partial' || lbl === 'Validate' ? 'var(--ti-amber,#FBF1DA)' : lbl === 'Gap' ? 'var(--ti-red,#FBE7E3)' : 'var(--nested,#f1efec)'; };
  return '<div style="display:flex;flex-direction:column;gap:5px">' + reqGroups.map(function(g){
    return '<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:7px 11px;border-radius:9px;background:' + bg(g.fitLabel) + '">'
      + '<span style="font-size:12.5px;font-weight:600;color:var(--ink,#1A1A1A)">' + pvAEsc(g.label) + (g.must ? ' <span style="font:700 8px var(--mono,monospace);color:#A23A30;letter-spacing:.03em">MUST</span>' : '') + '</span>'
      + '<span style="font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:' + col(g.fitLabel) + '">' + pvAEsc(g.fitLabel) + (g.fit != null ? ' · ' + g.fit : '') + '</span>'
      + '</div>';
  }).join('') + '</div>';
}

/* two side-by-side visual lists: opportunities vs concerns */
function pvOppConcern(opps, concerns) {
  var list = function(title, items, color, mark){
    return '<div><div style="font:700 10px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:' + color + ';margin-bottom:8px">' + title + '</div>'
      + (items && items.length ? items.slice(0, 3).map(function(t){ return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--line,#E1E0DC);font-size:12.5px;line-height:1.45"><span style="color:' + color + ';font-weight:800;flex:none">' + mark + '</span><span>' + pvAEsc(t) + '</span></div>'; }).join('') : '<div style="font-size:12px;color:var(--mut2,#6a655f)">None on file.</div>') + '</div>';
  };
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'
    + list('Reasons to advance', opps, '#1F7A5A', '✓')
    + list('Material concerns', concerns, '#A23A30', '●')
    + '</div>';
}

/* compact decision-header strip (replaces the two big header bands) */
function pvDecisionHeaderStrip(x) {
  var cell = function(lab, val){ return '<div style="min-width:0"><div style="font:600 9.5px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--mut2,#6a655f);margin-bottom:4px">' + lab + '</div><div style="font-size:13px;font-weight:700;color:var(--ink,#1A1A1A);line-height:1.25">' + val + '</div></div>'; };
  var rl = THEO_RISKBAND[x.risk.level] || THEO_RISKBAND['Unknown'];
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:18px 22px;align-items:start;background:var(--surface,#fff);border:1px solid var(--line,#E1E0DC);border-radius:14px;padding:16px 20px;box-shadow:var(--shadow,0 1px 4px rgba(38,30,20,.08))">'
    + cell('Recommendation', pvDispBadge(x.disposition))
    + cell('Rank', x.rank ? (x.rank + ' of ' + (x.ofN || '—')) : '—')
    + cell('Requirements fit', pvAEsc(x.fit.label) + (x.fit.score5 != null ? ' <span style="font-family:var(--mono,monospace);color:var(--mut,#4A443C);font-weight:600">' + x.fit.score5 + '/5</span>' : ''))
    + cell('Risk posture', '<span style="color:' + rl.c + '">' + pvAEsc(x.risk.level) + '</span>' + (x.risk.score5 != null ? ' <span style="font-family:var(--mono,monospace);color:var(--mut,#4A443C);font-weight:600">' + x.risk.score5 + '</span>' : ''))
    + cell('Evidence confidence', pvAEsc(x.evidenceConfidence) + ' ' + pvConfDots(x.evidenceConfidence))
    + cell('Open issues', String(x.openIssues))
    + '</div>';
}

/* semantic risk cell (for the Risk tab heatmap) */
function pvSemanticRiskCell(level, confidence) {
  var m = THEO_RISKBAND[level] || THEO_RISKBAND['Unknown'];
  return '<span style="display:inline-flex;align-items:center;gap:7px;font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:20px;color:' + m.c + ';background:' + m.bg + '">' + pvAEsc(level) + (confidence ? ' ' + pvConfDots(confidence) : '') + '</span>';
}
