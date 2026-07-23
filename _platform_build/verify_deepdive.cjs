// Evidence check for the 2026-07-23 deep-dive redesign. Renders the nimbus (Snowflake)
// deep-dive tabs headlessly via the same vm approach as smoke.cjs and asserts the specific
// redesign content is present / the old content is gone. Exits 1 on any failure.
'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const ASSETS = path.join(__dirname, 'assets');
const read = p => fs.readFileSync(path.join(ASSETS, p), 'utf8');
const concatenatedJS = read('pv/pv-01-boot-helpers.js') + '\n' + read('pv/pv-04-domain-data.js') + '\n' +
  read('pv/pv-07-landscape-render.js') + '\n' + read('pv-extracted-helpers.js') + '\n' + read('landscape-data.js');
const ctx = {};
ctx.window = ctx; ctx.self = ctx;
ctx.document = {
  getElementById: () => ({ innerHTML: '', scrollTop: 0, style: {}, classList: { add(){}, remove(){}, toggle(){} } }),
  querySelector: () => ({ innerHTML: '', scrollTop: 0, style: {} }),
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add(){}, remove(){}, toggle(){} }, setAttribute(){}, appendChild(){}, getContext: () => ({}) }),
  addEventListener(){}, body: { appendChild(){}, style: {} }
};
ctx.localStorage = { getItem: () => null, setItem(){}, removeItem(){} };
ctx.requestAnimationFrame = () => 0; ctx.location = { hash: '' }; ctx.console = console;
vm.createContext(ctx);
vm.runInContext(concatenatedJS, ctx, { filename: 'concat.js' });

let fails = 0;
const render = ddt => { ctx.PVSL_SUB = 'deep'; ctx.curtab = 'landscape'; ctx.PVSL_DDT = ddt; return ctx.landscapeHTML(); };
const has = (label, html, s) => { const ok = html.includes(s); console.log((ok ? 'PASS' : 'FAIL') + ' ' + label + ' :: contains "' + s + '"'); if (!ok) fails++; };
const not = (label, html, s) => { const ok = !html.includes(s); console.log((ok ? 'PASS' : 'FAIL') + ' ' + label + ' :: absent "' + s + '"'); if (!ok) fails++; };

const profile = render('profile');
console.log('--- Profile ---');
has('profile', profile, 'Corporate identity');
has('profile', profile, 'Financial position');
has('profile', profile, 'NYSE: SNOW');       // rendered ticker fix
has('profile', profile, 'Legal entity');
has('profile', profile, 'Footprint');
has('profile', profile, 'Headcount');
has('profile', profile, 'Offering profile');
has('profile', profile, 'Market Presence &amp; History');
not('profile', profile, 'HQ &amp; footprint');  // old combined label gone
not('profile', profile, '>Ticker<');            // old bare "Ticker" cell label gone

const solfin = render('solfin');
console.log('--- Market & Financials ---');
not('solfin', solfin, 'class="cosnap"');     // boxed tile wrapper gone
not('solfin', solfin, 'cosnap-t');           // boxed tile gone
has('solfin', solfin, 'Latest revenue');     // now a table row
has('solfin', solfin, 'Revenue growth');

const strisk = render('strisk');
console.log('--- Strengths & Risks ---');
has('strisk', strisk, 'Risk posture');       // new D&B posture band
not('strisk', strisk, 'Would we engage them?'); // old lede gone

const tabbar = render('profile');
console.log('--- Tab bar order/names ---');
has('tabbar', tabbar, '>Profile</button>');
has('tabbar', tabbar, '>Market &amp; Financials</button>');
has('tabbar', tabbar, '>Strengths &amp; Risks</button>');
has('tabbar', tabbar, '>Lilly Fit</button>');
has('tabbar', tabbar, '>Requirements Fit</button>');
not('tabbar', tabbar, 'Risk to Engaging');   // old rename gone
not('tabbar', tabbar, '>Why Them</button>'); // old rename gone
// Profile must appear before Requirements Fit in the tab bar (order restored)
const iP = tabbar.indexOf('>Profile</button>'), iR = tabbar.indexOf('>Requirements Fit</button>');
console.log(((iP >= 0 && iR >= 0 && iP < iR) ? 'PASS' : 'FAIL') + ' tabbar :: Profile precedes Requirements Fit (' + iP + ' < ' + iR + ')');
if (!(iP >= 0 && iR >= 0 && iP < iR)) fails++;

const reqs = render('reqs');
console.log('--- Requirements Fit ---');
not('reqs', reqs, 'Request more data');      // request-data panel removed
const lilly = render('lilly');
console.log('--- Lilly Fit ---');
has('lilly', lilly, 'Open questions to confirm'); // moved here

console.log('\n' + (fails ? (fails + ' FAILURE(S)') : 'ALL CHECKS PASSED'));
process.exit(fails ? 1 : 0);
