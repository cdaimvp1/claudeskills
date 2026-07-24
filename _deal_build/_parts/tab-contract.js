/* =============================================================================
 * tab-contract.js, "Terms & Review" tab builder for the Deal artifact (id `contract`).
 * Question this tab answers: "can I trust the paper?"
 * Subtabs: 2A Documents & Conflicts (map) · 2B Legal & Protection (legal) ·
 *          2C Scope & Performance (scope, adaptive on meta.contractSet).
 *
 * Reads ONLY from dashboardData (param d). Every material value carries an
 * evidenceChip; every count/derived figure is computed live from d, never
 * hard-coded, so it stays consistent if the underlying model changes.
 * Depends on globals from helpers.js (esc, money, icon, saCard, dataTable, …)
 * which are loaded before this file. Attaches:
 *   window.renderTab_contract(d)  , the function itself
 *   window.DealTabs.contract      , same fn, per the shell's tab-builder convention
 *
 * BUG FIX (was tab-contract.js:111-121): the cross-document conflict table used
 * to be a hardcoded `crossRows` array. It now renders from d.documentConflicts[]
 * (see renderDocMap -> crossCard below). No fact is restated in this file that
 * isn't already in the canonical data object.
 * ========================================================================== */
(function (global) {
'use strict';

/* ---------- small local utilities (this file only) ------------------------ */
const ROLE_LABEL = { governing:'Governing', ordering:'Ordering', scope:'Scope',
                     data:'Data', security:'Security', correspondence:'Correspondence', reference:'Reference' };
function roleLabel(role) { return ROLE_LABEL[role] || role; }
function findDoc(id, d) { return (d.documents || []).find(x => x.id === id); }
function docTypeOf(id, d) { const doc = findDoc(id, d); return doc ? doc.type : id; }
function gapForDocId(docId, d) { return (d.gaps || []).find(g => (g.input || '').indexOf(docId) !== -1); }
function sevRank(p) { return ({ 'hard-stop':4, high:3, medium:2, low:1 })[p] || 0; }
function decisionLabel(v) { return ({ pending:'Pending', accept:'Accepted', reject:'Rejected', trade:'Trade' })[v] || v; }
function hasRealHardStop(text) { return !!text && !/^none\b/i.test(text.trim()); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function cap1(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

// findings-register jump target lives on THIS tab now (Terms & Risk merged into
// 2B Legal & Protection). Every internal cross-reference to "the register" points
// here, not the old standalone "terms" subtab.
const JUMP_LEGAL = 'tab:contract/sub:legal';
const JUMP_MAP = 'tab:contract/sub:map';
// Deep gap/source detail now lives on THIS tab's Sources & Evidence subtab
// (moved off Overview); every "view gap detail" jump points there.
const JUMP_GAPS = 'tab:contract/sub:sources';

function issueJump(id, priority) {
  return jumpLink(id, JUMP_LEGAL) + (priority ? ' ' + severityPill(priority) : '');
}

/* ============================================================================
 * SUBTAB 2A, Documents & Conflicts
 * ========================================================================== */
function docNode(doc, isRoot) {
  const missing = doc.isMissing || doc.evidenceType === 'unavailable';
  const cls = 'ddm-child' + (missing ? ' ddm-missing' : '') + (isRoot ? ' ddm-rootbox' : '');
  const skey = missing ? 'deviation' : (doc.active === 'Active' ? 'aligned' : 'pending');
  return '<div class="' + cls + '">' +
    '<div class="ddm-name">' + esc(doc.name) + '</div>' +
    '<div class="ddm-meta">' + esc(doc.type) + (doc.precedenceRank ? ' &middot; precedence ' + doc.precedenceRank : '') + '</div>' +
    '<div class="ddm-bottom">' + statusPill(skey, doc.active) +
      (doc.controlling ? ' <span class="tiny" style="color:var(--pri-tx);font-weight:700">Controlling</span>' : '') + '</div>' +
  '</div>';
}

function renderDocMap(d) {
  const docs = d.documents || [];
  const root = docs.find(x => x.controlling) || docs.find(x => x.role === 'governing') || docs[0];
  const inHierarchy = docs.filter(x => x !== root && x.role !== 'correspondence');
  const missingDocs = docs.filter(x => x.isMissing);
  const relMeta = d.documentRelevanceMeta || {};

  /* ---- 1. Condensed relationship map (hierarchy only, no narrative blurbs) ---- */
  const treeHtml =
    '<div class="ddm-tree">' +
      '<div class="ddm-root">' + docNode(root, true) + '</div>' +
      '<div class="ddm-branch"></div>' +
      '<div class="ddm-children">' + inHierarchy.map(c => docNode(c, false)).join('') + '</div>' +
    '</div>';
  const docMapCard = saCard('Document Relationship Map', treeHtml,
    { icon:'doc', sub: esc(root.type) + ' governs ' + inHierarchy.filter(c => !c.isMissing).length + ' documents &middot; ' + missingDocs.length + ' referenced, not provided' });

  /* ---- 2. Document Family Register: ordered by precedence; carries executed /
   * expiration / active + controlling and ONE Governing Terms & Precedence column;
   * the referenced-but-missing components (DPA, Exhibit) are folded in as gap rows. ---- */
  const ordered = docs.slice().sort((a, b) => precSort(a) - precSort(b));
  const regCols = [
    { key:'name', label:'Document', render: r => '<strong>' + esc(r.name) + '</strong><div class="tiny muted">' + esc(r.type) + '</div>' },
    { key:'executedDate', label:'Executed', width:'116px', sortVal: r => r.executedDate || '', render: r => r.executedDate ? esc(r.executedDate) : '<span class="tiny muted">Not executed</span>' },
    { key:'expirationDate', label:'Expiration', width:'106px', sortVal: r => r.expirationDate || '', render: r => r.expirationDate ? esc(r.expirationDate) : '<span class="tiny muted">&mdash;</span>' },
    { key:'active', label:'Status', width:'176px', sortVal: r => r.active || '', render: r => statusPill(statusKey(r), r.active) + (r.controlling ? ' <strong style="color:var(--pri-tx);font-size:var(--fz-meta)">Controlling</strong>' : '') },
    { key:'prec', label:'Governing terms & precedence', sort:false, render: r => precedenceCell(r) }
  ];
  const regTable = dataTable(regCols, ordered, {
    zebra:true, dense:true, id:'tbl-doc-register',
    rowClass: r => r.isMissing ? 'rowtint-warn' : '',
    expand: r => {
      const related = (r.relatedTo || []).map(id => { const rd = findDoc(id, d); return rd ? rd.type + ' (' + rd.id + ')' : id; }).join(', ');
      const lim = (r.limitations || []).length ? insight(esc(r.limitations.join(' ')), 'warn') : '';
      const basis = r.precedenceBasis ? '<dt>Precedence basis</dt><dd>' + esc(r.precedenceBasis.text) + ' ' + evidenceChip(r.precedenceBasis.evidenceType, { short:true }) + '</dd>' : '';
      return '<div class="kv">' +
        '<dt>Relevance</dt><dd>' + cap1(r.relevance) + ': ' + esc(r.relevanceNote) + '</dd>' +
        '<dt>Source</dt><dd>' + esc(r.sourceType) + '</dd>' +
        '<dt>Related to</dt><dd>' + (related || '&mdash;') + '</dd>' +
        basis +
      '</div>' + lim +
        (r.isMissing ? '<div class="btn-row">' + jumpLink('View gap detail &rarr;', JUMP_GAPS) + '</div>' : '');
    }
  });
  const regNote =
    insight('Rows are ordered by governing precedence. Precedence is our read of a standard MSA + Order Form + SOW structure; no express order-of-precedence clause appeared in the MSA v3 redline this session. ' + evidenceChip('inference', { short:true })) +
    (relMeta.indirectPresent === false
      ? insight('<strong>Direct relevance only.</strong> ' + esc(relMeta.indirectNote) + ' ' + evidenceChip(relMeta.evidenceType || 'unavailable', { short:true }))
      : '');
  const regCard = saCard('Document Family Register', regTable + regNote,
    { icon:'sources', accent:'teal', sub: docs.length + ' documents, by precedence' });

  /* ---- 3. Cross-document conflicts & gaps (redesigned; renderConflicts below) ---- */
  const conflictsCard = renderConflicts(d);

  return '<div class="tab-intro"><h2>Documents &amp; Conflicts</h2><p class="q">The document family for this deal, ordered by governing precedence, and the cross-document gaps still to resolve. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + docMapCard + '</div>' +
      '<div class="col-12">' + regCard + '</div>' +
      '<div class="col-12">' + conflictsCard + '</div>' +
    '</div>';
}

/* ---- precedence helpers for the register (order the rows + render the one column) ---- */
function precSort(doc) {
  if (doc.precedenceRank) return doc.precedenceRank;   // 1,2,3 for the ranked contracts
  return doc.isMissing ? 90 : 99;                      // missing components, then correspondence, last
}
function statusKey(doc) {
  if (doc.isMissing) return 'deviation';
  if (doc.active === 'Active') return 'aligned';
  if (doc.active === 'In negotiation' || doc.active === 'Draft') return 'pending';
  return 'muted';
}
function precedenceCell(doc) {
  if (doc.precedenceRank) {
    const role = doc.controlling ? 'Controlling master' : 'Operates under the MSA';
    return '<strong>' + doc.precedenceRank + '</strong> <span class="tiny muted">' + role + '</span> ' +
      evidenceChip((doc.precedenceBasis && doc.precedenceBasis.evidenceType) || 'inference', { short:true });
  }
  if (doc.isMissing) return '<span class="tiny muted">Referenced component, rank pending</span> ' + evidenceChip('unavailable', { short:true });
  return '<span class="tiny muted">Supporting, not governing</span>';
}

/* ============================================================================
 * Cross-document conflicts & gaps (redesigned). Surfaces ONLY rows tagged with a
 * trigger (active-conflict | risk | gap); fully-consistent checks are excluded.
 * Purpose: flag unresolved gaps + (once they exist) trace term changes across versions.
 * ========================================================================== */
const TRIGGER_META = {
  'active-conflict': { key:'danger', label:'Active conflict', rank:3 },
  risk:              { key:'warn',   label:'Risk',            rank:2 },
  gap:               { key:'warn',   label:'Gap',             rank:1 }
};
function renderConflicts(d) {
  const all = d.documentConflicts || [];
  const shown = all.filter(c => c.trigger).slice().sort((a, b) =>
    ((TRIGGER_META[b.trigger] || {}).rank || 0) - ((TRIGGER_META[a.trigger] || {}).rank || 0));
  const excluded = all.length - shown.length;
  const trigPill = t => { const m = TRIGGER_META[t] || { key:'muted', label:t }; return '<span class="pill ' + m.key + '">' + m.label + '</span>'; };
  const cols = [
    { key:'trigger', label:'Trigger', width:'128px', sortVal: r => (TRIGGER_META[r.trigger] || {}).rank || 0, render: r => trigPill(r.trigger) },
    { key:'topic', label:'Term / clause', render: r => '<strong>' + esc(r.topic) + '</strong>' },
    { key:'docs', label:'Documents', sort:false, render: r => docTypeOf(r.docA, d) + ' &harr; ' + docTypeOf(r.docB, d) },
    { key:'note', label:'What is unresolved', sort:false, render: r => '<span class="tiny">' + esc(r.note) + '</span>' },
    { key:'issue', label:'Linked finding', sort:false, render: r => r.issueId ? issueJump(r.issueId, (d.issues.find(i => i.id === r.issueId) || {}).priority) : '&mdash;' }
  ];
  const table = shown.length
    ? dataTable(cols, shown, { zebra:true, dense:true, id:'tbl-crossdoc' })
    : gapCard('No active conflicts, risks, or gaps', 'Every cross-document check in session is consistent; nothing to raise.');
  const gapCount = shown.filter(c => c.trigger === 'gap').length;
  const insights =
    insight('<strong>' + shown.length + '</strong> of ' + all.length + ' cross-document checks need resolving' +
      (shown.length && gapCount === shown.length ? '; all ' + shown.length + ' are <strong>gaps from the two missing exhibits</strong> (DPA, Security Exhibit), not contradictions between documents in session' : '') +
      '. The ' + excluded + ' fully-consistent checks are not shown. ' + evidenceChip('unavailable', { short:true }), shown.length ? 'warn' : '') +
    insight('No term-modification history to trace yet: this is a new MSA with no amendments or change orders, and the one version step in session (MSA v2 to v3) held the liability cap unchanged. A row will appear here once a term actually changes across versions.');
  return saCard('Cross-Document Conflicts & Gaps', table + insights, { icon:'scale', sub: shown.length + ' to resolve' });
}

/* ============================================================================
 * SUBTAB 2D, Sources & Evidence, the full evidence ledger moved off Overview
 * (source inventory + impact-vs-ease matrix + full missing-inputs register).
 * ========================================================================== */
function renderSourceInventory(d) {
  return dataTable([
    { key:'id', label:'ID', width:'80px' },
    { key:'label', label:'Source', render: r => '<strong>' + esc(r.label) + '</strong><div class="tiny muted">' + esc(r.detail) + '</div>' },
    { key:'kind', label:'Kind', render: r => '<span style="text-transform:capitalize">' + esc(r.kind) + '</span>' },
    { key:'coverage', label:'Areas', align:'num', sortVal: r => r.coverage.length, render: r => String(r.coverage.length) },
    { key:'evidenceType', label:'Evidence', render: r => evidenceChip(r.evidenceType, { short:true }) }
  ], d.sources || [], {
    id:'tc-source-inventory', zebra:true,
    expand: r => '<div class="kv"><dt>Coverage areas</dt><dd>' + (r.coverage || []).map(a => '<span class="tiny">' + esc(a) + '</span>').join(', ') + '</dd>' +
      '<dt>Detail</dt><dd>' + esc(r.detail) + '</dd><dt>Evidence</dt><dd>' + evidenceChip(r.evidenceType) + '</dd></div>'
  });
}
function renderGapsMatrix(d) {
  const points = (d.gaps || []).map(g => ({
    x: g.ease, y: g.decisionImpact, label: g.id.replace('GAP-', ''),
    color: g.priority === 'critical' ? 'danger' : g.priority === 'important' ? 'emph' : 'teal',
    title: g.input + ' (' + g.priority + ') impact ' + g.decisionImpact + '/5, ease ' + g.ease + '/5'
  }));
  return matrixPlot(points, {
    xLabel: 'Ease to obtain →', yLabel: 'Decision impact →', xMax: 5, yMax: 5,
    quadrants: ['Hard, high stakes', 'Quick win: get first', 'Low priority', 'Easy, low value']
  });
}
function renderAllGapsTable(d) {
  const rank = { critical:3, important:2, helpful:1 };
  const gaps = (d.gaps || []).slice().sort((a, b) => {
    const pr = (rank[b.priority] || 0) - (rank[a.priority] || 0);
    return pr !== 0 ? pr : (b.decisionImpact || 0) - (a.decisionImpact || 0);
  });
  const cols = [
    { key:'id', label:'ID', width:'74px' },
    { key:'input', label:'Missing input', render: r => '<strong>' + esc(r.input) + '</strong><div class="tiny muted">' + esc(r.whyItMatters) + '</div>' },
    { key:'priority', label:'Priority', width:'98px', sortVal: r => rank[r.priority] || 0, render: r => '<span class="pill ' + (r.priority === 'critical' ? 'danger' : r.priority === 'important' ? 'warn' : 'muted') + '">' + esc(r.priority) + '</span>' },
    { key:'impact', label:'Impact', width:'86px', align:'num', sortVal: r => r.decisionImpact, render: r => heatCell(r.decisionImpact, { scale:5, label:r.decisionImpact, title:'Decision impact ' + r.decisionImpact + '/5' }) },
    { key:'ease', label:'Ease', width:'80px', align:'num', sortVal: r => r.ease, render: r => heatCell(r.ease, { scale:5, label:r.ease, title:'Ease ' + r.ease + '/5' }) },
    { key:'src', label:'Possible source', sort:false, render: r => '<span class="tiny muted">' + esc(r.possibleSource || '') + '</span>' }
  ];
  return dataTable(cols, gaps, { id:'tc-all-gaps', zebra:true, dense:true });
}
function renderSourcesEvidence(d) {
  const invCard = saCard('Source Inventory',
    renderSourceInventory(d) + insight('All ' + (d.sources || []).length + ' sources behind this analysis, with the count of analysis areas each one covers. Expand a row for its coverage detail.'),
    { icon:'sources', accent:'teal', sub: (d.sources || []).length + ' sources' });
  const matrixCard = saCard('Missing Inputs, Impact vs. Ease', renderGapsMatrix(d),
    { icon:'gap', sub: (d.gaps || []).length + ' gaps' });
  const gapsCard = saCard('All Missing Inputs',
    renderAllGapsTable(d) + insight('The full gap register (Overview shows only the top 5). Quick wins, high decision impact and easy to obtain, are worth closing before the next draft.'),
    { icon:'flag', accent:'emph', sub: (d.gaps || []).length + ' tracked' });
  return '<div class="tab-intro"><h2>Sources &amp; Evidence</h2><p class="q">The full evidence ledger behind this deal: every source, and every missing input with how much it would move the decision. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + invCard + '</div>' +
      '<div class="col-5">' + matrixCard + '</div>' +
      '<div class="col-7">' + gapsCard + '</div>' +
    '</div>';
}

/* ============================================================================
 * SUBTAB 2B, Legal & Protection
 * ========================================================================== */

/* ---- Protection Score gauge (semicircular, banded, mandatory methodology) --- */
function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}
function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polar(cx, cy, r, startDeg), e = polar(cx, cy, r, endDeg);
  const large = (startDeg - endDeg) > 180 ? 1 : 0;
  return 'M ' + s.x.toFixed(2) + ' ' + s.y.toFixed(2) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + e.x.toFixed(2) + ' ' + e.y.toFixed(2);
}
// Only Critical uses red. Locked palette (plum/teal/burnt-orange + red-critical-only).
const PROTECTION_BANDS = [
  { key:'Critical', range:'below 45', v:'var(--danger-bar)' },
  { key:'Weak',     range:'45–64',    v:'var(--warn-bar)' },
  { key:'Adequate', range:'65–79',    v:'var(--sec)' },
  { key:'Strong',   range:'80–100',   v:'var(--ok-bar)' }
];
function bandColor(band) {
  const hit = PROTECTION_BANDS.find(b => b.key.toLowerCase() === String(band || '').toLowerCase());
  return hit ? hit.v : 'var(--mut2)';
}
function protectionGauge(protection) {
  const score = clamp(Math.round(protection.score), 0, 100);
  const cx = 110, cy = 104, r = 82, sw = 20;
  const bg = arcPath(cx, cy, r, 180, 0);
  const fg = arcPath(cx, cy, r, 180, 180 - 1.8 * score);
  const color = bandColor(protection.band);
  const svg =
    '<svg viewBox="0 0 220 122" class="pg-svg" role="img" aria-label="Protection score ' + score + ' of 100, band ' + esc(protection.band) + '">' +
      '<path d="' + bg + '" stroke="var(--line2)" stroke-width="' + sw + '" fill="none" stroke-linecap="round"/>' +
      (score > 0 ? '<path d="' + fg + '" stroke="' + color + '" stroke-width="' + sw + '" fill="none" stroke-linecap="round"/>' : '') +
    '</svg>';
  const legend = PROTECTION_BANDS.map(b => {
    const cur = b.key.toLowerCase() === String(protection.band || '').toLowerCase();
    return '<span class="pg-leg' + (cur ? ' pg-leg-cur' : '') + '"><i style="background:' + b.v + '"></i>' + esc(b.key) + ' ' + esc(b.range) + '</span>';
  }).join('');
  return '<div class="pg-wrap">' + svg +
      '<div class="pg-score" style="color:' + color + '">' + score + '<span class="pg-max">/100</span></div>' +
      '<div class="pg-band">' + esc(protection.band) + ' protection</div>' +
    '</div>' +
    '<div class="pg-legend">' + legend + '</div>' +
    '<div class="divider"></div>' +
    '<div class="card-note" style="margin-top:0"><strong>Methodology.</strong> ' + esc(protection.methodology) + '</div>' +
    '<div style="margin-top:8px">' + evidenceChip(protection.evidenceType) + '</div>';
}

/* ---- Deduction table ---- */
function renderDeductions(protection) {
  const rows = protection.deductions || [];
  const cols = [
    { key:'category', label:'Category', render: r => '<strong>' + esc(r.category) + '</strong>' },
    { key:'points', label:'Points', align:'num', width:'80px', render: r => '&minus;' + r.points, sortVal: r => r.points },
    { key:'reason', label:'Reason', sort:false, render: r => r.reason },
    { key:'issue', label:'Finding', sort:false, render: r => r.issueId ? issueJump(r.issueId) : '&mdash;' }
  ];
  const table = dataTable(cols, rows, { zebra:true, dense:true, id:'tbl-deductions' });
  const totalPts = rows.reduce((s, x) => s + (x.points || 0), 0);
  const reconciles = (100 - totalPts) === Math.round(protection.score);
  const check = insight('Deductions total <strong>&minus;' + totalPts + '</strong> points: 100 &minus; ' + totalPts + ' = <strong>' + (100 - totalPts) +
    '</strong>' + (reconciles ? ', matching the displayed score.' : ', does not match the displayed score (' + protection.score + '); flag for data QA.'),
    reconciles ? '' : 'danger');
  return saCard('Protection Score, Deductions', table + check, { icon:'flag', accent:'plum', sub: rows.length + ' deviations scored' });
}

/* ---- SME routing + verified/assumed derivation (see report: no dedicated data
 * field carries either of these. Both are deterministic, disclosed derivations
 * off fields that DO exist: category and evidenceType.) ---- */
const SME_ROUTE = {
  'Liability': 'Legal (Contracts)',
  'Data & Privacy': 'Legal (Privacy / DPO)',
  'Commercial': 'Category Lead / Finance',
  'Term & Renewal': 'Legal (Contracts)',
  'Service Levels': 'IT / Vendor Management',
  'IP': 'Legal (IP Counsel)',
  'Audit & Compliance': 'Compliance / Internal Audit',
  'Scope & Acceptance': 'Delivery PMO'
};
function smeRoute(category) { return SME_ROUTE[category] || 'Category Lead'; }
const VERIFIED_TYPES = ['contract', 'calculated', 'internal', 'public'];
function verifiedInfo(evidenceType) {
  return VERIFIED_TYPES.indexOf(evidenceType) !== -1
    ? { statusKey:'aligned', label:'VERIFIED' }
    : { statusKey:'pending', label:'ASSUMED' };
}

/* ---- Findings register (was "Terms & Risk"; now folds tacticFlag + SME route) --- */
function issueExpandHtml(iss, d) {
  const doc = findDoc(iss.documentId, d);
  const clauseBlock = collapsible(
    'View source clause &amp; playbook position',
    excerpt(iss.sourceExcerpt) +
    '<div class="divider"></div>' +
    '<div class="card-note"><strong>Playbook position:</strong> ' + esc(iss.playbookPosition) + '</div>'
  );
  const hardStopLine = hasRealHardStop(iss.hardStop) ? insight('<strong>Hard-stop line:</strong> ' + esc(iss.hardStop), 'danger') : '';
  const tf = iss.tacticFlag;
  const tacticBlock = (tf && tf.present)
    ? insight('<strong>Vendor tactic flagged:</strong> ' + esc(tf.tactic) + '. Triggering text: “' + esc(tf.triggeringText) + '” ' + evidenceChip(tf.evidenceType, { short:true }), 'warn')
    : '';
  const sourceChips = (iss.sourceIds || []).map(sid => {
    const src = (d.sources || []).find(s => s.id === sid);
    return evidenceChip(src ? src.evidenceType : 'internal', { short:true, sources:[sid] });
  }).join(' ');
  return '<div class="kv" style="margin-bottom:8px">' +
      '<dt>Clause</dt><dd>' + esc(iss.clause) + '</dd>' +
      '<dt>Document</dt><dd>' + (doc ? jumpLink(doc.type + ' (' + doc.id + ')', JUMP_MAP) : esc(iss.documentId)) + '</dd>' +
      '<dt>SME route</dt><dd>' + esc(smeRoute(iss.category)) + ' <span class="tiny muted">(derived from issue category)</span></dd>' +
      '<dt>Decision</dt><dd>' + statusPill(iss.internalDecision, decisionLabel(iss.internalDecision)) + '</dd>' +
    '</div>' +
    clauseBlock +
    '<div class="divider"></div>' +
    insight('<strong>Supplier position:</strong> ' + esc(iss.supplierPosition)) +
    insight('<strong>Deviation vs. playbook:</strong> ' + esc(iss.deviation), 'warn') +
    insight('<strong>Impact:</strong> ' + esc(iss.impact), 'danger') +
    insight('<strong>Recommended position:</strong> ' + esc(iss.recommendedPosition)) +
    insight('<strong>Fallback:</strong> ' + esc(iss.fallback)) +
    hardStopLine + tacticBlock +
    '<div class="divider"></div>' +
    insight('<strong>Supplier pushback:</strong> “' + esc(iss.supplierPushback) + '”') +
    insight('<strong>Recommended response:</strong> ' + esc(iss.recommendedResponse)) +
    insight('<strong>Trade opportunity:</strong> ' + esc(iss.tradeOpportunity)) +
    '<div class="btn-row" style="margin-top:8px">' + sourceChips + '</div>';
}

function issueRowHtml(iss, d) {
  const facet = (iss.priority + ' ' + iss.category).toLowerCase();
  const rowKey = iss.id;
  const ver = verifiedInfo(iss.evidenceType);
  const tf = iss.tacticFlag;
  return '<tr class="expandable" data-exprow="' + rowKey + '" data-rowkey="' + rowKey + '" data-facet="' + esc(facet) + '">' +
      '<td>' + esc(iss.id) + '</td>' +
      '<td><strong>' + esc(iss.title) + '</strong><div class="tiny muted">' + esc(iss.category) + '</div></td>' +
      '<td data-sv="' + sevRank(iss.priority) + '">' + severityPill(iss.priority) + '</td>' +
      '<td><span class="tiny muted">“' + esc(iss.sourceExcerpt) + '”</span></td>' +
      '<td>' + esc(iss.clause) + '</td>' +
      '<td>' + statusPill(ver.statusKey, ver.label) + '</td>' +
      '<td>' + esc(smeRoute(iss.category)) + '</td>' +
      '<td>' + esc(iss.impact) + '</td>' +
      '<td>' + (tf && tf.present ? '<span class="pill warn" title="' + esc(tf.tactic) + '">Flag</span>' : '<span class="tiny muted">&mdash;</span>') + '</td>' +
      '<td>' + evidenceChip(iss.evidenceType, { short:true, sources: iss.sourceIds }) + '</td>' +
    '</tr>' +
    '<tr class="expander-row is-hidden" data-expfor="' + rowKey + '"><td colspan="10"><div class="exp-inner">' + issueExpandHtml(iss, d) + '</div></td></tr>';
}

function renderFindingsRegister(d) {
  const issues = d.issues || [];
  const CATS = ['Liability','Data & Privacy','Commercial','Term & Renewal','Service Levels','IP','Audit & Compliance','Scope & Acceptance'];
  const catCounts = CATS.map(c => ({
    cat: c,
    count: issues.filter(i => i.category === c).length,
    hasHard: issues.some(i => i.category === c && i.priority === 'hard-stop'),
    hasHigh: issues.some(i => i.category === c && i.priority === 'high')
  })).filter(x => x.count > 0);
  const maxCat = Math.max.apply(null, catCounts.map(x => x.count)) || 1;
  const barsHtml = catCounts
    .sort((a, b) => b.count - a.count)
    .map(x => barRow(x.cat, x.count, maxCat, String(x.count), { color: x.hasHard ? 'danger' : (x.hasHigh ? 'warn' : 'teal') }))
    .join('');

  const prCounts = ['hard-stop','high','medium','low'].map(p => ({ p, count: issues.filter(i => i.priority === p).length }));
  const prLegend = '<div style="display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:10px">' +
    prCounts.map(x => '<span style="display:inline-flex;align-items:center;gap:6px">' + severityPill(x.p) + '<strong>' + x.count + '</strong></span>').join('') +
    '</div>';

  const hardIds = issues.filter(i => i.priority === 'hard-stop');
  const hardCats = Array.from(new Set(hardIds.map(i => i.category)));
  const tacticCount = issues.filter(i => i.tacticFlag && i.tacticFlag.present).length;
  const chartInsights =
    insight('<strong>' + hardIds.length + '</strong> hard-stop item' + (hardIds.length === 1 ? '' : 's') +
      ' (' + hardIds.map(i => i.id).join(', ') + ') sit in ' + hardCats.join(' and ') + ' &mdash; these block signature.', 'danger') +
    insight('<strong>' + prCounts.find(x => x.p === 'high').count + '</strong> high-priority issues remain open across ' +
      catCounts.filter(x => x.hasHigh).length + ' categories.', 'warn') +
    insight('<strong>' + tacticCount + '</strong> of ' + issues.length + ' findings show a flagged vendor negotiation tactic (see the Tactic column).');

  const chartCard = saCard('Findings by Category', barsHtml + prLegend + chartInsights,
    { icon:'bench', sub: issues.length + ' findings tracked' });

  /* ---- full filterable, expandable, sortable register ---- */
  const toolbar =
    '<div class="toolbar">' +
      '<input type="search" placeholder="Search findings, clauses, categories…" data-filter-input data-filter-for="tbl-findings-register">' +
      '<button class="chip-filter" data-filterchip="hard-stop" aria-pressed="false">Hard stop</button>' +
      '<button class="chip-filter" data-filterchip="high" aria-pressed="false">High</button>' +
      '<button class="chip-filter" data-filterchip="medium" aria-pressed="false">Medium</button>' +
      '<button class="chip-filter" data-filterchip="low" aria-pressed="false">Low</button>' +
      '<span class="spacer"></span>' +
      '<span class="filter-count">' + issues.length + ' of ' + issues.length + ' shown</span>' +
    '</div>';
  const registerTable =
    '<div class="tbl-wrap"><table class="dt zebra dense" id="tbl-findings-register">' +
      '<thead><tr>' +
        '<th data-sort="id">ID</th>' +
        '<th data-sort="title">Finding</th>' +
        '<th data-sort="priority">Priority</th>' +
        '<th>Evidence excerpt</th>' +
        '<th data-sort="clause">Cross-ref</th>' +
        '<th data-sort="verified">Verified</th>' +
        '<th data-sort="sme">SME route</th>' +
        '<th>$ Impact / consequence</th>' +
        '<th>Tactic</th>' +
        '<th>Evidence</th>' +
      '</tr></thead>' +
      '<tbody>' + issues.map(iss => issueRowHtml(iss, d)).join('') + '</tbody>' +
    '</table></div>';
  const registerCard = saCard('Findings Register, Full Detail',
    '<div data-filter-scope>' + toolbar + registerTable + '</div>',
    { icon:'flag', accent:'plum', sub:'click a row to expand' });

  return '<div class="col-4">' + chartCard + '</div><div class="col-8">' + registerCard + '</div>';
}

/* ---- 14-category severity x coverage (heatCell; Covered/Confirm/Gap) ---- */
function sevNum(s) { return ({ high:3, medium:2, low:1 })[s] || 1; }
function covPill(coverage) {
  const map = { Covered:['aligned','Covered'], Confirm:['pending','Confirm'], Gap:['deviation','Gap'] };
  const m = map[coverage] || ['muted', coverage];
  return statusPill(m[0], m[1]);
}
function renderCoverageHeatmap(protection) {
  const cats = protection.categories14 || [];
  const rollup = { Covered:0, Confirm:0, Gap:0 };
  cats.forEach(c => { rollup[c.coverage] = (rollup[c.coverage] || 0) + 1; });
  const rollupHtml = '<div class="btn-row" style="margin-bottom:10px;flex-wrap:wrap">' +
    covPill('Covered') + ' <strong>' + rollup.Covered + '</strong>&nbsp;&nbsp;' +
    covPill('Confirm') + ' <strong>' + rollup.Confirm + '</strong>&nbsp;&nbsp;' +
    covPill('Gap') + ' <strong>' + rollup.Gap + '</strong>' +
    '<span class="tiny muted" style="margin-left:8px">across ' + cats.length + ' categories</span>' +
  '</div>';
  const cols = [
    { key:'name', label:'Category', render: r => '<strong>' + esc(r.name) + '</strong>' },
    { key:'severity', label:'Severity', width:'110px', sortVal: r => sevNum(r.severity),
      render: r => heatCell(sevNum(r.severity), { scale:3, label: cap1(r.severity), title: cap1(r.severity) + ' severity exposure' }) },
    { key:'coverage', label:'Coverage', width:'110px', render: r => covPill(r.coverage), sortVal: r => r.coverage },
    { key:'issues', label:'Linked findings', sort:false, render: r => (r.issueIds && r.issueIds.length)
      ? r.issueIds.map(id => issueJump(id)).join(' ') : '<span class="tiny muted">&mdash;</span>' }
  ];
  const table = dataTable(cols, cats, { zebra:true, dense:true, id:'tbl-coverage14' });
  const gapNote = insight('Every <strong>Gap</strong> row above traces to the two exhibits referenced in the MSA but not provided this session (DPA, Security Exhibit). Obtaining them converts these from Gap to Confirm/Covered.', rollup.Gap ? 'warn' : '');
  return saCard('Protection & Coverage, 14 Categories', rollupHtml + table + gapNote, { icon:'shield', sub: cats.length + ' categories' });
}

/* ---- Obligations register (post-sign exposure; dates static/reflect-only) ---- */
function partyPill(party) {
  const map = { supplier:['warn','Supplier'], buyer:['info','Buyer'], mutual:['muted','Mutual'] };
  const m = map[party] || ['muted', party];
  return '<span class="pill ' + m[0] + '">' + esc(m[1]) + '</span>';
}
function renderObligations(d) {
  const obs = d.obligations || [];
  const cols = [
    { key:'party', label:'Party', width:'86px', render: r => partyPill(r.party), sortVal: r => r.party },
    { key:'text', label:'Obligation', sort:false, render: r => r.text },
    { key:'clause', label:'Clause', width:'110px', render: r => esc(r.clause) },
    { key:'trigger', label:'Trigger', sort:false, render: r => esc(r.trigger) },
    { key:'imbalance', label:'Imbalance', width:'90px', render: r => r.imbalanceFlag ? '<span class="pill danger" title="One-sided obligation">Flag</span>' : '<span class="tiny muted">&mdash;</span>', sortVal: r => r.imbalanceFlag ? 1 : 0 },
    { key:'issue', label:'Finding', sort:false, render: r => r.issueId ? issueJump(r.issueId) : '&mdash;' },
    { key:'evidence', label:'Evidence', sort:false, render: r => evidenceChip(r.evidenceType, { short:true }) }
  ];
  const table = dataTable(cols, obs, { zebra:true, dense:true, id:'tbl-obligations', rowClass: r => r.imbalanceFlag ? 'rowtint-warn' : '' });
  const supplierCount = obs.filter(o => o.party === 'supplier').length;
  const buyerCount = obs.filter(o => o.party === 'buyer').length;
  const mutualCount = obs.filter(o => o.party === 'mutual').length;
  const imbalancedCount = obs.filter(o => o.imbalanceFlag).length;
  const balanceInsight = insight('<strong>' + supplierCount + '</strong> supplier obligations vs <strong>' + buyerCount + '</strong> buyer vs <strong>' + mutualCount +
    '</strong> mutual; <strong>' + imbalancedCount + '</strong> of ' + obs.length + ' are flagged one-sided.',
    supplierCount > buyerCount + mutualCount ? 'warn' : '');
  const staticNote = insight('Trigger dates above are <strong>reflected from the contract text</strong> (dueBasis: static). This artifact does not monitor them live and is not a system of record.', '');
  return saCard('Obligations Register', table + balanceInsight + staticNote, { icon:'raci', accent:'teal', sub: obs.length + ' obligations · ' + imbalancedCount + ' one-sided' });
}

function renderLegalProtection(d) {
  const protection = d.protection || { deductions:[], categories14:[] };
  const findingsHtml = renderFindingsRegister(d);
  return '<div class="tab-intro"><h2>Legal &amp; Protection</h2><p class="q">Protection Score, full findings register, 14-category coverage and post-sign obligations for the MSA, SOW-01 and Order Form set. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-4">' + saCard('Protection Score', protectionGauge(protection), { icon:'shield', accent:'plum' }) + '</div>' +
      '<div class="col-8">' + renderDeductions(protection) + '</div>' +
      findingsHtml +
      '<div class="col-7">' + renderCoverageHeatmap(protection) + '</div>' +
      '<div class="col-5">' + renderObligations(d) + '</div>' +
    '</div>';
}

/* ============================================================================
 * SUBTAB 2C, Scope & Performance (ADAPTIVE on d.meta.contractSet)
 * ========================================================================== */
function hasSOWInScope(d) {
  const cs = (d.meta && d.meta.contractSet) || '';
  return /sow/i.test(cs);
}
function raciCell(val) {
  if (!val) return '<span class="pill muted" title="No role assigned">&mdash;</span>';
  const cls = val === 'A' ? 'warn' : (val === 'R' ? 'ok' : 'muted');
  return '<span class="pill ' + cls + '">' + val + '</span>';
}

function paymentReconciliationHtml(d) {
  const cl = (d.commercialLines || []).find(c => c.id === 'CL-2'); // Implementation services (SOW-01)
  if (!cl) {
    return gapCard('Milestone payment reconciliation', 'No implementation fee line links to SOW-01 in this session. Payment-to-milestone reconciliation could not be attempted. ' + evidenceChip('unavailable'));
  }
  return '<div class="eyebrow" style="margin:12px 0 6px">Payment reconciliation to contract value</div>' +
    '<div class="kv" style="margin-bottom:6px">' +
      '<dt>SOW-01 fee (ask)</dt><dd>' + money(cl.supplierAmount) + ' ' + evidenceChip(cl.evidenceType, { short:true, sources: cl.sourceIds }) + '</dd>' +
      '<dt>SOW-01 fee (target)</dt><dd>' + money(cl.target) + ' ' + evidenceChip('calculated', { short:true }) + '</dd>' +
    '</div>' +
    insight('SOW-01 sets delivery timing across ' + ((d.scope && d.scope.milestones) || []).length + ' milestones (M1&ndash;M5) but does not itemize a payment percentage per milestone in the reviewed text. The fee above is billed as a single fixed fee, not milestone-triggered progress payments. Per-milestone reconciliation could not be verified this session.', 'warn') +
    '<div style="margin-top:4px">' + evidenceChip('unavailable') + '</div>';
}

function renderScopePerfFull(d) {
  const sc = d.scope || {};

  /* ---- Delivery timeline (milestones) + deliverables legend + payment reconciliation ---- */
  const ms = sc.milestones || [];
  const ganttRows = ms.map((m, i) => ({ label: m.name, start: m.date, end: m.end, tone: i === 0 ? 'pri' : '', badge: m.id }));
  const ganttHtml = ms.length
    ? gantt(ganttRows, { start: ms[0].date, end: ms[ms.length - 1].end })
    : gapCard('Milestone schedule', 'No dated milestones available in this session.');
  const delivLegend = '<dl class="kv" style="margin-top:12px">' +
    (sc.deliverables || []).map(dl => {
      const m = ms.find(x => x.id === dl.milestone);
      return '<dt>' + esc(dl.id) + '</dt><dd><strong>' + esc(dl.name) + '</strong> &mdash; ' +
        (m ? esc(m.name) + ' (' + esc(dl.milestone) + ')' : esc(dl.milestone)) + ' &middot; owner: ' + esc(dl.owner) +
        ' ' + evidenceChip(dl.evidenceType, { short:true }) + '</dd>';
    }).join('') + '</dl>';
  const timelineInsight = insight('Data onboarding (M2) is the schedule’s critical dependency &mdash; every later milestone chains from it, and buyer HRIS/payroll access is due within 5 days of kickoff.', 'warn');
  const timelineCard = saCard('Delivery Timeline', ganttHtml + delivLegend + timelineInsight + paymentReconciliationHtml(d),
    { icon:'clock', sub: ms.length + ' milestones &middot; ' + (sc.deliverables || []).length + ' deliverables' });

  /* ---- Dependencies & risk ---- */
  const depCols = [
    { key:'text', label:'Dependency', render: r => r.text },
    { key:'owner', label:'Owner', width:'80px', render: r => esc(r.owner) },
    { key:'risk', label:'Risk', render: r => severityPill(r.risk) },
    { key:'evidence', label:'Evidence', sort:false, render: r => evidenceChip(r.evidenceType, { short:true }) }
  ];
  const depTable = dataTable(depCols, sc.dependencies || [], { zebra:true, dense:true, id:'tbl-dependencies',
    rowClass: r => r.risk === 'high' ? 'rowtint-danger' : '' });
  const depCard = saCard('Dependencies & Risk', depTable, { icon:'flag', accent:'danger' });

  /* ---- Scope boundaries + coverage ---- */
  const inScope = sc.inScope || [], outScope = sc.outOfScope || [];
  const inList = inScope.map(x => '<li>' + esc(x.text) + ' ' + evidenceChip(x.evidenceType, { short:true }) + '</li>').join('');
  const outList = outScope.map(x => '<li>' + esc(x.text) + ' ' + evidenceChip(x.evidenceType, { short:true }) + '</li>').join('');
  const scopeBody =
    '<p class="card-note" style="margin-top:0"><strong>Objective (scope-definition read):</strong> ' + esc(sc.objective) + ' ' + evidenceChip(sc.objectiveEvidence, { short:true }) + '</p>' +
    '<div class="divider"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
      '<div><div class="eyebrow" style="margin-bottom:6px">In scope</div><ul style="margin:0;padding-left:18px;line-height:1.7">' + inList + '</ul></div>' +
      '<div><div class="eyebrow" style="margin-bottom:6px">Out of scope</div><ul style="margin:0;padding-left:18px;line-height:1.7">' + outList + '</ul></div>' +
    '</div>';
  const scopeCard = saCard('Scope Boundaries & Coverage', scopeBody,
    { icon:'target', sub: inScope.length + ' in &middot; ' + outScope.length + ' out' });

  /* ---- Acceptance analysis ---- */
  const acceptance = sc.acceptance || [];
  const accCols = [
    { key:'id', label:'ID', width:'56px' },
    { key:'deliverable', label:'Deliverable', width:'70px', render: r => esc(r.deliverable) },
    { key:'criteria', label:'Criteria', sort:false, render: r => r.criteria },
    { key:'defined', label:'Defined', render: r => r.defined ? statusPill('aligned','Defined') : statusPill('deviation','Not defined'), sortVal: r => r.defined ? 1 : 0 },
    { key:'evidence', label:'Evidence', sort:false, render: r => evidenceChip(r.evidenceType, { short:true }) }
  ];
  const accTable = dataTable(accCols, acceptance, { zebra:true, dense:true, id:'tbl-acceptance',
    rowClass: r => r.defined ? '' : 'rowtint-warn' });
  const undefinedCount = acceptance.filter(a => !a.defined).length;
  const accInsight = insight('<strong>' + undefinedCount + '</strong> of ' + acceptance.length + ' acceptance criteria have no objective pass/fail standard &mdash; links to the deemed-acceptance finding in Legal &amp; Protection.', undefinedCount ? 'warn' : '');
  const accCard = saCard('Acceptance Analysis', accTable + accInsight, { icon:'flag', accent:'teal' });

  /* ---- RACI ---- */
  const raci = sc.raci || { roles:[], rows:[] };
  const raciCols = [{ key:'activity', label:'Activity', sort:false,
      render: r => '<strong>' + esc(r.activity) + '</strong>' + (r.ambiguous ? ' <span class="pill warn" title="Ambiguous accountability">!</span>' : '') }]
    .concat(raci.roles.map((role, i) => ({ key:'role' + i, label: role, sort:false, render: r => raciCell(r.vals[i]) })));
  const raciRows = raci.rows || [];
  const raciTable = dataTable(raciCols, raciRows, { zebra:false, dense:true, id:'tbl-raci', sortable:false,
    rowClass: r => r.ambiguous ? 'rowtint-warn' : '',
    expand: r => r.note ? insight(esc(r.note), 'warn') + ' ' + evidenceChip(r.evidenceType, { short:true }) : null });
  const ambiguousCount = raciRows.filter(r => r.ambiguous).length;
  const raciLegend = '<div class="tiny muted" style="margin-top:8px">R = Responsible &middot; A = Accountable &middot; C = Consulted &middot; I = Informed. ' +
    ambiguousCount + ' of ' + raciRows.length + ' activities are flagged (two Accountable owners, or none) &mdash; expand for detail.</div>';
  const raciCard = saCard('Responsibility (RACI, compact)', raciTable + raciLegend, { icon:'raci', sub: ambiguousCount + ' flagged' });

  /* ---- SLA/KPI register & change control ---- */
  const slaCols = [
    { key:'metric', label:'Metric', render: r => esc(r.metric) },
    { key:'target', label:'Target', render: r => esc(r.target) },
    { key:'playbook', label:'Playbook', render: r => esc(r.playbook) },
    { key:'remedy', label:'Remedy', sort:false, render: r => esc(r.remedy) },
    { key:'status', label:'Status', render: r => statusPill(r.status) },
    { key:'issue', label:'Finding', sort:false, render: r => r.issueId ? issueJump(r.issueId) : '&mdash;' }
  ];
  const slaTable = dataTable(slaCols, sc.serviceLevels || [], { zebra:true, dense:true, id:'tbl-sla',
    rowClass: r => r.status === 'deviation' ? 'rowtint-danger' : (r.status === 'partial' ? 'rowtint-warn' : '') });
  const changeHtml = (sc.changeControl || []).map(c => insight(esc(c.text) + ' ' + evidenceChip(c.evidenceType, { short:true }))).join('');
  const slaCard = saCard('SLA / KPI Register & Change Control', slaTable + '<div class="divider"></div>' + changeHtml, { icon:'shield', accent:'emph' });

  return '<div class="grid">' +
      '<div class="col-8">' + timelineCard + '</div>' +
      '<div class="col-4">' + depCard + '</div>' +
      '<div class="col-6">' + scopeCard + '</div>' +
      '<div class="col-6">' + accCard + '</div>' +
      '<div class="col-7">' + raciCard + '</div>' +
      '<div class="col-5">' + slaCard + '</div>' +
    '</div>';
}

function renderScopePerf(d) {
  if (!hasSOWInScope(d)) {
    const cs = (d.meta && d.meta.contractSet) || 'unknown';
    const note = gapCard('No SOW in scope',
      'This engagement is classified as <strong>' + esc(cs) + '</strong>. No accompanying Statement of Work was provided in this session, so delivery scope, milestones, acceptance criteria, RACI and SLAs cannot be assessed here. If a SOW exists outside this session, request it before relying on this tab for delivery-performance review. ' + evidenceChip('unavailable'));
    return '<div class="tab-intro"><h2>Scope &amp; Performance</h2><p class="q">No Statement of Work in scope. ' + coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
      '<div class="grid"><div class="col-12">' + note + '</div></div>';
  }
  return '<div class="tab-intro"><h2>Scope &amp; Performance</h2><p class="q">SOW-01 objective, delivery schedule, acceptance standards, responsibility split and service levels. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    renderScopePerfFull(d);
}

/* ============================================================================
 * SCOPED STYLE (doc-tree + protection gauge), one block, under .contract-tab
 * ========================================================================== */
const CONTRACT_STYLE =
  '<style>' +
  '.contract-tab .ddm-tree{padding:10px 6px 16px}' +
  '.contract-tab .ddm-root{display:flex;justify-content:center}' +
  '.contract-tab .ddm-branch{width:2px;height:20px;background:var(--line2);margin:0 auto}' +
  '.contract-tab .ddm-children{position:relative;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;padding-top:16px}' +
  '.contract-tab .ddm-children::before{content:"";position:absolute;top:0;left:12%;right:12%;height:2px;background:var(--line2)}' +
  '.contract-tab .ddm-child{position:relative;flex:1 1 128px;max-width:168px;background:var(--surface);border:1px solid var(--line2);' +
    'border-radius:var(--r-sm);padding:10px 12px;box-shadow:var(--shadow-1)}' +
  '.contract-tab .ddm-child::before{content:"";position:absolute;top:-16px;left:50%;width:2px;height:16px;background:var(--line2)}' +
  '.contract-tab .ddm-child.ddm-missing{background:var(--panel);border-style:dashed}' +
  '.contract-tab .ddm-rootbox{max-width:260px;border-color:var(--pri);border-width:1.5px}' +
  '.contract-tab .ddm-role{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:700}' +
  '.contract-tab .ddm-name{font-weight:700;font-size:var(--fz-sm);margin:3px 0 2px;color:var(--ink)}' +
  '.contract-tab .ddm-meta{font-size:var(--fz-meta);color:var(--mut)}' +
  '.contract-tab .ddm-status{font-size:var(--fz-meta);color:var(--mut2);margin:2px 0 6px;font-style:italic}' +
  '.contract-tab .ddm-bottom{display:flex;gap:6px;flex-wrap:wrap;align-items:center}' +
  '.contract-tab .pg-wrap{position:relative;display:flex;flex-direction:column;align-items:center;padding:4px 0 0}' +
  '.contract-tab .pg-svg{width:100%;max-width:240px;height:auto}' +
  '.contract-tab .pg-score{margin-top:-14px;font:800 32px/1 var(--sans);color:var(--ink)}' +
  '.contract-tab .pg-score .pg-max{font-size:14px;font-weight:700;color:var(--mut);margin-left:2px}' +
  '.contract-tab .pg-band{font:700 12.5px/1 var(--sans);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);margin-top:4px}' +
  '.contract-tab .pg-legend{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;margin-top:14px}' +
  '.contract-tab .pg-leg{display:inline-flex;align-items:center;gap:5px;font-size:var(--fz-floor);color:var(--mut)}' +
  '.contract-tab .pg-leg i{width:8px;height:8px;border-radius:2px;display:inline-block}' +
  '.contract-tab .pg-leg-cur{color:var(--ink);font-weight:800}' +
  '</style>';

/* ============================================================================
 * TAB ENTRY POINT
 * ========================================================================== */
function renderTab_contract(d) {
  return '<div class="contract-tab">' + CONTRACT_STYLE +
    '<div class="subtabbar" data-subtab-group="contract"><div class="wrap">' +
      '<button class="subtab-btn" data-subtab="map" aria-selected="true">Documents &amp; Conflicts</button>' +
      '<button class="subtab-btn" data-subtab="legal" aria-selected="false">Legal &amp; Protection</button>' +
      '<button class="subtab-btn" data-subtab="scope" aria-selected="false">Scope &amp; Performance</button>' +
      '<button class="subtab-btn" data-subtab="sources" aria-selected="false">Sources &amp; Evidence</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
      '<div data-subpanel="contract/map" class="is-active">' + renderDocMap(d) + '</div>' +
      '<div data-subpanel="contract/legal">' + renderLegalProtection(d) + '</div>' +
      '<div data-subpanel="contract/scope">' + renderScopePerf(d) + '</div>' +
      '<div data-subpanel="contract/sources">' + renderSourcesEvidence(d) + '</div>' +
    '</div></div>' +
  '</div>';
}

global.renderTab_contract = renderTab_contract;
global.DealTabs = global.DealTabs || {};
global.DealTabs.contract = renderTab_contract;

})(typeof window !== 'undefined' ? window : this);
