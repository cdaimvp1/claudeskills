# G8 and G9: the canonical runtime smoke test, and what it found

**2026-07-29.** `_audit/skill_smoke_test.py`. Run with `python _audit/skill_smoke_test.py`.

`OPTIMIZATION-PRINCIPLES.md`: *"Each skill needs a runtime smoke test that proves it
executes, not a static read that proves it parses."*

---

## G8: the design decision that makes it a runtime test

**Every assertion runs against a copy of the skill in an otherwise empty temporary
directory.** No siblings, no suite root, no repo.

That is the whole point. Testing in place silently passes code that only works because a
sibling happened to be one directory up, which is exactly the failure a Desktop install
produces and a repo checkout hides. The `_audit` scripts written earlier this session are
text audits; this one executes.

## The eight assertions

| | Assertion |
|---|---|
| **A1** | `SKILL.md` exists, is non-empty, is valid UTF-8 |
| **A2** | every `.py` parses |
| **A3** | every `.py` **imports** in a flat single-folder install |
| **A4** | every `.py` shipping a self-test **passes it**, in isolation |
| **A5** | no unguarded third-party import |
| **A6** | no relative or package-style import |
| **A7** | every path the skill references **relative to itself** resolves |
| **A8** | every cross-skill path either resolves **or** has a stated inline fallback |

**A7 and A8 are separated deliberately.** A7 is unambiguously the skill's own bug. A8 is a
suite-composition question, and on Desktop a cross-skill path is *expected* not to resolve,
so what is asserted is the presence of a fallback, not the path. Conflating them would
either excuse real breakage or condemn correct design.

`SELFTEST_EXEMPT` and `PLATFORM_TOOLS` are both documented liability lists. Every entry is
something this test does **not** cover, with a reason.

## Two false positives I introduced and fixed before trusting the results

Recorded because a smoke test that cries wolf gets ignored, and then stops catching real
failures.

1. **`unpack.py` flagged as a broken self-reference.** It is a *platform* tool from the
   docx skill, supposed to be absent from a skill folder. Fixed with a `PLATFORM_TOOLS`
   allowlist.
2. **`analysis_summary.docx`, `pro_forma_model.xlsx` flagged as missing.** Those are
   artifacts the skill **produces**. Asserting a skill ships its own output is backwards.
   A7 now checks only `.py`, `.js` and `.css`, the files a skill must actually carry.

---

# G9: the matrix, and the one real breakage

**32 skills. 4 failed assertions on the first run, 3 after the fix.**

## FIXED: `deal-tab` crashed on import, inside an installable skill

The only genuine runtime failure, and a text audit could not have found it.

`deal-tab-1c344a/dashboard/_platform_build/apply_deal_chrome.py` executed file I/O **at
module level**, against:

```python
DEAL = r'C:\Users\marcs\Downloads\...\_deal_build\deal-dashboard.html'
```

So merely **importing** the file raised `FileNotFoundError`. Three problems at once: a
hardcoded absolute path, a path containing a specific user's name, and a path the file's
own header says "no longer exists".

### The fix respects a documented decision rather than reversing it

`_deal_build/SOURCE-OF-TRUTH.md:50` records: *"`apply_deal_chrome.py` (both copies) is a
superseded one-off ... **Left in place, headed as superseded, not deleted.**"*

Deleting it would have been the obvious fix and would have reversed that decision. Instead
the execution moved behind an `if __name__ == '__main__':` guard. Nothing was removed. The
file stays exactly as documented, and is now inert on import, which is what "kept for
reference" already meant. Both copies fixed, both import cleanly, `deal-tab` now passes all
eight.

## STILL OPEN: three A7 failures, all documentation pointers

None break a run. All three are prose citing files that live in a different skill or build
tree.

| Skill | Points at |
|---|---|
| `deal-room-1c344a` | `_parts/data.js`, `_parts/style.css`, `dashboard/build_deal_artifact.py` (deal-tab's files) |
| `lilly-brand-assets-1c344a` | `numeric_kernel.py`, `timeline_engine.py`, `frap_chain_kernel.py`, `assets/theo-color.css` |
| `rfp-engine-1c344a` | `rfx-hub-1c344a/dashboard/assets/pv/pv-04-domain-data.js` |

Same family as the G1-G7 headline (26 skills pointing at eight brand-assets files that do
not exist), and the same disposition: **prune the pointers, do not create the files.**
Belongs with `B7`.

`lilly-brand-assets` is the notable one: it documents three kernels it does not ship.
`numeric_kernel.py` genuinely lives in `lilly-procurement-kernels-1c344a` and is vendored
into consumers, so the reference is describing something real from the wrong place.

## Reported, NOT fixed: a second hardcoded local path

`deal-tab-1c344a/dashboard/_platform_build/build_my_work.py` hardcodes two absolute paths
into a **different project entirely**:

```python
PLATFORM = r"C:\Users\marcs\OneDrive\Desktop\lilly IT intake and orchestration tool"
```

It does **not** crash on import, so no assertion fails and the smoke test stays green. It
also cannot work on any machine but one.

Not fixed deliberately: it is a build-tree script and it may be wanted for the My Work
dashboard (task A7 in the dashboard workstream, currently blocked on Marc). Deleting or
rewriting a script that pending work may depend on would be overstepping a read-and-report
boundary. **Flagged for Marc**; the honest disposition is that `_platform_build/` is a build
tree that should probably not ship inside an installable skill at all, which is a packaging
question (`K1`) rather than a code fix.

## Scan result worth recording

A recursive scan of every `.py` in every skill for hardcoded local paths returns exactly
**two files, both in `deal-tab-1c344a/dashboard/_platform_build/`**. The rest of the suite
is clean. That is a better result than the two findings above suggest in isolation.

---

## Suite state after G9

```
32 skills
A1 SKILL.md present ........................ 32/32
A2 .py parse ............................... 32/32
A3 .py import in a flat install ............ 32/32   (was 31/32)
A4 shipped self-tests pass ................. 32/32
A5 no unguarded third-party import ......... 32/32
A6 no relative/package import .............. 32/32
A7 self-referencing paths resolve .......... 29/32
A8 cross-skill paths have a fallback ....... 32/32
```

**Every skill imports and every shipped self-test passes in a flat, single-folder,
sibling-free install.** That is the Desktop condition, and it is the assertion that matters
most.

## Note for whoever runs this next

`lilly-procurement-kernels-1c344a` has **no `SKILL.md`**, so it is skipped by the default
sweep and only tested when named explicitly. That may be correct: every consumer vendors a
verbatim copy of the kernel, so it may not need to install as a skill at all. But it is
either a deliberate design choice or an oversight, and nothing in the repo says which.
Worth a ruling before packaging (`K1`).
