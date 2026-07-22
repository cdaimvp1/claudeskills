"""
roster_kernel.py
Lilly Procurement Skills - Workflow Map Roster-Source Cascade Kernel

Stdlib-only Python module implementing the stakeholder-roster SOURCE PRECEDENCE
decision that workflow-map-1c344a/SKILL.md already specifies in prose (Skill
Version 1.2, June 2026, "### Step 3: Stakeholder roster" -> "Source priority:").
This is a NON-NUMERIC decision kernel: it does not compute anything, it chooses
which ALREADY-CLASSIFIED roster source wins, deterministically, so that choice
is never made ad hoc by model judgment at generation time.

Per the suite's "refuse rather than guess" rule (the same principle
numeric_kernel.py documents for arithmetic): when NONE of the four sources
SKILL.md names has a usable stakeholder roster, this kernel does not invent an
owner or silently pick a source that lacks one. It returns the REVIEW outcome
(chosen_source="REVIEW", roster=None, needs_review=True) and a trace showing
exactly which tiers were checked and why each one did not qualify. Per SKILL.md
Step 3 #5, the calling skill's own documented fallback for that REVIEW outcome
is to render the checklist with `[OWNER?]` placeholders for the roles that
matter for the present phases -- this kernel does not perform that fallback
itself, it only refuses to fabricate a source or a roster.

Source (verbatim precedence, workflow-map-1c344a/SKILL.md, Step 3 "Source
priority:"):
  "1. If `issue_id` parameter was provided AND `field_guide_state.json` has
      that Issue -> pull owners from the Issue's `owner` field and each child
      Task's `owner` field. Highest priority.
   2. If `field_guide_state.json` is present and has a stakeholder roster for
      this project -> use it (cross-Issue search by `project` tag).
   3. If legacy `daily_digest_state.json` is present and has a stakeholder
      roster for this project -> use it.
   4. If a case file (`_case_file.json` from rfp-case-manager) is present
      with a stakeholder roster -> use it.
   5. If none of the above -> produce the checklist with `[OWNER?]`
      placeholders for the roles that matter for the present phases (e.g.,
      Legal, Finance, TPRM, SAE, Requester, Vendor Contact)."

Only these four source names and this five-tier order are encoded below.
Nothing here invents a new source, a new tie-break rule, or a new category:
the four "chosen_source" values plus "REVIEW" are exactly the skill's own five
outcomes (four sources that can win, one no-source outcome).

See MAINTENANCE.md conventions in lilly-procurement-kernels-1c344a/ for the
suite's shared kernel-authoring style; this module mirrors numeric_kernel.py's
module-docstring / exception / self-test conventions for a decision (rather
than arithmetic) kernel.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, List, Optional

SOURCE_VERSION = "workflow-map-1c344a SKILL.md, Skill Version 1.2 (June 2026), Step 3"

# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class KernelError(Exception):
    """Base class for every refusal raised by this kernel.

    Reserved for malformed CALLS (wrong input shape) -- a programming error by
    the caller, not a data-availability question. A run with zero usable
    roster sources is NOT an error: it is the REVIEW outcome returned by
    resolve_roster_source() (see module docstring), matching SKILL.md Step 3
    #5's own documented "none of the above" case.
    """


class InvalidSourcesError(KernelError):
    """Raised when resolve_roster_source() is not given a RosterSources
    instance. Refuses rather than guessing what shape an ad hoc dict/object
    is meant to represent.
    """


# ---------------------------------------------------------------------------
# Source name constants (verbatim from SKILL.md Step 3, in cascade order)
# ---------------------------------------------------------------------------

SOURCE_FIELD_GUIDE_ISSUE = "field_guide_state.json (Issue-scoped, issue_id)"
SOURCE_FIELD_GUIDE_PROJECT = "field_guide_state.json (project-scoped, cross-Issue by project tag)"
SOURCE_DAILY_DIGEST_LEGACY = "daily_digest_state.json (legacy)"
SOURCE_CASE_FILE = "_case_file.json (rfp-case-manager)"
SOURCE_REVIEW = "REVIEW"

# Fixed precedence order, copied from SKILL.md Step 3's numbered list.
# This ordering is the entire decision; it must never be re-sorted by caller
# input order, roster size, recency, or any other signal SKILL.md does not
# name.
CASCADE_ORDER = (
    SOURCE_FIELD_GUIDE_ISSUE,
    SOURCE_FIELD_GUIDE_PROJECT,
    SOURCE_DAILY_DIGEST_LEGACY,
    SOURCE_CASE_FILE,
)


# ---------------------------------------------------------------------------
# Facts / Decision shape
# ---------------------------------------------------------------------------

@dataclass
class RosterSources:
    """Structured, already-classified inputs to resolve_roster_source().

    Each field below is something the CALLING skill (workflow-map) is
    expected to have already determined by reading its own available state
    (Field Guide state, legacy digest state, case file) -- this kernel does
    no file I/O and does not itself decide whether a given JSON blob "counts"
    as having a roster; it only applies the fixed precedence over whatever
    the caller reports.

    Tier 1 (highest priority) is a COMPOUND condition per SKILL.md Step 3 #1
    ("issue_id parameter was provided AND field_guide_state.json has that
    Issue"), so it is modeled as two separate booleans rather than one
    pre-folded flag, so the trace can show which half of the condition (if
    either) failed:
      issue_id_provided:     the issue_id parameter was supplied this run.
      field_guide_has_issue: field_guide_state.json contains that specific
                             Issue (only meaningful when issue_id_provided).
      field_guide_issue_roster: the Issue's own `owner` field plus each child
                             Task's `owner` field, per SKILL.md Step 3 #1.
                             Only used when both booleans above are True.

    Tiers 2-4 are each a single compound condition in SKILL.md ("<file> is
    present and has a stakeholder roster for this project" / "... with a
    stakeholder roster"), so each is one boolean ("<x>_present") plus the
    roster payload it carries:
      field_guide_project_present / field_guide_project_roster
      daily_digest_present / daily_digest_roster
      case_file_present / case_file_roster

    Every "*_roster" field is treated by this kernel as an OPAQUE payload
    (a dict, list, or whatever shape the calling skill already extracted for
    that source). This kernel decides WHICH source wins, not how a roster is
    shaped internally -- so it never inspects roster contents except to
    confirm they are non-empty (see _has_content()).
    """

    issue_id_provided: bool = False
    field_guide_has_issue: bool = False
    field_guide_issue_roster: Optional[Any] = None

    field_guide_project_present: bool = False
    field_guide_project_roster: Optional[Any] = None

    daily_digest_present: bool = False
    daily_digest_roster: Optional[Any] = None

    case_file_present: bool = False
    case_file_roster: Optional[Any] = None


@dataclass
class RosterDecision:
    """Kernel output: {chosen_source, roster, trace} plus a needs_review flag.

    chosen_source: one of SOURCE_FIELD_GUIDE_ISSUE / SOURCE_FIELD_GUIDE_PROJECT
        / SOURCE_DAILY_DIGEST_LEGACY / SOURCE_CASE_FILE (a source won), or
        SOURCE_REVIEW ("REVIEW", no source had a usable roster).
    roster: the winning source's roster payload, passed through unchanged.
        None whenever chosen_source == SOURCE_REVIEW.
    trace: ordered, human-readable audit trail -- one line per tier
        evaluated, stating why that tier did or did not win. Always fully
        populated (even on REVIEW) so the decision is auditable end to end,
        per the task's "record which source won" requirement.
    needs_review: True iff chosen_source == SOURCE_REVIEW. Kept as a separate
        boolean (in addition to the SOURCE_REVIEW sentinel) so callers can
        branch on it without a string comparison, mirroring
        frap_chain_kernel.py's Decision.needs_review convention.
    source_version: which SKILL.md version/section this cascade traces to.
    """

    chosen_source: Optional[str]
    roster: Optional[Any]
    trace: List[str] = field(default_factory=list)
    needs_review: bool = False
    source_version: str = SOURCE_VERSION


def _has_content(roster: Optional[Any]) -> bool:
    """True iff `roster` is more than "absent" -- i.e. it is not None and,
    for any container type that defines a length, that length is > 0.

    SKILL.md's own wording for every tier is "has A stakeholder roster", not
    merely "the file exists" -- so a nominally-present source whose roster
    payload is None, [], {}, or "" is treated as NOT carrying a usable
    roster, and the cascade falls through to the next tier. This is a
    direct reading of "has a stakeholder roster" (a roster with zero
    entries is not "a roster"), not an invented extra criterion.
    """
    if roster is None:
        return False
    if hasattr(roster, "__len__"):
        return len(roster) > 0
    return True


def resolve_roster_source(sources: RosterSources) -> RosterDecision:
    """Choose which stakeholder-roster SOURCE wins, per workflow-map-1c344a
    SKILL.md Step 3's exact five-tier priority list (see module docstring).

    Deterministic, pure function: no I/O, no network, no randomness. Given
    the same RosterSources, always returns the same RosterDecision.

    Refuses (raises InvalidSourcesError) only for a malformed CALL (sources
    is not a RosterSources instance). A well-formed call in which every tier
    is absent/empty is NOT a refusal-by-exception; it is the documented
    REVIEW outcome (see module docstring and SKILL.md Step 3 #5).
    """
    if not isinstance(sources, RosterSources):
        raise InvalidSourcesError(
            f"resolve_roster_source() requires a RosterSources instance, got "
            f"{type(sources).__name__}. Refusing to guess which fields an ad "
            "hoc object is meant to represent."
        )

    trace: List[str] = []

    # --- Tier 1: field_guide_state.json, Issue-scoped (highest priority) ---
    if not sources.issue_id_provided:
        trace.append(
            f"{SOURCE_FIELD_GUIDE_ISSUE}: not attempted (no issue_id "
            "parameter was provided this run) - per SKILL.md Step 3 #1 this "
            "tier requires issue_id AND a matching Issue; skip to tier 2."
        )
    elif not sources.field_guide_has_issue:
        trace.append(
            f"{SOURCE_FIELD_GUIDE_ISSUE}: issue_id was provided but "
            "field_guide_state.json does not have that Issue - compound "
            "condition in SKILL.md Step 3 #1 not satisfied; skip to tier 2."
        )
    elif not _has_content(sources.field_guide_issue_roster):
        trace.append(
            f"{SOURCE_FIELD_GUIDE_ISSUE}: Issue found but carries no owner "
            "data (empty roster payload) - not usable; skip to tier 2."
        )
    else:
        trace.append(
            f"{SOURCE_FIELD_GUIDE_ISSUE}: issue_id provided, matching Issue "
            "found, owner data present -> WINS (highest priority per "
            "SKILL.md Step 3 #1)."
        )
        return RosterDecision(
            chosen_source=SOURCE_FIELD_GUIDE_ISSUE,
            roster=sources.field_guide_issue_roster,
            trace=trace,
            needs_review=False,
        )

    # --- Tier 2: field_guide_state.json, project-scoped (cross-Issue) ------
    if not sources.field_guide_project_present:
        trace.append(
            f"{SOURCE_FIELD_GUIDE_PROJECT}: not present (no stakeholder "
            "roster for this project found via cross-Issue project-tag "
            "search) - skip to tier 3."
        )
    elif not _has_content(sources.field_guide_project_roster):
        trace.append(
            f"{SOURCE_FIELD_GUIDE_PROJECT}: reported present but roster "
            "payload is empty - not usable; skip to tier 3."
        )
    else:
        trace.append(
            f"{SOURCE_FIELD_GUIDE_PROJECT}: present with roster content -> "
            "WINS (per SKILL.md Step 3 #2)."
        )
        return RosterDecision(
            chosen_source=SOURCE_FIELD_GUIDE_PROJECT,
            roster=sources.field_guide_project_roster,
            trace=trace,
            needs_review=False,
        )

    # --- Tier 3: legacy daily_digest_state.json ----------------------------
    if not sources.daily_digest_present:
        trace.append(
            f"{SOURCE_DAILY_DIGEST_LEGACY}: not present (no stakeholder "
            "roster for this project found in the legacy state file) - "
            "skip to tier 4."
        )
    elif not _has_content(sources.daily_digest_roster):
        trace.append(
            f"{SOURCE_DAILY_DIGEST_LEGACY}: reported present but roster "
            "payload is empty - not usable; skip to tier 4."
        )
    else:
        trace.append(
            f"{SOURCE_DAILY_DIGEST_LEGACY}: present with roster content -> "
            "WINS (per SKILL.md Step 3 #3)."
        )
        return RosterDecision(
            chosen_source=SOURCE_DAILY_DIGEST_LEGACY,
            roster=sources.daily_digest_roster,
            trace=trace,
            needs_review=False,
        )

    # --- Tier 4: rfp-case-manager _case_file.json --------------------------
    if not sources.case_file_present:
        trace.append(
            f"{SOURCE_CASE_FILE}: not present (no stakeholder roster found "
            "in the rfp-case-manager case file) - no source remains."
        )
    elif not _has_content(sources.case_file_roster):
        trace.append(
            f"{SOURCE_CASE_FILE}: reported present but roster payload is "
            "empty - not usable; no source remains."
        )
    else:
        trace.append(
            f"{SOURCE_CASE_FILE}: present with roster content -> WINS "
            "(per SKILL.md Step 3 #4)."
        )
        return RosterDecision(
            chosen_source=SOURCE_CASE_FILE,
            roster=sources.case_file_roster,
            trace=trace,
            needs_review=False,
        )

    # --- No source had a usable roster: REVIEW, per SKILL.md Step 3 #5 ----
    trace.append(
        "No source (field_guide_state.json Issue-scoped, field_guide_state."
        "json project-scoped, daily_digest_state.json, _case_file.json) had "
        "a usable stakeholder roster. Returning REVIEW rather than "
        "fabricating a source or an owner. Per SKILL.md Step 3 #5, the "
        "calling skill's own documented fallback for this outcome is to "
        "render the checklist with [OWNER?] placeholders for the roles "
        "that matter for the present phases; this kernel does not perform "
        "that rendering itself."
    )
    return RosterDecision(
        chosen_source=SOURCE_REVIEW,
        roster=None,
        trace=trace,
        needs_review=True,
    )


# ===========================================================================
# Self-test
# ===========================================================================

if __name__ == "__main__":
    _results = []  # list[(label, passed: bool, detail: str)]

    def _check(label: str, condition: bool, detail: str = "") -> None:
        _results.append((label, bool(condition), detail))
        status = "PASS" if condition else "FAIL"
        line = f"[{status}] {label}"
        if detail:
            line += f"  ({detail})"
        print(line)

    def _check_raises(label: str, fn, exc_type) -> None:
        try:
            fn()
            _check(label, False, f"expected {exc_type.__name__}, nothing raised")
        except exc_type as e:
            _check(label, True, f"refused as expected: {e}")
        except Exception as e:  # wrong exception type
            _check(label, False, f"expected {exc_type.__name__}, got {type(e).__name__}: {e}")

    print("=" * 78)
    print("GOLDEN CASES (each traces to workflow-map-1c344a SKILL.md Step 3's")
    print("own numbered 'Source priority' list; no worked numeric example")
    print("exists in SKILL.md for this decision, so these are direct")
    print("precedence-order reproductions of the quoted rule, not a numeric")
    print("golden value)")
    print("=" * 78)

    demo_issue_roster = {"Requester": "A. Patel", "Legal": "J. Kim"}
    demo_project_roster = {"Requester": "A. Patel"}
    demo_digest_roster = {"Requester": "B. Chen"}
    demo_case_file_roster = {"Requester": "C. Diaz"}

    # --- Golden 1: Tier 1 wins outright when its compound condition holds --
    d1 = resolve_roster_source(RosterSources(
        issue_id_provided=True,
        field_guide_has_issue=True,
        field_guide_issue_roster=demo_issue_roster,
    ))
    _check(
        "Tier 1 (Issue-scoped field_guide_state.json) wins when issue_id "
        "provided AND the Issue is found with owner data "
        "(SKILL.md Step 3 #1, 'Highest priority')",
        d1.chosen_source == SOURCE_FIELD_GUIDE_ISSUE and d1.roster == demo_issue_roster
        and d1.needs_review is False,
        f"got chosen_source={d1.chosen_source!r}, roster={d1.roster}",
    )

    # --- Golden 2: Tier 1 beats every lower tier even when all are present -
    d2 = resolve_roster_source(RosterSources(
        issue_id_provided=True,
        field_guide_has_issue=True,
        field_guide_issue_roster=demo_issue_roster,
        field_guide_project_present=True,
        field_guide_project_roster=demo_project_roster,
        daily_digest_present=True,
        daily_digest_roster=demo_digest_roster,
        case_file_present=True,
        case_file_roster=demo_case_file_roster,
    ))
    _check(
        "Tier 1 wins even when tiers 2, 3, and 4 are ALSO present "
        "(precedence is fixed order, not availability count)",
        d2.chosen_source == SOURCE_FIELD_GUIDE_ISSUE,
        f"got chosen_source={d2.chosen_source!r}",
    )

    # --- Golden 3: issue_id not provided -> falls through to Tier 2 --------
    d3 = resolve_roster_source(RosterSources(
        issue_id_provided=False,
        field_guide_project_present=True,
        field_guide_project_roster=demo_project_roster,
    ))
    _check(
        "Tier 2 (project-scoped field_guide_state.json) wins when issue_id "
        "was not provided this run (SKILL.md Step 3 #2)",
        d3.chosen_source == SOURCE_FIELD_GUIDE_PROJECT and d3.roster == demo_project_roster,
        f"got chosen_source={d3.chosen_source!r}",
    )

    # --- Golden 4: issue_id provided but no matching Issue -> Tier 2 -------
    d4 = resolve_roster_source(RosterSources(
        issue_id_provided=True,
        field_guide_has_issue=False,
        field_guide_project_present=True,
        field_guide_project_roster=demo_project_roster,
    ))
    _check(
        "Tier 1's compound condition fails (issue_id given, but no matching "
        "Issue) -> falls through to Tier 2, not a refusal",
        d4.chosen_source == SOURCE_FIELD_GUIDE_PROJECT,
        f"got chosen_source={d4.chosen_source!r}",
    )

    # --- Golden 5: Tier 1 Issue found but empty roster -> Tier 2 -----------
    d5 = resolve_roster_source(RosterSources(
        issue_id_provided=True,
        field_guide_has_issue=True,
        field_guide_issue_roster={},  # Issue exists but carries no owner data
        field_guide_project_present=True,
        field_guide_project_roster=demo_project_roster,
    ))
    _check(
        "Tier 1 Issue found but with an EMPTY roster -> not usable, falls "
        "through to Tier 2 ('has a stakeholder roster' requires content)",
        d5.chosen_source == SOURCE_FIELD_GUIDE_PROJECT,
        f"got chosen_source={d5.chosen_source!r}",
    )

    # --- Golden 6: Tiers 1-2 absent -> Tier 3 (legacy daily digest) wins ---
    d6 = resolve_roster_source(RosterSources(
        daily_digest_present=True,
        daily_digest_roster=demo_digest_roster,
        case_file_present=True,
        case_file_roster=demo_case_file_roster,
    ))
    _check(
        "Tier 3 (legacy daily_digest_state.json) wins over Tier 4 when both "
        "are present but Tiers 1-2 are not (SKILL.md Step 3 #3 precedes #4)",
        d6.chosen_source == SOURCE_DAILY_DIGEST_LEGACY and d6.roster == demo_digest_roster,
        f"got chosen_source={d6.chosen_source!r}",
    )

    # --- Golden 7: only the case file is present -> Tier 4 wins ------------
    d7 = resolve_roster_source(RosterSources(
        case_file_present=True,
        case_file_roster=demo_case_file_roster,
    ))
    _check(
        "Tier 4 (rfp-case-manager _case_file.json) wins when it is the only "
        "source present (SKILL.md Step 3 #4)",
        d7.chosen_source == SOURCE_CASE_FILE and d7.roster == demo_case_file_roster,
        f"got chosen_source={d7.chosen_source!r}",
    )

    print()
    print("=" * 78)
    print("ABSTAIN / REVIEW CASE (SKILL.md Step 3 #5: 'If none of the above')")
    print("=" * 78)

    # --- ABSTAIN: no source at all -> REVIEW, not a fabricated roster ------
    d8 = resolve_roster_source(RosterSources())
    _check(
        "resolve_roster_source: NO source available -> REVIEW "
        "(chosen_source='REVIEW', roster=None, needs_review=True); the "
        "calling skill's own [OWNER?]-placeholder fallback per SKILL.md "
        "Step 3 #5 is NOT performed by this kernel",
        d8.chosen_source == SOURCE_REVIEW and d8.roster is None and d8.needs_review is True,
        f"got chosen_source={d8.chosen_source!r}, roster={d8.roster}, needs_review={d8.needs_review}",
    )
    _check(
        "REVIEW decision still carries a fully populated trace (all four "
        "tiers explained), so the refusal itself is auditable",
        len(d8.trace) == 5,  # 4 tier explanations + 1 final REVIEW line
        f"trace had {len(d8.trace)} lines: {d8.trace}",
    )

    print()
    print("=" * 78)
    print("NEGATIVE TESTS (must refuse / must not fabricate)")
    print("=" * 78)

    # --- Negative: all tiers present but every roster payload is empty ----
    d9 = resolve_roster_source(RosterSources(
        issue_id_provided=True,
        field_guide_has_issue=True,
        field_guide_issue_roster=[],
        field_guide_project_present=True,
        field_guide_project_roster=None,
        daily_digest_present=True,
        daily_digest_roster="",
        case_file_present=True,
        case_file_roster={},
    ))
    _check(
        "All four tiers report 'present' but every roster payload is empty "
        "-> still REVIEW, not a fabricated pick of an empty source",
        d9.chosen_source == SOURCE_REVIEW and d9.needs_review is True,
        f"got chosen_source={d9.chosen_source!r}",
    )

    # --- Negative: malformed call (wrong input shape) refuses via exception
    _check_raises(
        "resolve_roster_source: refuses a plain dict instead of a "
        "RosterSources instance (malformed call, not a data-availability "
        "question)",
        lambda: resolve_roster_source({"issue_id_provided": True}),
        InvalidSourcesError,
    )
    _check_raises(
        "resolve_roster_source: refuses None as the sources argument",
        lambda: resolve_roster_source(None),
        InvalidSourcesError,
    )

    # --- Negative: Tier 3 present with content should NOT win over Tier 2 --
    d10 = resolve_roster_source(RosterSources(
        field_guide_project_present=True,
        field_guide_project_roster=demo_project_roster,
        daily_digest_present=True,
        daily_digest_roster=demo_digest_roster,
    ))
    _check(
        "Tier 2 correctly outranks Tier 3 even though Tier 3's roster is "
        "listed second in this call (order of precedence is fixed by the "
        "kernel, not by argument order)",
        d10.chosen_source == SOURCE_FIELD_GUIDE_PROJECT,
        f"got chosen_source={d10.chosen_source!r}",
    )

    print()
    print("=" * 78)
    passed = sum(1 for _, ok, _ in _results if ok)
    failed = sum(1 for _, ok, _ in _results if not ok)
    total = len(_results)
    print(f"SUMMARY: {passed}/{total} passed, {failed}/{total} failed")
    if failed:
        print("FAILED CASES:")
        for label, ok, detail in _results:
            if not ok:
                print(f"  - {label}: {detail}")
        raise SystemExit(1)
    print("=" * 78)
