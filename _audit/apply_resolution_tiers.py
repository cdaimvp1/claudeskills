#!/usr/bin/env python3
"""
apply_resolution_tiers.py -- one-time script, 2026-07-30 data-source audit follow-through.

Adds a `resolution` object to every source entry across the 4 dashboard panel_sources.json
files, keyed by the source's exact `name` string. The registry is defined once here (built
from live ARIA/SharePoint/web verification done this session) and applied mechanically so
all 191 fields stay consistent instead of hand-edited one at a time.

Read-only sources (bundled reference files, another skill's own output) get a `resolution`
of {"kind": "already_resolved", ...} rather than a tier chain, since there is nothing to
retry -- they either exist or the producing skill needs to be run first.

Re-running this script is safe: it replaces the `resolution` key if present rather than
appending duplicates.
"""
import json

FILES = [
    "category-strategy-1c344a/panel_sources.json",
    "deal-tab-1c344a/panel_sources.json",
    "rfx-hub-1c344a/panel_sources.json",
    "supplier-landscape-1c344a/panel_sources.json",
]

NO_REPO_NOTE = (
    "Not every procurement area has a searchable contract/spend repository the way IT "
    "Procurement does. If SharePoint search returns nothing, do not assume the data does "
    "not exist -- Claude cannot reach Ariba or a file sitting on someone's own desktop. Ask "
    "the user directly whether their documents live in one of those places, and if so, ask "
    "them to attach the specific file(s)."
)

REGISTRY = {
    "Lilly spend data": {
        "tiers": [
            {"tier": 1, "method": "aria", "detail": "aria_fabric_* against Fabric semantic model 'S2P Purchase Order Product' (dataset f2ed9c34-f699-4874-b6ab-b7216fa2dbc0, workspace 4f1d3ee9-1b8e-4f73-a594-c598fdafaf54). Filter by Commodity Codes + Fiscal Year; use prebuilt measures, never custom DAX SUM."},
            {"tier": 2, "method": "m365_search", "detail": "sharepoint_search for an existing spend extract (SHARP/SAP/Ariba export) the user has already saved. " + NO_REPO_NOTE},
            {"tier": 3, "method": "user_upload", "detail": "Ask for a spend extract (Excel/CSV) with columns: Vendor Name (or VENDOR_PARENT2 if rolling up to parent), Commodity Code Name, Cost Center, Fiscal Year, Net Spend (NET_SPEND_IN_USD -- already USD-normalized, do not mix with INVOICE_LOC_AMOUNT)."},
        ],
    },
    "Purchase order and invoice data": {
        "tiers": [
            {"tier": 1, "method": "aria", "detail": "Same Fabric model as 'Lilly spend data' (f2ed9c34) -- PO Item + Posting Date of Invoice tables."},
            {"tier": 2, "method": "m365_search", "detail": "sharepoint_search for a PO/invoice export already saved by the user. " + NO_REPO_NOTE},
            {"tier": 3, "method": "user_upload", "detail": "Ask for a PO/invoice extract with PO number, invoice date, supplier, amount, and open/closed status."},
        ],
    },
    "Vendor master": {
        "tiers": [
            {"tier": 1, "method": "aria", "detail": "aria_sap_describe/aria_sap_ingest against Lilly.CAS/CV_VENDOR_MASTER and related HANA vendor-master views (role FGL__00605 required -- if the user does not have it, this tier fails cleanly, do not guess). The Vendor dimension inside S2P Purchase Order Product (f2ed9c34) does NOT require the extra role and covers vendor-by-spend."},
            {"tier": 2, "method": "m365_search", "detail": "sharepoint_search for a vendor master export already saved by the user. " + NO_REPO_NOTE},
            {"tier": 3, "method": "user_upload", "detail": "Ask for a vendor list with legal entity name, parent company, payment terms, and active status."},
        ],
    },
    "Contract repository": {
        "tiers": [
            {"tier": 1, "method": "m365_search", "detail": "sharepoint_folder_search / sharepoint_search by supplier name. Confirmed working path for IT Procurement: collab.lilly.com/sites/ITSMOGeneral/Shared Documents/General/1.2 IT Vendors/{Vendor}/{Vendor}_Contracts -- other procurement areas likely have a different (or no) equivalent repository; do not assume this exact path applies outside IT Procurement. " + NO_REPO_NOTE},
            {"tier": 2, "method": "user_upload", "detail": "Ask the user to attach the specific MSA / SOW / Order Form / amendment directly. If they say their contracts are in Ariba or on their own desktop, say plainly that Claude cannot reach either and the file needs to be attached here."},
        ],
    },
    "SME review outcome": {
        "kind": "human_only",
        "detail": "No system holds this -- it is the named SME's own written response (Cyber/Privacy/Quality/Legal). Route to the SME per lilly-brand-assets' sme-matrix.md / supplier-risk.md and ask the user to paste or attach the SME's response when it comes back. Never simulate what an SME would say.",
    },
    "Business case funding confirmation": {
        "kind": "human_only",
        "detail": "Finance's confirmation that the work is funded. No system found; ask the user directly or ask them to attach the confirmation email/document.",
    },
    "Supplier deep-dive assessment": {"kind": "another_skill_output", "producing_skill": "supplier-deep-dive-1c344a"},
    "Supplier landscape assessment": {"kind": "another_skill_output", "producing_skill": "supplier-landscape-1c344a"},
    "Evaluation panel scores": {"kind": "another_skill_output", "producing_skill": "evaluation-engine-1c344a"},
    "The RFx pack Lilly issued": {"kind": "another_skill_output", "producing_skill": "rfp-engine-1c344a"},
    "The requirements set for this event": {"kind": "another_skill_output", "producing_skill": "rfp-engine-1c344a"},
    "Should-cost model": {"kind": "another_skill_output", "producing_skill": "should-cost-builder-1c344a"},
    "Lilly MPT playbook": {"kind": "bundled_reference", "detail": "lilly-contract-review-1c344a/references/playbook.md -- always available, no retrieval needed."},
    "Lilly AI Standard": {"kind": "bundled_reference", "detail": "lilly-contract-review-1c344a/references/ai-standard.md -- always available, no retrieval needed."},
    "Lilly Supplier Privacy Standard": {"kind": "bundled_reference", "detail": "lilly-contract-review-1c344a/references/dpa-review-checklist.md -- always available, no retrieval needed."},
    "External market benchmark": {
        "tiers": [
            {"tier": 0, "method": "sharepoint_search_and_extract", "detail": "Lilly's own executed rate cards for this category, via the shared search-and-extract mechanism (see lilly-brand-assets-1c344a/references/sharepoint-search-and-extract.md). This is the BEST source when it exists: Lilly's own negotiated position, not an industry guess. " + NO_REPO_NOTE},
            {"tier": 1, "method": "web_search", "detail": "Live web search against the verified Tier-1/2 whitelist (Janco Associates e-janco.com, Foote Partners footepartners.com, BLS OES bls.gov/oes, Robert Half roberthalf.com, GSA Advantage gsaadvantage.gov, plus category-specific sources in market-rate-benchmarking's external-research-guide.md). Minimum 3 independent searches per rate line per G7; label 'RESEARCH PENDING' if the floor is not met, never present a single data point as a firm benchmark."},
            {"tier": 2, "method": "suppress", "detail": "If neither tier produces enough points to pass percentile_gate(min_points=5), suppress the band per G7/H9 rather than estimating it. State the minimum and what was actually achieved."},
        ],
    },
    "Analyst market research": {
        "tiers": [
            {"tier": 1, "method": "ask_user", "detail": "Confirm once whether Lilly holds a Gartner/Forrester/IDC license reachable in this session. Per G12, never present a Gartner/Forrester/IDC finding as queried unless it was actually accessed this session."},
            {"tier": 2, "method": "user_upload", "detail": "If no license is confirmed, ask the user to provide the specific report or excerpt."},
        ],
    },
    "Supplier public filings": {
        "tiers": [
            {"tier": 1, "method": "aria", "detail": "aria_sec_concept_value (SEC EDGAR, public data, no special role needed beyond an active ARIA session)."},
            {"tier": 2, "method": "web_search", "detail": "If ARIA is unavailable, SEC EDGAR full-text search (efts.sec.gov / sec.gov/cgi-bin/browse-edgar) directly via web_search -- this is public data and does not require ARIA at all."},
            {"tier": 3, "method": "abstain", "detail": "Private companies are not in SEC EDGAR. Do not estimate; state that publicly it cannot be verified, and name PitchBook/D&B as the systems that would cover it if available."},
        ],
    },
    "Public reporting and adverse media": {
        "tiers": [
            {"tier": 1, "method": "web_search", "detail": "Web search against the Tier 1/2 whitelist (SEC/company IR for primary disclosures; Reuters/WSJ/FT/Bloomberg/AP/STAT/Endpoints/FiercePharma/BioSpace for secondary; avoid SEO-farm Tier 3 sources as the sole citation). Every figure carries source, date, and tier."},
        ],
    },
    "OFAC SDN and equivalent watchlists": {
        "tiers": [
            {"tier": 1, "method": "web_fetch", "detail": "ofac.treasury.gov/sanctions-list-service or sanctionslist.ofac.treas.gov/Home/SdnList directly -- fully public, no ARIA or M365 needed. A screen result here is a first read, not a decision-grade clearance; route the actual gating decision to the named SME per supplier-risk.md."},
        ],
    },
    "The contract set under review (MSA, SOW, Order Form, exhibits)": {
        "tiers": [
            {"tier": 1, "method": "teams_site_or_m365_search", "detail": "If this is part of an RFx event with a bound Teams site (see the RFx Teams-site binding pattern), check there first. Otherwise sharepoint_search by supplier name where a contract repository exists. " + NO_REPO_NOTE},
            {"tier": 2, "method": "user_upload", "detail": "Ask the user to attach the documents directly; this is normal and expected for most users."},
        ],
    },
    "Supplier responses to the RFx": {"kind": "rfx_bound_or_upload"},
    "Supplier-provided evidence": {"kind": "rfx_bound_or_upload"},
    "Supplier priced responses": {"kind": "rfx_bound_or_upload"},
    "Supplier pricing submission or quote": {
        "tiers": [
            {"tier": 0, "method": "sharepoint_search_and_extract", "detail": "If a prior rate card/quote from this same supplier exists in the contract repository, surface it as prior-negotiated context (not a substitute for the current live quote). " + NO_REPO_NOTE},
            {"tier": 1, "method": "user_upload", "detail": "Ask the user to attach the current quote/priced response directly -- this is the supplier's own document, not something Claude can search for."},
        ],
    },
    "Agreed rate card": {"kind": "rfx_bound_or_upload"},
}

RFX_BOUND_DETAIL = (
    "This is the counterparty's/bidder's own document, not a Lilly-internal system. For an "
    "RFx event with a Teams site or channel identified (see the RFx Teams-site binding "
    "pattern), check there first via the M365 connector. Otherwise ask the user to attach it "
    "directly."
)


def build_resolution(name):
    entry = REGISTRY.get(name)
    if entry is None:
        return None
    if entry.get("kind") == "rfx_bound_or_upload":
        return {"kind": "rfx_bound_or_upload", "detail": RFX_BOUND_DETAIL}
    return entry


def main():
    total_annotated = 0
    total_skipped = 0
    for path in FILES:
        data = json.load(open(path, encoding="utf-8"))
        for panel in data.get("panels", []):
            for field in panel.get("fields", []):
                for source in field.get("sources", []) or []:
                    name = source.get("name")
                    resolution = build_resolution(name)
                    if resolution is not None:
                        source["resolution"] = resolution
                        total_annotated += 1
                    else:
                        total_skipped += 1
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"wrote {path}")
    print(f"\nannotated {total_annotated} source entries, {total_skipped} had no registry match (should be 0)")


if __name__ == "__main__":
    main()
