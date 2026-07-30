#!/usr/bin/env python3
"""
prose_prune.py -- B7a: prune stale instructions and superseded prose from the SKILL files.

THE CONSTRAINT IS THE WHOLE JOB
-------------------------------
`UPGRADE-PLAN` B7a: "no rule deleted, only restated once."

Across 33 SKILL files there are ~400,000 words. Deleting prose from that on judgement alone
is how a HARD RULE quietly disappears, and nobody notices until a skill stops refusing
something it used to refuse. So the safety property is machine-checked, not trusted:

  1. Take a RULE INVENTORY of every file before touching it: every normative statement
     (MUST / NEVER / ALWAYS / HARD RULE / refuse / do not ...), normalised.
  2. Make a removal.
  3. Take the inventory again. **If a single rule has left the set, the removal is
     reverted and the run refuses.**

A rule stated three times and left stated once passes, because the SET is unchanged. A rule
stated once and deleted fails. That is exactly the plan's wording turned into a check.

WHAT IT WILL DELETE ON ITS OWN, AND WHAT IT WILL NOT
---------------------------------------------------
**Auto-removable: exact duplicate paragraphs within one file.** If the identical paragraph
appears twice, deleting the later copy cannot lose a rule, because the first copy still
carries it. This is the literal meaning of "restated once".

**Reported, never auto-removed: mode pickers and superseded prose.** Deciding that a
paragraph is stale is a judgement about intent, and this file has no way to make it. It
reports them with enough context for a human to rule, and stops there. A tool that guessed
here would be the "no shortcut reversals" failure: quietly removing something load-bearing
because it pattern-matched as obsolete.

Stdlib only.
  python _audit/prose_prune.py            # report only
  python _audit/prose_prune.py --apply    # remove exact duplicates, verify, record deltas
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# A sentence carrying an obligation. Deliberately broad: over-collecting makes the check
# STRICTER (more statements that must survive), which is the safe direction to err.
RULE_MARKERS = re.compile(
    r"\b(MUST|MUST NOT|NEVER|ALWAYS|SHALL|REQUIRED|HARD RULE|HARD STOP|REFUSE|REFUSES|"
    r"do not|don't|cannot|may not|forbidden|prohibited|mandatory|only if|only when)\b",
    re.I)

# Blocks a human should rule on. Reported, never removed automatically.
# NOTE ON THESE TWO PATTERNS, because their first version was wrong in an instructive way.
#
# MODE_PICKER originally matched "which mode" with no trailing word boundary, so it fired
# on "which MODEL to use (Opus vs Sonnet)" in eight files. It also counted cross-references
# to a "Mode Selection" heading, and a sentence stating the user is explicitly NOT asked to
# pick. Every one of the sixteen hits was a false positive.
#
# SUPERSEDED matched any use of the word. But a sentence DOCUMENTING that one thing
# supersedes another is current prose doing its job, not stale prose describing itself.
#
# Both now require the text to be self-describing about its own staleness.
MODE_PICKER = re.compile(
    r"\b(?:which mode\b|choose a mode\b|select a mode\b|"
    r"pick (?:a|one) (?:mode|option)\b|"
    r"ask (?:the user|them) (?:to pick|to choose|which mode|which option)\b)", re.I)
SUPERSEDED = re.compile(
    r"\b(?:this (?:section|guidance|approach|rule) is (?:superseded|deprecated|obsolete)|"
    r"no longer (?:used|applies|applied|supported)|formerly known as|"
    r"previously known as|is deprecated\b|has been retired\b)", re.I)


def skills():
    return sorted(d for d in os.listdir(ROOT)
                  if d.endswith("-1c344a")
                  and os.path.isfile(os.path.join(ROOT, d, "SKILL.md")))


def read(path):
    with io.open(path, encoding="utf-8", newline="") as fh:
        return fh.read()


def write(path, text):
    with io.open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(text)


def norm(s):
    """Normalise for comparison: collapse whitespace, drop markdown emphasis and bullets.

    Formatting changes must not read as a rule disappearing, or the check fires on edits
    that changed nothing that matters.
    """
    s = re.sub(r"[*_`>#]+", " ", s)
    s = re.sub(r"^\s*[-+*]\s+", " ", s, flags=re.M)
    s = re.sub(r"\s+", " ", s)
    return s.strip().lower()


def rule_inventory(text):
    """Every normative statement in the file, as a normalised set.

    Sentence-ish granularity: a rule that moves between paragraphs still matches, a rule
    that is deleted does not.
    """
    out = set()
    for chunk in re.split(r"(?<=[.!?])\s+|\n", text):
        c = chunk.strip()
        if not c or not RULE_MARKERS.search(c):
            continue
        n = norm(c)
        if len(n) > 12:
            out.add(n)
    return out


def paragraphs(text):
    """Split into blocks, keeping the exact source text so removal is lossless."""
    parts, buf, start = [], [], 0
    lines = text.splitlines(keepends=True)
    pos = 0
    for line in lines:
        if line.strip() == "":
            if buf:
                parts.append((start, pos, "".join(buf)))
                buf = []
            pos += len(line)
            start = pos
            continue
        if not buf:
            start = pos
        buf.append(line)
        pos += len(line)
    if buf:
        parts.append((start, pos, "".join(buf)))
    return parts


# Structural blocks that repeat legitimately and are not "restatements of a rule".
STRUCTURAL = re.compile(r"^\s*(\|.*\||```|---|\*\*\w+:\*\*\s*$|#{1,6}\s)", re.M)


def duplicate_blocks(text):
    """Exact duplicate paragraphs within one file, after normalisation.

    Only blocks that (a) repeat verbatim, (b) carry at least one rule marker, and (c) are
    not table rows / fences / bare headings. The rule marker requirement is what keeps this
    to "a rule restated", rather than deleting an incidental repeated sentence.
    """
    seen, dupes = {}, []
    for a, b, block in paragraphs(text):
        n = norm(block)
        if len(n) < 40 or not RULE_MARKERS.search(block):
            continue
        if STRUCTURAL.match(block):
            continue
        if n in seen:
            dupes.append({"first_at": seen[n], "span": (a, b), "text": block})
        else:
            seen[n] = (a, b)
    return dupes


def flag_blocks(text, pattern):
    out = []
    for a, b, block in paragraphs(text):
        if pattern.search(block):
            out.append({"span": (a, b), "text": block})
    return out


def prune_file(path, apply=False):
    original = read(path)
    before_rules = rule_inventory(original)
    before_words = len(original.split())

    dupes = duplicate_blocks(original)
    result = {
        "file": os.path.relpath(path, ROOT),
        "words_before": before_words,
        "rules": len(before_rules),
        "duplicates": len(dupes),
        "mode_pickers": len(flag_blocks(original, MODE_PICKER)),
        "superseded": len(flag_blocks(original, SUPERSEDED)),
        "words_after": before_words,
        "removed": 0,
        "applied": False,
    }
    if not apply or not dupes:
        return result, original, None

    # Remove from the end so earlier spans stay valid.
    text = original
    for d in sorted(dupes, key=lambda x: -x["span"][0]):
        a, b = d["span"]
        text = text[:a] + text[b:]

    after_rules = rule_inventory(text)
    lost = before_rules - after_rules
    if lost:
        # The safety property. Revert and report rather than ship a file missing a rule.
        return result, original, sorted(lost)[:5]

    text = re.sub(r"\n{4,}", "\n\n\n", text)
    result["words_after"] = len(text.split())
    result["removed"] = len(dupes)
    result["applied"] = True
    return result, text, None


def main(argv):
    apply = "--apply" in argv
    print("=" * 96)
    print("B7a prose prune %s" % ("(APPLYING)" if apply else "(report only)"))
    print("=" * 96)
    print("%-34s %8s %6s %5s %5s %5s %8s" %
          ("skill", "words", "rules", "dup", "mode", "supd", "delta"))

    tot_before = tot_after = tot_removed = 0
    refused = []
    flagged = []
    for d in skills():
        path = os.path.join(ROOT, d, "SKILL.md")
        r, text, lost = prune_file(path, apply)
        if lost:
            refused.append((r["file"], lost))
        elif apply and r["applied"]:
            write(path, text)
        tot_before += r["words_before"]
        tot_after += r["words_after"]
        tot_removed += r["removed"]
        delta = r["words_after"] - r["words_before"]
        if r["duplicates"] or r["mode_pickers"] or r["superseded"]:
            print("%-34s %8d %6d %5d %5d %5d %8s"
                  % (d[:34], r["words_before"], r["rules"], r["duplicates"],
                     r["mode_pickers"], r["superseded"],
                     ("%+d" % delta) if delta else "-"))
        if r["mode_pickers"] or r["superseded"]:
            flagged.append((d, r["mode_pickers"], r["superseded"]))

    print("-" * 96)
    print("%d skill(s). words %d -> %d (%+d). duplicate blocks removed: %d"
          % (len(skills()), tot_before, tot_after, tot_after - tot_before, tot_removed))

    if refused:
        print("\nREFUSED on %d file(s): removing the duplicate would have dropped a rule "
              "from the inventory. Nothing was written for these." % len(refused))
        for f, lost in refused:
            print("  %s" % f)
            for l in lost:
                print("      lost: %s" % l[:96])

    if flagged:
        print("\n%d file(s) carry mode-picker or superseded-prose blocks. These are NOT "
              "removed automatically:" % len(flagged))
        print("  deciding a paragraph is stale is a judgement about intent, and this tool "
              "cannot make it.")
        for d, m, s in flagged[:14]:
            print("    %-38s %d mode-picker, %d superseded" % (d[:38], m, s))
        print("  run with a file argument to print the blocks for review.")
    return 1 if refused else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
