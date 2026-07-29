# Hub implementation record: A1, A3, A4 (2026-07-29)

Scope: give the two homeless LOCKED dashboards (RFx, Category Strategy) a skill home, on
the deal-tab-1c344a pattern. Originals in `_rfx_build/` and `_category_build/` left in
place, untouched, per instruction (a prior delete attempt failed on a held file handle).

## A1: `rfx-hub-1c344a` created

New skill directory `rfx-hub-1c344a/` with `SKILL.md` and `dashboard/` carrying the full
RFx build tree copied from `_rfx_build/` (builder + `assets/`). Four stray editor-backup
files (`pv-09-rfx.js.bak`, `.bak2`, `.bak3`, `.bak4`) were dropped on copy; they were not
referenced by the builder.

**Finding: `_rfx_build/build_dashboard_rfx.py` did NOT have the repo-root problem the task
described for category-strategy.** It never imports `_platform_build`. It carries its own
`extract_chrome()` that reads directly from its own vendored `assets/app-shell.js` and
`assets/theo-brand.js`. The three remaining hits for `_platform_build` in the file are
prose comments only (design-rationale references to the sibling Deal/Landscape builds),
not code. So A1's job was pure rehoming plus a SKILL.md; no chrome-vendoring fix was
needed for RFx.

## A3 + A4: `category-strategy-1c344a/dashboard/` created, chrome vendored

Moved (copied) `_category_build/build_dashboard_category.py`, `assets/pv/`,
`assets/seed/`, and `CATEGORY-STRATEGY-BUILD-SPEC.md` into
`category-strategy-1c344a/dashboard/`.

Confirmed the blocker as described: `build_dashboard_category.py:20-25` did

    REPO = os.path.dirname(BUILD_DIR)
    PLATFORM = os.path.join(REPO, '_platform_build')
    sys.path.insert(0, PLATFORM)
    import build_dashboard as bd

reaching a repo-root directory that would not exist in an installed skill.

Fix (A4): vendored `_platform_build/build_dashboard.py` plus the five asset files
`extract_chrome()` actually touches (`app-shell.css`, `app-shell.js`, `fonts-inline.css`,
`theo-color.css`, `theo-dino-mark.png`, `theo-brand.js` — six files, `theo-brand.js` was
missed on the first pass and added after the first build attempt raised
`FileNotFoundError`) into `category-strategy-1c344a/dashboard/_platform_build/`, then
re-pointed the import:

    PLATFORM = os.path.join(BUILD_DIR, '_platform_build')   # was: os.path.join(REPO, ...)

This mirrors deal-tab-1c344a/dashboard/_platform_build/ exactly, except narrower: only the
files `extract_chrome()`/`read_raw()`/`data_uri()` reach were vendored (deal-tab vendored
more, including `build_my_work.py` and the full `pv/` asset set it doesn't need for this
purpose; category-strategy's copy is a minimal vendor of the same source).

## Verification

**Self-containment (the point of the task).** Both hubs were copied — hub directory
only, nothing else — to a clean scratch path with no sibling repo present, and built from
there:

- `rfx-hub-1c344a`: clean-copy build succeeded, 3,657,669 bytes, SHA-256 identical to the
  original `_rfx_build/rfx-dashboard.html`.
- `category-strategy-1c344a/dashboard`: clean-copy build succeeded (both the real-data and
  `--demo` build), 2,826,062 bytes / 2,860,742 bytes respectively, SHA-256 identical to
  `_category_build/category-strategy-dashboard.html` and
  `_category_build/category-strategy-dashboard-DEMO.html`.

**Output comparison: honest result — exact match, not approximate.** Both new hubs
produce byte-for-byte identical output to the known-good locked artifacts. No visual or
structural difference of any kind.

**Grep sweep for escaping references**, run against the final tree (post-cleanup of
`__pycache__` and stray test-build HTML):

    grep -rn "_platform_build\|os.path.dirname(BUILD_DIR)" rfx-hub-1c344a --include=*.py
    grep -rn "os.path.dirname(BUILD_DIR)" category-strategy-1c344a --include=*.py

rfx-hub: three hits, all inside docstring/comment prose (design-rationale mentions of the
sibling builds), zero in executable code — confirmed by the clean-copy build succeeding.
category-strategy: zero hits of the escaping pattern `os.path.dirname(BUILD_DIR)`
(the one place that pattern used to appear, `REPO = os.path.dirname(BUILD_DIR)`, is gone).

## What remains owed

- **B1** (category-strategy SKILL.md cleanup): explicitly NOT done here, per instruction.
  Added an ADD-only note in `category-strategy-1c344a/SKILL.md` Phase 6, ahead of the JSX
  spec, pointing at the new deterministic build and flagging that the JSX
  clone-and-swap instructions plus the 11-tab canonical structure below it are the
  retired pattern and conflict with the locked 5-tab structure (`VERSION-LOCK-2026-07-29.md`).
  Nothing was deleted from the existing spec.
- **A2** (RFx-to-Deal handoff emitter): not built. Depends on A1, which now exists; noted
  as owed in `rfx-hub-1c344a/SKILL.md`.
- **A5/A7** (Deep Dive and My Work dashboards): not built at all yet, so their hubs
  cannot exist. Out of this task's scope.
- **A11** (lock all five hubs): the malicious-code sweep and in-browser 0-console-error
  check have not been re-run against either rehomed hub; only the byte-identity build
  proof was done in this pass. Both dashboards were already locked before the rehome;
  this task's verification is that the rehome did not change the artifact, not a fresh
  lock review.
- Originals `_rfx_build/` and `_category_build/` were left in place, unmodified, as
  instructed.
