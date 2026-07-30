const SUP_BY_REP={
 'Marc Lane':{
  suppliers:[
   {id:'SUP-TATA',name:'Tata Consultancy',cat:'IT services · payroll',spend:3120,flag:''},
   {id:'SUP-VEEVA',name:'Veeva Systems',cat:'Life-sciences SaaS · CRM',spend:2480,flag:''},
   {id:'SUP-GLX',name:'Globex Systems',cat:'Data & integration',spend:1760,flag:''},
   {id:'SUP-NOW',name:'ServiceNow',cat:'ITSM / workflow SaaS',spend:1340,flag:'renews 90d'},
   {id:'SUP-DELL',name:'Dell Technologies',cat:'Hardware · infrastructure',spend:980,flag:''},
   {id:'SUP-FIGMA',name:'Figma',cat:'Design SaaS',spend:540,flag:'TPRM review'},
   {id:'SUP-INFY',name:'Infosys',cat:'IT services · integration',spend:430,flag:'action'},
   {id:'SUP-ACME',name:'Acme AI',cat:'Analytics SaaS',spend:0,flag:'in sourcing'}
  ],
  renewals:[
   {id:'SUP-NOW',name:'ServiceNow',ct:'CW-2291 · ITSM platform',date:'2026-08-31',hint:'renew',hintTxt:'price-down round before auto-renewal'},
   {id:'SUP-VEEVA',name:'Veeva Systems',ct:'CW-2107 · Field CRM',date:'2026-09-30',hint:'reneg',hintTxt:'usage up 22%, renegotiate tiers'},
   {id:'SUP-TATA',name:'Tata Consultancy',ct:'CW-1980 · Payroll MSA',date:'2026-11-15',hint:'renew',hintTxt:'on standard rate card'},
   {id:'SUP-INFY',name:'Infosys',ct:'CW-2044 · Integration SOW',date:'2026-12-20',hint:'recompete',hintTxt:'TPRM action open, consider recompete'}
  ]},
 'Aisha Khan':{
  suppliers:[
   {id:'SUP-TATA',name:'Tata Consultancy',cat:'IT services · payroll',spend:2640,flag:''},
   {id:'SUP-INFY',name:'Infosys',cat:'IT services · integration',spend:1180,flag:''},
   {id:'SUP-FIGMA',name:'Figma',cat:'Design SaaS',spend:360,flag:'TPRM review'}
  ],
  renewals:[
   {id:'SUP-TATA',name:'Tata Consultancy',ct:'CW-1980 · Payroll MSA',date:'2026-10-10',hint:'renew',hintTxt:'on standard rate card'},
   {id:'SUP-INFY',name:'Infosys',ct:'CW-2044 · Integration SOW',date:'2026-12-01',hint:'reneg',hintTxt:'scope changed, renegotiate'}
  ]},
 'Dan Reed':{
  suppliers:[
   {id:'SUP-GLX',name:'Globex Systems',cat:'Data & integration',spend:1980,flag:''},
   {id:'SUP-DELL',name:'Dell Technologies',cat:'Hardware · infrastructure',spend:1220,flag:''},
   {id:'SUP-NOW',name:'ServiceNow',cat:'ITSM / workflow SaaS',spend:760,flag:''}
  ],
  renewals:[
   {id:'SUP-GLX',name:'Globex Systems',ct:'CW-2156 · Data platform',date:'2026-09-12',hint:'reneg',hintTxt:'consolidation opportunity'},
   {id:'SUP-DELL',name:'Dell Technologies',ct:'CW-1899 · Hardware EA',date:'2026-11-30',hint:'renew',hintTxt:'refresh cycle aligned'}
  ]}
};
const fmtK=v=>v>=1000?'$'+(v/1000).toFixed(v%1000?1:0)+'M':'$'+v+'K';
// how many top suppliers (ranked desc by spend) cumulatively make up the top 80% of spend
function vitalFew(ranked){
 const total=ranked.reduce((s,x)=>s+x.spend,0)||1; let cum=0;
 for(let i=0;i<ranked.length;i++){cum+=ranked[i].spend; if(cum/total>=0.8) return i+1;}
 return ranked.length;
}
function daysOut(dateStr){return Math.round((d(dateStr).getTime()-TODAY.getTime())/DAY);}

// ── Seed-sourced overrides (golden thread) ──────────────────────────────────
// Rebuild the per-rep supplier + savings books from the consolidated seed via
// Theo.data so the suppliers, spend, owners, renewals and savings shown here match
// every other page. The derived objects keep the SAME field names the render code
// already expects, so render logic below is untouched. Absent seed -> page seeds.
function meGid(){ const T=window.THEO; const p=T&&T.byName?T.byName(me):null; return p?p.gid:null; }
function supCatLabel(s){
 var base=(s.category||'').toLowerCase();
 var com=(s.commodity||'');
 if(base.indexOf('it services')>=0) return com.indexOf('PAYROLL')>=0?'IT services · payroll':com.indexOf('INTEG')>=0?'IT services · integration':'IT services';
 if(base.indexOf('saas')>=0||base.indexOf('apps')>=0){
  if(com.indexOf('CRM')>=0) return 'Life-sciences SaaS · CRM';
  if(com.indexOf('ANALYTICS')>=0) return 'Analytics SaaS';
  if(com.indexOf('DESIGN')>=0) return 'Design SaaS';
  if(com.indexOf('MKTG')>=0) return 'Marketing SaaS';
  if(com.indexOf('DOC')>=0) return 'Document SaaS';
  return 'SaaS / apps';
 }
 if(base.indexOf('hardware')>=0||base.indexOf('infra')>=0) return 'Hardware · infrastructure';
 if(base.indexOf('itsm')>=0||base.indexOf('workflow')>=0) return 'ITSM / workflow SaaS';
 if(base.indexOf('data')>=0) return 'Data & integration';
 if(base.indexOf('security')>=0) return 'Security tooling';
 return s.category||'';
}
function supFlag(s){
 if(s.status==='sourcing') return 'in sourcing';
 if(s.status==='tprm') return 'TPRM review';
 if(s.status==='renewing') return 'renewing';
 if(s.status==='action') return 'action';
 if(s.status==='canceled') return 'canceled';
 if(s.risk&&s.risk.tier==='Critical') return 'risk · critical';
 if(s.risk&&s.risk.tier==='Elevated') return 'risk · elevated';
 if(s.singleSource) return 'single source';
 return '';
}
function paperShort(c){
 var sup=Theo.data.supplier(c.supplier)||{}; var nm=(sup.name||'').split(/[ ·]/)[0];
 return c.id+' · '+(c.paper||nm);
}
function renewHint(c){
 var st=(c.status||''), note=(c.note||'').toLowerCase();
 if(note.indexOf('recompete')>=0||note.indexOf('tprm')>=0) return {hint:'recompete',hintTxt:c.note||'consider recompete'};
 if(note.indexOf('renegotiate')>=0||note.indexOf('tiers')>=0||note.indexOf('usage')>=0) return {hint:'reneg',hintTxt:c.note||'renegotiate terms'};
 return {hint:'renew',hintTxt:c.note||'on standard terms'};
}
function buildSupBookFromDemo(gid){
 var D=window.Theo&&Theo.data; if(!D||!gid) return null;
 var sups=D.suppliersByRep(gid)||[];
 var suppliers=sups.map(function(s){ return {id:s.id,name:s.name,cat:supCatLabel(s),spend:(s.status==='sourcing'?0:s.spendK),flag:supFlag(s)}; });
 // renewals = contracts for this rep's suppliers, ranked soonest first, top 4
 var rens=[];
 sups.forEach(function(s){
  (D.contractsForSupplier(s.id)||[]).forEach(function(c){
   var h=renewHint(c);
   var pr=c.project?(D.project(c.project)||{}):{};
   var own=(pr.owner&&window.THEO)?window.THEO.displayName(pr.owner):'the business owner';
   rens.push({id:s.id,name:s.name,ct:paperShort(c),date:c.end,hint:h.hint,hintTxt:h.hintTxt,cid:c.id,noticeDays:c.noticeDays||30,autoRenew:!!c.autoRenew,ownerName:own,slug:pr.slug||null,projId:pr.id||null});
  });
 });
 rens.sort(function(a,b){return D.daysOut(a.date)-D.daysOut(b.date);});
 return {suppliers:suppliers,renewals:rens.slice(0,4)};
}
function buildSavBookFromDemo(gid){
 var D=window.Theo&&Theo.data; if(!D||!gid) return null;
 var rows=D.savingsByRep(gid)||[];
 var ci=0,ca=0,ytd=0;
 rows.forEach(function(r){ ytd+=r.amountK; if(r.kind==='ci') ci+=r.amountK; else ca+=r.amountK; });
 // a sensible personal target: round YTD up to the next 100 with a little headroom
 var target=Math.max(100,Math.ceil((ytd*1.18)/50)*50);
 var statMap={achieved:{stat:'achieved',statTxt:'achieved · Finance + M4 confirmed'},committed:{stat:'committed',statTxt:'committed · awaiting confirm'},pending:{stat:'pending',statTxt:'in negotiation'}};
 var inflight=rows.slice().sort(function(a,b){return b.amountK-a.amountK;}).slice(0,4).map(function(r){
  var proj=D.project(r.project)||{}; var sm=statMap[r.status]||statMap.committed;
  var kindTxt=r.kind==='ci'?'price down':'cost avoidance';
  return {name:r.note||((proj.name||r.project)),meta:r.project+' · '+kindTxt,amt:r.amountK,stat:sm.stat,statTxt:sm.statTxt};
 });
 return {ytd:ytd,target:target,ci:ci,ca:ca,inflight:inflight};
}
// override the seeds for the three sourcing reps wherever DEMO has them.
// Called once at init (after SAV_BY_REP is declared) so both books are derived.
function applyDemoBooks(){
 if(!(window.Theo&&Theo.data)||!window.THEO) return;
 ORDER.forEach(function(nm){
  var p=window.THEO.byName(nm); if(!p) return;
  var sb=buildSupBookFromDemo(p.gid); if(sb&&sb.suppliers.length) SUP_BY_REP[nm]=sb;
  var vb=buildSavBookFromDemo(p.gid);  if(vb&&vb.inflight.length) SAV_BY_REP[nm]=vb;
  // align the pinned "committed spend" breakdown + total to the SAME supplier book,
  // and the report-card "Savings driven" 2026 value to the SAME savings book, so the
  // headline numbers don't contradict the sections below or the other pages.
  if(sb&&sb.suppliers.length&&YTD_BY_REP[nm]){
   var active=sb.suppliers.filter(function(s){return s.spend>0;}).slice().sort(function(a,b){return b.spend-a.spend;});
   var by=active.slice(0,4).map(function(s){return [s.name,s.spend];});
   var rest=active.slice(4).reduce(function(t,s){return t+s.spend;},0);
   if(rest>0) by.push(['Other active',rest]);
   YTD_BY_REP[nm].committedSpend={k:active.reduce(function(t,s){return t+s.spend;},0),by:by};
  }
  if(vb&&vb.inflight.length&&RC_BY_REP[nm]){
   var sd=RC_BY_REP[nm].metrics.find(function(m){return m.t==='Savings driven';});
   if(sd){ sd.years[sd.years.length-1][1]=vb.ytd; sd.by=[['Cost improvement',vb.ci],['Cost avoidance',vb.ca]]; }
  }
 });
}

function renderSuppliers(){
 const data=SUP_BY_REP[me]||{suppliers:[],renewals:[]};
 const ranked=data.suppliers.slice().filter(s=>s.spend>0).sort((a,b)=>b.spend-a.spend);
 const totalSpend=ranked.reduce((s,x)=>s+x.spend,0)||1;
 const vf=vitalFew(ranked);                              // # of suppliers that make up the top 80% of spend
 const vital=ranked.slice(0,vf), tail=ranked.slice(vf);
 const maxSp=Math.max(...ranked.map(s=>s.spend),1);
 // the few suppliers that drive 80% of spend, they all fit, so no scroll
 $('#suplist').innerHTML = ranked.length ? (
   vital.map((s,i)=>{
    const pct=Math.round(s.spend/totalSpend*100);
    return `<a class="suprow ${s.flag?'flag':''}" href="suppliers-spend.html#${s.id}" title="Open ${s.name}'s profile">
     <span class="rk">${i+1}</span>
     <span class="sn"><span class="nm">${s.name}<svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>${s.flag?'<span class="tag">'+s.flag+'</span>':''}</span><span class="meta">${s.cat}</span></span>
     <span class="sp">${fmtK(s.spend)}<span class="sppct">${pct}%</span></span>
     <span class="miniwrap"><i style="width:${Math.max(3,Math.round(s.spend/maxSp*100))}%"></i></span>
    </a>`;
   }).join('') +
   (tail.length ? `<a class="suptail" href="suppliers-spend.html" title="See every supplier tagged to you">+ <b>${tail.length}</b> more supplier${tail.length>1?'s':''} make up the remaining <b>${Math.round(tail.reduce((s,x)=>s+x.spend,0)/totalSpend*100)}%</b> of spend →</a>` : '')
 ) : '<div class="empty">No suppliers tagged to you.</div>';
 var _rs=REP_GID[me]?Theo.data.repScale(REP_GID[me]):null; if(_rs&&Theo.isDNA(_rs))_rs=null; var _bookN=_rs?_rs.suppliers:data.suppliers.length;
 $('#supmeta').textContent=data.suppliers.length+' active of your '+_bookN+'-supplier book · '+vf+' drive ~80% of the spend in play';
 var _spendSrc=(function(){var sv=Theo.data.suppliersSeed();return sv.length?sv[0].$('spendK').sources:[];})();
 if(window.renderProvenance&&_spendSrc.length){var _sm=$('#supmeta'); if(_sm)_sm.innerHTML=_sm.textContent+' '+renderProvenance(_spendSrc,{label:'spend source'});}
 renderDonut(ranked);
 renderPareto(ranked);
 // renewals (soonest first)
 const rens=data.renewals.slice().sort((a,b)=>daysOut(a.date)-daysOut(b.date)).slice(0,4);
 $('#renlist').innerHTML=rens.length? rens.map(r=>{
  const dout=daysOut(r.date);
  const cls=dout<=75?'soon':dout<=120?'near':'ok';
  const dt=d(r.date);
  const noticeBy=dlabel(new Date(d(r.date).getTime()-(r.noticeDays||30)*DAY));
  const term=`Notice by <b>${noticeBy}</b> · ${r.autoRenew?'<b class="aru">auto-renews</b>':'no auto-renew'}`;
  const ownerFirst=(r.ownerName||'the business owner').split(' ')[0];
  const tail=r.autoRenew?'before it auto-renews':'before the notice deadline';
  return `<div class="renrow ${cls}">
   <div class="rn"><div class="nm">${r.name}</div><div class="ct">${r.ct} · ${r.cid}</div></div>
   <div class="rdate"><div class="dt">${dlabel(dt)}</div><div class="out">${dout}d out</div></div>
   <div class="hint"><span class="pip ${r.hint}">${r.hint==='reneg'?'renegotiate':r.hint}</span>${term}</div>
   <div class="renstatus">✦ Theo asked <b>${ownerFirst}</b> (owner) to decide, renew, renegotiate, terminate, or let expire, and put a follow-up on your board ${tail}.${r.projId?` <a class="renlink" href="${r.slug?('project-view.html#p='+r.slug):'project-view.html'}">Open ${r.projId} →</a>`:` <a class="renlink" href="suppliers-spend.html#${r.id}">Profile →</a>`}</div>
  </div>`;
 }).join('') : '<div class="empty">No upcoming renewals for your suppliers.</div>';
}
// Renewals are handled proactively by the standing monitor: when a contract enters its
// notice window it auto-opens a decision task for the business owner and a follow-up for
// the rep (see assets/tasks-drawer.js → mqMonitorTasks). Once the owner answers, Theo
// drafts the notice / renewal project for confirmation. No manual buttons on this panel.
// vanilla-SVG Pareto, proper coordinate space (no aspect distortion).
// Bars = spend (left axis, descending). Line = cumulative % (right axis 0–100%).
function renderPareto(sups){
 const el=$('#pareto');
 const arr=sups.slice().filter(s=>s.spend>0).sort((a,b)=>b.spend-a.spend);
 if(!arr.length){el.innerHTML='<div class="empty">No spend to chart yet.</div>';$('#paretometa').textContent='';return;}
 const W=320,H=176,padL=10,padR=34,padT=14,padB=30;  // real px coords, uniform scaling
 const plotW=W-padL-padR, plotH=H-padT-padB;
 const total=arr.reduce((s,x)=>s+x.spend,0);
 const maxSp=Math.max(...arr.map(x=>x.spend),1);
 const n=arr.length, vf=vitalFew(arr);               // vital few = suppliers making up 80% of spend
 const slot=plotW/n, bw=Math.min(slot*0.58,30);
 const yBar=v=>padT+plotH-(v/maxSp)*plotH;           // spend → y
 const yCum=p=>padT+plotH-(p/100)*plotH;             // 0–100% → y
 let cum=0; const pts=[],bars=[],labels=[];
 arr.forEach((x,i)=>{
  const cx=padL+slot*i+slot/2, y=yBar(x.spend), tail=i>=vf;   // tail (beyond 80%) trails off
  bars.push(`<rect class="pbar ${tail?'tail':''}" x="${(cx-bw/2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${(padT+plotH-y).toFixed(1)}" rx="2"><title>${x.name}: ${fmtK(x.spend)}</title></rect>`);
  cum+=x.spend; const cumPct=cum/total*100;
  pts.push([cx,yCum(cumPct),cumPct]);
  labels.push(`<text class="plbl ${tail?'tail':''}" x="${cx.toFixed(1)}" y="${(padT+plotH+12).toFixed(1)}" text-anchor="middle">${x.name.split(/[ ·]/)[0].slice(0,8)}</text>`);
 });
 // right-hand % scale at 0/50/100
 let grid='';
 [0,50,100].forEach(p=>{const gy=yCum(p);
  grid+=`<line class="pgl" x1="${padL}" y1="${gy.toFixed(1)}" x2="${(W-padR).toFixed(1)}" y2="${gy.toFixed(1)}"/>`+
        `<text class="pyr" x="${(W-padR+3).toFixed(1)}" y="${(gy+3).toFixed(1)}">${p}%</text>`;});
 // the 80% reference + the vital-few / long-tail vertical (the 20/80 split)
 const y80=yCum(80);
 const ref80=`<line class="p80" x1="${padL}" y1="${y80.toFixed(1)}" x2="${(W-padR).toFixed(1)}" y2="${y80.toFixed(1)}"/><text class="pyr" x="${(W-padR+3).toFixed(1)}" y="${(y80+3).toFixed(1)}">80%</text>`;
 const ci=pts.findIndex(p=>p[2]>=80);
 let xSplit; if(ci<=0){xSplit=pts[0][0];} else {const a=pts[ci-1],b=pts[ci];xSplit=a[0]+(80-a[2])/(b[2]-a[2])*(b[0]-a[0]);}
 const split=`<line class="psplit" x1="${xSplit.toFixed(1)}" y1="${padT.toFixed(1)}" x2="${xSplit.toFixed(1)}" y2="${(padT+plotH).toFixed(1)}"/>`+
   `<text class="psplitlbl" x="${(xSplit+3).toFixed(1)}" y="${(padT+7).toFixed(1)}" text-anchor="start">80% of spend</text>`;
 const axis=`<line class="pax" x1="${padL}" y1="${(padT+plotH).toFixed(1)}" x2="${(W-padR).toFixed(1)}" y2="${(padT+plotH).toFixed(1)}"/>`;
 const line=`<polyline class="pcum" points="${pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`;
 const dots=pts.map(p=>`<circle class="pdot" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6"><title>${p[2].toFixed(0)}% cumulative</title></circle>`).join('');
 el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${grid}${ref80}${axis}${bars.join('')}${split}${line}${dots}${labels.join('')}</svg>`;
 $('#paretometa').textContent=vf+' of '+n+' suppliers = 80% of spend';
}
// ── spend-by-category donut (value-add viz above the Pareto) ──
const CAT_PALETTE=['var(--bblue)','var(--blue-d)','var(--blue-mut)','var(--amber-d)','var(--cci-yellow)','#5B7BAA','#A9B8CC'];
function catBucket(s){
 const c=(s.cat||'').toLowerCase();
 if(c.includes('payroll')||c.includes('it services')||c.includes('integration'))return 'IT services';
 if(c.includes('hardware')||c.includes('infrastructure'))return 'Hardware & infra';
 if(c.includes('itsm')||c.includes('workflow'))return 'ITSM / workflow';
 if(c.includes('crm')||c.includes('life-science')||c.includes('saas')||c.includes('design')||c.includes('analytics'))return 'SaaS / apps';
 if(c.includes('data'))return 'Data & integration';
 return 'Other';
}
function renderDonut(sups){
 const el=$('#donut');
 const arr=sups.filter(s=>s.spend>0);
 if(!arr.length){el.innerHTML='<div class="empty" style="padding:18px">No spend to chart yet.</div>';$('#donutmeta').textContent='';return;}
 const m={};
 arr.forEach(s=>{const k=catBucket(s);m[k]=(m[k]||0)+s.spend;});
 const cats=Object.entries(m).map(([name,spend])=>({name,spend})).sort((a,b)=>b.spend-a.spend);
 const total=cats.reduce((s,x)=>s+x.spend,0);
 // SVG donut via stroke-dasharray on a circle
 const R=15.9155, C=2*Math.PI*R; let off=0;
 const segs=cats.map((c,i)=>{
  const frac=c.spend/total, len=frac*C;
  const seg=`<circle cx="21" cy="21" r="${R}" fill="none" stroke="${CAT_PALETTE[i%CAT_PALETTE.length]}" stroke-width="6" stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 21 21)"><title>${c.name}: ${fmtK(c.spend)} (${Math.round(frac*100)}%)</title></circle>`;
  off+=len; return seg;
 }).join('');
 const svg=`<svg viewBox="0 0 42 42">${segs}<text class="num" x="21" y="21.2" text-anchor="middle">${fmtK(total)}</text><text class="cap" x="21" y="25" text-anchor="middle">TOTAL SPEND</text></svg>`;
 const legend=cats.map((c,i)=>`<div class="dlrow"><i style="background:${CAT_PALETTE[i%CAT_PALETTE.length]}"></i><span class="dn">${c.name}</span><span class="dv">${Math.round(c.spend/total*100)}%</span></div>`).join('');
 el.innerHTML=svg+`<div class="dlegend">${legend}</div>`;
 $('#donutmeta').textContent=cats.length+' categories';
}

// ════════════════════════════════════════════════════════════════
//  4 · MY SAVINGS, the rep's own committed + achieved savings
// ════════════════════════════════════════════════════════════════
// $K. ci = cost improvement (price down) · ca = cost avoidance.
const SAV_BY_REP={
 'Marc Lane':{ytd:420,target:500,ci:265,ca:155,inflight:[
   {name:'Helios ITSM renewal',meta:'P-0991 · price-down round',amt:48,stat:'pending',statTxt:'in negotiation, Finance review pending'},
   {name:'Veeva tier renegotiation',meta:'CW-2107 · volume tiers',amt:72,stat:'committed',statTxt:'committed · awaiting M4 confirm'},
   {name:'Dell hardware EA',meta:'consolidated refresh',amt:35,stat:'achieved',statTxt:'achieved · Finance + M4 confirmed'}
 ]},
 'Aisha Khan':{ytd:285,target:350,ci:170,ca:115,inflight:[
   {name:'Tata rate-card hold',meta:'CW-1980 · no uplift',amt:54,stat:'achieved',statTxt:'achieved · confirmed'},
   {name:'Infosys SOW rescope',meta:'CW-2044',amt:38,stat:'pending',statTxt:'in negotiation'}
 ]},
 'Dan Reed':{ytd:198,target:300,ci:96,ca:102,inflight:[
   {name:'Globex consolidation',meta:'CW-2156',amt:60,stat:'committed',statTxt:'committed · awaiting confirm'},
   {name:'Sentry PoC avoidance',meta:'try-before-buy',amt:22,stat:'pending',statTxt:'projected if no-go'}
 ]}
};
function renderSavings(){
 const s=SAV_BY_REP[me]; if(!s){return;}
 const ciPct=Math.round(s.ci/(s.ci+s.ca)*100), caPct=100-ciPct;
 const toGo=Math.max(0,s.target-s.ytd);
 $('#savhero').innerHTML=`
  <div class="big">${fmtK(s.ytd)}<small> YTD</small></div>
  <div class="cap">savings you've committed or achieved this year</div>
  <div class="splitbar"><i class="ci" style="width:${ciPct}%"></i><i class="ca" style="width:${caPct}%"></i></div>
  <div class="splitkey">
   <div class="skrow"><i style="background:var(--bblue)"></i>Cost improvement <span style="color:var(--mut2);font-family:var(--sans);font-size:12px;margin-left:2px">price down</span><span class="amt">${fmtK(s.ci)}</span></div>
   <div class="skrow"><i style="background:var(--blue-mut)"></i>Cost avoidance <span style="color:var(--mut2);font-family:var(--sans);font-size:12px;margin-left:2px">spend not incurred</span><span class="amt">${fmtK(s.ca)}</span></div>
  </div>
  <div class="target">Personal target ${fmtK(s.target)} · <b>${fmtK(toGo)} to go</b> (${Math.round(s.ytd/s.target*100)}% of goal)</div>`;
 $('#savflow').innerHTML=`<div class="savflow">`+s.inflight.map(it=>`
  <div class="savitem">
   <div class="si"><div class="nm">${it.name}</div><div class="meta">${it.meta}</div></div>
   <div class="amt">${fmtK(it.amt)}</div>
   <div class="sstat"><span class="pip ${it.stat}">${it.stat}</span>${it.statTxt}</div>
  </div>`).join('')+`</div>`;
}

// ════════════════════════════════════════════════════════════════
//  5 · MY REPORT CARD, this year vs. the last few (year-over-year)
// ════════════════════════════════════════════════════════════════
// Each metric: years[] oldest→newest, last entry = 2026 (YTD, partial).
// kind 'count'/'pct'/'money'. higher:true => up is the positive direction
// (we never color "good/bad" green; up=Bold Blue, down=red, flat=muted).
// `by` (optional) = type breakdown for the current year, shown as chips.
// Graded categories come first (SLA adherence + savings vs target); volume metrics
// are tagged ctx:true so they show for context only and never move the GPA.
// 8 GRADED categories (SLA adherence + savings/value, all controllable, vs target) then
// 2 CONTEXT categories (ctx:true - volume, never graded). Bandwidth/capacity is injected at
// render time as a DIAGNOSTIC (computed from workload x cycle time; not graded).