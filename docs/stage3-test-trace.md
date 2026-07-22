# Stage 3 test-trace verification

Static trace-through, not a live Claude Desktop run. This is manual verification
against the written SKILL.md text: for each test case, I traced what the file's own
instructions say should happen, checking against the routing table, the new
chain-aware routing section, and routing-and-chains.md. This confirms the text is
internally consistent and produces the intended answer when read literally; it does
NOT confirm the model will always follow it correctly in a live session, and it does
NOT confirm the widget renders correctly in Claude Desktop (I cannot launch Claude
Desktop from here). A human should smoke-test at least the widget-render path and one
or two of the chain-continuation cases live before treating this as fully verified.

## Part A: single-hop routing (unaffected by Stage 3, sanity check only)

Confirms the split of teach-mode/widget into companions did not break ordinary
routing, since the routing table itself was never touched.

| Trigger phrase | Expected route (per routing table) | Traced result |
|---|---|---|
| "redline this contract" | lilly-contract-review | Matches row 1 exactly. PASS |
| "find vendors for label printers" | supplier-landscape, slot filled | Matches "find vendors for [need]" with need="label printers" filled per the Parameterized Triggers rule. PASS |
| "score the proposals" | evaluation-engine | Matches row exactly. PASS |
| "theo.go" | render the menu (widget or Markdown fallback) | Per frontmatter: "Treat 'theo.go' or 'theo' alone as a launch request." Routes to widget-render flow, which now reads `assets/theo-widget.html`. PASS, contingent on the companion file being readable (see Part C). |
| "how do I buy this" | process-navigator | Matches row exactly. PASS |

## Part B: teach-mode trigger (tests the new companion-file split)

| Trigger phrase | Expected behavior | Traced result |
|---|---|---|
| "teach me about my procurement skills" | Read `references/teach-mode.md` in full, run Teach mode from it | Matches the new Teach mode section's instruction exactly: "Teach mode lives in `references/teach-mode.md`... Read that file in full before running Teach mode." PASS |
| "redline this contract" (a concrete task, not a teach trigger) | Do NOT read teach-mode.md | Matches "For every other trigger... do not read this file at all." PASS - confirms the file only loads conditionally, the actual point of the split. |
| `?` button click on the widget | Fires the teach-mode trigger phrase, which then triggers the same read-the-companion path | Per the widget's own JS (verified in the extracted companion, `th-qbtn` click handler fires `"Teach me about my procurement skills."`) and the Teach-mode section's "see the widget's `?` button" pointer. PASS |

## Part C: widget companion failure mode (new graceful-degradation text)

| Scenario | Expected behavior | Traced result |
|---|---|---|
| `assets/theo-widget.html` unreadable (missing/corrupted) | Do not reconstruct from memory; go straight to Markdown fallback; mention once that the visual launcher was unavailable | Matches the added sentence in Graceful Degradation exactly. PASS |
| `visualize:show_widget` tool unavailable (pre-existing case) | Fall back to Markdown menu, same as before Stage 3 | Unchanged from baseline text (this condition was already handled; Stage 3 only added the companion-file-specific case alongside it). PASS |

## Part D: chain-aware routing (the new capability, most important to verify)

Traced against `references/routing-and-chains.md`, checking that every answer traces
to a quoted source and that the "never fabricate" rule would catch an unlisted claim.

| Scenario | Expected chain answer per routing-and-chains.md | Traced result |
|---|---|---|
| User: "I just got the supplier shortlist, now what?" (continuing supplier-landscape) | supplier-deep-dive (single-supplier follow-up) or rfp-engine (via landscape_handoff.json) | Matches supplier-landscape's row exactly: "supplier-deep-dive (single-supplier follow-up), rfp-engine (shortlist via landscape_handoff.json...)". Also correctly notes the known gap: "this handoff does not include a requirements grid." PASS - correct answer AND correctly surfaces the known limitation rather than overclaiming. |
| User: "what comes after the evaluation?" (continuing evaluation-engine) | decision-deck, "contract negotiation chain" | Matches evaluation-engine's row exactly. PASS |
| User: "what's next after executive-summary-package?" | none stated | Matches the table's explicit "none stated" entry. Per the hard rule, correct behavior is to say plainly "this one doesn't have a defined next step" rather than guessing (e.g. never invent that it feeds decision-deck just because that would sound plausible). PASS - this is the critical anti-fabrication test case. |
| User: "what feeds into category-strategy?" | supplier-landscape, commercial-negotiation-prep, market-rate-benchmarking, negotiation-playbook-learning | Matches the table's predecessors column exactly, all four sourced from category-strategy's own Integration Dependencies section. PASS |
| User: "what comes after theos-field-guide?" | voice-profile, process-navigator, timeline-builder, supplier-deep-dive, rfp-case-manager (informational link only) | Matches the table exactly, including the qualifier on rfp-case-manager ("informational link only") rather than overstating it as a full handoff. PASS |

## Part E: hard-gate precedence (explicit skill request overrides chain lookup)

| Scenario | Expected behavior | Traced result |
|---|---|---|
| User: "build a should-cost model" while mid-sequence on market-rate-benchmarking output | Route directly to should-cost-builder per the explicit request; do not force the chain-table's stated successor list on the user | Matches Chain-aware routing's stated precedence: "Hard gate first... If the user's request unambiguously names a skill... route directly. Do not consult the chain table first." PASS |

## Known limitations of this verification (stated plainly, not glossed over)

1. This is text-tracing, not execution. I confirmed the SKILL.md's own instructions
   are internally consistent and point to real, readable companion files with the
   expected content. I did not run Claude Desktop, so I cannot confirm the model
   actually follows these instructions correctly in a live conversation, especially
   under context pressure or with an ambiguous user phrasing not covered above.
2. The widget's actual rendering (does `visualize:show_widget` accept the companion
   file's content correctly, does the JS behave identically to when it was inline)
   was NOT tested live. The content is verified byte-identical to what used to render
   correctly when inline, which is strong evidence but not the same as a live render.
3. Test cases above were selected to cover the new capability (chain-aware routing)
   and the new failure mode (companion-file split) introduced in Stage 3. They are
   not exhaustive over all 26 routing-table rows or all possible chain-continuation
   phrasings.

**Recommendation:** before relying on this in a real session, do at least one live
smoke test: open a Claude Desktop conversation with this skill installed, trigger
"theo.go" and confirm the widget renders, then trigger "teach me about my procurement
skills" and confirm Teach mode still runs correctly from the companion file.
