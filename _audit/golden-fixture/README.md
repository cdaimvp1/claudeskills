# Golden fixture — lilly-contract-review

A fixed synthetic contract package with a known-correct answer, for proving that a change
to `lilly-contract-review` did not lose a check.

**Built 2026-07-29.** Marc's decision: synthetic rather than a real contract.

---

## Why this exists

`_audit/F1-COVERAGE-MATRIX.md` has roughly 200 rows whose entire verification column reads
"golden-fixture test: finding present in both runs". Until now there was no fixture, so
every one of those rows was a promise with no instrument behind it.

F1 rewires this skill around a deterministic Stage 0/Stage 1 front end. The coverage
matrix's whole purpose is to guarantee no check is silently dropped in that rewire. Without
a fixture, that guarantee is enforced by careful reading. With one, it is a diff.

## Why synthetic

Three reasons, and the first decides it.

**With a real contract you do not know the right answer.** You can only compare the new
skill against the old one. If both miss something, they agree and the test passes. Here the
defects are planted, so `ANSWER-KEY.md` is an actual answer key rather than a second
opinion.

A real Lilly contract also cannot be committed to a repository, shared, or diffed in a pull
request. And a synthetic one can carry rare defects deliberately: this package has a
"knowingly" qualifier on debarment, a sub-$3M cap with a lesser-of construct, a 96-hour
breach window, an arithmetic error in Lilly's favour, and a definition-tracing failure, all
at once. A real contract gives you whatever it happens to contain.

## The package

| File | Role |
|---|---|
| `MSA.md` | Master Services Agreement, Lilly paper. The governing document |
| `EXHIBIT-A-Definitions.md` | Defined terms. Carries the Usage Data exclusion that D-6 turns on |
| `EXHIBIT-B-SLA-and-Rate-Card.md` | Service levels and the rate card the WO violates |
| `EXHIBIT-C-AI-Standard.md` | AI Standard extract. Carries the Subcontractor rule HS-5 breaks |
| `SPS-Supplier-Privacy-Schedule.md` | Data protection schedule. Covers most data categories |
| `WO-10-under-review.md` | **The document under review.** All planted defects live here or are absent from here |
| `ANSWER-KEY.md` | The known-correct result, with the rule each row exercises |
| `expected-findings.json` | The same, machine-readable, for mechanical diffing |

The family is deliberately structured so the MSA and its exhibits genuinely **cover** many
categories. That is what makes the fixture able to test Rule 7 and Rule 9 (combined
protection) rather than only defect detection: several WO defects must be scored in the
`Governed: Covered` column, not `Standalone`.

## How to run it

1. Give the skill all six documents, with `WO-10-under-review.md` as the document under
   review and the rest as the governing family.
2. Run in **Full review** mode to exercise every deliverable, and again in **Redline only**
   to test the default path.
3. Diff the findings against `ANSWER-KEY.md`.

Check three things, in this order, because they fail in increasing subtlety:

- **Part 8 aggregates first.** Hard Stop count, score band, false-positive count. A miss
  here is visible without reading anything.
- **Part 7 negative controls next.** A false positive is as much a defect as a miss, and
  Rule 5 is the most commonly violated rule in this skill.
- **Then the individual rows.** Parts 1 to 6.

## The rows that matter most

Two rows carry more signal than the rest, and if you only have time to check two, check
these.

**Part 2, the absence-detection case.** The WO has no adverse event clause. The correct
answer is a LOW finding in the Governed: Covered column, because `MSA:23` covers it. Three
different bugs produce three different wrong answers here: silence means absence detection
is broken, a Hard Stop means the governing document was never read, and a Standalone-column
score means the coverage status was passed wrong. It is also the specific case that would
break if playbook retrieval were ever keyed on what the contract contains, since AE appears
nowhere in the WO.

**Part 5, D-6.** The WO classifies free-text notes written by Lilly staff as Usage Data.
`EXHIBIT-A:4` expressly excludes human-authored content from that definition. No keyword
match finds this; it requires tracing the defined term and comparing the classification
against the definition's own exclusion. It is the mechanism behind the two findings around
it, and a run that catches those but misses this has found the symptom and not the cause.

## Maintaining it

Add rows when the coverage matrix gains a check worth defending. Never delete a row to make
a run pass.

If a change to the skill makes a row here fail, the presumption is that the change is
wrong. Overriding that presumption requires saying so explicitly, in the commit, with the
reason. That is the same discipline the kernel's `KNOWN_EXCEPTIONS` list uses, and for the
same reason: a suppressed check that nobody has to justify stops being a check.

## What it does not prove

It proves the planted checks still fire. It does not prove that checks nobody thought to
plant still fire. It is a regression net, not a completeness proof.

Completeness is argued by `_audit/F1-COVERAGE-MATRIX.md`. This fixture is what stops that
argument decaying every time someone edits the skill.

## Standing constraints

These documents are synthetic and contain no Lilly confidential information. They are not
legal advice and must not be used as contract templates. The defects are deliberate; a
reader who mistakes this for a model agreement will reproduce every one of them.
