# Supplier Landscape dashboard engine (LOCKED)

Deterministic builder for the platform-fidelity Supplier Landscape dashboard. The design is
locked; per-run variation lives ONLY in the data object.

## Build

```
python build_dashboard.py --out /mnt/user-data/outputs/supplier-landscape.html --user "Procurement User"
```

- Reads the project data from `assets/landscape-data.js` (`PROJECTS['<key>']={...}; CURPROJ='<key>';`).
- `--subject` defaults to the data's `category`/`title`.
- Emits ONE self-contained ~3.3MB HTML file (fonts, world map, chrome all inlined, no network),
  which renders as a Claude Desktop artifact.

## What to change per run (and what NOT to)

- CHANGE: `assets/landscape-data.js` only. It is the data object the LLM authors from research.
  The shipped copy is a complete worked example and defines the schema by example.
- DO NOT edit per run: `build_dashboard.py`, `assets/pv/*.js`, `assets/pv/pv.css`,
  `assets/theo-color.css`, or any other engine/chrome asset. These encode the LOCKED design and
  palette (plum #5C2B50 / teal #2F6E6B / burnt-orange #C15E19, no blue/green). Editing them is a
  deliberate, owner-approved design change, never a per-run edit.

## Files

- `build_dashboard.py` - assembler (inlines engine + data + chrome into one HTML).
- `assets/pv/pv-01-boot-helpers.js`, `pv-04-domain-data.js`, `pv-07-landscape-render.js`,
  `pv-07a-assess-model.js`, `pv-07b-deepdive.js`, `pv.css` - the render engine.
- `assets/theo-color.css` - authoritative color-token layer (palette).
- `assets/fonts-inline.css`, `app-shell.css`, `app-shell.js`, `theo-brand.js` - chrome + fonts.
- `assets/pv-worldmap.js` - projected world-atlas land path for the operating-footprint map.
- `assets/pv-extracted-helpers.js` - escape/format helpers pv-07 depends on.
- `assets/theo-dino-mark.png` - the static Theo dino mark in the topbar.
- `assets/landscape-data.js` - the per-run data object (worked example shipped).

Canonical spec: `../references/dashboard-canonical.md`.
