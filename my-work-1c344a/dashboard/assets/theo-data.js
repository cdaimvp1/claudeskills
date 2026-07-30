/* ===========================================================================
 * assets/theo-data.js, the Theo data-layer read interface (build plan P0).
 *
 * One repository facade over the bundled demo seed (window.__SEED__). Pages read
 * ALL business data through Theo.data.*Seed(...) instead of inline literals, then
 * upgrade to live data with the existing LillyAPI.tryLive seam at the call site:
 *
 *     const r = await LillyAPI.tryLive(
 *        () => LillyAPI.categoryStrategy(buildLiveReq(c)),
 *        Theo.data.categorySeed(id)          // <- SYNC demo view
 *     );
 *
 * Seed reads are SYNCHRONOUS (never a Promise) so the optimistic demo paint keeps
 * working; only the live upgrade is async, exactly as pages already do it.
 *
 * A grounded figure with no source is suppressed at the accessor: the value view
 * returns Theo.DATA_NOT_AVAILABLE and the renderer must check Theo.isDNA(x) BEFORE
 * formatting. Anti-fabrication is enforced here + in seed/_validate.js, NOT in
 * provenance.js (which only decorates a value already proven present).
 * ======================================================================== */
(function () {
  var W = (typeof window !== 'undefined') ? window : this;
  W.Theo = W.Theo || {};
  var T = W.Theo;
  if (T.data) return;

  T.DATA_NOT_AVAILABLE = Object.freeze({ __dna: true });
  T.isDNA = function (x) { return x === T.DATA_NOT_AVAILABLE; };

  var H = W.THEO_SEED_HELPERS || { classify: function () { return { kind: 'figure', sources: [] }; }, walkSrc: function () {}, coverageOf: function () { return { floor: 'MET', sourcedFields: 0, assumedFields: 0, pendingFields: [] }; } };

  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }

  /* Deep clone a seed record with every `$src` map stripped, so the returned
   * object is byte-identical to the pre-migration inline literal (the pv renderers
   * read raw values and are NOT sentinel-guarded, provenance lives in seed only).
   * Used by the P4 project-view accessor. */
  function cloneStrip(o) { return o == null ? o : JSON.parse(JSON.stringify(o, function (k, v) { return k === '$src' ? undefined : v; })); }

  /* Dotted-path getter into window.__SEED__ (read at call time, never cached). */
  T.seed = function (path) {
    var root = W.__SEED__ || {};
    if (!path) return root;
    return String(path).split('.').reduce(function (o, k) { return (o == null) ? undefined : o[k]; }, root);
  };

  /* Resolve a dotted/indexed path within a record -> the raw value. */
  function valueAt(root, path) {
    var parts = String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    return parts.reduce(function (o, k) { return (o == null) ? undefined : o[k]; }, root);
  }

  /* The VIEW over a seed record:
   *  - value access (view.meta.s25) returns the raw value, or DATA_NOT_AVAILABLE
   *    for a kind:'figure' field that is pending / has no source.
   *  - view.$('meta.s25') -> { value, sources, kind, pending } for renderProvenance.
   *  - view.$coverage -> derived coverage.
   * Returns the sentinel itself when the whole record is absent (empty seed),
   * so a renderer can guard once at the top: if (Theo.isDNA(D)) return hide().
   */
  function viewOf(record) {
    if (record == null) return T.DATA_NOT_AVAILABLE;
    var v = clone(record);
    // Suppress unsourced / pending figures in the value view.
    H.walkSrc(v, function (container, key, entry) {
      var c = H.classify(entry);
      if (c.kind === 'figure' && (c.pending || c.sources.length === 0)) container[key] = T.DATA_NOT_AVAILABLE;
    });
    Object.defineProperty(v, '$', {
      enumerable: false,
      value: function (path) {
        var norm = String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
        var leaf = norm.pop();
        var container = norm.reduce(function (o, k) { return (o == null) ? undefined : o[k]; }, record);
        var entry = (container && container.$src) ? container.$src[leaf] : undefined;
        var c = H.classify(entry);
        return { value: valueAt(record, path), sources: c.sources || [], kind: c.kind, pending: !!c.pending };
      },
    });
    Object.defineProperty(v, '$coverage', { enumerable: false, get: function () { return H.coverageOf(record); } });
    Object.defineProperty(v, '$isView', { enumerable: false, value: true });
    return v;
  }
  T.viewOf = viewOf;

  /* Shallow copy of a category record WITHOUT its heavy `deep` block (Strategy-tab view). */
  function withoutDeep(c) {
    if (!c) return c;
    var o = {};
    Object.keys(c).forEach(function (k) { if (k !== 'deep') o[k] = c[k]; });
    return o;
  }
  function findCategory(id) {
    var cats = T.seed('categories');
    return Array.isArray(cats) ? cats.filter(function (x) { return x && x.id === id; })[0] : null;
  }

  /* ---- P2: consolidated golden-thread demo (window.__SEED__.demo) helpers ----
   * The former window.DEMO dataset now lives in assets/seed/demo.js. Collection
   * accessors (*Seed) return VALUE-VIEWS (provenance via .$('field'), sentinel-
   * suppressed unsourced figures, [] on empty seed). Lookup / filter / derived
   * helpers operate on the LIVE raw __SEED__.demo so the golden-thread joins and
   * the live-mode supplier swap stay behavior-identical to the old DEMO API. */
  function demoRoot() { return T.seed('demo') || {}; }
  function demoArr(k) { var d = demoRoot(); return Array.isArray(d[k]) ? d[k] : []; }
  function listView(k) { return demoArr(k).map(viewOf); }   // value-views; [] on empty seed
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  var REP_DEFAULT = { suppliers: 70, managedSpendK: 120000, activeContracts: 110 };

  /* ---- Domain accessors. One per domain the HTML needs; grow per packet. ----
   * Each returns a value-view (present) or DATA_NOT_AVAILABLE (absent), never a
   * fabricated value, never a Promise. Mutable domains (added in P4) clone-on-read. */
  T.data = {
    // P1, category strategy + deep analysis
    categorySeed: function (id) { return viewOf(withoutDeep(findCategory(id))); },
    categoryDeepSeed: function (id) { var c = findCategory(id); return viewOf(c ? c.deep : null); },
    allCategorySeeds: function () { var cats = T.seed('categories'); return Array.isArray(cats) ? cats.map(withoutDeep).map(viewOf) : []; },

    // P2, consolidated demo collections (value-views; provenance-bearing).
    suppliersSeed: function () { return listView('suppliers'); },
    contractsSeed: function () { return listView('contracts'); },
    projectsDemoSeed: function () { return listView('projects'); },
    savingsSeed: function () { return listView('savings'); },
    obligationsDemoSeed: function () { return listView('obligations'); },
    renewalsSeed: function () { return listView('renewals'); },   // derived feed (see dueWithin); no stored table
    scaleSeed: function () { var d = demoRoot(); return d.scale ? viewOf(d.scale) : T.DATA_NOT_AVAILABLE; },

    // P2, LIVE raw suppliers array (the live-mode supplier swap mutates this in place
    // so the raw helpers below and the value-views all read one source). null on empty.
    suppliersRaw: function () { var d = demoRoot(); return Array.isArray(d.suppliers) ? d.suppliers : null; },

    // P2, golden-thread lookups / filters (RAW live objects, behavior-identical to DEMO).
    supplier: function (id) { return byId(demoArr('suppliers'), id); },
    supplierByName: function (nm) { nm = (nm || '').toLowerCase(); return demoArr('suppliers').filter(function (s) { return (s.name || '').toLowerCase() === nm; })[0] || null; },
    project: function (id) { return byId(demoArr('projects'), id); },
    contract: function (id) { return byId(demoArr('contracts'), id); },
    suppliersByRep: function (gid) { return demoArr('suppliers').filter(function (s) { return s.ownerRep === gid; }); },
    savingsByRep: function (gid) { return demoArr('savings').filter(function (s) { return s.rep === gid; }); },
    projectsByRep: function (gid) { return demoArr('projects').filter(function (p) { return p.rep === gid; }); },
    projectsByOwner: function (gid) { return demoArr('projects').filter(function (p) { return p.owner === gid; }); },
    contractsForSupplier: function (sid) { return demoArr('contracts').filter(function (c) { return c.supplier === sid; }); },
    obligationsForContract: function (cid) { return demoArr('obligations').filter(function (o) { return o.contract === cid; }); },

    // P2, derived scalars. DATA_NOT_AVAILABLE (not a fabricated number) on empty seed.
    activeSpendK: function () {
      var s = demoArr('suppliers'); if (!s.length) return T.DATA_NOT_AVAILABLE;
      return s.reduce(function (t, x) { return t + (x.status === 'canceled' ? 0 : (x.spendK || 0)); }, 0);
    },
    orgSpendK: function () {
      var d = demoRoot(); if (!d.scale || !d.scale.org) return T.DATA_NOT_AVAILABLE;
      return d.scale.org.spendByCategory.reduce(function (t, c) { return t + c.spendK; }, 0);
    },
    repScale: function (gid) {
      var d = demoRoot(); if (!d.scale || !d.scale.byRep) return T.DATA_NOT_AVAILABLE;
      return d.scale.byRep[gid] || REP_DEFAULT;
    },
    today: function () { var d = demoRoot(); return d.TODAY || null; },
    daysOut: function (iso) {
      var d = demoRoot(); if (!d.TODAY || !iso) return T.DATA_NOT_AVAILABLE;
      var a = new Date(d.TODAY + 'T00:00:00'), b = new Date(iso + 'T00:00:00');
      return Math.round((b - a) / 86400000);
    },
    // Standing monitor: renewals + obligations due within `days` (reflect-only alerts).
    dueWithin: function (days) {
      var d = demoRoot(); if (!d.TODAY) return [];
      days = days == null ? 120 : days;
      var self = this, out = [];
      (d.contracts || []).forEach(function (c) {
        var dd = self.daysOut(c.end);
        if (dd <= days) {
          var sup = self.supplier(c.supplier) || {};
          var pr = c.project ? (self.project(c.project) || {}) : {};
          out.push({ kind: 'renewal', supplier: sup.name || c.supplier, title: sup.name + ' contract ends ' + c.end,
            detail: 'Notice of intent due ' + Math.max(0, c.noticeDays) + ' days before. ' + (c.note || ''),
            dueISO: c.end, daysOut: dd, ref: c.id, ownerGid: pr.owner || null, projId: pr.id || null,
            autoRenew: !!c.autoRenew, noticeDays: c.noticeDays || 30,
            severity: dd <= 30 ? 'high' : dd <= 75 ? 'med' : 'low' });
        }
      });
      (d.obligations || []).forEach(function (o) {
        var dd = self.daysOut(o.dueDate);
        if (dd <= days) {
          out.push({ kind: o.status === 'overdue' || dd < 0 ? 'overdue' : 'obligation', supplier: (self.supplier(o.supplier) || {}).name || o.supplier,
            title: o.text, detail: '(' + o.party + ' owes; ' + o.type + ') on ' + o.contract,
            dueISO: o.dueDate, daysOut: dd, ref: o.id, severity: dd < 0 ? 'high' : dd <= 30 ? 'high' : dd <= 75 ? 'med' : 'low' });
        }
      });
      return out.sort(function (a, b) { return a.daysOut - b.daysOut; });
    },

    // ---- P3, per-page private seeds. Each returns a value-view (present) or
    // DATA_NOT_AVAILABLE / empty (absent). The page's DERIVED engines (RAE / SLE /
    // SDDE / the negotiation calculator) still compute from these inputs; only the
    // INPUT literal moves here. Narrative (rfx.narr / landscape.vp) stays authored.
    rfxSeed:           function () { var r = T.seed('rfx');      return r ? viewOf(r) : T.DATA_NOT_AVAILABLE; },
    contractSeed:      function () { var c = T.seed('contract'); return c ? viewOf(c) : T.DATA_NOT_AVAILABLE; },
    landscapeSeed:     function () { var l = T.seed('landscape'); return (l && l.input) ? viewOf(l.input) : T.DATA_NOT_AVAILABLE; },
    landscapeVPSeed:   function () { var l = T.seed('landscape'); return (l && l.vp) ? clone(l.vp) : {}; },
    deepDiveSeed:      function () { var d = T.seed('deepDive');  return (d && d.input) ? viewOf(d.input) : T.DATA_NOT_AVAILABLE; },
    deepDiveAreasSeed: function () { var d = T.seed('deepDive');  return (d && Array.isArray(d.areas)) ? clone(d.areas) : []; },

    // ---- P6, the remaining single-purpose pages (defender, tprm, the skill
    // tool pages, workflow-*, etc.). Each such page's former inline business-data
    // literal(s) now live in assets/seed/<page>.js under one domain object
    // (window.__SEED__.<domain>). This ONE generic accessor serves all of them:
    // it returns a provenance-bearing VALUE-VIEW of that domain object (or the
    // DATA_NOT_AVAILABLE sentinel under --seed=none), exactly like the bespoke
    // *Seed accessors above. Only the INPUT/illustrative data moves to seed;
    // presentation/label/ordering config stays authored in the page. The page
    // guards once:  var S = Theo.data.pageSeed('defender');
    //               var FINDINGS = Theo.isDNA(S) ? [] : S.findings;
    pageSeed: function (domain) { var d = T.seed(domain); return (d != null) ? viewOf(d) : T.DATA_NOT_AVAILABLE; },

    // ---- P4, the project-view flagship (assets/pv/*). The pv modules relocate
    // their inline per-project business-data literals into assets/seed/project-view.js
    // (window.__SEED__.projectView = { domain, deal }). Because the page MUTATES many
    // of these literals at runtime (contract versions grow, MSA re-ties, RFx scores
    // edit, supplier paper flips), this accessor returns a FRESH, DEEP, $src-STRIPPED,
    // MUTABLE clone: the module holds the working copy and mutates it freely while this
    // seed stays pristine, no runtime edit can corrupt the shared seed. Stripping $src
    // makes the clone byte-identical to the old literal, so render is unchanged. Each pv
    // module calls this ONCE at module-init (mirroring the old module-top const) and
    // guards with Theo.isDNA(...) for the --seed=none / absent-seed degrade path.
    projectViewSeed: function () { var pv = T.seed('projectView'); return (pv != null) ? cloneStrip(pv) : T.DATA_NOT_AVAILABLE; },
  };
})();
