#!/usr/bin/env python3
"""
Self-test for retrieval_index.py.

The tests that matter most here are the MISS tests. Narrowing can only ever lose coverage
relative to today, because today every corpus is loaded in full. So the question this
suite has to answer is not "does the index find the right sections" but "when it does NOT
find them, does it fall back to the full corpus instead of returning an empty list a
caller would read as nothing-to-check".

Run: python retrieval_index_selftest.py
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from retrieval_index import (                                    # noqa: E402
    build_all,
    build_playbook_index,
    build_vendor_tactics_index,
    select_commercial,
    select_playbook,
    select_vendor_tactics,
)

PASS, FAIL = [], []


def ok(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("  ok   " if cond else "  FAIL ") + name + (("  <- " + detail) if detail and not cond else ""))


def run():
    print("=" * 88)
    print("retrieval_index self-test")
    print("=" * 88)

    pb = build_playbook_index()
    vt = build_vendor_tactics_index()

    # --- the index is derived and complete ---------------------------------------------
    ok("T1  playbook indexes all 27 '###' sections", len(pb) == 27, "got %d" % len(pb))
    ok("T2  all 6 Hard Stops are indexed",
       sum(1 for e in pb if e["hard_stop"]) == 6)
    ok("T3  every playbook section resolves to a topic tag",
       all(e["topic"] for e in pb),
       "untagged: %s" % [e["heading"] for e in pb if not e["topic"]])
    ok("T4  vendor-tactics indexes all 6 document types", len(vt) == 6, "got %d" % len(vt))

    # --- the numeric label is an alias, never the key -----------------------------------
    # HS-2 cites §26 and the governing-law section IS §26. Keying on the number would
    # merge debarment certification into governing law.
    s26 = [e for e in pb if "26" in e["aliases"]]
    ok("T5  §26 maps to MORE THAN ONE section, proving the number cannot be the key",
       len(s26) > 1, "found %d" % len(s26))
    ok("T6  those §26 sections carry DIFFERENT topic tags",
       len(set(e["topic"] for e in s26)) > 1,
       "tags: %s" % sorted(set(e["topic"] for e in s26)))

    # --- the applicability matrix, read from the table and not from prose ---------------
    of = select_vendor_tactics("Order Form")
    ok("T7  Order Form narrows rather than falling back", not of.fallback)
    ok("T8  Order Form loads categories 1, 6 AND 8, not the 1-and-6 the spec prose claims",
       sorted(of.sections) == [1, 6, 8], "got %s" % sorted(of.sections))
    ok("T9  category 8 (Compliance/Security Gaps) applies to EVERY document type",
       all(8 in [a["category"] for a in v] for v in vt.values()))
    msa = select_vendor_tactics("MSA")
    ok("T10 MSA narrows to categories 1 and 8", sorted(msa.sections) == [1, 8],
       "got %s" % sorted(msa.sections))
    ok("T11 MSA category 1 keeps its 'Rate card only' qualifier rather than flattening it",
       any(a["category"] == 1 and "rate card" in a["qualifier"].lower()
           for a in vt["MSA"]))
    co = select_vendor_tactics("Change Order")
    ok("T12 Change Order loads all 12 categories", sorted(co.sections) == list(range(1, 13)))

    # --- MISS BEHAVIOUR: the rule that must not erode ------------------------------------
    novel = select_vendor_tactics("Letter Agreement")
    ok("T13 an unknown document type FALLS BACK, it does not narrow", novel.fallback)
    ok("T14 the fallback says why, in words a reader can act on",
       "not in the applicability matrix" in novel.reason)
    ok("T15 a fallback returns an EMPTY section list, so a caller that ignores the flag "
       "cannot silently 'check nothing'",
       novel.sections == [] and novel.fallback is True)

    empty = select_vendor_tactics("")
    ok("T16 an empty document type falls back", empty.fallback)
    none_dt = select_vendor_tactics(None)
    ok("T17 a None document type falls back rather than raising", none_dt.fallback)

    # --- playbook selection --------------------------------------------------------------
    sel = select_playbook(["insurance", "termination"])
    ok("T18 two known topics narrow the playbook", not sel.fallback)
    ok("T19 the narrowed set is smaller than the whole playbook",
       len(sel.sections) < len(pb), "%d of %d" % (len(sel.sections), len(pb)))
    ok("T20 ALL SIX Hard Stops load even though neither topic asked for them",
       sum(1 for s in sel.sections if s.startswith("HS-")) == 6,
       "got %d" % sum(1 for s in sel.sections if s.startswith("HS-")))
    ok("T21 the requested topics are actually present",
       any("Insurance" in s for s in sel.sections)
       and any("Termination" in s for s in sel.sections))

    miss = select_playbook(["insurance", "escrow"])
    ok("T22 ONE unresolvable topic falls back to the FULL playbook, it does not "
       "silently drop that clause", miss.fallback)
    ok("T23 the fallback names the topic that missed", "'escrow'" in miss.reason)
    ok("T24 a partial match does not quietly return only the resolvable half",
       miss.sections == [])

    ok("T25 no topics at all falls back", select_playbook([]).fallback)
    ok("T26 None topics falls back", select_playbook(None).fallback)
    ok("T27 blank-string topics fall back rather than matching nothing",
       select_playbook(["  ", ""]).fallback)

    hs_only = select_playbook(["sanctions"])
    ok("T28 a Hard Stop topic still loads all six Hard Stops, not just its own",
       sum(1 for s in hs_only.sections if s.startswith("HS-")) == 6)

    # --- commercial gate ------------------------------------------------------------------
    ok("T29 Order Form reads FULL commercial analysis",
       select_commercial("Order Form").sections == ["full"])
    ok("T30 SOW reads FULL", select_commercial("SOW").sections == ["full"])
    ok("T31 DPA reads LIMITED", select_commercial("DPA").sections == ["limited"])
    ok("T32 CDA reads LIMITED", select_commercial("CDA").sections == ["limited"])
    ok("T33 MSA WITH pricing reads FULL",
       select_commercial("MSA", has_pricing=True).sections == ["full"])
    ok("T34 MSA WITHOUT pricing reads LIMITED",
       select_commercial("MSA", has_pricing=False).sections == ["limited"])
    unk = select_commercial("MSA")
    ok("T35 MSA with UNKNOWN pricing reads FULL, the safe direction",
       unk.sections == ["full"] and not unk.fallback)
    ok("T36 and it says WHY it chose the fuller branch", "UNKNOWN" in unk.reason)
    ok("T37 an uncovered document type falls back to the full corpus",
       select_commercial("Letter Agreement").fallback)

    # --- case and whitespace ---------------------------------------------------------------
    ok("T38 document type matching is case-insensitive",
       sorted(select_vendor_tactics("order form").sections) == [1, 6, 8])
    ok("T39 and tolerant of surrounding whitespace",
       sorted(select_vendor_tactics("  MSA  ").sections) == [1, 8])
    ok("T40 topic matching is case-insensitive",
       not select_playbook(["INSURANCE"]).fallback)

    # --- longest-keyword resolution ---------------------------------------------------------
    tags = dict((e["heading"], e["topic"]) for e in pb)
    liability = [t for h, t in tags.items() if "Limitation of Liability" in h]
    ok("T41 'Limitation of Liability' resolves to liability-cap, not the shorter 'liability'",
       liability == ["liability-cap"], "got %s" % liability)

    summary = build_all()
    ok("T42 build_all reports zero untagged sections",
       summary["playbook"]["untagged"] == [])

    print("=" * 88)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 88)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
