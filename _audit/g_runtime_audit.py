"""
g_runtime_audit.py
WS G items G1 to G7: does each skill actually RUN in Claude Desktop?

OPTIMIZATION-PRINCIPLES.md: "Reading well is not the bar. Every skill has to
execute end to end on a user's own Desktop install. That means: no third-party
import that may be absent, no hardcoded repo paths, no assumption that a sibling
skill is installed, and no dependence on a tool or connector that may not be
there."

Desktop installs ONE skill folder. No siblings, no suite root, no repo. Anything
that assumes otherwise is a runtime failure, not a style issue.

  G1  third-party imports, and whether they degrade or explode
  G2  cross-skill path portability (/mnt/skills/user/<other-skill>/...)
  G3  builder self-containment (a .py importing something not beside it)
  G4  vendored-kernel self-containment (does it import standalone)
  G5  output-path portability (hardcoded write locations)
  G6  tool and connector assumptions (M365, SharePoint, named tools)
  G7  widget and artifact render dependencies (react, recharts, show_widget)

Read-only. Findings, not fixes. Stdlib only.
"""

from __future__ import annotations

import ast
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Modules that ship with CPython. Anything imported and not in here is a
# third-party dependency that may be absent on a user's Desktop.
STDLIB = set(getattr(sys, "stdlib_module_names", ()))

# Tools and connectors a skill might assume. Absence of any of these is a
# degradation path that has to be designed, not discovered at runtime.
TOOLS = {
    "create_file": r"\bcreate_file\b",
    "ask_user_input_v0": r"\bask_user_input_v0\b",
    "show_widget": r"\bshow_widget\b",
    "message_compose": r"\bmessage_compose\b",
    "unpack.py / docx internals": r"\bunpack\.py\b",
    "docx skill": r"\bdocx skill\b",
}
CONNECTORS = {
    "M365 connector": r"M365 connector",
    "SharePoint": r"\bSharePoint\b",
    "Teams": r"\bTeams\b",
    "Outlook": r"\bOutlook\b",
    "web search": r"\bweb search\b",
}
DEGRADE_HINTS = [
    r"if .{0,40}unavailable", r"not installed", r"if no file-generation",
    r"graceful", r"degrade", r"fall ?back", r"if .{0,30}is not available",
    r"cannot be read", r"absent", r"NO_.*_SUPPLIED", r"if unavailable",
]


def skills():
    return sorted(
        d for d in os.listdir(ROOT)
        if os.path.isdir(os.path.join(ROOT, d))
        and os.path.isfile(os.path.join(ROOT, d, "SKILL.md"))
    )


def py_files(skill):
    out = []
    for dirpath, _dirs, files in os.walk(os.path.join(ROOT, skill)):
        if "__pycache__" in dirpath:
            continue
        for f in files:
            if f.endswith(".py"):
                out.append(os.path.join(dirpath, f))
    return sorted(out)


def md_text(skill):
    parts = []
    for dirpath, _dirs, files in os.walk(os.path.join(ROOT, skill)):
        for f in files:
            if f.endswith(".md"):
                with open(os.path.join(dirpath, f), encoding="utf-8",
                          errors="replace") as fh:
                    parts.append(fh.read())
    return "\n".join(parts)


def imports_of(path):
    """Top-level module names imported by a file, and whether each is guarded."""
    with open(path, encoding="utf-8", errors="replace") as fh:
        src = fh.read()
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return [], set()
    guarded = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Try):
            for sub in ast.walk(node):
                if isinstance(sub, ast.Import):
                    for a in sub.names:
                        guarded.add(a.name.split(".")[0])
                elif isinstance(sub, ast.ImportFrom) and sub.module:
                    guarded.add(sub.module.split(".")[0])
    mods = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            mods += [a.name.split(".")[0] for a in node.names]
        elif isinstance(node, ast.ImportFrom):
            if node.level and node.level > 0:
                mods.append(f"(relative:{node.module})")
            elif node.module:
                mods.append(node.module.split(".")[0])
    return sorted(set(mods)), guarded


def main():
    rows = []
    for s in skills():
        text = md_text(s)
        pys = py_files(s)
        local_modules = {os.path.splitext(os.path.basename(p))[0] for p in pys}

        # --- G1 third-party imports ---------------------------------------
        third = {}
        for p in pys:
            mods, guarded = imports_of(p)
            for m in mods:
                if m.startswith("(relative"):
                    third.setdefault(m, set()).add("RELATIVE")
                    continue
                if m in STDLIB or m in local_modules or m == "__future__":
                    continue
                third.setdefault(m, set()).add(
                    "guarded" if m in guarded else "UNGUARDED")

        # --- G2 cross-skill paths ------------------------------------------
        cross = sorted(set(re.findall(r"/mnt/skills/user/([a-z0-9\-]+)", text)))
        cross = [c for c in cross if c != s]

        # --- G5 output paths -----------------------------------------------
        outpaths = sorted(set(re.findall(r"/mnt/user-data/[a-z]+", text)))

        # --- G6 tools and connectors ---------------------------------------
        tools = [k for k, pat in TOOLS.items() if re.search(pat, text)]
        conns = [k for k, pat in CONNECTORS.items() if re.search(pat, text)]

        # --- G7 render deps -------------------------------------------------
        render = []
        for lib, pat in (("react", r"\bfrom ['\"]react['\"]"),
                         ("recharts", r"\brecharts\b"),
                         ("show_widget", r"\bshow_widget\b")):
            if re.search(pat, text):
                render.append(lib)

        degrades = len([1 for p in DEGRADE_HINTS if re.search(p, text, re.I)])

        rows.append({
            "skill": s, "py": len(pys), "third": third, "cross": cross,
            "outpaths": outpaths, "tools": tools, "conns": conns,
            "render": render, "degrades": degrades,
        })

    # ---------------- report ------------------------------------------------
    print("=" * 100)
    print("WS G: CLAUDE DESKTOP RUNTIME FEASIBILITY, G1 to G7")
    print("=" * 100)
    print(f"skills: {len(rows)}   (Desktop installs ONE folder: no siblings, "
          f"no suite root)")
    print()

    print("G1  THIRD-PARTY IMPORTS")
    any_third = False
    for r in rows:
        if r["third"]:
            any_third = True
            for mod, states in sorted(r["third"].items()):
                flag = "UNGUARDED" if "UNGUARDED" in states else "guarded"
                mark = "!!" if flag == "UNGUARDED" else "  "
                print(f"  {mark} {r['skill']:36} {mod:20} {flag}")
    if not any_third:
        print("  none: every .py in the suite is stdlib-only")
    print()

    print("G2  CROSS-SKILL PATH REFERENCES (each is a partial-install failure)")
    tally = {}
    for r in rows:
        for c in r["cross"]:
            tally.setdefault(c, []).append(r["skill"])
    for target, users in sorted(tally.items(), key=lambda kv: -len(kv[1])):
        print(f"  {target:34} referenced by {len(users):2} skill(s)")
    if not tally:
        print("  none")
    print()

    print("G3/G4  BUILDER AND KERNEL SELF-CONTAINMENT")
    bad = [r for r in rows if any("RELATIVE" in v for v in r["third"].values())]
    print(f"  relative/package imports (would break a flat install): "
          f"{len(bad)}" + (f"  {[b['skill'] for b in bad]}" if bad else ""))
    with_py = [r for r in rows if r["py"]]
    print(f"  skills shipping .py: {len(with_py)} of {len(rows)}")
    print()

    print("G5  HARDCODED OUTPUT PATHS")
    op = {}
    for r in rows:
        for p in r["outpaths"]:
            op.setdefault(p, []).append(r["skill"])
    for p, users in sorted(op.items(), key=lambda kv: -len(kv[1])):
        print(f"  {p:34} {len(users):2} skill(s)")
    if not op:
        print("  none")
    print()

    print("G6  TOOL AND CONNECTOR ASSUMPTIONS")
    for label, group in (("tool", "tools"), ("connector", "conns")):
        agg = {}
        for r in rows:
            for t in r[group]:
                agg.setdefault(t, []).append(r["skill"])
        for t, users in sorted(agg.items(), key=lambda kv: -len(kv[1])):
            print(f"  {label:9} {t:26} {len(users):2} skill(s)")
    print()

    print("G7  RENDER DEPENDENCIES")
    agg = {}
    for r in rows:
        for t in r["render"]:
            agg.setdefault(t, []).append(r["skill"])
    for t, users in sorted(agg.items(), key=lambda kv: -len(kv[1])):
        print(f"  {t:12} {len(users):2} skill(s)")
    print()

    print("DEGRADATION LANGUAGE PRESENT (crude proxy: does the skill discuss absence?)")
    weak = [r for r in rows if r["degrades"] < 3]
    print(f"  skills with fewer than 3 degradation mentions: {len(weak)}")
    for r in sorted(weak, key=lambda r: r["degrades"]):
        print(f"    {r['skill']:36} {r['degrades']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
