function dgActorGid(){
 const T=window.THEO; if(!T) return null;
 const nm=($('#rname')?$('#rname').textContent.trim():'')||'Marc Lane';
 const p=T.byName(nm)||T.byName('Marc Lane');
 return p?p.gid:null;
}
function dgMeGid(){ const T=window.THEO; if(!T) return null; const p=T.byName(me); return p?p.gid:null; }
function dgFirst(gid){ const T=window.THEO; const n=T?T.displayName(gid):gid; return (n||'').split(' ')[0]||n; }
// the viewed person's projects, for the "Select projects" checklist
function dgProjects(){ return (TLPROJ[me]||[]).map(p=>({id:p.id,name:p.name})); }

// header button visibility + the compact "My delegations" status chips
function renderDelegation(){
 const T=window.THEO, wrap=$('#delegwrap'); if(!wrap) return;
 const actor=dgActorGid(), meGid=dgMeGid();
 const allowed=!!(T&&actor&&meGid&&T.canDelegate(actor,meGid));
 if(!allowed){ wrap.style.display='none'; dgClose(); return; }
 wrap.style.display='';
 // label reflects self vs. acting-for-a-rep (supervisor/admin)
 const self=actor===meGid;
 $('#delegbtnlbl').textContent = self ? 'Delegate my work' : 'Delegate '+dgFirst(meGid)+'’s work';
 renderDelegMini();
}
function delegRecords(){
 const T=window.THEO, meGid=dgMeGid(); const out=[];
 if(!T||!meGid) return out;
 const act=T.delegationFor(meGid);
 if(act) out.push({rec:act,status:'active'});
 (T.PENDING_DELEGATIONS||[]).filter(r=>r.gid===meGid).forEach(r=>out.push({rec:r,status:'pending'}));
 return out;
}
function delegWindowTxt(r){
 if(r.permanent) return 'permanent';
 if(r.fromISO&&r.toISO) return r.fromISO+' → '+r.toISO;
 return 'while out';
}
function renderDelegMini(){
 const T=window.THEO, host=$('#delegmini'), meGid=dgMeGid(); if(!host) return;
 const recs=delegRecords();
 if(!recs.length){ host.innerHTML='<span class="dnone">No delegations set.</span>'; return; }
 host.innerHTML=recs.map(({rec,status})=>{
  const to=dgFirst(rec.delegateGid);
  if(status==='active') return `<span class="dchip act">Active → ${to} · ${delegWindowTxt(rec)}</span>`;
  const sup=T.supervisorOf(meGid);
  const wait=sup?(dgFirst(sup.gid)+' or '+to):to;
  return `<span class="dchip pend">Pending → ${to} · awaiting ${wait}<button class="dx" type="button" title="Cancel this request" onclick="dgCancelPending('${rec.id}')">✕</button></span>`;
 }).join('');
}
function renderDelegList(){
 const T=window.THEO, host=$('#dgminelist'), meGid=dgMeGid(); if(!host) return;
 const recs=delegRecords();
 if(!recs.length){ host.innerHTML='<div class="dgempty">Nothing delegated right now.</div>'; return; }
 host.innerHTML=recs.map(({rec,status})=>{
  const to=T.displayName(rec.delegateGid);
  const scope=(rec.scope==='all'||!Array.isArray(rec.scope))?'All open work':rec.scope.length+' project'+(rec.scope.length>1?'s':'');
  if(status==='active'){
   return `<div class="dgrow"><span class="pip act">Active</span><span class="dgtxt">→ ${to}<small>${scope} · ${delegWindowTxt(rec)}</small></span></div>`;
  }
  const sup=T.supervisorOf(meGid);
  const wait=sup?(T.displayName(sup.gid)+' or '+to):to;
  return `<div class="dgrow"><span class="pip pend">Pending</span><span class="dgtxt">→ ${to}<small>${scope} · ${delegWindowTxt(rec)} · awaiting ${wait}</small></span><button class="dgcancel" type="button" onclick="dgCancelPending('${rec.id}')">Cancel</button></div>`;
 }).join('');
}
function dgCancelPending(id){
 const T=window.THEO, meGid=dgMeGid(); if(!T) return;
 // The owner is not an approver, so rejectDelegation won't act for them; the API
 // explicitly allows just removing the pending proposal. Only the owner's own
 // pending records are cancellable here.
 const arr=T.PENDING_DELEGATIONS||[];
 const i=arr.findIndex(r=>r.id===id && r.gid===meGid);
 if(i<0){ toast('That request is no longer pending.'); renderDelegMini(); renderDelegList(); return; }
 arr.splice(i,1);
 renderDelegMini(); renderDelegList();
 toast('Delegation request withdrawn. Nothing was routed.');
}

// ── modal open / close + field wiring ──
function dgFillDelegateSelect(){
 const T=window.THEO, sel=$('#dgdelegate'), meGid=dgMeGid(); if(!sel) return;
 sel.innerHTML=(T?T.PEOPLE:[]).filter(p=>p.gid!==meGid)
   .map(p=>`<option value="${p.gid}">${p.name}</option>`).join('');
}
function dgFillProjects(){
 const wrap=$('#dgprojwrap'); if(!wrap) return;
 const projs=dgProjects();
 wrap.innerHTML=projs.length?projs.map(p=>`
   <label><input type="checkbox" class="dgpcheck" value="${p.id}"><span>${p.name}</span><span class="pid">${p.id}</span></label>`).join('')
   :'<div class="dgempty" style="padding:8px 9px">No open projects to pick. “All my open work” will be used.</div>';
}
function dgScopeChange(){
 const v=document.querySelector('input[name="dgscope"]:checked').value;
 document.querySelectorAll('#dgscope label').forEach(l=>l.classList.toggle('sel',l.querySelector('input').checked));
 $('#dgprojwrap').classList.toggle('dghidden', v!=='select');
}
function dgDurChange(){
 const v=document.querySelector('input[name="dgdur"]:checked').value;
 document.querySelectorAll('#dgdur label').forEach(l=>l.classList.toggle('sel',l.querySelector('input').checked));
 $('#dgdates').classList.toggle('dghidden', v!=='window');
}
function dgOpen(){
 const T=window.THEO, actor=dgActorGid(), meGid=dgMeGid();
 if(!(T&&actor&&meGid&&T.canDelegate(actor,meGid))){ toast('You can only delegate your own work.'); return; }
 // (re)build dynamic fields for the currently viewed person
 dgFillDelegateSelect(); dgFillProjects(); renderDelegList();
 const self=actor===meGid;
 $('#dgtitle').textContent = self?'Delegate my work':'Delegate '+T.displayName(meGid)+'’s work';
 $('#dgsub').textContent = self
   ? 'Hand your open work to a colleague while you’re out or for good.'
   : 'As '+(T.isAdmin(actor)?'an admin':'their manager')+', set up coverage for '+T.displayName(meGid)+'.';
 // reset scope/duration to defaults
 document.querySelector('input[name="dgscope"][value="all"]').checked=true; dgScopeChange();
 document.querySelector('input[name="dgdur"][value="window"]').checked=true; dgDurChange();
 // seed sensible default dates (today → +14d)
 const iso=dt=>dt.toISOString().slice(0,10);
 const from=new Date(TODAY), to=new Date(TODAY.getTime()+14*DAY);
 $('#dgfrom').value=iso(from); $('#dgto').value=iso(to);
 document.querySelectorAll('.dgpcheck').forEach(c=>c.checked=false);
 $('#dgnote').value='';
 $('#dgscrim').classList.add('on');
 const m=$('#dgmodal'); m.classList.add('on'); m.setAttribute('aria-hidden','false');
 const d=$('#dgdelegate'); if(d) setTimeout(()=>d.focus(),20);
}
function dgClose(){
 const s=$('#dgscrim'), m=$('#dgmodal');
 if(s) s.classList.remove('on');
 if(m){ m.classList.remove('on'); m.setAttribute('aria-hidden','true'); }
}
function dgSubmit(){
 const T=window.THEO, actor=dgActorGid(), meGid=dgMeGid();
 if(!(T&&actor&&meGid&&T.canDelegate(actor,meGid))){ toast('You can only delegate your own work.'); return; }
 const delegateGid=$('#dgdelegate').value;
 if(!delegateGid){ toast('Pick someone to delegate to.'); return; }
 const scopeKind=document.querySelector('input[name="dgscope"]:checked').value;
 let scope='all';
 if(scopeKind==='select'){
  const ids=[...document.querySelectorAll('.dgpcheck:checked')].map(c=>c.value);
  scope=ids.length?ids:'all';
 }
 const durKind=document.querySelector('input[name="dgdur"]:checked').value;
 const permanent=durKind==='perm';
 let fromISO=null,toISO=null;
 if(!permanent){
  fromISO=$('#dgfrom').value||null; toISO=$('#dgto').value||null;
  if(fromISO&&toISO&&fromISO>toISO){ toast('The “to” date is before the “from” date.'); return; }
 }
 const note=$('#dgnote').value.trim();
 T.createDelegation({gid:meGid, delegateGid, scope, fromISO, toISO, permanent, note, source:'self'});
 dgClose();
 renderDelegMini(); renderDelegList();
 const sup=T.supervisorOf(meGid), supF=sup?dgFirst(sup.gid):'your manager';
 const delF=dgFirst(delegateGid);
 toast('Delegation proposed - '+supF+' (your manager) or '+delF+' needs to approve it before it takes effect.');
}
window.addEventListener('keydown',e=>{ if(e.key==='Escape'){ const m=$('#dgmodal'); if(m&&m.classList.contains('on')) dgClose(); }});

// ════════════════════════════════════════════════════════════════
//  SP.2 · SPEND BENEATH ME, reporting-line-aware spend rollup (reflect-only)
//  + CAT.3 · SPEND UNDER CONTRACT, spend-weighted coverage KPI (reflect-only)
//  Additive surfaces. Hierarchy = THEO.PEOPLE supervisor links (Workday mirror,
//  assets/people.js); spend = the same per-rep managed books the rest of this
//  page renders. Anti-fabrication: no org data or no spend data means the
//  surface hides or says "not available" - nothing is estimated or invented.
// ════════════════════════════════════════════════════════════════
const escS=s=>(window.LillyAPI&&LillyAPI.esc)?LillyAPI.esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const orgOpen={};        // gid -> expanded (drill into a direct report)
let ORG_LIVE=null;       // gid -> spendK when the live workload feed carries explicit spend fields
// The rollup viewer: the leadership persona when they manage people per the
// reporting line; falls back to the viewed rep's supervisor. Null = hide.
function orgViewerGid(){
 const T=window.THEO; if(!T||typeof curRole==='undefined'||curRole!=='lead') return null;
 const nm=($('#rname')?$('#rname').textContent.trim():'');
 const p=nm?T.byName(nm):null;
 if(p&&(T.repsManagedBy(p.gid)||[]).length) return p.gid;
 const mine=T.byName(me), sup=mine?T.supervisorOf(mine.gid):null;
 if(sup&&(T.repsManagedBy(sup.gid)||[]).length) return sup.gid;
 return null;
}
// One direct report's spend book: DEMO first (golden thread), page seeds second.
// spendK:null = no data for that person (rendered as "no spend data", never 0).
function orgBookFor(gid){
 const T=window.THEO, D=window.Theo&&Theo.data, nm=T.displayName(gid);
 let sups=null;
 if(D&&D.suppliersByRep){
  sups=(D.suppliersByRep(gid)||[]).filter(s=>s.status!=='sourcing'&&s.spendK>0)
    .map(s=>({name:s.name,spendK:s.spendK,cat:s.category||''}));
 } else if(SUP_BY_REP[nm]&&SUP_BY_REP[nm].suppliers){
  sups=SUP_BY_REP[nm].suppliers.filter(s=>s.spend>0).map(s=>({name:s.name,spendK:s.spend,cat:s.cat||''}));
 }
 if(!sups||!sups.length) return {gid:gid,name:nm,spendK:null,suppliers:[]};
 sups.sort((a,b)=>b.spendK-a.spendK);
 return {gid:gid,name:nm,spendK:sups.reduce((t,s)=>t+s.spendK,0),suppliers:sups};
}
function renderOrgRollup(){
 const wrap=$('#orgroll-wrap'), card=$('#orgrollcard'); if(!wrap||!card) return;
 const T=window.THEO, lead=orgViewerGid();
 const directs=lead?(T.repsManagedBy(lead)||[]):[];
 if(!lead||!directs.length){ wrap.style.display='none'; card.innerHTML=''; return; }   // hide-until-data: no reporting line, no surface
 const rows=directs.map(p=>{
  const b=orgBookFor(p.gid);
  if(ORG_LIVE&&typeof ORG_LIVE[p.gid]==='number'){ b.spendK=ORG_LIVE[p.gid]; b.suppliers=[]; b.live=true; }
  return b;
 }).sort((a,b)=>(b.spendK||0)-(a.spendK||0));
 const known=rows.filter(r=>r.spendK!=null);
 wrap.style.display='';
 if(window.LillyAPI&&LillyAPI.badge) LillyAPI.badge('orgrollbadge', ORG_LIVE?'live':'demo');
 if(!known.length){
  card.innerHTML='<div class="empty">Spend data is not available for your reporting line yet. Nothing is estimated on your behalf.</div>';
  return;
 }
 const total=known.reduce((t,r)=>t+r.spendK,0);
 const maxSp=Math.max(...known.map(r=>r.spendK),1);
 const body=rows.map(r=>{
  const open=!!orgOpen[r.gid];
  const kids=(T.repsManagedBy(r.gid)||[]);
  const share=r.spendK!=null?Math.round(r.spendK/total*100):null;
  const head='<div class="orgrow'+(open?' open':'')+'" data-gid="'+escS(r.gid)+'" role="button" tabindex="0" aria-expanded="'+(open?'true':'false')+'">'+
   '<span class="onm">'+escS(r.name)+'<small>'+escS(r.gid)+(kids.length?' · manages '+kids.length:'')+'</small></span>'+
   '<span class="obar"><i style="width:'+(r.spendK!=null?Math.max(3,Math.round(r.spendK/maxSp*100)):0)+'%"></i></span>'+
   (r.spendK!=null?'<span class="osp">'+fmtK(r.spendK)+'<span class="opct"> '+share+'%</span></span>':'<span class="osp na">no spend data</span>')+
   '<svg class="ochev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div>';
  if(!open) return head;
  let sub;
  if(r.live){
   sub='<div class="orgsubrow"><span style="color:var(--mut2)">The live feed provides totals only; a per-supplier split is not available.</span><span></span></div>';
  } else if(r.suppliers.length){
   const top=r.suppliers.slice(0,8), rest=r.suppliers.length-top.length;
   // one level lower: any reports of the direct report first, then their supplier split
   sub=kids.map(k=>{const kb=orgBookFor(k.gid);
     return '<div class="orgsubrow"><span>'+escS(kb.name)+' <small style="color:var(--mut2)">reports to '+escS(r.name.split(' ')[0])+'</small></span><span class="ssp">'+(kb.spendK!=null?fmtK(kb.spendK):'no spend data')+'</span></div>';}).join('')+
    top.map(s=>'<div class="orgsubrow"><span>'+escS(s.name)+(s.cat?' <small style="color:var(--mut2)">'+escS(s.cat)+'</small>':'')+'</span><span class="ssp">'+fmtK(s.spendK)+'</span></div>').join('')+
    (rest>0?'<div class="orgsubrow"><span style="color:var(--mut2)">+ '+rest+' more supplier'+(rest>1?'s':'')+'</span><span></span></div>':'');
  } else {
   sub='<div class="orgsubrow"><span style="color:var(--mut2)">No supplier-level spend recorded for '+escS(r.name.split(' ')[0])+'.</span><span></span></div>';
  }
  return head+'<div class="orgsub">'+sub+'</div>';
 }).join('');
 const gap=directs.length-known.length;
 card.innerHTML='<div class="orgtotal"><div class="big">'+fmtK(total)+'</div><div class="cap">active committed spend in the managed books of your '+directs.length+' direct report'+(directs.length===1?'':'s')+(gap>0?' ('+gap+' without spend data)':'')+', per the reporting line beneath '+escS(T.displayName(lead))+'</div></div>'+
  '<div class="orgrows">'+body+'</div>'+
  '<div class="savnote"><span class="sp">✦</span><span>Reflect-only. The reporting line mirrors the people registry; spend comes from each rep’s managed book, the same numbers as the rest of this page. Click a direct report to split their number by supplier. Nothing here reassigns work or budgets.</span>'+provline('Workday · people registry')+'</div>';
 card.querySelectorAll('.orgrow[data-gid]').forEach(el=>{
  const g=el.getAttribute('data-gid');
  el.addEventListener('click',()=>{orgOpen[g]=!orgOpen[g];renderOrgRollup();});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();orgOpen[g]=!orgOpen[g];renderOrgRollup();}});
 });
}
// CAT.3 · spend under contract: share of the viewed rep's active spend whose
// supplier holds at least one contract that is active or renewing today.
// Needs the seed contract registry to be honest; hides when it can't compute.
function renderContractKpi(){
 const card=$('#cuccard'); if(!card) return;
 const D=window.Theo&&Theo.data, gid=REP_GID[me], bodyEl=$('#cucbody');
 const hide=()=>{card.style.display='none'; if(bodyEl) bodyEl.innerHTML='';};
 if(!(D&&D.suppliersByRep&&D.contractsForSupplier&&gid&&bodyEl)){ hide(); return; }
 const sups=(D.suppliersByRep(gid)||[]).filter(s=>s.status!=='sourcing'&&s.spendK>0);
 if(!sups.length){ hide(); return; }
 const isActive=c=>((c.status==='active'||c.status==='renewing')&&(!c.end||d(c.end).getTime()>=TODAY.getTime()));
 let on=0,off=0; const offRows=[];
 sups.forEach(s=>{
  if((D.contractsForSupplier(s.id)||[]).some(isActive)) on+=s.spendK;
  else { off+=s.spendK; offRows.push(s); }
 });
 const tot=on+off; if(!tot){ hide(); return; }
 const pct=Math.round(on/tot*100);
 card.style.display='';
 $('#cucmeta').textContent=sups.length+' active suppliers · spend-weighted';
 bodyEl.innerHTML='<div class="cuchero"><span class="big">'+pct+'%</span><span class="cap">of your '+fmtK(tot)+' active spend is under an active contract</span></div>'+
  '<div class="cucbar"><i class="on" style="width:'+pct+'%"></i><i class="off" style="width:'+(100-pct)+'%"></i></div>'+
  '<div class="cuckey">'+
   '<div class="krow"><i style="background:var(--bblue)"></i>Under an active contract<span class="amt">'+fmtK(on)+'</span></div>'+
   '<div class="krow"><i style="background:var(--amber-d)"></i>Off-contract or expired<span class="amt">'+fmtK(off)+'</span></div>'+
  '</div>'+
  (offRows.length?'<div class="cucoff">'+offRows.sort((a,b)=>b.spendK-a.spendK).map(s=>'<span class="bk">'+escS(s.name)+' · '+fmtK(s.spendK)+'</span>').join('')+'</div>':'')+
  '<div class="rcil sub" style="margin-top:10px">A supplier counts as covered when at least one of its contracts is active or renewing today. This is the spend-weighted view; your report-card Contract coverage grade counts suppliers. Reflect-only.'+provline('Contract registry (CLM)')+'</div>';
}

applyDemoBooks();   // derive supplier + savings books from the consolidated seed (golden thread)
renderAll();
window.addEventListener('resize',()=>{const tip=document.getElementById('tltip');if(tip)tip.classList.remove('on');});

/* Live platform signal for the workload section. The per-rep YTD cards, report
   card, scale band and savings books above are an illustrative analytics layer
   the platform does not yet compute, so they stay on the demo dataset. What IS
   live is the actual in-flight project + open work-item count from the kernel:
   we surface those (honestly badged) without overwriting the analytics. */
(async function(){
 if(!window.LillyAPI) return;
 const pr=await LillyAPI.tryLive(LillyAPI.listProjects,null);
 const tk=await LillyAPI.tryLive(LillyAPI.tasks,null);
 const live=pr.source==='live'||tk.source==='live';
 if(LillyAPI.badge) LillyAPI.badge('livebadge', live?'live':'demo');
 if(!live) return;
 const projs=Array.isArray(pr.data)?pr.data:[];
 const inflight=projs.filter(p=>['intake','triage','in-flight','blocked'].indexOf(p.status)>=0).length;
 const nt=Array.isArray(tk.data)?tk.data.length:0;
 const strip=document.getElementById('liveworkstrip');
 if(strip){
  strip.style.display='';
  strip.textContent='Live from the platform: '+inflight+' active of '+projs.length+' project'+(projs.length===1?'':'s')+', '+nt+' open work item'+(nt===1?'':'s')+' in your tenant right now.';
 }
})();

/* SP.2 live attempt: the admin workload feed is the only live read that could
   carry per-person spend. We accept ONLY explicit gid + spend fields from it;
   anything else keeps the honestly-badged demo books (no schema guessing, no
   invented numbers). savingsSummary tracks savings (not spend) and
   spendAnalysis reflects records the caller posts, so neither is a spend
   source for this rollup. */
(async function(){
 if(!window.LillyAPI||!LillyAPI.tryLive) return;
 const r=await LillyAPI.tryLive(LillyAPI.workload,null);
 if(r.source!=='live'||!r.data) return;
 const rows=Array.isArray(r.data)?r.data:(Array.isArray(r.data.rows)?r.data.rows:(Array.isArray(r.data.reps)?r.data.reps:null));
 if(!rows) return;
 const map={};
 rows.forEach(w=>{
  if(!w||typeof w!=='object') return;
  const g=w.gid||w.repGid||w.repId;
  const v=[w.managedSpendK,w.activeSpendK,w.committedSpendK,w.spendK].find(x=>typeof x==='number'&&isFinite(x));
  if(typeof g==='string'&&v!=null) map[g]=v;
 });
 if(Object.keys(map).length){ ORG_LIVE=map; renderOrgRollup(); }
})();