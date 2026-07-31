# Process Calibration — Source of Truth for Timeline Durations

**Lilly process calibration, provided by Marc Lane (Associate Director, IT Procurement).**
**Status as of 2026-07-30: SCAFFOLD ONLY — durations below are carried forward unchanged
from `timeline_engine.py`'s prior baked-in defaults. They have not yet been reconfirmed by
Marc as his actual calibration, and the Prerequisite/Gate/Owner columns are placeholders.
Do not treat this file as sourced until Marc has reviewed and confirmed each row.**

This is a Lilly-internal process calibration, not an external benchmark. It exists so
`timeline_engine.py` computes against an attributed, editable, dated source instead of
anonymous "baked-in defaults" — a number with no owner and no way to tell if it's still
right. Per G13 (the suite's source ladder), every duration below carries a Basis and a
Confirmed date; until Marc confirms a row, its Basis reads "carried over, unconfirmed" and
it should be treated as rung 4 (general principle, not Lilly-verified), not rung 1.

**How this interacts with the live Q1/Q2/Q3 calibration questions already in the skill:**
those three in-conversation questions (SOW-under-existing-MSA, New MSA, SOW-with-amendment)
still let a user override the Base value for that one specific engagement when they know it
will run faster or slower than typical. This file sets the *default* every engagement starts
from; the live questions are a per-run refinement on top of it, not a replacement for it.

**How to update:** replace a row's Low/Base/High and Basis/Confirmed columns, or walk Marc's
updated numbers through in a session and have them written back here. `timeline_engine.py`
does not need to change shape — only the source of these values changes over time (from
Marc's direct calibration today, to `rfp-case-manager`'s tracked case durations or Ariba
workflow timestamps once enough real data exists, per the same Basis/Confirmed columns).

---

## 1. Sourcing Phase

| Sourcing type | Prerequisite | Gate / Owner | Low (wk) | Base (wk) | High (wk) | Basis | Confirmed |
|---|---|---|---|---|---|---|---|
| None | TBD | TBD | 0 | 0 | 0 | carried over, unconfirmed | — |
| RFI only | TBD | TBD | 3 | 4 | 5 | carried over, unconfirmed | — |
| RFQ | TBD | TBD | 4 | 5 | 6 | carried over, unconfirmed | — |
| RFP | TBD | TBD | 8 | 11 | 14 | carried over, unconfirmed | — |
| Multi-stage | TBD | TBD | 10 | 14 | 18 | carried over, unconfirmed | — |

## 2. Negotiation Phase, by Contract Instrument

| Instrument | Prerequisite | Gate / Owner | Low (wk) | Base (wk) | High (wk) | Basis | Confirmed |
|---|---|---|---|---|---|---|---|
| PO / T&Cs | TBD | TBD | 2 | 3 | 4 | carried over, unconfirmed | — |
| Short-form agreement | TBD | TBD | 4 | 6 | 8 | carried over, unconfirmed | — |
| SOW under existing MSA | TBD | TBD | 4 | 6 | 8 | carried over, unconfirmed (live Q1 can override Base) | — |
| SOW with MSA amendment | TBD | TBD | 8 | 10 | 12 | carried over, unconfirmed (live Q3 can override Base) | — |
| New MSA (full negotiation) | TBD | TBD | 14 | 20 | 26 | carried over, unconfirmed (live Q2 can override Base) | — |
| Master agreement amendment | TBD | TBD | 4 | 6 | 8 | carried over, unconfirmed | — |

**Redline turns** (added per negotiation round):

| | Low (wk) | Base (wk) | High (wk) | Basis | Confirmed |
|---|---|---|---|---|---|
| Per turn | 1.5 | 2.25 | 3.0 | carried over, unconfirmed | — |

| Instrument | Default turn count if unknown | Basis |
|---|---|---|
| PO/T&Cs, Short-form | 1 | carried over, unconfirmed |
| SOW (existing MSA or amendment) | 2 | carried over, unconfirmed |
| New MSA | 3 | carried over, unconfirmed |
| Master agreement amendment | 2 | **judgment call, not in original source** — confirm with Marc, this was never an actual stated default |

## 3. Risk / Compliance Reviews (concurrent with negotiation)

| Review | Prerequisite | Gate / Owner | Low (wk) | Base (wk) | High (wk) | Basis | Confirmed |
|---|---|---|---|---|---|---|---|
| TPRM | TBD | TBD | 2 | 3 | 4 | carried over, unconfirmed | — |
| SAE (cyber security) | TBD | TBD | 4 | 15 | 26 | carried over, unconfirmed | — |
| Privacy | TBD | TBD | 4 | 8 | 12 | carried over, unconfirmed | — |
| AIR (AI review) | TBD | TBD | 4 | 8 | 12 | carried over, unconfirmed | — |

## 4. Onboarding (concurrent with negotiation)

| | Prerequisite | Gate / Owner | Low (wk) | Base (wk) | High (wk) | Basis | Confirmed |
|---|---|---|---|---|---|---|---|
| Supplier onboarding | TBD | TBD | 3 | 4 | 5 | carried over, unconfirmed | — |

## 5. Pilot (optional, concurrent or sequential per deal)

| Pilot type | Prerequisite | Gate / Owner | Low (wk) | Base (wk) | High (wk) | Basis | Confirmed |
|---|---|---|---|---|---|---|---|
| None | TBD | TBD | 0 | 0 | 0 | carried over, unconfirmed | — |
| Shallow eval | TBD | TBD | 2 | 2.5 | 3 | carried over, unconfirmed | — |
| Medium pilot | TBD | TBD | 5 | 7.5 | 10 | carried over, unconfirmed | — |
| Deep PoC (3-6 months) | TBD | TBD | 14 | 20 | 26 | carried over, unconfirmed | — |

## 6. Sanity ceiling

Total critical path exceeding **78 weeks (18 months)** trips a sanity check — carried over, unconfirmed.

---

**Next step:** walk through the actual Lilly process flow with Claude in a future session —
what has to happen before what (Prerequisite), who/what gates each step (Gate / Owner), and
whether the durations above still hold or need to change. Each row updates independently; you
don't need to redo the whole table at once.
