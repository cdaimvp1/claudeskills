# Deal dashboard: ONE build path (collapsed 2026-07-27)

**The Deal dashboard is built from `deal-room-1c344a/dashboard/`. Nothing here builds it any more.**

## Build it

```
cd deal-room-1c344a/dashboard
python build_deal_artifact.py --out deal-dashboard.html
```

Then deliver to `OneDrive\Desktop\dashboards\deal-dashboard.html`.

## What the canonical build actually reads

| Input | Path | Note |
|---|---|---|
| Content + logic | `deal-room-1c344a/dashboard/_parts/*.js` | **Edit the dashboard HERE.** 7 of the 10 files are inlined, in `JS_ORDER`; `tab-sources.js` is deliberately not inlined (Sources & Gaps folds into Overview + Economics) |
| Component CSS | `deal-room-1c344a/dashboard/_parts/style.css` | |
| Platform chrome | `deal-room-1c344a/dashboard/_platform_build/` | `build_dashboard.extract_chrome()`, the same chrome the Landscape build uses |
| Chrome assets | `deal-room-1c344a/dashboard/_platform_build/assets/` | theo-color.css, app-shell.css, fonts-inline.css, pv/* |

`deal-room-1c344a/dashboard/assets/**` is a runtime copy of the platform app (referenced by
`assets/theo-data.js` for dev serving). **No builder reads it.** It is kept in sync with label changes so the
two do not drift, but editing it alone will NOT change the built dashboard.

## Why this file exists

Before the collapse there were THREE copies of the engine and TWO builders:

- `_deal_build/_parts/` and `deal-room-1c344a/dashboard/_parts/` were byte-identical mirrors
- `_deal_build/assets/pv/` and `deal-room-1c344a/dashboard/assets/pv/` were another byte-identical pair
- `_deal_build/build_dashboard_deal.py` emitted `deal-acme-PLATFORM.html` (3.44 MB)
- `deal-room-1c344a/dashboard/build_deal_artifact.py` emitted the DELIVERED `deal-dashboard.html` (2.81 MB)

This cost real work on 2026-07-27: the D4 rename was applied to `_deal_build/assets/pv/*`, the dashboard was
rebuilt, and the change did not appear in the artifact, because the delivered build reads `_parts` on the other
path. Collapsing removes the trap.

## What moved, and what stayed

Moved to `_SUPERSEDED_ENGINE_2026-07-27/` (nothing deleted, fully reversible):
`_parts/` · `assets/` · `build_deal_artifact.py` · `build_dashboard_deal.py` · `deal-dashboard.html` ·
`deal-dashboard-v2.html` · `deal-acme-PLATFORM.html` · `_negotiation_preview.html` · `smoke_deal.cjs` ·
`__pycache__/`

Stayed here (documentation and design history, still current): `DEAL-DASHBOARD-TRACKER.md` ·
`DEAL-DESIGN-BRIEF.md` · `DEAL-DESIGN-DECISION.md` · `DEAL-REDESIGN-BRIEF.md` · `_mockups/`

`_platform_build/apply_deal_chrome.py` (both copies) is a superseded one-off: it hardcodes an absolute path to
the retired `_deal_build/deal-dashboard.html` and its chrome grafting now lives inside `build_deal_artifact.py`.
Left in place, headed as superseded, not deleted.

**Deleting `_SUPERSEDED_ENGINE_2026-07-27/` is safe once Marc confirms the collapsed build is good.**
