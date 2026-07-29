# Run protocol

How to produce a baseline or a regression run against this fixture, and why it has to be
done by someone who has not read the answer key.

---

## The contamination rule, which is not optional

**Whoever runs the fixture must not have read `ANSWER-KEY.md` or `expected-findings.json`
first.** A reviewer who knows a "knowingly" qualifier is planted in `WO-10:7.1` will find
it. That proves recall, not detection, and a baseline built that way is worse than no
baseline because it reports green.

This is why the baseline was not produced by the session that built the fixture. The
fixture, the answer key and this protocol were authored in one sitting; anyone from that
sitting is disqualified from producing the run.

**Who can run it:** a fresh Claude Desktop session with `lilly-contract-review` installed
and no access to this directory's answer key, or a person doing the same. Give the runner
only the six contract documents.

---

## Running it

**1. Give the runner the six documents and nothing else.**

```
MSA.md
EXHIBIT-A-Definitions.md
EXHIBIT-B-SLA-and-Rate-Card.md
EXHIBIT-C-AI-Standard.md
SPS-Supplier-Privacy-Schedule.md
WO-10-under-review.md          <- the document under review
```

Do not supply `ANSWER-KEY.md`, `expected-findings.json`, `README.md` or this file.

**2. Run twice.**

- **Full review** exercises every deliverable.
- **Redline only** is the default mode and the one the output-mode audit found degraded.
  Running only Full review will miss the defect this fixture was partly built to catch.

**3. Capture each run as a run file** in `runs/`, named `YYYY-MM-DD-<mode>.json`.

---

## The run file

The reviewer maps what the run actually produced onto the answer key's IDs. That mapping
is a judgment and belongs to a human or a reviewing agent; `check_run.py` does only the
bookkeeping and the verdict.

```json
{
  "run_id": "2026-08-01-redline-only",
  "mode": "Redline only",
  "found": ["HS-1", "A-1", "D-6"],
  "extra": [
    {"topic": "notice address clause is ambiguous", "severity": "LOW", "where": "WO-10:14"}
  ],
  "aggregates": {
    "hard_stop_count": 5,
    "protection_score": 12,
    "protection_score_band": "Critical",
    "rule12_calculation_table_present": true,
    "ae_finding_severity": "LOW",
    "ae_finding_coverage_column": "covered"
  }
}
```

**`found`** is the list of answer-key IDs the run produced. Map generously on wording and
strictly on substance: a finding that flags the right clause for the right reason counts,
even if worded differently. A finding that lands on the right clause for the wrong reason
does not.

**`extra`** is anything the run found that is not in the answer key. **This is not
automatically a failure and is deliberately not punished.** A genuine find is a row to ADD
to the fixture. A spurious one is a false positive. Both need a human to say which.

**`aggregates`** are the fast signals. Fill them from the run's own output, not by
inference.

---

## Checking

```
python check_run.py runs/2026-08-01-redline-only.json
```

Exit 0 pass, 1 fail. It reports per group, checks all eight negative controls, checks the
absence-detection row in detail against its three distinct failure modes, and validates the
aggregates.

Verify the checker itself first if you have not run it before:

```
python check_run.py --selftest
```

11 cases, covering a perfect run, each individual failure mode, and the case that must NOT
fail (an unrelated extra finding). A checker that passes everything is worse than no
checker, so this is the thing to trust before trusting a verdict.

---

## Reading a failure

Failures are ordered by how much they tell you.

**Absence detection** is the highest-signal row and separates three different bugs:
silence means absence detection is broken; a Hard Stop means the governing document was
never read (the Rule 9 defect, which also inflates the Hard Stop count to six); a
Standalone-column score means the wrong coverage status reached `deduction_score()`.

**Negative-control hits** mean over-flagging, which Rule 5 exists to prevent and which is
the most commonly violated rule in this skill. A run that finds everything and also flags
four things the MSA already resolves has not passed.

**A missing `A-2`** means the arithmetic check suppressed an error in Lilly's favour.
`arithmetic-verification.md:13` is direction-agnostic and a run reporting only the errors
against Lilly has a direction bug, not a rounding one.

**A protection score above the Critical band** is a scoring defect visible without reading
a single finding: five Hard Stops deduct 75 points before anything else counts.

---

## Example

`runs/EXAMPLE-degraded-redline-only.json` is hand-authored and is **not a real run**. It
shows what the checker reports when the output-mode defect is present: 33 of 36 planted
defects still found, because clause-anchored findings reach the redline, but the Protection
Score, the Rule 12 calculation table, the Compliance Evidence Checklist and the
absence-detection row all missing, because none of those has a surface in redline-only
mode. Delete it once real runs exist.

---

## Desktop

`check_run.py` is stdlib only (`json`, `os`, `sys`) and lives in `_audit/`. It is a test
harness, not part of any skill, and ships with nothing. The fixture documents are plain
Markdown with no dependency of any kind.
