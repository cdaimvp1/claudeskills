// Foundation sanity: pvAssess() produces a coherent normalized assessment and the
// shared primitives render without throwing. Concats the same files as smoke.cjs plus
// pv-07a. PVSLE/pvLandInput are const/function in pv-07's scope (not context props),
// so the model calls run INSIDE the vm via runInContext, returning a JSON snapshot.
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const A = path.join(__dirname, 'assets');
const R = p => fs.readFileSync(path.join(A, p), 'utf8');
const js = R('pv/pv-01-boot-helpers.js') + '\n' + R('pv/pv-04-domain-data.js') + '\n' +
  R('pv/pv-07a-assess-model.js') + '\n' + R('pv/pv-07-landscape-render.js') + '\n' +
  R('pv-extracted-helpers.js') + '\n' + R('landscape-data.js');
const ctx = {}; ctx.window = ctx; ctx.self = ctx;
ctx.document = { getElementById:()=>({innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){}}}), querySelector:()=>({innerHTML:'',style:{}}), querySelectorAll:()=>[], createElement:()=>({style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},appendChild(){},getContext:()=>({})}), addEventListener(){}, body:{appendChild(){},style:{}} };
ctx.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
ctx.requestAnimationFrame = ()=>0; ctx.location = { hash:'' }; ctx.console = console;
vm.createContext(ctx);
vm.runInContext(js, ctx, { filename:'concat.js' });

const snap = JSON.parse(vm.runInContext(`(function(){
  var P = PROJECTS[CURPROJ];
  var input = pvLandInput(P);
  var refl = PVSLE.reflect(input);
  var lead = refl.landscape.assessments.filter(function(a){return a.rank!=null;}).sort(function(x,y){return x.rank-y.rank;})[0];
  var x = pvAssess(lead, pvCandById(lead.id), input);
  var other = refl.landscape.assessments.find(function(a){return a.id!==lead.id && a.eligible;});
  var y = other ? pvAssess(other, pvCandById(other.id), input) : null;
  var html = pvDecisionHeaderStrip(x)+pvAssessBars(x.dimensions)+pvEvidCoverageBar(x.evidenceCoverage)+pvReqGroupMini(x.reqGroups)+pvOppConcern(x.opportunities,x.concerns)+pvDispBadge(x.disposition)+pvSemanticRiskCell(x.risk.level,x.risk.confidence);
  var dimEv = x.dimensions.map(function(d){return d.evidence;}).join(' ');
  return JSON.stringify({x:x, y:y, htmlLen:html.length, htmlHasGrounded:/Gartner|Novartis|FedRAMP|Consumption|residency/.test(html), dimHasGrounded:/NYSE|UNC5537/.test(dimEv)});
})()`, ctx));

let fails = 0;
const ok = (name, cond, extra) => { console.log((cond?'PASS':'FAIL')+' '+name+(extra?' :: '+extra:'')); if(!cond) fails++; };
const x = snap.x, y = snap.y;
const DISPO = ['Advance','Advance with conditions','Hold as alternate','Do not advance','Screened out'];
const RISK = ['Low','Moderate','High','Critical','Unknown'];

ok('lead is authored (Snowflake)', x._authored, x.id+' / '+x.name);
ok('disposition in vocabulary', DISPO.indexOf(x.disposition)>=0, x.disposition);
ok('fit one scale (score5 + label)', x.fit.score5!=null && !!x.fit.label, x.fit.score5+' / '+x.fit.label);
ok('risk semantic + confidence', RISK.indexOf(x.risk.level)>=0 && !!x.risk.confidence, x.risk.level+' ('+x.risk.confidence+')');
ok('8 dimensions', x.dimensions.length===8, x.dimensions.map(d=>d.concern).join(' | '));
ok('financial reads Low (fixes Watch inconsistency)', x.dimensions.find(d=>d.id==='financial').concern==='Low', 'ok');
ok('cyber dimension grounded (UNC5537)', /UNC5537/.test(x.dimensions.find(d=>d.id==='cyber').evidence), 'ok');
ok('gates present', x.gates.length>=1, x.gates.map(g=>g.kind+':'+g.label).join(' ; '));
const cov = x.evidenceCoverage, sum = cov.verified+cov.partial+cov.supplier+cov.missing;
ok('evidence coverage ~100%', sum>=98 && sum<=102, 'sum='+sum);
ok('reqGroups derived', x.reqGroups.length>0, x.reqGroups.length+' groups');
ok('opportunities + concerns present', x.opportunities.length>0 && x.concerns.length>0, x.opportunities.length+' / '+x.concerns.length);
if (y) {
  ok('derived supplier renders', !y._authored && y.dimensions.length===8 && DISPO.indexOf(y.disposition)>=0, y.name+' -> '+y.disposition);
  ok('derived supplier shows honest gaps', y.dimensions.filter(d=>d.concern==='Insufficient evidence').length>=1, y.dimensions.filter(d=>d.concern==='Insufficient evidence').length+' insufficient-evidence dims');
}
ok('primitives render non-empty', snap.htmlLen>800, 'len='+snap.htmlLen);
ok('grounded facts reach rendered primitives', snap.htmlHasGrounded, 'ok');

console.log('\n' + (fails ? fails+' FAILURE(S)' : 'ALL ASSESS CHECKS PASSED'));
process.exit(fails?1:0);
