# Where to start a buy (vendored snapshot)

Captured 2026-07-31 via live M365 connector read. Use this when the live connector
is unavailable; prefer a fresh live read when possible (policy and thresholds change).

## Source: BuyLilly "How to buy goods or services"
`https://collab.lilly.com/sites/Buylilly/SitePages/How-to-buy-goods-or-services.aspx`
Read 2026-07-31 (page last modified 2026-07-20).

**This page is a navigation hub, not a single article.** It is a banner plus a grid
of link-tiles pointing to deeper pages/documents. The tiles present (as of the
2026-07-31 read):
- Ariba Guided Buying
- Employee Expense Reporting
- Meeting Navigator
- Non-PO (Purchase Order) Invoicing US
- Non-PO (Purchase Order) Outside the US
- Web DR Process
- HCP/HCO Payment
- Video: Buy@Lilly Introduction & Navigation
- Ariba Access
- Cross Border Buying
- Buy@lilly FAQ (Frequently Asked Questions)
- Changing Ariba Default Language
- How to use the Status Hub
- Buy@Lilly Mobile (Ariba)
- PO Cheat Sheet

**Implication for answering a "where do I start" question:** identify which tile
matches the stakeholder's actual need (a new buy vs. an expense report vs. a non-PO
payment vs. checking a status) and cite that specific linked page/document, not
just this hub page. See `references/procurement-operating-model.md` for the
broader Source-to-Pay flow this hub sits inside.

## Threshold that determines whether Procurement must be engaged
Source: Global Following FRAP Policy (KB2056479, v3.0, effective 2026-02-26), section 2.1.
Full text read 2026-07-31 (see `references/procurement-operating-model.md` for the
complete FRAP ATC/ATS threshold tables).

- For spend at or below $200K: Procurement engagement is based on risk and
  category/contracting strategy. Contact `Buy@Lilly` or the local Procurement
  Point of Contact to confirm the right level of engagement.
- For spend greater than $200K: Procurement MUST be engaged.
- The business owner/budget holder must involve Procurement as soon as a business
  need is identified, and before contacting suppliers.
- Procurement transactions must go through a formal agreement (PO or contract)
  through the relevant system before any written commitment is made to a third
  party.

## Where "how to buy" work actually happens
Per the FRAP policy text (same source): the front door for procurement transaction
guidance is `Buy@Lilly Support - Home`. Detailed transaction execution runs through
Ariba (via BuyLilly) for POs/requisitions, and through the S2P sourcing path
(intake -> source/select -> negotiate -> contract -> PR/ATC-ATS -> sign/issue PO)
for anything requiring a competitive process or new supplier. See
`references/buylilly-supplier-onboarding.md` for that full path.

## Gaps / not yet captured
- The individual linked pages behind each tile above (Ariba Guided Buying detail,
  Cross Border Buying, HCP/HCO Payment, Web DR Process) were not individually read
  this pass. If a stakeholder's question maps to one of these specifically, the
  live connector should fetch that specific linked page rather than relying on
  this snapshot, which only captures the hub's tile list and the FRAP threshold.
