/* =============================================================================
 * tab-negotiation.js — "Negotiation" primary tab builder for the Deal artifact.
 * Attaches window.renderTab_negotiation(d) and window.DealTabs.negotiation(d).
 * Reads ONLY from dashboardData (param d). No fact is restated/hard-coded —
 * every value is looked up from d.issues / d.negotiation / d.assumptions etc.
 *
 * Subtabs (group="negotiation"): positions | tradeplan | meeting
 * ========================================================================== */
(function (global) {
'use strict';

const PR_RANK = { 'hard-stop': 0, high: 1, medium: 2, low: 3 };
const STRENGTH_RANK = { Strong: 0, Moderate: 1, Weak: 2 };
const MAG_LEVEL = { low: 1.4, medium: 3, high: 4.6 };

function magPill(level) {
  const cls = level === 'high' ? 'warn' : level === 'medium' ? 'info' : 'muted';
  return '<span class="pill ' + cls + '">' + esc(level) + '</span>';
}

function wordingPair(text) {
  return '<span class="word-collab clamp2">We would like to move toward: ' + esc(text) + '</span>' +
         '<span class="word-direct clamp2">We require: ' + esc(text) + '</span>';
}

function hardStopCell(row) {
  if (/^none/i.test(row.hardStop || '')) {
    return '<span class="muted tiny">No walk-away line drawn</span>';
  }
  return '<span class="hs-line">' + icon('flag') + '<span>' + esc(row.hardStop) + '</span></span>';
}

function renderTab_negotiation(d) {
  const issueById = (id) => d.issues.find((i) => i.id === id);
  const docById = (id) => d.documents.find((x) => x.id === id);
  const pkgById = (id) => d.negotiation.packages.find((p) => p.id === id);

  // small cross-reference chip — every negotiation view points back at the SAME
  // issue objects that drive Contract; never restates the issue, just links to it.
  function issueTag(id) {
    const iss = issueById(id);
    const t = iss ? iss.title : id;
    return '<span class="pill info neg-tag" data-jump="tab:contract/sub:terms" title="' +
      esc(id + ' — ' + t + ' (jump to Terms &amp; Risk register)') + '">' + esc(id) + '</span>';
  }

  /* ================================ POSITIONS =============================== */
  function buildPositions() {
    const rows = d.issues.slice().sort((a, b) =>
      (PR_RANK[a.priority] - PR_RANK[b.priority]) || a.id.localeCompare(b.id));

    const cols = [
      { key: 'title', label: 'Issue', width: '19%', render: (r) =>
          '<div style="font-weight:700"><span class="row-chevron">' + icon('chevron') + '</span>' + esc(r.title) + '</div>' +
          '<div class="tiny muted" style="padding-left:19px">' + esc(r.category) + ' · ' + esc(r.id) + '</div>',
        sortVal: (r) => r.title.toLowerCase() },
      { key: 'priority', label: 'Priority', width: '9%', render: (r) => severityPill(r.priority),
        sortVal: (r) => PR_RANK[r.priority] },
      { key: 'basis', label: 'Basis', width: '15%', render: (r) =>
          '<div class="tiny">' + esc(r.clause) + '</div><div style="margin-top:3px">' +
          evidenceChip(r.evidenceType, { short: true, sources: r.sourceIds }) + '</div>',
        sort: false },
      { key: 'supplierPosition', label: 'Supplier position', width: '19%', render: (r) =>
          '<span class="clamp2">' + esc(r.supplierPosition) + '</span>', sort: false },
      { key: 'recommendedPosition', label: 'Recommended (target)', width: '17%',
        render: (r) => wordingPair(r.recommendedPosition), sort: false },
      { key: 'fallback', label: 'Fallback', width: '13%',
        render: (r) => wordingPair(r.fallback), sort: false },
      { key: 'hardStop', label: 'Hard stop', width: '8%', render: hardStopCell, sort: false }
    ];

    const expand = (r) => {
      const doc = docById(r.documentId);
      return '<div class="grid">' +
        '<div class="col-7">' +
        '<div class="eyebrow" style="margin-bottom:5px">Source excerpt · ' + esc(doc ? doc.name : r.documentId) + '</div>' +
        excerpt(r.sourceExcerpt) +
        '<div class="insight" style="margin-top:8px"><span class="ib"></span><span><b>Playbook position:</b> ' + esc(r.playbookPosition) + '</span></div>' +
        '<div class="insight warn"><span class="ib"></span><span><b>Deviation:</b> ' + esc(r.deviation) + '</span></div>' +
        '<div class="insight danger"><span class="ib"></span><span><b>Impact:</b> ' + esc(r.impact) + '</span></div>' +
        '</div>' +
        '<div class="col-5">' +
        '<div class="eyebrow" style="margin-bottom:5px">Negotiation notes</div>' +
        '<div class="tiny" style="margin-bottom:6px"><b>Supplier pushback:</b> ' + esc(r.supplierPushback) + '</div>' +
        '<div class="tiny" style="margin-bottom:6px"><b>Recommended response:</b> ' + esc(r.recommendedResponse) + '</div>' +
        '<div class="tiny" style="margin-bottom:8px"><b>Trade opportunity:</b> ' + esc(r.tradeOpportunity) + '</div>' +
        '<div>' + statusPill(r.internalDecision, r.internalDecision === 'pending' ? 'Decision pending' : r.internalDecision) +
        ' ' + evidenceChip(r.evidenceType, { sources: r.sourceIds }) + '</div>' +
        '</div></div>';
    };

    // rowClass injects a real data-facet attribute (per the chip-filter convention) by
    // deliberately reopening the attribute string dataTable() concatenates; this means the
    // built-in ".expandable" class/chevron never lands on the <tr> (it gets absorbed into the
    // data-facet value instead, harmlessly, since substring matching still finds each priority).
    // We render our own chevron + hover cursor below instead of relying on ".expandable".
    const table = dataTable(cols, rows, {
      id: 'negPositionsTable', zebra: true, sortable: true, expand,
      rowClass: (r) => 'pos-row" data-facet="' + esc(r.priority)
    });

    const chips = ['hard-stop', 'high', 'medium', 'low'].map((p) =>
      '<button class="chip-filter" data-filterchip="' + p + '" aria-pressed="false">' +
      esc(SEV_LABEL_LOCAL[p]) + '</button>').join('');

    // data-filter-scope must wrap BOTH the toolbar controls and the table itself —
    // applyFilter()/applyChipFilters() look for "table.dt" *inside* the scope element.
    const toolbar =
      '<div data-filter-scope>' +
      '<div class="toolbar">' +
      '<input type="search" placeholder="Filter by keyword, clause, category…" data-filter-input data-filter-for="negPositionsTable">' +
      chips +
      '<span class="spacer"></span><span class="filter-count">' + rows.length + ' of ' + rows.length + ' shown</span>' +
      '</div>' +
      '<input type="radio" id="wm-collab-pos" name="wm-pos" value="collab" class="sr-only" checked>' +
      '<input type="radio" id="wm-direct-pos" name="wm-pos" value="direct" class="sr-only">' +
      '<div class="word-toggle-row">' +
      '<span class="eyebrow">Wording</span>' +
      '<label for="wm-collab-pos" class="chip-filter word-lbl">Collaborative</label>' +
      '<label for="wm-direct-pos" class="chip-filter word-lbl">Direct</label>' +
      '</div>' +
      '<div class="word-scope">' + table + '</div>' +
      '</div>';

    const body =
      insight('Same ' + rows.length + ' issues that drive Contract → Terms &amp; Risk — positions, not a duplicate register. Expand a row for the source excerpt, playbook gap, and supplier pushback.') +
      toolbar;

    return saCard('Negotiation positions', body, { accent: 'plum', icon: 'target', id: 'negPositionsCard',
      sub: coverageBadge(d.deal.evidenceCoverage) });
  }
  const SEV_LABEL_LOCAL = { 'hard-stop': 'Hard stop', high: 'High', medium: 'Medium', low: 'Low' };

  /* ================================ TRADE PLAN ============================== */
  function buildTradePlan() {
    const objectives = d.negotiation.objectives.slice().sort((a, b) => a.priority - b.priority);
    const objHtml = objectives.map((o) =>
      '<div class="obj-row"><span class="obj-num">' + o.priority + '</span>' +
      '<div class="obj-body"><div>' + esc(o.text) + ' ' + evidenceChip(o.evidenceType, { short: true }) + '</div>' +
      '<div class="obj-issues">' + o.issueIds.map(issueTag).join(' ') + '</div></div></div>').join('');
    const objectivesCard = saCard('Objectives (priority order)', objHtml, { accent: 'plum', icon: 'flag' });

    const leverage = d.negotiation.leverage.slice().sort((a, b) => STRENGTH_RANK[a.strength] - STRENGTH_RANK[b.strength]);
    const levCols = [
      { key: 'text', label: 'Leverage', width: '46%', render: (r) => esc(r.text), sort: false },
      { key: 'strength', label: 'Strength', width: '16%', render: (r) => {
          const cls = r.strength === 'Strong' ? 'ok' : r.strength === 'Weak' ? 'muted' : 'warn';
          return '<span class="pill ' + cls + '">' + esc(r.strength) + '</span>';
        }, sortVal: (r) => STRENGTH_RANK[r.strength] },
      { key: 'basis', label: 'Basis', width: '38%', render: (r) =>
          '<span class="tiny">' + esc(r.basis) + '</span> ' + evidenceChip(r.evidenceType, { short: true }), sort: false }
    ];
    const leverageCard = saCard('Leverage — evidence-based', dataTable(levCols, leverage, { id: 'negLeverageTable', dense: true }),
      { accent: 'teal', icon: 'scale' });

    // give-get matrix: x = give cost (low->high), y = get value (low->high)
    const points = d.negotiation.giveGets.map((g) => {
      const linked = g.issueIds.map(issueById).filter(Boolean);
      const color = linked.some((i) => i.priority === 'hard-stop') ? 'danger'
        : linked.some((i) => i.priority === 'high') ? 'emph' : 'teal';
      return {
        x: MAG_LEVEL[g.giveCost], y: MAG_LEVEL[g.getValue], label: g.id,
        color, title: g.id + ': give ' + g.give + ' → get ' + g.get, jump: 'tab:contract/sub:terms'
      };
    });
    const matrix = matrixPlot(points, {
      xLabel: 'Give cost (low → high)', yLabel: 'Get value (low → high)', xMax: 6, yMax: 6,
      quadrants: ['Easy wins — do first', 'Key trades', 'Low priority', 'High cost, low return — avoid']
    });
    const ggCols = [
      { key: 'give', label: 'Give', width: '26%', render: (r) => esc(r.give), sort: false },
      { key: 'giveCost', label: 'Cost', width: '10%', render: (r) => magPill(r.giveCost), sortVal: (r) => MAG_LEVEL[r.giveCost] },
      { key: 'get', label: 'Get', width: '26%', render: (r) => esc(r.get), sort: false },
      { key: 'getValue', label: 'Value', width: '10%', render: (r) => magPill(r.getValue), sortVal: (r) => MAG_LEVEL[r.getValue] },
      { key: 'issues', label: 'Linked issues', width: '18%', render: (r) => r.issueIds.map(issueTag).join(' '), sort: false }
    ];
    const ggTable = dataTable(ggCols, d.negotiation.giveGets, { id: 'negGiveGetTable', dense: true, zebra: true });
    const ggMatrixCard = saCard('Give-get matrix', matrix, { accent: 'emph', icon: 'trade',
      sub: evidenceChip('inference', { short: true }) });
    const ggTableCard = saCard('Give / get detail', ggTable, { accent: 'plum', icon: 'handshake' });

    // concession ladders — one timeline per issue, laid out side by side
    const laddersInner = '<div class="grid">' + d.negotiation.concessionLadders.map((cl) => {
      const iss = issueById(cl.issueId);
      const items = cl.steps.map((s, i) => ({
        date: 'Step ' + (i + 1), name: s,
        tone: i === 0 ? 'pri' : (i === cl.steps.length - 1 ? 'emph' : '')
      }));
      return '<div class="col-4"><div class="ladder-hd">' + (iss ? issueTag(iss.id) : cl.issueId) +
        '<span style="margin-left:6px">' + esc(iss ? iss.title : cl.issueId) + '</span></div>' +
        timeline(items) + '</div>';
    }).join('') + '</div>';
    const laddersCard = saCard('Concession ladders', laddersInner, { accent: 'teal', icon: 'clock' });

    // packages — 2-3 bundled asks that trade together
    const pkgCards = d.negotiation.packages.map((p, i) => {
      const accent = i === 0 ? 'plum' : i === 1 ? 'teal' : 'emph';
      const inner =
        '<div class="tiny muted" style="margin-bottom:6px">Priority ' + p.priority + '</div>' +
        '<div style="margin-bottom:6px"><b>Give:</b> ' + esc(p.give) + '</div>' +
        '<div style="margin-bottom:8px"><b>Get:</b> ' + esc(p.get) + '</div>' +
        '<div style="margin-bottom:6px">' + p.issueIds.map(issueTag).join(' ') + '</div>' +
        evidenceChip(p.evidenceType, { short: true });
      return '<div class="col-4">' + saCard(p.name, inner, { accent, icon: 'target' }) + '</div>';
    }).join('');
    const packagesRow = '<div class="grid">' + pkgCards + '</div>';

    // sequence — the order packages are opened in a session
    const seqItems = d.negotiation.sequence.map((s) => {
      const p = pkgById(s.packageId);
      return { date: 'Step ' + s.step, name: s.text, meta: p ? esc(p.name) : s.packageId, tone: s.step === 1 ? 'pri' : '' };
    });
    const sequenceCard = saCard('Sequence', timeline(seqItems) +
      insight('Open with protection, move to commercials once terms are verbally agreed, close on service and exit.'),
      { accent: 'plum', icon: 'clock' });

    return '<div class="grid">' +
      '<div class="col-5">' + objectivesCard + '</div>' +
      '<div class="col-7">' + leverageCard + '</div>' +
      '<div class="col-7">' + ggMatrixCard + '</div>' +
      '<div class="col-5">' + ggTableCard + '</div>' +
      '<div class="col-12">' + laddersCard + '</div>' +
      '<div class="col-12">' + packagesRow + '</div>' +
      '<div class="col-12">' + sequenceCard + '</div>' +
      '</div>';
  }

  /* ================================ MEETING BRIEF ============================ */
  function buildMeetingBrief() {
    const mb = d.negotiation.meetingBrief;

    const fullBriefText = [
      'MEETING BRIEF — ' + d.deal.title,
      '',
      'Objective: ' + mb.objective,
      '',
      'Agenda:',
      ...mb.agenda.map((a) => '  ' + a.block + ' — ' + a.item),
      '',
      'Opening statement:',
      mb.opening,
      '',
      'Asks:',
      ...mb.asks.map((a) => '  - ' + a.text + ' (' + a.issueId + ')'),
      '',
      'Questions:',
      ...mb.questions.map((q) => '  - ' + q.text),
      '',
      'Expected pushback:',
      ...mb.expectedPushback.map((p) => '  Q: ' + p.pushback + '\n  A: ' + p.response),
      '',
      'Closing:',
      mb.closing
    ].join('\n');

    const agendaCard = saCard('Objective &amp; agenda',
      '<div style="margin-bottom:10px">' + esc(mb.objective) + ' ' + evidenceChip(mb.objectiveEvidence, { short: true }) + '</div>' +
      timeline(mb.agenda.map((a) => ({ date: a.block, name: a.item, tone: '' }))),
      { accent: 'plum', icon: 'meeting', sub: copyBtn('Copy full brief', null, fullBriefText) });

    const openingCard = saCard('Opening statement',
      '<div class="excerpt" style="border-left-color:var(--pri)">' + esc(mb.opening) + '</div>' +
      '<div class="btn-row">' + copyBtn('Copy opening', null, mb.opening) + '</div>',
      { accent: 'plum', icon: 'handshake' });

    const closingCard = saCard('Closing recap',
      '<div class="excerpt" style="border-left-color:var(--emph)">' + esc(mb.closing) + '</div>' +
      '<div class="btn-row">' + copyBtn('Copy closing', null, mb.closing) + '</div>',
      { accent: 'emph', icon: 'meeting' });

    const asksText = mb.asks.map((a) => '- ' + a.text).join('\n');
    const asksCard = saCard('Exact asks',
      '<ul class="plain-list">' + mb.asks.map((a) =>
        '<li>' + esc(a.text) + ' ' + issueTag(a.issueId) + ' ' + evidenceChip(a.evidenceType, { short: true }) + '</li>').join('') + '</ul>' +
      '<div class="btn-row">' + copyBtn('Copy asks', null, asksText) + '</div>',
      { accent: 'teal', icon: 'flag' });

    const questionsText = mb.questions.map((q) => '- ' + q.text).join('\n');
    const questionsCard = saCard('Questions to ask',
      '<ul class="plain-list">' + mb.questions.map((q) =>
        '<li>' + esc(q.text) + ' ' + issueTag(q.issueId) + ' ' + evidenceChip(q.evidenceType, { short: true }) + '</li>').join('') + '</ul>' +
      '<div class="btn-row">' + copyBtn('Copy questions', null, questionsText) + '</div>',
      { accent: 'teal', icon: 'info' });

    const pbCols = [
      { key: 'pushback', label: 'Expected pushback', width: '38%', render: (r) => '<span class="tiny">' + esc(r.pushback) + '</span>', sort: false },
      { key: 'response', label: 'Recommended response', width: '38%', render: (r) => esc(r.response), sort: false },
      { key: 'issue', label: 'Issue', width: '24%', render: (r) => issueTag(r.issueId) + ' ' + evidenceChip(r.evidenceType, { short: true }), sort: false }
    ];
    const pbText = mb.expectedPushback.map((p) => 'Q: ' + p.pushback + '\nA: ' + p.response).join('\n\n');
    const pushbackCard = saCard('Expected pushback',
      dataTable(pbCols, mb.expectedPushback, { id: 'negPushbackTable', zebra: true, dense: true }) +
      '<div class="btn-row">' + copyBtn('Copy pushback table', null, pbText) + '</div>',
      { accent: 'plum', icon: 'scale' });

    return '<div class="grid">' +
      '<div class="col-12">' + agendaCard + '</div>' +
      '<div class="col-6">' + openingCard + '</div>' +
      '<div class="col-6">' + closingCard + '</div>' +
      '<div class="col-6">' + asksCard + '</div>' +
      '<div class="col-6">' + questionsCard + '</div>' +
      '<div class="col-12">' + pushbackCard + '</div>' +
      '</div>';
  }

  /* ================================ SHELL ==================================== */
  const scopedStyle = '<style>' +
    '.neg-tab .obj-row{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)}' +
    '.neg-tab .obj-row:first-child{border-top:0}' +
    '.neg-tab .obj-num{flex:none;width:24px;height:24px;border-radius:50%;background:var(--pri);color:var(--pri-fg);' +
    'font:800 var(--fz-sm)/24px var(--sans);text-align:center}' +
    '.neg-tab .obj-body{font-size:var(--fz-sm)}' +
    '.neg-tab .obj-issues{margin-top:5px;display:flex;gap:5px;flex-wrap:wrap}' +
    '.neg-tab .neg-tag{cursor:pointer;font-family:var(--mono)}' +
    '.neg-tab .ladder-hd{font-weight:700;font-size:var(--fz-sm);margin-bottom:8px;display:flex;align-items:center}' +
    '.neg-tab .hs-line{display:flex;gap:5px;align-items:flex-start;color:var(--danger-fg);font-weight:600;font-size:var(--fz-sm)}' +
    '.neg-tab .hs-line svg{width:13px;height:13px;flex:none;margin-top:2px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.neg-tab .clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '.neg-tab .word-direct{display:none}' +
    '.neg-tab .word-toggle-row{display:flex;align-items:center;gap:6px;margin:10px 0}' +
    '.neg-tab #wm-collab-pos:checked + label,.neg-tab #wm-direct-pos:checked + label{background:var(--pri);color:var(--pri-fg);border-color:var(--pri)}' +
    '.neg-tab #wm-direct-pos:checked ~ .word-scope .word-collab{display:none}' +
    '.neg-tab #wm-direct-pos:checked ~ .word-scope .word-direct{display:-webkit-box}' +
    '.neg-tab .plain-list{margin:0;padding-left:18px;font-size:var(--fz-sm);line-height:1.6}' +
    '.neg-tab .plain-list li{margin-bottom:6px}' +
    '.neg-tab .subtab-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px}' +
    '.neg-tab #negPositionsTable tbody tr:not(.expander-row){cursor:pointer}' +
    '.neg-tab .row-chevron{display:inline-flex;margin-right:5px;color:var(--mut);transition:transform .15s;vertical-align:-3px}' +
    '.neg-tab .row-chevron svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.neg-tab tr.is-open .row-chevron{transform:rotate(90deg)}' +
    '</style>';

  return scopedStyle + '<div class="neg-tab">' +
    '<div class="wrap"><div class="tab-intro"><h2>Negotiation</h2>' +
    '<p class="q">Positions to open with, the trades available, and a copy-ready meeting brief — keyed to the same evidence-based issue register used in Contract. ' +
    coverageBadge(d.deal.evidenceCoverage) + '</p></div></div>' +
    '<div class="subtabbar" data-subtab-group="negotiation"><div class="wrap">' +
    '<button class="subtab-btn" data-subtab="positions" aria-selected="true">' + icon('target') + ' Positions</button>' +
    '<button class="subtab-btn" data-subtab="tradeplan">' + icon('trade') + ' Trade Plan</button>' +
    '<button class="subtab-btn" data-subtab="meeting">' + icon('meeting') + ' Meeting Brief</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
    '<div data-subpanel="negotiation/positions" class="is-active">' + buildPositions() + '</div>' +
    '<div data-subpanel="negotiation/tradeplan">' + buildTradePlan() + '</div>' +
    '<div data-subpanel="negotiation/meeting">' + buildMeetingBrief() + '</div>' +
    '</div></div>' +
    '</div>';
}

if (typeof global !== 'undefined') {
  global.renderTab_negotiation = renderTab_negotiation;
  global.DealTabs = global.DealTabs || {};
  global.DealTabs.negotiation = renderTab_negotiation;
}

})(typeof window !== 'undefined' ? window : this);
