# Contract Review Dashboard: Canonical Structure v3.2 (LOCKED)

This spec is mandatory. Every contract review dashboard this skill produces, for every document type (MSA, SOW, WO, CO, OF, Amendment, CDA) and every category or commodity, must follow this exact structure. Only the data and the contract-specific research change. Do not redesign the layout, panels, sub-tabs, or styling per run. The reference implementation is `examples/contract_review_canonical_dashboard.jsx`. Clone its structure, swap the data.

## What Changed in v3.2

Added to v3.1:
- **Documents sub-tab** (Panel 1, 7th sub-tab): a document-family register (one row per document across the MSA + WO relationship: MSA, Exhibits, WOs, compliance evidence, invoices) with type, status, date, value, owner, and a deterministic retention-class lookup, plus a List / Folder Tree view toggle. A companion Compliance Evidence Checklist checks a fixed required-evidence list (W-9, SOC 2, ISS Questionnaire, SCC/TIA, Data Residency Screen, Risk Acceptance Memo, and any Risk & Deviation Approval memo) against the register and marks each Filed / Draft / Pending / Awaiting, naming the gate it blocks. Both are paired with a narrative analysis card. An item is never marked Filed without a matching document on record.
- **Protection Score Gauge (Overview):** the `Gauge` component (already named in the Reusable Components list below but not previously implemented) now renders: a semicircular arc in 4 fixed color bands (0-24 Critical/R, 25-49 High/AMB, 50-74 Moderate/GOLD, 75-100 Low/POS) with a needle at the current score, replacing the flat KPI-tile rendering of the Protection Score. It sits left of a "Score Methodology" narrative card (same methodology text as v3.1, now visually paired rather than a plain paragraph).
- **Protection & Coverage rollup:** a Covered / Confirm / Gap stat-tile row plus a single stacked-proportion bar (percentage of the 14 categories in each status), paired with a "Coverage posture" narrative callout, rendered above the existing 14-row coverage table. The Risk Heatmap sub-tab gets a short cross-reference callout tying its HIGH/MEDIUM/LOW tier counts to which of those findings trace to a true coverage Gap versus a Covered/Confirm category.
- **Obligations enhancements:** a "Tracked Dates & Deadlines" horizontal strip (each obligation as an urgency-colored chip, soonest first) paired with a "Deadline risk" narrative callout; a By Party / By Date sort toggle over the obligation register (By Date renders one combined, chronologically sorted table with a Who column); each obligation's Source cell now also carries the verbatim contract sentence it was extracted from.

## What Changed in v3.1

Added to v3.0:
- **Obligations sub-tab** (Panel 1): register with imbalance analysis and missing-obligation detection, per Step 6.5.
- **Playbook sub-tab** (Panel 2): per-term negotiation cards with arguments/pushback/rebuttal/fallback structure and a 5-persona toggle (Standard, Collaborative, Aggressive, Curious, Astonished). Persona changes the tone framing of each argument; substance is invariant.
- **Protection Score Methodology display** (Panel 1 Overview): mandatory explanation beneath the score KPI card, calculated per `references/risk-scoring.md` with combined-protection-weighted deductions.
- **Persona color tokens**: Standard=DK, Collaborative=POS, Aggressive=R, Curious=BLU, Astonished=PUR.

## What Changed in v3.0

The 12-tab analytical dashboard from v2.1 is replaced with a 3-panel structure that matches the outputs a procurement rep needs in a negotiation. The prior 12-tab structure was analytical (data tables, heatmaps, finding lists) but did not help a user negotiate. The 3-panel structure produces negotiation-ready content: position cards with fallbacks, concession sequencing with round-by-round strategy, counter-proposals with rationale, discount architecture, and SME pre-engagement briefs.

The structure reflects one unified analytical workflow (the three-layer analysis) and one dashboard structure, regardless of document type; the earlier per-document review approaches were consolidated into this single workflow. The content varies by document type and complexity. The structure does not.

## The determinism guarantee

1. **Same skeleton, always.** Three panels, each with its canonical sub-tabs, appear on every run, for every document type and category. Header, footer, panel nav, sub-tab nav, color tokens, typography, and reusable components are identical run to run.
2. **Content varies, structure does not.** A CDA review and a SaaS WO review populate the same panels. A sub-tab that is less applicable shows a labeled state, not a blank.
3. **Depth parity through multi-pass and research.** Every sub-tab is filled to the same minimum depth on every run by running the four passes and the definition tracing checklist. A sub-tab is thin only when research was genuinely attempted and returned nothing.
4. **Every sub-tab always renders.** No blank panels. Use labeled states (NEEDS_INPUT, NOT APPLICABLE, RESEARCH PENDING) instead of dropping content.

## Three labeled states

- **NEEDS_INPUT** (amber): analysis pending a specific user input. State exactly what input unblocks it.
- **NOT APPLICABLE** (gray): sub-tab genuinely does not apply. Always give the one-line reason.
- **RESEARCH PENDING** (gray): search attempted, nothing usable found. List what was searched.

## Layout shell

- **Header bar:** dark (#212121) background, 4px red (#E1251B) left rule, uppercase red eyebrow "Lilly Contract Review - [Document Type]", Georgia serif title "[Supplier] - [Document Title]", right-aligned badges (MSA VERIFIED / UNREVIEWED, governing docs status) and metadata (date, value, term).
- **Panel nav:** three major tabs (Contract Review, Legal Negotiation, Commercial Analysis), styled as primary navigation.
- **Sub-tab nav:** within each panel, horizontal sub-tabs for the sections below.
- **Body:** max-width container, light background.
- **Footer:** dark bar, left = governing-document basis plus "Procurement guidance, not legal advice", right = "Eli Lilly and Company - Confidential" + year + skill version.

## Color tokens (do not change)

R #E1251B (Lilly Red), DK #212121, POS #0F3A85 (Bold Blue, the on-brand positive/good/passing signal; Lilly has no on-brand green), BRN #521207, CARD #E4EBF1, WARM #FFF0D8, RISK #FFF5F5, OK #D4E5F7 (Neutral Sky, positive background tint), BD #E2E8F0, MUT #71717A, LT #A1A1AA, BLU #1D4ED8, AMB #B45309, GOLD #854D0E, PUR #7030A0. No green or teal is used in the status palette, per the lilly-brand-assets no-green rule.

Tier colors: HIGH = R, MEDIUM = AMB, LOW = POS.
Coverage: Covered = POS, Confirm = AMB, Gap = R.
Positions: RED LINE = R, HOLD FIRM = AMB, TRADE = GOLD, CONCEDE = POS.
Personas: Standard = DK, Collaborative = POS, Aggressive = R, Curious = BLU, Astonished = PUR.

## Typography

Georgia serif for titles, large numbers, and emphasis. Arial for body text, tables, and labels. No other fonts.

## Reusable components

Carry forward from v2.1 (same implementations):
- Metric, Card, STable, Tip, Pill, Badge, Pillar, Gauge

New in v3.0:
- Sub({tabs,active,set}): sub-tab navigation within a panel
- Callout({children,bg,bc}): accent-bordered callout box for narrative blocks
- Src({s}): source citation block
- PositionCard: negotiation position with tier, name, position, rationale, fallback, trade, acceptance, sources

New in v3.2:
- Gauge({value}): semicircular 4-band Protection Score gauge (see Overview below). Was listed above as a carried-forward component but not implemented until v3.2.
- SubHead({title}): small Georgia-serif section label used for folder-tree grouping headers inside the Documents sub-tab.
- retentionClass(type) / evidenceStatus(item): pure lookup functions backing the Documents sub-tab; no chart, deterministic.

## Panel 1: Contract Review

Sub-tabs: **Overview, Risk Heatmap, Findings, Protection & Coverage, Obligations, Vendor Tactics, Documents**

### Overview
- KPI row: Annual Value, Hard Stops, Est. Rounds
- **Protection Score gauge** (MANDATORY, v3.2): a semicircular arc gauge in 4 fixed color bands (0-24 Critical/R, 25-49 High/AMB, 50-74 Moderate/GOLD, 75-100 Low/POS) with a needle at the current score and a tier pill, in a Card to the left of the Score Methodology narrative (two-column layout). This is the canonical rendering of the 0-100 Protection Score; do not render it as a flat number tile.
- **Protection Score Methodology display** (MANDATORY): in the paired narrative card beside the gauge, a compact explanation of how the score was calculated. Must reference: starting point (100), number of Covered categories, Hard Stop count, characterization of HIGH findings, deduction approach (combined-protection-weighted per `references/risk-scoring.md`), and the scale (75-100 Low, 50-74 Moderate, 25-49 High, 0-24 Critical). This prevents "why is the score X?" questions and makes scoring auditable.
- Go/No-Go assessment with conditions before signature
- Governing agreement status block with a three-level signal: Verified (POS / Bold Blue), Caution (AMB / amber), Blocking (R / red). No green is used. Appears on EVERY review.
- MSA coverage summary: compact grid with section references and covered/verify status
- Recommendation block with numbered conditions before signature
- Executive elevator pitch (3 sentences minimum)

### Risk Heatmap
- Scored on COMBINED protection (governing docs + document under review, per Anti-Drift Rule 9 and `references/risk-scoring.md`)
- Combined MSA + WO gap matrix with MSA status, WO gap level, and narrative rationale with section references
- Tier count bar chart
- Every risk category carries the protection source
- **Severity-vs-coverage callout** (v3.2): a short narrative tying the HIGH/MEDIUM/LOW tier counts above to which findings trace to a true Protection & Coverage Gap versus a Covered/Confirm category, so the tier counts and the coverage rollup read as one picture rather than two disconnected tabs.

### Findings
- Grouped by tier (HIGH, MEDIUM, LOW)
- Each finding: ID, topic, evidence, MSA cross-reference, VERIFIED/ASSUMED flag, impact (with dollar amounts), action, category, location in document, SME routing, sources
- Sorted within tier by financial exposure

### Protection & Coverage
- **Covered/Confirm/Gap rollup** (MANDATORY, v3.2): 3 stat tiles (count per status) plus a single stacked-proportion bar (percentage of the 14 categories in each status), immediately above the detail table, paired with a "Coverage posture" narrative callout interpreting what the split means for this review (left/right layout: rollup + bar on the left, narrative on the right).
- 14-category matrix with Covered/Confirm/Gap status and section references
- Separate MSA coverage summary and WO-specific gaps sections

### Obligations
- KPI row: Supplier obligation count, Lilly obligation count, Mutual count, Missing Timeline count
- **Tracked Dates & Deadlines strip** (MANDATORY, v3.2): a horizontally scrollable row of urgency-colored chips, one per obligation, sorted soonest-first by a normalized day-offset, paired with a "Deadline risk" narrative callout (left: chip strip, right: narrative). Continuous/1-2 business day compliance triggers, fixed-calendar deadlines, and open-ended/on-demand obligations are visually distinguished by chip color.
- **Sort toggle** (v3.2): By Party (default; the existing split Supplier/Lilly tables) or By Date (a single combined table sorted by the same day-offset used in the chip strip, with a Who column). Pure client-side re-sort over the existing obligations array; no new data.
- Obligation register table: each obligation shows What, Who, When, Source clause (now paired with the verbatim source sentence it was extracted from, v3.2), Consequence if missed, Type classification (Notice Period, Renewal Window, Audit Right, Insurance Requirement, SLA Reporting, Milestone Deliverable, Compliance Certification, Payment Deadline, Data Obligation, Other)
- Imbalance analysis callout: ratio of supplier vs Lilly obligations, flag if >3:1
- Missing standard obligations callout: list of standard obligations for this contract type that are absent, recommended for negotiation (per Step 6.5)

### Vendor Tactics
- 12-category detection with FLAG/CLEAR/MONITOR status, severity, and triggering text

### Documents (new sub-tab, v3.2)
- KPI row: Documents in Family, Executed/Filed count, Draft/Under Review count, Evidence Awaiting count
- **Document Register**: one row per document across the MSA + WO relationship (MSA, Exhibits, Addenda, WOs, compliance evidence, Risk & Deviation Approval memos, invoices), with Type, Status, Date, Value (only when stated in the document itself; never invented), Owner, and a deterministic Retention class (doc-type to CONTRACT-ACTIVE / SOURCING-RECORD / COMPLIANCE-EVIDENCE / WORKING, always carrying a "draft, confirm with records SME" tag). A List / Folder Tree view toggle re-groups the same rows by folder path; no new data between views. Paired with a "Document family analysis" narrative callout (left: register, right: narrative).
- **Compliance Evidence Checklist**: the fixed required-evidence list for this engagement type (W-9, SOC 2, ISS Questionnaire, Data Escrow Decision Memo, SCC/TIA, Data Residency Screen, Risk Acceptance Memo) checked against the Document Register and marked Filed / Draft / Pending / Awaiting, with the sign-off gate each item blocks. Never marks Filed without a matching document on record. Paired with an "Evidence gate analysis" narrative callout naming which open items block which gate, cross-referencing the same gaps the SME Pre-Engagement brief raises where applicable.
- Sourced from SharePoint/OneDrive where the M365 connector is available; from uploads otherwise, per S1.

## Panel 2: Legal Negotiation

Sub-tabs: **Strategy, Playbook, Position Map, Concession Sequencing, SME Pre-Engagement**

This panel absorbs the core output of the standalone legal-negotiation-prep skill.

### Strategy
- KPI row: Difficulty, Red Lines, Total Positions with distribution, Compliance Leverage
- Opening posture narrative: recommended approach with rationale
- Position distribution: RED LINE / HOLD FIRM / TRADE / CONCEDE stat cards

### Playbook
This is the primary negotiation preparation tool. Each contested or recommended term gets a full playbook card.

**Persona toggle** (MANDATORY): a row of five buttons at the top of the Playbook sub-tab, one per negotiation persona (Standard, Collaborative, Aggressive, Curious, Astonished). Default: Standard. Colors: Standard=DK, Collaborative=POS, Aggressive=R, Curious=BLU, Astonished=PUR. Selecting a persona changes the highlighted argument-tone box on every position card below. The substance (position, arguments, pushback, rebuttal, fallback) never changes; only the tone-framed version of the argument changes.

Brief explainer text below the toggle: "Each position below shows arguments, predicted supplier pushback, your rebuttal, and fallback. Toggle the tone above to see how the same position sounds in each persona. The substance never changes; only the framing."

**Per-term playbook card structure:**
- Dark header bar with term name and acceptance rate (if available)
- Persona-specific argument box (highlighted, colored left border matching selected persona): the selected persona's phrasing of this position's argument. Changes when the user toggles personas.
- Position: the substantive Lilly position
- Arguments: bulleted list of specific supporting points
- Likely Pushback: predicted supplier counter-argument
- Rebuttal: scripted Lilly response to the pushback
- Fallback: what Lilly can accept if the primary position is rejected
- Trade (if applicable): what this position can be traded against

**Persona phrasing rules** (from SKILL.md Persona Selection):
- Standard: professional, factual, playbook-driven. States position clearly with citations.
- Collaborative: partnership framing, mutual benefit. "We'd like to work together to find language that..."
- Aggressive: firm, direct, minimal concession signaling. "This is unacceptable and must be [action]."
- Curious: question-heavy. "Can you help us understand the intent behind...?"
- Astonished: surprise at deviations from norms. "We're surprised to see... given that the industry standard is..."

All five persona phrasings must be pre-generated in the data model during Pass 4. They are not generated on the fly.

### Position Map
- Tiered position cards (HOLD FIRM, STRATEGIC TRADE, EASY CONCEDE)
- HOLD FIRM cards: position, rationale with definition tracing, fallback, acceptance rate, sources
- TRADE cards: position, fallback, trade-against target
- CONCEDE cards: position, why conceding is acceptable

### Concession Sequencing
- Round-by-round strategy with objective, items, framing language, and risk per round
- BATNA and escalation path

### SME Pre-Engagement
- Full SME briefs with background paragraph, specific numbered asks, and urgency
- NOT just a routing table

## Panel 3: Commercial Analysis

Sub-tabs: **Cost Build, Benchmarks, Counter-Proposal, Discount Architecture, Renewal Strategy**

This panel absorbs the core output of the standalone commercial-negotiation-prep skill.

### Cost Build
- Pricing decomposition table and cost waterfall chart
- Per-unit economics (calculated exactly)
- Payment structure with timeline
- Value at risk table
- Assumptions register

### Benchmarks
- Sourced external data with confidence flags
- Internal Lilly data if available
- Per-unit comparison
- RESEARCH PENDING with search log if nothing found

### Counter-Proposal
- Prioritized asks with rationale and priority

### Discount Architecture
- Layer-by-layer analysis (line-item, waived items, volume/commitment discounts)
- What each layer reveals about supplier pricing strategy and Lilly leverage

### Renewal Strategy
- Pricing protection in place (rate locks, CPI caps)
- Governance carry-forward recommendations
- Volume optimization opportunities

## Research minimums (MANDATORY)

External web searches: at least 5. Internal searches: at least 2 (when tools available).

## Anti-patterns

1. No per-run redesign of panels or sub-tabs
2. No vanishing sub-tabs
3. No thin-by-skipping
4. No fabricated depth
5. No risk inflation (score combined protection)
6. No analytical-only output (every dashboard MUST have negotiation positions, concession sequencing, and counter-proposals)

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
| `issues[]` | Every contested term: id, title, category, priority (`hard-stop` \| `high` \| `medium` \| `low`), clause reference, source excerpt, recommended position, supplier position, recommended response |
| `documentConflicts[]` | Trigger (`Conflict` \| `Gap`), term/clause, the documents involved, what is unresolved, and the linked finding id |
| `protection{}` | The protection score, its deductions, and the category grouping that drives the waterfall |
| `obligations[]` | What we have committed to do, with owner and trigger |
| `tacticFlag` | Supplier tactics observed in the redline |

## Where each lands

- `issues[]` drives **Terms & Review > Legal & Protection** (the navigator and
  register), and its `priority` drives the severity filter on
  **Negotiation > Positions**.
- `documentConflicts[]` drives **Terms & Review > Documents & Conflicts**. Keep
  `Conflict` and `Gap` distinct: a conflict between two documents we hold is a
  different problem from a gap where a document is absent, and the panel title
  says so.
- `protection{}` drives the Protection Scorecard. The scorecard groups its
  deductions into the **8 issue categories** and those categories must match
  `issues[].category` exactly, because the scorecard and the register are the
  same object seen twice. Confirmed 2026-07-29; the 26-row literal union was
  considered and rejected.
- `obligations[]` drives the Obligations band of the L&P navigator.

## Held, do not touch

The Protection-Score **deduction kernel is HELD (#114)**. Document around it.
Changing how a deduction is calculated is not a documentation task.

## Preserved, unchanged by D1/D3

All five output modes remain: the redline `.docx`, the Review Summary `.docx`,
the Stack Map, the standalone Dashboard specified above, and the clause/playbook
engine. None of them is affected by contributing a slice to the Deal tab.


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
