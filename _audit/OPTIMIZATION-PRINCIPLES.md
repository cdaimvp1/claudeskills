# Optimization principles (Marc, 2026-07-29). Read before touching any skill.

## The priority order, in order

1. **Accuracy, quality, completeness**
2. **Time and token cost**

Not negotiable, and not a tie-break. A change that saves tokens and costs accuracy
is a regression, however good the numbers look.

## What this means for the "slowness" findings

The audit found four mechanisms that scale badly: multi-pass document reopens,
per-item unbatched loops, uncapped per-line web search, and model-assembled
documents. It is tempting to read that list as "do fewer passes".

**That reading is wrong and is explicitly rejected.** Marc: the four-pass design in
contract review, the document chunking, the per-item loops were deliberate, and
their intent was accuracy, robustness and completeness. They are not accidents to
be trimmed.

The correct goal is **the same or better accuracy at lower cost**, never less
accuracy at lower cost. If a redesign cannot hold accuracy, it does not ship, and
the cost stays.

Redesign is permitted. Degradation is not.

## Why Python, stated properly

Moving work from the model to Python was never only a cost play. The intent, in
order:

1. **Accuracy** - a formula computes the same answer every time
2. **Consistency** - no run-to-run variation in arithmetic
3. **Reliability** - validation and reconciliation gates that raise rather than
   emit a wrong number
4. **Then** lower token cost, and often lower wall-clock time

That ordering is why the generator wiring was worth doing even though it also
happened to be cheaper: the workbook now re-derives its own figures in live Excel
formulas a reviewer can audit.

## Techniques to explore, all subject to the priority order

Cost reduction that PRESERVES or IMPROVES accuracy:

- **Deterministic pre-processing.** Segment clauses, parse tables, extract rate
  lines in Python so each model pass operates on clean structured input rather
  than re-reading raw text. Fewer tokens AND less to misread.
- **Deterministic pre-filtering.** Let code narrow the candidate set so the model
  only judges items that genuinely need judgment. The model still sees every
  candidate, so completeness holds.
- **Batching.** Replace per-item model loops with one structured call over the
  batch. invoice-rate-card-auditor is the clearest case.
- **Persisted intermediates.** Cache pass output so a re-run, or a second pass
  after new data arrives, does not redo settled work. `timeline-builder`'s
  `timeline_calibration.json` is the working precedent in this suite.
- **Schema-constrained output.** Structured output reduces reformat-and-retry
  loops, which are pure waste.
- **Stable prompt prefixes** so the cacheable part of a large SKILL.md is actually
  cached across passes rather than re-sent.
- **Parallelism across independent chunks** where passes do not depend on each
  other.
- **Kernel for all arithmetic**, generators for all document assembly. Both are
  accuracy measures first.

## Constraint that rules one technique out

Skills run on the user's own Claude Desktop, on the user's model and usage. A
skill must not require Opus and must work on Sonnet
(`feedback_skills_desktop_usage_efficient`).

So **model-tier routing is not available**: we cannot send mechanical passes to a
cheap model and judgment passes to a strong one. Every optimization has to work
within one model tier. This rules out the most common cost trick and is why the
deterministic-preprocessing and batching routes matter more here than they would
in a server-side pipeline.

## How to evaluate any proposed redesign

State, for each change:

1. What accuracy or completeness property must be preserved, and how it is checked
2. The measured cost before and after
3. What would prove the redesign lost accuracy

If (1) cannot be answered, the change is not ready.

---

## Two further requirements (Marc, same day)

### It must actually RUN in Claude Desktop

Reading well is not the bar. Every skill has to execute end to end on a user's own
Desktop install. That means: no third-party import that may be absent, no
hardcoded repo paths, no assumption that a sibling skill is installed, and no
dependence on a tool or connector that may not be there.

This is why `numeric_kernel.py` is VENDORED rather than imported. A skill installs
standalone, so it must be self-contained or degrade gracefully and say so. Any
cross-skill path reference is suspect and needs checking against a partial
install.

Each skill needs a runtime smoke test that proves it executes, not a static read
that proves it parses.

### It must find the right data without knowing what the user can reach

A skill cannot assume the M365 connector, SharePoint, the Lilly intranet, web
search, or anything beyond a pasted document. So it must **detect** what is
available rather than assume, degrade through a known ladder, and **label** what
it could not reach.

Coupled to that: no hallucination, no drift. The suite already has the machinery
(guardrail G12, cite-or-abstain, NEEDS_INPUT and [CONFIRM] markers, the
comms-evidence methodology). The open question is which skills IMPLEMENT it versus
merely mention it.

The strongest available mechanism is code-enforced abstention. **A generator that
RAISES on a NEEDS_INPUT field beats an instruction telling the model not to
fabricate**, because the instruction can be forgotten and the exception cannot.
The two wired generators already work this way, and that is the pattern to spread.

Provenance should be carried per fact (source, as-of date, confidence), not per
document, and citations should be verified to resolve rather than merely be
present.

**Grounding is an accuracy measure first.** Where it costs tokens, the priority
order says that cost is justified. State it plainly rather than optimizing it
away.
