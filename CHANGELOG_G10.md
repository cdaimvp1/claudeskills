# CHANGELOG - G10 Chunked Artifact Assembly Guardrail
Suite label: v10.6.6 (adds G10 on top of v10.6.5-aria; base v10.6.4). Date: 2026-06-09

## Why
Large single-file deliverables (interactive JSX/React dashboards, self-contained HTML pages) were emitted in one write. A single oversized write can exceed the response length limit and truncate the file mid-stream, especially late in a long session. This is a delivery-mechanics failure, not an analysis failure. It surfaced on the 11-tab category-strategy dashboard; the same exposure exists in every skill that emits a large single-file artifact.

## What changed
- Foundation (lilly-brand-assets-1c344a): added guardrail G10: Chunked Artifact Assembly to the inlined execution-guardrails section, plus a matching row and a "Large-Artifact Guardrail" note in the user-manual guardrail summary. G10 is suite-wide, the same way G1-G9 are.
- Suite-wide reference update: every "G1-G9" guardrail-range citation was bumped to "G1-G10" (58 occurrences across 24 skills). The specific "G8-G9" multi-pass citations were left unchanged.
- Inline build-step reminder added to the 9 skills that emit a large single-file artifact: category-strategy, lilly-contract-review, evaluation-engine, rfp-response-analysis, supplier-landscape, supplier-deep-dive, pro-forma-builder, procurement-launcher, theos-field-guide.

## What did NOT change
- No change to any skill's analytical logic, workflow, data model, branding, or output content. G10 governs only how a large file is written: scaffold, then append section by section to /mnt/user-data/outputs, then run a structural self-test before present_files.
- The two skills that emit no large single-file artifact (meeting-prep-brief, process-navigator) were left untouched.
- The ARIA enrichment layer (v10.6.5-aria) is carried forward unchanged. This bundle contains both layers.

## G10 in short
Scaffold first (imports, component shell, export). Append one section per write. Keep each write small. Self-test (balanced braces and parentheses, no truncated token, no em dashes, totals reconcile) before present_files. If a write does not visibly complete, re-issue that one section.

## Install
Unchanged. lilly-brand-assets-1c344a installs first; the rest follow.
