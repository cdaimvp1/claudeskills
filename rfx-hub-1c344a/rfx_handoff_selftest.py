#!/usr/bin/env python3
"""
Self-test for rfx_handoff_emitter.py (A2).

A2's verify clause: "emit from rfx-hub, ingest in deal-room Phase 1, assert every required
field round-trips and sourceRef survives." That is what T10-T13 do; the rest prove the
refusals actually fire, because an emitter that cannot refuse is not a gate.

Every negative case asserts the SPECIFIC exception type, not merely that something raised.
A test that passes because of an unrelated crash is worse than no test.

Run: python rfx_handoff_selftest.py
"""
from __future__ import annotations

import sys

from rfx_handoff_emitter import (
    TCO_TAG,
    DroppedFindingError,
    NoSelectionError,
    TcoReconciliationError,
    build_handoff,
    to_deal_room_seed,
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


def base_event():
    """A well-formed RfxEvent: one cited commitment, one UNCITED, a reconciling TCO."""
    return {
        "selection": {
            "final": True,
            "supplier": {"id": "sup-1", "name": "Snowflake Inc.", "advisoryTier": "Tier 1"},
        },
        "requirementModel": {"categoryCount": 6, "mustHaveCount": 11},
        "normalizedTco": {
            "allInUnit": 1250000.00,
            "denominatorUnit": "per year, all-in",
            "components": [
                {"label": "Platform subscription", "amount": 900000.00},
                {"label": "Support", "amount": 200000.00},
                {"label": "Professional services", "amount": 150000.00},
            ],
        },
        "awardConditions": [{"text": "SOC 2 Type II before go-live", "status": "open"}],
        "openIssues": [{"text": "Data residency confirmation outstanding"}],
        "commitments": [
            {"text": "Escalator capped at 3% annually", "sourceRef": "BAFO 2026-07-02 p4"},
            {"text": "Exit assistance for 90 days"},          # UNCITED, must be demoted
        ],
        "risks": [{"text": "High variance on the services line"}],
        "evidence": [{"claim": "Escalator capped at 3% annually", "sourceRef": "BAFO 2026-07-02 p4"}],
        "conformanceStatus": "Conforming",
    }


def run():
    print("=" * 84)
    print("rfx_handoff_emitter self-test")
    print("=" * 84)

    h = build_handoff(base_event())

    # --- schema shape -----------------------------------------------------------------
    required = ["selectedSupplier", "requirementModel", "normalizedTco", "awardConditions",
                "openIssues", "commitments", "risks", "evidence", "conformanceStatus",
                "provenanceNote", "draft"]
    ok("T1  every schema field is present", all(k in h for k in required),
       "missing: %s" % [k for k in required if k not in h])
    ok("T2  draft is always true", h["draft"] is True)
    ok("T3  requirementModel note is the locked literal",
       h["requirementModel"]["note"] == "weights locked at scoring")
    ok("T4  TCO carries the canonical em-dash-free tag", h["normalizedTco"]["tag"] == TCO_TAG)
    ok("T5  no em dash anywhere in the emitted object",
       "—" not in repr(h))

    # --- the claim-gate ---------------------------------------------------------------
    texts = [c["text"] for c in h["commitments"]]
    ok("T6  the CITED commitment survives as a commitment",
       texts == ["Escalator capped at 3% annually"], repr(texts))
    ok("T7  every emitted commitment carries a sourceRef",
       all(c["sourceRef"] for c in h["commitments"]))
    confirms = [o["text"] for o in h["openIssues"] if o["text"].startswith("[CONFIRM")]
    ok("T8  the UNCITED commitment is demoted, not dropped",
       confirms == ["[CONFIRM Exit assistance for 90 days]"], repr(confirms))
    ok("T9  the demoted commitment is NOT an agreed position",
       not any("Exit assistance" in c["text"] for c in h["commitments"]))

    # --- round trip into deal-room Phase 1 --------------------------------------------
    seed = to_deal_room_seed(h)
    ok("T10 deal-room seed marks rfx_handoff true",
       seed["meta"]["seeded_from"]["rfx_handoff"] is True)
    ok("T11 supplier name round-trips", seed["meta"]["supplier"] == "Snowflake Inc.")
    ok("T12 sourceRef survives the round trip",
       any(i["sourceRef"] == "BAFO 2026-07-02 p4" for i in seed["issues"]))
    ok("T13 NO seeded issue arrives pre-agreed",
       all(i["state"] == "open" for i in seed["issues"]))
    # 1 surviving commitment + 1 award condition + 2 open issues (the original one, plus
    # the demoted commitment). The demoted one is counted ONCE, as an open issue: it is no
    # longer a commitment. Both inputs still reach the seed, which is the invariant.
    ok("T14 every finding reaches the seed exactly once",
       len(seed["issues"]) == 4, "got %d" % len(seed["issues"]))
    ok("T15 economics carries the indicative tag, not a firm price",
       seed["economics"]["tag"] == TCO_TAG)

    # --- refusals ---------------------------------------------------------------------
    def no_supplier():
        e = base_event(); e["selection"]["supplier"] = {}
        build_handoff(e)
    raises("T16 refuses with no selected supplier", NoSelectionError, no_supplier)

    def not_final():
        e = base_event(); e["selection"]["final"] = False
        build_handoff(e)
    raises("T17 refuses when the selection is not final", NoSelectionError, not_final)

    def bad_sum():
        e = base_event(); e["normalizedTco"]["components"][0]["amount"] = 800000.00
        build_handoff(e)
    raises("T18 refuses a TCO that does not reconcile", TcoReconciliationError, bad_sum)

    def missing_amount():
        e = base_event(); del e["normalizedTco"]["components"][1]["amount"]
        build_handoff(e)
    raises("T19 refuses a component with no amount (never treats it as 0)",
           TcoReconciliationError, missing_amount)

    def no_components():
        e = base_event(); e["normalizedTco"]["components"] = []
        build_handoff(e)
    raises("T20 refuses an unauditable total", TcoReconciliationError, no_components)

    def no_total():
        e = base_event(); del e["normalizedTco"]["allInUnit"]
        build_handoff(e)
    raises("T21 refuses a TCO with no total", TcoReconciliationError, no_total)

    raises("T22 refuses a non-dict event", NoSelectionError, lambda: build_handoff("nope"))

    # --- an unresolved gate conflict must travel --------------------------------------
    e = base_event()
    e["gateConflict"] = {"text": "Must-Have 4 failed but supplier ranks first", "resolved": False}
    h2 = build_handoff(e)
    ok("T23 an unresolved gate conflict is carried into openIssues",
       any("Must-Have 4" in o.get("text", "") for o in h2["openIssues"]))

    e2 = base_event()
    e2["gateConflict"] = {"text": "resolved thing", "resolved": True}
    h3 = build_handoff(e2)
    ok("T24 a RESOLVED gate conflict is not re-raised as open",
       not any("resolved thing" in o.get("text", "") for o in h3["openIssues"]))

    # --- tolerance is a rounding allowance, not a fudge factor ------------------------
    e3 = base_event()
    e3["normalizedTco"]["components"][0]["amount"] = 900000.005
    ok("T25 a sub-cent rounding difference is tolerated",
       build_handoff(e3)["normalizedTco"]["allInUnit"] == 1250000.00)

    # --- no TCO at all is legitimate --------------------------------------------------
    e4 = base_event(); e4["normalizedTco"] = None
    ok("T26 an absent TCO emits null rather than a fabricated zero",
       build_handoff(e4)["normalizedTco"] is None)

    # --- evidence index ----------------------------------------------------------------
    e5 = base_event()
    e5["commitments"][1] = {"text": "Exit assistance for 90 days"}
    e5["evidence"].append({"claim": "Exit assistance for 90 days", "sourceRef": "MSA draft s12"})
    h5 = build_handoff(e5)
    ok("T27 evidence[] can cite a commitment that carries no inline sourceRef",
       any(c["text"] == "Exit assistance for 90 days" for c in h5["commitments"]))
    ok("T28 that citation is the one from evidence[]",
       any(c["sourceRef"] == "MSA draft s12" for c in h5["commitments"]))

    print("=" * 84)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 84)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
