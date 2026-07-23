/* material-events timeline with INFERRED type classification + client-side filter.
   Replaces the plain pvDD2EventTimeline on the Risk & Resilience deep-dive tab.
   Type is inferred from title+detail keywords (Security/Cyber, Legal, Financial,
   Supply-chain, else Operational) — never a manual tag. Severity/directness chip
   colour reads blast radius (service > division > else), independent of type. */
function pvDD2TypedEvents(events) {
  if (!events || !events.length) {
    return '<div style="font-size:12px;color:var(--mut2)">No material events on file.</div>';
  }
  var TYPES = [
    {key: 'security',    label: 'Security &amp; Cyber', rx: /breach|credential|cyber|security|incident/i},
    {key: 'legal',       label: 'Legal',                 rx: /litigation|class action|lawsuit|judgment|enforcement/i},
    {key: 'financial',   label: 'Financial',             rx: /revenue|earnings|guidance|distress|funding/i},
    {key: 'supply',      label: 'Supply Chain',          rx: /supplier|outage|dependency|partnership/i},
    {key: 'operational', label: 'Operational',           rx: null}
  ];
  function typeOf(ev) {
    var s = String((ev && ev.title) || '') + ' ' + String((ev && ev.detail) || '');
    for (var i = 0; i < TYPES.length; i++) { if (TYPES[i].rx && TYPES[i].rx.test(s)) return TYPES[i]; }
    return TYPES[TYPES.length - 1];
  }
  function dirColor(d) {
    d = String(d || '');
    return /service/i.test(d) ? 'var(--emph,#C15E19)' : /division/i.test(d) ? '#8A5A00' : 'var(--mut2,#6a655f)';
  }
  var rootId = 'dd2te' + Math.random().toString(36).slice(2, 9);
  var tagged = events.map(function (ev) { return {ev: ev, t: typeOf(ev)}; });
  var counts = {};
  tagged.forEach(function (rw) { counts[rw.t.key] = (counts[rw.t.key] || 0) + 1; });
  var present = TYPES.filter(function (t) { return counts[t.key]; });

  var btnStyle = function (on) {
    return 'display:inline-flex;align-items:center;gap:5px;font:700 9.5px var(--mono,monospace);'
      + 'letter-spacing:.04em;text-transform:uppercase;padding:4px 11px;border-radius:20px;cursor:pointer;'
      + 'background:' + (on ? 'var(--teal-t,#DCEBE9)' : 'transparent') + ';'
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
      +   '<span style="font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:var(--mut);background:var(--nested,#f1efec);border:1px solid var(--line);border-radius:20px;padding:1px 8px">' + t.label + '</span>'
      +   '<span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:' + dc + ';border:1px solid ' + dc + ';border-radius:20px;padding:1px 7px">' + pvAEsc(ev.directness || 'unknown') + '</span>'
      + '</div>'
      + (ev.detail ? '<div style="font-size:11.5px;color:var(--mut);line-height:1.5;margin-top:3px">' + pvAEsc(ev.detail) + '</div>' : '')
      + (ev.resolution ? '<div style="font-size:11px;color:var(--mut2);margin-top:2px"><b>Resolution &middot;</b> ' + pvAEsc(ev.resolution) + '</div>' : '')
      + '</div>';
  }).join('');

  var timeline = '<div id="' + rootId + '" style="position:relative;padding-left:6px">'
    + '<div style="position:absolute;left:4px;top:5px;bottom:5px;width:2px;background:var(--line)"></div>'
    + rows + '</div>';

  var foot = '<div class="footbound" style="margin-top:9px">Type inferred from event language, not a manual tag &mdash; filter to isolate one exposure class. '
    + 'Chip colour reads blast radius: burnt orange = service-wide, amber = division-level, grey = contained/unspecified.</div>';

  return filterRow + timeline + foot;
}

/* toggler for pvDD2TypedEvents — a real top-level global (loaded with the rest of the
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
    btns[i].style.background = on ? 'var(--teal-t,#DCEBE9)' : 'transparent';
    btns[i].style.borderColor = on ? 'var(--teal-d,#2F6E6B)' : 'var(--line2,#CECCC7)';
    btns[i].style.color = on ? 'var(--teal-d,#2F6E6B)' : 'var(--mut,#4A443C)';
  }
  var rows = root.querySelectorAll('[data-dd2te-row]');
  for (var j = 0; j < rows.length; j++) {
    var t = rows[j].getAttribute('data-type');
    rows[j].style.display = (key === 'all' || t === key) ? '' : 'none';
  }
}
