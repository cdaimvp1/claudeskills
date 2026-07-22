# SOW Clause & Pattern Library (Suite-Category-Neutral)

Domain-neutral pattern bank so this skill works across software/SaaS, professional services,
lab/clinical services, chemicals, equipment, facilities, logistics, and marketing SOWs, not IT alone
(per Global Operating Rule for the suite). Use these as DEFAULT-AND-OVERRIDE starting points, never
as verbatim boilerplate presented to the user as if it were the input's actual content. Every
drafted clause pulled from here and inserted into a rewritten SOW is labeled "DRAFT - confirm with
[owning stakeholder]" until the user confirms it.

## 1. Acceptance-criteria rewrite patterns (subjective -> objective)

| Subjective phrase found in draft | Why it fails the objectivity test | Objective rewrite pattern |
|---|---|---|
| "Deliverable shall be satisfactory to Lilly" | No named standard; purely subjective, unenforceable as a gate | "Deliverable shall [pass/meet/achieve] [named test/spec/threshold], confirmed by [named reviewer/role] within [N] business days of submission" |
| "Work shall meet industry standard" | "Industry standard" is undefined and shifts with interpretation | Name the specific standard (e.g., "meets OWASP ASVS Level 2," "meets ANSI/ASQ Z1.4 AQL 1.0 sampling") or the specific measurable spec |
| "As needed" / "as required" (for a service level or frequency) | No trigger, no cadence, no measurable floor | State the trigger explicitly (a threshold, a schedule) or the minimum cadence |
| "Best efforts" as the sole completion standard | Not falsifiable; cannot gate a payment or an acceptance decision | Pair with an objective deliverable or acceptance test; "best efforts" may describe HOW the work is performed but should not be the sole gate for WHETHER a milestone is met |
| "Substantially complete" with no completion percentage or checklist | Ambiguous threshold | Define via a checklist (e.g., "all Must-Have items from the requirements matrix delivered and demonstrated") or a stated percentage against a named baseline |
| "To be mutually agreed" (for a criterion that drives payment or a go/no-go) | Defers the actual definition; not a criterion at all | Either define it now, or explicitly schedule WHEN and by WHOM it will be defined, with a date, so it does not silently slip |

## 2. Deliverable testability checklist

A deliverable passes the testability test if it has all four:
1. **Name** - a specific, referenceable label (not "various documentation")
2. **Description** - what it contains or does, specific enough that two readers would agree whether
   a submitted artifact matches
3. **Format/medium** - document, code repository, trained model, physical good, report, working
   session, certification, etc.
4. **Verification method** - how acceptance is confirmed (a review, a test, a demo, a physical
   inspection, a data check) and who confirms it

Missing any of the four is at minimum a MEDIUM finding on the Deliverables Definition dimension;
missing three or four is HIGH; a SOW with zero testable deliverables anywhere is BLOCKING.

## 3. SLA / KPI patterns by engagement type

| Engagement type | Typical SLA/KPI to expect (flag as a gap if absent and the type applies) |
|---|---|
| SaaS / hosted software | Uptime %, incident response time by severity, planned-maintenance notice window, support ticket response/resolution SLA |
| Managed service / outsourced process | Volume-based throughput targets, quality/error-rate ceiling, turnaround time per unit of work, escalation SLA |
| Professional services (fixed deliverables) | On-time delivery rate against the milestone schedule, defect/rework rate on delivered artifacts, review-cycle turnaround |
| Staff augmentation / T&M | Fill-time for open roles, minimum utilization or notice period for resource changes, background-check/onboarding SLA; deliverables-based SLAs are often NOT APPLICABLE by design, say so rather than penalizing |
| Lab / clinical services | Sample turnaround time, data-integrity/QC pass rate, protocol-deviation reporting SLA, chain-of-custody requirements |
| Logistics / physical goods | On-time-in-full (OTIF) rate, damage/defect rate, lead-time commitment, inventory-accuracy target |
| Facilities / equipment | Response time by work-order priority, preventive-maintenance completion rate, uptime/availability of the asset |

Every SLA/KPI row needs a target, a measurement method, and a reporting cadence. A metric named with
no target ("we will track responsiveness") is a MEDIUM finding, not a satisfied dimension.

## 4. RACI construction pattern

For each deliverable or workstream, name exactly one Accountable party (the single person whose
name is on the outcome; never two Accountables for one item, that is a governance gap in itself) and
at least one Responsible party (who does the work; may be the same as Accountable). Consulted and
Informed are optional per item but should be populated where a cross-functional dependency exists
(e.g., Privacy Office Consulted on a data-handling deliverable, Legal Informed on a deliverable that
changes contractual scope). A deliverable with no Accountable party is an orphan and is at minimum a
MEDIUM finding on the Roles & Responsibilities dimension; if it is also a BLOCKING/HIGH-value
deliverable, escalate to HIGH.

## 5. Assumptions & dependencies register pattern

Distinguish the two: an ASSUMPTION is something the price/timeline relies on being true that neither
party directly controls confirming right now (e.g., "assumes existing data is in a migratable
format"); a DEPENDENCY is a specific input, access, decision, or deliverable owed by one party
(usually Lilly) that the other party's work is blocked on (e.g., "requires Lilly to provision VPN
access by [date]"). Each needs: statement, owner (who is accountable if it turns out false/late),
risk-if-wrong (schedule slip, cost change, rework), and for dependencies, a needed-by date. A SOW
with real, non-trivial technical or organizational complexity but zero stated assumptions or
dependencies is a signal the drafter did not think through delivery risk, not a signal the
engagement is risk-free; flag it as a gap rather than treating silence as clean.

## 6. Change-control trigger defaults (by deal size, illustrative starting point)

Use as a DRAFT default only; the user's actual procurement policy and category-specific thresholds
govern. Do not present these numbers as a Lilly policy citation; they are a reasonable starting
point pattern, not a sourced Lilly standard. If `process-navigator` or a stated Lilly policy is
available in context, defer to that instead of this table.

| Deal size band (illustrative) | Suggested change-order trigger | Suggested approval authority |
|---|---|---|
| Under $100K | Any scope addition, or a schedule slip beyond 2 weeks, or a cost delta beyond 10% | Requesting manager + procurement contact |
| $100K - $1M | A scope addition beyond a stated buffer (e.g., 10% of a deliverable's defined effort), or a cost delta beyond 5-10%, or a schedule slip beyond 4 weeks | Category lead / budget owner sign-off |
| Over $1M | Any material scope change, a cost delta beyond 5%, or a schedule slip beyond 4-6 weeks | Formal change-control board or the same approval chain that authorized the original SOW |

Every change-control section needs: the trigger threshold(s), who has authority to approve, and how
a change is priced (a stated rate-card reference, a rough-order-of-magnitude process, or a
requirement to submit a priced change proposal within N days). A change-control section that names
only "changes require written agreement" with no threshold, authority, or pricing mechanism is a
MEDIUM finding (present but not usable to actually govern a change); a SOW with no change-control
section at all on an engagement with real scope-evolution risk (multi-phase, multi-quarter, or
technology-dependent work) is HIGH, trending BLOCKING on large, long-duration engagements where an
unpriced scope creep has high dollar exposure.

## 7. Staffing & rate-card construction pattern

A sound rate card states, per role: role title, seniority/level, rate, rate unit (hourly, daily,
monthly, or a flat per-deliverable fee), and if the engagement is volume- or hours-based, the
committed or estimated hours/FTE allocation by phase. Use `to_hourly()` in the vendored
`numeric_kernel.py` to normalize mixed-unit rate cards (some roles quoted daily, others monthly) onto
one comparable hourly basis before computing a blended rate. Use `verify_line_math()` to confirm
every row's rate x hours equals its stated line total; a row that does not foot is a rate-card
soundness finding, not a rounding footnote, because it means the total contract value itself may be
wrong. If the SOW spans multiple years or option periods and states an escalation rate, use
`escalate()` to confirm the stated Year-2+ rates actually match the stated escalation formula
(compounding vs simple) rather than accepting a hand-typed table at face value.

## 8. Out-of-scope boundary patterns

A strong out-of-scope section does more than list unrelated services; it explicitly excludes the
adjacent, easily-confused work most likely to cause a scope dispute for THIS engagement type:
- Software/SaaS: excludes custom development beyond configuration, excludes data migration unless
  named, excludes training beyond a stated number of sessions, excludes third-party licensing costs.
- Professional services: excludes travel/expenses unless stated, excludes work product ownership
  disputes (point to the governing MSA's IP clause rather than re-litigating it here), excludes
  scope for a "phase 2" that has not been authorized.
- Managed services: excludes volume above the committed band (define the overage mechanism instead
  of leaving it silent), excludes new-system onboarding beyond the named systems.

A SOW with an in-scope list but no out-of-scope list is a common, specific gap: flag it by name
("no out-of-scope section; recommend explicitly excluding [the 2-3 most likely adjacent asks]")
rather than a generic "boundary could be clearer" comment.

---
