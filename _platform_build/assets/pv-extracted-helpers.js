// Extracted verbatim from pv-14-docs-comms.js (lines 7, 98, 782) -- landscape rendering
// (pv-07) calls escD()/jarg() but escD/escapeHtmlPV/jarg are defined in pv-14
// (Documents/Communications tab), not pv-01/pv-07. Rather than stub these out, the real
// function source is pulled in unmodified so escaping/quoting behavior is identical to
// the platform. escD falls back to escapeHtmlPV whenever window.LillyAPI is absent (true here).
function jarg(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function escD(s){return (window.LillyAPI&&LillyAPI.esc)?LillyAPI.esc(s):escapeHtmlPV(s);}
function escapeHtmlPV(s){return (''+s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
/* infoHover(text,opts): inline "(i)" info affordance used by pv-07 (Deep Dive "Lilly Fit" caption + the
   Requirements Fit heatmap caption inside Deep Dive). Was CALLED but never DEFINED -- threw a ReferenceError
   and broke both tabs. Renders with the platform's own .ihov/.ihov-i/.ihov-pop classes (pv.css); dependency-
   free (no globals besides escD, already defined above in this same file/script). `text` is short authored
   copy baked in at the call site (may carry literal HTML entities like &rsquo; -- inserted verbatim, same as
   every other authored-copy string in pv-07), never user/supplier data, so it is not re-escaped. `opts.aria`
   sets the accessible label. The wrapper is focusable (tabindex) so the popover also opens on keyboard focus,
   matching pv.css's :focus/:focus-within rules. */
function infoHover(text,opts){
 var aria=(opts&&opts.aria)?String(opts.aria):'More information';
 return '<span class="ihov" tabindex="0" role="note" aria-label="'+escD(aria)+'"><span class="ihov-i" aria-hidden="true">i</span><span class="ihov-pop">'+(text==null?'':text)+'</span></span>';
}
