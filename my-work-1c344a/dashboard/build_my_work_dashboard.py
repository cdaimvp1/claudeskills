#!/usr/bin/env python3
"""
build_my_work_dashboard.py -- assemble the self-contained My Work dashboard.

WHAT THIS IS, AND WHAT IT DELIBERATELY IS NOT
---------------------------------------------
This is A7, built to the hub pattern the Landscape, Deal and RFx dashboards already
use: a skill-local builder that inlines SKILL-LOCAL vendored assets into one offline
HTML file.

It is NOT `_platform_build/build_my_work.py`. That script reads `my-work.html` and its
assets out of the live Theo platform directory on the Desktop at build time. Running it
here would mean a shipped skill whose build reaches into a separately-owned, actively
developed product. Every asset this builder touches lives inside this skill folder, so
the build works after the skill is copied anywhere, which is the whole install contract:
one folder, no siblings, no repo root.

The platform's `my-work.html` was used as the read-only SPECIFICATION and its render
chain vendored byte-identical. Vendored copies are drift-checkable; a rewrite would not
be.

THE ONE ASSET THAT IS NOT VENDORED
----------------------------------
`assets/lilly-api-offline.js` replaces the platform's `api.js`. api.js is 75KB and
carries a live `fetch()`. A skill runs from the local filesystem, so that fetch could
never succeed, and shipping it would put a dead egress path inside a procurement skill.
The shim reimplements exactly the six methods the my-work chain calls, against the
vendored seed. See that file's header for why the degradation is the platform's own
behaviour rather than something invented here.

WHAT IS DROPPED, AND WHY IT IS NOT SILENT
-----------------------------------------
`tasks-drawer.js` / `tasks-drawer.css` are dropped. The drawer is platform interaction
chrome that needs live task state a skill hub does not have. It has no markup coupling
in the shell (only the two asset references), so it removes cleanly. `DROPPED` records
it, `--report` prints it, and the built page carries a stated gap rather than an empty
drawer that looks broken.

Run:  python build_my_work_dashboard.py
      python build_my_work_dashboard.py --report
"""
from __future__ import annotations

import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
SHELL = os.path.join(HERE, "_parts", "my-work-shell.html")
OUT = os.path.join(HERE, "my-work-dashboard.html")

# Vendored byte-identical from the platform. Order is load-bearing: the my-work modules
# read PEOPLE / THEO / the seed at module-evaluation time, so the data layer must already
# exist. This mirrors the same eager-evaluation gotcha documented in the RFx and Deal
# builders.
VENDORED = (
    "assets/people.js",
    "assets/seed/_util.js",
    "assets/seed/demo.js",
    "assets/theo-data.js",
    "assets/demo-data.js",
    "assets/provenance.js",
    "assets/my-work/my-work-01-setup-metrics-sla.js",
    "assets/my-work/my-work-02-timeline.js",
    "assets/my-work/my-work-03-suppliers.js",
    "assets/my-work/my-work-04-reportcard.js",
    "assets/my-work/my-work-05-delegation-org-boot.js",
    "assets/my-work/my-work-06-handover.js",
)

# platform path -> skill-local replacement
SUBSTITUTED = {"assets/api.js": "assets/lilly-api-offline.js"}

# Dropped on purpose. The reason is carried with the entry so it reaches --report and
# the built page, instead of living only in this file's history.
DROPPED = {
    "assets/tasks-drawer.js":
        "task drawer needs live task state a skill hub does not have",
    "assets/tasks-drawer.css":
        "stylesheet for the dropped task drawer",
    "assets/theo-brand.js":
        "injects the Theo assistant surface (connectors, help, voice, mentions and the "
        "dino) at RUNTIME, which is platform product chrome, not My Work render",
}

# Markup that must go with the dropped task drawer.
#
# Dropping the drawer's JS and CSS is not enough on its own. The first build did exactly
# that and left the drawer's markup in the page: its contents rendered as unstyled text
# at the bottom of the document, and the topbar kept a "Tasks" button whose onclick
# called an undefined mqOpen(). A dead button is not a stated gap, it is a broken
# control. If a feature is dropped, its surface goes too.
MARKUP_REMOVED = (
    {
        "what": "task drawer panel and scrim",
        "pattern": r'<div class="mqscrim".*?</aside>',
        "flags": re.S,
    },
    {
        "what": "topbar Tasks button (its onclick target is dropped with the drawer)",
        "pattern": r'<button class="mqbtn".*?</button>',
        "flags": re.S,
    },
)

# Surgical, declared transforms applied to vendored source AT BUILD TIME.
#
# The vendored files on disk stay byte-identical to the platform so drift stays
# detectable. Patching here instead of editing them keeps both properties: the copy is
# still comparable to its source, and the shipped page still has no egress.
#
# Each patch pins its exact expected text. If the platform rewrites that line the patch
# stops matching and the build REFUSES. That is the point: a patch that silently stops
# applying would quietly restore a network call.
OFFLINE_PATCHES = (
    {
        "asset": "assets/my-work/my-work-06-handover.js",
        "why": "live GET /api/handover cannot resolve from a local file, and its silent "
               "catch would leave a 404 in the console while the seed renders anyway",
        "find": ("fetch('/api/handover?scope=' + scopeVal(), { credentials: "
                 "'same-origin', headers: { accept: 'application/json' } })"),
        "replace": ("Promise.reject(new Error('offline: this dashboard renders from "
                    "its vendored seed'))"),
    },
)

# The six methods the my-work chain actually calls. Asserted against the shim so the two
# cannot drift apart unnoticed.
EXPECTED_API_SURFACE = ("badge", "esc", "listProjects", "tasks", "tryLive", "workload")


class BuildError(Exception):
    """Raised instead of writing a partial or externally-dependent page."""


def _read(rel, patch=True):
    path = os.path.join(HERE, rel.replace("/", os.sep))
    if not os.path.isfile(path):
        raise BuildError(
            "vendored asset %r is missing at %s. This builder is skill-local by design; "
            "it will not fall back to the platform directory." % (rel, path))
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    if patch:
        for p in OFFLINE_PATCHES:
            if p["asset"] != rel:
                continue
            if p["find"] not in text:
                raise BuildError(
                    "offline patch for %s no longer matches its target. The vendored "
                    "source changed, so the patch would silently stop applying and the "
                    "page would regain a network call. Re-check the patch against the "
                    "new source. Reason the patch exists: %s" % (rel, p["why"]))
            if text.count(p["find"]) != 1:
                raise BuildError(
                    "offline patch for %s matches %d times, expected exactly 1. An "
                    "ambiguous patch is not a safe one." % (rel, text.count(p["find"])))
            text = text.replace(p["find"], p["replace"])
    return text


def _script(js):
    # A literal </script> inside a string would close the tag early. The platform's own
    # inliner does the same escape.
    return "<script>" + js.replace("</script>", "<\\/script>") + "</script>"


def check_api_surface():
    """The shim must provide exactly what the my-work chain calls: no more, no less.

    Fewer methods means a runtime TypeError in a panel. More means dead surface that
    invites someone to call it and get a stub. Both are caught here rather than in a
    browser.
    """
    shim = _read("assets/lilly-api-offline.js")
    provided = set(re.findall(r"window\.LillyAPI\.([A-Za-z_]+)\s*=", shim))
    provided.discard("__offlineSurface")

    called = set()
    for rel in VENDORED:
        if "/my-work/" not in rel:
            continue
        called |= set(re.findall(r"LillyAPI\.([A-Za-z_]+)", _read(rel)))

    missing = sorted(called - provided)
    if missing:
        raise BuildError(
            "the my-work modules call LillyAPI.%s, which the offline shim does not "
            "provide. That is a blank panel at runtime, so the build stops here."
            % ", LillyAPI.".join(missing))
    extra = sorted(provided - called - set(EXPECTED_API_SURFACE))
    if extra:
        raise BuildError(
            "the offline shim provides LillyAPI.%s which nothing calls. Dead stub "
            "surface invites a caller that would silently get nothing back."
            % ", LillyAPI.".join(extra))
    return sorted(called)


def build():
    src = _read(os.path.relpath(SHELL, HERE).replace(os.sep, "/"))
    api_calls = check_api_surface()

    # 1. Fonts: drop the preconnects, swap the Google Fonts stylesheet for the vendored
    #    inline @font-face bundle. A skill must render with no network.
    src = re.sub(r'<link rel="preconnect"[^>]*>', "", src)
    fonts = _read("assets/fonts-inline.css")
    src, n_fonts = re.subn(
        r'<link href="https://fonts\.googleapis\.com[^"]*"[^>]*>',
        lambda m: "<style>" + fonts + "</style>", src, count=1)
    if n_fonts != 1:
        raise BuildError(
            "expected exactly one Google Fonts <link> in the shell, replaced %d. The "
            "shell has changed shape; re-vendor it rather than letting the page fall "
            "back to a network font." % n_fonts)

    # 2a. Remove the markup belonging to dropped features, before dropping their assets.
    for spec in MARKUP_REMOVED:
        src, n = re.subn(spec["pattern"], "", src, flags=spec.get("flags", 0))
        if n != 1:
            raise BuildError(
                "expected to remove exactly one %s, removed %d. Either the shell changed "
                "or the pattern is wrong; both leave orphaned markup or a dead control "
                "in the page." % (spec["what"], n))

    # 2b. Drop what is deliberately not shipped.
    for rel, why in DROPPED.items():
        src = re.sub(r'<script src="%s"[^>]*>\s*</script>' % re.escape(rel), "", src)
        src = re.sub(r'<link rel="stylesheet" href="%s">' % re.escape(rel), "", src)
        del why

    # 3. Substitute api.js for the offline shim.
    for rel, repl in SUBSTITUTED.items():
        src, n = re.subn(r'<script src="%s"[^>]*>\s*</script>' % re.escape(rel),
                         lambda m, r=repl: _script(_read(r)), src)
        if n != 1:
            raise BuildError(
                "expected exactly one <script src=%r>, found %d. The shell no longer "
                "matches the vendored assets." % (rel, n))

    # 4. Inline every vendored asset.
    for rel in VENDORED:
        src, n = re.subn(r'<script src="%s"[^>]*>\s*</script>' % re.escape(rel),
                         lambda m, r=rel: _script(_read(r)), src)
        if n != 1:
            raise BuildError(
                "expected exactly one <script src=%r> in the shell, found %d. A vendored "
                "asset is unreferenced or referenced twice; either way the load order "
                "this page depends on is no longer what it looks like." % (rel, n))

    # 5. Refuse to ship a page that still reaches outside itself.
    #
    # THIS CHECK LOOKS FOR THE MECHANISM, NOT THE MARKUP. The first version of this
    # builder scanned only for <script src> and <link href> and reported a confident
    # "0 external references" while the built page was in fact pulling four scripts and
    # an image at runtime, because theo-brand.js injected them from JavaScript, and
    # my-work-06-handover.js called fetch() directly. Markup was clean; behaviour was
    # not. A reference that appears only when the page runs is still a reference.
    markup = re.findall(r'(?:src|href)="(?:https?:)?//[^"]*"'
                        r'|(?:src|href)="assets/[^"]*"', src)

    # Scan a comment-stripped COPY, because prose describing a fetch is not a fetch, and
    # this file's own header discusses one. The stripper deliberately UNDER-strips: it
    # removes /* */ blocks and only those // comments that start their line. A stripper
    # that guessed harder could delete real code and hide a genuine call, which is the
    # one failure this check cannot afford. Anything it leaves behind is examined.
    scan = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)
    scan = re.sub(r"^[ \t]*//[^\n]*$", "", scan, flags=re.M)

    runtime = []
    for pattern, what in (
        (r"\bfetch\s*\(", "fetch() call"),
        (r"\bXMLHttpRequest\b", "XMLHttpRequest"),
        (r"\bWebSocket\b", "WebSocket"),
        (r"\bimport\s*\(", "dynamic import()"),
        (r"""\.src\s*=\s*['"](?:https?:)?//""", "script/image src assigned a URL"),
        (r"""\.src\s*=\s*['"]assets/""", "script/image src assigned a bundle path"),
        (r"""['"]assets/[A-Za-z0-9_./-]+\.(?:js|css|png|jpg|svg)['"]""",
         "string literal naming a bundle asset"),
    ):
        for m in re.finditer(pattern, scan):
            snippet = scan[max(0, m.start() - 40):m.start() + 60].replace("\n", " ")
            runtime.append("%s: ...%s..." % (what, snippet.strip()))

    if markup or runtime:
        lines = ["the page is not self-contained, so it would render differently "
                 "offline than it does here."]
        if markup:
            lines.append("  markup references (%d): %s"
                         % (len(markup), ", ".join(sorted(set(markup))[:6])))
        if runtime:
            lines.append("  RUNTIME references (%d), which a markup-only scan misses:"
                         % len(runtime))
            lines.extend("    - " + r for r in runtime[:8])
        raise BuildError("\n".join(lines))

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(src)
    return {"out": OUT, "bytes": os.path.getsize(OUT),
            "vendored": len(VENDORED), "dropped": sorted(DROPPED),
            "api_calls": api_calls}


def main(argv):
    try:
        r = build()
    except BuildError as e:
        print("REFUSED: %s" % e, file=sys.stderr)
        return 2
    print("wrote %s (%.2f MB)" % (r["out"], r["bytes"] / (1024.0 * 1024.0)))
    print("  vendored assets inlined : %d" % r["vendored"])
    print("  offline LillyAPI surface: %s" % ", ".join(r["api_calls"]))
    print("  external references     : 0")
    if "--report" in argv:
        print("\nDropped on purpose (stated, not silent):")
        for rel in sorted(DROPPED):
            print("  - %-28s %s" % (rel, DROPPED[rel]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
