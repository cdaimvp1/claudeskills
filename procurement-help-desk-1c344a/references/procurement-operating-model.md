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

Real, direct system URLs below were found and confirmed 2026-07-31 via the
**Source to Pay Home page** (`https://collab.lilly.com/sites/Global_Procurement/
SitePages/Home.aspx`, confirmed by Marc as a genuine, distinct site from the
Playbook -- read live, "SOURCE TO PAY | Supports for Suppliers" hub with quick-
link tiles to BUYING / SUPPLIER LIFECYCLE / INVOICING / PAYMENTS / FRAP POLICY
/ CONTACT PROCUREMENT). This is the richest real systems-map source found so
far; add it as Knowledge Source 6 in both process-navigator and procurement-
help-desk (see each SKILL.md's Knowledge Sources section).

| System | What it does | Who touches it | Connector-reachable? |
|---|---|---|---|
| **BuyLilly** (Ariba front end) | Stakeholder front door: guided buying, PO/requisition creation, PO increase, "Your Requests"/"Your Approvals," Status Hub | Any employee with a buying need; ATC/ATS approvers | Yes, live-read this session |
| **Ariba** (SLP + sourcing + invoicing) | Supplier registration (SLP), RFI/RFP/RFQ events, PO issuance, invoice matching, invoice/PO status. Real guided-buying/sourcing entry points confirmed on the S2P Home page: `https://s1.ariba.com/gb/?realm=lilly-1&locale=en_US` (guided buying) and `https://s3.ariba.com/Sourcing/Main/aw?...&realm=lilly` (sourcing) | Sourcing reps, requisitioners, suppliers | No -- the M365 connector cannot read Ariba's own transactional data; the realm URLs above are real login-gated Ariba entry points, not connector-readable content |
| **SAP** (vendor master, PO/invoice/payment inquiry) | Vendor master record (created after SLP registration approval); legacy (pre-Buy@Lilly) PO tracking. **Real, named inquiry tool confirmed:** `https://srvs4pweb.aws.lilly.com/sap/bc/webdynpro/sap/zwd_arb_inquiry` -- the S2P Home page's own label for this link is "Access SAP Supplier, Purchase Order, Invoice or Payment information," which is very likely the actual tool behind the "Status Hub" name used elsewhere; not independently confirmed identical, but the label match is strong. Also a general SAP Fiori launchpad: `https://srvs4pweb.aws.lilly.com/sap/bc/ui2/flp?sap-client=100#Shell-home`. | Finance, Supplier Management/VMD, requisitioners with SAP access | No -- not M365; these are direct SAP login-gated URLs, named here for completeness, not fetchable as content |
| **LEAH (CLM)** | Contract Lifecycle Management: drafting, redlining, executing MSAs/WOs/SOWs/Order Forms. **Likely real URL found:** `https://cloud22.contractpod.com/elililly/vue-app/index.aspx#/` (ContractPod is a common CLM platform; this was linked from the S2P Home page's contracting area). Not independently confirmed to be branded "LEAH" internally -- flag for confirmation before treating as certain. | Sourcing, Legal (Digital Legal Office) | No -- not M365; login-gated |
| **Aravo (TPRM)** | Third-party record + engagement + Inherent Risk Questionnaire (IRQ); scores inherent risk Limited-to-Significant; assigns due-diligence by domain. **Real buyer-login URL confirmed:** `https://elilillysso.aravo.com/aems/home/buyer/buyerhome.do` | Business/Engagement Owner (submits), TPMO + Risk Domain Partners (manage) | No -- not M365; login-gated. The WwTP "front door" page itself is confirmed on now.lilly.com (`https://now.lilly.com/page/global-working-with-third-parties`, found on the S2P Home page) -- same unreachable-by-connector category as ProtectLilly, not previously confirmed. |
| **ServiceNow** (AI Registry / AIR; also general procurement support) | Registers AI/ML use cases, flags vendor-product AI. **Real Buy@Lilly support-case URL confirmed:** `https://lillygbs.service-now.com/buy_lilly?id=csm_get_help&sys_id=330187591ba2a810a8b033fe034bcb71` -- this is the actual "create a CSM case" / "Get Support" link the Buy@Lilly FAQ referred to only by name. | Business/requester, AI Center / IBU-GenAI; any stakeholder needing support | The support-case URL is login-gated, not fetchable as content, but is a real, correct link to hand a stakeholder |
| **Protect Lilly Chatbot KB** | The actual answer source behind Lilly's CI/PI/data-classification/third-party-security chatbot | Any employee via now.lilly.com's chatbot | The chatbot's own now.lilly.com page is NOT reachable, but its backing SharePoint CSV IS -- see `references/protectlilly-fallback-notes.md` |
| **Adobe Sign / Yammer** | Adobe Sign (`lilly.na2.adobesign.com`) for e-signature; Yammer/Viva Engage groups for Buy@Lilly and general procurement community support | Anyone signing a document; anyone posting a support question in the community | Not tested this pass -- Yammer/Viva Engage content is a different connector surface than SharePoint search and was not attempted |

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
