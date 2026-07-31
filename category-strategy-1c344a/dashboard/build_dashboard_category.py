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
ASSETS = os.path.join(BUILD_DIR, 'assets')
# Vendored copy, not a repo-root reference (A4, 2026-07-29): an installed skill has no
# repo root to reach across, so the platform chrome builder is carried inside this skill's
# own dashboard/ tree, same as deal-tab-1c344a/dashboard/_platform_build/.
PLATFORM = os.path.join(BUILD_DIR, '_platform_build')
sys.path.insert(0, PLATFORM)

import build_dashboard as bd  # noqa: E402  (the Landscape build; source of platform chrome)


def read(path):
    with io.open(path, encoding='utf-8') as f:
        return f.read()


def safe_for_script(text):
    """Never let a literal </script> inside data terminate the tag early."""
    return text.replace('</script>', '<\\/script>')


class StubDataError(RuntimeError):
    """Raised when a non-demo build would ship stub-flagged data unlabeled.

    The shipped assets/seed/category-data.js is the platform page's own DEMO
    data (see its own leading comment), carrying `"stub":true` on every
    citation. cs-render.js never reads that flag, so a build made from an
    un-replaced seed looks identical to one built from real, live-sourced
    data: same "ARIA S2P, PO Product pull" citation styling, no visible
    marker. Refusing here is the backstop for the case where the seed was
    not actually replaced with real gathered data before building, per the
    same no-fabrication discipline the rest of the suite enforces with
    ReconciliationError-style gates.
    """


def build(out_path, demo=False, allow_stub=False):
    seed = read(os.path.join(ASSETS, 'seed', 'category-data.js'))
    # Externally sourced market research. Real and cited, so it loads in BOTH builds.
    seed += '\n' + read(os.path.join(ASSETS, 'seed', 'category-market-intel.js'))
    # Market structure per consumption unit. Market data, not Lilly data.
    seed += '\n' + read(os.path.join(ASSETS, 'seed', 'category-line-items.js'))
    if not demo and not allow_stub and '"stub":true' in seed:
        raise StubDataError(
            "assets/seed/category-data.js still carries stub:true citations (the "
            "shipped platform-page demo data). This is a non-demo build, so it must "
            "be built from a fully replaced data object with real, gathered figures, "
            "not the shipped demo seed. Author category-data.js fresh from real ARIA/ "
            "SharePoint/web-research data per this skill's workflow, then rebuild. "
            "(Maintainer reference builds that intentionally reproduce the shipped "
            "demo content pass allow_stub=True / --allow-stub.)")
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


def _self_test():
    """Verify the stub-data refusal gate actually fires, and that the two
    legitimate paths around it (demo build; explicit maintainer override)
    still succeed. Uses the real shipped seed files, no fixtures."""
    import tempfile
    passed = failed = 0

    def check(label, cond):
        nonlocal passed, failed
        if cond:
            passed += 1
            print('[PASS]', label)
        else:
            failed += 1
            print('[FAIL]', label)

    tmp = tempfile.mkdtemp(prefix='cs_build_selftest_')
    non_demo_out = os.path.join(tmp, 'out.html')
    demo_out = os.path.join(tmp, 'out-demo.html')

    raised = False
    try:
        build(non_demo_out, demo=False)
    except StubDataError:
        raised = True
    check('non-demo build with un-replaced stub seed raises StubDataError', raised)
    check('non-demo build did not write a file when it raised',
          not os.path.exists(non_demo_out))

    ok = False
    try:
        n = build(non_demo_out, demo=False, allow_stub=True)
        ok = n > 0 and os.path.exists(non_demo_out)
    except StubDataError:
        ok = False
    check('non-demo build with allow_stub=True succeeds (maintainer override)', ok)

    ok = False
    try:
        n = build(demo_out, demo=True)
        ok = n > 0 and os.path.exists(demo_out)
    except StubDataError:
        ok = False
    check('demo build succeeds without needing allow_stub (stub data is expected there)', ok)

    print()
    print('SUMMARY: {}/{} passed, {}/{} failed'.format(
        passed, passed + failed, failed, passed + failed))
    return failed == 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=None)
    ap.add_argument('--demo', action='store_true',
                    help='Software only, every panel populated with illustrative data.')
    ap.add_argument('--allow-stub', action='store_true',
                    help='Maintainer override: build a non-demo artifact even though '
                         'the seed still carries stub:true citations. Never pass this '
                         'when building from real gathered data.')
    ap.add_argument('--self-test', action='store_true')
    args = ap.parse_args()
    if args.self_test or len(sys.argv) == 1:
        # No args at all -> self-test, matching this suite's convention (e.g.
        # rfp_analysis_report_generator.py: "no args -> also runs the self-test").
        # A bare build here would now hit StubDataError against the shipped seed.
        sys.exit(0 if _self_test() else 1)
    out = args.out or os.path.join(
        BUILD_DIR, 'category-strategy-dashboard-DEMO.html' if args.demo
        else 'category-strategy-dashboard.html')
    n = build(out, demo=args.demo, allow_stub=args.allow_stub)
    print('wrote {} ({} bytes, {:.2f} MB){}'.format(
        out, n, n / 1048576.0, ' [ILLUSTRATIVE DATA]' if args.demo else ''))
