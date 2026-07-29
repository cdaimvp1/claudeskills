# A10 — Landscape seed bugs and dead code

Skill: `supplier-landscape-1c344a`. A10 is "Marc decision: no. Depends on: nothing."

Everything below was measured by running the REAL engine (`PVSLE.reflect`) against the
REAL seed, not inferred from reading. Harness: extract the `PVSLE` IIFE, feed it the seed
via the same shape `pvLandInput` builds, print the assessment table before and after.

## 1. Score-scale drift (the headline defect)

The same supplier's fit rendered as 89, 89.37, 4.51 and 60.77 because four different
things computed it:

| source | what it produced |
|---|---|
| `pvAssess().fit.score5` | correct, rounded, 0-5. Only `pv-07b` used it. |
| inline `pvRound(a.fitScore/20,1)` | re-derived at 8 separate call sites |
| raw `a.fitScore` printed as `/100` | 12 sites, unrounded, giving 89.37 |
| authored `cand.fit`, falling back to `Math.round(a.fitScore)` | a genuine SECOND source of truth |
| row mean rounded to 2dp under cells rounded to 1dp | 4.5 and 4.51 in the same table |

`pv-07-landscape-render.js` almost never called `pvAssess`. It re-derived the scale itself.

**Fix.** One scale, owned by the engine, because the engine owns scoring:

- `PVSLE.fit5(fitScore)` is now the single implementation.
- `pvFit5(a)` in `pv-07a` delegates to it (a local fallback remains only for the case
  where `PVSLE` has not loaded).
- Every DISPLAY site routes through `pvFit5`. Ordering, banding and threshold logic still
  run on the raw 0-100 value, because rounding for display must never change who ranks first.
- Display is 0-5 at one decimal, so fit and risk share an axis and are comparable.
- The row mean is still taken on the raw scale (averaging rounded cells would drift) but
  is displayed at the same 1 decimal as the cells above it.
- Where no eligible supplier exists the mean renders as a placeholder, not `0`.

The authored `cand.fit` is no longer silently preferred. It is not discarded either: a
`fitDisagreements` reconciliation now identifies any supplier whose authored fit differs
from the computed rollup by 1 or more, so a seed inconsistency is surfaced as data to fix
rather than resolved invisibly at render time.

## 2. ESG rendered as a scored dimension (the accuracy defect)

The seed carries **qualitative** ESG text per vendor ("No independently verified public
ESG..."). It carries no ESG score. An augmentation map `_PVLA.esg` supplied *illustrative*
numbers which were injected at render so, in the file's own words, "ESG appears as a scored
Risk-Assessment dimension".

Measured: `esg` is the ONLY one of the 6 risk dimensions that no supplier scores.

Two defects came from that injection, the second worse than the first:

1. an illustrative number rendered indistinguishably from a genuinely assessed score;
2. it **mutated the shared candidate risk object at render time.** `pvLandInput` passes
   `risk: s.risk||{}` by reference, and `landscapeHTML()` recomputes the whole rollup on
   every re-render. So the first render computed risk WITHOUT the injected value and every
   later render computed it WITH. **Risk scores and rankings changed after the user's first
   click.**

**Fix.** The injection is removed, ESG renders as an assessment-coverage note
(`Not scored · qualitative read only`) rather than a row of dashes inside a scored grid,
and the narrative read is retained. The now-dead `PVSL_ESG` map is removed.

### The companion fix this forced

`computeRisk` scored a missing dimension as `0`. Risk runs "higher = worse", so simply
removing the injection would have credited every supplier with the *best possible* result
on ESG. Weight is now renormalized across the dimensions that actually carry a score, so an
unassessed dimension neither helps nor hurts, and `riskCoverage` is returned so the share of
the model genuinely assessed can be stated. `composite()` returns null rather than NaN when
risk is unknown.

### Measured impact

Risk coverage is 0.93 for all seven suppliers, the ESG weight correctly excluded.

| supplier | risk before | risk after | segment |
|---|---|---|---|
| Snowflake | 1.53 | 1.64 | leader → leader |
| Amazon Redshift | 1.47 | 1.57 | leader → leader |
| Databricks | 1.67 | 1.79 | leader → leader |
| Microsoft Fabric | 1.67 | 1.79 | leader → leader |
| Google BigQuery | 1.93 | 2.07 | leader → leader |
| **ClickHouse** | **2.33** | **2.50** | **leader → challenger** |
| Firebolt | 3.40 | 3.64 | caution → caution |

Every risk score rose, which is the proof the old behaviour understated risk. **Rank order
is unchanged.** One classification changes: ClickHouse crosses the `riskHigh` 2.5 threshold
and is now a challenger. That is the correct reading, its risk had been held below the
threshold only by counting an unassessed dimension as zero.

## 3. Dead code

`pvVerdictHeaderHtml` (1,254 chars), `pvDDSection` (33,908) and `pvCompPositionHtml` (6,642)
removed. Each had exactly one mention, its own definition. `pvDDSection`'s own last line
recorded that it "returns nothing" after being taken off the nav.

`pvRequestDataCard`, the fourth name on A10's list, **does not exist.** It has zero
occurrences in any code file. All six hits are planning documents still instructing its
removal. A10's list should be corrected rather than actioned.

Also removed: `mtile`, `elimN`, `reviewedN`, `screenedN`, `rfxN`, all dead (see below).

## 4. The 7-vs-9 supplier count — NOT fixed, and deliberately so

A10 says to resolve this with a "supplier-count funnel". That funnel **was built**
(2026-07-23) and then **removed at Marc's request**: `pv-07-landscape-render.js` carried the
line *"Marc: the 4-count stat strip (reviewed / passed screen / screened out / recommended)
adds no value; removed."* Its computations were left behind, computing values no reader ever
saw. Those are now deleted.

A10's remedy therefore predates and contradicts a later owner decision, so I have not
reinstated the strip.

The underlying ambiguity is real and still present: the field is 7 suppliers, and
eliminations render as extra rows under "Eliminated before the shortlist" in the
Recommendation table, so a reader can still total 9.

**Recommendation, for Marc:** resolve it in the labels rather than by re-adding the removed
strip. State the field size once, authoritatively, on the "Vendors evaluated" tile and make
explicit whether pre-shortlist eliminations are inside or outside that count. That removes
the ambiguity without reintroducing a panel already judged valueless.

This is the one A10 sub-item left open, and it is open because two owner instructions
conflict, not because it is unclear what the code does.
