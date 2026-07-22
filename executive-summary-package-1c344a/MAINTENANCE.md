# MAINTENANCE.md -- frap_chain_kernel.py

## What this file owns

`frap_chain_kernel.py` is a standalone, stdlib-only Python decision kernel
that reproduces ONLY the FRAP ATC/ATS approval-chain construction logic
documented in `SKILL.md`'s "Lilly FRAP Approval Threshold Schedules"
section (Skill Version 2.2, Jun 2026):

- The two threshold tables (ATC grade/threshold table; ATS grade/threshold
  table, including the CEO operating-vs-capital split).
- "THE CANONICAL CHAIN-CONSTRUCTION RULE": find the ceiling grade (lowest
  grade whose threshold >= deal value), find the start grade (next grade
  up from the user for ATC; the business owner's own grade for ATS), and
  build the ordered chain from start to ceiling.
- The mandatory self-verification arithmetic echo required before any
  chain is written into a document.
- The hard "never guess" gates: missing deal value, an unrecognized grade,
  and the required CEO $200M-operating / $1B-capital disambiguation when a
  deal falls in that band.

It does **not** own, and makes no attempt to reproduce, anything about
document generation, formatting, DOCX/MD output, narrative content
extraction, or the rest of SKILL.md's workflow. Those stay entirely inside
the skill itself. If SKILL.md's document-format rules change, this file
does not need to change.

## Live-fetch-first, vendored-fallback (added 2026-07-21, per user instruction)

**The vendored `ATC_TABLE` / `ATS_TABLE_OPERATING` / `ATS_TABLE_CAPITAL` tables in
this file are a snapshot, not the source of truth.** The user confirmed a live
canonical FRAP threshold page exists at `FRAP_TABLE_SOURCE_URL`
(`https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/SitePages/FRAP---Procurement-Transactions.aspx`),
that stale/superseded FRAP tables exist elsewhere on SharePoint (so a general
search is unsafe - only this exact page is the intended target), and that the
true policy document lives in Veeva Vault, which Claude Desktop cannot reach (this
SharePoint page is the best available live proxy, not a guaranteed match).

`Facts.table_source` is a required field with no default: `"live SharePoint"` or
`"vendored snapshot"`. The calling skill (executive-summary-package's SKILL.md - see
its "Kernel wiring: live-fetch-first, vendored-fallback" section, wired 2026-07-22) is
responsible for:
1. Attempting to fetch `FRAP_TABLE_SOURCE_URL` via the M365 connector.
2. On success: parsing the live page into the same `(grade, threshold)` tuple-list
   shape as the vendored tables, and calling `compute_chain()` with
   `table_source="live SharePoint"` plus `live_atc_table` /
   `live_ats_table_operating` / `live_ats_table_capital` populated.
3. On failure (connector unavailable, page unreachable, or the page cannot be
   parsed into a recognizable table): calling `compute_chain()` with
   `table_source="vendored snapshot"` and no live tables, and disclosing to the
   user that the answer uses a locally-shipped snapshot, not a table confirmed
   current against the live page.

The kernel itself refuses (returns a `needs_review=True` Decision) rather than
guessing in two cases: `table_source` omitted entirely, and `table_source="live
SharePoint"` claimed without the live tables actually supplied - the latter exists
specifically so a bug in the calling skill can never silently answer from the
vendored table while claiming a live source.

**When this section needs attention:** if the FRAP page's URL, structure, or the
underlying SharePoint site changes; if it becomes possible to fetch and parse the
page more directly (e.g., a documented API) rather than relying on general
page-reading; or if Lilly ever exposes the underlying Veeva Vault document itself
to the M365 connector, in which case this whole live-fetch layer should point at
the vault document instead of the SharePoint proxy.

## When to update this file

Update `frap_chain_kernel.py` whenever any of the following change in
`SKILL.md`:

1. **The FRAP threshold numbers themselves** (the "FRAP Thresholds
   Version" line and the two tables under "## INLINED:
   references/frap-thresholds.md"). This is the single most likely thing
   to change over time, since Lilly's internal FRAP policy is reviewed
   periodically and SKILL.md itself says: "Update the tables here when
   FRAP changes; do not hardcode thresholds in any other location" -- the
   same discipline applies here. When it changes:
   - Update `ATC_TABLE`, `ATS_TABLE_OPERATING`, and `ATS_TABLE_CAPITAL` in
     this file to match the new numbers exactly (do not round or
     approximate).
   - Update `CEO_BAND_LOW` / `CEO_BAND_HIGH` if the CEO operating/capital
     split values change.
   - Re-run the self-test. If a worked example in SKILL.md is also
     updated to new numbers, update the corresponding assertions in
     `if __name__ == "__main__":` to match the new source quote, and keep
     the literal quote in the test's print statement in sync with
     SKILL.md's actual wording.
   - Grade names can also change (e.g. a new intermediate grade added, an
     existing one renamed/merged). Any renamed grade must be updated
     everywhere it's hardcoded: the three tables, the two worked-example
     tests, and the docstrings/comments that quote SKILL.md verbatim.

2. **The chain-construction algorithm** ("THE CANONICAL CHAIN-CONSTRUCTION
   RULE" section of SKILL.md). If the rule for finding the ceiling, or the
   rule for finding the start grade for ATC/ATS, changes, update
   `compute_chain()` accordingly and update the docstring quotes that cite
   the rule.

3. **The CEO operating/capital disambiguation rule.** If Lilly changes
   which deals require the operating-vs-capital tap (currently: required
   only when `$200M < deal_value <= $1B`, per SKILL.md's "CEO threshold
   disambiguation (REQUIRED)" paragraph), update the gate condition around
   `CEO_BAND_LOW` / `CEO_BAND_HIGH` in `compute_chain()`.

4. **Any new "never default this" governance field.** SKILL.md's v2.2
   changelog removed a hardcoded "Financial Risk Rating: Acceptable"
   default because an unverified risk rating on an approval document is a
   compliance hazard. If SKILL.md flags any other field as "never default,
   always NEEDS_INPUT," and that field becomes part of the chain
   computation (it currently is not -- Financial Risk Rating plays no role
   in `compute_chain()`), add an equivalent hard gate here rather than a
   silent default.

## How to update

1. Read the current `SKILL.md` "Lilly FRAP Approval Threshold Schedules"
   section and its inlined `references/frap-thresholds.md` section in
   full; do not skim.
2. Diff the tables/rule text against what's quoted in this file's
   docstrings and comments. Every quoted string in
   `frap_chain_kernel.py` should be traceable to an exact quote in
   SKILL.md; if SKILL.md's wording changed even cosmetically, refresh the
   quote so the two stay in sync (a stale quote is misleading even if the
   underlying number didn't move).
3. Update the relevant table(s) and/or gate logic.
4. Update or add worked-example tests in `if __name__ == "__main__":` so
   every test still traces to an exact quoted example in SKILL.md. Do not
   invent a new test value that isn't backed by a quote; if no worked
   example exists for a new scenario, note that explicitly instead of
   fabricating one.
5. Run the file directly (`python frap_chain_kernel.py`) and confirm the
   PASS/FAIL summary shows 0 failures before committing.

## Known limitations

- **No fallback for "start grade above the top of the table."** SKILL.md
  defines the ATC start as "the next grade level UP from the user's own
  grade" but never addresses what happens if the user's own grade is
  already the top grade (CFO) -- there is no grade above CFO to move up
  to. Neither worked example in SKILL.md exercises this edge (grades used
  are P4/M2 and P5/M3, both well below the top). This kernel treats that
  case as a hard gate (refuse, needs_review=True) rather than guessing a
  fallback. If SKILL.md is ever updated to specify explicit behavior here,
  update `compute_chain()`'s ATC branch accordingly.

- **"Start at or above ceiling" collapse behavior is an interpretation,
  not a directly quoted worked example.** SKILL.md says: "If the start
  grade is already at or above the ceiling..., the chain is just the
  start grade through the ceiling, which may be a single level." Read
  completely literally this is self-contradictory once the start index is
  higher than the ceiling index (there's no ascending "through" range from
  a higher index down to a lower one). This kernel resolves the
  contradiction using the clarifying clause "which may be a single level":
  when `start_idx >= ceiling_idx`, the chain collapses to the single
  start grade. Neither of the two worked examples in SKILL.md exercises
  this branch, so this behavior is not independently verified against a
  quoted example -- it is this kernel's best-effort reading of the
  clarifying clause. If Lilly ever produces a worked example that
  exercises this branch, add it as a test and confirm the interpretation
  against it.

- **Scope is deliberately narrow.** This kernel does not model: deal-value
  disambiguation among multiple candidate figures (TCO vs total contract
  value vs amendment delta -- SKILL.md asks the user to pick, which is a
  human-facing tappable-picker step, not a computable rule); document
  generation; the DOCX/MD formatting rules; category calibration; or any
  of the suite-wide GLOBAL OPERATING RULES. Those remain the
  responsibility of the skill itself, not this kernel. `Facts.deal_value`
  is assumed to already be the single resolved figure.

- **`is_capital_spend` is only consulted inside the $200M-$1B ATS band.**
  Outside that band the two ATS threshold columns are identical (per
  SKILL.md: "for any deal at or below $200M the two columns are
  identical"), so the flag is accepted but ignored elsewhere. If a future
  FRAP revision makes the capital/operating split matter at other
  thresholds too, the gate condition in `compute_chain()` needs to widen
  accordingly.

- **No persistence, no I/O of its own, no external dependencies.** This is a pure
  function over an in-memory `Facts` object; it does not perform the SharePoint
  fetch itself (see "Live-fetch-first, vendored-fallback" above), only consumes
  the result of one via `table_source` and the optional `live_*_table` fields. It
  can be unit tested and reasoned about without any environment dependency.
  Wiring the actual fetch attempt into a skill run is left to whatever harness
  calls it.
