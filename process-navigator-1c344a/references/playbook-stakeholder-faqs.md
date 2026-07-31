# General stakeholder FAQs (vendored snapshot)

Captured 2026-07-31 via live M365 connector read. Fallback tier only; prefer a
live read when the connector is available.

## Source: Buy@Lilly Frequently Asked Questions ("General" section)
Published 2021-05-21, read in full 2026-07-31.
`https://collab.lilly.com/sites/Global_Procurement/Procurement Documents/Buy@Lilly
Materials/Buy@Lilly Site Training Material/Updated Documents English/Buy@Lilly
Frequently Asked Questions.pdf`

- **Where is the link to Buy@Lilly?** Click the "Buy@Lilly Portal" box on the
  Buy@Lilly LillyNow page.
- **Where do I go for help?** First review the learning materials on the
  Buy@Lilly Support site. For further help, use the Yammer channel, or create a
  CSM (Customer Service Management) case via "Get Support."
- **Is there a mobile app?** Yes - the SAP Ariba App (search "SAP Ariba" in the
  Lilly Self-Service app store). Mobile features approvals and catalog
  purchases only; a full Purchase Requisition cannot be created via the app.
- **Who is impacted / what does Buy@Lilly do?** One-stop shop for purchases
  across categories, guided buying to preferred suppliers, improved approval
  visibility, contract-compliance and TPRM integration.
- **Non-PO / WebDR payments:** unaffected by Buy@Lilly; continue via the
  current Non-PO/WebDR process.
- **8-digit GL account not available in Buy@Lilly:** use the 8-digit GL PO
  template and submit to the Zone 1 (North America) or local (EMEA) Buying
  Desk, who create the PO directly in SAP.

## Source: Global Procurement Playbook Glossary
`https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/SitePages/Procurement-Playbook-Glossary.aspx`
Search-indexed and confirmed to exist (last modified 2025-06-24); full page
content was not retrievable this pass (page read returned NOT_FOUND despite
appearing in search -- see the retrieval-inconsistency note below). Description
from the search index: "a list of commonly used Procurement terms and their
definitions... an evergreen list... updated periodically." Route a stakeholder's
terminology question ("what does ATC mean," "what's a P.Req") here on a live
read; this snapshot cannot vendor its content until a read succeeds.

## Retrieval inconsistency observed this pass (worth knowing before relying on this connector)
Several Playbook 2.0 SharePoint *page* URIs (modern .aspx pages, not files)
returned `itemNotFound` (404) when fetched via `read_resource`, even though they
appear correctly in `sharepoint_search` results with real content snippets and
valid `webUrl`s. This happened for the Playbook Main Page, a Chapter 1 page, and
the Glossary page specifically. By contrast, BuyLilly *pages* (the "How to buy
goods or services" page, the "Purchase Requisition Create or Maintain" page) and
*files* (the FRAP PDF, the Buy@Lilly FAQ PDF) all read successfully. This looks
like a source-specific or page-specific quirk, not a blanket "pages never work"
rule -- but it means a live run should retry a failed Playbook page fetch once,
and if it still fails, fall back to whatever is captured here rather than
assuming the whole Playbook site is unreachable.

## Gaps
- The Playbook Glossary's actual term definitions are not captured here (read
  failed this pass). Confirm live or retry the read before answering a
  terminology question from this snapshot.
