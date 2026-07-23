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
    var nm = pvAEsc((av.name || '').split(/[ ,]/)[0]);
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
    + '<div class="footbound" style="margin-top:9px">Financial viability (x) against capability fit (y), split at the 2.5 midpoint on each axis &mdash; a quadrant read, not a blended score. Gates below can still block an otherwise-Leaders supplier.</div>';
}
