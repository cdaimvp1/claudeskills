# H5: do citations resolve?

**2026-07-29.** Two parts, because I built the wrong tool first and the wrong tool turned
out to be worth keeping.

---

## What H5 actually asks for, and why it is BLOCKED

`UPGRADE-PLAN.md` H5: *"a resolve check on every EMITTED citation: URL fetched this run, or
snapshot hash matched, or explicitly labelled unverified."* Verified by seeding a dead URL:
*"the run must label it unverified, not cite it clean."*

**H5 is about the citations a skill puts in its DELIVERABLES**, chiefly external URLs and
SharePoint sources, not about internal file cross-references.

**`Depends on: H4`**, and H4 (move provenance from per-document to per-fact) is one of the
eight WS H items that were never triaged and sit behind a Marc decision. A per-citation
resolve state has nowhere to live until provenance is per-fact: today a document carries
one provenance record, so there is no field on which to record that *this particular URL*
was fetched, hash-matched, or unverified.

**So H5 proper cannot be built yet.** What follows is the unblocked groundwork plus a tool
that answers the adjacent question.

---

## Ground state of emitted citations, measured

| | |
|---|---|
| Skills emitting external URLs at all | **7 of 32** |
| Skills requiring a capture date or "accessed this session" | **2** (`lilly-brand-assets`, `procurement-help-desk`) |
| Generators enforcing a resolve check **in code** | **0** |

G12 already specifies the right shape at `lilly-brand-assets-1c344a/SKILL.md:1117`: a cited
web source is *"an accessed web source with URL plus capture date"*.

**That requirement is stated once, centrally, and enforced nowhere.** No generator checks
that a URL was fetched, that a capture date exists, or that a stale citation is labelled.
It is exactly the pattern H3 found for "drop, do not dilute": a correct rule with no
mechanism behind it.

### The named worst case is already documented and still open

`procurement-help-desk-1c344a/SKILL.md:129-131`, the **Global ProtectLilly** source:

> lives on the now.lilly.com intranet, NOT collab.lilly.com SharePoint. The M365 connector
> indexes SharePoint / OneDrive / Outlook / Teams, so it may NOT reach this page. Treat it
> as the source most likely to fail retrieval (flagged again under NETWORK-GATED STEPS item
> 6, since the retrieval gap has not yet been re-verified).

This is the exact failure H5 exists to catch: a policy URL that will be cited, that a run
probably cannot reach, and where nothing today forces the difference between "fetched" and
"cited from memory" to be visible in the deliverable.

**It is honestly flagged in prose and unenforceable in code.** That is the whole of H5 in
one example.

---

## What I built instead, and why it stays

`_audit/h5_citation_resolver.py` checks **internal** cross-references: does a cited file
exist, and if a line or range is named, does the file have that many lines.

That is not H5. It is a narrower, adjacent question that nothing else in the programme
covers, it is fully unblocked, and it caught two real things.

### Result

```
line-number citations checked ... 12
  resolved ...................... 12
  file does not exist ........... 0
  line past end of file ......... 0

cross-skill path citations ...... 166
  target does not exist ......... 153
```

### The interesting result is the scarcity, not the breakage

**Twelve line-level citations across 32 skills.** The suite cites files constantly and
lines almost never. That is a finding in itself: G12 asks for "a document plus
section/page", and the skills' own internal referencing is file-level. It is not wrong, but
it means a reader chasing a claim lands on a whole document rather than a place in it,
which is the difference between a checkable source and a plausible one.

### Two real catches

**1. An ambiguous citation in my own work from earlier tonight.** `rfx-hub-1c344a/SKILL.md`
carried a bare `SKILL.md:384` inside prose about *rfp-engine*. Correct in context, ambiguous
in form, and it resolves against the wrong file for anyone reading mechanically. Fixed to
`rfp-engine-1c344a/SKILL.md:384`.

**2. A resolver bug of mine, fixed before trusting the output.** My first version preferred
a same-skill basename match over an explicit path, so `rfp-engine-1c344a/SKILL.md:384`
resolved against the *citing* skill's SKILL.md and reported a false break. A citation
carrying a path is explicit and must be honoured first. Fixed, with the reason recorded in
the code.

### The 153 cross-skill misses are already-known, plus one new thing

145 are the brand-assets dangling pointers the G1-G7 audit found: eight reference files
inlined into `lilly-brand-assets`' SKILL.md with every pointer to them left behind. Same
finding, independently reproduced by a different tool, which is a useful confirmation.

**The remainder is new and is not a citation at all.** Eight paths under
`/mnt/skills/user/executive-summary/` come from an **install script** inside
`executive-summary-package-1c344a/SKILL.md:1096-1150`, which copies the skill to
`/mnt/skills/user/executive-summary/`.

**So that skill installs under a different name than its directory**
(`executive-summary` vs `executive-summary-package-1c344a`). Not a broken citation, and
possibly deliberate, but it is a naming inconsistency that matters at packaging time: a
manifest built from directory names will not match what actually lands on disk. **Flagged
for K1.**

---

## Recommendation

**H5 proper stays blocked on H4** and should not be attempted before it. Building a resolve
check without a per-fact provenance field means inventing one, and that field is H4's whole
job.

**What can be done now, and would be worth doing regardless of H4:** the capture-date
requirement at `SKILL.md:1117` should be enforced by whichever generator emits a benchmark
or research table, so a citation without a capture date raises rather than renders. That is
the same ledger-boundary pattern the contract-review fix pack uses, and it needs no new
provenance model, only a required field on an existing structure.

## Limit

Resolving proves a cited file and line **exist**. It cannot prove the line says what the
citing text claims. Necessary, not sufficient.
