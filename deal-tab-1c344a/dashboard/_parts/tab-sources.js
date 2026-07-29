/* =============================================================================
 * tab-sources.js — "Sources & Gaps" primary tab.
 * Subtabs: Sources (inventory + coverage matrix) · Assumptions (register +
 * classification + impact ranking) · Missing Inputs (ranked gaps + impact/ease
 * matrix + a plain future-ready list).
 *
 * Reads ONLY from dashboardData (param d). No fact is restated/hard-coded here
 * that isn't already in the model — this tab is the honesty layer for every
 * other tab's evidence chips.
 * ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- local helpers (not exported — scoped to this file) ---------- */

  // materiality/priority -> pill using the shared .pill modifier classes
  function gapPriorityPill(p) {
    var map = { critical: ['danger', 'Critical'], important: ['warn', 'Important'], helpful: ['info', 'Helpful'] };
    var m = map[p] || ['muted', p];
    return '<span class="pill ' + m[0] + '">' + esc(m[1]) + '</span>';
  }

  // best-effort jump target for a cross-reference id or "Tab/Subtab" label found
  // in usedIn[] / affectedAnalysis[] arrays.
  function pathJump(text) {
    var t = String(text || '').toLowerCase();
    if (/^iss-/.test(t)) return 'tab:contract/sub:terms';
    // all commercial analyses (lines, scenarios, benchmarks) now live on the Deal Table & ZOPA subtab
    if (/^sc-/.test(t)) return 'tab:commercials/sub:deal';
    if (/^cl-/.test(t)) return 'tab:commercials/sub:deal';
    if (/^bench-/.test(t)) return 'tab:commercials/sub:deal';
    if (t.indexOf('terms & risk') !== -1 || t === 'issues') return 'tab:contract/sub:terms';
    if (t.indexOf('scope') !== -1 || t.indexOf('sla') !== -1) return 'tab:contract/sub:scope';
    if (t.indexOf('scenario') !== -1) return 'tab:commercials/sub:deal';
    if (t.indexOf('benchmark') !== -1) return 'tab:commercials/sub:deal';
    if (t.indexOf('sources') !== -1) return 'tab:sources/sub:sources';
    return null;
  }
  function analysisTag(text) {
    var j = pathJump(text);
    return j ? jumpLink(text, j) : '<span class="tiny muted">' + esc(text) + '</span>';
  }

  // source coverage x analysis-area heat grid (flat CSS-grid children — matches .heat-grid)
  function buildCoverageMatrix(d) {
    var areas = d.analysisAreas;
    var strength = { contract: 5, internal: 4, calculated: 4, public: 3, inference: 2, assumption: 2, unavailable: 0 };
    var evLabel = { contract: 'Contract fact', internal: 'Internal fact', public: 'Public fact', calculated: 'Calculated', inference: 'Claude inference', assumption: 'User assumption', unavailable: 'Unavailable' };
    var cells = '<div class="hg-lbl"></div>' + areas.map(function (a) { return '<div class="hg-col">' + esc(a) + '</div>'; }).join('');
    d.sources.forEach(function (src) {
      cells += '<div class="hg-lbl" title="' + esc(src.label + ', ' + src.detail) + '">' + esc(src.id) + '</div>';
      areas.forEach(function (a) {
        var covers = src.coverage.indexOf(a) !== -1;
        if (!covers) {
          cells += '<span class="heatcell heat-0" title="' + esc(src.label + ' does not cover ' + a) + '">–</span>';
        } else if (src.evidenceType === 'unavailable') {
          cells += heatCell(0, { label: '?', title: src.label + ' references "' + a + '" but the document was not provided this session, coverage there is unverified.' });
        } else {
          var lvl = strength[src.evidenceType] != null ? strength[src.evidenceType] : 2;
          cells += heatCell(lvl, { label: '●', title: src.label + ' → ' + a + ' · ' + (evLabel[src.evidenceType] || src.evidenceType) });
        }
      });
    });
    return '<div class="heat-grid" style="grid-template-columns:150px repeat(' + areas.length + ',1fr)">' + cells + '</div>';
  }

  function buildSourceKindBars(d) {
    var kindLabel = { contract: 'Contract documents', playbook: 'Playbook', template: 'Template', m365: 'M365 / correspondence', finance: 'Finance', web: 'Public web' };
    var kindColor = { contract: 'pri', playbook: 'teal', template: 'teal', m365: 'teal', finance: 'teal', web: 'warn' };
    var counts = {};
    d.sources.forEach(function (s) { counts[s.kind] = (counts[s.kind] || 0) + 1; });
    var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    var max = Math.max.apply(null, keys.map(function (k) { return counts[k]; })) || 1;
    return keys.map(function (k) {
      return barRow(kindLabel[k] || k, counts[k], max, String(counts[k]), { color: kindColor[k] || 'teal' });
    }).join('');
  }

  /* ---------- subtab 1: Sources --------------------------------------------- */
  function buildSourcesPanel(d) {
    var missingSrc = d.sources.filter(function (s) { return s.evidenceType === 'unavailable'; });
    var areaCounts = d.analysisAreas.map(function (a) {
      return { area: a, n: d.sources.filter(function (s) { return s.coverage.indexOf(a) !== -1 && s.evidenceType !== 'unavailable'; }).length };
    });
    var weakest = areaCounts.slice().sort(function (a, b) { return a.n - b.n; })[0];
    var strongestSrc = d.sources.slice().sort(function (a, b) { return b.coverage.length - a.coverage.length; })[0];

    var matrixCard = saCard('Source Coverage: by Analysis Area', buildCoverageMatrix(d), {
      accent: 'teal', icon: 'sources', id: 'src-matrix',
      sub: d.sources.length + ' sources · ' + d.analysisAreas.length + ' areas'
    });

    var kindCard = saCard('Sources by Kind', buildSourceKindBars(d), { icon: 'bench', sub: d.sources.length + ' total' });

    var tableCard = saCard('Source Inventory', '' +
      '<div class="toolbar" data-filter-scope>' +
        '<input type="search" placeholder="Filter sources…" data-filter-input data-filter-for="tbl-sources">' +
        '<span class="spacer"></span><span class="filter-count"></span>' +
      '</div>' +
      dataTable([
        { key: 'id', label: 'ID', width: '80px' },
        { key: 'label', label: 'Source', render: function (r) { return '<strong>' + esc(r.label) + '</strong><div class="tiny muted">' + esc(r.detail) + '</div>'; } },
        { key: 'kind', label: 'Kind', render: function (r) { return '<span style="text-transform:capitalize">' + esc(r.kind) + '</span>'; } },
        { key: 'coverage', label: 'Areas', align: 'num', sortVal: function (r) { return r.coverage.length; }, render: function (r) { return String(r.coverage.length); } },
        { key: 'evidenceType', label: 'Evidence', render: function (r) { return evidenceChip(r.evidenceType, { short: true }); } }
      ], d.sources, {
        id: 'tbl-sources', zebra: true,
        expand: function (r) {
          return '<div class="kv"><dt>Coverage areas</dt><dd>' + r.coverage.map(function (a) { return '<span class="tiny">' + esc(a) + '</span>'; }).join(', ') +
            '</dd><dt>Detail</dt><dd>' + esc(r.detail) + '</dd><dt>Evidence</dt><dd>' + evidenceChip(r.evidenceType) + '</dd></div>';
        }
      }),
      { icon: 'doc', sub: 'click a row to expand' });

    var gapNote = missingSrc.length ? gapCard(
      missingSrc.length + ' referenced source' + (missingSrc.length === 1 ? '' : 's') + ' not provided this session',
      'Referenced but unavailable: ' + missingSrc.map(function (s) { return jumpLink(s.id, 'el:' + s.id); }).join(', ') +
      '. Coverage on their analysis areas rests on inference from the surrounding contract text, not a reviewed document.'
    ) : '';

    var insights = [
      insight('The weakest-covered analysis area is <strong>' + esc(weakest.area) + '</strong> (' + weakest.n + ' verified source' + (weakest.n === 1 ? '' : 's') + '): treat conclusions there as directional.', 'warn'),
      insight('<strong>' + esc(strongestSrc.label) + '</strong> carries the broadest coverage (' + strongestSrc.coverage.length + ' of ' + d.analysisAreas.length + ' areas) and is the primary anchor for this analysis.'),
      insight('Overall evidence coverage for this deal is rated <strong>' + esc(d.deal.evidenceCoverage) + '</strong>' +
        (missingSrc.length ? ', strong on terms already in hand, limited wherever ' + missingSrc.map(function (s) { return s.id; }).join(' / ') + ' would otherwise apply.' : '.'))
    ].join('');

    return '<div class="grid">' +
      '<div class="col-12">' + matrixCard + '</div>' +
      '<div class="col-7">' + tableCard + '</div>' +
      '<div class="col-5">' + kindCard + '<div style="margin-top:16px">' + saCard('Evidence Notes', insights + gapNote, { icon: 'info', accent: 'emph' }) + '</div></div>' +
    '</div>';
  }

  /* ---------- subtab 2: Assumptions ----------------------------------------- */
  function buildAssumptionsPanel(d) {
    var weight = { high: 3, medium: 2, low: 1 };
    var ranked = d.assumptions.slice().sort(function (a, b) {
      return (weight[b.materiality] || 0) - (weight[a.materiality] || 0) || b.usedIn.length - a.usedIn.length;
    });
    var maxReach = Math.max.apply(null, d.assumptions.map(function (a) { return a.usedIn.length; })) || 1;

    var rankCard = saCard('Impact Ranking: Materiality × Downstream Reach', ranked.map(function (a) {
      return barRow(a.label + ' (' + a.materiality + ')', a.usedIn.length, maxReach, a.usedIn.length + ' use' + (a.usedIn.length === 1 ? '' : 's'),
        { color: a.materiality === 'high' ? 'emph' : a.materiality === 'medium' ? 'teal' : 'pri' });
    }).join(''), { accent: 'teal', icon: 'target', sub: d.assumptions.length + ' local inputs' });

    var registerCard = saCard('Assumption Register (editable: Local)', d.assumptions.map(function (a) { return assumptionSlider(a); }).join(''), {
      accent: 'emph', icon: 'assume', sub: 'drag to test scenarios'
    });

    var tableCard = saCard('Assumption Detail', dataTable([
      { key: 'id', label: 'ID', width: '64px' },
      { key: 'label', label: 'Assumption' },
      { key: 'value', label: 'Value', align: 'num', sortVal: function (a) { return a.value; }, render: function (a) {
          return '<span data-asm-live="' + esc(a.id) + '">' + (a.unit === '%' ? a.value + '%' : a.value.toLocaleString('en-US') + (a.unit ? ' ' + a.unit : '')) + '</span>';
        } },
      { key: 'classification', label: 'Classification', render: function (a) { return evidenceChip(a.evidenceType || a.classification, { short: true }); } },
      { key: 'materiality', label: 'Materiality', render: function (a) { return severityPill(a.materiality); } },
      { key: 'usedIn', label: 'Feeds', render: function (a) { return a.usedIn.map(analysisTag).join(' '); } }
    ], d.assumptions, {
      id: 'tbl-assumptions', zebra: true,
      expand: function (a) {
        return '<div class="kv"><dt>Range</dt><dd>' + a.min + '–' + a.max + ' ' + esc(a.unit || '') + ' (step ' + a.step + ')</dd>' +
          '<dt>Used in</dt><dd>' + a.usedIn.map(analysisTag).join(' ') + '</dd></div>';
      }
    }), { icon: 'doc' });

    var nUser = d.assumptions.filter(function (a) { return a.classification === 'assumption'; }).length;
    var nInternal = d.assumptions.filter(function (a) { return a.classification === 'internal'; }).length;
    var nContract = d.assumptions.filter(function (a) { return a.classification === 'contract'; }).length;
    var highs = d.assumptions.filter(function (a) { return a.materiality === 'high'; });

    var insights = [
      insight(nUser + ' of ' + d.assumptions.length + ' inputs are user assumptions (editable, Local) rather than contract or internal facts; ' +
        nContract + ' come straight from the contract and ' + nInternal + ' from internal finance.', nUser ? 'warn' : ''),
      highs.length ? insight('High-materiality: ' + highs.map(function (a) { return esc(a.label); }).join(', ') + ', small changes here move the scenario totals the most.') : '',
      insight('Sliders here are Local: editing one live-updates every dependent total (scenarios, 3-yr TCV) wherever it is used across this artifact.')
    ].filter(Boolean).join('');

    return '<div class="grid">' +
      '<div class="col-7">' + rankCard + '</div>' +
      '<div class="col-5">' + registerCard + '</div>' +
      '<div class="col-12">' + tableCard + '</div>' +
      '<div class="col-12">' + saCard('Evidence Notes', insights, { icon: 'info', accent: 'emph' }) + '</div>' +
    '</div>';
  }

  /* ---------- subtab 3: Missing Inputs (gaps) ------------------------------- */
  function buildGapsPanel(d) {
    var points = d.gaps.map(function (g) {
      return {
        x: g.ease, y: g.decisionImpact, label: g.id.replace('GAP-', ''),
        color: g.priority === 'critical' ? 'danger' : g.priority === 'important' ? 'emph' : 'teal',
        title: g.input + ', ' + g.priority + ' · impact ' + g.decisionImpact + '/5, ease ' + g.ease + '/5',
        jump: 'el:' + g.id
      };
    });
    var matrixCard = saCard('Decision Impact Vs. Ease to Obtain', matrixPlot(points, {
      xLabel: 'Ease to obtain →', yLabel: 'Decision impact →', xMax: 5, yMax: 5,
      quadrants: ['Hard, high stakes', 'Quick win: get first', 'Low priority', 'Easy, low value']
    }), { accent: 'danger', icon: 'gap', sub: d.gaps.length + ' open inputs' });

    var counts = { critical: 0, important: 0, helpful: 0 };
    d.gaps.forEach(function (g) { counts[g.priority] = (counts[g.priority] || 0) + 1; });
    var maxC = Math.max(counts.critical, counts.important, counts.helpful) || 1;
    var countsCard = saCard('Gaps by Priority',
      barRow('Critical', counts.critical, maxC, String(counts.critical), { color: 'danger' }) +
      barRow('Important', counts.important, maxC, String(counts.important), { color: 'warn' }) +
      barRow('Helpful', counts.helpful, maxC, String(counts.helpful), { color: 'teal' }),
      { icon: 'flag' });

    var tableCard = saCard('Missing-input Register', '' +
      '<div class="toolbar" data-filter-scope>' +
        '<input type="search" placeholder="Filter missing inputs…" data-filter-input data-filter-for="tbl-gaps">' +
        '<span class="spacer"></span><span class="filter-count"></span>' +
      '</div>' +
      dataTable([
        { key: 'priority', label: 'Priority', render: function (g) { return gapPriorityPill(g.priority); }, sortVal: function (g) { return ({ critical: 3, important: 2, helpful: 1 })[g.priority] || 0; } },
        { key: 'input', label: 'Missing input', render: function (g) { return '<strong id="' + esc(g.id) + '">' + esc(g.input) + '</strong>'; } },
        { key: 'decisionImpact', label: 'Impact', align: 'num', sortVal: function (g) { return g.decisionImpact; }, render: function (g) { return heatCell(g.decisionImpact, { title: 'Decision impact ' + g.decisionImpact + '/5' }); } },
        { key: 'ease', label: 'Ease', align: 'num', sortVal: function (g) { return g.ease; }, render: function (g) { return heatCell(g.ease, { title: 'Ease to obtain ' + g.ease + '/5' }); } },
        { key: 'possibleSource', label: 'Possible source' },
        { key: 'evidenceType', label: 'Status', render: function (g) { return evidenceChip(g.evidenceType, { short: true }); } }
      ], d.gaps, {
        id: 'tbl-gaps', zebra: true,
        expand: function (g) {
          return '<div class="kv"><dt>Why it matters</dt><dd>' + esc(g.whyItMatters) + '</dd>' +
            '<dt>Possible source</dt><dd>' + esc(g.possibleSource) + '</dd>' +
            '<dt>Affects</dt><dd>' + g.affectedAnalysis.map(analysisTag).join(' ') + '</dd></div>';
        }
      }),
      { icon: 'doc' });

    var helpful = d.gaps.filter(function (g) { return g.priority === 'helpful'; });
    var futureCard = helpful.length ? saCard('Future-ready Inputs (nice-to-have)',
      '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:9px">' +
        helpful.map(function (g) {
          return '<li><strong>' + esc(g.input) + '</strong>, ' + esc(g.whyItMatters) +
            '<div class="tiny muted">Possible source: ' + esc(g.possibleSource) + '</div></li>';
        }).join('') +
      '</ul>',
      { accent: 'teal', icon: 'clock', sub: helpful.length + ' item' + (helpful.length === 1 ? '' : 's') }) : '';

    var critical = d.gaps.filter(function (g) { return g.priority === 'critical'; });
    var quickWins = d.gaps.filter(function (g) { return g.ease >= 4 && g.decisionImpact >= 4; });
    var affectedSet = {};
    d.gaps.forEach(function (g) { (g.affectedAnalysis || []).forEach(function (x) { affectedSet[x] = 1; }); });

    var insights = [
      critical.length ? insight(critical.length + ' critical gap' + (critical.length === 1 ? '' : 's') + ', ' +
        critical.map(function (g) { return jumpLink(g.input, 'el:' + g.id); }).join(', ') +
        ', sit upstream of a signature condition or the commercial anchor.', 'danger') : '',
      quickWins.length ? insight('Quick wins (high impact, easy to obtain): ' + quickWins.map(function (g) { return esc(g.input); }).join(', ') + ', worth chasing before the next draft.') : '',
      insight(d.gaps.length + ' inputs are marked unavailable, touching ' + Object.keys(affectedSet).length + ' downstream analyses across the artifact.')
    ].filter(Boolean).join('');

    return '<div class="grid">' +
      '<div class="col-7">' + matrixCard + '</div>' +
      '<div class="col-5">' + countsCard + '<div style="margin-top:16px">' + saCard('Evidence Notes', insights, { icon: 'info', accent: 'emph' }) + '</div></div>' +
      '<div class="col-12">' + tableCard + '</div>' +
      (futureCard ? '<div class="col-12">' + futureCard + '</div>' : '') +
    '</div>';
  }

  /* ---------- tab entry point ------------------------------------------------ */
  function renderTab_sources(d) {
    var introRight = coverageBadge(d.deal.evidenceCoverage);

    var sourcesHtml = buildSourcesPanel(d);
    var assumptionsHtml = buildAssumptionsPanel(d);
    var gapsHtml = buildGapsPanel(d);

    return '' +
      '<div class="tab-body"><div class="wrap">' +
        '<div class="tab-intro" style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
          '<div>' +
            '<h2>Sources &amp; Gaps</h2>' +
            '<p class="q">Where every fact, figure, and assumption in this snapshot came from, and what is still missing before signature. This is the evidence layer behind every chip on the other four tabs.</p>' +
          '</div>' +
          '<div>' + introRight + '</div>' +
        '</div>' +
      '</div></div>' +
      '<div class="subtabbar" data-subtab-group="sources"><div class="wrap">' +
        '<button class="subtab-btn" data-subtab="sources" aria-selected="true">Sources</button>' +
        '<button class="subtab-btn" data-subtab="assumptions" aria-selected="false">Assumptions</button>' +
        '<button class="subtab-btn" data-subtab="gaps" aria-selected="false">Missing Inputs</button>' +
      '</div></div>' +
      '<div class="tab-body"><div class="wrap">' +
        '<div data-subpanel="sources/sources" class="is-active">' + sourcesHtml + '</div>' +
        '<div data-subpanel="sources/assumptions">' + assumptionsHtml + '</div>' +
        '<div data-subpanel="sources/gaps">' + gapsHtml + '</div>' +
      '</div></div>';
  }

  // live-update the Assumptions detail table's value cells on every recalc
  // (assumptionSlider() already wires its own [data-asm-out] label via helpers.js;
  // this covers the separate table copy of the same value).
  if (global.DealUI && typeof global.DealUI.onRecalc === 'function') {
    global.DealUI.onRecalc(function (dd) {
      (dd.assumptions || []).forEach(function (a) {
        var nodes = document.querySelectorAll('[data-asm-live="' + a.id + '"]');
        nodes.forEach(function (el) {
          el.textContent = a.unit === '%' ? a.value + '%' : (a.value.toLocaleString('en-US') + (a.unit ? ' ' + a.unit : ''));
        });
      });
    });
  }

  global.renderTab_sources = renderTab_sources;
  global.DealTabs = global.DealTabs || {};
  global.DealTabs.sources = renderTab_sources;

})(typeof window !== 'undefined' ? window : this);
