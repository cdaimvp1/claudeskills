"""
audience_kernel.py
Lilly Procurement Skills - Comment Cleanup Audience-Strip Decision Kernel

Stdlib-only, non-numeric DECISION kernel that replaces model judgment for one
specific decision that comment-cleanup-1c344a/SKILL.md already specifies in
prose: given a comment's classification and the document's target audience,
should that comment be KEPT, STRIPPED, or sent for human REVIEW.

Source: comment-cleanup-1c344a/SKILL.md (Suite v10.6.6, Skill v1.0.1),
"Step 1: Comment Inventory" (classification tags), "Optional Inputs" item 2
(the three named audiences and their strip rules), "Step 2: Hygiene Analysis"
-> "AUDIENCE-INAPPROPRIATE candidates", and "## Guardrails" (the Hard Stop
absolute-preservation rule). Every category and rule below is copied from
those sections; none is invented. Where the source text does not state a
rule for a given classification/audience combination, this kernel refuses
rather than guesses (the suite's "refuse, don't guess" rule, the same
discipline numeric_kernel.py applies to arithmetic): it returns action
REVIEW with a `missing_input` field naming exactly what would resolve the
ambiguity, instead of fabricating a KEEP or STRIP.

SAFETY-CRITICAL invariants (enforced structurally, not just documented):
  1. An INTERNAL_ONLY comment (tagged or content-inferred) can NEVER resolve
     to KEEP when the audience is SUPPLIER (external). See Rule (INTERNAL_ONLY,
     SUPPLIER) below -> STRIP, always.
  2. A comment whose classification is UNKNOWN (UNCLASSIFIED, with no decisive
     content signal) never silently resolves either way -- it returns REVIEW,
     never a guessed KEEP (which could leak) and never a guessed STRIP (which
     would remove something a human never got to see or confirm).
  3. HARD_STOP is an absolute floor: "Never modify Hard Stop comments (red).
     Always preserved regardless of category" (SKILL.md, Guardrails). This
     kernel honors that ahead of every other check, including an unrecognized
     audience string.

Categories extracted verbatim from SKILL.md, Step 1 ("Classification"):
  Supplier-Facing (yellow marker), Internal-Only (purple marker),
  SME Escalation (blue marker), Hard Stop (red marker), Unclassified
  (no markers detected in the document -- SKILL.md: "do NOT fail and do NOT
  invent tags: mark every comment 'unclassified'").
Audiences extracted verbatim from SKILL.md, Optional Inputs item 2:
  "Sending to supplier", "Internal review", "Leadership summary".

This kernel takes structured attributes Claude has already classified (which
marker a comment carries, and -- only when unclassified -- whether the
comment's own content shows the specific leak signals SKILL.md names) and
audience, and returns a Decision. It performs no I/O, no network calls, and
no text classification of its own; the caller is responsible for reading the
comment and populating CommentAttrs honestly.

Serves: comment-cleanup-1c344a/SKILL.md, Step 2 "AUDIENCE-INAPPROPRIATE
candidates" and Step 3 "AUDIENCE STRIP" section of the Hygiene Report.
See MAINTENANCE.md conventions in lilly-procurement-kernels-1c344a for the
suite's update procedure (this kernel is skill-local, not suite-shared,
because the audience-strip rule is specific to comment-cleanup).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

SOURCE_VERSION = "comment-cleanup-1c344a SKILL.md, Skill Version 1.0.1 (June 2, 2026)"

# ===========================================================================
# CATEGORIES (extracted verbatim from SKILL.md -- do not add or rename)
# ===========================================================================

# Source: SKILL.md, Step 1 "Classification": "Auto-detect whether the
# document uses the lilly-contract-review emoji classification system
# (yellow Supplier-Facing, purple Internal-Only, blue SME Escalation, red
# Hard Stop) ... If they are ABSENT ... mark every comment 'unclassified'."
CLASS_SUPPLIER_FACING = "SUPPLIER_FACING"   # yellow marker in SKILL.md
CLASS_INTERNAL_ONLY = "INTERNAL_ONLY"       # purple marker in SKILL.md
CLASS_SME_ESCALATION = "SME_ESCALATION"     # blue marker in SKILL.md
CLASS_HARD_STOP = "HARD_STOP"               # red marker in SKILL.md
CLASS_UNCLASSIFIED = "UNCLASSIFIED"         # no markers detected

KNOWN_CLASSIFICATIONS = frozenset({
    CLASS_SUPPLIER_FACING, CLASS_INTERNAL_ONLY, CLASS_SME_ESCALATION,
    CLASS_HARD_STOP, CLASS_UNCLASSIFIED,
})

# Source: SKILL.md, "Optional Inputs" item 2 (the only three audiences the
# skill gives a concrete strip rule for):
#   "'Sending to supplier' -> strip all internal-only and SME escalation
#    comments, keep supplier-facing"
#   "'Internal review' -> keep all comments"
#   "'Leadership summary' -> strip detailed comments, keep high-level only"
AUDIENCE_SUPPLIER = "SUPPLIER"
AUDIENCE_INTERNAL_REVIEW = "INTERNAL_REVIEW"
AUDIENCE_LEADERSHIP_SUMMARY = "LEADERSHIP_SUMMARY"

KNOWN_AUDIENCES = frozenset({
    AUDIENCE_SUPPLIER, AUDIENCE_INTERNAL_REVIEW, AUDIENCE_LEADERSHIP_SUMMARY,
})

# The skill's Inputs section also lists "legal" and "internal leadership" as
# free-text audience examples ("supplier, internal leadership, legal, etc."),
# and Step 2 separately names a fourth combination -- "Technical detail
# comments in a document going to a business stakeholder" -- that maps to
# neither a named audience above nor a named classification tag. NONE of
# these get a concrete rule anywhere in SKILL.md beyond the three audiences
# above and the four classification tags above. Per "refuse rather than
# guess," any audience string outside KNOWN_AUDIENCES routes to REVIEW
# (see strip_action() below) rather than being mapped onto the nearest-
# sounding known audience.

ACTION_KEEP = "KEEP"      # SKILL.md's own word: "keep supplier-facing", "keep all comments"
ACTION_STRIP = "STRIP"    # SKILL.md's own word: "strip all internal-only...", "AUDIENCE STRIP"
ACTION_REVIEW = "REVIEW"  # this kernel's abstain output; not a business action SKILL.md
                          # names, but the suite-wide refuse-rather-than-guess contract
                          # this kernel is required to honor (see module docstring).

KNOWN_ACTIONS = frozenset({ACTION_KEEP, ACTION_STRIP, ACTION_REVIEW})


# ===========================================================================
# INPUT / OUTPUT SHAPES
# ===========================================================================

@dataclass(frozen=True)
class CommentAttrs:
    """Structured attributes Claude has already classified for one comment.

    classification: one of KNOWN_CLASSIFICATIONS. This is the marker
        detected on the comment (or CLASS_UNCLASSIFIED if the document does
        not use the marker system -- SKILL.md Step 1).
    content_leak_signal: ONLY consulted when classification is
        CLASS_UNCLASSIFIED. Source: SKILL.md Step 1: "infer audience-
        sensitivity from the comment content itself (a comment naming
        fallbacks, walk-away points, or internal deliberations is treated
        as internal/strategy-leak regardless of any missing tag)." Set this
        True only when the comment's own text shows one of those specific
        signals (fallback position, walk-away threshold, or reference to
        internal deliberation) -- this is Claude's judgment call to make
        while reading the comment, not this kernel's. Leave None (or False)
        when no such signal was found; per the safety-critical rule, "no
        signal found" is NOT the same as "confirmed safe," so it does not
        by itself unlock KEEP (see strip_action()).
        When classification is anything OTHER than CLASS_UNCLASSIFIED, this
        field is ignored: SKILL.md says an explicit marker is carried
        through every downstream step as-is ("If the markers are present,
        carry each comment's class through every downstream step").
    """

    classification: str
    content_leak_signal: Optional[bool] = None


@dataclass(frozen=True)
class StripDecision:
    """Kernel output for one comment.

    action: ACTION_KEEP, ACTION_STRIP, or ACTION_REVIEW.
    reason: human-readable explanation, always citing the SKILL.md rule (or
        naming the ambiguity) that produced this action.
    rule_citation: short verbatim (or near-verbatim) quote of the SKILL.md
        text this decision traces to.
    needs_review: True exactly when action == ACTION_REVIEW. Duplicated as
        its own boolean (matching frap_chain_kernel.py's Decision.needs_review
        convention in this suite) so callers can gate on it without a string
        comparison.
    missing_input: populated only when needs_review is True. Names exactly
        what structured input, if supplied, would let the kernel resolve
        this comment deterministically instead of routing to REVIEW.
    """

    action: str
    reason: str
    rule_citation: str
    needs_review: bool
    missing_input: Optional[str] = None


def _decision(action: str, reason: str, rule_citation: str,
              missing_input: Optional[str] = None) -> StripDecision:
    return StripDecision(
        action=action,
        reason=reason,
        rule_citation=rule_citation,
        needs_review=(action == ACTION_REVIEW),
        missing_input=missing_input,
    )


def _normalize(value: object) -> Optional[str]:
    """Canonicalize a caller-supplied classification/audience string (case,
    whitespace, hyphen/space-to-underscore) without changing its meaning.
    Returns None if `value` is not a non-empty string. This is pure string
    hygiene, not a business-rule guess: it never maps one recognized value
    onto a different one, it only tolerates spelling variants of the same
    token (e.g. "internal-only", "Internal Only", "internal_only" all
    normalize to the same key before the lookup below runs).
    """
    if not isinstance(value, str):
        return None
    cleaned = value.strip().upper().replace("-", "_").replace(" ", "_")
    return cleaned or None


# ===========================================================================
# THE DECISION MATRIX
#
# Only two of the three named audiences require a lookup table: audience ==
# AUDIENCE_INTERNAL_REVIEW is an unconditional "keep all comments" per
# SKILL.md (handled as a direct rule below, not a table row, because it does
# not vary by classification). HARD_STOP is likewise an unconditional
# absolute floor across every audience (handled first, before any table
# lookup). The table below therefore only needs to cover the remaining
# 3 classifications (SUPPLIER_FACING, INTERNAL_ONLY, SME_ESCALATION) x the
# remaining 2 audiences (SUPPLIER, LEADERSHIP_SUMMARY) = 6 cells.
# ===========================================================================

# Each cell: (action, rule_citation). Source quotes given inline.
_MATRIX = {
    (CLASS_SUPPLIER_FACING, AUDIENCE_SUPPLIER): (
        ACTION_KEEP,
        "SKILL.md, Optional Inputs #2: \"'Sending to supplier' -> strip all "
        "internal-only and SME escalation comments, keep supplier-facing.\"",
    ),
    (CLASS_INTERNAL_ONLY, AUDIENCE_SUPPLIER): (
        ACTION_STRIP,
        "SKILL.md, Optional Inputs #2: \"'Sending to supplier' -> strip all "
        "internal-only ... comments\"; corroborated by Step 2 AUDIENCE-"
        "INAPPROPRIATE candidates: \"Internal-only comments in a document "
        "going to a supplier.\"",
    ),
    (CLASS_SME_ESCALATION, AUDIENCE_SUPPLIER): (
        ACTION_STRIP,
        "SKILL.md, Optional Inputs #2: \"'Sending to supplier' -> strip all "
        "internal-only and SME escalation comments ...\"",
    ),
    (CLASS_SME_ESCALATION, AUDIENCE_LEADERSHIP_SUMMARY): (
        ACTION_STRIP,
        "SKILL.md, Step 2 AUDIENCE-INAPPROPRIATE candidates: \"SME "
        "escalation comments in a document going to leadership.\"",
    ),
    # The two cells below are DELIBERATELY ambiguous per SKILL.md and route
    # to REVIEW via the fallback path in strip_action(), not via this table
    # (kept here only as documentation of what was checked and found absent):
    #   (CLASS_SUPPLIER_FACING, AUDIENCE_LEADERSHIP_SUMMARY): SKILL.md says
    #     "Leadership summary -> strip detailed comments, keep high-level
    #     only" but never ties "detailed vs high-level" to the classification
    #     tags, and Step 2's leadership bullet names only SME Escalation.
    #     Not stated -> REVIEW.
    #   (CLASS_INTERNAL_ONLY, AUDIENCE_LEADERSHIP_SUMMARY): same gap -- an
    #     internal-only tag is not one of the leadership-inappropriate types
    #     Step 2 names, and "Internal review" (a different, unconditional
    #     audience) is the only place SKILL.md says internal-only comments
    #     are unconditionally fine. Not stated for leadership -> REVIEW.
}


def strip_action(comment_attrs: CommentAttrs, audience: str) -> StripDecision:
    """Decide keep / strip / review for one comment given the target audience.

    Pure function: deterministic, no I/O, no network, no hidden state.
    See module docstring for the SAFETY-CRITICAL invariants this function
    is structurally required to uphold.
    """
    audience_key = _normalize(audience)
    classification_key = _normalize(comment_attrs.classification)

    # --- Absolute floor 1: Hard Stop is always preserved, before anything
    # else is even checked (including an unrecognized audience string). ----
    # Source: SKILL.md, "## Guardrails": "Never modify Hard Stop comments
    # (red). Always preserved regardless of category."
    if classification_key == CLASS_HARD_STOP:
        return _decision(
            ACTION_KEEP,
            "Hard Stop comments are an absolute floor: never stripped for "
            "any audience, including an unrecognized one.",
            "SKILL.md, Guardrails: \"Never modify Hard Stop comments (red). "
            "Always preserved regardless of category.\"",
        )

    # --- Refuse rather than guess: unrecognized audience. ------------------
    # SKILL.md gives a concrete strip rule for exactly three audiences
    # (supplier / internal review / leadership summary). Any other audience
    # value (e.g. "legal", "business stakeholder" -- both appear elsewhere
    # in SKILL.md as audience *examples* with no stated strip rule) has no
    # encoded rule; guessing which of the three it most resembles would be
    # fabricating a criterion SKILL.md does not state.
    if audience_key not in KNOWN_AUDIENCES:
        return _decision(
            ACTION_REVIEW,
            f"Audience {audience!r} is not one of the three audiences "
            "SKILL.md gives a concrete strip rule for (supplier / internal "
            "review / leadership summary). Refusing to guess which rule "
            "applies rather than assuming this audience behaves like one "
            "of the three.",
            "SKILL.md, Optional Inputs #2 states rules only for 'Sending to "
            "supplier', 'Internal review', and 'Leadership summary'.",
            missing_input=(
                "an audience value that is one of SUPPLIER / "
                "INTERNAL_REVIEW / LEADERSHIP_SUMMARY, or (if this is a "
                "genuinely new audience) a human decision for this comment"
            ),
        )

    # --- Absolute floor 2: Internal review keeps everything, unconditionally
    # on classification (this is why it is not in the table above). --------
    # Source: SKILL.md, Optional Inputs #2: "'Internal review' -> keep all
    # comments."
    if audience_key == AUDIENCE_INTERNAL_REVIEW:
        return _decision(
            ACTION_KEEP,
            "Internal review audience keeps every comment regardless of "
            "classification; nothing leaves the internal boundary, so "
            "there is no leak risk to gate on.",
            "SKILL.md, Optional Inputs #2: \"'Internal review' -> keep all "
            "comments.\"",
        )

    # --- Refuse rather than guess: unrecognized classification string. -----
    if classification_key not in KNOWN_CLASSIFICATIONS:
        return _decision(
            ACTION_REVIEW,
            f"Classification {comment_attrs.classification!r} is not one "
            "of the categories SKILL.md's Step 1 defines (Supplier-Facing / "
            "Internal-Only / SME Escalation / Hard Stop / Unclassified). "
            "Origin is effectively unknown; per the safety-critical rule, "
            "an unknown origin/classification must return REVIEW, never a "
            "guessed KEEP or STRIP.",
            "SKILL.md, Step 1 Classification: the four markers plus "
            "'unclassified' are the only categories this skill defines.",
            missing_input=(
                "a classification value that is one of SUPPLIER_FACING / "
                "INTERNAL_ONLY / SME_ESCALATION / HARD_STOP / UNCLASSIFIED"
            ),
        )

    # --- Unclassified: resolve via the content-inference rule, or refuse. --
    # Source: SKILL.md, Step 1: "If they are ABSENT ... mark every comment
    # 'unclassified' and infer audience-sensitivity from the comment content
    # itself (a comment naming fallbacks, walk-away points, or internal
    # deliberations is treated as internal/strategy-leak regardless of any
    # missing tag)."
    if classification_key == CLASS_UNCLASSIFIED:
        if comment_attrs.content_leak_signal is True:
            effective_classification = CLASS_INTERNAL_ONLY
            leak_note = (
                " Treated as INTERNAL_ONLY per the content-inference rule "
                "because content_leak_signal is True (the comment names a "
                "fallback, walk-away point, or internal deliberation)."
            )
        else:
            # content_leak_signal is False or None: SKILL.md's content-
            # inference rule only ever gives a positive test ("naming
            # fallbacks/walk-away/deliberation -> treat as internal"); it
            # never states that the ABSENCE of that specific phrasing means
            # a comment is confirmed safe for an external audience. "No
            # signal found" != "confirmed supplier-safe," so this remains a
            # genuine unknown for any audience other than internal review
            # (already handled above).
            return _decision(
                ACTION_REVIEW,
                "Comment is unclassified (no marker detected) and no "
                "content-inferred leak signal was supplied. SKILL.md's "
                "content-inference rule only positively flags comments "
                "that show fallback/walk-away/deliberation language; it "
                "does not establish that a comment lacking that language "
                "is safe for a non-internal audience. Refusing to guess "
                "either KEEP or STRIP.",
                "SKILL.md, Step 1 Classification: 'infer audience-"
                "sensitivity from the comment content itself'; absence of "
                "the named signals is not addressed as a 'safe' case.",
                missing_input=(
                    "either a detected classification marker, or an "
                    "explicit content_leak_signal=True finding (fallback, "
                    "walk-away, or internal-deliberation language), or a "
                    "human read of this specific comment"
                ),
            )
    else:
        effective_classification = classification_key

    cell = _MATRIX.get((effective_classification, audience_key))
    if cell is None:
        # Reachable only for (SUPPLIER_FACING or INTERNAL_ONLY, LEADERSHIP_SUMMARY)
        # -- the two combinations SKILL.md's Step 2 does not name (see the
        # comment block above _MATRIX). Documented ambiguity, not a bug.
        return _decision(
            ACTION_REVIEW,
            f"SKILL.md states 'Leadership summary -> strip detailed "
            "comments, keep high-level only' but ties the leadership-strip "
            "rule to only one named category (SME Escalation, per Step 2). "
            f"It does not state whether a {effective_classification} "
            "comment counts as 'detailed' or 'high-level' for a leadership "
            "audience. Refusing to guess.",
            "SKILL.md, Optional Inputs #2 + Step 2 AUDIENCE-INAPPROPRIATE "
            "candidates: leadership rule is stated only for SME Escalation "
            "and for the general, undefined 'detailed vs high-level' axis.",
            missing_input=(
                "a per-comment 'detailed vs high-level' read (e.g. from the "
                "SHORTENING criteria elsewhere in this skill), or a human "
                "decision for this comment"
            ),
        )

    action, citation = cell
    reason = (
        f"Classification={effective_classification}"
        + (
            " (content-inferred from UNCLASSIFIED)"
            if classification_key == CLASS_UNCLASSIFIED
            else ""
        )
        + f", audience={audience_key} -> {action} per SKILL.md's own rule."
    )
    return _decision(action, reason, citation)


# ===========================================================================
# SELF-TEST
# ===========================================================================

if __name__ == "__main__":
    passed = 0
    failed = 0

    def check(label: str, condition: bool, detail: str = "") -> None:
        global passed, failed
        status = "PASS" if condition else "FAIL"
        if condition:
            passed += 1
        else:
            failed += 1
        print(f"[{status}] {label}" + (f" -- {detail}" if detail else ""))

    print("=" * 78)
    print("GOLDEN TESTS (each traces to a quoted line in comment-cleanup-1c344a/SKILL.md)")
    print("=" * 78)

    # --- Golden 1: "Sending to supplier" keeps supplier-facing -------------
    d1 = strip_action(CommentAttrs(CLASS_SUPPLIER_FACING), AUDIENCE_SUPPLIER)
    check(
        "SUPPLIER_FACING + SUPPLIER audience -> KEEP "
        "(\"'Sending to supplier' -> ... keep supplier-facing\")",
        d1.action == ACTION_KEEP and not d1.needs_review,
        f"got {d1.action}",
    )

    # --- Golden 2: "Sending to supplier" strips internal-only --------------
    d2 = strip_action(CommentAttrs(CLASS_INTERNAL_ONLY), AUDIENCE_SUPPLIER)
    check(
        "INTERNAL_ONLY + SUPPLIER audience -> STRIP "
        "(\"'Sending to supplier' -> strip all internal-only ... comments\")",
        d2.action == ACTION_STRIP,
        f"got {d2.action}",
    )

    # --- Golden 3: "Sending to supplier" strips SME escalation -------------
    d3 = strip_action(CommentAttrs(CLASS_SME_ESCALATION), AUDIENCE_SUPPLIER)
    check(
        "SME_ESCALATION + SUPPLIER audience -> STRIP "
        "(\"... and SME escalation comments\")",
        d3.action == ACTION_STRIP,
        f"got {d3.action}",
    )

    # --- Golden 4: "Internal review" keeps everything, any classification --
    for cls in (CLASS_SUPPLIER_FACING, CLASS_INTERNAL_ONLY, CLASS_SME_ESCALATION,
                CLASS_HARD_STOP, CLASS_UNCLASSIFIED):
        d = strip_action(CommentAttrs(cls), AUDIENCE_INTERNAL_REVIEW)
        check(
            f"{cls} + INTERNAL_REVIEW audience -> KEEP (\"keep all comments\")",
            d.action == ACTION_KEEP,
            f"got {d.action}",
        )

    # --- Golden 5: SME escalation stripped for leadership -------------------
    d5 = strip_action(CommentAttrs(CLASS_SME_ESCALATION), AUDIENCE_LEADERSHIP_SUMMARY)
    check(
        "SME_ESCALATION + LEADERSHIP_SUMMARY audience -> STRIP "
        "(\"SME escalation comments in a document going to leadership\")",
        d5.action == ACTION_STRIP,
        f"got {d5.action}",
    )

    # --- Golden 6: Hard Stop is an absolute floor across every audience -----
    for aud in (AUDIENCE_SUPPLIER, AUDIENCE_INTERNAL_REVIEW, AUDIENCE_LEADERSHIP_SUMMARY, "NOT_A_REAL_AUDIENCE"):
        d = strip_action(CommentAttrs(CLASS_HARD_STOP), aud)
        check(
            f"HARD_STOP + audience={aud!r} -> KEEP always "
            "(\"Never modify Hard Stop comments ... Always preserved regardless of category\")",
            d.action == ACTION_KEEP and not d.needs_review,
            f"got action={d.action}, needs_review={d.needs_review}",
        )

    # --- Golden 7: content-inference rule for unclassified comments --------
    d7 = strip_action(CommentAttrs(CLASS_UNCLASSIFIED, content_leak_signal=True), AUDIENCE_SUPPLIER)
    check(
        "UNCLASSIFIED + content_leak_signal=True + SUPPLIER audience -> STRIP "
        "(\"treated as internal/strategy-leak regardless of any missing tag\")",
        d7.action == ACTION_STRIP,
        f"got {d7.action}",
    )

    print()
    print("=" * 78)
    print("ABSTAIN / REVIEW TESTS (must refuse rather than guess)")
    print("=" * 78)

    # --- Abstain 1: unclassified, no decisive content signal, external -----
    d8 = strip_action(CommentAttrs(CLASS_UNCLASSIFIED, content_leak_signal=None), AUDIENCE_SUPPLIER)
    check(
        "UNCLASSIFIED + content_leak_signal=None + SUPPLIER audience -> REVIEW "
        "(unknown origin; never silently strip, never silently leak)",
        d8.action == ACTION_REVIEW and d8.needs_review is True and d8.missing_input is not None,
        f"action={d8.action}, needs_review={d8.needs_review}, missing_input={d8.missing_input!r}",
    )

    # --- Abstain 2: same, but content_leak_signal explicitly False ---------
    d9 = strip_action(CommentAttrs(CLASS_UNCLASSIFIED, content_leak_signal=False), AUDIENCE_SUPPLIER)
    check(
        "UNCLASSIFIED + content_leak_signal=False + SUPPLIER audience -> REVIEW "
        "(absence of the named leak signals is not stated as 'confirmed safe')",
        d9.action == ACTION_REVIEW,
        f"got {d9.action}",
    )

    # --- Abstain 3: unrecognized audience string ----------------------------
    d10 = strip_action(CommentAttrs(CLASS_SUPPLIER_FACING), "LEGAL")
    check(
        "SUPPLIER_FACING + audience='LEGAL' -> REVIEW "
        "(SKILL.md states a rule for only 3 named audiences)",
        d10.action == ACTION_REVIEW and d10.needs_review is True,
        f"action={d10.action}, needs_review={d10.needs_review}",
    )

    # --- Abstain 4: unrecognized classification string ----------------------
    d11 = strip_action(CommentAttrs("SOME_MADE_UP_TAG"), AUDIENCE_SUPPLIER)
    check(
        "classification='SOME_MADE_UP_TAG' + SUPPLIER audience -> REVIEW "
        "(not one of SKILL.md's defined categories)",
        d11.action == ACTION_REVIEW and d11.needs_review is True,
        f"action={d11.action}, needs_review={d11.needs_review}",
    )

    # --- Abstain 5: ambiguous leadership combinations SKILL.md never names --
    d12a = strip_action(CommentAttrs(CLASS_SUPPLIER_FACING), AUDIENCE_LEADERSHIP_SUMMARY)
    d12b = strip_action(CommentAttrs(CLASS_INTERNAL_ONLY), AUDIENCE_LEADERSHIP_SUMMARY)
    check(
        "SUPPLIER_FACING + LEADERSHIP_SUMMARY -> REVIEW (not named in Step 2's "
        "leadership-inappropriate list; not invented)",
        d12a.action == ACTION_REVIEW,
        f"got {d12a.action}",
    )
    check(
        "INTERNAL_ONLY + LEADERSHIP_SUMMARY -> REVIEW (not named in Step 2's "
        "leadership-inappropriate list; not invented)",
        d12b.action == ACTION_REVIEW,
        f"got {d12b.action}",
    )

    print()
    print("=" * 78)
    print("NEGATIVE / SAFETY-INVARIANT TESTS")
    print("=" * 78)

    # --- Negative 1: the core safety-critical invariant, stated directly ---
    d13 = strip_action(CommentAttrs(CLASS_INTERNAL_ONLY), AUDIENCE_SUPPLIER)
    check(
        "SAFETY-CRITICAL: INTERNAL_ONLY + external/SUPPLIER audience is NEVER KEEP",
        d13.action != ACTION_KEEP,
        f"got {d13.action}",
    )

    # --- Negative 2: content-inferred internal-equivalent is also never KEEP
    d14 = strip_action(CommentAttrs(CLASS_UNCLASSIFIED, content_leak_signal=True), AUDIENCE_SUPPLIER)
    check(
        "SAFETY-CRITICAL: content-inferred internal-equivalent + SUPPLIER "
        "audience is NEVER KEEP",
        d14.action != ACTION_KEEP,
        f"got {d14.action}",
    )

    # --- Negative 3: an unknown classification/audience never resolves KEEP
    # or STRIP -- it must always be REVIEW (sweep) ---------------------------
    all_reviews_are_review = all(
        strip_action(CommentAttrs(bad_cls), AUDIENCE_SUPPLIER).action == ACTION_REVIEW
        for bad_cls in ("", "unknown", "N/A", "supplier-facing-ish")
    )
    check(
        "SAFETY-CRITICAL sweep: assorted unrecognized classification strings "
        "always -> REVIEW, never a guessed KEEP/STRIP",
        all_reviews_are_review,
        "",
    )

    # --- Negative 4: output action is always one of the three known actions
    sweep_ok = True
    for cls in (CLASS_SUPPLIER_FACING, CLASS_INTERNAL_ONLY, CLASS_SME_ESCALATION,
                CLASS_HARD_STOP, CLASS_UNCLASSIFIED, "GARBAGE"):
        for aud in (AUDIENCE_SUPPLIER, AUDIENCE_INTERNAL_REVIEW,
                    AUDIENCE_LEADERSHIP_SUMMARY, "GARBAGE_AUDIENCE"):
            for leak in (True, False, None):
                d = strip_action(CommentAttrs(cls, content_leak_signal=leak), aud)
                if d.action not in KNOWN_ACTIONS:
                    sweep_ok = False
    check(
        "Exhaustive sweep: every (classification, audience, leak_signal) "
        "combination returns one of KEEP/STRIP/REVIEW, nothing else",
        sweep_ok,
        "",
    )

    print()
    print("=" * 78)
    print(f"SUMMARY: {passed}/{passed + failed} passed")
    if failed:
        print(f"FAILED: {failed}/{passed + failed}")
        raise SystemExit(1)
