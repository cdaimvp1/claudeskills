#!/usr/bin/env python3
"""
Self-test for deep_dive_validator.py (H3 gap 2).

Includes NEGATIVE CONTROLS: dossiers that are legitimately incomplete and must PASS. A
gate that refuses everything is as useless as one that refuses nothing, and it is the
failure mode a strict validator actually reaches in practice, because every tightening
looks like an improvement until it starts rejecting honest abstentions.

Run: python deep_dive_validator_selftest.py
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from deep_dive_validator import (                             # noqa: E402
    AssertedGatingStatusError,
    DilutedFindingError,
    SchemaError,
    UncitedClaimError,
    validate_dossier,
)

PASS, FAIL = [], []


def ok(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("  ok   " if cond else "  FAIL ") + name + (("  <- " + detail) if detail and not cond else ""))


def raises(name, exc, fn):
    try:
        fn()
    except exc:
        ok(name, True)
        return
    except Exception as e:                                   # noqa: BLE001
        ok(name, False, "raised %s, expected %s" % (type(e).__name__, exc.__name__))
        return
    ok(name, False, "did not raise " + exc.__name__)


def passes(name, d):
    try:
        validate_dossier(d)
        ok(name, True)
    except Exception as e:                                   # noqa: BLE001
        ok(name, False, "refused a legitimate dossier: %s: %s" % (type(e).__name__, e))


def clean():
    return {
        "risk": {
            "band": "Medium",
            "dimensions": [
                {"dimension": "financial", "level": "Low",
                 "note": "Revenue grew 18% FY25.", "confidence": "Medium",
                 "source": "10-K", "as_of": "2026-02-11"},
                {"dimension": "cyber", "level": "Medium",
                 "note": "Not publicly disclosed.", "confidence": "Low"},
            ],
            "gating_items": [
                {"type": "debarment", "status": "REQUIRES_FORMAL_SCREEN",
                 "route_to_sme": "Compliance"},
            ],
        },
        "market_financials": {
            "revenue": "$1.2B FY25", "growth": "18%", "market_position": "Challenger",
            "ownership_signals": "", "named_customers": ["Acme Corp"],
        },
        "research_log": {
            "internal_sources": [],
            "web_sources": [{"claim": "Revenue grew 18% FY25", "source": "10-K",
                             "date": "2026-02-11"}],
        },
        "recommendation": {"verdict": "Proceed with conditions",
                           "rationale": "Capability fits the stated need.",
                           "conditions": [], "cited_gating_items": ["debarment"]},
    }


def run():
    print("=" * 84)
    print("deep_dive_validator self-test")
    print("=" * 84)

    passes("T1  a clean, fully cited dossier passes", clean())

    # --- negative controls: honest incompleteness MUST pass ---------------------------
    d = clean()
    d["risk"]["dimensions"][0] = {"dimension": "financial", "level": "Low",
                                  "note": "Not verified, requires a formal screen.",
                                  "confidence": "Low"}
    passes("T2  NEGATIVE CONTROL: an uncited ABSTENTION passes", d)

    d = clean()
    d["risk"]["dimensions"][1]["note"] = "Not Publicly Disclosed."
    passes("T3  NEGATIVE CONTROL: 'Not Publicly Disclosed' passes", d)

    d = clean()
    d["market_financials"] = {"revenue": "", "growth": "", "market_position": "",
                              "ownership_signals": "", "named_customers": []}
    d["research_log"] = {"internal_sources": [], "web_sources": []}
    passes("T4  NEGATIVE CONTROL: an empty financials block with no sources passes", d)

    d = clean()
    d["risk"]["dimensions"][1]["note"] = "No public breach history located."
    passes("T5  NEGATIVE CONTROL: a gated SUBJECT stated as an abstention passes", d)

    # --- the gated statuses -----------------------------------------------------------
    def uncited_sanctions():
        d = clean()
        d["risk"]["dimensions"][1] = {"dimension": "regulatory", "level": "High",
                                      "note": "Supplier appears on a sanctions list.",
                                      "confidence": "Medium"}
        validate_dossier(d)
    raises("T6  refuses an UNCITED sanctions assertion", AssertedGatingStatusError,
           uncited_sanctions)

    def uncited_debarment():
        d = clean()
        d["risk"]["dimensions"][1] = {"dimension": "regulatory", "level": "High",
                                      "note": "Confirmed debarment in 2024.",
                                      "confidence": "High"}
        validate_dossier(d)
    raises("T7  refuses an UNCITED debarment assertion", AssertedGatingStatusError,
           uncited_debarment)

    def uncited_distress():
        d = clean()
        d["risk"]["dimensions"][0] = {"dimension": "financial", "level": "High",
                                      "note": "The supplier is in financial distress.",
                                      "confidence": "Medium"}
        validate_dossier(d)
    raises("T8  refuses an UNCITED financial-distress assertion", AssertedGatingStatusError,
           uncited_distress)

    d = clean()
    d["risk"]["dimensions"][1] = {"dimension": "regulatory", "level": "High",
                                  "note": "Listed on the SDN list.", "confidence": "High",
                                  "source": "OFAC SDN", "as_of": "2026-05-02"}
    passes("T9  a CITED sanctions finding passes (the gate is on citation, not on topic)", d)

    # --- gating items may not be adjudicated ------------------------------------------
    def cleared():
        d = clean()
        d["risk"]["gating_items"][0]["status"] = "PASS"
        validate_dossier(d)
    raises("T10 refuses a gating item marked PASS (a fabricated clearance)",
           AssertedGatingStatusError, cleared)

    def failed():
        d = clean()
        d["risk"]["gating_items"][0]["status"] = "FAIL"
        validate_dossier(d)
    raises("T11 refuses a gating item marked FAIL", AssertedGatingStatusError, failed)

    def unrouted():
        d = clean()
        d["risk"]["gating_items"][0]["route_to_sme"] = ""
        validate_dossier(d)
    raises("T12 refuses a gating item with no SME route", SchemaError, unrouted)

    # --- drop, do not dilute -----------------------------------------------------------
    def diluted():
        d = clean()
        d["risk"]["dimensions"][1]["note"] = \
            "The supplier may not fully address breach notification requirements."
        validate_dossier(d)
    raises("T13 refuses a DILUTED finding in a risk dimension", DilutedFindingError, diluted)

    def diluted_rec():
        d = clean()
        d["recommendation"]["rationale"] = "It is unclear whether the controls are adequate."
        validate_dossier(d)
    raises("T14 refuses a diluted recommendation rationale", DilutedFindingError, diluted_rec)

    # --- ordinary uncited claims -------------------------------------------------------
    def uncited_note():
        d = clean()
        d["risk"]["dimensions"][1] = {"dimension": "operational", "level": "Medium",
                                      "note": "Delivery capacity is constrained in EMEA.",
                                      "confidence": "Medium"}
        validate_dossier(d)
    raises("T15 refuses an ordinary uncited assertion", UncitedClaimError, uncited_note)

    def bad_conf():
        d = clean()
        d["risk"]["dimensions"][0]["confidence"] = "Fairly sure"
        validate_dossier(d)
    raises("T16 refuses a confidence outside High/Medium/Low", SchemaError, bad_conf)

    def customers_no_log():
        d = clean()
        d["research_log"] = {"internal_sources": [], "web_sources": []}
        validate_dossier(d)
    raises("T17 refuses named customers with an empty research log", UncitedClaimError,
           customers_no_log)

    def no_rationale():
        d = clean()
        d["recommendation"]["rationale"] = ""
        validate_dossier(d)
    raises("T18 refuses a verdict with no rationale", SchemaError, no_rationale)

    raises("T19 refuses a non-dict dossier", SchemaError, lambda: validate_dossier([]))

    d = clean()
    d["risk"]["gating_items"] = []
    passes("T20 NEGATIVE CONTROL: no gating items at all is legitimate", d)

    print("=" * 84)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 84)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
