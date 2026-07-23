# Deal Dashboard — Design Brief (authoritative constraints for the max-effort design pass)

**Purpose:** help a Lilly procurement rep NEGOTIATE a deal. Reference project: `acme` / P-1042 (AI-powered employee-analytics platform, Acme Analytics, sole-source, $1.8M TCO).

**Method (Marc-directed):** synthesize the BEST OF all three sources → dedup → reassess every "best of" element for **keep / merge / compress / redesign**. Do it intentionally; do NOT snap to a tab count.

## The three sources to synthesize
1. **Platform Deal tab** (pv-11/12/13; see `DEAL-TAB-MAP.md`). 3 modes: Negotiate (positions, leverage, concession sequencing, ZOPA, rich pv-12 commercial block), Pro-forma (real P&L/cash-flow matrix, scenarios, sensitivity, TCO teardown, live discount slider), Review (Protection Score, findings, 14-cat coverage heatmap, 12-cat vendor tactics, Go/No-Go). Strong but assumes system access we lack (LEAH push), no scope dimension, no term-evolution map, no comms.
2. **contract-review skill dashboard** (legal + commercial-negotiation panels) — inventory pending.
3. **`_deal_build/deal-dashboard.html`** (recent 5-tab version incl. a "brief" tab) — inventory pending.

## Data reality (design to THIS)
Available: uploaded / SharePoint contracts (MSA, amendments, SOW, change orders), past financials, M365 (email + Teams + calendar), the procurement playbook, relevant web. Widening via ARIA (reaches SHARP + some SAP, growing).
NOT available: LEAH / Ariba / SAP / ServiceNow system state; cannot send emails or take actions; will rarely know exactly where in the process we are, except best-effort **"who has the pen."**
So: search wide → ask for gaps → gap-state the residual (labeled, never zero-fill). Strip any platform panel that assumes unavailable system access (e.g. Push-to-LEAH).

## Marc's rethink requirements (must be honored)
- **Slim term-evolution / conflict document map:** MSA → amendments → SOW → change orders, showing only where terms CONFLICT across docs or a later doc CHANGED an earlier one. NOT emails. Don't over-build it.
- **ZOPA** like the platform's.
- **Merge Ask-vs-Target + Normalized-Line-Items** into ONE place (not three).
- **Real pro-forma / P&L / cash-flow** (reuse platform pv-12), plus the pro-forma-builder additions the platform lacks: WACC-labeled discount control w/ governance band, NPV-vs-rate curve + break-even, payback KPI, savings waterfall vs baseline/incumbent, assumptions register w/ research log + confidence.
- **Communications synthesis replacing Meeting Brief:** synthesize internal + external email/Teams into a traceable thread of asks/positions/commitments + best-effort who-has-the-pen. Traceable to source.
- **Positions grounded in the procurement playbook + term interdependencies + scope.**
- **scope-sow** adds a whole Scope Definition dimension the platform Deal tab lacks entirely (scope score, deliverables register, in/out-of-scope coverage, RACI, SLA/KPI register, milestone-to-payment reconciliation).
- **Reduce redundancy tab-to-tab; fewer tabs/subtabs.** Reconcile contract-review's Commercial Analysis vs the platform's pv-12 commercial block (favor richer, dedupe).

## Build/output constraints
- Self-contained, **Sonnet-generatable** Claude-Desktop artifact: deterministic Python build + a per-run data object (same pattern as the locked Landscape dashboard; the LLM authors only the data object). Reuse the platform pv-* Deal engine where it fits.
- Palette LOCKED: plum #5C2B50 / teal #2F6E6B / burnt-orange #C15E19; critical-red only for gaps/critical. No blue/green.
- **NOT-SoR / reflect-only:** advisory; no vendor selected/contacted; no writes to SAP/Ariba/LEAH/ServiceNow. Never fabricate; provenance-label; gap-state.
- Hub = orchestrator over ONE persisted data object; the 3 lenses (contract-review, scope-sow, pro-forma) run as isolated sub-skills returning bounded slices; generate-once/persist/recall-free.

## Open decisions for Marc (surface in the design, don't pre-decide)
1. Communications: its own tab, or folded into Overview (who-has-the-pen chip up top)?
2. Terms & Review as one combined tab (doc-map + legal + scope), or split scope out?
3. Anything to cut further vs. the platform's mode set.
