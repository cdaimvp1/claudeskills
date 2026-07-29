# SUPERSEDED 2026-07-27: one-off chrome graft against the retired _deal_build artifact.
# The Deal dashboard is built by deal-room-1c344a/dashboard/build_deal_artifact.py, which
# grafts the chrome itself. Kept for reference only; the DEAL path below no longer exists.
"""Graft the platform's authentic page chrome (dark Lilly/Theo topbar + gray eyebrow/h1
title block + Help-Center footer + content gutters) onto the self-contained Deal dashboard,
so it matches the landscape dashboard exactly. Reuses build_dashboard.extract_chrome()."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_dashboard as bd

ASSETS = bd.ASSETS
DEAL = r'C:\Users\marcs\Downloads\skills update july 2026\skills update july 2026\_deal_build\deal-dashboard.html'

chrome = bd.extract_chrome()
dino_uri = bd.data_uri(bd.DINO_MARK_PNG, 'image/png')
theo_color = bd.read_raw(os.path.join(ASSETS, 'theo-color.css'))
app_shell = bd.read_raw(os.path.join(ASSETS, 'app-shell.css'))
fonts = bd.read_raw(os.path.join(ASSETS, 'fonts-inline.css'))

tdino_css = '.theomark .tdino{height:26px;width:auto;display:block;object-fit:contain;filter:var(--dino-filter)}'
title_css = ('.sa-title{margin:0 0 22px}'
    '.sa-title .eyebrow{font:700 11px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:0 0 6px}'
    '.sa-title h1{font-family:var(--sans);font-size:28px;font-weight:800;letter-spacing:-.01em;line-height:1.2;color:var(--ink);margin:0}')
gutter_css = ('.sa-main{padding:28px 40px 70px;max-width:1320px;margin:0 auto}'
    '@media(max-width:760px){.sa-main{padding:22px 16px 60px}}')
# The Deal keeps its own component CSS; only ADD the chrome families. theo-color first (tokens),
# fonts (Sacramento @font-face for .twm), app-shell (.topbar family), then brand/foot/title/gutter.
chrome_css = theo_color + fonts + app_shell + chrome['brand_css'] + chrome['foot_css'] + tdino_css + title_css + gutter_css

user_icon = ('<svg class="avicon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
    '<path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')
topbar = ('<div class="topbar">'
    '<div class="brand"><img src="' + chrome['lilly_logo_uri'] + '" alt="Lilly"/>'
    '<span class="theomark"><span class="twm">Theo</span>'
    '<img class="tdino" src="' + dino_uri + '" alt="" aria-hidden="true"></span></div>'
    '<div class="role">'
    '<button class="switch" data-print title="Print / export to PDF">Print</button>'
    '<button class="switch" data-theme-toggle title="Toggle light / dark">Theme</button>'
    '<div class="who"><div class="av" id="av">' + user_icon + '</div>'
    '<div><div class="nm" id="rname">Procurement User</div></div></div>'
    '</div></div>')

sa_open = ('<main class="sa-main"><div class="sa-title">'
    '<div class="eyebrow">Deal &middot; Contract Negotiation</div>'
    '<h1>Visier People Analytics: MSA + Initial SOW</h1>'
    '<div style="margin-top:8px;color:var(--mut);font-size:13px">Session snapshot &middot; Eli Lilly and Company &harr; Visier Inc. &middot; not a live record, not a system of record</div>'
    '</div>')

deal = bd.read_raw(DEAL)
orig_len = len(deal)

# 1) inject chrome CSS just before </head>
assert '</head>' in deal
deal = deal.replace('</head>', '<style>' + chrome_css + '</style></head>', 1)

# 2) replace the whole .deal-head block with the topbar + sa-main/sa-title open
new_deal = re.sub(r'<div class="deal-head">.*?</div></div>', topbar + '\n' + sa_open, deal, count=1, flags=re.S)
assert new_deal != deal, 'deal-head block not matched'
deal = new_deal

# 3) close </main> right after the last tabpanel, before the scripts
assert '<div data-tabpanel="sources"></div>' in deal
deal = deal.replace('<div data-tabpanel="sources"></div>', '<div data-tabpanel="sources"></div>\n</main>', 1)

# 4) footer before </body>
deal = deal.replace('</body>', chrome['footer_html'] + '</body>', 1)

with open(DEAL, 'w', encoding='utf-8') as f:
    f.write(deal)
print('grafted chrome: {} -> {} bytes'.format(orig_len, len(deal)))
