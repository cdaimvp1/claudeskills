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
  /* line name + per-line leverage badge stacked in the title column */
  '.zopa-viz .zsum-txt{display:flex;flex-direction:column;gap:3px;min-width:0}' +
  '.zopa-viz .zlev{display:inline-flex;align-items:center;gap:5px;font:700 8.5px/1 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--mut2)}' +
  '.zopa-viz .zlev-bar{display:inline-flex;gap:2px}' +
  '.zopa-viz .zlev-bar i{width:8px;height:5px;border-radius:1px;background:var(--line2)}' +
  '.zopa-viz .zlev-high .zlev-bar i{background:var(--emph)}' +
  '.zopa-viz .zlev-med .zlev-bar i:nth-child(-n+2){background:var(--emph)}' +
  '.zopa-viz .zlev-low .zlev-bar i:nth-child(1){background:var(--emph)}' +
  '.zopa-viz .zlev-high .zlev-t,.zopa-viz .zlev-med .zlev-t{color:var(--emph-tx)}' +
  /* sensitivity strip (Economics deal tab) */
  '.zopa-viz .zopa-sens{border:1px solid var(--line2);border-radius:9px;padding:12px 14px;margin-bottom:14px;background:var(--surface2)}' +
  '.zopa-viz .zopa-sens-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}' +
  '.zopa-viz .zss-t{font:700 10px/1.3 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--mut)}' +
  '.zopa-viz .zss-reset{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:1px solid var(--line2);border-radius:6px;background:var(--surface);color:var(--mut);cursor:pointer;flex:0 0 auto}' +
  '.zopa-viz .zss-reset:hover{color:var(--plum);border-color:var(--plum)}' +
  '.zopa-viz .zss-reset svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}' +
  '.zopa-viz .zopa-sens-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 20px}' +
  '.zopa-viz .zopa-sens-live{margin-top:11px;padding-top:10px;border-top:1px dashed var(--line2);font-size:12.5px;line-height:1.5;color:var(--ink2)}' +
  '.zopa-viz .zopa-sens-live b{color:var(--ink);font-variant-numeric:tabular-nums}' +
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
  /* per-line ZOPA collapsed section (total-deal band sits above it, always visible) */
  '.zopa-viz .zlines{border-top:1px solid var(--line);margin-top:10px}' +
  '.zopa-viz .zlines>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:9px;padding:11px 2px;font:800 10.5px/1.2 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--plum)}' +
  '.zopa-viz .zlines>summary::-webkit-details-marker{display:none}' +
  '.zopa-viz .zlines>summary::marker{content:""}' +
  '.zopa-viz .zlines>summary:hover{color:var(--sec)}' +
  '.zopa-viz .zchev2{width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg);transition:transform .15s ease;flex:0 0 auto}' +
  '.zopa-viz .zlines[open]>summary .zchev2{transform:rotate(45deg)}' +
  /* total-deal ZOPA / TCV aggregate (always visible; now the TOP element of the deal card) */
  '.zopa-viz .ztotal{margin-top:16px;padding-top:14px;border-top:2px solid var(--plum)}' +
  '.zopa-viz .ztotal:first-child{margin-top:0;padding-top:2px;border-top:none}' +
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
    const emp = assumVal(d, 'ASM-1', l.quantity || 18000);   // live: tracks the employee-count driver
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

/* ---------- 1b. live-driver line values + per-line leverage ------------------
 * zopaLiveLine: the platform subscription (CL-1) responds to the two sensitivity
 * drivers, employee count (ASM-1) and platform discount (ASM-4). At the plan
 * baseline it returns the canonical figures byte-for-byte (so the default ZOPA is
 * unchanged); off-plan it scales ask by the per-employee rate and re-derives target
 * from the live discount, with walk/fallback held proportional. All other lines are
 * fixed. Grounded: rate + baseline are read FROM the data, nothing fabricated. */
function zopaLiveLine(d, l) {
  const base = { ask: l.supplierAmount, target: l.target, walk: l.maximumAcceptable, fallback: l.fallback };
  if (l.id !== 'CL-1') return base;
  const empBase = l.quantity || 18000;
  const discBase = l.supplierAmount ? Math.round((1 - l.target / l.supplierAmount) * 100) : 18;
  const emp = assumVal(d, 'ASM-1', empBase), disc = assumVal(d, 'ASM-4', discBase);
  if (emp === empBase && disc === discBase) return base;   // exact canonical at plan
  const rate = (l.supplierAmount || 0) / empBase;
  const ask = Math.round(rate * emp);
  const target = Math.round(ask * (1 - disc / 100));
  const askRatio = l.supplierAmount ? ask / l.supplierAmount : 1;
  return { ask: ask, target: target, walk: Math.round(l.maximumAcceptable * askRatio), fallback: Math.round(l.fallback * askRatio) };
}
// leverage = this line's share of the total negotiable room (ask - target) across all lines:
// where the negotiating effort pays off most. Computed from the plan figures (stable ranking).
function zopaLeverage(d, l) {
  const lines = d.commercialLines || [];
  const room = x => Math.max((x.supplierAmount || 0) - (x.target || 0), 0);
  const total = lines.reduce((s, x) => s + room(x), 0) || 1;
  const pct = Math.round(room(l) / total * 100);
  return { pct: pct, total: total, band: pct >= 30 ? 'high' : (pct >= 10 ? 'med' : 'low') };
}
function zopaLeverageBadge(lev) {
  const label = lev.band === 'high' ? 'High' : (lev.band === 'med' ? 'Med' : 'Low');
  return '<span class="zlev zlev-' + lev.band + '" title="Share of the total negotiable room across all lines: ' + lev.pct + '%">' +
    '<span class="zlev-bar"><i></i><i></i><i></i></span><span class="zlev-t">' + label + ' leverage</span></span>';
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
  const live = zopaLiveLine(d, l);          // CL-1 responds to the sensitivity drivers; others static
  const ask = live.ask, target = live.target, walk = live.walk, fallback = live.fallback;
  // Theo opening: anchor aggressively but credibly BELOW target so there is room to settle
  // up; = target-(walk-target), floored at 15% under target since we hold no market low.
  const open = Math.round(Math.max(target * 0.85, 2 * target - walk));
  const over = ask > walk;                  // supplier ask above our walk-away -> the ONLY red trigger
  const bench = zopaBenchForLine(d, l);
  const lev = zopaLeverage(d, l);
  const gap = Math.round((1 - open / target) * 100);
  const track = zopaBar({ open: open, target: target, fallback: fallback, walk: walk, ask: ask, over: over, bench: bench ? bench.value : null });
  const mktRow = bench
    ? '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><b>' + M(bench.value) + '</b> - ' + esc(bench.note) + '. ' + esc(bench.raw) + ' · ' + esc(bench.comparability) + ' comparability ' + evidenceChip(bench.evidenceType, { sources: [bench.benchId] }) + '</span></div>'
    : '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><span class="znobench">No market benchmark for this line in session</span> - no external comparison was available, so no market mark is drawn (no lo/hi band fabricated). ' + evidenceChip('unavailable') + '</span></div>';
  const levRow = '<div class="zdrow"><span class="zdk">Leverage</span><span class="zdv">this line is <b>' + lev.pct + '%</b> of the total negotiable room (' + M(lev.total) + ' across all lines); ' +
    (lev.band === 'high' ? 'the biggest lever, push hardest here.' : lev.band === 'med' ? 'a moderate lever.' : 'a minor lever.') + ' ' + evidenceChip('calculated', { short: true }) + '</span></div>';
  const detail = '<div class="zline-detail"><div class="zdetail">' +
    '<div class="zdrow"><span class="zdk">Price</span><span class="zdv">supplier ask <b>' + M(ask) + '</b> vs target ' + M(target) + ' · fallback ' + M(fallback) + ' · walk-away ' + M(walk) + ' ' + evidenceChip(l.evidenceType, { sources: l.sourceIds }) + '</span></div>' +
    '<div class="zdrow"><span class="zdk">Theo opening</span><span class="zdv">open at <b>' + M(open) + '</b>, about ' + gap + '% below target, leaving room to settle at ' + M(target) + ' ' + evidenceChip('inference') + '</span></div>' +
    mktRow + levRow +
    '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + (over
        ? 'Ask sits <b>' + M(ask - walk) + '</b> above the ' + M(walk) + ' walk-away; hold to the ' + M(target) + ' target. ' + jumpLink('ISS-12 →', 'tab:contract/sub:legal')
        : 'Ask is within the ' + M(target) + ' to ' + M(walk) + ' zone; settle toward the ' + M(target) + ' target.') + '</span></div>' +
  '</div></div>';
  return '<details class="zline" data-zkey="' + esc(l.id) + '"><summary class="zsum">' +
    '<div class="zsum-row"><span class="zchev" aria-hidden="true"></span>' +
      '<span class="zsum-txt"><span class="zlname">' + esc(l.item) + '</span>' + zopaLeverageBadge(lev) + '</span></div>' +
    track + '</summary>' + detail + '</details>';
}

/* ---------- 4. total-deal ZOPA / TCV band ----------------------------------
 * LIVE whole-deal ask/target/walk/fallback totals via zopaDealTotals: each is the
 * canonical scenario total PLUS the delta from the live platform line (CL-1), scaled
 * over the term. The delta is 0 at plan, so the band reconciles EXACTLY to the
 * scenarios; off-plan it moves with the sensitivity drivers. No deal-level market
 * benchmark exists in session -> honest gap-state (no market tick on the bar). */
function zopaDealTotals(d) {
  const sc = id => ((d.scenarios || []).find(s => s.id === id) || {});
  const askS = sc('SC-ask'), tgtS = sc('SC-target'), fbS = sc('SC-fallback'), maxS = sc('SC-max');
  const cl1 = (d.commercialLines || []).find(l => l.id === 'CL-1');
  const years = assumVal(d, 'ASM-2', 3), uplift = assumVal(d, 'ASM-3', 4) / 100;
  let mult = 0; for (let i = 0; i < years; i++) mult += Math.pow(1 + uplift, i);   // CL-1 recurring term multiplier
  let dAsk = 0, dTgt = 0, dMax = 0, dFb = 0;
  if (cl1) {
    const lv = zopaLiveLine(d, cl1);
    dAsk = lv.ask - (cl1.supplierAmount || 0); dTgt = lv.target - (cl1.target || 0);
    dMax = lv.walk - (cl1.maximumAcceptable || 0); dFb = lv.fallback - (cl1.fallback || 0);
  }
  return {
    askY1: (askS.y1Total || 0) + dAsk, tgtY1: (tgtS.y1Total || 0) + dTgt, maxY1: (maxS.y1Total || 0) + dMax,
    askT: (askS.total || 0) + mult * dAsk, tgtT: (tgtS.total || 0) + mult * dTgt,
    maxT: (maxS.total || 0) + mult * dMax, fbT: (fbS.total || 0) + mult * dFb,
    maxEv: maxS.evidenceType || 'assumption', offPlan: !!(dAsk || dTgt || dMax || dFb)
  };
}
function zopaTotalHTML(d, opts) {
  const t = zopaDealTotals(d);
  const askTot = Math.round(t.askT), tgtTot = Math.round(t.tgtT), walkTot = Math.round(t.maxT), fbTot = Math.round(t.fbT);
  const openTot = Math.round(Math.max(tgtTot * 0.85, 2 * tgtTot - walkTot));
  const over = askTot > walkTot, apart = Math.abs(askTot - tgtTot);
  const gap = Math.round((1 - openTot / tgtTot) * 100);
  const emp = assumVal(d, 'ASM-1', 18000), years = assumVal(d, 'ASM-2', 3);
  const read = 'Supplier ask ' + M(askTot) + ' sits ' + (over ? 'above' : 'within') + ' the ' + M(walkTot) +
    ' walk-away; the ' + M(tgtTot) + ' target anchors the deal (about ' + M(apart) + ' below ask). The platform subscription is the biggest lever.';
  const track = zopaBar({ open: openTot, target: tgtTot, fallback: fbTot || null, walk: walkTot, ask: askTot, over: over, bench: null });
  // Overview passes { slim:true }: the headline KPI cards already carry ask/target/walk, so the
  // panel keeps only the synthesized READ line (the analysis). Economics renders every row.
  const rowAsk = '<div class="zdrow"><span class="zdk">Ask vs target</span><span class="zdv">supplier ask <b>' + M(askTot) + '</b> vs target ' + M(tgtTot) + ' (' + M(apart) + ' apart over the ' + years + '-yr term) ' + evidenceChip('calculated') + '</span></div>';
  const rowOpen = '<div class="zdrow"><span class="zdk">Opening</span><span class="zdv">aggregate opening <b>' + M(openTot) + '</b>, about ' + gap + '% below target, the room to negotiate up to ' + M(tgtTot) + ' ' + evidenceChip('inference') + '</span></div>';
  const rowWalk = '<div class="zdrow"><span class="zdk">Walk-away</span><span class="zdv"><b>' + M(walkTot) + '</b> max-acceptable (' + years + '-yr) · fallback ' + M(fbTot) + '. Budget ceiling unconfirmed ' + jumpLink('GAP-3 →', 'tab:brief') + ' ' + evidenceChip(t.maxEv) + '</span></div>';
  const rowBench = '<div class="zdrow"><span class="zdk">Market benchmark</span><span class="zdv"><span class="znobench">No deal-level market benchmark in session</span> - the only comps are the two per-line precedents (platform $/employee, implementation day-rate); no whole-deal TCV comparison is fabricated. ' + evidenceChip('unavailable') + '</span></div>';
  const rowRead = '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">' + read + '</span></div>';
  const rows = (opts && opts.slim) ? [rowRead] : [rowAsk, rowOpen, rowWalk, rowBench, rowRead];
  const detail = '<div class="zline-detail"><div class="zdetail">' + rows.join('') + '</div></div>';
  return '<div class="ztotal"><div class="zthd"><span class="ztname">Total-deal ZOPA · TCV</span>' +
    '<span class="ztsub">' + emp.toLocaleString('en-US') + ' employees · ' + years + '-yr term · target to walk-away for the whole deal</span></div>' +
    track + detail + '</div>';
}
// live Year-1 / term totals strip (the same delta-based totals as the band)
function zopaDealTotalsStrip(d) {
  const t = zopaDealTotals(d), years = assumVal(d, 'ASM-2', 3);
  const col = (lbl, val) => '<div class="dt-col"><div class="k-lbl">' + lbl + '</div><div class="dt-vals">' + val + '</div></div>';
  const over = t.askT > t.maxT;
  return '<div class="deal-totals">' +
    col('Year-1 all-in', 'Ask <b>' + M(t.askY1) + '</b> · Target <b>' + M(t.tgtY1) + '</b> · Max <b>' + M(t.maxY1) + '</b>') +
    col(years + '-yr TCV (initial term)', 'Ask <b>' + M(t.askT) + '</b> · Target <b>' + M(t.tgtT) + '</b> · Max <b>' + M(t.maxT) + '</b>') +
    col('Total-deal ZOPA', '<b>' + M(t.tgtT) + ' ↔ ' + M(t.maxT) + '</b> ' + evidenceChip('calculated', { short: true })) +
  '</div>' +
  insight('The supplier ask (' + M(t.askT) + ' over the term) sits <strong>' + (over ? 'above' : 'within') + '</strong> the walk-away max (' + M(t.maxT) +
    '); any settlement inside ' + M(t.tgtT) + '–' + M(t.maxT) + ' is within the zone, with <strong>' + M(t.tgtT) + '</strong> the defensible target.' +
    (t.offPlan ? ' Live at the current sensitivity drivers.' : ' At plan; totals reconcile to the scenario figures.'));
}

const ZOPA_BOTTOM_LEGEND = '<div class="zopalegend">' +
  '<span><i class="zlg zopa"></i>ZOPA (target to walk-away)</span>' +
  '<span><i class="zlg tgt"></i>target</span>' +
  '<span><i class="zlg walk"></i>walk-away</span>' +
  '<span><i class="zlg fb"></i>fallback</span>' +
  '<span><i class="zlg open"></i>Theo opening</span>' +
  '<span><i class="zlg ask"></i>supplier ask (flagged when above walk-away)</span>' +
  '<span><i class="zlg bench"></i>market benchmark (point)</span>' +
  '<span class="zhint">Click a line for detail</span>' +
'</div>';

// Deal-tab composition: the total-deal ZOPA + live totals strip are ALWAYS visible; the per-line
// ZOPAs live in a collapsed section (each row still expands to its own detail). Progressive
// disclosure: total -> per-line -> per-line detail. The legend stays visible below.
function renderZopaGantt(d) {
  const lines = d.commercialLines || [];
  if (!lines.length) return gapCard('No commercial lines in session', 'No line items to build a ZOPA from.');
  const perLine = lines.map(l => zopaLineHTML(d, l)).join('');
  const linesSection = '<details class="zlines" data-zkey="lines"><summary>' +
    '<span class="zchev2" aria-hidden="true"></span>Per-line ZOPA · ' + lines.length + ' lines · leverage · benchmark ticks · click to expand</summary>' +
    '<div class="zlines-body">' + perLine + '</div></details>';
  return zopaTotalHTML(d) + zopaDealTotalsStrip(d) + linesSection + ZOPA_BOTTOM_LEGEND;
}

/* ---------- 4b. sensitivity strip (Economics deal tab) ----------------------
 * Two drivers, employee count (ASM-1) and platform discount (ASM-4), live-update
 * the platform line's ZOPA + a plain-language readout via the shared assumptionSlider
 * and the DealUI recalc bus. renderSensitiveZopa (registered below) repaints on change. */
function discBaseOf(l) { return l.supplierAmount ? Math.round((1 - l.target / l.supplierAmount) * 100) : 18; }
function zopaSensReadout(d) {
  const l = (d.commercialLines || []).find(x => x.id === 'CL-1');
  if (!l) return '';
  const empBase = l.quantity || 18000;
  const emp = assumVal(d, 'ASM-1', empBase), disc = assumVal(d, 'ASM-4', discBaseOf(l)), years = assumVal(d, 'ASM-2', 3);
  const live = zopaLiveLine(d, l);
  const rate = Math.round((l.supplierAmount || 0) / empBase);
  const dY1 = live.target - l.target;
  const planTerm = l.target * years, liveTerm = live.target * years, dTerm = liveTerm - planTerm;
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + M(Math.abs(n));
  const offPlan = emp !== empBase || disc !== discBaseOf(l);
  return 'At <b>' + emp.toLocaleString('en-US') + '</b> employees and <b>' + disc + '%</b> platform discount, the platform line targets <b>' + M(live.target) +
    '</b>/yr (' + M(rate) + '/emp ask basis). Over the ' + years + '-yr term that is <b>' + M(liveTerm) + '</b> at target' +
    (offPlan ? ', ' + sign(dTerm) + ' vs the ' + M(planTerm) + ' plan (' + sign(dY1) + '/yr).' : ' (the plan baseline).');
}
function zopaSensitivity(d) {
  const a1 = (d.assumptions || []).find(x => x.id === 'ASM-1');
  const a4 = (d.assumptions || []).find(x => x.id === 'ASM-4');
  if (!a1 && !a4) return '';
  injectCss();   // the strip renders OUTSIDE the bars container, so wrap it in .zopa-viz too
  return '<div class="zopa-viz"><div class="zopa-sens">' +
    '<div class="zopa-sens-hd"><span class="zss-t">Sensitivity · move a driver to see the ZOPA respond</span>' +
      '<button class="zss-reset" data-reset-assumptions title="Reset drivers to plan" aria-label="Reset drivers to plan">' + icon('reset') + '</button></div>' +
    '<div class="zopa-sens-grid">' + (a1 ? assumptionSlider(a1) : '') + (a4 ? assumptionSlider(a4) : '') + '</div>' +
    '<div id="zopa-sens-live" class="zopa-sens-live">' + zopaSensReadout(d) + '</div>' +
  '</div></div>';
}
// repaint the live ZOPA ONLY when a model driver that feeds it actually moved (employee count,
// platform discount, term, in-term uplift), so an unrelated recalc (e.g. the WACC slider) never
// re-renders it. Open/closed state of every <details data-zkey> is preserved across the repaint.
var _zopaDriverSig = null;
function renderSensitiveZopa() {
  const d = global.dashboardData; if (!d) return;
  const sig = [assumVal(d, 'ASM-1', 0), assumVal(d, 'ASM-4', 0), assumVal(d, 'ASM-2', 0), assumVal(d, 'ASM-3', 0)].join('|');
  if (sig === _zopaDriverSig) return;
  _zopaDriverSig = sig;
  const bars = document.getElementById('cml-zopa-live');
  if (bars) {
    const open = [].slice.call(bars.querySelectorAll('details[data-zkey][open]')).map(x => x.getAttribute('data-zkey'));
    bars.innerHTML = render(d);
    open.forEach(k => { const el = bars.querySelector('details[data-zkey="' + k + '"]'); if (el) el.open = true; });
  }
  const out = document.getElementById('zopa-sens-live');
  if (out) out.innerHTML = zopaSensReadout(d);
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

global.DealZopa = { render: render, renderTotal: renderTotal, sensitivity: zopaSensitivity };

// repaint the live ZOPA whenever a driver (or any assumption) changes, via the shared recalc bus
if (typeof global.DealUI !== 'undefined' && typeof global.DealUI.onRecalc === 'function') {
  global.DealUI.onRecalc(renderSensitiveZopa);
}

})(typeof window !== 'undefined' ? window : this);
