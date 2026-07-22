# Personal Command Center - Canonical Board (v2.5)

`references/field-guide-engine.html` is the canonical implementation. This file is its written spec. The engine is a complete, self-contained board; the skill does not rebuild it. Each run the skill replaces the contents of the `#fgData` JSON island (see below) with the current view and emits the file as an artifact (SKILL.md Step 7). The board's display name is "Personal Command Center"; the skill id, storage key, and state-file name are unchanged (see Persistence).

## What changed in v2.5 (Personal Command Center) and why

v2.4 was a two-lane board (Issues, Meeting Prep) whose per-run data was an inline `var FG_DELTA = {...}` JavaScript object literal. v2.5 keeps every v2.4 behavior and adds four things, all backward compatible:

- **Data-object-first with JSON-parse isolation (the key robustness change).** The per-run payload now lives in an inert `<script type="application/json" id="fgData">` island, parsed defensively by `readDelta()` inside a try/catch. A malformed payload can no longer break the surrounding script or blank the board: `readDelta()` returns null, `fgBoot` loads and renders the stored graph instead, and a non-blocking banner explains that this run's update could not be read. The skill now emits DATA (JSON), not CODE, which is far less breakable than a JS literal embedding HTML strings.
- **Richer work graph.** A deterministic KPI strip (Open, Action now, Waiting, Meetings ahead, Aged) and a filter/lens bar (search + party/status/topic/channel chips with a live "N of M" count) over the Issues lane.
- **Abstaining next best action.** Each issue can carry a confidence read and abstain when signal is weak, instead of a fabricated recommendation. A ranked "Next best actions" block (with why-chips), a "needs more signal" line, and a "Waiting on others" list surface on the Issues home.
- **Comms depiction + on-demand analytical views.** A third lane, Comms (a topic-river with status-ringed convergence nodes plus a per-topic activity/tempo heat row), and three views offered only when their data is present: Renewals radar, My Savings, Report Card.

The two original v2.4 constraints are unchanged: the engine hands off via `window.sendPrompt(text)` (clipboard fallback otherwise), and Claude refreshes by re-emitting the board each run; the artifact never calls out to M365, and `window.storage` is readable only by the artifact, never by Claude.

## Structure (three lanes + on-demand views)

Dark LDS styling. Header band: the **Personal Command Center** wordmark with the "Theo's Field Guide" signature sub-tag and the dino, a Synced stamp, Export / Import controls, and (when their data is present) view buttons for Renewals / Savings / Report Card. A KPI strip sits below the header. Footer: Theo paces with a walk cycle and the occasional roar.

Three lanes, switched at the top left:
- **Issues.** A filter/lens bar and left rail of issue rows above a right detail panel. Rows show a priority dot (high / med), id, title, a due label, and age. Sort buttons reorder the rail: **Priority**, **Aged**, **Newest**. Selecting a row fills the panel with the issue's current state (`state_md`) and the recommended next move. The next-move zone shows a confidence pill; when the issue abstains (`abstain:true` or `confidence:"low"`) it renders a grounded abstention (the reason and what would resolve it) instead of a fabricated `rec_md`. A direction box stages an instruction; the footer counts staged directions; one **Submit** sends them all in a single turn. The Issues home also shows the ranked Next best actions, a needs-more-signal line, and a Waiting-on list.
- **Meeting Prep.** The next meetings, each with prep notes (`prep_md`). Read-only. A hidden-items note can render at the foot of the list.
- **Comms.** A topic-river laid out as fixed topic lanes over a date axis with smoothed thread paths and status-ringed convergence nodes (Agreed / Open / Disputed / Flagged; no green as a status color), plus a per-topic activity/tempo heat row that flags stalls. Selecting a node shows its label and citation in the panel. Empty state when no `comms` data is supplied.

On-demand views (a view button appears only when the run supplies the data):
- **Renewals radar** - issues carrying `renewal:{expiry, notice_by, auto_renew}`, soonest-first, with days-to-expiry, the notice-by date (overdue notice flagged), the auto-renew flag, and the Renew / Renegotiate / Recompete recommendation from the issue's `rec_md`.
- **My Savings** - a `savings` object: achieved hero number, cost-improvement vs cost-avoidance split, target-to-go, and a pipeline list with status pips.
- **Report Card** - a `reportCard` object: GPA, a per-category graded list, and one bandwidth (load vs sustainable) gauge.

On load with nothing selected, the panel shows a welcome panel explaining the lanes and the stage-then-submit flow.

## #fgData contract (what the skill injects each run)

Replace the CONTENTS of the `<script type="application/json" id="fgData">` block with valid JSON in this shape. It is parsed defensively; a bad payload degrades to the saved board, never a blank screen. All fields except `issues` are optional; an omitted section simply hides its surface. Issue ids MUST be deterministic slugs (same real issue -> same id every run) because the engine cannot read prior state back to Claude.

```json
{
  "synced": "Jul 22, 9:12 AM CDT",
  "today": "2026-07-22",
  "issues": [
    {
      "id": "veeva/vault-crm-transition",
      "title": "Veeva Vault CRM transition",
      "party": "Veeva",
      "priority": "high",                 // "high" | "med"
      "state": "action",                  // "action" | "waiting"
      "topic": "Renewal",                 // optional; feeds the filter/lens + comms
      "channel": "Email",                 // optional; feeds the filter/lens
      "confidence": "high",               // optional; "high" | "med" | "low"
      "abstain": false,                   // optional; true (or confidence "low") -> abstention state
      "abstain_reason": "...",            // optional; grounded reason signal is missing
      "abstain_resolve": "...",           // optional; what would resolve it
      "due": "Jul 25", "dueSoon": true,   // optional
      "opened": "Jul 8", "age": "14d",    // optional
      "unblocks": "steering review",      // optional; feeds a why-chip
      "renewal": { "expiry": "2026-08-20", "notice_by": "2026-08-05", "auto_renew": true }, // optional; drives Renewals radar
      "state_md": "<p>where it stands</p>",
      "rec_md": "<p>recommended next move</p>",
      "close": false                      // optional; true drops the issue from the board
    }
  ],
  "meetings": [                           // optional; null to keep stored
    { "id": "mtg-veeva-steering", "day": "Thu Jul 24", "time": "10:00 AM",
      "who": "Veeva + steering committee", "soon": true,
      "link": "veeva/vault-crm-transition", "prep_md": "<p>...</p>" }
  ],
  "hidden_note": "...",                    // optional; null to keep stored
  "comms": {                              // optional; whole Comms lane hides if absent
    "topics": [ { "id": "renewal", "label": "Renewal terms" } ],
    "nodes":  [ { "topic": "renewal", "date": "2026-07-08", "status": "Open",
                  "label": "...", "cite": "Email: ..." } ],   // status: Agreed | Open | Disputed | Flagged
    "flow":   [ { "topic": "renewal", "days": [0,1,0,2,1,0,3, "... 28 day-intensity ints 0-3"] } ]
  },
  "savings": {                            // optional; Savings view hides if absent
    "committed": 3200000, "achieved": 2600000, "ci": 1720000, "ca": 880000,
    "target": 4000000,
    "pipeline": [ { "name": "Veeva renegotiation", "amount": 240000, "status": "committed" } ] // status: committed | pending | achieved
  },
  "reportCard": {                         // optional; Report Card view hides if absent
    "gpa": 3.4,
    "categories": [ { "name": "On-time delivery", "value": 92, "target": 95, "grade": "B+" } ],
    "bandwidth": { "load": 34, "sustainable": 28 }
  }
}
```

## Persistence behavior (in the engine)

On load the engine reads the stored graph from `window.storage` (key `theo.fieldguide.workgraph.v1`), parses `#fgData` defensively, upserts issues by id (new ids added; existing ids updated field by field; `close:true` drops the id), replaces meetings / `hidden_note` / `comms` / `savings` / `reportCard` / `today` when the delta provides them, writes the merged graph back, and renders. If `#fgData` fails to parse, the engine skips the merge, renders the stored graph, and shows a non-blocking banner. Export downloads the merged graph as JSON (filename `theo-workgraph.json`); Import loads one back and re-renders. If `window.storage` is absent, the engine renders from the delta alone: no cross-session accumulation, but a correct board for the current view. The persisted schema name is unchanged (`field_guide_state.json`; see the Persistence model section of SKILL.md).

## Styling

Use the engine's own CSS (LDS dark palette, mono accents). Do not introduce off-style palettes or fonts, and never use green as a status color. Status severity uses the canonical blue / neutral / amber / red only.
