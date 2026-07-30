#!/usr/bin/env python3
"""
deepdive_viz.py -- data-driven visualization selection (DEEP-DIVE-REDESIGN-SPEC-v3:136-145).

WHY THIS IS CODE AND NOT A GUIDELINE
------------------------------------
The spec's closing instruction is "Never fabricate a network/trend/map from weak web
references" (spec:145). That is the single most likely way this dashboard produces
something false: not by stating a wrong fact, but by DRAWING a shape that implies evidence
nobody has. A trend line across one data point invents a direction. A map drawn from a
country of domicile invents a delivery footprint. An ownership tree with one node invents
a structure that was never researched.

So the choice of visualization is made here, from what the data can actually support, and
every choice carries the REASON it was made. The reason is rendered on the page, because a
reader who sees a metric card where they expected a trend should be told why.

Each chooser returns (kind, reason). The caller renders `kind` and prints `reason`. There
is no branch that returns a rich visual when the supporting data is absent.

Stdlib only.
"""
from __future__ import annotations


def choose_trend(periods):
    """spec:107, 137. A line chart needs at least three comparable dated periods.

    The fallback ladder is the spec's, not invented here: 3+ -> line, 2 -> directional
    bars, 1 -> metric card, 0 -> a card naming the information required. Two points make a
    slope, not a trend, and one makes nothing at all.
    """
    periods = periods or []
    metrics = set((p.get("metric") or "").strip() for p in periods)
    dated = [p for p in periods if (p.get("source_date") or "").strip()]

    if len(periods) >= 3 and len(metrics) == 1 and len(dated) == len(periods):
        return "line", "three or more comparable dated periods of the same metric"
    if len(periods) >= 3:
        return ("bars",
                "three or more periods, but they are not a single consistently dated "
                "metric, so a trend line would imply a comparability the data does not "
                "have")
    if len(periods) == 2:
        return "bars", "two periods: direction can be shown, a trend cannot"
    if len(periods) == 1:
        return ("card",
                "a single data point. A line through one point would invent a direction")
    return "required", "no dated financial periods captured"


def choose_ownership(ownership):
    """spec:140. A tree is warranted only when there is a structure to show.

    Drawing a one-node tree for a widely held public company is decoration that implies
    research nobody did. When it is not warranted the identity-verification matrix carries
    the section instead, which is the honest answer to "who is this".
    """
    o = ownership or {}
    nodes = o.get("nodes") or []
    if len(nodes) > 1:
        return "tree", "more than one entity in the corporate chain"
    if o.get("contracting_entity_differs"):
        return "tree", "the contracting entity differs from the brand or product"
    if o.get("ubo_required") and (o.get("ubo_status") or "") != "Verified":
        return "tree", "ultimate beneficial ownership is required and unresolved"
    reason = ("a single known entity with no unresolved beneficial ownership. A one-node "
              "tree would imply a structure that was never researched")
    if (o.get("subsidiaries_status") or "") == "Data source required":
        reason += "; the subsidiary structure is stated as required, not drawn"
    return "matrix-only", reason


def choose_map(locations):
    """spec:139. A map needs real delivery-relevant locations, not a country of domicile."""
    loc = locations or {}
    entries = loc.get("entries") or []
    if entries:
        return "schematic", "%d delivery-relevant location%s identified" % (
            len(entries), "" if len(entries) == 1 else "s")
    return ("required",
            loc.get("note")
            or "no delivery-relevant locations confirmed; country of domicile is not a "
               "substitute for a delivery footprint")


def choose_network(dependencies):
    """spec:141. A dependency diagram needs real, identified, material dependencies.

    Dependencies whose very existence is "Data source required" are listed but not drawn,
    because a node on a diagram reads as a confirmed relationship.
    """
    deps = dependencies or []
    known = [d for d in deps
             if (d.get("confidence") or "") not in ("Data source required", "Not found")]
    if len(known) >= 1:
        n_pending = len(deps) - len(known)
        reason = "%d identified dependenc%s with confirmed existence" % (
            len(known), "y" if len(known) == 1 else "ies")
        if n_pending:
            reason += "; %d further listed as unconfirmed and not drawn" % n_pending
        return "diagram", reason
    if deps:
        return ("list",
                "dependencies are named but none is confirmed, so they are listed rather "
                "than drawn as a network")
    return "required", "no critical dependencies disclosed"


def choose_risk_matrix(risks):
    """spec:142. Impact and likelihood must be assessed SEPARATELY, and unknowns shown.

    A risk with no likelihood cannot be plotted. It is not dropped: it goes to an
    explicitly separate "cannot be plotted" group, because silently omitting it would make
    the matrix look complete when it is not.
    """
    risks = risks or []
    plottable = [r for r in risks
                 if isinstance(r.get("impact"), (int, float))
                 and isinstance(r.get("likelihood"), (int, float))]
    unplottable = [r for r in risks if r not in plottable]
    if plottable:
        reason = "%d risk%s with both impact and likelihood assessed" % (
            len(plottable), "" if len(plottable) == 1 else "s")
        if unplottable:
            reason += ("; %d cannot be plotted and %s listed separately rather than "
                       "dropped" % (len(unplottable),
                                    "is" if len(unplottable) == 1 else "are"))
        return "matrix", reason
    if risks:
        return ("list",
                "no risk has both impact and likelihood assessed, so a matrix would "
                "position risks on axes that were never scored")
    return "required", "no risks assessed"


def choose_peer_scatter(peers):
    """spec:110. A peer scatter needs peers. One point is not a position."""
    peers = peers or []
    if len(peers) >= 3:
        return "scatter", "%d comparable candidates captured" % len(peers)
    if peers:
        return ("list",
                "%d peer%s captured, too few to position this supplier against a field"
                % (len(peers), "" if len(peers) == 1 else "s"))
    return ("required",
            "no comparable peer data captured; a scatter with a single point shows "
            "position relative to nothing")


ALL_CHOOSERS = {
    "trend": choose_trend,
    "ownership": choose_ownership,
    "map": choose_map,
    "network": choose_network,
    "risk_matrix": choose_risk_matrix,
    "peer_scatter": choose_peer_scatter,
}
