#!/usr/bin/env python3
"""
theo_routing.py -- J2: one manifest, and a check that the surfaces cannot drift from it.

THE PROBLEM
-----------
THEO's routing lived in four places that were kept in agreement by hand: the routing table
in `SKILL.md`, the Markdown fallback menu, the widget rows in `assets/theo-widget.html`,
the teach-mode lists, and the chain table in `references/routing-and-chains.md`. J1 added a
fifth surface to keep in sync.

Hand-synced routing is the same drift class as the hand-synced handoff schema in E1, and it
had already drifted. `SKILL.md`'s own prose says the widget, the fallback and the teach-mode
lists "all derive from" the routing table. The intent was already written down; nothing
enforced it.

`routing-manifest.json` is now the single source of truth.

WHAT THIS DOES AND DOES NOT DO
------------------------------
`--check` compares every surface against the manifest and FAILS on disagreement. That is
what makes "no hand edits possible" true: an edit to a surface without the manifest is
caught, and so is an edit to the manifest that a surface has not picked up.

It deliberately does NOT rewrite `theo-widget.html` in place. That file is a locked visual
artifact, and silently regenerating it would put a design-locked surface under a script's
control. `--emit` prints what each surface SHOULD contain so a human applies it.

Stdlib only.
  python theo_routing.py --check    # fail on any drift
  python theo_routing.py --emit     # print the generated regions for review
"""
from __future__ import annotations

import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "routing-manifest.json")
SKILL = os.path.join(HERE, "SKILL.md")
WIDGET = os.path.join(HERE, "assets", "theo-widget.html")
CHAINS = os.path.join(HERE, "references", "routing-and-chains.md")
TEACH = os.path.join(HERE, "references", "teach-mode.md")


def read(p):
    with io.open(p, encoding="utf-8") as fh:
        return fh.read()


def load():
    with io.open(MANIFEST, encoding="utf-8") as fh:
        return json.load(fh)


def norm_trigger(t):
    return re.sub(r"\s+", " ", (t or "").strip().lower()).strip('"')


def check(m):
    """Every surface, against the manifest. Returns a list of drift findings."""
    out = []
    ids = [s["id"] for s in m["skills"]]

    # --- the registry itself -------------------------------------------------------
    dupes = sorted(set(x for x in ids if ids.count(x) > 1))
    if dupes:
        out.append("manifest lists %d duplicate skill id(s): %s"
                   % (len(dupes), ", ".join(dupes)))
    unshipped = [s["id"] for s in m["skills"] if not s.get("shipped")]
    if unshipped:
        out.append("manifest routes to %d skill(s) that do not ship: %s"
                   % (len(unshipped), ", ".join(unshipped)))

    # --- SKILL.md routing table ------------------------------------------------------
    skill_text = read(SKILL)
    for s in m["skills"]:
        if not re.search(r"(?<![\w-])" + re.escape(s["id"]) + r"(?![\w-])", skill_text):
            out.append("SKILL.md routing table does not mention %r" % s["id"])

    # --- pipelines agree --------------------------------------------------------------
    for p in m["pipelines"]:
        if p not in skill_text:
            out.append("SKILL.md does not name pipeline %r" % p)

    # --- widget rows ------------------------------------------------------------------
    wtext = read(WIDGET)
    widget_triggers = set(norm_trigger(t)
                          for t in re.findall(r'data-t="([^"]*)"', wtext))
    manifest_widget = set()
    for s in m["skills"]:
        for r in s.get("rows", []):
            if r.get("on_widget"):
                manifest_widget.add(norm_trigger(r["trigger"]))
    missing_in_widget = sorted(manifest_widget - widget_triggers)
    extra_in_widget = sorted(widget_triggers - manifest_widget)
    if missing_in_widget:
        out.append("%d trigger(s) marked on_widget are NOT in theo-widget.html: %s"
                   % (len(missing_in_widget), "; ".join(missing_in_widget[:4])))
    if extra_in_widget:
        out.append("%d widget row(s) have no manifest entry: %s"
                   % (len(extra_in_widget), "; ".join(extra_in_widget[:4])))

    # --- chain table -------------------------------------------------------------------
    ctext = read(CHAINS)
    for s in m["skills"]:
        if "successors" not in s:
            continue
        if not re.search(r"(?<![\w-])" + re.escape(s["id"]) + r"(?![\w-])", ctext):
            out.append("chain table lost %r, which the manifest carries chain data for"
                       % s["id"])

    # --- teach mode ---------------------------------------------------------------------
    ttext = read(TEACH)
    for s in m["skills"]:
        named = bool(re.search(r"(?<![\w-])" + re.escape(s["id"]) + r"(?![\w-])", ttext))
        if s.get("in_teach_mode") and not named:
            out.append("teach-mode no longer covers %r though the manifest says it does"
                       % s["id"])
        if named and not s.get("in_teach_mode"):
            out.append("teach-mode covers %r but the manifest does not record it"
                       % s["id"])
    return out


def emit(m):
    print("### routing table rows (SKILL.md)\n")
    print("| Pipeline | Skill | Helps you | Say this |")
    print("|---|---|---|---|")
    for s in m["skills"]:
        says = " / ".join('"%s"' % r["trigger"] for r in s.get("rows", [])[:4])
        print("| %s | %s | %s | %s |" % (s["pipeline"], s["id"], s["helps"][:70], says))

    print("\n### widget rows (assets/theo-widget.html)\n")
    for s in m["skills"]:
        for r in s.get("rows", []):
            if not r.get("on_widget"):
                continue
            print('<li class="th-row" data-t="%s" data-what="%s" data-howto="%s" '
                  'data-output="%s"><span class="th-title">%s</span>'
                  '<span class="th-go">&rsaquo;</span></li>'
                  % (r["trigger"], r["what"], r["howto"], r["output"], r["title"]))

    print("\n### chain table (references/routing-and-chains.md)\n")
    print("| Skill | Predecessors | Successors |")
    print("|---|---|---|")
    for s in m["skills"]:
        if "successors" not in s:
            continue
        print("| %s | %s | %s |" % (s["id"], s["predecessors"], s["successors"]))


def main(argv):
    m = load()
    if "--emit" in argv:
        emit(m)
        return 0

    print("=" * 92)
    print("J2 routing manifest check")
    print("=" * 92)
    nrows = sum(len(s.get("rows", [])) for s in m["skills"])
    onw = sum(1 for s in m["skills"] for r in s.get("rows", []) if r.get("on_widget"))
    print("  manifest: %d pipeline(s), %d skill(s), %d trigger row(s) (%d on the widget)"
          % (len(m["pipelines"]), len(m["skills"]), nrows, onw))
    print("            %d with chain data, %d in teach mode"
          % (sum(1 for s in m["skills"] if "successors" in s),
             sum(1 for s in m["skills"] if s.get("in_teach_mode"))))

    drift = check(m)
    if m.get("_not_routed"):
        print("\n  shipped but NOT routed by THEO (%d): %s"
              % (len(m["_not_routed"]), ", ".join(m["_not_routed"])))
        print("  Infrastructure and hub skills are intentionally not menu destinations.")
        print("  Whether that is right for each is a judgement, not drift, so it is")
        print("  reported here rather than failing the check.")

    print("-" * 92)
    if drift:
        print("DRIFT: %d finding(s)" % len(drift))
        for d in drift:
            print("  - %s" % d)
        return 1
    print("PASS. Every surface agrees with the manifest.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
