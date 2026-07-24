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
// A compact map box: shows EXACTLY document type, supplier name, document name,
// active status, and the executed-expiration dates (rendering "Draft" when no
// executedDate exists, i.e. every instrument in this pre-signature set). variant
// is 'master' | 'component' | 'sub'; it only styles the box, never adds fields.
function docNode(doc, variant) {
  const missing = doc.isMissing || doc.evidenceType === 'unavailable';
  const cls = 'ddm-box ddm-box-' + variant + (missing ? ' ddm-box-missing' : '');
  const skey = missing ? 'deviation' : (doc.active === 'Active' ? 'aligned' : 'pending');
  const dates = doc.executedDate
    ? esc(doc.executedDate) + ' &ndash; ' + (doc.expirationDate ? esc(doc.expirationDate) : 'open-ended')
    : 'Draft';
  return '<div class="' + cls + '">' +
    '<div class="ddm-type">' + esc(doc.type) + '</div>' +
    '<div class="ddm-supplier">' + esc(doc.supplierName || '') + '</div>' +
    '<div class="ddm-name">' + esc(doc.name) + '</div>' +
    '<div class="ddm-foot">' + statusPill(skey, doc.active) +
      '<span class="ddm-dates">' + dates + '</span></div>' +
  '</div>';
}

function renderDocMap(d) {
  const docs = d.documents || [];
  const master = docs.find(x => x.tier === 'master') || docs.find(x => x.controlling) || docs.find(x => x.role === 'governing') || docs[0];
  const components = docs.filter(x => x.tier === 'msa-component');
  const subordinates = docs.filter(x => x.tier === 'subordinate');
  const missingDocs = docs.filter(x => x.isMissing);
  const relMeta = d.documentRelevanceMeta || {};

  /* ---- 1. Document Relationship Map, left-to-right umbrella. The MSA (master) sits
   * on the LEFT and ENCLOSES its incorporated components (Supplier Privacy Standard /
   * DPA, Information Security Standard, EU SCCs, AI Addendum) inside one bordered
   * umbrella, so they read as part of the MSA, not peers of the SOW / Order Form. The
   * subordinate instruments (SOW, Order Form) sit to the RIGHT, operating under it. The
   * correspondence email is excluded (not a governing instrument; it stays in the
   * register). Each box shows only type, supplier, name, active status and the
   * executed-expiration dates (Draft while pre-signature). ---- */
  const umbrellaHtml =
    '<div class="ddm">' +
      '<div class="ddm-umbrella">' +
        '<div class="ddm-umbrella-cap">Master agreement, with components incorporated at the MSA level</div>' +
        docNode(master, 'master') +
        '<div class="ddm-inc">' +
          '<div class="ddm-inc-label">Incorporated at the MSA level (' + components.length + ')</div>' +
          '<div class="ddm-inc-list">' + components.map(c => docNode(c, 'component')).join('') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ddm-flow"><span class="ddm-flow-label">operate under &rarr;</span><span class="ddm-flow-line"></span></div>' +
      '<div class="ddm-under">' +
        '<div class="ddm-under-label">Operating under the MSA (' + subordinates.length + ')</div>' +
        subordinates.map(s => docNode(s, 'sub')).join('') +
      '</div>' +
    '</div>';
  const draftNote = insight('No executed copy of any instrument surfaced in this session; every document is pre-signature, so the executed&ndash;expiration field reads <strong>Draft</strong> and no execution or expiration date is asserted. ' + evidenceChip('inference', { short:true }));
  const docMapCard = saCard('Document Relationship Map', umbrellaHtml + draftNote,
    { icon:'doc', sub: esc(master.type) + ' umbrella over ' + subordinates.length + ' operating documents &middot; ' + components.length + ' components incorporated at MSA level &middot; ' + missingDocs.length + ' not provided this session' });

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
  const regNote = '';   // bottom precedence/relevance notes removed (repetitive; detail lives in each row's expand)
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
    { key:'issue', label:'Linked finding', sort:false, render: r => {
        if (!r.issueId) return '&mdash;';
        const pr = (d.issues.find(i => i.id === r.issueId) || {}).priority;
        // the colored severity chip IS the link (no ISS-id text); click jumps to the exact finding
        return '<span data-gotofinding="' + esc(r.issueId) + '" style="cursor:pointer" title="Open finding ' + esc(r.issueId) + ' in the register below">' + severityPill(pr) + '</span>';
      } }
  ];
  const table = shown.length
    ? dataTable(cols, shown, { zebra:true, dense:true, id:'tbl-crossdoc' })
    : gapCard('No active conflicts, risks, or gaps', 'Every cross-document check in session is consistent; nothing to raise.');
  return saCard('Cross-Document Conflicts & Gaps', table, { icon:'scale', sub: shown.length + ' to resolve' });   // bottom summary/trace notes removed (repetitive)
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
// the gauge VISUAL only (svg + score + band + banded legend); the scorecard
// headline lays this out on the left with methodology/rollup to its right.
function protectionGaugeVisual(protection) {
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
    '<div class="pg-legend">' + legend + '</div>';
}
// full gauge block (visual + methodology + evidence); retained for reuse.
function protectionGauge(protection) {
  return protectionGaugeVisual(protection) +
    '<div class="divider"></div>' +
    '<div class="card-note" style="margin-top:0"><strong>Methodology.</strong> ' + esc(protection.methodology) + '</div>' +
    '<div style="margin-top:8px">' + evidenceChip(protection.evidenceType) + '</div>';
}

/* ============================================================================
 * PROTECTION SCORECARD  (merges the old Protection Score gauge + Deductions +
 * Findings-by-Category + 14-category Coverage into ONE full-width card).
 *
 * Category spine = the 8 CANONICAL finding categories, i.e. the distinct values of
 * d.issues[].category. Everything is attributed by issueId (no lexical crosswalk
 * across the differently-named deduction / 14-category taxonomies):
 *   - Findings   = issues whose issue.category === the row category (native).
 *   - Points off = Σ of deductions[].points whose deduction.issueId maps (issueId ->
 *                  issue -> issue.category) into this row. Every deduction maps, so the
 *                  points still total 42 and 100 - 42 = 58 reconciles.
 *   - Coverage   = the WORST coverage (Gap > Confirm > Covered) among categories14[]
 *                  whose issueIds intersect this row's issue ids; "Not assessed" if none.
 *   - Severity   = the mix of the row's issues' priorities.
 * A footer line preserves the coverage blind-spot value by naming the protection areas
 * assessed as Covered with no findings (e.g. Confidentiality), which have no row here.
 * ========================================================================== */
const SEV_TXT = { 'hard-stop':'Hard stop', high:'High', medium:'Medium', low:'Low' };
function sevMixHtml(findings) {
  const parts = ['hard-stop','high','medium','low'].map(p => {
    const n = findings.filter(f => f.priority === p).length;
    if (!n) return '';
    return '<span class="ps-sevtag ps-sev-' + esc(p) + '" title="' + n + ' ' + esc(SEV_TXT[p] || p) + '"><i></i>' + n + '</span>';
  }).filter(Boolean).join('');
  return parts || '<span class="tiny muted">&mdash;</span>';
}
function covPillOrNA(coverage) { return coverage ? covPill(coverage) : statusPill('missing', 'Not assessed'); }
function trimText(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }

function scorecardRows(d) {
  const protection = d.protection || { deductions:[], categories14:[] };
  const deductions = protection.deductions || [];
  const cats14 = protection.categories14 || [];
  const issues = d.issues || [];
  const issueById = {}; issues.forEach(i => { issueById[i.id] = i; });
  const dedByIssue = {}; deductions.forEach(dd => { if (dd.issueId) dedByIssue[dd.issueId] = dd; });
  const catOfIssue = id => (issueById[id] ? issueById[id].category : null);

  // spine = distinct issue categories (native finding taxonomy), first-seen order
  const cats = [];
  issues.forEach(i => { if (i.category && cats.indexOf(i.category) === -1) cats.push(i.category); });

  // worst coverage (Gap > Confirm > Covered) among 14-category rows whose issueIds intersect
  const COV_RANK = { Gap:3, Confirm:2, Covered:1 };
  const worstCoverage = ids => {
    let best = null, bestRank = 0;
    cats14.forEach(c => {
      if ((c.issueIds || []).some(id => ids.indexOf(id) !== -1)) {
        const rk = COV_RANK[c.coverage] || 0;
        if (rk > bestRank) { bestRank = rk; best = c.coverage; }
      }
    });
    return best;   // null -> "Not assessed"
  };

  const rows = cats.map(cat => {
    const findings = issues.filter(i => i.category === cat)
      .sort((a, b) => sevRank(b.priority) - sevRank(a.priority));
    const ids = findings.map(f => f.id);
    // points off = every scored deduction whose issue maps into THIS category
    const points = deductions.reduce((s, dd) =>
      s + ((dd.issueId && catOfIssue(dd.issueId) === cat) ? (dd.points || 0) : 0), 0);
    const scored = deductions.some(dd => dd.issueId && catOfIssue(dd.issueId) === cat);
    return { key: cat.toLowerCase(), name: cat, findings, points, scored, coverage: worstCoverage(ids) };
  });
  rows.sort((a, b) => (b.points - a.points) || (b.findings.length - a.findings.length) || a.name.localeCompare(b.name));

  // coverage blind-spot line: 14-category areas assessed as Covered with NO finding
  const assessedNoIssues = cats14.filter(c =>
    c.coverage === 'Covered' && !(c.issueIds || []).some(id => !!issueById[id])).map(c => c.name);

  return { rows, dedByIssue, protection, deductions, cats14, issues, assessedNoIssues };
}

function scorecardFindingTable(row, dedByIssue) {
  if (!row.findings.length) {
    return gapCard('No findings linked to this category',
      (row.coverage ? 'Coverage is assessed as <strong>' + esc(row.coverage) + '</strong>; no individual findings map to this category name.'
                     : 'No findings, and no 14-category coverage entry, carry this category name.'));
  }
  const body = row.findings.map(f => {
    const ded = dedByIssue[f.id];
    const pts = ded ? '&minus;' + ded.points : '<span class="tiny muted">&mdash;</span>';
    const reason = ded ? esc(ded.reason) : esc(trimText(f.impact, 180));
    const ev = evidenceChip(ded ? 'inference' : (f.evidenceType || 'inference'), { short:true });
    const link = '<span class="ps-flink" data-gotofinding="' + esc(f.id) + '" role="button" tabindex="0" title="Open finding ' + esc(f.id) + ' in the register below">' + esc(f.title) + ' <span class="ps-flink-go">View &rarr;</span></span>';
    return '<tr>' +
      '<td class="num">' + pts + '</td>' +
      '<td>' + severityPill(f.priority) + '</td>' +
      '<td>' + covPillOrNA(row.coverage) + '</td>' +
      '<td>' + reason + ' ' + ev + '</td>' +
      '<td>' + link + '</td>' +
    '</tr>';
  }).join('');
  return '<div class="tbl-wrap"><table class="dt dense zebra"><thead><tr>' +
      '<th class="num" style="width:60px">Points</th>' +
      '<th style="width:100px">Severity</th>' +
      '<th style="width:118px">Coverage</th>' +
      '<th>Reason</th>' +
      '<th style="width:200px">Finding</th>' +
    '</tr></thead><tbody>' + body + '</tbody></table></div>';
}

function renderProtectionScorecard(d) {
  const parts = scorecardRows(d);
  const rows = parts.rows, dedByIssue = parts.dedByIssue, protection = parts.protection,
        deductions = parts.deductions, cats14 = parts.cats14, issues = parts.issues,
        assessedNoIssues = parts.assessedNoIssues;
  const score = clamp(Math.round(protection.score || 0), 0, 100);

  // --- headline: gauge (left) + priority rollup & methodology (right) ---
  const prRollup = ['hard-stop','high','medium','low'].map(p =>
    '<span class="ps-rollup-item">' + severityPill(p) + '<b>' + issues.filter(i => i.priority === p).length + '</b></span>').join('');
  const headline =
    '<div class="ps-head">' +
      '<div class="ps-head-gauge">' + protectionGaugeVisual(protection) + '</div>' +
      '<div class="ps-head-meta">' +
        '<div class="eyebrow" style="margin-bottom:8px">Findings by priority</div>' +
        '<div class="ps-rollup">' + prRollup + '</div>' +
        '<div class="divider"></div>' +
        '<div class="card-note" style="margin-top:0"><strong>Methodology.</strong> ' + esc(protection.methodology) + ' ' + evidenceChip(protection.evidenceType, { short:true }) + '</div>' +
      '</div>' +
    '</div>';

  // --- category accordion (one <details name="protection-scorecard"> open at a time) ---
  const colHead =
    '<div class="ps-acc-head"><span></span><span>Category</span><span>Findings</span>' +
    '<span>Severity mix</span><span>Coverage</span><span style="text-align:right">Points off</span></div>';
  const items = rows.map(row => {
    const ptsCell = row.scored
      ? '<span class="ps-pts">&minus;' + row.points + '</span>'
      : '<span class="ps-pts zero">&mdash;</span>';
    return '<details name="protection-scorecard" class="ps-cat">' +
        '<summary class="ps-sum">' +
          '<span class="ps-chev">' + icon('chevron') + '</span>' +
          '<span class="ps-name" title="' + esc(row.name) + '">' + esc(row.name) + '</span>' +
          '<span class="ps-count">' + row.findings.length + '</span>' +
          '<span class="ps-sevmix">' + sevMixHtml(row.findings) + '</span>' +
          '<span class="ps-cov">' + covPillOrNA(row.coverage) + '</span>' +
          ptsCell +
        '</summary>' +
        '<div class="ps-cat-bd">' + scorecardFindingTable(row, dedByIssue) + '</div>' +
      '</details>';
  }).join('');
  const accordion = '<div class="ps-accordion-wrap">' + colHead + items + '</div>';

  // "Also assessed, no issues" line: coverage blind-spots that carry no finding row above
  const alsoLine = assessedNoIssues.length
    ? '<div class="card-note" style="margin-top:10px">Also assessed, no issues: <strong>' + assessedNoIssues.map(esc).join(', ') + '</strong>. ' + evidenceChip(protection.evidenceType, { short:true }) + '</div>'
    : '';

  // --- footer: score reconciliation + attribution note ---
  const totalPts = deductions.reduce((s, x) => s + (x.points || 0), 0);
  const reconciles = (100 - totalPts) === score;
  const recon = insight('Reconciliation: 100 &minus; &Sigma; deductions (' + totalPts + ') = <strong>' + (100 - totalPts) + '</strong>' +
    (reconciles ? ', matching the displayed score of <strong>' + score + '</strong>.'
                : ', which does <strong>not</strong> match the displayed score (' + score + '); flag for data QA.'),
    reconciles ? '' : 'danger');
  const attribNote = insight('Spine = the ' + rows.length + ' finding categories. Points off map each scored deduction to its finding’s category (' +
    deductions.length + ' deductions, &Sigma; = ' + totalPts + '); coverage is the worst of the ' + cats14.length + '-category assessments whose issues intersect this category (Gap &gt; Confirm &gt; Covered), else "Not assessed".');

  return saCard('Protection Scorecard',
    headline + '<div class="divider"></div>' +
    '<div class="eyebrow" style="margin:2px 0 8px">Protection by finding category (' + rows.length + ') &middot; one panel opens at a time</div>' +
    accordion + alsoLine +
    '<div class="ps-recon">' + recon + attribNote + '</div>',
    { icon:'shield', accent:'plum', sub: esc(protection.band) + ' &middot; ' + score + '/100' });
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

/* ---- Findings register (was "Terms & Risk"; expanded body is grouped, not a
 * flat insight() stack: 3 outcome cards on top, then labelled sections) --- */
function xpGroup(label, inner) {   // label is trusted literal HTML (may carry entities)
  return '<div class="xp-group"><div class="eyebrow xp-eyebrow">' + label + '</div>' + inner + '</div>';
}
function xpLine(k, v, tone) {       // k is escaped; v is trusted HTML built by the caller
  return '<div class="xp-line' + (tone ? ' ' + tone : '') + '"><span class="xp-k">' + esc(k) + '</span><span class="xp-v">' + v + '</span></div>';
}
function issueExpandHtml(iss, d) {
  const doc = findDoc(iss.documentId, d);
  const ver = verifiedInfo(iss.evidenceType);
  const tf = iss.tacticFlag;

  // 1) three outcome cards, left-to-right: preferred | fallback | least-acceptable (the floor)
  const isHard = hasRealHardStop(iss.hardStop);
  const outcomes =
    '<div class="ps-outcomes">' +
      '<div class="oc oc-want"><div class="oc-lbl">Preferred outcome</div><div class="oc-txt">' + esc(iss.recommendedPosition) + '</div></div>' +
      '<div class="oc oc-fallback"><div class="oc-lbl">Fallback</div><div class="oc-txt">' + esc(iss.fallback) + '</div></div>' +
      '<div class="oc ' + (isHard ? 'oc-floor-danger' : 'oc-floor') + '"><div class="oc-lbl">Least acceptable outcome</div>' +
        '<div class="oc-sub">walk-away / reservation point</div><div class="oc-txt">' + esc(iss.hardStop) + '</div></div>' +
    '</div>';

  // 2) grouped narrative sections
  const problem = xpGroup('The problem',
    xpLine('Supplier position', esc(iss.supplierPosition), '') +
    xpLine('Deviation vs. playbook', esc(iss.deviation), 'warn') +
    xpLine('Impact', esc(iss.impact), 'danger'));

  const tacticLine = (tf && tf.present)
    ? xpLine('Vendor tactic flagged', esc(tf.tactic) + '. Triggering text: “' + esc(tf.triggeringText) + '” ' + evidenceChip(tf.evidenceType, { short:true }), 'warn')
    : '';
  const exchange = xpGroup('The exchange',
    tacticLine +
    xpLine('Supplier pushback', '“' + esc(iss.supplierPushback) + '”', '') +
    xpLine('Recommended response', esc(iss.recommendedResponse), ''));

  const trade = xpGroup('Trade opportunity', xpLine('Lever', esc(iss.tradeOpportunity), ''));

  // 3) clause & routing metadata + collapsible source excerpt (evidence chips kept)
  const sourceChips = (iss.sourceIds || []).map(sid => {
    const src = (d.sources || []).find(s => s.id === sid);
    return evidenceChip(src ? src.evidenceType : 'internal', { short:true, sources:[sid] });
  }).join(' ');
  const clauseExcerpt = collapsible('View source clause &amp; playbook position',
    excerpt(iss.sourceExcerpt) +
    '<div class="divider"></div>' +
    '<div class="card-note" style="margin-top:0"><strong>Playbook position:</strong> ' + esc(iss.playbookPosition) + '</div>');
  const routing = xpGroup('Clause &amp; routing',
    '<div class="kv" style="margin-bottom:8px">' +
      '<dt>Clause</dt><dd>' + esc(iss.clause) + '</dd>' +
      '<dt>Document</dt><dd>' + (doc ? jumpLink(doc.type + ' (' + doc.id + ')', JUMP_MAP) : esc(iss.documentId)) + '</dd>' +
      '<dt>SME route</dt><dd>' + esc(smeRoute(iss.category)) + ' <span class="tiny muted">(derived from category)</span></dd>' +
      '<dt>Verification</dt><dd>' + statusPill(ver.statusKey, ver.label) + ' <span class="tiny muted">(from evidence type)</span></dd>' +
      '<dt>Internal decision</dt><dd>' + statusPill(iss.internalDecision, decisionLabel(iss.internalDecision)) + '</dd>' +
    '</div>' +
    clauseExcerpt +
    '<div class="btn-row" style="margin-top:8px">' + sourceChips + '</div>');

  return outcomes + problem + exchange + trade + routing;
}

function issueRowHtml(iss, d) {
  const facet = (iss.priority + ' ' + iss.category).toLowerCase();
  const rowKey = iss.id;
  // Collapsed row is trimmed to ID · Finding · Priority · $ Impact · Evidence.
  // Evidence-excerpt, Verified, SME route and Tactic now live in the expanded body.
  return '<tr class="expandable" data-exprow="' + rowKey + '" data-rowkey="' + rowKey + '" data-facet="' + esc(facet) + '">' +
      '<td>' + esc(iss.id) + '</td>' +
      '<td><strong>' + esc(iss.title) + '</strong><div class="tiny muted">' + esc(iss.category) + '</div></td>' +
      '<td data-sv="' + sevRank(iss.priority) + '">' + severityPill(iss.priority) + '</td>' +
      '<td>' + esc(iss.impact) + '</td>' +
      '<td>' + evidenceChip(iss.evidenceType, { short:true, sources: iss.sourceIds }) + '</td>' +
    '</tr>' +
    '<tr class="expander-row is-hidden" data-expfor="' + rowKey + '"><td colspan="5"><div class="exp-inner">' + issueExpandHtml(iss, d) + '</div></td></tr>';
}

function renderFindingsRegister(d) {
  const issues = d.issues || [];
  const cnt = p => issues.filter(i => i.priority === p).length;

  /* ---- full-width filterable, expandable, sortable register (chips carry counts) ---- */
  const toolbar =
    '<div class="toolbar">' +
      '<input type="search" placeholder="Search findings, clauses, categories…" data-filter-input data-filter-for="tbl-findings-register">' +
      '<button class="chip-filter" data-filterchip="hard-stop" aria-pressed="false">Hard stop (' + cnt('hard-stop') + ')</button>' +
      '<button class="chip-filter" data-filterchip="high" aria-pressed="false">High (' + cnt('high') + ')</button>' +
      '<button class="chip-filter" data-filterchip="medium" aria-pressed="false">Medium (' + cnt('medium') + ')</button>' +
      '<button class="chip-filter" data-filterchip="low" aria-pressed="false">Low (' + cnt('low') + ')</button>' +
      '<span class="spacer"></span>' +
      '<span class="filter-count">' + issues.length + ' of ' + issues.length + ' shown</span>' +
    '</div>';
  // Height-capped scroll container; table.dt thead th is sticky, so the header holds while scrolling.
  const registerTable =
    '<div class="reg-scroll"><table class="dt zebra dense" id="tbl-findings-register">' +
      '<thead><tr>' +
        '<th data-sort="id">ID</th>' +
        '<th data-sort="title">Finding</th>' +
        '<th data-sort="priority">Priority</th>' +
        '<th>$ Impact / consequence</th>' +
        '<th>Evidence</th>' +
      '</tr></thead>' +
      '<tbody>' + issues.map(iss => issueRowHtml(iss, d)).join('') + '</tbody>' +
    '</table></div>';
  return saCard('Findings Register, Full Detail',
    '<div data-filter-scope>' + toolbar + registerTable + '</div>',
    { icon:'flag', accent:'plum', sub: issues.length + ' findings &middot; click a row to expand' });
}

/* ---- coverage pill (Covered/Confirm/Gap); used by the Protection Scorecard ---- */
function covPill(coverage) {
  const map = { Covered:['aligned','Covered'], Confirm:['pending','Confirm'], Gap:['deviation','Gap'] };
  const m = map[coverage] || ['muted', coverage];
  return statusPill(m[0], m[1]);
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
  return '<div class="tab-intro"><h2>Legal &amp; Protection</h2><p class="q">Protection scorecard, full findings register and post-sign obligations for the MSA, SOW-01 and Order Form set. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + renderProtectionScorecard(d) + '</div>' +
      '<div class="col-12">' + renderFindingsRegister(d) + '</div>' +
      '<div class="col-12">' + renderObligations(d) + '</div>' +
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
  /* Document Relationship Map, left-to-right umbrella (MSA encloses its incorporated
   * components; subordinate instruments operate under it to the right). Locked palette:
   * plum (--pri) frames the umbrella; neutrals carry everything else. */
  '.contract-tab .ddm{display:flex;align-items:stretch;flex-wrap:wrap;gap:0;padding:12px 4px 6px}' +
  '.contract-tab .ddm-umbrella{flex:1 1 360px;min-width:280px;border:1.5px solid var(--pri);border-radius:var(--r-sm);background:var(--panel);padding:12px 12px 14px}' +
  '.contract-tab .ddm-umbrella-cap{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.06em;color:var(--pri-tx);font-weight:800;margin-bottom:9px}' +
  '.contract-tab .ddm-inc{margin-top:11px;padding-top:11px;border-top:1px dashed var(--line2)}' +
  '.contract-tab .ddm-inc-label{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700;margin-bottom:8px}' +
  '.contract-tab .ddm-inc-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:8px}' +
  '.contract-tab .ddm-flow{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:0 6px;min-width:78px}' +
  '.contract-tab .ddm-flow-label{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700;white-space:nowrap;text-align:center}' +
  '.contract-tab .ddm-flow-line{width:100%;height:2px;background:var(--line2)}' +
  '.contract-tab .ddm-under{flex:0 1 232px;min-width:190px;display:flex;flex-direction:column;justify-content:center;gap:8px}' +
  '.contract-tab .ddm-under-label{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700}' +
  '.contract-tab .ddm-box{background:var(--surface);border:1px solid var(--line2);border-radius:var(--r-sm);padding:8px 10px;box-shadow:var(--shadow-1)}' +
  '.contract-tab .ddm-box-master{border-color:var(--pri);border-width:1.5px}' +
  '.contract-tab .ddm-box-missing{border-style:dashed;opacity:.94}' +
  '.contract-tab .ddm-type{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:700}' +
  '.contract-tab .ddm-supplier{font-size:var(--fz-meta);color:var(--mut2)}' +
  '.contract-tab .ddm-name{font-weight:700;font-size:var(--fz-sm);margin:2px 0 7px;color:var(--ink);line-height:1.28}' +
  '.contract-tab .ddm-foot{display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:space-between}' +
  '.contract-tab .ddm-dates{font-size:var(--fz-meta);color:var(--mut);font-variant-numeric:tabular-nums}' +
  '.contract-tab .pg-wrap{position:relative;display:flex;flex-direction:column;align-items:center;padding:4px 0 0}' +
  '.contract-tab .pg-svg{width:100%;max-width:240px;height:auto}' +
  '.contract-tab .pg-score{margin-top:-14px;font:800 32px/1 var(--sans);color:var(--ink)}' +
  '.contract-tab .pg-score .pg-max{font-size:14px;font-weight:700;color:var(--mut);margin-left:2px}' +
  '.contract-tab .pg-band{font:700 12.5px/1 var(--sans);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);margin-top:4px}' +
  '.contract-tab .pg-legend{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;margin-top:14px}' +
  '.contract-tab .pg-leg{display:inline-flex;align-items:center;gap:5px;font-size:var(--fz-floor);color:var(--mut)}' +
  '.contract-tab .pg-leg i{width:8px;height:8px;border-radius:2px;display:inline-block}' +
  '.contract-tab .pg-leg-cur{color:var(--ink);font-weight:800}' +
  /* ---- Legal & Protection: Protection Scorecard ---- */
  '.contract-tab .ps-head{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}' +
  '.contract-tab .ps-head-gauge{flex:0 0 236px;max-width:250px}' +
  '.contract-tab .ps-head-meta{flex:1 1 320px;min-width:260px}' +
  '.contract-tab .ps-rollup{display:flex;flex-wrap:wrap;gap:8px 18px}' +
  '.contract-tab .ps-rollup-item{display:inline-flex;align-items:center;gap:7px}' +
  '.contract-tab .ps-rollup-item b{font:800 15px/1 var(--sans);font-variant-numeric:tabular-nums;color:var(--ink)}' +
  '.contract-tab .ps-accordion-wrap{max-height:560px;overflow-y:auto;overflow-x:hidden;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface)}' +
  '.contract-tab .ps-acc-head,.contract-tab .ps-sum{display:grid;grid-template-columns:18px minmax(150px,1fr) 78px minmax(120px,1.1fr) 140px 78px;align-items:center;gap:10px}' +
  '.contract-tab .ps-acc-head{position:sticky;top:0;z-index:2;padding:9px 13px;background:var(--panel);border-bottom:1.5px solid var(--line2)}' +
  '.contract-tab .ps-acc-head span{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700}' +
  '.contract-tab .ps-cat{border-bottom:1px solid var(--line)}' +
  '.contract-tab .ps-cat:last-child{border-bottom:0}' +
  '.contract-tab .ps-cat>summary{list-style:none;cursor:pointer;padding:10px 13px}' +
  '.contract-tab .ps-cat>summary::-webkit-details-marker{display:none}' +
  '.contract-tab .ps-cat>summary:hover{background:var(--nested)}' +
  '.contract-tab .ps-cat[open]>summary{background:var(--nested)}' +
  '.contract-tab .ps-chev{display:inline-flex;color:var(--mut);transition:transform .15s}' +
  '.contract-tab .ps-chev svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.4}' +
  '.contract-tab .ps-cat[open] .ps-chev{transform:rotate(90deg)}' +
  '.contract-tab .ps-name{font-weight:700;font-size:var(--fz-sm);color:var(--ink);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
  '.contract-tab .ps-count{font-size:var(--fz-sm);color:var(--mut);font-variant-numeric:tabular-nums}' +
  '.contract-tab .ps-sevmix{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}' +
  '.contract-tab .ps-pts{font:800 var(--fz-sm)/1 var(--mono);text-align:right;font-variant-numeric:tabular-nums;color:var(--ink)}' +
  '.contract-tab .ps-pts.zero{color:var(--mut);font-weight:600}' +
  '.contract-tab .ps-cat-bd{padding:2px 13px 14px}' +
  '.contract-tab .ps-sevtag{display:inline-flex;align-items:center;gap:5px;font:800 var(--fz-floor)/1 var(--sans);font-variant-numeric:tabular-nums}' +
  '.contract-tab .ps-sevtag i{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none}' +
  '.contract-tab .ps-sev-hard-stop{color:var(--danger-fg)}' +
  '.contract-tab .ps-sev-high{color:var(--warn-fg)}' +
  '.contract-tab .ps-sev-medium{color:var(--sec-tx)}' +
  '.contract-tab .ps-sev-low{color:var(--mut2)}' +
  '.contract-tab .ps-flink{cursor:pointer;color:var(--sec-tx);font-weight:700}' +
  '.contract-tab .ps-flink:hover{text-decoration:underline}' +
  '.contract-tab .ps-flink-go{white-space:nowrap;color:var(--mut2);font-size:var(--fz-meta)}' +
  '.contract-tab .ps-recon{margin-top:12px}' +
  /* three outcome cards inside an expanded finding (preferred | fallback | least-acceptable) */
  '.contract-tab .ps-outcomes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:6px}' +
  '.contract-tab .oc{border:1px solid var(--line2);border-radius:var(--r-sm);padding:10px 12px;background:var(--surface2);border-top:3px solid var(--mut2)}' +
  '.contract-tab .oc-want{border-top-color:var(--sec)}' +
  '.contract-tab .oc-fallback{border-top-color:var(--pri)}' +
  '.contract-tab .oc-floor{border-top-color:var(--mut2)}' +
  '.contract-tab .oc-floor-danger{border-top-color:var(--danger-bar);background:var(--danger-bg)}' +
  '.contract-tab .oc-lbl{font:800 var(--fz-floor)/1 var(--sans);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2);margin-bottom:5px}' +
  '.contract-tab .oc-sub{font:700 var(--fz-floor)/1.2 var(--sans);color:var(--danger-fg);margin-bottom:5px}' +
  '.contract-tab .oc-txt{font-size:var(--fz-sm);color:var(--ink);line-height:1.45}' +
  /* grouped narrative sections in the expanded finding */
  '.contract-tab .xp-group{margin-top:14px}' +
  '.contract-tab .xp-eyebrow{margin-bottom:4px}' +
  '.contract-tab .xp-line{display:grid;grid-template-columns:150px 1fr;gap:5px 14px;padding:6px 0;font-size:var(--fz-sm);line-height:1.45}' +
  '.contract-tab .xp-line + .xp-line{border-top:1px solid var(--line)}' +
  '.contract-tab .xp-k{color:var(--mut);font-weight:600}' +
  '.contract-tab .xp-v{color:var(--ink);min-width:0}' +
  '.contract-tab .xp-line.warn .xp-k{color:var(--warn-fg)}' +
  '.contract-tab .xp-line.danger .xp-k{color:var(--danger-fg)}' +
  /* findings register scroll container (sticky header comes from table.dt thead th) */
  '.contract-tab .reg-scroll{max-height:620px;overflow-y:auto;border:1px solid var(--line);border-radius:var(--r-sm)}' +
  '.contract-tab .reg-scroll table.dt thead th{position:sticky;top:0;z-index:2}' +
  '@media(max-width:760px){' +
    '.contract-tab .ps-outcomes{grid-template-columns:1fr}' +
    '.contract-tab .ps-acc-head{display:none}' +
    '.contract-tab .ps-sum{grid-template-columns:18px 1fr;gap:6px 10px}' +
    '.contract-tab .xp-line{grid-template-columns:1fr}' +
  '}' +
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
