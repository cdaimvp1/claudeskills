#!/usr/bin/env python3
"""Assemble a self-contained supplier-landscape dashboard HTML file by bundling the
platform's own render code (pv-01 boot helpers + pv-07 landscape render) and its own
deep "Cloud Data Warehouse" (nimbus) project data. Pure mechanical concatenation --
no hand-written HTML/CSS, no modification of the source files' content (only the
literal "</script>" escaping required so inlined JS can't break out of a <script> tag).

CSS ORDER NOTE: the real project-view.html links pv.css BEFORE theo-color.css, and
theo-color.css documents itself as "the AUTHORITATIVE color + shading token layer...
every page links this (after its own base stylesheet)". pv.css also carries its own
:root token block (a legacy/standalone fallback). To render IDENTICALLY to the real
page, theo-color.css's tokens must win the cascade, so it is inlined LAST: fonts,
then app-shell.css (unused there, harmless), then pv.css, then theo-color.css.

PAGE CHROME NOTE (topbar / footer / content gutters): the platform's own page chrome
is largely JS-generated at runtime (assets/app-shell.js injects the red topbar +
notification bell; assets/theo-brand.js injects the "theomark" Theo wordmark +
sleeping-dino mascot + the app-wide footer). Rather than hand-copy that markup/CSS by
eye, extract_chrome() below mechanically scans VERBATIM copies of those two files
(same string-literal-concatenation technique the files themselves use, decoded with
ast.literal_eval) and pulls out exactly the pieces this single-dashboard build needs:
the TOPBAR html, the Lilly logo (already embedded in app-shell.js as a tight-cropped
base64 PNG -- verified via PIL, no re-cropping needed), the theomark/Sacramento CSS,
the notification-bell CSS, the footer html + its CSS, and the startWalk() dino
mascot function. This keeps the chrome byte-faithful to the real platform and keeps
re-extracting cheap if app-shell.js/theo-brand.js are refreshed from the platform.

SCOPE NOTE: this build deliberately does NOT reproduce the platform's left nav RAIL
(app-shell.js's mount() normally wraps a page's content in <div class="app"><nav
class="rail">...<main class="shell-main">). This is a single, self-contained
dashboard file with no other pages to route to -- a rail full of <a href="projects.
html">-style links here would be dead links, and the user's ask was specifically
header + side padding + scrollbar + footer, not app navigation. If a rail is wanted
later, RAIL/railHtml() in app-shell.js is the authentic source to extract from.
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
    # tasks-drawer.css: styles the topbar's Tasks button (.mqbtn/.mqbadge), which
    # is part of the authentic TOPBAR markup extracted below. Its .mqdrawer/
    # .mqscrim rules (the actual tasks drawer panel) go unused here, harmless.
    os.path.join(ASSETS, 'tasks-drawer.css'),
    os.path.join(ASSETS, 'pv', 'pv.css'),
    os.path.join(ASSETS, 'theo-color.css'),
]

JS_FILES_IN_ORDER = [
    os.path.join(ASSETS, 'pv', 'pv-01-boot-helpers.js'),
    # pv-07 reads the RFX global (isCompRFx() / exec summary "must-fail" callout), which is
    # declared in pv-04-domain-data.js. That module gracefully degrades to empty defaults
    # (RFX={criteria:[],requirements:[],suppliers:[],panel:[],qa:[]}, etc.) whenever
    # Theo.data.projectViewSeed() is unavailable -- exactly our standalone case -- so the
    # whole (small, 3.5KB) real file is inlined rather than hand-stubbing RFX's shape.
    # Loaded here, before pv-07, matching the real project-view.html script order.
    os.path.join(ASSETS, 'pv', 'pv-04-domain-data.js'),
    os.path.join(ASSETS, 'pv', 'pv-07-landscape-render.js'),
    # escD/escapeHtmlPV are called by pv-07 but defined in pv-14-docs-comms.js (not shipped
    # here). Extracted verbatim rather than stubbed -- see pv-extracted-helpers.js header.
    os.path.join(ASSETS, 'pv-extracted-helpers.js'),
    os.path.join(ASSETS, 'landscape-data.js'),
]

BOOT_SCRIPT = (
    "curtab='landscape';if(typeof PVSL_SUB==='undefined')PVSL_SUB='exec';"
    "(function(){function go(){try{if(typeof pvRerender==='function'){pvRerender();}"
    "else{document.getElementById('tabbody').innerHTML=landscapeHTML();}}"
    "catch(e){document.getElementById('tabbody').innerHTML="
    "'<pre style=\"color:#b00;padding:16px;white-space:pre-wrap\">'+String((e&&e.stack)||e)+'</pre>';}}"
    "if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',go);}"
    "else{go();}})();"
)

# ---------------------------------------------------------------------------
# Authentic page chrome, extracted mechanically from copies of the platform's
# own app-shell.js and theo-brand.js (see PAGE CHROME NOTE above).
# ---------------------------------------------------------------------------

APP_SHELL_JS = os.path.join(ASSETS, 'app-shell.js')
THEO_BRAND_JS = os.path.join(ASSETS, 'theo-brand.js')
DINO_POSTER_PNG = os.path.join(ASSETS, 'dino_red', 'n_sleep_poster.png')

# Matches a single JS string literal, either quote style, with escapes intact.
QUOTED_RE = re.compile(r"'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"", re.S)

DASHBOARD_TAG = 'Supplier Landscape Search'


def concat_quoted_segments(slice_text):
    """Concatenate every quoted JS string literal found in slice_text, in order.
    ast.literal_eval decodes the same escape grammar JS uses for these plain
    literals (\\', \\", \\\\, \\uXXXX), so this is a faithful decode of the
    source's actual string content, not a hand transcription of it."""
    return ''.join(ast.literal_eval(m.group(0)) for m in QUOTED_RE.finditer(slice_text))


def extract_brace_block(src, fn_name):
    """Return the full verbatim source of `function fn_name() { ... }`, brace-matched
    (a plain next-'}' search would stop at the function's first nested brace)."""
    idx = src.index('function ' + fn_name + '(')
    start = src.index('{', idx)
    depth = 0
    i = start
    while True:
        c = src[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return src[idx:i + 1]
        i += 1


def data_uri(path, mime):
    with open(path, 'rb') as f:
        raw = f.read()
    return 'data:' + mime + ';base64,' + base64.b64encode(raw).decode('ascii')


def extract_chrome():
    app_shell = read_raw(APP_SHELL_JS)
    theo_brand = read_raw(THEO_BRAND_JS)

    # ---- Lilly logo -------------------------------------------------------
    # The exact base64 PNG every real page's `.brand img` uses (byte-identical
    # across project-view.html, my-work.html, and app-shell.js's own TOPBAR).
    # Verified via PIL: alpha-channel bbox spans the full 120x65 canvas edge to
    # edge, i.e. it is already a tight crop -- no re-cropping needed.
    m = re.search(r"LILLY_LOGO\s*=\s*'data:image/png;base64,([^']+)'", app_shell)
    lilly_logo_uri = 'data:image/png;base64,' + m.group(1)

    # ---- TOPBAR -------------------------------------------------------------
    # app-shell.js: `var TOPBAR = '...' + LILLY_LOGO + '...' + ...;`. LILLY_LOGO
    # is a bare identifier mid-concatenation (not itself quoted), so splice its
    # real value in as a quoted literal before scanning for quoted segments.
    i = app_shell.index('var TOPBAR =')
    j = app_shell.index('\n\n  var DRAWER =', i)
    topbar_slice = app_shell[i:j].replace('LILLY_LOGO', "'" + lilly_logo_uri + "'")
    topbar_html = concat_quoted_segments(topbar_slice)

    # theo-brand.js's inject() appends <span class="theomark"><span class="twm">
    # Theo</span></span> to .brand at runtime (the Sacramento-script wordmark).
    # Reproduced statically here with one addition: a <span class="ttag"> using
    # the CSS contract theo-brand.js already styles (`.theomark .ttag`, see
    # brand_css below) but never populates on any live page. Per this build's
    # spec, this dashboard's tag is "Supplier Landscape Search".
    theomark_html = (
        '<span class="theomark"><span class="twm">Theo</span>'
        '<span class="ttag">' + DASHBOARD_TAG + '</span></span>'
    )
    brand_img_tag = '<img src="' + lilly_logo_uri + '" alt="Lilly"/>'
    assert topbar_html.count(brand_img_tag + '</div>') == 1
    topbar_html = topbar_html.replace(
        brand_img_tag + '</div>', brand_img_tag + theomark_html + '</div>', 1
    )

    # ---- Footer -------------------------------------------------------------
    # theo-brand.js's injectFooter(): `f.innerHTML = '...' + ... ;` (the
    # "Help Center / Procurement Playbook / Give feedback / What's new" bar).
    i = theo_brand.index('f.innerHTML =')
    j = theo_brand.index('document.body.appendChild(f); return true;', i)
    footer_inner_html = concat_quoted_segments(theo_brand[i:j])
    footer_html = '<footer class="theo-foot" role="contentinfo">' + footer_inner_html + '</footer>'

    # ---- theomark / Sacramento-wordmark CSS ---------------------------------
    # theo-brand.js's inject(): the :root chrome tokens + .theomark/.twm/.ttag
    # rules + the sleeping-dino Zzz keyframes. NOTE: this CSS block also injects
    # a <link> to Google Fonts for Sacramento at runtime; that is NOT reproduced
    # here (would be this build's only network call) because Sacramento is
    # already self-hosted as a base64 woff2 @font-face in fonts-inline.css,
    # inlined above -- confirmed by inspection (2 @font-face blocks, latin +
    # latin-ext, both `src: url(data:font/woff2;base64,...)`).
    fn_i = theo_brand.index('function inject() {')
    content_i = theo_brand.index('s.textContent =', fn_i) + len('s.textContent =')
    content_j = theo_brand.index('document.head.appendChild(s);', content_i)
    brand_css = concat_quoted_segments(theo_brand[content_i:content_j])

    # ---- Notification-bell CSS ----------------------------------------------
    # app-shell.js's NTF_CSS -- styles the .ntfbtn/.ntfbadge bell button that
    # ships as part of the authentic TOPBAR markup above.
    i = app_shell.index('var NTF_CSS =\n') + len('var NTF_CSS =\n')
    end_marker = "'.ntfscrim{position:fixed;inset:0;z-index:89}'"
    j = app_shell.index(end_marker, i) + len(end_marker)
    ntf_css = concat_quoted_segments(app_shell[i:j])

    # ---- Footer bar CSS ------------------------------------------------------
    # theo-brand.js's nav-enhancer injectCss() ships `.theo-foot` (the pinned,
    # fixed-height app-wide footer bar) inside the same array as its LEFT RAIL
    # dino-mascot rules and a `body:has(.theo-foot) .app{...}` scroll rule --
    # both rail-only concerns this standalone dashboard doesn't have (see the
    # SCOPE NOTE at the top of this file). Only the `.theo-foot*` rules are kept.
    fn_i = theo_brand.index('function injectCss() {')
    arr_end = theo_brand.index("].join('');", fn_i)
    css_array_src = theo_brand[fn_i:arr_end]
    all_segments = [ast.literal_eval(m.group(0)) for m in QUOTED_RE.finditer(css_array_src)]
    foot_css = ''.join(s for s in all_segments if s.startswith('.theo-foot'))

    # ---- Sleeping-dino mascot ------------------------------------------------
    # startWalk(): the small, always-sleeping dino parked just right of the
    # "Theo" wordmark, taken verbatim (brace-matched, not retyped). It already
    # supports a window.THEO_DINO_POSTER override for the poster image (falling
    # back to a relative asset path otherwise), so the real poster PNG is
    # swapped in as a base64 data URI through that existing hook -- no edits to
    # the function body itself.
    start_walk_js = extract_brace_block(theo_brand, 'startWalk')
    dino_poster_uri = data_uri(DINO_POSTER_PNG, 'image/png')

    return {
        'topbar_html': topbar_html,
        'footer_html': footer_html,
        'brand_css': brand_css,
        'ntf_css': ntf_css,
        'foot_css': foot_css,
        'start_walk_js': start_walk_js,
        'dino_poster_uri': dino_poster_uri,
    }


def read_raw(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def safe_for_script_tag(text):
    """Prevent any inlined text containing the literal sequence </script> from
    closing the surrounding <script> tag. Byte-for-byte identical otherwise."""
    return text.replace('</script>', '<\\/script>')


def build(out_path):
    css_blocks = []
    for p in CSS_FILES_IN_ORDER:
        css_blocks.append(read_raw(p))

    js_blocks = []
    for p in JS_FILES_IN_ORDER:
        js_blocks.append(safe_for_script_tag(read_raw(p)))

    chrome = extract_chrome()

    # Content-column gutters: the platform's own standalone-dashboard recipe,
    # verbatim from supplier-landscape.html's own <style> block (`.sa-main{
    # padding:28px 40px 70px;max-width:1320px;margin:0 auto}` + its <760px
    # override). The 70px bottom padding is the platform's own clearance for
    # the fixed 32px .theo-foot bar below -- not a number invented here.
    gutter_css = (
        '.sa-main{padding:28px 40px 70px;max-width:1320px;margin:0 auto}'
        '@media(max-width:760px){.sa-main{padding:22px 16px 60px}}'
    )

    # pv.css (inlined above) sets html,body{overflow:hidden} -- correct for the
    # live multi-pane project-view app, where each pane (.thread/.tabbody)
    # scrolls internally and the outer page never does. This build has no side
    # rail/pane split, so the OUTER page must scroll instead. Overridden last so
    # it wins the cascade; nothing else about pv.css/app-shell.css changes.
    scroll_css = 'html,body{height:auto!important;overflow:auto!important}'

    chrome_css = (
        chrome['ntf_css'] + chrome['brand_css'] + chrome['foot_css']
        + gutter_css + scroll_css
    )

    # No-op stubs for the topbar/footer's decorative onclick handlers. Their
    # real subsystems (tasks-drawer.js, theo-help.js, LillyAPI role-switching)
    # aren't part of this single-dashboard build, so without a stub, clicking
    # the bell / Tasks / "View as" / Help Center would throw a bare
    # ReferenceError. Defined only if not already provided.
    chrome_stub_js = (
        "window.ntfToggle=window.ntfToggle||function(){};"
        "window.mqOpen=window.mqOpen||function(){};"
        "window.mqClose=window.mqClose||function(){};"
        "window.cycleView=window.cycleView||function(){};"
        "window.theoHelpOpen=window.theoHelpOpen||function(){};"
    )

    dino_js = (
        "window.THEO_DINO_POSTER='" + chrome['dino_poster_uri'] + "';"
        + chrome['start_walk_js']
        + "(function(){if(document.readyState==='loading'){"
        "document.addEventListener('DOMContentLoaded',startWalk);}else{startWalk();}})();"
    )

    parts = []
    parts.append('<!doctype html><html lang="en"><head><meta charset="utf-8">')
    parts.append('<meta name="viewport" content="width=device-width,initial-scale=1">')
    parts.append('<title>Supplier Landscape - Cloud Data Warehouse (Platform)</title>')
    for css in css_blocks:
        parts.append('<style>' + css + '</style>')
    parts.append('<style>' + chrome_css + '</style>')
    parts.append('</head><body>')
    parts.append(chrome['topbar_html'])
    parts.append('<main class="sa-main"><div id="tabbody"></div></main>')
    for js in js_blocks:
        parts.append('<script>' + js + '</script>')
    parts.append('<script>' + safe_for_script_tag(chrome_stub_js) + '</script>')
    parts.append('<script>' + safe_for_script_tag(dino_js) + '</script>')
    parts.append('<script>' + BOOT_SCRIPT + '</script>')
    parts.append(chrome['footer_html'])
    parts.append('</body></html>')

    html = ''.join(parts)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)

    size = os.path.getsize(out_path)
    print('wrote {} ({} bytes, {:.2f} MB)'.format(out_path, size, size / (1024 * 1024)))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(BUILD_DIR, 'supplier-landscape-PLATFORM.html'))
    args = ap.parse_args()
    build(args.out)
