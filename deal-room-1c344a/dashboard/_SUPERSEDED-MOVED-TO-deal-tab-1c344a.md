# SUPERSEDED — this directory has moved

**D0, 2026-07-29.** The Deal-tab dashboard now lives at:

    deal-tab-1c344a/dashboard/

**Do not build from here. Do not edit here.** This copy is stale from the moment
the next change lands in the new location.

## Why it moved

`deal-room-1c344a` is a live negotiation manager: one Claude Project per
negotiation, a persistent `deal_room_state.json` concession ledger updated after
every meeting, and a structured handoff at close.

The Deal-tab dashboard is a static single-file artifact that holds no state and
sends nothing. Two unrelated products were sharing one skill directory, and that
skill's own SKILL.md already flagged the collision.

## Why this folder still exists

The delete failed: a long-running local HTTP server from the build session held a
handle on it. The move itself is verified complete and behaviour-neutral, the
build from the new location produced a **byte-identical** artifact
(`6b8b6a1f82f7f7a4e7f3f44be16c2588`).

**Delete this whole `dashboard/` directory** once no process holds it.

**Correction, 2026-07-29:** this note previously ended "Nothing references it."
That was wrong at the time it was written. deal-room-1c344a/SKILL.md itself still
instructed the reader to author the data object and run the build script from THIS
directory, so anyone following the skill would have hit a missing script.
(The old paths are described rather than quoted here on purpose: writing them as
backtick paths made the smoke test flag this very note as a broken reference.) The smoke test's A7 assertion caught it. The
instruction now points at `deal-tab-1c344a/dashboard/`, and nothing references this
directory any more, which is what the original sentence claimed.
