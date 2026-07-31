# RFx Teams-Site Binding (Suite-Wide Shared Mechanism)

Added 2026-07-30. Generalizes the binding pattern `rfp-case-manager` already built and
proved, so every skill touching the same RFx event uses one binding instead of five
separate ones. An RFx event has a single, bounded collection point by design (unlike a
vendor's contract history, which can be anywhere) -- this is a **bind mode**, not the
**active search** mode described in `sharepoint-search-and-extract.md`.

## Check for an existing binding before asking

Before asking the user anything, check whether this RFx event already has a bound Team:
- If `rfp-case-manager` has already run for this RFx, its `_case_file.json` (Project
  knowledge) carries the bound `sharepoint_site_url` and display name. Read it from there.
- If `rfp-engine` produced a `case_handoff.json` that already carries a binding, use that.
- If neither exists yet, this skill is the first to touch this RFx event -- ask.

**Reuse, never re-ask, when a binding is already found.** The point of binding once is that
every subsequent skill in the RFx's lifecycle benefits without the user repeating themselves.

## The one-time ask (only when no binding exists yet)

Offer as tappable options, same wording `rfp-case-manager` uses:

> "Do you have a Microsoft Team for this RFx that you would like to bind? (Binding gives
> read access to the Team's SharePoint and chat. You can add or change the binding later.)"
> - Yes, I have a Team for this RFx (I will provide the SharePoint site URL and display
>   name next)
> - No Team for this RFx (work from Project knowledge and uploaded files alone)

If yes, ask for the SharePoint site URL directly (In Teams: any channel's Files tab > Open
in SharePoint > copy the URL from the browser. Typically `https://lilly.sharepoint.com/sites/...`).
Save the binding wherever this skill persists state for the RFx (its own case-tracking file,
or Project knowledge if it has none) so the NEXT skill to touch this RFx can reuse it per the
section above.

## Once bound

Scope every subsequent SharePoint/chat search via the M365 connector to that one site --
walk its folder tree, read files in place, cite source + date. **The Team is OPTIONAL.**
When bound, it is the system of record for RFx documents and channel chat (read in place,
never written back to -- any derived output is delivered for the user to post). When not
bound, work from Project knowledge and uploaded files alone; this is not a degraded state,
just a different one, and both are valid depending on how the user works.

## Consuming skills

`rfp-case-manager` (built this, proved it), `rfp-engine`, `evaluation-engine`,
`rfp-response-analysis`. All four should check for and respect the same binding for a given
RFx event rather than each maintaining its own. `rfx-hub` is dashboard-only -- it renders
what these skills feed it and does not search anything itself, so it is not a consumer of
this mechanism.
