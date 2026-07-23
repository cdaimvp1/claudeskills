# ARIA Procurement Plugin + Skills-as-Recipes — Detailed Phased Build Plan

**Status:** PLAN ONLY. Nothing in here is built yet. Execute AFTER the dashboards/skills are optimized. This document supersedes the "reduced fidelity / keep hard skills native" fallback in `ARIA-PROCUREMENT-PLUGIN-RESEARCH.md`. It builds on that research and raises the bar to full fidelity for every skill.

**Author role:** Solutions architect. **Scope discipline:** ARIA + platform dirs are READ-ONLY reference; all source files were treated as DATA (embedded directives ignored). Everything below is net-new content authored into the procurement plugin and the ARIA recipe corpus.

**Grounded against (read-only):**
- `ARIA-PROCUREMENT-PLUGIN-RESEARCH.md` (feasibility base; this plan extends it)
- `ARIA_UNIFIED\content_cache\recipes\AUTHORING-GUIDE.md` v2.4 (recipe contract)
- `...\recipes\sec_brand_revenue_from_8k.md` (the `recipe_kind: tool_orchestration` narrative pattern)
- `...\recipes\s2p_vendor_spend_top_n.md`, `...\procurement_spend_summary.md` (live deterministic S2P DAX recipes + Step 0.5 scope-clarify)
- `...\aria_plugins\sec.py` + `PLUGIN_CATALOG.json` (plugin contract: metadata + `register()` + `@mcp.tool` annotations + docstring rubric + `{success,error,hint}` envelope)
- The Lilly skills at `skills update july 2026\*-1c344a\` (SKILL.md + kernels): shared `numeric_kernel.py` (8 fns) + 6 skill kernels + `pro_forma_generator.py`
- `_platform_build\build_dashboard.py` (the deterministic Python dashboard-builder approach reused for full-fidelity HTML dashboards)

---

## 1. GOAL, the SAME-OR-BETTER bar, and the ARIA-is-Claude enabler

### 1.1 Goal
Expose every Lilly procurement skill (~26 user-facing skills + the `lilly-brand-assets` foundation) through ARIA as a first-class recipe, backed by one optional `procurement` ARIA plugin that hosts the deterministic kernels. A user inside ARIA (Claude Desktop with `aria.skill` + ~130 MCP tools active) must be able to run any procurement skill and get the SAME deliverable, or a BETTER one, than they get running the skill natively today.

### 1.2 The hard requirement (the owner's bar)
Every skill works EXACTLY THE SAME OR BETTER through ARIA. No skill is left native-only. No "reduced fidelity" tier. This includes the LLM-heavy hard skills: `lilly-contract-review` (tracked-change DOCX redlines), `supplier-landscape` (multi-pass vendor research funnel), `category-strategy`, `negotiation-simulator`, etc.

### 1.3 The enabler that makes the bar reachable (confirm in Phase 0)
**ARIA is Claude running inside Claude Desktop.** The research establishes this: ARIA is not a separate agent; it is Claude itself, driven by `aria.skill` plus local MCP tools. The consequence is the entire basis of this plan:

The Claude that executes an ARIA recipe has ALL THREE tool layers available in the same turn:
- **(a) SAME LLM reasoning** the native skill relies on (the skills are prompt-and-methodology, executed by Claude; ARIA is the same Claude).
- **(b) SAME Claude Desktop NATIVE tools** the skills use today: `create_file`, `web_search` / `web_fetch`, code execution, artifact/dashboard rendering, DOCX read (`unpack.py`) and DOCX write (`<w:ins>` / `<w:del>` tracked changes), XLSX creation, `ask_user_input_v0` widgets.
- **(c) ARIA's ~130 deterministic MCP tools** (`aria_fabric_*` spend/vendor, `aria_sec_*` public filings, `aria_sac_*`, `aria_forecast_*`, Canon metadata grounding) PLUS the new `aria_procurement_*` kernel tools.

The research's "reduced fidelity" verdict was conditional: it only held IF a recipe could call ONLY ARIA MCP tools. It cannot be restricted that way. A recipe body is prose that the same Claude Desktop Claude reads and acts on; that Claude keeps its native tool belt. The `sec_brand_revenue_from_8k` recipe already proves narrative orchestration ("call these 3 tools in sequence, bind step N into step N+1"); the Step 0.5 pattern already proves recipes drive a NON-aria client tool (`ask_user_input_v0`). Extending the same prose to also say "run the web-research funnel with `web_fetch`, then write the DOCX redline with the docx tools" is the same mechanism, not a new one. **That closes the fidelity gap.**

### 1.4 What "SAME" and "BETTER" mean, per skill class

| Skill class | SAME (must hold) | BETTER (ARIA adds) |
|---|---|---|
| **Kernel-backed numeric (B)** — should-cost, market-rate, invoice-audit, pro-forma, evaluation-engine, timeline, workflow-map, legal-prep, exec-summary, comment-cleanup, and the numeric spine of commercial-prep/deal-room/rfp-response/scope-sow/sole-source | Run the full SKILL.md methodology; produce the real deliverable (dashboard/XLSX/DOCX/tables) with identical structure | Arithmetic executes in a **tested, refusal-based kernel tool** instead of LLM-authored JSX/prose math (independently verifiable, not generated JS); optional Fabric spend + SEC grounding replaces user-recalled inputs |
| **Hard LLM-judgment (C)** — supplier-landscape, lilly-contract-review, category-strategy, negotiation-simulator, rfp-engine, rfp-case-manager, supplier-deep-dive, theos-field-guide, procurement-launcher, negotiation-playbook-learning | Run the identical gate discipline (G1-G10, research minimums, pass artifacts) as recipe steps; produce the identical native deliverable (redlined DOCX, 8,000-word landscape report + dashboard, deck) via native tools | Real Lilly internal grounding: incumbency/spend/payment-terms from Fabric, financial-health from SEC EDGAR, forecast from `aria_forecast_*`, all provenance-labeled; numeric sub-steps kernel-verified |
| **Pure-recipe chat (A)** — procurement-help-desk, process-navigator, meeting-prep-brief, voice-profile | Identical structured, cited answer; the help-desk prompt-injection guard preserved verbatim | Canon-grounded citations; live spend/policy lookups where relevant |
| **Free-today** — spend/vendor/PO analytics | Already live as `procurement_spend_summary`, `s2p_vendor_spend_top_n`, `s2p_open_po_aging` | n/a (baseline) |

**Fidelity is defined per skill as a checklist**: same deliverable file type(s), same fixed skeleton/sections/tabs (the suite's HARD RULE 8 deterministic-skeleton), same depth minimums (e.g. landscape's 8,000-word / min-search floors), same guardrails enforced, same provenance discipline. A recipe is "done" only when its Pre-Delivery Validation Matrix asserts each of these against a canonical run.

---

## 2. ARCHITECTURE

### 2.1 Shape (locked by ARIA's primitives)
**One optional `procurement` plugin (deterministic tool surface) + one recipe per skill (orchestration).** This mirrors `sec.py` + the `sec_*` recipes exactly and is the only shape ARIA supports: plugins are tools, recipes are Canon content. There is no first-class "recipe registry" a plugin declares. Confirmed against `PLUGIN_CATALOG.json` (plugins list tools) and the recipes dir (recipes are standalone `.md`).

### 2.2 The `procurement` plugin — `plugins/procurement.py`

**Metadata block** (per `sec.py` L63-87):
```
PLUGIN_NAME = "procurement"
PLUGIN_VERSION = "1.0.0"
PLUGIN_MIN_ARIA = "17.0.0"
PLUGIN_AUTHOR = "<owner>@lilly.com"
PLUGIN_DESCRIPTION = "Lilly procurement kernels: normalization, verification, rollups, decision tables, pro-forma XLSX, dashboard builder — deterministic math + deterministic deliverable assembly for the procurement skill recipes."
PLUGIN_DEPENDENCIES = []          # stdlib only for kernel math; openpyxl reused from Fabric tier for XLSX
PLUGIN_REQUIRED_FUNCTION = None   # available to all; vendor-master attrs gated at the DATA layer, not the tool
PLUGIN_TRUST_TIER = "beta"        # promote to "stable" after harness sweep
PLUGIN_TOOLS = [ ... every registered @mcp.tool ... ]
```
`register(mcp, conn_manager)` registers each capability as an `@mcp.tool`-decorated closure named `aria_procurement_<verb>`, with the standard 4-key annotation block **`readOnlyHint: True, destructiveHint: False, idempotentHint: True, openWorldHint: False`** on every tool (reflect-don't-enforce / not-SoR lock), the fixed docstring rubric (keyword header line → prose → Args → Returns envelope → WHEN TO USE → WORKFLOW Before/After/Instead → GOTCHAS), and a `try/except` body returning `{"success": bool, ...}` with `hint` + ranked `suggested_*` on failure. Large tabular returns use byte-budget shaping + the Parquet-cache-plus-receipt pattern (the natural home for the skills' existing `*_handoff.json`).

**Tool inventory (exact, from the on-disk kernels):**

*Shared numeric kernel (8 tools) — `lilly-procurement-kernels-1c344a/numeric_kernel.py`, vendored byte-identical into 10 skills:*
| Tool | Kernel fn | Refusal semantics |
|---|---|---|
| `aria_procurement_to_hourly` | `to_hourly(value, unit)` | `UnknownUnitError` on non hour/day/week/month/year |
| `aria_procurement_convert_currency` | `convert_currency(value, currency, fx_table)` | `UnknownCurrencyError` (never invents FX) |
| `aria_procurement_percentile_gate` | `percentile_gate(n_points, min_points=5)` | N<5 withholds percentile band |
| `aria_procurement_verify_line_math` | `verify_line_math(rate, hours, stated_total, tol)` | boolean rate×hours check |
| `aria_procurement_escalate` | `escalate(base, rate, year, compounding)` | `InvalidInputError` on year<1 |
| `aria_procurement_weighted_score` | `weighted_score(scores, weights, tol=0.001)` | `WeightSumError` if weights ≠ 1.0 |
| `aria_procurement_npv` | `npv(cashflows, discount_rate)` | end-of-year Y1 discounting |
| `aria_procurement_quadrature_rollup` | `quadrature_rollup(bases, spreads_low, spreads_high, conf_flags)` | RSS + >15% LOW-confidence widening; returns `QuadratureResult` (base, low, high, widened, naive envelope) |

*Six skill-specific kernel tools:*
| Tool | Source kernel | Purpose |
|---|---|---|
| `aria_procurement_assign_tier` | `legal-negotiation-prep/tier_kernel.py` → `assign_tier(TermAttrs)` | negotiation-term tiering; abstains on missing attrs |
| `aria_procurement_compute_chain` | `executive-summary-package/frap_chain_kernel.py` → `compute_chain(Facts)` | FRAP approval-chain resolution; refuses on ambiguous grade/ceiling |
| `aria_procurement_comment_action` | `comment-cleanup/audience_kernel.py` → `strip_action` / `finalize_comment_action` / `redline_finalize_action` / `mode_action` | comment/redline strip + finalize decisions by audience/scope |
| `aria_procurement_complexity_score` | `timeline-builder/timeline_engine.py` → `compute_complexity_score` / `compute_timeline` / `derive_domain_scale_factor` | sourcing-timeline complexity + LBH schedule rollup |
| `aria_procurement_classify_roster` | `workflow-map/roster_kernel.py` → `classify_roster(...)` | internal / supplier / third-party participant classification by email domain |
| `aria_procurement_generate_pro_forma` | `pro-forma-builder/pro_forma_generator.py` → `generate_pro_forma_workbook(register, out_path)` | full multi-sheet XLSX with Python-vs-formula reconciliation + invariant checks (openpyxl) |

*One deterministic deliverable-assembly tool (net-new, the fidelity multiplier for dashboards):*
| Tool | Basis | Purpose |
|---|---|---|
| `aria_procurement_build_dashboard` | the `_platform_build/build_dashboard.py` mechanical-assembly approach | takes a validated skill data object + a canonical template id, emits a self-contained HTML dashboard file (no hand-written CSS; deterministic concatenation of authentic tokens). Returns the file path for native rendering. Replaces LLM-authored JSX with a builder call. |

> Note on `PLUGIN_TOOLS` vs catalog: catalog drift is tolerated by design (the shipped `sec` catalog lists 3 tools while `sec.py` registers 10). Treat in-module `PLUGIN_TOOLS` + decorators as truth; the catalog is an installer/advertising manifest.

### 2.3 The recipe layer — how a recipe carries the SKILL.md methodology as executable prose

Every skill maps to one recipe `.md` in `content_cache/recipes/`. Because `aria_pull`'s executor supports only `{fabric_dax, fabric_measure, cache_query}` as auto-executed `plan:` steps, and every `aria_procurement_*` tool is a "deferred kind," **all procurement recipes are `recipe_kind: tool_orchestration`** (drop the machine `plan:` block for the procurement steps; keep a `plan:` ONLY for the deterministic Fabric grounding pulls that qualify). The body is the load-bearing surface (AUTHORING-GUIDE v2.4 "recipe body > rule summary": recipe bodies are read in FULL, un-truncated).

A recipe body is the skill's SKILL.md methodology re-expressed as a numbered, executable tool-orchestration plan across the three layers:

```
Step 0    Auth-precheck (multi-source recipes; per AUTHORING-GUIDE v2.2)
Step 0.5  Scope / mode clarify widget via ask_user_input_v0 (native), where the skill asks a mode question
Layer A   GROUND (ARIA data): aria_fabric_* spend/vendor/incumbency; aria_sec_* financials; aria_forecast_*; Canon
Layer B   RESEARCH + JUDGE (native Claude tools): web_search/web_fetch funnel; unpack.py to read DOCX; the
          skill's classification/scoring/gate reasoning (G1-G10 re-expressed as explicit steps + pass artifacts)
Layer C   COMPUTE (ARIA kernels): aria_procurement_* for every arithmetic/decision-table sub-step (the skills'
          HARD RULE "no model arithmetic" is satisfied by a kernel call, not LLM math)
Layer D   PRODUCE (native + plugin): create_file for the DOCX/deck; aria_procurement_generate_pro_forma for XLSX;
          aria_procurement_build_dashboard for the HTML dashboard; native docx tools for tracked-change redlines
Output    the real deliverable file(s), provenance-labeled, plus a markdown summary in-chat
```

The recipe frontmatter declares `applies_to_sources` (`procurement_plugin` + any Fabric/SEC source), typed `parameters:`, `discovery_keywords:`, reused `related_canon_rules:` (the S2P gotchas), `canonical_params:`, and mixed `harness_assertions:` (deterministic `row_count_min`/`cell_match` for the Fabric-grounded numbers; behavior-anchored `content_includes` / `follow_up_appropriate` / `decompose_correctly` for the narrative + native-deliverable half).

---

## 3. DELIVERABLE FIDELITY — how each deliverable type is produced through ARIA at full fidelity

The skills emit five deliverable families. Each is produced through the same native tool the skill uses today, orchestrated by the recipe body, with kernel/data grounding layered in. None is degraded to "markdown only."

**1. Self-contained HTML dashboards** (supplier-landscape, contract-review 3-panel, pro-forma, should-cost, evaluation-engine, etc.)
Two paths, both full-fidelity:
- **Preferred (BETTER):** the recipe builds the complete skill data object (per the skill's G5 "data model first"), calls `aria_procurement_build_dashboard(data_object, template_id)` which mechanically assembles a self-contained HTML file from authentic platform tokens (the `build_dashboard.py` approach — no hand-written CSS, deterministic concatenation), and the file renders natively. This is a correctness UPGRADE: the headline "weighted score" comes from `aria_procurement_weighted_score` (an executed function), not from LLM-authored JSX arithmetic that cannot be verified.
- **Parity (SAME):** where a skill's dashboard is a locked canonical JSX (each skill ships its own `references/dashboard-canonical.md` + example JSX), the recipe follows G5/G10 and emits the JSX via `create_file` exactly as native, cloning the canonical and swapping the data — identical to today. The kernel-computed values are injected into the data object first.
The locked skeleton (HARD RULE 8: every canonical tab always renders, labeled states for RESEARCH PENDING / NOT APPLICABLE) is preserved because the recipe carries the canonical tab map as prose and the builder/JSX is the same artifact.

**2. DOCX tracked-change redlines** (lilly-contract-review, comment-cleanup)
Produced with the SAME native DOCX tools the skill uses today, driven by the recipe:
- **Read:** `unpack.py` to read `word/comments.xml` and the `<w:ins>` / `<w:del>` / `<w:commentRangeStart>` elements (skill guardrail G1). The recipe's Step-1 prose mandates this over `extract-text`.
- **Reason:** the playbook logic (General MPT Playbook §refs, Hard Stop detection, combined-protection scoring, persona tone matrix, order-of-precedence resolver) runs as recipe steps; the Protection Score arithmetic routes through `aria_procurement_*` where it is numeric (Rule 11 volume math, Rule 12 deduction footing).
- **Write:** native docx write emits the tracked changes + comments (`<w:ins>` / `<w:del>` / comment ranges) into the marked-up DOCX. The comment-cleanup strip/finalize decisions come from `aria_procurement_comment_action` (deterministic), then native docx applies them.
Output is byte-for-byte the same class of artifact a rep sends to a supplier.

**3. XLSX workbooks** (pro-forma-builder, and any pricing workbook)
`aria_procurement_generate_pro_forma(register, out_path)` runs the full `generate_pro_forma_workbook` path: validates the Assumptions register, computes ground truth, runs the hardcoded invariant checks + Python-vs-formula reconciliation, and writes the multi-sheet workbook via openpyxl. This is the MOST mechanized deliverable and ports at strictly-equal-or-better fidelity (the reconciliation guarantees the workbook's live formulas match the kernel numbers). openpyxl is reused from the already-installed Fabric/pandas tier — no new venv weight.

**4. Decks / DOCX reports** (category-strategy, executive-summary-package, supplier-landscape 8,000-word report, meeting-prep)
Native `create_file` for the DOCX/PPTX, driven by the recipe carrying the skill's fixed section skeleton + depth minimums + house-style references (`lilly-brand-assets` Magazine Report / docx-design-system). The frap approval chain in exec-summary routes through `aria_procurement_compute_chain`. Depth parity is enforced by re-expressing the skill's word/section minimums as recipe pass artifacts and behavior-anchored harness assertions.

**5. Markdown / tables / cited chat answers** (help-desk, process-navigator, spend analytics)
Native markdown composition, Canon-grounded, provenance-labeled. Already the native ARIA output contract.

---

## 4. HARD-SKILL FIDELITY — per-skill mechanism (the ~9-10 C-class skills), all at FULL fidelity

Each hard skill gets a concrete recipe mechanism that reaches full fidelity by co-orchestrating native tools + ARIA data + kernels. None is "reduced."

**supplier-landscape** (multi-pass vendor research funnel, no kernel today)
Recipe encodes the enforced two-phase methodology as explicit pass-artifact steps: `SL_1_BROADSCAN` (native `web_search` ≥3 broad searches → 10-15 candidate universe, present for confirmation), `SL_2_DEEPDIVE` (native `web_search` + `web_fetch` ≥5 searches/full-page-reads per top-5 vendor, financials/product/pharma-clients/pricing/integration), `SL_3_SCORING` (the 8-pillar weighted matrix via `aria_procurement_weighted_score` — a correctness upgrade over the skill's derived-in-JSX score), `SL_4_REPORT` (native `create_file` DOCX + `aria_procurement_build_dashboard` for the 5-tab locked dashboard + CSVs). ARIA GROUNDING adds the "Active at Lilly" line per profile (Fabric vendor-master incumbency/spend/terms, role-gated FGL__00605) and SEC financial-health per public name. Research minimums (G7) and pass-artifact enforcement (G8) become `decompose_correctly` + `follow_up_appropriate` + `content_includes` harness assertions checking the research-completeness block and the 8,000-word floor. **Fidelity: same report + same dashboard + more grounding.**

**lilly-contract-review** (tracked-change DOCX redline + playbook + persona)
Mechanism in §3.2. The full three-layer analysis (governing-document discovery, commercial terms, protection-gap), four passes (PASS_1_STRUCTURE → PASS_4_PREP), Hard Stop detection, the 5-persona tone matrix, order-of-precedence resolver, and combined-protection Protection Score all run as recipe steps. Numeric sub-steps (Rule 11 volume exposure, Rule 12 deduction footing, line-item math) route through kernel tools. Native `unpack.py` reads the change layer; native docx write emits the redline. The findings ledger `.json` and 3-panel dashboard are emitted per the locked `dashboard-canonical.md` v3.2. **Fidelity: same redlined DOCX + same dashboard + same ledger; ARIA adds counterparty spend/risk context to the commercial panel only (legal + redline passes explicitly unchanged, per the skill's own ARIA-enrichment spec).**

**category-strategy** — recipe carries the split category-strategy methodology as sectioned deck/DOCX steps; grounds spend baseline + supplier concentration from Fabric (`s2p_vendor_spend_top_n` shape); native `create_file` deck. Kernel: `aria_procurement_weighted_score` for any scored prioritization.

**negotiation-simulator / negotiation-playbook-learning** — recipe runs the simulation/learning-tail as narrative with `follow_up_patterns` (the interrogate-the-answer discipline); ZOPA/counter math routes through kernel tools; outcomes persist as native files for reuse. Behavior-anchored assertions only (non-deterministic by design; no `cell_match`).

**rfp-engine / rfp-case-manager** — recipe drives the RFx package assembly (native `create_file` for the branded RFI/RFP templates the skill ships) and case tracking; ingests `landscape_handoff.json` from a prior supplier-landscape recipe run (cross-recipe sourcing). Evaluation scoring via `aria_procurement_weighted_score`.

**supplier-deep-dive** — single-vendor dossier: native web-research funnel (fewer, deeper passes than landscape) + SEC financials + Fabric incumbency; native DOCX. Same deliverable, more grounding.

**theos-field-guide / procurement-launcher (THEO orchestrator)** — these are reference/orchestration surfaces. As recipes they become the discovery + routing layer: `discovery_keywords` + a decompose-map that routes a user ask to the right procurement recipe. Full fidelity = same guidance + same routing.

**Cross-cutting hard-skill enabler:** the gate discipline that gives these skills their quality (G1-G10, research minimums, pass artifacts) is re-expressed as explicit numbered recipe steps and checked by behavior-anchored harness assertions, so ARIA's client-LLM enforces the same gates the native skill enforces. The kernels enforce the numeric floors deterministically (refuse-don't-guess), which is stronger than the native skills' LLM-authored math.

---

## 5. RECIPE SPEC PATTERN + one fully-worked example

### 5.1 The pattern (every procurement recipe conforms)
- **Frontmatter:** `recipe_id`, `recipe_kind: tool_orchestration`, `title`, `applies_to_sources` (`procurement_plugin` + Fabric/SEC as used), typed `parameters:`, `discovery_keywords:` (5-8), `related_canon_rules:` (reuse S2P gotchas), `output:` contract, `canonical_params:`, `harness_assertions:` (mixed deterministic + behavior-anchored), `author_upn`, `version`, `status`.
- **Body (mandatory sections):** Purpose · When to use / don't use · Parameters · Step 0 auth-precheck (if multi-source) · Step 0.5 scope/mode clarify (if the skill asks a mode question) · Tool invocation (the numbered Layer A/B/C/D orchestration, with exact tool signatures pinned per the sec-recipe MANDATORY-read discipline) · Output shape (the deliverable's fixed skeleton) · Failure-mode catches · Pre-Delivery Validation Matrix · Validation Baseline · Defects Log · Change history.

### 5.2 Worked example — `should_cost_builder` recipe (Phase 1 MVP seed)

```markdown
---
recipe_id: should_cost_builder
recipe_kind: tool_orchestration
aria_precedence: "AFTER semantic-maps + rules · BEFORE gotchas-throughout"
title: "Should-Cost Model (bottom-up cost stack, quadrature range, kernel-verified)"
status: draft
version: "1.0.0"
applies_to_sources:
  - procurement_plugin
  - fabric_f2ed9c34            # S2P Purchase Order Product (optional spend grounding)
  - sec_edgar                  # optional supplier public-cost benchmarking
discovery_keywords:
  - should cost
  - should-cost model
  - bottom-up cost
  - cost breakdown supplier
  - what should this cost
  - target price teardown
  - cost driver range
parameters:
  - name: ITEM
    type: string
    description: "The good/service being modeled (e.g., 'injection-molded vial', 'senior Java contractor')."
    example: "injection-molded 2mL vial"
    required: true
  - name: CURRENCY
    type: string
    description: "Reporting currency. Default USD."
    example: "USD"
    required: false
  - name: SUPPLIER_TICKER
    type: string
    description: "Optional public supplier ticker for SEC cost-structure benchmarking."
    example: ""
    required: false
related_canon_rules:
  - s2p_gotcha_intercompany_inclusion   # if grounding spend, third-party default + scope label
  - s2p_gotcha_unfiltered_spend
output:
  kind: files
  files:
    - should_cost_model.xlsx           # via aria_procurement_generate_pro_forma
    - should_cost_dashboard.html       # via aria_procurement_build_dashboard
    - should_cost_summary.md           # in-chat narrative
canonical_params:
  ITEM: "injection-molded 2mL vial"
  CURRENCY: "USD"
harness_assertions:
  - kind: cell_match
    row_selector: "total_base"
    column: "value"
    expected: 100
    tolerance: 0.0
    description: "Golden: bases 60+30+10 => total_base 100 (should-cost worked example)"
  - kind: cell_match
    row_selector: "range_low"
    column: "value"
    expected: 89
    tolerance: 0.0001
    description: "Quadrature sqrt(9^2+6^2+2^2)=11 => low 89 (kernel, not LLM math)"
  - kind: content_includes
    target: composition_response
    must_include_any: ["naive worst-case", "footnote"]
    description: "Naive envelope shown only as footnote, never headline (skill HARD RULE)"
  - kind: content_does_not_include
    target: composition_response
    must_not_include: ["I calculated", "I estimate the total is"]
    description: "No model-authored arithmetic for the rollup — kernel is the source of the number"
---

# Should-Cost Model (kernel-verified)

## Purpose
Build a defensible bottom-up should-cost for {ITEM}: decompose into cost drivers, research each
driver's rate range, roll the stack up with quadrature (root-sum-of-squares), and produce the XLSX
model + dashboard + narrative. The rollup arithmetic NEVER runs in the model's head — it runs in
aria_procurement_quadrature_rollup, a tested refusal-based kernel.

## When to use / don't use
- Use for target-price teardown, negotiation prep support, make-vs-buy cost baselines.
- Don't use for a full pro-forma TCO (use pro_forma_builder) or a market benchmark of observed
  quoted rates (use market_rate_benchmarking).

## Step 0.5 · Scope clarify (only if grounding internal spend)
If the user wants the model anchored to Lilly's own paid prices, run the S2P third-party-default
scope-clarify widget (ask_user_input_v0) per s2p_gotcha_intercompany_inclusion, and label the scope.

## Tool invocation (mandatory sequence)

### Step 1 · Decompose the cost stack (native reasoning + web research)
Identify the independent cost drivers for {ITEM} (materials, labor, tooling/overhead, logistics, margin).
Run the skill's external-research funnel to bound each driver: for each driver, web_search the input
rate (resin $/kg, molder labor $/hr, freight lane), and web_fetch the most relevant source for the full
figure. Keep a research log. Assign each driver base + low/high spread + a confidence flag (HIGH/MEDIUM/LOW).
Do NOT invent a number: if a driver can't be bounded from research, mark it and lower confidence (skill Rule 3).

### Step 2 · (Optional) Ground against internal + public data
- Internal: aria_fabric_query_dax against S2P PO Product for actual paid unit prices in this category
  (third-party scope, FY-filtered) — provenance "Lilly internal (ARIA)".
- Public: if SUPPLIER_TICKER set, aria_sec_concept_value for COGS / gross margin as a margin sanity check
  — provenance "SEC <form> <date>".

### Step 3 · Roll up the stack (KERNEL — the load-bearing call)
Call aria_procurement_quadrature_rollup(
  component_bases=[...], component_spreads_low=[...], component_spreads_high=[...],
  confidence_flags=[...]).
Returns {total_base, total_low, total_high, widened_components, naive_low, naive_high}.
Use total_base as the headline and [total_low, total_high] as the range. The naive envelope is a
FOOTNOTE ONLY, never the headline (skill HARD RULE, enforced by the kernel's QuadratureResult shape).
Any currency normalization goes through aria_procurement_convert_currency (never mix currencies silently).

### Step 4 · Produce deliverables
- XLSX: assemble the assumptions register and call aria_procurement_generate_pro_forma(register, out_path)
  for a reconciled multi-sheet model (Python-vs-formula check guarantees the workbook foots to the kernel).
- Dashboard: build the should-cost data object and call aria_procurement_build_dashboard(obj, "should_cost")
  for the self-contained HTML (cost-stack waterfall, range band, confidence read).
- Narrative: compose should_cost_summary.md leading with the kernel reconciliation line.

## Output shape
Headline base + quadrature range; per-driver table (base, low, high, confidence, source citation);
model-confidence read (MEDIUM if any LOW driver); naive envelope as a single footnote line.

## Failure-mode catches
- Reporting the naive worst-case as the headline (kernel keeps it footnote-only) — do not surface it as the range.
- Running the rollup in prose instead of the kernel — the content_does_not_include assertion fails the recipe.
- Unbounded driver silently defaulted — refuse and lower confidence, never guess.

## Pre-Delivery Validation Matrix
| # | Check | How verified | Pass criteria | Result |
|---|---|---|---|---|
| 1 | Rollup came from the kernel | tool-call trace | aria_procurement_quadrature_rollup invoked | ☐ |
| 2 | Golden foots | cell match | total_base=100, low=89, high=111 on golden inputs | ☐ |
| 3 | Naive envelope is footnote-only | content scan | appears once, not as headline | ☐ |
| 4 | Every driver cited or flagged | research-log scan | no unbounded driver presented as firm | ☐ |

## Validation Baseline
Canonical inputs: ITEM="injection-molded 2mL vial", golden driver stack bases [60,30,10],
spreads ±[9,6,2], flags [MEDIUM,MEDIUM,LOW]. Canonical outputs: base 100, range [89,111], no widening
(logistics 10% < 15% threshold). Validated: <date> by <author>.

## Defects Log
(empty at authoring)

## Change history
- v1.0.0 (<date>): initial authoring. Rollup delegated to aria_procurement_quadrature_rollup;
  XLSX via aria_procurement_generate_pro_forma; dashboard via aria_procurement_build_dashboard.
```

This one recipe demonstrates every architectural element: native web-research funnel (Layer B) + optional Fabric/SEC grounding (Layer A) + kernel math (Layer C) + native/plugin deliverables (Layer D), with mixed deterministic + behavior-anchored assertions.

---

## 6. DATA GROUNDING + GUARDRAILS

Reuse the grounding/fallback protocol the skills already ship (the ARIA-ENRICHMENT block):
- **Reachability test (silent):** a recipe uses ARIA grounding only if the `aria_*` data tools are callable this run. If not, it proceeds on user/native inputs and shows one neutral "Lilly internal enrichment (ARIA) not available" line. Never invent internal values.
- **`readOnlyHint: True` on every `aria_procurement_*` tool.** No tool writes anything. Deliverables are local files (`create_file` outputs), never system writes.
- **Never write to a system of record.** Ariba, ServiceNow, Aravo, SAP, SLP, LEAH, CLM stay read-only-or-out-of-scope; recipes never emit a PO/RFx/vendor-master write. Consistent with the Theo reflect-don't-enforce / not-SoR lock. Spend/vendor grounding is read-only Fabric via `conn_manager.get_connection(source_id)` + the existing `@require_canon` / `@require_valid_session` decorators — no new SSO.
- **Provenance labels are mandatory** on every grounded value: internal → "Lilly internal (ARIA)" with period/scope; public → "SEC <form> <date>"; forecast → "Projection (ARIA forecast)"; web → source name + date + URL; inference → explicitly marked. Distinguishes ARIA data from web research from model inference.
- **Role-gating stays at the data layer.** Vendor-master attributes (active status, payment terms, IKC risk) require role FGL__00605; if they return nothing with ARIA present, treat as unavailable, not zero. SEC is public-companies-only; private suppliers route to the formal risk screen (never assert financials).
- **Required-filter discipline carried through:** any spend grounding reuses the S2P mandatory filters (Fiscal Year present; P/A intercompany exclusion for third-party default; scope label in output) via `related_canon_rules` + Step 0.5, so ARIA grounding cannot silently inflate.
- **Anti-fabrication kernels:** the kernels refuse (typed exceptions) on unknown units/currencies, un-footed weights, malformed inputs — the "refuse, don't guess" rule is enforced in code, not left to the LLM.
- **Preserve the help-desk prompt-injection guard verbatim** when porting procurement-help-desk to a pure-recipe.

---

## 7. KERNEL-SYNC / DIVERGENCE governance

The kernels are the crown jewels and are currently vendored byte-identical across 10 skills. Hosting a plugin copy creates a divergence risk (ARIA computes a different number than the native skill). Governance:

1. **Single canonical source.** `lilly-procurement-kernels-1c344a/numeric_kernel.py` + the 6 skill kernels are the canonical definitions. The plugin does NOT hand-copy them.
2. **Generated, not copied.** `plugins/procurement.py` is produced by a small build step that imports the canonical kernel modules and wraps each function in an `@mcp.tool` closure (thin adapter: arg marshalling + `{success,error,hint}` envelope + docstring). The math is never re-typed. A drift between plugin and source becomes an import error, not a silent numeric divergence.
3. **Version + provenance stamps.** `PLUGIN_VERSION` carries the canonical kernel version it was generated from; each tool's Returns envelope includes a `kernel_provenance` field (source file + version + sha256). The `PLUGIN_CATALOG.json` entry carries the sha256 for OTA verification.
4. **CI parity test.** A test re-runs every kernel's own `__main__` golden suite (the numeric_kernel self-test, the pro-forma invariant checks) AND asserts the plugin tool returns byte/behavior-identical results to the canonical function on the golden inputs. Fails the build on any divergence.
5. **Ownership.** Per each kernel's `MAINTENANCE.md`, the kernel owner owns the canonical source; the plugin regenerates from it. When a kernel bumps (e.g., a corrected weight-sum tolerance), the regenerate step + parity test + a plugin `PLUGIN_VERSION` bump are the release gate. The recipe `harness_validated` re-runs at ARIA ship and catches any downstream drift.
6. **Recipe-side provenance.** Each recipe cross-references the kernel version it validated against in its Validation Baseline, so "did the number change?" has a deterministic answer.

---

## 8. PHASED PLAN

Dependency order: Phase 0 gates everything (it confirms the ARIA-is-Claude co-orchestration assumption). Phase 1 proves the full path on two deterministic seeds. Phase 2 broadens the kernel-backed + pure-recipe skills. Phase 3 takes the hard skills to FULL fidelity. The `aria_procurement_build_dashboard` builder + the DOCX-redline enablement are cross-cutting sub-tracks that land in Phase 1/3 respectively.

### Phase 0 — Spike / CONFIRM (0.5-1 week)
The one load-bearing unknown is whether a recipe's narrative body can drive Claude Desktop NATIVE tools (web_fetch, create_file, docx) interleaved with `aria_*` tools in one recipe execution.
- **0.1** Read the core loader + `aria_data/server.py` + `aria_activate` to confirm recipe-dispatch mechanics (recipes-as-content vs a generic `run_recipe` tool) and `PLUGIN_REQUIRED_FUNCTION` semantics.
- **0.2** CONFIRM native + ARIA co-orchestration: author a throwaway `tool_orchestration` recipe whose body says "call `aria_procurement_verify_line_math`, then `web_fetch` a URL, then `create_file` a small output." Run it in an ARIA session and confirm all three tool classes fire in one turn. (Supporting evidence it will: the Step 0.5 pattern already drives `ask_user_input_v0`, a non-aria client tool; the sec recipe already does narrative multi-tool binding.)
- **0.3** Stand up a skeleton `procurement.py` with ONE trivial tool (`aria_procurement_verify_line_math`), confirm load + telemetry wrap + the `{success,error,hint}` envelope + `readOnlyHint:True` annotation surface.
- **Exit gate:** native-tool co-orchestration confirmed (or the fallback in §9 is adopted) AND the plugin loads. Nothing proceeds until this gate is green.

### Phase 1 — MVP: 2 seed skills end-to-end with REAL deliverables (1.5-2 weeks)
- **1.1** Generate the 8 shared-kernel tools into `procurement.py` (from canonical `numeric_kernel.py`; docstrings per rubric; parity test).
- **1.2** Build `aria_procurement_generate_pro_forma` (wrap `generate_pro_forma_workbook`) and `aria_procurement_build_dashboard` (the mechanical HTML-assembly tool). These are the deliverable-fidelity multipliers; landing them early de-risks Phase 3.
- **1.3** Author 2 recipes end-to-end WITH their real deliverables:
  - `invoice_rate_card_auditor` (near-pure `verify_line_math` + `percentile_gate`; self-contained grounding).
  - `should_cost_builder` (the §5.2 worked recipe: quadrature spine + XLSX + dashboard; the "no model arithmetic" HARD RULE proven).
- **1.4** Ship both through Canon Builder review + harness validation; add the `PLUGIN_CATALOG.json` entry (`optional`/`beta` + sha256).
- **Exit gate:** a user in ARIA runs both skills and gets the same-or-better XLSX/dashboard/tables as native, with kernel-verified numbers.

### Phase 2 — Broaden the kernel-backed + pure-recipe skills (3-4 weeks)
- **2.1** Generate the remaining 5 skill kernels into tools (`assign_tier`, `compute_chain`, `comment_action`, `complexity_score`, `classify_roster`).
- **2.2** Author recipes for the remaining Option-B skills: market-rate-benchmarking, evaluation-engine, timeline-builder, workflow-map, legal-negotiation-prep, executive-summary-package, comment-cleanup, pro-forma-builder, plus the numeric spines of commercial-negotiation-prep, deal-room, rfp-response-analysis, scope-sow-architect, sole-source-challenge.
- **2.3** Author the 4 Option-A pure-recipe chat skills (procurement-help-desk with its injection guard preserved, process-navigator, meeting-prep-brief, voice-profile).
- **2.4** Each recipe: full deliverable (dashboard via builder, DOCX/deck via create_file, tables via markdown), mixed harness assertions, Canon Builder review.
- **Exit gate:** ~19 skills live at full fidelity through ARIA.

### Phase 3 — Hard skills to FULL fidelity (4-6 weeks)
- **3.1** DOCX-redline enablement sub-track: confirm `unpack.py` read + native docx tracked-change write are reachable in the ARIA surface; build a small redline-emission helper pattern reused by contract-review and comment-cleanup. (If a surface lacks docx-XML, apply the §9 capability-probe fallback.)
- **3.2** Author the hard-skill recipes with the §4 mechanisms, in dependency order:
  1. supplier-landscape (native web-research funnel + build_dashboard + Fabric/SEC grounding) — also unblocks rfp-engine via `landscape_handoff.json`.
  2. lilly-contract-review (native docx redline + playbook + kernel numeric sub-steps + 3-panel dashboard + findings ledger).
  3. supplier-deep-dive, category-strategy, rfp-engine, rfp-case-manager, negotiation-simulator, negotiation-playbook-learning, theos-field-guide, procurement-launcher.
- **3.3** Behavior-anchored harness assertions for each (research minimums, pass-artifact presence, decompose/follow-up correctness, deliverable skeleton checks); Canon Builder review per recipe.
- **Exit gate:** every hard skill produces its native deliverable through ARIA at same-or-better fidelity. No skill remains native-only.

### Rough total
- Phase 0: 0.5-1 wk · Phase 1: 1.5-2 wk · Phase 2: 3-4 wk · Phase 3: 4-6 wk.
- **Total ≈ 10-13 weeks of one engineer**, plus per-recipe Canon Builder review and the two cross-cutting sub-tracks (dashboard builder in P1, docx-redline enablement in P3) threaded in. This is larger than the research's 5-7 week estimate precisely because Phase 3 is now full-fidelity build work, not a deferred research decision.

---

## 9. RISKS + OPEN DEPENDENCIES (each with a mitigation)

1. **Native-tool orchestration inside a recipe may be constrained (THE load-bearing risk).** The whole plan rests on the executing Claude keeping its `create_file` / `web_fetch` / docx tools while running a recipe. If ARIA's runtime sandboxes recipe execution to a reduced tool context, co-orchestration breaks.
   - *Mitigation:* Phase 0.2 gates everything on confirming this before any build spend. **Fallback if constrained:** treat the recipe as a loaded methodology-prompt rather than an `aria_pull_recipe` auto-exec — i.e., the recipe body is surfaced into the outer Claude Desktop turn (same session, full native tool belt) and the `aria_procurement_*` + `aria_fabric_*` calls happen as normal tool calls in that turn. This still delivers full fidelity because it is the same Claude Desktop Claude; it only changes the dispatch surface, not the capability. (This is also the answer to the research's open "recipes-as-content vs generic run_recipe" question.)

2. **Deterministic executor supports only 3 step kinds; procurement chaining is narrative.** No `aria_procurement_*` tool can be an auto-executed `plan:` step, so fidelity of the hard skills depends on Claude reliably following the prose gates (G7/G8) rather than a deterministic engine.
   - *Mitigation:* re-express every gate as an explicit numbered recipe step + a named pass artifact; add behavior-anchored harness assertions (`decompose_correctly`, `follow_up_appropriate`, `content_includes` for research-completeness blocks and word-count floors); and push every numeric floor into a refuse-don't-guess kernel tool so the hard correctness constraints are deterministic even when the surrounding judgment is narrative. Adding a new executor step kind is a core-server change and is explicitly out of scope.

3. **Kernel divergence / provenance.** A plugin copy of the kernels can silently drift from the canonical `lilly-procurement-kernels` source, so ARIA computes a different number than the native skill.
   - *Mitigation:* §7 governance — generate (never hand-copy) the plugin from the canonical modules, version+sha stamps, a CI parity test asserting byte/behavior identity on the golden suites, and MAINTENANCE.md ownership with a regenerate-on-bump release gate.

4. **DOCX-redline and dashboard fidelity depend on native-tool availability in the specific ARIA/Claude Desktop surface** (`unpack.py`, docx tracked-change write, `create_file` shareable artifacts). A thin ARIA client surface might lack them.
   - *Mitigation:* a capability-probe at recipe start (same shape as the ARIA-ENRICHMENT reachability test); if a needed native tool is absent, surface a labeled limitation and request a DOCX export / manual inventory (exactly as the contract-review skill's G1 already does) rather than silently degrading. On the standard Claude Desktop surface these tools are present, so this is a surface-coverage caveat, not a design gap.

5. **New systems of record remain out of scope (governance ceiling).** Skills that would want Ariba/ServiceNow/Aravo/CLM data cannot reach it without a governed connector, and the not-SoR lock keeps those read-only-or-out.
   - *Mitigation:* ground everything reachable via Fabric spend/vendor + SEC + native web research; where a skill would want an SoR write, it stays reflect-only (produce the artifact locally, hand it to the human to enter). No skill in the ~26 requires an SoR write for its native deliverable, so this caps enrichment depth, not fidelity of the deliverable.

6. **Non-determinism of the hard skills makes regression testing harder.** Web-research and narrative outputs vary run to run; `cell_match` assertions would false-fail.
   - *Mitigation:* use behavior-anchored assertion kinds for the narrative half (per the AUTHORING-GUIDE ai_agent-recipe discipline) and reserve `cell_match` / `external_anchor_match` for the kernel-computed and Fabric-grounded numbers, which ARE deterministic.

7. **Canon Builder review throughput.** Every recipe ships only after CB review + harness PASS; ~26 recipes is real review load.
   - *Mitigation:* batch by class (the Option-B recipes share the kernel-call shape, so review is largely templated); front-load the two seeds so the review pattern is established before the volume lands in Phase 2.

---

*End of plan. Do not build until the dashboards/skills optimization is complete and Phase 0's exit gate is green.*


---

## Open Questions - RESOLVED (Marc, 2026-07-22)

- **Q1 Fidelity:** SAME OR BETTER, no reduced fidelity for any skill. (confirmed)
- **Q2 Deliverables:** must work too (same or better) - the real DOCX/XLSX/dashboard bundles port, not just markdown.
- **Q3 Data sources - EXTENSIBILITY + M365 + graceful degradation (design requirement):**
  - Build the source layer to be EXTENSIBLE. ARIA may later gain read-only connectors to Ariba / ServiceNow / Aravo / CLM, AND/OR each user may reach that data via their own native Claude Desktop connectors. Neither is assumed present at build time; do not hard-depend on any one source.
  - M365 MCP connector is a FIRST-CLASS source. Relevant procurement data lives in SharePoint sites, OneDrive, email, MS Teams chats/sites, etc. Every recipe that may need it MUST check the M365 MCP connector is enabled and, if OFF, tell the user to turn it on BEFORE running (mirrors the skills existing Suite Interaction Protocol S1: provide / search M365 / both; and the M365 allow-list Word/Excel/PPT/PowerBI/SharePoint/Fabric/OneDrive/Copilot/Teams/Outlook).
  - Plan for source-UNAVAILABLE. When M365, a Fabric table, or a future connector is not connected/reachable, the recipe follows the Data-Grounding & Fallback protocol (source harder -> ask user once -> labeled data-gap state -> degrade scope, never fabricate). Adding sources over time must not break recipes; each recipe declares its sources and degrades gracefully when one is absent.
- **Q4 Kernel-sync ownership:** Marc owns it (deferred).
- **Q5 MVP seed skills:** clarified = the 1-2 skills we build FIRST to prove the plugin->recipe->deterministic-exec + native-tools + real-deliverable path end to end before scaling to all ~24. Recommendation: invoice-rate-card-auditor + should-cost-builder (most self-contained math), or pro-forma-builder for a tangible XLSX demo. [pick deferred to build start]
- **Q6 Recipe-dispatch Phase-0 spike:** APPROVED.
- **Q7 Trust tier / readOnly:** readOnly is INHERENT - there is NO write path to any procurement system of record; the only write ARIA performs is to its own Fabric/data layer. No PO/RFx/SoR write risk exists. Ship procurement as optional+beta for rollout hygiene; readOnly by construction.


---

## Risk #1 UPDATE - recipe-corpus read (2026-07-22): REDUCED (was STILL-OPEN)

Read all 33 recipes + AUTHORING-GUIDE.md + ARIA SKILL.md. The core assumption (a recipe can drive Claude's NATIVE tools alongside ARIA's) is ALREADY DEMONSTRATED and MANDATED, not merely assumed:
- Native CODE-EXECUTION + FILE-WRITE are used in the guide's own canonical reference recipes: trial_balance_report.md and us_income_statement.md build Excel via openpyxl and write to /mnt/user-data/outputs (Claude's native sandbox path, NOT ARIA/OneLake), with assert-based validation scripts.
- ARIA SKILL.md MANDATES native tools every session: create_file + present_files (session logs), web search (domain terminology), view()/execute (code templates) - run alongside aria_* tools unconditionally.
- NO SANDBOXING: a recipe is plain markdown read by the same un-sandboxed Claude Desktop session. The only isolation is the deterministic plan: executor's closed kind-vocabulary (fabric_dax/fabric_measure/hana_sql/sac_query), which fences off ITS OWN deterministic slice - not Claude's native tools. Everything else = normal Claude with its full toolset (the LLM-orchestrated path).
- CONSEQUENCE: the XLSX (openpyxl) and file-write deliverable paths are PROVEN native. Pro-forma .xlsx and the self-contained HTML dashboards ride a validated path.

NARROWED Phase-0 spike (only these two remain unproven, not the general question):
1. Native web_fetch for a multi-pass EXTERNAL-research funnel inside a recipe (SEC currently routes via ARIA's aria_sec_* plugin; native web_search IS used for terminology, but the research-funnel pattern is unproven for e.g. supplier-landscape).
2. Native artifact / show_widget / chart rendering by name (dashboards today are produced by aria_compose_dashboard, an aria_* tool; rendering our self-contained HTML via a native artifact is unproven).

Net: the plan's foundational native+ARIA-orchestration dependence is largely validated by shipped example; the residual spike is small and targeted.
