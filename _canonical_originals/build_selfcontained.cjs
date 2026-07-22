// Build fully SELF-CONTAINED (offline) previews of the pristine canonical React
// dashboards. JSX is pre-transpiled with Babel at BUILD time; React/ReactDOM/
// PropTypes/Recharts UMD are inlined, so the output needs no network/CDN.
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const LIBDIR = path.join(DIR, 'lib');
const SRC = "C:\\Users\\marcs\\OneDrive\\Desktop\\claude skills\\updated\\build\\src";

let Babel = require(path.join(LIBDIR, 'babel.min.js'));
if (!Babel || typeof Babel.transform !== 'function') {
  const vm = require('vm');
  const ctx = {}; ctx.window = ctx; ctx.self = ctx; ctx.global = ctx; ctx.navigator = { userAgent: 'node' };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(LIBDIR, 'babel.min.js'), 'utf8'), ctx);
  Babel = ctx.Babel;
}
if (!Babel || typeof Babel.transform !== 'function') {
  throw new Error('Babel API not found; keys=' + Object.keys(Babel || {}).join(','));
}

const react = fs.readFileSync(path.join(LIBDIR, 'react.production.min.js'), 'utf8');
const reactDom = fs.readFileSync(path.join(LIBDIR, 'react-dom.production.min.js'), 'utf8');
const propTypes = fs.readFileSync(path.join(LIBDIR, 'prop-types.min.js'), 'utf8');
const recharts = fs.readFileSync(path.join(LIBDIR, 'Recharts.js'), 'utf8');

const LIB = { react: 'React', recharts: 'Recharts', 'react-dom': 'ReactDOM' };

function transform(jsx) {
  let comp = 'App';
  const out = [];
  for (const ln of jsx.split('\n')) {
    let m = ln.match(/^\s*import\s+\{([^}]*)\}\s+from\s+["']([^"']+)["'];?\s*$/);
    if (m) { const g = LIB[m[2].trim()]; out.push(g ? `const {${m[1].trim()}} = ${g};` : `// skipped import from ${m[2].trim()}`); continue; }
    if (/^\s*import\s+.*from\s+["'][^"']+["'];?\s*$/.test(ln)) { out.push('// ' + ln.trim()); continue; }
    let m3 = ln.match(/^\s*export\s+default\s+function\s+(\w+)/);
    if (m3) { comp = m3[1]; out.push(ln.replace('export default function', 'function')); continue; }
    let m4 = ln.match(/^\s*export\s+default\s+(\w+)\s*;?\s*$/);
    if (m4) { comp = m4[1]; out.push('// export default ' + comp); continue; }
    out.push(ln);
  }
  let body = out.join('\n');
  body += `\n;(function(){try{ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(${comp}));}`
        + `catch(e){document.getElementById('root').innerHTML='<pre style="color:#b00;padding:20px;white-space:pre-wrap">'+String((e&&e.stack)||e)+'</pre>';}})();`;
  return body;
}

function esc(s) { return s.split('</script>').join('<\\/script>'); }

function build(name, jsxRel, title) {
  const jsx = fs.readFileSync(path.join(SRC, jsxRel), 'utf8');
  const pre = transform(jsx);
  const js = Babel.transform(pre, { presets: ['react'] }).code;
  const html =
    '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + title + ' - ORIGINAL canonical (offline)</title>'
    + '<style>body{margin:0;font-family:Arial,Helvetica,sans-serif}</style></head><body>'
    + '<div id="root"></div>\n'
    + '<script>' + esc(react) + '</script>\n'
    + '<script>' + esc(reactDom) + '</script>\n'
    + '<script>' + esc(propTypes) + '</script>\n'
    + '<script>' + esc(recharts) + '</script>\n'
    + '<script>' + esc(js) + '</script>\n'
    + '</body></html>';
  const outp = path.join(DIR, name + '-ORIGINAL.html');
  fs.writeFileSync(outp, html);
  console.log('built', path.basename(outp), Math.round(html.length / 1024) + 'KB');
}

build('supplier-landscape', 'supplier-landscape-1c344a\\examples\\supplier_landscape_canonical_dashboard.jsx', 'Supplier Landscape');
build('category-strategy', 'category-strategy-1c344a\\examples\\category_strategy_canonical_dashboard.jsx', 'Category Strategy');
build('lilly-contract-review', 'lilly-contract-review-1c344a\\examples\\contract_review_canonical_dashboard.jsx', 'Contract Review');
build('rfp-response-analysis', 'rfp-response-analysis-1c344a\\examples\\response_analysis_canonical_dashboard.jsx', 'RFP Response Analysis');
