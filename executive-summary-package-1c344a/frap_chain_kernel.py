"""
frap_chain_kernel.py

Standalone, stdlib-only decision kernel that reproduces the FRAP ATC/ATS
approval-chain construction rule documented in:

  executive-summary-package-1c344a/SKILL.md
  (Skill Version 2.2, Jun 2026 -- "Lilly FRAP Approval Threshold Schedules")

Every threshold value, grade name, worked example, and rule quoted in this
file's docstrings/comments is copied verbatim from that SKILL.md. Nothing
here is invented. Where the source text is ambiguous, the ambiguity is
quoted and the chosen resolution is explained inline (see
"INTERPRETATION NOTE" comments below) rather than silently guessed.

Source changelog entry this kernel implements (quoted exactly from SKILL.md,
"Changelog (newest first)"):

  "v2.2 (Jun 2026): Unified the ATC/ATS chain-construction algorithm into
  one canonical rule (ceiling = lowest grade whose threshold >= deal value;
  start = next grade up for ATC, business owner's own grade for ATS);
  recomputed both worked examples ($17M -> P5/M3; P6/M4 and $107M -> P6/M4;
  CPO; CFO) from a stated user grade; added a mandatory self-verification
  arithmetic echo before generation; removed the hardcoded "Financial Risk
  Rating: Acceptable" default (now NEEDS_INPUT, per no-fabrication);
  disambiguated the ATS CEO $200M-operating / $1B-capital threshold;
  standardized the body font to Calibri 11pt; fixed illustrative financial
  example arithmetic; reworded the frap-thresholds pointer to the inlined
  section; G1-G7 -> G1-G10; relabeled the suite-wide guardrails note."

This kernel implements exactly the chain-construction and self-verification
portions of that changelog entry (not the document-formatting portions,
which are out of scope for a decision kernel).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

SOURCE_VERSION = "executive-summary-package-1c344a SKILL.md, Skill Version 2.2 (Jun 2026)"

# ---------------------------------------------------------------------------
# LIVE-FETCH-FIRST, VENDORED-FALLBACK (added per user instruction, 2026-07-21)
#
# The tables below are a VENDORED SNAPSHOT, not the canonical source. The
# user confirmed:
#   - A live canonical FRAP threshold page exists:
#     https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/SitePages/FRAP---Procurement-Transactions.aspx
#   - Old/stale FRAP tables exist elsewhere on SharePoint, so a general
#     search for "FRAP threshold" is UNSAFE - it can find a superseded
#     table. Only this exact page is the intended target.
#   - The true policy document lives in Veeva Vault, which Claude Desktop
#     cannot reach; this SharePoint page is the best available live proxy,
#     not a guaranteed match to the vault document.
#
# This mirrors the Stage 2 pattern (SharePoint-primary, local-fallback)
# already applied to the user manual in lilly-brand-assets: try the exact
# URL via the M365 connector first; on success, use the live table and say
# so; on failure (connector unavailable, page unreachable, or the fetched
# page cannot be parsed into a table this kernel recognizes), fall back to
# the vendored ATC_TABLE / ATS_TABLE_OPERATING / ATS_TABLE_CAPITAL below and
# disclose that the answer used a locally-shipped snapshot, not a table
# confirmed current against the live page.
#
# This kernel does not perform the fetch itself (it is stdlib Python with
# no network access assumed available or appropriate to grant it silently).
# The calling skill (executive-summary-package's SKILL.md) is responsible
# for the fetch attempt and must call compute_chain() with an explicit
# `table_source` label either way - "live SharePoint" or "vendored
# snapshot" - so every Decision carries honest provenance. See
# `Decision.table_source` and the `FRAP_TABLE_SOURCE_URL` constant below.
# ---------------------------------------------------------------------------

FRAP_TABLE_SOURCE_URL = (
    "https://collab.lilly.com/sites/Global_Procurement/Playbook2.0/SitePages/"
    "FRAP---Procurement-Transactions.aspx"
)

# ---------------------------------------------------------------------------
# GRADE / THRESHOLD TABLES
#
# Copied verbatim from SKILL.md, section "## INLINED: references/frap-thresholds.md"
# ("Lilly FRAP Approval Threshold Schedules", FRAP Thresholds Version: Current
# as of May 2026, verified against Lilly internal FRAP reference).
#
# ATC table, quoted source (SKILL.md lines ~797-805):
#
#   | Level | Approver Grade | ATC Threshold |
#   |-------|---------------|---------------|
#   | 1     | CFO            | Unlimited     |
#   | 2     | CPO            | $50M          |
#   | 3     | P6/M4          | $20M          |
#   | 4     | P5/M3          | $15M          |
#   | 5     | P4/M2          | $4M           |
#   | 6     | P1-P3/M1       | $2M           |
#   | 7     | B4             | $1M           |
#
# Stored below LOWEST-FIRST (ascending threshold order) because the
# canonical rule reads the table "from the bottom (lowest grade) upward."
# ---------------------------------------------------------------------------

ATC_TABLE: List[Tuple[str, float]] = [
    ("B4", 1_000_000),
    ("P1-P3/M1", 2_000_000),
    ("P4/M2", 4_000_000),
    ("P5/M3", 15_000_000),
    ("P6/M4", 20_000_000),
    ("CPO", 50_000_000),
    ("CFO", math.inf),  # "Unlimited" -- "Unlimited always satisfies the comparison."
]

# ATS table, quoted source (SKILL.md lines ~811-821):
#
#   | Level | Approver Grade       | ATS Threshold (single approval) | ATS Threshold (capital/asset deal) |
#   |-------|---------------------|---------------------------------|------------------------------------|
#   | 1     | BOD                  | Unlimited                       | Unlimited                          |
#   | 2     | CEO                  | $200M                           | $1B                                |
#   | 3     | M7                   | $35M                            | $35M                               |
#   | 4     | M6                   | $15M                            | $15M                               |
#   | 5     | M5/R12               | $8M                              | $8M                                |
#   | 6     | M4/P6/R10-11         | $4M                              | $4M                                |
#   | 7     | M3/P5/R7-9/S6-7      | $1M                              | $1M                                |
#   | 8     | M2/P4/R4-R6          | $0.1M                            | $0.1M                              |
#   | 9     | M1/P3/R3             | $0.02M                           | $0.02M                             |
#
# Only the CEO row differs between the "operating" and "capital" columns
# (all other rows are identical between the two columns, per the source
# table itself). Stored lowest-first, same rationale as ATC.
# ---------------------------------------------------------------------------

ATS_TABLE_OPERATING: List[Tuple[str, float]] = [
    ("M1/P3/R3", 20_000),
    ("M2/P4/R4-R6", 100_000),
    ("M3/P5/R7-9/S6-7", 1_000_000),
    ("M4/P6/R10-11", 4_000_000),
    ("M5/R12", 8_000_000),
    ("M6", 15_000_000),
    ("M7", 35_000_000),
    ("CEO", 200_000_000),
    ("BOD", math.inf),
]

ATS_TABLE_CAPITAL: List[Tuple[str, float]] = [
    ("M1/P3/R3", 20_000),
    ("M2/P4/R4-R6", 100_000),
    ("M3/P5/R7-9/S6-7", 1_000_000),
    ("M4/P6/R10-11", 4_000_000),
    ("M5/R12", 8_000_000),
    ("M6", 15_000_000),
    ("M7", 35_000_000),
    ("CEO", 1_000_000_000),
    ("BOD", math.inf),
]

# CEO disambiguation band. Quoted source (SKILL.md, "CEO threshold
# disambiguation (REQUIRED)" paragraph):
#
#   "$200M is the CEO ceiling for a single operating/spend approval...
#   $1B is the CEO ceiling for a capital/asset authorization... Only the
#   BOD vs CEO boundary is affected; for any deal at or below $200M the two
#   columns are identical, so this choice only matters for deals between
#   $200M and $1B. When a deal value lands in that band, ask the user
#   (tappable single-select) whether it is an operating approval ($200M
#   ceiling -> add BOD) or a capital/asset authorization ($1B ceiling ->
#   CEO is sufficient) before fixing the ATS ceiling."
#
# So disambiguation (is_capital_spend) is REQUIRED only when
# 200,000,000 < deal_value <= 1,000,000,000. Outside that band the two
# tables produce the identical ceiling grade, so no ambiguity exists.
CEO_BAND_LOW = 200_000_000
CEO_BAND_HIGH = 1_000_000_000


# ---------------------------------------------------------------------------
# FACTS / DECISION SHAPE
# ---------------------------------------------------------------------------

@dataclass
class Facts:
    """Inputs the chain-construction rule needs.

    Field names map directly onto the "BLOCKING FILE INPUTS" /
    "Deal-value disambiguation" / "CEO threshold disambiguation" language
    in SKILL.md:
      - deal_value: "the total contract value being approved" (the single
        figure that drives the chain, per the deal-value disambiguation
        rule).
      - user_grade: "Your grade level" (BLOCKING FILE INPUTS, "Helpful"
        row) -- required for ATC mode.
      - business_owner_grade: "the business owner's grade level" --
        required for ATS mode.
      - is_capital_spend: resolves the CEO $200M-operating / $1B-capital
        disambiguation. Only required when deal_value falls in the
        $200M-$1B band and mode == "ATS"; otherwise irrelevant and may be
        left None.
      - mode: "ATC" or "ATS" (SKILL.md: "THE CANONICAL CHAIN-CONSTRUCTION
        RULE (one algorithm, used for both ATC and ATS)... the only
        difference is where the chain STARTS.").
      - table_source: required, no default. Must be either "live
        SharePoint" (the calling skill successfully fetched
        FRAP_TABLE_SOURCE_URL this run and is passing live-parsed tables
        via live_atc_table / live_ats_table_operating / live_ats_table_capital)
        or "vendored snapshot" (the fetch was not attempted, unavailable,
        or failed, and this kernel's own ATC_TABLE / ATS_TABLE_OPERATING /
        ATS_TABLE_CAPITAL are used instead). There is no silent default:
        the calling skill must state which case applies so the Decision's
        provenance is never ambiguous about which table answered the
        question.
      - live_atc_table / live_ats_table_operating / live_ats_table_capital:
        only used when table_source == "live SharePoint". Same shape as
        the module-level ATC_TABLE etc (list of (grade, threshold) tuples,
        lowest-first). If table_source is "live SharePoint" but these are
        not supplied, the kernel refuses rather than silently falling back
        to the vendored table under a live label.
    """

    deal_value: Optional[float] = None
    user_grade: Optional[str] = None
    business_owner_grade: Optional[str] = None
    is_capital_spend: Optional[bool] = None
    mode: Optional[str] = None  # "ATC" or "ATS"
    table_source: Optional[str] = None  # "live SharePoint" or "vendored snapshot"
    live_atc_table: Optional[List[Tuple[str, float]]] = None
    live_ats_table_operating: Optional[List[Tuple[str, float]]] = None
    live_ats_table_capital: Optional[List[Tuple[str, float]]] = None


@dataclass
class Decision:
    """Kernel output.

    outcome: the constructed chain as an ordered list of grades (lowest to
        highest), or None if the kernel refused.
    reasoning: the self-verification echo (or the refusal explanation).
    node_trail: ordered audit trail of which rule/gate fired, in the order
        evaluated.
    source_version: which skill version this computation traces to.
    table_source: "live SharePoint" or "vendored snapshot" - which
        threshold table actually answered this question. Always populated
        (never left ambiguous), even on a refusal.
    needs_review: True when the kernel refused rather than guessed (hard
        gate fired). Decision.outcome is None whenever this is True.
    """

    outcome: Optional[List[str]]
    reasoning: str
    node_trail: List[str] = field(default_factory=list)
    source_version: str = SOURCE_VERSION
    table_source: str = "vendored snapshot"
    needs_review: bool = False


def _refuse(node_trail: List[str], gate: str, reasoning: str, table_source: str = "vendored snapshot") -> Decision:
    node_trail.append(f"GATE FAILED: {gate}")
    return Decision(
        outcome=None,
        reasoning=reasoning,
        node_trail=node_trail,
        source_version=SOURCE_VERSION,
        table_source=table_source,
        needs_review=True,
    )


def _format_threshold(value: float) -> str:
    if math.isinf(value):
        return "Unlimited"
    if value >= 1_000_000_000:
        return f"${value / 1_000_000_000:g}B"
    if value >= 1_000_000:
        return f"${value / 1_000_000:g}M"
    return f"${value:,.0f}"


def _format_value(value: float) -> str:
    if value >= 1_000_000_000:
        return f"${value / 1_000_000_000:g}B"
    if value >= 1_000_000:
        return f"${value / 1_000_000:g}M"
    return f"${value:,.0f}"


def _find_grade_index(table: List[Tuple[str, float]], grade: str) -> Optional[int]:
    for i, (g, _) in enumerate(table):
        if g == grade:
            return i
    return None


def _find_ceiling_index(table: List[Tuple[str, float]], deal_value: float) -> int:
    """SKILL.md: 'the ceiling is the LOWEST grade in the schedule whose
    threshold is GREATER THAN OR EQUAL TO the total contract value... Read
    the table from the bottom (lowest grade) upward and stop at the first
    grade whose threshold >= deal value.' Table is stored lowest-first, so
    this is a simple forward scan.
    """
    for i, (_grade, threshold) in enumerate(table):
        if threshold >= deal_value:
            return i
    # Should be unreachable: the top row of every table is Unlimited.
    return len(table) - 1


def compute_chain(facts: Facts) -> Decision:
    node_trail: List[str] = []

    # --- Hard gate: table_source must be stated explicitly, no default ----
    # This is the live-fetch-first, vendored-fallback gate. See the module
    # docstring section "LIVE-FETCH-FIRST, VENDORED-FALLBACK" for why a
    # general SharePoint search is unsafe here (stale FRAP tables exist
    # elsewhere) and why only FRAP_TABLE_SOURCE_URL is the intended target.
    if facts.table_source not in ("live SharePoint", "vendored snapshot"):
        return _refuse(
            node_trail,
            "table_source not stated",
            "The calling skill must state whether this run used a live "
            f"fetch of {FRAP_TABLE_SOURCE_URL} ('live SharePoint') or this "
            "kernel's vendored snapshot ('vendored snapshot') before a "
            "chain can be computed. There is no silent default: refusing "
            "rather than assuming the vendored table is current.",
            table_source="vendored snapshot",
        )

    if facts.table_source == "live SharePoint":
        if not (facts.live_atc_table and facts.live_ats_table_operating and facts.live_ats_table_capital):
            return _refuse(
                node_trail,
                "live tables not supplied",
                "table_source is 'live SharePoint' but the calling skill "
                "did not supply live_atc_table / live_ats_table_operating / "
                "live_ats_table_capital. Refusing rather than silently "
                "falling back to the vendored table under a live label - "
                "that would misrepresent the provenance of the answer.",
                table_source="live SharePoint",
            )
        atc_table_source = facts.live_atc_table
        ats_table_operating_source = facts.live_ats_table_operating
        ats_table_capital_source = facts.live_ats_table_capital
        node_trail.append(
            f"table_source = 'live SharePoint' ({FRAP_TABLE_SOURCE_URL}); "
            "using live-fetched tables supplied by the calling skill"
        )
    else:
        atc_table_source = ATC_TABLE
        ats_table_operating_source = ATS_TABLE_OPERATING
        ats_table_capital_source = ATS_TABLE_CAPITAL
        node_trail.append(
            "table_source = 'vendored snapshot' (this kernel's own hardcoded "
            "tables, transcribed from executive-summary-package SKILL.md; "
            "not confirmed current against the live SharePoint page)"
        )

    active_table_source = facts.table_source  # captured for the Decision below

    # --- Hard gate: deal value must be present and a positive number -----
    # Source: SKILL.md Rule 3 / metadata-fields.md: "Grade level not
    # provided -> ask before proceeding; chain cannot be calculated without
    # it." The equivalent applies a fortiori to deal_value, which is the
    # single figure the whole algorithm keys off of ("Deal-value
    # disambiguation... The chain is driven by ONE figure... do NOT
    # guess.").
    if facts.deal_value is None:
        return _refuse(
            node_trail,
            "deal_value missing",
            "Deal value not provided. Per SKILL.md's deal-value "
            "disambiguation rule, the chain is driven by ONE figure (the "
            "total contract value being approved) and the skill must 'not "
            "guess' when that figure is unresolved. Provide the deal value "
            "before a chain can be computed.",
            table_source=active_table_source,
        )
    if not isinstance(facts.deal_value, (int, float)) or facts.deal_value <= 0:
        return _refuse(
            node_trail,
            "deal_value invalid",
            f"Deal value {facts.deal_value!r} is not a positive number. "
            "Not a case documented in SKILL.md, but treated the same as "
            "'missing' under the no-guessing rule rather than coerced.",
            table_source=active_table_source,
        )
    node_trail.append(f"deal_value accepted: {_format_value(facts.deal_value)}")

    # --- Hard gate: mode must be ATC or ATS --------------------------------
    if facts.mode not in ("ATC", "ATS"):
        return _refuse(
            node_trail,
            "mode missing or invalid",
            f"mode must be 'ATC' or 'ATS'; got {facts.mode!r}. SKILL.md: "
            "'THE CANONICAL CHAIN-CONSTRUCTION RULE (one algorithm, used "
            "for both ATC and ATS)... the only difference is where the "
            "chain STARTS' -- the kernel cannot proceed without knowing "
            "which start rule applies.",
            table_source=active_table_source,
        )
    node_trail.append(f"mode accepted: {facts.mode}")

    if facts.mode == "ATC":
        table = atc_table_source
        stated_grade = facts.user_grade
        if stated_grade is None:
            return _refuse(
                node_trail,
                "user_grade missing",
                "ATC mode requires the user's own grade to compute the "
                "start grade ('the chain STARTS at the next grade level "
                "UP from the user's own grade'). Grade not provided.",
                table_source=active_table_source,
            )
        idx = _find_grade_index(table, stated_grade)
        if idx is None:
            return _refuse(
                node_trail,
                "user_grade not in ATC table",
                f"'{stated_grade}' is not one of the grades in the ATC "
                f"schedule ({', '.join(g for g, _ in table)}). Per the "
                "no-fabrication rule (SKILL.md Rule 3 / Accuracy and "
                "Anti-Drift Rules), an unrecognized grade is NEEDS_INPUT, "
                "not a guessed nearest match.",
                table_source=active_table_source,
            )
        node_trail.append(f"user_grade '{stated_grade}' found at ATC index {idx}")

        # Start = next grade up from the user's own grade (ATC).
        # INTERPRETATION NOTE: SKILL.md defines the start as "the next
        # grade level UP from the user's own grade" but never states what
        # happens if the user's own grade is already the top of the table
        # (CFO) -- there is no grade above CFO to move "up" to. This is not
        # covered by either worked example (P4/M2 and P5/M3, both well
        # below the top). Rather than inventing a fallback (e.g. clamping
        # to CFO, which would silently violate "the user... is NOT an
        # approver"), this kernel treats "no next-up grade exists" as a
        # gate: refuse and flag for review.
        if idx + 1 >= len(table):
            return _refuse(
                node_trail,
                "no grade above user_grade",
                f"User grade '{stated_grade}' is already the top of the "
                "ATC schedule; SKILL.md's 'next grade up from the user's "
                "own grade' rule has no next grade to select in this case. "
                "Not addressed by either worked example -- flagged for "
                "manual review rather than guessed.",
                table_source=active_table_source,
            )
        start_idx = idx + 1
        node_trail.append(
            f"ATC start = next grade up from '{stated_grade}' = "
            f"'{table[start_idx][0]}' (index {start_idx})"
        )

    else:  # ATS
        # --- Hard gate: CEO $200M-operating / $1B-capital disambiguation --
        # Source: SKILL.md "CEO threshold disambiguation (REQUIRED)".
        # Required only in the $200M < deal_value <= $1B band; outside that
        # band both columns give the same ceiling, so no ambiguity exists.
        if CEO_BAND_LOW < facts.deal_value <= CEO_BAND_HIGH and facts.is_capital_spend is None:
            return _refuse(
                node_trail,
                "capital-vs-operating disambiguation required",
                f"Deal value {_format_value(facts.deal_value)} falls between "
                f"{_format_value(CEO_BAND_LOW)} and {_format_value(CEO_BAND_HIGH)}. "
                "SKILL.md: 'this choice only matters for deals between $200M "
                "and $1B. When a deal value lands in that band, ask the "
                "user... whether it is an operating approval ($200M ceiling "
                "-> add BOD) or a capital/asset authorization ($1B ceiling "
                "-> CEO is sufficient) before fixing the ATS ceiling.' "
                "is_capital_spend was not provided -- refusing rather than "
                "assuming either column.",
                table_source=active_table_source,
            )
        table = ats_table_capital_source if facts.is_capital_spend else ats_table_operating_source
        node_trail.append(
            "ATS table selected: "
            + ("capital/asset ($1B CEO ceiling)" if facts.is_capital_spend
               else "operating/spend (default, $200M CEO ceiling)")
        )

        stated_grade = facts.business_owner_grade
        if stated_grade is None:
            return _refuse(
                node_trail,
                "business_owner_grade missing",
                "ATS mode requires the business owner's grade ('the chain "
                "STARTS at the business owner's OWN grade'). Grade not "
                "provided.",
                table_source=active_table_source,
            )
        idx = _find_grade_index(table, stated_grade)
        if idx is None:
            return _refuse(
                node_trail,
                "business_owner_grade not in ATS table",
                f"'{stated_grade}' is not one of the grades in the ATS "
                f"schedule ({', '.join(g for g, _ in table)}). Flagged for "
                "review rather than guessed, per the no-fabrication rule.",
                table_source=active_table_source,
            )
        node_trail.append(f"business_owner_grade '{stated_grade}' found at ATS index {idx}")

        # Start = business owner's OWN grade (ATS).
        start_idx = idx
        node_trail.append(
            f"ATS start = business owner's own grade = '{table[start_idx][0]}' "
            f"(index {start_idx})"
        )

    # --- Ceiling: lowest grade whose threshold >= deal value --------------
    ceiling_idx = _find_ceiling_index(table, facts.deal_value)
    node_trail.append(
        f"ceiling = lowest grade with threshold >= {_format_value(facts.deal_value)} "
        f"= '{table[ceiling_idx][0]}' (index {ceiling_idx}, threshold "
        f"{_format_threshold(table[ceiling_idx][1])})"
    )

    # --- Build the chain ----------------------------------------------------
    # SKILL.md: "Build the chain: include the start grade, the ceiling
    # grade, and EVERY grade in between, listed lowest to highest. If the
    # start grade is already at or above the ceiling (a small deal relative
    # to a senior starter), the chain is just the start grade through the
    # ceiling, which may be a single level."
    #
    # INTERPRETATION NOTE: taken completely literally, "the start grade
    # through the ceiling" is contradictory once start_idx > ceiling_idx
    # (there is no ascending "through" range from a higher index down to a
    # lower one). The clarifying clause "which may be a single level"
    # signals the intended behavior: when the start grade already covers
    # the deal on its own, the chain collapses to that one grade. This
    # kernel implements it that way: if start_idx >= ceiling_idx, the chain
    # is the single-element list [start grade]; otherwise it is the
    # inclusive ascending slice from start to ceiling. Neither worked
    # example in SKILL.md exercises this branch (both have start_idx <
    # ceiling_idx), so this collapse behavior is this kernel's
    # interpretation of the clarifying clause, not a directly reproduced
    # worked example.
    if start_idx >= ceiling_idx:
        chain = [table[start_idx][0]]
        node_trail.append(
            "start grade already at/above ceiling -> single-level chain "
            f"= ['{table[start_idx][0]}']"
        )
    else:
        chain = [g for g, _ in table[start_idx:ceiling_idx + 1]]
        node_trail.append(f"chain (start..ceiling inclusive) = {chain}")

    levels = len(chain)

    # --- Self-verification echo --------------------------------------------
    # Reproduces the mandatory format from SKILL.md, "Self-verification
    # echo (RUN BEFORE GENERATING, every time)".
    below_ceiling_note = ""
    if ceiling_idx > 0:
        below_grade, below_threshold = table[ceiling_idx - 1]
        below_ceiling_note = f" and the grade just below it, {below_grade}, has {_format_threshold(below_threshold)} < {_format_value(facts.deal_value)}"

    if facts.mode == "ATC":
        echo = (
            f"Self-check (ATC): deal value = {_format_value(facts.deal_value)}. "
            f"User grade = {facts.user_grade}; start grade = next up = {table[start_idx][0]}. "
            f"Ceiling = lowest grade with threshold >= {_format_value(facts.deal_value)} = "
            f"{table[ceiling_idx][0]} (because {_format_threshold(table[ceiling_idx][1])} >= "
            f"{_format_value(facts.deal_value)}{below_ceiling_note}). "
            f"Chain (start -> ceiling, all in between) = {'; '.join(chain)}. Levels = {levels}."
        )
    else:
        echo = (
            f"Self-check (ATS): deal value = {_format_value(facts.deal_value)}. "
            f"Business owner grade = {facts.business_owner_grade}; start grade = same = "
            f"{facts.business_owner_grade}. Ceiling = lowest grade with threshold >= "
            f"{_format_value(facts.deal_value)} = {table[ceiling_idx][0]}. "
            f"Chain = {'; '.join(chain)}. Levels = {levels}."
        )
    node_trail.append("self-verification echo generated and reconciles")

    return Decision(
        outcome=chain,
        reasoning=echo,
        node_trail=node_trail,
        source_version=SOURCE_VERSION,
        table_source=active_table_source,
        needs_review=False,
    )


# ---------------------------------------------------------------------------
# SELF-TEST
# ---------------------------------------------------------------------------

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
    print("TEST 1: Worked Example 1 from SKILL.md")
    print(
        'Source quote: "Worked Example 1: $17M deal, user grade P4/M2 (ATC)... '
        "Chain = start (P5/M3) through ceiling (P6/M4), all levels in between, "
        'lowest to highest = P5/M3; P6/M4."'
    )
    d1 = compute_chain(Facts(deal_value=17_000_000, user_grade="P4/M2", mode="ATC", table_source="vendored snapshot"))
    print("Reasoning (self-check echo):", d1.reasoning)
    print("Node trail:")
    for step in d1.node_trail:
        print("  -", step)
    check(
        "Test 1: $17M / P4/M2 (ATC) -> P5/M3; P6/M4",
        d1.outcome == ["P5/M3", "P6/M4"],
        f"got {d1.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 2: Worked Example 2 from SKILL.md")
    print(
        'Source quote: "Worked Example 2: $107M deal, user grade P5/M3 (ATC)... '
        "Chain = start (P6/M4) through ceiling (CFO), all levels in between, "
        'lowest to highest = P6/M4; CPO; CFO."'
    )
    d2 = compute_chain(Facts(deal_value=107_000_000, user_grade="P5/M3", mode="ATC", table_source="vendored snapshot"))
    print("Reasoning (self-check echo):", d2.reasoning)
    print("Node trail:")
    for step in d2.node_trail:
        print("  -", step)
    check(
        "Test 2: $107M / P5/M3 (ATC) -> P6/M4; CPO; CFO",
        d2.outcome == ["P6/M4", "CPO", "CFO"],
        f"got {d2.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 3a: Refusal -- missing deal_value")
    d3a = compute_chain(Facts(deal_value=None, user_grade="P4/M2", mode="ATC", table_source="vendored snapshot"))
    print("Reasoning:", d3a.reasoning)
    check(
        "Test 3a: missing deal_value -> needs_review, no guessed outcome",
        d3a.needs_review is True and d3a.outcome is None,
        f"needs_review={d3a.needs_review}, outcome={d3a.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 3b: Refusal -- unknown/out-of-range grade")
    d3b = compute_chain(Facts(deal_value=17_000_000, user_grade="Z9-NOT-A-GRADE", mode="ATC", table_source="vendored snapshot"))
    print("Reasoning:", d3b.reasoning)
    check(
        "Test 3b: unknown grade -> needs_review, no guessed outcome",
        d3b.needs_review is True and d3b.outcome is None,
        f"needs_review={d3b.needs_review}, outcome={d3b.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 3c (bonus): Refusal -- CEO $200M-operating/$1B-capital band, no disambiguation given")
    d3c = compute_chain(Facts(deal_value=500_000_000, business_owner_grade="M6", mode="ATS", table_source="vendored snapshot"))
    print("Reasoning:", d3c.reasoning)
    check(
        "Test 3c: $500M ATS with is_capital_spend unset -> needs_review",
        d3c.needs_review is True and d3c.outcome is None,
        f"needs_review={d3c.needs_review}, outcome={d3c.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 3d (bonus): Same $500M deal, disambiguated as capital spend -> resolves")
    d3d = compute_chain(
        Facts(deal_value=500_000_000, business_owner_grade="M6", mode="ATS", is_capital_spend=True, table_source="vendored snapshot")
    )
    print("Reasoning:", d3d.reasoning)
    check(
        "Test 3d: $500M ATS capital spend, business_owner M6 -> chain resolves, CEO sufficient",
        d3d.outcome == ["M6", "M7", "CEO"],
        f"got {d3d.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 4a (live-fetch gate): table_source not stated -> refuses, no silent default")
    d4a = compute_chain(Facts(deal_value=17_000_000, user_grade="P4/M2", mode="ATC"))
    print("Reasoning:", d4a.reasoning)
    check(
        "Test 4a: table_source omitted -> needs_review, no guessed outcome",
        d4a.needs_review is True and d4a.outcome is None,
        f"needs_review={d4a.needs_review}, outcome={d4a.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 4b (live-fetch gate): table_source='live SharePoint' but no live tables supplied -> refuses")
    d4b = compute_chain(Facts(deal_value=17_000_000, user_grade="P4/M2", mode="ATC", table_source="live SharePoint"))
    print("Reasoning:", d4b.reasoning)
    check(
        "Test 4b: live SharePoint claimed but no tables given -> needs_review, does not silently use vendored table under a live label",
        d4b.needs_review is True and d4b.outcome is None,
        f"needs_review={d4b.needs_review}, outcome={d4b.outcome}",
    )

    print()
    print("=" * 78)
    print("TEST 4c (live-fetch gate): table_source='live SharePoint' WITH live tables supplied -> resolves using the live tables, not the vendored ones")
    # Deliberately different live table (a hypothetical policy update: P4/M2 ceiling raised to $30M)
    # to prove the kernel actually uses the supplied live table, not silently falling back to
    # the vendored ATC_TABLE (which has P4/M2 at $4M and P5/M3 at $15M, an entirely different chain).
    live_atc = [
        ("B4", 1_000_000),
        ("P1-P3/M1", 2_000_000),
        ("P4/M2", 4_000_000),
        ("P5/M3", 30_000_000),  # hypothetically raised from $15M in this "live" fetch
        ("P6/M4", 40_000_000),
        ("CPO", 60_000_000),
        ("CFO", math.inf),
    ]
    d4c = compute_chain(Facts(
        deal_value=17_000_000, user_grade="P4/M2", mode="ATC",
        table_source="live SharePoint",
        live_atc_table=live_atc,
        live_ats_table_operating=ATS_TABLE_OPERATING,
        live_ats_table_capital=ATS_TABLE_CAPITAL,
    ))
    print("Reasoning:", d4c.reasoning)
    check(
        "Test 4c: with a hypothetical live table (P5/M3 raised to $30M), $17M / P4/M2 (ATC) resolves to a single-level chain [P5/M3], NOT the vendored-table answer [P5/M3, P6/M4]",
        d4c.outcome == ["P5/M3"] and d4c.table_source == "live SharePoint",
        f"got outcome={d4c.outcome}, table_source={d4c.table_source}",
    )

    print()
    print("=" * 78)
    print(f"SUMMARY: {passed} passed, {failed} failed")
    if failed:
        raise SystemExit(1)
