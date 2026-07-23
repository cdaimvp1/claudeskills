# Lilly Procurement Skills Suite v10.6.6 (July 2026 expansion) - Installation
**READ THIS FIRST.** This package contains 30 pre-built `.skill` files. Upload this zip and say "Install these skills." Click "Save Skill" on each one as presented. (`lilly-procurement-kernels-1c344a/` is a maintainer reference folder - the canonical numeric kernel, already vendored into consuming skills - not an installed skill; skip it.)

> This bundle is the v10.6.6 suite plus the **July 2026 expansion**: 5 net-new skills (scope-sow-architect, sole-source-challenge, invoice-rate-card-auditor, deal-room, and the end-user procurement-help-desk scaffold), interactive dashboards across the suite, the Personal Command Center rework of theos-field-guide, and a guided THEO orchestrator. Built on the v10.6.6 baseline; install order is unchanged (lilly-brand-assets first, procurement-launcher second; the new skills install after the foundations). decision-deck and procurement-options-analysis, previously part of this suite, have been retired and are not in this bundle. See README.md for the full change list.

## Installation Order (MANDATORY)

| # | File | Notes |
|---|------|-------|
| 1 | lilly-brand-assets-1c344a.skill | **INSTALL FIRST.** Shared foundation (v10.6.6 - user manual refreshed). |
| 2 | procurement-launcher-1c344a.skill | **INSTALL SECOND.** THEO v2.10 - now a **guided orchestrator**: state a free-text need and THEO names the full ordered path and hands off step by step (guided handoff, human-in-the-loop). Routes all 27 built skills across 6 pipelines + the pending help-desk. |
| 3 | lilly-contract-review-1c344a.skill | v3.5 |
| 4 | legal-negotiation-prep-1c344a.skill | |
| 5 | commercial-negotiation-prep-1c344a.skill | |
| 6 | negotiation-simulator-1c344a.skill | v2.3 |
| 7 | negotiation-playbook-learning-1c344a.skill | |
| 8 | comment-cleanup-1c344a.skill | |
| 9 | pro-forma-builder-1c344a.skill | |
| 10 | should-cost-builder-1c344a.skill | |
| 11 | supplier-landscape-1c344a.skill | |
| 12 | supplier-deep-dive-1c344a.skill | |
| 13 | rfp-engine-1c344a.skill | v2.3 |
| 14 | rfp-case-manager-1c344a.skill | **v2.2** - intent-driven workflows; optional Microsoft Team binding; hashtag emission (conditional) |
| 15 | rfp-response-analysis-1c344a.skill | |
| 16 | evaluation-engine-1c344a.skill | |
| 17 | category-strategy-1c344a.skill | |
| 18 | market-rate-benchmarking-1c344a.skill | |
| 19 | executive-summary-package-1c344a.skill | |
| 20 | voice-profile-1c344a.skill | **v1.2** - hashtag emission in DRAFT mode (conditional; off by default) |
| 21 | **theos-field-guide-1c344a.skill** | **v2.5 - Personal Command Center.** Data-object-first board (defensive JSON island; degrades to your saved graph, never blanks), work-graph KPI strip, filter/lens, abstaining next-best-action, comms convergence view, on-demand renewal/savings/report-card. Skill id + storage key + state-file unchanged (saved graphs preserved). Migrates legacy state on first run. Requires M365 connector. Strongly recommended: run inside a dedicated "Daily Command Center" Claude Project. |
| 22 | process-navigator-1c344a.skill | |
| 23 | timeline-builder-1c344a.skill | First-run calibration asks 3 questions. |
| 24 | workflow-map-1c344a.skill | **v1.2** - optional `issue_id` parameter scopes the map to a Field Guide Issue |
| 25 | meeting-prep-brief-1c344a.skill | **v1.2** - Related Issues subsection added when matches exist |

### Added in the July 2026 expansion (install after the 25 above; order among these does not matter)

| # | File | Notes |
|---|------|-------|
| 26 | scope-sow-architect-1c344a.skill | SOW diagnose/build/repair; weighted Scope Definition Score + issuance-ready rewrite. |
| 27 | sole-source-challenge-1c344a.skill | Challenges a sole-source pick -> Defensibility verdict + justification or alternatives. |
| 28 | invoice-rate-card-auditor-1c344a.skill | Line-level invoice audit vs contract/rate-card/PO/timesheets + draft dispute notice. |
| 29 | deal-room-1c344a.skill | Working negotiation deal space; consolidates positions, hands off at close. |
| 30 | procurement-help-desk-1c344a.skill | **End-user (stakeholder) front door - OFFLINE SCAFFOLD.** Answers "how do I onboard a supplier / check an invoice / open a PO / start a buy / who to contact." Its cited content harvest is **network-gated** (run on the Lilly network; see the network-gated block inside its SKILL.md). Bounded against process-navigator (the rep-facing skill). |

**Maintainer reference (not installed):** `lilly-procurement-kernels-1c344a/` ships as a folder (canonical `numeric_kernel.py` + `MAINTENANCE.md`), the single source of truth for the kernel that is vendored into the consuming skills. It has no `SKILL.md` and is not installed through the Skills UI.

**Note:** `daily-digest-1c344a.skill` is **NOT** in this bundle. It's replaced by `theos-field-guide-1c344a.skill`. If you had daily-digest installed from a prior version, the new Field Guide handles the migration automatically on first run.

## Bundle structure - what to install vs what to keep

This zip contains two kinds of files:

1. **30 `.skill` files at root** - these are what gets installed. Listed in the two tables above. Save each one through the Skills UI. (`lilly-procurement-kernels-1c344a/` is a reference folder, not a `.skill`; skip it.)
2. **`README.md`, `INSTALL.md`, and the branded user manual `.docx` at root** - reference documents. Read; do not install.

**For Claude during install:** iterate ONLY the `.skill` files at the bundle root in the order listed in the table above. Skip `README.md`, `INSTALL.md`, and the `.docx` user manual - they're for the human reader.

The branded user manual `.docx` is included at the bundle root (a human reference, not installed).

## Binary Assets - fallback only if you hit missing-asset errors

Three skills carry binary companion files inside their `.skill` zips:

- **lilly-brand-assets-1c344a** (15 PNG logos in `assets/logos/`)
- **lilly-contract-review-1c344a** (18 .docx templates + 1 .xlsx + 1 .pdf in `templates/`)
- **rfp-engine-1c344a** (2 branded .docx templates + 1 .js in `assets/`)

In normal cases the Skills installer captures these alongside SKILL.md and you don't need to do anything. **Only if** a skill reports a missing template/logo at runtime (e.g., "could not read `templates/Software_as_a_Service_Agreement__MPT_5_2_.docx`"), extract the relevant binaries from this zip and upload them to your Claude Project's Knowledge section as a fallback. This was a documented workaround in earlier versions; recent installer behavior usually makes it unnecessary.

Start a new conversation to use the installed skills.

## First-Day Setup (recommended sequence)

1. Install the bundle (above).
2. Binary assets ship inside the .skill packages; upload them separately only if a skill reports a missing asset at runtime (see "Binary Assets" above).
3. **Create your Daily Command Center Project** (or reuse the one you have).
4. In that Project, run `build my voice profile` (one-time setup).
5. In that same Project, run `estimate the timeline for [test request]` and answer the 3 calibration questions.
6. In that same Project, run `open my field guide` (or `daily digest` - legacy alias still works).
   - On first run, Step 0a asks for Project acknowledgment.
   - If you had a legacy `daily_digest_state.json`, migration happens here automatically.
7. When you start a sourcing event, create a per-RFx Project and run `set up a case for [event]`.

## Migration from v10.5.0

The Field Guide skill handles legacy daily-digest state file migration automatically. No manual conversion needed. Original `daily_digest_state.json` is backed up; you can revert by restoring the backup and contacting the package owner or your workspace administrator for the prior approved version.

If you DON'T have a legacy state file (fresh install), Theo's Field Guide starts empty and you build state organically as you use it.

## Verification

After install, start a new conversation in your Daily Command Center Project and try:

- `theo.go` (launcher menu - should show 🦖 Theo's Field Guide row in section 6)
- `open my field guide` or `daily digest` (legacy alias - both work) - triggers Theo's Field Guide
- `build my voice profile` (voice-profile BUILD)
- `how do I buy [X]` (process-navigator)
- `estimate the timeline for this request` (timeline-builder)
- `build a workflow map for this request` (workflow-map)
- `prep me for the [supplier] meeting` (meeting-prep-brief)
- `review this contract` (upload a contract; lilly-contract-review)
- `set up a case for [RFx]` (rfp-case-manager)

## Help

Inside any conversation with the suite installed, ask:

- `teach me about Theo's Field Guide` - triggers the in-skill teach mode
- `what changed in v10.6.0` - reads the changelog section from user-manual.md
- `generate the user manual as a Word document` - produces a branded DOCX from the inlined manual
