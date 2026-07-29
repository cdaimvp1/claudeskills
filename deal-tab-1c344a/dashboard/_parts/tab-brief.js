/* =============================================================================
 * tab-brief.js, "Overview" tab (Tab 1 of the 4-tab redesign, DEAL-DESIGN-DECISION.md).
 * NO subtabs. Reads ONLY from dashboardData (param d); every fact is looked up
 * from the canonical model, never re-authored. Same issue/scenario/gap OBJECTS
 * the other tabs read; never re-typed (anti-drift by reference).
 *
 * 6 panels, 4 rows (top to bottom); the persistent strip (shell.js) stays counts-only:
 *   Row 1: Deal Snapshot + State of Play stacked in a left column (equal height,
 *          each card's body scrolls if its own share overflows) / Next Steps on
 *          the right (the sequenced negotiation-package timeline; drives the
 *          row's height). State of Play leads with who has the pen (party,
 *          confidence, as-of date), then last material event, then next expected move.
 *   Row 2: Recommendation / Top-5 issues
 *          (stance + 3 signature conditions + limitations; hard-stop first, off
 *           the issues[] spine). Top 5 Issues is the height driver; Recommendation
 *           is capped to match via a small post-render equalizer (its body scrolls
 *           if its own content is taller, see equalizeVerdictToTopIssues below).
 *   Row 3: Commercial headline + full ZOPA
 *          (shared DealZopa render: per-line + total-deal ZOPA, plus BATNA floor)
 *   Row 4: Evidence & gaps band
 *          (coverage strip + top-5 gaps; full source inventory and impact-vs-ease
 *           matrix now live in Terms & Review → Sources & Evidence)
 * ========================================================================== */
(function (global) {
  'use strict';

  const rankPriority = { 'hard-stop': 4, high: 3, medium: 2, low: 1 };
  const rankGap = { critical: 3, important: 2, helpful: 1 };
  const contractSetLabel = {
    'msa-only': 'MSA only',
    'sow-under-msa': 'SOW under existing MSA',
    'new-msa-plus-sow': 'New MSA + initial SOW',
    'multiple-sows': 'Multiple SOWs',
    'amendment': 'Amendment',
    'renewal': 'Renewal'
  };

  /* ============================= 1. VERDICT BLOCK ============================= */
  function buildVerdict(d) {
    const rec = d.deal.recommendation;
    const conditionsHTML = rec.conditions.map(c => {
      const iss = d.issues.find(i => i.id === c.issueId);
      return `<dd style="display:block;padding-bottom:8px;border-bottom:1px solid var(--line)">
        <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:3px">
          ${iss ? severityPill(iss.priority) : ''}
          <span style="font-weight:600">${esc(c.text)}</span>
        </div>
      </dd>`;
    }).join('');

    const html = `
      <div class="eyebrow" style="color:var(--pri-tx);font-size:13px;letter-spacing:.03em;margin-bottom:5px">${esc(rec.stance)}</div>
      <p style="font-weight:700;font-size:13px;line-height:1.4;margin:0 0 8px">${esc(rec.headline)}</p>
      <p style="font-size:var(--fz-sm);color:var(--ink2);line-height:1.55;margin:0 0 13px">${esc(rec.rationale)}</p>
      <div class="eyebrow" style="margin-bottom:7px">Conditions before signature</div>
      <div class="kv" style="grid-template-columns:1fr;gap:9px;margin-bottom:4px">${conditionsHTML}</div>
      ${collapsible(
        '<span>Analysis limitations (' + rec.limitations.length + ')</span>',
        '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px">' +
          rec.limitations.map(l => `<li style="font-size:var(--fz-sm);color:var(--ink2)">${esc(l)}</li>`).join('') +
        '</ul>',
        { open: false }
      )}
    `;
    return saCard('Recommendation', html, { icon: 'shield', sub: esc(d.deal.stage), id: 'ov-verdict-card', bodyClass: 'card-bd-scroll' });
  }

  /* ============================= 2. DEAL SNAPSHOT ============================= */
  function buildSnapshot(d) {
    const snap = d.deal;
    const setLabel = contractSetLabel[d.meta.contractSet] || d.meta.contractSet;
    const html = `
      <dl class="kv">
        <dt>Deal</dt><dd>${esc(snap.title)}</dd>
        <dt>Supplier</dt><dd>${esc(snap.supplier)} <span class="tiny muted">(${esc(snap.supplierCategory)})</span></dd>
        <dt>Type</dt><dd>${esc(snap.negotiationType)}</dd>
        <dt>Contract set</dt><dd>${esc(setLabel)}</dd>
        <dt>Stage</dt><dd>${esc(snap.stage)}</dd>
        <dt>Counterparties</dt><dd>${esc(snap.counterparties.buyer)} <span class="muted">&harr;</span> ${esc(snap.counterparties.supplier)}</dd>
        <dt>Analysis date</dt><dd class="mono">${esc(snap.analysisDate)}</dd>
        <dt>Evidence</dt><dd>${coverageBadge(snap.evidenceCoverage)}</dd>
      </dl>
    `;
    return saCard('Deal Snapshot', html, { accent: 'teal', icon: 'doc', sub: esc(snap.projectId), bodyClass: 'card-bd-scroll' });
  }

  /* ============================= 3. STATE OF PLAY =============================
   * Restores the who-has-the-pen line as the lead fact (previously dropped when
   * this panel was briefly merged with the next-steps timeline): party + confidence
   * + as-of date, straight from d.deal.whoHasPen. Then last material event, then
   * next expected move, both from d.deal.stateOfPlay (labeled best-effort). */
  function buildStateOfPlay(d) {
    const pen = d.deal.whoHasPen;
    const sop = d.deal.stateOfPlay;
    const penLine = pen
      ? esc(pen.party || ', ') + ' (' + esc(pen.confidence || ', ') + ' confidence, as of ' + esc(pen.asOf || ', ') + ')'
      : ', ';
    const html = `
      <dl class="kv" style="grid-template-columns:1fr">
        <dt>Who has the pen</dt>
        <dd>${penLine}</dd>
        <dt>Last material event</dt>
        <dd>${esc(sop.lastMaterialEvent)}</dd>
        <dt>Next expected move</dt>
        <dd>${esc(sop.nextExpectedMove)}</dd>
      </dl>
    `;
    return saCard('State of Play', html, { accent: 'emph', icon: 'clock', bodyClass: 'card-bd-scroll' });
  }

  /* ============================= 4. NEXT STEPS =============================
   * The sequenced negotiation-package timeline for the meeting: a planning order,
   * not a task list. Split back out of the merged State of Play & Next Steps panel. */
  // Full-width sequenced plan: one card per move, each enriched from its negotiation package
  // (give -> get, protection/TCO deltas, the round target, and the issues it bundles) so the
  // panel fills the row with substance instead of three short timeline lines.
  function buildNextSteps(d) {
    const rp = d.negotiation.roundPlan || [];
    const cards = d.negotiation.sequence.map(s => {
      const pkg = d.negotiation.packages.find(p => p.id === s.packageId) || {};
      const round = rp.find(r => r.packageId === s.packageId) || {};
      const tone = pkg.priority === 1 ? 'pri' : (pkg.priority === 3 ? 'emph' : '');
      const dp = pkg.deltas ? pkg.deltas.protection : 0;
      const dt = pkg.deltas ? pkg.deltas.tco : 0;
      const deltas =
        (dp ? '<span class="ov-chip prot">+' + dp + ' protection</span>' : '') +
        (dt ? '<span class="ov-chip tco">' + M(dt) + ' TCO</span>' : '');
      const issues = (pkg.issueIds || []).map(id => '<span class="ov-iss">' + esc(id) + '</span>').join('');
      const trade = (pkg.give || pkg.get)
        ? '<div class="ov-step-trade"><span class="ov-give"><b>Give</b> ' + esc(pkg.give || ', ') + '</span>' +
          '<span class="ov-arrow">→</span><span class="ov-get"><b>Get</b> ' + esc(pkg.get || ', ') + '</span></div>'
        : '';
      return '<div class="ov-step ' + tone + '">' +
        '<div class="ov-step-hd"><span class="ov-step-n">Step ' + s.step + '</span>' +
          '<span class="ov-step-pkg">' + esc(pkg.name || '') + '</span>' + evidenceChip(s.evidenceType, { short: true }) + '</div>' +
        '<div class="ov-step-move">' + esc(s.text) + '</div>' + trade +
        (deltas ? '<div class="ov-step-deltas">' + deltas + '</div>' : '') +
        (round.target ? '<div class="ov-step-target"><span class="ov-tk">Round target</span>' + esc(round.target) + '</div>' : '') +
        (issues ? '<div class="ov-step-iss">' + issues + '</div>' : '') +
      '</div>';
    }).join('');
    const html = '<div class="ov-steps">' + cards + '</div>' +
      '<div class="btn-row">' + jumpLink('Full communications thread →', 'tab:negotiation') + '</div>';
    return saCard('Next Steps', html, { icon: 'meeting', sub: d.negotiation.sequence.length + ' sequenced moves' });
  }

  /* ============================= 5. TOP-5 ISSUES ============================= */
  // Compact list on Overview, no row-expand: severity + title + category/clause only.
  // Full recommended/fallback/hard-stop/excerpt detail lives on Terms & Review → Legal & Protection.
  function buildTopIssues(d) {
    const sorted = d.issues.slice().sort((a, b) => (rankPriority[b.priority] || 0) - (rankPriority[a.priority] || 0));
    const top5 = sorted.slice(0, 5);
    const cols = [
      { key: 'priority', label: '', width: '96px', sortVal: r => rankPriority[r.priority] || 0, render: r => severityPill(r.priority) },
      { key: 'title', label: 'Issue', render: r => `<strong>${esc(r.title)}</strong><div class="tiny muted">${esc(r.category)} · ${esc(r.clause)}</div>` }
    ];
    const table = dataTable(cols, top5, { id: 'ov-top-issues', zebra: true });
    const html = table + `<div class="btn-row">${jumpLink('Full issue register →', 'tab:contract/sub:legal')}</div>`;
    return saCard('Top 5 Issues', html, { icon: 'flag', sub: top5.length + ' of ' + d.issues.length, id: 'ov-topissues-card' });
  }

  /* ============================= 6. COMMERCIAL HEADLINE + TOTAL-DEAL ZOPA ============================= */
  // Value type is a property of the deal, not a fixed label: a new buy (no prior-spend baseline)
  // delivers COST AVOIDANCE (reduction vs the supplier ask); a renewal/re-buy with a baseline
  // delivers COST IMPROVEMENT (hard savings vs prior spend); some deals show both. The same card
  // then generalizes across any sourcing event instead of hard-coding "Savings".
  function commercialValueType(d) {
    const baseline = d.deal && (d.deal.priorSpend || d.deal.baselineSpend);
    return baseline ? 'improvement' : 'avoidance';
  }
  // Commercial headline cards, driven by the deal's commercial model (scenarios + lines), spanning
  // the panel width. The SET is deal-adaptive: a services T&M deal or a goods PO would surface a
  // different metric mix; in production the analysis-core selects them. Here we derive TCV, the
  // value delivered (CA/CI), the walk-away ceiling, and the single biggest price lever.
  function commercialHeadline(d) {
    const sc = id => ((d.scenarios || []).find(s => s.id === id) || {});
    const ask = sc('SC-ask').total || 0, target = sc('SC-target').total || 0, walk = sc('SC-max').total || 0;
    const years = (typeof assumVal === 'function') ? assumVal(d, 'ASM-2', 3) : 3;
    const lever = (d.commercialLines || []).slice()
      .sort((a, b) => ((b.supplierAmount || 0) - (b.target || 0)) - ((a.supplierAmount || 0) - (a.target || 0)))[0];
    const vType = commercialValueType(d);
    const vLabel = vType === 'improvement' ? 'Cost improvement' : (vType === 'both' ? 'Negotiated value' : 'Cost avoidance');
    const cards = [
      { lab: 'TCV', val: M(target), sub: years + '-yr target · ' + M(ask) + ' ask', ev: 'calculated' },
      { lab: vLabel, val: M(ask - target), sub: 'ask − target over the term', ev: 'calculated' },
      { lab: 'Walk-away', val: M(walk), sub: 'max acceptable · ceiling unconfirmed', ev: 'assumption' },
      lever ? { lab: 'Biggest lever', val: M(lever.supplierAmount) + '→' + M(lever.target), sub: esc(String(lever.item || '').replace(/\s*\(.*/, '')), ev: 'calculated' } : null
    ].filter(Boolean);
    return '<div class="ov-headline">' + cards.map(c =>
      '<div class="ov-hcard"><div class="ov-hc-lab">' + esc(c.lab) + '</div>' +
      '<div class="ov-hc-val">' + c.val + '</div>' +
      '<div class="ov-hc-sub">' + c.sub + ' ' + evidenceChip(c.ev, { short: true }) + '</div></div>').join('') + '</div>';
  }
  function buildCommercial(d) {
    const batna = d.negotiation.batna;
    const batnaNote = insight(
      (batna.hasRealAlternative ? 'A real alternative exists: ' : 'No real alternative exists: ') + esc(batna.alternative) +
      '. Cost of invoking it: ' + esc(batna.costDelta) + '. Trigger: ' + esc(batna.trigger),
      'warn'
    );
    // Overview shows the TOTAL-DEAL / TCV band ONLY; the per-line ZOPA lives exclusively in
    // Economics (no duplication). A jump takes the user to the line-item detail.
    const zopa = (typeof window !== 'undefined' && window.DealZopa) ? window.DealZopa.renderTotal(d) : '';
    const toLines = '<div class="btn-row" style="margin-top:2px">' + jumpLink('Line-item ZOPA & pricing in Economics →', 'tab:commercials/sub:deal') + '</div>';
    return saCard('Commercial Headline & Total-Deal ZOPA', commercialHeadline(d) + zopa + toLines + batnaNote, { accent: 'teal', icon: 'money' });
  }

  /* ============================= 7. EVIDENCE & GAPS BAND ============================= */
  // Compact source x analysis-area coverage STRIP (one rollup row, not the full matrix).
  function buildCoverageStrip(d) {
    const areas = d.analysisAreas;
    const counts = areas.map(a => d.sources.filter(s => s.coverage.indexOf(a) !== -1 && s.evidenceType !== 'unavailable').length);
    const max = Math.max(...counts) || 1;
    let weakest = areas[0], weakestCount = counts[0];
    areas.forEach((a, i) => { if (counts[i] < weakestCount) { weakest = a; weakestCount = counts[i]; } });

    const header = '<div></div>' + areas.map(a => '<div class="hg-col">' + esc(a) + '</div>').join('');
    const cells = areas.map((a, i) =>
      `<button type="button" style="background:none;border:0;padding:0;cursor:pointer;display:flex;justify-content:center" ` +
      `data-jump="tab:contract/sub:sources" title="${esc(a)}: ${counts[i]} verified source${counts[i] === 1 ? '' : 's'}">` +
      heatCell(counts[i], { scale: max, label: String(counts[i]) }) + `</button>`
    ).join('');

    return '<div class="heat-grid" style="grid-template-columns:150px repeat(' + areas.length + ',1fr)">' +
      header + '<div class="hg-lbl">Verified sources</div>' + cells + '</div>' +
      insight('Weakest-covered analysis area: <strong>' + esc(weakest) + '</strong>; treat conclusions there as directional. ' +
        'Overall evidence coverage is rated <strong>' + esc(d.deal.evidenceCoverage) + '</strong>.', 'warn');
  }

  // Top-5 critical gaps (ranked by priority then decision impact).
  function buildTopGaps(d) {
    const topGaps = d.gaps.slice().sort((a, b) => {
      const pr = (rankGap[b.priority] || 0) - (rankGap[a.priority] || 0);
      return pr !== 0 ? pr : (b.decisionImpact || 0) - (a.decisionImpact || 0);
    }).slice(0, 5);
    const cols = [
      { key: 'input', label: 'Missing input', render: r => `<strong>${esc(r.input)}</strong><div class="tiny muted">${esc(r.whyItMatters)}</div>` },
      { key: 'priority', label: 'Priority', width: '100px', render: r => `<span class="pill ${r.priority === 'critical' ? 'danger' : r.priority === 'important' ? 'warn' : 'muted'}">${esc(r.priority)}</span>` },
      { key: 'impact', label: 'Decision impact', width: '130px', align: 'num', sortVal: r => r.decisionImpact, render: r => heatCell(r.decisionImpact, { scale: 5, label: r.decisionImpact, title: 'Decision impact ' + r.decisionImpact + '/5' }) },
      { key: 'ease', label: 'Ease to get', width: '110px', align: 'num', sortVal: r => r.ease, render: r => heatCell(r.ease, { scale: 5, label: r.ease, title: 'Ease ' + r.ease + '/5' }) },
      { key: 'ev', label: 'Status', width: '116px', sort: false, render: () => evidenceChip('unavailable', { short: true }) }
    ];
    return dataTable(cols, topGaps, { id: 'ov-top-gaps', zebra: true });
  }

  function buildEvidenceGapsBand(d) {
    const html = `
      ${buildCoverageStrip(d)}
      <div class="eyebrow" style="margin:16px 0 7px">Top 5 critical gaps</div>
      ${buildTopGaps(d)}
    `;
    return saCard('Evidence & Gaps', html, { icon: 'gap', sub: coverageBadge(d.deal.evidenceCoverage) });
  }

  /* ============================= ROW-2 HEIGHT EQUALIZER =============================
   * Top 5 Issues is the height driver for row 2 (grid stretch alone can only grow the
   * shorter card to match, never shrink the taller one, so a cap needs a measurement).
   * Registered via DealUI.onRecalc, which fires once at the end of the initial mount
   * (Overview is the default active tab, shell.js TABS[0]) and again on any later
   * assumption-slider recalc; a hidden panel measures 0 and is a deliberate no-op so a
   * background recalc from another tab never clobbers the cached height. */
  var _ovEqObserved = false;
  function equalizeVerdictToTopIssues() {
    const topCard = typeof document !== 'undefined' && document.getElementById('ov-topissues-card');
    const verdictCard = typeof document !== 'undefined' && document.getElementById('ov-verdict-card');
    if (!topCard || !verdictCard) return;
    // Lock the Recommendation card to the Top-5 Issues card's height; its body (card-bd-scroll)
    // scrolls if its own content is taller. The old version measured 0 at mount (Overview not yet
    // laid out) and returned early, never re-running -> the two cards ended up mismatched. A
    // ResizeObserver on the Top-5 card re-applies the moment it gets dimensions (i.e. when the tab
    // becomes visible), so the equalization is robust to mount/tab-switch timing.
    const apply = () => { const h = topCard.offsetHeight; if (h) verdictCard.style.height = h + 'px'; };
    apply();
    if (!_ovEqObserved && typeof ResizeObserver !== 'undefined') {
      _ovEqObserved = true;
      new ResizeObserver(apply).observe(topCard);
    }
  }
  if (typeof global.DealUI !== 'undefined' && typeof global.DealUI.onRecalc === 'function') {
    global.DealUI.onRecalc(equalizeVerdictToTopIssues);
  }

  /* ============================= ASSEMBLE ============================= */
  function renderTab_brief(d) {
    return `
    <div class="tab-body"><div class="wrap">

      <div class="tab-intro">
        <h2>Overview</h2>
      </div>

      <div class="grid" style="align-items:stretch">
        <div class="col-6"><div class="ov-stack"><div class="ov-slot">${buildSnapshot(d)}</div></div></div>
        <div class="col-6"><div class="ov-stack"><div class="ov-slot">${buildStateOfPlay(d)}</div></div></div>
      </div>

      <div class="grid" style="margin-top:16px">
        <div class="col-12">${buildNextSteps(d)}</div>
      </div>

      <div class="grid" style="margin-top:16px">
        <div class="col-7">${buildVerdict(d)}</div>
        <div class="col-5">${buildTopIssues(d)}</div>
      </div>

      <div class="grid" style="margin-top:16px">
        <div class="col-12">${buildCommercial(d)}</div>
      </div>

      <div class="grid" style="margin-top:16px">
        <div class="col-12">${buildEvidenceGapsBand(d)}</div>
      </div>

    </div></div>
    `;
  }

  global.renderTab_brief = renderTab_brief;
  global.DealTabs = global.DealTabs || {};
  global.DealTabs.brief = renderTab_brief;

})(typeof window !== 'undefined' ? window : this);
