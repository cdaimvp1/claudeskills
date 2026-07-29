# WS G: Claude Desktop runtime feasibility, G1 to G7

**Read-only audit, 2026-07-29. Findings only, nothing fixed.**
Reproduce with `python _audit/g_runtime_audit.py`.

The bar, from `OPTIMIZATION-PRINCIPLES.md`: *"Reading well is not the bar. Every skill has
to execute end to end on a user's own Desktop install."* Desktop installs **one** skill
folder. No siblings, no suite root, no repo.

32 skills audited.

---

## The headline finding: 26 skills point at 8 files that do not exist

**G2, and it is worse than a portability problem.**

| Referenced file | Skills pointing at it | File exists |
|---|---|---|
| `references/execution-guardrails.md` | 23 | **NO** |
| `references/narrative-standards.md` | 23 | **NO** |
| `references/house-styles.md` | 23 | **NO** |
| `references/validation-checklist.md` | 23 | **NO** |
| `references/supplier-risk.md` | 21 | **NO** |
| `references/dashboard-components.md` | 7 | **NO** |
| `references/brand-colors.md` | 5 | **NO** |
| `references/docx-design-system.md` | 2 | **NO** |

**26 distinct skills** carry at least one of these pointers, all of the form
`/mnt/skills/user/lilly-brand-assets-1c344a/references/<file>.md`.

`lilly-brand-assets-1c344a/references/` contains exactly two files: `aria-enrichment.md`
and `user-manual.md`. Every other reference file was **inlined into that skill's SKILL.md**
(15 `## INLINED:` sections) and the standalone file removed. **Every pointer to them was
left behind.**

So these paths fail twice over:

1. **On Desktop**, where the sibling skill is not installed at all, so the path cannot
   resolve regardless.
2. **In the full suite**, where the sibling IS installed and the file still does not exist,
   because it was inlined and deleted.

The second is the one worth noticing. This is not a Desktop-only portability question that
the packaged suite gets away with. It is a broken pointer everywhere.

### The mitigation, which is real and is why this is not a P1 outage

**All 26 carry the relevant content inline themselves.** Every one of them has its own
guardrail text, house style or validation checklist in its SKILL.md. So the *content* is
reachable and a run does not lose the rules.

What actually happens at runtime is a model instructed to read a file, finding nothing, and
proceeding on the inline copy. That is a wasted step and a silent one. It also trains the
reader that a broken path is normal, which is the condition under which a *load-bearing*
broken path stops being noticed.

### Recommendation

Delete the pointers, keep the inline content. Do **not** restore the eight files: they were
inlined deliberately, and re-creating them would give the suite two copies of each and
reintroduce exactly the drift `E1` and `E2` were about.

This belongs with `B7` (prune stale instructions and superseded prose) and it also
substantially **is** `H8` (fix supplier-risk anti-fabrication reachability). H8's premise
turns out to understate the problem: it is not only `supplier-risk.md`, and the file is not
merely unreachable on Desktop, it does not exist.

---

## G1: third-party imports. Clean.

Every third-party import in the suite is **guarded**:

```
docx       evaluation-engine, executive-summary-package,
           rfp-response-analysis, sole-source-challenge
openpyxl   market-rate-benchmarking, pro-forma-builder, should-cost-builder
pptx       sole-source-challenge
```

Zero unguarded. `pro_forma_generator.py` is the pattern the others follow: it detects
openpyxl at import time, sets a flag, and raises a clear `ImportError` at
**workbook-build** time rather than import time, so the validation logic stays testable in
an environment without it. That is the right shape and it is worth keeping as the reference
when `E4` adds another XLSX generator.

## G3 and G4: self-containment. Clean.

**Zero relative or package-style imports** anywhere in the suite. 23 of 32 skills ship
`.py`, and every one imports only stdlib plus modules sitting beside it in the same folder.
A flat single-folder install works.

Independently confirmed tonight by running `numeric_kernel.py` and the new
`invoice_audit_engine.py` in isolated directories containing nothing else: 96/96 and 26/26
respectively.

## G5: output paths

`/mnt/user-data/outputs` appears in 13 skills. That is the standard Claude output location
rather than a repo path, so it is not a portability defect. Noted for completeness; no
action.

## G6: tool and connector assumptions

| Assumption | Skills |
|---|---|
| SharePoint | 31 |
| M365 connector / Teams / Outlook | 30 |
| `unpack.py` / docx internals | 26 |
| `ask_user_input_v0` | 19 |
| web search | 18 |
| `create_file` | 12 |
| `show_widget` | 10 |
| `message_compose` | 9 |

**These counts are mentions, not hard dependencies, and the distinction matters.** Spot
checks show most appear inside a degradation sentence ("if the M365 connector is
unavailable...", "if `ask_user_input_v0` is unavailable, degrade gracefully to a numbered
list"). Counting them as assumptions would overstate the problem the same way the G12
statistic did.

**What this audit cannot tell you** is whether each degradation path is correct, only that
one is discussed. That is `G9`'s job with a real smoke test, and it is the honest limit of
a text audit.

## G7: render dependencies

`react` in 10 skills, `show_widget` in 10, `recharts` in 8. `rfp-response-analysis`
documents the right pattern: recharts with a styled-div fallback if it is unavailable in
the target runtime, so the render degrades rather than failing.

## Degradation language: three skills are thin

| Skill | Mentions |
|---|---|
| `rfx-hub-1c344a` | 1 |
| `deal-tab-1c344a` | 2 |
| `sole-source-challenge-1c344a` | 2 |

The first two are the new hub skills and the thinness is expected: they compose slices from
feeders and their honesty rules are short. **`sole-source-challenge` is the one to look at**
— it imports both `docx` and `pptx`, the only skill in the suite depending on two
third-party libraries, and it discusses absence least.

---

## What I did not do

Nothing was fixed. This is an inventory, per the item's own scope ("read-only inventories.
Produce findings, do not fix").

`kernel_manifest.py` is flagged here so a later reader does not file it as a defect: it
walks the suite directory and **cannot** run standalone by design. It is a repo maintenance
tool that happens to live in a skill folder, it is referenced by no SKILL.md, and it exits
cleanly with a clear message when run outside the suite.

## Limits

A text audit proves what a skill *says*, not what it *does*. Every finding above is about
declared dependencies and declared fallbacks. Whether a fallback actually works is `G8`
(define the smoke test) and `G9` (run it), and nothing here substitutes for those.
