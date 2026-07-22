# MAINTENANCE.md - numeric_kernel.py (pro-forma-builder-1c344a's vendored copy)

## Source of truth

`numeric_kernel.py` in this directory is a verbatim vendored copy of
`lilly-procurement-kernels-1c344a/numeric_kernel.py` (see that file's own
header comment: "Vendored verbatim from lilly-procurement-kernels-1c344a
... Do not hand-edit here; edit the source and re-vendor"). The canonical
update procedure, the function-ownership table, and the suite-wide known
limitations live in `lilly-procurement-kernels-1c344a/MAINTENANCE.md`. Do
not hand-edit the vendored copy in this directory; edit the source there
and re-vendor.

## What this skill uses from the kernel

pro-forma-builder calls `npv()` and `escalate()` (see SKILL.md's
"Deterministic computation" HARD RULE and "Workbook generation wiring"
HARD RULE). `pro_forma_generator.py` in this directory is the only caller.

## The escalate() Year-1 judgment call (resolved for this skill)

`escalate()`'s docstring flags an unresolved "JUDGMENT CALL": whether the
1-indexed `year` argument already carries one escalation step, or is the
unescalated base. The kernel implements `Year_N = Base * (1+rate)^N` for a
literal `year=N`, i.e. `year` IS the exponent.

pro-forma-builder's own TCO convention (SKILL.md, "Financial Methodology >
TCO") is `year n unit cost = base x (1 + escalation_rate)^(n-1)`, with
Year 1 at the base rate (no escalation). These are different conventions
for the same variable name.

**Resolution (this is the "accompanying report" the kernel's docstring
points to; no separate report file exists or is needed):** SKILL.md's
"Deterministic computation" HARD RULE spells out the mapping this skill
uses: compute Year 1 directly at `base` with NO `escalate()` call, and for
each later year N (N >= 2) call `escalate(base, rate, N-1, compounding)`,
passing the escalation STEP COUNT (N-1) as the kernel's `year` argument,
never the 1-indexed calendar year. This makes the kernel's literal
`Base*(1+rate)^year` formula produce exactly `Base*(1+rate)^(N-1)`,
matching the TCO convention. `pro_forma_generator.py`'s Cost Buildup tab
formulas implement this directly in Excel
(`=C{row}*(1+EscalationRate)^{n-1}`), and `compute_ground_truth()` mirrors
the same `n-1` exponent in Python, so the Excel formulas, the Python
ground truth, and the kernel's own `escalate()` semantics all agree. Do
not pass the 1-indexed calendar year to `escalate()` from this skill; it
refuses `year < 1`, and will silently over-escalate every year from Year 1
onward if given the calendar year instead of the step count.

## Known gap: FX conversion not wired

The kernel's `convert_currency()` exists and is documented in the
canonical `lilly-procurement-kernels-1c344a/MAINTENANCE.md` as owned by
pro-forma-builder's Assumptions-register FX convention.
`pro_forma_generator.py` validates and displays `fx_rates` in the
Assumptions tab but does not call `convert_currency()` at build time. Per
SKILL.md's Currency/FX section, callers must convert every monetary figure
to the single reporting currency before it enters the Assumptions
register; `fx_rates` is disclosure/audit metadata in the current
generator, not a runtime conversion path. Wiring `convert_currency()` into
`compute_ground_truth()` / `build_workbook()` so multi-currency inputs are
converted automatically is a known, tracked gap, not a silent one.

## No source-verified NPV golden example

The kernel's `npv()` docstring notes pro-forma-builder's SKILL.md states
the NPV formula and convention but gives no concrete worked cash-flow
example, so the kernel's self-test uses only a mathematical consistency
check (r=0 implies NPV=sum(cashflows)), not a golden test. If SKILL.md is
ever updated with a worked NPV example, port it into
`lilly-procurement-kernels-1c344a/numeric_kernel.py` as a true golden test
and re-vendor.
