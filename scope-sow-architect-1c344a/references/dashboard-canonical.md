# Scope & SOW Architect Dashboard: Canonical Structure v1.0 (LOCKED)

This spec is mandatory. Every scope diagnostic dashboard this skill produces, for every engagement
type (SaaS, professional services, staff augmentation, managed service, lab/clinical, equipment,
facilities, logistics) and every input source (uploaded draft, prior SOW, email/proposal, or verbal
description), must follow this exact structure. Only the data changes. Do not redesign the tabs or
styling per run. The reference implementation is
`examples/scope_sow_architect_canonical_dashboard.jsx`. Clone its structure, swap the data.

## The determinism guarantee

1. **Same seven tabs, always.** Header, tab nav, footer, color tokens, typography, and reusable
   components are identical run to run, regardless of engagement type.
2. **Content varies, structure does not.** A one-line-verbal-description build and a 40-page
   uploaded draft SOW populate the same seven tabs. A tab that is less applicable to this
   engagement type (e.g., SLAs & KPIs on a fixed one-time deliverable with no ongoing service
   component) shows a labeled NOT APPLICABLE state with the one-line reason, never a blank or a
   dropped tab.
3. **Depth parity through the four-pass workflow.** Every tab is filled to the same minimum depth
   by running all four passes in `references/pass-artifacts.md`. A tab is thin only when the input
   genuinely does not support more (e.g., a one-line verbal description before the elicitation
   interview has run), and that fact is stated.
4. **Every tab always renders.** Use the three labeled states (NEEDS_INPUT, NOT APPLICABLE,
   RESEARCH PENDING) rather than dropping content.

## Layout shell

- **Header bar:** dark (#212121) background, 4px red (#E1251B) left rule, uppercase red eyebrow
  "Scope & SOW Architect | [Engagement Type]", Georgia serif title "[Supplier/Workstream] -
  [SOW Title]", right-aligned metadata (Scope Definition Score, total value, term, prepared date).
- **Tab nav:** seven flat tabs (no nested sub-tabs; this skill's deliverable set is broad but each
  tab is self-contained, unlike lilly-contract-review's nested 3-panel structure).
- **Body:** max-width 1280px container, light background, Arial body / Georgia serif titles.
- **Footer:** dark bar, left = "Reflects the work as defined; does not assess legal protection - see
  lilly-contract-review for that lens", right = "Eli Lilly and Company - Confidential" + year +
  skill version.

## Color tokens (copied verbatim from lilly-brand-assets `dashboard-components.md`; do not change)

`R = #E1251B, DK = #212121, BRN = #521207, CARD = #E4EBF1, WARM = #FFF0D8, RISK = #FDE8E5,
OK = #D4E5F7, BD = #E4EBF1, MUT = #8A969E, LT = #8A969E, BLU = #0F3A85, AMB = #B45309`.
Chart palette (6, in order): `[R, BLU, BRN, "#F58E7D", "#FFC709", "#99BFE5"]`. No green anywhere;
the positive/good signal is Bold Blue (BLU) text on Neutral Sky (OK) background, never a "GRN"
token, per the suite no-green rule.

Severity tiers (findings): `BLOCKING = R (rendered as a filled dark-red pill, distinct from HIGH by
label, not a new color), HIGH = R, MEDIUM = AMB, LOW = BLU`. Dimension coverage
(structure-map status): `Present = BLU/OK, Partial = AMB/WARM, Missing = R/RISK`.

## Typography

Georgia serif for titles, KPI numbers, and card headers. Arial for body text, tables, and labels.
No other fonts, matching the Magazine Report house style.

## Reusable components (verbatim from lilly-brand-assets `dashboard-components.md`)

`Metric, Card, Pillar, SevPill, PrioPill, StateBanner, STable, ScoreCell, PctCell, Tip`, plus the
standard `BarChart`/`Bar`/`XAxis`/`YAxis`/`Tooltip`/`ResponsiveContainer`/`Cell`/`CartesianGrid`
recharts imports already listed under dashboard-components.md's "Required Imports". This skill uses
ONLY the documented shared-library components and the documented recharts imports; it does not
introduce a bespoke gauge or any other off-registry component. The Scope Definition Score is
rendered as a `Metric` KPI card (colored via `scC`/`scBg` against the 0.0-5.0 composite before
rescale) paired with a horizontal `BarChart` of the ten dimension scores (each `Cell` colored via
`scC`/`scBg` against its own 0.0-5.0 score, chart palette order otherwise unused here since color is
score-driven, not categorical).

## Tab 1: Overview

- KPI row (5 tiles): Scope Definition Score (/100, with band label), Total Contract Value, Payment
  Reconciliation status (Reconciles / Does Not Reconcile, from the kernel check), Open BLOCKING +
  HIGH finding count, Dimensions Ready (Fully/Largely Defined count out of 10).
- Recommendation callout (1-2 sentences, specific: what band, what the single biggest blocker is,
  what to do next).
- Scope Definition Score calculation table (all 10 dimensions, weights, scores, weighted
  contributions, composite, rescaled 0-100) - MANDATORY, per `scope-quality-scoring.md`; never a
  bare number with no derivation.
- Segmented dimension bar (ten segments) paired left/right with a narrative "Where this stands"
  card explaining the score in plain language and naming the top 2-3 dimensions driving the gap.
- Findings summary table (top findings by severity, all BLOCKING and HIGH rows minimum).
- BOUNDARY note callout: one line restating that this dashboard assesses whether the WORK is
  defined well enough to price/deliver/accept/govern, not whether the DOCUMENT legally protects
  Lilly (that is lilly-contract-review).

## Tab 2: Scope Boundary & Deliverables

- Left: Deliverables register table (Deliverable, Description, Format, Verification Method,
  Testability flag, Milestone link). Right: In-Scope list, Out-of-Scope list (or a flagged gap if
  absent), and a narrative on boundary/scope-creep risk naming the specific adjacent asks most
  likely to cause a dispute for this engagement type (per `sow-clause-library.md` section 8).
- Deliverable testability breakdown (count meeting all four testability elements vs missing one or
  more), paired with the findings that explain any gap.

## Tab 3: Roles, Assumptions & Dependencies

- Left: RACI matrix table (Deliverable/Workstream, Responsible, Accountable, Consulted, Informed,
  orphan flag). Right: Assumptions register and Dependencies register (two stacked tables:
  statement/owner/risk-if-wrong for assumptions; dependency/owner/needed-by/status for
  dependencies), paired with a narrative on unresourced work and dependency risk.

## Tab 4: Milestones & Acceptance

- Milestone schedule table (Milestone, Target date or trigger, Deliverable(s) tied, Payment %,
  Acceptance criteria text, Objectivity flag).
- Acceptance-criteria objectivity scan: every acceptance clause with a Pass/Flag verdict and, for
  flagged ones, the specific subjective phrase plus the objective rewrite (per
  `sow-clause-library.md` section 1), paired with a narrative on what objective acceptance gates
  protect against (payment disputes, indefinite rework loops).

## Tab 5: SLAs & KPIs

- SLA/KPI register table (Metric, Target, Measurement Method, Reporting Cadence, Credit/Remedy if
  any, Source). If the engagement type does not typically carry SLAs (per
  `sow-clause-library.md` section 3), render `StateBanner kind="NOT_APPLICABLE"` with the reason
  instead of an empty table.
- Narrative on which expected metrics for this engagement type are present vs missing, with
  confidence-labeled benchmark commentary only where genuinely available (never fabricated).

## Tab 6: Staffing, Rate Card & Payment

- Left: Rate card table (Role, Level, Rate, Unit, Hours/Allocation, Line Total, Footing check via
  `verify_line_math()`), with a blended-rate calculation shown (normalized via `to_hourly()` where
  units are mixed) and an escalation-formula check (via `escalate()`) if the SOW spans multiple
  years with a stated escalation rate.
- Right: Payment milestone table (Milestone, Amount, % of total, Deliverable tied) with the
  reconciliation result (sum of milestones vs stated total contract value) shown as a visible
  check, not just asserted, plus a narrative on payment-to-deliverable alignment risk (calendar-only
  payments with no delivery gate).

## Tab 7: Change Control & Rewrite Plan

- Change-control trigger register (Trigger, Threshold, Approval Authority, Pricing Mechanism), or
  a flagged gap with the DRAFT default from `sow-clause-library.md` section 6 offered for
  confirmation.
- Rewrite map: a compact table of every BLOCKING/HIGH finding, the section it lives in, and a
  one-line description of the fix applied in the rewritten SOW (cross-references the actual
  Rewritten_SOW.docx section numbers so the two artifacts are traceable to each other).
- Next-steps narrative: what to do with the rewritten SOW next (route to lilly-contract-review for
  the legal-protection pass, route to rfp-case-manager if this SOW is part of an active case,
  or route to market-rate-benchmarking if the rate card needs an external benchmark the user did
  not provide).

## Three labeled states (identical to the suite convention)

- **NEEDS_INPUT** (amber): a specific pending user input; state exactly what unblocks it.
- **NOT APPLICABLE** (gray): the tab or section genuinely does not apply to this engagement type;
  always give the one-line reason.
- **RESEARCH PENDING** (gray): a benchmark or external check was attempted and returned nothing
  usable; state what was checked.

---


---

# Deal-tab contribution (D1 / D3, added 2026-07-29)

> **Nothing above this line changed.** This skill's standalone outputs are
> unaffected: same structure, same palette, same generators. This section only
> describes what this skill contributes when a Deal tab is being built.

## The converged target

The Deal tab is built by **`deal-tab-1c344a`**, not by this skill. It is one
static, self-contained HTML artifact on the platform chrome, with a LOCKED
four-tab structure:

| Tab | Subtabs |
|---|---|
| **Overview** | none |
| **Terms & Review** | Documents & Conflicts · Legal & Protection · Scope & Performance · Sources & Evidence |
| **Economics** | Deal Table & ZOPA · Financial Model |
| **Negotiation** | Positions · Trade Plan · Communications |

Locked 2026-07-29. The six-tab version in `DEAL-TAB-REDESIGN-PROPOSAL.md` is
superseded and marked as such.

**This skill does not build that dashboard and must not emit its own version of
it.** It contributes a slice of the data object and stops there. Three skills
feed one artifact; if each built its own, the deal would have three
disagreeing dashboards.

## The slice this skill owns

| Key | What it carries |
|---|---|
| `scope{}` | Deliverables, acceptance criteria and their defined/undefined state, the intended-scope reconciliation, delivery timeline, and RACI |
| scope `issues[]` | Scope-specific contested items, in the same shape as contract-review's `issues[]` so the register can merge them |

## Where each lands

- Both drive **Terms & Review > Scope & Performance**: the verify-complete,
  verify-sound, verify-allocated readiness verdict, the reconciliation ledger,
  the timeline and the RACI.
- Acceptance criteria that are **not defined** must be stated as undefined, not
  omitted. The panel counts them ("2 undefined acceptance", "of 4 acceptance
  gates undefined") and that count is the finding.
- Scope `issues[]` merge into the shared register, so `category` and `priority`
  must use the same vocabulary contract-review uses.

## Preserved, unchanged by D1/D3

`Rewritten_SOW.docx` and the 4-pass workflow are untouched. Contributing a scope
slice to the Deal tab does not change how the SOW is produced.


---

# D3: the redesigned panels, as specification

Four panels were designed against mockups and built, but existed only as code.
They are recorded here so the next build reproduces them rather than reinventing
them. Full implementations live in `deal-tab-1c344a/dashboard/_parts/`.

## Legal & Protection: accordion scorecard + register

A segmented navigator, **Protections N / Obligations N**, each a single-open
accordion (native `<details name>`, no JavaScript). The counts on the segments
are the summary; there is no separate count panel.

The register **starts collapsed** (2026-07-29). It previously auto-expanded the
first category containing a hard stop, which pushed the rest of the page off the
first screen and chose a first item for the reader with no reason to prefer one.

Group bands are kept rather than per-row tags: protections and obligations are
read at different moments, and a flat tagged list makes both audiences filter
visually every time.

## Positions: master-detail with severity filter

Left, the ranked list of contested terms. Right, the selected term in full: the
position ladder (as-drafted, target, fallback, walk-away), why it matters, the
exchange with expected pushback and our rebuttal, dependencies, and the history
of that term across redlines.

Above it, a posture header carrying the signature gates as Now/Need pairs and the
protection trajectory.

A severity filter bar sits above the list: **Hard stop / High / Medium / Low /
All**, each with its count, plus a live count of what is shown. Counts are on the
chips deliberately, because a filter that hides rows without saying how many is a
filter people stop trusting. If the selected row is filtered out, selection moves
to the first row still visible, so the detail pane never shows a position the
list is denying.

## Communications: item-driven alignment map

Organised by what is being negotiated, not by message. For each contested term:
where each side stands, mapped to the specific messages and quotes that got them
there, how it evolved, and the next move.

Content is **looked up, never re-typed**: `gapUs` = recommendedPosition,
`gapThem` = supplierPosition, cited messages = `comms.events` matched by issueId
and direction, the redline quote = `issue.sourceExcerpt`, next move =
recommendedResponse.

Three filters compose through one function: status, category and free-text
search, ANDed together so a later filter cannot undo an earlier one. Plus
expand-all, which relabels itself to collapse-all. An empty result states itself
rather than showing a blank panel.

## Scope & Performance: master-detail reconciliation

Readiness verdict first (verify-complete, verify-sound, verify-allocated), then
the reconciliation ledger, timeline and RACI. Undefined acceptance gates are
counted and stated, never omitted.

## The rule under all four

Reflect-only. These panels draft, surface and organise. They do not send, route,
write to any system, or initiate anything on the user's behalf.
