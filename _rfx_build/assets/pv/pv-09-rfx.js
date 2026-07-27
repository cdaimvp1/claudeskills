var _PV09=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVRN=(_PV09&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV09)&&_PV09.rfxNorm)?_PV09.rfxNorm:{};
// Round-2 rework (2026-07-26): robust titleCase() helper applied to visible header / label /
// category / panel-title text across the tab. Entity-safe (an HTML entity like &amp; or &rsquo;
// is matched whole and left untouched, never split into letter-runs and corrupted) and
// acronym-preserving (the fixed list below + any token that already arrives all-caps, e.g. a
// stray "ID"). Deliberately NOT applied to supplier/person names or body prose (requirement
// text, red-flag/clarification sentences, narrative paragraphs); call sites choose what to wrap.
var RFX_TC_ACR={soc:'SOC',msa:'MSA',cda:'CDA',nda:'NDA',rfx:'RFx',rfp:'RFP',rfi:'RFI',rfq:'RFQ',tco:'TCO',cci:'CCI',sla:'SLA',erp:'ERP',qms:'QMS',api:'API',sso:'SSO',rbac:'RBAC',etl:'ETL',ai:'AI',ml:'ML',zopa:'ZOPA',bafo:'BAFO',wwtp:'WwTP',it:'IT',kpi:'KPI',us:'US',eu:'EU',dr:'DR',sme:'SME',po:'PO',frap:'FRAP',moscow:'MoSCoW'};
function titleCase(str){
 if(str==null)return str;
 return String(str).replace(/&#?[a-zA-Z0-9]+;|[A-Za-z][A-Za-z'’]*/g,function(tok){
  if(tok.charAt(0)==='&')return tok;   // HTML entity (e.g. &amp; &rsquo;), leave byte-for-byte
  var lower=tok.toLowerCase();
  if(RFX_TC_ACR.hasOwnProperty(lower))return RFX_TC_ACR[lower];
  if(tok.length>1&&tok===tok.toUpperCase())return tok;   // already all-caps (e.g. an unlisted acronym), preserve
  return tok.charAt(0).toUpperCase()+tok.slice(1).toLowerCase();
 });
}
function rfxComplete(e){return !!(e.scores&&e.scores.every(function(row){return row.every(function(v){return v!=null;});}));}
function rfxScored(){return RFX.panel.filter(function(e){return e.submitted;}).length;}   // submitted, not just filled-in
function rfxAgg(si,ci){var vals=RFX.panel.filter(function(e){return e.submitted&&e.scores&&e.scores[si]&&e.scores[si][ci]!=null;}).map(function(e){return e.scores[si][ci];});if(!vals.length)return null;return vals.reduce(function(a,b){return a+b;},0)/vals.length;}   // ONLY submitted evaluators feed the aggregate
function rfxWeighted(si){var t=0,wsum=0;RFX.criteria.forEach(function(c,ci){var a=rfxAgg(si,ci);if(a!=null){t+=c.w*a;wsum+=c.w;}});return wsum?(t/wsum):0;}   // 0-5 weighted grand total (compensatory)
function rfxLeader(){var best=-1,idx=0;RFX.suppliers.forEach(function(s,si){var w=rfxWeighted(si);if(w>best){best=w;idx=si;}});return idx;}
// Must-Have gate: subs flagged must:true; a supplier that fails any is gated out regardless of the total.
function rfxMustHaves(){var out=[];RFX.criteria.forEach(function(c){(c.subs||[]).forEach(function(s){if(s.must)out.push(s.k);});});return out;}
function rfxGatePass(si){var s=RFX.suppliers[si];return !(s&&s.mustFail&&s.mustFail.length);}
function rfxGatePassLeader(){var best=-1,idx=-1;RFX.suppliers.forEach(function(s,si){if(!rfxGatePass(si))return;var w=rfxWeighted(si);if(w>best){best=w;idx=si;}});return idx;}
// ===== WAVE-2 per-REQUIREMENT analysis engine (native port of dashboard-rfx analyzeResponses/analyze) =====
// Pure + deterministic; derives coverage LEVELS, coverage %, weighted fit, completeness, red flags,
// clarifications, strengths/gaps, category rollups + leaders, and the advisory ranking from RFX.requirements
// + per-supplier RFX.suppliers[si].rq. Reflect-only, first-pass; never acts.
function rfxRqScore(si,rid){var s=RFX.suppliers[si];return (s&&s.rq&&s.rq[rid]!=null)?s.rq[rid]:null;}
function rfxLevel(si,rid){var v=rfxRqScore(si,rid);if(v==null)return 'na';if(v>=4)return 'fully';if(v>=2)return 'partial';return 'does-not';}
function rfxLevelLabel(l){return l==='fully'?'Fully meets':l==='partial'?'Partially meets':l==='does-not'?'Does not meet':'Not answered';}
function rfxCats(){var seen={},out=[];RFX.requirements.forEach(function(r){if(!seen[r.category]){seen[r.category]=true;out.push(r.category);}});return out;}
function rfxCoverage(si){var reqs=RFX.requirements,total=reqs.length,fully=0,partial=0,doesNot=0,na=0,answered=0,mandTotal=0,mandAns=0,conforming=true,weighted=0,wsum=0;
 reqs.forEach(function(r){var v=rfxRqScore(si,r.id),lvl=rfxLevel(si,r.id);wsum+=r.weight;weighted+=r.weight*(v==null?0:v);
  if(lvl==='fully')fully++;else if(lvl==='partial')partial++;else if(lvl==='does-not')doesNot++;else na++;
  if(v!=null)answered++;
  if(r.mandatory){mandTotal++;if(v!=null)mandAns++;if(lvl==='does-not'||lvl==='na')conforming=false;}});
 var maxW=wsum*5;
 return {total:total,fully:fully,partial:partial,doesNot:doesNot,na:na,answered:answered,
  coveragePct:total?Math.round(fully/total*100):0,completenessPct:total?Math.round(answered/total*100):0,
  weightedFit:maxW?Math.round(weighted/maxW*100):0,mandTotal:mandTotal,mandAns:mandAns,
  conforming:conforming,disqualified:answered>0&&!conforming};}
function rfxCatRollup(si){return rfxCats().map(function(cat){var rs=RFX.requirements.filter(function(r){return r.category===cat;});
  var fully=0,partial=0,doesNot=0,na=0,w=0;rs.forEach(function(r){var lvl=rfxLevel(si,r.id);w+=r.weight;
   if(lvl==='fully')fully++;else if(lvl==='partial')partial++;else if(lvl==='does-not')doesNot++;else na++;});
  return {cat:cat,total:rs.length,fully:fully,partial:partial,doesNot:doesNot,na:na,weight:w,coveragePct:rs.length?Math.round(fully/rs.length*100):0};});}
function rfxCatLeaders(){var totalW=RFX.requirements.reduce(function(a,r){return a+r.weight;},0);
 return rfxCats().map(function(cat){var best=-1,leader=-1,w=0;
  RFX.suppliers.forEach(function(s,si){var roll=rfxCatRollup(si).filter(function(x){return x.cat===cat;})[0];if(roll){w=roll.weight;if(rfxCoverage(si).answered>0&&roll.coveragePct>best){best=roll.coveragePct;leader=si;}}});
  return {cat:cat,leaderIdx:leader,coveragePct:best<0?0:best,weightShare:totalW?Math.round(w/totalW*100):0};});}
// advisory ranking: by panel weighted SCORE, gate-blind; returns supplier indices
// RANKING POLICY (OWNER DECISION, revised 2026-07-26, supersedes the 2026-07-14 gate-pass-first
// decision below): the #1 scorer is #1 EVEN IF it fails a Must-Have gate. A gate failure is never a
// demotion, it is a prominent FLAG on the leader (a gate-fail badge + a "business call: proceed with
// the risk or secure remediation" note) everywhere the leader appears, so merit is always visible and
// the gate risk is always visible too, side by side. rfxReqRanking() is the single ranking every
// consumer already reads (Overview, the merged ranking, Recommendation, Analysis, the heatmap /
// requirement matrix / pricing column order), so redefining it here (rather than patching each call
// site) applies the policy everywhere at once. rfxGatePassLeader() is kept separately for the
// Dual-Ranking Surface (Scoring) and gate-conflict readiness checks, it is no longer the primary order.
function rfxReqRanking(){return rfxMeritRanking();}
// Merit order (highest panel score first, gate ignored). This IS the advisory order (see policy above).
function rfxMeritRanking(){return RFX.suppliers.map(function(s,si){return si;}).sort(function(a,b){return rfxWeighted(b)-rfxWeighted(a)||rfxCoverage(b).weightedFit-rfxCoverage(a).weightedFit;});}
// red flags + clarification candidates (severity + type + priority) across all requirements not fully-met
function rfxFlags(si){var flags=[];RFX.requirements.forEach(function(r){var v=rfxRqScore(si,r.id),lvl=rfxLevel(si,r.id);if(lvl==='fully')return;
  var material=r.weight>=4,type,severity,priority,q;
  if(lvl==='na'){type='Missing';severity=r.mandatory?'critical':material?'high':'medium';priority=r.mandatory?'GATING':material?'HIGH':'MEDIUM';
   q='No response was recorded for "'+r.text+'" ('+r.category+'). Confirm whether this requirement is met and provide supporting detail.';}
  else if(lvl==='does-not'){type='Non-compliant';severity=r.mandatory?'critical':'high';priority=r.mandatory?'GATING':material?'HIGH':'MEDIUM';
   q='The response to "'+r.text+'" ('+r.category+') indicates the requirement is not met (score '+v+'/5). Clarify any path to meeting it, or confirm the gap.';}
  else{if(r.mandatory){type='Conditional';severity='high';priority='HIGH';}else if(material){type='Vague';severity='medium';priority='MEDIUM';}else return;
   q='The response to "'+r.text+'" ('+r.category+') partially addresses the requirement (score '+v+'/5). Clarify the conditions, customization, or roadmap required to fully meet it.';}
  flags.push({reqId:r.id,category:r.category,text:r.text,type:type,severity:severity,priority:priority,detail:q,mandatory:r.mandatory});});
 return flags;}
function rfxRiskLevel(si){var f=rfxFlags(si);if(f.some(function(x){return x.severity==='critical';}))return 'critical';if(f.some(function(x){return x.severity==='high';}))return 'high';if(f.some(function(x){return x.severity==='medium';}))return 'medium';return f.length?'low':'none';}
function rfxStrengths(si){return RFX.requirements.filter(function(r){return rfxLevel(si,r.id)==='fully';})
  .sort(function(a,b){if(a.mandatory!==b.mandatory)return a.mandatory?-1:1;return b.weight-a.weight;}).slice(0,5);}
function rfxGaps(si){return RFX.requirements.filter(function(r){var l=rfxLevel(si,r.id);return l==='does-not'||l==='na';})
  .sort(function(a,b){if(a.mandatory!==b.mandatory)return a.mandatory?-1:1;return b.weight-a.weight;}).slice(0,5);}
function rfxAwardTier(si,rankIdx){var c=rfxCoverage(si);
 if(c.answered===0)return {label:'Not Recommended',col:'#C8202E',bg:'var(--pink-t,#FBE7E3)',key:'not'};
 // Ranking policy: the #1 scorer keeps the #1 slot even with an open Must-Have gap, flagged (not demoted).
 if(c.disqualified)return rankIdx===0
  ?{label:'Leader · Gate Risk',col:'var(--amber-d)',bg:'var(--amber-t,#FBF1DA)',key:'leadergate'}
  :{label:'Conditional',col:'var(--amber-d)',bg:'var(--amber-t,#FBF1DA)',key:'cond'};
 return rankIdx===0?{label:'Primary',col:'var(--plum)',bg:'rgba(92,43,80,.12)',key:'primary'}:{label:'Secondary',col:'var(--plum)',bg:'var(--blue-t,#E4EBF1)',key:'sec'};}
// grounded per-supplier award rationale (fixed copy carries intentional <b>; dynamic values escaped)
function rfxRecoText(si,rankIdx){var c=rfxCoverage(si),tier=rfxAwardTier(si,rankIdx),s=RFX.suppliers[si],st=rfxStrengths(si),f=rfxFlags(si);
 if(c.answered===0)return escapeHtmlPV(s.n)+' did not complete the requirements matrix in this run; coverage shows as Not Scored across all categories. It cannot advance on the advisory ranking until a completed, scored response is submitted.';
 var parts=[];
 parts.push('Advisory tier: <b>'+escapeHtmlPV(tier.label)+'</b>. Weighted fit '+c.weightedFit+' / 100 with '+c.coveragePct+'% of requirements fully met'+(c.disqualified?', but a Must-Have requirement is unmet (non-conforming).':'.'));
 if(st.length)parts.push('Strongest where it counts: '+st.slice(0,2).map(function(r){return escapeHtmlPV(r.category);}).join(', ')+'.');
 var gating=f.filter(function(x){return x.priority==='GATING';}).length;
 if(gating)parts.push(gating+' gating item(s) must be resolved before this supplier can advance.');
 if(c.disqualified&&rankIdx===0)parts.push('<b>Business call:</b> this is the top-scoring bidder in the field; the panel can proceed with the gate risk or secure a dated remediation before award.');
 return parts.join(' ');}
// ---- WAVE-2 shared render helpers (bold-blue var(--plum) accent; amber/red for weak; never green) ----
function rfxCap(t){return '<span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">'+escapeHtmlPV(t)+'</span>';}
function rfxPcCol(p){return p>=90?'var(--plum)':p>=70?'#8A5A00':'#C8202E';}
function rfxCovCol(p){return p>=90?'rgba(92,43,80,.85)':p>=70?'rgba(92,43,80,.42)':p>=40?'rgba(138,90,0,.32)':'rgba(200,32,46,.28)';}
function rfxCovFg(p){return p>=70?'#fff':'var(--ink,#1A1A1A)';}
function rfxLevelCol(l){return l==='fully'?'rgba(92,43,80,.85)':l==='partial'?'rgba(138,90,0,.30)':l==='does-not'?'rgba(200,32,46,.26)':'#F1F4F9';}
function rfxLevelFg(l){return l==='fully'?'#fff':'var(--ink,#1A1A1A)';}
function rfxKpi(label,value,sub,tone){var col=tone==='good'?'var(--plum)':tone==='warn'?'#C8202E':tone==='amber'?'#8A5A00':'var(--ink,#1A1A1A)';
 return '<div class="card" style="margin:0;padding:12px 13px"><div style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.06em;color:var(--mut2)">'+escapeHtmlPV(label)+'</div><div style="font-size:22px;font-weight:800;line-height:1.1;margin-top:5px;color:'+col+'">'+value+'</div>'+(sub?'<div style="font-size:11px;color:var(--mut2);margin-top:4px;line-height:1.35">'+sub+'</div>':'')+'</div>';}
function rfxSevPill(sev){var m={critical:['#C8202E','var(--pink-t,#FBE7E3)'],high:['#C8202E','var(--pink-t,#FBE7E3)'],medium:['#8A5A00','var(--amber-t,#FBF1DA)'],low:['#2E5E8C','var(--blue-t,#E4EBF1)'],none:['var(--mut2)','#EFECE8']};var c=m[sev]||m.none;
 return '<span style="display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 8px;border-radius:30px;color:'+c[0]+';background:'+c[1]+'">'+escapeHtmlPV(sev)+'</span>';}
function rfxPrioPill(p){var m={GATING:['#C8202E','var(--pink-t,#FBE7E3)'],HIGH:['#8A5A00','var(--amber-t,#FBF1DA)'],MEDIUM:['#2E5E8C','var(--blue-t,#E4EBF1)']};var c=m[p]||['var(--mut2)','#EFECE8'];
 return '<span style="display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 8px;border-radius:30px;color:'+c[0]+';background:'+c[1]+'">'+escapeHtmlPV(p)+'</span>';}
function rfxTprmPill(sc){if(!sc)return '<span style="font-size:11px;color:var(--mut2)">Data not available</span>';
 var m={approved:['var(--plum)','rgba(92,43,80,.10)'],'under-review':['#8A5A00','var(--amber-t,#FBF1DA)'],'not-started':['var(--mut2)','#EFECE8'],rejected:['#C8202E','var(--pink-t,#FBE7E3)']};
 var c=m[sc.status]||['var(--mut2)','#EFECE8'];var label=String(sc.status||'unknown').replace(/-/g,' ')+(sc.open!=null?' ('+sc.open+' open)':'');
 return '<span style="display:inline-block;font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:30px;color:'+c[0]+';background:'+c[1]+'">'+escapeHtmlPV(label)+'</span>';}
function rfxPriceVal(v){return (v==null||v==='')?'<span style="color:var(--mut2)">-</span>':(String(v)==='Not submitted'?'<span style="color:var(--amber-d);font-weight:700">Not submitted</span>':escapeHtmlPV(v));}
// Deep-dive / selected-supplier state (shared by the Overview merged ranking + the
// Analysis › Individual-supplier view; rfxDD re-renders the whole RFx tab).
var RFX_DD=0;
function rfxDD(i){RFX_DD=i;if(curtab==='rfx')$('#tabbody').innerHTML=rfxHTML();}
// RFx tab IA (redesign 2026-07-06 · _audit_workspace/rfx-tab-redesign-spec.md):
// FOUR top-level subtabs, Overview · Scoring · Analysis · Recommendation. Overview merges the
// old Summary + Bidders-contacts + ONE ranking; Scoring is unchanged (protected win); Analysis
// has two sub-subtabs (Individual · Cross-supplier); Recommendation replaces the async brief.
var RFX_SUB='overview';
function rfxSub(m){RFX_SUB=m;if(curtab==='rfx')$('#tabbody').innerHTML=rfxHTML();}
// (rfxCancelEvent removed: a platform-wide event-cancellation action has no local effect in a
// self-contained, no-backend artifact. See rfx_platform_audit.md finding #1.)
// Analysis view state (increment 2): 'compare' | supplier index. One selector = Compare + one tab per
// supplier, replacing the old Cross/Individual toggle AND the Individual dropdown. A numeric value also
// sets RFX_DD so the existing per-supplier view renders that bidder.
var RFX_AV='compare';
function rfxAv(v){RFX_AV=v;if(v!=='compare'){var i=parseInt(v,10);if(!isNaN(i))RFX_DD=i;}if(curtab==='rfx')$('#tabbody').innerHTML=rfxHTML();}
// RFX_XS / rfxXs retired in increment 3: Compare is one page (stacked groups + jump-nav), no lens tabs.
function rfxHTML(){if(typeof ensureDealCss==='function')ensureDealCss();
 // #3 (Marc): RFx subtabs use the page-detail underline-tab style (.rfxstbar/.rfxst), not the pill segmented control.
 // Business Case added as a 5th subtab (artifact-audit Part 2): reflects the recommended supplier's case, read-only.
 var subs=[['overview','Overview'],['scoring','Scoring'],['analysis','Analysis'],['recommendation','Recommendation'],['businesscase','Business Case']].map(function(m){return '<button class="rfxst'+(m[0]===RFX_SUB?' on':'')+'" onclick="rfxSub(\''+m[0]+'\')">'+m[1]+'</button>';}).join('');
 // #5 (Marc): header = "RFx - <name>" + a 3-5 sentence purpose/scope (grounded in the RFx seed: bidders, CCI, TCO).
 var _R=RFX;var _bn=_R.suppliers.map(function(s){return escapeHtmlPV(s.n);});
 var _bt=_bn.length>1?(_bn.slice(0,-1).join(', ')+' and '+_bn[_bn.length-1]):(_bn[0]||'the invited bidders');
 var purpose='This competitive RFP selects an enterprise data platform to consolidate Lilly&rsquo;s analytics workloads onto one governed environment. The field was scanned and narrowed to '+_R.suppliers.length+' invited bidders ('+_bt+'), whose priced responses are now under panel evaluation. Because the platform processes employee and clinical analytics data it carries a '+escapeHtmlPV(_R.cci)+' CCI and must clear the mandatory security and data-residency requirements. Scope is a 3-year MSA plus an initial Work Order for the awarded supplier, with an estimated total cost of '+escapeHtmlPV(_R.tco)+'. Theo drafts and ranks the responses; the panel does the binding scoring and the award stays subject to contract.';
 var h='<p class="dashintro"><b>RFx · '+escapeHtmlPV(PROJECTS[CURPROJ].title)+'</b>, '+purpose+'</p>';
 h+='<div class="rfxstbar">'+subs+'</div>';
 if(RFX_SUB==='scoring') h+=rfxScoringHTML();
 else if(RFX_SUB==='analysis') h+=rfxAnalysisHTML();
 else if(RFX_SUB==='recommendation') h+=rfxRecommendationHTML();
 else if(RFX_SUB==='businesscase') h+=rfxBusinessCaseHTML();
 else h+=rfxOverviewHTML();
 // (Removed the tab-level "Reflect-only first-pass … Company Confidential" footer, Marc Overview #4B /
 //  Individual-Supplier #3. It was boilerplate; the reflect-only stance is stated in the header purpose.)
 return h;
}
// ---- RFx phase banner (RD.3 fold-in): phase i-of-N + progress + deadline + next milestone + outstanding items ----
function rfxPhaseItems(){var p=RFX.phase,items=[];
 if(p.deadlineStatus==='breached')items.push(['#C8202E','The "'+p.name+'" phase is past its due date'+(p.daysToNext<0?' by '+Math.abs(p.daysToNext)+' day(s)':'')+'.']);
 if(p.openQuestions>0)items.push(['#8A5A00',p.openQuestions+' open Q&A item(s) to answer and publish to every bidder.']);
 if(p.suppliersAwaiting>0)items.push(['#8A5A00',p.suppliersAwaiting+(p.suppliersTotal!=null?' of '+p.suppliersTotal:'')+' invited supplier(s) still to respond.']);
 if(p.commsAnomalies>0)items.push(['#C8202E',p.commsAnomalies+' communications-discipline flag(s) to route to the Lead and Legal.']);
 if(p.stale)items.push(['#8A5A00','Quiet case: no recent activity.']);
 if(p.judgmentCall)items.push(['#8A5A00','A judgment call is pending with the Lead.']);
 if(p.nextAction)items.push(['var(--plum)','Next action: '+p.nextAction]);
 return items.slice(0,6);}
function rfxPhaseBannerHTML(){var p=RFX.phase;
 var dl={'on-track':['On-track','var(--plum)','rgba(92,43,80,.10)'],'at-risk':['At-risk','#8A5A00','var(--amber-t,#FBF1DA)'],'breached':['Breached','#C8202E','var(--pink-t,#FBE7E3)']}[p.deadlineStatus]||['','var(--mut2)','#EFECE8'];
 var pill='<span style="display:inline-block;font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 9px;border-radius:30px;color:'+dl[1]+';background:'+dl[2]+'">'+escapeHtmlPV(dl[0])+'</span>';
 var days=p.daysToNext<0?Math.abs(p.daysToNext)+' day(s) overdue':p.daysToNext===0?'due today':'in '+p.daysToNext+' day(s)';
 var pct=Math.min(100,Math.max(0,Math.round((p.phaseIndex+1)/p.phaseCount*100)));
 var items=rfxPhaseItems();
 var open='<div style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.06em;color:var(--mut2);margin:12px 0 7px">Outstanding items ('+items.length+')</div>'+items.map(function(it){return '<div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:6px"><span style="flex:none;width:7px;height:7px;border-radius:50%;margin-top:5px;background:'+it[0]+'"></span><div style="font-size:12.5px;color:var(--mut);line-height:1.45">'+escapeHtmlPV(it[1])+'</div></div>';}).join('');
 return '<div class="card" style="border-left:3px solid var(--plum);margin-bottom:16px">'
  +'<div style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.06em;color:var(--mut2);margin-bottom:8px">RFx case · phase &amp; open items <span style="color:var(--mut2);font-weight:500;text-transform:none;letter-spacing:0">· reflect-only case read</span></div>'
  +'<div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap"><span style="font-size:15px;font-weight:800;color:var(--plum)">'+escapeHtmlPV(p.name)+'</span><span style="font-family:var(--mono);font-size:11px;color:var(--mut2)">phase '+(p.phaseIndex+1)+' of '+p.phaseCount+'</span>'+pill+'<span style="font-size:12px;color:var(--mut)">Next milestone: <b style="color:var(--plum)">'+escapeHtmlPV(p.nextMilestone)+'</b> · '+escapeHtmlPV(days)+'</span></div>'
  +'<div style="height:7px;border-radius:4px;background:var(--line2,#E0DCD5);margin:10px 0 0;overflow:hidden"><i style="display:block;height:100%;width:'+pct+'%;background:var(--plum)"></i></div>'
  +open
  +'</div>';}
// ---- ① Overview subtab: compact event/status strip + KPIs + trimmed lede + ONE merged ranking + contacts ----
function rfxOverviewHTML(){var R=RFX;var rank=rfxReqRanking(),top=rank[0];
 var cov=R.suppliers.map(function(s,si){return rfxCoverage(si);});
 var mand=R.requirements.filter(function(r){return r.mandatory;}).length,cats=rfxCats().length;
 var bestCovIdx=0,bestCov=-1;R.suppliers.forEach(function(s,si){if(cov[si].coveragePct>bestCov){bestCov=cov[si].coveragePct;bestCovIdx=si;}});
 var nonConf=cov.filter(function(c){return !c.conforming&&c.answered>0;}).length;
 var notScored=cov.filter(function(c){return c.answered===0;}).length;
 // Marc Overview #1: two-column top, RFx event & status (left, wider) | RIGHT column stacks the split-out
 // Evaluation panel (Participants-style) ABOVE Suppliers & contacts.
 var h='<div style="display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:16px;align-items:start;margin-bottom:14px"><div>'+rfxEventStripHTML()+'</div><div style="display:flex;flex-direction:column;gap:14px">'+rfxEvalPanelHTML()+rfxContactsHTML()+'</div></div>';
 // compact KPI tiles
 h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:14px">';
 h+=rfxKpi('Suppliers evaluated',R.suppliers.length,escapeHtmlPV(R.suppliers.map(function(s){return s.n;}).join(', ')));
 h+=rfxKpi('Requirements',R.requirements.length,cats+' categories · '+mand+' mandatory');
 h+=rfxKpi('Highest coverage',bestCov+'%',escapeHtmlPV(R.suppliers[bestCovIdx].n)+' ('+cov[bestCovIdx].fully+'/'+R.requirements.length+' fully meets)','good');
 h+=rfxKpi('Top of advisory ranking',escapeHtmlPV(R.suppliers[top].n),'by panel score; advisory, not an award','good');
 h+=rfxKpi('Scorecards submitted',rfxScored()+' of '+R.panel.length,'evaluators; status readout only');
 h+='</div>';
 // (Evaluation Summary moved INTO the RFx event & status panel, Marc #1C.)
 // ONE merged ranking (three at-a-glance bars/chips per supplier + selector-driven narrative)
 h+=rfxMergedRankingHTML();
 // (Suppliers & contacts moved to the right of the event strip at the top, Marc.)
 // Artifact-audit Part 2 (missing on Overview): Participation + Completeness & Risk roll-up,
 // both derived from data already on RFX (phase.suppliersAwaiting/suppliersTotal, per-supplier
 // completenessPct/rfxRiskLevel), just not previously wired into a panel here.
 // Round-2 #1 (Marc) BUG FIX: each grid cell gets min-width:0 so a wide .mxwrap table inside it
 // scrolls WITHIN its own panel (overflow-x:auto is already on .mxwrap) instead of forcing the
 // 1fr grid track wider than the column and overflowing the page's right edge.
 h+='<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-top:14px"><div style="min-width:0">'+rfxParticipationHTML()+'</div><div style="min-width:0">'+rfxCompletenessRiskHTML()+'</div></div>';
 // Condensed, expandable What Happens Next (small, collapsed by default): the full version with all
 // 4 stages lives on the Recommendation subtab; this is just enough to orient without leaving Overview.
 h+='<div style="margin-top:14px">'+rfxWhatsNextMiniHTML()+'</div>';
 return h;
}
// Small shape+label glyph chip, reused by Participation below (mockup port). A shape (never color
// alone) plus a text label, so state reads without relying on hue: done=check, half=in-progress dot,
// flag=blocked/attention, dash=not started, nt=not tracked in this RFx data model (gap-state, not a
// fabricated status).
// Round-2 #2 (Marc): pill/bubble chrome removed, just the shape glyph + the label text (no
// border/background/border-radius), the shape alone still carries the state, no color-only cue.
function rfxGlyph(kind,label){var m={done:['✓','var(--plum)'],half:['◐','#2E5E8C'],flag:['⚠','#C8202E'],dash:['○','var(--mut2)'],nt:['–','var(--mut2)']};var c=m[kind]||m.nt;
 return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--ink);white-space:nowrap"><span style="font-size:12px;font-weight:700;width:12px;text-align:center;flex:none;color:'+c[1]+'">'+c[0]+'</span>'+escapeHtmlPV(label)+'</span>';}
// Small pill chip, reused by Completeness & Risk roll-up below.
function rfxChip(label,col,bg){return '<span style="display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 9px;border-radius:30px;color:'+col+';background:'+bg+'">'+escapeHtmlPV(label)+'</span>';}
// Participation panel (Overview; ported from the RFx-MOCKUP.html design, bound to real RFX + restyled
// to pv-09 classes/vars). Supplier x Agreed / CDA / MSA / Response / Demo-set / Demo-done, each a
// shape+label glyph so state never relies on color alone. Response is the only column derived from a
// live engine (rfxCoverage); RFX carries no CDA/demo-scheduling data at all, so those stay a plain
// "Not tracked" glyph, never fabricated. Agreed is inferred (a supplier only appears in RFX.suppliers
// once it has agreed to participate in the RFx). MSA is read from the free-text s.lilly.relationship
// field when present (a lightweight, honest parse, not a dedicated MSA flag the data model lacks).
function rfxParticipationHTML(){var R=RFX,p=R.phase||{};
 function msaGlyph(s){var rel=(s.lilly&&s.lilly.relationship)||'';
  if(/\bMSA\b/i.test(rel))return rfxGlyph('done','MSA on file');
  if(rel)return rfxGlyph('dash','No MSA on file');
  return rfxGlyph('nt','Not tracked');}
 function respGlyph(si){var c=rfxCoverage(si);
  if(c.answered===0)return rfxGlyph('dash','Not yet responded');
  if(c.answered<c.total)return rfxGlyph('half','Partial ('+c.answered+' of '+c.total+')');
  return rfxGlyph('done','Complete');}
 var head='<tr><th style="text-align:left">Supplier</th><th>Agreed</th><th>CDA</th><th>MSA</th><th>Response</th><th>Demo-set</th><th>Demo-done</th></tr>';
 var rows=R.suppliers.map(function(s,si){
   return '<tr><td style="text-align:left;font-weight:600">'+rfxSupplierSwatch(si)+escapeHtmlPV(s.n)+'</td>'
    +'<td>'+rfxGlyph('done','Agreed')+'</td>'
    +'<td>'+rfxGlyph('nt','Not tracked')+'</td>'
    +'<td>'+msaGlyph(s)+'</td>'
    +'<td>'+respGlyph(si)+'</td>'
    +'<td>'+rfxGlyph('nt','Not tracked')+'</td>'
    +'<td>'+rfxGlyph('nt','Not tracked')+'</td></tr>';
 }).join('');
 var total=p.suppliersTotal!=null?p.suppliersTotal:R.suppliers.length;
 var awaitTxt=(p.suppliersAwaiting>0)?(p.suppliersAwaiting+' of '+total+' invited supplier(s) still to respond.'):('All '+total+' invited supplier(s) have responded.');
 var key='<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:9px;font-size:10.5px;color:var(--mut2)"><span>Glyph key:</span>'+rfxGlyph('done','done')+rfxGlyph('half','in progress')+rfxGlyph('flag','blocked / attention')+rfxGlyph('dash','not started')+rfxGlyph('nt','not tracked in this RFx')+'</div>';
 return '<div class="card" style="margin:0"><div style="font-weight:700;font-size:13px;margin-bottom:2px">Participation</div><div class="spnote" style="margin:0 0 8px">'+escapeHtmlPV(awaitTxt)+' Agreed is inferred from appearing on the invited-bidder list; CDA and demo scheduling are not tracked fields in this RFx case, shown as Not tracked rather than guessed.</div><div class="mxwrap"><table class="mx" style="width:100%"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>'+key+'</div>';
}
// Completeness & Risk roll-up (Overview; ported from the RFx-MOCKUP.html design, bound to real RFX).
// Supplier x Conforming / Completeness % / Red-flags / Gating items / Award tier, all read from the
// existing rfxCoverage / rfxFlags / rfxAwardTier engines (the SAME score ranking that drives the merged
// ranking above, so the tier column here can never drift from it).
function rfxCompletenessRiskHTML(){var R=RFX,esc=escapeHtmlPV;var rank=rfxReqRanking();
 var rows=R.suppliers.map(function(s,si){var c=rfxCoverage(si),fl=rfxFlags(si),gating=fl.filter(function(f){return f.priority==='GATING';}).length;
   var rankIdx=rank.indexOf(si);var tier=rfxAwardTier(si,rankIdx);
   var confLabel=c.answered===0?'Pending':(c.conforming?'Y':'N');
   var confCol=c.answered===0?'var(--mut2)':(c.conforming?'var(--plum)':'#C8202E');
   var confBg=c.answered===0?'#EFECE8':(c.conforming?'rgba(92,43,80,.10)':'var(--pink-t,#FBE7E3)');
   return '<tr><td style="text-align:left;font-weight:600">'+rfxSupplierSwatch(si)+esc(s.n)+'</td>'
    +'<td class="n">'+rfxChip(confLabel,confCol,confBg)+'</td>'
    +'<td class="n">'+c.completenessPct+'%</td>'
    +'<td class="n">'+fl.length+'</td>'
    +'<td class="n">'+gating+'</td>'
    +'<td class="n">'+rfxChip(tier.label,tier.col,tier.bg)+'</td></tr>';
 }).join('');
 return '<div class="card" style="margin:0"><div style="font-weight:700;font-size:13px;margin-bottom:2px">Completeness &amp; risk roll-up</div><div class="spnote" style="margin:0 0 8px">Conforming reads the mandatory-requirement conformance check; Red-flags and Gating are response-grounded counts from the same red-flag analysis behind each supplier&rsquo;s Analysis report; Award tier is the same advisory tier shown across the tab (a gate risk on the leader is flagged there, not a hidden demotion here).</div><div class="mxwrap"><table class="mx" style="width:100%"><thead><tr><th style="text-align:left">Supplier</th><th>Conforming</th><th>Completeness</th><th>Red-flags</th><th>Gating</th><th>Award tier</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
}
// Reusable member ROSTER, avatar · name · role, stacked in N columns (never a comma line).
// role is real per-project data ({n, role}); reused anywhere we list a project's people.
function initialsOf(name){var p=String(name||'').trim().split(/\s+/);return (((p[0]||'')[0]||'')+((p.length>1?p[p.length-1]:'')[0]||'')).toUpperCase();}
function rosterHTML(members,cols){
 if(!members||!members.length)return '<div style="font-size:12px;color:var(--mut2)">No members assigned</div>';
 var c=cols||2;
 var items=members.map(function(m){var nm=m.n||m.name||'',role=m.role||'';
  return '<div style="display:flex;align-items:center;gap:8px;min-width:0">'
   +'<span style="flex:none;width:26px;height:26px;border-radius:50%;background:var(--blue-t,#E4EBF1);color:var(--plum);font:700 10px var(--mono,monospace);display:flex;align-items:center;justify-content:center">'+escapeHtmlPV(initialsOf(nm))+'</span>'
   +'<div style="min-width:0"><div style="font-size:12.5px;font-weight:700;color:var(--ink);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtmlPV(nm)+'</div>'
   +(role?'<div style="font-size:10.5px;color:var(--mut2);line-height:1.2">'+escapeHtmlPV(role)+'</div>':'')+'</div></div>';}).join('');
 return '<div style="display:grid;grid-template-columns:repeat('+c+',minmax(0,1fr));gap:8px 14px">'+items+'</div>';
}
// Reusable info affordance, an "i"-in-a-circle that reveals reference prose on hover/focus, so
// explanatory text doesn't clutter a panel. Pure-CSS popover (survives innerHTML re-renders).
// `html` is AUTHOR-TRUSTED static reference text only (may contain <b>), never user data.
function infoHover(html,opts){var o=opts||{};
 return '<span class="ihov" tabindex="0" role="note" aria-label="'+escapeHtmlPV(o.aria||'More information')+'"><span class="ihov-i" aria-hidden="true">i</span><span class="ihov-pop">'+(html||'')+'</span></span>';}
// Compact merged Event/status strip, one tight grid (not a tall card): description · TCO · CCI ·
// award basis · panel · scores-due · doc link · landscape link · phase/status + next action.
// RFx event & status, rebuilt (Marc Overview #1D/#2/#3) to MATCH the Overview tab's KEY FACTS panel:
// a clean .ovfacts key-fact grid (RFx name · Stage · Health · CCI · Est TCO · Next action), then any INTERNAL
// delaying item / process flags (never supplier issues), then the Evaluation Summary (moved in from #1C).
// Removed per #2: the RFx-document link, the supplier-landscape link, Award basis, Scores-due, the dense
// "phase N of M · At-risk · Next…" line, and the Evaluation-panel roster (split out to its own panel, #1A).
function rfxEventStripHTML(){var R=RFX;var p=R.phase;
 // Health flag, same treatment as the Overview Key Facts (on-track / at-risk = emph / breached = red)
 var dl={'on-track':['On track','#5C2B50','rgba(92,43,80,.10)'],'at-risk':['At risk','var(--emph)','var(--emph-t)'],'breached':['Breached','#C8202E','var(--pink-t)']}[p.deadlineStatus]||['Pending','var(--mut2)','#EFECE8'];
 var healthTxt='<span style="color:'+dl[1]+';font-weight:700;text-transform:uppercase;letter-spacing:.02em">'+escapeHtmlPV(dl[0])+'</span>';
 var wna=(typeof wfNextAction==='function')?wfNextAction():null;
 var stage=(wna&&wna.node)||p.name;   // the workflow node/step the project is on
 var nextAct=wna?(escapeHtmlPV(wna.act)+(wna.who?' <span style="color:var(--mut2)">- '+escapeHtmlPV(wna.who)+'</span>':'')):'-';
 var rfxName=(typeof PROJECTS!=='undefined'&&typeof CURPROJ!=='undefined'&&PROJECTS[CURPROJ]&&PROJECTS[CURPROJ].title)||'Enterprise Data Platform RFP';
 var glab='font:700 10px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:var(--mut);margin-bottom:3px';
 // Round-2 #3 (Marc) BUG FIX: `wrap` lets a fact value WRAP onto multiple lines instead of the
 // default .ovfacts .val nowrap+ellipsis truncation (was cutting the Next action text off mid-word).
 function fct(label,val,col,wrap){var _t=String(val).replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim();return '<div class="ovfact"><div style="'+glab+'">'+escapeHtmlPV(label)+'</div><div class="val" title="'+escapeHtmlPV(_t)+'" style="color:'+(col||'var(--ink)')+(wrap?';white-space:normal;overflow:visible;text-overflow:clip;line-height:1.4':'')+'">'+val+'</div></div>';}
 var h='<div class="card rfxevt"><div class="glabhd">RFx event &amp; status</div>';
 h+='<div class="ovfacts">';
 h+=fct('RFx name',escapeHtmlPV(rfxName));
 h+=fct('Stage',escapeHtmlPV(stage));
 h+=fct('Health',healthTxt);
 h+=fct('CCI classification','<span class="swatch" style="background:'+(typeof cciColor==='function'?cciColor(R.cci):'#ccc')+'"></span>'+escapeHtmlPV(R.cci));
 h+=fct('Estimated TCO',escapeHtmlPV(R.tco));
 h+=fct('Next action',nextAct,null,true);
 h+='</div>';
 // INTERNAL delaying item + process flags (burnt-orange emphasis; never supplier issues), Marc #3
 var flagRows='';
 if(R.blocker)flagRows+='<div class="rfxflag"><span class="rfxflag-k">Delaying progress</span><span class="rfxflag-v"><b>'+escapeHtmlPV(R.blocker.what)+'</b>'+(R.blocker.who?', '+escapeHtmlPV(R.blocker.who):'')+(R.blocker.note?'<span class="rfxflag-note">'+escapeHtmlPV(R.blocker.note)+'</span>':'')+'</span></div>';
 (R.internalFlags||[]).forEach(function(f){flagRows+='<div class="rfxflag"><span class="rfxflag-k">Internal flag</span><span class="rfxflag-v">'+escapeHtmlPV(f.text)+'</span></div>';});
 if(flagRows)h+='<div class="rfxflags">'+flagRows+'</div>';
 // Evaluation Summary, moved in from its own section (Marc #1C)
 var cov=R.suppliers.map(function(s,si){return rfxCoverage(si);});
 var rank=rfxReqRanking(),top=rank[0];
 var mand=R.requirements.filter(function(r){return r.mandatory;}).length;
 var bestCovIdx=0,bestCov=-1;R.suppliers.forEach(function(s,si){if(cov[si].coveragePct>bestCov){bestCov=cov[si].coveragePct;bestCovIdx=si;}});
 var nonConf=cov.filter(function(c){return !c.conforming&&c.answered>0;}).length;
 var notScored=cov.filter(function(c){return c.answered===0;}).length;
 var topC=cov[top],topGated=!!(R.suppliers[top].mustFail&&R.suppliers[top].mustFail.length);
 var lede='Across '+R.suppliers.length+' suppliers and '+R.requirements.length+' requirements ('+mand+' mandatory), '+escapeHtmlPV(R.suppliers[bestCovIdx].n)+' shows the highest coverage at '+bestCov+'% fully met. ';
 if(topGated){
   lede+='<b>'+escapeHtmlPV(R.suppliers[top].n)+'</b> is Theo&rsquo;s recommendation, the top panel score in the field ('+rfxWeighted(top).toFixed(1)+'/5), but it carries an open <b>Must-Have gate</b> ('+escapeHtmlPV(R.suppliers[top].mustFail.join(', '))+'). It keeps the #1 rank on merit; the gate is a flagged risk, not a demotion. <b>Business call:</b> proceed with the risk or secure a dated remediation before award. ';
 } else {
   lede+='<b>'+escapeHtmlPV(R.suppliers[top].n)+'</b> is Theo&rsquo;s recommendation on the panel score ('+rfxWeighted(top).toFixed(1)+'/5), clean on every Must-Have. ';
 }
 lede+=(nonConf?nonConf+' supplier(s) are non-conforming on a Must-Have. ':'')+(notScored?notScored+' supplier(s) have not submitted a scored response. ':'')+'First-pass and advisory; the panel decides.';
 h+='<div class="rfxevalsum"><div class="glabhd" style="margin-top:13px">Evaluation summary</div><p class="cnote" style="margin:0">'+lede+'</p></div>';
 h+='</div>';
 return h;
}
// Evaluation panel, split out of the event strip (Marc #1A) into its own panel matching the Overview tab's
// PARTICIPANTS panel: avatar · name · role, per-person Outlook-email / Teams-call icons, and group contact.
// Reuses the same classes + global handlers so it stays visually identical to the Overview roster.
function rfxEvalPanelHTML(){var R=RFX;
 // Mail/Teams-call icons removed (rfx_platform_audit.md findings #3-9): pvGroupOpen/pvGroupToggle/
 // pvGroupAll/pvGroupGo/pvPersonMail/pvPersonCall are undefined (confirmed live ReferenceError) and
 // are Outlook/Teams actions that cannot function in a sandboxed artifact either way. The roster
 // display, avatar/name/role, is kept as reflect-only content.
 // Round-2 #4 (Marc): PANEL ROSTER ROLES come ONLY from the M365 directory connector (the source
 // RFX.panel[].role is populated from upstream, at RFx setup); this render never invents, infers
 // or guesses a role. If the connector has not returned a role for an evaluator, RFX.panel[].role
 // is absent/empty and the row below renders the name alone (see the '(e.role?...)' guard) rather
 // than fabricate one.
 var ownerNm=(people.filter(function(x){return /owner/i.test(x.r||'');})[0]||{}).n||'Priya Shah';
 var repNm=(people.filter(function(x){return (x.cls||'')==='rep'||/sourcing rep/i.test(x.r||'');})[0]||{}).n||'Marc Lane';
 var h='<div class="card ovpart rfxevp"><div class="ovpart-hd"><div class="glabhd" style="margin:0">Evaluation panel</div></div>';
 var _pOrder=R.panel.filter(function(x){return x.n===ownerNm;}).concat(R.panel.filter(function(x){return x.n===repNm&&x.n!==ownerNm;})).concat(R.panel.filter(function(x){return x.n!==ownerNm&&x.n!==repNm;}));
 h+='<div class="ovroster">'+_pOrder.map(function(e){var ini=initialsOf(e.n);
   return '<div class="ovrp" style="--av:'+pvAvColor(e.n)+'"><span class="ovav" style="background:'+pvAvColor(e.n)+';color:#fff">'+escapeHtmlPV(ini)+'</span><div class="owho"><div class="orn">'+escapeHtmlPV(e.n)+'</div>'+(e.role?'<div class="orr">'+escapeHtmlPV(e.role)+'</div>':'')+'</div></div>';}).join('')+'</div>';
 h+='</div>';   // close .ovpart card
 return h;
}
// ONE merged ranking (replaces the three prior renderings): LEFT = per-supplier rows with weighted-fit
// bar · coverage-% bar · rank#+tier chip (click to select); RIGHT = narrative for the selected supplier.
function rfxMergedRankingHTML(){var R=RFX;var rank=rfxReqRanking();
 var sel=(RFX_DD>=0&&RFX_DD<R.suppliers.length)?RFX_DD:rank[0];
 var selRankIdx=rank.indexOf(sel);if(selRankIdx<0)selRankIdx=0;
 var left='';
 rank.forEach(function(si,i){var c=rfxCoverage(si),tier=rfxAwardTier(si,i),on=si===sel;
  var wf=c.weightedFit,pc=c.coveragePct,ns=c.answered===0;
  left+='<div onclick="rfxDD('+si+')" style="cursor:pointer;padding:10px 11px;border-radius:9px;margin-bottom:8px;border:1px solid '+(on?'var(--plum)':'var(--line2,#E0DCD5)')+';background:'+(on?'rgba(92,43,80,.05)':'var(--card,#fff)')+'">';
  left+='<div style="display:flex;align-items:center;gap:9px;margin-bottom:7px"><span style="flex:none;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:'+tier.col+';background:'+tier.bg+'">'+(i+1)+'</span><span style="font-weight:700;font-size:13px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtmlPV(R.suppliers[si].n)+'</span><span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:30px;color:'+tier.col+';background:'+tier.bg+'">'+escapeHtmlPV(tier.label)+'</span>'+(R.suppliers[si].mustFail&&R.suppliers[si].mustFail.length?' <span class="gate fail" title="Ranked on merit; this Must-Have must be cleared before award, the panel decides">&#9888; Must clear: '+escapeHtmlPV(R.suppliers[si].mustFail.join(', '))+'</span>':'')+'</div>';
  left+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="width:78px;font-size:9.5px;color:var(--mut2);font-weight:600">Weighted fit</span><div style="flex:1;height:11px;border-radius:4px;background:var(--bg,#F4F1EC);overflow:hidden"><i style="display:block;height:100%;width:'+wf+'%;background:'+tier.col+'"></i></div><span style="width:34px;text-align:right;font-family:var(--mono);font-weight:700;font-size:11px;color:'+tier.col+'">'+wf+'</span></div>';
  left+='<div style="display:flex;align-items:center;gap:8px"><span style="width:78px;font-size:9.5px;color:var(--mut2);font-weight:600">Coverage</span><div style="flex:1;height:11px;border-radius:4px;background:var(--bg,#F4F1EC);overflow:hidden"><i style="display:block;height:100%;width:'+pc+'%;background:'+rfxCovCol(pc)+'"></i></div><span style="width:34px;text-align:right;font-family:var(--mono);font-weight:700;font-size:11px;color:'+(ns?'var(--mut2)':rfxPcCol(pc))+'">'+(ns?'-':pc+'%')+'</span></div>';
  left+='</div>';
 });
 var c=rfxCoverage(sel),tier=rfxAwardTier(sel,selRankIdx),s=R.suppliers[sel];
 var st=rfxStrengths(sel),gp=rfxGaps(sel);
 var right='<div style="padding:12px 13px;border-radius:9px;border:1px solid var(--line2,#E0DCD5);background:var(--bg,#FBFAF9)">';
 right+='<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:7px"><span style="font-weight:800;font-size:14px">'+escapeHtmlPV(s.n)+'</span><span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 9px;border-radius:30px;color:'+tier.col+';background:'+tier.bg+'">'+escapeHtmlPV(tier.label)+' · rank '+(selRankIdx+1)+'</span></div>';
 right+='<div style="font-size:12.5px;color:var(--ink);line-height:1.55;margin-bottom:9px">'+rfxRecoText(sel,selRankIdx)+'</div>';
 right+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
 right+='<div><div style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:var(--plum);margin-bottom:5px">Strengths</div>'+(st.length?st.slice(0,3).map(function(r){return '<div style="font-size:11.5px;line-height:1.45;margin-bottom:3px;color:var(--mut)">✓ '+escapeHtmlPV(r.text)+'</div>';}).join(''):'<div style="font-size:11.5px;color:var(--mut2)">None recorded.</div>')+'</div>';
 right+='<div><div style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:#C8202E;margin-bottom:5px">Gaps</div>'+(gp.length?gp.slice(0,3).map(function(r){return '<div style="font-size:11.5px;line-height:1.45;margin-bottom:3px;color:var(--mut)">• '+escapeHtmlPV(r.text)+(r.mandatory?' (Must-have)':'')+'</div>';}).join(''):'<div style="font-size:11.5px;color:var(--mut2)">None, meets every requirement.</div>')+'</div>';
 right+='</div></div>';
 // #4A/#4B (Marc): removed the "weighted fit → coverage % · select a supplier…" caption and the "One merged
 // ranking by merit…" spnote, the bars are self-explanatory and the reflect-only stance lives in the header.
 var h='<div class="sect"><div class="secthd"><div class="t">Advisory ranking</div></div>';
 h+='<div class="card"><div style="display:grid;grid-template-columns:1.25fr 1fr;gap:14px;align-items:start"><div>'+left+'</div><div>'+right+'</div></div></div>';
 return h;
}
// Suppliers & contacts (kept on Overview, the project's email-drafting edge; letter drafting moved off-tab).
function rfxContactsHTML(){var R=RFX;
 // Email-all / per-supplier email icons removed (rfx_platform_audit.md findings #10-11): both draft
 // into a live CHAT/Outlook flow with no local equivalent. The contact list itself is kept as
 // reflect-only display.
 return '<div class="sect"><div class="secthd"><div class="t">Suppliers &amp; contacts</div></div><div class="card" style="padding:2px 0">'+R.suppliers.map(function(s,si){return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 14px'+(si>0?';border-top:1px solid var(--line2,#E0DCD5)':'')+'"><div><div style="font-weight:600;font-size:13px">'+escapeHtmlPV(s.n)+((s.mustFail&&s.mustFail.length)?' <span class="gate fail" style="margin-left:6px">Gate fail</span>':'')+'</div><div style="font-size:11.5px;color:var(--mut2)">'+escapeHtmlPV(s.contact)+' · '+escapeHtmlPV(s.email)+'</div></div></div>';}).join('')+'</div></div>';
}
// ---- Lilly supplier-context strip (RD.2 fold-in): internal relationship / spend / TPRM / Defender per bidder ----
function rfxLillyCtxHTML(cur){var R=RFX;
 var rows=R.suppliers.map(function(s,si){var d=s.lilly;
  var h='<div style="display:flex;flex-wrap:wrap;gap:7px 14px;align-items:center;padding:8px 6px'+(si>0?';border-top:1px solid var(--line,#EEE)':'')+(si===cur?';background:rgba(92,43,80,.03);border-radius:6px':'')+'"><span style="font-weight:700;font-size:12.5px;min-width:120px">'+escapeHtmlPV(s.n)+'</span>';
  if(!d)return h+'<span style="font-size:12px;color:var(--mut2)">No internal supplier record found. Data not available.</span></div>';
  h+='<span style="font-size:12px;color:var(--mut)"><b>Relationship:</b> '+escapeHtmlPV(d.relationship||'Data not available')+'</span>';
  h+='<span style="font-size:12px;color:var(--mut)"><b>Spend:</b> '+escapeHtmlPV(d.spend||'Data not available')+'</span>';
  h+='<span style="font-size:12px;color:var(--mut)"><b>TPRM:</b></span> '+rfxTprmPill(d.tprm);
  if(d.defender&&d.defender.count>0)h+='<span style="font-size:12px;color:var(--amber-d)"><b>Defender:</b> '+d.defender.count+' finding(s)</span>';
  return h+'</div>';}).join('');
 return '<div class="card"><div style="font-weight:700;font-size:13px;margin-bottom:4px">Lilly Supplier Context <span style="font-weight:500;color:var(--mut2);font-size:11px">· internal</span></div><div class="spnote" style="margin:0 0 6px">Internal Lilly context per bidder: existing relationship, trailing-12-month spend, and TPRM posture. Read-only; it does not affect coverage scores or the advisory ranking, and a missing read shows as Data not available, never an estimate.</div>'+rows+'</div>';}
// ---- ③ Analysis › (i) Individual supplier, dropdown-switched, ONE scrolling page (5 sections) ----
// Response-analysis first: driven by the supplier's own submitted RFP responses, refreshed from
// internal Lilly data. Absorbs the old Bidders deep dive; internal-context strip shown ONCE at top.
// ===== Native supplier response report (rebuilt design, 2026-07). Renders from s.report (authored,
// "materialized" content) + live helpers (coverage, per-category score distribution). Scoped .rfxrpt.
// Three-colour system only: plum / teal / burnt orange. No red. =====
function rfxScoreCls(n){return n>=7?'hi':'mid';}            // teal >=7, burnt orange below (no red)
function rfxScoreDistByCat(si){var totalW=RFX.requirements.reduce(function(a,r){return a+r.weight;},0);
 return rfxCats().map(function(cat){var rs=RFX.requirements.filter(function(r){return r.category===cat;});
  var d={5:0,4:0,3:0,2:0,1:0,0:0},fully=0,gateFail=false,w=0;
  rs.forEach(function(r){var v=rfxRqScore(si,r.id),b=(v==null?0:v);d[b]++;w+=r.weight;if(b>=4)fully++;if(r.mandatory&&(v==null||v<=2))gateFail=true;});
  return {cat:cat,weightPct:totalW?Math.round(w/totalW*100):0,total:rs.length,d:d,coveragePct:rs.length?Math.round(fully/rs.length*100):0,gateFail:gateFail};});}
function rfxRptSection(sec){var esc=escapeHtmlPV;
 var h='<div class="sect"><div class="secthd"><div class="t">'+esc(sec.title)+'</div>'+(sec.hint?'<div class="lk">'+esc(sec.hint)+'</div>':'')+'</div>';
 h+='<div class="card"><div class="rshd">'+(sec.score!=null?'<span class="rscore '+rfxScoreCls(sec.score)+'" style="margin-left:0;order:-1">'+sec.score+'<small>/10</small></span>':'<span style="flex:none;width:1px"></span>')+'<span class="rn">'+esc(sec.rn||sec.title)+'</span>'+(sec.sub?'<span class="rsub">'+esc(sec.sub)+'</span>':'')+'</div>';
 h+='<div class="rsgrid"><div>';
 if(sec.priceblk){var pb=sec.priceblk;h+='<div class="priceblk"><div class="pn">'+esc(pb.pn)+(pb.unit?'<small>'+esc(pb.unit)+'</small>':'')+'</div><div class="psub">'+pb.psub+'</div></div>';
  if(pb.terms)h+='<div class="pterms">'+pb.terms.map(function(t){return '<div class="pt"><span class="k">'+esc(t[0])+'</span><span class="v">'+esc(t[1])+'</span></div>';}).join('')+'</div>';}
 if(sec.facts)h+='<div class="ovfacts" style="margin-bottom:12px">'+sec.facts.map(function(f){return '<div class="ovfact"><div class="glabhd" style="margin-bottom:3px">'+esc(f[0])+'</div><div class="val'+(f[2]?' '+f[2]:'')+'">'+esc(f[1])+'</div></div>';}).join('')+'</div>';
 (sec.summary||[]).forEach(function(p,i){var last=(i===sec.summary.length-1)&&!sec.comp;h+='<p class="ovnarr"'+(last?' style="margin-bottom:0"':'')+'>'+p+'</p>';});
 if(sec.comp)h+='<div class="comp">'+sec.comp.map(function(cc){return '<div class="cr"><div class="ck">'+esc(cc[0])+'</div><div class="cv">'+cc[1]+'</div></div>';}).join('')+'</div>';
 h+='</div><div class="rmargin"><div class="rmlab">Theo’s read</div>';
 (sec.read||[]).forEach(function(r){var ic=r.cls==='pos'?'✓':r.cls==='gap'?'✗':'!';h+='<div class="apt '+r.cls+'"><span class="ic">'+ic+'</span><div>'+r.html+'</div></div>';});
 if(sec.deeper)h+='<details><summary>Deeper analysis</summary><p>'+sec.deeper+'</p></details>';
 h+='</div></div></div></div>';return h;}
// Round-3 rework (Marc item 5): Revenue and Employees now stack in ONE facts-grid cell (Revenue
// above Employees, same column); Public Risk Markers moves UP beside the facts (top of the panel,
// on the right), no longer buried below Leadership; the "Analyst" datapoint (a marketing rating, not
// a procurement-decision signal) is REPLACED with Years in business, deterministically derived from
// the vendor's own `founded` year, never fabricated, and available for every supplier that carries a
// founded year (all three do). If founded is absent, the slot is simply omitted, not guessed.
function rfxYearsInBiz(founded){var y=parseInt(String(founded||'').replace(/[^0-9]/g,''),10);if(!y||y<1900||y>2100)return null;var now=2026;var yrs=now-y;if(yrs<0)return null;return yrs+' yrs (since '+y+')';}
function rfxRptProfile(s,prof){var esc=escapeHtmlPV,pr=s.profile||{};
 function fact(k,v){return '<div class="ovfact"><div class="glabhd" style="margin-bottom:3px">'+esc(k)+'</div><div class="val">'+esc(v)+'</div></div>';}
 var yib=rfxYearsInBiz(pr.founded);
 var top=[];
 if(pr.hq)top.push(fact('Headquarters',pr.hq));
 if(pr.founded)top.push(fact('Founded',pr.founded));
 if(pr.ownership)top.push(fact('Ownership',pr.ownership));
 if(yib)top.push(fact('Years in business',yib));
 if(pr.revenue||pr.employees){
  var stack='<div class="ovfact">';
  if(pr.revenue)stack+='<div class="glabhd" style="margin-bottom:3px">Revenue</div><div class="val">'+esc(pr.revenue)+'</div>';
  if(pr.employees)stack+='<div class="glabhd" style="margin-bottom:3px'+(pr.revenue?';margin-top:10px':'')+'">Employees</div><div class="val">'+esc(pr.employees)+'</div>';
  stack+='</div>';
  top.push(stack);
 }
 var factsHTML=top.length?'<div class="ovfacts" style="grid-template-columns:repeat(auto-fit,minmax(126px,1fr))">'+top.join('')+'</div>':'';
 var riskHTML='';
 if(prof.risk)riskHTML='<div class="glabhd" style="margin-bottom:5px">Public risk markers</div><div class="risk">'+prof.risk.map(function(r){return '<div class="rr"><span class="dot '+r.sev+'"></span><span class="cat">'+esc(r.cat)+'</span><span class="tx">'+esc(r.tx)+'</span><span class="rsev '+r.sev+'">'+esc(r.sevlabel)+'</span></div>';}).join('')+'</div>';
 var h='<div class="sect"><div class="secthd"><div class="t">Company profile</div><div class="lk">Landscape vendor record</div></div>';
 h+='<div class="card"><div class="rshd">'+rfxSupplierSwatchByName(s.n)+'<span class="rn">'+esc(s.n)+'</span><span class="rsub">vendor profile &amp; financials · not the RFP response</span>'+(prof.score!=null?'<span class="rscore '+rfxScoreCls(prof.score)+'">'+prof.score+'<small>/10</small></span>':'')+'</div>';
 if(factsHTML||riskHTML)h+='<div class="cprow" style="grid-template-columns:1.5fr 1fr;margin-bottom:2px">'+(factsHTML?'<div>'+factsHTML+'</div>':'<div></div>')+(riskHTML?'<div>'+riskHTML+'</div>':'<div></div>')+'</div>';
 var lft='';
 var topSpacer=(factsHTML||riskHTML)?'15px':'0';
 if(prof.leadership)lft+='<div class="glabhd" style="margin-bottom:8px;margin-top:'+topSpacer+'">Leadership</div><div class="lead">'+prof.leadership.map(function(l){return '<div class="p">'+l+'</div>';}).join('')+'</div>';
 if(prof.backers)lft+='<div class="glabhd" style="margin:'+(prof.leadership?'14px':topSpacer)+' 0 8px">Backers &amp; partners</div><div class="chips">'+prof.backers.map(function(b){return '<span class="chip'+(b.hl?' hl':'')+'">'+esc(b.t)+'</span>';}).join('')+'</div>';
 h+=lft;
 if(prof.read)h+='<div class="read" style="margin-top:15px"><div class="rl">The read</div>'+prof.read+'</div>';
 h+='</div></div>';return h;}
function rfxRptOverall(ov){var esc=escapeHtmlPV;
 var h='<div class="sect"><div class="secthd"><div class="t">Overall analysis &amp; recommendation</div></div><div class="card">';
 if(ov.take)h+='<div class="take">'+ov.take+'</div>';
 (ov.narr||[]).forEach(function(p){h+='<p class="ovnarr">'+p+'</p>';});
 if(ov.steps){h+='<div class="subh">What has to happen</div><div style="font-size:11.5px;color:var(--mut);margin-bottom:6px">Theo has drafted the clarifications below, in priority order. Nothing is sent on your behalf.</div>';
  ov.steps.forEach(function(st){h+='<div class="clr"><span class="pr '+st.prcls+'">'+esc(st.pr)+'</span><div><span class="ct">'+esc(st.cat)+'</span><span class="q">'+st.q+'</span></div></div>';});}
 if(ov.close)h+='<p class="rbody">'+ov.close+'</p>';
 h+='</div></div>';return h;}
function rfxRptStrengths(rep){var h='<div class="sect"><div class="secthd"><div class="t">Key strengths &amp; concerns</div></div><div class="card"><div class="sc2"><div class="s"><div class="sctitle s">Key strengths</div><ul>';
 (rep.strengths||[]).forEach(function(x){h+='<li><span class="i">✓</span><div>'+x+'</div></li>';});
 h+='</ul></div><div class="dv"></div><div class="c"><div class="sctitle c">Key concerns</div><ul>';
 (rep.concerns||[]).forEach(function(x){h+='<li><span class="i">'+(x.i||'!')+'</span><div>'+x.html+'</div></li>';});
 h+='</ul></div></div></div></div>';return h;}
// Round-2 #15 (Marc): the standalone "Section scorecard" panel is REMOVED. Its per-section
// [name, score, rationale] rows now BECOME the collapsed state of the accordion over the
// Response-Summary sections (rfxRptSectionAccordion below), name-matched to the section it scores
// (rfxScRowFor) so the same score+one-liner that used to live in a separate table now sits right on
// the section it describes, and stays reachable, never repeated twice.
function rfxScRowFor(rep,sec,idx){
 if(!rep||!rep.scorecard)return null;
 var t=String(sec.title||'').toLowerCase();
 for(var i=0;i<rep.scorecard.length;i++){
  var label=String(rep.scorecard[i][0]||'').toLowerCase();
  if(idx===0&&label.indexOf('requirements matrix')>=0)return rep.scorecard[i];   // the scorecard's "Requirements matrix" row always scores the Response Assessment section
  if(label===t)return rep.scorecard[i];
  var la=label.split(/[\s/]+/)[0],lt=t.split(/[\s/]+/)[0];
  if((la&&t.indexOf(la)>=0)||(lt&&label.indexOf(lt)>=0))return rep.scorecard[i];
 }
 return null;
}
// Round-2 #16 (Marc): the Response-Summary sections render as an ACCORDION, native <details
// name="rfxresp"> (only one open at a time), collapsed = the section's scorecard-style one-liner
// (name + score + rationale sentence), expanded = the section's full existing detail
// (rfxRptSection, unchanged). This is what makes the (previously very long) tab easy to navigate.
function rfxRptSectionAccordion(sec,scRow,isOpen){
 var esc=escapeHtmlPV;
 var score=scRow?scRow[1]:sec.score;
 var oneLiner=scRow?scRow[2]:(sec.summary&&sec.summary[0]?String(sec.summary[0]).replace(/<[^>]*>/g,'').split('. ')[0]+'.':'');
 // Round-3 rework (Marc item 6): the score sits FIRST, in a fixed-width slot, so every section's
 // score lines up in one scannable left column regardless of title length.
 var summary='<summary style="cursor:pointer;padding:12px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
  +'<span style="flex:0 0 38px;width:38px;text-align:center">'+(score!=null?'<span class="badge '+rfxScoreCls(score)+'" style="font-size:10.5px">'+score+'<small>/10</small></span>':'<span style="color:var(--mut2);font-size:11px">–</span>')+'</span>'
  +'<span style="font-weight:700;font-size:13px">'+esc(sec.title)+'</span>'
  +'<span style="flex:1 1 260px;min-width:0;font-size:11.5px;color:var(--mut);line-height:1.4">'+oneLiner+'</span></summary>';
 return '<details class="card rfxcase-acc" name="rfxresp" style="margin:0 0 10px;padding:0;overflow:hidden"'+(isOpen?' open':'')+'>'+summary+'<div>'+rfxRptSection(sec)+'</div></details>';
}
function rfxRptCoverage(si){var esc=escapeHtmlPV,dist=rfxScoreDistByCat(si);
 var tot={5:0,4:0,3:0,2:0,1:0},totReqs=0,totW=0,totFully=0,anyNa=false;
 var body=dist.map(function(d){tot[5]+=d.d[5];tot[4]+=d.d[4];tot[3]+=d.d[3];tot[2]+=d.d[2];tot[1]+=d.d[1];totReqs+=d.total;totW+=d.weightPct;totFully+=(d.d[5]+d.d[4]);if(d.d[0])anyNa=true;
  var assess=d.gateFail?'<span class="pcell em">Gate</span>':d.coveragePct>=100?'Full':d.coveragePct>=50?'<span class="pcell em">Partial</span>':'<span class="pcell em">Weak</span>';
  return '<tr><td>'+esc(titleCase(d.cat))+'</td><td class="n">'+d.weightPct+'%</td><td class="n">'+d.total+'</td><td class="n">'+d.d[5]+'</td><td class="n">'+d.d[4]+'</td><td class="n">'+d.d[3]+'</td><td class="n">'+d.d[2]+'</td><td class="n">'+d.d[1]+'</td><td class="n pcell '+(d.coveragePct>=90?'pos':'em')+'">'+d.coveragePct+'%</td><td>'+assess+'</td></tr>';}).join('');
 var totCov=totReqs?Math.round(totFully/totReqs*100):0;
 var h='<div class="sect"><div class="secthd"><div class="t">Requirements coverage by category</div><div class="lk">'+totReqs+' requirements · weighted</div></div><div class="card"><table class="grid"><thead>';
 h+='<tr><th rowspan="2" style="vertical-align:bottom">Category</th><th rowspan="2" class="n" style="vertical-align:bottom">Wt</th><th rowspan="2" class="n" style="vertical-align:bottom">Reqs</th><th colspan="5" class="n" style="border-bottom:1px solid var(--line)">Requirements at each score</th><th rowspan="2" class="n" style="vertical-align:bottom">Coverage</th><th rowspan="2" style="vertical-align:bottom">Assess</th></tr>';
 h+='<tr><th class="n">5</th><th class="n">4</th><th class="n">3</th><th class="n">2</th><th class="n">1</th></tr></thead><tbody>'+body;
 h+='<tr style="border-top:2px solid var(--line2);font-weight:800"><td>Total</td><td class="n">100%</td><td class="n">'+totReqs+'</td><td class="n">'+tot[5]+'</td><td class="n">'+tot[4]+'</td><td class="n">'+tot[3]+'</td><td class="n">'+tot[2]+'</td><td class="n">'+tot[1]+'</td><td class="n pcell">'+totCov+'%</td><td>–</td></tr>';
 h+='</tbody></table><div class="tnote">The five score columns show how many of the category’s requirements landed at each level: <b>5</b> fully meets, <b>4</b> exceeds, <b>3</b> meets, <b>2</b> partially meets, <b>1</b> minimal. Coverage is the share scoring 4 or 5.'+(anyNa?' Requirements with no response are omitted from the score columns.':'')+'</div></div></div>';
 return h;}
function rfxSupplierReportHTML(si){var R=RFX,s=R.suppliers[si],rep=s.report,esc=escapeHtmlPV;
 if(!rep)return rfxAnalysisIndividualLegacyHTML();
 var c=rfxCoverage(si),rl=rfxRiskLevel(si),gateFail=(s.mustFail&&s.mustFail.length>0);
 var h='<div class="rfxrpt">';
 h+='<div class="rtitle"><span class="nm">'+esc(s.n)+'</span>'+(rep.pill?'<span class="pill">'+esc(rep.pill)+'</span>':'')+(rep.stage?'<span class="stage">'+esc(rep.stage)+'</span>':'')+'</div>';
 h+='<div class="kstrip">';
 h+='<div class="card kc teal"><div class="kl">Coverage · first-pass</div><div class="kn">'+(c.answered===0?'–':c.coveragePct+'%')+'</div><div class="ks">'+c.fully+' of '+c.total+' fully met</div></div>';
 h+='<div class="card kc '+(gateFail?'emph':'teal')+'"><div class="kl">Requirements gate</div><div class="kn">'+(gateFail?'Fail':'Pass')+'</div><div class="ks">'+(gateFail?esc(s.mustFail.join(', ')):'no Must-Have gaps')+'</div></div>';
 h+='<div class="card kc '+((rl==='critical'||rl==='high')?'emph':'')+'"><div class="kl">Risk level</div><div class="kn">'+rl.charAt(0).toUpperCase()+rl.slice(1)+'</div><div class="ks">'+(c.conforming?'Conforming':'Non-conforming')+' · from WwTP review</div></div>';
 h+='<div class="card kc"><div class="kl">Completeness</div><div class="kn">'+c.completenessPct+'%</div><div class="ks">'+c.answered+' of '+c.total+' answered</div></div>';
 h+='</div>';
 h+='<p class="srcnote">Risk is sourced from the supplier’s Working with Third Parties (WwTP) review when one is on file; the panel score appears here once evaluators submit.</p>';
 if(rep.lede)h+='<p class="lede">'+rep.lede+'</p>';
 if(rep.gate)h+='<div class="gatebar"><span class="gi">!</span><div>'+rep.gate+'</div></div>';
 // Round-2 #16 (Marc) reorder, high-level to granular: Evaluation (the overall take/recommendation
 // + Key strengths & concerns) MOVES to the top, right under the KPI strip/lede/gate, so the reader
 // gets the verdict before the section-by-section detail. Response Summary follows as an accordion.
 h+='<div class="grp"><span class="gt">Evaluation</span><span class="gsub">Theo’s grade and recommendation</span></div>';
 if(rep.overall)h+=rfxRptOverall(rep.overall);
 if(rep.strengths||rep.concerns)h+=rfxRptStrengths(rep);
 h+='<div class="grp"><span class="gt">Response Summary</span><span class="gsub">their submission, section by section, click to expand</span></div>';
 (rep.sections||[]).forEach(function(sec,i){
   h+=rfxRptSectionAccordion(sec,rfxScRowFor(rep,sec,i),i===0);
   // Round-2 #14 (Marc): Company Profile moves to just AFTER the Response Assessment panel (the
   // first Response-Summary section), not after every section as before.
   if(i===0&&rep.profile)h+=rfxRptProfile(s,rep.profile);
 });
 h+=rfxRptCoverage(si);
 h+='</div>';
 return h;}
function rfxAnalysisIndividualHTML(){var si=(RFX_DD>=0&&RFX_DD<RFX.suppliers.length)?RFX_DD:0;return rfxSupplierReportHTML(si);}
function rfxAnalysisIndividualLegacyHTML(){var R=RFX;var rank=rfxReqRanking();
 var si=(RFX_DD>=0&&RFX_DD<R.suppliers.length)?RFX_DD:0;
 var rankIdx=rank.indexOf(si);if(rankIdx<0)rankIdx=0;
 var s=R.suppliers[si],c=rfxCoverage(si),tier=rfxAwardTier(si,rankIdx),rl=rfxRiskLevel(si);
 var h='';
 // Increment 7: the supplier tab IS the selector now; the dropdown is retired. Header keeps the tier/rank line.
 h+='<div class="card" style="margin-bottom:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="font-weight:800;font-size:15px;color:var(--ink)">'+escapeHtmlPV(s.n)+'</div><span style="font-size:11.5px;color:var(--mut2)">Advisory tier: <b style="color:'+tier.col+'">'+escapeHtmlPV(tier.label)+'</b> · rank '+(rankIdx+1)+' of '+R.suppliers.length+'</span></div>';
 // internal-context strip shown ONCE at top
 h+=rfxLillyCtxHTML(si);
 // sticky in-page jump-nav (scrollIntoView; avoids hash-router side effects)
 var nav=[['sum','Response summary & profile'],['fit','Requirements fit'],['sgr','Strengths, gaps & risks'],['com','Commercial & operational'],['clr','Clarifications']];
 h+='<div style="position:sticky;top:0;z-index:4;background:var(--bg,#FBFAF9);border:1px solid var(--line2,#E0DCD5);border-radius:9px;padding:7px 10px;margin:12px 0;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="font:700 8px var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2)">Jump to</span>'+nav.map(function(n){return '<span onclick="var el=document.getElementById(\'rfxi-'+n[0]+'\');if(el)el.scrollIntoView({behavior:\'smooth\',block:\'start\'})" style="cursor:pointer;font-size:11px;font-weight:600;color:var(--plum);padding:2px 8px;border-radius:30px;background:rgba(92,43,80,.08)">'+escapeHtmlPV(n[1])+'</span>';}).join('')+'</div>';
 // 1) Response summary & profile, 5 metric header + company overview + advisory assessment
 var pr=s.profile||{};
 h+='<div id="rfxi-sum" class="sect"><div class="secthd"><div class="t">Response Summary &amp; Profile</div></div>';
 h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:9px;margin-bottom:12px">';
 h+=rfxKpi('Coverage rate',c.answered===0?'Not scored':c.coveragePct+'%',c.fully+' / '+c.total+' fully meets',c.answered===0?'':c.coveragePct>=90?'good':c.coveragePct>=70?'amber':'warn');
 h+=rfxKpi('Fully meets',c.fully+' / '+c.total,'requirements at 4–5');
 h+=rfxKpi('Weighted fit',c.weightedFit+' / 100','category-weighted',c.weightedFit>=80?'good':c.weightedFit>=60?'amber':'warn');
 h+=rfxKpi('Completeness',c.completenessPct+'%',c.mandAns+' / '+c.mandTotal+' mandatory answered');
 h+=rfxKpi('Risk level',rl.charAt(0).toUpperCase()+rl.slice(1),c.conforming?'Conforming':'Non-conforming',(rl==='critical'||rl==='high')?'warn':rl==='medium'?'amber':'');
 h+='</div>';
 h+='<div class="card"><div style="font-weight:700;font-size:13px;margin-bottom:8px">Company Overview &amp; Advisory Assessment</div><div class="kv"><div class="k">Headquarters</div><div class="v">'+escapeHtmlPV(pr.hq||'-')+'</div><div class="k">Founded</div><div class="v">'+escapeHtmlPV(pr.founded||'-')+'</div><div class="k">Employees</div><div class="v">'+escapeHtmlPV(pr.employees||'-')+'</div><div class="k">Revenue</div><div class="v">'+escapeHtmlPV(pr.revenue||'-')+'</div><div class="k">Ownership</div><div class="v">'+escapeHtmlPV(pr.ownership||'-')+'</div><div class="k">Analyst</div><div class="v">'+escapeHtmlPV(pr.analyst||'-')+'</div></div><div style="margin-top:11px;padding:10px 12px;border-radius:9px;background:'+tier.bg+';border:1px solid '+tier.col+'30"><span style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:'+tier.col+'">Advisory assessment · '+escapeHtmlPV(tier.label)+'</span><div style="font-size:12.5px;color:var(--ink);line-height:1.5;margin-top:5px">'+rfxRecoText(si,rankIdx)+'</div></div></div></div>';
 // 2) Requirements fit, per-category coverage table (driven by their responses)
 var roll=rfxCatRollup(si);
 h+='<div id="rfxi-fit" class="sect"><div class="secthd"><div class="t">Requirements fit · per category</div></div><div class="mxwrap"><table class="mx" style="width:100%;min-width:640px"><thead><tr><th style="text-align:left">Category</th><th>Requirements</th><th>Fully</th><th>Partial</th><th>Does not</th><th>Not answered</th><th>Coverage %</th></tr></thead><tbody>'+roll.map(function(r){return '<tr><td style="text-align:left;font-weight:600">'+escapeHtmlPV(titleCase(r.cat))+'</td><td>'+r.total+'</td><td>'+r.fully+'</td><td>'+r.partial+'</td><td>'+r.doesNot+'</td><td>'+r.na+'</td><td style="font-weight:700;color:'+(c.answered===0?'var(--mut2)':rfxPcCol(r.coveragePct))+'">'+(c.answered===0?'-':r.coveragePct+'%')+'</td></tr>';}).join('')+'</tbody></table></div></div>';
 // 3) Strengths, gaps & risks, strengths (top by weight) · gaps (does-not / not-answered) · response-grounded red flags
 var st=rfxStrengths(si),gp=rfxGaps(si),fl=(pr.redFlags||[]);
 h+='<div id="rfxi-sgr" class="sect"><div class="secthd"><div class="t">Strengths, gaps &amp; risks</div></div>';
 h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:10px">';
 h+='<div class="card" style="margin:0"><div style="font-weight:700;font-size:12.5px;margin-bottom:7px">Strengths</div>'+(st.length?st.map(function(r){return '<div style="font-size:12px;line-height:1.5;margin-bottom:5px;display:flex;gap:7px"><span style="color:var(--plum);font-weight:700">✓</span><span>'+escapeHtmlPV(r.text)+' <span style="color:var(--mut2)">('+escapeHtmlPV(r.category)+')</span></span></div>';}).join(''):'<div style="font-size:12px;color:var(--mut2)">No fully-met requirements recorded.</div>')+'</div>';
 h+='<div class="card" style="margin:0"><div style="font-weight:700;font-size:12.5px;margin-bottom:7px">Gaps</div>'+(gp.length?gp.map(function(r){var lvl=rfxLevel(si,r.id);return '<div style="font-size:12px;line-height:1.5;margin-bottom:6px;display:flex;gap:7px;align-items:baseline"><span style="font:700 8px var(--mono);text-transform:uppercase;padding:2px 6px;border-radius:30px;white-space:nowrap;color:'+(lvl==='na'?'var(--mut2)':'#C8202E')+';background:'+(lvl==='na'?'#EFECE8':'var(--pink-t,#FBE7E3)')+'">'+escapeHtmlPV(rfxLevelLabel(lvl))+'</span><span>'+escapeHtmlPV(r.text)+(r.mandatory?' <b style="color:#C8202E">· Must-have</b>':'')+'</span></div>';}).join(''):'<div style="font-size:12px;color:var(--mut2)">No gaps, fully meets every requirement.</div>')+'</div>';
 h+='</div>';
 h+='<div class="card"><div style="font-weight:700;font-size:12.5px;margin-bottom:7px">Red Flags <span style="font-weight:500;color:var(--mut2);font-size:11px">· response-grounded</span></div>'+(fl.length?fl.map(function(f){return '<div class="obrow high" style="margin-bottom:7px"><div class="obd" style="margin:0">'+escapeHtmlPV(f)+'</div></div>';}).join(''):'<div style="font-size:12px;color:var(--mut2)">No red flags recorded for this supplier.</div>')+'</div></div>';
 // 4) Commercial & operational, pricing + legal + implementation + integration
 var pc=s.pricing||{},nr=s.narr||{};
 h+='<div id="rfxi-com" class="sect"><div class="secthd"><div class="t">Commercial &amp; operational</div></div><div class="card"><div class="kv"><div class="k">Pricing model</div><div class="v">'+rfxPriceVal(pc.model)+'</div><div class="k">Annual fee</div><div class="v">'+rfxPriceVal(pc.annual)+'</div><div class="k">List price</div><div class="v">'+rfxPriceVal(pc.list)+'</div><div class="k">Discount</div><div class="v">'+rfxPriceVal(pc.discount)+'</div><div class="k">Implementation</div><div class="v">'+rfxPriceVal(pc.impl)+'</div><div class="k">Term</div><div class="v">'+rfxPriceVal(pc.terms)+'</div><div class="k">Escalator</div><div class="v">'+rfxPriceVal(pc.escalator)+'</div><div class="k">Pricing binding</div><div class="v">'+rfxPriceVal(pc.binding)+'</div></div><div style="margin-top:11px;display:grid;gap:9px"><div><span class="dicolh">Legal &amp; contracting</span><div style="font-size:12.5px;color:var(--mut);line-height:1.5">'+escapeHtmlPV(nr.legal||'No legal narrative on file for this supplier.')+'</div></div><div><span class="dicolh">Implementation</span><div style="font-size:12.5px;color:var(--mut);line-height:1.5">'+escapeHtmlPV(nr.impl||'No implementation narrative on file.')+'</div></div><div><span class="dicolh">Integration with the Lilly stack</span><div style="font-size:12.5px;color:var(--mut);line-height:1.5">'+escapeHtmlPV(nr.integ||'No integration narrative on file.')+'</div></div></div></div></div>';
 h+=rfxIndivZopaHTML(si);   // #73: this supplier's individual ZOPA (bar format)
 // 5) Clarifications, DRAFT candidates, prioritized (authored here once; rolled up in Cross-supplier)
 var cl=rfxFlags(si).slice().sort(function(a,b){var o={GATING:0,HIGH:1,MEDIUM:2};return o[a.priority]-o[b.priority];});
 h+='<div id="rfxi-clr" class="sect"><div class="secthd"><div class="t">Clarifications</div></div><div class="card"><div class="spnote" style="margin:0 0 9px">DRAFT questions, prioritized by impact. GATING items must be resolved before this supplier can advance. Drafts for your review; nothing is sent on your behalf.</div>'+(cl.length?cl.map(function(f){return '<div class="obrow '+(f.priority==='GATING'?'high':f.priority==='HIGH'?'med':'low')+'" style="margin-bottom:7px"><div class="obhd">'+rfxPrioPill(f.priority)+'<span class="obn" style="font-size:12.5px">'+escapeHtmlPV(f.category)+'</span></div><div class="obd" style="margin:6px 0 0">'+escapeHtmlPV(f.detail)+'</div></div>';}).join(''):'<div style="font-size:12px;color:var(--mut2)">No clarification candidates, fully meets every requirement.</div>')+'</div></div>';
 return h;
}
// Increment 5: shared annual-price parser (used by the value map + the read).
function rfxAnnualNum(si){var p=RFX.suppliers[si].pricing;var a=p&&p.annual;if(a==null)return null;var s=String(a);if(/not submitted/i.test(s))return null;var n=parseFloat(s.replace(/[^0-9.]/g,''));return (isFinite(n)&&n>=1000)?n:null;}
// Increment 5: the narrative "read" head for Compare. Data-bound synthesis from the same helpers the grids
// use (ranking, coverage, gate, price), so it cannot drift from the evidence below. Advisory / reflect-only.
function rfxCompareReadHTML(){var R=RFX;
 function nm(si){return escapeHtmlPV(R.suppliers[si].n);}
 function sc(si){var v=(typeof rfxWeighted==='function'?rfxWeighted(si):rfxCoverage(si).weightedFit/20);return v.toFixed(1);}
 // The panel's weighted 0-5 score is the binding read of who leads; a Must-Have gate can bar the top score.
 var scored=R.suppliers.map(function(s,si){return {si:si,v:(typeof rfxWeighted==='function'?rfxWeighted(si):rfxCoverage(si).weightedFit/20),gate:rfxGatePass(si),priced:rfxAnnualNum(si)!=null};});
 var byScore=scored.slice().sort(function(a,b){return b.v-a.v;});
 var top=byScore[0];
 var gpLeader=(typeof rfxGatePassLeader==='function'?rfxGatePassLeader():-1);
 if(gpLeader<0){var g=byScore.filter(function(x){return x.gate;})[0];gpLeader=g?g.si:-1;}
 var parts=[];
 // Ranking policy: the top panel score is always Theo's recommendation, gate or no gate. A gate fail
 // is a flag on the leader (a business-call note), never a reason to drop to a lower-scoring bidder.
 if(top.gate){
   parts.push('<b>'+nm(top.si)+'</b> is Theo&rsquo;s recommendation: the highest panel score in the field ('+sc(top.si)+'/5) and clean on every Must-Have.');
   if(byScore[1] && byScore[1].si!==top.si) parts.push('<b>'+nm(byScore[1].si)+'</b> is next at '+sc(byScore[1].si)+'/5.');
 } else if(gpLeader>=0 && gpLeader!==top.si) {
   var mf=(R.suppliers[top.si].mustFail||[]).join(', ');
   parts.push('<b>'+nm(top.si)+'</b> is Theo&rsquo;s recommendation, the top panel score in the field ('+sc(top.si)+'/5), but it carries an open <b>Must-Have gate</b> ('+escapeHtmlPV(mf)+'). The #1 rank is on merit; the gate is flagged, not a demotion.');
   parts.push('<b>'+nm(gpLeader)+'</b> is the highest-scored bidder that clears every Must-Have ('+sc(gpLeader)+'/5), the clean conforming alternative if the panel prefers to avoid the gate risk.');
   parts.push('<b>Business call:</b> the panel can proceed with <b>'+nm(top.si)+'</b> and accept the gate risk, or secure a dated commitment to close '+escapeHtmlPV(mf)+', or select <b>'+nm(gpLeader)+'</b> instead. Theo leads with <b>'+nm(top.si)+'</b> on the score but the choice is the panel&rsquo;s.');
 } else {
   var mf2=(R.suppliers[top.si].mustFail||[]).join(', ');
   parts.push('<b>'+nm(top.si)+'</b> is Theo&rsquo;s recommendation on the top panel score ('+sc(top.si)+'/5), but it carries an open <b>Must-Have gate</b> ('+escapeHtmlPV(mf2)+') and no conforming bidder exists as a clean alternative. <b>Business call:</b> the panel must accept the gate risk or secure a dated remediation before the field can produce a defensible award.');
 }
 var last=byScore[byScore.length-1];
 if(last && last.si!==top.si && last.si!==gpLeader) parts.push('<b>'+nm(last.si)+'</b> scores well behind ('+sc(last.si)+'/5)'+(!last.priced?' and has not submitted a price':'')+', so it is not a contender on today&rsquo;s evidence.');
 var h='<div class="sect"><div class="secthd"><div class="t">The assessment</div><span style="font:600 11px var(--mono);color:var(--mut2)">advisory &middot; reflect-only &middot; panel scoring + gate</span></div>';
 h+='<div class="card"><div style="font-size:13px;line-height:1.62;color:var(--ink)">'+parts.join(' ')+'</div></div></div>';
 return h;
}
// Increment 4: data-bound value map (Field at a glance). x = weighted fit; y = annual price (lower = up);
// dot size = coverage; a Must-Have gate fail gets a red ring; a bidder with no submitted price is NOT placed
// on the price axis (honest) but shown as a hollow dot in a "price not submitted" lane, by fit only.
function rfxValueMapHTML(){var R=RFX,esc=escapeHtmlPV;
 function fmtP(n){return n>=1e6?('$'+(n/1e6).toFixed(2)+'M'):('$'+Math.round(n/1000)+'K');}
 // ANCHORED ON PANEL SCORE (the binding evaluation). Theo's weighted-fit is a secondary advisory overlay (note below).
 var sup=R.suppliers.map(function(s,si){var c=rfxCoverage(si);return {si:si,name:s.n,ps:rfxWeighted(si),fit:c.weightedFit,cov:c.coveragePct,price:rfxAnnualNum(si),gate:!rfxGatePass(si),color:(typeof pvSupColor==='function'?pvSupColor({id:s.n}):'#123C82')};});
 var priced=sup.filter(function(x){return x.price!=null;}),unpriced=sup.filter(function(x){return x.price==null;});
 var W=900,H=482,padL=74,padR=40,padT=42,plotB=348;
 var psv=sup.map(function(x){return x.ps;}),pMin=Math.min.apply(null,psv),pMax=Math.max.apply(null,psv);if(pMin===pMax){pMin-=0.5;pMax+=0.5;}
 var xLo=Math.max(0,pMin-0.4),xHi=Math.min(5,pMax+0.4);if(xHi<=xLo){xLo=0;xHi=5;}function X(v){return padL+(v-xLo)/(xHi-xLo)*(W-padL-padR);}
 var haveP=priced.length>0,pLo,pHi;
 if(haveP){var pr=priced.map(function(x){return x.price;}),pmin=Math.min.apply(null,pr),pmax=Math.max.apply(null,pr);if(pmin===pmax){pmin*=0.94;pmax*=1.06;}var sp=pmax-pmin;pLo=pmin-sp*0.35;pHi=pmax+sp*0.35;}
 function Y(p){return padT+(p-pLo)/(pHi-pLo)*(plotB-padT);}
 var g='';
 g+='<rect x="'+X(xLo+(xHi-xLo)*0.60).toFixed(0)+'" y="'+padT+'" width="'+(W-padR-X(xLo+(xHi-xLo)*0.60)).toFixed(0)+'" height="'+((plotB-padT)*0.46).toFixed(0)+'" rx="10" style="fill:var(--teal-t)" opacity="0.5"></rect>';
 g+='<text x="'+(W-padR-8)+'" y="'+(padT+15)+'" text-anchor="end" font-family="var(--mono)" font-size="10" font-weight="700" style="fill:var(--teal-d)" opacity="0.85">higher panel score &middot; lower cost</text>';
 g+='<line x1="'+padL+'" y1="'+padT+'" x2="'+padL+'" y2="'+plotB+'" style="stroke:var(--line2)" stroke-width="1.2"></line>';
 g+='<line x1="'+padL+'" y1="'+plotB+'" x2="'+(W-padR)+'" y2="'+plotB+'" style="stroke:var(--line2)" stroke-width="1.2"></line>';
 sup.forEach(function(x){g+='<text x="'+X(x.ps).toFixed(1)+'" y="'+(plotB+18)+'" text-anchor="middle" font-family="var(--mono)" font-size="10" style="fill:var(--mut2)">'+x.ps.toFixed(1)+'</text>';});
 g+='<text x="'+((padL+W-padR)/2).toFixed(0)+'" y="'+(plotB+40)+'" text-anchor="middle" font-family="var(--mono)" font-size="10.5" font-weight="700" letter-spacing="0.06em" style="fill:var(--mut2)">PANEL SCORE (0&ndash;5) &rarr;</text>';
 if(haveP){priced.forEach(function(x){g+='<text x="'+(padL-8)+'" y="'+(Y(x.price)+3).toFixed(1)+'" text-anchor="end" font-family="var(--mono)" font-size="10" style="fill:var(--mut2)">'+fmtP(x.price)+'</text>';});
  g+='<text transform="rotate(-90 22 '+((padT+plotB)/2).toFixed(0)+')" x="22" y="'+((padT+plotB)/2).toFixed(0)+'" text-anchor="middle" font-family="var(--mono)" font-size="10.5" font-weight="700" letter-spacing="0.06em" style="fill:var(--mut2)">&larr; LOWER ANNUAL PRICE</text>';}
 priced.forEach(function(x){var cx=X(x.ps),cy=Y(x.price),r=10+(x.cov/100)*11;
  if(x.gate)g+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+(r+5).toFixed(1)+'" fill="none" style="stroke:var(--emph,#C15E19)" stroke-width="2" stroke-dasharray="4 3" opacity="0.9"></circle>';
  g+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="'+x.color+'" fill-opacity="0.88" style="stroke:var(--surface)" stroke-width="2"></circle>';
  g+='<text x="'+cx.toFixed(1)+'" y="'+(cy-r-6).toFixed(1)+'" text-anchor="middle" font-size="12" font-weight="800" fill="'+x.color+'">'+esc(x.name)+'</text>';
  if(x.gate)g+='<text x="'+cx.toFixed(1)+'" y="'+(cy+r+13).toFixed(1)+'" text-anchor="middle" font-family="var(--mono)" font-size="9" font-weight="700" style="fill:var(--emph,#C15E19)">Must-Have gate fail</text>';});
 if(unpriced.length){var laneY=plotB+54,laneBoxH=66,cyDot=laneY+40;
  g+='<rect x="'+padL+'" y="'+laneY+'" width="'+(W-padR-padL)+'" height="'+laneBoxH+'" rx="8" style="fill:var(--well,#EEEAE3)" opacity="0.6"></rect>';
  g+='<text x="'+(padL+10)+'" y="'+(laneY+17)+'" font-family="var(--mono)" font-size="9" font-weight="700" letter-spacing="0.04em" style="fill:var(--mut2)">PRICE NOT SUBMITTED</text>';
  unpriced.forEach(function(x){var cx=X(x.ps);
   g+='<circle cx="'+cx.toFixed(1)+'" cy="'+cyDot.toFixed(1)+'" r="9" fill="none" style="stroke:'+x.color+'" stroke-width="2" stroke-dasharray="3 2"></circle>';
   g+='<text x="'+cx.toFixed(1)+'" y="'+(cyDot+22).toFixed(1)+'" text-anchor="middle" font-size="11" font-weight="700" fill="'+x.color+'">'+esc(x.name)+'</text>';});}
 var byFit=sup.slice().sort(function(a,b){return b.fit-a.fit;});
 var byPs=sup.slice().sort(function(a,b){return b.ps-a.ps;});
 var fitOrder=byFit.map(function(x){return esc(x.name)+' ('+x.fit+')';}).join(' &gt; ');
 var diverge=byFit[0].si!==byPs[0].si;
 var h='<div class="sect" id="rfxc-map"><div class="secthd"><div class="t">Field at a glance</div><span style="font:600 11px var(--mono);color:var(--mut2)">panel score &times; annual price &middot; dot size = coverage</span></div>';
 h+='<div class="card"><div style="overflow-x:auto"><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block;max-width:600px;margin:0 auto" font-family="var(--sans)" role="img" aria-label="Value map of panel score against annual price">'+g+'</svg></div>';
 h+='<div class="tnote" style="margin-top:8px">Upper-right is a higher panel score at lower cost. The <b>panel&rsquo;s weighted 0&ndash;5 score</b> is the binding evaluation and anchors this view; a burnt-orange ring is a Must-Have gate fail (bars award regardless of position), and a bidder with no submitted price sits in the lower lane by score only.</div>';
 h+='<div class="tnote" style="margin-top:6px">Advisory overlay: Theo&rsquo;s weighted-fit ranks '+fitOrder+'.'+(diverge?' This differs from the panel, which places <b>'+esc(byPs[0].name)+'</b> first; the divergence is the point, see the assessment.':' This agrees with the panel ranking.')+'</div></div></div>';
 return h;
}
// ---- ③ Analysis › (ii) Cross-supplier, heatmap + req grid + pricing grid + compact roll-up + gate-vs-total + Q&A ----
function rfxCrossRollupHTML(){var R=RFX,esc=escapeHtmlPV;
 function fmtM(n){return n>=1e6?('$'+(n/1e6).toFixed(2)+'M'):('$'+Math.round(n/1000)+'K');}
 var award=rfxReqRanking();                       // Theo's award-recommendation order: by panel score, gate-blind
 var rows=award.map(function(si,i){var s=R.suppliers[si],c=rfxCoverage(si),pn=rfxAnnualNum(si),gate=rfxGatePass(si);
   var price=pn!=null?fmtM(pn):'<span class="pcell em">Not submitted</span>';
   var gcell=gate?'<span class="pcell pos">Pass</span>':'<span class="pcell em">Fail</span>';
   var badges=(i===0)?' <span class="badge hi" style="font-size:8px;padding:1px 6px;vertical-align:middle">RECOMMENDED</span>'+(!gate?' <span class="badge mid" style="font-size:8px;padding:1px 6px;vertical-align:middle;background:#C8202E;color:#fff">GATE RISK</span>':''):'';
   var lead=(i===0)?' style="background:var(--pri-t)"':'';
   return '<tr'+lead+'><td style="font-weight:'+(i===0?'800':'600')+'">'+esc(s.n)+badges+'</td><td class="n" style="font-weight:800">'+rfxWeighted(si).toFixed(1)+'</td><td class="n">'+gcell+'</td><td class="n">'+(c.answered===0?'&ndash;':c.coveragePct+'%')+'</td><td class="n">'+c.completenessPct+'%</td><td class="n">'+(c.answered===0?'&ndash;':c.conforming?'<span class="pcell pos">Yes</span>':'<span class="pcell em">No</span>')+'</td><td class="n">'+price+'</td></tr>';
 }).join('');
 var h='<div class="rtitle"><span class="nm">Cross-Supplier</span><span class="stage">'+R.suppliers.length+' bidders &middot; panel evaluation in progress</span></div>';
 h+='<div class="sect"><div class="secthd"><div class="t">Field roll-up</div><div class="lk">Theo&rsquo;s recommendation order</div></div><div class="card"><table class="grid"><thead><tr><th>Supplier</th><th class="n">Panel score</th><th class="n">Gate</th><th class="n">Coverage</th><th class="n">Complete</th><th class="n">Conforming</th><th class="n">Annual price</th></tr></thead><tbody>'+rows+'</tbody></table><div class="tnote">Ordered by panel weighted score. The top scorer is <b>RECOMMENDED</b> even if it carries an open Must-Have gate, flagged <b>GATE RISK</b> rather than moved down the order; a gate is a business call for the panel, not an automatic demotion. See the assessment below.</div></div></div>';
 return h;
}
function rfxAnalysisCrossHTML(){var R=RFX;
 // Round-3 rework (Marc items 2 & 4): value map LEFT + the consolidated Commercial comparison table
 // RIGHT (2-col); Cross-Supplier ZOPA follows full-width; Risk roll-up LEFT + Coverage heatmap RIGHT
 // (2-col), each panel carrying its own narrative directly beneath it; the full Requirements Matrix
 // closes the tab as a collapsed fold.
 var h='<div class="rfxrpt">';
 h+=rfxCrossRollupHTML();
 h+=rfxCompareReadHTML();
 h+='<div class="grp"><span class="gt">Value &amp; Cost</span><span class="gsub">panel score against price, and the commercial comparison, side by side</span></div>';
 h+='<div class="xs2col-comm"><div>'+rfxValueMapHTML()+'<div class="card xs-read"><div class="xs-ins">'+rfxValueCostInsight()+'</div></div></div><div>'+rfxCommercialComparisonHTML()+'</div></div>';
 h+=rfxNormZopaHTML();
 h+='<div class="grp"><span class="gt">Risk &amp; Capability</span><span class="gsub">risk roll-up and category coverage, side by side, each with its own read beneath</span></div>';
 h+='<div class="xs2col-hm"><div>'+rfxRiskCompactHTML()+'</div><div>'+rfxHeatmapHTML()+'</div></div>';
 h+='<details class="xs-fold"><summary>See the full Requirements Matrix, '+R.requirements.length+' requirements</summary>'+rfxReqMatrixHTML()+'</details>';
 h+='</div>';
 return h;
}
// Risk roll-up (Analysis > Cross-Supplier). Round-3 rework (Marc item 4): rebuilt as a COMPACT
// table (one row per supplier: risk level, conforming, red-flags count, gating count, click to open
// the deep-dive), matching the Coverage heatmap's density so the two sit side by side; the narrative
// (which supplier carries the field's risk, how many gating items are open, who's cleanest) lives
// directly BENEATH the table inside this SAME panel, materialized from the same rfxCoverage / rfxFlags
// / rfxRiskLevel helpers the table reads, so it can never drift from the numbers above it.
function rfxRiskCompactHTML(){var R=RFX,esc=escapeHtmlPV;
 var rows=R.suppliers.map(function(s,si){
   var c=rfxCoverage(si),rl=rfxRiskLevel(si),fl=rfxFlags(si),gating=fl.filter(function(f){return f.priority==='GATING';}).length,pr=s.profile||{},redFlags=(pr.redFlags||[]).length;
   var rlHigh=(rl==='critical'||rl==='high');
   var rlCol=rlHigh?'#C8202E':rl==='medium'?'#8A5A00':'var(--plum)';
   var rlBg=rlHigh?'var(--pink-t,#FBE7E3)':rl==='medium'?'var(--amber-t,#FBF1DA)':'rgba(92,43,80,.10)';
   var confChip=c.answered===0?rfxChip('Pending','var(--mut2)','#EFECE8'):rfxChip(c.conforming?'Conforming':'Non-conforming',c.conforming?'var(--plum)':'#C8202E',c.conforming?'rgba(92,43,80,.10)':'var(--pink-t,#FBE7E3)');
   return '<tr onclick="rfxAv('+si+')" style="cursor:pointer" title="Open '+esc(s.n)+'&rsquo;s deep-dive"><td style="text-align:left;font-weight:600">'+esc(s.n)+'</td><td class="n">'+rfxChip(rl.charAt(0).toUpperCase()+rl.slice(1),rlCol,rlBg)+'</td><td class="n">'+confChip+'</td><td class="n">'+redFlags+'</td><td class="n">'+gating+'</td></tr>';
 }).join('');
 var gatedCount=R.suppliers.filter(function(s){return s.mustFail&&s.mustFail.length;}).length;
 return '<div class="sect"><div class="secthd"><div class="t">Risk roll-up</div>'+rfxCap('response-grounded · click a row to open the deep-dive')+'</div><div class="card"><div class="mxwrap"><table class="mx" style="width:100%"><thead><tr><th style="text-align:left">Supplier</th><th>Risk level</th><th>Conforming</th><th>Red flags</th><th>Gating</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
  +'<div class="xs-ins" style="margin-top:11px">'+rfxRiskInsight()+'</div>'
  +'<div class="spnote" style="margin-top:8px">Red-flags and gating counts are response-grounded, the same GATING-priority draft-clarification list behind each supplier&rsquo;s Analysis &rsaquo; Individual report, so this view can never drift from the evidence there.'+(gatedCount?' '+gatedCount+' of '+R.suppliers.length+' supplier(s) carry an independent Must-Have gate despite a non-trivial score, the reason the advisory ranking flags a gate risk on the leader rather than hiding it.':'')+' Reflect-only.</div></div></div>';
}
// Data-bound narrative for the Risk roll-up table above (materialized from the same helpers the
// table uses: rfxRiskLevel, rfxFlags, the vendor-profile red-flag list), so it cannot drift.
function rfxRiskInsight(){var R=RFX,esc=escapeHtmlPV;
 var ord={critical:3,high:2,medium:1,low:0,none:-1};
 var rows=R.suppliers.map(function(s,si){return {si:si,n:s.n,rl:rfxRiskLevel(si),gating:rfxFlags(si).filter(function(f){return f.priority==='GATING';}).length,redFlags:((s.profile&&s.profile.redFlags)||[]).length};});
 var parts=[];
 var worst=rows.slice().sort(function(a,b){return ord[b.rl]-ord[a.rl];})[0];
 if(worst&&(worst.rl==='critical'||worst.rl==='high'))parts.push('<b>'+esc(worst.n)+'</b> carries the field&rsquo;s highest risk read ('+worst.rl+'), with '+worst.redFlags+' red flag(s) on file'+(worst.gating?' and '+worst.gating+' open gating item(s)':'')+'.');
 var totalGating=rows.reduce(function(a,r){return a+r.gating;},0);
 if(totalGating)parts.push(totalGating+' gating clarification item(s) are open across the field, each tied to a Must-Have or high-weight requirement.');
 var clean=rows.filter(function(r){return r.rl==='none'||r.rl==='low';});
 if(clean.length)parts.push(clean.map(function(r){return '<b>'+esc(r.n)+'</b>';}).join(', ')+' carr'+(clean.length>1?'y':'ies')+' the lowest risk read in the field.');
 if(!parts.length)parts.push('No material risk flags recorded across the field in this pass.');
 return '<span class="il">Risk read</span>'+parts.join(' ');
}
// Data-bound narrative reads for the Cross-Supplier visualizations (materialized from the same helpers the
// charts use, so they cannot drift from the evidence).
function rfxValueCostInsight(){var R=RFX,esc=escapeHtmlPV;
 function fmtP(n){return n>=1e6?('$'+(n/1e6).toFixed(2)+'M'):('$'+Math.round(n/1000)+'K');}
 var sup=R.suppliers.map(function(s,si){return {si:si,n:s.n,ps:rfxWeighted(si),price:rfxAnnualNum(si),gate:!rfxGatePass(si)};});
 var priced=sup.filter(function(x){return x.price!=null;}),unpriced=sup.filter(function(x){return x.price==null;});
 var cheapest=priced.slice().sort(function(a,b){return a.price-b.price;})[0];
 var topScore=sup.slice().sort(function(a,b){return b.ps-a.ps;})[0];
 var parts=[];
 if(cheapest){var also=(topScore&&topScore.si===cheapest.si)?' and the highest-scored':'';parts.push('<b>'+esc(cheapest.n)+'</b> is the lowest-priced'+also+' at '+fmtP(cheapest.price)+'/yr, which places it upper-right on the value map.');}
 if(topScore&&topScore.gate)parts.push('Its Must-Have gate (the burnt-orange ring) is a flagged risk on the recommendation, not a demotion; it still leads the field on score-for-price.');
 if(unpriced.length)parts.push(unpriced.map(function(x){return '<b>'+esc(x.n)+'</b>';}).join(', ')+' submitted no price and cannot be placed on the cost axis.');
 parts.push('The normalized cross-supplier ZOPA and should-cost detail live on the Deal tab.');
 return '<span class="il">Value read</span>'+parts.join(' ');
}
function rfxCapabilityInsight(){var R=RFX,esc=escapeHtmlPV;
 var cov=R.suppliers.map(function(s,si){return {si:si,n:s.n,c:rfxCoverage(si)};}).filter(function(x){return x.c.answered>0;});
 var best=cov.slice().sort(function(a,b){return b.c.coveragePct-a.c.coveragePct;})[0];
 var parts=[];
 if(best)parts.push('<b>'+esc(best.n)+'</b> leads coverage at '+best.c.coveragePct+'% of requirements fully met ('+best.c.fully+' of '+best.c.total+').');
 var gated=R.suppliers.filter(function(s){return s.mustFail&&s.mustFail.length;});
 if(gated.length)parts.push(gated.map(function(s){return '<b>'+esc(s.n)+'</b>';}).join(', ')+' carries a Must-Have gap ('+esc(gated[0].mustFail.join(', '))+') a high category score cannot offset.');
 var unscored=R.suppliers.filter(function(s,si){return rfxCoverage(si).answered===0;});
 if(unscored.length)parts.push(unscored.map(function(s){return '<b>'+esc(s.n)+'</b>';}).join(', ')+' has not returned a scored response.');
 parts.push('The heatmap is category-level; open the fold for the per-requirement 0&ndash;5 detail.');
 return '<span class="il">Capability read</span>'+parts.join(' ');
}
// (RFX_HM_EXP / rfxScHmExp / rfxSubComposite removed, Round-2 #5: the Scoring Matrix is now
// category-level ONLY, no click-to-expand sub-criteria, that per-requirement detail lives on the
// Criterion Cards accordion instead. Confirmed no other caller.)
// Scoring subtab, rebuilt read-only per rfx_platform_audit.md findings #12-20 (and dead-code item
// rfxOpenScoring/rfxSetMyScore, deleted below): the CRUD rubric editor, the "My scores" entry mode,
// the evaluator identity (RFX.me/rfxMeIdx) and the Composite padlock all assumed a persisted,
// multi-user backing store this self-contained artifact does not have. What is kept: the criteria
// and their weights as READ-ONLY Criterion Cards with a static weight-sanity readout (this IS the
// keep-list's "Criterion Cards" ask), a rubric band legend (keep-list, previously missing), and the
// panel-composite matrix (mode==='comp' path) always visible, read-only, submitted evaluators only.
// Criterion Cards (ported from RFx-MOCKUP.html, bound to real RFX + restyled to pv-09 classes/vars):
// per-CATEGORY, each row a REQUIREMENT (not the illustrative RFX.criteria sub-composite), so every
// score shown is the supplier's real rq answer, MoSCoW-flagged, with the requirement's in-category
// weight % and a field-high read (who scored best on THAT requirement, ties shown). A DRAFT-weight
// marker renders per requirement if RFX ever carries an unconfirmed weight; this seed's weights are
// fully confirmed (see Weight Sanity), so it does not fire here, that is an accurate read of the
// data, not a cut corner.
// Round-2 #7 (Marc): ACCORDION by category, native <details name="rfxcrit"> (same caret/marker
// treatment as the "case, per supplier" accordion) so only one category is open at a time; collapsed
// state is a one-line header, category name + category weight + the field-leader on that category's
// panel-average composite (rfxAgg, submitted evaluators only). The first category starts expanded.
function rfxCriterionCardsHTML(){var R=RFX,esc=escapeHtmlPV;
 var cw=rfxCategoryWeights();
 var supHead=R.suppliers.map(function(s){return '<th>'+esc(s.n)+'</th>';}).join('');
 var cards=cw.map(function(w,wi){
   var ci=-1;for(var k=0;k<R.criteria.length;k++){if(R.criteria[k].cat===w.cat){ci=k;break;}}
   var best=-1,leadSi=-1;R.suppliers.forEach(function(s,si){var a=ci>=0?rfxAgg(si,ci):null;if(a!=null&&a>best){best=a;leadSi=si;}});
   var leadTxt=leadSi>=0?(esc(R.suppliers[leadSi].n)+' leads · '+best.toFixed(1)+'/5'):'not yet scored';
   var rs=R.requirements.filter(function(r){return r.category===w.cat;});
   var inCatTotal=rs.reduce(function(a,r){return a+(r.weight||0);},0)||1;
   var rows=rs.map(function(r){
     var inCatPct=Math.round((r.weight||0)/inCatTotal*100);
     var draft=r.weightConfirmed===false;   // structural DRAFT-weight support; unused by this fully-confirmed seed
     var scored=R.suppliers.map(function(s,si){return {n:s.n,v:rfxRqScore(si,r.id)};}).filter(function(x){return x.v!=null;});
     var maxV=scored.length?Math.max.apply(null,scored.map(function(x){return x.v;})):null;
     var winners=maxV!=null?scored.filter(function(x){return x.v===maxV;}).map(function(x){return esc(x.n);}):[];
     var fieldHigh=winners.length?(winners.join(' / ')+(winners.length>1?' (tie)':'')):'<span style="color:var(--mut2)">not scored</span>';
     var cells=R.suppliers.map(function(s,si){var v=rfxRqScore(si,r.id);return '<td>'+(v==null?'<span style="color:var(--mut2)">-</span>':v.toFixed(1))+'</td>';}).join('');
     return '<tr><td style="text-align:left;white-space:normal">'+rfxMoscowChip(r.moscow)+' '+esc(r.text)+(draft?' <span style="font:700 8px var(--mono);text-transform:uppercase;padding:2px 7px;border-radius:30px;color:#8A5A00;background:var(--amber-t,#FBF1DA)">DRAFT weight</span>':'')+'</td><td>'+inCatPct+'%'+(draft?'*':'')+'</td>'+cells+'<td style="text-align:left;font-size:11.5px;color:var(--mut)">'+fieldHigh+'</td></tr>';
   }).join('');
   var draftNote=rs.some(function(r){return r.weightConfirmed===false;})?'<div class="spnote" style="margin-top:6px">* in-category weight unconfirmed, DRAFT, confirm with the evaluation team before Group Decision. Never silently normalized.</div>':'';
   var summary='<summary style="cursor:pointer;padding:12px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-weight:700;font-size:13px">'+esc(titleCase(w.cat))+'</span><span style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:3px 10px;border-radius:30px;color:var(--plum);background:rgba(92,43,80,.10)">Category weight '+w.pct+'%</span><span style="flex:1 1 auto;min-width:0;text-align:right;font-size:11.5px;color:var(--mut)">'+leadTxt+'</span></summary>';
   var body='<div style="padding:0 14px 14px"><div class="mxwrap"><table class="mx" style="width:100%"><thead><tr><th style="text-align:left">Requirement</th><th>In-cat wt</th>'+supHead+'<th style="text-align:left">Field-high</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+draftNote+'</div>';
   return '<details class="card rfxcase-acc" name="rfxcrit" style="margin:0 0 10px;padding:0;overflow:hidden"'+(wi===0?' open':'')+'>'+summary+body+'</details>';
 }).join('');
 return '<div class="spnote" style="margin:0 0 10px">One category per row, click to expand its requirements. Each requirement scored 0–5 per supplier from the requirements matrix, with the field-high read (who scored best on that specific requirement, ties shown).</div>'+cards;
}
// (Rubric Bands legend + Weight Sanity gate REMOVED, Round-3 rework (Marc item 1): both panels are
// gone from Scoring entirely, not just collapsed. rfxWeightSum/rfxSubWeightSum below are now unused
// by this file and are removed with them; see the note at their old call site history.)
// Round-2 (Marc): the Dual-Ranking Surface (compensatory-vs-gate-pass side by side, with its own
// gate-conflict callout) is REMOVED. It duplicated the SAME policy statement, "the top scorer keeps
// #1, a Must-Have gap is flagged not demoted", already carried once by the Scoring Matrix's own
// Must-Have FAIL callout below, and again on Overview / Recommendation. rfxGatePassLeader() /
// rfxMeritRanking() are kept, other readiness surfaces still use them.
// ---- Round-2 #5 (Marc): Scoring Matrix, MOVED to the top of the tab and made STATE-AWARE ----
// Category-level only (weighted total + Must-Have gate); it does NOT also expand to sub-criteria
// here, the Criterion Cards accordion below carries the per-requirement detail. Three states, read
// straight off RFX.panel[].submitted, no submit affordance anywhere (reflect-only):
//   none    -> "scoring not yet generated" gap-state, no matrix rendered
//   partial -> the matrix renders (rfxAgg already reads submitted evaluators only, so a partial
//              panel naturally shows only what has been submitted), PLUS a callout naming who
//              still has to submit and, where the data supports it, which category their role maps
//              to, and the due date read from RFX.phase (the closest date the data model carries)
//   complete-> the full matrix, no callout
function rfxRoleCategoryHint(role){
 if(!role)return null;
 var r=String(role).toLowerCase();
 var map=[['security','Security & compliance'],['functional','Functional fit'],['performance','Performance & scalability'],['operational','Operational support'],['commercial','Total cost (TCO)'],['sourcing','Total cost (TCO)'],['legal','Risk & stability'],['risk','Risk & stability'],['integration','Integration & architecture']];
 for(var i=0;i<map.length;i++){if(r.indexOf(map[i][0])>=0)return map[i][1];}
 return null;
}
function rfxPhaseDueTxt(){var p=RFX.phase;if(!p||!p.nextMilestone)return null;
 var days=p.daysToNext==null?'':(p.daysToNext<0?', '+Math.abs(p.daysToNext)+' day(s) overdue':p.daysToNext===0?', due today':', due in '+p.daysToNext+' day(s)');
 return escapeHtmlPV(p.nextMilestone)+days;}
function rfxScoringMatrixHTML(){var R=RFX,leader=rfxLeader();
 var total=R.panel.length,submitted=R.panel.filter(function(e){return e.submitted;}),pending=R.panel.filter(function(e){return !e.submitted;});
 var state=submitted.length===0?'none':(submitted.length===total?'complete':'partial');
 var stateChip=state==='complete'?rfxChip('Complete','var(--plum)','rgba(92,43,80,.10)'):state==='partial'?rfxChip('In progress','#8A5A00','var(--amber-t,#FBF1DA)'):rfxChip('Not generated','var(--mut2)','#EFECE8');
 var h='<div class="sect"><div class="secthd"><div class="t">Scoring matrix</div>'+rfxCap(submitted.length+' of '+total+' evaluators submitted')+'</div><div class="card">';
 h+='<div style="margin-bottom:11px">'+stateChip+'</div>';
 if(state==='none'){
   var dueTxt0=rfxPhaseDueTxt();
   h+='<div style="padding:6px 2px 10px"><div style="font-size:13px;color:var(--mut);line-height:1.6">Scoring not yet generated. None of the '+total+' assigned evaluator(s) have submitted a score yet, so there is no panel composite to show.'+(dueTxt0?' Next milestone: <b style="color:var(--plum)">'+dueTxt0+'</b>.':'')+'</div></div>';
   h+='</div></div>';
   return h;
 }
 if(state==='partial'){
   var dueTxt=rfxPhaseDueTxt();
   var whoTxt=pending.map(function(e){var hint=rfxRoleCategoryHint(e.role);return '<b>'+escapeHtmlPV(e.n)+'</b>'+(e.role?' <span style="color:var(--mut2)">('+escapeHtmlPV(e.role)+')</span>':'')+(hint?' <span style="color:var(--mut2)">· '+escapeHtmlPV(hint)+'</span>':'');}).join(', ');
   h+='<div class="rfxgate warn" style="margin:0 0 12px">Still to submit: '+whoTxt+'.'+(dueTxt?' Next milestone: <b>'+dueTxt+'</b>.':' No due date on file.')+'</div>';
 }
 var supHead=R.suppliers.map(function(s,si){return '<th'+(si===leader?' class="lead"':'')+'>'+(si===leader?'★ ':'')+escapeHtmlPV(s.n)+'</th>';}).join('');
 var hcSpan=function(v){return v==null?'<span class="hcell" style="background:var(--bg);color:var(--mut2)">–</span>':'<span class="hcell" style="'+pvHmRamp(v)+'">'+v.toFixed(1)+'</span>';};
 h+='<div class="mxwrap"><table class="mx schm" style="width:100%"><thead><tr><th style="text-align:left">Category</th><th>Weight</th>'+supHead+'</tr></thead><tbody>';
 h+=R.criteria.map(function(c,ci){
   var cells=R.suppliers.map(function(s,si){return '<td'+(si===leader?' class="lead"':'')+'>'+hcSpan(rfxAgg(si,ci))+'</td>';}).join('');
   return '<tr><td style="text-align:left"><span class="schm-cn">'+escapeHtmlPV(titleCase(c.cat))+'</span></td><td class="schm-w">'+c.w+'%</td>'+cells+'</tr>';
 }).join('');
 var wtCells=R.suppliers.map(function(s,si){return '<td'+(si===leader?' class="lead"':'')+'><b>'+rfxWeighted(si).toFixed(1)+'</b></td>';}).join('');
 var gateCells=R.suppliers.map(function(s,si){var gp=rfxGatePass(si);return '<td>'+(gp?'<span class="gate ok">Pass</span>':'<span class="gate fail">Fail</span>')+'</td>';}).join('');
 h+='</tbody><tfoot><tr class="wtotrow"><td style="text-align:left">Weighted total <span style="font-weight:400;color:var(--mut2)">(0-5)</span></td><td></td>'+wtCells+'</tr><tr class="gaterow"><td style="text-align:left">Gate · Must-Have</td><td></td>'+gateCells+'</tr></tfoot>';
 h+='</table><div class="spnote" style="margin-top:6px">Category-level panel average on the Landscape heatmap ramp (lighter = lower); reads only <b>submitted</b> evaluators. Requirement-level detail is in the Criterion Cards below, not expanded here. The <b>Gate</b> row is Must-Have pass/fail. The ★ column leads.</div>';
 // Round-2 #10 (Marc) DEDUPE: the Must-Have gate fail is stated prominently ONCE, here on the
 // matrix; it is not re-explained elsewhere on this tab (Criterion Cards / Requirements Register
 // carry the underlying requirement data but do not repeat this callout).
 var koList=R.suppliers.filter(function(s){return s.mustFail&&s.mustFail.length;});
 if(koList.length){ h+='<div class="rfxgate" style="margin:9px 0 0;border:1px solid #E4B4AE;border-left:3px solid #A23A30;background:var(--pink-t,#FBE7E3);color:var(--ink)"><b style="color:var(--riskred)">&#10007; Must-Have FAIL:</b> '+koList.map(function(s){return '<b>'+escapeHtmlPV(s.n)+'</b> does not meet <b>'+escapeHtmlPV(s.mustFail.join(', '))+'</b>';}).join('; ')+'. A Must-Have is a <b>hard gate</b>, a fail bars the award regardless of the weighted total. To advance this supplier the team must resolve it internally (Cyber review of whether we can proceed) and/or with the supplier (do they hold the certification, and if not, if/when they will). Reflect-only, nothing is decided here.</div>'; }
 h+='<div class="spnote" style="margin-top:6px">The side-by-side response comparison and cross-supplier pricing live on <b>Analysis &rsaquo; Cross-Supplier</b>.'+rfxCalibrationNoteHTML()+'</div>';
 h+='</div></div>';
 return h;
}
function rfxScoringHTML(){
 // Round-3 reorder (Marc item 1): the state-aware Scoring Matrix leads the tab; the Rubric Bands
 // legend and the Weight Sanity gate are REMOVED entirely (not collapsed, gone); the Criterion Cards
 // accordion (requirement detail) follows directly; the Requirements Register (the traceability
 // reference, no longer a separate folded surface) closes the tab. Dual-Ranking Surface removed (see above).
 var h=rfxScoringMatrixHTML();
 h+='<div class="sect"><div class="secthd"><div class="t">Criterion cards</div>'+rfxCap('per requirement · per supplier · accordion by category')+'</div>';
 h+=rfxCriterionCardsHTML();
 h+='</div>';
 h+=rfxRequirementsRegisterHTML();
 return h;
}
// ---- Scoring & Pricing (dashboard-rfx Tab 4): per-REQUIREMENT cross-supplier comparison matrix ----
// Requirement x supplier: cell = 0-5 score, colored by coverage LEVEL, leader dot; + Weight + Mandatory columns.
// Requirements Matrix (MERGED, 2026-07-26 redesign): the platform's per-requirement 0–5 heatmap
// ("Per-requirement comparison") and the mockup's MoSCoW + Met/Partial/Gap "Requirements Matrix" are
// now ONE table, per requirement x supplier, each cell carrying BOTH the semantic status label (what
// the mockup asked for) and the underlying 0–5 score + heatmap ramp (what the platform already had),
// so nothing is lost and there is exactly one requirements matrix on the tab.
function rfxReqMatrixHTML(){var R=RFX;var rank=rfxReqRanking();var rankOf={fully:3,partial:2,'does-not':1,na:0};
 var lvlWord={fully:'Met',partial:'Partial','does-not':'Gap',na:'–'};
 var supW=rank.length?Math.max(8,Math.floor(58/rank.length)):12;
 var head='<tr><th style="text-align:left;width:24%">Requirement</th><th>Category</th><th>MoSCoW</th><th>Must</th>'+rank.map(function(si){return '<th style="width:'+supW+'%">'+escapeHtmlPV(R.suppliers[si].n)+'</th>';}).join('')+'</tr>';
 var rows=R.requirements.map(function(r){
  var lv=rank.map(function(si){return {si:si,lvl:rfxLevel(si,r.id),v:rfxRqScore(si,r.id)};});
  var best=-1;lv.forEach(function(x){best=Math.max(best,rankOf[x.lvl]);});
  var leaders=best>=rankOf.partial?lv.filter(function(x){return rankOf[x.lvl]===best;}).map(function(x){return x.si;}):[];
  var cells=lv.map(function(x){var isLeader=leaders.indexOf(x.si)>=0&&leaders.length<rank.length;
   // Capability #1 (Marc): match the Landscape Requirements-Heatmap, .hcell + pvHmRamp (0-5 blue ramp), ringed leader.
   return '<td style="text-align:center;padding:6px 8px" title="'+escapeHtmlPV(rfxLevelLabel(x.lvl))+(x.v!=null?' ('+x.v+'/5)':'')+'">'+(x.v==null?'<span class="hcell" style="background:var(--bg);color:var(--mut2)">–</span>':'<span class="hcell'+(isLeader?' lead':'')+'" style="'+pvHmRamp(x.v)+';font-size:10.5px;font-weight:800">'+lvlWord[x.lvl]+'</span>')+'</td>';}).join('');
  return '<tr><td style="text-align:left;font-weight:600;white-space:normal;max-width:230px">'+escapeHtmlPV(r.text)+'<span style="font-size:10px;color:var(--mut2)"> · conf '+Math.round((r.confidence||0)*100)+'%</span></td><td style="font-size:11px;color:var(--mut2)">'+escapeHtmlPV(titleCase(r.category))+'</td><td>'+rfxMoscowChip(r.moscow)+'</td><td>'+(r.mandatory?'<span style="font:700 8px var(--mono);text-transform:uppercase;padding:2px 6px;border-radius:30px;color:#C8202E;background:var(--pink-t,#FBE7E3)">Yes</span>':'<span style="color:var(--mut2)">-</span>')+'</td>'+cells+'</tr>';
 }).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Requirements Matrix</div>'+rfxCap('cross-supplier · '+R.requirements.length+' requirements')+'</div><div class="spnote" style="margin:0 0 8px">Each cell shows the MoSCoW-aware status (<b>Met</b> / <b>Partial</b> / <b>Gap</b>) on the Landscape heatmap ramp (lighter = lower, deeper blue = higher); hover a cell for the underlying 0–5 score. Grey = not answered. A leading supplier on a row is <b>ringed</b>. Reflect-only first-pass analysis.</div><div class="mxwrap"><table class="mx" style="width:100%;min-width:720px"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div></div>';
}
// (rfxPricingTableHTML removed, Round-2 #12: "Commercial comparison"'s raw-asks table is now
// folded into the merged rfxCommercialComparisonHTML() below, alongside the Bid-Leveling gate and
// the normalized all-in comparison, so the raw pricing table appears exactly once on this tab.)
// rfx-lifecycle #3: pricing-normalization layer + cross-supplier ZOPA with per-supplier markers.
// Bidders price on DIFFERENT bases (per-credit consumption / flat committed-use / bundled), so the raw
// asks above are not comparable. This normalizes each to a common unit + term, then plots every bidder's
// ask on one scale per line item with the negotiation target + walk-away marked. Reflect-only demo data.
const RFX_NORM=(_PVRN&&_PVRN.bidders)?_PVRN:{unit:'$ / seat / yr',termNote:'',bidders:[],lines:[]};
// (rfxDealBand removed 2026-07-26: it only ever rendered the old "Pricing Normalization" gradient band,
// retired by the rfxBidLevelingHTML() redesign below, which uses the same card + section idiom as the
// rest of this tab instead. Confirmed no other caller.)
// Round-3 rework (Marc item 2): the pricing-dimension table (raw asks, 8 rows x supplier columns)
// now carries TWO more rows in the SAME table, "Normalized all-in" ($/seat/yr all-in figure) and
// "Normalize read" (BELOW / IN_LINE / ABOVE), so a reader scans one table instead of two. The
// reconciliation math that used to sit in its own "Reconciliation" column now lives on an infoHover
// tooltip anchored to the Normalized all-in figure. The former standalone "Normalized All-In Unit
// Comparison" table is gone, its content is these two rows. The Bid-Leveling gate + the "How Theo
// normalized" fold stay, moved below the merged table (supplementary detail, not the headline).
function rfxCommercialComparisonHTML(){
 var R=RFX,N=RFX_NORM,esc=escapeHtmlPV,rank=rfxReqRanking();
 var dims=[['model','Pricing model'],['annual','Annual fee'],['list','List price'],['discount','Volume discount'],['impl','Implementation'],['terms','Term'],['escalator','Escalator'],['binding','Pricing binding']];
 var anyPending=R.suppliers.some(function(s){return s.pricing&&s.pricing.annual==='Not submitted';});
 var rawHead0='<tr><th style="text-align:left">Pricing dimension</th>'+rank.map(function(si){return '<th>'+esc(R.suppliers[si].n)+'</th>';}).join('')+'</tr>';
 var rawRows0=dims.map(function(d){return '<tr><td style="text-align:left;font-weight:600">'+esc(d[1])+'</td>'+rank.map(function(si){var pc=R.suppliers[si].pricing||{};return '<td style="white-space:normal">'+rfxPriceVal(pc[d[0]])+'</td>';}).join('')+'</tr>';}).join('');
 var pendingNote=anyPending?'<div class="rfxgate warn" style="margin:0 0 9px">One or more suppliers have not submitted pricing in this run. Each cell stays labeled <b>Not submitted</b> until a proposal arrives, prices are never fabricated, and Not submitted is not a zero.</div>':'';
 var h='<div class="sect"><div class="secthd"><div class="t">Commercial comparison</div>'+rfxCap('raw asks · normalized all-in · read')+'</div>';
 h+='<div class="card">';
 h+='<div style="font-weight:700;font-size:12.5px;margin-bottom:2px">Pricing schedule <span style="font-weight:500;color:var(--mut2)">· as submitted, plus Theo&rsquo;s normalized all-in read</span></div>'+pendingNote;
 var normRowsHTML='',footNote='',belowHTML='';
 if(N.bidders&&N.bidders.length){
  var termM=/([\d,]+)\s*seats?\D+(\d+)-yr/i.exec(N.termNote||'');
  var seats=termM?parseInt(termM[1].replace(/,/g,''),10):(N.bidders.length?400:1),years=termM?parseInt(termM[2],10):3;
  var platform=N.lines[0],impl=N.lines.filter(function(L){return /implement/i.test(L.item);})[0],support=N.lines.filter(function(L){return /support/i.test(L.item);})[0];
  var refAllIn=(platform?platform.target:0)+(support?support.target:0)+((impl?impl.target*1000:0)/years/seats);
  var normBySi={};
  rank.forEach(function(si){
    var s=R.suppliers[si],b=N.bidders.filter(function(x){return x.name===s.n;})[0];
    if(!b){normBySi[si]=null;return;}
    var p=platform?platform.asks[b.id]:null,sup=support?support.asks[b.id]:null,i=impl?impl.asks[b.id]:null;
    if(p==null||sup==null||i==null){normBySi[si]={total:null};return;}
    var implPerSeat=(i*1000)/years/seats,total=p+sup+implPerSeat;
    var recon=esc(s.n)+': $'+p.toLocaleString('en-US')+' platform + $'+sup.toLocaleString('en-US')+' support, + ($'+(i*1000).toLocaleString('en-US')+' impl &divide; '+years+'yr &divide; '+seats+' seats = $'+Math.round(implPerSeat).toLocaleString('en-US')+') = <b>$'+Math.round(total).toLocaleString('en-US')+'/seat/yr</b>';
    var delta=refAllIn?((total-refAllIn)/refAllIn*100):0;
    var read=delta<=-5?'BELOW':delta>=5?'ABOVE':'IN_LINE';
    var col=read==='ABOVE'?'#8A5A00':read==='BELOW'?'var(--plum)':'#2E5E8C';
    var bg=read==='ABOVE'?'var(--amber-t,#FBF1DA)':read==='BELOW'?'rgba(92,43,80,.10)':'var(--blue-t,#E4EBF1)';
    normBySi[si]={total:total,recon:recon,read:read+' ('+(delta>=0?'+':'')+delta.toFixed(1)+'%)',col:col,bg:bg};
  });
  var normCells=rank.map(function(si){var n=normBySi[si];
    if(!n||n.total==null)return '<td>'+rfxPriceVal('Not submitted')+'</td>';
    return '<td style="white-space:nowrap;font-weight:800">$'+Math.round(n.total).toLocaleString('en-US')+infoHover('<b>Reconciliation</b><br>'+n.recon,{aria:'Reconciliation math for '+esc(R.suppliers[si].n)})+'</td>';}).join('');
  var readCells=rank.map(function(si){var n=normBySi[si];
    if(!n||n.total==null)return '<td><span style="color:var(--mut2)">–</span></td>';
    return '<td>'+rfxChip(n.read,n.col,n.bg)+'</td>';}).join('');
  normRowsHTML='<tr style="border-top:2px solid var(--line2)"><td style="text-align:left;font-weight:700">Normalized all-in <span style="font-weight:400;color:var(--mut2);font-size:10px">('+esc(N.unit)+')</span></td>'+normCells+'</tr>'
   +'<tr><td style="text-align:left;font-weight:700">Normalize read</td>'+readCells+'</tr>';
  footNote='<div class="spnote" style="margin-top:8px">Normalized all-in is '+esc(N.unit)+' · denominator '+seats+' seats over the '+years+'-yr term · hover a figure for the reconciliation. Reference: '+(refAllIn?('$'+Math.round(refAllIn).toLocaleString('en-US')+'/seat/yr'):'n/a')+', the sum of Theo&rsquo;s per-line negotiation targets, annualized, the only should-cost figure RFX_NORM carries. BELOW / IN_LINE (&plusmn;5%) / ABOVE reads against it.</div>';
  var complete=N.bidders.map(function(b){return {b:b,ok:N.lines.every(function(L){return L.asks[b.id]!=null;})};});
  var allOk=complete.every(function(x){return x.ok;});
  var gateRow=complete.map(function(x){return rfxGlyph(x.ok?'done':'flag',esc(x.b.name)+': '+(x.ok?'Complete':'Pending'));}).join(' ');
  var gateNote=allOk
    ?'<div class="spnote" style="margin:8px 0 0">All '+N.bidders.length+' priced bidder(s) have every normalized line item priced; the comparison above is apples-to-apples.</div>'
    :'<div class="rfxgate" style="margin:8px 0 0;border:1px solid #E4B4AE;border-left:3px solid #A23A30;background:var(--pink-t,#FBE7E3);color:var(--ink)"><b style="color:var(--riskred)">Gate: blocked.</b> Not every bidder has priced every line item; the comparison above is not yet fully apples-to-apples.</div>';
  belowHTML='<div style="font-weight:700;font-size:12.5px;margin:18px 0 2px">Bid-leveling gate <span style="font-weight:500;color:var(--mut2)">· every normalized line item priced?</span></div><div style="margin-top:8px">'+gateRow+'</div>'+gateNote;
  var assumeN=N.bidders.filter(function(b){return b.norm&&!b.norm.clean;}).length;
  var normHow=N.bidders.some(function(b){return b.norm;})?('<details class="normhow"><summary><span class="normhow-t">How Theo normalized the platform-fee line</span>'+(assumeN?'<span class="normhow-flag">'+assumeN+' of '+N.bidders.length+' needed an assumption</span>':'<span class="normhow-ok">all normalized cleanly</span>')+'</summary><div class="normhow-body"><div class="normhow-intro">Each priced bidder&rsquo;s pricing basis is converted to a common unit, <b>'+esc(N.unit)+'</b>'+(N.termNote?' · '+esc(N.termNote):'')+', so the asks compare like-for-like.</div>'+N.bidders.map(function(b){if(!b.norm)return '';var cl=b.norm.clean;return '<div class="normhow-row"><div class="normhow-sup"><span style="color:'+b.col+'">'+esc(b.name)+'</span><span class="normhow-badge '+(cl?'clean':'assume')+'">'+(cl?'clean':'assumption applied')+'</span></div><div class="normhow-m"><span class="k">Basis</span><span>'+esc(b.basis)+' <span class="normhow-arrow">→</span> $'+b.seat.toLocaleString()+'</span></div><div class="normhow-m"><span class="k">Method</span><span>'+esc(b.norm.method)+'</span></div>'+(b.norm.assumption?'<div class="normhow-m"><span class="k">'+(cl?'Note':'Assumption')+'</span><span>'+esc(b.norm.assumption)+'</span></div>':'')+'</div>';}).join('')+'</div></details>'):'';
  belowHTML+=normHow;
 } else {
  footNote='<div class="spnote" style="margin-top:8px">No normalized cross-supplier pricing basis on file (RFX_NORM); Normalized all-in and Normalize read stay blank.</div>';
 }
 h+='<div class="mxwrap" style="margin-top:8px"><table class="mx" style="min-width:560px">'+rawHead0+'<tbody>'+rawRows0+normRowsHTML+'</tbody></table></div>'+footNote+belowHTML;
 h+='</div></div>';
 return h;
}
// Round-3 rework (Marc item 3): shared bar grammar, re-matched pixel-for-pixel to the REAL Deal
// ZOPA's zopaBar() in _deal_build/_parts/zopa.js: an 82px track (was 66px), value labels lane-offset
// calc(50% + 17px) up/down from the axis (was a flatter -32px/+16px split), and TAG colors that match
// per point type (target=teal (the same hue as the ZOPA zone), walk/ask=plum, open=burnt-orange,
// over-walk ask=red) with the VALUE always neutral ink, exactly Deal's .zlab/.zltag/.zlval grammar
// (Deal colors the tag, not the value; this file previously had that inverted). Axis line + teal ZOPA
// zone + target/walk ticks + Theo-opening ring + a red-on-over-walk ask triangle are unchanged (already
// matched). Re-implemented with pv-09 inline styles/CSS vars (no new hex colors, no zopa-viz stylesheet
// load) since this artifact does not carry the Deal tab's dependency chain (esc/M/assumVal/DealUI); the
// data mapping differs too, RFX_NORM is a cross-supplier line (N asks against one target/walk), the
// Deal's is one supplier's line, so `asks` here is an array (one bidder in the Individual view, every
// bidder in the Cross-Supplier view).
function rfxZopaOpen(target,walk){return Math.round(Math.max(target*0.85,2*target-walk));}
function rfxZopaBarHTML(target,walk,asks,fmt){
 var open=rfxZopaOpen(target,walk);
 var vals=[target,walk,open].concat(asks.map(function(a){return a.v;}));
 var min=Math.min.apply(null,vals),max=Math.max.apply(null,vals);var pad=(max-min)*0.10||1;min-=pad;max+=pad;var span=(max-min)||1;
 function pos(v){return Math.max(0,Math.min(100,(v-min)/span*100));}
 var marks='<div style="position:absolute;top:50%;left:0;right:0;height:2px;transform:translateY(-50%);background:var(--line2,#E0DCD5);border-radius:2px"></div>';
 marks+='<div style="position:absolute;top:50%;transform:translateY(-50%);height:16px;left:'+pos(target).toFixed(1)+'%;width:'+Math.max(pos(walk)-pos(target),0).toFixed(1)+'%;background:var(--teal-t,#D9EDEA);border:1px solid var(--teal-d,#2E6E63);border-radius:4px" title="ZOPA '+fmt(target)+' to '+fmt(walk)+'"></div>';
 marks+='<div style="position:absolute;top:calc(50% - 11px);width:2px;height:22px;left:'+pos(target).toFixed(1)+'%;background:var(--teal-d,#2E6E63)" title="Target '+fmt(target)+'"></div>';
 marks+='<div style="position:absolute;top:calc(50% - 11px);width:2px;height:22px;left:'+pos(walk).toFixed(1)+'%;background:var(--plum);opacity:.55" title="Walk-away '+fmt(walk)+'"></div>';
 marks+='<div style="position:absolute;top:calc(50% - 6px);width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--surface,#fff);border:2px solid var(--emph,#C15E19);box-sizing:border-box;left:'+pos(open).toFixed(1)+'%" title="Theo opening '+fmt(open)+'"></div>';
 var pts=[{v:target,tag:'Target',tc:'var(--teal-d,#2E6E63)'},{v:walk,tag:'Walk-away',tc:'var(--plum)'},{v:open,tag:'Open',tc:'var(--emph,#C15E19)'}];
 asks.forEach(function(a){var over=a.v>walk,col=over?'#C8202E':'var(--plum)';
  marks+='<div style="position:absolute;top:calc(50% - 14px);left:calc('+pos(a.v).toFixed(1)+'% - 5px);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:9px solid '+col+'" title="'+escapeHtmlPV(a.label)+' ask '+fmt(a.v)+(over?' · above walk-away':' · within ZOPA')+'"></div>';
  pts.push({v:a.v,tag:a.label,tc:col,over:over});});
 pts.sort(function(a,b){return a.v-b.v;});
 var labels=pts.map(function(p,i){var pp=pos(p.v);var lane=(i%2===0)?'bottom:calc(50% + 17px)':'top:calc(50% + 17px)';
  var align=pp<=10?'left:0;transform:none;text-align:left':(pp>=90?'left:100%;transform:translateX(-100%);text-align:right':'left:'+pp.toFixed(1)+'%;transform:translateX(-50%);text-align:center');
  var valCol=p.over?'#C8202E':'var(--ink)';
  return '<div style="position:absolute;'+lane+';'+align+';line-height:1.2;white-space:nowrap;pointer-events:none"><div style="font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:'+p.tc+'">'+escapeHtmlPV(p.tag)+'</div><div style="font-size:11px;font-weight:700;color:'+valCol+'">'+fmt(p.v)+'</div></div>';}).join('');
 return '<div style="position:relative;height:82px;margin:18px 0 4px">'+marks+labels+'</div>';
}
function rfxZopaFmt(L){return function(v){return L.unit.indexOf('$K')>=0?('$'+v+'K'):('$'+v.toLocaleString('en-US'));};}
// Round-3 rework (Marc item 3): row grammar rebuilt to match the Deal ZOPA's title-column + track
// layout (a fixed-width title beside the bar, hairline row dividers, the read sitting directly under
// the track), via the .rzopa* CSS added to pv.css. A bidder with no submitted ask for a given line
// (e.g. Helio, "not submitted") is named in the read line, never plotted, an honest unpriced lane
// rather than a fabricated marker.
function rfxNormZopaHTML(){
 var N=RFX_NORM,esc=escapeHtmlPV;
 if(!N.bidders||!N.bidders.length)return '';
 var rows=N.lines.map(function(L){
   var fmt=rfxZopaFmt(L);
   var sorted=N.bidders.slice().filter(function(b){return L.asks[b.id]!=null;}).sort(function(a,b){return L.asks[a.id]-L.asks[b.id];});
   var unpriced=N.bidders.filter(function(b){return L.asks[b.id]==null;});
   var asks=sorted.map(function(b){return {v:L.asks[b.id],label:b.name.split(' ')[0],col:b.col};});
   var over=sorted.filter(function(b){return L.asks[b.id]>L.walk;});
   var cheapest=sorted[0];
   var read=cheapest?('<b>'+esc(cheapest.name)+'</b> is lowest at '+fmt(L.asks[cheapest.id])+'.'):'No priced bidder on this line.';
   if(over.length)read+=' '+over.map(function(b){return '<b>'+esc(b.name)+'</b>';}).join(', ')+' '+(over.length>1?'sit':'sits')+' above the '+fmt(L.walk)+' walk-away.';
   if(unpriced.length)read+=' '+unpriced.map(function(b){return '<b>'+esc(b.name)+'</b>';}).join(', ')+' submitted no price for this line, not plotted.';
   var track=sorted.length?rfxZopaBarHTML(L.target,L.walk,asks,fmt):'<div style="height:82px;display:flex;align-items:center;justify-content:center;color:var(--mut2);font-size:11.5px">No priced bidder on this line.</div>';
   return '<div class="rzopa-line"><div class="rzopa-row"><div class="rzopa-title"><div class="rzopa-nm">'+esc(L.item)+'</div><div class="rzopa-mkt">'+esc(L.unit)+' · market '+fmt(L.lo)+'–'+fmt(L.hi)+'</div></div><div class="rzopa-trackwrap">'+track+'<div class="rzopa-read">'+read+'</div></div></div></div>';
 }).join('');
 var h='<div class="sect"><div class="secthd"><div class="t">Cross-Supplier ZOPA</div>'+rfxCap('every bidder’s ask vs. target & walk-away')+'</div>'
  +'<div class="card rzopa">'+rows+'</div>'
  +'<div class="spnote">Every priced bidder&rsquo;s ask plotted against the negotiation target and walk-away for that line item; a burnt-orange ring is Theo&rsquo;s opening offer, an ask above walk-away turns red. A bidder with no submitted price for a line is named in the read, not plotted. The individual per-supplier ZOPA is on Analysis &rsaquo; Individual. Reflect-only; targets and walk-aways are the team&rsquo;s to set.</div></div>';
 return h;
}
// #73 (Marc): the INDIVIDUAL per-supplier ZOPA for RFx › Analysis › Individual, a single-supplier bar per
// line item (market band, ZOPA target→walk, that supplier's ask, Theo's opening), the SAME ported
// bar grammar as the Cross-Supplier ZOPA above with exactly one ask marker. Grounded in RFX_NORM
// (matched to the RFx supplier by name). Round-3 rework (Marc item 3): same title-column row layout.
function rfxIndivZopaHTML(si){
 var R=RFX,N=RFX_NORM,esc=escapeHtmlPV;
 var nm=(R.suppliers[si]&&R.suppliers[si].n)||'';
 var b=N.bidders.find(function(x){return x.name===nm;});
 if(!b)return '';
 var rows=N.lines.map(function(L){
   var ask=L.asks[b.id];if(ask==null)return '';
   var fmt=rfxZopaFmt(L);
   var over=ask>L.walk,col=over?'#C8202E':'var(--plum)';
   var read='Their ask <b style="color:'+col+'">'+fmt(ask)+'</b>'+(over?' sits above the walk-away.':' is within range.')+' Market '+fmt(L.lo)+'–'+fmt(L.hi)+'.';
   var track=rfxZopaBarHTML(L.target,L.walk,[{v:ask,label:nm.split(' ')[0],col:col}],fmt);
   return '<div class="rzopa-line"><div class="rzopa-row"><div class="rzopa-title"><div class="rzopa-nm">'+esc(L.item)+'</div><div class="rzopa-mkt">'+esc(L.unit)+' · market '+fmt(L.lo)+'–'+fmt(L.hi)+'</div></div><div class="rzopa-trackwrap">'+track+'<div class="rzopa-read">'+read+'</div></div></div></div>';
 }).join('');
 if(!rows)return '';
 return '<div class="sect"><div class="secthd"><div class="t">ZOPA · '+esc(nm)+'</div></div><div class="card rzopa">'+rows+'</div><div class="spnote" style="margin-top:2px">This bidder&rsquo;s own ask against the negotiation target, walk-away and Theo&rsquo;s opening offer. The cross-supplier normalized ZOPA is on Analysis &rsaquo; Cross-Supplier.</div></div>';
}
// ---- Coverage Heatmap (dashboard-rfx Tab 3): category-rows x supplier-cols, cells colored by COVERAGE % ----
// FIXED: coverage % (fully-meets / total), NOT the raw 0-5 panel average. + Weight column + OVERALL row + leaders line.
// #78 (Marc): the RFx heatmaps use the SAME visual language as the Landscape heatmap, rounded pill cells
// (like .hcell), leader-ringed, with a ramp legend, replicated inline since the RFx tab isn't .pvsl-scoped.
function rfxHmPill(label,bg,fg,lead){return '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:26px;border-radius:7px;background:'+bg+';color:'+fg+';font:700 12.5px var(--sans)'+(lead?';box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.85),0 0 0 2px var(--plum)':'')+'">'+label+'</span>';}
function rfxHmSwatch(bg,lbl){return '<span style="display:inline-flex;align-items:center;gap:6px"><span style="min-width:40px;height:18px;border-radius:4px;background:'+bg+'"></span>'+lbl+'</span>';}
function rfxHeatmapHTML(){var R=RFX;var cats=rfxCats();var rank=rfxReqRanking();var leaders=rfxCatLeaders();var esc=escapeHtmlPV;
 // Capability #1 (Marc): match the Landscape Requirements-Heatmap style, .hcell + pvHmRamp. Coverage % maps to
 // the same blue ramp via pvHmRamp(pct/20) (100% -> 5 deepest, ~64% -> light start); a ringed cell leads.
 var hpct=function(p,lead){return '<span class="hcell'+(lead?' lead':'')+'" style="'+pvHmRamp(p/20)+'">'+p+'%</span>';};
 var hnull=function(){return '<span class="hcell" style="background:var(--bg);color:var(--mut2)">&ndash;</span>';};
 var head='<tr><th class="hcat" style="text-align:left">Requirement category</th><th style="width:70px">Weight</th>'+rank.map(function(si){return '<th>'+esc(R.suppliers[si].n)+'</th>';}).join('')+'</tr>';
 var body=cats.map(function(cat){var l=leaders.filter(function(x){return x.cat===cat;})[0];
  var cells=rank.map(function(si){var c=rfxCoverage(si);if(c.answered===0)return '<td style="text-align:center;padding:6px 8px">'+hnull()+'</td>';
   var roll=rfxCatRollup(si).filter(function(x){return x.cat===cat;})[0];var p=roll?roll.coveragePct:0;var lead=!!(l&&l.leaderIdx===si&&p>0);
   return '<td style="text-align:center;padding:6px 8px">'+hpct(p,lead)+'</td>';}).join('');
  return '<tr><td class="iss" style="white-space:nowrap">'+esc(titleCase(cat))+'</td><td style="text-align:center;font-family:var(--mono);color:var(--mut2)">'+(l?l.weightShare:0)+'%</td>'+cells+'</tr>';}).join('');
 var ov='<tr style="border-top:2px solid var(--line2)"><td class="iss" style="white-space:nowrap;font-weight:800">Overall coverage</td><td style="text-align:center;font-family:var(--mono);color:var(--mut2)">100%</td>'+rank.map(function(si){var c=rfxCoverage(si);if(c.answered===0)return '<td style="text-align:center;padding:6px 8px">'+hnull()+'</td>';return '<td style="text-align:center;padding:6px 8px">'+hpct(c.coveragePct,false)+'</td>';}).join('')+'</tr>';
 var leadersTxt=leaders.map(function(cl){return esc(cl.cat)+': '+(cl.leaderIdx>=0&&cl.coveragePct>0?esc(R.suppliers[cl.leaderIdx].n)+' ('+cl.coveragePct+'%)':'no coverage');}).join(' · ');
 var legend='<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:11px;color:var(--mut2);align-items:center"><span>Same ramp as the Landscape Requirements Heatmap:</span><span class="hcell" style="'+pvHmRamp(2)+'">low</span><span class="hcell" style="'+pvHmRamp(4)+'">mid</span><span class="hcell" style="'+pvHmRamp(5)+'">high</span><span style="font-family:var(--mono)">fully-met share per category &middot; a ringed cell leads</span></div>';
 // Round-3 rework (Marc item 4): the Capability read narrative now lives directly beneath this
 // table, inside the SAME panel as the Coverage heatmap, matching the Risk roll-up panel beside it.
 return '<div class="sect"><div class="secthd"><div class="t">Coverage heatmap</div></div><div class="card"><div class="mxwrap"><table class="mx" style="width:100%;min-width:640px"><thead>'+head+'</thead><tbody>'+body+ov+'</tbody></table></div>'+legend+'<div class="xs-ins" style="margin-top:11px">'+rfxCapabilityInsight()+'</div><div class="spnote" style="margin-top:8px"><b>Category leaders (advisory):</b> '+leadersTxt+'. A Must-Have failure still gates the award regardless of coverage.</div></div></div>';
}
// ---- What happens next (Marc): the tier cards were redundant with the For/Against block above, and the
// hardcoded "conditions precedent" + FRAP chain were wrong here. Replaced with a CORRECT high-level path
// that hands off to a contract-&-pricing negotiation project, where the workflow drives the real steps. ----
// rfxNextStages() is read by the small Overview-subtab version, rfxWhatsNextMiniHTML() below, the only
// remaining caller. (rfxWhatsNextHTML, the full Recommendation-subtab "What Happens Next" panel, was
// REMOVED 2026-07-27 per Marc: its content, the Advisory & Group Decision step plus the six execution
// steps, now lives on the Business Case tab's Path To Close accordion, rfxBcPathToCloseHTML, so it was
// a duplicate. The condensed Overview mini below is unchanged and still shares this same stage data,
// so the two can never drift from each other.)
function rfxNextStages(){var R=RFX;
 // "Panel scoring" reads the panel-composite matrix completeness (rfxAgg over every supplier x
 // criterion cell), not a per-evaluator submitted count (rfx_platform_audit.md finding #22).
 var totalCells=R.suppliers.length*R.criteria.length;
 var filledCells=0;R.suppliers.forEach(function(s,si){R.criteria.forEach(function(c,ci){if(rfxAgg(si,ci)!=null)filledCells++;});});
 var scoringPct=totalCells?Math.round(filledCells/totalCells*100):0;
 var gating=0;R.suppliers.forEach(function(s,si){gating+=rfxFlags(si).filter(function(f){return f.priority==='GATING';}).length;});
 return [
  {k:'Theo advisory',st:'done',d:'First-pass response analysis is complete.'},
  {k:'Panel scoring',st:scoringPct>=100?'done':(scoringPct>0?'active':'pending'),d:scoringPct+'% of the panel composite matrix scored'+(gating?', '+gating+' gating item(s) still open':'')+'.'},
  {k:'Group decision',st:'pending',d:'The award decision is the team’s, not Theo’s.'},
  {k:'Award',st:'pending',d:'Conditional until the contract executes.'}
 ];
}
// Condensed, expandable version for the Overview subtab (small footprint by design). Same
// rfxNextStages() data as the full Recommendation-subtab panel above, so the two can never drift.
function rfxWhatsNextMiniHTML(){var stages=rfxNextStages();
 var current=stages.filter(function(s){return s.st!=='pending';}).pop()||stages[0];
 var doneCount=stages.filter(function(s){return s.st==='done';}).length;
 var h='<details class="card" style="margin:0;padding:0;overflow:hidden">';
 h+='<summary style="cursor:pointer;padding:10px 13px;display:flex;align-items:center;gap:9px;flex-wrap:wrap"><span style="font-weight:700;font-size:12.5px">What happens next</span><span style="font-size:11px;color:var(--mut2)">'+doneCount+' of '+stages.length+' stages done · currently: '+escapeHtmlPV(current.k)+'</span></summary>';
 h+='<div style="padding:0 13px 12px;border-top:1px solid var(--line2,#CFCDC8)">'+stages.map(function(s,i){
  var done=s.st==='done',active=s.st==='active';
  var col=done?'var(--plum)':active?'var(--emph,#C15E19)':'#8A969E';
  return '<div style="display:flex;gap:8px;padding:8px 0'+(i>0?';border-top:1px solid var(--line)':'')+'"><span style="flex:none;width:15px;height:15px;border-radius:50%;background:'+col+';color:#fff;font-size:8.5px;display:flex;align-items:center;justify-content:center;margin-top:1px">'+(done?'✓':active?'…':(i+1))+'</span><div><div style="font-weight:700;font-size:11.5px;color:'+col+'">'+escapeHtmlPV(s.k)+'</div><div style="font-size:11px;color:var(--mut);margin-top:2px;line-height:1.4">'+escapeHtmlPV(s.d)+'</div></div></div>';
 }).join('')+'</div></details>';
 return h;
}
// "What's left to complete the deal" (Round-3 rework) was RETIRED here and merged into the Business
// Case tab's Path To Close block (rfxBcPathToCloseHTML, defined with the rest of the Business Case
// renderers below), which now carries the Advisory & Group Decision step plus all six execution steps
// in one seven-row accordion with a left numbered stepper. See rfxBcPathToCloseHTML.
// ---- ③ Analysis subtab dispatcher (increment 2): flattened to Compare + one tab per supplier ----
// Compare is now one flattened page (increment 3); the Individual dropdown is dropped in increment 7.
// Tab order is the stable seed order; the advisory leader (rank #1) carries a burnt-orange leader dot.
function rfxAnalysisHTML(){var R=RFX;
 var leader=rfxReqRanking()[0];
 var tabs='<button class="rfxst'+(RFX_AV==='compare'?' on':'')+'" type="button" onclick="rfxAv(\'compare\')">Cross-Supplier</button>';
 R.suppliers.forEach(function(s,si){
   var on=(RFX_AV!=='compare'&&RFX_DD===si);
   var dot=(si===leader)?'<span class="rfxlead-dot" title="Advisory leader" aria-hidden="true"></span>':'';
   tabs+='<button class="rfxst'+(on?' on':'')+'" type="button" onclick="rfxAv('+si+')">'+escapeHtmlPV(s.n)+dot+'</button>';
 });
 var h='<div class="pvts" style="margin-bottom:14px;border-bottom:1px solid var(--line)">'
   +'<button class="pvts-pad pvts-l" type="button" aria-label="Scroll suppliers left">&lsaquo;</button>'
   +'<div class="pvts-track">'+tabs+'</div>'
   +'<button class="pvts-pad pvts-r" type="button" aria-label="Scroll suppliers right">&rsaquo;</button>'
   +'</div>';
 if(window.pvTabScrollSyncAll)setTimeout(window.pvTabScrollSyncAll,0);
 h+=(RFX_AV==='compare')?rfxAnalysisCrossHTML():rfxAnalysisIndividualHTML();
 return h;
}
// ---- ④ Recommendation subtab (top-level; replaces the async brief): final rec + 5 approved panels
// (Evaluation Readiness · Model the Decision · The Case Per Supplier · Theo-Modeled Alternatives ·
// What Happens Next), rebuilt 2026-07-26 as a faithful port of the approved RFx-RECOMMENDATION-
// OPTIONS*.html mockups (structure/markup/interaction ported as-is, only rebound to the real RFX data
// object; nothing redesigned). MCM-palette-only in these 5 panels: plum / teal(#2F6E6B) / burnt-orange
// (var(--emph)) / deep rust(#9A3B1F) / muted blue(#2E5E8C) / grey(#8A969E) / ink, never the stoplight
// red/amber used elsewhere in this file. ----
// MCM palette-only pill helper shared by all 5 Recommendation panels below. Tints match the approved
// mockups' own :root values (plum-t/emph-t/blue-t already exist as real dashboard tokens; teal/rust/
// grey tints are literal, this dashboard defines no --teal/--rust/--grey tokens of its own).
var RFX_MCM={
 plum:['var(--plum)','var(--plum-t,#EDDFE9)'],
 teal:['#2F6E6B','#DCEBE9'],
 emph:['var(--emph,#C15E19)','var(--emph-t,#F6DDC9)'],
 rust:['#9A3B1F','#F3DFD6'],
 blue:['#2E5E8C','var(--blue-t,#E4EBF1)'],
 grey:['#8A969E','#ECEDEE']
};
// ---- Dark-mode TEXT-contrast fix (systemic, 2026-07-26) --------------------------------------
// RFX_MCM[t][0] is a FILL colour: correct for a bar/rect/border/swatch/pill-background/button-bg,
// but wrong for TEXT. In dark mode 'plum' goes near-black (c0 dark #3A1E34), and 'teal'/'rust'/
// 'grey' are fixed literal hex that never lighten, so text coloured with c[0] on a real theme-aware
// surface (--surface/--panel/--card) fails contrast in dark mode: plum 1.02:1, teal 2.57:1, rust
// 2.18:1, grey as low as 3.03:1 (even in light). theo-color.css carries a dedicated, theme-aware
// --hue-*-txt pair (light AND dark values, both confirmed present) for every hue in its library;
// RFX_MCM_TXT maps each MCM tone to its dark-safe counterpart:
//   plum -> --pri-tx (= --hue-plum-txt)   light #5C2B50 / dark #C99BD1
//   teal -> --hue-teal-txt                light #2F6E6B / dark #5FBAAE
//   emph -> --emph itself (already theme-aware: light #C15E19 / dark #EF9A5A, brightens in dark)
//   rust -> --hue-burgundy-txt (closest dark-safe family; theo-color.css has no dedicated rust text
//            token)                        light #7A2436 / dark #E08A99
//   blue -> --hue-navy-txt (closest dark-safe family)   light #123C82 / dark #7BA5DE
//   grey -> --hue-graphite-txt (closest dark-safe family) light #403A33 / dark #B0A99E
// Use rfxMcmTxt(tone) for TEXT sitting on a real theme-aware neutral surface (card/panel/surface),
// e.g. rfxBcDecisionCard's title, the Deal-Economics SVG bar $ labels, mini-box labels.
var RFX_MCM_TXT={plum:'var(--pri-tx)',teal:'var(--hue-teal-txt)',emph:'var(--emph,#C15E19)',rust:'var(--hue-burgundy-txt)',blue:'var(--hue-navy-txt)',grey:'var(--hue-graphite-txt)'};
function rfxMcmTxt(tone){return RFX_MCM_TXT[RFX_MCM[tone]?tone:'grey'];}
// rfxMcmPill (and rfxBcCallout) colour TEXT on their OWN c[1] tint, not a neutral surface. Only
// three tones' tints (plum/emph/blue) are themselves theme-aware CSS vars (var(--plum-t)/
// var(--emph-t)/var(--blue-t)), so the flipping RFX_MCM_TXT value is correct there too. The other
// three (teal/rust/grey) are fixed literal hex tints BY DESIGN (see RFX_MCM comment below) - they
// never flip, so pairing them with a flipping dark-mode-bright text colour would put light text on
// a tint that stayed light, breaking contrast in dark mode (measured: teal would drop to 1.88:1,
// rust to 1.98:1). Those three instead keep a fixed, dark-safe literal, verified against their own
// constant tint in BOTH themes: teal 4.80:1, rust 5.41:1; grey's prior literal '#8A969E' read only
// 2.58:1 on its own tint in every theme (a pre-existing, theme-independent failure), replaced here
// with the graphite family's light-mode value, 9.57:1.
var RFX_MCM_TINT_THEME_AWARE={plum:1,emph:1,blue:1};
var RFX_MCM_PILL_TXT_FIXED={teal:'#2F6E6B',rust:'#9A3B1F',grey:'#403A33'};
function rfxMcmPillTxt(tone){var tk=RFX_MCM[tone]?tone:'grey';return RFX_MCM_TINT_THEME_AWARE[tk]?rfxMcmTxt(tk):(RFX_MCM_PILL_TXT_FIXED[tk]||RFX_MCM_PILL_TXT_FIXED.grey);}
function rfxMcmPill(label,tone){var tk=RFX_MCM[tone]?tone:'grey',c=RFX_MCM[tk];
 return '<span style="display:inline-flex;align-items:center;gap:5px;font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 10px;border-radius:30px;color:'+rfxMcmPillTxt(tk)+';background:'+c[1]+'">'+escapeHtmlPV(label)+'</span>';}
// ---- Canonical SUPPLIER-IDENTITY colour, dashboard-wide (single source of truth) ----------------
// One fixed colour per supplier, reused everywhere a supplier appears on this tab (radar, the
// Recommendation Case-accordion swatches, Alternatives-card picks, Business Case comparisons/charts/
// term-sheet accents, Participation/Completeness roll-ups): Nimbus Data = plum, Lakehouse Co = teal,
// Helio Warehouse = burnt-orange (emph), the three real bidders on file today, ANCHORED to the same
// RFX_MCM palette every other Recommendation-subtab panel already uses. A supplier beyond those three
// named ones (or a named supplier not yet in the map) gets an EXTENDED slot, assigned in a stable
// rotation by its position in RFX.suppliers so it keeps the same colour on every render, never a
// fabricated identity. This is a SUPPLIER-IDENTITY accent only, distinct from status/tier/gate/risk
// colour (rfxAwardTier / rfxMcmPill toneMap elsewhere), which stays untouched.
var RFX_SUP_TONE_BY_NAME={'Nimbus Data':'plum','Lakehouse Co':'teal','Helio Warehouse':'emph'};
var RFX_SUP_TONE_EXT=['blue','rust','grey'];
function rfxSupplierToneName(n){
 if(n!=null&&RFX_SUP_TONE_BY_NAME.hasOwnProperty(n))return RFX_SUP_TONE_BY_NAME[n];
 var idx=-1;(RFX.suppliers||[]).forEach(function(s,i){if(s.n===n)idx=i;});
 return RFX_SUP_TONE_EXT[(idx<0?0:idx)%RFX_SUP_TONE_EXT.length];
}
function rfxSupplierTone(si){var s=RFX.suppliers&&RFX.suppliers[si];return rfxSupplierToneName(s&&s.n);}
function rfxSupplierColor(si){return RFX_MCM[rfxSupplierTone(si)][0];}
function rfxSupplierColorByName(n){return RFX_MCM[rfxSupplierToneName(n)][0];}
// Small identity swatch (a coloured dot), the same visual weight as rfxBcSwatch on the Business Case
// tab, for a supplier name wherever only the name string (not its RFX.suppliers index) is on hand.
function rfxSupplierSwatch(si){return '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;background:'+rfxSupplierColor(si)+'"></span>';}
function rfxSupplierSwatchByName(n){return '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;background:'+rfxSupplierColorByName(n)+'"></span>';}
function rfxRecommendationHTML(){var R=RFX;var rank=rfxReqRanking();var recSi=rank[0];var rec=R.suppliers[recSi];
 var recC=rfxCoverage(recSi),recTier=rfxAwardTier(recSi,0);
 var sc=rfxScenarioData();
 var recGated=!!(rec.mustFail&&rec.mustFail.length);
 var gating=0,nonConf=0;R.suppliers.forEach(function(s,si){var c=rfxCoverage(si);gating+=rfxFlags(si).filter(function(f){return f.priority==='GATING';}).length;if(!c.conforming&&c.answered>0)nonConf++;});
 // 1) FINAL recommendation banner + supporting argument. Ranking policy: the advisory recommendation
 // LEADS with the top scorer even when it carries an open Must-Have gate; the gate is a prominent flag
 // (badge + business-call note) here, never a reason to drop to the #2 bidder.
 var h='<div class="sect"><div class="secthd"><div class="t">Final recommendation</div></div>';
 h+='<div class="card" style="border-left:3px solid '+recTier.col+'"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:7px"><span style="font-weight:800;font-size:15px;color:'+recTier.col+'">'+escapeHtmlPV(rec.n)+'</span><span style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 10px;border-radius:30px;color:'+recTier.col+';background:'+recTier.bg+'">'+escapeHtmlPV(recTier.label)+' · advisory</span><span style="font-size:12px;color:var(--mut2)">weighted fit '+recC.weightedFit+'/100 · coverage '+recC.coveragePct+'%</span>'+(recGated?' <span style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 10px;border-radius:30px;color:#C8202E;background:var(--pink-t,#FBE7E3)">&#9888; Must-Have gate: '+escapeHtmlPV(rec.mustFail.join(', '))+'</span>':'')+'</div>';
 var arg='On the first-pass response analysis, <b>'+escapeHtmlPV(rec.n)+'</b> is the advisory recommendation, the top panel score in the field: '+rfxRecoText(recSi,0)+(sc.recAnnual!=null?(' Recommended commercial baseline: '+rfxFmtUsd(sc.recAnnual)+'/yr.'):' A firm annual price is still required for the commercial case.');
 if(recGated){
   var nextSi=rank[1];
   arg+=(nextSi!=null?(' <b>'+escapeHtmlPV(R.suppliers[nextSi].n)+'</b> is the next-ranked bidder ('+rfxWeighted(nextSi).toFixed(1)+'/5)'+(rfxGatePass(nextSi)?', clean on every Must-Have.':'.')):'')+' <b>Business call:</b> the panel can proceed with '+escapeHtmlPV(rec.n)+' and accept the gate risk, or secure a dated remediation before award; Theo does not substitute a lower-scoring bidder for the gate alone.';
 }
 arg+=(nonConf?(' Note: '+nonConf+' supplier(s) remain non-conforming on a Must-Have and '+gating+' gating clarification(s) are open across the field; resolve these before the panel finalises.'):' No open Must-Have gate across the conforming field.');
 h+='<div style="font-size:12.5px;color:var(--ink);line-height:1.6">'+arg+'</div>';
 h+='<div class="spnote" style="margin-top:8px">This IS the response-analysis brief, generated live from the submitted responses and internal data. Advisory only: the panel scores, and the award stays conditional until the contract executes.</div></div></div>';
 // The 4 approved Recommendation-subtab panels, in the approved order (2026-07-27 rework). Panel 5,
 // What Happens Next, was REMOVED from this subtab per Marc: its content (the full Advisory & Group
 // Decision + six execution steps) now lives on the Business Case tab's Path To Close accordion
 // (rfxBcPathToCloseHTML), so it is not duplicated here. The condensed What-Happens-Next mini stays on
 // the Overview subtab (rfxWhatsNextMiniHTML, unchanged), sharing the same rfxNextStages() stage data.
 h+=rfxEvaluationReadinessHTML();   // 1: Evaluation Readiness (ring left, checklist right)
 h+=rfxModelDecisionHTML();         // 2: Model the Decision (sliders -> live legend + explain + flipped radar)
 h+=rfxCaseHTML();                  // 3: The Case, Per Supplier (accordion; stat header + narrative)
 h+=rfxScenariosHTML();             // 4: Theo-Modeled Alternatives (framing cards)
 return h;
}
// Evaluation Readiness gate (Recommendation subtab, artifact-audit Part 2): a checklist of
// preconditions, each status derived from existing data (bid-leveling / RFX_NORM, pricing,
// gating clarifications, the merit-vs-gate conflict, TPRM). Reflect-only; it never gates or
// advances the RFx, and a field the data model does not track is marked [CONFIRM], not guessed.
function rfxEvaluationReadinessHTML(){var R=RFX;var rank=rfxReqRanking();var recSi=rank[0];var rec=R.suppliers[recSi];
 var N=RFX_NORM,esc=escapeHtmlPV;
 var items=[];
 // 1) Bid leveling: every priced bidder has a normalized entry on the cross-supplier ZOPA.
 var normNames={};(N.bidders||[]).forEach(function(b){normNames[b.name]=true;});
 var pricedSuppliers=R.suppliers.filter(function(s){return s.pricing&&s.pricing.annual&&String(s.pricing.annual)!=='Not submitted';});
 var leveled=pricedSuppliers.length>0&&pricedSuppliers.every(function(s){return normNames[s.n];});
 items.push({label:'Bid leveling',ok:leveled,detail:leveled?'Every priced bidder is normalized to a common unit on the cross-supplier ZOPA.':'Not every priced bidder has a normalized entry on the cross-supplier ZOPA yet.'});
 // 2) Pricing complete
 var missingPricing=R.suppliers.filter(function(s){return !s.pricing||!s.pricing.annual||String(s.pricing.annual)==='Not submitted';});
 items.push({label:'Pricing complete',ok:missingPricing.length===0,detail:missingPricing.length?(missingPricing.map(function(s){return esc(s.n);}).join(', ')+' has not submitted a firm annual price.'):'Every bidder has a submitted annual price.'});
 // 3) Gating clarifications resolved
 var gatingCount=0;R.suppliers.forEach(function(s,si){gatingCount+=rfxFlags(si).filter(function(f){return f.priority==='GATING';}).length;});
 items.push({label:'Gating clarifications resolved',ok:gatingCount===0,detail:gatingCount===0?'No open GATING clarification items across the field.':(gatingCount+' open GATING clarification item(s) across the field.')});
 // 4) Gate-conflict acknowledged: under the score-ranking policy the recommendation itself can carry
 // an open Must-Have gate (flagged, not demoted). No recorded acknowledgment field exists on RFX, so
 // this reports whether the recommended supplier is gated at all, never a fabricated "acknowledged" state.
 var recGated=!!(rec.mustFail&&rec.mustFail.length);
 items.push({label:'Gate-conflict acknowledged',ok:!recGated,detail:recGated?(esc(rec.n)+' leads the panel score but carries an open Must-Have gap ('+esc(rec.mustFail.join(', '))+'); the panel has not recorded a decision to accept that risk or require remediation before award. [CONFIRM]'):'The recommended supplier clears every Must-Have; no gate conflict to acknowledge.'});
 // 5) Mandatory reviews cleared (TPRM on the recommended supplier)
 var tprm=rec.lilly&&rec.lilly.tprm;
 var tprmOk=!!(tprm&&tprm.status==='approved');
 items.push({label:'Mandatory reviews cleared',ok:tprmOk,detail:tprm?('TPRM on '+esc(rec.n)+' is '+esc(String(tprm.status||'unknown').replace(/-/g,' '))+(tprm.open!=null?' ('+tprm.open+' open)':'')+'.'):('No TPRM record on file for '+esc(rec.n)+'. [CONFIRM]')});
 // Layout A (2026-07-26 rebuild, faithful port of RFx-RECOMMENDATION-OPTIONS-3.html panel 1, option
 // A "Ring left, checklist right"): a completeness ring anchored as a fixed left column with a READY /
 // NOT READY verdict built into it, and the condensed two-column checklist fills the remaining width.
 // Same items/evidence computed above; only the layout changed. MCM-palette-only: plum when ready,
 // deep rust when not.
 var clearCount=items.filter(function(it){return it.ok;}).length;
 var openCount=items.length-clearCount;
 var pct=items.length?Math.round(clearCount/items.length*100):0;
 var ready=openCount===0;
 var gCol=ready?'var(--plum)':'#9A3B1F';
 var gauge='<div style="flex:none;width:108px;height:108px;border-radius:50%;background:conic-gradient('+gCol+' 0% '+pct+'%, #ECEDEE '+pct+'% 100%);display:flex;align-items:center;justify-content:center">'
  +'<div style="width:78px;height:78px;border-radius:50%;background:var(--surface,#fff);display:flex;flex-direction:column;align-items:center;justify-content:center">'
  +'<div style="font-size:19px;font-weight:800;line-height:1;color:'+gCol+'">'+pct+'%</div>'
  +'<div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;margin-top:2px;color:'+gCol+'">'+(ready?'Ready':'Not ready')+'</div>'
  +'</div></div>';
 var gaugeCol='<div style="flex:none;width:132px;display:flex;flex-direction:column;align-items:center;gap:10px;padding-top:2px">'+gauge+'<div style="font-size:11px;color:var(--mut2);text-align:center;line-height:1.4"><b style="color:var(--ink)">'+clearCount+' of '+items.length+'</b> readiness item(s) cleared</div></div>';
 var checklist='<div style="flex:1;min-width:0;column-count:2;column-gap:22px">'+items.map(function(it){
   var pill=rfxMcmPill(it.ok?'Cleared':'Blocked',it.ok?'plum':'rust');
   return '<div style="break-inside:avoid;padding:8px 0;border-top:1px solid var(--line)"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:3px"><span style="font-weight:700;font-size:12px">'+esc(it.label)+'</span>'+pill+'</div><div style="font-size:11.2px;color:var(--mut);line-height:1.45">'+it.detail+'</div></div>';
 }).join('')+'</div>';
 return '<div class="sect"><div class="secthd"><div class="t">Evaluation readiness</div>'+rfxCap(clearCount+' of '+items.length+' cleared')+'</div><div class="card"><div style="display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap">'+gaugeCol+checklist+'</div><div class="spnote" style="margin-top:11px">Reflect-only checklist derived from the bid-leveling, pricing, clarification and TPRM data on file. It does not gate or advance the RFx; the panel and group decision remain the team&rsquo;s.</div></div></div>';
}
// ---- Business Case (Round-5 declutter, 2026-07-26): faithful port of the three approved
// BC-FULLTAB mockups (A/B/C), composed into ONE tab, top to bottom, 6 sections, no block repeated
// twice: (1) header+KPIs+pre-award banner (mockup C) (2) Decision Rationale (mockup A) (3) Deal
// Terms & The Field, term-sheet card left / full terms-vs-field matrix right, the tab's ONE supplier
// comparison (mockup A/C) (4) Deal Economics, 4 stat cards + a chart TOGGLE (3-Yr TCV by Supplier <->
// Savings Waterfall, both ported from mockup C) + mockup A's Mini P&L (subscription/support/
// implementation/training x Year 1-3 with a Basis column) to the right of the toggle, the tab's ONE
// pro-forma view (5) The Ask, Option A in full: rationale KPIs, Value, Risk & Mitigation, Conditions,
// Approval Sought, Committee Decision (all three mockups' shared Option A) (6) Path To Close, a
// 7-row accordion (Advisory & Group Decision + the six execution steps) with a left vertical numbered
// stepper (mockup B's rail, extended to 7 rows; this MERGES the old "What's left to complete the
// deal" panel, retired above). The old standalone Line-item mini-P&L section (mockup A) and simple
// Supplier Comparison section (mockup B) were folded into (4) and (3) respectively per Marc, so
// nothing is shown twice. Every section heading uses the same .grp/.gt/.gsub treatment, matching
// mockup A's uniform section-heading style. Every panel is data-gated; a panel needing data not on
// file omits itself or shows a neutral gap-state, nothing is fabricated. MCM-palette-only throughout (plum
// primary/recommended, teal secondary + Lakehouse's identity color, burnt-orange (var(--emph)) single
// emphasis accent + Helio's identity color, deep rust for critical risk and the SOC 2 style gate,
// muted blue for medium/partial status, grey for not-started); no stoplight red/green, no Lilly
// red/blue. Colors bind to the dashboard's own tokens (var(--plum)/var(--emph)/var(--ink)/var(--mut)/
// var(--line) etc., all theme-adaptive) plus the RFX_MCM literal-hex tones already established by the
// Recommendation-subtab panels above for teal/rust/blue/grey (this dashboard carries no adaptive
// token for those four). Layout is inline-style, matching the rest of this Wave-7/Recommendation
// module's own convention (no CSS file touched).
function rfxBcNum(v){if(v==null)return null;var s=String(v);if(/not submitted/i.test(s))return null;var n=parseFloat(s.replace(/[^0-9.]/g,''));return isFinite(n)?n:null;}
function rfxBcPct(v){if(v==null)return null;var m=/([\d.]+)\s*%/.exec(String(v));return m?parseFloat(m[1]):null;}
// Per-supplier identity color (swatches / chart series / name accents only, never risk or gate status).
// Delegates to the canonical rfxSupplierToneName() (see RFX_MCM / rfxSupplierColor above), so the
// Business Case tab's supplier colours are the SAME single source of truth as the Recommendation
// radar/legend/case-accordion, never a second competing mapping. Output is byte-identical to the
// prior hardcoded version for the three named suppliers on file today.
function rfxBcSupTone(name){return rfxSupplierToneName(name);}
function rfxBcSwatch(name){var c=RFX_MCM[rfxBcSupTone(name)][0];return '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle;background:'+c+'"></span>';}
function rfxBcNeedsChip(label){return '<span style="display:inline-block;font:700 9.5px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:1px 6px;border-radius:4px;color:var(--emph,#C15E19);background:var(--emph-t,#F7E7D8)">'+escapeHtmlPV(label||'Not submitted')+'</span>';}
// Left-accent callout box (The Ask / Approval Sought), tone-driven, MCM-only.
function rfxBcCallout(label,txt,tone){var tk=RFX_MCM[tone]?tone:'plum',c=RFX_MCM[tk];
 // c[0] is the FILL tone, correct for the left-accent border below; the label TEXT sits on this
 // callout's own tint background (c[1]), the same pairing as rfxMcmPill, so it uses the same
 // context-aware rfxMcmPillTxt(tone) (dark-safe where the tint itself is theme-aware, e.g. plum/
 // emph; a fixed safe literal otherwise), never the raw c[0] FILL hex.
 var txtCol=rfxMcmPillTxt(tk);
 return '<div class="card" style="border-left:3px solid '+c[0]+';background:'+c[1]+'"><div style="font:800 10.5px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:'+txtCol+';margin-bottom:5px">'+escapeHtmlPV(label)+'</div><div style="font-size:12.8px;line-height:1.6;color:var(--ink)">'+txt+'</div></div>';}
// Label/value row for the Value rowset in The Ask.
function rfxBcLvRow(label,val,isFirst){return '<div style="padding:11px 16px'+(isFirst?'':';border-top:1px solid var(--line)')+';display:flex;gap:18px;flex-wrap:wrap"><div style="flex:0 0 155px;font-weight:700;font-size:11px;color:var(--plum);text-transform:uppercase;letter-spacing:.03em;font-family:var(--mono)">'+escapeHtmlPV(label)+'</div><div style="flex:1 1 260px;min-width:0;font-size:12.6px;line-height:1.6;color:var(--ink)">'+val+'</div></div>';}
// Risk & Mitigation mini-card.
function rfxBcMiniBox(label,txt,color){return '<div style="flex:1 1 220px;min-width:0;padding:9px 12px;background:var(--panel);border-radius:8px;border:1px solid var(--line2,#CFCDC8)"><div style="font:800 10px var(--sans);text-transform:uppercase;letter-spacing:.03em;margin-bottom:3px;color:'+color+'">'+escapeHtmlPV(label)+'</div><div style="font-size:11.6px;line-height:1.5;color:var(--ink)">'+txt+'</div></div>';}
// Committee Decision card.
function rfxBcDecisionCard(title,tag,txt,trigLabel,trigTxt,tone){var tk=RFX_MCM[tone]?tone:'grey',c=RFX_MCM[tk];
 // border-top stays the FILL tone (c[0]); the title sits on this card's real --surface
 // background, which is theme-aware, so the title uses the dark-safe tone TEXT token.
 return '<div class="card" style="border-top:3px solid '+c[0]+'"><div style="font:800 12.5px var(--sans);letter-spacing:.02em;margin-bottom:3px;color:'+rfxMcmTxt(tk)+'">'+escapeHtmlPV(title)+'</div><div style="font-size:10px;color:var(--mut2);font-weight:700;text-transform:uppercase;letter-spacing:.03em;margin-bottom:8px">'+escapeHtmlPV(tag)+'</div><div style="font-size:12.2px;line-height:1.55;color:var(--ink)">'+txt+'</div><div style="font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--mut2);margin:9px 0 3px">'+escapeHtmlPV(trigLabel)+'</div><div style="font-size:12.2px;line-height:1.55;color:var(--ink)">'+trigTxt+'</div></div>';}

// ============================================================================
// BLOCK 3 (right half): Deal Terms & The Field, term sheet left.
// ============================================================================
function rfxBcDealTermsHTML(si){
 var R=RFX,esc=escapeHtmlPV,s=R.suppliers[si],pr=s.pricing||{};
 var annual=rfxAnnualNum(si),wt=rfxWeighted(si);
 var rank=rfxReqRanking();
 var others=rank.filter(function(i){return i!==si;});
 var pricedAll=R.suppliers.map(function(x,i){return i;}).filter(function(i){return rfxAnnualNum(i)!=null;});
 var isLowestPrice=annual!=null&&pricedAll.every(function(i){return i===si||annual<=rfxAnnualNum(i);});
 var isTopScore=others.every(function(i){return wt>=rfxWeighted(i);});
 var cmp=others.map(function(i){var o=R.suppliers[i],oa=rfxAnnualNum(i),ow=rfxWeighted(i);
   return {n:o.n,priceKnown:(annual!=null&&oa!=null),priceUp:(oa!=null&&annual!=null&&oa>=annual),priceAbs:(oa!=null&&annual!=null)?Math.abs(oa-annual):null,
     scoreUp:(wt>=ow),scoreAbs:Math.abs(wt-ow),risk:rfxRiskLevel(i),gated:!!(o.mustFail&&o.mustFail.length)};});
 var priceLine=cmp.map(function(x){return x.priceKnown?((x.priceUp?'▼ ':'▲ ')+rfxFmtUsd(x.priceAbs)+'/yr vs '+esc(x.n)):null;}).filter(Boolean).join(' · ');
 var scoreLine=cmp.map(function(x){return (x.scoreUp?'▲ +':'▼ ')+x.scoreAbs.toFixed(1)+' vs '+esc(x.n);}).join(' · ');
 var runner=cmp[0];
 var gated=!!(s.mustFail&&s.mustFail.length);
 var h='<div class="card" style="border-left:3px solid var(--plum)">';
 h+='<div class="secthd"><div class="t">Current Deal Terms</div><div class="cap">'+esc(s.n)+' · Recommended</div></div>';
 h+='<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font:800 22px var(--sans);color:var(--plum);line-height:1">'+(annual!=null?rfxFmtUsd(annual):'Not submitted')+'</span>'+(annual!=null?'<span style="font-size:11px;color:var(--mut2)">/yr</span>':'')+'</div>';
 h+='<div style="font-size:11.5px;color:var(--mut2);line-height:1.5;margin-top:3px">'+(priceLine||'no comparable priced bidder')+(isLowestPrice?((priceLine?' · ':'')+'<b style="color:var(--ink)">lowest submitted price</b> in the field'):'')+'</div>';
 h+='<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:10px"><span style="font:800 18px var(--sans);color:var(--plum)">'+wt.toFixed(1)+' / 5</span></div>';
 h+='<div style="font-size:11.5px;color:var(--mut2);line-height:1.5;margin-top:3px">'+scoreLine+(isTopScore?' · <b style="color:var(--ink)">highest panel score</b> in the field':'')+'</div>';
 var kv=[['Term',pr.terms],['Pricing Model',pr.model],['Escalator Cap',pr.escalator],['Pricing Hold',pr.binding],['Volume Discount',pr.discount],['Implementation',pr.impl]].filter(function(r){return r[1]!=null&&r[1]!=='';});
 h+='<div class="kv" style="margin-top:13px">'+kv.map(function(r){return '<div class="k">'+esc(r[0])+'</div><div class="v">'+rfxPriceVal(r[1])+'</div>';}).join('')+'<div class="k">Exit Terms</div><div class="v" style="color:var(--mut2);font-weight:500">Not yet negotiated; addressed in the MSA</div></div>';
 if(runner){
  h+='<div class="read" style="margin-top:13px"><div class="rl">The Counter-Read</div>'+esc(s.n)+' wins on price and score but '+(gated?('carries the field&rsquo;s only Must-Have gate risk ('+esc(s.mustFail.join(', '))+').'):'clears every Must-Have.')+' '+esc(runner.n)+' is '+(runner.priceKnown?(runner.priceUp?(rfxFmtUsd(runner.priceAbs)+'/yr more'):(rfxFmtUsd(runner.priceAbs)+'/yr less')):'not directly comparable on price')+' and '+runner.scoreAbs.toFixed(1)+' '+(runner.scoreUp?'lower':'higher')+' on panel score, but '+runner.risk+' risk and '+(runner.gated?'carries its own open gate.':'gate-clear.')+'</div>';
 }
 h+='</div>';
 return h;
}
// BLOCK 3 (left half): Terms vs the field, full matrix, every submitted term, recommended column highlighted.
function rfxBcTermsMatrixHTML(recSi){
 var R=RFX,esc=escapeHtmlPV;
 var order=[recSi].concat(R.suppliers.map(function(x,i){return i;}).filter(function(i){return i!==recSi;}));
 function tint(i){return i===recSi?' style="background:var(--plum-t,#EDDFE9)"':'';}
 var head=order.map(function(i){var s=R.suppliers[i];return '<th'+tint(i)+'>'+rfxBcSwatch(s.n)+esc(s.n)+(i===recSi?'<br><span style="font-weight:600;text-transform:none;font-size:8.5px">Recommended</span>':'')+'</th>';}).join('');
 function row(label,fn){return '<tr><td style="text-align:left">'+escapeHtmlPV(label)+'</td>'+order.map(function(i){return '<td'+tint(i)+'>'+fn(i)+'</td>';}).join('')+'</tr>';}
 var body='';
 body+=row('Panel Score',function(i){return '<b>'+rfxWeighted(i).toFixed(1)+' / 5</b>';});
 body+=row('Annual Price',function(i){var a=rfxAnnualNum(i);return a!=null?('<b>'+rfxFmtUsd(a)+'</b>'):rfxBcNeedsChip('Not Submitted');});
 body+=row('List Price',function(i){return rfxPriceVal(R.suppliers[i].pricing&&R.suppliers[i].pricing.list);});
 body+=row('Volume Discount',function(i){return rfxPriceVal(R.suppliers[i].pricing&&R.suppliers[i].pricing.discount);});
 body+=row('Implementation',function(i){return rfxPriceVal(R.suppliers[i].pricing&&R.suppliers[i].pricing.impl);});
 body+=row('Est. 3-Yr TCV',function(i){var a=rfxAnnualNum(i);return a!=null?('<b>'+rfxFmtUsd(a*3)+'</b>'):'<span style="color:var(--mut2)">-</span>';});
 body+=row('Pricing Model',function(i){return rfxPriceVal(R.suppliers[i].pricing&&R.suppliers[i].pricing.model);});
 body+=row('Term',function(i){return rfxPriceVal(R.suppliers[i].pricing&&R.suppliers[i].pricing.terms);});
 body+=row('Escalator Cap',function(i){return rfxPriceVal(R.suppliers[i].pricing&&R.suppliers[i].pricing.escalator);});
 body+=row('Pricing Hold',function(i){return rfxPriceVal(R.suppliers[i].pricing&&R.suppliers[i].pricing.binding);});
 body+=row('Risk Level',function(i){var r=rfxRiskLevel(i);var tone=(r==='critical')?'rust':((r==='high')?'emph':((r==='medium')?'blue':'teal'));return rfxMcmPill(r.charAt(0).toUpperCase()+r.slice(1),tone);});
 body+=row('Gate Status',function(i){var g=!!(R.suppliers[i].mustFail&&R.suppliers[i].mustFail.length);return g?rfxMcmPill('Gate Risk','rust'):rfxMcmPill('Clear','teal');});
 body+=row('Exit Terms',function(){return '<span style="color:var(--mut2)">Not yet negotiated</span>';});
 var h='<div class="card">';
 h+='<div class="secthd"><div class="t">Supplier Comparison · Terms vs the Field</div><div class="cap">all evaluated suppliers · '+esc(R.suppliers[recSi].n)+' highlighted</div></div>';
 h+='<div class="mxwrap"><table class="mx" style="width:100%"><thead><tr><th style="text-align:left">Term</th>'+head+'</tr></thead><tbody>'+body+'</tbody></table></div>';
 h+='<div class="spnote">Panel score is the weighted 0-5 evaluation; price, discount, model, term, escalator and pricing hold are as submitted in the pricing schedule. Est. 3-Yr TCV is annual price × 3, indicative and pre-negotiation, excluding implementation and escalation. A supplier with no submitted price shows Not Submitted, never estimated. Reflect-only; this is the tab&rsquo;s one full-field terms comparison.</div>';
 h+='</div>';
 return h;
}

// ============================================================================
// BLOCK 4: Deal Economics, 4 stat cards + a chart TOGGLE (3-Yr TCV by Supplier <-> Savings Waterfall)
// + a simple 3-yr spend pro-forma table.
// ============================================================================
function rfxBcTcvBySupplierSvg(){
 var R=RFX,esc=escapeHtmlPV;
 var W=260,H=150,padB=34,padT=26,barW=54,gap=26,n=R.suppliers.length;
 var totalW=n*barW+(n-1)*gap,padL=(W-totalW)/2,baseY=H-padB;
 var vals=R.suppliers.map(function(s,i){var a=rfxAnnualNum(i);return a!=null?a*3:null;});
 var maxV=Math.max.apply(null,vals.filter(function(v){return v!=null;}).concat([1]));
 var g='<line x1="6" y1="'+baseY+'" x2="'+(W-6)+'" y2="'+baseY+'" stroke="var(--line2,#CFCDC8)" stroke-width="1"></line>';
 R.suppliers.forEach(function(s,i){
  // tone = the bar's FILL colour (correct, unchanged); txtTone = the $ label's TEXT colour, the
  // dark-safe tone-text token, since the label sits on the card's real --surface, not on tone's tint.
  var x=padL+i*(barW+gap),supTone=rfxBcSupTone(s.n),tone=RFX_MCM[supTone][0],txtTone=rfxMcmTxt(supTone),v=vals[i];
  if(v!=null){
   var hgt=Math.max(6,(v/maxV)*(baseY-padT)),y=baseY-hgt;
   g+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barW+'" height="'+hgt.toFixed(1)+'" rx="3" fill="'+tone+'"></rect>';
   g+='<text x="'+(x+barW/2).toFixed(1)+'" y="'+(y-8).toFixed(1)+'" text-anchor="middle" font-family="var(--mono)" font-size="10" font-weight="700" fill="'+txtTone+'">'+rfxFmtUsd(v)+'</text>';
  } else {
   g+='<rect x="'+x.toFixed(1)+'" y="'+(baseY-26).toFixed(1)+'" width="'+barW+'" height="26" rx="3" fill="none" stroke="var(--grey,#8A969E)" stroke-width="1.5" stroke-dasharray="3 3"></rect>';
   g+='<text x="'+(x+barW/2).toFixed(1)+'" y="'+(baseY-32).toFixed(1)+'" text-anchor="middle" font-family="var(--mono)" font-size="7.5" font-weight="700" fill="'+rfxMcmTxt('grey')+'">NOT SUBMITTED</text>';
  }
  g+='<text x="'+(x+barW/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" font-family="var(--sans)" font-size="9.5" font-weight="700" fill="var(--ink)">'+esc(s.n.split(' ')[0])+'</text>';
 });
 return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="3-year TCV comparison across suppliers">'+g+'</svg>';
}
function rfxBcWaterfallSvg(si){
 var R=RFX,s=R.suppliers[si],pr=s.pricing||{};
 var annual=rfxAnnualNum(si),list=rfxBcNum(pr.list);
 if(annual==null||list==null||list<=annual)return '<div style="font-size:11.5px;color:var(--mut2);padding:28px 8px;text-align:center">No list price on file to compute a savings waterfall for '+escapeHtmlPV(s.n)+'.</div>';
 var saving=list-annual,pct=Math.round(saving/list*100);
 var W=260,H=150,padT=20,padB=34,barW=54,gap=24,padL=(W-3*barW-2*gap)/2;
 function Y(v){return padT+(1-(v/list))*(H-padT-padB);}
 var x0=padL,x1=padL+barW+gap,x2=padL+2*(barW+gap);
 var g='';
 g+='<rect x="'+x0.toFixed(1)+'" y="'+Y(list).toFixed(1)+'" width="'+barW+'" height="'+(Y(0)-Y(list)).toFixed(1)+'" rx="3" fill="var(--mut2)" opacity="0.5"></rect>';
 g+='<text x="'+(x0+barW/2).toFixed(1)+'" y="'+(Y(list)-8).toFixed(1)+'" text-anchor="middle" font-family="var(--mono)" font-size="9.5" font-weight="700" fill="var(--ink)">'+rfxFmtUsd(list)+'</text>';
 g+='<text x="'+(x0+barW/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" font-family="var(--mono)" font-size="8.6" fill="var(--mut2)">List</text>';
 g+='<line x1="'+(x0+barW).toFixed(1)+'" y1="'+Y(list).toFixed(1)+'" x2="'+x1.toFixed(1)+'" y2="'+Y(list).toFixed(1)+'" stroke="var(--line2,#CFCDC8)" stroke-dasharray="2 3"></line>';
 g+='<rect x="'+x1.toFixed(1)+'" y="'+Y(list).toFixed(1)+'" width="'+barW+'" height="'+(Y(annual)-Y(list)).toFixed(1)+'" rx="3" fill="var(--emph,#C15E19)" opacity="0.9"></rect>';
 g+='<text x="'+(x1+barW/2).toFixed(1)+'" y="'+(Y(list)-8).toFixed(1)+'" text-anchor="middle" font-family="var(--mono)" font-size="9.5" font-weight="700" fill="var(--emph,#C15E19)">-'+rfxFmtUsd(saving)+'</text>';
 g+='<text x="'+(x1+barW/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" font-family="var(--mono)" font-size="8.6" fill="var(--mut2)">Saving</text>';
 g+='<line x1="'+(x1+barW).toFixed(1)+'" y1="'+Y(annual).toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+Y(annual).toFixed(1)+'" stroke="var(--line2,#CFCDC8)" stroke-dasharray="2 3"></line>';
 g+='<rect x="'+x2.toFixed(1)+'" y="'+Y(annual).toFixed(1)+'" width="'+barW+'" height="'+(Y(0)-Y(annual)).toFixed(1)+'" rx="3" fill="var(--plum)"></rect>';
 g+='<text x="'+(x2+barW/2).toFixed(1)+'" y="'+(Y(annual)-8).toFixed(1)+'" text-anchor="middle" font-family="var(--mono)" font-size="9.5" font-weight="700" fill="var(--plum)">'+rfxFmtUsd(annual)+'</text>';
 g+='<text x="'+(x2+barW/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle" font-family="var(--mono)" font-size="8.6" fill="var(--mut2)">Net</text>';
 g+='<line x1="'+x0.toFixed(1)+'" y1="'+Y(0).toFixed(1)+'" x2="'+(x2+barW).toFixed(1)+'" y2="'+Y(0).toFixed(1)+'" stroke="var(--line2,#CFCDC8)" stroke-width="1"></line>';
 return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="Savings waterfall from list price to negotiated price">'+g+'</svg>';
}
function rfxBcChartToggleHTML(recSi){
 var h='<div class="card" style="padding:12px 13px">';
 h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px">';
 h+='<div style="font:800 10.5px var(--mono);text-transform:uppercase;letter-spacing:.03em;color:var(--ink)" id="rfxBcChartTitle">3-Yr TCV by Supplier</div>';
 h+='<div style="display:flex;gap:6px" role="tablist" aria-label="Chart selector">';
 h+='<button type="button" id="rfxBcToggleTcv" onclick="rfxBcChartToggle(\'tcv\')" style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:4px 9px;border-radius:20px;border:1.5px solid var(--plum);background:var(--plum);color:#fff;cursor:pointer">TCV</button>';
 h+='<button type="button" id="rfxBcToggleWf" onclick="rfxBcChartToggle(\'wf\')" style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:4px 9px;border-radius:20px;border:1.5px solid var(--line2,#CFCDC8);background:var(--card,var(--surface,#fff));color:var(--mut);cursor:pointer">Waterfall</button>';
 h+='</div></div>';
 h+='<div id="rfxBcChartTcv">'+rfxBcTcvBySupplierSvg()+'</div>';
 h+='<div id="rfxBcChartWf" style="display:none">'+rfxBcWaterfallSvg(recSi)+'</div>';
 h+='<div style="font-size:10.3px;color:var(--mut2);margin-top:6px;line-height:1.45" id="rfxBcChartFoot">Helio submitted no price; shown as a gap-state, not a bar.</div>';
 h+='</div>';
 return h;
}
// Chart-toggle handler. A real global function (not an embedded <script>, which would not execute
// once inserted via innerHTML) so it works exactly like the other panel-local handlers this file
// already ships (rfxMdRecompute / rfxMdReset / rfxDD / rfxSub).
window.rfxBcChartToggle=function(which){
 var tcv=document.getElementById('rfxBcChartTcv'),wf=document.getElementById('rfxBcChartWf'),
  bTcv=document.getElementById('rfxBcToggleTcv'),bWf=document.getElementById('rfxBcToggleWf'),
  title=document.getElementById('rfxBcChartTitle'),foot=document.getElementById('rfxBcChartFoot');
 if(!tcv||!wf)return;
 var base='font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:4px 9px;border-radius:20px;cursor:pointer;';
 var onCss=base+'border:1.5px solid var(--plum);background:var(--plum);color:#fff';
 var offCss=base+'border:1.5px solid var(--line2,#CFCDC8);background:var(--card,var(--surface,#fff));color:var(--mut)';
 if(which==='wf'){
  tcv.style.display='none';wf.style.display='';
  if(bTcv)bTcv.style.cssText=offCss;if(bWf)bWf.style.cssText=onCss;
  if(title)title.textContent='Savings Waterfall';
  if(foot)foot.textContent='List and negotiated prices are as submitted; no further post-award concession is modeled here, this is the saving already reflected in the current proposal.';
 } else {
  tcv.style.display='';wf.style.display='none';
  if(bTcv)bTcv.style.cssText=onCss;if(bWf)bWf.style.cssText=offCss;
  if(title)title.textContent='3-Yr TCV by Supplier';
  if(foot)foot.textContent='Helio submitted no price; shown as a gap-state, not a bar.';
 }
};
function rfxBcDealEconomicsHTML(recSi){
 var R=RFX,esc=escapeHtmlPV,s=R.suppliers[recSi],pr=s.pricing||{};
 var annual=rfxAnnualNum(recSi);
 if(annual==null)return '<div class="grp"><span class="gt">Deal Economics</span></div><div class="sect"><div class="card"><div style="font-size:12.5px;color:var(--mut2)">No deal-economics panel could be computed: '+esc(s.n)+'&rsquo;s pricing schedule does not carry a firm annual price.</div></div></div>';
 var impl=rfxBcNum(pr.impl),escPct=rfxBcPct(pr.escalator)||0;
 var years=3,implAmort=impl!=null?Math.round(impl/years):0;
 var cum=0;[1,2,3].forEach(function(y){var sub=Math.round(annual*Math.pow(1+escPct/100,y-1));cum+=sub+implAmort;});
 var totAll=cum;
 var tco3=annual*3;
 // Section heading matches mockup A's uniform .grp/.gt/.gsub treatment (same as every other Business
 // Case section head); the sub-panel that used to sit here (its own .secthd) was dropped so there is
 // one heading per section, not two.
 var h='<div class="grp"><span class="gt">Deal Economics</span><span class="gsub">'+esc(s.n)+' · line items · 3-yr spend pro-forma · one-time implementation</span></div>';
 h+='<div class="sect"><div class="card">';
 h+='<div class="kstrip">';
 h+='<div class="card kc"><div class="kl">Annual Subscription</div><div class="kn">'+rfxFmtUsd(annual)+'</div><div class="ks">'+(pr.model?(esc(pr.model)+' · '):'')+(escPct?('capped '+escPct+'%/yr escalator'):'no escalator on file')+'</div></div>';
 h+='<div class="card kc"><div class="kl">Implementation</div><div class="kn">'+(impl!=null?rfxFmtUsd(impl):'-')+'</div><div class="ks">'+(impl!=null?('fixed fee · one-time, Year 1'):'not on file')+'</div></div>';
 h+='<div class="card kc"><div class="kl">3-Yr TCV (Simple)</div><div class="kn" style="color:var(--plum)">'+rfxFmtUsd(tco3)+'</div><div class="ks">annual price × 3, pre-escalation / implementation</div></div>';
 h+='<div class="card kc"><div class="kl">Total 3-Yr Outlay</div><div class="kn" style="color:var(--emph,#C15E19)">'+rfxFmtUsd(totAll)+'</div><div class="ks">with escalation + implementation, not TCV</div></div>';
 h+='</div>';
 h+='<div style="display:grid;grid-template-columns:minmax(230px,320px) 1fr;gap:20px;align-items:start;margin-top:14px">';
 h+=rfxBcChartToggleHTML(recSi);
 h+='<div>'+rfxBcLineItemPnlTableHTML(recSi)+'</div>';
 h+='</div>';
 // ONE synthesized footnote for the whole Deal Economics section (Marc, 2026-07-26): this used to be
 // two overlapping notes, one here and a near-duplicate under the Mini P&amp;L table
 // (rfxBcLineItemPnlTableHTML, BLOCK 5 below), covering the same split/escalation/TCV-vs-outlay
 // ground twice. Merged into this single note; the Mini P&amp;L's own footnote was removed.
 h+='<div class="spnote" style="margin-top:8px">Subscription / support split and the training sub-allocation are indicative divisions of '+esc(s.n)+'&rsquo;s submitted '+rfxFmtUsd(annual)+'/yr subscription fee'+(impl!=null?(' and '+rfxFmtUsd(impl)+' implementation fee'):'')+'; the schedule does not itemize them separately, and every split reconciles exactly to the submitted totals. Subscription and support escalate at the submitted '+escPct+'%/yr cap; implementation and training are one-time Year-1 costs and are not escalated. Cost-side spend pro-forma (procurement outlay), not a revenue P&amp;L. The 3-Yr TCV ('+rfxFmtUsd(tco3)+') at the top of the tab is the simple annual × 3 figure; the '+rfxFmtUsd(totAll)+' Total 3-Yr Outlay is the fuller figure including escalation and implementation, and the two are deliberately distinct and should not be conflated. Pre-award, indicative; reflect-only.</div>';
 h+='</div></div>';
 return h;
}

// ============================================================================
// BLOCK 5: Line-item mini-P&L table CONTENT ONLY (Subscription / Support / Implementation / Training
// x Year 1-3, with a Basis column). Reads an indicative, clearly-labeled subscription/support/
// training split carried on the seed (RFX.suppliers[].pricing.lineItemSplit); the submitted schedule
// itself does not itemize this far, so a supplier with no split on file simply shows a gap-state
// message, nothing is fabricated. Marc's Business Case redesign (2026-07-26) merged this INTO Deal
// Economics, to the right of the TCV<->Waterfall chart toggle, replacing the old simple 4-column
// pro-forma table there, so this is now A's Mini P&L and the tab's ONE pro-forma view; it used to be
// its own standalone section with its own .secthd heading, now it renders bare (no outer .sect/
// .secthd/.card wrapper) since it lives inside Deal Economics' own card and heading.
// ============================================================================
function rfxBcLineItemPnlTableHTML(recSi){
 var R=RFX,esc=escapeHtmlPV,s=R.suppliers[recSi],pr=s.pricing||{};
 var annual=rfxAnnualNum(recSi);
 if(annual==null)return '';
 var split=pr.lineItemSplit;
 if(!split)return '<div style="font-size:12.5px;color:var(--mut2);padding:6px 2px">No indicative subscription / support / training split is on file for '+esc(s.n)+'; the line-item mini-P&amp;L cannot be computed without fabricating a split.</div>';
 var impl=rfxBcNum(pr.impl),escPct=rfxBcPct(pr.escalator)||0;
 var subPct=split.subscriptionOfAnnualPct/100,supPct=split.supportOfAnnualPct/100;
 var implPct=split.implOfImplPct/100,trainPct=split.trainingOfImplPct/100;
 var subBase=annual*subPct,supBase=annual*supPct;
 var implLine=impl!=null?impl*implPct:null,trainLine=impl!=null?impl*trainPct:null;
 var subRow=[1,2,3].map(function(y){return Math.round(subBase*Math.pow(1+escPct/100,y-1));});
 var supRow=[1,2,3].map(function(y){return Math.round(supBase*Math.pow(1+escPct/100,y-1));});
 var implRow=[implLine!=null?Math.round(implLine):null,null,null];
 var trainRow=[trainLine!=null?Math.round(trainLine):null,null,null];
 function sum3(r){return r.reduce(function(a,v){return a+(v||0);},0);}
 var annualTotals=[0,1,2].map(function(idx){return subRow[idx]+supRow[idx]+(implRow[idx]||0)+(trainRow[idx]||0);});
 var cum=0,cumRow=annualTotals.map(function(v){cum+=v;return cum;});
 var grand=cumRow[2];
 function tr(label,basis,row,tot){return '<tr><td style="text-align:left">'+esc(label)+'</td><td style="text-align:left;font-size:10.5px;color:var(--mut2);font-weight:500">'+esc(basis)+'</td>'+row.map(function(v){return '<td>'+(v!=null?rfxFmtUsd(v):'-')+'</td>';}).join('')+'<td><b>'+rfxFmtUsd(tot)+'</b></td></tr>';}
 var body='';
 body+=tr('Subscription / License','Indicative '+split.subscriptionOfAnnualPct+'% of the annual fee',subRow,sum3(subRow));
 body+=tr('Support & Maintenance','Indicative '+split.supportOfAnnualPct+'% of the annual fee',supRow,sum3(supRow));
 body+=tr('Implementation',impl!=null?('One-time, '+split.implOfImplPct+'% of the fixed implementation fee'):'Not on file',implRow,sum3(implRow));
 body+=tr('Training',impl!=null?('Indicative '+split.trainingOfImplPct+'%, sub-allocated from the implementation fee'):'Not on file',trainRow,sum3(trainRow));
 body+='<tr style="font-weight:800"><td colspan="2" style="text-align:left">Annual Total</td>'+annualTotals.map(function(v){return '<td>'+rfxFmtUsd(v)+'</td>';}).join('')+'<td>'+rfxFmtUsd(grand)+'</td></tr>';
 body+='<tr style="background:var(--nested,var(--panel))"><td colspan="2" style="text-align:left">Cumulative</td>'+cumRow.map(function(v){return '<td>'+rfxFmtUsd(v)+'</td>';}).join('')+'<td>-</td></tr>';
 var h='<div style="font:800 9.5px var(--mono);text-transform:uppercase;letter-spacing:.03em;color:var(--mut2);margin-bottom:8px">Mini P&amp;L · '+esc(s.n)+' (3-Yr) · '+escPct+'% annual escalation on recurring lines only</div>';
 h+='<div class="mxwrap"><table class="mx" style="width:100%"><thead><tr><th style="text-align:left">Line Item</th><th style="text-align:left">Basis</th><th>Year 1</th><th>Year 2</th><th>Year 3</th><th>3-Yr Total</th></tr></thead><tbody>'+body+'</tbody></table></div>';
 // Own footnote removed (Marc, 2026-07-26): merged into the ONE synthesized Deal Economics footnote
 // in rfxBcDealEconomicsHTML (BLOCK 4 above), which already covers this split/escalation ground so
 // the two no longer overlap.
 return h;
}

// ============================================================================
// BLOCK 6 (removed 2026-07-26): the simple Supplier Comparison block (Panel score / Annual price /
// 3-Yr TCV / Risk / Gate) was dropped per Marc; the Deal Terms & The Field terms-vs-field matrix
// (rfxBcTermsMatrixHTML) is the tab's one, fuller supplier comparison, so this was a redundant
// second one. rfxMcmPill/rfxBcNeedsChip/rfxBcSwatch stay in use elsewhere on this tab.
// ============================================================================

// ============================================================================
// BLOCK 5: The Ask, Option A in full (recommendation, grounded rationale KPIs, Value, Risk &
// Mitigation, Conditions & Contingencies, Approval Sought, Committee Decision).
// ============================================================================
function rfxBcAskHTML(recSi){
 var R=RFX,esc=escapeHtmlPV,rec=R.suppliers[recSi],c=rfxCoverage(recSi),annual=rfxAnnualNum(recSi),tco3=annual!=null?annual*3:null;
 var pr=rec.pricing||{};
 var gated=!!(rec.mustFail&&rec.mustFail.length);
 var gateTxt=gated?esc(rec.mustFail.join(', ')):'';
 var rank=rfxReqRanking();var nextSi=rank[1];var next=nextSi!=null?R.suppliers[nextSi]:null;
 var nextAnnual=next?rfxAnnualNum(nextSi):null;
 var incomplete=R.suppliers.filter(function(s,si){return rfxAnnualNum(si)==null;});

 var h=rfxBcCallout('The Ask','Award the enterprise data platform contract to <b>'+esc(rec.n)+'</b>'+(gated?(', subject to the '+gateTxt+' condition below and to final contract execution.'):', subject to final contract execution.'),'plum');

 h+='<div class="grp" style="margin-top:16px"><span class="gt" style="font-size:11.5px">Grounded Rationale</span><span class="gsub">why '+esc(rec.n)+', on the panel&rsquo;s own criteria</span></div>';
 h+='<div class="sect card">';
 h+='<div style="font-size:12.8px;line-height:1.65;color:var(--ink)">'+esc(rec.n)+' returned the highest weighted panel score in the field, <b>'+rfxWeighted(recSi).toFixed(1)+' out of 5</b>, and fully meets <b>'+c.coveragePct+'%</b> of the '+R.requirements.length+' RFx requirements, leading the field on functional fit, commercial offer and self-service usability.'+(gated?(' It does not lead on security &amp; compliance, which is why the '+gateTxt+' gate below stands as a named condition rather than a silent risk.'):' It clears every Must-Have on file.')+' The evaluation policy keeps the top scorer as the advisory recommendation with any gate flagged, not demoted.</div>';
 h+='<div class="kstrip" style="margin-top:12px">';
 h+='<div class="card kc"><div class="kl">Panel Score</div><div class="kn" style="color:var(--plum)">'+rfxWeighted(recSi).toFixed(1)+' / 5</div><div class="ks">field-leading, all suppliers scored</div></div>';
 h+='<div class="card kc"><div class="kl">Coverage</div><div class="kn">'+c.coveragePct+'%</div><div class="ks">of '+R.requirements.length+' requirements fully met</div></div>';
 h+='<div class="card kc"><div class="kl">Field</div><div class="kn">'+R.suppliers.length+' Scored</div><div class="ks">'+(incomplete.length?('+ '+incomplete.length+' incomplete bid'+(incomplete.length>1?'s':'')+' ('+incomplete.map(function(s){return esc(s.n);}).join(', ')+', no price)'):'all bids priced')+'</div></div>';
 h+='<div class="card kc'+(gated?' emph':'')+'"><div class="kl">Gate Status</div><div class="kn" style="color:'+(gated?'var(--emph,#C15E19)':'var(--plum)')+'">'+(gated?'1 Open':'Clear')+'</div><div class="ks">'+(gated?(gateTxt+', Must-Have'):'every Must-Have met')+'</div></div>';
 h+='</div></div>';

 h+='<div class="grp" style="margin-top:16px"><span class="gt" style="font-size:11.5px">Value</span><span class="gsub">indicative, pre-negotiation</span></div>';
 h+='<div class="sect card" style="padding:0">';
 h+=rfxBcLvRow('Annual Price',(annual!=null?('<b>'+rfxFmtUsd(annual)+'</b>/yr'+(pr.discount&&String(pr.discount)!=='Not submitted'?(', '+esc(pr.discount)+' below the '+(pr.list?esc(pr.list):'list price')+', held firm'+(pr.binding?(' '+esc(pr.binding).toLowerCase().replace(/^yes,\s*/,'')):'')+'.'):'.')):'Not yet submitted.'),true);
 h+=rfxBcLvRow('Implementation',pr.impl?('<b>'+esc(pr.impl)+'</b> (as submitted).'):'Not on file.');
 h+=rfxBcLvRow('Terms',(pr.terms?esc(pr.terms):'terms not on file')+(pr.escalator?('; escalator '+esc(pr.escalator).toLowerCase()+'.'):'.'));
 h+=rfxBcLvRow('Indicative 3-Yr TCV',(tco3!=null?('<b>'+rfxFmtUsd(tco3)+'</b> (annual × 3, before implementation and escalators). Illustrative only, not the negotiated contract value.'):'Pending a firm annual price.'));
 h+='</div>';

 h+='<div class="grp" style="margin-top:16px"><span class="gt" style="font-size:11.5px">Risk &amp; Mitigation</span></div>';
 h+='<div class="sect card">';
 if(gated){
  h+='<div style="font-size:12.8px;line-height:1.65;color:var(--ink)">The open item is <b>'+gateTxt+'</b>, a Must-Have under the requirements register. '+esc(rec.n)+' does not currently satisfy it; per the panel&rsquo;s own clarification process, an in-progress remediation does not satisfy the gate at award. It is the requirement the recommendation carries as an open risk rather than a silent one.</div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:11px">';
  h+=rfxBcMiniBox('Preferred Mitigation','Secure a dated remediation commitment from '+esc(rec.n)+' for the '+gateTxt+' gap; hold contract execution until it is received.','var(--plum)');
  h+=rfxBcMiniBox('Accept-Risk Fallback','Panel documents formal acceptance of the gap and proceeds without remediation; requires explicit sign-off, not a default.','var(--mut2)');
  h+=rfxBcMiniBox('Walk-Away Comparator',next?('<b>'+esc(next.n)+'</b> is clean on every Must-Have today'+(nextAnnual!=null?(' at an indicative '+rfxFmtUsd(nextAnnual)+'/yr'):'')+(annual!=null&&nextAnnual!=null?(', about '+rfxFmtUsd(Math.abs(nextAnnual-annual))+'/yr '+(nextAnnual>=annual?'above':'below')+' '+esc(rec.n)+'.'):'.')):'No conforming alternative is on file today.',rfxMcmTxt('rust'));
  h+='</div>';
 } else {
  h+='<div style="font-size:12.8px;line-height:1.65;color:var(--ink)">No open Must-Have gap is on file for '+esc(rec.n)+'; residual risk is the standard pre-negotiation commercial and legal exposure carried into the MSA process.</div>';
 }
 h+='</div>';

 h+='<div class="grp" style="margin-top:16px"><span class="gt" style="font-size:11.5px">Conditions &amp; Contingencies</span></div>';
 h+='<div class="sect card"><ul style="margin:0;padding-left:18px;font-size:12.5px;line-height:1.75;color:var(--ink)">';
 if(gated){
  h+='<li>'+esc(rec.n)+' must deliver a dated '+gateTxt+' remediation commitment before contract execution proceeds to signature.</li>';
  h+='<li>Negotiation targets the submitted implementation quote and confirms the escalator cap survives redline.</li>';
  h+='<li>If '+esc(rec.n)+' cannot commit to a dated remediation path, the recommendation reverts to '+(next?('<b>'+esc(next.n)+'</b>, the conforming alternative'):'the next-ranked conforming bidder')+', per the response analysis.</li>';
 } else {
  h+='<li>Negotiation targets the submitted implementation quote and confirms the escalator cap survives redline.</li>';
  h+='<li>Standard Legal and InfoSec review proceed on the usual timeline; no gating condition is attached to '+esc(rec.n)+'.</li>';
 }
 h+='</ul></div>';

 h+='<div class="grp" style="margin-top:16px"><span class="gt" style="font-size:11.5px">Approval Sought</span></div>';
 h+='<div class="sect">'+rfxBcCallout('Specific To This Session','Panel confirmation of '+esc(rec.n)+' as the recommended award, and authorization to proceed into contract negotiation. The award itself remains conditional on contract execution'+(gated?(' and on satisfying the '+gateTxt+' condition above'):'')+'; this is not a final award decision.','emph')+'</div>';

 h+='<div class="grp" style="margin-top:16px"><span class="gt" style="font-size:11.5px">Committee Decision</span><span class="gsub">choose one, each path states what it triggers</span></div>';
 h+='<div class="sect" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">';
 h+=rfxBcDecisionCard('Approve','Proceed On Current Terms','Negotiation begins immediately.'+(gated?(' The panel accepts the '+gateTxt+' gate as a documented, known risk carried into contract execution.'):' The panel proceeds on the current, gate-clear terms.'),'Triggers','Category team opens negotiation this week'+(gated?'; no remediation condition attached.':'.'),'teal');
 h+=rfxBcDecisionCard('Approve With Conditions','Recommended Path','Negotiation begins, but contract execution is held until '+esc(rec.n)+' delivers'+(gated?(' a dated '+gateTxt+' remediation commitment.'):' any outstanding condition on file.'),'Triggers','Legal and procurement track the condition to close; execution blocked until cleared.','plum');
 h+=rfxBcDecisionCard('Decline','Do Not Pursue '+esc(rec.n.split(' ')[0]),'The panel refers to '+(next?('<b>'+esc(next.n)+'</b>, the conforming alternative'):'the next-ranked bidder')+', or directs the category team to reopen the field.','Triggers',(next?(esc(rec.n)+' negotiation does not open; '+esc(next.n)+' business case is prepared for the next session.'):'Negotiation does not open; the category team reopens the field.'),'rust');
 h+='</div>';

 return h;
}

// ============================================================================
// BLOCK 6: Path To Close, a 7-row accordion (Advisory & Group Decision + the six execution steps)
// with a left vertical numbered stepper. Merges the old "What's left to complete the deal" panel.
// ============================================================================
function rfxBcPathToCloseHTML(recSi){
 var R=RFX,esc=escapeHtmlPV,rec=R.suppliers[recSi];
 var rank=rfxReqRanking();var nextSi=rank[1];var next=nextSi!=null?R.suppliers[nextSi]:null;
 var annual=rfxAnnualNum(recSi),pr=rec.pricing||{};
 var rel=(rec.lilly&&rec.lilly.relationship)||'';
 var hasMsa=/\bMSA\b/i.test(rel);
 var tprm=rec.lilly&&rec.lilly.tprm;
 var tprmStatus=tprm?String(tprm.status||'unknown'):null;
 var tprmOk=tprmStatus==='approved';
 var gated=!!(rec.mustFail&&rec.mustFail.length);
 var gateTxt=gated?esc(rec.mustFail.join(', ')):'';

 var steps=[];
 steps.push({name:'Advisory & Group Decision',status:'In Progress',tone:'emph',owner:'RFx Panel · Category Team',
  dep:'Nothing upstream; this is the entry point to closing the deal.',
  desc:'Theo advisory (first-pass response analysis) is complete. Panel scoring is underway across the requirements matrix. The open item is the group decision: '+(gated?('accept the '+gateTxt+' gate risk with <b>'+esc(rec.n)+'</b>'+(annual!=null?(' ('+rfxFmtUsd(annual)+'/yr)'):'')+' and proceed to negotiation'):('proceed with <b>'+esc(rec.n)+'</b>'))+(next?(', or select <b>'+esc(next.n)+'</b>'+(rfxAnnualNum(nextSi)!=null?(' ('+rfxFmtUsd(rfxAnnualNum(nextSi))+'/yr)'):'')+(rfxGatePass(nextSi)?', the clean conforming alternative that clears every Must-Have.':'.')):'.'),
  unblock:'A recorded group decision names the supplier and opens Negotiation.'});
 steps.push({name:'Negotiation',status:'Not Started',tone:'grey',owner:'Category Lead · Procurement',
  dep:'The group decision (step 1) names the supplier.',
  desc:'Firm the commercial terms with the selected supplier. '+esc(rec.n)+'&rsquo;s submitted pricing is '+(annual!=null?(rfxFmtUsd(annual)+'/yr'):'not yet firm')+(pr.discount&&String(pr.discount)!=='Not submitted'?(' ('+esc(pr.discount)+' off '+(pr.list?esc(pr.list):'the list price')+', '+(pr.binding?esc(pr.binding).toLowerCase().replace(/^yes,\s*/,''):'held firm')+')'):'')+(pr.impl?(' plus '+esc(pr.impl)+' implementation'):'')+(pr.escalator?(', capped at a '+esc(String(pr.escalator).replace(/^capped\s*/i,'')).toLowerCase()+' escalator.'):'.'),
  unblock:'A recorded group decision starts the clock'+(pr.binding&&/\d+\s*day/i.test(String(pr.binding))?('; '+esc(rec.n)+'&rsquo;s price hold is the practical deadline to close terms.'):'.')});
 steps.push({name:'Legal &amp; MSA',status:hasMsa?'Partial':'Not Started',tone:hasMsa?'blue':'grey',owner:'Legal',
  dep:'The commercial terms taking shape in Negotiation.',
  desc:(hasMsa?('An MSA relationship is already on file for '+esc(rec.n)+' ('+esc(rel)+'); confirm it covers this scope or negotiate an amendment.'):('No prior Lilly MSA is on file for '+esc(rec.n)+' ('+esc(rel||'net-new relationship')+').'))+(rec.narr&&rec.narr.legal?(' '+esc(rec.narr.legal)):''),
  unblock:'Closing the open legal items clears this step and feeds the FRAP submission.'});
 steps.push({name:'Security &amp; InfoSec (TPRM)',status:tprmOk?'Cleared':(tprm?'Partial':'Not Started'),tone:tprmOk?'plum':(tprm?'blue':'grey'),owner:'InfoSec · TPRM',
  dep:'Independent track; does not wait on Legal or Negotiation to start.',
  desc:(tprm?('TPRM on '+esc(rec.n)+' is '+esc(tprmStatus.replace(/-/g,' '))+(tprm.open!=null?(' ('+tprm.open+' open item(s))'):'')+'.'):('No TPRM record on file for '+esc(rec.n)+'.'))+(gated?(' Separately, the RFx&rsquo;s Must-Have '+gateTxt+' gate is unresolved.'):''),
  gateNote:gated?('⚠ Gate: '+gateTxt+' gate, award is barred until it is resolved or the panel formally accepts the risk.'):'',
  unblock:(tprm&&tprm.open?('The '+tprm.open+' open TPRM item(s) clearing'):'TPRM clearing')+(gated?(', plus the '+gateTxt+' gate resolved (or a documented risk acceptance, or a fallback to '+(next?esc(next.n):'the conforming alternative')+'), unblocks this step and the Award gate it feeds.'):' unblocks this step.')});
 steps.push({name:'FRAP Approval',status:'Not Started',tone:'grey',owner:'FRAP Approval Chain',
  dep:'Negotiation and Legal &amp; MSA both settled.',
  desc:'Route the finalized business case and commercial terms through the FRAP approval chain.'+(R.cci?(' RFx intent records this as a '+esc(R.cci)+' CCI engagement'):'')+(R.tco?(', '+esc(R.tco)+'.'):'.'),
  unblock:'A closed negotiation and a resolved MSA redline together open the FRAP submission.'});
 steps.push({name:'Purchase Order',status:'Not Started',tone:'grey',owner:'Procurement Operations',
  dep:'FRAP approval (step 5).',
  desc:'Issue the purchase order against the negotiated and FRAP-approved terms.',
  unblock:'FRAP sign-off releases the PO.'});
 steps.push({name:'Award',status:'Not Started',tone:'grey',owner:'Panel · Group (executed via contract)',
  dep:'PO issued'+(gated?(' and the '+gateTxt+' gate resolved (step 4).'):'.'),
  desc:'Execute the contract. Conditional on every step above; award is subject to contract.',
  gateNote:gated?('⚠ Gate: cannot close while the '+gateTxt+' gate is open; see Security &amp; InfoSec above.'):'',
  unblock:'PO in hand'+(gated?(' plus the gate resolved (or a documented risk acceptance, or the '+(next?esc(next.n):'conforming alternative')+' fallback) unblocks Award.'):' unblocks Award.')});

 var rows=steps.map(function(st,i){
  var c=RFX_MCM[st.tone]||RFX_MCM.grey,last=(i===steps.length-1);
  var rail='<div style="flex:none;width:26px;display:flex;flex-direction:column;align-items:center">'
   +'<div style="flex:none;width:26px;height:26px;border-radius:50%;color:#fff;font:800 11px var(--sans);display:flex;align-items:center;justify-content:center;margin-top:6px;background:'+c[0]+'">'+(i+1)+'</div>'
   +(last?'':'<div style="flex:1;width:2px;background:var(--line2,#CFCDC8);margin:2px 0"></div>')
   +'</div>';
  var acc='<details class="card" style="margin:0 0 14px;padding:0;overflow:hidden;flex:1;min-width:0"'+(i===0?' open':'')+'>';
  acc+='<summary style="cursor:pointer;list-style:none;padding:12px 15px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
   +'<span style="font-weight:700;font-size:13.5px;color:var(--ink)">'+st.name+'</span>'
   +rfxMcmPill(st.status,st.tone)
   +'<span style="font-size:10.8px;color:var(--mut2);font-family:var(--mono)">'+st.owner+'</span>'
   +'</summary>';
  acc+='<div style="padding:12px 16px 15px;border-top:1px solid var(--line)">';
  acc+='<div style="font-size:12.3px;line-height:1.6;color:var(--ink);margin-bottom:9px">'+st.desc+'</div>';
  acc+='<div style="font-size:11.4px;color:var(--mut);line-height:1.55;margin-bottom:9px"><b style="color:var(--ink)">Depends on:</b> '+st.dep+'</div>';
  if(st.gateNote)acc+='<div style="margin-bottom:9px;padding:8px 11px;border-radius:8px;background:var(--rust-t,#F3DFD6);color:var(--rust,#9A3B1F);font-size:11.4px;line-height:1.5;font-weight:600">'+st.gateNote+'</div>';
  acc+='<div style="padding:9px 12px;border-radius:8px;background:var(--panel);border-left:3px solid var(--plum);font-size:11.8px;line-height:1.55;color:var(--ink)"><b style="color:var(--plum)">What unblocks it:</b> '+st.unblock+'</div>';
  acc+='</div></details>';
  return '<div style="display:flex;gap:14px;align-items:stretch">'+rail+acc+'</div>';
 }).join('');

 var h='<div class="grp"><span class="gt">Path To Close</span><span class="gsub">the advisory decision, then the six execution steps to close · reflect-only, the panel and group decide</span></div>';
 h+='<div class="sect"><div style="display:flex;flex-direction:column">'+rows+'</div></div>';
 return h;
}

// ============================================================================
// Business Case subtab (5th RFx subtab), Round-5 declutter: see the module header above for the
// full 6-section composition. Reflect-only throughout; nothing here is submitted, sent, or actioned.
// ============================================================================
function rfxBusinessCaseHTML(){
 var R=RFX,esc=escapeHtmlPV;
 var rank=rfxReqRanking();var recSi=rank[0];var rec=R.suppliers[recSi];
 var c=rfxCoverage(recSi);
 var pr=rec.pricing||{};
 var annual=rfxAnnualNum(recSi);
 var tco3=annual!=null?annual*3:null;
 var gated=!!(rec.mustFail&&rec.mustFail.length);
 var h='<div class="rfxrpt">';

 // ---- 1: Header + KPIs + pre-award banner ----
 h+='<div class="rtitle"><span class="nm">Business Case · '+esc(rec.n)+'</span><span class="stage">Recommended Supplier · Advisory</span></div>';
 h+='<div style="font-size:13px;color:var(--mut);line-height:1.6;max-width:920px;margin-bottom:14px">Recommended award to <b>'+esc(rec.n)+'</b>, the top panel score in the field'+(gated?(', subject to the open '+esc(rec.mustFail.join(', '))+' gate and final contract execution.'):', clear on every Must-Have, subject to final contract execution.')+' Every figure below is pre-negotiation and indicative unless marked otherwise.</div>';
 h+='<div class="kstrip">';
 h+='<div class="card kc"><div class="kl">Weighted Fit</div><div class="kn" style="color:var(--plum)">'+c.weightedFit+' / 100</div><div class="ks">'+c.coveragePct+'% of requirements fully met</div></div>';
 h+='<div class="card kc"><div class="kl">Annual Price</div><div class="kn">'+(annual!=null?rfxFmtUsd(annual):'Not submitted')+'</div><div class="ks">'+(pr.model?esc(pr.model):'pricing model on file')+(pr.discount&&String(pr.discount)!=='Not submitted'?(' · '+esc(pr.discount)+' below list'):'')+'</div></div>';
 h+='<div class="card kc"><div class="kl">3-Yr TCV</div><div class="kn" style="color:var(--plum)">'+(tco3!=null?rfxFmtUsd(tco3):'-')+'</div><div class="ks">annual price × 3, before implementation &amp; escalators</div></div>';
 h+='<div class="card kc'+(gated?' emph':'')+'"><div class="kl">Gate Status</div><div class="kn" style="color:'+(gated?'var(--emph,#C15E19)':'var(--plum)')+'">'+(gated?'Open':'Clear')+'</div><div class="ks">'+(gated?(esc(rec.mustFail.join(', '))+' · Must-Have'):'Every Must-Have met')+'</div></div>';
 h+='</div>';
 h+='<div class="card" style="border-left:3px solid var(--emph,#C15E19);background:var(--emph-t,#F7E7D8);margin-bottom:16px"><div style="font-size:12.5px;color:var(--ink);line-height:1.5"><b>Pre-award pricing.</b> Every figure in this business case is the supplier&rsquo;s submitted, pre-final-negotiation proposal. Further negotiation is expected post-award; nothing here is a locked or executed price.</div></div>';

 // ---- 2: Decision Rationale ----
 h+='<div class="grp"><span class="gt">Decision Rationale</span><span class="gsub">why '+esc(rec.n)+', grounded in the response analysis</span></div>';
 h+='<div class="sect"><div class="card"><div style="font-size:12.5px;line-height:1.6;color:var(--ink)">'+rfxRecoText(recSi,0)+'</div>'+((rec.report&&rec.report.overall&&rec.report.overall.take)?('<div class="take" style="margin-top:10px">'+rec.report.overall.take+'</div>'):'')+'</div></div>';

 // ---- 3: Deal Terms & The Field ----
 h+='<div class="grp"><span class="gt">Deal Terms &amp; The Field</span><span class="gsub">current terms for '+esc(rec.n)+', and how it compares to the rest of the field</span></div>';
 h+='<div class="sect" style="display:grid;grid-template-columns:300px 1fr;gap:18px;align-items:start">'+rfxBcDealTermsHTML(recSi)+rfxBcTermsMatrixHTML(recSi)+'</div>';

 // ---- 4: Deal Economics (stat cards + TCV<->Waterfall toggle + A's Mini P&L, the tab's one
 // pro-forma view; the old standalone Line-item mini-P&L section and the simple Supplier Comparison
 // section were merged/removed here per Marc, so the tab is 6 sections, not 8, no redundancy) ----
 h+=rfxBcDealEconomicsHTML(recSi);

 // ---- 5: The Ask ----
 h+='<div class="grp"><span class="gt">The Ask</span><span class="gsub">recommendation · value · risk · conditions · approval · committee decision</span></div>';
 h+=rfxBcAskHTML(recSi);

 // ---- 6: Path To Close ----
 h+=rfxBcPathToCloseHTML(recSi);

 h+='</div>';
 return h;
}
// ============================================================================
// WAVE-7 · RFx Tier-4 net-new (items 33-38). Reflect-only analytical depth:
// sensitivity, inter-rater variance + team-vs-AI reconciliation, Q&A + draft
// letters, the deep async brief, requirements-builder richness, and multi-scenario
// award narration. Pure/deterministic engines + renderers. NOTHING is scored,
// selected, sent, or awarded; letters and the brief are DRAFTS; the human panel
// is READ, never rewritten. Bold-Blue var(--plum) accent, amber caution, red gating.
// ============================================================================
// ---- shared money + weight helpers ----
function rfxParseUsd(v){if(v==null)return null;var s=String(v);if(/not submitted/i.test(s))return null;var d=s.replace(/[^0-9.]/g,'');if(!d)return null;var n=parseFloat(d);return isFinite(n)?n:null;}
function rfxFmtUsd(n){if(n==null)return '-';return (n<0?'-$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');}
function rfxFmtSignedUsd(n){if(n==null)return 'pending';if(n===0)return '$0';return (n>0?'+$':'−$')+Math.abs(Math.round(n)).toLocaleString('en-US');}
// set-level category_weights (item 37), DERIVED from per-requirement weights so it can't drift.
function rfxCategoryWeights(){var totalW=RFX.requirements.reduce(function(a,r){return a+r.weight;},0)||1;
 return rfxCats().map(function(cat){var w=RFX.requirements.filter(function(r){return r.category===cat;}).reduce(function(a,r){return a+r.weight;},0);
  return {cat:cat,weight:w,share:w/totalW,pct:Math.round(w/totalW*100)};});}
// per-supplier fit within a category (0-100) from the per-requirement first-pass scores (null score = 0).
function rfxCatFit(si,cat){var rs=RFX.requirements.filter(function(r){return r.category===cat;});var num=0,den=0;
 rs.forEach(function(r){var v=rfxRqScore(si,r.id);num+=r.weight*(v==null?0:v);den+=r.weight*5;});return den?num/den*100:0;}
// overall weighted fit (0-100) under an arbitrary category share map; base shares reproduce coverage.weightedFit.
function rfxOverallFitUnder(si,shareMap){var f=0;rfxCats().forEach(function(cat){f+=(shareMap[cat]||0)*rfxCatFit(si,cat);});return f;}
// ---- Panel 2, Model the Decision (2026-07-26 right-column redesign, de-bubbled, base = RFx-RADAR-
// FLIP-OPTIONS.html Option A): three true columns -- compact per-category weight sliders LEFT, the
// requirement-category fit radar CENTER, and a flat (no boxed cards) right column TOP-to-BOTTOM:
// live ranking scores, then grounded insight/analysis, then the supplier color legend. The old boxed
// "kc" ranking cards and the old full-width Ranking-Under-These-Weights block below the radar are
// both gone; the live scores moved into the right column's top, the closest-lever narrative into its
// middle. Sections are separated by a thin var(--line) divider, matching this tab's flat style
// elsewhere (rfxBcLvRow etc.), never a card background. The radar itself is FLIPPED from the old
// supplier-spoke design: the spokes are the requirement CATEGORIES (rfxCats(), always a full frame
// regardless of how many suppliers are scored) and each SUPPLIER is one colored polygon tracing its
// per-category fit, both generated in a loop, never hardcoded to a category or supplier count. The
// per-category fit shape is fixed (derived from rfxCatFit(), the response-analysis scores); only the
// right column's live scores/insight text move when a slider moves. Reflect-only; the panel's real
// weights and scores never change. Unlike the rest of this tab, dragging a slider does NOT re-render
// the whole RFx tab (that would rebuild this entire innerHTML on every input tick); the window.rfxMd*
// entry points below patch only this panel's own DOM nodes directly. Base weights and the per-
// supplier fit matrix are DERIVED live from rfxCategoryWeights()/rfxCatFit(), never duplicated, so
// they can't drift from the rest of the tab. Supplier swatches use the canonical rfxSupplierColor()
// identity palette (see RFX_MCM / rfxSupplierColor below), never a status colour; a gated supplier
// still plots on the radar and in the top scores list, marked with the standard rfxMcmPill('Gated',
// 'rust'), never hidden. The bottom legend is the radar's static colour key (swatch + name only, no
// score, unsorted, submission order); it never re-sorts, unlike the top scores list.
function rfxModelDecisionBaseWeights(){var m={};rfxCategoryWeights().forEach(function(w){m[w.cat]=w.pct;});return m;}
function rfxModelDecisionHTML(){
 var cats=rfxCats();var base=rfxModelDecisionBaseWeights();
 var scored=RFX.suppliers.filter(function(s,si){return rfxCoverage(si).answered>0;});
 var capLbl='font:800 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2)';
 var h='<div class="sect"><div class="secthd"><div class="t">Model The Decision</div>'+rfxCap('adjust the weights · live re-rank · reflect-only')+'</div>';
 if(scored.length<2){h+='<div class="card"><div style="font-size:12.5px;color:var(--mut)">Fewer than two scored suppliers, nothing to model yet.</div></div></div>';return h;}
 h+='<div class="card"><div style="display:grid;grid-template-columns:220px minmax(280px,340px) minmax(0,1fr);gap:22px;align-items:start">';
 // COL 1 (left): the weight sliders, unchanged.
 h+='<div><div style="'+capLbl+';margin-bottom:8px">Category Weights</div>';
 h+=cats.map(function(c,i){var pct=Math.round(base[c]||0);
   return '<div style="margin-bottom:7px"><div style="display:flex;justify-content:space-between;font-size:10.6px;margin-bottom:2px"><span style="font-weight:700">'+escapeHtmlPV(titleCase(c))+'</span><span id="rfxMdPct'+i+'" style="font-weight:800;color:var(--plum)">'+pct+'%</span></div><input type="range" min="0" max="50" value="'+pct+'" id="rfxMdW'+i+'" oninput="rfxMdRecompute()" style="width:100%;height:4px;accent-color:var(--plum);margin:2px 0"></div>';
 }).join('');
 h+='<button type="button" class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="rfxMdReset()">Reset to Filed Weights</button></div>';
 // COL 2 (center): the radar, on its own, no legend riding along beside it any more.
 h+='<div style="min-width:0"><div style="'+capLbl+';margin-bottom:7px">Requirement-Category Fit Radar</div><div id="rfxMdRadar"></div></div>';
 // COL 3 (right): de-bubbled, flat, three stacked sections separated by a thin divider -- top scores,
 // middle grounded insight, bottom static colour legend. No card/box background anywhere in this
 // column; matches the flat label/value style used elsewhere on this tab (e.g. rfxBcLvRow).
 h+='<div style="display:flex;flex-direction:column;min-width:0">';
 h+='<div style="padding-bottom:12px"><div style="'+capLbl+';margin-bottom:8px">Ranking Under These Weights</div><div id="rfxMdScores"></div></div>';
 h+='<div style="padding:12px 0;border-top:1px solid var(--line)"><div id="rfxMdExplain" style="font-size:12px;line-height:1.6;color:var(--mut)"></div></div>';
 h+='</div>';
 h+='</div></div>';
 h+='</div></div>';
 // Initial paint: the DOM nodes above don't exist until this string is inserted by the caller
 // (rfxSub()/rfxDD()/etc via $('#tabbody').innerHTML=...), so schedule the first compute for the next
 // tick, same pattern as window.pvTabScrollSyncAll elsewhere on this tab.
 setTimeout(function(){if(window.rfxMdRecompute)window.rfxMdRecompute();},0);
 return h;
}
(function(){
 function cats(){return rfxCats();}
 function fitMatrix(){var c=cats(),out={};RFX.suppliers.forEach(function(s,si){out[si]=c.map(function(cat){return rfxCatFit(si,cat);});});return out;}
 function conf(si){var c=rfxCoverage(si);return c.answered>0&&c.conforming&&!c.disqualified;}
 function baseWeightsArr(){var m=rfxModelDecisionBaseWeights();return cats().map(function(c){return m[c]||0;});}
 function readSliders(){return cats().map(function(c,i){var el=document.getElementById('rfxMdW'+i);return el?(parseInt(el.value,10)||0):baseWeightsArr()[i];});}
 function computeFits(weightsArr){var sum=0;weightsArr.forEach(function(v){sum+=v;});if(!sum)sum=1;var fm=fitMatrix(),out={};
  RFX.suppliers.forEach(function(s,si){var f=0;fm[si].forEach(function(v,i){f+=(weightsArr[i]/sum)*v;});out[si]=f;});return out;}
 function curLeader(fits){var best=-1,idx=-1;RFX.suppliers.forEach(function(s,si){if(!conf(si))return;if(fits[si]>best){best=fits[si];idx=si;}});return idx;}

 // TOP of the right column: FLAT live ranking scores (no boxed cards), swatch + name + LIVE weighted
 // score, re-sorted (conforming-first-by-score, then gated) on every recompute -- this list itself IS
 // the ranking readout, replacing the old boxed ranking-cards row.
 function renderScores(fits){
  var order=RFX.suppliers.map(function(s,si){return si;}).sort(function(a,b){var ca=conf(a),cb=conf(b);if(ca!==cb)return ca?-1:1;return fits[b]-fits[a];});
  var html=order.map(function(si,oi){var s=RFX.suppliers[si],col=rfxSupplierColor(si),ok=conf(si);
   return '<div style="display:flex;align-items:center;gap:9px;padding:'+(oi===0?'0':'5px')+' 0 5px'+(oi===0?'':';border-top:1px solid var(--line)')+(ok?'':';opacity:.75')+'">'
    +'<span style="flex:none;width:9px;height:9px;border-radius:50%;background:'+col+'"></span>'
    +'<div style="flex:1;min-width:0"><span style="font-weight:700;font-size:12.5px;color:var(--ink)">'+escapeHtmlPV(s.n)+'</span>'
    +(ok?'':' '+rfxMcmPill('Gated','rust'))+'</div>'
    +'<span style="flex:none;font-weight:800;font-size:16px;font-family:var(--mono,monospace);color:'+(ok?'var(--plum)':'var(--mut2)')+'">'+fits[si].toFixed(1)+'</span></div>';
  }).join('');
  var el=document.getElementById('rfxMdScores');if(el)el.innerHTML=html;
 }
 // BOTTOM of the right column: the radar's static colour key -- swatch + name only, no score, never
 // re-sorted (submission order), just identifying which polygon on the radar is which supplier.
 function renderColorLegend(){
  var html=RFX.suppliers.map(function(s,si){var col=rfxSupplierColor(si);
   return '<div style="display:flex;align-items:center;gap:8px"><span style="flex:none;width:10px;height:10px;border-radius:3px;background:'+col+'"></span><span style="font-size:12px;color:var(--ink)">'+escapeHtmlPV(s.n)+'</span></div>';
  }).join('');
  var el=document.getElementById('rfxMdLegend');if(el)el.innerHTML=html;
 }
 // Per-supplier strongest/softest requirement category, read directly off the radar's own per-
 // category fit data (rfxCatFit); static (does not move with the sliders, same as the radar shape).
 function strongestSoftest(si){
  var c=cats(),best=null,worst=null;
  c.forEach(function(cat){var v=rfxCatFit(si,cat);
   if(!best||v>best.v)best={cat:cat,v:v};
   if(!worst||v<worst.v)worst={cat:cat,v:v};
  });
  return {best:best,worst:worst};
 }

 function composeExplain(raw,fits,leaderSi){
  // curLeader() returns -1 (a number, not null/undefined) when nothing conforms, so every check
  // below tests >=0, never !=null, or a fully-gated field would index RFX.suppliers[-1] and throw.
  var base=baseWeightsArr(),baseFits=computeFits(base),baseLeader=curLeader(baseFits);
  var isAdjusted=raw.some(function(v,i){return v!==base[i];});
  // Margin: the leader's live score less the next-highest CONFORMING supplier's, so a gated supplier
  // that out-scores the leader on raw fit never understates the leader's actual, awardable margin.
  var marginTxt='';
  if(leaderSi>=0){
   var confOrder=RFX.suppliers.map(function(s,si){return si;}).filter(function(si){return conf(si);}).sort(function(a,b){return fits[b]-fits[a];});
   if(confOrder.length>1&&confOrder[0]===leaderSi){
    var runnerSi=confOrder[1],margin=fits[leaderSi]-fits[runnerSi];
    marginTxt=' Margin: <b>'+margin.toFixed(1)+' points</b> over the next-highest conforming supplier, '+escapeHtmlPV(RFX.suppliers[runnerSi].n)+'.';
   }
  }
  var lead;
  if(leaderSi!==baseLeader&&isAdjusted&&leaderSi>=0&&baseLeader>=0){
   lead='<b style="color:var(--emph,#C15E19)">Leader flips to '+escapeHtmlPV(RFX.suppliers[leaderSi].n)+'.</b> The panel’s filed weights favor '+escapeHtmlPV(RFX.suppliers[baseLeader].n)+'; this order is sensitive to the weights just set, confirm before relying on it.'+marginTxt;
  } else if(isAdjusted&&leaderSi>=0){
   lead='<b style="color:var(--plum)">'+escapeHtmlPV(RFX.suppliers[leaderSi].n)+' still leads</b> under these weights, the ranking is robust to this shift.'+marginTxt;
  } else if(leaderSi>=0){
   lead='<b style="color:var(--plum)">'+escapeHtmlPV(RFX.suppliers[leaderSi].n)+' leads</b> on the filed requirement-category weights.'+marginTxt;
  } else {
   lead='No conforming, scored supplier under these weights.';
  }
  var html='<p style="margin:0 0 8px">'+lead+'</p>';
  if(leaderSi>=0){
   var c=cats();
   var sensRows=c.map(function(cat,i){var w2=raw.slice();w2[i]=50;var f2=computeFits(w2);var nl=curLeader(f2);
    var gap=Math.abs((f2[leaderSi]||0)-(nl>=0?f2[nl]:0));
    return {cat:cat,flips:nl!==leaderSi,gap:gap,newLeader:nl};});
   sensRows.sort(function(a,b){return a.gap-b.gap;});
   var nearest=sensRows[0];
   if(nearest){
    var sens;
    if(nearest.flips&&nearest.newLeader>=0){
     sens='Closest lever: <b>'+escapeHtmlPV(titleCase(nearest.cat))+'</b>, pushing it to its maximum weight flips the leader to <b style="color:var(--emph,#C15E19)">'+escapeHtmlPV(RFX.suppliers[nearest.newLeader].n)+'</b>. Every other single-lever push leaves '+escapeHtmlPV(RFX.suppliers[leaderSi].n)+' in front.';
    } else {
     sens='Closest lever: <b>'+escapeHtmlPV(titleCase(nearest.cat))+'</b>, a '+nearest.gap.toFixed(1)+'-point gap remains even at maximum weight; <b style="color:var(--plum)">'+escapeHtmlPV(RFX.suppliers[leaderSi].n)+'</b> stays in front under every single-lever push from here.';
    }
    html+='<p style="margin:0 0 8px">'+sens+'</p>';
   }
  }
  // Gate note: every gated supplier's raw fit score under these weights, always shown (weight-
  // invariant, so it never needs to wait for a leader-flip to matter).
  var gateLines=RFX.suppliers.map(function(s,si){if(!(s.mustFail&&s.mustFail.length))return null;
   return escapeHtmlPV(s.n)+' scores <b>'+fits[si].toFixed(1)+'</b> on raw fit but is gated on '+escapeHtmlPV(s.mustFail.join(', '))+' and excluded from the awardable ranking regardless of weights.';
  }).filter(Boolean);
  if(gateLines.length)html+='<p style="margin:0 0 8px">'+gateLines.join(' ')+'</p>';
  // Per-supplier strongest/softest requirement category, read off the radar's own fixed per-category
  // fit shape (rfxCatFit), not the live weighted score, so this line never changes with the sliders.
  var ssLines=RFX.suppliers.map(function(s,si){var ss=strongestSoftest(si);
   return escapeHtmlPV(s.n)+': strongest on <b>'+escapeHtmlPV(titleCase(ss.best.cat))+'</b> ('+ss.best.v.toFixed(0)+'%), softest on <b>'+escapeHtmlPV(titleCase(ss.worst.cat))+'</b> ('+ss.worst.v.toFixed(0)+'%).';
  });
  html+='<p style="margin:0">'+ssLines.join(' ')+'</p>';
  var el=document.getElementById('rfxMdExplain');if(el)el.innerHTML=html;
 }

 function polar(cx,cy,R,ang,frac){var rad=ang*Math.PI/180;return [cx+R*frac*Math.cos(rad),cy+R*frac*Math.sin(rad)];}
 // Balanced 2-line wrap for an axis label, generic over whatever category text rfxCats() returns
 // (never a hardcoded per-category line-break table): picks the word-boundary split that leaves the
 // two lines closest in character length; a one-word label stays on one line.
 function axisLines(label){
  var words=String(label).split(' ');
  if(words.length<2)return [label];
  var best=1,bestDiff=Infinity;
  for(var i=1;i<words.length;i++){
   var l1=words.slice(0,i).join(' ').length,l2=words.slice(i).join(' ').length,diff=Math.abs(l1-l2);
   if(diff<bestDiff){bestDiff=diff;best=i;}
  }
  return [words.slice(0,best).join(' '),words.slice(best).join(' ')];
 }
 // Radar, flipped: spokes = requirement CATEGORIES (looped over cats(), always a full frame no matter
 // how many suppliers are scored); one polygon per SUPPLIER (looped over RFX.suppliers), a fixed
 // per-category fit shape from fitMatrix()/rfxCatFit() that does not move when the sliders change
 // (only the legend's weighted totals do). Canonical rfxSupplierColor() identity colour per polygon.
 function renderRadar(){
  var c=cats(),N=c.length;if(!N)return;
  var cx=210,cy=210,R=142,labelR=170;
  var angles=c.map(function(x,i){return -90+i*(360/N);});
  var parts=[];
  [1/3,2/3,1].forEach(function(f){var pts=angles.map(function(a){var p=polar(cx,cy,R,a,f);return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
   parts.push('<polygon points="'+pts+'" fill="none" stroke="var(--line2)" stroke-width="1"></polygon>');});
  angles.forEach(function(a){var p=polar(cx,cy,R,a,1);parts.push('<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'" stroke="var(--line2)" stroke-width="1"></line>');});
  [1/3,2/3,1].forEach(function(f){var val=100*f;var p=polar(cx,cy,R,-90,f);
   parts.push('<text x="'+(p[0]+6).toFixed(1)+'" y="'+(p[1]-2).toFixed(1)+'" font-family="var(--sans,Arial)" font-size="8.5" font-weight="700" fill="var(--mut2)">'+Math.round(val)+'</text>');});
  angles.forEach(function(a,i){var p=polar(cx,cy,labelR,a,1);var cv=Math.cos(a*Math.PI/180),sv=Math.sin(a*Math.PI/180);
   var anchor=cv>0.25?'start':(cv<-0.25?'end':'middle');
   var lines=axisLines(titleCase(c[i])),lh=11.5,n=lines.length,startY;
   if(sv<-0.3)startY=p[1]-(n-1)*lh;else if(sv>0.3)startY=p[1];else startY=p[1]-((n-1)*lh)/2;
   var tspans=lines.map(function(ln,li){return '<tspan x="'+p[0].toFixed(1)+'" y="'+(startY+li*lh).toFixed(1)+'">'+escapeHtmlPV(ln)+'</tspan>';}).join('');
   parts.push('<text text-anchor="'+anchor+'" font-family="var(--sans,Arial)" font-size="10" font-weight="700" fill="var(--ink)">'+tspans+'</text>');});
  var fm=fitMatrix();
  RFX.suppliers.forEach(function(s,si){var col=rfxSupplierColor(si);
   var pts=c.map(function(cat,i){var frac=Math.max(0,Math.min(1,fm[si][i]/100));var p=polar(cx,cy,R,angles[i],frac);return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
   parts.push('<polygon points="'+pts+'" fill="'+col+'" fill-opacity="0.16" stroke="'+col+'" stroke-width="2.5"></polygon>');
   c.forEach(function(cat,i){var frac=Math.max(0,Math.min(1,fm[si][i]/100));var p=polar(cx,cy,R,angles[i],frac);
    parts.push('<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4" fill="'+col+'"></circle>');});
  });
  var el=document.getElementById('rfxMdRadar');if(!el)return;
  el.innerHTML='<svg viewBox="0 0 420 420" style="width:100%;height:auto;display:block" role="img" aria-label="Requirement-category fit radar, one spoke per requirement category, one polygon per supplier">'+parts.join('')+'</svg>';
  var svg=el.querySelector('svg');
  try{var bbox=svg.getBBox();var pad=14;
   svg.setAttribute('viewBox',(bbox.x-pad).toFixed(1)+' '+(bbox.y-pad).toFixed(1)+' '+(bbox.width+2*pad).toFixed(1)+' '+(bbox.height+2*pad).toFixed(1));
  }catch(e){/* getBBox unsupported or el not yet rendered, keep the default viewBox */}
 }

 window.rfxMdRecompute=function(){
  if(!document.getElementById('rfxMdScores'))return;   // panel not mounted (a different subtab is showing)
  var raw=readSliders();
  var sum=0;raw.forEach(function(v){sum+=v;});if(!sum)sum=1;
  raw.forEach(function(v,i){var lbl=document.getElementById('rfxMdPct'+i);if(lbl)lbl.textContent=Math.round(v/sum*100)+'%';});
  var fits=computeFits(raw);
  var leaderSi=curLeader(fits);
  renderScores(fits);
  composeExplain(raw,fits,leaderSi);
  // colour legend removed (Marc 2026-07-26): the Ranking Under These Weights list already carries swatch + name and serves as the legend
  renderRadar();   // static per-category fit shape; cheap to redraw, keeps it correct across re-mounts
 };
 window.rfxMdReset=function(){
  var b=baseWeightsArr();
  cats().forEach(function(c,i){var el=document.getElementById('rfxMdW'+i);if(el)el.value=b[i];});
  window.rfxMdRecompute();
 };
})();
// (Dead code removed per rfx_platform_audit.md Part 1 dead-code item: rfxSensitivityHTML /
// rfxSensitivity / rfxConformingRanked / rfxPerturbShares, a static weight-perturbation tornado
// chart, unreachable, never called from any rendered control. Superseded by the interactive
// Model-the-Decision panel above, which stays.)
// ---- Item 34: per-criterion inter-rater variance + team-vs-AI reconciliation ----
// Reads the human panel (submitted evaluators only); never alters its scoring/aggregation logic.
function rfxSubmittedEvals(){return RFX.panel.filter(function(e){return e.submitted&&e.scores;});}
function rfxCellScores(si,ci){return rfxSubmittedEvals().map(function(e){return (e.scores[si]&&e.scores[si][ci]!=null)?e.scores[si][ci]:null;}).filter(function(v){return v!=null;});}
function rfxStats(arr){if(!arr.length)return {n:0,mean:null,sd:0,spread:0};var n=arr.length,mean=arr.reduce(function(a,b){return a+b;},0)/n;
 var v=arr.reduce(function(a,b){return a+(b-mean)*(b-mean);},0)/n;return {n:n,mean:mean,sd:Math.sqrt(v),spread:Math.max.apply(null,arr)-Math.min.apply(null,arr)};}
function rfxCatIndexByName(name){for(var i=0;i<RFX.criteria.length;i++){if(RFX.criteria[i].cat===name)return i;}return -1;}
// Theo's first-pass (AI) category score for a supplier = mean of its per-requirement scores in that category.
function rfxAiCatScore(si,cat){var vals=RFX.requirements.filter(function(r){return r.category===cat;}).map(function(r){return rfxRqScore(si,r.id);}).filter(function(v){return v!=null;});
 if(!vals.length)return null;return vals.reduce(function(a,b){return a+b;},0)/vals.length;}
function rfxAiWeighted(si){var t=0,wsum=0;RFX.criteria.forEach(function(c){var a=rfxAiCatScore(si,c.cat);if(a!=null){t+=c.w*a;wsum+=c.w;}});return wsum?t/wsum:0;}
// Panel calibration, ONE LINE only (the prior standalone Panel Calibration section, two side-by-side
// tables of inter-rater spread and team-vs-Theo delta, is CUT per the tab redesign; this keeps just the
// consensus/divergence headline, appended to the matrix's own spnote, computed from the same stats).
function rfxCalibrationNoteHTML(){var R=RFX;var nSub=rfxSubmittedEvals().length;
 if(nSub<2)return ' Panel calibration needs at least two submitted evaluators to compare, '+nSub+' submitted so far.';
 var worst={sp:-1,cat:'',si:-1};
 R.criteria.forEach(function(c,ci){R.suppliers.forEach(function(s,si){var st=rfxStats(rfxCellScores(si,ci));if(st.n>=2&&st.spread>worst.sp)worst={sp:st.spread,cat:c.cat,si:si};});});
 var rows=R.suppliers.map(function(s,si){return {si:si,d:rfxWeighted(si)-rfxAiWeighted(si)};});
 var biggest=rows.slice().sort(function(a,b){return Math.abs(b.d)-Math.abs(a.d);})[0];
 var hp=[];
 if(worst.sp>=1)hp.push('most contested: <b>'+escapeHtmlPV(worst.cat)+'</b> on <b>'+escapeHtmlPV(R.suppliers[worst.si].n)+'</b> ('+worst.sp.toFixed(0)+' pt spread)');
 if(biggest&&Math.abs(biggest.d)>=0.75)hp.push('biggest team-vs-Theo gap '+(biggest.d>=0?'+':'&minus;')+Math.abs(biggest.d).toFixed(1)+' on <b>'+escapeHtmlPV(R.suppliers[biggest.si].n)+'</b>');
 return ' Panel calibration ('+nSub+' submitted): '+(hp.length?hp.join(' · '):'well aligned and closely tracks Theo&rsquo;s first-pass, no criterion above the disagreement threshold')+'.';
}
// (Dead code removed per rfx_platform_audit.md Part 1 dead-code items: rfxQaHTML, a compiled Q&A
// distribution list, and rfxLettersHTML/rfxLetterReview, three draft letters with a "Send to
// review" button. Both were already orphaned, no caller anywhere on the tab, letters/comms moved
// to workflow + tasks + chat per the file's own prior comment.)
// (Dead code removed per rfx_platform_audit.md Part 1 dead-code item: the entire RFXJOB deep-brief
// simulation, rfxFreshBrief/RFXJOB/rfxDemoBrief/renderRfxJob/rfxJobItem/rfxJobIdle/rfxJobRunning/
// rfxJobDone/rfxStartBrief/rfxSimBrief/rfxCancelBrief. This was already retired from the RFx tab
// per the file's own prior comment: the #rfxjob host + renderRfxJob re-attach were removed, and no
// #rfxjob element exists anywhere in the build, so this ~65-line fake background-job simulator was
// unreachable. It is also exactly the async-job-simulation anti-pattern this audit targets.)
// ---- Item 38: multi-scenario award narration (lowest-cost / dual-source / diversity), $ deltas ----
function rfxScenarioData(){var R=RFX;var rank=rfxReqRanking();var recSi=rank[0];var rec=R.suppliers[recSi];
 var recAnnual=rfxParseUsd(rec.pricing&&rec.pricing.annual);
 var conf=rank.filter(function(si){var c=rfxCoverage(si);return c.answered>0&&!c.disqualified;});
 // cheapest submitted annual across ALL bidders
 var cheapest=null;R.suppliers.forEach(function(s,si){var a=rfxParseUsd(s.pricing&&s.pricing.annual);if(a!=null&&(cheapest==null||a<cheapest.a)){cheapest={si:si,a:a};}});
 var scenarios=[];
 // (1) lowest total cost
 if(cheapest){var cs=R.suppliers[cheapest.si];var gated=rfxCoverage(cheapest.si).disqualified;var d=(recAnnual!=null)?(cheapest.a-recAnnual):null;
  var narr;if(cheapest.si===recSi){narr='The recommended award is already the lowest submitted annual price among conforming bidders, no cheaper compliant option exists in this field.';}
  else if(gated){narr=cs.n+' submitted the lowest annual price ('+rfxFmtUsd(cheapest.a)+'), '+rfxFmtUsd(Math.abs(d))+'/yr under the recommended award, but it fails the SOC 2 Type II Must-Have, so this saving is unavailable until the gating item is resolved (see the clarification draft).';}
  else{narr=cs.n+' offers the lowest annual price at '+rfxFmtUsd(cheapest.a)+', '+rfxFmtUsd(Math.abs(d))+'/yr '+(d<0?'below':'above')+' the recommended award.';}
  scenarios.push({title:'Lowest total cost',pick:cs.n,delta:d,gated:gated&&cheapest.si!==recSi,narr:narr});}
 // (2) dual-source resilience (primary rec + secondary next conforming)
 if(conf.length>=2){var sec=conf.find?conf.find(function(si){return si!==recSi;}):null;if(sec==null){for(var i=0;i<conf.length;i++){if(conf[i]!==recSi){sec=conf[i];break;}}}
  var secAnnual=rfxParseUsd(R.suppliers[sec].pricing&&R.suppliers[sec].pricing.annual);
  var d2=(secAnnual!=null&&recAnnual!=null)?(secAnnual-recAnnual):null;
  var narr2='Split the award: '+rec.n+' as primary with '+R.suppliers[sec].n+' as a qualified secondary, to avoid single-vendor lock-in'+(R.suppliers[sec].n==='Helio Warehouse'?' and leverage its native SAP depth':'')+'. This adds a second implementation and typically a single-source premium. '+(d2==null?'A firm run-rate delta needs '+R.suppliers[sec].n+'’s best-and-final pricing, its proposal shows Not submitted today (see the BAFO draft).':'Indicative run-rate delta vs the recommended award if volume shifted to the secondary: '+rfxFmtSignedUsd(d2)+'/yr.');
  scenarios.push({title:'Dual-source resilience',pick:rec.n+' + '+R.suppliers[sec].n,delta:d2,gated:false,narr:narr2});}
 // (3) diversity / strategic supply base (favor the challenger)
 var chal=null;R.suppliers.forEach(function(s,si){if(si!==recSi&&/visionary|challenger|series/i.test((s.profile&&(s.profile.analyst+' '+s.profile.ownership))||'')&&chal==null)chal=si;});
 if(chal==null){for(var j=0;j<R.suppliers.length;j++){if(j!==recSi){chal=j;break;}}}
 if(chal!=null){var ch=R.suppliers[chal];var chAnnual=rfxParseUsd(ch.pricing&&ch.pricing.annual);var d3=(chAnnual!=null&&recAnnual!=null)?(chAnnual-recAnnual):null;var gated3=rfxCoverage(chal).disqualified;
  var narr3='Broaden the supply base by favouring the challenger '+ch.n+(ch.profile&&ch.profile.analyst?(' ('+ch.profile.analyst+')'):'')+' to reward innovation and reduce concentration. '+(d3!=null?('Run-rate delta vs the recommended award: '+rfxFmtSignedUsd(d3)+'/yr'+(gated3?', but the SOC 2 gate applies.':'.')):'Run-rate delta pending, pricing not submitted.')+' No certified diversity (SBE/WBE/MBE) status is on file, so this is a strategic supply-base rationale, not a diversity-credit claim.';
  scenarios.push({title:'Diversity / strategic supply base',pick:ch.n,delta:d3,gated:gated3,narr:narr3});}
 return {recSi:recSi,recName:rec.n,recAnnual:recAnnual,scenarios:scenarios};}
// ---- Panel 3, The Case Per Supplier (2026-07-26 rebuild, faithful port of RFx-RECOMMENDATION-
// OPTIONS.html panel 3 option A's accordion mechanic, carrying option C's one-page-brief CONTENT so
// the depth fits inside <details> instead of a full always-open page): a stat header (weighted fit /
// panel score / annual price / gate status), Theo's advisory-recommendation lede, a "Why it leads"
// narrative, Key strengths & concerns, and a "What would need to be true to proceed" list. All prose
// is read straight off RFX.suppliers[].report (already-authored per-supplier text), nothing here is
// invented; only the stat header and the collapsed one-liner are computed. One supplier open at a
// time (native <details name="rfxcase">), the top-ranked supplier opens first.
function rfxCaseKpi(label,value,sub){return '<div class="card" style="margin:0;padding:9px 11px"><div style="font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2)">'+escapeHtmlPV(label)+'</div><div style="font-size:16px;font-weight:800;margin-top:3px;color:var(--ink)">'+value+'</div>'+(sub?'<div style="font-size:10.5px;color:var(--mut2);margin-top:2px">'+escapeHtmlPV(sub)+'</div>':'')+'</div>';}
function rfxCaseHTML(){var R=RFX,esc=escapeHtmlPV,rank=rfxReqRanking();
 var toneMap={leadergate:'emph',primary:'plum',sec:'teal',cond:'rust',not:'grey'};
 var h='<div class="sect"><div class="secthd"><div class="t">The case, per supplier</div>'+rfxCap('advisory tier · weighted fit · Theo’s recommendation narrative')+'</div><div style="display:grid;gap:10px">';
 rank.forEach(function(si,i){var s=R.suppliers[si],c=rfxCoverage(si),tier=rfxAwardTier(si,i),rep=s.report||{};
  // MCM palette-only badge color for this supplier's tier (rfxAwardTier's own col/bg are shared with
  // other subtabs and use the file's non-MCM red/amber; toneMap keeps this panel MCM-only throughout).
  var toneCol=RFX_MCM[toneMap[tier.key]||'grey'];
  var gated=!!(s.mustFail&&s.mustFail.length);
  var annual=rfxAnnualNum(si);
  var priceSub=(s.pricing&&s.pricing.discount&&String(s.pricing.discount)!=='Not submitted')?(esc(s.pricing.discount)+' below list'):'';
  var lede=rep.lede||('<b>'+esc(s.n)+'.</b> '+rfxRecoText(si,i));
  var why=(rep.overall&&rep.overall.narr&&rep.overall.narr[0])?rep.overall.narr[0]:'';
  var strengths=(rep.strengths||[]);
  var concerns=(rep.concerns||[]);
  var proceed=(rep.overall&&rep.overall.steps)?rep.overall.steps:[];
  var forTxt=strengths[0]?String(strengths[0]).replace(/<[^>]*>/g,''):('Weighted fit '+c.weightedFit+'/100.');
  var againstTxt=gated?('Open Must-Have gate ('+s.mustFail.join(', ')+').'):(concerns[0]?String(concerns[0].html||'').replace(/<[^>]*>/g,''):'No material objections recorded.');
  var oneLine='<span style="color:var(--plum)">For:</span> '+esc(forTxt)+'&nbsp; &nbsp;<span style="color:#9A3B1F">Against:</span> '+esc(againstTxt);
  h+='<details class="card rfxcase-acc" name="rfxcase" style="margin:0;padding:0;overflow:hidden"'+(i===0?' open':'')+'>';
  h+='<summary style="cursor:pointer;padding:12px 14px;display:flex;align-items:center;gap:9px;flex-wrap:wrap">'
    +'<span style="flex:none;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:'+toneCol[0]+';background:'+toneCol[1]+'">'+(i+1)+'</span>'
    +'<span style="font-weight:700;font-size:13px">'+rfxSupplierSwatch(si)+esc(s.n)+'</span>'
    +rfxMcmPill(tier.label,toneMap[tier.key]||'grey')
    +((gated&&tier.key!=='leadergate')?rfxMcmPill('Gate risk','rust'):'')
    +'<span style="flex:1 1 260px;min-width:0;font-size:11.5px;color:var(--mut);line-height:1.4">'+oneLine+'</span></summary>';
  h+='<div style="padding:14px;border-top:1px solid #CFCDC8">';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:9px;margin-bottom:13px">';
  h+=rfxCaseKpi('Weighted fit',c.weightedFit+'/100',c.coveragePct+'% fully met');
  h+=rfxCaseKpi('Panel score',rfxWeighted(si).toFixed(1)+'/5',i===0?'top of the field':('rank #'+(i+1)+' of '+R.suppliers.length));
  h+=rfxCaseKpi('Annual price',annual!=null?rfxFmtUsd(annual):'Not submitted',priceSub);
  h+=rfxCaseKpi('Gate status',gated?'Open':'Clear',gated?s.mustFail.join(', '):'every Must-Have met');
  h+='</div>';
  if(lede)h+='<div style="font-size:12.8px;line-height:1.65;color:var(--ink);margin-bottom:12px">'+lede+'</div>';
  if(why){h+='<div style="font:800 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2);margin-bottom:6px">Why it leads</div>';
   h+='<div style="font-size:12.5px;line-height:1.6;color:var(--mut);margin-bottom:13px">'+why+'</div>';}
  if(strengths.length||concerns.length){
   h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:13px">';
   h+='<div><div style="font:800 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--plum);margin-bottom:7px">Key strengths</div>'+strengths.map(function(x){return '<div style="display:flex;gap:7px;font-size:12px;line-height:1.5;margin-bottom:6px"><span style="flex:none;font-weight:800;color:var(--plum)">+</span><span>'+x+'</span></div>';}).join('')+'</div>';
   h+='<div><div style="font:800 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:#9A3B1F;margin-bottom:7px">Key concerns</div>'+concerns.map(function(x){return '<div style="display:flex;gap:7px;font-size:12px;line-height:1.5;margin-bottom:6px"><span style="flex:none;font-weight:800;color:#9A3B1F">'+esc(x.i||'!')+'</span><span>'+x.html+'</span></div>';}).join('')+'</div>';
   h+='</div>';
  }
  if(proceed.length){
   h+='<div style="font:800 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2);margin-bottom:7px">What would need to be true to proceed</div>';
   h+=proceed.map(function(st){return '<div style="display:flex;gap:7px;font-size:12px;line-height:1.5;margin-bottom:6px"><span style="flex:none;font-weight:800;color:var(--mut2)">·</span><span>'+st.q+'</span></div>';}).join('');
  }
  h+='</div></details>';
 });
 h+='</div></div>';
 return h;
}
// ---- Panel 4, Theo-Modeled Alternatives (2026-07-26 rebuild, faithful port of RFx-RECOMMENDATION-
// OPTIONS.html panel 5 option A "Framing cards"): same rfxScenarioData() engine as before (untouched),
// only the presentation changed, to the card layout of the approved mockup and MCM-palette-only
// colors (burnt-orange for added cost, replacing the old amber). ----
function rfxScenariosHTML(){var R=RFX;var sc=rfxScenarioData();
 var h='<div class="sect"><div class="secthd"><div class="t">Theo-modeled alternatives</div>'+rfxCap('AI-generated framings · $ deltas vs the recommendation')+'</div>';
 h+='<div class="spnote" style="margin:0 0 9px">Theo modeled these alternative award framings from the requirements, the suppliers&rsquo; responses, the submitted pricing and the project conversation, each with its $ delta versus the recommended award. Reflect-only; the award stays conditional until signature and nothing is selected here. Baseline: <b>'+escapeHtmlPV(sc.recName)+'</b>'+(sc.recAnnual!=null?(' at '+rfxFmtUsd(sc.recAnnual)+'/yr'):'')+'.</div>';
 // "Re-model alternatives" button removed (rfx_platform_audit.md finding #24): pretends to re-run
 // an LLM/assistant pass, no local effect.
 h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:13px">';
 sc.scenarios.forEach(function(x){var dCol=x.delta==null?'#8A969E':x.delta<0?'var(--plum)':x.delta>0?'var(--emph,#C15E19)':'#8A969E';
  var dTxt=x.delta==null?'Δ pending':('Δ '+rfxFmtSignedUsd(x.delta)+'/yr');
  // a "Pick" can name one supplier or a combined award (e.g. a dual-source "X + Y"); render one
  // canonical identity swatch per recognised supplier name in the pick, in order, none fabricated.
  var pickSwatches=String(x.pick).split(' + ').map(function(nm){return RFX.suppliers.some(function(s){return s.n===nm;})?rfxSupplierSwatchByName(nm):'';}).join('');
  h+='<div class="card" style="margin:0;border-top:3px solid '+dCol+';background:var(--panel,#F5F2ED)"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:5px"><span style="font-weight:800;font-size:13.5px">'+escapeHtmlPV(x.title)+'</span><span style="font-family:var(--mono);font-weight:800;font-size:12.5px;color:'+dCol+'">'+dTxt+'</span></div>'
   +'<div style="font-size:11.5px;color:var(--mut2);margin-bottom:7px">Pick: '+pickSwatches+'<b style="color:var(--ink)">'+escapeHtmlPV(x.pick)+'</b>'+(x.gated?' '+rfxMcmPill('Gate risk','rust'):'')+'</div>'
   +'<div style="font-size:12px;color:var(--mut);line-height:1.55">'+escapeHtmlPV(x.narr)+'</div></div>';});
 h+='</div><div class="spnote">Negative Δ is a saving vs the recommended award (shown in <b style="color:var(--plum)">plum</b>); positive Δ is added cost (<b style="color:var(--emph,#C15E19)">burnt-orange</b>); a gated pick cannot proceed until its Must-Have is resolved. Deltas use submitted annual prices; a missing price stays <b>pending</b>, never estimated.</div></div>';
 return h;
}
// ---- Item 37: requirements register (MoSCoW / acceptance / objective / confidence / category_weights) ----
function rfxMoscowChip(m){var map={must:['var(--plum)','rgba(92,43,80,.12)','Must'],should:['#2E5E8C','var(--blue-t,#E4EBF1)','Should'],could:['var(--mut2)','#EFECE8','Could'],wont:['#8A827C','#EFECE8','Won’t']};var c=map[m]||map.could;
 return '<span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 7px;border-radius:30px;color:'+c[0]+';background:'+c[1]+'">'+c[2]+'</span>';}
// Round-2 #9 (Marc): this IS the ONE Requirements Register now, a normal always-visible section
// (no longer a <details> "reference" fold, and no separate reference surface exists elsewhere on
// the tab to duplicate it), the fuller register: ID / requirement / MoSCoW / acceptance / traces-to
// / in-cat wt / cat wt / confidence. Sits at the bottom of Scoring, closing the tab.
function rfxRequirementsRegisterHTML(){var R=RFX;var cw=rfxCategoryWeights();
 var h='<div class="sect"><div class="secthd"><div class="t">Requirements register</div>'+rfxCap(R.requirements.length+' requirements · MoSCoW · acceptance · traceability · confidence')+'</div>';
 h+='<div class="spnote" style="margin:0 0 10px">The requirement set behind the scoring: each requirement’s MoSCoW priority, acceptance criterion, the business objective it traces to, and Theo’s first-pass extraction confidence. Set-level category weights are derived from the requirement weights. Reflect-only.</div>';
 // set-level category weights, two-column labeled mini-bar list (bar length ∝ weight, fill var(--plum) on a --line2 track)
 var cwMax=cw.reduce(function(m,w){return Math.max(m,w.pct);},0)||1;
 var cwRows=cw.map(function(w){return '<div style="display:grid;grid-template-columns:minmax(0,1fr) 54px 30px;align-items:center;gap:9px">'
   +'<span title="'+escapeHtmlPV(w.cat)+'" style="font-size:11px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtmlPV(titleCase(w.cat))+'</span>'
   +'<span style="height:6px;border-radius:4px;background:var(--line2,#E0DCD5);overflow:hidden"><i style="display:block;height:100%;border-radius:4px;width:'+Math.max(6,Math.round(w.pct/cwMax*100))+'%;background:var(--plum)"></i></span>'
   +'<span style="font:700 10.5px var(--mono);color:var(--plum);text-align:right">'+w.pct+'%</span></div>';}).join('');
 h+='<div class="card" style="margin:0 0 12px"><div style="font-weight:700;font-size:12px;margin-bottom:10px">Category Weights <span style="font-weight:500;color:var(--mut2)">· derived · sums to 100%</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px 24px">'+cwRows+'</div></div>';
 // Marc: ONE compact row per requirement, banded by category (a shaded blue-tint header row per
 // category with its weight + count), Mandatory shown as a chip (not plain text), Must / mandatory
 // rows carry a subtle left accent.
 h+='<div class="mxwrap"><table class="mx" style="width:100%"><thead><tr><th>ID</th><th style="text-align:left;width:20%">Requirement</th><th>Priority</th><th style="text-align:left;width:23%">Acceptance criterion</th><th style="text-align:left;width:23%">Traces to</th><th>In-cat wt</th><th>Cat wt</th><th>Conf</th></tr></thead><tbody>';
 cw.forEach(function(w){
  var rs=R.requirements.filter(function(r){return r.category===w.cat;});
  if(!rs.length)return;
  var mand=rs.filter(function(r){return r.mandatory;}).length;
  var inCatTotal=rs.reduce(function(a,r){return a+(r.weight||0);},0)||1;
  h+='<tr><td colspan="8" style="background:var(--blue-t,#E4EBF1);padding:6px 11px;border-top:1px solid var(--line2,#E0DCD5)"><span style="display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="font:700 9.5px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--plum)">'+escapeHtmlPV(titleCase(w.cat))+'</span><span style="font:700 9px var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2)">'+w.pct+'% weight · '+rs.length+' req'+(rs.length===1?'':'s')+(mand?' · '+mand+' mandatory':'')+'</span></span></td></tr>';
  rs.forEach(function(r){var conf=Math.round((r.confidence||0)*100);var confCol=conf>=85?'var(--plum)':conf>=70?'#2E5E8C':'#8A5A00';
   var isMust=(r.moscow==='must')||r.mandatory;
   var inCatPct=Math.round((r.weight||0)/inCatTotal*100);
   h+='<tr>'
    +'<td style="font-family:var(--mono);color:var(--mut2)">'+escapeHtmlPV(r.id)+'</td>'
    +'<td style="text-align:left;font-weight:600;white-space:normal'+(isMust?';box-shadow:inset 3px 0 0 var(--plum)':'')+'">'+escapeHtmlPV(r.text)+(r.mandatory?'<div style="margin-top:4px"><span style="font:700 8px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;padding:2px 7px;border-radius:30px;color:var(--riskred);background:var(--pink-t,#FBE7E3)">Mandatory</span></div>':'')+'</td>'
    +'<td>'+rfxMoscowChip(r.moscow)+'</td>'
    +'<td style="text-align:left;white-space:normal;font-size:11.5px;color:var(--mut);line-height:1.45">'+escapeHtmlPV(r.acceptance||'-')+'</td>'
    +'<td style="text-align:left;white-space:normal;font-size:11.5px;color:var(--mut);line-height:1.45">'+escapeHtmlPV(r.objective||'-')+'</td>'
    +'<td style="font-family:var(--mono)">'+inCatPct+'%</td>'
    +'<td style="font-family:var(--mono);color:var(--mut2)">'+w.pct+'%</td>'
    +'<td><div style="display:flex;align-items:center;gap:6px;justify-content:center"><div style="width:42px;height:6px;border-radius:4px;background:var(--nested);overflow:hidden;flex:none"><i style="display:block;height:100%;width:'+conf+'%;background:'+confCol+'"></i></div><span style="font-family:var(--mono);font-size:10.5px;font-weight:700;color:'+confCol+'">'+conf+'%</span></div></td></tr>';
  });
 });
 h+='</tbody></table></div></div>';
 return h;
}
// (Dead code removed per rfx_platform_audit.md Part 1 dead-code item: rfxOpenScoring/rfxSetMyScore,
// a second legacy copy of the same per-evaluator submit/lock scoring flow as a drawer. Confirmed
// orphaned, the file's own prior comment at the Scoring matrix noted "no 'Open scoring matrix'
// button" and no onclick anywhere called rfxOpenScoring.)
// (rfxWeightSum/rfxSubWeightSum removed, Round-3 rework (Marc item 1): they only ever backed the
// now-deleted Weight Sanity gate panel. Confirmed no other caller.)
// (rfxSetWeight/rfxSetCritName/rfxAddCrit/rfxRemoveCrit/rfxSetSubName/rfxSetSubWeight/
// rfxToggleSubMust/rfxAddSub/rfxRemoveSub/rfxNormalizeSubs/rfxNormalizeCats/rfxReopenStructure/
// rfxLockStructure/rfxLockFinal removed: the CRUD rubric editor and its lock gate, findings #12/#16-20.
// rfxSubmitMine/rfxReopenMine removed with the "My scores" entry mode + evaluator identity, finding
// #13/#14/#15. rfxEmail/rfxEmailAll removed with the Outlook-draft icons, findings #10/#11.)
// ---- Effective terms (change-order governance), head of the golden thread ----
// open the source clause behind an effective term (provenance: document, clause, verbatim language)
function termSource(i){var e=pvData('terms',TERMS).effective[i];if(!e)return;$('#drawer').innerHTML=`<div class="dh"><div><h3>${e.term}</h3><div class="dsub">Source · ${e.doc}</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db"><div class="kv"><div class="k">Document</div><div class="v">${e.doc}</div><div class="k">Clause</div><div class="v">${e.clause||'-'}</div><div class="k">Dated</div><div class="v">${e.date||'-'}</div><div class="k">As it stands</div><div class="v">${e.flag==='drift'?'<span class="driftv">'+e.val+'</span>':e.val}</div></div><div class="sect" style="margin-top:14px"><div class="secthd"><div class="t">Source language</div></div><blockquote class="srcquote">${e.quote||''}</blockquote></div>${e.flag==='drift'?'<div class="spnote">⚑ Flagged as drift from the Lilly playbook. For Legal to confirm.</div>':''}<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="toast('Opening the executed ${e.doc} (PDF) · read-only')"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="#C8202E" stroke-width="2"><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/><path d="M9 13h5M9 16h3"/></svg>Open the executed contract (PDF)</button><div style="font-size:var(--fz-meta);color:var(--mut2);font-style:italic;margin-top:9px">This is a term on the executed contract, so it opens the signed PDF at the clause, not an editable draft.</div></div>`;$('#scrim').classList.add('on');$('#drawer').classList.add('on');}
// ---- Terms & Obligations (combined) ----------------------------------------
// PERFORMANCE obligations: the ongoing commitments we hold the supplier to (uptime, support
// SLAs, breach notice) with the target, the remedy if they miss it (credits / money back), and
// whether they are meeting it today. These are what business users actually track day to day.