# Overnight autonomous queue (REVISED, much larger)

Prepared 2026-07-29. Read `_audit/SESSION-HANDOFF-2026-07-29.md` and
`_audit/OPTIMIZATION-PRINCIPLES.md` first. Progress goes in
`_audit/OVERNIGHT-RUN-LOG.md`, which is the resume point.

**The first version of this queue had 8 items. That was too conservative.** It
applied the locked phase order strictly and treated unattended editing as riskier
than it is for well-specified mechanical changes. The genuinely blocked set is
small. This revision covers roughly 45 of the 78 plan items.

**Standing rule: when blocked, STOP AND LOG IT and move to the next item.** Never
guess, never work around, never touch the DO NOT TOUCH list to unblock yourself.
Commit per item. Malicious-code review per increment.

---

## What is ACTUALLY blocked, and why

| Blocker | Items |
|---|---|
| **HELD FILE** `lilly-contract-review` | D1, F1, B4-for-that-skill, C1 wiring, the two decided rescues |
| **MARC DECISION** | A5 (hub home TBD), A11 (lock sign-off), B1, B2 (needs 5-tab confirm), B9, I1, J1-J3 (open conflict with a locked decision) |
| **MARC'S EYE** visual work he reviews | A8 Landscape design uplift, A9 recolor |
| **NETWORK** | I2 |
| **DEPENDS ON BLOCKED WORK** | A6 (needs A5), I3 (needs I1), retiring `dashboard-canonical.md` (needs the rescues) |

Everything else is fair game.

---

## Tier 1: do first, highest value

**O1. Coverage matrix output-mode re-audit. DONE** (`2720f66`, `19afc3f`, plus the Part 3
sweep). All three parts complete. Left here for the record. The merge is DONE (`2720f66`),
`_audit/F1-COVERAGE-MATRIX.md` exists. Three things remain, and O1 is not complete
until all three are:

1. **Add the "which output modes does this reach" column** and re-audit every row
   against the test: *if the user requests ONLY the redlined track-changes .docx, does
   this check still run and does its result reach them?* Suspects first: any row mapped
   to `review-summary-design.md` or the Review Summary generator.
2. **Reconcile the row count.** The merge found 307 rows, not 342. Parts 1 and 2 are off
   by one each and that is noise. **Part 3 reports 135 and contains 98.** Either the
   figure was estimated and never reconciled, or 37 rows were scoped and never written.
   Until this is settled, Part 3's coverage is UNKNOWN.
3. **Coverage sweep of Part 3's six source files** to settle (2): walk
   `review-summary-design.md`, `pass-artifacts.md`, `sme-matrix.md`, `lilly-templates.md`,
   `ai-standard.md` and the retired `dashboard-canonical.md` section by section, confirm
   every substantive item has a row, and ADD rows for anything missing. Sweep Parts 1
   and 2 the same way while the re-audit is open, since it costs little once the
   machinery is running.

A gate that says PASS wrongly is worse than one that fails. Both defects make this gate
say PASS wrongly.

**Read-only on the skill.** This item reads `lilly-contract-review` files to check
coverage but writes only to `_audit/`. That does not breach the HOLD, which is on
changing the skill.

**O2. Build `deduction_score()`** in `lilly-procurement-kernels`. Deduction model,
starts at 100, four coverage columns, Hard Stops always -15 never reduced. NOT
`weighted_score()`. TWO calibration assertions, both raise: too-harsh (zero Hard
Stops + 10 covered must not exceed 30 points) and too-generous (standalone with 5+
findings must not be under 25). Unit-test against `risk-scoring.md`'s worked example
(-36, score 64). Stdlib only. **Do NOT wire it into contract-review.**

**O3. C3 kernel the rfp-response-analysis Bid Leveling normalization.** The
unaudited input currently gating an audited ranking. Highest-correctness kernel item
that touches no held file.

**O4. C2 kernel playbook-learning's Difficulty Score and partition rates.** No
kernel at all today, and its own changelog records the exact scaling-overshoot bug
`weighted_score`'s guard prevents. Vendor the kernel into the skill first.

---

## Tier 2: kernel adoption, all non-held skills

Same pattern each: identify the prose arithmetic, replace with a kernel call, keep
the model supplying judgment inputs, test.

**O5. C4** supplier-landscape Weighted Scoring Matrix.
**O6. C5** category-strategy Pareto / HHI / CAGR / YoY / tail-threshold / anomaly.
**O7. C6** negotiation-simulator reciprocity ratio and anchor capture.
**O8. C7** rfp-engine weight-sum check.
**O9. C8** commercial-negotiation-prep rollup gap.
**O10. C10** wire or retire `convert_currency()`.
**O11. C9** kernel-copy hash manifest so future drift is script-detectable.

---

## Tier 3: slice contracts (design already approved)

The field-ownership table is approved at `MASTER-REMAINING-WORK.md:320`. This is
authoring an approved design into SKILL.md text, not designing.

**O12. D2** scope-sow-architect slice contract (owns `scope{}`).
**O13. D3** pro-forma-builder slice contract (owns `commercialLines[]`,
`scenarios[]`, `assumptions[]`, `proforma{}`, `benchmarks[]`).
**O14. D4** RFx slice contracts into the four feeders, per
`RFx-REDESIGN-SPEC.md` section D.
**O15. D5** deal-room slice-contribution contract.
**O16. D6** deal-room `hub_slices` staleness assertions.
**O17. D7** deal-tab build schema validation.

**Note:** D1 is contract-review and is HELD. Also, Part 3 found contract-review
already HAS a slice contract buried in `dashboard-canonical.md`, so re-check the
others before assuming absence (that is O24).

---

## Tier 4: handoff discipline and generators

**O18. E1** fix the stale `case-handoff-schema.md` in rfp-engine. The one real drift
bug. Add a named source of truth and a do-not-hand-edit header.
**O19. E2** apply that same discipline to every shared schema.
**O20. E3** formalize evaluation-engine's outbound handoff (currently named
generically, no schema).
**O21. E4** build a real XLSX generator for rfp-engine's structured artifacts.
**O22. E5** JSON-sidecar ownership table for category-strategy.
**O23. F4 + F5** batch invoice-rate-card-auditor's per-line loop into one code pass,
and wire a generator for its outputs. Largest-N input in the suite.
**O24. F6** wire pro-forma's dashboard to the generator's ground truth.
**O25. F8** JS reconciliation assertion in theos-field-guide before render.
**O26. F9** generator coverage sweep for every remaining model-assembled deliverable.
Findings, not builds.

---

## Tier 5: audits (read-only, produce findings, fix nothing)

**O27. H3** G12 claim-gate implement-vs-mention across all 31 skills. Most
load-bearing item in WS H.
**O28. G1-G7** Desktop runtime audits: guarded imports, cross-skill paths (12 skills
read `/mnt/skills/user/lilly-brand-assets-1c344a/...` including the supplier-risk
anti-fabrication rules), builder self-containment, output paths, tool assumptions.
**O29. G8** define the canonical per-skill runtime smoke test, 8 assertions.
**O30. O24 above** re-check every lens skill for an existing slice contract and
correct `_audit/SYNTHESIS.md` and `RECONCILIATION.md`, since the "only deal-tab"
finding is proven wrong.
**O31. H5** verify citations resolve rather than merely exist. Scriptable.

---

## Tier 6: cleanup, last, most drift-prone

**O32. B5** remove documented-dead code from vendored `.py` and `assets/`.
**O33. B6** retire orphaned static dashboard HTML.
**O34. B7** prune stale instructions and superseded prose, NON-HELD skills only.
**O35. B8** update guardrail numbering references (two skills still cite G1-G10 or
G1-G11).
**O36. A10** Landscape seed bugs: score-scale drift to a single `pvAssess` source,
7-vs-9 supplier count, ESG shown as a scored dash. Plus dead code
(`pvDDSection`, `pvVerdictHeaderHtml`, `pvCompPositionHtml`). **[DONE 2026-07-29, A10]** `pvRequestDataCard` was also listed but has zero occurrences in any code file.
**O37. A2** wire the RFx to Deal handoff emitter. rfx-hub now exists so this is
unblocked.

---

## Judgment calls flagged, not assumed

**A7 My Work dashboard** is described as a deterministic PORT of the platform My
Work render, which is well specified and arguably autonomous. It is a large new
build and a port can drift from its source in ways only Marc would notice. **Ask
before starting; do not start unattended.**

**Phase order.** `PROGRAM-MASTER-PLAN.md:41-43` puts Phase 1 dashboards before
Phase 2 skills work. Most of Tiers 2 to 6 are Phase 2. Marc has already broken this
deliberately once for the generator wiring. **If he has not said otherwise, run
them anyway and LOG that they jumped the sequence**, because the remaining Phase 1
items are all blocked on his decisions and waiting would waste the night.

---

## DO NOT TOUCH

`lilly-contract-review` (any file) · retiring `dashboard-canonical.md` · WS J
orchestration · I1 help-desk · A11 locking hubs · B1/B2 category-strategy spec ·
A5/A6 Deep Dive · A8/A9 Landscape visual work · any locked dashboard artifact.

---

## Morning report

`_audit/OVERNIGHT-REPORT.md`: what completed with commit hashes, what was skipped
and why, every STOP AND LOG, what jumped the phase order, and the decisions now
waiting on Marc.
