#!/usr/bin/env python3
"""Assemble the self-contained 4-tab Deal dashboard artifact from _parts/.

Concatenates the ground-up render layer (helpers -> data -> the 4 tab builders ->
shell) plus style.css into ONE offline, self-contained HTML file. The LLM authors
ONLY `_parts/data.js`; every other part is static render code. This mirrors the
deterministic Landscape build MECHANISM (Python concatenation of static render code
+ one authored data object -> self-contained HTML), with the ground-up `_parts/`
render layer playing the role pv-07 plays for Landscape.

Load order matters: helpers.js (primitives + DealUI) -> data.js (dashboardData) ->
tab builders (attach to window.DealTabs) -> shell.js (builds the 4-tab skeleton,
injects each builder, calls DealUI.init once). The 4 tabs keep the data-jump keys
brief/contract/commercials/negotiation; only the display labels are the redesign.

Security note: this is an OFFLINE artifact with no runtime user input; all data is
authored at build time and every rendered value passes through the esc() helper, so
the innerHTML render pattern is safe here (the documented _parts/ convention).
"""
import argparse
import os
import re

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
PARTS = os.path.join(BUILD_DIR, '_parts')

# JS inlined in this exact order.
JS_ORDER = [
    'helpers.js',        # render primitives + DealUI interaction engine
    'data.js',           # the ONE authored data object (window.dashboardData)
    'tab-brief.js',      # DealTabs.brief       -> Overview
    'tab-contract.js',   # DealTabs.contract    -> Terms & Review
    'tab-commercials.js',# DealTabs.commercials -> Economics
    'tab-negotiation.js',# DealTabs.negotiation -> Negotiation
    'shell.js',          # builds skeleton + strip + mounts + inits
]
# tab-sources.js is intentionally NOT inlined: Sources & Gaps folds into Overview + Economics.

CSS_ORDER = ['style.css']          # + fonts-inline.css if present (optional)
OPTIONAL_FONTS = ['fonts-inline.css']


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def inline_js(name):
    js = read(os.path.join(PARTS, name))
    # Neutralize any literal </script> inside the JS so it cannot close the tag early.
    return js.replace('</script>', '<\\/script>')


def deal_title():
    """Best-effort page <title> from dashboardData.deal.title; never fabricates."""
    try:
        src = read(os.path.join(PARTS, 'data.js'))
    except OSError:
        return 'Deal Dashboard'
    m = re.search(r'\btitle\s*:\s*([\'"])(?P<t>(?:\\.|[^\\])*?)\1', src)
    return (m.group('t') if m else 'Deal Dashboard')


def build(out_path):
    missing = [n for n in JS_ORDER if not os.path.exists(os.path.join(PARTS, n))]
    if missing:
        raise SystemExit('Missing required _parts files: ' + ', '.join(missing))

    css_parts = []
    for name in OPTIONAL_FONTS:
        p = os.path.join(PARTS, name)
        if os.path.exists(p):
            css_parts.append(read(p))
    for name in CSS_ORDER:
        css_parts.append(read(os.path.join(PARTS, name)))
    css = '\n'.join(css_parts)

    scripts = '\n'.join('<script>\n' + inline_js(n) + '\n</script>' for n in JS_ORDER)
    title = deal_title()

    html = (
        '<!doctype html>\n<html lang="en">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>' + title.replace('<', '&lt;') + '</title>\n'
        '<style>\n' + css + '\n</style>\n'
        '</head>\n<body>\n'
        '<div id="app"></div>\n'
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
