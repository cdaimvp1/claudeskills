#!/usr/bin/env python3
"""
retrieval_index.py — a deterministic retrieval index over the four judgment corpora.

WHY THIS EXISTS
---------------
Today `playbook.md` and `pharma-requirements.md` are loaded "Always", in full, every run
(`SKILL.md:658,666`) with zero narrowing, and `vendor-tactics.md` is loaded whole even for
an Order Form that its own applicability matrix says needs only 2 of its 12 categories.
The index lets a pass load the relevant slice instead of the whole file.

SCOPE, STATED PLAINLY
---------------------
This BUILDS and VERIFIES the index. It does NOT rewire the review passes. That rewiring is
F1, which is on hold. The index is separable and useful on its own: it is checkable today,
and when F1 lifts it is already proven rather than written under time pressure.

THE ONE RULE THAT MUST NOT ERODE
--------------------------------
`F1-COVERAGE-MATRIX.md:227`: "a retrieval miss NEVER means skip the check. It means fall
back to loading the full corpus for that pass."

That rule is why `select()` returns a `Selection` carrying an explicit `fallback` flag and
a reason, instead of returning a possibly-empty list of sections. An empty list read as
"nothing to check" is precisely the failure this index could otherwise introduce: today the
full corpus is always loaded, so narrowing can only ever LOSE coverage, never gain it. A
silent miss would turn a token optimisation into an accuracy regression.

THE INDEX IS DERIVED, NEVER HAND-AUTHORED
-----------------------------------------
Every entry is parsed from the corpus files at run time. A hand-maintained copy would be
the same hand-sync drift class as the routing lists (B7b) and the handoff schema (E1): it
reads as correct right up until someone edits the corpus and not the index. If the corpus
changes, the index changes with it or the build raises.

Stdlib only.
"""
from __future__ import annotations

import json
import os
import re
import sys

REFS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "references")

# Normalized topic tags. The spec is explicit that the numeric section label is NOT the
# primary key, because the playbook records its own numbering as unstable ("§14 Insurance
# (§16 in some templates)", playbook.md:152) and because §26 is BOTH "Governing Law" (the
# section heading) and the debarment certification section (HS-2). Keying on a number would
# silently merge two unrelated topics.
TOPIC_KEYWORDS = (
    ("term", ("term and renewal", "renewal")),
    ("scope", ("scope of services",)),
    ("fees", ("fees and payment", "fees", "payment")),
    ("confidentiality", ("confidentiality",)),
    ("ip", ("intellectual property",)),
    ("warranties", ("representations and warranties", "warranties")),
    ("tax", ("tax",)),
    ("data-protection", ("data protection", "privacy")),
    ("audit", ("audit rights", "audit")),
    ("compliance", ("compliance", "anti-corruption")),
    ("insurance", ("insurance",)),
    ("force-majeure", ("force majeure",)),
    ("termination", ("termination",)),
    ("indemnification", ("indemnification",)),
    ("liability-cap", ("limitation of liability", "liability")),
    ("ai-ml", ("ai/ml", "ai / ml", "artificial intelligence")),
    ("general", ("assignment", "notices", "general provisions")),
    ("adverse-events", ("adverse event",)),
    ("sanctions", ("trade sanctions", "export control", "sanctions")),
    ("governing-law", ("governing law",)),
    ("dispute-resolution", ("dispute resolution",)),
    ("debarment", ("debarment",)),
    ("rate-card", ("rate card", "pricing review")),
)

DOC_TYPES = ("Change Order", "SOW", "Work Order", "Amendment", "Order Form", "MSA")


class IndexError_(Exception):
    """Raised when a corpus cannot be indexed. Never falls back to a partial index."""


class Selection(object):
    """What a pass should load, and whether narrowing actually applied.

    `fallback=True` means: load the WHOLE corpus. It is not an error and not an empty
    result. Callers must branch on `fallback` before using `sections`.
    """

    def __init__(self, corpus, sections, fallback, reason):
        self.corpus = corpus
        self.sections = sections
        self.fallback = fallback
        self.reason = reason

    def __repr__(self):
        return "<Selection %s %s (%s)>" % (
            self.corpus,
            "FULL CORPUS" if self.fallback else "%d section(s)" % len(self.sections),
            self.reason,
        )

    def as_dict(self):
        return {"corpus": self.corpus, "sections": list(self.sections),
                "fallback": self.fallback, "reason": self.reason}


def _read(name):
    path = os.path.join(REFS, name)
    if not os.path.isfile(path):
        raise IndexError_(
            "corpus %r is missing at %s. The index is derived from the corpora, so a "
            "missing corpus is a build failure, not an empty index." % (name, path))
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def _topic_for(heading):
    """Resolve a heading to a normalized topic tag, or None on a miss.

    Longest keyword first so 'limitation of liability' beats the bare 'liability', and
    'trade sanctions' is not shadowed by a shorter tag. Returning None is a legitimate
    outcome: the caller turns it into a full-corpus fallback.
    """
    low = heading.lower()
    best, best_len = None, 0
    for tag, words in TOPIC_KEYWORDS:
        for w in words:
            if w in low and len(w) > best_len:
                best, best_len = tag, len(w)
    return best


# ---------------------------------------------------------------------------------------
# playbook.md: topic-keyed, numeric label carried as a SECONDARY alias only
# ---------------------------------------------------------------------------------------

def build_playbook_index():
    text = _read("playbook.md")
    entries = []
    for line in text.splitlines():
        if not line.startswith("### "):
            continue
        heading = line[4:].strip()
        topic = _topic_for(heading)
        # The numeric label is an ALIAS. Multiple headings can carry the same number
        # (HS-2 cites §26 and the governing-law section IS §26), which is exactly why it
        # cannot be the key.
        aliases = re.findall(r"§\s*(\d+(?:-\d+)?)", heading)
        hard_stop = re.match(r"^(HS-\d+)\b", heading)
        entries.append({
            "heading": heading,
            "topic": topic,
            "aliases": aliases,
            "hard_stop": hard_stop.group(1) if hard_stop else None,
        })
    if not entries:
        raise IndexError_("playbook.md yielded no '### ' sections; the parser and the "
                          "document have diverged. Refusing to emit an empty index.")
    return entries


# ---------------------------------------------------------------------------------------
# vendor-tactics.md: the applicability matrix already in the file becomes the index
# ---------------------------------------------------------------------------------------

def build_vendor_tactics_index():
    """Parse the applicability matrix at vendor-tactics.md:276-289 into doc-type -> categories.

    Sourced from the existing table rather than invented, per the spec. The table is
    already authored, already maintained, and currently unused: the model re-reads all 12
    category definitions even for an Order Form the table says needs only 2.
    """
    text = _read("vendor-tactics.md")
    rows, header = [], None
    for line in text.splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if header is None:
            if cells and cells[0].lower() == "category":
                header = cells
            continue
        if set("".join(cells)) <= set("-: "):
            continue
        m = re.match(r"^(\d+)\.\s*(.+)$", cells[0])
        if not m:
            continue
        rows.append((int(m.group(1)), m.group(2).strip(), cells[1:]))

    if header is None or not rows:
        raise IndexError_(
            "could not locate the vendor-tactics applicability matrix. The index is "
            "derived from that table; refusing to guess which categories apply.")

    doc_cols = header[1:]
    index = {}
    for i, col in enumerate(doc_cols):
        applicable = []
        for num, name, cells in rows:
            val = cells[i] if i < len(cells) else "-"
            # "-" means not applicable. Anything else (a check, "Primary", or a
            # qualifier like "Rate card only") means the category applies, and the
            # qualifier is carried through rather than flattened away.
            if val in ("-", ""):
                continue
            applicable.append({"category": num, "name": name, "qualifier": val})
        index[col] = applicable
    if len(index) != len(DOC_TYPES):
        raise IndexError_(
            "the applicability matrix has %d document columns, expected %d (%s). The "
            "table shape changed; the index must be re-derived, not patched."
            % (len(index), len(DOC_TYPES), ", ".join(DOC_TYPES)))
    return index


def select_vendor_tactics(document_type):
    """Which vendor-tactics categories to load for a document type.

    On a miss (a novel instrument type not in the table) the fallback is the FULL set of
    12 categories, never a guessed subset.
    """
    index = build_vendor_tactics_index()
    for col, applicable in index.items():
        if col.strip().lower() == (document_type or "").strip().lower():
            return Selection("vendor-tactics.md",
                             [a["category"] for a in applicable],
                             False,
                             "matched document type %r in the applicability matrix" % col)
    return Selection(
        "vendor-tactics.md", [], True,
        "document type %r is not in the applicability matrix; loading all 12 categories "
        "rather than guessing a subset" % document_type)


# ---------------------------------------------------------------------------------------
# commercial-analysis.md: the full-vs-limited gate
# ---------------------------------------------------------------------------------------

_COMMERCIAL_FULL = ("order form", "sow", "statement of work", "work order")
_COMMERCIAL_NONE = ("cda", "dpa", "sla")


def select_commercial(document_type, has_pricing=None):
    """Resolve commercial-analysis.md:9-17's full / limited gate.

    MSAs are genuinely conditional on embedded pricing. When that is UNKNOWN we return the
    fuller branch, because under-reading a priced MSA loses findings and over-reading only
    costs tokens.
    """
    dt = (document_type or "").strip().lower()
    if any(k in dt for k in _COMMERCIAL_FULL):
        return Selection("commercial-analysis.md", ["full"], False,
                         "%s: commercial terms are core to the review" % document_type)
    if "msa" in dt:
        if has_pricing is None:
            return Selection("commercial-analysis.md", ["full"], False,
                             "MSA with UNKNOWN pricing: reading full, because "
                             "under-reading a priced MSA loses findings and over-reading "
                             "only costs tokens")
        return Selection("commercial-analysis.md", ["full" if has_pricing else "limited"],
                         False,
                         "MSA %s embedded pricing" % ("with" if has_pricing else "without"))
    if any(k in dt for k in _COMMERCIAL_NONE):
        return Selection("commercial-analysis.md", ["limited"], False,
                         "%s: commercial analysis not applicable, note any fee provisions"
                         % document_type)
    if "amendment" in dt:
        return Selection("commercial-analysis.md", ["full"], False,
                         "amendment: assess the financial impact of the modifications")
    return Selection("commercial-analysis.md", [], True,
                     "document type %r is not covered by the gate; loading the full "
                     "corpus" % document_type)


# ---------------------------------------------------------------------------------------
# playbook selection
# ---------------------------------------------------------------------------------------

def select_playbook(topics):
    """Which playbook sections to load for a set of Stage 0 clause topics.

    Hard Stop sections are ALWAYS included regardless of the topics requested. They are the
    six findings that may never be missed, and making their retrieval depend on Stage 0
    correctly tagging a clause would put the most consequential checks behind the least
    reliable step.
    """
    entries = build_playbook_index()
    wanted = set(t.strip().lower() for t in (topics or []) if t and t.strip())

    known = set(e["topic"] for e in entries if e["topic"])
    unknown = sorted(wanted - known)
    if unknown:
        return Selection(
            "playbook.md", [], True,
            "topic(s) %s could not be resolved to a playbook section; loading the full "
            "playbook rather than skipping the clause" % ", ".join(repr(u) for u in unknown))
    if not wanted:
        return Selection("playbook.md", [], True,
                         "no topics supplied; loading the full playbook")

    picked = [e["heading"] for e in entries
              if e["hard_stop"] or (e["topic"] and e["topic"] in wanted)]
    hs = sum(1 for e in entries if e["hard_stop"])
    return Selection("playbook.md", picked, False,
                     "%d topic(s) matched, plus all %d Hard Stop sections which load "
                     "unconditionally" % (len(wanted), hs))


def build_all():
    """Build every index. Raises rather than returning a partial one."""
    pb = build_playbook_index()
    vt = build_vendor_tactics_index()
    untagged = [e["heading"] for e in pb if not e["topic"]]
    return {
        "playbook": {"sections": len(pb),
                     "hard_stops": sum(1 for e in pb if e["hard_stop"]),
                     "untagged": untagged},
        "vendor_tactics": {dt: [a["category"] for a in v] for dt, v in vt.items()},
    }


def main(argv):
    try:
        summary = build_all()
    except IndexError_ as e:
        print("REFUSED: %s" % e, file=sys.stderr)
        return 2
    print(json.dumps(summary, indent=2, sort_keys=True))
    if summary["playbook"]["untagged"]:
        print("\nNOTE: %d playbook section(s) resolved to no topic tag. Any request "
              "touching them falls back to the full playbook, which is correct but "
              "loses the narrowing:" % len(summary["playbook"]["untagged"]),
              file=sys.stderr)
        for h in summary["playbook"]["untagged"]:
            print("  - %s" % h, file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
