#!/usr/bin/env python3
"""
package_skills.py — the pre-packaging integrity sweep and the `.skill` build (K1).

Produces one `<skill>.skill` zip per shipping skill, stripped of dead weight, and verifies
each one by EXTRACTING it into an empty directory and re-running the smoke test there.

THE SWEEP IS A GATE, NOT A REPORT
---------------------------------
Nothing is packaged unless every check passes first. A package built over a failing check is
worse than no package: it ships the defect AND the impression that it was checked. The gate
runs, in order:

    1. the per-skill runtime smoke test (A1-A9)
    2. the kernel drift manifest
    3. the citation resolver
    4. every *selftest.py in the tree

Use --force only to inspect what WOULD be built; it still refuses to write packages.

WHY EXTRACT-AND-RETEST
----------------------
K1's verify clause is "install from the produced package and re-run one smoke test per skill
family". Testing the repo tree proves the repo is sound; it says nothing about the artifact a
user actually receives. The two differ precisely because packaging STRIPS files, and a strip
rule that removes one file too many produces a package that passes every repo-side check and
fails on the user's machine. So each package is extracted to an empty directory and the
smoke test is run against the extraction.

That mirrors the Desktop install model the smoke test already encodes: ONE skill folder, no
siblings, no suite root, no repo.

Stdlib only.
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

sys.path.insert(0, HERE)
from ship_manifest import (                                     # noqa: E402
    DEAD_WEIGHT_DIRS,
    DEAD_WEIGHT_FILES,
    SUPERSEDED_ARTIFACTS,
    classify,
)


def _sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _run(label, argv, cwd=ROOT):
    """Run a check. Returns (ok, tail) without raising, so the sweep reports ALL failures
    rather than stopping at the first, which is what makes it usable."""
    try:
        p = subprocess.run([sys.executable] + argv, cwd=cwd, capture_output=True,
                           text=True, timeout=900)
    except Exception as e:                                      # noqa: BLE001
        return False, "%s: %s" % (type(e).__name__, e)
    out = (p.stdout or "") + (p.stderr or "")
    tail = "\n".join(l for l in out.strip().splitlines()[-3:])
    return p.returncode == 0, tail


def integrity_sweep():
    """Every gate that must pass before anything is packaged."""
    checks = [
        ("smoke test (A1-A9)", ["_audit/skill_smoke_test.py"]),
        ("kernel drift manifest", ["lilly-procurement-kernels-1c344a/kernel_manifest.py"]),
        ("citation resolver", ["_audit/h5_citation_resolver.py"]),
    ]
    for dp, _dn, fn in os.walk(ROOT):
        if "__pycache__" in dp or os.sep + "." in dp:
            continue
        for f in sorted(fn):
            if f.endswith("selftest.py") or f == "check_run.py":
                rel = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")
                arg = [rel, "--selftest"] if f == "check_run.py" else [rel]
                checks.append(("selftest: " + rel, arg))

    results = []
    for label, argv in checks:
        ok, tail = _run(label, argv)
        results.append({"check": label, "ok": ok, "tail": tail})
    return results


def _is_dead(rel_path, name, is_dir):
    if is_dir:
        return name in DEAD_WEIGHT_DIRS
    if any(name.endswith(suffix) for suffix in DEAD_WEIGHT_FILES):
        return True
    pin = SUPERSEDED_ARTIFACTS.get(rel_path)
    if pin is not None:
        want, _why = pin
        full = os.path.join(ROOT, rel_path)
        # Only strip when the content still matches what was pinned. A rebuilt file is a
        # different artifact and must ship rather than be removed on a stale pin.
        return os.path.isfile(full) and _sha256(full) == want
    return False


def build_package(skill, outdir):
    """Zip one skill, stripping dead weight. Returns (path, files, bytes, stripped)."""
    src = os.path.join(ROOT, skill)
    out = os.path.join(outdir, skill + ".skill")
    files = 0
    total = 0
    stripped = []

    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, dn, fn in os.walk(src):
            for d in list(dn):
                rel = os.path.relpath(os.path.join(dp, d), ROOT).replace(os.sep, "/")
                if _is_dead(rel, d, True):
                    stripped.append(rel + "/")
                    dn.remove(d)
            for f in sorted(fn):
                full = os.path.join(dp, f)
                rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
                if _is_dead(rel, f, False):
                    stripped.append(rel)
                    continue
                # Arcname keeps the skill folder as the top level, which is what the
                # Desktop install model expects.
                z.write(full, os.path.relpath(full, ROOT).replace(os.sep, "/"))
                files += 1
                total += os.path.getsize(full)
    return out, files, total, stripped


def verify_package(pkg, skill):
    """Extract into an EMPTY directory and run the smoke test against the extraction."""
    tmp = tempfile.mkdtemp(prefix="pkgverify_")
    try:
        with zipfile.ZipFile(pkg) as z:
            z.extractall(tmp)
        extracted = os.path.join(tmp, skill)
        if not os.path.isdir(extracted):
            return False, "package does not contain a top-level %s/ folder" % skill
        if not os.path.isfile(os.path.join(extracted, "SKILL.md")):
            return False, "extracted package has no SKILL.md"
        ok, tail = _run("smoke", [os.path.join(HERE, "skill_smoke_test.py"), skill],
                        cwd=tmp)
        return ok, tail
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main(argv):
    force = "--force" in argv
    outdir = os.path.join(ROOT, "_package")

    print("=" * 88)
    print("PRE-PACKAGING INTEGRITY SWEEP")
    print("=" * 88)
    results = integrity_sweep()
    failed = [r for r in results if not r["ok"]]
    for r in results:
        print("  [%s] %s" % ("OK  " if r["ok"] else "FAIL", r["check"]))
        if not r["ok"]:
            for line in r["tail"].splitlines():
                print("         " + line[:110])

    print("\n  %d check(s), %d failed" % (len(results), len(failed)))
    if failed:
        print("\nREFUSING TO PACKAGE. A package built over a failing check ships the defect")
        print("AND the impression that it was checked.")
        if not force:
            return 2
        print("(--force: continuing to show what WOULD be built; nothing will be written)")

    ship, repo_only, anomalies = classify()
    print("\n" + "=" * 88)
    print("BUILDING %d PACKAGE(S)" % len(ship))
    print("=" * 88)
    if anomalies:
        print("  note: %d installable-looking dir(s) with no SKILL.md, NOT packaged: %s"
              % (len(anomalies), ", ".join(anomalies)))

    if failed and force:
        return 2

    if os.path.isdir(outdir):
        shutil.rmtree(outdir)
    os.makedirs(outdir)

    manifest, total_bytes, total_stripped = [], 0, 0
    for skill in ship:
        pkg, files, size, stripped = build_package(skill, outdir)
        ok, tail = verify_package(pkg, skill)
        total_bytes += os.path.getsize(pkg)
        total_stripped += len(stripped)
        manifest.append({
            "skill": skill, "package": os.path.basename(pkg),
            "files": files, "uncompressed_bytes": size,
            "zip_bytes": os.path.getsize(pkg), "sha256": _sha256(pkg),
            "stripped": stripped, "verified": ok,
        })
        print("  [%s] %-38s %4d files  %6d KB zip  %2d stripped"
              % ("OK  " if ok else "FAIL", skill, files,
                 os.path.getsize(pkg) // 1024, len(stripped)))
        if not ok:
            for line in (tail or "").splitlines()[:3]:
                print("         " + line[:110])

    unverified = [m for m in manifest if not m["verified"]]
    with open(os.path.join(outdir, "PACKAGE-MANIFEST.json"), "w", encoding="utf-8") as fh:
        json.dump({"skills": len(manifest), "total_zip_bytes": total_bytes,
                   "files_stripped": total_stripped,
                   "all_verified": not unverified, "packages": manifest}, fh, indent=2)

    print("\n  %d package(s), %s KB total, %d file(s)/dir(s) stripped"
          % (len(manifest), format(total_bytes // 1024, ","), total_stripped))
    print("  manifest: _package/PACKAGE-MANIFEST.json")
    if unverified:
        print("\n  %d PACKAGE(S) FAILED EXTRACT-AND-RETEST: %s"
              % (len(unverified), ", ".join(m["skill"] for m in unverified)))
        return 1
    print("\n  every package extracted into an empty directory and passed the smoke test.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
