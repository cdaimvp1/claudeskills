/* =============================================================================
 * zopa.js, shared ZOPA (Zone of Possible Agreement) visualization for the Deal
 * artifact. A horizontal track per commercial line showing the ZOPA zone
 * (target -> walk-away) as a teal band, with positioned marks for target,
 * walk-away, fallback, Theo's opening (burnt-orange) and the supplier ask
 * (plum; red only when it sits above walk-away), plus the matched market
 * benchmark as an ink POINT tick, followed by the total-deal ZOPA / TCO band
 * and a bottom legend. We hold POINT benchmarks, not a market lo/hi band, so
 * a single market tick is drawn and NEVER a fabricated range; lines with no
 * comp say so.
 *
 * Extracted verbatim from _parts/tab-commercials.js (2026-07-23) so any tab
 * that needs the ZOPA renders byte-identical output. Public entry:
 *   window.DealZopa.render(d)  ->  HTML string, wrapped in <div class="zopa-viz">
 *
 * Currently called from the Economics tab (tab-commercials.js, 3A "ZOPA by
 * Line Item · Pricing & Benchmarks"); the Overview tab's "Total-deal ZOPA"
 * section can call this same entry point to render the identical viz.
 *
 * Depends on GLOBALS exported by helpers.js: esc, evidenceChip, jumpLink,
 * gapCard, M, assumVal, clampp, benchForLine. Load order MUST be
 * helpers.js -> data.js -> zopa.js -> the tab builders (see
 * build_deal_artifact.py JS_ORDER) so window.DealZopa exists before any tab
 * builder runs at mount.
 * ========================================================================== */
(function (global) {
'use strict';

/* ---------- 0. scoped CSS, injected once into <head> ----------------------
 * Ported 1:1 from tab-commercials.js's scoped <style> block, rescoped from
 * `.commercials-tab .X` to `.zopa-viz .X` so it applies wherever the ZOPA is
 * mounted (tab-agnostic). Palette-remapped from platform pv-11 (ZOPA zone =
 * teal, our target/walk/fallback = plum family, opening = burnt-orange,
 * ask = plum or red only when above walk-away, benchmark = neutral ink
 * point). Guarded + idempotent: safe to call render() from multiple tabs. */
var ZOPA_CSS =
  '.zopa-viz .zline{margin:0 0 16px}' +
  '.zopa-viz .zline:last-of-type{margin-bottom:8px}' +
  '.zopa-viz .zlhd{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:7px}' +
  '.zopa-viz .zlname{font-weight:700;font-size:var(--fz-sm);color:var(--ink)}' +
  '.zopa-viz .zlask{font-size:var(--fz-floor);font-weight:700}' +
  '.zopa-viz .zlask.over{color:var(--danger)}' +
  '.zopa-viz .zlask.ok{color:var(--teal-d)}' +
  '.zopa-viz .ztrack{position:relative;height:30px;margin:2px 0}' +
  '.zopa-viz .zaxis{position:absolute;top:50%;left:0;right:0;height:2px;transform:translateY(-50%);background:var(--line2);border-radius:2px}' +
  '.zopa-viz .zzopa{position:absolute;top:50%;transform:translateY(-50%);height:16px;background:var(--teal-t);border:1px solid var(--teal-d);border-radius:4px}' +
  '.zopa-viz .ztgt,.zopa-viz .zwalk{position:absolute;top:calc(50% - 11px);width:2px;height:22px;background:var(--plum)}' +
  '.zopa-viz .zwalk{opacity:.5}' +
  '.zopa-viz .zfb{position:absolute;top:calc(50% - 7px);height:14px;border-left:2px dotted var(--plum);opacity:.75}' +
  '.zopa-viz .zopen{position:absolute;top:calc(50% - 6px);width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--surface);border:2px solid var(--emph);box-sizing:border-box}' +
  '.zopa-viz .zask{position:absolute;top:calc(50% - 14px);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid var(--plum)}' +
  '.zopa-viz .zask.over{border-top-color:var(--danger)}' +
  '.zopa-viz .zbench{position:absolute;top:calc(50% - 12px);width:2px;height:24px;background:var(--ink2)}' +
  '.zopa-viz .zlleg{display:flex;gap:14px;flex-wrap:wrap;font-size:var(--fz-floor);color:var(--mut2);margin-top:6px}' +
  '.zopa-viz .zlleg .zztgt{color:var(--teal-d);font-weight:700}' +
  '.zopa-viz .znobench{color:var(--mut2);font-style:italic}' +
  '.zopa-viz .zdetail{margin-top:9px;padding-top:9px;border-top:1px dashed var(--line2);display:grid;gap:5px}' +
  '.zopa-viz .zdrow{display:flex;gap:10px;font-size:var(--fz-sm);line-height:1.45}' +
  '.zopa-viz .zdk{flex:0 0 118px;color:var(--mut2);font-weight:700}' +
  '.zopa-viz .zdv{color:var(--ink2);flex:1;min-width:0}' +
  '.zopa-viz .zdv b{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}' +
  '.zopa-viz .ztotal{margin-top:14px;padding-top:14px;border-top:2px solid var(--plum)}' +
  '.zopa-viz .zthd{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px}' +
  '.zopa-viz .ztname{font-weight:800;font-size:var(--fz);color:var(--plum)}' +
  '.zopa-viz .ztsub{font-size:var(--fz-floor);color:var(--mut2)}' +
  '.zopa-viz .ztband{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}' +
  '.zopa-viz .ztchip{font-size:var(--fz-sm);font-weight:700;border-radius:30px;padding:5px 12px;white-space:nowrap;font-variant-numeric:tabular-nums}' +
  '.zopa-viz .ztchip.open{background:var(--surface);border:1.5px solid var(--emph);color:var(--emph)}' +
  '.zopa-viz .ztchip.tgt{background:var(--teal-t);color:var(--teal-d)}' +
  '.zopa-viz .ztchip.walk{background:var(--plum-t);color:var(--plum)}' +
  '.zopa-viz .ztchip.ok{background:var(--teal-t);color:var(--teal-d)}' +
  '.zopa-viz .ztchip.over{background:var(--danger-t);color:var(--danger)}' +
  '.zopa-viz .ztarrow{font-size:var(--fz-floor);color:var(--mut2)}' +
  '.zopa-viz .zopalegend{display:flex;gap:16px;flex-wrap:wrap;font-size:var(--fz-floor);color:var(--mut2);margin-top:14px;padding-top:11px;border-top:1px solid var(--line)}' +
  '.zopa-viz .zopalegend span{display:inline-flex;align-items:center}' +
  '.zopa-viz .zopalegend i{display:inline-block;margin-right:6px;vertical-align:middle}' +
  '.zopa-viz .zlg.zopa{width:16px;height:10px;background:var(--teal-t);border:1px solid var(--teal-d);border-radius:2px}' +
  '.zopa-viz .zlg.tgt{width:2px;height:14px;background:var(--plum)}' +
  '.zopa-viz .zlg.walk{width:2px;height:14px;background:var(--plum);opacity:.5}' +
  '.zopa-viz .zlg.fb{width:0;height:14px;border-left:2px dotted var(--plum);opacity:.75}' +
  '.zopa-viz .zlg.open{width:12px;height:12px;background:var(--surface);border:2px solid var(--emph);border-radius:50%;box-sizing:border-box}' +
  '.zopa-viz .zlg.ask{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid var(--plum)}' +
  '.zopa-viz .zlg.bench{width:2px;height:14px;background:var(--ink2)}';

function injectCss() {
  if (document.getElementById('zopa-css')) return;   // idempotent: safe across repeated render() calls
  var s = document.createElement('style');
  s.id = 'zopa-css';
  s.textContent = ZOPA_CSS;
  document.head.appendChild(s);
}

/* ---------- 1. per-line market-benchmark derivation ------------------------
 * Derive the line-level market POINT from the benchmark's OWN stated figures
 * (transparent, no fragile string parsing). CL-1 -> BENCH-int (2024
 * precedent ~$37/emp/yr, scaled to the employee basis); CL-2 -> BENCH-svc
 * (implementation at the $1,500-1,750/day norm midpoint vs the ~$2,000/day
 * ask). The raw comparisonValue + comparability are surfaced verbatim. */
function zopaBenchForLine(d, l) {
  const b = benchForLine(d, l.id);
  if (!b) return null;
  let value = null, note = '';
  if (l.id === 'CL-1') {
    const emp = l.quantity || assumVal(d, 'ASM-1', 18000);
    value = 37 * emp;                                     // ~$37/emp/yr 2024 precedent x employee basis
    note = '~$37/employee/yr 2024 precedent x ' + emp.toLocaleString('en-US') + ' employees';
  } else if (l.id === 'CL-2') {
    value = Math.round(l.supplierAmount * 1625 / 2000);   // $1,625/day norm midpoint vs the ~$2,000/day ask
    note = '$1,625/day norm midpoint vs the ' + esc('≈$2,000') + '/day ask';
  } else {
    return null;                                          // no numeric derivation available -> no comp
  }
  return { value: value, note: note, benchId: b.id, comparability: b.comparability, raw: b.comparisonValue, explanation: b.explanation, evidenceType: b.evidenceType };
}

/* ---------- 2. per-line ZOPA track ------------------------------------------ */
function zopaLineHTML(d, l) {
  const ask = l.supplierAmount, target = l.target, walk = l.maximumAcceptable, fallback = l.fallback;
  // Theo opening: anchor aggressively but credibly BELOW target so there is room to settle
  // up; = target-(walk-target), floored at 15% under target since we hold no market low.
  const open = Math.round(Math.max(target * 0.85, 2 * target - walk));
  const over = ask > walk;                  // supplier ask above our walk-away -> the ONLY red trigger
  const bench = zopaBenchForLine(d, l);
  // Scale = the negotiation span (opening -> ask), plus the benchmark point when present.
  // No fabricated market band: only the marks we actually hold are placed on the track.
  const vals = [open, target, walk, ask, fallback];
  if (bench) vals.push(bench.value);
  let min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  const pad = (max - min) * 0.08 || 1; min -= pad; max += pad;
  const span = (max - min) || 1;
  const pos = v => clampp((v - min) / span * 100, 0, 100);
  const gap = Math.round((1 - open / target) * 100);
  const track = '<div class="ztrack">' +
    '<div class="zaxis"></div>' +
    '<div class="zzopa" style="left:' + pos(target).toFixed(1) + '%;width:' + Math.max(pos(walk) - pos(target), 0).toFixed(1) + '%" title="ZOPA ' + M(target) + ' to ' + M(walk) + '"></div>' +
    '<div class="ztgt" style="left:' + pos(target).toFixed(1) + '%" title="Target ' + M(target) + '"></div>' +
    '<div class="zwalk" style="left:' + pos(walk).toFixed(1) + '%" title="Walk-away ' + M(walk) + '"></div>' +
    (fallback != null ? '<div class="zfb" style="left:' + pos(fallback).toFixed(1) + '%" title="Fallback ' + M(fallback) + '"></div>' : '') +
    '<div class="zopen" style="left:' + pos(open).toFixed(1) + '%" title="Theo opening ' + M(open) + '"></div>' +
    '<div class="zask ' + (over ? 'over' : 'ok') + '" style="left:calc(' + pos(ask).toFixed(1) + '% - 5px)" title="Supplier ask ' + M(ask) + '"></div>' +
    (bench ? '<div class="zbench" style="left:' + pos(bench.value).toFixed(1) + '%" title="Market ' + M(bench.value) + ' (' + esc(bench.comparability) + ' comparability)"></div>' : '') +
  '</div>';
  const leg = '<div class="zlleg">' +
    '<span class="zztgt">ZOPA ' + M(target) + ' to ' + M(walk) + '</span>' +
    '<span>opening ' + M(open) + '</span>' +
    '<span>fallback ' + M(fallback) + '</span>' +
    (bench ? '<span>market ' + M(bench.value) + ' (' + esc(bench.comparability) + ')</span>'
           : '<span class="znobench">no market benchmark in session</span>') +
  '</div>';
  const mktRow = bench
    ? '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><b>' + M(bench.value) + '</b> - ' + esc(bench.note) + '. ' + esc(bench.raw) + ' · ' + esc(bench.comparability) + ' comparability ' + evidenceChip(bench.evidenceType, { sources: [bench.benchId] }) + '</span></div>'
    : '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><span class="znobench">No market benchmark for this line in session</span> - no external comparison was available, so no market mark is drawn (no lo/hi band fabricated). ' + evidenceChip('unavailable') + '</span></div>';
  const detail = '<div class="zdetail">' +
    '<div class="zdrow"><span class="zdk">Price</span><span class="zdv">supplier ask <b>' + M(ask) + '</b> vs target ' + M(target) + ' · fallback ' + M(fallback) + ' · walk-away ' + M(walk) + ' ' + evidenceChip(l.evidenceType, { sources: l.sourceIds }) + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Theo opening</span><span class="zdv">open at <b>' + M(open) + '</b>, about ' + gap + '% below target, leaving room to settle at ' + M(target) + ' ' + evidenceChip('inference') + '</span></div>' +
    mktRow +
    '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + (over
        ? 'Ask sits <b>' + M(ask - walk) + '</b> above the ' + M(walk) + ' walk-away; hold to the ' + M(target) + ' target. ' + jumpLink('ISS-12 →', 'tab:contract/sub:legal')
        : 'Ask is within the ' + M(target) + ' to ' + M(walk) + ' zone; settle toward the ' + M(target) + ' target.') + '</span></div>' +
  '</div>';
  return '<div class="zline"><div class="zlhd"><span class="zlname">' + esc(l.item) + '</span>' +
    '<span class="zlask ' + (over ? 'over' : 'ok') + '">supplier ask ' + M(ask) + (over ? ' · above walk-away' : ' · within range') + '</span></div>' +
    track + leg + detail + '</div>';
}

/* ---------- 3. total-deal ZOPA / TCO band -----------------------------------
 * Whole-deal ask/target/walk totals from the 3-yr scenarios (SC-ask /
 * SC-target / SC-max), fallback from SC-fallback; opening derived the same
 * way as the per-line opening. No deal-level market benchmark exists in
 * session -> honest gap-state. */
function zopaTotalHTML(d) {
  const sc = id => ((d.scenarios || []).find(s => s.id === id) || {});
  const askS = sc('SC-ask'), tgtS = sc('SC-target'), fbS = sc('SC-fallback'), maxS = sc('SC-max');
  const askTot = askS.total || 0, tgtTot = tgtS.total || 0, walkTot = maxS.total || 0, fbTot = fbS.total || 0;
  const openTot = Math.round(Math.max(tgtTot * 0.85, 2 * tgtTot - walkTot));
  const over = askTot > walkTot, apart = Math.abs(askTot - tgtTot);
  const gap = Math.round((1 - openTot / tgtTot) * 100);
  const emp = assumVal(d, 'ASM-1', 18000), years = assumVal(d, 'ASM-2', 3);
  const read = 'Supplier ask ' + M(askTot) + ' sits ' + (over ? 'above' : 'within') + ' the ' + M(walkTot) +
    ' walk-away; the ' + M(tgtTot) + ' target anchors the deal (about ' + M(apart) + ' below ask). The platform subscription is the biggest lever.';
  const band = '<div class="ztband">' +
    '<span class="ztchip open">Theo opening ' + M(openTot) + '</span>' +
    '<span class="ztchip tgt">Target ' + M(tgtTot) + '</span>' +
    '<span class="ztarrow">to</span>' +
    '<span class="ztchip walk">Walk-away ' + M(walkTot) + '</span>' +
    '<span class="ztchip ' + (over ? 'over' : 'ok') + '">Supplier ask ' + M(askTot) + '</span>' +
  '</div>';
  const detail = '<div class="zdetail">' +
    '<div class="zdrow"><span class="zdk">Ask vs target</span><span class="zdv">supplier ask <b>' + M(askTot) + '</b> vs target ' + M(tgtTot) + ' (' + M(apart) + ' apart over the ' + years + '-yr term) ' + evidenceChip('calculated') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Opening</span><span class="zdv">aggregate opening <b>' + M(openTot) + '</b>, about ' + gap + '% below target, the room to negotiate up to ' + M(tgtTot) + ' ' + evidenceChip('inference') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Walk-away</span><span class="zdv"><b>' + M(walkTot) + '</b> max-acceptable (3-yr) · fallback ' + M(fbTot) + '. Budget ceiling unconfirmed ' + jumpLink('GAP-3 →', 'tab:brief') + ' ' + evidenceChip(maxS.evidenceType || 'assumption') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Market benchmark</span><span class="zdv"><span class="znobench">No deal-level market benchmark in session</span> - the only comps are the two per-line precedents above (platform $/employee, implementation day-rate); no whole-deal TCV comparison is fabricated. ' + evidenceChip('unavailable') + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + read + '</span></div>' +
  '</div>';
  return '<div class="ztotal"><div class="zthd"><span class="ztname">Total-deal ZOPA · TCO</span>' +
    '<span class="ztsub">' + emp.toLocaleString('en-US') + ' employees · ' + years + '-yr term · target to walk-away for the whole deal</span></div>' +
    band + detail + '</div>';
}

const ZOPA_BOTTOM_LEGEND = '<div class="zopalegend">' +
  '<span><i class="zlg zopa"></i>ZOPA (target to walk-away)</span>' +
  '<span><i class="zlg tgt"></i>target</span>' +
  '<span><i class="zlg walk"></i>walk-away</span>' +
  '<span><i class="zlg fb"></i>fallback</span>' +
  '<span><i class="zlg open"></i>Theo opening</span>' +
  '<span><i class="zlg ask"></i>supplier ask (red = above walk-away)</span>' +
  '<span><i class="zlg bench"></i>market benchmark (point)</span>' +
'</div>';

function renderZopaGantt(d) {
  const lines = d.commercialLines || [];
  if (!lines.length) return gapCard('No commercial lines in session', 'No line items to build a ZOPA from.');
  return lines.map(l => zopaLineHTML(d, l)).join('') + zopaTotalHTML(d) + ZOPA_BOTTOM_LEGEND;
}

/* ---------- 4. public entry ------------------------------------------------- */
function render(d) {
  injectCss();
  return '<div class="zopa-viz">' + renderZopaGantt(d) + '</div>';
}

global.DealZopa = { render: render };

})(typeof window !== 'undefined' ? window : this);
