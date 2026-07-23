# Platform-Fidelity Dashboard Consolidation — Master Tracker

**Started:** 2026-07-22 · **Owner:** Marc · **Repo:** github.com/cdaimvp1/claudeskills (branch `main`, commit + push after each unit)
**Status (2026-07-23):** Landscape dashboard DONE + Marc-approved + LOCKED INTO the skill (`supplier-landscape-1c344a/dashboard/` ships the deterministic engine; SKILL.md v3.0; commit 935427e). Next build = **Deal tab (P2), Marc's call to start there.** Audit of the non-dashboard skills complete (see PART G). Framing reaffirmed with Marc: skills STAY separate (analysis-core + renderers per A3.3); dashboards are hubs/renderers OVER them, never skill mergers.

This tracker is the source of truth for the dashboard-redesign / platform-consolidation effort. Read it top to bottom before resuming. The condensed cross-session version lives in memory (`project_lilly_skills_dashboard_redesign`); THIS file is the detailed one.

---

## PART A — ARCHITECTURE & PRINCIPLES (locked this session)

### A1. THE PIVOT — bundle the REAL platform render (supersedes hand-built look-alikes)
- **Do NOT re-implement the platform look by hand.** The platform's tabs are local, vanilla-JS, data-driven code. We BUNDLE the real code.
- Platform (READ-ONLY): `C:\Users\marcs\OneDrive\Desktop\lilly IT intake and orchestration tool`. Render stack: `assets/pv/pv-01-boot-helpers.js` … `pv-14`, `assets/pv/pv.css`, `assets/fonts-inline.css`, `assets/theo-color.css`; chrome generators `assets/app-shell.js` + `assets/theo-brand.js`.
- **`build_dashboard.py`** (per dashboard, in `_platform_build/`): inlines the needed `pv-*.js` + css + fonts + a small seed `landscape-data.js` + the platform chrome, boots to the target tab → ONE self-contained HTML (double-click, no network). Pixel-exact because it IS the platform code.
- **Runtime mode (Marc REQUIRED):** at skill runtime, the model emits ONLY a small `data.json` and runs the Python builder. Token-cheap, Sonnet-capable, no context blowout. The megabytes never enter the conversation.
- Verify: `node --check` on the JS asset; `smoke.cjs` = headless node-vm harness that calls `landscapeHTML()` for every subtab + deep-dive inner tab; grep for external refs; open in Marc's browser via PowerShell `Start-Process` (Playwright will NOT launch here).
- Landscape data contract: a `PROJECTS[key]` object w/ `requirements[]` + `riskDimensions[]` + `segmentation` + `landscape[]` (suppliers carrying `reqFit`/`risk`/`deepDive`/`riskPosture`). `PVSLE.reflect(input)` computes scores/heatmap/H2H/recommendation. Deps to inline for the Landscape tab: pv-01 + pv-07 (+ pv-04 for the `RFX` global, + 3 pv-14 helpers `jarg`/`escD`/`escapeHtmlPV`, + `infoHover`).

### A2. SKILLS → PLATFORM TABS (the consolidation)
The 24 dashboards are NOT 24 destinations — they collapse onto a handful of rich platform TABS, each bundled + enriched. **Skills stay separate; only the presentation layer (the tab) converges.**
- **Landscape tab** (pv-07) — project key `nimbus` = the "Cloud Data Warehouse" / "Analytics Workload Platform RFP" example. Hosts: supplier-landscape (+ supplier-deep-dive is the same tab's Deep Dive subtab).
- **Deal tab** (pv-11 deal-core + pv-12 deal-commercial + pv-13 deal-review-renew) — reference project key `acme` = **P-1042 "AI-powered employee-analytics platform"** (sole-source, Acme Analytics, $1.8M TCO). Hosts the CONVERGENCE of three separate skills as three lenses:
  - `lilly-contract-review` → **Legal Protection** lens
  - `scope-sow-architect` → **Scope Definition** lens
  - `pro-forma-builder` → **Deal Economics** lens
  - NOTE: pv-12 deal-commercial ALREADY has Pro-forma table, NPV, P&L, Sensitivity, Total cost (TCO), Escalation, Discount schedule, Pricing-model recommendation. So the pro-forma "missing cashflow/P&L/WACC" gap is already solved by the platform Deal tab; enrich only what's absent (e.g. an explicit WACC slider, the cost-component build-up).
- **RFx tab** (pv-09) — rfp-response-analysis, rfp-engine, rfp-case-manager (loosely).
- **My Work** (platform `my-work.html`) — personal-command-center (needs redesign).
- ~10 skills have NO exact platform page → rebuilt in the platform design language.

### A3. THREE OPERATING PRINCIPLES for converged dashboards (codify as one shared "Converged Dashboard Operating Rules" reference at Deal-tab time)
1. **Data Grounding & Fallback** (see A4) — never fabricate; ground-or-abstain.
2. **Materialized artifacts** — generate heavy LLM analysis ONCE, persist with provenance, recall fast. Never regenerate per view; never co-hold two big analyses in one context. The dashboard assembles deterministically from persisted artifacts. If context is tight → persist-and-continue, never degrade silently.
3. **Output-scoped execution** — the requested deliverable decides which stages of which skills run. Split every skill into an **analysis-core** (runs once → artifact) + **output-specific renderers**. A dashboard-only request runs the analysis core → artifact → Python builds the dashboard, and SKIPS the document deliverables (contract-review redline `.docx`, scope-sow SOW `.docx`, pro-forma `.xlsx`). Claude STATES what it runs vs skips. Ask the desired output only when ambiguous AND the wrong guess is expensive (one tappable picker).

### A4. DATA GROUNDING & FALLBACK PROTOCOL (Marc-requested; codify as shared reference + build the reusable gap-state component = the "labeled gap, never fabricated" badge)
- **Sourcing order:** user inputs → ARIA (Lilly-internal, deterministic-from-Fabric; provenance-labeled; still validate where cheap — a role-gated empty field means *unavailable*, not zero) → web research (source + date + confidence) → model inference (reason over grounded data only; never invent a fact).
- **Fallback ladder:** (1) source harder (re-read inputs, more ARIA, wider web) before declaring a gap; (2) ask the user ONCE, targeted/batched, naming what's missing + what it unblocks, offering provide / point-me-to-it / unavailable; (3) if still unavailable → graceful degradation to a LABELED gap state (show structure, "missing X · needed for Y", NEVER zero-fill [a dash ≠ zero ≠ verified-Low], block dependent computed metrics, drop + label confidence on dependent conclusions); (4) degrade scope, not truth (render what the present inputs support, mark the rest as gaps).
- **Per-panel gap rendering:** quantitative → unknown cells marked, never zero-filled; financial models → unknown driver = user-set slider with a labeled default assumption, not a fake value; ranking → rank only what's scored, list what couldn't be assessed; narrative → state known, flag unknown, no filler.
- **Hard guardrails / tripwire:** every value = provenance (source+date) OR explicit "estimate/illustrative" label + method — no unmarked numbers. Distinguish Observed / Inferred / Missing. Signal confidence (H/M/L). Abstain rather than guess on compliance/legal/financial exposure.
- Layers on existing suite mechanisms: confidence signaling, the NEEDS_INPUT / RESEARCH_PENDING / NOT_APPLICABLE banners, and the ARIA provenance labels.

### A5. CONTRACT-REVIEW CLAUSE-ANALYSIS ENHANCEMENT (Marc: yes, do at Deal-tab phase)
Formalize a **hybrid** pipeline (the researched best design; more accurate + auditable + scalable than a whole-doc LLM read on a 50+ page contract):
1. **Deterministic ingestion + segmentation (Python):** parse docx/PDF preserving structure, detect the document family + governing stack, split into an addressable **clause inventory** with stable IDs + **source spans** (page/line), resolve defined terms, build the cross-reference graph.
2. **Per-clause semantic classification + parameter extraction (LLM, bounded, high recall):** classify each clause's type + pull its parameters as many small focused calls, not one long pass. A required-clause **checklist** drives missing-clause detection.
3. **Deterministic playbook rules (Python):** rules judge the extracted parameters against the playbook (LoL ≥ 2× fees, Net-45, TfC exists, MSA flow-down). LLM extracts the fact; the RULE makes the call.
4. **LLM only for generative/ambiguous parts (bounded):** redline drafting to fallback language, rationale narratives, span-cited — never "read all 50 pages and opine."
5. **Verification pass:** every clause classified, every required type checked, every finding span-cited, low-confidence flagged.
- Model: CUAD-style clause classification. Decision-SUPPORT (surface + cite; human lawyer decides), never autonomous redlining.
- `lilly-contract-review` is already partway there (governing-doc discovery, three-layer analysis, Contract Stack Mapper, `unpack.py` docx read). The upgrade = formalize steps 1–3 + the extract-facts/judge-by-rules split.
- **Re-paper SOW onto Lilly template under the executed MSA** = a capability GAP today (contract-review marks up their paper; scope-sow rebuilds scope; nobody re-papers). Park as a contract-review ADDITION (NOT a skill merge). A SOW under an executed MSA should be a thin scope-and-commercials exhibit that lets the MSA govern liability/IP/data/termination. Output `.docx`.

---

## PART B — ROSTER DECISIONS (Marc, 2026-07-22)

### B1. CUT (delete skill + strip all references; git-recoverable) — BATCH PENDING Marc's go
- **decision-deck** — Marc could never get it to work well; trash it. ~14 refs to strip: launcher registry + `routing-and-chains.md` + `teach-mode.md` + `theo-widget.html`, `INSTALL.md`, `_BASELINE_MANIFEST.md`, and "hands off to decision-deck" cross-refs in ~12 other skills' SKILL.md. (Deck output need is covered by sole-source's PPTX option.)
- **procurement-options-analysis** — the 10-path buy-vs-build scorer; path is usually already known, overlaps intake/triage. Same reference-cleanup scope.
- After cut: fix the launcher skill count; repackage.

### B2. DOC-GENERATORS (become M365 files, NOT dashboards)
- **pro-forma-builder** → Excel `.xlsx` (its model also surfaces as the Deal-tab Economics lens; Excel is the export).
- **executive-summary-package** → Word `.docx` (leadership one-pager, wrong as a dashboard).
- **sole-source-challenge** → TWO output options: PowerPoint `.pptx` deck OR Word `.docx` (user picks).

### B3. KEEP as dashboards
- **negotiation-simulator** (maps to platform `negotiation-practice.html`; interactive practice).
- **personal-command-center** (maps to My Work; **needs a redesign pass**).
- **rfp-case-manager** (status/tracker; loosely → rfx-portfolio).

### B4. STAY SEPARATE SKILLS → converge on Deal tab (see A2)
- lilly-contract-review, scope-sow-architect, pro-forma-builder. NOT merged. contract-review is the biggest skill; NOT modified this session.

### B5. Net roster
~18 genuine dashboards + ~6 doc-generators; 2 skills retired (decision-deck, procurement-options-analysis).

### B6. Full 24-dashboard mapping
| # | Dashboard | Disposition |
|---|---|---|
| 1 | supplier-landscape | Platform Landscape tab (DONE, iterating) |
| 2 | supplier-deep-dive | Landscape tab → Deep Dive subtab |
| 3 | category-strategy | Platform category-strategy page |
| 4 | commercial-negotiation-prep | Platform commercial-negotiation page |
| 5 | lilly-contract-review | Deal tab — Legal Protection lens |
| 6 | pro-forma-builder | Deal tab — Deal Economics lens + Excel export |
| 7 | rfp-response-analysis | RFx tab |
| 8 | rfp-case-manager | RFx / rfx-portfolio (keep) |
| 9 | evaluation-engine | Platform evaluation page |
| 10 | decision-deck | CUT |
| 11 | should-cost-builder | Platform should-cost page |
| 12 | market-rate-benchmarking | Platform market-rate page |
| 13 | negotiation-simulator | Platform negotiation-practice (keep) |
| 14 | timeline-builder | Platform timeline-builder page |
| 15 | meeting-prep-brief | Platform meeting-prep-brief page |
| 16 | legal-negotiation-prep | Platform legal-negotiation page |
| 17 | process-navigator | Platform process-navigator page |
| 18 | scope-sow-architect | Deal tab — Scope Definition lens + SOW .docx |
| 19 | sole-source-challenge | DOC → PPTX or Word |
| 20 | procurement-options-analysis | CUT |
| 21 | invoice-rate-card-auditor | (map to platform; TBD) |
| 22 | deal-room | Deal tab area |
| 23 | executive-summary-package | DOC → Word |
| 24 | personal-command-center | My Work (redesign) |

---

## PART C — LANDSCAPE BUILD STATE

### C1. DONE (2 rounds + enrichment; committed + pushed)
- **Bundle:** self-contained `_platform_build/supplier-landscape-PLATFORM.html` (~3MB) from real pv-01/pv-07 + deps + pv.css + theo-color + fonts + seed. All 4 subtabs + 5 deep-dive inner tabs render (smoke green).
- **Chrome/header (final):** LEFT = black Lilly logo + "Theo" (Sacramento) + `theo-dino-mark.png` dino right-of-Theo (recolors in dark). RIGHT = neutral user ICON + dynamic name (`--user`, default "Procurement User"); NO tasks/notifications/view-as. Body = title block (eyebrow "Supplier Landscape Search" + `<h1>` subject via `--subject`) atop padded `.sa-main` (max-width column) + platform footer + scroll unlock.
- **Round-2 UI:** FIXED `infoHover` ReferenceError (had silently broken Lilly Fit + Requirements Fit deep-dive tabs); enabled native `recrat` rationale + `recNext` "Gate to clear" band; grounded methodology/provenance strip; "Eliminated before the shortlist" card; segmentation Fit/Risk sliders (live re-bucket) + incumbent dashed-ring + brightened quadrant fills; deep-dive subtabs restyled grey / active-black-text + black underline (matching main tabs) + each subtab split into accent-colored panels + offering→requirement tie chips; Requirements Heatmap & Risk per-category/per-dimension SINGLE-OPEN accordions + two-column (rationale left / decision-read + risk-posture right).
- **Data enrichment:** 7 fictional vendors → **Snowflake / Databricks / Redshift / BigQuery / Fabric-Synapse / ClickHouse / Firebolt**, real web-sourced identity/financials/riskPosture + **35 sourced recentIssues** (source+date+confidence). Illustrative numeric scores **byte-identical / untouched**.

### C2. PENDING — Landscape Phase-2 (deep-dive redesign) — the next build
- Merge **Company Snapshot + Corporate Identity + Key Attributes** into one; condense panels to sit **side-by-side**.
- **Deepen** the thin panels with the real data + better visuals: Market Presence & History, Roadmap & Vision, Offering Profile, and especially **Market & Financials** (real financial visuals — revenue trend, funding, margins; SEC/D&B/Bloomberg-style depth).
- **Redesign the "Must-have watch / knockout requirements"** from the ugly repetitive ⚠ list into a clean **knockout MATRIX** (at-risk vendors × must-haves, red-shaded cells).
- Surface the **recentIssues** (lawsuits / cyber / financial distress) in the **Risk Assessment risk-posture** panel.
- **Narrative reconciliation** = PARKED (Marc: not needed now). The ~250 per-req/per-risk sub-narratives still carry original illustrative wording (most visible Fabric/Synapse); keep scores, label illustrative if/when revisited.
- Exec Summary refinements still to apply (from Marc's batch): merge "Eliminated before the shortlist" INTO the Recommendation table (divider row after last-ranked, then eliminated rows = name + reason only, no scores); remove the filler rationale sentence; **remove the Start-an-RFx button** (a static dashboard can't trigger a skill); replace the "Shortlist to advance" sentence with **shading** of shortlisted rows/dots (keep #1 as-is); NO weighted-score column (Composite already is it); Segmentation sliders must **move the axes / resize the quadrants** (currently only re-buckets dots).

---

## PART D — BUILD / DESIGN LIST (prioritized)

**P0 — finish Landscape (Marc validating visually first):**
1. Landscape Phase-2 deep-dive redesign (C2): panel merges + condense side-by-side + deepen w/ real financial visuals + must-have knockout matrix + recentIssues in risk posture.
2. Apply the remaining Exec Summary refinements (C2 last bullet).
3. Marc visual sign-off → freeze the Landscape exemplar as the template.

**P1 — roster cleanup (independent; Marc's go pending):**
4. CUT decision-deck + procurement-options-analysis (delete dirs + strip ~14 refs each + fix count + repackage).

**P2 — Deal tab (the big consolidation; reference project `acme`/P-1042):**
5. Map the platform Deal tab (pv-11/12/13) sub-tabs + components (like the Landscape map).
6. Bundle the Deal tab self-contained via `build_dashboard.py` pointed at `acme`.
7. Converge the 3 lenses (contract-review Legal Protection, scope-sow Scope Definition, pro-forma Deal Economics); enrich only what pv-12 lacks (WACC slider, cost-component build-up).
8. Codify the **Converged Dashboard Operating Rules** reference (grounding + materialized artifacts + output-scoped execution) + build the reusable **gap-state component**.
9. contract-review clause-analysis enhancement (A5): parser + clause-inventory schema (IDs + spans) + missing-clause checklist + extract/judge split. Park re-paper-to-Lilly-SOW.

**P3 — doc-generators (M365-native):**
10. pro-forma → Excel `.xlsx`; executive-summary-package → Word `.docx`; sole-source-challenge → PPTX or Word.

**P4 — remaining dashboards:**
11. Roll the bundle-the-platform-tab process across the other dashboards per the B6 mapping.
12. PCC redesign (→ platform My Work).

**P5 — package:**
13. Re-integrity sweep + re-package the installable `.skill` zip (preserve the `-1c344a` suffix).

---

## PART E — REFERENCE

- **Folders:** `_platform_build/` = real-render bundles (Landscape done). `_dashboards_ORIGINAL/` = the 24 pristine CURRENT dashboards (pre-redesign reference). `_canonical_originals/` = v10.0 React canonical designs rendered self-contained offline (`build_selfcontained.cjs`; babel build-time-only, gitignored). True originals: `C:\Users\marcs\OneDrive\Desktop\claude skills\` (all-skills-export May 7 + updated/ v10.0).
- **Git:** remote github.com/cdaimvp1/claudeskills, branch main; `GIT_TERMINAL_PROMPT=0 git push` works; commit+push after each unit; core.autocrlf=false; transient DNS fail → just retry push.
- **GOTCHAS:** (1) Playwright/browser won't launch here → verify structurally (node --check + node-vm render harness) + open in Marc's browser via `Start-Process`. (2) unpkg reachable from build env but BLOCKED in Marc's browser → preview harnesses must be self-contained (inline UMD + pre-transpile JSX), never CDN. (3) Prompt-injection seen → harden every build agent w/ an anti-injection clause; platform dir READ-ONLY (copy-from only). (4) CSS integrity: verify `<style>` `/*`==`*/` balance AND `:root{` survives comment-stripping. (5) Ultracode ON → Workflow for big builds; edit the single pv-07 file in SEQUENTIAL stages (parallel edits collide) + adversarial-verify; Sonnet for stages. (6) Workflow scripts: no backticks inside prompt strings; Date.now/Math.random blocked.

---

## PART G — NON-DASHBOARD SKILL AUDIT (2026-07-23) + P3 GENERATOR STATE

The MATH is already deterministic almost everywhere (`numeric_kernel.py` vendored into ~10 skills as a HARD RULE + siblings `tier_kernel`/`timeline_engine`/`audience_kernel`/`frap_chain_kernel`/`roster_kernel`). The missing half is deterministic FILE GENERATION.

- **Only pro-forma is end-to-end optimized:** `pro_forma_generator.py` (~1150 lines, openpyxl, real formulas + invariant checks) computes via the kernel AND emits the `.xlsx`. This is the P3 template. (Task #81 "convert pro-forma to xlsx" is effectively DONE.)
- **File-generator gap (kernel math, no code-generated file):** should-cost (xlsx), market-rate (xlsx), executive-summary (docx, #82), sole-source (pptx/docx, #83), evaluation-engine (docx, worst: 30-40pg truncation risk), rfp-response-analysis (docx, same), scope-sow (docx), commercial-neg (docx/xlsx). Each is a real ~pro-forma-sized build, not a batch one-shot. Libs confirmed available here (openpyxl 3.1.5, python-docx, python-pptx).
- **CORRECTNESS FLAG — contract-review Protection Score:** the audit said "wire it to `weighted_score()`" but that is MIS-DIAGNOSED — the Protection Score is a DEDUCTION model (start 100, subtract severity x coverage-column deductions, hard-stops not reduced), NOT a weighted average, so `weighted_score()` is the wrong shape. Rule 12 already MANDATES a deterministic, auditable, reproducible calculation table via `references/risk-scoring.md`. Real enhancement = a deterministic `deduction_score()` kernel fn; but contract-review is the sensitive skill we agreed NOT to casually modify (B4). HOLD for explicit Marc go.
- **playbook-learning:** the one data skill with no kernel (acceptance rate / win-loss / difficulty in prose). Add aggregate-stats fns to the CANONICAL `lilly-procurement-kernels/numeric_kernel.py` then re-vendor (shared-infra change, do carefully). numeric_kernel's own gap list also: ROI/payback/waterfall, sensitivity/perturbation, correlated-drivers.
- **Front door:** `procurement-launcher` = competent single-hop router (trigger table + widget + chains). Marc's INTENT = a conversational INTAKE that diagnoses need + kicks off the skill on confirm. Gaps: routing lives in 4-5 hand-synced files (→ JSON manifest source-of-truth); help-desk inert v0.1; no cross-session journey state. Do after hubs land.

## PART F — OPEN / PENDING MARC DECISIONS
- Marc's **visual sign-off** on the Landscape exemplar (gates the rollout).
- **Go** to run the roster-cut batch (B1).
- invoice-rate-card-auditor platform mapping (B6 #21) — TBD.
- Anything Marc flags on the enriched Landscape design review (in progress).
