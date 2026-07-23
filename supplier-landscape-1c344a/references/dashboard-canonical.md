# Supplier Landscape Dashboard - Canonical Structure (LOCKED, platform-fidelity build)

**This supersedes the earlier React/JSX canonical.** The dashboard is a self-contained HTML artifact assembled by `dashboard/build_dashboard.py` from a fixed rendering engine (`dashboard/assets/`) plus a per-run data object. The engine is the source of truth for layout and styling; this file records the locked decisions and the data contract. Do NOT hand-author JSX.

## Build (deterministic)
1. Research per the workflow, then write `dashboard/assets/landscape-data.js`:
   `var PROJECTS=PROJECTS||{}; PROJECTS['<key>']={ ...project object... }; CURPROJ='<key>';`
   The object shape is defined by example: the `landscape-data.js` shipped in this skill is a complete, valid instance. Match its keys (title/category; suppliers[]; requirements[]; per-supplier coverage/scores; risk dimensions; financials; ownership; capabilities; references; events; etc.).
2. Run: `python dashboard/build_dashboard.py --out /mnt/user-data/outputs/supplier-landscape.html --user "Procurement User"`.
3. Present the single HTML file. It is fully self-contained (fonts, world map, chrome inlined) with no network calls, so it renders as a Claude Desktop artifact.

## Canonical tabs (LOCKED - same every run, mode, and category)
- Overview: executive summary + recommendation (ranked table, dispositions), fit x risk segmentation quadrant, market structure.
- Supplier Deep Dive (vendor selector) with six subtabs: Supplier Summary; Company & Ownership; Capabilities & Operations; Financial & Market; Risk & Resilience; Lilly Fit & Diligence.
- Head-to-Head: per-requirement, risk-difference, commercial-model, and evidence-confidence, ALL on a shared center spine.
- Requirements Heatmap: category x supplier fit grid (plum single-hue ramp), rank-ordered columns, leadership + knockout matrix.
- Risk Assessment: portfolio summary, cross-supplier risk-by-dimension heatmap (rank-ordered), selected-supplier register + material events.

## Palette (LOCKED)
plum #5C2B50 primary, teal #2F6E6B secondary, burnt-orange #C15E19 emphasis; critical-red for gaps/critical only. No blue, no green. Encoded in the engine (theo-color.css + pv.css tokens + render code); never overridden per run.

## Determinism guarantee
Same data object in => byte-identical dashboard out. Structure, tabs, components, palette, and layout never change per run or mode; only the data changes. Every tab always renders; genuinely-absent data is gap-stated in place ("Data not available" / "not assessed"), never dropped, blanked, or fabricated.

## Honesty (unchanged, suite-wide)
Reflect-only / advisory; no vendor selected or contacted. Never fabricate suppliers, scores, financials, or citations. Provenance labeled (internal / external public / not validated). Gates are risk signals to clear downstream, not SME routing.

## Engine files (LOCKED - do not edit per run)
`dashboard/build_dashboard.py` (assembler) and `dashboard/assets/` (`pv/pv-01-boot-helpers.js`, `pv/pv-04-domain-data.js`, `pv/pv-07-landscape-render.js`, `pv/pv-07a-assess-model.js`, `pv/pv-07b-deepdive.js`, `pv/pv.css`, `theo-color.css`, `fonts-inline.css`, `app-shell.css`, `app-shell.js`, `theo-brand.js`, `pv-worldmap.js`, `pv-extracted-helpers.js`, `theo-dino-mark.png`, `landscape-data.js`). Changing these changes the LOCKED design and is a deliberate, owner-approved design change, never a per-run edit.
