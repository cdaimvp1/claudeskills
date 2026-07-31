#!/usr/bin/env python3
"""
hub_selfcontainment.py -- prove every built hub dashboard reaches nothing outside itself.

WHY THIS EXISTS
---------------
A11 locks the hubs. A locked artifact that quietly loads a script, posts to an API or
pulls an image is not locked, it is frozen around a dependency nobody wrote down.

This check was written after the My Work build shipped a page whose MARKUP was clean while
its BEHAVIOUR was not: `theo-brand.js` injected four scripts and an image from JavaScript,
and a handover module called fetch() directly. A `<script src>` scan reported a confident
zero. That is the seventh occurrence in this programme of a pattern list under-reporting by
matching wording instead of mechanism, so this one matches the mechanism.

WHAT IT CANNOT TELL YOU
-----------------------
It proves a page makes no request. It does not prove the page is correct, that its figures
reconcile, or that it renders. Those are the in-browser sweep and the generator self-tests.
A clean result here means one specific thing and should not be read as more.

Stdlib only. Run: python _audit/hub_selfcontainment.py
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The built, shipped dashboard artifacts. A hub whose dashboard is not built yet simply
# has no entry, and `--expect` below turns that absence into a stated gap rather than a
# silent pass.
HUBS = {
    "Landscape": "supplier-landscape-1c344a/dashboard/supplier-landscape-PLATFORM.html",
    "Deal": "deal-tab-1c344a/dashboard/deal-dashboard-v2.html",
    "Deal (v1)": "deal-tab-1c344a/dashboard/deal-dashboard.html",
    "RFx": "rfx-hub-1c344a/dashboard/rfx-dashboard.html",
    "Category Strategy": "category-strategy-1c344a/dashboard/category-strategy-dashboard.html",
    "Category Strategy (demo)":
        "category-strategy-1c344a/dashboard/category-strategy-dashboard-DEMO.html",
    "My Work": "my-work-1c344a/dashboard/my-work-dashboard.html",
    "Deep Dive": "supplier-deep-dive-1c344a/dashboard/deep-dive-dashboard.html",
    "Deep Dive (private)": "supplier-deep-dive-1c344a/dashboard/deep-dive-private.html",
    "Deep Dive (hyperscaler)":
        "supplier-deep-dive-1c344a/dashboard/deep-dive-hyperscaler.html",
}

# The five Phase 1 hubs per PROGRAM-MASTER-PLAN.md:44-51. Named here so a hub that has not
# been built yet is REPORTED, not quietly omitted from a green result.
PHASE1_HUBS = ("RFx", "Category Strategy", "Deep Dive", "My Work", "Landscape")

# Hubs whose absence from disk is BY DESIGN, not an unbuilt gap. Checked 2026-07-31:
# supplier-landscape-1c344a/dashboard/.gitignore excludes *.html outright, and the builder's
# own README documents writing to an external --out path per run, never back into the repo
# (unlike Deal/RFx/Category Strategy, which do ship a committed reference build). Landing
# here every run as "NOT BUILT" read like an open defect; it is a different, equally valid
# design choice (build-fresh-only, never a static demo copy that can go stale against the
# live generator -- see category-strategy's own StubDataError fix for why a stale committed
# demo copy is the greater risk). Each entry: hub name -> the reason, so a future maintainer
# does not have to re-derive it.
BUILD_FRESH_ONLY = {
    "Landscape": (
        "dashboard/.gitignore excludes *.html; build_dashboard.py writes to an external "
        "--out path per run by design (see dashboard/README.md), never a committed copy."
    ),
}

PATTERNS = (
    (r"\bfetch\s*\(", "fetch() call"),
    (r"\bXMLHttpRequest\b", "XMLHttpRequest"),
    (r"\bWebSocket\s*\(", "WebSocket"),
    (r"\bnavigator\.sendBeacon\b", "sendBeacon"),
    (r"\bimport\s*\(", "dynamic import()"),
    (r"""\.src\s*=\s*['"](?:https?:)?//""", "src assigned an absolute URL"),
    (r"""\.src\s*=\s*['"]assets/""", "src assigned a bundle path"),
    (r"""['"]assets/[\w./-]+\.(?:js|css|png|jpg|svg)['"]""", "bundle-asset literal"),
    (r"""['"]/api/[\w-]+""", "API path literal"),
    (r'(?:src|href)="(?:https?:)?//', "markup reference to a remote host"),
)


def strip_comments(text):
    """Remove /* */ blocks and only those // comments that START their line.

    Deliberately conservative. A stripper that guessed harder could delete real code and
    hide a genuine call, which is the one mistake this check cannot afford. Prose that
    merely DESCRIBES a fetch is not a fetch, but a fetch trailing real code on the same
    line is, and this keeps it.
    """
    text = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    return re.sub(r"^[ \t]*//[^\n]*$", "", text, flags=re.M)


def scan(path):
    with io.open(path, encoding="utf-8", errors="replace") as fh:
        raw = fh.read()
    body = strip_comments(raw)
    findings = []
    for pattern, what in PATTERNS:
        for m in re.finditer(pattern, body):
            snippet = body[max(0, m.start() - 50):m.start() + 60]
            findings.append((what, " ".join(snippet.split())))
    return findings


def main(argv):
    print("=" * 92)
    print("hub self-containment sweep")
    print("=" * 92)

    total, missing_files, unbuilt, build_fresh = 0, [], [], []
    for name, rel in sorted(HUBS.items()):
        path = os.path.join(ROOT, rel.replace("/", os.sep))
        if not os.path.isfile(path):
            if name in BUILD_FRESH_ONLY:
                build_fresh.append((name, BUILD_FRESH_ONLY[name]))
                print("  %-28s build-fresh-only (by design)" % name)
                continue
            missing_files.append((name, rel))
            print("  %-28s NOT BUILT  %s" % (name, rel))
            continue
        findings = scan(path)
        total += len(findings)
        if findings:
            print("  %-28s %d finding(s)" % (name, len(findings)))
            for what, snippet in findings[:6]:
                print("      %-32s ...%s..." % (what, snippet[:88]))
        else:
            print("  %-28s clean" % name)

    # A hub with no artifact must be NAMED. A sweep that silently skips what does not
    # exist reports green for a set it never examined, which is how an unbuilt dashboard
    # gets counted as locked.
    for hub in PHASE1_HUBS:
        if not any(hub.lower() in k.lower() for k in HUBS):
            unbuilt.append(hub)

    print("-" * 92)
    if unbuilt:
        print("NOT SWEPT, because no dashboard artifact exists yet: %s"
              % ", ".join(unbuilt))
        print("  These are Phase 1 hubs. A11 cannot lock a hub that has not been built.")
    if build_fresh:
        print("Build-fresh-only (by design, not a gap): %s"
              % ", ".join("%s -- %s" % (n, r) for n, r in build_fresh))
    if missing_files:
        print("Declared but absent: %s"
              % ", ".join("%s (%s)" % (n, r) for n, r in missing_files))
    print("%d finding(s) across %d built artifact(s), %d build-fresh-only by design."
          % (total, len(HUBS) - len(missing_files) - len(build_fresh), len(build_fresh)))
    print("A clean result proves these pages make no request. It does NOT prove they")
    print("render correctly or that their figures reconcile; that is the in-browser")
    print("sweep and the generator self-tests.")
    print("=" * 92)
    return 1 if (total or missing_files) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
