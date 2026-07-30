const TLPROJ={
 'Marc Lane':[
  {id:'P-1042',name:'Acme AI, Analytics SaaS',slug:'acme',pri:2,risk:'warn',risktxt:'AI review running 4d over standard',gates:[
   {g:'Intake',date:'2026-05-18',status:'done'},
   {g:'Triage',date:'2026-05-22',status:'done'},
   {g:'Legal review',date:'2026-06-05',status:'done'},
   {g:'Cyber / ISS',date:'2026-06-24',status:'inprog',wait:{who:'Acme',what:'ISS security questionnaire returned, 2 of 14 answers outstanding'}},
   {g:'AI review',date:'2026-06-30',status:'proj',basis:'starts when Cyber clears · model-risk screen ~5d'},
   {g:'TPRM',date:'2026-07-08',status:'proj',basis:'parallel to AI review · 7d standard'},
   {g:'ATC / ATS',date:'2026-07-15',status:'proj',basis:'after all reviews clear · 4d to approve'},
   {g:'Contract',date:'2026-07-29',status:'proj',basis:'redline cycle ~10d from ATC'},
   {g:'PO / execution',date:'2026-08-04',status:'proj',basis:'PO cut within 3d of signature'}
  ]},
  {id:'P-1056',name:'Data platform, RFP',slug:'nimbus',pri:1,risk:'risk',risktxt:'Critical path, 2 of 4 bids late, award gate blocked',gates:[
   {g:'Intake',date:'2026-05-29',status:'done'},
   {g:'Triage',date:'2026-06-03',status:'done'},
   {g:'RFx issued',date:'2026-06-10',status:'done'},
   {g:'Bid window',date:'2026-06-26',status:'blocked',wait:{who:'4 bidders',what:'2 of 4 proposals late, award gate cannot open until all land'}},
   {g:'Evaluation',date:'2026-07-06',status:'proj',basis:'scoring opens once all bids land · ~7d'},
   {g:'Reviews (parallel)',date:'2026-07-17',status:'proj',basis:'Legal + Cyber + TPRM on the awarded vendor'},
   {g:'ATC / ATS',date:'2026-07-24',status:'proj',basis:'award approval after reviews'},
   {g:'Contract',date:'2026-08-07',status:'proj',basis:'new-vendor MSA ~14d'}
  ]},
  {id:'P-0991',name:'Helios, ITSM renewal',slug:'helios',pri:3,risk:'warn',risktxt:'Renew-vs-recompete decision is on you · Aug 31 expiry',gates:[
   {g:'Intake',date:'2026-06-01',status:'done'},
   {g:'Spend review',date:'2026-06-12',status:'done'},
   {g:'Renew/recompete',date:'2026-06-25',status:'inprog',wait:{who:'you',what:'renew-vs-recompete decision, benchmark pulled, awaiting your call'}},
   {g:'Negotiation',date:'2026-07-02',status:'proj',basis:'if renew: price-down round before the Aug 31 expiry'},
   {g:'Contract',date:'2026-07-20',status:'proj',basis:'renewal paper ~12d'},
   {g:'PO / execution',date:'2026-07-24',status:'proj',basis:'PO ahead of expiry'}
  ]},
  {id:'P-1001',name:'Brandly, Marketing DAM',pri:4,risk:'warn',risktxt:'ATC/ATS summary awaiting your sign-off',gates:[
   {g:'Intake',date:'2026-05-08',status:'done'},
   {g:'Triage',date:'2026-05-13',status:'done'},
   {g:'Legal review',date:'2026-05-27',status:'done'},
   {g:'Cyber / ISS',date:'2026-06-09',status:'done'},
   {g:'TPRM',date:'2026-06-18',status:'done'},
   {g:'ATC / ATS',date:'2026-06-24',status:'inprog',wait:{who:'you',what:'ATC/ATS summary ready, your sign-off opens contracting'}},
   {g:'Contract',date:'2026-07-06',status:'proj',basis:'buy under existing MSA · WO ~8d'},
   {g:'PO / execution',date:'2026-07-10',status:'proj',basis:'PO within 3d of WO signature'}
  ]},
  {id:'P-1039',name:'Veeva, Field CRM',pri:5,risk:'ok',risktxt:'On pace, Work Order out for signature',gates:[
   {g:'Intake',date:'2026-05-04',status:'done'},
   {g:'Triage',date:'2026-05-08',status:'done'},
   {g:'Reviews (parallel)',date:'2026-05-26',status:'done'},
   {g:'ATC / ATS',date:'2026-06-08',status:'done'},
   {g:'Contract',date:'2026-06-23',status:'inprog',wait:{who:'you',what:'Work Order out for signature, last gate before PO'}},
   {g:'PO / execution',date:'2026-07-01',status:'proj',basis:'PO cut within 3d of WO signature'}
  ]},
  {id:'P-1058',name:'DataPipe, Pipeline tooling',slug:'datapipe',pri:6,risk:'ok',risktxt:'Early intake, scoping, no blockers',gates:[
   {g:'Intake',date:'2026-06-15',status:'done'},
   {g:'Scoping',date:'2026-06-26',status:'inprog',wait:{who:'you',what:'requirements scoping with the requester'}},
   {g:'Triage',date:'2026-07-03',status:'proj',basis:'routes once scope is set · ~2d'},
   {g:'Reviews (parallel)',date:'2026-07-17',status:'proj',basis:'green CCI · standard review window'},
   {g:'Contract',date:'2026-07-31',status:'proj',basis:'buy under MSA ~10d'}
  ]},
  {id:'P-1012',name:'Okta, IdP add-on',pri:7,risk:'ok',risktxt:'On pace, small add-on under existing EA',gates:[
   {g:'Intake',date:'2026-05-20',status:'done'},
   {g:'Triage',date:'2026-05-26',status:'done'},
   {g:'Cyber / ISS',date:'2026-06-12',status:'done'},
   {g:'ATC / ATS',date:'2026-06-24',status:'done'},
   {g:'Contract',date:'2026-07-02',status:'inprog',wait:{who:'Legal',what:'order form on existing EA, light redline'}},
   {g:'PO / execution',date:'2026-07-08',status:'proj',basis:'PO within 3d of signature'}
  ]}
 ],
 'Aisha Khan':[
  {id:'P-1048',name:'Tata, Cross-border payroll',pri:1,risk:'warn',risktxt:'Legal blocked until the CCI / covered-data screen clears',gates:[
   {g:'Intake',date:'2026-06-02',status:'done'},
   {g:'Triage',date:'2026-06-06',status:'done'},
   {g:'CCI screen',date:'2026-06-24',status:'inprog',wait:{who:'Priya Shah',what:'CCI classification + covered-data screen in progress'}},
   {g:'Legal review',date:'2026-07-01',status:'proj',basis:'opens once data screen clears · ~7d'},
   {g:'ATC / ATS',date:'2026-07-10',status:'proj',basis:'after reviews · 4d'},
   {g:'Contract',date:'2026-07-22',status:'proj',basis:'buy under MSA ~12d'}
  ]},
  {id:'P-0975',name:'Quill, Doc automation',pri:2,risk:'ok',risktxt:'Closed, request canceled by the business',gates:[
   {g:'Intake',date:'2026-04-20',status:'done'},
   {g:'Triage',date:'2026-04-25',status:'done'},
   {g:'Reviews (parallel)',date:'2026-05-12',status:'done'},
   {g:'Closed, canceled',date:'2026-05-30',status:'done'}
  ]}
 ],
 'Dan Reed':[
  {id:'P-1051',name:'Globex, Lab data migration',pri:1,risk:'risk',risktxt:'ATC stalled 7 days, escalation out to Jordan Avery',gates:[
   {g:'Intake',date:'2026-05-25',status:'done'},
   {g:'Triage',date:'2026-05-29',status:'done'},
   {g:'Reviews (parallel)',date:'2026-06-15',status:'done'},
   {g:'ATC / ATS',date:'2026-06-25',status:'blocked',wait:{who:'Jordan Avery',what:'ATC approval stalled 7d, escalation sent'}},
   {g:'Contract',date:'2026-07-07',status:'proj',basis:'opens on ATC approval · ~12d'}
  ]},
  {id:'P-1055',name:'Sentry, Security PoC',pri:2,risk:'warn',risktxt:'PoC scoring underway · try-before-buy',gates:[
   {g:'Intake',date:'2026-06-08',status:'done'},
   {g:'PoC scoping',date:'2026-06-16',status:'done'},
   {g:'PoC evaluation',date:'2026-06-26',status:'inprog',wait:{who:'Dan Reed',what:'PoC scoring underway · try-before-buy'}},
   {g:'Buy decision',date:'2026-07-03',status:'proj',basis:'go/no-go after PoC · ~5d'},
   {g:'Reviews (parallel)',date:'2026-07-14',status:'proj',basis:'only if PoC passes'},
   {g:'Contract',date:'2026-07-28',status:'proj',basis:'new-vendor paper if go'}
  ]}
 ]
};
// axis window: pad ~1 wk before earliest gate and ~1 wk after latest, snap to Mondays.
function mondayOf(dt){const x=new Date(dt);const wd=(x.getDay()+6)%7;x.setDate(x.getDate()-wd);x.setHours(0,0,0,0);return x;}
let focusId=null;
let AXIS={start:null,end:null,weeks:[]};
function buildAxis(rows){
 let min=Infinity,max=-Infinity;
 rows.forEach(p=>p.gates.forEach(g=>{const t=d(g.date).getTime();if(t<min)min=t;if(t>max)max=t;}));
 if(!isFinite(min)){min=TODAY.getTime();max=TODAY.getTime();}
 const start=mondayOf(new Date(min-3*DAY));
 const end=mondayOf(new Date(max+6*DAY));
 const weeks=[];
 for(let t=start.getTime();t<=end.getTime();t+=7*DAY) weeks.push(new Date(t));
 // ensure span covers ~8 weeks minimum for legibility
 while(weeks.length<8){const last=weeks[weeks.length-1];weeks.push(new Date(last.getTime()+7*DAY));}
 AXIS={start,end:weeks[weeks.length-1],weeks};
}
function pctFor(dt){
 const span=AXIS.end.getTime()-AXIS.start.getTime();
 return span?((dt.getTime()-AXIS.start.getTime())/span)*100:0;
}
const TOP_N=5;                          // default-visible projects (highest priority/risk first)
let tlExpanded=false;                    // "show all" state
const RISK_WORD={risk:'At risk',warn:'Watch',ok:'On pace'};
// project details page: deep-link by slug when known, else land on the page.
function projHref(p){return p.slug?('project-view.html#p='+p.slug):'project-view.html';}
function gotoProject(id){
 const p=(TLPROJ[me]||[]).find(x=>x.id===id); if(!p) return;
 location.href=projHref(p);
}
// rank: blocked/at-risk first, then explicit pri, then earliest next gate.
function tlRank(a,b){
 const rw={risk:0,warn:1,ok:2};
 const ra=rw[a.risk]??1, rb=rw[b.risk]??1;
 if(ra!==rb) return ra-rb;
 return (a.pri||99)-(b.pri||99);
}
function renderTimeline(){
 const rows=(TLPROJ[me]||[]).slice().sort(tlRank);
 buildAxis(rows);                        // axis spans ALL projects so expand keeps the same scale
 // drive the chart min-width off the real week count so a long axis scrolls
 // horizontally (axis + lanes scroll together) instead of crushing the weeks.
 const chart=$('#tlchart'); if(chart) chart.style.setProperty('--wks',AXIS.weeks.length);
 // ── week header ──
 const nowPct=pctFor(TODAY);
 const wk=$('#tlweeks');
 wk.innerHTML=AXIS.weeks.map((w,i)=>{
  const left=pctFor(w);
  const next=i<AXIS.weeks.length-1?pctFor(AXIS.weeks[i+1]):100;
  const isFut=w.getTime()>TODAY.getTime();
  const isCur=w.getTime()<=TODAY.getTime() && (i===AXIS.weeks.length-1 || AXIS.weeks[i+1].getTime()>TODAY.getTime());
  return `<div class="tlweek ${isFut?'fut':''} ${isCur?'cur':''}" style="left:${left}%;width:${Math.max(0,next-left)}%">
    <span class="wn">Wk ${i+1}</span><span class="wd">${dlabel(w)}</span></div>`;
 }).join('');
 // ── body: gridlines + per-project lanes ──
 const grid=AXIS.weeks.map((w,i)=>{
  const left=pctFor(w);
  const isFut=w.getTime()>TODAY.getTime();
  return `<div class="${isFut?'glf':'gl'}" style="left:${left}%"></div>`;
 }).join('');
 const futWash=`<div class="futwash" style="left:${nowPct}%;right:0"></div>`;
 const lanes=rows.map((p,idx)=>{
  const hidden=(!tlExpanded && idx>=TOP_N);
  // spine: from first to last gate; solid (past) up to today, dashed beyond
  const first=pctFor(d(p.gates[0].date));
  const last=pctFor(d(p.gates[p.gates.length-1].date));
  const solidEnd=Math.min(last,Math.max(first,nowPct));
  const spine=`<span class="spine" style="left:${first}%;width:${Math.max(0,solidEnd-first)}%"></span>`+
    (last>nowPct?`<span class="spinef" style="left:${Math.max(first,nowPct)}%;width:${Math.max(0,last-Math.max(first,nowPct))}%"></span>`:'');
  const nodes=p.gates.map((g,gi)=>{
   const left=pctFor(d(g.date));
   const data=encodeURIComponent(JSON.stringify({pn:p.name,pid:p.id,g:g.g,status:g.status,date:g.date,wait:g.wait||null,basis:g.basis||null}));
   return `<span class="node ${g.status}" style="left:${left}%" data-tip="${data}" tabindex="0"></span>`;
  }).join('');
  const pri=p.risk||'ok';
  return `<div class="lane ${hidden?'tlhide':''}" data-id="${p.id}" onclick="gotoProject('${p.id}')" title="Open ${p.name}">
   <div class="llabel"><span class="lnm" title="${p.risktxt||''}">${p.name}</span><svg class="lnk" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></div>
   <div class="ltrack">${spine}${nodes}</div>
  </div>`;
 }).join('');
 $('#tlbody').innerHTML=`<div class="tlgrid">${futWash}${grid}<div class="tlnow" style="left:${nowPct}%"><span class="lab">TODAY</span></div></div>${lanes||'<div class="empty">No active gates in your book.</div>'}`;
 wireNodes();
 // ── show-all toggle ──
 const extra=Math.max(0,rows.length-TOP_N);
 const more=$('#tlmore');
 if(extra>0){
  more.style.display='';
  more.innerHTML=`<button class="${tlExpanded?'open':''}" onclick="tlToggleAll(event)">
    ${tlExpanded?'Show top '+TOP_N+' only':'Show all '+rows.length+' projects'}
    <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>`;
 } else { more.style.display='none'; more.innerHTML=''; }
 // reflect-only critical-path note (per rep)
 const note={
  'Marc Lane':`<b>P-1056 is your critical path</b>, 2 of 4 bids are late, holding the award gate. Everything downstream (evaluation → reviews → contract) shifts with it. Worth a nudge to the late bidders.`,
  'Aisha Khan':`<b>P-1048 hinges on the data screen</b>, Legal can't open until the CCI / covered-data classification clears. No other lane is blocked right now.`,
  'Dan Reed':`<b>P-1051 ATC has been stalled 7 days</b>, it's the one blocked gate in your book; an escalation is out to Jordan Avery.`
 }[me]||`Your lanes look on pace, no single blocker stands out right now.`;
 $('#tlfocustxt').innerHTML=note;
}
function tlToggleAll(e){if(e)e.stopPropagation();tlExpanded=!tlExpanded;renderTimeline();}
// ── custom hover card (identity lives here, not on the axis) ──
function wireNodes(){
 const tip=ensureTip();
 document.querySelectorAll('#tlbody .node').forEach(n=>{
  n.addEventListener('mouseenter',e=>showTip(e.currentTarget,tip));
  n.addEventListener('focus',e=>showTip(e.currentTarget,tip));
  n.addEventListener('mouseleave',()=>hideTip(tip));
  n.addEventListener('blur',()=>hideTip(tip));
 });
}
function ensureTip(){
 let t=document.getElementById('tltip');
 if(!t){t=document.createElement('div');t.id='tltip';t.className='tltip';document.body.appendChild(t);}
 return t;
}
const STATUS_WORD={done:'Done',inprog:'In progress',blocked:'Blocked / at risk',proj:'Projected'};
function showTip(node,tip){
 const data=JSON.parse(decodeURIComponent(node.dataset.tip));
 const dt=d(data.date);
 const dateTxt=dlabel(dt)+', '+dt.getFullYear();
 const future=data.status==='proj';
 let body=`<div class="tt">${data.g}</div><div class="tp">${data.pname||data.pn} · ${data.pid}</div>`;
 body+=`<div class="tstat ${data.status}"><span class="d"></span>${STATUS_WORD[data.status]}</div>`;
 if(data.wait){
  body+=`<div class="twait"><span class="lab">${data.status==='blocked'?'Holding everything up':'Waiting on'}</span><b>${data.wait.who}</b>, ${data.wait.what}</div>`;
 }
 if(future && data.basis){
  body+=`<div class="twait"><span class="lab">Projection basis</span>${data.basis}</div>`;
 }
 body+=`<div class="tdate">${future?'Projected ':'Closed '}${dateTxt}</div>`;
 tip.innerHTML=body;
 // position above the node, clamped to viewport
 const r=node.getBoundingClientRect();
 tip.style.left='0px';tip.style.top='0px';tip.classList.add('on');
 const tw=tip.offsetWidth,th=tip.offsetHeight;
 let x=r.left+r.width/2-tw/2;
 x=Math.max(10,Math.min(x,window.innerWidth-tw-10));
 let y=r.top-th-10;
 if(y<10) y=r.bottom+10; // flip below if no room above
 tip.style.left=x+'px';tip.style.top=y+'px';
}
function hideTip(tip){tip.classList.remove('on');}
function focusProject(id){
 focusId=(focusId===id)?null:id;
 $('#tlcard').classList.remove('collapsed');
 document.querySelectorAll('#tlbody .lane').forEach(l=>l.classList.toggle('focus',l.dataset.id===focusId));
 if(focusId){
  const lane=document.querySelector('#tlbody .lane[data-id="'+focusId+'"]');
  if(lane) lane.scrollIntoView({behavior:'smooth',block:'nearest'});
  const p=(TLPROJ[me]||[]).find(x=>x.id===focusId);
  if(p) toast('Focusing '+p.id+' · '+p.name);
 }
}
function tlToggle(){$('#tlcard').classList.toggle('collapsed');}

// ════════════════════════════════════════════════════════════════
//  3 · THE SUPPLIERS I MANAGE
// ════════════════════════════════════════════════════════════════
// spend in $K · href deep-links to the supplier's profile on suppliers-spend.html