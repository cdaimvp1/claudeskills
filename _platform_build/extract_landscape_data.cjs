// Mechanical extraction: load pv-01-boot-helpers.js + pv-03-projects-data.js in a vm
// sandbox (DOM/localStorage stubbed as no-ops) and pull out the "Cloud Data Warehouse"
// deep-landscape project (7 suppliers: Nimbus Data, Lakehouse Co, Aurora Analytics,
// Vertex Data Cloud, Meridian Warehouse, Helio Warehouse, Quanta Labs) from the global
// PROJECTS table. Writes assets/landscape-data.js as:
//   PROJECTS['<KEY>']=<json>; CURPROJ='<KEY>';
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'assets', 'pv');
const pv01 = fs.readFileSync(path.join(SRC, 'pv-01-boot-helpers.js'), 'utf8');
// pv-02 defines the LANDSCAPE constant referenced by one non-deep entry inside pv-03;
// it must load before pv-03 for the vm sandbox to evaluate the file without throwing
// (mirrors the real project-view.html script order: pv-01, pv-01b, pv-02, pv-03).
const pv02 = fs.readFileSync(path.join(SRC, 'pv-02-landscape-data.js'), 'utf8');
const pv03 = fs.readFileSync(path.join(SRC, 'pv-03-projects-data.js'), 'utf8');

const ctx = {};
ctx.window = ctx;
ctx.self = ctx;
ctx.document = {
  getElementById: () => ({ innerHTML: '', scrollTop: 0, style: {}, classList: { add(){}, remove(){}, toggle(){} } }),
  querySelector: () => ({ innerHTML: '', scrollTop: 0, style: {} }),
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add(){}, remove(){}, toggle(){} }, setAttribute(){}, appendChild(){}, getContext: () => ({}) }),
  addEventListener(){},
  body: { appendChild(){}, style: {} }
};
ctx.localStorage = { getItem: () => null, setItem(){}, removeItem(){} };
ctx.location = { hash: '' };
ctx.requestAnimationFrame = () => 0;
ctx.console = console;
vm.createContext(ctx);

vm.runInContext(pv01, ctx, { filename: 'pv-01-boot-helpers.js' });
vm.runInContext(pv02, ctx, { filename: 'pv-02-landscape-data.js' });
vm.runInContext(pv03, ctx, { filename: 'pv-03-projects-data.js' });
// pv-03 declares `const PROJECTS=...; let CURPROJ=...;` at top level. Top-level const/let
// in a vm context live in a lexical scope that is not reflected as a property on the
// context object itself, but later runInContext calls in the SAME context can still see
// the binding by name -- bridge it onto the context object explicitly.
vm.runInContext('this.PROJECTS = PROJECTS; this.CURPROJ = CURPROJ;', ctx, { filename: 'bridge.js' });

if (typeof ctx.PROJECTS !== 'object' || !ctx.PROJECTS) {
  console.error('FAIL: PROJECTS global not defined after loading pv-01 + pv-03');
  process.exit(1);
}

const TARGET_SUPPLIERS = ['Nimbus Data', 'Lakehouse Co', 'Aurora Analytics', 'Vertex Data Cloud', 'Meridian Warehouse', 'Helio Warehouse', 'Quanta Labs'];

// local re-implementation of pv-07's pvIsDeep (that function lives in pv-07, not pv-01/03)
function isDeep(P) {
  return !!(P && Array.isArray(P.requirements) && P.requirements.length &&
    Array.isArray(P.landscape) && P.landscape.some(s => s && s.reqFit));
}

let foundKey = null;

// primary: title === 'Cloud Data Warehouse'
for (const k of Object.keys(ctx.PROJECTS)) {
  const P = ctx.PROJECTS[k];
  if (P && P.title === 'Cloud Data Warehouse') { foundKey = k; break; }
}

// fallback: isDeep passes AND landscape supplier names match target set
if (!foundKey) {
  for (const k of Object.keys(ctx.PROJECTS)) {
    const P = ctx.PROJECTS[k];
    if (!isDeep(P)) continue;
    const names = (P.landscape || []).map(s => s.n);
    const matchCount = TARGET_SUPPLIERS.filter(n => names.includes(n)).length;
    if (matchCount === TARGET_SUPPLIERS.length) { foundKey = k; break; }
  }
}

if (!foundKey) {
  console.error('FAIL: no PROJECTS key matched the Cloud Data Warehouse / target-supplier set');
  console.error('Available keys:', Object.keys(ctx.PROJECTS).join(', '));
  process.exit(1);
}

const P = ctx.PROJECTS[foundKey];
const deep = isDeep(P);
const names = (P.landscape || []).map(s => s.n);

console.log('KEY:', foundKey);
console.log('title:', P.title);
console.log('isDeep:', deep);
console.log('requirements.length:', (P.requirements || []).length);
console.log('landscape.length:', (P.landscape || []).length);
console.log('supplier names:', names.join(', '));

if (!deep) {
  console.error('FAIL: extracted project does not pass the deep-landscape check (empty requirements or landscape/reqFit)');
  process.exit(1);
}

const json = JSON.stringify(P);
// The build deliberately ships only pv-01 + pv-07 (not pv-03, which is where PROJECTS is
// normally declared via `const PROJECTS={...all projects...}`), so PROJECTS does not exist
// yet when this file runs. Declare it defensively with `var` (safe to "redeclare", unlike
// let/const) so this file is a standalone drop-in; the assignment itself is unchanged.
const out = "var PROJECTS=PROJECTS||{};\nPROJECTS['" + foundKey + "']=" + json + "; CURPROJ='" + foundKey + "';\n";
const outPath = path.join(__dirname, 'assets', 'landscape-data.js');
fs.writeFileSync(outPath, out, 'utf8');
console.log('wrote', outPath, '(' + out.length + ' bytes)');
