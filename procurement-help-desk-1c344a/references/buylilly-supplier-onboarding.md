# Supplier onboarding (vendored snapshot)

Captured 2026-07-31 via live M365 connector read. Prefer a fresh live read when
the connector is available; this is the fallback tier only.

## Primary source
"Kicking Off Sourcing for a New Supplier" (Tech@Lilly, Global IT Procurement,
prepared 2026-06-10, internal reference), read in full 2026-07-31.
`https://mydrive.lilly.com/personal/lane_marc_lilly_com/Documents/Desktop/Claude Skills/New_Supplier_Sourcing_QuickRef.docx`
(a OneDrive-hosted internal reference doc, not a BuyLilly/Playbook page directly,
but itself grounded in and citing the Intake Ecosystem map, Working with Third
Parties guides, AI Registry job aid, Supplier Management FAQ, Privacy/SAE process
pages, and Procurement Playbook 2.0, all read by its author 2026-06-10).

## The seven-gate path

Bringing on a new supplier runs through Source to Pay (S2P): Procurement,
Purchase-to-Pay, and Working with Third Parties (WwTP) operate as one system.
Most gates run in PARALLEL, not in sequence. A few gates are hard: the supplier
cannot transact until risk reviews are closed, the vendor exists in SAP, the
contract is signed, and the PO is approved under FRAP.

**Lead path (sequential):**
1. **Intake** - submit through the Software Sourcing Intake (Power App backed by
   a SharePoint list). Routes to a Sourcing Rep. Set the data-sensitivity (CCI)
   classification here; it drives the Cyber review.
2. **Source and select** - run the competitive event the spend requires (RFI/RFP/
   RFQ in Ariba). Procurement Playbook 2.0 Chapter 3 sets bidding thresholds.
3. **Negotiate** - settle pricing/terms; pull in the Digital Legal Office for
   redlines; escalate any Hard Stop early.
4. **Draft the contract** - choose the instrument (see below), build it in the
   CLM (LEAH). New strategic suppliers with ongoing scope/data access need an
   MSA plus a Work Order.
5. **Raise the PR, then ATC/ATS** - create the purchase requisition in Ariba.
   Authority to Commit / Authority to Sign route by value under FRAP. Hard gate.
6. **Sign and issue the PO** - execute the contract, release the PO. Supplier is
   now active. Final hard gate.

**Run in parallel (start early; must clear before the PR):**
- **WwTP / TPRM (Aravo)** - add the third party (TPRM Hub approves the record),
  add the engagement, complete the Inherent Risk Questionnaire. Aravo scores
  inherent risk Limited-to-Significant and assigns due-diligence assessments by
  domain (information security, privacy, anti-corruption, quality).
- **SAP onboarding (Ariba SLP to vendor master)** - supplier completes the
  Supplier Registration Form (bank, tax/W-9, addresses); Procurement (category
  owner) and Finance approve; SAP vendor master record is created. Mandatory for
  every supplier regardless of value. ERP Vendor ID flows back to Ariba in 1-2
  business days.
- **Cyber Security Review / SAE (Global Information Security)** - triggered by
  SaaS, CCI-sensitive data, or any new vendor.
- **Privacy Assessment (Digital Legal Office)** - triggered when the supplier
  touches Personal Information. Flow: PTA -> DPIA -> cross-border determination
  (CBDT). This is the dependency hub for the other reviews (see Hard gates below).
- **AI Registry / AIR (AI Center)** - triggered by any AI/ML capability. Register
  the use case on ServiceNow, flag it as a vendor product.

## Choosing the contract instrument
- New strategic supplier, ongoing scope or data access: MSA plus a Work Order/SOW.
- Work under an existing MSA: a Work Order or Order Form only.
- Simple, low-value, one-time, no data: PO Terms and Conditions.

## Where to submit each gate, and who owns it

| Gate | Who submits | Who manages | Who ensures completion | Where to go |
|---|---|---|---|---|
| Intake | Business/requester | Tech@Lilly Procurement | Business | IT Sourcing Home |
| WwTP/TPRM | Business (Engagement Owner) | TPMO + Risk Domain Partners | Business | TPRM Front Door |
| Cyber Review (SAE) | Business/requester | Global Information Security | Business | SAE review landing |
| Privacy | Business/requester | Digital Legal Office | Business | DLO Privacy Program |
| AI Registry (AIR) | Business/requester | AI Center / IBU-GenAI | Business | ai.lilly.com |
| SAP Onboarding | Business/Sourcing | Supplier Management / VMD | Business | Buy@Lilly (Ariba SLP) |
| Contracting | Sourcing Rep | Sourcing + Contracts COE | Sourcing/Legal | CLM (LEAH) |
| Ariba PR + ATC/ATS | Business (requisitioner) | Procurement Operations | Finance (ATC/ATS) | Buy@Lilly |

## Hard gates and dependencies
- Privacy needs WwTP first: the PTA's third-party question requires a WwTP risk
  review on file before it can close.
- Privacy fans out: a "yes" on AI launches an AI assessment inside the Privacy
  workflow; a cross-border "yes" triggers CBDT.
- Cyber depends on data class and risk rating: the intake CCI flag and WwTP
  inherent-risk level set what the Cyber review and contract addenda require.
- The PR needs SAP and WwTP done: the Ariba requisition cannot be raised until
  the vendor exists in the SAP vendor master AND WwTP is complete.
- Execution needs everything: contract signature and PO release require all
  upstream gates cleared and the PR approved under FRAP.

## Who to call (SME escalations, as named in this source)
- Third-party risk: your TPMO contact (aligned by area: Corporate G&A, Legal,
  LillyUSA G&A, IBU G&A, Global IDS, Global LRL, Global Manufacturing and Quality).
- Cyber: the BISO for your area, through Global Information Security.
- Privacy: `Mailbox_Privacy_Contracts@lilly.com`
- AI: the AI Center / IBU-GenAI team.
- Supplier setup and vendor master: the Supplier Management team and VMD,
  through Buy@Lilly support.
- Sourcing strategy and contract: your Sourcing Rep and the Contracts COE.

## Confidence and gaps (as stated by the source document itself)
The source document states its own confidence: "high on structure, roles,
owners, sequence, and front-door pages; medium on tool-screen specifics and
thresholds." It explicitly notes FRAP value thresholds and ProtectLilly were NOT
re-read by that document's author; this snapshot's own read of the FRAP PDF (see
`references/procurement-operating-model.md`) fills the FRAP threshold gap, but
ProtectLilly itself remains unread (confirmed unreachable via the M365 connector;
see `references/protectlilly-fallback-notes.md`).

This snapshot did not independently re-verify each named front-door link
(IT Sourcing Home, TPRM Front Door, SAE review landing, DLO Privacy Program,
ai.lilly.com) resolves; it reports what the source document names. Prefer a live
read to confirm a specific link still works before telling a stakeholder to go
there.
