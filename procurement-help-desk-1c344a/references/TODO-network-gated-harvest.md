# TODO: Network-gated content harvest (NOT YET DONE)

STATUS: placeholder only. This file contains NO Lilly content. It exists so the
skill's vendored-fallback path (see SKILL.md, "Knowledge Sources") has a known
location to fall back to once the real harvest runs, and so nobody mistakes the
absence of a snapshot for a bug.

Do NOT fill this in from memory, inference, or a guess at what BuyLilly or the
Playbook "probably" say. Every fact below must come from an actual page read
while Marc is on the Lilly network, with the source URL and the date it was
read attached to it. See SKILL.md's ">>> NETWORK-GATED STEPS" block for the
full six-step sequence this file is step 2 of.

## What goes here (once harvested)

Split into one file per source once real content exists, for example:
- `references/buylilly-supplier-onboarding.md`
- `references/buylilly-po-open-close.md`
- `references/buylilly-invoice-status.md`
- `references/buylilly-where-to-start-a-buy.md`
- `references/playbook-stakeholder-faqs.md`
- `references/protectlilly-fallback-notes.md` (only if the retrieval gap is confirmed and a fallback is needed)

Each file should carry, at minimum:
- Source name and full URL.
- Capture date (the day it was actually read).
- The literal section/heading content relevant to a stakeholder how-to, where-to-go,
  who-to-contact, which-form, status-check, or timing question.
- Any named contact/SME route found on the page.

## What does NOT go here

- Paraphrased "best guess" process descriptions not tied to an actual page read.
- Anything copied from process-navigator's own knowledge or assumptions rather
  than a fresh read of the source (process-navigator's live reads are not a
  substitute for this skill's own vendored snapshot; policy pages can be long,
  and the sections relevant to a stakeholder how-to question may differ from
  the sections process-navigator's rep-facing answers pull from).

## Reference corpus (NETWORK-GATED STEP 3)

The broader "how Lilly does procurement/sourcing" corpus (operating model,
roles, systems map, request-to-PO flow) also belongs under `references/` once
built, for example `references/procurement-operating-model.md`. Same rule:
built from real site content only, never fabricated or inferred.
