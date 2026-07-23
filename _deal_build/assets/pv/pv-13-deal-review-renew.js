var _PV13=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVRR=(_PV13&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV13)&&_PV13.reviewRenew)?_PV13.reviewRenew:{};
function ensureReviewCss(){ if(document.getElementById('review-css'))return; var s=document.createElement('style'); s.id='review-css'; s.textContent=
 '.rvkpi{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 16px}'+
 '@media(max-width:640px){.rvkpi{grid-template-columns:repeat(2,1fr)}}'+
 '.rvk{border:1px solid var(--line2,#DCD8D2);border-radius:12px;padding:12px 14px;background:var(--surface)}'+
 '.rvk .kl{font:600 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--mut2,var(--mut2))}'+
 '.rvk .kv{font-size:19px;font-weight:800;margin-top:5px;line-height:1.1;color:var(--ink,#1A1A1A)}'+
 '.rvk .ks{font-size:11px;color:var(--mut2,var(--mut2));margin-top:4px;line-height:1.4}'+
 '.rvgauge{display:flex;gap:18px;align-items:center;flex-wrap:wrap}'+
 '.rvstat{display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:#fff;padding:3px 9px;border-radius:30px;white-space:nowrap}'+
 '.rvtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}'+
 '@media(max-width:560px){.rvtiles{grid-template-columns:1fr}}'+
 '.rvtile{border:1px solid var(--line2,#DCD8D2);border-radius:12px;padding:12px;text-align:center;background:var(--surface)}'+
 '.rvtile .v{font-size:24px;font-weight:800;line-height:1}'+
 '.rvtile .l{font:600 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--mut2,var(--mut2));margin-top:6px}'+
 '.rvcov{display:flex;height:26px;border-radius:7px;overflow:hidden;border:1px solid var(--line2,#DCD8D2);margin-bottom:7px}'+
 '.rvcov>div{color:#fff;font:700 11px var(--sans,system-ui,sans-serif);display:flex;align-items:center;justify-content:center;min-width:0;overflow:hidden;white-space:nowrap}'+
 '.rvfind{border:1px solid var(--line2,#DCD8D2);border-left:3px solid var(--mut2,var(--mut2));border-radius:11px;padding:12px 14px;margin:0 0 10px;background:var(--surface)}'+
 '.rvfind.high{border-left-color:var(--red,#C8202E)}.rvfind.med{border-left-color:var(--amber-d,#8A5A00)}.rvfind.low{border-left-color:var(--blue-d,#2E5E8C)}'+
 '.rvfh{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:8px}'+
 '.rvft{font-weight:700;font-size:13.5px;color:var(--ink,#1A1A1A)}'+
 '.rvverified{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;background:var(--blue-t,#E4EBF1);color:var(--plum);border-radius:30px;padding:2px 8px}'+
 '.rvfrow{font-size:12.5px;line-height:1.5;margin:3px 0;color:var(--ink,#1A1A1A)}.rvfrow b{color:var(--mut,#3E3933)}'+
 '.rvfmeta{font:11px var(--mono,monospace);color:var(--mut2,var(--mut2));margin-top:7px}'+
 '.rvrh{font:700 11px var(--mono,monospace);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 9px}'+
 '.rvcond{list-style:none;margin:0;padding:0;display:grid;gap:9px}'+
 '.rvcond li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.45;color:var(--ink,#1A1A1A)}'+
 '.rvcond .num{flex:none;width:20px;height:20px;border-radius:50%;background:var(--plum);color:#fff;font:700 11px var(--mono,monospace);display:flex;align-items:center;justify-content:center;margin-top:1px}'+
 '.rvtrace{display:flex;flex-wrap:wrap;gap:6px}'+
 '.rvtrace span{font:600 10.5px var(--mono,monospace);background:var(--blue-t,#E4EBF1);color:var(--plum);border-radius:30px;padding:3px 9px}'+
 '.rvsn{font-size:11.5px;color:var(--mut2,var(--mut2));margin:0 0 10px;line-height:1.5}'
 ; document.head.appendChild(s);
}
// 4-band protection gauge (0-24 Critical / 25-49 High / 50-74 Moderate / 75-100 Low-Strong).
// Higher score = better protection. Ported from dashboard riskGauge; no-green ramp (red->amber->blue).
function dealRiskGauge(score){
 var W=210,H=124,cx=W/2,cy=H-12,rO=88,rI=62;
 function pt(r,deg){var a=(180-deg)*Math.PI/180;return [cx+r*Math.cos(a),cy-r*Math.sin(a)];}
 function arc(r,d0,d1){var p0=pt(r,d0),p1=pt(r,d1),large=(d1-d0)>180?1:0;return 'M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+' A'+r+' '+r+' 0 '+large+' 1 '+p1[0].toFixed(1)+' '+p1[1].toFixed(1);}
 function band(r0,r1,d0,d1,fill){var oa=arc(r1,d0,d1),iaP0=pt(r0,d1),iaP1=pt(r0,d0),large=(d1-d0)>180?1:0;return '<path d="'+oa+' L'+iaP0[0].toFixed(1)+' '+iaP0[1].toFixed(1)+' A'+r0+' '+r0+' 0 '+large+' 0 '+iaP1[0].toFixed(1)+' '+iaP1[1].toFixed(1)+' Z" fill="'+fill+'"/>';}
 var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Protection score '+score+' of 100">';
 s+=band(rI,rO,0,45,'#FDE0DC');      // 0-24 Critical track
 s+=band(rI,rO,45,90,'#F5C9C5');     // 25-49 High track
 s+=band(rI,rO,90,135,'#FCE3BF');    // 50-74 Moderate track
 s+=band(rI,rO,135,180,'#CFE0F5');   // 75-100 Low/Strong track
 var deg=(score/100)*180;
 var activeColor=score>=75?'var(--plum)':score>=50?'#8A5A00':score>=25?'#C0392B':'#C8202E';
 s+=band(rI,rO,0,deg,activeColor);
 s+='<text x="'+cx+'" y="'+(cy-24)+'" text-anchor="middle" style="font-family:var(--sans);font-size:26px;font-weight:800;fill:'+activeColor+'">'+score+'</text>';
 s+='<text x="'+cx+'" y="'+(cy-8)+'" text-anchor="middle" style="font-family:var(--sans);font-size:10px;fill:var(--mut2)">of 100</text>';
 s+='<text x="'+(cx-rO)+'" y="'+(cy+13)+'" text-anchor="middle" style="font-family:var(--sans);font-size:9px;fill:var(--mut2)">0</text>';
 s+='<text x="'+(cx+rO)+'" y="'+(cy+13)+'" text-anchor="middle" style="font-family:var(--sans);font-size:9px;fill:var(--mut2)">100</text>';
 s+='</svg>';
 return s;
}
// Covered = Bold Blue var(--plum), Confirm = Amber, Gap = Red. NO GREEN.
function dealStatPill(status){
 var c=status==='Covered'?'var(--plum)':status==='Gap'?'var(--red,#C8202E)':'var(--amber-d,#8A5A00)';
 return '<span class="rvstat" style="background:'+c+'">'+escD(status)+'</span>';
}
// RECONCILED issue model: findings are the DEAL_ISSUES that carry a contract-review finding.
// The Go/No-Go, Findings, Heatmap and Protection & Coverage all read this one coherent structure
// (CONTRACT.gaps is retired as a second, contradictory set).
function dealFindings(){
 var n=0;
 return (pvData('deal.issues',DEAL_ISSUES)||[]).filter(function(it){return it.review;}).map(function(it){
  n++; var r=it.review;
  return {n:n,title:it.name,sev:it.sev||'med',cat:it.cat||'',evidence:r.evidence||r.d||'',xref:r.xref||'',impact:r.impact||'',loc:r.loc||'',action:r.fix||'',verified:true};
 });
}
function dealConditionsHTML(){
 var conds=dealFindings().filter(function(x){return x.sev==='high'||x.sev==='med';});
 if(!conds.length)return '';
 var li=conds.map(function(x){return '<li><span class="num">'+x.n+'</span><span>'+escD(x.action)+'</span></li>';}).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Conditions before signature</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">rolled up from the findings</span></div><div class="card"><ul class="rvcond">'+li+'</ul><div class="spnote">These redline fixes gate signature. Reflect-only; Legal accepts redlines in Word, Theo does not write back to the contract.</div></div></div>';
}
function dealOverviewHTML(){
 var C=pvData('deal.contract',CONTRACT);
 var covered=pvData('deal.dealCats',DEAL_CATEGORIES).filter(function(c){return c.status==='Covered';}).length;
 var band=C.score>=75?'Strong protection (Low risk)':C.score>=50?'Moderate protection':C.score>=25?'High risk':'Critical risk';
 var scoreCol=C.score>=75?'var(--plum)':C.score>=50?'#8A5A00':C.score>=25?'#C0392B':'#C8202E';
 var highs=dealFindings().filter(function(x){return x.sev==='high';}).length;
 var kpi='<div class="rvkpi">'+
  '<div class="rvk"><div class="kl">Annual value</div><div class="kv" style="color:var(--plum)">$600K/yr</div><div class="ks">$1.8M TCO (3-yr) · $1,500/seat @ 400 seats</div></div>'+
  '<div class="rvk"><div class="kl">Protection score</div><div class="kv" style="color:'+scoreCol+'">'+C.score+'/100</div><div class="ks">'+band+' · higher = better</div></div>'+
  '<div class="rvk"><div class="kl">Hard stops</div><div class="kv">0</div><div class="ks">No deal-breakers; '+highs+' high findings to resolve</div></div>'+
  '<div class="rvk"><div class="kl">Est. rounds</div><div class="kv">2-3</div><div class="ks">Moderate complexity (supplier paper)</div></div>'+
  '</div>';
 var legend='<div style="margin-top:10px;font-size:11px;color:var(--mut2)">Bands: '+
  '<span style="color:#C8202E">0-24 Critical</span> · <span style="color:#C0392B">25-49 High</span> · '+
  '<span style="color:var(--amber-d)">50-74 Moderate</span> · <span style="color:var(--plum)">75-100 Low/Strong</span></div>';
 var gauge='<div class="card"><div class="rvgauge">'+dealRiskGauge(C.score)+
  '<div style="flex:1;min-width:190px"><div style="font-size:13px;font-weight:700;color:'+scoreCol+'">'+C.score+' / 100, '+band+'</div>'+
  '<div style="font-size:12px;color:var(--mut2);margin-top:6px;line-height:1.55">Higher = better protected. '+escD(C.summary)+'</div>'+legend+'</div></div>'+dealDemoGoNoGoHTML()+'</div>';
 var meth='<div class="card"><div style="font-size:12px;color:var(--ink);line-height:1.65"><b>Starts at 100 (no risk).</b> '+
  'Deducts by finding severity, weighted against combined protection (MSA + amendments + Change Order 3). '+
  covered+' of 14 categories are Covered outright and 4 more are in place pending confirmation, so most findings '+
  'restore or clarify an existing MSA protection rather than fill an unprotected gap. Zero Hard Stops. '+
  'Deductions: HIGH -5 to -8 each (3 findings: liability PI carve-out, sub-processor control, IP ownership); '+
  'MEDIUM -2 to -3 (renewal cap); LOW -1 (venue). Scale: 75-100 Low/Strong, 50-74 Moderate, 25-49 High, 0-24 Critical.</div></div>';
 var msa=dealGoverningMSA();
 var traces='<div class="rvtrace">'+pvData('deal.defTraces',DEAL_DEFTRACES).map(function(t){return '<span>'+escD(t)+'</span>';}).join('')+'</div>';
 var gov='<div class="card"><div style="font-size:12.5px;color:var(--ink);line-height:1.6"><b>'+escD(msa||'Acme MSA (2024)')+'</b> read in full. '+
  'Amendment 1 (pricing), Amendment 2 (term + renewal) and Change Order 3 (Lilly DPA + EU SCCs) incorporated and '+
  'reconciled across the amendment chain. This is a <b>new supplier engagement on '+escD(SUPPLIER_CONTACT.company)+' paper</b>, '+
  'so terms are negotiated from the Lilly standard, not an established relationship. Every finding below cross-references the governing documents.</div>'+
  '<div style="font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:var(--mut2);margin:12px 0 6px">Definition traces completed</div>'+traces+'</div>';
 return kpi+
  '<div class="sect"><div class="secthd"><div class="t">Overall protection score</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">higher = better protected</span></div>'+gauge+'</div>'+
  '<div class="sect"><div class="secthd"><div class="t">Score methodology</div></div>'+meth+'</div>'+
  '<div class="sect"><div class="secthd"><div class="t">Governing agreement</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">reviewed against</span></div>'+gov+'</div>'+
  dealConditionsHTML();
}
// evidentiary Findings, grouped by severity with Evidence / Cross-Ref / Impact / Location / Verified.
function dealFindingsHTML(){
 var f=dealFindings();
 var sevPill=function(sev){var lab=sev==='high'?'High':sev==='med'?'Medium':'Low';return '<span class="gsev '+sev+'">'+lab+'</span>';};
 var card=function(x){return '<div class="rvfind '+x.sev+'">'+
   '<div class="rvfh"><span class="rvft">#'+x.n+': '+escD(x.title)+'</span>'+sevPill(x.sev)+'<span class="rvverified">Verified</span></div>'+
   '<div class="rvfrow"><b>Evidence:</b> '+escD(x.evidence)+'</div>'+
   '<div class="rvfrow"><b>MSA cross-ref:</b> '+escD(x.xref)+'</div>'+
   '<div class="rvfrow"><b>Impact:</b> '+escD(x.impact)+'</div>'+
   '<div class="rvfrow"><b style="color:var(--plum)">Action:</b> '+escD(x.action)+'</div>'+
   '<div class="rvfmeta">Category: '+escD(x.cat)+' · Location: '+escD(x.loc)+'</div></div>';};
 var high=f.filter(function(x){return x.sev==='high';});
 var med=f.filter(function(x){return x.sev==='med';});
 var low=f.filter(function(x){return x.sev==='low';});
 var banner='';
 if(typeof PAPER!=='undefined'&&PAPER.onSupplierPaper){
  var pbHi=PAPER.deviations.filter(function(x){return x.sev==='high';}).length;
  banner='<div class="paperbanner"><div class="pbtx"><b>On '+escD(SUPPLIER_CONTACT.company)+' paper.</b> This draft arrived on the supplier\'s paper, '+PAPER.deviations.length+' deviations from the Lilly template ('+pbHi+' high), reflected in the findings below. Negotiate from the Lilly standard, not theirs.</div><button class="btn btn-primary btn-sm" onclick="mapToTemplate()">Map to Lilly template</button></div>';
 }
 var body=banner;
 if(high.length)body+='<div class="rvrh" style="color:var(--red,#C8202E)">HIGH RISK ('+high.length+')</div>'+high.map(card).join('');
 if(med.length)body+='<div class="rvrh" style="color:var(--amber-d,#8A5A00)">MEDIUM RISK ('+med.length+')</div>'+med.map(card).join('');
 if(low.length){
  var lowTitles=low.map(function(x){return escD(x.title);}).join(', ');
  var lowNote=low.length===1?escD(low[0].action):'Tracked in the full review export.';
  body+='<div class="rvsn" style="margin-top:8px">+ '+low.length+' LOW finding'+(low.length===1?'':'s')+' ('+lowTitles+'), '+lowNote+'</div>';
 }
 return '<div class="sect"><div class="secthd"><div class="t">Findings</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">evidentiary redline cards · grouped by severity</span></div>'+body+'</div>';
}
// Risk Heatmap = the 14-category governing-PROTECTION scan (Covered / Confirm / Gap + citation),
// replacing the old issue-count grid. Rollup tiles derived from the same structure.
function dealRiskHeatmapHTML(){
 var cats=pvData('deal.dealCats',DEAL_CATEGORIES);
 var rows=cats.map(function(c){return '<tr><td class="iss">'+escD(c.cat)+'</td><td>'+dealStatPill(c.status)+'</td><td style="color:var(--mut)">'+escD(c.src)+'</td></tr>';}).join('');
 var gap=cats.filter(function(c){return c.status==='Gap';}).length;
 var confirm=cats.filter(function(c){return c.status==='Confirm';}).length;
 var covered=cats.filter(function(c){return c.status==='Covered';}).length;
 var tiles='<div class="rvtiles">'+
   '<div class="rvtile"><div class="v" style="color:var(--red,#C8202E)">'+gap+'</div><div class="l">High risk (Gap)</div></div>'+
   '<div class="rvtile"><div class="v" style="color:var(--amber-d,#8A5A00)">'+confirm+'</div><div class="l">Medium (Confirm)</div></div>'+
   '<div class="rvtile"><div class="v" style="color:var(--plum)">'+covered+'</div><div class="l">Low (Covered)</div></div>'+
   '</div>';
 return '<div class="sect"><div class="secthd"><div class="t">Risk heatmap</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">14-category governing-protection scan</span></div>'+
  '<div class="rvsn">Coverage of the 14 governing-protection categories. Status: '+
  '<span style="color:var(--plum);font-weight:700">Covered</span> · <span style="color:var(--amber-d,#8A5A00);font-weight:700">Confirm</span> · '+
  '<span style="color:var(--red,#C8202E);font-weight:700">Gap</span>. No-green palette.</div>'+
  '<div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th style="width:22%">Category</th><th style="width:14%">Status</th><th>Governing document / notes</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+tiles+'</div>';
}
// Protection & Coverage, coverage metrics + stacked coverage bar + numbered per-category table
// with a Governing Document Source column. Derived from the same 14-category structure.
function dealProtectionHTML(){
 var cats=pvData('deal.dealCats',DEAL_CATEGORIES),total=cats.length;
 var covered=cats.filter(function(c){return c.status==='Covered';}).length;
 var confirm=cats.filter(function(c){return c.status==='Confirm';}).length;
 var gap=cats.filter(function(c){return c.status==='Gap';}).length;
 var pct=function(n){return (n/total*100).toFixed(1)+'%';};
 var metrics='<div class="rvtiles">'+
   '<div class="rvtile"><div class="v" style="color:var(--plum)">'+covered+' of '+total+'</div><div class="l">Categories covered</div></div>'+
   '<div class="rvtile"><div class="v" style="color:var(--red,#C8202E)">'+gap+'</div><div class="l">Protection gaps</div></div>'+
   '<div class="rvtile"><div class="v" style="color:var(--amber-d,#8A5A00)">'+confirm+'</div><div class="l">Confirm items</div></div>'+
   '</div>';
 var bar='<div class="rvcov">'+
   '<div style="width:'+pct(covered)+';background:var(--plum)">'+covered+' Covered</div>'+
   '<div style="width:'+pct(confirm)+';background:var(--amber-d,#8A5A00)">'+confirm+' Confirm</div>'+
   '<div style="width:'+pct(gap)+';background:var(--red,#C8202E)">'+gap+' Gap</div></div>'+
   '<div style="font-size:11px;color:var(--mut2)">'+covered+' of '+total+' categories covered by combined protection (MSA + amendments + Change Order 3).</div>';
 var rows=cats.map(function(c,i){return '<tr><td style="width:5%;color:var(--mut2)">'+(i+1)+'</td><td class="iss" style="width:20%">'+escD(c.cat)+'</td><td style="width:14%">'+dealStatPill(c.status)+'</td><td style="color:var(--mut)">'+escD(c.src)+'</td></tr>';}).join('');
 var table='<div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th>#</th><th>Category</th><th>Status</th><th>Governing document source</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
 return '<div class="sect"><div class="secthd"><div class="t">Protection &amp; coverage</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">scored on combined protection</span></div>'+
  '<div class="rvsn">Scored on COMBINED protection (MSA + amendments + Change Order 3). A category is Covered when the governing document already carries the protection; Confirm = present but needs a clause confirmation; Gap = a real protection to add.</div>'+
  metrics+'<div class="card">'+bar+'</div>'+table+'</div>';
}
// Vendor tactics, 12-category FLAG/CLEAR scan with contract-specific triggering text + a flagged
// count. CLEAR entries show what was checked and passed. FLAG positions carry a market acceptance rate.
var DEAL_TACTICS=_PVRR.tactics||[];
function dealVendorTacticsHTML(){
 var flagged=DEAL_TACTICS.filter(function(t){return t.flag;}).length;
 var rows=DEAL_TACTICS.map(function(t){
  var pill=t.flag?'<span class="rvstat" style="background:var(--amber-d,#8A5A00)">FLAG</span>':'<span class="rvstat" style="background:var(--plum)">CLEAR</span>';
  var acc=t.accept?' <span style="font:600 10px var(--mono);color:var(--mut2);white-space:nowrap">accept '+escD(t.accept)+'</span>':'';
  var txtCol=t.flag?'var(--ink,#1A1A1A)':'var(--mut2,var(--mut2))';
  return '<tr><td class="iss">'+escD(t.cat)+'</td><td>'+pill+'</td><td style="color:'+txtCol+'">'+escD(t.txt)+acc+'</td></tr>';
 }).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Vendor tactics</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+flagged+' of '+DEAL_TACTICS.length+' flagged · FLAG=amber, CLEAR=blue</span></div>'+
  '<div class="rvsn">12-category tactic scan against this contract; CLEAR shows what was checked and passed. Acceptance rates are market benchmarks for the counter-position. Reflect-only; a human confirms.</div>'+
  '<div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th style="width:26%">Category</th><th style="width:12%">Status</th><th>Triggering text</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
}
function dealReviewExtras(){var C=pvData('deal.contract',CONTRACT);
 ensureCdrCss(); ensureReviewCss();
 // Overview (KPI strip + 4-band gauge + methodology + governing panel + conditions + Go/No-Go) is the
 // headline. #dealReviewHost is swapped for the LIVE contract-review render by dealReviewLoad when the
 // platform is reachable (offline keeps this native overview). Doc type is DERIVED read-only (no picker).
 var h='<div id="dealReviewHost">'+dealOverviewHTML()+'</div>';
 h+=dealDocTypeReadHTML();
 h+=dealFindingsHTML();       // evidentiary findings (reconciled model), grouped by severity
 h+=dealRiskHeatmapHTML();    // 14-category governing-protection scan
 h+=dealProtectionHTML();     // Protection & Coverage: metrics + bar + per-category table
 h+=dealVendorTacticsHTML();  // 12-category tactic scan
 h+=dealReviewActionsHTML();
 h+=cvSectionHTML();
 h+=(typeof pushToLeahSectionHTML==='function'?pushToLeahSectionHTML():'');   // #135 type-gated Push-to-LEAH (MSA / CDA / MSA-amendment only)
 return h;
}
// demo/offline Go-No-Go headline derived from the RECONCILED findings model (dealFindings);
// the live path renders its own. CONTRACT.gaps is no longer read here, one coherent model.
function dealDemoGoNoGoHTML(){
 var f=dealFindings();
 var hardStop=f.some(function(x){return x.sev==='hardstop';});
 var highs=f.filter(function(x){return x.sev==='high';});
 var gg=hardStop?'NO_GO':(highs.length||pvData('deal.contract',CONTRACT).score<75)?'MOD':'GO';
 var lab=gg==='NO_GO'?'NO-GO':gg==='GO'?'GO':'GO with modifications';
 var ggCol=gg==='NO_GO'?'var(--red,#E1251B)':gg==='GO'?'var(--plum)':'var(--amber-d,#8A5A00)';
 var hl=highs.map(function(x){return x.title;}).join(', ');
 var note=gg==='NO_GO'?'A mandatory protection is missing. Legal review before execution.':gg==='GO'?'Reflect-only recommendation; Legal accepts redlines in Word.':'Resolve the '+highs.length+' high-severity finding'+(highs.length===1?'':'s')+(hl?' ('+hl+')':'')+', then proceed. Legal accepts redlines in Word.';
 return '<div class="dggo"><span class="dgpill" style="background:'+ggCol+'">'+lab+'</span><span class="dgnote">'+escD(note)+'</span></div>';
}
// ===== #23 gaps 1/3/4/5 + CDR Phase-4 confirm (Deal tab, additive, reflect-only) =====
// All live reads/writes go through LillyAPI.tryLive so the offline demo never breaks;
// every server value is escaped before innerHTML; interactive elements carry data-*
// and are routed by ONE delegated listener (no inline on*= with data); document links
// pass through safeHref. Positive = Bold Blue var(--plum), never green; ASCII copy only.
// C: doc type is DERIVED from the project (read-only) and is never chosen by the user (no picker state).
var DEAL_REVIEW_LIVE=null;    // B: last live {review,dashboard}, or null when offline/demo
var DEAL_CDR_ROWS=null;       // A: current CDR rows (demo or live-normalized)
var DEAL_CDR_CID=null, DEAL_CDR_VID=null, DEAL_CDR_PROJ=null; // A: live ids for confirm writes
var CDR_DOC_URL='https://lilly.sharepoint.com/sites/it-procurement/Shared%20Documents/MSA_Acme_2024_executed.pdf';
function ensureCdrCss(){ if(document.getElementById('cdr-css'))return; var s=document.createElement('style'); s.id='cdr-css'; s.textContent=
 '.cdrbadge{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:30px;white-space:nowrap;flex:none}'+
 '.cdrbadge.trust{background:var(--blue-t,#EAF0F9);color:var(--plum)}'+
 '.cdrbadge.watch{background:var(--amber-t,#FBEFC9);color:var(--amber-d,#8A6D00)}'+
 '.cdrbadge.neutral{background:var(--bg,#F4F1EC);color:var(--mut2,#6b6b6b)}'+
 '.cdrrow{border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:11px 13px;margin:0 0 9px;background:var(--surface)}'+
 '.cdrrh{display:flex;align-items:center;gap:9px;margin-bottom:5px}'+
 '.cdrlbl{font-weight:700;font-size:13px;color:var(--ink,#1A1A1A)}'+
 '.cdrval{font-size:13.5px;color:var(--ink,#1A1A1A);margin:2px 0 4px}'+
 '.cdrmeta{font:11px var(--mono,monospace);color:var(--mut2,#6b6b6b);margin-bottom:8px}'+
 '.cdrunconf{color:var(--amber-d,#8A6D00);font-weight:600}'+
 '.cdracts{display:flex;gap:8px;flex-wrap:wrap;align-items:center}'+
 '.cdrchip{font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;background:var(--bg,#F4F1EC);color:var(--mut2,#6b6b6b);border:1px solid var(--line2,#E0DCD5);border-radius:30px;padding:3px 9px;cursor:pointer}'+
 '.cdrchip.on{background:var(--blue-t,#EAF0F9);color:var(--plum);border-color:var(--plum)}'+
 '.cdraccepted{border:1px solid var(--line,#E3E2DF);border-radius:10px;background:var(--bg,#F7F5F1);padding:8px 12px;margin:0 0 7px;display:flex;align-items:center;gap:9px;font-size:12.5px}'+
 '.cdrdisc{background:var(--tint-fbf4e6,#FBF4E6);border:1px solid #E7C66B;border-radius:8px;padding:7px 10px;margin:4px 0 8px;font-size:11.5px;color:#6E5600;line-height:1.4}'+
 '.cdrgate{background:var(--blue-t,#EAF0F9);border:1px solid #C6D7EF;border-left:3px solid var(--plum);border-radius:10px;padding:9px 12px;margin:0 0 12px;font-size:12px;line-height:1.5;color:#1A1A1A}'
 ; document.head.appendChild(s);
}
// ---- C: #23 gap 3 -- non-MSA doc-type entry point --------------------------------
var CDR_DOCTYPES=[
 {k:'msa',label:'MSA',leah:true},
 {k:'cda',label:'CDA / NDA',leah:true},
 {k:'wo',label:'Work Order'},
 {k:'sow',label:'SOW'},
 {k:'order',label:'Order Form'},
 {k:'short',label:'Short Form'},
 {k:'eval',label:'Evaluation Agreement'}
];
function cdrDocTypeDef(k){return CDR_DOCTYPES.filter(function(x){return x.k===k;})[0];}
function dealDefaultDocType(){
 var p=PROJECTS[CURPROJ]||{}; var t=((p.docType||'')+' '+(p.type||'')).toLowerCase();
 if(/cda|nda/.test(t))return 'cda';
 if(/poc|trial|eval/.test(t))return 'eval';
 if(/sow/.test(t))return 'sow';
 if(/order/.test(t))return 'order';
 return 'wo';
}
function dealDocType(){return dealDefaultDocType();}   // derived only; no user override
function isLeahDocType(k){var d=cdrDocTypeDef(k);return !!(d&&d.leah);}
// governing MSA for the "reviewed against ..." read, pulled from the fanned-out LEAH record
function dealGoverningMSA(){
 try{var leah=(SYSDATA.systems||[]).filter(function(s){return s.sys==='LEAH';})[0];
  if(leah){var f=(leah.fields||[]).filter(function(x){return /governing msa/i.test(x[0]);})[0];if(f)return f[1];}}catch(e){}
 return '';
}
// C: doc type shown READ-ONLY (derived from the project / known contract type). It still drives the
// WO/SOW-vs-MSA routing in dealReviewLoad; the user never picks it. Unknown -> a status, not a picker.
function dealDocTypeReadHTML(){
 var P=PROJECTS[CURPROJ];
 if(!P){return '<div class="sect"><div class="secthd"><div class="t">Document type</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">derived · read-only</span></div><p class="cnote" style="margin:0">Document type: pending classification.</p></div>';}
 var dt=dealDocType();var def=cdrDocTypeDef(dt)||{label:dt};var lbl=escapeHtmlPV(def.label||dt);var msa=dealGoverningMSA();
 var body=isLeahDocType(dt)
  ? '<div class="cdrgate"><b style="color:var(--plum)">Document type: '+lbl+'</b> - authored and reviewed in LEAH, the CLM system of record. The Protection Score engine here covers the non-MSA paper (WO, SOW, Order Form, Short Form, Evaluation Agreement).<div style="margin-top:7px"><a class="dlk" data-leah="1" style="color:var(--plum)">Open in LEAH -&gt;</a></div></div>'
  : '<p class="cnote" style="margin:0">Document type: <b>'+lbl+'</b>'+(msa?' (reviewed against the '+escapeHtmlPV(msa)+')':'')+'. Derived from the project; routed to the contract-review engine below. Reflect-only.</p>';
 return '<div class="sect"><div class="secthd"><div class="t">Document type</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">derived · read-only</span></div>'+body+'</div>';
}
// ---- B: #23 gap 1 -- wire the live contract-review into Review mode ---------------
function cdrScoreColor(s){return s>=75?'var(--plum)':s>=50?'var(--amber-d,#8A6D00)':'var(--red,#C8202E)';}
function cdrSev(s){s=(''+(s||'')).toUpperCase();return /HARD|HIGH|CRIT/.test(s)?'high':/MED/.test(s)?'med':'low';}
async function dealReviewLoad(){
 if(curtab!=='deal'||DEAL_MODE!=='review')return;
 var host=document.getElementById('dealReviewHost');if(!host)return;
 var dt=dealDocType();
 if(isLeahDocType(dt)){DEAL_REVIEW_LIVE=null;return;} // LEAH owns MSA/CDA -> keep demo/affordance
 var P=PROJECTS[CURPROJ]||{};
 var payload={subject:P.title,supplier:P.supplier,document:(''+dt).toUpperCase(),docType:dt,nowISO:new Date().toISOString()};
 var r=await LillyAPI.tryLive(function(){return LillyAPI.contractReview(payload);},null);
 if(r.source!=='live'||!r.data||!r.data.review){DEAL_REVIEW_LIVE=null;return;} // keep demo
 DEAL_REVIEW_LIVE=r.data;
 host.innerHTML=dealReviewLiveHTML(r.data);
 var act=document.getElementById('dealReviewActions');if(act)act.innerHTML=dealReviewActionsInner();
}
function dealReviewLiveHTML(data){
 var rev=data.review||{};var prot=rev.protection||{};
 var score=(typeof prot.score==='number')?prot.score:0;var col=cdrScoreColor(score);var deg=Math.round(score/100*360);
 var bandLab=score>=75?'Strong protection':score>=50?'Moderate protection':'Weak protection';
 var summ=escapeHtmlPV(rev.summary||('Protection Score '+score+' from '+((rev.findings||[]).length)+' finding(s).'));
 var h='<div class="sect"><div class="secthd"><div class="t">Protection Score</div><span class="autopill live">Live</span></div><div class="card"><div class="pscore"><div class="pgauge" style="background:conic-gradient('+col+' '+deg+'deg, var(--line) 0)"><div class="pin"><div class="pnum" style="color:'+col+'">'+escapeHtmlPV(score)+'</div><div class="pof">/ 100</div></div></div><div class="pmeta"><div class="pml" style="color:'+col+'">'+bandLab+'</div><div class="pmd">Higher is better. '+summ+'</div></div></div></div></div>';
 var gg=rev.goNoGo||'';var ggLab=gg==='GO'?'GO':gg==='NO_GO'?'NO-GO':'GO with modifications';var ggCol=gg==='NO_GO'?'var(--red,#C8202E)':gg==='GO'?'var(--plum)':'var(--amber-d,#8A6D00)';
 h+='<div class="sect"><div class="secthd"><div class="t">Go / No-Go</div></div><div class="card"><div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap"><span style="font:700 13px var(--sans,system-ui,sans-serif);color:#fff;background:'+ggCol+';border-radius:30px;padding:4px 14px">'+escapeHtmlPV(ggLab)+'</span><span style="font-size:12.5px;color:var(--mut,#4A4540)">'+(rev.hardStop?'A mandatory protection is missing or weak. Legal review before execution.':'Reflect-only recommendation; Legal accepts redlines in Word.')+'</span></div></div></div>';
 var fs=rev.findings||[];
 if(fs.length){
  h+='<div class="sect"><div class="secthd"><div class="t">Protection gaps</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+fs.length+' finding(s)</span></div>'+
   fs.map(function(f){var sv=cdrSev(f.severity);var svl=f.hardStop?'Hard-Stop':sv==='high'?'High':sv==='med'?'Med':'Low';return '<div class="gap"><span class="dcat">'+escapeHtmlPV(f.category||'General')+'</span><span class="gsev '+sv+'">'+svl+'</span><div class="gm"><div class="gn">'+escapeHtmlPV(f.playbookSection||f.category||'')+'</div><div class="gd">'+escapeHtmlPV(f.impact||'')+'</div>'+(f.recommendedAction?'<div class="gfix"><b>Redline:</b> '+escapeHtmlPV(f.recommendedAction)+'</div>':'')+'</div></div>';}).join('')+'</div>';
 }
 var rl=rev.redlines||[];
 if(rl.length){
  h+='<div class="sect"><div class="secthd"><div class="t">Top redlines</div><a href="javascript:void(0)" onclick="openRedlines()" style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:#2B579A;text-decoration:none"><svg viewBox="0 0 24 24" fill="none" stroke="#2B579A" stroke-width="2" style="width:13px;height:13px"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/></svg>Open in Word</a></div><ol class="redlist">'+
   rl.map(function(x){return '<li><div class="rlh"><span class="rlsec">'+escapeHtmlPV(x.playbookSection||'')+'</span><span class="rln">'+escapeHtmlPV((x.category||'')+' - '+(x.action||''))+'</span></div><div class="rld">'+escapeHtmlPV(x.suggestedText||x.rationale||'')+'</div></li>';}).join('')+'</ol></div>';
 }
 var sme=rev.smeRouting||[];
 if(sme.length){
  h+='<div class="sect"><div class="secthd"><div class="t">SME routing</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">reflect-only</span></div><div class="card" style="padding:2px 0">'+
   sme.map(function(s,i){return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 14px'+(i>0?';border-top:1px solid var(--line2,#E0DCD5)':'')+'"><div><div style="font-weight:600;font-size:13px">'+escapeHtmlPV(s.category||'')+' <span style="color:var(--mut2);font-weight:400">'+escapeHtmlPV(s.sme||'')+'</span></div><div style="font-size:11.5px;color:var(--mut2)">'+escapeHtmlPV(s.reason||'')+'</div></div><span class="cdrbadge '+((''+(s.urgency||'')).toUpperCase()==='URGENT'?'watch':'neutral')+'">'+escapeHtmlPV(s.urgency||'STANDARD')+'</span></div>';}).join('')+'</div></div>';
 }
 return h;
}
// ---- D + E: #23 gaps 4/5 -- act on the review ------------------------------------
function dealReviewActionsHTML(){return '<div id="dealReviewActions" class="sect">'+dealReviewActionsInner()+'</div>';}
function dealReviewActionsInner(){
 var live=DEAL_REVIEW_LIVE&&DEAL_REVIEW_LIVE.review;
 var nFind=live?(DEAL_REVIEW_LIVE.review.findings||[]).length:(pvData('deal.contract',CONTRACT).gaps||[]).length;
 var nSme=live?(DEAL_REVIEW_LIVE.review.smeRouting||[]).length:0;
 return '<div class="secthd"><div class="t">Act on the review</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">reflect-only, human-gated</span></div>'+
  '<div class="card"><div class="cdracts" style="gap:10px">'+
   '<button type="button" class="btn btn-primary btn-sm" data-vendor-resp="1">Draft vendor response</button>'+
  '</div>'+
  '<div class="anote">Draft vendor response composes a NEGOTIATION_REPLY draft from the '+nFind+' finding(s)'+(nSme?', '+nSme+' SME routing note(s)':'')+' and redlines - it lands in Drafts for your review; nothing is sent. Obligations are registered by the system at execution, not from here.</div>'+
  '</div>';
}
function dealReviewFindingsContext(){
 if(DEAL_REVIEW_LIVE&&DEAL_REVIEW_LIVE.review){
  var rev=DEAL_REVIEW_LIVE.review;
  return {findings:(rev.findings||[]).map(function(f){return {category:f.category,severity:f.severity,impact:f.impact,recommendedAction:f.recommendedAction};}),
    redlines:(rev.redlines||[]).map(function(x){return {category:x.category,action:x.action,suggestedText:x.suggestedText};}),
    smeRouting:rev.smeRouting||[],protectionScore:(rev.protection&&rev.protection.score)};
 }
 var C=pvData('deal.contract',CONTRACT);
 return {findings:(C.gaps||[]).map(function(g){return {category:g.sec,severity:g.sev,impact:g.d,recommendedAction:g.fix};}),
   redlines:(C.gaps||[]).map(function(g){return {suggestedText:g.fix};}),smeRouting:[],protectionScore:C.score};
}
async function dealDraftVendorResponse(){
 var ctx=dealReviewFindingsContext();
 var P=PROJECTS[CURPROJ]||{};
 var payload={projectId:P.code||CURPROJ,kind:'NEGOTIATION_REPLY',title:'Vendor response - '+(P.supplier||'supplier'),context:ctx};
 await LillyAPI.tryLive(function(){return LillyAPI.saveDraft(payload);},{draft:{id:'demo'}});
 if(typeof CHAT!=='undefined'){
  var lines=ctx.findings.slice(0,5).map(function(f,i){return (i+1)+'. '+(f.category||'Term')+' - '+(f.recommendedAction||f.impact||'');});
  var to=(typeof SUPPLIER_CONTACT!=='undefined')?SUPPLIER_CONTACT.email:'supplier';
  CHAT.push(aiMsg('Drafted a vendor response from the review findings and redlines. It is in Drafts for your review - nothing is sent on your behalf.',{draft:{to:to,subj:'RE: '+P.title+' - our position on the open terms',body:'Hi,\n\nThank you for the latest turn. Our position on the open protection points:\n\n'+lines.join('\n')+'\n\nHappy to walk through any of these.\n\nBest,\nMarc'}}));
  if(typeof renderChat==='function')renderChat(($('#csearch')||{}).value||'');
 }
 toast('Vendor response drafted - in Drafts for your review. Draft-only; nothing sent.');
}
// Obligation registration from the review was removed: obligations are registered by the system at
// execution, not as a manual user action. The manual "Register obligations from review" flow is gone.
// ---- A: CDR Phase-4 one-screen batch confirm (progressive disclosure) -------------
function cdrProvLabel(p){var m={'deterministic-capture':'captured','human-entered':'you entered','extracted':'extracted from PDF','leah-enriched':'from LEAH','system':'system'};return m[p]||(p||'captured');}
function cdrFmt(v){
 if(v==null)return '';
 if(typeof v==='boolean')return v?'Yes':'No';
 if(typeof v==='number')return String(v);
 if(typeof v==='string')return v;
 if(typeof v==='object'){
  if(v.noticeDeadlineISO||v.nextRenewalEffectiveISO||v.currentExpiryISO){var parts=[];if(v.noticeDeadlineISO)parts.push('notice by '+v.noticeDeadlineISO);if(v.nextRenewalEffectiveISO)parts.push('renews '+v.nextRenewalEffectiveISO);if(v.currentExpiryISO)parts.push('expires '+v.currentExpiryISO);return parts.join(' | ');}
  if(v.years!=null||v.months!=null)return ((v.years?v.years+' yr':'')+(v.months?' '+v.months+' mo':'')).trim();
  try{return JSON.stringify(v).slice(0,120);}catch(e){return String(v);}
 }
 return String(v);
}
// decision: an auto-accepted field (collapsed) is non-critical, deterministic, high
// confidence, cross-check agrees (mirrors domain trustTier). Always-confirm fields and
// low-confidence / discrepancy fields are NOT auto-accepted -> they surface up front.
function cdrAutoAccept(r){var m=r.meta||{};if(r.always)return false;if(m.discrepancy)return false;var det=(m.provenance==='deterministic-capture'||m.provenance==='human-entered');var conf=(typeof m.confidence==='number'?m.confidence:0)>=0.9;return det&&conf;}
function cdrDemoRows(){
 return [
  {id:'r-counterparty',path:'counterparty.legalEntity',label:'Counterparty legal entity',display:'Acme Analytics, Inc.',always:true,src:'MSA (2024) executed PDF',
   meta:{provenance:'deterministic-capture',confidence:0.96,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-expiry',path:'dates.expirationDate',label:'Expiration / term-end',display:'2027-08-01',always:true,src:'Amendment 2, Term',
   meta:{provenance:'deterministic-capture',confidence:0.93,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-autorenew',path:'renewal.autoRenews',label:'Auto-renewal',display:'Yes - auto-renews for successive 1-year terms',always:true,fire:true,src:'Base MSA, Renewal',
   meta:{provenance:'deterministic-capture',confidence:0.88,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-renewaldate',path:'dates.renewalDate',label:'Renewal date',display:'2027-08-01',always:true,fire:true,src:'Amendment 2, Term',
   meta:{provenance:'deterministic-capture',confidence:0.90,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-notice',path:'renewal.renewalDates',label:'Notice deadline',display:'2027-05-03 (90-day non-renewal notice)',always:true,fire:true,src:'Amendment 2, Renewal',
   meta:{provenance:'deterministic-capture',confidence:0.82,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-window',path:'renewal.noticeWindowDays',label:'Notice window',display:'120-day decision window (opens 2027-04-03)',always:true,fire:true,
   meta:{provenance:'deterministic-capture',confidence:0.80,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-value',path:'contract.totalValue',label:'Total contract value',display:'$1,800,000 (3-yr TCO)',always:true,src:'Amendment 1, Pricing',
   meta:{provenance:'deterministic-capture',confidence:0.90,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-commodity',path:'commodity.primaryCode',label:'Primary commodity code',display:'IT-SAAS-ANALYTICS (L3)',always:true,candidates:['IT-SAAS-ANALYTICS','IT-SAAS-HR','IT-SAAS-BI'],
   meta:{provenance:'deterministic-capture',confidence:0.74,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-fee',path:'pricing.annualFee',label:'Annual fee',display:'$600,000 / yr',src:'Amendment 1, Pricing',
   meta:{provenance:'deterministic-capture',confidence:0.86,confirmed:false,verifyBeforeRelying:true,discrepancy:{capturedValue:'$600,000 / yr',extractedValue:'$620,000 / yr',severity:'warning'}}},
  {id:'r-noticemethod',path:'renewal.noticeMethod',label:'Notice method',display:'Email (to the Acme contract contact)',src:'notices clause',
   meta:{provenance:'extracted',confidence:0.50,confirmed:false,verifyBeforeRelying:true}},
  {id:'r-effective',path:'dates.effectiveDate',label:'Effective date',display:'2024-08-01',
   meta:{provenance:'deterministic-capture',confidence:0.97,confirmed:false,verifyBeforeRelying:false}},
  {id:'r-currency',path:'pricing.baseCurrency',label:'Currency',display:'USD',
   meta:{provenance:'deterministic-capture',confidence:0.99,confirmed:false,verifyBeforeRelying:false}},
  {id:'r-payment',path:'pricing.paymentTerms',label:'Payment terms',display:'Net 45',
   meta:{provenance:'deterministic-capture',confidence:0.95,confirmed:false,verifyBeforeRelying:false}},
  {id:'r-renewterm',path:'renewal.renewalTerm',label:'Renewal term',display:'1 year',
   meta:{provenance:'deterministic-capture',confidence:0.92,confirmed:false,verifyBeforeRelying:false}},
  {id:'r-governing',path:'family.governingAgreement',label:'Governing agreement',display:'Acme MSA (2024)',
   meta:{provenance:'deterministic-capture',confidence:0.96,confirmed:false,verifyBeforeRelying:false}}
 ];
}
function cdrMetaClean(m,rv){var src=(rv&&rv.meta)?rv.meta:(m||{});return {provenance:src.provenance||'extracted',confidence:(typeof src.confidence==='number'?src.confidence:0.5),confirmed:!!src.confirmed,verifyBeforeRelying:src.verifyBeforeRelying!==false,discrepancy:src.discrepancy||null};}
// Best-effort adapter for the LIVE folded EffectiveCdr ({snapshot, log, resolved}).
// Reads known CdrField cluster locations; overlays confirmed values from resolved by
// field-path (which is exactly what confirm entries re-use). Returns null on any
// shortfall so the demo CDR stays intact. NEVER throws (caller wraps in try/catch).
function cdrNormalizeLive(cdr){
 if(!cdr||typeof cdr!=='object')return null;
 var snap=cdr.snapshot||cdr;var resolved=cdr.resolved||{};
 var rows=[];
 function pushCF(path,label,cf,always,fire,cands){
  var rv=resolved[path];
  var val=(rv&&'value' in rv)?rv.value:(cf?cf.value:undefined);
  if(val===undefined||val===null)return;
  rows.push({id:'live-'+path.replace(/[^a-z0-9]+/gi,'-'),path:path,label:label,display:cdrFmt(val),always:!!always,fire:!!fire,candidates:cands||null,meta:cdrMetaClean(cf?cf.meta:null,rv)});
 }
 var dates=snap.dates||{},ren=snap.renewal||{};
 if(snap.parties&&snap.parties.value){var pa=snap.parties.value;var cp=Array.isArray(pa)?pa.filter(function(p){return p&&p.role==='counterparty';})[0]:null;if(cp)rows.push({id:'live-parties',path:'parties',label:'Counterparty legal entity',display:cdrFmt(cp.legalEntityName||cp.name||''),always:true,meta:cdrMetaClean(snap.parties.meta,resolved['parties'])});}
 pushCF('dates.expirationDate','Expiration / term-end',dates.expirationDate,true,true);
 pushCF('dates.renewalDate','Renewal date',dates.renewalDate,true,true);
 pushCF('renewal.autoRenews','Auto-renewal',ren.autoRenews,true,true);
 pushCF('renewal.renewalDates','Notice / renewal dates',ren.renewalDates,true,true);
 pushCF('renewal.noticeWindowDays','Notice window',ren.noticeWindowDays,true,true);
 pushCF('renewal.noticeMethod','Notice method',ren.noticeMethod,false,false);
 pushCF('dates.effectiveDate','Effective date',dates.effectiveDate,false,false);
 if(snap.commodityTags){var ct=snap.commodityTags;var codes=ct.commodityCodes||ct.codes||[];var prim=(Array.isArray(codes)&&codes.length)?codes[0]:null;if(prim)rows.push({id:'live-commodity',path:'commodityTags',label:'Primary commodity code',display:cdrFmt((prim&&prim.value)?prim.value:prim),always:true,candidates:(Array.isArray(codes)?codes.slice(0,4).map(function(c){return (c&&c.value)?c.value:c;}):null),meta:cdrMetaClean((prim&&prim.meta)||ct.meta,resolved['commodityTags'])});}
 if(snap.pricing&&typeof snap.pricing==='object'){var pv=(snap.pricing.contractValue!=null)?snap.pricing.contractValue:((snap.pricing.totalValue!=null)?snap.pricing.totalValue:null);if(pv!=null)rows.push({id:'live-value',path:'pricing.contractValue',label:'Total contract value',display:cdrFmt(pv),always:true,meta:cdrMetaClean((snap.overlay&&snap.overlay['/pricing/contractValue'])||null,resolved['pricing.contractValue'])});}
 return rows.length?rows:null;
}
function cdrRowHTML(r){
 var m=r.meta||{};
 var badge=m.discrepancy?'<span class="cdrbadge neutral">cross-check differs</span>':(m.confidence>=0.9?'<span class="cdrbadge trust">high confidence</span>':(m.confidence>=0.7?'<span class="cdrbadge watch">medium confidence</span>':'<span class="cdrbadge watch">low confidence</span>'));
 var prov='<span class="cdrbadge neutral">'+escapeHtmlPV(cdrProvLabel(m.provenance))+'</span>';
 var always=r.always?'<span class="cdrbadge neutral">always confirm</span>':'';
 var confPct=(typeof m.confidence==='number')?(Math.round(m.confidence*100)+'% confidence'):'';
 var src=r.src?(' - source '+escapeHtmlPV(r.src)):'';
 var fireNote=r.fire?'<span class="cdrunconf"> - unconfirmed, will not trigger reminders</span>':'';
 var disc=m.discrepancy?('<div class="cdrdisc">Captured <b>'+escapeHtmlPV(cdrFmt(m.discrepancy.capturedValue))+'</b>; executed PDF reads <b>'+escapeHtmlPV(cdrFmt(m.discrepancy.extractedValue))+'</b>. Shown neutrally - confirm the correct value.</div>'):'';
 var cands=(r.candidates&&r.candidates.length)?('<div class="cdracts" style="margin:2px 0 8px">'+r.candidates.map(function(c){return '<button type="button" class="cdrchip'+((''+r.display).indexOf(c)>=0?' on':'')+'" data-cdr-cand-row="'+escapeHtmlPV(r.id)+'" data-cdr-cand="'+escapeHtmlPV(c)+'">'+escapeHtmlPV(c)+'</button>';}).join('')+'</div>'):'';
 var acts='<button type="button" class="btn btn-primary btn-sm" data-cdr-confirm="'+escapeHtmlPV(r.id)+'">Confirm</button><button type="button" class="btn btn-ghost btn-sm" data-cdr-edit="'+escapeHtmlPV(r.id)+'">Edit</button>';
 return '<div class="cdrrow"><div class="cdrrh"><span class="cdrlbl">'+escapeHtmlPV(r.label)+'</span><span style="margin-left:auto;display:inline-flex;gap:6px;flex-wrap:wrap">'+badge+prov+always+'</span></div>'+
  '<div class="cdrval">'+escapeHtmlPV(r.display)+fireNote+'</div>'+
  ((confPct||src)?('<div class="cdrmeta">'+confPct+src+'</div>'):'')+
  disc+cands+
  '<div class="cdracts">'+acts+'</div></div>';
}
function cdrListsHTML(rows){
 rows=rows||[];
 var confirmedRows=rows.filter(function(r){return r.meta&&r.meta.confirmed;});
 var autoRows=rows.filter(function(r){return !(r.meta&&r.meta.confirmed)&&cdrAutoAccept(r);});
 var surfaced=rows.filter(function(r){return !(r.meta&&r.meta.confirmed)&&!cdrAutoAccept(r);});
 var out='<div class="cdrgate"><b style="color:var(--plum)">Release gate.</b> A notice or renewal reminder fires only after the underlying date is confirmed here. A high-confidence capture alone does not trigger automation; confirming a date is what lets Theo remind you.</div>';
 out+='<div class="sect"><div class="secthd"><div class="t">Needs your attention</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+surfaced.length+' field'+(surfaced.length===1?'':'s')+' to confirm</span></div>';
 out+=surfaced.length?surfaced.map(cdrRowHTML).join(''):'<div class="cdraccepted"><span class="cdrbadge trust">all clear</span><span>Every field that needs attention is confirmed.</span></div>';
 out+='</div>';
 if(confirmedRows.length){
  out+='<div class="sect"><div class="secthd"><div class="t">Confirmed by you</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+confirmedRows.length+'</span></div>'+
   confirmedRows.map(function(r){return '<div class="cdraccepted"><span class="cdrbadge trust">confirmed</span><span style="font-weight:600">'+escapeHtmlPV(r.label)+'</span><span style="color:var(--mut2);margin-left:auto">'+escapeHtmlPV(r.display)+'</span><button type="button" class="btn btn-ghost btn-sm" data-cdr-edit="'+escapeHtmlPV(r.id)+'" style="margin-left:8px">Edit</button></div>';}).join('')+
   '<div class="spnote">Confirmed values are recorded append-only. A date confirmed here can drive reminders; edit to file a correction.</div></div>';
 }
 out+='<div style="margin:10px 0"><a class="dlk" style="color:#2B579A;display:inline-flex;align-items:center;gap:6px" href="'+escapeHtmlPV(safeHref(CDR_DOC_URL))+'" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="#2B579A" stroke-width="2" style="width:14px;height:14px"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/></svg>Open the executed contract in Word</a> <span style="font-size:var(--fz-meta);color:var(--mut2)">the source document; Theo never edits it in-app</span></div>';
 if(autoRows.length){
  out+='<div class="sect"><div class="secthd"><div class="t">Auto-accepted</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+autoRows.length+' confident, non-critical</span></div>'+
   '<details><summary style="cursor:pointer;font-size:12.5px;color:var(--bblue,var(--plum));font-weight:600;margin:0 0 8px">Show auto-accepted fields</summary>'+
   autoRows.map(function(r){return '<div class="cdraccepted"><span class="cdrbadge trust">accepted</span><span style="font-weight:600">'+escapeHtmlPV(r.label)+'</span><span style="color:var(--mut2);margin-left:auto">'+escapeHtmlPV(r.display)+'</span></div>';}).join('')+
   '</details><div class="spnote">These met the auto-accept bar: deterministic capture, cross-check agreement, high confidence, and not in the always-confirm set. Recorded without review; open any in Word to verify.</div></div>';
 }
 return out;
}
function cdrRerender(){var h=document.getElementById('cdrHost');if(h)h.innerHTML=cdrListsHTML(DEAL_CDR_ROWS||[]);}
// E11: the CDR confirm screen opens from the pre-execution gate (a rep-owned PR-gate task) - it is
// NOT a Deal sub-tab. Reuses cdrListsHTML + the delegated confirm/edit handlers (the #cdrHost id).
window.openCdrConfirm=function(){
 ensureCdrCss();
 if(DEAL_CDR_PROJ!==CURPROJ){DEAL_CDR_PROJ=CURPROJ;DEAL_CDR_ROWS=null;}
 if(!DEAL_CDR_ROWS)DEAL_CDR_ROWS=cdrDemoRows();
 var body='<p class="narr" style="margin-top:0">Theo captured this contract\'s data at finalization. Confirm the fields that gate automation before the PR goes to ATC/ATS - this is the pre-execution gate. Reflect-only; nothing fires until a date is confirmed, and the document opens in Word.</p><div id="cdrHost">'+cdrListsHTML(DEAL_CDR_ROWS)+'</div>';
 $('#drawer').innerHTML='<div class="dh"><div><h3>Confirm contract data</h3><div class="dsub">Pre-execution gate · required before Lilly execution</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db">'+body+'</div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');
};
function dealCdrExtras(){
 ensureCdrCss();
 if(DEAL_CDR_PROJ!==CURPROJ){DEAL_CDR_PROJ=CURPROJ;DEAL_CDR_ROWS=null;DEAL_CDR_CID=null;DEAL_CDR_VID=null;}
 if(!DEAL_CDR_ROWS)DEAL_CDR_ROWS=cdrDemoRows();
 var P=PROJECTS[CURPROJ]||{};
 var h='<p class="dashintro"><b>Contract data - '+escapeHtmlPV(P.supplier||'')+'</b> - the structured record captured at finalization. Confirm the fields that gate automation; the rest were auto-accepted. Reflect-only; nothing fires until a date is confirmed, and the document opens in Word.</p>';
 h+='<div id="cdrHost">'+cdrListsHTML(DEAL_CDR_ROWS)+'</div>';
 return h;
}
async function dealCdrLoad(){
 if(curtab!=='deal'||DEAL_MODE!=='cdr')return;
 if(!window.LillyAPI||!LillyAPI.configured||!LillyAPI.configured())return; // offline -> demo stays
 var mm=(location.hash||'').match(/p=([a-z0-9_-]+)/i);var id=mm&&mm[1];
 if(!id||PROJECTS[id])return; // canned example -> demo stays
 var cv=await LillyAPI.tryLive(function(){return LillyAPI.listVersions(id);},null);
 var vid='';
 if(cv.source==='live'&&cv.data&&Array.isArray(cv.data.versions)&&cv.data.versions.length){var fin=cv.data.versions.filter(function(v){return v.final;});var pick=fin.length?fin[fin.length-1]:cv.data.versions[cv.data.versions.length-1];vid=pick.versionId||pick.id||'';}
 var r=await LillyAPI.tryLive(function(){return LillyAPI.getCdr(id,vid);},null);
 if(r.source!=='live'||!r.data)return; // no live CDR -> keep demo
 var cdr=(r.data&&r.data.cdr!==undefined)?r.data.cdr:r.data;
 var rows=null;try{rows=cdrNormalizeLive(cdr);}catch(e){rows=null;}
 if(!rows||!rows.length)return; // could not normalize -> keep demo
 DEAL_CDR_ROWS=rows;DEAL_CDR_CID=id;DEAL_CDR_VID=vid;DEAL_CDR_PROJ=CURPROJ;
 var host=document.getElementById('cdrHost');if(host)host.innerHTML=cdrListsHTML(rows);
}
async function cdrConfirmRow(id){
 var r=(DEAL_CDR_ROWS||[]).filter(function(x){return x.id===id;})[0];if(!r)return;
 if(DEAL_CDR_CID){await LillyAPI.tryLive(function(){return LillyAPI.cdrConfirm(DEAL_CDR_CID,{versionId:DEAL_CDR_VID,entries:[{fieldPath:r.path,action:'confirm'}]});},{ok:true});}
 var nm=Object.assign({},r.meta);nm.confirmed=true;nm.verifyBeforeRelying=false;delete nm.discrepancy;r.meta=nm;
 cdrRerender();
 toast('Confirmed "'+r.label+'".'+(r.fire?' This date can now drive reminders.':'')+' Reflect-only; nothing sent.');
}
function cdrEditRow(id){
 var r=(DEAL_CDR_ROWS||[]).filter(function(x){return x.id===id;})[0];if(!r)return;
 var v=window.prompt('Corrected value for "'+r.label+'":',r.display);
 if(v==null)return;v=(''+v).trim();if(!v)return;
 if(DEAL_CDR_CID){LillyAPI.tryLive(function(){return LillyAPI.cdrConfirm(DEAL_CDR_CID,{versionId:DEAL_CDR_VID,entries:[{fieldPath:r.path,action:'correct',value:v,reason:'human correction on confirm screen'}]});},{ok:true});}
 r.display=v;var nm=Object.assign({},r.meta);nm.confirmed=true;nm.verifyBeforeRelying=false;nm.provenance='human-entered';delete nm.discrepancy;r.meta=nm;
 cdrRerender();
 toast('Corrected "'+r.label+'" to "'+v+'". Recorded as a human entry; reflect-only.');
}
function cdrPickCandidate(rowId,code){
 var r=(DEAL_CDR_ROWS||[]).filter(function(x){return x.id===rowId;})[0];if(!r)return;
 r.display=code+' (L3)';
 cdrRerender();
 toast('Primary commodity set to '+code+'. Confirm to record; the rep owns this pick.');
}
// post-render hook: kick off the async live loads for the active Deal sub-mode.
function dealPostRender(){
 if(curtab!=='deal')return;
 if(DEAL_MODE==='cdr')dealCdrLoad();
 else if(DEAL_MODE==='review')dealReviewLoad();
 dealPrepLoad();   // prep summary card (no-ops unless its host is mounted in this mode)
 dealProFormaLoad();   // pro-forma / TCO card (no-ops unless its host is mounted in this mode)
}
// ONE delegated listener for all new interactive elements (no inline on*= carrying data).
document.addEventListener('click',function(e){
 var t=e.target;if(!t||!t.closest)return;
 var el;
 if((el=t.closest('[data-leah]'))){e.preventDefault();toast('Opening in LEAH, the CLM system of record. Theo reflects; LEAH owns the contract.');return;}
 if((el=t.closest('[data-vendor-resp]'))){e.preventDefault();dealDraftVendorResponse();return;}
 if((el=t.closest('[data-cdr-cand]'))){e.preventDefault();cdrPickCandidate(el.getAttribute('data-cdr-cand-row'),el.getAttribute('data-cdr-cand'));return;}
 if((el=t.closest('[data-cdr-confirm]'))){e.preventDefault();cdrConfirmRow(el.getAttribute('data-cdr-confirm'));return;}
 if((el=t.closest('[data-cdr-edit]'))){e.preventDefault();cdrEditRow(el.getAttribute('data-cdr-edit'));return;}
});
// Renewal fast path (admin-gated, default-off): runs the eligibility check, surfaces any flagged
// item to the approvers with reject/accept/revise/open-full, and requires BO + Rep sign-off. The
// fast path only proceeds when EVERY condition holds; otherwise it routes to the approvers.
var RENEW_FASTPATH=_PVRR.renewFastpath||{settingOn:false,checks:[]};
var FP_APPR={bo:false,rep:false};
function renewFastPathHTML(){
 var R=RENEW_FASTPATH;var flags=R.checks.filter(function(c){return !c.ok;});var qualifies=flags.length===0;
 var head= qualifies
  ? '<div class="fpbanner ok"><b>Eligible for the fast path.</b> Every condition holds. Approve to renew on the existing terms; the project owner and the sourcing rep both sign off.</div>'
  : '<div class="fpbanner warn"><b>'+flags.length+' item'+(flags.length>1?'s':'')+' need review before this can fast-track.</b> The fast path only proceeds when every condition holds, so this routes to the approvers with the flags below. Nothing renews automatically.</div>';
 var rows=R.checks.map(function(c){return '<div class="fprow '+(c.ok?'ok':'flag')+'"><span class="fpi">'+(c.ok?'✓':'⚑')+'</span><div class="fpm"><div class="fpk">'+c.k+'</div><div class="fpn">'+c.note+'</div>'+(c.ok?'':'<div class="fpacts"><button class="btn btn-ghost btn-sm" onclick="fpAct(\'reject\')">Reject</button><button class="btn btn-ghost btn-sm" onclick="fpAct(\'accept\')">Accept</button><button class="btn btn-ghost btn-sm" onclick="fpAct(\'revise\')">Small revision</button><button class="btn btn-ghost btn-sm" onclick="fpAct(\'full\')">Open full negotiation</button></div>')+'</div></div>';}).join('');
 var gate='<div class="fpgate"><div class="fpgh">Final approval · both the project owner and the sourcing rep required</div><div class="fpapprovers"><button class="btn btn-ghost btn-sm" onclick="fpApprove(\'bo\',this)">Project owner approves</button><button class="btn btn-ghost btn-sm" onclick="fpApprove(\'rep\',this)">Sourcing Rep approves</button></div><div class="fpgnote">'+(qualifies?'Both approvals execute the renewal. Nothing is sent on your behalf until then.':'Resolve the flagged items first; both approvers still sign off before anything executes.')+'</div></div>';
 var ctl='<div class="dealcancel"><a class="dlk" onclick="toast(\'Opened the full renewal negotiation (demo)\');return false;">Open full process →</a><a class="dlk" style="color:var(--riskred)" onclick="toast(\'Cancelled the renewal fast path (demo)\');return false;">Cancel</a></div>';
 var offer='<div style="font-size:12.5px;color:var(--mut,#4A4540);line-height:1.5;margin-bottom:11px">Theo is <b>offering</b> this fast path because the renewal notice window is open and the eligibility check below has run. It proceeds only if <b>both the project owner and the sourcing rep approve</b>.</div>';
 return '<div class="sect"><div class="secthd"><div class="t">Renewal fast path</div><span class="autopill '+(R.settingOn?'live':'off')+'">'+(R.settingOn?'Enabled':'Off · set in Admin')+'</span></div><div class="card">'+offer+head+'<div class="fplist">'+rows+'</div>'+gate+ctl+'</div></div>';
}
function fpAct(a){var m={reject:'Rejected the change',accept:'Accepted the change',revise:'Requested a small revision',full:'Opened full negotiation on this item'};toast((m[a]||'Noted')+' (demo) · recorded for the approvers');}
function fpApprove(who,btn){FP_APPR[who]=true;btn.textContent=(who==='bo'?'Project owner':'Sourcing Rep')+' approved ✓';btn.disabled=true;btn.style.opacity='.7';if(FP_APPR.bo&&FP_APPR.rep){toast('Both the project owner and the sourcing rep signed off · the renewal would execute (demo). Nothing is sent on your behalf.');}else{toast((who==='bo'?'Project owner':'Sourcing Rep')+' approved · waiting on the other approver.');}}
// ===== Wave 4b: renewal decision-intelligence matrix (reflect-only) =====
// Scoped CSS, injected once. No green: blue var(--plum) = renew/keep/measured/healthy;
// amber = renegotiate/recompete/caution/assessed; red = terminate/recompete/at-risk/fired.
function ensureRenewMatrixCss(){ if(document.getElementById('rnx-css'))return; var s=document.createElement('style'); s.id='rnx-css'; s.textContent=
 '.rnxwrap{display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:start}@media(max-width:860px){.rnxwrap{grid-template-columns:1fr}}'+
 '.rnxmxblock{display:flex;gap:8px}.rnxmy{display:flex;align-items:center;justify-content:center}'+
 '.rnxmylab{writing-mode:vertical-rl;transform:rotate(180deg);font:600 9px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--mut2,#8A827C)}'+
 '.rnxmcol{display:flex;flex-direction:column}'+
 '.rnxmatrix{position:relative;width:300px;height:300px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;border:1px solid var(--line2,#DCD8D2);border-radius:10px;overflow:hidden}'+
 '@media(max-width:760px){.rnxmatrix{width:240px;height:240px}}'+
 '.rnxcell{padding:10px;display:flex;flex-direction:column;gap:4px;border:1px solid var(--line,#EEE);background:var(--surface)}'+
 '.rnxcell .rq{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:var(--mut2,#8A827C)}'+
 '.rnxcell .rt{font:700 12px var(--sans,system-ui,sans-serif);color:var(--mut2,#8A827C)}'+
 '.rnxcell.on.good{background:var(--blue-t,#E4EBF1)}.rnxcell.on.good .rt{color:var(--plum)}'+
 '.rnxcell.on.warn{background:var(--amber-t,#FBF1DA)}.rnxcell.on.warn .rt{color:var(--amber-d,#8A5A00)}'+
 '.rnxcell.on.bad{background:var(--pink-t,#FBE7E3)}.rnxcell.on.bad .rt{color:var(--red,#C8202E)}'+
 '.rnxdot{position:absolute;width:20px;height:20px;border-radius:50%;background:var(--plum);border:3px solid #fff;box-shadow:0 0 0 1.5px var(--plum);transform:translate(-50%,-50%);z-index:3}'+
 '.rnxmx{text-align:center;font:600 9px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--mut2,#8A827C);margin-top:6px}'+
 '.rnxlead{border:1px solid var(--line2,#DCD8D2);border-radius:11px;overflow:hidden}'+
 '.rnxlead .rlh{display:flex;align-items:center;gap:8px;padding:10px 13px;border-bottom:1px solid var(--line,#EEE)}'+
 '.rnxlead.warn .rlh{background:var(--amber-t,#FBF1DA)}.rnxlead.good .rlh{background:var(--blue-t,#E4EBF1)}.rnxlead.bad .rlh{background:var(--pink-t,#FBE7E3)}'+
 '.rnxlead .rlt{font:700 13.5px var(--sans,system-ui,sans-serif);color:var(--ink,#1A1A1A)}.rnxlead .rlb{padding:12px 13px}'+
 '.rnxstat{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:11px}'+
 '.rnxsb{border:1px solid var(--line,#EEE);border-radius:9px;padding:8px 10px;background:var(--bg,#FBFAF9)}'+
 '.rnxsb .l{font:700 8.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2,#8A827C)}'+
 '.rnxsb .v{font:800 15px var(--sans,system-ui,sans-serif);margin-top:3px;letter-spacing:-.01em;line-height:1.1}.rnxsb .v small{font-size:11px;font-weight:600;color:var(--mut2,#8A827C)}'+
 '.rnxfocus{display:inline-block;font:600 10px var(--mono,monospace);color:var(--amber-d,#8A5A00);background:var(--amber-t,#FBF1DA);border:1px solid #E7C66B;border-radius:30px;padding:3px 9px;margin:6px 6px 0 0}'+
 '.rnxalt{font-size:12px;color:var(--mut,#3E3933);margin-top:9px;line-height:1.5}.rnxalt b{color:var(--ink,#1A1A1A)}'+
 '.rnxtbl{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:4px}'+
 '.rnxtbl th{font:600 8.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2,#8A827C);text-align:left;padding:0 10px 8px}'+
 '.rnxtbl th.c,.rnxtbl td.c{text-align:center}.rnxtbl tbody tr{border-top:1px solid var(--line,#EEE)}'+
 '.rnxtbl td{padding:8px 10px;vertical-align:top;color:var(--ink,#1A1A1A)}'+
 '.rnxtbl td .fac{font-size:11px;color:var(--mut,#3E3933);font-weight:400;margin-top:3px;line-height:1.45}'+
 '.rnxtbl tfoot td{border-top:2px solid var(--line2,#DCD8D2);padding:8px 10px;font:600 11.5px var(--sans,system-ui,sans-serif)}'+
 '.rnxb{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;border-radius:30px;padding:2px 8px;white-space:nowrap}'+
 '.rnxb.meas{color:var(--plum);background:var(--blue-t,#E4EBF1)}.rnxb.assd{color:var(--amber-d,#8A5A00);background:var(--amber-t,#FBF1DA)}.rnxb.est{color:var(--mut2,var(--mut2));background:var(--tint-f2eeee,#F2EEEE)}'+
 '.rnxrow{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.5;padding:9px 11px;border-radius:9px;border:1px solid var(--line,#EEE);margin-bottom:7px;background:var(--surface)}'+
 '.rnxrow .rd{width:9px;height:9px;border-radius:50%;flex:none;margin-top:5px;background:var(--mut2,#8A827C)}'+
 '.rnxrow.bad{border-color:#F2C9C6;background:var(--pink-t,#FBE7E3)}.rnxrow.bad .rd{background:var(--red,#C8202E)}'+
 '.rnxrow.warn{border-color:#E7C66B;background:var(--amber-t,#FBF1DA)}.rnxrow.warn .rd{background:var(--amber-d,#8A5A00)}'+
 '.rnxrow.good{border-color:#C6D7EF;background:var(--surface)}.rnxrow.good .rd{background:var(--plum)}'+
 '.rnxrow.clear{opacity:.72}.rnxrow.clear .rd{background:var(--plum)}'+
 '.rnxrow .lv{font:700 8.5px var(--mono,monospace);letter-spacing:.03em;text-transform:uppercase;color:var(--mut2,#8A827C);display:block;margin-top:4px}'+
 '.rnxsplit{display:grid;grid-template-columns:1fr 1fr;gap:20px}@media(max-width:760px){.rnxsplit{grid-template-columns:1fr}}'+
 '.rnxtime{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}@media(max-width:760px){.rnxtime{grid-template-columns:repeat(2,1fr)}}'+
 '.rnxfoot{font:500 10.5px var(--mono,monospace);color:var(--mut2,#8A827C);margin-top:10px;line-height:1.5}'+
 '.rnxbundle{display:flex;gap:9px;align-items:flex-start;background:var(--blue-t,#E4EBF1);border:1px solid #C6D7EF;border-radius:10px;padding:10px 12px;margin-top:10px;font-size:12px;line-height:1.5;color:var(--ink,#1A1A1A)}'+
 '.rnxbchip{display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--plum);background:var(--surface);border:1px solid #C6D7EF;border-radius:30px;padding:2px 8px;margin-right:6px}'+
 '.rnxconf{display:inline-flex;align-items:center;gap:6px;font:700 11px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;border-radius:30px;padding:3px 11px}'+
 '.rnxconf.high{color:var(--plum);background:var(--blue-t,#E4EBF1)}.rnxconf.med{color:var(--amber-d,#8A5A00);background:var(--amber-t,#FBF1DA)}.rnxconf.low{color:var(--red,#C8202E);background:var(--pink-t,#FBE7E3)}'+
 '.rnxcaveat{font-size:11.5px;color:var(--mut,#3E3933);background:var(--bg,#FBFAF9);border:1px solid var(--line,#EEE);border-left:3px solid var(--plum);border-radius:9px;padding:9px 12px;margin-top:11px;line-height:1.5}.rnxcaveat b{color:var(--ink,#1A1A1A)}'+
 '.recpill.terminate{color:var(--red,#C8202E);background:var(--pink-t,#FBE7E3)}'
 ; document.head.appendChild(s);
}
var RNX_FOCUS={commercial:'Commercial · price / CPI cap',legal:'Legal · sub-processor & liability',scope:'Scope · services & SLAs in-scope',performance:'Performance · SLA / KPI regime'};
var RNX_REC={'renew-as-is':'Renew as-is',renew:'Renew as-is',renegotiate:'Renegotiate',recompete:'Recompete',terminate:'Terminate'};
var RNX_QUAD={renew:'tl','renew-as-is':'tl',renegotiate:'tr',recompete:'br',terminate:'bl',exit:'bl'};
// weighted aggregate of an axis' dimensions; a missing/NaN score sits at the neutral 3.0
function rnxAgg(dims){var ws=0,acc=0;(dims||[]).forEach(function(d){var w=Number(d.weight)||0;var s=Number(d.score);if(!isFinite(s))s=3;acc+=s*w;ws+=w;});return ws?acc/ws:0;}
function rnxPerfBand(s){return s>=3.6?'strong':s>=3.0?'adequate':s>=2.2?'weak':'poor';}
function rnxMktBand(s){return s>=3.6?'high':s>=3.0?'moderate':s>=2.2?'low':'thin';}
function rnxColor(s){return s>=3.6?'var(--plum)':s>=3.0?'var(--amber-d,#8A5A00)':'var(--red,#C8202E)';}   // never green
function rnxRecTone(r){return (r==='renew'||r==='renew-as-is')?'good':(r==='terminate'||r==='recompete')?'bad':'warn';}
function rnxBasisCls(b){return b==='measured'?'meas':b==='estimated'?'est':'assd';}
function rnxNum(n,dp){var v=Number(n);if(!isFinite(v))return '—';return dp!=null?v.toFixed(dp):String(v);}
function rnxSupplier(){return (typeof PROJECTS!=='undefined'&&PROJECTS[CURPROJ]&&PROJECTS[CURPROJ].supplier)||'this supplier';}
// working-backward runway: does the notice window cover the days the recommended action needs?
function rnxTiming(m){
 var t=(m&&m.timing)||{};var DAY=86400000;
 var asOf=Date.parse((t.asOf||'')+'T00:00:00'),exp=Date.parse((t.expiryISO||'')+'T00:00:00');
 var nd=Number(t.noticeDays)||0,need=Number(t.requiredLeadDays)||0,ok=isFinite(asOf)&&isFinite(exp);
 var daysToExpiry=ok?Math.round((exp-asOf)/DAY):null;
 var noticeMs=ok?exp-nd*DAY:null;
 var daysToNotice=ok?Math.round((noticeMs-asOf)/DAY):null;
 var noticeISO=ok?new Date(noticeMs).toISOString().slice(0,10):null;
 var available=daysToNotice,atRisk=(available!=null)&&(available<need),shortfall=atRisk?(need-available):0;
 return {daysToExpiry:daysToExpiry,daysToNotice:daysToNotice,noticeISO:noticeISO,need:need,available:available,atRisk:atRisk,shortfall:shortfall};
}
// confidence from how many of the 11 matrix signals are ESTIMATED (vs measured/assessed)
function rnxConf(m){var dims=(m.performance.dims||[]).concat(m.market.dims||[]);var total=dims.length;var est=dims.filter(function(d){return d.basis==='estimated';}).length;var conf=est===0?'high':est<=2?'medium-high':est<=4?'medium':'low';var cls=conf==='high'?'high':conf==='low'?'low':'med';return {total:total,est:est,conf:conf,cls:cls};}
// the seven escalation triggers, each evaluated against this contract's signals
function rnxTriggers(m,tim){
 var rec=m.recommendation,val=Number(m.annualValueUsd)||0,share=Number(m.spendSharePct)||0;
 return [
  {k:'Contract value over $5M',lvl:'Procurement Director',fired:val>5000000,r:'Annual value $'+Math.round(val/1000)+'K is '+(val>5000000?'above':'below')+' the $5M threshold.'},
  {k:'Recommendation is RECOMPETE',lvl:'Category Lead',fired:rec==='recompete',r:'The recommended action is '+(RNX_REC[rec]||rec)+', not a recompete.'},
  {k:'TERMINATE with no viable alternative',lvl:'Category Lead + Legal',fired:rec==='terminate'&&!m.alternative,r:rec==='terminate'?'Terminate recommended.':'Not a termination, no forced exit.'},
  {k:'Sole-source concentration over 20%',lvl:'Category Lead',fired:share>20,r:'Supplier is ~'+share+'% of category spend ('+(share>20?'above':'under')+' the 20% concentration bar).'},
  {k:'High-severity compliance gap (>$100K exposure)',lvl:'Privacy Office + Procurement Director',fired:!!m.complianceGapHighSeverity,r:m.complianceGapHighSeverity?'Open sub-processor control gap is high severity and unresolved at the renewal decision.':'No high-severity compliance gap open.'},
  {k:'Conflicts with category strategy',lvl:'Category Lead',fired:!!m.strategyConflict,r:m.strategyConflict?'Renewal conflicts with the stated category strategy.':'No conflict with the category strategy on file.'},
  {k:'Notice under 30 days with no decision',lvl:'Procurement Director',fired:(tim.daysToNotice!=null&&tim.daysToNotice<30),r:tim.daysToNotice==null?'Notice date not determinable.':(tim.daysToNotice+' day(s) to the notice deadline, '+(tim.daysToNotice<30?'under':'over')+' 30.')}
 ];
}
// same-supplier multi-contract bundling: siblings renewing within the window (reflect-only)
function rnxBundling(m){
 var b=(m&&m.bundling)||{};var win=Number(b.windowMonths)||6;var DAY=86400000;
 var asOf=Date.parse(((m.timing&&m.timing.asOf)||'')+'T00:00:00');if(!isFinite(asOf))asOf=Date.now();
 var sib=(b.siblings||[]).map(function(s){var e=Date.parse((s.expiryISO||'')+'T00:00:00');var mo=isFinite(e)?((e-asOf)/DAY/30.44):null;return {id:s.id,label:s.label,expiryISO:s.expiryISO,monthsOut:mo};});
 var within=sib.filter(function(s){return s.monthsOut!=null&&s.monthsOut>=0&&s.monthsOut<=win;});
 return {win:win,siblings:sib,within:within,detected:within.length>0};
}
function rnxAxisTable(dims,title,agg,band){
 var rows=(dims||[]).map(function(d){var b=rnxBasisCls(d.basis);return '<tr><td><b>'+escD(d.label)+'</b><div class="fac">'+escD(d.factor||'')+'</div></td><td class="c"><b style="color:'+rnxColor(d.score)+'">'+rnxNum(d.score,1)+'</b></td><td class="c" style="font:600 11px var(--mono,monospace);color:var(--mut2,#8A827C)">'+Math.round((Number(d.weight)||0)*100)+'%</td><td><span class="rnxb '+b+'">'+escD(d.basis||'assessed')+'</span></td></tr>';}).join('');
 return '<div><div class="dicolh" style="margin-bottom:8px">'+escD(title)+' · <span style="color:'+rnxColor(agg)+'">'+rnxNum(agg,1)+'/5</span> ('+escD(band)+')</div>'
  +'<table class="rnxtbl"><thead><tr><th>Dimension</th><th class="c">Score</th><th class="c">Wt</th><th>Basis</th></tr></thead><tbody>'+rows+'</tbody>'
  +'<tfoot><tr><td>Weighted aggregate</td><td class="c" style="color:'+rnxColor(agg)+'">'+rnxNum(agg,1)+'</td><td class="c">100%</td><td>'+escD(band)+'</td></tr></tfoot></table></div>';
}
function rnxMatrixHTML(m,tim){
 var pAgg=rnxAgg(m.performance.dims),mAgg=rnxAgg(m.market.dims);
 var pBand=rnxPerfBand(pAgg),mBand=rnxMktBand(mAgg);
 var rec=m.recommendation,tone=rnxRecTone(rec),active=RNX_QUAD[m.quadrant]||RNX_QUAD[rec]||'';
 var cells=[
  {cell:'tl',q:'Perf high / Market low',t:'Renew as-is'},
  {cell:'tr',q:'Perf high / Market high',t:'Renegotiate'},
  {cell:'bl',q:'Perf low / Market low',t:'Exit / terminate'},
  {cell:'br',q:'Perf low / Market high',t:'Recompete'}
 ].map(function(c){return '<div class="rnxcell'+(c.cell===active?(' on '+tone):'')+'"><span class="rq">'+escD(c.q)+'</span><span class="rt">'+escD(c.t)+'</span></div>';}).join('');
 var left=Math.max(6,Math.min(94,(mAgg/5)*100)),top=Math.max(6,Math.min(94,(1-(pAgg/5))*100));
 var focus=(rec==='renegotiate'&&m.renegotiateFocus&&m.renegotiateFocus.length)
  ? '<div style="margin-top:9px"><div class="dicolh">Renegotiate focus</div>'+m.renegotiateFocus.map(function(f){return '<span class="rnxfocus">'+escD(RNX_FOCUS[f]||f)+'</span>';}).join('')+'</div>' : '';
 var alt=m.alternative? '<div class="rnxalt"><b>Alternative to weigh:</b> '+escD(RNX_REC[m.alternative]||m.alternative)+(m.alternativeWhy?(', '+escD(m.alternativeWhy)):'')+'</div>' : '';
 var lead='<div class="rnxlead '+tone+'"><div class="rlh"><span class="recpill '+escD(rec)+'">'+escD(RNX_REC[rec]||rec)+'</span><span class="rlt" style="margin-left:auto">'+escD(rnxSupplier())+'</span></div><div class="rlb">'
  +'<div style="font-size:12.5px;color:var(--mut,#3E3933);line-height:1.55">'+escD(m.rationale||'')+'</div>'+focus+alt
  +'<div class="rnxstat"><div class="rnxsb"><div class="l">Performance</div><div class="v" style="color:'+rnxColor(pAgg)+'">'+rnxNum(pAgg,1)+'<small> /5 · '+escD(pBand)+'</small></div></div>'
  +'<div class="rnxsb"><div class="l">Market pull</div><div class="v" style="color:'+rnxColor(mAgg)+'">'+rnxNum(mAgg,1)+'<small> /5 · '+escD(mBand)+'</small></div></div>'
  +'<div class="rnxsb"><div class="l">Quadrant</div><div class="v" style="font-size:12.5px;text-transform:capitalize">'+escD(RNX_REC[m.quadrant]||m.quadrant)+'</div></div></div>'
  +'</div></div>';
 return '<div class="sect"><div class="secthd"><div class="t">Renewal decision matrix</div><span style="font:600 11.5px var(--sans,system-ui,sans-serif);color:var(--mut2,#8A827C)">Performance × Market attractiveness · reflect-only</span></div>'
  +'<div class="card">'
  +'<div class="rnxwrap"><div class="rnxmxblock"><div class="rnxmy"><span class="rnxmylab">Supplier performance (low → high)</span></div><div class="rnxmcol"><div class="rnxmatrix">'+cells+'<div class="rnxdot" style="left:'+left.toFixed(1)+'%;top:'+top.toFixed(1)+'%" title="Performance '+rnxNum(pAgg,1)+' / Market '+rnxNum(mAgg,1)+'"></div></div><div class="rnxmx">Market attractiveness (low → high)</div></div></div>'
  +'<div>'+lead+'<div class="rnxcaveat"><b>Advisory only.</b> The matrix maps two scored axes to a directional strategy for a human to decide. Theo is not the system of record (LEAH owns terms, SAP owns spend) and <b>no renewal, renegotiation, recompete, termination, or notice is issued on your behalf.</b></div></div>'
  +'</div>'
  +'<div class="rnxsplit" style="margin-top:16px">'+rnxAxisTable(m.performance.dims,'Supplier performance',pAgg,pBand)+rnxAxisTable(m.market.dims,'Market attractiveness',mAgg,mBand)+'</div>'
  +'<div class="rnxfoot">Each axis is a weighted composite of its dimensions; every dimension is tagged with its data basis (blue measured, amber assessed, grey estimated). An estimated dimension sits at the neutral 3.0 and lowers confidence, never invented.</div>'
  +'</div></div>';
}
function rnxSignalsHTML(m,tim){
 var conf=rnxConf(m),trg=rnxTriggers(m,tim),fired=trg.filter(function(t){return t.fired;}),bund=rnxBundling(m);
 var recLc=String(RNX_REC[m.recommendation]||m.recommendation).toLowerCase();
 var avColor=tim.atRisk?'var(--red,#C8202E)':'var(--plum)';
 var runwayRow=tim.atRisk
  ? '<div class="rnxrow bad"><span class="rd"></span><div><b>Window at risk.</b> '+escD(tim.available)+' day(s) to the notice deadline but a '+escD(recLc)+' needs about '+escD(tim.need)+', a shortfall of '+escD(tim.shortfall)+' day(s). The skill calls for a non-renewal notice now to preserve optionality, plus an interim extension while you negotiate.</div></div>'
  : '<div class="rnxrow good"><span class="rd"></span><div><b>Runway is adequate.</b> '+escD(tim.available)+' day(s) to the notice deadline and a '+escD(recLc)+' needs about '+escD(tim.need)+', ample room to act before the term rolls.</div></div>';
 var timing='<div class="sect"><div class="secthd"><div class="t">Timing &amp; runway</div><span style="font:600 11.5px var(--sans,system-ui,sans-serif);color:var(--mut2,#8A827C)">working backward from the notice deadline</span></div><div class="card">'
  +'<div class="rnxtime">'
  +'<div class="rnxsb"><div class="l">Days to expiry</div><div class="v">'+escD(tim.daysToExpiry==null?'n/a':tim.daysToExpiry)+'<small> d</small></div></div>'
  +'<div class="rnxsb"><div class="l">Notice deadline</div><div class="v" style="font-size:12.5px">'+escD(tim.noticeISO||'none')+'</div></div>'
  +'<div class="rnxsb"><div class="l">Available runway</div><div class="v" style="color:'+avColor+'">'+escD(tim.available==null?'n/a':tim.available)+'<small> d</small></div></div>'
  +'<div class="rnxsb"><div class="l">Lead time needed</div><div class="v">'+escD(tim.need)+'<small> d</small></div></div>'
  +'</div><div style="margin-top:12px">'+runwayRow+'</div>'
  +'<div class="rnxfoot">Reflect-only: the runway is informational; no notice is issued on your behalf.</div></div></div>';
 var trows=trg.map(function(t){return '<div class="rnxrow '+(t.fired?'warn':'clear')+'"><span class="rd"></span><div><b>'+escD(t.k)+'</b> <span class="rnxb '+(t.fired?'assd':'est')+'" style="margin-left:4px">'+(t.fired?'FIRED':'clear')+'</span>'+(t.fired?('<span class="lv">routed to: '+escD(t.lvl)+'</span>'):'')+'<div style="color:var(--mut,#3E3933);margin-top:3px">'+escD(t.r)+'</div></div></div>';}).join('');
 var esc='<div class="sect"><div class="secthd"><div class="t">Escalation triggers</div><span style="font:600 11.5px var(--sans,system-ui,sans-serif);color:var(--mut2,#8A827C)">'+escD(fired.length)+' of '+escD(trg.length)+' fired · routed for review</span></div><div class="card">'+trows+'<div class="rnxfoot">Triggers are surfaced for your review and routed to the named level; nothing is escalated, negotiated, or sent on your behalf.</div></div></div>';
 var bundHtml=bund.detected
  ? '<div class="rnxbundle"><span class="rd" style="background:var(--plum);width:9px;height:9px;border-radius:50%;flex:none;margin-top:5px"></span><div><span class="rnxbchip">Bundling</span>'+escD(bund.within.length)+' other '+escD(rnxSupplier())+' contract(s) renew within '+escD(bund.win)+' months, '+bund.within.map(function(s){return escD(s.label)+' ('+escD(s.id)+', ~'+escD(Math.round(s.monthsOut))+'mo)';}).join('; ')+'. Consider a consolidated renewal for leverage. Reflect-only.</div></div>'
  : '<div class="rnxfoot">No same-supplier contracts renewing within the bundling window.</div>';
 var cc='<div class="sect"><div class="secthd"><div class="t">Confidence &amp; bundling</div></div><div class="card">'
  +'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="rnxconf '+conf.cls+'">'+escD(conf.conf)+'</span><span style="font-size:12.5px;color:var(--mut,#3E3933)">'+escD(conf.est)+' of '+escD(conf.total)+' matrix signals estimated · '+escD(conf.total-conf.est)+' sourced or assessed.</span></div>'
  +bundHtml
  +'<div class="rnxfoot">The recommendation is only as firm as the inputs; a missing signal defaults to the conservative middle and lowers confidence, never invented. Reflect-only and advisory.</div></div></div>';
 return timing+esc+cc;
}
function dealRenewExtras(){var R=pvData('deal.renewal',RENEWAL);
 var h=renewFastPathHTML();
 h+='<div class="sect"><div class="secthd"><div class="t">Recommendation</div><button class="btn btn-ghost btn-sm" onclick="draftRenewalOpening()">Draft renewal opening</button></div><div class="card"><div class="recbox"><span class="recpill '+R.rec+'">'+R.recT+'</span><div class="recwhy">'+R.why+'</div></div></div></div>';
 if(R.matrix){ ensureRenewMatrixCss(); var M=R.matrix, tim=rnxTiming(M); h+=rnxMatrixHTML(M,tim)+rnxSignalsHTML(M,tim); }   // Wave 4b: the scored 2-axis decision matrix + escalation/timing/confidence/bundling behind the pill
 h+='<div class="sect"><div class="secthd"><div class="t">Renewal dossier</div></div><div class="card" style="padding:4px 6px"><table class="agenda"><tbody>'+
  [['Expiry',R.expiry+' · '+R.window],['Spend / commitment',R.spend],['Performance',R.perf],['Compliance',R.compliance],['Market alternatives',R.market],['Price exposure',R.price]].map(function(r){return '<tr><td class="iss">'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join('')+'</tbody></table></div></div>';
 h+='<div class="sect"><div class="secthd"><div class="t">Savings model</div><button class="btn btn-ghost btn-sm" onclick="modelSavings()">Model savings</button></div><div class="card"><div id="savmodel">'+savingsModelHTML()+'</div></div></div>';
 return h;
}
function dealPricingPersist(){
 // Pricing detail, benchmarks, normalization and the model-change watch are now folded INTO the
 // ZOPA view (zopaGanttHTML) so pricing lives in ONE place across the modes. No standalone block.
 return zopaGanttHTML();
}
// CAT.1: contracted rate-card reflect on the Deal tab (hide-until-data). Renders
// ONLY when a negotiated rate card exists for this project's supplier; otherwise
// nothing. Reflect-only; the executed contract in LEAH / CLM is the record.
// Illustrative demo data, consistent with the page's other pricing (PRICING/ZOPA).
var DEAL_RATE_CARDS=_PVRR.rateCards||{};
function dealRateCardHTML(){
 var sup=(PROJECTS[CURPROJ]&&PROJECTS[CURPROJ].supplier)||'';
 var rc=DEAL_RATE_CARDS[sup];
 if(!rc||!rc.lines||!rc.lines.length)return '';   // hide-until-data: no rate card -> no panel
 var rows=rc.lines.map(function(l){return '<tr><td class="iss">'+escD(l.item)+'</td><td>'+escD(l.rate)+'</td><td style="color:var(--mut2)">'+escD(l.unit||'')+'</td></tr>';}).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Contracted rate card</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+escD(rc.contract)+(rc.expires?(' · to '+escD(rc.expires)):'')+' · reflect-only</span></div><div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th>Line item</th><th>Contracted rate</th><th>Unit / basis</th></tr></thead><tbody>'+rows+'</tbody></table>'+(rc.note?'<div class="spnote">'+escD(rc.note)+'</div>':'')+'<div class="spnote">Negotiated rates reflected from the executed contract. The contract in LEAH / CLM is the source of record.</div></div></div>';
}
function dealMode(m){DEAL_MODE=m;if(curtab==='deal')$('#tabbody').innerHTML=dealHTML();}
// cross-link from another tab into the Deal tab, choosing the right mode
function dealTo(t){var map={contract:'review',negprep:'negotiate',pricing:'negotiate',renewal:'renew',savings:'renew'};DEAL_MODE=(map[t]||'negotiate');tab('deal');}
function dealHTML(){
 ensureDealCss();
 if(dealIsRfx()) return dealRfxHTML();
 if(typeof dealIsBuyMsa==='function'&&dealIsBuyMsa()) return dealBuyMsaHTML();
 var P=PROJECTS[CURPROJ];var isRenew=dealIsRenewal();
 var mode=DEAL_MODE; if(mode==='renew'&&!isRenew) mode='negotiate'; if(mode==='cdr') mode='negotiate';   // CDR is no longer a Deal sub-mode; it lives at the pre-execution gate
 var modes=[['negotiate','Negotiate'],['proforma','Pro-forma'],['review','Review']]; if(isRenew) modes.push(['renew','Renew']);
 var sw=modes.map(function(m){return '<button class="dmode'+(m[0]===mode?' on':'')+'" onclick="dealMode(\''+m[0]+'\')">'+m[1]+'</button>';}).join('');
 var h='<p class="dashintro"><b>Deal · '+P.supplier+'</b> - negotiate the terms, review the contract'+(isRenew?', and plan the renewal':'')+'. Pricing and ZOPA live in Negotiate; Review owns the contract and its versions. Reflect-only; targets and redlines are drafts for the team.</p>';
 h+=dealStatusStripHTML();   // persistent, read-only contract-process status strip (above the sub-nav)
 h+='<div class="dealbar"><div class="dmodes">'+sw+'</div><div class="deallinks">'
  +'<a onclick="tab(\'workflow\');return false;" title="Contract &amp; review workflow" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:1px solid var(--line2);border-radius:8px;color:var(--mut);cursor:pointer;text-decoration:none"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2"><path d="M4 6h7M4 12h10M4 18h6"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/></svg></a>'
  +'<a href="dashboard-contract.html" title="Open full negotiation dashboard" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:1px solid var(--line2);border-radius:8px;color:var(--mut);cursor:pointer;text-decoration:none"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2"><path d="M4 20V10M10 20V4M16 20v-7"/><path d="M2 20h20"/></svg></a>'
  +'</div></div>';
 if(mode==='review'){
  h+=dealReviewExtras();   // 2b: review owns its order (Protection Score headline, Key issues, versions). ZOPA/pricing stays in Negotiate - not duplicated here.
 }else if(mode==='proforma'){
  h+=dealProFormaExtras();   // pro-forma is its OWN Deal sub-tab (Negotiate / Pro-forma / Review): summary + full model + scenarios + sensitivity + Excel export. Recomputes from the same Negotiate pricing.
 }else{
  h+=dealIssuesHTML();
  if(mode==='negotiate') h+=dealNegotiateExtras();
  else if(mode==='renew') h+=dealRenewExtras();
  if(mode==='negotiate') h+=dealNegPrepCardHTML();   // additive: prep summary card ABOVE the ZOPA section
  if(mode==='negotiate') h+=dealRateCardHTML();      // CAT.1: contracted rate card (hide-until-data)
  h+=dealPricingPersist();
 }
 setTimeout(dealPostRender,0);   // fire the live loads after this HTML is mounted
 return h;
}
// BUY-UNDER-EXISTING-MSA DEAL tab (LOCKED one-base+traits): an order under paper Lilly already holds.
// Composes: (conditional) MSA-amendment panel if the governing MSA has gaps → the governing-MSA picker +
// order-form + supplier-paper deviations/divergence (the formerly-orphaned paperSectionHTML, now wired).
// No Negotiate/Pro-forma/Review mode switcher, ordering under agreed terms doesn't need the full machinery.
function dealBuyMsaHTML(){
 ensureDealCss();
 var P=PROJECTS[CURPROJ]||{},t=P.traits||{},gaps=(t.existingMSA&&t.existingMSA.gaps)||[];
 var h='<p class="dashintro"><b>Deal · '+escapeHtmlPV(P.supplier||'')+'</b>, an order placed under an existing master agreement. Confirm the governing MSA, draft the order/SOW under it, and, only where needed, amend the MSA or reconcile the supplier&rsquo;s redlines. Reflect-only; drafts for the team, nothing is sent or executed here.</p>';
 if(gaps.length){
  h+='<div class="sect"><div class="secthd"><div class="t">MSA amendment needed</div><span class="paperbadge">'+gaps.length+' gap'+(gaps.length>1?'s':'')+'</span></div>'
   +'<div class="card"><div class="papertxt">The governing MSA doesn&rsquo;t yet cover everything this order needs. Theo drafts an amendment for the '+gaps.length+' gap'+(gaps.length>1?'s':'')+' below; Legal signs off, and the order proceeds under the amended MSA. Reflect-only, mirrors LEAH.</div>'
   +'<div class="devlist">'+gaps.map(function(g){return '<div class="devrow"><span class="gsev med">Gap</span><div class="devm"><div class="devsec">'+escapeHtmlPV(g)+'</div><div class="devvs">Not covered by the current governing MSA, amendment drafted.</div></div></div>';}).join('')+'</div>'
   +'<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="toast(\'Drafting an MSA amendment for the outstanding gap(s) in LEAH, review before anything executes.\')">Draft MSA amendment</button></div></div>';
 }
 h+=(typeof pushToLeahSectionHTML==='function'?pushToLeahSectionHTML():'');   // #135 type-gated Push-to-LEAH (MSA-amendment when the governing MSA has gaps)
 h+=(typeof paperSectionHTML==='function'?paperSectionHTML():'');
 setTimeout(function(){if(typeof dealPostRender==='function')dealPostRender();},0);
 return h;
}
// ── RFx (competitive) DEAL tab, Marc redesign (2026-07-07) ─────────────────────────────────
// NO dropdown; a field-wide negotiation/contracting workspace for ALL participants:
//  (1) where each supplier stands across contracting / WwTP / onboarding,
//  (2) the cross-supplier NORMALIZED ZOPA (moved here from RFx, this is the one place it lives),
//  (3) an offering-comparison matrix built from each bidder's proposal submission.
// The per-supplier INDIVIDUAL ZOPA lives on RFx › Analysis › Individual supplier. "Cancel RFx" is on the
// RFx tab. No side-notes / conditional-award / split copy, those are process rules handled in code.
const RFX_DEAL_STAGES=_PVRR.rfxStages||[];
const RFX_DEAL_PROGRESS=_PVRR.rfxProgress||[];
const RFX_OFFER_ROWS=_PVRR.rfxOfferRows||[];
const RFX_OFFER=_PVRR.rfxOffer||[];
function rfxDealProgressHTML(){
 var esc=escapeHtmlPV;
 var chip=function(s){var m={done:['Done','var(--plum)','rgba(92,43,80,.10)'],active:['In progress','#8A5A00','#FBEFC9'],pending:['Not started','#6E675E','#EAE4D8'],na:['—','#9A9488','transparent']};var c=m[s]||m.na;return '<span style="display:inline-block;min-width:84px;text-align:center;font:700 10px var(--mono);padding:3px 8px;border-radius:20px;color:'+c[1]+';background:'+c[2]+'">'+c[0]+'</span>';};
 // #4/#5 (Marc): reframe from a task-tracker into CURRENT-STATUS lanes + a per-supplier MSA read (executed?
 // redlines back? on Lilly paper? critical deviations?). Legal engages only for the MSA; Cyber/ISS, WwTP and
 // onboarding trigger after down-select (or, for an existing supplier, are read from the executed MSA / priors).
 var stands=(typeof _PVRR!=='undefined'&&_PVRR&&_PVRR.rfxStands)||[];
 if(stands.length){
   var pill=function(t,c){return '<span class="dst-pill '+c+'">'+t+'</span>';};
   var lanes=stands.map(function(s){
     var msaC=s.msaState==='own'?'crit':(s.msaState==='executed'?'good':(s.msaState==='redlines'?'ok':'pend'));
     var paperC=s.paper==='lilly'?'good':(s.paper==='own'?'crit':'ok');
     var issC=(s.iss==='unknown')?'pend':'ok';
     return '<div class="dst-lane"><div class="dst-h"><span class="dst-nm">'+esc(s.name)+'</span><span class="dst-tag">'+(s.existing?'Existing supplier':'Net-new')+'</span>'+(s.crit?'<span class="dst-crit">&#9888; '+esc(s.critLabel||'critical')+'</span>':'')+'</div>'
       +'<div class="dst-row">'
         +'<div class="dst-cell"><span class="dst-k">MSA</span>'+pill(esc(s.msaLabel),msaC)+'</div>'
         +'<div class="dst-cell"><span class="dst-k">Paper</span>'+pill(esc(s.paperLabel),paperC)+'</div>'
         +'<div class="dst-cell"><span class="dst-k">Cyber / ISS</span>'+pill(esc(s.issLabel),issC)+'</div>'
         +'<div class="dst-cell"><span class="dst-k">WwTP</span>'+pill(esc(s.wwtpLabel||'Not triggered'),'pend')+'</div>'
         +'<div class="dst-cell"><span class="dst-k">Onboarding</span>'+pill(esc(s.onbLabel||'After award'),'pend')+'</div>'
       +'</div>'
       +'<div class="dst-read"><span class="dst-rk">MSA read</span>'+s.read+'</div></div>';
   }).join('');
   return '<div class="sect"><div class="card" style="margin:0;padding:0;overflow:hidden">'
    +rfxDealBand('<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="5" height="13" rx="1"/>','Where each supplier stands','contracting status · MSA read')
    +'<div style="padding:12px 14px">'+lanes+'<div class="spnote">Current <b>status</b> at the pre-selection stage, not a task tracker, running Cyber/ISS, WwTP and onboarding in depth before a down-select tips your hand. Legal engages only for the MSA; the rest trigger after down-select, or (for an existing supplier) are read from the executed MSA and prior assessments. Reflect-only.</div></div></div></div>';
 }
 var stW=RFX_DEAL_STAGES.length?Math.floor(80/RFX_DEAL_STAGES.length):12;
 var head='<tr><th style="text-align:left;width:20%">Supplier</th>'+RFX_DEAL_STAGES.map(function(s){return '<th style="width:'+stW+'%">'+esc(s)+'</th>';}).join('')+'</tr>';
 var rows=RFX_DEAL_PROGRESS.map(function(p){return '<tr><td style="text-align:left;font-weight:700">'+esc(p.name)+'</td>'+p.st.map(function(s){return '<td style="text-align:center">'+chip(s)+'</td>';}).join('')+'</tr>';}).join('');
 return '<div class="sect"><div class="card" style="margin:0;padding:0;overflow:hidden">'
  +rfxDealBand('<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="5" height="13" rx="1"/>','Where each supplier stands','contracting · onboarding')
  +'<div style="padding:12px 14px"><div class="mxwrap"><table class="mx mxz" style="width:100%;min-width:760px"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div></div></div></div>';
}
// #8 (Marc): the capability matrix overlapped the RFx tab. The Deal job is comparing COMMERCIALS
// proposal-to-proposal, so this renders a single commercial + legal terms comparison (Option A): terms
// down the left, suppliers across the top, best value flagged teal, warnings red, points-to-press burnt orange.
// The capability matrix now lives only on the RFx tab. Falls back to the old matrix if rfxCommercial is absent.
function rfxDealOfferHTML(){
 var esc=escapeHtmlPV;
 var C=(typeof _PVRR!=='undefined'&&_PVRR&&_PVRR.rfxCommercial)||[];
 if(C.length){
   var num=function(v){return parseFloat(String(v).replace(/[^0-9.]/g,''))||0;};
   var lowest=function(key){return C.slice().sort(function(a,b){return num(a[key])-num(b[key]);})[0].id;};
   var bestPrice=lowest('norm'), bestTco=lowest('tco');
   var bestProtect=(C.filter(function(s){return /cap/i.test(s.protect)&&!/tbd/i.test(s.protect);})[0]||{}).id;
   var warn=function(v){return '<span class="dc-warn">'+esc(v)+'</span>';};
   var em=function(v){return '<span class="dc-em">'+esc(v)+'</span>';};
   var protectCell=function(s){return /none stated/i.test(s.protect)?warn(s.protect):esc(s.protect);};
   var paperCell=function(s){return s.paper==='Lilly paper'?'<b>'+esc(s.paper)+'</b>':(/own paper/i.test(s.paper)?warn(s.paper):em(s.paper));};
   var liabCell=function(s){return /below/i.test(s.liability)?warn(s.liability):esc(s.liability);};
   var ipCell=function(s){return /own/i.test(s.ip)?em(s.ip):esc(s.ip);};
   var dataCell=function(s){return /depends/i.test(s.data)?em(s.data):esc(s.data);};
   var hdr='<thead><tr><th class="dc-tk">Term</th>'+C.map(function(s){return '<th class="dc-sup"><span class="dc-dot" style="background:'+s.col+'"></span>'+esc(s.name.split(' ')[0])+'</th>';}).join('')+'</tr></thead>';
   var row=function(k,fn,bestId){return '<tr><td class="dc-k">'+k+'</td>'+C.map(function(s){var b=(bestId&&bestId===s.id);return '<td'+(b?' class="dc-best"':'')+'>'+fn(s)+'</td>';}).join('')+'</tr>';};
   var seg='<tr class="dc-seg"><td colspan="'+(C.length+1)+'">Legal &amp; contracting</td></tr>';
   var body='<tbody>'
    +row('Normalized price',function(s){return '<span class="dc-price">'+esc(s.norm)+'</span><small class="dc-unit">/seat/yr</small>';},bestPrice)
    +row('3-yr TCO',function(s){return esc(s.tco);},bestTco)
    +row('Pricing basis',function(s){return esc(s.basis);},null)
    +row('Discount',function(s){return esc(s.discount);},null)
    +row('Payment terms',function(s){return esc(s.pay);},null)
    +row('Price protection',protectCell,bestProtect)
    +row('Ramp / true-up',function(s){return esc(s.trueup);},null)
    +row('Term',function(s){return esc(s.term);},null)
    +seg
    +row('Contract paper',paperCell,null)
    +row('Liability cap',liabCell,null)
    +row('IP / indemnity',ipCell,null)
    +row('Data / security',dataCell,null)
    +row('Termination / exit',function(s){return esc(s.exit);},null)
    +'</tbody>';
   return '<div class="sect"><div class="card" style="margin:0;padding:0;overflow:hidden">'
    +rfxDealBand('<path d="M4 20V9M10 20V4M16 20v-7M20 20H3"/>','Commercial comparison','proposal-to-proposal · commercial + legal terms')
    +'<div style="padding:12px 14px"><div class="mxwrap"><table class="dctbl" style="min-width:640px">'+hdr+body+'</table></div>'
    +'<div class="spnote">Comparing the <b>commercials</b> proposal-to-proposal, the capability matrix lives on the <b>RFx</b> tab. <span class="dc-swatch">best value</span> is flagged; <span class="dc-warn">red</span> marks a term to resolve, <span class="dc-em">burnt orange</span> a point to press. Reflect-only.</div>'
    +'</div></div></div>';
 }
 var yes='<span style="color:var(--plum);font-weight:800;font-size:15px">&#10003;</span>';
 var no='<span style="color:var(--amber-d);font-weight:800;font-size:14px" title="Not offered">&#10005;</span>';
 var offW=RFX_OFFER.length?Math.floor(54/RFX_OFFER.length):18;
 var head='<tr><th style="text-align:left;width:'+(100-offW*RFX_OFFER.length)+'%">Offered in the proposal</th>'+RFX_OFFER.map(function(o){return '<th style="width:'+offW+'%">'+esc(o.name.replace(/ (Data|Co|Warehouse)$/,''))+'</th>';}).join('')+'</tr>';
 var rows=RFX_OFFER_ROWS.map(function(r,ri){return '<tr><td style="text-align:left">'+esc(r)+'</td>'+RFX_OFFER.map(function(o){var gap=!o.has[ri];return '<td style="text-align:center'+(gap?';background:var(--amber-t)':'')+'">'+(o.has[ri]?yes:no)+'</td>';}).join('')+'</tr>';}).join('');
 return '<div class="sect"><div class="card" style="margin:0;padding:0;overflow:hidden">'
  +rfxDealBand('<path d="M4 6l1.6 1.6L8.4 5M4 12l1.6 1.6L8.4 11M4 17.6l1.6 1.6L8.4 16.4M11 6h9M11 12h9M11 18h9"/>','What each supplier offers','proposal capability matrix')
  +'<div style="padding:12px 14px"><div class="mxwrap"><table class="mx mxz" style="width:100%;min-width:620px"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>'
  +'<div class="spnote">From each bidder&rsquo;s proposal submission, a <span style="color:var(--plum);font-weight:800">&#10003;</span> means the capability is included; a shaded <span style="color:var(--amber-d);font-weight:800">&#10005;</span> marks a <b>gap</b> to press in negotiation.</div>'
  +'</div></div></div>';
}
function dealRfxHTML(){
 var h='<p class="dashintro"><b>Deal · competitive RFx</b>, a <b>cross-supplier profiler</b> for the pre-selection stage: set and push your positions across every bidder <b>before</b> you down-select. Where each supplier stands, the normalized cross-supplier ZOPA, and what each proposed. Reflect-only; targets and walk-aways are the team&rsquo;s to set.</p>';
 h+=rfxDealProgressHTML();   // where each participant is across contracting / WwTP / onboarding
 h+=rfxNormZopaHTML();       // the cross-supplier NORMALIZED ZOPA (the one place it lives)
 h+=rfxDealOfferHTML();      // offering-comparison matrix from each bidder's proposal
 return h;
}
function pricingHTML(){var P=PRICING;
 let h='<p class="dashintro"><b>Pricing intelligence · '+PROJECTS[CURPROJ].supplier+'</b>, gathered market benchmarks, the proposal normalized to a comparable unit, and a reconciliation when the supplier changes the pricing model. Reflect-only.</p>';
 h+='<div class="sect"><div class="secthd"><div class="t">Benchmarks · gathered</div><button class="btn btn-ghost btn-sm" onclick="toast(\'Re-gathering benchmarks from the internal price base + market sources (demo)\')">Re-gather</button></div><div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th>Line item</th><th>Acme</th><th>Market median</th><th>Range</th><th>Read</th></tr></thead><tbody>'+
   P.benchmarks.map(function(b){return '<tr><td class="iss">'+b.item+'</td><td>'+(b.flag==='over'?'<span class="driftv">'+b.ours+'</span>':b.ours)+'</td><td>'+b.med+'</td><td style="color:var(--mut2);white-space:nowrap">'+b.lo+' to '+b.hi+'</td><td><span class="gsev '+(b.flag==='over'?'med':'low')+'">'+b.note+'</span></td></tr>';}).join('')+'</tbody></table></div><div class="spnote">Benchmarks gathered from Lilly\'s internal price base plus external market sources. Items above the median become the negotiation targets.</div></div>';
 h+='<div class="sect"><div class="secthd"><div class="t">Proposal · normalized</div></div><div class="card"><div class="normrow"><div class="normk">As proposed</div><div class="normv">'+P.normalize.raw+'</div></div><div class="normarrow">↓ normalized</div><div class="normrow on"><div class="normk">Comparable unit</div><div class="normv"><b>'+P.normalize.normalized+'</b></div></div><div class="spnote">'+P.normalize.note+'</div></div></div>';
 var R=P.reconcile;
 h+='<div class="sect"><div class="secthd"><div class="t">Model-change reconciliation</div></div><div class="card"><div class="rxrow"><span class="rxlab">From</span><span class="rxval">'+R.from+'</span></div><div class="rxrow"><span class="rxlab">To</span><span class="rxval">'+R.to+'</span></div><div class="rxrow"><span class="rxlab">At</span><span class="rxval">'+R.at+'</span></div><div class="rxdelta"><span class="gsev med">Watch</span><span>'+R.delta+'</span></div></div><div class="spnote">When a supplier changes the pricing model, Theo reconciles the old and new models on the same volume so the change is comparable, not just a new sticker price.</div></div>';
 return h+lifeBar('pricing');
}
// model -> commit a modeled saving into the savings pipeline (reflect-only stub for the prototype)
function commitSaving(amt,label){toast('“'+label+'” committed to the savings pipeline as a draft ($'+(amt/1000)+'K/yr), Finance confirms realization. Nothing initiated on your behalf.');}
function wireOverview(){if(!$('#ovpeople'))return;const v=VIEWS[view];$('#ovpeople').innerHTML=people.map(p=>{const isMe=p.n===v.me;let act='';if(isMe&&p.r!=='Stakeholder')act=`<span class="pact" onclick="toast('Reassign your role, pick a successor (demo)')">Hand off my role →</span>`;else if(isMe)act=`<span class="pact" onclick="leave('${p.n}')">Leave</span>`;else if((view==='owner'||view==='rep')&&p.r==='Stakeholder')act=`<span class="pact" onclick="removePerson('${p.n}')">Remove</span>`;return `<div class="prow"><div class="pa ${p.cls}" style="margin:0">${p.i}</div><div><div class="pn">${p.n}${isMe?' · you':''}</div><div class="pr2">${p.r}</div></div>${act}</div>`;}).join('');}
// Documents tab, nested SharePoint-style tree (RV26). Folders nest recursively
// (folder -> sub[] -> files/sub), each row divided, compact per-row metadata, a
// select-to-detail split (list on top, #docDetail below). Reflect-only: create-
// subfolder / refile / move are local demo state; nothing is written to SharePoint.