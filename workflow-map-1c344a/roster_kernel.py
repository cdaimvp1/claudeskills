"""
roster_kernel.py
Lilly Procurement Skills - Workflow Map Participant-Classification Kernel

Stdlib-only Python module implementing the stakeholder-roster PARTICIPANT
CLASSIFICATION decision that workflow-map-1c344a/SKILL.md specifies in prose
(Skill Version 1.3, July 2026, "### Step 3: Stakeholder roster"). This is a
NON-NUMERIC decision kernel: it does not compute anything, it deterministically
LABELS each already-harvested participant by email domain, so that labeling is
never made ad hoc by model judgment at generation time.

REPLACES the prior v1.2 design (kept in version control history, not below).
The old design chose which of four RANKED STATE-FILE SOURCES (field_guide_state
Issue-scoped, field_guide_state project-scoped, legacy daily_digest_state,
rfp-case-manager case file) "won" as the roster. That source-cascade is gone.
Per Marc's design, the roster is now built from the ACTUAL PARTICIPANTS found
on related emails, Teams chats, and calendar invites, plus Claude Project
members/invitees (SKILL.md Step 3a documents that harvest; it is this skill's
own M365 data-gathering, not this kernel's job). This kernel's job starts once
that harvest exists: given the supplier's domain(s), classify every harvested
participant by email domain, and split out the participants that need a human
look before the roster is trusted.

DIVISION OF LABOR (per Marc):
  - The calling skill harvests participants (SKILL.md Step 3a: M365 comms/
    calendar + Claude Project members/invitees) and marks, for each one,
    whether it was seen in a supplier-side context. This kernel does no I/O,
    no network calls, and no text/harvesting of its own.
  - This kernel (classify_roster) deterministically labels each participant
    and separates out the labels that need attention (flags) from the ones
    that could not be labeled at all (needs_review). It performs no removal
    and no approval.
  - The user removes anyone who should not be on the roster (SKILL.md Step
    3c). This kernel never removes a participant itself; it only labels and
    surfaces, so the human decision is always visible and always made by a
    human, never silently resolved by this kernel or by model prose.

SAFETY JOB (the reason this kernel exists): never silently include an
unexpected external party. A participant whose domain matches neither
lilly.com nor a declared supplier domain is ALWAYS labeled
FLAG_UNEXPECTED_EXTERNAL and ALWAYS appears in the returned `flags` list -
there is no code path in classify_roster() that can fold that label into
INTERNAL or EXPECTED_SUPPLIER, and no code path that can produce that label
without it also landing in `flags`. See the self-test's "SAFETY-CRITICAL"
section for a sweep that checks this holds across many inputs, and the
"Kernel Wiring" section of SKILL.md for how the calling skill is required to
surface `flags` before trusting the roster.

Per the suite's "refuse rather than guess" rule (the same principle
numeric_kernel.py documents for arithmetic, and the prior version of this
kernel documented for source selection): a participant with no usable email
address is not guessed into INTERNAL or EXPECTED_SUPPLIER or dropped - it is
labeled REVIEW and returned in `needs_review`, per the design's own "no /
unknown email -> REVIEW" outcome.

Classification rules (verbatim from Marc's design, given the SUPPLIER's
domain(s)):
  1. lilly.com domain -> INTERNAL (Lilly).
  2. domain matches the supplier domain -> EXPECTED_SUPPLIER.
  3. a different external domain -> FLAG_UNEXPECTED_EXTERNAL (why is this
     third party here).
  4. a lilly.com address appearing within the supplier participant set / a
     supplier context -> FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT (suppliers
     sometimes use Lilly emails).
  5. no / unknown email -> REVIEW.

Two modeling decisions this kernel makes that are NOT directly quoted in the
one-line rules above, flagged explicitly (per this suite's convention of
naming inferences rather than letting them pass as quoted rules):
  - SUBDOMAIN MATCHING. "lilly.com domain" and "the supplier domain" are
    matched as an exact match OR a proper subdomain (e.g. "eu.lilly.com"
    counts as lilly.com; "it.acme.com" counts as a declared supplier domain
    "acme.com"). This is a boundary-safe suffix check (requires the preceding
    character to be a literal ".", so "notlilly.com" does NOT match
    "lilly.com"). Judgment call: real Lilly and supplier mail commonly comes
    from regional/functional subdomains; treating a subdomain as "a different
    domain" would misfire FLAG_UNEXPECTED_EXTERNAL on legitimate internal or
    supplier mail, which would erode trust in the flag and encourage users to
    ignore it.
  - MULTIPLE SUPPLIER DOMAINS. `supplier_domains` accepts one string or a
    collection of strings, because a single supplier engagement can
    legitimately span more than one domain (regional entities, recently
    acquired subsidiaries). This does not add a new classification category;
    it only lets "the supplier's domain" be one-or-many when the caller has
    more than one to declare.

Refusals (malformed CALLS, not data-availability questions - see KernelError
subclasses below): participants not a list of Participant instances;
supplier_domains empty, non-string, or overlapping with lilly.com's own
domain family (ambiguous configuration - refusing to guess whether INTERNAL
or EXPECTED_SUPPLIER should win); context provided but not a dict. A run with
zero participants, or with every participant landing in REVIEW, is NOT a
refusal-by-exception - it is the documented REVIEW/empty-roster outcome.

See MAINTENANCE.md conventions in lilly-procurement-kernels-1c344a/ for the
suite's shared kernel-authoring style; this module mirrors numeric_kernel.py's
and audience_kernel.py's module-docstring / exception / self-test conventions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence, Union

SOURCE_VERSION = "workflow-map-1c344a SKILL.md, Skill Version 1.3 (July 2026), Step 3"

LILLY_DOMAIN = "lilly.com"

# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class KernelError(Exception):
    """Base class for every refusal raised by this kernel.

    Reserved for malformed CALLS (wrong input shape) - a programming error by
    the caller, not a data-availability question. A run with zero usable
    participants, or a roster that is entirely REVIEW, is NOT an error: see
    the module docstring.
    """


class InvalidParticipantsError(KernelError):
    """Raised when classify_roster() is not given a list/tuple of Participant
    instances. Refuses rather than guessing what shape an ad hoc dict/object
    is meant to represent.
    """


class InvalidSupplierDomainError(KernelError):
    """Raised when supplier_domains is missing, empty, contains a non-string,
    contains an unusable domain (no '.'), or overlaps with lilly.com's own
    domain family. The last case is refused rather than resolved by picking
    which rule (INTERNAL vs EXPECTED_SUPPLIER) should win for a domain that
    is claimed as both Lilly's and the supplier's - that conflict is a data
    error upstream, not a classification decision this kernel should invent.
    """


class InvalidContextError(KernelError):
    """Raised when `context` is provided but is not a dict (or None)."""


# ---------------------------------------------------------------------------
# Label constants (the five outcomes named in Marc's design; do not add,
# rename, or re-scope any of these)
# ---------------------------------------------------------------------------

LABEL_INTERNAL = "INTERNAL"
LABEL_EXPECTED_SUPPLIER = "EXPECTED_SUPPLIER"
LABEL_FLAG_UNEXPECTED_EXTERNAL = "FLAG_UNEXPECTED_EXTERNAL"
LABEL_FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT = "FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT"
LABEL_REVIEW = "REVIEW"

ALL_LABELS = (
    LABEL_INTERNAL,
    LABEL_EXPECTED_SUPPLIER,
    LABEL_FLAG_UNEXPECTED_EXTERNAL,
    LABEL_FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT,
    LABEL_REVIEW,
)

# The two labels that are "flags" in Marc's own naming (FLAG_ prefix): a
# participant whose presence needs a human look before the roster is trusted.
# REVIEW is a distinct concept (unclassifiable, not necessarily suspicious)
# and is returned separately as `needs_review`, never mixed into `flags`.
FLAG_LABELS = frozenset({
    LABEL_FLAG_UNEXPECTED_EXTERNAL,
    LABEL_FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT,
})


# ---------------------------------------------------------------------------
# Input shape
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Participant:
    """One person harvested from related comms/calendar/Claude Project
    (SKILL.md Step 3a). The calling skill populates this; this kernel does no
    harvesting and no I/O.

    identifier: display name and/or raw string identifying this person.
        Required (never blank) so a REVIEW row is still human-readable even
        with no email. Use whatever the harvest surfaced (a display name, or
        the raw address if that is all there is).
    email: the email address as harvested, if any. None, empty, or
        whitespace-only counts as "no email" -> REVIEW, per Marc's design's
        "no / unknown email" outcome. A malformed string (no '@', more than
        one '@', an empty local or domain part, or a domain with no '.') also
        counts as unknown -> REVIEW; this kernel does not attempt to repair
        or guess a corrected address.
    in_supplier_context: True iff this participant was harvested from at
        least one source that is a SUPPLIER-SIDE context - an email thread,
        Teams chat, or calendar invite that is correspondence WITH the
        supplier (e.g. the supplier's own domain appears among the other
        participants or the organizer of that same item) - rather than
        purely-internal Lilly correspondence. This is what lets the kernel
        tell "an @lilly.com person on an ordinary internal thread" (INTERNAL,
        unremarkable) apart from "an @lilly.com address surfacing inside the
        supplier's own participant set" (FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT
        - suppliers sometimes provision people with lilly.com addresses, or a
        Lilly person ended up inside the supplier-side roster; either way,
        worth a human look). Populated by the calling skill's harvest step,
        never guessed by this kernel. Defaults to False (ordinary internal
        participant) when the harvest did not surface a supplier-side item
        for this person.
    sources: optional free-form provenance tuple (e.g. "email:thread-142",
        "teams:chat-88", "calendar:invite-9", "claude_project:member") for
        the audit trace. Never inspected for classification, only echoed
        back for traceability.
    """

    identifier: str
    email: Optional[str] = None
    in_supplier_context: bool = False
    sources: tuple = ()


# ---------------------------------------------------------------------------
# Output shape
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ClassifiedParticipant:
    """One participant after classification.

    label: one of ALL_LABELS.
    domain: the lower-cased domain extracted from `email`, or None when the
        participant landed in REVIEW because no usable email was found.
    reason: human-readable explanation, always citing which rule produced
        this label, so the decision is auditable per-participant.
    needs_review: True iff label == LABEL_REVIEW (duplicated as its own
        boolean, matching this suite's Decision.needs_review convention, so
        callers can branch on it without a string comparison).
    """

    identifier: str
    email: Optional[str]
    domain: Optional[str]
    label: str
    reason: str
    needs_review: bool
    sources: tuple = ()


@dataclass
class RosterClassification:
    """Kernel output: the classified roster plus the flags.

    classified: every harvested participant, labeled, in the same order they
        were passed in (deterministic; never re-sorted by label, name, or
        anything else this kernel was not asked to sort by).
    flags: the subset of `classified` whose label is in FLAG_LABELS
        (FLAG_UNEXPECTED_EXTERNAL or FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT) -
        exactly the participants Marc's design says need a human look before
        the roster is trusted. Never includes REVIEW entries (see
        `needs_review` below) and never omits a FLAG_* entry (see the
        module's SAFETY JOB note).
    needs_review: the subset of `classified` whose label is LABEL_REVIEW (no
        usable email - unclassifiable, not necessarily suspicious).
    counts: label -> count, for all five ALL_LABELS (present even when a
        label's count is 0), so a caller can render a one-line summary
        without recomputing it from `classified`.
    trace: ordered, human-readable audit trail - one header line plus one
        line per participant, so every label is traceable end to end.
    source_version: which SKILL.md version/section this classification
        traces to.
    """

    classified: List[ClassifiedParticipant]
    flags: List[ClassifiedParticipant]
    needs_review: List[ClassifiedParticipant]
    counts: Dict[str, int]
    trace: List[str] = field(default_factory=list)
    source_version: str = SOURCE_VERSION


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _normalize_domain_string(value: Any) -> Optional[str]:
    """Lower-case, whitespace-trimmed, leading-'@'-tolerant normalization of
    a single domain-like string. Returns None if `value` is not a usable
    string (not a str, or empty/whitespace after trimming). Pure string
    hygiene - never maps one domain onto a different one.
    """
    if not isinstance(value, str):
        return None
    v = value.strip().lower()
    if v.startswith("@"):
        v = v[1:]
    return v or None


def _domain_matches(domain: str, base: str) -> bool:
    """True iff `domain` IS `base`, or is a proper subdomain of `base`
    (boundary-safe: requires a literal '.' immediately before `base`, so
    "notlilly.com" does not match base "lilly.com"). See module docstring,
    "SUBDOMAIN MATCHING" for why this is applied instead of exact-match only.
    """
    return domain == base or domain.endswith("." + base)


def _extract_email_domain(email: Optional[str]) -> Optional[str]:
    """Extract a usable, lower-cased domain from a harvested email address.

    Returns None (meaning "no usable email" -> REVIEW) when `email` is not a
    string, is blank, contains zero or more than one '@', has an empty local
    or domain part, or has a domain with no '.'. This kernel does not attempt
    to repair or guess a corrected address; it only recognizes a minimally
    well-formed one.
    """
    if not isinstance(email, str):
        return None
    trimmed = email.strip()
    if not trimmed or "@" not in trimmed:
        return None
    parts = trimmed.split("@")
    if len(parts) != 2:
        return None  # more than one '@' - malformed, refuse to guess
    local, domain = parts
    local = local.strip()
    domain = domain.strip().lower()
    if not local or not domain or "." not in domain:
        return None
    return domain


def _normalize_supplier_domains(
    supplier_domains: Union[str, Sequence[str]],
) -> tuple:
    """Validate and normalize `supplier_domains` into a non-empty tuple of
    lower-cased domain strings. Raises InvalidSupplierDomainError for every
    malformed-call case documented in that exception's docstring.
    """
    if isinstance(supplier_domains, str):
        raw_list = [supplier_domains]
    elif isinstance(supplier_domains, (list, tuple, set, frozenset)):
        raw_list = list(supplier_domains)
    else:
        raise InvalidSupplierDomainError(
            "supplier_domains must be a string or a list/tuple/set of "
            f"strings, got {type(supplier_domains).__name__}. Refusing to "
            "guess what shape an ad hoc object is meant to represent."
        )

    normalized: List[str] = []
    for d in raw_list:
        if not isinstance(d, str):
            raise InvalidSupplierDomainError(
                f"Every supplier domain must be a string, got "
                f"{type(d).__name__}: {d!r}."
            )
        nd = _normalize_domain_string(d)
        if not nd or "." not in nd:
            raise InvalidSupplierDomainError(
                f"supplier domain {d!r} is not a usable domain (empty, "
                "whitespace-only, or missing a '.')."
            )
        normalized.append(nd)

    if not normalized:
        raise InvalidSupplierDomainError(
            "supplier_domains must name at least one domain; refusing to "
            "classify EXPECTED_SUPPLIER vs FLAG_UNEXPECTED_EXTERNAL with no "
            "supplier domain to compare against."
        )

    for nd in normalized:
        if _domain_matches(nd, LILLY_DOMAIN) or _domain_matches(LILLY_DOMAIN, nd):
            raise InvalidSupplierDomainError(
                f"supplier domain {nd!r} overlaps with Lilly's own domain "
                f"({LILLY_DOMAIN}) - this is an ambiguous/likely-erroneous "
                "configuration; refusing to guess whether INTERNAL or "
                "EXPECTED_SUPPLIER should win for it."
            )

    return tuple(normalized)


def _classify_one(participant: Participant, supplier_domains: tuple) -> ClassifiedParticipant:
    """Classify a single Participant. Pure function: deterministic, no I/O."""
    domain = _extract_email_domain(participant.email)

    if domain is None:
        label = LABEL_REVIEW
        reason = (
            "No usable email address (missing, blank, or malformed - e.g. "
            "no '@', more than one '@', or no '.' in the domain part) - "
            "cannot classify by domain. Per the design's 'no / unknown "
            "email' outcome: REVIEW, never a guessed classification."
        )
    elif _domain_matches(domain, LILLY_DOMAIN):
        if participant.in_supplier_context:
            label = LABEL_FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT
            reason = (
                f"Domain '{domain}' is within {LILLY_DOMAIN}, but this "
                "participant was harvested from a supplier-side context "
                "(in_supplier_context=True). Suppliers sometimes provision "
                "people with lilly.com addresses (or a Lilly person ended "
                "up inside the supplier's own participant set) - flagged "
                "for a human look, never silently folded into INTERNAL."
            )
        else:
            label = LABEL_INTERNAL
            reason = (
                f"Domain '{domain}' is within {LILLY_DOMAIN} and was not "
                "seen in a supplier-side context -> INTERNAL (Lilly)."
            )
    elif any(_domain_matches(domain, sd) for sd in supplier_domains):
        label = LABEL_EXPECTED_SUPPLIER
        reason = (
            f"Domain '{domain}' matches a declared supplier domain "
            f"({', '.join(supplier_domains)}) -> EXPECTED_SUPPLIER."
        )
    else:
        label = LABEL_FLAG_UNEXPECTED_EXTERNAL
        reason = (
            f"Domain '{domain}' is external and matches neither "
            f"{LILLY_DOMAIN} nor the declared supplier domain(s) "
            f"({', '.join(supplier_domains)}) -> FLAG_UNEXPECTED_EXTERNAL. "
            "Why is this third party here? Never silently included in the "
            "confirmed roster."
        )

    return ClassifiedParticipant(
        identifier=participant.identifier,
        email=participant.email,
        domain=domain,
        label=label,
        reason=reason,
        needs_review=(label == LABEL_REVIEW),
        sources=tuple(participant.sources),
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def classify_roster(
    participants: Sequence[Participant],
    supplier_domains: Union[str, Sequence[str]],
    context: Optional[dict] = None,
) -> RosterClassification:
    """Classify every harvested participant and split out the flags.

    Deterministic, pure function: no I/O, no network, no randomness. Given
    the same participants and supplier_domains, always returns the same
    RosterClassification, in the same participant order.

    Args:
        participants: a list/tuple of Participant instances, already
            harvested by the calling skill (SKILL.md Step 3a). May be empty
            (an empty harvest is not a malformed call; it yields an empty
            RosterClassification).
        supplier_domains: the supplier's domain, or a collection of the
            supplier's domains (see module docstring, "MULTIPLE SUPPLIER
            DOMAINS"). Must name at least one usable domain and must not
            overlap with lilly.com's own domain family.
        context: optional dict for readable output only (e.g.
            {"supplier_name": "Acme Corp"}). Never consulted by the
            classification rule itself - purely cosmetic annotation on the
            trace. Pass None (default) when there is nothing to annotate.

    Raises:
        InvalidParticipantsError: `participants` is not a list/tuple, or
            contains an item that is not a Participant instance.
        InvalidSupplierDomainError: `supplier_domains` is missing, empty,
            contains a non-string or unusable domain, or overlaps with
            lilly.com's own domain family.
        InvalidContextError: `context` is provided but is not a dict.
    """
    if not isinstance(participants, (list, tuple)):
        raise InvalidParticipantsError(
            "participants must be a list or tuple of Participant instances, "
            f"got {type(participants).__name__}. Refusing to guess what "
            "shape an ad hoc object is meant to represent."
        )
    for i, p in enumerate(participants):
        if not isinstance(p, Participant):
            raise InvalidParticipantsError(
                f"participants[{i}] is not a Participant instance (got "
                f"{type(p).__name__}). Refusing to guess its shape."
            )

    if context is not None and not isinstance(context, dict):
        raise InvalidContextError(
            f"context must be a dict or None, got {type(context).__name__}."
        )
    supplier_name = context.get("supplier_name") if isinstance(context, dict) else None

    normalized_supplier_domains = _normalize_supplier_domains(supplier_domains)

    trace: List[str] = [
        f"Supplier domain(s): {', '.join(normalized_supplier_domains)}"
        + (f" (supplier: {supplier_name})" if supplier_name else "")
        + f". Lilly domain: {LILLY_DOMAIN}. Participants to classify: "
        f"{len(participants)}."
    ]

    classified: List[ClassifiedParticipant] = []
    for p in participants:
        cp = _classify_one(p, normalized_supplier_domains)
        classified.append(cp)
        trace.append(f"{p.identifier} <{p.email or 'no email'}>: {cp.label} - {cp.reason}")

    flags = [c for c in classified if c.label in FLAG_LABELS]
    needs_review = [c for c in classified if c.label == LABEL_REVIEW]
    counts = {label: 0 for label in ALL_LABELS}
    for c in classified:
        counts[c.label] += 1

    return RosterClassification(
        classified=classified,
        flags=flags,
        needs_review=needs_review,
        counts=counts,
        trace=trace,
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
    print("GOLDEN CASES (each of Marc's five classification outcomes)")
    print("=" * 78)

    SUPPLIER_DOMAINS = ("acme.com",)

    # --- Golden 1: INTERNAL -------------------------------------------------
    d1 = classify_roster(
        [Participant("A. Patel", "a.patel@lilly.com")],
        SUPPLIER_DOMAINS,
    )
    _check(
        "lilly.com domain, not in supplier context -> INTERNAL",
        d1.classified[0].label == LABEL_INTERNAL
        and d1.flags == [] and d1.needs_review == [],
        f"got label={d1.classified[0].label!r}",
    )

    # --- Golden 2: EXPECTED_SUPPLIER -----------------------------------------
    d2 = classify_roster(
        [Participant("J. Doe", "j.doe@acme.com")],
        SUPPLIER_DOMAINS,
    )
    _check(
        "domain matches supplier domain -> EXPECTED_SUPPLIER",
        d2.classified[0].label == LABEL_EXPECTED_SUPPLIER
        and d2.flags == [] and d2.needs_review == [],
        f"got label={d2.classified[0].label!r}",
    )

    # --- Golden 3: FLAG_UNEXPECTED_EXTERNAL ---------------------------------
    d3 = classify_roster(
        [Participant("X. Person", "x.person@randomvendor.com")],
        SUPPLIER_DOMAINS,
    )
    _check(
        "different external domain -> FLAG_UNEXPECTED_EXTERNAL, and present "
        "in `flags` (why is this third party here)",
        d3.classified[0].label == LABEL_FLAG_UNEXPECTED_EXTERNAL
        and d3.flags == [d3.classified[0]] and d3.needs_review == [],
        f"got label={d3.classified[0].label!r}, flags={d3.flags}",
    )

    # --- Golden 4: FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT ---------------------
    d4 = classify_roster(
        [Participant("C. Contractor", "c.contractor@lilly.com", in_supplier_context=True)],
        SUPPLIER_DOMAINS,
    )
    _check(
        "lilly.com address seen in a supplier-side context -> "
        "FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT, and present in `flags` "
        "(suppliers sometimes use Lilly emails)",
        d4.classified[0].label == LABEL_FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT
        and d4.flags == [d4.classified[0]] and d4.needs_review == [],
        f"got label={d4.classified[0].label!r}, flags={d4.flags}",
    )

    # --- Golden 5: REVIEW (no email) ----------------------------------------
    d5 = classify_roster(
        [Participant("Unknown Attendee", None)],
        SUPPLIER_DOMAINS,
    )
    _check(
        "no email -> REVIEW, present in `needs_review`, absent from `flags`",
        d5.classified[0].label == LABEL_REVIEW and d5.classified[0].needs_review is True
        and d5.needs_review == [d5.classified[0]] and d5.flags == [],
        f"got label={d5.classified[0].label!r}",
    )

    # --- Golden 5b: REVIEW (malformed email variants) -----------------------
    for bad_email, why in [
        ("", "blank string"),
        ("   ", "whitespace-only"),
        ("not-an-email", "no '@'"),
        ("a@b@c.com", "more than one '@'"),
        ("@lilly.com", "empty local part"),
        ("person@", "empty domain part"),
        ("person@nodot", "domain missing '.'"),
    ]:
        d = classify_roster([Participant("Bad Email Case", bad_email)], SUPPLIER_DOMAINS)
        _check(
            f"malformed email ({why}: {bad_email!r}) -> REVIEW",
            d.classified[0].label == LABEL_REVIEW,
            f"got label={d.classified[0].label!r}",
        )

    print()
    print("=" * 78)
    print("SUBDOMAIN AND MULTI-DOMAIN CASES (documented modeling decisions)")
    print("=" * 78)

    # --- Lilly subdomain -----------------------------------------------------
    d6 = classify_roster(
        [Participant("B. Chen", "b.chen@eu.lilly.com")],
        SUPPLIER_DOMAINS,
    )
    _check(
        "lilly.com SUBDOMAIN (eu.lilly.com) -> INTERNAL",
        d6.classified[0].label == LABEL_INTERNAL,
        f"got label={d6.classified[0].label!r}",
    )

    # --- Supplier subdomain ---------------------------------------------------
    d7 = classify_roster(
        [Participant("K. Wu", "k.wu@it.acme.com")],
        SUPPLIER_DOMAINS,
    )
    _check(
        "supplier domain SUBDOMAIN (it.acme.com under acme.com) -> "
        "EXPECTED_SUPPLIER",
        d7.classified[0].label == LABEL_EXPECTED_SUPPLIER,
        f"got label={d7.classified[0].label!r}",
    )

    # --- Lookalike domain must NOT match (boundary safety) --------------------
    d8 = classify_roster(
        [Participant("Lookalike", "person@notlilly.com")],
        SUPPLIER_DOMAINS,
    )
    _check(
        "lookalike domain 'notlilly.com' does NOT match 'lilly.com' "
        "(boundary-safe suffix check) -> FLAG_UNEXPECTED_EXTERNAL, not INTERNAL",
        d8.classified[0].label == LABEL_FLAG_UNEXPECTED_EXTERNAL,
        f"got label={d8.classified[0].label!r}",
    )

    # --- Multiple supplier domains (subsidiary) -------------------------------
    d9 = classify_roster(
        [Participant("M. Regional", "m@acme.co.uk")],
        ("acme.com", "acme.co.uk"),
    )
    _check(
        "second declared supplier domain (subsidiary) -> EXPECTED_SUPPLIER",
        d9.classified[0].label == LABEL_EXPECTED_SUPPLIER,
        f"got label={d9.classified[0].label!r}",
    )

    # --- Single string supplier_domains works the same as a 1-tuple ----------
    d10a = classify_roster([Participant("J", "j@acme.com")], "acme.com")
    d10b = classify_roster([Participant("J", "j@acme.com")], ("acme.com",))
    _check(
        "supplier_domains as a bare string behaves the same as a 1-tuple",
        d10a.classified[0].label == d10b.classified[0].label == LABEL_EXPECTED_SUPPLIER,
        f"got {d10a.classified[0].label!r} vs {d10b.classified[0].label!r}",
    )

    # --- Case-insensitivity ----------------------------------------------------
    d11 = classify_roster(
        [Participant("Upper", "PERSON@ACME.COM"), Participant("Upper2", "A.Patel@Lilly.COM")],
        SUPPLIER_DOMAINS,
    )
    _check(
        "domain comparison is case-insensitive",
        d11.classified[0].label == LABEL_EXPECTED_SUPPLIER
        and d11.classified[1].label == LABEL_INTERNAL,
        f"got {[c.label for c in d11.classified]}",
    )

    print()
    print("=" * 78)
    print("SAFETY-CRITICAL: never silently include an unexpected external party")
    print("=" * 78)

    # --- Sweep: assorted unexpected domains always FLAG + always in `flags` --
    unexpected_domains = [
        "randomvendor.com", "gmail.com", "outlook.com", "some-other-supplier.net",
        "consultingfirm.io", "totallydifferent.org", "sub.randomvendor.com",
    ]
    sweep_ok = True
    for dom in unexpected_domains:
        d = classify_roster([Participant("Sweep", f"person@{dom}")], SUPPLIER_DOMAINS)
        cp = d.classified[0]
        if cp.label != LABEL_FLAG_UNEXPECTED_EXTERNAL or cp not in d.flags:
            sweep_ok = False
    _check(
        "SAFETY-CRITICAL sweep: every unexpected external domain -> "
        "FLAG_UNEXPECTED_EXTERNAL AND always present in `flags` (never "
        "silently folded into INTERNAL/EXPECTED_SUPPLIER, never dropped)",
        sweep_ok,
        "",
    )

    # --- Full mixed-roster integration test: one of each of the 5 outcomes --
    mixed_participants = [
        Participant("Internal Person", "int@lilly.com"),
        Participant("Supplier Person", "sup@acme.com"),
        Participant("Unexpected Person", "who@thirdparty.com"),
        Participant("Flagged Lilly Person", "flag@lilly.com", in_supplier_context=True),
        Participant("No Email Person", None),
    ]
    d_mixed = classify_roster(mixed_participants, SUPPLIER_DOMAINS, context={"supplier_name": "Acme Corp"})
    _check(
        "mixed roster: classified preserves input order and length",
        [c.identifier for c in d_mixed.classified] == [p.identifier for p in mixed_participants],
        f"got order {[c.identifier for c in d_mixed.classified]}",
    )
    _check(
        "mixed roster: exactly 2 flags (unexpected external + lilly-in-"
        "supplier-context), exactly 1 needs_review (no email)",
        len(d_mixed.flags) == 2 and len(d_mixed.needs_review) == 1,
        f"flags={len(d_mixed.flags)}, needs_review={len(d_mixed.needs_review)}",
    )
    _check(
        "mixed roster: counts dict tallies all 5 labels correctly (1 each)",
        d_mixed.counts == {
            LABEL_INTERNAL: 1,
            LABEL_EXPECTED_SUPPLIER: 1,
            LABEL_FLAG_UNEXPECTED_EXTERNAL: 1,
            LABEL_FLAG_LILLY_EMAIL_IN_SUPPLIER_CONTEXT: 1,
            LABEL_REVIEW: 1,
        },
        f"got counts={d_mixed.counts}",
    )
    _check(
        "mixed roster: trace has 1 header line + 1 line per participant",
        len(d_mixed.trace) == 1 + len(mixed_participants),
        f"trace had {len(d_mixed.trace)} lines",
    )

    # --- Empty roster is not an error, not a fabricated participant ----------
    d_empty = classify_roster([], SUPPLIER_DOMAINS)
    _check(
        "empty participants list -> empty classified/flags/needs_review, "
        "not an error and not a fabricated participant",
        d_empty.classified == [] and d_empty.flags == [] and d_empty.needs_review == [],
        f"got classified={d_empty.classified}",
    )

    print()
    print("=" * 78)
    print("NEGATIVE TESTS (must refuse a malformed call, not guess its shape)")
    print("=" * 78)

    _check_raises(
        "classify_roster: refuses participants that is not a list/tuple",
        lambda: classify_roster({"not": "a list"}, SUPPLIER_DOMAINS),
        InvalidParticipantsError,
    )
    _check_raises(
        "classify_roster: refuses a participants list containing a non-"
        "Participant item (e.g. a plain dict)",
        lambda: classify_roster([{"identifier": "X", "email": "x@acme.com"}], SUPPLIER_DOMAINS),
        InvalidParticipantsError,
    )
    _check_raises(
        "classify_roster: refuses empty supplier_domains (cannot classify "
        "EXPECTED_SUPPLIER vs FLAG_UNEXPECTED_EXTERNAL with nothing to "
        "compare against)",
        lambda: classify_roster([Participant("X", "x@acme.com")], []),
        InvalidSupplierDomainError,
    )
    _check_raises(
        "classify_roster: refuses supplier_domains == 'lilly.com' (ambiguous "
        "- overlaps with Lilly's own domain family)",
        lambda: classify_roster([Participant("X", "x@acme.com")], "lilly.com"),
        InvalidSupplierDomainError,
    )
    _check_raises(
        "classify_roster: refuses a supplier subdomain of lilly.com (still "
        "overlaps with Lilly's own domain family)",
        lambda: classify_roster([Participant("X", "x@acme.com")], "vendor.lilly.com"),
        InvalidSupplierDomainError,
    )
    _check_raises(
        "classify_roster: refuses a non-string entry inside supplier_domains",
        lambda: classify_roster([Participant("X", "x@acme.com")], ["acme.com", 12345]),
        InvalidSupplierDomainError,
    )
    _check_raises(
        "classify_roster: refuses a supplier domain with no '.' (e.g. 'acme')",
        lambda: classify_roster([Participant("X", "x@acme.com")], "acme"),
        InvalidSupplierDomainError,
    )
    _check_raises(
        "classify_roster: refuses context that is not a dict",
        lambda: classify_roster([Participant("X", "x@acme.com")], SUPPLIER_DOMAINS, context="Acme Corp"),
        InvalidContextError,
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
