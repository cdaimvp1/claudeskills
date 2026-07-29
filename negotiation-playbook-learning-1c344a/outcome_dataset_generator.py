#!/usr/bin/env python3
"""
outcome_dataset_generator.py — `negotiation_outcome.json` and `outcome_dataset.json`
(F9 build 2).

F9 called this "serialization plus assertion, not arithmetic", because `outcome_partition()`
and `difficulty_score()` in the vendored kernel already compute and validate every figure
these files carry, including the sum-to-1.0 integrity check. This module does NOT reimplement
any of that: it counts outcome codes, calls the kernel, and serializes the schema.

`outcome_summary.md` is deliberately absent. F9 classed it PROSE, and a human-readable
narrative summary is correctly model-authored.

WHAT IT REFUSES TO DO
---------------------
  * an outcome code outside the eleven the schema defines        -> UnknownOutcomeError
  * two records sharing a dedup_key                              -> DuplicateOutcomeError
  * a summary whose stated distribution contradicts the actual
    position_outcomes                                            -> DistributionMismatchError
  * partition rates that do not sum to 1.0                       -> the kernel's PartitionError
  * a difficulty score asserted when no position was applicable  -> emits NEEDS_INPUT, never 0

The dedup rule is the schema's own: "if found, treat the new capture as an UPDATE to that
record, not a second outcome, so the same negotiation is never double-counted in any rate,
partition, or difficulty rollup." Double-counting one negotiation silently biases every
downstream acceptance rate, which is the whole point of the dataset.

The zero-applicable rule is the kernel's: `difficulty_score()` returns None, and SKILL.md
says "never divide by zero; if applicable == 0, difficulty is NEEDS_INPUT". A score of 0
would read as "this negotiation was easy" when in fact nothing was measured.

Stdlib only.
"""
from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from numeric_kernel import (                                   # noqa: E402  (G11)
    InvalidInputError,
    PartitionError,
    difficulty_score,
    outcome_partition,
)

# The eleven codes, from the schema's `outcome` enum.
OUTCOME_CODES = (
    "ACCEPTED_AS_IS",
    "ACCEPTED_WITH_MINOR_CHANGES",
    "COUNTER_ACCEPTED",
    "NEGOTIATED_COMPROMISE",
    "LILLY_FALLBACK_USED",
    "REJECTED_BY_SUPPLIER",
    "ESCALATED_TO_SME",
    "ESCALATED_TO_LEGAL",
    "NOT_APPLICABLE",
    "HARD_STOP_HELD",
    "HARD_STOP_EXCEPTION",
)

# schema key <-> outcome code. The schema uses lowercase keys in outcome_distribution.
DISTRIBUTION_KEYS = {code: code.lower() for code in OUTCOME_CODES}

DIFFICULTY_BANDS = {"Low": "low", "Medium": "medium", "High": "high", "Very high": "very_high"}


class OutcomeError(Exception):
    """Base for every refusal."""


class UnknownOutcomeError(OutcomeError):
    pass


class DuplicateOutcomeError(OutcomeError):
    pass


class DistributionMismatchError(OutcomeError):
    pass


def count_outcomes(position_outcomes):
    """Tally the eleven codes. Refuses anything outside the enum."""
    counts = {code: 0 for code in OUTCOME_CODES}
    for i, p in enumerate(position_outcomes or []):
        code = (p.get("outcome") or "").strip()
        if code not in counts:
            raise UnknownOutcomeError(
                "position_outcomes[%d] has outcome %r, which is not one of the eleven "
                "codes the schema defines. An unrecognised code would be silently dropped "
                "from every rate, so it is refused instead. Valid: %s"
                % (i, code, ", ".join(OUTCOME_CODES))
            )
        counts[code] += 1
    return counts


def dedup_key(meta):
    """The schema's stable key: lowercased(supplier) + type + reference + execution_date."""
    return "|".join([
        (meta.get("supplier") or "").strip().lower(),
        (meta.get("contract_type") or "").strip(),
        (meta.get("contract_reference") or "").strip(),
        (meta.get("execution_date") or "").strip(),
    ])


def build_outcome_record(raw):
    """One `negotiation_outcome.json`. Every rollup figure comes from the kernel."""
    meta = raw.get("contract_metadata") or {}
    positions = raw.get("position_outcomes") or []
    counts = count_outcomes(positions)

    # If the caller stated a distribution, it must match what the positions actually say.
    stated = (raw.get("negotiation_summary") or {}).get("outcome_distribution")
    if stated:
        for code, key in DISTRIBUTION_KEYS.items():
            if key in stated and int(stated[key]) != counts[code]:
                raise DistributionMismatchError(
                    "negotiation_summary.outcome_distribution.%s says %s but the actual "
                    "position_outcomes contain %d. The summary is a rollup of the "
                    "positions; when they disagree the positions are the source of truth, "
                    "and a stated total nobody can rebuild is what this refuses to emit."
                    % (key, stated[key], counts[code])
                )

    # The kernel refuses a zero denominator, and its own message says what to do instead:
    # "label this NEEDS_INPUT rather than reporting zero rates". Rates of 0.0 would read as
    # "Lilly prevailed on nothing", when in truth nothing was measured. Note this is caught
    # narrowly: any OTHER InvalidInputError still propagates.
    try:
        partition = outcome_partition(counts)  # raises PartitionError if rates miss 1.0
    except InvalidInputError as e:
        if "denominator is 0" not in str(e):
            raise
        partition = None
    diff = difficulty_score(counts)            # None when nothing was applicable

    if diff is None:
        difficulty = "NEEDS_INPUT"
        difficulty_detail = {
            "score": None,
            "band": "NEEDS_INPUT",
            "applicable": 0,
            "note": ("No applicable position, so there is nothing to score. Reported as "
                     "NEEDS_INPUT rather than 0, which would read as an easy negotiation."),
        }
        leadership_flag = False
    else:
        difficulty = DIFFICULTY_BANDS.get(diff.band, diff.band.lower().replace(" ", "_"))
        difficulty_detail = {
            "score": round(diff.score, 2),
            "band": diff.band,
            "weighted_sum": diff.weighted_sum,
            "applicable": diff.applicable,
        }
        leadership_flag = bool(diff.leadership_flag)

    return {
        "outcome_id": raw.get("outcome_id"),
        "record_date": raw.get("record_date"),
        "capture_method": raw.get("capture_method"),
        "dedup_key": dedup_key(meta),
        "contract_metadata": meta,
        "position_outcomes": positions,
        "negotiation_summary": {
            "total_positions_evaluated": len(positions),
            "outcome_distribution": {DISTRIBUTION_KEYS[c]: counts[c] for c in OUTCOME_CODES},
            # Percentage, per the schema's wording, and derived from the kernel's rate
            # rather than recomputed here.
            "lilly_success_rate": (round(partition.lilly_position_prevailed * 100, 2)
                                   if partition else "NEEDS_INPUT"),
            "acceptance_rate_strict": (round(partition.acceptance_rate * 100, 2)
                                       if partition else "NEEDS_INPUT"),
            "partition": ({
                "denominator": partition.denominator,
                "lilly_position_prevailed": round(partition.lilly_position_prevailed, 6),
                "supplier_prevailed": round(partition.supplier_prevailed, 6),
                "negotiated": round(partition.negotiated, 6),
                "escalated": round(partition.escalated, 6),
            } if partition else {
                "denominator": 0,
                "note": ("Every position was NOT_APPLICABLE, so there is no partition to "
                         "report. Rates of 0.0 would read as 'Lilly prevailed on nothing' "
                         "when in fact nothing was measured."),
            }),
            "negotiation_difficulty": difficulty,
            "difficulty_detail": difficulty_detail,
            "leadership_flag": leadership_flag,
            "key_concessions": (raw.get("negotiation_summary") or {}).get("key_concessions", []),
            "key_wins": (raw.get("negotiation_summary") or {}).get("key_wins", []),
            "notes": (raw.get("negotiation_summary") or {}).get("notes"),
        },
    }


def build_dataset(records, last_updated):
    """Aggregate `outcome_dataset.json`, with the dedup rule enforced."""
    by_key = {}
    for r in records:
        rec = r if "dedup_key" in r else build_outcome_record(r)
        key = rec["dedup_key"]
        if key in by_key:
            raise DuplicateOutcomeError(
                "two records share dedup_key %r (%s and %s). The schema says a repeat "
                "capture is an UPDATE to the existing record, not a second outcome: "
                "double-counting one negotiation biases every acceptance rate, partition "
                "and difficulty rollup that reads this dataset."
                % (key, by_key[key].get("outcome_id"), rec.get("outcome_id"))
            )
        by_key[key] = rec

    outcomes = list(by_key.values())
    dates = sorted(
        d for d in ((o.get("contract_metadata") or {}).get("execution_date") for o in outcomes)
        if d
    )
    suppliers, types, categories, bands = set(), {}, {}, {}
    total_positions = 0
    for o in outcomes:
        m = o.get("contract_metadata") or {}
        if m.get("supplier"):
            suppliers.add(m["supplier"].strip().lower())
        for field, bucket in (("contract_type", types), ("contract_category", categories),
                              ("value_band", bands)):
            v = m.get(field)
            if v:
                bucket[v] = bucket.get(v, 0) + 1
        total_positions += len(o.get("position_outcomes") or [])

    return {
        "dataset_metadata": {
            "last_updated": last_updated,
            "total_outcomes": len(outcomes),
            "total_position_outcomes": total_positions,
            "date_range": {"earliest": dates[0] if dates else None,
                           "latest": dates[-1] if dates else None},
            "coverage": {
                "suppliers": len(suppliers),
                "contract_types": types,
                "contract_categories": categories,
                "value_bands": bands,
            },
        },
        "outcomes": outcomes,
    }


def write_json(obj, path):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, indent=2)
    return path


def main(argv):
    if not argv:
        print(__doc__.strip())
        print("\nusage: outcome_dataset_generator.py <records.json> <out_dataset.json> [YYYY-MM-DD]")
        return 0
    with open(argv[0], encoding="utf-8") as fh:
        records = json.load(fh)
    if isinstance(records, dict):
        records = records.get("outcomes") or [records]
    out = argv[1] if len(argv) > 1 else "outcome_dataset.json"
    last_updated = argv[2] if len(argv) > 2 else None
    try:
        dataset = build_dataset(records, last_updated)
    except (OutcomeError, PartitionError) as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr)
        return 2
    write_json(dataset, out)
    print(json.dumps(dataset["dataset_metadata"], indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
