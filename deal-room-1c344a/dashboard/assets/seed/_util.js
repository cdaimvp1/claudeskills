/* ===========================================================================
 * assets/seed/_util.js, shared seed helpers (browser + Node validator).
 *
 * Part of the Theo data layer (build plan P0). Seed data lives under
 * assets/seed/*.js as plain values plus a co-located `$src` map that classifies
 * each field and carries its provenance. This module defines:
 *   - window.stub(name, tier)      : a demo source object (NO url -> no dead link)
 *   - window.THEO_SEED_HELPERS     : classify / walkSrc / coverageOf
 *
 * The `$src` map is the typed source of truth; the plain values are the render
 * convenience. Coverage is ALWAYS DERIVED from `$src`, never hand-authored.
 * ======================================================================== */
(function () {
  if (typeof window === 'undefined') { /* Node: the validator sets global.window */ }
  var W = (typeof window !== 'undefined') ? window : (typeof global !== 'undefined' ? global : this);
  if (W.THEO_SEED_HELPERS) return;

  /* A demo (dummy) source. Name-only + stub:true so renderProvenance shows the
   * name as plain text (no clickable link to x.invalid). asOf matches the live
   * research-stub so demo<->live provenance is symmetric. */
  function stub(name, tier) {
    tier = tier || 1;
    return { name: name, tier: tier, confidence: tier === 1 ? 'Medium' : 'Low', asOf: '2026-06-01', stub: true };
  }

  /* Classify a `$src` entry -> { kind, sources[], pending? }.
   *   [Source, ...]        -> figure with those sources
   *   {kind:'derived',by}  -> computed by a named engine (no sources needed)
   *   {kind:'id'|'narrative'} -> not a claim (ignored by the source requirement)
   *   {pending:true}       -> genuinely unknown figure -> forces coverage BELOW
   *   {name:...}           -> a lone source object
   *   undefined            -> UNCLASSIFIED numeric => treated as figure w/ NO source
   *                           (the validator fails the build; the value-view hides it)
   */
  function classify(entry) {
    if (entry == null) return { kind: 'figure', sources: [] };
    if (Array.isArray(entry)) return { kind: 'figure', sources: entry.filter(function (s) { return s && s.name; }) };
    if (entry.pending) return { kind: 'figure', sources: [], pending: true };
    if (entry.kind) return { kind: entry.kind, sources: Array.isArray(entry.sources) ? entry.sources : [] };
    if (entry.name) return { kind: 'figure', sources: [entry] };
    return { kind: 'figure', sources: [] };
  }

  /* Walk a seed record, invoking cb(container, key, entry, path) for every field
   * that has a `$src` classification. Recurses through nested objects/arrays so
   * each level's own `$src` map is visited. The `$src` maps themselves are never
   * recursed into (so source objects are not mistaken for fields). */
  function walkSrc(node, cb, prefix) {
    if (node == null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) walkSrc(node[i], cb, (prefix || '') + '[' + i + ']');
      return;
    }
    var src = node.$src || {};
    Object.keys(node).forEach(function (k) {
      if (k === '$src') return;
      var p = (prefix ? prefix + '.' : '') + k;
      if (Object.prototype.hasOwnProperty.call(src, k)) cb(node, k, src[k], p);
      var v = node[k];
      if (v && typeof v === 'object') walkSrc(v, cb, p);
    });
  }

  /* Coverage, DERIVED from `$src` presence. Never authored, never stored. */
  function coverageOf(record) {
    var sourced = 0, assumed = 0, pending = [];
    if (record) {
      walkSrc(record, function (container, key, entry, path) {
        var c = classify(entry);
        if (c.kind !== 'figure') return;
        if (c.pending || c.sources.length === 0) pending.push(path);
        else { sourced++; if (entry && entry.assumption) assumed++; }
      });
    }
    return {
      floor: pending.length ? 'BELOW' : 'MET',
      sourcedFields: sourced,
      assumedFields: assumed,
      pendingFields: pending,
    };
  }

  W.stub = stub;
  W.THEO_SEED_HELPERS = { classify: classify, walkSrc: walkSrc, coverageOf: coverageOf };
})();
