# Overnight run — decisions needed

Anything ambiguous gets parked here rather than built. Format: what it is, what I
would have chosen, why, and what it is blocked on. Nothing in this file has been
built.

---

## Scope agreed for this run (2026-07-28)

**In scope, all three selected:**

1. **Docs and skills only** — no dashboard pixels change.
   - D2 shared no-green rule (`lilly-brand-assets-1c344a/references/brand-colors.md`
     + `dashboard-components.md` still say "no green or teal"; teal is now the
     primary settled/ok token, so the rule itself is wrong). Scope strictly to the
     colour tables and the no-green prose. ~26-skill blast radius.
   - D1 rewrite `dashboard-canonical.md` in the three lens skills
     (`lilly-contract-review-1c344a`, `scope-sow-architect-1c344a`,
     `pro-forma-builder-1c344a`) to the converged 4-tab IA + MCM palette.
     PRESERVE: contract-review's 5 output modes and clause/playbook engine;
     scope-sow's `Rewritten_SOW.docx` and 4-pass workflow; pro-forma's
     `pro_forma_generator.py` / `numeric_kernel.py` xlsx path.
   - D3 formalise the redesigned Trade Plan / Communications / L&P accordion
     scorecard / Scope & Performance master-detail as skill spec. PRESERVE the
     deduction kernel (#114).
   - D4 encode the shipped 4-tab IA as canonical, superseding the 6-tab proposal.
   - L3 Landscape SKILL.md + `dashboard-canonical.md` palette prose to MCM naming.
     PRESERVE the report .docx / CSV schemas / `landscape_handoff.json` sections.
   - Tracker reconciliation and this file.

2. **Deal finish-out** — closest to lock.
   - #11 Positions port to the locked `MOCKUP-negotiation-positions.html`.
   - #12 Communications filters + expand-all (needs a DealUI delegated handler;
     `_filterTable` is table-only).
   - #14 pale-fill sweep, ~11 scoped styles in `tab-contract.js` /
     `tab-commercials.js` / `tab-negotiation.js`.
   - #16 full-tab verification + full-codebase malicious-code sweep.

3. **Landscape recolour**
   - L1 replace the hardcoded stoplight hex in `pv-07-landscape-render.js`,
     `pv-07a-assess-model.js`, `pv-07b-deepdive.js`, `pv.css`, which bypass the
     token layer, with MCM. Colour only: do not touch tab structure or the
     `PROJECTS[key]` data contract, do not touch pv-01/03/04/08/1x.
   - L2 re-sync corrected assets into `supplier-landscape-1c344a/dashboard/assets/`,
     rebuild, verify old-hex count is 0.
   - OV1 remove the Head-to-Head launcher from Overview (decided by Marc).

**Explicitly out of scope this run:** the RFx and Landscape type-ladder renderer
pass (off-ladder 7 / 12 / 16px) and converting their inline-styled panel headers
to `.card-hd`. Marc did not select it.

---

## PARKED — needs Marc

### 1. Which Head-to-Head element is "the launcher"
- **Decided by Marc:** remove it.
- **Ambiguity:** OV1 says remove the Overview tab's "compare candidates"
  launcher. There are two candidates in the source:
  (a) the `Competitive Dynamics & Head-to-Head` card on the Overview tab
      (`pv-07-landscape-render.js` ~line 604-734), which contains an interactive
      COMPARE control, and
  (b) the standalone `Head-to-Head` tab itself (`pvH2HHtml`, `pv-07b-deepdive.js`
      ~line 880), which is a full tab and is almost certainly NOT what OV1 means.
- **What I would do:** remove the COMPARE launcher control from (a) and keep the
  competitive-dynamics content and the (b) tab intact, because OV1 is listed
  under Overview items and HH1 separately asks to revert the Head-to-Head tab to
  its old embedded-compare look, which only makes sense if the tab survives.
- **Status:** PARKED. One line of confirmation unblocks it.

### 2. Deep-dive "complete vs remaining" contradiction — RESOLVED 2026-07-28
- **Marc's call: it is COMPLETE.** The Landscape Supplier Deep Dive tab (P2) is
  done. FM4 labelled quadrant, RR3 risk-posture accordion, RR4 material events
  grouped by type, and CO4 operating footprint are NOT outstanding work; the
  later BUILD-TRACKER entry listing them is stale and has been struck.
- **Status:** CLOSED. No build follows from it.

### 3. Deal judgment calls Marc flagged for confirmation
Carried from MASTER-REMAINING-WORK, all four still open and all four untouched:
- L&P group bands ("Issues N" / "Obligations N") vs a per-row tag.
- Boot auto-expand making the register start taller.
- Protection-Scorecard 8-issue-category spine vs the 26-row literal union.
- Cross-Doc "Open Document Risks" reframe: adopt the approved mockup live?
- Document Family Register: click-to-open the register row?
- #13 Next-Session Brief: re-home or drop.
- **Status:** PARKED. #11, #12, #14 and #16 do not depend on any of them.


---

## Review fixes 2026-07-28 (done before the overnight run)

- **--nested was #f1efec**, a hair off white, so every "None on file" / "To
  assign" block vanished on a white panel. Repointed to #EDE8E0 with a rule.
  Global token: fixes it on every dashboard, every tab, wherever the block
  appears. Verified live.
- **Section headers were 9px**, eyebrow size rather than header size. A band that
  groups panels has to out-rank the panel titles under it. Now 13/800 uppercase
  in plum with the spine grown to match. Verified on RFx: "Suppliers & contacts"
  renders 13px / 800 / plum.
- **REGRESSION, mine.** The protocol layer listed `.tabbar` among the tab strips,
  which handed Deal's sticky top-level bar a flex context it never had. That
  centred the tabs and, with overflow-x:auto, produced a vertical scrollbar.
  Deal's own rule is restored; only the label and underline treatment stays on
  the buttons. Verified: display block, overflow-y visible, no vertical scroll,
  tabs left-aligned.

## QUEUED into the overnight Landscape recolour (L1)

Marc's remaining three from the same review. All are Landscape, all are colour or
nesting, all fold into L1/L2 rather than needing a separate pass:

1. **Plum and teal still too light in places on the Supplier Deep Dive tab.**
   These are hardcoded hex in `pv-07b-deepdive.js` that bypass the token layer,
   which is exactly what L1 exists to fix.
2. **Emphasis drawn in something other than burnt orange**, also on Supplier Deep
   Dive. Same cause, same fix.
3. **Ownership & Control: the tree sits in a panel inside a panel.** Source is
   `pvDD2Card('Ownership & Control', pvDD2OwnershipTree(...), ..., {fill:true,
   maxBody:400})` in `pv-07b-deepdive.js` line ~273. The inner wrapper has to go
   so the tree sits directly in the main panel body. Structural, not colour, but
   it is the same file and the same rebuild.
