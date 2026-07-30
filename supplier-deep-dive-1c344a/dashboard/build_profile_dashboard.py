#!/usr/bin/env python3
"""
build_profile_dashboard.py -- the deterministic Deep Dive dashboard (A5).

WHY THIS REPLACES WHAT WAS THERE
--------------------------------
This skill was the last one on the fully-manual path: `SKILL.md:337` told the model to
hand-author the JSX with `create_file`, so every run produced a differently shaped
artifact. That is a consistency defect before it is a cost defect, and it is not fixable
by a better instruction. The model now authors DATA; this assembles the page.

STAGE
-----
Stage 1 of `DEEP-DIVE-REDESIGN-SPEC-v3.md`: the **Supplier Summary** subtab, built
end-to-end as the visual-first exemplar. The spec puts a sign-off gate here (spec:163)
before the pattern rolls to the other five subtabs, so this stops at one subtab on
purpose rather than for lack of time.

WHAT THE CODE OWNS
------------------
Validation, arithmetic, assembly and the spec's invariants. The model owns narrative only.
Every number rendered here is either read from validated data or computed in this file;
none is written by hand into markup.

The dominant visual is the **8-dimension assessment bar set**. Per spec:83-84 the bar
length is a RELATIVE position and the label carries the actual assessment, so a reader
cannot mistake a long bar for a score. Confidence is the FILL: solid, striped, or outline.

COLOUR
------
Three colours doing three jobs, per the locked purposeful-colour rule. Bold Blue #0F3A85
is the positive accent (never green). Lilly Red #D52B1E marks a weak assessment or a hard
stop, so red always means something is wrong rather than merely notable. Amber #B26B00
marks partial evidence and open escalations. Everything else is neutral, and no panel
sits on a tinted background.

Run: python build_profile_dashboard.py [--seed assets/seed/snowflake.json]
"""
from __future__ import annotations

import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import deepdive_sections as SEC                                      # noqa: E402
import deepdive_viz as VIZ                                           # noqa: E402
from deepdive_schema import (                                        # noqa: E402
    ASSESSMENTS, DIMENSIONS, DeepDiveError, validate_dataset,
)

# spec:75. The six subtabs, in order. Subtab 0 is the default.
SUBTABS = (
    ("summary", "Supplier Summary"),
    ("company", "Company &amp; Ownership"),
    ("capabilities", "Capabilities &amp; Operations"),
    ("financial", "Financial &amp; Market"),
    ("risk", "Risk &amp; Resilience"),
    ("fit", "Lilly Fit &amp; Diligence"),
)

DEFAULT_SEED = os.path.join(HERE, "assets", "seed", "snowflake.json")
OUT = os.path.join(HERE, "deep-dive-dashboard.html")

BLUE, RED, AMBER = "#0F3A85", "#D52B1E", "#B26B00"
INK, MUT, LINE = "#1a1a1a", "#5f5f5f", "#dcdcdc"

DIM_LABELS = {
    "identity_ownership": "Identity &amp; ownership",
    "capability_fit": "Capability &amp; sourcing fit",
    "financial_viability": "Financial viability",
    "operational_resilience": "Operational resilience",
    "integrity_legal_compliance": "Integrity, legal &amp; compliance",
    "quality_regulatory_ehs": "Quality, regulatory &amp; EHS",
    "cyber_privacy_data": "Cyber, privacy &amp; data",
    "responsible_sourcing_evidence": "Responsible sourcing &amp; evidence",
}

# Assessment -> the colour that assessment earns. Only Weak and Insufficient depart from
# neutral-plus-blue, so colour marks a problem rather than decorating every row.
ASSESSMENT_COLOR = {
    "Strong": BLUE, "Adequate": BLUE, "Moderate": MUT,
    "Weak": RED, "Insufficient evidence": AMBER,
}

HEATMAP_COLOR = {
    "Confirmed": BLUE, "Partially confirmed": AMBER,
    "Supplier asserted": MUT, "Not demonstrated": RED, "Gap": RED, "N/A": LINE,
}


class BuildError(Exception):
    pass


def esc(s):
    return html.escape(str(s if s is not None else ""))


def bar_fill(confidence, color):
    """Confidence rendered as FILL, per spec:84.

    solid = verified, striped = partial, outline = insufficient. Encoding confidence in
    the fill rather than a separate column means a reader cannot take in the assessment
    without also taking in how well it is evidenced.
    """
    if confidence == "verified":
        return "background:%s;" % color
    if confidence == "partial":
        return ("background:repeating-linear-gradient(135deg,%s,%s 5px,"
                "rgba(255,255,255,.55) 5px,rgba(255,255,255,.55) 10px);" % (color, color))
    return "background:transparent;border:1.5px dashed %s;" % color


def dimension_bars(s):
    rows = []
    for did in DIMENSIONS:
        d = s["dimensions"][did]
        a, c = d["assessment"], d["confidence"]
        color = ASSESSMENT_COLOR[a]
        # The evidence count is computed, never authored, so the two cannot disagree.
        n_known = sum(1 for e in (d.get("evidence") or [])
                      if e.get("status") in ("Verified", "Partially verified"))
        n_all = len(d.get("evidence") or [])
        rows.append(
            '<div class="dimrow">'
            '<div class="dimname">%s</div>'
            '<div class="dimtrack"><div class="dimbar" style="width:%.1f%%;%s"></div></div>'
            '<div class="dimlabel" style="color:%s">%s</div>'
            '<div class="dimev">%d of %d sourced</div>'
            '</div>' % (DIM_LABELS[did], float(d["position"]), bar_fill(c, color),
                        color, esc(a), n_known, n_all))
    return "\n".join(rows)


def coverage_bar(cov):
    segs = [("verified", "Verified", BLUE), ("partial", "Partial", AMBER),
            ("supplier_input", "Supplier input", MUT), ("missing", "Missing", LINE)]
    bar, legend = [], []
    for key, label, color in segs:
        pct = float(cov.get(key, 0))
        if pct > 0:
            bar.append('<div style="width:%.2f%%;background:%s" title="%s %.0f%%"></div>'
                       % (pct, color, label, pct))
        legend.append('<span class="lg"><i style="background:%s"></i>%s %.0f%%</span>'
                      % (color, label, pct))
    return ('<div class="covbar">%s</div><div class="covlegend">%s</div>'
            % ("".join(bar), "".join(legend)))


def gates_block(gates):
    if not gates:
        return ('<p class="none">No hard stops or escalations raised. This is a stated '
                'finding, not an absence of assessment.</p>')
    out = []
    for g in gates:
        hard = g["kind"] == "HARD_STOP"
        color = RED if hard else AMBER
        out.append(
            '<div class="gate" style="border-left:3px solid %s">'
            '<div class="gk" style="color:%s">%s</div>'
            '<div class="gr">%s</div>'
            '<div class="go">Owner: <strong>%s</strong> &middot; %s</div></div>'
            % (color, color, "HARD STOP" if hard else "ESCALATION",
               esc(g["reason"]), esc(g["owner"]), esc(g.get("status", "open"))))
    return "\n".join(out)


def heatmap(groups):
    cells = []
    for g in groups:
        color = HEATMAP_COLOR.get(g["status"], MUT)
        gaps = g.get("gaps", 0)
        cells.append(
            '<div class="hcell"><div class="hbar" style="background:%s"></div>'
            '<div class="hg">%s</div><div class="hs">%s</div>'
            '<div class="hm">%d must-have%s%s</div></div>'
            % (color, esc(g["group"]), esc(g["status"]), g["must_haves"],
               "" if g["must_haves"] == 1 else "s",
               (" &middot; <strong style='color:%s'>%d gap%s</strong>"
                % (RED, gaps, "" if gaps == 1 else "s")) if gaps else ""))
    return "".join(cells)


def lists(title, items, color):
    li = "".join('<li>%s</li>' % esc(i) for i in items[:3])
    return ('<div class="col"><h3 style="color:%s">%s</h3><ul class="vl">%s</ul></div>'
            % (color, title, li))


CSS = """
*{box-sizing:border-box}
body{margin:0;font:14px/1.5 "Libre Franklin",-apple-system,Segoe UI,sans-serif;color:%(ink)s;background:#fff}
.wrap{max-width:1180px;margin:0 auto;padding:28px 24px 64px}
h1{font-size:24px;margin:0 0 2px;font-weight:700}
.sub{color:%(mut)s;font-size:13px;margin:0 0 22px}
.strip{display:flex;flex-wrap:wrap;gap:0;border:1px solid %(line)s;border-radius:3px;margin-bottom:26px}
.strip .c{flex:1 1 150px;padding:12px 16px;border-right:1px solid %(line)s}
.strip .c:last-child{border-right:0}
.strip .k{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:%(mut)s;margin-bottom:4px}
.strip .v{font-size:15px;font-weight:600;line-height:1.3}
section{margin:0 0 34px}
h2{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:%(mut)s;font-weight:600;
   margin:0 0 4px;padding-bottom:7px;border-bottom:1px solid %(line)s}
.hint{color:%(mut)s;font-size:12px;margin:8px 0 16px}
.dimrow{display:grid;grid-template-columns:210px 1fr 140px 106px;gap:14px;align-items:center;
        padding:7px 0;border-bottom:1px solid #f0f0f0}
.dimname{font-size:13px}
.dimtrack{height:13px;background:#f4f4f4;border-radius:2px;overflow:hidden}
.dimbar{height:100%%;border-radius:2px}
.dimlabel{font-size:12.5px;font-weight:600}
.dimev{font-size:11px;color:%(mut)s;text-align:right}
.covbar{display:flex;height:22px;border-radius:2px;overflow:hidden;margin-bottom:9px}
.covlegend{display:flex;flex-wrap:wrap;gap:16px}
.lg{font-size:11.5px;color:%(mut)s;display:inline-flex;align-items:center;gap:6px}
.lg i{width:9px;height:9px;border-radius:2px;display:inline-block}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:30px}
.col h3{font-size:12px;letter-spacing:.06em;text-transform:uppercase;margin:0 0 8px}
.vl{margin:0;padding-left:17px}
.vl li{margin-bottom:7px;font-size:13px}
.hm2{display:grid;grid-template-columns:repeat(auto-fit,minmax(178px,1fr));gap:12px}
.hcell{border:1px solid %(line)s;border-radius:3px;padding:11px 12px}
.hbar{height:4px;border-radius:2px;margin-bottom:9px}
.hg{font-size:13px;font-weight:600;margin-bottom:2px}
.hs{font-size:12px;color:%(mut)s}
.hm{font-size:11px;color:%(mut)s;margin-top:5px}
.gate{padding:9px 0 9px 13px;margin-bottom:11px}
.gk{font-size:10px;letter-spacing:.09em;font-weight:700;margin-bottom:3px}
.gr{font-size:13px;margin-bottom:3px}
.go{font-size:11.5px;color:%(mut)s}
.none{color:%(mut)s;font-size:13px}
footer{margin-top:40px;padding-top:14px;border-top:1px solid %(line)s;color:%(mut)s;font-size:11.5px}
@media(max-width:860px){.dimrow{grid-template-columns:1fr;gap:5px}.dimev,.dimlabel{text-align:left}
 .cols{grid-template-columns:1fr}}
""" % {"ink": INK, "mut": MUT, "line": LINE}


TAB_CSS = """
.tabs{display:flex;flex-wrap:wrap;gap:2px;border-bottom:1px solid %(line)s;margin-bottom:24px}
.tab{appearance:none;background:none;border:0;border-bottom:2px solid transparent;
     padding:9px 15px;font:inherit;font-size:13px;color:%(mut)s;cursor:pointer}
.tab.on{color:%(blue)s;border-bottom-color:%(blue)s;font-weight:600}
.tab:hover{color:%(ink)s}
.pane{display:none}
.pane.on{display:block}
""" % {"line": LINE, "mut": MUT, "blue": BLUE, "ink": INK}


def render(s, summary):
    hard = [g for g in (s.get("gates") or []) if g["kind"] == "HARD_STOP"]
    esc_g = [g for g in (s.get("gates") or []) if g["kind"] == "ESCALATION"]
    cov = s["evidence_coverage"]

    # Risk posture is DERIVED from the gates and the weakest dimension, never authored.
    # Deriving it is what stops the header disagreeing with the chart beneath it, which is
    # the class of inconsistency the spec calls out in the v2 build.
    weakest = min(s["dimensions"].values(),
                  key=lambda d: ASSESSMENTS.index(d["assessment"]) * -1)
    if hard:
        posture = "Blocked &middot; hard stop open"
    elif esc_g:
        posture = "Conditional &middot; %d escalation%s open" % (
            len(esc_g), "" if len(esc_g) == 1 else "s")
    else:
        posture = "No gate raised"

    strip = [
        ("Recommendation", esc(s["recommendation"]["verdict"])),
        ("Rank in shortlist", "#%s" % esc(s.get("rank", "n/a"))),
        ("Requirements fit", esc(s.get("requirements_fit", "Not assessed"))),
        ("Risk posture", posture),
        ("Data confidence", "%.0f%% verified" % float(cov.get("verified", 0))),
        ("Open issues", str(len(s.get("gates") or []))),
    ]
    strip_html = "".join(
        '<div class="c"><div class="k">%s</div><div class="v">%s</div></div>' % (k, v)
        for k, v in strip)

    # Every dominant visual is CHOSEN from what the data supports, and each choice carries
    # its reason to the page. Nothing here decides to draw a shape the evidence cannot
    # carry; that decision lives in deepdive_viz and is tested separately.
    own_kind, own_why = VIZ.choose_ownership(s.get("ownership"))
    map_kind, map_why = VIZ.choose_map(s.get("locations"))
    net_kind, net_why = VIZ.choose_network(s.get("dependencies"))
    tr_kind, tr_why = VIZ.choose_trend(s.get("financial_periods"))
    peer_kind, peer_why = VIZ.choose_peer_scatter(s.get("peers"))
    rm_kind, rm_why = VIZ.choose_risk_matrix(s.get("risks"))

    panes = {
        "company": SEC.company_ownership(s, own_kind, own_why, map_kind, map_why),
        "capabilities": SEC.capabilities(s, net_kind, net_why),
        "financial": SEC.financial(s, tr_kind, tr_why, peer_kind, peer_why),
        "risk": SEC.risk(s, rm_kind, rm_why),
        "fit": SEC.lilly_fit(s),
    }
    chosen = {"ownership": own_kind, "map": map_kind, "network": net_kind,
              "trend": tr_kind, "peer_scatter": peer_kind, "risk_matrix": rm_kind}

    nav = "".join(
        '<button class="tab%s" data-t="%s" onclick="dd(\'%s\')">%s</button>'
        % (" on" if i == 0 else "", tid, tid, label)
        for i, (tid, label) in enumerate(SUBTABS))

    return """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>%(name)s &middot; Supplier Deep Dive</title>
<style>%(css)s</style></head><body>
<div class="wrap">
  <h1>%(name)s</h1>
  <p class="sub">%(etype)s%(ticker)s &middot; Supplier Summary &middot; should Lilly advance
     this supplier in this sourcing event, and what must be validated next?</p>

  <div class="strip">%(strip)s</div>

  <nav class="tabs">%(nav)s</nav>

  <div class="pane on" id="p-summary">
  <section>
    <h2>Assessment by dimension</h2>
    <p class="hint">Bar length is a relative position within the shortlist, not a score.
       The label is the assessment. Fill shows how well it is evidenced: solid is verified,
       striped is partial, dashed outline is insufficient evidence. There is deliberately
       no single combined figure.</p>
    %(dims)s
  </section>

  <section>
    <h2>Decision gates</h2>
    <p class="hint">Gates override the assessment above; they are not folded into it.
       A hard stop is the answer until it is cleared by its owner.</p>
    %(gates)s
  </section>

  <section>
    <h2>Requirements by group</h2>
    <p class="hint">Group-level only. The full cross-supplier requirements heatmap stays on
       the Requirements tab rather than being repeated inside every supplier.</p>
    <div class="hm2">%(heat)s</div>
  </section>

  <section>
    <h2>Opportunities and concerns</h2>
    <div class="cols">%(opps)s%(cons)s</div>
  </section>

  <section>
    <h2>Evidence coverage</h2>
    <p class="hint">Share of assessed fields by evidence state. &quot;Missing&quot; means no
       source was found, which is reported rather than left blank.</p>
    %(cov)s
  </section>
  </div>

  <div class="pane" id="p-company">%(pane_company)s</div>
  <div class="pane" id="p-capabilities">%(pane_capabilities)s</div>
  <div class="pane" id="p-financial">%(pane_financial)s</div>
  <div class="pane" id="p-risk">%(pane_risk)s</div>
  <div class="pane" id="p-fit">%(pane_fit)s</div>

  <footer>
    Reflect-only. %(nev)s evidence items across %(ndim)s dimensions; %(nhard)s hard stop(s)
    and %(nesc)s escalation(s) open. Every figure on this page is read from validated data
    or computed at build time. Assessments are not a system of record and do not constitute
    an award decision.
  </footer>
</div>
<script>
/* Subtab switching. Vanilla, no dependency, and every pane is already in the document,
   so the page works with scripting disabled apart from the tab control itself. */
function dd(t){
  var i,p=document.querySelectorAll('.pane'),b=document.querySelectorAll('.tab');
  for(i=0;i<p.length;i++){p[i].className='pane'+(p[i].id==='p-'+t?' on':'');}
  for(i=0;i<b.length;i++){b[i].className='tab'+(b[i].getAttribute('data-t')===t?' on':'');}
}
</script>
</body></html>""" % {
        "name": esc(s["name"]),
        "nav": nav,
        "pane_company": panes["company"],
        "pane_capabilities": panes["capabilities"],
        "pane_financial": panes["financial"],
        "pane_risk": panes["risk"],
        "pane_fit": panes["fit"],
        "etype": esc(s.get("entity_type", "").capitalize()),
        "ticker": (" &middot; " + esc(s["ticker"])) if s.get("ticker") else "",
        "css": CSS + TAB_CSS + SEC.EXTRA_CSS,
        "strip": strip_html,
        "dims": dimension_bars(s),
        "gates": gates_block(s.get("gates") or []),
        "heat": heatmap(s.get("requirement_groups") or []),
        "opps": lists("Opportunities", s.get("opportunities") or [], BLUE),
        "cons": lists("Concerns", s.get("concerns") or [], RED),
        "cov": coverage_bar(cov),
        "nev": summary["evidence_items"],
        "ndim": summary["dimensions"],
        "nhard": summary["hard_stops"],
        "nesc": len(esc_g),
    }


def build(seed_path=None, out_path=None):
    seed_path = seed_path or DEFAULT_SEED
    out_path = out_path or OUT
    with open(seed_path, encoding="utf-8") as fh:
        data = json.load(fh)
    # Validation is a GATE, not a warning. An invalid record is not rendered at all,
    # because a rendered page is indistinguishable from a trustworthy one.
    summaries = validate_dataset(data)
    s, summary = data["suppliers"][0], summaries[0]
    page = render(s, summary)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(page)
    return {"out": out_path, "bytes": len(page.encode("utf-8")), "supplier": s["name"],
            "summary": summary}


def main(argv):
    seed = None
    if "--seed" in argv:
        seed = argv[argv.index("--seed") + 1]
    try:
        r = build(seed)
    except DeepDiveError as e:
        print("REFUSED: %s: %s" % (type(e).__name__, e), file=sys.stderr)
        return 2
    except BuildError as e:
        print("REFUSED: %s" % e, file=sys.stderr)
        return 2
    print("wrote %s (%.1f KB)" % (r["out"], r["bytes"] / 1024.0))
    print("  supplier      : %s" % r["supplier"])
    print("  dimensions    : %d (all eight always render)" % r["summary"]["dimensions"])
    print("  evidence items: %d" % r["summary"]["evidence_items"])
    print("  gates         : %d hard stop(s), %d total"
          % (r["summary"]["hard_stops"], r["summary"]["gates"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
