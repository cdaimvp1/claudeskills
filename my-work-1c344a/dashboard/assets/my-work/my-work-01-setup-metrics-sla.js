const $=s=>document.querySelector(s);
/* F3: provenance helper, delegates to the STANDARD provenance component (assets/provenance.js,
   DD.2). Shows a source icon that reveals the full source on hover; never a paragraph on screen. */
function provline(txt){
  if(window.renderProvenance){return '<div class="provrow" style="margin-top:6px">'+window.renderProvenance({name:txt},{label:'source'})+'</div>';}
  return '<div class="provline"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>'+txt+'</span></div>';
}

// ── reps & view switching (three sourcing reps; "me" is the logged-in rep) ──
const VIEWS={
 'Marc Lane':{av:'ML',nm:'Marc Lane',role:'Sourcing Rep'},
 'Aisha Khan':{av:'AK',nm:'Aisha Khan',role:'Sourcing Rep'},
 'Dan Reed':{av:'DR',nm:'Dan Reed',role:'Sourcing Rep'}
};
const ORDER=['Marc Lane','Aisha Khan','Dan Reed'];
let me='Marc Lane';
const TEAM=ORDER;                  // the reps a manager (Procurement Leadership) can drill into
let curRole='rep';
// theo-brand calls this on load AND on every "View as" switch, with the global role key.
// Rep -> own work. Leadership -> a team-member dropdown lens. Business Owner -> not their view.
window.theoSetRole=function(roleKey){
 curRole=roleKey||'rep';
 document.body.classList.toggle('ownerlock', curRole==='owner');
 const picker=document.getElementById('teampicker');
 if(curRole==='lead'){
  if(TEAM.indexOf(me)<0) me='Marc Lane';
  if(picker) picker.style.display='';
  renderAll();
 } else if(curRole==='rep'){
  me='Marc Lane';
  if(picker) picker.style.display='none';
  renderAll();
 }                                 // owner: ownerlock CSS hides the dashboard, #ownernote shows
};
function pickMember(name){ if(TEAM.indexOf(name)<0) return; me=name; focusId=null; tlExpanded=false; renderAll(); }

// ════════════════════════════════════════════════════════════════
//  PINNED TOP CARDS, year-to-date headline counts (hover = by type)
// ════════════════════════════════════════════════════════════════
// counts/$ are illustrative-but-realistic per rep. `by` arrays drive the
// hover tooltip (type → count). committed$ in $K across active contracts.
const YTD_BY_REP={
 'Marc Lane':{
  activeProjects:{n:7, by:[['New supplier · competitive',2],['New supplier · sole-source',2],['Renewal',2],['Add-on / expansion',1]]},
  completedProjects:{n:14, by:[['Renewal',6],['New supplier',4],['Add-on / expansion',3],['Canceled / withdrawn',1]]},
  contractsInProgress:{n:5, by:[['MSA / new paper',2],['Renewal paper',2],['Work order / SOW',1]]},
  contractsCompleted:{n:11, by:[['Renewal paper',5],['Work order / SOW',3],['MSA / new paper',2],['Amendment',1]]},
  committedSpend:{k:9720, by:[['Tata Consultancy',3120],['Veeva Systems',2480],['Globex Systems',1760],['ServiceNow',1340],['Other active',1020]]}
 },
 'Aisha Khan':{
  activeProjects:{n:4, by:[['New supplier · competitive',1],['Renewal',2],['Add-on / expansion',1]]},
  completedProjects:{n:9, by:[['Renewal',4],['New supplier',2],['Add-on / expansion',2],['Canceled / withdrawn',1]]},
  contractsInProgress:{n:3, by:[['MSA / new paper',1],['Renewal paper',1],['Work order / SOW',1]]},
  contractsCompleted:{n:7, by:[['Renewal paper',3],['Work order / SOW',2],['Amendment',2]]},
  committedSpend:{k:4180, by:[['Tata Consultancy',2640],['Infosys',1180],['Figma',360]]}
 },
 'Dan Reed':{
  activeProjects:{n:3, by:[['New supplier · competitive',1],['New supplier · PoC',1],['Renewal',1]]},
  completedProjects:{n:6, by:[['Renewal',3],['New supplier',2],['Canceled / withdrawn',1]]},
  contractsInProgress:{n:2, by:[['MSA / new paper',1],['Renewal paper',1]]},
  contractsCompleted:{n:4, by:[['Renewal paper',2],['Work order / SOW',1],['Amendment',1]]},
  committedSpend:{k:3960, by:[['Globex Systems',1980],['Dell Technologies',1220],['ServiceNow',760]]}
 }
};
function tipRows(by,fmt){
 const tot=by.reduce((s,r)=>s+r[1],0);
 return by.map(r=>`<div class="ptrow"><span class="pd"></span><span class="pn">${r[0]}</span><span class="pc">${fmt?fmt(r[1]):r[1]}</span></div>`).join('')+
   `<div class="pttot"><span>Total</span><b>${fmt?fmt(tot):tot}</b></div>`;
}
function renderPinned(){
 const y=YTD_BY_REP[me]; if(!y){$('#pincards').innerHTML='';return;}
 const cards=[
  {lab:'Active projects',icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
   val:y.activeProjects.n,note:'in your book right now',th:'Active projects · by type',rows:tipRows(y.activeProjects.by)},
  {lab:'Completed projects',icon:'<path d="M9 11l3 3L20 6"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/>',
   val:y.completedProjects.n,note:'closed year-to-date',th:'Completed projects · by type',rows:tipRows(y.completedProjects.by)},
  {lab:'Contracts in progress',icon:'<path d="M9 12h6M9 16h4M9 8h6"/><rect x="4" y="3" width="16" height="18" rx="2"/>',
   val:y.contractsInProgress.n+'<span class="x"> · </span>'+y.contractsCompleted.n,note:'in progress · completed YTD',th:'In progress vs. completed · by type',
   rows:`<div class="pth" style="margin:0 0 4px;color:#9FB4D2">In progress</div>`+tipRows(y.contractsInProgress.by)+`<div class="pth" style="margin:8px 0 4px;color:#9FB4D2">Completed YTD</div>`+tipRows(y.contractsCompleted.by)},
  {lab:'Active committed spend',icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4"/>',
   val:fmtK(y.committedSpend.k),note:'across your active contracts',th:'Committed spend · by supplier',rows:tipRows(y.committedSpend.by,fmtK)}
 ];
 $('#pincards').innerHTML=cards.map(c=>`
  <div class="pincard">
   <div class="plab"><svg viewBox="0 0 24 24">${c.icon}</svg>${c.lab}</div>
   <div class="pval">${c.val}</div>
   <div class="pnote"><span class="info">i</span>${c.note} · hover for breakdown</div>
   <div class="ptip"><div class="pth">${c.th}</div>${c.rows}</div>
  </div>`).join('');
}

// ── collapsible numbered section toggle ──
function secToggle(hdr){
 hdr.classList.toggle('is-collapsed');
 const body=document.getElementById(hdr.dataset.body);
 if(body) body.classList.toggle('hidden');
 if(body && !body.classList.contains('hidden') && hdr.dataset.body==='sec-workload'){renderTimeline();}
}

// ── performance metric strip (driven by the SLA dataset for consistency) ──
function renderMetrics(){
 const sla=SLA_BY_REP[me]||{stages:[],avgCycle:0,target:0,onTime:0};
 const sav=SAV_BY_REP[me]||{ytd:0,target:0};
 const within=sla.stages.filter(x=>slaRes(x.target,x.actual)==='ok').length;
 const total=sla.stages.length||1;
 const over=sla.stages.filter(x=>slaRes(x.target,x.actual)==='over').length;
 const atRisk=sla.stages.filter(x=>slaRes(x.target,x.actual)!=='ok').length;
 const cycleGood=sla.avgCycle<=sla.target;
 const cells=[
  {lab:'Stages within SLA',icon:'<path d="M9 11l3 3L20 6"/><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/>',
   val:within+'<small style="font-size:15px;font-weight:600;color:var(--mut2)"> / '+total+'</small>',note:'gates meeting their SLA target',cls:within===total?'good':''},
  {lab:'Avg cycle time',icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
   val:sla.avgCycle.toFixed(1)+'<small style="font-size:14px;font-weight:600;color:var(--mut2)"> d</small>',note:'vs '+sla.target.toFixed(1)+'d target · '+(cycleGood?'under target':'over target'),cls:cycleGood?'good':'warn'},
  {lab:'On-time rate',icon:'<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>',
   val:sla.onTime+'<small style="font-size:14px;font-weight:600;color:var(--mut2)">%</small>',note:'completed within SLA · trailing 90d',cls:sla.onTime>=80?'good':''},
  {lab:'Over SLA now',icon:'<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
   val:over,note:over?over+' over · '+atRisk+' incl. at-risk':'all stages on standard',cls:over?'warn':'good'},
  {lab:'My savings YTD',icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4"/>',
   val:fmtK(sav.ytd),note:Math.round(sav.ytd/(sav.target||1)*100)+'% of your '+fmtK(sav.target)+' target',cls:'good'}
 ];
 $('#metrics').innerHTML=cells.map(c=>`<div class="metric ${c.cls}"><div class="lab"><svg viewBox="0 0 24 24">${c.icon}</svg>${c.lab}</div><div class="val">${c.val}</div><div class="note">${c.note}</div></div>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  1 · MY PERFORMANCE, SLA / cycle-time adherence
// ════════════════════════════════════════════════════════════════
// Per-stage SLA performance across the rep's live book. target/actual in days.
// res: 'ok' within SLA · 'near' at risk (>=85% of target) · 'over' breached.
const SLA_BY_REP={
 'Marc Lane':{
  withinSLA:[11,13], avgCycle:9.4, target:11.0, onTime:88,
  stages:[
   {s:'Intake → triage',sub:'request to scope',target:3,actual:2},
   {s:'Triage → reviews',sub:'route to gates',target:2,actual:2},
   {s:'Legal review',sub:'redlines',target:7,actual:6},
   {s:'Cyber / ISS',sub:'security questionnaire',target:7,actual:8},
   {s:'AI review',sub:'model-risk screen',target:5,actual:9},
   {s:'TPRM',sub:'third-party risk',target:7,actual:6},
   {s:'ATC / ATS',sub:'approval to contract',target:4,actual:5},
   {s:'Contracting',sub:'redline to signature',target:12,actual:10},
   {s:'PO / execution',sub:'award to PO',target:3,actual:2}
  ]},
 'Aisha Khan':{
  withinSLA:[9,11], avgCycle:7.8, target:10.5, onTime:82,
  stages:[
   {s:'Intake → triage',sub:'request to scope',target:3,actual:3},
   {s:'Triage → reviews',sub:'route to gates',target:2,actual:1},
   {s:'Legal review',sub:'redlines',target:7,actual:6},
   {s:'Cyber / ISS',sub:'security questionnaire',target:7,actual:7},
   {s:'TPRM',sub:'third-party risk',target:7,actual:9},
   {s:'ATC / ATS',sub:'approval to contract',target:4,actual:3},
   {s:'Contracting',sub:'redline to signature',target:12,actual:11}
  ]},
 'Dan Reed':{
  withinSLA:[8,10], avgCycle:11.2, target:11.5, onTime:74,
  stages:[
   {s:'Intake → triage',sub:'request to scope',target:3,actual:4},
   {s:'Sourcing / RFx',sub:'bid window',target:20,actual:22},
   {s:'Cyber / ISS',sub:'security questionnaire',target:7,actual:7},
   {s:'TPRM',sub:'third-party risk',target:7,actual:6},
   {s:'ATC / ATS',sub:'approval to contract',target:4,actual:5},
   {s:'Contracting',sub:'redline to signature',target:12,actual:12}
  ]}
};
function slaRes(target,actual){
 if(actual<=target) return 'ok';
 if(actual<=target*1.18) return 'near';
 return 'over';
}
// ── stage ownership: which gates are the rep's clock vs out of their hands ──
// A rep is graded only on rep-controllable time. Time parked with another team
// (legal, security, AI/model-risk, TPRM, an approver, or the supplier) is shown
// but excluded from the grade, so a slow external review never tanks the score.
const REP_OWNED_STAGES=['Intake → triage','Triage → reviews','Contracting','PO / execution'];
const EXT_PARTY={'Legal review':'Legal','Cyber / ISS':'Security / ISS','AI review':'AI review team','TPRM':'TPRM / Aravo','ATC / ATS':'Approver','Sourcing / RFx':'Suppliers'};
function stageOwn(name){ return REP_OWNED_STAGES.indexOf(name)>=0 ? {own:'rep',party:'your clock'} : {own:'ext',party:(EXT_PARTY[name]||'another team')}; }
// the per-gate SLA detail strip, lives inside the report-card cycle-time drill-down
function slaStripHTML(name){
 const d=SLA_BY_REP[name]; if(!d) return '';
 const within=d.stages.filter(x=>slaRes(x.target,x.actual)==='ok').length, total=d.stages.length;
 const ext=d.stages.filter(x=>stageOwn(x.s).own==='ext').length;
 const max=Math.max(...d.stages.flatMap(x=>[x.target,x.actual]),1);
 const rows=d.stages.map(x=>{
  const res=slaRes(x.target,x.actual), o=stageOwn(x.s);
  const fillPct=Math.max(6,Math.round(x.actual/max*100)), tickPct=Math.round(x.target/max*100);
  const word=res==='ok'?'Within SLA':res==='near'?'At risk':'Over SLA';
  const flag=o.own==='ext'?`<span class="stext" title="Out of your hands · ${o.party}. Not counted in your grade.">not your clock · ${o.party}</span>`:'';
  return `<div class="slarow ${res}${o.own==='ext'?' extstage':''}">
   <div class="snm">${x.s}<small>${x.sub}</small>${flag}</div>
   <div class="bar"><i style="width:${fillPct}%"></i><span class="tick" style="left:${tickPct}%" title="SLA target ${x.target}d"></span></div>
   <div class="res">${word}<small>${x.actual}d / ${x.target}d</small></div>
  </div>`;
 }).join('');
 return `<div class="slastrip"><div class="slastriphd">${within} of ${total} gates within SLA this quarter. The ${ext} greyed gate${ext===1?'':'s'} below sit with other teams and are excluded from your grade.</div>${rows}
  <div class="slastriplg"><span><i style="background:var(--bblue)"></i>within SLA</span><span><i style="background:var(--cci-yellow)"></i>at risk</span><span><i style="background:var(--red)"></i>over SLA</span><span><i style="background:transparent;border-left:1.5px dashed var(--mut2);width:0;height:11px"></i>SLA target</span></div></div>`;
}

// ── targets (SLA + savings): system-recommended, manager-adjustable ──────────
// Recommended from team historical averages blended with an illustrative industry
// benchmark; the manager can override each in the Leadership view (kept in-session).
// Grades read these, so volume never moves a grade - only SLA adherence + savings.
const BENCH={onTimePct:85, projCycle:5.0, contractCycle:10.0};   // illustrative industry benchmarks (prototype-seeded)
function teamMean(fn){ const v=ORDER.map(fn).filter(x=>x!=null&&!isNaN(x)); return v.length? v.reduce((a,b)=>a+b,0)/v.length : null; }
function lastYTD(name,title){ const rc=RC_BY_REP[name], m=rc&&rc.metrics.filter(x=>x.t===title)[0]; return m?m.years[m.years.length-1][1]:null; }
function metricByTitle(name,title){ const rc=RC_BY_REP[name]; return rc?rc.metrics.filter(x=>x.t===title)[0]:null; }
// Recommend a target for every GRADED metric. Cost/SLA/quality KPIs are benchmarked to
// the TEAM AVERAGE for that metric (so above-team grades up, below grades down), with a
// benchmark nudge where we have one. Savings is annualized off the rep's live YTD book.
function recommendTarget(name,m){
 if(m.kind==='money'){
  const ytd=m.years[m.years.length-1][1], ann=yearElapsed()?ytd/yearElapsed():ytd, sv=Math.max(25,Math.round(ann/25)*25);
  return {rec:sv, src:`your YTD run-rate annualized (${fmtK(ytd)} booked so far)`};
 }
 const tm=teamMean(n=>lastYTD(n,m.t));
 if(m.kind==='days'){
  const v=Math.round((tm!=null?tm:(m.t==='Contract cycle time'?BENCH.contractCycle:BENCH.projCycle))*10)/10;
  return {rec:v, src:`team average ${v}d controllable`};
 }
 const v=Math.round(tm!=null?tm:80);
 const bn=m.t==='On-time delivery'?` (vs ${BENCH.onTimePct}% industry benchmark)`:'';
 return {rec:v, src:`team average ${v}%${bn}`};
}
const TARGETS={};
function targetsFor(name){
 if(!TARGETS[name]){ const rc=RC_BY_REP[name], T={};
  if(rc) rc.metrics.forEach(function(m){ if(m.ctx) return; const r=recommendTarget(name,m); T[m.t]={value:r.rec, rec:r.rec, src:r.src}; });
  TARGETS[name]=T; }
 return TARGETS[name];
}

// ════════════════════════════════════════════════════════════════
//  2 · MY WORKLOAD, portfolio timeline (every gate plotted by date)
// ════════════════════════════════════════════════════════════════
// TODAY anchors the axis. Gates carry an explicit date string.
const TODAY=new Date('2026-06-26T00:00:00');
const DAY=864e5;
function d(s){return new Date(s+'T00:00:00');}
function dlabel(dt){return dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
// status: 'done' | 'inprog' | 'blocked' | 'proj'(future).  basis = projection rationale (future only).
// wait = the hold-up (who/what) when this gate is the current bottleneck.