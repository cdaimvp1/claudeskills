#!/usr/bin/env python3
"""
deepdive_sections.py -- renderers for subtabs 1-5 (A5 stage 2).

Subtab 0 (Supplier Summary) lives in build_profile_dashboard.py as the exemplar. These are
the five the pattern rolled out to:

  1 Company & Ownership      who is it, who controls it, where are the operations
  2 Capabilities & Operations can it deliver the scope at the required scale
  3 Financial & Market        financially viable and appropriately positioned
  4 Risk & Resilience         what could stop performance, and what should Lilly do
  5 Lilly Fit & Diligence     how well does it fit, and what must happen before selection

THE RULE THAT SHAPES ALL FIVE
-----------------------------
Every dominant visual is chosen by `deepdive_viz`, from what the data can support, and the
chosen reason is printed beneath the heading. A section whose data cannot support its rich
visual renders the fallback AND says why. That is the spec's "fallback states are a
FEATURE, shown visually, never a silent gap" (spec:62) applied to whole panels rather than
just to fields.

Nothing here invents a shape. If the ownership tree has one node it is not drawn; if the
trend has one point it is a card; if no location is confirmed the map is a stated
requirement, not a country outline.
"""
from __future__ import annotations

import html

BLUE, RED, AMBER = "#0F3A85", "#D52B1E", "#B26B00"
MUT, LINE = "#5f5f5f", "#dcdcdc"

STATUS_COLOR = {
    "Verified": BLUE, "Confirmed": BLUE, "Strong": BLUE,
    "Partially verified": AMBER, "Partially confirmed": AMBER, "Moderate": MUT,
    "Supplier asserted": MUT, "Proxy used": MUT,
    "Data source required": AMBER, "Not found": MUT, "Not applicable": LINE,
    "Not demonstrated": RED, "Gap": RED, "Weak": RED,
    "Insufficient evidence": AMBER, "None found": MUT,
}


def esc(s):
    return html.escape(str(s if s is not None else ""))


def _c(status):
    return STATUS_COLOR.get(status, MUT)


def why(reason):
    """The selection reason, rendered. A reader who expected a chart is owed the reason."""
    return '<p class="why">Chosen from the data available: %s.</p>' % esc(reason)


def _table(headers, rows):
    h = "".join("<th>%s</th>" % esc(x) for x in headers)
    body = []
    for r in rows:
        body.append("<tr>%s</tr>" % "".join(r))
    return ('<table class="t"><thead><tr>%s</tr></thead><tbody>%s</tbody></table>'
            % (h, "".join(body)))


def _pill(text):
    return ('<span class="pill" style="color:%s;border-color:%s">%s</span>'
            % (_c(text), _c(text), esc(text)))


def _needcard(text):
    return ('<div class="need"><div class="needk">Information required</div>'
            '<div>%s</div></div>' % esc(text))


def _traitcard(text):
    """A panel omitted because the supplier TYPE has no such thing.

    Deliberately styled differently from the information-required card. One says "go and
    find this"; the other says "this does not exist for this kind of supplier". A reader
    who cannot tell them apart will either hunt for a document that cannot exist or
    quietly excuse research nobody did.
    """
    return ('<div class="trait"><div class="traitk">Not applicable to this supplier '
            'type</div><div>%s</div></div>' % esc(text))


# --------------------------------------------------------------- 1. Company & Ownership

def company_ownership(s, kind, reason, map_kind, map_reason):
    o = s.get("ownership") or {}
    if kind == "tree":
        nodes = "".join(
            '<div class="onode"><div class="orole">%s</div><div class="olabel">%s</div>'
            '<div class="onote">%s</div></div>'
            % (esc(n.get("role")), esc(n.get("label")), esc(n.get("note", "")))
            for n in o.get("nodes") or [])
        dominant = '<div class="otree">%s</div>' % nodes
    else:
        n = (o.get("nodes") or [{}])[0]
        dominant = (
            '<div class="onode solo"><div class="orole">%s</div>'
            '<div class="olabel">%s</div><div class="onote">%s</div></div>'
            % (esc(n.get("role", "Entity")), esc(n.get("label", "Unknown")),
               esc(n.get("note", ""))))

    idm = _table(["Identity element", "Status", "Source"],
                 [["<td>%s</td>" % esc(r["element"]), "<td>%s</td>" % _pill(r["status"]),
                   "<td class='mut'>%s</td>" % esc(r.get("source") or "&mdash;")]
                  for r in s.get("identity_matrix") or []])

    if map_kind == "schematic":
        rows = [["<td>%s</td>" % esc(e.get("site")), "<td>%s</td>" % esc(e.get("function")),
                 "<td>%s</td>" % _pill(e.get("status", "Verified"))]
                for e in (s.get("locations") or {}).get("entries") or []]
        footprint = _table(["Location", "Function", "Status"], rows)
    else:
        footprint = _needcard(map_reason)

    scale = s.get("company_scale") or {}
    strip = "".join(
        '<div class="sc"><div class="k">%s</div><div class="v">%s</div></div>'
        % (esc(k.replace("_", " ").capitalize()), esc(v))
        for k, v in scale.items())

    return """
    <section><h2>Corporate structure</h2>%(why1)s%(tree)s</section>
    <section><h2>Company scale</h2><div class="scale">%(strip)s</div></section>
    <section><h2>Identity verification</h2>%(idm)s</section>
    <section><h2>Operating footprint</h2>%(why2)s%(fp)s</section>
    """ % {"why1": why(reason), "tree": dominant, "strip": strip, "idm": idm,
           "why2": why(map_reason) if map_kind == "schematic" else "", "fp": footprint}


# ----------------------------------------------------------- 2. Capabilities & Operations

def capabilities(s, net_kind, net_reason):
    cap = _table(["Requirement", "Result", "Evidence"],
                 [["<td>%s</td>" % esc(r["requirement"]),
                   "<td>%s</td>" % _pill(r["result"]),
                   "<td class='mut'>%s</td>" % esc(r.get("evidence") or "&mdash;")]
                  for r in s.get("capability_matrix") or []])

    ready = "".join(
        '<div class="dimrow"><div class="dimname">%s</div>'
        '<div class="dimtrack"><div class="dimbar" style="width:%d%%;background:%s"></div></div>'
        '<div class="dimlabel" style="color:%s">%s</div><div class="dimev"></div></div>'
        % (esc(r["stage"]), int(r["pct"]), _c(r["level"]), _c(r["level"]), esc(r["level"]))
        for r in s.get("delivery_readiness") or [])

    def mark(v):
        if v is True:
            return '<td style="color:%s">Yes</td>' % BLUE
        if v is False:
            return '<td style="color:%s">No</td>' % RED
        return '<td class="mut">Not established</td>'

    refs = _table(["Reference", "Pharma", "Similar scale", "Similar use case",
                   "Independently verified"],
                  [["<td>%s</td>" % esc(r["customer"]), mark(r.get("pharma")),
                    mark(r.get("similar_scale")), mark(r.get("similar_use_case")),
                    mark(r.get("independently_verified"))]
                   for r in s.get("references") or []])

    deps = s.get("dependencies") or []
    if net_kind == "diagram":
        drawn = "".join(
            '<div class="dep" style="border-color:%s"><div class="depk">%s</div>'
            '<div class="depn">%s</div><div class="depm">%s &middot; %s</div></div>'
            % (_c(d.get("confidence", "")), esc(d.get("kind")), esc(d.get("name")),
               esc(d.get("criticality")), esc(d.get("substitutability")))
            for d in deps
            if d.get("confidence") not in ("Data source required", "Not found"))
        pending = [d for d in deps
                   if d.get("confidence") in ("Data source required", "Not found")]
        extra = ""
        if pending:
            extra = ('<p class="why">Listed but not drawn, because their existence is not '
                     'confirmed: %s.</p>'
                     % esc(", ".join(d.get("name", "") for d in pending)))
        dep_html = '<div class="deps">%s</div>%s' % (drawn, extra)
    else:
        dep_html = _needcard(net_reason)

    return """
    <section><h2>Capability against requirement</h2>
      <p class="hint">Evidence-based. A requirement with no evidence reads as a gap, not
         as a pass.</p>%(cap)s</section>
    <section><h2>Delivery readiness</h2>%(ready)s</section>
    <section><h2>Reference relevance</h2>
      <p class="hint">A named customer is not a reference until it is comparable and
         independently verified.</p>%(refs)s</section>
    <section><h2>Critical dependencies</h2>%(why)s%(deps)s</section>
    """ % {"cap": cap, "ready": ready, "refs": refs,
           "why": why(net_reason) if net_kind == "diagram" else "", "deps": dep_html}


# --------------------------------------------------------------- 3. Financial & Market

def financial(s, trend_kind, trend_reason, peer_kind, peer_reason, traits=None):
    """Subtab 3. This is the section traits actually change.

    A product inside a hyperscaler has no standalone balance sheet, so the trend, bridge
    and peer panels are omitted BY TRAIT and the parent's position is assessed instead.
    Rendering them empty would invite someone to fill them in.
    """
    import deepdive_traits as T
    et = traits or T.traits_for(s.get("entity_type"))

    if not T.applies("financial_trend", et):
        parent = s.get("parent") or {}
        parent_block = (
            '<div class="metric"><div class="mv">%s</div>'
            '<div class="mk">Parent entity</div><div class="ms">%s</div></div>'
            % (esc(parent.get("name") or "Parent not identified"),
               esc(parent.get("assessment") or "Parent financial position not assessed")))
        return """
    <section><h2>Financial health</h2>%(t1)s</section>
    <section><h2>Parent financial position</h2>
      <p class="hint">Financial viability reads at the parent for a product inside a
         larger company.</p>%(parent)s</section>
    <section><h2>Peer position</h2>%(t2)s</section>
    <section><h2>Commercial model drivers</h2>
      <p class="hint">What makes the bill move, rather than a single annual figure.</p>
      <div class="deps">%(drivers)s</div></section>
    """ % {"t1": _traitcard(T.omission_note("financial_trend", et)),
           "t2": _traitcard(T.omission_note("peer_position", et)),
           "parent": parent_block,
           "drivers": "".join(
               '<div class="dep" style="border-color:%s"><div class="depk">%s '
               'variability</div><div class="depn">%s</div><div class="depm">%s</div>'
               '</div>'
               % (_c(d.get("variability", "")), esc(d.get("variability")),
                  esc(d.get("driver")), esc(d.get("note") or "&mdash;"))
               for d in s.get("commercial_drivers") or [])}

    periods = s.get("financial_periods") or []
    if trend_kind == "line":
        pts = " ".join("%d,%d" % (i * 60 + 10, 60) for i in range(len(periods)))
        dominant = ('<svg class="spark" viewBox="0 0 400 80"><polyline points="%s" '
                    'fill="none" stroke="%s" stroke-width="2"/></svg>' % (pts, BLUE))
    elif trend_kind == "bars":
        dominant = "".join(
            '<div class="fbar"><div class="fk">%s</div><div class="fv">%s</div></div>'
            % (esc(p.get("period")), esc(p.get("value"))) for p in periods)
    elif trend_kind == "card":
        p = periods[0]
        dominant = ('<div class="metric"><div class="mv">%s</div>'
                    '<div class="mk">%s &middot; %s</div>'
                    '<div class="ms">%s, captured %s</div></div>'
                    % (esc(p.get("value")), esc(p.get("metric")), esc(p.get("period")),
                       esc(p.get("source")), esc(p.get("source_date"))))
    else:
        dominant = _needcard(trend_reason)

    bridge = _table(["Driver", "Assessment", "Evidence"],
                    [["<td>%s</td>" % esc(b["driver"]),
                      "<td>%s</td>" % _pill(b["assessment"]),
                      "<td class='mut'>%s</td>" % esc(b.get("evidence") or "&mdash;")]
                     for b in s.get("financial_bridge") or []])

    drivers = "".join(
        '<div class="dep" style="border-color:%s"><div class="depk">%s variability</div>'
        '<div class="depn">%s</div><div class="depm">%s</div></div>'
        % (_c(d.get("variability", "")), esc(d.get("variability")), esc(d.get("driver")),
           esc(d.get("note") or "&mdash;"))
        for d in s.get("commercial_drivers") or [])

    peer_html = (_needcard(peer_reason) if peer_kind != "scatter"
                 else '<div class="deps">peer scatter</div>')

    return """
    <section><h2>Financial health</h2>%(why1)s%(dom)s</section>
    <section><h2>Financial bridge</h2>%(bridge)s</section>
    <section><h2>Peer position</h2>%(peer)s</section>
    <section><h2>Commercial model drivers</h2>
      <p class="hint">What makes the bill move, rather than a single annual figure. A
         precise total is only shown where a bid, internal figure or benchmark supports
         it.</p>
      <div class="deps">%(drivers)s</div></section>
    """ % {"why1": why(trend_reason), "dom": dominant, "bridge": bridge,
           "peer": peer_html, "drivers": drivers}


# ----------------------------------------------------------------- 4. Risk & Resilience

def risk(s, kind, reason):
    risks = s.get("risks") or []
    plottable = [r for r in risks
                 if isinstance(r.get("impact"), (int, float))
                 and isinstance(r.get("likelihood"), (int, float))]
    unplottable = [r for r in risks if r not in plottable]

    if kind == "matrix":
        cells = []
        for r in plottable:
            x, y = int(r["likelihood"]), int(r["impact"])
            conf = r.get("confidence", "insufficient")
            style = ("background:%s" % _c("Verified")) if conf == "verified" else (
                "background:repeating-linear-gradient(135deg,%s,%s 4px,#fff 4px,#fff 8px)"
                % (AMBER, AMBER) if conf == "partial"
                else "background:transparent;border:1.5px dashed %s" % MUT)
            gate = " gate" if r.get("gate") else ""
            cells.append(
                '<div class="rdot%s" style="left:%d%%;bottom:%d%%;%s" title="%s"></div>'
                % (gate, x * 18 + 4, y * 17 + 4, style, esc(r["risk"])))
        # Gridlines and ticks, so a dot's position can actually be read. Without a scale
        # the matrix looks quantitative while being unreadable, which is the worst of
        # both: it implies precision and delivers none.
        grid = "".join('<div class="gl" style="bottom:%d%%"></div>'
                       '<div class="gv" style="left:%d%%"></div>' % (i * 20, i * 20)
                       for i in range(1, 5))
        ticks = "".join('<div class="tk" style="bottom:%d%%">%d</div>' % (i * 17 + 1, i)
                        for i in range(1, 6))
        xticks = "".join('<div class="tkx" style="left:%d%%">%d</div>' % (i * 18 + 1, i)
                         for i in range(1, 6))
        legend = ('<div class="rleg">'
                  '<span class="lg"><i style="background:%s"></i>verified</span>'
                  '<span class="lg"><i style="background:repeating-linear-gradient('
                  '135deg,%s,%s 3px,#fff 3px,#fff 6px)"></i>partial</span>'
                  '<span class="lg"><i style="border:1.5px dashed %s"></i>insufficient'
                  '</span>'
                  '<span class="lg"><i style="outline:2px solid %s;outline-offset:1px">'
                  '</i>decision gate</span></div>'
                  % (BLUE, AMBER, AMBER, MUT, RED))
        dominant = ('<div class="rmatrix">%s%s%s<div class="rx">Likelihood &rarr;</div>'
                    '<div class="ry">Impact &rarr;</div>%s</div>%s'
                    % (grid, ticks, xticks, "".join(cells), legend))
    else:
        dominant = _needcard(reason)

    unpl = ""
    if unplottable:
        unpl = ('<p class="why">Not plotted, because they were not scored on both axes. '
                'They are listed here rather than dropped, so the matrix is not mistaken '
                'for the whole picture: %s.</p>'
                % esc("; ".join(r.get("risk", "") for r in unplottable)))

    events = s.get("material_events") or []
    if events:
        ev = _table(["Date", "Event", "Impact", "Resolution", "Confidence"],
                    [["<td>%s</td>" % esc(e["date"]), "<td>%s</td>" % esc(e["event"]),
                      "<td class='mut'>%s</td>" % esc(e.get("impact")),
                      "<td class='mut'>%s</td>" % esc(e.get("resolution")),
                      "<td>%s</td>" % esc(e.get("confidence"))]
                     for e in events])
    else:
        ev = ('<p class="none">No material events located. This is a search result, not a '
              'clean record.</p>')

    mit = _table(["Risk", "Treatment", "Status", "Owner"],
                 [["<td>%s</td>" % esc(m["risk"]),
                   "<td class='mut'>%s</td>" % esc(m.get("treatment")),
                   "<td>%s</td>" % _pill("Not demonstrated"
                                         if m.get("status") == "not-started"
                                         else "Partially confirmed"),
                   "<td>%s</td>" % esc(m.get("owner"))]
                  for m in s.get("mitigations") or []])

    return """
    <section><h2>Impact and likelihood</h2>%(why)s%(dom)s%(unpl)s</section>
    <section><h2>Material events</h2>%(ev)s</section>
    <section><h2>Mitigation status</h2>
      <p class="hint">Risk becomes a workplan here, or it stays an observation.</p>
      %(mit)s</section>
    """ % {"why": why(reason), "dom": dominant, "unpl": unpl, "ev": ev, "mit": mit}


# ------------------------------------------------------------- 5. Lilly Fit & Diligence

def lilly_fit(s):
    fit = _table(["Factor", "Fit", "Confidence"],
                 [["<td>%s</td>" % esc(f["factor"]), "<td>%s</td>" % _pill(f["fit"]),
                   "<td class='mut'>%s</td>" % esc(f.get("confidence"))]
                  for f in s.get("lilly_fit") or []])

    hist = s.get("internal_history") or {}
    if hist.get("entries"):
        hist_html = _table(["Date", "Event"],
                           [["<td>%s</td>" % esc(e.get("date")),
                             "<td>%s</td>" % esc(e.get("event"))]
                            for e in hist["entries"]])
    else:
        hist_html = '<p class="none">%s</p>' % esc(hist.get("note") or "No history found.")

    funnel = "".join(
        '<div class="dimrow"><div class="dimname">%s</div>'
        '<div class="dimtrack"><div class="dimbar" style="width:%d%%;background:%s"></div></div>'
        '<div class="dimlabel" style="color:%s">%d%%</div><div class="dimev"></div></div>'
        % (esc(t["track"]), int(t["pct"]),
           BLUE if t["pct"] >= 50 else (AMBER if t["pct"] > 0 else LINE),
           MUT, int(t["pct"]))
        for t in s.get("diligence") or [])

    by_owner = {}
    for a in s.get("actions") or []:
        by_owner.setdefault(a.get("owner", "Unassigned"), []).append(a)
    boards = []
    for owner in sorted(by_owner):
        items = "".join(
            '<li>%s%s</li>'
            % (esc(a["action"]),
               ' <strong style="color:%s">gate</strong>' % RED if a.get("gate") else "")
            for a in by_owner[owner])
        boards.append('<div class="board"><h3>%s</h3><ul class="vl">%s</ul></div>'
                      % (esc(owner), items))

    return """
    <section><h2>Lilly fit</h2>%(fit)s</section>
    <section><h2>Internal relationship history</h2>%(hist)s</section>
    <section><h2>Diligence completeness</h2>
      <p class="hint">Percent complete per track, which replaces an open-questions
         list.</p>%(funnel)s</section>
    <section><h2>Actions by owner</h2><div class="boards">%(boards)s</div></section>
    """ % {"fit": fit, "hist": hist_html, "funnel": funnel,
           "boards": "".join(boards)}


EXTRA_CSS = """
.why{color:%(mut)s;font-size:12px;margin:6px 0 14px;font-style:normal}
.t{width:100%%;border-collapse:collapse;font-size:13px}
.t th{text-align:left;font-size:10px;letter-spacing:.08em;text-transform:uppercase;
      color:%(mut)s;font-weight:600;padding:6px 10px 6px 0;border-bottom:1px solid %(line)s}
.t td{padding:7px 10px 7px 0;border-bottom:1px solid #f2f2f2;vertical-align:top}
.t td.mut{color:%(mut)s;font-size:12px}
.pill{display:inline-block;font-size:11px;padding:1px 8px;border:1px solid;border-radius:20px}
.need{border:1px dashed %(amber)s;border-radius:3px;padding:13px 15px;font-size:13px}
.needk{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:%(amber)s;
       font-weight:700;margin-bottom:5px}
.trait{border-left:3px solid %(line)s;padding:6px 0 6px 13px;font-size:13px;color:%(mut)s}
.traitk{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:%(mut)s;
        font-weight:700;margin-bottom:4px}
.otree{display:flex;flex-wrap:wrap;gap:12px}
.onode{border:1px solid %(line)s;border-left:3px solid %(blue)s;border-radius:3px;
       padding:11px 14px;min-width:220px}
.onode.solo{max-width:380px}
.orole{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:%(mut)s}
.olabel{font-size:15px;font-weight:600;margin:2px 0}
.onote{font-size:12px;color:%(mut)s}
.scale{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1px;
       background:%(line)s;border:1px solid %(line)s}
.sc{background:#fff;padding:10px 13px}
.sc .k{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:%(mut)s}
.sc .v{font-size:13px;font-weight:600;margin-top:2px}
.deps{display:flex;flex-wrap:wrap;gap:11px}
.dep{border:1px solid %(line)s;border-left-width:3px;border-radius:3px;padding:10px 13px;
     min-width:210px;flex:1 1 210px}
.depk{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:%(mut)s}
.depn{font-size:13.5px;font-weight:600;margin:2px 0}
.depm{font-size:11.5px;color:%(mut)s}
.metric{border:1px solid %(line)s;border-radius:3px;padding:16px 18px;max-width:400px}
.mv{font-size:26px;font-weight:700}
.mk{font-size:12px;color:%(mut)s;margin-top:2px}
.ms{font-size:11px;color:%(mut)s;margin-top:6px}
.fbar{display:inline-block;margin-right:26px}
.fk{font-size:11px;color:%(mut)s}.fv{font-size:17px;font-weight:600}
.rmatrix{position:relative;height:250px;border-left:1px solid %(line)s;
         border-bottom:1px solid %(line)s;margin:8px 0 6px}
.rdot{position:absolute;width:15px;height:15px;border-radius:50%%}
.rdot.gate{border-radius:2px;outline:2px solid %(red)s;outline-offset:2px}
.rx{position:absolute;bottom:-34px;right:0;font-size:10.5px;color:%(mut)s}
.ry{position:absolute;top:-4px;left:6px;font-size:10.5px;color:%(mut)s}
.gl{position:absolute;left:0;right:0;height:1px;background:#f1f1f1}
.gv{position:absolute;top:0;bottom:0;width:1px;background:#f1f1f1}
.tk{position:absolute;left:-16px;font-size:10px;color:%(mut)s}
.tkx{position:absolute;bottom:-17px;font-size:10px;color:%(mut)s}
.rleg{display:flex;flex-wrap:wrap;gap:16px;margin:26px 0 6px}
.boards{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:22px}
.board h3{font-size:12px;letter-spacing:.06em;text-transform:uppercase;margin:0 0 7px;
          color:%(blue)s}
.spark{width:100%%;max-width:420px;height:80px}
""" % {"mut": MUT, "line": LINE, "blue": BLUE, "amber": AMBER, "red": RED}
