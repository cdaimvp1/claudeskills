#!/usr/bin/env python3
"""
panel_contract.py -- what every dashboard panel needs, where it comes from, and what it
says when it has nothing.

WHY THIS EXISTS (Marc, 2026-07-29)
----------------------------------
The dashboards are design-locked. Two things still needed fixing, and neither is visual:

  1. A panel with no data must NEVER disappear, and must never sit blank. It stays, and it
     says WHY it is empty and what the reader should do about it.
  2. Each panel must know its own sources, so retrieval goes straight to the 10-K, or OFAC,
     or the spend data, instead of a blind web search.

Before this, a panel-to-source map did not exist anywhere in the suite. Deal and RFx had no
source declarations at all.

THE RULE THAT MATTERS MOST
--------------------------
"Searched and found nothing" and "could not reach the source" look identical to a reader if
you are careless, and they mean opposite things. If a connector is down and the panel says
"no data found", a broken pipe silently becomes a clean finding about the supplier, and
someone makes a decision on it.

So `resolve_state()` REFUSES to return SEARCHED_NOT_FOUND unless a retrieval actually ran
and came back empty. Absent that evidence the honest answer is NOT_ATTEMPTED. A panel may
under-claim; it may never over-claim.

WHY A DATA FILE AND NOT RENDERER CODE
-------------------------------------
Marc may redesign the dashboards later. The contract is per-panel data, so a layout change
does not throw this work away, and the retrieval step gets a checklist rather than a prompt.

Stdlib only. Vendored into each consuming skill; drift is checked by kernel_manifest.
"""
from __future__ import annotations

import json
import sys

# ---------------------------------------------------------------- the five empty states

# Ordered from "someone must act" to "nothing to do".
STATES = (
    "NEEDS_INPUT",         # must come from the user or the supplier
    "SOURCE_UNREACHABLE",  # we tried and could not get there
    "NOT_ATTEMPTED",       # retrieval has not run
    "SEARCHED_NOT_FOUND",  # we looked in the right place; it genuinely is not there
    "NOT_APPLICABLE",      # this subject type has no such thing
)

# Reader-facing wording. The dashboards are locked, so this is the text a panel shows in
# place of content, not a redesign of the panel.
STATE_LABEL = {
    "NEEDS_INPUT": "Needs your input",
    "SOURCE_UNREACHABLE": "Source unreachable",
    "NOT_ATTEMPTED": "Not retrieved yet",
    "SEARCHED_NOT_FOUND": "Searched, not found",
    "NOT_APPLICABLE": "Not applicable",
}

# What the reader is being asked to DO. An empty state with no action is just a nicer blank.
STATE_ACTION = {
    "NEEDS_INPUT": "Provide this, or request it from the supplier.",
    "SOURCE_UNREACHABLE": "Retry, or check access to the source.",
    "NOT_ATTEMPTED": "Run this panel's retrieval.",
    "SEARCHED_NOT_FOUND": "No action. The gap is real and is recorded as one.",
    "NOT_APPLICABLE": "No action. This does not exist for this subject.",
}

# Where a source lives. `internal` is called out because those are the ones only Marc can
# confirm, and a confidently wrong internal system name is worse than an honest blank.
ACCESS = ("public", "supplier", "internal", "licensed")


class ContractError(Exception):
    """Raised rather than rendering a panel whose contract is wrong."""


def _txt(v):
    return v.strip() if isinstance(v, str) else ""


# ------------------------------------------------------------------------ the state rule

def resolve_state(field, attempted=False, reached=False, found=False,
                  requires_input=False, applicable=True):
    """Decide a field's empty state from what actually happened during retrieval.

    The argument order is the decision order, and it is deliberate:

      not applicable  -> NOT_APPLICABLE   (a category error; nothing to retrieve)
      requires input  -> NEEDS_INPUT      (no amount of searching produces it)
      never attempted -> NOT_ATTEMPTED
      attempted, could not reach -> SOURCE_UNREACHABLE
      attempted, reached, empty  -> SEARCHED_NOT_FOUND

    SEARCHED_NOT_FOUND is the only state that makes a claim ABOUT THE SUBJECT rather than
    about our process, which is why it is the only one gated on evidence that we actually
    looked.
    """
    if not applicable:
        return "NOT_APPLICABLE"
    if requires_input:
        return "NEEDS_INPUT"
    if not attempted:
        return "NOT_ATTEMPTED"
    if not reached:
        return "SOURCE_UNREACHABLE"
    if found:
        raise ContractError(
            "field %r reports found=True, so it has data and has no empty state. Calling "
            "resolve_state on a populated field means the caller has lost track of which "
            "fields are empty." % field)
    return "SEARCHED_NOT_FOUND"


def empty_message(field, state, sources=None, detail=""):
    """The text a panel shows in place of content. Always names the expected source.

    Naming the source is what turns "unavailable" into something actionable: a reader can
    tell "could not reach OFAC SDN" from "could not reach our spend data" and knows who to
    call.
    """
    if state not in STATES:
        raise ContractError("unknown state %r for field %r" % (state, field))
    names = ", ".join(_txt(s.get("name")) for s in (sources or []) if _txt(s.get("name")))
    msg = {"field": field, "state": state, "label": STATE_LABEL[state],
           "action": STATE_ACTION[state], "expected_source": names or None}
    if state == "SOURCE_UNREACHABLE" and names:
        msg["text"] = "Could not reach %s.%s" % (names, (" " + detail) if detail else "")
    elif state == "SEARCHED_NOT_FOUND" and names:
        msg["text"] = "Checked %s. Not present." % names
    elif state == "NEEDS_INPUT":
        msg["text"] = ("This has to come from you or the supplier%s."
                       % ((": " + names) if names else ""))
    elif state == "NOT_ATTEMPTED" and names:
        msg["text"] = "Not yet retrieved from %s." % names
    else:
        msg["text"] = STATE_LABEL[state] + "." + ((" " + detail) if detail else "")
    return msg


# ------------------------------------------------------------------------ the contract

def validate_source(src, where):
    name = _txt(src.get("name"))
    if not name:
        raise ContractError("%s: a source with no name is not a source" % where)
    access = _txt(src.get("access"))
    if access not in ACCESS:
        raise ContractError(
            "%s: source %r has access %r; must be one of %s"
            % (where, name, access, " / ".join(ACCESS)))
    if not _txt(src.get("how")):
        raise ContractError(
            "%s: source %r does not say HOW to reach it. A source name without a route is "
            "still a blind search." % (where, name))
    if access == "internal" and not src.get("confirmed_by_owner"):
        # Deliberately not an error. It is a flag that must survive to the report, because
        # only Marc can confirm an internal system name and a wrong one is worse than a
        # blank one.
        src["_needs_owner_confirmation"] = True
    return name


def validate_panel(panel, where=""):
    pid = _txt(panel.get("id"))
    title = _txt(panel.get("title"))
    if not pid or not title:
        raise ContractError("%s: every panel needs an id and a title" % (where or "panel"))
    loc = "%s panel %r" % (where, pid)

    fields = panel.get("fields")
    if not isinstance(fields, list) or not fields:
        raise ContractError("%s declares no fields; a panel that needs nothing is not a "
                            "panel" % loc)

    if panel.get("hide_when_empty"):
        raise ContractError(
            "%s sets hide_when_empty. Panels never disappear: a hidden panel looks like a "
            "panel that was never meant to exist, and the reader cannot tell that "
            "something is missing." % loc)

    for f in fields:
        fid = _txt(f.get("name"))
        if not fid:
            raise ContractError("%s has a field with no name" % loc)
        srcs = f.get("sources") or []
        needs_input = bool(f.get("requires_input"))
        if not srcs and not needs_input:
            raise ContractError(
                "%s field %r names no source and is not marked requires_input. Every field "
                "must say where it comes from, or the retrieval step is guessing."
                % (loc, fid))
        for s in srcs:
            validate_source(s, "%s field %r" % (loc, fid))
    return {"id": pid, "fields": len(fields),
            "sources": sum(len(f.get("sources") or []) for f in fields)}


def validate_contract(doc):
    if not isinstance(doc, dict) or not isinstance(doc.get("panels"), list):
        raise ContractError("a contract is an object with a 'panels' list")
    if not doc["panels"]:
        raise ContractError("contract declares no panels")
    dash = _txt(doc.get("dashboard")) or "?"
    seen = set()
    out = []
    for p in doc["panels"]:
        r = validate_panel(p, where=dash)
        if r["id"] in seen:
            raise ContractError("%s: duplicate panel id %r" % (dash, r["id"]))
        seen.add(r["id"])
        out.append(r)
    return {"dashboard": dash, "panels": len(out),
            "fields": sum(r["fields"] for r in out),
            "sources": sum(r["sources"] for r in out)}


def retrieval_plan(doc):
    """Group every field by source, so retrieval runs once per source, not once per field.

    This is the anti-blind-search payoff and also the efficiency one. The Deep Dive spec
    already asks for "8 grouped passes, NOT 30 independent searches"; this generalises it:
    one visit per source, collecting everything that source can answer.
    """
    by_source = {}
    needs_input = []
    for p in doc.get("panels") or []:
        for f in p.get("fields") or []:
            if f.get("requires_input"):
                needs_input.append((p.get("id"), f.get("name")))
            for s in f.get("sources") or []:
                key = (_txt(s.get("name")), _txt(s.get("access")), _txt(s.get("how")))
                by_source.setdefault(key, []).append((p.get("id"), f.get("name")))
    plan = [{"source": k[0], "access": k[1], "how": k[2], "answers": len(v),
             "fields": v} for k, v in sorted(by_source.items(), key=lambda kv: -len(kv[1]))]
    return {"sources": len(plan), "passes": plan, "needs_user_input": needs_input}


def unconfirmed_internal(doc):
    """Internal sources nobody has confirmed. Surfaced, never guessed away."""
    out = []
    for p in doc.get("panels") or []:
        for f in p.get("fields") or []:
            for s in f.get("sources") or []:
                if (_txt(s.get("access")) == "internal"
                        and not s.get("confirmed_by_owner")):
                    out.append({"panel": p.get("id"), "field": f.get("name"),
                                "source": _txt(s.get("name"))})
    return out


def main(argv):
    if not argv:
        print(__doc__.strip())
        return 0
    with open(argv[0], encoding="utf-8") as fh:
        doc = json.load(fh)
    try:
        summary = validate_contract(doc)
    except ContractError as e:
        print("REFUSED: %s" % e, file=sys.stderr)
        return 2
    plan = retrieval_plan(doc)
    print(json.dumps(summary, indent=2))
    print("\nretrieval plan: %d source(s) cover %d field(s)"
          % (plan["sources"], sum(p["answers"] for p in plan["passes"])))
    for p in plan["passes"][:12]:
        print("  %-40s %-9s answers %d field(s)"
              % (p["source"][:40], p["access"], p["answers"]))
    if plan["needs_user_input"]:
        print("\n%d field(s) must come from the user or supplier:"
              % len(plan["needs_user_input"]))
        for pid, fname in plan["needs_user_input"][:10]:
            print("  %-28s %s" % (pid, fname))
    unc = unconfirmed_internal(doc)
    if unc:
        print("\n%d internal source(s) NOT yet confirmed by the owner. These are named "
              "from inference and must be checked before they are trusted:" % len(unc))
        for u in unc[:10]:
            print("  %-28s %-26s %s" % (u["panel"], u["field"], u["source"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
