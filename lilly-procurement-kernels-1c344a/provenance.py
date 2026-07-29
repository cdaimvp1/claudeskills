#!/usr/bin/env python3
"""
provenance.py — per-fact provenance validation (H4).

CANONICAL SHAPE: the `$src` SIDECAR, not an inline wrapper
-----------------------------------------------------------
A data object keeps its values plain and carries provenance beside them, keyed by field:

    "meta": { "s23": 214800000, "yoy2425": 15.2 },
    "$src": {
      "s23":     [{"name": "ARIA S2P, PO Product pull", "tier": 1,
                   "confidence": "Medium", "asOf": "2026-06-01", "stub": true}],
      "yoy2425": {"kind": "derived", "by": "annual[] FY24-FY25 delta"}
    }

H4's text proposed inlining `{value, source, as_of, confidence}` into every field. The
sidecar was chosen instead, deliberately:

  * **Non-breaking.** Every dashboard and generator reads `meta.s23` as a number. Inlining
    turns each value into an object and breaks all of them at once.
  * **Derived facts have no source, and should not be given a fake one.** A CAGR computed
    from three spend figures is provenanced by its FORMULA. Forcing a `source` onto it
    would fabricate provenance inside the guardrail meant to prevent fabrication.
  * **A fact can have several sources.** The list form says so; a single `source` field
    cannot.
  * **It keeps `tier` and `stub`.** `stub: true` marks illustrative or placeholder data,
    which is an anti-fabrication signal with no room in the flat shape.

THE SIDECAR'S ONE WEAKNESS, AND THE ANSWER TO IT
------------------------------------------------
Because provenance sits beside the value rather than inside it, a field can be added and
its `$src` entry forgotten. That is exactly what this module refuses: **every field must
carry either a source list or a derived block.** Silence is not permitted.

RELATION TO G13
---------------
`tier` maps onto the G13 source ladder: tier 1 is a live authoritative read, higher tiers
are progressively weaker. A fact with no provenance at all is not rung 5 (abstain), it is
unlabelled, which is the state G13 exists to eliminate.

Stdlib only.
"""
from __future__ import annotations

from datetime import datetime

SRC_KEY = "$src"

CONFIDENCE = ("High", "Medium", "Low")
TIER_MIN, TIER_MAX = 1, 7          # the Source Quality Hierarchy

# Placeholders that satisfy "a date is present" while carrying no capture date. Same list
# and same reasoning as the research-table generators (item #32).
_DATE_PLACEHOLDERS = frozenset({
    "", "tbd", "tba", "n/a", "na", "n/d", "none", "null", "unknown", "unspecified",
    "recent", "current", "various", "ongoing", "latest", "-", "--", "?",
})

_DATE_FORMATS = ("%Y-%m-%d", "%Y-%m", "%Y",
                 "%b %d, %Y", "%B %d, %Y", "%b %d %Y", "%B %d %Y",
                 "%d %b %Y", "%d %B %Y", "%b %Y", "%B %Y")


class ProvenanceError(Exception):
    """Base for every refusal."""


class MissingProvenanceError(ProvenanceError):
    pass


class MalformedSourceError(ProvenanceError):
    pass


def _valid_as_of(value):
    if not isinstance(value, str):
        return False
    raw = value.strip()
    if raw.lower() in _DATE_PLACEHOLDERS:
        return False
    for fmt in _DATE_FORMATS:
        try:
            parsed = datetime.strptime(raw, fmt)
        except ValueError:
            continue
        return 1990 <= parsed.year <= 2100
    return False


def validate_source_entry(entry, field, index):
    """One entry in a field's source list."""
    if not isinstance(entry, dict):
        raise MalformedSourceError(
            "%s source[%d] must be an object, got %s"
            % (field, index, type(entry).__name__))

    name = (entry.get("name") or "").strip()
    if not name:
        raise MalformedSourceError(
            "%s source[%d] has no name. A source nobody can identify is not provenance; "
            "it is the appearance of provenance, which is worse than none because it "
            "stops the reader looking." % (field, index))

    if not _valid_as_of(entry.get("asOf")):
        raise MalformedSourceError(
            "%s source[%d] (%r) has asOf=%r, which is not a usable capture date. Without "
            "one the fact cannot be aged, stale-checked or re-verified."
            % (field, index, name, entry.get("asOf")))

    tier = entry.get("tier")
    if tier is not None and not (isinstance(tier, int) and TIER_MIN <= tier <= TIER_MAX):
        raise MalformedSourceError(
            "%s source[%d] (%r) has tier=%r; the Source Quality Hierarchy runs %d-%d."
            % (field, index, name, tier, TIER_MIN, TIER_MAX))

    conf = entry.get("confidence")
    if conf is not None and conf not in CONFIDENCE:
        raise MalformedSourceError(
            "%s source[%d] (%r) has confidence=%r; expected one of %s."
            % (field, index, name, conf, list(CONFIDENCE)))
    return True


def validate_derived(block, field):
    """A derived fact is provenanced by its formula, not by a source."""
    by = (block.get("by") or "").strip()
    if not by:
        raise MalformedSourceError(
            "%s is marked derived but states no `by` formula. 'Derived' without the "
            "derivation is an assertion that the number came from somewhere, which is not "
            "provenance." % field)
    if block.get("source") or block.get("name"):
        raise MalformedSourceError(
            "%s is marked derived AND carries a source. Pick one: a figure is either "
            "computed from other fields or read from somewhere. Claiming both hides which "
            "is true." % field)
    return True


def validate_provenance(values, src, exempt=(), label="object"):
    """Every field in `values` must carry provenance in `src`.

    Returns a summary. Raises on the first violation, because a partially-provenanced
    object is not usable: a reader cannot tell which fields were checked.
    """
    if not isinstance(values, dict):
        raise ProvenanceError("%s: values must be a dict" % label)
    if not isinstance(src, dict):
        raise MissingProvenanceError(
            "%s carries no %s block at all. Every fact needs its rung; an object with no "
            "provenance is unlabelled, which is the state G13 exists to eliminate."
            % (label, SRC_KEY))

    sourced = derived = 0
    stubs = []
    for field, value in values.items():
        if field == SRC_KEY or field in exempt:
            continue
        if value is None:
            continue                      # an absent value needs no provenance
        if field not in src:
            raise MissingProvenanceError(
                "%s.%s has a value (%r) but no %s entry. The sidecar's one weakness is "
                "that a field can be added and its provenance forgotten; this is that "
                "check." % (label, field, value, SRC_KEY))

        entry = src[field]
        if isinstance(entry, dict) and entry.get("kind") == "derived":
            validate_derived(entry, "%s.%s" % (label, field))
            derived += 1
        elif isinstance(entry, list):
            if not entry:
                raise MissingProvenanceError(
                    "%s.%s has an EMPTY source list. An empty list is not an abstention, "
                    "it is a missing answer wearing the shape of one."
                    % (label, field))
            for i, e in enumerate(entry):
                validate_source_entry(e, "%s.%s" % (label, field), i)
                if e.get("stub"):
                    stubs.append(field)
            sourced += 1
        else:
            raise MalformedSourceError(
                "%s.%s provenance must be a source LIST or a derived block, got %s."
                % (label, field, type(entry).__name__))

    return {"sourced": sourced, "derived": derived,
            "stub_fields": sorted(set(stubs)), "checked": sourced + derived}


def stub_report(values, src, exempt=()):
    """Fields whose provenance is marked `stub: true`.

    Kept separate from validation on purpose: a stub is LEGITIMATE (illustrative or
    placeholder data, honestly labelled) and must not fail a build. But it must be
    surfaceable, because shipping a deliverable built on stubs without saying so is the
    fabrication the flag exists to prevent.
    """
    out = []
    for field, entry in (src or {}).items():
        if field in exempt or not isinstance(entry, list):
            continue
        for e in entry:
            if isinstance(e, dict) and e.get("stub"):
                out.append({"field": field, "source": e.get("name"), "asOf": e.get("asOf")})
    return out
