# THEO (procurement-launcher) redesign plan - for review, no code yet

Baseline: procurement-launcher-1c344a/SKILL.md, v2.7, 705 lines, copied byte-identical
into the working folder from the v10.6.6 bundle (see ../_BASELINE_MANIFEST.md for the
SHA256 to verify against). Every content move described below is a relocation, not a
rewrite: the moved block is diffed against this baseline after the move and must match
exactly except for the surrounding pointer text. Nothing analytical, no wording in the
teach-mode curriculum, no CSS/JS in the widget, changes as part of this work.

## The two problems, kept separate

**Problem A: slow to load.** Every invocation of THEO, including a bare "theo.go" that
only wants the menu, currently pays for two blocks it usually does not need:
- The full three-tier Teach mode curriculum, lines 153-338 (186 lines): Beginner/
  Moderate/Expert paths, all their step-by-step scripts and tappable-picker text.
- The full widget HTML, lines 443-704 (262 lines): CSS, the 7-section skill-row
  markup, and the JS behavior layer.
Combined this is 448 of the file's 705 lines, or 64%, riding along on every run.

**Problem B: not a real orchestrator.** THEO's "brain" is a single prose routing table
(lines 394-424) that the model re-reads and pattern-matches every turn, and its own
text states plainly it "cannot call or run other skills... hands off one skill at a
time and never tries to run a whole pipeline itself" (lines 148, 390). It correctly
identifies the ONE next skill but never surfaces the chain that skill sits in, so a
user discovers step 2 only after finishing step 1.

These are independent. Fixing A does not require touching the routing logic; fixing B
does not require re-inlining anything. Both are addressed below because they compound
(a leaner file makes the kernel's job easier to verify and reason about), but each
could ship alone if you want to sequence them.

## Fix A: companion-file split (content-preservation plan)

Two new companion files, created by copying the named line ranges verbatim out of the
baseline SKILL.md, with only a one-line pointer left behind at the original location.

### A1. `references/teach-mode.md`

- **Source range:** lines 153-338 of the baseline (the entire "Teach mode" section,
  through "What Teach mode must NOT do").
- **Move:** copy verbatim into `procurement-launcher-1c344a/references/teach-mode.md`.
  No rewording, no re-leveling, no trimming of any of the three paths' scripts.
- **Verification step (required before this is considered done):** extract this same
  line range from the new companion file and diff it byte-for-byte against lines
  153-338 of the baseline SKILL.md captured in `_BASELINE_MANIFEST.md`. Any diff other
  than the file boundary itself is a defect, not a stylistic choice, and must be fixed
  before moving on.
- **Pointer left in SKILL.md:** replace the removed block with one line: "Teach mode
  lives in `references/teach-mode.md`, loaded only when the user asks to learn (see
  trigger phrases in the frontmatter). Do not inline it here."
- **Loading rule added to SKILL.md:** "When a teach-mode trigger fires (see frontmatter
  triggers, or the widget's `?` button), read `references/teach-mode.md` before
  responding. For every other trigger, do not read this file at all."

### A2. `assets/theo-widget.html`

- **Source range:** lines 443-704 of the baseline (the full `## INLINED:
  references/widget.html` block, CSS through closing `</script>`).
- **Move:** copy verbatim into `procurement-launcher-1c344a/assets/theo-widget.html`,
  same diff-verification requirement as A1.
- **Pointer left in SKILL.md:** "The launcher widget lives in
  `assets/theo-widget.html`. Read it and pass its contents verbatim to
  `visualize:show_widget` as `widget_code`. Do not re-author, restyle, or inline it
  here."
- **What does NOT change:** the Markdown fallback menu (lines 353-378) stays inline in
  SKILL.md exactly as today, since it is the thing that must still work if the
  companion file cannot be read for any reason - this is the suite's existing
  graceful-degradation pattern (lilly-contract-review, rfp-engine both keep their
  fallback text inline while moving bulk reference material to companions).

### Net effect

A bare routing invocation now loads: frontmatter, Role/Boundaries (lines 140-151),
the routing-table-as-data described in Fix B, the Markdown fallback text, and the
widget companion (still needed for the default render) - but never the teach-mode
curriculum. A teach-mode invocation loads the curriculum companion instead of it
being permanent cargo on every other kind of turn. This mirrors exactly the
conditional-loading pattern already proven in lilly-contract-review's Phase 0B.5 and
rfp-engine's v2.2 migration, applied to THEO for the first time.

## Fix B: the routing/chain decision layer

### B1. What becomes structured data instead of prose

The routing table (lines 394-424, 26 skills across 7 pipelines) is already
tabular in the markdown source. The change is not its content, it is what reads it:
today the model re-parses this markdown table's prose every turn; the fix is to treat
its columns (Skill, trigger phrases, required/optional attachment types) as a small
typed lookup the decision logic below consults directly, with the markdown table
becoming the human-readable rendering of that same data rather than a separate
source of truth that could drift from it.

### B2. Typed facts (what the model must resolve before deciding)

- `stated_need`: the user's free-text description of what they want.
- `explicit_skill_request`: did the user name a skill or its trigger phrase directly
  (skip inference entirely if so).
- `attachments_present`: a set drawn from what is actually in the conversation
  (contract/redline doc, spend file, supplier list, RFx submissions, none).
- `continuing_chain`: is this Project/conversation already mid-sequence on a prior
  skill's output, and if so, which skill produced it. (Detectable today from Project
  knowledge artifacts or the user referencing "the shortlist I just got," etc.)

### B3. Hard gates, in order

1. If `explicit_skill_request` is unambiguous, route directly. No inference step
   needed, no chain lookup needed unless the user also asks "what comes after this."
2. If `continuing_chain` is set, consult the chain table (B4) for what typically
   follows the producing skill BEFORE considering `stated_need` in isolation. A user
   who just got a supplier shortlist and says "now what" should get the chain answer,
   not a fresh classification from zero.
3. Otherwise, classify `stated_need` + `attachments_present` against the routing
   table's trigger-phrase/attachment columns.

### B4. The chain table (the actual orchestration upgrade)

For each of the 26 skills, a short predecessors/successors list, seeded from what the
suite already states in scattered form:
- The 9 skills that already carry an explicit Consumes/Feeds/Integration section in
  their own SKILL.md (should-cost-builder, pro-forma-builder, negotiation-simulator,
  market-rate-benchmarking, negotiation-playbook-learning, commercial-negotiation-prep,
  legal-negotiation-prep, category-strategy, lilly-contract-review) - their own stated
  text is the source, copied in, not re-derived.
- The RFx pipeline chain, per the sourcing/RFx design audit: supplier-landscape ->
  (requirements grid, once built) -> rfp-engine -> rfp-case-manager (operational
  tracking in parallel) -> rfp-response-analysis -> evaluation-engine -> decision-deck.
  This chain has two known open defects the audit surfaced (the requirements-grid gap,
  and the rfp-engine/evaluation-engine criteria-ownership contradiction) - the chain
  table should record the CURRENT actual behavior, not a fixed-and-aspirational one,
  until those are separately resolved. Do not have the chain table quietly paper over
  a defect that is still open elsewhere.
- Skills with no stated chain position (17 of 26) get an explicit "no known
  predecessor/successor" entry rather than a guessed one - same safe-default
  discipline as the rest of the suite (never fabricate a relationship that is not
  documented somewhere).

### B5. Safe default on ambiguity

Unchanged from the suite's existing Rule 2: ask once, batched, 1-3 tappable options,
most-likely pre-selected. This is not new behavior, it is applying behavior every
skill already has to the routing decision itself, rather than leaving routing to
freehand pattern-matching with no fallback when the match is weak.

### B6. What this explicitly does not claim

THEO still cannot invoke another skill as a function call. The chain table lets it
tell the user the likely next 2-3 steps and prime the handoff with the right context,
which is a real, useful upgrade over today's single-hop silence, but it is not
sub-agent dispatch. The chain table is written so it can become dispatch data later
(if Cowork-style sub-agent spin-up becomes available) without a redesign, but nothing
in this plan claims that capability today.

## Where this data lives

Not in lilly-brand-assets, per your correction: that skill's scope is branding and
design references only, and the user manual never should have been there either. The
routing table and chain table are THEO's own operational data, so they stay inside
procurement-launcher, most naturally as a new `references/routing-and-chains.md`
companion (loaded on every invocation, since routing is the skill's core job, unlike
teach-mode content which is genuinely conditional).

## Sequencing and risk

Lowest risk first: A1 and A2 (pure relocation, verified by diff, zero behavior change
beyond load timing). Then B (touches actual routing logic, needs a few test
invocations against known trigger phrases to confirm nothing that used to route
correctly now routes differently). Recommend shipping A alone first if you want a
quick, low-risk win before touching B.

## Open items for your review before any file is touched

1. Confirm the A1/A2 split as scoped above, or flag if any part of the teach-mode or
   widget content should NOT move (for example if you want the Markdown fallback
   menu's skill list also externalized later - not proposed here since it is the
   degradation path and the suite's convention is to keep that one inline).
2. Confirm B4's chain table should record known-defective chain links as-is (e.g. the
   rfp-engine/evaluation-engine contradiction) rather than this work silently
   "fixing" them as a side effect - fixing those belongs to the RFx pipeline work,
   not to THEO's redesign.
3. Confirm the new companion lives at `procurement-launcher-1c344a/references/
   routing-and-chains.md`, not lilly-brand-assets, per your instruction.
