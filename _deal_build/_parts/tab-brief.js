/* =============================================================================
 * tab-brief.js, "Overview" tab (Tab 1 of the 4-tab redesign, DEAL-DESIGN-DECISION.md).
 * NO subtabs. Reads ONLY from dashboardData (param d); every fact is looked up
 * from the canonical model, never re-authored. Same issue/scenario/gap OBJECTS
 * the other tabs read; never re-typed (anti-drift by reference).
 *
 * Pen band (full width, who has the pen) + 5 panels, 4 rows (top to bottom):
 *   Pen band: single-line who-has-the-pen context (party, basis, confidence).
 *             Moved off the persistent strip (shell.js) to kill horizontal scroll.
 *   Row 1: Deal snapshot / State of Play & Next Steps
 *          (two equal columns; key facts, then last material event + the
 *           sequenced next-steps timeline, merged from the old separate
 *           State-of-play digest + Next-actions timeline cards)
 *   Row 2: Recommendation / Top-5 issues
 *          (stance + 3 signature conditions + limitations; hard-stop first, off the issues[] spine)
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

  /* ============================= 0. PEN BAND ============================= */
  // Full-width, single-line who-has-the-pen context. Replaces the pen chip that used
  // to lead the persistent strip (shell.js); no coverage badge here, that was dropped.
  function buildPenBand(d) {
    const pen = d.deal.whoHasPen;
    if (!pen) return '';
    const conf = String(pen.confidence || '').toLowerCase();
    const confColor = conf === 'high' ? 'var(--sec-tx)' : conf === 'low' ? 'var(--danger-fg)' : 'var(--emph-tx)';
    const confBorder = conf === 'high' ? 'var(--sec)' : conf === 'low' ? 'var(--danger-bar)' : 'var(--emph)';
    return `
      <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:9px;background:var(--pri-t);
        border:1px solid var(--line2);border-left:3px solid var(--pri);border-radius:var(--r-sm);
        padding:9px 14px;margin-bottom:16px;font-size:var(--fz-sm)">
        <span style="font:800 var(--fz-floor)/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--pri-tx);flex:none">Pen</span>
        <b style="font-weight:800;color:var(--ink);flex:none;white-space:nowrap">${esc(pen.party || '—')}</b>
        ${pen.basis ? `<span style="color:var(--ink2);flex:1 1 320px;min-width:0">${esc(pen.basis)}</span>` : ''}
        ${pen.confidence ? `<span style="font:700 var(--fz-floor)/1 var(--sans);letter-spacing:.03em;text-transform:uppercase;
          flex:none;color:${confColor};border:1px solid ${confBorder};border-radius:20px;padding:2px 8px">${esc(pen.confidence)}</span>` : ''}
      </div>
    `;
  }

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
    `;
    return saCard('Deal Snapshot', html, { accent: 'teal', icon: 'doc', sub: esc(snap.projectId) });
  }

  /* ============================= 3. STATE OF PLAY & NEXT STEPS (merged) =============================
   * Merges the old State-of-play digest + Immediate Next Actions cards. "Who has the
   * pen" is dropped here, it now lives in the pen band above row 1. sop.nextExpectedMove
   * duplicates the substance of sequence step 1 (both describe leading with the
   * protection/signature-blocking terms), so it is folded into a single lead line
   * rather than repeated as its own timeline entry. */
  function buildStateOfPlayAndNextSteps(d) {
    const sop = d.deal.stateOfPlay;
    const items = d.negotiation.sequence.map(s => {
      const pkg = d.negotiation.packages.find(p => p.id === s.packageId);
      const tone = pkg ? (pkg.priority === 1 ? 'pri' : pkg.priority === 3 ? 'emph' : '') : '';
      const meta = (pkg ? `<span class="tiny muted">${esc(pkg.name)}</span> ` : '') + evidenceChip(s.evidenceType, { short: true });
      return { date: 'Step ' + s.step, name: s.text, meta, tone };
    });
    const html = `
      <dl class="kv" style="grid-template-columns:1fr">
        <dt>Last material event</dt>
        <dd>${esc(sop.lastMaterialEvent)}</dd>
        <dt>Next expected move</dt>
        <dd>${esc(sop.nextExpectedMove)}</dd>
      </dl>
      ${timeline(items)}
      ${insight('A planning sequence for the meeting, not a task list: packages are sequenced so protection terms are agreed before commercials are discussed.')}
      <div class="btn-row">${jumpLink('Full communications thread →', 'tab:negotiation')}</div>
    `;
    return saCard('State of Play & Next Steps', html, { accent: 'emph', icon: 'clock' });
  }

  /* ============================= 4. TOP-5 ISSUES ============================= */
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
    const html = table + insight('These 5 span both hard-stops plus the highest-value high-priority items; the full ' +
      d.issues.length + '-issue register is in Terms &amp; Review → Legal &amp; Protection.') +
      `<div class="btn-row">${jumpLink('Full issue register →', 'tab:contract/sub:legal')}</div>`;
    return saCard('Top 5 Issues', html, { icon: 'flag', sub: top5.length + ' of ' + d.issues.length });
  }

  /* ============================= 5. COMMERCIAL HEADLINE + TOTAL-DEAL ZOPA ============================= */
  function buildCommercial(d) {
    const batna = d.negotiation.batna;
    const batnaNote = insight(
      (batna.hasRealAlternative ? 'A real alternative exists: ' : 'No real alternative exists: ') + esc(batna.alternative) +
      '. Cost of invoking it: ' + esc(batna.costDelta) + '. Trigger: ' + esc(batna.trigger),
      'warn'
    );
    // Real per-line + Total-deal ZOPA, shared component (identical to Economics).
    const zopa = (typeof window !== 'undefined' && window.DealZopa) ? window.DealZopa.render(d) : '';
    return saCard('Commercial Headline & Total-Deal ZOPA', zopa + batnaNote, { accent: 'teal', icon: 'money' });
  }

  /* ============================= 6. EVIDENCE & GAPS BAND ============================= */
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
    return dataTable(cols, topGaps, { id: 'ov-top-gaps', zebra: true }) +
      insight('Top 5 of ' + d.gaps.length + ' tracked gaps, ranked by priority then decision impact. Quick wins (high impact, easy to get) are worth chasing before the next draft.');
  }

  function buildEvidenceGapsBand(d) {
    const html = `
      ${buildCoverageStrip(d)}
      <div class="eyebrow" style="margin:16px 0 7px">Top 5 critical gaps</div>
      ${buildTopGaps(d)}
      ${insight('The full source inventory (' + d.sources.length + ') and the impact vs. ease matrix for all ' + d.gaps.length + ' missing inputs now live in ' + jumpLink('Terms &amp; Review, Sources &amp; Evidence &rarr;', 'tab:contract/sub:sources') + '.')}
    `;
    return saCard('Evidence & Gaps', html, { icon: 'gap', sub: coverageBadge(d.deal.evidenceCoverage) });
  }

  /* ============================= ASSEMBLE ============================= */
  function renderTab_brief(d) {
    return `
    <div class="tab-body"><div class="wrap">

      <div class="tab-intro">
        <h2>Overview</h2>
      </div>

      ${buildPenBand(d)}

      <div class="grid">
        <div class="col-6">${buildSnapshot(d)}</div>
        <div class="col-6">${buildStateOfPlayAndNextSteps(d)}</div>
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
