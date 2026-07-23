var _PV07=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVLA=(_PV07&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV07)&&_PV07.landscapeAug)?_PV07.landscapeAug:{};
function landscapeMiniHTML(){
 var LAND=(PROJECTS[CURPROJ].landscape||[]).slice().sort(function(a,b){return b.fit-a.fit;}).slice(0,3);
 if(!LAND.length) return '<div class="spnote">No supplier landscape yet, it runs automatically during intake, or on request in the chat, to scan the market for fit-scored candidates.</div>';
 return '<div class="card" style="padding:2px 0">'+LAND.map(function(s,i){return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 14px'+(i>0?';border-top:1px solid var(--line2,#E0DCD5)':'')+'"><div><div style="font-weight:600;font-size:13px">'+s.n+'</div><div style="font-size:11.5px;color:var(--mut2)">'+s.sub+'</div></div><span class="fit '+s.fitc+'">fit '+s.fit+'</span></div>';}).join('')+'</div><div class="spnote">Top candidates by fit from the on-demand market scan. Open the full Supplier Landscape Search for the complete set, references and risk signals.</div>';
}
/* ===== SL.2 supplier-landscape LIVE read (ADDITIVE, reflect-only) =====
   Enhances the EXISTING Overview "Supplier landscape" section (the #ovLandLive
   host just below the demo mini list) with the live SL.1 reflection from
   POST /api/supplier-landscape via LillyAPI.tryLive. Offline / error keeps the
   demo mini list untouched (the host simply stays empty). SKIPPED for a
   renewal / existing-incumbent project: a market landscape only helps genuinely
   new sourcing, so nothing renders there. The input is built ONLY from this
   project's already-present candidate set (no invented vendors); a reflection
   field that is missing is omitted or reads "Data not available", never made
   up. Advisory only: no vendor is selected, contacted, or awarded. Every
   dynamic value is escaped (escD); positive accent Bold Blue #5C2B50. */
function ovLandSkip(){var P=PROJECTS[CURPROJ]||{};var ty=(P.type||'');
 // Skip the market landscape for an incumbent / existing active supplier, or a
 // renewal / amendment / expansion of existing paper, a market map adds nothing
 // when we already hold the supplier. Robust to several signals, not one string.
 if(/renew|incumbent|amend|existing|expansion|extend|add[- ]?on|true[- ]?up/i.test(ty))return true;
 if(P.supState&&/existing|incumbent|active/i.test(P.supState))return true;
 if(P.incumbent===true)return true;
 return false;
}
function ovLandInput(){
 var P=PROJECTS[CURPROJ]||{};var cands=P.landscape||[];
 if(!cands.length)return null;   // no candidate set on the project -> nothing to reflect
 // When the project carries the DEEPENED model (per-requirement fit + risk dims + flags),
 // build the full engine input so the Overview live read no longer collapses to a single
 // synthetic "overall" requirement with empty risk. Thin projects keep the degraded input.
 if(typeof pvIsDeep==='function'&&pvIsDeep(P)){var di=pvLandInput(P);if(di)return di;}
 return {
  category:P.title||'IT sourcing',
  requirements:[{id:'overall',label:'Overall fit',weight:1}],
  riskDimensions:[],
  suppliers:cands.map(function(s,i){return {id:'s'+i,name:s.n||('Candidate '+(i+1)),fit:{overall:Math.max(0,Math.min(5,Math.round(((s.fit||0)/20)*10)/10))},risk:{},incumbent:/incumbent/i.test((s.sub||'')+' '+(s.n||''))||undefined};}),
  topN:3
 };
}
function ovLandCardHTML(refl){
 var L=(refl&&(refl.landscape||refl))||{};
 var parts=[];
 var top=Array.isArray(L.topN)?L.topN:Array.isArray(L.ranking)?L.ranking:Array.isArray(L.suppliers)?L.suppliers:null;
 if(top&&top.length){
  parts.push(top.slice(0,3).map(function(s){
   var nm=escD(s.name||s.supplier||s.id||'Candidate');
   var wf=(typeof s.weightedFit==='number')?s.weightedFit:(typeof s.fitScore==='number')?s.fitScore:(typeof s.score==='number')?s.score:null;
   var dq=s.disqualified?' · <span style="color:#C8202E;font-weight:700">disqualified (hard flag)</span>':'';
   return '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;border-top:1px solid var(--line,#EEE)"><span style="font-weight:600;font-size:12.5px">'+nm+dq+'</span><span style="font:700 11px var(--mono,monospace);color:var(--navy)">'+(wf!=null?('fit '+escD(Math.round(wf*10)/10)+' / 5'):'Data not available')+'</span></div>';
  }).join(''));
 }
 var rec=L.recommendation;if(rec&&typeof rec==='object')rec=rec.summary||rec.text||rec.label||'';
 if(typeof rec==='string'&&rec)parts.push('<div style="font-size:12px;color:var(--mut,#4A4540);line-height:1.5;margin-top:7px"><b style="color:var(--navy)">Advisory read.</b> '+escD(rec)+'</div>');
 if(!parts.length)return '';   // nothing usable returned -> stay quiet (never invented)
 return '<div style="border:1px solid #C6D7EF;border-left:3px solid #5C2B50;border-radius:10px;padding:9px 12px;margin:9px 0 0">'+
  '<div style="font:600 10.5px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--navy);margin-bottom:2px">Supplier landscape · live read</div>'+parts.join('')+
  '<div style="font-size:10.5px;color:var(--mut2,#8A827C);font-style:italic;margin-top:6px">From the platform landscape engine over this project\'s own candidate set. Advisory only: no vendor is selected or contacted.</div></div>';
}
async function ovLandscapeLoad(){
 if(curtab!=='overview'||!window.LillyAPI)return;
 var host=document.getElementById('ovLandLive');if(!host)return;
 if(ovLandSkip()){host.innerHTML='';return;}   // renewal / existing incumbent -> a market landscape does not apply
 var input=ovLandInput();if(!input){host.innerHTML='';return;}
 var r=await LillyAPI.tryLive(function(){return LillyAPI.supplierLandscape(input);},null);
 if(r.source!=='live'||!r.data)return;         // offline / error -> the demo mini list stays as-is
 var h2=document.getElementById('ovLandLive');
 if(h2&&curtab==='overview')h2.innerHTML=ovLandCardHTML(r.data);
}
// ---- live-steps TIMELINE (replaces the stacked SLA bars) ----------------------
// One LANE per live step, x-axis in DAYS shared across lanes so it reads as
// time-vs-deadline. Each lane shows the elapsed track + a today marker (at the
// step's elapsed day) and a clear SLA-deadline marker (at the step's SLA day).
// Colour by state: on track = Bold Blue, in danger = amber, overdue = red.
function slaStateCls(st){return st==='over'?'lslaover':st==='warn'?'lslawarn':'lslaok';}
function slaTimelineHTML(){
 const rows=pvData('liveSla',LIVESLA);
 // axis spans 0..maxDays (max of any SLA or elapsed) + 1 day of headroom.
 const maxDays=Math.max.apply(null,rows.map(s=>Math.max(s.sla,s.el,s.proj||0)))+1;
 const pct=d=>Math.max(0,Math.min(100,d/maxDays*100));
 // day ticks: every 2 days keeps the axis readable; always include the last.
 const step=maxDays>16?4:2;
 let ticks='';
 // axis ticks are real calendar dates (M/D), not relative days; the "today" marker anchors 0.
 for(let d=step;d<=maxDays;d+=step){ticks+=`<div class="lslatick" style="left:${pct(d)}%">${slaDate(d)}</div>`;}
 const axis=`<div class="lslaxis"><div class="lslaxlbl">Step</div><div class="lslaticks">${ticks}<div class="lslatick now" style="left:0%">today</div></div></div>`;
 // gridlines reused per lane (cheap; aligns to the day ticks)
 let gl='';for(let d=0;d<=maxDays;d+=step){gl+=`<div class="lslagl" style="left:${pct(d)}%"></div>`;}
 const lanes=rows.map(s=>{
  const cls=slaStateCls(s.st);
  const todayPct=pct(s.el), deadPct=pct(s.sla), projPct=pct(s.proj!=null?s.proj:s.el);
  const endPct=Math.max(todayPct,projPct,deadPct);
  const leftTxt=s.el>s.sla?('was due '+slaDate(s.sla-s.el)):('due '+slaDate(s.sla-s.el));
  // keep the status pill from overrunning the right edge
  const pillRight=endPct>74;
  const pillStyle=pillRight?`right:2%`:`left:${Math.min(94,endPct+2)}%`;
  // light-grey PROJECTED line from today out to the projected completion (the forecast);
  // when the projection runs past the SLA flag, the step reads as slipping even pre-deadline
  const projW=Math.max(0,projPct-todayPct);
  const projLine=projW>0.6?`<div class="lslaproj" style="left:${todayPct}%;width:${projW}%"></div><div class="lslapnode" style="left:${projPct}%" title="projected ${slaDate((s.proj!=null?s.proj:s.el)-s.el)}"></div>`:'';
  // who's-waiting hover: one line per person + the action they owe (supports several)
  const waitTxt=(s.wait||[]).map(w=>'• '+w.who+': '+w.act).join('\n');
  const ttl=`${s.stt} · SLA ${slaDate(s.sla-s.el)} · projected ${slaDate((s.proj!=null?s.proj:s.el)-s.el)}`+(waitTxt?('\nWaiting on:\n'+waitTxt):'');
  return `<div class="lslalane ${cls}" onclick="openNode('${s.node}')" title="${ttl.replace(/"/g,'&quot;')}">
    <div class="lslalbl"><span class="lslan">${s.n}</span><span class="lslasys">${s.sys} · ${s.note}</span></div>
    <div class="lslatrack">${gl}
      ${projLine}
      <div class="lslaspine" style="left:0%;width:${todayPct}%"></div>
      <div class="lsladead" style="left:${deadPct}%"><span class="lsdstem"></span><span class="lsdflag"></span><span class="lsdlab">SLA</span></div>
      <div class="lslanow" style="left:${todayPct}%"></div>
      <div class="lslanode" style="left:${todayPct}%"></div>
      <span class="lslapill" style="${pillStyle}">${s.stt} · ${leftTxt}</span>
    </div>
  </div>`;
 }).join('');
 return `<div class="lsla" style="--days:${maxDays}"><div class="lslascroll"><div class="lslachart">${axis}${lanes}</div></div>
   <div class="lslalegend"><span><i class="dl"></i>SLA deadline</span><span><i class="td"></i>today</span><span><i class="pj"></i>projected</span><span><i style="background:var(--bblue)"></i>on track</span><span><i style="background:var(--amber-d)"></i>in danger</span><span><i style="background:var(--red)"></i>overdue</span></div></div>`;
}
// A material is CONTEXTUAL when one of the live steps it relates to is active now.
function matIsContextual(m){const active=activeStepNodes();return !!(PROJECTS[CURPROJ].mats[m.tab]&&(m.steps||[]).some(n=>active.indexOf(n)>=0));}
function matRow(m){const present=!!PROJECTS[CURPROJ].mats[m.tab];
 // RFx is genuinely N/A when this project runs no competitive event (type/mats-driven, not a hardcoded id)
 const naRfx=m.tab==='rfx'&&!PROJECTS[CURPROJ].mats.rfx;
 let chip,act;
 if(present){chip='<span class="matchip draft">Draft</span>';act=`<span class="matopen" style="cursor:pointer;opacity:1" onclick="tab('${m.tab}')" title="Open this dashboard tab">Open tab →</span>`;}
 else if(naRfx){chip='<span class="matchip na">N/A</span>';act='<span class="matopen" title="Sole source, no competitive event">N/A · sole source</span>';}
 else{chip='<span class="matchip na">Not yet</span>';act=`<button class="matrun" onclick="surfaceDash('${m.tab}')" title="Run the skill to produce this dashboard">Run skill → produce it</button>`;}
 const ctx=matIsContextual(m);
 const glyph=MATICON[m.icon]||MATICON.contract;
 const nowTag=ctx?'<span class="matnow" title="Relevant to a live step right now">Relevant now</span>':'';
 return `<div class="matrow${ctx?' ctx':''}"><div class="mati"><svg viewBox="0 0 24 24">${glyph}</svg></div><div class="matm"><div class="matn">${m.n}${nowTag}</div><div class="matd">${m.d}</div></div>${chip}${act}</div>`;}
// Order materials so the contextually-relevant ones (mapped to an active live
// step) come first, then the rest in their declared order, quick access to
// what the current steps need, updating as the steps change.
function materialsOrdered(){return MATERIALS.slice().sort((a,b)=>(matIsContextual(b)?1:0)-(matIsContextual(a)?1:0));}
// ---- material lifecycle bar (draft/final chip + Edit menu + Final note) ----
function lifeBar(id){const m=MATSTATE[id];const chip=m.final?'<span class="matchip final">Final</span>':'<span class="matchip draft">Draft</span>';
 return `<div class="lifebar">${chip}
   <div class="editwrap"><button class="btn btn-ghost btn-sm" onclick="toggleEdit('${id}',event)">Edit ▾</button>
     <div class="editmenu" id="edit-${id}">
       ${m.grid?`<div class="eh">Edit in-app</div><div class="ei" onclick="closeEdit();toast('Editing the grid in-app, type into any score cell.')"><div class="eic app">⌨</div><div><div class="et">Edit in-app</div><div class="ed">Structured grid, edit scores and weights right here.</div></div></div>`:''}
       <div class="eh">Open in Microsoft 365</div>
       <div class="ei" onclick="closeEdit();toast('Opening ${m.appdoc} in ${m.app} via SharePoint, co-authoring. Permissions inherited from the project library.')"><div class="eic">${m.app.slice(0,1)}</div><div><div class="et">Open in ${m.app}</div><div class="ed">Co-author the document in ${m.app} (SharePoint). Permissions inherited from the project library, collaborators need access.</div></div></div>
       <div class="enote">Documents open in Microsoft 365 for co-authoring. Changes save back to SharePoint.</div>
     </div></div>
   <button class="btn btn-ghost btn-sm" onclick="markFinal('${id}')">${m.final?'Marked Final ✓':'Mark Final'}</button>
   <span class="finalnote" style="margin:0">Marking <b>Final</b> lands a copy in the <b>Documents</b> tab.</span>
 </div>`;}
function toggleEdit(id,e){e.stopPropagation();closeEdit(id);const m=document.getElementById('edit-'+id);if(m)m.classList.toggle('on');}
function closeEdit(except){document.querySelectorAll('.editmenu.on').forEach(function(m){if(!except||m.id!=='edit-'+except)m.classList.remove('on');});}
function markFinal(id){MATSTATE[id].final=true;toast('“'+MATSTATE[id].out+'” marked Final, a copy lands in the Documents tab.');renderTab();}
document.addEventListener('click',function(){closeEdit();});
// ---- Open-full-dashboard link: the in-tab content is the compact overview;
// this opens the dedicated full multi-tab dashboard page (RV17). ----
function openDashBar(href,label){return '<a class="opendash" href="'+href+'" style="display:inline-flex;align-items:center;gap:6px;margin:0 0 14px;font-size:13px;font-weight:600;color:#C8202E;text-decoration:none">'+label+'<span style="font-size:15px;line-height:1">→</span></a>';}
// ---- Landscape ----
function fitClass(c){return c;}
/* ===========================================================================
   NATIVE SUPPLIER-LANDSCAPE surface for the project Landscape tab (items C/D).
   PVSLE is a namespaced browser port of the pure `supplier-landscape` engine
   (same code path as supplier-landscape.html's SLE): weighted fit -> risk
   roll-up -> composite -> HARD-flag disqual -> rank -> segments -> heatmap ->
   market structure -> dynamics -> data basis -> recommendation. The seven SL
   render functions are ported as pv* and fed from the project's DEEPENED
   landscape[] model; a per-vendor Deep Dive drill and a Shortlist->project
   action sit on top. Reflect-only; positive accent Bold Blue #5C2B50 (never
   green); every dynamic value is escaped with escD. For a project WITHOUT the
   deepened model, landscapeHTML falls back to the original conclusions cards.
   =========================================================================== */
const PVSLE=(function(){
  const SCORE_MAX=5,DEFAULT_FIT_HIGH=60,DEFAULT_RISK_HIGH=2.5,CLEAR_LEADER_GAP=10,CLOSE_CONTENDER_BAND=5;
  function r(n,dp){dp=dp==null?2:dp;const f=Math.pow(10,dp);return Math.round(n*f)/f;}
  function clampScore(n){if(!isFinite(n))return 0;if(n<0)return 0;if(n>SCORE_MAX)return SCORE_MAX;return n;}
  function normalizeWeights(weights){
    const safe=weights.map(w=>(isFinite(w)&&w>0?w:0));const total=safe.reduce((s,w)=>s+w,0);
    if(total<=0){const eq=weights.length>0?1/weights.length:0;return weights.map(()=>eq);}
    return safe.map(w=>w/total);
  }
  function computeCoverage(s,requirements,nw){
    const coverage=[];let ws=0;
    for(let i=0;i<requirements.length;i++){const req=requirements[i],w=nw[i]||0;
      const score=clampScore(s.fit&&s.fit[req.id]!=null?s.fit[req.id]:0);ws+=w*score;
      coverage.push({requirementId:req.id,label:req.label,score:r(score),weight:r(w,4)});}
    return {coverage,fitScore:r((ws/SCORE_MAX)*100)};
  }
  function computeRisk(s,dims,nw){let ws=0;for(let i=0;i<dims.length;i++){const d=dims[i],w=nw[i]||0;ws+=w*clampScore(s.risk&&s.risk[d.id]!=null?s.risk[d.id]:0);}return r(ws);}
  function composite(fit,risk){return r(fit*Math.max(0,1-risk/SCORE_MAX));}
  function partitionFlags(flags){const dq=[],soft=[];for(const f of (flags||[])){if(f.severity==='HARD')dq.push(f);else soft.push(f);}return {disqualifiers:dq,softFlags:soft};}
  function classifySegment(eligible,fit,risk,fitHigh,riskHigh){
    if(!eligible)return 'disqualified';const strong=fit>=fitHigh,elev=risk>=riskHigh;
    if(strong&&!elev)return 'leader';if(strong&&elev)return 'challenger';if(!strong&&!elev)return 'niche';return 'caution';
  }
  function buildHeatmap(input,assessments){
    const requirementIds=input.requirements.map(x=>x.id),supplierIds=input.suppliers.map(x=>x.id),cells=[];
    for(const s of input.suppliers)for(const req of input.requirements)cells.push({supplierId:s.id,requirementId:req.id,score:r(clampScore(s.fit&&s.fit[req.id]!=null?s.fit[req.id]:0))});
    const eligible=assessments.filter(a=>a.eligible);
    const eligibleSuppliers=input.suppliers.filter(s=>eligible.some(a=>a.id===s.id));
    const leaders={},averages={};
    for(let i=0;i<input.requirements.length;i++){const req=input.requirements[i];let best=null,bs=-1,sum=0;
      for(const s of eligibleSuppliers){const sc=clampScore(s.fit&&s.fit[req.id]!=null?s.fit[req.id]:0);sum+=sc;if(sc>bs){bs=sc;best=s.id;}}
      if(best!==null)leaders[req.id]=best;averages[req.id]=eligibleSuppliers.length>0?r(sum/eligibleSuppliers.length):0;}
    return {requirementIds,supplierIds,cells,leaders,averages};
  }
  function buildHeadToHead(a,b){
    const byB={};b.coverage.forEach(c=>byB[c.requirementId]=c);
    const perRequirement=a.coverage.map(ca=>{const cb=byB[ca.requirementId];const sB=cb?cb.score:0;return {requirementId:ca.requirementId,label:ca.label,scoreA:ca.score,scoreB:sB,delta:r(ca.score-sB)};});
    const leader=a.compositeScore>b.compositeScore?a.id:(b.compositeScore>a.compositeScore?b.id:null);
    return {supplierA:a.id,supplierB:b.id,fitDelta:r(a.fitScore-b.fitScore),riskDelta:r(a.riskScore-b.riskScore),perRequirement,leader};
  }
  function buildMarketStructure(assessments,ranked){
    const sc={leader:0,challenger:0,niche:0,caution:0,disqualified:0};assessments.forEach(a=>sc[a.segment]+=1);
    const total=ranked.reduce((s,a)=>s+a.compositeScore,0);
    const shares=total>0?ranked.map(a=>a.compositeScore/total):ranked.map(()=>0);
    const hhi=r(shares.reduce((s,x)=>s+x*x,0),4);
    const level=(ranked.length===0||total<=0)?'none':(hhi>=0.25?'concentrated':(hhi>=0.15?'moderate':'fragmented'));
    return {eligibleCount:ranked.length,disqualifiedCount:sc.disqualified,incumbentCount:assessments.filter(a=>a.incumbent).length,top1Share:r(shares[0]||0,4),top3Share:r(shares.slice(0,3).reduce((s,x)=>s+x,0),4),hhi,level,segmentCounts:sc};
  }
  function buildCompetitiveDynamics(ranked,sc){
    const n=ranked.length;
    if(n===0)return {fieldType:'no-eligible',leaderGap:null,leaderCount:0,challengerCount:0,nicheCount:0,contenders:0};
    const top=ranked[0].compositeScore;const leaderGap=n>=2?r(top-ranked[1].compositeScore):null;
    const contenders=ranked.filter(a=>top-a.compositeScore<=CLOSE_CONTENDER_BAND).length;
    const fieldType=(n===1||(leaderGap!==null&&leaderGap>=CLEAR_LEADER_GAP))?'clear-leader':(contenders>=3?'fragmented':'close-race');
    return {fieldType,leaderGap,leaderCount:sc.leader,challengerCount:sc.challenger,nicheCount:sc.niche,contenders};
  }
  function buildDataBasis(input,assessments){
    const supplierCount=input.suppliers.length,requirementCount=input.requirements.length,riskDimensionCount=input.riskDimensions.length;
    const eligibleCount=assessments.filter(a=>a.eligible).length;
    let sf=0,wfg=0,sr=0,wrg=0,inc=0,flagged=0;
    for(const s of input.suppliers){
      if(s.incumbent)inc+=1;if(s.flags&&s.flags.length>0)flagged+=1;
      let fg=false;for(const req of input.requirements){if(s.fit&&(req.id in s.fit)&&isFinite(s.fit[req.id]))sf+=1;else fg=true;}if(fg&&requirementCount>0)wfg+=1;
      let rg=false;for(const d of input.riskDimensions){if(s.risk&&(d.id in s.risk)&&isFinite(s.risk[d.id]))sr+=1;else rg=true;}if(rg&&riskDimensionCount>0)wrg+=1;
    }
    const tf=supplierCount*requirementCount,tr=supplierCount*riskDimensionCount;
    return {supplierCount,eligibleCount,requirementCount,riskDimensionCount,incumbentCount:inc,flaggedSupplierCount:flagged,disqualifiedCount:supplierCount-eligibleCount,suppliersWithFitGaps:wfg,suppliersWithRiskGaps:wrg,fitCoverageShare:tf>0?r(sf/tf,4):0,riskCoverageShare:tr>0?r(sr/tr,4):0};
  }
  function toRecVendor(a){return {id:a.id,name:a.name,segment:a.segment,fitScore:a.fitScore,riskScore:a.riskScore,compositeScore:a.compositeScore,incumbent:a.incumbent,rank:a.rank};}
  function decideNextAction(lead,dyn,db){
    if(db.supplierCount===0)return 'gather-more-data';
    if(db.eligibleCount===0||lead===null)return 're-scope-requirements';
    if(lead.compositeScore<20)return 'eliminate-category';
    if(lead.compositeScore<40)return 're-scope-requirements';
    if(lead.incumbent&&dyn.fieldType==='clear-leader')return 'engage-incumbent';
    if(lead.segment==='leader')return 'proceed-to-rfp';
    return 'run-pilot';
  }
  function buildRationale(lead,dyn,db,na){
    if(db.supplierCount===0)return 'No candidate suppliers were supplied; gather a candidate set before sourcing.';
    if(lead===null)return 'All '+db.supplierCount+' candidate(s) carry a hard disqualifier; re-scope the requirements or the candidate set.';
    const fd=dyn.fieldType==='clear-leader'?(lead.name+' leads clearly'):(dyn.fieldType==='close-race'?(lead.name+' leads a close race'):('the field is fragmented with '+dyn.contenders+' close contender(s)'));
    return fd+' (composite '+lead.compositeScore+', fit '+lead.fitScore+'/100, risk '+lead.riskScore+'/'+SCORE_MAX+', '+lead.segment+'); suggested next action: '+na+'. Advisory only: no vendor is selected or contacted.';
  }
  function buildRecommendation(assessments,ranked,dyn,db){
    const leadA=ranked[0];const lead=leadA?toRecVendor(leadA):null;
    const runnersUp=ranked.slice(1,3).map(toRecVendor);
    const eliminations=assessments.filter(a=>!a.eligible).map(a=>({id:a.id,name:a.name,reasons:a.disqualifiers}));
    const nextAction=decideNextAction(lead,dyn,db);
    return {lead,runnersUp,eliminations,nextAction,rationale:buildRationale(lead,dyn,db,nextAction)};
  }
  function analyzeLandscape(input){
    const rw=normalizeWeights(input.requirements.map(x=>x.weight));
    const dw=normalizeWeights(input.riskDimensions.map(x=>x.weight));
    const fitHigh=(input.segmentation&&input.segmentation.fitHigh!=null)?input.segmentation.fitHigh:DEFAULT_FIT_HIGH;
    const riskHigh=(input.segmentation&&input.segmentation.riskHigh!=null)?input.segmentation.riskHigh:DEFAULT_RISK_HIGH;
    const scored=input.suppliers.map(s=>{
      const cc=computeCoverage(s,input.requirements,rw);const risk=computeRisk(s,input.riskDimensions,dw);
      const pf=partitionFlags(s.flags);const eligible=pf.disqualifiers.length===0;
      return {id:s.id,name:s.name,incumbent:s.incumbent||false,fitScore:cc.fitScore,riskScore:risk,compositeScore:composite(cc.fitScore,risk),coverage:cc.coverage,eligible,disqualifiers:pf.disqualifiers,softFlags:pf.softFlags,segment:classifySegment(eligible,cc.fitScore,risk,fitHigh,riskHigh)};
    });
    const sorted=scored.filter(a=>a.eligible).slice().sort((x,y)=>y.compositeScore-x.compositeScore||y.fitScore-x.fitScore||x.riskScore-y.riskScore||(x.id<y.id?-1:x.id>y.id?1:0));
    const rankById={};sorted.forEach((a,i)=>rankById[a.id]=i+1);
    const assessments=scored.map(a=>Object.assign({},a,{rank:rankById[a.id]!=null?rankById[a.id]:null}));
    const heatmap=buildHeatmap(input,assessments);
    const limit=Math.max(0,Math.trunc(input.topN!=null?input.topN:3));
    const ranked=sorted.map(a=>assessments.find(x=>x.id===a.id));
    const topN=ranked.slice(0,limit);
    const headToHead=ranked.length>=2?buildHeadToHead(ranked[0],ranked[1]):null;
    const marketStructure=buildMarketStructure(assessments,ranked);
    const competitiveDynamics=buildCompetitiveDynamics(ranked,marketStructure.segmentCounts);
    const dataBasis=buildDataBasis(input,assessments);
    const recommendation=buildRecommendation(assessments,ranked,competitiveDynamics,dataBasis);
    return {category:input.category,supplierCount:input.suppliers.length,eligibleCount:sorted.length,assessments,heatmap,topN,headToHead,marketStructure,competitiveDynamics,dataBasis,recommendation};
  }
  // classifySegment exposed (owner ask, 2026-07): pvSegPlaneHtml's interactive fit/risk-threshold sliders
  // need the SAME leader/challenger/niche/caution rule the engine used, so segment recompute never drifts.
  return {analyzeLandscape,classifySegment,reflect:function(input){return {landscape:analyzeLandscape(input)};}};
})();

/* label maps + palette (Bold Blue family for strength; amber=caution; red=hard; grey=off-table) */
var PVSEG_LBL={leader:'Leader',challenger:'Challenger',niche:'Niche',caution:'Caution',disqualified:'Disqualified'};
var PVSEG_DESC={leader:'Strong fit, contained risk',challenger:'Strong fit, elevated risk',niche:'Narrower fit, contained risk',caution:'Narrower fit, elevated risk',disqualified:'Hard flag, off the shortlist'};
var PVSEG_ACTION={leader:'Advance to the RFx slate as a pace-setter; use its strengths to set the bar on price and terms.',challenger:'Strong fit but elevated risk, shortlist with risk conditions attached and validate the flagged items first.',niche:'Fit for a specific scope; hold as a fallback or point solution rather than a primary.',caution:'Elevated risk and narrower fit, keep only as a price lever, not a primary award path.',disqualified:'Off the shortlist on a hard flag; do not carry into the RFx.'};
var PVSEG_COLOR={leader:'#5C2B50',challenger:'#2F6E6B',niche:'#8A6E86',caution:'#C15E19',disqualified:'#B0A9A2'};
var PVSEG_ORDER=['leader','challenger','niche','caution','disqualified'];
// #4: per-supplier identity colours for the Segmentation section (distinct per supplier; no burnt orange, no green).
var PVSUP_PAL=['#5C2B50','#2F6E6B','#8A6E86','#417C74','#7A4B86','#C15E19','#5F8C86','#9A5A82']; // plum/teal/emph family, all distinct
var PVSUP_CMAP={},PVSUP_CI=0;
function pvSupColor(a){var id=String((a&&(a.id||a.name))||'');if(!id)return PVSUP_PAL[0];if(PVSUP_CMAP[id]==null){PVSUP_CMAP[id]=PVSUP_PAL[PVSUP_CI%PVSUP_PAL.length];PVSUP_CI++;}return PVSUP_CMAP[id];}
// #4: light quadrant background shades + matching solid tile-label colours (leader blue · challenger teal · niche plum · caution gold).
var PVQUAD_SHADE={leader:'rgba(92,43,80,.08)',challenger:'rgba(47,110,107,.11)',niche:'rgba(92,43,80,.10)',caution:'rgba(193,94,25,.13)'};
var PVQUAD_SOLID={leader:'#5C2B50',challenger:'#2F6E6B',niche:'#5C2B50',caution:'#C15E19'};
var PVFIELD_LBL={'clear-leader':'Clear leader','close-race':'Close race','fragmented':'Fragmented','no-eligible':'No eligible'};
var PVFIELD_CLS={'clear-leader':'low','close-race':'moderate','fragmented':'moderate','no-eligible':'high'};
var PVNEXT_LBL={'proceed-to-rfp':'Proceed to RFP','run-pilot':'Run a pilot','engage-incumbent':'Engage incumbent','re-scope-requirements':'Re-scope requirements','eliminate-category':'Eliminate category','gather-more-data':'Gather more data'};
var PVLEVEL_LBL={concentrated:'concentrated',moderate:'moderate',fragmented:'fragmented',none:'none'};
function pvRound(n,dp){dp=dp==null?2:dp;var f=Math.pow(10,dp);return Math.round(n*f)/f;}
function pvPct100(x){return pvRound((Number(x)||0)*100,1)+'%';}
function pvInitials(name){var caps=String(name).replace(/[^A-Z]/g,'');if(caps.length>=2)return caps.slice(0,2);return String(name).replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase();}
function pvFitBg(score){var a=0.10+(Math.max(0,Math.min(5,score))/5)*0.70;return 'background:rgba(92,43,80,'+pvRound(a,3)+');color:'+(score>=3.5?'#fff':'var(--ink)')+';';}
/* Risk heatmap: single red hue graded by score (higher = worse), interpolated light #FBEAE8 -> deep
   #9E1710 with t=clamp((v-1)/2.2,0,1), the SAME technique as pvHmRamp so risk swatches read as richly
   graded as the blue fit swatches (not a flat pink wash). Numeral white when t>0.5 else ink. */
function pvRiskBg(score){var v=Number(score);if(!isFinite(v))v=0;var t=(v-1)/2.2;t=t<0?0:(t>1?1:t);var r=Math.round(251+(158-251)*t),g=Math.round(234+(23-234)*t),b=Math.round(232+(16-232)*t);return 'background:rgb('+r+','+g+','+b+');color:'+(t>0.5?'#fff':'#1A1A1A')+';';}
/* Pass B: 5-scale fit BAND colouring for the heatmap, navy>=4.25 strong / amber 3.50-4.24 adequate / red<3.50 gap (no green). */
function pvBandOf(s){s=Number(s)||0;return s>=4.25?'strong':(s>=3.5?'adequate':'gap');}
function pvBandBg(s){var b=pvBandOf(s);return b==='strong'?'background:#5C2B50;color:#fff':b==='adequate'?'background:#F6DDC9;color:#7A3D0F':'background:#E1251B;color:#fff';}
/* lighter band tints for sub-requirement + field-average cells (hierarchy) */
function pvBandBgSub(s){var b=pvBandOf(s);return b==='strong'?'background:rgba(92,43,80,.16);color:var(--blue-d)':b==='adequate'?'background:rgba(193,94,25,.20);color:var(--emph,#C15E19)':'background:rgba(225,37,27,.14);color:var(--red-d)';}
/* risk sub-factor + field-avg cells share the SAME ramp as main cells (the fit heatmap treats sub/avg
   cells with the full pvHmRamp too); hierarchy comes from the smaller swatch size, not a lighter tint. */
function pvRiskBgSub(s){return pvRiskBg(s);}
/* Requirements-Fit heatmap: single blue hue graded by 5-pt score. Interpolate #E8EEF4 (low)
   -> #1C4A75 (high) with t=clamp((v-3.2)/1.7,0,1); numeral white when t>0.5 else ink. */
function pvHmRamp(s){
 var v=Number(s);if(!isFinite(v))v=0;
 var t=(v-3.2)/1.7;t=t<0?0:(t>1?1:t);
 var r=Math.round(237+(92-237)*t),g=Math.round(223+(43-223)*t),b=Math.round(233+(80-233)*t);
 return 'background:rgb('+r+','+g+','+b+');color:'+(t>0.5?'#fff':'#1A1A1A')+';';
}
/* Recommendation standings segment descriptor, derived from advisory rank (reflect-only). */
function pvRecStanding(a){
 if(a.rank===1)return 'Preferred lead';
 if(a.rank===2)return 'Strong challenger';
 if(a.rank===3)return 'Value challenger';
 return PVSEG_LBL[a.segment]||'Challenger';
}
/* Pass 2A: provenance tag (internal-first model). internal = Lilly's own records (spend,
   contracts, RFP pricing, relationship history); external = firmographics / financials /
   analyst coverage enrichment from credible public sources, reflect-only, not validated.
   Inline-styled so no CSS rule is added (Pass 2B owns readability CSS). */
function pvSrcTag(kind){
 var b='display:inline-block;font-family:var(--mono);font-size:8.5px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;padding:0 4px;border-radius:3px;vertical-align:middle;line-height:1.55;';
 if(kind==='int')return '<span title="Internal, from Lilly own records: spend, contracts, RFP pricing and relationship history." style="'+b+'background:rgba(92,43,80,.12);color:var(--navy);border:1px solid rgba(92,43,80,.30)">internal</span>';
 if(kind==='ext')return '<span title="External enrichment, firmographics, financials and analyst coverage from credible public sources; not validated." style="'+b+'background:var(--tint-eef0f3,#EEF0F3);color:#5B6472;border:1px solid rgba(0,0,0,.15)">external</span>';
 return '';
}
/* Pass 2A: category COVERAGE %, the share of a category's sub-requirements this vendor meets
   at/above the 3.5/5 adequacy threshold (distinct from the weighted 0-5 fit rollup). Drift-proof:
   computed live from the authored subFit sub-scores. Returns {met,total,pct} or null. */
function pvCoverPct(cand,reqDef){
 if(!cand||!cand.subFit||!reqDef||!reqDef.subs||!reqDef.subs.length)return null;
 var scores=cand.subFit[reqDef.id];if(!scores)return null;
 var total=0,met=0;
 reqDef.subs.forEach(function(s){var v=scores[s.id];if(v==null||!isFinite(v))return;total++;if(v>=3.5)met++;});
 if(!total)return null;
 return {met:met,total:total,pct:Math.round(met/total*100)};
}

/* module state: current engine input, open deep-dive vendor, shortlist map (project|vendor) */
var PVSL_INPUT=null,PVSL_DD=null,PVSL_SHORT={};
/* Pass A subtab state (persists within the session): which Landscape subtab is open, the
   deep-dive vendor + nested sub-tab, and whether the Start-an-RFx picker is open. */
var PVSL_SUB='exec';          // exec | deep | heatmap | risk
var PVSL_DDV=null;            // selected vendor id in the Supplier Deep Dive subtab
var PVSL_DDT='summary';      // v3 deep dive (pv-07b): summary | company | caps | finmkt | risk | lilly
var PVSL_RFX_OPEN=false;     // Start-an-RFx picker open?
var PVSL_RFX_PICK={};        // vendor id -> included in the draft slate
var PVSL_RFX_SENT=false;     // Pass B: draft routed to sourcing rep (pending approval)?
/* Pass B subtab state: heatmap expand/active-vendor/filter + risk expand/active-vendor */
var PVSL_HM_EXP={};          // heatmap: categoryId -> expanded to sub-requirements?
var PVSL_HM_VEND=null;       // heatmap: active vendor id (renders its rationale inline below)
var PVSL_HM_RAT=false;       // Pass 2B: heatmap rationale section expanded? (starts collapsed after a vendor is picked)
var PVSL_HM_RAT_CAT=null;    // Heatmap+Risk stage: single-open accordion inside the per-vendor rationale panel, the one requirement-category id currently expanded (others show just their header row)
var PVSL_HM_Q='';            // heatmap: category filter query (Pass 2B: search removed; kept empty)
var PVSL_RK_EXP={};          // risk: dimensionId -> expanded to sub-factors?
var PVSL_RK_VEND=null;       // risk: active vendor id (renders its rationale inline below)
var PVSL_RK_RAT=false;       // Pass 2B: risk rationale section expanded? (starts collapsed after a vendor is picked)
var PVSL_RK_RAT_DIM=null;    // Heatmap+Risk stage: single-open accordion inside the per-vendor risk rationale panel, the one dimension id currently expanded
var PVSL_H2H_A=0;            // Exec Summary head-to-head: index (in eligible-ordered list) of vendor A
var PVSL_H2H_B=1;            // Exec Summary head-to-head: index of vendor B
var PVSL_HM_INIT=false;      // round-4 (Marc): heatmap defaults the TOP prospect selected + its rationale + top category expanded, once
var PVSL_RK_INIT=false;      // round-4 (Marc): risk heatmap defaults the TOP prospect selected + its rationale + top dimension expanded, once
var PVSL_DDREQ_INIT=false;   // round-4 (Marc): deep-dive Requirements analysis defaults its TOP category expanded, once
var PVSL_DDREQ_EXP={};       // round-3: deep-dive Requirements Analysis, requirementId -> expanded to its sub-requirements?
var PVSL_SEG_FIT=null;       // Segmentation & Differentiators: interactive fit-threshold slider (0-100 scale), null = this project's config default until moved
var PVSL_SEG_RISK=null;      // Segmentation & Differentiators: interactive risk-threshold slider (0-5 scale), null = this project's config default until moved
/* Pass B: qualified incumbents NOT in the scan that the RFx picker can suggest (reflect-only mock) */
var PVSL_RFX_SUGGEST=_PVLA.rfxSuggest||[];
/* distinct CATEGORICAL palette for the ranking bars where each vendor is coloured (no green,
   no near-identical blues): bold blue (lead) · violet · burnt orange. Segment colouring on the
   plane stays PVSEG_COLOR because there the colour encodes leader/challenger/niche/caution. */
var PVVENDOR_COLORS=['#5C2B50','#2F6E6B','#C15E19','#7A4B86','#B4560F']; // plum / teal / emph / plum-purple / burnt (A=plum vs B=teal for clear H2H contrast)
// G12 ESG & regulatory posture, illustrative risk scores (0-5, higher = worse) + short reads per vendor.
// Injected into the risk model at render so ESG appears as a scored Risk-Assessment dimension.
var PVSL_ESG=_PVLA.esg||{};
var PVSL_ESG_NARR=_PVLA.esgNarr||{};
function pvRerender(){if(curtab==='landscape'){$('#tabbody').innerHTML=landscapeHTML();var tb=document.getElementById('tabbody');if(tb)tb.scrollTop=0;}}
function pvSetSub(k){PVSL_SUB=k;pvRerender();}
function pvSetDDV(id){PVSL_DDV=id;pvRerender();}
function pvSetDDT(k){PVSL_DDT=k;pvRerender();}
/* Segmentation & Differentiators: fit/risk threshold sliders (owner ask, 2026-07). Clamped to the slider's
   own bounds regardless of what the input carries, then a full rerender so the plane/legend/Candidates list
   recompute off the new cut (see pvSegPlaneHtml). */
function pvSegSetFit(v){var n=Math.round(Number(v));if(!isFinite(n))return;PVSL_SEG_FIT=Math.max(55,Math.min(90,n));pvRerender();}
function pvSegSetRisk(v){var n=Math.round(Number(v)*10)/10;if(!isFinite(n))return;PVSL_SEG_RISK=Math.max(1,Math.min(4.5,n));pvRerender();}
/* Pass B interaction handlers, Requirements heatmap */
function pvHmToggleCat(id){if(PVSL_HM_EXP[id])delete PVSL_HM_EXP[id];else PVSL_HM_EXP[id]=true;pvRerender();}
function pvDdReqToggle(id){if(PVSL_DDREQ_EXP[id])delete PVSL_DDREQ_EXP[id];else PVSL_DDREQ_EXP[id]=true;pvRerender();}
function pvHmVend(id){var prev=PVSL_HM_VEND;PVSL_HM_VEND=(PVSL_HM_VEND===id?null:id);if(PVSL_HM_VEND!==prev)PVSL_HM_RAT=false;pvRerender();}
function pvH2HPick(which,idx){idx=parseInt(idx,10);if(isNaN(idx))return;if(which==='a')PVSL_H2H_A=idx;else PVSL_H2H_B=idx;pvRerender();}
function pvHmRatToggle(){PVSL_HM_RAT=!PVSL_HM_RAT;pvRerender();}
/* Heatmap+Risk stage: single-open accordion inside the rationale panel, clicking a category sets it open and
   collapses any other; clicking the already-open category closes it back to just header rows. */
function pvHmRatCatToggle(id){PVSL_HM_RAT_CAT=(PVSL_HM_RAT_CAT===id?null:id);pvRerender();}
/* live category filter: DOM-only (keeps input focus, no re-render); the query is also baked into render */
function pvHmFilter(q){PVSL_HM_Q=q||'';var ql=PVSL_HM_Q.trim().toLowerCase();var t=document.getElementById('pvhm-table');if(!t)return;var rows=t.querySelectorAll('tr[data-search]');var vis=0;for(var i=0;i<rows.length;i++){var s=(rows[i].getAttribute('data-search')||'').toLowerCase();var hide=!!(ql&&s.indexOf(ql)<0);if(hide)rows[i].classList.add('hmhide');else rows[i].classList.remove('hmhide');if(!hide&&rows[i].hasAttribute('data-cat'))vis++;}var e=document.getElementById('pvhm-empty');if(e)e.style.display=(ql&&vis===0)?'':'none';}
/* Pass B interaction handlers, Risk assessment */
function pvRkToggle(id){if(PVSL_RK_EXP[id])delete PVSL_RK_EXP[id];else PVSL_RK_EXP[id]=true;pvRerender();}
function pvRkVend(id){var prev=PVSL_RK_VEND;PVSL_RK_VEND=(PVSL_RK_VEND===id?null:id);if(PVSL_RK_VEND!==prev)PVSL_RK_RAT=false;pvRerender();}
function pvRkRatToggle(){PVSL_RK_RAT=!PVSL_RK_RAT;pvRerender();}
/* Heatmap+Risk stage: same single-open accordion, for the risk rationale panel's dimensions. */
function pvRkRatDimToggle(id){PVSL_RK_RAT_DIM=(PVSL_RK_RAT_DIM===id?null:id);pvRerender();}

/* does this project carry the deepened landscape model? */
function pvIsDeep(P){return !!(P&&Array.isArray(P.requirements)&&P.requirements.length&&Array.isArray(P.landscape)&&P.landscape.some(function(s){return s&&s.reqFit;}));}
/* Pass A: compute each vendor's per-category fit (reqFit) and per-dimension risk (risk) as a
   WEIGHTED ROLLUP of its authored sub-scores, so the category/dimension numbers can never drift
   from the sub-requirement scores. Idempotent; guarded so it runs once per project object. */
function pvRollup(subDefs,scores){
 if(!subDefs||!subDefs.length||!scores)return null;
 var tw=0,ws=0,any=false;
 for(var i=0;i<subDefs.length;i++){var w=subDefs[i].weight||1;var v=scores[subDefs[i].id];if(v==null||!isFinite(v))continue;any=true;tw+=w;ws+=w*v;}
 return (any&&tw>0)?Math.round(ws/tw*100)/100:null;
}
function pvHydrate(P){
 if(!P||!Array.isArray(P.landscape)||P._hydrated)return;
 var reqs=P.requirements||[],dims=P.riskDimensions||[];
 P.landscape.forEach(function(s){
  if(s.subFit){var rf={};reqs.forEach(function(r){var v=pvRollup(r.subs,s.subFit[r.id]);if(v!=null)rf[r.id]=v;});if(Object.keys(rf).length)s.reqFit=rf;}
  if(s.riskSub){var rk={};dims.forEach(function(d){var v=pvRollup(d.subs,s.riskSub[d.id]);if(v!=null)rk[d.id]=v;});if(Object.keys(rk).length)s.risk=rk;}
 });
 P._hydrated=true;
}
/* build the engine input from the deepened landscape[] (thin projects -> null) */
function pvLandInput(P){
 if(!pvIsDeep(P))return null;
 pvHydrate(P);
 return {
  category:P.title||'IT sourcing',topN:3,
  requirements:P.requirements,riskDimensions:P.riskDimensions||[],
  segmentation:P.segmentation||{fitHigh:60,riskHigh:2.5},
  suppliers:P.landscape.map(function(s,i){return {
   id:s.id||('c'+i),name:s.n||('Candidate '+(i+1)),
   incumbent:!!s.incumbent||/incumbent/i.test((s.sub||'')+' '+(s.n||'')),
   fit:s.reqFit||{},risk:s.risk||{},flags:s.flags||[]
  };})
 };
}
function pvCandById(id){var P=PROJECTS[CURPROJ]||{};return (P.landscape||[]).find(function(s){return (s.id||'')===id;})||null;}
/* verdict (mirrors engines/supplier-deep-dive.ts decideVerdict): fit<3 or max risk -> DO_NOT_PROCEED; a gate or elevated (>=3) risk -> conditions; else proceed */
function pvVerdict(fit5,risk5,g){if(fit5<3||risk5>=5)return 'DO_NOT_PROCEED';if(g>0||risk5>=3)return 'PROCEED_WITH_CONDITIONS';return 'PROCEED';}
function pvVerdictMeta(v){return v==='PROCEED'?{lbl:'Proceed',cls:'go'}:v==='PROCEED_WITH_CONDITIONS'?{lbl:'Proceed with conditions',cls:'cond'}:v==='DEFER'?{lbl:'Defer',cls:'defer'}:{lbl:'Do not proceed',cls:'no'};}
function pvAssessVerdict(a,cand){if(!a.eligible)return 'DO_NOT_PROCEED';var g=(cand&&cand.deepDive&&cand.deepDive.gating)?cand.deepDive.gating.length:0;return pvVerdict(a.fitScore/20,a.riskScore,g);}

/* ---- shortlist (item C15): advisory landscape -> RFx handoff, reflect-only ---- */
function pvShortKey(id){return ((PROJECTS[CURPROJ]||{}).code||CURPROJ)+'|'+id;}
function pvIsShort(id){return !!PVSL_SHORT[pvShortKey(id)];}
function pvToggleShort(id){var k=pvShortKey(id);var P=PROJECTS[CURPROJ]||{};var c=(P.landscape||[]).find(function(s){return (s.id||'')===id;});var nm=c?c.n:id;
 if(PVSL_SHORT[k]){delete PVSL_SHORT[k];toast('Removed '+nm+' from the shortlist. Nothing was selected, contacted, or awarded.');}
 else{PVSL_SHORT[k]=true;toast('Shortlisted '+nm+' -> '+(P.code||'project')+' · carried into the RFx evaluation as a human-confirmed input. Advisory only: nothing is selected, contacted, or awarded.');}
 if(curtab==='landscape')$('#tabbody').innerHTML=landscapeHTML();
}
function pvShortStripHtml(){
 var P=PROJECTS[CURPROJ]||{};var picked=(P.landscape||[]).filter(function(s){return pvIsShort(s.id||'');});
 if(!picked.length)return '';
 var names=picked.map(function(s){return '<b>'+escD(s.n)+'</b>';}).join(', ');
 return '<div class="pvshort"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--blue-d);fill:none;stroke-width:2;flex:none;margin-top:1px"><path d="M9 11l3 3L20 6"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></svg><span>Shortlisted for '+escD(P.code||'this project')+': '+names+'. These carry into the <b>RFx</b> evaluation as human-confirmed inputs (landscape &rarr; RFx handoff). Advisory only, nothing is selected, contacted, or awarded.</span></div>';
}
function pvOpenDeepDive(id){PVSL_DD=id;if(curtab==='landscape')$('#tabbody').innerHTML=landscapeHTML();var tb=document.getElementById('tabbody');if(tb)tb.scrollTop=0;}
function pvCloseDeepDive(){PVSL_DD=null;if(curtab==='landscape')$('#tabbody').innerHTML=landscapeHTML();}

/* ---- reflect banner + KPI strip ---- */
function pvReflectBanner(){
 return '<div class="reflect"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>An <b>advisory</b> read of this project\'s candidate set, each vendor scored on <b>weighted requirements</b> and a <b>multi-dimensional risk</b> roll-up, with an <b>advisory</b> recommendation and a per-vendor deep dive. Facts are labelled by source: <b>internal</b> Lilly records first, then <b>external</b> public enrichment (not validated). A missing figure reads <b>Data not available</b>. No vendor is selected, contacted, or awarded.</span></div>';
}
function pvMetricsHtml(refl){
 var L=refl.landscape,ms=L.marketStructure,cd=L.competitiveDynamics,rec=L.recommendation,lead=rec.lead;
 var fc=PVFIELD_CLS[cd.fieldType]||'low';
 return '<div class="metrics">'+
  '<div class="metric"><div class="lab">Vendors evaluated</div><div class="val">'+escD(L.supplierCount)+'</div><div class="note">'+escD(L.category)+'</div></div>'+
  '<div class="metric"><div class="lab">Eligible</div><div class="val">'+escD(L.eligibleCount)+'<small> of '+escD(L.supplierCount)+'</small></div><div class="note">'+escD(ms.disqualifiedCount)+' disqualified · '+escD(ms.incumbentCount)+' incumbent</div></div>'+
  '<div class="metric"><div class="lab">Recommended lead</div><div class="val" style="font-size:15px">'+escD(lead?lead.name:'None eligible')+'</div><div class="note">'+(lead?('composite '+escD(lead.compositeScore)+' · fit '+escD(lead.fitScore)+'/100 · risk '+escD(lead.riskScore)+'/5'):'every candidate carries a hard flag')+'</div></div>'+
  '<div class="metric"><div class="lab">Field</div><div class="val"><span class="conf '+fc+'">'+escD(PVFIELD_LBL[cd.fieldType]||cd.fieldType)+'</span></div><div class="note">'+(cd.leaderGap!=null?('leader gap '+escD(cd.leaderGap)):'single eligible')+' · '+escD(PVLEVEL_LBL[ms.level]||ms.level)+' concentration</div></div>'+
  '<div class="metric"><div class="lab">Next action</div><div class="val" style="font-size:15px;color:var(--blue)">'+escD(((typeof wfNextAction==="function"&&wfNextAction())||{}).act||PVNEXT_LBL[rec.nextAction]||rec.nextAction)+'</div><div class="note">the team&#39;s next step to advance the project</div></div>'+
 '</div>';
}

/* ---- candidate list: entry to the deep-dive drill + shortlist action ---- */
function pvCandidatesHtml(refl){
 var L=refl.landscape;
 var ordered=L.assessments.slice().sort(function(x,y){
   if(x.eligible!==y.eligible)return x.eligible?-1:1;
   if(x.eligible)return (x.rank||99)-(y.rank||99);
   return x.name.localeCompare(y.name);
 });
 var rows=ordered.map(function(a){
   var cand=pvCandById(a.id);var vm=pvVerdictMeta(pvAssessVerdict(a,cand));var short=pvIsShort(a.id);
   return '<div class="pvcand">'+
     '<div>'+(a.eligible?'<span class="rankpill head">'+escD(a.rank)+'</span> ':'<span class="rankpill">-</span> ')+
       '<span class="pcn">'+escD(a.name)+'</span>'+(a.incumbent?' <span class="flag inc">incumbent</span>':'')+(a.eligible?'':' <span class="flag hard">disqualified</span>')+
       '<div class="pcs">'+escD(cand?cand.sub:'')+'</div></div>'+
     '<div class="pcstat">'+
       '<span class="segbadge" style="background:'+PVSEG_COLOR[a.segment]+'">'+escD(PVSEG_LBL[a.segment])+'</span>'+
       '<span class="bchip">fit <b>'+escD(a.fitScore)+'</b>/100</span>'+
       '<span class="bchip">risk <b>'+escD(a.riskScore)+'</b>/5</span>'+
       '<span class="bchip">comp <b>'+escD(a.compositeScore)+'</b></span>'+
       '<span class="verdictpill '+vm.cls+'">'+escD(vm.lbl)+'</span>'+
       '<button class="pvbtn primary" onclick="pvOpenDeepDive(\''+escD(a.id)+'\')">Deep dive &rarr;</button>'+
     '</div>'+
   '</div>';
 }).join('');
 return '<div class="sa-card"><div class="card-hd"><svg viewBox="0 0 24 24"><path d="M3 7h18"/><path d="M6 7v13h12V7"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/></svg><span class="ct">Candidates</span><span class="cs">'+escD(L.eligibleCount)+' eligible · deep dive + shortlist</span></div><div class="scc-b" style="padding:0">'+rows+'</div></div>';
}

/* Authored reflect-only Exec-Summary demo values (design handoff): the standings composites + risk
   the pre-RFP scan shows. Keeps the Evaluation-summary prose, All-vendor plane and Recommendation
   internally consistent (single source) rather than clashing with the live risk-discounted rollups. */
var PV_EXEC_AUTH=_PVLA.execAuth||{};
function pvAuthRisk(id,fb){return (PV_EXEC_AUTH[id]&&PV_EXEC_AUTH[id].risk!=null)?PV_EXEC_AUTH[id].risk:fb;}
/* ---- segmentation board (fit x risk plane) ---- */
function pvPlaneDot(a,fh,rh,selId,opts){
 // Marc: 4 EQUAL quadrants, the cutoff maps to the CENTER (50%). Piecewise scale: [0..cutoff]→[pad..50],
 // [cutoff..max]→[50..100-pad], so a supplier sits on the correct side of a centered divider. This is the
 // DEFAULT (opts.prop falsy) used by callers that render a fixed 50/50 quadrant split.
 // #4 (Marc): dots are clickable and tie to the differentiators accordion (pvSegPick); selId rings the open one.
 // opts.prop (owner ask, 2026-07): the Segmentation & Differentiators plane instead plots dots on a plain
 // proportional scale (same pad 6-94/8-92 formula the divider lines use) so the dot position and the movable
 // divider line agree, and dragging a threshold slider visibly resizes the quadrants around the dots.
 fh=(fh!=null?fh:60);rh=(rh!=null?rh:2.5);opts=opts||{};
 var rv=pvAuthRisk(a.id,a.riskScore);
 var f=Math.max(0,Math.min(100,a.fitScore));
 var rvv=Math.max(0,Math.min(5,rv));
 var left,top;
 if(opts.prop){
   left=pvRound(6+(f/100)*88,2);
   top=pvRound(8+(rvv/5)*84,2);
 }else{
   left=pvRound(f<=fh?(6+(f/(fh||1))*44):(50+((f-fh)/((100-fh)||1))*44),2);
   top=pvRound(rvv<=rh?(8+(rvv/(rh||1))*42):(50+((rvv-rh)/((5-rh)||1))*42),2);
 }
 var dq=a.segment==='disqualified';var col=pvSupColor(a);
 var isLead=a.rank===1;
 var isShort=!!(opts.shortlistIds&&opts.shortlistIds[a.id]);
 // Shortlist tint on the dot (owner ask, 2026-07: replaces the "Shortlist to advance" sentence); rank-1 keeps
 // its own selection ring untouched, non-shortlisted eligible dots dim slightly so the tint reads at a glance.
 var shortCls=(isShort&&!isLead)?' pdot-short':'';
 var dimCls=(!isShort&&!isLead&&!dq)?' pdot-dim':'';
 var title=a.name+' · fit '+a.fitScore+'/100 · risk '+rv+'/5 · '+PVSEG_LBL[a.segment]+(a.incumbent?' · incumbent':'')+(isShort?' · shortlisted':'');
 var selCls=(selId!=null&&a.id===selId)?' pdot-sel':'';
 return '<span class="pdot'+(dq?' dq':'')+(a.incumbent?' inc':'')+selCls+shortCls+dimCls+'" data-id="'+escD(a.id)+'" onclick="pvSegPick(\''+jarg(a.id)+'\')" style="left:'+left+'%;top:'+top+'%;'+(dq?'':'background:'+col+';border-color:'+col)+'" title="'+escD(title)+'">'+escD(pvInitials(a.name))+'</span>';
}
function pvSegmentationHtml(refl){
 var L=refl.landscape,ms=L.marketStructure,sc=ms.segmentCounts;
 var seg=(PVSL_INPUT&&PVSL_INPUT.segmentation)||{};
 var fitHigh=seg.fitHigh!=null?seg.fitHigh:60,riskHigh=seg.riskHigh!=null?seg.riskHigh:2.5;
 var vx=pvRound(6+fitHigh/100*88,2),hy=pvRound(8+riskHigh/5*84,2);
 var dots=L.assessments.map(pvPlaneDot).join('');
 var tiles=PVSEG_ORDER.map(function(s){
   var names=L.assessments.filter(function(a){return a.segment===s;}).sort(function(x,y){return (x.rank||99)-(y.rank||99)||x.name.localeCompare(y.name);});
   var chips=names.map(function(a){return '<span class="vchip"><span class="swd" style="background:'+pvSupColor(a)+'"></span>'+escD(a.name)+(a.incumbent?' <span class="flag inc">incumbent</span>':'')+'</span>';}).join('');
   return '<div class="segtile"><div class="sl"><span class="swd" style="background:'+(PVQUAD_SOLID[s]||PVSEG_COLOR[s])+'"></span>'+escD(PVSEG_LBL[s])+'</div><div class="sc">'+escD(sc[s]||0)+'</div><div class="sd">'+escD(PVSEG_DESC[s])+'</div>'+(chips?'<div class="vchips">'+chips+'</div>':'')+'</div>';
 }).join('');
 return '<div class="sa-card">'+
   '<div class="card-hd"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span class="ct">Segmentation board</span><span class="cs">'+escD(L.supplierCount)+' candidates · fit cut '+escD(fitHigh)+'/100 · risk cut '+escD(riskHigh)+'/5</span></div>'+
   '<div class="scc-b">'+
     '<div class="plane"><div class="pdiv-v" style="left:'+vx+'%"></div><div class="pdiv-h" style="top:'+hy+'%"></div>'+
       '<div class="qlab" style="right:10px;top:8px">Leaders</div><div class="qlab" style="left:10px;top:8px">Niche</div><div class="qlab" style="right:10px;bottom:8px">Challengers</div><div class="qlab" style="left:10px;bottom:8px">Caution</div>'+
       '<div class="axlab" style="left:8px;bottom:50%">&#8593; lower risk</div><div class="axlab" style="left:50%;transform:translateX(-50%);bottom:2px">higher fit &#8594;</div>'+dots+'</div>'+
     '<div class="segs">'+tiles+'</div>'+
     '<div class="footbound">Position is the supplied weighted fit (0-100, horizontal) against the weighted risk roll-up (0-5, vertical; higher sits lower). A hard flag drops a vendor to <b>disqualified</b> (dashed, off the shortlist) regardless of where it would otherwise sit. A ringed dot marks the incumbent; it is reflected, never auto-recommended.</div>'+
   '</div></div>';
}

/* ---- market structure (composite share + HHI) ---- */
function pvMarketStructureHtml(refl){
 var L=refl.landscape,ms=L.marketStructure;
 var ranked=L.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;});
 var total=ranked.reduce(function(s,a){return s+Math.max(a.compositeScore,0);},0);
 var segs=ranked.map(function(a){return '<div class="seg" title="'+escD(a.name)+' · composite '+escD(a.compositeScore)+' ('+escD(total>0?pvPct100(a.compositeScore/total):'0%')+')" style="width:'+pvRound(total>0?Math.max(a.compositeScore,0)/total*100:0,2)+'%;background:'+PVSEG_COLOR[a.segment]+'"></div>';}).join('');
 var legend=ranked.map(function(a){return '<span class="lg"><span class="sw" style="background:'+PVSEG_COLOR[a.segment]+'"></span>'+escD(a.name)+'</span>';}).join('');
 var levelCls=ms.level==='concentrated'?'high':ms.level==='moderate'?'moderate':'low';
 return '<div class="sa-card">'+
   '<div class="card-hd"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 18v-7M10 18V6M15 18v-9M20 18v-4"/></svg><span class="ct">Market structure</span><span class="cs">'+escD(ms.eligibleCount)+' eligible · HHI '+escD(ms.hhi.toFixed(3))+' <span class="conf '+levelCls+'" style="margin-left:6px">'+escD(PVLEVEL_LBL[ms.level]||ms.level)+'</span></span></div>'+
   '<div class="scc-b">'+
     (total>0?('<div class="stack">'+segs+'</div><div class="legend">'+legend+'<span class="lg" style="margin-left:auto;color:var(--mut2)">Segment width = share of eligible composite</span></div>'):'<div class="footbound">No eligible suppliers to chart; every candidate carries a hard disqualifier.</div>')+
     '<div class="basis" style="margin-top:14px"><span class="bchip">Top-1 composite share <b>'+escD(pvPct100(ms.top1Share))+'</b></span><span class="bchip">Top-3 composite share <b>'+escD(pvPct100(ms.top3Share))+'</b></span><span class="bchip">HHI <b>'+escD(ms.hhi.toFixed(4))+'</b></span><span class="bchip">Concentration <b>'+escD(PVLEVEL_LBL[ms.level]||ms.level)+'</b></span><span class="bchip">Eligible <b>'+escD(ms.eligibleCount)+'</b></span><span class="bchip">Disqualified <b>'+escD(ms.disqualifiedCount)+'</b></span></div>'+
     '<div class="footbound">Concentration is reflected from the candidate set\'s own composite scores, not external market sizing. HHI at or above 0.25 is <b>concentrated</b>, 0.15 to 0.25 <b>moderate</b>, below 0.15 <b>fragmented</b>. No market size is invented.</div>'+
   '</div></div>';
}

/* ---- competitive dynamics + head-to-head ---- */
function pvH2HTradeoff(A,B,per,leadId,fitDelta,riskDelta){
 var parts=[];
 if(A.fitScore!==B.fitScore){var fhi=A.fitScore>B.fitScore?A:B,flo=fhi===A?B:A;parts.push(fhi.name+' carries the higher weighted fit ('+fhi.fitScore+' vs '+flo.fitScore+'/100)');}
 else parts.push('weighted fit is level ('+A.fitScore+'/100)');
 if(A.riskScore!==B.riskScore){var rlo=A.riskScore<B.riskScore?A:B,rhi=rlo===A?B:A;parts.push(rlo.name+' carries the lower risk roll-up ('+rlo.riskScore+' vs '+rhi.riskScore+'/5)');}
 else parts.push('risk roll-ups are level ('+A.riskScore+'/5)');
 var aLeads=per.filter(function(d){return d.delta>0;}).sort(function(x,y){return y.delta-x.delta;});
 var bLeads=per.filter(function(d){return d.delta<0;}).sort(function(x,y){return x.delta-y.delta;});
 var reqPart='';
 if(aLeads[0])reqPart+=A.name+' leads on '+aLeads[0].label+' (+'+aLeads[0].delta+')';
 if(aLeads[0]&&bLeads[0])reqPart+='; ';
 if(bLeads[0])reqPart+=B.name+' leads on '+bLeads[0].label+' ('+bLeads[0].delta+')';
 var winner=leadId?((leadId===A.id?A:B).name+' leads overall by composite'):'the two are level on composite';
 return parts.join(', ')+'. '+(reqPart?reqPart+'. ':'')+A.name+' leads '+aLeads.length+' of '+per.length+' requirements, '+B.name+' leads '+bLeads.length+'; '+winner+'. Weigh the category deltas against Lilly’s priorities; advisory only, no winner is selected.';
}
/* competitive dynamics + head-to-head, dashboard parity: structural chips, an interactive COMPARE
   picker (any two candidates), two vendor pillars, delta chips, per-requirement table + key tradeoff. */
function pvDynamicsHtml(refl){
 var L=refl.landscape,cd=L.competitiveDynamics;
 var byId={};L.assessments.forEach(function(a){byId[a.id]=a;});
 var nameOf=function(id){return byId[id]?byId[id].name:id;};
 var order=L.assessments.slice().sort(function(x,y){if(x.eligible!==y.eligible)return x.eligible?-1:1;if(x.eligible)return (x.rank||99)-(y.rank||99);return x.name.localeCompare(y.name);});
 var body;
 if(order.length<2){
   body='<div class="footbound" style="margin-top:14px">A head-to-head needs at least two candidate suppliers.</div>';
 } else {
   if(PVSL_H2H_A>=order.length||PVSL_H2H_A<0)PVSL_H2H_A=0;
   if(PVSL_H2H_B>=order.length||PVSL_H2H_B<0)PVSL_H2H_B=Math.min(1,order.length-1);
   if(PVSL_H2H_B===PVSL_H2H_A)PVSL_H2H_B=(PVSL_H2H_A+1)%order.length;
   var A=order[PVSL_H2H_A],B=order[PVSL_H2H_B];
   var xA=pvAssess(A,pvCandById(A.id),PVSL_INPUT||{}),xB=pvAssess(B,pvCandById(B.id),PVSL_INPUT||{});
   var h2cA=(typeof pvH2HCounts==='function')?pvH2HCounts(xA):{mustGap:0},h2cB=(typeof pvH2HCounts==='function')?pvH2HCounts(xB):{mustGap:0};
   var rankLbl=function(a){return (a.eligible&&a.rank!=null)?('#'+a.rank):', ';};
   var optsFor=function(sel){return order.map(function(x,i){return '<option value="'+i+'"'+(i===sel?' selected':'')+'>'+escD(rankLbl(x)+' '+x.name)+'</option>';}).join('');};
   var selStyle='font:600 12.5px var(--sans);color:var(--ink);background:var(--surface);border:1px solid var(--line2);border-radius:8px;padding:7px 10px;min-width:200px';
   var accentOf=function(i){return PVVENDOR_COLORS[i%PVVENDOR_COLORS.length];};
   var accentA=accentOf(PVSL_H2H_A),accentB=accentOf(PVSL_H2H_B);
   var fn=function(nm){return String(nm||'').split(' ')[0];};
   // per-requirement deltas
   var covA={},covB={};(A.coverage||[]).forEach(function(c){covA[c.requirementId]=c.score;});(B.coverage||[]).forEach(function(c){covB[c.requirementId]=c.score;});
   var reqs=(PVSL_INPUT&&PVSL_INPUT.requirements)||[];
   var per=reqs.map(function(r){var sa=covA[r.id]!=null?covA[r.id]:0,sb=covB[r.id]!=null?covB[r.id]:0;return {label:r.label,scoreA:pvRound(sa,2),scoreB:pvRound(sb,2),delta:pvRound(sa-sb,2)};});
   var fitDelta=pvRound(A.fitScore-B.fitScore,2),riskDelta=pvRound(A.riskScore-B.riskScore,2),compDelta=pvRound(A.compositeScore-B.compositeScore,2);
   var leadId=A.compositeScore>B.compositeScore?A.id:(B.compositeScore>A.compositeScore?B.id:null);
   var aLead=A.compositeScore>B.compositeScore,bLead=B.compositeScore>A.compositeScore;
   var winsA=per.filter(function(d){return d.delta>0;}).length,winsB=per.filter(function(d){return d.delta<0;}).length;
   // race-line, folds in the cut Market-structure "how close is the race"; segment counts dropped (they read off the quadrant)
   var elig=order.filter(function(a){return a.eligible;}),lead0=elig[0]||order[0],lead1=elig[1]||order[1];
   var gap=cd.leaderGap,clear=(gap!=null&&gap>=10)||elig.length<=1;
   var raceLbl=clear?'Clear leader':(cd.contenders>=3?'Broad field':'Close race');
   var raceText=clear
     ? '<b>'+escD(lead0.name)+'</b> leads the field by <b>'+escD(gap!=null?gap:', ')+'</b> composite, a decisive gap; the RFx largely confirms it.'
     : '#1 <b>'+escD(lead0.name)+'</b> leads #2 <b>'+escD(lead1?lead1.name:', ')+'</b> by just <b>'+escD(gap!=null?gap:', ')+'</b> composite'+(cd.contenders>=1?', <b>'+escD(cd.contenders)+'</b> within striking distance':'')+'. Price &amp; terms will decide it.';
   var raceLine='<div class="cdyn-race" style="'+(clear?'background:var(--blue-t);border-left:3px solid var(--navy)':'background:var(--emph-t);border-left:3px solid var(--emph)')+'"><span class="rk" style="color:'+(clear?'var(--navy)':'var(--emph)')+'">'+escD(raceLbl)+'</span><span>'+raceText+'</span></div>';
   var picker='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 14px"><span style="font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mut2)">Compare</span><select onchange="pvH2HPick(\'a\',this.value)" aria-label="First vendor" style="'+selStyle+'">'+optsFor(PVSL_H2H_A)+'</select><span style="font-size:11px;font-weight:700;color:var(--mut2)">vs</span><select onchange="pvH2HPick(\'b\',this.value)" aria-label="Second vendor" style="'+selStyle+'">'+optsFor(PVSL_H2H_B)+'</select></div>';
   // head-to-head summary band (folds in Fit/Risk delta + Leads-composite)
   var mid=aLead?'<div class="arrow" style="color:'+accentA+'">&#9668;</div><div class="lead">'+escD(fn(A.name))+' leads by</div><div class="amt" style="color:'+accentA+'">'+escD(Math.abs(compDelta))+'</div>'
     :bLead?'<div class="arrow" style="color:'+accentB+'">&#9658;</div><div class="lead">'+escD(fn(B.name))+' leads by</div><div class="amt" style="color:'+accentB+'">'+escD(Math.abs(compDelta))+'</div>'
     :'<div class="lead" style="margin-top:8px">Level on composite</div>';
   var h2hBand='<div class="cdyn-h2h"><div class="cdyn-side"><div class="nm"><span class="dot" style="background:'+accentA+'"></span>'+escD(A.name)+'</div><div class="comp" style="color:'+(aLead?accentA:'var(--mut)')+'">'+escD(A.compositeScore)+'</div><div class="cl">Composite</div></div><div class="cdyn-mid">'+mid+'</div><div class="cdyn-side"><div class="nm"><span class="dot" style="background:'+accentB+'"></span>'+escD(B.name)+'</div><div class="comp" style="color:'+(bLead?accentB:'var(--mut)')+'">'+escD(B.compositeScore)+'</div><div class="cl">Composite</div></div></div>';
   var fitSub=fitDelta>0?'<span style="color:'+accentA+';font-weight:700">'+escD(fn(A.name))+' +'+escD(fitDelta)+'</span>':fitDelta<0?'<span style="color:'+accentB+';font-weight:700">'+escD(fn(B.name))+' +'+escD(-fitDelta)+'</span>':'<span style="color:var(--mut2)">level</span>';
   var riskSub=Math.abs(riskDelta)<0.05?'<span style="color:var(--mut2);font-weight:700">&#8776; even ('+(riskDelta>0?'+':'')+escD(riskDelta)+')</span>':riskDelta<0?'<b>'+escD(fn(A.name))+' lower ('+escD(riskDelta)+')</b>':'<b>'+escD(fn(B.name))+' lower (+'+escD(riskDelta)+')</b>';
   var h2hSub='<div class="cdyn-sub"><span>Fit '+fitSub+'</span><span>Risk '+riskSub+'</span><span>Requirements won <b>'+escD(fn(A.name))+' '+winsA+'</b> &middot; <b>'+escD(fn(B.name))+' '+winsB+'</b></span><span>Must-have gaps <b>'+escD(fn(A.name))+' '+h2cA.mustGap+'</b> &middot; <b>'+escD(fn(B.name))+' '+h2cB.mustGap+'</b></span><span>Evidence <b>'+escD(xA.evidenceConfidence)+'</b> &middot; <b>'+escD(xB.evidenceConfidence)+'</b></span><span>Leads composite <b>'+escD(leadId?nameOf(leadId):'tie')+'</b></span></div>';
   // vendor cards, leader gets an outline + "Leads composite" ribbon
   var pillar=function(a,accent,isLead){
     var cand=pvCandById(a.id)||{};var at=(cand.deepDive&&cand.deepDive.attrs)||cand.attrs||{};
     var fin=(cand.financials&&cand.financials.revenue)?cand.financials.revenue:(at.financial||', ');
     var row=function(k,v){return '<div class="r"><span class="k">'+k+'</span><span class="v">'+escD(v)+'</span></div>';};
     var rib=isLead?'<span class="rib" style="background:'+accent+';color:#fff">Leads composite</span>':'<span class="rib" style="background:var(--surface);color:var(--mut2);border:1px solid var(--line2)">Runner-up</span>';
     return '<div class="cdyn-vc"'+(isLead?' style="border-color:'+accent+';box-shadow:0 0 0 1px '+accent+' inset"':'')+'><div class="cdyn-vc-h" style="background:'+accent+'14"><span class="dot" style="background:'+accent+'"></span><span class="nm">'+escD(a.name)+'</span>'+rib+'</div><div class="cdyn-kv"><div class="r"><span class="k">Fit / Risk</span><span class="v"><b>'+escD(a.fitScore)+'</b><small>/100</small> &middot; risk '+escD(a.riskScore)+'<small>/5</small></span></div>'+row('HQ',at.hq||', ')+row('Financials',fin)+row('Integration',at.integration||', ')+row('Contract',at.contractFlex||', ')+'</div></div>';
   };
   var cards='<div class="cdyn-cards">'+pillar(A,accentA,leadId===A.id)+pillar(B,accentB,leadId===B.id)+'</div>';
   // per-requirement CENTERED tornado (owner-approved): symmetric axis at 50%, each vendor owns its half, 
   // score + bar + a faint territory tint on its side; the requirement + delta sit on the centre axis; bar
   // length = size of the gap. Compact rows.
   var maxAbs=per.reduce(function(m,d){return Math.max(m,Math.abs(d.delta));},0)||1;
   var dvgRows=per.map(function(d){
     var aw=d.delta>0,bw=d.delta<0,w=Math.round(Math.abs(d.delta)/maxAbs*100);
     var dcol=aw?accentA:bw?accentB:'var(--mut2)';
     return '<div class="cdyn-trow" style="background:linear-gradient(90deg,'+accentA+'12,transparent 34%,transparent 66%,'+accentB+'12)">'
       +'<div class="cdyn-tsc l" style="color:'+accentA+'">'+escD(d.scoreA)+'</div>'
       +'<div class="cdyn-tbw l">'+(aw?'<div class="cdyn-tbar" style="width:'+w+'%;background:'+accentA+'"></div>':'')+'</div>'
       +'<div class="cdyn-tmid"><div class="nm">'+escD(d.label)+'</div><div class="dl" style="color:'+dcol+'">'+(d.delta>0?'+':'')+escD(d.delta)+'</div></div>'
       +'<div class="cdyn-tbw r">'+(bw?'<div class="cdyn-tbar" style="width:'+w+'%;background:'+accentB+'"></div>':'')+'</div>'
       +'<div class="cdyn-tsc r" style="color:'+accentB+'">'+escD(d.scoreB)+'</div></div>';
   }).join('');
   var cmpHd='<div class="cdyn-cmphd"><span class="t">Per-requirement, where each one wins</span><span class="lg"><span style="color:'+accentA+';font-weight:700">&#9668; '+escD(fn(A.name))+'</span> &nbsp; <span style="color:'+accentB+';font-weight:700">'+escD(fn(B.name))+' &#9658;</span></span></div>';
   var dvg='<div class="cdyn-dvg">'+dvgRows+'</div>';
   // HH (Marc): fold Risk difference + Commercial model in as CENTER-SPINE comparisons (category on the middle
   // axis, each vendor's read extends outward), matching the per-requirement tornado. Evidence confidence moves
   // to the very BOTTOM of the tab. The "Key tradeoff" advisory and the "Validation before the decision" chips
   // are removed.
   var sect=function(label,inner){return '<div style="margin-top:20px;border-top:1px solid var(--line);padding-top:15px"><div style="font:700 9px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--mut2);margin-bottom:12px">'+label+'</div>'+inner+'</div>';};
   var spineHd='<div class="cdyn-cmphd"><span class="t">Category on the spine, each vendor extends outward</span><span class="lg"><span style="color:'+accentA+';font-weight:700">&#9668; '+escD(fn(A.name))+'</span> &nbsp; <span style="color:'+accentB+';font-weight:700">'+escD(fn(B.name))+' &#9658;</span></span></div>';
   var spineRow=function(o){
     var bar=function(w,c,on){return on&&w>0?'<div style="height:11px;border-radius:3px;width:'+w+'%;background:'+c+'"></div>':'';};
     return '<div style="display:grid;grid-template-columns:104px 1fr 168px 1fr 104px;align-items:center;border-bottom:1px solid var(--line);background:linear-gradient(90deg,'+accentA+'10,transparent 32%,transparent 68%,'+accentB+'10)">'
       +'<div style="text-align:right;padding:7px 10px;font:700 11px var(--mono);line-height:1.25;color:'+o.lc+'">'+o.lLab+'</div>'
       +'<div style="height:13px;display:flex;align-items:center;justify-content:flex-end;padding-right:2px">'+bar(o.lw,o.lbar,o.lon)+'</div>'
       +'<div style="text-align:center;padding:6px 8px;border-left:1px solid var(--line);border-right:1px solid var(--line)"><div style="font-size:11.5px;font-weight:600;color:var(--ink);line-height:1.2">'+o.mid+'</div>'+(o.sub?'<div style="font:800 9.5px var(--mono);margin-top:2px;letter-spacing:.02em;color:'+(o.subc||'var(--mut2)')+'">'+o.sub+'</div>':'')+'</div>'
       +'<div style="height:13px;display:flex;align-items:center;justify-content:flex-start;padding-left:2px">'+bar(o.rw,o.rbar,o.ron)+'</div>'
       +'<div style="text-align:left;padding:7px 10px;font:700 11px var(--mono);line-height:1.25;color:'+o.rc+'">'+o.rLab+'</div>'
       +'</div>';
   };
   // Risk difference: keep Low/Moderate/High as the read; bar sits on the LOWER-risk (better) side, coloured by
   // that vendor; the level word itself is coloured by risk band (teal low, burnt-orange elevated, red critical).
   var rsev={Low:1,Moderate:2,High:3,Critical:4,Unknown:0};
   var band=function(l){return (typeof THEO_RISKBAND!=='undefined'&&THEO_RISKBAND[l])?THEO_RISKBAND[l].c:'var(--mut2)';};
   var rdimData=(typeof PVR2_RISK_DIMS!=='undefined'?PVR2_RISK_DIMS:[]).map(function(rd){var da=xA.dimensions.find(function(d){return d.id===rd[0];})||{},db=xB.dimensions.find(function(d){return d.id===rd[0];})||{};var la=pvR2ConcernToRisk(da.concern)||'Unknown',lb=pvR2ConcernToRisk(db.concern)||'Unknown';return {label:rd[1],la:la,lb:lb,sa:rsev[la]||0,sb:rsev[lb]||0};});
   var rMaxGap=rdimData.reduce(function(m,d){return Math.max(m,Math.abs(d.sa-d.sb));},0)||1;
   var riskRows=rdimData.map(function(d){var aLower=d.sa>0&&d.sb>0&&d.sa<d.sb,bLower=d.sa>0&&d.sb>0&&d.sb<d.sa;var gap=Math.abs(d.sa-d.sb),w=Math.round(gap/rMaxGap*100);var sub=(d.sa===0||d.sb===0)?'':(gap===0?'even':gap+(gap===1?' band lower':' bands lower'));var subc=aLower?accentA:bLower?accentB:'var(--mut2)';return spineRow({lLab:escD(d.la),lc:band(d.la),lw:w,lbar:accentA,lon:aLower,mid:escD(d.label),sub:sub,subc:subc,rw:w,rbar:accentB,ron:bLower,rLab:escD(d.lb),rc:band(d.lb)});}).join('');
   var riskSect=sect('Risk difference',spineHd+'<div class="cdyn-dvg">'+riskRows+'</div>');
   // Commercial model: same center-spine; keep each driver's variability read, bar length = exposure, colour = variability.
   var cwidth=function(v){return /high|significant/i.test(v)?92:/exposure/i.test(v)?68:/moderate/i.test(v)?52:28;};
   var cdA={},cdB={},cOrder=[];
   (xA.commercialDrivers||[]).forEach(function(d){cdA[d.driver]=d;if(cOrder.indexOf(d.driver)<0)cOrder.push(d.driver);});
   (xB.commercialDrivers||[]).forEach(function(d){cdB[d.driver]=d;if(cOrder.indexOf(d.driver)<0)cOrder.push(d.driver);});
   var commRows=cOrder.map(function(name){var a=cdA[name],b=cdB[name];var va=a?a.variability:'',vb=b?b.variability:'';var ca=a?pvDD2VarColor(va):'var(--mut2)',cb=b?pvDD2VarColor(vb):'var(--mut2)';return spineRow({lLab:a?escD(va):'Not on file',lc:ca,lw:a?cwidth(va):0,lbar:ca,lon:!!a,mid:escD(name),sub:'',rw:b?cwidth(vb):0,rbar:cb,ron:!!b,rLab:b?escD(vb):'Not on file',rc:cb});}).join('');
   var commSect=cOrder.length?sect('Commercial model',spineHd+'<div class="cdyn-dvg">'+commRows+'</div>'):'';
   var evSect=sect('Evidence confidence','<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px"><div><div style="font-size:12px;font-weight:700;color:'+accentA+';margin-bottom:8px">'+escD(A.name)+'</div>'+pvEvidCoverageBar(xA.evidenceCoverage)+'</div><div><div style="font-size:12px;font-weight:700;color:'+accentB+';margin-bottom:8px">'+escD(B.name)+'</div>'+pvEvidCoverageBar(xB.evidenceCoverage)+'</div></div>');
   body=raceLine+picker+h2hBand+h2hSub+cards+cmpHd+dvg+riskSect+commSect+evSect;
 }
 return '<div class="sa-card">'+
   '<div class="card-hd"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="ct">Competitive Dynamics &amp; Head-to-Head</span></div>'+
   '<div class="scc-b">'+body+
   '</div></div>';
}

/* ---- ③ Requirements heatmap (Pass B): categories (rows) x vendors (cols), collapsible to
   sub-requirements, weighted-average row, band legend, leaders narrative, searchable, and a
   click-a-vendor per-category rationale rendered INLINE below (reuses deepDive.reqNarr). ---- */
function pvHeatmapHtml(refl,opts){
 var inDeep=!!(opts&&opts.inDeep); // #3/#4 (Marc): in the Deep Dive Requirements Fit sub-subtab, hide the cross-supplier leaders narrative and move the data-source (i) onto the title
 var L=refl.landscape,hm=L.heatmap;
 var input=PVSL_INPUT||{};
 var reqs=input.requirements||[];
 if(!reqs.length){return '<div class="sa-card"><div class="scc-b">No requirement model supplied.</div></div>';}
 var ordered=L.assessments.slice().sort(function(x,y){if(x.eligible!==y.eligible)return x.eligible?-1:1;if(x.eligible)return (x.rank||99)-(y.rank||99);return x.name.localeCompare(y.name);});
 if(PVSL_HM_VEND&&!ordered.some(function(a){return a.id===PVSL_HM_VEND;}))PVSL_HM_VEND=null;
 // round-4 (Marc): on first render, default the top prospect selected (rationale shown, expanded) and the top category open.
 if(!PVSL_HM_INIT){PVSL_HM_INIT=true;var pvTopHm=ordered.filter(function(a){return a.eligible;})[0];if(pvTopHm){PVSL_HM_VEND=pvTopHm.id;PVSL_HM_RAT=true;}if(reqs[0])PVSL_HM_EXP[reqs[0].id]=true;}
 var covOf={},candOf={};
 ordered.forEach(function(a){var m={};(a.coverage||[]).forEach(function(c){m[c.requirementId]=c;});covOf[a.id]=m;candOf[a.id]=pvCandById(a.id);});
 var wOf={};(ordered[0]?ordered[0].coverage:[]).forEach(function(c){wOf[c.requirementId]=c.weight;});
 var q=PVSL_HM_Q.trim().toLowerCase();
 var searchOf=function(r){return (r.label+' '+(r.subs||[]).map(function(s){return s.label;}).join(' ')).toLowerCase();};
 var nCols=ordered.length;
 // vendor column headers (clickable → active vendor rationale below)
 var vhead=ordered.map(function(a){
   var on=PVSL_HM_VEND===a.id;
   return '<th class="hmvcol'+(on?' on hmv-on':'')+'" style="border-top:3px solid '+pvSupColor(a)+'" onclick="pvHmVend(\''+escD(a.id)+'\')">'+(a.eligible?'<span class="rankpill head">'+escD(a.rank)+'</span>':'<span class="rankpill">-</span>')+'<span class="hmvname">'+escD(a.name)+'</span></th>'; // #1 (Marc): per-supplier identity colour on each vendor column header
 }).join('');
 // category rows (+ sub-requirement rows when expanded)
 var rowsHtml=reqs.map(function(r){
   var sstr=searchOf(r);var hide=!!(q&&sstr.indexOf(q)<0);
   var exp=!!PVSL_HM_EXP[r.id];
   var wpct=wOf[r.id]!=null?pvPct100(wOf[r.id]):', ';
   var catcell='<td class="cat"><button class="catbtn'+(exp?' on':'')+'" onclick="pvHmToggleCat(\''+escD(r.id)+'\')"><svg class="catcaret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg><span class="catrow"><span class="catname">'+escD(r.label)+'</span><span class="catmeta">Weight '+escD(wpct)+'</span></span></button></td>';
   var vcells=ordered.map(function(a){
     var c=covOf[a.id][r.id];var sc=c?c.score:0;var lead=hm.leaders[r.id]===a.id&&a.eligible;var von=PVSL_HM_VEND===a.id;
     return '<td class="'+(von?'hmv-on':'')+'"><span class="hcell'+(lead?' lead':'')+'" style="'+pvHmRamp(sc)+'" onclick="pvHmVend(\''+escD(a.id)+'\')" title="'+escD(a.name+' · '+r.label+' · '+sc+'/5'+(lead?' · leads this category':''))+'">'+escD(sc)+'</span></td>';
   }).join('');
   var avg=hm.averages[r.id]!=null?hm.averages[r.id]:0;
   var catRow='<tr data-cat="'+escD(r.id)+'" data-search="'+escD(sstr)+'"'+(hide?' class="hmhide"':'')+'>'+catcell+vcells+'<td><span class="hcell" style="'+pvHmRamp(avg)+'" title="Eligible field average · '+escD(avg)+'/5">'+escD(avg)+'</span></td></tr>';
   var subRows='';
   if(exp){
     subRows=(r.subs||[]).map(function(sub){
       var subCells=ordered.map(function(a){var cand=candOf[a.id];var v=(cand&&cand.subFit&&cand.subFit[r.id])?cand.subFit[r.id][sub.id]:null;var von=PVSL_HM_VEND===a.id;return '<td class="'+(von?'hmv-on':'')+'"><span class="hcell sub" style="'+(v==null?'background:var(--bg);color:var(--mut2)':pvHmRamp(v))+'" title="'+escD(a.name+' · '+sub.label+' · '+(v==null?'not scored':v+'/5'))+'">'+(v==null?'&ndash;':escD(v))+'</span></td>';}).join('');
       var vals=ordered.filter(function(a){return a.eligible;}).map(function(a){var cand=candOf[a.id];return (cand&&cand.subFit&&cand.subFit[r.id])?cand.subFit[r.id][sub.id]:null;}).filter(function(v){return v!=null;});
       var savg=vals.length?pvRound(vals.reduce(function(s,v){return s+v;},0)/vals.length,2):null;
       var savgcell='<td>'+(savg==null?'<span class="hcell sub" style="background:var(--bg);color:var(--mut2)">&ndash;</span>':'<span class="hcell sub" style="'+pvHmRamp(savg)+'">'+escD(savg)+'</span>')+'</td>';
       var mustBadge=sub.must?' <span style="font:700 7.5px var(--mono);text-transform:uppercase;letter-spacing:.03em;color:var(--riskred);background:var(--ti-red);border-radius:20px;padding:1px 6px;vertical-align:1px">Must</span>':'';
       return '<tr class="subrow'+(hide?' hmhide':'')+'" data-search="'+escD(sstr)+'"><td class="cat">'+escD(sub.label)+mustBadge+'</td>'+subCells+savgcell+'</tr>';
     }).join('');
   }
   return catRow+subRows;
 }).join('');
 // weighted-average row = each vendor's overall weighted fit across all six categories
 var eligFits=ordered.filter(function(a){return a.eligible;}).map(function(a){return a.fitScore/20;});
 var overallAvg=eligFits.length?pvRound(eligFits.reduce(function(s,v){return s+v;},0)/eligFits.length,2):0;
 var footCells=ordered.map(function(a){var f5=pvRound(a.fitScore/20,1);var von=PVSL_HM_VEND===a.id;return '<td class="'+(von?'hmv-on':'')+'"><span class="hcell" style="'+pvHmRamp(f5)+'">'+escD(f5)+'</span></td>';}).join('');
 var footRow='<tr class="avgrow"><td class="cat"><b>Weighted fit, all categories</b></td>'+footCells+'<td><span class="hcell" style="'+pvHmRamp(overallAvg)+'">'+escD(overallAvg)+'</span></td></tr>';
 // "who leads which category" narrative
 var byLeader={},nameById={};ordered.forEach(function(a){nameById[a.id]=a.name;});
 reqs.forEach(function(r){var lid=hm.leaders[r.id];if(lid==null)return;(byLeader[lid]=byLeader[lid]||[]).push(r.label);});
 // #2 (Marc): reformat "who leads which category" as a cross-cutting read (mirrors the Risk Assessment subtab's
 // top read), a synthesized narrative + the "no vendor sweeps" insight, instead of a semicolon run-on sentence.
 var nLeaders=Object.keys(byLeader).length,nCats=0;reqs.forEach(function(r){if(hm.leaders[r.id]!=null)nCats++;});
 var leadPhrases=Object.keys(byLeader).map(function(lid){return '<b>'+escD(nameById[lid]||lid)+'</b> on '+escD(byLeader[lid].join(' and '));});
 var topLid=Object.keys(byLeader).sort(function(x,y){return byLeader[y].length-byLeader[x].length;})[0];
 var topN=topLid?byLeader[topLid].length:0;
 var leadInsight=(topN>=2)?(' <b>'+escD(nameById[topLid])+'</b> leads the most ('+topN+' of '+nCats+'), no single vendor sweeps the field, so the choice trades one strength against another.'):(' No single vendor sweeps the field, so the choice trades one category strength against another.');
 var leadNarr=inDeep?'':('<div class="hmlead"><b>Category leadership.</b> '+(nLeaders?('Across the '+nCats+' scored categories, leadership splits '+nLeaders+' ways, '+leadPhrases.join('; ')+'.'+leadInsight):'No eligible leader in the field.')+'</div>'); // stays on the standalone Requirements Heatmap subtab, suppressed in the Deep Dive Requirements Fit sub-subtab
 // ---- Field read: G7 differentiation-vs-parity + G3 market-gap, computed from the eligible field's own
 // scores (no new data). Differentiators = high per-category spread (where the choice is made); parity =
 // low spread (don't over-weight); thinnest coverage = the sub-requirements the whole field is weakest on. ----
 var elig=ordered.filter(function(a){return a.eligible;});
 var GAP=3.5;
 var catStats=reqs.map(function(r){
   var vals=elig.map(function(a){var c=covOf[a.id][r.id];return c?c.score:null;}).filter(function(v){return v!=null;});
   var mx=vals.length?Math.max.apply(null,vals):0,mn=vals.length?Math.min.apply(null,vals):0;
   return {label:r.label,spread:pvRound(mx-mn,1)};
 });
 var diffCats=catStats.slice().sort(function(a,b){return b.spread-a.spread;}).filter(function(c){return c.spread>=1.0;}).slice(0,4);
 var parityCats=catStats.filter(function(c){return c.spread<=0.7;});
 var subMax=[];
 reqs.forEach(function(r){(r.subs||[]).forEach(function(sub){
   var vals=elig.map(function(a){var cand=candOf[a.id];return (cand&&cand.subFit&&cand.subFit[r.id])?cand.subFit[r.id][sub.id]:null;}).filter(function(v){return v!=null;});
   if(vals.length)subMax.push({label:sub.label,cat:r.label,max:pvRound(Math.max.apply(null,vals),1)});
 });});
 subMax.sort(function(a,b){return a.max-b.max;});
 var thin=subMax.slice(0,3),anyGap=thin.some(function(s){return s.max<GAP;});
 var frPill=function(txt,bg,fg){return '<span style="display:inline-block;font-size:11.5px;padding:3px 9px;border-radius:20px;background:'+bg+';color:'+fg+';margin:0 5px 6px 0;font-weight:600">'+txt+'</span>';};
 var frCol=function(t,body,note){return '<div style="flex:1;min-width:210px"><div style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2);margin-bottom:8px">'+t+'</div><div>'+body+'</div><div style="font-size:11px;color:var(--mut2);margin-top:5px;line-height:1.45">'+note+'</div></div>';};
 var frDiff=diffCats.length?diffCats.map(function(c){return frPill(escD(c.label)+' &nbsp;&Delta;'+c.spread,'var(--ti-blue)','#5C2B50');}).join(''):'<span style="font-size:12px;color:var(--mut2)">The field is tightly bunched across every category.</span>';
 var frPar=parityCats.length?parityCats.map(function(c){return frPill(escD(c.label),'var(--nested)','var(--mut)');}).join(''):'<span style="font-size:12px;color:var(--mut2)">No category is fully at parity.</span>';
 var frThin=thin.map(function(s){var g=s.max<GAP;return frPill(escD(s.cat)+' &middot; '+escD(s.label)+' &nbsp;max '+s.max,g?'var(--ti-amber)':'var(--nested)',g?'var(--amber-d)':'var(--mut)');}).join('');
 // G10 must-have watch, any eligible vendor trailing (below adequacy) on a tagged Must-Have requirement is a knockout risk.
 // STAGE Risk+Issues: replaces the old repetitive per-line warning list with a compact KNOCKOUT MATRIX,
 // rows = every must-have requirement, columns = only the at-risk vendors (eligible + trailing on any
 // must-have), red-shaded cells = that vendor's score below the 3.5 knockout threshold on that row.
 var mustSubs=[];reqs.forEach(function(r){(r.subs||[]).forEach(function(sub){if(sub.must)mustSubs.push({cat:r.label,sub:sub.label,catId:r.id,subId:sub.id});});});
 var mustNames=mustSubs.map(function(m){return escD(m.sub);}).join(', ');
 var mustRiskVendIds=[];elig.forEach(function(a){var cand=candOf[a.id];var trails=mustSubs.some(function(m){var v=(cand&&cand.subFit&&cand.subFit[m.catId])?cand.subFit[m.catId][m.subId]:null;return v!=null&&v<GAP;});if(trails)mustRiskVendIds.push(a.id);});
 var mustRiskVend=elig.filter(function(a){return mustRiskVendIds.indexOf(a.id)>=0;});
 var mustMatrix='';
 if(mustRiskVend.length){
   var mmHead=mustRiskVend.map(function(a){return '<th class="mmv" style="border-top:3px solid '+pvSupColor(a)+'">'+escD(a.name)+'</th>';}).join('');
   var mmRows=mustSubs.map(function(m){
     var cells=mustRiskVend.map(function(a){
       var cand=candOf[a.id];var v=(cand&&cand.subFit&&cand.subFit[m.catId])?cand.subFit[m.catId][m.subId]:null;
       var below=v!=null&&v<GAP;
       var style=v==null?'background:var(--bg);color:var(--mut2)':(below?'background:var(--pink-t);color:var(--riskred);font-weight:800':pvHmRamp(v));
       return '<td><span class="hcell sub" style="'+style+'" title="'+escD(a.name+' · '+m.sub+' · '+(v==null?'not scored':v+'/5')+(below?' · below the 3.5 knockout threshold':''))+'">'+(v==null?'&ndash;':escD(v))+'</span></td>';
     }).join('');
     return '<tr><td class="cat">'+escD(m.sub)+'<span class="mmcatlbl">'+escD(m.cat)+'</span></td>'+cells+'</tr>';
   }).join('');
   mustMatrix='<div class="mustmx"><div class="mustmx-hd">Knockout matrix <span class="mustmx-sub">&middot; must-have requirements &times; at-risk vendors, red = below the 3.5/5 knockout threshold</span></div><div style="overflow-x:auto"><table class="hmt mmt"><thead><tr><th class="cat">Must-have requirement</th>'+mmHead+'</tr></thead><tbody>'+mmRows+'</tbody></table></div></div>';
 } else if(mustSubs.length){
   mustMatrix='<div class="mustmx"><div class="mustmx-hd">Knockout matrix <span class="mustmx-sub">&middot; must-have requirements: '+mustNames+'</span></div><div class="mustmx-clear">Every eligible vendor clears all must-have requirements at 3.5+/5.</div></div>';
 }
 // #6 (Marc → Option B): plain-language read + a compact spread table (replaces the 3-column pill layout).
 var frJoin=function(arr){arr=arr.slice(0,3);if(arr.length<=1)return arr[0]||'';if(arr.length===2)return arr[0]+' and '+arr[1];return arr.slice(0,-1).join(', ')+' and '+arr[arr.length-1];};
 var frTopDiff=diffCats.slice(0,3).map(function(c){return c.label;});
 var frLede=(frTopDiff.length?('The choice is decided on <b>'+escD(frJoin(frTopDiff))+'</b>, the field spreads most there, so they carry the ranking.'):'The field is tightly bunched, so no single category clearly drives the ranking.')+
   (parityCats.length?(' '+parityCats.length+' categor'+(parityCats.length>1?'ies are':'y is')+' effectively tied and carry little signal.'):' No category is a wash, so nothing is safe to ignore outright.')+
   (thin.length?(' <span class="fr-warn">Watch:</span> the field&rsquo;s thinnest area is '+escD(thin[0].cat)+' &middot; '+escD(thin[0].label)+' (max '+escD(thin[0].max)+')'+(mustSubs.length?(', and '+mustSubs.length+' must-have'+(mustSubs.length>1?'s':'')+' can knock a vendor out.'):'.')):'');
 var frCatSorted=catStats.slice().sort(function(a,b){return b.spread-a.spread;});
 var frTable='<div style="overflow-x:auto"><table class="frtbl"><thead><tr><th>Requirement category</th><th class="num">Spread &Delta;</th><th>Role in the decision</th></tr></thead><tbody>'+frCatSorted.map(function(c){var role=c.spread>=1.0?'Differentiator':(c.spread<=0.7?'At parity':'Moderate signal');var cls=c.spread>=1.0?'d':(c.spread<=0.7?'p':'m');return '<tr><td>'+escD(c.label)+'</td><td class="num"><span class="frdv">&Delta;'+escD(c.spread)+'</span></td><td><span class="frrole '+cls+'">'+role+'</span></td></tr>';}).join('')+'</tbody></table></div>';
 // Heatmap+Risk stage: condensed into a right-hand column (was a separate stacked sa-card) that sits
 // beside the rationale accordion via the shared .recwrap grid, an eyebrow label instead of a full card-hd
 // so it reads as part of the same card, not a nested card.
 var fieldRead='<div class="frcol"><div class="frcol-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg><span>Where the decision is made</span></div><p class="fr-lede">'+frLede+'</p>'+frTable+mustMatrix+'</div>';
 // legend, single blue hue graded by score (design handoff): darker = stronger fit
 var legend='<div class="hmramp"><span>Lower</span><span class="ramp"></span><span>Higher</span><span class="rsc">5-pt fit scale &middot; darker = stronger</span></div>';
 var table='<div style="overflow-x:auto"><table class="hmt" id="pvhm-table"><thead><tr><th class="cat">Requirement category</th>'+vhead+'<th>Field avg</th></tr></thead><tbody>'+rowsHtml+'</tbody><tfoot>'+footRow+'</tfoot></table></div>';
 var rationale=pvHmRationaleHtml(ordered,reqs,covOf,candOf,hm);
 // #3 (Marc): in the Deep Dive Requirements Fit sub-subtab the explanatory paragraph is dropped; its data-source (i) moves here, to the right of the title.
 var titleInfo=inDeep?(' '+infoHover('Landscape is a no-contact market scan: scores are Theo&rsquo;s estimate from public sources, analyst positions and internal history, the supplier is never asked. When an RFx is issued, its heatmap supersedes this with the vendor&rsquo;s own submitted evidence.',{aria:'Landscape vs RFx requirements data source'})):'';
 // Heatmap+Risk stage: rationale accordion LEFT, "Where the decision is made" RIGHT, via the shared
 // .recwrap grid (1.4fr/1fr, collapses to a single column under 1100px).
 return '<div class="sa-card">'+
   '<div class="card-hd"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg><span class="ct">Requirements Heatmap</span>'+titleInfo+'</div>'+
   '<div class="scc-b">'+leadNarr+table+legend+'<div class="recwrap">'+'<div>'+rationale+'</div><div>'+fieldRead+'</div>'+'</div>'+
   '</div></div>';
}
/* click-a-vendor rationale for the heatmap, reuses the SAME deepDive.reqNarr as the Deep Dive
   Requirements Analysis (authored once, not duplicated); drills to sub-req scores when expanded. */
function pvHmRationaleHtml(ordered,reqs,covOf,candOf,hm){
 var id=PVSL_HM_VEND;if(!id)return '';
 var a=ordered.find(function(x){return x.id===id;});var cand=candOf[id]||pvCandById(id);
 if(!a||!cand)return '';
 // Pass 2B: start COLLAPSED, after a vendor column is clicked, show a compact header the user expands.
 var open=PVSL_HM_RAT;
 var ratbar='<div class="ratbar'+(open?' on':'')+'" onclick="pvHmRatToggle()"><svg class="ratcaret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg><span class="ratlbl"><b>'+escD(a.name)+'</b> &middot; per-category scoring rationale</span><span class="ratx">'+(open?'Hide &#9652;':'Show every sub-requirement &#9662;')+'</span></div>';
 if(!open)return ratbar;
 // Heatmap+Risk stage: single-open accordion, only PVSL_HM_RAT_CAT's narrative + sub-table render;
 // every other category shows just a clickable header row. Default-open the first/top category.
 if(PVSL_HM_RAT_CAT==null||!reqs.some(function(r){return r.id===PVSL_HM_RAT_CAT;}))PVSL_HM_RAT_CAT=reqs[0]?reqs[0].id:null;
 var acc=pvSupColor(a); // #5 (Marc → Option A): supplier colour drives the aligned score bars
 var narr=(cand.deepDive&&cand.deepDive.reqNarr)||{};
 var subnarr=(cand.deepDive&&cand.deepDive.reqSubNarr)||{};
 var rows=reqs.map(function(r){
   var c=covOf[id][r.id];var sc=c?c.score:0;var lead=hm.leaders[r.id]===id&&a.eligible;
   var cov=pvCoverPct(cand,r);
   var covchip=cov?'<span class="vratchip" title="Share of this category\'s sub-requirements scored at/above the 3.5/5 bar. This is a pass-rate, distinct from evidence coverage and from the weighted fit score.">meets bar <b>'+escD(cov.pct)+'%</b> ('+escD(cov.met)+'/'+escD(cov.total)+' &ge;3.5)</span>':'';
   var catOpen=(PVSL_HM_RAT_CAT===r.id);
   var body='';
   if(catOpen){
     var sub='';
     if(cand.subFit&&cand.subFit[r.id]){
       var sm=subnarr[r.id]||{};
       // #5 (Marc → Option A): aligned score-bar table, sub-req name | score bar + number (lined up) | note.
       sub='<div class="vratsub"><table class="hmrat-tbl"><tbody>'+(r.subs||[]).map(function(s){var v=cand.subFit[r.id][s.id];var sn=sm[s.id]||'';var w=(v==null?0:Math.max(0,Math.min(100,v/5*100)));return '<tr><td class="hmrat-sub">'+escD(s.label)+'</td><td class="hmrat-barcell"><span class="hmrat-bar"><i style="width:'+w+'%"></i></span><span class="hmrat-scv">'+(v==null?'&ndash;':escD(v))+'</span></td><td class="hmrat-nt">'+escD(sn)+'</td></tr>';}).join('')+'</tbody></table></div>';
     }
     body='<div class="vratnar">'+escD(narr[r.id]||'No category rationale on file.')+'</div>'+sub;
   }
   return '<div class="vratrow'+(catOpen?' on':'')+'"><div class="vrathd'+(catOpen?' on':'')+'" onclick="pvHmRatCatToggle(\''+escD(r.id)+'\')"><svg class="catcaret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg><span class="hcell" style="'+pvHmRamp(sc)+'">'+escD(sc)+'</span><span class="vratlbl">'+escD(r.label)+'</span>'+(lead?' <span class="flag inc" style="margin:0">leads</span>':'')+covchip+'</div>'+body+'</div>';
 }).join('');
 return '<div class="vratp" style="--hmacc:'+acc+'">'+ratbar+'<div class="vrpb">'+rows+'</div></div>';
}

/* flags rendered as ICONS with hover (Pass B): soft = amber triangle, hard = red octagon */
function pvFlagIcons(a){
 var hard=(a.disqualifiers||[]).map(function(f){return '<span class="flagicon hard" title="'+escD((f.code||'FLAG')+', '+(f.detail||''))+'"><svg viewBox="0 0 24 24"><polygon points="8 2 16 2 22 8 22 16 16 22 8 22 2 16 2 8"/><path d="M12 8v4M12 16h.01"/></svg></span>';}).join('');
 var soft=(a.softFlags||[]).map(function(f){return '<span class="flagicon soft" title="'+escD((f.code||'FLAG')+', '+(f.detail||''))+'"><svg viewBox="0 0 24 24"><path d="M12 2l10 18H2z"/><path d="M12 9v5M12 17h.01"/></svg></span>';}).join('');
 var all=hard+soft;
 return all||'<span class="flagnone" title="No flags recorded">&ndash;</span>';
}
/* ---- ④ Risk assessment (Pass B): per-vendor × 5-dimension rollup (vendors = rows, the format
   Marc likes), each dimension header expandable to its sub-factor columns, contained/elevated
   legend, flag icons + hover, cross-cutting narrative, and click-a-vendor rationale INLINE below
   (reuses each candidate's riskNarr). ---- */
function pvRiskHtml(refl){
 var L=refl.landscape;var input=PVSL_INPUT||{};
 var dims=input.riskDimensions||[];
 if(!dims.length){return '<div class="sa-card"><div class="scc-b">No risk model supplied.</div></div>';}
 var riskHigh=(input.segmentation&&input.segmentation.riskHigh!=null)?input.segmentation.riskHigh:2.5;
 // Pass 2B: axes SWAPPED to match the Requirements heatmap, risk DIMENSIONS run down the left (rows),
 // SUPPLIERS run across the top (columns). Suppliers ordered lowest weighted risk first.
 var ordered=L.assessments.slice().sort(function(x,y){if(x.eligible!==y.eligible)return x.eligible?-1:1;return x.riskScore-y.riskScore||x.name.localeCompare(y.name);});
 if(PVSL_RK_VEND&&!ordered.some(function(a){return a.id===PVSL_RK_VEND;}))PVSL_RK_VEND=null;
 // round-4 (Marc): on first render, default the top prospect selected (rationale shown, expanded) and the top dimension open.
 if(!PVSL_RK_INIT){PVSL_RK_INIT=true;var pvTopRk=ordered.filter(function(a){return a.eligible;})[0];if(pvTopRk){PVSL_RK_VEND=pvTopRk.id;PVSL_RK_RAT=true;}if(dims[0])PVSL_RK_EXP[dims[0].id]=true;}
 var candOf={};ordered.forEach(function(a){var cn=pvCandById(a.id);candOf[a.id]=cn;if(cn){if(!cn.risk)cn.risk={};if(cn.risk.esg==null&&PVSL_ESG[cn.id]!=null)cn.risk.esg=PVSL_ESG[cn.id];if(!cn.riskNarr)cn.riskNarr={};if(!cn.riskNarr.esg)cn.riskNarr.esg=PVSL_ESG_NARR[cn.id]||'ESG & regulatory posture, external read; confirm in due diligence.';}});
 // vendor column headers (clickable → that vendor's per-dimension rationale below); reuses the heatmap column classes
 var vhead=ordered.map(function(a){
   var on=PVSL_RK_VEND===a.id;
   return '<th class="hmvcol'+(on?' on hmv-on':'')+'" style="border-top:3px solid '+pvSupColor(a)+'" onclick="pvRkVend(\''+escD(a.id)+'\')" title="Click to show '+escD(a.name)+' per-dimension risk rationale below">'+(a.eligible?'<span class="rankpill head">'+escD(a.rank)+'</span>':'<span class="rankpill">-</span>')+'<span class="hmvname">'+escD(a.name)+'</span></th>'; // #1 (Marc): per-supplier identity colour on each vendor column header
 }).join('');
 // dimension rows (+ sub-factor rows when a dimension is expanded)
 var rowsHtml=dims.map(function(d){
   var exp=!!PVSL_RK_EXP[d.id];
   var dimcell='<td class="cat"><button class="catbtn'+(exp?' on':'')+'" onclick="pvRkToggle(\''+escD(d.id)+'\')"><svg class="catcaret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg><span><span class="catname">'+escD(d.label)+'</span></span></button></td>';
   var vcells=ordered.map(function(a){
     var cand=candOf[a.id];var sc=(cand&&cand.risk&&cand.risk[d.id]!=null)?cand.risk[d.id]:null;var von=PVSL_RK_VEND===a.id;
     return '<td class="'+(von?'hmv-on':'')+'">'+(sc==null?'<span class="rcell" style="background:var(--bg);color:var(--mut2)" title="not scored">&ndash;</span>':'<span class="rcell" style="'+pvRiskBg(sc)+'" onclick="pvRkVend(\''+escD(a.id)+'\')" title="'+escD(a.name+' · '+d.label+' · '+sc+'/5')+'">'+escD(sc)+'</span>')+'</td>';
   }).join('');
   var vals=ordered.filter(function(a){return a.eligible;}).map(function(a){var c=candOf[a.id];return (c&&c.risk&&c.risk[d.id]!=null)?c.risk[d.id]:null;}).filter(function(v){return v!=null;});
   var avg=vals.length?pvRound(vals.reduce(function(s,v){return s+v;},0)/vals.length,2):null;
   var avgcell='<td>'+(avg==null?'<span class="rcell sub" style="background:var(--bg);color:var(--mut2)">&ndash;</span>':'<span class="rcell sub" style="'+pvRiskBgSub(avg)+'" title="Eligible field average · '+escD(avg)+'/5">'+escD(avg)+'</span>')+'</td>';
   var dimRow='<tr>'+dimcell+vcells+avgcell+'</tr>';
   var subRows='';
   if(exp){
     subRows=(d.subs||[]).map(function(sf){
       var subCells=ordered.map(function(a){var cand=candOf[a.id];var v=(cand&&cand.riskSub&&cand.riskSub[d.id])?cand.riskSub[d.id][sf.id]:null;var von=PVSL_RK_VEND===a.id;return '<td class="'+(von?'hmv-on':'')+'">'+(v==null?'<span class="rcell sub" style="background:var(--bg);color:var(--mut2)">&ndash;</span>':'<span class="rcell sub" style="'+pvRiskBgSub(v)+'" title="'+escD(a.name+' · '+sf.label+' · '+v+'/5')+'">'+escD(v)+'</span>')+'</td>';}).join('');
       var svals=ordered.filter(function(a){return a.eligible;}).map(function(a){var c=candOf[a.id];return (c&&c.riskSub&&c.riskSub[d.id])?c.riskSub[d.id][sf.id]:null;}).filter(function(v){return v!=null;});
       var savg=svals.length?pvRound(svals.reduce(function(s,v){return s+v;},0)/svals.length,2):null;
       var savgcell='<td>'+(savg==null?'<span class="rcell sub" style="background:var(--bg);color:var(--mut2)">&ndash;</span>':'<span class="rcell sub" style="'+pvRiskBgSub(savg)+'">'+escD(savg)+'</span>')+'</td>';
       return '<tr class="subrow"><td class="cat">'+escD(sf.label)+'</td>'+subCells+savgcell+'</tr>';
     }).join('');
   }
   return dimRow+subRows;
 }).join('');
 // summary rows: each vendor's weighted risk + contained/elevated band + flags (mirrors the heatmap weighted-fit row)
 var wvals=ordered.filter(function(a){return a.eligible;}).map(function(a){return a.riskScore;});
 var wavg=wvals.length?pvRound(wvals.reduce(function(s,v){return s+v;},0)/wvals.length,2):null;
 var wCells=ordered.map(function(a){var von=PVSL_RK_VEND===a.id;return '<td class="'+(von?'hmv-on':'')+'"><span class="rcell" style="'+pvRiskBg(a.riskScore)+'" title="'+escD(a.name+' · weighted risk '+a.riskScore+'/5')+'">'+escD(a.riskScore)+'</span></td>';}).join('');
 var wRow='<tr class="avgrow"><td class="cat"><b>Weighted risk, all dimensions</b></td>'+wCells+'<td>'+(wavg==null?'':'<span class="rcell sub" style="'+pvRiskBgSub(wavg)+'">'+escD(wavg)+'</span>')+'</td></tr>';
 var bandCells=ordered.map(function(a){var elevated=a.riskScore>=riskHigh;return '<td><span class="band '+(elevated?'elevated':'contained')+'" title="'+(elevated?'Elevated, at/above '+escD(riskHigh)+'/5; attach conditions before award':'Contained, below '+escD(riskHigh)+'/5; managed')+'">'+(elevated?'elevated':'contained')+'</span></td>';}).join('');
 var bandRow='<tr class="metarow"><td class="cat">Band</td>'+bandCells+'<td></td></tr>';
 var flagCells=ordered.map(function(a){return '<td>'+pvFlagIcons(a)+'</td>';}).join('');
 var flagRow='<tr class="metarow"><td class="cat">Flags</td>'+flagCells+'<td></td></tr>';
 // round-3 (E10/E11): integrated red ramp + contained/elevated + soft/hard-flag legend, folded into the
 // visualization the way the Requirements heatmap does it (was a standalone contained/elevated text block).
 // round-4 (Marc): match the Requirements-heatmap legend, one clean ramp line. The contained/elevated + soft/hard-flag
 // definitions move into tooltips on the Band chips and Flag icons (spread into cell affordances, not a legend block).
 var legend='<div class="rkramp"><span>Lower risk</span><span class="rrampbar"></span><span>Higher risk</span><span class="rkrsc">0-5 scale &middot; deeper red = worse</span></div>';
 // cross-cutting narrative (data-driven, reflect-only), computed from THIS project's field so it fits any domain
 var elevN=ordered.filter(function(a){return a.riskScore>=riskHigh;});
 var flaggedN=ordered.filter(function(a){return (a.softFlags||[]).length||(a.disqualifiers||[]).length;});
 var eligR=ordered.filter(function(a){return a.eligible;});
 // strongest / weakest financial stability by name (lower financial-risk score = stronger)
 var finPairs=eligR.map(function(a){var c=candOf[a.id];var v=(c&&c.risk&&c.risk.financial!=null)?c.risk.financial:null;return {name:a.name,v:v};}).filter(function(x){return x.v!=null;});
 var finLine='';
 if(finPairs.length>=2){var fs=finPairs.slice().sort(function(x,y){return x.v-y.v;});finLine=' Financial stability reads on an externally-sourced basis (credible public sources · not validated), strongest for '+escD(fs[0].name)+' and thinnest for '+escD(fs[fs.length-1].name)+'.';}
 else if(finPairs.length===1){finLine=' Financial stability reads on an externally-sourced basis (credible public sources · not validated).';}
 // the field-wide structural risk = the risk dimension with the highest eligible-field average
 var dimAvg=dims.map(function(d){var vals=eligR.map(function(a){var c=candOf[a.id];return (c&&c.risk&&c.risk[d.id]!=null)?c.risk[d.id]:null;}).filter(function(v){return v!=null;});return {label:d.label,avg:vals.length?vals.reduce(function(s,v){return s+v;},0)/vals.length:0};});
 var topDim=dimAvg.slice().sort(function(x,y){return y.avg-x.avg;})[0];
 var structLine=(topDim&&topDim.avg>0)?(' '+escD(topDim.label)+' is the risk to weigh most across the field, while support &amp; SLA depth is the common item to validate in the schedule.'):'';
 var cc='<div class="crosscut"><b>Cross-cutting read.</b> Weighted risk is contained for '+(ordered.length-elevN.length)+' of '+ordered.length+' candidate'+(ordered.length===1?'':'s')+(elevN.length?('; '+elevN.map(function(a){return escD(a.name);}).join(', ')+' carr'+(elevN.length===1?'ies':'y')+' elevated risk'):'')+'.'+finLine+structLine+(flaggedN.length?(' '+flaggedN.map(function(a){return escD(a.name);}).join(', ')+' carr'+(flaggedN.length===1?'ies':'y')+' an open flag routed for review.'):'')+'</div>';
 var rationale=pvRkRationaleHtml(ordered,dims,candOf);
 var posture=PVSL_RK_VEND?pvRiskPostureHtml(ordered.find(function(x){return x.id===PVSL_RK_VEND;}),candOf[PVSL_RK_VEND]):''; // #2: per-selected-vendor risk posture band
 var table='<div style="overflow-x:auto"><table class="hmt rkt" id="pvrk-table"><thead><tr><th class="cat">Risk dimension</th>'+vhead+'<th>Field avg</th></tr></thead><tbody>'+rowsHtml+'</tbody><tfoot>'+wRow+bandRow+flagRow+'</tfoot></table></div>';
 // Heatmap+Risk stage: rationale accordion LEFT, risk-posture band RIGHT (were stacked full-width before), via
 // the shared .recwrap grid (mirrors the Requirements Heatmap layout).
 return '<div class="sa-card">'+
   '<div class="card-hd"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/></svg><span class="ct">Risk Assessment</span></div>'+
   '<div class="scc-b">'+cc+table+legend+'<div class="recwrap">'+'<div>'+rationale+'</div><div>'+posture+'</div>'+'</div>'+
   '</div></div>';
}
/* click-a-vendor risk rationale, reuses each candidate's authored riskNarr (not re-authored) */
function pvRkRationaleHtml(ordered,dims,candOf){
 var id=PVSL_RK_VEND;if(!id)return '';
 var a=ordered.find(function(x){return x.id===id;});var cand=candOf[id]||pvCandById(id);
 if(!a||!cand)return '';
 // Pass 2B: start COLLAPSED, after a vendor column is clicked, show a compact header the user expands.
 var open=PVSL_RK_RAT;
 var ratbar='<div class="ratbar'+(open?' on':'')+'" onclick="pvRkRatToggle()"><svg class="ratcaret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg><span class="ratlbl"><b>'+escD(a.name)+'</b> &middot; per-dimension risk rationale</span><span class="ratx">'+(open?'Hide &#9652;':'Show every sub-factor &#9662;')+'</span></div>';
 if(!open)return ratbar;
 // Heatmap+Risk stage: single-open accordion, only PVSL_RK_RAT_DIM's narrative + sub-table render;
 // every other dimension shows just a clickable header row. Default-open the first/top dimension.
 if(PVSL_RK_RAT_DIM==null||!dims.some(function(d){return d.id===PVSL_RK_RAT_DIM;}))PVSL_RK_RAT_DIM=dims[0]?dims[0].id:null;
 var narr=cand.riskNarr||{};
 var subnarr=cand.riskSubNarr||{};
 var rows=dims.map(function(d){
   var sc=(cand.risk&&cand.risk[d.id]!=null)?cand.risk[d.id]:null;
   var dimOpen=(PVSL_RK_RAT_DIM===d.id);
   var body='';
   if(dimOpen){
     var sub='';
     if(cand.riskSub&&cand.riskSub[d.id]){
       var sm=subnarr[d.id]||{};
       // #3 (Marc): same aligned score-bar table fix as the requirements rationale (Option A), but risk-coloured bars
       // (longer = more risk) and neutral score numbers, since these are risk sub-factor scores, not fit.
       sub='<div class="vratsub"><table class="hmrat-tbl risk"><tbody>'+(d.subs||[]).map(function(sf){var v=cand.riskSub[d.id][sf.id];var sn=sm[sf.id]||'';var w=(v==null?0:Math.max(0,Math.min(100,v/5*100)));return '<tr><td class="hmrat-sub">'+escD(sf.label)+'</td><td class="hmrat-barcell"><span class="hmrat-bar"><i style="width:'+w+'%"></i></span><span class="hmrat-scv">'+(v==null?'&ndash;':escD(v))+'</span></td><td class="hmrat-nt">'+escD(sn)+'</td></tr>';}).join('')+'</tbody></table></div>';
     }
     body='<div class="vratnar">'+escD(narr[d.id]||'No dimension rationale on file.')+'</div>'+sub;
   }
   return '<div class="vratrow'+(dimOpen?' on':'')+'"><div class="vrathd'+(dimOpen?' on':'')+'" onclick="pvRkRatDimToggle(\''+escD(d.id)+'\')"><svg class="catcaret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg><span class="rcell" style="'+(sc==null?'background:var(--bg);color:var(--mut2)':pvRiskBg(sc))+'">'+(sc==null?'&ndash;':escD(sc))+'</span><span class="vratlbl">'+escD(d.label)+'</span></div>'+body+'</div>';
 }).join('');
 return '<div class="vratp">'+ratbar+'<div class="vrpb">'+rows+'</div></div>';
}
// #2 (Marc): real-vendor "Risk posture" band for the selected vendor, the risk indicators a real dossier shows
// (breach/incident history, certifications, financial rating, regulatory posture, residency, incident response).
var PVRP_CAT_LBL={lawsuit:'Lawsuit',cybersecurity:'Cybersecurity',financial:'Financial',regulatory:'Regulatory',operational:'Operational',other:'Other'};
function pvRpCatLbl(c){c=String(c||'other').toLowerCase();return PVRP_CAT_LBL[c]||(c.charAt(0).toUpperCase()+c.slice(1));}
// STAGE Risk+Issues: surfaces deepDive.riskPosture.recentIssues (breach/lawsuit/financial/regulatory items
// already present in the seed but previously never rendered anywhere in the UI). Reflect-only, never
// fabricated: a vendor with no recorded items gets a neutral line, not an invented "all clear" claim.
function pvRiskIssuesHtml(rp){
 var items=(rp&&rp.recentIssues)||[];
 var body=items.length?items.map(function(it){
   var sev=String(it.severity||'').toLowerCase();if(['high','medium','low'].indexOf(sev)<0)sev='low';
   return '<div class="rpissue"><div class="rpissue-top"><span class="rpissue-cat">'+escD(pvRpCatLbl(it.category))+'</span><span class="rpissue-sev '+sev+'">'+escD(sev)+' severity</span>'+(it.date?'<span class="rpissue-date">'+escD(it.date)+'</span>':'')+'</div>'+
     '<div class="rpissue-title">'+escD(it.title||'')+'</div>'+
     (it.detail?'<div class="rpissue-detail">'+escD(it.detail)+'</div>':'')+
     '<div class="rpissue-meta">'+(it.source?'<b>Source</b> '+escD(it.source):'')+(it.confidence?'<span class="rpissue-conf">'+escD(it.confidence)+' confidence</span>':'')+'</div>'+
   '</div>';
 }).join(''):'<div class="rpissue-none">No material public issues found in review.</div>';
 return '<div class="riskpost-issues"><div class="riskpost-issues-hd">Recent public issues</div>'+body+'</div>';
}
function pvRiskPostureHtml(a,cand){
 var rp=(cand&&cand.deepDive&&cand.deepDive.riskPosture)||{};
 var hasIssues=!!(rp.recentIssues&&rp.recentIssues.length);
 if(!a||(!rp.breach&&!rp.certs&&!rp.rating&&!rp.regulatory&&!hasIssues))return '';
 var acc=pvSupColor(a);
 var kv=function(k,v){return v?'<div class="riskpost-item"><span class="riskpost-k">'+escD(k)+'</span><span class="riskpost-v">'+escD(v)+'</span></div>':'';};
 return '<div class="riskpost" style="--rpacc:'+acc+'"><div class="riskpost-h"><span class="riskpost-dot" style="background:'+acc+'"></span>'+escD(a.name)+' &middot; risk posture</div><div class="riskpost-grid">'+
   kv('Breach / incident',rp.breach)+kv('Certifications',rp.certs)+kv('Financial rating',rp.rating)+kv('Regulatory',rp.regulatory)+kv('Data residency',rp.residency)+kv('Incident response',rp.ir)+
   '</div>'+pvRiskIssuesHtml(rp)+'</div>';
}

/* ---- advisory recommendation ---- */
function pvRecommendationHtml(refl){
 var L=refl.landscape,rec=L.recommendation,lead=rec.lead;
 var leadCard=lead?('<div class="leadcard"><div class="lh"><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--blue);fill:none;stroke-width:2"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><span class="lt">'+escD(lead.name)+'</span><span class="lbadge">Lead · advisory</span></div>'+
   '<div class="lb"><div class="basis" style="margin-bottom:10px"><span class="bchip"><b>'+escD(PVSEG_LBL[lead.segment])+'</b></span>'+(lead.incumbent?'<span class="flag inc">incumbent</span>':'')+'<span class="bchip">rank <b>#'+escD(lead.rank)+'</b></span></div>'+
     '<div class="statgrid"><div class="statbox"><div class="sb-l">Fit</div><div class="sb-v">'+escD(lead.fitScore)+'<small style="font-size:12px;color:var(--mut2)">/100</small></div></div><div class="statbox"><div class="sb-l">Risk</div><div class="sb-v">'+escD(lead.riskScore)+'<small style="font-size:12px;color:var(--mut2)">/5</small></div></div><div class="statbox"><div class="sb-l">Composite</div><div class="sb-v" style="color:var(--blue)">'+escD(lead.compositeScore)+'</div></div></div>'+
     '<div class="subt">Runners-up</div>'+(rec.runnersUp.length?rec.runnersUp.map(function(r){return '<div class="runner"><span class="rankpill head">'+escD(r.rank)+'</span><span class="rn">'+escD(r.name)+'</span><span class="rv">'+escD(PVSEG_LBL[r.segment])+' · composite '+escD(r.compositeScore)+' · fit '+escD(r.fitScore)+'/100 · risk '+escD(r.riskScore)+'/5</span></div>';}).join(''):'<div class="footbound">No additional eligible suppliers beyond the lead.</div>')+
   '</div></div>'):('<div class="leadcard"><div class="lh"><span class="lt">No eligible lead</span><span class="lbadge">advisory</span></div><div class="lb"><p style="font-size:13px;color:var(--mut);margin:0">Every candidate carries a hard disqualifier. Re-scope the requirements or widen the candidate set before sourcing.</p></div></div>');
 var elimsHtml=rec.eliminations.length?('<div class="subt">Eliminations</div><div class="elim">'+rec.eliminations.map(function(e){return '<div class="elimrow"><span class="ex">&#10005;</span><div><b>'+escD(e.name)+'</b> disqualified'+(e.reasons.length?': '+e.reasons.map(function(r){return escD(r.detail)+' ('+escD(r.code)+')';}).join('; '):'.')+'</div></div>';}).join('')+'</div>'):'<div class="footbound">No vendor was disqualified by a hard flag.</div>';
 return '<div class="sa-card">'+
   '<div class="card-hd"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L20 6"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></svg><span class="ct">Recommendation</span><span class="cs">advisory option, pending your review</span></div>'+
   '<div class="scc-b"><div class="recwrap"><div>'+leadCard+'</div><div>'+elimsHtml+'</div></div>'+
     '<div class="nextact"><svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:var(--blue);fill:none;stroke-width:2;flex:none"><path d="M5 12h14M13 6l6 6-6 6"/></svg><div><div class="na-l">Next action</div><div class="na-v">'+escD(((typeof wfNextAction==="function"&&wfNextAction())||{}).act||PVNEXT_LBL[rec.nextAction]||rec.nextAction)+'</div></div><div class="na-r">'+escD((((typeof wfNextAction==="function"&&wfNextAction())||{}).who)||rec.rationale)+'</div></div>'+
     /* #4: per-card advisory caveat dropped, the page REFLECT-ONLY badge carries it. */
   '</div></div>';
}

/* ---- data basis + NEEDS_INPUT coverage gaps ---- */
function pvDataBasisHtml(refl){
 var db=refl.landscape.dataBasis;
 var needs=[];
 if(db.fitCoverageShare<1)needs.push('Fit scoring is incomplete: '+pvPct100(1-db.fitCoverageShare)+' of the supplier x requirement cells are unscored (an unscored cell is treated as a gap, scored 0).');
 if(db.riskCoverageShare<1)needs.push('Risk scoring is incomplete: '+pvPct100(1-db.riskCoverageShare)+' of the supplier x risk-dimension cells are unscored.');
 if(db.suppliersWithFitGaps>0)needs.push(db.suppliersWithFitGaps+' supplier(s) are missing at least one requirement score.');
 if(db.suppliersWithRiskGaps>0)needs.push(db.suppliersWithRiskGaps+' supplier(s) are missing at least one risk-dimension score.');
 if(db.incumbentCount===0)needs.push('No incumbent is flagged; a competitive RFP with no incumbent is expected here.');
 var needsHtml=needs.length?needs.map(function(n){return '<div class="needs" style="margin-top:8px"><b>NEEDS INPUT</b><span>'+escD(n)+'</span></div>';}).join(''):'<div class="footbound">All supplied scores are fully covered.</div>';
 return '<div class="sa-card">'+
   '<div class="card-hd"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M4 9h16M4 14h16M9 4v16"/></svg><span class="ct">Data basis</span><span class="cs">'+escD(db.supplierCount)+' suppliers · '+escD(db.requirementCount)+' requirements · '+escD(db.riskDimensionCount)+' risk dimensions</span></div>'+
   '<div class="scc-b"><div class="basis"><span class="bchip">Eligible <b>'+escD(db.eligibleCount)+'</b></span><span class="bchip">Disqualified <b>'+escD(db.disqualifiedCount)+'</b></span><span class="bchip">Incumbents <b>'+escD(db.incumbentCount)+'</b></span><span class="bchip">Flagged suppliers <b>'+escD(db.flaggedSupplierCount)+'</b></span><span class="bchip">Fit coverage <b>'+escD(pvPct100(db.fitCoverageShare))+'</b></span><span class="bchip">Risk coverage <b>'+escD(pvPct100(db.riskCoverageShare))+'</b></span></div>'+needsHtml+
     '<div class="footbound">The data basis tells you what is grounded. The scores are the inputs you supplied; a missing score is reported as a coverage gap, never invented, and the ranking is only as firm as the inputs.</div>'+
   '</div></div>';
}

/* ---- per-vendor Deep Dive drill (item C15): the supplier-deep-dive surface ---- */
function pvDdCardHd(icon,titleHtml){return '<div class="card-hd"><svg viewBox="0 0 24 24">'+icon+'</svg>'+titleHtml+'</div>';}
function pvDeepDiveHtml(id,refl,input){
 var L=refl.landscape;
 var a=L.assessments.find(function(x){return x.id===id;});
 var cand=pvCandById(id);
 if(!a||!cand||!cand.deepDive){return '<button class="pvback" onclick="pvCloseDeepDive()">&#8592; Back to landscape</button><div class="sa-card"><div class="scc-b">Deep dive is not available for this candidate.</div></div>';}
 var dd=cand.deepDive;
 var vm=pvVerdictMeta(pvAssessVerdict(a,cand));
 var short=pvIsShort(id);
 var riskHigh=(input.segmentation&&input.segmentation.riskHigh!=null)?input.segmentation.riskHigh:2.5;
 var elevated=a.riskScore>=riskHigh;
 var rat='Advisory read from this project\'s candidate set: fit '+a.fitScore+'/100, risk '+a.riskScore+'/5, composite '+a.compositeScore+', '+PVSEG_LBL[a.segment].toLowerCase()+'. Not an award; no vendor is selected or contacted.';
 var attrDefs=[['HQ','hq'],['Founded','founded'],['Financial status','financial'],['Gartner','gartner'],['Pricing','pricing'],['Contract flex','contractFlex'],['Integration','integration'],['ESG','esg']];
 var attrs=attrDefs.map(function(d){var val=(dd.attrs&&dd.attrs[d[1]])?dd.attrs[d[1]]:'Data not available';var st=(dd.attrsSrc&&dd.attrsSrc[d[1]])?pvSrcTag(dd.attrsSrc[d[1]]):'';return '<div class="pvattr"><div class="al">'+escD(d[0])+(st?' '+st:'')+'</div><div class="av">'+escD(val)+'</div></div>';}).join('');
 // #87 (Marc): strengths & risks as parallel clean lists (no bubbles); risks keep their real narrative.
 var srrow='display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.5;align-items:baseline';
 var strengths=(dd.strengths||[]).map(function(s){return '<div style="'+srrow+'"><span style="color:var(--navy);font-weight:800;flex:none">&#10003;</span><span>'+escD(s)+'</span></div>';}).join('');
 var risks=(dd.risksNarr||[]).map(function(rk){var col=rk.sev==='high'?'#A23A30':rk.sev==='med'?'var(--amber-d)':'#5C2B50';var sl=rk.sev==='high'?'High':rk.sev==='med'?'Medium':'Low';return '<div style="'+srrow+'"><span style="color:'+col+';flex:none;font-size:15px;line-height:1">&#9679;</span><span><b>'+escD(rk.cat)+'</b> <span style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;color:'+col+'">'+sl+'</span><div style="color:var(--mut);margin-top:2px">'+escD(rk.detail)+'</div></span></div>';}).join('');
 // #88 (Marc): risk dimensions as a clean TABLE (not chips)
 var dims=input.riskDimensions||[];var rawRisk=cand.risk||{};
 var dimRows=dims.map(function(dm){var sc=rawRisk[dm.id];var col=sc==null?'var(--mut2)':sc>=3?'#A23A30':sc>=2?'var(--amber-d)':'#5C2B50';var w=sc==null?0:Math.min(100,sc/5*100);return '<tr><td style="text-align:left;font-weight:600">'+escD(dm.label)+'</td><td style="text-align:right;font-weight:700;color:'+col+';white-space:nowrap">'+(sc==null?', ':escD(sc)+' / 5')+'</td><td style="width:130px"><div style="height:7px;border-radius:4px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:'+w+'%;background:'+col+'"></i></div></td></tr>';}).join('');
 var reqRows=a.coverage.map(function(c){var nar=(dd.reqNarr&&dd.reqNarr[c.requirementId])?dd.reqNarr[c.requirementId]:'';var w=Math.round(c.score/5*100);return '<tr><td class="v">'+escD(c.label)+'</td><td class="c"><span class="cell" style="'+pvFitBg(c.score)+'">'+escD(c.score)+'</span></td><td style="min-width:90px"><div class="pvbar"><i style="width:'+w+'%"></i></div></td><td style="font-size:12px;color:var(--mut);line-height:1.45">'+escD(nar)+'</td></tr>';}).join('');
 var com=dd.commercial||{};
 var comBlk=[['Contracting','contracting'],['Regulatory / GxP','regulatory'],['Implementation','implementation'],['Integration','integration']].map(function(d){return '<div style="margin-bottom:9px"><div class="subt" style="margin-bottom:3px">'+escD(d[0])+'</div><div style="font-size:12.5px;color:var(--ink);line-height:1.55">'+escD(com[d[1]]||'Data not available')+'</div></div>';}).join('');
 var gating=(dd.gating&&dd.gating.length)?dd.gating.map(function(g){return '<div class="pvgate"><span class="gi">!</span><div><div><b>'+escD(g.item)+'</b></div><div style="margin-top:3px"><span class="flag soft" style="margin:0">'+escD(String(g.status||'').replace(/_/g,' '))+'</span> <span class="gsme">Risk flag, would require a formal screen before award if pursued</span></div></div></div>';}).join(''):'<div class="footbound">No hard gating item; standard pre-award confirmations apply.</div>';
 var conds=(dd.conditions&&dd.conditions.length)?('<div class="pvcond">'+dd.conditions.map(function(c,i){return '<div class="cr"><span class="cd">'+(i+1)+'</span><span>'+escD(c)+'</span></div>';}).join('')+'</div>'):'<div class="footbound">No conditions recorded.</div>';
 var h='';
 h+='<button class="pvback" onclick="pvCloseDeepDive()">&#8592; Back to landscape</button>';
 h+='<div class="pvvstrip '+vm.cls+'"><div><div style="font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--mut)">Advisory verdict</div><div class="vv">'+escD(vm.lbl)+'</div></div><div class="vr">'+escD(rat)+'</div></div>';
 h+='<div class="sa-card">'+pvDdCardHd('<path d="M20 7l-8-4-8 4 8 4 8-4z"/><path d="M4 7v6l8 4 8-4V7"/>','<span class="ct">'+escD(a.name)+' · profile &amp; fit</span>')+
   '<div class="scc-b"><div class="statgrid" style="grid-template-columns:repeat(5,1fr)">'+
     '<div class="statbox"><div class="sb-l">Lilly fit</div><div class="sb-v">'+escD(a.fitScore)+'<small style="font-size:12px;color:var(--mut2)">/100</small></div></div>'+
     '<div class="statbox"><div class="sb-l">Risk</div><div class="sb-v" style="color:'+(elevated?'var(--red)':'var(--blue)')+'">'+escD(a.riskScore)+'<small style="font-size:12px;color:var(--mut2)">/5</small></div></div>'+
     '<div class="statbox"><div class="sb-l">Composite</div><div class="sb-v" style="color:var(--blue)">'+escD(a.compositeScore)+'</div></div>'+
     '<div class="statbox"><div class="sb-l">Segment</div><div class="sb-v" style="font-size:13px">'+escD(PVSEG_LBL[a.segment])+'</div></div>'+
     '<div class="statbox"><div class="sb-l">Rank</div><div class="sb-v">'+(a.rank!=null?('#'+escD(a.rank)):', ')+'</div></div>'+
   '</div>'+
   '<div class="pvlede" style="margin-top:12px">'+escD(dd.overview)+'</div>'+
   '<div class="pvlede"><b style="color:var(--blue)">Why this vendor for Lilly.</b> '+escD(dd.whyLilly)+'</div>'+
   '<div class="subt">Key Attributes</div><div class="pvattrs">'+attrs+'</div></div></div>';
 h+='<div class="sa-card">'+pvDdCardHd('<path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/>','<span class="ct">Solution &amp; financial health</span>')+
   '<div class="scc-b"><div class="subt">Solution &amp; architecture</div><div class="pvlede">'+escD(dd.solution)+'</div><div class="subt">Financial health</div><div class="pvlede mut" style="margin:0">'+escD(dd.finHealth)+'</div></div></div>';
 h+='<div class="sa-card">'+pvDdCardHd('<path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/>','<span class="ct">Strengths &amp; Risks</span>')+
   '<div class="scc-b"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px">'+
     '<div><div class="subt">Strengths</div>'+strengths+'</div>'+
     '<div><div class="subt">Risks</div>'+risks+'</div>'+
   '</div>'+
   '<div class="subt" style="margin-top:18px">Risk Dimensions <span style="font-weight:500;color:var(--mut2);font-size:11px;text-transform:none;letter-spacing:0">&middot; 0&ndash;5, higher is worse</span></div>'+
   '<div class="mxwrap"><table class="mx" style="width:100%"><tbody>'+dimRows+'</tbody></table></div>'+
   '<div class="footbound">Narrative risks are advisory; a hard flag disqualifies, a soft flag is recorded for review. Dimension scores roll up from the sub-factors on the Risk Assessment subtab.</div></div></div>';
 h+='<div class="sa-card">'+pvDdCardHd('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>','<span class="ct">Requirements Analysis</span>')+
   '<div class="scc-b" style="overflow-x:auto"><table class="mtable"><thead><tr><th>Requirement</th><th class="c">Fit /5</th><th>Coverage</th><th>Narrative</th></tr></thead><tbody>'+reqRows+'</tbody></table></div></div>';
 h+='<div class="sa-card">'+pvDdCardHd('<path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h4"/>','<span class="ct">Commercial &amp; operational</span>')+
   '<div class="scc-b">'+comBlk+'<div class="subt" style="margin-top:6px">Clients &amp; ecosystem</div><div class="pvlede mut" style="margin:0">'+escD(dd.clients)+'</div></div></div>';
 h+='<div class="sa-card">'+pvDdCardHd('<path d="M9 11l3 3L20 6"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/>','<span class="ct">Verdict, gating &amp; conditions</span>')+
   '<div class="scc-b"><div class="subt">Risk flags &middot; screens if pursued</div>'+gating+'<div class="subt" style="margin-top:12px">Conditions before commitment</div>'+conds+'</div></div>';
 h+='<div class="sa-card">'+pvDdCardHd('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>','<span class="ct">Relationship history</span>')+
   '<div class="scc-b"><div class="pvlede mut" style="margin:0">'+escD(dd.relationship)+'</div></div></div>';
 return h;
}

/* ======================= Pass A: 4-subtab Landscape shell ======================= */
function pvSubtabsHtml(){
 // Tab order (Marc, 2026-07-23): Head-to-Head placed right after Supplier Deep Dive per Marc's explicit
 // direction; 'Overview' label applied from the analysis (treat-analyses-as-directives). Marc adjusts as needed.
 var tabs=[['exec','Overview'],['deep','Supplier Deep Dive'],['h2h','Head-to-Head'],['heatmap','Requirements Heatmap'],['risk','Risk Assessment']];
 if(['exec','deep','heatmap','risk','h2h'].indexOf(PVSL_SUB)<0)PVSL_SUB='exec';
 return '<div class="pvsubtabs">'+tabs.map(function(t){return '<button class="pvsubtab'+(PVSL_SUB===t[0]?' on':'')+'" onclick="pvSetSub(\''+t[0]+'\')">'+escD(t[1])+'</button>';}).join('')+'</div>';
}
/* one-line rationale for a slate member (Exec Summary recommendation) */
function pvSlateRationale(a,cand){
 var f5=pvRound((a.fitScore||0)/20,1);
 if(a.rank===1)return 'Top weighted fit '+f5+'/5 with contained risk, recommended lead and pace-setter.';
 var g=(cand&&cand.deepDive&&cand.deepDive.gating)?cand.deepDive.gating.length:0;
 var base='Fit '+f5+'/5, '+String(PVSEG_LBL[a.segment]||'').toLowerCase()+'. ';
 if(g>0)return base+'Carry as the value lever, clears a formal screen on the open gating item before award.';
 if(a.segment==='leader')return base+'Close second on weighted fit, a credible alternative to the lead.';
 if(a.segment==='challenger')return base+'Strong fit with elevated risk; attach risk conditions on the flagged dimensions.';
 return base+'Keep in the field as a genuine second option.';
}
/* ---- ① Executive Summary ---- */
function pvExecSummaryHtml(refl,input){
 var L=refl.landscape,rec=L.recommendation,lead=rec.lead;
 var ranked=L.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;});
 /* headline /100 fit for a vendor, the reflect-only landscape fit the candidate carries (falls back to the weighted rollup) */
 var fitOf=function(o){var c=o&&o.id?pvCandById(o.id):null;return (c&&c.fit!=null)?c.fit:Math.round(o.fitScore||0);};
 var seg=(input&&input.segmentation)||{};var riskHigh=seg.riskHigh!=null?seg.riskHigh:2.5;
 var sumSubs=(input.requirements||[]).reduce(function(n,r){return n+((r.subs&&r.subs.length)||0);},0);
 var colorAt=function(id){var i=(input.suppliers||[]).findIndex(function(s){return s.id===id;});return PVVENDOR_COLORS[(i<0?0:i)%PVVENDOR_COLORS.length];};
 // "Start an RFx" button removed (owner ask, 2026-07): a static dashboard cannot trigger a skill.
 var h='<div class="exechd"><h2>Executive Summary</h2></div>';
 // Compact recommendation card: top candidate + secondary, a one-line rationale each.
 var picks=ranked.slice(0,2).map(function(a){
   var cand=pvCandById(a.id);var tlbl=a.rank===1?'Top candidate':'Secondary';
   return '<div class="recpick"><span class="spos" style="background:'+colorAt(a.id)+'">'+escD(a.rank)+'</span><div class="sbd"><div class="sn">'+escD(a.name)+' <span class="ptag">'+tlbl+'</span></div><div class="sr">'+escD(pvSlateRationale(a,cand))+'</div></div></div>';
 }).join('');
 // Recommendation, flat standings card (design handoff): header + all-vendor standings, rank-1 raised, then a
 // divider + one row per eliminated vendor, then next-action band, advisory note.
 // Owner ask (2026-07): the standalone "Eliminated before the shortlist" card is merged into this table
 // (name + reason rows only, no composite/fit/risk) instead of living as a separate card lower on the page.
 // Authored reflect-only demo composites + risk (design handoff), the standings panel shows the
 // pre-RFP scan values, not the live risk-discounted composites. Other subtabs keep the live rollups.
 var recAuth=PV_EXEC_AUTH;
 var P=PROJECTS[CURPROJ]||{};
 // Eliminated vendors: prefers the model's own disqualified assessments (rec.eliminations); this reflect-only
 // nimbus seed carries no hard flag, so it falls back to the clearly-illustrative P.excludedVendors seed
 // (assets/landscape-data.js). elimReal.length gates the "reflect-only" vs "illustrative" note below.
 var elimReal=(rec.eliminations||[]).map(function(e){return {name:e.name,reason:(e.reasons&&e.reasons.length)?e.reasons.map(function(r){return r.detail;}).join('; '):'Carries a hard flag.'};});
 var elimIllus=(!elimReal.length&&P.excludedVendors&&P.excludedVendors.length)?P.excludedVendors:[];
 var elimRowsSrc=elimReal.length?elimReal:elimIllus;
 // G15 shortlist band: eligible vendors within a competitive band of the top composite get a tinted row (and a
 // tinted dot on the Segmentation plane) instead of a text callout (owner ask, 2026-07: drop the sentence).
 var comps=ranked.map(function(a){var ra=recAuth[a.id];return {a:a,comp:(ra?ra.comp:Math.round(a.compositeScore))};});
 var topComp=comps.length?Math.max.apply(null,comps.map(function(x){return x.comp;})):0;
 var slBandPts=Math.max(8,Math.round(topComp*0.10));
 var shortlist=comps.filter(function(x){return x.a.eligible&&(topComp-x.comp)<=slBandPts;});
 var shortlistIds={};shortlist.forEach(function(x){shortlistIds[x.a.id]=true;});
 var recRows=ranked.map(function(a,i){
   var isLead=a.rank===1;var last=(i===ranked.length-1)&&!elimRowsSrc.length;
   var cls=isLead?'rgrid lead':('rgrid run'+(last?' last':'')+((!isLead&&shortlistIds[a.id])?' shortlisted':''));
   var ra=recAuth[a.id];
   return '<div class="'+cls+'">'+
     '<span class="rrk">'+escD(a.rank)+'</span>'+
     '<span class="rnm">'+escD(a.name)+'</span>'+
     '<span class="rseg">'+escD(pvRecStanding(a))+'</span>'+
     '<span class="rcomp">'+escD(ra?ra.comp:Math.round(a.compositeScore))+'</span>'+
     '<span class="n">'+escD(fitOf(a))+'</span>'+
     '<span class="n">'+escD(ra?ra.risk:pvRound(a.riskScore,1))+'</span>'+
   '</div>';
 }).join('');
 var recHead='<div class="rgrid rhead"><span></span><span>Supplier</span><span>Segment</span><span class="n">Composite</span><span class="n">Fit</span><span class="n">Risk</span></div>';
 var elimDivider=elimRowsSrc.length?('<div class="rgrid rdiv"><span></span><span class="rnm rdiv-lbl">Eliminated before the shortlist</span><span class="rseg rdiv-note" style="grid-column:3/-1"></span></div>'):'';
 var elimRowsHtml=elimRowsSrc.map(function(v){
   return '<div class="rgrid elimr"><span class="rrk"><span class="ex">&#10005;</span></span><span class="rnm">'+escD(v.name)+'</span><span class="rseg elimreason" style="grid-column:3/-1">'+escD(v.reason)+'</span></div>';
 }).join('');
 var recHtml='<div class="pvrec">'+
   '<div class="rh"><span class="rt">Recommendation</span></div>'+
   (lead
     ? ('<div class="rtbl">'+recHead+recRows+elimDivider+elimRowsHtml+'</div>')
     : ('<div class="rtbl">'+recHead+'<div class="rgrid run'+(elimRowsSrc.length?'':' last')+'"><span></span><span class="rnm">No candidate is eligible; every vendor carries a hard flag. Re-scope the requirements or widen the field.</span><span></span><span></span><span></span><span></span></div>'+elimDivider+elimRowsHtml+'</div>'))+
 '</div>';
 // Fix #2: the Next-action band + advisory note move OUT of the Recommendation panel and render at the
 // bottom of the Evaluation summary (above the Rec | ranking row). Same text/markup + blue-teal styling.
 // Recommendation surfaces the Must-Have miss as a GATE/RISK TO CLEAR (not a "next action", 
 // the next team step lives on Overview/Workflow). Only shown if the field has a must-have gap.
 // #92 (owner ask, 2026-07): koRec/recNext are now DEAD, the "Gate to clear" band they built is no longer
 // wired into the page (the Evaluation Summary's "Recommended next step" carries the lead's open Must-Have
 // gap instead, grounded off the requirements model rather than the RFX.suppliers mock). Left defined,
 // harmless and unused, in case the RFX-scoped gate band is restored.
 var koRec=isCompRFx()?RFX.suppliers.filter(function(s){return s.mustFail&&s.mustFail.length;}):[];
 var recNext=(lead&&koRec.length)?'<p class="rna" style="border-left:3px solid #A23A30;background:var(--pink-t,#FBE7E3)"><span class="nal" style="color:var(--riskred)">Gate to clear</span>'+koRec.map(function(s){return '<b>'+escD(s.n)+' does not meet '+escD(s.mustFail.join(', '))+' (a Must-Have).</b>';}).join(' ')+' If the team advances that supplier, this hard gate must be cleared before award: a Cyber review of whether Lilly can proceed, and confirmation from the supplier of whether they hold the certification (and if not, if/when they will). The gate-passing suppliers clear it today.</p>':'';
 // #4 (Marc): the per-card advisory note is dropped, the page-level REFLECT-ONLY badge + the prose's closing
 // clause carry it now (no 7x repetition).
 var recAdvNote='';
 // round-6 (Marc): KPI strip removed, Eligible/Field-fit/Weighted-risk live in the Recommendation table; the
 // Est. 3-yr TCO folds into the Evaluation-summary prose below. (P is now declared earlier, alongside the
 // eliminated-vendor rows it also feeds.)
 // Evaluation summary re-drafted as a NARRATIVE of the outcome + the insight that drove it (no em dashes, no
 // table recitation); the TCO is woven in since the KPI strip is gone.
 var tcoClause=(P.tco?(' against a '+String(P.tco).replace(/\s*TCO\s*/i,'').trim()+' three-year TCO'):'');
 var prose;
 if(ranked.length){
   var pLead=ranked[0],pR2=ranked[1],pR3=ranked[2],pLa=recAuth[pLead.id]||{};
   var leadRisk=(pLa.risk!=null?pLa.risk:pvAuthRisk(pLead.id,pLead.riskScore));
   var leadComp=(pLa.comp!=null?pLa.comp:Math.round(pLead.compositeScore));
   prose=pLead.name+' is the front-runner in a close '+L.eligibleCount+'-way field. It carries the strongest requirements fit on offer ('+fitOf(pLead)+' of 100)'+(leadRisk>=riskHigh?' but on elevated risk ('+leadRisk+' of 5)':' while holding risk contained ('+leadRisk+' of 5)')+tcoClause+', which is what lifts it to the '+leadComp+' composite. ';
   if(pR2){
     var r2Risk=(recAuth[pR2.id]&&recAuth[pR2.id].risk!=null)?recAuth[pR2.id].risk:pvAuthRisk(pR2.id,pR2.riskScore);
     prose+=pR2.name+' runs a genuine second on a '+(r2Risk<leadRisk?'lower':'comparable')+'-risk footing, so it stays a live fallback rather than an also-ran'+(pR3?(', while '+pR3.name+' trails mainly on functional fit'):'')+'. ';
   }
   prose+='Weighted across '+sumSubs+' sub-requirements and a five-dimension risk model drawn from credible public sources; advisory only, nothing is contacted or awarded here.';
 } else { prose='No candidate is eligible for this field; every vendor carries a hard flag. Re-scope the requirements or widen the field.'; }
 // #6 (Marc): enrich the Evaluation Summary with a structured per-candidate read that scales with the
 // supplier count (mirrors the Recommendation panel height), narrative lede + "Where each candidate stands".
 var evalFindings=(false)?('<div class="esfind"><div class="esfind-h">Where each candidate stands</div>'+ranked.map(function(a,i){var ar=(recAuth[a.id]&&recAuth[a.id].risk!=null)?recAuth[a.id].risk:pvAuthRisk(a.id,a.riskScore);var ac=(recAuth[a.id]&&recAuth[a.id].comp!=null)?recAuth[a.id].comp:Math.round(a.compositeScore);var read=a.segment==='disqualified'?'Carries a hard flag; off the shortlist.':(i===0?'Front-runner on the strongest requirements fit.':(a.segment==='challenger'?'Strong fit, but elevated risk to weigh.':(a.segment==='niche'?'Narrower fit; a fit-for-purpose option.':(a.segment==='caution'?'Narrower fit and elevated risk.':'A genuine contender in the field.'))));return '<div class="esrow"><span class="esr-dot" style="background:'+pvSupColor(a)+'"></span><div class="esr-b"><div class="esr-top"><span class="esr-nm">'+escD(a.name)+'</span><span class="esr-seg">'+escD(PVSEG_LBL[a.segment])+'</span></div><div class="esr-meta">fit '+escD(fitOf(a))+'/100 &middot; risk '+escD(ar)+'/5 &middot; composite '+escD(ac)+'</div><div class="esr-read">'+escD(read)+'</div></div></div>';}).join('')+'</div>'):'';
 // #92 (owner ask, 2026-07): the provenance/methodology bchip strip that used to sit under the Rec panel was
 // cut (no value, owner ask). In its place the Evaluation Summary now carries the actual call: a grounded
 // Recommendation (primary + secondary, each drawn from this project's own deepDive.whyLilly, never
 // fabricated) and a Recommended next step (advance the shortlist band, plus the lead's own open Must-Have
 // gap off the SAME 3.5/5 knockout rule the heatmap's must-have matrix uses, or its lowest open requirement
 // if nothing gates it).
 var leadCand=lead?pvCandById(lead.id):null;
 var riskOf=function(a){var ra=recAuth[a.id];return (ra&&ra.risk!=null)?ra.risk:pvAuthRisk(a.id,a.riskScore);};
 var leadWhy=(leadCand&&leadCand.deepDive&&leadCand.deepDive.whyLilly)?String(leadCand.deepDive.whyLilly).trim():'';
 var secA=ranked[1],secCand=secA?pvCandById(secA.id):null;
 var recTxt='<p class="pvlede" style="margin:0">No candidate is eligible for this field; every vendor carries a hard flag.</p>';
 if(lead){
   recTxt='<p class="pvlede" style="margin:0 0 6px"><b>Primary: '+escD(lead.name)+'</b> ('+escD(fitOf(lead))+'/100 fit). '+
     escD(leadWhy||('Leads the field on weighted fit ('+fitOf(lead)+'/100) with risk held at '+riskOf(lead)+'/5.'))+'</p>';
   if(secA)recTxt+='<p class="pvlede" style="margin:0"><b>Secondary: '+escD(secA.name)+'</b>. '+escD(pvSlateRationale(secA,secCand))+'</p>';
 }
 var recNarrHtml='<div class="subt" style="margin-top:14px">Recommendation</div>'+recTxt;
 // lead's own open Must-Have gap: same knockout rule as the heatmap's must-have matrix (a sub.must
 // requirement scored below the 3.5/5 adequacy threshold). Falls back to the lead's single lowest-scoring
 // requirement (must or not) if no Must-Have gap is open, never fabricated.
 var leadMustGap=null,leadLowest=null;
 if(leadCand&&leadCand.subFit){
   (input.requirements||[]).forEach(function(r){
     (r.subs||[]).forEach(function(sub){
       var v=(leadCand.subFit[r.id]||{})[sub.id];
       if(v==null)return;
       if(leadLowest==null||v<leadLowest.score)leadLowest={label:sub.label,score:pvRound(v,1)};
       if(sub.must&&v<3.5&&!leadMustGap)leadMustGap={label:sub.label,score:pvRound(v,1)};
     });
   });
 }
 var nextTxt='Re-scope the requirements or widen the field before advancing to an RFx; no candidate clears the bar today.';
 if(lead){
   var slNames=shortlist.map(function(x){return x.a.name;});
   nextTxt='Advance the shortlist ('+slNames.join(', ')+') to an RFx with '+lead.name+' as pace-setter.';
   if(leadMustGap)nextTxt+=' Before award, screen '+lead.name+' on '+leadMustGap.label+' ('+leadMustGap.score+'/5).';
   else if(leadLowest)nextTxt+=' Validate '+leadLowest.label+' ('+leadLowest.score+'/5) in the RFx.';
 }
 var nextStepHtml='<div class="subt" style="margin-top:14px">Next step</div><p class="pvlede" style="margin:0">'+escD(nextTxt)+'</p>';
 var evalHtml='<div class="sa-card"><div class="card-hd"><svg viewBox="0 0 24 24"><path d="M4 5h16M4 10h16M4 15h10"/></svg><span class="ct">Evaluation Summary</span></div><div class="scc-b"><div class="pvlede" style="margin:0">'+escD(prose)+'</div>'+recNarrHtml+nextStepHtml+evalFindings+'</div></div>';
 // #80 (Marc): make this a real EXECUTIVE SUMMARY of the search, add a scope/coverage strip, a key
 // differentiators & trade-offs read, and an across-the-field read (market structure + gating watch-items +
 // next step). Everything is grounded in the landscape data; the existing Eval|Rec + Segmentation stay.
 var db=L.dataBasis||{},ms=L.marketStructure||{},cd=L.competitiveDynamics||{};
 var mtile=function(v,l){return '<div style="flex:1;min-width:120px;background:var(--surface);border:1px solid var(--line2);border-top:3px solid var(--tib-blue);border-radius:10px;padding:12px 14px;box-shadow:var(--shadow-2,0 2px 4px rgba(38,30,20,.06),0 4px 8px -2px rgba(38,30,20,.10))"><div style="font:800 21px var(--sans);color:var(--ink);letter-spacing:-.01em">'+v+'</div><div style="font-size:11px;color:var(--mut2);font-weight:600;margin-top:2px">'+l+'</div></div>';};
 // Overview (Marc, 2026-07-23): a clear supplier FUNNEL instead of the ambiguous "7 scanned / 7-of-7 eligible +
 // 2 eliminated (reads like 9)" mix. Reviewed = assessed field + pre-shortlist eliminations, then passed /
 // screened out / recommended for RFx. Grounded in supplierCount / eligibleCount / eliminations / shortlist.
 // elimN must match the eliminations the table actually renders (elimRowsSrc), not the raw
 // eliminations array, an empty [] is truthy and was masking the illustrative fallback (reviewed read 7 not 9).
 var elimN=(typeof elimRowsSrc!=='undefined'&&elimRowsSrc)?elimRowsSrc.length:0;
 var reviewedN=(L.supplierCount||0)+elimN;
 var screenedN=Math.max(0,(L.supplierCount||0)-(L.eligibleCount||0))+elimN;
 // rfxN = the shortlist band (recommended for RFx), not eligibleCount; shortlistIds is a map (no .length).
 var rfxN=(typeof shortlist!=='undefined'&&shortlist)?shortlist.length:(L.eligibleCount||0);
 // Marc: the 4-count stat strip (reviewed / passed screen / screened out / recommended) adds no value; removed.
 // assembly: Eval | Recommendation → segmentation & differentiators (merged) → market structure → dynamics/H2H
 // (Marc: "Across the Field" prose + "Data basis" card removed, redundant with the strip/chips/recommendation.)
 // #92 (owner ask, 2026-07): recNext (the must-have "Gate to clear" band) no longer renders here, the lead's
 // open Must-Have gap now lives in the Evaluation Summary's "Recommended next step" (grounded off the
 // requirements model). The compact top-candidate rationale sentence (recrat, "X ranks first on the weighted
 // 6-category model...") stays removed (owner ask, 2026-07: valueless filler prose).
 h+='<div class="execside">'+evalHtml+'<div class="recR">'+recHtml+recAdvNote+'</div></div>';
 // #92 (owner ask, 2026-07): the methodology/provenance bchip strip ("Requirements basis N categories" /
 // "Field N scanned · N eligible" / "Research as of July 2026") is CUT, owner said it adds no value. The
 // mstrip 4-metric tiles above (Suppliers scanned / Eligible after screen / Requirements scored / Leader gap)
 // already carry the scope read; the Evaluation Summary now carries the substantive call.
 // "Eliminated before the shortlist" card removed (owner ask, 2026-07): merged into the Recommendation table
 // above as a divider + name/reason rows (elimReal/elimIllus/elimRowsSrc are computed earlier, alongside P,
 // before recHtml is assembled).
 h+=pvSegPlaneHtml(refl,input,shortlistIds);
 // Market structure panel CUT (owner decision, 2026-07): the HHI/composite-share concentration read
 // overclaimed leverage/replaceability and duplicated the Leader-gap; "how close is the race" now lives
 // only in Competitive Dynamics. pvMarketStructureHtml is retained (unused) in case it is restored.
 // Head-to-Head lives on its own top-level tab; NO launcher/teaser on Overview (Marc: not needed at the bottom).
 return h;
}
function pvRankBarHtml(refl,input){
 var L=refl.landscape;
 var ranked=L.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;});
 var colorOf={};(input.suppliers||[]).forEach(function(s,i){colorOf[s.id]=PVVENDOR_COLORS[i%PVVENDOR_COLORS.length];});
 var rows=ranked.map(function(a){
   var f5=pvRound(a.fitScore/20,1);var w=pvRound(f5/5*100,1);var col=colorOf[a.id]||'#5C2B50';
   return '<div class="rankrow"><div class="rl"><span class="rankpill head">'+escD(a.rank)+'</span><span class="rlnm">'+escD(a.name)+'</span></div><div class="rtrack" title="'+escD(a.name)+' · weighted fit '+escD(f5)+'/5"><div class="rfill" style="width:'+w+'%;background:'+col+'"></div></div><div class="rv">'+escD(f5)+'<small>/5</small></div></div>';
 }).join('');
 return '<div class="sa-card"><div class="card-hd"><svg viewBox="0 0 24 24"><path d="M3 21h18M6 21V9M12 21V4M18 21v-8"/></svg><span class="ct">All-vendor ranking</span></div><div class="scc-b"><div class="rankbars">'+rows+'</div></div></div>';
}
// Merged panel (Marc): the fit×risk plane (LEFT) + a per-supplier differentiator table (RIGHT), 
// where each ranked vendor leads the field, its own strongest area, and its top watch. The old
// "Leader · N / Caution · N + advice" insight column is dropped (segment/rank read off the plane),
// and this absorbs the standalone "Key Differentiators & Trade-offs" table.
function pvSegPlaneHtml(refl,input,shortlistIds){
 var L=refl.landscape;
 shortlistIds=shortlistIds||{};
 var seg=(input&&input.segmentation)||{};
 // Interactive thresholds (owner ask, 2026-07): two sliders let the reviewer restate the fit/risk cut and
 // see the quadrant split, dot bucketing and Candidates list recompute live. Default to this project's own
 // segmentation config until the reviewer moves a slider (PVSL_SEG_FIT/RISK; see pvSegSetFit/pvSegSetRisk).
 var fitHigh=(PVSL_SEG_FIT!=null)?PVSL_SEG_FIT:(seg.fitHigh!=null?seg.fitHigh:60);
 var riskHigh=(PVSL_SEG_RISK!=null)?PVSL_SEG_RISK:(seg.riskHigh!=null?seg.riskHigh:2.5);
 var qH={leader:'Leaders, strong weighted fit, contained risk. The default RFx pace-setters.',niche:'Niche, narrower fit but contained risk. Fit for a specific scope.',challenger:'Challengers, strong fit but elevated risk. Shortlist with conditions.',caution:'Caution, narrower fit and elevated risk. A price lever at most.'};
 // Recompute each candidate's segment off the SAME classifier the engine uses (PVSLE.classifySegment), fed
 // the slider thresholds instead of the project's static config, so the plane, legend, and Candidates list
 // all read consistently off the interactive cut. Eligibility (hard-flag disqualification) is untouched by
 // the sliders, only the leader/challenger/niche/caution partition of the eligible field moves.
 var effAssessments=L.assessments.map(function(a){
   var rv=pvAuthRisk(a.id,a.riskScore);
   return Object.assign({},a,{segment:PVSLE.classifySegment(a.eligible,a.fitScore,rv,fitHigh,riskHigh)});
 });
 var ranked=effAssessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;});
 var selId=ranked.length?ranked[0].id:null; // default-open the top-ranked supplier + ring its dot
 // Owner ask (2026-07): the sliders must MOVE THE AXES, not just re-bucket dots on a fixed 50/50 split. The
 // divider lines and the dot positions now share one proportional scale (pad 6-94 / 8-92) keyed off the
 // CURRENT thresholds, so dragging a slider visibly resizes the 4 quadrant regions; the segment/colour
 // re-bucketing (via effAssessments above) already tracks the same thresholds and still applies live.
 var vx=pvRound(6+fitHigh/100*88,2),hy=pvRound(8+riskHigh/5*84,2);
 var dots=effAssessments.map(function(a){return pvPlaneDot(a,fitHigh,riskHigh,selId,{prop:true,shortlistIds:shortlistIds});}).join('');
 var sliderHtml='<div class="segthr">'+
   '<div class="segthr-row"><label for="segthrFit">Fit threshold</label><input id="segthrFit" type="range" min="55" max="90" step="1" value="'+escD(fitHigh)+'" onchange="pvSegSetFit(this.value)" aria-label="Fit threshold, 55 to 90"><span class="segthr-v">'+escD(fitHigh)+'<small>/100</small></span></div>'+
   '<div class="segthr-row"><label for="segthrRisk">Risk threshold</label><input id="segthrRisk" type="range" min="1" max="4.5" step="0.1" value="'+escD(riskHigh)+'" onchange="pvSegSetRisk(this.value)" aria-label="Risk threshold, 1.0 to 4.5"><span class="segthr-v">'+escD(riskHigh)+'<small>/5</small></span></div>'+
 '</div>';
 var plane='<div class="plane">'+
   '<div class="pq pq-niche" style="left:0;top:0;width:'+vx+'%;height:'+hy+'%"></div>'+
   '<div class="pq pq-leader" style="left:'+vx+'%;top:0;width:'+pvRound(100-vx,2)+'%;height:'+hy+'%"></div>'+
   '<div class="pq pq-caution" style="left:0;top:'+hy+'%;width:'+vx+'%;height:'+pvRound(100-hy,2)+'%"></div>'+
   '<div class="pq pq-chal" style="left:'+vx+'%;top:'+hy+'%;width:'+pvRound(100-vx,2)+'%;height:'+pvRound(100-hy,2)+'%"></div>'+
   '<div class="pdiv-v" style="left:'+vx+'%"></div><div class="pdiv-h" style="top:'+hy+'%"></div>'+
   '<div class="qlab" style="right:10px;top:8px" title="'+escD(qH.leader)+'">Leaders</div><div class="qlab" style="left:10px;top:8px" title="'+escD(qH.niche)+'">Niche</div><div class="qlab" style="right:10px;bottom:8px" title="'+escD(qH.challenger)+'">Challengers</div><div class="qlab" style="left:10px;bottom:8px" title="'+escD(qH.caution)+'">Caution</div>'+
   '<div class="axlab" style="left:8px;bottom:50%">&#8593; lower risk</div><div class="axlab" style="left:50%;transform:translateX(-50%);bottom:2px">higher fit &#8594;</div>'+dots+'</div>';
 // plane key, segment colours present + the incumbent marker (inline; mirrors the .pdot.inc dashed-ring badge)
 var segsPresent=PVSEG_ORDER.filter(function(s){return effAssessments.some(function(a){return a.segment===s;});});
 var legendKeys=segsPresent.map(function(s){return '<span style="display:inline-flex;align-items:center;gap:5px"><span style="width:9px;height:9px;border-radius:50%;background:'+PVSEG_COLOR[s]+';flex:none"></span>'+escD(PVSEG_LBL[s])+'</span>';}).join('');
 var incKey=effAssessments.some(function(a){return a.incumbent;})?'<span style="display:inline-flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:50%;border:1.5px dashed var(--blue);flex:none"></span>Existing Lilly vendor</span>':'';
 var legend='<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-family:var(--mono);font-size:10px;color:var(--mut2)">'+legendKeys+incKey+'</div>';
 // right, per-supplier differentiators (absorbs the old Key Differentiators & Trade-offs table)
 var hm=L.heatmap||{leaders:{}};var ereqs=input.requirements||[];var ledBy={},reqLabel={};
 ereqs.forEach(function(r){reqLabel[r.id]=r.label;var lid=hm.leaders[r.id];if(lid!=null)(ledBy[lid]=ledBy[lid]||[]).push(r.label);});
 // #4 (Marc): per-supplier differentiators as a flex-fill accordion (replaces the .mxseg table). Each row is a
 // 2-line card (segment/fit/risk/peak/watch + a Leads read on line 2); opening one shows the full detail. The
 // rows flex to fill the column so it stays height-balanced with the quadrant + assessment on the left for any
 // supplier count. Rows tie to the plane dots via pvSegPick (click a dot or a row; single-open; top default).
 var chev='<svg class="segacc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg>';
 var fits=[];
 var accRows=ranked.map(function(a,i){
   var col=pvSupColor(a);var rv=pvAuthRisk(a.id,a.riskScore);
   var cand=pvCandById(a.id);var dd=cand&&cand.deepDive;
   var fit=(cand&&cand.fit!=null)?cand.fit:Math.round(a.fitScore||0);fits.push(fit); // fitOf() is closure-local to pvExecSummaryHtml; derive it here
   var leadsArr=(ledBy[a.id]||[]);
   var leadsTxt=leadsArr.length?escD(leadsArr.join(', ')):'<span class="segmut">no single category &middot; competes on breadth &amp; price</span>';
   var leadsChp=leadsArr.length?leadsArr.map(function(x){return '<span class="seglchip">'+escD(x)+'</span>';}).join(''):'<span class="segmut">leads no single category</span>';
   var best=null;(a.coverage||[]).forEach(function(c){if(!best||c.score>best.score)best=c;});
   var peak=best?pvRound(best.score,1):null;var peakCat=best?escD(reqLabel[best.requirementId]||best.requirementId):null;
   var w=(dd&&dd.risksNarr&&dd.risksNarr[0])?dd.risksNarr[0]:null;
   var sevCls=w?(w.sev==='high'?'high':w.sev==='med'?'med':'low'):'';
   var sevB=w?('<span class="segsev '+sevCls+'">'+escD(w.sev==='med'?'medium':w.sev)+'</span>'):'';
   var read=a.segment==='disqualified'?'Carries a hard flag; off the shortlist.':(i===0?'Front-runner on the strongest requirements fit.':(a.segment==='challenger'?'Strong fit, but elevated risk to weigh.':(a.segment==='niche'?'Narrower fit; a fit-for-purpose option.':(a.segment==='caution'?'Narrower fit and elevated risk.':'A genuine contender in the field.'))));
   var meta='<span class="segchip '+a.segment+'">'+escD(PVSEG_LBL[a.segment])+'</span><span class="segmetric">fit '+escD(fit)+' &middot; risk '+escD(rv)+'</span>'+(peak!=null?'<span class="segpk">'+escD(peak)+'</span>':'')+sevB;
   var head='<div class="segacc-head" onclick="pvSegPick(\''+jarg(a.id)+'\')"><div class="segacc-top">'+chev+'<span class="segacc-nm"><span class="segdot" style="background:'+col+'"></span>'+escD(a.name)+'</span><span class="segacc-sp"></span><span class="segacc-meta">'+meta+'</span></div><div class="segacc-sub"><span class="k">Leads</span> '+leadsTxt+'</div></div>';
   var body='<div class="segacc-body"><div class="segacc-band">'+
     '<div class="segacc-seg"><span class="segacc-k">Leads field</span><span class="segacc-v">'+leadsChp+'</span></div>'+
     (peak!=null?'<div class="segacc-seg"><span class="segacc-k">Strongest</span><span class="segacc-v">'+peakCat+' <span class="segpk">'+escD(peak)+'</span></span></div>':'')+
     (w?'<div class="segacc-seg"><span class="segacc-k">Trade-off</span><span class="segacc-v">'+escD(w.cat)+' '+sevB+'</span></div>':'')+
     '</div><div class="segacc-read">'+escD(read)+'</div></div>';
   return '<div class="segacc-row'+(i===0?' open':'')+'" data-id="'+escD(a.id)+'" style="--acc:'+col+'">'+head+body+'</div>';
 }).join('');
 var accHtml='<div class="segR"><div class="segacc-h"><span>Candidates</span><span class="segacc-hint">rows fill the height · click to expand</span></div><div class="segacc">'+accRows+'</div></div>';
 // left, trimmed static overall assessment (grounded, dynamic); sits under the quadrant to use its dead space
 var fitLo=fits.length?Math.min.apply(null,fits):null,fitHi=fits.length?Math.max.apply(null,fits):null;
 var segCounts={};ranked.forEach(function(a){segCounts[a.segment]=(segCounts[a.segment]||0)+1;});
 var statChips=PVSEG_ORDER.filter(function(s){return segCounts[s];}).map(function(s){var pl=((s==='leader'||s==='challenger')&&segCounts[s]>1)?'s':'';return '<span class="segassess-stat">'+segCounts[s]+' '+escD(PVSEG_LBL[s])+pl+'</span>';}).join('')+((fitLo!=null&&fitHi!=null)?'<span class="segassess-stat">fit '+escD(fitLo)+'&ndash;'+escD(fitHi)+'</span>':'');
 var assess='<div class="segassess"><div class="segassess-h">Overall assessment <span class="segassess-tag">stays put</span>'+statChips+'</div><p class="segassess-p">'+escD(pvSegSynthesis(ranked,fitLo,fitHi))+'</p></div>';
 return '<div class="sa-card"><div class="card-hd"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span class="ct">Segmentation &amp; Differentiators</span><span class="cs">'+escD(ranked.length)+' ranked · fit cut '+escD(fitHigh)+'/100 · risk cut '+escD(riskHigh)+'/5</span></div>'+
   '<div class="scc-b"><div class="execgrid seg-md"><div class="segL">'+sliderHtml+plane+legend+assess+'</div>'+accHtml+'</div></div></div>';
}
// #4 (Marc): grounded, dynamic segmentation synthesis for the "Overall assessment" panel (plain text; escaped
// at the call site). Composition + fit spread + the recurring watch item, all read off the ranked assessments.
function pvSegSynthesis(ranked,fitLo,fitHi){
 var n=ranked.length;if(!n)return '';
 var byseg={};ranked.forEach(function(a){byseg[a.segment]=(byseg[a.segment]||0)+1;});
 var leaderN=byseg.leader||0;var s1;
 if(leaderN===n)s1='All '+n+' candidates clear the Leader bar, so this comes down to differentiation and risk, not viability';
 else if(leaderN>=Math.ceil(n/2))s1=leaderN+' of '+n+' land in the Leader band, so differentiation and risk decide it more than basic fit';
 else if(leaderN>0)s1='The field splits, with '+leaderN+' in the Leader band and '+(n-leaderN)+' below it';
 else s1='No candidate reaches the Leader band; the field is thin';
 var extra='';var caution=ranked.filter(function(a){return a.segment==='caution';});var dq=ranked.filter(function(a){return a.segment==='disqualified';});
 if(dq.length===1)extra=' '+dq[0].name+' carries a hard flag and is off the shortlist.';
 else if(dq.length>1)extra=' '+dq.length+' candidates carry hard flags.';
 else if(caution.length===1)extra=' Only '+caution[0].name+' slips to Caution.';
 else if(caution.length>1)extra=' '+caution.length+' fall to Caution.';
 var s2=(fitLo!=null&&fitHi!=null)?(' Fit spans '+fitLo+' to '+fitHi+', bunching at the top.'):'';
 var wc={};ranked.forEach(function(a){var c=pvCandById(a.id);var w=c&&c.deepDive&&c.deepDive.risksNarr&&c.deepDive.risksNarr[0];if(w&&w.cat)wc[w.cat]=(wc[w.cat]||0)+1;});
 var topCat=null,topN=0;Object.keys(wc).forEach(function(k){if(wc[k]>topN){topN=wc[k];topCat=k;}});
 var s3=(topCat&&topN>=2)?(' Risk separates the field more than fit, with '+topCat.toLowerCase()+' the most common watch item.'):' Risk, more than fit, is where the field separates.';
 return s1+'.'+extra+s2+s3;
}
// single-open accordion + dot ring: click a supplier row or a plane dot; clicking the open one collapses it.
function pvSegPick(id){
 var open=false;var rows=document.querySelectorAll('.pvsl .segacc-row');
 [].forEach.call(rows,function(r){if(r.getAttribute('data-id')===id&&r.classList.contains('open'))open=true;});
 [].forEach.call(rows,function(r){r.classList.toggle('open',r.getAttribute('data-id')===id&&!open);});
 [].forEach.call(document.querySelectorAll('.pvsl .plane .pdot'),function(d){d.classList.toggle('pdot-sel',d.getAttribute('data-id')===id&&!open);});
}
/* ---- Start-an-RFx (Pass B): real in-tab reflect-only flow. Pre-checks the recommended slate,
   lets you add off-landscape suppliers + include suggested qualified incumbents, soft-caps at 5,
   and routes the draft to the sourcing rep for approval (which seeds the RFx tab bidder set). ---- */
function pvStartRfx(){
 PVSL_RFX_PICK={};PVSL_RFX_SENT=false;
 if(PVSL_INPUT){var refl=PVSLE.reflect(PVSL_INPUT);refl.landscape.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;}).slice(0,5).forEach(function(a){PVSL_RFX_PICK[a.id]=true;});}
 PVSL_RFX_OPEN=true;pvRfxRenderDrawer();
}
/* Pass 2B: render the Start-an-RFx flow into the shared project-view DRAWER (over the scrim) instead of
   persisting it at the top of Exec Summary. Re-renders in place on every pick / add / submit. */
function pvRfxRenderDrawer(){
 if(!PVSL_INPUT)return;
 var d=document.getElementById('drawer');if(!d)return;
 var refl=PVSLE.reflect(PVSL_INPUT);
 d.innerHTML='<div class="pvsl"><div class="dh"><div><h3>Start an RFx</h3><div class="dsub">Draft bidder set · a draft until the rep approves</div></div><div class="dc" onclick="pvCloseRfx()">&times;</div></div><div class="db">'+pvRfxBodyHtml(refl,PVSL_INPUT)+'</div></div>';
 var s=document.getElementById('scrim');if(s)s.classList.add('on');
 d.classList.add('on');
}
function pvCloseRfx(){PVSL_RFX_OPEN=false;PVSL_RFX_SENT=false;if(typeof closeDrawer==='function')closeDrawer();else{var d=document.getElementById('drawer'),s=document.getElementById('scrim');if(d)d.classList.remove('on');if(s)s.classList.remove('on');}}
function pvRfxEdit(){PVSL_RFX_SENT=false;pvRfxRenderDrawer();}
function pvRfxToggle(id){if(PVSL_RFX_PICK[id])delete PVSL_RFX_PICK[id];else PVSL_RFX_PICK[id]=true;pvRfxRenderDrawer();}
function pvRfxAdd(){var el=document.getElementById('pvrfxadd');var v=el&&el.value?el.value.trim():'';if(!v){toast('Type a supplier name to add.');return;}PVSL_RFX_PICK['ext:'+v]=true;pvRfxRenderDrawer();}
function pvRfxSubmit(){PVSL_RFX_SENT=true;pvRfxRenderDrawer();}
function pvRfxPickedNames(ranked){
 var names=[];
 ranked.forEach(function(a){if(PVSL_RFX_PICK[a.id])names.push(a.name);});
 PVSL_RFX_SUGGEST.forEach(function(s){if(PVSL_RFX_PICK[s.id])names.push(s.n);});
 Object.keys(PVSL_RFX_PICK).filter(function(k){return k.indexOf('ext:')===0;}).forEach(function(k){names.push(k.slice(4));});
 return names;
}
/* body-only, the shared drawer supplies the .dh header + .db padding */
function pvRfxBodyHtml(refl,input){
 var L=refl.landscape;
 var ranked=L.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;});
 // pending-approval confirmation state
 if(PVSL_RFX_SENT){
   var names=pvRfxPickedNames(ranked);
   var chips=names.map(function(n){return '<span class="bchip"><b>'+escD(n)+'</b></span>';}).join('')||'<span class="bchip">no suppliers selected</span>';
   return '<div class="rfxpending"><div class="rpp-h"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Routed for approval · nothing created yet</div>This draft bidder set of <b>'+escD(names.length)+' supplier'+(names.length===1?'':'s')+'</b> has been routed to the <b>sourcing rep</b> for approval. It stays a draft until the rep approves, no vendor is selected, contacted, or awarded. On approval it seeds the <b>RFx tab bidder set</b> as human-confirmed inputs.<div class="basis" style="margin-top:11px">'+chips+'</div></div>'+
     '<div class="rfxfoot"><div style="flex:1"></div><button class="pvbtn" onclick="pvRfxEdit()">Edit the draft</button><button class="pvbtn primary" onclick="pvCloseRfx()">Done</button></div>';
 }
 var rows=ranked.map(function(a){
   var cand=pvCandById(a.id);var on=!!PVSL_RFX_PICK[a.id];var f5=pvRound(a.fitScore/20,1);var tag=a.rank===1?'lead':(a.rank===2?'secondary':'slate');
   return '<label class="rfxrow"><input type="checkbox" '+(on?'checked':'')+' onchange="pvRfxToggle(\''+escD(a.id)+'\')"><span><span class="rfxn">'+escD(a.name)+'</span> <span class="rfxsub">· '+escD(cand?cand.sub:'')+'</span></span><span class="rfxm" style="color:var(--blue);background:var(--blue-t)">fit '+escD(f5)+'/5 · '+escD(tag)+'</span></label>';
 }).join('');
 var sugRows=PVSL_RFX_SUGGEST.map(function(s){var on=!!PVSL_RFX_PICK[s.id];return '<div class="rfxsug"><div class="rsug-b"><div class="rsug-n">'+escD(s.n)+'</div><div class="rsug-w">'+escD(s.why)+'</div></div><span class="rsug-tag">qualified · not scanned</span><button class="pvbtn'+(on?' on':'')+'" onclick="pvRfxToggle(\''+escD(s.id)+'\')">'+(on?'Included &#10003;':'Include')+'</button></div>';}).join('');
 var extras=Object.keys(PVSL_RFX_PICK).filter(function(k){return k.indexOf('ext:')===0;}).map(function(k){var nm=k.slice(4);return '<label class="rfxrow"><input type="checkbox" checked onchange="pvRfxToggle(\''+escD(k)+'\')"><span><span class="rfxn">'+escD(nm)+'</span> <span class="rfxsub">· added, off-landscape</span></span><span class="rfxm" style="color:var(--mut);background:var(--bg)">manual</span></label>';}).join('');
 var count=Object.keys(PVSL_RFX_PICK).length;
 var over=count>5;
 var cap=over?'<span class="rfxcap">&#9888; Keep an RFx to &#8804;5 suppliers where possible, '+escD(count)+' selected. You can proceed, but consider trimming.</span>':'<span class="rfxcount">'+escD(count)+' selected · soft cap 5</span>';
 return '<p class="rfxlede">The recommended slate is pre-checked. Add or remove suppliers, pull in a qualified incumbent, or enter one off the landscape, then route the draft to the sourcing rep for approval. Draft until approved; on approval it seeds the RFx tab bidder set.</p>'+
   '<div class="rfxsec"><div class="rfxsechd">Recommended slate · pre-checked</div>'+rows+'</div>'+
   '<div class="rfxsec"><div class="rfxsechd">Suggested qualified incumbents · not in the scan</div>'+sugRows+'</div>'+
   (extras?'<div class="rfxsec"><div class="rfxsechd">Added off-landscape</div>'+extras+'</div>':'')+
   '<div class="rfxsec"><div class="rfxsechd">Add a supplier not in the landscape</div><div class="rfxadd"><input type="text" id="pvrfxadd" placeholder="Supplier name (free entry)…" onkeydown="if(event.key===\'Enter\'){event.preventDefault();pvRfxAdd();}"><button class="pvbtn" onclick="pvRfxAdd()">Add</button></div></div>'+
   '<div class="rfxfoot">'+cap+'<div style="flex:1"></div><button class="pvbtn" onclick="pvCloseRfx()">Cancel</button><button class="pvbtn primary" onclick="pvRfxSubmit()">Send to sourcing rep for approval &rarr;</button></div>';
}
/* ---- ② Supplier Deep Dive (vendor dropdown + 5 nested sub-tabs) ---- */
function pvDDVerdictStrip(a,cand,input){
 var vm=pvVerdictMeta(pvAssessVerdict(a,cand));
 var riskHigh=(input.segmentation&&input.segmentation.riskHigh!=null)?input.segmentation.riskHigh:2.5;
 var elevated=a.riskScore>=riskHigh;var f5=pvRound(a.fitScore/20,1);
 var rat='Advisory read from this project candidate set: weighted fit '+f5+'/5, risk '+a.riskScore+'/5, '+String(PVSEG_LBL[a.segment]||'').toLowerCase()+'. Not an award; no vendor is selected or contacted.';
 return '<div class="pvvstrip '+vm.cls+'"><div><div style="font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--mut)">Advisory verdict</div><div class="vv">'+escD(vm.lbl)+'</div></div>'+
   '<div class="basis" style="flex:0 0 auto"><span class="bchip">fit <b>'+escD(f5)+'</b>/5</span><span class="bchip" style="color:'+(elevated?'var(--red-d)':'var(--blue-d)')+'">risk <b>'+escD(a.riskScore)+'</b>/5</span><span class="bchip">'+(a.rank!=null?('rank <b>#'+escD(a.rank)+'</b>'):'<b>disqualified</b>')+'</span><span class="bchip"><b>'+escD(PVSEG_LBL[a.segment])+'</b></span></div>'+
   '<div class="vr">'+escD(rat)+'</div></div>';
}
// STAGE DeepDive #3 (offering->requirement tie): ties each named offering (Profile tab) to the requirement
// CATEGORY it most speaks to, from the SAME requirements model the heatmap scores against. Deterministic
// keyword overlap over the offering's name/note vs. each category's label + its sub-requirement labels, no
// invented mapping data; an offering with no lexical overlap is shown as unmatched rather than guessed.
var PV_OFFTIE_STOP={and:1,the:1,for:1,with:1,from:1,into:1,over:1,that:1,this:1,your:1,core:1,native:1,based:1,service:1,services:1,platform:1,solution:1,solutions:1,system:1,systems:1,via:1,across:1,per:1,using:1};
function pvOffTok(s){return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(function(w){return w.length>2&&!PV_OFFTIE_STOP[w];});}
function pvOffOverlap(aTok,bTok){
 var bSet={};bTok.forEach(function(t){bSet[t]=1;});
 var n=0;
 aTok.forEach(function(t){
  if(bSet[t]){n++;return;}
  for(var k in bSet){if(k.length>=4&&t.length>=4&&(k.indexOf(t)===0||t.indexOf(k)===0)){n++;return;}}
 });
 return n;
}
function pvOfferingReqTie(off,reqs){
 if(!off||!reqs||!reqs.length)return null;
 var offTok=pvOffTok((off.name||'')+' '+(off.note||''));
 if(!offTok.length)return null;
 var best=null;
 reqs.forEach(function(r){
  var catTok=pvOffTok(r.label||'');
  (r.subs||[]).forEach(function(s){catTok=catTok.concat(pvOffTok(s.label||''));});
  var score=pvOffOverlap(offTok,catTok);
  if(score>0&&(!best||score>best.score))best={label:r.label,score:score};
 });
 return best;
}
// STAGE DeepDive #3 (Marc): small inline-SVG bar sparkline for financials.revenueHistory[] ({period,value}
// pairs, value a free-text sourced string e.g. "$4.684B (+29% YoY)"). Parses the leading $ figure + B/M/K
// suffix, normalizes to $M for bar-height scaling only (never re-derives or invents a number, the ORIGINAL
// text stays the bar title + the value label drawn above each bar). Renders nothing if unparseable.
function pvRevHistParse(v){
 var m=String(v||'').match(/\$?\s*([\d.,]+)\s*([BMK])?/i);
 if(!m)return null;
 var num=parseFloat(m[1].replace(/,/g,''));
 if(!isFinite(num))return null;
 var mult=m[2]?({B:1000,M:1,K:.001}[m[2].toUpperCase()]):1;
 return num*mult; // normalized to $M, bar-scaling only
}
function pvRevHistSvg(hist){
 if(!hist||!hist.length)return '';
 var pts=hist.map(function(h){return {period:h.period||'',label:h.value||'',mval:pvRevHistParse(h.value)};});
 var vals=pts.map(function(p){return p.mval;}).filter(function(v){return v!=null;});
 if(!vals.length)return '';
 var max=Math.max.apply(null,vals);
 var n=pts.length,W=Math.max(240,n*62),H=118,padT=20,padB=24,plotH=H-padT-padB;
 var gap=W/n,bw=Math.min(42,gap*.52);
 var bars=pts.map(function(p,i){
   var h=(p.mval!=null&&max>0)?Math.max(3,(p.mval/max)*plotH):3;
   var x=i*gap+(gap-bw)/2,y=padT+plotH-h,isLast=i===n-1;
   var fill=isLast?'var(--ddacc,#5C2B50)':'var(--ddacc-t,rgba(92,43,80,.16))';
   var vlab=p.mval!=null?String(p.label).split(/[\s(]/)[0]:'';
   return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+fill+'"'+(isLast?'':' stroke="var(--ddacc,#5C2B50)" stroke-width="1.1"')+'><title>'+escD(p.period+': '+p.label)+'</title></rect>'+
     (vlab?'<text x="'+(x+bw/2).toFixed(1)+'" y="'+(y-5).toFixed(1)+'" text-anchor="middle" font-size="8.5" font-family="var(--mono)" font-weight="700" fill="var(--ink)">'+escD(vlab)+'</text>':'')+
     '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" font-size="9" font-family="var(--mono)" fill="var(--mut2)">'+escD(p.period)+'</text>';
 }).join('');
 return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:460px;height:112px;display:block" role="img" aria-label="Revenue by fiscal period, normalized bar chart">'+bars+'</svg>';
}
/* ============ Automated-RFI decision layer (Marc, 2026-07): the Supplier Deep Dive answers ONE
   question per candidate, do we INVITE this supplier to the RFP, and what must we PROBE if we do.
   Every value below is DERIVED from EXISTING model fields (coverage /5, subFit must-haves, composite,
   eligibility, gating, attrs); nothing here re-derives or invents a score. The met/partial/gap bands
   and the 3.5 knockout line are DISPLAY classifications of the already-computed scores. ============ */
// top-level accent card (mirrors the local pvCard inside pvDDSection so these helpers can build cards too)
function pvDDCardTop(icon,title,inner,accent){return '<div class="sa-card" style="border-left:3px solid '+(accent||'var(--ddacc,var(--navy))')+'">'+pvDdCardHd(icon,'<span class="ct">'+title+'</span>')+'<div class="scc-b">'+inner+'</div></div>';}
function pvStripTags(s){return String(s).replace(/<[^>]+>/g,'').replace(/&rsquo;/g,"'").replace(/&amp;/g,'&').replace(/&middot;/g,'·').replace(/&ge;/g,'>=').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#9888;/g,'').replace(/\s+/g,' ').trim();}
var PV_RF_MET=4.25,PV_RF_GAP=3.5; // display bands: met >=4.25 · partial 3.50-4.24 · gap <3.50 (a must-have SUB below 3.5 is a knockout)
// per-requirement met/partial/gap read for ONE candidate + must-have knockout detection (subFit must-subs <3.5)
function pvReqFitRead(a,cand,input){
 var defById={};((input&&input.requirements)||[]).forEach(function(r){defById[r.id]=r;});
 var rows=[],knockouts=[],metCount=0,partialCount=0,gapCount=0;
 ((a&&a.coverage)||[]).forEach(function(c){
   var sc=c.score;
   var state=sc>=PV_RF_MET?'met':(sc>=PV_RF_GAP?'partial':'gap');
   if(state==='met')metCount++;else if(state==='partial')partialCount++;else gapCount++;
   var rdef=defById[c.requirementId]||{};
   var mustSubs=((rdef.subs)||[]).filter(function(s){return s.must;});
   var subKnock=[];
   mustSubs.forEach(function(s){
     var v=(cand&&cand.subFit&&cand.subFit[c.requirementId])?cand.subFit[c.requirementId][s.id]:null;
     if(v!=null&&isFinite(v)&&v<PV_RF_GAP){subKnock.push({sub:s.label,score:v});knockouts.push({cat:c.label,sub:s.label,score:v});}
   });
   rows.push({id:c.requirementId,label:c.label,score:sc,state:state,hasMust:mustSubs.length>0,knockouts:subKnock});
 });
 return {rows:rows,metCount:metCount,partialCount:partialCount,gapCount:gapCount,knockouts:knockouts,hasKnockout:knockouts.length>0};
}
// competitive shortlist band, REUSING the exact Exec Summary logic (PV_EXEC_AUTH composite -> top -> 10%/8pt band)
function pvShortlistBand(refl){
 var L=refl.landscape;
 var ranked=L.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;});
 var recAuth=(typeof PV_EXEC_AUTH!=='undefined'&&PV_EXEC_AUTH)?PV_EXEC_AUTH:{};
 var comps=ranked.map(function(a){var ra=recAuth[a.id];return {id:a.id,comp:(ra?ra.comp:Math.round(a.compositeScore)),eligible:a.eligible};});
 var topComp=comps.length?Math.max.apply(null,comps.map(function(x){return x.comp;})):0;
 var slBandPts=Math.max(8,Math.round(topComp*0.10));
 var ids={},compOf={};
 comps.forEach(function(x){compOf[x.id]=x.comp;if(x.eligible&&(topComp-x.comp)<=slBandPts)ids[x.id]=true;});
 return {ids:ids,topComp:topComp,slBandPts:slBandPts,compOf:compOf};
}
// INVITE / HOLD / PASS: eligible+in-band -> invite; disqualified OR (eligible+elevated-risk+open must-have gap) -> pass; else hold
function pvInviteVerdict(a,cand,input,band,rr){
 var riskHigh=(input.segmentation&&input.segmentation.riskHigh!=null)?input.segmentation.riskHigh:2.5;
 var elevated=a.riskScore>=riskHigh;
 var f5=pvRound(a.fitScore/20,1);
 var comp=(band.compOf&&band.compOf[a.id]!=null)?band.compOf[a.id]:Math.round(a.compositeScore);
 var gap=band.topComp-comp;
 if(!a.eligible||a.rank==null){
   var reason=(a.disqualifiers&&a.disqualifiers.length)?a.disqualifiers.map(function(d){return d.detail;}).join('; '):'carries a hard disqualifying flag';
   return {key:'PASS',lbl:'Pass',cls:'pass',why:'Disqualified, '+reason+'. Off the shortlist; do not carry into the RFP.'};
 }
 if(elevated&&rr.hasKnockout){
   var k=rr.knockouts[0];
   return {key:'PASS',lbl:'Pass',cls:'pass',why:'Eligible but on elevated risk ('+a.riskScore+'/5) with an open must-have gap, '+k.sub+' at '+k.score+'/5. Screen and remediate before any invite.'};
 }
 if(band.ids[a.id]){
   return {key:'INVITE',lbl:'Invite to RFP',cls:'invite',why:'Eligible and inside the competitive band (composite '+comp+', within '+band.slBandPts+' pts of the top) at '+(elevated?'elevated':'contained')+' risk, weighted fit '+f5+'/5'+(rr.hasKnockout?', confirm the open must-have gap on '+rr.knockouts[0].sub+' in the RFP':'')+'.'};
 }
 return {key:'HOLD',lbl:'Hold',cls:'hold',why:'Eligible but outside the competitive band (composite '+comp+', '+gap+' pts behind the top). Hold as a fallback unless the shortlist narrows or requirements shift.'};
}
// verdict header, THE answer at the top of the deep dive: chip + composite/fit/risk + met/partial/gap + one-line why
function pvVerdictHeaderHtml(a,cand,refl,input){
 var band=pvShortlistBand(refl),rr=pvReqFitRead(a,cand,input),vd=pvInviteVerdict(a,cand,input,band,rr);
 var f5=pvRound(a.fitScore/20,1);
 var comp=(band.compOf&&band.compOf[a.id]!=null)?band.compOf[a.id]:Math.round(a.compositeScore);
 var riskHigh=(input.segmentation&&input.segmentation.riskHigh!=null)?input.segmentation.riskHigh:2.5;
 var elevated=a.riskScore>=riskHigh;
 var koChip=rr.hasKnockout?'<span class="ddv-ko">&#9888; '+rr.knockouts.length+' must-have knockout'+(rr.knockouts.length>1?'s':'')+'</span>':'';
 return '<div class="ddverdict '+vd.cls+'">'+
   '<div class="ddv-chip"><span class="ddv-eyebrow">RFP decision</span><span class="ddv-lbl">'+escD(vd.lbl)+'</span></div>'+
   '<div class="ddv-main"><div class="ddv-scores">'+
     '<span class="ddv-sc"><b>'+escD(comp)+'</b><i>composite</i></span>'+
     '<span class="ddv-sc"><b>'+escD(f5)+'</b><i>fit /5</i></span>'+
     '<span class="ddv-sc'+(elevated?' hot':'')+'"><b>'+escD(a.riskScore)+'</b><i>risk /5</i></span>'+
     '<span class="ddv-sc"><b>'+rr.metCount+' / '+rr.partialCount+' / '+rr.gapCount+'</b><i>met / partial / gap</i></span>'+
     koChip+
   '</div><div class="ddv-why">'+escD(vd.why)+'</div></div>'+
 '</div>';
}
// auto-derived open items: partial/gap requirements (must-haves first), gating screens, unconfirmed/missing facts
function pvOpenQuestionsList(a,cand,input,rr){
 var dd=cand.deepDive||{};var out=[];
 rr.knockouts.forEach(function(k){out.push({tag:'Must-have',sev:'ko',
   html:'Confirm <b>'+escD(k.sub)+'</b> ('+escD(k.cat)+'), our no-contact scan reads '+escD(k.score)+'/5, below the 3.5 must-have threshold. Need current evidence (certification, attestation or a live demo) that this is fully met, or it is a knockout.',
   plain:'Confirm '+k.sub+' ('+k.cat+'): our scan reads '+k.score+'/5, below the 3.5 must-have threshold. Please provide current evidence (certification, attestation or demo) that this requirement is fully met.'});});
 rr.rows.filter(function(r){return r.state==='gap'&&!r.knockouts.length;}).forEach(function(r){out.push({tag:'Gap',sev:'gap',
   html:'Probe <b>'+escD(r.label)+'</b>, scored '+escD(r.score)+'/5 (gap). Ask how the supplier closes this and on what timeline.',
   plain:'Probe '+r.label+': scored '+r.score+'/5 (gap). How is this closed, and on what timeline?'});});
 rr.rows.filter(function(r){return r.state==='partial';}).forEach(function(r){out.push({tag:'Partial',sev:'partial',
   html:'Clarify <b>'+escD(r.label)+'</b>, scored '+escD(r.score)+'/5 (partial). Confirm the specifics and any conditions before relying on it.',
   plain:'Clarify '+r.label+': scored '+r.score+'/5 (partial). Confirm the specifics and any conditions.'});});
 (dd.gating||[]).forEach(function(g){out.push({tag:'Screen',sev:'screen',
   html:'Screen <b>'+escD(g.item)+'</b>, flagged as requiring a formal screen before award if pursued.',
   plain:'Screen '+g.item+': flagged as requiring a formal screen before award if pursued.'});});
 [['HQ','hq'],['Founded','founded'],['Financial status','financial'],['Indicative pricing','pricing'],['ESG posture','esg'],['Integration approach','integration']].forEach(function(d){
   var v=(dd.attrs&&dd.attrs[d[1]]);if(!v||/^data not available$/i.test(String(v).trim())){out.push({tag:'Missing',sev:'data',
     html:'Provide <b>'+escD(d[0])+'</b>, not available in our scan.',
     plain:'Provide '+d[0]+': not available in our scan.'});}
 });
 var idn=dd.identity||{};if(!idn.confidence||idn.confidence!=='Confirmed'){out.push({tag:'Unconfirmed',sev:'data',
   html:'Confirm corporate identity & ownership, our firmographic read is public enrichment, not validated against the vendor master.',
   plain:'Confirm corporate identity and ownership: our firmographic read is public enrichment, not yet validated against the vendor master.'});}
 return out;
}
// requirements-fit candidate read (THE STAR): per-requirement met/partial/gap chips + knockout flags
function pvReqFitCandidateCard(a,cand,input,rr){
 var dd=cand.deepDive||{};
 var stMeta={met:{l:'Met',c:'var(--teal-d)',bg:'var(--teal-t)'},partial:{l:'Partial',c:'var(--amber-d)',bg:'var(--ti-amber)'},gap:{l:'Gap',c:'var(--riskred)',bg:'var(--ti-red)'}};
 var rows=rr.rows.map(function(r){
   var m=stMeta[r.state];var narr=(dd.reqNarr&&dd.reqNarr[r.id])||'';
   var koTag=r.knockouts.length?('<div class="rf-ko">&#9888; KNOCKOUT · must-have '+r.knockouts.map(function(k){return escD(k.sub)+' '+escD(k.score)+'/5';}).join(', ')+' below 3.5</div>'):'';
   var mustTag=(r.hasMust&&!r.knockouts.length)?' <span class="rf-must">must-have</span>':'';
   return '<tr class="rf-row rf-'+r.state+'">'+
     '<td class="rf-req"><b>'+escD(r.label)+'</b>'+mustTag+koTag+(narr?'<div class="rf-nr">'+escD(narr)+'</div>':'')+'</td>'+
     '<td class="rf-sc"><span class="cell" style="'+pvFitBg(r.score)+'">'+escD(r.score)+'</span></td>'+
     '<td class="rf-st"><span class="rf-chip" style="color:'+m.c+';background:'+m.bg+'">'+m.l+'</span></td>'+
   '</tr>';
 }).join('');
 var summary='<div class="rf-sum">'+
   '<span class="rf-scount met"><b>'+rr.metCount+'</b> met</span>'+
   '<span class="rf-scount partial"><b>'+rr.partialCount+'</b> partial</span>'+
   '<span class="rf-scount gap"><b>'+rr.gapCount+'</b> gap</span>'+
   (rr.hasKnockout?'<span class="rf-scount ko"><b>'+rr.knockouts.length+'</b> must-have knockout'+(rr.knockouts.length>1?'s':'')+'</span>':'')+
 '</div>';
 var inner=summary+
   '<div class="rf-lede">Automated RFI: <b>'+escD(a.name)+'</b>&rsquo;s capability scored against each requirement <b>without contacting the supplier</b>. Met &ge;4.25/5 &middot; Partial 3.50&ndash;4.24 &middot; Gap &lt;3.50. A <b>must-have</b> below 3.5/5 is a knockout.</div>'+
   '<div class="mxwrap"><table class="rffit"><thead><tr><th>Requirement</th><th class="c">Fit /5</th><th>Read</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
   '<div class="footbound">Landscape estimate from public sources, analyst positions and internal history. Once an RFx is issued, the supplier&rsquo;s own submitted evidence supersedes this read.</div>';
 return pvDDCardTop('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>','Requirements fit &middot; '+escD(a.name),inner);
}
// open-questions panel: the automated RFI's numbered open list
function pvOpenQuestionsCard(a,cand,input,rr){
 var qs=pvOpenQuestionsList(a,cand,input,rr);
 if(!qs.length)return pvDDCardTop('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 4"/><path d="M12 17h.01"/>','Open questions to confirm &middot; '+escD(a.name),'<div class="footbound">No open items: every requirement clears at 4.25/5+, no must-have gap, and the firmographic scan is complete. Standard pre-award confirmations still apply.</div>','var(--teal-d)');
 var sevMeta={ko:{c:'var(--riskred)',bg:'var(--ti-red)'},gap:{c:'var(--riskred)',bg:'var(--ti-red)'},partial:{c:'var(--amber-d)',bg:'var(--ti-amber)'},screen:{c:'var(--amber-d)',bg:'var(--ti-amber)'},data:{c:'var(--mut2)',bg:'var(--nested)'}};
 var items=qs.map(function(q,i){var m=sevMeta[q.sev]||sevMeta.data;return '<li class="oq-item"><span class="oq-n">'+(i+1)+'</span><span class="oq-tag" style="color:'+m.c+';background:'+m.bg+'">'+escD(q.tag)+'</span><span class="oq-tx">'+q.html+'</span></li>';}).join('');
 var inner='<div class="rf-lede">Auto-derived from every partial/gap requirement (must-haves first) and every field the scan could not confirm. This is the automated RFI&rsquo;s open list, <b>what to confirm with '+escD(a.name)+'</b> before or during the RFP.</div><ol class="oqlist">'+items+'</ol>';
 return pvDDCardTop('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 4"/><path d="M12 17h.01"/>','Open questions to confirm &middot; '+escD(a.name),inner,'var(--amber-d)');
}
// Request-more-data card REMOVED (Marc, 2026-07-23): the copy-ready outreach package belongs in the companion
// supplier-outreach skill's ACTION layer (it drafts the emails; M365 responses flow back to re-enrich), not as
// a panel on this reflect-only dashboard. The Open Questions list (what to ask) remains, now on Lilly Fit.
function pvDDSection(ddt,a,cand,refl,input){
 var dd=cand.deepDive||{};
 // STAGE DeepDive #2: sub-cards get a colour accent (left border) instead of flowing together under .subt
 // labels; default accent is the per-supplier identity colour already threaded through this tab via --ddacc,
 // callers pass a specific EXISTING status tint (viability / confidence / severity) where one is meaningful.
 var pvCard=function(icon,title,inner,accent){return '<div class="sa-card" style="border-left:3px solid '+(accent||'var(--ddacc,var(--navy))')+'">'+pvDdCardHd(icon,'<span class="ct">'+title+'</span>')+'<div class="scc-b">'+inner+'</div></div>';};
 if(ddt==='profile'){
   // STAGE DeepDive #2 (Marc): "Company snapshot" + "Corporate identity" + "Key Attributes" were three
   // separate cards repeating the same HQ / founded / ownership / financial facts under three different
   // labels. Merged into ONE consolidated Identity & Company panel: a single deduped key/value grid,
   // every identity/company fact (incl. headcount, customers, funding) a row, preferring the richer
   // top-level financials.* / deepDive.company.* value where both exist. Pricing / contract-flex /
   // integration / Gartner move out entirely, they already render on the Financials and Roadmap cards
   // below and repeating the exact same string on the same tab was pure duplication, not enrichment.
   // De-bubble (Marc, LOCKED): no boxed "cosnap" stat-tiles here; every fact is a plain key/value row.
   // Reorganized (Marc, 2026-07-23) into two labeled sub-categories: Corporate identity firmographics (legal
   // entity first, D&B-style), then a discrete Financial position snapshot (ticker / revenue / profitability /
   // market cap / funding / ESG). The Financial position SNAPSHOT here is deliberate (D&B company-profile +
   // Bloomberg-DES convention); the Market & Financials tab holds the DEEP view (multi-year trend table,
   // revenue chart, commercial estimate), snapshot vs. detail, not a duplication.
   var idn=dd.identity||{},comp=dd.company||{},pAttrs=dd.attrs||{},finTop=cand.financials||{};
   var idKnown=idn.legal||idn.parent||idn.ownership||idn.ticker||idn.jurisdiction;
   var compKnown=comp.headcount||comp.customers||comp.valuation||comp.funding||comp.founded||comp.footprint||comp.leadership||comp.partners;
   var confMeta=null,confChip='',icBlk='';
   if(idKnown||compKnown||pAttrs.hq||pAttrs.founded||pAttrs.financial||pAttrs.esg){
     confMeta=idn.confidence==='Confirmed'?{c:'#5C2B50',bg:'var(--ti-blue)'}:(idn.confidence?{c:'#B4560F',bg:'var(--ti-amber)'}:null);
     confChip=(idn.confidence&&confMeta)?' <span style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:2px 9px;border-radius:20px;color:'+confMeta.c+';background:'+confMeta.bg+';vertical-align:1px">Identity: '+escD(idn.confidence)+'</span>':'';
     // Values read from the enriched fields with light cleaning to split conflated facts (HQ vs footprint,
     // ticker vs ownership prose); nothing invented, a missing field simply drops its row.
     var clean=function(v){return (v==null||v==='')?'':String(v);};
     var beforeSemi=function(v){v=clean(v);return v?v.split(';')[0].trim():'';};
     var beforeParen=function(v){v=clean(v);return v?v.split('(')[0].trim():'';};
     var stripLeadHQ=function(v){v=clean(v);return v?v.replace(/^Legal HQ[^;]*;\s*/i,'').trim():'';};
     var tickerDisp=(clean(idn.ownership).match(/([A-Z]{2,6}\s*:\s*[A-Z.]{1,6})/)||[])[1]||clean(idn.ticker);
     var idRow=function(k,v){var val=clean(v);if(!val)return '';return '<div style="display:grid;grid-template-columns:160px 1fr;gap:14px;padding:8px 0;border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.55"><span style="color:var(--mut2);font-weight:600">'+k+'</span><span style="color:var(--ink)">'+escD(val)+'</span></div>';};
     var idSub=function(t,first){return '<div style="font:700 10px var(--mono,monospace);letter-spacing:.07em;text-transform:uppercase;color:var(--ddacc,var(--navy));margin:'+(first?'2':'18')+'px 0 7px;padding-bottom:5px;border-bottom:2px solid var(--ddacc,var(--navy))">'+t+'</div>';};
     var corpRows=idRow('Legal entity',idn.legal)+idRow('Ownership / structure',idn.parent||idn.ownership)+idRow('Incorporation',beforeParen(idn.jurisdiction))+idRow('Corporate address',beforeSemi(pAttrs.hq)||beforeSemi(comp.footprint))+idRow('Footprint',stripLeadHQ(comp.footprint))+idRow('Founded',comp.founded||pAttrs.founded)+idRow('Leadership',comp.leadership)+idRow('Headcount',comp.headcount);
     var finRows=idRow('Listing / ticker',tickerDisp)+idRow('Revenue',beforeSemi(finTop.revenue)||finTop.latestRevenue)+idRow('Profitability',finTop.profitability||beforeSemi(finTop.margin))+idRow('Market cap',beforeSemi(finTop.valuationOrMarketCap)||beforeSemi(comp.valuation))+idRow('Funding raised',finTop.funding||comp.funding)+idRow('ESG',pAttrs.esg);
     var partnersLine=comp.partners?'<div class="cosnap-line" style="margin-top:12px"><span class="cosnap-k">Partners &amp; ecosystem</span> '+escD(comp.partners)+'</div>':'';
     icBlk=(corpRows?idSub('Corporate identity',true)+corpRows:'')+(finRows?idSub('Financial position')+finRows:'')+partnersLine+
       '<p class="pvka-note">Identity, ownership and company-scale facts are <b>public</b> enrichment (credible public sources &middot; not validated); a live deep dive resolves identity against the Lilly vendor master before asserting a parent, a wrong-company profile is worse than none.</p>';
   }
   // G9 roadmap & vision, a forward-look from the analyst position + the roadmap/extensibility sub-fit
   // (+ its authored rationale). All from data already in the model; illustrative/external.
   var roadScore=(cand.subFit&&cand.subFit.functional)?cand.subFit.functional.fx_road:null;
   var roadNarr=(dd.reqSubNarr&&dd.reqSubNarr.functional)?dd.reqSubNarr.functional.fx_road:'';
   var gartnerV=pAttrs.gartner||'';
   var roadBlk=(roadScore!=null||roadNarr||gartnerV)?(
     (gartnerV?'<div style="font-size:12.5px;margin-bottom:7px"><b style="color:var(--mut2)">Analyst position &middot;</b> '+escD(gartnerV)+'</div>':'')+
     (roadScore!=null?'<div style="display:flex;align-items:center;gap:9px;margin-bottom:7px"><span style="font-size:11.5px;color:var(--mut2);font-weight:600;width:150px">Roadmap &amp; extensibility fit</span><div style="flex:1;max-width:170px;height:7px;border-radius:4px;background:var(--nested);overflow:hidden"><i style="display:block;height:100%;width:'+(roadScore/5*100)+'%;background:var(--ddacc,#5C2B50)"></i></div><span style="font-family:var(--mono);font-weight:700;font-size:12px;color:var(--ddacc,var(--navy))">'+escD(roadScore)+'/5</span></div>':'')+
     (roadNarr?'<div style="font-size:12.5px;color:var(--mut);line-height:1.5">'+escD(roadNarr)+'</div>':'')
   ):'';
   // Offering profile (skill Section 2, descriptive), named offerings/modules + delivery model + a one-line
   // capability narrative (reuses the solution prose that now lives here rather than on Market & Financials).
   var offs=dd.offerings||[];
   var reqModel=input.requirements||[];
   var offBlk='';
   if(offs.length||idn.delivery||dd.solution){
     // STAGE DeepDive #3: tie each named offering to the requirement category it lexically addresses
     // (pvOfferingReqTie, keyword overlap over the SAME requirements model the heatmap scores against).
     var offRows=offs.map(function(o){
       var tie=reqModel.length?pvOfferingReqTie(o,reqModel):null;
       var tieTag=tie?('<div class="offtie" title="Keyword read against the submitted requirement categories &middot; not a validated capability map">&rarr; addresses <b>'+escD(tie.label)+'</b></div>'):(reqModel.length?'<div class="offtie mut">&rarr; no direct requirement match</div>':'');
       return '<tr><td class="dt">'+escD(o.name||'')+'</td><td class="dd">'+escD(o.note||'')+tieTag+'</td></tr>';
     }).join('');
     offBlk=
       (idn.delivery?'<div style="font-size:12.5px;margin-bottom:9px"><b style="color:var(--mut2)">Delivery model &middot;</b> '+escD(idn.delivery)+'</div>':'')+
       (offRows?'<div style="overflow-x:auto"><table class="pvdl"><tbody>'+offRows+'</tbody></table></div>':'')+
       (dd.solution?'<div class="pvlede" style="margin-top:11px"><b style="color:var(--ddacc,var(--blue))">Capability narrative.</b> '+escD(dd.solution)+'</div>':'');
   }
   // round-3 (B6): the "Verdict, gating & conditions" panel is dropped (leaned RFx). round-3 (D9): the named
   // reference clients + partners and relationship history fold in here from the retired Commercial & Ecosystem tab.
   // #7 (Marc): merge "Reference clients & partners" + "Relationship history" into one 2-row definition list.
   var extIntBlk='';
   if(dd.clients||dd.relationship){
     var dlR=function(k,v){return '<div style="padding:10px 0;border-bottom:1px solid var(--line)"><div style="font-size:12px;font-weight:600;color:var(--mut2);margin-bottom:3px">'+k+'</div><div style="font-size:13px;color:var(--ink);line-height:1.5">'+v+'</div></div>';};
     extIntBlk=
       (dd.clients?dlR('Reference clients &amp; partners '+pvSrcTag('ext'),escD(dd.clients)):'')+
       (dd.relationship?dlR('Relationship history '+pvSrcTag('int'),escD(dd.relationship)):'');
   }
   // STAGE DeepDive #2/#4: each logical sub-section is its own accent-bordered card.
   // De-bubble revert (Marc, LOCKED): Offering Profile and Roadmap & Vision were paired side by side via
   // .ddpair purely to save vertical space; that arbitrary 2-up layout is reverted, every card on this tab
   // is single-column full-width again like the rest of the deep dive.
   // Layout RESTORED per Marc (2026-07-23): full-width Overview + Identity above; then a two-column row with
   // Offering Profile on the LEFT and Market Presence & History + Roadmap & Vision stacked on the RIGHT.
   var overviewCard=pvCard('<path d="M20 7l-8-4-8 4 8 4 8-4z"/><path d="M4 7v6l8 4 8-4V7"/>',escD(a.name)+' &middot; profile','<div class="pvlede">'+escD(dd.overview||'')+'</div><div class="pvlede"><b style="color:var(--emph)">Why this vendor for Lilly.</b> '+escD(dd.whyLilly||'')+'</div>');
   var identityCard=icBlk?pvCard('<path d="M4 4h16v16H4z"/><path d="M4 9h16M4 14h16M9 4v16"/>','Identity &amp; Company '+pvSrcTag('ext')+confChip,icBlk,confMeta&&confMeta.c):'';
   var offCard=offBlk?pvCard('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>','Offering profile ',offBlk):'';
   var roadCard=roadBlk?pvCard('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>','Roadmap &amp; vision '+pvSrcTag('ext'),roadBlk):'';
   var marketCard=extIntBlk?pvCard('<path d="M3 21h18M5 18v-7M10 18V6M15 18v-9M20 18v-4"/>','Market Presence &amp; History '+pvSrcTag('ext'),extIntBlk):'';
   var rightCol=marketCard+roadCard;
   var cols=(offCard||rightCol)?'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:14px;align-items:start"><div>'+offCard+'</div><div>'+rightCol+'</div></div>':'';
   return overviewCard+identityCard+cols;
 }
 if(ddt==='solfin'){
   var fin=cand.financials||{};
   // STAGE DeepDive #3 (Marc): the enriched top-level financials (latestRevenue, growth, funding,
   // valuationOrMarketCap, profitability, ownership, revenueHistory[], sources[]) were under-rendered, only
   // the older revenue/growth/margin/arr/cash/guidance sextet showed. Headline scale as stat tiles (prefers
   // the newer, more specific field over its older near-duplicate), the reporting period as a caption, and a
   // revenue-history bar sparkline below. Nothing here is re-derived, every tile/line is a direct field read.
   // De-bubble (Marc, 2026-07-23): the boxed cosnap stat-tiles ("$1.39B / Latest revenue", "+33% / Growth" ...)
   // are gone. Financial position is now a clean Bloomberg-FA-style summary TABLE (metric / value as reported),
   // because the point is a comparable full metric set, not four decorative boxes.
   var finRow=function(k,v){v=(v==null||v==='')?'':String(v);return v?('<tr><td class="dt" style="white-space:nowrap;vertical-align:top">'+escD(k)+'</td><td class="dd">'+escD(v)+'</td></tr>'):'';};
   var finSummary='<div style="overflow-x:auto"><table class="pvdl"><tbody>'+
     finRow('Latest revenue',fin.latestRevenue||fin.revenue)+
     finRow('Revenue growth',fin.growth)+
     finRow('Product revenue / ARR',fin.arr)+
     finRow('Net income / cash flow',fin.margin)+
     finRow('Profitability',fin.profitability)+
     finRow('Market capitalization',fin.valuationOrMarketCap||fin.cash)+
     finRow('Forward guidance',fin.guidance)+
   '</tbody></table></div>';
   var finLines=(fin.ownership?'<div class="cosnap-line"><span class="cosnap-k">Ownership</span> '+escD(fin.ownership)+'</div>':'')+(fin.funding?'<div class="cosnap-line"><span class="cosnap-k">Funding raised</span> '+escD(fin.funding)+'</div>':'');
   var periodCap=fin.period?'<div style="font-size:11px;color:var(--mut2);margin-bottom:7px">Reporting period &middot; <b style="color:var(--ink);font-weight:700">'+escD(fin.period)+'</b></div>':'';
   var revSvg=pvRevHistSvg(fin.revenueHistory);
   var revRows=(fin.revenueHistory||[]).map(function(h){return '<tr><td class="dt">'+escD(h.period||'')+'</td><td class="dd">'+escD(h.value||'')+'</td></tr>';}).join('');
   var moreRows=[['Net revenue retention / ARR','arr'],['Forward guidance','guidance']].map(function(fd){return fin[fd[1]]?('<tr><td class="dt">'+escD(fd[0])+'</td><td class="dd">'+escD(fin[fd[1]])+'</td></tr>'):'';}).join('');
   var sourcesBlk=(fin.sources&&fin.sources.length)?('<div class="footbound"><b>Sources.</b> '+fin.sources.map(function(s){return escD(s);}).join(' &middot; ')+'</div>'):'';
   // Cluster 3, G1 should-cost (light) + G8 switching-cost: derived from the commercial-fit and lock-in
   // signals already in the model (no invented precise TCO). Spots price-led vs premium + lock-in exposure.
   var dda=dd.attrs||{},ddc=dd.commercial||{};
   var cmFit=(cand.reqFit&&cand.reqFit.commercial!=null)?cand.reqFit.commercial:null;
   var pricePos=cmFit==null?', ':cmFit>=4.5?'Value / price-led':cmFit>=3.5?'Competitive':'Premium';
   var pricePosCol=cmFit==null?'var(--mut2)':cmFit>=4.5?'#5C2B50':cmFit>=3.5?'#2F6E6B':'#B4560F';
   var lockin=(cand.risk&&cand.risk.lockin!=null)?cand.risk.lockin:null;
   var swLbl=lockin==null?', ':lockin>=3?'High':lockin>=2?'Medium':'Low';
   var swCol=lockin==null?'var(--mut2)':lockin>=3?'#A23A30':lockin>=2?'var(--amber-d)':'#5C2B50';
   // G5 financial-viability grade, safe / watch / distress from the financial-stability risk score.
   var finRisk=(cand.risk&&cand.risk.financial!=null)?cand.risk.financial:null;
   var viab=finRisk==null?null:(finRisk<1.75?{l:'Safe',c:'#5C2B50',bg:'var(--ti-blue)'}:finRisk<3?{l:'Watch',c:'#B4560F',bg:'var(--ti-amber)'}:{l:'Distress risk',c:'#A23A30',bg:'var(--ti-red)'});
   var viabBadge=viab?' <span style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:2px 9px;border-radius:20px;color:'+viab.c+';background:'+viab.bg+';vertical-align:1px">'+viab.l+'</span>':'';
   var ceRows=[
     ['Indicative pricing',escD(dda.pricing||'Data not available')],
     ['Price position','<b style="color:'+pricePosCol+'">'+pricePos+'</b>'+(cmFit!=null?' <span style="color:var(--mut2)">(commercial fit '+escD(cmFit)+'/5)</span>':'')],
     ['Implementation / ramp',escD(ddc.implementation||'Data not available')],
     ['Switching / exit cost','<b style="color:'+swCol+'">'+swLbl+'</b>'+(lockin!=null?' <span style="color:var(--mut2)">(lock-in risk '+escD(lockin)+'/5)</span>':'')+(ddc.contracting?'<div style="font-size:11.5px;color:var(--mut);margin-top:3px;line-height:1.45">'+escD(ddc.contracting)+'</div>':'')]
   ].map(function(r){return '<tr><td class="dt">'+r[0]+'</td><td class="dd">'+r[1]+'</td></tr>';}).join('');
   // Market & Financials (skill Section 3), keeps the rich financial stack and ADDS a market-position line
   // (analyst position) + a recent-news table. The solution/offering prose now lives on the Profile tab.
   var mpGartner=(dd.attrs&&dd.attrs.gartner)?dd.attrs.gartner:'';
   var mpBlk=mpGartner?('<div class="pvlede" style="margin:0 0 4px"><b style="color:var(--mut2)">Analyst position &middot;</b> '+escD(mpGartner)+'</div>'):'';
   var solPtr='<p class="footbound" style="margin-top:0">Solution &amp; offering profile now lives on the <b>Profile</b> tab (named offerings, delivery model, capability narrative).</p>';
   var news=dd.news||[];
   var newsRows=news.map(function(nw){return '<tr><td class="dt">'+escD(nw.date||'')+'</td><td class="dd">'+escD(nw.headline||'')+(nw.note?'<div style="font-size:11.5px;color:var(--mut);font-weight:400;margin-top:3px;line-height:1.45">'+escD(nw.note)+'</div>':'')+'</td></tr>';}).join('');
   // STAGE DeepDive #2/#3: Market & Financials used to be one .sa-card with .subt-labelled sections; each
   // becomes its own accent card. Financial Position leads with the real headline scale (was thin/absent),
   // Revenue History is a new bar sparkline over financials.revenueHistory[].
   // De-bubble revert (Marc, LOCKED): Market position/Commercial estimate and Additional detail/Recent news
   // were paired side by side via .ddpair purely to save vertical space; that arbitrary 2-up layout is
   // reverted, every card on this tab is single-column full-width again like the rest of the deep dive.
   var sfCards=[];
   // Financial position leads as a full-width summary TABLE (metric / value); the revenue-history chart follows
   // as its own full-width card below. (The earlier half-width .ddfinpair pairing suited the compact stat-tiles;
   // now that those are a full metric table per Marc's de-bubble, the table needs the full width.)
   var finPosCard=pvCard('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>','Financial position '+pvSrcTag('ext')+viabBadge,periodCap+(dd.finHealth?'<div class="pvlede mut" style="margin-top:0">'+escD(dd.finHealth)+'</div>':'')+finSummary+finLines+(viab?'<div class="footbound" style="margin-top:4px">Viability grade read from the financial-stability signal (runway, margin, scale, standard distress signals): <b style="color:var(--navy)">Safe</b> below 1.75 &middot; <b style="color:var(--amber-d)">Watch</b> 1.75&ndash;3 &middot; <b style="color:var(--riskred)">Distress risk</b> at 3+/5.</div>':''),viab&&viab.c);
   var revCard=revSvg?pvCard('<path d="M4 19h16"/><path d="M7 19V10M12 19V5M17 19v-7"/>','Revenue history '+pvSrcTag('ext'),'<div style="max-width:500px">'+revSvg+'</div>'+(revRows?'<div style="overflow-x:auto;margin-top:9px"><table class="pvdl"><tbody>'+revRows+'</tbody></table></div>':'')+'<div class="footbound">Bars are scaled to the reported figures above (normalized to $M for height only); the exact reported text is preserved in each bar\'s tooltip and the table.</div>'):'';
   sfCards.push(finPosCard);
   if(revCard)sfCards.push(revCard);
   var mktCard=pvCard('<path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/>','Market position',mpBlk+solPtr);
   var comCard=pvCard('<path d="M3 21h18M5 18v-7M10 18V6M15 18v-9M20 18v-4"/>','Commercial estimate ','<div style="overflow-x:auto"><table class="pvdl"><tbody>'+ceRows+'</tbody></table></div><div class="footbound"><b>External estimate.</b> Reported figures are external enrichment from credible public sources (not validated). The commercial estimate is a light read to spot <b>price-led vs premium</b> and <b>lock-in / switching exposure</b>, the firm 3-year TCO comes from the RFx bids (normalized pricing) and the Deal pro-forma, and exit terms are settled in negotiation. A genuinely undisclosed figure would read Data not available, never silently invented.</div>',pricePosCol);
   sfCards.push(mktCard);
   sfCards.push(comCard);
   var moreCard=(moreRows||sourcesBlk)?pvCard('<path d="M4 4h16v16H4z"/><path d="M4 9h16M4 14h16M9 4v16"/>','Additional financial detail '+pvSrcTag('ext'),(moreRows?'<div style="overflow-x:auto"><table class="pvdl"><tbody>'+moreRows+'</tbody></table></div>':'')+sourcesBlk):'';
   var newsCard=newsRows?pvCard('<path d="M4 5h16M4 10h16M4 15h10"/>','Recent news <span style="font-weight:500;color:var(--mut2);font-size:11px;text-transform:none;letter-spacing:0">&middot; last ~18 months</span>','<div style="overflow-x:auto"><table class="pvdl"><tbody>'+newsRows+'</tbody></table></div>'):'';
   if(moreCard)sfCards.push(moreCard);
   if(newsCard)sfCards.push(newsCard);
   return sfCards.join('');
 }
 if(ddt==='strisk'){
   // #87/#88 (Marc): strengths & risks side-by-side as clean lists (no bubbles); risk dimensions as a table.
   var srrow='display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px;line-height:1.5;align-items:baseline';
   var strengths=(dd.strengths||[]).map(function(s){return '<div style="'+srrow+'"><span style="color:var(--navy);font-weight:800;flex:none">&#10003;</span><span>'+escD(s)+'</span></div>';}).join('');
   var risks=(dd.risksNarr||[]).map(function(rk){var col=rk.sev==='high'?'#A23A30':rk.sev==='med'?'var(--amber-d)':'#5C2B50';var sl=rk.sev==='high'?'High':rk.sev==='med'?'Medium':'Low';return '<div style="'+srrow+'"><span style="color:'+col+';flex:none;font-size:15px;line-height:1">&#9679;</span><span><b>'+escD(rk.cat)+'</b> <span style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;color:'+col+'">'+sl+'</span><div style="color:var(--mut);margin-top:2px">'+escD(rk.detail)+'</div></span></div>';}).join('');
   var dims=input.riskDimensions||[];var rawRisk=cand.risk||{};var risksN=dd.risksNarr||[];
   // D&B-style risk read: a score band per dimension, and a plain-English gloss, pulled from the matching
   // narrative risk where the dimension label shares a keyword with a risksNarr category, else a band read.
   var bandOf=function(sc){return sc==null?{l:'Not scored',c:'var(--mut2)'}:sc>=3?{l:'Elevated',c:'#A23A30'}:sc>=2?{l:'Moderate',c:'var(--amber-d)'}:{l:'Low',c:'#5C2B50'};};
   var glossFor=function(dm,sc){
     var keys=String(dm.label||'').toLowerCase().split(/[ /]+/).filter(function(w){return w.length>4;});
     var hit=risksN.filter(Boolean).find(function(rk){var c=String(rk.cat||'').toLowerCase();return keys.some(function(w){return c.indexOf(w)>=0;});});
     if(hit){var t=String(hit.detail||'');var dot=t.indexOf('. ');return dot>0?t.slice(0,dot+1):t;}
     var b=bandOf(sc);return sc==null?'Not scored on the public signal.':b.l==='Low'?'Contained; no material concern on the public signal.':b.l==='Moderate'?'Watch item; confirm in the RFP before relying on it.':'Elevated; a hard concern to clear before award.';
   };
   var dimRows=dims.map(function(dm){var sc=rawRisk[dm.id];var b=bandOf(sc);var col=b.c;var w=sc==null?0:Math.min(100,sc/5*100);return '<tr><td style="text-align:left;font-weight:600;vertical-align:top;white-space:nowrap">'+escD(dm.label)+'</td><td style="text-align:right;font-weight:700;color:'+col+';white-space:nowrap;vertical-align:top">'+(sc==null?', ':escD(sc)+' / 5')+'</td><td style="width:80px;vertical-align:top"><div style="height:7px;border-radius:4px;background:var(--line);overflow:hidden;margin-top:6px"><i style="display:block;height:100%;width:'+w+'%;background:'+col+'"></i></div></td><td style="font-size:11.5px;color:var(--mut);line-height:1.45;vertical-align:top;padding-left:10px">'+escD(glossFor(dm,sc))+'</td></tr>';}).join('');
   var com=dd.commercial||{};
   var contractBlk=com.contracting?('<div class="pvlede" style="margin:0 0 10px"><b style="color:var(--mut2)">Contracting flexibility &middot;</b> '+escD(com.contracting)+'</div>'):'';
   var regBlk=com.regulatory?('<div class="pvlede" style="margin:0"><b style="color:var(--mut2)">Regulatory / GxP &middot;</b> '+escD(com.regulatory)+'</div>'):'';
   // STAGE DeepDive #2: Strengths & Risks used to be one .sa-card with .subt-labelled sections; each becomes
   // its own accent card. Strengths keeps the existing positive/navy colour, Risks takes the worst severity
   // colour already used per-row below (both existing status tints, nothing new introduced).
   var sevRank={high:3,med:2,low:1},sevCol={high:'#A23A30',med:'var(--amber-d)',low:'#5C2B50'};
   var riskWorst=(dd.risksNarr||[]).reduce(function(w,rk){var r=sevRank[rk.sev]||1;return r>w?r:w;},0);
   var riskWorstCol=riskWorst===3?sevCol.high:riskWorst===2?sevCol.med:riskWorst===1?sevCol.low:null;
   var srCards=[];
   srCards.push(pvCard('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>','Strengths',strengths||'<div style="font-size:12.5px;color:var(--mut2)">No strengths on file.</div>','var(--navy)'));
   srCards.push(pvCard('<path d="M12 2l10 18H2z"/><path d="M12 9v5M12 17h.01"/>','Risks',risks||'<div style="font-size:12.5px;color:var(--mut2)">No risks on file.</div>',riskWorstCol));
   if(contractBlk||regBlk)srCards.push(pvCard('<path d="M4 4h16v16H4z"/><path d="M4 9h16M4 14h16M9 4v16"/>','Contracting &amp; Regulatory',contractBlk+regBlk));
   srCards.push(pvCard('<path d="M3 21h18M6 21V9M12 21V4M18 21v-8"/>','Risk Dimensions <span style="font-weight:500;color:var(--mut2);font-size:11px;text-transform:none;letter-spacing:0">&middot; 0&ndash;5, higher is worse</span>','<div class="mxwrap"><table class="mx" style="width:100%"><tbody>'+dimRows+'</tbody></table></div><div class="footbound">Narrative risks are advisory; a hard flag disqualifies, a soft flag is recorded for review. Dimension scores roll up from the sub-factors on the Risk Assessment subtab.</div>'));
   // D&B-style risk-assessment redesign (Marc, 2026-07-23): a risk-posture summary line leads (overall band +
   // elevated/moderate counts), the Strengths/Risks drivers follow, and the Risk Dimensions table now carries a
   // plain-English READ per score (research's key point: every score gets a sentence, not just a number).
   var scored=dims.map(function(dm){return rawRisk[dm.id];}).filter(function(s){return s!=null;});
   var nElev=scored.filter(function(s){return s>=3;}).length,nMod=scored.filter(function(s){return s>=2&&s<3;}).length;
   var overallSc=a.riskScore!=null?pvRound(a.riskScore,1):(scored.length?pvRound(scored.reduce(function(x,y){return x+y;},0)/scored.length,1):null);
   var ob=bandOf(overallSc);
   var postureLine='<div class="leadnarr" style="border-left-color:'+ob.c+'"><b>Risk posture &middot; '+escD(a.name)+' &middot; <span style="color:'+ob.c+'">'+ob.l+(overallSc!=null?' ('+escD(overallSc)+'/5)':'')+'</span>.</b> '+(nElev?nElev+' elevated':'No elevated')+' and '+nMod+' moderate '+(nElev+nMod===1?'dimension':'dimensions')+' across the scored framework; each score carries its read in the table below. A hard flag disqualifies; elevated risk with an open must-have gap is a pass.</div>';
   return postureLine+srCards.join('');
 }
 if(ddt==='lilly'){
   // Lilly Fit (skill Section 5), a synthesis DISTINCT from the scored Requirements Fit. Reuses whyLilly +
   // the fit score + risk data; adds a relationship-status pill, a capability-fit rating (from the weighted
   // fit), a pharma/GxP gate SIGNAL (risk-flag framing, NOT SME routing, per the landscape no-contact
   // scope), a strategic-fit read, and a value-at-risk / next-move note. Reflect-only, illustrative.
   var lf=dd.lillyFit||{};
   var f5=pvRound(a.fitScore/20,1);
   var capR=a.fitScore>=80?{l:'High',c:'#5C2B50',bg:'var(--ti-blue)'}:a.fitScore>=65?{l:'Medium',c:'#B4560F',bg:'var(--ti-amber)'}:{l:'Low',c:'#A23A30',bg:'var(--ti-red)'};
   var rel=lf.relation||((dd.relationship&&/incumbent/i.test(dd.relationship))?'Active incumbent':'Net new');
   var relMeta=rel==='Active incumbent'?{c:'#5C2B50',bg:'var(--ti-blue)'}:rel==='Prior engagement'?{c:'#2F6E6B',bg:'var(--ti-blue)'}:{c:'var(--mut2)',bg:'var(--nested)'};
   var sf=(lf.strategic||'').toLowerCase();
   var sfMeta=sf==='supports'?{l:'Supports',c:'#5C2B50',bg:'var(--ti-blue)'}:sf==='works-against'?{l:'Works against',c:'#A23A30',bg:'var(--ti-red)'}:sf?{l:'Neutral',c:'#B4560F',bg:'var(--ti-amber)'}:{l:'Data not available',c:'var(--mut2)',bg:'var(--nested)'};
   var lfTile=function(lbl,val,c,bg){return '<div style="flex:1;min-width:150px;border:1px solid var(--line2);border-radius:10px;padding:11px 13px;background:'+(bg||'#fff')+'"><div style="font:600 9px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2);margin-bottom:5px">'+lbl+'</div><div style="font:800 15px var(--sans);color:'+(c||'var(--ink)')+';letter-spacing:-.01em">'+val+'</div></div>';};
   var lfPills='<div style="display:flex;gap:11px;flex-wrap:wrap;margin:0 0 14px">'+
     lfTile('Relationship status',escD(rel),relMeta.c,relMeta.bg)+
     lfTile('Capability-fit rating',escD(capR.l)+' <span style="font:600 11px var(--mono);color:var(--mut2)">('+escD(f5)+'/5)</span>',capR.c,capR.bg)+
     lfTile('Strategic fit',escD(sfMeta.l),sfMeta.c,sfMeta.bg)+'</div>';
   var pharmaBlk=lf.pharma?('<div class="pvlede" style="margin:0">'+escD(lf.pharma)+'</div>'):'';
   var valueBlk=lf.value?('<div class="pvlede" style="margin:0">'+escD(lf.value)+'</div>'):'';
   var lfCap='<div class="leadnarr"><b>Lilly fit, synthesis.</b> A qualitative read of how this supplier fits Lilly, distinct from the scored <b>Requirements Fit</b> heatmap. Advisory only; no vendor is selected, contacted or awarded, and any gate below is a <b>risk signal</b> to clear downstream (RFx / onboarding / contracting), never an SME routing on the landscape. '+infoHover('Requirements Fit scores capability against each requirement. Lilly Fit is the synthesis judgment: relationship, strategic fit, pharma gates and value-at-risk. Both are landscape estimates built without contacting the supplier; actual SME routing happens downstream once an RFx or onboarding begins.',{aria:'Lilly Fit vs Requirements Fit'})+'</div>';
   // STAGE DeepDive #2: Lilly Fit used to be one .sa-card with .subt-labelled sections; Pharma gates and
   // Value at risk each become their own accent card. Synthesis card takes the capability-fit rating colour
   // (existing status tint); Pharma gates keeps the existing amber "gate signal" colour used sitewide.
   var hadPharma=!!pharmaBlk,hadValue=!!valueBlk;
   var lfFoot='<div class="footbound">Capability-fit rating is derived from the weighted requirements fit ('+escD(f5)+'/5). Relationship, strategic fit, pharma gates and next-move are advisory reads, the authoritative relationship + TPRM status live in Supplier 360 and the downstream RFx / onboarding record.</div>';
   if(hadValue)valueBlk+=lfFoot;else if(hadPharma)pharmaBlk+=lfFoot;
   var lfSynth=lfCap+'<div class="pvlede"><b style="color:var(--emph)">Why this vendor for Lilly.</b> '+escD(dd.whyLilly||'')+'</div>'+lfPills+((!hadValue&&!hadPharma)?lfFoot:'');
   var lfCards=[pvCard('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',escD(a.name)+' &middot; Lilly fit',lfSynth,capR.c)];
   if(hadPharma)lfCards.push(pvCard('<path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/>','Pharma / GxP gates <span style="font-weight:500;color:var(--mut2);font-size:11px;text-transform:none;letter-spacing:0">&middot; risk signal, not a routed screen</span>',pharmaBlk,'var(--amber-d)'));
   if(hadValue)lfCards.push(pvCard('<path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/>','Value at risk / next move',valueBlk));
   // Open Questions to confirm now lives here on Lilly Fit (moved off Requirements Fit per Marc): the RFI's open
   // list of what to confirm with the supplier is a fit / next-step synthesis item, not a scoring artifact.
   return lfCards.join('')+pvOpenQuestionsCard(a,cand,input,pvReqFitRead(a,cand,input));
 }
 if(ddt==='reqs'){
   // "Requirements Fit", the whole-field multi-supplier heatmap. Reuses pvHeatmapHtml() (the SAME renderer
   // as the standalone Requirements Heatmap subtab) so the two stay identical: every candidate in the
   // landscape is a column, not just the selected vendor. The caption states the data-source distinction that
   // is the reason two requirement heatmaps exist, this Landscape read is Theo's own internal + external
   // research WITHOUT contacting the supplier (a reflect-only market estimate); the RFx requirements heatmap
   // prioritizes data the supplier submitted directly once an RFP is issued.
   // #3 (Marc): drop the whole-field explanatory paragraph, only the data-source (i) is needed, and it now lives
   // to the right of the "Requirements Heatmap" title below. #4 (Marc): the cross-supplier leaders narrative is
   // suppressed here (it belongs on the standalone Requirements Heatmap subtab). Both via pvHeatmapHtml(inDeep).
   // Automated-RFI redesign (Marc, 2026-07): the SELECTED candidate's own met/partial/gap read is the HEADLINE
   // (the RFI scoring made explicit), followed by the auto-derived Open Questions and a copy-ready Request-more-data
   // package. The cross-supplier heatmap stays below as the field context.
   // Open Questions moved to Lilly Fit (Marc); Request-more-data removed entirely (that outreach-drafting is a
   // companion-skill action, not a dashboard panel). This tab is now the scored read + the field heatmap.
   var rr=pvReqFitRead(a,cand,input);
   return pvReqFitCandidateCard(a,cand,input,rr)+
     pvHeatmapHtml(refl,{inDeep:true});
 }
 // round-3 (D9): the standalone "Commercial & Ecosystem" sub-subtab is retired, reference clients + partners
 // moved to Profile & Fit; contracting flexibility + regulatory/GxP folded into Strengths & Risks; the
 // implementation/integration ledes were redundant with the Requirements heatmap and dropped. This branch is
 // now unreachable (removed from the nav) and returns nothing.
 return '';
}
// Competitive position (owner-approved B4 masthead), MERGES the old verdict strip: a verdict badge +
// "why it leads" heading/sentence + fit/risk stats, over a band of Leads-field(+margins) / Strongest / Watch.
// Coloured with the SELECTED SUPPLIER'S identity colour (per-supplier scheme); Watch stays amber (harmonises
// with every vendor accent). All from the model (heatmap leaders + margin-over-next-best, coverage, risksNarr).
function pvCompPositionHtml(a,cand,refl,input){
 var L=refl.landscape,dd=(cand&&cand.deepDive)||{};
 // Automated-RFI redesign (Marc, 2026-07): the INVITE/HOLD/PASS verdict now lives in the header above, so this
 // band's badge reframes to the competitive STANDING (rank + segment), not a second verdict label.
 var riskHigh=(input.segmentation&&input.segmentation.riskHigh!=null)?input.segmentation.riskHigh:2.5;
 var elevated=a.riskScore>=riskHigh;
 var hm=L.heatmap||{leaders:{}},reqs=input.requirements||[],reqLabel={};
 reqs.forEach(function(r){reqLabel[r.id]=r.label;});
 var byReq={};L.assessments.forEach(function(v){(v.coverage||[]).forEach(function(cc){(byReq[cc.requirementId]=byReq[cc.requirementId]||[]).push({id:v.id,score:cc.score});});});
 var aCov={};(a.coverage||[]).forEach(function(cc){aCov[cc.requirementId]=cc.score;});
 var leads=[];
 reqs.forEach(function(r){
   if(hm.leaders[r.id]===a.id){
     var others=(byReq[r.id]||[]).filter(function(x){return x.id!==a.id;});
     var nb=others.length?Math.max.apply(null,others.map(function(x){return x.score;})):0;
     leads.push({label:reqLabel[r.id]||r.id,margin:pvRound((aCov[r.id]||0)-nb,2)});
   }
 });
 leads.sort(function(x,y){return y.margin-x.margin;});
 var best=null;(a.coverage||[]).forEach(function(cc){if(!best||cc.score>best.score)best=cc;});
 var w=(dd.risksNarr&&dd.risksNarr[0])?dd.risksNarr[0]:null;
 var topsN=leads.length,totalReqs=reqs.length;
 var vi=(input.suppliers||[]).findIndex(function(s){return s.id===a.id;});
 var acc=pvSupColor(a); // #3 (Marc): distinct per-supplier identity colour (8-colour palette, no reuse, no burnt orange), matches the Segmentation dots
 var heading=a.rank===1?"Why it's the leader":(a.segment==='leader'?"Why it's a leader":(a.eligible?"Where it stands":"Why it's screened out"));
 var fit100=Math.round(a.fitScore);
 var sentence;
 if(!a.eligible){sentence='Carries a hard flag that removes it from the shortlist, see Strengths &amp; Risks.';}
 else if(a.rank===1){sentence='Strongest requirements fit on offer'+(elevated?' though on elevated risk':' at contained risk')+(topsN?', and tops the field on '+topsN+' of '+totalReqs+' requirements':'')+'.';}
 else {sentence='Ranks #'+a.rank+' on weighted fit ('+fit100+'/100) with '+(elevated?'elevated':'contained')+' risk'+(topsN?', leading the field on '+topsN+' of '+totalReqs:', without topping any single requirement')+'.';}
 var standing=a.rank!=null?('#'+a.rank):', ';
 var standSub=escD(PVSEG_LBL[a.segment]||a.segment)+(a.rank!=null?(' · of '+L.eligibleCount+' eligible'):'');
 var shortCat=function(s){return String(s).split(/\s*[&·]\s*/)[0].trim();};
 var leadsHtml=leads.length?leads.slice(0,3).map(function(l){return '<span class="ddcp-mgc" style="color:'+acc+';border-color:'+acc+'66">'+escD(shortCat(l.label))+' +'+escD(l.margin)+'</span>';}).join(''):'<span style="font-size:11.5px;color:var(--mut2)">, leads no single category</span>';
 var strongHtml=best?(escD(reqLabel[best.requirementId]||best.requirementId)+' '+escD(pvRound(best.score,2))):', ';
 var watchHtml=w?('<span style="font-weight:700;color:var(--amber-d)">'+escD(w.cat)+'</span> <span class="ddcp-sev '+(w.sev==='high'?'high':'med')+'">'+(w.sev==='high'?'high':w.sev==='med'?'med':'low')+'</span>'):'<span style="font-size:11.5px;color:var(--mut2)">no material watch-item</span>';
 return '<div class="ddcp">'+
   '<div class="ddcp-mast">'+
     '<div class="ddcp-badge" style="background:'+acc+'"><span class="vv">'+standing+'</span><span class="rr">'+standSub+'</span></div>'+
     '<div class="ddcp-mid"><span class="ddcp-lbl" style="color:'+acc+'">'+heading+'</span><div class="ddcp-why">'+sentence+'</div></div>'+
     '<div class="ddcp-stats"><div class="ddcp-stat"><b style="color:'+acc+'">'+fit100+'</b><span>Fit/100</span></div><div class="ddcp-stat"><b style="color:'+acc+'">'+escD(a.riskScore)+'</b><span>Risk/5</span></div></div>'+
   '</div>'+
   '<div class="ddcp-band" style="background:'+acc+'12"><div class="ddcp-seg"><span class="ddcp-sk" style="color:'+acc+'">Leads field</span>'+leadsHtml+'</div><div class="ddcp-seg"><span class="ddcp-sk" style="color:'+acc+'">Strongest</span><span class="ddcp-strong" style="color:'+acc+'">'+strongHtml+'</span></div><div class="ddcp-seg"><span class="ddcp-sk" style="color:'+acc+'">Watch</span>'+watchHtml+'</div></div>'+
 '</div>';
}
function pvDeepDiveTabHtml(refl,input){
 var L=refl.landscape;
 var ids=(input.suppliers||[]).map(function(s){return s.id;});
 if(!PVSL_DDV||ids.indexOf(PVSL_DDV)<0){var lead=L.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;})[0];PVSL_DDV=lead?lead.id:(ids[0]||null);}
 var id=PVSL_DDV;
 var a=L.assessments.find(function(x){return x.id===id;});
 var cand=pvCandById(id);
 var opts=L.assessments.slice().sort(function(x,y){if(x.eligible!==y.eligible)return x.eligible?-1:1;return (x.rank||99)-(y.rank||99);}).map(function(v){return '<option value="'+escD(v.id)+'"'+(v.id===id?' selected':'')+'>'+escD(v.name)+(v.rank?(', #'+v.rank):'')+(v.eligible?'':' (disqualified)')+'</option>';}).join('');
 var bar='<div class="ddbar"><span class="ddlbl">Vendor</span><select class="ddsel" onchange="pvSetDDV(this.value)">'+opts+'</select></div>';
 // #.1 (Marc): drive the per-supplier PRIMARY colour through --ddacc so the section eyebrows + key labels take the
 // selected supplier's identity colour (was a fixed blue). SECONDARY = --ddacc-t, an ~8% tint of that same colour
 // (owner: "shade of the supplier's colour") used for band/row fills. Burnt orange stays the emphasis colour.
 var ddc=pvSupColor(a);var ddacc='style="--ddacc:'+ddc+';--ddacc-t:'+ddc+'14"';
 if(!a||!cand||!cand.deepDive){return '<div class="dd" '+ddacc+'>'+bar+'<div class="sa-card"><div class="scc-b">Deep dive is not available for this candidate.</div></div></div>';}
 // Deep Dive v3 (pv-07b): 6 visual subtabs on the pvAssess spine. The two big header bands + the visible
 // composite score are replaced by ONE compact decision-header strip (Marc's analysis: decision -> evidence ->
 // materiality -> action, no false-precision composite). Default = Supplier Summary.
 var tabs=PVDD2_TABS;
 var ddt=PVSL_DDT;if(!tabs.some(function(t){return t[0]===ddt;}))ddt='summary';
 var tabbar='<div class="ddtabs">'+tabs.map(function(t){return '<button class="ddtab'+(ddt===t[0]?' on':'')+'" onclick="pvSetDDT(\''+t[0]+'\')">'+escD(t[1])+'</button>';}).join('')+'</div>';
 var _assess=pvAssess(a,cand,input);
 return '<div class="dd" '+ddacc+'>'+bar+pvDecisionHeaderStrip(_assess)+tabbar+pvDD2Section(ddt,a,cand,refl,input)+'</div>';
}
/* ---- Landscape tab entry point: deep native surface (nimbus) or thin cards (acme/helios/datapipe) ---- */
function landscapeThinHTML(){
 const LAND=PROJECTS[CURPROJ].landscape||[];
 let h='<p class="dashintro"><b>Supplier landscape</b>, candidate suppliers assessed for fit. This is a read built from <b>credible public sources</b>; nothing here is validated or a recommendation.</p>';
 h+=openDashBar('supplier-landscape.html','Open full Supplier Landscape dashboard');
 h+=LAND.map(function(s){return `<div class="card"><div class="ch"><div class="cn">${escD(s.n)}</div><div class="csub">· ${escD(s.sub)}</div><span class="fit ${s.fitc}">fit ${escD(s.fit)}</span></div><p class="cnote">${escD(s.note)}</p><div class="tags">${(s.tags||[]).map(function(t,i){return '<span class="tg'+(i===0?' src':'')+'">'+escD(t)+'</span>';}).join('')}</div></div>`;}).join('');
 // Pass 2B: no Draft/Mark-Final lifebar on the Landscape tab (analytical view).
 return h;
}
function landscapeHTML(){
 var P=PROJECTS[CURPROJ]||{};
 if(!pvIsDeep(P))return landscapeThinHTML();
 var input=pvLandInput(P);PVSL_INPUT=input;
 var refl=PVSLE.reflect(input);
 var validIds=(input.suppliers||[]).map(function(s){return s.id;});
 if(PVSL_DDV&&validIds.indexOf(PVSL_DDV)<0)PVSL_DDV=null;   // deep-dive vendor must belong to this project
 var panel;
 if(PVSL_SUB==='deep')panel=pvDeepDiveTabHtml(refl,input);
 else if(PVSL_SUB==='heatmap')panel=pvHeatmapHtml(refl);         // Pass B: collapsible categories -> sub-reqs, band legend, leaders narrative, filter, click-vendor rationale
 else if(PVSL_SUB==='h2h')panel=pvDynamicsHtml(refl);  // HH1 (Marc): risk-diff / evidence / commercial now folded INTO the Competitive Dynamics panel. pvH2HExtras + pvH2HHtml unused.
 else if(PVSL_SUB==='risk')panel=pvRiskHtml2(refl);              // v3 (pv-07b): pvAssess spine, portfolio summary + semantic heatmap (level+confidence) + coverage callout + selected-supplier material risks/disposition/event-timeline/mitigation. Old pvRiskHtml now dead.
 else panel=pvExecSummaryHtml(refl,input);
 var body=pvSubtabsHtml()+panel;
 // Pass 2B: no Draft/Mark-Final lifebar on the Landscape tab, it is an analytical view, not a finalizable material.
 return '<div class="pvsl">'+body+'</div>';
}
// ---- Negotiation prep ----