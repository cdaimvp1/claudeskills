/* =============================================================================
   pv-07b-deepdive.js, Supplier Deep Dive v3 (6 visual subtabs on pvAssess)
   Supplier Summary (default) / Company & Ownership / Capabilities & Operations /
   Financial & Market / Risk & Resilience / Lilly Fit & Diligence.
   Each subtab leads with its dominant read; decision -> evidence -> materiality ->
   action; ~60% visual. Consumes pvAssess() (pv-07a) + the existing deepDive data.
   Loaded after pv-07a and pv-07 in the bundle.
   ============================================================================= */

// Platform card style (.sa-card > .card-hd > .scc-b), matching the rest of the dashboard (Marc: panels must match
// the platform). Accent normalized to the platform PANEL palette: PLUM/TEAL primary + BURNT-ORANGE (--emph)
// emphasis; the old per-panel navy/rainbow accents fold into this scheme. Per-supplier + functional-severity
// colours are handled separately inside each viz.
// Panel heading (Marc refs): LEFT plum accent bar + UPPERCASE letter-spaced title (style 1) + an ICON (style 2).
// Accent normalized to the platform palette (plum/teal primary + burnt-orange emphasis). Optional icon param
// (SVG path body); defaults to a grid glyph.
function pvDD2Card(title, inner, accent, sub, icon, opts) {
  opts = opts || {};
  var a = String(accent || '');
  var ac = /emph|amber|orange|risk|red|A23A30|8A5A00|C15E19|D2691E/i.test(a) ? 'var(--emph,#C15E19)'
         : /teal|2F6E6B|1F7A5A/i.test(a) ? 'var(--teal-d,#2F6E6B)'
         : 'var(--plum,#5C2B50)';
  var ic = icon || '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>';
  // opts.fill -> stretch to grid-row height (equal-height pairs); opts.maxBody -> body caps + scrolls.
  var cardStyle = opts.fill ? ' style="height:100%;display:flex;flex-direction:column"' : '';
  var bs = '';
  if (opts.fill) bs += 'flex:1 1 auto;min-height:0;';
  if (opts.maxBody) bs += 'max-height:' + opts.maxBody + 'px;';
  if (opts.fill || opts.maxBody || opts.scroll) bs += 'overflow:auto;';
  var bodyStyle = bs ? ' style="' + bs + '"' : '';
  return '<div class="sa-card"' + cardStyle + '>'
    + '<div class="card-hd" style="border-left:4px solid ' + ac + ';gap:9px">'
    + '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="' + ac + '" stroke-width="2" style="flex:none">' + ic + '</svg>'
    + '<span style="font:800 12px var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--ink)">' + title + '</span>'
    + (sub ? '<span style="margin-left:auto;font-size:11px;font-weight:400;letter-spacing:0;text-transform:none;color:var(--mut2)">' + sub + '</span>' : '') + '</div>'
    + '<div class="scc-b"' + bodyStyle + '>' + inner + '</div></div>';
}
// Equal-height two-column pair: both cards stretch to the taller; each scrolls internally if it overflows.
function pvDD2Pair(left, right) {
  // Marc: guarantee vertical spacing between stacked pairs/cards. The pair is one 16px-separated block
  // (dd2pair margin), and its inner cards zero their own margin (see .dd2pair>.sa-card in pv.css) so the
  // gap is consistent whether a pair is followed by another pair or a full-width card.
  return '<div class="dd2pair" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;align-items:stretch;margin-bottom:16px">' + left + right + '</div>';
}

// Marc: the value-less methodology captions are removed. pvDD2Foot is now a no-op so every
// "X, not a Y" / "axes zoomed..." note across the deep dive disappears in one place. Genuine
// grounding (Sources) is rendered directly by its panel, not through here.
function pvDD2Foot(t) { return ''; }

/* dimension lead band: concern pill + the grounded evidence sentence(s) */
function pvDD2DimLead(x, id) {
  var d = x.dimensions.find(function(v){ return v.id === id; });
  if (!d) return '';
  return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:10px">'
    + '<span style="font-size:13px;font-weight:700;color:var(--ink)">' + pvAEsc(d.label) + '</span>'
    + pvConcernPill(d.concern, d.confidence) + '</div>'
    + '<div style="font-size:12.5px;color:var(--mut);line-height:1.5">' + pvAEsc(d.evidence) + '</div>';
}

/* compact DE-CARDED assessment strip (Marc G3: the dimension lead should not be its own card): a slim plum-barred
   strip with the dimension label + concern pill + a one-line read, sitting on the page, not in a panel. */
function pvDD2AssessStrip(x, id) {
  var d = x.dimensions.find(function(v){ return v.id === id; });
  if (!d) return '';
  return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:0 0 14px;padding:9px 13px;background:var(--nested,#EDE8E0);border-left:3px solid var(--plum,#5C2B50);border-radius:8px">'
    + '<span style="font:800 11px var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--ink)">' + pvAEsc(d.label) + '</span>'
    + pvConcernPill(d.concern, d.confidence)
    + '<span style="font-size:11.5px;color:var(--mut);line-height:1.4;flex:1;min-width:220px">' + pvAEsc(d.evidence) + '</span></div>';
}

function pvDD2KV(rows) {
  return rows.filter(function(r){ return r[1]; }).map(function(r){
    return '<div style="display:grid;grid-template-columns:158px 1fr;gap:14px;padding:8px 0;border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.55">'
      + '<span style="color:var(--mut2);font-weight:600">' + r[0] + '</span>'
      + '<span style="color:var(--ink)">' + pvAEsc(r[1]) + '</span></div>';
  }).join('');
}

/* status matrix (element / status / source) with evidence chips */
function pvDD2StatusMatrix(rows) {
  return '<div style="overflow-x:auto"><table class="pvdl" style="width:100%"><tbody>'
    + rows.map(function(r){
        return '<tr><td class="dt" style="white-space:nowrap;vertical-align:top">' + pvAEsc(r[0]) + '</td>'
          + '<td class="dd" style="vertical-align:top">' + pvEvidChip(r[1]) + '</td>'
          + '<td class="dd" style="vertical-align:top;color:var(--mut)">' + pvAEsc(r[2] || '') + '</td></tr>';
      }).join('')
    + '</tbody></table></div>';
}

/* ---------------------------------------------------------------- 0. SUMMARY */
/* compact confidence-encoded scorecard (replaces the wide 8-dimension bars) */
function pvDD2ScoreCard(dims){
  return '<table style="width:100%;border-collapse:collapse;font-size:12.5px">' + (dims || []).map(function(d){
      var ev = String(d.evidence || '');
      var read = ev.length > 104 ? ev.slice(0, 102).replace(/\s+\S*$/, '') + '…' : ev;
      return '<tr style="border-top:1px solid var(--line)"><td style="padding:9px 14px 9px 0;font-weight:700;color:var(--ink);vertical-align:top;width:172px">' + pvAEsc(d.label) + '</td>'
        + '<td style="padding:9px 14px 9px 0;vertical-align:top;white-space:nowrap">' + pvConcernPill(d.concern, d.confidence) + '</td>'
        + '<td style="padding:9px 0;vertical-align:top;color:var(--mut);line-height:1.45;font-size:12px" title="' + pvAEsc(ev) + '">' + pvAEsc(read) + '</td></tr>';
    }).join('') + '</table>';
}
function pvDD2Summary(x, a, cand, input) {
  // SS1 (Marc): the Summary must read like a summary, lead with a grounded recommendation narrative.
  // The gate chips (ESCALATE / HARD STOP) are removed; the same open items are already stated in the
  // "Before advancing, clear N open items" sentence below.
  var topConcern = (x.concerns && x.concerns[0]) || '';
  var hardGate = x.gates.some(function(g){ return g.kind === 'hard'; });
  var art = /^[aeiou]/i.test(String(x.disposition || '')) ? 'an' : 'a';
  var narr = '<div style="font-size:13px;line-height:1.6;color:var(--ink)"><b>' + pvAEsc(a.name) + '</b> is ' + art + ' <b style="color:var(--plum,#5C2B50)">' + pvAEsc(x.disposition) + '</b> candidate'
    + (x.rank ? ' (ranked #' + x.rank + (x.ofN ? ' of ' + x.ofN : '') + ' on requirements fit; ' + pvAEsc(String(x.fit.label).toLowerCase()) + ' capability fit at ' + pvAEsc(String(x.risk.level).toLowerCase()) + ' risk)' : '') + '. '
    + pvAEsc((x.opportunities && x.opportunities[0]) || '') + ' '
    + (topConcern ? 'The main watch-item is ' + pvAEsc(topConcern.charAt(0).toLowerCase() + topConcern.slice(1)) : '')
    + '</div>'
    + '<div style="font-size:12.5px;line-height:1.55;color:var(--ink);margin-top:10px">'
    + (x.gates.length ? '<b>Before advancing</b>, clear ' + x.gates.length + ' open item' + (x.gates.length > 1 ? 's' : '') + ': <b>' + pvAEsc(x.gates.map(function(g){ return g.label; }).join('; ')) + '</b>. ' : 'No open gates on file. ')
    + '<b>The call would change</b> if ' + (hardGate ? 'the hard gate is not cleared' : 'a gated item resolves unfavourably in diligence (e.g. residency cannot be met for regulated data) or a critical risk surfaces') + ', dropping the disposition to hold-as-alternate.'
    + '</div>';
  // one-glance read across the 8 dimensions (dot colour = rating); replaces the full scorecard, which
  // was detail better read on each dimension's own tab.
  // one-glance read across the 8 dimensions (dot colour = rating). Marc: this moves to the BOTTOM, inside the
  // Evidence coverage panel, rather than sitting in the Recommendation hero.
  var dshort = { 'identity & ownership':'Identity', 'capability & fit':'Capability', 'financial viability':'Financial', 'operational resilience':'Resilience', 'integrity & compliance':'Integrity', 'quality & regulatory':'Quality', 'cyber & privacy':'Cyber', 'responsible sourcing':'Responsible' };
  var dimStrip = '<div style="display:flex;flex-wrap:wrap;gap:8px">' + x.dimensions.map(function(d){
      var col = /strong|^low$/i.test(d.concern) ? 'var(--teal-d,#2F6E6B)' : /moderate/i.test(d.concern) ? 'var(--emph,#C15E19)' : /high/i.test(d.concern) ? 'var(--emph,#C15E19)' : /critical/i.test(d.concern) ? '#C15E19' : 'var(--mut2,#6a655f)';
      return '<span title="' + pvAEsc(d.label + ': ' + d.concern) + '" style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--ink);background:var(--nested,#EDE8E0);border-radius:20px;padding:4px 11px"><span style="width:8px;height:8px;border-radius:50%;background:' + col + '"></span>' + pvAEsc(dshort[String(d.label).toLowerCase()] || d.label) + '</span>';
    }).join('') + '</div>';
  var evidBody = '<div style="font:700 9px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2);margin-bottom:9px">Assessment across dimensions</div>'
    + dimStrip
    + '<div style="margin-top:15px;padding-top:14px;border-top:1px solid var(--line)">' + pvEvidCoverageBar(x.evidenceCoverage) + '</div>';
  return pvDD2Card('Recommendation', narr, 'var(--plum)', 'Evidence confidence: ' + pvAEsc(x.evidenceConfidence), '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>')
    + pvDD2Pair(
        pvDD2Card('Requirements fit', pvReqGroupMini(x.reqGroups), 'var(--plum)', 'Fit by requirement group', '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', { fill:true }),
        pvDD2Card('Opportunities &amp; concerns', pvOppConcern(x.opportunities, x.concerns), 'var(--teal-d,#2F6E6B)', 'Reasons to advance vs. concerns', '<path d="M12 3v18M6 9l6-6 6 6"/>', { fill:true })
      )
    + pvDD2Card('Evidence coverage', evidBody, 'var(--teal-d,#2F6E6B)', 'Dimensions at a glance &middot; evidenced vs. needs a source', '<path d="M4 6h16M4 12h16M4 18h10"/>');
}

/* ------------------------------------------------ 1. COMPANY & OWNERSHIP */
function pvDD2OwnTag(t){ return t === 'public' ? 'var(--teal-d,#2F6E6B)' : t === 'entity' ? 'var(--plum,#5C2B50)' : t === 'offering' ? '#2F6E6B' : t === 'infra' ? '#A2500F' : 'var(--mut2,#6a655f)'; }

/* ownership tree: nested + collapsible (native <details>) with connector rails + horizontal scroll,
   so it scales to a wide/deep corporate family instead of "barely fitting". */
function pvDD2TreeNode(n, depth){
  var color = pvDD2OwnTag(n.tag);
  var head = '<div style="display:flex;align-items:flex-start;gap:9px">'
    + '<span style="width:9px;height:9px;border-radius:50%;background:' + color + ';margin-top:5px;flex:none"></span>'
    + '<div style="min-width:0"><div style="font:700 9px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2)">' + pvAEsc(n.label) + '</div>'
    + '<div style="font-size:13px;font-weight:700;color:var(--ink)">' + pvAEsc(n.value) + '</div>'
    + (n.note ? '<div style="font-size:11px;color:var(--mut);line-height:1.4">' + pvAEsc(n.note) + '</div>' : '') + '</div></div>';
  var kids = n.children || [];
  var rail = depth > 0 ? 'border-left:2px solid var(--line);margin-left:4px;padding-left:15px' : '';
  if (!kids.length) return '<div style="' + rail + ';padding:5px 0">' + head + '</div>';
  return '<details open style="' + rail + '"><summary style="cursor:pointer;list-style:none;padding:5px 0;display:block">' + head + '</summary>'
    + '<div style="margin-left:5px">' + kids.map(function(k){ return pvDD2TreeNode(k, depth + 1); }).join('') + '</div></details>';
}
/* horizontal (left-to-right) tree: root on the left, children fan out to the right with connector
   rails. Uses horizontal space and, capped by the card's maxBody, scrolls instead of growing down. */
function pvDD2TreeNodeH(n){
  var color = pvDD2OwnTag(n.tag);
  /* The node used to be a white bordered card. Inside a white panel that reads
     as a panel within a panel, which is what it is not. It keeps the coloured
     left rule as its identity marker and otherwise sits directly on the panel. */
  var box = '<div style="flex:none;background:transparent;border:0;border-left:3px solid ' + color + ';border-radius:0;padding:5px 11px;min-width:150px;max-width:214px">'
    + '<div style="font:700 8px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + pvAEsc(n.label) + '</div>'
    + '<div style="font-size:12.5px;font-weight:700;color:var(--ink);line-height:1.25">' + pvAEsc(n.value) + '</div>'
    + (n.note ? '<div style="font-size:10.5px;color:var(--mut);line-height:1.3;margin-top:2px">' + pvAEsc(n.note) + '</div>' : '') + '</div>';
  var kids = n.children || [];
  if (!kids.length) return '<div style="display:flex;align-items:center">' + box + '</div>';
  var kidRows = kids.map(function(k){ return '<div style="display:flex;align-items:center"><span style="width:14px;height:2px;background:var(--line);flex:none"></span>' + pvDD2TreeNodeH(k) + '</div>'; }).join('');
  return '<div style="display:flex;align-items:center">' + box
    + '<span style="width:14px;height:2px;background:var(--line);flex:none"></span>'
    + '<div style="display:flex;flex-direction:column;gap:8px;border-left:2px solid var(--line)">' + kidRows + '</div></div>';
}
function pvDD2OwnershipTree(ownership, a, cand) {
  var dd = (cand && cand.deepDive) || {}, idn = dd.identity || {};
  var root = ownership && ownership.treeRoot;
  if (!root) {
    var flat = (ownership && ownership.tree) || [
      {label:'Ultimate parent', value:/independent|no parent/i.test(idn.parent || '') ? 'None, independent' : (idn.parent || 'Not verified'), tag:'public'},
      {label:'Contracting entity', value:(idn.legal || (a && a.name) || ''), note:idn.ownership || '', tag:'entity'}
    ];
    if (Array.isArray(flat)) { for (var i = flat.length - 1; i >= 0; i--) { root = Object.assign({}, flat[i], { children: root ? [root] : [] }); } }
  }
  if (!root) return '<div style="font-size:12px;color:var(--mut2)">No ownership structure on file.</div>';
  return '<div style="display:inline-block;padding:2px 2px 6px">' + pvDD2TreeNodeH(root) + '</div>';
}
/* real world basemap: accurate country geometry (world-atlas 110m) projected equirectangular in
   PVGEO_LAND (assets/pv-worldmap.js), viewBox 0 0 360 180 = degrees, dots at (lon+180, 90-lat). */
function pvDD2GeoMap(locations){
  locations = locations || [];
  var placed = [], unplaced = [];
  locations.forEach(function(l){
    if (l.coords) placed.push({ name:l.name, type:l.type, region:l.region, conf:l.conf, lon:l.coords[0], lat:l.coords[1], sub:'' });
    else if (l.pts && l.pts.length) l.pts.forEach(function(p){ placed.push({ name:l.name, type:l.type, region:l.region, conf:l.conf, lon:p.lon, lat:p.lat, sub:p.label }); });
    else unplaced.push(l);
  });
  if (!placed.length) return (typeof pvDD2FootprintMap === 'function') ? pvDD2FootprintMap(locations) : '';
  var px = function(lon){ return lon + 180; }, py = function(lat){ return 90 - lat; };
  var land = (typeof PVGEO_LAND !== 'undefined') ? '<path d="' + PVGEO_LAND + '" fill="#B7C3BE" stroke="#9AA8A2" stroke-width="0.15"/>' : '';
  var grat = '';
  for (var lon = -120; lon <= 120; lon += 60) grat += '<line x1="' + (lon + 180) + '" y1="0" x2="' + (lon + 180) + '" y2="180" stroke="#8FA6AC" stroke-width="0.3" opacity="0.5"/>';
  for (var lat = -60; lat <= 60; lat += 30) grat += '<line x1="0" y1="' + (90 - lat) + '" x2="360" y2="' + (90 - lat) + '" stroke="#8FA6AC" stroke-width="0.3" opacity="0.5"/>';
  var tcol = function(t){ return /hq|registered/i.test(t) ? 'var(--plum,#5C2B50)' : /hub|operational/i.test(t) ? 'var(--teal-d,#2F6E6B)' : /service|delivery|cloud/i.test(t) ? '#A2500F' : 'var(--mut2,#6a655f)'; };
  var dots = placed.map(function(p){
    var x = px(p.lon), y = py(p.lat), c = tcol(p.type), miss = /missing/i.test(p.conf), lab = p.sub || p.name.split(/[,(]/)[0];
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.7" fill="' + c + '" opacity="' + (miss ? 0.45 : 0.98) + '" stroke="#fff" stroke-width="0.8"><title>' + pvAEsc(p.name + ', ' + p.type + (p.region ? ' (' + p.region + ')' : '') + ', ' + p.conf) + '</title></circle>'
      + '<text x="' + (x + 3.8).toFixed(1) + '" y="' + (y + 1.7).toFixed(1) + '" font-size="5" font-family="var(--sans)" font-weight="700" fill="var(--ink)" paint-order="stroke" stroke="#DCE7EC" stroke-width="1.1">' + pvAEsc(lab) + '</text>';
  }).join('');
  var legend = '<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:11px">' + [['Registered HQ', 'var(--plum,#5C2B50)'], ['Operational hub', 'var(--teal-d,#2F6E6B)'], ['Service / cloud region', '#A2500F']].map(function(li){ return '<span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--mut)"><span style="width:9px;height:9px;border-radius:50%;background:' + li[1] + '"></span>' + li[0] + '</span>'; }).join('') + '</div>';
  return '<div style="overflow:hidden;border-radius:8px;border:1px solid var(--line2);background:#DCE7EC"><svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block">' + land + grat + dots + '</svg></div>' + legend;
}
function pvDD2LocTable(locations){
  locations = locations || [];
  if (!locations.length) return '';
  var th = function(h){ return '<th style="text-align:left;padding:0 10px 6px 0;font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + h + '</th>'; };
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11.5px"><thead><tr>' + ['Location', 'Type', 'Region', 'Evidence'].map(th).join('') + '</tr></thead><tbody>'
    + locations.map(function(l){
        return '<tr style="border-top:1px solid var(--line)"><td style="padding:7px 10px 7px 0;font-weight:600;color:var(--ink);vertical-align:top">' + pvAEsc(l.name) + '</td>'
          + '<td style="padding:7px 10px 7px 0;color:var(--mut);vertical-align:top">' + pvAEsc(l.type) + '</td>'
          + '<td style="padding:7px 10px 7px 0;color:var(--mut);vertical-align:top">' + pvAEsc(l.region) + '</td>'
          + '<td style="padding:7px 0;vertical-align:top">' + pvEvidChip(l.conf) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
}

function pvDD2Footprint(locations) {
  if (!locations || !locations.length) return '<div style="font-size:12px;color:var(--mut2)">No delivery-relevant locations on file.</div>';
  return '<div style="overflow-x:auto"><table class="pvdl"><tbody>' + locations.map(function(l){
      return '<tr><td class="dt" style="white-space:nowrap;vertical-align:top">' + pvAEsc(l.name) + '</td>'
        + '<td class="dd" style="vertical-align:top"><span style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:var(--teal-d,#2F6E6B);background:var(--teal-t,#B6CCCB);border-radius:20px;padding:2px 8px">' + pvAEsc(l.type) + '</span></td>'
        + '<td class="dd" style="vertical-align:top;color:var(--mut)">' + pvAEsc(l.region) + '</td>'
        + '<td class="dd" style="vertical-align:top">' + pvEvidChip(l.conf) + '</td></tr>';
    }).join('') + '</tbody></table></div>'
    + pvDD2Foot('Only delivery-relevant locations, not every registered office. A geographic map can follow where precise coordinates are sourced.');
}

/* Firmographics with Identity Verification merged in: company facts, each carrying its verified /
   missing / supplier-asserted marker where one applies. */
function pvDD2Firmographics(rows){
  var chip = function(st){
    if (!st) return '';
    var c = /verif/i.test(st) ? 'var(--teal-d,#2F6E6B)' : /assert/i.test(st) ? '#A2500F' : 'var(--mut2,#6a655f)';
    var bg = /verif/i.test(st) ? 'var(--teal-t,#B6CCCB)' : /assert/i.test(st) ? 'var(--ti-amber,#ECCFBA)' : 'var(--nested,#EDE8E0)';
    return '<span style="font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:' + c + ';background:' + bg + ';border-radius:20px;padding:2px 8px;white-space:nowrap">' + pvAEsc(st) + '</span>';
  };
  return '<table style="width:100%;border-collapse:collapse;font-size:12.5px">' + rows.filter(function(r){ return r && r.v; }).map(function(r){
      return '<tr style="border-top:1px solid var(--line)"><td style="padding:8px 12px 8px 0;color:var(--mut2);font-weight:600;vertical-align:top;width:150px">' + pvAEsc(r.k) + '</td>'
        + '<td style="padding:8px 0;color:var(--ink);vertical-align:top;line-height:1.5">' + pvAEsc(r.v) + '</td>'
        + '<td style="padding:8px 0 8px 10px;vertical-align:top;text-align:right;white-space:nowrap">' + chip(r.st) + '</td></tr>';
    }).join('') + '</table>';
}
function pvDD2Company(x, a, cand, input) {
  var dd = cand.deepDive || {}, idn = dd.identity || {}, comp = dd.company || {}, at = dd.attrs || {};
  var clean = function(v){ return v == null ? '' : String(v); };
  var beforeSemi = function(v){ v = clean(v); return v ? v.split(';')[0].trim() : ''; };
  var beforeParen = function(v){ v = clean(v); return v ? v.split('(')[0].trim() : ''; };
  var markerRows = (x.ownership && x.ownership.markers) || [
    ['Public / private', idn.legal ? 'Verified' : 'Missing', idn.ownership || ''],
    ['Lilly vendor-master match', 'Missing', 'Not checked'],
    ['Contracting entity confirmed', 'Supplier asserted', 'Confirm in RFx']
  ];
  var mBy = {}; markerRows.forEach(function(r){ mBy[String(r[0]).toLowerCase()] = r; });
  var pick = function(lbl){ var r = mBy[lbl.toLowerCase()]; return r ? { k: r[0], v: r[2], st: r[1] } : null; };
  var firmoRows = [
    { k:'Legal entity', v: idn.legal, st:'Verified' },
    pick('Public / private'), pick('Ultimate parent'), pick('Beneficial ownership'),
    { k:'Incorporation', v: beforeParen(idn.jurisdiction), st:'' },
    { k:'Corporate HQ', v: beforeSemi(at.hq) || beforeSemi(comp.footprint), st:'' },
    { k:'Founded', v: comp.founded || at.founded, st:'' },
    { k:'Leadership', v: comp.leadership, st:'' },
    { k:'Headcount', v: comp.headcount, st:'' },
    pick('Sanctions / watchlist'), pick('Lilly vendor-master match'), pick('Contracting entity confirmed')
  ].filter(Boolean);
  return pvDD2AssessStrip(x, 'identity')
    + pvDD2Pair(
        pvDD2Card('Firmographics', pvDD2Firmographics(firmoRows), 'var(--plum)', 'Company facts + verification', '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>', { fill:true }),
        pvDD2Card('Ownership &amp; Control', pvDD2OwnershipTree(x.ownership, a, cand), 'var(--teal-d)', 'Corporate family', '<circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5H6v5M12 11.5h6v5"/>', { fill:true, maxBody:400 })
      )
    + pvDD2Card('Operating Footprint',
        '<div style="display:grid;grid-template-columns:minmax(340px,1.55fr) minmax(240px,1fr);gap:24px;align-items:start"><div style="min-width:0">' + pvDD2GeoMap(x.locations) + '</div><div style="min-width:0">' + pvDD2LocTable(x.locations) + '</div></div>',
        'var(--teal-d)', 'Delivery-relevant locations', '<circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 00-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 00-8-8z"/>');
}

/* --------------------------------------------- 2. CAPABILITIES & OPERATIONS */
function pvDD2CapCell(s) {
  return s === 'Confirmed' ? {c:'#fff', bg:'var(--teal-d,#2F6E6B)', t:'Confirmed'}
    : s === 'Partially confirmed' ? {c:'#153B37', bg:'#9DC6C0', t:'Partial'}
    : s === 'Supplier asserted' ? {c:'#fff', bg:'#A2500F', t:'Asserted'}
    : s === 'Not demonstrated' ? {c:'#fff', bg:'#C15E19', t:'Not dem.'}
    : s === 'Gap' ? {c:'#fff', bg:'#C15E19', t:'Gap'}
    : {c:'var(--mut2,#6a655f)', bg:'var(--nested,#EDE8E0)', t:'N/A'};
}
/* capability-to-requirement heatmap: solid, high-visibility cells (matches the Requirements Heatmap weight). */
function pvDD2CapHeatmap(capabilities) {
  if (!capabilities || !capabilities.rows) return '<div style="font-size:12px;color:var(--mut2)">No validated capability map on file.</div>';
  var head = '<tr><th style="width:1%"></th>' + capabilities.cols.map(function(c){ return '<th style="font:700 9px var(--mono,monospace);letter-spacing:.03em;text-transform:uppercase;color:var(--mut2);padding:0 4px 8px;text-align:center">' + pvAEsc(c) + '</th>'; }).join('') + '</tr>';
  var rows = capabilities.rows.map(function(r){
    return '<tr><td style="font-size:12.5px;font-weight:600;color:var(--ink);padding:4px 12px 4px 0;white-space:nowrap">' + pvAEsc(r.cap) + '</td>'
      + r.cells.map(function(s){ var m = pvDD2CapCell(s); return '<td style="padding:3px"><div title="' + pvAEsc(s) + '" style="font:700 9.5px var(--mono,monospace);letter-spacing:.02em;text-transform:uppercase;color:' + m.c + ';background:' + m.bg + ';border-radius:5px;padding:10px 4px;text-align:center;line-height:1.1">' + m.t + '</div></td>'; }).join('')
      + '</tr>';
  }).join('');
  var legend = '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:11px;font-size:11px;color:var(--mut)">' + [['Confirmed', 'var(--teal-d,#2F6E6B)'], ['Partial', '#9DC6C0'], ['Asserted', '#A2500F'], ['Not demonstrated / gap', '#C15E19'], ['N/A', 'var(--nested,#EDE8E0)']].map(function(l){ return '<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:12px;height:10px;border-radius:3px;background:' + l[1] + '"></span>' + l[0] + '</span>'; }).join('') + '</div>';
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' + legend;
}
function pvDD2RefTick(v) {
  return v === true ? '<span style="color:#2F6E6B;font-weight:800">&#10003;</span>'
    : v === 'partial' ? '<span style="color:#A2500F;font-weight:700">~</span>'
    : '<span style="color:var(--mut2,#6a655f)">, </span>';
}
function pvDD2RefMatrix(refs) {
  if (!refs || !refs.length) return '';
  var cols = ['Pharma', 'Similar scale', 'Similar use case', 'Independently verified'];
  var head = '<tr><th style="text-align:left;font-size:11px;color:var(--mut2);padding-bottom:4px">Reference</th>' + cols.map(function(c){ return '<th style="font-size:10px;color:var(--mut2);padding:0 8px 4px;text-align:center">' + c + '</th>'; }).join('') + '</tr>';
  var rows = refs.map(function(r){ return '<tr style="border-top:1px solid var(--line)"><td style="font-size:12px;font-weight:600;color:var(--ink);padding:6px 8px 6px 0">' + pvAEsc(r.name) + '</td><td style="text-align:center">' + pvDD2RefTick(r.pharma) + '</td><td style="text-align:center">' + pvDD2RefTick(r.scale) + '</td><td style="text-align:center">' + pvDD2RefTick(r.useCase) + '</td><td style="text-align:center">' + pvDD2RefTick(r.verified) + '</td></tr>'; }).join('');
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>'
    + pvDD2Foot('Stops "has major customers" counting as validated evidence, a reference matters only if it is pharma, similar scale, similar use case, and independently verified.');
}
/* delivery-readiness staged bars: needed -> proxy -> partial -> demonstrated -> complete */
function pvDD2Readiness(items){
  if (!items || !items.length) return '<div style="font-size:12px;color:var(--mut2)">No delivery-readiness assessment on file.</div>';
  var order = { 'Needed':1, 'Confirmation needed':1, 'Proxy':2, 'Partial':3, 'Partially validated':3, 'Demonstrated':4, 'Complete':5 };
  var col = function(n){ return n >= 4 ? 'var(--teal-d,#2F6E6B)' : n === 3 ? '#A2500F' : 'var(--mut2,#6a655f)'; };
  return '<div style="display:flex;flex-direction:column;gap:12px">' + items.map(function(it){
      var n = order[it.state] || 1, c = col(n), segs = '';
      for (var i = 1; i <= 5; i++) segs += '<span style="flex:1;height:7px;border-radius:3px;background:' + (i <= n ? c : 'var(--line,#e5e1db)') + '"></span>';
      return '<div style="display:grid;grid-template-columns:minmax(120px,168px) 1fr minmax(96px,140px);gap:12px;align-items:center">'
        + '<span style="font-size:12px;font-weight:600;color:var(--ink)">' + pvAEsc(it.label) + '</span>'
        + '<div style="display:flex;gap:3px">' + segs + '</div>'
        + '<span style="font-size:11.5px;font-weight:700;color:' + c + ';text-align:right">' + pvAEsc(it.state) + '</span></div>';
    }).join('') + '</div>' + pvDD2Foot('Stage: needed &rarr; proxy &rarr; partial &rarr; demonstrated &rarr; complete. Grounded in the evidence on file.');
}
/* delivery-dependency chain (reuses the tree renderer); undisclosed sub-tiers are gap-stated */
function pvDD2Dependency(dep){
  if (!dep || !dep.root) return '<div style="font-size:12.5px;color:var(--ink);line-height:1.55"><b>Critical sub-tier dependencies not yet disclosed.</b> Identify the implementation partner, cloud regions and support subcontractors in the RFx.</div>';
  return '<div style="display:inline-block;padding:2px 2px 6px">' + pvDD2TreeNodeH(dep.root) + '</div>';
}
function pvDD2Caps(x, a, cand, input) {
  var dd = cand.deepDive || {}, idn = dd.identity || {};
  var refInner = x.references ? pvDD2RefMatrix(x.references)
    : (dd.clients ? '<div style="font-size:12.5px;color:var(--ink);line-height:1.55">' + pvAEsc(dd.clients) + '</div>' : '<div style="font-size:12px;color:var(--mut2)">No reference data on file.</div>');
  var rg = x.reqGroups || [];
  var strong = rg.filter(function(g){ return g.fitLabel === 'Strong' || g.fitLabel === 'Meets'; }).length;
  var soft = rg.filter(function(g){ return g.fitLabel === 'Partial' || g.fitLabel === 'Gap'; });
  var capNarr = '<div style="font-size:12.5px;line-height:1.55;color:var(--ink);margin-bottom:13px"><b>' + pvAEsc(a.name) + '</b> meets <b>' + strong + ' of ' + rg.length + '</b> requirement groups strongly'
    + (soft.length ? '; the soft spots are <b>' + pvAEsc(soft.map(function(g){ return g.label; }).join(', ')) + '</b>. Confirm these in the RFP.' : ' with no material gaps.') + '</div>';
  var deliveryLine = idn.delivery ? '<div style="font-size:12px;color:var(--mut);margin-bottom:12px"><b style="color:var(--mut2)">Delivery model &middot;</b> ' + pvAEsc(idn.delivery) + '</div>' : '';
  return pvDD2AssessStrip(x, 'capability')
    + pvDD2Card('Capability to Requirement', capNarr + pvDD2CapHeatmap(x.capabilities),
        'var(--teal-d)', 'Can they deliver at scale?', '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')
    + pvDD2Card('Reference Relevance', refInner, 'var(--emph)', 'Pharma · scale · use-case · independently verified', '<path d="M4 5h16M4 5v14M4 12h10M4 19h16"/>')
    + pvDD2Pair(
        pvDD2Card('Delivery Readiness', deliveryLine + pvDD2Readiness(x.deliveryReadiness), 'var(--plum)', 'Maturity to support model', '<path d="M3 12h4l3 7 4-14 3 7h4"/>', { fill:true }),
        pvDD2Card('Delivery Dependencies', pvDD2Dependency(x.dependencies), 'var(--emph)', 'Sub-tier chain, gap-stated', '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M6 8.5v3a2 2 0 002 2h8a2 2 0 002-2v-3M12 13.5v2"/>', { fill:true, maxBody:300 })
      );
}

/* ------------------------------------------------ 3. FINANCIAL & MARKET */
/* peer-position scatter: every eligible candidate by financial viability (x) and
   capability fit (y); selected supplier highlighted. Both axes from the shared model. */
function pvDD2PeerScatter(refl, input, selId) {
  var asmts = (refl && refl.landscape && refl.landscape.assessments) || [];
  if (asmts.length < 2 || typeof pvCandById !== 'function') return '';
  var W = 520, H = 300, padL = 46, padB = 40, padT = 14, padR = 16;
  var plotW = W - padL - padR, plotH = H - padT - padB;
  var sx = function(v){ return padL + (v / 5) * plotW; };
  var sy = function(v){ return padT + plotH - (v / 5) * plotH; };
  var grid = '';
  for (var g = 1; g < 5; g++) grid += '<line x1="' + sx(g) + '" y1="' + padT + '" x2="' + sx(g) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/><line x1="' + padL + '" y1="' + sy(g) + '" x2="' + (padL + plotW) + '" y2="' + sy(g) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/>';
  var dots = asmts.map(function(av){
    var pv = pvAssess(av, pvCandById(av.id), input);
    var finDim = pv.dimensions.find(function(d){ return d.id === 'financial'; }) || {};
    var fav = (THEO_CONCERN[finDim.concern] || {fav:0.5}).fav;
    var x = sx(fav * 5), y = sy(pv.fit.score5 || 0), sel = av.id === selId;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (sel ? 7 : 5) + '" fill="' + (sel ? '#C15E19' : '#5C2B50') + '" opacity="' + (av.eligible ? 0.9 : 0.35) + '"/><text x="' + (x + 8) + '" y="' + (y + 3) + '" font-family="var(--mono,monospace)" font-size="9" fill="' + (sel ? '#C15E19' : 'var(--mut,#4A443C)') + '">' + pvAEsc((av.name || '').split(/[,]/)[0]) + '</text>';
  }).join('');
  return '<div style="overflow-x:auto"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px;height:auto">'
    + grid
    + '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (padL + plotW) + '" y2="' + (padT + plotH) + '" stroke="var(--line2)" stroke-width="1"/><line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH) + '" stroke="var(--line2)" stroke-width="1"/>'
    + '<text x="' + (padL + plotW / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="var(--mut2)">Financial viability &rarr;</text>'
    + '<text x="13" y="' + (padT + plotH / 2) + '" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="var(--mut2)" transform="rotate(-90 13 ' + (padT + plotH / 2) + ')">Capability fit &rarr;</text>'
    + dots + '</svg></div>'
    + pvDD2Foot('Each supplier plotted by financial viability (x) and capability fit (y); the selected supplier is highlighted. Surfaces strong-capability / weak-financial vs. balanced candidates.');
}
function pvDD2VarColor(v){ return /high|significant|exposure/i.test(v) ? 'var(--emph,#C15E19)' : /moderate/i.test(v) ? '#A2500F' : 'var(--teal-d,#2F6E6B)'; }
function pvDD2CommercialDrivers(drivers) {
  if (!drivers || !drivers.length) return '';
  var w = function(v){ return /high|significant/i.test(v) ? 92 : /exposure/i.test(v) ? 68 : /moderate/i.test(v) ? 52 : 28; };
  return '<div style="display:flex;flex-direction:column;gap:8px">' + drivers.map(function(d){
      var c = pvDD2VarColor(d.variability);
      return '<div style="display:grid;grid-template-columns:150px 1fr 160px;gap:12px;align-items:center" title="' + pvAEsc(d.note || '') + '"><span style="font-size:12px;font-weight:600;color:var(--ink)">' + pvAEsc(d.driver) + '</span><div style="height:8px;border-radius:30px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:' + w(d.variability) + '%;background:' + c + '"></i></div><span style="font-size:11px;color:' + c + ';font-weight:600">' + pvAEsc(d.variability) + '</span></div>';
    }).join('') + '</div>' + pvDD2Foot('Cost-driver variability, not a fabricated annual $, precise TCO comes from RFx bids and internal usage assumptions.');
}
/* ---- Financial & Market: D&B/Bloomberg-grade rebuild (Marc 2026-07-23) ----
   Dominant Financial Health = full-size revenue trend + Bloomberg-style NUMERIC metric table (discrete
   numbers from x.financial, not prose) + calculated ratios. Supporting: health bridge, enlarged peer
   scatter + peer-comps table, commercial model. Collapsible comparative detail names what is NOT in the
   snapshot. Licensed-feed items render as marked enrichment slots, gated by PVDD2_FIN_ENRICH so we can
   show the page with and without them. Nothing fabricated: figures grounded, ratios labelled Calculated. */
var PVDD2_FIN_ENRICH = true; // toggle (flip window.PVDD2_FIN_ENRICH then re-render) to compare with / without slots
var PVIC_FINHEALTH = '<path d="M4 5v14h16"/><path d="M5 15l4-5 4 3 6-8"/>';
var PVIC_BRIDGE    = '<rect x="4" y="10" width="3.4" height="9" rx="1"/><rect x="10.3" y="6" width="3.4" height="13" rx="1"/><rect x="16.6" y="13" width="3.4" height="6" rx="1"/>';
var PVIC_SCATTER   = '<path d="M4 20h16M4 20V4"/><circle cx="8" cy="15" r="1.5"/><circle cx="13" cy="9" r="1.5"/><circle cx="18" cy="6" r="1.5"/>';
var PVIC_COMM      = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.6 9.8h4.2M9.6 14.2h4.2"/>';
var PVIC_ENRICH    = '<path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 15.9 7.2 17.4l.9-5.2L4.3 8.5l5.2-.8z"/>';
function pvDD2FinDots(conf){
  var n = /high/i.test(conf) ? 3 : /med|calc/i.test(conf) ? 2 : /low|unknown|insuff|not/i.test(conf) ? 1 : 0;
  var s = '';
  for (var i = 0; i < 3; i++) s += '<span style="width:5px;height:5px;border-radius:50%;display:inline-block;margin-left:2px;background:' + (i < n ? 'var(--teal-d,#2F6E6B)' : 'var(--line2,#d8d4ce)') + '"></span>';
  return '<span style="white-space:nowrap" title="Evidence confidence: ' + pvAEsc(conf || 'Unknown') + '">' + s + '</span>';
}
/* full-size revenue trend: y-axis + gridlines + value labels + trend line; fills its column */
function pvDD2RevTrend(series){
  series = (series || []).filter(function(p){ return p && p.value != null && isFinite(p.value); });
  if (series.length < 3) return '';
  var W = 560, H = 236, padL = 50, padR = 16, padT = 22, padB = 32, plotW = W - padL - padR, plotH = H - padT - padB;
  var max = Math.max.apply(null, series.map(function(p){ return p.value; }));
  var niceMax = Math.max(max, Math.ceil(max / 1000) * 1000) || 1;
  var sy = function(v){ return padT + plotH - (v / niceMax) * plotH; };
  var n = series.length, band = plotW / n, bw = Math.min(52, band * 0.5);
  var bfmt = function(v){ return '$' + (v / 1000).toFixed(v >= 1000 ? 1 : 2) + 'B'; };
  var grid = '';
  for (var g = 0; g <= 4; g++){
    var yv = niceMax * g / 4, y = sy(yv);
    grid += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (padL + plotW) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)" stroke-width="1"' + (g ? ' stroke-dasharray="2 3"' : '') + '/>'
      + '<text x="' + (padL - 8) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end" font-size="9.5" font-family="var(--mono,monospace)" fill="var(--mut2)">' + (g ? '$' + (yv / 1000).toFixed(1) + 'B' : '0') + '</text>';
  }
  var cols = '', pts = [];
  series.forEach(function(p, i){
    var x = padL + i * band + (band - bw) / 2, h = Math.max(2, (p.value / niceMax) * plotH), y = padT + plotH - h, isLast = i === n - 1;
    pts.push((x + bw / 2).toFixed(1) + ',' + y.toFixed(1));
    cols += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + (isLast ? 'var(--teal-d,#2F6E6B)' : 'var(--teal-t,#B6CCCB)') + '"' + (isLast ? '' : ' stroke="var(--teal-d,#2F6E6B)" stroke-width="1.1"') + '><title>' + pvAEsc(p.period + ': ' + bfmt(p.value)) + '</title></rect>'
      + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle" font-size="10" font-family="var(--mono,monospace)" font-weight="700" fill="var(--ink)">' + bfmt(p.value) + '</text>'
      + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 11) + '" text-anchor="middle" font-size="10" font-family="var(--mono,monospace)" fill="var(--mut2)">' + pvAEsc(p.period) + '</text>';
  });
  var line = '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--teal-d,#2F6E6B)" stroke-width="1.3" stroke-dasharray="3 3" opacity="0.5"/>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:600px;height:auto;display:block" role="img" aria-label="Revenue by fiscal year">' + grid + line + cols + '</svg>';
}
/* Bloomberg-style numeric metric table: discrete value + period + confidence */
function pvDD2FinMetricTable(metrics){
  if (!metrics || !metrics.length) return '';
  var th = function(t, a){ return '<th style="text-align:' + a + ';padding:0 0 6px ' + (a === 'left' ? '0' : '10px') + ';font:700 8.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2)">' + t + '</th>'; };
  return '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>' + th('Metric', 'left') + th('Value', 'right') + th('Period', 'right') + '<th style="width:0"></th></tr></thead><tbody>'
    + metrics.map(function(m){
        var neg = /^\(|^-|loss|^\$\(/.test(String(m.value));
        return '<tr style="border-top:1px solid var(--line)"><td style="padding:6px 0;color:var(--ink)">' + pvAEsc(m.label) + '</td>'
          + '<td style="padding:6px 0 6px 10px;text-align:right;font-variant-numeric:tabular-nums;font-weight:700;color:' + (neg ? '#A2500F' : 'var(--ink)') + '">' + pvAEsc(m.value) + '</td>'
          + '<td style="padding:6px 0 6px 10px;text-align:right;color:var(--mut2);white-space:nowrap;font-size:11px">' + pvAEsc(m.period || '') + '</td>'
          + '<td style="padding:6px 0 6px 8px;text-align:right">' + pvDD2FinDots(m.conf || 'High') + '</td></tr>';
      }).join('') + '</tbody></table>';
}
/* calculated ratio chips (labelled Calculated, never a reported figure) */
function pvDD2FinRatios(ratios){
  if (!ratios || !ratios.length) return '';
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px;margin-top:16px">'
    + ratios.map(function(r){
        var neg = /^-|\(/.test(String(r.value));
        return '<div style="background:var(--nested,#EDE8E0);border-radius:9px;padding:8px 11px">'
          + '<div style="font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + pvAEsc(r.label) + '</div>'
          + '<div style="font-size:17px;font-weight:800;color:' + (neg ? '#A2500F' : 'var(--teal-d,#2F6E6B)') + ';font-variant-numeric:tabular-nums;margin:2px 0 1px">' + pvAEsc(r.value) + '</div>'
          + '<div style="font-size:10px;color:var(--mut);line-height:1.35">' + pvAEsc(r.basis || '') + '</div></div>';
      }).join('') + '</div>'
    + '<div style="font-size:10px;color:var(--mut2);margin-top:7px">Calculated from the figures above, not reported values.</div>';
}
function pvDD2FinBridge(fin){
  fin = fin || {};
  function sign(v){ v = String(v || ''); if (/declin|contract|net loss|down\b|negativ|deficit|not\s+(yet\s+)?profit/i.test(v)) return -1; if (/grow|increas|positive|profitab|strong|\+\s*\d/i.test(v)) return 1; return 0; }
  var growth = fin.growth || '', profit = fin.profitability || '';
  var cashM = /free cash flow[^;]*/i.exec(profit) || /free cash flow[^;]*/i.exec(fin.margin || '');
  var dims = [
    { k:'Growth', band: growth ? (sign(growth) > 0 ? 'good' : 'warn') : 'gap', assess: growth ? (sign(growth) > 0 ? 'Strong' : 'Watch') : 'Not reported', ev: growth || 'No growth figure on file.', conf: growth ? 'High' : 'Unknown' },
    { k:'Profitability', band: profit ? (sign(profit) > 0 ? 'good' : 'warn') : 'gap', assess: profit ? (sign(profit) > 0 ? 'Positive' : 'Mixed') : 'Not reported', ev: profit || 'No profitability figure on file.', conf: profit ? 'High' : 'Unknown' },
    { k:'Cash generation', band: cashM ? 'good' : 'gap', assess: cashM ? 'Strong' : 'Not in snapshot', ev: cashM ? cashM[0].replace(/^./, function(c){ return c.toUpperCase(); }) : 'Free-cash-flow figure not isolated in the public snapshot.', conf: cashM ? 'High' : 'Low' },
    { k:'Leverage & obligations', band:'gap', assess:'Not in snapshot', ev:'Debt, leverage and balance-sheet detail are not in this public snapshot; precise figures come from filings or an RFx financial pack.', conf:'Low' }
  ];
  var col = { good:'var(--teal-d,#2F6E6B)', warn:'#A2500F', gap:'var(--mut2,#6a655f)' };
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px">' + dims.map(function(d){
      return '<div style="border-left:3px solid ' + col[d.band] + ';padding:1px 0 1px 11px">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><span style="font:700 9.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2)">' + pvAEsc(d.k) + '</span>' + pvDD2FinDots(d.conf) + '</div>'
        + '<div style="font-size:13px;font-weight:800;color:' + col[d.band] + ';margin:3px 0 4px">' + pvAEsc(d.assess) + '</div>'
        + '<div style="font-size:11px;color:var(--mut);line-height:1.45">' + pvAEsc(d.ev) + '</div></div>';
    }).join('') + '</div>';
}
/* enlarged peer scatter: axes zoomed to the data range so the field spreads out; bigger palette dots;
   selected supplier in emphasis colour; labels de-collided vertically */
function pvDD2PeerScatterBig(refl, input, selId){
  var asmts = (refl && refl.landscape && refl.landscape.assessments) || [];
  if (asmts.length < 2 || typeof pvCandById !== 'function' || typeof pvAssess !== 'function') return '';
  var pts = asmts.map(function(av){
    var pv = pvAssess(av, pvCandById(av.id), input);
    var finDim = pv.dimensions.find(function(d){ return d.id === 'financial'; }) || {};
    var fav = (THEO_CONCERN[finDim.concern] || { fav: 0.5 }).fav;
    return { name: (av.name || '').split(/[,]/)[0], x: fav, y: (pv.fit.score5 || 0) / 5, elig: !!av.eligible, sel: av.id === selId };
  });
  var xs = pts.map(function(p){ return p.x; }), ys = pts.map(function(p){ return p.y; });
  var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs), ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
  var xpad = Math.max(0.1, (xmax - xmin) * 0.4), ypad = Math.max(0.1, (ymax - ymin) * 0.4);
  var dxmin = Math.max(0, xmin - xpad), dxmax = Math.min(1, xmax + xpad), dymin = Math.max(0, ymin - ypad), dymax = Math.min(1, ymax + ypad);
  if (dxmax - dxmin < 0.001) { dxmin = Math.max(0, dxmin - 0.1); dxmax = Math.min(1, dxmax + 0.1); }
  if (dymax - dymin < 0.001) { dymin = Math.max(0, dymin - 0.1); dymax = Math.min(1, dymax + 0.1); }
  var W = 560, H = 372, padL = 46, padR = 20, padT = 16, padB = 38, plotW = W - padL - padR, plotH = H - padT - padB;
  var sx = function(v){ return padL + ((v - dxmin) / (dxmax - dxmin)) * plotW; };
  var sy = function(v){ return padT + plotH - ((v - dymin) / (dymax - dymin)) * plotH; };
  var grid = '';
  for (var g = 1; g < 4; g++) grid += '<line x1="' + (padL + plotW * g / 4) + '" y1="' + padT + '" x2="' + (padL + plotW * g / 4) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-dasharray="2 3"/><line x1="' + padL + '" y1="' + (padT + plotH * g / 4) + '" x2="' + (padL + plotW) + '" y2="' + (padT + plotH * g / 4) + '" stroke="var(--line)" stroke-dasharray="2 3"/>';
  var placed = [];
  var dots = pts.map(function(p){
    var cx = sx(p.x), cy = sy(p.y), col = p.sel ? 'var(--emph,#C15E19)' : (p.elig ? 'var(--teal-d,#2F6E6B)' : 'var(--mut2,#6a655f)'), r = p.sel ? 8 : 6;
    var ly = cy + 3;
    placed.slice().sort(function(a, b){ return a - b; }).forEach(function(py){ if (Math.abs(ly - py) < 13) ly = py + 13; });
    placed.push(ly);
    return '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r + '" fill="' + col + '" opacity="' + (p.elig ? 0.95 : 0.4) + '"/>'
      + '<text x="' + (cx + r + 4).toFixed(1) + '" y="' + ly.toFixed(1) + '" font-size="11.5" font-family="var(--sans)" font-weight="' + (p.sel ? '700' : '400') + '" fill="' + (p.sel ? 'var(--emph,#C15E19)' : 'var(--mut,#4A443C)') + '">' + pvAEsc(p.name) + '</text>';
  }).join('');
  return '<div style="overflow-x:auto"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:600px;height:auto">' + grid
    + '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (padL + plotW) + '" y2="' + (padT + plotH) + '" stroke="var(--line2)"/><line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH) + '" stroke="var(--line2)"/>'
    + '<text x="' + (padL + plotW / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10.5" font-family="var(--sans)" fill="var(--mut2)">Financial viability &rarr;</text>'
    + '<text x="14" y="' + (padT + plotH / 2) + '" text-anchor="middle" font-size="10.5" font-family="var(--sans)" fill="var(--mut2)" transform="rotate(-90 14 ' + (padT + plotH / 2) + ')">Capability fit &rarr;</text>'
    + dots + '</svg></div>' + pvDD2Foot('Axes zoomed to the candidate range so the field spreads; the selected supplier is highlighted. Upper-right = strong capability + low financial risk.');
}
/* peer comps table (fills the right column of Peer Position with real comparison) */
function pvDD2PeerComps(refl, input, selId){
  var asmts = (refl && refl.landscape && refl.landscape.assessments) || [];
  if (!asmts.length || typeof pvCandById !== 'function' || typeof pvAssess !== 'function') return '';
  var rows = asmts.map(function(av){
    var pv = pvAssess(av, pvCandById(av.id), input);
    var finDim = pv.dimensions.find(function(d){ return d.id === 'financial'; }) || {};
    return { name: (av.name || '').split(/[,]/)[0], fit: pv.fit.label, fit5: pv.fit.score5 || 0, risk: finDim.concern || 'Unknown', sel: av.id === selId };
  }).sort(function(a, b){ return b.fit5 - a.fit5; });
  var th = function(t, i){ return '<th style="text-align:' + (i ? 'right' : 'left') + ';padding:0 0 6px ' + (i ? '10px' : '0') + ';font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + t + '</th>'; };
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>' + ['Supplier', 'Capability fit', 'Financial risk'].map(th).join('') + '</tr></thead><tbody>'
    + rows.map(function(r){
        return '<tr style="border-top:1px solid var(--line)' + (r.sel ? ';background:var(--emph-t,#ECCFBA)' : '') + '">'
          + '<td style="padding:7px 0 7px ' + (r.sel ? '6px' : '0') + ';font-weight:' + (r.sel ? '800' : '600') + ';color:var(--ink)">' + pvAEsc(r.name) + '</td>'
          + '<td style="padding:7px 0 7px 10px;text-align:right;color:var(--ink)">' + pvAEsc(r.fit) + '</td>'
          + '<td style="padding:7px 0 7px 10px;text-align:right;color:var(--mut)">' + pvAEsc(r.risk) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
}
function pvDD2PeerRead(refl, input, a, at, x){
  var me = (a && a.name) || 'This supplier';
  var finLabel = ((x && (x.dimensions.find(function(d){ return d.id === 'financial'; }) || {}).concern) || '').toLowerCase();
  var bullets = [];
  bullets.push('<b>' + pvAEsc(me) + '</b> sits in the strong-capability, ' + pvAEsc(finLabel || 'stable') + '-financial-risk group, upper-right of the field.');
  if (at && at.gartner) bullets.push('<b>Analyst position &middot;</b> ' + pvAEsc(at.gartner));
  return '<ul style="margin:0 0 2px;padding-left:16px;display:flex;flex-direction:column;gap:8px;font-size:12.5px;line-height:1.5;color:var(--ink)">'
    + bullets.map(function(b){ return '<li>' + b + '</li>'; }).join('') + '</ul>';
}
function pvDD2FinStatement(fin, st){
  fin = fin || {};
  var hist = (st && st.revByYear && st.revByYear.length) ? st.revByYear.map(function(p){ return { period: p.period, value: '$' + (p.value / 1000).toFixed(2) + 'B' }; }) : (fin.revenueHistory || []);
  var histTbl = hist.length ? '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;margin-bottom:9px">'
      + '<thead><tr><th style="text-align:left;padding:4px 14px 4px 0;font:700 10px var(--mono,monospace);color:var(--mut2)">Total revenue</th>' + hist.map(function(h){ return '<th style="text-align:right;padding:4px 0 4px 16px;font:700 10px var(--mono,monospace);color:var(--mut2)">' + pvAEsc(h.period) + '</th>'; }).join('') + '</tr></thead>'
      + '<tbody><tr><td style="padding:4px 14px 4px 0;color:var(--mut2);font-size:11px">$M, by fiscal year</td>' + hist.map(function(h){ return '<td style="text-align:right;padding:4px 0 4px 16px;font-variant-numeric:tabular-nums;color:var(--ink);font-weight:600">' + pvAEsc(h.value) + '</td>'; }).join('') + '</tr></tbody></table></div>' : '';
  var missing = '<b>Not in this public snapshot:</b> full balance sheet (assets, liabilities, equity), liquidity &amp; leverage ratios, trade-payment behaviour (PAYDEX / days-beyond-terms) and a model default probability. These come from filings, a commercial-credit provider, or an RFx financial pack.';
  return '<details style="margin-top:12px;border-top:1px solid var(--line);padding-top:9px"><summary style="cursor:pointer;font-size:12px;font-weight:700;color:var(--teal-d,#2F6E6B)">Comparative financials &amp; data not in the snapshot</summary>'
    + '<div style="padding:11px 0 2px">' + histTbl + '<div style="font-size:11px;color:var(--mut);line-height:1.5">' + missing + '</div></div></details>';
}
/* marked enrichment slots for licensed D&B/Bloomberg fields we do NOT hold (schema-ready, not faked) */
function pvDD2FinEnrich(list){
  if (!list || !list.length) return '';
  var inner = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px">'
    + list.map(function(e){
        return '<div style="border:1px dashed var(--line2,#c9c4bc);border-radius:9px;padding:10px 12px;background:repeating-linear-gradient(135deg,transparent,transparent 7px,rgba(0,0,0,.02) 7px,rgba(0,0,0,.02) 14px)">'
          + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:3px"><span style="font-size:12px;font-weight:700;color:var(--ink);line-height:1.3">' + pvAEsc(e.label) + '</span><span style="font:700 8px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--plum,#5C2B50);background:var(--plum-t,#C6B5C2);border-radius:20px;padding:2px 7px;white-space:nowrap;flex:none">' + pvAEsc(e.src) + '</span></div>'
          + '<div style="font-size:11px;color:var(--mut);line-height:1.4">' + pvAEsc(e.note) + '</div>'
          + '<div style="font-size:10px;color:var(--mut2);margin-top:6px;font-style:italic">Awaiting licensed feed</div></div>';
      }).join('') + '</div>'
    + pvDD2Foot('Standard D&amp;B / Bloomberg fields we do not license in this snapshot, shown as schema-ready slots so the profile is explicit about what is evidenced vs. what needs a paid source.');
  return '<details style="margin-top:-2px"><summary style="cursor:pointer;font-size:12.5px;font-weight:700;color:var(--plum,#5C2B50);padding:2px 0">Show ' + list.length + ' enrichment slots (D&amp;B / Bloomberg), not licensed in this snapshot</summary><div style="padding-top:13px">' + inner + '</div></details>';
}
function pvDD2FinMkt(x, a, cand, input, refl){
  var dd = cand.deepDive || {}, fin = cand.financials || dd.financials || {}, at = dd.attrs || {};
  var st = (x && x.financial) || null;
  var enrich = (typeof PVDD2_FIN_ENRICH === 'undefined') ? true : PVDD2_FIN_ENRICH;
  // revenue series: structured numbers preferred, else parse the prose revenueHistory
  var series = (st && st.revByYear && st.revByYear.length) ? st.revByYear
    : (fin.revenueHistory || []).map(function(h){ var m = /\$?\s*([\d.,]+)\s*([bBmM])/.exec(String(h.value)); var num = m ? parseFloat(m[1].replace(/,/g, '')) : null; if (num != null && /b/i.test(m[2])) num *= 1000; return { period: h.period, value: num }; }).filter(function(p){ return p.value != null; });
  var trend = (series.length >= 3 && typeof pvDD2RevTrend === 'function') ? pvDD2RevTrend(series) : '';
  var metricTbl = (st && st.metrics && st.metrics.length) ? pvDD2FinMetricTable(st.metrics) : pvDD2FinMetrics(fin);
  var ratios = (st && st.ratios && st.ratios.length) ? pvDD2FinRatios(st.ratios) : '';
  var leftCol = trend
    ? '<div style="min-width:0">' + trend + pvDD2Foot('Total revenue by fiscal year; latest period solid. Trend drawn only where >=3 comparable periods exist.') + ratios + '</div>'
    : (ratios || '');
  var healthInner = (trend || ratios)
    ? '<div style="display:grid;grid-template-columns:minmax(300px,1.15fr) minmax(250px,.85fr);gap:26px;align-items:start"><div style="min-width:0">' + leftCol + '</div><div style="min-width:0">' + metricTbl + '</div></div>'
    : metricTbl;
  var evLabel = (x && (x.dimensions.find(function(d){ return d.id === 'financial'; }) || {}).concern) || 'Unknown';
  // peer position: enlarged scatter + comps table
  var scatter = (typeof pvDD2PeerScatterBig === 'function') ? pvDD2PeerScatterBig(refl, input, a && a.id) : '';
  var comps = (typeof pvDD2PeerComps === 'function') ? pvDD2PeerComps(refl, input, a && a.id) : '';
  var peerRight = '<div style="min-width:0">' + pvDD2PeerRead(refl, input, a, at, x) + (comps ? '<div style="margin-top:16px">' + comps + '</div>' : '') + '</div>';
  var peerBlock = scatter
    ? '<div style="display:grid;grid-template-columns:minmax(320px,1fr) minmax(280px,1fr);gap:24px;align-items:start"><div style="min-width:0">' + scatter + '</div>' + peerRight + '</div>'
    : peerRight;
  var showEnrich = enrich && st && st.enrichment && st.enrichment.length;
  return pvDD2AssessStrip(x, 'financial')
    + pvDD2Card('Financial Health',
        healthInner + pvDD2FinStatement(fin, st)
          + (fin.sources && fin.sources.length ? '<div style="margin-top:12px;font-size:11px;color:var(--mut2);line-height:1.5"><b>Sources.</b> ' + fin.sources.map(function(s){ return pvAEsc(s); }).join(' &middot; ') + '</div>' : ''),
        'var(--teal-d)', 'Viability reads ' + pvAEsc(evLabel), PVIC_FINHEALTH)
    + (scatter ? pvDD2Card('Peer Position', peerBlock, 'var(--plum)', 'Financial viability &times; capability fit', PVIC_SCATTER) : '')
    + pvDD2Pair(
        pvDD2Card('Financial Health Bridge', pvDD2FinBridge(fin), 'var(--plum)', 'Growth · profitability · cash · leverage', PVIC_BRIDGE, { fill:true }),
        (x.commercialDrivers ? pvDD2Card('Commercial Model', pvDD2CommercialDrivers(x.commercialDrivers), 'var(--emph)', null, PVIC_COMM, { fill:true }) : '')
      )
    + (showEnrich ? pvDD2Card('Credit &amp; Market Enrichment', pvDD2FinEnrich(st.enrichment), 'var(--plum)', 'D&amp;B / Bloomberg feed', PVIC_ENRICH) : '');
}

/* ------------------------------------------------ 4. RISK & RESILIENCE */
var PVDD2_LVL = {Low:1, Medium:2, High:3};
function pvDD2ImpColor(imp){ return imp === 'High' ? '#C15E19' : imp === 'Medium' ? '#A2500F' : '#5C2B50'; }

/* impact x likelihood matrix: 3x3 grid, risks placed in their cell as chips; gate
   risks get a ring, colour = impact, zone tint = combined severity. */
function pvDD2RiskMatrix(risks) {
  if (!risks || !risks.length) return '<div style="font-size:12px;color:var(--mut2)">No plotted risks on file.</div>';
  var byCell = {};
  risks.forEach(function(rk){ var k = rk.impact + '|' + rk.likelihood; (byCell[k] = byCell[k] || []).push(rk); });
  var impacts = ['High','Medium','Low'], likes = ['Low','Medium','High'];
  var zoneBg = function(imp, lk){ var s = (PVDD2_LVL[imp] || 1) + (PVDD2_LVL[lk] || 1); return s >= 5 ? 'var(--ti-red,#ECCFBA)' : s >= 4 ? '#F7E3D3' : 'var(--teal-t,#EFF7F3)'; };
  var rows = impacts.map(function(imp){
    var cells = likes.map(function(lk){
      var items = (byCell[imp + '|' + lk] || []).map(function(rk){
        return '<div title="' + pvAEsc(rk.type + ' · ' + rk.mitigation) + '" style="display:flex;align-items:center;gap:5px;font-size:10px;line-height:1.2;padding:3px 6px;border-radius:6px;background:var(--surface,#fff);border:1px solid ' + pvDD2ImpColor(imp) + (rk.gate ? ';box-shadow:0 0 0 2px ' + pvDD2ImpColor(imp) + '33' : '') + '"><span style="width:7px;height:7px;border-radius:50%;background:' + pvDD2ImpColor(imp) + ';flex:none"></span><span>' + pvAEsc(rk.label) + (rk.gate ? ' <b style="font:700 7px var(--mono,monospace);color:' + pvDD2ImpColor(imp) + '">GATE</b>' : '') + '</span></div>';
      }).join('');
      return '<div style="min-height:56px;background:' + zoneBg(imp, lk) + ';border:1px solid var(--line);border-radius:8px;padding:5px;display:flex;flex-direction:column;gap:4px">' + items + '</div>';
    }).join('');
    return '<div style="font:700 10px var(--mono,monospace);color:' + pvDD2ImpColor(imp) + ';text-transform:uppercase;display:flex;align-items:center;justify-content:flex-end;padding-right:8px">' + imp + '</div>' + cells;
  }).join('');
  var xlabels = '<div></div>' + likes.map(function(lk){ return '<div style="font:700 10px var(--mono,monospace);color:var(--mut2);text-align:center;padding-top:6px;text-transform:uppercase">' + lk + '</div>'; }).join('');
  return '<div style="max-width:560px"><div style="display:grid;grid-template-columns:58px 1fr 1fr 1fr;gap:6px">' + rows + xlabels + '</div>'
    + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mut2);margin-top:5px"><span>Impact &darr; (rows)</span><span>Likelihood &rarr; (columns)</span></div></div>';
}

/* material-events timeline with directness classification */
function pvDD2EventTimeline(events) {
  if (!events || !events.length) return '';
  var dcol = function(d){ return /service/i.test(d) ? '#C15E19' : /division/i.test(d) ? '#A2500F' : 'var(--mut2,#6a655f)'; };
  return '<div style="position:relative;padding-left:6px">'
    + '<div style="position:absolute;left:4px;top:5px;bottom:5px;width:2px;background:var(--line)"></div>'
    + events.map(function(ev){
        return '<div style="position:relative;padding:0 0 15px 18px">'
          + '<span style="position:absolute;left:-1px;top:3px;width:10px;height:10px;border-radius:50%;background:' + dcol(ev.directness) + ';border:2px solid var(--surface,#fff)"></span>'
          + '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:baseline"><span style="font-family:var(--mono,monospace);font-size:10px;color:var(--mut2)">' + pvAEsc(ev.date || '') + '</span><b style="font-size:12.5px;color:var(--ink)">' + pvAEsc(ev.title || '') + '</b><span style="font:700 8px var(--mono,monospace);text-transform:uppercase;color:' + dcol(ev.directness) + ';border:1px solid ' + dcol(ev.directness) + ';border-radius:20px;padding:1px 7px">' + pvAEsc(ev.directness || '') + '</span></div>'
          + (ev.detail ? '<div style="font-size:11.5px;color:var(--mut);line-height:1.5;margin-top:3px">' + pvAEsc(ev.detail) + '</div>' : '')
          + (ev.resolution ? '<div style="font-size:11px;color:var(--mut2);margin-top:2px"><b>Resolution &middot;</b> ' + pvAEsc(ev.resolution) + '</div>' : '')
          + '</div>';
      }).join('') + '</div>';
}

function pvDD2RiskSeverity(rk){
  var m = { High:3, Medium:2, Low:1 }, s = (m[rk.impact] || 1) + (m[rk.likelihood] || 1);
  return s >= 6 ? { t:'Critical', c:'#C15E19', bg:'var(--ti-red,#ECCFBA)' } : s >= 5 ? { t:'High', c:'var(--emph,#C15E19)', bg:'var(--emph-t,#ECCFBA)' } : s >= 4 ? { t:'Moderate', c:'#A2500F', bg:'var(--ti-amber,#ECCFBA)' } : { t:'Low', c:'var(--teal-d,#2F6E6B)', bg:'var(--teal-t,#B6CCCB)' };
}
/* ranked material-risks register (replaces the thin narrative beside the matrix) */
function pvDD2RiskRegister(risks){
  if (!risks || !risks.length) return '<div style="font-size:12px;color:var(--mut2)">No plotted risks on file.</div>';
  var m = { High:3, Medium:2, Low:1 };
  var sorted = risks.slice().sort(function(a, b){ return ((m[b.impact] || 1) + (m[b.likelihood] || 1)) - ((m[a.impact] || 1) + (m[a.likelihood] || 1)); });
  var th = function(h, al){ return '<th style="text-align:' + (al || 'left') + ';padding:0 10px 6px 0;font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + h + '</th>'; };
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>' + th('Risk') + th('Type') + th('Severity') + th('Conf.', 'right') + '</tr></thead><tbody>'
    + sorted.map(function(rk){
        var sv = pvDD2RiskSeverity(rk);
        return '<tr style="border-top:1px solid var(--line)"><td style="padding:8px 10px 8px 0;font-weight:600;color:var(--ink);vertical-align:top">' + pvAEsc(rk.label) + (rk.gate ? ' <span style="font:700 8px var(--mono,monospace);color:var(--emph,#C15E19);background:var(--emph-t,#ECCFBA);border-radius:20px;padding:1px 6px;vertical-align:middle">GATE</span>' : '') + '</td>'
          + '<td style="padding:8px 10px 8px 0;color:var(--mut);vertical-align:top">' + pvAEsc(rk.type) + '</td>'
          + '<td style="padding:8px 10px 8px 0;vertical-align:top"><span style="font:700 9.5px var(--mono,monospace);color:' + sv.c + ';background:' + sv.bg + ';border-radius:20px;padding:2px 9px">' + sv.t.toUpperCase() + '</span></td>'
          + '<td style="padding:8px 0;vertical-align:top;text-align:right">' + pvDD2FinDots(rk.confidence) + '</td></tr>';
      }).join('') + '</tbody></table></div>'
    + pvDD2Foot('Ranked by impact &times; likelihood. GATE = a sourcing gate to clear before award. A critical single risk overrides the average.');
}
/* risk-side mitigation register (owner-grouped actions live on the Lilly Action Board) */
function pvDD2MitigationBoard(risks){
  if (!risks || !risks.length) return '';
  var th = function(h, al){ return '<th style="text-align:' + (al || 'left') + ';padding:0 10px 6px 0;font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + h + '</th>'; };
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>' + th('Risk') + th('Treatment') + th('Gate?', 'center') + th('Status') + '</tr></thead><tbody>'
    + risks.map(function(rk){
        var status = rk.gate ? 'Open' : 'Monitor', sc = rk.gate ? '#A2500F' : 'var(--teal-d,#2F6E6B)';
        return '<tr style="border-top:1px solid var(--line)"><td style="padding:8px 10px 8px 0;font-weight:600;color:var(--ink);vertical-align:top">' + pvAEsc(rk.label) + '</td>'
          + '<td style="padding:8px 10px 8px 0;color:var(--mut);vertical-align:top;line-height:1.45">' + pvAEsc(rk.mitigation) + '</td>'
          + '<td style="padding:8px 10px 8px 0;vertical-align:top;text-align:center">' + (rk.gate ? '<b style="color:var(--emph,#C15E19)">Yes</b>' : '<span style="color:var(--mut2)">No</span>') + '</td>'
          + '<td style="padding:8px 0;vertical-align:top;white-space:nowrap;color:' + sc + ';font-weight:700">' + status + '</td></tr>';
      }).join('') + '</tbody></table></div>'
    + pvDD2Foot('The risk-side workplan; owner-grouped actions live on the Lilly Action Board and share these underlying items.');
}
function pvDD2Risk(x, a, cand, input) {
  var riskDims = x.dimensions.filter(function(d){ return ['financial','resilience','integrity','quality','cyber','responsible'].indexOf(d.id) >= 0; });
  return pvDD2Pair(
      pvDD2Card('Impact &times; Likelihood', pvDD2RiskMatrix(x.risks), 'var(--emph)', 'Where each risk sits', '<path d="M4 20h16M4 20V4"/><rect x="7" y="8" width="4" height="4" rx="1"/><rect x="14" y="12" width="4" height="4" rx="1"/>', { fill:true }),
      pvDD2Card('Top Material Risks', pvDD2RiskRegister(x.risks), 'var(--plum)', 'Ranked · typed · confidence', '<path d="M4 6h16M4 12h16M4 18h10"/>', { fill:true })
    )
    + pvDD2Pair(
      pvDD2Card('Risk Posture by Dimension', (typeof pvDD2RiskAccordion === 'function' ? pvDD2RiskAccordion(riskDims) : ''), 'var(--teal-d)', 'Expand one at a time', '<path d="M6 9l6 6 6-6"/>', { fill:true }),
      pvDD2Card('Risk Mitigation', pvDD2MitigationBoard(x.risks), 'var(--emph)', 'Treatment · gate · status', '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>', { fill:true })
    )
    + (x.events && x.events.length ? pvDD2Card('Material Events', (typeof pvDD2TypedEvents === 'function' ? pvDD2TypedEvents(x.events) : pvDD2EventTimeline(x.events)), 'var(--teal-d)', 'Typed · filterable', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>') : '');
}

/* ------------------------------------------------ 5. LILLY FIT & DILIGENCE */
function pvDD2DiligenceFunnel(stages) {
  if (!stages || !stages.length) return '';
  return '<div style="display:flex;flex-direction:column;gap:7px">' + stages.map(function(s){
      var c = s.pct >= 75 ? '#2F6E6B' : s.pct >= 40 ? '#2F6E6B' : s.pct > 0 ? '#A2500F' : 'var(--mut2,#6a655f)';
      return '<div style="display:grid;grid-template-columns:200px 1fr 40px;gap:12px;align-items:center"><span style="font-size:12px;color:var(--ink)">' + pvAEsc(s.stage) + '</span><div style="height:9px;border-radius:30px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:' + s.pct + '%;background:' + c + '"></i></div><span style="font-family:var(--mono,monospace);font-size:11px;font-weight:700;color:' + c + ';text-align:right">' + s.pct + '%</span></div>';
    }).join('') + '</div>' + pvDD2Foot('Progress toward advancement, not a wall of open questions.');
}
function pvDD2ActionBoard(actions) {
  if (!actions || !actions.length) return '';
  var th = function(h, al, w){ return '<th style="text-align:' + (al || 'left') + ';padding:0 8px 7px 0;font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)' + (w ? ';width:' + w : '') + '">' + h + '</th>'; };
  var rows = actions.map(function(act){
      var sc = act.status === 'Open' ? '#A2500F' : act.status === 'Not started' ? '#C15E19' : '#2F6E6B';
      var gate = act.gate ? '<b style="color:#A2500F">Yes</b>' : '<span style="color:var(--mut2)">No</span>';
      return '<tr style="border-top:1px solid var(--line)">'
        + '<td style="padding:8px 8px 8px 0;font-weight:600;color:var(--ink);vertical-align:top;line-height:1.45">' + pvAEsc(act.action) + '</td>'
        + '<td style="padding:8px 8px 8px 0;vertical-align:top;color:var(--mut2)">' + pvAEsc(act.owner) + '</td>'
        + '<td style="padding:8px 8px 8px 0;vertical-align:top;text-align:center">' + gate + '</td>'
        + '<td style="padding:8px 0;vertical-align:top;color:' + sc + ';font-weight:700">' + pvAEsc(act.status) + '</td></tr>';
    }).join('');
  return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed"><colgroup><col style="width:auto"><col style="width:24%"><col style="width:52px"><col style="width:76px"></colgroup><thead><tr>' + th('Action') + th('Owner') + th('Gate?', 'center') + th('Status') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}
/* internal relationship: existing contracts / spend / owners / prior sourcing -> timeline,
   gap-stated honestly when there is no Lilly history on file. */
function pvDD2InternalRel(rel){
  var slots = (rel && rel.slots) || [
    { label:'Existing contracts', value:'None on file' }, { label:'Current annual spend', value:'None on file' },
    { label:'Business owner(s)', value:'To assign' }, { label:'Prior sourcing events', value:'None on file' }, { label:'Supplier performance', value:'No history' }
  ];
  var summary = (rel && rel.summary) || 'No prior Lilly contractual or performance history found. Treat as a net-new supplier.';
  var chips = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:13px">' + slots.map(function(s){
      var none = /none|no history|to assign/i.test(s.value);
      return '<div style="background:var(--nested,#EDE8E0);border-radius:9px;padding:9px 11px"><div style="font:700 9px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + pvAEsc(s.label) + '</div><div style="font-size:12.5px;font-weight:600;color:' + (none ? 'var(--mut2)' : 'var(--ink)') + ';margin-top:3px">' + pvAEsc(s.value) + '</div></div>';
    }).join('') + '</div>';
  var tl = (rel && rel.timeline && rel.timeline.length) ? '<div style="margin-top:15px;border-top:1px solid var(--line);padding-top:12px"><div style="font:700 9px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2);margin-bottom:8px">Relationship timeline</div>' + rel.timeline.map(function(t){ return '<div style="display:flex;gap:12px;font-size:12px;padding:3px 0"><span style="font-family:var(--mono,monospace);color:var(--mut2);white-space:nowrap;min-width:74px">' + pvAEsc(t.date) + '</span><span style="color:var(--ink)">' + pvAEsc(t.event) + '</span></div>'; }).join('') + '</div>' : '';
  return '<div style="font-size:12.5px;line-height:1.55;color:var(--ink)">' + pvAEsc(summary) + '</div>' + chips + tl
    + pvDD2Foot('Populated from internal contract, spend and performance systems when a relationship exists; gap-stated here because none is on file.');
}
function pvDD2Lilly(x, a, cand, input) {
  var dd = cand.deepDive || {}, lf = dd.lillyFit || {};
  var fitRows = pvDD2KV([
    ['Relationship', lf.relation],
    ['Strategic fit', lf.strategic],
    ['Pharma / GxP', lf.pharma],
    ['Value / next move', lf.value]
  ]);
  var funnel = pvDD2DiligenceFunnel(x.diligence);
  var board = pvDD2ActionBoard(x.actions);
  var oqFallback = '';
  if (!board) {
    var oq = (typeof pvOpenQuestionsList === 'function') ? pvOpenQuestionsList(a, cand, input, (typeof pvReqFitRead === 'function' ? pvReqFitRead(a, cand, input) : null)) : [];
    oqFallback = (oq && oq.length)
      ? '<ol style="margin:0;padding-left:20px;font-size:12.5px;line-height:1.6">' + oq.map(function(q){ return '<li>' + (q.plain ? pvAEsc((typeof pvStripTags === 'function' ? pvStripTags(q.plain) : q.plain)) : pvAEsc(q.tag || '')) + '</li>'; }).join('') + '</ol>'
      : '<div style="font-size:12px;color:var(--mut2)">No open items derived; standard pre-award confirmations still apply.</div>';
  }
  var funnelCard = funnel
    ? pvDD2Card('Diligence Funnel', funnel, 'var(--teal-d)', 'Progress to advancement', '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>', { fill:true })
    : pvDD2Card('Required Diligence', oqFallback, 'var(--teal-d)', 'What still needs confirming', '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>', { fill:true });
  var boardCard = board
    ? pvDD2Card('Action Board', board, 'var(--emph)', 'What must happen before selection', '<path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>', { fill:true })
    : pvDD2Card('Action Board', '<div style="font-size:12px;color:var(--mut2)">No gated actions on file yet.</div>', 'var(--emph)', 'What must happen before selection', '<path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>', { fill:true });
  // Top row answers "how does it fit Lilly" (fit + any existing relationship); bottom row answers
  // "what must happen before we select" (diligence progress + the gated actions).
  return pvDD2AssessStrip(x, 'capability')
    + pvDD2Pair(
        pvDD2Card('Lilly-Specific Fit', fitRows || '<div style="font-size:12px;color:var(--mut2)">No Lilly-fit read on file.</div>', 'var(--plum)', 'Does this supplier fit Lilly?', '<path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"/>', { fill:true }),
        pvDD2Card('Internal Relationship', pvDD2InternalRel(x.internalRelationship), 'var(--teal-d)', 'Contracts, spend, history', '<path d="M8 7V3M16 7V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"/>', { fill:true })
      )
    + pvDD2Pair(funnelCard, boardCard);
}

/* ------------------------------------------------ dispatch */
var PVDD2_TABS = [
  ['summary', 'Supplier Summary'],
  ['company', 'Company & Ownership'],
  ['caps',   'Capabilities & Operations'],
  ['finmkt', 'Financial & Market'],
  ['risk',   'Risk & Resilience'],
  ['lilly',  'Lilly Fit & Diligence']
];

/* =============================================================================
   TOP-LEVEL RISK ASSESSMENT (v3), pvRiskHtml2, replaces pvRiskHtml on the spine.
   Portfolio summary -> semantic cross-supplier heatmap (level + confidence, gates
   override the average) -> coverage callout for unassessed dims -> selected-supplier
   material risks + disposition + event timeline (directness) + mitigation board.
   ============================================================================= */
var PVR2_RISK_DIMS = [
  ['financial', 'Financial viability'], ['resilience', 'Operational resilience'],
  ['cyber', 'Cyber & privacy'], ['integrity', 'Integrity & compliance'],
  ['quality', 'Quality & regulatory'], ['responsible', 'Responsible sourcing']
];
function pvR2ConcernToRisk(c){ return c === 'Insufficient evidence' ? 'Unknown' : c === 'Strong' ? 'Low' : c; }
// RA1 (Marc): fully-COLOURED cell showing the semantic level + confidence dots (no raw score). Severity ramp
// teal(low) -> burnt-orange(moderate/high) -> red(critical). Marc: richer fills so Low/Moderate/Unknown read
// clearly; the same map drives the legend swatches. [bg, text]
var PVR2_LVLCOL = {
  'Low':      ['#93C4BD', '#17403C'],
  'Moderate': ['#E7AE79', '#6E3708'],
  'High':     ['#D98A55', '#532706'],
  'Critical': ['#CB6E62', '#431009'],
  'Unknown':  ['#CBC6BD', '#514C45']
};
function pvR2Cell(level, confidence) {
  var s = PVR2_LVLCOL[level] || PVR2_LVLCOL['Critical'];
  var n = confidence === 'High' ? 3 : confidence === 'Medium' ? 2 : 1, dots = '';
  for (var i = 0; i < 3; i++) dots += '<i style="width:3px;height:3px;border-radius:50%;background:' + (i < n ? s[1] : 'rgba(0,0,0,.18)') + '"></i>';
  return '<div title="' + pvAEsc(level + ' · confidence ' + (confidence || 'n/a')) + '" style="display:flex;flex-direction:column;align-items:center;gap:3px;background:' + s[0] + ';border:1px solid rgba(0,0,0,.06);border-radius:5px;padding:6px 5px"><span style="font:700 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.02em;color:' + s[1] + '">' + pvAEsc(level) + '</span>' + (confidence ? '<span style="display:inline-flex;gap:2px">' + dots + '</span>' : '') + '</div>';
}
function pvR2Disposition(x) {
  if (x.gates.some(function(g){ return g.kind === 'hard'; })) return {l:'Hard stop', c:'#C15E19'};
  if (x.gates.length) return {l:'Escalate', c:'#A2500F'};
  if (x.risk.level === 'High' || x.risk.level === 'Critical') return {l:'Mitigate', c:'#A2500F'};
  if (x.risk.level === 'Unknown') return {l:'Evidence required', c:'var(--mut2,#6a655f)'};
  return {l:'Accept / monitor', c:'#2F6E6B'};
}
function pvRiskHtml2(refl) {
  var input = (typeof PVSL_INPUT !== 'undefined' && PVSL_INPUT) || {};
  var L = (refl && refl.landscape) || {};
  // Marc: columns in RANK order, #1 far left (eligible first, then advisory rank), not sorted by risk score.
  var asmts = (L.assessments || []).slice().sort(function(p, q){ if (p.eligible !== q.eligible) return p.eligible ? -1 : 1; return (p.rank || 99) - (q.rank || 99); });
  if (!asmts.length || typeof pvCandById !== 'function') return '<div class="sa-card"><div class="scc-b">No suppliers to assess.</div></div>';
  var rows = asmts.map(function(av){ return {av: av, x: pvAssess(av, pvCandById(av.id), input)}; });
  if (typeof PVSL_RK_VEND === 'undefined') { try { PVSL_RK_VEND = null; } catch (e) {} }
  var selId = (typeof PVSL_RK_VEND !== 'undefined' && PVSL_RK_VEND && rows.some(function(r){ return r.av.id === PVSL_RK_VEND; })) ? PVSL_RK_VEND : rows[0].av.id;
  try { PVSL_RK_VEND = selId; } catch (e) {}
  var sel = rows.find(function(r){ return r.av.id === selId; });

  // ---- portfolio summary ----
  var critHigh = rows.filter(function(r){ return ['High','Critical'].indexOf(r.x.risk.level) >= 0; }).length;
  var withGates = rows.filter(function(r){ return r.x.gates.length > 0; }).length;
  var dimBad = {}, dimUnk = {}, dimConf = {};
  rows.forEach(function(r){ r.x.dimensions.forEach(function(d){ if (PVR2_RISK_DIMS.every(function(rd){ return rd[0] !== d.id; })) return; var lv = pvR2ConcernToRisk(d.concern); if (['High','Critical','Moderate'].indexOf(lv) >= 0) dimBad[d.label] = (dimBad[d.label] || 0) + 1; if (lv === 'Unknown') dimUnk[d.label] = (dimUnk[d.label] || 0) + 1; if (d.confidence === 'High') dimConf[d.label] = (dimConf[d.label] || 0) + 1; }); });
  var topKey = function(o){ var k = null, m = -1; for (var x in o) if (o[x] > m) { m = o[x]; k = x; } return k; };
  var pcell = function(lab, val){ return '<div style="min-width:0"><div style="font:600 9.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2);margin-bottom:4px">' + lab + '</div><div style="font-size:14px;font-weight:800;color:var(--ink)">' + val + '</div></div>'; };
  var portfolio = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px 20px">'
    + pcell('High / critical risk', critHigh + ' <span style="font-size:11px;color:var(--mut2);font-weight:600">of ' + rows.length + '</span>')
    + pcell('Most common exposure', '<span style="font-size:12.5px">' + pvAEsc(topKey(dimBad) || 'None') + '</span>')
    + pcell('Least-assessed', '<span style="font-size:12.5px">' + pvAEsc(topKey(dimUnk) || 'None') + '</span>')
    + pcell('Highest-confidence', '<span style="font-size:12.5px">' + pvAEsc(topKey(dimConf) || 'None') + '</span>')
    + '</div>';

  // ---- heatmap: risk dims (rows) x suppliers (cols) ----
  var heads = '<th style="text-align:left;padding:4px 8px 8px 0"></th>' + rows.map(function(r){
      var sc = r.av.id === selId;
      return '<th onclick="if(typeof pvRkVend===\'function\')pvRkVend(\'' + pvAEsc(r.av.id) + '\')" style="padding:4px 4px 8px;cursor:pointer;text-align:center;border-bottom:2px solid ' + (sc ? 'var(--plum,#5C2B50)' : 'transparent') + '"><div style="font-size:10.5px;font-weight:700;color:' + (sc ? 'var(--plum,#5C2B50)' : 'var(--ink)') + ';white-space:nowrap">' + pvAEsc((r.av.name || '').split(/[,]/)[0]) + '</div>' + (r.av.rank ? '<div style="font:600 9px var(--mono,monospace);color:var(--mut2)">#' + r.av.rank + (r.av.eligible ? '' : ' · out') + '</div>' : '') + '</div></th>';
    }).join('');
  var body = PVR2_RISK_DIMS.map(function(rd){
      var cells = rows.map(function(r){ var d = r.x.dimensions.find(function(v){ return v.id === rd[0]; }) || {}; return '<td style="padding:3px">' + pvR2Cell(pvR2ConcernToRisk(d.concern), d.confidence) + '</td>'; }).join('');
      return '<tr><td style="font-size:12px;font-weight:600;color:var(--ink);padding:5px 8px 5px 0;white-space:nowrap">' + pvAEsc(rd[1]) + '</td>' + cells + '</tr>';
    }).join('');
  var overall = '<tr><td style="font-size:11px;font-weight:700;color:var(--mut2);padding:8px 8px 3px 0;text-transform:uppercase;letter-spacing:.03em">Overall</td>' + rows.map(function(r){ var m = THEO_RISKBAND[r.x.risk.level] || THEO_RISKBAND['Unknown']; return '<td style="padding:3px;text-align:center"><span style="font:700 9px var(--mono,monospace);text-transform:uppercase;color:' + m.c + '">' + pvAEsc(r.x.risk.level) + '</span></td>'; }).join('') + '</tr>';
  var heatmap = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr>' + heads + '</tr></thead><tbody>' + body + overall + '</tbody></table></div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;font-size:11px;color:var(--mut)">' + ['Low','Moderate','High','Critical','Unknown'].map(function(l){ var m = PVR2_LVLCOL[l]; return '<span style="display:flex;align-items:center;gap:6px"><i style="width:11px;height:9px;border-radius:2px;background:' + m[0] + ';border:1px solid ' + m[1] + '"></i>' + l + '</span>'; }).join('') + '<span style="color:var(--mut2)">· dots = confidence · gates override the average, no risk is averaged away</span></div>';

  // ---- coverage callout for unassessed dims ----
  var unassessedNote = '';
  var respUnk = rows.filter(function(r){ var d = r.x.dimensions.find(function(v){ return v.id === 'responsible'; }) || {}; return pvR2ConcernToRisk(d.concern) === 'Unknown'; }).length;
  if (respUnk) unassessedNote = pvDD2Foot('Responsible sourcing is <b>not assessed</b> for ' + respUnk + ' of ' + rows.length + ' suppliers, shown as Unknown, never a scored "no issue". "Not assessed" is not "low risk".');

  // ---- selected supplier detail ----
  var sx = sel.x, disp = pvR2Disposition(sx);
  var matRisks = (sx.risks && sx.risks.length) ? sx.risks : sx.dimensions.filter(function(d){ return PVR2_RISK_DIMS.some(function(rd){ return rd[0] === d.id; }) && ['High','Critical','Moderate'].indexOf(pvR2ConcernToRisk(d.concern)) >= 0; }).map(function(d){ return {label: d.label, impact: pvR2ConcernToRisk(d.concern), likelihood: 'Medium', confidence: d.confidence, type: 'Dimension', mitigation: d.evidence, gate: false}; });
  var msev = { High:3, Medium:2, Low:1, Critical:3 };
  var mReg = matRisks.slice().sort(function(a, b){ return ((msev[b.impact] || 1) + (msev[b.likelihood] || 1)) - ((msev[a.impact] || 1) + (msev[a.likelihood] || 1)); }).map(function(rk){
      var sv = (typeof pvDD2RiskSeverity === 'function') ? pvDD2RiskSeverity(rk) : { t: rk.impact || 'Low', c: 'var(--mut2)', bg: 'var(--nested)' };
      return '<tr style="border-top:1px solid var(--line)"><td style="padding:8px 10px 8px 0;font-weight:600;color:var(--ink);vertical-align:top">' + pvAEsc(rk.label) + '</td>'
        + '<td style="padding:8px 10px 8px 0;color:var(--mut);vertical-align:top;white-space:nowrap">' + pvAEsc(rk.type || '') + '</td>'
        + '<td style="padding:8px 10px 8px 0;vertical-align:top"><span style="font:700 9.5px var(--mono,monospace);color:' + sv.c + ';background:' + sv.bg + ';border-radius:20px;padding:2px 9px">' + sv.t.toUpperCase() + '</span></td>'
        + '<td style="padding:8px 10px 8px 0;vertical-align:top;text-align:center">' + ((typeof pvDD2FinDots === 'function') ? pvDD2FinDots(rk.confidence) : '') + '</td>'
        + '<td style="padding:8px 10px 8px 0;color:var(--mut);vertical-align:top;line-height:1.45">' + pvAEsc(rk.mitigation || '') + '</td>'
        + '<td style="padding:8px 0;vertical-align:top;white-space:nowrap">' + (rk.gate ? '<b style="color:var(--emph,#C15E19)">Gate</b>' : 'Monitor') + '</td></tr>';
    }).join('');
  var selName = pvAEsc(sel.av.name);
  var selHead = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:13px;font-weight:700;color:var(--ink)">' + selName + '</span>' + pvSemanticRiskCell(sx.risk.level, sx.risk.confidence) + '<span style="font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:' + disp.c + '">Disposition: ' + disp.l + '</span></div>';
  var events = (typeof pvDD2TypedEvents === 'function' && sx.events && sx.events.length) ? pvDD2TypedEvents(sx.events) : ((typeof pvDD2EventTimeline === 'function' && sx.events && sx.events.length) ? pvDD2EventTimeline(sx.events) : '');
  var rth = function(h, al){ return '<th style="text-align:' + (al || 'left') + ';padding:0 10px 6px 0;font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2)">' + h + '</th>'; };

  // Marc: the descriptive prose card and the Unresolved-gates tile are removed; open with the portfolio summary.
  return pvDD2Card('Portfolio summary', portfolio, 'var(--plum)')
    + pvDD2Card('Risk by dimension', heatmap + unassessedNote, 'var(--emph)')
    + pvDD2Card('Selected supplier &middot; ' + selName, selHead
        + (mReg ? '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>' + rth('Risk') + rth('Type') + rth('Severity') + rth('Conf.', 'center') + rth('Response') + rth('Gate') + '</tr></thead><tbody>' + mReg + '</tbody></table></div>' : '<div style="font-size:12px;color:var(--mut2)">No material risks above threshold for this supplier.</div>')
        + (events ? '<div style="margin-top:16px;border-top:1px solid var(--line);padding-top:13px"><div style="font:700 9px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2);margin-bottom:10px">Material events</div>' + events + '</div>' : ''), 'var(--teal-d)');
}

/* =============================================================================
   TOP-LEVEL HEAD-TO-HEAD (v3), pvH2HHtml. Compare any two eligible suppliers on the
   shared spine: summary strip (with tie-vs-meaningful), category delta bars, risk
   difference, evidence-confidence compare, commercial-model compare, conclusion.
   ============================================================================= */
var PVH2H_A = null, PVH2H_B = null;
// HH1 (Marc): Head-to-Head reverts to the OLD design (pvDynamicsHtml in pv-07, which keeps its own index-based
// pvH2HPick / PVSL_H2H_A/B). My pv-07b pvH2HPick override is removed so the old picker works. pvH2HExtras merges
// the NEW data (risk difference, evidence-confidence compare, commercial-model compare) onto the old design for
// the same selected pair. pvH2HHtml below is now unused (kept for reference; remove in cleanup).
function pvH2HExtras(refl) {
  var input = (typeof PVSL_INPUT !== 'undefined' && PVSL_INPUT) || {};
  var L = (refl && refl.landscape) || {};
  if (typeof pvCandById !== 'function' || !L.assessments || L.assessments.length < 2) return '';
  var order = L.assessments.slice().sort(function(x, y){ if (x.eligible !== y.eligible) return x.eligible ? -1 : 1; if (x.eligible) return (x.rank || 99) - (y.rank || 99); return String(x.name).localeCompare(y.name); });
  var ai = (typeof PVSL_H2H_A !== 'undefined') ? PVSL_H2H_A : 0, bi = (typeof PVSL_H2H_B !== 'undefined') ? PVSL_H2H_B : 1;
  if (ai >= order.length || ai < 0) ai = 0; if (bi >= order.length || bi < 0) bi = Math.min(1, order.length - 1); if (bi === ai) bi = (ai + 1) % order.length;
  var A = {av: order[ai], x: pvAssess(order[ai], pvCandById(order[ai].id), input)};
  var B = {av: order[bi], x: pvAssess(order[bi], pvCandById(order[bi].id), input)};
  var nm = function(av){ return (av.name || '').split(/[,]/)[0]; };
  var riskDiff = PVR2_RISK_DIMS.map(function(rd){
    var da = A.x.dimensions.find(function(d){ return d.id === rd[0]; }) || {}, db = B.x.dimensions.find(function(d){ return d.id === rd[0]; }) || {};
    return '<tr><td style="font-size:12px;font-weight:600;color:var(--ink);padding:6px 8px 6px 0">' + pvAEsc(rd[1]) + '</td><td style="padding:4px;text-align:center">' + pvSemanticRiskCell(pvR2ConcernToRisk(da.concern), da.confidence) + '</td><td style="padding:4px;text-align:center">' + pvSemanticRiskCell(pvR2ConcernToRisk(db.concern), db.confidence) + '</td></tr>';
  }).join('');
  var riskCard = pvDD2Card('Risk Difference', '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th></th><th style="font-size:11px;color:var(--teal-d);padding-bottom:6px">' + pvAEsc(nm(A.av)) + '</th><th style="font-size:11px;color:var(--emph);padding-bottom:6px">' + pvAEsc(nm(B.av)) + '</th></tr></thead><tbody>' + riskDiff + '</tbody></table></div>', 'var(--emph)');
  var cov = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div style="font-size:12px;font-weight:700;color:var(--teal-d);margin-bottom:8px">' + pvAEsc(A.av.name) + '</div>' + pvEvidCoverageBar(A.x.evidenceCoverage) + '</div><div><div style="font-size:12px;font-weight:700;color:var(--emph);margin-bottom:8px">' + pvAEsc(B.av.name) + '</div>' + pvEvidCoverageBar(B.x.evidenceCoverage) + '</div></div>';
  var covCard = pvDD2Card('Evidence Confidence', cov, 'var(--teal-d)');
  var ca = A.x.commercialDrivers, cb = B.x.commercialDrivers;
  var commCard = (ca || cb) ? pvDD2Card('Commercial Model', '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div style="font-size:12px;font-weight:700;color:var(--teal-d);margin-bottom:8px">' + pvAEsc(A.av.name) + '</div>' + (ca ? pvDD2CommercialDrivers(ca) : '<div style="font-size:12px;color:var(--mut2)">Not on file.</div>') + '</div><div><div style="font-size:12px;font-weight:700;color:var(--emph);margin-bottom:8px">' + pvAEsc(B.av.name) + '</div>' + (cb ? pvDD2CommercialDrivers(cb) : '<div style="font-size:12px;color:var(--mut2)">Not on file.</div>') + '</div></div>', 'var(--plum)') : '';
  return riskCard + covCard + commCard;
}
function pvH2HCounts(x) {
  var g = x.reqGroups || [];
  return {
    met: g.filter(function(r){ return r.fitLabel === 'Strong' || r.fitLabel === 'Meets'; }).length,
    partial: g.filter(function(r){ return r.fitLabel === 'Partial'; }).length,
    gap: g.filter(function(r){ return r.fitLabel === 'Gap'; }).length,
    mustGap: g.filter(function(r){ return r.must && r.fitLabel === 'Gap'; }).length
  };
}
function pvH2HBarCell(v, color) {
  if (v == null) return '<div style="font-size:11px;color:var(--mut2)">Unknown</div>';
  return '<div style="display:flex;align-items:center;gap:7px"><div style="flex:1;height:7px;border-radius:30px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:' + (v / 5 * 100) + '%;background:' + color + '"></i></div><span style="font-family:var(--mono,monospace);font-size:11px;font-weight:700;color:' + color + '">' + v.toFixed(1) + '</span></div>';
}
function pvH2HHtml(refl) {
  var input = (typeof PVSL_INPUT !== 'undefined' && PVSL_INPUT) || {};
  var L = (refl && refl.landscape) || {};
  var elig = (L.assessments || []).filter(function(a){ return a.eligible; }).sort(function(p, q){ return (p.rank || 99) - (q.rank || 99); });
  if (elig.length < 2 || typeof pvCandById !== 'function') return '<div class="sa-card"><div class="scc-b">Need at least two eligible suppliers to compare.</div></div>';
  var ids = elig.map(function(a){ return a.id; });
  var aId = (PVH2H_A && ids.indexOf(PVH2H_A) >= 0) ? PVH2H_A : ids[0];
  var bId = (PVH2H_B && ids.indexOf(PVH2H_B) >= 0 && PVH2H_B !== aId) ? PVH2H_B : (ids[1] === aId ? ids[0] : ids[1]);
  PVH2H_A = aId; PVH2H_B = bId;
  var mk = function(id){ var av = elig.find(function(a){ return a.id === id; }); return {av: av, x: pvAssess(av, pvCandById(id), input)}; };
  var A = mk(aId), B = mk(bId);
  var nm = function(av){ return (av.name || '').split(/[,]/)[0]; };

  var sel = function(which, cur){ return '<select onchange="pvH2HPick(\'' + which + '\',this.value)" style="font:600 13px var(--sans);padding:6px 10px;border:1px solid var(--line2,#CECCC7);border-radius:8px;background:var(--surface,#fff);color:var(--ink)">' + elig.map(function(a){ return '<option value="' + pvAEsc(a.id) + '"' + (a.id === cur ? ' selected' : '') + '>' + pvAEsc(a.name) + (a.rank ? ' · #' + a.rank : '') + '</option>'; }).join('') + '</select>'; };
  var pickers = '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><span style="font-size:12px;color:var(--mut2)">Compare</span>' + sel('a', aId) + '<span style="font-weight:700;color:var(--mut2)">vs</span>' + sel('b', bId) + '</div>';

  var ca = pvH2HCounts(A.x), cb = pvH2HCounts(B.x);
  var fa = A.x.fit.score5, fb = B.x.fit.score5;
  var adv = (fa == null || fb == null) ? 'Insufficient data' : Math.abs(fa - fb) < 0.15 ? 'Effectively a tie on fit' : (fa > fb ? nm(A.av) : nm(B.av)) + ' leads fit by ' + Math.abs(fa - fb).toFixed(1);
  var strip = '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:10px;align-items:center">'
    + '<div></div><div style="font-size:13px;font-weight:800;color:#5C2B50;text-align:center">' + pvAEsc(A.av.name) + '</div><div style="font-size:13px;font-weight:800;color:#2F6E6B;text-align:center">' + pvAEsc(B.av.name) + '</div>'
    + [['Requirements fit', (fa != null ? fa + '/5 · ' + A.x.fit.label : 'Not scored'), (fb != null ? fb + '/5 · ' + B.x.fit.label : 'Not scored')],
       ['Risk posture', A.x.risk.level, B.x.risk.level],
       ['Requirements met', ca.met, cb.met],
       ['Partial', ca.partial, cb.partial],
       ['Must-have gaps', ca.mustGap, cb.mustGap],
       ['Evidence confidence', A.x.evidenceConfidence, B.x.evidenceConfidence]
      ].map(function(r){ return '<div style="font-size:12px;color:var(--mut2);padding:6px 0;border-top:1px solid var(--line)">' + r[0] + '</div><div style="font-size:12.5px;font-weight:600;color:var(--ink);text-align:center;padding:6px 0;border-top:1px solid var(--line)">' + pvAEsc(String(r[1])) + '</div><div style="font-size:12.5px;font-weight:600;color:var(--ink);text-align:center;padding:6px 0;border-top:1px solid var(--line)">' + pvAEsc(String(r[2])) + '</div>'; }).join('')
    + '</div><div style="margin-top:10px;padding:8px 12px;background:var(--nested,#EDE8E0);border-radius:8px;font-size:12.5px;font-weight:600;color:var(--ink);text-align:center">' + pvAEsc(adv) + '</div>';

  var deltas = (A.x.reqGroups || []).map(function(ga, i){
    var gb = (B.x.reqGroups || [])[i] || {}, va = ga.fit, vb = gb.fit;
    var a2 = (va == null || vb == null) ? 'Not scored' : Math.abs(va - vb) < 0.15 ? 'Tie' : (va > vb ? nm(A.av) : nm(B.av)) + ' +' + Math.abs(va - vb).toFixed(1);
    return '<div style="display:grid;grid-template-columns:150px 1fr 1fr 120px;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line)"><span style="font-size:12px;font-weight:600;color:var(--ink)">' + pvAEsc(ga.label) + (ga.must ? ' <span style="font:700 8px var(--mono,monospace);color:#C15E19">MUST</span>' : '') + '</span>' + pvH2HBarCell(va, '#5C2B50') + pvH2HBarCell(vb, '#2F6E6B') + '<span style="font-size:11px;font-weight:600;color:var(--mut)">' + pvAEsc(a2) + '</span></div>';
  }).join('');

  var riskDiff = PVR2_RISK_DIMS.map(function(rd){
    var da = A.x.dimensions.find(function(d){ return d.id === rd[0]; }) || {}, db = B.x.dimensions.find(function(d){ return d.id === rd[0]; }) || {};
    return '<tr><td style="font-size:12px;font-weight:600;color:var(--ink);padding:6px 8px 6px 0">' + pvAEsc(rd[1]) + '</td><td style="padding:4px;text-align:center">' + pvSemanticRiskCell(pvR2ConcernToRisk(da.concern), da.confidence) + '</td><td style="padding:4px;text-align:center">' + pvSemanticRiskCell(pvR2ConcernToRisk(db.concern), db.confidence) + '</td></tr>';
  }).join('');

  var cov = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div style="font-size:12px;font-weight:700;color:#5C2B50;margin-bottom:8px">' + pvAEsc(A.av.name) + '</div>' + pvEvidCoverageBar(A.x.evidenceCoverage) + '</div><div><div style="font-size:12px;font-weight:700;color:#2F6E6B;margin-bottom:8px">' + pvAEsc(B.av.name) + '</div>' + pvEvidCoverageBar(B.x.evidenceCoverage) + '</div></div>';

  var commA = A.x.commercialDrivers, commB = B.x.commercialDrivers;
  var commCard = (commA || commB) ? pvDD2Card('Commercial model', '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><div style="font-size:12px;font-weight:700;color:#5C2B50;margin-bottom:8px">' + pvAEsc(A.av.name) + '</div>' + (commA ? pvDD2CommercialDrivers(commA) : '<div style="font-size:12px;color:var(--mut2)">Not on file.</div>') + '</div><div><div style="font-size:12px;font-weight:700;color:#2F6E6B;margin-bottom:8px">' + pvAEsc(B.av.name) + '</div>' + (commB ? pvDD2CommercialDrivers(commB) : '<div style="font-size:12px;color:var(--mut2)">Not on file.</div>') + '</div></div>', 'var(--ai,#5C2B50)') : '';

  var chips = (A.x.concerns || []).slice(0, 2).concat((B.x.concerns || []).slice(0, 1)).map(function(c){ return '<span style="display:inline-block;font-size:11.5px;color:var(--mut);background:var(--nested,#EDE8E0);border:1px solid var(--line);border-radius:20px;padding:3px 10px;margin:0 6px 6px 0">' + pvAEsc(c) + '</span>'; }).join('');
  var conclusion = '<div style="font-size:12.5px;color:var(--ink);line-height:1.55">' + pvAEsc(nm(A.av)) + ' and ' + pvAEsc(nm(B.av)) + ' are separated mostly by the categories above; ' + pvAEsc(adv.toLowerCase()) + '. The decision most likely turns on the open validation items below.</div><div style="margin-top:12px">' + chips + '</div>';

  return pvDD2Card('Head-to-Head', pickers, 'var(--navy,#5C2B50)')
    + pvDD2Card('Comparison summary', strip, 'var(--ai,#5C2B50)')
    + pvDD2Card('Category delta', deltas || '<div style="font-size:12px;color:var(--mut2)">No requirement groups to compare.</div>', 'var(--teal-d,#2F6E6B)')
    + pvDD2Card('Risk difference', '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th></th><th style="font-size:11px;color:#5C2B50;padding-bottom:6px">' + pvAEsc(nm(A.av)) + '</th><th style="font-size:11px;color:#2F6E6B;padding-bottom:6px">' + pvAEsc(nm(B.av)) + '</th></tr></thead><tbody>' + riskDiff + '</tbody></table></div>', 'var(--amber-d,#A2500F)')
    + pvDD2Card('Evidence confidence', cov, 'var(--mut2,#6a655f)')
    + commCard
    + pvDD2Card('Conclusion', conclusion, 'var(--navy,#5C2B50)');
}

function pvDD2Section(ddt, a, cand, refl, input) {
  var x = pvAssess(a, cand, input);
  if (ddt === 'company') return pvDD2Company(x, a, cand, input);
  if (ddt === 'caps')    return pvDD2Caps(x, a, cand, input);
  if (ddt === 'finmkt')  return pvDD2FinMkt(x, a, cand, input, refl);
  if (ddt === 'risk')    return pvDD2Risk(x, a, cand, input);
  if (ddt === 'lilly')   return pvDD2Lilly(x, a, cand, input);
  return pvDD2Summary(x, a, cand, input);
}


/* ===== R2 net-new visualizations (built via workflow, integrated) ===== */
/* labelled Gartner-style 2x2 quadrant: financial viability (x, 0-5) vs capability fit
   (y, 0-5), for the Financial & Market deep-dive tab. Resembles pvDD2PeerScatter but
   with a mid-cross splitting 4 labelled quadrants instead of a plain scatter. */
function pvDD2Quadrant(refl, input, selId) {
  var asmts = (refl && refl.landscape && refl.landscape.assessments) || [];
  var elig = asmts.filter(function(av){ return av && av.eligible; });
  if (!elig.length || typeof pvAssess !== 'function' || typeof pvCandById !== 'function' || typeof THEO_CONCERN === 'undefined') {
    return '<div style="font-size:12px;color:var(--mut2)">Not enough eligible suppliers on file to plot financial viability against capability fit.</div>';
  }
  var W = 520, H = 340, padL = 46, padB = 42, padT = 18, padR = 18;
  var plotW = W - padL - padR, plotH = H - padT - padB;
  var sx = function(v){ return padL + (v / 5) * plotW; };
  var sy = function(v){ return padT + plotH - (v / 5) * plotH; };
  var mid = 2.5, midX = sx(mid), midY = sy(mid);

  // gridlines at each integer division
  var grid = '';
  for (var g = 1; g < 5; g++) {
    grid += '<line x1="' + sx(g) + '" y1="' + padT + '" x2="' + sx(g) + '" y2="' + (padT + plotH) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/>'
          + '<line x1="' + padL + '" y1="' + sy(g) + '" x2="' + (padL + plotW) + '" y2="' + sy(g) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/>';
  }
  // mid-cross dividing the 4 quadrants (heavier than the gridlines, still restrained)
  var cross = '<line x1="' + midX + '" y1="' + padT + '" x2="' + midX + '" y2="' + (padT + plotH) + '" stroke="var(--line2)" stroke-width="1.5"/>'
            + '<line x1="' + padL + '" y1="' + midY + '" x2="' + (padL + plotW) + '" y2="' + midY + '" stroke="var(--line2)" stroke-width="1.5"/>';

  // faint quadrant labels, one per corner
  var ql = function(x, y, anchor, text) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" font-family="var(--sans)" font-size="10" font-weight="700" fill="var(--mut2)" opacity="0.6" style="letter-spacing:.04em;text-transform:uppercase">' + text + '</text>';
  };
  var quadLabels = ql(padL + plotW - 6, padT + 13, 'end', 'Leaders')
    + ql(padL + 6, padT + 13, 'start', 'Capable / weaker financials')
    + ql(padL + plotW - 6, padT + plotH - 7, 'end', 'Stable / weaker fit')
    + ql(padL + 6, padT + plotH - 7, 'start', 'Laggards');

  // plotted suppliers: x = financial-concern favorability * 5, y = capability fit /5
  var dots = elig.map(function(av){
    var pv = pvAssess(av, pvCandById(av.id), input);
    var finDim = (pv.dimensions || []).find(function(d){ return d.id === 'financial'; }) || {};
    var fav = (THEO_CONCERN[finDim.concern] || {fav: 0.5}).fav;
    var xv = fav * 5, yv = pv.fit.score5 != null ? pv.fit.score5 : 0;
    var px = sx(xv), py = sy(yv), sel = av.id === selId;
    var col = sel ? 'var(--emph,#C15E19)' : 'var(--teal-d,#2F6E6B)';
    var r = sel ? 8 : 5;
    var nm = pvAEsc((av.name || '').split(/[,]/)[0]);
    return '<g><title>' + pvAEsc(av.name || '') + ' &middot; financial ' + xv.toFixed(1) + '/5, fit ' + yv.toFixed(1) + '/5</title>'
      + '<circle cx="' + px + '" cy="' + py + '" r="' + r + '" fill="' + col + '"' + (sel ? ' stroke="var(--surface,#fff)" stroke-width="2"' : '') + ' opacity="0.92"/>'
      + '<text x="' + (px + r + 4) + '" y="' + (py + 3) + '" font-family="var(--mono,monospace)" font-size="9" font-weight="' + (sel ? '700' : '400') + '" fill="' + (sel ? col : 'var(--mut,#4A443C)') + '">' + nm + '</text></g>';
  }).join('');

  var legend = '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:var(--mut)">'
    + '<span style="display:flex;align-items:center;gap:6px"><i style="width:9px;height:9px;border-radius:50%;background:var(--emph,#C15E19)"></i>Selected supplier</span>'
    + '<span style="display:flex;align-items:center;gap:6px"><i style="width:9px;height:9px;border-radius:50%;background:var(--teal-d,#2F6E6B)"></i>Other eligible suppliers</span>'
    + '</div>';

  return '<div style="overflow-x:auto"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px;height:auto">'
    + grid + cross + quadLabels
    + '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (padL + plotW) + '" y2="' + (padT + plotH) + '" stroke="var(--line2)" stroke-width="1"/>'
    + '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH) + '" stroke="var(--line2)" stroke-width="1"/>'
    + '<text x="' + (padL + plotW / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="var(--mut2)">Financial viability (0&ndash;5) &rarr;</text>'
    + '<text x="13" y="' + (padT + plotH / 2) + '" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="var(--mut2)" transform="rotate(-90 13 ' + (padT + plotH / 2) + ')">Capability fit (0&ndash;5) &rarr;</text>'
    + dots + '</svg></div>' + legend
    + '<div class="footbound" style="margin-top:9px">Financial viability (x) against capability fit (y), split at the 2.5 midpoint on each axis, a quadrant read, not a blended score. Gates below can still block an otherwise-Leaders supplier.</div>';
}
/* Risk & Resilience deep-dive: accordion of risk dimensions (replaces the flat
   dimension-list grid in pvDD2Risk's "Risk posture by dimension" card). One row
   per dimension: chevron + label + concern pill (colour = concern) + confidence
   dots (High=3/Med=2/Low=1), collapsed except the first; expands to the full
   evidence sentence. Only one row open at a time -- native `name` grouping
   handles modern engines, an ontoggle fallback closes siblings everywhere else. */
function pvDD2RiskAccordion(dims) {
  var list = (dims || []).filter(function (d) { return d; });
  if (!list.length) {
    return '<div style="font-size:12px;color:var(--mut2,#6a655f)">No risk dimensions on file.</div>';
  }
  var gid = 'pvdra' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  var CMAP = {
    'Low':                   {c: 'var(--teal-d,#2F6E6B)', bg: 'var(--teal-t,#B6CCCB)'},
    'Strong':                {c: 'var(--teal-d,#2F6E6B)', bg: 'var(--teal-t,#B6CCCB)'},
    'Moderate':              {c: '#A2500F',               bg: 'var(--ti-amber,#ECCFBA)'},
    'High':                  {c: 'var(--emph,#C15E19)',   bg: 'var(--emph-t,#ECCFBA)'},
    'Critical':              {c: '#C15E19',               bg: 'var(--ti-red,#ECCFBA)'},
    'Insufficient evidence': {c: 'var(--mut2,#6a655f)',   bg: 'var(--nested,#EDE8E0)'}
  };
  var styleFor = function (concern) { return CMAP[concern] || CMAP['Insufficient evidence']; };
  var dotsFor = function (confidence, color) {
    var n = confidence === 'High' ? 3 : confidence === 'Medium' ? 2 : confidence === 'Low' ? 1 : 0;
    var d = '';
    for (var i = 0; i < 3; i++) {
      d += '<i style="display:inline-block;width:5px;height:5px;border-radius:50%;background:' + (i < n ? color : 'var(--line2,#CECCC7)') + '"></i>';
    }
    return '<span title="Confidence: ' + pvAEsc(confidence || 'Unknown') + '" style="display:inline-flex;gap:3px;align-items:center">' + d + '</span>';
  };

  var rows = list.map(function (d, i) {
    var st = styleFor(d.concern);
    var pill = '<span style="display:inline-flex;align-items:center;font:700 10px var(--sans);letter-spacing:.03em;text-transform:uppercase;padding:3px 10px;border-radius:20px;color:' + st.c + ';background:' + st.bg + ';flex:none">' + pvAEsc(d.concern || 'Insufficient evidence') + '</span>';
    var dots = dotsFor(d.confidence, st.c);
    var evid = d.evidence ? pvAEsc(d.evidence) : 'No evidence on file for this dimension.';
    var openAttr = i === 0 ? ' open' : '';
    return '<details name="' + gid + '" data-pvdra="' + gid + '" ontoggle="pvDD2RiskAccToggle(this)" style="border-bottom:1px solid var(--line,#E1E0DC)"' + openAttr + '>'
      + '<summary style="cursor:pointer;list-style:none;display:flex;flex-wrap:wrap;align-items:center;gap:11px;padding:11px 6px">'
      +   '<span class="' + gid + '-chev" style="display:inline-block;width:9px;flex:none;font-size:9px;line-height:1;color:var(--mut2,#6a655f);transition:transform .15s ease">&#9656;</span>'
      +   '<span style="flex:0 1 200px;font-size:12.5px;font-weight:700;color:var(--ink,#1A1A1A)">' + pvAEsc(d.label || d.id || 'Dimension') + '</span>'
      +   pill + dots
      + '</summary>'
      + '<div style="padding:2px 8px 16px 20px;font-size:12px;color:var(--mut,#4A443C);line-height:1.55;max-width:640px">' + evid + '</div>'
      + '</details>';
  }).join('');

  var css = '<style>'
    + 'details[data-pvdra="' + gid + '"] summary::-webkit-details-marker{display:none}'
    + 'details[data-pvdra="' + gid + '"] summary:hover{background:var(--nested,#EDE8E0)}'
    + 'details[data-pvdra="' + gid + '"][open]>summary{background:var(--nested,#EDE8E0)}'
    + 'details[data-pvdra="' + gid + '"][open]>summary .' + gid + '-chev{transform:rotate(90deg)}'
    + '</style>';

  return css
    + '<div style="display:flex;flex-direction:column;border-top:1px solid var(--line,#E1E0DC)">' + rows + '</div>'
    + '<div style="font-family:var(--mono,monospace);font-size:10.5px;color:var(--mut2,#6a655f);margin-top:9px;line-height:1.5">Expand a dimension for its full evidence read; only one stays open at a time to keep the read focused.</div>';
}

/* exclusivity fallback: on open, close any sibling <details> sharing this
   accordion's group id (native `name` grouping already does this in modern
   engines -- this is a defensive backstop for engines that ignore it). */
function pvDD2RiskAccToggle(el) {
  try {
    if (!el || !el.open) return;
    var grp = el.getAttribute('data-pvdra');
    if (!grp || !el.parentNode) return;
    var sibs = el.parentNode.querySelectorAll('details[data-pvdra="' + grp + '"]');
    for (var i = 0; i < sibs.length; i++) {
      if (sibs[i] !== el && sibs[i].open) sibs[i].removeAttribute('open');
    }
  } catch (e) {}
}/* material-events timeline with INFERRED type classification + client-side filter.
   Replaces the plain pvDD2EventTimeline on the Risk & Resilience deep-dive tab.
   Type is inferred from title+detail keywords (Security/Cyber, Legal, Financial,
   Supply-chain, else Operational), never a manual tag. Severity/directness chip
   colour reads blast radius (service > division > else), independent of type. */
function pvDD2TypedEvents(events) {
  if (!events || !events.length) {
    return '<div style="font-size:12px;color:var(--mut2)">No material events on file.</div>';
  }
  var TYPES = [
    {key: 'security',   label: 'Security &amp; Cyber', rx: /breach|credential|cyber|security|incident/i},
    {key: 'legal',      label: 'Legal',                rx: /litigation|class action|lawsuit|judgment|enforcement/i},
    {key: 'financial',  label: 'Financial',            rx: /revenue|earnings|guidance|distress|funding/i},
    {key: 'supply',     label: 'Supply Chain',         rx: /supplier|outage|dependency|partnership/i},
    {key: 'operational', label: 'Operational',          rx: null}
  ];
  function typeOf(ev) {
    var s = String((ev && ev.title) || '') + ' ' + String((ev && ev.detail) || '');
    for (var i = 0; i < TYPES.length; i++) { if (TYPES[i].rx && TYPES[i].rx.test(s)) return TYPES[i]; }
    return TYPES[TYPES.length - 1];
  }
  function dirColor(d) {
    d = String(d || '');
    return /service/i.test(d) ? 'var(--emph,#C15E19)' : /division/i.test(d) ? '#A2500F' : 'var(--mut2,#6a655f)';
  }
  var rootId = 'dd2te' + Math.random().toString(36).slice(2, 9);
  var tagged = events.map(function (ev) { return {ev: ev, t: typeOf(ev)}; });
  var counts = {};
  tagged.forEach(function (rw) { counts[rw.t.key] = (counts[rw.t.key] || 0) + 1; });
  var present = TYPES.filter(function (t) { return counts[t.key]; });

  var btnStyle = function (on) {
    return 'display:inline-flex;align-items:center;gap:5px;font:700 9.5px var(--mono,monospace);'
      + 'letter-spacing:.04em;text-transform:uppercase;padding:4px 11px;border-radius:20px;cursor:pointer;'
      + 'background:' + (on ? 'var(--teal-t,#B6CCCB)' : 'transparent') + ';'
      + 'border:1.3px solid ' + (on ? 'var(--teal-d,#2F6E6B)' : 'var(--line2,#CECCC7)') + ';'
      + 'color:' + (on ? 'var(--teal-d,#2F6E6B)' : 'var(--mut,#4A443C)');
  };
  var filterRow = '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px">'
    + '<button type="button" data-dd2te-filter="all" onclick="pvDD2EvtFilter(this,\'all\',\'' + rootId + '\')" style="' + btnStyle(true) + '">All &middot; ' + events.length + '</button>'
    + present.map(function (t) {
        return '<button type="button" data-dd2te-filter="' + t.key + '" onclick="pvDD2EvtFilter(this,\'' + t.key + '\',\'' + rootId + '\')" style="' + btnStyle(false) + '">' + t.label + ' &middot; ' + counts[t.key] + '</button>';
      }).join('')
    + '</div>';

  var rows = tagged.map(function (rw) {
    var ev = rw.ev, t = rw.t, dc = dirColor(ev.directness);
    return '<div data-dd2te-row data-type="' + t.key + '" style="position:relative;padding:0 0 15px 18px">'
      + '<span style="position:absolute;left:-1px;top:3px;width:10px;height:10px;border-radius:50%;background:' + dc + ';border:2px solid var(--surface,#fff)"></span>'
      + '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:baseline">'
      +   '<span style="font-family:var(--mono,monospace);font-size:10px;color:var(--mut2)">' + pvAEsc(ev.date || '') + '</span>'
      +   '<b style="font-size:12.5px;color:var(--ink)">' + pvAEsc(ev.title || '') + '</b>'
      +   '<span style="font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:var(--mut);background:var(--nested,#EDE8E0);border:1px solid var(--line);border-radius:20px;padding:1px 8px">' + t.label + '</span>'
      +   '<span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:' + dc + ';border:1px solid ' + dc + ';border-radius:20px;padding:1px 7px">' + pvAEsc(ev.directness || 'unknown') + '</span>'
      + '</div>'
      + (ev.detail ? '<div style="font-size:11.5px;color:var(--mut);line-height:1.5;margin-top:3px">' + pvAEsc(ev.detail) + '</div>' : '')
      + (ev.resolution ? '<div style="font-size:11px;color:var(--mut2);margin-top:2px"><b>Resolution &middot;</b> ' + pvAEsc(ev.resolution) + '</div>' : '')
      + '</div>';
  }).join('');

  var timeline = '<div id="' + rootId + '" style="position:relative;padding-left:6px">'
    + '<div style="position:absolute;left:4px;top:5px;bottom:5px;width:2px;background:var(--line)"></div>'
    + rows + '</div>';

  return filterRow + timeline;
}

/* toggler for pvDD2TypedEvents, a real top-level global (loaded with the rest of the
   bundle, same pattern as pvRkVend/pvHmToggleCat elsewhere in this file), so the inline
   onclick resolves normally even though the markup itself was injected via innerHTML
   (script tags embedded inside innerHTML don't execute, so this can't be a <script> block). */
function pvDD2EvtFilter(btn, key, rootId) {
  var root = document.getElementById(rootId);
  if (!root) return;
  var bar = btn && btn.parentNode;
  var btns = bar ? bar.querySelectorAll('[data-dd2te-filter]') : [];
  for (var i = 0; i < btns.length; i++) {
    var on = btns[i].getAttribute('data-dd2te-filter') === key;
    btns[i].style.background = on ? 'var(--teal-t,#B6CCCB)' : 'transparent';
    btns[i].style.borderColor = on ? 'var(--teal-d,#2F6E6B)' : 'var(--line2,#CECCC7)';
    btns[i].style.color = on ? 'var(--teal-d,#2F6E6B)' : 'var(--mut,#4A443C)';
  }
  var rows = root.querySelectorAll('[data-dd2te-row]');
  for (var j = 0; j < rows.length; j++) {
    var t = rows[j].getAttribute('data-type');
    rows[j].style.display = (key === 'all' || t === key) ? '' : 'none';
  }
}
/* pvDD2FootprintMap(locations), LIGHT region schematic replacing the plain footprint table
   on Company & Ownership. Three labelled region blocks (US / EU / APAC, plus an "Other /
   Unconfirmed" catch-all only if needed) laid out horizontally; each block lists the
   locations that map to it as a small pill (name + type tag + confidence chip), with a
   hover tooltip carrying the full name + type. A location whose region text spans more
   than one bucket (e.g. "US · EU · APAC" cloud regions) is shown in every bucket it hits.
   Region is inferred by keyword match against the location's region (and, as a fallback,
   its name) text, not a real geo/tile map. Self-contained: only calls pvAEsc(). */
function pvDD2FootprintMap(locations) {
  if (!locations || !locations.length) return '<div style="font-size:12px;color:var(--mut2)">No delivery-relevant locations on file.</div>';

  var KW = {
    us:   ['us', 'usa', 'u.s.', 'united states', 'america', 'americas', 'bay area', 'montana', 'california', 'texas', 'new york', 'seattle', 'boston', 'chicago', 'denver', 'austin', 'silicon valley', 'north america', 'san francisco', 'los angeles'],
    eu:   ['eu', 'uk', 'europe', 'european', 'united kingdom', 'england', 'scotland', 'ireland', 'germany', 'france', 'netherlands', 'spain', 'italy', 'switzerland', 'emea', 'poland', 'sweden', 'belgium'],
    apac: ['apac', 'asia', 'asia-pacific', 'asia pacific', 'india', 'japan', 'china', 'singapore', 'australia', 'korea', 'philippines', 'vietnam', 'hong kong', 'indonesia', 'malaysia', 'thailand']
  };
  var hit = function (s, kw) {
    for (var i = 0; i < kw.length; i++) {
      var k = kw[i];
      if (k.length <= 3) { if (new RegExp('\\b' + k + '\\b', 'i').test(s)) return true; }
      else if (s.indexOf(k) >= 0) return true;
    }
    return false;
  };
  var classify = function (l) {
    var s = ((l.region || '') + ' ' + (l.name || '')).toLowerCase();
    var out = [];
    if (hit(s, KW.us)) out.push('us');
    if (hit(s, KW.eu)) out.push('eu');
    if (hit(s, KW.apac)) out.push('apac');
    return out.length ? out : ['other'];
  };

  var buckets = { us: [], eu: [], apac: [], other: [] };
  locations.forEach(function (l) {
    classify(l).forEach(function (k) { buckets[k].push(l); });
  });

  var BLOCKS = [
    { key: 'us',   label: 'US',  accent: 'var(--plum,#5C2B50)' },
    { key: 'eu',   label: 'EU',  accent: 'var(--teal-d,#2F6E6B)' },
    { key: 'apac', label: 'APAC', accent: 'var(--emph,#C15E19)' },
    { key: 'other', label: 'Other / Unconfirmed', accent: 'var(--mut2,#6a655f)' }
  ];

  /* Confidence colour is carried by a small swatch (fill/border), the label itself stays
     neutral text, mirrors the house pvEvidChip pattern. Plum/amber read fine as small
     swatches in both themes but are NOT safe as running text in dark mode (plum in
     particular is redefined as a dark background-fill token there), so colour never
     lands on the label. */
  var CONF = {
    'Verified':          { c: 'var(--teal-d,#2F6E6B)', fill: 'solid' },
    'Partial':           { c: '#A2500F',              fill: 'hatch' },
    'Supplier asserted': { c: 'var(--plum,#5C2B50)',  fill: 'outline' },
    'Proxy':             { c: 'var(--mut2,#6a655f)',  fill: 'outline' },
    'Missing':           { c: 'var(--mut2,#6a655f)',  fill: 'none' }
  };
  var confChip = function (conf) {
    var m = CONF[conf] || CONF['Missing'];
    var box = m.fill === 'solid' ? 'background:' + m.c
      : m.fill === 'hatch' ? 'background:repeating-linear-gradient(45deg,' + m.c + ' 0 2px,transparent 2px 4px);border:1px solid ' + m.c
      : m.fill === 'outline' ? 'border:1.5px solid ' + m.c
      : 'border:1px dashed var(--line2,#CECCC7)';
    return '<span style="display:inline-flex;align-items:center;gap:5px;font:600 9.5px var(--sans);color:var(--mut,#4A443C);white-space:nowrap"><i style="width:8px;height:8px;border-radius:2.5px;flex:none;' + box + '"></i>' + pvAEsc(conf || 'Unknown') + '</span>';
  };

  var pill = function (l) {
    var nm = l.name || 'Unnamed location', ty = l.type || 'Location';
    return '<div title="' + pvAEsc(nm + ' · ' + ty) + '" style="display:flex;flex-direction:column;gap:4px;padding:6px 9px;border-radius:8px;background:var(--surface,#fff);border:1px solid var(--line);min-width:0">'
      + '<span style="font-size:11px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + pvAEsc(nm) + '</span>'
      + '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">'
      +   '<span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.02em;color:var(--teal-d,#2F6E6B);background:var(--teal-t,#B6CCCB);border-radius:20px;padding:2px 7px;white-space:nowrap">' + pvAEsc(ty) + '</span>'
      +   confChip(l.conf)
      + '</div></div>';
  };

  var blocksHtml = BLOCKS.filter(function (b) { return b.key !== 'other' || buckets.other.length; }).map(function (b) {
    var items = buckets[b.key];
    var list = items.map(pill).join('');
    return '<div style="background:var(--nested,#EDE8E0);border:1px solid var(--line);border-left:3px solid ' + b.accent + ';border-radius:9px;padding:10px;min-width:0">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px">'
      +   '<span style="font:800 10.5px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--ink)">' + pvAEsc(b.label) + '</span>'
      +   '<span style="font-size:10px;font-weight:700;color:var(--mut2)">' + items.length + '</span>'
      + '</div>'
      + (items.length
          ? '<div style="display:flex;flex-direction:column;gap:6px' + (items.length > 6 ? ';max-height:220px;overflow-y:auto;padding-right:2px' : '') + '">' + list + '</div>'
          : '<div style="font-size:10.5px;color:var(--mut2);font-style:italic">No locations mapped</div>')
      + '</div>';
  }).join('');

  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">' + blocksHtml + '</div>'
    + '<div class="footbound" style="margin-top:9px">Region read from each location&rsquo;s recorded region/name text, not a geo-coded map, a location spanning regions (e.g. multi-region cloud delivery) is shown in every region it covers.</div>';
}
/* pvDD2FinViz(fin), compact visual replacement for the plain financial-summary table on the
   Financial & Market deep-dive subtab. fin = cand.financials (or cand.deepDive.financials):
   {latestRevenue, revenue, growth, margin, profitability, valuationOrMarketCap, arr, guidance,
   revenueHistory:[{period,value}], sources:[]}. Renders (1) a revenue-history bar sparkline, 
   bar heights normalized to the leading $ figure parsed out of each value string, the exact
   string kept as the SVG <title> tooltip and, where a bar can't be parsed, as its on-chart label
   so nothing is silently dropped; (2) four key-metric stat chips (latest revenue / growth /
   market cap / profitability) with a small coloured dot, growth reads teal when the text signs
   positive; (3) a slim secondary line for ARR, margin and guidance so no reported figure is lost.
   Returns the panel's INNER html only, caller wraps it with pvDD2Card. Never invents a number:
   every displayed figure is the original string, or 'Not reported' when the field is absent.
   Only global relied on: pvAEsc (HTML-escape). */
function pvDD2FinViz(fin) {
  fin = fin || {};
  var esc = pvAEsc;

  // ---- leading-$ parser (bar-height scaling only; never re-derives or invents a figure) ----
  function pvfvDollar(v) {
    var s = String(v == null ? '' : v).trim();
    var m = s.match(/^\$\s*([\d][\d,]*\.?\d*)\s*([kKmMbBtT])?/);
    if (!m) return null;
    var num = parseFloat(m[1].replace(/,/g, ''));
    if (!isFinite(num)) return null;
    var mult = m[2] ? ({ K: 0.001, M: 1, B: 1000, T: 1000000 }[m[2].toUpperCase()]) : 1;
    return num * mult; // normalized to $M, for bar-scaling only
  }

  // ---- sign reader for free-text growth (handles "+29% YoY", "-4%", "declined", "flat") ----
  function pvfvSign(v) {
    var s = String(v == null ? '' : v);
    if (!s) return 0;
    if (/\b(declin|contract|down|decreas|negative|shrink)/i.test(s)) return -1;
    if (/\b(grow|growth|increas|expand|up\b)/i.test(s)) return 1;
    var pm = s.match(/(-)?\+?\s*\d[\d.,]*\s*%/);
    if (pm) return pm[1] ? -1 : 1;
    return 0;
  }

  // ---- sentiment reader for free-text profitability ----
  function pvfvProfitSign(v) {
    var s = String(v == null ? '' : v);
    if (!s) return 0;
    if (/not\s+(yet\s+)?profit|unprofitab|net\s+loss|loss\s+of|burn(ing)?\s|deficit|negative\s+(net|income|margin)/i.test(s)) return -1;
    if (/profit(able)?|net\s+income\s+of\s*\$|positive\s+(net|cash|income)|cash[\s-]?flow[\s-]?positive/i.test(s)) return 1;
    return 0;
  }

  var TEAL = 'var(--teal-d,#2F6E6B)', AMBER = '#A2500F', PLUM = 'var(--plum,#5C2B50)', MUT2 = 'var(--mut2,#6a655f)';

  var latestRevenue = fin.latestRevenue || fin.revenue || '';
  var marketCap = fin.valuationOrMarketCap || fin.cash || '';
  var growth = fin.growth || '';
  var profitability = fin.profitability || '';
  var hasAny = latestRevenue || marketCap || growth || profitability || fin.arr || fin.margin || fin.guidance || (fin.revenueHistory && fin.revenueHistory.length);
  if (!hasAny) return '<div style="font-size:12px;color:' + MUT2 + '">No financial data on file for this supplier.</div>';

  // ---- (2) key-metric stat chips ----
  function chip(label, raw, dot) {
    var val = raw ? esc(raw) : '<span style="color:' + MUT2 + ';font-weight:600">Not reported</span>';
    return '<div style="min-width:0;background:var(--nested,#EDE8E0);border-left:3px solid ' + dot + ';border-radius:9px;padding:9px 12px 10px;display:flex;flex-direction:column;gap:5px">'
      + '<div style="display:flex;align-items:center;gap:6px;min-width:0">'
      + '<span style="width:7px;height:7px;border-radius:50%;background:' + dot + ';flex:none"></span>'
      + '<span style="font:700 9.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:' + MUT2 + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + label + '</span>'
      + '</div>'
      + '<span style="font-size:14px;font-weight:800;color:var(--ink);line-height:1.3;word-break:break-word">' + val + '</span>'
      + '</div>';
  }
  var growthSign = growth ? pvfvSign(growth) : 0;
  var growthDot = growthSign > 0 ? TEAL : growthSign < 0 ? AMBER : MUT2;
  var profitSign = profitability ? pvfvProfitSign(profitability) : 0;
  var profitDot = profitSign > 0 ? TEAL : profitSign < 0 ? AMBER : MUT2;
  var chips = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:10px">'
    + chip('Latest revenue', latestRevenue, PLUM)
    + chip('Growth', growth, growthDot)
    + chip('Market cap', marketCap, PLUM)
    + chip('Profitability', profitability, profitDot)
    + '</div>';

  // ---- secondary line: remaining reported fields, kept but not chip-sized ----
  var extras = [];
  if (fin.arr) extras.push(['ARR / product revenue', fin.arr]);
  if (fin.margin) extras.push(['Net income / cash flow', fin.margin]);
  if (fin.guidance) extras.push(['Forward guidance', fin.guidance]);
  var extraLine = extras.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:10px">' + extras.map(function (e) {
    return '<span style="font-size:11.5px;line-height:1.4"><span style="color:' + MUT2 + ';font-weight:600">' + esc(e[0]) + ':</span> <span style="color:var(--ink)">' + esc(e[1]) + '</span></span>';
  }).join('') + '</div>' : '';

  // ---- (1) revenue-history bar sparkline ----
  var revBlock = '';
  var hist = fin.revenueHistory;
  if (hist && hist.length) {
    var pts = hist.map(function (h) { return { period: h.period || '', raw: h.value || '', norm: pvfvDollar(h.value) }; });
    var haveNums = pts.some(function (p) { return p.norm != null; });
    if (haveNums) {
      var maxAbs = Math.max.apply(null, pts.map(function (p) { return p.norm != null ? Math.abs(p.norm) : 0; }));
      var n = pts.length, W = Math.max(220, n * 58), H = 108, padT = 20, padB = 24, plotH = H - padT - padB;
      var gap = W / n, bw = Math.min(36, gap * 0.55);
      var bars = pts.map(function (p, i) {
        var x = i * gap + (gap - bw) / 2, isLast = i === n - 1;
        var title = esc((p.period ? p.period + ': ' : '') + p.raw);
        if (p.norm != null) {
          var h = maxAbs > 0 ? Math.max(3, (Math.abs(p.norm) / maxAbs) * plotH) : 3;
          var y = padT + plotH - h;
          var fill = isLast ? TEAL : 'var(--teal-t,#B6CCCB)';
          var vlab = esc(String(p.raw).split(/[\s(]/)[0]);
          return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + fill + '"' + (isLast ? '' : ' stroke="' + TEAL + '" stroke-width="1.1"') + '><title>' + title + '</title></rect>'
            + (vlab ? '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" font-size="8.5" font-family="var(--mono,monospace)" font-weight="700" fill="var(--ink)">' + vlab + '</text>' : '')
            + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9" font-family="var(--mono,monospace)" fill="' + MUT2 + '">' + esc(p.period) + '</text>';
        }
        // unparseable point: minimal hatched stub, exact raw text on-chart (never a silently-blank bar)
        var stubH = 4, y2 = padT + plotH - stubH;
        var rawLab = esc(String(p.raw || 'n/a').slice(0, 14));
        return '<rect x="' + x.toFixed(1) + '" y="' + y2.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + stubH + '" rx="2" fill="none" stroke="' + MUT2 + '" stroke-dasharray="2 2"><title>' + title + '</title></rect>'
          + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y2 - 5).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-family="var(--mono,monospace)" fill="' + MUT2 + '">' + rawLab + '</text>'
          + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9" font-family="var(--mono,monospace)" fill="' + MUT2 + '">' + esc(p.period) + '</text>';
      }).join('');
      revBlock = '<div style="overflow-x:auto;margin-top:12px"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:' + Math.min(480, W) + 'px;height:' + H + 'px;display:block" role="img" aria-label="Revenue by period, normalized bar chart">' + bars + '</svg></div>';
    } else {
      // nothing in the series parsed to a number, never render an empty chart, show the raw series instead
      revBlock = '<div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px;font-size:11.5px">' + pts.map(function (p) {
        return '<span><span style="color:' + MUT2 + ';font-weight:600">' + esc(p.period) + ':</span> <span style="color:var(--ink)">' + esc(p.raw || 'n/a') + '</span></span>';
      }).join('') + '</div>';
    }
  }

  return chips + extraLine + revBlock;
}