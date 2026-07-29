#!/usr/bin/env python3
"""
rfx_handoff_emitter.py — the "Send winner to Deal" emitter (A2).

Builds an `RfxToDealHandoff` from a persisted RfxEvent so the object is ASSEMBLED BY CODE,
not narrated by a model. The schema is owned by `_redesign_proposals/RFx-REDESIGN-SPEC.md`
section C and must not be forked; this module implements it, it does not redefine it.

Division of labour, the same one the rest of the suite uses:
  code  owns validation, arithmetic, assembly and invariants
  model owns narrative

WHAT THIS REFUSES TO DO (refuse, do not guess)
----------------------------------------------
Each of these raises rather than emitting a plausible-looking object:
  * no selected supplier, or a selection that is not final       -> NoSelectionError
  * normalized TCO components that do not reconcile to the total -> TcoReconciliationError
  * an award condition or gating item that is neither resolved
    nor carried into openIssues                                  -> DroppedFindingError
A handoff is the seam where one skill's output becomes another's starting position. A
wrong number here is inherited silently by the whole negotiation, so the failure mode has
to be a refusal, never a default.

THE CLAIM-GATE ON THE SEAM (G12)
--------------------------------
An UNCITED commitment is not an error and is not dropped. It is demoted: it seeds as an
OPEN issue labelled `[CONFIRM ...]` and never as an agreed position. Deal Room must never
inherit a fabricated starting agreement. "Drop, do not dilute" applies to the CLAIM, not
to the finding: the finding survives, its status does not.

Stdlib only, so it runs in Claude Desktop with no install step.
"""
from __future__ import annotations

import json
import sys

# The schema's own literal. The spec renders this with an em dash, the canonical contract
# doc renders it with a hyphen and declares itself em-dash-free, and deal-room's SKILL.md
# paraphrases it with a comma. Three spellings of one contract value would break any
# round-trip check, so the em-dash-free form is canonical here and is the ONLY string
# emitted. See A2-HANDOFF-FINDINGS.md.
TCO_TAG = "indicative - firm in negotiation"

PROVENANCE_NOTE = (
    "financial-viability grade and exit terms re-validated during negotiation"
)

# Reconciliation tolerance. Money, so this is a rounding allowance, not a fudge factor.
TCO_TOLERANCE = 0.01


class HandoffError(Exception):
    """Base for every refusal. Callers can catch this and surface the reason verbatim."""


class NoSelectionError(HandoffError):
    pass


class TcoReconciliationError(HandoffError):
    pass


class DroppedFindingError(HandoffError):
    pass


def _evidence_index(evidence):
    """claim -> sourceRef, for the citations backing carried findings."""
    idx = {}
    for e in evidence or []:
        claim = (e.get("claim") or "").strip()
        ref = (e.get("sourceRef") or "").strip()
        if claim and ref:
            idx[claim] = ref
    return idx


def _cited(item, idx):
    """A finding is cited when it carries a sourceRef, or the evidence[] list backs it."""
    ref = (item.get("sourceRef") or "").strip()
    if ref:
        return ref
    return idx.get((item.get("claim") or item.get("text") or "").strip(), "")


def _check_tco(tco):
    """Components must reconcile to the all-in figure. Refuse rather than emit a total
    nobody can rebuild from its parts."""
    if not tco:
        return None
    all_in = tco.get("allInUnit")
    components = tco.get("components") or []
    if all_in is None:
        raise TcoReconciliationError(
            "normalizedTco has no allInUnit. A TCO with no total cannot seed an "
            "Economics position; supply the total or omit the TCO entirely."
        )
    if not components:
        raise TcoReconciliationError(
            "normalizedTco has an allInUnit of %r but no components[]. An unauditable "
            "total is exactly what the handoff exists to prevent." % (all_in,)
        )
    total = 0.0
    for c in components:
        v = c.get("amount")
        if v is None:
            raise TcoReconciliationError(
                "component %r carries no amount. Refusing to treat a missing number as "
                "zero: that would understate the total and the error would be inherited."
                % (c.get("label") or c,)
            )
        total += float(v)
    if abs(total - float(all_in)) > TCO_TOLERANCE:
        raise TcoReconciliationError(
            "normalizedTco does not reconcile: components sum to %.2f, allInUnit is "
            "%.2f, difference %.2f. Fix the source, do not hand a broken total to the "
            "negotiation." % (total, float(all_in), total - float(all_in))
        )
    return round(total, 2)


def build_handoff(rfx_event):
    """RfxEvent -> RfxToDealHandoff. Pure: no I/O, no clock, no randomness."""
    if not isinstance(rfx_event, dict):
        raise NoSelectionError("rfx_event must be a dict, got %r" % type(rfx_event).__name__)

    sel = rfx_event.get("selection") or {}
    supplier = sel.get("supplier") or {}
    if not supplier.get("id") or not supplier.get("name"):
        raise NoSelectionError(
            "no selected supplier. The handoff is emitted at selection; there is nothing "
            "to hand over before a winner exists."
        )
    if not sel.get("final"):
        raise NoSelectionError(
            "selection is not final (selection.final is falsy). RFx never writes past "
            "selection, so emitting now would hand Deal a position that can still change."
        )

    idx = _evidence_index(rfx_event.get("evidence"))

    open_issues = list(rfx_event.get("openIssues") or [])
    commitments = []
    demoted = 0

    # Claim-gate: a commitment with no citation seeds as an OPEN issue, never as agreed.
    for c in rfx_event.get("commitments") or []:
        text = (c.get("text") or "").strip()
        if not text:
            continue
        ref = _cited(c, idx)
        if ref:
            commitments.append({
                "text": text,
                "status": c.get("status") or "supplier-stated",
                "sourceRef": ref,
            })
        else:
            demoted += 1
            open_issues.append({
                "text": "[CONFIRM %s]" % text,
                "reason": "carried from RFx without a citation; not an agreed position",
                "sourceRef": "",
            })

    # An unresolved gate conflict must travel. Silently resolving it in either direction
    # is the failure this check exists to prevent.
    gate_conflict = rfx_event.get("gateConflict")
    if gate_conflict and not gate_conflict.get("resolved"):
        open_issues.append({
            "text": gate_conflict.get("text") or "Unresolved gate conflict",
            "reason": "unresolved at selection; Deal inherits it open",
            "sourceRef": _cited(gate_conflict, idx),
        })

    award_conditions = []
    for a in rfx_event.get("awardConditions") or []:
        text = (a.get("text") or "").strip()
        if not text:
            continue
        award_conditions.append({
            "text": text,
            "status": a.get("status") or "open",
            "sourceRef": _cited(a, idx),
        })

    # Nothing raised as a finding may vanish between input and output.
    findings_in = len([c for c in (rfx_event.get("commitments") or []) if (c.get("text") or "").strip()])
    findings_out = len(commitments) + demoted
    if findings_in != findings_out:
        raise DroppedFindingError(
            "%d commitment(s) entered and %d left the emitter. A finding was dropped "
            "rather than demoted, which is the one thing the claim-gate must not do."
            % (findings_in, findings_out)
        )

    tco = rfx_event.get("normalizedTco")
    _check_tco(tco)
    normalized_tco = None
    if tco:
        normalized_tco = {
            "allInUnit": tco.get("allInUnit"),
            "denominatorUnit": tco.get("denominatorUnit"),
            "components": list(tco.get("components") or []),
            "reconciliation": tco.get("reconciliation") or "components sum to allInUnit",
            "tag": TCO_TAG,
        }

    rm = rfx_event.get("requirementModel") or {}

    return {
        "selectedSupplier": {
            "id": supplier.get("id"),
            "name": supplier.get("name"),
            "advisoryTier": supplier.get("advisoryTier"),
        },
        "requirementModel": {
            "categoryCount": rm.get("categoryCount"),
            "mustHaveCount": rm.get("mustHaveCount"),
            "note": "weights locked at scoring",
        },
        "normalizedTco": normalized_tco,
        "awardConditions": award_conditions,
        "openIssues": open_issues,
        "commitments": commitments,
        "risks": list(rfx_event.get("risks") or []),
        "evidence": [
            {"claim": k, "sourceRef": v} for k, v in sorted(idx.items())
        ],
        "conformanceStatus": rfx_event.get("conformanceStatus") or "Conforming",
        "provenanceNote": PROVENANCE_NOTE,
        "draft": True,
    }


def to_deal_room_seed(handoff):
    """Project the handoff into deal-room's Phase 1 intake shape, so the round trip is
    checkable rather than asserted. Mirrors the mapping in the canonical contract doc."""
    issues = []
    for c in handoff.get("commitments") or []:
        issues.append({
            "text": c["text"],
            "state": "open",           # never 'agreed': Deal owns everything after selection
            "sourceRef": c["sourceRef"],
            "origin": "rfx_commitment",
        })
    for a in handoff.get("awardConditions") or []:
        issues.append({
            "text": a["text"], "state": "open",
            "sourceRef": a.get("sourceRef", ""), "origin": "rfx_award_condition",
        })
    for o in handoff.get("openIssues") or []:
        issues.append({
            "text": o.get("text", ""), "state": "open",
            "sourceRef": o.get("sourceRef", ""), "origin": "rfx_open_issue",
        })
    return {
        "meta": {
            "supplier": handoff["selectedSupplier"]["name"],
            "seeded_from": {
                "commercial_negotiation_prep": False,
                "legal_negotiation_prep": False,
                "rfx_handoff": True,
                "source_notes": handoff.get("provenanceNote"),
            },
        },
        "issues": issues,
        "economics": handoff.get("normalizedTco"),
        "draft": handoff.get("draft", True),
    }


def main(argv):
    if not argv:
        print(__doc__.strip())
        print("\nusage: rfx_handoff_emitter.py <rfx_event.json> [--seed]")
        return 0
    with open(argv[0], encoding="utf-8") as fh:
        event = json.load(fh)
    try:
        handoff = build_handoff(event)
    except HandoffError as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr)
        return 2
    out = to_deal_room_seed(handoff) if "--seed" in argv else handoff
    print(json.dumps(out, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
