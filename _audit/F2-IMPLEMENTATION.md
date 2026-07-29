# F2 implementation record

Item: `_audit/UPGRADE-PLAN.md` WS F, F2 ("Collapse rfp-response-analysis's three document
reopens into one generator call"), redesign analysis in section 3.1.

## Classification of the three passes (SKILL.md "Multi-Pass Generation Guidance", pre-edit lines 549-559)

All three passes had two things braided together: authoring narrative content, and a
document-assembly mechanic (open the saved .docx, append, save). Classified separately:

1. **Pass 1** - "Generate title page... table of contents, executive summary, and the
   first 2 supplier sections... Save the document." ANALYSIS: writing the executive
   summary and supplier-section narrative. ASSEMBLY: "Save the document" - there is no
   document yet to save separately from the final artifact; this is the model creating a
   .docx directly.
2. **Pass 2** - "Open the saved document and append the remaining supplier sections...
   then... Bid Leveling & Normalization... Save." ANALYSIS: authoring the remaining
   supplier sections and the Bid Leveling worksheet/register content (comparison basis,
   scope-compliance map, assumption/exclusion register, normalized pricing, TCO). ASSEMBLY:
   "Open the saved document and append... Save" - reopening a partially-built .docx and
   appending to it in a second model pass.
3. **Pass 3** - "Confirm the GATE CHECK... then open the saved document and append all
   cross-cutting sections (6-13). Save." ANALYSIS: authoring the eight cross-cutting
   sections' narrative and confirming the Bid Leveling gate. ASSEMBLY: the third
   open-append-save cycle.

**Verdict: none of the three passes needed to be deleted whole; each was mixed.** The
narrative-authoring half of every pass is real model judgment (reading submissions,
writing multi-paragraph analysis, scoring rationale) and is preserved unchanged, in the
same three-way split, for the same stated reason (avoiding quality regression when
authoring ~30-40 pages of prose in one continuous turn). The document-assembly half
(open/append/save, three times) was the target: the skill already had a fully wired,
gated, 2,935-line generator (`rfp_analysis_report_generator.py`, `generate_rfp_analysis_report()`)
sitting one section below the passes (SKILL.md "Word (.docx) report generation wiring
(HARD RULE)", lines 434-446) that already builds the exact same fixed-order document from
a validated register in one call, asserting the identical Bid Leveling gate
(`_assert_bid_leveling_gate`) that Pass 3 was manually re-checking. The multi-pass section
had never been reconciled with that HARD RULE and instructed the model to hand-assemble
the .docx anyway, three separate times.

## What changed

`rfp-response-analysis-1c344a/SKILL.md`, "Multi-Pass Generation Guidance" section only.
Nothing else in the file touched; no other skill touched.

- Reframed the three passes as CONTENT passes only: each authors narrative into named
  fields of the RFP analysis register object (`executive_summary`, `supplier_sections`,
  `bid_leveling`, cross-cutting section text), never into a saved `.docx`.
- Removed "Save the document" / "Open the saved document and append" from all three
  passes - no `.docx` exists until the register is complete.
- Added a fourth step: after Pass 3, call `generate_rfp_analysis_report(rfp_analysis_register,
  output_path, mode_override=None)` exactly once. Documented what it validates (the same
  Bid Leveling gate, via `_assert_bid_leveling_gate`, plus `RfpAnalysisValidationError`/
  `ReconciliationError` on a missing or unleveled field) and what to do on raise (surface
  the message, resolve the field, re-run; never hand-patch), matching the existing HARD
  RULE's disclosed-fallback language rather than inventing new wording.
- Kept the "CRITICAL: per-supplier sections need the same depth as cross-cutting
  sections" warning, retargeted at content authoring rather than document passes, since
  it is a real analysis-depth instruction independent of assembly mechanics.

Analysis passes before: 3 (title page/exec summary/first 2 suppliers; remaining suppliers
+ Bid Leveling; cross-cutting 6-13). Analysis passes after: the same 3, same content, same
gating order. Zero analysis passes removed. What was removed: 3 document open/append/save
cycles, replaced by 1 generator call.

## Accuracy property preserved and how it is checked

Property (section 3.1 of the plan, restated for this skill): every figure in the final
document traces to the validated ground-truth object, and Bid Leveling gates all ranking,
scoring-matrix, and recommendation content (SKILL.md Rule 6 / "GATE CHECK: Bid Leveling
Complete"). This property is IMPROVED, not merely preserved: previously a figure computed
correctly in Pass 2 could still be mistyped when a later pass re-transcribed it into the
document; now `generate_rfp_analysis_report()` reads each figure from the register exactly
once via `compute_ground_truth()`, so a transcription error in assembly is structurally
impossible. The gate itself is now checked twice by construction: once by the skill
before authoring Pass 3 content (as before), and again by the generator's
`_assert_bid_leveling_gate` before it writes anything (pre-existing in the generator, now
the only path that can produce the file).

Checked by: the generator's built-in self-test (`python rfp_analysis_report_generator.py`),
which builds Full and Brief demo documents end to end, reopens both, and asserts all 12
fixed-order section headings, the kernel-computed weighted total, PENDING-pricing labeling,
the Bid Leveling gate-pass language, and mode-specific section inclusion/omission are
present. This is the section-for-section / figure-traced-to-ground-truth check the plan
calls for, already built rather than newly written.

## What would have proven this lost accuracy (none observed)

A dropped analysis section, a figure in the document absent from the register, the gate
check firing later or more loosely than before, or the self-test regressing. None occurred:
self-test is unchanged code, run before and after the SKILL.md edit.

## Verification output

```
python rfp_analysis_report_generator.py
...
SUMMARY: 52/52 passed, 0/52 failed
```
Ran identically before and after the SKILL.md edit (the generator file itself was not
touched, so this confirms the wired generator this edit now routes through already works
end to end).

`grep -c "—" rfp-response-analysis-1c344a/SKILL.md` -> `0` (file uses `--` as its dash
convention throughout; the edit follows the same convention, no em dash introduced).

## What was deliberately left alone, and why

- The three CONTENT-authoring passes themselves (executive summary + first suppliers /
  remaining suppliers + Bid Leveling / cross-cutting sections) are unchanged in number,
  order, and gating. No proof they are assembly rather than analysis; they are the model
  reading supplier submissions and writing evaluative prose, which is exactly what the
  priority-order rule says must not be cut.
- supplier-landscape's three sequential DOCX passes, mentioned in the same section 3.1 of
  the plan ("same treatment... once its builder covers the DOCX"), were NOT touched. That
  skill is out of scope for F2 (F2 names only rfp-response-analysis) and the plan states
  its own generator does not yet cover the DOCX end to end, so the same collapse is not
  yet safe there.
- The Bid Leveling gate mechanics (Phase 4, GATE CHECK checklist, Rule 6) were left
  entirely as-is; F2 only changes when a document is written, not the sequencing rule
  that pricing must be leveled before scoring.

## Cost effect, stated honestly

Two of three whole-document open/append/save cycles are removed; the model no longer
touches `python-docx` at all for this deliverable. The narrative-authoring token cost
(the bulk of the three passes) is unchanged, since none of that content was cut. The
measurable savings are: the model no longer re-reads or re-renders an in-progress .docx
twice, and the risk of a re-transcription error is eliminated rather than merely made
cheaper. No wall-clock or token measurement was run against a real large evaluation in
this pass (would need a golden multi-supplier RFP fixture, which was out of scope here);
the generator's own self-test confirms the replacement path executes correctly, not the
magnitude of savings on a specific real evaluation.
