// Headless render smoke test. Concatenates pv-01 + pv-07 + landscape-data.js and runs
// them in a vm sandbox (DOM/localStorage stubbed as no-ops, no real browser). For each
// Landscape subtab, calls landscapeHTML() directly (NOT pvRerender, which touches the
// live DOM) and checks the output is non-trivial HTML containing an expected marker.
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, 'assets');
const pv01 = fs.readFileSync(path.join(ASSETS, 'pv', 'pv-01-boot-helpers.js'), 'utf8');
// pv-07 reads the RFX global, declared in pv-04-domain-data.js (gracefully degrades to
// empty defaults without Theo -- our exact sandbox case). Inlined whole, verbatim.
const pv04 = fs.readFileSync(path.join(ASSETS, 'pv', 'pv-04-domain-data.js'), 'utf8');
const pv07 = fs.readFileSync(path.join(ASSETS, 'pv', 'pv-07-landscape-render.js'), 'utf8');
// escD/escapeHtmlPV are called by pv-07 but defined in pv-14-docs-comms.js (not shipped
// here). Extracted verbatim rather than stubbed -- see pv-extracted-helpers.js header.
const extra = fs.readFileSync(path.join(ASSETS, 'pv-extracted-helpers.js'), 'utf8');
const data = fs.readFileSync(path.join(ASSETS, 'landscape-data.js'), 'utf8');

const concatenatedJS = pv01 + '\n' + pv04 + '\n' + pv07 + '\n' + extra + '\n' + data;

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
ctx.requestAnimationFrame = f => 0;
ctx.location = { hash: '' };
ctx.console = console;
vm.createContext(ctx);
vm.runInContext(concatenatedJS, ctx, { filename: 'concat.js' });
// bridge pv-03-style top-level const/let (landscape-data.js uses PROJECTS[...]= assignment
// on the existing global, and pv-01/07 declare their own top-level vars/functions via
// var/function, which DO attach to ctx automatically) -- landscapeHTML is a function decl
// in pv-07 so it is already on ctx.

const SUBS = ['exec', 'deep', 'heatmap', 'risk'];
const MARKERS = {
  exec: /Executive Summary/,
  heatmap: /hcell|hmt/,
  risk: /CONTAINED|ELEVATED|rkt/,
  deep: /\bdd\b|Deep Dive|ddtab/
};

let anyFail = false;

for (const sub of SUBS) {
  ctx.PVSL_SUB = sub;
  ctx.curtab = 'landscape';
  try {
    const html = ctx.landscapeHTML();
    if (typeof html !== 'string' || html.length <= 800) {
      console.log(sub, 'FAIL', 'output too short or not a string (len=' + (html && html.length) + ')');
      anyFail = true;
      continue;
    }
    const marker = MARKERS[sub];
    if (!marker.test(html)) {
      console.log(sub, 'FAIL', 'marker ' + marker + ' not found in output');
      anyFail = true;
      continue;
    }
    console.log(sub, 'pass', 'len=' + html.length);
  } catch (e) {
    console.log(sub, 'FAIL', (e && e.stack) || e);
    anyFail = true;
  }
}

if (anyFail) process.exit(1);
