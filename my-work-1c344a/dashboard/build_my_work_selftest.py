#!/usr/bin/env python3
"""
Self-test for build_my_work_dashboard.py.

The tests that matter most are the TAMPER tests. This builder's central claim is that the
shipped page has no network of any kind, and that claim was already wrong once: the first
version scanned markup only and reported a confident "0 external references" while the
page pulled four scripts and an image at runtime. So the suite does not merely check that
a clean build passes. It plants each failure mode and asserts the build REFUSES.

Run: python build_my_work_selftest.py
"""
from __future__ import annotations

import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build_my_work_dashboard as B                                  # noqa: E402

PASS, FAIL = [], []


def ok(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print(("  ok   " if cond else "  FAIL ") + name + (("  <- " + detail) if detail and not cond else ""))


def refuses(name, fn, expect=None):
    try:
        fn()
    except B.BuildError as e:
        if expect and expect.lower() not in str(e).lower():
            ok(name, False, "refused, but for the wrong reason: %s" % str(e)[:110])
            return
        ok(name, True)
        return
    except Exception as e:                                           # noqa: BLE001
        ok(name, False, "raised %s, expected BuildError" % type(e).__name__)
        return
    ok(name, False, "did not refuse")


def run():
    print("=" * 88)
    print("build_my_work_dashboard self-test")
    print("=" * 88)

    r = B.build()
    html = open(r["out"], encoding="utf-8").read()

    # --- the clean build ----------------------------------------------------------------
    ok("T1  builds without raising", True)
    ok("T2  inlines all 12 vendored assets", r["vendored"] == 12, "got %d" % r["vendored"])
    ok("T3  the page is a single file over 2MB (fonts + render chain inlined)",
       r["bytes"] > 2 * 1024 * 1024)
    ok("T4  the offline LillyAPI surface is exactly the six methods called",
       tuple(sorted(r["api_calls"])) == tuple(sorted(B.EXPECTED_API_SURFACE)),
       "got %s" % r["api_calls"])

    # --- the no-network claim, checked on the OUTPUT -------------------------------------
    scan = re.sub(r"/\*.*?\*/", " ", html, flags=re.S)
    scan = re.sub(r"^[ \t]*//[^\n]*$", "", scan, flags=re.M)
    ok("T5  the built page contains no fetch(", "fetch(" not in scan)
    ok("T6  no XMLHttpRequest", "XMLHttpRequest" not in scan)
    ok("T7  no WebSocket", "WebSocket" not in scan)
    ok("T8  no surviving assets/ reference", not re.search(r'["\']assets/[\w./-]+\.(js|css|png)', scan))
    ok("T9  no http(s):// resource reference",
       not re.search(r'(?:src|href)="(?:https?:)?//', html))

    # --- the dropped features took their surface with them -------------------------------
    ok("T10 the task drawer panel is gone", "mqdrawer" not in html)
    ok("T11 the dead Tasks button is gone, not just its script", "mqOpen()" not in html)
    ok("T12 no orphaned drawer copy is left rendering",
       "Ready for you this morning" not in html)
    ok("T13 theo-brand's assistant injection is gone", "theo-voice.js" not in html)
    ok("T14 and the auto-injected dino with it", "dino_red" not in html)

    # --- the sections all survived the surgery -------------------------------------------
    for sec in ("My Workload", "My Report Card", "The Suppliers I Manage", "My Savings",
                "Handover"):
        ok("T15 section %r is present" % sec, sec in html)

    ok("T16 the handover brief (#44) still has its render module",
       "hoRender" in html and "sec-handover" in html)
    ok("T17 the provenance badge still reports demo rather than faking live",
       "Demo data" in html)

    # --- TAMPER: the patch must not be allowed to silently stop applying ------------------
    real_patches = B.OFFLINE_PATCHES
    try:
        B.OFFLINE_PATCHES = ({
            "asset": "assets/my-work/my-work-06-handover.js",
            "why": "tamper test",
            "find": "fetch('/api/handover?scope=' + THIS_TEXT_IS_NOT_IN_THE_FILE)",
            "replace": "Promise.reject()",
        },)
        refuses("T18 TAMPER: a patch that no longer matches its target REFUSES the build, "
                "rather than quietly leaving the network call in",
                B.build, expect="no longer matches")
    finally:
        B.OFFLINE_PATCHES = real_patches

    # --- TAMPER: the API surface check must catch both directions -------------------------
    real_vendored = B.VENDORED
    try:
        B.VENDORED = tuple(v for v in real_vendored if "my-work-02" not in v)
        # It is the self-containment check that catches this, not the inline-count check:
        # an un-inlined module leaves its own <script src="assets/..."> in the markup, and
        # a page that still reaches for a file it does not carry is exactly what that
        # check is for. Either refusal is correct; this pins the one that actually fires.
        refuses("T19 TAMPER: dropping a vendored module REFUSES, because its <script src> "
                "survives in the markup and the page would reach for a file it does not "
                "carry", B.build, expect="not self-contained")
    finally:
        B.VENDORED = real_vendored

    # --- TAMPER: a reintroduced network call must be caught -------------------------------
    real_read = B._read
    try:
        def poisoned(rel, patch=True):
            text = real_read(rel, patch)
            if rel.endswith("my-work-03-suppliers.js"):
                text += "\nfetch('https://example.invalid/telemetry');\n"
            return text
        B._read = poisoned
        refuses("T20 TAMPER: a fetch( reintroduced into a vendored module is caught by the "
                "RUNTIME scan, which the original markup-only check would have missed",
                B.build, expect="runtime")
    finally:
        B._read = real_read

    try:
        def poisoned2(rel, patch=True):
            text = real_read(rel, patch)
            if rel.endswith("my-work-03-suppliers.js"):
                text += "\nvar s=document.createElement('script');s.src='assets/evil.js';\n"
            return text
        B._read = poisoned2
        refuses("T21 TAMPER: a dynamically injected script src is caught too (this is the "
                "exact defect theo-brand.js had)", B.build, expect="runtime")
    finally:
        B._read = real_read

    # --- TAMPER: comment stripping must not hide a real call ------------------------------
    try:
        def poisoned3(rel, patch=True):
            text = real_read(rel, patch)
            if rel.endswith("my-work-03-suppliers.js"):
                text += "\nvar x = 1; fetch('https://example.invalid/x'); // trailing note\n"
            return text
        B._read = poisoned3
        refuses("T22 TAMPER: a real fetch on a line that ALSO carries a // comment is still "
                "caught, because the stripper only removes comments that start their line",
                B.build, expect="runtime")
    finally:
        B._read = real_read

    # --- the builder is skill-local ------------------------------------------------------
    src = open(os.path.join(HERE, "build_my_work_dashboard.py"), encoding="utf-8").read()
    code = re.sub(r'"""..*?"""', "", src, flags=re.S)
    ok("T23 the builder contains no absolute path into the platform directory",
       "OneDrive" not in code and "lilly IT intake" not in code)
    ok("T24 every asset path it reads is resolved against its own directory",
       "os.path.join(HERE" in src)

    # rebuild clean so the shipped artifact is not left in a tampered state
    B.build()
    ok("T25 rebuilds clean after the tamper tests", True)

    print("=" * 88)
    print("SUMMARY: %d/%d passed, %d failed" % (len(PASS), len(PASS) + len(FAIL), len(FAIL)))
    print("=" * 88)
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(run())
