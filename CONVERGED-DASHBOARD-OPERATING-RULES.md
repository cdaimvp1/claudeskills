# Converged Dashboard Operating Rules

**Status:** Adopted reference · **Source:** formalizes `PLATFORM-CONSOLIDATION-TRACKER.md` §A3 (Three Operating Principles) and §A4 (Data Grounding & Fallback Protocol) · **Scope:** every skill and every platform-tab dashboard (Landscape, Deal, RFx, My Work, and the ~10 rebuilt-in-platform-language dashboards).

This is not new policy. It is the adoptable, stand-alone version of decisions already locked in the tracker, written so a skill author or a dashboard builder can follow it without reading the tracker's build history. If this document and the tracker ever disagree, the tracker's Part A is authoritative and this file should be corrected to match.

---

## 1. Data Grounding & Fallback

**Principle:** never fabricate; ground or abstain. Every number, claim, and rank on a dashboard traces to a source or is explicitly marked as an estimate, a gap, or an inference.

### 1.1 Sourcing order

Pull data in this order, stopping at the first source that actually answers the question:

1. **User inputs** — what the requester typed, uploaded, or selected this session. Highest trust; always current.
2. **ARIA / Fabric** — Lilly-internal, deterministic-from-Fabric data, already provenance-labeled. Still validate where cheap: a role-gated or empty field means *unavailable to this query*, not *zero* or *not applicable*.
3. **M365 connector** (SharePoint / OneDrive / email / Teams) — pull grounded organizational context (prior contracts, category playbooks, past correspondence) when connected. **If the connector is off, tell the user to enable it before running** rather than silently skipping it or guessing at its contents.
4. **Web research** — external market/vendor/regulatory facts. Every claim pulled this way carries source + date + confidence.
5. **Model inference** — reasoning over the grounded data already collected. Inference never invents a fact; it only draws conclusions from what sourcing steps 1-4 established. If there is nothing grounded to reason over, there is nothing to infer.

Sources are declared, not hardcoded. A recipe or dashboard states which of the five it draws on and degrades gracefully when one is absent — the ladder in §1.2 is what "degrades gracefully" means operationally.

### 1.2 Fallback ladder

When a required input is not yet available, work down this ladder before rendering anything:

1. **Source harder.** Re-read the inputs already in hand, pull more from ARIA, widen the web search. Most "gaps" are solved here — do not ask the user for something one more pass would find.
2. **Ask the user once.** A single targeted, batched ask (not a drip of one-off questions). Name what's missing and what it unblocks. Offer three response shapes: *provide it directly*, *point me to it* (a link, a doc, a system), or *mark unavailable*. Never re-ask for the same fact twice in a session.
3. **Labeled gap state.** If still unavailable, degrade to the reusable gap-state component (see `_platform_build/assets/gap-state-component.md`): show the panel's structure, state "missing X · needed for Y," and never zero-fill. A dash is not a zero and is not a verified Low — those are three different facts and must render as three different things. Block any computed metric that depends on the missing value, and drop confidence (with a visible reason) on any conclusion that depends on it.
4. **Degrade scope, not truth.** Render everything the present inputs actually support. Mark the rest as gaps rather than padding the dashboard to look complete. A dashboard with three solid panels and one honest gap panel is correct; a dashboard with four confident-looking panels where one is quietly invented is not.

### 1.3 Per-panel-type gap rendering

The right way to show "I don't know" depends on what the panel is:

| Panel type | Gap behavior |
|---|---|
| **Quantitative** (scores, tables, heatmaps) | Mark the cell unknown (dash / muted glyph). Never zero-fill — a zero reads as a measured, bad result, which is a different claim than "not scored." |
| **Financial model** (pro forma, TCO, NPV) | An unknown driver becomes a **user-set slider** with a labeled default assumption ("Discount rate — no source found; default 8%, adjust if you have a better number"), never a silently fabricated value baked into the model. |
| **Ranking** (shortlists, scored comparisons) | Rank only what is actually scored. List what couldn't be assessed as its own line, not folded into the ranked set at a default score. |
| **Narrative** (summaries, rationale, recommendations) | State what's known, flag what's unknown, no filler sentences written to make the paragraph feel complete. |

### 1.4 Hard guardrails

These are tripwires, not style preferences:

- **Provenance or label, always.** Every value on screen carries either a source + date, or an explicit "estimate / illustrative" label plus the method used to derive it. No unmarked numbers, ever.
- **Distinguish Observed / Inferred / Missing.** These are three states, not shades of the same thing, and the UI must not blur them into one visual treatment.
- **Signal confidence.** High / Medium / Low, visible at the point of use, not buried in a footnote three scrolls down.
- **Abstain on compliance, legal, and financial exposure.** Where a wrong guess carries real risk, the system says "not enough grounded data to call this" rather than producing a plausible-sounding answer. This overrides any instinct to always give the user a number.

### 1.5 Extensibility

The sourcing order is a ladder, not a closed list. Additional sources join it over time — Ariba, ServiceNow, Aravo, and CLM as read-only feeds are the known next additions — without changing the shape of the protocol: each new source slots into the ladder at the appropriate trust level, is declared by the recipes/dashboards that use it, and degrades the same way (§1.2) when it isn't reachable. A dashboard should never hard-fail because one declared source is absent; it renders what it can and gap-states the rest.

---

## 2. Materialized Artifacts

**Principle:** heavy LLM analysis runs once, is persisted with its provenance, and is recalled — never regenerated per view.

- **Generate once, persist, recall.** The first time a skill's analysis-core runs for a given project/target, the output is written to a durable artifact (DB row, graph node, or `.md`/`.json` file — whatever the skill already uses) tagged with `generatedAt` and its own provenance chain (which sources fed it, per §1). Every subsequent view of that same analysis reads the artifact; it does not re-run the model.
- **Never co-hold two big analyses in one context.** If a dashboard needs input from two heavy analyses (e.g., a Legal Protection read and a Deal Economics read), it reads both as *already-materialized* artifacts and assembles them deterministically — it does not open both underlying skill runs live in the same context window to reconcile them on the fly.
- **A shared dashboard assembles deterministically.** The dashboard-building step (the Python builder, or the equivalent renderer) is a deterministic assembly of persisted artifacts plus seed/template data. It contains no LLM call of its own. If a panel needs content that isn't materialized yet, that panel gap-states (§1.2) rather than triggering an inline generation.
- **Tight context → persist-and-continue, never silent degrade.** If a build is running low on context mid-analysis, the correct move is to persist what's been produced so far (with provenance intact) and continue in a fresh context picking up from the artifact — not to quietly truncate, summarize-under-pressure, or drop grounding to fit the remaining space. A visibly resumed job beats an invisibly shortened one.
- **Staleness is explicit, not silent.** An artifact's `generatedAt` is shown wherever the artifact is surfaced. Refresh is either TTL-driven or a manual "refresh this analysis" action — never an unannounced silent regeneration that could disagree with what the user saw a minute ago.

## 3. Output-Scoped Execution

**Principle:** the deliverable the user actually asked for decides which stages of which skills run. Nothing generates that wasn't asked for or isn't required to produce what was asked for.

- **Split every skill into an analysis-core and output-specific renderers.** The analysis-core does the grounded research and reasoning once and writes the materialized artifact (§2). Renderers are thin, deliverable-specific outputs built from that artifact: a dashboard view, a redline `.docx`, an SOW `.docx`, a pro-forma `.xlsx`, a PPTX deck.
- **A dashboard-only request runs core → artifact → dashboard, and stops there.** It skips every document renderer (redline, SOW, pro forma, deck) unless the user separately asks for that document. Producing a `.docx` nobody asked for is waste, not thoroughness.
- **State what runs, state what's skipped.** Before or alongside doing the work, say plainly which stages ran ("ran the contract-review analysis-core and built the dashboard; did not generate the redline") so the user always knows the scope of what they're looking at and what a follow-up would additionally trigger.
- **Ask only when ambiguous *and* expensive.** If the requested output is clear, don't ask — run it. If it's genuinely ambiguous which deliverable is wanted (dashboard vs. a full document set) and guessing wrong would burn a non-trivial analysis pass, offer one tappable picker up front rather than silently picking one and rebuilding later.

---

## How the three principles compose

They are not independent — each depends on the one before it:

1. **Grounding (§1)** determines what facts are safe to put on screen at all, and what must render as a labeled gap.
2. **Materialization (§2)** ensures the grounded analysis that produced those facts is computed once and reused, so every renderer downstream sees the same grounded state rather than re-deriving it (and possibly re-grounding it differently) each time.
3. **Output-scoping (§3)** decides which renderers actually run against that materialized, grounded artifact for a given request — so cost and turnaround match what was asked for, not the maximum possible output.

A converged dashboard that follows all three: sources honestly, computes once, and renders only what was requested — nothing fabricated, nothing wasted, nothing regenerated.
