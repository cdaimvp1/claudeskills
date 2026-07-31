# SharePoint Search-and-Extract (Suite-Wide Shared Mechanism)

Added 2026-07-30, following the suite-wide data-source audit. This is the single source of
truth for one mechanism used by two different needs: finding governing contract documents
(MSA, SOW, Order Form, amendments) and finding a rate-card exhibit buried inside one of
those documents. Both needs use the same steps; only the last step (what you extract once
the document is open) differs.

**Do not require the user to find and upload the file themselves as a first step.** If the
M365 connector is connected, active search comes first; asking the user to manually locate
and attach a specific document is the fallback, not the default.

## When this applies

- `lilly-contract-review`, Deal-feeding skills (`deal-room`): finding the MSA/SOW/Order
  Form/amendments for a supplier under review.
- `commercial-negotiation-prep`, `market-rate-benchmarking` (INTERNAL mode): finding a prior
  executed rate-card exhibit for the same category/supplier, as Tier 0 ahead of any external
  benchmark search.

## The steps

1. **Search by supplier/vendor name and category, not by exact path.** Use
   `sharepoint_search` (content/filename/metadata) and `sharepoint_folder_search` (folder
   name) with the supplier's legal name and any known aliases. There is no single bounded
   location the way an RFx event has a Teams site (see the separate RFx Teams-site binding
   pattern) -- contracts for a given vendor could be anywhere the requesting user's M365
   account can see.

2. **Filter to promising candidates before opening anything.** Prefer filenames/content
   matching: `MSA`, `SOW`, `Order Form`, `Amendment`, `Rate Card`, `Pricing Schedule`,
   `Exhibit`. Do not open every document that merely contains the vendor's name -- for a
   large vendor this can be dozens of files across years of dealings, and opening
   full-document content for each is slow and expensive.

3. **Not every procurement area has an equivalent repository.** IT Procurement's contract
   repository is confirmed live at `collab.lilly.com/sites/ITSMOGeneral/Shared
   Documents/General/1.2 IT Vendors/{Vendor}/{Vendor}_Contracts`. Other procurement areas
   may keep contracts on an individual's own desktop or inside Ariba, neither of which
   Claude can reach (the M365 connector explicitly cannot see Ariba). **A zero-result search
   is not evidence the documents don't exist** -- ask the user directly whether their
   documents live in one of those unreachable places, and if so, ask them to attach the
   specific file(s) rather than continuing to search.

4. **Open the matched document with the correct tool (G1).** Any .docx in the
   contracting-and-negotiations pipeline uses `unpack.py`, never `extract-text` -- tracked
   changes and comments may carry negotiation history that matters. `read_resource` on the
   `file:///{driveId}/{itemId}` URI returned by search gives the full content.

5. **Extract what this specific need requires:**
   - **Contract text need** (lilly-contract-review, Deal): the governing terms themselves --
     read as the primary input to the review, citing clause and section per the skill's own
     workflow.
   - **Rate-card need** (commercial-negotiation-prep, market-rate-benchmarking): locate the
     specific rate-card/pricing-schedule exhibit or table within the document and pull the
     actual figures. This is the category's real, Lilly-negotiated rate -- cite it at G13
     rung 1 (live source, read this run, document name + section + date), which is stronger
     provenance than any external benchmark.

6. **If nothing is found after steps 1-3, stop searching and ask.** Tell the user plainly
   what was searched and found nothing, then ask whether the documents exist somewhere
   Claude cannot reach (Ariba, a personal desktop) and request they be attached directly.
   Never present the absence of a SharePoint hit as "no such contract/rate card exists."
