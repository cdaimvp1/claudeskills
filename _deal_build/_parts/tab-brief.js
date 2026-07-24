/* =============================================================================
 * tab-brief.js, "Overview" tab (Tab 1 of the 4-tab redesign, DEAL-DESIGN-DECISION.md).
 * NO subtabs. Reads ONLY from dashboardData (param d); every fact is looked up
 * from the canonical model, never re-authored. Same issue/scenario/gap OBJECTS
 * the other tabs read; never re-typed (anti-drift by reference).
 *
 * 7 panels (top to bottom):
 *   1. Verdict block          (stance + 3 signature conditions + limitations)
 *   2. Deal snapshot          (key facts from d.deal)
 *   3. State-of-play digest   (who has the pen / last event / next move)
 *   4. Top-5 issues           (hard-stop first, off the issues[] spine)
 *   5. Commercial headline    (Y1 boundaries + 3-yr TCV ZOPA + BATNA floor)
 *   6. Next-actions timeline  (planning only, no assign/send)
 *   7. Evidence & gaps band   (coverage strip + top-5 gaps + full-register expanders;
 *                              compresses the old Sources & Gaps tab into one band)
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
    const recapText = [
      rec.stance, '', rec.headline, '', rec.rationale, '',
      'Conditions to close before signature:',
      ...rec.conditions.map(c => '- ' + c.text),
      '', 'Analysis limitations:',
      ...rec.limitations.map(l => '- ' + l)
    ].join('\n');

    const conditionsHTML = rec.conditions.map(c => {
      const iss = d.issues.find(i => i.id === c.issueId);
      return `<dd style="display:block;padding-bottom:8px;border-bottom:1px solid var(--line)">
        <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:3px">
          ${iss ? severityPill(iss.priority) : ''}
          <span style="font-weight:600">${esc(c.text)}</span>
        </div>
        ${evidenceChip(iss ? iss.evidenceType : 'inference', { short: true, sources: iss ? iss.sourceIds : [] })}
        ${jumpLink('View in register →', 'tab:contract/sub:legal')}
      </dd>`;
    }).join('');

    const html = `
      <div class="eyebrow" style="color:var(--pri-tx);font-size:13px;letter-spacing:.03em;margin-bottom:5px">${esc(rec.stance)}</div>
      <p style="font-weight:700;font-size:14.5px;line-height:1.4;margin:0 0 8px">${esc(rec.headline)}</p>
      <p style="font-size:var(--fz-sm);color:var(--ink2);line-height:1.55;margin:0 0 13px">${esc(rec.rationale)}</p>
      <div class="eyebrow" style="margin-bottom:7px">Conditions before signature</div>
      <div class="kv" style="grid-template-columns:1fr;gap:9px;margin-bottom:4px">${conditionsHTML}</div>
      ${collapsible(
        '<span>Analysis limitations (' + rec.limitations.length + ')</span>',
        '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px">' +
          rec.limitations.map(l => `<li style="font-size:var(--fz-sm);color:var(--ink2)">${esc(l)}</li>`).join('') +
        '</ul>',
        { open: true }
      )}
      <div class="btn-row">${copyBtn('Copy recommendation', null, recapText)}</div>
    `;
    return saCard('Recommendation', html, { icon: 'shield', sub: esc(d.deal.stage) });
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
      <div class="card-note">${esc(d.meta.disclaimer)}</div>
    `;
    return saCard('Deal Snapshot', html, { accent: 'teal', icon: 'doc', sub: esc(snap.projectId) });
  }

  /* ============================= 3. STATE-OF-PLAY DIGEST ============================= */
  function buildStateOfPlay(d) {
    const sop = d.deal.stateOfPlay;
    const pen = d.deal.whoHasPen;
    const html = `
      <dl class="kv" style="grid-template-columns:1fr">
        <dt>Who has the pen</dt>
        <dd>${esc(sop.whoHasPen)} <span class="tiny muted">(${esc(pen.confidence)} confidence, as of ${esc(pen.asOf)})</span></dd>
        <dt>Last material event</dt>
        <dd>${esc(sop.lastMaterialEvent)}</dd>
        <dt>Next expected move</dt>
        <dd>${esc(sop.nextExpectedMove)}</dd>
      </dl>
      <div class="card-note">${evidenceChip(sop.evidenceType, { short: true })} Best-effort read of process position; not a monitored, live-tracked signal.</div>
      <div class="btn-row">${jumpLink('Full communications thread →', 'tab:negotiation')}</div>
    `;
    return saCard('State of Play', html, { accent: 'emph', icon: 'meeting' });
  }

  /* ============================= 4. TOP-5 ISSUES ============================= */
  function buildTopIssues(d) {
    const sorted = d.issues.slice().sort((a, b) => (rankPriority[b.priority] || 0) - (rankPriority[a.priority] || 0));
    const top5 = sorted.slice(0, 5);
    const cols = [
      { key: 'priority', label: '', width: '96px', sortVal: r => rankPriority[r.priority] || 0, render: r => severityPill(r.priority) },
      { key: 'title', label: 'Issue', render: r => `<strong>${esc(r.title)}</strong><div class="tiny muted">${esc(r.category)} · ${esc(r.clause)}</div>` },
      { key: 'ev', label: 'Evidence', width: '120px', sort: false, render: r => evidenceChip(r.evidenceType, { short: true, sources: r.sourceIds }) }
    ];
    const table = dataTable(cols, top5, {
      id: 'ov-top-issues', zebra: true,
      expand: r => `
        <div class="kv" style="margin-bottom:10px">
          <dt>Recommended</dt><dd>${esc(r.recommendedPosition)}</dd>
          <dt>Fallback</dt><dd>${esc(r.fallback)}</dd>
          <dt>Hard stop</dt><dd style="color:var(--danger-fg);font-weight:600">${esc(r.hardStop)}</dd>
        </div>
        ${excerpt(r.sourceExcerpt)}
        <div class="btn-row">
          ${jumpLink('Full issue register →', 'tab:contract/sub:legal')}
          ${jumpLink('Negotiation position →', 'tab:negotiation/sub:positions')}
        </div>
      `
    });
    const html = table + insight('These 5 span both hard-stops plus the highest-value high-priority items; the full ' +
      d.issues.length + '-issue register is in Terms &amp; Review → Terms &amp; Risk.');
    return saCard('Top 5 Issues', html, { icon: 'flag', sub: top5.length + ' of ' + d.issues.length });
  }

  /* ============================= 5. COMMERCIAL HEADLINE + TOTAL-DEAL ZOPA ============================= */
  function buildCommercial(d) {
    const scAsk = d.scenarios.find(s => s.id === 'SC-ask');
    const scTarget = d.scenarios.find(s => s.id === 'SC-target');
    const scFallback = d.scenarios.find(s => s.id === 'SC-fallback');
    const scMax = d.scenarios.find(s => s.id === 'SC-max');
    const maxY1 = Math.max(scAsk.y1Total, scTarget.y1Total, scFallback.y1Total, scMax.y1Total);
    const maxTotal = Math.max(scAsk.total, scTarget.total, scFallback.total, scMax.total);
    const batna = d.negotiation.batna;
    // The BATNA trigger text references the max-acceptable scenario figure directly
    // ("...cannot be brought at or below the max-acceptable (~$2.80M)"); reuse SC-max.total
    // rather than asserting a second, independently-typed number for the same walk-away line.
    const batnaFloor = scMax.total;

    const tcvGapEntry = d.deal.summaryStrip.find(s => s.key === 'tcvGap') ||
      { label: 'Target vs ask (3-yr)', value: '—', evidenceType: 'calculated' };

    function updateOverviewCommercialNumbers() {
      const ask = d.scenarios.find(s => s.id === 'SC-ask');
      const target = d.scenarios.find(s => s.id === 'SC-target');
      const fallback = d.scenarios.find(s => s.id === 'SC-fallback');
      const max = d.scenarios.find(s => s.id === 'SC-max');
      const ids = {
        'ov-y1-ask': ask.y1Total, 'ov-y1-target': target.y1Total, 'ov-y1-fallback': fallback.y1Total, 'ov-y1-max': max.y1Total,
        'ov-tcv-target': target.total, 'ov-tcv-fallback': fallback.total, 'ov-tcv-max': max.total, 'ov-tcv-ask': ask.total
      };
      Object.keys(ids).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = money(ids[id], { compact: true });
      });
    }
    if (typeof DealUI !== 'undefined') DealUI.onRecalc(updateOverviewCommercialNumbers);

    const y1Html =
      barRow('Ask', scAsk.y1Total, maxY1, `<span id="ov-y1-ask">${money(scAsk.y1Total, { compact: true })}</span>`, { color: 'danger' }) +
      barRow('Target', scTarget.y1Total, maxY1, `<span id="ov-y1-target">${money(scTarget.y1Total, { compact: true })}</span>`, { color: 'pri' }) +
      barRow('Fallback', scFallback.y1Total, maxY1, `<span id="ov-y1-fallback">${money(scFallback.y1Total, { compact: true })}</span>`, { color: 'teal' }) +
      barRow('Max acceptable', scMax.y1Total, maxY1, `<span id="ov-y1-max">${money(scMax.y1Total, { compact: true })}</span>`, { color: 'warn' });

    const zopaHtml =
      barRow('Target', scTarget.total, maxTotal, `<span id="ov-tcv-target">${money(scTarget.total, { compact: true })}</span>`, { color: 'pri' }) +
      barRow('Fallback', scFallback.total, maxTotal, `<span id="ov-tcv-fallback">${money(scFallback.total, { compact: true })}</span>`, { color: 'teal' }) +
      barRow('Max acceptable', scMax.total, maxTotal, `<span id="ov-tcv-max">${money(scMax.total, { compact: true })}</span>`, { color: 'warn' }) +
      barRow('BATNA walk-away trigger', batnaFloor, maxTotal,
        money(batnaFloor, { compact: true }) + ' ' + evidenceChip(batna.evidenceType, { short: true }), { color: 'warn' }) +
      barRow('Ask', scAsk.total, maxTotal, `<span id="ov-tcv-ask">${money(scAsk.total, { compact: true })}</span>`, { color: 'danger' });

    const batnaNote = insight(
      (batna.hasRealAlternative ? 'A real alternative exists: ' : 'No real alternative exists: ') + esc(batna.alternative) +
      '. Cost of invoking it: ' + esc(batna.costDelta) + '. Trigger: ' + esc(batna.trigger),
      'warn'
    );

    const html = `
      <div class="eyebrow" style="margin-bottom:7px">Year-1 all-in by scenario</div>
      ${y1Html}
      <div class="card-note">${esc(tcvGapEntry.label)}: <strong class="mono">${esc(tcvGapEntry.value)}</strong> ${evidenceChip(tcvGapEntry.evidenceType, { short: true })}</div>
      <div class="eyebrow" style="margin:14px 0 7px">Total-deal ZOPA (3-yr TCV)</div>
      ${zopaHtml}
      ${batnaNote}
      ${insight('Ask is anchored on platform + support loading; target reflects the internal precedent discount and day-rate norms (see Economics → Benchmarks).')}
    `;
    return saCard('Commercial Headline & Total-Deal ZOPA', html, { accent: 'teal', icon: 'money' });
  }

  /* ============================= 6. NEXT-ACTIONS TIMELINE ============================= */
  function buildNextActions(d) {
    const items = d.negotiation.sequence.map(s => {
      const pkg = d.negotiation.packages.find(p => p.id === s.packageId);
      const tone = pkg ? (pkg.priority === 1 ? 'pri' : pkg.priority === 3 ? 'emph' : '') : '';
      const meta = (pkg ? `<span class="tiny muted">${esc(pkg.name)}</span> ` : '') + evidenceChip(s.evidenceType, { short: true });
      return { date: 'Step ' + s.step, name: s.text, meta, tone };
    });
    const html = timeline(items) +
      insight('A planning sequence for the meeting, not a task list: packages are sequenced so protection terms are agreed before commercials are discussed.');
    return saCard('Immediate Next Actions', html, { accent: 'emph', icon: 'clock' });
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
      `data-jump="tab:contract/sub:legal" title="${esc(a)}: ${counts[i]} verified source${counts[i] === 1 ? '' : 's'}">` +
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
    return dataTable(cols, topGaps, { id: 'ov-top-gaps', zebra: true }) +
      insight('Top 5 of ' + d.gaps.length + ' tracked gaps, ranked by priority then decision impact. Quick wins (high impact, easy to get) are worth chasing before the next draft.');
  }

  // Expander 1: full source inventory register.
  function buildFullSourceInventory(d) {
    return dataTable([
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'label', label: 'Source', render: r => `<strong>${esc(r.label)}</strong><div class="tiny muted">${esc(r.detail)}</div>` },
      { key: 'kind', label: 'Kind', render: r => `<span style="text-transform:capitalize">${esc(r.kind)}</span>` },
      { key: 'coverage', label: 'Areas', align: 'num', sortVal: r => r.coverage.length, render: r => String(r.coverage.length) },
      { key: 'evidenceType', label: 'Evidence', render: r => evidenceChip(r.evidenceType, { short: true }) }
    ], d.sources, {
      id: 'ov-source-inventory', zebra: true,
      expand: r => `<div class="kv"><dt>Coverage areas</dt><dd>${r.coverage.map(a => '<span class="tiny">' + esc(a) + '</span>').join(', ')}</dd>` +
        `<dt>Detail</dt><dd>${esc(r.detail)}</dd><dt>Evidence</dt><dd>${evidenceChip(r.evidenceType)}</dd></div>`
    });
  }

  // Expander 2: full impact-vs-ease missing-inputs matrix (all gaps, not just the top 5).
  function buildFullGapsMatrix(d) {
    const points = d.gaps.map(g => ({
      x: g.ease, y: g.decisionImpact, label: g.id.replace('GAP-', ''),
      color: g.priority === 'critical' ? 'danger' : g.priority === 'important' ? 'emph' : 'teal',
      title: g.input + ' (' + g.priority + ') impact ' + g.decisionImpact + '/5, ease ' + g.ease + '/5'
    }));
    return matrixPlot(points, {
      xLabel: 'Ease to obtain →', yLabel: 'Decision impact →', xMax: 5, yMax: 5,
      quadrants: ['Hard, high stakes', 'Quick win: get first', 'Low priority', 'Easy, low value']
    });
  }

  function buildEvidenceGapsBand(d) {
    const html = `
      ${buildCoverageStrip(d)}
      <div class="eyebrow" style="margin:16px 0 7px">Top 5 critical gaps</div>
      ${buildTopGaps(d)}
      <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">
        ${collapsible('<span>Full source inventory (' + d.sources.length + ')</span>', buildFullSourceInventory(d))}
        ${collapsible('<span>Impact vs. ease: all missing inputs (' + d.gaps.length + ')</span>', buildFullGapsMatrix(d))}
      </div>
    `;
    return saCard('Evidence & Gaps', html, { icon: 'gap', sub: coverageBadge(d.deal.evidenceCoverage) });
  }

  /* ============================= ASSEMBLE ============================= */
  function renderTab_brief(d) {
    return `
    <div class="tab-body"><div class="wrap">

      <div class="tab-intro">
        <h2>Overview</h2>
        <div class="q">What is being negotiated, what blocks signature, what to ask for, and what is still missing; read in about two minutes.</div>
        <div class="tiny muted" style="margin-top:7px">Session snapshot generated ${esc(d.meta.generatedAt.replace('T', ' '))} · ${coverageBadge(d.deal.evidenceCoverage)} overall evidence coverage</div>
      </div>

      <div class="grid">
        <div class="col-8">${buildVerdict(d)}</div>
        <div class="col-4">${buildSnapshot(d)}</div>
      </div>

      <div class="grid" style="margin-top:16px">
        <div class="col-4">${buildStateOfPlay(d)}</div>
        <div class="col-8">${buildTopIssues(d)}</div>
      </div>

      <div class="grid" style="margin-top:16px">
        <div class="col-6">${buildCommercial(d)}</div>
        <div class="col-6">${buildNextActions(d)}</div>
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
