/* app-shell.js, injects the shared Theo chrome (red topbar + left rail + tasks
   drawer scaffold) around a page's existing content, so a page only has to ship
   its own body content. Include order at the END of body, AFTER the page's own
   content + mount scripts: app-shell.js, then tasks-drawer.js, then theo-brand.js
   (each as an assets/ script src). Mark the active rail item with the body
   data-shell attribute set to one of the rail keys below (e.g. "projects").
   The Lilly logo is base64-embedded by make_app_shell.py so the chrome travels
   in the single-file demo with no external image. */
(function () {
  "use strict";
  if (window.__theoShell) return;
  window.__theoShell = true;

  // ---- Theme (shared light/dark across all shell pages) ----------------------
  // Apply the saved preference right away so the chrome mounts in the right theme.
  try { var __th = localStorage.getItem('theo-theme');
    if (__th === 'dark' || __th === 'light') document.documentElement.setAttribute('data-theme', __th);
  } catch (e) {}
  window.theoTheme = function () { try { return localStorage.getItem('theo-theme') || 'light'; } catch (e) { return 'light'; } };
  window.theoSetTheme = function (t) { t = (t === 'dark') ? 'dark' : 'light';
    try { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theo-theme', t); } catch (e) {}
    try { if (window.theoReflectTheme) window.theoReflectTheme(); } catch (e) {}
  };

  /*LILLY_LOGO_START*/var LILLY_LOGO='data:image/png;base64,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';/*LILLY_LOGO_END*/

  // ============================================================
  // Notification bell (NA.3), Bold Blue #0F3A85; NEVER green
  // ============================================================

  // Demo notifications shown when LillyAPI is not configured (file:// or no backend).
  // Shape matches NotificationStore: {id, snippet, deepLink, createdAt, readAt?}.
  var DEMO_NOTIFS = [
    {
      id: 'demo-ntf-1',
      snippet: 'Your category strategy for Facilities is ready to review.',
      deepLink: 'category-strategy.html',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      readAt: undefined,
      type: 'mention', actorUserId: 'system',
      projectId: 'proj-fac-01', messageId: 'msg-fac-01',
      recipientUserId: 'u-demo', tenantId: 'lilly-demo'
    },
    {
      id: 'demo-ntf-2',
      snippet: 'Defender flagged a high-risk finding on the Accenture SOW.',
      deepLink: 'defender.html',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      readAt: undefined,
      type: 'mention', actorUserId: 'system',
      projectId: 'proj-acc-02', messageId: 'msg-acc-01',
      recipientUserId: 'u-demo', tenantId: 'lilly-demo'
    },
    {
      id: 'demo-ntf-3',
      snippet: 'Sarah Chen approved savings claim SC-2024-001 for $180k.',
      deepLink: 'savings.html',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      type: 'mention', actorUserId: 'u-schm',
      projectId: 'proj-sav-01', messageId: 'msg-sav-01',
      recipientUserId: 'u-demo', tenantId: 'lilly-demo'
    }
  ];

  // Mutable copy so demo mark-read actions persist within the session.
  var _demoNotifsMut = DEMO_NOTIFS.map(function (n) { return Object.assign({}, n); });

  /** Format a UTC ISO timestamp as a short relative string. */
  function ntfRelTime(iso) {
    try {
      var diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diff < 60) return 'just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    } catch (e) { return ''; }
  }

  /** Update the bell badge element visibility and text. */
  function ntfSetBadge(count) {
    var badge = document.getElementById('ntfcount');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  /** Render the notification list into #ntflist using DOM methods (no innerHTML). */
  function ntfRenderList(notifs) {
    var el = document.getElementById('ntflist');
    if (!el) return;
    // Clear via DOM removal, no innerHTML write.
    while (el.firstChild) el.removeChild(el.firstChild);
    if (!notifs || notifs.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'ntfempty';
      empty.textContent = "You're all caught up";
      el.appendChild(empty);
      return;
    }
    for (var i = 0; i < notifs.length; i++) {
      var n = notifs[i];
      var unread = !n.readAt;

      var row = document.createElement('div');
      row.className = 'ntfrow' + (unread ? ' unread' : '');
      row.setAttribute('data-ntfid', n.id || '');
      row.setAttribute('data-ntflink', n.deepLink || '');

      var dot = document.createElement('span');
      dot.className = 'ntfdot' + (unread ? '' : ' read');
      row.appendChild(dot);

      var content = document.createElement('div');
      content.className = 'ntfcontent';

      var snip = document.createElement('div');
      snip.className = 'ntfsnip';
      snip.textContent = n.snippet || '';   // textContent: XSS-safe, no escaping needed
      content.appendChild(snip);

      var time = document.createElement('div');
      time.className = 'ntftime';
      time.textContent = ntfRelTime(n.createdAt);  // returns only ASCII digits/words
      content.appendChild(time);

      row.appendChild(content);
      el.appendChild(row);
    }
  }

  /** Fetch unread count (live or demo) and update the badge. */
  function ntfRefreshCount() {
    var demoCount = _demoNotifsMut.filter(function (n) { return !n.readAt; }).length;
    var api = window.LillyAPI;
    if (!api) { ntfSetBadge(demoCount); return; }
    api.tryLive(
      function () { return api.unreadCount(); },
      demoCount
    ).then(function (r) {
      ntfSetBadge(typeof r.data === 'number' ? r.data : demoCount);
    }).catch(function () { ntfSetBadge(demoCount); });
  }

  /** Fetch notification list (live or demo) and render it. */
  function ntfRefreshList() {
    var demoCopy = _demoNotifsMut.slice();
    var api = window.LillyAPI;
    if (!api) { ntfRenderList(demoCopy); return; }
    api.tryLive(
      function () { return api.notifications(); },
      demoCopy
    ).then(function (r) {
      ntfRenderList(Array.isArray(r.data) ? r.data : demoCopy);
    }).catch(function () { ntfRenderList(demoCopy); });
  }

  /** Open the notification panel and populate it. */
  function ntfOpen() {
    var panel = document.getElementById('ntfpanel');
    var scrim = document.getElementById('ntfscrim');
    if (!panel) return;
    panel.style.display = 'flex';
    if (scrim) scrim.style.display = 'block';
    ntfRefreshList();
    ntfRefreshCount();
  }

  /** Close the notification panel. */
  function ntfClose() {
    var panel = document.getElementById('ntfpanel');
    var scrim = document.getElementById('ntfscrim');
    if (panel) panel.style.display = 'none';
    if (scrim) scrim.style.display = 'none';
  }

  /**
   * Navigate to a deepLink, but ONLY to a safe scheme. The link is server-sourced
   * (a notification's deepLink), so a hostile/garbled value like a javascript: or
   * data: URI must never reach window.location. Resolve against the current page
   * and allow only http/https or the page's own protocol (so a file:// demo and a
   * normal http deploy both navigate, while script-bearing schemes are blocked).
   */
  function ntfSafeNav(link) {
    if (!link) return;
    try {
      var u = new URL(link, window.location.href);
      if (
        u.protocol === 'http:' ||
        u.protocol === 'https:' ||
        u.protocol === window.location.protocol
      ) {
        window.location.href = link;
      }
    } catch (e) {
      /* malformed URL -> do not navigate */
    }
  }

  /** Handle a row click: mark read (live or demo) then navigate if deepLink present. */
  function ntfRowClick(id, link) {
    var api = window.LillyAPI;
    var demoMarkRead = function () {
      for (var i = 0; i < _demoNotifsMut.length; i++) {
        if (_demoNotifsMut[i].id === id && !_demoNotifsMut[i].readAt) {
          _demoNotifsMut[i] = Object.assign({}, _demoNotifsMut[i], {
            readAt: new Date().toISOString()
          });
          ntfRefreshCount();
          ntfRefreshList();
          break;
        }
      }
    };
    if (!api) {
      demoMarkRead();
    } else {
      api.tryLive(
        function () { return api.markNotificationRead(id); },
        null
      ).then(function (r) {
        if (r.source === 'live') { ntfRefreshCount(); ntfRefreshList(); }
        else { demoMarkRead(); }
      });
    }
    if (link) { ntfClose(); ntfSafeNav(link); }
  }

  // Expose functions called from onclick attributes in injected HTML.
  window.ntfToggle = function () {
    var panel = document.getElementById('ntfpanel');
    var open = panel && panel.style.display !== 'none';
    if (open) { ntfClose(); } else { ntfOpen(); }
    var btn = document.getElementById('theo-bell');
    if (btn) btn.setAttribute('aria-expanded', open ? 'false' : 'true');
  };
  window.ntfClose = ntfClose;
  window.ntfMarkAllRead = function () {
    var api = window.LillyAPI;
    var demoMarkAll = function () {
      var now = new Date().toISOString();
      for (var i = 0; i < _demoNotifsMut.length; i++) {
        if (!_demoNotifsMut[i].readAt) {
          _demoNotifsMut[i] = Object.assign({}, _demoNotifsMut[i], { readAt: now });
        }
      }
      ntfRefreshCount();
      ntfRefreshList();
    };
    if (!api) {
      demoMarkAll();
    } else {
      api.tryLive(
        function () { return api.markAllNotificationsRead(); },
        null
      ).then(function (r) {
        if (r.source === 'live') { ntfRefreshCount(); ntfRefreshList(); }
        else { demoMarkAll(); }
      });
    }
  };

  // CSS injected once into <head>, uses CSS vars from the host page.
  // Positive/unread accent: Bold Blue #0F3A85 (never green, per design rules).
  var NTF_CSS =
    '.ntfbtn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:3px;' +
    'min-width:34px;height:34px;padding:0 7px;background:transparent;border:none;color:#fff;cursor:pointer;' +
    'border-radius:8px;opacity:.92;flex:none}' +
    '.ntfbtn:hover{opacity:1;background:rgba(255,255,255,.12)}' +
    '.ntfbtn svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.ntfbadge{color:#fff;font-family:var(--mono,monospace);font-size:11px;font-weight:700;' +
    'display:inline-flex;align-items:center;line-height:1;pointer-events:none}' +
    '.ntfpanel{position:fixed;top:58px;right:16px;width:360px;max-height:480px;background:var(--surface);' +
    'border:1px solid var(--line2,#DCD8D2);border-radius:14px;' +
    'box-shadow:0 12px 34px rgba(0,0,0,.14);z-index:90;display:none;' +
    'flex-direction:column;overflow:hidden}' +
    '.ntfhdr{display:flex;align-items:center;padding:13px 16px 11px;' +
    'border-bottom:1px solid var(--line,#E7E4DF);gap:8px;flex:none}' +
    '.ntftitle{font-size:14px;font-weight:700;color:var(--ink,#1A1A1A);flex:1;' +
    'font-family:var(--sans,sans-serif)}' +
    '.ntfall{background:transparent;border:none;font-family:var(--sans,sans-serif);' +
    'font-size:12px;font-weight:600;color:#0F3A85;cursor:pointer;padding:4px 8px;border-radius:6px}' +
    '.ntfall:hover{background:var(--tint-e4ebf1,#E4EBF1)}' +
    '.ntflist{flex:1;overflow-y:auto}' +
    '.ntfrow{display:flex;align-items:flex-start;gap:10px;padding:11px 16px;' +
    'border-bottom:1px solid var(--line,#E7E4DF);cursor:pointer;transition:background .1s}' +
    '.ntfrow:last-child{border-bottom:none}' +
    '.ntfrow:hover{background:var(--bg,#FBFAF9)}' +
    '.ntfdot{width:8px;height:8px;border-radius:50%;background:#0F3A85;flex:none;margin-top:5px}' +
    '.ntfdot.read{background:transparent}' +
    '.ntfcontent{flex:1;min-width:0}' +
    '.ntfsnip{font-size:13px;color:var(--ink,#1A1A1A);line-height:1.45;overflow-wrap:anywhere;' +
    'font-family:var(--sans,sans-serif)}' +
    '.ntfrow:not(.unread) .ntfsnip{color:var(--mut,#514C46)}' +
    '.ntftime{font-family:var(--mono,monospace);font-size:10px;color:var(--mut2,#6B6360);margin-top:3px}' +
    '.ntfempty{padding:28px 16px;text-align:center;font-size:13px;color:var(--mut,#514C46);' +
    'font-family:var(--sans,sans-serif)}' +
    '.ntfscrim{position:fixed;inset:0;z-index:89}';

  /** Inject NTF_CSS once into <head>. Idempotent. */
  function ntfInjectCSS() {
    if (document.getElementById('ntf-styles')) return;
    var s = document.createElement('style');
    s.id = 'ntf-styles';
    s.textContent = NTF_CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // Notification panel HTML + transparent scrim for click-outside-to-close.
  var NTFPANEL =
    '<div id="ntfscrim" class="ntfscrim" style="display:none" onclick="ntfClose()"></div>' +
    '<div id="ntfpanel" class="ntfpanel" role="dialog" aria-label="Notifications">' +
      '<div class="ntfhdr">' +
        '<span class="ntftitle">Notifications</span>' +
        '<button class="ntfall" onclick="ntfMarkAllRead()">Mark all read</button>' +
      '</div>' +
      '<div class="ntflist" id="ntflist"></div>' +
    '</div>';

  // ============================================================
  // Rail, topbar, drawer (existing chrome, unchanged except bell)
  // ============================================================

  // [key, href, label, svg-inner], mirrors the canonical rail in every app page.
  var RAIL = [
    ['home',      'front-door-v2.html', 'Home',              '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'],
    ['projects',  'projects.html',      'Projects',          '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'],
    ['suppliers', 'suppliers-spend.html','Suppliers &amp; spend','<path d="M3 7h18"/><path d="M6 7v13a1 1 0 001 1h10a1 1 0 001-1V7"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/><path d="M9 12h6M9 16h4"/>'],
    ['defender',  'defender.html',      'Defender',          '<path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M9 11.5l2 2 4-4"/>'],
    ['compliance','compliance-detection.html','Compliance detection','<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h6"/><path d="M14 2v6h6"/><circle cx="17" cy="16" r="3"/><path d="M19.2 18.2L22 21"/>'],
    ['approvals', 'approvals.html',     'Approvals',         '<path d="M9 11l3 3L20 6"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/>'],
    ['alert-center','alert-center.html','Alert center',       '<path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>'],
    ['savings',   'savings.html',       'Savings',           '<path d="M21 12a9 9 0 11-6.2-8.5"/><path d="M21 4v5h-5"/><path d="M12 7v5l3 2"/>'],
    ['category',  'category-strategy.html','Category Strategy','<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'],
    ['market',    'market-rate.html',   'Market rate',       '<path d="M3 21h18"/><rect x="5" y="11" width="3" height="7" rx="1"/><rect x="10.5" y="7" width="3" height="11" rx="1"/><rect x="16" y="13" width="3" height="5" rx="1"/>'],
    ['should-cost','should-cost.html',  'Should-cost',       '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/><path d="M3 21h18"/>'],
    ['requirements-builder','requirements-builder.html','Requirements builder','<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3h6v3H9z"/><path d="M8.5 11l1.2 1.2L12 10M8.5 16l1.2 1.2L12 15M14 11h3M14 16h3"/>'],
    ['rfp-engine','rfp-engine.html',    'RFP package',       '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5M8 9h2"/>'],
    ['evaluation','evaluation.html',    'Evaluation',        '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/><path d="M13 13l2 2 4-4"/>'],
    ['decision-deck','decision-deck.html','Decision deck',   '<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M12 17v3M8 20h8M7 9l3 3 2-2 3 4"/>'],
    ['rfx-portfolio','rfx-portfolio.html','RFx portfolio',   '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>'],
    /* pro-forma retired as a standalone destination (2026-07-05): it is a Deal sub-tab now (always project-attached, no no-project scratchpad). */
    ['commneg',   'commercial-negotiation.html','Commercial negotiation','<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-2.6 6a3 3 0 006 0z"/><path d="M19 7l-2.6 6a3 3 0 006 0z"/>'],
    ['legalneg',  'legal-negotiation.html','Legal negotiation','<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>'],
    ['playbook-learning','playbook-learning.html','Playbook learning','<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M9 8l1.8 1.8L14 6.5"/>'],
    ['spend',     'spend-analysis.html','Spend analysis',    '<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>'],
    ['landscape', 'supplier-landscape.html','Supplier landscape','<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v6M8 11h6"/>'],
    ['deepdive',  'supplier-deep-dive.html','Supplier deep-dive','<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 11h.01"/>'],
    ['perf',      'supplier-performance.html','Supplier performance','<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>'],
    ['risk',      'supplier-risk.html', 'Supplier risk',     '<path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M12 9v4"/><path d="M12 16h.01"/>'],
    ['supplier-onboarding','supplier-onboarding.html','Supplier onboarding','<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'],
    ['supplier-document-portal','supplier-document-portal.html','Document portal','<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M8.5 13l2 2 4-4"/>'],
    ['supplier-comm-log','supplier-comm-log.html','Communication log','<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8M8 13h5"/>'],
    ['supplier-status','supplier-status.html','Status visibility','<circle cx="12" cy="12" r="9"/><path d="M12 12l3.5-2.2"/><path d="M12 3.5v2M20.5 12h-2M3.5 12h2"/>'],
    ['changeorder','change-order.html', 'Change orders',     '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 13l2 2 4-4"/>'],
    ['renewal',   'renewal-recommendation.html','Renewal',   '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/>'],
    ['obligations','obligations.html',  'Obligations',       '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4M16 2v4"/><path d="M8.5 15l2 2 4-4"/>'],
    ['cda-intake','cda-intake.html',    'CDA intake',        '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3"/><rect x="9.3" y="12.5" width="5.4" height="4" rx="1"/><path d="M10.4 12.5v-1.1a1.6 1.6 0 013.2 0v1.1"/>'],
    ['comment-cleanup','comment-cleanup.html','Comment cleanup','<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8.5 9.5l2 2 4-4"/>'],
    ['document-ingestion','document-ingestion.html','Document ingestion','<path d="M4 7V5a1 1 0 011-1h2M17 4h2a1 1 0 011 1v2M20 17v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2"/><path d="M7 12h10"/>'],
    ['knowledge-base','knowledge-base.html','Knowledge base','<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M9.6 9a1.8 1.8 0 113 1.3c-.6.4-1 .8-1 1.7M11.6 15h.01"/>'],
    ['process-navigator','process-navigator.html','Process navigator','<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'],
    ['workflow-orchestration','workflow-orchestration.html','Workflow orchestration','<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="9" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M9 6h3a3 3 0 013 3M9 18h3a3 3 0 003-3"/>'],
    ['workflow-map','workflow-map.html','Workflow map','<rect x="3" y="4" width="6" height="5" rx="1"/><rect x="15" y="4" width="6" height="5" rx="1"/><rect x="9" y="15" width="6" height="5" rx="1"/><path d="M6 9v2h12V9M12 11v4"/>'],
    ['workflow-config-sync','workflow-config-sync.html','Config sync','<path d="M21 3v5h-5"/><path d="M3 12a9 9 0 0114.6-6.4L21 8"/><path d="M3 21v-5h5"/><path d="M21 12a9 9 0 01-14.6 6.4L3 16"/>'],
    ['timeline-builder','timeline-builder.html','Timeline builder','<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 13h6M7 16h9"/>'],
    ['meeting-prep-brief','meeting-prep-brief.html','Meeting prep','<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3h6v3H9z"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><path d="M7 17h10"/>'],
    ['daily-digest','daily-digest.html','Daily digest','<path d="M3 18h18"/><path d="M7 18a5 5 0 0110 0"/><path d="M12 5v3M5.6 9.6l1.4 1.4M18.4 9.6L17 11"/>'],
    ['mywork',    'my-work.html',       'My work',           '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>'],
    ['team',      'team-workload.html', 'Team',              '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0112 0"/><circle cx="17.5" cy="9" r="2"/><path d="M16 14.6A5 5 0 0121 19"/>']
  ];

  function railHtml(active) {
    var h = '';
    for (var i = 0; i < RAIL.length; i++) {
      var it = RAIL[i], on = it[0] === active ? ' on' : '';
      // a real <a href> so the single-file demo's link-shim routes it in-app,
      // while a standalone page navigates normally.
      h += '<a class="nav' + on + '" href="' + it[1] + '">' +
           '<svg viewBox="0 0 24 24">' + it[3] + '</svg><span class="tip">' + it[2] + '</span></a>';
    }
    return h;
  }

  // Bell button: wrapped in .theo-actwrap so theo-brand.js re-orders it correctly,
  // and given id="theo-bell" so theo-brand.js's guard fires and skips creating
  // a duplicate localStorage-based bell. Only one bell appears in the topbar.
  var TOPBAR =
    '<div class="topbar">' +
      '<div class="brand"><img src="' + LILLY_LOGO + '" alt="Lilly"/></div>' +
      '<div class="role">' +
        '<span class="theo-actwrap">' +
          '<button class="ntfbtn" id="theo-bell" onclick="ntfToggle()" aria-label="Notifications"' +
            ' aria-haspopup="true" aria-expanded="false">' +
            '<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
            '<path d="M13.73 21a2 2 0 01-3.46 0"/></svg>' +
            '<span class="ntfbadge" id="ntfcount" style="display:none">0</span>' +
          '</button>' +
        '</span>' +
        '<button class="mqbtn" onclick="mqOpen()" aria-label="Your tasks">' +
          '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L20 6"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></svg>' +
          '<span class="lbl">Tasks</span><span class="mqbadge" id="mqcount">6</span>' +
        '</button>' +
        '<div class="who"><div class="av" id="av">ML</div><div>' +
          '<div class="nm" id="rname">Marc Lane</div><div class="ti" id="rrole">Sourcing Rep</div></div></div>' +
        '<button class="switch" onclick="cycleView()">&#8644; View as</button>' +
      '</div>' +
    '</div>';

  var DRAWER =
    '<div class="mqscrim" id="mqscrim" onclick="mqClose()"></div>' +
    '<aside class="mqdrawer" id="mqdrawer" role="dialog" aria-label="Your tasks">' +
      '<div class="mqhead"><button class="mqx" onclick="mqClose()" aria-label="Close">&#x2715;</button>' +
        '<h2 class="t">Ready for you this morning</h2><div class="s" id="mqsub"></div></div>' +
      '<div class="mqbody" id="mqbody"></div>' +
    '</aside>';

  function mount() {
    var body = document.body;
    var active = body.getAttribute('data-shell') || '';

    // Pull the page's existing content (everything that isn't a script/style/link).
    var kids = [];
    for (var i = 0; i < body.children.length; i++) {
      var tag = body.children[i].tagName;
      if (tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'LINK') kids.push(body.children[i]);
    }

    var app = document.createElement('div'); app.className = 'app';
    var rail = document.createElement('nav'); rail.className = 'rail'; rail.innerHTML = railHtml(active);
    var main = document.createElement('main'); main.className = 'shell-main';
    for (var j = 0; j < kids.length; j++) main.appendChild(kids[j]);  // appendChild moves them
    app.appendChild(rail); app.appendChild(main);

    body.insertAdjacentHTML('afterbegin', TOPBAR);                    // topbar first
    document.querySelector('.topbar').insertAdjacentElement('afterend', app); // content next
    body.insertAdjacentHTML('beforeend', DRAWER);                    // drawer last

    // ---- Notification bell (NA.3) ----
    ntfInjectCSS();
    body.insertAdjacentHTML('beforeend', NTFPANEL);

    // Delegated click listener on the notification list container.
    var ntfListEl = document.getElementById('ntflist');
    if (ntfListEl) {
      ntfListEl.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el !== ntfListEl) {
          if (el.getAttribute && el.getAttribute('data-ntfid')) break;
          el = el.parentElement;
        }
        if (el && el !== ntfListEl) {
          var id = el.getAttribute('data-ntfid');
          var link = el.getAttribute('data-ntflink') || '';
          if (id) ntfRowClick(id, link);
        }
      });
    }

    // Populate badge on load.
    ntfRefreshCount();
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
