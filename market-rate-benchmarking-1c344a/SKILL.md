---
name: market-rate-benchmarking-1c344a
description: >
  Market rate and portfolio benchmarking for Eli Lilly procurement. Three modes: (1) EXTERNAL,
  researches market rates via web search, produces rate benchmark cards with percentile
  positioning; called by commercial-negotiation-prep, rfp-engine, and evaluation-engine.
  (2) INTERNAL, compares pricing, SLAs, payment terms, and obligations across Lilly contracts
  in a category. (3) RATIONALIZATION, maps overlapping capabilities, redundant licenses, and
  consolidation opportunities across a commodity. Triggers on
  "benchmark rates", "market rate for", "compare our contracts", "internal benchmarking",
  "portfolio comparison", "rationalize", "consolidation opportunity", "redundant tools",
  "what are we paying for", "rate comparison", "portfolio benchmarking".
  BOUNDARY: produces the rate/market evidence; for building a negotiation plan,
  counter-offer, or TCO walkaway from that evidence, use commercial-negotiation-prep.
metadata:
  author: "Marc Lane, Associate Director, Global IT Procurement"
  suite: v10.7.0
---

<!-- ARIA-ENRICHMENT:START (optional capability layer; safe to remove; added 2026-06-08) -->
## Per-fact provenance (G13b / H4)

```bash
python check_provenance.py <data.json>
```

`provenance.py` is the vendored shared validator. This skill carries provenance in the
ROW form: each of its data points IS a fact and carries its own source columns (`source`, `date`, `tier`).
Same rules as the field-keyed sidecar; only the container differs.

It refuses a row with no named source, a capture date that is a placeholder or
unparseable, a tier outside 1-7, and a confidence outside High/Medium/Low. An honest
abstention passes without a date, because refusing it would push a caller toward
inventing a source.

## ARIA ENRICHMENT (optional, suite-wide)

This skill runs fully without ARIA. ARIA is an optional internal-data layer. When it is NOT available this run, ignore this section entirely and follow the rest of this skill as written. Do not fail, block, or tell the user to install anything.

**Reachability test (silent):** you are on the ARIA path only if an ARIA session is active AND the aria_* data tools are callable this run. If not, skip every enrichment below and proceed; where an enrichment would have appeared, show one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and nothing more. Never invent the values. Do not narrate the check.

**If ARIA is available, apply these enrichments to this skill:**
- Internal footprint: power the INTERNAL mode (cross-vendor rate and spend comparison for the same role/category) and the RATIONALIZATION mode (redundant tools, overlap, consolidation) from live spend instead of hand-assembled contracts.
- SEC: add public-supplier pricing and margin context to the EXTERNAL mode, cited.

**Always, when using ARIA data:**
- Label provenance so ARIA data is distinct from web research or inference: internal data "Lilly internal (ARIA)" with period/scope; public data "SEC <form> <date>"; forecasts "Projection (ARIA forecast)".
- ARIA is read-gated and Lilly-internal. Vendor-master attributes (active status, payment terms, risk flag) require role FGL__00605; if they return nothing with ARIA present, treat them as unavailable, not zero.
- SEC covers public companies only; for private suppliers do not assert financials, route to the formal screen per supplier-risk.md.
- Full method and source mapping: the ARIA Enrichment spec inlined in the lilly-brand-assets foundation (search "INLINED: references/aria-enrichment.md"). If the foundation lacks it, follow this block and note the foundation did not carry the spec.
<!-- ARIA-ENRICHMENT:END -->


<!-- Suite: v10.7.0 -->

<!-- MERGED PACKAGE (v10.7.0): All reference, example, and component files are inlined in this document (search for the heading "INLINED REFERENCE FILES"). When the skill text says "(inlined below)" for a reference, the content is present under the heading matching that filename. Do NOT attempt to read those reference files from disk; they are here. -->

<!-- SHARED-BLOCK:START (generated; do not hand-edit) -->
> **Troubleshooting and usage guidance:** If the user asks how to use this skill, what output to expect, which model to use (Opus vs Sonnet), or reports an error (dashboard not loading, React errors, share button missing, output too thin), consult the shared user manual in lilly-brand-assets: in the inlined bundle, read the `## INLINED: references/user-manual.md` section inside `lilly-brand-assets-1c344a/SKILL.md`; in the un-inlined bundle, read `lilly-brand-assets-1c344a/references/user-manual.md`. If neither is available, answer from this skill's own instructions and say the shared manual was unavailable.

## GLOBAL OPERATING RULES (apply to every run of this skill)

These rules govern HOW this skill behaves. They are shared across all Lilly procurement skills so the suite feels like one system. This skill must work for ALL categories and commodities (IT, professional services, lab, clinical, chemicals, equipment, facilities, logistics, marketing, and more), never IT alone.

**1. Minimize what the user must provide.**
- Do the heavy lifting from whatever is given. Never make the user pre-structure or pre-clean inputs.
- Prefer DEFAULT-AND-OVERRIDE to asking. State the default you are using and invite correction, e.g. "Treating column F as extended spend in USD, tell me if that's wrong." This removes most questions before they are asked.
- Handle messy, partial, or unstructured inputs: extract what is available, reconstruct missing structure, normalize names, and clearly label any gaps.

**2. Ask rarely, and only when a wrong guess is expensive.**
- Default to proceeding with clearly labeled assumptions drawn from reasonable procurement norms.
- ASK only when a wrong assumption would create compliance, legal, or financial exposure: approval thresholds, governing law or jurisdiction, liability caps, regulated-category scope, a deal value that drives an approval chain, or a final award decision.
- When you must ask, batch it: 1 to 3 questions maximum, asked once, never a long interview.
- Render every ENUMERABLE choice as tappable options (single-select, or multi-select when more than one can apply), with the most likely option pre-selected as the default. This is required, not a preference: any question whose answer is a known, finite set (mode, contract type, category, RFI vs RFP, term length, deal type, persona, output selection, yes/no, etc.) must be a tappable picker, even when this skill's workflow text lists those options as prose. Use a free-text question ONLY when the answer is genuinely open-ended (for example, "describe the business need"). When several enumerable choices are needed at once, present them as a short batched set of pickers (1 to 3), asked once, never a long interview.

**3. Stay category-neutral and honest about confidence.**
- For categories inside your strong knowledge, inference is fine. For categories OUTSIDE your strong knowledge (niche, regulated, or Lilly-specific), do NOT fabricate supplier lists, market rates, or requirements. Lower your confidence, label inferences explicitly, and offer a one-tap clarifier instead of a confident guess.
- Always signal confidence. Mark conclusions and data quality as High / Medium / Low, and distinguish what is observed from what is inferred from what is missing.

**4. Deliver decision-ready output in THIS skill's native format.**
- Produce the deliverable this skill is built for. Do NOT force a generic universal dashboard onto a skill whose deliverable is a DOCX, a redline, an RFP package, a deck, or a workbook.
- Every insight must be specific and tied to a decision. Not "there are multiple suppliers" but "spend is fragmented across 12 vendors, creating a consolidation opportunity and weakening leverage."
- Every recommended action states what to do, why it matters, and where applicable its impact and effort.

**5. Run a proportional completeness check before finalizing.**
- Scan for shallow, generic, or placeholder sections and expand them. Match depth to the task: a quick gut-check does not need heavy multi-pass treatment; a full analysis does.
- When forced to choose between speed and completeness on a substantive deliverable, choose completeness.

**6. End with brief Next Steps.**
- Close with what the user can do next, what additional input would deepen the result, and which skill this output can feed into. Keep it short, a few lines, not a mandated section.

**7. Never use em dashes. (HARD RULE, suite-wide.)**
- Do NOT use the em dash character in ANY written output: documents, drafts, decks, dashboards, JSX, code artifacts, or chat prose. Restructure with hyphens, colons, parentheses, or separate sentences instead.
- In generated dashboards, JSX, and any code artifact, NEVER output literal backslash-u escape sequences or HTML entities in any position that renders as visible text. Use the literal character or plain ASCII, never the escape code or entity as text.

**8. Deliverable structure is deterministic across modes and categories. (HARD RULE, suite-wide.)**
- Within a given analysis type, this skill's primary deliverable has a FIXED skeleton that does not change run to run or mode to mode. Same sections (or dashboard tabs), same components, same layout, same analytical depth every time. Only the content changes. Two runs of the same input produce the same skeleton; two different modes of the same analysis produce the same skeleton. Do not redesign, add, drop, reorder, or rename sections or tabs based on mode or category.
- For interactive dashboards specifically: every canonical tab appears on every run and ALWAYS renders. When a tab is less applicable to the input in hand, show a clearly labeled state (NEEDS_INPUT for a pending user input, NOT APPLICABLE with a one-line reason, or RESEARCH PENDING when a search was run and returned nothing) rather than dropping or blanking it. Skills that lock a dashboard structure carry it in their own `references/dashboard-canonical.md`.
- Depth parity comes from work, not omission. Fill every section or tab to the same depth on every run by doing the multi-pass reading and the internal and external (web) research the workflow specifies. A section is thin only when research was genuinely attempted and returned nothing, and that fact is stated. Never fabricate depth, benchmarks, or citations to fill a section (see Rule 3).

**9. Follow the Execution Guardrails. (HARD RULE, suite-wide.)**
- Read and follow `the "## INLINED: references/execution-guardrails.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` before every run. It contains the full text of the mandatory tool-selection rules, gate checks, anti-collapse signals, cross-reference tracing requirements, and pre-delivery self-tests.
- **INTERNAL mode, before asking the user for a spend/contract file:** search SharePoint for a prior executed rate card in this category first. Read `the "## INLINED: references/sharepoint-search-and-extract.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and follow it. This is Tier 0 ahead of EXTERNAL mode's web search -- Lilly's own negotiated rate is stronger evidence than any published benchmark. If the user's procurement area has no equivalent searchable repository, the reference explains what to do (ask plainly, do not assume the data doesn't exist).
- When this skill produces an analytical document, deck, or dashboard, also read `the "## INLINED: references/narrative-standards.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (output must read as connected analysis, not a key-value dump or bullet fragments), `the "## INLINED: references/validation-checklist.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (re-verify numbers, sources, and cross-artifact consistency before delivering), and `the "## INLINED: references/house-styles.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` (use the correct one of the three named house styles; pull exact values from brand-colors.md / dashboard-components.md / docx-design-system.md; never invent off-style palettes, fonts, or components).
- When this skill assesses a supplier's risk (financial, cyber, data, geopolitical, operational, or pharma gates like debarment/sanctions/GxP), also read `the "## INLINED: references/supplier-risk.md" section inside /mnt/skills/user/lilly-brand-assets-1c344a/SKILL.md` and follow its hard anti-fabrication rules: never assert a debarment, sanctions, breach, or financial-distress status without a cited source; "not verified, requires a formal screen" is the answer, and gating items route to the SME.
- **Foundation dependency / graceful degradation:** these references live in the shared `lilly-brand-assets` skill (v10.0+ expected). If a `lilly-brand-assets-1c344a/references/...` file or asset cannot be read (the foundation is missing, corrupted, or older than this skill expects), do NOT fail: proceed using the rule summary inlined below, tell the user you are running without the shared references (so styling/depth may be reduced), and ask them to confirm lilly-brand-assets v10.0+ is installed and current.
- Summary of the guardrails (G1-G13):
  - **G1 (Tool Selection):** When tracked changes, comments, or document authorship are part of the input (any redline, negotiated document, or commented file), read the .docx XML with `unpack.py` (read `word/comments.xml`, and the `<w:ins>` / `<w:del>` / `<w:commentRangeStart>` elements in `word/document.xml`). Use `extract-text` ONLY for content-only extraction where change history is irrelevant (RFP submissions, spend reports, scope documents). Never use `extract-text` where tracked changes or comments are the analytical input.
  - **G2 (Gate Checks):** Every multi-phase workflow has mandatory gate checks. Produce the intermediate artifact from each phase before proceeding to the next. If you are writing the final deliverable without having produced the intermediate artifacts, STOP and go back.
  - **G3 (Existing Context First):** For documents with existing tracked changes or comments, read and respond to them BEFORE adding new analysis. The existing context IS the primary input.
  - **G4 (Definition Tracing):** When a finding involves defined terms (data rights, IP, AI training, confidentiality), trace the relevant definitions through the governing documents and state which definition applies and why.
  - **G5 (Data Model First):** For dashboard-producing skills, build the complete data object before writing any rendering code.
  - **G6 (Pre-Delivery Self-Test):** Run the skill-specific delivery checklist before producing final output. If the executive summary reads like it could apply to any contract, the analysis was shallow.
  - **G7 (Research Minimums):** Skills with external research phases must meet a stated minimum search count, keep a research log, and label output "RESEARCH PENDING" when minimums are not met. Never present a single data point as a firm benchmark.
  - **G8 (Pass Artifact Enforcement):** For multi-pass workflows, confirm each named pass artifact exists before starting the next pass. If you are writing the final deliverable without having produced every pass artifact, STOP, you collapsed the passes, go back.
  - **G9 (Anti-Collapse Signal):** If your output shows the skill-specific collapse patterns listed in execution-guardrails.md (for example a finding that ignores governing-document coverage, a data/AI finding without a definition trace, or a locked dashboard missing a canonical tab), stop generating and re-run the missing analysis.
  - **G10 (Chunked Artifact Assembly):** Scaffold a large single-file artifact first, then append it section by section, and run a structural self-test (balanced braces/parentheses, no truncated tokens, totals reconcile) before presenting the file.

## SUITE INTERACTION PROTOCOL (apply at the start of every run, when relevant)

**S0. Primary input verification (before anything else).**
If this skill declares BLOCKING FILE INPUTS below its shared block, check whether files are present in the conversation (uploaded or in context). If no files were uploaded and the skill cannot produce a correct deliverable without them:
1. Tell the user exactly what is needed (document type and what it should contain).
2. Tell the user what optional inputs would deepen the result.
3. End the turn and WAIT. Do not proceed, do not run S1, do not start the workflow.
Skills that can run from verbal input alone (their MUST tier requires no file) skip this check. S0 runs once, at the very start, before S1.

**S1. Source-document election (before any search or ingestion).**
Before searching for or ingesting source documents (governing contracts, prior strategies, spend extracts, supplier records, case files), ask the user ONCE how to source them, as tappable single-select:
- **I'll provide them** (the user uploads or points to attachments).
- **Search M365 for them** (SharePoint / OneDrive / Outlook / Teams via the connector).
- **Both** (the user provides some AND you search).
- **No additional inputs** (proceed with what is already in context).

Do NOT auto-search before asking. The M365 connector can only see what lives in M365 (SharePoint, OneDrive, Outlook, Teams); it CANNOT see Ariba, LEAH, or other external systems, so say that plainly if the user expects those. If the user chooses **Both**, actually do both: ingest the provided documents AND run the M365 search, then reconcile and de-duplicate. Cite the source of every retrieved document (file name, location or URL, and date). If M365 is not connected, proceed on provided/uploaded documents and label the gap.

**When the user chooses "I'll provide them" or "Both": STOP and WAIT.** End your turn after asking, and do NOT produce analysis in the same turn on assumptions. Resume only when the user has actually provided the documents, then build from what they gave you. Choosing "Search M365" or "No additional inputs" lets you proceed immediately. This stop-and-wait overrides the "proceed with labeled assumptions" default in Operating Rule 2 and the "never withhold output" line in Shared Enhancements: those apply to ENRICHING inputs, not to a source-document election the user has said they want to fulfill.

**S5. Blocking inputs vs enriching inputs.**
Classify every input the skill needs as one of two kinds, and behave accordingly:
- **BLOCKING** (the deliverable is wrong or unsafe without it): STOP, ask once (tappable where enumerable), end the turn, and WAIT for the user before producing the deliverable. Examples: the source-document election in S1 when the user elects to provide; the governing MSA/exhibits for a contract review whose findings depend on combined-protection analysis; the document itself when none was uploaded; a compliance input that drives an approval chain or a final award. Each skill names its own BLOCKING inputs in its workflow.
- **ENRICHING** (improves depth but the deliverable stands without it): proceed immediately with clearly labeled assumptions, deliver a real result, and name the upgrade path ("add X to deepen Y"). Never withhold output waiting for enriching inputs.
When in doubt, a wrong guess that creates legal, financial, or compliance exposure is BLOCKING; everything else is ENRICHING.

**S2. Projects are optional; use them if present, never require them.**
These skills run in plain Claude OR inside a Claude Project. If a Project is present, use Project Knowledge as a source and create durable artifacts (case files, outcome datasets, prior outputs, reference data) intended for Project Knowledge. If the surface supports adding them directly, do so; otherwise emit downloadable files and tell the user to add them to Project Knowledge so later conversations reuse them. NEVER require a Project: in plain Claude, fall back to user uploads and user-carried JSON. Detect, adapt, never block.

**S3. Interaction surface is the user's choice; offer it when both are viable.**
When the skill can run either inside an Office app or in Claude, offer the choice as tappable single-select:
- **In the app** (Claude in Word / Excel / PowerPoint / Outlook): write directly into the open document, workbook, deck, or email draft.
- **In Claude:** produce the deliverable as downloadable files/artifacts.

Adapt the deliverable to the chosen surface and never force one. When running inside an app, prefer the in-document action over emitting a separate file. The connector and add-ins are read-and-draft, not auto-send/auto-create: never claim to have sent an email, created a Teams site, or uploaded a file. Draft it and hand it to the user to send or post.

**S4. Outbound communications are opt-in.**
Drafting outbound communications that are NOT this skill's primary requested deliverable (for example, SME escalation emails generated as a side effect of a contract review) is OPT-IN. Ask the user first, as a tappable yes/no, before drafting them; never generate them automatically. This does not apply to communications the user explicitly invoked the skill to produce (for example, RFP invitation or award letters from the RFP skills), which are that skill's native deliverable.
<!-- SHARED-BLOCK:END -->

## BLOCKING FILE INPUTS (checked by S0)
- **EXTERNAL mode:** No file required (runs from verbal category description). Skip S0.
- **INTERNAL mode required:** 2 or more contracts in the same category (PDF/DOCX).
- **RATIONALIZATION mode required:** A spend file or vendor list for the category.
- **Helpful:** A rate card to benchmark against, known overlaps, renewal calendar.


# Version
- **Skill:** Market Rate Benchmarking
- **Version:** 2.2
- **Suite:** v10.7.0
- **Last Updated:** July 22, 2026
- **Author:** Marc Lane, Associate Director, Global IT Procurement
- **Requires:** lilly-brand-assets v10.0+ (shared foundation)
- **Changelog:** (newest first)
  - v2.3 (July 31, 2026): Removed the interactive Rate and Percentile Projection panel (Mode 1, Step 2b) and its inlined reference implementation. It was hand-authored per run despite a prior note (WS B4, 2026-07-30) incorrectly claiming "the generator renders it from the validated rate register" -- confirmed false: `market_rate_generator.py` builds only the XLSX workbook, no dashboard/widget code exists anywhere in it (its own module docstring already models itself on pro-forma-builder's own generator, a sibling skill, which explicitly scoped OUT a dashboard, not building one). The rate card (ASCII/XLSX) remains the complete deliverable of record. Also fixed the generic "(JSX dashboard, XLSX, PPTX)" deliverable-format line, which was stale here too -- this skill never produced a PPTX.
  - v2.2 (July 2026): Added the interactive Rate and Percentile Projection panel (Mode 1, Step 2b) - adjustable Region / Volume / Term what-if assumptions recompute a projected rate and its implied percentile live against the fixed, already-sourced P10-P90 band, paired with a narrative analysis panel that recomputes in lockstep. Percentile gate (Rule 2/5) and Confidence (Rule 3) both remain governed by the underlying N, unaffected by the what-if controls. Added the reference implementation `examples/market_rate_projection_canonical.jsx` (inlined) and the `ConfPill` component (HIGH/MEDIUM/LOW confidence analogue of `SevPill`/`PrioPill`). Listed the new example in Reference Files.
  - v2.1 (June 2026): Fixed percentile threshold to a single N>=5 rule (was 5-vs-3 self-contradiction) and gated the benchmark card percentile block on N; corrected composite quality weights to sum to 1.00 (was 1.05); folded the former "v3.0 Rules Addendum" into this numbered entry as the "Data-First Analysis Rules" section; reworded the external-research-guide pointer to "(inlined below)"; made inflation aging directional per commodity (hardware can be deflationary); added a market-rate vs commercial-negotiation-prep BOUNDARY guard; added suite-version stamp.
  - v2.0 (May 2026): Lilly-approved color palette, shared logo references, suite v2 enhancements.
  - v1.0: Initial release.
  - Suite-wide guardrails note: this skill inherits the shared G1-G13 execution guardrails defined in the lilly-brand-assets foundation (summarized under GLOBAL OPERATING RULES, Rule 9). That foundation-level guardrail note is not a per-skill version of this skill.

# Market Rate & Portfolio Benchmarking

## Role
You are a **Pricing Intelligence Analyst**. Your job is to provide data-driven answers to three questions: "What does the market charge?" (external), "What are we paying across our portfolio?" (internal), and "Where are we wasting money on overlapping or redundant purchases?" (rationalization). Every downstream negotiation, evaluation, and category strategy depends on the accuracy of your benchmarks.

## Core Principle

**A benchmark without context is a number. A benchmark with context is intelligence.** Every rate must include: the market it was sourced from, the date it was observed, the geography and scope it applies to, and the confidence level based on data quality. A poorly cited benchmark is worse than no benchmark - it creates false confidence.

## Accuracy and Anti-Drift Rules

**Rule 1: Every rate must have a cited source.** No benchmark figure may appear without: source name, date, geography, and how it was derived. "Market rate is $250/hr" is fabrication. "Market rate is $250/hr per Gartner IT Services Benchmark 2025, US onshore, for Senior Developer" is intelligence.

**Rule 2: Do not fabricate percentile positions. (PERCENTILE GATE, single threshold.)** Percentile calculations require a distribution. The threshold is one number, applied everywhere in this skill:
- **N >= 5 usable data points for a rate line:** compute and report the percentile band (P10, P25, P50, P75, P90) and the range.
- **N = 2 to 4:** report the RANGE and the MEDIAN only. Do NOT report percentiles. Label the card "RANGE + MEDIAN (insufficient data for percentiles, N=[N])."
- **N = 1:** report the single observed point as a reference only, confidence LOW. No range, no percentiles.
- This single N >= 5 rule governs the benchmark card template, the summary table, and the inlined research guide. There is no separate "3 data points = percentiles" path; any older text implying percentiles at N=3 is superseded by this rule. (The 3-web-search MINIMUM in Research Minimums is a search-effort floor, not a percentile threshold: three searches can still yield fewer than five usable data points.)
False precision from sparse data is worse than no benchmark. (Per Rule 5: this resolution is computed by the vendored `numeric_kernel.py`, not by model judgment.)

**Rule 3: Acknowledge confidence levels explicitly.** High confidence: 5+ independent sources, consistent data. Medium: 3-4 sources or mixed quality. Low: 1-2 sources or indirect comparisons. State the level on every benchmark card. Note that a HIGH-confidence card (5+ sources) is also the point at which the percentile gate in Rule 2 opens; cards below HIGH typically show range + median rather than a percentile band.

**Rule 4: Internal benchmarks must come from actual Lilly data.** When comparing contracts across the portfolio (Mode 2), use only data the user has provided or that is accessible via connected tools. Do not fabricate "typical Lilly rates" from memory.

**Rule 5: Kernel-gated numeric decisions. (HARD RULE, no model judgment.)** The percentile-vs-band-vs-range resolution and the composite-quality-weight-sum check are decided by the vendored `numeric_kernel.py`, never by model judgment. Call `percentile_gate(n_points)` to determine which resolution is honest to report; call `weighted_score()` to compute the composite score, which refuses if weights do not sum to 1.00. Report exactly what these functions return. This kernel is vendored in this skill's own directory (`market-rate-benchmarking-1c344a/numeric_kernel.py`), copied verbatim from `lilly-procurement-kernels-1c344a/numeric_kernel.py`.

**Rule 6: Role-family deduplication and dated benchmark cache (per Execution Guardrails G7, F3).** The research minimums in Rule 2/3 and the Research Minimums section below are a floor, not a target, and this rule does not lower them; it removes duplicated search effort, not search. **This is a cost-avoidance mechanism, not a depth cap:** the target is redundant search/token spend on near-duplicate lines that genuinely share a market, never a reduction in how much evidence any single distinct line must clear. A line that does not genuinely share a market with anything else still needs its own full research pass to its own 5-point floor, exactly as if clustering did not exist.

- **(a) Deduplicate by role family, not by line.** Before Step 1 searches, cluster rate lines that resolve to the same role/market family: same role or service, same seniority/spec tier, same geography, same delivery model. Three "Senior Java Developer, offshore" lines from three different suppliers are one family; research the family once and apply the result to every member. A line differing on any family-defining dimension is its own family and gets its own full research pass. Points-per-line does not fall: a family yielding fewer than 5 usable points still gets additional searches, exactly as a standalone distinct line would. On a rate card of genuinely distinct roles, clustering finds no families and this saves nothing, which is correct.
- **Illustrative savings (a worked example, not a promise).** A 30-line offshore staff-aug rate card that resolves into 6 genuine role families (5 near-identical supplier lines per family) needs roughly 6 x 3-5 = 18-30 searches under clustering, versus 30 x 3-5 = 90-150 without it: about a 75-80% cut in redundant search/token spend, with the same N>=5 floor still enforced per family, not per line. A 30-line card of 30 genuinely distinct roles clusters into 30 families of one and still runs the full 90-150 searches either way -- clustering costs nothing to check and saves nothing when there is nothing to share, which is correct, not a missed opportunity. On a same-category re-run inside the 90-day cache window (below), every family with a fresh `fetched_date` recalls instead of re-searching, cutting that re-run's external search volume to zero for the families that hit while every other family still searches in full.
- **Forbidding double-count against the percentile gate.** `percentile_gate(n_points, min_points=5)` is evaluated ONCE per family, using that family's actual usable point count. Every member line of the family reports that same `n_points` value and the same percentile band or range/median resolution. Do NOT sum a family's point count across its member lines, whether at the gate check, at Rule 3's confidence labeling, or in any portfolio-level rollup: a family with 5 usable points and 3 member lines is 5 points of evidence, not 15. Summing would let duplicated evidence clear a floor it has not actually cleared; this is the main accuracy risk this rule introduces, and it is closed by keeping exactly one point set per family (the cache below) and having every consumer, the gate, the confidence label, and any rollup, read that one set.
- **(b) Persist a dated benchmark cache.** Save each family's research result to Project knowledge as `benchmark_cache.json` (or emit as a downloadable file when Project knowledge is unavailable), keyed by family (role/service + tier + geography + delivery model + category). Each entry carries the raw usable data points, source(s), `fetched_date`, and `usable_n`. A later rate line in the same run, or a later run of this skill (or of commercial-negotiation-prep or should-cost-builder consuming this skill's output for the same family), recalls a cache hit within the max age instead of re-searching, and states the reused date on that benchmark card ("Benchmark reused from [date], family: [name]"). A cache hit past the max age is not used; the skill re-searches and overwrites the entry with a fresh `fetched_date`. This is CC2 recall-don't-recompute, with `timeline_calibration.json` as the working precedent for persisting a materialized artifact to Project knowledge.
- **Max cache age: 90 days.** Chosen because this skill's source base (Janco, TEKsystems, Robert Half, G2, Gartner, and equivalent published surveys) typically refreshes quarterly to semi-annually, so 90 days is conservative against that cadence and comfortably inside the 12-month threshold above which the Aging adjustment (inlined guide) already applies. A cache hit inside 90 days needs no aging adjustment; one past 90 days is discarded rather than aged, because aging is for a number the skill is choosing to keep, not for justifying an unbounded reuse window.
- **Both floors stay.** `percentile_gate()` is unchanged and is never bypassed by family clustering or the cache: a point set that would fail the gate today still fails it on recall. The G7 research minimum is unchanged; this rule only decides whether a search that would otherwise be repeated is instead recalled or shared across a family.

## Three Operating Modes

### Mode 1: EXTERNAL
Research market rates via web search and produce benchmark cards with percentile positioning. This is the pricing intelligence service that other skills call.

### Mode 2: INTERNAL
Compare pricing, SLAs, payment terms, and contractual obligations across Lilly's own contracts within a category. Surface internal inconsistencies and best-in-portfolio terms.

### Mode 3: RATIONALIZATION
Deep-dive across a commodity to map overlapping capabilities, redundant licenses, underutilized tools, and consolidation opportunities with savings estimates.

Determine mode from user intent. If ambiguous:
> "Do you want to **benchmark against the market** (external rates), **compare across your own contracts** (internal portfolio), or **find consolidation opportunities** (rationalization)?"

---


## Research Minimums (per Execution Guardrails G7)

**Mode 1 (EXTERNAL):** Minimum 3 web searches per rate being benchmarked, or per role family when Rule 6 clustering applies (named vendor, competitor pricing, analyst/comparison data). Track searches in a research log with query, results, and usable data points. If fewer than 2 independent sources found, flag confidence as LOW. A cache hit within the 90-day max age (Rule 6) satisfies this minimum without a new search; state the reused `fetched_date`.

**Mode 2 (INTERNAL):** No web search minimum; depends on user-provided data. If fewer than 2 contracts available for comparison, flag confidence as LOW and recommend supplementing with Mode 1.

**Mode 3 (RATIONALIZATION):** Minimum 5 web searches across the capability area (feature comparisons, pricing, analyst reports). Track searches in a research log.

## Mode 1: EXTERNAL Benchmarking

### Inputs
**Required:**
1. **Category** - what's being benchmarked (IT Staff Aug, SaaS, Consulting, Lab, Hardware, etc.)
2. **Rate lines** - specific roles, SKUs, or services to benchmark (or "all lines" from a rate card)

**Optional:**
- Geography (US onshore, nearshore, offshore, specific city/region)
- Seniority levels (junior/mid/senior/lead/architect)
- Technology or specialization (Java, SAP, Cloud, etc.)
- Supplier's proposed rates (to position against benchmarks)
- Lilly's historical rates (for internal comparison overlay)

### Workflow

#### Step 1: Search Strategy

Select and execute category-appropriate web searches. See the External Market Rate Research Guide (inlined below) for the full methodology by category, the source-quality hierarchy, normalization rules, the confidence framework, and the percentile gate.

**Search principles:**
- Cluster rate lines into role families per Rule 6 BEFORE searching; run the searches below per distinct family, not per line. A family that yields fewer than 5 usable points still gets additional searches.
- Check the `benchmark_cache.json` for a fresh (within 90 days, Rule 6) entry for the family before searching; recall it and state its `fetched_date` instead of re-searching.
- Run a minimum of 3 independent searches per family. Aim for 5+ usable data points, which is the threshold to report a percentile band (see Rule 2). With 2 to 4 usable points, report range + median; with 1, report a single reference at LOW confidence.
- Prefer Tier 1-2 sources (published surveys, analyst reports) over Tier 3+ (job postings, crowdsourced)
- Segment by geography, seniority, and technology - never compare across segments
- Note source, date, and geography for every data point
- Adjust benchmarks older than 12 months by the category-specific aging direction (some categories inflate, some deflate; see Inflation/Aging adjustment in the inlined guide)

#### Step 2: Rate Benchmark Card Generation

For each rate line, produce a benchmark card. The MARKET DISTRIBUTION block is gated on N (the count of usable data points), per the Rule 2 percentile gate: show the full percentile band only at N >= 5; otherwise show range + median.

**Card variant A - N >= 5 usable data points (percentile band):**

```
RATE BENCHMARK CARD
=====================
Category:        [IT Staff Aug / SaaS / Consulting / etc.]
Rate Line:       [Role / SKU / Service - e.g., "Senior Cloud Architect, US Onshore"]
Benchmark Date:  [Date generated]
Geography:       [US Onshore - Tier 2 Metro]
Data Points:     [N >= 5] from [N] sources

MARKET DISTRIBUTION (percentiles, N >= 5):
  P10:   $[amount]    (budget tier)
  P25:   $[amount]    (competitive)
  P50:   $[amount]    (market median)
  P75:   $[amount]    (premium)
  P90:   $[amount]    (top of market)
  Range: $[low] - $[high]

SOURCES:
  1. [Source name] ([date]): $[rate] - [geography, context, Tier N]
  2. [Source name] ([date]): $[rate] - [geography, context, Tier N]
  3. [Source name] ([date]): $[rate] - [geography, context, Tier N]
  [...]

CONFIDENCE: [HIGH / MEDIUM / LOW]
  [HIGH: >= 5 data points, Tier 1-2 sources, < 12 months old, geography match]
  [MEDIUM: 3-4 data points, mixed source tiers, or partial geography match]
  [LOW: < 3 data points, Tier 3+ sources, or > 12 months old]

ADJUSTMENTS APPLIED:
  [Metro tier adjustment: +/- X%]
  [Enterprise discount estimate: -X%]
  [Aging adjustment: +/- X% for data older than 12 months, signed by the commodity's
   aging direction - IT labor / SaaS / consulting trend up, hardware trends DOWN
   (deflationary). State the direction and rate used; never assume "+".]

POSITIONING (if supplier rate provided):
  Supplier Rate:    $[amount]
  Percentile:       P[XX]   (only when N >= 5; otherwise omit)
  vs. Market Median: [+/-]$[amount] ([+/-]X%)
  Assessment:       [BELOW MARKET (favorable for Lilly) | AT MARKET | ABOVE MARKET (premium)]

POSITIONING (if Lilly historical provided):
  Lilly Historical: $[amount]
  vs. Market Median: [+/-]$[amount] ([+/-]X%)
```

**Card variant B - N = 2 to 4 usable data points (range + median, NO percentiles):**

```
RATE BENCHMARK CARD - RANGE + MEDIAN (insufficient data for percentiles, N=[N])
=====================
Category / Rate Line / Benchmark Date / Geography:  [as above]
Data Points:     [N] from [N] sources

MARKET RANGE (N < 5, percentiles withheld):
  Low:    $[amount]
  Median: $[amount]
  High:   $[amount]
  (No P10-P90 band: distribution too sparse to estimate percentiles reliably.)

SOURCES / ADJUSTMENTS APPLIED:  [as above; aging adjustment signed by commodity]
CONFIDENCE: [MEDIUM if 3-4 / LOW if 2]

POSITIONING (if supplier or Lilly rate provided):
  vs. Median:  [+/-]$[amount] ([+/-]X%)
  Assessment:  [BELOW MEDIAN | AT MEDIAN | ABOVE MEDIAN]   (no percentile - N < 5)
```

(For N = 1, do not emit a card with a distribution; report the single observed rate as a labeled reference point at LOW confidence and recommend additional research.)

**Assessment tolerance.** BELOW/AT/ABOVE MARKET (Card variant A) and BELOW/AT/ABOVE MEDIAN (Card variant B) are set by a fixed +/-3% band around the market median or P50: within +/-3%, label AT; below -3%, label BELOW; above +3%, label ABOVE.

**No standalone interactive widget is produced by this skill (removed 2026-07-31; see the Changelog).** The rate card (ASCII/XLSX) above is the complete deliverable of record for each rate line.

#### Step 3: Benchmark Summary Output

**Outputs:**
- `rate_benchmarks_[category].xlsx` - all benchmark cards in tabular format with charts. Produced by calling `market_rate_generator.py` (see "Workbook generation wiring" below), never hand-assembled cell by cell.
- `benchmark_summary_[category].docx` - narrative summary with key findings

**Workbook generation wiring (HARD RULE).** `rate_benchmarks_[category].xlsx` is produced by calling the vendored `market_rate_generator.py` (in this skill's own directory) with the validated Benchmarking Input as input, never by hand-assembling the workbook cell-by-cell in the moment. Call `generate_market_rate_workbook(raw_input, output_path)`, or its component functions `validate_benchmarking_input()` / `compute_ground_truth()` / `build_workbook()` individually when only part of the pipeline is needed. The generator validates the input, computes the Python-side ground truth via `numeric_kernel.py`, asserts the reconciliation invariants, and writes the Summary, Benchmarks, Sources and Contract Quality tabs as live Excel formulas that independently re-derive the same figures: percentiles as native `PERCENTILE.INC` over the Sources tab, and the contract-quality composite as a native `SUMPRODUCT` of scores and weights. If it raises `BenchmarkingValidationError` or `ReconciliationError`, do not deliver a workbook: surface the raised message and resolve it rather than hand-patching around the failure. If `market_rate_generator.py` cannot be read (missing or corrupted), fall back to hand-building the workbook per the conventions above and disclose plainly in the output that the vendored generator was unavailable this run.

  SCOPE, stated honestly: the generator covers the EXTERNAL-mode `rate_benchmarks_[category].xlsx` only. The INTERNAL-mode `internal_benchmark_[category].xlsx` and the RATIONALIZATION-mode `rationalization_register.xlsx` / `capability_matrix.xlsx` have no generator and are still hand-assembled. Do not claim generator provenance for those three.

  Hand-assembling the benchmark workbook is a correctness risk, not just a slower path: a percentile computed in prose is a point estimate with no audit trail, whereas the generated workbook re-derives it live from the Sources tab so a reviewer can see which data points produced it. It ships with a 24-check self-test; run `python market_rate_generator.py` to execute it.

**Summary table format:**
```
┌──────────────────────┬──────┬──────┬──────┬──────┬──────┬────────┬─────────┐
│ Rate Line            │ P25  │ P50  │ P75  │ Supp.│ Lilly│ Pctile │ Confid. │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼────────┼─────────┤
│ Sr Cloud Architect   │ $225 │ $255 │ $290 │ $285 │ $248 │ P72    │ High    │
│ Java Dev - Senior    │ $155 │ $170 │ $190 │ $175 │ $168 │ P58    │ High    │
│ QA Engineer - Mid    │ $100 │ $115 │ $130 │ $95  │ $110 │ P22    │ Medium  │
└──────────────────────┴──────┴──────┴──────┴──────┴──────┴────────┴─────────┘
```

---

## Mode 2: INTERNAL Benchmarking

### Inputs
**Required:**
1. **Category or service type** to compare across
2. **Contract data** - at least 2 contracts/suppliers for the same category (PDF/DOCX or extracted data)

**Optional (each adds a comparison dimension):**
- Spend data (for volume-weighted analysis)
- Rate cards from each supplier
- SLA/KPI commitments from each contract
- Payment terms, liability caps, insurance requirements

### Workflow

#### Step 1: Contract Collection & Normalization

For each contract in the comparison set, extract comparable terms:

**Commercial terms:**
- Rate card lines (normalize to common units - hourly, per-seat/month, etc.)
- Pricing model (fixed, T&M, consumption, hybrid)
- Volume commitments and discount tiers
- Rate escalation provisions (cap, mechanism, frequency)
- Payment terms

**Legal/compliance terms:**
- Liability cap (amount and structure)
- Indemnification scope
- Insurance requirements
- Audit rights (scope, frequency, notice period)
- Termination provisions (notice period, for-cause triggers, convenience)
- Data protection (DPA scope, sub-processor rights)
- IP ownership

**Performance terms:**
- SLA definitions and targets
- SLA credit mechanisms
- Reporting requirements
- KPI definitions and baselines

#### Step 2: Comparison Matrix Generation

Produce side-by-side comparison across all contracts/suppliers:

```
INTERNAL BENCHMARK - [Category]
=================================

PRICING COMPARISON:
┌──────────────────┬──────────────┬──────────────┬──────────────┬──────────┐
│ Rate Line        │ Vendor A     │ Vendor B     │ Vendor C     │ Best     │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ Sr Developer     │ $260/hr      │ $195/hr      │ $225/hr      │ B ($195) │
│ PM               │ $180/hr      │ $175/hr      │ $165/hr      │ C ($165) │
│ Architect        │ $310/hr      │ $275/hr      │ $295/hr      │ B ($275) │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ Blended Rate     │ $245/hr      │ $205/hr      │ $220/hr      │ B ($205) │
│ Annual Spend     │ $2.4M        │ $1.8M        │ $950K        │          │
│ PRICE RANK       │ #3 (highest) │ #1 (lowest)  │ #2           │          │
└──────────────────┴──────────────┴──────────────┴──────────────┴──────────┘

Internal Price Variance: $65/hr between best and worst for same role (33% gap)
Opportunity: If Vendor A rates aligned to Vendor B levels → $[savings] annual
```

```
SLA COMPARISON:
┌──────────────────┬──────────────┬──────────────┬──────────────┬──────────┐
│ SLA Metric       │ Vendor A     │ Vendor B     │ Vendor C     │ Best     │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ Uptime SLA       │ 99.9%        │ 99.5%        │ 99.9%        │ A/C      │
│ Response Time    │ 4 hours      │ 8 hours      │ 2 hours      │ C (2hr)  │
│ Resolution Time  │ 24 hours     │ 48 hours     │ 24 hours     │ A/C      │
│ SLA Credits      │ Yes (5%)     │ No           │ Yes (10%)    │ C (10%)  │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ SLA RANK         │ #1           │ #3 (weakest) │ #2           │          │
└──────────────────┴──────────────┴──────────────┴──────────────┴──────────┘

Insight: Vendor B has weakest SLAs AND lowest price. Vendor A has strong SLAs
but highest price. Vendor C offers best value (strong SLAs at mid-tier pricing).
```

```
OBLIGATION COMPARISON:
┌──────────────────┬──────────────┬──────────────┬──────────────┬──────────┐
│ Term             │ Vendor A     │ Vendor B     │ Vendor C     │ Best     │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ Payment Terms    │ Net 60       │ Net 45       │ Net 60       │ A/C      │
│ Liability Cap    │ $5M          │ $2M          │ $10M         │ C ($10M) │
│ Rate Escalation  │ 3% cap       │ CPI (no cap) │ 3% cap       │ A/C      │
│ Audit Rights     │ Annual       │ None         │ Annual + SOC2│ C        │
│ Term/Renewal     │ Auto, 90d    │ Auto, 30d    │ Manual       │ C        │
│ T4C Notice       │ 30 days      │ 90 days      │ 60 days      │ A (30d)  │
│ Insurance        │ $5M CGL      │ $2M CGL      │ $5M CGL      │ A/C      │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ TERMS RANK       │ #2           │ #3 (weakest) │ #1 (best)    │          │
└──────────────────┴──────────────┴──────────────┴──────────────┴──────────┘

Insight: Vendor B has weakest terms across the board - no audit rights, low
liability cap, uncapped escalation, short renewal notice. Recommend strengthening
at next renewal.
```

#### Step 3: Best-in-Portfolio Identification

For each term, identify the best-in-portfolio standard and the gap:

```
BEST-IN-PORTFOLIO ANALYSIS
============================

For each term, the best existing Lilly contract becomes the benchmark:

Term                 Best-in-Portfolio    Source        Gap (Worst vs. Best)
Sr Developer Rate    $195/hr              Vendor B      $65/hr (33%)
Uptime SLA           99.9%                Vendor A/C    0.4% (Vendor B)
Liability Cap        $10M                 Vendor C      $8M gap (Vendor B at $2M)
Audit Rights         Annual + SOC2        Vendor C      Vendor B has none
Rate Escalation      3% cap               Vendor A/C    Vendor B uncapped

TOTAL ALIGNMENT OPPORTUNITY:
  If all contracts aligned to best-in-portfolio terms:
    Pricing savings:   $[amount] annually
    Risk reduction:    [Quantified where possible]
    Compliance gap:    [N] contracts below standard
```

#### Step 4: Output Generation

**Outputs:**
- `internal_benchmark_[category].xlsx` - full comparison matrices, charts, and gap analysis
- `internal_benchmark_[category].docx` - narrative report with insights and recommendations

---

## Mode 3: RATIONALIZATION

### Inputs
**Required:**
1. **Commodity / capability area** - what to rationalize (e.g., "project management tools", "CRM platforms", "IT staffing firms", "data analytics tools")

**Required (at least one data source):**
2. **Contract portfolio** - active contracts in the commodity area
3. **Spend data** - by supplier, product, and business unit
4. **License/subscription data** - seats, users, consumption metrics

**Optional:**
- User adoption data (active users vs. licensed seats)
- Feature/capability matrices for the products
- Integration maps (what connects to what)
- Business unit feedback on tool preferences
- IT architecture requirements or standards

### Workflow

#### Step 1: Capability Mapping

Map all products/services in the commodity area to a common capability framework:

```
CAPABILITY MAP - [Commodity]
==============================

Coverage key: [Full] = core feature, fully functional; [Partial] = limited / add-on;
[Planned] = on roadmap, not yet available; [None] = not available; [?] = unconfirmed.

Capability             Vendor A     Vendor B     Vendor C     Vendor D
------------------     ---------    ---------    ---------    ---------
[Core Capability 1]    [Full]       [Full]       [Full]       [None]
[Core Capability 2]    [Full]       [Full]       [Partial]    [Full]
[Core Capability 3]    [Full]       [Partial]    [None]       [Full]
[Capability 4]         [None]       [Full]       [Full]       [None]
[Capability 5]         [Partial]    [None]       [None]       [Full]

OVERLAP SCORE: [X]% - Full Overlap capabilities / Total Unique Capabilities x 100
  (per the Overlap Score formula and Overlap Classification below; Partial Overlap
  capabilities are listed separately and do not count toward this percentage)
UNIQUE CAPABILITIES: [List capabilities only one tool provides]
GAPS: [List capabilities no current tool provides]
```

#### Step 2: Utilization Analysis

For each product/service, assess actual utilization:

```
UTILIZATION ANALYSIS
=====================

┌──────────────┬───────────┬──────────┬──────────┬───────────┬──────────────┐
│ Product      │ Licensed  │ Active   │ Utiliz.  │ Annual $  │ Cost/Active  │
├──────────────┼───────────┼──────────┼──────────┼───────────┼──────────────┤
│ [Product A]  │ 500 seats │ 320 users│ 64%      │ $450K     │ $1,406/user  │
│ [Product B]  │ 1000 seats│ 200 users│ 20%      │ $800K     │ $4,000/user  │
│ [Product C]  │ 200 seats │ 185 users│ 93%      │ $180K     │ $973/user    │
│ [Product D]  │ 300 seats │ 50 users │ 17%      │ $360K     │ $7,200/user  │
└──────────────┴───────────┴──────────┴──────────┴───────────┴──────────────┘

SHELFWARE: $[amount] in licensed but unused capacity
  [Product B]: 800 unused seats = $[amount] wasted
  [Product D]: 250 unused seats = $[amount] wasted

EFFICIENCY RANGE: $973/active user (Product C) to $7,200/active user (Product D)
```

#### Step 3: Consolidation Scenario Modeling

Build consolidation scenarios with estimated savings:

```
CONSOLIDATION SCENARIOS
=========================

SCENARIO A: Consolidate to [Product A] (best capability coverage)
  Migrate:           [Products B, C, D] → [Product A]
  Users Consolidated: [N]
  Licenses Needed:    [N] (at enterprise tier)
  Estimated Cost:     $[amount]/year
  Current Combined:   $[amount]/year
  Gross Savings:      $[amount]/year ([X]%)
  Migration Cost:     $[amount] one-time
  Net Year 1:         $[amount]
  Net Year 2+:        $[amount]/year
  Payback Period:     [N] months
  Risk:               [Migration complexity, user adoption, feature gaps]
  Feature Gaps:       [Capabilities from retired tools not in target - mitigation needed]

SCENARIO B: Dual-tool (keep [A] + [C], retire [B] + [D])
  [Same structure]

SCENARIO C: Right-size only (keep all tools, reduce licenses to match utilization)
  [Same structure - lower savings but zero migration risk]
```

#### Step 4: Rationalization Register

Produce the opportunity register:

```
RATIONALIZATION OPPORTUNITY REGISTER
======================================

┌───┬──────────────────────┬──────────┬──────────┬────────────┬──────────┐
│ # │ Opportunity          │ Savings  │ Confid.  │ Complexity │ Timeline │
├───┼──────────────────────┼──────────┼──────────┼────────────┼──────────┤
│ 1 │ [Full consolidation] │ $[amt]   │ [H/M/L] │ [H/M/L]   │ [N] mo   │
│ 2 │ [License right-size] │ $[amt]   │ [H/M/L] │ [H/M/L]   │ [N] mo   │
│ 3 │ [Vendor elimination] │ $[amt]   │ [H/M/L] │ [H/M/L]   │ [N] mo   │
│ 4 │ [Rate alignment]     │ $[amt]   │ [H/M/L] │ [H/M/L]   │ [N] mo   │
└───┴──────────────────────┴──────────┴──────────┴────────────┴──────────┘

TOTAL IDENTIFIED SAVINGS: $[sum]
QUICK WINS (high savings, low complexity): [List]
STRATEGIC (high savings, high complexity): [List]
```

#### Step 5: Output Generation

**Outputs:**
- `rationalization_report_[commodity].docx` - narrative with capability maps, utilization analysis, scenarios, and recommendation
- `rationalization_register_[commodity].xlsx` - structured opportunity register with scenario modeling tabs
- `capability_matrix_[commodity].xlsx` - product capability comparison matrix

---

## Outputs Summary (All Modes)

| Mode | Primary Output | Supporting Outputs |
|------|---------------|-------------------|
| EXTERNAL | `rate_benchmarks_[category].xlsx` | `benchmark_summary_[category].docx` |
| INTERNAL | `internal_benchmark_[category].xlsx` | `internal_benchmark_[category].docx` |
| RATIONALIZATION | `rationalization_report_[commodity].docx` | `rationalization_register.xlsx`, `capability_matrix.xlsx` |

Generate all document outputs using `docx` skill, spreadsheets using `xlsx` skill. If user requests a presentation format, use `pptx` skill.

## Integration Dependencies

### With `should-cost-builder` and `pro-forma-builder`
- This skill is the TOP-DOWN view (what the market charges). `should-cost-builder` is the BOTTOMS-UP complement (what it should cost, built from components); use them together to bracket a target.
- `pro-forma-builder` consumes these benchmark cards as the sourced cost anchors for a multi-year model.

### To `commercial-negotiation-prep`
- External benchmark cards provide the pricing intelligence for counter-offers
- Internal comparison data creates leverage ("Vendor B charges $195/hr for the same role")
- Rationalization savings feed into negotiation targets

### To `rfp-engine`
- External benchmarks inform RFP pricing evaluation criteria
- Internal benchmarks establish "should-cost" targets for supplier responses
- Capability matrices inform RFP requirements

### To `evaluation-engine`
- Benchmark data provides pricing context for scoring supplier proposals

### To `category-strategy`
- Internal benchmarking surfaces portfolio inconsistencies for strategy development
- Rationalization opportunities feed the 12-month action plan and savings targets
- Best-in-portfolio standards inform the target operating model for the category

## Reference Files

These reference documents are INLINED in this single-file build (see the "INLINED REFERENCE FILES" section near the end of this document); there are no separate files to load from disk.

- External Market Rate Research Guide (inlined below) - market rate research methodology by category, source hierarchy, normalization rules, confidence framework, and the percentile gate.
- Comparison Frameworks (inlined below) - internal comparison dimensions, scoring methodology for term quality, capability mapping taxonomy, and rationalization scenario modeling.
---

## Data-First Analysis Rules

These rules were introduced as the former "v3.0 Rules Addendum" and are folded into Version 2.1 of this skill (see Changelog).

### Data-First Analysis
1. All three modes (EXTERNAL, INTERNAL, RATIONALIZATION) must analyze provided data before making recommendations.
2. External benchmarks must come from web search with cited sources and dates. Never fabricate market rates.
3. Internal benchmarks must be derived from actual contract/spend data, not estimated.

### User Elicitation
1. **RATIONALIZATION mode:** Present capability mapping and utilization findings first, then ask user to confirm consolidation priorities before generating scenarios.
2. **EXTERNAL mode:** Present benchmark ranges, then ask user which rate lines to prioritize for negotiation.
3. **INTERNAL mode:** Present pricing gaps, then ask user for context (volume differences, scope differences) before recommending action.

### Rationalization Mode Improvements
1. **Portfolio Rationalization tab** should be includable in category strategy dashboards - produce data that the category-strategy skill can embed.
2. **Fragmentation analysis:** For any commodity, identify subcategories with 5+ vendors and low top-3 concentration (<75%) as rationalization targets.
3. **Multi-category vendor detection:** Flag vendors spanning 3+ subcategories as potential consolidation leverage points or sprawl indicators.
4. **Shelfware detection requires user data:** License counts, active users, and consumption metrics must come from the user. Don't estimate these.

### Output Standards
1. All DOCX outputs follow rfx-pipeline styling: section number badges, KPI cards, callout boxes.
2. All XLSX outputs include summary tabs with charts, not just raw data.
3. Rationalization register must include scenario modeling with migration cost estimates.

## SUITE INTEGRATION & ENHANCEMENTS

- **Native deliverable:** rate benchmark cards, internal comparison matrices, and rationalization registers.
- **Category neutrality (critical):** strong-knowledge categories may be benchmarked from inference; for niche/regulated/Lilly-specific categories, mark rate confidence Medium/Low, label the basis, and prefer a one-tap clarifier over a confident fabricated rate.
- **Serves:** commercial-negotiation-prep, rfp-engine, and evaluation-engine - return cards in a form those skills can consume directly.


## SHARED ENHANCEMENTS (Suite v2 - additive, never gating)

Everything in this section ENRICHES output. None of it is a completion gate. If an input, capability, or data point is missing, proceed and label the gap - never refuse or return an empty result. The only genuine hard stop is the compliance gate (approval thresholds / final award), and even there the action is "confirm with one tap," not refuse.

**Input manifest (start of every run).** Open with two short lines: what you received, what you are treating each input as (default-and-override, e.g. "treating column F as extended spend in USD - correct me if that's wrong"), and what is missing that would help. Then proceed immediately.

**Input tiers.** Run on the MUST tier and always deliver a real result, then name the upgrade path ("add X to deepen Y"). Never withhold output waiting for RECOMMENDED or OPTIONAL inputs. This skill's tiers are listed in its specifics section below.

**Depth, as aims not gates.** Aim for the analytical coverage in this skill's specifics section *where the data allows*. Push findings toward numbers, magnitudes, and ranges (% concentration, $ exposure, savings bands) over qualitative-only statements. Every finding carries a "so what" - the decision it implies. Depth is not length: cut any section that does not add decision value rather than padding it.

**Honesty guardrail (hard rule).** Label estimates as ranges with stated assumptions. Mark inferred figures "estimated - no source." Never fabricate precision and never invent a citation. "Not available for this category" is always an acceptable answer.

**Citations, calibrated by source.** External figures (market rates, supplier positioning, market structure) carry source name, link where available, an "as of" date, and a High/Medium/Low confidence flag, so a rep can defend the number to a supplier. Internal references carry light provenance: clause number, data field and period, requirement ID, or supplier-response section. Cite the contestable and the external; do not footnote the obvious in narrative prose.

**Edge cases.** Hold up at the margins, not just the happy path: a single supplier, an empty or one-line category, a near-empty file. Produce the best real result the input supports, and say what would sharpen it.

**Currency & locale.** Global Lilly spans currencies and regions. Detect or confirm currency, handle multi-currency inputs, and state any FX assumption and its date. Do not silently mix currencies.

**Shared vocabulary.** Use suite-standard terms consistently: Kraljic (strategic / leverage / bottleneck / routine), TCO, tail spend, addressable vs non-addressable spend, should-cost, rate card, TfC (termination for convenience). Define a term once on first use when the audience may be non-expert.

**Limitations note.** Analytical deliverables close with a short "What would change this conclusion" - the key assumptions or missing data that, if different, would move the recommendation.

**Capability-based adaptation (adapt to what is available; do not try to detect which product you are in).**
- *Deliverable format:* if file-creation and code execution are available, produce the rate cards and the `rate_benchmarks_[category].xlsx` workbook via `market_rate_generator.py` (no dashboard, no PPTX -- this skill produces neither). If they are not - e.g. running inside Word - produce the in-document equivalent: structured tables, headings, and summaries that live in the document. A missing renderer never means no deliverable.
- *Question mechanism:* use the tappable option-picker when available; degrade to one concise inline question when it is not.
- *Web research:* if web search is unavailable, say so and proceed on provided data, or recommend running that step in standalone - never silently present a thin benchmark as if it were complete.
- *Projects / multi-user:* look for existing project artifacts and build on them instead of regenerating; stamp outputs with date, author, and the inputs used; do not promote one rep's working assumptions into project-wide truth.
- *Honest degradation:* whenever something cannot run, add a one-line user-facing note saying what was skipped and how to get the full version - never fail silently or present a degraded output as complete.

## SUITE v2 SPECIFICS - market-rate-benchmarking

**Input tiers.** MUST: a category, role, or SKU to benchmark (EXTERNAL mode, the default, runs from this alone). RECOMMENDED: current rates/pricing and region. OPTIONAL relative to the default EXTERNAL mode: an internal contract set (INTERNAL mode), a commodity scope with spend/vendor list (RATIONALIZATION mode). These are OPTIONAL only while EXTERNAL mode runs; once the user elects INTERNAL or RATIONALIZATION mode, the corresponding input becomes MODE-REQUIRED and BLOCKING per BLOCKING FILE INPUTS and that mode's own Required list (stop and wait for it within the elected mode). The "never withhold output" rule above therefore governs enriching inputs on the default EXTERNAL run, not the required input of a mode the user has already elected.
**External search runs two sweeps:**
1. *Named suppliers* - the incumbent and known alternatives: published rate cards and pricing pages, analyst and G2/Gartner-type positioning, and recent deal or funding signals that affect leverage. Searching a supplier by name is ordinary market research, not a confidentiality concern.
2. *Substitutes and the adjacent market* - other providers in the category, alternative delivery and pricing models, and lower-cost or different-structure options the rep may not have considered. This sweep is a primary source of leverage and is not optional.
**Attribution:** every external figure carries source, link where available, an "as of" date, and a confidence flag. For niche/regulated/thin-data categories, lower the confidence and show the basis rather than presenting a sparse result as a firm benchmark.
**Depth aims:** percentile positioning, rate-by-rate comparison; INTERNAL mode aims for a cross-contract comparison matrix; RATIONALIZATION mode aims for a redundancy/consolidation register with savings ranges.
**Serves:** commercial-negotiation-prep, rfp-engine, evaluation-engine - return cards those skills can consume directly.

---

# INLINED REFERENCE FILES

The following files were previously in subdirectories. They are now inlined for single-file installation.

---

## INLINED: references/comparison-frameworks.md

# Comparison Frameworks

Internal benchmarking dimensions, term quality scoring, capability mapping taxonomy, and rationalization scenario modeling.

## Internal Comparison Dimensions

When comparing contracts across Lilly's portfolio, analyze these dimensions:

### Dimension 1: Pricing

| Metric | How to Compare | What "Best" Means |
|--------|---------------|-------------------|
| Rate per role/SKU | Normalize to hourly or per-unit; compare same role across vendors | Lowest rate for equivalent quality/capability |
| Blended rate | Volume-weighted average across all rate lines | Lowest blended cost |
| Rate escalation | Annual cap %, mechanism (CPI vs. fixed), compounding | Lowest cap, fixed preferred over CPI-linked |
| Discount structure | Volume tiers, multi-year discounts | Deepest discounts at Lilly's actual volume |
| Hidden costs | T&E caps, change order markups, admin fees | Fewest add-on charges, tightest caps |
| Total cost of ownership | All-in annual cost including base + variable + hidden | Lowest TCO per unit of output |

**Scoring (1-5):**
- 5: Lowest cost in portfolio (or within 5% of lowest)
- 4: Below portfolio median
- 3: At portfolio median (±5%)
- 2: Above portfolio median
- 1: Highest cost (or >20% above median)

### Dimension 2: SLA / Performance Commitments

| Metric | How to Compare | What "Best" Means |
|--------|---------------|-------------------|
| Uptime/availability | % commitment | Highest % (99.99% > 99.9% > 99.5%) |
| Response time | Hours to first response by severity | Shortest response times |
| Resolution time | Hours to resolution by severity | Shortest resolution times |
| SLA credits | Credit mechanism and % | Credits exist AND meaningful (≥5% per breach) |
| Reporting | Frequency and depth | Most frequent, most detailed |
| SLA measurement | How SLA is measured and who measures | Independent measurement preferred |

**Scoring (1-5):**
- 5: Best-in-portfolio SLAs with meaningful credit mechanism
- 4: Strong SLAs with credits
- 3: Standard SLAs, credits exist but minimal
- 2: Weak SLAs or no credit mechanism
- 1: No formal SLAs or unmeasured commitments

### Dimension 3: Legal / Risk Protection

| Metric | How to Compare | What "Best" Means |
|--------|---------------|-------------------|
| Liability cap | Dollar amount and structure | Highest cap relative to contract value |
| Indemnification | Scope and breadth | Broadest supplier indemnification for Lilly |
| Insurance | Coverage types and amounts | Highest coverage amounts, all required types |
| Audit rights | Scope, frequency, notice period | Broadest rights, most frequent, shortest notice |
| Data protection | DPA scope, sub-processor controls | Most comprehensive data protection |
| IP ownership | Work product ownership, background IP | Clearest Lilly ownership of work product |
| Termination flexibility | Notice periods, fees, convenience rights | Shortest notice, lowest exit cost |

**Scoring (1-5):**
- 5: Exceeds Lilly playbook standards on all terms
- 4: Meets playbook standards
- 3: Meets most standards, minor gaps
- 2: Below playbook on multiple terms
- 1: Significantly below playbook, material risk exposure

### Dimension 4: Operational Terms

| Metric | How to Compare | What "Best" Means |
|--------|---------------|-------------------|
| Payment terms | Net days | Longest payment terms (Net 60+) |
| Invoice format | Requirements, detail level | Most detailed, electronic, auto-matched to PO |
| Change order process | Approval requirements, pricing | Tightest controls, fixed-price changes |
| Key personnel | Replacement rights, approval | Lilly approval required, notice on changes |
| Subcontracting | Controls and flow-down | Strongest flow-down, Lilly approval required |
| Governance | Meeting cadence, reporting | Most structured, regular QBR included |

**Scoring (1-5):**
- 5: Best operational terms in portfolio
- 4: Strong, well-structured
- 3: Adequate, standard
- 2: Weak, gaps in controls
- 1: Minimal controls, governance gaps

## Composite Contract Quality Score

Combine dimension scores into a single contract quality metric:

```
Contract Quality = (Pricing × 0.30) + (SLA × 0.25) + (Legal × 0.25) + (Operational × 0.20)
```

Base weights sum to 1.00. EVERY category profile below must also sum to exactly 1.00; verify the sum before scoring (if a profile does not sum to 1.00, do not use it). (Per Rule 5 in this SKILL.md: this sum check and the composite score itself are computed by calling `weighted_score()` in the vendored `numeric_kernel.py`, never by model judgment.)

**Adjust weights by category (each profile sums to 1.00):**
- For leverage/commodity categories: Pricing 0.40, SLA 0.25, Legal 0.20, Operational 0.15 (sum 1.00). Pricing is raised by reducing both Legal and Operational, not Legal alone.
- For strategic/GxP categories: Pricing 0.20, SLA 0.30, Legal 0.30, Operational 0.20 (sum 1.00).
- For IT/SaaS: Pricing 0.30, SLA 0.30, Legal 0.25, Operational 0.15 (sum 1.00).

**Quality classification:**
- 4.0-5.0: GOLD standard - use as best-in-portfolio benchmark
- 3.0-3.9: SILVER - adequate, targeted improvements at renewal
- 2.0-2.9: BRONZE - below standard, priority renegotiation
- <2.0: BELOW STANDARD - flag for immediate attention

## Best-in-Portfolio Standard Setting

After scoring all contracts in a category:

1. **Identify the GOLD contract** - highest overall quality score
2. **For each dimension, identify the best individual term** - may come from different contracts
3. **Construct the "ideal portfolio standard"** - best term from each dimension
4. **Calculate the gap** between each contract and the ideal standard
5. **Prioritize remediation** by: gap size × contract value × renewal proximity

```
IDEAL PORTFOLIO STANDARD - [Category]
========================================

Dimension           Best Term                Source Contract     Standard Target
Pricing             $195/hr blended          Vendor B            $195-$210/hr
Uptime SLA          99.9%                    Vendor A            99.9%
Response Time       2 hours (P1)             Vendor C            ≤4 hours
Liability Cap       $10M                     Vendor C            ≥$5M
Rate Escalation     3% annual cap            Vendor A/C          ≤3% cap
Payment Terms       Net 60                   Vendor A/C          Net 60
Audit Rights        Annual + SOC2            Vendor C            Annual minimum

GAP ANALYSIS:
  Vendor A: Pricing gap ($65/hr above best) - address at renewal [Date]
  Vendor B: Legal gap (no audit, low liability) - address at renewal [Date]
  Vendor C: [At or near portfolio standard - maintain]
```

## Capability Mapping Taxonomy

For RATIONALIZATION mode, map products/services to a structured capability framework.

### Generic Capability Hierarchy

```
Level 1: Capability Domain (e.g., "Project Management")
  Level 2: Capability Group (e.g., "Task Management")
    Level 3: Specific Capability (e.g., "Kanban Boards")
```

### Coverage Assessment per Product

| Rating | Marker | Meaning |
|--------|--------|---------|
| Full | [Full] | Core feature, fully functional, actively used |
| Partial | [Partial] | Available but limited, requires workaround, or add-on module |
| Planned | [Planned] | On vendor roadmap but not yet available |
| None | [None] | Not available and no roadmap |
| Unknown | [?] | Could not confirm - requires vendor input |

### Overlap Classification

| Overlap Type | Description | Consolidation Impact |
|-------------|-------------|---------------------|
| **Full Overlap** | Both products provide the same capability at the same quality | One can be eliminated |
| **Partial Overlap** | Both provide capability, but one is stronger | May need the stronger one |
| **Complementary** | Each provides unique capabilities the other lacks | Consolidation requires gap mitigation |
| **No Overlap** | Products serve entirely different needs | Not candidates for consolidation |

### Overlap Score

```
Overlap Score = (Full Overlap Capabilities) / (Total Unique Capabilities) × 100

Interpretation:
  >75%: High overlap - strong consolidation case
  50-75%: Moderate overlap - consolidation possible with gap mitigation
  25-50%: Low overlap - limited consolidation opportunity
  <25%: Minimal overlap - likely serving different needs
```

## Rationalization Scenario Modeling

### Scenario Types

| Scenario | Description | Risk | Savings Potential |
|----------|-------------|------|-------------------|
| **Full Consolidation** | Migrate all to one platform | High (migration risk, adoption) | Highest |
| **Partial Consolidation** | Keep 2, retire the rest | Medium | Moderate-High |
| **Right-Sizing** | Keep all, reduce licenses to match utilization | Low | Moderate |
| **Renegotiation** | Keep all, renegotiate using internal benchmarks | Low | Low-Moderate |
| **Feature Optimization** | Shift usage between tools to maximize existing licenses | Low | Low |

### Scenario Modeling Template

For each scenario, calculate:

```
SCENARIO: [Name]
==================

CURRENT STATE:
  Products:         [N]
  Total Annual Cost: $[amount]
  Total Users:       [N] (licensed), [N] (active)
  Shelfware Cost:    $[amount] (licensed but unused)

TARGET STATE:
  Products:         [N]
  Estimated Cost:    $[amount]
  Users Served:      [N]

SAVINGS:
  License Savings:   $[amount] (eliminated products/seats)
  Rate Savings:      $[amount] (volume leverage on remaining)
  Admin Savings:     $[amount] (reduced vendor management)
  Integration Savings: $[amount] (simplified architecture)
  ─────────────────────────────────────
  Gross Annual:      $[amount]

COSTS:
  Migration:         $[amount] (one-time)
  Training:          $[amount] (one-time)
  Temporary Overlap: $[amount] (parallel running period)
  ─────────────────────────────────────
  Total One-Time:    $[amount]

NET ANALYSIS:
  Year 1:            $[gross savings − one-time costs]
  Year 2+:           $[gross annual savings]
  3-Year NPV:        $[calculated]
  Payback Period:     [N] months

RISKS:
  1. [Risk]: [Likelihood] × [Impact] - [Mitigation]
  2. [Risk]: [Likelihood] × [Impact] - [Mitigation]

DEPENDENCIES:
  [What needs to happen - IT involvement, BU alignment, contract timing]

RECOMMENDATION: [Proceed / Proceed with conditions / Defer / Not recommended]
```

### Quick-Win Identification

Flag opportunities that have high savings with low effort:

**Quick-win criteria (must meet ALL):**
- Savings >$50K annually
- Complexity = LOW (no migration, just license reduction or vendor elimination)
- Timeline <3 months to realize
- No business disruption (unused seats/products only)
- No IT dependency (no integrations to untangle)

### Utilization Thresholds

| Utilization | Classification | Action |
|-------------|---------------|--------|
| >80% | Well-utilized | Maintain, possibly expand |
| 50-80% | Under-utilized | Right-size licenses, investigate adoption barriers |
| 25-50% | Significantly under-utilized | Consider consolidation or elimination |
| <25% | Shelfware | Immediate right-sizing or elimination candidate |
| 0% | Zombie license | Terminate immediately - no active users |

### Integration Complexity Assessment

When evaluating consolidation feasibility, assess integration complexity:

| Factor | Low Complexity | Medium Complexity | High Complexity |
|--------|---------------|-------------------|-----------------|
| Data migration | Structured, standard formats | Some custom, mappable | Complex, proprietary formats |
| Integrations | None or standard API | 2-5 custom integrations | >5 or deeply embedded |
| Workflows | Generic, replaceable | Some custom workflows | Business-critical custom processes |
| User count | <100 | 100-1000 | >1000 |
| Training | Self-service | Guided training needed | Extensive retraining |
| Timeline | <3 months | 3-6 months | >6 months |

**Complexity score:** Sum of factor scores (Low=1, Med=2, High=3). Total 6-8 = LOW, 9-13 = MEDIUM, 14-18 = HIGH.

---

## INLINED: references/external-research-guide.md

# External Market Rate Research Guide

Authoritative methodology for market rate research by procurement category. This is the centralized benchmarking reference - `commercial-negotiation-prep` and other skills call this skill for pricing intelligence.

## Source Quality Hierarchy

| Tier | Source Type | Reliability | Weight | Examples |
|------|-----------|-------------|--------|---------|
| 1 | Published compensation/rate surveys | High | 1.0x | Janco, Foote Partners, Radford, SIA, Mercer |
| 2 | Analyst firm reports | High | 0.9x | Gartner, Forrester, IDC, Everest Group, ISG |
| 3 | Vendor pricing pages / government schedules | Medium-High | 0.8x | SaaS pricing pages, GSA schedules |
| 4 | Industry association data | Medium | 0.7x | CompTIA, ISPE, DIA |
| 5 | Job posting aggregators | Medium | 0.6x | Indeed, Glassdoor, Levels.fyi |
| 6 | Crowdsourced platforms | Low-Medium | 0.4x | Blind, Reddit, Vendr |
| 7 | Single anecdotal sources | Low | 0.2x | Blog posts, individual posts |

Always cite source tier. When computing percentiles from mixed-tier sources, apply tier weight.

## Confidence Framework

| Level | Criteria | Suitable For |
|-------|----------|-------------|
| **HIGH** | ≥5 data points, majority Tier 1-2, <12mo old, geography match | Counter-offers, executive presentations, savings commitments |
| **MEDIUM** | 3-4 data points, mixed tiers, or partial geography match | Directional guidance, negotiation ranges, category planning |
| **LOW** | <3 data points, Tier 3+ only, or >12mo old | Awareness only, flagged as indicative, requires additional research |

## Percentile Calculation (percentile gate: N >= 5)

This implements the single percentile threshold defined in Rule 2. Percentiles are reported ONLY when there are at least 5 usable data points for the rate line. Per Rule 5, do not decide this in the moment: call `percentile_gate(n_points)` from the vendored `numeric_kernel.py` and honor its return value (`True` -> percentile band, `False` -> range + median or single reference point per N).

When N >= 5 usable data points per rate line:
1. Collect all data points, apply tier weights
2. Sort ascending
3. Calculate weighted percentile: `P = (weighted count below value) / (total weighted count) × 100`
4. Report P10, P25, P50, P75, P90 and the range (use card variant A)

When N = 2 to 4 data points: report the RANGE and the MEDIAN only, NOT percentiles. Note "insufficient data for percentiles, N=[N]" (use card variant B). There is no 3-data-point percentile path; this supersedes any older text that computed percentiles at N=3.

When N = 1 data point: report as a single reference point, confidence = LOW, no range and no percentiles.

## Category-Specific Research

### IT Staff Augmentation

**Rate structure:** Hourly bill rate (includes margin, benefits, overhead - not salary).

**Segmentation:**
- Role: Developer, Architect, PM, BA, QA, Data Engineer, Cloud Engineer, Security, DBA
- Seniority: Junior (0-3yr) / Mid (3-7yr) / Senior (7-12yr) / Lead (12+yr) / Principal/Architect
- Technology: Java, Python, .NET, Cloud (AWS/Azure/GCP), SAP, Salesforce, ServiceNow, AI/ML
- Geography: US Onshore (by metro tier) / Nearshore (LatAm, Canada) / Offshore (India, E. Europe)

**Search queries:**
- "[role] contract rate [city] 2025"
- "[technology] developer hourly rate staffing"
- "IT staffing bill rate survey [year]"

**Primary sources:** Janco Associates, Foote Partners, SIA, Robert Half Technology (×1.55 salary-to-bill-rate), TEKsystems, GSA Schedule 70

**Bill rate from salary:** `Bill rate = Annual salary ÷ 2,080 × multiplier`
- Large staffing firms: 1.45-1.60x
- Boutique/specialty: 1.55-1.75x
- Managed services: 1.65-1.85x
- Offshore delivery: 1.30-1.50x

**Metro tier adjustments:**
- Tier 1 (SF, NYC, Seattle, Boston): +15-25%
- Tier 2 (Chicago, DC, LA, Austin, Denver): +5-15%
- Tier 3 (Indianapolis, Charlotte, Nashville): baseline
- Tier 4 (smaller metros): -5-15%

### SaaS / Software

**Rate structure:** Per-seat/month, per-user/month, platform fee + usage, enterprise license.

**Segmentation:**
- Pricing model: Per-seat, consumption, platform+usage, flat enterprise
- Tier: Standard / Professional / Enterprise
- Contract size: SMB (<100 seats) / Mid (100-1K) / Enterprise (1K+)
- Commitment: Monthly / Annual / Multi-year

**Search queries:**
- "[product] pricing 2025"
- "[product] enterprise cost per user"
- "[product category] benchmark"

**Primary sources:** Vendor pricing pages, G2, Gartner Peer Insights, Zylo, Productiv, Vendr

**Enterprise discount expectations:**
- 100-500 seats: 10-15% off list
- 500-1K seats: 15-25% off list
- 1K-5K seats: 20-35% off list
- 5K+ seats: 30-45% off list
- 2-year: additional 5-10%; 3-year: additional 10-20%

### Professional Services / Consulting

**Rate structure:** Daily rate, hourly rate, or blended rate.

**Segmentation:**
- Firm tier: MBB / Big 4 / Tier 2 / Boutique / Independent
- Role level: Analyst → Consultant → Sr Consultant → Manager → Sr Manager → Director → Partner
- Specialty: Strategy, Operations, Technology, Digital, Risk, Regulatory

**Search queries:**
- "[firm tier] consulting daily rate [year]"
- "[specialty] consulting rates benchmark"

**Primary sources:** ALM Intelligence, Source Global Research, Kennedy Consulting, GSA Professional Services Schedule

**Typical ranges (US, hourly):**
```
         Analyst    Consultant  Manager    Director   Partner
MBB:     $435-625   $625-875   $750-1,125 $1,000-1,500 $1,250-2,250
Big 4:   $250-375   $310-500   $435-690   $625-1,000   $875-1,500
Tier 2:  $190-280   $250-400   $310-500   $435-750     N/A
Boutique: Varies widely - typically 10-30% below Big 4
```

### Lab Services / CRO

**Rate structure:** Per-sample, per-assay, per-study, FTE-based, milestone-based.

**Segmentation:**
- Service: Bioanalytical, DMPK, Toxicology, Analytical Chemistry, Biologics
- Regulatory: GLP / non-GLP / GMP / cGMP (GLP premium: 25-50%)
- Throughput: Standard / Rush / High-throughput

**Search queries:**
- "[assay type] CRO pricing per sample"
- "bioanalytical testing cost benchmark [year]"

**Primary sources:** CRO industry surveys, BioPharma benchmarking, Outsourced Pharma

### Hardware / Equipment

**Rate structure:** Unit price, per-spec-class, lease vs. purchase.

**Segmentation:**
- Equipment type and specification class
- Manufacturer (OEM vs. reseller vs. refurbished)
- Volume (single vs. fleet)

**Search queries:**
- "[equipment] pricing [spec] [year]"
- "[manufacturer] [model] list price"

**Primary sources:** Manufacturer MSRP, GSA Advantage (15-30% below list), CDW/SHI/Insight

**Discount expectations from list:**
- Standard: 15-25% off
- Large volume: 25-40% off
- Strategic/enterprise: 30-50% off
- End-of-quarter: additional 5-15%

## Normalization Rules

All rates must convert to common units:

| Input | Normalize To | Conversion |
|-------|-------------|------------|
| Annual salary | Hourly rate | ÷ 2,080 |
| Daily rate | Hourly rate | ÷ 8 |
| Monthly fee | Annual | × 12 |
| Per-seat/month | Per-seat/annual | × 12 |
| Per-FTE/month | Hourly | ÷ 173 |

**Currency:** Normalize to USD at current exchange rate. Note rate and date.

**Aging adjustment (benchmarks > 12 months old).** This is a SIGNED, directional adjustment per commodity, not a fixed "+X%": some commodities inflate, hardware deflates. Apply the sign shown and state the direction and rate used on the card. Never assume an upward adjustment for all commodities.
- IT labor: +3% to +5% annual (inflationary)
- SaaS: +5% to +8% annual (inflationary)
- Consulting: +3% to +5% annual (inflationary)
- Lab services: +2% to +4% annual (inflationary)
- Hardware / equipment: -3% to -5% annual (DEFLATIONARY - aging adjustment is downward)
- Categories not listed: research the price trend before adjusting; if the direction is unknown, do not apply an aging adjustment and label the figure as un-aged.
