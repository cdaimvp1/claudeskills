# START HERE — read this before doing anything in this repo

**For a fresh Claude session, on any machine.** Written 2026-07-30. This file exists so you
do not have to reconstruct the state by reading 4,000 lines of run log, and so you do not
re-open decisions that are closed.

**Read this whole file first. Then read nothing else until you know which task you are on.**

---

## 1. Prove the repo is intact before you touch it

```bash
python _audit/skill_smoke_test.py                       # expect: 33 skills, 0 failed assertions
python _audit/hub_selfcontainment.py                    # expect: 0 findings
python lilly-procurement-kernels-1c344a/kernel_manifest.py   # expect: no unexplained drift
python procurement-launcher-1c344a/theo_routing.py --check   # expect: PASS
python _audit/malicious_code_sweep.py                   # expect: SECRETS/BYPASS/OBFUSCATION/INJECTION all 0
```

If any of these fail on a clean checkout, **stop and report it**. Do not "fix" it by
changing the gate.

Package with `python _audit/package_skills.py`. Expect **31 packages** (33 skills minus 2
deliberately held back, see §3).

---

## 2. What this is

The Lilly procurement skills suite: 33 skills, each installable into Claude Desktop as
**one folder with no siblings and no repo root**. That constraint is not negotiable and is
enforced by `package_skills.py`, which extracts every package into an empty directory and
re-runs the smoke test there.

The architecture, arrived at over this programme and now settled:

> **Lens skills do the analysis and own a slice. Hubs own the render.**

Lens skills produce data with sources; hubs compose and display. No lens skill builds its
own dashboard.

---

## 3. LOCKED. Do not reverse any of these without Marc saying so explicitly

- **The five hub dashboards are DESIGN LOCKED** (tag `hubs-locked-2026-07-30`): Landscape,
  Deal, RFx, Category Strategy, plus Deep Dive and My Work built to the same standard. Do
  not change layout, colour or structure. Marc may reopen this; you may not.
- **`my-work-1c344a` and `theos-field-guide-1c344a` are HELD BACK from the package.** They
  build and pass; they are not ready, which is a different thing. See `HELD_BACK` in
  `_audit/ship_manifest.py`. **Do not re-add them** because they look missing.
- **The THEO launcher is a BACKUP surface**, not the front door. Conversational intake does
  the work. Do not add rows to `theo-widget.html` without Marc's approval — that mistake
  has already been made once.
- **Category Strategy is 5 tabs.** Any 11-tab wording is historical changelog.
- **One `issues[]` array. There is no `scopeIssues[]`** and there should not be.
- **`lilly-brand-assets` JSX blocks are the shared component library.** Never "clean them
  up".
- **Nothing is deleted from the repo** until the new package proves itself in real use.
  Superseded artifacts are registered as strippable-at-packaging and pinned by sha256.

---

## 4. How Marc works. Follow this.

- **Anything needing his decision: state the issue, the pros and cons, your recommendation,
  then ASK. Do not proceed.**
- Accuracy before cost. Multi-pass designs were deliberate; do not trim passes for speed.
- No em dashes, in prose or code.
- Never reverse a documented decision to make something work now.
- Malicious-code review is mandatory per increment.
- Enterprise-correct by default; never offer an MVP shortcut.
- Skills must run on Claude Desktop on the user's own model. Stdlib-only where possible.

---

## 5. THE IMMEDIATE NEXT TASK: name the six internal data sources

**This is why the session is moving to a machine with data access.**

The panel contracts (`*/panel_sources.json`) declare, for every dashboard panel, what data
it needs and **where that data comes from**, so retrieval goes to the right system instead
of doing a blind web search. 135 panels, 191 fields.

**78 of those rows point at six internal systems that were named by INFERENCE and must be
confirmed.** A confidently wrong internal system name is worse than an honest blank, so
they are flagged rather than asserted.

| System (my inferred name) | Rows | Where used | Candidate, NOT applied |
|---|---|---|---|
| **Lilly spend data** | 36 | Category 32, RFx 2, Deal 1, Landscape 1 | possibly **SHARP, reached via Fabric** — the repo contains literal `SHARP_Finance view[...]` and `SHARP_Procurement view[...]` references, and "Spend data unavailable this session: Fabric was not reachable" |
| **SME review outcome** | 16 | RFx 8, Landscape 4, Deal 3, Category 1 | is there a system, or is it the SME's written response? |
| **Contract repository** | 13 | Category 11, Deal 1, Landscape 1 | unknown. CLM? ATC/ATS look like approval chains, not storage |
| **Vendor master** | 8 | Category 6, Landscape 2 | possibly "the supplier master" — the repo phrase is "SAP, Ariba, SHARP, or the supplier master", which reads as four distinct things |
| **PO and invoice data** | 3 | Category 3 | SHARP too? Ariba? If SHARP, it merges into row 1 |
| **Business case funding confirmation** | 2 | RFx 2 | a system, or a person in Finance? |

**Two answers do most of the work: spend data (36 rows) and the contract repository (13).**

### How to apply an answer

In the relevant `*/panel_sources.json`, set the source's `name` to the real system, make
`how` specific enough that retrieval does not have to guess, and add
`"confirmed_by_owner": true`. Then:

```bash
python lilly-procurement-kernels-1c344a/panel_contract.py <skill>/panel_sources.json
```

It prints the retrieval plan and lists what still needs confirming.

**Also unresolvable, and correctly so:** 22 fields cannot be retrieved from anywhere —
Lilly's WACC, the negotiation stage, who holds the pen, *what Lilly intended* as opposed to
what the contract says, which suppliers are strategic, approvals obtained. Those are
decisions and records, not documents. They are marked `requires_input` and should stay that
way.

---

## 6. Everything else still open

| | What | Needs |
|---|---|---|
| **#24** | Lift or keep the hold on F1, the contract-review hybrid redesign | Marc |
| **#38** | Ship / no-ship review across the whole suite. **Do this LAST.** | Marc, after the build |
| — | 5 skills have no deterministic engine for an optional artifact. Re-filed as F-series work, not a sweep. Possibly not worth doing at all | folds into #38 |

Everything else in `_audit/UPGRADE-PLAN.md` is done. WS A, B, D, G, H, J and K are complete.

---

## 7. Where the detail lives

| File | What it holds |
|---|---|
| `_audit/OVERNIGHT-RUN-LOG.md` | The full narrative, newest at the bottom. Every finding, every decision, every correction. Long, but it is the record |
| `_audit/UPGRADE-PLAN.md` | The workstreams and their verify conditions |
| `_audit/A8-A9-PROPOSALS.md` | The Landscape design/colour analysis. A8 is closed by the lock; A9 is deferred |
| `VERSION-LOCK-2026-07-29.md` | The locked substantive dashboard decisions |
| `_audit/ship_manifest.py` | What ships, what is stripped, what is held back and why |

---

## 8. One recurring lesson, because it will bite you too

**Nine times in this programme, a pattern-based check has mis-reported by matching WORDING
instead of MECHANISM.** Four of those were mine, within a single day.

Examples: a regex for "which mode" fired on "which **model** to use"; a search for
hand-authored dashboards flagged the *prohibitions* against them; a detector for skills
lacking an engine globbed `build_*.py` and missed `*_engine.py`; a "0 external references"
check scanned markup while the page pulled four scripts at runtime.

**So: when a pattern search returns a count, read the hits before acting on them.** An
ABSENT result is a prompt to go and look, not a finding. This is the single most reliable
way to be wrong in this repo.
