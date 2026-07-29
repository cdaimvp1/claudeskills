# Cross-check: dashboard/build trackers vs `_audit/SYNTHESIS.md` findings

Read in full: DASHBOARD-CHANGE-DECISIONS.md, VERSION-LOCK-2026-07-29.md,
_category_build/CATEGORY-STRATEGY-BUILD-SPEC.md,
_redesign_proposals/CATEGORY-STRATEGY-REBUILD-PLAN.md,
_redesign_proposals/Category Strategy.md, _deal_build/DEAL-DASHBOARD-TRACKER.md,
_deal_build/DEAL-DESIGN-DECISION.md, _deal_build/DEAL-REDESIGN-BRIEF.md,
DEAL-TAB-REDESIGN-PROPOSAL.md, _redesign_proposals/DEAL-HUB-SKILL-PLAN.md,
_platform_build/LANDSCAPE-REDESIGN-BUILD-TRACKER.md,
_platform_build/LANDSCAPE-REDESIGN-SPEC-v3-TOPLEVEL.md,
_platform_build/DEEP-DIVE-REDESIGN-SPEC-v3.md, LANDSCAPE-SPEC-GAP-REVIEW.md.
Also consulted for cross-references found while reading the above (not in the
original list, cited where used): MASTER-REMAINING-WORK.md,
PROGRAM-MASTER-PLAN.md, SESSION-HANDOFF.md.

---

## PRIORITY QUESTION: category-strategy tab structure (F4)

### The full sequence, with dates and evidence

1. **Legacy/current SKILL.md: 11 tabs, JSX-clone pattern.** Still true today.
   `category-strategy-1c344a/SKILL.md:746` points to the locked
   `dashboard-canonical.md` ("all 11 tabs"); `:821-847` inlines
   `examples/category_strategy_canonical_dashboard.jsx` with
   `TABS=["Overview","Pareto & Tail","Suppliers","Subcategories","Market & Kraljic","Risk","Strategy","Savings & Scorecard","Supplier Development","Rationalization","Trend & Change"]`
   (line 846); `:1588` is the instruction the audit quoted verbatim ("Clone the
   structure, swap the data entirely"); `:1767` and `:1777` (v4.2 changelog,
   MANAGE-mode note) both say "No tabs added, removed, or reordered; the locked
   11-tab skeleton is unchanged." This file has not been touched since.

2. **2026-07-25, Phase 0 plan: 11 -> 7 tabs + a new Execution tab, DRAFT.**
   `_redesign_proposals/CATEGORY-STRATEGY-REBUILD-PLAN.md:1-9`: "Status: DRAFT
   plan for Marc's approval... Nothing in `category-strategy-1c344a` is edited
   until this plan is approved." Table at lines 24-35 gives the 7-tab mapping
   (Overview / Spend & Suppliers / Market & Risk / Strategy / Savings &
   Scorecard / Supplier Program / Execution-NEW). Lines 10-13 record a
   never-regress governance clause: "The three modes (DEVELOP / MANAGE /
   PREPARE) and their standalone deliverables (the DEVELOP/MANAGE JSX
   dashboard...) are all kept." Lines 55-58 lay out a 4-phase execution
   sequence that includes rewriting `references/dashboard-canonical.md` and the
   canonical JSX to 7 tabs.
   **This plan was approved** — `PROGRAM-MASTER-PLAN.md:84`: "Category Strategy
   — Phase-0 plan approved (11->7 tabs + new Execution tab, MCM, claim-gate).
   Write the Phase-1 deterministic spec, build, carry into a Category Strategy
   hub."

3. **2026-07-27, Phase-1 deterministic spec: still 7 tabs, but now for a
   separate standalone dashboard, not the SKILL.md.**
   `_category_build/CATEGORY-STRATEGY-BUILD-SPEC.md:44-47`: "The approved #4
   plan is 7 tabs... Every panel it wants is kept; the navigation is
   shallower." This document is written for `_category_build/` — the Python
   deterministic-dashboard engine (Landscape/Deal pattern), a different
   artifact from the skill's own JSX. It never mentions `SKILL.md` (checked
   directly, no hits).

4. **2026-07-28, actual build: restructured again to 5 tabs.**
   `MASTER-REMAINING-WORK.md:35-36`: "Done and verified 2026-07-28: Category
   Strategy restructure (5 tabs, Market & Risk merged to one segmented screen,
   market-data line items, restyle protocol, type ladder 11/13/20/28)."
   `SESSION-HANDOFF.md:78-88` gives the mechanism: "5 tabs / 12 screens, then
   Market & Risk merged to one screen: now 5 tabs, 10 screens. Tab order:
   Overview, Spend & Suppliers, Trend & Change, Market & Risk, Strategy &
   Plays." Note this final order keeps **Trend & Change as its own tab**
   (dropped from the 7-tab plan, which had folded it into Overview/Execution)
   and has **no Supplier Program tab and no Execution tab** — both were in the
   approved 7-tab plan and both are gone from what shipped.

5. **2026-07-29: 5 tabs locked, verified against the running build.**
   `VERSION-LOCK-2026-07-29.md:26-38`: "Five tabs, in argument order: Overview
   · Spend & Suppliers · Trend & Change · Market & Risk · Strategy & Plays,"
   with the Overview/Spend&Suppliers/Trend&Change/Market&Risk/Strategy&Plays
   breakdown and locked sub-decisions (Market & Risk is one screen not three;
   line-item segmentation is market data not a Lilly spend split; supply risk
   uses log-scaled average spend per vendor, not vendor count; Strategy & Plays
   reproduces the platform's outer tab verbatim). `MASTER-REMAINING-WORK.md:12-15`
   confirms: "Category Strategy locked 2026-07-29 (tag
   `category-strategy-locked-2026-07-29`), verified live: 5 tabs / 7 subtabs
   render, 0 JS errors."

### Direct answers

**What tab structure was decided, when, by whom, and does anything still
endorse 11 tabs?** The locked, verified, shipped structure is **5 tabs**
(Overview, Spend & Suppliers, Trend & Change, Market & Risk, Strategy &
Plays), locked 2026-07-29, Marc's call per `VERSION-LOCK-2026-07-29.md:1-3`
("This is the locked version. Marc's call."). **Yes, one document still
endorses 11 tabs: `category-strategy-1c344a/SKILL.md` itself**, unchanged
since before this whole sequence started (lines 746/846-847/1588/1767/1777).
The platform's own `category-strategy.html` "Deep Analysis" view also still
carries 11 tabs (`_redesign_proposals/Category Strategy.md:26-28`), but that is
a description of a live, separate platform artifact being used as design
grounding, not a document prescribing what the skill or dashboard should be.

**Was an 11-to-7 mapping approved, then superseded by the 5-tab lock?** Yes,
exactly. Approved 2026-07-25 (`PROGRAM-MASTER-PLAN.md:84`), formalized into a
build spec 2026-07-27 (`CATEGORY-STRATEGY-BUILD-SPEC.md`), then superseded by a
further restructure to 5 tabs during the actual build on 2026-07-28
(`MASTER-REMAINING-WORK.md:35-36`, `SESSION-HANDOFF.md:78-88`), locked
2026-07-29. **No document narrates the 7-to-5 reasoning explicitly** — it
appears as a fait accompli in the session-handoff/remaining-work logs, not as
a reasoned decision record the way the 11-to-7 move was. This is a
documentation gap worth flagging to Marc even though the audit didn't name it:
the Supplier Program and Execution tabs from the approved 7-tab plan were
dropped with no recorded rationale, and Trend & Change was un-folded back into
its own tab against that plan's stated preference (`CATEGORY-STRATEGY-REBUILD-PLAN.md:36-37`:
"Recommended: 7 with Trend folded, since Trend is a MANAGE-only delta, thin in
DEVELOP").

**Is there an explicit decision that `category-strategy-1c344a/SKILL.md`
should be rewritten to the deterministic data-object pattern? Tracked as done
or outstanding?** Yes, explicit, and **outstanding, not done**.
`PROGRAM-MASTER-PLAN.md:99` (WS3a, item 1): "Remove retired **reference-JSX**
dashboards (the per-skill React examples superseded by the
deterministic-dashboard architecture) **once each hub carries its locked
dashboard**." Category Strategy's hub dashboard is now locked
(2026-07-29), so this skill qualifies. `PROGRAM-MASTER-PLAN.md:110` (WS3, item
3) makes the same point again: "D1: rewrite each lens skill's
`dashboard-canonical.md` to the deterministic-dashboard architecture, retiring
reference-JSX (lilly-contract-review, scope-sow-architect, pro-forma-builder;
sweep the rest)." Category-strategy is covered by "sweep the rest." **Neither
line has a completion mark**; both sit inside WS3a/WS3, which the plan's own
phase order (`PROGRAM-MASTER-PLAN.md:41-51`) places in **Phase 2, after all
five hub dashboards lock** — and as of this reading, `rfx-hub`, Deep Dive, My
Work and the Landscape finish are still open (`MASTER-REMAINING-WORK.md:22-23`).
So the rewrite is a real, named, approved-in-principle item, correctly
sequenced to come later, not forgotten and not contradicted.

One nuance the audit could not have caught without these documents: the
2026-07-25 rebuild plan's own governance (`CATEGORY-STRATEGY-REBUILD-PLAN.md:10-13`)
had explicitly preserved the skill's own JSX-authoring mode as a
never-regress standalone deliverable. `PROGRAM-MASTER-PLAN.md` (dated
2026-07-26, one day later) supersedes that with the "retire reference-JSX once
the hub exists" directive. This is not a contradiction Marc needs to resolve —
it is a later, more specific decision overriding an earlier draft — but it
means the eventual SKILL.md rewrite is not a pure lift of Landscape's "model
authors only the data object" pattern; it is a decision to retire the
in-skill JSX-generation capability entirely in favor of pointing at the
`_category_build` engine, and that retirement is explicitly gated on the hub
existing, which it now does.

**What would have to change in SKILL.md, per the specs read?**
1. Replace the `TABS` array (line 846) and every place that names the 11
   tabs (`:746`, `:1588`, `:1767`, `:1777`) with the locked 5: Overview, Spend
   & Suppliers, Trend & Change, Market & Risk, Strategy & Plays
   (`VERSION-LOCK-2026-07-29.md:27-38`), including the Market & Risk
   single-screen/three-band structure and the Trend & Change / Tail &
   Rationalization merge (same file, lines 44-55).
2. Replace the line-1588 instruction ("Clone the structure... Do not redesign
   the layout, tabs, components, or styling per run... Clone the structure,
   swap the data entirely") with Landscape's pattern
   (`category-strategy-1c344a/SKILL.md` should adopt language equivalent to
   supplier-landscape's line 230: "Do NOT hand-author JSX/React or CSS; your
   only job is the data object; the shipped, locked engine renders every
   tab"), pointing at `_category_build/build_dashboard_category.py`.
3. Retire `examples/category_strategy_canonical_dashboard.jsx` as the
   reference implementation (or explicitly demote it to historical/legacy),
   per `PROGRAM-MASTER-PLAN.md:99`.
4. Carry forward the locked sub-decisions from `VERSION-LOCK-2026-07-29.md`
   that are substantive, not just structural: line-item segmentation is
   market data, not a Lilly spend split (line 47-49); supply risk is
   log-scaled average spend per vendor, not vendor count (line 50-52); type
   ladder 11/13/20/28 (line 56-62); Porter as one overlaid pentagon (line
   63-67).
5. This is sequenced work (WS3a/WS3), not a drop-everything fix — see the
   "locked constraint the audit's order would violate" section below.

---

## The other six findings

### F1 — kernel arithmetic done in prose

**ALREADY KNOWN OPEN, agrees with the audit.**
`PROGRAM-MASTER-PLAN.md:108` (WS3, item 1): "Deterministic Python where it
makes sense (ranked): **(1) category-strategy — highest; Pareto/HHI/CAGR/YoY/
tail-threshold/anomaly all run unvendored.** (2) negotiation-playbook-learning
— rate/CI/N-gates/0-15->0-100 normalization in-model. (3) rfp-engine — light;
weight-sum-to-100 + NPV self-checks -> kernel call. (4) negotiation-simulator
— narrow; `capture%` edge-case helper." This is a near-exact match to the
audit's list (negotiation-playbook-learning, rfp-engine, category-strategy all
named), independently ranked, sequenced into WS3 (Phase 2, after the dashboards
lock). Not done yet. The audit's Protection Score gap (prose-derived in two
skills, absent from the kernel) is not mentioned anywhere in the dashboard
documents; that specific sub-point is new relative to these trackers, though
the general "add missing kernel coverage" direction is not.

### F2 — 3,383 lines of dead generator code (should-cost, market-rate)

**GENUINELY NEW relative to these trackers.** `_deal_build/DEAL-DASHBOARD-TRACKER.md:96-98`
lists a "PENDING, broader task list" that follows "the pro_forma_generator.py /
should-cost / market-rate .xlsx pattern" for four *different, new* generators
(evaluation-engine, executive-summary-package, rfp-response-analysis,
sole-source-challenge) — all four are confirmed DONE later in the same file
(lines 189-203, 214-224). None of this concerns the two existing but
**unwired** `should_cost_generator.py` / `market_rate_generator.py` files the
audit flagged; the tracker never says those two need to be wired into their
own SKILL.md. `PROGRAM-MASTER-PLAN.md:109` mentions market-rate-benchmarking
and should-cost-builder only for a different issue (adding staleness/citation-age
flags to their web research), not for wiring their generators. No dashboard
document contradicts or pre-empts the audit's finding; it is untouched by this
whole line of work.

### F3 — only deal-tab has a slice contract

**ALREADY KNOWN OPEN, agrees with the audit, explicitly tracked.**
`MASTER-REMAINING-WORK.md:320`: "`[Marc, after D0-D2]` **dashboardData SLICE
CONTRACT** — author 'Deal-tab hub contribution — output slice' into each lens
skill's SKILL.md: contract-review owns `issues[]`/`documentConflicts[]`/
`protection{}`/`obligations[]`/`tacticFlag`; scope-sow owns `scope{}`+scope
`issues[]`; pro-forma owns `commercialLines[]`/`scenarios[]`/`assumptions[]`/
`proforma{}`/`benchmarks[]`. Strip competing 'build your own dashboard'
instructions." `PROGRAM-MASTER-PLAN.md:110` restates the same item as WS3 #3.
`_deal_build/DEAL-DESIGN-DECISION.md:215` ("Integrity + generatability") and
`_redesign_proposals/DEAL-HUB-SKILL-PLAN.md:40-41` both describe the same
lens-skill-returns-a-bounded-slice mechanism for Deal specifically, which is
exactly the pattern deal-tab-1c344a has and the rest of the suite lacks. This
confirms the audit's count (1 of 31) and confirms the gap is already named,
scheduled, and not yet built for anyone but Deal.

### F5 — four distinct slowness mechanisms

**Not addressed anywhere in these documents; GENUINELY NEW relative to this
document set.** None of the 14 documents read discuss multi-pass document
reopens, per-item unbatched kernel calls, unbounded per-line web search, or
model-assembled documents as a performance concern — they are UI/dashboard
build specs, not skill-runtime-efficiency documents. No contradiction, no
prior decision either way.

### F6 — procurement-help-desk is an inert offline scaffold

**ALREADY KNOWN OPEN, agrees with the audit almost verbatim, explicitly
tracked as needing Marc.** `PROGRAM-MASTER-PLAN.md:133-135` (WS6): "`[Marc]`
Decide: `procurement-help-desk` as a sibling skill vs fold into
`process-navigator` as a second mode. `[blocked/Lilly network]` Run the 6
network-gated harvest steps for help-desk (validate all 4 sources, harvest the
vendored-fallback corpus, tune the End-User Intent Taxonomy, re-verify the
ProtectLilly retrieval gap)." This is the identical undecided fork and the
identical network-blocked status the audit names, already logged, sequenced
into WS6 (Phase 3, gated behind Phases 1-2).

### F7 — orchestration should be a new dedicated skill, not an expanded THEO

**Partially decided, and consistent with (not contradicting) the audit's
recommendation, though the audit's specific proposal is not itself decided.**
The suite's actual plan is a set of **per-domain thin hub orchestrator
skills**, not one cross-suite orchestration skill: `PROGRAM-MASTER-PLAN.md:83`
("Each = locked deterministic build... + a thin hub orchestrator skill"),
applied to `rfx-hub` (line 79: "thin orchestrator carrying the locked
dashboard; model authors only the data object"), `deal-tab-1c344a`
(`MASTER-REMAINING-WORK.md:314`, already built), and a PCC orchestrator (WS5,
`PROGRAM-MASTER-PLAN.md:127`, explicitly "NO dashboard-canonical, no locked
artifact"). Meanwhile Theo/THEO stays a conversational **router**, not an
orchestrator: `PROGRAM-MASTER-PLAN.md:15` ("Theo / routing — still a static
menu router; the conversational intake + orchestration web are planned, not
built") and WS4 (line 117-123) scopes Theo's rebuild to intake, a routing
manifest, ranked handoffs and journey state — never to hosting multi-skill
orchestration logic itself. This matches the audit's core claim (don't load
orchestration into THEO) but the suite's chosen shape is many small
domain-scoped hubs, not the single dedicated orchestration skill the audit
recommends copying timeline-builder's state-file pattern into. Neither
document set decides between these two shapes for a *cross-domain* re-run
capability (e.g. "re-run RFx scoring after new bids arrive, across skills");
that specific idea is genuinely open. The stale-handoff-schema bug the audit
names (rfp-engine's copy of case-handoff-schema.md vs rfp-case-manager's) is
not mentioned in any of these 14 documents; also genuinely open.

---

## Locked constraints the audit's recommendations would violate

**The audit's "Recommended order" conflicts with the suite's locked phase
sequencing.** `PROGRAM-MASTER-PLAN.md:41-43`: "PRIORITY ORDER (phased) — THE
sequence (re-sequenced with Marc 2026-07-26)... **The dashboards gate almost
everything, so they go first**; a skills-file CLEANUP pass sits between the
dashboards and the deep skills work... the ARIA conversion is DEAD LAST." The
explicit phase order is: **Phase 1** — finish all five hub dashboards (RFx +
rfx-hub, Category Strategy, Deep Dive, My Work, Landscape); **Phase 2** — WS3a
skills-file cleanup, then WS3 skills review/enhancement (this is where kernel
adoption, the dead-generator class of fix, and the slice contract all live);
**Phase 3** — conversational/orchestration (Theo, PCC, help-desk); **Phase 4**
— foundation/release; **Phase 5** — ARIA, last.

The audit's own recommended order is: (1) wire the two dead generators, (2)
fix the stale handoff schema, (3) kernel adoption pass, (4) rehome Category
Strategy + build rfx-hub, (5) attack the four slowness mechanisms, (6) design
orchestration and slice contracts. Item 4 mixes a Phase-1 item (finish
`rfx-hub`) with a Phase-2 item (retire Category Strategy's reference-JSX) as
if they were the same kind of work; items 1, 3, and 6 are Phase-2/Phase-3 work
the master plan says should not start until Phase 1's five dashboards are all
locked — and as of this reading, three of five (rfx-hub, Deep Dive, My Work)
are still open (`MASTER-REMAINING-WORK.md:22-23`), with Landscape also not
fully locked (`PROGRAM-MASTER-PLAN.md:11`). Following the audit's order as
written would mean starting kernel-adoption and dead-generator work before
the dashboards gate closes, which is exactly the sequencing Marc set and
re-confirmed on 2026-07-26. This is not a case of the audit being wrong about
the substance of any one finding — every finding it raised is either already
tracked (F1, F3, F6, part of F7) or genuinely new and additive (F2, F5, the
handoff-schema bug in F7) — it is specifically the **order** that would
reverse a documented sequencing decision if followed literally.

No other locked constraint in the 14 documents is contradicted by the audit's
findings. The Deal, RFx, Landscape and Category Strategy locks
(`VERSION-LOCK-2026-07-29.md`, `_deal_build/DEAL-DASHBOARD-TRACKER.md:311-368`)
are UI/structure locks; the audit's findings are about skill-file content
(kernel wiring, generator wiring, slice contracts, help-desk, orchestration,
prose performance) and do not ask to reopen any locked dashboard's UI. The one
overlap — Category Strategy's SKILL.md tab count and JSX pattern — is not
itself locked; the *dashboard's* 5-tab structure is locked, but the *skill's*
JSX/tab mismatch is an acknowledged, scheduled-but-not-executed cleanup item,
not a locked decision the audit's finding contradicts.
