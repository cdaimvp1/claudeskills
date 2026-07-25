# Master Remaining-Work List

Consolidated 2026-07-24 (evening) from ALL trackers/build-plans + a skills-update mapping sweep, so nothing is scattered. Read this for the full picture; the harness task list mirrors the active workstreams.

**Tags:** `[do-now]` autonomously doable · `[Marc]` needs your decision · `[hold]` on-hold/sensitive · `[release]` packaging/release step · `[blocked]` needs Lilly network · `[verify]` status contradiction to resolve. Source tracker in parens.

## CURRENT STATE — READ FIRST ON RESUME (updated 2026-07-25)
If the session restarted/compacted, this is where things stand.
- **Deal dashboard** (`_deal_build/`, tracker `DEAL-DASHBOARD-TRACKER.md`): all 3 Negotiation tabs ported
  (Trade Plan/Communications/Positions), full MCM colour, no dark mode, pale-fill sweep done. Commits
  through 6be83e9. **NOT locked** yet: #12 Communications live filters + #13 Next-Session-Brief decision
  remain (Marc's lock gate = only lock when every pending Deal change is done).
- **Marc APPROVED the 6 skill recommendations** (review `.txt` on Desktop): (5) claim-gate/abstention suite-wide,
  (2) update the no-green-rule foundation to permit teal [needs a brand-colors.md check first], (1) new
  `deal-workspace` hub skill + fix "Deal Room" name collision, (3) RFx→Deal handoff canonical, (6) shared
  comms-evidence methodology starting with deal-room + the 2 negotiation-prep skills, (4) Category Strategy
  rebuild (phased). Recommended order: finish the dashboard first, then #5 → #2 → #1 → #3/#6 → #4.
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
