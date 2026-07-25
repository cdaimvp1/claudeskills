# Master Remaining-Work List

Consolidated 2026-07-24 (evening) from ALL trackers/build-plans + a skills-update mapping sweep, so nothing is scattered. Read this for the full picture; the harness task list mirrors the active workstreams.

**Tags:** `[do-now]` autonomously doable · `[Marc]` needs your decision · `[hold]` on-hold/sensitive · `[release]` packaging/release step · `[blocked]` needs Lilly network · `[verify]` status contradiction to resolve. Source tracker in parens.

## CURRENT STATE — READ FIRST ON RESUME (updated 2026-07-25)
If the session restarted/compacted, this is where things stand.
- **Deal dashboard** (`_deal_build/`, tracker `DEAL-DASHBOARD-TRACKER.md`): **LOCKED — design of record
  (2026-07-25).** All 3 Negotiation tabs ported (Trade Plan / Communications incl. status+category
  filters + expand-all / Positions), Terms & Review + Economics done, full MCM colour, no dark mode, no
  pale fills. Every increment committed + malicious-scanned CLEAN; final in-browser sweep clean (all tabs,
  0 console errors). No further changes without Marc's explicit request. (#13 brief = dropped per the
  locked design; comms full-text search deferred — both optional, not blockers.)
- **Marc APPROVED the 6 skill recommendations** (review `.txt` on Desktop): (5) claim-gate/abstention suite-wide,
  (2) update the no-green-rule foundation to permit teal [needs a brand-colors.md check first], (1) new
  `deal-workspace` hub skill + fix "Deal Room" name collision, (3) RFx→Deal handoff canonical, (6) shared
  comms-evidence methodology starting with deal-room + the 2 negotiation-prep skills, (4) Category Strategy
  rebuild (phased). Recommended order: finish the dashboard first, then #5 → #2 → #1 → #3/#6 → #4.
  STATUS 2026-07-25: dashboard LOCKED; **#5 claim-gate DONE** (foundation guardrail G12, ebdc557).
- **#2 DONE 2026-07-25 — Marc chose "Split: MCM=dashboards, brand=docs."** Encoded in `lilly-brand-assets`
  brand-colors.md: new "Two-palette model (READ FIRST)" + "Dashboard Palette (interactive, MCM)" sections,
  Canonical Status Palette scoped to DOCUMENTS/static, JSON manifest `dashboardPalette` block +
  `statusPaletteScope`, Prohibited-Colors allowances reconciled (two scoped allowances). Additive (no
  document/DOCX colour changed), JSON valid, em-dash-free. Propagates to all skills via house-styles
  "pull exact values from brand-colors.md". This UNBLOCKS the dashboard builds (#20 RFx, #15 Landscape).
  The finding that drove the decision, for the record: the Lilly brand palette (`lilly-brand-assets`
  brand-colors.md) has **NO green AND NO teal**: positive/settled = light-blue **Neutral Sky #D4E5F7**,
  which the file says "replaces former green tints." So the "no green rule" is a REAL Lilly brand fact
  (green isn't a Lilly colour), and **teal isn't a Lilly colour either.** The MCM dashboard palette
  (plum/teal/burnt-orange) Marc approved + locked for Deal/Landscape therefore DIVERGES from the Lilly
  brand palette. #2 is NOT a small "permit teal" edit. Recommended resolution: **scope MCM to the
  interactive DASHBOARDS only; keep DOCX/decks on the Lilly brand palette** (brand-colors.md governs
  documents). Do NOT add teal to the brand foundation without Marc's explicit brand/architecture decision.
- **#1 CONFIRMED 2026-07-25 — Marc chose "Extend deal-room as the hub."** Plan: extend `deal-room` into the
  Deal SKILL HOME (front the locked Deal dashboard + orchestrate the negotiation-prep / deal-room /
  playbook-learning skills over the persisted `deal_room_state.json`); rename commercial-negotiation-prep's
  STATIC "Deal Room" dashboard to fix the name collision. NOT building a new `deal-workspace`.
  **PLAN: `_redesign_proposals/DEAL-HUB-SKILL-PLAN.md` (2026-07-25). Both decisions ANSWERED: retire
  the 4-tab (hub becomes canonical); rename to "Interactive Negotiation Prep Dashboard." STEP 1 (rename)
  DONE (c0da7e7). ALL STEPS DONE 2026-07-25: dashboard-canonical rewritten to the 4 top-level tabs +
  subtabs Deal hub (Overview; Terms & Review = Documents / Legal & Protection / Scope & Performance /
  Sources; Economics = Deal Table & ZOPA / Financial Model; Negotiation = Positions / Trade Plan /
  Communications) in the MCM palette; reference JSX rewritten (verified: brackets balanced, numbers
  reconcile 78.5 / $547,600, 0 banned hexes, 0 em dashes, outline pills, malicious-scan clean, Legal &
  Protection + Scope & Performance render NEEDS_INPUT not fabricated); Deal SKILL HOME front-door section
  added; state schema gained optional hub_slices; version -> v1.1. deal-room's live-negotiation engine
  (Phases 1-8, ledger, kernel math, handoffs, reflect-only) UNCHANGED (never-regress).** Rationale:
  `deal-room-1c344a` ALREADY exists and is
  ALREADY the stateful Deal hub: it runs one Claude Project per negotiation, ingests the opening strategy,
  keeps a persistent `deal_room_state.json` concession ledger across rounds, is seeded by commercial/legal-
  negotiation-prep, and hands off to negotiation-playbook-learning at close. Creating a new `deal-workspace`
  hub would DUPLICATE it. Recommended resolution: **EXTEND `deal-room` into the Deal SKILL HOME** (front the
  locked Deal dashboard + orchestrate the negotiation-prep/deal-room/playbook-learning skills over the
  persisted state), do NOT create `deal-workspace`. The "Deal Room" name collision is already documented in
  deal-room's own description: commercial-negotiation-prep's STATIC dashboard is also titled "Deal Room";
  fix = rename that static dashboard so "Deal Room" means only the live skill. NEEDS Marc's confirmation.
- **#20 RFx dashboard mockup DONE 2026-07-25 (for review).** `_redesign_proposals/RFx-MOCKUP.html` (1,180
  lines, self-contained). Built to spec section A: 4 subtabs (Executive Readout / Scoring / Analysis /
  Recommendation) + handoff action, promoted panels (Bid-Leveling Gate, Evaluation Readiness, dual-ranking
  + gateConflict, participation glyphs shape+label, claim-gate [CONFIRM] x13). MCM palette. VERIFIED:
  renders clean (only a favicon 404, no JS errors), a11y snapshot confirms structure, 0 banned hexes, 0 em
  dashes, self-contained, malicious-scan clean, no fabrication (Ashford pricing shows "Not submitted"). One
  honest limitation: the bid-leveling denominator selector has real numbers only for "per named user/year";
  other denominators show [CONFIRM] rather than fabricated recompute. AWAITING Marc's review before building
  the real rfx-hub skill.
- **#15 Landscape MCM pass - CORE DONE 2026-07-25 (verified in browser, light mode).** In
  `supplier-landscape-1c344a/dashboard/assets`: theo-color.css status tones remapped to MCM non-stoplight
  (ok = teal #2F6E6B not green, warn = burnt-orange #C15E19, danger = deep rust #9A3B1F, info = muted blue
  #2E5E8C; owner-rule comment updated from "green IS allowed" to non-stoplight); the html[data-theme="dark"]
  token block DELETED; app-shell.js forced to light-only (theoSetTheme is a no-op-to-light, stored 'dark'
  overridden on load) so dark mode is unreachable (no toggle UI exists). Verified: renders light, tabs
  grey/black, no stoplight green, 0 JS errors (favicon 404 only). COLOR-ONLY; entity/hue library + neutral
  ladder untouched. **RESIDUALS needing Marc's scope call (NOT done, flagged):** (a) the recommendation
  leader row still uses a pale-orange EMPHASIS tint fill (--emph-t), which conflicts with "no pale burnt-
  orange fills" but is the locked design's leader-highlight treatment (converting it to an outline/frame is
  a render-engine change to a LOCKED template); (b) dead dark-mode CSS remains (unreachable) in pv.css +
  theo-brand.js. Both deferred pending Marc's confirmation that #15 should go to full Deal-parity fill->outline.
- **HUB PATTERN confirmed**: the 5-hub consolidation (Landscape/Deep Dive/RFx/Deal/PCC) — each hub = a thin
  orchestrator skill over a persisted data object + lens skills feeding bounded cited slices. Landscape
  (supplier-landscape) + PCC (personal-command-center) have homes; Deal → new `deal-workspace`; RFx → new
  `rfx-hub`; Deep Dive → home TBD.
- **RFx DASHBOARD REDESIGN — spec DONE**, `_redesign_proposals/RFx-REDESIGN-SPEC.md` (supersedes RFx.md).
  Rename RFP→**RFx** (serves RFI/RFQ/RFP, any commodity). Platform `RfxTab.tsx` = base, 6-section model
  folded in. **3 decisions resolved** (spec §G, Marc to confirm): new thin `rfx-hub`; scoring ownership
  split (evaluation-engine=official, response-analysis=proposed) + one shared kernel; keep the 4-subtab
  spine. NEXT: mockup the reconciled structure for Marc, then build per §F (8 phases).
- **Deferred (needs Marc / bigger)**: Landscape MCM colour pass (#15, hardcoded hexes in pv-07* engine),
  the skill-side builds (all needs-Marc decisions above). Blocked: help-desk network harvest (Lilly network).

## 0. Governing constraints (apply to everything below)
- **Skill updates NEVER regress** — additive/branch only; a skill can serve its original purpose AND feed dashboard(s); the ONLY allowed regression is a Claude-Desktop-compat forced change, and only after explain + Marc sign-off (memory `feedback_skill_update_never_regress_branch`).
- **MCM palette** — plum/teal backbone, burnt-orange emphasis; settled=teal, attention=burnt-orange, critical=deep-rust `#9A3B1F`, info=muted-blue `#2E5E8C`; NO stoplight green/red/yellow; NO dark mode; outline pills; NO pale-orange/amber fills (see DEAL-DASHBOARD-TRACKER LOCKED constraints).
- **Deal gate** — finish porting all tabs + every pending Deal change → THEN lock + commit (task #17).

## 1. DEAL DASHBOARD — finish the live build (`_deal_build/`), then lock
- `[do-now]` **#11 Positions port** to the locked `MOCKUP-negotiation-positions.html` (posture header w/ Now→Need gates + protection trajectory; severity-icon filters; master-detail: position ladder / why / exchange / trade / dependencies / history). Live `buildPositions` is still the old design. (DEAL tracker; skills-map D5)
- `[do-now]` **#12 Communications filters + Expand-all** — status/category/search need a DealUI delegated handler (`_filterTable` is table-only); summary strip is counts-only now.
- `[do-now]` **#14 Pale-fill sweep** — remove pale-orange/amber fills from ~11 scoped styles found in `tab-contract.js`/`tab-commercials.js`/`tab-negotiation.js`: `.lp-tactic`, `.lp-wf-bar.current`, `.lp-i-current`, `.lp-cov-Confirm/Gap`, `.pill.lp-one-sided(.crit)`, `.lp-verdict.v-adverse/v-critical`, `.lp-neg-badge.yes`, `.sc-verdict-deviation`, `.sc-st-contradicted`, `.perf-chip`, `.room-tag.load`, negotiation wording pill. Convert to left-bar/outline. (skills-map D5)
- `[Marc]` **#13 Next-Session Brief** — re-home or drop (removed from Comms in the alignment-map redesign; old code in git history).
- `[Marc]` Cross-Doc "Open Document Risks" reframe — adopt the approved mockup live?
- `[Marc]` Document Family Register — click-to-open the register row?
- `[Marc]` Confirm/revert 2 L&P judgment calls — group bands ("Issues N"/"Obligations N") vs per-row tag; boot auto-expand making the register start taller.
- `[Marc]` Confirm Protection-Scorecard 8-issue-category spine (vs the 26-row literal union).
- `[do-now]` **#16 Final full-tab verification + full-codebase malicious-code sweep** (incl the single-file demo) before sign-off.
- `[gate]` **#17 Lock + commit the Deal dashboard** once every item above is done.

## 2. LANDSCAPE DASHBOARD — colour + the R2 deep-dive rework
- `[do-now]` **#15 / L1 Recolor the render ENGINE** — hardcoded stoplight hex literals live in `_platform_build/assets/pv/pv-07-landscape-render.js`, `pv-07a-assess-model.js`, `pv-07b-deepdive.js`, `pv.css` (bypassing the CSS-var layer), so swapping `theo-color.css` alone won't fully recolor. Replace with MCM (teal/burnt-orange/deep-rust/muted-blue), outline pills, no pale fills; +DD4 polish (peer-scatter dot `#0F3A85`, Commercial-Model bars). Colour-only; don't touch tab structure or the `PROJECTS[key]` data contract; don't touch pv-01/03/04/08/1x (other tabs). (LANDSCAPE-SPEC-GAP-REVIEW DD4; R2 G1a; DEAL tracker #15)
- `[do-now]` **L2 Re-sync + rebuild** — copy corrected `pv-07*`/`pv.css`/`theo-color.css` into `supplier-landscape-1c344a/dashboard/assets/…`, rebuild via `dashboard/build_dashboard.py`, verify old-hex count = 0. (`build_dashboard.py` itself is already in sync — asset swap only.)
- `[do-now]` **R2 deep-dive review batch** (Marc's directive list — LANDSCAPE-DEEP-DIVE-REVIEW-R2):
  - Global: **G1** reskin every panel to `.sa-card`/`.card-hd`; **G1a** re-tokenize plum/teal+orange ≤3 (same as L1); **G2** Title-Case headings; **G3** drop the dimension-lead band as its own card; **G4** add a narrative insight panel to every tab.
  - **SS1** Supplier Summary lead with a real recommendation (or cut if redundant). **CO3** flip Ownership above Identity + slim ownership tree; **CO4** Firmographics above Footprint + `[Marc]` pick region-schematic vs region-list (geo map unreliable offline). **CAP2** heatmap commodity/requirements-driven; **CAP3** equal-height panels+scroll; **CAP4** swap Reference Relevance w/ Offering&Delivery; **CAP5** add capability-read narrative. **FM1** narrative right of scatter; **FM2** viability→sparklines/bars, merge Financials; **FM3** condense Commercial Model; **FM4** labeled Gartner-style quadrant. **RR1** remove intro narrative; **RR2** narrative right of matrix; **RR3** risk-posture single-open accordion; **RR4** group Material Events by type + severity; **RR5** drop Mitigation board from Risk. **LF1** Lilly-Fit left / Diligence Funnel right + narrative. **OV1** remove the H2H "compare candidates" launcher; **HH1** revert Head-to-Head to the old embedded-compare look (merge new data in); **RA1** revert Risk-Assessment heatmap style/colours (keep semantic labels + confidence dots).
  - Sequence: quick reverts (OV1/RA1/HH1/G2/G3) → G1 reskin → per-tab restructure+narrative → new viz (FM4 quadrant, RR3 accordion, RR4 events, CO4 footprint).
- `[do-now]` **Overview / TOP1** — supplier-count funnel (reviewed/passed/screened-out/recommended), one visible score scale (not 89/89.37/4.51/60.77), cut prose restating the ranking table, keep disposition labels ≠ quadrant labels. (LANDSCAPE-SPEC-GAP-REVIEW; PLATFORM-CONSOLIDATION C2; BUILD-TRACKER P6)
- `[do-now]` **Seed bugs** — score-scale drift → single `pvAssess` source; 7-vs-9 supplier count → funnel; ESG shown as a scored dash → assessment-coverage note. (BUILD-TRACKER)
- `[do-now]` Remove the "Request more data"/`pvRequestDataCard` panel (DEEP-DIVE-SPEC); remove dead code `pvDDSection`/`pvVerdictHeaderHtml`/`pvCompPositionHtml` (BUILD-TRACKER P7).
- `[do-now]` Deep-dive **supplier-type-aware (compose-by-traits) layout** — public/private/hyperscaler-product profiles (DEEP-DIVE-SPEC-v3).
- `[Marc]` Segmentation quadrant threshold tuning (6 of 7 land in "Leader") (SPEC-v3-TOPLEVEL).
- `[Marc]` Landscape D&B/Bloomberg enrichment backlog — UBO/corporate-family tree, operating-footprint geo, dependency/supply-chain network, comparative financial-statement table, industry-ratio benchmarking, sanctions/watchlist + ownership-exposure, ESG scorecard, trade-payment/default-risk (all gap-stateable). Optional.
- `[verify]` Resolve contradictions: P2 deep-dive "complete vs remaining" (BUILD-TRACKER); H2H launcher added (P6) vs remove-directive (OV1).
- `[release]` Refresh the Desktop delivery-folder copy after Landscape lands.

## 3. SKILL UPDATES (Deal + Landscape) — additive/branch only, never regress
- `[Marc]` **D0 Decide/create the Deal-tab hub SKILL HOME** — `_deal_build/` currently has NO home skill (unlike Landscape, which is inside `supplier-landscape-1c344a/dashboard/`). Options: a new `deal-tab-1c344a` skill hosting `_parts/`+`build_deal_artifact.py`+`assets/`; host inside a lens skill (messy); NOT `deal-room-1c344a` (a different live-ledger product). Also fixes the "Deal Room" name collision. **Blocks D1/D3.** (skills-map D0)
- `[Marc]` **D2 Update the shared "no-green rule" foundation** — `lilly-brand-assets-1c344a/references/brand-colors.md` + `dashboard-components.md` still say "no green or teal." Teal is now the primary "settled/ok" token, so the rule itself must change. **Suite-wide blast radius (~26 skills)** — scope strictly to colour tables + the no-green prose. Prerequisite for D1 to hold. (skills-map D2)
- `[do-now after D0]` **D1 Rewrite each lens skill's `dashboard-canonical.md`** to the converged 4-tab IA + MCM palette: `lilly-contract-review-1c344a`, `scope-sow-architect-1c344a`, `pro-forma-builder-1c344a` (+ their `examples/*.jsx`). PRESERVE: contract-review's 5 output modes (redline .docx, Review Summary .docx, Stack Map, standalone Dashboard) + clause/playbook engine; scope-sow's `Rewritten_SOW.docx` + 4-pass workflow; pro-forma's `pro_forma_generator.py`/`numeric_kernel.py` .xlsx (do NOT touch the workbook path).
- `[do-now after D0]` **D3 Formalize** the redesigned Trade Plan / Communications / L&P accordion-scorecard + 3-outcome-card register / Scope&Performance master-detail as skill spec (in D0's target + the originating lens skills). PRESERVE the scoring logic (deduction kernel HELD, #114).
- `[reference]` **D4** Encode the ACTUAL shipped **4-tab IA** as canonical (not the superseded 6-tab proposal in DEAL-TAB-REDESIGN-PROPOSAL).
- `[do-now]` **L3 Update Landscape SKILL.md + `dashboard-canonical.md` palette prose** to MCM naming (doc-only; the engine carries behaviour). PRESERVE the report `.docx` / CSV schemas / `landscape_handoff.json` sections.
- `[Marc, after D0-D2]` **dashboardData SLICE CONTRACT** — author "Deal-tab hub contribution — output slice" into each lens skill's SKILL.md: contract-review owns `issues[]`/`documentConflicts[]`/`protection{}`/`obligations[]`/`tacticFlag`; scope-sow owns `scope{}`+scope `issues[]`; pro-forma owns `commercialLines[]`/`scenarios[]`/`assumptions[]`/`proforma{}`/`benchmarks[]`. Strip competing "build your own dashboard" instructions. (= the "skill-alignment spec"; sequenced after dashboards per Marc)

## 4. RELEASE / PACKAGING
- `[release]` Repackage the installable `.skill` zip (#68/#87) after generator/skill updates (no in-repo packaging script yet).
- `[release]` Master-plan reconcile + pre-packaging integrity sweep across all 26 skills.
- `[Marc]` Spot-check the 4 doc generators' (evaluation-engine/executive-summary/rfp-response/sole-source) illustrative demo data vs each skill's intent.
- `[release]` Refresh the "Lilly Theo" Desktop delivery folder.

## 5. PLATFORM CONSOLIDATION
- `[Marc]` Run the roster-cut batch B1 — delete `decision-deck` + `procurement-options-analysis` + strip ~14 cross-refs. (PLATFORM-CONSOLIDATION)
- `[do-now]` Exec-Summary/Overview batch — merge "Eliminated before shortlist" into the Recommendation table (divider + name+reason rows, no scores); remove the "Start-an-RFx" button; replace the "Shortlist to advance" sentence with row/dot shading; drop the weighted-score column (Composite covers it); make segmentation sliders actually move axes/resize quadrants.
- `[Marc]` Marc's visual sign-off on the Landscape exemplar (gates rollout).
- `[Marc]` Continue family-by-family redesign rollout (RFx, Category Strategy, Overview/Docs/Comms) per `_REDESIGN-STANDARD` — gated on exemplar validation.

## 6. GOVERNANCE-DEFERRED (docs/OVERNIGHT-BUILD-TRACKER)
- `[Marc]` decision-deck Stage-5 split + dead-content deletion (supervised; call out before deleting).
- `[Marc]` 3 non-numeric decision kernels (legal-negotiation-prep tier-tree, comment-cleanup matrix, workflow-map cascade) — recommend, don't build without sign-off.
- `[Marc]` help-desk: new-skill vs extend-process-navigator decision.
- `[Marc]` #32 dashboard-as-code generators (full generator-ify) — large, deferred.
- `[do-now]` Dummy-data dashboard render per skill for Artifacts review (unchecked).
- `[do-now]` Optional doc/deck HTML previews for the 4 non-dashboard skills (legal-negotiation-prep, executive-summary DOCX, decision-deck PPTX, process-navigator chat).
- `[do-now]` Baseline: live smoke test of the Stage-3 procurement-launcher (widget render + Teach-mode paths) — current verification is static-analysis only.

## 7. ON-HOLD / SENSITIVE (need Marc / gated)
`#44` handover brief (persistence-gated, Cowork) · `#80` contract-review hybrid clause-analysis pipeline · `#86` invoice-rate-card-auditor platform mapping · `#91` ARIA — whole plan on hold pending dashboard/skill optimization + Phase-0 exit gate (Phase-0 spike, Q4 kernel-sync owner, Q5 MVP seed skills, Fabric `skill_outcome` telemetry) · `#102` cross-cut scoring layer · `#108/#109/#110` Theo intake/handoff/routing-manifest · `#111/#112/#115` remaining hubs (Deep-Dive/RFx/PCC) · `#113` playbook-learning re-vendor · `#114` contract-review Protection-Score deduction-kernel · re-paper-SOW capability gap (future contract-review addition) · Landscape narrative reconciliation (~250 illustrative sub-narratives, parked) · numeric_kernel gap list (ROI/payback/waterfall, sensitivity, correlated drivers) · procurement-launcher cross-session journey state (after hubs).

## 8. BLOCKED — needs Lilly network (offline now)
- `[blocked]` Help-desk network-gated harvest — build per-source snapshot files from real page reads on the Lilly network: BuyLilly (onboarding / PO open-close / invoice-status / where-to-start), Playbook stakeholder FAQs, ProtectLilly fallback notes; then the broader `procurement-operating-model.md` corpus. Real content only, never inferred. (TODO-network-gated-harvest; OVERNIGHT-BUILD-TRACKER)

## Contradictions to resolve with Marc
1. P2 Deep-Dive completion — one BUILD-TRACKER entry says complete, the next says the same 4 tabs' viz remain.
2. Head-to-Head launcher — one entry added a compact launcher; a later review (OV1) says remove it entirely.
