"""
ship_manifest.py
What belongs in the shipped skills package, and what is repo-only dead weight.

Precursor to K1 (pre-packaging integrity sweep). Marc, 2026-07-29: "we will need
to assess what is necessary to ship the new skills package to all users, and what
can be stripped out ... I don't want to ship a package of skills that has a lot of
dead weight in it."

THIS SCRIPT DELETES NOTHING AND IS NOT ABLE TO.
-----------------------------------------------
Marc: "what I do not want to do quite yet is completely delete the old skills
files. I have other backup copies. But we will want to save them if these skills
end up having issues in realtime use."

So this CLASSIFIES and MEASURES. Stripping is a separate, deliberate, reviewed
step taken at packaging time against this manifest, and the repo keeps everything
until the new skills have proven themselves in real use.

    python ship_manifest.py            # the classification and the numbers
    python ship_manifest.py --json     # machine-readable, for a packaging step

Stdlib only. Read-only.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Directory names that are build trees, caches or superseded snapshots. Present
# inside a skill folder, each is dead weight in a shipped package: no SKILL.md
# instruction reaches them at runtime.
DEAD_WEIGHT_DIRS = {
    "__pycache__": "Python bytecode cache. Regenerated on demand, never read by a user.",
    "_platform_build": "Build tree that GENERATES the dashboard. The shipped artifact is "
                       "the built HTML; the builder is not needed to use the skill.",
    "_parts": "Pre-assembly fragments consumed by the builder, not at runtime.",
    "_mockups": "Design mockups.",
    "_SUPERSEDED_ENGINE_2026-07-27": "Superseded engine, retained in the repo by decision.",
    "isolated": "Isolation test scratch.",
}

DEAD_WEIGHT_FILES = {
    ".pyc": "compiled bytecode",
    "nonascii_check.txt": "one-off encoding check output",
}

# Superseded build artifacts: a shipped HTML that an OLDER build left behind, sitting
# beside the current one. Pinned to an exact sha256 so that if the file is ever rebuilt
# or replaced, this stops matching and the artifact ships rather than being silently
# stripped. Same discipline as kernel_manifest.KNOWN_EXCEPTIONS: the exception is keyed
# to the exact expected content, not to the filename.
SUPERSEDED_ARTIFACTS = {
    "deal-tab-1c344a/dashboard/deal-dashboard.html": (
        "f49166be74c9ec7893d1ff39c3c6d254ad3201bd36abd3eccfec51889cfdd684",
        "Superseded by deal-dashboard-v2.html, which IS this skill's builder default "
        "output (build_deal_dashboard.py:209 --out default) and whose hash matches the "
        "build the superseded marker verified. Neither file is referenced by SKILL.md; "
        "only v2 is reproducible from the builder.",
    ),
}


def kb(path):
    total = 0
    if os.path.isfile(path):
        return os.path.getsize(path) // 1024
    for dp, _dn, fn in os.walk(path):
        for f in fn:
            try:
                total += os.path.getsize(os.path.join(dp, f))
            except OSError:
                pass
    return total // 1024


# Skills that BUILD and PASS but are deliberately not shipped yet.
#
# This is data, not logic, because "why isn't this in the package?" must be answerable
# without reading code. A skill absent from a release with no recorded reason gets quietly
# re-added by the next person who notices it missing, which is how an unfinished feature
# reaches a user.
#
# These are not broken. They are not ready, which is a different thing and the distinction
# matters: nothing here should be "fixed" to make it ship.
HELD_BACK = {
    "my-work-1c344a":
        "Marc, 2026-07-30: the dashboard and feature are unfinished, and the data needed to "
        "make them worthwhile is not available yet. Shipping it would put a dashboard of "
        "empty panels in front of a user, which is a worse first impression than the "
        "feature not existing.",
    "theos-field-guide-1c344a":
        "Marc, 2026-07-30: not ready to ship. Held back with my-work.",
}


def classify():
    ship, repo_only, anomalies, held = [], [], [], []

    for name in sorted(os.listdir(ROOT)):
        p = os.path.join(ROOT, name)
        if not os.path.isdir(p):
            continue
        has_skill = os.path.isfile(os.path.join(p, "SKILL.md"))
        looks_installable = name.endswith("-1c344a")

        if has_skill and looks_installable and name in HELD_BACK:
            held.append(name)
        elif has_skill and looks_installable:
            ship.append(name)
        elif not looks_installable:
            repo_only.append((name, "no installable suffix; build/audit/docs tree"))
        else:
            # installable NAME but no SKILL.md: the interesting case
            anomalies.append(name)

    return ship, repo_only, anomalies, held


def dead_weight_in(skill):
    """Directories and files inside a shipping skill that a user never reaches."""
    base = os.path.join(ROOT, skill)
    found = []
    for dp, dn, fn in os.walk(base):
        for d in list(dn):
            if d in DEAD_WEIGHT_DIRS:
                full = os.path.join(dp, d)
                found.append((os.path.relpath(full, ROOT), kb(full),
                              DEAD_WEIGHT_DIRS[d]))
                dn.remove(d)
        for f in fn:
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            pin = SUPERSEDED_ARTIFACTS.get(rel)
            if pin is not None:
                want, why = pin
                got = hashlib.sha256(open(full, "rb").read()).hexdigest()
                if got == want:
                    found.append((rel, kb(full), why))
                # else: content changed since it was pinned. Do NOT strip it on the
                # strength of a stale pin; surface it so a human re-checks.
                else:
                    found.append((rel, 0, "PIN STALE, NOT counted as strippable: "
                                          f"expected {want[:12]}, found {got[:12]}. "
                                          "Re-verify before stripping."))
                continue
            for suffix, why in DEAD_WEIGHT_FILES.items():
                if f.endswith(suffix):
                    found.append((rel, kb(full), why))
    return found


def main(argv):
    ship, repo_only, anomalies, held = classify()

    payload = {"ship": [], "repo_only": [n for n, _ in repo_only],
               "anomalies": anomalies, "dead_weight": []}

    ship_kb = sum(kb(os.path.join(ROOT, s)) for s in ship)
    dead = []
    for s in ship:
        dead += [(s,) + d for d in dead_weight_in(s)]
    dead_kb = sum(d[2] for d in dead)

    if "--json" in argv:
        payload["ship"] = [{"skill": s, "kb": kb(os.path.join(ROOT, s))} for s in ship]
        payload["dead_weight"] = [{"skill": d[0], "path": d[1], "kb": d[2],
                                   "why": d[3]} for d in dead]
        payload["totals"] = {"ship_kb": ship_kb, "dead_weight_kb": dead_kb,
                             "ship_kb_after_strip": ship_kb - dead_kb}
        print(json.dumps(payload, indent=2))
        return 0

    if held:
        print("HELD BACK, deliberately not shipped (%d):" % len(held))
        for h in held:
            print("  %-34s %s" % (h, HELD_BACK[h][:70]))
        print()

    print("=" * 92)
    print("SHIP MANIFEST: what goes in the package, what stays in the repo")
    print("DELETES NOTHING. Classification and measurement only.")
    print("=" * 92)

    print(f"\nSHIPS ({len(ship)} skills, {ship_kb:,} KB as-is)")
    print("  a directory ships when it has BOTH an installable -1c344a name AND a SKILL.md")

    print(f"\nREPO-ONLY ({len(repo_only)} trees)")
    for n, why in repo_only:
        print(f"  {n:34} {kb(os.path.join(ROOT, n)):>8,} KB   {why}")

    if anomalies:
        print(f"\nANOMALY: installable NAME but no SKILL.md ({len(anomalies)})")
        for n in anomalies:
            print(f"  {n:34} {kb(os.path.join(ROOT, n)):>8,} KB")
            print(f"    A packaging step globbing '*-1c344a' WOULD ship this, and a user")
            print(f"    would receive a folder Claude cannot discover or invoke: no")
            print(f"    SKILL.md means no skill. Inert bytes. See the ruling in that")
            print(f"    directory's MAINTENANCE.md.")

    print(f"\nDEAD WEIGHT INSIDE SHIPPING SKILLS ({dead_kb:,} KB across {len(dead)} paths)")
    by_skill = {}
    for s, path, size, why in dead:
        by_skill.setdefault(s, []).append((path, size, why))
    for s in sorted(by_skill, key=lambda s: -sum(x[1] for x in by_skill[s])):
        tot = sum(x[1] for x in by_skill[s])
        print(f"\n  {s}  ({tot:,} KB)")
        for path, size, why in sorted(by_skill[s], key=lambda x: -x[1]):
            print(f"    {size:>7,} KB  {path}")
            print(f"               {why}")

    print("\n" + "=" * 92)
    print(f"package as-is ............. {ship_kb:,} KB")
    print(f"identified dead weight .... {dead_kb:,} KB  ({dead_kb * 100 // max(ship_kb,1)}%)")
    print(f"package after stripping ... {ship_kb - dead_kb:,} KB")
    print("=" * 92)
    print("\nNOTHING WAS DELETED. Stripping is a deliberate step at packaging time,")
    print("taken against this manifest. The repo keeps every file until the new")
    print("skills have proven themselves in real use.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
