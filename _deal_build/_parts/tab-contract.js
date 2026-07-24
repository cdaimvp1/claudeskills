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
 * SUBTAB 2B, Legal & Protection  (approved "legal-protection-alt" design, ported
 * into the live architecture: pure string builders + delegated DealUI interaction,
 * NOT the mockup's imperative getElementById()/re-render loop).
 *
 * Layout: (1) Protection Scorecard (col-12) = compact banded gauge + deduction
 * waterfall (100 -> the 8 issue categories -> 58) + teal current->achievable band
 * (58 -> best negotiation.packages resultingProtectionScore = 79). (2) a 2-column
 * row: LEFT Navigator (~33%, segmented Protections | Obligations, native single-open
 * <details> accordions) + RIGHT Findings Register (~67%, ALL findings).
 *
 * Interaction is 100% delegated (helpers.js DealUI), no inline onclick:
 *   - native <details name="lp-prot|lp-obl">  -> single-open accordions (no JS)
 *   - data-lpview="protections|obligations"   -> toggle navigator group + seg aria
 *   - data-gotofinding="ISS-xx|OB-x"          -> open + scroll the register row
 *   - data-exprow / data-expfor (id = finding id) -> expand a register row
 *   - data-filter-input + data-filterchip (data-facet="{sev} {type}") -> filter
 *   - data-lpclear                            -> clear the register search + chips
 * Claude-authored judgments (verdict / better-alternative / refine / inference
 * remedy) carry evidenceChip('inference') so the palette stays plum/teal/burnt-orange.
 * ========================================================================== */

/* ---- derivation: group the 11 fine-grained deductions into the 8 issue categories
 * used across the register (matches d.issues[].category). This SAME spine drives the
 * waterfall drop rows and the Protections navigator, so points reconcile (Sigma = 42,
 * 100 - 42 = 58). Coverage = worst of the 14-category assessments whose issues
 * intersect (Gap > Confirm > Covered), else Confirm when findings exist. ---- */
const LP_CAT_ORDER = ['Liability','Data & Privacy','Term & Renewal','Commercial','IP','Scope & Acceptance','Service Levels','Audit & Compliance'];
const LP_DED_TO_CAT = {
  'Limitation of Liability':'Liability', 'Indemnification':'Liability',
  'Data Protection & Privacy':'Data & Privacy', 'Sub-processing':'Data & Privacy',
  'Term & Renewal':'Term & Renewal', 'Exit & Termination':'Term & Renewal',
  'Pricing Protection':'Commercial',
  'IP & Data Rights':'IP',
  'Scope & Acceptance':'Scope & Acceptance',
  'Service Levels':'Service Levels',
  'Audit Rights':'Audit & Compliance'
};
const LP_CAT_GAP = { 'Data & Privacy':'GAP-1', 'Service Levels':'GAP-2' };
const LP_GAP_NOTE = { 'GAP-1':'DPA text and EU SCCs not in session', 'GAP-2':'Security & Availability Exhibit B not in session' };
const LP_SEV_RANK = { 'hard-stop':0, high:1, medium:2, low:3 };
const LP_COV_RANK = { Gap:3, Confirm:2, Covered:1 };
const LP_SEV_LABEL = { 'hard-stop':'Hard stop', high:'High', medium:'Medium', low:'Low' };

function lpOBA(d) { return d.obligationAnalysis || {}; }
function lpShort(t, n) { t = String(t == null ? '' : t); n = n || 74; return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; }
function lpIdNum(id) { const m = String(id).match(/(\d+)/); return m ? parseInt(m[1], 10) : 0; }
function lpIssueById(d, id) { return (d.issues || []).find(i => i.id === id) || null; }

function lpCats(d) {
  const deductions = (d.protection && d.protection.deductions) || [];
  const issues = d.issues || [];
  const cats14 = (d.protection && d.protection.categories14) || [];
  return LP_CAT_ORDER.map(cat => {
    const deds = deductions.filter(dd => LP_DED_TO_CAT[dd.category] === cat);
    const points = deds.reduce((s, dd) => s + (dd.points || 0), 0);
    const primaryDed = deds.slice().sort((a, b) => b.points - a.points)[0];
    const iss = issues.filter(i => i.category === cat).slice().sort((a, b) => LP_SEV_RANK[a.priority] - LP_SEV_RANK[b.priority]);
    const primaryIssueId = primaryDed ? primaryDed.issueId : (iss[0] || {}).id;
    const idset = {}; iss.forEach(i => { idset[i.id] = 1; });
    let cov = 'Covered';
    cats14.forEach(c => { if ((c.issueIds || []).some(id => idset[id])) { if (LP_COV_RANK[c.coverage] > LP_COV_RANK[cov]) cov = c.coverage; } });
    if (cov === 'Covered' && iss.length) cov = 'Confirm';
    const mix = {}; iss.forEach(i => { mix[i.priority] = (mix[i.priority] || 0) + 1; });
    return { cat, points, primaryIssueId, issues: iss, coverage: cov, mix, gapId: LP_CAT_GAP[cat] || null };
  });
}
// achievable protection = the best resultingProtectionScore across negotiation packages.
function lpAchievable(d) {
  const pkgs = (d.negotiation && d.negotiation.packages) || [];
  return pkgs.reduce((m, p) => Math.max(m, p.resultingProtectionScore || 0), (d.protection && d.protection.score) || 0);
}

/* ---- must-negotiate marker (non-text dot + tooltip): red = critical/hard-stop,
 * amber = high-impact. issue: hard-stop -> critical; high with a real
 * recommendedPosition -> high. obligation: critical verdict + negotiate -> critical;
 * adverse verdict + negotiate -> high. Balanced/neutral/med/low get no marker. ---- */
function lpMarkerIssue(iss) {
  if (iss.priority === 'hard-stop') return { level: 'critical', tip: 'Critical, must be negotiated' };
  if (iss.priority === 'high' && iss.recommendedPosition && iss.recommendedPosition.trim()) return { level: 'high', tip: 'High impact, negotiate' };
  return null;
}
function lpMarkerObl(o, d) {
  const a = lpOBA(d)[o.id] || {};
  if (a.fairnessVerdict === 'critical' && a.negotiate) return { level: 'critical', tip: 'Critical, must be negotiated' };
  if (a.fairnessVerdict === 'adverse' && a.negotiate) return { level: 'high', tip: 'High impact, negotiate' };
  return null;
}
function lpMarkerHtml(m) {
  return m ? '<span class="lp-mneg lp-mneg-' + m.level + '" role="img" tabindex="0" title="' + esc(m.tip) + '" aria-label="' + esc(m.tip) + '"></span>' : '';
}

/* ---- local inline-SVG icon set (self-contained; the live icon() set has no
 * alert/compass/check/arrow). Used for finding-detail zone headers + verdict. ---- */
const LP_IC = {
  chev:    '<svg class="lp-ic" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  doc:     '<svg class="lp-ic" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
  alert:   '<svg class="lp-ic" viewBox="0 0 24 24"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>',
  scale:   '<svg class="lp-ic" viewBox="0 0 24 24"><path d="M12 3v18M6 21h12M12 6l-6 2 3 5a3 3 0 01-6 0l3-5M12 6l6 2-3 5a3 3 0 006 0l-3-5"/></svg>',
  check:   '<svg class="lp-ic" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  compass: '<svg class="lp-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/></svg>',
  arrow:   '<svg class="lp-ic" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  info:    '<svg class="lp-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
};
function lpPartyPill(p) { const lab = p.charAt(0).toUpperCase() + p.slice(1); return '<span class="pill lp-party-' + esc(p) + '">' + esc(lab) + '</span>'; }
// analysis chip: a Claude-authored judgment. Reuses the live 'inference' evidence chip
// so provenance reads consistently and the palette gains no new hue.
function lpAnalysisChip() { return evidenceChip('inference', { short: true }); }

/* =========================================================================
 * 1. SCORECARD, compact banded gauge + deduction waterfall + achievable band
 * ====================================================================== */
function lpPolar(cx, cy, r, deg) { const rad = deg * Math.PI / 180; return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }; }
function lpArc(cx, cy, r, s, e) {
  const a = lpPolar(cx, cy, r, s), b = lpPolar(cx, cy, r, e), large = (s - e) > 180 ? 1 : 0;
  return 'M ' + a.x.toFixed(2) + ' ' + a.y.toFixed(2) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + b.x.toFixed(2) + ' ' + b.y.toFixed(2);
}
// Only Critical uses red (locked palette: plum/teal/burnt-orange + red-critical-only).
const LP_BANDS = [
  { key: 'Strong',   range: '80-100',   v: 'var(--ok-bar)' },
  { key: 'Adequate', range: '65-79',    v: 'var(--sec)' },
  { key: 'Weak',     range: '45-64',    v: 'var(--warn-bar)' },
  { key: 'Critical', range: 'below 45', v: 'var(--danger-bar)' }
];
function lpBandColor(b) { const h = LP_BANDS.find(x => x.key.toLowerCase() === String(b || '').toLowerCase()); return h ? h.v : 'var(--mut2)'; }
function lpGauge(d) {
  const p = d.protection || {};
  const score = clamp(Math.round(p.score || 0), 0, 100);
  const ach = lpAchievable(d);
  const color = lpBandColor(p.band);
  const cx = 92, cy = 90, r = 72, sw = 18;
  const bg = lpArc(cx, cy, r, 180, 0), fg = lpArc(cx, cy, r, 180, 180 - 1.8 * score);
  const achPt = lpPolar(cx, cy, r, 180 - 1.8 * ach);
  const svg = '<svg class="lp-gaugesvg" viewBox="0 0 184 104" role="img" aria-label="Protection score ' + score + ' of 100, band ' + esc(p.band) + '">' +
    '<path d="' + bg + '" stroke="var(--line2)" stroke-width="' + sw + '" fill="none" stroke-linecap="round"/>' +
    '<path d="' + fg + '" stroke="' + color + '" stroke-width="' + sw + '" fill="none" stroke-linecap="round"/>' +
    '<circle cx="' + achPt.x.toFixed(1) + '" cy="' + achPt.y.toFixed(1) + '" r="3.4" fill="var(--surface)" stroke="var(--sec)" stroke-width="2.4"><title>Achievable ' + ach + ' with the top package</title></circle>' +
    '</svg>';
  const scale = LP_BANDS.map(b => {
    const cur = b.key.toLowerCase() === String(p.band || '').toLowerCase();
    return '<span class="lp-pg-leg' + (cur ? ' cur' : '') + '"><i style="background:' + b.v + '"></i>' + esc(b.key) + '<span class="rng">' + esc(b.range) + '</span></span>';
  }).join('');
  return '<div class="lp-pg">' + svg +
    '<div class="lp-pg-num" style="color:' + color + '">' + score + '<small>/100</small></div>' +
    '<div class="lp-pg-band"><span class="pill sev-medium">' + esc(p.band) + '</span></div>' +
    '<div class="lp-pg-scale">' + scale + '</div>' +
    '<span class="lp-howscored" tabindex="0" title="' + esc(p.methodology || '') + '">' + LP_IC.info + 'How scored</span>' +
    '</div>';
}
function lpWaterfall(d) {
  const cats = lpCats(d);
  const score = clamp(Math.round((d.protection && d.protection.score) || 0), 0, 100);
  const ach = lpAchievable(d);
  const lift = ach - score;
  const biggest = Math.max.apply(null, cats.map(c => c.points));
  const rows = [{ kind: 'base', lab: 'Playbook baseline', from: 0, to: 100, delta: '100' }];
  let running = 100;
  cats.forEach(c => {
    const after = running - c.points;
    rows.push({ kind: 'drop', lab: c.cat, from: after, to: running, points: c.points, delta: '&minus;' + c.points, issueId: c.primaryIssueId, lever: (c.points === biggest) });
    running = after;
  });
  rows.push({ kind: 'current', lab: 'Current score', from: 0, to: running, delta: String(running), achievable: true });
  const gridPos = [0, 25, 50, 75, 100];
  const axis = '<div class="lp-wf-axis">' + gridPos.map(v => '<span style="left:' + v + '%">' + v + '</span>').join('') + '</div>';
  const body = rows.map(row => {
    const grid = '<div class="lp-wf-grid">' + gridPos.map(v => '<i style="left:' + v + '%"></i>').join('') + '</div>';
    const barCls = 'lp-wf-bar ' + row.kind + (row.lever ? ' lever' : '');
    const connector = row.kind === 'drop' ? '<div class="lp-wf-connect" style="left:' + row.to + '%"></div>' : '';
    const bar = '<div class="' + barCls + '" style="left:' + row.from + '%; width:' + (row.to - row.from) + '%"' +
      (row.kind === 'drop' ? ' title="' + esc(row.lab) + ': minus ' + row.points + ' pts, opens ' + esc(row.issueId) + '"' : '') + '></div>';
    let ach2 = '';
    if (row.achievable) {
      ach2 = '<div class="lp-wf-ach-band" style="left:' + score + '%; width:' + (ach - score) + '%"></div>' +
        '<div class="lp-wf-ach-mark" style="left:' + ach + '%"></div>' +
        '<div class="lp-wf-ach-flag" style="left:' + ach + '%">' + ach + ' &middot; +' + lift + '</div>';
    }
    const track = '<div class="lp-wf-track">' + grid + connector + bar + ach2 + '</div>';
    const attrs = row.kind === 'drop'
      ? ' class="lp-wf-row lp-wf-clickable" role="button" tabindex="0" data-gotofinding="' + esc(row.issueId) + '" title="Open lead finding ' + esc(row.issueId) + ' in the register below"'
      : ' class="lp-wf-row ' + row.kind + '"';
    return '<div' + attrs + '><div class="lp-wf-lab">' + esc(row.lab) + '</div>' + track + '<div class="lp-wf-delta">' + row.delta + '</div></div>';
  }).join('');
  return '<div class="lp-wf">' + axis + body + '</div>';
}
function lpScorecard(d) {
  const p = d.protection || {};
  const score = clamp(Math.round(p.score || 0), 0, 100);
  const ach = lpAchievable(d);
  const legend = '<div class="lp-wf-legend">' +
    '<span><i class="lp-i-base"></i>Baseline 100</span>' +
    '<span><i class="lp-i-drop"></i>Deduction</span>' +
    '<span><i class="lp-i-current"></i>Current ' + score + '</span>' +
    '<span><i class="lp-i-ach"></i>Achievable ' + ach + ' (top package)</span>' +
    '</div>';
  const right = '<div><div class="lp-wf-head">' +
    '<div class="lp-wf-t">Where the score was lost</div>' +
    '<div class="lp-wf-s">100 playbook-aligned baseline, less each category’s deductions. Widest bar is the biggest lever. Click a bar to open its lead finding. ' + evidenceChip(p.evidenceType, { short: true }) + '</div>' +
    '</div>' + lpWaterfall(d) + legend + '</div>';
  const body = '<div class="lp-sc-grid"><div>' + lpGauge(d) + '</div>' + right + '</div>';
  return saCard('Protection Scorecard', body, { icon: 'shield', accent: 'emph', sub: 'Supplier redline v3 &middot; before negotiation' });
}

/* =========================================================================
 * 2. LEFT NAVIGATOR, segmented toggle + Protections / Obligations accordions.
 *    Native <details name> = single-open. data-lpview toggles which group shows.
 * ====================================================================== */
function lpSevMix(mix) {
  const order = ['hard-stop', 'high', 'medium', 'low'];
  const out = order.filter(p => mix[p]).map(p => '<span class="lp-sd d-' + p + '" title="' + esc(LP_SEV_LABEL[p]) + '"><i></i>' + mix[p] + '</span>').join('');
  return '<span class="lp-sevmix">' + (out || '<span class="lp-sd d-low"><i></i>0</span>') + '</span>';
}
function lpCovChip(c) {
  const covTitle = c.gapId ? (LP_GAP_NOTE[c.gapId] || 'Evidence gap') : (c.coverage === 'Confirm' ? 'Terms present, confirm in negotiation' : 'Covered');
  const alertIc = c.coverage === 'Gap' ? '<svg class="lp-ic" viewBox="0 0 24 24" style="width:11px;height:11px"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>' : '';
  return '<span class="lp-cov-chip lp-cov-' + esc(c.coverage) + '" title="' + esc(covTitle) + '">' + alertIc + esc(c.coverage) + '</span>';
}
function lpNavProtections(d) {
  return lpCats(d).map((c, i) => {
    const finds = c.issues.map(iss =>
      '<div class="lp-acc-find" role="button" tabindex="0" data-gotofinding="' + esc(iss.id) + '" title="Open ' + esc(iss.id) + ' in the register">' +
        '<span class="lp-af-main"><span class="lp-af-title">' + esc(iss.title) + '</span>' +
        '<span class="lp-af-id">' + esc(iss.id) + '</span></span>' +
        '<span class="lp-af-right">' + lpMarkerHtml(lpMarkerIssue(iss)) + severityPill(iss.priority) + '</span>' +
      '</div>').join('');
    return '<details name="lp-prot" class="lp-acc-item"' + (i === 0 ? ' open' : '') + '>' +
      '<summary class="lp-acc-hd">' +
        '<span class="lp-ah-top"><span class="lp-chev">' + LP_IC.chev + '</span>' +
          '<span class="lp-ah-name">' + esc(c.cat) + '</span>' +
          '<span class="lp-ah-pts">&minus;' + c.points + ' pts</span></span>' +
        '<span class="lp-ah-meta">' + lpSevMix(c.mix) + lpCovChip(c) + '</span>' +
      '</summary>' +
      '<div class="lp-acc-body">' + finds + '</div>' +
    '</details>';
  }).join('');
}
function lpOblFavor(o, d) {
  const a = lpOBA(d)[o.id] || {};
  const tone = a.fairnessVerdict || 'neutral';
  if (tone === 'critical' || tone === 'adverse') return 'supplier';
  if (tone === 'neutral') return 'mutual';
  if (/balanced/i.test(a.verdictLabel || '')) return 'mutual';
  return 'lilly';
}
function lpFavorsLine(list, d) {
  const t = { supplier: 0, lilly: 0, mutual: 0 };
  list.forEach(o => { t[lpOblFavor(o, d)]++; });
  return '<span class="lp-favors"><span class="fv-lab">Favors:</span> ' +
    '<b class="fv-sup">Sup ' + t.supplier + '</b> &middot; <b class="fv-lilly">Lilly ' + t.lilly + '</b> &middot; <b class="fv-mut">Mut ' + t.mutual + '</b></span>';
}
function lpNavObligations(d) {
  const groups = [
    { key: 'supplier', label: 'Supplier duties', bar: 'var(--plum)' },
    { key: 'buyer', label: 'Buyer duties', bar: 'var(--sec)' },
    { key: 'mutual', label: 'Mutual', bar: 'var(--mut2)' }
  ];
  return groups.map(g => {
    const list = (d.obligations || []).filter(o => o.party === g.key)
      .sort((a, b) => (a.imbalanceFlag === b.imbalanceFlag ? 0 : (a.imbalanceFlag ? -1 : 1)) || lpIdNum(a.id) - lpIdNum(b.id));
    if (!list.length) return '';
    const rows = list.map(o => {
      const a = lpOBA(d)[o.id] || {};
      const flag = o.imbalanceFlag
        ? '<span class="pill lp-one-sided' + (a.fairnessVerdict === 'critical' ? ' crit' : '') + '">One-sided</span>'
        : '<span class="pill lp-balanced">Balanced</span>';
      return '<div class="lp-acc-find" role="button" tabindex="0" data-gotofinding="' + esc(o.id) + '" title="Open ' + esc(o.id) + ' in the register">' +
        '<span class="lp-af-main"><span class="lp-af-title">' + esc(lpShort(o.text, 66)) + '</span>' +
        '<span class="lp-obl-sub">' + lpPartyPill(o.party) + flag + '<span class="lp-obl-clause">' + esc(o.clause) + '</span></span></span>' +
        '<span class="lp-af-right">' + lpMarkerHtml(lpMarkerObl(o, d)) + '</span>' +
      '</div>';
    }).join('');
    return '<details name="lp-obl" class="lp-acc-item">' +
      '<summary class="lp-acc-hd">' +
        '<span class="lp-ah-top"><span class="lp-chev">' + LP_IC.chev + '</span>' +
          '<span class="lp-ah-name"><span class="lp-gl-bar" style="background:' + g.bar + '"></span>' + esc(g.label) + '</span>' +
          '<span class="lp-ah-pts nrm">' + list.length + '</span></span>' +
        '<span class="lp-ah-meta">' + lpFavorsLine(list, d) + '</span>' +
      '</summary>' +
      '<div class="lp-acc-body">' + rows + '</div>' +
    '</details>';
  }).join('');
}
function lpNavigator(d) {
  const nProt = lpCats(d).length;
  const nObl = (d.obligations || []).length;
  const seg = '<div class="lp-seg" role="tablist" aria-label="Navigator view">' +
    '<button class="lp-seg-btn" role="tab" type="button" data-lpview="protections" aria-selected="true">' + LP_IC.doc + 'Protections <span class="lp-cnt">' + nProt + '</span></button>' +
    '<button class="lp-seg-btn" role="tab" type="button" data-lpview="obligations" aria-selected="false">' + LP_IC.check + 'Obligations <span class="lp-cnt">' + nObl + '</span></button>' +
    '</div>';
  const body = '<div class="lp-nav">' + seg +
    '<div class="lp-nav-body">' +
      '<div data-lpgroup="protections" class="lp-acc">' + lpNavProtections(d) + '</div>' +
      '<div data-lpgroup="obligations" class="lp-acc" hidden>' + lpNavObligations(d) + '</div>' +
    '</div></div>';
  return saCard('Navigator', body, { icon: 'sources' });
}

/* =========================================================================
 * 3. RIGHT, Findings Register = ALL findings (issues + obligations). Built as a
 *    table.dt inside [data-filter-scope] so the live filter (data-filter-input +
 *    data-filterchip) + expand (data-exprow/data-expfor) + gotoFinding apply
 *    unchanged. data-exprow id = the finding id so a data-gotofinding opens the
 *    exact row; data-facet = "{severity} {type}" for chip filtering. ========= */
function lpOblSeverity(o, d) {
  if (!o.imbalanceFlag) return 'low';
  const li = o.issueId ? lpIssueById(d, o.issueId) : null;
  return li ? li.priority : 'medium';
}
function lpRegItems(d) {
  const issues = (d.issues || []).slice()
    .sort((a, b) => LP_SEV_RANK[a.priority] - LP_SEV_RANK[b.priority] || lpIdNum(a.id) - lpIdNum(b.id))
    .map(i => ({ type: 'issue', id: i.id, sev: i.priority, data: i }));
  const obls = (d.obligations || []).slice()
    .sort((a, b) => (a.imbalanceFlag === b.imbalanceFlag ? 0 : (a.imbalanceFlag ? -1 : 1)) || lpIdNum(a.id) - lpIdNum(b.id))
    .map(o => ({ type: 'obligation', id: o.id, sev: lpOblSeverity(o, d), data: o }));
  return issues.concat(obls);
}
function lpRegRow(item, d) {
  const id = item.id, isIssue = item.type === 'issue';
  const marker = lpMarkerHtml(isIssue ? lpMarkerIssue(item.data) : lpMarkerObl(item.data, d));
  const tag = isIssue ? '<span class="lp-rr-tag lp-tag-issue">Issue</span>' : '<span class="lp-rr-tag lp-tag-obligation">Obligation</span>';
  let title, sub, side;
  if (isIssue) {
    const i = item.data;
    title = esc(i.title);
    sub = '<span class="lp-rr-id">' + esc(i.id) + '</span><span class="lp-dot">&middot;</span>' + esc(i.category) + '<span class="lp-dot">&middot;</span>' + esc(i.clause);
    side = severityPill(i.priority);
  } else {
    const o = item.data, a = lpOBA(d)[o.id] || {};
    title = esc(lpShort(o.text, 104));
    sub = '<span class="lp-rr-id">' + esc(o.id) + '</span><span class="lp-dot">&middot;</span>' + lpPartyPill(o.party) + '<span class="lp-dot">&middot;</span>' + esc(o.clause);
    side = o.imbalanceFlag
      ? '<span class="pill lp-one-sided' + (a.fairnessVerdict === 'critical' ? ' crit' : '') + '">One-sided</span>'
      : '<span class="pill lp-balanced">Balanced</span>';
  }
  const facet = (item.sev + ' ' + item.type).toLowerCase();
  const detail = isIssue ? lpIssueDetail(item.data, d) : lpObligationDetail(item.data, d);
  return '<tr class="expandable lp-reg-row" data-exprow="' + esc(id) + '" data-rowkey="' + esc(id) + '" data-facet="' + esc(facet) + '">' +
      '<td class="lp-td-tag">' + tag + '</td>' +
      '<td class="lp-td-main"><div class="lp-rr-flex">' + marker + '<span class="lp-rr-body"><span class="lp-rr-title">' + title + '</span><span class="lp-rr-sub">' + sub + '</span></span></div></td>' +
      '<td class="lp-td-side">' + side + '</td>' +
    '</tr>' +
    '<tr class="expander-row is-hidden" data-expfor="' + esc(id) + '"><td colspan="3"><div class="exp-inner">' + detail + '</div></td></tr>';
}
function lpRegister(d) {
  const items = lpRegItems(d);
  const total = items.length;
  const cnt = f => items.filter(f).length;
  const toolbar =
    '<div class="lp-reg-tools"><div class="toolbar">' +
      '<input type="search" placeholder="Search title, clause, category, party&hellip;" data-filter-input data-filter-for="tbl-lp-register" aria-label="Search findings">' +
      '<span class="lp-rf-lab">Severity</span>' +
      '<button class="chip-filter" type="button" data-filterchip="hard-stop" aria-pressed="false">Hard stop (' + cnt(i => i.sev === 'hard-stop') + ')</button>' +
      '<button class="chip-filter" type="button" data-filterchip="high" aria-pressed="false">High (' + cnt(i => i.sev === 'high') + ')</button>' +
      '<button class="chip-filter" type="button" data-filterchip="medium" aria-pressed="false">Medium (' + cnt(i => i.sev === 'medium') + ')</button>' +
      '<button class="chip-filter" type="button" data-filterchip="low" aria-pressed="false">Low (' + cnt(i => i.sev === 'low') + ')</button>' +
      '<span class="lp-rf-lab">Type</span>' +
      '<button class="chip-filter" type="button" data-filterchip="issue" aria-pressed="false">Issue (' + cnt(i => i.type === 'issue') + ')</button>' +
      '<button class="chip-filter" type="button" data-filterchip="obligation" aria-pressed="false">Obligation (' + cnt(i => i.type === 'obligation') + ')</button>' +
      '<button class="lp-reg-clear" type="button" data-lpclear title="Clear search and filters">' + LP_IC.arrow + 'Clear</button>' +
      '<span class="spacer"></span>' +
      '<span class="filter-count">' + total + ' of ' + total + ' shown</span>' +
    '</div></div>';
  const table = '<div class="lp-reg-scroll"><table class="dt dense" id="tbl-lp-register"><tbody>' +
    items.map(it => lpRegRow(it, d)).join('') + '</tbody></table></div>';
  return saCard('Findings Register', '<div data-filter-scope>' + toolbar + table + '</div>',
    { icon: 'flag', accent: 'teal', sub: total + ' findings &middot; issues + obligations' });
}

/* =========================================================================
 * 4. FINDING DETAIL, the expander body of each register row.
 * ====================================================================== */
function lpOutcomeCards(pref, fb, least) {
  const noneFloor = /^none/i.test(String(least || '').trim());
  const lc = noneFloor ? 'lp-walkaway-none' : 'lp-walkaway';
  const lLab = noneFloor ? 'No hard floor' : 'Least acceptable';
  const lSub = noneFloor ? 'trade item, not a gate' : 'walk-away &middot; reservation point';
  return '<div class="lp-outcomes">' +
    '<div class="lp-oc lp-preferred"><div class="lp-oc-lab">Preferred outcome</div><div class="lp-oc-body">' + esc(pref) + '</div></div>' +
    '<div class="lp-oc lp-fallback"><div class="lp-oc-lab">Fallback</div><div class="lp-oc-body">' + esc(fb) + '</div></div>' +
    '<div class="lp-oc ' + lc + '"><div class="lp-oc-lab">' + lLab + '<span class="lp-oc-sub">' + lSub + '</span></div><div class="lp-oc-body">' + esc(least) + '</div></div>' +
    '</div>';
}
function lpZone(cls, ic, title, bodyHtml) {
  return '<div class="lp-zone ' + cls + '"><div class="lp-zone-hd">' + ic + '<span class="lp-zt">' + esc(title) + '</span></div>' +
    '<div class="lp-zone-bd">' + bodyHtml + '</div></div>';
}
function lpZf(lab, html) { return '<div class="lp-zf"><div class="lp-zf-lab">' + esc(lab) + '</div>' + html + '</div>'; }

function lpIssueDetail(i, d) {
  if (!i) return '<div class="lp-empty">Issue not found.</div>';
  const tactic = (i.tacticFlag && i.tacticFlag.present)
    ? '<div class="lp-tactic">' + LP_IC.alert +
      '<div><b>Supplier tactic detected: ' + esc(i.tacticFlag.tactic) + '.</b>' +
      (i.tacticFlag.triggeringText ? '<span class="lp-tk-q">' + esc(i.tacticFlag.triggeringText) + '</span>' : '') +
      '</div></div>'
    : '';
  const whereBody = '<div>' + esc(i.supplierPosition) + '</div>' +
    (i.sourceExcerpt ? '<div class="lp-quote contract">' + esc(i.sourceExcerpt) + '</div>' : '');
  const problemBody = lpZf('Deviation', esc(i.deviation)) +
    (i.playbookPosition ? '<div class="lp-quote playbook"><b>Playbook rule.</b> ' + esc(i.playbookPosition) + '</div>' : '') +
    lpZf('Business impact', esc(i.impact));
  const playBody = lpZf('Recommended response', esc(i.recommendedResponse)) +
    (i.supplierPushback ? '<div class="lp-quote pushback"><b>Anticipated pushback.</b> ' + esc(i.supplierPushback) + '</div>' : '') +
    lpZf('Trade opportunity', esc(i.tradeOpportunity));
  return '<div class="lp-fd-eyebrow"><span class="lp-fd-id">' + esc(i.id) + '</span>' +
      '<span class="lp-fd-kind k-issue">Issue</span>' + severityPill(i.priority) + evidenceChip(i.evidenceType) + '</div>' +
    '<div class="lp-fd-title">' + esc(i.title) + '</div>' +
    '<div class="lp-fd-cat">' + esc(i.category) + ' &middot; ' + esc(i.clause) + '</div>' +
    tactic +
    lpOutcomeCards(i.recommendedPosition, i.fallback, i.hardStop) +
    '<div class="lp-oc-src">Preferred, fallback and least-acceptable positions are the negotiation stance for this clause.</div>' +
    lpZone('z-state', LP_IC.doc, 'Where it stands', whereBody) +
    lpZone('z-problem', LP_IC.alert, 'Why it is a problem', problemBody) +
    lpZone('z-play', LP_IC.compass, 'How to play it', playBody) +
    '<div class="lp-dl-foot"><span class="fk">' + esc(i.clause) + '</span> &middot; <span class="fk">' + esc(i.documentId) + '</span> &middot; ' + evidenceChip(i.evidenceType) + '</div>';
}

function lpRemedyChip(ev) {
  if (ev === 'contract') return evidenceChip('contract');
  if (ev === 'unavailable') return evidenceChip('unavailable');
  return lpAnalysisChip();
}
function lpFact(label, valueHtml) { return '<div class="lp-fact"><div class="lp-fact-l">' + esc(label) + '</div><div class="lp-fact-v">' + valueHtml + '</div></div>'; }
function lpObligationDetail(o, d) {
  if (!o) return '<div class="lp-empty">Obligation not found.</div>';
  const a = lpOBA(d)[o.id] || {};
  const linked = o.issueId ? lpIssueById(d, o.issueId) : null;
  const isBalanced = !!a.balanced;
  const flag = o.imbalanceFlag
    ? '<span class="pill lp-one-sided' + (a.fairnessVerdict === 'critical' ? ' crit' : '') + '">One-sided</span>'
    : '<span class="pill lp-balanced">Balanced</span>';
  const partyLabel = o.party.charAt(0).toUpperCase() + o.party.slice(1) + (o.party === 'mutual' ? ' (both parties)' : '');
  const remedyVal = esc(a.remedyIfMissed) + ' ' + lpRemedyChip(a.remedyEvidence) +
    (a.remedyEvidence === 'unavailable' ? ' <span class="lp-gapnote">(gap-state)</span>' : '');
  const facts = '<div class="lp-facts">' +
    lpFact('Owing party', esc(partyLabel)) +
    lpFact('Clause', '<span class="mono">' + esc(o.clause) + '</span>') +
    lpFact('Trigger / frequency', esc(o.trigger)) +
    lpFact('Remedy if missed', remedyVal) +
    lpFact('Reciprocity', esc(a.reciprocity)) +
    lpFact('Survival / duration', esc(a.survival)) +
    '</div>';
  const vIcon = a.fairnessVerdict === 'fair' ? LP_IC.check : (a.fairnessVerdict === 'neutral' ? LP_IC.scale : LP_IC.alert);
  const verdict = '<div class="lp-verdict v-' + esc(a.fairnessVerdict) + '">' + vIcon +
    '<div class="lp-v-body"><div class="lp-v-top"><span class="lp-v-label">' + esc(a.verdictLabel) + '</span>' + lpAnalysisChip() + '</div>' +
    '<div class="lp-v-why">' + esc(a.verdictWhy) + '</div></div></div>';
  let out = '<div class="lp-fd-eyebrow"><span class="lp-fd-id">' + esc(o.id) + '</span>' +
      '<span class="lp-fd-kind k-obligation">Obligation</span>' + lpPartyPill(o.party) + flag + evidenceChip(o.evidenceType) + '</div>' +
    '<div class="lp-fd-title ob">' + esc(o.text) + '</div>' +
    '<div class="lp-fd-cat">Post-sign exposure register &middot; reflected from the contract, not monitored live</div>' +
    lpZone('z-state', LP_IC.doc, 'Contract facts', facts) +
    verdict;
  if (isBalanced) {
    out += '<div class="lp-balanced-panel">' + LP_IC.check +
      '<div><div class="lp-bp-t">Balanced, no action needed</div>' +
      '<div class="lp-bp-b">' + esc(a.negotiateWhy) + '</div>' +
      (a.refine ? '<div class="lp-refine"><b>Note.</b> ' + esc(a.refine) + ' ' + lpAnalysisChip() + '</div>' : '') +
      (a.crossLink ? '<button class="lp-xlink" type="button" data-gotofinding="' + esc(a.crossLink.issueId) + '">' + LP_IC.arrow + esc(a.crossLink.text) + '</button>' : '') +
      '</div></div>';
  } else {
    const playBody = lpZf('What a balanced, market version looks like', esc(a.betterAlternative) + ' ' + lpAnalysisChip()) +
      '<div class="lp-neg"><span class="lp-neg-badge ' + (a.negotiate ? 'yes' : 'no') + '">' + (a.negotiate ? 'Negotiate: Yes' : 'Negotiate: No') + '</span>' +
      '<div class="lp-neg-why"><span class="lp-nq">Why</span>' + esc(a.negotiateWhy) + '</div></div>';
    out += lpZone('z-play', LP_IC.compass, 'Better alternative and how to fix it', playBody);
    const oc = a.outcome;
    if (oc && oc.source === 'linked' && linked) {
      out += '<div class="lp-play-wrap"><div class="lp-oc-src">Positions carried from linked issue ' +
        '<span class="lp-lk" role="button" tabindex="0" data-gotofinding="' + esc(linked.id) + '" title="Open ' + esc(linked.id) + ' in the register">' + esc(linked.id) + ' &rarr;</span> ' +
        esc(lpShort(linked.title, 60)) + '</div>' +
        lpOutcomeCards(linked.recommendedPosition, linked.fallback, linked.hardStop) + '</div>';
    } else if (oc && oc.source === 'proposed') {
      out += '<div class="lp-play-wrap"><div class="lp-oc-src">Proposed stance ' + lpAnalysisChip() + ', no linked issue in this deal.</div>' +
        lpOutcomeCards(oc.preferred, oc.fallback, oc.leastAcceptable) + '</div>';
    }
  }
  out += '<div class="lp-dl-foot"><span class="fk">' + esc(o.clause) + '</span> &middot; ' +
    (linked ? '<span class="lp-lk" role="button" tabindex="0" data-gotofinding="' + esc(linked.id) + '">linked ' + esc(linked.id) + '</span>' : 'no linked issue') + ' &middot; ' +
    evidenceChip(o.evidenceType) + '</div>';
  return out;
}

function renderLegalProtection(d) {
  return '<div class="tab-intro"><h2>Legal &amp; Protection</h2><p class="q">Reflect-only. Where the protection score was lost, and every finding behind it. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + lpScorecard(d) + '</div>' +
      '<div class="col-4">' + lpNavigator(d) + '</div>' +
      '<div class="col-8">' + lpRegister(d) + '</div>' +
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
  /* ---- Legal & Protection (approved "legal-protection-alt" design, tokenised) ---- */
  '.contract-tab .lp-ic{stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;width:14px;height:14px;flex:none;display:inline-block;vertical-align:middle}' +
  /* 1. scorecard: gauge + waterfall */
  '.contract-tab .lp-sc-grid{display:grid;grid-template-columns:196px 1fr;gap:26px;align-items:start}' +
  '@media(max-width:760px){.contract-tab .lp-sc-grid{grid-template-columns:1fr;gap:18px}}' +
  '.contract-tab .lp-pg{display:flex;flex-direction:column;align-items:center}' +
  '.contract-tab .lp-gaugesvg{width:184px;height:auto}' +
  '.contract-tab .lp-pg-num{font:800 42px/1 var(--sans);margin-top:-32px;letter-spacing:-.02em}' +
  '.contract-tab .lp-pg-num small{font-size:15px;font-weight:700;color:var(--mut)}' +
  '.contract-tab .lp-pg-band{margin-top:7px}' +
  '.contract-tab .lp-pg-band .pill{font-size:11px;padding:3px 12px}' +
  '.contract-tab .lp-pg-scale{display:flex;flex-direction:column;gap:3px;margin-top:15px;width:100%}' +
  '.contract-tab .lp-pg-leg{display:flex;align-items:center;gap:7px;font-size:10.5px;color:var(--mut2);font-weight:600}' +
  '.contract-tab .lp-pg-leg i{width:9px;height:9px;border-radius:2px;flex:none}' +
  '.contract-tab .lp-pg-leg .rng{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--mut2)}' +
  '.contract-tab .lp-pg-leg.cur{color:var(--ink);font-weight:800}' +
  '.contract-tab .lp-pg-leg.cur .rng{color:var(--ink)}' +
  '.contract-tab .lp-howscored{display:inline-flex;align-items:center;gap:5px;margin-top:14px;font-size:10.5px;font-weight:700;color:var(--sec-tx);cursor:help;border-bottom:1px dashed var(--line2);padding-bottom:1px}' +
  '.contract-tab .lp-howscored .lp-ic{width:12px;height:12px}' +
  '.contract-tab .lp-wf-head{margin-bottom:11px}' +
  '.contract-tab .lp-wf-t{font-size:12.5px;font-weight:800;color:var(--ink)}' +
  '.contract-tab .lp-wf-s{font-size:11.5px;color:var(--mut);margin-top:1px}' +
  '.contract-tab .lp-wf{position:relative}' +
  '.contract-tab .lp-wf-axis{position:relative;height:15px;margin-left:150px;margin-right:54px;border-bottom:1px solid var(--line2)}' +
  '.contract-tab .lp-wf-axis span{position:absolute;top:0;transform:translateX(-50%);font-size:10px;color:var(--mut2);font-family:var(--mono)}' +
  '.contract-tab .lp-wf-row{display:grid;grid-template-columns:150px 1fr 54px;align-items:center;height:31px}' +
  '.contract-tab .lp-wf-lab{font-size:11.5px;color:var(--ink2);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px;text-align:right}' +
  '.contract-tab .lp-wf-track{position:relative;height:31px}' +
  '.contract-tab .lp-wf-grid{position:absolute;inset:0;pointer-events:none}' +
  '.contract-tab .lp-wf-grid i{position:absolute;top:0;bottom:0;width:1px;background:var(--line)}' +
  '.contract-tab .lp-wf-bar{position:absolute;top:6px;height:19px;border-radius:3px}' +
  '.contract-tab .lp-wf-bar.base{background:linear-gradient(90deg,var(--plum-t),var(--heat-2));border:1px solid var(--heat-2)}' +
  '.contract-tab .lp-wf-bar.current{background:var(--warn-t);border:1px solid color-mix(in srgb,var(--warn-bar) 45%,transparent)}' +
  '.contract-tab .lp-wf-bar.drop{background:var(--emph);box-shadow:0 1px 0 rgba(0,0,0,.08)}' +
  '.contract-tab .lp-wf-bar.drop.lever{outline:2px solid color-mix(in srgb,var(--emph) 40%,transparent);outline-offset:1px}' +
  '.contract-tab .lp-wf-connect{position:absolute;top:6px;height:19px;width:1px;background:var(--line2)}' +
  '.contract-tab .lp-wf-delta{font:800 11px/1 var(--mono);color:var(--emph-tx);text-align:right;padding-left:8px}' +
  '.contract-tab .lp-wf-row.base .lp-wf-delta,.contract-tab .lp-wf-row.current .lp-wf-delta{color:var(--ink)}' +
  '.contract-tab .lp-wf-clickable{cursor:pointer;border-radius:5px}' +
  '.contract-tab .lp-wf-clickable:hover{background:var(--surface2)}' +
  '.contract-tab .lp-wf-clickable:hover .lp-wf-bar.drop{filter:brightness(1.08)}' +
  '.contract-tab .lp-wf-clickable:focus-visible{outline:2px solid var(--sec);outline-offset:1px}' +
  '.contract-tab .lp-wf-ach-band{position:absolute;top:5px;height:21px;background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--sec) 16%,transparent),color-mix(in srgb,var(--sec) 16%,transparent) 5px,color-mix(in srgb,var(--sec) 5%,transparent) 5px,color-mix(in srgb,var(--sec) 5%,transparent) 10px);border:1px dashed var(--sec);border-left:none;border-radius:0 3px 3px 0}' +
  '.contract-tab .lp-wf-ach-mark{position:absolute;top:0;bottom:0;width:2px;background:var(--sec)}' +
  '.contract-tab .lp-wf-ach-flag{position:absolute;top:-3px;transform:translateX(-50%);background:var(--sec);color:#fff;font:800 10px/1 var(--mono);padding:2px 6px;border-radius:4px;white-space:nowrap}' +
  '.contract-tab .lp-wf-legend{display:flex;flex-wrap:wrap;gap:16px;margin-top:13px;padding-top:11px;border-top:1px solid var(--line)}' +
  '.contract-tab .lp-wf-legend span{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;color:var(--mut2);font-weight:600}' +
  '.contract-tab .lp-wf-legend i{width:13px;height:10px;border-radius:2px;flex:none}' +
  '.contract-tab .lp-i-base{background:linear-gradient(90deg,var(--plum-t),var(--heat-2));border:1px solid var(--heat-2)}' +
  '.contract-tab .lp-i-drop{background:var(--emph)}' +
  '.contract-tab .lp-i-current{background:var(--warn-t);border:1px solid color-mix(in srgb,var(--warn-bar) 45%,transparent)}' +
  '.contract-tab .lp-i-ach{background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--sec) 35%,transparent),color-mix(in srgb,var(--sec) 35%,transparent) 3px,transparent 3px,transparent 6px);border:1px dashed var(--sec)}' +
  /* 2. navigator: segmented toggle + accordions */
  '.contract-tab .lp-nav{display:flex;flex-direction:column}' +
  '.contract-tab .lp-seg{display:inline-flex;background:var(--well);border:1px solid var(--line2);border-radius:9px;padding:3px;gap:3px;width:100%;margin-bottom:12px}' +
  '.contract-tab .lp-seg-btn{flex:1;border:0;background:transparent;color:var(--mut2);font:800 12px/1 var(--sans);letter-spacing:.02em;padding:8px;border-radius:6px;cursor:pointer;transition:all .12s;display:inline-flex;align-items:center;justify-content:center;gap:6px}' +
  '.contract-tab .lp-seg-btn .lp-ic{width:13px;height:13px}' +
  '.contract-tab .lp-seg-btn .lp-cnt{font:700 10.5px/1 var(--mono);opacity:.7}' +
  '.contract-tab .lp-seg-btn[aria-selected="true"]{background:var(--surface);color:var(--pri-tx);box-shadow:var(--shadow-1)}' +
  '.contract-tab .lp-seg-btn:focus-visible{outline:2px solid var(--sec);outline-offset:2px}' +
  '.contract-tab .lp-acc{border-top:1px solid var(--line2)}' +
  '.contract-tab .lp-acc-item{border-bottom:1px solid var(--line2)}' +
  '.contract-tab .lp-acc-item>summary{list-style:none;cursor:pointer;padding:11px 13px 10px;display:block;transition:background .12s}' +
  '.contract-tab .lp-acc-item>summary::-webkit-details-marker{display:none}' +
  '.contract-tab .lp-acc-hd:hover{background:var(--surface2)}' +
  '.contract-tab .lp-acc-hd:focus-visible{outline:2px solid var(--sec);outline-offset:-2px}' +
  '.contract-tab .lp-ah-top{display:grid;grid-template-columns:15px 1fr auto;align-items:center;gap:9px}' +
  '.contract-tab .lp-chev{color:var(--mut2);transition:transform .18s ease;display:inline-flex}' +
  '.contract-tab .lp-chev .lp-ic{width:14px;height:14px}' +
  '.contract-tab .lp-acc-item[open] .lp-chev{transform:rotate(90deg);color:var(--pri-tx)}' +
  '.contract-tab .lp-ah-name{font-size:12.5px;font-weight:800;color:var(--ink);letter-spacing:-.005em}' +
  '.contract-tab .lp-ah-pts{font:800 12px/1 var(--mono);color:var(--emph-tx)}' +
  '.contract-tab .lp-ah-pts.nrm{color:var(--mut2)}' +
  '.contract-tab .lp-ah-meta{display:flex;align-items:center;gap:10px;margin:7px 0 0 24px;flex-wrap:wrap}' +
  '.contract-tab .lp-cov-chip{font:800 10px/1 var(--sans);letter-spacing:.02em;padding:3px 8px;border-radius:11px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}' +
  '.contract-tab .lp-cov-Confirm{background:var(--warn-t);color:var(--warn)}' +
  '.contract-tab .lp-cov-Gap{background:var(--danger-t);color:var(--danger)}' +
  '.contract-tab .lp-cov-Covered{background:var(--ok-t);color:var(--ok)}' +
  '.contract-tab .lp-acc-body{padding:2px 13px 11px 24px;background:var(--surface2)}' +
  '.contract-tab .lp-acc-find{width:100%;text-align:left;cursor:pointer;display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:9px 3px;border-top:1px solid var(--line);transition:background .12s}' +
  '.contract-tab .lp-acc-find:first-child{border-top:0}' +
  '.contract-tab .lp-acc-find:hover{background:var(--surface)}' +
  '.contract-tab .lp-acc-find:focus-visible{outline:2px solid var(--sec);outline-offset:-2px}' +
  '.contract-tab .lp-af-title{font-size:11.5px;font-weight:600;color:var(--ink2);line-height:1.35}' +
  '.contract-tab .lp-af-id{display:block;font:700 10px/1 var(--mono);color:var(--mut2);margin-top:3px}' +
  '.contract-tab .lp-af-right{display:inline-flex;align-items:center;gap:7px;justify-self:end}' +
  '.contract-tab .lp-gl-bar{width:8px;height:8px;border-radius:2px;display:inline-block;margin-right:7px;vertical-align:middle}' +
  '.contract-tab .lp-obl-sub{display:flex;align-items:center;gap:7px;margin-top:5px;flex-wrap:wrap}' +
  '.contract-tab .lp-obl-clause{font-size:10.5px;color:var(--mut2);font-family:var(--mono)}' +
  '.contract-tab .lp-favors{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;color:var(--mut2);font-weight:600}' +
  '.contract-tab .lp-favors .fv-lab{color:var(--mut);font-weight:700}' +
  '.contract-tab .lp-favors .fv-sup{color:var(--emph-tx)}' +
  '.contract-tab .lp-favors .fv-lilly{color:var(--sec-tx)}' +
  '.contract-tab .lp-favors .fv-mut{color:var(--mut2)}' +
  '.contract-tab .lp-sevmix{display:inline-flex;align-items:center;gap:7px;font-size:10.5px;color:var(--mut2)}' +
  '.contract-tab .lp-sd{display:inline-flex;align-items:center;gap:3px;font-weight:800}' +
  '.contract-tab .lp-sd i{width:8px;height:8px;border-radius:50%;display:inline-block}' +
  '.contract-tab .lp-sd.d-hard-stop i{background:var(--danger)}.contract-tab .lp-sd.d-hard-stop{color:var(--danger)}' +
  '.contract-tab .lp-sd.d-high i{background:var(--emph)}.contract-tab .lp-sd.d-high{color:var(--emph-tx)}' +
  '.contract-tab .lp-sd.d-medium i{background:var(--warn-bar)}.contract-tab .lp-sd.d-medium{color:var(--warn)}' +
  '.contract-tab .lp-sd.d-low i{background:var(--mut)}.contract-tab .lp-sd.d-low{color:var(--mut2)}' +
  /* must-negotiate marker */
  '.contract-tab .lp-mneg{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none;cursor:help;box-shadow:0 0 0 2px var(--surface)}' +
  '.contract-tab .lp-mneg-critical{background:var(--danger)}' +
  '.contract-tab .lp-mneg-high{background:var(--emph)}' +
  /* party / one-sided / balanced pills */
  '.contract-tab .pill.lp-party-supplier{background:var(--plum-t);color:var(--pri-tx)}' +
  '.contract-tab .pill.lp-party-buyer{background:var(--sec-t);color:var(--sec-tx)}' +
  '.contract-tab .pill.lp-party-mutual{background:var(--nested);color:var(--mut2);border-color:var(--line2)}' +
  '.contract-tab .pill.lp-one-sided{background:var(--emph-t);color:var(--emph-tx)}' +
  '.contract-tab .pill.lp-one-sided.crit{background:var(--danger-t);color:var(--danger)}' +
  '.contract-tab .pill.lp-balanced{background:var(--ok-t);color:var(--ok)}' +
  /* 3. register */
  '.contract-tab .lp-reg-tools .toolbar{margin-bottom:0}' +
  '.contract-tab .lp-rf-lab{font:800 10px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--mut);margin-left:4px}' +
  '.contract-tab .lp-reg-clear{border:1px solid var(--line2);background:var(--surface);color:var(--sec-tx);font:800 11px/1 var(--sans);cursor:pointer;padding:6px 11px;border-radius:20px;display:inline-flex;align-items:center;gap:5px}' +
  '.contract-tab .lp-reg-clear:hover{background:var(--sec-t)}' +
  '.contract-tab .lp-reg-clear .lp-ic{width:12px;height:12px}' +
  '.contract-tab .lp-reg-scroll{max-height:620px;overflow-y:auto;border:1px solid var(--line);border-radius:var(--r-sm);margin-top:10px}' +
  '.contract-tab #tbl-lp-register{width:100%}' +
  '.contract-tab #tbl-lp-register td{vertical-align:middle}' +
  '.contract-tab .lp-reg-row.is-open>td{background:var(--plum-t)}' +
  '.contract-tab .lp-td-tag{width:1%;white-space:nowrap}' +
  '.contract-tab .lp-rr-tag{display:inline-block;font:800 9px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;padding:3px 7px;border-radius:6px;white-space:nowrap}' +
  '.contract-tab .lp-tag-issue{background:var(--plum-t);color:var(--pri-tx)}' +
  '.contract-tab .lp-tag-obligation{background:var(--sec-t);color:var(--sec-tx)}' +
  '.contract-tab .lp-rr-flex{display:flex;align-items:center;gap:11px;min-width:0}' +
  '.contract-tab .lp-rr-body{min-width:0}' +
  '.contract-tab .lp-rr-title{display:block;font-size:12.5px;font-weight:700;color:var(--ink);line-height:1.35}' +
  '.contract-tab .lp-rr-sub{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:10.5px;color:var(--mut2);margin-top:3px}' +
  '.contract-tab .lp-rr-id{font-family:var(--mono);font-weight:700;color:var(--mut)}' +
  '.contract-tab .lp-dot{opacity:.5}' +
  '.contract-tab .lp-td-side{width:1%;white-space:nowrap;text-align:right}' +
  /* 4. finding detail */
  '.contract-tab .lp-empty{padding:20px;text-align:center;color:var(--mut2);font-size:12.5px}' +
  '.contract-tab .lp-fd-eyebrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:2px 0 8px}' +
  '.contract-tab .lp-fd-id{font:800 11px/1 var(--mono);color:var(--mut)}' +
  '.contract-tab .lp-fd-kind{font:800 9.5px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:11px}' +
  '.contract-tab .lp-fd-kind.k-issue{background:var(--plum-t);color:var(--pri-tx)}' +
  '.contract-tab .lp-fd-kind.k-obligation{background:var(--sec-t);color:var(--sec-tx)}' +
  '.contract-tab .lp-fd-title{font-size:16px;font-weight:800;line-height:1.32;letter-spacing:-.01em;margin-bottom:3px;color:var(--ink)}' +
  '.contract-tab .lp-fd-title.ob{font-size:14.5px}' +
  '.contract-tab .lp-fd-cat{font-size:11.5px;color:var(--mut);margin-bottom:13px}' +
  '.contract-tab .lp-tactic{display:flex;gap:9px;background:var(--warn-t);border:1px solid color-mix(in srgb,var(--warn-bar) 45%,transparent);border-radius:8px;padding:9px 11px;margin-bottom:14px;font-size:12px}' +
  '.contract-tab .lp-tactic .lp-ic{color:var(--warn);flex:none}' +
  '.contract-tab .lp-tactic b{color:var(--warn)}' +
  '.contract-tab .lp-tk-q{display:block;color:var(--mut2);font-style:italic;margin-top:3px;font-size:11.5px}' +
  '.contract-tab .lp-outcomes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 6px}' +
  '.contract-tab .lp-oc{border:1px solid var(--line2);border-radius:9px;padding:11px 12px 12px;background:var(--surface2);position:relative}' +
  '.contract-tab .lp-oc::before{content:"";position:absolute;left:0;top:11px;bottom:11px;width:3px;border-radius:3px}' +
  '.contract-tab .lp-oc.lp-preferred::before{background:var(--ok-bar)}' +
  '.contract-tab .lp-oc.lp-fallback::before{background:var(--warn-bar)}' +
  '.contract-tab .lp-oc.lp-walkaway::before{background:var(--danger-bar)}' +
  '.contract-tab .lp-oc.lp-walkaway-none::before{background:var(--mut2)}' +
  '.contract-tab .lp-oc-lab{font:800 10px/1.2 var(--sans);letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px;padding-left:9px;color:var(--mut2)}' +
  '.contract-tab .lp-oc.lp-preferred .lp-oc-lab{color:var(--ok)}' +
  '.contract-tab .lp-oc.lp-fallback .lp-oc-lab{color:var(--warn)}' +
  '.contract-tab .lp-oc.lp-walkaway .lp-oc-lab{color:var(--danger)}' +
  '.contract-tab .lp-oc.lp-walkaway-none .lp-oc-lab{color:var(--mut2)}' +
  '.contract-tab .lp-oc-sub{display:block;font:700 9px/1.2 var(--sans);color:var(--mut2);letter-spacing:.02em;margin-top:2px;text-transform:none}' +
  '.contract-tab .lp-oc-body{font-size:11.5px;color:var(--ink2);line-height:1.42;padding-left:9px}' +
  '.contract-tab .lp-oc-src{font-size:10.5px;color:var(--mut2);margin:6px 0 12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}' +
  '.contract-tab .lp-lk{border:0;background:var(--sec-t);color:var(--sec-tx);font:800 10.5px/1 var(--mono);padding:3px 8px;border-radius:11px;cursor:pointer;display:inline-block}' +
  '.contract-tab .lp-lk:hover{background:var(--sec);color:var(--sec-fg)}' +
  '.contract-tab .lp-zone{border:1px solid var(--line2);border-left-width:3px;border-radius:8px;padding:11px 13px;margin-top:12px;background:var(--surface)}' +
  '.contract-tab .lp-zone.z-state{border-left-color:var(--plum)}' +
  '.contract-tab .lp-zone.z-problem{border-left-color:var(--emph)}' +
  '.contract-tab .lp-zone.z-play{border-left-color:var(--sec)}' +
  '.contract-tab .lp-zone-hd{display:flex;align-items:center;gap:7px;margin-bottom:9px}' +
  '.contract-tab .lp-zone-hd .lp-ic{width:15px;height:15px}' +
  '.contract-tab .lp-zone.z-state .lp-zone-hd{color:var(--pri-tx)}' +
  '.contract-tab .lp-zone.z-problem .lp-zone-hd{color:var(--emph-tx)}' +
  '.contract-tab .lp-zone.z-play .lp-zone-hd{color:var(--sec-tx)}' +
  '.contract-tab .lp-zt{font:800 10.5px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase}' +
  '.contract-tab .lp-zone-bd{font-size:12.5px;color:var(--ink2);line-height:1.5}' +
  '.contract-tab .lp-zf{margin-top:10px}' +
  '.contract-tab .lp-zf:first-child{margin-top:0}' +
  '.contract-tab .lp-zf-lab{font:800 9.5px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--mut);margin-bottom:3px}' +
  '.contract-tab .lp-quote{border-left:3px solid var(--line2);background:var(--surface2);padding:8px 11px;margin-top:6px;font-size:11.5px;color:var(--mut2);font-style:italic;border-radius:0 6px 6px 0;line-height:1.45}' +
  '.contract-tab .lp-quote.contract{border-left-color:var(--sec)}' +
  '.contract-tab .lp-quote.playbook{border-left-color:var(--plum);font-style:normal}' +
  '.contract-tab .lp-quote.playbook b{color:var(--pri-tx)}' +
  '.contract-tab .lp-quote.pushback{border-left-color:var(--emph)}' +
  '.contract-tab .lp-facts{border:1px solid var(--line2);border-radius:8px;overflow:hidden;margin-top:2px}' +
  '.contract-tab .lp-fact{display:grid;grid-template-columns:132px 1fr;gap:12px;padding:9px 12px;border-top:1px solid var(--line);background:var(--surface)}' +
  '.contract-tab .lp-fact:first-child{border-top:0}' +
  '.contract-tab .lp-fact:nth-child(even){background:var(--surface2)}' +
  '.contract-tab .lp-fact-l{font:800 10px/1.4 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--mut)}' +
  '.contract-tab .lp-fact-v{font-size:12.5px;color:var(--ink2);line-height:1.45}' +
  '.contract-tab .lp-gapnote{color:var(--danger);font-weight:600}' +
  '.contract-tab .lp-verdict{display:flex;gap:11px;padding:11px 13px;border-radius:9px;border:1px solid;border-left-width:4px;margin-top:12px;align-items:flex-start}' +
  '.contract-tab .lp-verdict .lp-ic{width:17px;height:17px;margin-top:1px;flex:none}' +
  '.contract-tab .lp-verdict.v-fair{background:var(--ok-t);border-color:var(--ok-bar)}' +
  '.contract-tab .lp-verdict.v-fair .lp-ic,.contract-tab .lp-verdict.v-fair .lp-v-label{color:var(--ok)}' +
  '.contract-tab .lp-verdict.v-neutral{background:var(--nested);border-color:var(--line2)}' +
  '.contract-tab .lp-verdict.v-neutral .lp-ic,.contract-tab .lp-verdict.v-neutral .lp-v-label{color:var(--mut2)}' +
  '.contract-tab .lp-verdict.v-adverse{background:var(--emph-t);border-color:var(--emph)}' +
  '.contract-tab .lp-verdict.v-adverse .lp-ic,.contract-tab .lp-verdict.v-adverse .lp-v-label{color:var(--emph-tx)}' +
  '.contract-tab .lp-verdict.v-critical{background:var(--danger-t);border-color:var(--danger)}' +
  '.contract-tab .lp-verdict.v-critical .lp-ic,.contract-tab .lp-verdict.v-critical .lp-v-label{color:var(--danger)}' +
  '.contract-tab .lp-v-body{min-width:0}' +
  '.contract-tab .lp-v-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px}' +
  '.contract-tab .lp-v-label{font:800 12.5px/1.2 var(--sans);letter-spacing:-.005em}' +
  '.contract-tab .lp-v-why{font-size:12px;color:var(--ink2);line-height:1.45}' +
  '.contract-tab .lp-neg{display:flex;align-items:flex-start;gap:10px;margin-top:12px;padding:10px 12px;background:var(--surface2);border:1px solid var(--line2);border-radius:8px}' +
  '.contract-tab .lp-neg-badge{font:800 10px/1.3 var(--sans);letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:11px;white-space:nowrap;flex:none}' +
  '.contract-tab .lp-neg-badge.yes{background:var(--emph-t);color:var(--emph-tx)}' +
  '.contract-tab .lp-neg-badge.no{background:var(--ok-t);color:var(--ok)}' +
  '.contract-tab .lp-neg-why{font-size:12px;color:var(--ink2);line-height:1.45}' +
  '.contract-tab .lp-nq{display:block;font:800 9.5px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--mut);margin-bottom:2px}' +
  '.contract-tab .lp-balanced-panel{display:flex;gap:11px;align-items:flex-start;margin-top:12px;padding:12px 13px;background:var(--ok-t);border:1px solid var(--ok-bar);border-left-width:4px;border-radius:9px}' +
  '.contract-tab .lp-balanced-panel .lp-ic{color:var(--ok);width:17px;height:17px;flex:none;margin-top:1px}' +
  '.contract-tab .lp-bp-t{font:800 12.5px/1.3 var(--sans);color:var(--ok);margin-bottom:2px}' +
  '.contract-tab .lp-bp-b{font-size:12px;color:var(--ink2);line-height:1.45}' +
  '.contract-tab .lp-refine{margin-top:9px;font-size:11.5px;color:var(--mut2);line-height:1.45}' +
  '.contract-tab .lp-refine b{color:var(--ink2)}' +
  '.contract-tab .lp-xlink{border:0;background:var(--sec-t);color:var(--sec-tx);font:800 11px/1 var(--sans);margin-top:8px;padding:6px 11px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}' +
  '.contract-tab .lp-xlink:hover{background:var(--sec);color:var(--sec-fg)}' +
  '.contract-tab .lp-xlink .lp-ic{width:13px;height:13px}' +
  '.contract-tab .lp-play-wrap{margin-top:12px}' +
  '.contract-tab .lp-dl-foot{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:15px;padding-top:11px;border-top:1px solid var(--line2);font-size:11px;color:var(--mut2)}' +
  '.contract-tab .lp-dl-foot .fk{font-family:var(--mono)}' +
  '@media(max-width:760px){' +
    '.contract-tab .lp-outcomes{grid-template-columns:1fr}' +
    '.contract-tab .lp-fact{grid-template-columns:1fr;gap:2px}' +
    '.contract-tab .lp-wf-axis{margin-left:104px}' +
    '.contract-tab .lp-wf-row{grid-template-columns:104px 1fr 44px}' +
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
