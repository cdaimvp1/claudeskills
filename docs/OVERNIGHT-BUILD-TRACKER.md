# Overnight autonomous build tracker — started 2026-07-21

Durable record of the autonomous build run so it survives context compaction. Read this
first on resume. Update it after every phase.

## Standing guardrails (Marc's directives — do not violate)
- **These are Claude Desktop SKILLS.** Everything must work for a SINGLE user in one Claude
  Desktop conversation or one Project. Dashboards render via the skill's own mechanism
  (visualize:show_widget / artifact / present_files), self-contained, CSP-safe, no server,
  no external deps. Reflect-only: never send, chase, close, or write back to any system.
- **Data sources (real):** document extraction from user uploads (contracts/invoices/SOWs/
  proposals/spend files → pricing, rates, caps, dates, costs), ARIA (spend/vendor/SEC/
  forecast) for ARIA-enriched skills, SHARP (SAP spend), Power BI / Fabric / OneDrive /
  SharePoint, M365 (mail/Teams/calendar), web, direct input. NO ServiceNow/Aravo/Ariba/
  SAP-direct live state; NO cross-user/portfolio aggregation; NO write-persistence.
- **DESIGN GATE (hard):** reuse each skill's existing component library + canonical palette
  (Bold Blue #0F3A85, NO green in status), Georgia titles on Arial body; correct tab
  placement; LEFT/RIGHT two-column layouts where they read better (not all stacked); EVERY
  visualization paired with a narrative analysis panel (G7/G8 depth); illustrative data
  consistent with the existing example dataset. New panels must look native, not bolted on.
- **No drift / no hallucination:** build only the approved scope (below). Do not invent data,
  skills, or capabilities. Verify everything; report failures honestly.
- **Test well:** each build → design-QA verify (parse, panels present, design fit, narrative
  pairing, no green/off-palette, no em-dash/mojibake). Kernels: run their tests.
- **NEVER pause for Marc's review.** Marc is asleep. Post status but continue immediately;
  the design-QA verify (not Marc) is the quality gate. Do not stop and wait for input.
- **Dashboard mockups:** after each dashboard is built + QA'd, generate a STANDALONE local
  HTML mockup (dummy data, renders on its own; CDN React/recharts is OK for a LOCAL file) and
  OPEN it in Marc's default browser (`cmd //c start "" "<file>"`), so all ~18 are open and
  waiting by morning. Save mockups under scratchpad/mockups/.
- **Cheap models:** Haiku (mechanical) / Sonnet (build/verify); Opus only for genuinely hard
  adjudication.
- Backups before each mutating wave in scratchpad/backups_*.

## Approved scope (Marc's decisions — all greenlit)
- **80 dashboard panels** (reconciliation + re-examination flips) across 15 skills — see
  scratchpad/review/prune_data.json. Build ALL (high/med/low). 3 true drops only (Handover +
  2 cross-user). 25 already-shipped (do not rebuild).
- **Interactive modeling** built into dashboards: escalation-cap→multi-year-TCO slider
  (pro-forma + commercial-prep, shared engine), spend-forecast projection (category-strategy
  + supplier-deep-dive), market-rate projection (market-rate), award-scenario (evaluation-
  engine / decision-deck = proposal P6). Each engine built once, placed everywhere it helps.
- **11 proposals:** 5 net-new skills (Scope/SOW Architect, Deal Room, Invoice & Rate-Card
  Auditor, Sole-Source Challenge, Options Analysis) + 6 adaptations (Spend-File-Prep→
  category-strategy engine, Bid-Leveling→rfp-response gated stage, Requirements-Synth→
  rfp-engine, Contract-Stack-Mapper→contract-review Layer 1, Exec-Challenge-Sim→negotiation-
  simulator mode, RFx-Q&A/Addendum→rfp-engine).
- **PCC redesign** (#41): rebuild theos-field-guide engine data-object-first (JSON-parse
  isolation so it can't die on load), richer work graph + abstaining NBA + comms depiction;
  rename display to "Personal Command Center" (label-only; freeze skill id / storage key /
  state-file name). Slim, not over-engineered.
- **Medium/low sweep** (#31), **Stage-5 splits** (category-strategy + decision-deck) (#33),
  **Stage 6** gate-checks + comment-cleanup split (#34), **Stage 8** THEO orchestrator (#40).
- **Stage 7 help-desk skill (#35):** scaffold only — content build is NETWORK-GATED (needs
  Marc on the Lilly network). Handover (#44): backlog (Cowork).
- **End deliverable:** one dummy-data dashboard render per skill (Artifacts) for Marc's review.

## Phase order + status
- [x] B1 Build wave 1 dashboards (8): DONE. All 8 built; QA: 3 clean (contract-review,
      commercial-prep, timeline-builder), 4 minor concerns (stale prose/provenance notes),
      1 real fail (category-strategy: 9 HTML entities in visible text) → FIXED + verified
      (grep: 0 entities remain; esbuild clean); supplier-landscape stale Tab-1 prose also reconciled.
      category-strategy QA esbuild-rendered all 11 tabs (22/22 OK). Panels: cat-strategy 17,
      contract-review 5, supplier-deep-dive 7, supplier-landscape 6, timeline 5, commercial 5,
      rfp-response 4, pro-forma 4.
- [x] B2 Build wave 2 dashboards (10): DONE. All 10 built, 0 fails (4 QA-clean: should-cost,
      exec-summary, process-navigator, market-rate; 6 minor cosmetic concerns). decision-deck =
      PPTX slides, exec-summary = DOCX elements, process-navigator = light artifact (not web
      dashboards). theos-field-guide folded into PCC phase (E).
- [x] I (dashboards) Mockups: 13 web-dashboard mockups BUILT + browser-verified + OPENED in
      browser (category-strategy, contract-review, rfp-response, supplier-landscape, supplier-
      deep-dive, commercial-prep, pro-forma, timeline-builder, meeting-prep, rfp-case-manager,
      should-cost, evaluation-engine, negotiation-simulator, market-rate). Under scratchpad/mockups/.
      NON-DASHBOARD skills (no web mockup): legal-negotiation-prep + executive-summary-package (DOCX),
      decision-deck (PPTX), process-navigator (chat). TODO(optional): render doc/deck HTML previews
      for those 4 so Marc can see their outputs too. ALL 18 DASHBOARDS BUILT + VERIFIED.
- [ ] C  Stage-5 monolith splits (category-strategy + decision-deck)
- [x] D  11 proposals DONE (wya2a037q, 20 agents, 0 errors): 5 net-new skills (scope-sow-architect,
      deal-room, invoice-rate-card-auditor, sole-source-challenge, procurement-options-analysis — all
      -1c344a, each w/ vendored numeric_kernel 24/24, JSX parses) + 6 adaptations (P3→category-strategy,
      P4→rfp-response, P8+P11→rfp-engine, P9→contract-review, P10→negotiation-simulator). Verify: 5 clean,
      rest concerns. FIXED post-verify: (a) 7 frontmatter descriptions were >1024 (adaptations bloated
      them) → trimmed ALL to parsed-≤1024 (authoritative yaml folded len; check_desc.py now measures
      folded value); (b) lilly-contract-review Stack-Map-only mode wasn't gated through Persona-Selection
      + Application-Modes prompts → added skip guards. 5 new-skill mockups built (0 entity artifacts,
      SSR 7-21K) + OPENED. 23 mockups now open total.
- [x] E  Personal Command Center redesign — DONE (Opus, ab3b54525d5e0f293). engine.html 74KB->132KB.
      data-object-first #fgData JSON island (parsed in try/catch; PROVEN can't-die-on-load: corrupted
      copy left main script byte-identical + fell back to saved board + banner); display promoted to
      "Personal Command Center" (Field Guide as sub-tag, dino kept); frozen id/storekey
      theo.fieldguide.workgraph.v1/file theo-workgraph.json/schema field_guide_state.json ALL intact;
      KPI strip, filter/lens (15 chips), abstaining NBA (SAP low-conf issue correctly excluded ->
      "1 item needs more signal"), Comms river (8 nodes, 4 statuses) + topic flow, renewal radar
      (DocuSign overdue), My Savings ($2.6M), report card (GPA 3.4). id-24 SKIPPED + documented.
      Playwright: 0 JS errors, fully populated. dashboard-canonical.md reconciled to v2.5 (closes the
      C6-class prose/engine drift). SKILL.md -> v2.5. Opened in browser (mockups/personal-command-center.html).
- [x] F  Medium/low finding sweep — DONE (workflow w8wr4rpkj, 26 agents Sonnet, 0 errors): 116 FIXED,
      68 already-fixed, 23 wont-fix (ALL legit: generated-shared-block S0/S1/S5 ordering; non-ARIA-
      applicable skills' missing ARIA block; kernel-.py-body edits avoided to prevent vendoring desync).
      Self-checks clean (0 em-dash/green/frozen-key across all). 2 flagged non-ASCII VERIFIED correct:
      lilly-brand-assets(6)=mojibake restored to proper emoji/arrow/check/(c) (0 mojibake remains);
      procurement-launcher(1)=widget entity &#x1F996; -> literal dino (Rule 7). ONE MISS: voice-profile
      returned empty (did nothing) -> REDO agent a249d13db80ff25ff RUNNING (6 findings incl register
      schema 5-vs-7, S1 picker 3-vs-4, AUDIT/UPDATE triggers). Sweep touched files now FREE for G/H.
- [x] POST-SWEEP integrity check DONE + CLEAN: 32 skill dirs all valid YAML, all desc<=1024, all
      names match; 0 em-dash + 0 mojibake across ALL .md; voice-profile clean (all 6 findings resolved,
      confirmed by redo agent a249d13db80ff25ff - the original empty return was a reporting-only miss);
      3 sweep-touched JSX re-parsed OK (decision-deck has no JSX = PPTX). scratchpad/integrity_postsweep.py.
- [~] H  Stage 8 THEO guided-orchestrator - RUNNING (Opus a9ff6fc0772583fd5). Re-derive chains from the
      CORRECTED suite (Stage-1 scoring ownership + requirements-grid + 5 NEW skills per their own BOUNDARY
      text + help-desk front door), reconcile skill count (26+5=31 + help-desk), de-strand all skills in
      widget/teach-mode/fallback, author guided free-text-intent->ordered-path->step handoff. Guided-handoff
      only (auto-dispatch NOT claimed). No fabricated chains.
- [x] C/G  Stage 5a + Stage 6 + Stage 7 - DONE (workflow wv537smy2, 4 agents, 0 errors):
      * 5a category-strategy: 3 companions created (analysis-frameworks/analysis-methodology/data-quality-rules),
        byte-diff 3/3 IDENTICAL, SKILL.md 3851->2179 lines (43%), JSX parses, 11-tab spec + CS gates intact, v4.4.
      * 6a gate-checks: commercial-negotiation-prep 0->8, legal-negotiation-prep 1->5, supplier-deep-dive 1->4;
        all reference real prior-phase artifacts; suite gate style; YAML valid, 0 em-dash/non-ASCII.
      * 6b comment-cleanup: Mode Selection + Finalize higher-stakes bounding banner (ASCII, no color); content
        untouched; maintainer note recommends future extraction (Marc-gated).
      * 7 help-desk: NEW procurement-help-desk-1c344a (SKILL.md 319 ln + references/TODO-network-gated-harvest.md);
        desc 985; SHARED-BLOCK byte-identical to process-navigator; 6 triggers; BOUNDARY present; network harvest =
        TODO w/ ZERO fabricated Lilly content. Suite now 33 *-1c344a dirs.
      ORIGINAL (superseded): [~] C/G  Stage 5a + Stage 6 + Stage 7 - RUNNING (workflow wv537smy2, 4 Sonnet agents):
      * 5a category-strategy SPLIT: byte-for-byte relocation of generic methodology (SHARP/SAP map, Kraljic,
        savings-classification, analysis-methodology) -> conditionally-loaded companions; dashboard JSX +
        11-tab spec + CS_1/2/3 pass-gates STAY inline; strict byte-diff-or-abort discipline (Stage-2 pattern).
      * 6a gate-checks: add missing G2/G8 gates to commercial-negotiation-prep (0->N), legal-negotiation-prep
        (1->~4), supplier-deep-dive; suite gate-pattern style.
      * 6b comment-cleanup: BOUND the higher-stakes "Finalize for Execution" job in-file (banner+separation);
        NO new skill (gated); agent recommends whether it warrants one.
      * 7 help-desk scaffold: NEW procurement-help-desk-1c344a (offline scaffold only; SHARED-BLOCK verbatim
        from sibling; live-fetch-first pattern; intent taxonomy; BOUNDARY vs process-navigator; network-gated
        content harvest = clearly-marked TODO, never fabricated).

## Governance-DEFERRED (flagged for Marc, NOT built autonomously - plan gates these)
- **decision-deck Stage-5 split + dead-content deletion:** master-plan says the retired-palette/font
  DELETION must be "called out to you explicitly before it happens," and the narrative-vs-PPTX split is a
  design-judgment call on a large consequential file. Sweep already fixed its content defects. RECOMMEND:
  do the split + delete the disclaimered retired blocks in a supervised pass. Left untouched tonight.
- **Stage-6 non-numeric decision kernels** (legal-negotiation-prep tier-tree, comment-cleanup audience-strip
  matrix, workflow-map roster cascade): plan marks these "recommend, don't build without sign-off." Flagged,
  not built. (comment-cleanup Finalize is bounded in-file per 6b; a full new skill for it is also flagged.)
- **help-desk new-skill vs extend-process-navigator:** plan wants Marc's call; built as a new SIBLING per the
  plan's own recommendation, with the fold-into-process-navigator alternative flagged in the scaffold.
- **#32 dashboard-as-code generators:** substantially satisfied by the JSX reference implementations + the 2
  real generators (rfp-engine lilly_rfx_template.js, pro-forma pro_forma_generator.py). Full generator-ify of
  every dashboard = large lower-value workstream; deferred.
- [ ] I  Dummy-data dashboard render per skill (Artifacts for review)
- [ ] J  master-plan reconcile + pre-packaging integrity sweep (all 26 skills)
- [ ] Stage 7 help-desk scaffold (network-gated content deferred)

## Packaging (final phase J) — Marc's spec
- ONE combined zip matching the original bundle format: drop into Claude Desktop, "install
  these skills" → a Save Skill card per skill.
- Each skill DIR → a .skill file (a zip of SKILL.md + all companions incl binaries).
- **CRITICAL:** keep every existing skill's EXACT name incl the `-1c344a` suffix — it is the
  update-match key (updates the correct installed skill, never a user's own). New proposal
  skills get their own name + the same `-1c344a` suffix. PCC keeps id theos-field-guide-1c344a
  (display-only rename).
- Zip root = all .skill files + README.md + INSTALL.md + branded user-manual .docx (NOT the
  docs/ tracker or master-plan). Update INSTALL.md/README for the new version + new skills +
  install order (brand-assets first, procurement-launcher second). Regenerate manifest hashes
  + the .docx. python zipfile (no git).

## Progress log
- 2026-07-21: All fixes done+verified (7 criticals, 46 highs, hygiene, Stage-4 tail). Recon +
  reconciliation + re-examination done → 80 buildable. Build wave 1 launched.
- 2026-07-22: Wave-1 dashboards (8) done+verified; category-strategy entity fix done (grep-clean).
  Wave-2 (10) building. MOCKUP PIPELINE PROVEN on category-strategy: self-contained HTML (React+
  Recharts inlined, no CDN, 636KB), browser-verified via Playwright (11 tabs render, 0 console
  errors, no entity artifacts). Reusable recipe: extract inlined JSX -> esbuild --bundle --minify
  --format=iife (reuse scratchpad/rendertest node_modules: esbuild/react18/recharts) -> inline in
  minimal HTML shell via a Node script (not Write, payload >600KB) -> Start-Process to open in
  browser. category-strategy.html opened. Mockups live under scratchpad/mockups/.

## OVERNIGHT RUN COMPLETE (2026-07-22)
Everything approved for the autonomous run is BUILT, VERIFIED, and PACKAGED. Deliverable:
`Lilly_Procurement_Skills_v10.6.6_July2026_Expansion.zip` (working-folder root, ~4.4 MB, 32
installable .skill + docs + manifest + clean docx + kernels reference folder).

Done: all criticals + ~46 highs + hygiene; medium/low sweep (116 fixed); 18 dashboards built +
23 browser mockups opened; 5 net-new skills + 6 adaptations; Personal Command Center rebuild
(data-object-first, Playwright-verified, opened); category-strategy modular split; gate-checks
(3 skills); comment-cleanup Finalize bounding; help-desk offline scaffold; Stage 8 THEO guided
orchestrator; README/INSTALL/manifest/docx regenerated; -1c344a suffixes preserved; post-package
integrity clean.

DEFERRED / flagged for Marc (in this file's "Governance-DEFERRED" section + master-plan): decision-
deck split + dead-content deletion; 3 non-numeric decision kernels; help-desk new-skill-vs-extend
decision; help-desk network-gated content harvest (needs Marc on the Lilly network); optional
per-skill doc/deck HTML previews for the 4 non-dashboard skills. #44 Handover = backlog (Cowork).

## Recovery
If resuming after a break: re-read this file + prune_data.json; check which phase boxes are
[~]/[ ]; check the latest workflow task output; back up before mutating; continue the order.
