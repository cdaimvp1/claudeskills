#!/usr/bin/env python3
"""
Self-test for panel_contract.py.

The centre of gravity is the SEARCHED_NOT_FOUND rule. Every other state describes our
process; that one makes a claim about the SUPPLIER. If a connector is down and the panel
says "no data found", a broken pipe becomes a clean finding and someone decides on it.
So most of this file exists to prove the code cannot be talked into that claim.

Run: python panel_contract_selftest.py
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from panel_contract import (                                        # noqa: E402
    ACCESS, ContractError, LIBRARY_STATES, STATES, empty_message, resolve_state,
    retrieval_plan,
    unconfirmed_internal, validate_contract, validate_panel,
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
    except Exception as e:                                          # noqa: BLE001
        ok(name, False, "raised %s, expected %s" % (type(e).__name__, exc.__name__))
        return
    ok(name, False, "did not refuse")


SRC = {"name": "OFAC SDN", "access": "public", "type": "regulator",
       "how": "sanctions list lookup by legal entity name"}


def panel(**over):
    p = {"id": "p1", "title": "Panel", "fields": [{"name": "f1", "sources": [dict(SRC)]}]}
    p.update(over)
    return p


def run():
    print("=" * 88)
    print("panel_contract self-test")
    print("=" * 88)

    # --- the state rule ------------------------------------------------------------
    ok("T1  never attempted -> RESEARCH_PENDING (the component library's existing "
       "name, not a new one)",
       resolve_state("f", attempted=False) == "RESEARCH_PENDING")
    ok("T2  attempted but not reached -> SOURCE_UNREACHABLE",
       resolve_state("f", attempted=True, reached=False) == "SOURCE_UNREACHABLE")
    ok("T3  attempted, reached, empty -> SEARCHED_NOT_FOUND",
       resolve_state("f", attempted=True, reached=True) == "SEARCHED_NOT_FOUND")
    ok("T4  requires input -> NEEDS_INPUT",
       resolve_state("f", requires_input=True) == "NEEDS_INPUT")
    ok("T5  not applicable -> NOT_APPLICABLE",
       resolve_state("f", applicable=False) == "NOT_APPLICABLE")

    # THE point of the whole module.
    ok("T6  a FAILED retrieval is never reported as 'not found', because a broken "
       "connector would otherwise become a clean finding about the supplier",
       resolve_state("f", attempted=True, reached=False) != "SEARCHED_NOT_FOUND")
    ok("T7  and an un-run retrieval is never reported as 'not found' either",
       resolve_state("f", attempted=False, reached=True) != "SEARCHED_NOT_FOUND")
    ok("T8  NOT_APPLICABLE beats every other signal, because a category error is not a "
       "research action",
       resolve_state("f", applicable=False, attempted=True, reached=True,
                     requires_input=True) == "NOT_APPLICABLE")
    ok("T9  NEEDS_INPUT beats attempted state, because no amount of searching produces it",
       resolve_state("f", requires_input=True, attempted=True, reached=True)
       == "NEEDS_INPUT")

    raises("T10 refuses to compute an empty state for a field that HAS data",
           ContractError,
           lambda: resolve_state("f", attempted=True, reached=True, found=True))

    # --- the message ----------------------------------------------------------------
    m = empty_message("cyber cert", "SOURCE_UNREACHABLE", [SRC])
    ok("T11 an unreachable panel NAMES the source it could not reach",
       "OFAC SDN" in m["text"], m["text"])
    ok("T12 and tells the reader what to do", "Retry" in m["action"])
    m2 = empty_message("cyber cert", "SEARCHED_NOT_FOUND", [SRC])
    ok("T13 a not-found panel says WHERE it checked", "Checked OFAC SDN" in m2["text"])
    ok("T14 the two messages are clearly different to a reader",
       m["text"] != m2["text"] and m["label"] != m2["label"])
    m3 = empty_message("stage", "NEEDS_INPUT", [])
    ok("T15 a needs-input panel asks the user rather than reporting a gap",
       "from you" in m3["text"] and "Provide" in m3["action"])
    ok("T16 every state has a label and an action",
       all(empty_message("x", s, [SRC])["label"] and empty_message("x", s, [SRC])["action"]
           for s in STATES))
    raises("T17 refuses an unknown state", ContractError,
           lambda: empty_message("x", "PROBABLY_FINE", [SRC]))

    # --- panels never disappear ------------------------------------------------------
    raises("T18 refuses hide_when_empty, because a hidden panel looks like one that was "
           "never meant to exist", ContractError,
           lambda: validate_panel(panel(hide_when_empty=True)))

    # --- every field must declare where it comes from ---------------------------------
    raises("T19 refuses a field with no source and no requires_input flag",
           ContractError,
           lambda: validate_panel(panel(fields=[{"name": "f1"}])))
    ok("T20 ALLOWS a field with no source when it is marked requires_input",
       bool(validate_panel(panel(fields=[{"name": "f1", "requires_input": True}]))))

    raises("T21 refuses a source with no name", ContractError,
           lambda: validate_panel(panel(fields=[{"name": "f", "sources": [
               {"access": "public", "how": "x"}]}])))
    raises("T22 refuses a source that does not say HOW to reach it, because a name "
           "without a route is still a blind search", ContractError,
           lambda: validate_panel(panel(fields=[{"name": "f", "sources": [
               {"name": "Somewhere", "access": "public"}]}])))
    raises("T23 refuses an access outside the declared set", ContractError,
           lambda: validate_panel(panel(fields=[{"name": "f", "sources": [
               {"name": "X", "access": "vibes", "how": "y"}]}])))
    raises("T24 refuses a panel with no fields", ContractError,
           lambda: validate_panel(panel(fields=[])))
    raises("T25 refuses a panel with no id", ContractError,
           lambda: validate_panel(panel(id="")))

    # --- unconfirmed internal sources are surfaced, not guessed away -------------------
    doc = {"dashboard": "T", "panels": [panel(fields=[{"name": "f", "sources": [
        {"name": "Some Lilly system", "access": "internal", "how": "lookup"}]}])]}
    unc = unconfirmed_internal(doc)
    ok("T26 an unconfirmed INTERNAL source is reported for the owner to confirm",
       len(unc) == 1 and unc[0]["source"] == "Some Lilly system")
    doc2 = {"dashboard": "T", "panels": [panel(fields=[{"name": "f", "sources": [
        {"name": "Confirmed system", "access": "internal", "how": "lookup",
         "confirmed_by_owner": True}]}])]}
    ok("T27 a confirmed internal source is not flagged", unconfirmed_internal(doc2) == [])
    ok("T28 a PUBLIC source is never flagged for confirmation",
       unconfirmed_internal({"dashboard": "T", "panels": [panel()]}) == [])

    # --- duplicate ids ----------------------------------------------------------------
    raises("T29 refuses duplicate panel ids", ContractError,
           lambda: validate_contract({"dashboard": "T", "panels": [panel(), panel()]}))
    raises("T30 refuses a contract with no panels", ContractError,
           lambda: validate_contract({"dashboard": "T", "panels": []}))

    # --- the retrieval plan: the anti-blind-search payoff ------------------------------
    # Contract discovery must work BOTH ways, and this is not a detail:
    #
    #   installed  a skill is one folder with no siblings, so the only contract that
    #              exists is the one shipped beside this file
    #   in-repo    all four contracts are present as sibling directories
    #
    # The first version of this only looked at siblings and passed in the repo while
    # failing in every installed skill. The smoke test caught it, which is the whole
    # reason A4 runs each self-test in an isolated copy.
    shipped = {}
    local = os.path.join(HERE, "panel_sources.json")
    if os.path.isfile(local):
        with open(local, encoding="utf-8") as fh:
            doc = json.load(fh)
        shipped[doc.get("dashboard", "local")] = doc

    for rel in ("../deal-tab-1c344a/panel_sources.json",
                "../rfx-hub-1c344a/panel_sources.json",
                "../category-strategy-1c344a/panel_sources.json",
                "../supplier-landscape-1c344a/panel_sources.json"):
        path = os.path.join(HERE, rel)
        if not os.path.isfile(path):
            continue                      # installed alone; siblings are EXPECTED absent
        with open(path, encoding="utf-8") as fh:
            doc = json.load(fh)
        shipped[doc.get("dashboard", rel)] = doc

    ok("T31 at least one contract is reachable (its own when installed alone, all four "
       "in the repo)", bool(shipped), "found none from %s" % HERE)
    for dash, doc in shipped.items():
        ok("T31 %s contract validates" % dash, bool(validate_contract(doc)))

    for dash, doc in shipped.items():
        plan = retrieval_plan(doc)
        lookups = sum(p["answers"] for p in plan["passes"])
        ok("T32 %s: retrieval groups %d field lookups into %d source visits, which is the "
           "whole point (one visit per source, not one search per field)"
           % (dash, lookups, plan["sources"]),
           plan["sources"] < lookups)
        ok("T33 %s: every source in the plan says how to reach it" % dash,
           all(p["how"] for p in plan["passes"]))
        ok("T34 %s: no panel can be hidden when empty" % dash,
           not any(p.get("hide_when_empty") for p in doc["panels"]))
        ok("T35 %s: every field either names a source or asks the user" % dash,
           all((f.get("sources") or f.get("requires_input"))
               for p in doc["panels"] for f in p["fields"]))


    # --- all four locked dashboards are covered -------------------------------------
    # Asserted only when the siblings are visible. Installed alone a skill can see one
    # contract, and demanding four there would fail a correctly-installed skill.
    total_panels = sum(len(d["panels"]) for d in shipped.values())
    if len(shipped) > 1:
        ok("T36 all four design-locked dashboards have a contract", len(shipped) == 4,
           "got %s" % sorted(shipped))
        ok("T37 the four contracts cover %d panels between them" % total_panels,
           total_panels >= 130, "got %d" % total_panels)
    else:
        only = list(shipped)[0]
        ok("T36 installed alone: %s's own contract is present and is the only one "
           "expected" % only, True)
        ok("T37 and it covers %d panel(s)" % total_panels, total_panels > 0)
    ok("T38 no two panels within a dashboard share an id",
       all(len(set(p["id"] for p in d["panels"])) == len(d["panels"])
           for d in shipped.values()))
    ok("T39 every panel names the tab it sits on, so a redesign can re-map it",
       all(p.get("tab") for d in shipped.values() for p in d["panels"]))
    ok("T40 every field with a note explains itself in a full sentence",
       all(len(f.get("note", "")) > 20
           for d in shipped.values() for p in d["panels"] for f in p["fields"]
           if f.get("note")))


    # --- reconciliation with the existing component library ---------------------------
    ok("T41 the three states the shared StateBanner already had are reused, not renamed",
       all(k in STATES for k in LIBRARY_STATES))
    ok("T42 and their labels are the library's words verbatim",
       [__import__("panel_contract").STATE_LABEL[k] for k in LIBRARY_STATES]
       == ["Needs input", "Not applicable", "Research pending"])
    ok("T43 exactly two states are new, and they are the two the library could not express",
       sorted(set(STATES) - set(LIBRARY_STATES))
       == ["SEARCHED_NOT_FOUND", "SOURCE_UNREACHABLE"])
    ok("T44 the old invented name is gone", "NOT_ATTEMPTED" not in STATES)

    # --- the merges --------------------------------------------------------------------
    names = set()
    for d in shipped.values():
        for pan in d["panels"]:
            for fl in pan["fields"]:
                for src in fl.get("sources") or []:
                    names.add(src["name"])
    ok("T45 'SME gate outcomes' was merged into 'SME review outcome'",
       "SME gate outcomes" not in names and "SME review outcome" in names)
    ok("T46 'Prior Lilly contracts for this supplier' was merged into 'Contract repository'",
       "Prior Lilly contracts for this supplier" not in names)
    ok("T47 no field lists the same source twice after the merge",
       all(len(set(s["name"] for s in (fl.get("sources") or [])))
           == len(fl.get("sources") or [])
           for d in shipped.values() for pan in d["panels"] for fl in pan["fields"]))

    print("=" * 88)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 88)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
