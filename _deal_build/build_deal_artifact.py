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
import argparse
import os
import re
import sys

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
PARTS = os.path.join(BUILD_DIR, '_parts')
sys.path.insert(0, os.path.join(BUILD_DIR, '..', '_platform_build'))
import build_dashboard as bd  # noqa: E402  (the Landscape build; source of the platform chrome)

JS_ORDER = [
    'helpers.js', 'data.js', 'zopa.js',
    'tab-brief.js', 'tab-contract.js', 'tab-commercials.js', 'tab-negotiation.js',
    'shell.js',
]  # zopa.js (shared window.DealZopa.render) must load before any tab builder so it
# exists at mount; tab-sources.js intentionally NOT inlined (Sources & Gaps folds
# into Overview + Economics).


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
        '<div class="role">'
        '<div class="who"><div class="av" id="av">' + user_icon + '</div>'
        '<div><div class="nm" id="rname">Procurement User</div></div></div>'
        '</div></div>')
    return chrome_css, topbar, chrome['footer_html']


def build(out_path):
    missing = [n for n in JS_ORDER if not os.path.exists(os.path.join(PARTS, n))]
    if missing:
        raise SystemExit('Missing required _parts files: ' + ', '.join(missing))

    deal_style = read(os.path.join(PARTS, 'style.css'))
    chrome_css, topbar, footer = platform_chrome()
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
