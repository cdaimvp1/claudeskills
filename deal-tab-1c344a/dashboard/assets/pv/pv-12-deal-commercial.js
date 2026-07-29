var _PV12=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVCM=(_PV12&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV12)&&_PV12.commercial)?_PV12.commercial:{};
function cm$(v){v=Math.round(v);var neg=v<0;var n=Math.abs(v);var s=n>=1e6?('$'+(n/1e6).toFixed(2)+'M'):n>=1000?('$'+Math.round(n/1000)+'K'):('$'+n);return neg?('−'+s):s;}
function cmHd(t,sub){return '<div class="secthd"><div class="t">'+escD(t)+'</div>'+(sub?'<span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+escD(sub)+'</span>':'')+'</div>';}
function cmConfChip(c){var k=(''+c).toLowerCase();var cls=k.indexOf('h')===0?'hi':k.indexOf('l')===0?'lo':'md';var lab=cls==='hi'?'High':cls==='lo'?'Low':'Med';return '<span class="cmconf '+cls+'" title="Confidence is N-driven: N≥8 High, N≥5 Med, N<5 Low (band gated)">Confidence: '+lab+'</span>';}
function cmPrioChip(p){var k=p==='Must-have'?'must':p==='High'?'high':'med';return '<span class="cmprio '+k+'">'+escD(p)+'</span>';}
function cmNConf(n){return n>=8?'High':n>=5?'Med':'Low';}
// ---- ITEM 7: pricing-model recommendation (six models) ----
var CM_PRICE_MODELS=_PVCM.priceModels||[];
function cmPricingModelHTML(){
 var rec='<div class="cmpm-rec"><b>Recommended structure:</b> flat per-seat subscription for the platform + fixed-fee for the implementation. Resist the supplier proposed shift to consumption (usage) pricing, which raises cost at current adoption. This replaces the single static “Fixed-fee” line with a full six-model read.</div>';
 var cards=pvData('deal.cm.priceModels',CM_PRICE_MODELS).map(function(mo){
  var pros='<div class="cmpm-ph">Pros</div><ul class="cmpm-ul">'+mo.pros.map(function(x){return '<li>'+escD(x)+'</li>';}).join('')+'</ul>';
  var cons='<div class="cmpm-ph amb">Cons</div><ul class="cmpm-ul">'+mo.cons.map(function(x){return '<li>'+escD(x)+'</li>';}).join('')+'</ul>';
  return '<div class="cmpm-card '+mo.fitCls+'"><div class="cmpm-top"><span class="cmpm-name">'+escD(mo.name)+'</span><span class="cmpm-fit '+mo.fitCls+'">'+escD(mo.fitLabel)+'</span></div>'+
   '<div class="cmpm-when">'+escD(mo.when)+'</div>'+
   '<div class="cmpm-pc">'+pros+cons+'</div>'+
   '<div class="cmpm-risk"><b>Read:</b> '+escD(mo.risk)+'</div></div>';
 }).join('');
 return '<div class="sect">'+cmHd('Pricing-model recommendation','six models classified · fit · pros / cons · risk')+rec+'<div class="cmpm-grid">'+cards+'</div></div>';
}
// ---- ITEM 8: external benchmark bands (P10/P50/P90, N>=5 gate, tiers, log) ----
var CM_TIERS={T1:['Executed Lilly contracts',1.00],T2:['Lilly internal price base',0.90],T3:['Analyst / Gartner published',0.75],T4:['Peer / consortium benchmark',0.60],T5:['Vendor public list',0.40],T6:['Web / aggregator estimate',0.25],T7:['Anecdotal / single point',0.10]};
var CM_BENCH=_PVCM.bench||[];
function cmPositionPct(b){
 if(b.p10==null||b.p50==null||b.p90==null)return null;
 var a=b.ask,p;
 if(a<=b.p10)p=10*(a/(b.p10||1));
 else if(a<=b.p50)p=10+(a-b.p10)/((b.p50-b.p10)||1)*40;
 else if(a<=b.p90)p=50+(a-b.p50)/((b.p90-b.p50)||1)*40;
 else p=90+(a-b.p90)/(b.p90||1)*10;
 return Math.max(1,Math.min(99,Math.round(p)));
}
function cmBenchLineHTML(b){
 var gated=(b.n<5)||b.p50==null;
 var conf=cmNConf(b.n);
 var fmt=function(v){return b.fmtK?('$'+Math.round(v/1000)+'K'):('$'+v.toLocaleString());};
 var head='<div class="cmbb-head"><span class="cmbb-name">'+escD(b.line)+'</span>'+
   '<span class="cmbb-ask">supplier ask '+escD(fmt(b.ask))+escD(b.unit||'')+'</span>'+cmConfChip(conf)+'</div>';
 var meta='<div class="cmbb-meta">N='+escD(String(b.n))+' usable points · as of '+escD(b.asOf)+' · inflation factor '+escD(b.infl)+'</div>';
 var band;
 if(gated){
  band='<div class="cmbb-gate"><b>External band withheld.</b> Only '+escD(String(b.n))+' usable data point'+(b.n===1?'':'s')+' ('+escD(String(b.n))+' &lt; 5 gate). No P10/P50/P90 is fabricated; see the research log below and gather more points before anchoring on an external band.</div>';
 }else{
  var min=Math.min(b.p10,b.ask),max=Math.max(b.p90,b.ask);var pad=(max-min)*0.14||1;min-=pad;max+=pad;var span=max-min||1;
  var pct=function(v){return (v-min)/span*100;};
  var above=b.ask>b.p50;var pos=cmPositionPct(b);
  band='<div class="cmbb-track">'+
    '<div class="cmbb-range" style="left:'+pct(b.p10)+'%;width:'+(pct(b.p90)-pct(b.p10))+'%"></div>'+
    '<div class="cmbb-p50" style="left:'+pct(b.p50)+'%" title="P50 '+escD(fmt(b.p50))+'"></div>'+
    '<div class="cmbb-askm '+(above?'warn':'good')+'" style="left:calc('+pct(b.ask)+'% - 5px)" title="supplier ask '+escD(fmt(b.ask))+'"></div>'+
   '</div>'+
   '<div class="cmbb-scale"><span>P10 '+escD(fmt(b.p10))+'</span><span>P50 '+escD(fmt(b.p50))+'</span><span>P90 '+escD(fmt(b.p90))+'</span></div>'+
   '<div class="cmbb-pos '+(above?'warn':'good')+'">You are at ~P'+escD(String(pos))+', '+(above?'above':'at / below')+' the market median.</div>';
 }
 var log='<table class="cmtbl cmbb-log"><thead><tr><th>Research query</th><th>Source</th><th>Tier</th><th>Pts</th><th>Conf.</th></tr></thead><tbody>'+
   b.log.map(function(r){return '<tr><td>'+escD(r.q)+'</td><td>'+escD(r.src)+'</td><td><span class="cmtier" title="'+escD((CM_TIERS[r.tier]?CM_TIERS[r.tier][0]:'')+(CM_TIERS[r.tier]?' · weight '+CM_TIERS[r.tier][1].toFixed(2):''))+'">'+escD(r.tier)+'</span></td><td>'+escD(String(r.pts))+'</td><td>'+escD(r.conf)+'</td></tr>';}).join('')+'</tbody></table>';
 return '<div class="cmbb-line">'+head+meta+band+'<div class="cmbb-logh">Benchmark research log</div>'+log+'</div>';
}
function cmBenchmarkHTML(){
 var lines=pvData('deal.cm.bench',CM_BENCH).map(cmBenchLineHTML).join('');
 var legend='<div class="cmtier-legend"><b>Tier-weighted source hierarchy:</b> '+['T1','T2','T3','T4','T5','T6','T7'].map(function(t){return escD(t+' '+CM_TIERS[t][0]+' ('+CM_TIERS[t][1].toFixed(2)+')');}).join(' · ')+'</div>';
 return '<div class="sect">'+cmHd('External benchmark bands','P10 / P50 / P90 · N≥5 gate · tier-weighted · positioning + confidence')+
  '<div class="spnote" style="margin-bottom:10px">External percentile bands per rate line, gated at N≥5 - where fewer than five usable points exist the band is withheld rather than fabricated. Each line carries its N-driven confidence, an “as of” date + inflation factor, and a research log. Reflect-only.</div>'+
  '<div class="card">'+lines+legend+'</div></div>';
}
// ---- ITEM 9: ranked counters + trade payoff matrix ----
var CM_COUNTERS=_PVCM.counters||[];
var CM_TRADES=_PVCM.trades||[];
function cmCounterHTML(){
 var rows=pvData('deal.cm.counters',CM_COUNTERS).slice().sort(function(a,b){return b.impact-a.impact;}).map(function(c,i){
  return '<tr><td class="cmrank">'+(i+1)+'</td><td class="cmask">'+escD(c.ask)+'</td><td>'+escD(c.why)+'</td><td class="cmimp">'+cm$(c.impact)+'</td><td>'+cmPrioChip(c.prio)+'</td></tr>';
 }).join('');
 var counters='<table class="cmtbl"><thead><tr><th>#</th><th>Counter-ask</th><th>Why it matters</th><th>$ impact</th><th>Priority</th></tr></thead><tbody>'+rows+'</tbody></table>';
 var payRows=pvData('deal.cm.trades',CM_TRADES).map(function(t){
  var fav=t.getv>=60000?'strong':t.getv>=25000?'fair':'modest';
  var favLbl=fav==='strong'?'Strongly favors Lilly':fav==='fair'?'Favors Lilly':'Modest';
  return '<tr><td class="cmask">'+escD(t.give)+'</td><td>'+escD(t.gv)+'</td><td class="cmask">'+escD(t.get)+'</td><td class="cmimp">'+cm$(t.getv)+'</td><td><span class="cmnet '+(fav==='modest'?'mut':'good')+'">'+escD(favLbl)+'</span></td></tr>';
 }).join('');
 var pay='<table class="cmtbl"><thead><tr><th>We give</th><th>Give-value to Visier</th><th>We get</th><th>Get-value to Lilly</th><th>Net read</th></tr></thead><tbody>'+payRows+'</tbody></table>';
 return '<div class="sect">'+cmHd('Ranked counter-proposal','ranked by $ impact · priority pill')+
  '<div class="spnote" style="margin-bottom:8px">Prioritized counter-asks mapped to dollar impact over the 3-yr term (renewal / usage items shown as annual exposure). Must-have = red, High / Med = amber / grey. Reflect-only; the rep decides what to table.</div>'+
  '<div class="card" style="padding:4px 6px">'+counters+'</div>'+
  '<div class="cmsubh">Trade payoff matrix</div>'+
  '<div class="spnote" style="margin-bottom:8px">Quantified give × get pairings, what each concession is worth to Visier against what it wins for Lilly. Non-cash gives are labeled; favorable trades are shown in blue.</div>'+
  '<div class="card" style="padding:4px 6px">'+pay+'</div></div>';
}
// ---- ITEM 10a: value-at-risk + assumptions register ----
var CM_VAR=_PVCM.varRisk||[];
var CM_ASSUME=_PVCM.assume||[];
function cmVarAssumeHTML(){
 var vr='<table class="cmtbl"><thead><tr><th>Risk category</th><th>$ exposure</th><th>Notes</th></tr></thead><tbody>'+
  pvData('deal.cm.var',CM_VAR).map(function(r){return '<tr><td class="cmask">'+escD(r.risk)+'</td><td class="cmexp">'+escD(r.exp)+'</td><td>'+escD(r.notes)+'</td></tr>';}).join('')+'</tbody></table>';
 var as='<table class="cmtbl"><thead><tr><th>#</th><th>Assumption</th><th>Risk if broken</th><th>Bearer</th><th>Protection</th></tr></thead><tbody>'+
  pvData('deal.cm.assume',CM_ASSUME).map(function(r,i){var none=/^(none|—|-)/i.test(r.prot);return '<tr><td class="cmrank">'+(i+1)+'</td><td class="cmask">'+escD(r.a)+'</td><td>'+escD(r.risk)+'</td><td>'+escD(r.bearer)+'</td><td class="'+(none?'cmexp':'cmprot')+'">'+escD(r.prot)+'</td></tr>';}).join('')+'</tbody></table>';
 return '<div class="sect">'+cmHd('Value at risk','$ exposure by risk category')+
  '<div class="card" style="padding:4px 6px">'+vr+'</div>'+
  '<div class="cmsubh">Assumptions register</div>'+
  '<div class="spnote" style="margin-bottom:8px">Every pricing assumption, what breaks if it fails, who bears it, and whether a clause protects Lilly. A “None” protection is shown in red.</div>'+
  '<div class="card" style="padding:4px 6px">'+as+'</div></div>';
}
// ---- ITEM 10b: layered discount waterfall ----
var CM_WATERFALL=_PVCM.waterfall||[];
function cmWaterfallHTML(){
 var rows=pvData('deal.cm.waterfall',CM_WATERFALL).map(function(r){
  var cls=r.amt<0?'cut':(r.kind==='net'?'net':r.kind==='top'?'top':'plain');
  return '<div class="cmwf-row"><div class="cmwf-amt '+cls+'">'+cm$(r.amt)+'</div><div class="cmwf-desc"><b>'+escD(r.label)+'</b><span>'+escD(r.sub)+'</span></div></div>';
 }).join('');
 var insight='<div class="cmwf-insight"><b>Leverage insight:</b> Two discount layers take roughly 24% off implied list. Layer 1 is the supplier own volume / term discount; Layer 2 is the room the ask still leaves, the per-seat license is ~85% of that gap and the biggest lever. In a renewal or recompete, decouple the discount from any execution-date condition and push the net deeper.</div>';
 return '<div class="sect">'+cmHd('Discount architecture, waterfall','gross list → layers → net target')+'<div class="card">'+rows+'</div>'+insight+'</div>';
}
// ---- ITEM 10c: lever / Protection-Score model (distinct from the Pro-forma NPV slider) ----
var CM_LEV_BASE={annual:700000,prot:66,rounds:1.5};
var CM_EFFORT_W={lo:0.4,md:0.8,hi:1.3};
var CM_EFF_LBL={lo:'Low effort',md:'Med effort',hi:'High effort'};
var CM_PRICE_OVERLAP=[1,1,0.95,0.90,0.86,0.83];
var CM_LEVERS=_PVCM.levers||[];
var CM_SEL=null;
var CM_HORIZON='3yr';
function cmLeverSel(){if(!CM_SEL){CM_SEL={};pvData('deal.cm.levers',CM_LEVERS).forEach(function(l){if(l.rec)CM_SEL[l.id]=true;});}return CM_SEL;}
function cmModel(){
 var s=cmLeverSel();var LV=pvData('deal.cm.levers',CM_LEVERS);
 var sel=LV.filter(function(l){return s[l.id];});
 var priceSel=sel.filter(function(l){return l.price;});
 var ovf=CM_PRICE_OVERLAP[Math.min(priceSel.length,CM_PRICE_OVERLAP.length-1)];if(ovf==null)ovf=CM_PRICE_OVERLAP[CM_PRICE_OVERLAP.length-1];
 var steadyPrice=Math.round(priceSel.reduce(function(a,l){return a+l.sav;},0)*ovf);
 var y1Price=Math.round(priceSel.reduce(function(a,l){return a+l.sav*l.y1f;},0)*ovf);
 var steadyAfter=CM_LEV_BASE.annual-steadyPrice;
 var y1After=CM_LEV_BASE.annual-y1Price;
 var protDelta=sel.reduce(function(a,l){return a+l.prot;},0);
 var protAfter=Math.max(0,Math.min(100,CM_LEV_BASE.prot+protDelta));
 var effW=sel.reduce(function(a,l){return a+(CM_EFFORT_W[l.eff]||0.6);},0);
 var rounds=sel.length?Math.max(1,Math.min(4,Math.round(CM_LEV_BASE.rounds+effW/1.5))):Math.round(CM_LEV_BASE.rounds);
 return {n:sel.length,total:LV.length,y1After:y1After,steadyAfter:steadyAfter,
  threeYrBefore:CM_LEV_BASE.annual*3,threeYrAfter:y1After+steadyAfter+steadyAfter,
  protBase:CM_LEV_BASE.prot,protAfter:protAfter,protDelta:protAfter-CM_LEV_BASE.prot,rounds:rounds,
  bars:[CM_LEV_BASE.annual,y1After,steadyAfter]};
}
function cmLeverInner(){
 var s=cmLeverSel(),m=cmModel();
 var cards=pvData('deal.cm.levers',CM_LEVERS).map(function(l){
  var on=!!s[l.id];
  var savTxt=l.price?(cm$(-l.sav)+'/yr'):'term';
  var threeYr=l.price?cm$(-l.sav*3):'—';
  var protTxt=(l.prot>0?'+':'')+l.prot+' pts';
  return '<div class="cmlv'+(on?' on':'')+'" onclick="cmToggleLever(\''+l.id+'\')">'+
    '<div class="cmlv-top"><span class="cmlv-chk">'+(on?'✓':'')+'</span><span class="cmlv-name">'+escD(l.name)+'</span><span class="cmlv-eff '+l.eff+'">'+escD(CM_EFF_LBL[l.eff])+'</span></div>'+
    '<div class="cmlv-sub">'+escD(l.sub)+'</div>'+
    '<div class="cmlv-figs"><span class="cmlv-f"><b>'+savTxt+'</b><i>annual price</i></span><span class="cmlv-f"><b>'+threeYr+'</b><i>3-yr price</i></span><span class="cmlv-f"><b>'+protTxt+'</b><i>protection</i></span></div>'+
   '</div>';
 }).join('');
 var headline=CM_HORIZON==='y1'?m.y1After:m.threeYrAfter;
 var headK=(CM_HORIZON==='y1'?'modeled Yr-1 annual cost':'modeled 3-yr contract value')+(m.n?'':' · select levers');
 var maxB=Math.max(1,m.bars[0],m.bars[1],m.bars[2]);
 var barLbls=['Before','Yr 1','Steady'];
 var bars=m.bars.map(function(v,i){return '<div class="cmbar"><span class="bv">'+cm$(v)+'</span><i style="height:'+Math.round(v/maxB*100)+'%"></i><span class="bl">'+barLbls[i]+'</span></div>';}).join('');
 var annualAfter=CM_HORIZON==='y1'?m.y1After:m.steadyAfter;
 var saveYr=CM_LEV_BASE.annual-annualAfter;
 var panel='<div class="cmnp">'+
   '<div class="cmnp-hz"><button class="'+(CM_HORIZON==='y1'?'on':'')+'" onclick="cmSetHorizon(\'y1\')">Short term · Yr 1</button><button class="'+(CM_HORIZON==='3yr'?'on':'')+'" onclick="cmSetHorizon(\'3yr\')">Long term · 3 yr</button></div>'+
   '<div class="cmnp-big">'+cm$(headline)+'</div><div class="cmnp-bigk">'+escD(headK)+'</div>'+
   '<div class="cmnp-bars">'+bars+'</div>'+
   '<div class="cmnp-row"><span class="k">Annual cost</span><span class="v">'+cm$(CM_LEV_BASE.annual)+' → <b>'+cm$(annualAfter)+'</b>'+(saveYr>0?' <span class="save">(−'+cm$(saveYr)+'/yr)</span>':'')+'</span></div>'+
   '<div class="cmnp-row"><span class="k">3-year contract value</span><span class="v">'+cm$(m.threeYrBefore)+' → <b>'+cm$(m.threeYrAfter)+'</b></span></div>'+
   '<div class="cmnp-row"><span class="k">Playbook Alignment Score <i>(higher = better)</i></span><span class="v">'+m.protBase+' → <b>'+m.protAfter+'</b>'+(m.protDelta!==0?' <span class="save">('+(m.protDelta>0?'+':'')+m.protDelta+' pts)</span>':'')+' <i>/100</i></span></div>'+
   '<div class="cmnp-protbar"><i style="width:'+m.protAfter+'%"></i></div>'+
   '<div class="cmnp-row"><span class="k">Est. negotiation rounds</span><span class="v">'+(m.rounds<=1?'1':'~'+m.rounds)+(m.rounds>=4?'+':'')+' round'+(m.rounds===1?'':'s')+'</span></div>'+
   '<div class="cmnp-note">Directional model on the WO pricing, <b>not Finance-approved</b>. Overlapping price levers are de-rated against a shared price pool, not summed. Nothing is countered or signed on your behalf.</div>'+
  '</div>';
 return '<div class="cmlv-rec"><b>Recommended package:</b> license step-down + hold flat per-seat + fixed-fee implementation + CPI renewal cap + the two compliance red lines (PI-breach carve-out, Lilly DPA). Best balance of net savings and protection. Toggle any lever to model it alone or combined.</div>'+
  '<div class="cmlv-wrap"><div class="cmlv-col">'+cards+'</div>'+panel+'</div>';
}
function cmToggleLever(id){var s=cmLeverSel();if(s[id])delete s[id];else s[id]=true;var m=document.getElementById('cmLeverMount');if(m)m.innerHTML=cmLeverInner();}
function cmSetHorizon(h){CM_HORIZON=h;var m=document.getElementById('cmLeverMount');if(m)m.innerHTML=cmLeverInner();}
function cmLeverHTML(){
 return '<div class="sect">'+cmHd('Model the negotiation, levers & Playbook Alignment Score','price + protection deltas · Yr-1 / 3-yr horizon')+
  '<div class="spnote" style="margin-bottom:10px">A distinct commercial modeling panel (not the Pro-forma NPV slider). Toggle pricing and protective levers to model the blended effect on cost and protection; overlapping price discounts are de-rated, not summed.</div>'+
  '<div id="cmLeverMount">'+cmLeverInner()+'</div></div>';
}
// ---- ITEM 12a: volume / consolidation leverage ----
function cmVolumeHTML(){
 var cards=[
  {h:'Consolidation sizing',c:'var(--plum)',p:'400 seats across 3 Lilly entities today. Two more entities in scope would add ~250 seats (→ ~650), crossing into the next volume tier. Consolidating the spend under one agreement is the leverage: one negotiation, one rate, a larger commitment to price against.'},
  {h:'Multi-year commitment value',c:'var(--plum)',p:'A 3-year commitment is ~$2.1M of bankable revenue to Visier versus a 1-year deal. That certainty, not a higher fee, is the trade currency for the license step-down and the renewal cap. Price against the term, not the sticker.'},
  {h:'Growth-trigger tiering',c:'#B45309',p:'Propose per-seat pricing that steps DOWN as seats grow: 1–400 @ $1,300, 401–600 @ $1,150 (~88%), 601+ @ $1,050 (~81%). Aligns price with Lilly expansion instead of a flat rate that ignores volume growth.'}
 ];
 var body=cards.map(function(c){return '<div class="cmvol" style="border-left:4px solid '+c.c+'"><h4>'+escD(c.h)+'</h4><p>'+escD(c.p)+'</p></div>';}).join('');
 return '<div class="sect">'+cmHd('Volume & consolidation leverage','consolidation sizing · multi-year value · growth-trigger tiers')+body+'</div>';
}
// ---- ITEM 12b: 5-persona tone-matched counter-email (draft-don't-send) ----
var CM_EMAIL_TONE='Collaborative';
var CM_EMAIL=_PVCM.email||{subject:'',asks:[],tones:{Standard:{open:'',close:''}}};
function cmEmailHTML(){
 var EM=pvData('deal.cm.email',CM_EMAIL);var t=CM_EMAIL_TONE;var tn=EM.tones[t]||EM.tones.Standard;
 var toneRow='<div class="cmtone-row"><span class="cmtone-lbl">Tone</span>'+NEG_TONES.map(function(x){var on=x===t;return '<button class="cmtone-btn'+(on?' on':'')+'" onclick="cmSetEmailTone(\''+x+'\')">'+escD(x)+'</button>';}).join('')+'</div>';
 var asks='<ul class="cmem-asks">'+EM.asks.map(function(a){return '<li>'+escD(a)+'</li>';}).join('')+'</ul>';
 var email='<div class="cmem"><div class="cmem-h"><span class="cmem-k">Subject</span><span class="cmem-v">'+escD(EM.subject)+'</span></div>'+
   '<div class="cmem-body"><p>Hi [Visier lead],</p><p>'+escD(tn.open)+'</p>'+asks+'<p>'+escD(tn.close)+'</p><p>Best regards,<br>[Rep] · Lilly Sourcing</p></div>'+
   '<div class="cmem-actions"><button class="btn btn-ghost btn-sm" onclick="cmEmailAct(\'copy\')">Copy draft</button><button class="btn btn-ghost btn-sm" onclick="cmEmailAct(\'save\')">Save to drafts</button><span class="cmem-draft">Draft, not sent</span></div></div>';
 return '<div class="sect" id="cmEmailSect">'+cmHd('Counter-email, draft','5-persona tone-matched · draft-don’t-send')+
  '<div class="spnote" style="margin-bottom:10px">Same substance, five personas, the asks never change, only the framing. This is a draft for the rep; nothing is sent.</div>'+toneRow+email+'</div>';
}
function cmSetEmailTone(t){CM_EMAIL_TONE=t;var el=document.getElementById('cmEmailSect');if(el)el.outerHTML=cmEmailHTML();}
function cmEmailAct(a){toast(a==='copy'?'Counter-email draft copied, review before sending; nothing was sent.':'Counter-email saved to your drafts, draft-only, nothing was sent.');}
// ---- assembly: the whole Commercial section (Deal / Negotiate) ----
function dealCommercialExtras(){
 ensureCmCss();
 return '<div class="cmwrap">'+
  '<div class="cmbanner"><span class="cmbadge">Commercial analysis</span><span>Reflect-only · benchmark bands gated at N≥5 · estimates labeled · the counter-email is a draft. Positive framing is shown in blue, never green.</span></div>'+
  cmPricingModelHTML()+
  cmBenchmarkHTML()+
  cmCounterHTML()+
  cmVarAssumeHTML()+
  cmWaterfallHTML()+
  cmLeverHTML()+
  cmVolumeHTML()+
  cmEmailHTML()+
 '</div>';
}
// ── Deal sub-mode 2: PRICING & COMMERCIAL (the numbers) ──────────────────────
// Negotiate breakout part 2 (approved IA): the Levers & Protection-Score model is
// the HERO (interactive live price<->protection tradeoff), ZOPA by line item +
// Total-deal ZOPA/TCO and the ranked counter + trade matrix are surfaced near the
// top, with the negotiation-prep summary card; the denser depth (pricing-model rec,
// benchmark bands, discount waterfall, value-at-risk, volume leverage, counter-email
// draft) collapses behind one on-demand expander. Reflect-only; nothing is sent.
function dealPricingHTML(){
 ensureCmCss();
 var banner='<div class="cmbanner"><span class="cmbadge">Commercial analysis</span><span>Reflect-only · illustrative demo figures · benchmark bands gated at N&ge;5 · the counter-email is a draft. Positive framing is shown in blue, never green.</span></div>';
 var depth='<details class="dfold"><summary>Pricing depth · model recommendation · benchmark bands · discount waterfall · value-at-risk · volume leverage · counter-email draft</summary>'+
   cmPricingModelHTML()+cmBenchmarkHTML()+cmWaterfallHTML()+cmVarAssumeHTML()+cmVolumeHTML()+cmEmailHTML()+'</details>';
 return '<div class="cmwrap">'+banner+
   cmLeverHTML()+            // HERO: levers & Protection-Score model (interactive)
   (typeof dealNegPrepCardHTML==='function'?dealNegPrepCardHTML():'')+   // negotiation-prep summary card (compact)
   (typeof dealPricingPersist==='function'?dealPricingPersist():'')+     // ZOPA by line item + Total-deal ZOPA/TCO
   cmCounterHTML()+          // ranked counter-proposal + trade matrix
   depth+
   (typeof dealRateCardHTML==='function'?dealRateCardHTML():'')+         // contracted rate card (hide-until-data)
 '</div>';
}
/* ===========================================================================
 * PRO-FORMA TCO teardown (Wave 5b, item 11) - Deal / Pro-forma. Extends the TCO
 * beyond the quoted lines with modeled hidden / soft costs (training / T&E /
 * change-order / integration / admin), a hidden-cost ratio chip, an explicit
 * Year-1-%-of-TCO metric, and escalation-over-term modeling. Additive: it does
 * NOT touch the P&L matrix, scenarios, tornado, NPV slider or CSV export - it
 * renders as its own section that layers estimates ON TOP of the quoted numbers.
 * Reflect-only / directional; Finance owns committed figures. NO GREEN.
 * ========================================================================= */
var PF_ESC=0;   // teardown escalation rate (%/yr); 0 = flat (matches the base model)
function pfTeardownModel(payload){
 var years=payload.horizonYears||3;
 var upfront=0,recPerYr=0;
 payload.costLines.forEach(function(c){var v1=pfLineTotal(c,1);if(c.oneTime)upfront+=v1;else recPerYr+=v1;});
 var visible=upfront+recPerYr*years;
 var implOne=upfront;   // the only quoted one-time line is the implementation
 var admYr=Math.round(recPerYr*0.025);
 var hidden=[
  {label:'Training / enablement',basis:'~$120/seat onboarding + annual refresh',total:48000+16000*Math.max(0,years-1),y1:48000},
  {label:'Travel & expense (T&E)',basis:'~12% of implementation',total:Math.round(implOne*0.12),y1:Math.round(implOne*0.12)},
  {label:'Change orders / scope growth',basis:'~6% of recurring over term (contingency)',total:Math.round(recPerYr*years*0.06),y1:Math.round(recPerYr*years*0.06/years)},
  {label:'Integration / interfaces',basis:'one-time SFTP / API build to Lilly HR',total:65000,y1:65000},
  {label:'Vendor management / admin',basis:'~2.5% of recurring/yr internal oversight',total:admYr*years,y1:admYr}
 ];
 var hiddenTotal=hidden.reduce(function(s,h){return s+h.total;},0);
 var y1Hidden=hidden.reduce(function(s,h){return s+h.y1;},0);
 return {years:years,upfront:upfront,recPerYr:recPerYr,admYr:admYr,visible:visible,hidden:hidden,
  hiddenTotal:hiddenTotal,allIn:visible+hiddenTotal,ratio:visible>0?hiddenTotal/visible:0,
  year1:upfront+recPerYr+y1Hidden};
}
function pfEscImpact(m,rate){
 var g=(rate||0)/100;var N=m.years;var R0=m.recPerYr+m.admYr;   // recurring lines that escalate (license + support + admin)
 var sum=0;for(var k=0;k<N;k++)sum+=Math.pow(1+g,k);
 return Math.round(R0*(sum-N));
}
function pfSetEsc(v){var n=parseFloat(v);PF_ESC=isFinite(n)?Math.max(0,Math.min(10,n)):0;var el=document.getElementById('pfTeardownSect');if(el)el.outerHTML=pfTeardownHTML();}
function pfTeardownHTML(){
 ensureCmCss();
 var payload=(typeof dealProFormaPayload==='function')?dealProFormaPayload():null;
 if(!payload)return '<div class="sect" id="pfTeardownSect"></div>';
 var m=pfTeardownModel(payload);
 var esc=pfEscImpact(m,PF_ESC);
 var allInEsc=m.allIn+esc;
 var y1pct=m.allIn>0?Math.round(m.year1/m.allIn*100):0;
 var ratioPct=Math.round(m.ratio*100);
 var chips='<div class="cmtd-chips">'+
   '<div class="cmtd-chip"><div class="v">'+cm$(allInEsc)+'</div><div class="l">All-in TCO ('+m.years+'-yr, incl. hidden'+(PF_ESC>0?' + escalation':'')+')</div></div>'+
   '<div class="cmtd-chip"><div class="v">'+m.ratio.toFixed(2)+'×</div><div class="l">Hidden-cost ratio ('+ratioPct+'% on top of quoted)</div></div>'+
   '<div class="cmtd-chip"><div class="v">'+y1pct+'%</div><div class="l">Year 1 as % of TCO</div></div>'+
   '<div class="cmtd-chip"><div class="v">'+(esc>0?'+'+cm$(esc):cm$(0))+'</div><div class="l">Escalation impact @ '+PF_ESC+'%/yr</div></div>'+
  '</div>';
 var visRows=pfComponents(payload).filter(function(c){return c.amt>0;}).map(function(c){return '<tr><td class="cmask">'+escD(c.label)+'</td><td class="cmtd-basis">quoted</td><td class="cmimp">'+cm$(c.amt)+'</td></tr>';}).join('');
 var hidRows=m.hidden.map(function(h){return '<tr><td class="cmask">'+escD(h.label)+'</td><td class="cmtd-basis">'+escD(h.basis)+'</td><td class="cmimp">'+cm$(h.total)+'</td></tr>';}).join('');
 var table='<table class="cmtbl cmtd-tbl"><thead><tr><th>Component</th><th>Basis</th><th>Over '+m.years+'-yr</th></tr></thead><tbody>'+
   '<tr class="cmtd-sec"><td colspan="3">Quoted (in the proposal)</td></tr>'+visRows+
   '<tr class="cmtd-sub"><td class="cmask">Visible subtotal</td><td></td><td class="cmimp">'+cm$(m.visible)+'</td></tr>'+
   '<tr class="cmtd-sec"><td colspan="3">Hidden / soft costs (modeled estimate, not quoted)</td></tr>'+hidRows+
   '<tr class="cmtd-sub"><td class="cmask">Hidden subtotal</td><td></td><td class="cmimp">'+cm$(m.hiddenTotal)+'</td></tr>'+
   (PF_ESC>0?'<tr class="cmtd-sub"><td class="cmask">Escalation @ '+PF_ESC+'%/yr</td><td class="cmtd-basis">recurring uplift over term</td><td class="cmimp">'+cm$(esc)+'</td></tr>':'')+
   '<tr class="cmtd-tot"><td class="cmask">All-in TCO</td><td></td><td class="cmimp">'+cm$(allInEsc)+'</td></tr>'+
  '</tbody></table>';
 var escCtl='<div class="cmtd-esc"><span class="cmtd-esclbl">Escalation over term</span>'+[0,3,4,6].map(function(r){return '<button class="cmtd-escb'+(PF_ESC===r?' on':'')+'" onclick="pfSetEsc('+r+')">'+r+'%</button>';}).join('')+'<span class="cmtd-escnote">year-over-year uplift on the recurring lines (license + support + admin). Recurring is otherwise modeled flat.</span></div>';
 return '<div class="sect" id="pfTeardownSect">'+cmHd('TCO teardown, hidden costs, Year-1 load & escalation','training / T&E / change-order / integration / admin · layered on the quoted lines')+
  chips+'<div class="card" style="padding:4px 6px">'+table+'</div>'+escCtl+
  '<div class="pfnote">The hidden / soft lines are directional estimates layered on the quoted pricing (they are NOT in the supplier number), they show the true all-in and where unquoted cost hides. Reflect-only; Finance owns the committed figures.</div></div>';
}
function ensureCmCss(){ if(document.getElementById('cm-css'))return; var s=document.createElement('style'); s.id='cm-css'; s.textContent=
 '.cmwrap{margin:2px 0 0}'+
 '.cmbanner{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--blue-t,#E8EEF6);border:1px solid #C6D7EF;border-radius:11px;padding:9px 13px;margin:0 0 14px;font-size:12px;line-height:1.5;color:var(--ink,#1A1A1A)}'+
 '.cmbadge{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:#fff;background:var(--plum);border-radius:30px;padding:3px 9px;white-space:nowrap}'+
 '.cmsubh{font:700 11px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2,#8A827C);margin:14px 0 7px}'+
 '.cmtbl{width:100%;border-collapse:collapse;font-size:12.5px}'+
 '.cmtbl th{text-align:left;font:700 9.5px var(--mono,monospace);letter-spacing:.04em;text-transform:uppercase;color:var(--mut2,#8A827C);padding:7px 8px;border-bottom:1px solid var(--line2,#E0DCD5);white-space:nowrap}'+
 '.cmtbl td{padding:7px 8px;border-top:1px solid var(--line,#EEE);vertical-align:top;color:var(--ink,#1A1A1A);line-height:1.45}'+
 '.cmask{font-weight:600}'+
 '.cmrank{text-align:center;font-weight:700;color:var(--plum);width:24px}'+
 '.cmimp{font-weight:700;color:var(--plum);white-space:nowrap;text-align:right}'+
 '.cmexp{color:#C8202E;font-weight:700;white-space:nowrap}'+
 '.cmprot{color:#B45309}'+
 '.cmprio{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:30px;white-space:nowrap;color:#fff}'+
 '.cmprio.must{background:#C8202E}.cmprio.high{background:#B45309}.cmprio.med{background:#8A827C}'+
 '.cmnet{font:700 10px var(--sans,system-ui,sans-serif);white-space:nowrap}.cmnet.good{color:var(--plum)}.cmnet.mut{color:#8A827C}'+
 '.cmconf{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 8px;border-radius:30px;white-space:nowrap}'+
 '.cmconf.hi{background:rgba(92,43,80,.12);color:var(--plum)}.cmconf.md{background:var(--amber-t,#FBF1DA);color:var(--amber-d)}.cmconf.lo{background:var(--pink-t,#FBE7E3);color:#C8202E}'+
 // item 7
 '.cmpm-rec{background:var(--blue-t,#E8EEF6);border:1px solid #C6D7EF;border-left:3px solid var(--plum);border-radius:10px;padding:10px 13px;margin:0 0 12px;font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A)}'+
 '.cmpm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}'+
 '@media(max-width:900px){.cmpm-grid{grid-template-columns:repeat(2,1fr)}}'+
 '@media(max-width:600px){.cmpm-grid{grid-template-columns:1fr}}'+
 '.cmpm-card{border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:11px 13px;background:var(--surface)}'+
 '.cmpm-card.good{border-left:3px solid var(--plum)}.cmpm-card.warn{border-left:3px solid #B45309}.cmpm-card.mut{border-left:3px solid #C6C0B8}'+
 '.cmpm-top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:5px}'+
 '.cmpm-name{font-weight:700;font-size:13px;color:var(--ink,#1A1A1A)}'+
 '.cmpm-fit{font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 8px;border-radius:30px;white-space:nowrap}'+
 '.cmpm-fit.good{background:rgba(92,43,80,.12);color:var(--plum)}.cmpm-fit.warn{background:var(--tint-fff0d8,#FFF0D8);color:#B45309}.cmpm-fit.mut{background:var(--bg,#F4F1EC);color:var(--mut2)}'+
 '.cmpm-when{font-size:11.5px;color:var(--mut2,#8A827C);line-height:1.4;margin-bottom:8px}'+
 '.cmpm-pc{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
 '.cmpm-ph{font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--plum);margin-bottom:2px}.cmpm-ph.amb{color:#B45309}'+
 '.cmpm-ul{margin:0;padding-left:15px}.cmpm-ul li{font-size:11.5px;line-height:1.4;color:var(--ink,#1A1A1A);margin-bottom:2px}'+
 '.cmpm-risk{font-size:12px;line-height:1.5;color:var(--mut,#3E3933);margin-top:9px;border-top:1px solid var(--line,#EEE);padding-top:8px}'+
 // item 8
 '.cmbb-line{padding:11px 0;border-bottom:1px solid var(--line,#EEE)}.cmbb-line:last-child{border-bottom:none}'+
 '.cmbb-head{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:3px}'+
 '.cmbb-name{font-weight:700;font-size:13px;color:var(--ink,#1A1A1A);flex:1;min-width:150px}'+
 '.cmbb-ask{font:600 11.5px var(--mono,monospace);color:var(--mut,#3E3933)}'+
 '.cmbb-meta{font-size:11px;color:var(--mut2,#8A827C);margin-bottom:8px}'+
 '.cmbb-gate{background:var(--amber-t,#FBF1DA);border:1px solid #E7C66B;border-radius:9px;padding:9px 11px;font-size:12px;line-height:1.5;color:#6E5600}'+
 '.cmbb-track{position:relative;height:16px;margin:4px 0 6px;background:var(--bg,#F4F1EC);border-radius:8px}'+
 '.cmbb-range{position:absolute;top:50%;transform:translateY(-50%);height:8px;background:rgba(92,43,80,.16);border:1px solid rgba(92,43,80,.4);border-radius:5px}'+
 '.cmbb-p50{position:absolute;top:calc(50% - 8px);width:2px;height:16px;background:var(--plum)}'+
 '.cmbb-askm{position:absolute;top:calc(50% - 8px);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid var(--plum)}'+
 '.cmbb-askm.warn{border-top-color:#B45309}.cmbb-askm.good{border-top-color:var(--plum)}'+
 '.cmbb-scale{display:flex;justify-content:space-between;font-size:10.5px;color:var(--mut2,#8A827C);margin-bottom:4px}'+
 '.cmbb-pos{font:600 11.5px var(--sans,system-ui,sans-serif)}.cmbb-pos.good{color:var(--plum)}.cmbb-pos.warn{color:#B45309}'+
 '.cmbb-logh{font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--mut2,#8A827C);margin:9px 0 3px}'+
 '.cmbb-log th,.cmbb-log td{font-size:11px;padding:5px 7px}'+
 '.cmtier{font:700 9px var(--mono,monospace);color:var(--plum);background:rgba(92,43,80,.10);border-radius:5px;padding:1px 6px}'+
 '.cmtier-legend{font-size:11px;line-height:1.5;color:var(--mut2,#8A827C);margin-top:11px;padding-top:9px;border-top:1px solid var(--line,#EEE)}'+
 // item 10 waterfall
 '.cmwf-row{display:flex;align-items:stretch;gap:11px;margin-bottom:7px}'+
 '.cmwf-amt{flex:0 0 116px;display:flex;align-items:center;justify-content:flex-end;font:700 13px var(--sans,system-ui,sans-serif);border-radius:8px;padding:8px 11px;background:var(--bg,#F4F1EC);color:var(--ink,#1A1A1A)}'+
 '.cmwf-amt.cut{background:var(--blue-t,#E8EEF6);color:var(--plum)}.cmwf-amt.top{background:var(--surface);border:1px solid var(--line2,#E0DCD5)}.cmwf-amt.net{background:var(--plum);color:#fff}'+
 '.cmwf-desc{display:flex;flex-direction:column;justify-content:center}.cmwf-desc b{font-size:12.5px;color:var(--ink,#1A1A1A)}.cmwf-desc span{font-size:11.5px;color:var(--mut2,#8A827C);line-height:1.4}'+
 '.cmwf-insight{background:var(--blue-t,#E8EEF6);border:1px solid #C6D7EF;border-left:3px solid var(--plum);border-radius:10px;padding:10px 13px;margin-top:11px;font-size:12.5px;line-height:1.55;color:var(--ink,#1A1A1A)}'+
 // item 10 levers
 '.cmlv-rec{background:var(--blue-t,#E8EEF6);border:1px solid #C6D7EF;border-radius:10px;padding:10px 13px;margin:0 0 12px;font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A)}'+
 '.cmlv-wrap{display:grid;grid-template-columns:1fr 320px;gap:14px;align-items:start}'+
 '@media(max-width:820px){.cmlv-wrap{grid-template-columns:1fr}}'+
 '.cmlv{border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:10px 12px;margin-bottom:9px;background:var(--surface);cursor:pointer;transition:border-color .12s,box-shadow .12s}'+
 '.cmlv:hover{border-color:#C6D7EF}.cmlv.on{border-color:var(--plum);box-shadow:0 0 0 1px var(--plum) inset}'+
 '.cmlv-top{display:flex;align-items:center;gap:8px}'+
 '.cmlv-chk{flex:none;width:17px;height:17px;border-radius:5px;border:1.5px solid var(--line2,#E0DCD5);color:#fff;background:var(--surface);font:700 11px var(--sans,system-ui,sans-serif);display:flex;align-items:center;justify-content:center}'+
 '.cmlv.on .cmlv-chk{background:var(--plum);border-color:var(--plum)}'+
 '.cmlv-name{font-weight:700;font-size:12.5px;color:var(--ink,#1A1A1A);flex:1}'+
 '.cmlv-eff{font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 7px;border-radius:30px;white-space:nowrap}'+
 '.cmlv-eff.lo{background:rgba(92,43,80,.10);color:var(--plum)}.cmlv-eff.md{background:var(--amber-t,#FBF1DA);color:var(--amber-d)}.cmlv-eff.hi{background:var(--pink-t,#FBE7E3);color:#C8202E}'+
 '.cmlv-sub{font-size:11.5px;color:var(--mut2,#8A827C);line-height:1.45;margin:5px 0 8px}'+
 '.cmlv-figs{display:flex;gap:6px}'+
 '.cmlv-f{flex:1;background:var(--bg,#F7F5F1);border-radius:8px;padding:6px 7px;text-align:center}'+
 '.cmlv-f b{display:block;font-size:11.5px;color:var(--plum);font-weight:700}.cmlv-f i{display:block;font-size:8.5px;font-style:normal;color:var(--mut2,#8A827C);text-transform:uppercase;letter-spacing:.02em;margin-top:2px}'+
 '.cmnp{border:1px solid var(--line2,#E0DCD5);border-radius:12px;background:var(--surface);padding:13px;position:sticky;top:8px}'+
 '.cmnp-hz{display:inline-flex;background:var(--bg,#F4F1EC);border:1px solid var(--line2,#E0DCD5);border-radius:9px;padding:3px;margin-bottom:11px;width:100%}'+
 '.cmnp-hz button{flex:1;border:0;background:none;font:600 11.5px var(--sans,system-ui,sans-serif);color:var(--mut2,var(--mut2));padding:6px 8px;border-radius:7px;cursor:pointer}'+
 '.cmnp-hz button.on{background:var(--surface);color:var(--ink,#1A1A1A);box-shadow:0 1px 3px rgba(0,0,0,.1)}'+
 '.cmnp-big{font:800 26px var(--sans,system-ui,sans-serif);color:var(--plum);line-height:1}'+
 '.cmnp-bigk{font-size:11px;color:var(--mut2,#8A827C);margin:3px 0 11px}'+
 '.cmnp-bars{display:flex;align-items:flex-end;gap:10px;height:78px;margin-bottom:12px;padding:0 4px}'+
 '.cmbar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}'+
 '.cmbar .bv{font:700 9.5px var(--mono,monospace);color:var(--mut,#3E3933);margin-bottom:3px}'+
 '.cmbar i{width:70%;background:linear-gradient(#3E6BB0,var(--plum));border-radius:4px 4px 0 0;min-height:3px}'+
 '.cmbar .bl{font-size:9px;color:var(--mut2,#8A827C);margin-top:4px}'+
 '.cmnp-row{display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:5px 0;border-top:1px solid var(--line,#EEE)}'+
 '.cmnp-row .k{color:var(--mut2,#8A827C)}.cmnp-row .k i{font-style:normal;font-size:10px}.cmnp-row .v{text-align:right;color:var(--ink,#1A1A1A)}.cmnp-row .v i{font-style:normal;color:var(--mut2,#8A827C)}'+
 '.cmnp-row .save{color:var(--plum);font-weight:600}'+
 '.cmnp-protbar{height:7px;border-radius:5px;background:var(--bg,#F4F1EC);overflow:hidden;margin:2px 0 4px}.cmnp-protbar i{display:block;height:100%;background:var(--plum);border-radius:5px}'+
 '.cmnp-note{font-size:10px;color:var(--mut2,#8A827C);line-height:1.5;margin-top:9px}'+
 // item 12 volume + email
 '.cmvol{background:var(--surface);border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:11px 14px;margin-bottom:9px}'+
 '.cmvol h4{margin:0 0 4px;font:700 13px var(--sans,system-ui,sans-serif);color:var(--ink,#1A1A1A)}'+
 '.cmvol p{margin:0;font-size:12.5px;line-height:1.55;color:var(--mut,#3E3933)}'+
 '.cmtone-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 10px}'+
 '.cmtone-lbl{font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2,#8A827C);margin-right:3px}'+
 '.cmtone-btn{border:1px solid var(--line2,#E0DCD5);background:var(--surface);border-radius:30px;padding:5px 12px;font:600 12px var(--sans,system-ui,sans-serif);color:var(--mut,#3E3933);cursor:pointer}'+
 '.cmtone-btn.on{border-width:1.5px;border-color:var(--plum);color:var(--plum);font-weight:700}'+
 '.cmem{border:1px solid var(--line2,#E0DCD5);border-radius:12px;background:var(--surface);overflow:hidden}'+
 '.cmem-h{display:flex;gap:9px;align-items:baseline;padding:10px 14px;border-bottom:1px solid var(--line,#EEE);background:var(--bg,#FBFAF9)}'+
 '.cmem-k{font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--mut2,#8A827C)}'+
 '.cmem-v{font-weight:700;font-size:12.5px;color:var(--ink,#1A1A1A)}'+
 '.cmem-body{padding:12px 14px;font-size:12.5px;line-height:1.6;color:var(--ink,#1A1A1A)}.cmem-body p{margin:0 0 9px}'+
 '.cmem-asks{margin:0 0 9px;padding-left:18px}.cmem-asks li{margin-bottom:3px}'+
 '.cmem-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--line,#EEE)}'+
 '.cmem-draft{font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:#B45309;margin-left:auto}'+
 // item 11 teardown
 '.cmtd-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 12px}'+
 '@media(max-width:680px){.cmtd-chips{grid-template-columns:repeat(2,1fr)}}'+
 '.cmtd-chip{border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:10px 12px;background:var(--surface)}'+
 '.cmtd-chip .v{font:800 19px var(--sans,system-ui,sans-serif);color:var(--plum);line-height:1.1}'+
 '.cmtd-chip .l{font-size:10.5px;color:var(--mut2,#8A827C);margin-top:3px;line-height:1.35}'+
 '.cmtd-basis{color:var(--mut2,#8A827C);font-size:11.5px}'+
 '.cmtd-sec td{font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--mut2,#8A827C);background:var(--bg,#FBFAF9)}'+
 '.cmtd-sub td{font-weight:700;border-top:1px solid var(--line2,#E0DCD5)}'+
 '.cmtd-tot td{font-weight:800;border-top:2px solid var(--plum);color:var(--plum)}.cmtd-tot .cmimp{color:var(--plum)}'+
 '.cmtd-esc{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:11px 0 0}'+
 '.cmtd-esclbl{font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2,#8A827C)}'+
 '.cmtd-escb{border:1px solid var(--line2,#E0DCD5);background:var(--surface);border-radius:8px;padding:5px 11px;font:600 12px var(--sans,system-ui,sans-serif);color:var(--mut,#3E3933);cursor:pointer}'+
 '.cmtd-escb.on{border-color:var(--plum);color:var(--plum);font-weight:700;background:var(--blue-t,#E8EEF6)}'+
 '.cmtd-escnote{font-size:11px;color:var(--mut2,#8A827C);flex:1;min-width:180px;line-height:1.4}'
 ; document.head.appendChild(s);
}
// ===== Negotiation prep summary card (ADDITIVE, reflect-only) =====
// ONE compact key/value card ABOVE the ZOPA section in Deal/Negotiate: should-cost
// anchor + market benchmark (confidence) + recommended pricing model + the combined
// target range that feeds the ZOPA opening marker below. Display only - nothing is
// sent or decided. Live data comes from POST /api/commercial-negotiation via
// LillyAPI.tryLive; offline keeps the demo object. Every dynamic value is escaped
// (escD) before innerHTML; the "(?)" opens the Help Center for sources/provenance.
// Positive accent = Bold Blue var(--plum) (never green); ASCII copy, no em dashes.
var DEAL_PREP_LIVE=null;   // last live CommercialNegotiationReflection {prep,dashboard}, or null (demo)
var DEAL_PREP_OPEN=true;   // collapse state for the summary card
// demo fallback: sensible per-year figures consistent with the page's NEGPREP story
var DEMO_PREP=_PVCM.demoPrep||{anchor:'',anchorNote:'',bench:'',benchConf:'',model:'',combinedLo:'',combinedHi:''};
function ensurePrepCardCss(){ if(document.getElementById('prepcard-css'))return; var s=document.createElement('style'); s.id='prepcard-css'; s.textContent=
 '.prephdr{display:inline-flex;align-items:center;gap:8px}'+
 '.prephelp{font:700 11px var(--mono,monospace);color:var(--plum);cursor:pointer;text-decoration:none}'+
 '.prephelp:hover{text-decoration:underline}'+
 '.prepcaret{border:none;background:none;color:var(--mut2,#8A827C);cursor:pointer;font-size:13px;line-height:1;padding:2px 4px}'+
 '.prepcaret:hover{color:var(--plum)}'+
 '.prepkv{width:100%;border-collapse:collapse;font-size:var(--fz-sm,12.5px)}'+
 '.prepkv td{padding:7px 8px;border-top:1px solid var(--line,#EEE);vertical-align:top}'+
 '.prepkv tr:first-child td{border-top:none}'+
 '.prepkv .pk{width:170px;color:var(--mut2,#8A827C);font-weight:600;white-space:nowrap}'+
 '.prepkv .pv{color:var(--ink,#1A1A1A)}'+
 '.prepkv tr.preptotal td{border-top:2px solid var(--plum);padding-top:9px}'+
 '.prepkv tr.preptotal .pk,.prepkv tr.preptotal .pv{color:var(--plum);font-weight:700}'+
 '.prepconf{display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:30px;margin-left:6px;vertical-align:middle}'+
 '.prepconf.hi{background:rgba(92,43,80,.12);color:var(--plum)}'+
 '.prepconf.md{background:var(--amber-t,#FBF1DA);color:var(--amber-d,#8A5A00)}'+
 '.prepconf.lo{background:var(--pink-t,#FBE7E3);color:var(--red,#C8202E)}'+
 '.prepzopa{font:600 10.5px var(--mono,monospace);color:var(--mut2,#8A827C);margin-left:7px;white-space:nowrap}'+
 '.prepsub{font-size:11px;color:var(--mut2,#8A827C);margin-left:6px}'+
 '.prepna{font-size:12px;color:var(--mut2,#8A827C);font-style:italic}'+
 '.prepnote{font-size:11px;color:var(--mut2,#8A827C);font-style:italic;margin-top:8px;line-height:1.45}'
 ; document.head.appendChild(s);
}
// $ formatter for live numeric fields (mirrors the service's fmtUsd)
function prepUsd(n){if(typeof n!=='number'||!isFinite(n))return '';var a=Math.abs(n);return a>=1e6?('$'+(n/1e6).toFixed(1)+'M'):a>=1000?('$'+Math.round(n/1000)+'K'):('$'+Math.round(n));}
function prepConfChip(c){c=(''+(c||'')).toLowerCase();if(!c)return '';
 var k=c.indexOf('high')===0?'hi':c.indexOf('med')===0?'md':'lo';
 var lab=k==='hi'?'High':k==='md'?'Medium':'Low';
 return '<span class="prepconf '+k+'">'+lab+'</span>';}
function prepNa(msg){return '<span class="prepna">Data not available - '+escD(msg)+'</span>';}
// the four row values, from the LIVE reflection (anti-fabrication: a coverage gap
// renders "Data not available", never an invented number)
function dealPrepRowsLive(refl){
 var prep=refl.prep||{};var basis=prep.dataBasis||{};
 var sc=prep.shouldCostRead;
 var r1=(sc&&typeof sc.base==='number')?('<b>'+escD(prepUsd(sc.base))+'</b><span class="prepsub">bottoms-up base</span>'):prepNa('add a should-cost model');
 var b=(prep.rateBenchmarks&&prep.rateBenchmarks[0])||null;
 var r2=(b&&typeof b.median==='number')?('<b>'+escD(prepUsd(b.median))+'</b>'+prepConfChip(b.confidence)):prepNa('add market rate benchmarks');
 var model=prep.pricingModel||prep.recommendedModel||null;   // no canonical live field today; guarded lookup only
 var r3=model?('<b>'+escD(model)+'</b>'):prepNa('add pricing-model facts');
 var z=prep.zopa;
 var r4=(basis.hasPosition&&z&&typeof z.target==='number'&&typeof z.walkAway==='number')?('<b>'+escD(prepUsd(z.target))+' to '+escD(prepUsd(z.walkAway))+'</b>'):prepNa('add a negotiation position');
 return {r1:r1,r2:r2,r3:r3,r4:r4};
}
function dealPrepRowsDemo(){var D=DEMO_PREP;
 return {
  r1:'<b>'+escD(D.anchor)+'</b><span class="prepsub">'+escD(D.anchorNote)+'</span>',
  r2:'<b>'+escD(D.bench)+'</b>'+prepConfChip(D.benchConf),
  r3:'<b>'+escD(D.model)+'</b>',
  r4:'<b>'+escD(D.combinedLo)+' to '+escD(D.combinedHi)+'</b>'
 };
}
function dealNegPrepCardHTML(){
 ensurePrepCardCss();
 var R=DEAL_PREP_LIVE?dealPrepRowsLive(DEAL_PREP_LIVE):dealPrepRowsDemo();
 // F4: the combined target IS the deal's ZOPA opening->target band (ONE reconciled
 // source via zopaTcoBand), so "sets ZOPA" is literal - this per-year target is the
 // same opening the ZOPA total row shows across the horizon. Anti-fabrication: no
 // ZOPA lines -> fall back to the prep model's own combined range.
 var B=(typeof ZOPA_LINES!=='undefined'&&ZOPA_LINES&&ZOPA_LINES.length&&typeof zopaTcoBand==='function')?zopaTcoBand():null;
 var r4=B?('<b>open '+escD(prepUsd(B.openPerYr))+'/yr, target '+escD(prepUsd(B.targetPerYr))+'/yr</b>'):R.r4;
 var body='';
 if(DEAL_PREP_OPEN){
  body='<div class="card"><table class="prepkv">'+
   '<tr><td class="pk">Should-cost anchor</td><td class="pv">'+R.r1+'</td></tr>'+
   '<tr><td class="pk">Market benchmark</td><td class="pv">'+R.r2+'</td></tr>'+
   '<tr><td class="pk">Recommended model</td><td class="pv">'+R.r3+'</td></tr>'+
   '<tr class="preptotal"><td class="pk">Combined target</td><td class="pv">'+r4+'<span class="prepzopa">-&gt; sets ZOPA</span></td></tr>'+
  '</table><div class="prepnote">Reflect-only summary. The combined target IS the ZOPA opening below (the ZOPA total row shows the same figure across the '+((typeof DEAL_TCO!=='undefined'&&DEAL_TCO.years)||3)+'-yr horizon); nothing is sent or decided here.</div></div>';
 }
 return '<div class="sect" id="dealPrepCard"><div class="secthd"><div class="t">Negotiation prep · summary</div><span class="prephdr">'+
  '<a class="prephelp" onclick="window.theoHelpOpen&&window.theoHelpOpen();return false;" title="Sources and provenance are in the help guide">(?)</a>'+
  '<button class="prepcaret" onclick="prepCardToggle()" title="Collapse or expand">'+(DEAL_PREP_OPEN?'▾':'▸')+'</button>'+
 '</span></div>'+body+'</div>';
}
function prepCardToggle(){DEAL_PREP_OPEN=!DEAL_PREP_OPEN;var h=document.getElementById('dealPrepCard');if(h)h.outerHTML=dealNegPrepCardHTML();}
// async live load (fired from dealPostRender): tryLive keeps the offline demo intact
async function dealPrepLoad(){
 if(curtab!=='deal'||!window.LillyAPI)return;
 var host=document.getElementById('dealPrepCard');if(!host)return;
 var P=PROJECTS[CURPROJ]||{};
 var payload={supplier:P.supplier||'Supplier'};
 var r=await LillyAPI.tryLive(function(){return LillyAPI.commercialNegotiation(payload);},null);
 if(r.source!=='live'||!r.data||!r.data.prep){DEAL_PREP_LIVE=null;return;}   // offline/error -> keep demo
 DEAL_PREP_LIVE=r.data;
 var h2=document.getElementById('dealPrepCard');
 if(h2)h2.outerHTML=dealNegPrepCardHTML();
}
// ===== Pro-forma / TCO summary card (ADDITIVE, reflect-only) =====
// Design Note: "one component, two renderings". ONE compact, auto-updating
// pro-forma summary in Deal/Negotiate (TCO headline + the main cost components:
// license/subscription, implementation, support, other) with an "Open full model"
// affordance that expands the SAME card in place to the granular rendering (line
// items, per-year projection, NPV read). This is also the TCO-components surface
// (CN.3). No separate page and no link out to a standalone pro-forma destination.
// Inputs come from the SAME pricing the ZOPA section renders (ZOPA_LINES ask at
// DEAL_TCO volume), so the card recomputes whenever the Deal view rerenders after
// a pricing change (rerenderDeal -> dealHTML -> dealPostRender -> dealProFormaLoad).
// Live data comes from POST /api/pro-forma via LillyAPI.tryLive; offline keeps the
// deterministic demo computation on the same inputs. Every dynamic value is escaped
// (escD) before innerHTML; no inline on* handlers carry concatenated data.
// Anti-fabrication: a missing input renders "Data not available - ...", never an
// invented number. Positive accent = Bold Blue var(--plum) (never green); ASCII copy,
// no em dashes.
var DEAL_PF_LIVE=null;   // last live ProFormaReflection {model,dashboard,sensitivity}, or null (demo)
var DEAL_PF_OPEN=false;  // false = compact rendering, true = full-model rendering (same card)
function ensureProFormaCss(){ if(document.getElementById('proforma-css'))return; var s=document.createElement('style'); s.id='proforma-css'; s.textContent=
 '.pfhead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:9px}'+
 '.pfhk{font:700 10px var(--sans,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase;color:var(--mut2,#8A827C)}'+
 '.pfhv{font:700 22px var(--sans,system-ui,sans-serif);color:var(--plum);line-height:1}'+
 '.pfkv{width:100%;border-collapse:collapse;font-size:var(--fz-sm,12.5px)}'+
 '.pfkv td{padding:6px 8px;border-top:1px solid var(--line,#EEE);vertical-align:top}'+
 '.pfkv tr:first-child td{border-top:none}'+
 '.pfkv .pk{color:var(--mut2,#8A827C);font-weight:600}'+
 '.pfkv .pv{color:var(--ink,#1A1A1A);text-align:right;white-space:nowrap;font-weight:600}'+
 '.pfkv tr.pftotal td{border-top:2px solid var(--plum);padding-top:8px}'+
 '.pfkv tr.pftotal .pk,.pfkv tr.pftotal .pv{color:var(--plum);font-weight:700}'+
 '.pfsub{font-size:11px;color:var(--mut2,#8A827C);font-weight:500;margin-left:6px}'+
 '.pfna{font-size:12px;color:var(--mut2,#8A827C);font-style:italic;font-weight:500}'+
 '.pfnote{font-size:11px;color:var(--mut2,#8A827C);font-style:italic;margin-top:8px;line-height:1.45}'+
 '.pfdetail{margin-top:11px;padding-top:4px;border-top:1px dashed var(--line2,#DCD8D2)}'+
 '.pfdh{font:700 10px var(--sans,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase;color:var(--mut2,#8A827C);margin:10px 0 4px}'
 ; document.head.appendChild(s);
}
// $ formatter for whole-deal dollars (mirrors zTco's precision at $1M+)
function pfUsd(n){if(typeof n!=='number'||!isFinite(n))return '';if(n<0)return '-'+pfUsd(-n);return n>=1e6?('$'+(n/1e6).toFixed(2)+'M'):n>=1000?('$'+Math.round(n/1000)+'K'):('$'+Math.round(n));}
function pfNa(msg){return '<span class="pfna">Data not available - '+escD(msg)+'</span>';}
// model request for POST /api/pro-forma, built from the SAME pricing the ZOPA view
// renders (the supplier ask on each line, at deal volume). Null when there are no
// cost inputs to model (anti-fabrication: no inputs -> no numbers).
function dealProFormaPayload(){
 var P=(typeof PROJECTS!=='undefined'&&PROJECTS[CURPROJ])||{};
 var seats=(typeof DEAL_TCO!=='undefined'&&DEAL_TCO.seats)||0;
 var years=(typeof DEAL_TCO!=='undefined'&&DEAL_TCO.years)||3;
 var lines=[];
 ((typeof ZOPA_LINES!=='undefined'&&ZOPA_LINES)||[]).forEach(function(l){
  if(!l||typeof l.ask!=='number')return;
  if(l.cadence==='seat-yr'&&seats>0)lines.push({label:l.item,amount:l.ask,quantity:seats});
  else if(l.cadence==='one-time')lines.push({label:l.item,amount:l.ask*1000,oneTime:true});
  else if(l.cadence==='yr')lines.push({label:l.item,amount:l.ask*1000});
 });
 if(!lines.length)return null;
 return {decision:'Deal pricing as proposed · '+(P.supplier||'Supplier'),currency:'USD',horizonYears:years,discountRate:null,costLines:lines};
}
// whole-horizon dollars for one request line (one-time lands once; recurring repeats each year)
function pfLineTotal(c,years){var q=(typeof c.quantity==='number')?c.quantity:1;var v=(typeof c.amount==='number'?c.amount:0)*q;return c.oneTime?v:v*years;}
// TCO component taxonomy (CN.3): the four core buckets PLUS training / T&E /
// change-order / integration / admin, extended ADDITIVELY. A line only lands in a
// non-core bucket when its label matches, so today's 3-line pricing (license /
// impl / support) produces the exact same [license, impl, support, other] output as
// before - the P&L matrix, scenarios, tornado and export are unaffected.
function pfBucketDefs(){return [
 {k:'license',label:'License / subscription',rx:/licen|subscri|seat/i,core:true},
 {k:'impl',label:'Implementation (one-time)',rx:/implement|setup|onboard|migrat/i,core:true},
 {k:'support',label:'Support / maintenance',rx:/support|maint/i,core:true},
 {k:'training',label:'Training / enablement',rx:/train|enable|adoption/i,core:false},
 {k:'te',label:'Travel & expense (T&E)',rx:/travel|t&e|expense/i,core:false},
 {k:'change',label:'Change orders',rx:/change[- ]?order|scope[- ]?change/i,core:false},
 {k:'integration',label:'Integration / interfaces',rx:/integrat|interface|sftp|(^|[^a-z])api([^a-z]|$)/i,core:false},
 {k:'admin',label:'Admin / vendor management',rx:/admin|governance|oversight|vendor[- ]?m/i,core:false},
 {k:'other',label:'Other',rx:null,core:true}
];}
function pfClassify(label){var d=pfBucketDefs();for(var i=0;i<d.length;i++){if(d[i].rx&&d[i].rx.test(label))return d[i].k;}return 'other';}
// roll the request lines up into the cost components (the CN.3 surface)
function pfComponents(payload){
 var defs=pfBucketDefs();var amt={};defs.forEach(function(d){amt[d.k]=0;});
 payload.costLines.forEach(function(c){amt[pfClassify(c.label)]+=pfLineTotal(c,payload.horizonYears);});
 return defs.filter(function(d){return d.core||amt[d.k]>0;}).map(function(d){return {label:d.label,amt:amt[d.k]};});
}
// deterministic offline projection on the same inputs (Year 0 = one-time, 1..N = recurring)
function pfDemoYears(payload){
 var up=0,rec=0;
 payload.costLines.forEach(function(c){var v=pfLineTotal(c,1);if(c.oneTime)up+=v;else rec+=v;});
 var out=[{year:0,cost:up}];
 for(var y=1;y<=payload.horizonYears;y++)out.push({year:y,cost:rec});
 return out;
}
function dealProFormaCardHTML(){
 ensureProFormaCss();
 var payload=dealProFormaPayload();
 var live=(DEAL_PF_LIVE&&DEAL_PF_LIVE.dashboard)?DEAL_PF_LIVE.dashboard:null;
 var body='';
 if(!payload){
  body='<div class="card">'+pfNa('add cost inputs')+'</div>';
 }else{
  var comps=pfComponents(payload);
  var compTotal=comps.reduce(function(s,c){return s+c.amt;},0);
  // headline TCO: the LIVE base-scenario TCO when the platform computed one;
  // otherwise the deterministic offline sum on the same inputs. A live response
  // without a usable number renders the anti-fabrication line, never a guess.
  var tcoNum=live?((live.headline&&typeof live.headline.tco==='number'&&isFinite(live.headline.tco))?live.headline.tco:null):compTotal;
  var head=(tcoNum===null)
   ? '<div class="pfhead"><span class="pfhk">Total cost of ownership</span><span>'+pfNa('add cost inputs')+'</span></div>'
   : '<div class="pfhead"><span class="pfhk">Total cost of ownership · '+escD(String(payload.horizonYears))+'-yr, as proposed</span><span class="pfhv">'+escD(pfUsd(tcoNum))+'</span></div>';
  var rows=comps.map(function(c){return '<tr><td class="pk">'+escD(c.label)+'</td><td class="pv">'+(c.amt>0?escD(pfUsd(c.amt)):'<span class="pfsub">none modeled</span>')+'</td></tr>';}).join('');
  rows+='<tr class="pftotal"><td class="pk">Total (TCO)</td><td class="pv">'+(tcoNum===null?pfNa('add cost inputs'):escD(pfUsd(tcoNum)))+'</td></tr>';
  var detail=pfDetailHTML(payload,live);   // P&L/cashflow matrix + Insights are now DEFAULT-visible; only line-item granularity stays behind the toggle
  body='<div class="card">'+head+'<table class="pfkv">'+rows+'</table>'+detail+
   '<div class="pfnote">Reflect-only. Stays in sync with the Negotiate pricing: it recomputes from the same lines whenever the Deal view rerenders after a pricing change. A directional model on stated assumptions; Finance owns the numbers, and nothing is committed here.</div></div>';
 }
 return '<div class="sect" id="dealProFormaCard"><div class="secthd"><div class="t">Pro-forma / TCO</div><div>'+
  '<button class="btn btn-ghost btn-sm" onclick="pfExportCsv()">Export to Excel</button> <button class="btn btn-ghost btn-sm" onclick="pfCardToggle()">'+(DEAL_PF_OPEN?'Hide line items':'Show line items')+'</button>'+
 '</div></div>'+body+'</div>';
}
// Pro-forma redesign (#39): the full model reads like a real financial statement -
// line items + a P&L / cashflow-by-year MATRIX (components x years + cumulative), a
// what-if discount slider that reprices the NPV live (the simulation), and computed
// insights. All native + reflect-only; Finance owns the committed numbers.
var PF_DISC=0;   // what-if discount rate (%); 0 = undiscounted
function pfSetDisc(v){var n=parseFloat(v);PF_DISC=isFinite(n)?Math.max(0,Math.min(15,n)):0;var h=document.getElementById('dealProFormaCard');if(h)h.outerHTML=dealProFormaCardHTML();}
// per-component split into up-front (one-time) vs per-recurring-year
function pfComponentYears(payload){
 // shares the extended classifier but keeps its own display labels so the P&L
 // matrix row names (e.g. "Implementation") are byte-for-byte what they were.
 var lbl={license:'License / subscription',impl:'Implementation',support:'Support / maintenance',training:'Training / enablement',te:'Travel & expense (T&E)',change:'Change orders',integration:'Integration / interfaces',admin:'Admin / vendor management',other:'Other'};
 var order=['license','impl','support','training','te','change','integration','admin','other'];
 var g={};order.forEach(function(k){g[k]={label:lbl[k],y0:0,rec:0};});
 payload.costLines.forEach(function(c){var k=pfClassify(c.label);var v1=pfLineTotal(c,1);if(c.oneTime)g[k].y0+=v1;else g[k].rec+=v1;});
 return order.map(function(k){return g[k];}).filter(function(c){return c.y0>0||c.rec>0;});
}
function pfNpvAt(yrs,rate){var r=rate/100;return yrs.reduce(function(s,y){var t=(typeof y.year==='number')?y.year:0;var c=(typeof y.cost==='number')?y.cost:0;return s+c/Math.pow(1+r,t);},0);}
function pfInsights(payload){
 var comps=pfComponentYears(payload);var N=payload.horizonYears;
 var totals=comps.map(function(c){return {label:c.label,tot:c.y0+c.rec*N};});
 var tco=totals.reduce(function(s,c){return s+c.tot;},0)||1;
 var top=totals.slice().sort(function(a,b){return b.tot-a.tot;})[0];
 var upfront=comps.reduce(function(s,c){return s+c.y0;},0);
 var recPerYr=comps.reduce(function(s,c){return s+c.rec;},0);
 var out=[];
 if(top)out.push('<b>'+escD(top.label)+'</b> is the biggest driver - '+Math.round(top.tot/tco*100)+'% of the '+escD(pfUsd(tco))+' TCO, and the first place to push.');
 out.push('Up-front is '+escD(pfUsd(upfront))+' ('+Math.round(upfront/tco*100)+'%); the recurring run-rate is '+escD(pfUsd(recPerYr))+'/yr across '+N+' year'+(N===1?'':'s')+'.');
 if(recPerYr>0)out.push('A 5% cut on the recurring line saves ~'+escD(pfUsd(recPerYr*0.05*N))+' over the horizon - a concrete negotiation target.');
 return out;
}
function pfDetailHTML(payload,live){
 var years=payload.horizonYears;
 var liRows=payload.costLines.map(function(c){
  var q=(typeof c.quantity==='number')?c.quantity:1;
  var basis=c.oneTime?'one-time':(q>1?escD(pfUsd(c.amount))+' x '+escD(String(q))+' /yr':escD(pfUsd(c.amount*q))+' /yr');
  return '<tr><td class="pk">'+escD(c.label)+'<span class="pfsub">'+basis+'</span></td><td class="pv">'+escD(pfUsd(pfLineTotal(c,years)))+'</td></tr>';
 }).join('');
 // ---- P&L / cashflow by year: components (rows) x Year 0..N (cols) + total + cumulative ----
 var comps=pfComponentYears(payload);
 var yhead='<tr><th>Cost component</th><th style="text-align:right">Yr 0</th>';
 for(var i=1;i<=years;i++)yhead+='<th style="text-align:right">Yr '+i+'</th>';
 yhead+='<th style="text-align:right">Total</th></tr>';
 var colTot=[];for(var j=0;j<=years;j++)colTot[j]=0;
 var mrows=comps.map(function(c){var cells='',rowTot=0;for(var y=0;y<=years;y++){var v=(y===0)?c.y0:c.rec;colTot[y]+=v;rowTot+=v;cells+='<td style="text-align:right">'+(v?escD(pfUsd(v)):'·')+'</td>';}return '<tr><td class="pk">'+escD(c.label)+'</td>'+cells+'<td class="pv">'+escD(pfUsd(rowTot))+'</td></tr>';}).join('');
 var grand=colTot.reduce(function(s,v){return s+v;},0);
 var totRow='<tr class="pftotal"><td class="pk">Total / yr</td>'+colTot.map(function(v){return '<td style="text-align:right">'+escD(pfUsd(v))+'</td>';}).join('')+'<td class="pv">'+escD(pfUsd(grand))+'</td></tr>';
 var cum=0;var cumRow='<tr><td class="pk" style="font-style:italic;color:var(--mut2)">Cumulative</td>'+colTot.map(function(v){cum+=v;return '<td style="text-align:right;color:var(--mut)">'+escD(pfUsd(cum))+'</td>';}).join('')+'<td></td></tr>';
 var matrix='<div class="mxwrap"><table class="mx" style="min-width:520px"><thead>'+yhead+'</thead><tbody>'+mrows+totRow+cumRow+'</tbody></table></div>';
 // ---- what-if: discount slider reprices the NPV live (simulation) ----
 var yrsSeries=pfDemoYears(payload);
 var npvLive=(live&&live.headline&&typeof live.headline.npv==='number'&&isFinite(live.headline.npv))?live.headline.npv:null;
 var npvDisplay=(PF_DISC>0)?('<b>'+escD(pfUsd(pfNpvAt(yrsSeries,PF_DISC)))+'</b> at '+PF_DISC+'%'):(npvLive!=null?('<b>'+escD(pfUsd(npvLive))+'</b> (engine)'):'<b>'+escD(pfUsd(grand))+'</b> undiscounted');
 var whatif='<div class="pfdh">What-if · discount rate (present value)</div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><input type="range" min="0" max="15" step="0.5" value="'+PF_DISC+'" oninput="pfSetDisc(this.value)" style="flex:1;min-width:160px"><span style="font:700 12px var(--mono,monospace);color:var(--plum);white-space:nowrap">NPV: '+npvDisplay+'</span></div><div class="pfnote">Slide the discount rate to reprice the '+years+'-yr cashflow to present value. 0% = the undiscounted total.</div>';
 // ---- computed insights ----
 var ins=pfInsights(payload).map(function(x){return '<li>'+x+'</li>';}).join('');
 // Line-item granularity is the ONLY thing behind the toggle now; the P&L/cashflow
 // matrix + Insights render by default (surfaced per the approved IA).
 var liSection=DEAL_PF_OPEN?('<div class="pfdh">Line items · over the '+escD(String(years))+'-yr horizon</div><table class="pfkv">'+liRows+'</table>'):'';
 return '<div class="pfdetail">'+
  '<div class="pfdh">P&amp;L / cashflow by year</div>'+matrix+
  whatif+
  '<div class="pfdh">Insights</div><ul class="bullets" style="margin-top:4px">'+ins+'</ul>'+
  liSection+
  '<div class="pfnote">Use Export to Excel for the full workbook (line items, the year-by-year P&amp;L, scenarios) for Finance review. Directional; Finance owns the committed numbers.</div>'+
 '</div>';
}
function pfCardToggle(){DEAL_PF_OPEN=!DEAL_PF_OPEN;var h=document.getElementById('dealProFormaCard');if(h)h.outerHTML=dealProFormaCardHTML();}
// async live load (fired from dealPostRender): tryLive keeps the offline demo intact
async function dealProFormaLoad(){
 if(curtab!=='deal'||!window.LillyAPI)return;
 var host=document.getElementById('dealProFormaCard');if(!host)return;
 var payload=dealProFormaPayload();if(!payload){DEAL_PF_LIVE=null;return;}
 var r=await LillyAPI.tryLive(function(){return LillyAPI.proForma(payload);},null);
 if(r.source!=='live'||!r.data||!r.data.dashboard){DEAL_PF_LIVE=null;return;}   // offline/error -> keep the deterministic demo
 DEAL_PF_LIVE=r.data;
 var h2b=document.getElementById('dealProFormaCard');
 if(h2b)h2b.outerHTML=dealProFormaCardHTML();
 var scc=document.getElementById('pfScenariosSect');if(scc)scc.outerHTML=pfScenariosHTML();
 var snc=document.getElementById('pfSensitivitySect');if(snc)snc.outerHTML=pfSensitivityHTML();
}
// ===== Pro-forma is its OWN Deal sub-tab (F2): summary card + scenarios (PF.3) + sensitivity (PF.4) + real Excel export =====
function dealProFormaExtras(){
 ensureProFormaCss();ensureCmCss();
 return '<p class="dashintro"><b>Pro-forma / TCO · '+escD((PROJECTS[CURPROJ]&&PROJECTS[CURPROJ].supplier)||'Supplier')+'</b> - total cost of ownership for this deal, modeled on the current Negotiate pricing. Reflect-only and directional; Finance owns the committed numbers. Recomputes as the Deal pricing changes; exports to Excel.</p>'
  +dealProFormaCardHTML()
  +pfScenariosHTML()
  +pfSensitivityHTML()
  +pfTeardownHTML();   // Wave 5b (item 11): hidden-cost teardown + Year-1 load + escalation, on top of the quoted lines
}
// PF.3 scenario comparison: Low / Base / High total exposure across the horizon.
// Prefers the engine's low/high scenarios when live; else flexes recurring +/-12%
// on the same lines (directional model, labeled as such - not fabricated data).
function pfScenarios(payload){
 var comps=pfComponents(payload);
 var base=comps.reduce(function(s,c){return s+c.amt;},0);
 var up=0;payload.costLines.forEach(function(c){if(c.oneTime)up+=pfLineTotal(c,1);});
 var rec=Math.max(0,base-up);
 var m=DEAL_PF_LIVE&&DEAL_PF_LIVE.model&&DEAL_PF_LIVE.model.scenarios;
 function scTotal(s){if(!s)return null;if(typeof s.tco==='number'&&isFinite(s.tco))return s.tco;if(s.years&&s.years.length)return s.years.reduce(function(t,y){return t+(typeof y.cost==='number'?y.cost:0);},0);return null;}
 var lo=m&&scTotal(m.low),hi=m&&scTotal(m.high);
 return [
  {label:'Low',tco:(typeof lo==='number')?lo:(up+rec*0.88)},
  {label:'Base (as proposed)',tco:base},
  {label:'High',tco:(typeof hi==='number')?hi:(up+rec*1.12)}
 ];
}
function pfBarRow(label,val,max,tint){
 var w=max>0?Math.round(val/max*100):0;
 return '<tr><td class="pk">'+escD(label)+'</td><td style="padding:6px 8px;border-top:1px solid var(--line,#EEE);width:55%"><div style="height:9px;border-radius:4px;background:'+tint+';position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:'+w+'%;background:var(--plum);border-radius:4px"></div></div></td><td class="pv">'+escD(pfUsd(val))+'</td></tr>';
}
var PF_SCEN_OPEN=true;   // PF.3: scenario-compare section collapse state
function pfScenToggle(){PF_SCEN_OPEN=!PF_SCEN_OPEN;var h=document.getElementById('pfScenariosSect');if(h)h.outerHTML=pfScenariosHTML();}
function pfScenariosHTML(){
 var payload=dealProFormaPayload();
 if(!payload)return '<div class="sect" id="pfScenariosSect"></div>';
 var sc=pfScenarios(payload);
 var max=Math.max.apply(null,sc.map(function(s){return s.tco;}))||1;
 var rows=sc.map(function(s){return pfBarRow(s.label,s.tco,max,'rgba(92,43,80,.14)');}).join('');
 var caret='<button onclick="pfScenToggle()" title="Collapse or expand" style="border:none;background:none;color:var(--mut2);cursor:pointer;font-size:13px;line-height:1;padding:2px 4px">'+(PF_SCEN_OPEN?'▾':'▸')+'</button>';
 var body=PF_SCEN_OPEN?('<div class="card"><table class="pfkv">'+rows+'</table><div class="pfnote">Low / High flex the recurring cost +/-12% on the same lines (or the engine\'s scenario when live). Compare total exposure across the '+escD(String(payload.horizonYears))+'-yr horizon.</div></div>'):'';
 return '<div class="sect" id="pfScenariosSect"><div class="secthd"><div style="display:flex;align-items:baseline;gap:8px"><div class="t">Scenarios</div><span class="pfsub">directional; Finance owns committed figures</span></div>'+caret+'</div>'+body+'</div>';
}
// PF.4 sensitivity / tornado: which driver moves TCO most. Prefers the engine's
// sensitivity when live; else each component's +/-15% swing, sorted largest-first.
function pfSensitivity(payload){
 var live=DEAL_PF_LIVE&&DEAL_PF_LIVE.sensitivity;
 var drivers=live&&(live.drivers||live.tornado);
 if(drivers&&drivers.length){
  return drivers.map(function(d){return {label:d.label||d.driver||'Driver',swing:Math.abs(typeof d.swing==='number'?d.swing:(typeof d.impact==='number'?d.impact:0))};}).filter(function(d){return d.swing>0;}).sort(function(a,b){return b.swing-a.swing;});
 }
 return pfComponents(payload).filter(function(c){return c.amt>0;}).map(function(c){return {label:c.label,swing:c.amt*0.15};}).sort(function(a,b){return b.swing-a.swing;});
}
function pfSensitivityHTML(){
 var payload=dealProFormaPayload();
 if(!payload)return '<div class="sect" id="pfSensitivitySect"></div>';
 var s=pfSensitivity(payload);
 if(!s.length)return '<div class="sect" id="pfSensitivitySect"></div>';
 var max=Math.max.apply(null,s.map(function(d){return d.swing;}))||1;
 var rows=s.map(function(d){var w=max>0?Math.round(d.swing/max*100):0;return '<tr><td class="pk">'+escD(d.label)+'</td><td style="padding:6px 8px;border-top:1px solid var(--line,#EEE);width:55%"><div style="height:9px;border-radius:4px;background:rgba(92,43,80,.10);position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:'+w+'%;background:var(--plum);border-radius:4px"></div></div></td><td class="pv">+/- '+escD(pfUsd(d.swing))+'</td></tr>';}).join('');
 return '<div class="sect" id="pfSensitivitySect"><div class="secthd"><div class="t">Sensitivity</div><span class="pfsub">what moves TCO most</span></div><div class="card"><table class="pfkv">'+rows+'</table><div class="pfnote">Tornado of how much the TCO moves if each driver flexes +/-15% (or the engine\'s sensitivity when live). The longest bar is the biggest lever in the negotiation.</div></div></div>';
}
// Real Excel export (F2): builds a CSV workbook and triggers a download. CSV opens
// natively in Excel. No prose-only claim - this is an actual file.
function pfCsvEscape(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function pfExportCsv(){
 var payload=dealProFormaPayload();
 if(!payload){toast('No cost inputs to export yet');return;}
 var years=payload.horizonYears;var sup=(PROJECTS[CURPROJ]&&PROJECTS[CURPROJ].supplier)||'deal';
 var rows=[['Pro-forma / TCO export',sup],['Horizon (years)',years],[]];
 rows.push(['Cost line','Basis','Total over horizon (USD)']);
 payload.costLines.forEach(function(c){var q=(typeof c.quantity==='number')?c.quantity:1;var basis=c.oneTime?'one-time':(q>1?(c.amount+' x '+q+' /yr'):((c.amount*q)+' /yr'));rows.push([c.label,basis,Math.round(pfLineTotal(c,years))]);});
 rows.push([]);rows.push(['Cost component','Total (USD)']);
 pfComponents(payload).forEach(function(c){rows.push([c.label,Math.round(c.amt)]);});
 rows.push([]);rows.push(['Year','Cost (USD)']);
 pfDemoYears(payload).forEach(function(y){rows.push([y.year===0?'Year 0 (up-front)':'Year '+y.year,Math.round(y.cost)]);});
 rows.push([]);rows.push(['Scenario','TCO (USD)']);
 pfScenarios(payload).forEach(function(s){rows.push([s.label,Math.round(s.tco)]);});
 var csv=rows.map(function(r){return r.map(pfCsvEscape).join(',');}).join('\r\n');
 var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
 var url=URL.createObjectURL(blob);var a=document.createElement('a');
 a.href=url;a.download='pro-forma-'+sup.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.csv';
 document.body.appendChild(a);a.click();document.body.removeChild(a);
 setTimeout(function(){URL.revokeObjectURL(url);},1000);
 toast('Exported the pro-forma to CSV (opens in Excel). Reflect-only; Finance owns committed figures.');
}
// ---- Deal / Review parity (Wave 4a): Overview + 14-category protection scan + evidentiary
// Findings + Protection & Coverage + 12-category Vendor Tactics. Ported from dashboard-contract.html
// (CATEGORIES / FINDINGS / TACTICS + crOverview / crHeatmap / crFindings / crProtection / crTactics),
// rendered NATIVELY for the bundled demo (no server). Reflect-only; NO GREEN (Covered=Bold Blue,
// Confirm=Amber, Gap=Red); every dynamic value is escD-escaped before innerHTML. NOT a system of
// record (CLM/LEAH owns the contract), this is an analytical protection scan against the governing doc.