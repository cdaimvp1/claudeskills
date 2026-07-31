# How Lilly does procurement/sourcing: operating model, roles, systems, flow

Built 2026-07-31 from real site content read live via the M365 connector
(NETWORK-GATED STEP 3). This is the deeper-understanding corpus procurement-
help-desk's Purpose section calls for: not just per-question answers, but the
shape of the whole process, so the skill can place a stakeholder's specific
question in context.

## The operating model in one paragraph

Lilly procurement runs on Source to Pay (S2P): Procurement, Purchase-to-Pay
(P2P), and Working with Third Parties (WwTP) operate as one system. A new
supplier or purchase moves through a lead path (intake -> source/select ->
negotiate -> contract -> raise PR -> ATC/ATS approval -> sign/issue PO) while
several risk reviews (third-party risk, cyber, privacy, AI) and vendor setup
(SAP onboarding) run in parallel. Nothing executes until the hard gates clear:
risk reviews closed, vendor in SAP, contract signed, PO approved under FRAP.
Full detail: `references/buylilly-supplier-onboarding.md`.

## The systems map (what each system is actually for)

| System | What it does | Who touches it | Connector-reachable? |
|---|---|---|---|
| **BuyLilly** (Ariba front end) | Stakeholder front door: guided buying, PO/requisition creation, PO increase, "Your Requests"/"Your Approvals," Status Hub | Any employee with a buying need; ATC/ATS approvers | Yes, live-read this session |
| **Ariba** (SLP + sourcing + invoicing) | Supplier registration (SLP), RFI/RFP/RFQ events, PO issuance, invoice matching, invoice/PO status | Sourcing reps, requisitioners, suppliers | No -- the M365 connector cannot read Ariba's own transactional data; only BuyLilly's SharePoint-hosted guidance pages are reachable |
| **SAP (vendor master, older POs)** | Vendor master record (created after SLP registration approval), legacy (pre-Buy@Lilly) PO tracking | Finance, Supplier Management/VMD, requisitioners with SAP access | No -- not M365; requires direct SAP access |
| **LEAH (CLM)** | Contract Lifecycle Management: drafting, redlining, executing MSAs/WOs/SOWs/Order Forms | Sourcing, Legal (Digital Legal Office) | No -- not M365 |
| **Aravo (TPRM)** | Third-party record + engagement + Inherent Risk Questionnaire (IRQ); scores inherent risk Limited-to-Significant; assigns due-diligence by domain | Business/Engagement Owner (submits), TPMO + Risk Domain Partners (manage) | No -- not M365; the TPRM Front Door page itself was not independently verified reachable this pass |
| **ServiceNow (AI Registry / AIR)** | Registers AI/ML use cases, flags vendor-product AI | Business/requester, AI Center / IBU-GenAI | Not tested this pass |
| **Protect Lilly Chatbot KB** | The actual answer source behind Lilly's CI/PI/data-classification/third-party-security chatbot | Any employee via now.lilly.com's chatbot | The chatbot's own now.lilly.com page is NOT reachable, but its backing SharePoint CSV IS -- see `references/protectlilly-fallback-notes.md` |

## The FRAP financial-authorization layer (governs every transaction regardless of system)

Source: Global Following FRAP Policy, KB2056479, v3.0, effective 2026-02-26,
read in full 2026-07-31 (see the policy text for complete ATC/ATS tables by
level; summarized here):

- **ATC (Authority to Commit):** authority to enter/sign agreements. Held by
  CFO (unlimited) down through CPO ($50M), P6/M4 ($20M), P5/M3 ($15M), P4/M2
  ($4M), P1-P3/M1 ($2M).
- **ATS (Authority to Spend):** authority to approve expenditure of company
  funds. Held by BOD (unlimited) down through CEO ($1B/$200M), M7 ($35M), M6
  ($15M), M5/R12 ($8M), M4/P6/R10-11 ($4M), M3/P5/R7-9/S6-7 ($1M), M2/P4/R4-R6
  ($0.1M), M1/P3/R3 ($0.02M).
- **Procurement engagement threshold:** at or below $200K, Procurement
  engagement is risk/category-based (contact Buy@Lilly or local Procurement
  POC); above $200K, Procurement engagement is mandatory.
- **Renewal/extension:** ATC/ATS approval required only for the new financial
  commitment value, not historical spend.
- **Change in scope:** ATS required for the new total value; ATC required on
  the incremental change; changes over $10M get an AVP (M4) assessment of
  whether it truly constitutes a scope change.
- **Delegation (DATC/DATS):** ATC-holders can delegate within their reporting
  line (exceptions need Procurement M4+ approval); DATS cannot be delegated
  further, expires annually, and delegations to B-level employees or third
  parties are value-capped ($25,000 and $15,000 respectively).

This governs every "why do I need approval for this" and "who can sign this"
question regardless of which system the stakeholder is asking about.

## Contract instrument decision (feeds "which form do I need")

- New strategic supplier, ongoing scope or data access: MSA + Work Order/SOW.
- Work under an existing MSA: Work Order or Order Form only.
- Simple, low-value, one-time, no data: PO Terms and Conditions.

## Information classification (feeds "is this OK to share" / "what CCI level is this")

Per the Protect Lilly chatbot KB (see `references/protectlilly-fallback-notes.md`
for full detail and sourcing): Confidential Information (CI, anything not in the
public domain) and Personal Information (PI, anything identifying an
individual) are classified **Red > Orange > Yellow > Green**, with handling
rules that tighten at each level (e.g., never send Yellow/Orange/Red information
to a personal email). This is the "CCI" flag referenced in the supplier-
onboarding intake step (`references/buylilly-supplier-onboarding.md`) that
drives whether a Cyber Security Review/SAE fires.

## What this corpus does NOT cover (be honest about the boundary)

- Category-specific sourcing strategy content (see category-strategy skill).
- Country/region-specific procurement variants (a few sources reference
  regional hubs, e.g. Iberia; not synthesized here).
- Live system screens (Ariba, SAP, LEAH, Aravo, ServiceNow AIR) -- this corpus
  describes what each system is FOR and who touches it, not how to click through
  it. Screen-level walkthroughs, where they exist, are named in
  `references/buylilly-*.md` files, not reproduced here.
