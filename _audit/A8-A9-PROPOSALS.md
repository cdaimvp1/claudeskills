# A8 and A9: proposals for Marc

**Written 2026-07-29. Nothing has been changed. This is for your decision.**

---

## First, in plain terms: what these two are

Neither is about missing data. That was A5/A6, which is finished.

| | What it actually is |
|---|---|
| **A8** | How the Landscape dashboard **looks and is laid out**. Deal and RFx got a design pass; Landscape never did. This brings it to the same standard. No logic, no data, no numbers change. |
| **A9** | **Colour only.** Nothing else. |

That's the whole distinction. A8 = layout and visual quality. A9 = colour.

---

# A9 first, because its premise turns out to be wrong

## What the plan says

> "hardcoded **stoplight** hex literals ... bypass the CSS-var layer, so a token swap does
> not fully recolor. Replace with MCM (teal / burnt-orange / deep-rust / muted-blue)."

## What is actually in the code

I counted. **There is no stoplight palette left. There is no green anywhere in the
Landscape engine at all.** The dominant colours already ARE the MCM palette:

| Colour | Uses | What it is |
|---|---|---|
| `#2f6e6b` | 60 | teal |
| `#c15e19` | 46 | burnt orange |
| `#5c2b50` | 44 | plum |
| `#a2500f` | 35 | deep rust |

The reds present are `#e1251b` (Lilly Red) and `#9e1710`, both used for genuinely negative
states, which is correct under your purposeful-colour rule.

**So the recolor described in the plan has effectively already happened.** Someone did it
and the plan text was never updated.

## The real problem, which is different and smaller

The engine is already ~81% tokenised by volume: **3,477 `var(--token)` references** against
**795 hardcoded hex literals**. It is in a mixed state.

The number that matters is this one:

> **231 distinct hardcoded colours** across the four engine files.

Two consequences:

1. **A token swap still will not fully propagate**, which is the original complaint and is
   still true, just for a different reason.
2. **231 distinct colours is not a 3-colour system.** Most are probably near-duplicate
   shades that accumulated. This is the actual drift from your locked colour rule, and it
   is invisible today because the dominant four read correctly.

## What I propose for A9

**Rename it from "recolor" to "tokenise", and change the success test.**

Work: replace the 795 hardcoded literals with token references, collapsing the 231 distinct
colours onto the 36 defined tokens. Where a colour has no token, either add a token or
collapse it onto the nearest existing one.

**The verification is the good part: a correct A9 changes NOTHING visually.**

- Before/after screenshots of every Landscape tab must be **pixel-identical**. Any visible
  change means I collapsed two colours that were doing different jobs.
- Then swap one token value and confirm it propagates everywhere it should. That is the
  thing that does not work today.
- Old-hardcoded-hex count must reach 0.

**Risk: low.** The test is "nothing changed", which is unusually easy to check and hard to
fake. **Effort: M.** I would not need any design decision from you.

**My recommendation: do it, on the corrected premise.** And I would report the list of 231
colours grouped by near-duplicate, because that list is itself worth seeing.

---

# A8: the Landscape design uplift

## What it is

Bringing Landscape to the visual standard of the two locked dashboards. It is **not** one
change: it is a list of about 30 specific items, most of which are **your own directives**
from `LANDSCAPE-DEEP-DIVE-REVIEW-R2`.

## What is on the list

**Global (4 items).** Reskin every panel to the shared card style; re-tokenise to ≤3
colours (this is the same work as A9, so they overlap); Title-Case headings; drop the
dimension-lead band as its own card; add a narrative insight panel to every tab.

**Reverts (3 items).** Remove the Head-to-Head "compare candidates" launcher; revert
Head-to-Head to the old embedded-compare look; revert the Risk-Assessment heatmap to its
old style and colours, keeping the semantic labels and confidence dots.

**Per-tab restructure (about 18 items).** Examples: flip Ownership above Identity; put
Firmographics above Footprint; make the capability heatmap requirements-driven; equal-height
panels with scroll; narrative to the right of the scatter; a labelled Gartner-style
quadrant; a single-open accordion for risk posture; group Material Events by type and
severity; remove the Mitigation board from the Risk tab.

**Overview (1 item).** A supplier-count funnel, and **one visible score scale** instead of
the same number appearing as 89 / 89.37 / 4.51 / 60.77.

## The three decisions you owe on A8

These are already logged as M10, M11, M12 and cannot be resolved by me:

| | Decision | Why it needs you |
|---|---|---|
| **M10** | Segmentation quadrant thresholds | 6 of 7 suppliers currently land in "Leader", which makes the quadrant say nothing. Fixing it means moving the thresholds, and where they sit is a judgement about how hard the bar should be. |
| **M11** | #15 residuals | leader-row pale-orange fill and dead dark-mode CSS. Note the pale fill collides with your hard rule that a pale tint is never a background. |
| **M12** | Footprint: region schematic vs region list | A geo map is unreliable offline. Both options are honest; which one you want is taste. |

## How I would sequence it

Your own note says changes are **additive** and you are **conservative** here, so:

1. **Quick reverts first** (OV1, RA1, HH1, G2, G3). These undo things and are the easiest
   to judge. Screenshots after this batch.
2. **The global reskin** (G1). One change applied everywhere; biggest visual shift.
   **Stop here for your sign-off** before anything else, same as I did with Deep Dive.
3. **Per-tab restructure and narrative panels.**
4. **New visuals last** (the quadrant, the accordion, the events grouping, the footprint).

**Effort: L.** It is the largest remaining piece of work in the programme.

**Risk: medium, and it is the honest risk.** This is taste, in the one area where you have
been most conservative. A caliber pass means making judgement calls about hierarchy and
spacing that I cannot fully derive from a rule. That is exactly why I want the sign-off
gate at step 2 rather than at the end.

---

# What I recommend, overall

**Do A9 first, on the corrected premise.** It is lower risk, it needs no decision from you,
its success test is "nothing looks different", and it does part of A8's G1a for free.

**Then A8, in the four batches above, with a hard stop after the global reskin.**

Before A8 starts I need M10, M11 and M12 from you. M11 is nearly automatic given your
pale-tint rule. M10 and M12 are genuine judgement calls.

**One thing I want to flag rather than bury:** A8 is the single largest remaining item, it
is largely subjective, and Landscape currently works. If you would rather lock the other
four hubs and leave Landscape at its current standard, that is a defensible call. It would
mean A11 cannot close as written, and I would not reinterpret "all five hubs LOCKED" on my
own to make it pass.
