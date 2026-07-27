// Extracted verbatim from pv-06-overview.js and pv-07-landscape-render.js (out of scope
// for the RFx-tab bundle, see JS_FILES_IN_ORDER note in build_dashboard_rfx.py) --
// pv-09-rfx.js calls all three of these at render time (not just from an onclick), so
// leaving them undefined either throws (pvHmRamp, no typeof guard at its call sites --
// confirmed empirically: Analysis > Cross-Supplier heatmap threw ReferenceError with
// this file absent) or silently degrades to a generic fallback color (cciColor/
// pvSupColor, which pv-09 DOES guard with `typeof X==='function'`). Rather than stub
// these out or accept the degraded fallback, the real function source (plus the two
// small pieces of module-level state pvSupColor needs) is pulled in unmodified so every
// color/shading value renders byte-identical to the real platform. Same technique as
// _platform_build/assets/pv-extracted-helpers.js (escD/escapeHtmlPV/infoHover, pulled
// out of pv-14 for the Landscape build).

// pv-07-landscape-render.js line 325: Requirements-Fit heatmap ramp (blue, graded by
// score). pv-09's Scoring-matrix gate cells and Analysis > Cross-Supplier heatmap/legend
// share this exact ramp (pv-09's own comment: "Same ramp as the Landscape Requirements
// Heatmap"). No dependencies beyond Math/Number.
function pvHmRamp(s){
 var v=Number(s);if(!isFinite(v))v=0;
 var t=(v-3.2)/1.7;t=t<0?0:(t>1?1:t);
 var r=Math.round(232+(28-232)*t),g=Math.round(238+(74-238)*t),b=Math.round(244+(117-244)*t);
 return 'background:rgb('+r+','+g+','+b+');color:'+(t>0.5?'#fff':'#1A1A1A')+';';
}

// pv-06-overview.js line 3: CCI (Confidentiality Classification Index) swatch color.
// pv-09's RFx event & status strip uses it for the "CCI classification" swatch.
function cciColor(c){c=(c||'').toLowerCase();return c.indexOf('green')>=0?'#2E7D46':c.indexOf('yellow')>=0?'#EAB308':c.indexOf('red')>=0?'var(--cci-red)':'var(--cci-orange)';}

// pv-07-landscape-render.js lines 297-299: per-supplier stable color assignment (first
// call for a given id gets the next palette slot, memoized). pv-09's Analysis >
// Individual-supplier standings chart uses it to color each bidder consistently.
var PVSUP_PAL=['#123C82','#2F6E6B','#7A2436','#6A4C93','#5C2B50','#8A5A00','#3E7C6A','#8A3A6E'];
var PVSUP_CMAP={},PVSUP_CI=0;
function pvSupColor(a){var id=String((a&&(a.id||a.name))||'');if(!id)return PVSUP_PAL[0];if(PVSUP_CMAP[id]==null){PVSUP_CMAP[id]=PVSUP_PAL[PVSUP_CI%PVSUP_PAL.length];PVSUP_CI++;}return PVSUP_CMAP[id];}
