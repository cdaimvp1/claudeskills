/* pvDD2FootprintMap(locations) — LIGHT region schematic replacing the plain footprint table
   on Company & Ownership. Three labelled region blocks (US / EU / APAC, plus an "Other /
   Unconfirmed" catch-all only if needed) laid out horizontally; each block lists the
   locations that map to it as a small pill (name + type tag + confidence chip), with a
   hover tooltip carrying the full name + type. A location whose region text spans more
   than one bucket (e.g. "US · EU · APAC" cloud regions) is shown in every bucket it hits.
   Region is inferred by keyword match against the location's region (and, as a fallback,
   its name) text — not a real geo/tile map. Self-contained: only calls pvAEsc(). */
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
    { key: 'us',    label: 'US',   accent: 'var(--plum,#5C2B50)' },
    { key: 'eu',    label: 'EU',   accent: 'var(--teal-d,#2F6E6B)' },
    { key: 'apac',  label: 'APAC', accent: 'var(--emph,#C15E19)' },
    { key: 'other', label: 'Other / Unconfirmed', accent: 'var(--mut2,#6a655f)' }
  ];

  /* Confidence colour is carried by a small swatch (fill/border), the label itself stays
     neutral text — mirrors the house pvEvidChip pattern. Plum/amber read fine as small
     swatches in both themes but are NOT safe as running text in dark mode (plum in
     particular is redefined as a dark background-fill token there), so colour never
     lands on the label. */
  var CONF = {
    'Verified':          { c: 'var(--teal-d,#2F6E6B)', fill: 'solid' },
    'Partial':           { c: '#8A5A00',               fill: 'hatch' },
    'Supplier asserted': { c: 'var(--plum,#5C2B50)',   fill: 'outline' },
    'Proxy':             { c: 'var(--mut2,#6a655f)',   fill: 'outline' },
    'Missing':           { c: 'var(--mut2,#6a655f)',   fill: 'none' }
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
      +   '<span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.02em;color:var(--teal-d,#2F6E6B);background:var(--teal-t,#DCEBE9);border-radius:20px;padding:2px 7px;white-space:nowrap">' + pvAEsc(ty) + '</span>'
      +   confChip(l.conf)
      + '</div></div>';
  };

  var blocksHtml = BLOCKS.filter(function (b) { return b.key !== 'other' || buckets.other.length; }).map(function (b) {
    var items = buckets[b.key];
    var list = items.map(pill).join('');
    return '<div style="background:var(--nested,#f1efec);border:1px solid var(--line);border-left:3px solid ' + b.accent + ';border-radius:9px;padding:10px;min-width:0">'
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
    + '<div class="footbound" style="margin-top:9px">Region read from each location&rsquo;s recorded region/name text, not a geo-coded map &mdash; a location spanning regions (e.g. multi-region cloud delivery) is shown in every region it covers.</div>';
}
