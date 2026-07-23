// Extract the 5 viz functions from the workflow output, write each to a file, syntax-check.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const OUT = 'C:\\Users\\marcs\\AppData\\Local\\Temp\\claude\\C--Users-marcs\\3a354fd5-6a9c-4a7d-b0ca-197382303164\\tasks\\wxmm0dg4e.output';
const raw = fs.readFileSync(OUT, 'utf8');
let obj;
try { obj = JSON.parse(raw); } catch (e) { const i = raw.indexOf('{"built"'); obj = JSON.parse(raw.slice(i)); }
const built = (obj.built || obj.result && obj.result.built || []);
const dir = __dirname;
built.forEach(b => {
  if (!b || !b.name || !b.code) { console.log('SKIP empty', b && b.name); return; }
  const f = path.join(dir, b.name + '.js');
  fs.writeFileSync(f, b.code, 'utf8');
  let ok = true, err = '';
  try { cp.execSync('node --check "' + f + '"', { stdio: 'pipe' }); } catch (e) { ok = false; err = String(e.stderr || e).split('\n').slice(0, 3).join(' '); }
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + b.name + ' (' + b.code.length + ' chars)  ' + (ok ? '' : err));
  console.log('     wire: ' + String(b.wireHint || '').slice(0, 160));
  // detect any HTML-entity contamination in the code (would be broken JS/HTML)
  if (/&amp;&amp;|&lt;div|&gt;'/.test(b.code)) console.log('     !! HTML-entity contamination detected');
});
