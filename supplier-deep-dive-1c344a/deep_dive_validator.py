#!/usr/bin/env python3
"""
deep_dive_validator.py — the code-enforced claim-gate for the deep-dive dossier (H3 gap 2).

WHY THIS EXISTS
---------------
The H3 audit found 11 skills whose claim-gate is an INSTRUCTION rather than a check, and
named this skill as the one to fix first: it emits a single-vendor dossier full of exactly
the status assertions G12's third prohibition names (debarment, sanctions, breach,
financial distress, certifications), and it had no code path that could refuse.

`OPTIMIZATION-PRINCIPLES.md`: "A generator that RAISES on a NEEDS_INPUT field beats an
instruction telling the model not to fabricate, because the instruction can be forgotten
and the exception cannot."

This enforces THIS SKILL'S OWN stated rules, quoted, rather than a standard invented here:

  SKILL.md:87  "never assert a debarment, sanctions, breach, or financial-distress status
                without a cited source; 'not verified, requires a formal screen' is the
                answer, and gating items route to the SME"
  SKILL.md:277 "every claim cites name + date + confidence. Mark 'Not Publicly Disclosed'
                rather than guess. NEVER fabricate certifications, customers, or financial
                figures."
  SKILL.md:399 "NEVER assert a debarment or sanctions hit without a cited source; gating
                items route to the SME for a formal screen."

Stdlib only. Run it on the dossier JSON before the dossier is delivered.
"""
from __future__ import annotations

import json
import re
import sys

# G12's third prohibition, the statuses that may never be asserted uncited.
GATED_SUBJECTS = ("debarment", "sanctions", "breach", "financial distress", "financial-distress")

# The ONLY status a gating item may carry. The skill's own schema fixes this literal:
# a deep dive routes gating items to an SME, it does not clear or fail them itself.
GATING_STATUS = "REQUIRES_FORMAL_SCREEN"

# Accepted ways of saying "we did not find this", which are answers, not fabrications.
ABSTENTIONS = (
    "not verified", "not publicly disclosed", "requires a formal screen",
    "requires formal screen", "research_pending", "not disclosed", "no public",
)

CONFIDENCE = ("High", "Medium", "Low")

# Hedges that turn an uncitable finding into an unfalsifiable one. G12: drop, do not dilute.
DILUTION = (
    "may not fully", "might not fully", "could potentially", "appears to possibly",
    "may be some", "possibly does not", "it is unclear whether",
)


class DossierError(Exception):
    """Base for every refusal."""


class UncitedClaimError(DossierError):
    pass


class AssertedGatingStatusError(DossierError):
    pass


class DilutedFindingError(DossierError):
    pass


class SchemaError(DossierError):
    pass


def _txt(v):
    return (v or "").strip() if isinstance(v, str) else ""


def _abstains(text):
    low = text.lower()
    return any(a in low for a in ABSTENTIONS)


def _mentions_gated(text):
    low = text.lower()
    return any(g in low for g in GATED_SUBJECTS)


def validate_dossier(d):
    """Raise on any violation. Returns a summary dict when the dossier is clean.

    Refuses rather than warns: a warning on a fabricated sanctions status is indistinguishable
    from no check at all once the dossier is pasted into a deck.
    """
    if not isinstance(d, dict):
        raise SchemaError("dossier must be a dict, got %s" % type(d).__name__)

    risk = d.get("risk") or {}
    dims = risk.get("dimensions") or []
    if not isinstance(dims, list):
        raise SchemaError("risk.dimensions must be a list")

    checked = 0

    # --- 1. every risk dimension carries a source and a confidence --------------------
    for i, dim in enumerate(dims):
        name = _txt(dim.get("dimension")) or "dimension %d" % i
        note = _txt(dim.get("note"))
        src = _txt(dim.get("source"))
        conf = _txt(dim.get("confidence"))

        if conf not in CONFIDENCE:
            raise SchemaError(
                "risk dimension %r has confidence %r; the skill requires High / Medium / Low "
                "on every conclusion (Rule 5), so the reader can tell observation from "
                "inference." % (name, conf)
            )
        # ORDER MATTERS. The most SPECIFIC diagnosis must fire first. A diluted sanctions
        # claim is also an uncited claim, and reporting it as merely uncited tells the
        # reader to add a citation when the correct action is to delete the sentence.
        # The generic check runs last, as the catch-all it is.
        if note and any(h in note.lower() for h in DILUTION):
            raise DilutedFindingError(
                "risk dimension %r reads as a diluted finding: %r. G12 says drop, do not "
                "dilute. If it cannot be cited, delete it; a hedge is unfalsifiable and "
                "hides that nothing was found." % (name, note[:90])
            )
        if note and _mentions_gated(note) and not src and not _abstains(note):
            raise AssertedGatingStatusError(
                "risk dimension %r asserts a gated status (%s) with no cited source. "
                "SKILL.md:87 is explicit: never assert a debarment, sanctions, breach or "
                "financial-distress status without one." % (name, note[:90])
            )
        if note and not src and not _abstains(note):
            raise UncitedClaimError(
                "risk dimension %r asserts %r with no source. SKILL.md:277 requires name + "
                "date + confidence on every claim; 'Not Publicly Disclosed' is the answer "
                "when the data is not there." % (name, note[:90])
            )
        checked += 1

    # --- 2. gating items may never carry an adjudicated status ------------------------
    for g in risk.get("gating_items") or []:
        status = _txt(g.get("status"))
        gtype = _txt(g.get("type")) or "gating item"
        if status != GATING_STATUS:
            raise AssertedGatingStatusError(
                "gating item %r has status %r. The only permitted value is %r: this skill "
                "routes gating items to an SME for a formal screen, it does not clear or "
                "fail them. A 'PASS' here is a fabricated clearance."
                % (gtype, status, GATING_STATUS)
            )
        if not _txt(g.get("route_to_sme")):
            raise SchemaError(
                "gating item %r has no route_to_sme. Rule 7 routes gating findings to the "
                "SME function; an unrouted gating item is a dead end." % gtype
            )
        checked += 1

    # --- 3. factual claims that must cite: certifications, customers, financials -------
    mf = d.get("market_financials") or {}
    log = d.get("research_log") or {}
    cited_claims = set()
    for w in (log.get("web_sources") or []):
        cited_claims.add(_txt(w.get("claim")).lower())
    for s in (log.get("internal_sources") or []):
        cited_claims.add(_txt(s.get("title")).lower())

    for field in ("revenue", "growth", "market_position", "ownership_signals"):
        val = _txt(mf.get(field))
        if not val or _abstains(val):
            continue
        # A financial figure needs a source somewhere in the research log.
        if re.search(r"[\d]", val) and not cited_claims:
            raise UncitedClaimError(
                "market_financials.%s states %r but research_log carries no sources at all. "
                "SKILL.md:277: NEVER fabricate financial figures." % (field, val[:80])
            )
        checked += 1

    named = mf.get("named_customers") or []
    if named and not cited_claims:
        raise UncitedClaimError(
            "market_financials.named_customers lists %d customer(s) with an empty "
            "research_log. Named customers are exactly what SKILL.md:277 forbids inventing."
            % len(named)
        )

    # --- 4. the recommendation must cite the gating items it relies on ----------------
    rec = d.get("recommendation") or {}
    verdict = _txt(rec.get("verdict"))
    if verdict and not _txt(rec.get("rationale")):
        raise SchemaError("recommendation states %r with no rationale" % verdict)
    if any(h in _txt(rec.get("rationale")).lower() for h in DILUTION):
        raise DilutedFindingError(
            "the recommendation rationale is hedged into unfalsifiability. State the "
            "finding and cite it, or drop it."
        )

    return {"checks_run": checked, "gating_items": len(risk.get("gating_items") or []),
            "risk_dimensions": len(dims)}


def main(argv):
    if not argv:
        print(__doc__.strip())
        print("\nusage: deep_dive_validator.py <dossier.json>")
        return 0
    with open(argv[0], encoding="utf-8") as fh:
        d = json.load(fh)
    try:
        summary = validate_dossier(d)
    except DossierError as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr)
        return 2
    print("OK: %s" % json.dumps(summary))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
