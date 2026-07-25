/* =============================================================================
 * shell.js, builds the 4-tab skeleton + persistent strip, injects each
 * DealTabs builder, then hands off to DealUI.init() (helpers.js) for wiring.
 *
 * The 4-tab redesign (Overview / Terms & Review / Economics / Negotiation)
 * PRESERVES the data-jump namespace: the panel keys stay brief / contract /
 * commercials / negotiation, so every existing data-jump="tab:.../sub:..."
 * string keeps working; only the DISPLAY labels change. The old 5th tab
 * (Sources & Gaps) is folded into Overview + Economics, so it is not mounted.
 *
 * Load order in the artifact: helpers.js -> data.js -> tab-*.js -> shell.js.
 * shell.js runs mount() SYNCHRONOUSLY at parse (the #app div precedes it), so
 * the DOM exists before it calls DealUI.init(); helpers' own DOMContentLoaded
 * auto-init is a guarded no-op after that.
 * ========================================================================== */
(function (global) {
  'use strict';
  var d = global.dashboardData || {};
  var deal = d.deal || {};

  var TABS = [
    { key: 'brief',       label: 'Overview',       icon: 'brief' },
    { key: 'contract',    label: 'Terms & Review', icon: 'shield' },
    { key: 'commercials', label: 'Economics',      icon: 'money' },
    { key: 'negotiation', label: 'Negotiation',    icon: 'handshake' }
  ];

  var esc = global.esc || function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var ic = global.icon || function () { return ''; };

  /* ---- header title block (platform sa-title family) ---- */
  var buyer = (deal.counterparties && deal.counterparties.buyer) || 'Eli Lilly and Company';
  var titleHTML =
    '<div class="sa-title">' +
      '<div class="eyebrow">Deal &middot; Contract Negotiation</div>' +
      '<h1>' + esc(deal.title || 'Deal') + '</h1>' +
      '<div class="dh-sub">' + esc(buyer) + ' &harr; ' + esc(deal.supplier || '') +
        (deal.negotiationType ? ' &middot; ' + esc(deal.negotiationType) : '') +
        ' &middot; session snapshot, advisory only, not a system of record</div>' +
    '</div>';

  /* ---- persistent strip: <=5 counts only. The who-has-the-pen chip + coverage
   * badge used to lead the strip (ss-lead) but that overflowed into a horizontal
   * scrollbar; that context now renders as a pen band atop Overview (tab-brief.js).
   * penChip() is kept for reuse elsewhere; it is simply no longer called here. ---- */
  function penChip(p) {
    if (!p) return '';
    var conf = String(p.confidence || '').toLowerCase();
    return '<span class="pen-chip pen-' + esc(conf) + '" ' +
      'title="Who currently holds the redline, best-effort read from communications">' +
      '<span class="pen-k">Pen</span><b>' + esc(p.party || '—') + '</b>' +
      (p.basis ? '<span class="pen-basis">' + esc(p.basis) + '</span>' : '') +
      (p.confidence ? '<span class="pen-conf">' + esc(p.confidence) + '</span>' : '') +
    '</span>';
  }
  function stripCounts() {
    return (deal.summaryStrip || []).slice(0, 5).map(function (s) {
      return '<button class="ss-item tone-' + esc(s.tone) + '" data-jump="' + esc(s.jump) + '">' +
        '<span class="ss-val">' + esc(s.value) + '</span>' +
        '<span class="ss-lbl">' + esc(s.label) + '</span></button>';
    }).join('');
  }

  var tabbar =
    '<div class="tabbar"><div class="wrap">' +
      TABS.map(function (t, i) {
        return '<button class="tab-btn" data-tab="' + t.key + '" ' +
          'aria-selected="' + (i === 0 ? 'true' : 'false') + '">' + ic(t.icon) + esc(t.label) + '</button>';
      }).join('') +
    '</div></div>';

  var panels = TABS.map(function (t, i) {
    return '<div data-tabpanel="' + t.key + '"' + (i === 0 ? ' class="is-active"' : '') + '></div>';
  }).join('');

  var skeleton =
    '<main class="sa-main">' + titleHTML +
      '<div class="sticky-head">' +
        '<div class="summary-strip"><div class="wrap">' +
          '<div class="ss-counts" id="ss"></div></div></div>' +
        tabbar +
      '</div>' +
      panels +
    '</main>';

  function mount() {
    var app = document.getElementById('app') || document.body;
    app.innerHTML = skeleton;
    var ss = document.getElementById('ss');
    if (ss) ss.innerHTML = stripCounts();
    TABS.forEach(function (t) {
      var panel = document.querySelector('[data-tabpanel="' + t.key + '"]');
      var fn = global.DealTabs && global.DealTabs[t.key];
      if (panel && typeof fn === 'function') {
        try { panel.innerHTML = fn(d); }
        catch (e) {
          panel.innerHTML = '<div class="wrap"><pre style="color:var(--danger);padding:16px;white-space:pre-wrap">' +
            esc((e && e.stack) || e) + '</pre></div>';
        }
      } else if (panel) {
        panel.innerHTML = '<div class="wrap" style="padding:48px 0;color:var(--mut)">Tab ‘' +
          esc(t.key) + '’ not yet built.</div>';
      }
    });
    if (global.DealUI && typeof global.DealUI.init === 'function') global.DealUI.init();
  }

  // #app precedes this script, so the DOM target exists: mount synchronously.
  if (document.getElementById('app') || document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

})(typeof window !== 'undefined' ? window : this);
