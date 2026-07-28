#!/usr/bin/env python3
"""Assemble the Category Strategy dashboard as ONE self-contained HTML file.

Same deterministic pattern as the Landscape / Deal / RFx builds: the model authors
only the data object (assets/seed/category-data.js); assets/pv/cs-render.js renders
it; this script wraps both in the platform's own chrome (topbar + footer + tokens +
fonts) so the artifact matches the rest of the suite.

Chrome is grafted via _platform_build/build_dashboard.py's extract_chrome(), exactly
as build_deal_artifact.py does, so there is one source of chrome for every dashboard.

Structure is 7 tabs, not the platform page's 11, per CATEGORY-STRATEGY-BUILD-SPEC.md.
"""
import argparse
import io
import os
import sys

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(BUILD_DIR)
ASSETS = os.path.join(BUILD_DIR, 'assets')
PLATFORM = os.path.join(REPO, '_platform_build')
sys.path.insert(0, PLATFORM)

import build_dashboard as bd  # noqa: E402  (the Landscape build; source of platform chrome)


def read(path):
    with io.open(path, encoding='utf-8') as f:
        return f.read()


def safe_for_script(text):
    """Never let a literal </script> inside data terminate the tag early."""
    return text.replace('</script>', '<\\/script>')


def build(out_path, demo=False):
    seed = read(os.path.join(ASSETS, 'seed', 'category-data.js'))
    if demo:
        # Narrows the seed to Software and adds the structures the real data does
        # not carry, so every panel renders populated. Clearly banner-marked.
        seed += '\n' + read(os.path.join(ASSETS, 'seed', 'category-data-demo.js'))
    render = read(os.path.join(ASSETS, 'pv', 'cs-render.js'))
    css = read(os.path.join(ASSETS, 'pv', 'cs.css'))

    chrome = bd.extract_chrome()
    fonts = bd.read_raw(os.path.join(bd.ASSETS, 'fonts-inline.css'))
    theo_color = bd.read_raw(os.path.join(bd.ASSETS, 'theo-color.css'))
    app_shell = bd.read_raw(os.path.join(bd.ASSETS, 'app-shell.css'))
    dino_uri = bd.data_uri(bd.DINO_MARK_PNG, 'image/png')

    user_icon = ('<svg class="avicon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
                 '<path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 '
                 '2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')
    topbar = ('<div class="topbar">'
              '<div class="brand"><img src="' + chrome['lilly_logo_uri'] + '" alt="Lilly"/>'
              '<span class="theomark"><span class="twm">Theo</span>'
              '<img class="tdino" src="' + dino_uri + '" alt="" aria-hidden="true"></span></div>'
              '<div class="topright">' + user_icon + '<span class="avname">Procurement User</span></div>'
              '</div>')

    tdino_css = ('.theomark .tdino{height:26px;width:auto;display:block;object-fit:contain;'
                 'filter:var(--dino-filter)}'
                 '.topright{margin-left:auto;display:flex;align-items:center;gap:8px;color:var(--topbar-fg)}'
                 '.avname{font-size:13px;font-weight:600}'
                 # #app carries the footer clearance: this artifact has no .sa-main
                 '#app{padding-bottom:70px}'
                 '@media(max-width:760px){#app{padding-bottom:60px}}')

    html = (
        # data-theme="light" is stamped: these dashboards are light-only, and it
        # neutralises any html[data-theme=dark] token block inherited from the chrome.
        '<!doctype html>\n<html lang="en" data-theme="light">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>Category Strategy' + (' (illustrative data)' if demo else '')
        + ' · Lilly Procurement</title>\n'
        '<style>\n' + fonts + '\n' + theo_color + '\n' + app_shell + '\n'
        + chrome['brand_css'] + chrome['foot_css'] + tdino_css + '\n' + css + '\n</style>\n'
        '</head>\n<body>\n'
        + topbar + '\n'
        '<div id="app"></div>\n'
        + chrome['footer_html'] + '\n'
        '<script>\n' + safe_for_script(seed) + '\n</script>\n'
        '<script>\n' + safe_for_script(render) + '\n</script>\n'
        '</body>\n</html>\n'
    )
    with io.open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    return len(html)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=None)
    ap.add_argument('--demo', action='store_true',
                    help='Software only, every panel populated with illustrative data.')
    args = ap.parse_args()
    out = args.out or os.path.join(
        BUILD_DIR, 'category-strategy-dashboard-DEMO.html' if args.demo
        else 'category-strategy-dashboard.html')
    n = build(out, demo=args.demo)
    print('wrote {} ({} bytes, {:.2f} MB){}'.format(
        out, n, n / 1048576.0, ' [ILLUSTRATIVE DATA]' if args.demo else ''))
