# Landscape Intake Schema -- supplier-landscape → rfp-engine

> **SOURCE OF TRUTH. Do not hand-edit any copy of this schema.**
>
> This file is the single source of truth for `landscape_handoff.json`.
>
> Ownership here sits with the CONSUMER (rfp-engine), which is the opposite of the
> convention used for `case_handoff.json`, where the producer owns the schema. That is
> deliberate and both skills already agree on it: `supplier-landscape-1c344a/SKILL.md:310`
> and `:322` say plainly that the schema "lives in the rfp-engine skill, which is the
> consumer of this handoff". The reasoning is that the consumer is the party that breaks
> when the shape is wrong, so it defines what it can ingest.
>
> `supplier-landscape-1c344a` carries an inlined **Market Context Schema** as a
> self-describing FALLBACK, used only when rfp-engine is not installed, so the handoff is
> still complete standalone. That fallback is a copy, not a second authority. If this
> schema changes, check that fallback in the same commit.
>
> **The suite uses both ownership conventions and now says so per schema.** Producer-owns
> for `case_handoff.json`, consumer-owns here. Neither is wrong, but a reader cannot infer
> which applies, so every shared schema states its owner in a header like this one rather
> than leaving it to be worked out from the direction of the arrow.

Schema for `landscape_handoff.json`. Produced by supplier-landscape at the end of Step 5. Consumed by rfp-engine when landscape outputs are provided as input.

---

## Schema

```json
{
  "schema_version": "1.0",
  "generated_by": "supplier-landscape",
  "generated_at": "ISO-8601 datetime",
  "case_id": "string -- optional, from upstream case manager",
  "category": "string -- sourcing category name",
  "sourcing_domain": "string -- Enterprise SaaS | Professional Services | Lab Services | Equipment | Chemicals | Facilities | Construction | Marketing | Contingent Labor | Logistics | Other",

  "market_context": {
    "porter_forces": {
      "rivalry": { "level": "High | Medium | Low", "summary": "string" },
      "barriers_to_entry": { "level": "High | Medium | Low", "summary": "string" },
      "substitutes": { "level": "High | Medium | Low", "summary": "string" },
      "buyer_power": { "level": "High | Medium | Low", "summary": "string" },
      "supplier_power": { "level": "High | Medium | Low", "summary": "string" }
    },
    "market_size": { "value": "string", "source": "string", "confidence": "High | Medium | Low" },
    "pricing_trend": { "direction": "Deflationary | Stable | Inflationary", "range": "string", "detail": "string" },
    "key_trends": [{ "title": "string", "detail": "string", "impact_on_lilly": "string" }],
    "key_risks": [{ "title": "string", "detail": "string" }],
    "research_date": "ISO-8601 date",
    "sources_consulted": ["string"]
  },

  "suppliers": [
    {
      "supplier_id": "string -- SUP-01, SUP-02, etc.",
      "supplier_name": "string",
      "headquarters": "string",
      "employee_count": "string or null",
      "internal_vendor_status": "Active | Former | None | Unknown",
      "existing_contract_ref": "string or null",
      "core_offering_summary": "string",
      "alignment_to_need": "Strong | Moderate | Weak",
      "known_risks": {
        "legal": "string or null",
        "cybersecurity": "string or null",
        "operational": "string or null",
        "geopolitical": "string or null",
        "esg": "string or null"
      },
      "pricing_model": "string or null -- only if publicly disclosed",
      "industry_experience": "string",
      "integration_fit": "string",
      "recommendation": "Top 3 | Include in RFP | Evaluate | Eliminate",
      "elimination_reason": "string or null",
      "inferred_requirements": [
        {
          "requirement": "string -- capability inferred from supplier research",
          "source": "Supplier Landscape Analysis",
          "priority": "Must Have | Should Have | Nice to Have",
          "rationale": "string"
        }
      ]
    }
  ],

  "recommended_shortlist": ["supplier_id array -- user-confirmed suppliers for RFP"],
  "eliminated": ["supplier_id array -- with reasons in supplier objects"],
  "next_action": "Proceed to RFP | Run POC | Engage Incumbents | Re-scope | Eliminate Category"
}
```

---

## rfp-engine Consumption Rules

When rfp-engine receives this handoff:

1. **Supplier list** -- pre-populate the invitation email(s) (delivered via `message_compose`) with suppliers from `recommended_shortlist`. Do not include eliminated suppliers. If vendor contacts are not in the handoff, collect them during Step 3.
2. **Inferred requirements** -- merge `inferred_requirements` from all shortlisted suppliers into the requirements matrix. Mark source as "Supplier Landscape Analysis". De-duplicate overlapping requirements across suppliers.
3. **Market context** -- use `market_context` to enrich Section 1.1 (Background) of the instructions document with market dynamics. Pre-load into the instructions doc's project-specific section.
4. **Risk flags** -- carry `known_risks` into the RFP Instructions Section 4 demo scenarios as areas to probe during supplier presentations, and into `demo_evaluation_guide.docx` as scoring considerations.
5. **Integration fit** -- if any supplier flagged integration concerns, auto-include the Data & Integration Landscape optional section (2.4) in the instructions document.
6. **Incumbent handling** -- if any supplier has `internal_vendor_status: "Active"`, trigger the incumbent handling logic in rfp-engine.
7. **User confirmation required** -- before generating the RFP package, confirm the shortlist: "The landscape identified [N] suppliers for the RFP. Confirm the list or tell me which to add/remove."

## supplier-landscape Production Rules

supplier-landscape must produce this file as part of its Step 5 outputs alongside the report and CSVs. The `recommended_shortlist` array is populated only after the user confirms which suppliers to include. If the user has not confirmed, leave it empty and set `next_action` to the appropriate recommendation.

---