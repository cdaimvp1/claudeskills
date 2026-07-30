#!/usr/bin/env python3
"""
deepdive_traits.py -- compose-by-traits panel selection (A6, spec:153-156).

THE PROBLEM A6 SOLVES
---------------------
"Lilly contracts an ENTITY, evaluates an OFFERING, depends on specific SERVICES: three
different things" (spec:36). A single layout cannot sensibly evaluate Snowflake (a public
company), Databricks (private), and BigQuery (a product inside Google). Forced through one
template, the private company gets empty market-cap fields and the hyperscaler product gets
standalone financials it does not have.

An empty field invites someone to fill it. That is how fabrication starts.

THE DISTINCTION THAT MATTERS, AND THE ONE THIS FILE EXISTS FOR
--------------------------------------------------------------
A panel can be absent for two completely different reasons, and they must never look alike:

  OMIT_BY_TRAIT   this supplier type HAS no such thing. BigQuery has no standalone
                  balance sheet. There is nothing to find, and asking for it is a
                  category error.
  GAP             the thing exists and nobody has found it yet. That is a research
                  action, and it renders as a stated information requirement.

Collapsing them is a real failure in both directions. Show a gap where there is a trait
omission and you send someone hunting for a document that cannot exist. Show a trait
omission where there is a gap and you quietly excuse missing work.

So a trait-omitted panel is not silently dropped: it renders a one-line note saying the
panel does not apply to this supplier type and why. Absence is stated either way; only the
REASON differs.

ONE BASE, COMPOSED BY TRAITS
----------------------------
There is one layout. Traits add and remove panels from it. There is deliberately no
"public dashboard" and "private dashboard" variant, because variants drift apart and then
a fix has to be made three times.

Stdlib only.
"""
from __future__ import annotations

ENTITY_TYPES = ("public", "private", "hyperscaler_product")

# Every panel in the six subtabs, and the entity types it applies to.
# A panel absent from a type's list is OMITTED BY TRAIT, with the stated reason below.
PANELS = {
    # subtab 1
    "ownership_tree": ENTITY_TYPES,
    "company_scale": ENTITY_TYPES,
    "identity_matrix": ENTITY_TYPES,
    "footprint": ENTITY_TYPES,
    # subtab 2
    "capability_matrix": ENTITY_TYPES,
    "delivery_readiness": ENTITY_TYPES,
    "references": ENTITY_TYPES,
    "dependencies": ENTITY_TYPES,
    # subtab 3
    "financial_trend": ("public", "private"),
    "financial_bridge": ("public", "private"),
    "peer_position": ("public", "private"),
    "commercial_drivers": ENTITY_TYPES,
    "parent_financials": ("hyperscaler_product",),
    # subtab 4
    "risk_matrix": ENTITY_TYPES,
    "material_events": ENTITY_TYPES,
    "mitigations": ENTITY_TYPES,
    # subtab 5
    "lilly_fit": ENTITY_TYPES,
    "internal_history": ENTITY_TYPES,
    "diligence": ENTITY_TYPES,
    "actions": ENTITY_TYPES,
}

# Why a panel does not apply. Written for the reader of the dashboard, not for a developer,
# because this text is what stops someone going to look for a document that cannot exist.
OMISSION_REASON = {
    ("financial_trend", "hyperscaler_product"):
        "This supplier is a product inside a larger parent, so it has no standalone "
        "financial history. Financial viability is assessed at the parent.",
    ("financial_bridge", "hyperscaler_product"):
        "No standalone financials exist for a product within a parent company. The "
        "parent's position is assessed instead.",
    ("peer_position", "hyperscaler_product"):
        "Peer financial positioning is not meaningful for a product inside a parent; the "
        "comparison that matters is capability, which is on Capabilities and Operations.",
    ("parent_financials", "public"):
        "This is a standalone public company, so its own financials are the relevant ones.",
    ("parent_financials", "private"):
        "This is a standalone private company, so its own financials are the relevant ones.",
}


class TraitError(Exception):
    pass


def traits_for(entity_type):
    """Resolve a supplier's entity type. Refuses an unknown type rather than guessing.

    Guessing would silently pick a layout, and the wrong layout is exactly what produces
    the empty fields this whole mechanism exists to prevent.
    """
    et = (entity_type or "").strip().lower().replace(" ", "_").replace("-", "_")
    if et not in ENTITY_TYPES:
        raise TraitError(
            "entity_type %r is not one of %s. The layout is composed from the entity "
            "type, so an unknown type cannot be rendered: it would silently fall back to "
            "a layout that asks for evidence this supplier may not have."
            % (entity_type, " / ".join(ENTITY_TYPES)))
    return et


def applies(panel, entity_type):
    if panel not in PANELS:
        raise TraitError("unknown panel %r; add it to PANELS so its applicability is "
                         "declared rather than assumed" % panel)
    return entity_type in PANELS[panel]


def omission_note(panel, entity_type):
    """The reader-facing reason a panel does not apply. Never empty for an omitted panel."""
    if applies(panel, entity_type):
        return None
    reason = OMISSION_REASON.get((panel, entity_type))
    if not reason:
        # A declared omission with no stated reason would render as an unexplained
        # absence, which is the thing this module exists to prevent.
        raise TraitError(
            "panel %r is omitted for entity type %r but no reason is declared in "
            "OMISSION_REASON. An unexplained absence is indistinguishable from an "
            "oversight." % (panel, entity_type))
    return reason


def disposition(panel, entity_type, has_data):
    """RENDER, OMIT_BY_TRAIT or GAP.

    The three-way return is the whole point. `has_data` only decides between RENDER and
    GAP; it can never turn a trait omission into a gap, because a category error is not
    a research action.
    """
    if not applies(panel, entity_type):
        return "OMIT_BY_TRAIT"
    return "RENDER" if has_data else "GAP"


def layout(entity_type):
    """The composed panel list for one entity type: what renders, what is omitted and why."""
    et = traits_for(entity_type)
    rendered = [p for p in PANELS if applies(p, et)]
    omitted = [(p, omission_note(p, et)) for p in PANELS if not applies(p, et)]
    return {"entity_type": et, "panels": rendered, "omitted": omitted}
