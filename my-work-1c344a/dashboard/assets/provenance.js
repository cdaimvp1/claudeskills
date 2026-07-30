/* ===========================================================================
 * Shared provenance component, ONE identical source affordance everywhere.
 *
 * window.renderProvenance(sources, opts) -> HTML string.
 *
 * Renders a small source icon that, on hover OR keyboard focus, reveals a
 * popover with the full source(s): name (as a clickable link when a safe URL is
 * present), tier/confidence, and as-of date. Never a wall of citations on the
 * page, the detail lives in the hover, per the locked provenance decision
 * (DD.2 / item 33). Pure CSS hover+focus popover: no JS listeners, so it is
 * drop-in and survives innerHTML re-renders.
 *
 * DATA SHAPE, `sources` is a single source object or an array of them:
 *   { name, url?, tier?  (1|2|3), confidence? ('High'|'Medium'|'Low'),
 *     asOf? (ISO or label), note? }
 * A claim with no name is dropped (anti-fabrication: no source, no badge).
 *
 * opts (optional): { label?  short text before the icon, e.g. 'source' }.
 *
 * No green anywhere: accents = Bold Blue #0F3A85; muted = brand grey.
 * The module injects its own scoped CSS once, so it is drop-in on any page.
 * ======================================================================== */
(function(){
  if(window.renderProvenance) return;   // idempotent

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];}); }

  /* safeHref, only http(s); everything else is refused (returns ''). */
  function safeHref(u){
    if(!u) return '';
    try {
      var p = new URL(String(u), 'https://x.invalid');
      if(p.protocol === 'http:' || p.protocol === 'https:') return p.href;
    } catch(e){ /* fall through */ }
    return '';
  }

  var TIER_LABEL = { 1:'Tier 1', 2:'Tier 2', 3:'Tier 3' };

  var CSS = ''
   + '.prov{position:relative;display:inline-flex;align-items:center;gap:4px;vertical-align:baseline;'
   +   'font-size:11px;color:var(--mut,#6B7280);cursor:default}'
   + '.prov:focus{outline:none}'
   + '.prov-ico{display:inline-flex;width:13px;height:13px;border-radius:50%;border:1px solid var(--line2,#DCD8D2);'
   +   'align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--bd,#0F3A85);line-height:1}'
   + '.prov:hover .prov-ico,.prov:focus .prov-ico{border-color:var(--bd,#0F3A85)}'
   + '.prov-lbl{font-size:10.5px;letter-spacing:.02em;text-transform:uppercase}'
   + '.prov-pop{position:absolute;bottom:calc(100% + 6px);left:0;z-index:80;min-width:210px;max-width:320px;'
   +   'background:#fff;border:1px solid var(--line,#E7E4DF);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.14);'
   +   'padding:10px 11px;opacity:0;visibility:hidden;transform:translateY(3px);transition:.14s;pointer-events:none;'
   +   'text-align:left;white-space:normal}'
   + '.prov:hover .prov-pop,.prov:focus .prov-pop,.prov:focus-within .prov-pop{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto}'
   + '.prov-src{font-size:12px;line-height:1.35;color:var(--ink,#22252A)}'
   + '.prov-src + .prov-src{margin-top:8px;padding-top:8px;border-top:1px solid var(--line,#E7E4DF)}'
   + '.prov-src a{color:var(--bd,#0F3A85);font-weight:600;text-decoration:none}'
   + '.prov-src a:hover{text-decoration:underline}'
   + '.prov-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:3px}'
   + '.prov-chip{font-size:10px;font-weight:600;border-radius:20px;padding:1px 7px;background:var(--card,#F4F2EF);color:var(--mut,#6B7280)}'
   + '.prov-chip.t1{background:rgba(15,58,133,.10);color:var(--bd,#0F3A85)}'
   + '.prov-asof{font-size:10.5px;color:var(--mut,#6B7280);margin-top:2px}';

  function injectCss(){
    if(document.getElementById('prov-css')) return;
    var st = document.createElement('style');
    st.id = 'prov-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function srcHTML(s){
    var name = s && s.name ? esc(s.name) : '';
    if(!name) return '';               // anti-fabrication: no name → no source line
    var href = safeHref(s.url);
    var head = href ? '<a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">'+name+'</a>' : name;
    var chips = '';
    if(s.tier && TIER_LABEL[s.tier]) chips += '<span class="prov-chip'+(s.tier===1?' t1':'')+'">'+esc(TIER_LABEL[s.tier])+'</span>';
    if(s.confidence) chips += '<span class="prov-chip">'+esc(s.confidence)+' confidence</span>';
    var meta = chips ? '<div class="prov-meta">'+chips+'</div>' : '';
    var asOf = s.asOf ? '<div class="prov-asof">as of '+esc(s.asOf)+'</div>' : '';
    var note = s.note ? '<div class="prov-asof">'+esc(s.note)+'</div>' : '';
    return '<div class="prov-src">'+head+meta+asOf+note+'</div>';
  }

  /* window.renderProvenance(sources, opts) -> HTML string ('' if no valid source). */
  window.renderProvenance = function(sources, opts){
    injectCss();
    var arr = Array.isArray(sources) ? sources : (sources ? [sources] : []);
    var body = arr.map(srcHTML).filter(Boolean).join('');
    if(!body) return '';               // no valid source → render nothing (no false badge)
    var o = opts || {};
    var count = (body.match(/prov-src/g) || []).length;
    var lbl = o.label ? '<span class="prov-lbl">'+esc(o.label)+'</span>'
            : (count > 1 ? '<span class="prov-lbl">'+count+' sources</span>' : '');
    return '<span class="prov" tabindex="0" role="note" aria-label="source provenance">'
         +   '<span class="prov-ico" aria-hidden="true">i</span>'+lbl
         +   '<span class="prov-pop">'+body+'</span>'
         + '</span>';
  };
})();
