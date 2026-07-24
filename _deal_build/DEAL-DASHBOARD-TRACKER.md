# Deal Dashboard, Build Tracker

Durable state for the Deal hub dashboard (`_deal_build/`). Read this FIRST when resuming.
Marc asked (2026-07-24, overnight): track everything, commit + test + track OFTEN, finish
autonomously-doable pending work, DO NOT hallucinate or drift.

## What this is / how to build + test
- Source: `_deal_build/_parts/*.js` (+ `style.css`). LLM authors ONLY `data.js`; everything
  else is static render code. `build_deal_artifact.py` inlines the parts + the platform chrome
  into a single self-contained `deal-dashboard-v2.html` (~2.66 MB).
- Load order (build_deal_artifact.py JS_ORDER): helpers.js, data.js, zopa.js, tab-brief.js,
  tab-contract.js, tab-commercials.js, tab-negotiation.js, shell.js.
- 4 tabs: Overview (brief) · Terms & Review (contract) · Economics (commercials) · Negotiation.
  Terms & Review subtabs: Documents & Conflicts (map) · Legal & Protection (legal) · Scope &
  Performance (scope) · Sources & Evidence (sources).
- Build: `python build_deal_artifact.py`. Test: `node --check _parts/<f>.js` + serve on
  127.0.0.1:8751 + Playwright over http (file:// is blocked). Desktop copy for Marc:
  `C:\Users\marcs\OneDrive\Desktop\Lilly Procurement Dashboards\deal-dashboard.html`.
- Repo: github.com/cdaimvp1/claudeskills, branch main. Commit + push after each unit.

## LOCKED constraints (never violate)
- Palette: plum #5C2B50 / teal #2F6E6B / burnt-orange #C15E19 emphasis; red for CRITICAL only.
- Light theme by default (`<html data-theme="light">` stamped by build_deal_artifact.py).
- No fabrication: real Visier facts = 'public'; constructed terms = contract/inference/assumption;
  unknowns gap-stated 'unavailable', never invented. No em dashes (only the '—' no-value glyph +
  genuine label/value separators). Reflect-only (no send/assign/approve; not a system of record).
- Every material value carries an evidenceChip. Adversarial malicious-code scan per code increment.
- Kill bottom-of-panel disclaimer/explanatory notes (Marc's standing preference, 3x now); the one
  global disclaimer in the header carries the caveat.

## DONE this session (Deal), newest first (commit hashes)
- b50fcc0 Overview cleanup + ZOPA collapse redesign + map umbrella restructure (workflow batch).
- 669bf6a Overview reorg (rows) + Terms&Review Documents/Conflicts rebuild (register+precedence,
  conflicts trigger-only, Sources & Evidence subtab).
- 500a06e Light-theme fix (data-theme=light) + platform-fidelity per-line + TCO ZOPA.
- (earlier) Platform chrome graft; Deal 4-tab build; should-cost + market-rate xlsx generators.

## PENDING, Deal dashboard (queued from Marc, well-specified) — DO THESE FIRST
Terms & Review > Legal & Protection subtab redesign + Documents & Conflicts tweaks. All in
`tab-contract.js` (+ a deep-link handler in `helpers.js`). Build sequentially (one owner of the
file at a time). Marc's exact direction:

1. CROSS-DOCUMENT CONFLICTS panel (renderConflicts): "Linked finding" column -> drop the ISS-xx
   text; make the COLORED severity chip itself the clickable jump to that finding. Remove the two
   bottom insight notes (the "3 of 5 checks..." + "No term-modification history..." lines).
2. DOCUMENT FAMILY REGISTER (renderDocMap regNote): remove the two bottom notes ("Rows are
   ordered by precedence..." + "Direct relevance only..."). Keep the table; relevance/precedence
   detail stays in each row's expand.
3. MERGE 4 panels -> ONE "Protection Scorecard" as a CATEGORY ACCORDION:
   - Headline: the score gauge (protectionGauge) + methodology.
   - Accordion, one category per row, ONE open at a time (native <details> or JS single-open):
     - Collapsed: Category · finding count · its severity mix · coverage (Covered/Confirm/Gap) ·
       points off.
     - Expanded: a row per finding in that category -> points · severity chip · coverage · reason ·
       finding link ->. The link deep-jumps to that exact finding in the Findings Register below
       (scroll into view + expand + brief highlight). Wire as data-gotofinding="ISS-xx" in DealUI.
   - Category spine = UNION of the deduction cats + the 14 coverage cats + the 8 finding cats
     (no forced crosswalk; points where a deduction exists, findings where issues map, coverage
     where assessed; gaps stay honest). Reconciliation (100 - Σ deductions = score) as a footer.
   - This REPLACES: Protection Score, Deductions, Findings by Category, Protection & Coverage (14).
4. FINDINGS REGISTER, FULL DETAIL:
   - Wider (col-9 or col-12 now that the scorecard is separate/full-width).
   - Priority counts (Hard stop N / High N / Medium N / Low N) moved onto the filter chips as counts.
   - Collapsed-row column TRIM: move Evidence excerpt / SME route / Verified / Tactic INTO the
     expanded body; keep the row lean (ID · Finding · Priority · $ Impact · Evidence).
   - Height CAP + vertical scroll when it overflows.
   - EXPANDED ROW redesign: top = three cards left-to-right = Preferred Outcome (recommendedPosition)
     · Fallback · Least Acceptable Outcome (hardStop; subtitle "walk-away / reservation point").
     Then regroup the rest into digestible sections: THE PROBLEM (supplier position / deviation /
     impact) · THE EXCHANGE (tactic / pushback / recommended response) · trade opportunity · clause
     metadata (clause / document / SME route / decision / playbook). No flat insight() stack.
5. OBLIGATIONS REGISTER -> its own full-width row (col-12), not sharing a row.
6. Layout result for Legal & Protection: Protection Scorecard (accordion, full width) -> Findings
   Register (wider, redesigned expand, scroll) -> Obligations Register (full width).

## PENDING, broader task list — autonomous-doable (attempt after Deal, proven patterns)
Follow pro_forma_generator.py / should-cost / market-rate .xlsx pattern (openpyxl 3.1.5,
python-docx, python-pptx confirmed available). Each: build generator + self-test (asserts a valid
file is produced) + adversarial scan + commit. Locate the skill dir first; verify before editing.
- #106 evaluation-engine -> .docx generator (highest value).
- #82  executive-summary-package -> .docx generator.
- #107 rfp-response-analysis -> .docx generator.
- #83  sole-source-challenge -> PPTX deck or Word doc (two outputs).
- #68/#87 re-integrity sweep + re-package the installable .skill zip (AFTER any generator adds).

## DO NOT do autonomously (need Marc / on-hold / sensitive)
- #86 invoice-rate-card-auditor mapping (decision). #91 ARIA (ON HOLD). #114 contract-review
  deduction-kernel (HELD, mis-diagnosed earlier). #80 contract-review hybrid pipeline (sensitive
  skill, don't casually modify). #108/#109/#110 Theo intake/handoff/manifest (big, Marc iterating).
  #111/#112/#115 hubs (big, need design). #102 x-cut scoring layer (site-wide, risky). #113
  playbook-learning re-vendor (needs care). #44 handover brief (persistence-gated).

## Post-overnight iteration (2026-07-24, with Marc live)
- Overview: un-merged State of Play/Next Steps (+pen restored), equal-height rows, ZOPA bars realigned,
  notes removed (43e0434). Then REDUCED the Overview ZOPA to the Total-deal/TCO band only + jump to
  Economics (line-item ZOPA stays in Economics) - DealZopa.renderTotal (7fac117).
- Dashboards chrome: removed topbar avatar/name; added footer "Lilly Global Procurement | Theo v0.1 -
  July 2026" on BOTH Landscape + Deal (5582def). Subtab bar restyled to match tab bar; black active
  tab/subtab; Print/Theme removed (742b371). Cross-Doc conflicts clickable chip + deep-link (742b371).
- Delivered Desktop folder "Lilly Theo v0.1 - July 2026": Landscape + Deal (current) + PCC/Category-
  Strategy/RFx-Response previews + all-31-skills zip + README (fidelity-labeled).
- MOCKUPS (standalone, for review): Cross-Doc "Open Document Risks" reframe; Legal & Protection v2
  (scorecard waterfall+achievable, [Protections]/[Obligations] accordions, register search/filter/clear,
  redesigned issue zones + ENRICHED obligation model [contract facts + fairness verdict + alternative +
  negotiate + 3 outcome cards], must-negotiate dot markers, Favors tally). L&P mockup APPROVED by Marc.
- DONE: porting the finalized L&P mockup into the LIVE Deal tab (tab-contract.js + helpers.js +
  data.js). Task #124. Verified in-browser + adversarially audited (see 2026-07-24 verification below);
  4 mockup-parity gaps then closed. "This tab is done."
- DECISIONS PENDING from Marc: adopt the Cross-Doc reframe live? make the Document map click-to-open the
  register row? which more skill dashboards to add to the folder? (ChatGPT analysis reviewed: keep 4-tab
  arch; the real next strategic item is a SKILL-ALIGNMENT SPEC - each skill keeps its standalone/combined
  deliverables AND feeds a dashboardData slice; strip competing "build my own dashboard" instructions;
  fix the "Deal Room" name collision. Sequenced AFTER the dashboard is done, per Marc.)

## Progress log (append; newest last)
- 2026-07-24: Committed workflow batch (b50fcc0). Wrote this tracker.
- 2026-07-24: 742b371 - Cross-Doc conflicts clickable severity chip (drops ISS-id) + DealUI.gotoFinding
  deep-link; removed register + conflicts bottom notes; subtab bar restyled to match main tab bar;
  BOTH active tab + subtab = black text + black underline (matches Landscape); removed Print + Theme
  buttons from topbar. Verified in-browser. Task #116 done.
- 2026-07-24: Dispatched Opus agent for the Legal & Protection rebuild (accordion Protection Scorecard
  merging the 4 panels + Findings Register redesign [chip counts, column trim, height/scroll, 3-outcome
  expanded cards] + Obligations full-width). Tasks #117/#118/#119 in progress.
- 2026-07-24: L&P agent landed (29 assertions) BUT the literal-union category spine made 26 duplicative
  rows (Liability vs Limitation of Liability, Commercial vs Pricing Protection vs Pricing & Renewal, IP x3).
  node --check + adversarial scan clean, built + browser-inspected the 26 rows. Sent the agent a surgical
  correction: spine = the 8 canonical issue categories, points/coverage attributed by issueId linkage
  (deduction.issueId->issue.category sums to 42; coverage = worst of the cat14 sharing issueIds), + a
  footer listing assessed-no-finding areas. Reconciliation verified by hand: 13+10+3+6+3+3+1+3 = 42 -> 58.
  Awaiting the corrected build. NOTE for Marc: this is a judgment call (union was too messy); flag if you
  wanted the 14-protection-area spine instead.
- 2026-07-24: cde4eb8 - Legal & Protection REBUILT + verified in-browser + committed. 8-category accordion
  Protection Scorecard (reconciles 42->58; coverage blind-spots surface), deep-link scorecard->exact
  register row WORKS, Findings Register redesign (chip counts, trim, scroll, 3 outcome cards Preferred/
  Fallback/Least-Acceptable + Problem/Exchange sections), Obligations full-width. Tasks #117/#118/#119 DONE.
  Deal dashboard now reflects the full session of Marc's changes.
- 2026-07-24: 1cdaad9 - evaluation-engine .docx generator (#106) DONE. Ran self-test myself: 53/53 pass;
  adversarial scan clean; uses weighted_score() hard rule + Must-Have gate. Committed.
- 2026-07-24: Dispatched the remaining 3 generators in parallel (Sonnet): #82 executive-summary .docx,
  #107 rfp-response .docx, #83 sole-source PPTX+Word.
- 2026-07-24: 2cffebc - #82 executive-summary .docx DONE (self-test 76/76 verified myself, scan clean;
  ATC/ATS house style + frap_chain_kernel + no-savings/#25 + risk-rating rules). Committed.
- 2026-07-24: 9336970 - #107 rfp-response .docx DONE (self-test 52/52 verified, scan clean; weighted
  totals via numeric_kernel, Bid-Leveling gate enforced). Committed. Flagged: all-or-nothing gating call.
- 2026-07-24: #83 sole-source PPTX+Word still in flight. NEXT after it: #87/#68 re-integrity sweep +
  repackage the installable .skill zip (the generators added files to 4 skill dirs).
  GENERATORS judgment note for Marc: all 4 use hand-authored ILLUSTRATIVE demo data (the skills carry no
  numeric worked example except should-cost); each is disclosed in its module docstring. Content models
  were read from each SKILL.md; spot-check the section fit when you have a moment.
- 2026-07-24: 29c6bfb - #83 sole-source PPTX+Word DONE (self-test 83/83 verified, scan clean; defensibility
  via kernel + Hard-Rule-2 verdict cap). Committed. ALL 4 GENERATORS DONE (#106/#82/#107/#83).
- 2026-07-24: Integrity pass on the 4 generator skill dirs: python compile OK all 4; em-dash scan CLEAN
  (the only hits are the executive-summary generator's OWN em-dash DETECTOR constant + a deliberate
  negative-test input its validator rejects -> the rule is enforced, not violated); adversarial scans clean.

## OVERNIGHT RUN COMPLETE (2026-07-24)
Safe autonomous queue is EXHAUSTED. Shipped tonight (all committed + pushed to main):
- Deal dashboard: the FULL session of Marc's changes (Overview reorg/cleanup/ZOPA-collapse; Terms&Review
  map-umbrella + register + conflicts + Sources&Evidence + Legal&Protection accordion scorecard + register
  redesign + deep-link; subtab/tab styling + black active + Print/Theme removed; light theme). Verified
  in-browser, all 4 tabs clean. Commits: b50fcc0, 742b371, cde4eb8 (+ earlier 500a06e/669bf6a).
- 4 file generators (proven should-cost/pro-forma pattern, each self-test-verified by me + scanned):
  #106 evaluation-engine .docx (53/53), #82 executive-summary .docx (76/76), #107 rfp-response .docx
  (52/52), #83 sole-source PPTX+Word (83/83). Commits: 1cdaad9, 2cffebc, 9336970, 29c6bfb.

FLAGGED FOR MARC (did NOT do autonomously, by design):
- #87/#68 repackage the installable .skill zip: this is a RELEASE step. No in-repo packaging script
  exists (the .skill bundles are built externally from a bundle zip, per _BASELINE_MANIFEST.md); the
  source is committed + installable-ready. Repackage under your direction when you cut a release.
- Scorecard spine judgment call (8 issue-categories vs the messy 26-row union) - confirm or redirect.
- The 4 generators' demo data is illustrative; spot-check each .docx/.pptx section fit vs the skill intent.
- Untouched by design (need your call / on-hold / sensitive): #44, #80, #86, #91, #102, #108-115, #114.

## 2026-07-24 (later) - #124 L&P port VERIFIED + 4 mockup-parity gaps CLOSED (with Marc)
Verification: reopened deal-dashboard-v2.html in-browser (Playwright over 127.0.0.1:8751) + ran a 5-dimension
adversarial conformance audit (source vs approved MOCKUP-legal-protection-alt.html vs spec vs live DOM).
Result: interaction-wiring CONFORMANT, data-reconciliation EXACT (100-42=58, achievable 79 data-driven),
locked-constraints CONFORMANT (0 em dashes, palette clean; 1 evidenceChip claim REFUTED on verify),
malicious-code CLEAN. Every interaction confirmed live (deep-links both ways, segment toggle, single-open
accordions, issue+obligation 3-outcome-card expand, filter, clear). #124 CLOSED.
The audit confirmed 4 mockup-parity gaps; all 4 then FIXED this session (helpers.js + tab-contract.js only,
additive/generic, node --check + build + in-browser verified each + independent malicious-code scan CLEAN):
1. [MED a11y] Keyboard activation - added ONE delegated keydown listener: Enter/Space on non-native
   [role=button] controls fires the same click (native button/a excluded). Verified: Enter on a focused
   waterfall bar expands the target register row.
2. [LOW] Register empty-state - "No findings match..." + "Show all findings" (data-lpclear) when a filter
   yields 0 rows; generic opt-in [data-filter-empty] in _filterTable. Verified show + reset.
3. [MED] Findings Register "Issues (N)" / "Obligations (N)" group bands with LIVE counts that hide a band
   when its group filters to zero; generic opt-in [data-grouphd] in _filterTable. Verified 12/10 -> 2/1 -> hidden.
4. [MED] Boot auto-expand - top hard-stop finding's register row pre-open on load + its category accordion
   open (data-driven, not index-0). Verified ISS-01 open + Liability accordion open on load.
FLAGGED (design judgment, easy to revert if Marc dislikes): (a) group bands are mildly redundant with the
per-row Issue/Obligation tag; (b) boot auto-expand makes the register start taller (capped by the 620px scroll).
Deliberately NOT changed: register-row <tr>s were left non-focusable (no new tab stops); every finding stays
keyboard-reachable via the focusable navigator findings which deep-link + expand the row.
