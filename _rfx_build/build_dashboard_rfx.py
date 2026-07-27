#!/usr/bin/env python3
"""Assemble a self-contained RFX-tab dashboard HTML file by bundling the platform's
own render code (pv-01 boot helpers + the pv-02/03/04/09/11/14 RFx-tab module chain)
and its own project data (PROJECTS.nimbus / P-1056, the only project with mats.rfx=
true), wrapped in a clean, minimal slice of the platform's own chrome (topbar +
footer) -- the SAME technique used for the Deal-tab proof (see
build_dashboard_deal.py, one directory over, which this file's structure mirrors
line-for-line) and, before that, the Landscape proof (_platform_build/build_
dashboard.py).

BASE-BUILD SCOPE: prove the real platform RFx render (rfxHTML(), all 4 subtabs --
Overview / Scoring / Analysis / Recommendation, module state RFX_SUB) works self-
contained. No redesign, no panels added or removed.

BUNDLE SET (source-map recon, trusted facts): pv-01 (helpers/globals, incl. $ and
CURPROJ's pvData() reader) . pv-02 (LOAD-BEARING even though the RFx render never
reads LANDSCAPE itself: pv-03's PROJECTS object literal has a `landscape:LANDSCAPE`
field on every project record, including nimbus, evaluated eagerly at module-load
time, so the bare global LANDSCAPE must already exist before pv-03 runs or the whole
file throws ReferenceError at parse-eval -- same empirically-confirmed gotcha as the
Deal build) . pv-03 (PROJECTS.nimbus + traits that route nimbus onto the RFx tab, not
Deal/Renew) . pv-04 (domain fallbacks -- this is where the RFX global itself is
defined: `const RFX = _PVDOM.rfx || {criteria:[],requirements:[],suppliers:[],
panel:[],qa:[]};`, read from the seed's projectView.domain.rfx) . pv-09 (the RFx tab
entry rfxHTML()/rfxSub(), all 4 subtab renderers, fully self-contained -- confirmed
by grep that pv-09 defines its OWN infoHover() and MAILSVG locally, and never calls
LillyAPI) . pv-11 (rfxHTML()'s own dependency: `if(typeof ensureDealCss==='function')
ensureDealCss();` at its very first line -- ensureDealCss() injects the shared
.dealbar/.dlk/.rfx*/... stylesheet <style id="deal-css"> the RFx markup's classes
render against; pv-11's dealIsRfx()/dealIsRenewal()/dealIsBuyMsa() gate helpers are
harmless top-level function defs, never called from the RFx path) . pv-14 (load-
bearing helpers rfxHTML's call graph actually reaches: escapeHtmlPV/toast, same
inclusion rationale as the Deal build -- included WHOLE rather than hand-extracted,
because the RFx call graph touches more of pv-14 than just the two escaping/toast
helpers, e.g. termSource()'s golden-thread drill-down reuses pv-14's TERMS/pvData
wiring). NOT pv-05 (tab()/curtab-switching chrome, multi-tab bar + drawer plumbing --
same SCOPE NOTE as the Landscape build's nav RAIL and the Deal build's own pv-05
exclusion: this is a single, self-contained RFx-tab dashboard with no other tabs to
route to). NOT pv-06/07/08/10/12/13 (Overview / Landscape / Deal-contract / Terms-
renewal / Deal-commercial / Deal-review-renew render paths -- none on the RFx render
path; rfxHTML() dispatches ONLY to rfxOverviewHTML/rfxScoringHTML/rfxAnalysisHTML/
rfxRecommendationHTML, all defined in pv-09 itself). NOT the 7 pv-proj-*.js extra-
project modules (nimbus is fully defined in pv-03 already) or the React comms island.

KNOWN INTERACTION-ONLY GAP (documented, not a boot blocker, same class of limitation
the Deal build already carries for pv-05): a few RFx click handlers reached only by
user interaction -- never by the boot-time rfxHTML() render itself -- call
closeDrawer() unconditionally (e.g. rfxEmail(), termSource()'s drawer-close "x"),
and closeDrawer() lives in pv-05-workflow.js, which is out of scope per the SCOPE
NOTE above. Clicking those specific controls in this standalone build would throw;
the base render (mount + all 4 subtabs) does not reach them and is unaffected. This
mirrors the Deal build's own acceptance boundary for pv-05.

PV-14 PAGE-BOOT PATCH (mechanical, documented, identical mechanism to the Deal
build's patch_pv14() -- same literal constant, same source file): pv-14-docs-
comms.js is the LAST script the real project-view.html loads, so its tail carries
the full PAGE's boot sequence (`applyView();applyProject();`, run at top level,
unconditionally). applyView()/applyProject() call buildTabs()/renderTab()/
closeDrawer() (pv-05, out of scope here) and WOULD throw if left in place.
patch_pv14() removes ONLY that one literal top-level statement (asserted present
first). Every function pv-09's call graph actually reaches (escapeHtmlPV/toast) is
left completely untouched. BOOT_SCRIPT below mounts the RFx tab directly via
rfxHTML(), independent of applyProject()'s full-page wiring.

DOM ANCHORS: pv-14's composer-wiring line (`const ta=$('#ta'),sendBtn=$('#sendBtn'),
pill=$('#pill');`, top-level/unconditional, line 517 of the canonical file) requires
those three elements to literally exist the moment the script runs, and toast()
(called from many RFx interactions, e.g. rfxCancelEvent/rfxLockStructure/rfxExportRec)
does `$('#toast').textContent=...` with no null guard (pv-14 line 530). build() adds
these 4 elements to the page, hidden (display:none) -- inert DOM anchors so the
platform's own real code doesn't null-deref, not new interactive surface. Identical
to the Deal build's DOM ANCHORS note.

NO LillyAPI STUB (unlike the Deal build): confirmed by grep across pv-09-rfx.js --
zero references to LillyAPI. The RFx render path never attempts a live-data upgrade,
so no offline stub is needed here.

EXTRA FILE FOUND DURING BROWSER VERIFICATION (not in the original source-map recon):
pv-extracted-helpers.js (assets/pv-extracted-helpers.js, this build's own small file,
same technique/name as _platform_build/assets/pv-extracted-helpers.js). Clicking
through all 4 rendered subtabs in a real browser (the base-build acceptance bar) threw
`ReferenceError: pvHmRamp is not defined` on Analysis > Cross-Supplier -- pv-09 calls
pvHmRamp() (the Requirements-Fit heatmap color ramp) with NO typeof guard at 3 call
sites, but pvHmRamp is defined in pv-07-landscape-render.js, which is legitimately out
of scope (Landscape render, not RFx). Also found by the same scan: cciColor() (pv-06)
and pvSupColor()+its PVSUP_PAL/PVSUP_CMAP/PVSUP_CI state (pv-07) are called by pv-09
too, guarded with `typeof X==='function'` so they degrade to a generic fallback color
rather than throw -- included anyway (matching the fidelity bar already set by
including pv-11's ensureDealCss, itself typeof-guarded in pv-09 but still bundled) so
every color/shading value renders byte-identical to the real platform instead of a
generic gray. All three are small, pure, dependency-free (Math/string ops only) and
pulled in verbatim rather than the whole unrelated pv-06/pv-07 files -- see that file's
own header for the full per-function rationale. NOT a sign the given recipe was wrong
about the BUNDLE SET above (pv-06/pv-07 correctly excluded as whole files); this is a
handful of individual helper functions pv-09 reaches into them for, the same class of
gap the Landscape build's own pv-extracted-helpers.js already exists to solve for pv-07
pulling from pv-14.
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
# needs: seed helpers -> seed data -> Theo.data facade -> pv modules in their real
# numeric order (pv-01, pv-02, pv-03, pv-04, pv-09, pv-11, pv-14). See module
# docstring for why each is (or is not) included.
JS_FILES_IN_ORDER = [
    os.path.join(ASSETS, 'seed', '_util.js'),
    os.path.join(ASSETS, 'seed', 'project-view.js'),
    os.path.join(ASSETS, 'theo-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-01-boot-helpers.js'),
    os.path.join(ASSETS, 'pv', 'pv-02-landscape-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-03-projects-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-04-domain-data.js'),
    os.path.join(ASSETS, 'pv-extracted-helpers.js'),
    os.path.join(ASSETS, 'pv', 'pv-09-rfx.js'),
    os.path.join(ASSETS, 'pv', 'pv-11-deal-core.js'),
    os.path.join(ASSETS, 'pv', 'pv-14-docs-comms.js'),
]

# The one literal top-level statement patched out of pv-14 -- see PV-14 PAGE-BOOT
# PATCH in the module docstring. Asserted present (read_raw + patch_pv14 below) so
# an upstream edit to the real file fails this build loudly instead of quietly
# shipping a stale patch. Identical constant to build_dashboard_deal.py's.
PV14_BOOT_CALL = 'applyView();applyProject();'
PV14_BOOT_REPLACEMENT = (
    '/* PATCHED (build_dashboard_rfx.py): applyView()/applyProject() drive the '
    'FULL page (multi-tab bar, drawer, workflow-model chrome via pv-05, not part '
    'of this RFx-tab-only bundle) and would throw (buildTabs/renderTab/'
    'closeDrawer are undefined here). This single-tab build mounts the RFx tab '
    'directly via its own boot script instead -- see PV-14 PAGE-BOOT PATCH note '
    'at the top of build_dashboard_rfx.py. */'
)


def patch_pv14(js_text):
    if PV14_BOOT_CALL not in js_text:
        raise RuntimeError(
            'pv-14-docs-comms.js: expected literal "{}" not found -- upstream file '
            'changed, patch_pv14() needs re-verifying against the new source.'.format(PV14_BOOT_CALL)
        )
    return js_text.replace(PV14_BOOT_CALL, PV14_BOOT_REPLACEMENT, 1)


BOOT_SCRIPT = (
    "curtab='rfx';RFX_SUB='overview';CURPROJ='nimbus';"
    "(function(){function go(){try{"
    "document.getElementById('tabbody').innerHTML=rfxHTML();"
    "}catch(e){document.getElementById('tabbody').innerHTML="
    "'<pre style=\"color:#b00;padding:16px;white-space:pre-wrap\">'+String((e&&e.stack)||e)+'</pre>';}}"
    "if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',go);}"
    "else{go();}})();"
)

# ---------------------------------------------------------------------------
# Authentic page chrome, extracted mechanically from copies of the platform's own
# app-shell.js and theo-brand.js -- byte-for-byte the same technique as
# build_dashboard_deal.py's extract_chrome() (itself mirroring _platform_build/
# build_dashboard.py's); see that file's PAGE CHROME NOTE for the full rationale
# (JS-generated topbar/footer, reduced here to logo + wordmark + dino mark + user
# name on the left/right, no bell/tasks/role switcher/mascot animation).
# ---------------------------------------------------------------------------

APP_SHELL_JS = os.path.join(ASSETS, 'app-shell.js')
THEO_BRAND_JS = os.path.join(ASSETS, 'theo-brand.js')
DINO_MARK_PNG = os.path.join(ASSETS, 'theo-dino-mark.png')

QUOTED_RE = re.compile(r"'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"", re.S)

# Body title (eyebrow + <h1>): read straight from PROJECTS.nimbus in the copied
# pv-03 data (never fabricated), mirroring default_project_title() in the Deal
# build and default_search_subject() in the Landscape build.
PROJECT_KEY = 'nimbus'
EYEBROW = 'RFx'


def concat_quoted_segments(slice_text):
    return ''.join(ast.literal_eval(m.group(0)) for m in QUOTED_RE.finditer(slice_text))


def read_raw(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def default_project_title():
    """Read PROJECTS.nimbus.title + .code straight out of the copied pv-03-
    projects-data.js (a JS object literal, not JSON) via a small bracket-balanced
    scan from the `nimbus:{` key, so it can't be tripped up by nested braces/quotes
    in the record. Mirrors build_dashboard_deal.py's default_project_title()."""
    src = read_raw(os.path.join(ASSETS, 'pv', 'pv-03-projects-data.js'))
    m = re.search(r"\bnimbus\s*:\s*\{", src)
    if not m:
        raise RuntimeError('pv-03-projects-data.js: no nimbus:{ project record found')
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
        raise RuntimeError('pv-03-projects-data.js: nimbus record missing title/code')
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

    # Footer: match the LOCKED Landscape/Deal dashboard template -- an empty,
    # link-free footer bar (Marc: remove ALL footer text/link bar; keep the
    # element only for the bottom gutter it provides), not theo-brand.js's
    # app-shell footer (Help Center / Procurement Playbook / Give feedback /
    # What's new link bar), which is a rail-app-only concern this standalone
    # dashboard doesn't have.
    footer_html = ('<footer class="theo-foot" role="contentinfo">'
        '<span style="display:block;text-align:center;font:600 11px/32px var(--sans,system-ui);'
        'letter-spacing:.04em;color:var(--mut,#505A64)">'
        'Lilly Global Procurement | Theo v0.1 - July 2026</span></footer>')

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
    # the outer page must scroll instead -- same override as the Deal/Landscape
    # builds.
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
    # LIGHT-ONLY (Marc, 2026-07-26): this dashboard has no theme toggle anywhere in its
    # bundled JS (confirmed: none of the pv-*/seed/theo-data modules or theo-brand.js's
    # runtime script are wired into this single-tab build), so there is already no in-page
    # way to switch to dark. data-theme="light" is stamped on <html> anyway, as belt-and-
    # braces defense-in-depth -- the SAME technique build_dashboard_deal.py uses: it
    # neutralizes theo-color.css's/app-shell.css's html[data-theme="dark"] override blocks
    # (still present as inert, unreachable dead CSS, same as the Landscape build) so the
    # page renders light byte-for-byte regardless of any stray data-theme state, matching
    # the LOCKED Landscape/Deal dashboards.
    parts.append('<!doctype html>\n<html lang="en" data-theme="light">\n<head>\n<meta charset="utf-8">')
    parts.append('<meta name="viewport" content="width=device-width,initial-scale=1">')
    parts.append('<title>RFx - ' + safe_subject + '</title>')
    for css in css_blocks:
        parts.append('<style>' + css + '</style>')
    parts.append('<style>' + chrome_css + '</style>')
    parts.append('</head><body>')
    parts.append(topbar_html)
    parts.append('<main class="sa-main">' + title_html + '<div id="tabbody"></div></main>')
    parts.append(dom_anchors_html)
    for js in js_blocks:
        parts.append('<script>' + js + '</script>')
    parts.append('<script>' + safe_for_script_tag(chrome_stub_js) + '</script>')
    parts.append('<script>' + BOOT_SCRIPT + '</script>')
    parts.append(chrome['footer_html'])
    parts.append('</body></html>')

    doc = ''.join(parts)
    # Suite hard rule: no em dashes in output. A few remain in shared platform
    # modules (pv-11/14/seed) as separators/placeholders; normalize to hyphen at
    # assembly so every build is em-dash-free regardless of upstream source.
    doc = doc.replace('—', '-')
    # also normalize dash ENTITIES the char-strip misses (they render as em/en dashes)
    doc = doc.replace('&mdash;', '-').replace('&ndash;', '-').replace('&#8212;', '-').replace('&#8211;', '-')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(doc)

    size = os.path.getsize(out_path)
    print('wrote {} ({} bytes, {:.2f} MB)'.format(out_path, size, size / (1024 * 1024)))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(BUILD_DIR, 'rfx-dashboard.html'))
    ap.add_argument('--user', default='Procurement User')
    args = ap.parse_args()
    build(args.out, user_name=args.user)
