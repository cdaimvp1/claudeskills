# Malicious-Code Sweep: rfx-hub-1c344a and category-strategy-1c344a/dashboard

Date: 2026-07-28
Scope: full trees, including built HTML artifacts and the vendored `_platform_build` copy inside category-strategy-1c344a/dashboard.

## Tree 1: rfx-hub-1c344a

Files reviewed: `dashboard/build_dashboard_rfx.py`, all `dashboard/assets/**/*.js`, `dashboard/assets/**/*.css`, `dashboard/rfx-dashboard.html` (built, ~3.66MB), `SKILL.md`.

- Network egress (fetch/XHR/WebSocket/beacon/img-ping/dynamic script-src/prefetch): CLEAN. No matches in any .py/.js/.css or in the built HTML. Grep for `https?://` in all sources and in the built HTML returned zero hits for this tree.
- Code execution (eval, new Function, setTimeout/setInterval-with-string, document.write, exec/compile, subprocess, os.system, pickle.loads): CLEAN. The only `subprocess`-looking hit was the word "subprocessor" inside descriptive data text (`pv-03-projects-data.js:268-270`), a data-governance term, not a call.
- Filesystem reach: CLEAN. `build_dashboard_rfx.py` only reads from `ASSETS` (computed from `os.path.dirname(os.path.abspath(__file__))`) and writes once to `--out`, default `rfx-dashboard.html` in the same build dir. No absolute paths outside the skill, no traversal (`..`), no reads outside declared asset list.
- Secrets/credentials: CLEAN of real secrets/keys/tokens. Found illustrative demo-persona emails (`priya.shah@lilly.com`, `it-procurement-leads@lilly.com` in `pv-14-docs-comms.js:458`; `Mailbox_Privacy_Contracts@lilly.com`, `Mailbox_Legal_Contracts@lilly.com`, `Cyber_ISS_Review@lilly.com`, `theo.vance@heliowh.com` in `seed/project-view.js`). These are the same fictional personas already present in the already-locked `deal-tab-1c344a/dashboard/assets/pv/pv-14-docs-comms.js` (verified by grep) — a pre-existing suite-wide convention, not something newly introduced here. Not a new finding, noted for completeness.
- Guardrail bypass (bare except, swallowed raise): CLEAN. No `except:` or exception-swallowing patterns in `build_dashboard_rfx.py`.
- Obfuscation: CLEAN. No unusually long lines in the Python builder (max checked threshold 2000 chars, none found). Non-ASCII character inventory in the JS sources is limited to ordinary typographic/symbol characters (middle dot, curly quotes, en/em dash, checkmarks, arrows, Greek delta, bullets) — no Cyrillic/Latin homoglyphs.
- Dependencies: CLEAN. Python imports are `argparse, ast, base64, os, re` — all stdlib. `ast.literal_eval` is used only to decode quoted-string literals (safe, not `eval`). `base64` is used only to build a `data:image/png;base64,...` URI for the inlined logo — no network use.
- Injection (SQL/shell/template from non-literal input): CLEAN. No SQL, no shell invocation, no dynamic template construction from external input; the builder only does string concatenation of local, developer-authored source files.
- innerHTML sinks: present (concentrated in `pv-09-rfx.js`, `pv-11-deal-core.js`, `pv-14-docs-comms.js`, `app-shell.js`), but all are fed by hardcoded seed data assembled at build time and escaped via `escapeHtmlPV`/`esc` helpers where free text is interpolated (e.g. `pv-09-rfx.js:293,464,469,470,472,484,500,506,517`). No runtime user-input path into these sinks was found (no input/textarea elements feeding render functions).

**Verdict: SAFE.**

## Tree 2: category-strategy-1c344a/dashboard (including vendored `_platform_build`)

Files reviewed: `build_dashboard_category.py`, `assets/pv/cs-render.js`, `assets/pv/cs.css`, `assets/seed/*.js`, both built HTML files (`category-strategy-dashboard.html` ~2.83MB, `category-strategy-dashboard-DEMO.html` ~2.86MB), and the vendored `_platform_build/` (build_dashboard.py + 6 asset files).

- Network egress: one class of finding. `assets/seed/category-line-items.js:19-23` and similar lines contain external citation URLs (avasant.com, opslyft.com, vendorbenchmark.com, stripo.email, zylo.com, hginsights.com, saasmag.com, lyntonweb.com, honigman.com, founderslegal.com, axis-intelligence.com, digital-chiefs.de, ainformat.com, aigl.blog). These are rendered in `cs-render.js:1676` and `:2518` strictly as user-clickable `<a class="cs-cite" href="...csEsc(s.u)..." target="_blank" rel="noopener">` citation anchors — not fetch/XHR/WebSocket/image-ping/script-src/prefetch, and not auto-triggered. No automatic outbound network call exists anywhere in this tree; these are inert citation text/links requiring an explicit user click, consistent with the suite's "grounded claim + citation" design. Not a code-execution/exfiltration finding, but flagging per the instruction to report any outbound reference found in scope.
- Code execution: CLEAN. No eval, new Function, setTimeout/setInterval-with-string, document.write. `ast.literal_eval` used the same safe way as in Tree 1 (`_platform_build/build_dashboard.py:137,235`; also imported in `build_dashboard_category.py`'s dependency `build_dashboard.py`).
- Filesystem reach: CLEAN. `build_dashboard_category.py` computes `BUILD_DIR`/`ASSETS`/`PLATFORM` from `__file__`, reads only from its own `assets/` and `_platform_build/`, writes once to `out_path` under the same build dir (line 95-96). No traversal, no external absolute paths.
- Secrets/credentials: CLEAN. No keys/tokens/passwords/connection strings found.
- Guardrail bypass: CLEAN. No bare `except:` or swallowed exceptions in `build_dashboard_category.py` or the vendored `build_dashboard.py`.
- Obfuscation: CLEAN. No oversized lines in either builder script. Non-ASCII inventory in `cs-render.js` is ordinary punctuation/symbols, no homoglyphs.
- Dependencies: CLEAN. `build_dashboard_category.py` imports `argparse, io, os, sys` plus its own sibling `build_dashboard as bd` (the vendored platform builder). The vendored `build_dashboard.py` imports `argparse, ast, base64, html, json, os, re` — all stdlib.
- Injection: CLEAN. No SQL/shell/template construction from non-literal input.
- innerHTML sinks: one occurrence in `cs-render.js`, feeding from hardcoded seed data, with the citation path escaped via `csEsc` (defined at `cs-render.js:37`).
- CSS: no `@import` or `url(http...)` in `cs.css`, `_platform_build/assets/app-shell.css`, or `_platform_build/assets/theo-color.css`. Fonts confirmed self-hosted (`fonts-inline.css`).
- Built HTML files: no `<iframe>/<object>/<embed>`, no `atob(`/`unescape(` blobs, no script/link tags pointing at external hosts. The external strings found are the same inert citation URLs noted above, carried through into the built HTML as literal string data.

### Vendored-copy integrity check

- `_platform_build/build_dashboard.py` (original) vs `category-strategy-1c344a/dashboard/_platform_build/build_dashboard.py` (vendored): `diff -u` produced **zero output** — byte-for-byte identical, no drift at all (not even path repointing was needed, since the file computes paths from `__file__`).
- Six vendored asset files, MD5 original vs vendored, all MATCH:
  - `app-shell.css` — eda40eebf5b98b7aa3e798c66bbf280e
  - `app-shell.js` — d4fbe20c07659cafac6dbd71be5e5a3a
  - `fonts-inline.css` — 16b8c6a41135062e61c85d471475c3a8
  - `theo-brand.js` — b78ad0d34380224160b0991658b59010
  - `theo-color.css` — 7899b2830c00e3ad81e3fe22768f1705
  - `theo-dino-mark.png` — 8ddee00287bfaff7bddabb7a380b1598

No drift detected. This is a clean vendoring, not a repeat of the prior drift pattern.

**Verdict: SAFE.**

## Overall

Both trees: SAFE. No network egress beyond inert user-clickable citation anchors, no code execution vectors, no filesystem escape, no secrets, no guardrail bypass, no obfuscation, no non-stdlib dependencies, no injection. Vendored `_platform_build` copy (script + 6 assets) is byte-identical to source, zero drift.
