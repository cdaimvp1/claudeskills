# B5 — dead code in vendored `.py` and `assets/`

Tool: `_audit/dead_code_sweep.py` (reports only, deletes nothing).

## What B5 actually asked for, and what it found

B5 is scoped to **documented**-dead code, meaning code the repo itself marks as dead.
On that scope B5 is **closed with no deletions**, because all four categories of
documented-dead code turned out to need no action:

| documented as dead | reality | action |
|---|---|---|
| `rfxWeightSum` / `rfxSubWeightSum` | already removed. All 10 repo-wide hits are tombstone comments recording the removal. | none. Tombstones are historical record, same principle as the B8 changelogs. |
| unused functions in vendored `numeric_kernel.py` | the header says "vendored for completeness, not called by this skill's own workflow". | **must NOT remove.** The copies are byte-identical by design and `kernel_manifest.py` enforces it. Trimming per-skill would break the drift detector and the standalone-install model. |
| `lilly-contract-review-1c344a/references/isolated/` | a stray kernel copy whose own header misattributes it to `rfp-response-analysis`. | none needed. `isolated` is already in `ship_manifest.DEAD_WEIGHT_DIRS`, and the skill is HELD. |
| `paperSectionHTML` | comment says "formerly-orphaned, now wired". | resolved already. |

## The larger finding B5 surfaced

Sweeping properly for defined-but-never-called JS turned up far more than the
documented list:

| skill | shipped-runtime dead | in `_platform_build` |
|---|---|---|
| category-strategy | 16 | 0 |
| deal-tab | 19 | 37 |
| rfx-hub | 35 | 0 |
| supplier-landscape | 40 | 0 |
| **total** | **110** | **37** |

Build-tree hits need no separate decision, they are already classified strippable.

### Why this number is believable

I did not trust it at first. `pvDeepDiveHtml`, `pvRecommendationHtml` and `csKraljicGrid`
are core render functions and it is implausible on its face that they are uncalled. Two
earlier versions of the sweep were in fact wrong, and both were caught by spot-checking:

1. stripping `//` comments by regex also ate everything after `https://` on a line,
   destroying real call sites;
2. counting comment tombstones as call sites deflated the count the other way.

The current sweep drops comment LINES only, and reports a function only when **every
single mention of its name is itself a definition.** One reference anywhere in any
`.js`, `.html` or `.md` in the skill clears it.

The premise was then verified directly rather than assumed:

- `pvDeepDiveHtml` appears exactly **once** in the built `supplier-landscape-PLATFORM.html`
  as well, so it is not reached through the built artifact either.
- there is **no dynamic dispatch** anywhere in these dashboards. `window[...]`, `eval(`
  and `new Function` return nothing. The sweep aborts loudly if that ever changes,
  because string-keyed dispatch would invalidate the whole approach.

So the functions really are unreachable. Note this is dead **weight**, not a
correctness bug: uncalled code renders nothing and cannot produce a wrong number.

### Why nothing was deleted

Removing 110 functions spread across four UI-bearing dashboards is a batch UI change,
which is gated for approval rather than done unilaterally, and it would require
regenerating the built HTML so sources and artifacts stay consistent. That is a
deliberate, reviewable change, not cleanup to slip into a B5 sweep.

Four of these are already owned by **A10 / task #16**, which is the right place for the
Landscape subset.

## Correction to A10's dead-code list

A10 names four functions to remove: `pvRequestDataCard`, `pvDDSection`,
`pvVerdictHeaderHtml`, `pvCompPositionHtml`.

**`pvRequestDataCard` no longer exists.** It has zero occurrences in any code file
repo-wide. All six hits are planning documents still instructing its removal:

```
MASTER-REMAINING-WORK.md:306, :405
PROGRAM-MASTER-PLAN.md:92
_audit/OVERNIGHT-QUEUE.md:155
_audit/UPGRADE-PLAN.md:261
_platform_build/DEEP-DIVE-REDESIGN-SPEC.md:66   ("drop the call ~line 1941 + the function ~1693")
```

The other three are real and still present in
`supplier-landscape-1c344a/dashboard/assets/pv/pv-07-landscape-render.js` at lines
1748, 1667 and 2022.
