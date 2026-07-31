# Invoice / payment status check (vendored snapshot)

Captured 2026-07-31 via live M365 connector read. Fallback tier only; prefer a
live read when the connector is available.

## Primary tool: P2P Status Hub
Source: BuyLilly "Purchase Requisition Create or Maintain" page (contains the
Status Hub instructions and link), read 2026-07-31 (page last modified
2026-06-17).
`https://collab.lilly.com/sites/Buylilly/SitePages/Purchase-Requisition-Create-or-Maintain.aspx`

"The Status Hub is an easy-to-use view for Lilly end users to get information
about the status of a Supplier, Purchase Order (PO), PO Invoice, or Payment."
This is the primary stakeholder-facing tool for "what's the status of my
invoice/PO/payment" questions.

## Supporting detail: Buy@Lilly FAQ (Existing POs section)
Source: `Buy@Lilly Frequently Asked Questions.pdf` /`.docx`, published 2021-05-21
(collab.lilly.com/sites/Global_Procurement/Procurement Documents/Buy@Lilly
Materials/...), read 2026-07-31. **Note the publish date: 2021.** This is an
older document still indexed and current enough that its process description
matches the newer supplier-onboarding source read the same day, but treat any
specific screen/button reference as possibly stale and confirm live if the
stakes are high.

- "Buy@Lilly POs are available on Buy@Lilly under 'Your Requests' or 'Your
  Approvals.' From here you can also print a Buy@Lilly PO."
- If a supplier is not yet on Ariba/Buy@Lilly: "eCommerce can still be used. P2P
  status Hub can help with status of invoices. You can also view POs generated
  by someone else in SAP" (if the stakeholder has SAP access).
- "Will we be able to see invoices posted against PO? ... If you have SAP
  access, you can check the status of invoices in the guided buying collab
  site. If you do not have SAP access, you will need to reach out to the
  relevant accounts payable (AP) team."
- Existing POs created before Buy@Lilly deployment are not trackable within
  Buy@Lilly/Ariba; only POs created through Buy@Lilly/Ariba are trackable there.

## PO Cheat Sheet (creation-time guidance that prevents later status problems)
Source: `Buy-at-Lilly-PO-Cheat-Sheet.pdf`, "Tips, Watchouts & Process Guide for
requestors creating Ariba Indirect POs right the first time, avoid invoicing,
accrual & SAP-sync errors," read 2026-07-31 (multiple copies indexed across
SharePoint sites, most recently modified 2026-07-08).
`https://collab.lilly.com/sites/Buylilly/Shared Documents/Buy-at-Lilly-PO-Cheat-Sheet.pdf`

This full guide was not read section-by-section this pass (only its title/intro
surfaced in search); a live connector read should pull the specific tip most
relevant to the stakeholder's actual invoicing/accrual/sync problem before
answering.

## Who to contact when the status tools do not resolve it
Per the Buy@Lilly FAQ: no SAP access + Ariba status unclear -> contact the
relevant Accounts Payable (AP) team, or the local Buying Desk (for Non-Ariba PO
copies/status).

## What this skill can and cannot do here
Per procurement-help-desk's own Hard Rule 3 / Out of Scope: this skill can NAME
the Status Hub and explain how to read it; it CANNOT pull a live Ariba/SAP
status itself (the M365 connector cannot reach Ariba or SAP). Always answer
"here is where to check" or "here is who to ask," never a live status pull,
unless the stakeholder pastes in what the system already shows them.

## Gaps
- The Status Hub's own direct link/URL was not captured this pass (found via a
  page that references it, not the tool's own landing page). Confirm live.
- The PO Cheat Sheet's line-item tips were not read this pass.
