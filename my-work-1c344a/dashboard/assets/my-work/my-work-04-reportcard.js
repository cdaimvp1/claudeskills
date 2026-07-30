const RC_BY_REP={
 'Marc Lane':{
  metrics:[
   {t:'On-time delivery',kind:'pct',higher:true,years:[['2024',83],['2025',85],['2026',88]],
    foot:'Best on-time rate of the period.'},
   {t:'Project cycle time',kind:'days',higher:false,years:[['2024',5.9],['2025',5.4],['2026',5.0]],
    foot:'Intake to award, your controllable time only.'},
   {t:'Contract cycle time',kind:'days',higher:false,years:[['2024',10.6],['2025',10.0],['2026',9.6]],
    foot:'Redline to signature, your controllable time only.'},
   {t:'Savings driven',kind:'money',higher:true,years:[['2023',360],['2024',455],['2025',510],['2026',420]],
    by:[['Cost improvement',265],['Cost avoidance',155]],foot:'Pacing ahead of last full year.'},
   {t:'Savings realization rate',kind:'pct',higher:true,years:[['2024',88],['2025',90],['2026',92]],
    foot:'Share of committed savings that actually landed.'},
   {t:'Contract coverage',kind:'pct',higher:true,years:[['2024',91],['2025',93],['2026',94]],
    foot:'Share of your book under an active contract, not off-contract or expired.'},
   {t:'Sourcing compliance',kind:'pct',higher:true,years:[['2024',94],['2025',95],['2026',96]],
    foot:'Events run to policy; competitive where required.'},
   {t:'Supplier risk coverage',kind:'pct',higher:true,years:[['2024',88],['2025',90],['2026',91]],
    foot:'Suppliers with a current risk assessment. You keep coverage current; TPRM owns turnaround.'},
   {t:'Completed projects',kind:'count',higher:true,ctx:true,years:[['2023',19],['2024',22],['2025',25],['2026',14]],
    by:[['Renewal',6],['New supplier',4],['Add-on',3],['Canceled',1]],foot:'Volume handled, for context. Fewer or larger projects does not move your grade.'},
   {t:'Completed contracts',kind:'count',higher:true,ctx:true,years:[['2023',16],['2024',18],['2025',21],['2026',11]],
    by:[['Renewal paper',5],['WO / SOW',3],['MSA',2],['Amendment',1]],foot:'Volume handled, for context. Renewal paper remains the bulk of your book.'}
  ]},
 'Aisha Khan':{
  metrics:[
   {t:'On-time delivery',kind:'pct',higher:true,years:[['2024',80],['2025',81],['2026',82]],
    foot:'Steady; small year-over-year gain.'},
   {t:'Project cycle time',kind:'days',higher:false,years:[['2024',5.0],['2025',4.4],['2026',4.0]],
    foot:'Fastest controllable project cycle on the team.'},
   {t:'Contract cycle time',kind:'days',higher:false,years:[['2024',10.2],['2025',9.5],['2026',9.0]],
    foot:'Quick contract turns.'},
   {t:'Savings driven',kind:'money',higher:true,years:[['2024',240],['2025',330],['2026',285]],
    by:[['Cost improvement',170],['Cost avoidance',115]],foot:'Pacing ahead of last full year.'},
   {t:'Savings realization rate',kind:'pct',higher:true,years:[['2024',85],['2025',87],['2026',89]],
    foot:'Most committed savings realized.'},
   {t:'Contract coverage',kind:'pct',higher:true,years:[['2024',88],['2025',89],['2026',90]],
    foot:'Solid contract coverage of the book.'},
   {t:'Sourcing compliance',kind:'pct',higher:true,years:[['2024',91],['2025',92],['2026',93]],
    foot:'Events run to policy.'},
   {t:'Supplier risk coverage',kind:'pct',higher:true,years:[['2024',85],['2025',86],['2026',88]],
    foot:'Most suppliers risk-assessed and current.'},
   {t:'Completed projects',kind:'count',higher:true,ctx:true,years:[['2024',12],['2025',16],['2026',9]],
    by:[['Renewal',4],['New supplier',2],['Add-on',2],['Canceled',1]],foot:'Volume handled, for context. Second full year, volume building steadily.'},
   {t:'Completed contracts',kind:'count',higher:true,ctx:true,years:[['2024',10],['2025',13],['2026',7]],
    by:[['Renewal paper',3],['WO / SOW',2],['Amendment',2]],foot:'Volume handled, for context. On pace with 2025.'}
  ]},
 'Dan Reed':{
  metrics:[
   {t:'On-time delivery',kind:'pct',higher:true,years:[['2023',76],['2024',72],['2025',75],['2026',74]],
    foot:'Long RFx windows pull the average; worth a look at sourcing SLAs.'},
   {t:'Project cycle time',kind:'days',higher:false,years:[['2024',7.8],['2025',7.0],['2026',6.8]],
    foot:'Competitive events run longer by design, but over the team bar.'},
   {t:'Contract cycle time',kind:'days',higher:false,years:[['2024',13.0],['2025',12.6],['2026',12.4]],
    foot:'Contract turns running over the team bar.'},
   {t:'Savings driven',kind:'money',higher:true,years:[['2023',210],['2024',180],['2025',265],['2026',198]],
    by:[['Cost improvement',96],['Cost avoidance',102]],foot:'Pacing ahead of last full year.'},
   {t:'Savings realization rate',kind:'pct',higher:true,years:[['2024',82],['2025',81],['2026',80]],
    foot:'Some committed savings slip before realization.'},
   {t:'Contract coverage',kind:'pct',higher:true,years:[['2024',84],['2025',85],['2026',85]],
    foot:'Coverage trails the team; a few suppliers off-contract.'},
   {t:'Sourcing compliance',kind:'pct',higher:true,years:[['2024',86],['2025',87],['2026',88]],
    foot:'Compliance below team average.'},
   {t:'Supplier risk coverage',kind:'pct',higher:true,years:[['2024',80],['2025',81],['2026',82]],
    foot:'Risk coverage trails the team.'},
   {t:'Completed projects',kind:'count',higher:true,ctx:true,years:[['2023',11],['2024',9],['2025',10],['2026',6]],
    by:[['Renewal',3],['New supplier',2],['Canceled',1]],foot:'Volume handled, for context. Smaller, higher-complexity book (RFx and PoCs).'},
   {t:'Completed contracts',kind:'count',higher:true,ctx:true,years:[['2023',9],['2024',8],['2025',9],['2026',4]],
    by:[['Renewal paper',2],['WO / SOW',1],['Amendment',1]],foot:'Volume handled, for context. Fewer but larger competitive awards.'}
  ]}
};
function rcFmt(kind,v){
 if(kind==='money') return fmtK(v);
 if(kind==='pct') return v+'%';
 if(kind==='days') return v.toFixed(1)+'d';
 return v;
}
// short unit suffix for the big "this year" number on a grade card
function rcUnit(kind){ return kind==='pct'?'%':kind==='days'?'d':''; }
// fraction of 2026 elapsed (today is 2026-06-26), the fair-pace yardstick for
// cumulative (count/money) categories where YTD can't be compared to a full year.
function yearElapsed(){
 const start=new Date('2026-01-01T00:00:00');
 return Math.min(1,Math.max(.05,(TODAY.getTime()-start.getTime())/(365*DAY)));
}
function gradeFromScore(score){
 score=Math.max(40,Math.min(99,Math.round(score)));
 if(score>=92) return {letter:'A+',tone:'good',gp:4.3};
 if(score>=84) return {letter:'A', tone:'good',gp:4.0};
 if(score>=76) return {letter:'B+',tone:'good',gp:3.3};
 if(score>=68) return {letter:'B', tone:'fair',gp:3.0};
 if(score>=60) return {letter:'C+',tone:'fair',gp:2.3};
 if(score>=52) return {letter:'C', tone:'weak',gp:2.0};
 return {letter:'D',tone:'weak',gp:1.0};
}
// Grade a category. Volume (ctx) metrics are NOT graded - they return a context row
// with gp:null so they never move the GPA. Graded categories are scored against the
// rep's SLA/savings TARGET (manager-set, system-recommended), on rep-controllable
// time only - so handling fewer items, or a slow external review, never costs a grade.
function gradeMetric(m,name){
 name=name||me;
 const ys=m.years, cur=ys[ys.length-1][1], prev=ys.length>1?ys[ys.length-2][1]:null;
 if(m.ctx){
  const pacePct=prev?Math.round(cur/(prev*yearElapsed())*100):null;
  const line=prev
   ? 'Context only, not graded. <b>'+rcFmt(m.kind,cur)+'</b> YTD vs '+rcFmt(m.kind,prev)+' last full year ('+pacePct+'% of pace). Handling fewer or larger items does not move your grade.'
   : 'Context only, not graded. <b>'+rcFmt(m.kind,cur)+'</b> YTD.';
  return {ctx:true,letter:'·',tone:'ctx',gp:null,line:line};
 }
 const T=targetsFor(name), tg=T[m.t]||{value:cur}, g=gradeValue(m,name,cur,true);
 let line;
 if(m.kind==='money'){ const exp=(tg.value*yearElapsed())||1, pace=cur/exp;
  line='<b class="'+(pace>=1?'up':'dn')+'">'+rcFmt('money',cur)+' YTD</b> against a <b>'+rcFmt('money',tg.value)+'</b> goal ('+Math.round(pace*100)+'% of the pace needed).';
 } else if(m.kind==='days'){
  line='<b class="'+(cur<=tg.value?'up':'dn')+'">'+cur.toFixed(1)+'d</b> against a <b>'+tg.value.toFixed(1)+'d</b> target, controllable time only. External review time is excluded.';
 } else {
  line='<b class="'+(cur>=tg.value?'up':'dn')+'">'+cur+'%</b> against a <b>'+tg.value+'%</b> target. '+(cur>=tg.value?'At or above the bar.':(tg.value-cur)+' points under the bar.');
 }
 g.line=line; return g;
}
// Score one numeric VALUE of a metric against its current target (used for both the
// live grade and the per-year grade history). isYTD => the partial 2026 year (use pace).
function gradeValue(m,name,val,isYTD){
 const T=targetsFor(name), tg=T[m.t]; if(!tg) return gradeFromScore(72);
 let score;
 if(m.kind==='money'){ const denom=(isYTD?tg.value*yearElapsed():tg.value)||1; score=84+((val/denom)-1)*140; }
 else if(m.kind==='days'){ score=84+((tg.value-val)/(tg.value||1))*90; }
 else { score=84+(val-tg.value)*2.2; }
 return gradeFromScore(score);
}
// grade for every year on record (for the year-over-year grade history)
function gradeHistory(m,name){ const ys=m.years, n=ys.length;
 return ys.map(function(r,i){ const g=gradeValue(m,name,r[1],i===n-1); return {year:r[0],val:r[1],letter:g.letter,tone:g.tone,gp:g.gp}; });
}
function gpaLetterFor(pts){ return pts>=4.15?'A+':pts>=3.85?'A':pts>=3.5?'A-':pts>=3.15?'B+':pts>=2.85?'B':pts>=2.5?'B-':pts>=2.15?'C+':pts>=1.85?'C':'D'; }
// overall GPA for each year across the graded categories (only years that have data)
function gpaHistory(name){ const rc=RC_BY_REP[name]; if(!rc) return [];
 const graded=rc.metrics.filter(function(m){return !m.ctx;}), years={};
 graded.forEach(function(m){ gradeHistory(m,name).forEach(function(x){ (years[x.year]=years[x.year]||[]).push(x.gp); }); });
 return Object.keys(years).sort().map(function(y){ const a=years[y], pts=a.reduce(function(s,v){return s+v;},0)/a.length;
  return {year:y, gpa:pts, letter:gpaLetterFor(pts), tone:pts>=3.5?'good':pts>=2.85?'fair':'weak'}; });
}
// per-category grade for a given year (for the overall grade matrix). null if no data that year.
function gradeForYear(m,name,year){ const r=m.years.filter(function(x){return x[0]===year;})[0]; if(!r) return null;
 const last=m.years[m.years.length-1][0]; return gradeValue(m,name,r[1],year===last); }
// BANDWIDTH: a rep who clears work faster sustains more concurrent items. Diagnostic only -
// being over capacity is a staffing signal (feeds rebalancing), never a personal grade.
const BENCH_ITEMS=140, BENCH_CYCLE=9.5;
function repBandwidth(name){
 const gid=REP_GID[name], rs=(window.Theo?Theo.data.repScale(gid):null), sla=SLA_BY_REP[name];
 if(!gid||!rs||Theo.isDNA(rs)||!sla) return null;
 const cyc=sla.avgCycle||BENCH_CYCLE, sustainable=Math.round(BENCH_ITEMS*(BENCH_CYCLE/cyc));
 const util=Math.round(rs.activeContracts/sustainable*100);
 const band=util>=106?'over':util>=90?'healthy':'under';
 return {active:rs.activeContracts, sustainable:sustainable, util:util, band:band, cyc:cyc};
}
// MASTER-DETAIL report card: a stacked grade LIST (left 2/3) + a detail panel
// (right 1/3) that shows the SELECTED row's metric-appropriate chart + insights.
let rcSel=0;
function rcVal(m){ const cur=m.years[m.years.length-1][1]; return (m.kind==='count'||m.kind==='money')?rcFmt(m.kind,cur):(m.kind==='days'?cur.toFixed(1)+'d':cur+'%'); }
// the manager-set target + where it was recommended from, for a graded category
const PRIMARY_TARGETS=['On-time delivery','Project cycle time','Contract cycle time','Savings driven'];
function targetSrcLine(m,name){ name=name||me; const T=targetsFor(name), tg=T[m.t]; if(!tg) return '';
 const v=m.kind==='money'?rcFmt('money',tg.value):(m.kind==='days'?tg.value.toFixed(1)+'d':tg.value+'%');
 const noun=m.kind==='money'?'Goal':'Target';
 const adj=PRIMARY_TARGETS.indexOf(m.t)>=0?'Your manager can adjust it in the Leadership view.':'Calibrates to the team average.';
 return noun+' <b>'+v+'</b> - recommended from '+tg.src+'. '+adj;
}
function renderReportCard(){
 const rc=RC_BY_REP[me], list=$('#rclist'), det=$('#rcdetail');
 if(!list||!det) return;
 if(!rc){ list.innerHTML=''; det.innerHTML=''; return; }
 const cats=rc.metrics.map(function(m){return {m:m,g:gradeMetric(m,me)};});
 // inject BANDWIDTH diagnostic right after the graded categories (before volume context)
 const bw=repBandwidth(me);
 if(bw){ const at=cats.filter(function(x){return !x.m.ctx;}).length;
  cats.splice(at,0,{m:{t:'Bandwidth / capacity',diag:true,bw:bw}, g:{diag:true,gp:null,tone:bw.band==='over'?'fair':'good'}}); }
 const graded=cats.filter(function(x){return x.g.gp!=null;});
 const gpaPts=graded.length?graded.reduce(function(s,x){return s+x.g.gp;},0)/graded.length:0;
 const gpaLetter=gpaLetterFor(gpaPts), gpaTone=gpaPts>=3.5?'good':gpaPts>=2.85?'fair':'weak';
 window._rcCats=cats; window._rcGraded=graded; window._rcGpa={pts:gpaPts,letter:gpaLetter,tone:gpaTone};
 if(rcSel>cats.length||rcSel<0) rcSel=0;
 const rows=cats.map(function(o,i){
  const m=o.m,g=o.g,p=rcPaceShort(m),sel=(i===rcSel);
  let gcell,cls,val;
  if(m.diag){ const w=m.bw, word=w.band==='over'?'over':w.band==='under'?'headroom':'healthy';
   gcell='<div class="rcg '+(w.band==='over'?'fair':'good')+'" title="Diagnostic - not graded">'+word+'</div>'; cls=' isdiag'; val=w.util+'%';
  } else if(g.ctx){ gcell='<div class="rcg ctx" title="Context only - not graded">context</div>'; cls=' isctx'; val=rcVal(m);
  } else { gcell='<div class="rcg '+g.tone+'">'+g.letter+'</div>'; cls=''; val=rcVal(m); }
  return '<div class="rcrow'+cls+(sel?' sel':'')+'" tabindex="0" role="button" onclick="rcSelect('+i+')" onkeydown="if(event.key===\'Enter\')rcSelect('+i+')">'+
   '<div class="rcc"><div class="rcname">'+m.t+'</div><div class="rcpace '+p.cls+'">'+p.txt+'</div></div>'+
   '<div class="rcv">'+val+'</div>'+gcell+'</div>';
 }).join('');
 const dist=graded.reduce(function(a,x){var k=x.g.letter[0];a[k]=(a[k]||0)+1;return a;},{});
 const distTxt=['A','B','C','D'].filter(function(k){return dist[k];}).map(function(k){return dist[k]+'× '+k;}).join(' · ');
 const gi=cats.length;
 const gpaRow='<div class="rcrow gparow'+(rcSel===gi?' sel':'')+'" tabindex="0" role="button" onclick="rcSelect('+gi+')" onkeydown="if(event.key===\'Enter\')rcSelect('+gi+')">'+
  '<div class="rcc"><div class="rcname">Overall</div><div class="rcpace">'+distTxt+'</div></div>'+
  '<div class="rcv">'+gpaPts.toFixed(2)+' GPA</div><div class="rcg '+gpaTone+' big">'+gpaLetter+'</div></div>';
 list.innerHTML=rows+gpaRow;
 rcRenderDetail();
}
function rcSelect(i){ rcSel=i; var rows=document.querySelectorAll('#rclist .rcrow'); for(var j=0;j<rows.length;j++) rows[j].classList.toggle('sel',j===i); rcRenderDetail(); }
function rcRenderDetail(){
 const det=$('#rcdetail'), cats=window._rcCats||[]; if(!det) return;
 if(rcSel>=cats.length){ det.innerHTML=rcGpaDetail(); return; }
 const o=cats[rcSel];
 det.innerHTML = o.m.diag ? rcBandwidthDetail(o.m) : rcMetricDetail(o.m,o.g);
}
function rcPaceShort(m){
 if(m.diag){ const w=m.bw; return {txt:'workload vs sustainable load',cls:w.band==='over'?'dn':'up'}; }
 if(m.ctx) return {txt:'context · not graded',cls:'flat'};
 const T=targetsFor(me), tg=T[m.t]; if(!tg) return {txt:'',cls:'flat'};
 const cur=m.years[m.years.length-1][1];
 if(m.kind==='money'){ const exp=tg.value*yearElapsed(), pace=exp?Math.round(cur/exp*100):100; return {txt:pace+'% of goal pace',cls:pace>=100?'up':pace>=90?'flat':'dn'}; }
 if(m.kind==='days'){ return {txt:'vs '+tg.value.toFixed(1)+'d target',cls:cur<=tg.value?'up':'dn'}; }
 return {txt:'vs '+tg.value+'% target',cls:cur>=tg.value?'up':'dn'};
}
// per-year letter grades for a category (the year-over-year grade history)
function rcGradeHistory(m){ const h=gradeHistory(m,me); if(h.length<2) return '';
 return '<div class="rchist"><span class="rchl">Grade by year</span>'+h.map(function(x){return '<span class="rchy"><b>’'+x.year.slice(2)+'</b><i class="rcgt '+x.tone+'">'+x.letter+'</i></span>';}).join('')+'</div>';
}
function rcMetricDetail(m,g){
 const ys=m.years,cur=ys[ys.length-1],cumulative=(m.kind==='count'||m.kind==='money');
 const val=cumulative?rcFmt(m.kind,cur[1]):(m.kind==='days'?cur[1].toFixed(1)+'d':cur[1]+'%');
 const chart = m.kind==='pct'?rcRing(m):m.kind==='days'?rcLine(m):m.kind==='money'?rcArea(m):rcBars(m);
 const bd=(m.by&&m.by.length)?('<div class="rcbd">'+m.by.map(function(b){return '<span class="bk"><b>'+rcFmt(m.kind,b[1])+'</b> '+b[0]+'</span>';}).join('')+'</div>'):'';
 const badge=g.ctx?'<div class="rcgbig ctx" title="Context only - not graded">·</div>':'<div class="rcgbig '+g.tone+'">'+g.letter+'</div>';
 const tgt=(!g.ctx)?('<div class="rcil sub">'+targetSrcLine(m)+'</div>'):'';
 const hist=(!g.ctx)?rcGradeHistory(m):'';
 const strip=(m.t==='Project cycle time')?('<div class="rcil sub" style="margin-top:9px;font-weight:600;color:var(--ink)">Per-gate detail (your clock vs other teams)</div>'+slaStripHTML(me)):'';
 return '<div class="rcdh"><div><div class="rcdt">'+m.t+'</div><div class="rcdv">'+val+' <span class="rcdy">'+cur[0]+' '+(cumulative?'YTD':'')+'</span></div></div>'+badge+'</div>'+
  '<div class="rcchart">'+chart+'</div>'+bd+hist+
  '<div class="rcins"><div class="rcil">'+g.line+'</div>'+tgt+(m.foot?'<div class="rcil sub">'+m.foot+'</div>':'')+strip+'</div>';
}
function rcBandwidthDetail(m){ const w=m.bw;
 const word=w.band==='over'?'Over capacity':w.band==='under'?'Headroom':'Healthy load', tone=w.band==='over'?'fair':'good';
 const cap=Math.min(140,w.util), markPct=Math.round(100/140*100);
 return '<div class="rcdh"><div><div class="rcdt">Bandwidth / capacity</div><div class="rcdv">'+w.util+'% <span class="rcdy">utilized</span></div></div><div class="rcgbig '+tone+'" style="font-size:15px;padding:5px 11px">'+word+'</div></div>'+
  '<div class="bwgauge"><div class="bwfill '+w.band+'" style="width:'+Math.round(cap/140*100)+'%"></div><span class="bwmark" style="left:'+markPct+'%"></span></div>'+
  '<div class="bwgkey"><span>0%</span><span>100% sustainable</span><span>140%</span></div>'+
  '<div class="rcbd"><span class="bk"><b>'+w.active+'</b> active contracts</span><span class="bk"><b>'+w.sustainable+'</b> sustainable</span><span class="bk"><b>'+w.cyc.toFixed(1)+'d</b> your cycle</span></div>'+
  '<div class="rcins"><div class="rcil">Sustainable load scales with cycle speed: <b>'+BENCH_ITEMS+'</b> items at the '+BENCH_CYCLE+'d benchmark, adjusted for your <b>'+w.cyc.toFixed(1)+'d</b> controllable cycle gives <b>'+w.sustainable+'</b>. You are carrying <b>'+w.active+'</b> (<b class="'+(w.band==='over'?'dn':'up')+'">'+w.util+'%</b>).</div>'+
  '<div class="rcil sub">'+(w.band==='over'?'Over sustainable load - a rebalancing or delegation signal for your manager, not a mark against you.':w.band==='under'?'Headroom to take on more, or absorb a teammate’s overflow.':'A healthy, sustainable workload.')+' Diagnostic only, never graded.</div></div>';
}
function rcGpaDetail(){
 const graded=window._rcGraded||[], gpa=window._rcGpa||{pts:0,letter:'',tone:'fair'};
 const dist=graded.reduce(function(a,x){var k=x.g.letter[0];a[k]=(a[k]||0)+1;return a;},{});
 const chips=['A','B','C','D'].filter(function(k){return dist[k];}).map(function(k){return '<span class="bk"><b>'+dist[k]+'×</b> '+k+'</span>';}).join('');
 const sorted=graded.slice().sort(function(a,b){return b.g.gp-a.g.gp;}), best=sorted[0]||{m:{t:''},g:{letter:''}}, weak=sorted[sorted.length-1]||best;
 const bars=graded.map(function(x){return '<div class="rcgb"><span class="n">'+x.m.t+'</span><div class="bk"><i class="'+x.g.tone+'" style="width:'+Math.round(x.g.gp/4.3*100)+'%"></i></div><span class="g '+x.g.tone+'">'+x.g.letter+'</span></div>';}).join('');
 const gh=gpaHistory(me);
 const gpaHist=gh.length>1?('<div class="rchist"><span class="rchl">GPA by year</span>'+gh.map(function(h){return '<span class="rchy"><b>’'+h.year.slice(2)+'</b><i class="rcgt '+h.tone+'">'+h.letter+'</i><small>'+h.gpa.toFixed(1)+'</small></span>';}).join('')+'</div>'):'';
 const years=gh.map(function(h){return h.year;});
 const gradedMetrics=(RC_BY_REP[me]||{metrics:[]}).metrics.filter(function(m){return !m.ctx;});
 const head='<tr><th></th>'+years.map(function(y){return '<th>’'+y.slice(2)+'</th>';}).join('')+'</tr>';
 const mrows=gradedMetrics.map(function(m){ return '<tr><td title="'+m.t+'">'+m.t+'</td>'+years.map(function(y){ const g=gradeForYear(m,me,y); return '<td>'+(g?'<i class="rcgt '+g.tone+'">'+g.letter+'</i>':'<span class="rcmxno">·</span>')+'</td>'; }).join('')+'</tr>'; }).join('');
 const matrix=years.length?('<div class="rcmxwrap"><div class="rchl" style="margin:8px 0 5px">Grade history by category</div><table class="rcmx">'+head+mrows+'</table></div>'):'';
 return '<div class="rcdh"><div><div class="rcdt">Overall this year</div><div class="rcdv">'+gpa.pts.toFixed(2)+' <span class="rcdy">GPA</span></div></div><div class="rcgbig '+gpa.tone+'">'+gpa.letter+'</div></div>'+
  '<div class="rcgbars">'+bars+'</div>'+gpaHist+matrix+
  '<div class="rcbd">'+chips+'</div>'+
  '<div class="rcins"><div class="rcil">Strongest: <b>'+best.m.t+'</b> ('+best.g.letter+'). Worth a look: <b>'+weak.m.t+'</b> ('+weak.g.letter+').</div><div class="rcil sub">A blend of your '+graded.length+' graded categories - SLA adherence + savings/value, controllable time only. Volume and bandwidth are context, not graded. Reflect-only, not a peer ranking.</div></div>';
}
// ── portfolio scale band: the rep's managed book + the org context ──────────
function fmtBig(vK){ return vK>=1000000?'$'+(vK/1000000).toFixed(2)+'B':(vK>=1000?'$'+(vK/1000).toFixed(0)+'M':'$'+vK+'K'); }
const REP_GID={'Marc Lane':'WD-100237','Aisha Khan':'WD-100241','Dan Reed':'WD-100245','Sam Okafor':'WD-100061'};
function renderScaleBand(){
 const el=$('#scaleband'); if(!el) return;
 const scaleV=(window.Theo?Theo.data.scaleSeed():null); if(!scaleV||Theo.isDNA(scaleV)||!scaleV.org){ el.style.display='none'; return; }
 const gid=REP_GID[me]; if(!gid){ el.style.display='none'; el.innerHTML=''; return; }
 const rs=Theo.data.repScale(gid), org=scaleV.org, orgSpend=Theo.data.orgSpendK();
 el.style.display='block';
 const tiles=[['Managed book',fmtBig(rs.managedSpendK),'your annual IT spend'],
              ['Suppliers',String(rs.suppliers),'in your book'],
              ['Active contracts',String(rs.activeContracts),'live agreements']];
 el.innerHTML='<div class="sbrow">'+tiles.map(t=>'<div class="sbtile"><div class="sbv">'+t[1]+'</div><div class="sbk">'+t[0]+'</div><div class="sbs">'+t[2]+'</div></div>').join('')+'</div>'+
  '<div class="sbctx">Part of Lilly IT’s <b>'+fmtBig(orgSpend)+'</b> portfolio - <b>'+org.suppliers+'</b> suppliers and <b>~'+org.activeContracts.toLocaleString()+'</b> active contracts across <b>'+org.reps+'</b> sourcing reps. The cards below are the slice that needs you now.</div>';
}

// ── Leadership: set each rep's SLA + savings targets (recommended, adjustable) ─
// The 4 PRIMARY targets are manager-settable here; the other graded KPIs calibrate to
// the team average automatically. Keyed by metric title to match the generic engine.
function tgFmt(title,v){ const m=metricByTitle(ORDER[0],title)||{kind:'pct'};
 return m.kind==='money'?fmtK(v):(m.kind==='days'?v.toFixed(1)+'d':v+'%'); }
function setTargetVal(nm,title,v){ const T=targetsFor(nm), o=T[title]; if(!o) return; const m=metricByTitle(nm,title)||{kind:'pct'};
 if(m.kind==='pct') v=Math.max(40,Math.min(100,Math.round(v)));
 else if(m.kind==='days') v=Math.max(1,Math.round(v*10)/10);
 else v=Math.max(0,Math.round(v));
 o.value=v; }
function tgBump(nm,title,d){ const T=targetsFor(nm), o=T[title]; if(!o) return; const m=metricByTitle(nm,title)||{kind:'pct'}, step=m.kind==='pct'?1:m.kind==='days'?0.5:25;
 setTargetVal(nm,title,o.value+d*step); renderTargetsPanel(); if(nm===me) renderReportCard();
 toast('Target updated for '+nm.split(' ')[0]+' - reflect-only. Recommended from team average.'); }
function tgReset(nm,title){ const T=targetsFor(nm), o=T[title]; if(!o) return; o.value=o.rec; renderTargetsPanel(); if(nm===me) renderReportCard(); }
function renderTargetsPanel(){
 const el=$('#targetspanel'); if(!el) return;
 const lead=(typeof curRole!=='undefined'&&curRole==='lead');
 if(!lead){ el.style.display='none'; el.innerHTML=''; return; }
 el.style.display='block';
 const keys=[['On-time delivery','On-time'],['Project cycle time','Project cycle'],['Contract cycle time','Contract cycle'],['Savings driven','Savings goal']];
 const rows=ORDER.map(function(nm){ const T=targetsFor(nm);
  const cells=keys.map(function(k){ const o=T[k[0]]; if(!o) return ''; const custom=o.value!==o.rec;
   return '<div class="tgcell"><div class="tgk">'+k[1]+'</div>'+
    '<div class="tgin"><button type="button" onclick="tgBump(\''+nm+'\',\''+k[0]+'\',-1)" aria-label="lower">−</button>'+
    '<span class="tgv">'+tgFmt(k[0],o.value)+'</span>'+
    '<button type="button" onclick="tgBump(\''+nm+'\',\''+k[0]+'\',1)" aria-label="raise">+</button></div>'+
    '<div class="tgrec">'+(custom?'<a onclick="tgReset(\''+nm+'\',\''+k[0]+'\')">reset to rec '+tgFmt(k[0],o.rec)+'</a>':'recommended')+'</div></div>';
  }).join('');
  return '<div class="tgrow"><div class="tgnm">'+nm+(nm===me?' <span class="tgyou">viewing</span>':'')+'</div>'+cells+'</div>';
 }).join('');
 el.innerHTML='<div class="tghd"><div><b>Team targets &amp; SLAs</b><span> recommended from the team average per KPI · adjust per rep</span></div><span class="tgrole">Procurement Leadership</span></div>'+rows+
  '<div class="tgfoot">✦ These four are the manager-set SLAs and savings goals; the other graded KPIs calibrate to the team average. Setting a target reflects on that rep’s grade only - nothing is sent.</div>';
}

// mixed SVG charts, one shape per metric type
function rcBars(m){
 var ys=m.years,max=Math.max.apply(null,ys.map(function(r){return r[1];}).concat([1])),W=300,H=128,pB=22,pT=14,n=ys.length,slot=W/n,bw=Math.min(slot*0.5,32),out='';
 ys.forEach(function(r,i){var cx=slot*i+slot/2,h=(r[1]/max)*(H-pB-pT),y=H-pB-h,cur=i===n-1;
  out+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+(cur?'var(--bblue)':'var(--blue-mut)')+'"/>'+
   '<text x="'+cx.toFixed(1)+'" y="'+(H-pB+13)+'" text-anchor="middle" class="rcx">’'+r[0].slice(2)+(cur?' YTD':'')+'</text>'+
   '<text x="'+cx.toFixed(1)+'" y="'+(y-4).toFixed(1)+'" text-anchor="middle" class="rcvl">'+rcFmt(m.kind,r[1])+'</text>';});
 return '<svg viewBox="0 0 '+W+' '+H+'" class="rcsvg">'+out+'</svg>';
}
function rcRing(m){
 var ys=m.years,cur=ys[ys.length-1][1],prev=ys.length>1?ys[ys.length-2][1]:null,R=44,C=2*Math.PI*R,cl=C*cur/100,pl=prev?C*prev/100:0;
 var ghost=prev?'<circle r="'+R+'" fill="none" stroke="var(--blue-mut)" stroke-width="11" stroke-dasharray="'+pl.toFixed(1)+' '+(C-pl).toFixed(1)+'" transform="rotate(-90)" opacity=".45"/>':'';
 return '<svg viewBox="0 0 150 128" class="rcsvg"><g transform="translate(75,60)">'+
  '<circle r="'+R+'" fill="none" stroke="var(--line)" stroke-width="11"/>'+ghost+
  '<circle r="'+R+'" fill="none" stroke="var(--bblue)" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+cl.toFixed(1)+' '+(C-cl).toFixed(1)+'" transform="rotate(-90)"/>'+
  '<text y="-1" text-anchor="middle" class="rcrt">'+cur+'%</text><text y="15" text-anchor="middle" class="rcrs">ON TIME</text></g></svg>'+
  (prev?'<div class="rcringnote">Last year '+prev+'% (ghost ring)</div>':'');
}
function rcLine(m){
 var ys=m.years,vals=ys.map(function(r){return r[1];}),max=Math.max.apply(null,vals),min=Math.min.apply(null,vals),W=300,H=128,pB=22,pT=16,pX=16,n=ys.length;
 var X=function(i){return pX+(W-2*pX)*(n>1?i/(n-1):0);}, Y=function(v){var rng=(max-min)||1; return pT+(H-pB-pT)*((v-min)/rng);};
 var pts=ys.map(function(r,i){return X(i).toFixed(1)+','+Y(r[1]).toFixed(1);}).join(' '),dots='';
 ys.forEach(function(r,i){var cur=i===n-1;dots+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(r[1]).toFixed(1)+'" r="'+(cur?4:3)+'" fill="'+(cur?'var(--bblue)':'var(--blue-mut)')+'"/>'+
  '<text x="'+X(i).toFixed(1)+'" y="'+(H-pB+13)+'" text-anchor="middle" class="rcx">’'+r[0].slice(2)+'</text>'+
  '<text x="'+X(i).toFixed(1)+'" y="'+(Y(r[1])-8).toFixed(1)+'" text-anchor="middle" class="rcvl">'+rcFmt(m.kind,r[1])+'</text>';});
 return '<svg viewBox="0 0 '+W+' '+H+'" class="rcsvg"><polyline points="'+pts+'" fill="none" stroke="var(--bblue)" stroke-width="2.5"/>'+dots+'</svg><div class="rcringnote">Lower is better, shorter cycle time plots higher.</div>';
}
function rcArea(m){
 var ys=m.years,max=Math.max.apply(null,ys.map(function(r){return r[1];}).concat([1])),W=300,H=128,pB=22,pT=16,pX=16,n=ys.length;
 var X=function(i){return pX+(W-2*pX)*(n>1?i/(n-1):0);}, Y=function(v){return pT+(H-pB-pT)*(1-v/max);};
 var line=ys.map(function(r,i){return X(i).toFixed(1)+','+Y(r[1]).toFixed(1);}).join(' ');
 var area=pX+','+(H-pB)+' '+line+' '+X(n-1).toFixed(1)+','+(H-pB),dots='';
 ys.forEach(function(r,i){var cur=i===n-1;dots+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(r[1]).toFixed(1)+'" r="'+(cur?4:3)+'" fill="'+(cur?'var(--bblue)':'var(--blue-mut)')+'"/>'+
  '<text x="'+X(i).toFixed(1)+'" y="'+(H-pB+13)+'" text-anchor="middle" class="rcx">’'+r[0].slice(2)+(cur?' YTD':'')+'</text>'+
  '<text x="'+X(i).toFixed(1)+'" y="'+(Y(r[1])-8).toFixed(1)+'" text-anchor="middle" class="rcvl">'+rcFmt(m.kind,r[1])+'</text>';});
 return '<svg viewBox="0 0 '+W+' '+H+'" class="rcsvg"><polygon points="'+area+'" fill="var(--blue-t)" opacity=".65"/><polyline points="'+line+'" fill="none" stroke="var(--bblue)" stroke-width="2.5"/>'+dots+'</svg>';
}
// ════════════════════════════════════════════════════════════════
//  render orchestration + view switching
// ════════════════════════════════════════════════════════════════
function renderAll(){
 const v=VIEWS[me], lead=curRole==='lead';
 // topbar identity is owned by theo-brand (the global persona), never overwrite it here
 $('#hello').textContent = lead ? v.nm.split(' ')[0]+'’s Work' : 'My Work';
 const sub=$('#sub'); if(sub) sub.textContent = lead
  ? 'Viewing '+v.nm+'’s work as Procurement Leadership, switch team member with the picker. Reflect-only.'
  : 'Your live workload, the suppliers you manage, your performance, the savings you’ve driven, and how this year compares, all for you alone.';
 const sel=$('#teamsel'); if(sel) sel.value=me;
 const tip=document.getElementById('tltip'); if(tip) tip.classList.remove('on');
 renderPinned();renderScaleBand();renderTimeline();renderSuppliers();renderSavings();renderReportCard();renderTargetsPanel();
 renderContractKpi();renderOrgRollup();
 renderDelegation();
}
// "View as" cycles the GLOBAL role (rep -> owner -> lead); theo-brand then calls theoSetRole to re-render this page.
function cycleView(){ if(window.theoCycleRole) window.theoCycleRole(); }
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2200);}

// ════════════════════════════════════════════════════════════════
//  DELEGATE MY WORK, self-service delegation (reflect-don't-enforce)
//  The work belongs to the VIEWED person (`me`); the actor is the
//  current topbar persona. Every action is gated by THEO.canDelegate.
// ════════════════════════════════════════════════════════════════