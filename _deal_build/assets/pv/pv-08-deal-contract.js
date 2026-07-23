// P4/#112: the deal-contract business-data literals below were relocated to the
// seed layer (assets/seed/project-view.js → window.__SEED__.projectView.deal) and
// are read back through Theo.data.projectViewSeed(), a FRESH, DEEP, $src-STRIPPED,
// MUTABLE clone read ONCE here, mirroring the old module-top consts. The page keeps
// mutating this working copy at runtime (cversions.versions grows each turn,
// paper.onSupplierPaper flips, msas[].tied re-ties, contractComments is stripped,
// supplierContact refreshes on ingest, inbound.pending clears) while the seed stays
// pristine. $src is stripped so the values are byte-identical and render is unchanged.
// Config (CHANLAB) and demo interaction state (DEAL_FIN_RESOLVED) stay inline below.
var _PV08 = (typeof Theo !== 'undefined' && Theo.data && Theo.data.projectViewSeed) ? Theo.data.projectViewSeed() : null;
var _PVDEAL = (_PV08 && typeof Theo !== 'undefined' && !Theo.isDNA(_PV08) && _PV08.deal) ? _PV08.deal : {};
function negprepHTML(){const N=pvData('deal.negprep',NEGPREP);
 let h='<p class="dashintro"><b>Negotiation Prep · '+PROJECTS[CURPROJ].supplier+'</b>, legal + commercial read to walk in with. Reflect-only; targets and walk-aways are drafts for the team to set.</p>';
 h+=openDashBar('dashboard-contract.html','Open full Negotiation Prep dashboard');
 h+='<a href="negotiation-practice.html" onclick="practicePreload();return false;" title="Preloads this project into the private practice sandbox" style="display:inline-flex;align-items:center;gap:7px;margin:0 0 16px;padding:8px 15px;border-radius:30px;background:var(--ai-t);color:var(--ai);font-weight:600;font-size:13px;text-decoration:none">✦ Practice this negotiation (preloads this project) →</a>';
 h+=`<div class="sect"><div class="secthd"><div class="t">Target · walk-away · zone</div></div><div class="zone"><div class="zcell target"><div class="zk">Target</div><div class="zv">${N.target}</div></div><div class="zcell walk"><div class="zk">Walk-away</div><div class="zv">${N.walk}</div></div><div class="zcell"><div class="zk">ZOPA</div><div class="zv">${N.zone}</div></div></div></div>`;
 h+=`<div class="sect"><div class="secthd"><div class="t">Leverage read</div></div><p class="cnote">${N.leverage}</p></div>`;
 h+=`<div class="sect"><div class="secthd"><div class="t">Issue agenda</div></div><div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th>Issue</th><th>Target</th><th>Fallback</th><th>Hard-stop</th></tr></thead><tbody>${N.agenda.map(function(a){return `<tr><td class="iss">${a.iss}</td><td>${a.target}</td><td>${a.fallback}</td><td class="hs">${a.hs}</td></tr>`;}).join('')}</tbody></table></div></div>`;
 h+=`<div class="sect"><div class="secthd"><div class="t">Talking points</div></div><ul class="bullets">${N.talking.map(function(t){return '<li>'+t+'</li>';}).join('')}</ul></div>`;
 h+=`<div class="sect"><div class="secthd"><div class="t">Red lines · do not cross</div></div><ul class="bullets">${N.redlines.map(function(t){return '<li class="redline-li">'+t+'</li>';}).join('')}</ul></div>`;
 return h+lifeBar('negprep');
}
// ---- Contract review ----
function scoreColor(s){return s>=80?'var(--teal-d)':s>=60?'var(--amber-d)':'var(--red)';}
// ===== CONTRACT VERSIONING (the spine for the send / receive / normalize arc) =====
// Every turn is a version; a version becomes FINAL only on sourcing-rep approval.
// #E4: each turn is an APPEND-ONLY audit record (actor / side / channel / content hash) that
// PINS to the underlying SharePoint file version; final WORM-archives to cold blob on close.
const CVERSIONS = _PVDEAL.cversions || { doc: 'Contract', repApprover: 'Marc Lane', versions: [] };
var CHANLAB={internal:'Internal edit',outlook:'Sent · Outlook',graph:'Inbound · email',upload:'Uploaded'};
function cvHash(s){var h=2166136261>>>0;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return ('0000000'+h.toString(16)).slice(-6);}
function cvCurrent(){var V=pvData('deal.cversions',CVERSIONS).versions;return V[V.length-1];}
function cvAddVersion(o){var CV=pvData('deal.cversions',CVERSIONS);var cur=cvCurrent();if(cur&&cur.st==='Current')cur.st=o.side==='supplier'?'Sent':'Superseded';
  if(!o.hash)o.hash=cvHash((o.note||'')+o.v);if(!o.sp)o.sp='SP '+CV.versions.length+'.0';if(!o.actor)o.actor=o.by;if(!o.chan)o.chan=o.side==='supplier'?'graph':'internal';
  CV.versions.push(o);CV.repApproved=false;}
function approveFinal(){if(view!=='rep'){toast('Only the sourcing rep can mark a version final.');return;}CVERSIONS.repApproved=true;cvCurrent().st='Final';rerenderDeal();toast('Approved '+cvCurrent().v+' as final · '+CVERSIONS.repApprover+' (sourcing rep)');}
// re-render the host tab after a contract-version action (cvSection now lives in the Deal tab's Review mode)
function rerenderDeal(){ if(curtab==='deal')$('#tabbody').innerHTML=dealHTML(); else if(curtab==='contract'&&typeof contractHTML==='function')$('#tabbody').innerHTML=contractHTML(); try{ if(window.THEO_WORKFLOW&&window.THEO_WORKFLOW.refresh) window.THEO_WORKFLOW.refresh(); }catch(e){} }
function uploadTurn(){if(CVERSIONS.closed){toast('Project is closed and archived; no new turns.');return;}var n=CVERSIONS.versions.length+1,me=(typeof VIEWS!=='undefined'&&VIEWS[view])?VIEWS[view].nm:'Marc Lane';cvAddVersion({v:'v'+n,by:'Lilly · '+me,actor:me+' (internal)',side:'lilly',chan:'upload',date:nowStamp(),note:'Internal turn uploaded (new redline).',st:'Current'});toast('Uploaded a new turn as v'+n+' · auto-versioned and recorded in the audit trail');rerenderDeal();}
function closeArchive(){CVERSIONS.closed=true;toast('Project closed · final '+cvCurrent().v+' locked and archived; the audit trail is sealed');rerenderDeal();}
function cvDetail(i){var o=CVERSIONS.versions[i];if(!o)return;
 $('#drawer').innerHTML='<div class="dh"><div><h3>'+CVERSIONS.doc+' · '+o.v+'</h3><div class="dsub">Audit record</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db"><div class="kv">'+
  '<div class="k">Disposition</div><div class="v">'+o.st+'</div>'+
  '<div class="k">Actor</div><div class="v">'+o.actor+'</div>'+
  '<div class="k">Side</div><div class="v">'+(o.side==='lilly'?'Lilly':o.side==='supplier'?'Supplier':o.side)+'</div>'+
  '<div class="k">Channel</div><div class="v">'+(CHANLAB[o.chan]||o.chan||'-')+'</div>'+
  '<div class="k">Timestamp</div><div class="v">'+o.date+'</div>'+
  '<div class="k">Content hash</div><div class="v" style="font-family:var(--mono)">'+o.hash+'</div>'+
  '<div class="k">SharePoint version</div><div class="v">'+o.sp+'</div>'+
  '<div class="k">Change</div><div class="v">'+o.note+'</div></div>'+
  '<div class="spnote"><b>Permanent record, never edited.</b> A new turn supersedes this row rather than changing it. This is the system of record for the negotiation (who, which side, which channel, when), tied to the SharePoint file version ('+o.sp+'). '+(CVERSIONS.closed&&o.st==='Final'?'Locked and archived on project close.':(o.st==='Final'?'Approved as final by '+CVERSIONS.repApprover+'.':''))+'</div></div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');}
function cvSectionHTML(){var CV=pvData('deal.cversions',CVERSIONS),CL=pvData('deal.chanlab',CHANLAB);var fin=CV.repApproved,cur=cvCurrent(),closed=CV.closed;
 var rows=CV.versions.map(function(o,i){return '<div class="cvrow '+o.side+'" onclick="cvDetail('+i+')" title="View the audit record"><span class="cvv">'+o.v+'</span><div class="cvm"><div class="cvby">'+o.by+'<span class="cvchan '+o.chan+'">'+(CL[o.chan]||o.chan)+'</span><span class="cvdt">'+o.date+'</span></div><div class="cvnote">'+o.note+'</div></div><span class="cvst '+(o.st==='Final'?'final':o.st==='Current'?'cur':'')+'">'+o.st+'</span></div>';}).join('');
 var gate;
 if(closed){ gate='<div class="cvgate ok"><span><b>Closed.</b> Final '+cur.v+' is <b>locked and archived</b>; the audit trail is sealed. Nothing further can be sent.</span></div>'; }
 else if(fin){ gate='<div class="cvgate ok"><span><b>Final.</b> '+cur.v+' approved by <b>'+CV.repApprover+'</b> (sourcing rep). Version of record; locks until a new turn supersedes it.</span></div>'; }
 else if(view==='rep'){ gate='<div class="cvgate"><span>A version becomes <b>final only on sourcing-rep approval</b>. You are the sourcing rep; Finalize runs a readiness check first.</span></div>'; }
 else { gate='<div class="cvgate"><span>A version becomes <b>final only on sourcing-rep approval</b>. Awaiting <b>'+CV.repApprover+'</b> (sourcing rep).</span></div>'; }
 var actions=cvActionBarHTML(cur,fin,closed);
 return '<div class="sect"><div class="secthd"><div class="t">Contract versions</div><span class="cvstate '+(fin||closed?'final':'')+'">'+(closed?'Closed · '+cur.v:(fin?'Final · '+cur.v:'Draft · '+cur.v))+'</span></div>'+inboundCardHTML()+'<div class="cvchain">'+rows+'</div>'+gate+actions+'<div class="spnote">Every turn is a permanent <b>audit record</b> (who · which side · which channel · timestamp) - click a version to see it. The final version is <b>locked and archived</b> on project close.</div></div>';
}
// Compact, right-aligned action bar that rides WITH the latest version row (btn-sm; no full-width blocks).
// Active negotiation -> Send / Upload / (rep) Finalize; finalized -> (rep) Reopen / Close & archive.
function cvActionBarHTML(cur,fin,closed){
 if(closed) return '';   // archived + sealed: no further actions
 var v=escapeHtmlPV(cur?cur.v:'');
 if(fin){
  var rb=(view==='rep')?'<button class="btn btn-ghost btn-sm" onclick="reopenFinal()">Reopen '+v+'</button>':'';
  return '<div class="cvacts">'+rb+'<button class="btn btn-ghost btn-sm" onclick="closeArchive()">Close &amp; archive</button></div>';
 }
 var up='<button class="btn btn-ghost btn-sm" onclick="uploadTurn()"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>Upload new turn</button>';
 // State-gate: show only the action valid at THIS point. Pen with the supplier -> we
 // already sent, so no "Send"; we wait for their turn or log it. Pen with Lilly -> draft/send/finalize.
 var pen=dealPenSide();
 if(pen.side==='supplier'){
  return '<div class="cvacts"><span class="cvwait"><span class="dot supplier"></span>Sent '+v+' · waiting on '+escapeHtmlPV(pen.label)+'</span>'+up+'</div>';
 }
 var send='<button class="btn btn-ghost btn-sm" onclick="sendToSupplier()"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>Send '+v+' to supplier</button>';
 var finBtn='',blockNote='';
 if(view==='rep'){
  var offline=!(window.LillyAPI&&LillyAPI.configured&&LillyAPI.configured());
  var pre=offline?dealDemoReadiness():null;   // live evaluates on click; offline can pre-flag the hard block
  if(pre&&pre.status==='blocked'){
   finBtn='<button class="btn btn-ghost btn-sm cvfin blocked" onclick="finalizeCheck()" title="A high-risk item is open">Finalize '+v+' · blocked</button>';
   blockNote='<div class="cvblock">Finalize blocked: '+((pre.highRiskItems||[]).length)+' high-risk item(s) open. Resolve before finalizing.</div>';
  }else{
   finBtn='<button class="btn btn-primary btn-sm" onclick="finalizeCheck()">Finalize '+v+'</button>';
  }
 }
 return '<div class="cvacts">'+send+up+finBtn+'</div>'+blockNote;
}
// ===== INTELLIGENT FINALIZE GATE (state-driven; the ONE hard block is finalize-on-open-high-risk) =====
// Readiness comes from LillyAPI.finalizeReadiness via tryLive; offline falls back to a demo readiness
// derived from PAPER deviations + CONTRACT gaps. ready -> confirm + finalize; unresolved -> advise +
// cleanup / open in Word; blocked -> BLOCK finalize until the high-risk item is resolved. Reflect-only.
var DEAL_FIN_RESOLVED=false;   // demo: "Run contract cleanup" flips this so the demo can reach 'ready'
function dealDemoReadiness(){
 var devs=(typeof PAPER!=='undefined'&&PAPER.deviations)?PAPER.deviations:[];
 var high=devs.filter(function(x){return x.sev==='high';});
 var openLabels=devs.map(function(x){return x.sec+' ('+(x.sev==='high'?'High':x.sev==='med'?'Med':'Low')+')';});
 var highLabels=high.map(function(x){return x.sec+' - Lilly needs: '+x.lilly;});
 if(DEAL_FIN_RESOLVED) return {status:'ready',openItems:[],highRiskItems:[],allowCleanup:true,note:'Open review items cleared. Ready to finalize.'};
 if((typeof PAPER!=='undefined'&&PAPER.onSupplierPaper)&&high.length) return {status:'blocked',openItems:openLabels,highRiskItems:highLabels,allowCleanup:false,note:high.length+' high-risk item(s) are open on supplier paper. These must be resolved before finalizing.'};
 if(devs.length) return {status:'unresolved',openItems:openLabels,highRiskItems:[],allowCleanup:true,note:devs.length+' open item(s). Clean these up or open the document in Word before finalizing.'};
 return {status:'ready',openItems:[],highRiskItems:[],allowCleanup:true,note:'No open items. Ready to finalize.'};
}
function dealLiveContractId(){
 if(!(window.LillyAPI&&LillyAPI.configured&&LillyAPI.configured()))return '';
 var mm=(location.hash||'').match(/p=([a-z0-9_-]+)/i);var id=mm&&mm[1];
 if(!id||(typeof PROJECTS!=='undefined'&&PROJECTS[id]))return '';  // canned demo project -> no live contract id
 return id;
}
async function finalizeCheck(){
 if(view!=='rep'){toast('Only the sourcing rep can mark a version final.');return;}
 var cur=cvCurrent();if(!cur)return;
 if(!window.LillyAPI){finalizeGateRender(dealDemoReadiness(),cur);return;}
 var body={versionId:cur.v,findings:dealReviewFindingsContext().findings,openItems:((typeof PAPER!=='undefined'&&PAPER.deviations)?PAPER.deviations:[]).map(function(x){return {label:x.sec,severity:x.sev,lilly:x.lilly};})};
 var r=await LillyAPI.tryLive(function(){return LillyAPI.finalizeReadiness(dealLiveContractId(),body);},{readiness:dealDemoReadiness()});
 var rd=(r&&r.data&&r.data.readiness)?r.data.readiness:((r&&r.data&&r.data.status)?r.data:dealDemoReadiness());
 if(!rd||!rd.status)rd=dealDemoReadiness();
 finalizeGateRender(rd,cur);
}
function finalizeGateRender(rd,cur){
 var st=rd.status;
 if(st==='ready'){
  if(window.confirm('Finalize '+cur.v+' as the version of record? This locks it until a new turn supersedes it. Reflect-only; nothing is sent.')) approveFinal();
  return;
 }
 var esc=escapeHtmlPV;
 var li=function(x){return '<li>'+esc(typeof x==='string'?x:(x&&x.label?x.label:JSON.stringify(x)))+'</li>';};
 var openList=(rd.openItems||[]).map(li).join('');
 var highList=(rd.highRiskItems||[]).map(li).join('');
 var docHref=escapeHtmlPV(safeHref(CDR_DOC_URL));
 var body;
 if(st==='blocked'){
  body='<div class="cvfg block"><div class="cvfgh">Resolve these before finalizing:</div>'+
   (highList?'<ul class="cvfgl">'+highList+'</ul>':'<p class="cnote">A high-risk item is open.</p>')+
   (rd.note?'<p class="cnote">'+esc(rd.note)+'</p>':'')+
   '<div class="cvfgacts"><a class="btn btn-ghost btn-sm" href="'+docHref+'" target="_blank" rel="noopener">Open in Word</a>'+
   '<button class="btn btn-ghost btn-sm" onclick="finalizeGoToContract()">Go to the contract</button></div>'+
   '<div class="anote">Finalize is blocked while a high-risk item is open. This is the one hard block; nothing is finalized until it is resolved. Reflect-only.</div></div>';
 }else{   // unresolved (advisory)
  body='<div class="cvfg"><div class="cvfgh">Open items to clear before finalizing:</div>'+
   (openList?'<ul class="cvfgl">'+openList+'</ul>':'<p class="cnote">Open items remain.</p>')+
   (rd.note?'<p class="cnote">'+esc(rd.note)+'</p>':'')+
   '<div class="cvfgacts"><a class="btn btn-ghost btn-sm" href="'+docHref+'" target="_blank" rel="noopener">Open in Word</a>'+
   (rd.allowCleanup!==false?'<button class="btn btn-primary btn-sm" onclick="finalizeCleanup()">Run contract cleanup</button>':'')+
   '</div><div class="anote">These are open review items. Open the document in Word or run contract cleanup, then finalize. Reflect-only; nothing is finalized here.</div></div>';
 }
 var head='<div class="dh"><div><h3>Finalize '+esc(cur.v)+'</h3><div class="dsub">Readiness check</div></div><div class="dc" onclick="closeDrawer()">&times;</div></div>';
 $('#drawer').innerHTML=head+'<div class="db">'+body+'</div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');
}
function finalizeCleanup(){DEAL_FIN_RESOLVED=true;toast('Ran contract cleanup on the open items (demo). Re-checking finalize readiness.');closeDrawer();finalizeCheck();}
function finalizeGoToContract(){closeDrawer();if(typeof dealMode==='function')dealMode('review');toast('Opened the contract review. Resolve the high-risk items, then finalize.');}
function reopenFinal(){
 if(view!=='rep'){toast('Only the sourcing rep can reopen a finalized version.');return;}
 if(CVERSIONS.closed){toast('This project is closed and archived; a sealed version cannot be reopened.');return;}
 if(!CVERSIONS.repApproved&&cvCurrent().st!=='Final'){toast('This version is not final; nothing to reopen.');return;}
 CVERSIONS.repApproved=false;var cur=cvCurrent();if(cur&&cur.st==='Final')cur.st='Current';
 DEAL_FIN_RESOLVED=false;
 toast('Reopened '+(cur?cur.v:'the version')+' back to in-review. Finalization reversed; the version is editable again.');
 rerenderDeal();
}
// ===== CONTRACT STATUS STRIP (persistent, compact, read-only) at the top of the Deal tab =====
// Version + turn, derived status, governing-MSA chip, paper chip, and who-holds-the-pen. No actions.
function dealOpenHigh(){try{return ((typeof PAPER!=='undefined'&&PAPER.deviations)?PAPER.deviations:[]).filter(function(x){return x.sev==='high';}).length;}catch(e){return 0;}}
function dealProcStatus(){
 var cur=cvCurrent();
 if(!cur) return {k:'review',label:'Draft'};
 if(CVERSIONS.closed) return {k:'executed',label:'Executed'};
 if(CVERSIONS.repApproved||cur.st==='Final') return {k:'final',label:'Finalized'};
 if(cur.st==='Sent') return {k:'supplier',label:'With supplier'};
 if(cur.side==='lilly'&&cur.st==='Current'&&dealOpenHigh()===0) return {k:'ready',label:'Ready to finalize'};
 return {k:'review',label:'In review'};   // supplier turn to answer, or a Lilly draft with items still open
}
function dealPenSide(){
 var cur=cvCurrent();if(!cur)return {side:'lilly',label:'Lilly'};
 if(cur.st==='Sent') return {side:'supplier',label:(SUPPLIER_CONTACT&&SUPPLIER_CONTACT.company)||'Supplier'};
 if(cur.st==='Received') return {side:'lilly',label:'Lilly'};
 return (cur.side==='supplier')?{side:'supplier',label:(SUPPLIER_CONTACT&&SUPPLIER_CONTACT.company)||'Supplier'}:{side:'lilly',label:'Lilly'};
}
function dealStripMSA(){
 try{var _m=pvData('msas',MSAS)||[];var t=_m.filter(function(m){return m.tied;})[0]||_m[0];if(t&&t.name)return t.name;}catch(e){}
 try{var g=dealGoverningMSA();if(g)return g;}catch(e){}
 return 'Governing MSA';
}
function dealStatusStripHTML(){
 var esc=escapeHtmlPV;var cur=cvCurrent();var proc=dealProcStatus();var pen=dealPenSide();
 var CV=pvData('deal.cversions',CVERSIONS);var turns=((CV&&CV.versions)||[]).length;
 var doc=(CV&&CV.doc)||'Contract';
 var onSup=!!(typeof PAPER!=='undefined'&&PAPER.onSupplierPaper);
 var chips=''+
  '<span class="dschip"><b>'+esc(doc)+'</b> · '+esc(cur?cur.v:'-')+' · turn '+turns+'</span>'+
  '<span class="dschip st '+proc.k+'">'+esc(proc.label)+'</span>'+
  '<span class="dschip">MSA: <b>'+esc(dealStripMSA())+'</b></span>'+
  '<span class="dschip paper'+(onSup?'':' lilly')+'">'+(onSup?'On supplier paper':'On Lilly paper')+'</span>'+
  '<span class="dschip pen"><span class="dot '+esc(pen.side)+'"></span>Pen: '+esc(pen.label)+'</span>';
 var gateNote=(proc.k==='final'||proc.k==='ready'||proc.k==='executed')
  ? '<div class="dstripnote">Pre-execution gate: <a class="dlk" style="color:var(--navy)" onclick="openCdrConfirm();return false;">Confirm contract data -&gt;</a> required before Lilly execution.</div>'
  : '<div class="dstripnote">Contract-data confirmation happens at the pre-execution gate - a required step before Lilly execution.</div>';
 return '<div class="dstrip"><span class="dstripk">Contract status</span>'+chips+'</div>'+gateNote;
}
// ===== #231 SEND TO SUPPLIER: internal-comment guard -> Outlook draft + attachment, reply-to-thread by default =====
const SUPPLIER_CONTACT = _PVDEAL.supplierContact || { name: '', email: '', company: 'Supplier' };
var CONTRACT_COMMENTS = _PVDEAL.contractComments || [];
function sendToSupplier(){var _sc=pvData('contact',SUPPLIER_CONTACT);var internal=CONTRACT_COMMENTS.filter(function(c){return c.aud==='internal';});var cur=cvCurrent();
 var inner=internal.length?sendGuardHTML(internal):draftBlockHTML();
 $('#drawer').innerHTML='<div class="dh"><div><h3>Send to supplier</h3><div class="dsub">'+cur.v+' · '+_sc.company+'</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db">'+inner+'</div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');}
function sendGuardHTML(internal){var _sc=pvData('contact',SUPPLIER_CONTACT);
 return '<div class="sendguard"><div class="sgh"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--red);fill:none;stroke-width:2;flex:none"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg><span><b>'+internal.length+' internal-only comment'+(internal.length>1?'s':'')+'</b> must come out before this goes to '+_sc.company+'. This is the leak that burns sourcing teams.</span></div>'+
  internal.map(function(c){return '<div class="sgc"><span class="audpip internal">Internal</span><div><b>'+c.who+'</b> '+c.txt+'</div></div>';}).join('')+
  '<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="stripInternalAndDraft()">Strip internal comments and continue</button></div>';
}
function stripInternalAndDraft(){CONTRACT_COMMENTS=CONTRACT_COMMENTS.filter(function(c){return c.aud!=='internal';});toast('Removed the internal-only comments from the outgoing copy');sendToSupplier();}
// #E1: Theo auto-drafts the negotiation reply (structured redline summary + cover note) each turn.
var REPLY_REDLINES = _PVDEAL.replyRedlines || [];
function draftBlockHTML(){var _sc=pvData('contact',SUPPLIER_CONTACT);var cur=cvCurrent();var first=_sc.name.split(' ')[0];
 var rl='<div class="draftrl"><div class="drlh">Redline summary · this turn (auto-drafted)</div>'+REPLY_REDLINES.map(function(r){return '<div class="drlrow"><span class="drlpt">'+r.pt+'</span><span class="drlmv">'+r.move+'</span></div>';}).join('')+'</div>';
 return '<div class="sendok"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:var(--bblue);fill:none;stroke-width:2;flex:none"><path d="M20 6 9 17l-5-5"/></svg><span>No internal-only comments remain. Safe to send to '+_sc.company+'.</span></div>'+
  '<div class="sect" style="margin-top:13px"><div class="secthd"><div class="t">Negotiation reply · Outlook draft</div></div><div class="draftcard">'+
   '<label class="rtl"><input type="checkbox" id="replythread" checked><span>Reply on the existing thread with '+_sc.name+'<span class="rtlrec">recommended</span></span></label>'+
   '<div class="dkv"><span>To</span><b>'+_sc.name+' &lt;'+_sc.email+'&gt;</b></div>'+
   '<div class="dkv"><span>Subject</span><b>RE: Visier x Lilly MSA · '+cur.v+'</b></div>'+
   rl+
   '<div class="draftbody">Hi '+first+',\n\nThanks for the last turn. Attached is '+cur.v+' with our responses to your edits; the key changes this turn are summarized above. In short: we held the liability cap at 1x with a PI carve-out, added a prior-approval right on sub-processors, proposed a CPI-capped renewal, and conceded the venue.\n\nHappy to walk through any of it.\n\nBest,\nMarc</div>'+
   '<div class="attchip"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="#2B579A" stroke-width="2"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/></svg><b>MSA_Visier_'+cur.v+'.docx</b><span>attached · current version</span></div>'+
  '</div></div>'+
  '<button class="btn btn-primary btn-sm" style="margin-top:11px" onclick="openOutlookDraft()"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg>Open draft in Outlook</button>'+
  '<div class="anote">Theo auto-drafts the negotiation reply (cover note + redline summary) and attaches '+cur.v+'. Nothing is sent on your behalf; you review and send in Outlook.</div>';
}
function openOutlookDraft(){var r=document.getElementById('replythread');toast('Opened in Outlook · '+(r&&r.checked?'reply on the existing Visier thread':'new email')+' · '+cvCurrent().v+' attached. Review and send.');closeDrawer();}
// ===== #232 SUPPLIER PAPER -> LILLY TEMPLATE (deviation redline) + MULTI-MSA TYING =====
const PAPER = _PVDEAL.paper || { onSupplierPaper: false, deviations: [] };
var MSAS = _PVDEAL.msas || [];
function devRowsHTML(){return pvData('paper',PAPER).deviations.map(function(x){return '<div class="devrow"><span class="gsev '+x.sev+'">'+(x.sev==='high'?'High':x.sev==='med'?'Med':'Low')+'</span><div class="devm"><div class="devsec">'+x.sec+'</div><div class="devvs"><span class="devsup"><b>Supplier</b> '+x.supplier+'</span><span class="devlil"><b>Lilly</b> '+x.lilly+'</span></div></div></div>';}).join('');}
function paperSectionHTML(){var P=pvData('paper',PAPER);var _sc=pvData('contact',SUPPLIER_CONTACT);var hi=P.deviations.filter(function(x){return x.sev==='high';}).length;
 var msa=(pvData('msas',MSAS)||[]).map(function(m){return '<label class="msarow'+(m.tied?' on':'')+'"><input type="radio" name="msatie" '+(m.tied?'checked':'')+' onchange="tieMSA(\''+m.id+'\')"><div class="msam"><div class="msan">'+m.name+(m.match?'<span class="msasug">Theo suggests</span>':'')+'</div><div class="msad">'+m.scope+' · '+m.status+'</div></div></label>';}).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Paper &amp; governing agreement</div>'+(P.onSupplierPaper?'<span class="paperbadge">On supplier paper</span>':'<span class="paperbadge lilly">On Lilly paper</span>')+'</div>'+
  '<div class="card"><div class="papertop"><div class="papertxt">This draft arrived on <b>'+_sc.company+'\'s paper</b>. Theo maps it onto the <b>Lilly template</b> and redlines every deviation ('+P.deviations.length+' found, '+hi+' high), so you negotiate from our standard, not theirs.</div><button class="btn btn-primary btn-sm" onclick="mapToTemplate()">Map to Lilly template</button></div>'+
  '<div class="devlist">'+devRowsHTML()+'</div></div>'+
  '<div class="secthd" style="margin-top:14px"><div class="t">Governing MSA · this work order</div></div><div class="card"><div class="msalist">'+msa+'</div><div class="spnote">Multi-MSA: Theo suggests the governing agreement for this work order; the sourcing rep confirms. The work order inherits the tied MSA\'s terms unless re-tied.</div></div>'+
  '<div class="secthd" style="margin-top:14px"><div class="t">Order form / SOW</div></div><div class="card"><div class="papertop"><div class="papertxt">Theo can draft the <b>Work Order / SOW on Lilly paper</b> from Visier\'s proposal: services, fees, SLAs and data terms pulled across onto our template, tied to the governing MSA. You confirm the few open fields.</div><button class="btn btn-primary btn-sm" onclick="runSkill(\'order-form\')">Draft order form</button></div></div></div>';
}
function mapToTemplate(){var P=PAPER;var hi=P.deviations.filter(function(x){return x.sev==='high';}).length;
 $('#drawer').innerHTML='<div class="dh"><div><h3>Map to Lilly template</h3><div class="dsub">'+SUPPLIER_CONTACT.company+' paper to Lilly standard</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db"><p class="narr">Theo aligns each section of the supplier\'s paper to the Lilly template and redlines the deviations. <b>'+P.deviations.length+' deviations</b> found, '+hi+' high-severity.</p><div class="devlist">'+devRowsHTML()+'</div><button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="genTemplateRedline()">Generate Lilly-template redline</button><div style="font-size:var(--fz-meta);color:var(--mut2);font-style:italic;margin-top:9px">Produces a redline that converts the supplier paper to the Lilly template, attributed to Theo for Lilly. You review it in Word.</div></div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');
}
function genTemplateRedline(){cvAddVersion({v:'v4',by:'Lilly · Theo template map',side:'lilly',date:slaDate(0),note:'Mapped '+SUPPLIER_CONTACT.company+' paper onto the Lilly template; '+PAPER.deviations.length+' deviations redlined.',st:'Current'});PAPER.onSupplierPaper=false;toast('Generated the Lilly-template redline ('+PAPER.deviations.length+' deviations) · added as a new version');closeDrawer();rerenderDeal();}
function tieMSA(id){var _m=pvData('msas',MSAS);_m.forEach(function(m){m.tied=(m.id===id);});var m=_m.find(function(x){return x.id===id;});toast('Tied this work order to '+(m?m.name:'the MSA'));}
// ===== #233 INBOUND SUPPLIER-DRAFT INGEST (Graph mail read -> attachment grab -> sender->project match) =====
// Scope guard: only known suppliers on ACTIVE projects; never auto-creates a project from an email.
var INBOUND = _PVDEAL.inbound || { pending: false, from: {} };
function inboundCardHTML(){var I=pvData('inbound',INBOUND);var _sc=pvData('contact',SUPPLIER_CONTACT);if(!I.pending)return '';
 return '<div class="inbound"><div class="inbh"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg><div><div class="inbt">Inbound from '+I.from.name+'</div><div class="inbs">'+I.from.email+' · '+I.received+'</div></div><span class="inbmatch">Matched to this project</span></div>'+
  '<div class="inbbody">Theo read a reply on the Visier thread, grabbed the attachment <b>'+I.attachment+'</b>, and matched it to <b>'+I.matchedProject+'</b> ('+I.matchBy+'). Known supplier on an active project, so it is not spam.'+(I.onSupplierPaper?' <b>Detected: on '+_sc.company+'\'s paper</b>, not the Lilly template - so Theo offers to map it on ingest.':'')+'</div>'+
  (I.onSupplierPaper
    ? '<div class="inbacts"><button class="btn btn-primary btn-sm" onclick="ingestAndConvert()">Ingest &amp; map to Lilly template</button><button class="btn btn-ghost btn-sm" onclick="ingestInbound()">Ingest as-is (keep their paper)</button><button class="btn btn-ghost btn-sm" onclick="dismissInbound()">Not now</button></div>'
    : '<div class="inbacts"><button class="btn btn-primary btn-sm" onclick="ingestInbound()">Ingest as new version</button><button class="btn btn-ghost btn-sm" onclick="dismissInbound()">Not now</button></div>')+
  '<div class="inbnote">Theo only ingests from <b>known suppliers on active projects</b> and never auto-creates a project from an inbound email. Unrecognized senders are held for triage, not actioned.</div></div>';
}
function ingestInbound(){var I=INBOUND;cvAddVersion({v:'v'+(pvData('deal.cversions',CVERSIONS).versions.length+1),by:'Visier · '+I.from.name,side:'supplier',date:slaDate(0),note:'Inbound redline grabbed from the Visier email thread ('+I.attachment+').',st:'Received'});
 SUPPLIER_CONTACT.name=I.from.name;SUPPLIER_CONTACT.email=I.from.email;  // store/refresh the supplier contact
 INBOUND.pending=false;toast('Ingested '+I.attachment+' as a new version · stored '+I.from.name+' <'+I.from.email+'> as the Visier contact');rerenderDeal();}
function dismissInbound(){INBOUND.pending=false;toast('Left the inbound draft in the thread; you can ingest it later');rerenderDeal();}
// Ingest a supplier-paper draft AND, at that moment, present the convert-to-Lilly-template decision.
function ingestAndConvert(){ingestInbound();setTimeout(function(){if(typeof mapToTemplate==='function')mapToTemplate();},140);}
// open the attributed redline (tracked changes authored as "Theo for Lilly", co-authored in Word Online)
function openRedlines(){toast('Opening MSA_Visier_redline_v3.docx in Word Online · tracked changes attributed to "Theo for Lilly" · permissions inherited from the project library');}
// ===== #135 PUSH TO LEAH, reflect-only queue-submit to the CLM system of record =====
// Additive; the contract-review UI is untouched. Offered ONLY where the contract type
// is MSA / CDA / MSA-amendment (the server's LEAH_PUSHABLE_CONTRACT_TYPES allow-set) —
// the FE gate mirrors the backend, which re-enforces it (400 on a non-allowed type).
// Flow: preview -> explicit confirm (matches the server's confirm:true / 412 gate) ->
// queue-submit. LIVE (backend reachable): POST /api/projects/:id/contracts/leah-submit
// and render the returned provenance label + the NON-authoritative status
// (registered|pending); 400 (type-not-pushable) / 412 (needs confirm) / 401 (sign-in) /
// 404 (unregistered) are surfaced honestly and degrade gracefully. OFFLINE/demo: a
// reflect-only toast + preview, no network call (the single-file demo keeps working).
// It INITIATES / REGISTERS the contract in LEAH, LEAH owns authoring; nothing is
// authored, approved, signed, or gate-advanced here.
function dealLeahContractType(){
 var P=(typeof PROJECTS!=='undefined'&&PROJECTS[CURPROJ])||{};
 var t=P.traits||{};var em=t.existingMSA;var gaps=(em&&em.gaps)||[];
 // MSA-amendment: an existing MSA is amended, a buy-under-MSA whose governing MSA has
 // gaps (escalates to the amendment path) OR a renewal placed as an amendment on Lilly paper.
 if(em&&(gaps.length||t.renewal))return 'MSA-amendment';
 // CDA: a confidentiality / NDA agreement (doc type derived from the project).
 if(typeof dealDocType==='function'&&dealDocType()==='cda')return 'CDA';
 // MSA: a NEW master agreement, authored once the supplier is chosen (no existing MSA).
 if(t.newSupplier&&t.supplierChosen&&!em)return 'MSA';
 return null;   // order-form / SOW / true-up / eval / not-yet-chosen -> not pushable to LEAH
}
function dealLeahCounterparty(){
 var P=(typeof PROJECTS!=='undefined'&&PROJECTS[CURPROJ])||{};
 return P.supplier||(typeof SUPPLIER_CONTACT!=='undefined'&&SUPPLIER_CONTACT&&SUPPLIER_CONTACT.company)||'Supplier';
}
// Type-gated section: renders NOTHING unless the contract type is pushable to LEAH.
function pushToLeahSectionHTML(){
 var ct=dealLeahContractType();if(!ct)return '';
 var esc=escapeHtmlPV;var supplier=esc(dealLeahCounterparty());
 return '<div class="sect"><div class="secthd"><div class="t">Register in LEAH</div>'+
  '<span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">reflect-only · LEAH is the system of record</span></div>'+
  '<div class="card"><div class="papertxt">Push this <b>'+esc(ct)+'</b> to <b>LEAH</b> (the CLM system of record) to <b>initiate / register</b> the contract record and start authoring there. Reflect-only, LEAH owns authoring, redlines and signature; nothing is authored, approved, signed, or gate-advanced here.</div>'+
  '<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="pushToLeahPreview()"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>Push to LEAH</button>'+
  '<div class="anote">Queue-submits the '+esc(ct)+' request to LEAH for '+supplier+'. LEAH remains authoritative; the gate is not advanced.</div></div></div>';
}
function pushToLeahPreview(){
 var ct=dealLeahContractType();
 if(!ct){toast('This contract type cannot be pushed to LEAH (only MSA, CDA and MSA-amendment).');return;}
 var P=(typeof PROJECTS!=='undefined'&&PROJECTS[CURPROJ])||{};var esc=escapeHtmlPV;
 var supplier=dealLeahCounterparty();
 $('#drawer').innerHTML='<div class="dh"><div><h3>Push to LEAH</h3><div class="dsub">Register the contract in the CLM system of record</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db">'+
  '<p class="narr">Review what will be sent to <b>LEAH</b>. This <b>initiates / registers</b> the contract record and starts authoring in LEAH. It does <b>not</b> author, approve, sign, or advance a gate here, LEAH remains the system of record.</p>'+
  '<div class="kv">'+
   '<div class="k">Contract type</div><div class="v">'+esc(ct)+'</div>'+
   '<div class="k">Counterparty</div><div class="v">'+esc(supplier)+'</div>'+
   '<div class="k">Lilly party</div><div class="v">Eli Lilly and Company</div>'+
   '<div class="k">Deal reference</div><div class="v">'+esc((P.code||CURPROJ)+(P.title?' · '+P.title:''))+'</div>'+
  '</div>'+
  '<div class="leahprov" style="margin-top:14px">Reflect-only queue-submit · LEAH owns authoring / redlines / signature · nothing authored, approved, or gate-advanced.</div>'+
  '<div class="cvfgacts" style="margin-top:14px"><button class="btn btn-primary btn-sm" onclick="pushToLeahConfirm()">Confirm &amp; push to LEAH</button><button class="btn btn-ghost btn-sm" onclick="closeDrawer()">Cancel</button></div>'+
 '</div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');
}
async function pushToLeahConfirm(){
 var ct=dealLeahContractType();
 if(!ct){toast('This contract type cannot be pushed to LEAH.');closeDrawer();return;}
 var P=(typeof PROJECTS!=='undefined'&&PROJECTS[CURPROJ])||{};
 var supplier=dealLeahCounterparty();
 var body={type:ct,counterparty:supplier,confirm:true,lillyParty:'Eli Lilly and Company',title:(P.title||(ct+', '+supplier)),dealRef:(P.code||CURPROJ)};
 // OFFLINE / demo: reflect-only, no network call, mirrors the other demo actions.
 if(!(window.LillyAPI&&LillyAPI.configured&&LillyAPI.configured())){
  pushToLeahResult({demo:true,status:'registered',label:'queue-submitted to LEAH · system of record remains authoritative · gate not advanced'},ct,supplier);
  return;
 }
 // LIVE: POST the queue-submit; surface the returned provenance + non-authoritative status.
 try{
  var r=await LillyAPI.leahSubmit(CURPROJ,body);
  pushToLeahResult({
   status:(r&&r.result&&r.result.status)||'pending',
   label:(r&&r.provenance&&r.provenance.label)||'queue-submitted to LEAH · system of record remains authoritative · gate not advanced',
   contractId:(r&&r.result&&r.result.contractId)||'',
   link:(r&&r.result&&r.result.link)||''
  },ct,supplier);
 }catch(e){
  var st=e&&e.status;var msg;
  if(st===400)msg='LEAH did not accept this contract type. Only MSA, CDA and MSA-amendment can be pushed today.';
  else if(st===412)msg='LEAH requires an explicit confirmation before a contract is registered. Nothing was pushed.';
  else if(st===401)msg='Please sign in to push a contract to LEAH. Nothing was pushed.';
  else if(st===404)msg='This project is not yet registered in the backend, so it cannot be pushed to LEAH. Nothing was pushed.';
  else msg='LEAH could not be reached, so nothing was pushed. LEAH remains the system of record; try again shortly.';
  pushToLeahError(msg,ct,supplier);
 }
}
function pushToLeahResult(info,ct,supplier){
 var esc=escapeHtmlPV;
 var statusLabel=info.status==='registered'?'Registered in LEAH':'Pending registration in LEAH';
 var linkHref=info.link?esc(typeof safeHref==='function'?safeHref(info.link):info.link):'';
 $('#drawer').innerHTML='<div class="dh"><div><h3>Pushed to LEAH</h3><div class="dsub">'+esc(ct)+' · '+esc(supplier)+'</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db">'+
  '<div class="sendok"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:var(--bblue);fill:none;stroke-width:2;flex:none"><path d="M20 6 9 17l-5-5"/></svg><span><b>'+esc(statusLabel)+'</b>'+(info.demo?' (reflect-only demo)':'')+'. LEAH now owns authoring; continue the contract there.</span></div>'+
  '<div class="leahprov" style="margin-top:12px">'+esc(info.label)+'</div>'+
  (info.contractId?'<div class="dkv"><span>LEAH record</span><b>'+esc(info.contractId)+'</b></div>':'')+
  (linkHref?'<a class="btn btn-ghost btn-sm" style="margin-top:12px" href="'+linkHref+'" target="_blank" rel="noopener">Open in LEAH →</a>':'')+
  '<div class="anote">Reflect-only queue-submit, the '+esc(ct)+' request was registered / initiated in LEAH (the CLM system of record). Nothing was authored, approved, signed, or gate-advanced here.</div></div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');
 toast(info.demo?'Queued to LEAH, '+info.status+' · reflect-only; LEAH owns authoring; nothing authored/advanced':'Queue-submitted to LEAH, '+info.status+' · LEAH remains authoritative; gate not advanced');
}
function pushToLeahError(msg,ct,supplier){
 var esc=escapeHtmlPV;
 $('#drawer').innerHTML='<div class="dh"><div><h3>Push to LEAH</h3><div class="dsub">'+esc(ct)+' · '+esc(supplier)+'</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db">'+
  '<p class="narr"><b>Not pushed.</b> '+esc(msg)+'</p>'+
  '<div class="cvfgacts"><button class="btn btn-ghost btn-sm" onclick="closeDrawer()">Close</button></div>'+
  '<div class="anote">Reflect-only: nothing was authored, approved, or gate-advanced. LEAH remains the system of record.</div></div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');
 toast('Not pushed to LEAH.');
}
function contractHTML(){const C=pvData('deal.contract',CONTRACT);const col=scoreColor(C.score);const deg=Math.round(C.score/100*360);
 let h='<p class="dashintro"><b>Contract Review · '+PROJECTS[CURPROJ].supplier+'</b>, a Protection Score and the protection gaps behind it. Reflect-only; redlines are suggestions for Legal to accept in Word.</p>';
 h+=openDashBar('dashboard-contract.html','Open full Contract Review dashboard');
 h+=threadBar('contract');
 h+=`<div class="sect"><div class="secthd"><div class="t">Protection Score</div></div><div class="card"><div class="pscore"><div class="pgauge" style="background:conic-gradient(${col} ${deg}deg, var(--line) 0)"><div class="pin"><div class="pnum" style="color:${col}">${C.score}</div><div class="pof">/ 100</div></div></div><div class="pmeta"><div class="pml" style="color:${col}">Moderate protection</div><div class="pmd">Higher is better. ${C.summary}</div></div></div></div></div>`;
 h+=`<div class="sect"><div class="secthd"><div class="t">Protection gaps</div></div>${C.gaps.map(function(g){return `<div class="gap"><span class="gsev ${g.sev}">${g.sevt}</span><div class="gm"><div class="gn">${g.n}</div><div class="gd">${g.d}</div><div class="gfix"><b>Redline:</b> ${g.fix}</div>${GAP_THREAD[g.n]?`<div style="margin-top:7px"><span class="threadlink" onclick="tab('${GAP_THREAD[g.n].id}')">${GAP_THREAD[g.n].l}</span></div>`:''}</div></div>`;}).join('')}</div>`;
 h+=`<div class="sect"><div class="secthd"><div class="t">Top redlines</div><a href="javascript:void(0)" onclick="openRedlines()" style="display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:#2B579A;text-decoration:none"><svg viewBox="0 0 24 24" fill="none" stroke="#2B579A" stroke-width="2" style="width:13px;height:13px"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/></svg>Open in Word</a></div>
  <ol class="redlist">${C.gaps.map(function(g){return `<li><div class="rlh"><span class="rlsec">${g.sec||''}</span><span class="rln">${g.n}</span><span class="gsev ${g.sev}">${g.sevt}</span></div><div class="rld">${g.fix}</div></li>`;}).join('')}</ol>
  <div class="rlartifact"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="#2B579A" stroke-width="2"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/></svg><div class="rla"><b>MSA_Visier_redline_v3.docx</b><span>Tracked changes attributed to <b>Theo for Lilly</b> · shared via Word Online · accept, edit or reject each change in Word</span></div></div></div>`;
 h+=cvSectionHTML();
 return h+lifeBar('contract');
}
// ---- RFx scoring matrix (editable in-app grid) ----
// ---- RFx weighted scoring (per the rfp-engine skill) ----