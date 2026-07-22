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
"""
import argparse
import os

BUILD_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BUILD_DIR, 'assets')

CSS_FILES_IN_ORDER = [
    os.path.join(ASSETS, 'fonts-inline.css'),
    os.path.join(ASSETS, 'app-shell.css'),
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

    parts = []
    parts.append('<!doctype html><html lang="en"><head><meta charset="utf-8">')
    parts.append('<meta name="viewport" content="width=device-width,initial-scale=1">')
    parts.append('<title>Supplier Landscape - Cloud Data Warehouse (Platform)</title>')
    for css in css_blocks:
        parts.append('<style>' + css + '</style>')
    parts.append('</head><body>')
    parts.append('<div id="tabbody"></div>')
    for js in js_blocks:
        parts.append('<script>' + js + '</script>')
    parts.append('<script>' + BOOT_SCRIPT + '</script>')
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
