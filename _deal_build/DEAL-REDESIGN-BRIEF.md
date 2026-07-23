# Deal / Contract-Negotiation Dashboard — Redesign Brief (Marc, 2026-07-23)
Authoritative spec for the Deal-dashboard rebuild. Full brief is in the conversation; this is the buildable
condensation. Sequence: AFTER the Landscape R2 deep-dive changes. Grounded, no fabrication, visual-first.

## Reframe (the whole point)
A **self-contained Claude Desktop ARTIFACT**, not a persistent platform. It is a snapshot of ONE Claude analysis
session over the info available then (uploaded contract drafts; related contracts via SharePoint/connector; the
company procurement contract-review PLAYBOOK; company TEMPLATES; M365 MCP; internal finance; internal risk if
available; credible public; user input). Answers: what is being negotiated · what the docs say · risks/gaps/
conflicts · what Lilly should ask for / accept / trade · commercial impact · evidence · what's missing · next move.
Design for MORE data later = **schema-ready, NOT empty/fabricated panels**.

## Artifact CAN / CANNOT (hard constraints)
CAN: show session-gathered info; contract excerpts + citations; playbook/template compare; related-contract
compare; client-side calcs; editable LOCAL assumptions + recalc; filter/sort/expand/collapse; tabs/subtabs; copy
text/table; print; link section-to-section; show evidence per conclusion.
CANNOT (and must NOT imply): access connectors after generation; refresh SharePoint/M365/finance/risk from a
button; monitor email/systems/deadlines; self-update on new redline; persist across sessions; persistent deal
status; assign tasks / route approvals / send emails / push to CLM / register contract / version-of-record / RBAC
/ background checks / notifications / workflow. Buttons limited to: show evidence, expand/collapse, filter, sort,
change assumption, recalc, reset, copy, print, jump-to-issue, jump-to-source. REMOVE any Open-in-CLM / Push /
Assign / Send / Approve / Refresh / Monitor / Register / Finalize buttons.

## Information architecture — 5 primary tabs (no more)
**1. Brief** (no subtabs) — 2-minute pre-meeting readout. Recommended position (stance + 1-para rationale +
conditions + analysis limitations; NO big protection gauge) · Deal snapshot table · Top 5 issues · Commercial
headline · Negotiation boundaries (target/fallback/hard-stop) · Immediate next actions (planning, not tasks) ·
Critical unknowns (<=5).
**2. Contract** — subtabs: **Document Map** (inventory + relationship hierarchy + governing terms + cross-doc
conflict table + missing docs) · **Scope & Performance** (scope in/out, deliverables+milestones table, acceptance
analysis, responsibility/RACI matrix, SLAs+remedies, change control; prominent when SOW exists) · **Terms & Risk**
(the full evidence-based issue register: filterable dense expandable table).
**3. Commercials** — subtabs: **Proposal** (summary + normalized line-item table + cash-flow + commercial terms +
concerns) · **Scenarios** (supplier ask / target / fallback / max-acceptable; scenario table; editable LOCAL
assumptions; sensitivity/tornado; per-scenario narrative) · **Benchmarks** (ONLY when a real comparison source
exists; internal precedent + external, with comparability labels). Consolidates the old Pricing + Pro-forma.
**4. Negotiation** — subtabs: **Positions** (issue/supplier/target/fallback/hard-stop/priority/basis; expand for
detail; ONE recommended position + optional collaborative/direct wording toggle, NOT 5 personas) · **Trade Plan**
(objectives, evidence-based leverage, give-get matrix, concession ladders, 2-3 packages, sequence) · **Meeting
Brief** (objective, agenda 30/60, opening statement, exact asks, questions, expected-pushback table, closing recap;
copy controls).
**5. Sources & Gaps** — subtabs: **Sources** (source inventory w/ IDs DOC-01/PLAYBOOK-01/EMAIL/FIN/WEB; coverage
matrix source x analysis-area) · **Assumptions** (register + classification + impact ranking) · **Missing Inputs**
(ranked critical/important/helpful; gap matrix decision-impact x ease; future-ready list — rendered as list, never
empty charts).

## REMOVE / fix from current
Full Key Issues stack above every tab -> ONE compact persistent summary strip (<=5 values, clickable). Protection
Score as primary -> transparent issue counts (hard stops / high / unresolved / signature conditions). 5 tone
personas -> one position + optional wording toggle. Unsupported acceptance-rate stats (38% · N=24), market
percentiles, should-cost precision, auto hidden-cost multipliers, 12-category vendor-tactics scan -> removed;
genuine tactics fold into the relevant issue with real evidence. Overview/Review/Strategy duplication -> each issue
stored ONCE, rendered differently per tab. Remove platform chrome (nav rail, help/whatsnew/feedback, CLM/workflow/
approval/notification controls).

## Contract-set ADAPTIVE (detect doc set first, build accordingly)
MSA-only (legal protections/ordering/liability/IP/termination/renewal/audit; Scope subtab shows a "no SOW" note) ·
SOW-under-existing-MSA (scope/deliverables/acceptance/deps/change-control + SOW-vs-MSA deviations) · new MSA+SOW
(both + cross-doc conflicts + order of precedence + is negotiated MSA language reflected in SOW) · multiple SOWs
(doc filter + aggregate) · amendment (delta vs base, no separate tab) · renewal (contextual across tabs, no separate
tab).

## Canonical embedded data model (ONE object drives ALL tabs; no duplicated hard-coded facts per tab)
dashboardData = { deal{title,supplier,projectId,analysisDate,negotiationType,recommendation,evidenceCoverage,
snapshotLimitations[]}, documents[{id,name,type,status,date,sourceType,role,relatedTo[],limitations[]}],
issues[{id,title,category,priority,documentId,clause,supplierPosition,sourceExcerpt,playbookPosition,deviation,
impact,recommendedPosition,fallback,hardStop,supplierPushback,recommendedResponse,tradeOpportunity,internalDecision,
evidenceType,sourceIds[]}], scope{objective,inScope[],outOfScope[],deliverables[],milestones[],acceptance[],
dependencies[],serviceLevels[],changeControl[]}, commercialLines[{id,item,supplierAmount,unit,frequency,quantity,
termValue,target,fallback,maximumAcceptable,sourceIds[]}], scenarios[{id,name,values{},total,interpretation}],
benchmarks[{id,item,comparisonValue,sourceId,comparability,explanation}], negotiation{objectives[],leverage[],
giveGets[],concessionLadders[],packages[],sequence[],meetingBrief{}}, assumptions[{id,label,value,classification,
usedIn[],materiality}], gaps[{id,priority,input,whyItMatters,possibleSource,affectedAnalysis[]}], sources[] }.
The SAME issue object drives Brief top-issues + Contract register + Negotiation positions + Meeting Brief + Sources
cross-ref.

## Evidence & uncertainty rules
Every material conclusion carries a visible classification: Contract fact / Internal fact / Public fact / Calculated
/ Claude inference / User assumption / Unavailable. Plain-language "evidence coverage" (Strong/Moderate/Limited),
NOT a numeric confidence %. No unsupported acceptance rates, market percentiles, sample sizes, hidden-cost %,
should-cost precision. Unavailable -> collapse the component + a compact note in a Data-Readiness/Gaps drawer; never
an empty/fabricated panel.

## Visual-first mandate (core requirement, not cosmetic)
A visual analytical WORKSPACE, not organized paragraphs. Communicate via hierarchy / tables / comparison / color-
shading / positioning / charts / interactive controls; narrative SUPPORTS the visuals. Default text limits: no
paragraph > ~3 lines unbroken; clause excerpts/playbook/methodology collapsed by default (accordions/drawers/
expandable rows). Space-efficient: 12-col grid; 8/4, 7/5, 6/6 splits; collapsible right detail rail; sticky
headers; dense readable tables; NO one-metric-in-a-big-card, no big gauges, no decorative charts, no repeated hero
sections, no walls of prose. Progressive disclosure: L1 conclusion (no interaction) -> L2 comparison tables/charts
-> L3 detail on expand. Evidence chips (Contract/Playbook/Template/Internal/Finance/Risk/M365/Public/Assumption/
Inference), status shading (aligned/partial/deviation/signature-condition/decision/missing). Color semantics: deep
red=signature condition/material exposure · amber=issue/decision/uncertain · blue=recommendation/calc/selected ·
green=aligned (sparingly) · gray=unavailable · purple=user assumption/scenario input; color never the only signal;
dark-mode compatible. Chart rules: bars=category compare · lines=over-time · stacked=composition · waterfall=ask->
normalized/negotiated · heatmap=risk-by-category/SLA/source-coverage/RACI-ambiguity · matrix=priority-impact/give-
get/decision-impact-vs-ease/risk-vs-negotiability · timeline=deliverables/milestones/sequence/dates. Avoid pies,
gauges, single-value charts, invented-data charts, complex network diagrams, chart+table saying the same thing.
Interactions: click-chart-to-filter-table, hover-for-value+source, expand rows, evidence side panel, edit
assumptions+recalc+reset, search/sort/filter, copy, jump issue<->source, native print, preserve tab/filter state.
No fake save/refresh/workflow/system buttons.

## Acceptance criteria (done when)
Single self-contained HTML, no external files, no runtime connector calls. Exactly 5 primary tabs (Brief / Contract
/ Commercials / Negotiation / Sources & Gaps) with the subtabs above (Benchmarks only when supported). Full issue
register NOT above every tab. Pricing+Pro-forma consolidated; Review folded into Contract+Sources; Scope/SOW fully
represented. Every material issue has an evidence reference; every material number identifies source/assumption.
Unsupported benchmarks/acceptance-rates/confidence-%/vendor-tactic classifications removed. No buttons implying
system push/workflow/approval/send/monitor/CLM. No empty future-data panels; future sections render only when data
exists. Same issue NOT hard-coded differently across tabs. Editable assumptions labeled LOCAL. Brief readable in
~2 min; Meeting Brief copy-ready. States it's a session snapshot. Visual-first acceptance: no tab opens as a wall
of text; each substantive tab has >=1 useful interactive analytical element; tables for comparisons, charts for
numeric patterns, matrices for 2-D decisions, timelines for ordered dates; evidence traceable; desktop width used.

## Design language (Marc, LOCKED)
Even though it's artifact-not-platform (no fake chrome/workflow/CLM), it MUST match the platform Deal tab's DESIGN
STYLE like every other dashboard: platform card style (.sa-card / .card-hd icon+title), platform typography, and the
platform PANEL palette = **PLUM (--ai #5C2B50) OR TEAL (--teal-d #2F6E6B) primary + BURNT ORANGE emphasis/attention**;
<=3 colours (shades OK), colour does a job; functional severity colours (red reserved for critical) only where meaning
requires. Applies to ALL dashboards' panel colour/shading. The brief's "remove platform" = remove fake system
ACTIONS/CHROME, NOT the visual design family.

## Build note
This is a GROUND-UP purpose-built artifact, NOT a bundle of the platform's Deal tab (deal-acme-PLATFORM.html bundles
pv-11/12/13 platform render + chrome — that's the platform-bundle approach used for Landscape/Deal so far). This
brief explicitly wants artifact-not-platform, so the new Deal dashboard is built fresh from ONE dashboardData model
(mirrors the pvAssess-spine philosophy). Demo needs a realistic sample contract set (e.g. Visier MSA + SOW, the
fullest case) with illustrative-but-classified data honoring the evidence rules. Self-contained HTML; Python
builder can assemble from a data.json + static shell (token-lean generation) like the other bundles.
