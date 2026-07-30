#!/usr/bin/env python3
"""
journey_state.py -- cross-session journey state (J3), copied from the one place the
pattern is already implemented.

WHY COPIED, NOT INVENTED
------------------------
THEO has no persisted state at all, so it cannot tell a first run from a later one except
by re-reading the chat. Exactly one skill in the suite already solves this properly:
timeline-builder's `timeline_calibration.json`. It is small and typed, it persists to
Project knowledge with a file fallback, its PRESENCE gates first-run behaviour, and its
troubleshooting note tells the user how to recover it ("the file is not in the conversation
or Project; paste it back or re-run"). J3's instruction was to copy that shape rather than
invent a second one, and this does.

WHAT IT STORES, AND THE ONE THING IT REFUSES TO STORE
----------------------------------------------------
A journey record carries the request key, the last skill run, WHAT IT PRODUCED AS A NAME
AND TYPE, which inputs were CONFIRMED versus ASSUMED, and the next suggested hop.

**It never stores artifact content.** `validate()` refuses a record that carries any. Two
reasons, and the second is the one that matters: a state file that accumulates contract
text or supplier data becomes a quiet second copy of material governed everywhere else in
the suite, sitting in Project knowledge under nobody's retention rule. A name and a type
are enough to say "you have the shortlist from supplier-landscape"; the content stays in
the artifact.

CONFIRMED VERSUS ASSUMED IS THE POINT OF THE RECORD
---------------------------------------------------
Re-asking something the user already answered is the friction J3 exists to remove. But
carrying an ASSUMPTION forward silently is worse than re-asking: it hardens a guess into a
fact across sessions, and the user never sees the moment it happened. So every input is
tagged, a later run may skip what was CONFIRMED, and it must surface what was ASSUMED
rather than treat it as settled.

ABSENCE IS NEVER AN ERROR
-------------------------
No file means first run. A corrupt file means first run plus a recoverable message. The
skill proceeds either way. `timeline_calibration.json`'s rule is "never block on enriching
inputs", and state is an enriching input.

Stdlib only. Vendored; drift checked by kernel_manifest.
"""
from __future__ import annotations

import json
import re
import sys

SCHEMA_VERSION = 1

# An input is one of these, and nothing else. The two-value vocabulary is deliberate:
# a third state ("probably") would be an assumption wearing a confirmation's clothes.
CONFIRMED = "CONFIRMED"
ASSUMED = "ASSUMED"
INPUT_STATES = (CONFIRMED, ASSUMED)

# Keys that would mean the record is carrying content rather than a reference to it.
CONTENT_KEYS = ("content", "text", "body", "html", "markdown", "rows", "data",
                "full_text", "extract", "payload")

# A stored artifact is a NAME and a TYPE. Nothing else is needed to prime the next hop.
ARTIFACT_TYPES = ("docx", "xlsx", "pptx", "pdf", "json", "html", "md", "chat")


class JourneyError(Exception):
    """Raised on a record that must not be written. Never raised on a MISSING record."""


def _txt(v):
    return v.strip() if isinstance(v, str) else ""


def new_record(request_key):
    """A fresh record. Written after the first skill in a path completes."""
    if not _txt(request_key):
        raise JourneyError("a journey record needs a request key to attach to")
    return {"schema_version": SCHEMA_VERSION, "request_key": _txt(request_key),
            "steps": [], "inputs": {}, "next_hop": None}


def _reject_content(obj, where):
    """Refuse anything that looks like stored artifact content, at any depth."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.lower() in CONTENT_KEYS:
                raise JourneyError(
                    "%s carries %r. Journey state stores an artifact's NAME and TYPE, "
                    "never its content: a state file that accumulates contract or "
                    "supplier material becomes a second copy of governed data sitting in "
                    "Project knowledge under nobody's retention rule." % (where, k))
            _reject_content(v, "%s.%s" % (where, k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            _reject_content(v, "%s[%d]" % (where, i))
    elif isinstance(obj, str) and len(obj) > 600:
        raise JourneyError(
            "%s holds a %d-character string. That is content, not a reference. Store the "
            "artifact name and type." % (where, len(obj)))


def record_step(rec, skill, artifact_name=None, artifact_type=None, next_hop=None):
    """Append a completed step. `next_hop` must come from routing-and-chains, not a guess."""
    if not _txt(skill):
        raise JourneyError("a step must name the skill that ran")
    if artifact_type is not None and artifact_type not in ARTIFACT_TYPES:
        raise JourneyError(
            "artifact_type %r is not one of %s. An unknown type usually means the caller "
            "is about to store the artifact itself."
            % (artifact_type, "/".join(ARTIFACT_TYPES)))
    step = {"skill": _txt(skill)}
    if artifact_name:
        step["artifact"] = {"name": _txt(artifact_name), "type": artifact_type or "chat"}
    rec.setdefault("steps", []).append(step)
    rec["next_hop"] = _txt(next_hop) or None
    return rec


def set_input(rec, name, value, state):
    """Record an input AND whether the user confirmed it or we assumed it."""
    if state not in INPUT_STATES:
        raise JourneyError(
            "input %r has state %r; must be CONFIRMED or ASSUMED. There is deliberately no "
            "third value: 'probably' is an assumption wearing a confirmation's clothes."
            % (name, state))
    rec.setdefault("inputs", {})[_txt(name)] = {"value": value, "state": state}
    return rec


def validate(rec):
    """Raise on a record that must not be written. Returns a summary when it is sound."""
    if not isinstance(rec, dict):
        raise JourneyError("journey state must be an object")
    if rec.get("schema_version") != SCHEMA_VERSION:
        raise JourneyError(
            "schema_version is %r, expected %d. A record from a different shape is not "
            "read: stale state silently misapplied is worse than no state."
            % (rec.get("schema_version"), SCHEMA_VERSION))
    if not _txt(rec.get("request_key")):
        raise JourneyError("no request_key; the record cannot be matched to a request")

    _reject_content(rec.get("steps"), "steps")
    _reject_content(rec.get("inputs"), "inputs")

    for i, s in enumerate(rec.get("steps") or []):
        if not _txt(s.get("skill")):
            raise JourneyError("steps[%d] names no skill" % i)
        art = s.get("artifact")
        if art is not None:
            if not _txt(art.get("name")):
                raise JourneyError("steps[%d].artifact has no name" % i)
            if art.get("type") not in ARTIFACT_TYPES:
                raise JourneyError("steps[%d].artifact has type %r, which is not a known "
                                   "artifact type" % (i, art.get("type")))

    for k, v in (rec.get("inputs") or {}).items():
        if not isinstance(v, dict) or v.get("state") not in INPUT_STATES:
            raise JourneyError(
                "input %r must record CONFIRMED or ASSUMED. An untagged input carried "
                "across sessions hardens a guess into a fact." % k)

    return {"request_key": rec["request_key"],
            "steps": len(rec.get("steps") or []),
            "confirmed": sum(1 for v in (rec.get("inputs") or {}).values()
                             if v["state"] == CONFIRMED),
            "assumed": sum(1 for v in (rec.get("inputs") or {}).values()
                           if v["state"] == ASSUMED),
            "next_hop": rec.get("next_hop")}


def load(text):
    """Read state from whatever the surface could give us.

    Returns (record_or_None, message). **A missing or unreadable record is NOT an error**,
    it is first-run, and the message is what the skill says out loud so the user can
    recover it. This mirrors timeline-builder's troubleshooting note rather than inventing
    new wording.
    """
    if text is None or not _txt(text):
        return None, ("No journey state found: treating this as a first run. If you have "
                      "run this before, the state file is not in the conversation or "
                      "Project; paste it back to continue where you left off.")
    try:
        rec = json.loads(text)
    except ValueError:
        return None, ("Journey state could not be read and was ignored: continuing as a "
                      "first run. Re-run the path, or paste a clean state file.")
    try:
        validate(rec)
    except JourneyError as e:
        return None, ("Journey state was rejected and ignored (%s): continuing as a first "
                      "run rather than acting on a record that may be wrong." % e)
    return rec, None


def resume_brief(rec):
    """One line of primed context for a later run, plus what still needs confirming."""
    if not rec:
        return None
    steps = rec.get("steps") or []
    last = steps[-1] if steps else None
    parts = []
    if last:
        art = last.get("artifact")
        parts.append("you last ran %s%s"
                     % (last["skill"],
                        (", producing %s (%s)" % (art["name"], art["type"])) if art else ""))
    if rec.get("next_hop"):
        parts.append("the next step is %s" % rec["next_hop"])
    assumed = [k for k, v in (rec.get("inputs") or {}).items()
               if v["state"] == ASSUMED]
    out = {"line": "; ".join(parts) if parts else None,
           "reconfirm": assumed}
    if assumed:
        out["note"] = ("These were assumed rather than confirmed and are worth checking "
                       "before relying on them: " + ", ".join(assumed))
    return out


def main(argv):
    if not argv:
        print(__doc__.strip())
        return 0
    with open(argv[0], encoding="utf-8") as fh:
        rec, msg = load(fh.read())
    if rec is None:
        print(msg)
        return 0
    print(json.dumps(validate(rec), indent=2))
    b = resume_brief(rec)
    if b and b.get("line"):
        print("\nresume: %s" % b["line"])
    if b and b.get("reconfirm"):
        print("reconfirm: %s" % ", ".join(b["reconfirm"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
