# Lilly Procurement Skills Suite v10.6.6 - July 2026 expansion
## Tier 1 (inlined) bundle - recommended / most durable

This bundle is the v10.6.6 suite plus the **July 2026 expansion**: net-new skills, interactive dashboards across the suite, the Personal Command Center rework, and a guided THEO orchestrator, all built on the same v10.6.6 baseline (the guardrail set, color canon, and shared block are unchanged; every skill still stamps `Suite: v10.6.6`). Install order and the Project workflow are unchanged from v10.6.6 (lilly-brand-assets first, procurement-launcher second; the new skills install after the foundations).

## What's new in the July 2026 expansion

**Net-new skills (6)**
- **scope-sow-architect** - diagnoses/builds/repairs a Statement of Work (weighted 0-100 Scope Definition Score, boundary/RACI/acceptance/rate-card, issuance-ready rewrite). Distinct from lilly-contract-review (work-definition quality, not legal protection).
- **procurement-options-analysis** - compares up to ten paths for one decision (buy/build/expand/reuse/consolidate/defer/RFI/RFP/direct-negotiate/pilot), scored and reconciled against evidence gaps, into a recommended path.
- **sole-source-challenge** - challenges a proposed sole-source pick (unique capability, competition, urgency, alternatives, constraint) into a Defensibility verdict + justification or a weak-rationale finding with alternatives.
- **invoice-rate-card-auditor** - line-level invoice audit vs the contract/rate-card/PO/timesheets (rate/escalation/duplicate/questioned-amount, kernel-backed math) + a draft dispute notice.
- **deal-room** - a working negotiation deal space that consolidates positions and hands off at close.
- **procurement-help-desk** - a NEW end-user (stakeholder) front door: "how do I onboard a supplier / check an invoice / open a PO / start a buy / who do I contact". Ships as an OFFLINE SCAFFOLD; its cited content harvest is network-gated (must be run on the Lilly network) - see the network-gated block inside its SKILL.md. Bounded against process-navigator (which serves the procurement rep).

**Interactive dashboards across the suite** - every applicable skill now ships a reference dashboard paired with narrative analysis (G7/G8 depth), including what-if modeling: an escalation-cap -> multi-year TCO slider (pro-forma-builder + commercial-negotiation-prep), award-scenario weighting (evaluation-engine), and rate/spend projection (market-rate-benchmarking, category-strategy).

**Personal Command Center (theos-field-guide)** - reworked to be data-object-first (a defensively-parsed JSON island that cannot blank the board on a bad payload; it degrades to your saved work graph), with a work-graph KPI strip, filter/lens, an abstaining next-best-action (it declines to recommend when signal is weak, and says why), a communications convergence view, and on-demand renewal-radar / savings / report-card views. Display name promoted to "Personal Command Center"; the skill id, storage key, and state-file name are unchanged, so existing saved graphs are preserved.

**THEO guided orchestrator (procurement-launcher)** - matured from a menu into a guided path: state a free-text need ("I need to buy software for X") and THEO classifies it, names the full ordered path up front, and hands off step by step along the corrected chains. Guided handoff is human-in-the-loop (you drive; THEO leads); it does not auto-invoke skills.

**Six adaptations folded into existing skills** - spend-file preparation (category-strategy PREPARE mode), bid-leveling normalization (rfp-response-analysis), requirements synthesis and RFx Q&A/addendum (rfp-engine), a Contract Stack Mapper mode (lilly-contract-review), and an Internal Executive Challenge mode (negotiation-simulator).

**Modularization** - category-strategy's generic methodology (SHARP/SAP mapping, Kraljic, savings-classification, data-quality rules) moved to conditionally-loaded companion files (byte-for-byte relocation), cutting its SKILL.md ~43% so the chunked-write discipline has less to survive.

**Correctness sweep** - the full review's critical + high + medium/low findings reconciled across the suite (dual-formula/scoring-ownership/enum-vs-mechanism/spec-vs-code contradictions, added workflow gate-checks, kernel wiring). Version stamps, color canon (no green in status), ASCII/no-em-dash, and descriptions <=1024 chars verified suite-wide.

## What's new in v10.6.6 (prior release)

**Correctness & accuracy fixes (across the suite)**
- Resolved self-contradictions and wrong outputs, e.g. the ATC/FRAP approval-chain rule in `executive-summary-package` (one algorithm now, both worked examples recomputed), and the `timeline-builder` estimate math (complexity multiplier no longer double-counts; parallel reviews use `max()` not sum).
- Reconciled dashboard numbers with their formulas (`supplier-landscape` overall score now derived, not hardcoded; `rfp-response-analysis` no longer renders the award supplier red on pending dimensions; `lilly-contract-review` risk score reconciled).
- One canonical evaluation scale suite-wide (0.0-5.0); fixed the `rfp-response-analysis` ↔ `evaluation-engine` handoff and the effective-weight units bug.

**Consistency & hygiene (all 26 skills)**
- Trigger-collision guards (`BOUNDARY:` notes) for the overlapping pairs (launcher ↔ brand-assets, market-rate ↔ commercial-prep, and others).
- Canonical color tokens (`#0F3A85` = "Bold Blue"; unique hexes; no green in status palettes), version stamps (`Suite: v10.6.6` on every skill), correct counts ("seven pipelines", "other 25 skills"), and `G1-G10` guardrail references.
- Zero em dashes, zero invalid/replacement characters, valid UTF-8, descriptions all ≤1024 chars - enforced and verified.
- Authored previously-missing inlined specs: Field Guide hashtag-protocol, `rfp-case-manager` companion content, foundation `sme-matrix` / `risk-scoring` (with the G9 formula), `supplier-deep-dive` dashboard spec, `pro-forma-builder` financial methodology block.

**Theo's Field Guide v2.2 (tagging / governance / classification)**
- Terminal-state provenance guard: a foreign `#status=complete/cancelled` becomes a confirm-candidate; only you can auto-close your own work (provenance from the verified sender, not the tag body).
- Named work-classification vocabulary (ACTIONABLE-ASK / WAITING / FYI-EVIDENCE / NOISE) + confirm-required inbound→Issue proposals (never auto-creates).
- New `repeat_request_count` and `waiting_since` fields ("chasing me" vs "gone dark"); `history` is now an object; "who asserted this" confirm chip.

**Manual**
- The **Tool Dependencies / graceful-degradation** section is now complete (each primitive + its fallback + the no-fabrication guarantee). The branded `.docx` is regenerated.

## Two packaging variants

- **This bundle (Tier 1, inlined):** most text references are inlined into each `SKILL.md` for installer durability; large reference sets and binary/template assets remain bundled as companion files inside the `.skill` package (for example `lilly-contract-review` and `rfp-engine` keep their reference sets as companions). The most installer-reliable, self-contained form. **Recommended.**
- **`..._UNINLINED_Bundle...zip` (Tier 2, progressive disclosure):** references live as companion files inside each `.skill`, loaded on demand (lower per-invocation token cost). Rebuilt correctly for v10.6.6 with companion-file resolution verified. Use it if you want the lighter variant; fall back to Tier 1 if any skill reports a missing companion file.

## Installation

Upload this zip to a new Claude conversation and say "Install these skills." Click "Save Skill" on each one in the order in `INSTALL.md` (lilly-brand-assets first, procurement-launcher second). The three skills that carry binaries bundle them inside their `.skill` zips; only if a skill reports a missing template/logo at runtime, upload those binaries to your Project Knowledge as a fallback (see INSTALL.md).

The branded user manual `.docx` is included at the root of this bundle as a human reference (read it; it is not a skill, so do not install it). It is a regenerated snapshot of the manual; the markdown inside `lilly-brand-assets` remains the source of truth.

## Migration

Theo's Field Guide reads the existing `field_guide_state.json` (v10.6.x) or migrates from legacy `daily_digest_state.json`. The new v2.2 fields (`repeat_request_count`, `waiting_since`, object-form `history`) are added on first run. No data loss.

## Package contents

- 32 `.skill` files (26 from the v10.6.6 suite + the 6 net-new July skills)
- `lilly-procurement-kernels-1c344a/` shipped as a maintainer **reference folder** (the canonical numeric kernel + MAINTENANCE notes) - it is already vendored into every consuming skill, so it is not an installed skill
- `README.md` (this file), `INSTALL.md`, and `_PACKAGE_MANIFEST.md` (SHA256 of every SKILL.md + .skill) at the bundle root
- The branded user manual `.docx` at the bundle root (a human reference, not installed)

## Roadmap

New capabilities (Supplier Risk/TPRM Intake, SRM scorecard, post-award/renewal coverage) are tracked separately in the roadmap document `procurement-skills-roadmap.md` -- they are net-new skills, not part of this correctness release.

---
## Update - 2 June 2026 (theos-field-guide v2.3)
- theos-field-guide-1c344a updated to v2.3: dashboard design locked in `references/dashboard-canonical.md` (tabbed metric-card nav with Lilly-red active outline, one list per view, inline accordion rows, red × mark-done with on-deck backfill, grouped Now what? / Refresh / Sync, 7-day Calendar with Prep on Issue/counterparty meetings, "Personal Command Center" wordmark). First-run scan widened to 1-2 weeks with unread inbound as a primary inclusion signal. No other skills changed.
