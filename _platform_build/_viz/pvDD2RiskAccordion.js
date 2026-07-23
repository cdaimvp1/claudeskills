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
    'Low':                   {c: 'var(--teal-d,#2F6E6B)', bg: 'var(--teal-t,#DCEBE9)'},
    'Strong':                {c: 'var(--teal-d,#2F6E6B)', bg: 'var(--teal-t,#DCEBE9)'},
    'Moderate':              {c: '#8A5A00',                bg: 'var(--ti-amber,#FBF1DA)'},
    'High':                  {c: 'var(--emph,#C15E19)',    bg: 'var(--emph-t,#F6DDC9)'},
    'Critical':              {c: '#A23A30',                bg: 'var(--ti-red,#FBE7E3)'},
    'Insufficient evidence': {c: 'var(--mut2,#6a655f)',    bg: 'var(--nested,#f1efec)'}
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
    + 'details[data-pvdra="' + gid + '"] summary:hover{background:var(--nested,#f1efec)}'
    + 'details[data-pvdra="' + gid + '"][open]>summary{background:var(--nested,#f1efec)}'
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
}