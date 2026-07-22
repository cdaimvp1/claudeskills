# Skill-dashboard redesign - synthesis + decision

Read this first; the 7 sibling files are the per-area detail. Everything here is a PROPOSAL awaiting
your sign-off. Nothing has been rebuilt yet.

## The headline finding

The platform dashboards look more coherent because they ARE one system: a single shared component
kit (`dash-kit` / `pv.css` / `theo-color.css`), one off-white+black shell, one type stack, one
color grammar, applied identically to every tab. The skill dashboards are 26 one-off inlined-JSX
exports, each reinventing the shell. **But the skill dashboards hold real analytical depth the
platform's demo tabs don't populate** (Pareto tier sliders, requirement-fit heatmaps, should-cost
tornados, Kraljic/renewal quadrants, the abstaining next-best-action, per-claim provenance).

So the move is: **reskin, don't rebuild.** The skill component contract
(`Metric`/`Card`/`Pillar`/`SevPill`/`StateBanner`/`STable`) maps ONE-FOR-ONE onto the platform's
`dash-kit` (`DK.metric`/`DK.card`/...). The merge is a token swap + shell swap + porting the skills'
richer charts/analyses into the shared kit - not 26 rewrites.

## DEEPENED BRIEF (Marc, 2026-07-22): this is IA + layout + interaction, NOT just a reskin

Correcting my own "reskin, don't rebuild" framing. The visual token swap is the EASY part. The real
reason the platform reads better is four structural properties the skill dashboards mostly lack, and
the redesign must deliver ALL of them per dashboard:

1. **Purposeful information architecture / consolidation.** Nothing is slapped on to look nice; every
   panel earns its place and its position. Several skill tabs/subtabs carry only 1-2 visualizations
   with thin explanation - those should be CONSOLIDATED into coherent, task-grouped tabs, and the
   overall tab/subtab structure of each dashboard re-thought around how a user actually works the
   problem (the way the platform groups by task, not by data source). Redesign the layout for
   effectiveness, not decoration.
2. **Every visualization is paired with a substantive narrative insight** (not a caption; a real
   "what this means / what to do" read). No chart stands alone on a subtab with minimal explanation.
3. **Linked focus (the key interaction).** Clicking an entity in a visualization - a supplier, a
   heatmap cell, a bar - FOCUSES the view on it: the narrative/insight text shifts from the overall
   read to a read about THAT entity, and related panels re-scope to it. Coordinated views / brushing,
   client-side, exactly like the platform ("click a supplier -> the panel below repaints in place").
   This is a first-class pattern baked into the shared component kit, available to every dashboard.
4. **Canonical, consistent visualization components across the whole suite.** The same analytical
   object must look and behave the SAME everywhere. Marc's example: contract-review's Commercial
   Analysis > Discount Architecture subtab has a discount waterfall that is DIFFERENT from the
   pro-forma-builder waterfall - they should be ONE canonical waterfall component. Build a single
   canonical viz library (one waterfall, one heatmap, one quadrant, one tornado, one ZOPA band, one
   Pareto, ...) with narrative-pairing + linked-focus built in, and every skill uses it - no skill
   hand-rolls its own variant of a shared shape.

Net: the per-dashboard deliverable is a REDESIGN SPEC covering (a) consolidated IA / tab structure,
(b) per-tab layout + the purpose of each panel, (c) viz<->narrative pairing, (d) the linked-focus
interactions, (e) which canonical components it uses - then build. The 7 sibling proposals are the
starting point; they need to go deeper on IA/layout/interaction, not just styling.

## THE ONE DECISION I need from you: adopting the platform design system means reversing locked canon

The platform's design language supersedes several currently-LOCKED skill-dashboard rules. This is a
deliberate reversal, so you should choose it explicitly rather than let it drift:

| # | Current locked skill canon | Platform (proposed new canon) | Why change |
|---|---|---|---|
| 1 | Georgia serif titles + Arial body (two families) | **Libre Franklin** everywhere + **Roboto Mono** for all numbers | one family reads calmer; matches the rest of Theo; serif-next-to-sans reads as two stapled documents |
| 2 | Dark #212121 header bar with red rule | **Off-white/black topbar** (black Lilly wordmark + Sacramento "Theo" + dino) | the dark bar competes with content + looks like a different product next to a Theo page; no app identity today |
| 3 | Bold Blue #0F3A85 as the primary everywhere | **5 `.pal-*` identity pairs** assigned by skill family (plum-teal / navy-teal / green-navy / graphite-plum / burgundy-navy) + one constant burnt-orange "standout" | variety-with-discipline; a handful of hues reused deliberately vs one blue on everything |
| 4 | "NO green in status - positive = Bold Blue" | **Green allowed** for ok/done, sparingly, never clustered beside red | the newer, authoritative `theo-color.css` already ships this; the no-green rule is the older doctrine |
| 5 | Lilly Red on every card tick/eyebrow/header | **Lilly Red scarce** - brand header + true danger only, never decorative | red-everywhere double-books the brand color as a status signal |
| 6 | 6-color chart palette `[Red,Blue,Brn,...]` | **`--ent-1..5`** categorical colors, SEPARATE from the 4-5 semantic status tones | today a chart legend can accidentally read as a status color |

Net: **off-white + near-black + a per-family accent pair + a scarce red + a 4-5 tone status vocabulary + green-for-done-only.** Georgia and the dark header go away. If you approve, this becomes the suite's new dashboard canon and I reconcile the brand-assets `SKILL.md` design contract to match.

## Design system to adopt (from "Platform Design System.md")

- **Shell:** off-white page (`--bg #E2E6E1` light / `#1C1C1C` dark), 56px sticky topbar (black Lilly
  lockup + Sacramento "Theo" + dino assistant button), underline text-tabs, segmented-pill for
  tertiary sub-subtabs, full dark-mode token set.
- **Depth via a neutral SHADE ladder** (bg < surface < panel < nested < well), never boxes-in-boxes.
- **Type:** Libre Franklin (300-800), Roboto Mono for numbers/ids/dates, Sacramento only for "Theo".
- **Dino:** `theo-dino-mark.png`, tinted by CSS filter, ONLY as the header assistant button (+ the
  PCC footer pacer) - never scattered as card decoration.
- **Net-new shared components to add to the kit** (benefit all skills): heatmap-cell, 2x2 quadrant,
  tornado, data-basis chip strip, research-log table.
- **Family palette assignment** (5 pairs, from the design-system doc): Strategy/spend -> plum-teal;
  Sourcing/eval -> navy-teal; Deal/negotiation -> green-navy; Contracts/governance -> graphite-plum;
  Relationship/personal/comms -> burgundy-navy.

## Per-dashboard headlines (detail in the sibling files)

- **RFx** (`RFx.md`): platform already has a 4-subtab RFx (Overview/Scoring/Analysis/Recommendation)
  with live weight-sliders. Port IN from skills: per-requirement source citations, a contradiction
  register, evaluation-engine's participation roll-up + single-vs-split-award modeler, and model
  rfp-engine's addendum concept (missing on both sides).
- **Landscape** (`Landscape.md`): platform Landscape is mature (4 rounds). Keep the skills' LOCKED
  5-tab specs; port IN: the excluded-vendors audit trail (5-code taxonomy), segmentation-threshold
  sliders, a scored offerings-to-need table, and a 6th Legal/Regulatory risk dimension.
- **Category Strategy** (`Category Strategy.md`): keep the platform's 2-tab architecture wholesale;
  graft in 9 skill panels (renewal-decision quadrant, escalation-trigger chips, spend-under-contract,
  geographic distribution, fragmentation bubble map, the ARIA spend-forecast slider [biggest gap],
  vendor+basis on savings cards, transparent likelihood x impact risk, co-located citations).
- **Deal/Negotiate** (`Deal-Negotiate.md`): platform Deal is very deep already; keep the skills'
  should-cost tornado, ZOPA bands, and the position-playbook where richer.
- **Overview/Docs/Comms** (`Overview_Documents_Comms.md`): adopt the project-overview framing +
  document register; the comms-convergence viz work continues in the PCC.
- **PCC** (`my-work-tasks-drawer.md`): full spec below.

## PCC redesign (your priority - "my-work-tasks-drawer.md")

Keep: the left/right split, the work-graph Issue model, the abstaining next-best-action, the
staged-direction -> one-consolidated-prompt submit mechanic, the Comms substance, the JSON-island
data contract, and the frozen storage key / file / id. Adopt: off-white/black full-bleed page,
black Lilly wordmark + Sacramento "Theo" + `theo-dino-mark.png` (CSS-recolored, replacing the emoji),
Libre Franklin + Roboto Mono, dark mode. Port IN from My Work + Tasks drawer: `.pincard` KPIs with
hover breakdown, a Tasks-drawer search/kind/sort toolbar, a new **Waiting** lane with a Nudge (feeds
the existing staged-prompt, never sends), dismiss/recall for FYI/NOISE issues, a collapsible
**Evidence** disclosure (source tag + auto/confirm chip), and richer Renewals/Savings/Report-Card
panels. All client-side; additive schema only (`evidence[]`, separate `theo.fieldguide.rowstates.v1`
+ `theo-theme` keys); frozen `workgraph.v1` untouched.

## Recommended build order

1. **Build the shared design-system kit** (tokens.css + reskinned dash-kit components + the 3 net-new
   chart primitives) as the foundation every dashboard imports.
2. **Build the PCC redesign as the flagship** (your priority; proves the language end-to-end).
3. **Reskin the dashboards family-by-family** onto the kit, grafting each sibling file's "port IN"
   panels, one family per pass (5 families).
4. **Re-generate the `_dashboard_previews` HTMLs** + re-package.

## Open kernel refinements (separate track, from your last message)
Legal tier -> LLM/python hybrid (playbook/MSA deterministic floor, LLM for non-playbook commercial).
Comment cleanup -> 2 modes + interactive walk-through. Roster -> comms/project-participant harvest +
domain-match + Lilly-email flagging. Ready to build on your go-ahead.
