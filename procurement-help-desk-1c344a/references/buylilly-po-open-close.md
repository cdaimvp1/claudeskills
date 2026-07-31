# PO open / close / change (vendored snapshot)

Captured 2026-07-31 via live M365 connector read. Fallback tier only; prefer a
live read when the connector is available.

## Source: Buy@Lilly Frequently Asked Questions ("Existing Purchase Orders" and
"Purchase Order (PO) Increase" sections)
Published 2021-05-21, read in full 2026-07-31.
`https://collab.lilly.com/sites/Global_Procurement/Procurement Documents/Buy@Lilly
Materials/Buy@Lilly Site Training Material/Updated Documents English/Buy@Lilly
Frequently Asked Questions.pdf`

**Opening/changing a PO:**
- Requisitioners are responsible for making changes to their own POs (delivery
  date, value) -- not a central P2P team.
- A change in date or a reduction in value does NOT require PO reapproval.
- An INCREASE in value DOES require reapproval.
- To increase a PO created in Ariba: locate the original Purchase Requisition
  under "Your Requests," select "Change Request." This opens a V2 of the
  P.Req; add funds to an existing line or add a new line. Subject to approval.
- An old SRM/SAP PO cannot be increased in Ariba; a separate Non-Ariba PO
  increase process applies (guidance lives in Buy@Lilly Training Documentation
  on Buy@Lilly Support).

**Closing a PO:**
- PO closures are driven by item-level "Need-by-Dates" (material POs) or
  item-level Service End dates (service POs).
- The Need-by-Date represents when the material/service is expected to be
  delivered/received, and it CAN be changed.
- Requisitioners should review their own open POs monthly to confirm the
  delivery/expense timing is still accurate and close out POs once all
  invoices are received (this is the EMEA PO-accrual review process named in
  the source; the requisitioner or P.Req creator makes the change themselves
  for Ariba POs, not the DXC/PPA team).
- Existing (pre-Buy@Lilly) POs do not need to be recreated; suppliers can keep
  invoicing against them until naturally exhausted, but the requestor cannot
  review THEIR status inside Buy@Lilly/Ariba (only Buy@Lilly/Ariba-created POs
  are trackable there; check SAP directly for older POs, per
  `buylilly-invoice-status.md`).

## What this skill can and cannot do here
This skill can explain the mechanics above and name where to go (Buy@Lilly
"Your Requests," SAP, the local Buying Desk). It cannot open, close, or change
a PO itself; that is the stakeholder's own action to take in Buy@Lilly/Ariba
or SAP (see Out of Scope in SKILL.md).

## Gaps
- The PO Cheat Sheet (`Buy-at-Lilly-PO-Cheat-Sheet.pdf`) likely has more
  current, PO-creation-specific guidance on avoiding sync errors that affect
  later close-out; not read section-by-section this pass (see
  `buylilly-invoice-status.md` Gaps).
- This FAQ source is dated 2021; confirm no newer PO-lifecycle process change
  has superseded the increase/close mechanics above before treating this as
  current without a live read.
