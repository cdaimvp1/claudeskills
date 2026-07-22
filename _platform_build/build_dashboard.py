#!/usr/bin/env python3
"""Assemble a self-contained supplier-landscape dashboard HTML file by bundling the
platform's own render code (pv-01 boot helpers + pv-07 landscape render) and its own
deep "Cloud Data Warehouse" (nimbus) project data, wrapped in a clean, minimal slice
of the platform's own chrome (topbar + footer). No hand-written CSS: every color,
font, and spacing rule comes from the platform's own inlined stylesheets/tokens. The
only hand-composed HTML is the reduced topbar cluster and the body title block below
(both assembled purely from authentic CSS classes/tokens the build already inlines --
see PAGE CHROME NOTE and BODY TITLE NOTE); everything else is mechanical
concatenation, save the literal "</script>" escaping required so inlined JS can't
break out of a <script> tag.

CSS ORDER NOTE: the real project-view.html links pv.css BEFORE theo-color.css, and
theo-color.css documents itself as "the AUTHORITATIVE color + shading token layer...
every page links this (after its own base stylesheet)". pv.css also carries its own
:root token block (a legacy/standalone fallback). To render IDENTICALLY to the real
page, theo-color.css's tokens must win the cascade, so it is inlined LAST: fonts,
then app-shell.css (unused there, harmless), then pv.css, then theo-color.css.

PAGE CHROME NOTE (topbar / footer / content gutters): the platform's own page chrome
is largely JS-generated at runtime (assets/app-shell.js injects the red topbar +
notification bell + tasks button + "View as" switcher; assets/theo-brand.js injects
the "theomark" Theo wordmark + a sleeping-dino mascot + the app-wide footer). This
single-dashboard build wants a much lighter topbar (logo + wordmark + a static dino
mark on the left, just the user's name/avatar on the right -- no bell, no tasks, no
role switcher, no walking/sleeping mascot), so extract_chrome() below mechanically
scans VERBATIM copies of app-shell.js/theo-brand.js (same string-literal-
concatenation technique the files themselves use, decoded with ast.literal_eval) for
only the fragments that reduced topbar still needs: the Lilly logo (already embedded
in app-shell.js as a tight-cropped base64 PNG -- verified via PIL, no re-cropping
needed), the theomark/Sacramento CSS (which also carries the authentic
--dino-filter token, reused below for the new dino mark), and the footer html + its
CSS. build() then hand-assembles the reduced topbar markup from those authentic
pieces plus the build-time --user value -- there is no "full" TOPBAR to extract from
and strip down to, so composing the smaller markup directly is more honest than
extracting the bell/tasks/switch-laden original and deleting pieces out of it.

BODY TITLE NOTE: the platform's per-page hero title (eyebrow + <h1>) is normally
rendered by each page's own view code, not by app-shell.js/theo-brand.js, so there is
no chrome fragment to extract for it. build() renders it directly in the platform's
own Libre Franklin family (var(--sans)) and ink/mut color tokens (both already
inlined via theo-color.css), using only a new --subject value for the actual text --
never fabricated, see default_search_subject().

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
import html
import json
import os
import re

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BUILD_DIR, 'assets')

CSS_FILES_IN_ORDER = [
    os.path.join(ASSETS, 'fonts-inline.css'),
    os.path.join(ASSETS, 'app-shell.css'),
    # NOTE: tasks-drawer.css (the Tasks button + drawer panel) is deliberately
    # NOT inlined -- the reduced topbar built below has no Tasks button, so
    # every rule in that file would be dead weight.
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
LANDSCAPE_DATA_JS = os.path.join(ASSETS, 'landscape-data.js')

# Marc's line-art T-rex mark: a plain, static PNG (no walk/sleep animation, no
# poster-swap plumbing), staged locally by copying it once from the read-only
# platform dir (assets/theo-dino-mark.png there too) -- same staging pattern as
# every other asset already sitting under this build's own assets/ folder.
DINO_MARK_PNG = os.path.join(ASSETS, 'theo-dino-mark.png')

# Matches a single JS string literal, either quote style, with escapes intact.
QUOTED_RE = re.compile(r"'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"", re.S)

# The body title block's small muted eyebrow line (see BODY TITLE NOTE above).
SEARCH_EYEBROW = 'Supplier Landscape Search'


def concat_quoted_segments(slice_text):
    """Concatenate every quoted JS string literal found in slice_text, in order.
    ast.literal_eval decodes the same escape grammar JS uses for these plain
    literals (\\', \\", \\\\, \\uXXXX), so this is a faithful decode of the
    source's actual string content, not a hand transcription of it."""
    return ''.join(ast.literal_eval(m.group(0)) for m in QUOTED_RE.finditer(slice_text))


def default_search_subject():
    """Read the REAL search subject straight out of the shipped project data
    (assets/landscape-data.js: `PROJECTS['<key>']={...JSON...}; CURPROJ='<key>';`,
    where the JSON is exactly the project object extract_landscape_data.cjs pulled
    out of the platform's own PROJECTS table) rather than hardcoding one. Uses a
    real JSON parse (json.JSONDecoder.raw_decode), not a hand-rolled regex over the
    object body, so it can't be tripped up by braces/quotes nested inside the data.
    Prefers a `category` field (a cleaner label) over `title` only when the data
    actually has a non-empty one; otherwise falls back to `title` verbatim. Never
    fabricates a subject -- raises if the data has neither."""
    src = read_raw(LANDSCAPE_DATA_JS)
    m = re.search(r"PROJECTS\[(['\"])(?P<key>[^'\"]+)\1\]\s*=\s*", src)
    if not m:
        raise RuntimeError('landscape-data.js: no PROJECTS[...]= assignment found')
    project, _end = json.JSONDecoder().raw_decode(src, m.end())
    category = project.get('category')
    category = category.strip() if isinstance(category, str) else ''
    title = project.get('title')
    title = title.strip() if isinstance(title, str) else ''
    subject = category or title
    if not subject:
        raise RuntimeError('landscape-data.js: project has neither a usable title nor category')
    return subject


def initials_for(name):
    """First+last initials for a topbar avatar (e.g. 'Procurement User' -> 'PU'),
    matching the platform's own two-letter avatar convention."""
    parts = [p for p in re.split(r'\s+', name.strip()) if p]
    if not parts:
        return ''
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def data_uri(path, mime):
    with open(path, 'rb') as f:
        raw = f.read()
    return 'data:' + mime + ';base64,' + base64.b64encode(raw).decode('ascii')


def extract_chrome():
    """Pull only the authentic fragments the reduced topbar/footer still need
    (see PAGE CHROME NOTE at the top of this file). build() hand-assembles the
    actual reduced topbar markup from these -- there is no bell/tasks/switch-
    laden "full" TOPBAR extracted here to strip pieces out of."""
    app_shell = read_raw(APP_SHELL_JS)
    theo_brand = read_raw(THEO_BRAND_JS)

    # ---- Lilly logo -------------------------------------------------------
    # The exact base64 PNG every real page's `.brand img` uses (byte-identical
    # across project-view.html, my-work.html, and app-shell.js's own TOPBAR).
    # Verified via PIL: alpha-channel bbox spans the full 120x65 canvas edge to
    # edge, i.e. it is already a tight crop -- no re-cropping needed.
    m = re.search(r"LILLY_LOGO\s*=\s*'data:image/png;base64,([^']+)'", app_shell)
    lilly_logo_uri = 'data:image/png;base64,' + m.group(1)

    # ---- Footer -------------------------------------------------------------
    # theo-brand.js's injectFooter(): `f.innerHTML = '...' + ... ;` (the
    # "Help Center / Procurement Playbook / Give feedback / What's new" bar).
    i = theo_brand.index('f.innerHTML =')
    j = theo_brand.index('document.body.appendChild(f); return true;', i)
    footer_inner_html = concat_quoted_segments(theo_brand[i:j])
    footer_html = '<footer class="theo-foot" role="contentinfo">' + footer_inner_html + '</footer>'

    # ---- theomark / Sacramento-wordmark CSS (+ the --dino-filter token) ----
    # theo-brand.js's inject(): the :root chrome tokens (incl. --dino-filter,
    # the theme-aware recolour recipe used by every dino mark on the platform:
    # brightness(0) in light mode, brightness(0) invert(.92) in dark mode) +
    # .theomark/.twm rules + the sleeping-dino Zzz keyframes (inert here, no
    # element uses them once the mascot is gone -- harmless). NOTE: this CSS
    # block also injects a <link> to Google Fonts for Sacramento at runtime;
    # that is NOT reproduced here (would be this build's only network call)
    # because Sacramento is already self-hosted as a base64 woff2 @font-face
    # in fonts-inline.css, inlined above -- confirmed by inspection (2
    # @font-face blocks, latin + latin-ext, both `src: url(data:font/woff2;
    # base64,...)`).
    fn_i = theo_brand.index('function inject() {')
    content_i = theo_brand.index('s.textContent =', fn_i) + len('s.textContent =')
    content_j = theo_brand.index('document.head.appendChild(s);', content_i)
    brand_css = concat_quoted_segments(theo_brand[content_i:content_j])
    # Three rules in that block target the bell (.ntfbtn) / tasks button
    # (.mqbtn) this reduced topbar no longer has -- drop them, they'd be dead
    # weight with no matching element.
    for dead_rule in (
        '.topbar .mqbtn,.topbar .mqbtn .lbl,.topbar .mqbadge{color:var(--topbar-fg)!important}',
        '.topbar .ntfbtn{color:var(--topbar-fg)!important}'
        '.topbar .ntfbtn:hover{background:var(--topbar-ctrl-hover)!important}',
        '.topbar .role .mqbtn .lbl{display:none!important}',
    ):
        assert dead_rule in brand_css, 'expected dead rule not found: ' + dead_rule
        brand_css = brand_css.replace(dead_rule, '', 1)

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

    return {
        'lilly_logo_uri': lilly_logo_uri,
        'footer_html': footer_html,
        'brand_css': brand_css,
        'foot_css': foot_css,
    }


def read_raw(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def safe_for_script_tag(text):
    """Prevent any inlined text containing the literal sequence </script> from
    closing the surrounding <script> tag. Byte-for-byte identical otherwise."""
    return text.replace('</script>', '<\\/script>')


def build(out_path, user_name='Procurement User', search_subject=None):
    if search_subject is None:
        search_subject = default_search_subject()

    css_blocks = []
    for p in CSS_FILES_IN_ORDER:
        css_blocks.append(read_raw(p))

    js_blocks = []
    for p in JS_FILES_IN_ORDER:
        js_blocks.append(safe_for_script_tag(read_raw(p)))

    chrome = extract_chrome()
    dino_mark_uri = data_uri(DINO_MARK_PNG, 'image/png')

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

    # New static dino mark, parked immediately right of the "Theo" wordmark
    # inside .theomark's own flex row (so it inherits that row's existing 7px
    # gap/baseline alignment for free). Sized to the wordmark's own height per
    # spec. Recoloured with the platform's own --dino-filter token (already
    # part of brand_css's :root block above) rather than a new colour recipe --
    # black in light mode, near-white in dark mode, same as every other themed
    # dino mark on the platform.
    tdino_css = (
        '.theomark .tdino{height:26px;width:auto;display:block;'
        'object-fit:contain;filter:var(--dino-filter)}'
    )

    # Body title block (eyebrow + <h1>), first child of .sa-main. Same
    # Libre Franklin family (var(--sans)) and ink/mut color tokens as the rest
    # of the platform; no new fonts or colors introduced.
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

    # No-op stub for the footer's Help Center link -- its real subsystem
    # (theo-help.js) isn't part of this single-dashboard build. The bell /
    # Tasks / "View as" handlers no longer exist to stub: those buttons are
    # gone from the topbar entirely.
    chrome_stub_js = "window.theoHelpOpen=window.theoHelpOpen||function(){};"

    safe_user_name = html.escape((user_name or '').strip() or 'Procurement User')
    safe_initials = html.escape(initials_for((user_name or '').strip() or 'Procurement User'))
    safe_subject = html.escape((search_subject or '').strip())
    safe_eyebrow = html.escape(SEARCH_EYEBROW)

    # Clean, minimal topbar: LEFT = Lilly logo + Sacramento "Theo" wordmark +
    # static dino mark. RIGHT = just the signed-in user's name/avatar -- no
    # bell, no tasks button, no "View as" switcher.
    topbar_html = (
        '<div class="topbar">'
        '<div class="brand">'
        '<img src="' + chrome['lilly_logo_uri'] + '" alt="Lilly"/>'
        '<span class="theomark"><span class="twm">Theo</span>'
        '<img class="tdino" src="' + dino_mark_uri + '" alt="" aria-hidden="true"></span>'
        '</div>'
        '<div class="role">'
        '<div class="who">'
        '<div class="av" id="av">' + safe_initials + '</div>'
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
    parts.append('<title>Supplier Landscape - ' + safe_subject + '</title>')
    for css in css_blocks:
        parts.append('<style>' + css + '</style>')
    parts.append('<style>' + chrome_css + '</style>')
    parts.append('</head><body>')
    parts.append(topbar_html)
    parts.append('<main class="sa-main">' + title_html + '<div id="tabbody"></div></main>')
    for js in js_blocks:
        parts.append('<script>' + js + '</script>')
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
    ap.add_argument('--out', default=os.path.join(BUILD_DIR, 'supplier-landscape-PLATFORM.html'))
    ap.add_argument(
        '--user', default='Procurement User',
        help="Rendered as the topbar's user name (and its avatar initials). "
             "The calling skill injects the real signed-in user's name here."
    )
    ap.add_argument(
        '--subject', default=None,
        help="Body-title <h1>: what this supplier-landscape search is for. "
             "Defaults to the real project's title/category read out of "
             "assets/landscape-data.js (never fabricated) -- see "
             "default_search_subject()."
    )
    args = ap.parse_args()
    build(args.out, user_name=args.user,
          search_subject=args.subject if args.subject else None)
