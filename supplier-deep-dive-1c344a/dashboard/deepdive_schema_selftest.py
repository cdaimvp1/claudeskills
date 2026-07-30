#!/usr/bin/env python3
"""
Self-test for deepdive_schema.py and build_profile_dashboard.py (A5 stage 1).

Structure: one tamper test per defect the spec names in the v2 build. The spec is mostly a
list of things that went wrong, so the suite plants each one and asserts the validator
refuses. A check that only ever sees good data proves nothing about the case it exists for.

Includes NEGATIVE CONTROLS: honestly incomplete records that must PASS. A validator that
refuses a supplier for having gaps would push an author toward inventing values, which is
the exact failure this redesign exists to prevent.

Run: python deepdive_schema_selftest.py
"""
from __future__ import annotations

import copy
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build_profile_dashboard as BPD                                # noqa: E402
import deepdive_viz as VIZ                                           # noqa: E402
from deepdive_schema import (                                        # noqa: E402
    CompositeScoreError, DIMENSIONS, FabricatedFigureError, GateError, SchemaError,
    validate_supplier,
)

SEED = os.path.join(HERE, "assets", "seed", "snowflake.json")
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
    except Exception as e:                                           # noqa: BLE001
        ok(name, False, "raised %s, expected %s" % (type(e).__name__, exc.__name__))
        return
    ok(name, False, "did not refuse")


def base():
    with open(SEED, encoding="utf-8") as fh:
        return copy.deepcopy(json.load(fh)["suppliers"][0])


def run():
    print("=" * 90)
    print("deep-dive schema + builder self-test")
    print("=" * 90)

    ok("T1  the shipped seed validates", bool(validate_supplier(base())))

    s = base()
    ok("T2  all eight dimensions are present in the seed",
       all(d in s["dimensions"] for d in DIMENSIONS))

    # --- spec:21-22, the seed defect the spec names by hand ------------------------------
    cyber = s["dimensions"]["cyber_privacy_data"]
    ok("T3  the UNC5537 incident is filed under CYBER, which is the seed fix the spec "
       "names (v2 had it under 'ML / data-science depth')",
       any("UNC5537" in (e.get("raw_value") or "") for e in cyber["evidence"]))
    ok("T4  and it is nowhere in capability_fit",
       not any("UNC5537" in (e.get("raw_value") or "")
               for e in s["dimensions"]["capability_fit"]["evidence"]))

    # --- spec:27-28, no composite score ---------------------------------------------------
    for key in ("composite_score", "overall_score", "fit_score"):
        def add(k=key):
            d = base()
            d[k] = 89
            validate_supplier(d)
        raises("T5  refuses a %r field (v2 showed 89/100, 90/100 and 4.5/5 for one "
               "supplier)" % key, CompositeScoreError, add)

    # --- spec:30-31, no fabricated money --------------------------------------------------
    def money_no_source():
        d = base()
        d["dimensions"]["financial_viability"]["evidence"].append({
            "field": "Estimated annual cost", "status": "Verified",
            "raw_value": "$3.1M per year", "source_name": "Public price list",
            "source_type": "web", "source_date": "2026-07-17"})
        validate_supplier(d)
    raises("T6  refuses a precise $ figure sourced only to public pricing, because it "
           "reads as a bid", FabricatedFigureError, money_no_source)

    def money_with_bid():
        d = base()
        d["dimensions"]["financial_viability"]["evidence"].append({
            "field": "Quoted annual cost", "status": "Verified",
            "raw_value": "$3.1M per year", "source_name": "Supplier bid, RFP-2026-014",
            "source_type": "bid", "source_date": "2026-07-20"})
        return validate_supplier(d)
    ok("T7  ALLOWS the same figure when a bid supports it (the gate is on support, not "
       "on the currency symbol)", bool(money_with_bid()))

    def money_in_rationale():
        d = base()
        d["recommendation"]["rationale"] = "Expected to cost about $2.4M annually."
        d["recommendation"]["source_types"] = ["web"]
        validate_supplier(d)
    raises("T8  refuses an unsupported $ in the recommendation rationale too, not just "
           "in evidence", FabricatedFigureError, money_in_rationale)

    # --- spec:62-63, statuses ------------------------------------------------------------
    def bad_status():
        d = base()
        d["dimensions"]["capability_fit"]["evidence"][0]["status"] = "Looks fine"
        validate_supplier(d)
    raises("T9  refuses a retrieval status outside the seven defined states",
           SchemaError, bad_status)

    def known_without_source():
        d = base()
        d["dimensions"]["capability_fit"]["evidence"][0]["source_name"] = ""
        validate_supplier(d)
    raises("T10 refuses 'Verified' with no named source", SchemaError,
           known_without_source)

    def known_without_date():
        d = base()
        d["dimensions"]["capability_fit"]["evidence"][0]["source_date"] = ""
        validate_supplier(d)
    raises("T11 refuses 'Verified' with no source date", SchemaError, known_without_date)

    # --- spec:16-17, equal authority ------------------------------------------------------
    def confident_no_evidence():
        d = base()
        d["dimensions"]["quality_regulatory_ehs"]["assessment"] = "Strong"
        d["dimensions"]["quality_regulatory_ehs"]["confidence"] = "verified"
        d["dimensions"]["quality_regulatory_ehs"]["evidence"] = []
        validate_supplier(d)
    raises("T12 refuses a 'verified' assessment with zero evidence entries",
           SchemaError, confident_no_evidence)

    def contradiction():
        d = base()
        d["dimensions"]["quality_regulatory_ehs"]["confidence"] = "verified"
        validate_supplier(d)
    raises("T13 refuses 'Insufficient evidence' claiming verified confidence, which is "
           "the internal-inconsistency class the spec calls out", SchemaError,
           contradiction)

    # --- spec:67-73, gates override -------------------------------------------------------
    def gate_in_average():
        d = base()
        d["gates"][0]["counts_toward_aggregate"] = True
        validate_supplier(d)
    raises("T14 refuses a gate marked as counting toward the aggregate, because folding "
           "a stop into an average turns it into a slightly lower score",
           GateError, gate_in_average)

    def unowned_gate():
        d = base()
        d["gates"][0]["owner"] = ""
        validate_supplier(d)
    raises("T15 refuses a gate with no owner", GateError, unowned_gate)

    def advance_despite_hard_stop():
        d = base()
        d["gates"].append({"kind": "HARD_STOP", "reason": "Confirmed sanctions match",
                           "owner": "Compliance", "status": "open",
                           "counts_toward_aggregate": False})
        validate_supplier(d)
    raises("T16 refuses 'Advance' while a HARD STOP is open", GateError,
           advance_despite_hard_stop)

    def hard_stop_with_hold():
        d = base()
        d["gates"].append({"kind": "HARD_STOP", "reason": "Confirmed sanctions match",
                           "owner": "Compliance", "status": "open",
                           "counts_toward_aggregate": False})
        d["recommendation"]["verdict"] = "Hold pending Compliance screen"
        return validate_supplier(d)
    ok("T17 ALLOWS a hard stop when the verdict respects it", bool(hard_stop_with_hold()))

    # --- evidence coverage ----------------------------------------------------------------
    def coverage_not_100():
        d = base()
        d["evidence_coverage"]["missing"] = 40
        validate_supplier(d)
    raises("T18 refuses an evidence-coverage bar that does not sum to 100",
           SchemaError, coverage_not_100)

    # --- dimensions are fixed --------------------------------------------------------------
    def dropped_dimension():
        d = base()
        del d["dimensions"]["responsible_sourcing_evidence"]
        validate_supplier(d)
    raises("T19 refuses a record missing a dimension, so a weak area cannot be hidden by "
           "omitting its row", SchemaError, dropped_dimension)

    def bad_position():
        d = base()
        d["dimensions"]["capability_fit"]["position"] = 140
        validate_supplier(d)
    raises("T20 refuses a bar position outside 0-100", SchemaError, bad_position)

    # --- NEGATIVE CONTROLS: honest incompleteness must pass ---------------------------------
    def all_insufficient():
        d = base()
        for did in DIMENSIONS:
            d["dimensions"][did].update(assessment="Insufficient evidence",
                                        confidence="insufficient", position=10,
                                        evidence=[{"field": "Any", "status": "Not found",
                                                   "raw_value": "", "source_name": "",
                                                   "source_type": "", "source_date": ""}])
        d["evidence_coverage"] = {"verified": 0, "partial": 0, "supplier_input": 0,
                                  "missing": 100}
        d["recommendation"]["verdict"] = "Insufficient evidence to assess"
        return validate_supplier(d)
    ok("T21 NEGATIVE CONTROL: a supplier with NO evidence at all passes, reported as "
       "insufficient rather than refused", bool(all_insufficient()))

    def no_gates():
        d = base()
        d["gates"] = []
        return validate_supplier(d)
    ok("T22 NEGATIVE CONTROL: no gates raised is a legitimate record", bool(no_gates()))

    # --- the builder -------------------------------------------------------------------------
    r = BPD.build()
    page = open(r["out"], encoding="utf-8").read()
    ok("T23 the builder produces a page", r["bytes"] > 5000)
    ok("T24 all eight dimension labels render",
       all(lbl.replace("&amp;", "&") in page.replace("&amp;", "&")
           for lbl in BPD.DIM_LABELS.values()))
    ok("T25 no composite score appears anywhere in the rendered page",
       "/100" not in page and "out of 100" not in page)
    ok("T26 the evidence-coverage percentages render", "46%" in page and "18%" in page)
    ok("T27 both escalation gates render with their owners",
       page.count("ESCALATION") == 2 and "Cyber (SAE)" in page and "Privacy" in page)
    ok("T28 the page states that bar length is not a score", "not a score" in page)
    ok("T29 the page is self-contained (no external reference)",
       'src="http' not in page and 'href="http' not in page and "fetch(" not in page)
    ok("T30 no green is used as the positive accent (locked colour rule)",
       "#0F3A85" in page and "green" not in page.lower())

    # the derived risk posture must follow the gates, not be authored
    ok("T31 risk posture is DERIVED: 2 escalations produce a conditional posture",
       "2 escalations open" in page.replace("&middot;", "·"))

    def builder_refuses_bad_seed():
        import tempfile
        d = {"suppliers": [base()]}
        d["suppliers"][0]["composite_score"] = 91
        p = os.path.join(tempfile.mkdtemp(), "bad.json")
        with open(p, "w", encoding="utf-8") as fh:
            json.dump(d, fh)
        BPD.build(p)
    raises("T32 the BUILDER refuses invalid data rather than rendering it, because a "
           "rendered page is indistinguishable from a trustworthy one",
           CompositeScoreError, builder_refuses_bad_seed)


    # ============================================================================
    # STAGE 2: visualization selection (spec:136-145). These are the checks that
    # stop the dashboard drawing a shape the evidence cannot carry, which is the
    # spec's closing instruction and the most likely way this page lies.
    # ============================================================================
    ok("T34 trend: 3+ comparable dated periods gives a LINE",
       VIZ.choose_trend([{"metric": "Revenue", "source_date": "2024"},
                         {"metric": "Revenue", "source_date": "2025"},
                         {"metric": "Revenue", "source_date": "2026"}])[0] == "line")
    ok("T35 trend: 3 periods of MIXED metrics does NOT give a line, because a trend "
       "line would imply a comparability the data lacks",
       VIZ.choose_trend([{"metric": "Revenue", "source_date": "2024"},
                         {"metric": "Headcount", "source_date": "2025"},
                         {"metric": "Revenue", "source_date": "2026"}])[0] == "bars")
    ok("T36 trend: 2 periods gives bars, not a line",
       VIZ.choose_trend([{"metric": "R", "source_date": "2025"},
                         {"metric": "R", "source_date": "2026"}])[0] == "bars")
    k, r = VIZ.choose_trend([{"metric": "R", "source_date": "2026"}])
    ok("T37 trend: ONE period gives a metric card", k == "card")
    ok("T38 and says a line through one point would invent a direction",
       "invent a direction" in r)
    ok("T39 trend: no periods gives a stated information requirement",
       VIZ.choose_trend([])[0] == "required")
    ok("T40 trend: an UNDATED period cannot form a line",
       VIZ.choose_trend([{"metric": "R", "source_date": ""},
                         {"metric": "R", "source_date": "2025"},
                         {"metric": "R", "source_date": "2026"}])[0] == "bars")

    ok("T41 ownership: a single node does NOT draw a tree",
       VIZ.choose_ownership({"nodes": [{"id": "a"}]})[0] == "matrix-only")
    ok("T42 ownership: two nodes DO draw a tree",
       VIZ.choose_ownership({"nodes": [{"id": "a"}, {"id": "b"}]})[0] == "tree")
    ok("T43 ownership: one node draws a tree when the contracting entity differs",
       VIZ.choose_ownership({"nodes": [{"id": "a"}],
                             "contracting_entity_differs": True})[0] == "tree")
    ok("T44 ownership: one node draws a tree when UBO is required and unresolved",
       VIZ.choose_ownership({"nodes": [{"id": "a"}], "ubo_required": True,
                             "ubo_status": "Data source required"})[0] == "tree")

    ok("T45 map: no confirmed locations gives a requirement, never a country outline",
       VIZ.choose_map({"entries": []})[0] == "required")
    ok("T46 map: real locations give a schematic",
       VIZ.choose_map({"entries": [{"site": "x"}]})[0] == "schematic")

    k, r = VIZ.choose_network([{"name": "AWS", "confidence": "Verified"},
                               {"name": "Partner", "confidence": "Data source required"}])
    ok("T47 network: confirmed dependencies are drawn", k == "diagram")
    ok("T48 and unconfirmed ones are counted as NOT drawn, because a node on a diagram "
       "reads as a confirmed relationship", "not drawn" in r)
    ok("T49 network: dependencies that are ALL unconfirmed are listed, not drawn",
       VIZ.choose_network([{"name": "x", "confidence": "Data source required"}])[0]
       == "list")
    ok("T50 network: none disclosed gives a requirement",
       VIZ.choose_network([])[0] == "required")

    k, r = VIZ.choose_risk_matrix([{"impact": 3, "likelihood": 2},
                                   {"impact": 5, "likelihood": None}])
    ok("T51 risk: risks scored on both axes are plotted", k == "matrix")
    ok("T52 and an unscored risk is listed separately rather than dropped, so the "
       "matrix is not mistaken for the whole picture", "listed separately" in r)
    ok("T53 risk: nothing scored on both axes gives a list, not a matrix on axes that "
       "were never scored",
       VIZ.choose_risk_matrix([{"impact": 3, "likelihood": None}])[0] == "list")

    ok("T54 peers: none captured gives a requirement, because a single point shows "
       "position relative to nothing", VIZ.choose_peer_scatter([])[0] == "required")
    ok("T55 peers: 3 or more give a scatter",
       VIZ.choose_peer_scatter([1, 2, 3])[0] == "scatter")

    # --- the six subtabs render -----------------------------------------------------
    ok("T56 all six subtabs are present",
       all(('id="p-%s"' % t) in page for t, _ in BPD.SUBTABS))
    ok("T57 every subtab pane carries content",
       all(len(page.split('id="p-%s"' % t)[1][:400]) > 200 for t, _ in BPD.SUBTABS))
    ok("T58 the chosen-visual REASON is rendered on the page, not just decided in code",
       page.count('class="why"') >= 4)
    ok("T59 the ownership tree is NOT drawn for this public single-entity supplier",
       "one-node tree would imply" in page)
    ok("T60 the financial trend fell back to a metric card and said why",
       "invent a direction" in page)
    ok("T61 the unplottable GxP risk is named rather than dropped",
       "GxP qualification shortfall" in page)
    ok("T62 no double negative survives in the generated prose",
       "cannot not" not in page)
    ok("T63 the page is still self-contained after stage 2",
       'src="http' not in page and "fetch(" not in page)

    BPD.build()
    ok("T64 rebuilds clean after the tamper tests", True)

    print("=" * 90)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 90)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
