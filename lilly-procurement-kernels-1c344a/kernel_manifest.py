"""
kernel_manifest.py
Lilly Procurement Skills - vendored-kernel drift detector

`numeric_kernel.py` is the shared source of truth, and consuming skills carry a
VERBATIM copy so each skill installs standalone (a skill cannot import from a
sibling skill that may not be installed). Verbatim copies drift. This script
makes that drift script-detectable instead of discoverable only by hand.

It was written because the drift was real. On 2026-07-29 the eleven vendored
copies fell into three distinct file hashes. Diffing them by hand showed the
CODE bodies were byte-identical and only the vendor-date header differed, so the
drift was benign that day. Nothing would have said so if it had not been.

Usage, from anywhere inside the suite directory:

    python lilly-procurement-kernels-1c344a/kernel_manifest.py            # check
    python lilly-procurement-kernels-1c344a/kernel_manifest.py --write    # refresh

Exit codes: 0 all copies match, 1 drift detected, 2 the source itself is missing.
A non-zero exit is the point: this is meant to be runnable as a pre-commit or CI
check, not read as a report.

Stdlib only, same constraint as the kernel itself.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys

SOURCE_SKILL = "lilly-procurement-kernels-1c344a"
KERNEL_FILENAME = "numeric_kernel.py"

# Additional vendored modules under the same discipline. provenance.py (H4/G13b) is
# vendored into every skill that validates per-fact provenance, and it drifted within
# minutes of being introduced: category-strategy received a copy made before
# validate_rows() existed. One shared module means one drift problem, so it is tracked
# here rather than trusted to whoever remembers to re-copy.
EXTRA_VENDORED = ("provenance.py", "panel_contract.py", "journey_state.py")
MANIFEST_FILENAME = "kernel_manifest.json"

# Copies that are KNOWINGLY behind the source, with the reason. These report as
# HELD rather than DRIFT and do not fail the check.
#
# This list is a liability, not a feature. Every entry is a skill running older
# arithmetic than the rest of the suite, and the reason has to be a real one with
# an owner. A check that cries wolf on a known exception gets ignored, and then
# it stops catching the unknown ones, which is the entire point of it.
KNOWN_EXCEPTIONS = {
    # value = (expected body sha256, reason). The hash is compared EXACTLY, so a
    # known-stale copy stays green only while it is stale IN THE KNOWN WAY.
    #
    # Keying on the skill name alone would suppress ANY mismatch for that skill,
    # which means a corrupted or hand-edited copy would also pass. The whole point
    # of this script is to catch a copy nobody meant to change, so an exception
    # that hides exactly that is worse than no exception at all.
    "lilly-contract-review-1c344a": (
        "12b87c6e6a485ef6fc26e55699ea56414e08f2dbc77d8cee2e8ca3a2e2807d33",
        "HELD per PLATFORM-CONSOLIDATION-TRACKER.md:172. Frozen at the pre-2026-07-29 "
        "kernel (before the SCORING, LEVELING, OUTCOME, CONCENTRATION and "
        "NEGOTIATION-METRICS faces landed). Re-vendor as part of the F1 rewire once "
        "the hold lifts, not before. Any OTHER hash here is unexplained drift in a "
        "held file and fails.",
    ),
}


def code_body(text: str) -> str:
    """Return the kernel's code body, excluding any vendor-header comments.

    A vendored copy prepends one or more `#` comment lines (the vendor date and,
    by convention, a per-skill call manifest) ahead of the module docstring. The
    source has none. Comparing whole files therefore reports drift on every copy
    forever, which trains a reader to ignore the check.

    The body is defined as everything from the module docstring's opening triple
    quote onward. That rule does not depend on the header's exact wording, which
    is deliberate: the header is prose and will be edited.
    """
    idx = text.find('"""')
    if idx == -1:
        raise ValueError("no module docstring found; this does not look like the kernel")
    return text[idx:]


def sha256_body(path: str) -> str:
    with open(path, "r", encoding="utf-8", newline="") as fh:
        body = code_body(fh.read())
    # Normalize line endings so a CRLF checkout does not read as drift. The
    # suite has already been bitten by mixed line endings in tracked files.
    body = body.replace("\r\n", "\n")
    return hashlib.sha256(body.encode("utf-8")).hexdigest()


def find_suite_root(start: str) -> str:
    """Walk up until a directory containing the source skill is found."""
    here = os.path.abspath(start)
    while True:
        if os.path.isdir(os.path.join(here, SOURCE_SKILL)):
            return here
        parent = os.path.dirname(here)
        if parent == here:
            raise SystemExit(
                f"could not locate {SOURCE_SKILL}/ above {start}. Run this from "
                "inside the suite directory."
            )
        here = parent


def collect(root: str):
    """Return (source_hash, {skill_dir: hash}) for every vendored copy found."""
    source_path = os.path.join(root, SOURCE_SKILL, KERNEL_FILENAME)
    if not os.path.isfile(source_path):
        print(f"FATAL: source kernel missing at {source_path}", file=sys.stderr)
        raise SystemExit(2)
    source_hash = sha256_body(source_path)

    copies = {}
    for name in sorted(os.listdir(root)):
        skill_dir = os.path.join(root, name)
        if not os.path.isdir(skill_dir) or name == SOURCE_SKILL:
            continue
        candidate = os.path.join(skill_dir, KERNEL_FILENAME)
        if os.path.isfile(candidate):
            copies[name] = sha256_body(candidate)
    return source_hash, copies


def collect_extra(root: str):
    """Same drift check for every module in EXTRA_VENDORED.

    Returns {filename: (source_hash, {skill: hash})}. Kept separate from collect() so the
    kernel's own HELD exception cannot accidentally apply to another module.
    """
    out = {}
    for fname in EXTRA_VENDORED:
        src = os.path.join(root, SOURCE_SKILL, fname)
        if not os.path.isfile(src):
            continue
        shash = sha256_body(src)
        copies = {}
        for name in sorted(os.listdir(root)):
            d = os.path.join(root, name)
            if not os.path.isdir(d) or name == SOURCE_SKILL:
                continue
            cand = os.path.join(d, fname)
            if os.path.isfile(cand):
                copies[name] = sha256_body(cand)
        out[fname] = (shash, copies)
    return out


def report_extra(root: str) -> int:
    failures = 0
    for fname, (shash, copies) in sorted(collect_extra(root).items()):
        drift = [k for k, v in copies.items() if v != shash]
        print(chr(10) + f"{fname}: {len(copies) - len(drift)} of {len(copies)} "
              f"vendored copies match")
        for k in drift:
            print(f"  DRIFT: {k}/{fname}")
            failures += 1
    return failures


def main(argv) -> int:
    write = "--write" in argv
    root = find_suite_root(os.path.dirname(os.path.abspath(__file__)))
    source_hash, copies = collect(root)
    manifest_path = os.path.join(root, SOURCE_SKILL, MANIFEST_FILENAME)

    print(f"source: {SOURCE_SKILL}/{KERNEL_FILENAME}")
    print(f"body sha256: {source_hash}")
    print(f"vendored copies found: {len(copies)}")
    print()

    def _pinned(name, h):
        exc = KNOWN_EXCEPTIONS.get(name)
        return exc is not None and h == exc[0]

    drifted = [name for name, h in copies.items()
               if h != source_hash and not _pinned(name, h)]
    held = [name for name, h in copies.items()
            if h != source_hash and _pinned(name, h)]

    for name in sorted(copies):
        if copies[name] == source_hash:
            status = "OK    "
        elif _pinned(name, copies[name]):
            status = "HELD  "
        else:
            status = "DRIFT "
        print(f"  [{status}] {name}")
        if copies[name] != source_hash:
            print(f"            expected {source_hash[:16]}, got {copies[name][:16]}")
            if _pinned(name, copies[name]):
                print(f"            known exception: {KNOWN_EXCEPTIONS[name][1]}")
            elif name in KNOWN_EXCEPTIONS:
                print(f"            UNEXPECTED: {name} has an exception entry but its "
                      f"hash does not match the pinned one. This is drift in a HELD "
                      f"file and is NOT excused.")

    if write:
        with open(manifest_path, "w", encoding="utf-8", newline="\n") as fh:
            json.dump({
                "source": f"{SOURCE_SKILL}/{KERNEL_FILENAME}",
                "body_sha256": source_hash,
                "note": ("Hash covers the code body only, from the module "
                         "docstring onward, so per-skill vendor-header comments "
                         "do not read as drift. Line endings normalized to LF. "
                         "Refresh with kernel_manifest.py --write after any "
                         "kernel change, and re-vendor every consuming copy."),
                "vendored_copies": {k: copies[k] for k in sorted(copies)},
            }, fh, indent=2)
            fh.write("\n")
        print(f"\nwrote {manifest_path}")

    print()
    if held:
        print(f"HELD (known, not a failure): {', '.join(sorted(held))}")
    if drifted:
        print(f"RESULT: DRIFT in {len(drifted)} of {len(copies)} copies: "
              f"{', '.join(sorted(drifted))}")
        print("Re-vendor from the source, or add a KNOWN_EXCEPTIONS entry with "
              "a real reason and an owner if the divergence is deliberate.")
        return 1
    print(f"RESULT: {len(copies) - len(held)} of {len(copies)} vendored copies "
          f"match the source, {len(held)} knowingly held. No unexplained drift.")
    extra_failures = report_extra(root)
    if extra_failures:
        print(chr(10) + f"RESULT: DRIFT in {extra_failures} extra vendored "
              f"copy(ies). Re-vendor from the source.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
