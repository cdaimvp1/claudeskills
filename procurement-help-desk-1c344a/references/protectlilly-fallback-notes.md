# ProtectLilly / third-party risk fallback (vendored snapshot)

Captured 2026-07-31. This replaces the prior assumption that ProtectLilly content
is simply unreachable; a real, SharePoint-hosted alternative source was found and
read this pass.

## The direct ProtectLilly source is confirmed unreachable
`https://now.lilly.com/page/global-protectlilly` lives on the now.lilly.com
intranet (ServiceNow-based LillyNow), not SharePoint. Multiple live
`sharepoint_search` queries this session (for "ProtectLilly", "third party risk
TPRM", "Company Confidential Information CCI data classification") returned
zero results hosted AT now.lilly.com itself; the M365 connector genuinely cannot
reach it, confirming both skills' own documented expectation. Do not keep
retrying this specific URL live; go to the workaround below instead.

## Real workaround found: the Protect Lilly Chatbot's own knowledge base is on SharePoint
`Protect Lilly Chatbot - Knowledge Collection (4).csv`, last modified
2025-11-25, read in full 2026-07-31.
`https://collab.lilly.com/sites/LillyEnterpriseAutomationProgram-LEAP/Shared
Documents/Architecture/Enterprise Assistant/Chatbot Dev Work/General/SDD/
Production KBs/Protect Lilly Chatbot -  Knowledge Collection (4).csv`

This is the structured Q&A dataset that powers Lilly's own internal "Protect
Lilly" chatbot: 1,765 rows (Primary Question / Answer / Tags / faqStatus), most
answers self-contained rather than just a link-out. **A live connector run
should search and read this file directly** for any ProtectLilly/TPRM/data-
classification question, rather than attempting the now.lilly.com page. It is
reachable via SharePoint even though the chatbot's own front-end page is not.

### Real content extracted this pass (26 rows matched third-party/CCI/classification keywords out of 1,765 total)

**What is CCI / CI / PI:**
- "Confidential Information (CI) is defined as any information that is not in
  the public domain."
- "Personal Information (PI) includes any information that, when used alone or
  in combination with other information, identifies an individual."
- Information (CI + PI together) is classified into levels: **Red, Orange,
  Yellow, or Green** (per the ARR/record-retention row and the Information
  Handling Guidance row). Corroborated by a separate SharePoint file found this
  pass (`ProtectLilly_MandQRedandExamplesofOrangeandYellow.pdf`, 2016) and the
  Synthesia AI Global Playbook, which states its approved content ceiling as
  "Up to Orange CCI" -- consistent with Red being the most sensitive tier.
- For the full classification framework: "Overview: Classifying and Handling
  Information," "Overview: Information Classification by Business Area," and
  "Information Classification Framework Chart" (all now.lilly.com pages named
  in the chatbot KB, not independently verified reachable this pass).

**Adding/working with a third party:**
- "How do I add a third party?" -> "visit the WwTP page on LillyNow" (the same
  Working with Third Parties process documented in full, with the Aravo/TPRM
  detail, in `references/buylilly-supplier-onboarding.md`).
- "What is third party information security risk management?" -> points to a
  now.lilly.com landing page; the Information Security Standard itself is
  published externally on Lilly's own supplier portal:
  `https://www.lilly.com/suppliers/supplier-resources` and
  `https://www.lilly.com/suppliers/supplier-resources/operating-responsibly`
  (the "Third Party Business Rules for Secure Handling of Information"). These
  two supplier-portal URLs are PUBLIC (lilly.com, not now.lilly.com or
  collab.lilly.com) and worth attempting a live fetch on directly if a
  stakeholder asks what security standard a supplier is held to.

**Sharing information with a third party:**
- Guidance lives on a now.lilly.com "Approved Electronic Tools & Services" page,
  specifically its "External/Third Party: Ways to Transfer/Share Information"
  section (not independently read this pass).
- Hard rule found verbatim: "Never send CI to or from your personal email or
  calendar," and "Do not send business Information to your personal email" for
  Yellow, Orange, and Red information.

**Third-party security incident reporting:**
- If a third party reports a known/suspected security incident: contact the IT
  Service Desk via ServiceNow ("Report a New Issue"), short description "3rd
  Party Cyber Incident Notification," routed to the INFOSEC-GLB-INCIDENTS
  assignment group. Do not include additional incident detail in the ticket
  itself (per the source's own instruction).

**Reporting a general ProtectLilly/CI concern:**
- Use the "Report a Protect Lilly Concern" now.lilly.com page, or the Ethics
  and Compliance Hotline for a misdirected-email/CI-sharing mistake.

## What this means for process-navigator and procurement-help-desk
Both skills currently treat ProtectLilly as "most likely to fail, degrade
gracefully to general principles." That degradation path is now better than
"general principles, not Lilly-verified": a live connector run can search this
chatbot KB CSV directly (query terms: "third party," "CCI," "classification,"
"WwTP," whatever the stakeholder's actual question is) and answer from real,
Lilly-specific, citable content, landing at Medium-to-High confidence instead
of Low. Recommend both SKILL.md files add this CSV as a fifth, always-try
source alongside the four named ones, specifically for ProtectLilly/TPRM/data-
classification questions, rather than only falling back to general principles
when now.lilly.com itself fails.

## Gaps
- Only 26 of 1,765 rows were pulled this pass (keyword-filtered for third-
  party/CCI/classification terms); the KB likely covers much more (phishing,
  general security awareness, content management) not relevant to procurement
  stakeholder questions and not extracted here.
- The two public lilly.com supplier-portal URLs above were found but not
  fetched this pass; a live run should attempt them directly (they are public,
  not Lilly-tenant-gated, so may be reachable by tools beyond the M365
  connector too, e.g. a general web fetch).
- This KB's own now.lilly.com links (referenced inside its answers) remain
  unreachable via the M365 connector; only the KB's own inline answer text was
  captured, not the full pages it links to.
