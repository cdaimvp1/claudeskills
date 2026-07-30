/* my-work-06-handover.js — Handover & Relationships (section 6).
 *
 * Surfaces the custody-backed handover feature. Reflect-only. Two data paths:
 *   - LIVE: GET /api/handover?scope=... returns the backend-composed response (the four
 *     pivots + the de-identified, DLP-scrubbed brief). The UI renders that.
 *   - FALLBACK: when there is no backend (the standalone single-file demo), the fetch
 *     fails and we render from a local seed that mirrors the backend shape.
 * The brief is a materialized artifact (no LLM at render time). Learnings are
 * de-identified (knowledge, not the person). All interpolated values are HTML-escaped.
 */
(function () {
  'use strict';
  var esc = (window.theoEsc) || function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var cap = function (s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); };
  var state = { resp: null };

  // ---- Local seed (fallback; mirrors the backend shape) ---------------------
  var BOOK = {
    label: "Priya Shah's book",
    reach: 'Learnings span 5 years; Theo-tracked custody from go-live (Jan 2026).',
    suppliers: [
      { id: 'acme', name: 'Acme Cloud', buy: 'Compute + object storage on a 3-year MSA; ~$2.4M / yr.' },
      { id: 'globex', name: 'Globex Data', buy: 'Managed analytics platform + support; ~$780K / yr.' }
    ],
    contracts: [
      { id: 'C-1041', title: 'Acme MSA', supplierId: 'acme', owner: 'Priya Shah', renews: 'Mar 2027' },
      { id: 'C-1188', title: 'Globex Analytics SOW', supplierId: 'globex', owner: 'Priya Shah', renews: 'Sep 2026' }
    ],
    pos: [
      { id: 'PO-88231', supplierId: 'acme', contractId: 'C-1041', amount: '$610K' },
      { id: 'PO-88540', supplierId: 'acme', contractId: 'C-1041', amount: '$300K' },
      { id: 'PO-90112', supplierId: 'globex', contractId: 'C-1188', amount: '$195K' }
    ],
    contacts: [
      { name: 'Sam Ortiz', role: 'supplier-contact', on: 'Acme Cloud', detail: 'Acme account manager' },
      { name: 'Dana Kim', role: 'internal-stakeholder', on: 'Acme MSA', detail: 'Security reviewer' },
      { name: 'Lee Park', role: 'supplier-contact', on: 'Globex Data', detail: 'Globex CSM' }
    ],
    learnings: [
      { theme: 'renewal timing', text: 'This supplier discounts hardest at their fiscal Q4; start the renewal 120 days out.', cite: 'lesson:les-3391' },
      { theme: 'billing', text: 'Watch for overage lines on storage POs; the contract caps them but invoices have slipped through.', cite: 'lesson:les-3417' },
      { theme: 'negotiation', text: 'Token-based pricing recurs here; anchor the ZOPA on committed-use discounts, not list.', cite: 'lesson:les-3502' }
    ]
  };
  var ITEM = {
    label: 'Cloud analytics project (single transfer)',
    reach: BOOK.reach,
    suppliers: [BOOK.suppliers[1]], contracts: [BOOK.contracts[1]], pos: [BOOK.pos[2]],
    contacts: [BOOK.contacts[2]], learnings: [BOOK.learnings[2]]
  };
  var OOO = {
    meta: 'Covering 2 items for Priya Shah through Jul 25 (temporary; expires automatically).',
    items: [
      { what: 'Acme MSA renewal kickoff', need: 'Sam Ortiz (Acme AM) is your contact; the current quote expires Jul 20, so respond before then.' },
      { what: 'Globex overage dispute', need: 'A storage-overage credit is pending; the cap clause is section 7.3 of C-1188.' }
    ]
  };

  function scopeVal() { var el = document.querySelector('input[name="hoscope"]:checked'); return (el && el.value === 'item') ? 'item' : 'book'; }
  function seed() { return scopeVal() === 'item' ? ITEM : BOOK; }
  function primary() { var el = document.querySelector('input[name="hopivot"]:checked'); return el ? el.value : 'supplier'; }

  var sep = '<span class="sep">·</span>';
  function row(kind, title, subHtml) {
    return '<div class="horow"><div class="rt"><span class="rk">' + esc(kind) + '</span>' + esc(title) + '</div>' +
      (subHtml ? '<div class="hosub">' + subHtml + '</div>' : '') + '</div>';
  }

  // ---- Fallback (seed) renderers -------------------------------------------
  function contractsFor(d, sid) { return d.contracts.filter(function (c) { return c.supplierId === sid; }); }
  function posFor(d, cid) { return d.pos.filter(function (p) { return p.contractId === cid; }); }
  function contactsForSupplier(d, name) { return d.contacts.filter(function (c) { return c.on === name; }); }

  function seedPivot(d, by) {
    var html = '';
    if (by === 'supplier') {
      d.suppliers.forEach(function (s) {
        var cs = contractsFor(d, s.id).map(function (c) {
          var pos = posFor(d, c.id).map(function (p) { return p.id; });
          return '<b>' + esc(c.title) + '</b> (' + esc(c.id) + ')' + (pos.length ? ' — POs ' + esc(pos.join(', ')) : '');
        });
        var contacts = contactsForSupplier(d, s.name).map(function (c) { return esc(c.name) + ' (' + esc(c.role) + ')'; });
        html += row('Supplier', s.name, cs.join('<br>') + (contacts.length ? '<br>Contacts: ' + contacts.join(', ') : ''));
      });
    } else if (by === 'contract') {
      d.contracts.forEach(function (c) {
        var s = d.suppliers.filter(function (x) { return x.id === c.supplierId; })[0];
        var pos = posFor(d, c.id).map(function (p) { return p.id; });
        html += row('Contract', c.title + ' (' + c.id + ')', 'Supplier <b>' + esc(s ? s.name : c.supplierId) + '</b>' + sep + 'Owner ' + esc(c.owner) + sep + 'Renews ' + esc(c.renews) + (pos.length ? '<br>POs: ' + esc(pos.join(', ')) : ''));
      });
    } else if (by === 'po') {
      d.pos.forEach(function (p) {
        var s = d.suppliers.filter(function (x) { return x.id === p.supplierId; })[0];
        html += row('PO', p.id, 'Supplier <b>' + esc(s ? s.name : p.supplierId) + '</b>' + sep + 'Contract ' + esc(p.contractId) + sep + 'Amount ' + esc(p.amount));
      });
    } else {
      var people = new Map();
      var add = function (k, v) { if (!people.has(k)) people.set(k, []); people.get(k).push(v); };
      d.contracts.forEach(function (c) { add(c.owner, 'owns <b>' + esc(c.title) + '</b>'); });
      d.contacts.forEach(function (c) { add(c.name, esc(c.role) + ' on <b>' + esc(c.on) + '</b> (' + esc(c.detail) + ')'); });
      Array.from(people.keys()).sort().forEach(function (name) { html += row('Owner', name, people.get(name).join('<br>')); });
    }
    return html;
  }
  function seedBrief(d) {
    var buy = d.suppliers.map(function (s) { return '<li><b>' + esc(s.name) + '</b> — ' + esc(s.buy) + '</li>'; }).join('');
    var learn = d.learnings.length
      ? '<ul>' + d.learnings.map(function (l) { return '<li>On ' + esc(l.theme) + ': ' + esc(l.text) + ' <span class="cite">[' + esc(l.cite) + ']</span></li>'; }).join('') + '</ul>'
      : '<p class="abstain">No grounded learnings recorded for this scope yet.</p>';
    var contacts = d.contacts.map(function (c) { return '<li>' + esc(c.name) + ' — ' + esc(c.detail) + ' (' + esc(c.role) + ' on ' + esc(c.on) + ')</li>'; }).join('');
    return '<h4>What we buy</h4><ul>' + buy + '</ul><h4>Learnings (de-identified)</h4>' + learn + '<h4>Contacts</h4><ul>' + contacts + '</ul>';
  }

  // ---- Live (server response) renderers ------------------------------------
  function respPivot(rows) {
    return (rows || []).map(function (n) {
      var sub = (n.children || []).map(function (c) {
        var g = (c.children && c.children.length) ? ' (' + c.children.map(function (x) { return esc(x.label); }).join(', ') + ')' : '';
        return (c.relation ? esc(c.relation) + ': ' : '') + '<b>' + esc(c.label) + '</b>' + g;
      }).join('<br>');
      return row(cap(n.type), n.label, sub);
    }).join('');
  }
  function respBrief(sections) {
    return (sections || []).map(function (s) {
      var body = s.abstained
        ? '<p class="abstain">No grounded content for this section.</p>'
        : '<div style="white-space:pre-wrap;font-size:13px;color:var(--ink);line-height:1.6">' + esc(s.text) + '</div>';
      return '<h4>' + esc(s.title) + '</h4>' + body;
    }).join('');
  }

  function renderOOO() {
    var meta = document.getElementById('hooometa'); if (meta) meta.textContent = OOO.meta;
    var el = document.getElementById('hooobody');
    if (el) el.innerHTML = OOO.items.map(function (it) { return '<div class="hoitem"><b>' + esc(it.what) + '</b><br>' + esc(it.need) + '</div>'; }).join('');
  }

  function syncSegs() {
    ['hoscope', 'hopivot'].forEach(function (id) {
      var g = document.getElementById(id); if (!g) return;
      g.querySelectorAll('label').forEach(function (lab) { var inp = lab.querySelector('input'); lab.classList.toggle('sel', !!(inp && inp.checked)); });
    });
  }

  function hoRender() {
    syncSegs();
    var metaEl = document.getElementById('hoscopemeta'), reachEl = document.getElementById('horeach');
    var tbl = document.getElementById('hotable'), brief = document.getElementById('hobrief');
    if (state.resp) {
      var r = state.resp;
      if (metaEl) metaEl.textContent = r.scopeLabel || '';
      if (reachEl) reachEl.textContent = r.reachNote || '';
      if (tbl) tbl.innerHTML = respPivot((r.pivots && r.pivots[primary()] && r.pivots[primary()].rows) || []);
      if (brief) brief.innerHTML = respBrief(r.brief && r.brief.sections);
    } else {
      var d = seed();
      if (metaEl) metaEl.textContent = d.label;
      if (reachEl) reachEl.textContent = d.reach;
      if (tbl) tbl.innerHTML = seedPivot(d, primary());
      if (brief) brief.innerHTML = seedBrief(d);
    }
    renderOOO();
  }

  // Fetch the live response for the current scope; fall back silently to the seed.
  function hoFetch() {
    try {
      fetch('/api/handover?scope=' + scopeVal(), { credentials: 'same-origin', headers: { accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
        .then(function (j) { state.resp = (j && j.response) || null; hoRender(); })
        .catch(function () { state.resp = null; /* seed already on screen */ });
    } catch (e) { state.resp = null; }
  }

  // Scope change re-fetches (server response is scope-specific); pivot change re-renders.
  function hoScopeChange() { state.resp = null; hoRender(); hoFetch(); }

  window.hoRender = hoRender;
  window.hoScopeChange = hoScopeChange;
  function boot() { hoRender(); hoFetch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
