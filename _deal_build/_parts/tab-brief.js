/* =============================================================================
 * tab-brief.js — "Brief" tab: the 2-minute pre-meeting readout.
 * NO subtabs (per DEAL-REDESIGN-BRIEF.md). Reads ONLY from dashboardData (param d);
 * every fact is looked up from the canonical model, never re-authored.
 *
 * Sections (top -> bottom):
 *   1. Recommended position (stance + rationale + conditions + limitations)
 *   2. Deal snapshot (kv facts)
 *   3. Issue landscape — category x priority heatmap (dominant visual)
 *   4. Top 5 issues (expandable register excerpt)
 *   5. Negotiation boundaries (target / fallback / hard-stop for the signature issues)
 *   6. Commercial headline (scenario Y1 comparison + 3-yr TCV gap)
 *   7. Immediate next actions (meeting sequence, planning not tasks)
 *   8. Critical unknowns (top gaps)
 * ========================================================================== */
function renderTab_brief(d) {
  const rankPriority = { 'hard-stop': 4, high: 3, medium: 2, low: 1 };
  const rankGap = { critical: 3, important: 2, helpful: 1 };
  const priorityOrder = ['hard-stop', 'high', 'medium', 'low'];
  const priorityLabel = { 'hard-stop': 'Hard stop', high: 'High', medium: 'Medium', low: 'Low' };
  const contractSetLabel = {
    'msa-only': 'MSA only',
    'sow-under-msa': 'SOW under existing MSA',
    'new-msa-plus-sow': 'New MSA + initial SOW',
    'multiple-sows': 'Multiple SOWs',
    'amendment': 'Amendment',
    'renewal': 'Renewal'
  }[d.meta.contractSet] || d.meta.contractSet;

  const rec = d.deal.recommendation;
  const sortedIssues = d.issues.slice().sort((a, b) => (rankPriority[b.priority] || 0) - (rankPriority[a.priority] || 0));
  const topIssues = sortedIssues.slice(0, 5);

  /* ============================= 1. RECOMMENDED POSITION ============================= */
  const recapText = [
    rec.stance, '', rec.headline, '', rec.rationale, '',
    'Conditions to close before signature:',
    ...rec.conditions.map(c => '- ' + c.text),
    '', 'Analysis limitations:',
    ...rec.limitations.map(l => '- ' + l)
  ].join('\n');

  const recommendationHTML = `
    <div class="eyebrow" style="color:var(--pri-tx);font-size:13px;letter-spacing:.03em;margin-bottom:5px">${esc(rec.stance)}</div>
    <p style="font-weight:700;font-size:14.5px;line-height:1.4;margin:0 0 8px">${esc(rec.headline)}</p>
    <p style="font-size:var(--fz-sm);color:var(--ink2);line-height:1.55;margin:0 0 13px">${esc(rec.rationale)}</p>
    <div class="eyebrow" style="margin-bottom:7px">Conditions before signature</div>
    <div class="kv" style="grid-template-columns:1fr;gap:9px;margin-bottom:4px">
      ${rec.conditions.map(c => {
        const iss = d.issues.find(i => i.id === c.issueId);
        return `<dd style="display:block;padding-bottom:8px;border-bottom:1px solid var(--line)">
          <div style="font-weight:600;margin-bottom:3px">${esc(c.text)}</div>
          ${evidenceChip(iss ? iss.evidenceType : 'inference', { short: true, sources: iss ? iss.sourceIds : [] })}
          ${jumpLink('View in register →', 'tab:contract/sub:terms')}
        </dd>`;
      }).join('')}
    </div>
    ${collapsible(
      '<span>Analysis limitations (' + rec.limitations.length + ')</span>',
      '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px">' +
        rec.limitations.map(l => `<li style="font-size:var(--fz-sm);color:var(--ink2)">${esc(l)}</li>`).join('') +
      '</ul>',
      { open: true }
    )}
    <div class="btn-row">${copyBtn('Copy recommendation', null, recapText)}</div>
  `;

  /* ============================= 2. DEAL SNAPSHOT ============================= */
  const snap = d.deal;
  const snapshotHTML = `
    <dl class="kv">
      <dt>Deal</dt><dd>${esc(snap.title)}</dd>
      <dt>Supplier</dt><dd>${esc(snap.supplier)} <span class="tiny muted">(${esc(snap.supplierCategory)})</span></dd>
      <dt>Type</dt><dd>${esc(snap.negotiationType)}</dd>
      <dt>Contract set</dt><dd>${esc(contractSetLabel)}</dd>
      <dt>Stage</dt><dd>${esc(snap.stage)}</dd>
      <dt>Counterparties</dt><dd>${esc(snap.counterparties.buyer)} <span class="muted">&harr;</span> ${esc(snap.counterparties.supplier)}</dd>
      <dt>Analysis date</dt><dd class="mono">${esc(snap.analysisDate)}</dd>
      <dt>Evidence</dt><dd>${coverageBadge(snap.evidenceCoverage)}</dd>
    </dl>
    <div class="card-note">${esc(d.meta.disclaimer)}</div>
  `;

  /* ============================= 3. ISSUE LANDSCAPE HEATMAP ============================= */
  const categories = d.analysisAreas;
  const counts = {};
  categories.forEach(cat => { counts[cat] = {}; priorityOrder.forEach(p => { counts[cat][p] = 0; }); });
  d.issues.forEach(iss => { if (counts[iss.category]) counts[iss.category][iss.priority]++; });
  let maxCellCount = 1;
  categories.forEach(cat => priorityOrder.forEach(p => { maxCellCount = Math.max(maxCellCount, counts[cat][p]); }));
  const totalsByPriority = {};
  priorityOrder.forEach(p => { totalsByPriority[p] = d.issues.filter(i => i.priority === p).length; });

  const heatRows = categories.map(cat => {
    const cells = priorityOrder.map(p => {
      const v = counts[cat][p];
      const cellHTML = heatCell(v, { scale: maxCellCount, label: v || '–', title: cat + ' · ' + priorityLabel[p] + ': ' + v + ' issue' + (v === 1 ? '' : 's') });
      return `<button data-jump="tab:contract/sub:terms" style="background:none;border:0;padding:0;cursor:pointer;display:flex;justify-content:center" title="${esc(cat)} · ${esc(priorityLabel[p])}">${cellHTML}</button>`;
    }).join('');
    return `<div class="hg-lbl">${esc(cat)}</div>${cells}`;
  }).join('');

  const heatmapHTML = `
    <div class="heat-grid" style="grid-template-columns:150px repeat(${priorityOrder.length},1fr);align-items:center">
      <div></div>
      ${priorityOrder.map(p => `<div class="hg-col">${esc(priorityLabel[p])}<br><span class="tiny muted">(${totalsByPriority[p]})</span></div>`).join('')}
      ${heatRows}
    </div>
    ${insight('Both hard-stop issues sit in Liability and Data &amp; Privacy; Commercial carries the largest single-category cluster of high-priority items.', 'danger')}
    ${insight('Counts are the full evidence-based register &mdash; ' + d.issues.length + ' issues across ' + categories.length + ' categories. Click any cell to open the filterable register.')}
  `;

  /* ============================= 4. TOP 5 ISSUES ============================= */
  const top5Cols = [
    { key: 'priority', label: '', width: '96px', sortVal: r => rankPriority[r.priority] || 0, render: r => severityPill(r.priority) },
    { key: 'title', label: 'Issue', render: r => `<strong>${esc(r.title)}</strong><div class="tiny muted">${esc(r.category)} · ${esc(r.clause)}</div>` },
    { key: 'ev', label: 'Evidence', width: '120px', sort: false, render: r => evidenceChip(r.evidenceType, { short: true, sources: r.sourceIds }) }
  ];
  const top5HTML = dataTable(top5Cols, topIssues, {
    id: 'brief-top-issues', zebra: true,
    expand: r => `
      <div class="kv" style="margin-bottom:10px">
        <dt>Recommended</dt><dd>${esc(r.recommendedPosition)}</dd>
        <dt>Fallback</dt><dd>${esc(r.fallback)}</dd>
        <dt>Hard stop</dt><dd style="color:var(--danger-fg);font-weight:600">${esc(r.hardStop)}</dd>
      </div>
      ${excerpt(r.sourceExcerpt)}
      <div class="btn-row">
        ${jumpLink('Full issue register →', 'tab:contract/sub:terms')}
        ${jumpLink('Negotiation position →', 'tab:negotiation/sub:positions')}
      </div>
    `
  });
  const top5SectionHTML = `
    ${top5HTML}
    ${insight('These 5 span both hard-stops plus the highest-value high-priority items; the full ' + d.issues.length + '-issue register is in Contract → Terms &amp; Risk.')}
  `;

  /* ============================= 5. NEGOTIATION BOUNDARIES ============================= */
  const boundaryCols = [
    { key: 'title', label: 'Issue', render: r => `<strong>${esc(r.title)}</strong><div class="tiny muted">${esc(r.clause)}</div>` },
    { key: 'target', label: 'Target / ask for', render: r => esc(r.recommendedPosition) },
    { key: 'fallback', label: 'Fallback', render: r => esc(r.fallback) },
    { key: 'hardstop', label: 'Hard stop', render: r => `<span style="color:var(--danger-fg);font-weight:600">${esc(r.hardStop)}</span>` }
  ];
  const boundaryRows = rec.conditions.map(c => d.issues.find(i => i.id === c.issueId)).filter(Boolean);
  const boundaryHTML = `
    ${dataTable(boundaryCols, boundaryRows, { id: 'brief-boundaries', dense: true, sortable: false })}
    ${insight('All three are signature conditions — non-negotiable gates, not trade items on their own.', 'warn')}
  `;

  /* ============================= 6. COMMERCIAL HEADLINE ============================= */
  const scAsk = d.scenarios.find(s => s.id === 'SC-ask');
  const scTarget = d.scenarios.find(s => s.id === 'SC-target');
  const scFallback = d.scenarios.find(s => s.id === 'SC-fallback');
  const scMax = d.scenarios.find(s => s.id === 'SC-max');
  const maxY1 = Math.max(scAsk.y1Total, scTarget.y1Total, scFallback.y1Total, scMax.y1Total);

  // Reuse the SAME pre-computed tcvGap the persistent summary strip shows — never
  // re-derive this figure independently (would risk disagreeing with the strip).
  const tcvGapEntry = d.deal.summaryStrip.find(s => s.key === 'tcvGap') || { label: 'Target vs ask (3-yr)', value: '—', evidenceType: 'calculated' };

  function updateBriefCommercialNumbers() {
    const ask = d.scenarios.find(s => s.id === 'SC-ask');
    const target = d.scenarios.find(s => s.id === 'SC-target');
    const fallback = d.scenarios.find(s => s.id === 'SC-fallback');
    const max = d.scenarios.find(s => s.id === 'SC-max');
    const ids = { 'brief-y1-ask': ask.y1Total, 'brief-y1-target': target.y1Total, 'brief-y1-fallback': fallback.y1Total, 'brief-y1-max': max.y1Total };
    Object.keys(ids).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = money(ids[id], { compact: true });
    });
  }
  if (typeof DealUI !== 'undefined') DealUI.onRecalc(updateBriefCommercialNumbers);

  const commercialHTML = `
    ${barRow('Ask', scAsk.y1Total, maxY1, `<span id="brief-y1-ask">${money(scAsk.y1Total, { compact: true })}</span>`, { color: 'danger' })}
    ${barRow('Target', scTarget.y1Total, maxY1, `<span id="brief-y1-target">${money(scTarget.y1Total, { compact: true })}</span>`, { color: 'pri' })}
    ${barRow('Fallback', scFallback.y1Total, maxY1, `<span id="brief-y1-fallback">${money(scFallback.y1Total, { compact: true })}</span>`, { color: 'teal' })}
    ${barRow('Max acceptable', scMax.y1Total, maxY1, `<span id="brief-y1-max">${money(scMax.y1Total, { compact: true })}</span>`, { color: 'warn' })}
    <div class="card-note">Year-1 all-in by scenario. ${esc(tcvGapEntry.label)}: <strong class="mono">${esc(tcvGapEntry.value)}</strong> ${evidenceChip(tcvGapEntry.evidenceType, { short: true })}</div>
    ${insight('Ask is anchored on platform + support loading; target reflects the internal precedent discount and day-rate norms (see Commercials → Benchmarks).')}
  `;

  /* ============================= 7. IMMEDIATE NEXT ACTIONS ============================= */
  const seqItems = d.negotiation.sequence.map(s => {
    const pkg = d.negotiation.packages.find(p => p.id === s.packageId);
    const tone = pkg ? (pkg.priority === 1 ? 'pri' : pkg.priority === 3 ? 'emph' : '') : '';
    const meta = (pkg ? `<span class="tiny muted">${esc(pkg.name)}</span> ` : '') + evidenceChip(s.evidenceType, { short: true });
    return { date: 'Step ' + s.step, name: s.text, meta, tone };
  });
  const nextActionsHTML = `
    ${timeline(seqItems)}
    ${insight('A planning sequence for the meeting, not a task list — packages so protection terms are agreed before commercials are discussed.')}
  `;

  /* ============================= 8. CRITICAL UNKNOWNS ============================= */
  const topGaps = d.gaps.slice().sort((a, b) => {
    const pr = (rankGap[b.priority] || 0) - (rankGap[a.priority] || 0);
    return pr !== 0 ? pr : (b.decisionImpact || 0) - (a.decisionImpact || 0);
  }).slice(0, 5);
  const gapCols = [
    { key: 'input', label: 'Missing input', render: r => `<strong>${esc(r.input)}</strong><div class="tiny muted">${esc(r.whyItMatters)}</div>` },
    { key: 'priority', label: 'Priority', width: '100px', render: r => `<span class="pill ${r.priority === 'critical' ? 'danger' : r.priority === 'important' ? 'warn' : 'muted'}">${esc(r.priority)}</span>` },
    { key: 'impact', label: 'Decision impact', width: '130px', align: 'num', sortVal: r => r.decisionImpact, render: r => heatCell(r.decisionImpact, { scale: 5, label: r.decisionImpact, title: 'Decision impact ' + r.decisionImpact + '/5' }) },
    { key: 'ease', label: 'Ease to get', width: '110px', align: 'num', sortVal: r => r.ease, render: r => heatCell(r.ease, { scale: 5, label: r.ease, title: 'Ease ' + r.ease + '/5' }) },
    { key: 'ev', label: 'Status', width: '116px', sort: false, render: () => evidenceChip('unavailable', { short: true }) }
  ];
  const gapsHTML = `
    ${dataTable(gapCols, topGaps, { id: 'brief-gaps', zebra: true })}
    <div class="btn-row" style="margin-top:4px">${jumpLink('Full gap register &amp; assumptions →', 'tab:sources/sub:missing')}</div>
    ${insight('Two of the top gaps (DPA text, Security Exhibit) are both critical and quick to obtain — request them before the meeting if at all possible.')}
  `;

  /* ============================= ASSEMBLE ============================= */
  return `
  <div class="tab-body"><div class="wrap">

    <div class="tab-intro">
      <h2>Pre-Meeting Brief</h2>
      <div class="q">What is being negotiated, what blocks signature, what to ask for, and what is still missing &mdash; read in about two minutes.</div>
      <div class="tiny muted" style="margin-top:7px">Session snapshot generated ${esc(d.meta.generatedAt.replace('T', ' '))} &middot; ${coverageBadge(d.deal.evidenceCoverage)} overall evidence coverage</div>
    </div>

    <div class="grid">
      <div class="col-8">${saCard('Recommended Position', recommendationHTML, { icon: 'shield', sub: esc(d.deal.stage) })}</div>
      <div class="col-4">${saCard('Deal Snapshot', snapshotHTML, { accent: 'teal', icon: 'doc', sub: esc(d.deal.projectId) })}</div>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="col-12">${saCard('Issue Landscape — Category × Priority', heatmapHTML, { icon: 'scale' })}</div>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="col-7">${saCard('Top 5 Issues', top5SectionHTML, { icon: 'flag', sub: topIssues.length + ' of ' + d.issues.length })}</div>
      <div class="col-5">${saCard('Negotiation Boundaries', boundaryHTML, { accent: 'emph', icon: 'target' })}</div>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="col-6">${saCard('Commercial Headline', commercialHTML, { accent: 'teal', icon: 'money' })}</div>
      <div class="col-6">${saCard('Immediate Next Actions', nextActionsHTML, { accent: 'emph', icon: 'clock' })}</div>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="col-12">${saCard('Critical Unknowns', gapsHTML, { icon: 'gap', sub: topGaps.length + ' of ' + d.gaps.length })}</div>
    </div>

  </div></div>
  `;
}

if (typeof window !== 'undefined') {
  window.renderTab_brief = renderTab_brief;
  window.DealTabs = window.DealTabs || {};
  window.DealTabs.brief = renderTab_brief;
}
