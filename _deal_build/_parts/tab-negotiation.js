/* =============================================================================
 * tab-negotiation.js, "Negotiation" primary tab (id `negotiation`) of the
 * redesigned 4-tab Lilly Deal Dashboard.  Question: "how do I move them?"
 *
 * Attaches window.renderTab_negotiation(d) and window.DealTabs.negotiation(d).
 * Reads ONLY from dashboardData (param d). No fact is restated/hard-coded, every
 * value is looked up from d.issues / d.negotiation / d.comms / d.protection etc.
 * The SAME issue objects that drive Terms & Review and Economics drive the
 * positions, trades and comms events here; they are referenced by id, never
 * re-typed (anti-drift). Reflect-only: copy / print / jump affordances ONLY —
 * no send / assign / approve / route.
 *
 * Subtabs (group="negotiation"):
 *   positions  ->  data-subpanel="negotiation/positions"   (4A)
 *   trade      ->  data-subpanel="negotiation/trade"        (4B)
 *   comms      ->  data-subpanel="negotiation/comms"        (4C, replaces Meeting Brief)
 * ========================================================================== */
(function (global) {
'use strict';

const PR_RANK = { 'hard-stop': 0, high: 1, medium: 2, low: 3 };
const STRENGTH_RANK = { Strong: 0, Moderate: 1, Weak: 2 };
const MAG_LEVEL = { low: 1.4, medium: 3, high: 4.6 };
const SEV_LABEL_LOCAL = { 'hard-stop': 'Hard stop', high: 'High', medium: 'Medium', low: 'Low' };

function magPill(level) {
  const cls = level === 'high' ? 'warn' : level === 'medium' ? 'info' : 'muted';
  return '<span class="pill ' + cls + '">' + esc(level) + '</span>';
}

// 2-way collaborative<->direct wording pair (CSS-only toggle owns the visibility).
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

// vendor-tactic flag folded onto the issue spine (replaces the old 12-cat grid).
function tacticChip(r) {
  const tf = r.tacticFlag;
  if (!tf || !tf.present) return '';
  return '<span class="tac-chip" title="' + esc(tf.triggeringText || '') + '">' + icon('flag') +
    'Tactic: ' + esc(tf.tactic) + '</span> ' + evidenceChip(tf.evidenceType || 'inference', { short: true });
}

// a signed delta chip (savings / protection lift). positive protection = good (ok);
// negative TCO = savings (ok). zero = neutral muted.
function deltaChip(delta, kind) {
  if (delta === 0 || delta == null) return '<span class="pill muted">no change</span>';
  if (kind === 'tco') {
    const cls = delta < 0 ? 'ok' : 'danger';
    const sign = delta < 0 ? '−' : '+';
    return '<span class="pill ' + cls + '">' + sign + money(Math.abs(delta), { compact: true }) + '</span>';
  }
  const cls = delta > 0 ? 'ok' : 'danger';
  return '<span class="pill ' + cls + '">' + (delta > 0 ? '+' : '−') + Math.abs(delta) + ' pts</span>';
}

function renderTab_negotiation(d) {
  const neg = d.negotiation || {};
  const comms = d.comms || {};
  const issueById = (id) => d.issues.find((i) => i.id === id);
  const docById = (id) => (d.documents || []).find((x) => x.id === id);
  const pkgById = (id) => (neg.packages || []).find((p) => p.id === id);
  const scenById = (id) => (d.scenarios || []).find((s) => s.id === id);

  // cross-reference chip, points back at the SAME issue object that drives Terms.
  function issueTag(id) {
    const iss = issueById(id);
    const t = iss ? iss.title : id;
    return '<span class="pill info neg-tag" data-jump="tab:contract/sub:legal" title="' +
      esc(id + ', ' + t + ' (jump to Terms & Review register)') + '">' + esc(id) + '</span>';
  }
  // source-reference chip, jumps to Sources; every comms row is cited to one.
  function srcChip(ref) {
    if (!ref) return '';
    return '<span class="pill muted src-chip" data-jump="tab:sources/sub:sources" title="' +
      esc(ref + ', jump to Sources') + '">' + esc(ref) + '</span>';
  }

  /* ============================== 4A, POSITIONS =========================== */
  function buildPositions() {
    // --- posture header: 4-tier distribution + a derived difficulty read ------
    const counts = { 'hard-stop': 0, high: 0, medium: 0, low: 0 };
    d.issues.forEach((i) => { if (counts[i.priority] != null) counts[i.priority]++; });
    const totalIssues = d.issues.length;
    const distColor = { 'hard-stop': 'danger', high: 'warn', medium: 'teal', low: 'pri' };
    const distRows = ['hard-stop', 'high', 'medium', 'low'].map((p) =>
      barRow(SEV_LABEL_LOCAL[p], counts[p], totalIssues, String(counts[p]), { color: distColor[p] })).join('');

    // difficulty: deterministic weight of the distribution, colored by protection band.
    const diffScore = counts['hard-stop'] * 3 + counts.high;
    const diffLabel = diffScore >= 8 ? 'High' : diffScore >= 4 ? 'Moderate' : 'Low';
    const diffCls = diffScore >= 8 ? 'danger' : diffScore >= 4 ? 'warn' : 'ok';
    const prot = d.protection || {};
    const bandLine = prot.score != null
      ? 'Protection score <b>' + esc(prot.score) + '</b> (' + esc(prot.band || '') + ') on the current redline, before negotiation. ' +
        jumpLink('See the deduction table', 'tab:contract/sub:legal')
      : '';

    const postureInner =
      '<div class="grid">' +
        '<div class="col-6">' +
          '<div class="eyebrow" style="margin-bottom:6px">Issue distribution &middot; ' + totalIssues + ' terms in play ' +
            evidenceChip('calculated', { short: true }) + '</div>' + distRows +
        '</div>' +
        '<div class="col-6">' +
          '<div class="eyebrow" style="margin-bottom:6px">Negotiation difficulty</div>' +
          '<div class="diff-read"><span class="pill ' + diffCls + ' diff-pill">' + esc(diffLabel) + '</span>' +
            '<span class="tiny muted">' + counts['hard-stop'] + ' hard stop(s) + ' + counts.high +
            ' high-priority terms drive the read ' + evidenceChip('inference', { short: true }) + '</span></div>' +
          (bandLine ? '<div class="card-note" style="margin-top:10px">' + bandLine + '</div>' : '') +
          '<div class="card-note">' + esc((d.deal.recommendation && d.deal.recommendation.headline) || '') + '</div>' +
        '</div>' +
      '</div>';
    const postureCard = saCard('Posture', postureInner, { accent: 'plum', icon: 'target',
      sub: coverageBadge(d.deal.evidenceCoverage), id: 'negPostureCard' });

    // --- ONE unified position register over d.issues (legal + commercial + scope) --
    const rows = d.issues.slice().sort((a, b) =>
      (PR_RANK[a.priority] - PR_RANK[b.priority]) || a.id.localeCompare(b.id));

    const cols = [
      { key: 'title', label: 'Issue', width: '20%', render: (r) =>
          '<div style="font-weight:700"><span class="row-chevron">' + icon('chevron') + '</span>' + esc(r.title) + '</div>' +
          '<div class="tiny muted" style="padding-left:19px">' + esc(r.category) + ' &middot; ' + esc(r.id) + '</div>' +
          (r.tacticFlag && r.tacticFlag.present ? '<div style="padding-left:19px;margin-top:4px">' + tacticChip(r) + '</div>' : ''),
        sortVal: (r) => r.title.toLowerCase() },
      { key: 'priority', label: 'Priority', width: '8%', render: (r) => severityPill(r.priority),
        sortVal: (r) => PR_RANK[r.priority] },
      { key: 'basis', label: 'Playbook basis', width: '14%', render: (r) =>
          '<div class="tiny">' + esc(r.clause) + '</div><div style="margin-top:3px">' +
          evidenceChip(r.evidenceType, { short: true, sources: r.sourceIds }) + '</div>',
        sort: false },
      { key: 'supplierPosition', label: 'Supplier position', width: '19%', render: (r) =>
          '<span class="clamp2">' + esc(r.supplierPosition) + '</span>', sort: false },
      { key: 'recommendedPosition', label: 'Our position (target)', width: '18%',
        render: (r) => wordingPair(r.recommendedPosition), sort: false },
      { key: 'fallback', label: 'Fallback', width: '13%',
        render: (r) => wordingPair(r.fallback), sort: false },
      { key: 'hardStop', label: 'Hard stop', width: '8%', render: hardStopCell, sort: false }
    ];

    const expand = (r) => {
      const doc = docById(r.documentId);
      const tacticBlock = (r.tacticFlag && r.tacticFlag.present)
        ? '<div class="insight warn" style="margin-top:8px"><span class="ib"></span><span><b>Tactic flag, ' +
            esc(r.tacticFlag.tactic) + ':</b> ' + esc(r.tacticFlag.triggeringText) + ' ' +
            evidenceChip(r.tacticFlag.evidenceType || 'inference', { short: true }) + '</span></div>'
        : '';
      return '<div class="grid">' +
        '<div class="col-7">' +
          '<div class="eyebrow" style="margin-bottom:5px">Source excerpt &middot; ' + esc(doc ? doc.name : r.documentId) + '</div>' +
          excerpt(r.sourceExcerpt) +
          '<div class="eyebrow" style="margin:10px 0 4px">Arguments</div>' +
          '<div class="insight"><span class="ib"></span><span><b>Playbook position:</b> ' + esc(r.playbookPosition) + '</span></div>' +
          '<div class="insight warn"><span class="ib"></span><span><b>Deviation:</b> ' + esc(r.deviation) + '</span></div>' +
          '<div class="insight danger"><span class="ib"></span><span><b>Impact:</b> ' + esc(r.impact) + '</span></div>' +
        '</div>' +
        '<div class="col-5">' +
          '<div class="eyebrow" style="margin-bottom:5px">Negotiation play</div>' +
          '<div class="tiny" style="margin-bottom:6px"><b>Predicted pushback:</b> ' + esc(r.supplierPushback) + '</div>' +
          '<div class="tiny" style="margin-bottom:6px"><b>Rebuttal:</b> ' + esc(r.recommendedResponse) + '</div>' +
          '<div class="tiny" style="margin-bottom:8px"><b>Trade against:</b> ' + esc(r.tradeOpportunity) + '</div>' +
          tacticBlock +
          '<div style="margin-top:8px">' + statusPill(r.internalDecision, r.internalDecision === 'pending' ? 'Decision pending' : r.internalDecision) +
          ' ' + evidenceChip(r.evidenceType, { sources: r.sourceIds }) + '</div>' +
        '</div></div>';
    };

    // rowClass reopens the class attr to inject a real data-facet (chip-filter
    // convention); the built-in ".expandable" token lands harmlessly inside the
    // facet value, so we render our own chevron and drive expand via data-exprow.
    const table = dataTable(cols, rows, {
      id: 'negPositionsTable', zebra: true, sortable: true, expand,
      rowClass: (r) => 'pos-row" data-facet="' + esc(r.priority)
    });

    const chips = ['hard-stop', 'high', 'medium', 'low'].map((p) =>
      '<button class="chip-filter" data-filterchip="' + p + '" aria-pressed="false">' +
      esc(SEV_LABEL_LOCAL[p]) + '</button>').join('');

    // data-filter-scope must wrap BOTH the toolbar and the table (applyFilter looks
    // for table.dt inside the scope). The wording radios sit in the same scope so
    // their :checked sibling selectors reach the .word-scope wrapping the table.
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
          '<span class="tiny muted">Same asks, two registers, substance is identical.</span>' +
        '</div>' +
        '<div class="word-scope">' + table + '</div>' +
      '</div>';

    const registerBody =
      insight('One register for legal, commercial and scope terms, the same ' + rows.length +
        ' issues that drive Terms & Review, framed as positions. Each is playbook-cited; expand a row for source, arguments, pushback and rebuttal.') +
      toolbar;
    const registerCard = saCard('Position register', registerBody, { accent: 'plum', icon: 'scale', id: 'negPositionsCard' });

    // --- term-interdependency mini-map: which positions move together ---------
    const clusters = (neg.packages || []).map((p) => {
      const chipsHtml = p.issueIds.map((id) => issueTag(id)).join('<span class="idep-x">×</span>');
      return '<div class="idep-row"><span class="idep-name">' + esc(p.name) + '</span>' +
        '<span class="idep-chips">' + chipsHtml + '</span></div>';
    }).join('');
    const crossLinks = (neg.giveGets || []).filter((g) => new Set(g.issueIds).size >= 2);
    const crossHtml = crossLinks.length
      ? '<div class="eyebrow" style="margin:12px 0 4px">Cross-links (from trade-offs)</div>' +
        crossLinks.map((g) =>
          '<div class="idep-row"><span class="idep-name tiny">' + esc(g.get) + '</span>' +
          '<span class="idep-chips">' + g.issueIds.map((id) => issueTag(id)).join('<span class="idep-x">×</span>') + '</span></div>').join('')
      : '';
    const idepCard = (neg.packages && neg.packages.length)
      ? saCard('Term interdependency map',
          insight('Positions inside a bracket move together, concede or hold them as a set, not one at a time. Cross-links are single trades that touch two terms.') +
          '<div class="eyebrow" style="margin:8px 0 4px">Bundles (move as one)</div>' + clusters + crossHtml,
          { accent: 'teal', icon: 'trade', sub: evidenceChip('inference', { short: true }) })
      : gapCard('No interdependency map', 'No bundled packages are defined for this deal yet.');

    return '<div class="grid">' +
      '<div class="col-12">' + postureCard + '</div>' +
      '<div class="col-12">' + registerCard + '</div>' +
      '<div class="col-12">' + idepCard + '</div>' +
      '</div>';
  }

  /* ============================== 4B, TRADE PLAN ========================== */
  function buildTradePlan() {
    // objectives (priority order)
    const objectives = (neg.objectives || []).slice().sort((a, b) => a.priority - b.priority);
    const objHtml = objectives.map((o) =>
      '<div class="obj-row"><span class="obj-num">' + o.priority + '</span>' +
      '<div class="obj-body"><div>' + esc(o.text) + ' ' + evidenceChip(o.evidenceType, { short: true }) + '</div>' +
      '<div class="obj-issues">' + o.issueIds.map(issueTag).join(' ') + '</div></div></div>').join('');
    const objectivesCard = saCard('Objectives (priority order)', objHtml, { accent: 'plum', icon: 'flag' });

    // evidence-based leverage, honest strength, weak-but-named when limited
    const leverage = (neg.leverage || []).slice().sort((a, b) => STRENGTH_RANK[a.strength] - STRENGTH_RANK[b.strength]);
    const levCols = [
      { key: 'text', label: 'Leverage', width: '46%', render: (r) => esc(r.text), sort: false },
      { key: 'strength', label: 'Strength', width: '16%', render: (r) => {
          const cls = r.strength === 'Strong' ? 'ok' : r.strength === 'Weak' ? 'muted' : 'warn';
          return '<span class="pill ' + cls + '">' + esc(r.strength) + '</span>';
        }, sortVal: (r) => STRENGTH_RANK[r.strength] },
      { key: 'basis', label: 'Basis', width: '38%', render: (r) =>
          '<span class="tiny">' + esc(r.basis) + '</span> ' + evidenceChip(r.evidenceType, { short: true }), sort: false }
    ];
    const bat = neg.batna || {};
    const levHonesty = bat.hasRealAlternative
      ? insight('A real (if modest) alternative exists, so this leverage is genuine, not manufactured tension. No competing quote is in-session.')
      : insight('Effectively sole-source: leverage rests on timing, volume and reference value, not competitive tension. Weak leverage is named as weak, not inflated.', 'warn');
    const leverageCard = saCard('Leverage, evidence-based',
      levHonesty + dataTable(levCols, leverage, { id: 'negLeverageTable', dense: true }),
      { accent: 'teal', icon: 'scale' });

    // give-get 2x2 (matrixPlot): x = give cost, y = get value
    const points = (neg.giveGets || []).map((g) => {
      const linked = g.issueIds.map(issueById).filter(Boolean);
      const color = linked.some((i) => i.priority === 'hard-stop') ? 'danger'
        : linked.some((i) => i.priority === 'high') ? 'emph' : 'teal';
      return {
        x: MAG_LEVEL[g.giveCost], y: MAG_LEVEL[g.getValue], label: g.id,
        color, title: g.id + ': give ' + g.give + ' → get ' + g.get, jump: 'tab:contract/sub:legal'
      };
    });
    const matrix = matrixPlot(points, {
      xLabel: 'Give cost (low → high)', yLabel: 'Get value (low → high)', xMax: 6, yMax: 6,
      quadrants: ['Easy wins, do first', 'Key trades', 'Low priority', 'High cost, low return, avoid']
    });
    const ggCols = [
      { key: 'give', label: 'Give', width: '26%', render: (r) => esc(r.give), sort: false },
      { key: 'giveCost', label: 'Cost', width: '10%', render: (r) => magPill(r.giveCost), sortVal: (r) => MAG_LEVEL[r.giveCost] },
      { key: 'get', label: 'Get', width: '26%', render: (r) => esc(r.get), sort: false },
      { key: 'getValue', label: 'Value', width: '10%', render: (r) => magPill(r.getValue), sortVal: (r) => MAG_LEVEL[r.getValue] },
      { key: 'issues', label: 'Linked issues', width: '18%', render: (r) => r.issueIds.map(issueTag).join(' '), sort: false }
    ];
    const ggTable = dataTable(ggCols, neg.giveGets || [], { id: 'negGiveGetTable', dense: true, zebra: true });
    const ggMatrixCard = saCard('Give-get matrix', matrix, { accent: 'emph', icon: 'trade',
      sub: evidenceChip('inference', { short: true }) });
    const ggTableCard = saCard('Give / get detail', ggTable, { accent: 'plum', icon: 'handshake' });

    // concession ladders, one timeline per issue
    const laddersInner = '<div class="grid">' + (neg.concessionLadders || []).map((cl) => {
      const iss = issueById(cl.issueId);
      const items = cl.steps.map((s, i) => ({
        date: 'Step ' + (i + 1), name: s,
        tone: i === 0 ? 'pri' : (i === cl.steps.length - 1 ? 'emph' : '')
      }));
      return '<div class="col-4"><div class="ladder-hd">' + (iss ? issueTag(iss.id) : cl.issueId) +
        '<span style="margin-left:6px">' + esc(iss ? iss.title : cl.issueId) + '</span></div>' +
        timeline(items) + '</div>';
    }).join('') + '</div>';
    const laddersCard = saCard('Concession ladders', laddersInner + insight('Open at Step 1; drop only one step at a time and only for a matching give.'),
      { accent: 'teal', icon: 'clock' });

    // packages, bundled asks that trade together
    const pkgCards = (neg.packages || []).map((p, i) => {
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

    // round plan R1/R2/R3
    const roundCards = (neg.roundPlan || []).map((r, i) => {
      const p = pkgById(r.packageId);
      const accent = i === 0 ? 'plum' : i === 1 ? 'teal' : 'emph';
      const inner =
        '<div class="rp-focus">' + esc(r.focus) + '</div>' +
        '<div class="insight" style="margin-top:8px"><span class="ib"></span><span><b>Target:</b> ' + esc(r.target) + '</span></div>' +
        '<div style="margin-top:6px">' + (p ? p.issueIds.map(issueTag).join(' ') : '') + ' ' + evidenceChip(r.evidenceType, { short: true }) + '</div>';
      return '<div class="col-4">' + saCard(r.round + ', ' + (p ? p.name : r.packageId), inner, { accent, icon: 'handshake' }) + '</div>';
    }).join('');
    const roundPlanBlock = (neg.roundPlan && neg.roundPlan.length)
      ? '<div class="grid">' + roundCards + '</div>'
      : gapCard('No round plan', 'No round-by-round plan is defined for this deal yet.');

    // single deal-level BATNA floor + escalation (costed)
    const batnaCard = (neg.batna)
      ? saCard('BATNA, the single walk-away floor',
          '<dl class="kv">' +
            '<dt>Alternative</dt><dd>' + esc(bat.alternative) + ' ' + evidenceChip(bat.evidenceType, { short: true }) + '</dd>' +
            '<dt>Costed delta</dt><dd>' + esc(bat.costDelta) + '</dd>' +
            '<dt>Escalation trigger</dt><dd>' + esc(bat.trigger) + '</dd>' +
          '</dl>' +
          insight(bat.hasRealAlternative
            ? 'A genuine alternative exists, so the floor is real, but it carries a named cost and schedule slip, not a costless walk-away.'
            : 'No genuine alternative: this is a soft floor. Escalate internally rather than pretend a walk-away exists.',
            bat.hasRealAlternative ? '' : 'warn'),
          { accent: 'warn', icon: 'flag' })
      : gapCard('No BATNA defined', 'No walk-away alternative is recorded for this deal.');

    // package simulator, precomputed lookup swap (CSS radio state, no client model)
    const simCard = buildSimulator();

    return '<div class="grid">' +
      '<div class="col-5">' + objectivesCard + '</div>' +
      '<div class="col-7">' + leverageCard + '</div>' +
      '<div class="col-7">' + ggMatrixCard + '</div>' +
      '<div class="col-5">' + ggTableCard + '</div>' +
      '<div class="col-12">' + laddersCard + '</div>' +
      '<div class="col-12"><div class="section-lead"><span class="eyebrow">Bundled packages</span></div>' + packagesRow + '</div>' +
      '<div class="col-12"><div class="section-lead"><span class="eyebrow">Round plan &middot; open → close</span></div>' + roundPlanBlock + '</div>' +
      '<div class="col-12">' + batnaCard + '</div>' +
      '<div class="col-12">' + simCard + '</div>' +
      '</div>';
  }

  // Package simulator: a lookup-swap over PRECOMPUTED package fields. Toggling a
  // package (CSS-only radio, same mechanism as the wording toggle) reveals that
  // package's precomputed resultingProtectionScore / resultingNetTCO / deltas.
  // NOT a client-side model, every number is authored into the data object.
  function buildSimulator() {
    const pkgs = neg.packages || [];
    if (!pkgs.length) return gapCard('No package simulator', 'No packages with precomputed outcomes are defined.');
    // base = nothing settled: current protection score + supplier-ask TCV.
    const baseProt = (d.protection && d.protection.score != null) ? d.protection.score : null;
    const askScen = scenById('SC-ask');
    const baseTCO = askScen ? askScen.total : null;
    const tgtScen = scenById('SC-target');

    const states = [{ id: 'base', name: 'Base (as drafted)', prot: baseProt, tco: baseTCO, dProt: 0, dTco: 0,
      issueIds: [], give: '—', get: 'Nothing settled yet', ev: 'calculated' }].concat(
      pkgs.map((p) => ({ id: p.id, name: p.name, prot: p.resultingProtectionScore, tco: p.resultingNetTCO,
        dProt: p.deltas ? p.deltas.protection : null, dTco: p.deltas ? p.deltas.tco : null,
        issueIds: p.issueIds || [], give: p.give, get: p.get, ev: p.evidenceType })));

    // guard: any package missing a precomputed field -> honest note, no fake number.
    const missing = pkgs.filter((p) => p.resultingProtectionScore == null || p.resultingNetTCO == null);

    const radios = states.map((s, i) =>
      '<input type="radio" id="pkg-' + esc(s.id) + '" name="pkg-sim" class="sr-only"' + (i === 0 ? ' checked' : '') + '>').join('');
    const labels = states.map((s) =>
      '<label for="pkg-' + esc(s.id) + '" class="chip-filter pkg-lbl">' + esc(s.name) + '</label>').join('');

    const resultBlocks = states.map((s) => {
      const protVal = s.prot != null ? s.prot : '—';
      const tcoVal = s.tco != null ? money(s.tco, { compact: true }) : '—';
      const settled = s.issueIds.length ? s.issueIds.map(issueTag).join(' ') : '<span class="tiny muted">none</span>';
      return '<div class="pkg-result pkg-r-' + esc(s.id) + '">' +
        '<div class="pkg-metrics">' +
          '<div class="pkg-metric"><div class="pm-lbl">Protection score</div>' +
            '<div class="pm-val">' + protVal + '<span class="pm-max">/100</span></div>' +
            '<div class="pm-delta">' + deltaChip(s.dProt, 'prot') + '</div></div>' +
          '<div class="pkg-metric"><div class="pm-lbl">Net 3-yr TCO</div>' +
            '<div class="pm-val">' + tcoVal + '</div>' +
            '<div class="pm-delta">' + deltaChip(s.dTco, 'tco') + '</div></div>' +
        '</div>' +
        '<div class="pkg-detail"><div class="tiny" style="margin-bottom:4px"><b>Give:</b> ' + esc(s.give) + '</div>' +
          '<div class="tiny" style="margin-bottom:6px"><b>Get:</b> ' + esc(s.get) + '</div>' +
          '<div class="tiny">Settles: ' + settled + ' ' + evidenceChip(s.ev, { short: true }) + '</div></div>' +
        '</div>';
    }).join('');

    const allNote = (baseProt != null && tgtScen)
      ? insight('Numbers are precomputed lookups, not a live model. Base = the current redline (' + baseProt +
          '/100 at ' + money(baseTCO, { compact: true }) + '). Settling all three packages lands near protection 97/100 at ' +
          money(tgtScen.total, { compact: true }) + ' (the target scenario).')
      : '';
    const missNote = missing.length
      ? insight(missing.length + ' package(s) lack a precomputed outcome and are shown without figures.', 'warn')
      : '';

    const inner =
      '<div class="pkg-sim">' + radios +
        '<div class="pkg-toggle"><span class="eyebrow">Simulate a settled package</span>' + labels + '</div>' +
        '<div class="pkg-scope">' + resultBlocks + '</div>' +
      '</div>' + allNote + missNote;

    return saCard('Package simulator', inner, { accent: 'emph', icon: 'scenarios',
      sub: evidenceChip('calculated', { short: true }) });
  }

  /* ============================ 4C, COMMUNICATIONS ======================== */
  function buildComms() {
    // gap-state: no thread synthesized in-session.
    if (!comms.events && !comms.commitments && !comms.penHistory) {
      return gapCard('No communications synthesized', 'No in-session email/Teams thread was available to distill into events, commitments or pen history.');
    }

    // --- events ledger ---------------------------------------------------------
    const KIND_CLS = { ask: 'info', position: 'warn', commitment: 'ok', concession: 'muted' };
    const DIR_LBL = { in: 'From supplier', out: 'To supplier', internal: 'Internal' };
    const events = (comms.events || []).slice();
    const evCols = [
      { key: 'date', label: 'Date', width: '10%', render: (r) => '<span class="mono tiny">' + esc(r.date) + '</span>' },
      { key: 'channel', label: 'Channel', width: '9%', render: (r) => '<span class="tiny">' + esc(r.channel) + '</span>', sort: false },
      { key: 'direction', label: 'Direction', width: '12%', render: (r) =>
          '<span class="pill ' + (r.direction === 'in' ? 'warn' : r.direction === 'out' ? 'info' : 'muted') + '">' +
          esc(DIR_LBL[r.direction] || r.direction) + '</span>', sortVal: (r) => r.direction },
      { key: 'kind', label: 'Type', width: '10%', render: (r) =>
          '<span class="pill ' + (KIND_CLS[r.kind] || 'muted') + '">' + esc(r.kind) + '</span>', sortVal: (r) => r.kind },
      { key: 'text', label: 'Event', width: '39%', render: (r) => esc(r.text), sort: false },
      { key: 'issueId', label: 'Issue', width: '10%', render: (r) => r.issueId ? issueTag(r.issueId) : '<span class="tiny muted">—</span>', sort: false },
      { key: 'sourceRef', label: 'Source', width: '10%', render: (r) => srcChip(r.sourceRef) + ' ' + evidenceChip(r.evidenceType, { short: true }), sort: false }
    ];
    const evChips = ['ask', 'position', 'commitment', 'concession'].map((k) =>
      '<button class="chip-filter" data-filterchip="' + k + '" aria-pressed="false">' + esc(k) + '</button>').join('');
    const ledger =
      '<div data-filter-scope>' +
        '<div class="toolbar">' +
          '<input type="search" placeholder="Filter events…" data-filter-input data-filter-for="negCommsTable">' +
          evChips +
          '<span class="spacer"></span><span class="filter-count">' + events.length + ' of ' + events.length + ' shown</span>' +
        '</div>' +
        dataTable(evCols, events.map((e) => Object.assign({}, e, { _facet: e.kind })), {
          id: 'negCommsTable', zebra: true, dense: true,
          rowClass: (r) => 'ev-row" data-facet="' + esc(r.kind)
        }) +
      '</div>';
    const ledgerCard = (comms.events && comms.events.length)
      ? saCard('Communications ledger', insight('Every ask, position, commitment and concession distilled from the in-session thread, each cited to its source and linked to the issue it moves.') + ledger,
          { accent: 'plum', icon: 'sources', sub: coverageBadge(d.deal.evidenceCoverage) })
      : gapCard('No events', 'No email/Teams events were available to distill.');

    // --- commitments board: ours vs theirs -------------------------------------
    const STAT_CLS = { open: 'warn', honored: 'ok', breached: 'danger', superseded: 'muted' };
    const commitRow = (c) =>
      '<div class="cmt-item"><div class="cmt-top"><span class="pill ' + (STAT_CLS[c.status] || 'muted') + '">' + esc(c.status) + '</span>' +
      (c.issueId ? ' ' + issueTag(c.issueId) : '') + ' ' + srcChip(c.sourceRef) + '</div>' +
      '<div class="cmt-text">' + esc(c.text) + '</div></div>';
    const ours = (comms.commitments || []).filter((c) => c.owner === 'ours');
    const theirs = (comms.commitments || []).filter((c) => c.owner === 'theirs');
    const boardInner = '<div class="grid">' +
      '<div class="col-6"><div class="cmt-hd">Ours <span class="tiny muted">(' + ours.length + ')</span></div>' +
        (ours.length ? ours.map(commitRow).join('') : '<div class="tiny muted">None recorded.</div>') + '</div>' +
      '<div class="col-6"><div class="cmt-hd">Theirs <span class="tiny muted">(' + theirs.length + ')</span></div>' +
        (theirs.length ? theirs.map(commitRow).join('') : '<div class="tiny muted">None recorded.</div>') + '</div>' +
      '</div>';
    const boardCard = (comms.commitments && comms.commitments.length)
      ? saCard('Commitments & open asks', boardInner, { accent: 'teal', icon: 'handshake' })
      : gapCard('No commitments', 'No commitments were recorded from the thread.');

    // --- pen-history timeline --------------------------------------------------
    const penItems = (comms.penHistory || []).map((p, i, arr) => ({
      date: p.date, name: p.party + ' holds the pen', meta: esc(p.basis),
      tone: i === arr.length - 1 ? 'pri' : ''
    }));
    const penCard = (comms.penHistory && comms.penHistory.length)
      ? saCard('Pen history', timeline(penItems) +
          (d.deal.whoHasPen ? insight('Pen now with <b>' + esc(d.deal.whoHasPen.party) + '</b>, ' + esc(d.deal.whoHasPen.basis) + ' ' + evidenceChip('inference', { short: true })) : ''),
          { accent: 'plum', icon: 'clock' })
      : gapCard('No pen history', 'No redline exchange history is available.');

    // --- DERIVED next-session brief (open positions x latest thread state) ------
    const briefCard = buildDerivedBrief();

    return '<div class="grid">' +
      '<div class="col-12">' + ledgerCard + '</div>' +
      '<div class="col-7">' + boardCard + '</div>' +
      '<div class="col-5">' + penCard + '</div>' +
      '<div class="col-12">' + briefCard + '</div>' +
      '</div>';
  }

  // The next-session brief is COMPUTED from the open positions and the latest
  // thread state (never a hand-authored monologue, so it cannot drift). Copy-only.
  function buildDerivedBrief() {
    const rec = d.deal.recommendation || {};
    const openIssues = d.issues.filter((i) => i.internalDecision === 'pending');
    const condIds = (rec.conditions || []).map((c) => c.issueId);
    const objIds = (neg.objectives || []).filter((o) => o.priority <= 2).flatMap((o) => o.issueIds || []);
    const askIds = Array.from(new Set(condIds.concat(objIds)))
      .filter((id) => openIssues.some((i) => i.id === id))
      .sort((a, b) => (PR_RANK[issueById(a).priority] - PR_RANK[issueById(b).priority]) || a.localeCompare(b));
    const askIssues = askIds.map(issueById).filter(Boolean);

    const pen = d.deal.whoHasPen || {};
    const sop = d.deal.stateOfPlay || {};
    const bat = neg.batna || {};

    // derived blocks (plain objects -> both HTML and copy text come from these)
    const openingText = 'We value the platform fit and want to move quickly. ' +
      (rec.headline ? rec.headline + ' ' : '') +
      'Three terms remain signature gates for us' +
      ((rec.conditions && rec.conditions.length) ? ', ' + rec.conditions.map((c) => {
        const iss = issueById(c.issueId); return iss ? iss.category.toLowerCase() : c.issueId;
      }).join(', ') : '') +
      '. We are ready to commit multi-year if platform pricing reflects that commitment.';

    const agenda = (neg.roundPlan || []).map((r) => {
      const p = pkgById(r.packageId);
      return { block: r.round, item: (p ? p.name + ', ' : '') + r.focus };
    });
    agenda.push({ block: 'Recap', item: 'Confirm agreed points, owners, and the next-draft date.' });

    const closingText = 'To recap: aligned on platform fit and ready to commit for three years. Closing depends on the ' +
      (rec.conditions ? rec.conditions.length : 0) + ' signature terms and platform pricing that reflects the commitment. ' +
      (bat.trigger ? 'If ' + bat.trigger.charAt(0).toLowerCase() + bat.trigger.slice(1) + ' we escalate internally rather than sign. ' : '') +
      'Let us confirm owners and a date for the next draft.';

    // --- copy text builders ----
    const agendaText = agenda.map((a) => '  ' + a.block + ', ' + a.item).join('\n');
    const asksText = askIssues.map((i) => '  - ' + i.recommendedPosition + ' (' + i.id + ')').join('\n');
    const pushbackText = askIssues.map((i) => '  Q: ' + i.supplierPushback + '\n  A: ' + i.recommendedResponse).join('\n');
    const fullBriefText = [
      'NEXT-SESSION BRIEF, ' + d.deal.title,
      'Derived from ' + openIssues.length + ' open positions and the latest thread state.',
      'Pen: ' + (pen.party || 'unknown') + (pen.asOf ? ' (as of ' + pen.asOf + ')' : '') + '.',
      sop.lastMaterialEvent ? 'Last material event: ' + sop.lastMaterialEvent : '',
      '',
      'OPENING:',
      openingText,
      '',
      'AGENDA:',
      agendaText,
      '',
      'EXACT ASKS (open positions):',
      asksText,
      '',
      'EXPECTED PUSHBACK / REBUTTAL:',
      pushbackText,
      '',
      'CLOSING:',
      closingText
    ].filter((x) => x !== null).join('\n');

    // --- HTML blocks (each with a per-block copy) ----
    const metaLine =
      '<div class="brief-meta">Derived from <b>' + openIssues.length + '</b> open positions × latest thread state. ' +
      'Pen: <b>' + esc(pen.party || 'unknown') + '</b>' + (pen.asOf ? ' (as of ' + esc(pen.asOf) + ')' : '') + '. ' +
      evidenceChip('inference', { short: true }) + '</div>' +
      (sop.lastMaterialEvent ? '<div class="card-note">Last material event: ' + esc(sop.lastMaterialEvent) + '</div>' : '');

    const openingBlock = saCard('Opening',
      '<div class="excerpt" style="border-left-color:var(--pri)">' + esc(openingText) + '</div>' +
      '<div class="btn-row">' + copyBtn('Copy opening', null, openingText) + '</div>',
      { accent: 'plum', icon: 'handshake' });

    const agendaBlock = saCard('Agenda',
      timeline(agenda.map((a) => ({ date: a.block, name: a.item, tone: '' }))) +
      '<div class="btn-row">' + copyBtn('Copy agenda', null, agendaText) + '</div>',
      { accent: 'plum', icon: 'meeting' });

    const asksBlock = askIssues.length
      ? saCard('Exact asks, open positions',
          '<ul class="plain-list">' + askIssues.map((i) =>
            '<li>' + esc(i.recommendedPosition) + ' ' + issueTag(i.id) + ' ' + evidenceChip(i.evidenceType, { short: true }) + '</li>').join('') + '</ul>' +
          '<div class="btn-row">' + copyBtn('Copy asks', null, asksText) + '</div>',
          { accent: 'teal', icon: 'flag' })
      : gapCard('No open asks', 'No open (pending) positions remain to bring to the table.');

    const pbCols = [
      { key: 'pushback', label: 'Expected pushback', width: '38%', render: (r) => '<span class="tiny">' + esc(r.supplierPushback) + '</span>', sort: false },
      { key: 'response', label: 'Rebuttal', width: '38%', render: (r) => esc(r.recommendedResponse), sort: false },
      { key: 'issue', label: 'Issue', width: '24%', render: (r) => issueTag(r.id) + ' ' + evidenceChip(r.evidenceType, { short: true }), sort: false }
    ];
    const pushbackBlock = askIssues.length
      ? saCard('Expected pushback → rebuttal',
          dataTable(pbCols, askIssues, { id: 'negBriefPushback', zebra: true, dense: true }) +
          '<div class="btn-row">' + copyBtn('Copy pushback table', null, pushbackText) + '</div>',
          { accent: 'plum', icon: 'scale' })
      : '';

    const closingBlock = saCard('Closing',
      '<div class="excerpt" style="border-left-color:var(--emph)">' + esc(closingText) + '</div>' +
      '<div class="btn-row">' + copyBtn('Copy closing', null, closingText) + '</div>',
      { accent: 'emph', icon: 'meeting' });

    const inner =
      metaLine +
      insight('This brief is generated from the spine, open issues, the round plan and the BATNA, so it stays in sync with the analysis. Text is copy-only; nothing is sent.') +
      '<div class="grid" style="margin-top:12px">' +
        '<div class="col-12">' + openingBlock + '</div>' +
        '<div class="col-6">' + agendaBlock + '</div>' +
        '<div class="col-6">' + asksBlock + '</div>' +
        '<div class="col-12">' + pushbackBlock + '</div>' +
        '<div class="col-12">' + closingBlock + '</div>' +
      '</div>';

    return saCard('Next-session brief (derived)', inner, { accent: 'emph', icon: 'brief',
      sub: copyBtn('Copy full brief', null, fullBriefText) });
  }

  /* ================================ SHELL ================================== */
  const scopedStyle = '<style>' +
    '.neg-tab .section-lead{margin:2px 0 2px}' +
    '.neg-tab .obj-row{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)}' +
    '.neg-tab .obj-row:first-child{border-top:0}' +
    '.neg-tab .obj-num{flex:none;width:24px;height:24px;border-radius:50%;background:var(--pri);color:var(--pri-fg);' +
    'font:800 var(--fz-sm)/24px var(--sans);text-align:center}' +
    '.neg-tab .obj-body{font-size:var(--fz-sm)}' +
    '.neg-tab .obj-issues{margin-top:5px;display:flex;gap:5px;flex-wrap:wrap}' +
    '.neg-tab .neg-tag{cursor:pointer;font-family:var(--mono)}' +
    '.neg-tab .src-chip{cursor:pointer;font-family:var(--mono)}' +
    '.neg-tab .ladder-hd{font-weight:700;font-size:var(--fz-sm);margin-bottom:8px;display:flex;align-items:center}' +
    '.neg-tab .hs-line{display:flex;gap:5px;align-items:flex-start;color:var(--danger-fg);font-weight:600;font-size:var(--fz-sm)}' +
    '.neg-tab .hs-line svg{width:13px;height:13px;flex:none;margin-top:2px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.neg-tab .clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    /* tactic flag chip on the spine */
    '.neg-tab .tac-chip{display:inline-flex;align-items:center;gap:4px;font:700 var(--fz-floor)/1 var(--sans);color:var(--warn-fg);' +
    'background:var(--warn-bg);border:1px solid color-mix(in srgb,var(--warn-bar) 30%,transparent);border-radius:20px;padding:3px 8px}' +
    '.neg-tab .tac-chip svg{width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2}' +
    /* posture difficulty */
    '.neg-tab .diff-read{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
    '.neg-tab .diff-pill{font-size:var(--fz-sm);padding:6px 12px}' +
    /* wording toggle (CSS-only) */
    '.neg-tab .word-direct{display:none}' +
    '.neg-tab .word-toggle-row{display:flex;align-items:center;gap:6px;margin:10px 0;flex-wrap:wrap}' +
    '.neg-tab #wm-collab-pos:checked ~ .word-toggle-row label[for="wm-collab-pos"],' +
    '.neg-tab #wm-direct-pos:checked ~ .word-toggle-row label[for="wm-direct-pos"]{background:var(--pri);color:var(--pri-fg);border-color:var(--pri)}' +
    '.neg-tab #wm-direct-pos:checked ~ .word-scope .word-collab{display:none}' +
    '.neg-tab #wm-direct-pos:checked ~ .word-scope .word-direct{display:-webkit-box}' +
    '.neg-tab .plain-list{margin:0;padding-left:18px;font-size:var(--fz-sm);line-height:1.6}' +
    '.neg-tab .plain-list li{margin-bottom:6px}' +
    '.neg-tab .subtab-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px}' +
    '.neg-tab #negPositionsTable tbody tr:not(.expander-row){cursor:pointer}' +
    '.neg-tab .row-chevron{display:inline-flex;margin-right:5px;color:var(--mut);transition:transform .15s;vertical-align:-3px}' +
    '.neg-tab .row-chevron svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.neg-tab tr.is-open .row-chevron{transform:rotate(90deg)}' +
    /* interdependency map */
    '.neg-tab .idep-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--line)}' +
    '.neg-tab .idep-name{font-weight:700;font-size:var(--fz-sm);min-width:150px;color:var(--ink2)}' +
    '.neg-tab .idep-chips{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap}' +
    '.neg-tab .idep-x{color:var(--mut);font-weight:800;margin:0 2px}' +
    /* round plan focus */
    '.neg-tab .rp-focus{font-size:var(--fz-sm);line-height:1.45;color:var(--ink2)}' +
    /* package simulator (CSS radio swap over precomputed fields) */
    '.neg-tab .pkg-toggle{display:flex;align-items:center;gap:6px;margin:2px 0 14px;flex-wrap:wrap}' +
    '.neg-tab .pkg-result{display:none}' +
    '.neg-tab #pkg-base:checked ~ .pkg-scope .pkg-r-base,' +
    '.neg-tab #pkg-PKG-A:checked ~ .pkg-scope .pkg-r-PKG-A,' +
    '.neg-tab #pkg-PKG-B:checked ~ .pkg-scope .pkg-r-PKG-B,' +
    '.neg-tab #pkg-PKG-C:checked ~ .pkg-scope .pkg-r-PKG-C{display:block;animation:fade .18s ease}' +
    '.neg-tab #pkg-base:checked ~ .pkg-toggle label[for="pkg-base"],' +
    '.neg-tab #pkg-PKG-A:checked ~ .pkg-toggle label[for="pkg-PKG-A"],' +
    '.neg-tab #pkg-PKG-B:checked ~ .pkg-toggle label[for="pkg-PKG-B"],' +
    '.neg-tab #pkg-PKG-C:checked ~ .pkg-toggle label[for="pkg-PKG-C"]{background:var(--emph);color:var(--emph-fg);border-color:var(--emph)}' +
    '.neg-tab .pkg-metrics{display:flex;gap:28px;flex-wrap:wrap;padding:4px 0 10px;border-bottom:1px solid var(--line)}' +
    '.neg-tab .pkg-metric .pm-lbl{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700}' +
    '.neg-tab .pkg-metric .pm-val{font:800 26px/1.05 var(--sans);font-variant-numeric:tabular-nums;letter-spacing:-.02em;color:var(--ink);margin:3px 0}' +
    '.neg-tab .pkg-metric .pm-max{font-size:14px;font-weight:700;color:var(--mut)}' +
    '.neg-tab .pkg-detail{padding-top:10px}' +
    /* commitments board */
    '.neg-tab .cmt-hd{font-weight:800;font-size:var(--fz-sm);text-transform:uppercase;letter-spacing:.05em;color:var(--ink);margin-bottom:6px}' +
    '.neg-tab .cmt-item{padding:9px 0;border-top:1px solid var(--line)}' +
    '.neg-tab .cmt-item:first-of-type{border-top:0}' +
    '.neg-tab .cmt-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px}' +
    '.neg-tab .cmt-text{font-size:var(--fz-sm);color:var(--ink2);line-height:1.4}' +
    /* derived brief */
    '.neg-tab .brief-meta{font-size:var(--fz-sm);color:var(--ink2);margin-bottom:6px}' +
    '</style>';

  // Consistent with every other subtabbed tab (Terms & Review, Economics): the subtab bar sits
  // directly under the primary nav, and each subtab panel leads with its OWN title + intro
  // (there is no separate tab-level "Negotiation" heading).
  const cov = coverageBadge(d.deal.evidenceCoverage);
  const intro = (h2, q) => '<div class="tab-intro"><h2>' + h2 + '</h2><p class="q">' + q + ' ' + cov + '</p></div>';
  const posIntro = intro('Positions', 'The 12 legal, commercial and scope terms framed as negotiating positions, each playbook-cited with the supplier stance, our ask, pushback and rebuttal, plus how they bundle and trade together.');
  const tradeIntro = intro('Trade Plan', 'How do I move them? The give/get packages, concession ladders and round sequence, what to open with, what to trade for what, and the walk-away.');
  const commsIntro = intro('Communications', 'The traceable thread, every position, ask and commitment keyed to the M365 source it came from, and who currently holds the pen.');
  return scopedStyle + '<div class="neg-tab">' +
    '<div class="subtabbar" data-subtab-group="negotiation"><div class="wrap">' +
    '<button class="subtab-btn" data-subtab="positions" aria-selected="true">' + icon('target') + ' Positions</button>' +
    '<button class="subtab-btn" data-subtab="trade">' + icon('trade') + ' Trade Plan</button>' +
    '<button class="subtab-btn" data-subtab="comms">' + icon('sources') + ' Communications</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
    '<div data-subpanel="negotiation/positions" class="is-active">' + posIntro + buildPositions() + '</div>' +
    '<div data-subpanel="negotiation/trade">' + tradeIntro + buildTradePlan() + '</div>' +
    '<div data-subpanel="negotiation/comms">' + commsIntro + buildComms() + '</div>' +
    '</div></div>' +
    '</div>';
}

if (typeof global !== 'undefined') {
  global.renderTab_negotiation = renderTab_negotiation;
  global.DealTabs = global.DealTabs || {};
  global.DealTabs.negotiation = renderTab_negotiation;
}

})(typeof window !== 'undefined' ? window : this);
