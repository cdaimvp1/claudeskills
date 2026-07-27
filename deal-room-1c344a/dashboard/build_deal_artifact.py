#!/usr/bin/env python3
"""Assemble the self-contained 4-tab Deal dashboard artifact from _parts/, wrapped in
the AUTHENTIC platform chrome (dark Lilly/Theo/dino topbar + gray eyebrow/h1 title +
Help-Center footer + content gutters + platform token/font layer) so it matches the
locked Landscape dashboard EXACTLY. Reuses build_dashboard.extract_chrome().

The LLM authors ONLY `_parts/data.js`; every other part is static render code. Load
order: helpers.js (primitives + DealUI) -> data.js -> the 4 tab builders (attach to
window.DealTabs) -> shell.js (builds the 4-tab skeleton inside #app, injects builders,
inits DealUI). The platform topbar + footer sit OUTSIDE #app so shell.js's innerHTML
never wipes them. CSS order: the Deal's component style.css FIRST, then the platform
chrome families LAST so theo-color tokens + the .topbar/.theomark/.sa-title/.theo-foot
families win (identical to Landscape).

Security note: OFFLINE artifact, no runtime user input; all data authored at build time
and every rendered value passes through esc(); the innerHTML render pattern is safe.
"""

# ============================================================================
# THE Deal dashboard builder (single build path, collapsed 2026-07-27).
# Content + logic come from _parts/*.js (see JS_ORDER); chrome from
# _platform_build/. `dashboard/assets/**` is a dev-serving copy of the platform
# app and is NOT read here, so editing it alone changes nothing in the output.
# The old mirrors under _deal_build/ are retired -- see _deal_build/SOURCE-OF-TRUTH.md.
# ============================================================================

import argparse
import os
import re
import sys

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
PARTS = os.path.join(BUILD_DIR, '_parts')
sys.path.insert(0, os.path.join(BUILD_DIR, '_platform_build'))
import build_dashboard as bd  # noqa: E402  (the Landscape build; source of the platform chrome)

JS_ORDER = [
    'helpers.js', 'data.js', 'zopa.js',
    'tab-brief.js', 'tab-contract.js', 'tab-commercials.js', 'tab-negotiation.js',
    'shell.js',
]  # zopa.js (shared window.DealZopa.render) must load before any tab builder so it
# exists at mount; tab-sources.js intentionally NOT inlined (Sources & Gaps folds
# into Overview + Economics).



# ---------------------------------------------------------------------------
# D9 (Marc 2026-07-27): CSS weight reduction, applied at BUILD time only.
# fonts-inline.css / theo-color.css / app-shell.css are SHARED platform assets
# (the Landscape build reads the same files), so they are not edited on disk.
# This trims them as they are composed into the Deal artifact:
#   * @font-face families the Deal dashboard never references (Newsreader,
#     Sacramento) are dropped whole;
#   * weights outside the set the Deal sources actually use are dropped, with
#     400 kept as the browser's fallback weight and every italic face kept
#     (the dashboard does use italics);
#   * html[data-theme="dark"] blocks are dropped, since the artifact stamps
#     <html data-theme="light"> and ships no toggle, so they can never match.
# Everything dropped is inert for THIS artifact; nothing else is touched.
# ---------------------------------------------------------------------------
# Sacramento is the THEO WORDMARK face (.theomark .twm in theo-brand.js). It was dropped in the
# first D9 pass because the reference scan covered _parts + the platform CSS files but NOT
# theo-brand.js, which carries the chrome CSS. That regressed the header wordmark to a generic
# cursive. Keep-list is now derived against the chrome too; do not trim a family without
# grepping theo-brand.js.
FONT_FAMILIES_USED = ("Libre Franklin", "Roboto Mono", "Sacramento")
FONT_WEIGHTS_USED = {400, 500, 600, 700, 800}

_FACE_RE = re.compile(r"@font-face\s*\{[^}]*\}", re.S)


def trim_fonts(css):
    kept, dropped_family, dropped_weight = [], 0, 0
    pos, out = 0, []
    for m in _FACE_RE.finditer(css):
        out.append(css[pos:m.start()]); pos = m.end()
        block = m.group(0)
        fam = re.search(r"font-family:\s*'([^']+)'", block)
        wt = re.search(r"font-weight:\s*(\d{3})", block)
        italic = "font-style: italic" in block or "font-style:italic" in block
        if fam and fam.group(1) not in FONT_FAMILIES_USED:
            dropped_family += 1; continue
        if wt and int(wt.group(1)) not in FONT_WEIGHTS_USED and not italic:
            dropped_weight += 1; continue
        kept.append(block); out.append(block)
    out.append(css[pos:])
    print('  D9 fonts: kept {} faces, dropped {} (unused family) + {} (unused weight)'.format(
        len(kept), dropped_family, dropped_weight))
    return ''.join(out)


def drop_dark_blocks(css):
    """Remove html[data-theme="dark"]{...} rules: unreachable in a light-stamped artifact."""
    out, i, n = [], 0, 0
    while True:
        j = css.find('html[data-theme="dark"]', i)
        if j == -1:
            out.append(css[i:]); break
        out.append(css[i:j])
        k = css.find('{', j)
        if k == -1:
            out.append(css[j:]); break
        depth, m = 1, k + 1
        while m < len(css) and depth:
            if css[m] == '{': depth += 1
            elif css[m] == '}': depth -= 1
            m += 1
        i = m; n += 1
    print('  D9 dark: dropped {} html[data-theme="dark"] block(s)'.format(n))
    return ''.join(out)

def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def inline_js(name):
    return read(os.path.join(PARTS, name)).replace('</script>', '<\\/script>')


def deal_title():
    try:
        src = read(os.path.join(PARTS, 'data.js'))
    except OSError:
        return 'Deal Dashboard'
    m = re.search(r'\btitle\s*:\s*([\'"])(?P<t>(?:\\.|[^\\])*?)\1', src)
    return (m.group('t') if m else 'Deal Dashboard')


def platform_chrome():
    """Return (chrome_css, topbar_html, footer_html) grafted from the platform, identical to
    the Landscape build's chrome (see _platform_build/apply_deal_chrome.py)."""
    chrome = bd.extract_chrome()
    dino_uri = bd.data_uri(bd.DINO_MARK_PNG, 'image/png')
    theo_color = bd.read_raw(os.path.join(bd.ASSETS, 'theo-color.css'))
    app_shell = bd.read_raw(os.path.join(bd.ASSETS, 'app-shell.css'))
    fonts = bd.read_raw(os.path.join(bd.ASSETS, 'fonts-inline.css'))

    tdino_css = '.theomark .tdino{height:26px;width:auto;display:block;object-fit:contain;filter:var(--dino-filter)}'
    title_css = ('.sa-title{margin:0 0 22px}'
        '.sa-title .eyebrow{font:700 11px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:0 0 6px}'
        '.sa-title h1{font-family:var(--sans);font-size:28px;font-weight:800;letter-spacing:-.01em;line-height:1.2;color:var(--ink);margin:0}'
        '.sa-title .dh-sub{font-size:13px;color:var(--mut);margin-top:8px}')
    gutter_css = ('.sa-main{padding:28px 40px 70px;max-width:1320px;margin:0 auto}'
        '@media(max-width:760px){.sa-main{padding:22px 16px 60px}}'
        # D1 (Marc 2026-07-27): the fixed 32px .theo-foot bar was OVERLAYING the last rows of Deal
        # content. The platform reserves that clearance with .sa-main's 70px bottom padding, but the
        # Deal artifact renders into #app, not .sa-main, so nothing reserved it here. Same recipe,
        # applied to the container this dashboard actually uses (NOT theo-brand's body:has(.theo-foot)
        # rail rule, which this build deliberately excludes -- see the Footer bar CSS note in
        # _platform_build/build_dashboard.py).
        '#app{padding-bottom:70px}'
        '@media(max-width:760px){#app{padding-bottom:60px}}'
        # the sticky strip/tabbar must clear the 56px sticky topbar (not top:0,
        # which would stack it ON the topbar and float both mid-page in a
        # full-page screen capture)
        '.sticky-head{top:56px}')
    chrome_css = theo_color + fonts + app_shell + chrome['brand_css'] + chrome['foot_css'] + tdino_css + title_css + gutter_css

    user_icon = ('<svg class="avicon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
        '<path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')
    topbar = ('<div class="topbar">'
        '<div class="brand"><img src="' + chrome['lilly_logo_uri'] + '" alt="Lilly"/>'
        '<span class="theomark"><span class="twm">Theo</span>'
        '<img class="tdino" src="' + dino_uri + '" alt="" aria-hidden="true"></span></div>'
        '</div>')
    return chrome_css, topbar, chrome['footer_html']


def build(out_path):
    missing = [n for n in JS_ORDER if not os.path.exists(os.path.join(PARTS, n))]
    if missing:
        raise SystemExit('Missing required _parts files: ' + ', '.join(missing))

    deal_style = read(os.path.join(PARTS, 'style.css'))
    chrome_css, topbar, footer = platform_chrome()
    chrome_css = drop_dark_blocks(trim_fonts(chrome_css))   # D9
    # Deal component CSS first; platform chrome families + tokens LAST so they win (matches Landscape).
    css = deal_style + '\n' + chrome_css

    scripts = '\n'.join('<script>\n' + inline_js(n) + '\n</script>' for n in JS_ORDER)
    title = deal_title()

    html = (
        # data-theme="light" MUST be stamped: the Deal's style.css has a
        # @media(prefers-color-scheme:dark) :root:not([data-theme]) block that
        # would flip the whole dashboard to dark on a dark-preferring browser.
        # Stamping light neutralizes it + every html[data-theme=dark] override,
        # so the page + topbar render light, byte-matching the Landscape build.
        '<!doctype html>\n<html lang="en" data-theme="light">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>' + title.replace('<', '&lt;') + '</title>\n'
        '<style>\n' + css + '\n</style>\n'
        '</head>\n<body>\n'
        + topbar + '\n'
        '<div id="app"></div>\n'
        + footer + '\n'
        + scripts +
        '\n</body>\n</html>\n'
    )
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    return len(html)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(BUILD_DIR, 'deal-dashboard-v2.html'))
    args = ap.parse_args()
    n = build(args.out)
    print('wrote {} ({} bytes, {:.2f} MB)'.format(args.out, n, n / 1048576.0))
