#!/usr/bin/env python3
"""Assemble a self-contained DEAL-tab dashboard HTML file by bundling the
platform's own render code (pv-01 boot helpers + the pv-03/04/08/10/11/12/13/14
Deal-tab module chain) and its own project data (PROJECTS.acme / P-1042), wrapped
in a clean, minimal slice of the platform's own chrome (topbar + footer) -- the
SAME technique used for the supplier-landscape proof (see
_platform_build/build_dashboard.py, which this file's structure mirrors).

PHASE 1 SCOPE: prove the real platform Deal render (dealHTML(), all 3 modes:
Negotiate / Pro-forma / Review) works self-contained. No redesign.

DATA CONTRACT NOTE (differs from Landscape): PROJECTS.acme has NO `deal` key.
The Deal tab's content comes from GLOBAL fallback constants (NEGPREP / CONTRACT /
DEAL_CATEGORIES / ZOPA_LINES / DEAL_ISSUES / PRICING / DEAL_TCO / RENEWAL / ...)
read once at module-init via Theo.data.projectViewSeed(), which is backed by ONE
seed file: assets/seed/project-view.js (window.__SEED__.projectView = {domain,
deal, termsRenew, neg, commercial, reviewRenew}). That seed is NOT project-keyed
(acme-specific prose is hardcoded inline in the pv-08/10/11/12/13 render functions
themselves, e.g. "$1.8M TCO (3-yr)"), so bundling it is a single small seed file,
not a per-project data swap. assets/seed/_util.js (stub()/THEO_SEED_HELPERS) and
assets/theo-data.js (the Theo.data.projectViewSeed() facade) sit in front of it,
matching the real project-view.html script order exactly (seed helpers -> seed
data -> facade -> pv modules).

EXTRA FILE BEYOND THE MAP'S LISTED SET: pv-02-landscape-data.js (721 bytes). Not
in DEAL-TAB-MAP.md's dependency list, but load-bearing: PROJECTS.acme's object
literal in pv-03 has a `landscape:LANDSCAPE` field, evaluated eagerly at module
load, so the bare global LANDSCAPE must already exist before pv-03 runs or the
whole file throws ReferenceError at parse-eval time (confirmed empirically). Tiny
and side-effect-free -- reads `Theo.data.projectViewSeed().landscape` (already
loaded via the seed layer above) and gracefully degrades to `[]`, same "seed-
backed, empty-safe fallback" pattern the landscape build already established for
pv-04. The Deal tab itself never reads LANDSCAPE.

BUNDLE SET (see DEAL-TAB-MAP.md section 3): pv-01 (helpers/globals) . pv-03
(PROJECTS.acme + traits that gate acme onto the standard 3-mode Deal tab, not
RFx/buy-under-MSA/Renew) . pv-04 (domain fallbacks) . pv-08 (status strip,
versions, LEAH, rerenderDeal) . pv-10 (ZOPA_LINES/DEAL_TCO/DEAL_ISSUES/PRICING/
DEAL_MODE) . pv-11 (dealHTML's own dispatch helpers: dealIsRfx/dealIsBuyMsa/
dealIsRenewal/ensureDealCss/dealIssuesHTML/dealNegotiateExtras) . pv-12 (Commercial
analysis + Pro-forma) . pv-13 (the Deal tab entry dealHTML()/dealMode(), Review
mode) . pv-14 (load-bearing helpers dealHTML's call graph actually reaches:
escD/escapeHtmlPV/safeHref/toast/nowStamp/CCIVAR/aiMsg/renderChat -- included
WHOLE rather than hand-extracted like the landscape build's pv-extracted-
helpers.js, because the Deal call graph touches far more of pv-14 than just two
escaping helpers). NOT pv-07 (landscape) or pv-09 (RFx scoring / infoHover --
confirmed by grep that no Deal-mode render path calls infoHover; pv-14's own two
infoHover call sites are in the Documents/Communications tabs, never reached from
dealHTML()). Also NOT pv-05 (tab()/curtab-switching chrome, pv-06 (Overview), the
7 pv-proj-*.js extra-project modules (acme is fully defined in pv-03 already), or
the React comms island -- none of those are on the Deal render path either.

PV-14 PAGE-BOOT PATCH (mechanical, documented, same class of edit as the landscape
build's extract_chrome() dead_rule removal from brand_css -- a small, asserted,
verbatim string patch, not a rewrite): pv-14-docs-comms.js is the LAST script the
real project-view.html loads, so its tail carries the full PAGE's boot sequence
(`applyView();applyProject();`, run at top level, unconditionally, the moment the
script executes). applyView()/applyProject() call buildTabs()/renderTab()/
closeDrawer() -- the multi-tab bar + drawer chrome, defined in pv-05-workflow.js,
which is legitimately out of scope here (same reasoning as the landscape build's
SCOPE NOTE for the nav RAIL: this is a single, self-contained Deal-tab dashboard
with no other tabs to route to, so the multi-tab bar's boot wiring is dead weight
-- worse, unlike the RAIL (simply not reproduced), leaving this call in would
THROW, because pv-05 is not part of the Deal-tab bundle). patch_pv14() below
removes ONLY that one literal top-level statement (asserted present first, so a
future edit to the real file fails loudly here instead of silently mis-patching);
every function definition in pv-14 (including the ones the Deal call graph
actually uses: escD/escapeHtmlPV/safeHref/toast/nowStamp/CCIVAR/aiMsg/renderChat)
is left completely untouched. Our own BOOT_SCRIPT below mounts the Deal tab
directly via dealHTML(), independent of applyProject()'s full-page wiring.

DOM ANCHORS: pv-14's composer-wiring lines (`const ta=$('#ta'),sendBtn=$('#sendBtn'),
pill=$('#pill'); ta.addEventListener(...)`, also top-level/unconditional) require
those three elements to literally exist the moment the script runs, and toast()
(called from several Deal interactions, incl. dealDraftVendorResponse, and
exercised directly in smoke_deal.cjs) does `$('#toast').textContent=...` with no
null guard. build() adds these 4 elements to the page, hidden (display:none) since
this build has no chat pane/toast UI of its own -- inert DOM anchors so the
platform's own real code doesn't null-deref, not new interactive surface.

GOTCHA (offline): dealReviewLoad() (pv-13) and dealPrepLoad()/dealProFormaLoad()/
dealDraftVendorResponse() (pv-12/pv-13) call LillyAPI.tryLive(fn, mock) with NO
`!window.LillyAPI` guard on some paths, and WOULD throw ReferenceError: LillyAPI
is not defined if left unstubbed. build() below injects a minimal window.LillyAPI
stub (configured() -> false, tryLive(fn, mock) -> always resolves the MOCK/demo
branch WITHOUT ever invoking fn) into LILLYAPI_STUB_JS, appended right after the
pv scripts and before the boot script. This exactly reproduces the real
LillyAPI.tryLive's own "not configured" branch (see the platform's assets/api.js:
`if (!configured()) return { data: mock, source: 'demo' };`), so every Deal-tab
live-upgrade path falls back to the static/demo render, safe fully offline.
"""
import argparse
import ast
import base64
import os
import re

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BUILD_DIR, 'assets')

CSS_FILES_IN_ORDER = [
    os.path.join(ASSETS, 'fonts-inline.css'),
    os.path.join(ASSETS, 'app-shell.css'),
    os.path.join(ASSETS, 'pv', 'pv.css'),
    os.path.join(ASSETS, 'theo-color.css'),
]

# Matches the real project-view.html <script> order for the pieces this build
# needs: seed helpers -> seed data -> Theo.data facade -> pv modules in their
# real numeric order (pv-01, pv-03, pv-04, pv-08, pv-10, pv-11, pv-12, pv-13,
# pv-14). See module docstring for why each is (or is not) included.
JS_FILES_IN_ORDER = [
    os.path.join(ASSETS, 'seed', '_util.js'),
    os.path.join(ASSETS, 'seed', 'project-view.js'),
    os.path.join(ASSETS, 'theo-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-01-boot-helpers.js'),
    os.path.join(ASSETS, 'pv', 'pv-02-landscape-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-03-projects-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-04-domain-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-08-deal-contract.js'),
    os.path.join(ASSETS, 'pv', 'pv-10-terms-renewal.js'),
    os.path.join(ASSETS, 'pv', 'pv-11-deal-core.js'),
    os.path.join(ASSETS, 'pv', 'pv-12-deal-commercial.js'),
    os.path.join(ASSETS, 'pv', 'pv-13-deal-review-renew.js'),
    os.path.join(ASSETS, 'pv', 'pv-14-docs-comms.js'),
]

# The one literal top-level statement patched out of pv-14 -- see PV-14 PAGE-BOOT
# PATCH in the module docstring. Asserted present (read_raw + patch_pv14 below)
# so an upstream edit to the real file fails this build loudly instead of quietly
# shipping a stale patch.
PV14_BOOT_CALL = 'applyView();applyProject();'
PV14_BOOT_REPLACEMENT = (
    '/* PATCHED (build_dashboard_deal.py): applyView()/applyProject() drive the '
    'FULL page (multi-tab bar, drawer, workflow-model chrome via pv-05, not part '
    'of this Deal-tab-only bundle) and would throw (buildTabs/renderTab/'
    'closeDrawer are undefined here). This single-tab build mounts the Deal tab '
    'directly via its own boot script instead -- see PV-14 PAGE-BOOT PATCH note '
    'at the top of build_dashboard_deal.py. */'
)


def patch_pv14(js_text):
    if PV14_BOOT_CALL not in js_text:
        raise RuntimeError(
            'pv-14-docs-comms.js: expected literal "{}" not found -- upstream file '
            'changed, patch_pv14() needs re-verifying against the new source.'.format(PV14_BOOT_CALL)
        )
    return js_text.replace(PV14_BOOT_CALL, PV14_BOOT_REPLACEMENT, 1)

# ---------------------------------------------------------------------------
# Minimal offline LillyAPI stub (see GOTCHA note in the module docstring).
# Placed in its own <script>, AFTER the pv scripts (so it isn't clobbered by
# anything) and BEFORE the boot script (so dealPostRender's live-upgrade calls,
# fired via setTimeout(dealPostRender,0) right after dealHTML() mounts, see it).
# ---------------------------------------------------------------------------
LILLYAPI_STUB_JS = (
    "window.LillyAPI={"
    "configured:function(){return false;},"
    # Never invoke fn -- mirrors the real tryLive's own "not configured" branch
    # (assets/api.js: `if (!configured()) return { data: mock, source: 'demo' };`),
    # so every call site's live-upgrade attempt safely falls back to its static/
    # demo render without depending on any other LillyAPI.* method existing.
    "tryLive:function(fn,mock){return Promise.resolve({data:mock,source:'demo'});}"
    "};"
)

BOOT_SCRIPT = (
    "curtab='deal';DEAL_MODE='negotiate';CURPROJ='acme';"
    "(function(){function go(){try{"
    "if(typeof rerenderDeal==='function'){rerenderDeal();}"
    "else{document.getElementById('tabbody').innerHTML=dealHTML();}"
    "}catch(e){document.getElementById('tabbody').innerHTML="
    "'<pre style=\"color:#b00;padding:16px;white-space:pre-wrap\">'+String((e&&e.stack)||e)+'</pre>';}}"
    "if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',go);}"
    "else{go();}})();"
)

# ---------------------------------------------------------------------------
# Authentic page chrome, extracted mechanically from copies of the platform's
# own app-shell.js and theo-brand.js -- byte-for-byte the same technique as
# _platform_build/build_dashboard.py's extract_chrome(); see that file's PAGE
# CHROME NOTE for the full rationale (JS-generated topbar/footer, reduced here
# to logo + wordmark + dino mark + user name on the left/right, no bell/tasks/
# role switcher/mascot animation).
# ---------------------------------------------------------------------------

APP_SHELL_JS = os.path.join(ASSETS, 'app-shell.js')
THEO_BRAND_JS = os.path.join(ASSETS, 'theo-brand.js')
DINO_MARK_PNG = os.path.join(ASSETS, 'theo-dino-mark.png')

QUOTED_RE = re.compile(r"'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"", re.S)

# Body title (eyebrow + <h1>): the real project-view.html subhead shows
# "Analytics SaaS, Acme AI" / "P-1042" -- read straight from PROJECTS.acme in
# the copied pv-03 data (never fabricated), mirroring default_search_subject()
# in the landscape build.
PROJECT_KEY = 'acme'
EYEBROW = 'Deal'


def concat_quoted_segments(slice_text):
    return ''.join(ast.literal_eval(m.group(0)) for m in QUOTED_RE.finditer(slice_text))


def read_raw(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def default_project_title():
    """Read PROJECTS.acme.title + .code straight out of the copied pv-03-projects-
    data.js (a JS object literal, not JSON) via a small bracket-balanced scan from
    the `acme:{` key, so it can't be tripped up by nested braces/quotes in the
    record. Mirrors default_search_subject()'s never-fabricate contract."""
    src = read_raw(os.path.join(ASSETS, 'pv', 'pv-03-projects-data.js'))
    m = re.search(r"\bacme\s*:\s*\{", src)
    if not m:
        raise RuntimeError('pv-03-projects-data.js: no acme:{ project record found')
    start = m.end() - 1
    depth = 0
    i = start
    while i < len(src):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    body = src[start:i + 1]
    tm = re.search(r"title\s*:\s*'((?:[^'\\]|\\.)*)'", body)
    cm = re.search(r"code\s*:\s*'((?:[^'\\]|\\.)*)'", body)
    if not tm or not cm:
        raise RuntimeError('pv-03-projects-data.js: acme record missing title/code')
    title = ast.literal_eval("'" + tm.group(1) + "'")
    code = ast.literal_eval("'" + cm.group(1) + "'")
    return title, code


def data_uri(path, mime):
    with open(path, 'rb') as f:
        raw = f.read()
    return 'data:' + mime + ';base64,' + base64.b64encode(raw).decode('ascii')


def extract_chrome():
    app_shell = read_raw(APP_SHELL_JS)
    theo_brand = read_raw(THEO_BRAND_JS)

    m = re.search(r"LILLY_LOGO\s*=\s*'data:image/png;base64,([^']+)'", app_shell)
    lilly_logo_uri = 'data:image/png;base64,' + m.group(1)

    i = theo_brand.index('f.innerHTML =')
    j = theo_brand.index('document.body.appendChild(f); return true;', i)
    footer_inner_html = concat_quoted_segments(theo_brand[i:j])
    footer_html = '<footer class="theo-foot" role="contentinfo">' + footer_inner_html + '</footer>'

    fn_i = theo_brand.index('function inject() {')
    content_i = theo_brand.index('s.textContent =', fn_i) + len('s.textContent =')
    content_j = theo_brand.index('document.head.appendChild(s);', content_i)
    brand_css = concat_quoted_segments(theo_brand[content_i:content_j])
    for dead_rule in (
        '.topbar .mqbtn,.topbar .mqbtn .lbl,.topbar .mqbadge{color:var(--topbar-fg)!important}',
        '.topbar .ntfbtn{color:var(--topbar-fg)!important}'
        '.topbar .ntfbtn:hover{background:var(--topbar-ctrl-hover)!important}',
        '.topbar .role .mqbtn .lbl{display:none!important}',
    ):
        assert dead_rule in brand_css, 'expected dead rule not found: ' + dead_rule
        brand_css = brand_css.replace(dead_rule, '', 1)

    fn_i = theo_brand.index('function injectCss() {')
    arr_end = theo_brand.index("].join('');", fn_i)
    css_array_src = theo_brand[fn_i:arr_end]
    all_segments = [ast.literal_eval(m.group(0)) for m in QUOTED_RE.finditer(css_array_src)]
    foot_css = ''.join(s for s in all_segments if s.startswith('.theo-foot'))

    return {
        'lilly_logo_uri': lilly_logo_uri,
        'footer_html': footer_html,
        'brand_css': brand_css,
        'foot_css': foot_css,
    }


def safe_for_script_tag(text):
    return text.replace('</script>', '<\\/script>')


def build(out_path, user_name='Procurement User'):
    title, code = default_project_title()

    css_blocks = [read_raw(p) for p in CSS_FILES_IN_ORDER]
    js_blocks = []
    for p in JS_FILES_IN_ORDER:
        text = read_raw(p)
        if os.path.basename(p) == 'pv-14-docs-comms.js':
            text = patch_pv14(text)
        js_blocks.append(safe_for_script_tag(text))

    chrome = extract_chrome()
    dino_mark_uri = data_uri(DINO_MARK_PNG, 'image/png')

    gutter_css = (
        '.sa-main{padding:28px 40px 70px;max-width:1320px;margin:0 auto}'
        '@media(max-width:760px){.sa-main{padding:22px 16px 60px}}'
    )
    # pv.css sets html,body{overflow:hidden} for the live multi-pane app (each
    # pane scrolls internally). This single-dashboard build has no side rail, so
    # the outer page must scroll instead -- same override as the landscape build.
    scroll_css = 'html,body{height:auto!important;overflow:auto!important}'
    tdino_css = (
        '.theomark .tdino{height:26px;width:auto;display:block;'
        'object-fit:contain;filter:var(--dino-filter)}'
    )
    title_css = (
        '.sa-title{margin:0 0 22px}'
        '.sa-title .eyebrow{font:700 11px var(--sans);letter-spacing:.08em;'
        'text-transform:uppercase;color:var(--mut);margin:0 0 6px}'
        '.sa-title h1{font-family:var(--sans);font-size:28px;font-weight:800;'
        'letter-spacing:-.01em;line-height:1.2;color:var(--ink);margin:0}'
    )
    chrome_css = (
        chrome['brand_css'] + chrome['foot_css']
        + tdino_css + title_css + gutter_css + scroll_css
    )

    chrome_stub_js = "window.theoHelpOpen=window.theoHelpOpen||function(){};"

    # Inert DOM anchors pv-14's own top-level composer-wiring code and toast()
    # require to literally exist -- see DOM ANCHORS note in the module docstring.
    # Hidden: this build has no chat pane/toast UI, these just prevent the
    # platform's own unmodified code from null-deref'ing on page load.
    dom_anchors_html = (
        '<textarea id="ta" style="display:none" aria-hidden="true"></textarea>'
        '<button id="sendBtn" style="display:none" aria-hidden="true"></button>'
        '<div id="pill" style="display:none" aria-hidden="true"></div>'
        '<div class="toast" id="toast"></div>'
    )

    import html as htmlmod
    safe_user_name = htmlmod.escape((user_name or '').strip() or 'Procurement User')
    safe_subject = htmlmod.escape(title + ' · ' + code)
    safe_eyebrow = htmlmod.escape(EYEBROW)

    user_icon_svg = (
        '<svg class="avicon" viewBox="0 0 24 24" width="18" height="18" '
        'aria-hidden="true" focusable="false"><path fill="currentColor" '
        'd="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c'
        '-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
    )

    topbar_html = (
        '<div class="topbar">'
        '<div class="brand">'
        '<img src="' + chrome['lilly_logo_uri'] + '" alt="Lilly"/>'
        '<span class="theomark"><span class="twm">Theo</span>'
        '<img class="tdino" src="' + dino_mark_uri + '" alt="" aria-hidden="true"></span>'
        '</div>'
        '<div class="role">'
        '<div class="who">'
        '<div class="av" id="av">' + user_icon_svg + '</div>'
        '<div><div class="nm" id="rname">' + safe_user_name + '</div></div>'
        '</div>'
        '</div>'
        '</div>'
    )

    title_html = (
        '<div class="sa-title"><div class="eyebrow">' + safe_eyebrow + '</div>'
        '<h1>' + safe_subject + '</h1></div>'
    )

    parts = []
    parts.append('<!doctype html><html lang="en"><head><meta charset="utf-8">')
    parts.append('<meta name="viewport" content="width=device-width,initial-scale=1">')
    parts.append('<title>Deal - ' + safe_subject + '</title>')
    for css in css_blocks:
        parts.append('<style>' + css + '</style>')
    parts.append('<style>' + chrome_css + '</style>')
    parts.append('</head><body>')
    parts.append(topbar_html)
    parts.append('<main class="sa-main">' + title_html + '<div id="tabbody"></div></main>')
    parts.append(dom_anchors_html)
    for js in js_blocks:
        parts.append('<script>' + js + '</script>')
    parts.append('<script>' + safe_for_script_tag(LILLYAPI_STUB_JS) + '</script>')
    parts.append('<script>' + safe_for_script_tag(chrome_stub_js) + '</script>')
    parts.append('<script>' + BOOT_SCRIPT + '</script>')
    parts.append(chrome['footer_html'])
    parts.append('</body></html>')

    doc = ''.join(parts)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(doc)

    size = os.path.getsize(out_path)
    print('wrote {} ({} bytes, {:.2f} MB)'.format(out_path, size, size / (1024 * 1024)))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(BUILD_DIR, 'deal-acme-PLATFORM.html'))
    ap.add_argument('--user', default='Procurement User')
    args = ap.parse_args()
    build(args.out, user_name=args.user)
