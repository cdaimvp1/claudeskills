// Headless render smoke test for the self-contained Deal-tab bundle. Concatenates
// the seed layer + Theo.data facade + the pv-01/03/04/08/10/11/12/13/14 Deal-tab
// module chain (the exact set build_dashboard_deal.py inlines, in the same real-
// page script order) and runs them in a vm sandbox (DOM/localStorage stubbed as
// no-ops, no real browser) -- same technique as _platform_build/smoke.cjs.
//
// For each Deal sub-tab (DEAL_MODE negotiate/proforma/review), calls dealHTML()
// directly (NOT rerenderDeal, which touches the live DOM) and checks the output
// is non-trivial HTML containing a mode-specific marker. Additionally proves the
// documented GOTCHA fix: with the offline LillyAPI stub loaded, directly awaiting
// dealReviewLoad() and dealDraftVendorResponse() (the two functions the map flags
// as calling LillyAPI.tryLive with no !window.LillyAPI guard) must not throw.
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, 'assets');

const FILES_IN_ORDER = [
  ['seed/_util.js', path.join(ASSETS, 'seed', '_util.js')],
  ['seed/project-view.js', path.join(ASSETS, 'seed', 'project-view.js')],
  ['theo-data.js', path.join(ASSETS, 'theo-data.js')],
  ['pv-01-boot-helpers.js', path.join(ASSETS, 'pv', 'pv-01-boot-helpers.js')],
  // Load-bearing but not in DEAL-TAB-MAP.md's listed set: PROJECTS.acme (pv-03)
  // has a `landscape:LANDSCAPE` field evaluated eagerly, so LANDSCAPE must exist
  // first. Tiny, seed-backed, empty-safe fallback -- see build_dashboard_deal.py.
  ['pv-02-landscape-data.js', path.join(ASSETS, 'pv', 'pv-02-landscape-data.js')],
  ['pv-03-projects-data.js', path.join(ASSETS, 'pv', 'pv-03-projects-data.js')],
  ['pv-04-domain-data.js', path.join(ASSETS, 'pv', 'pv-04-domain-data.js')],
  ['pv-08-deal-contract.js', path.join(ASSETS, 'pv', 'pv-08-deal-contract.js')],
  ['pv-10-terms-renewal.js', path.join(ASSETS, 'pv', 'pv-10-terms-renewal.js')],
  ['pv-11-deal-core.js', path.join(ASSETS, 'pv', 'pv-11-deal-core.js')],
  ['pv-12-deal-commercial.js', path.join(ASSETS, 'pv', 'pv-12-deal-commercial.js')],
  ['pv-13-deal-review-renew.js', path.join(ASSETS, 'pv', 'pv-13-deal-review-renew.js')],
  ['pv-14-docs-comms.js', path.join(ASSETS, 'pv', 'pv-14-docs-comms.js')],
];

// Same patch build_dashboard_deal.py applies to pv-14-docs-comms.js (see that
// file's PV-14 PAGE-BOOT PATCH note): its tail runs `applyView();applyProject();`
// unconditionally at top level, which calls buildTabs()/renderTab()/closeDrawer()
// -- pv-05-workflow.js's multi-tab chrome, legitimately out of scope for a
// Deal-tab-only bundle and not loaded here. Patched out identically so this
// smoke test's sandbox reflects exactly what the built HTML ships.
const PV14_BOOT_CALL = 'applyView();applyProject();';
const PV14_BOOT_REPLACEMENT = '/* PATCHED (see build_dashboard_deal.py PV-14 PAGE-BOOT PATCH) */';

const concatenatedJS = FILES_IN_ORDER.map(([name, p]) => {
  let text = fs.readFileSync(p, 'utf8');
  if (name === 'pv-14-docs-comms.js') {
    if (!text.includes(PV14_BOOT_CALL)) {
      throw new Error('pv-14-docs-comms.js: expected literal "' + PV14_BOOT_CALL + '" not found');
    }
    text = text.replace(PV14_BOOT_CALL, PV14_BOOT_REPLACEMENT);
  }
  return text;
}).join('\n');

// Same offline LillyAPI stub embedded by build_dashboard_deal.py (LILLYAPI_STUB_JS):
// configured() -> false, tryLive(fn, mock) -> always resolves the mock/demo branch
// WITHOUT invoking fn, mirroring the real api.js "not configured" short-circuit.
const LILLYAPI_STUB_JS = `
window.LillyAPI = {
  configured: function () { return false; },
  tryLive: function (fn, mock) { return Promise.resolve({ data: mock, source: 'demo' }); }
};
`;

// A generic fake element with every method/property pv-14's top-level composer
// wiring (ta.addEventListener/.style/.value, sendBtn.disabled, pill.addEventListener/
// .contains) and toast() (#toast.textContent/.classList) touch. Same "always find
// something, never null" philosophy as the landscape smoke test's stubs, just a
// richer shape since pv-14's top-level code (unlike pv-07's) does real element
// wiring, not just innerHTML replacement.
function fakeEl() {
  return {
    innerHTML: '', outerHTML: '', textContent: '', value: '', scrollHeight: 0,
    style: {}, dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains: () => false },
    addEventListener(){}, removeEventListener(){}, setAttribute(){}, appendChild(){},
    focus(){}, blur(){}, contains: () => false, closest: () => null,
    getContext: () => ({}),
  };
}

const ctx = {};
ctx.window = ctx;
ctx.self = ctx;
ctx.document = {
  getElementById: () => fakeEl(),
  querySelector: () => fakeEl(),
  querySelectorAll: () => [],
  createElement: () => fakeEl(),
  addEventListener(){},
  head: { appendChild(){} },
  body: { appendChild(){}, style: {} },
};
ctx.localStorage = { getItem: () => null, setItem(){}, removeItem(){} };
// window.addEventListener('hashchange', ...) is registered at pv-14 top level
// (never fired in this test, no navigation occurs) -- a real browser's window
// has this natively; the vm sandbox's plain object does not, so stub it.
ctx.addEventListener = () => {};
// setTimeout is deliberately a no-op (never fires the callback): mirrors the
// landscape smoke test's "call the render function directly, not the live-DOM
// re-render path" -- dealHTML() schedules dealPostRender via setTimeout(fn,0),
// and this test exercises that async live-upgrade path explicitly and separately
// below (dealReviewLoad/dealDraftVendorResponse), not implicitly via a fired timer.
ctx.setTimeout = () => 0;
ctx.clearTimeout = () => {};
ctx.requestAnimationFrame = () => 0;
ctx.location = { hash: '', href: '' };
ctx.URL = URL;
ctx.console = console;
vm.createContext(ctx);
vm.runInContext(concatenatedJS, ctx, { filename: 'concat-deal.js' });
vm.runInContext(LILLYAPI_STUB_JS, ctx, { filename: 'lillyapi-stub.js' });

let anyFail = false;

// ---- Sanity: acme is the working project and traits gate it onto the standard
// 3-mode Deal tab (per DEAL-TAB-MAP.md #0), not the RFx/buy-under-MSA/renewal variant.
// NOTE: PROJECTS/CURPROJ are declared `const`/`let` at the top level of the
// concatenated script, so (unlike the `var DEAL_MODE`/`var curtab` pv-10/pv-01
// bindings) they do NOT become enumerable properties of ctx and are not reachable
// as ctx.PROJECTS from outside the vm script -- only from code evaluated inside
// the same vm.runInContext call. Read them that way instead of via ctx.PROJECTS.
const acme = vm.runInContext('({title: PROJECTS.acme && PROJECTS.acme.title, code: PROJECTS.acme && PROJECTS.acme.code, curproj: CURPROJ})', ctx);
if (!acme || !acme.title || acme.curproj !== 'acme') {
  console.log('setup/acme-project', 'FAIL', 'PROJECTS.acme not found or CURPROJ != acme after loading pv-03 (' + JSON.stringify(acme) + ')');
  anyFail = true;
} else {
  console.log('setup/acme-project', 'pass', acme.title + ' (' + acme.code + '), CURPROJ=' + acme.curproj);
}
try {
  const isRfx = ctx.dealIsRfx();
  const isBuyMsa = typeof ctx.dealIsBuyMsa === 'function' && ctx.dealIsBuyMsa();
  const isRenewal = ctx.dealIsRenewal();
  if (isRfx || isBuyMsa || isRenewal) {
    console.log('setup/trait-gating', 'FAIL', `expected all-false, got rfx=${isRfx} buyMsa=${isBuyMsa} renewal=${isRenewal}`);
    anyFail = true;
  } else {
    console.log('setup/trait-gating', 'pass', 'rfx=false buyMsa=false renewal=false -> standard 3-mode Deal tab');
  }
} catch (e) {
  console.log('setup/trait-gating', 'FAIL', (e && e.stack) || e);
  anyFail = true;
}

// ---- 3-mode dealHTML() render ----
const MODES = ['negotiate', 'proforma', 'review'];
const MARKERS = {
  negotiate: /ZOPA|Position playbook|Negotiation strategy/,
  proforma: /Pro-forma|Open full model/,
  review: /Protection Score|Go\/No-Go|Findings/,
};
const modeHtml = {};

for (const mode of MODES) {
  ctx.curtab = 'deal';
  ctx.DEAL_MODE = mode;
  try {
    const html = ctx.dealHTML();
    if (typeof html !== 'string' || html.length <= 800) {
      console.log(mode, 'FAIL', 'output too short or not a string (len=' + (html && html.length) + ')');
      anyFail = true;
      continue;
    }
    const marker = MARKERS[mode];
    if (!marker.test(html)) {
      console.log(mode, 'FAIL', 'marker ' + marker + ' not found in output');
      anyFail = true;
      continue;
    }
    modeHtml[mode] = html;
    console.log(mode, 'pass', 'len=' + html.length);
  } catch (e) {
    console.log(mode, 'FAIL', (e && e.stack) || e);
    anyFail = true;
  }
}

// ---- GOTCHA proof: dealReviewLoad() / dealDraftVendorResponse() call
// LillyAPI.tryLive(...) with no !window.LillyAPI guard on some paths. With the
// stub loaded above, both must resolve without throwing (offline-safe fallback).
(async () => {
  ctx.curtab = 'deal';
  ctx.DEAL_MODE = 'review';
  try {
    await ctx.dealReviewLoad();
    console.log('gotcha/dealReviewLoad', 'pass', 'no throw with LillyAPI stub loaded');
  } catch (e) {
    console.log('gotcha/dealReviewLoad', 'FAIL', (e && e.stack) || e);
    anyFail = true;
  }
  try {
    await ctx.dealDraftVendorResponse();
    console.log('gotcha/dealDraftVendorResponse', 'pass', 'no throw with LillyAPI stub loaded');
  } catch (e) {
    console.log('gotcha/dealDraftVendorResponse', 'FAIL', (e && e.stack) || e);
    anyFail = true;
  }

  // ---- External-reference scan on the actual built file ----
  const builtPath = path.join(__dirname, 'deal-acme-PLATFORM.html');
  if (!fs.existsSync(builtPath)) {
    console.log('external-refs', 'FAIL', 'built file not found: ' + builtPath);
    anyFail = true;
  } else {
    const built = fs.readFileSync(builtPath, 'utf8');
    const patterns = [
      [/https?:\/\//g, 'http(s)://'],
      [/src="assets/g, 'src="assets'],
      [/href="assets/g, 'href="assets'],
    ];
    let hits = [];
    for (const [re, label] of patterns) {
      const m = built.match(re);
      if (m && m.length) hits.push(label + ' x' + m.length);
    }
    if (hits.length) {
      console.log('external-refs', 'FAIL', hits.join(', '));
      anyFail = true;
    } else {
      console.log('external-refs', 'pass', 'zero external refs (' + built.length + ' bytes)');
    }
  }

  if (anyFail) process.exit(1);
})();
