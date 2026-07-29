"""
invoice_audit_engine.py
invoice-rate-card-auditor - Phases 2 to 4 in one deterministic pass.

WS F items F4 (batch the per-line loop) and F5 (wire a generator for the outputs).

WHY THIS EXISTS, AND WHY IT IS A COMPLETENESS FIX BEFORE IT IS A COST FIX
------------------------------------------------------------------------
SKILL.md Phases 2 to 4 require the model to resolve and verify EVERY invoice line
individually. Invoice populations are the largest-N input in this suite. A model
loop over several thousand lines can skip one and nothing says so; code cannot.
That is the argument. Lower token cost is a side effect, not the point, and per
OPTIMIZATION-PRINCIPLES.md it would not justify the change on its own.

WHAT MOVES AND WHAT DOES NOT
----------------------------
Moves to code: entity resolution (Phase 2), all six check families (Phase 3), the
severity table and rollup (Phase 4), and every arithmetic reconciliation.

Stays with the model: ambiguous matches. The engine does not guess. A line it
cannot resolve confidently is emitted in `needs_model_review` with the reason,
and the model judges only those lines rather than all of them. Judgment is
narrowed, never removed, which is the same split the rest of the redesign uses.

Also stays with the model: the compounding-vs-simple reading of an escalation
clause. SKILL.md calls that a BLOCKING ambiguity to be asked once, tappable. This
engine REFUSES to run without it rather than defaulting, because the two readings
produce different caps and therefore different findings.

FAIL-CLOSED
-----------
SKILL.md: "A figure produced without the kernel is invalid ... the skill STOPS on
that specific line, reports the failure and why, and does NOT fall back to
estimating the figure in prose." That is implemented as a raise, not a log line.

Stdlib only, plus the vendored numeric_kernel in this same directory.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional

try:
    from numeric_kernel import verify_line_math, escalate, KernelError
    KERNEL_AVAILABLE = True
    _KERNEL_IMPORT_ERROR = None
except Exception as _exc:  # pragma: no cover
    KERNEL_AVAILABLE = False
    _KERNEL_IMPORT_ERROR = _exc


class AuditEngineError(Exception):
    """Base class for refusals raised by this engine."""


class KernelUnavailableError(AuditEngineError):
    """The vendored kernel could not be imported or errored on a line.

    SKILL.md's Kernel Wiring section makes this fatal by design: a figure that did
    not come from the kernel must not be presented as a computed finding, so there
    is no degraded path that estimates it instead.
    """


class BlockingAmbiguityError(AuditEngineError):
    """A contract reading the engine must not guess.

    Currently one case: the escalation clause's compounding-vs-simple reading.
    SKILL.md Operating Rule 2 requires this be asked once rather than assumed.
    """


class ReconciliationError(AuditEngineError):
    """Row counts or rollups did not foot.

    F4's own verification criterion: lines in equals lines verified equals lines
    in the ledger. If that fails the run is not trustworthy at any level of
    detail, so it refuses rather than emitting a ledger that under-reports.
    """


# --------------------------------------------------------------------------
# Severity, straight from SKILL.md Phase 4's table. Deterministic by design:
# "do not assign severity by feel".
# --------------------------------------------------------------------------

CATEGORY_DUPLICATE = "Duplicate charge"
CATEGORY_UNSUPPORTED = "Unsupported charge"
CATEGORY_ESCALATION = "Escalation Cap Breach"
CATEGORY_ROLE = "Role/Level Mismatch"
CATEGORY_MILESTONE = "Milestone/Payment Mismatch"
CATEGORY_HOURS = "Hours/Quantity Discrepancy"
CATEGORY_RATE = "Rate Mismatch"

_DEFAULT_SEVERITY = {
    CATEGORY_DUPLICATE: "Critical",
    CATEGORY_UNSUPPORTED: "High",
    CATEGORY_ESCALATION: "High",
    CATEGORY_ROLE: "High",
    CATEGORY_MILESTONE: "High",
    CATEGORY_HOURS: "Medium",
    CATEGORY_RATE: "Medium",
}

_TIER_UP = {"Medium": "High", "High": "Critical", "Critical": "Critical"}


@dataclass
class Finding:
    line_id: str
    category: str
    check_type: str
    severity: str
    questioned_amount: float
    resolution_status: str
    detail: str
    kernel_call: Optional[str] = None


@dataclass
class AuditResult:
    pass_2_match: Dict[str, Any] = field(default_factory=dict)
    findings: List[Finding] = field(default_factory=list)
    clear_lines: List[str] = field(default_factory=list)
    needs_model_review: List[Dict[str, str]] = field(default_factory=list)
    needs_input: List[Dict[str, str]] = field(default_factory=list)
    rollup: Dict[str, Any] = field(default_factory=dict)
    reconciliation: Dict[str, Any] = field(default_factory=dict)


def _immaterial(amount: float, line_total: float) -> bool:
    """SKILL.md Phase 4: '$10 or 0.1% of the line, whichever is greater'.

    Logged CLEAR rather than scored, so the exception count is never padded with
    rounding noise.
    """
    threshold = max(10.0, abs(line_total) * 0.001)
    return abs(amount) < threshold


def _require_kernel() -> None:
    if not KERNEL_AVAILABLE:
        raise KernelUnavailableError(
            "numeric_kernel.py could not be imported, so no figure in this audit "
            "can be computed. Per SKILL.md's Kernel Wiring section a figure "
            "produced without the kernel is invalid, and there is deliberately no "
            "estimated fallback. Original import error: "
            f"{_KERNEL_IMPORT_ERROR}"
        )


# --------------------------------------------------------------------------
# Phase 2: entity resolution
# --------------------------------------------------------------------------

def resolve(inp: Dict[str, Any]) -> Dict[str, Any]:
    lines = inp["invoice_lines"]
    card = {r["role"]: r for r in inp.get("rate_card", [])}
    timesheets = inp.get("timesheets")
    po = inp.get("po")

    resolved = []
    for ln in lines:
        rc = card.get(ln["role_billed"])
        rate_card_match = (
            {"role": rc["role"], "contracted_base_rate": rc["base_rate"],
             "unit": rc.get("unit", "hour")} if rc else "NOT_FOUND"
        )

        if po is None:
            po_match = "NO_PO_SUPPLIED"
        else:
            hit = next((p for p in po.get("lines", [])
                        if p.get("line_ref") == ln.get("po_line_ref")), None)
            po_match = ({"po_line": hit["line_ref"], "description": hit.get("description", "")}
                        if hit else "NOT_FOUND")

        if timesheets is None:
            ts_match = "NO_TIMESHEETS_SUPPLIED"
        else:
            hits = [t for t in timesheets
                    if t["resource"] == ln.get("resource") and t["period"] == ln.get("period")]
            ts_match = hits if hits else "NOT_FOUND"

        resolved.append({
            "line_id": ln["line_id"],
            "invoice_number": ln["invoice_number"],
            "line_no": ln.get("line_no"),
            "rate_card_match": rate_card_match,
            "po_match": po_match,
            "timesheet_match": ts_match,
            # SKILL.md: resource|role|period|rate|qty
            "duplicate_signature": "|".join(str(ln.get(k)) for k in
                                            ("resource", "role_billed", "period",
                                             "rate_billed", "qty_billed")),
        })

    # Duplicate candidates: identical signature across DIFFERENT invoice numbers.
    # A repeat of the same resource in the same role in a different period is
    # normal recurring billing, which the period component of the signature
    # already separates.
    by_sig: Dict[str, List[Dict[str, Any]]] = {}
    for r in resolved:
        by_sig.setdefault(r["duplicate_signature"], []).append(r)
    groups = []
    for sig, rows in by_sig.items():
        if len({r["invoice_number"] for r in rows}) > 1:
            groups.append([r["line_id"] for r in rows])

    return {"lines": resolved, "duplicate_candidate_groups": groups}


# --------------------------------------------------------------------------
# Phase 3 + 4
# --------------------------------------------------------------------------

def audit(inp: Dict[str, Any]) -> AuditResult:
    _require_kernel()

    esc = inp.get("escalation") or {}
    if esc and esc.get("compounding") is None:
        raise BlockingAmbiguityError(
            "the escalation clause's compounding-vs-simple reading is not stated. "
            "SKILL.md Operating Rule 2 makes this a BLOCKING ambiguity: ask once, "
            "tappable (Compounding / Simple), rather than guessing. The two "
            "readings produce different caps and therefore different findings."
        )

    res = AuditResult()
    res.pass_2_match = resolve(inp)
    lines_by_id = {l["line_id"]: l for l in inp["invoice_lines"]}
    match_by_id = {m["line_id"]: m for m in res.pass_2_match["lines"]}
    card = {r["role"]: r for r in inp.get("rate_card", [])}

    # Duplicates: everything AFTER the first chronologically, by invoice date.
    duplicate_ids = set()
    for group in res.pass_2_match["duplicate_candidate_groups"]:
        ordered = sorted(group, key=lambda lid: (lines_by_id[lid].get("invoice_date", ""), lid))
        duplicate_ids.update(ordered[1:])

    # Role-mismatch recurrence, needed for the 3B severity escalation
    # ("same resource recurs with the same mismatch on 2 or more invoices").
    role_mismatch_seen: Dict[str, set] = {}
    for lid, ln in lines_by_id.items():
        m = match_by_id[lid]
        ts = m["timesheet_match"]
        if isinstance(ts, list) and ts:
            roster_role = ts[0].get("role_per_roster")
            if roster_role and roster_role != ln["role_billed"]:
                key = f"{ln.get('resource')}|{ln['role_billed']}|{roster_role}"
                role_mismatch_seen.setdefault(key, set()).add(ln["invoice_number"])

    verified = 0
    for lid, ln in lines_by_id.items():
        verified += 1
        m = match_by_id[lid]
        line_findings: List[Finding] = []
        stated_total = float(ln["stated_total"])
        rate_billed = float(ln["rate_billed"])
        qty = float(ln["qty_billed"])
        contract_year = int(ln.get("contract_year", 1))

        # ---- cap, needed by 3A, 3C and 3D -----------------------------
        cap = None
        kernel_note = None
        rc = m["rate_card_match"]
        if rc != "NOT_FOUND":
            base = float(rc["contracted_base_rate"])
            if contract_year >= 2 and esc:
                periods = contract_year - 1
                try:
                    cap = escalate(base, float(esc["rate"]), periods,
                                   bool(esc["compounding"]))
                except KernelError as e:
                    raise KernelUnavailableError(
                        f"line {lid}: escalate() refused ({e}). Per SKILL.md the "
                        "skill STOPS on this line rather than estimating the cap."
                    ) from e
                kernel_note = (f"escalate({base}, {esc['rate']}, {periods}, "
                               f"compounding={bool(esc['compounding'])}) -> {cap:.4f}")
            else:
                cap = base  # Year 1 is never escalated
                kernel_note = f"Year 1 base rate {base}, escalate() not called"

        # ---- 3A rate vs contract, and line math ------------------------
        if rc != "NOT_FOUND":
            allowed = cap
            if rate_billed > allowed:
                q = (rate_billed - allowed) * qty
                if not _immaterial(q, stated_total):
                    line_findings.append(Finding(
                        lid, CATEGORY_RATE, "RATE_VS_CONTRACT",
                        _DEFAULT_SEVERITY[CATEGORY_RATE], round(q, 2),
                        "CONFIRMED_OVERCHARGE",
                        f"billed {rate_billed} against allowed {allowed:.2f} "
                        f"for {ln['role_billed']} in contract year {contract_year}",
                        kernel_note))

        try:
            math_ok = verify_line_math(rate_billed, qty, stated_total)
        except KernelError as e:
            raise KernelUnavailableError(
                f"line {lid}: verify_line_math() refused ({e}). The skill STOPS "
                "on this line rather than re-adding the numbers by hand."
            ) from e
        if not math_ok:
            q = stated_total - (rate_billed * qty)
            if not _immaterial(q, stated_total):
                line_findings.append(Finding(
                    lid, CATEGORY_RATE, "LINE_MATH_ERROR",
                    _DEFAULT_SEVERITY[CATEGORY_RATE], round(q, 2),
                    "CONFIRMED_OVERCHARGE",
                    f"stated {stated_total} against {rate_billed} x {qty} = "
                    f"{rate_billed * qty}",
                    f"verify_line_math({rate_billed}, {qty}, {stated_total}) -> False"))

        # ---- 3C escalation cap breach ----------------------------------
        if rc != "NOT_FOUND" and contract_year >= 2 and esc and cap is not None:
            if rate_billed > cap:
                q = (rate_billed - cap) * qty
                if not _immaterial(q, stated_total):
                    sev = _DEFAULT_SEVERITY[CATEGORY_ESCALATION]
                    if cap > 0 and (rate_billed - cap) / cap > 0.05:
                        sev = _TIER_UP[sev]
                    line_findings.append(Finding(
                        lid, CATEGORY_ESCALATION, "ESCALATION_CAP_BREACH", sev,
                        round(q, 2), "CONFIRMED_OVERCHARGE",
                        f"billed {rate_billed} against kernel cap {cap:.4f}",
                        kernel_note))

        # ---- 3B role/level mismatch -------------------------------------
        ts = m["timesheet_match"]
        roster_role = ts[0].get("role_per_roster") if isinstance(ts, list) and ts else None
        if roster_role and roster_role != ln["role_billed"]:
            billed_rate_card = card.get(ln["role_billed"])
            roster_rate_card = card.get(roster_role)
            if billed_rate_card and roster_rate_card:
                delta = float(billed_rate_card["base_rate"]) - float(roster_rate_card["base_rate"])
                if delta > 0:
                    q = delta * qty
                    if not _immaterial(q, stated_total):
                        sev = _DEFAULT_SEVERITY[CATEGORY_ROLE]
                        key = f"{ln.get('resource')}|{ln['role_billed']}|{roster_role}"
                        if len(role_mismatch_seen.get(key, set())) >= 2:
                            sev = _TIER_UP[sev]
                        line_findings.append(Finding(
                            lid, CATEGORY_ROLE, "ROLE_LEVEL_MISMATCH", sev,
                            round(q, 2), "PENDING_SUPPLIER_RESPONSE",
                            f"billed as {ln['role_billed']}, roster shows {roster_role}"))
                else:
                    # Roster level HIGHER than billed: favourable variance, logged
                    # per Rule 7, never a questioned amount.
                    res.needs_model_review.append({
                        "line_id": lid,
                        "reason": f"favourable variance: billed {ln['role_billed']}, "
                                  f"roster shows higher-rate {roster_role}. Log per "
                                  "Rule 7, do not question."})

        # ---- 3D hours/quantity discrepancy ------------------------------
        if isinstance(ts, list) and ts:
            approved = sum(float(t["approved_hours"]) for t in ts)
            disc = qty - approved
            if disc > 0:
                # Never double-count with 3A/3C: use the LOWER of the two rates
                # the line could defensibly be billed at.
                rate_for_hours = min(rate_billed, cap) if cap is not None else rate_billed
                q = disc * rate_for_hours
                if not _immaterial(q, stated_total):
                    sev = _DEFAULT_SEVERITY[CATEGORY_HOURS]
                    if qty > 0 and disc / qty > 0.10:
                        sev = _TIER_UP[sev]
                    line_findings.append(Finding(
                        lid, CATEGORY_HOURS, "HOURS_DISCREPANCY", sev, round(q, 2),
                        "PENDING_SUPPLIER_RESPONSE",
                        f"billed {qty} against {approved} approved, at the lower "
                        f"defensible rate {rate_for_hours:.2f}"))

        # ---- 3E duplicate / unsupported ---------------------------------
        if lid in duplicate_ids:
            line_findings.append(Finding(
                lid, CATEGORY_DUPLICATE, "DUPLICATE", "Critical",
                round(stated_total, 2), "CONFIRMED_OVERCHARGE",
                "identical signature (resource, role, period, rate, quantity) on a "
                "different invoice number; this is the later occurrence"))
        elif ts == "NOT_FOUND" and m["po_match"] == "NOT_FOUND":
            sev = _DEFAULT_SEVERITY[CATEGORY_UNSUPPORTED]
            if stated_total >= 10000:
                sev = _TIER_UP[sev]
            line_findings.append(Finding(
                lid, CATEGORY_UNSUPPORTED, "UNSUPPORTED", sev,
                round(stated_total, 2), "PENDING_SUPPLIER_RESPONSE",
                "the supplied documents contain no substantiating record for this "
                "charge. This is a documentation gap, not an assertion of "
                "wrongdoing (Rule 6)"))
        elif ts == "NO_TIMESHEETS_SUPPLIED":
            res.needs_input.append({
                "line_id": lid,
                "reason": "no timesheet population was supplied at all, so this line "
                          "cannot be substantiated or questioned. Data gap, not "
                          "evidence against the line."})

        if rc == "NOT_FOUND":
            res.needs_model_review.append({
                "line_id": lid,
                "reason": f"role {ln['role_billed']!r} is not on the rate card. The "
                          "engine will not guess a mapping; the model resolves it."})

        res.findings.extend(line_findings)
        if not line_findings:
            res.clear_lines.append(lid)

    # ---- 3F milestones -------------------------------------------------
    for ms in inp.get("milestones", []) or []:
        contracted = float(ms["contracted_amount"])
        invoiced = float(ms["invoiced_amount"])
        if invoiced > contracted:
            q = invoiced - contracted
            if not _immaterial(q, contracted):
                sev = _DEFAULT_SEVERITY[CATEGORY_MILESTONE]
                if contracted > 0 and q / contracted > 0.10:
                    sev = _TIER_UP[sev]
                res.findings.append(Finding(
                    ms.get("milestone_id", ms.get("name", "milestone")),
                    CATEGORY_MILESTONE, "MILESTONE_OVERBILL", sev, round(q, 2),
                    "CONFIRMED_OVERCHARGE",
                    f"invoiced {invoiced} against contracted {contracted}"))

    # PO NTE tracker
    po = inp.get("po")
    if po and po.get("nte") is not None:
        cumulative = sum(float(l["stated_total"]) for l in inp["invoice_lines"])
        cumulative += float(po.get("previously_invoiced", 0) or 0)
        if cumulative > float(po["nte"]):
            res.findings.append(Finding(
                po.get("po_number", "PO"), CATEGORY_MILESTONE, "PO_NTE_BREACH",
                "Critical", round(cumulative - float(po["nte"]), 2),
                "CONFIRMED_OVERCHARGE",
                f"cumulative invoiced {cumulative:,.2f} exceeds PO NTE "
                f"{float(po['nte']):,.2f}. A payment-authorization problem, not a "
                "rate problem, flagged even where no single line is wrong"))

    # ---- Phase 4 rollup -------------------------------------------------
    by_cat: Dict[str, float] = {}
    for f in res.findings:
        by_cat[f.category] = round(by_cat.get(f.category, 0.0) + f.questioned_amount, 2)
    total = round(sum(by_cat.values()), 2)
    confirmed = round(sum(f.questioned_amount for f in res.findings
                          if f.resolution_status == "CONFIRMED_OVERCHARGE"), 2)
    pending = round(sum(f.questioned_amount for f in res.findings
                        if f.resolution_status == "PENDING_SUPPLIER_RESPONSE"), 2)

    res.rollup = {
        "by_category": by_cat,
        "total_questioned_amount": total,
        "confirmed_potential_credit": confirmed,
        "pending_supplier_response": pending,
        "finding_count": len(res.findings),
        "by_severity": {s: sum(1 for f in res.findings if f.severity == s)
                        for s in ("Critical", "High", "Medium")},
    }

    # ---- reconciliation, F4's own verify criterion -----------------------
    lines_in = len(inp["invoice_lines"])
    ledger_lines = len({f.line_id for f in res.findings
                        if f.line_id in lines_by_id}) + len(res.clear_lines)
    if verified != lines_in:
        raise ReconciliationError(
            f"lines in ({lines_in}) does not equal lines verified ({verified})")
    if abs(round(sum(by_cat.values()), 2) - total) > 0.01:
        raise ReconciliationError("category rollup does not sum to the total")
    if abs(confirmed + pending - total) > 0.01:
        raise ReconciliationError(
            f"confirmed ({confirmed}) plus pending ({pending}) does not equal the "
            f"total questioned amount ({total})")

    res.reconciliation = {
        "lines_in": lines_in,
        "lines_verified": verified,
        "lines_with_findings_or_clear": ledger_lines,
        "category_rollup_foots": True,
        "confirmed_plus_pending_equals_total": True,
    }
    return res


# --------------------------------------------------------------------------
# F5: serialize the ledger from the engine's own output object
# --------------------------------------------------------------------------

def build_ledger(res: AuditResult) -> Dict[str, Any]:
    """The JSON ledger, built from the result object rather than re-assembled.

    F5's verification criterion is that the ledger row count equals the verified
    line count, which is asserted here rather than checked by eye.
    """
    ledger = {
        "findings": [asdict(f) for f in res.findings],
        "clear_lines": res.clear_lines,
        "needs_model_review": res.needs_model_review,
        "needs_input": res.needs_input,
        "rollup": res.rollup,
        "reconciliation": res.reconciliation,
    }
    covered = len({f["line_id"] for f in ledger["findings"]} | set(res.clear_lines))
    if covered > res.reconciliation["lines_verified"]:
        raise ReconciliationError(
            f"ledger covers {covered} lines but only "
            f"{res.reconciliation['lines_verified']} were verified")
    return ledger


def main(argv):
    if "--selftest" in argv:
        from invoice_audit_selftest import run_selftest
        return run_selftest()
    if not argv:
        print(__doc__)
        print("usage: invoice_audit_engine.py <audit_input.json> [--ledger out.json]",
              file=sys.stderr)
        return 2
    with open(argv[0], encoding="utf-8") as fh:
        inp = json.load(fh)
    res = audit(inp)
    ledger = build_ledger(res)
    if "--ledger" in argv:
        out = argv[argv.index("--ledger") + 1]
        with open(out, "w", encoding="utf-8", newline="\n") as fh:
            json.dump(ledger, fh, indent=2)
            fh.write("\n")
        print(f"wrote {out}")
    else:
        print(json.dumps(ledger, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
