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

v1.1.0 EXTENSION (two-mode workflow + redlines) -- additive, not a rewrite:
This version adds a `mode` parameter so a caller can drive the kernel
directly from the skill's two named workflow modes -- Return to Supplier
(MODE_RETURN_TO_SUPPLIER) and Finalize for Signature
(MODE_FINALIZE_FOR_SIGNATURE) -- instead of first having to map a mode onto
one of the three free-text audiences below. This is purely additive:
strip_action(comment_attrs, audience) is completely unchanged (every
Golden/Abstain/Negative test below still runs against the original
function, untouched), and the new mode_action() entry point is a thin
dispatcher built ON TOP of strip_action() plus two new functions
(finalize_comment_action(), redline_finalize_action()). Every existing
safety invariant therefore carries over unchanged into both modes: an
internal-only item can never resolve to KEEP for a supplier-facing goal,
and an unknown/unclassified item always resolves to REVIEW, never a
guessed action.

Return to Supplier mode answers the same question strip_action() already
answers -- is this item (comment OR redline) appropriate for a supplier
audience -- so it reuses strip_action(item, AUDIENCE_SUPPLIER) verbatim,
for both comments and redlines (a redline's own audience-appropriateness is
modeled the same way a comment's is: via CommentAttrs' classification and
content_leak_signal fields; see item_kind on CommentAttrs). Per SKILL.md's
Mode Selection, Return to Supplier never touches document body text, so it
never accepts a redline into the body -- it only ever leaves a redline as
KEEP or, when internal-only content is folded into that specific change,
flags it for REVIEW/STRIP of the surrounding commentary.

Finalize for Signature introduces a fourth action, REDACT, for the one
decision strip_action() was never built for: whether a REDLINE (a tracked
change in the document body -- an insertion or deletion, not a comment)
gets accepted into the final signed text. REDACT means "bake this
already-agreed change into the body and remove its tracked-change markup" --
SKILL.md's own words: "Accept the agreed tracked changes into the body"
(HIGHER-STAKES MODE Finalize for Execution, Step 3). REDACT is never
returned for a comment (comments only ever KEEP, STRIP, or REVIEW, in
either mode) and is never returned outside Finalize for Signature (Return
to Supplier never bakes tracked changes into the body).

New source citations this extension relies on (all from the same SKILL.md
already cited above): "Mode Selection" (the two-mode split and the "never
touches contract/document body text" boundary), "HIGHER-STAKES MODE
Finalize for Execution" Steps 2, 3, 4, and 6 (the three-way scope choice,
the never-auto-accept-disputed-changes rule, the strip-internal-and-SME
rule, and the unresolved-Hard-Stop blocker), and the Guardrails section
(never auto-delete, never modify Hard Stop).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

SOURCE_VERSION = "comment-cleanup-1c344a SKILL.md, Skill Version 1.1.0 (July 22, 2026)"

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
ACTION_REDACT = "REDACT"  # v1.1.0: Finalize for Signature's redline-only action. SKILL.md,
                          # Finalize for Execution Step 3: "Accept the agreed tracked
                          # changes into the body." Returned ONLY by redline_finalize_action()
                          # / mode_action() for a RedlineAttrs item under
                          # MODE_FINALIZE_FOR_SIGNATURE; never for a comment, never under
                          # MODE_RETURN_TO_SUPPLIER (that mode never touches body text).

KNOWN_ACTIONS = frozenset({ACTION_KEEP, ACTION_STRIP, ACTION_REVIEW, ACTION_REDACT})


# ===========================================================================
# v1.1.0: MODES, ITEM KINDS, REDLINE STATUSES, FINALIZE SCOPES
# Source: SKILL.md, "Mode Selection" (the two named modes) and
# "HIGHER-STAKES MODE Finalize for Execution", Step 2 (the three scope
# choices offered as tappable options).
# ===========================================================================

# The two workflow modes this skill now runs as its primary entry points.
# Source: SKILL.md, "Mode Selection": "Return to Supplier" and "Finalize for
# Signature" (formerly "Finalize for Execution" -- same higher-stakes job,
# renamed to match the trigger phrase "finalize this for signature").
MODE_RETURN_TO_SUPPLIER = "RETURN_TO_SUPPLIER"
MODE_FINALIZE_FOR_SIGNATURE = "FINALIZE_FOR_SIGNATURE"

KNOWN_MODES = frozenset({MODE_RETURN_TO_SUPPLIER, MODE_FINALIZE_FOR_SIGNATURE})

# What kind of document item a decision is being made about. Comments and
# redlines (tracked changes: insertions/deletions in the document BODY, not
# comment metadata) ask different questions of this kernel -- see module
# docstring -- so callers tag which one they mean. Purely a phrasing/routing
# discriminator; it does not change the KEEP/STRIP logic itself for
# strip_action() (a redline's audience-appropriateness is judged by the same
# classification rules as a comment's).
ITEM_KIND_COMMENT = "COMMENT"
ITEM_KIND_REDLINE = "REDLINE"

KNOWN_ITEM_KINDS = frozenset({ITEM_KIND_COMMENT, ITEM_KIND_REDLINE})

# Redline (tracked-change) agreement states. Source: SKILL.md, Finalize for
# Execution, Step 2's scope options name exactly two affirmative states
# ("all changes both sides have agreed" and "only Lilly-accepted items") and
# Step 3 names the negative state explicitly ("still open or disputed").
REDLINE_STATUS_AGREED_BOTH_SIDES = "AGREED_BOTH_SIDES"
REDLINE_STATUS_LILLY_ACCEPTED_ONLY = "LILLY_ACCEPTED_ONLY"
REDLINE_STATUS_OPEN_DISPUTED = "OPEN_DISPUTED"

KNOWN_REDLINE_STATUSES = frozenset({
    REDLINE_STATUS_AGREED_BOTH_SIDES, REDLINE_STATUS_LILLY_ACCEPTED_ONLY,
    REDLINE_STATUS_OPEN_DISPUTED,
})

# The three scope choices SKILL.md's Finalize Step 2 offers as tappable
# options for which tracked changes to accept. Verbatim: "Accept which
# changes? (a) all changes both sides have agreed, (b) only Lilly-accepted
# items, (c) walk through each."
SCOPE_ALL_AGREED = "ALL_AGREED"
SCOPE_LILLY_ACCEPTED_ONLY = "LILLY_ACCEPTED_ONLY"
SCOPE_WALK_THROUGH_EACH = "WALK_THROUGH_EACH"

KNOWN_SCOPES = frozenset({
    SCOPE_ALL_AGREED, SCOPE_LILLY_ACCEPTED_ONLY, SCOPE_WALK_THROUGH_EACH,
})


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
    item_kind: v1.1.0. One of KNOWN_ITEM_KINDS. Defaults to
        ITEM_KIND_COMMENT (fully backward compatible with every pre-v1.1.0
        caller, which never set this field). Set to ITEM_KIND_REDLINE when
        this attribute set describes a tracked-change's own audience-
        appropriateness under MODE_RETURN_TO_SUPPLIER (see module
        docstring): the classification/content_leak_signal fields and the
        KEEP/STRIP/REVIEW logic are identical either way; this field only
        changes the wording of the returned `reason` (and downstream
        Hygiene Report labeling) between "comment" and "redline".
    """

    classification: str
    content_leak_signal: Optional[bool] = None
    item_kind: str = ITEM_KIND_COMMENT


@dataclass(frozen=True)
class StripDecision:
    """Kernel output for one comment OR one redline (v1.1.0).

    action: ACTION_KEEP, ACTION_STRIP, ACTION_REVIEW (any item), or
        ACTION_REDACT (v1.1.0, redlines only -- see module docstring).
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


@dataclass(frozen=True)
class RedlineAttrs:
    """v1.1.0. Structured attributes for one REDLINE (a tracked-change
    insertion or deletion in the document BODY) under
    MODE_FINALIZE_FOR_SIGNATURE, answering a different question than
    CommentAttrs does: not "who should see this," but "has this change been
    agreed, and can it be baked into the final signed text."

    status: one of KNOWN_REDLINE_STATUSES.
        REDLINE_STATUS_AGREED_BOTH_SIDES -- both parties have agreed to this
            change (the strongest state; qualifies to be accepted under
            either Finalize scope option (a) or (b)).
        REDLINE_STATUS_LILLY_ACCEPTED_ONLY -- Lilly has accepted it, but
            nothing here establishes the supplier side has also confirmed
            -- source: SKILL.md, Finalize Step 2 scope option (b) "only
            Lilly-accepted items" is offered as a DIFFERENT, narrower scope
            than option (a) "all changes both sides have agreed," which
            only makes sense if the two are not always the same set.
            Qualifies to be accepted ONLY under scope (b), never scope (a).
        REDLINE_STATUS_OPEN_DISPUTED -- still open or actively disputed.
            Source: SKILL.md, Finalize Step 3: "Do NOT silently accept
            changes that were still open or disputed; list any you are
            unsure about and ask." Never accepted, under any scope.
    linked_hard_stop: True when this redline is tied to (adjacent to, or the
        subject of) an unresolved Hard Stop (red) comment. Source: SKILL.md,
        Finalize Step 6: "Flag blockers: if any Hard Stop (red) is
        unresolved, do NOT present the document as execution-ready; surface
        the open Hard Stop and stop." This is an absolute floor, like Hard
        Stop is for comments: a linked, unresolved Hard Stop routes this
        redline to REVIEW regardless of status or scope. Defaults to False
        (no linkage known); set True only when Claude has actually found an
        unresolved Hard Stop comment attached to or governing this change.
    """

    status: str
    linked_hard_stop: bool = False


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
# v1.1.0: FINALIZE FOR SIGNATURE -- COMMENT MATRIX
#
# Source: SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 4:
# "Strip all internal-only and SME comments, and any remaining supplier-
# facing comments the user does not want in the executed copy." This states
# an unconditional STRIP for internal-only and SME comments (identical to
# the AUDIENCE_SUPPLIER rule strip_action() already implements), but leaves
# the disposition of a remaining SUPPLIER_FACING comment user-dependent --
# it does NOT say "keep all supplier-facing comments" the way Optional
# Inputs #2 does for "Sending to supplier." Rather than invent an
# unconditional keep SKILL.md never states for the signature-bound copy,
# this is implemented as a targeted override on top of strip_action(), so
# every other cell (Hard Stop floor, unknown-classification refusal,
# unclassified content-inference) is reused byte-for-byte, not re-derived.
# ===========================================================================

def finalize_comment_action(comment_attrs: CommentAttrs) -> StripDecision:
    """Decide keep / strip / review for one COMMENT under Finalize for
    Signature. Pure function; same purity guarantees as strip_action().

    Implemented as strip_action(comment_attrs, AUDIENCE_SUPPLIER) with one
    override: a SUPPLIER_FACING comment resolves to REVIEW here instead of
    KEEP, because SKILL.md ties an unconditional keep to "Sending to
    supplier" (Optional Inputs #2) but not to the signature-bound copy
    (Step 4's wording is user-dependent, not unconditional). Every other
    outcome -- INTERNAL_ONLY/SME_ESCALATION -> STRIP, HARD_STOP -> KEEP
    (absolute floor), UNCLASSIFIED -> content-inference or REVIEW, unknown
    classification -> REVIEW -- is identical to the AUDIENCE_SUPPLIER path
    and is NOT re-implemented; it flows through unchanged.
    """
    base = strip_action(comment_attrs, AUDIENCE_SUPPLIER)
    classification_key = _normalize(comment_attrs.classification)

    if base.action == ACTION_KEEP and classification_key == CLASS_SUPPLIER_FACING:
        return _decision(
            ACTION_REVIEW,
            "Finalize for Signature strips internal-only and SME comments "
            "unconditionally, but SKILL.md does not state an unconditional "
            "keep for a remaining supplier-facing comment in the "
            "signature-ready copy; whether it stays is a per-comment, "
            "user-dependent call, not a rule this kernel can resolve "
            "on its own.",
            "SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 4: "
            "\"Strip all internal-only and SME comments, and any remaining "
            "supplier-facing comments the user does not want in the "
            "executed copy.\"",
            missing_input=(
                "a user decision on whether this supplier-facing comment "
                "should remain in the signed copy"
            ),
        )

    return base


# ===========================================================================
# v1.1.0: FINALIZE FOR SIGNATURE -- REDLINE (TRACKED-CHANGE) MATRIX
#
# Source: SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Steps 2, 3,
# and 6. Only two cells resolve unconditionally: a mutually-agreed change
# qualifies under EITHER scope (a) or (b); a Lilly-only-accepted change
# qualifies ONLY under scope (b) (see RedlineAttrs docstring for why these
# are not treated as interchangeable). Every other combination -- an open/
# disputed change under any scope, an unrecognized status or scope, a
# Lilly-only-accepted change under the stricter scope (a), or scope (c)
# ("walk through each") under any status -- routes to REVIEW rather than
# guessing, per the same refuse-rather-than-guess discipline strip_action()
# applies to comments.
# ===========================================================================

_REDLINE_MATRIX = {
    (SCOPE_ALL_AGREED, REDLINE_STATUS_AGREED_BOTH_SIDES): (
        ACTION_REDACT,
        "SKILL.md, Finalize for Execution, Step 2 scope (a) \"all changes "
        "both sides have agreed\" + Step 3 \"Accept the agreed tracked "
        "changes into the body.\"",
    ),
    (SCOPE_LILLY_ACCEPTED_ONLY, REDLINE_STATUS_AGREED_BOTH_SIDES): (
        ACTION_REDACT,
        "SKILL.md, Finalize for Execution, Step 2 scope (b) \"only "
        "Lilly-accepted items\": a change both sides agreed to is a "
        "fortiori Lilly-accepted, so it qualifies under this narrower "
        "scope too.",
    ),
    (SCOPE_LILLY_ACCEPTED_ONLY, REDLINE_STATUS_LILLY_ACCEPTED_ONLY): (
        ACTION_REDACT,
        "SKILL.md, Finalize for Execution, Step 2 scope (b): \"only "
        "Lilly-accepted items.\"",
    ),
    # (SCOPE_ALL_AGREED, REDLINE_STATUS_LILLY_ACCEPTED_ONLY) is DELIBERATELY
    # absent: scope (a) requires both sides agreed; a Lilly-only acceptance
    # does not establish that, so it falls to the REVIEW fallback below
    # rather than being guessed into either matrix action.
}


def redline_finalize_action(redline_attrs: RedlineAttrs, scope: str) -> StripDecision:
    """Decide redact (accept-into-body) / review for one REDLINE under
    Finalize for Signature. Pure function; same purity guarantees as
    strip_action(). Never returns KEEP or STRIP -- those are comment-only
    actions (see module docstring); a redline this function will not accept
    is surfaced as REVIEW, left as an open tracked change for the user.
    """
    scope_key = _normalize(scope)
    status_key = _normalize(redline_attrs.status)

    # --- Absolute floor: a redline linked to an unresolved Hard Stop is ----
    # never auto-accepted, regardless of scope or status.
    if redline_attrs.linked_hard_stop:
        return _decision(
            ACTION_REVIEW,
            "This redline is linked to an unresolved Hard Stop comment. "
            "Per SKILL.md, an unresolved Hard Stop blocks presenting the "
            "document as execution-ready at all, so this change cannot be "
            "auto-accepted while that Hard Stop stands, regardless of its "
            "own agreement status.",
            "SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 6: "
            "\"Flag blockers: if any Hard Stop (red) is unresolved, do NOT "
            "present the document as execution-ready; surface the open "
            "Hard Stop and stop.\"",
            missing_input=(
                "resolution of the linked Hard Stop comment before this "
                "redline can be finalized"
            ),
        )

    # --- Refuse rather than guess: unrecognized scope. ---------------------
    if scope_key not in KNOWN_SCOPES:
        return _decision(
            ACTION_REVIEW,
            f"Scope {scope!r} is not one of the three scope choices "
            "SKILL.md's Finalize Step 2 defines (all mutually-agreed "
            "changes / only Lilly-accepted items / walk through each). "
            "Refusing to guess which scope this is meant to be.",
            "SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 2: "
            "\"Accept which changes? (a) all changes both sides have "
            "agreed, (b) only Lilly-accepted items, (c) walk through "
            "each.\"",
            missing_input=(
                "a scope value that is one of ALL_AGREED / "
                "LILLY_ACCEPTED_ONLY / WALK_THROUGH_EACH"
            ),
        )

    # --- Scope (c): user explicitly chose to walk through every redline. --
    if scope_key == SCOPE_WALK_THROUGH_EACH:
        return _decision(
            ACTION_REVIEW,
            "User chose to walk through every tracked change individually; "
            "no redline is auto-accepted under this scope, regardless of "
            "its agreement status.",
            "SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 2 "
            "scope option (c): \"walk through each.\"",
        )

    # --- Refuse rather than guess: unrecognized redline status. ------------
    if status_key not in KNOWN_REDLINE_STATUSES:
        return _decision(
            ACTION_REVIEW,
            f"Redline status {redline_attrs.status!r} is not one of the "
            "agreement states this decision defines (agreed by both sides "
            "/ Lilly-accepted only / open or disputed). The agreement "
            "state is effectively unknown, so this must return REVIEW "
            "rather than a guessed accept.",
            "SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 3: "
            "\"Do NOT silently accept changes that were still open or "
            "disputed; list any you are unsure about and ask.\"",
            missing_input=(
                "a redline status value that is one of "
                "AGREED_BOTH_SIDES / LILLY_ACCEPTED_ONLY / OPEN_DISPUTED"
            ),
        )

    # --- Never accepted, under any scope: open or disputed. ----------------
    if status_key == REDLINE_STATUS_OPEN_DISPUTED:
        return _decision(
            ACTION_REVIEW,
            "An open or disputed tracked change is never auto-accepted, "
            "under any scope.",
            "SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 3: "
            "\"Do NOT silently accept changes that were still open or "
            "disputed; list any you are unsure about and ask.\"",
        )

    cell = _REDLINE_MATRIX.get((scope_key, status_key))
    if cell is None:
        # Reachable only for (SCOPE_ALL_AGREED, REDLINE_STATUS_LILLY_ACCEPTED_ONLY)
        # -- see the comment above _REDLINE_MATRIX.
        return _decision(
            ACTION_REVIEW,
            f"scope={scope_key}, redline_status={status_key} is not a "
            "combination SKILL.md's Step 2 scope options resolve "
            "unconditionally: a Lilly-only acceptance does not by itself "
            "establish that the other side has also agreed, which is what "
            "the stricter 'all changes both sides have agreed' scope "
            "requires. Refusing to guess.",
            "SKILL.md, HIGHER-STAKES MODE Finalize for Execution, Step 2 "
            "scope options (a) vs (b).",
            missing_input=(
                "confirmation that the other side has also agreed to this "
                "change, or a human decision for this redline"
            ),
        )

    action, citation = cell
    reason = (
        f"scope={scope_key}, redline_status={status_key} -> {action} per "
        "SKILL.md's Finalize Step 2/3 rules."
    )
    return _decision(action, reason, citation)


# ===========================================================================
# v1.1.0: mode_action() -- SINGLE ENTRY POINT FOR THE TWO WORKFLOW MODES
#
# This is what SKILL.md's Kernel Wiring table now calls once per item
# (comment or redline). It is a thin dispatcher: it does no new business-
# rule reasoning of its own, it only routes to strip_action(),
# finalize_comment_action(), or redline_finalize_action() based on `mode`
# and the runtime type of `item_attrs`. See module docstring for why this
# preserves every existing safety invariant unchanged.
# ===========================================================================

def mode_action(item_attrs, mode: str, *, scope: Optional[str] = None) -> StripDecision:
    """Decide the action for one item (a CommentAttrs or a RedlineAttrs)
    under one of the skill's two named workflow modes.

    item_attrs: a CommentAttrs (for a comment, or for a redline's own
        audience-appropriateness under Return to Supplier -- set its
        item_kind to ITEM_KIND_REDLINE for correct phrasing) or a
        RedlineAttrs (for a redline's accept-into-body decision under
        Finalize for Signature -- the only case this field is meaningful).
    mode: MODE_RETURN_TO_SUPPLIER or MODE_FINALIZE_FOR_SIGNATURE.
    scope: required only when mode is MODE_FINALIZE_FOR_SIGNATURE and
        item_attrs is a RedlineAttrs (SKILL.md Finalize Step 2's three-way
        scope choice). Ignored otherwise: comments have no scope concept,
        and Return to Supplier never bakes changes into the body, so scope
        does not apply there.

    Returns a StripDecision whose action is one of KEEP, STRIP, REDACT (an
    auto-appliable CLEAR action for the caller's mode) or REVIEW (route to
    the interactive per-item walk-through; see SKILL.md's "Interactive
    Walk-Through for REVIEW Items").
    """
    mode_key = _normalize(mode)

    if mode_key not in KNOWN_MODES:
        return _decision(
            ACTION_REVIEW,
            f"Mode {mode!r} is not one of the two modes this skill defines "
            "(Return to Supplier / Finalize for Signature). Refusing to "
            "guess which workflow applies.",
            "SKILL.md, Mode Selection: exactly two named modes are "
            "defined for this decision.",
            missing_input=(
                "a mode value that is one of RETURN_TO_SUPPLIER / "
                "FINALIZE_FOR_SIGNATURE"
            ),
        )

    is_redline = isinstance(item_attrs, RedlineAttrs)

    if mode_key == MODE_RETURN_TO_SUPPLIER:
        if is_redline:
            # RedlineAttrs (status/scope) models the FINALIZE accept-into-
            # body question, which Return to Supplier never asks (it never
            # touches body text -- SKILL.md, Mode Selection). A caller that
            # passes a RedlineAttrs here has modeled the wrong question for
            # this mode; refuse rather than silently reinterpret it.
            return _decision(
                ACTION_REVIEW,
                "Return to Supplier never accepts tracked changes into the "
                "body (it only strips audience-inappropriate comments and "
                "commentary); a RedlineAttrs (accept-into-body status) is "
                "not a question this mode answers. Model this redline's "
                "own audience-appropriateness as a CommentAttrs instead "
                "(item_kind=ITEM_KIND_REDLINE), or resolve it by hand.",
                "SKILL.md, Mode Selection: routine cleanup 'never touches "
                "contract/document body text.'",
                missing_input=(
                    "a CommentAttrs-shaped classification for this "
                    "redline's audience-appropriateness, not a RedlineAttrs"
                ),
            )
        return strip_action(item_attrs, AUDIENCE_SUPPLIER)

    # mode_key == MODE_FINALIZE_FOR_SIGNATURE
    if is_redline:
        return redline_finalize_action(item_attrs, scope)
    return finalize_comment_action(item_attrs)


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
    print("v1.1.0: MODE_RETURN_TO_SUPPLIER TESTS (mode_action dispatcher)")
    print("=" * 78)

    # --- Mode 1: Return to Supplier matches strip_action(AUDIENCE_SUPPLIER)
    # exactly, for a comment -- backward-compatible reuse, not a re-derivation.
    for cls, expected in (
        (CLASS_SUPPLIER_FACING, ACTION_KEEP),
        (CLASS_INTERNAL_ONLY, ACTION_STRIP),
        (CLASS_SME_ESCALATION, ACTION_STRIP),
        (CLASS_HARD_STOP, ACTION_KEEP),
    ):
        d = mode_action(CommentAttrs(cls), MODE_RETURN_TO_SUPPLIER)
        check(
            f"mode_action(RETURN_TO_SUPPLIER) comment {cls} -> {expected} "
            "(same as strip_action(AUDIENCE_SUPPLIER))",
            d.action == expected,
            f"got {d.action}",
        )

    # --- Mode 2: Return to Supplier strips an internal-only REDLINE the same
    # way it strips an internal-only comment (item_kind is phrasing-only).
    d15 = mode_action(
        CommentAttrs(CLASS_INTERNAL_ONLY, item_kind=ITEM_KIND_REDLINE),
        MODE_RETURN_TO_SUPPLIER,
    )
    check(
        "mode_action(RETURN_TO_SUPPLIER) internal-only REDLINE (via "
        "CommentAttrs item_kind=ITEM_KIND_REDLINE) -> STRIP, same rule as "
        "an internal-only comment",
        d15.action == ACTION_STRIP,
        f"got {d15.action}",
    )

    # --- Mode 3: passing a RedlineAttrs (the wrong shape) under Return to
    # Supplier is refused, never silently reinterpreted or auto-accepted. ---
    d16 = mode_action(
        RedlineAttrs(REDLINE_STATUS_AGREED_BOTH_SIDES), MODE_RETURN_TO_SUPPLIER
    )
    check(
        "mode_action(RETURN_TO_SUPPLIER, RedlineAttrs) -> REVIEW (wrong "
        "question for this mode; refuses rather than silently accepting "
        "into the body)",
        d16.action == ACTION_REVIEW and d16.needs_review is True,
        f"action={d16.action}, needs_review={d16.needs_review}",
    )

    # --- Mode 4: unrecognized mode string -> REVIEW, never a guessed action.
    d17 = mode_action(CommentAttrs(CLASS_SUPPLIER_FACING), "SOME_MADE_UP_MODE")
    check(
        "mode_action(mode='SOME_MADE_UP_MODE') -> REVIEW "
        "(not one of the two defined modes)",
        d17.action == ACTION_REVIEW and d17.needs_review is True,
        f"action={d17.action}, needs_review={d17.needs_review}",
    )

    print()
    print("=" * 78)
    print("v1.1.0: MODE_FINALIZE_FOR_SIGNATURE TESTS -- COMMENTS")
    print("=" * 78)

    # --- Finalize 1: internal-only and SME comments always STRIP -----------
    d18 = mode_action(CommentAttrs(CLASS_INTERNAL_ONLY), MODE_FINALIZE_FOR_SIGNATURE)
    check(
        "mode_action(FINALIZE_FOR_SIGNATURE) INTERNAL_ONLY comment -> STRIP "
        "(\"Strip all internal-only and SME comments\")",
        d18.action == ACTION_STRIP,
        f"got {d18.action}",
    )
    d19 = mode_action(CommentAttrs(CLASS_SME_ESCALATION), MODE_FINALIZE_FOR_SIGNATURE)
    check(
        "mode_action(FINALIZE_FOR_SIGNATURE) SME_ESCALATION comment -> STRIP",
        d19.action == ACTION_STRIP,
        f"got {d19.action}",
    )

    # --- Finalize 2: Hard Stop is still an absolute floor -> KEEP ----------
    d20 = mode_action(CommentAttrs(CLASS_HARD_STOP), MODE_FINALIZE_FOR_SIGNATURE)
    check(
        "mode_action(FINALIZE_FOR_SIGNATURE) HARD_STOP comment -> KEEP "
        "(absolute floor, unchanged by mode)",
        d20.action == ACTION_KEEP and not d20.needs_review,
        f"got {d20.action}",
    )

    # --- Finalize 3: THE key behavior difference from Return to Supplier --
    # a supplier-facing comment is KEEP under Return to Supplier but REVIEW
    # under Finalize, because SKILL.md never states an unconditional keep
    # for the signature-bound copy (Step 4's wording is user-dependent).
    d21_a = mode_action(CommentAttrs(CLASS_SUPPLIER_FACING), MODE_RETURN_TO_SUPPLIER)
    d21_b = mode_action(CommentAttrs(CLASS_SUPPLIER_FACING), MODE_FINALIZE_FOR_SIGNATURE)
    check(
        "SUPPLIER_FACING comment: KEEP under Return to Supplier ...",
        d21_a.action == ACTION_KEEP,
        f"got {d21_a.action}",
    )
    check(
        "... but REVIEW under Finalize for Signature (not an unconditional "
        "keep for the signed copy -- SKILL.md Step 4 is user-dependent, not "
        "unconditional like Optional Inputs #2's 'Sending to supplier')",
        d21_b.action == ACTION_REVIEW and d21_b.needs_review is True,
        f"action={d21_b.action}, needs_review={d21_b.needs_review}",
    )

    # --- Finalize 4: unclassified content-inference still applies ----------
    d22 = mode_action(
        CommentAttrs(CLASS_UNCLASSIFIED, content_leak_signal=True),
        MODE_FINALIZE_FOR_SIGNATURE,
    )
    check(
        "mode_action(FINALIZE_FOR_SIGNATURE) UNCLASSIFIED + "
        "content_leak_signal=True -> STRIP (treated as internal-equivalent)",
        d22.action == ACTION_STRIP,
        f"got {d22.action}",
    )
    d23 = mode_action(
        CommentAttrs(CLASS_UNCLASSIFIED, content_leak_signal=None),
        MODE_FINALIZE_FOR_SIGNATURE,
    )
    check(
        "mode_action(FINALIZE_FOR_SIGNATURE) UNCLASSIFIED + no signal -> "
        "REVIEW (still refuses to guess, regardless of mode)",
        d23.action == ACTION_REVIEW,
        f"got {d23.action}",
    )

    # --- Finalize 5: unrecognized classification -> REVIEW -----------------
    d24 = mode_action(CommentAttrs("MADE_UP"), MODE_FINALIZE_FOR_SIGNATURE)
    check(
        "mode_action(FINALIZE_FOR_SIGNATURE) unrecognized classification "
        "-> REVIEW",
        d24.action == ACTION_REVIEW,
        f"got {d24.action}",
    )

    print()
    print("=" * 78)
    print("v1.1.0: MODE_FINALIZE_FOR_SIGNATURE TESTS -- REDLINES")
    print("=" * 78)

    # --- Finalize redline matrix: the 3 unconditional cells + the 6 REVIEW
    # cells that SKILL.md's Step 2/3 do not resolve unconditionally. --------
    redline_matrix_cases = [
        (SCOPE_ALL_AGREED, REDLINE_STATUS_AGREED_BOTH_SIDES, ACTION_REDACT),
        (SCOPE_ALL_AGREED, REDLINE_STATUS_LILLY_ACCEPTED_ONLY, ACTION_REVIEW),
        (SCOPE_ALL_AGREED, REDLINE_STATUS_OPEN_DISPUTED, ACTION_REVIEW),
        (SCOPE_LILLY_ACCEPTED_ONLY, REDLINE_STATUS_AGREED_BOTH_SIDES, ACTION_REDACT),
        (SCOPE_LILLY_ACCEPTED_ONLY, REDLINE_STATUS_LILLY_ACCEPTED_ONLY, ACTION_REDACT),
        (SCOPE_LILLY_ACCEPTED_ONLY, REDLINE_STATUS_OPEN_DISPUTED, ACTION_REVIEW),
        (SCOPE_WALK_THROUGH_EACH, REDLINE_STATUS_AGREED_BOTH_SIDES, ACTION_REVIEW),
        (SCOPE_WALK_THROUGH_EACH, REDLINE_STATUS_LILLY_ACCEPTED_ONLY, ACTION_REVIEW),
        (SCOPE_WALK_THROUGH_EACH, REDLINE_STATUS_OPEN_DISPUTED, ACTION_REVIEW),
    ]
    redline_matrix_ok = True
    for scope, status, expected in redline_matrix_cases:
        d = mode_action(RedlineAttrs(status), MODE_FINALIZE_FOR_SIGNATURE, scope=scope)
        if d.action != expected:
            redline_matrix_ok = False
            print(f"      MISMATCH scope={scope} status={status} expected={expected} got={d.action}")
    check(
        "Redline scope x status matrix: all 9 combinations resolve exactly "
        "as SKILL.md Step 2/3 state or refuse to guess (3 REDACT, 6 REVIEW)",
        redline_matrix_ok,
        "",
    )

    # --- Redline: unresolved Hard Stop linkage is an absolute floor --------
    for scope in (SCOPE_ALL_AGREED, SCOPE_LILLY_ACCEPTED_ONLY, SCOPE_WALK_THROUGH_EACH):
        d = mode_action(
            RedlineAttrs(REDLINE_STATUS_AGREED_BOTH_SIDES, linked_hard_stop=True),
            MODE_FINALIZE_FOR_SIGNATURE,
            scope=scope,
        )
        check(
            f"Redline linked to unresolved Hard Stop + scope={scope} -> "
            "REVIEW always, even when status alone would REDACT",
            d.action == ACTION_REVIEW and d.needs_review is True,
            f"got {d.action}",
        )

    # --- Redline: unrecognized scope / status -> REVIEW ---------------------
    d25 = mode_action(
        RedlineAttrs(REDLINE_STATUS_AGREED_BOTH_SIDES),
        MODE_FINALIZE_FOR_SIGNATURE,
        scope="NOT_A_REAL_SCOPE",
    )
    check(
        "Redline + unrecognized scope -> REVIEW",
        d25.action == ACTION_REVIEW,
        f"got {d25.action}",
    )
    d26 = mode_action(
        RedlineAttrs("NOT_A_REAL_STATUS"),
        MODE_FINALIZE_FOR_SIGNATURE,
        scope=SCOPE_ALL_AGREED,
    )
    check(
        "Redline + unrecognized status -> REVIEW",
        d26.action == ACTION_REVIEW,
        f"got {d26.action}",
    )
    d27 = mode_action(
        RedlineAttrs(REDLINE_STATUS_AGREED_BOTH_SIDES),
        MODE_FINALIZE_FOR_SIGNATURE,
        scope=None,
    )
    check(
        "Redline + scope=None (not supplied) -> REVIEW, never a guessed "
        "REDACT just because status alone looks agreed",
        d27.action == ACTION_REVIEW,
        f"got {d27.action}",
    )

    print()
    print("=" * 78)
    print("v1.1.0: SAFETY-INVARIANT + EXHAUSTIVE SWEEP (both modes)")
    print("=" * 78)

    # --- Safety invariant, both modes: INTERNAL_ONLY / SME_ESCALATION never
    # resolve KEEP, and REDACT is never returned for a comment. -------------
    never_keep_ok = True
    never_redact_for_comment_ok = True
    for mode in (MODE_RETURN_TO_SUPPLIER, MODE_FINALIZE_FOR_SIGNATURE):
        for cls in (CLASS_INTERNAL_ONLY, CLASS_SME_ESCALATION):
            d = mode_action(CommentAttrs(cls), mode)
            if d.action == ACTION_KEEP:
                never_keep_ok = False
        for cls in (CLASS_SUPPLIER_FACING, CLASS_INTERNAL_ONLY, CLASS_SME_ESCALATION,
                    CLASS_HARD_STOP, CLASS_UNCLASSIFIED):
            d = mode_action(CommentAttrs(cls, content_leak_signal=True), mode)
            if d.action == ACTION_REDACT:
                never_redact_for_comment_ok = False
    check(
        "SAFETY-CRITICAL: INTERNAL_ONLY / SME_ESCALATION comments never "
        "resolve KEEP, under either mode",
        never_keep_ok,
        "",
    )
    check(
        "SAFETY-CRITICAL: a comment never resolves to REDACT (REDACT is "
        "redline-only), under either mode",
        never_redact_for_comment_ok,
        "",
    )

    # --- Safety invariant: a redline never resolves KEEP or STRIP (those
    # are comment-only actions in this design). -----------------------------
    redline_never_keep_or_strip_ok = True
    for status in (REDLINE_STATUS_AGREED_BOTH_SIDES, REDLINE_STATUS_LILLY_ACCEPTED_ONLY,
                   REDLINE_STATUS_OPEN_DISPUTED, "GARBAGE_STATUS"):
        for scope in (SCOPE_ALL_AGREED, SCOPE_LILLY_ACCEPTED_ONLY,
                      SCOPE_WALK_THROUGH_EACH, "GARBAGE_SCOPE", None):
            for linked in (True, False):
                d = mode_action(
                    RedlineAttrs(status, linked_hard_stop=linked),
                    MODE_FINALIZE_FOR_SIGNATURE,
                    scope=scope,
                )
                if d.action in (ACTION_KEEP, ACTION_STRIP):
                    redline_never_keep_or_strip_ok = False
    check(
        "SAFETY-CRITICAL: a redline under Finalize never resolves to KEEP "
        "or STRIP (only REDACT or REVIEW)",
        redline_never_keep_or_strip_ok,
        "",
    )

    # --- Exhaustive sweep: every mode_action() output is a known action, for
    # both item kinds, across every mode/scope/status/classification combo.
    mode_sweep_ok = True
    for mode in (MODE_RETURN_TO_SUPPLIER, MODE_FINALIZE_FOR_SIGNATURE, "GARBAGE_MODE"):
        for cls in (CLASS_SUPPLIER_FACING, CLASS_INTERNAL_ONLY, CLASS_SME_ESCALATION,
                    CLASS_HARD_STOP, CLASS_UNCLASSIFIED, "GARBAGE"):
            for leak in (True, False, None):
                d = mode_action(CommentAttrs(cls, content_leak_signal=leak), mode)
                if d.action not in KNOWN_ACTIONS:
                    mode_sweep_ok = False
        for status in (REDLINE_STATUS_AGREED_BOTH_SIDES, REDLINE_STATUS_LILLY_ACCEPTED_ONLY,
                       REDLINE_STATUS_OPEN_DISPUTED, "GARBAGE_STATUS"):
            for scope in (SCOPE_ALL_AGREED, SCOPE_LILLY_ACCEPTED_ONLY,
                          SCOPE_WALK_THROUGH_EACH, "GARBAGE_SCOPE", None):
                d = mode_action(RedlineAttrs(status), mode, scope=scope)
                if d.action not in KNOWN_ACTIONS:
                    mode_sweep_ok = False
    check(
        "Exhaustive sweep: every mode_action() combination (mode x item "
        "kind x classification/status x scope) returns one of "
        "KEEP/STRIP/REDACT/REVIEW, nothing else",
        mode_sweep_ok,
        "",
    )

    print()
    print("=" * 78)
    print(f"SUMMARY: {passed}/{passed + failed} passed")
    if failed:
        print(f"FAILED: {failed}/{passed + failed}")
        raise SystemExit(1)
