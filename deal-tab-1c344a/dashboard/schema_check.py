#!/usr/bin/env python3
"""
schema_check.py -- D7: validate an incoming Deal data object against the ownership table.

WHY THIS EXISTS
---------------
`deal-tab-1c344a/SKILL.md` carries an output-slice contract: each lens skill owns a named
set of fields, and this dashboard composes them. But the contract had no versioning and no
validation hook, so a lens skill could rename a field and **deal-tab would render a gap
rather than erroring.**

A silent gap masks a real upstream break. Worse, it masks it in the most convincing possible
place: a rendered dashboard that looks complete except for one quiet empty panel, which a
reader attributes to missing data rather than to a broken contract.

So an unrecognised field is a BUILD FAILURE, named:
    "field X is not owned by any registered lens skill"

WHERE THIS LIVES, AND WHY NOT WHERE THE PLAN SAID
--------------------------------------------------
The plan specified `dashboard/_parts/schema_check.py`. `_parts` is on the packaging strip
list ("pre-assembly fragments consumed by the builder, not at runtime"), so a check placed
there would be **stripped out of every shipped skill** and would only ever run in this repo.
A validation gate that does not ship is not a gate. It lives beside the builder that calls
it instead.

THE TABLE IS THE CONTRACT
-------------------------
`OWNERSHIP` below mirrors the table in SKILL.md. `check_table_matches_skill_md()` asserts
the two agree, because two hand-maintained copies of one contract is the drift this suite
has spent weeks removing. If someone edits the SKILL.md table without editing this file,
the check fails rather than silently enforcing a stale contract.

Stdlib only.
    python schema_check.py <data.json>
"""
from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL_MD = os.path.join(os.path.dirname(HERE), "SKILL.md")

# Mirrors the "Output slice contract" table in SKILL.md. Kept in sync by
# check_table_matches_skill_md(), not by hope.
OWNERSHIP = {
    "lilly-contract-review-1c344a": [
        "issues", "documentConflicts", "protection", "obligations", "tacticFlag"],
    "scope-sow-architect-1c344a": ["scope"],
    "pro-forma-builder-1c344a": [
        "commercialLines", "scenarios", "assumptions", "proforma", "benchmarks"],
}

# CO-CONTRIBUTED fields: owned by one skill, but appended to by another.
#
# This exists because the SKILL.md table gives scope-sow-architect "`scope{}` and scope
# `issues[]`", which reads as a SECOND owner of `issues[]`. It is not a second owner: it
# contributes scope-derived issues into the array lilly-contract-review owns. The
# distinction matters, because "two owners" and "one owner plus a contributor" fail
# differently. Two owners means nobody can be told their field broke.
#
# Recorded here rather than resolved silently: if Marc decides scope issues should be their
# own field (`scopeIssues[]`), that is a contract change, not a code change.
CO_CONTRIBUTED = {
    "issues": {"owner": "lilly-contract-review-1c344a",
               "contributors": ["scope-sow-architect-1c344a"],
               "note": "scope-sow-architect appends scope-derived issues; it does not own "
                       "the array. Each entry should carry a sourceRef identifying which "
                       "skill produced it."},
}

# Fields the hub itself owns: identity and framing, not analysis. Declared so they are not
# mistaken for an unowned lens field.
HUB_OWNED = {"dealName", "supplier", "contractSet", "stage", "analysisDate",
             "counterparties", "dealType", "schemaVersion"}

SCHEMA_VERSION = 1


class SchemaError(Exception):
    """Raised instead of building. A refused build beats a quietly incomplete one."""


def owner_of(field):
    for skill, fields in OWNERSHIP.items():
        if field in fields:
            return skill
    return None


def check_table_matches_skill_md():
    """The SKILL.md table and OWNERSHIP must agree. Two copies of one contract drift."""
    if not os.path.isfile(SKILL_MD):
        return  # installed elsewhere; nothing to compare against
    with open(SKILL_MD, encoding="utf-8") as fh:
        text = fh.read()
    declared = {}
    for m in re.finditer(r"^\|\s*`([a-z0-9\-]+-1c344a)`\s*\|\s*(.+?)\s*\|\s*$",
                         text, re.M):
        skill = m.group(1)
        fields = set(re.findall(r"`([A-Za-z][A-Za-z0-9_]*)", m.group(2)))
        declared[skill] = fields
    if not declared:
        return  # table not found in this form; do not fail the build on a doc reshape
    for skill, fields in declared.items():
        mine = set(OWNERSHIP.get(skill, []))
        # A field this skill CONTRIBUTES to but does not own is legitimately named in its
        # table row without appearing in its OWNERSHIP list. Without this, the check reads
        # "scope `issues[]`" as a second owner of issues[] and fires on a correct table.
        contributed = {f for f, meta in CO_CONTRIBUTED.items()
                       if skill in meta["contributors"]}
        missing = fields - mine - contributed
        extra = mine - fields
        if missing or extra:
            raise SchemaError(
                "the ownership table in SKILL.md and OWNERSHIP in schema_check.py disagree "
                "for %s: SKILL.md has %s, this file has %s. Two hand-maintained copies of "
                "one contract is exactly the drift this check exists to prevent; fix both."
                % (skill, sorted(fields), sorted(mine)))


def validate(data, require_source_ref=True):
    """Refuse a data object carrying a field no registered lens skill owns.

    `require_source_ref` enforces SKILL.md's rule that every field carries a `sourceRef`:
    "A field arriving without one is a build failure, not a gap to render." This dashboard
    composes other skills' findings, so it is the last place an uncited value can be caught
    before a reader treats a rendered number as established fact.
    """
    if not isinstance(data, dict):
        raise SchemaError("the Deal data object must be an object")

    check_table_matches_skill_md()

    unowned, missing_ref = [], []
    for key, value in data.items():
        if key.startswith("_") or key in HUB_OWNED:
            continue
        if owner_of(key) is None:
            unowned.append(key)
            continue
        if require_source_ref:
            # A slice may be a list of records or a single object; both must be sourced.
            items = value if isinstance(value, list) else [value]
            for i, item in enumerate(items):
                if isinstance(item, dict) and not item.get("sourceRef"):
                    missing_ref.append("%s[%d]" % (key, i)
                                       if isinstance(value, list) else key)

    if unowned:
        raise SchemaError(
            "field %s is not owned by any registered lens skill. Registered owners: %s. "
            "A field nobody owns means a lens skill renamed something, and rendering a gap "
            "here would hide that break behind what looks like missing data."
            % (", ".join(repr(u) for u in sorted(unowned)),
               ", ".join(sorted(OWNERSHIP))))

    if missing_ref:
        raise SchemaError(
            "%d field(s) arrived with no sourceRef: %s. SKILL.md is explicit that this is a "
            "build failure, not a gap to render: this dashboard is the last place an "
            "uncited value can be caught before a reader treats it as established fact."
            % (len(missing_ref), ", ".join(missing_ref[:8])))

    present = {k for k in data if owner_of(k)}
    return {"fields": len(present),
            "by_owner": {s: sorted(present & set(f)) for s, f in OWNERSHIP.items()},
            "absent": sorted({f for fs in OWNERSHIP.values() for f in fs} - present)}


def main(argv):
    if not argv:
        print(__doc__.strip())
        return 0
    with open(argv[0], encoding="utf-8") as fh:
        data = json.load(fh)
    try:
        summary = validate(data)
    except SchemaError as e:
        print("BUILD REFUSED: %s" % e, file=sys.stderr)
        return 2
    print(json.dumps(summary, indent=2))
    if summary["absent"]:
        print("\nNot supplied this run (a slice may legitimately be absent; it renders as "
              "a stated gap, NOT as an error): %s" % ", ".join(summary["absent"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
