/* =============================================================================
 * zopa.js, shared ZOPA (Zone of Possible Agreement) visualization for the Deal
 * artifact. Each commercial line is a COLLAPSIBLE row (native <details>): the
 * collapsed state shows only the line title + one horizontal ZOPA bar (the
 * track), with the key dollar values labelled directly ON the bar (supplier
 * ask, target, walk-away, plus opening / fallback / market where held), value
 * labels staggered above and below the track so close figures never collide.
 * Expanding the row reveals the Price / Opening / Market / Read detail rows,
 * where every material value still carries an evidenceChip. The total-deal
 * ZOPA / TCO band renders in the SAME bar style but stays always-visible (not
 * collapsed) at the bottom, followed by one shared legend.
 *
 * Palette (locked): ZOPA zone = teal; target/walk/fallback = plum family;
 * Theo opening = burnt-orange; supplier ask = plum, red ONLY when it sits above
 * walk-away; market benchmark = neutral-ink POINT tick. We hold POINT
 * benchmarks, never a market lo/hi band, so a single market tick is drawn and
 * NEVER a fabricated range; lines with no comp say so in the expanded detail.
 *
 * Extracted from _parts/tab-commercials.js (2026-07-23); redesigned to the
 * collapse-by-default / values-on-the-bar spec (2026-07-23). Public entry:
 *   window.DealZopa.render(d)  ->  HTML string, wrapped in <div class="zopa-viz">
 *
 * Called from the Economics tab (tab-commercials.js, 3A "ZOPA by Line Item")
 * and the Overview / Brief tab (tab-brief.js) via the same entry point.
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
 * Scoped to `.zopa-viz .X` so it applies wherever the ZOPA is mounted
 * (tab-agnostic). De-bubbled: each line is a hairline-separated row, not a
 * boxed card. Guarded + idempotent: safe to call render() from multiple tabs. */
var ZOPA_CSS =
  /* collapsible line row (hairline divider, no card box) */
  '.zopa-viz .zline{border-bottom:1px solid var(--line)}' +
  '.zopa-viz .zline:last-of-type{border-bottom:none}' +
  /* collapsed line = ONE row: fixed-width title column (~190px) beside the ZOPA bar
   * (was title-row-above-bar-row, doubling the vertical space each line took). Every
   * line shares the same title-column width, so every track starts at the same x --
   * the bars line up in a column without any extra alignment logic. */
  '.zopa-viz .zsum{list-style:none;cursor:pointer;display:flex;align-items:center;gap:14px;padding:9px 2px 4px}' +
  '.zopa-viz .zsum::-webkit-details-marker{display:none}' +
  '.zopa-viz .zsum::marker{content:""}' +
  '.zopa-viz .zsum-row{display:flex;align-items:flex-start;gap:8px;flex:0 0 190px;width:190px;min-width:0}' +
  '.zopa-viz .zchev{width:7px;height:7px;margin-top:5px;border-right:2px solid var(--mut2);border-bottom:2px solid var(--mut2);transform:rotate(-45deg);transition:transform .15s ease;flex:0 0 auto}' +
  '.zopa-viz .zline[open] .zchev{transform:rotate(45deg)}' +
  '.zopa-viz .zsum:hover .zlname{color:var(--plum)}' +
  '.zopa-viz .zlname{font-weight:700;font-size:var(--fz-sm);color:var(--ink);line-height:1.3;min-width:0}' +
  /* the ZOPA track, taller so on-bar value labels sit above + below it; now sits BESIDE
   * the fixed-width title column (was stacked below it) so each line compacts to one row */
  '.zopa-viz .ztrack{position:relative;height:82px;margin:0;flex:1 1 auto;min-width:0}' +
  '.zopa-viz .zaxis{position:absolute;top:50%;left:0;right:0;height:2px;transform:translateY(-50%);background:var(--line2);border-radius:2px}' +
  '.zopa-viz .zzopa{position:absolute;top:50%;transform:translateY(-50%);height:16px;background:var(--teal-t);border:1px solid var(--teal-d);border-radius:4px}' +
  '.zopa-viz .ztgt,.zopa-viz .zwalk{position:absolute;top:calc(50% - 11px);width:2px;height:22px;background:var(--plum)}' +
  '.zopa-viz .zwalk{opacity:.5}' +
  '.zopa-viz .zfb{position:absolute;top:calc(50% - 7px);height:14px;border-left:2px dotted var(--plum);opacity:.75}' +
  '.zopa-viz .zopen{position:absolute;top:calc(50% - 6px);width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--surface);border:2px solid var(--emph);box-sizing:border-box}' +
  '.zopa-viz .zask{position:absolute;top:calc(50% - 14px);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid var(--plum)}' +
  '.zopa-viz .zask.over{border-top-color:var(--danger)}' +
  '.zopa-viz .zbench{position:absolute;top:calc(50% - 12px);width:2px;height:24px;background:var(--ink2)}' +
  /* on-bar value labels, staggered up/down to avoid overlap when values are close */
  '.zopa-viz .zlab{position:absolute;display:flex;flex-direction:column;align-items:center;line-height:1.12;white-space:nowrap;text-align:center;transform:translateX(-50%);pointer-events:none}' +
  '.zopa-viz .zlab.zlab-l{align-items:flex-start;text-align:left;transform:translateX(0)}' +
  '.zopa-viz .zlab.zlab-r{align-items:flex-end;text-align:right;transform:translateX(-100%)}' +
  '.zopa-viz .zlab.up{bottom:calc(50% + 17px)}' +
  '.zopa-viz .zlab.dn{top:calc(50% + 17px)}' +
  '.zopa-viz .zltag{font-size:9.5px;letter-spacing:.03em;text-transform:uppercase;font-weight:700;color:var(--mut2)}' +
  '.zopa-viz .zlval{font-size:var(--fz-floor);font-weight:700;font-variant-numeric:tabular-nums;color:var(--ink)}' +
  '.zopa-viz .zlab.open .zltag{color:var(--emph)}' +
  '.zopa-viz .zlab.tgt .zltag{color:var(--teal-d)}' +
  '.zopa-viz .zlab.walk .zltag{color:var(--plum)}' +
  '.zopa-viz .zlab.fb .zltag{color:var(--plum)}' +
  '.zopa-viz .zlab.ask .zltag{color:var(--plum)}' +
  '.zopa-viz .zlab.bench .zltag{color:var(--ink2)}' +
  '.zopa-viz .zlab.ask.over .zltag,.zopa-viz .zlab.ask.over .zlval{color:var(--danger)}' +
  /* expanded per-line detail */
  '.zopa-viz .zline-detail{padding:0 2px 12px}' +
  '.zopa-viz .znobench{color:var(--mut2);font-style:italic}' +
  '.zopa-viz .zdetail{margin-top:2px;padding-top:9px;border-top:1px dashed var(--line2);display:grid;gap:5px}' +
  '.zopa-viz .zdrow{display:flex;gap:10px;font-size:var(--fz-sm);line-height:1.45}' +
  '.zopa-viz .zdk{flex:0 0 118px;color:var(--mut2);font-weight:700}' +
  '.zopa-viz .zdv{color:var(--ink2);flex:1;min-width:0}' +
  '.zopa-viz .zdv b{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}' +
  /* total-deal ZOPA / TCO aggregate (always visible, same bar style) */
  '.zopa-viz .ztotal{margin-top:16px;padding-top:14px;border-top:2px solid var(--plum)}' +
  '.zopa-viz .zthd{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:2px}' +
  '.zopa-viz .ztname{font-weight:800;font-size:var(--fz);color:var(--plum)}' +
  '.zopa-viz .ztsub{font-size:var(--fz-floor);color:var(--mut2)}' +
  /* one shared bottom legend */
  '.zopa-viz .zopalegend{display:flex;gap:16px;flex-wrap:wrap;font-size:var(--fz-floor);color:var(--mut2);margin-top:14px;padding-top:11px;border-top:1px solid var(--line)}' +
  '.zopa-viz .zopalegend span{display:inline-flex;align-items:center}' +
  '.zopa-viz .zopalegend i{display:inline-block;margin-right:6px;vertical-align:middle}' +
  '.zopa-viz .zhint{margin-left:auto;font-style:italic}' +
  '.zopa-viz .zlg.zopa{width:16px;height:10px;background:var(--teal-t);border:1px solid var(--teal-d);border-radius:2px}' +
  '.zopa-viz .zlg.tgt{width:2px;height:14px;background:var(--plum)}' +
  '.zopa-viz .zlg.walk{width:2px;height:14px;background:var(--plum);opacity:.5}' +
  '.zopa-viz .zlg.fb{width:0;height:14px;border-left:2px dotted var(--plum);opacity:.75}' +
  '.zopa-viz .zlg.open{width:12px;height:12px;background:var(--surface);border:2px solid var(--emph);border-radius:50%;box-sizing:border-box}' +
  '.zopa-viz .zlg.ask{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid var(--plum)}' +
  '.zopa-viz .zlg.bench{width:2px;height:14px;background:var(--ink2)}' +
  /* narrow viewports: fall back to title-above-bar (title column no longer fits beside a
   * usable bar width) so the on-bar labels stay legible instead of being crushed together */
  '@media(max-width:640px){.zopa-viz .zsum{flex-wrap:wrap}.zopa-viz .zsum-row{flex:0 0 100%;width:auto}.zopa-viz .ztrack{flex:1 1 100%;width:100%}}';

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

/* ---------- 2. shared ZOPA bar (marks + on-bar value labels) ---------------
 * ONE builder used by BOTH the per-line track and the total-deal / TCO band so
 * they read byte-identical. cfg = { open, target, fallback, walk, ask, over,
 * bench }. fallback / bench may be null (no mark, no label drawn). Value labels
 * are sorted left-to-right and alternated up/down so the two closest figures
 * always land on opposite lanes; near an edge a label left/right-aligns so it
 * never overflows the track. */
function zopaBar(cfg) {
  const open = cfg.open, target = cfg.target, walk = cfg.walk, ask = cfg.ask;
  const fallback = cfg.fallback, bench = cfg.bench, over = cfg.over;
  const vals = [open, target, walk, ask];
  if (fallback != null) vals.push(fallback);
  if (bench != null) vals.push(bench);
  let min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  const pad = (max - min) * 0.10 || 1; min -= pad; max += pad;
  const span = (max - min) || 1;
  const pos = v => clampp((v - min) / span * 100, 0, 100);

  const marks = '<div class="zaxis"></div>' +
    '<div class="zzopa" style="left:' + pos(target).toFixed(1) + '%;width:' + Math.max(pos(walk) - pos(target), 0).toFixed(1) + '%" title="ZOPA ' + M(target) + ' to ' + M(walk) + '"></div>' +
    '<div class="ztgt" style="left:' + pos(target).toFixed(1) + '%" title="Target ' + M(target) + '"></div>' +
    '<div class="zwalk" style="left:' + pos(walk).toFixed(1) + '%" title="Walk-away ' + M(walk) + '"></div>' +
    (fallback != null ? '<div class="zfb" style="left:' + pos(fallback).toFixed(1) + '%" title="Fallback ' + M(fallback) + '"></div>' : '') +
    '<div class="zopen" style="left:' + pos(open).toFixed(1) + '%" title="Theo opening ' + M(open) + '"></div>' +
    '<div class="zask ' + (over ? 'over' : 'ok') + '" style="left:calc(' + pos(ask).toFixed(1) + '% - 5px)" title="Supplier ask ' + M(ask) + '"></div>' +
    (bench != null ? '<div class="zbench" style="left:' + pos(bench).toFixed(1) + '%" title="Market ' + M(bench) + '"></div>' : '');

  const pts = [
    { v: open,     cls: 'open', tag: 'Open' },
    { v: target,   cls: 'tgt',  tag: 'Target' },
    { v: fallback, cls: 'fb',   tag: 'Fallback' },
    { v: walk,     cls: 'walk', tag: 'Walk' },
    { v: ask,      cls: 'ask' + (over ? ' over' : ''), tag: 'Ask' },
    { v: bench,    cls: 'bench', tag: 'Market' }
  ].filter(p => p.v != null).sort((a, b) => a.v - b.v);

  const labels = pts.map((p, i) => {
    const pp = pos(p.v);
    const lane = (i % 2 === 0) ? 'up' : 'dn';
    const align = pp <= 10 ? ' zlab-l' : (pp >= 90 ? ' zlab-r' : '');
    return '<span class="zlab ' + p.cls + ' ' + lane + align + '" style="left:' + pp.toFixed(1) + '%">' +
      '<span class="zltag">' + esc(p.tag) + '</span><span class="zlval">' + M(p.v) + '</span></span>';
  }).join('');

  return '<div class="ztrack">' + marks + labels + '</div>';
}

/* ---------- 3. per-line ZOPA row (collapsible) ------------------------------ */
function zopaLineHTML(d, l) {
  const ask = l.supplierAmount, target = l.target, walk = l.maximumAcceptable, fallback = l.fallback;
  // Theo opening: anchor aggressively but credibly BELOW target so there is room to settle
  // up; = target-(walk-target), floored at 15% under target since we hold no market low.
  const open = Math.round(Math.max(target * 0.85, 2 * target - walk));
  const over = ask > walk;                  // supplier ask above our walk-away -> the ONLY red trigger
  const bench = zopaBenchForLine(d, l);
  const gap = Math.round((1 - open / target) * 100);
  const track = zopaBar({ open: open, target: target, fallback: fallback, walk: walk, ask: ask, over: over, bench: bench ? bench.value : null });
  const mktRow = bench
    ? '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><b>' + M(bench.value) + '</b> - ' + esc(bench.note) + '. ' + esc(bench.raw) + ' · ' + esc(bench.comparability) + ' comparability ' + evidenceChip(bench.evidenceType, { sources: [bench.benchId] }) + '</span></div>'
    : '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><span class="znobench">No market benchmark for this line in session</span> - no external comparison was available, so no market mark is drawn (no lo/hi band fabricated). ' + evidenceChip('unavailable') + '</span></div>';
  const detail = '<div class="zline-detail"><div class="zdetail">' +
    '<div class="zdrow"><span class="zdk">Price</span><span class="zdv">supplier ask <b>' + M(ask) + '</b> vs target ' + M(target) + ' · fallback ' + M(fallback) + ' · walk-away ' + M(walk) + ' ' + evidenceChip(l.evidenceType, { sources: l.sourceIds }) + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Theo opening</span><span class="zdv">open at <b>' + M(open) + '</b>, about ' + gap + '% below target, leaving room to settle at ' + M(target) + ' ' + evidenceChip('inference') + '</span></div>' +
    mktRow +
    '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + (over
        ? 'Ask sits <b>' + M(ask - walk) + '</b> above the ' + M(walk) + ' walk-away; hold to the ' + M(target) + ' target. ' + jumpLink('ISS-12 →', 'tab:contract/sub:legal')
        : 'Ask is within the ' + M(target) + ' to ' + M(walk) + ' zone; settle toward the ' + M(target) + ' target.') + '</span></div>' +
  '</div></div>';
  return '<details class="zline"><summary class="zsum">' +
    '<div class="zsum-row"><span class="zchev" aria-hidden="true"></span><span class="zlname">' + esc(l.item) + '</span></div>' +
    track + '</summary>' + detail + '</details>';
}

/* ---------- 4. total-deal ZOPA / TCO band (always visible) ------------------
 * Whole-deal ask/target/walk totals from the 3-yr scenarios (SC-ask /
 * SC-target / SC-max), fallback from SC-fallback; opening derived the same
 * way as the per-line opening. No deal-level market benchmark exists in
 * session -> honest gap-state in the detail (no market tick on the bar). */
function zopaTotalHTML(d, opts) {
  const sc = id => ((d.scenarios || []).find(s => s.id === id) || {});
  const askS = sc('SC-ask'), tgtS = sc('SC-target'), fbS = sc('SC-fallback'), maxS = sc('SC-max');
  const askTot = askS.total || 0, tgtTot = tgtS.total || 0, walkTot = maxS.total || 0, fbTot = fbS.total || 0;
  const openTot = Math.round(Math.max(tgtTot * 0.85, 2 * tgtTot - walkTot));
  const over = askTot > walkTot, apart = Math.abs(askTot - tgtTot);
  const gap = Math.round((1 - openTot / tgtTot) * 100);
  const emp = assumVal(d, 'ASM-1', 18000), years = assumVal(d, 'ASM-2', 3);
  const read = 'Supplier ask ' + M(askTot) + ' sits ' + (over ? 'above' : 'within') + ' the ' + M(walkTot) +
    ' walk-away; the ' + M(tgtTot) + ' target anchors the deal (about ' + M(apart) + ' below ask). The platform subscription is the biggest lever.';
  const track = zopaBar({ open: openTot, target: tgtTot, fallback: fbTot || null, walk: walkTot, ask: askTot, over: over, bench: null });
  // Overview passes { slim:true }: the headline KPI cards already carry ask/target/walk, so the
  // panel keeps only the synthesized READ line (the analysis) and pushes Opening + Market-benchmark
  // down to Economics, where the full read-out lives. Economics renders every row.
  const rowAsk = '<div class="zdrow"><span class="zdk">Ask vs target</span><span class="zdv">supplier ask <b>' + M(askTot) + '</b> vs target ' + M(tgtTot) + ' (' + M(apart) + ' apart over the ' + years + '-yr term) ' + evidenceChip('calculated') + '</span></div>';
  const rowOpen = '<div class="zdrow"><span class="zdk">Opening</span><span class="zdv">aggregate opening <b>' + M(openTot) + '</b>, about ' + gap + '% below target, the room to negotiate up to ' + M(tgtTot) + ' ' + evidenceChip('inference') + '</span></div>';
  const rowWalk = '<div class="zdrow"><span class="zdk">Walk-away</span><span class="zdv"><b>' + M(walkTot) + '</b> max-acceptable (3-yr) · fallback ' + M(fbTot) + '. Budget ceiling unconfirmed ' + jumpLink('GAP-3 →', 'tab:brief') + ' ' + evidenceChip(maxS.evidenceType || 'assumption') + '</span></div>';
  const rowBench = '<div class="zdrow"><span class="zdk">Market benchmark</span><span class="zdv"><span class="znobench">No deal-level market benchmark in session</span> - the only comps are the two per-line precedents above (platform $/employee, implementation day-rate); no whole-deal TCV comparison is fabricated. ' + evidenceChip('unavailable') + '</span></div>';
  const rowRead = '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + read + '</span></div>';
  const rows = (opts && opts.slim) ? [rowRead] : [rowAsk, rowOpen, rowWalk, rowBench, rowRead];
  const detail = '<div class="zline-detail"><div class="zdetail">' + rows.join('') + '</div></div>';
  return '<div class="ztotal"><div class="zthd"><span class="ztname">Total-deal ZOPA · TCV</span>' +
    '<span class="ztsub">' + emp.toLocaleString('en-US') + ' employees · ' + years + '-yr term · target to walk-away for the whole deal</span></div>' +
    track + detail + '</div>';
}

const ZOPA_BOTTOM_LEGEND = '<div class="zopalegend">' +
  '<span><i class="zlg zopa"></i>ZOPA (target to walk-away)</span>' +
  '<span><i class="zlg tgt"></i>target</span>' +
  '<span><i class="zlg walk"></i>walk-away</span>' +
  '<span><i class="zlg fb"></i>fallback</span>' +
  '<span><i class="zlg open"></i>Theo opening</span>' +
  '<span><i class="zlg ask"></i>supplier ask (red = above walk-away)</span>' +
  '<span><i class="zlg bench"></i>market benchmark (point)</span>' +
  '<span class="zhint">Click a line for detail</span>' +
'</div>';

function renderZopaGantt(d) {
  const lines = d.commercialLines || [];
  if (!lines.length) return gapCard('No commercial lines in session', 'No line items to build a ZOPA from.');
  return lines.map(l => zopaLineHTML(d, l)).join('') + zopaTotalHTML(d) + ZOPA_BOTTOM_LEGEND;
}

/* ---------- 5. public entry ------------------------------------------------- */
function render(d) {
  injectCss();
  return '<div class="zopa-viz">' + renderZopaGantt(d) + '</div>';
}

// Total-deal / TCO band ONLY (no per-line tracks). Used by the Overview commercial
// panel so the full line-item ZOPA lives exclusively in Economics (no duplication).
function renderTotal(d) {
  injectCss();
  return '<div class="zopa-viz zopa-total-only">' + zopaTotalHTML(d, { slim: true }) + ZOPA_BOTTOM_LEGEND + '</div>';
}

global.DealZopa = { render: render, renderTotal: renderTotal };

})(typeof window !== 'undefined' ? window : this);
