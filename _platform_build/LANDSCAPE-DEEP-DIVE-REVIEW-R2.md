# Landscape Deep Dive — Marc Review R2 (2026-07-23)
Every item from Marc's review + my recommendation. "treat-as-directives, Marc reverts after."
Reskin target: match the platform/Overview card style (.sa-card + .card-hd icon+title), NOT my custom pvDD2Card.

## GLOBAL (all deep-dive tabs)
- G1. Panels don't match the dashboard design style — reskin every deep-dive panel to the platform card style
  (.sa-card / .card-hd with icon + title, like Overview). Pull the EXACT platform card CSS + color tokens, don't
  approximate. [DIRECTIVE]
- G1a. COLOR DRIFT (Marc, LOCKED): my deep-dive went navy-heavy + too many colors, diverging from the platform
  PANEL palette. Platform panel scheme = **PLUM (--ai #5C2B50) OR TEAL (--teal-d #2F6E6B) as PRIMARY, BURNT ORANGE
  as the ATTENTION/EMPHASIS color**; <=3 colors (primary + secondary + emphasis, shades OK); color does a JOB not
  decoration. Functional SEVERITY colors (risk Low/Mod/High/Critical, with red reserved for critical) are the
  allowed exception where meaning requires, kept restrained. Re-tokenize every deep-dive panel accent to this
  system; drop the navy/blue-as-primary and the rainbow. Ref: locked color system + participation-table plum/teal/
  burnt-orange reference. [DIRECTIVE]
- G2 (CO1). Headings = Title Case ("Company & ownership" -> "Company & Ownership"). Global. [DIRECTIVE]
- G3 (CO2 / CAP1). The dimension-lead band at the top of each tab ("Identity & ownership · Low · <evidence>") is
  confusing + shouldn't be its own card. REMOVE it as a card. Keep only a compact assessment (concern label +
  confidence dots) near the tab, and move any data-provenance/confidence onto the ACTUAL data panel it describes
  (inline chip), not a separate panel. [DIRECTIVE + design]
- G4. Add NARRATIVE analysis panels — most tabs lack narrative; Marc wants at least one grounded insight panel per
  tab, usually to the RIGHT of the lead visualization. [DIRECTIVE]

## Supplier Summary
- SS1. Doesn't feel like a summary; unsure of the tab's value. REC: keep it but LEAD with a real narrative
  recommendation (like Overview's Evaluation Summary — disposition + why + what to validate), then the assessment
  bars + evidence coverage as support. If still redundant with Overview after that, cut it. [rec: keep+narrative]

## Company & Ownership
- CO1 done under G2.
- CO2 done under G3 (strip the "Identity & Ownership Low" lead panel).
- CO3. FLIP Ownership & Control with Identity Verification (order). Ownership tree: condense — slim inline
  hierarchy (no big boxes), hover reveals markers/notes. [DIRECTIVE flip; rec condense+hover]
- CO4. Move Firmographics ABOVE footprint; put Firmographics + Footprint SIDE BY SIDE. Footprint: a real geo map
  isn't reliable offline (no tiles) — REC a light region schematic (US/EU/APAC markers + hover) or a compact
  region-grouped list; Marc to pick map-ish vs table. [DIRECTIVE reorder+side-by-side; rec region-schematic]

## Capabilities & Operations
- CAP1 done under G3.
- CAP2. Capability-to-requirement heatmap must adapt to the COMMODITY (may not be tech). REC: it is driven by the
  requirements model (columns = that event's requirement groups, rows = the supplier's relevant capabilities), so
  it adapts; the Snowflake cells are just this event's data. Make that explicit/data-driven. [rec]
- CAP3. Offering & Delivery and Fit to Requirements panels: EQUAL heights regardless of content; overflow -> that
  panel gets its own vertical scroll. [DIRECTIVE]
- CAP4. Reference Relevance (= how comparable a client reference is to Lilly, e.g. Capital One's closeness) feels
  forced/spread. SWAP with Offering & Delivery + tighten into a compact table. [DIRECTIVE swap; rec tighten]
- CAP5. No narrative — add a "Capability read" narrative panel (fit + gaps). [DIRECTIVE]

## Financial & Market
- FM1. Peer-position scatter: add a NARRATIVE analysis panel to the RIGHT (insights: strong-cap/weak-fin, where
  this supplier sits). Side-by-side. [DIRECTIVE]
- FM2. Financial viability -> convert numbers into compact VIZ (sparklines/bars) + MERGE with revenue history into
  one Financials panel + a narrative. [DIRECTIVE]
- FM3. Commercial model: data is AUTHORED/illustrative (I wrote it) — condense to a side panel labeled illustrative
  OR fold into the financial narrative. [rec condense/label]
- FM4. Market Position is too small alone -> fold into the Financials panel. Gartner-style QUADRANT: the
  cross-supplier quadrant already lives on Overview (segmentation plane); REC turn the peer scatter here into a
  proper LABELED quadrant (strong-cap/weak-fin etc.) so it reads Gartner-like within this tab. [rec]

## Risk & Resilience
- RR1. Remove the intro narrative ("What could prevent successful performance..."). [DIRECTIVE]
- RR2. Impact x Likelihood matrix: add NARRATIVE analysis to the RIGHT (insights). [DIRECTIVE]
- RR3. Risk-posture-by-dimension -> redesign as an ACCORDION (each dimension = rating + confidence; expand ONE at a
  time for the analysis) beside the matrix; the matrix already serves as the "quadrant". [DIRECTIVE accordion]
- RR4. Material events -> group/label by TYPE (security / legal / financial / supply-chain), SORTABLE + FILTERABLE,
  with a severity / risk-to-Lilly level; more visual. [DIRECTIVE]
- RR5. Mitigation board: unsure it's needed. REC DROP it from Risk — the Lilly-Fit Action Board becomes the single
  home for actions (avoids duplication). [rec drop]

## Lilly Fit & Diligence
- LF1. Lilly-Specific Fit on the LEFT, Diligence Funnel on the RIGHT. Action Board: keep as the single action home
  (since Risk's mitigation board is dropped), compact. Add a NARRATIVE Lilly-fit summary. [DIRECTIVE layout+narr;
  rec keep action board]

## Overview
- OV1. REMOVE the "Compare candidates head-to-head" launcher at the bottom entirely. [DIRECTIVE]

## Head-to-Head
- HH1. REVERT to the OLD design (pvDynamicsHtml embedded-compare look) as its own tab; MERGE in the new/additional
  data from my pvH2HHtml version (evidence-confidence compare, commercial-model compare, etc.). [DIRECTIVE]

## Requirements Heatmap
- RH1. LEAVE ALONE (cancels the planned P4 improve). [DIRECTIVE]

## Risk Assessment (top-level)
- RA1. Heatmap: revert the STYLE/design/colors to the OLD heatmap look; KEEP semantic Low/Moderate/High/Critical/
  Unknown + confidence dots (instead of scores). So: old visual heatmap + semantic labels. [DIRECTIVE]

## Build order (proposed)
1. Quick reverts/directives: OV1 (remove teaser), RH1 (nothing), RA1 (risk heatmap old style + semantic),
   HH1 (H2H revert+merge), G2 Title Case, G3 strip dimension-lead.
2. G1 reskin deep-dive panels to platform card style.
3. Per-tab restructure + narratives: Summary, Company, Capabilities, Financial&Market, Risk, Lilly Fit.
4. New viz: labeled quadrant (FM4), risk accordion (RR3), typed/filterable events (RR4), footprint schematic (CO4).
Verify each; DO NOT reorder tabs or rename anything not explicitly asked.
