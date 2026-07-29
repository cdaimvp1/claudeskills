# F3 implementation record

Implements `_audit/UPGRADE-PLAN.md` item F3 (WS F) per the redesign in section 3.3. No cap
on search count was added anywhere. Verified by grep: no "cap the search" / "maximum search"
/ "search cap" language appears in any edit made here.

## What drove per-line search in each skill (quoted)

- `commercial-negotiation-prep-1c344a/SKILL.md:238`: "Minimum 3 independent web searches per
  rate line being benchmarked... Keep a research log." Plus Phase 1B, Pass 1: "Collect 3-5
  independent data points per rate line."
- `market-rate-benchmarking-1c344a/SKILL.md:235`: "Run a minimum of 3 independent searches
  per rate line. Aim for 5+ usable data points, which is the threshold to report a
  percentile band."
- `should-cost-builder-1c344a/SKILL.md:161`: "when sourcing a major cost driver from the
  web, run at least 3 independent searches for it."

## What changed, per skill

All three now carry the same two-part mechanism, worded consistently (family clustering +
percentile_gate double-count prohibition + dated cache + explicit "both floors stay"
statement), adapted only in terminology (rate line vs. cost driver) and cross-reference:

1. **commercial-negotiation-prep-1c344a/SKILL.md**: new subsection "Role-family
   deduplication and dated benchmark cache" inserted after the benchmark freshness rule and
   before the Phase 1 gate check; the gate checklist gained two verification bullets (no
   summed points across a family, cache entries carry `fetched_date` and are within 90
   days).
2. **market-rate-benchmarking-1c344a/SKILL.md**: new "Rule 6" alongside Rules 1-5; Step 1's
   "Search principles" bullets and the Mode 1 Research Minimums line were both updated to
   search/cache per family; this is the skill closest to G7/percentile_gate so it carries
   the fullest statement of the double-count prohibition.
3. **should-cost-builder-1c344a/SKILL.md**: new "Rule 2b" alongside Rule 2; Workflow step 3
   and the SUITE SPECIFICS Research line both updated to point at it.

Every edit states plainly: the evidence floor (G7's 3-search effort floor, and
`percentile_gate`'s 5-point threshold) is unchanged; dedup reuses evidence already gathered
rather than skipping research; every cached figure carries its `fetched_date` and is
labeled as reused on the output it feeds.

## Cache ages chosen, and why they differ

- **commercial-negotiation-prep and market-rate-benchmarking: 90 days**, uniform, because
  both draw on the same labor/SaaS/consulting rate-survey cadence (Janco, TEKsystems,
  Robert Half, G2, Gartner and equivalents, which typically refresh quarterly to
  semi-annually). 90 days is conservative against that cadence and stays well inside the
  12-month threshold already used by both skills' own inflation/aging-adjustment rule, so a
  cache hit inside the window needs no aging adjustment. commercial-negotiation-prep's entry
  additionally instructs preferring market-rate-benchmarking's own output for the same
  family over an independent search, so the two skills do not silently diverge on the same
  family's as-of date.
- **should-cost-builder: 90 days for labor-rate and published-index cost drivers**, same
  reasoning and same number as the other two, since should-cost frequently sources the same
  labor-role and published-index families. **FX rates and spot/volatile commodity inputs
  are explicitly excluded from the cache and always re-sourced fresh.** These move on a
  materially faster cycle than a quarterly labor survey, and the skill's own Aggregation
  Method (step 6) already treats FX uncertainty as its own spread term; caching it would
  hide the volatility that step is designed to surface. This is the one place the three
  skills genuinely need different treatment, not just different numbers, and the file says
  so.

## percentile_gate double-count risk

This is the main accuracy risk in the change and every one of the three edits addresses it
by the same rule: `percentile_gate()` (or should-cost's corroborating-source confidence
flag, which is the analogous evidence-count decision in a skill that has no percentile
gate) is evaluated ONCE per family, using the family's actual usable point count or
corroborating-source count. Every member line/driver of that family reports that same
count and the same resulting label (percentile band, range/median, or confidence flag). The
point count must never be summed across a family's members at the gate check or at any
portfolio-level rollup: a family with 5 usable points and 3 member lines is 5 points of
evidence, not 15. Each skill's cache entry is keyed per family and stores exactly one point
set, so every consumer of that family (the gate, the confidence label, any rollup) reads
the same set by construction rather than by relying on the model to remember not to double
count.

## Expected savings, stated honestly

No measurement was run; this is a design/text change to SKILL.md files, not an executed
benchmark. What can be said without overclaiming:

- Savings are entirely a function of how much genuine role/driver duplication exists in a
  given rate card or cost model. A rate card of 20 genuinely distinct roles, or a should-cost
  model with no repeated labor role across components, sees zero reduction in search count,
  and the plan and this implementation both say that is the correct outcome, not a shortfall.
- Where duplication exists (the stated example is three suppliers each proposing "Senior
  Java Developer, offshore"), the family is searched once instead of three times, so the
  saving scales with (member count - 1) per family, not with total line count.
- The cache adds a second, separate saving on re-runs (same engagement re-benchmarked, or a
  second pricing skill in the same engagement reusing a first skill's family research)
  within the 90-day window, again bounded by how often a run actually recurs inside that
  window.
- No claim is made about an aggregate percentage reduction across the suite; that would
  require running representative rate cards through both the old and new instructions and
  was out of scope for this text-only change. The verification obligations written into all
  three files (points-per-line must not fall, every band must still pass `percentile_gate`,
  every cache hit must carry and check its `fetched_date`) are what a future smoke test
  (WS G8) should exercise before this is trusted at scale.
