var _PV10=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVTR=(_PV10&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV10)&&_PV10.termsRenew)?_PV10.termsRenew:{};
const PERF_OBLIGATIONS=_PVTR.perfObligations||[];
function perfObligationsHTML(){
 var rows=PERF_OBLIGATIONS.map(function(p){
  return '<tr><td class="iss">'+p.ob+'</td><td>'+p.target+'</td><td>'+p.remedy+'</td><td><span style="font-weight:600;color:'+(p.met?'var(--bblue)':'var(--amber-d)')+'">'+p.standing+'</span></td></tr>';
 }).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Performance obligations</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">what we hold '+PROJECTS[CURPROJ].supplier+' to</span></div><div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th>Obligation</th><th>Target</th><th>If missed</th><th>Where it stands</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="spnote">These are the supplier\'s ongoing commitments. A miss can trigger <b>service credits or money back</b>, and a chronic miss can become a termination right. Theo tracks each target against current performance so a miss is caught, not discovered later.</div></div>';
}
// IA (item 4): Terms & Obligations splits into two sub-tabs (Terms | Obligations),
// with collapsible sections that show a high-level summary when collapsed, and the
// drift list de-bubbled into a compact table (no stacked cards).
var TO_MODE='terms';
var TO_OPEN={};   // section id -> open? (default open)
function toTo(m){TO_MODE=m;if(curtab==='terms')$('#tabbody').innerHTML=termsObligationsHTML();}
function toSecToggle(id){TO_OPEN[id]=!(TO_OPEN[id]!==false);if(curtab==='terms')$('#tabbody').innerHTML=termsObligationsHTML();}
function toSection(id,title,summary,body){
 var open=TO_OPEN[id]!==false;   // default open
 return '<div class="sect"><div class="secthd" style="cursor:pointer" onclick="toSecToggle(\''+id+'\')"><div class="t">'+title+'</div><span style="display:inline-flex;align-items:center;gap:9px">'+(open?'':'<span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+summary+'</span>')+'<span style="color:var(--mut2);font-size:13px">'+(open?'▾':'▸')+'</span></span></div>'+(open?body:'')+'</div>';
}
function termsObligationsHTML(){const T=pvData('terms',TERMS);
 if(typeof ensureDealCss==='function')ensureDealCss();   // reuse the Deal sub-tab (.dmode) styling
 var sub=[['terms','Terms'],['obligations','Obligations']].map(function(m){return '<button class="dmode'+(m[0]===TO_MODE?' on':'')+'" onclick="toTo(\''+m[0]+'\')">'+m[1]+'</button>';}).join('');
 let h='<p class="dashintro"><b>Terms &amp; Obligations · '+PROJECTS[CURPROJ].supplier+'</b> - the executed contract reconciled across amendments (<b>Terms</b>), and the duties we hold the supplier to plus tracked deadlines (<b>Obligations</b>). Reflect-only; a term opens the executed contract (PDF), drift flags are for Legal to confirm.</p>';
 h+='<div class="dealbar"><div class="dmodes">'+sub+'</div></div>';
 if(TO_MODE==='obligations'){
  h+=perfObligationsHTML();
  h+=obligationsRegisterHTML();
 }else{
  // amendment chain (compact chips)
  h+=toSection('amend','Effective terms · amendment chain',T.amendments.length+' amendment'+(T.amendments.length===1?'':'s'),'<div class="card"><div class="amendrow"><span class="amendbase">'+T.base+'</span>'+T.amendments.map(function(a){return '<span class="thar">→</span><span class="amendchip" title="'+a.chg.replace(/"/g,'&quot;')+'">'+a.n+'<small>'+a.date+'</small></span>';}).join('')+'</div></div>');
  // current effective terms
  h+=toSection('eff','Current effective terms',T.effective.length+' terms','<div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th>Term</th><th>As it stands today</th><th>Source</th></tr></thead><tbody>'+T.effective.map(function(e,i){return '<tr><td class="iss">'+e.term+'</td><td>'+(e.flag==='drift'?'<span class="driftv">'+e.val+'</span>':e.val)+'</td><td><span class="srclink" onclick="termSource('+i+')" title="Open the executed contract (PDF)">'+e.src+' <span class="srcar">↗</span></span></td></tr>';}).join('')+'</tbody></table></div>');
  // drift & contradictions, DE-BUBBLED: compact table, one row per drift (was stacked cards)
  var driftBody='<div class="card" style="padding:2px 6px"><table class="agenda"><thead><tr><th>Drift</th><th>What changed</th><th>Follow the thread</th></tr></thead><tbody>'+T.conflicts.map(function(c){return '<tr><td class="iss"><span class="gsev med" style="margin-right:6px">Drift</span>'+c.t+'</td><td style="color:var(--mut)">'+c.d+'</td><td><span class="threadlink" onclick="dealTo(\''+c.to+'\')">'+(c.to==='renewal'?'Renewal ↗':'Contract review ↗')+'</span></td></tr>';}).join('')+'</tbody></table></div>';
  h+=toSection('drift','Drift &amp; contradictions',T.conflicts.length+' drift'+(T.conflicts.length===1?'':'s'),driftBody);
 }
 return h;
}
// ---- Obligations register (+ 30/60/90/120-day alerts), middle of the thread ----
function obWin(o){var c=o.win<=30?'red':o.win<=60?'amber':o.win<=90?'amber':'blue';return '<span class="obwin '+c+'">'+o.win+'-day window · '+o.days+'d out</span>';}
function obSource(i){var o=pvData('obligations',OBLIGATIONS)[i];if(!o)return;$('#drawer').innerHTML=`<div class="dh"><div><h3>${o.ob}</h3><div class="dsub">Source · ${o.doc}</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db"><div class="kv"><div class="k">Type</div><div class="v">${o.type||'Legal'}</div><div class="k">Document</div><div class="v">${o.doc}</div><div class="k">Clause</div><div class="v">${o.clause}</div><div class="k">Due</div><div class="v">${o.due}</div></div><div class="sect" style="margin-top:14px"><div class="secthd"><div class="t">Source language</div></div><blockquote class="srcquote">${o.quote||''}</blockquote></div><button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="toast('Opening the executed ${o.doc} (PDF) · read-only')"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="#C8202E" stroke-width="2"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/><path d="M9 13h5M9 16h3"/></svg>Open the executed contract (PDF)</button><div style="font-size:var(--fz-meta);color:var(--mut2);font-style:italic;margin-top:9px">Extracted from the executed contract. Opens the signed PDF at the clause; reflect-only.</div></div>`;$('#scrim').classList.add('on');$('#drawer').classList.add('on');}
// party tiles + discrete Consequence + Recommended-Action, folded on top of the PRESERVED
// window chips (obWin), per-obligation severity, source-doc drawer links and golden-thread links.
function ensureObligCss(){ if(document.getElementById('oblig-css'))return; var s=document.createElement('style'); s.id='oblig-css'; s.textContent=
 '.obtiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 15px}'+
 '@media(max-width:640px){.obtiles{grid-template-columns:repeat(2,1fr)}}'+
 '.obtile{border:1px solid var(--line2,#DCD8D2);border-radius:11px;padding:11px 12px;background:var(--surface);text-align:center}'+
 '.obtile .v{font-size:22px;font-weight:800;line-height:1}'+
 '.obtile .l{font:600 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--mut2,var(--mut2));margin-top:6px}'+
 '.obparty{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:30px;white-space:nowrap}'+
 '.obparty.supplier{background:var(--tint-ece8f2,#ECE8F2);color:#5B4FB0}.obparty.lilly{background:var(--blue-t,#E4EBF1);color:var(--navy)}.obparty.mutual{background:var(--bg,#F4F1EC);color:var(--mut,#3E3933)}'+
 '.obconseq{margin-top:9px;padding-top:9px;border-top:1px dashed var(--line2,#DCD8D2);display:grid;gap:5px}'+
 '.obcrow{display:flex;gap:9px;font-size:12px;line-height:1.45}'+
 '.obck{flex:0 0 128px;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.03em;padding-top:1px}'+
 '.obck.cons{color:var(--red,#C8202E)}.obck.act{color:var(--navy)}'+
 '.obcv{color:var(--ink,#1A1A1A);flex:1}'
 ; document.head.appendChild(s);
}
function obligationsRegisterHTML(){
 ensureObligCss();
 var OBL=pvData('obligations',OBLIGATIONS);
 var TYPES=[['Commercial','Commercial'],['Legal','Legal'],['Financial','Financial'],['Performance','Service reviews']];
 var sevLab=function(s){return s==='high'?'High':s==='med'?'Medium':'Low';};
 var partyLab={supplier:PROJECTS[CURPROJ].supplier,lilly:'Lilly',mutual:'Mutual'};
 // party-count tiles (Supplier / Lilly / Mutual / Missing-Timeline) derived from the register
 var cnt={supplier:0,lilly:0,mutual:0,missing:0};
 OBL.forEach(function(o){var p=o.party||'supplier';if(cnt[p]!=null)cnt[p]++;if(o.noTimeline)cnt.missing++;});
 var tiles='<div class="obtiles">'+
   '<div class="obtile"><div class="v" style="color:#5B4FB0">'+cnt.supplier+'</div><div class="l">Supplier</div></div>'+
   '<div class="obtile"><div class="v" style="color:var(--navy)">'+cnt.lilly+'</div><div class="l">Lilly</div></div>'+
   '<div class="obtile"><div class="v" style="color:var(--mut,#3E3933)">'+cnt.mutual+'</div><div class="l">Mutual</div></div>'+
   '<div class="obtile"><div class="v" style="color:var(--red,#C8202E)">'+cnt.missing+'</div><div class="l">Missing Timeline</div></div>'+
   '</div>';
 var h='<div class="sect"><div class="secthd"><div class="t">Tracked dates &amp; deadlines</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+OBL.length+' items · by party · 30/60/90/120-day alerts</span></div>'+tiles;
 TYPES.forEach(function(ty){
   var items=OBL.filter(function(o){return (o.type||'Legal')===ty[0];});
   if(!items.length)return;
   h+='<div class="obgroup open"><button class="obgh" onclick="this.parentNode.classList.toggle(\'open\')"><span class="obgcar">▸</span><span class="obgt">'+ty[1]+'</span><span class="obgc">'+items.length+'</span></button><div class="obgb">'+
     items.map(function(o){var i=OBL.indexOf(o);
       var pk=o.party||'supplier';var partyChip='<span class="obparty '+pk+'">'+escD(partyLab[pk]||pk)+'</span>';
       var due=o.due?'<span class="obdue">due '+escD(o.due)+'</span>':(o.timing?'<span class="obdue">'+escD(o.timing)+'</span>':(o.noTimeline?'<span class="obdue">no cadence set</span>':''));
       var win=o.win?obWin(o):(o.noTimeline?'<span class="obwin amber">timeline not set</span>':(o.timing?'<span class="obwin blue">event · '+escD(o.timing)+'</span>':''));
       var conseq='<div class="obconseq">'+
         (o.cons?'<div class="obcrow"><span class="obck cons">If missed</span><span class="obcv">'+escD(o.cons)+'</span></div>':'')+
         (o.action?'<div class="obcrow"><span class="obck act">Recommended</span><span class="obcv">'+escD(o.action)+'</span></div>':'')+
         '</div>';
       return '<div class="obrow '+o.sev+'"><div class="obhd"><span class="gsev '+o.sev+'">'+sevLab(o.sev)+'</span>'+partyChip+'<span class="obn">'+o.ob+'</span>'+due+'</div><div class="obd">'+o.d+'</div>'+conseq+'<div class="obfoot">'+win+(o.clause?'<span class="srclink" onclick="obSource('+i+')" title="Open the executed contract (PDF)">'+o.doc+' · '+o.clause+' <span class="srcar">↗</span></span>':'')+(o.from?'<span class="threadlink" onclick="tab(\'contract\')">← from finding: '+o.from+'</span>':'')+(o.links?'<span class="threadlink" onclick="tab(\''+o.links+'\')">→ '+(o.links==='renewal'?'feeds Renewal':o.links==='savings'?'feeds Savings':'see Findings')+'</span>':'')+'</div></div>';}).join('')+
     '</div></div>';
 });
 h+='</div>';
 return h;
}
// ---- Renewal intelligence, downstream end of the thread (links to Savings) ----
// #E9: at the 120-day notice window, auto-draft the renewal OPENING from the leverage points
function draftRenewalOpening(){var R=pvData('deal.renewal',RENEWAL),to=(typeof SUPPLIER_CONTACT!=='undefined')?SUPPLIER_CONTACT.email:'sam@visier.com',first=(typeof SUPPLIER_CONTACT!=='undefined')?SUPPLIER_CONTACT.name.split(' ')[0]:'Sam';
 CHAT.push({who:llm+' assistant',av:'✦',cls:'ai',model:llm,tm:nowStamp(),tx:'We are at the 120-day renewal window. Here is a renewal opening to Visier built from the leverage points - review and send when you are happy:',draft:{to:to,subj:'Visier x Lilly - renewal of the analytics MSA (expires '+R.expiry+')',body:'Hi '+first+',\n\nWe are opening the renewal conversation ahead of the '+R.expiry+' expiry. We value the partnership and want to extend, with a few adjustments:\n\n- Renewal pricing: we need a CPI or 3% cap. The current then-current-list term is open-ended and the last indicative implied +9%.\n- We are open to a longer (4-year) term in exchange for a step-down on the annual fee.\n- We have two near-parity alternatives in view, so we would like the renewal to be competitive on price.\n\nCould we get 30 minutes next week to walk through it?\n\nThanks,\nMarc'}});renderChat(($('#csearch')||{}).value||'');}
function renewalHTML(){const R=pvData('deal.renewal',RENEWAL);
 let h='<p class="dashintro"><b>Renewal intelligence · '+PROJECTS[CURPROJ].supplier+'</b>, the renew / renegotiate / recompete read assembled from spend, performance, compliance and market. Reflect-only.</p>';
 h+=threadBar('renewal');
 h+='<div class="sect"><div class="secthd"><div class="t">Recommendation</div><button class="btn btn-ghost btn-sm" onclick="draftRenewalOpening()">Draft renewal opening</button></div><div class="card"><div class="recbox"><span class="recpill '+R.rec+'">'+R.recT+'</span><div class="recwhy">'+R.why+'</div></div><div class="spnote">At the <b>120-day notice window</b>, Theo auto-drafts the renewal opening from the leverage points (uncapped-renewal exposure, competitive tension, term-for-rate). Reflect-only; you review and send.</div></div></div>';
 h+='<div class="sect"><div class="secthd"><div class="t">Renewal dossier</div></div><div class="card" style="padding:4px 6px"><table class="agenda"><tbody>'+
   [['Expiry',R.expiry+' · '+R.window],['Spend / commitment',R.spend],['Performance',R.perf],['Compliance',R.compliance],['Market alternatives',R.market],['Price exposure',R.price]].map(function(r){return '<tr><td class="iss">'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join('')+'</tbody></table></div></div>';
 h+='<div class="sect"><div class="secthd"><div class="t">Savings model</div><button class="btn btn-ghost btn-sm" onclick="modelSavings()">Model savings</button></div><div class="card"><div id="savmodel">'+savingsModelHTML()+'</div>'+
   '<div class="savlock"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--mut2);fill:none;stroke-width:2;flex:none"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg><span>This is a <b>negotiation model</b>, not a commitment. A modeled saving can only be <b>committed once the contract is executed</b>, so the number that lands in the Savings tracker is the realized one.</span></div>'+
   '<button class="btn btn-primary btn-sm" '+(R.executed?'onclick="commitSaving('+renewalSaving()+',\'Visier renewal\')"':'disabled title="Available once the contract is executed"')+'>'+(R.executed?'Commit realized saving →':'Commit locked until executed 🔒')+'</button>'+
   '<div class="obfoot" style="margin-top:11px"><span class="threadlink" onclick="tab(\'obligations\')">← driven by the non-renewal notice obligation</span><span class="threadlink" onclick="location.href=\'savings.html\'">→ Savings tracker</span></div></div></div>';
 return h;
}
// renewal savings as a MODEL (market + contract levers), not a commitment; commit is gated on execution
function renewalSaving(){return (pvData('deal.renewal',RENEWAL).levers||[]).filter(function(l){return l.on;}).reduce(function(a,l){return a+l.save;},0);}
function savingsModelHTML(){var R=pvData('deal.renewal',RENEWAL),tot=renewalSaving();
 return '<div class="savbig">$'+Math.round(tot/1000)+'K / yr</div><div class="cnote" style="margin:4px 0 12px;color:var(--mut)">Modeled from the market + contract levers below. Toggle a lever to re-model.</div>'+
  '<div class="levgrid">'+(R.levers||[]).map(function(l){return '<label class="levrow'+(l.on?' on':'')+'"><input type="checkbox" '+(l.on?'checked':'')+' onchange="toggleLever(\''+l.id+'\')"><div class="levm"><div class="levn"><span class="levtag '+l.type+'">'+(l.type==='market'?'Market':'Contract')+'</span>'+l.n+'<span class="levv">'+(l.save>0?'+$'+Math.round(l.save/1000)+'K/yr':'')+'</span></div><div class="levd">'+l.d+'</div></div></label>';}).join('')+'</div>';
}
function toggleLever(id){var l=(pvData('deal.renewal',RENEWAL).levers||[]).find(function(x){return x.id===id;});if(l)l.on=!l.on;var host=document.getElementById('savmodel');if(host)host.innerHTML=savingsModelHTML();}
function modelSavings(){var host=document.getElementById('savmodel');if(host)host.innerHTML=savingsModelHTML();toast('Modeled $'+Math.round(renewalSaving()/1000)+'K/yr from the market + contract levers · not committed (the contract is not yet executed)');}
// ---- Pricing intelligence: gathered benchmarks + proposal normalization + model-change reconciliation ----
const PRICING=_PVTR.pricing||{benchmarks:[],normalize:{},reconcile:{}};
// #E6: "enter once, fan out" - intake captures the union of fields; Theo assembles each
// downstream system's payload (Aravo/ServiceNow/Ariba/SAP/LEAH) from intake + docs + team,
// flags gaps, and drafts the push via the project chat as info arrives. Confirm-to-push.
const SYSDATA=_PVTR.sysData||{captured:[],systems:[]};
// "enter once, fan out": each downstream system's payload now lives on its OWNING workflow
// node (LEAH on Contract & reviews, ServiceNow/Aravo on WwTP risk, Ariba/SAP on Enablement)
// instead of a separate tab, so anything that needs doing in another system surfaces in the
// workflow where the work actually is. SYSDATA stays as the data; the node drawer renders it.
const NODE_SYS={'t-contract':['LEAH'],'t-wwtp':['Aravo','ServiceNow'],'t-enable':['Ariba','SAP']};
function sysByName(n){return SYSDATA.systems.find(function(s){return s.sys===n;});}
function nodeSystemsHTML(id){
 var names=NODE_SYS[id]; if(!names||!names.length) return '';
 var cards=names.map(function(nm){var sy=sysByName(nm); if(!sy) return '';
   var gaps=sy.fields.filter(function(x){return x[2]==='gap';}).length;
   var rows=sy.fields.map(function(x){return '<div class="dhf"><span class="dhk">'+x[0]+'</span><span class="dhv'+(x[2]==='gap'?' gap':'')+'">'+x[1]+'</span><span class="dhsrc '+x[2]+'">'+(x[2]==='gap'?'needed':x[2])+'</span></div>';}).join('');
   var act=gaps?'<span class="dhgap">'+gaps+' field'+(gaps>1?'s':'')+' still needed before push</span>':'<button class="btn btn-ghost btn-sm" onclick="pushSystem(\''+sy.sys+'\')">Draft push to '+sy.sys+'</button>';
   return '<div class="dhsys"><div class="dhsysh"><div class="dhsysn">'+sy.sys+'<span class="dhsysneed">'+sy.need+'</span></div><span class="dhready '+(sy.ready?'ok':'wait')+'">'+(sy.ready?'Ready':gaps+' gap'+(gaps>1?'s':''))+'</span></div><div class="dhfields">'+rows+'</div><div class="dhact">'+act+'</div></div>';
 }).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Systems this step feeds</div></div>'+cards+'<div class="anote">Entered once at intake and fanned out here. Theo prefills each system\'s payload from intake plus your uploaded docs (SOC 2, proposal) and flags the gaps. Pushes are drafted for your confirm, never automatic.</div></div>';
}
function pushSystem(name){var sy=(typeof name==='number')?SYSDATA.systems[name]:sysByName(name);if(!sy)return;CHAT.push({who:llm+' assistant',av:'✦',cls:'ai',model:llm,tm:nowStamp(),tx:'I assembled the '+sy.sys+' payload ('+sy.need+') from intake plus your uploaded docs. Review the fields and confirm to push it to '+sy.sys+'. Nothing goes until you confirm.'});renderChat(($('#csearch')||{}).value||'');closeDrawer();toast('Drafted the '+sy.sys+' push for your confirmation');}
// ===== DEAL TAB (combines Negotiation Prep + Contract Review + Pricing + Renewal) =====
// Negotiate / Review / Renew modes + a persistent Pricing layer. Project-aware: Renew shows
// only on renewal projects; RFx projects get per-supplier MSA lanes with a CONDITIONAL award.
// Each key issue appears ONCE carrying both the negotiation stance and the contract-review read.
var DEAL_MODE='overview';   // approved IA landing: Overview / Strategy & Positions / Pricing & Commercial / Pro-forma / Review
// per line item: market low/median/high, our target->walk-away band, and the supplier's current ask.
// cadence drives the TCO roll-up; bench matches a PRICING.benchmarks row; read = Theo's one-line take.
const ZOPA_LINES=_PVTR.zopa||[];
// deal-wide volume for the TCO ZOPA total, derived from the proposal (see PRICING.normalize: 400 seats, 3-yr term)
const DEAL_TCO=_PVTR.dealTco||{seats:0,years:0};
function zfmt(l,v){return l.unit==='seat'?('$'+v):('$'+v+'K');}
// benchmark row matched to a ZOPA line (or null); market percentile of our ask within the low..high band
function zBench(l){return (pvData('deal.pricing',PRICING).benchmarks||[]).filter(function(b){return b.item===l.bench;})[0]||null;}
function zPctile(l){var r=l.hi-l.lo;if(r<=0)return null;return Math.max(0,Math.min(100,Math.round((l.ask-l.lo)/r*100)));}
// roll a line's target/walk/ask up to a whole-deal dollar figure using seats + term
function zLineTco(l,which){var v=l[which];if(l.cadence==='seat-yr')return v*DEAL_TCO.seats*DEAL_TCO.years;if(l.cadence==='one-time')return v*1000;if(l.cadence==='yr')return v*1000*DEAL_TCO.years;return 0;}
function zTco(v){v=Math.round(v);return v>=1e6?('$'+(v/1e6).toFixed(2)+'M'):('$'+Math.round(v/1000)+'K');}
// deduped key issues: each carries the negotiation stance AND the contract-review read
const DEAL_ISSUES=_PVTR.issues||[];