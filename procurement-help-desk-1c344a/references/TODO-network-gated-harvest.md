# Network-gated harvest: DONE (2026-07-31)

The six-step NETWORK-GATED sequence this file used to gate (see git history for
the prior placeholder text) has been run, live, against the real Lilly M365
tenant. This file is now an index of what was harvested, not a placeholder.

## What was harvested and where it lives

- `references/buylilly-where-to-start-a-buy.md` -- BuyLilly "How to buy goods or
  services" hub page + FRAP $200K engagement threshold.
- `references/buylilly-supplier-onboarding.md` -- the full seven-gate S2P path,
  RACI, contacts (from a real, dated internal reference doc, cross-checked
  against the Playbook/WwTP/AI Registry/Privacy/SAE sources it cites).
- `references/buylilly-invoice-status.md` -- P2P Status Hub, Buy@Lilly FAQ
  invoice-status content, PO Cheat Sheet pointer.
- `references/buylilly-po-open-close.md` -- PO increase/close mechanics from the
  Buy@Lilly FAQ.
- `references/playbook-stakeholder-faqs.md` -- general Buy@Lilly FAQ content,
  Playbook Glossary pointer, and a documented retrieval inconsistency (some
  Playbook SharePoint pages 404 on read despite valid search hits).
- `references/protectlilly-fallback-notes.md` -- real CCI/CI/PI definitions,
  classification levels, third-party-security content pulled from the
  SharePoint-hosted Protect Lilly Chatbot knowledge-base CSV (a genuine
  workaround for the now.lilly.com page the M365 connector cannot reach).
- `references/procurement-operating-model.md` -- the synthesized operating
  model, systems map, FRAP ATC/ATS thresholds, and information-classification
  summary (NETWORK-GATED STEP 3).

## Step-by-step status (of the original six steps)

1. **Live-validate each source.** Done. Playbook 2.0: reachable via search;
   individual page reads are inconsistent (some 404 despite valid search hits;
   documented in `playbook-stakeholder-faqs.md`). BuyLilly: fully reachable
   (pages and files). FRAP PDF: fully reachable, read end-to-end. ProtectLilly
   (now.lilly.com): confirmed unreachable via the M365 connector, as expected;
   a real SharePoint-hosted workaround (the chatbot KB CSV) was found instead.
2. **Harvest a curated vendored snapshot.** Done -- see the five `buylilly-*.md`
   / `playbook-*.md` / `protectlilly-*.md` files above. Each carries source
   URL, capture date, and explicit gaps where content was not fully read.
3. **Build the "how Lilly does procurement" corpus.** Done --
   `procurement-operating-model.md`.
4. **Run an end-user question battery.** Done -- see SKILL.md changelog for the
   summary; every answer traced to a real, cited source from the files above.
5. **Confirm answer-only vs action-referral split.** Confirmed against real
   content: BuyLilly/Ariba/SAP/LEAH/Aravo/ServiceNow are all correctly named as
   "go here to do it" systems this skill cannot operate; nothing in the real
   content contradicts the Out of Scope section.
6. **Re-verify the ProtectLilly retrieval gap.** Confirmed unreachable (see
   step 1); the chatbot-KB workaround is the fallback going forward, not
   "general principles" as previously assumed.

## What is still NOT done (be honest about the remaining gaps)

- Several individual linked pages named inside the harvested files were not
  independently fetched this pass (see each file's own "Gaps" section) --
  e.g., the Ariba Guided Buying detail page, the PO Cheat Sheet's line-item
  content, the Playbook Glossary's actual term list, the two public
  lilly.com/suppliers pages.
- The chatbot KB CSV has 1,765 rows; only the ~26 third-party/CCI/
  classification-relevant rows were extracted. A future pass could harvest
  more of it for non-procurement ProtectLilly questions if this skill's scope
  ever widens.
- This snapshot is a point-in-time capture (2026-07-31). Live reads should
  always be preferred when the connector is available; treat this snapshot as
  a fallback, not a replacement for Hard Rule 3 (live read by default).
