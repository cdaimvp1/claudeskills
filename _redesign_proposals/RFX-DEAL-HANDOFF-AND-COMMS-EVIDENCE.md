# Canonical: RFx to Deal handoff + shared comms-evidence methodology (#3 / #6)

Status: canonical contract for two cross-skill concerns. Both are reflect-only, claim-gated (foundation
guardrail G12), Desktop-runnable, and commodity-neutral. Skills reference these; they do not each reinvent them.

Governance: never-regress the feeding/consuming skills (branch, do not replace their standalone deliverables);
compose-not-duplicate; integrate-or-don't-ship (the consumer side, deal-room, is wired now; the emitter side,
rfx-hub, implements this when it is built).

---

## PART 1 (#3): The RFx -> Deal handoff object (canonical)

The authoritative schema is `RfxToDealHandoff` in `RFx-REDESIGN-SPEC.md` section C (do not fork it). Summary:

```
RfxToDealHandoff {
  selectedSupplier { id, name, advisoryTier }
  requirementModel { categoryCount, mustHaveCount, note: "weights locked at scoring" }
  normalizedTco { allInUnit, denominatorUnit, components[], reconciliation, tag: "indicative - firm in negotiation" }
  awardConditions[]        // gate-pass status, mandatory-review outcomes
  openIssues[]             // open gating clarifications, unresolved gateConflict
  commitments[]            // supplier-stated terms / escalator / exit (or "to be negotiated")
  risks[]                  // red-flags, high-variance cells, fragile-sensitivity note
  evidence[] { claim, sourceRef }   // a citation backs every carried finding (claim-gate)
  conformanceStatus        // "Conforming" | open gating item
  provenanceNote: "financial-viability grade and exit terms re-validated during negotiation"
  draft: true              // nothing locked; Deal owns everything after selection
}
```

**Emitter:** the `rfx-hub` "Send winner to Deal dashboard" action (built when rfx-hub is built). RFx never
writes past selection.

**Consumer (WIRED NOW): `deal-room-1c344a`.** Deal Room accepts a `RfxToDealHandoff` as a Phase 1 opening-
strategy seed, exactly alongside a commercial/legal-negotiation-prep seed. Mapping into deal-room's intake:
- `selectedSupplier` -> deal meta (supplier, advisory tier is context only, not a position).
- `requirementModel` + `commitments[]` + `awardConditions[]` -> the initial `issues[]` (each becomes an issue
  with opening/target positions where the commitment implies one; `commitments[]` labeled "to be negotiated"
  stay open, never treated as agreed).
- `normalizedTco` -> Economics seed (tagged "indicative - firm in negotiation"; the negotiation re-derives).
- `openIssues[]` + `risks[]` -> initial open issues / watch items.
- `evidence[]` -> provenance carried onto each seeded issue (so the ledger's first row is already cited).
- `draft:true` and `provenanceNote` -> Deal Room re-validates viability/exit terms in negotiation; nothing
  from RFx is treated as locked.

**Claim-gate on the seam:** every seeded issue carries its `sourceRef`; a commitment with no citation is seeded
as an OPEN issue labeled `[CONFIRM ...]`, never as an agreed position (no fabricated starting agreement).

---

## PART 2 (#6): Shared comms-evidence methodology

The single methodology every skill uses to turn communications (emails, meeting notes, portal messages, call
recaps) into CITED evidence of commitments and alignment. It exists so deal-room, the negotiation-prep skills,
and rfx-hub all read comms the same disciplined, non-fabricating way. It is an application of claim-gate (G12).

**Method (5 steps):**
1. **Extract** each commitment or material statement with its source: who said it, when, in which channel.
   No source, no extraction; do not infer a commitment that was not stated.
2. **Classify** each into one state: `aligned` (both sides agree), `conditional` (agreed if X), `pending`
   (awaiting a party or an approval), `contradicted` (a later statement conflicts an earlier one), `open`
   (raised, not resolved). States carry non-stoplight tones (aligned = teal, conditional/attention = burnt-
   orange, contradicted = deep rust, pending/info = muted blue, open = neutral).
3. **Cite or abstain** (G12): every rendered commitment shows an evidence badge (source + date/channel). A
   commitment that cannot be cited is shown as `[CONFIRM ...]`, never asserted as fact. Never fabricate a
   commitment, an alignment, or a "supplier agreed" to fill the map.
4. **Confidence-label** the read: a comms read is best-effort (High / Medium / Low), stated as such, because
   tone and intent in correspondence are inferred, not certain.
5. **Render** as a commitment-alignment map (the consumer's Communications surface) and feed the "who holds
   the pen" read (which party currently owns the redline, confidence-labeled) where the consumer has one.

**Anti-fabrication (hard, from G12 + supplier-risk discipline):** never assert a commitment, an alignment, a
"supplier confirmed", or a pen-holder without a cited source; "not verified in the correspondence provided" is
the answer. A contradiction is flagged, never silently resolved in one side's favor.

**Consumers:**
- `deal-room-1c344a`: the **Communications** subtab (commitment-alignment map) and the Overview **pen band**
  (who holds the redline) both follow this methodology. WIRED NOW (pointer added).
- `commercial-negotiation-prep-1c344a` / `legal-negotiation-prep-1c344a`: ground "predicted supplier pushback"
  in cited prior correspondence where available, or label it an inference (never a fabricated quote).
- `rfx-hub` (future): the Q&A distribution + comms-discipline anomaly flag are surface-only reads under this
  methodology (reflect, never auto-chase).

**Why shared, not per-skill:** one methodology means the pen-read in Deal, the pushback grounding in prep, and
the comms-anomaly flag in RFx all obey the same cite-or-abstain rule, so a claim that crosses skills (an RFx
Q&A answer becoming a Deal commitment) keeps its citation the whole way.
