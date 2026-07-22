// Extracted verbatim from pv-14-docs-comms.js (lines 7, 98, 782) -- landscape rendering
// (pv-07) calls escD()/jarg() but escD/escapeHtmlPV/jarg are defined in pv-14
// (Documents/Communications tab), not pv-01/pv-07. Rather than stub these out, the real
// function source is pulled in unmodified so escaping/quoting behavior is identical to
// the platform. escD falls back to escapeHtmlPV whenever window.LillyAPI is absent (true here).
function jarg(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function escD(s){return (window.LillyAPI&&LillyAPI.esc)?LillyAPI.esc(s):escapeHtmlPV(s);}
function escapeHtmlPV(s){return (''+s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
