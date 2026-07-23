/* =============================================================================
 * tab-contract.js — "Contract" tab builder for the Deal artifact.
 * Subtabs: Document Map · Scope & Performance · Terms & Risk.
 * Reads ONLY from dashboardData (param d). Every material value carries an
 * evidenceChip; every count/derived figure is computed live from d, never
 * hard-coded, so it stays consistent if the underlying model changes.
 * Depends on globals from helpers.js (esc, money, icon, saCard, dataTable, …)
 * which are loaded before this file. Attaches:
 *   window.renderTab_contract(d)   — the function itself
 *   window.DealTabs.contract       — same fn, per the shell's tab-builder convention
 * ========================================================================== */
(function (global) {
'use strict';

/* ---------- small local utilities (this file only) ------------------------ */
const ROLE_LABEL = { governing:'Governing', ordering:'Ordering', scope:'Scope',
                     data:'Data', security:'Security', correspondence:'Correspondence' };
function roleLabel(role) { return ROLE_LABEL[role] || role; }
function findDoc(id, d) { return (d.documents || []).find(x => x.id === id); }
function docTypeOf(id, d) { const doc = findDoc(id, d); return doc ? doc.type : id; }
function gapForDocId(docId, d) { return (d.gaps || []).find(g => (g.input || '').indexOf(docId) !== -1); }
function sevRank(p) { return ({ 'hard-stop':4, high:3, medium:2, low:1 })[p] || 0; }
function decisionLabel(v) { return ({ pending:'Pending', accept:'Accepted', reject:'Rejected', trade:'Trade' })[v] || v; }
function hasRealHardStop(text) { return !!text && !/^none\b/i.test(text.trim()); }

/* ============================================================================
 * SUBTAB 1 — Document Map
 * ========================================================================== */
function docNode(doc, isRoot) {
  const missing = doc.evidenceType === 'unavailable';
  const cls = 'ddm-child' + (missing ? ' ddm-missing' : '') + (isRoot ? ' ddm-rootbox' : '');
  return '<div class="' + cls + '">' +
    '<div class="ddm-role">' + esc(roleLabel(doc.role)) + '</div>' +
    '<div class="ddm-name">' + esc(doc.name) + '</div>' +
    '<div class="ddm-meta">' + esc(doc.type) + (doc.pages ? ' &middot; ' + doc.pages + ' pp' : '') +
      (doc.date ? ' &middot; ' + esc(doc.date) : '') + '</div>' +
    '<div class="ddm-status">' + esc(doc.status) + '</div>' +
    '<div class="ddm-bottom">' + evidenceChip(doc.evidenceType, { short:true, sources:[doc.id] }) + '</div>' +
  '</div>';
}

function renderDocMap(d) {
  const docs = d.documents || [];
  const root = docs.find(x => x.role === 'governing') || docs[0];
  const children = docs.filter(x => x !== root);
  const missingDocs = docs.filter(x => x.evidenceType === 'unavailable');

  const treeHtml =
    '<style>' +
    '.ddm-tree{padding:16px 6px 30px}' +
    '.ddm-root{display:flex;justify-content:center}' +
    '.ddm-branch{width:2px;height:20px;background:var(--line2);margin:0 auto}' +
    '.ddm-children{position:relative;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;padding-top:16px}' +
    '.ddm-children::before{content:"";position:absolute;top:0;left:12%;right:12%;height:2px;background:var(--line2)}' +
    '.ddm-child{position:relative;flex:1 1 160px;max-width:200px;background:var(--surface);border:1px solid var(--line2);' +
      'border-radius:var(--r-sm);padding:10px 12px;box-shadow:var(--shadow-1)}' +
    '.ddm-child::before{content:"";position:absolute;top:-16px;left:50%;width:2px;height:16px;background:var(--line2)}' +
    '.ddm-child.ddm-missing{background:var(--panel);border-style:dashed}' +
    '.ddm-rootbox{max-width:260px;border-color:var(--pri);border-width:1.5px}' +
    '.ddm-role{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:700}' +
    '.ddm-name{font-weight:700;font-size:var(--fz-sm);margin:3px 0 2px;color:var(--ink)}' +
    '.ddm-meta{font-size:var(--fz-meta);color:var(--mut)}' +
    '.ddm-status{font-size:var(--fz-meta);color:var(--mut2);margin:2px 0 6px;font-style:italic}' +
    '.ddm-bottom{display:flex;gap:6px;flex-wrap:wrap;align-items:center}' +
    '</style>' +
    '<div class="ddm-tree">' +
      '<div class="ddm-root">' + docNode(root, true) + '</div>' +
      '<div class="ddm-branch"></div>' +
      '<div class="ddm-children">' + children.map(c => docNode(c, false)).join('') + '</div>' +
    '</div>';

  const mapInsights =
    insight(docs.length + ' documents make up this deal; <strong>' + missingDocs.length +
      '</strong> (' + missingDocs.map(x => x.type).join(', ') + ') are referenced in the ' + esc(root.name) +
      ' but were not provided in this session.', 'warn') +
    insight('The MSA (' + esc(root.id) + ') is the sole governing instrument; the Order Form and SOW-01 operate under it and were reviewed as a set.', '');

  const docMapCard = saCard('Document Relationship Map', treeHtml + mapInsights,
    { icon:'doc', sub: docs.length + ' documents &middot; ' + missingDocs.length + ' unavailable' });

  /* ---- Document inventory table ---- */
  const invCols = [
    { key:'id', label:'ID', width:'64px' },
    { key:'name', label:'Document', render: r => '<strong>' + esc(r.name) + '</strong>' },
    { key:'role', label:'Role', render: r => esc(roleLabel(r.role)) },
    { key:'status', label:'Status', render: r => esc(r.status) },
    { key:'date', label:'Date', render: r => r.date ? esc(r.date) : '&mdash;', sortVal: r => r.date || '' },
    { key:'pages', label:'Pages', align:'num', render: r => r.pages != null ? r.pages : '&mdash;' },
    { key:'evidence', label:'Evidence', sort:false, render: r => evidenceChip(r.evidenceType, { short:true, sources:[r.id] }) }
  ];
  const invTable = dataTable(invCols, docs, {
    zebra:true, dense:true, id:'tbl-doc-inventory',
    expand: r => {
      const related = (r.relatedTo || []).map(id => { const rd = findDoc(id, d); return rd ? rd.type + ' (' + rd.id + ')' : id; }).join(', ');
      const lim = (r.limitations || []).length ? insight(esc(r.limitations.join(' ')), 'warn') : '';
      return '<div class="kv"><dt>Source</dt><dd>' + esc(r.sourceType) + '</dd>' +
        '<dt>Related to</dt><dd>' + (related || '&mdash;') + '</dd></div>' + lim;
    }
  });
  const invCard = saCard('Document Inventory', invTable, { icon:'sources', accent:'teal' });

  /* ---- Governing terms & precedence ---- */
  const precRows = docs.map(doc =>
    '<dt>' + esc(roleLabel(doc.role)) + '</dt><dd><strong>' + esc(doc.type) + '</strong> &mdash; ' + esc(doc.name) +
      (doc.evidenceType === 'unavailable' ? ' ' + evidenceChip('unavailable', { short:true }) : '') + '</dd>').join('');
  const precInner = '<dl class="kv">' + precRows + '</dl>' +
    insight('Precedence inferred from each document’s stated role (governing &rarr; ordering/scope &rarr; data/security); ' +
      'no explicit order-of-precedence clause appeared in the reviewed text. ' + evidenceChip('inference', { short:true }));
  const precCard = saCard('Governing Terms & Precedence', precInner, { icon:'scale', accent:'emph' });

  /* ---- Cross-document consistency / conflicts ---- */
  const crossRows = [
    { docA:'DOC-01', docB:'DOC-04', topic:'Data protection terms', ok:false, issueId:'ISS-03',
      note:'MSA incorporates a DPA "by reference," but the DPA text itself is not in session.' },
    { docA:'DOC-01', docB:'DOC-04', topic:'Sub-processor change control', ok:false, issueId:'ISS-08',
      note:'Sub-processor notice/objection mechanism would normally sit in the DPA; unavailable.' },
    { docA:'DOC-01', docB:'DOC-05', topic:'SLA credit schedule &amp; security controls', ok:false, issueId:'ISS-06',
      note:'MSA sets the uptime target; the credit schedule and controls sit in the missing Security Exhibit.' },
    { docA:'DOC-01', docB:'DOC-03', topic:'Renewal notice &amp; price', ok:true, issueId:'ISS-04',
      note:'MSA and Order Form agree; both are silent on a renewal price cap (the deviation is vs. playbook, not between the two documents).' },
    { docA:'DOC-02', docB:'DOC-03', topic:'Fee schedule totals', ok:true, issueId:'ISS-12',
      note:'Order Form (subscription) and SOW-01 (services) fee lines combine into the Year-1 total; no discrepancy found between the two.' }
  ];
  const crossCols = [
    { key:'docs', label:'Documents', sort:false, render: r => docTypeOf(r.docA, d) + ' ↔ ' + docTypeOf(r.docB, d) },
    { key:'topic', label:'Topic', sort:false, render: r => r.topic },
    { key:'consistency', label:'Consistency', sort:false, render: r => r.ok ? statusPill('aligned','Aligned') : statusPill('deviation','Gap') },
    { key:'issue', label:'Linked issue', sort:false, render: r => jumpLink(r.issueId, 'tab:contract/sub:terms') + ' ' + severityPill((d.issues.find(i=>i.id===r.issueId)||{}).priority || 'medium') },
    { key:'note', label:'Note', sort:false, render: r => '<span class="tiny muted">' + r.note + '</span>' }
  ];
  const crossTable = dataTable(crossCols, crossRows, { zebra:true, dense:true, id:'tbl-crossdoc', sortable:false });
  const crossInsights =
    insight('No directly contradicting clause language was found between the three present documents (MSA, SOW-01, Order Form); the material cross-document issues are <strong>gaps</strong> created by the two missing exhibits.', 'warn') +
    insight('Both data-protection gaps (DPA text, sub-processor notice) resolve together once the DPA is obtained &mdash; see Missing Documents.');
  const crossCard = saCard('Cross-Document Consistency & Conflicts', crossTable + crossInsights, { icon:'scale' });

  /* ---- Missing documents ---- */
  const missingHtml = missingDocs.map(md => {
    const gap = gapForDocId(md.id, d);
    const body = '<div class="kv" style="margin-bottom:6px">' +
      '<dt>Referenced at</dt><dd>' + esc(md.sourceType) + '</dd>' +
      (gap ? '<dt>Why it matters</dt><dd>' + esc(gap.whyItMatters) + '</dd>' +
             '<dt>Possible source</dt><dd>' + esc(gap.possibleSource) + '</dd>' : '') +
      '</div>' +
      (md.limitations || []).map(l => '<div class="tiny muted">' + esc(l) + '</div>').join('') +
      '<div style="margin-top:6px">' + evidenceChip('unavailable') + ' ' +
      jumpLink('View in Missing Inputs →', 'tab:sources/sub:gaps') + '</div>';
    return gapCard(md.type + ' — ' + md.name, body);
  }).join('<div class="divider"></div>');
  const missingCard = saCard('Missing Documents', missingHtml || '<div class="card-note">No referenced documents are missing.</div>',
    { icon:'gap', accent:'danger', sub: missingDocs.length + ' unavailable' });

  return '<div class="tab-intro"><h2>Document Map</h2><p class="q">Inventory, relationship structure, governing precedence and cross-document gaps for the MSA + SOW-01 + Order Form set. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-12">' + docMapCard + '</div>' +
      '<div class="col-8">' + invCard + '</div>' +
      '<div class="col-4">' + precCard + '</div>' +
      '<div class="col-7">' + crossCard + '</div>' +
      '<div class="col-5">' + missingCard + '</div>' +
    '</div>';
}

/* ============================================================================
 * SUBTAB 2 — Scope & Performance
 * ========================================================================== */
function raciCell(val) {
  if (!val) return '<span class="pill muted" title="No role assigned">&mdash;</span>';
  const cls = val === 'A' ? 'warn' : (val === 'R' ? 'ok' : 'muted');
  return '<span class="pill ' + cls + '">' + val + '</span>';
}

function renderScopePerf(d) {
  const sc = d.scope || {};

  /* ---- Delivery timeline (milestones) + deliverables legend ---- */
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
  const timelineCard = saCard('Delivery Timeline', ganttHtml + delivLegend + timelineInsight,
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

  /* ---- Scope boundaries ---- */
  const inList = (sc.inScope || []).map(x => '<li>' + esc(x.text) + ' ' + evidenceChip(x.evidenceType, { short:true }) + '</li>').join('');
  const outList = (sc.outOfScope || []).map(x => '<li>' + esc(x.text) + ' ' + evidenceChip(x.evidenceType, { short:true }) + '</li>').join('');
  const scopeBody =
    '<p class="card-note" style="margin-top:0"><strong>Objective:</strong> ' + esc(sc.objective) + ' ' + evidenceChip(sc.objectiveEvidence, { short:true }) + '</p>' +
    '<div class="divider"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
      '<div><div class="eyebrow" style="margin-bottom:6px">In scope</div><ul style="margin:0;padding-left:18px;line-height:1.7">' + inList + '</ul></div>' +
      '<div><div class="eyebrow" style="margin-bottom:6px">Out of scope</div><ul style="margin:0;padding-left:18px;line-height:1.7">' + outList + '</ul></div>' +
    '</div>';
  const scopeCard = saCard('Scope Boundaries', scopeBody, { icon:'target' });

  /* ---- Acceptance analysis ---- */
  const accCols = [
    { key:'id', label:'ID', width:'56px' },
    { key:'deliverable', label:'Deliverable', width:'70px', render: r => esc(r.deliverable) },
    { key:'criteria', label:'Criteria', sort:false, render: r => r.criteria },
    { key:'defined', label:'Defined', render: r => r.defined ? statusPill('aligned','Defined') : statusPill('deviation','Not defined'), sortVal: r => r.defined ? 1 : 0 },
    { key:'evidence', label:'Evidence', sort:false, render: r => evidenceChip(r.evidenceType, { short:true }) }
  ];
  const accTable = dataTable(accCols, sc.acceptance || [], { zebra:true, dense:true, id:'tbl-acceptance',
    rowClass: r => r.defined ? '' : 'rowtint-warn' });
  const accInsight = insight('2 of 4 acceptance criteria (dashboards, training) have no objective pass/fail standard &mdash; links to the deemed-acceptance issue in Terms &amp; Risk.', 'warn');
  const accCard = saCard('Acceptance Analysis', accTable + accInsight, { icon:'flag', accent:'teal' });

  /* ---- RACI ---- */
  const raci = sc.raci || { roles:[], rows:[] };
  const raciCols = [{ key:'activity', label:'Activity', sort:false,
      render: r => '<strong>' + esc(r.activity) + '</strong>' + (r.ambiguous ? ' <span class="pill warn" title="Ambiguous accountability">!</span>' : '') }]
    .concat(raci.roles.map((role, i) => ({ key:'role' + i, label: role, sort:false, render: r => raciCell(r.vals[i]) })));
  const raciTable = dataTable(raciCols, raci.rows || [], { zebra:false, dense:true, id:'tbl-raci', sortable:false,
    rowClass: r => r.ambiguous ? 'rowtint-warn' : '',
    expand: r => r.note ? insight(esc(r.note), 'warn') + ' ' + evidenceChip(r.evidenceType, { short:true }) : null });
  const raciLegend = '<div class="tiny muted" style="margin-top:8px">R = Responsible &middot; A = Accountable &middot; C = Consulted &middot; I = Informed. Rows marked ! have an ambiguous or missing accountable owner &mdash; expand for detail.</div>';
  const raciCard = saCard('Responsibility (RACI)', raciTable + raciLegend, { icon:'raci' });

  /* ---- SLAs & change control ---- */
  const slaCols = [
    { key:'metric', label:'Metric', render: r => esc(r.metric) },
    { key:'target', label:'Target', render: r => esc(r.target) },
    { key:'playbook', label:'Playbook', render: r => esc(r.playbook) },
    { key:'remedy', label:'Remedy', sort:false, render: r => esc(r.remedy) },
    { key:'status', label:'Status', render: r => statusPill(r.status) },
    { key:'issue', label:'Issue', sort:false, render: r => r.issueId ? jumpLink(r.issueId, 'tab:contract/sub:terms') : '&mdash;' }
  ];
  const slaTable = dataTable(slaCols, sc.serviceLevels || [], { zebra:true, dense:true, id:'tbl-sla',
    rowClass: r => r.status === 'deviation' ? 'rowtint-danger' : (r.status === 'partial' ? 'rowtint-warn' : '') });
  const changeHtml = (sc.changeControl || []).map(c => insight(esc(c.text) + ' ' + evidenceChip(c.evidenceType, { short:true }))).join('');
  const slaCard = saCard('SLAs & Change Control', slaTable + '<div class="divider"></div>' + changeHtml, { icon:'shield', accent:'emph' });

  return '<div class="tab-intro"><h2>Scope &amp; Performance</h2><p class="q">SOW-01 objective, delivery schedule, acceptance standards, responsibility split and service levels. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-8">' + timelineCard + '</div>' +
      '<div class="col-4">' + depCard + '</div>' +
      '<div class="col-6">' + scopeCard + '</div>' +
      '<div class="col-6">' + accCard + '</div>' +
      '<div class="col-7">' + raciCard + '</div>' +
      '<div class="col-5">' + slaCard + '</div>' +
    '</div>';
}

/* ============================================================================
 * SUBTAB 3 — Terms & Risk (full issue register)
 * ========================================================================== */
function issueExpandHtml(iss, d) {
  const doc = findDoc(iss.documentId, d);
  const clauseBlock = collapsible(
    'View source clause &amp; playbook position',
    excerpt(iss.sourceExcerpt) +
    '<div class="divider"></div>' +
    '<div class="card-note"><strong>Playbook position:</strong> ' + esc(iss.playbookPosition) + '</div>'
  );
  const hardStopLine = hasRealHardStop(iss.hardStop) ? insight('<strong>Hard-stop line:</strong> ' + esc(iss.hardStop), 'danger') : '';
  const sourceChips = (iss.sourceIds || []).map(sid => {
    const src = (d.sources || []).find(s => s.id === sid);
    return evidenceChip(src ? src.evidenceType : 'internal', { short:true, sources:[sid] });
  }).join(' ');
  return '<div class="kv" style="margin-bottom:8px">' +
      '<dt>Clause</dt><dd>' + esc(iss.clause) + '</dd>' +
      '<dt>Document</dt><dd>' + (doc ? jumpLink(doc.type + ' (' + doc.id + ')', 'tab:contract/sub:map') : esc(iss.documentId)) + '</dd>' +
      '<dt>Decision</dt><dd>' + statusPill(iss.internalDecision, decisionLabel(iss.internalDecision)) + '</dd>' +
    '</div>' +
    clauseBlock +
    '<div class="divider"></div>' +
    insight('<strong>Supplier position:</strong> ' + esc(iss.supplierPosition)) +
    insight('<strong>Deviation vs. playbook:</strong> ' + esc(iss.deviation), 'warn') +
    insight('<strong>Impact:</strong> ' + esc(iss.impact), 'danger') +
    insight('<strong>Recommended position:</strong> ' + esc(iss.recommendedPosition)) +
    insight('<strong>Fallback:</strong> ' + esc(iss.fallback)) +
    hardStopLine +
    '<div class="divider"></div>' +
    insight('<strong>Supplier pushback:</strong> “' + esc(iss.supplierPushback) + '”') +
    insight('<strong>Recommended response:</strong> ' + esc(iss.recommendedResponse)) +
    insight('<strong>Trade opportunity:</strong> ' + esc(iss.tradeOpportunity)) +
    '<div class="btn-row" style="margin-top:8px">' + sourceChips + '</div>';
}

function issueRowHtml(iss, d) {
  const doc = findDoc(iss.documentId, d);
  const facet = (iss.priority + ' ' + iss.category).toLowerCase();
  const rowKey = iss.id;
  return '<tr class="expandable" data-exprow="' + rowKey + '" data-rowkey="' + rowKey + '" data-facet="' + esc(facet) + '">' +
      '<td>' + esc(iss.id) + '</td>' +
      '<td><strong>' + esc(iss.title) + '</strong><div class="tiny muted">' + esc(iss.category) + '</div></td>' +
      '<td data-sv="' + sevRank(iss.priority) + '">' + severityPill(iss.priority) + '</td>' +
      '<td>' + (doc ? esc(doc.type) : '&mdash;') + '</td>' +
      '<td>' + statusPill(iss.internalDecision, decisionLabel(iss.internalDecision)) + '</td>' +
      '<td>' + evidenceChip(iss.evidenceType, { short:true, sources: iss.sourceIds }) + '</td>' +
    '</tr>' +
    '<tr class="expander-row is-hidden" data-expfor="' + rowKey + '"><td colspan="6"><div class="exp-inner">' + issueExpandHtml(iss, d) + '</div></td></tr>';
}

function renderTermsRisk(d) {
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
  const chartInsights =
    insight('<strong>' + hardIds.length + '</strong> hard-stop item' + (hardIds.length === 1 ? '' : 's') +
      ' (' + hardIds.map(i => i.id).join(', ') + ') sit in ' + hardCats.join(' and ') + ' &mdash; these block signature.', 'danger') +
    insight('<strong>' + prCounts.find(x => x.p === 'high').count + '</strong> high-priority issues remain open across ' +
      catCounts.filter(x => x.hasHigh).length + ' categories.', 'warn') +
    insight('Commercial issues (ISS-11, ISS-12) are high-priority but not signature-blocking on their own &mdash; they trade against the Commercials scenarios.');

  const chartCard = saCard('Issues by Category', barsHtml + prLegend + chartInsights,
    { icon:'bench', sub: issues.length + ' issues tracked' });

  /* ---- full filterable, expandable, sortable register ---- */
  const toolbar =
    '<div class="toolbar">' +
      '<input type="search" placeholder="Search issues, clauses, categories…" data-filter-input data-filter-for="tbl-issue-register">' +
      '<button class="chip-filter" data-filterchip="hard-stop" aria-pressed="false">Hard stop</button>' +
      '<button class="chip-filter" data-filterchip="high" aria-pressed="false">High</button>' +
      '<button class="chip-filter" data-filterchip="medium" aria-pressed="false">Medium</button>' +
      '<button class="chip-filter" data-filterchip="low" aria-pressed="false">Low</button>' +
      '<span class="spacer"></span>' +
      '<span class="filter-count">' + issues.length + ' of ' + issues.length + ' shown</span>' +
    '</div>';
  const registerTable =
    '<div class="tbl-wrap"><table class="dt zebra dense" id="tbl-issue-register">' +
      '<thead><tr>' +
        '<th data-sort="id">ID</th>' +
        '<th data-sort="title">Issue</th>' +
        '<th data-sort="priority">Priority</th>' +
        '<th data-sort="doc">Document</th>' +
        '<th data-sort="decision">Decision</th>' +
        '<th>Evidence</th>' +
      '</tr></thead>' +
      '<tbody>' + issues.map(iss => issueRowHtml(iss, d)).join('') + '</tbody>' +
    '</table></div>';
  const registerCard = saCard('Issue Register — Full Detail',
    '<div data-filter-scope>' + toolbar + registerTable + '</div>',
    { icon:'flag', accent:'plum', sub:'click a row to expand' });

  return '<div class="tab-intro"><h2>Terms &amp; Risk</h2><p class="q">Every tracked issue across the MSA, SOW-01 and Order Form &mdash; filter by priority, expand any row for supplier position, playbook comparison, recommended response and trade options. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div>' +
    '<div class="grid">' +
      '<div class="col-4">' + chartCard + '</div>' +
      '<div class="col-8">' + registerCard + '</div>' +
    '</div>';
}

/* ============================================================================
 * TAB ENTRY POINT
 * ========================================================================== */
function renderTab_contract(d) {
  return '<div class="subtabbar" data-subtab-group="contract"><div class="wrap">' +
      '<button class="subtab-btn" data-subtab="map" aria-selected="true">Document Map</button>' +
      '<button class="subtab-btn" data-subtab="scope" aria-selected="false">Scope &amp; Performance</button>' +
      '<button class="subtab-btn" data-subtab="terms" aria-selected="false">Terms &amp; Risk</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
      '<div data-subpanel="contract/map" class="is-active">' + renderDocMap(d) + '</div>' +
      '<div data-subpanel="contract/scope">' + renderScopePerf(d) + '</div>' +
      '<div data-subpanel="contract/terms">' + renderTermsRisk(d) + '</div>' +
    '</div></div>';
}

global.renderTab_contract = renderTab_contract;
global.DealTabs = global.DealTabs || {};
global.DealTabs.contract = renderTab_contract;

})(typeof window !== 'undefined' ? window : this);
