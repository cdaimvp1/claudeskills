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
const subHtml = {};

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
    subHtml[sub] = html;
    console.log(sub, 'pass', 'len=' + html.length);
  } catch (e) {
    console.log(sub, 'FAIL', (e && e.stack) || e);
    anyFail = true;
  }
}

// Deep-dive inner-tab guard: PVSL_SUB='deep' plus each PVSL_DDT value exercises
// pvDDSection()'s per-tab branch (profile/solfin/strisk/lilly/reqs), including the
// infoHover() calls in the lilly/reqs branches that previously threw. Same direct
// landscapeHTML() call, no pvRerender/live DOM.
const DDTS = ['profile', 'solfin', 'strisk', 'lilly', 'reqs'];
const ddHtml = {};

for (const ddt of DDTS) {
  ctx.PVSL_SUB = 'deep';
  ctx.curtab = 'landscape';
  ctx.PVSL_DDT = ddt;
  try {
    const html = ctx.landscapeHTML();
    if (typeof html !== 'string' || html.length === 0) {
      console.log('deep/' + ddt, 'FAIL', 'output empty or not a string (len=' + (html && html.length) + ')');
      anyFail = true;
      continue;
    }
    ddHtml[ddt] = html;
    console.log('deep/' + ddt, 'pass', 'len=' + html.length);
  } catch (e) {
    console.log('deep/' + ddt, 'FAIL', (e && e.stack) || e);
    anyFail = true;
  }
}

// ---- Content checks: prove real enriched seed content actually reaches the rendered HTML,
// not just "renders non-empty". Both checks derive the auto-selected vendor from the live
// render state (PVSL_RK_VEND / PVSL_DDV, set by the same auto-init logic the real UI uses on
// first paint) rather than hardcoding a vendor id, so they stay correct if scores/ranking change.
{
  const proj = ctx.PROJECTS[ctx.CURPROJ] || {};
  const vendors = Object.values(proj.landscape || {});
  const findVendor = id => vendors.find(v => v.id === id);

  // Risk subtab: the vendor auto-selected on first render of PVSL_SUB='risk' must have its
  // deepDive.riskPosture.recentIssues[0] (a real breach/lawsuit/incident item from the seed)
  // actually present in the risk-subtab HTML, not just the "risk posture" scaffolding.
  const rkVend = ctx.PVSL_RK_VEND;
  const rkVendData = rkVend && findVendor(rkVend);
  const issues = rkVendData && rkVendData.deepDive && rkVendData.deepDive.riskPosture && rkVendData.deepDive.riskPosture.recentIssues;
  if (!rkVend || !issues || !issues.length) {
    console.log('content/risk-issues', 'FAIL', 'no auto-selected risk vendor or no recentIssues on record (vend=' + rkVend + ')');
    anyFail = true;
  } else {
    const keyword = issues[0].title;
    const html = subHtml.risk || '';
    if (!keyword || !html.includes(keyword)) {
      console.log('content/risk-issues', 'FAIL', 'expected recentIssues[0].title for ' + rkVend + ' ("' + keyword + '") not found in risk-subtab HTML');
      anyFail = true;
    } else {
      console.log('content/risk-issues', 'pass', rkVend + ' recentIssues[0]: "' + keyword + '"');
    }
  }

  // Deep-dive Market & Financials (solfin tab): the vendor auto-selected on first render of
  // PVSL_SUB='deep' must have its top-level financials.latestRevenue (a real reported revenue
  // figure) actually present in the solfin-tab HTML.
  const ddVend = ctx.PVSL_DDV;
  const ddVendData = ddVend && findVendor(ddVend);
  const rev = ddVendData && ddVendData.financials && (ddVendData.financials.latestRevenue || ddVendData.financials.revenue);
  const solfinHtml = ddHtml.solfin || '';
  if (!ddVend || !rev) {
    console.log('content/market-financials', 'FAIL', 'no auto-selected deep-dive vendor or no financials.latestRevenue on record (vend=' + ddVend + ')');
    anyFail = true;
  } else if (!solfinHtml.includes(rev)) {
    console.log('content/market-financials', 'FAIL', 'expected financials.latestRevenue for ' + ddVend + ' ("' + rev + '") not found in solfin-tab HTML');
    anyFail = true;
  } else {
    console.log('content/market-financials', 'pass', ddVend + ' latestRevenue: "' + rev + '"');
  }
}

if (anyFail) process.exit(1);
