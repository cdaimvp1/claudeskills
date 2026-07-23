/* pvDD2FinViz(fin) — compact visual replacement for the plain financial-summary table on the
   Financial & Market deep-dive subtab. fin = cand.financials (or cand.deepDive.financials):
   {latestRevenue, revenue, growth, margin, profitability, valuationOrMarketCap, arr, guidance,
   revenueHistory:[{period,value}], sources:[]}. Renders (1) a revenue-history bar sparkline —
   bar heights normalized to the leading $ figure parsed out of each value string, the exact
   string kept as the SVG <title> tooltip and, where a bar can't be parsed, as its on-chart label
   so nothing is silently dropped; (2) four key-metric stat chips (latest revenue / growth /
   market cap / profitability) with a small coloured dot — growth reads teal when the text signs
   positive; (3) a slim secondary line for ARR, margin and guidance so no reported figure is lost.
   Returns the panel's INNER html only — caller wraps it with pvDD2Card. Never invents a number:
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

  var TEAL = 'var(--teal-d,#2F6E6B)', AMBER = '#8A5A00', PLUM = 'var(--plum,#5C2B50)', MUT2 = 'var(--mut2,#6a655f)';

  var latestRevenue = fin.latestRevenue || fin.revenue || '';
  var marketCap = fin.valuationOrMarketCap || fin.cash || '';
  var growth = fin.growth || '';
  var profitability = fin.profitability || '';
  var hasAny = latestRevenue || marketCap || growth || profitability || fin.arr || fin.margin || fin.guidance || (fin.revenueHistory && fin.revenueHistory.length);
  if (!hasAny) return '<div style="font-size:12px;color:' + MUT2 + '">No financial data on file for this supplier.</div>';

  // ---- (2) key-metric stat chips ----
  function chip(label, raw, dot) {
    var val = raw ? esc(raw) : '<span style="color:' + MUT2 + ';font-weight:600">Not reported</span>';
    return '<div style="min-width:0;background:var(--nested,#f1efec);border-left:3px solid ' + dot + ';border-radius:9px;padding:9px 12px 10px;display:flex;flex-direction:column;gap:5px">'
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
          var fill = isLast ? TEAL : 'var(--teal-t,#DCEBE9)';
          var vlab = esc(String(p.raw).split(/[\s(]/)[0]);
          return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + fill + '"' + (isLast ? '' : ' stroke="' + TEAL + '" stroke-width="1.1"') + '><title>' + title + '</title></rect>'
            + (vlab ? '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" font-size="8.5" font-family="var(--mono,monospace)" font-weight="700" fill="var(--ink)">' + vlab + '</text>' : '')
            + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9" font-family="var(--mono,monospace)" fill="' + MUT2 + '">' + esc(p.period) + '</text>';
        }
        // unparseable point: minimal hatched stub, exact raw text on-chart (never a silently-blank bar)
        var stubH = 4, y2 = padT + plotH - stubH;
        var rawLab = esc(String(p.raw || '—').slice(0, 14));
        return '<rect x="' + x.toFixed(1) + '" y="' + y2.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + stubH + '" rx="2" fill="none" stroke="' + MUT2 + '" stroke-dasharray="2 2"><title>' + title + '</title></rect>'
          + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y2 - 5).toFixed(1) + '" text-anchor="middle" font-size="7.5" font-family="var(--mono,monospace)" fill="' + MUT2 + '">' + rawLab + '</text>'
          + '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9" font-family="var(--mono,monospace)" fill="' + MUT2 + '">' + esc(p.period) + '</text>';
      }).join('');
      revBlock = '<div style="overflow-x:auto;margin-top:12px"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:' + Math.min(480, W) + 'px;height:' + H + 'px;display:block" role="img" aria-label="Revenue by period, normalized bar chart">' + bars + '</svg></div>';
    } else {
      // nothing in the series parsed to a number — never render an empty chart, show the raw series instead
      revBlock = '<div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px;font-size:11.5px">' + pts.map(function (p) {
        return '<span><span style="color:' + MUT2 + ';font-weight:600">' + esc(p.period) + ':</span> <span style="color:var(--ink)">' + esc(p.raw || '—') + '</span></span>';
      }).join('') + '</div>';
    }
  }

  return chips + extraLine + revBlock;
}