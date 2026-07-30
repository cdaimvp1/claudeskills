#!/usr/bin/env python3
"""
deepdive_schema.py -- the code-enforced contract for deep-dive supplier data (A5, stage 0).

WHY THIS EXISTS
---------------
`DEEP-DIVE-REDESIGN-SPEC-v3.md` is largely a list of things the v2 build got WRONG:
a composite score presented with false precision, internal inconsistencies between panels,
a fabricated annual dollar figure that read like a bid, and disclaimer noise so repetitive
it became wallpaper. Every one of those is a data defect that a renderer will faithfully
display if nothing refuses it first.

So the spec's rules live here as checks, not as prose in a SKILL.md. The model authors the
data; this decides whether the data may be rendered at all.

`OPTIMIZATION-PRINCIPLES.md`: a generator that RAISES beats an instruction telling the
model not to fabricate, because the instruction can be forgotten and the exception cannot.

WHAT IT REFUSES, AND WHICH SPEC LINE EACH COMES FROM
----------------------------------------------------
  spec:27-28  a visible composite score            -> CompositeScoreError
  spec:30-31  a precise $ with no bid/internal/benchmark support -> FabricatedFigureError
  spec:62-63  a field with no retrieval status     -> SchemaError
  spec:67-73  a gate demoted into the average      -> GateError
  spec:83-84  eight dimensions averaged into one   -> CompositeScoreError
  spec:16-17  evidence shown with equal authority  -> SchemaError (confidence required)

Stdlib only.
"""
from __future__ import annotations

import json
import re
import sys

# spec:62-63. A field is never silently absent: it carries one of these, and the renderer
# draws the state. "No issue found" and "not enough information" are DIFFERENT answers and
# the spec is explicit that they must not collapse into each other.
STATUSES = (
    "Verified", "Partially verified", "Supplier asserted", "Proxy used",
    "Data source required", "Not found", "Not applicable",
)

# The states that mean "we actually know this".
KNOWN = ("Verified", "Partially verified")

# spec:44-60. The eight decision dimensions, in spec order. Fixed here so a renderer cannot
# quietly drop one: a missing dimension is a refusal, not a shorter chart.
DIMENSIONS = (
    "identity_ownership",
    "capability_fit",
    "financial_viability",
    "operational_resilience",
    "integrity_legal_compliance",
    "quality_regulatory_ehs",
    "cyber_privacy_data",
    "responsible_sourcing_evidence",
)

# spec:83. The label is the ACTUAL assessment, not a number. The bar encodes relative
# position; the words carry the meaning.
ASSESSMENTS = ("Strong", "Adequate", "Moderate", "Weak", "Insufficient evidence")

# spec:84. Confidence is rendered as FILL, so it must be one of exactly three values.
CONFIDENCE_FILL = ("verified", "partial", "insufficient")

# spec:68-73. Gates OVERRIDE the aggregate. They are not inputs to it.
GATE_KINDS = ("HARD_STOP", "ESCALATION")

# spec:30-31. A precise currency figure is only allowed when it rests on one of these.
# Public list pricing cannot estimate Lilly TCO, and a number that reads like a bid is the
# single most dangerous thing this dashboard could render.
MONEY_SOURCES = ("bid", "internal", "benchmark", "prior_spend", "contract")

_MONEY = re.compile(r"[$£€]\s?\d")


class DeepDiveError(Exception):
    """Base for every refusal."""


class SchemaError(DeepDiveError):
    pass


class CompositeScoreError(DeepDiveError):
    pass


class FabricatedFigureError(DeepDiveError):
    pass


class GateError(DeepDiveError):
    pass


def _txt(v):
    return v.strip() if isinstance(v, str) else ""


def _check_no_composite(d):
    """spec:27-28, 83-84. No single number may stand in for the assessment.

    The v2 build showed 89/100 on one panel, 90/100 on another and 4.5/5 on a third, for
    the same supplier. The fix in the spec is not to reconcile them; it is to stop emitting
    a composite at all, because the number was never supported in the first place.
    """
    banned = ("composite_score", "overall_score", "total_score", "score_100",
              "fit_score", "weighted_score")
    for key in banned:
        if key in d:
            raise CompositeScoreError(
                "%r is present. The spec removes the composite score from the visible "
                "interface: per-dimension assessments plus confidence are safer than an "
                "unsupported single number, and three different composites for one "
                "supplier is what made the v2 build untrustworthy." % key)


def _check_money(label, text, sources):
    """spec:30-31. Refuse a precise currency figure with no supporting source type."""
    if not _MONEY.search(text or ""):
        return
    if not any(s in MONEY_SOURCES for s in sources):
        raise FabricatedFigureError(
            "%s states a precise currency figure (%r) but cites no bid, internal, "
            "benchmark, prior-spend or contract source. Public consumption pricing cannot "
            "estimate Lilly TCO, and a figure like this reads as a bid. State the "
            "commercial DRIVERS instead." % (label, (text or "")[:80]))


def validate_supplier(s):
    """Validate one supplier record. Raises on any violation; returns a summary."""
    if not isinstance(s, dict):
        raise SchemaError("supplier record must be an object, got %s" % type(s).__name__)

    name = _txt(s.get("name"))
    if not name:
        raise SchemaError("supplier record has no name")

    _check_no_composite(s)

    # --- the eight dimensions -----------------------------------------------------------
    dims = s.get("dimensions")
    if not isinstance(dims, dict):
        raise SchemaError("%s: dimensions must be an object keyed by the 8 dimension ids"
                          % name)
    missing = [d for d in DIMENSIONS if d not in dims]
    if missing:
        raise SchemaError(
            "%s: missing dimension(s) %s. All eight always render; a dimension with no "
            "evidence is shown as 'Insufficient evidence', which is a finding, not a "
            "reason to omit the row." % (name, ", ".join(missing)))
    extra = [d for d in dims if d not in DIMENSIONS]
    if extra:
        raise SchemaError("%s: unknown dimension(s) %s" % (name, ", ".join(extra)))

    for did in DIMENSIONS:
        d = dims[did]
        if not isinstance(d, dict):
            raise SchemaError("%s.%s must be an object" % (name, did))
        a = _txt(d.get("assessment"))
        if a not in ASSESSMENTS:
            raise SchemaError(
                "%s.%s has assessment %r; must be one of %s. The label carries the "
                "meaning, so it cannot be free text."
                % (name, did, a, " / ".join(ASSESSMENTS)))
        c = _txt(d.get("confidence"))
        if c not in CONFIDENCE_FILL:
            raise SchemaError(
                "%s.%s has confidence %r; must be verified / partial / insufficient, "
                "because confidence is rendered as the bar FILL." % (name, did, c))
        # spec:16-17: verified fact, external research and inference may not be shown with
        # equal authority. An assessment claiming confidence must say what it rests on.
        if c in ("verified", "partial") and not (d.get("evidence") or []):
            raise SchemaError(
                "%s.%s claims %r confidence with no evidence entries. Equal-authority "
                "presentation of sourced and unsourced findings is the defect this "
                "redesign exists to fix." % (name, did, c))
        if a == "Insufficient evidence" and c != "insufficient":
            raise SchemaError(
                "%s.%s reads 'Insufficient evidence' but claims %r confidence. Those "
                "contradict, and the v2 build shipped exactly this class of internal "
                "inconsistency." % (name, did, c))
        pos = d.get("position")
        if not isinstance(pos, (int, float)) or not 0 <= pos <= 100:
            raise SchemaError(
                "%s.%s needs a numeric position 0-100 for the bar length. This is a "
                "RELATIVE position, never displayed as a score." % (name, did))

        for e in d.get("evidence") or []:
            st = _txt(e.get("status"))
            if st not in STATUSES:
                raise SchemaError(
                    "%s.%s evidence %r has status %r; must be one of: %s"
                    % (name, did, _txt(e.get("field"))[:40], st, " / ".join(STATUSES)))
            if st in KNOWN and not _txt(e.get("source_name")):
                raise SchemaError(
                    "%s.%s evidence %r is %r but names no source."
                    % (name, did, _txt(e.get("field"))[:40], st))
            if st in KNOWN and not _txt(e.get("source_date")):
                raise SchemaError(
                    "%s.%s evidence %r is %r with no source_date. A 2019 read and a "
                    "current one are indistinguishable without it."
                    % (name, did, _txt(e.get("field"))[:40], st))
            _check_money("%s.%s evidence %r" % (name, did, _txt(e.get("field"))[:40]),
                         _txt(e.get("raw_value")),
                         [_txt(e.get("source_type"))])

    # --- gates override, they do not average ---------------------------------------------
    for g in s.get("gates") or []:
        kind = _txt(g.get("kind"))
        if kind not in GATE_KINDS:
            raise GateError("%s: gate kind %r must be HARD_STOP or ESCALATION"
                            % (name, kind))
        if not _txt(g.get("reason")):
            raise GateError("%s: a %s gate with no stated reason is unactionable"
                            % (name, kind))
        if not _txt(g.get("owner")):
            raise GateError(
                "%s: %s gate %r has no owner. A gate nobody owns is a gate nobody clears."
                % (name, kind, _txt(g.get("reason"))[:50]))
        if g.get("counts_toward_aggregate"):
            raise GateError(
                "%s: gate %r is marked as counting toward the aggregate. Gates OVERRIDE "
                "the assessment; folding a hard stop into an average is how a "
                "disqualifying finding becomes a slightly lower score."
                % (name, _txt(g.get("reason"))[:50]))

    # --- the recommendation must respect the gates ----------------------------------------
    rec = s.get("recommendation") or {}
    verdict = _txt(rec.get("verdict"))
    if not verdict:
        raise SchemaError("%s: no recommendation verdict" % name)
    hard = [g for g in (s.get("gates") or []) if _txt(g.get("kind")) == "HARD_STOP"]
    if hard and verdict.lower().startswith(("advance", "proceed", "recommend")):
        raise GateError(
            "%s: verdict is %r while %d HARD STOP gate(s) are open (%s). A hard stop is "
            "not an input to a judgement call; it is the answer until it is cleared."
            % (name, verdict, len(hard), _txt(hard[0].get("reason"))[:60]))

    _check_money("%s.recommendation" % name, _txt(rec.get("rationale")),
                 [_txt(x) for x in (rec.get("source_types") or [])])

    # --- evidence coverage must be real, not decorative -----------------------------------
    cov = s.get("evidence_coverage") or {}
    need = ("verified", "partial", "supplier_input", "missing")
    if sorted(cov) != sorted(need):
        raise SchemaError(
            "%s: evidence_coverage must carry exactly %s" % (name, ", ".join(need)))
    total = sum(cov.get(k, 0) for k in need)
    if abs(total - 100) > 0.5:
        raise SchemaError(
            "%s: evidence_coverage sums to %s, not 100. The segmented bar is a share of "
            "the whole; if it does not sum it is decoration." % (name, total))

    return {
        "name": name,
        "dimensions": len(DIMENSIONS),
        "gates": len(s.get("gates") or []),
        "hard_stops": len(hard),
        "evidence_items": sum(len(dims[d].get("evidence") or []) for d in DIMENSIONS),
    }


def validate_dataset(data):
    if not isinstance(data, dict) or not isinstance(data.get("suppliers"), list):
        raise SchemaError("dataset must be an object with a 'suppliers' list")
    if not data["suppliers"]:
        raise SchemaError("dataset has no suppliers")
    return [validate_supplier(s) for s in data["suppliers"]]


def main(argv):
    if not argv:
        print(__doc__.strip())
        return 0
    with open(argv[0], encoding="utf-8") as fh:
        data = json.load(fh)
    try:
        out = validate_dataset(data)
    except DeepDiveError as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr)
        return 2
    print(json.dumps(out, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
