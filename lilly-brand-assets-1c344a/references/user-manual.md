Claude Skills for Procurement: User Manual  |  Company Confidential

**CLAUDE SKILLS FOR PROCUREMENT**

User Manual

Featuring THEO, your front-door launcher.

Version 10.6.6  |  26 Skills  |  7 Pipelines + THEO launcher  |  Theo's Field Guide 🦖 v2.2 (tagging, governance & classification)

Prepared by Eli Lilly and Company - Procurement  |  June 2, 2026

**Company Confidential © 2026 Eli Lilly and Company**

Complete reference for installing, using, and troubleshooting the Lilly Procurement Skills suite in Claude. If you are not sure where to start, begin with THEO, the front-door launcher, which routes you to the one skill you need and includes a guided coaching feature ("Teach Me") that adapts to your experience level. Covers all 26 skills across seven pipelines: Contracting and Negotiations, Sourcing/RFx, Category Strategy, Cost and Commercial, Decision Deck, Executive Summary, and Personal Command Center. Includes model selection guidance, AI accuracy expectations, dashboard troubleshooting, per-skill scenario walkthroughs, end-to-end pipeline examples, and common mistakes to avoid.

**Table of Contents**

| **Section** | **Topic** |
| --- | --- |
| 01 | What These Skills Are |
| 02 | Installation |
| 03 | How to Use Each Skill |
| 04 | Running a Full Pipeline End to End |
| 05 | Which Model to Use |
| 06 | Working with AI Output |
| 07 | Working with Dashboards |
| 08 | Negotiation Personas |
| 09 | Adding Your Category's Templates |
| 10 | Claude in Word: Application Modes |
| 11 | Common Mistakes to Avoid |
| 12 | Execution Guardrails |
| 13 | Troubleshooting |
| 14 | What Changed in This Version |
| 15 | Glossary |

| **01** | **What These Skills Are** |
| --- | --- |

Pre-built workflows that know Lilly procurement playbooks, templates, and standards. You upload a document or describe what you need, the skill does the analysis, and you review the output.

**What They Are Not**

- Not autonomous agents. They do not take action on your behalf.

- Not a replacement for SME review. Legal, InfoSec, Privacy, and other specialists still need to review their areas.

- Not infallible. They produce draft output that you own, review, and send. See Section 06 for detail on AI accuracy.

- Not a substitute for institutional knowledge. Claude does not know your supplier relationship history, verbal commitments from meetings, or internal political dynamics.

**Rules to Live By**

**1. These augment, not replace, your judgment. **The skills handle analytical heavy lifting. You apply context, relationships, and business sense.

**2. Review all output for accuracy. **Every number, every position, every recommendation. See Section 06 for specific items to check.

**3. Start a new chat for each use. **Skills activate in new conversations, not the one where you installed them. Starting fresh also gives Claude full context capacity for your task.

**4. It will require iteration and patience. **Complex skills (contract review, category strategy) are multi-step analytical workflows. They take time and may need a follow-up conversation for large documents. This is by design, not a flaw.

**The 26 Skills**

**Shared Foundation: **lilly-brand-assets provides shared logos, execution guardrails (G1-G10, suite-wide; G8-G9 are the pass-artifact and anti-collapse rules that apply to every multi-pass skill, not just contract review), the narrative standards and validation checklist, dashboard component library, brand colors, and DOCX design standards. All other skills depend on it. It installs first automatically during the installation process. You do not need to do anything special with it.

**Front door: THEO (procurement-launcher).** Not sure where to start? Say **"Run Theo"** (or "procurement menu"). THEO shows a single-screen master-detail menu of the seven pipelines: tap a pipeline on the left to see its skills, tap a skill to launch it. The skill you launch will tell you what to upload and what additional context helps. THEO is chat-only and light.

**Contracting and Negotiations (6 Skills)**

| **Skill** | **What It Does** | **Primary Output** |
| --- | --- | --- |
| **lilly-contract-review** | Reviews and redlines vendor contracts against the MPT Playbook. Handles MSAs, SOWs, work orders, change orders, amendments, order forms, CDAs, DPAs. Mandatory 4-pass workflow with definition tracing, protection gap analysis, cross-reference to governing documents, and commercial analysis. | Default ("Redline only"): redlined DOCX with tracked changes. "Full review": redlined DOCX + 3-panel interactive dashboard + review summary + vendor response draft. (Dashboard-only and briefing-only are optional re-entry modes.) |
| **legal-negotiation-prep** | Standalone pre-negotiation legal briefing. Use only when you do NOT have a contract document to upload. When a contract is provided, lilly-contract-review produces this natively as Panel 2. | Tactical briefing: positions by priority, predicted pushback, fallback sequencing, red lines. |
| **commercial-negotiation-prep** | Standalone commercial pricing analysis. Use only when you do NOT have a contract document to upload. When a contract is provided, lilly-contract-review produces this natively as Panel 3. | Rate benchmarks, TCO decomposition, counter-offer generation, pricing model analysis. |
| **negotiation-playbook-learning** | Captures negotiation outcomes (what supplier accepted, rejected, countered) and surfaces acceptance/rejection patterns. Over time, contract review uses this history to predict pushback and calibrate positions. | Outcome records, pattern reports, playbook amendment recommendations. |
| **negotiation-simulator** | Three simulation modes: Practice (interactive roleplay), Observe (watch both sides with tactical analysis), and Drill (single-clause focused practice with retry). Modeled from the playbook, recorded history, and governing documents. Structured counterparty profiling when no history is available. 8 pre-built scenario templates. Turn-by-turn feedback with retry option. Progressive difficulty within sessions. Structured debrief with metrics. Always labeled a simulation; never asserts the supplier's real positions as fact. | Live roleplay/observation/drill in chat plus a structured coaching debrief with metrics (reciprocity ratio, anchor effectiveness, playbook coverage, Hard Stop risk). |
| **comment-cleanup** | Identifies redundant, verbose, non-actionable, or strategy-leaking comments in redlined documents, and finalizes a clean execution-ready copy. Safety-gated: never deletes without approval; Hard Stops never removed; never alters contract language. | Hygiene report; optional clean execution-ready DOCX + change summary. |

**Cost & Commercial (2 Skills)**

| **Skill** | **What It Does** | **Primary Output** |
| --- | --- | --- |
| **pro-forma-builder** | Builds a defensible multi-year financial model: cost buildup, scenario projections, savings waterfall vs current state, TCO, NPV, ROI, payback, sensitivity. Live formulas; every figure traces to an input, a stated assumption, or a cited benchmark. | Formula-driven XLSX model (+ optional dashboard + short narrative). |
| **should-cost-builder** | Builds a bottoms-up estimate of what something SHOULD cost (materials, labor, overhead, logistics, margin) to anchor a negotiation. The bottoms-up complement to market-rate (top-down); both together bracket the target. Sources and confidence on every component. | Cost-stack breakdown (XLSX) + gap vs proposed price + narrative. |

**RFx Pipeline (6 Skills)**

| **Skill** | **What It Does** | **Primary Output** |
| --- | --- | --- |
| **supplier-landscape** | Market research and vendor shortlist. Accepts input from a single sentence to a full business case. Web-searches for suppliers, scores on a weighted matrix (alignment, risk, pricing, contract flexibility, integration fit). Includes Porter's Five Forces. | 15-30 page Lilly-branded report (DOCX) + interactive dashboard + CSV data files. |
| **supplier-deep-dive** | Single-supplier deep-dive profile. Complement to supplier-landscape (multi-supplier shortlist). Five canonical sections: Identity, Capability, Market & Financials, Risk, Lilly Fit, plus a Recommendation. Four depth modes (Quick / Standard / Risk-emphasis / Renewal). | Lilly-branded profile DOCX + optional one-page dashboard. |
| **rfp-engine** | Generates complete, issuance-ready RFP/RFI packages from Lilly institutional templates (built from 7 historical Lilly RFI/RFPs). Boilerplate sections are locked. Optional sections toggle automatically based on what you are sourcing. | RFP instructions document, requirements matrix, pricing template, demo evaluation guide, invitation emails. |
| **rfp-case-manager** | **v2.0: intent-driven workflows (no mode picker).** Initialize, Status, Schedule, Ingest, Refresh+Timeline. **Microsoft Team binding is OPTIONAL.** With a Team bound, the skill crawls the Team's existing SharePoint structure and adapts to it (does NOT emit a provisioning schematic). Without a Team, runs on Project knowledge + uploads alone. Step 0a on first run captures the Project acknowledgment and (optionally) the Team's SharePoint site URL. | Case file, timeline, status summaries, meeting drafts, communications log. |
| **rfp-response-analysis** | Extracts, profiles, and compares supplier RFP submissions. Catches inconsistencies (pricing vs. narrative, self-rating vs. evidence). Severity-classifies every inconsistency. | 15-40 page evaluation report (DOCX) + interactive dashboard + pipeline artifacts for evaluation-engine. |
| **evaluation-engine** | AI scores each supplier 0-5 per criterion with evidence citations. **AI scoring is decision support, not the final decision: the evaluation team owns the award, and any Must-Have zero is flagged for leadership review.** Sensitivity analysis tests whether shifting any weight by 5 points changes the ranking. Generates all RFP communications. | Decision package with scored evaluation + award/non-award letters + Q&A responses. |

**Decision Deck (1 Skill)**

| **Skill** | **What It Does** | **Primary Output** |
| --- | --- | --- |
| **decision-deck** | Executive Presentation Builder. Story-first workflow: reads any inputs (dashboards, contracts, evaluations, spend data, models), drafts a text storyboard in the chat, iterates with user, then builds PPTX. Works standalone or downstream. | PPTX presentation (LAYOUT_WIDE) + optional one-page decision brief. |

**Category Strategy (2 Skills)**

| **Skill** | **What It Does** | **Primary Output** |
| --- | --- | --- |
| **category-strategy** | Primary spend analytics and strategy tool. Ingests raw spend data (SAP, SHARP, Ariba, any Excel/CSV). Two modes: DEVELOP (new strategy from scratch) and MANAGE (update existing with new data). Supports multi-category analysis with dropdown switching. | 11-tab interactive Lilly-branded dashboard (JSX). |
| **market-rate-benchmarking** | Three modes: (1) EXTERNAL: web-researches market rates with percentile positioning. (2) INTERNAL: compares pricing across your own contracts in a category. (3) RATIONALIZATION: maps overlapping capabilities and redundant licenses with savings estimates. | Rate benchmark cards, internal comparison matrices, rationalization register. |

**Executive Summary (1 Skill)**

| **Skill** | **What It Does** | **Primary Output** |
| --- | --- | --- |
| **executive-summary-package** | Reads a contract or work order, writes narrative sections, calculates FRAP approval chains based on deal value and Lilly threshold schedule. Produces the DOCX in the exact format used by procurement. | ATC/ATS executive summary Word document ready for the approval workflow. |

**Personal Command Center (6 Skills)**

The personal-productivity layer. All six compose into the "where are we on this" status-update flow when invoked from Theo's Field Guide. Best practice: run them all inside a single dedicated Claude Project named "Daily Command Center" (one Project, used forever, many conversations). See the **Two-Project Pattern** section in Section 02 for setup details.

| **Skill** | **What It Does** | **Primary Output** |
| --- | --- | --- |
| **voice-profile** | Builds a personal writing-voice profile from a sample of your sent emails (M365 connector or pasted), then drafts new emails / memos in your voice. Four modes: BUILD (one-time setup), DRAFT (compose in voice), AUDIT (does this draft sound like me?), UPDATE (refresh profile). Discipline layer (em-dash ban, smart brevity, grammar, no-fabrication) overrides voice on collisions. **Privacy: the profile is your own user-carried `voice_profile.json`, built only from your own sent mail; there is no shared voice database and no inbox monitoring.** | `voice_profile.json` (BUILD) + email/memo drafts (DRAFT) + audit report (AUDIT). |
| **🦖 theos-field-guide** (v2.0+, **NEW in v10.6.0**; replaces daily-digest) | Work-graph personal command center. Organizes procurement work as Issues (with child Tasks, owner, state, project, evidence references), not as a flat inbox digest. Reads inbox/calendar/Teams via M365 connector and clusters cross-thread evidence to Issues. State inferred from machine signals (Ariba, Adobe Sign / DocuSign / Ironclad, LEAH at @contractpod.com) and textual closure cues with three confidence tiers: high (auto-update), medium (auto-update with revert badge), low (surface as candidate). Never auto-closes on a guess; `complete` requires explicit user action. **Optional hashtag protocol** (`#status=`, `#owner=`, `#project=`, `#issue=`, `#priority=`, `#due=`) lets you signal explicit state - Claude proposes hashtags in drafts so you do not memorize them. **Inline HTML widget dashboard** (same pattern as Theo launcher) with master-detail layout, 5 fixed sections (Action Needed / Waiting On / Today-Tomorrow / Stale / Snoozed), real clickable buttons via sendPrompt. **Stale-review walkthrough** as a one-tap action. Migrates legacy `daily_digest_state.json` on first install. **Requires M365 connector.** | Inline widget dashboard with Issue-centric view + per-Issue/Task/Ungrouped actions (Draft Reply, Draft Status Update, Build Workflow Map, Prep for Next Meeting, Mark Complete, Update State, Add Task, Snooze, Reassign Owner). |
| **process-navigator** | Procurement process / policy / threshold / system-requirement Q&A. Live-reads four authoritative Lilly SharePoint sources at runtime via M365 connector: Global Procurement Playbook 2.0, BuyLilly, Global Following FRAP Policy, Global ProtectLilly. Every answer cites source name + URL + section + confidence label. Degrades gracefully when connector unavailable (labels answers "not Lilly-verified"). | Structured Q&A response with citations + confidence + suggested next-skill handoff. |
| **timeline-builder** | Loose procurement timeline estimates. Phase model: Sourcing -> Negotiation+Reviews -> Ariba PR ATC/ATS approval (2 wk under $15M / 4 wk $15M+; NO multiplier) -> Contract execution (1 wk; NO multiplier). Multiplier-eligible phases get a complexity multiplier (Quick x0.75 / Standard x1.0 / Complex x2.0 / Major x4.0) applied to the AVERAGE column only. Risk reviews run parallel; longest enters critical path. **First-run calibration asks ONLY 3 questions** (typical SOW under existing MSA, typical NEW MSA, typical SOW-with-amendment); everything else baked in. | Range estimate + phase breakdown + drivers + confidence label + tightening suggestions. |
| **workflow-map** | Workflow diagram + checklist for any request. Three output modes: in-chat Mermaid `graph LR` (default) + markdown checklist; branded HTML/SVG artifact (Magazine house style); inline-SVG email draft + Unicode `<pre>` fallback + Outlook-safe HTML table checklist. Composes process-navigator + timeline-builder for phase determination and duration labels. Pulls stakeholder roster from theos-field-guide state or rfp-case-manager case file; `[OWNER?]` placeholder for gaps. Standalone + callable from theos-field-guide's status-update flow and case-manager Initialize/Refresh. | Diagram + checklist in selected format. |
| **meeting-prep-brief** | One-page prep brief for any upcoming procurement meeting. Reads the calendar invite, the recent email thread with the counterparty, related SharePoint contract / RFP docs, and (optional) spend snapshot, then assembles a five-section brief: Who's in the room / What was last discussed / What's open / What you should walk in ready to say / Suggested agenda. **Read-only via M365 connector; no writes.** Composes with voice-profile (follow-up drafts) and workflow-map (process diagrams when useful). | Brief in-chat (markdown), or one-page DOCX (Magazine style), or email/meeting-note draft text to copy or create manually. |

| **02** | **Installation & Setup** |
| --- | --- |

**Two-Project Pattern (recommended for full suite use)**

The suite works in plain Claude, but to get the full value of the Personal Command Center skills and the RFx pipeline, organize work into TWO Claude Project patterns:

| Project | Quantity | Purpose | Houses |
| --- | --- | --- | --- |
| **Daily Command Center** | ONE, used forever | Personal productivity layer | theos-field-guide state file (field_guide_state.json), voice-profile JSON, timeline-builder calibration JSON, ad-hoc workflow maps |
| **Per-RFx Project** (e.g., "RFP - Vendor X - Data Analytics 2026") | ONE per RFx event | Case-specific workspace | rfp-case-manager case file, optional Microsoft Team binding JSON, RFP package outputs, response analyses, evaluation outputs, decision deck, RFx-specific workflow maps |

**Keep the Daily Command Center Project private.** It may contain inbox, calendar, task, and work-status context, so it should be private to the individual user; do not add colleagues to it. Per-RFx Projects may be shared only if your Claude workspace and local governance allow shared project work.

Why two patterns: the Daily Command Center accumulates personal state across all your work indefinitely (your voice profile, your task digest, your calibrations). A per-RFx Project is created fresh per event and contains everything tied to that one event. They never overlap.

You do NOT need to create a per-RFx Project for everything. Use it when the work is multi-conversation and benefits from persistent state (a multi-week sourcing event). For one-off contract reviews, plain Claude or the Daily Command Center is fine.

**First-Day Setup Checklist (new users)**

1. Install the bundle (see "Fresh Install" below)
2. Binary assets are already included inside the three skills' .skill packages; do not upload them separately unless a skill reports a missing template or logo at runtime (see "Binary Assets" below).
3. Create your **Daily Command Center** Claude Project. Name it that or similar. Leave it empty for now.
4. In that Project, run `build my voice profile`. Walk through the one-time BUILD setup. Save `voice_profile.json` to Project knowledge.
5. In that same Project, run `estimate the timeline for [any test request]`. Answer the 3 calibration questions. Claude generates `timeline_calibration.json`; save it to the Daily Command Center Project Knowledge if Claude does not add it automatically.
6. In that same Project, run `open my field guide`. Acknowledge the Project pattern (Step 0a). The first digest builds; subsequent runs refresh it.
7. When you start your next sourcing event, create a **per-RFx Project** and run `set up a case for [event name]`. The case-manager Step 0a captures the optional Team binding.

You are now set up. All six Personal Command Center skills will use your saved voice profile, calibration, and digest state automatically when invoked from inside the Daily Command Center Project.

**Recalibration paths (after initial setup)**

| What you want to change | How |
| --- | --- |
| Refresh voice profile from new sent mail | Say `build my voice profile` again (or `update my voice profile`). Walks through BUILD again; replaces the saved JSON. |
| Edit timeline-builder calibration (the 3 anchor durations or anything else) | Open `timeline-builder-calibration.xlsx` if your team provided the source workbook, edit the relevant rows, and run `recalibrate timeline-builder`. OR just say `recalibrate timeline-builder` and answer the 3 questions again. Defaults beyond the 3 questions are baked in; edit the xlsx to ship-with new defaults. |
| Edit Field Guide Issue stakeholder roster for a project | Say `edit stakeholder roster for [project]` inside your Daily Command Center Project. |
| Re-acknowledge or change Project pattern (e.g., switch Daily Command Center to a different Project) | Delete `rfx_project_acknowledged.json` / `field_guide_state.setup.project_acknowledged (or legacy daily_digest_state.setup.project_acknowledged)` from Project knowledge and run the skill again to re-prompt. |
| Bind / unbind / change Microsoft Team on a per-RFx case | Inside the per-RFx Project, say `bind a Team to this case` (captures URL + display name), `unbind the Team`, or `switch the Team binding`. |
| Snooze or mark closed a digest entry | One-tap in the Theo's Field Guide dashboard per entry. |

**Fresh Install**

**Step 1: **Upload the skills zip to a Claude conversation.

**Step 2: **Say: "Install these skills."

**Step 3: **Claude reads the installation instructions, checks for conflicts with any existing skills you have installed, then packages each of the 26 skills one at a time.

**Step 4: **Click "Save Skill" on each one as Claude presents it. You must click Save Skill for each skill individually. This is the critical step: if you do not click Save Skill, the skill is not installed.

**Step 5: **Start a new conversation. Skills are available immediately in the new chat. They will not appear in the conversation where you installed them. This is normal.

| The package includes a shared branding foundation (lilly-brand-assets) that installs first. The other 25 skills depend on it for logos, colors, and formatting standards. This is handled automatically during installation. You do not need to install it separately or do anything special with it. |
| --- |

**Updating from a Prior Version**

Same process: upload the new zip and say "install these skills." If you have customized prior skills, upload or provide the prior customized skill files during the update so Claude can compare them against the new version and suggest how to carry your customizations forward. Without the prior files, use "replace entirely." For each conflicting skill, Claude offers two options:

- **Replace and carry forward customizations (recommended): **Installs the new version and ports your customizations into it. Claude shows you exactly what is being carried forward for your approval. Note: merged versions are best-effort. If you experience issues after installation, reinstall using the clean replace option.

- **Replace entirely: **Installs the new version as-is. Your customizations are lost, but the skill matches the tested package exactly. This is the safest option.

**Requirements**

- **Claude Pro, Team, or Enterprise account. **Free accounts do not have access to custom skills.

- **Code Execution enabled. **This is the toggle in conversation settings that lets Claude run code and create files. Without it, skills cannot produce DOCX redlines, dashboards, or formatted reports.

- **Microsoft 365 connector (optional). **Enhances rfp-case-manager (reads an existing bound Team's SharePoint/Teams structure and adapts the case file to it) and enables SharePoint data discovery across skills.

**You Do Not Need All 26 Skills**

Running too many skills increases context load and may reduce output quality on complex tasks. Install only the pipeline you need. Each pipeline works independently. Skills within a pipeline can hand off to each other but never require it.

| **Use Case** | **Install These Skills** |
| --- | --- |
| Contract review and negotiation | lilly-brand-assets, lilly-contract-review, comment-cleanup, negotiation-playbook-learning |
| Full negotiation suite (with standalone prep) | Above + legal-negotiation-prep, commercial-negotiation-prep, negotiation-simulator |
| Sourcing / RFP (full pipeline) | lilly-brand-assets, supplier-landscape, supplier-deep-dive, rfp-engine, rfp-case-manager, rfp-response-analysis, evaluation-engine, decision-deck |
| Spend analytics and category strategy | lilly-brand-assets, category-strategy, market-rate-benchmarking |
| Executive approval summaries only | lilly-brand-assets, executive-summary-package |
| Personal productivity (Daily Command Center) | lilly-brand-assets, procurement-launcher, voice-profile, theos-field-guide, process-navigator, timeline-builder, workflow-map, meeting-prep-brief |
| Everything | All 26 (works, but heavier on context; consider whether you need all pipelines simultaneously) |

**Verifying Installation**

After all skills are saved, start a new conversation and try one of these:

- Say "Run Theo" (opens the THEO launcher menu, confirms the launcher is installed)

- Upload a contract and say "review this contract" (triggers lilly-contract-review)

- Say "find vendors for [category]" (triggers supplier-landscape)

- Say "deep dive on [supplier]" (triggers supplier-deep-dive, new in v10.3.0)

- Say "create an RFP for [need]" (triggers rfp-engine)

- Say "build my voice profile" (triggers voice-profile BUILD, one-time setup; new in v10.3.0)

- Say "open my field guide" or "daily digest" (legacy alias) - triggers Theo's Field Guide 🦖, the work-graph PCC (v10.6.0+, replaces daily-digest). Requires M365 connector.

- Say "how do I buy [X]" or "do I need TPRM" (triggers process-navigator, new in v10.3.2)

- Say "estimate the timeline for this request" (triggers timeline-builder, new in v10.3.2; first run asks 3 questions)

- Say "build a workflow map for this request" (triggers workflow-map, new in v10.3.6)

- Say "prep me for the [supplier] meeting" (triggers meeting-prep-brief, new in v10.3.7)

- Say "category strategy for [commodity]" and upload a spend file (triggers category-strategy)

- Upload a work order and say "ATC summary" (triggers executive-summary-package)

If Claude does not recognize the trigger phrase, confirm the skill was saved (check your skills library) and that you are in a new conversation.

| **03** | **How to Use Each Skill** |
| --- | --- |

Describe what you need in plain language. Claude matches your request to the right skill based on trigger phrases. If it picks the wrong one, say "use [skill-name] for this."

**Getting started: THEO (the launcher)**

If you are not sure which skill you need, start with THEO. Say **"Run Theo"** (or "procurement menu" / "which skill should I use"). THEO shows a single-screen accordion menu in the chat: the seven pipelines plus a "not sure, just describe it" option. Tap a pipeline to expand its skills inline, then tap **Go** to launch. The skill you launch will immediately tell you what to upload and what additional context would help before it proceeds. THEO routes to a single skill and then steps aside; it is chat-only and light on context.

**Common questions when launching a skill (the same answers across the suite):**

- **"What do I upload?"** Most skills work from a verbal description but every skill labels what's BLOCKING (must have to produce a correct deliverable) vs. ENRICHING (improves depth, not required). The skill stops and waits when blocking input is genuinely needed; it proceeds with labeled assumptions otherwise. See each skill's "Inputs" table in its routing entry or in Section 03 below.
- **"What decisions will the skill ask?"** Most skills present a small batched set of tappable pickers up front (1-3 questions max) for genuinely enumerable choices: output mode, depth level, register, etc. They never run a long interview.
- **"Should I be in a Claude Project?"** For most skills, no. For the Personal Command Center skills (voice-profile, theos-field-guide, process-navigator, timeline-builder, workflow-map, meeting-prep-brief), strongly yes - run them inside your **Daily Command Center Project** so state persists. For rfp-case-manager and the RFx pipeline, optionally yes - one Project per RFx event so case state persists. See the **Two-Project Pattern** in Section 02.
- **"What output should I expect?"** Each skill produces a fixed-structure deliverable (per Operating Rule 8). Contract review: redlined DOCX (the default "Redline only" mode); "Full review" adds the 3-panel dashboard + review summary + vendor response draft. RFP: full package (instructions + matrix + pricing + emails). open my field guide: 5-tab dashboard. Timeline builder: phase breakdown + range + drivers. Workflow map: diagram + 5-column checklist. The structure does not change run to run; only the content does.
- **"What do I do after the skill finishes?"** Each skill ends with a brief Next Steps block: the single most useful follow-on, the upgrade path if you can add inputs, and (if relevant) the next skill to invoke. Use Theo if you want the menu again; otherwise just say what's next.

You never have to use THEO. If you already know what you want, just say it ("review this contract," "find vendors for X," "build a pro forma") and the right skill activates directly. THEO is the front door for orientation, not a gate.

**Learning with THEO: Guided Coaching ("Teach Me")**

THEO includes a built-in coaching feature that teaches you how to use the skills at your own pace. This is not a reference document or a feature tour. It is an adaptive conversation that meets you where you are and builds your confidence through small, practical steps.

To start, tap the **"Teach me about the skills"** button in THEO's help panel, or say "teach me about my procurement skills" in any conversation.

THEO begins with a brief welcome and then asks your experience level:

- **"I'm brand new to these skills"** - THEO walks you through the basics: what these skills are (and are not), asks what you're working on right now, introduces the ONE skill that matches, explains exactly what to upload and what you'll get back, and offers to launch it right there. The goal is your first successful skill use, not a tour of all 26 skills. After you try a skill, THEO can show you what connects to what you just did and gradually expand your understanding.

- **"I've used a few and want to learn more"** - THEO asks which skills you've used, then shows how they fit into their pipeline, introduces skills you haven't tried that connect to the ones you know, and explains how skills hand off output to each other automatically. You can walk through a full pipeline end to end or deep-dive into any specific skill.

- **"I know the suite well, just show me what's new or advanced"** - THEO covers what changed in v10.0 (THEO launcher, three new skills, two new pipelines, suite-wide guardrails), then offers an advanced topics menu: cross-pipeline orchestration, multi-category analysis, sensitivity analysis interpretation, persona strategy, token optimization, guardrail enforcement, and common mistakes.

Every teaching step ends with a next action: either launch a skill to try it, or continue to the next concept. THEO never dumps a wall of text. It teaches one concept at a time and adapts based on your answers. When you're done, THEO reminds you that you can always say "Run Theo" for the menu, or just describe your task directly and the right skill activates on its own.

If you want the full written reference instead of guided coaching, say **"Open the Theo user guide"** and THEO generates the complete user manual as a Word document.

**How Skills Hand Off to Each Other**

Skills in a pipeline produce structured output files that the next skill in the sequence consumes automatically. You do not need to do anything special to enable this. When you run supplier-landscape, it produces a handoff file. When you then run rfp-engine in the same conversation, it reads that file and uses the supplier data. The same pattern applies through the full chain: rfp-engine to rfp-response-analysis to evaluation-engine to decision-deck.

If you start mid-pipeline (for example, you already have supplier responses and want to jump straight to evaluation), upload your documents and the skill works from what you provide. The handoff files make the pipeline smoother but are never required.

Cross-pipeline handoff also works. A contract review dashboard can feed the decision deck. A category strategy dashboard can feed a negotiation prep. An executive summary can reference findings from a contract review. Describe what you want and Claude connects the dots.

**Iterating with Skills**

Most skills produce output that needs refinement. This is by design. The first pass gives you a solid draft. You then iterate.

- **For dashboards: **"Add more analysis to the Strategy tab" or "The Pareto chart is missing Supplier X" or "Expand the narrative on the Risk tab." Be specific. Batch requests: "Fix these three things" is better than three separate messages because each fix regenerates the entire dashboard.

- **For DOCX outputs: **"Add a section on implementation timeline" or "The liability cap section needs to reference the MSA, not just the WO" or "Move the commercial analysis before the risk section."

- **For presentations: **The decision deck skill iterates on the text storyboard in the chat before building any slides. Visual adjustments happen after the story is locked.

- **When to start over: **If the output is fundamentally wrong (wrong skill triggered, wrong document analyzed, wrong supplier), start a new conversation rather than trying to fix it. If the output is directionally right but needs refinement, iterate in the same conversation.

---

**Contracting and Negotiations Pipeline**

| **You Say...** | **What to Upload** | **What Happens** |
| --- | --- | --- |
| "Review this contract" | Vendor agreement (PDF or DOCX) | Default: redlined DOCX. Full Review adds the 3-panel dashboard, review summary, and vendor response draft. |
| "Review the supplier's response" | Supplier's marked-up redline | Every change classified: ACCEPT, REJECT, or COUNTER |
| "Get me ready for the negotiation" | Contract + prior redlines | Tactical briefing with positions, pushback, fallbacks |
| "Are we getting a good deal?" | Rate card or pricing sheet | Market benchmarks, counter-offer options |
| "Record what happened" | Nothing; describe the outcomes | Patterns captured for future reviews |
| "Clean up the comments" | Commented DOCX | Hygiene report. Nothing deleted until you approve. |

**Scenario 1: First Review of a New Vendor Contract**

**What to say: **"Review this contract" or "Redline this MSA"

**What to upload: **The vendor's agreement (PDF or DOCX). Helpful additions: the parent MSA if reviewing a SOW/WO, prior amendments, any specific concerns ("pay attention to the liability cap").

**What Claude asks: **(1) Supplier name and estimated contract value (if not evident from the document). (2) Negotiation persona: Standard (default), Collaborative, Aggressive, Curious, or Astonished. (3) Output mode: Full Review, Redline Only, or Dashboard Only.

**What you get (default, Redline Only):**

- Redlined DOCX with tracked changes and three types of comments: supplier-facing (visible to the supplier), internal-only (strip before sending), and SME escalation (needs specialist review first)

- All findings organized by risk tier (High, Medium, Low, Protection Gaps), surfaced as in-document comments

**What Full Review adds (on top of the redline):**

- 3-panel interactive dashboard: Contract Review (risk heatmap, 14-category protection matrix, obligations register), Legal Negotiation (per-term arguments, concession sequencing, 5-persona tone toggle), Commercial Analysis (cost decomposition, benchmarks, counter-proposals)

- Review summary with an executive elevator pitch at the top: Can we sign this? What is the biggest issue? What is the next step? Share this with business stakeholders who forwarded you the contract.

- Vendor response draft ready to send with the redline

**Scenario 2: Multi-Round Negotiation**

**What to say: **"Review the supplier's response" or "They sent back their redline, review it"

**What to upload: **The document with the supplier's tracked changes and comments.

**What you get:**

- Every supplier change classified: ACCEPT, REJECT, or COUNTER with playbook justification

- Every supplier comment responded to with Lilly's position

- Round status: how many positions are settled vs. still open vs. disputed

- Concession tracking: what each side has given up so far

- Updated negotiation strategy based on the supplier's pattern of resistance

**Scenario 3: Preparing for a Negotiation Call**

**What to say: **"Get me ready for the negotiation with [supplier]"

**What to upload: **The contract review summary (from Scenario 1 or 2), and any prior negotiation history if available.

**What you get: **Pre-negotiation briefing with positions ordered by priority. Predicted pushback on each position (based on supplier history if available). Fallback sequencing: what to concede first, what to hold, what to never concede. Red lines and non-negotiables clearly called out. Recommended compromises: "If they push back on X, offer Y in exchange for Z."

**Scenario 4: Benchmarking Rates**

**What to say: **"Are these rates competitive?" or "Benchmark this rate card" or "What should we counter with?"

**What to upload: **The supplier's pricing sheet, rate card, or the commercial section of a contract.

**What you get: **Rate benchmark cards with P10/P25/P50/P75/P90 percentile positioning. Your position relative to market for each rate line. Counter-offer with target, opening, and walk-away positions. TCO decomposition showing where costs are concentrated.

**Scenario 5: Order Form / SaaS Subscription Review**

**What to say: **"Review this order form" or "Can we sign this subscription?"

**What to upload: **The order form or subscription agreement.

**What you get: **Go/No-Go assessment: can this be signed as-is, with modifications, or not until blocking issues are resolved? Governing agreement status: has the underlying MSA/ToS been reviewed? Commercial counter-proposal: specific pricing, commitment, and term modifications. Protection gap analysis: what is missing that should be there?

**Scenario 6: Cleaning Up Comments Before Sending**

**What to say: **"Clean up the comments" or "Prepare this for the supplier" or "Too many comments"

**What to upload: **The commented DOCX (contract redline, SOW markup, or any document).

**What you get: **Hygiene report showing what should be consolidated, removed, shortened, or reclassified. Strategy leak detection: flags any supplier-facing comment that accidentally reveals internal positions. You choose what happens: apply all, walk through each one, apply by category, or skip entirely. Nothing is deleted until you explicitly approve. Hard Stop comments are always preserved.

**Scenario 7: Standalone Legal Negotiation Prep (No Contract Uploaded)**

**When to use: **You have a negotiation coming up but do not have a contract document to upload. Maybe the contract hasn't arrived yet, or you want to prepare before seeing the supplier's paper. When you DO have a contract, skip this skill. Upload the contract to lilly-contract-review instead, which produces legal negotiation prep natively as Panel 2 of the dashboard.

**What to say: **"Get me ready for the negotiation with [supplier]" or "Legal prep for the [supplier] renewal" or "What positions should I take on a SaaS agreement for [category]?"

**What to upload: **Nothing required. Helpful additions: prior contracts with the same supplier, negotiation history notes, business context (deal value, strategic importance, competitive alternatives).

**What Claude asks: **(1) Supplier name and category. (2) Deal type (new, renewal, amendment). (3) Estimated value. (4) Any known concerns or priorities.

**What you get: **Tactical briefing with positions ordered by priority. For each position: the Lilly standard, predicted supplier pushback, your fallback if they resist, and the red line (when to walk). SME pre-engagement recommendations (which specialists to brief before the call). Hard Stop reminders for the contract type. Recommended concession sequence: what to give up first (low cost to Lilly, high perceived value to supplier) and what to hold.

**Scenario 8: Standalone Commercial Pricing Analysis (No Contract Uploaded)**

**When to use: **You want to analyze pricing, benchmark rates, or build a counter-offer before a contract arrives. When you DO have a contract, skip this skill. Upload the contract to lilly-contract-review instead, which produces commercial analysis natively as Panel 3 of the dashboard.

**What to say: **"What should we pay for [category]?" or "Benchmark this pricing" or "Build me a counter-offer for [supplier]" or "TCO analysis for [category]"

**What to upload: **A rate card, pricing proposal, or description of what you are buying. Helpful additions: current contract pricing, volume data, competitive quotes.

**What Claude asks: **(1) Category and subcategory. (2) Current pricing if available. (3) Volume or scope. (4) Any competitive alternatives.

**What you get: **Market rate benchmark cards with percentile positioning (web-researched). Rate-by-rate comparison against market. TCO decomposition showing where costs concentrate. Counter-offer with three tiers: target (what you want), opening (what you ask for), and walk-away (your floor). Volume leverage analysis: where quantity commitments unlock better rates. Payment term NPV: the cash value of different payment structures.

**Scenario 9: Recording Negotiation Outcomes**

**When to use: **After a negotiation round or contract execution. Recording what the supplier accepted, rejected, or countered makes future reviews smarter. The contract review skill uses this history to predict pushback and calibrate positions.

**What to say: **"Record what happened in the Supplier A negotiation" or "Log the negotiation outcomes for the SaaS vendor" or "They accepted our liability cap but rejected the IP position"

**What to upload: **Nothing required. Describe the outcomes conversationally. Helpful additions: the original redline and the executed version (the skill compares them to extract outcomes automatically).

**What Claude asks: **For each position: did the supplier accept, reject, counter, or defer? If countered, what was the counter-position? If a compromise was reached, what were the terms?

**What you get: **Structured outcome record linked to the supplier profile. Pattern analysis: "This supplier has accepted limitation of liability caps in 3 of 4 negotiations but always rejects IP assignment." Over time, these patterns feed into future contract reviews, making the skill's predicted pushback more accurate and its position recommendations more calibrated to each specific supplier.

**Scenario 9b: Negotiation Simulator (Practice, Observe, Drill)**

**When to use: **Before a real negotiation call, to rehearse positions, watch a model negotiation play out, or drill a specific argument until it clicks.

**What to say: **"Practice the [supplier] negotiation" (Practice mode), "show me how a liability cap negotiation should go" (Observe mode), or "drill the IP assignment argument with [supplier]" (Drill mode). You can also just say "negotiation simulator" and pick the mode from a tappable menu.

**What to upload: **Nothing required to start. For an existing supplier, upload (or let Claude search M365 for) the governing MSA and prior or expiring work orders so the roleplay reflects what is already in place; the playbook positions and any recorded history make the supplier's pushback realistic.

**What Claude asks: **First, the simulation mode (Practice, Observe, or Drill). Then: custom scenario or scenario template (8 pre-built procurement scenarios are available). For custom: the supplier, contract type, issues, and your goal. For templates: pick one and optionally override any field. Claude builds the supplier's persona from the best available source: recorded history first, then governing documents, then a structured counterparty profile (tappable traits: style, posture, internal pressure, leverage), then category-typical behavior as a fallback. Finally: starting difficulty (Standard / Holds-firm / Aggressive), whether progressive difficulty is on, and whether turn-by-turn feedback is on.

**Three Simulation Modes:**

**Practice (interactive roleplay, the default): **You play the Lilly rep. Claude plays the supplier. Full interactive negotiation covering the chosen issues. Claude opens with realistic pushback, reacts to your moves, trades and resists as this supplier plausibly would. The simulation is always labeled as such. If turn-by-turn feedback is on, Claude pauses after each of your responses to give a 2-3 line assessment (what was strong, what was weak, what the playbook says) and offers you the option to retry your last response before continuing. If progressive difficulty is on, the supplier's resistance escalates when you're performing well and deescalates when you're struggling; the shifts are gradual and invisible. At any point you can request a "coach timeout" for a quick steer without ending the session. When you end the practice, Claude delivers a structured coaching debrief (see below).

**Observe (demonstration): **Claude plays BOTH sides: a Lilly rep and the supplier's negotiator. You watch 8-12 exchanges of a realistic negotiation on the chosen issues. The Lilly side uses proper playbook positions, anchoring, reciprocity, and concession sequencing. The supplier pushes back realistically per the counterparty profile. After every 3-4 exchanges, Claude inserts inline tactical analysis explaining the tactic just used, why it worked, and the playbook principle behind it. After the modeled negotiation ends, Claude provides a full tactical analysis: what the Lilly side did well, where it could have done better, and the key principles demonstrated. Then offers: "Want to try it yourself now?" (transitions to Practice with the same setup), "Run it again with a different approach" (e.g., collaborative vs. aggressive), or "Show me how it would go if [specific change]."

**Drill (single-issue focused): **Focused on one specific clause or argument. Claude opens with supplier pushback on that issue. You respond. Claude gives immediate feedback (2-3 lines: what was strong, what was weak, the playbook anchor, and a suggested stronger response). You can retry the same turn or continue. 3-5 exchanges per round, fast and repeatable. After the round: drill summary and the option to drill again on the same issue, drill a different issue, or switch to full Practice mode. Turn-by-turn feedback is always on in Drill mode (it is the point of the mode).

**Scenario Templates:**

8 pre-built procurement scenarios are available so you can start practicing without describing a situation from scratch. Each template pre-fills the supplier context, contract type, issues, difficulty, and counterparty profile. You can override any field. Templates include: (1) SaaS Renewal with Price Increase Defense, (2) New Strategic Vendor First MSA, (3) Rate Card Renegotiation for Professional Services, (4) Cloud ERP Complex Multi-Issue, (5) Pharmaceutical Supplier GxP and Data, (6) Tail Spend Consolidation, (7) Audit Rights Pushback, and (8) Negotiation Under Time Pressure. These templates are useful for team training: everyone practices the same scenario and compares results.

**Counterparty Profiling:**

When no recorded history or governing documents are available for a supplier, the simulator offers a structured persona builder. You select tappable traits: the supplier's style (data-driven, relationship-driven, precedent-focused, outcome-focused), posture (collaborative, firm but fair, aggressive, unpredictable), internal pressure (reports to CFO, Sales VP, Legal, or unknown), and leverage position (strong, balanced, weak). You can also provide a freeform description. This enriches the simulation when documents are thin.

**Structured Coaching Debrief:**

At the end of Practice and Observe sessions (and as a drill summary for Drill), Claude delivers a coaching debrief that combines narrative coaching with structured metrics:

- **Narrative coaching (per issue):** what worked, where you moved too early, the playbook position to anchor to, a stronger suggested line, any Hard Stop put at risk, and 2-3 concrete things to do differently in the real call.
- **Reciprocity ratio:** how many concessions you made vs. received. Flags any concession made without getting something back.
- **Anchor effectiveness:** for each issue, how close your final position was to the playbook target vs. your opening.
- **Playbook position coverage:** how many available playbook positions you actually used, and which ones you missed.
- **Hard Stop risk assessment:** whether any Hard Stops were put at risk, with exchange references.
- **Difficulty progression:** if progressive difficulty was on, where and why the supplier's resistance shifted.

**Tips for the Negotiation Simulator:**

- **Start with Observe mode if you're new to a contract type.** Watching a well-executed negotiation play out before trying it yourself builds a mental model of what good looks like.
- **Use Drill mode for your weakest clause.** If you consistently struggle with liability cap arguments, drill that specific issue 3-4 times before running a full Practice session.
- **Use scenario templates for team training.** Everyone practices the same SaaS Renewal scenario, then compare debrief metrics in a team meeting. The reciprocity ratio and playbook coverage percentage make comparison objective.
- **Turn on progressive difficulty for realistic rehearsal.** The real supplier will escalate if they sense weakness and soften if you're holding firm. Progressive difficulty models this.
- **Turn on turn-by-turn feedback when learning, turn it off when rehearsing.** Feedback mode is for building skills. When you're rehearsing for a real call, turn it off so the flow is realistic.
- **Record what you learn.** After the real call, use negotiation-playbook-learning to record the outcomes. That history makes the simulator smarter for next time with the same supplier.

**Scenario 9c: Cost & Financial Tools (Pro-Forma and Should-Cost)**

**When to use: **When a decision needs a financial case (pro-forma) or you want to know what something should cost before negotiating (should-cost).

**What to say: **"Build a pro forma / TCO / NPV model for this deal" (pro-forma-builder), or "what should this cost?" / "build a should-cost model" (should-cost-builder).

**What to upload: **For pro-forma: proposed pricing or a scope, plus a current-state baseline for a savings case (volumes, term, escalators help). For should-cost: the product/service spec, ideally with the supplier's proposed price to compute the gap.

**What you get (pro-forma): **A formula-driven Excel model (Assumptions, scenario projection, savings waterfall, NPV/ROI/payback, sensitivity), with every figure traced to an input, a labeled assumption, or a cited benchmark, and the math shown. Optional dashboard.

**What you get (should-cost): **A bottoms-up cost breakdown (materials/labor/overhead/logistics/margin) with a source and confidence on each component, a should-cost range, and the gap versus the supplier's price. Pair it with market-rate-benchmarking (top-down) to bracket your target. Both tools feed commercial-negotiation-prep, contract review, evaluation, and decision-deck.

**Document Types Handled by Contract Review**

| **Document Type** | **Review Approach** | **What the Skill Focuses On** |
| --- | --- | --- |
| MSA (supplier's template) | Full redline | Every section reviewed against playbook |
| MSA (Lilly template returned) | Verification | What the supplier changed, what they added/deleted |
| SOW / Work Order | Verification + commercial | Scope, deliverables, pricing, timeline, rate card compliance |
| Change Order | Verification + commercial + arithmetic | Price verification, scope delta, rate card compliance |
| Amendment | Verification | What changed, cascading impacts, authority requirements |
| Order Form / Subscription | Commercial assessment | Go/No-Go, commercial terms, governing agreement status |
| CDA / NDA | Full redline or verification | Confidentiality scope, term, carve-outs, return/destruction |
| DPA | Checklist | Breach notification, subprocessors, data transfers, DSAR |

**Tips for Contracting Skills**

- **The redline uses your name. **Comments and tracked changes are attributed to your name (e.g., "[Your Name] (Lilly)"). If you have not told Claude your name, it uses "Lilly Procurement."

- **Three comment types matter. **Supplier-facing = the supplier can see it. Internal-only = strip before sending (internal strategy). SME escalation = needs specialist review first. Always strip internal and SME comments before sending to the supplier.

- **The arithmetic check catches pricing errors. **Rate x hours = total, escalation formula verification, compounding vs. simple increase calculation, renewal cap compliance. Every math discrepancy is flagged with the exact calculation shown.

- **Negotiation outcomes make future reviews smarter. **Record what the supplier accepted or rejected after each round. The contract review skill uses that history to predict pushback and calibrate positions on the next contract with that supplier.

- **Upload all related documents. **The contract plus the parent MSA, amendments, and related SOWs. The skill reads the MSA first and cross-references findings against it. Without the governing MSA, the skill cannot verify protection coverage.

---

**RFx Pipeline**

The pipeline runs in sequence (Supplier Landscape, RFP Engine, RFP Case Manager, Response Analysis, Evaluation Engine, Decision Deck), but every skill works standalone. Enter at any point. Each skill produces handoff artifacts that the next skill consumes automatically. Decision Deck v2 also accepts inputs from any other skill (contract review, category strategy, spend analysis, pro-forma builder) and works independently of the RFx pipeline.

| **You Say...** | **What to Upload** | **What Happens** |
| --- | --- | --- |
| "Find vendors for X" | Nothing (or requirements doc) | Supplier landscape report + shortlist dashboard |
| "Create an RFP for X" | Landscape handoff or requirements | Complete RFP package ready for issuance |
| "Set up the case for this RFP" | RFP package + supplier contacts | Case file adapted to an existing bound Team if any, plus scheduling and tracking |
| "Analyze the supplier responses" | Supplier submissions (zip per vendor) | Evaluation report + comparison dashboard |
| "Score the proposals" | Analysis handoff or supplier responses | Scored evaluation + award/non-award letters |
| "Build a deck for leadership" | Any combination of inputs | PPTX presentation from approved storyboard |

**Scenario 10: Market Research and Vendor Shortlisting**

**What to say: **"Find vendors for supply chain planning software" or "I need to source a SaaS tool for vendor risk management globally" or "Who should we talk to for contract lifecycle management?" A single sentence is enough to start.

**What to upload: **Nothing required. A requirements document (Excel/CSV) dramatically improves accuracy. Disqualifiers, budget range, or timeline constraints also help.

**What Claude asks: **(1) Full Report or Supplement? Full Report builds from scratch; Supplement adds to an existing vendor list. (2) Must-have capabilities or disqualifiers (only if needed). (3) After the broad scan, Claude presents 10-15 candidates and asks you to confirm before deep-diving the top 5.

**What you get:**

- supplier_landscape_report.docx: 15-30 page Lilly-branded report with executive summary, market context (Porter's Five Forces), vendor profiles with capability matrices, risk assessment per vendor, and a recommended shortlist with rationale.

- Interactive dashboard with heatmaps showing vendor-by-capability scoring, side-by-side comparison of top vendors, and risk overlays.

- Structured CSV files with vendor data formatted for downstream use by rfp-engine.

- Each vendor scored on a weighted matrix: alignment with requirements, implementation risk, pricing model, contract flexibility, and integration fit. Scores for vendors outside the respondent pool are inferred from public data and analyst reports, labeled with confidence levels (High, Medium, Low).

**Scenario 11: Creating an RFP Package**

**What to say: **"Create the RFP package for this sourcing event" or "Build a requirements matrix for supply chain planning"

**What to upload: **The supplier landscape handoff (produced automatically by the prior skill) OR a description of what you are sourcing + requirements. Any Lilly-specific terms, templates, or constraints.

**What Claude asks: **(1) RFI or RFP? (2) Which optional sections apply? (InfoSec, integration, diversity, demos, evaluation criteria). (3) Stakeholder roster (who evaluates, attends demos, approves). (4) Vendor contacts for invitation letters. (5) Requirements document (upload yours or Claude helps build one).

**What you get:**

- Lilly-branded RFP instructions document from the institutional template with boilerplate sections locked and optional sections toggled based on your sourcing category.

- Requirements matrix (Excel) with weighted criteria, ready for supplier completion. If you upload your own matrix, the skill uses it as-is and suggests up to 5 improvements.

- Pricing template (Excel) structured for apples-to-apples comparison across suppliers.

- Demo evaluation guide with scoring rubric, attendee roles, and scenarios to test.

- Supplier invitation emails personalized per vendor, ready to send.

- Supplier Q&A log template for tracking questions received and answers provided.

**Scenario 12: Managing an Active RFP (Case Manager)**

**When to use: **You are running an active RFP with multiple stakeholders and need help coordinating logistics. This skill works best inside a Claude Project (where multiple people share the conversation) with the M365 connector enabled.

**When to skip: **If you are working solo or the RFP has only 1-2 suppliers. The coordination overhead is not worth it for small sourcing events. Use the other RFx skills directly.

**What to say: **"Set up a case for the SCP RFP" or "Schedule the vendor demos" or "What's the latest on the supply chain sourcing?"

**What to upload: **The RFP package from rfp-engine (or your own RFP documents). Supplier contact information. Stakeholder availability or scheduling constraints.

**What Claude asks: **(1) RFP case name and timeline. (2) Stakeholder roster with roles (evaluator, observer, approver). (3) Supplier list with contacts. (4) Scheduling preferences for demos and Q&A.

**What you get:**

- Optional Microsoft Team binding: if a Team is bound, Claude reads the existing SharePoint/Teams structure and adapts the case file to what already exists. It does not generate or prescribe a Teams/SharePoint structure for you to create, and it does not create Teams resources.

- Document organization summary: if a Team is bound, Claude summarizes the existing SharePoint/Teams structure and recommends where case artifacts should be stored. If no Team is bound, it provides a simple suggested organization pattern for the user to apply manually.

- Demo scheduling drafts with calendar invite content, attendee lists, and logistics. Claude produces calendar-invite text for you to copy, send, or create manually; with an approved compose surface it may open an unsent draft for your review. It never sends, posts, creates, or modifies M365 content automatically.

- Q&A tracking log: every supplier question logged with timestamp, assigned responder, and response status. Answers are tracked to ensure all suppliers receive the same information.

- Supplier participation status board: which suppliers have confirmed, submitted questions, requested extensions, or withdrawn.

- Communications log: every email, meeting note, and supplier correspondence indexed and searchable. This becomes the audit trail for the sourcing event.

- Status reports formatted for leadership with timeline, supplier status, open items, and risk flags.

**How it works with M365: **With the M365 connector enabled, the skill can search your SharePoint for existing RFP documents, produce calendar-invite text (read-only; it never creates or sends invites automatically), and query Teams for channel activity. Without M365, the skill produces the same artifacts as documents you implement manually.

**Scenario 13: Evaluating Supplier Responses**

**What to say: **"Analyze the supplier responses to the RFP" or "Produce the full evaluation report" or "Compare what each vendor said about integration"

**What to upload: **The completed requirements matrix with vendor scores. Proposal documents, pricing templates, MSA redlines from each vendor. Best practice: organize as one folder per vendor in a single zip file.

**What Claude asks: **(1) Analysis mode: Mode A (per-supplier profiles only), Mode B (cross-vendor comparison), Mode C (full analysis with scoring and recommendation). (2) Brief (~10 pages) or Full (30-40 pages). (3) AI extraction confidence acknowledgment.

**What you get:**

- Per-supplier profiles: executive summary, strengths/weaknesses, capability coverage against requirements, pricing analysis, risk assessment, and notable gaps or differentiators.

- Cross-vendor comparison: side-by-side matrix of how each supplier answered each requirement. Heatmap of capability coverage. Pricing comparison normalized to common units (per-user, per-transaction, total 3-year TCO).

- Inconsistency detection: the skill flags when a supplier's pricing does not match their narrative ("claims 24/7 support but pricing template shows business-hours-only SLA"), when self-ratings do not match written evidence, or when key requirements received no substantive response. Every inconsistency is severity-classified.

- Interactive dashboard with drill-down per supplier, cross-cutting comparison tabs, and a requirements-fit heatmap.

- Pipeline artifacts formatted for evaluation-engine to consume directly.

- analysis_summary.docx: 15-40 page Lilly-branded report that serves as the primary evaluation deliverable.

**Scenario 14: Formal Scoring and Award Decision**

**What to say: **"Run the formal evaluation scoring" or "Generate award and non-award letters" or "Score these proposals and give me a recommendation"

**What to upload: **The analysis summary from Response Analysis + stakeholder scores if collected separately. If you are starting here without prior Response Analysis, upload the raw supplier submissions directly.

**What Claude asks: **(1) AI scoring enabled or disabled? AI scoring uses the matrix and cites evidence; you can also include human stakeholder scores alongside AI scores. (2) Scoring matrix source: use the provided matrix, or generate one from requirements. (3) Brief or Full report.

**What you get:**

- Scored evaluation matrix: each supplier rated 0-5 per criterion with written evidence citations from their response. If stakeholder scores are provided, they are consolidated alongside AI scores with variance analysis showing where evaluators disagree.

- Sensitivity analysis: the skill tests whether shifting any weight by 5 points would change the ranking. If the recommendation is fragile (a small weight change flips the winner), you know before committing. The report states the margin of victory and which weights are most influential.

- Recommendation with rationale: the top-ranked supplier with specific reasons, the runner-up with conditions under which it would be preferred, and any suppliers recommended for elimination.

- Award notification letter personalized for the winning supplier with next steps.

- Non-award letters for all other suppliers with constructive feedback at the level you specify (brief "thank you for participating" through detailed scoring feedback).

- Q&A responses if any outstanding supplier questions remain.

**Scenario 15: Building an Executive Presentation (Decision Deck)**

**What to say: **"Help me build a deck for leadership" or "Create a presentation from this dashboard" or "I need to present this deal to the CFO" or "Build me an executive deck"

**What to upload: **Any combination of inputs. The skill reads whatever you give it: contract review dashboards, category strategy dashboards, evaluation reports, contracts, pro-forma models, spend data, prior decks, or just a verbal description of the situation. It does not require any specific upstream skill to have run first.

**What Claude asks: **(1) Who is the audience? (CPO, CFO, procurement leadership, cross-functional, external) (2) What conclusion do you want them to reach? (approve the deal, fund the initiative, approve the vendor selection, greenlight the recompete) (3) Do you want to draft the story yourself, or should Claude propose the narrative arc?

**How the storyboard works: **This is the key difference from a skill that just builds slides. Before any PPTX is generated, Claude drafts a text storyboard in the chat. Each slide is described with its purpose, headline, key message, supporting data, and visual concept. You read the storyboard and iterate: "Move slide 4 before slide 3," "The risk slide needs to address the SOX audit finding," "Add a slide comparing the incumbent vs. the challenger." Once the story is locked, Claude builds the PPTX from the approved storyboard. Visual adjustments happen after the story is right.

**What you get:**

- PPTX presentation in LAYOUT_WIDE format with Lilly branding, data visualizations, and speaker notes. The deck is structured as a narrative arc, not a data dump: situation, complication, resolution, ask.

- Optional one-page decision brief: a single-page summary that captures the ask, the recommendation, the key data points, and the conditions/risks. Use this for executives who want the answer without the deck.

- The deck is built from your approved storyboard, so every slide has a reason to exist and a message to deliver. No filler slides.

**Tips for Decision Deck:**

- The more inputs you provide, the richer the deck. An evaluation dashboard + a contract review + spend data produces a more compelling story than a verbal description alone.

- If you want to present work from another skill (a category strategy, a contract review, a supplier evaluation), just reference it: "Build a deck from the category strategy dashboard" or "Present the contract review findings to the CPO."

- The storyboard phase is where the real work happens. Spend time getting the story right. The PPTX generation is mechanical once the narrative is locked.

- For decks that need to go through multiple rounds of leadership review, iterate on the storyboard in chat, not on the PPTX. Rebuilding slides is cheap once the story is finalized.

**Tips for the RFx Pipeline**

- **Start with as little as a sentence. **"We need a SaaS tool for contract lifecycle management" is enough to kick off supplier research. Add requirements, business cases, or prior RFPs for richer output.

- **Upload everything for evaluation. **Each supplier's full response package: proposals, completed requirements matrix, pricing template, technical diagrams, MSA redlines if available.

- **Use Brief mode for quick reads. **Both response analysis and evaluation have Brief/Full modes. Brief gives you a 10-page focused summary. Full goes to 30+ pages with section-by-section detail.

- **Let it generate the scoring matrix. **If you do not have one, the skill builds it from the requirements with default weights. If you do have one, it uses yours exactly as-is and suggests up to 5 improvements.

- **The pipeline remembers context within a conversation. **If you run supplier-landscape and then say "now create the RFP," the skill picks up the shortlist automatically. If you start a new conversation, upload the prior skill's output files to re-establish context.

---

**Category Strategy**

| **You Say...** | **What to Upload** | **What Happens** |
| --- | --- | --- |
| "Category strategy for software" | SHARP extract, Ariba report, PO dump, any Excel/CSV | 11-tab interactive dashboard with full category analysis |
| "Category strategy for commodity 860" | Spend data for that commodity | Same dashboard, filtered to that commodity |
| "Build strategies for these 5 categories" | Full portfolio spend data | One dashboard with a category dropdown, each analyzed independently |
| "What's the market rate for staff aug?" | Nothing (or a rate card to benchmark) | Web-researched rate benchmark cards with percentile positioning |
| "Compare our contracts for SaaS" | 2+ contracts or rate cards | Internal comparison matrix showing where you are overpaying |
| "Find redundant tools" | Spend data or contract list | Rationalization register with overlap mapping and savings estimates |

**Category Strategy: Full Walkthrough**

**What to say: **"Category strategy for [commodity]" and upload your spend file.

**What data to upload: **Minimum: a spend file with supplier name, amount, and date. SAP/SHARP extracts work best (pre-loaded with commodity codes, diversity flags, geography, parent-child mappings). Any Excel/CSV works. Optionally upload prior category strategy decks (PPTX) for historical comparison and incorporation.

**What Claude asks: **Five questions after analyzing your data: (1) Business priorities for the category (top 3). (2) Savings pipeline opportunities. (3) Scorecard KPIs (Claude proposes, you confirm or adjust). (4) Strategic constraints (mandated suppliers, ongoing RFPs, leadership directives). (5) Category team and governance.

**If you do not respond to the five questions, **Claude proceeds with data-derived defaults and labels them as "data-derived, pending your confirmation." An empty tab is always worse than a data-derived proposal.

**The 11 Dashboard Tabs:**

| **Tab** | **What It Shows** |
| --- | --- |
| 1. Overview | KPIs, annual trend, top suppliers, geographic distribution, data quality assessment |
| 2. Pareto and Tail | Supplier concentration, tail analysis, consolidation recommendations with savings estimates |
| 3. Suppliers | Sortable table with click-to-expand deep dive per supplier (contract status, spend trend, risk) |
| 4. Subcategories | Spend by subcategory with fragmentation analysis and consolidation opportunities |
| 5. Market and Kraljic | Porter's Five Forces (web-researched), Kraljic positioning (profit impact vs. supply risk) |
| 6. Risk | Risk register with severity and likelihood, industry evolution timeline |
| 7. Strategy | Options analysis, recommendation, supplier tiering (strategic/leverage/bottleneck/routine) |
| 8. Savings and Scorecard | Savings pipeline with $ estimates, KPIs with targets and measurement method |
| 9. Supplier Development | SBE/WBE diversity trends, gap analysis, development opportunities |
| 10. Rationalization | Consolidation opportunities, capability overlap matrix, redundant tool identification |
| 11. Trend and Change | Period-over-period decomposition, supplier swing analysis, new entrant/exit tracking |

**Category Strategy Modes: DEVELOP vs MANAGE**

The category strategy skill operates in two modes. The dashboard structure is identical (same 11 tabs). The difference is what data feeds the analysis and whether historical comparison is included.

**DEVELOP mode: **Build a category strategy from scratch. Use when entering a new category, taking over an unmanaged one, or replacing a strategy that is stale enough to be useless. Upload spend data. Claude does a full analysis: spend decomposition, supplier portfolio, web-researched market intelligence (Porter's Five Forces, market trends, benchmarks), Kraljic positioning, risk assessment, strategy options with pros and cons, savings pipeline, and a 12-month action plan. Everything is built fresh from the data and research. This is the default mode when you upload a spend file without a prior strategy deck.

**MANAGE mode: **Update an existing strategy with new data. Use for annual reviews, when market conditions shift, or when the supplier base changes. Upload the current spend data AND the prior strategy deck (PPTX). Claude does everything DEVELOP does, but adds a comparison layer: what changed since the last strategy? Did the savings targets get hit? Did the tail reduction work? Did supplier concentration improve or worsen? It produces a Strategy Evolution table comparing prior vs current across every metric, then flags what the prior strategy got right, what it missed, and what needs to change. If you upload a spend file AND a prior strategy PPTX, the skill automatically recognizes this as MANAGE mode.

**Multi-Category Analysis**

When you ask for strategies across multiple categories (e.g., "Build strategies for these 5 categories"), the skill produces one dashboard with a dropdown selector at the top. Each category is analyzed independently with its own 11 tabs. Nothing merges between categories. The dropdown lets you switch between them. This is useful for portfolio reviews or annual strategy refreshes across your category portfolio.

Context limits apply. Five categories in one conversation is feasible. Ten or more will likely exhaust the context window. For large portfolios, batch categories into groups of 3-5 across separate conversations.

**Market Rate Benchmarking: Full Walkthrough**

This skill has three distinct modes. Each solves a different problem.

**Mode 1: EXTERNAL (Market Rate Research)**

**What to say: **"What's the market rate for staff augmentation?" or "Benchmark rates for cloud hosting" or "What should we pay for SAP consulting?"

**What to upload: **Nothing required. A rate card or pricing proposal to benchmark against improves the output.

**What you get: **Web-researched rate benchmark cards showing P10/P25/P50/P75/P90 percentile ranges for each role or service. Your current rate positioned against market. Sources cited with confidence levels. Geographic and experience-level adjustments where data supports it.

**Mode 2: INTERNAL (Cross-Contract Comparison)**

**What to say: **"Compare our contracts for SaaS" or "What are we paying different vendors for the same service?" or "Internal benchmarking for professional services"

**What to upload: **Two or more contracts, rate cards, or pricing sheets in the same category.

**What you get: **Internal comparison matrix showing pricing gaps across your own portfolio. Identifies where you pay Vendor A $260/hr for the same role Vendor B charges $195/hr. Highlights contractual differences that explain pricing gaps (volume commitments, term length, payment terms). Savings opportunities from harmonizing rates across the portfolio.

**Mode 3: RATIONALIZATION (Portfolio Overlap)**

**What to say: **"Find redundant tools in our software portfolio" or "Rationalize our SaaS vendors" or "Show me overlapping capabilities"

**What to upload: **Spend data, contract list, or vendor inventory for the category.

**What you get: **Capability overlap matrix showing where multiple vendors provide the same functionality. Redundant tool identification with annual cost. Consolidation register with estimated savings from eliminating overlap. Recommended consolidation sequence (which to keep, which to exit, in what order).

**Tips for Category Strategy**

- **SHARP extracts work best. **Pre-loaded with commodity codes, diversity flags, geography, and parent-child mappings.

- **Upload prior strategy decks. **Historical PPTX decks are read and incorporated into relevant dashboard tabs. This enables prior-vs-current comparison in MANAGE mode.

- **Multiple categories in one dashboard. **Request multiple categories and get one dashboard with a dropdown. Each category is analyzed independently. Structure is identical. Nothing merges between categories.

- **The Strategy and Savings tabs require your input. **These tabs are marked NEEDS_INPUT until you respond. The rest of the dashboard populates automatically from the data.

---

**Executive Summary (ATC/ATS)**

**What to say: **"ATC summary for this contract" or "ATS executive summary" or "Build an approval summary"

**What to upload: **The contract, work order, SOW, or amendment.

**What Claude asks: **(1) Your grade level (e.g., P4/M2, P5/M3), which determines where the ATC chain starts. (2) Business owner name and grade, which determines the ATS chain. (3) A few metadata fields the skill cannot derive from the document (procurement contact, cost center, project name). The skill proposes the full approval chain and asks you to confirm the names before generating.

**What you get: **A Word document in the Lilly-approved format: Calibri 11pt throughout, plain bold section headers (not colored banners), light gray table headers, governance fields as inline bold-label text pairs at the bottom. All narrative content derived from the uploaded document. Correct FRAP approval chain based on deal value.

**Scenario Variations for Executive Summaries:**

**Amendment chain: **When creating an ATC for an amendment, upload both the amendment and the base contract. The skill identifies the cumulative deal value (base + amendment) for FRAP calculation and the narrative focuses on what changed, not what was already approved.

**Ambiguous deal value: **Some contracts have phased pricing, optional components, variable fees, or tiered volume pricing. The skill asks which value to use for FRAP calculation and explains the options: committed minimum, maximum if all options exercised, expected value based on volume projections. If you know which value your approval workflow expects, tell Claude.

**Overriding the FRAP calculation: **If the auto-calculated approval chain is wrong (the skill picked the wrong value, or there is a delegation exception, or a prior approval covers part of the amount), say "the FRAP level should be [X] because [reason]." The skill recalculates the chain from your specified level.

**Non-standard categories: **The default template was built from procurement executive summaries. If your category uses a different format (Lab Services, Facilities, Marketing, Manufacturing), you can upload 5-8 previously approved ATC/ATS summaries from your category and the skill will calibrate its output to match your category's conventions. Or use the standard template as-is.

**Tips: **Upload all related documents (if a WO references a parent MSA, upload both). The approval chain is calculated, not guessed. Output format is locked to match what procurement uses for submissions. This is the fastest skill in the suite: upload a contract, answer 2-3 questions, and the summary generates in under a minute.

| **04** | **Running a Full Pipeline End to End** |
| --- | --- |

This section walks through two complete pipeline scenarios from start to finish, showing how skills chain together.

**Example A: Full RFx Sourcing Event**

You need to source a contract lifecycle management (CLM) tool. Here is how the pipeline flows from first research through award.

**Step 1 - Market Research (Supplier Landscape)**

Start a new conversation. Say: "Find vendors for contract lifecycle management software. We need SaaS, global deployment, integration with SAP and Vendor A, and a budget of $500K-$1M annually."

Claude runs the supplier-landscape skill: broad web research, builds 10-15 candidate profiles, presents them for your confirmation, then deep-dives the top 5. You get a DOCX report, a dashboard, and CSV data files. Review the shortlist, remove any vendors you know are not viable, and confirm the final list.

**Step 2 - RFP Creation (RFP Engine)**

In the same conversation, say: "Now create the RFP package for these 5 vendors." Claude reads the landscape handoff and launches rfp-engine. Answer the intake questions (RFI or RFP, optional sections, stakeholders, vendor contacts). You get the full package: instructions document, requirements matrix, pricing template, demo guide, and invitation emails.

Download the artifacts, review them, and issue the RFP to the shortlisted vendors.

**Step 3 - Case Management (RFP Case Manager, optional)**

If you are running this in a Claude Project with multiple evaluators, start a new conversation in the project and say: "Set up a case for the CLM RFP." Upload the RFP package and supplier contacts. With a Team bound, the skill reads the Team's existing SharePoint/Teams structure and adapts the case file to it; without one, it runs on Project knowledge and uploads. It produces scheduling drafts and tracking templates. It does not create or prescribe Teams/SharePoint resources.

During the RFP period, use this conversation to log supplier questions, schedule demos, and track status.

**Step 4 - Response Evaluation (Response Analysis)**

Suppliers have submitted their responses. Start a new conversation. Upload all responses (one zip per vendor is ideal) and say: "Analyze the supplier responses." Choose Mode C (full analysis) and Full depth.

Claude extracts per-supplier profiles, builds cross-vendor comparisons, catches inconsistencies between pricing and narrative, and produces the analysis_summary.docx and an interactive dashboard.

**Step 5 - Scoring and Award (Evaluation Engine)**

In the same conversation, say: "Now run the formal evaluation scoring." The skill reads the analysis handoff. Enable AI scoring. If you have stakeholder scores, upload them. The skill produces scored evaluations with sensitivity analysis, the recommendation, and award/non-award letters.

Review the sensitivity analysis carefully. If the recommendation is fragile, consider whether additional evaluation criteria or stakeholder input would strengthen the decision.

**Step 6 - Executive Presentation (Decision Deck)**

In the same conversation (if context allows) or a new one with the evaluation outputs uploaded, say: "Build a deck for the CPO. We want her to approve the CLM vendor selection."

Claude drafts the storyboard. Iterate until the narrative is right. Claude builds the PPTX. Share the deck.

**Total conversations needed: **2-4 depending on document size and whether you use rfp-case-manager. The pipeline produces a complete, defensible sourcing record from market research through award.

**Example B: Contract Negotiation Through Approval**

You received a new SaaS agreement from a vendor. Here is the flow from first review through executive approval.

**Step 1 - Contract Review**

Start a new conversation. Upload the vendor's MSA and say: "Review this contract. Estimated value $2M over 3 years." Choose your persona and Full Review.

Claude produces the redlined DOCX, the 3-panel dashboard, and the vendor response draft. Review the redline, strip internal comments, and send to the supplier with the vendor response draft.

**Step 2 - Supplier Returns Their Redline (Round 2)**

The supplier marks up your redline and sends it back. Start a new conversation. Upload the supplier's redline and say: "Review the supplier's response." Claude classifies every supplier change, updates the negotiation strategy, and produces an updated redline.

**Step 3 - Negotiation Prep**

Before the negotiation call, say: "Get me ready for the call with [supplier]" and upload the latest round. Claude produces the tactical briefing with concession sequencing.

**Step 4 - Record Outcomes**

After the call, say: "Record the negotiation outcomes. They accepted our liability cap at $5M, rejected IP assignment, and countered on termination for convenience with 90 days instead of our 60." Claude logs the outcomes.

**Step 5 - Executive Summary**

The deal is agreed. Start a new conversation. Upload the executed contract and say: "ATC summary." Answer the metadata questions. Claude produces the approval document.

**Step 6 - Decision Deck (if needed)**

If this deal requires a presentation to leadership (large value, strategic vendor, exception request), say: "Build a deck presenting this deal to the CFO" and upload the contract review dashboard and ATC summary.

| **05** | **Which Model to Use** |
| --- | --- |

Claude is available in multiple models. The two most relevant for these skills are Opus (the most capable model, deeper reasoning, handles complex multi-step tasks) and Sonnet (faster, lighter, still very capable, lower token cost). The right choice depends on the skill and the complexity of the task.

**Use Opus For**

Tasks where analytical depth, sustained multi-step reasoning, or resistance to workflow collapse matter:

- **Contract review (lilly-contract-review): **The most complex skill in the suite. The mandatory 4-pass workflow includes definition tracing, protection gap analysis against governing documents, commercial analysis with benchmarking, and a 14-category protection matrix. Sonnet will produce plausible-looking output but is significantly more likely to collapse the multi-pass workflow into a shallow single pass, producing findings that look complete but miss the cross-reference and tracing depth.

- **Category strategy (category-strategy): **Building an 11-tab dashboard from raw spend data with web-researched market intelligence, Kraljic positioning, Porter's Five Forces, and data-derived strategy recommendations involves sustained multi-step reasoning across many phases. Opus maintains analytical consistency across the full build.

- **Evaluation engine (evaluation-engine): **Sensitivity analysis that tests whether shifting weights changes rankings, combined with evidence-cited scoring and cross-supplier comparison, benefits from Opus reasoning depth. A fragile recommendation that Sonnet misses is worse than a slower generation on Opus.

- **Response analysis (rfp-response-analysis): **Cross-vendor comparison with inconsistency detection across multiple supplier submissions. Opus is better at catching when a supplier's pricing does not match their narrative, or their self-rating does not match what they wrote.

- **Complex negotiation prep: **When preparing for a high-stakes negotiation with a strategic supplier where the positions need to be nuanced, the legal and commercial prep skills produce more sophisticated output on Opus.

**Use Sonnet For**

Tasks that are more structured, faster, or where the analytical work has already been done by an upstream skill:

- **Executive summaries (executive-summary-package): **Straightforward document reading and narrative generation. The structure is templated and the analysis is extractive, not generative. Sonnet handles this well and produces output faster.

- **Comment cleanup (comment-cleanup): **Pattern matching and classification of comments. The skill is identifying redundancy and strategy leaks, not generating new analysis.

- **Supplier landscape (supplier-landscape): **Primarily web search driven. The depth comes from the breadth of search, not the depth of reasoning per search result.

- **RFP document generation (rfp-engine): **Template-based production. The skill is filling in a known structure, not reasoning from first principles.

- **Decision deck (decision-deck):** Building a presentation from any available inputs. The skill drafts the story collaboratively before building slides.

- **Market rate benchmarking (market-rate-benchmarking): **Web research and rate comparison. Structured output from structured input.

- **Simple contract reviews: **Standard order forms or short amendments with limited scope where the analysis is straightforward.

- **Negotiation outcome recording (negotiation-playbook-learning): **Structured data capture from your description. Sonnet handles this efficiently.

**Token Consumption: What It Means and Why It Matters**

Every skill consumes tokens, which is the unit that measures how much of Claude's processing capacity you use per conversation. Every conversation has a context window (a maximum amount of information Claude can hold at once). When you hit the limit, you need to start a new conversation.

Some skills are heavy consumers:

- **Contract review with full dashboard: **The most token-intensive skill. A complex MSA review with all three dashboard panels, the redline DOCX, and the vendor response draft can consume a significant portion of a conversation's available context. For very large contracts (80+ pages), choose "Redline Only" first, then come back in a new conversation for the dashboard.

- **Category strategy dashboard: **The 11-tab dashboard with web research is also token-heavy. Provide clean, well-structured spend data to minimize re-processing. Avoid uploading multiple versions of the same data.

- **Response analysis across 4+ suppliers: **Each supplier's full response adds substantially to context. Use Brief mode for initial reads; switch to Full only when you need the detail.

- **Dashboard regeneration: **Every time you ask Claude to fix or adjust a dashboard, it regenerates the entire artifact from scratch. This is important to understand: three rounds of dashboard tweaks consume roughly three times the tokens of the original generation. Be specific about what needs fixing and batch your requests.

| Sonnet uses fewer tokens per response than Opus for the same task. If you are running into context limits, switching to Sonnet for lighter tasks preserves capacity for the work that needs Opus. |
| --- |

| **06** | **Working with AI Output** |
| --- | --- |

**AI Is Not Right All of the Time**

These skills are powerful analytical tools, but they are not infallible. Claude works from the documents you provide and the information available through web search. It does not have access to your institutional knowledge, your relationship history with a supplier, the verbal commitments made in a meeting, or the business context that lives in your head.

| **Real example: ** In a recent contract negotiation analysis, Claude recommended negotiating a call volume threshold back to 15,000 calls per month when the correct unit was per week. The contract language was ambiguous and Claude had no way to know the operational reality. The procurement rep caught it because they knew the business. This is exactly how the workflow is designed to function: the skill does the analytical heavy lifting, and you apply the judgment. |
| --- |

**Specific Items to Check Before Sending Any Output**

**For contract redlines:**

- Rates, volumes, thresholds, and units of measure. The arithmetic check catches calculation errors, but unit-of-measure errors (per month vs. per week, per user vs. per seat) require your knowledge of the operational reality.

- Positions that reference your negotiation history. The skill may recommend a position that a specific supplier has already firmly and repeatedly rejected.

- Hard Stop escalations. Verify the SME contact is correct and the escalation is warranted.

- Party identification. Confirm the skill correctly identified who is on each side (especially in multi-party agreements or assignments).

**For commercial analysis:**

- Market rate benchmarks. Web-sourced rates are directionally accurate but may not reflect your specific geography, volume tier, or relationship dynamics. A rate that is "P50" nationally may be high or low for your specific context.

- TCO assumptions. Check what is included and excluded in the total cost calculation. The skill documents assumptions but you know whether they match reality.

**For executive summaries:**

- The deal value used for FRAP calculation. If the document contains multiple values (phased pricing, options, variable fees), Claude may pick the wrong one.

- Approval chain names. The skill calculates the correct grade levels but you confirm the specific people.

- Narrative accuracy. Every statement in the narrative should trace to something in the document. Flag anything that does not.

**For category strategy dashboards:**

- Supplier name normalization. Claude attempts to group variants ("IBM", "IBM Corp", "International Business Machines") but may miss some or group incorrectly.

- Spend classification. If the dashboard puts a supplier in the wrong subcategory, the downstream analysis (Kraljic, risk, strategy) is affected.

- Web-researched market intelligence. Porter's Five Forces and market context come from web search. They are labeled with sources and confidence levels. Verify against your own category knowledge.

**For supplier landscape reports:**

- Vendor scores for companies outside the respondent pool are inferred from public data, analyst reports, and product capabilities. They are not from formal responses. Confidence levels are labeled: High (formal response), Medium (public data), Low (marketing materials).

- Vendor existence and current market position. Web search data may be dated. Confirm vendors are still operational and offering the products described.

**For RFP evaluation reports:**

- Inconsistency flags. The skill may flag a pricing/narrative mismatch that has a valid explanation (tiered pricing that applies only at certain volumes, for example). Use the flags as prompts for clarification during Q&A, not as automatic disqualifications.

- AI scoring vs. stakeholder scoring. AI scores are evidence-cited but may weigh factors differently than your evaluation team. Review where AI and stakeholder scores diverge and understand why.

- Sensitivity analysis. If the sensitivity analysis shows the recommendation is fragile, this is not a flaw in the analysis. It means the decision is genuinely close and may benefit from additional evaluation criteria or a BAFO round.

**Do Your Own Due Diligence**

**Do not submit any AI-generated output without reviewing it yourself. **This applies to:

- Redlined contracts going to a supplier

- Executive summaries going into the approval workflow

- RFP documents going to vendors

- Award and non-award letters

- Category strategy recommendations going to leadership

- Any document with financial figures, legal positions, or supplier commitments

| You own the output. Claude produced a draft. You are the author of the final version. |
| --- |

| **07** | **Working with Dashboards** |
| --- | --- |

Several skills produce interactive dashboards as React (.jsx) artifacts. These render in the Claude conversation as interactive web applications with tabs, charts, sortable tables, and drill-down panels. Dashboards are the primary output of category-strategy and a companion output for lilly-contract-review, supplier-landscape, and rfp-response-analysis.

**Sharing Dashboards**

Dashboards are shareable using Claude's built-in sharing feature (the share icon on the artifact). If the share button does not appear, the dashboard was likely created using the wrong internal method. Ask Claude: "Recreate the dashboard using create_file to make it shareable."

To share outside of Claude (e.g., embedding in a SharePoint page or sending to someone without a Claude account), you would need to host the JSX file in a web environment. For most internal use, sharing the Claude conversation link is the simplest approach.

**When to Iterate on Dashboards**

**Do iterate when:**

- The dashboard is going to be presented to leadership, a decision group, or external stakeholders

- Data is missing or incorrect (always fix data accuracy regardless of audience)

- A tab is empty or shows placeholder content

- The layout is broken or unreadable

- Critical analysis is shallow (e.g., Strategy tab with generic recommendations instead of data-driven ones)

**Do not iterate when:**

- You are using the dashboard as a personal working tool and the data is correct

- The issue is cosmetic (font size off by 1pt, spacing slightly uneven, color shade slightly different)

- You want "one more tweak" after three rounds of changes

| Each round of dashboard fixes regenerates the entire artifact from scratch. Three rounds of cosmetic tweaks consume roughly the same tokens as the original generation. Be specific about what needs fixing and batch your requests: "Fix these three things" is better than three separate messages. |
| --- |

**Common Dashboard Issues and Fixes**

**"The dashboard has a React error or crashes."**

Common cause: invalid CSS properties. React uses camelCase for inline styles (marginBottom, backgroundColor, fontSize), but Claude sometimes generates Tailwind shorthand (mb, bg, fs) or CSS kebab-case (margin-bottom). These cause runtime errors. Ask Claude: "The dashboard has a rendering error. Check all inline style objects for invalid CSS property names and fix them."

**"The dashboard didn't render / shows as code."**

The dashboard must be created using create_file (Claude's built-in file creation tool), not bash_tool (command line). If it was created with bash_tool, the artifact will not render interactively. Ask Claude: "Recreate the dashboard using create_file." Verify the file ends in .jsx.

**"The share button doesn't appear."**

Same cause as above. The dashboard needs to be created with create_file and written to the outputs directory. Ask Claude: "Recreate the dashboard using create_file to make it shareable."

**"The dashboard tabs feel sparse or lack depth."**

- Provide more input data. Richer input produces richer output.

- Specify "Full" mode when prompted (not Brief).

- If specific tabs are thin, ask Claude to "add analysis paragraphs to the [tab name] explaining what the data means."

- Every dashboard tab should have narrative paragraphs, not just data tables. If a tab has only a table, ask Claude to add the analysis.

- If the dashboard is significantly less detailed than the DOCX report, ask Claude to "match the dashboard depth to the report."

**"The branding doesn't look right."**

All dashboards use the Lilly brand palette from lilly-brand-assets. If colors look wrong, say "use Lilly branding colors." The key brand colors for dashboards: Dark header bar (#212121) with red rule (#E1251B), Georgia serif titles, Arial body text, Lilly Red for table headers and accents, Stone (#E4EBF1) for card backgrounds.

**"Dashboard data seems fabricated or scores seem off."**

- For supplier landscape reports: scores for vendors outside the respondent pool are inferred from public data and analyst reports. Confidence levels are labeled (High, Medium, Low).

- For category strategy: all data comes from your uploaded spend file. If numbers look wrong, check the input data first.

- If you suspect fabrication, ask Claude: "Show me the source for [specific data point]." All skills are required to cite sources and flag confidence levels.

| **08** | **Negotiation Personas** |
| --- | --- |

Before every contract review, the skill asks what tone to take. The persona changes how comments are worded and how the vendor response draft reads. It does not change the substance. Lilly's positions, Hard Stops, and required protections are the same regardless of persona.

| **Persona** | **When to Use** | **How It Sounds** |
| --- | --- | --- |
| **Standard** | Most contracts. Professional, factual. The default if you do not specify. | "Delete this provision. Lilly requires X per Section Y." |
| **Collaborative** | Long-term partnerships, strategic suppliers, renewals where the relationship matters. | "We'd suggest replacing this with language that works for both parties." |
| **Aggressive** | Suppliers with poor leverage, competitive recompetes, suppliers who were aggressive first. | "This is unacceptable and must be deleted. Non-negotiable." |
| **Curious** | Complex or unusual clauses you want to understand before countering. First-time suppliers. | "What's the intent behind this provision? Our standard approach is X." |
| **Astonished** | Resetting expectations when a supplier's position is far outside norms. | "We're surprised to see this. It's well outside industry standard." |

You can change persona between skills. Use Aggressive for the redline but Collaborative for negotiation prep if you want a harder opening document but a softer call strategy.

In the dashboard, every position card has a toggle to preview the same argument written in all five personas. This lets you pick the right tone for each specific issue without re-running the entire review.

| **09** | **Adding Your Category's Templates** |
| --- | --- |

The package ships with 20 templates covering the base Lilly MPT templates and category-specific templates: SaaS Agreement, On-Premise License, Professional Services Addendum, Hosting Addendum, Data Licensing Addendum, Digital Health Technology Addendum, Work Order Template, Change Order Template, Amendment Template, CDA (2-Way), Evaluation Agreement (POC), Digital Health Technology Evaluation License, AI Standard, Information Security Standard, Supplier Privacy Standard, MPT 5.1 Guide, General MPT Playbook (Excel), PO Terms and Conditions, Short Form Agreement, and Short Form License Agreement.

**To add your own category's templates: **Upload the template to a Claude conversation and say: "Update my contract review skill to include this template as a reference for reviews, then copy the updated skill to my skills library." The template is then available in every future review. Upload templates one at a time due to length constraints.

This is especially useful for non-IT procurement categories that use different standard agreements (lab services, chemicals, equipment, facilities, logistics, marketing). The skill works across all categories but performs best when it has the governing templates as reference.

| **10** | **Claude in Word: Application Modes** |
| --- | --- |

When using the Claude plugin in Microsoft Word, you control how changes get applied to the document. Three application modes are available:

**Apply All: **Fastest. Every tracked change and comment is applied at once. Use when you trust the playbook and want speed.

**Playbook Auto, Custom Confirm: **Best balance. Anything from a standard playbook position is applied automatically. For findings that require judgment (commercial analysis, vendor tactics, gap fills), the skill pauses and asks you to confirm before applying. You see a summary of what was auto-applied and a one-by-one walkthrough of just the custom items.

**Interactive (One-by-One): **Full control. Every proposed change is presented individually before anything touches the document. For each one, you can: Apply it as proposed, Revise it (tell the skill what to change), Discuss it (talk through the issue before deciding), Skip it, or See alternative tones (the same comment written in all 5 personas so you can pick the one that fits). At any point, you can say "apply all remaining" to switch to Apply All for the rest.

These modes only apply when you are in the Word plugin. In a standard Claude conversation, the skill produces the outputs for the selected mode: Redline Only produces the redlined DOCX; Full Review produces the redlined DOCX, review summary, 3-panel dashboard, and vendor response draft. You apply them yourself.

| **11** | **Common Mistakes to Avoid** |
| --- | --- |

These are the errors that generate the most support questions. Reading this section before your first use will save you time.

**Contract Review**

- **Uploading a SOW without the governing MSA. **The skill cannot verify protection coverage, cross-reference defined terms, or assess whether the MSA already covers an issue unless it can read the MSA. Always upload the parent agreement alongside the subordinate document.

- **Choosing "Full Review" on a 100+ page MSA. **Very large contracts will exhaust the context window before all three deliverables are complete. Choose "Redline Only" first, review the redline, then come back in a new conversation for the dashboard.

- **Sending the redline without stripping internal comments. **The skill produces three comment types: supplier-facing, internal-only, and SME escalation. Internal and SME comments contain strategy and positions that must not go to the supplier. Always strip them before sending. The comment-cleanup skill can help identify and remove them.

- **Not uploading the document. **Describing a contract verbally produces generic output. The skill's value comes from reading the actual language. Upload the document.

- **Expecting perfection on the first pass. **The redline is a draft. Review it, adjust positions where your institutional knowledge disagrees, and iterate. The second pass (after you provide feedback) is always better than the first.

**RFx Pipeline**

- **Skipping supplier-landscape and going straight to rfp-engine. **rfp-engine produces a better RFP when it has supplier research to work from. The landscape skill's capability matrix informs which requirements matter most and which sections to include.

- **Uploading supplier responses as one combined file. **The skill needs to distinguish which content belongs to which supplier. Organize as one file (or folder/zip) per vendor. Label clearly.

- **Not using Full mode for high-stakes evaluations. **Brief mode is for quick reads and initial screening. For evaluations that will drive a recommendation to leadership, use Full mode. The additional depth catches inconsistencies and nuances that Brief mode skips.

- **Ignoring the sensitivity analysis. **If the evaluation engine tells you the recommendation is fragile, pay attention. A fragile recommendation means a small change in weight allocation changes the winner. This is not a flaw. It means the decision needs more information, a BAFO round, or executive judgment.

**Category Strategy**

- **Uploading dirty data without reviewing it first. **The category strategy skill normalizes supplier names and classifies spend, but it cannot fix fundamental data quality issues (missing supplier names, negative values, duplicate rows with different formatting). Spend 5 minutes reviewing the file before uploading. If the data has known issues, tell Claude: "The SHARP extract has some parent-child mapping issues; prioritize the vendor names in column B over column D."

- **Expecting the Strategy tab to be complete without answering the five questions. **The skill asks about business priorities, savings targets, KPIs, constraints, and governance. If you skip these, the tab populates with data-derived defaults labeled as pending confirmation. The defaults are reasonable but generic. Your input makes the strategy specific and actionable.

- **Running MANAGE mode without a prior strategy deck. **MANAGE mode's value is the comparison: what changed since the last strategy. Without the prior deck, there is nothing to compare against. If you do not have a prior strategy, use DEVELOP mode.

**Executive Summaries**

- **Using the wrong deal value for FRAP. **If the contract has phased pricing, optional extensions, variable fees, or multiple cost components, the skill may pick a value that does not match your approval workflow's expectations. Review the deal value before the approval chain is calculated and correct it if needed.

- **Not uploading the parent agreement. **If a work order references an MSA, the skill writes a better narrative when it can read both documents. The MSA provides context (term, governing law, key protections) that the WO narrative should reference.

**General**

- **Trying to fix a fundamentally wrong output in the same conversation. **If the wrong skill triggered, the wrong document was analyzed, or the output is directionally wrong, start a new conversation. Iterating on a wrong foundation wastes tokens and produces worse results than starting fresh.

- **Not starting a new conversation after installation. **Skills installed in one session are not available until you start a new chat. This is normal Claude behavior.

- **Running all 26 skills simultaneously for simple tasks. **Context is finite. If you only need contract review, install only the contracting pipeline. The lighter the context load, the deeper the analysis.

| **12** | **Execution Guardrails** |
| --- | --- |

The skills enforce structural guardrails that prevent the most common failure mode: collapsing a multi-step analytical workflow into a single shallow pass that produces plausible-looking but thin output. You do not need to memorize these, but understanding them helps when you are reviewing output quality or troubleshooting.

**Suite-Wide Guardrails (G1-G10)**

These apply to all 26 skills. G1-G7 are the baseline; G8-G9 apply to every multi-pass skill; G10 applies to any skill that emits a large single-file artifact (interactive dashboards, self-contained HTML).

| **Guardrail** | **What It Prevents** |
| --- | --- |
| **G1: Tool Selection by Document Context** | Using the wrong document reading tool. Contracting pipeline documents must be read with full XML extraction (preserving tracked changes, comments, and authorship), not plain text extraction which strips that context. |
| **G2: Mandatory Gate Checks Between Phases** | Skipping analytical phases. Every multi-phase workflow must produce intermediate artifacts at phase boundaries. If an artifact from Phase 1 is missing, Phase 2 cannot start. |
| **G3: Existing Document Context Is Primary Input** | Ignoring tracked changes and comments already in the document. For negotiation documents, existing comments and changes must be responded to before adding new findings. |
| **G4: Cross-Reference Tracing for Defined Terms** | Making findings without citing specific contract definitions. A finding about data rights must trace to the governing definition of "Lilly Information" vs. "Usage Data" in the MSA, not just say "this raises data concerns." |
| **G5: Dashboard Data-Model-First** | Writing dashboard rendering code before the analysis is complete. The full data model must be assembled as a structured object before any tabs, charts, or tables are rendered. |
| **G6: Pre-Delivery Self-Test** | Delivering output with blank sections, missing citations, or generic analysis. Every skill runs its own delivery checklist before producing the final deliverable. |
| **G7: Research Minimums** | Presenting thin web research as complete. Skills with research phases must meet minimum search thresholds and label confidence levels on all externally sourced data. |

**Multi-Pass Guardrails (G8-G9)**

These apply to every skill with a multi-pass workflow (contract review, response analysis, category strategy, supplier landscape, evaluation). They enforce named pass artifacts and catch shallow collapse. Contract review's four-pass workflow is the canonical example.

| **Guardrail** | **What It Prevents** |
| --- | --- |
| **G8: Pass Artifact Enforcement** | Collapsing four analytical passes into one. Before starting Pass N+1, the named artifact from Pass N must exist (PASS_1_STRUCTURE, PASS_2_COVERAGE, PASS_3_ANALYSIS, PASS_4_PREP). If the skill is producing the final dashboard without having produced all four pass artifacts, the workflow was collapsed. |
| **G9: Anti-Collapse Signal** | Producing findings that look complete but are analytically shallow. Defines specific patterns that indicate collapse: a finding about renewal protection that did not check the governing MSA, a data/AI finding without a specific definition citation, risk scores calculated without the combined-protection-weighted formula, a dashboard missing the Obligations sub-tab or persona toggle. If any pattern is detected, the skill stops and re-runs the missing analysis. |

**Large-Artifact Guardrail (G10)**

This applies to any skill that emits a large single-file artifact (an interactive JSX/React dashboard, a self-contained HTML page, or any inlined file over ~150 lines).

| **Guardrail** | **What It Prevents** |
| --- | --- |
| **G10: Chunked Artifact Assembly** | Emitting a large single-file artifact in one write, which can exceed the response length limit and truncate the file mid-stream, especially late in a long session. Requires scaffolding the file first (imports, component shell, export), appending one section per write to the persisted outputs directory, and running a structural self-test (balanced braces and parentheses, no truncated trailing token, no em dashes, totals reconcile) before present_files. |

**When guardrails matter to you: **If a contract review output seems thin, ask Claude: "Did you complete all four passes?" or "Run all four passes." This triggers the guardrail enforcement explicitly. For other skills, if output seems shallow, ask: "Did you complete the gate checks?" or "Run the pre-delivery self-test." These are not magic words. They are reminders to the skill to enforce its own quality controls.

| **13** | **Troubleshooting** |
| --- | --- |

**Installation and Setup**

**"I installed the skills but they don't show up." **Start a new conversation. Skills installed in one session are not available until the next. This is normal Claude behavior, not a bug.

**"Claude asked too many questions before doing anything." **The skills are designed to ask 1-3 questions, once. If Claude is over-prompting, say "proceed with defaults" or "just do it." The skills will use sensible defaults and state their assumptions.

**"I don't know which skill to use." **Describe what you need in plain language. Claude matches your request to the right skill. If it picks the wrong one, say "use [skill-name] for this."

**"Logos are missing from DOCX outputs." **Confirm lilly-brand-assets is installed (it should be the first skill installed). All skills reference it for logo files. If it is missing, DOCX outputs generate without logos.

**"The colors don't match between outputs." **All skills use the Lilly-approved 16-color palette from lilly-brand-assets. If an output looks off-brand, say "use the Lilly brand colors from brand-colors.md."

**Contract Review**

**"The output looks generic or thin." **Provide more input: upload the actual documents, not just a description. Upload the governing MSA alongside the WO/SOW. Say "full review" when prompted for output selection.

**"The contract review missed obvious issues / scored too high or too low." **The v3.0 review runs a mandatory four-pass workflow with anti-collapse guardrails (G8-G9). If findings seem shallow, say "run all four passes" or "did you complete the definition tracing checklist?" The skill has structural guardrails that catch this, but explicit prompting helps on complex documents.

**"The contract is too large to review in one pass." **For very large contracts (80+ pages), choose "Redline Only" at the output prompt. Get the redline first, then come back in a new conversation for the dashboard. This splits the token consumption across two conversations.

**"Claude generated something that doesn't look like a Lilly document." **Say "apply Lilly branding" and specify whether you need a dashboard (JSX) or a document (DOCX). The branding standards are different for each format.

**RFx Pipeline**

**"The report is too short / lacks depth." **Provide more input: requirements documents, business cases, prior RFPs, or vendor proposals. Specify "Full" mode when prompted, not Brief.

**"Requirements don't match my Excel." **The skill reads your Excel programmatically. Ensure: rows 1-2 are headers, row 3+ are requirements, column 1 = requirement number, column 2 = criteria text, column 3 = score. Non-standard layouts may need manual column mapping. Tell Claude which columns contain what.

**"Missing sections in the DOCX." **Large reports (30+ pages, 4+ suppliers) may need multi-pass generation. If a section is missing, ask Claude to "add the [section name] section to the report."

**"Scores seem off / fabricated." **Landscape report scores for vendors other than the respondent are inferred from public data, analyst reports, and product capabilities. The skill flags confidence levels. Response analysis scores are extracted directly from the vendor's submitted matrix.

**"The decision deck storyboard doesn't match what I want." **The storyboard is designed to be iterated. Say "move slide 3 before slide 2," "add a slide on risk," or "the conclusion needs to be stronger." Do not iterate on the PPTX directly. Fix the storyboard first, then rebuild.

**Dashboards**

**"Dashboard has a React error or crashes." **Invalid CSS property names (mb, bg, fs instead of marginBottom, background, fontSize). Ask Claude: "Check all inline style objects for invalid CSS property names and fix them."

**"Dashboard didn't render / shows as code." **Dashboard was created with bash_tool instead of create_file. Ask Claude: "Recreate the dashboard using create_file."

**"Share button doesn't appear." **Same cause. Ask Claude: "Recreate the dashboard using create_file to make it shareable."

**"Dashboard tabs feel sparse." **Ask Claude to "add analysis paragraphs to the [tab name]" or "match the dashboard depth to the report." Every tab should have narrative, not just tables.

**General**

**"Claude ran out of context / hit its limit mid-task." **Start a new conversation and continue. For contract review, this often happens on large contracts. Break the work into redline-first, dashboard-second across two conversations.

**"The output has em dashes." **All skills are configured to avoid em dashes. If one appears, it is a generation artifact. Ask Claude to "remove all em dashes from the output and replace with hyphens or restructure."

**Tool and connector availability (graceful degradation).** Every skill states what it does when a tool or connector it would use is unavailable, so you always get a usable result:

- **No interactive widget (`visualize:show_widget` unavailable):** the skill falls back to a Markdown menu or table with the same options.
- **No dashboard rendering (`create_file` unavailable):** the skill delivers the analysis as a DOCX or in-chat structured output; the dashboard becomes "render this JSX when create_file is available."
- **No email/message compose (`message_compose` unavailable):** the skill emits a clearly labeled email or message DRAFT inline (or as a `.md`) for you to copy and send. Nothing is ever auto-sent.
- **No M365 connector:** connector-reading skills (process-navigator, theos-field-guide, voice-profile BUILD, meeting-prep-brief, supplier research) either run on pasted/uploaded input or label their answers "not Lilly-verified / connector unavailable" and continue.
- **Web search unavailable:** research phases label output "RESEARCH PENDING" per guardrail G7 rather than fabricating figures.

- **No widget buttons (`sendPrompt` unavailable):** type the command the button would have sent (each skill lists them), or use the equivalent picker the skill falls back to.
- **No pickers (`ask_user_input_v0` unavailable):** the skill asks the same question as plain chat text; you answer in your reply.
- **No code execution / document generation (DOCX, XLSX, PPTX):** the skill provides the complete structured content (tables, narrative, described formulas) so you can assemble the file manually, and names the step that needed code execution.

**Model selection.** claude.ai runs one model per conversation. Use Opus for the reasoning-heavy skills (category strategy, contract review, evaluation, negotiation, decision decks); you may switch to a faster model for bulk extraction or formatting, but switch back to Opus before any synthesis or judgment step.

**No-fabrication guarantee in degraded mode.** When a dependency is missing, skills ask for the missing input or label the gap (`NEEDS_INPUT` / "not Lilly-verified" / "RESEARCH PENDING"). They never silently guess a number, a policy answer, an approver, or a supplier fact (Global Rule 3).

| **14** | **What Changed in This Version** |
| --- | --- |

**v10.6.6 (June 2026) - ARIA enrichment layer + G10 chunked-artifact guardrail (cumulative on v10.6.4)**
- Added the optional ARIA enrichment layer (internal label v10.6.5-aria): 15 skills gained a suite-wide `ARIA ENRICHMENT (optional)` block covering internal footprint, public-company SEC financials, and spend forecast. Fully additive - a non-ARIA session behaves exactly as before, with one neutral fallback line where an enrichment would have appeared; no ARIA-sourced figure is ever fabricated.
- Added guardrail G10 (Chunked Artifact Assembly) to the shared foundation and the guardrail summary table; every G1-G9 guardrail-range citation across the suite was bumped to G1-G10 (the G8-G9 multi-pass-specific citations were left unchanged).
- Added an inline build-step reminder to the 9 skills that emit a large single-file artifact (category-strategy, lilly-contract-review, evaluation-engine, rfp-response-analysis, supplier-landscape, supplier-deep-dive, pro-forma-builder, procurement-launcher, theos-field-guide).
- No change to any skill's analytical logic, workflow, data model, or branding. Suite version stamp advanced to v10.6.6.

**v10.6.4 (June 2026) - release-readiness hardening (cumulative on v10.6.3)**
- Made the shared user-manual and teach pointers bundle-agnostic (inlined section vs companion file); uniform machine-readable `Suite:` frontmatter stamp on all 26 skills.
- Field Guide examples genericized to a neutral persona; corrected rfp-engine and rfp-case-manager case-handoff language (the case manager initializes/adapts, it does not provision Teams/SharePoint).
- Contract-review output modes reconciled (default Redline Only; Full Review adds dashboard, summary, vendor draft) and Step-5 aligned to the emission matrix with a dedicated Dashboard step.
- Decision Deck split into its own pipeline; Daily Command Center marked private; binary-asset upload made fallback-only; conservative M365/rollback wording; category-strategy quick-mode tier; illustrative vendor names neutralized.
- Suite version stamp advanced to v10.6.4.

**v10.6.3 (June 2026) - suite-wide consistency and foundation hardening**

Correctness and consistency pass across the suite. No new skills, no behavioral redesign; the skill count stays 26 across seven pipelines. Highlights for the shared foundation (lilly-brand-assets):

- Foundation made fully self-contained: the SME routing matrix (sme-matrix) and the risk-scoring method (risk-scoring, including the G9 combined-protection-weighted formula) are now inlined here, and every "read references/X" pointer resolves to an inlined section in this single file.
- Color canon settled: the canonical green-free status palette is owned here (seven distinct, uniquely-named, non-green hexes); the retired GRN-equals-Bold-Blue duplicate alias is removed; the chart palette is corrected to exactly six distinct colors; and decision-deck's Slide Template sage/teal is stated as the one documented exception to the no-green rule.
- One canonical evaluation scale documented (0.0-5.0, five-tier requirements mapping) in the inlined scoring-scales reference.
- Guardrail scope clarified: G1-G10 are suite-wide; G8-G9 apply to every multi-pass skill, not lilly-contract-review alone.
- Consistency fixes: seven pipelines (was "five"); "other 25 skills" wording; version stamps aligned to v10.6.3; FRAP expanded correctly (Financial Risk Assessment Process); legacy logo assets documented as non-canonical.
- Every SKILL.md carries a machine-readable `Suite: v10.6.3` stamp.

**v10.6.1 (June 2026) - Theo's Field Guide 🦖 v2.1 enhancement wave**

Eight new features added to Theo's Field Guide. The data model (Issues, Tasks, evidence, hashtag protocol), inference rules, widget dashboard, and migration logic from v2.0 are all preserved. Other skills unchanged. Skill count unchanged (26).

**Four new modes** (selectable from the Step 0 mode picker, or fired by natural-language triggers):

1. **End-of-day mode.** Counterpart to the morning Daily Run. Five-minute close-out ritual at the end of your workday. Three sections instead of five: "Completed today" (celebrates progress), "Stale and untouched" (gentle prompt for what to do - snooze, recommit, or accept it isn't happening), and "First thing tomorrow" (the single Issue most worth grabbing in the morning). Optional micro-actions per section: one-tap "celebrate" log entry for completed work, one-tap snooze-to-Monday for stale items, one-tap calendar-block draft for tomorrow's first hour. Triggers: "end of day", "close out today", "wrap up today", "EOD field guide".

2. **Weekly review mode.** Designed as a 15-minute Sunday-evening or Monday-morning ritual. Walks all Issues active during the week and surfaces what drifted. Groups into four buckets: "Moved this week" (read-only good news), "Quiet but should be moving" (the danger zone), "Waiting but worth checking" (decide whether to nudge), and "Newly created this week" (confirm they're well-defined). Per-Issue picker walkthrough for the quiet and waiting buckets with five options: Keep on track / Snooze 1 week / Move to blocked / Mark complete or cancelled / Reassign to someone else / Skip. Summary saves to history so week-over-week patterns surface over time. Triggers: "weekly review", "sunday review", "what fell off this week".

3. **"Now what?" suggestion engine.** Single-output workflow. Not a dashboard. Given current Field Guide state and your next free calendar block, returns ONE suggestion with reasoning: which Issue, why, estimated effort, three buttons (Open this Issue / Show me another option / Not now). Up to 3 alternatives if you keep asking. Ranking is deterministic: due-soonest with high priority, then waiting-on-you that's been stale, then quick-win-eligible, then recent counterparty activity, then today's commitments. The point is to bypass decision fatigue when you have a free hour and don't want to scan the dashboard to figure out what to do. Triggers: "what should I do next", "now what", "best next action", "what's the highest-leverage thing right now".

4. **Quick capture mode.** Minimal-friction Issue creation. You describe the thing in one message - "I just heard about a vendor migration for the Adobe ELA renewal that's going to start next quarter, capture this." The skill parses the message, infers title / project tag / priority / owner, and presents a one-pass confirmation picker. Defaults everything else (state=open, tasks empty, evidence empty, due=null). On confirmation, the Issue is saved and you're returned to whatever you were doing. Designed for the failure mode "I'll remember to track that" - captured in 15 seconds, no ceremony. Triggers: "quick capture", "remember this", "capture this", "make this an Issue".

**Four new features** (extend existing capabilities, no new mode needed):

5. **OOO-aware inference.** Added as a Tier-M (medium-confidence) signal in the inference rules. When an automatic-reply email is received from a person who is the `owner` on any Issue in `waiting` state, the skill parses the OOO date and annotates the Issue with `ooo_until: <date>`. Dashboard renders an "OOO until [date]" badge next to those Issues; the "Waiting On" section sub-groups them under "Waiting on people who are out." Does not change Issue state, just adds context so you stop wondering why Bob hasn't replied. Annotation auto-clears after the OOO date passes.

6. **Cross-Issue relationship view.** New on-demand action triggered by "show me all issues involving [supplier/project/entity]" / "what are all my SaaS platform renewal related issues" / similar. Surfaces every Issue whose title, project tag, owner, or evidence references match the entity. Output is a compact list grouped by state with last-activity ordering. Useful for vendor-relationship reviews, category-strategy moments, and "wait, how many Issues involve this supplier?" reality checks.

7. **Email-to-Issue paste.** New on-demand action triggered by "turn this email into an Issue" / "capture this email as an Issue" / similar. User pastes an email body (or quotes one). Skill creates an Issue with the email's body summary as `title`, infers `project` and `owner` from content, attaches the email as the first evidence entry, and surfaces the new Issue for the user to refine via inline pickers. Faster than the full Quick Capture flow when the source IS an email.

8. **Owner-handoff drafter.** New on-demand action triggered when reassigning an Issue's owner. Skill calls voice-profile to draft a handoff message to the new owner in the user's voice. Register matches "handoff" (warm-but-clear, lists what's been done and what's open). Draft references the Issue's context, summarizes current state, lists open Tasks. User reviews and sends per S4 (no auto-send).

**What's unchanged:**

- All v2.0 data model, dashboard, inference, hashtag protocol, migration logic
- All other 25 skills in the suite (no edits)
- procurement-launcher v2.5 → v2.6 (description updated to reflect new triggers; structural launcher unchanged)

**Why these were added.** Pilot feedback on the v10.6.0 baseline was that the Field Guide was helpful but the work-management loop was still missing key rituals - closing the day cleanly, catching what fell off during the week, and bypassing decision fatigue when free time appeared. The 8 v2.1 additions target those gaps directly, framed as low-friction work-management primitives: small rituals at predictable cadences, minimal-friction capture, single-output suggestions that bypass overwhelm, contextual signals (OOO) so you stop guessing.

**See also:** detailed walkthroughs of each new mode in Section 03 (Theo's Field Guide chapter). The roadmap for Tier 3 enhancements (recurring Issue templates, habit tracking, cross-Issue analytics, etc.) is tracked separately, outside this package.

---

**v10.6.0 (June 2026) - Theo's Field Guide 🦖**

This release introduces the biggest conceptual change since the suite began: the personal command center now thinks in **work** instead of in **email**.

**The headline change.** `daily-digest` is replaced by **Theo's Field Guide 🦖** (`theos-field-guide`). Same role in your daily workflow, fundamentally different abstraction:

- **Old (daily-digest):** flat list of inbox items organized by category (Direct Asks, Approvals, Signatures, etc.). You scrolled through emails grouped by type.
- **New (Field Guide):** Issues with Tasks, owner, state, evidence. You see "SaaS Platform Renewal Negotiation" as one Issue with 6 Tasks and 43 attached emails - not 43 separate emails.

If you have been thinking "this skill is helpful but not quite what I want," this change is for you. **You think in Issues. The Field Guide thinks in Issues.**

**What stays the same:** every action you had in daily-digest (Draft Reply, Status Update, Snooze, Mark Closed). The composition flow that chains process-navigator + timeline-builder + voice-profile for status updates. The M365 connector reach. The Project knowledge persistence pattern. The Two-Project pattern (Daily Command Center + per-RFx Projects). Migration handles the conversion automatically on first install - your daily-digest state file is backed up and translated.

**What's new in the Field Guide:**

1. **Issues as first-class objects.** Each Issue has: title, state (open / active / waiting / blocked / complete / cancelled), owner, project tag, priority, due date, created date, last activity, child Tasks, and attached evidence (emails, Teams chats, calendar events, SharePoint files).

2. **Tasks within Issues.** Two-level tree (Issue → Task; no nested Issues). Each Task has its own state and owner. State rolls up: the Issue stays whatever you set it to; "Tasks: 3 open, 2 complete" shows actual progress as a badge.

3. **Username-namespaced IDs.** Your Issues are `lee_jordan/001`, `lee_jordan/002`, etc. Globally unique across Lilly because the username prefix differs per user. This matters for the hashtag protocol (next item).

4. **Optional hashtag protocol.** When you have `hashtag_generation` turned on (it's off by default), Claude appends a one-line metadata block to drafts: `#status=waiting #owner=@lee_jordan #project=SaaSRenewal #issue=lee_jordan/001 #due=2026-08-15`. Six tags maximum, one line, at the bottom. **You do not memorize these.** Claude proposes them based on the draft context; you glance and edit before sending. When other recipients reply with hashtags (including their own Field Guide-emitted blocks), your Field Guide reads them and updates state.

5. **Inference with confidence tiers** (when hashtags are absent - which is most of the time at first). The Field Guide infers state from:
   - **High-confidence machine signals (auto-update, no prompt):** Ariba "Approved", Adobe Sign / DocuSign / Ironclad "Signed", LEAH at @contractpod.com "Executed", calendar RSVPs, user-replied-to-thread detection.
   - **Medium-confidence textual signals (auto-update with "✓ inferred - tap to revert" badge):** closure phrases like "this is done", "all set", "no further action", "completed".
   - **Low-confidence candidates (surface for user confirmation):** cross-thread Issue clustering, owner-change suggestions, long-staleness closure proposals.

6. **Inline HTML widget dashboard.** Same pattern as the THEO launcher v2.4 - master-detail layout with sections on the left, sticky info panel on the right. Real clickable buttons via `sendPrompt()` for actions (no follow-up pickers; click "Draft Reply" and it fires). Five fixed sections: Action Needed / Waiting On / Today-Tomorrow / Stale / Snoozed.

7. **Stale-review walkthrough.** New one-tap action in the Stale section. Click `[ Review stale ▸ ]`. The Field Guide first runs inference one more time and drops any items that resolved themselves. Then walks you through what's left, one Issue at a time, with five options: Keep open / Mark complete / Mark cancelled / Snooze 30 days / Skip. Typical run takes under 60 seconds for 3-5 stale items.

8. **Promote to Issue.** Ungrouped items (one-off approvals, signature requests, RSVPs that aren't tied to a long-running thing) live in an `ungrouped[]` array at the top level. You can promote any of them to an Issue at any time. "Promote PR-12345 to Issue" turns that approval request into an Issue you can attach more evidence to.

**Drafting changes - voice-profile and rfp-case-manager:**

- **voice-profile v1.1**: when `hashtag_generation` is on, the DRAFT mode adds a fourth composition layer (after voice + discipline + register) that appends the hashtag block. Values auto-derived from the draft context - recipient, intent, matched Issue, deadline mentioned in body. Nothing else about voice-profile changes.

- **rfp-case-manager v2.1**: Schedule workflow meeting-invite drafts and Status workflow situational-summary outputs get the same conditional hashtag block when the flag is on. Case file structure and the v2.0 intent-driven workflow design are unchanged.

**Workflow-map and meeting-prep-brief get small additions:**

- **workflow-map v1.1**: optional `issue_id` parameter. When provided, the workflow diagram scopes to that specific Field Guide Issue - phases come from the Issue's existing Tasks, the checklist owners come from each Task's owner. Without `issue_id`, the generic procurement phase model still applies as it did in v1.0.

- **meeting-prep-brief v1.1**: the "What's Open" section of the brief now includes a "Related Issues" subsection when Field Guide Issues match the meeting's counterparty or topic. Up to five matching Issues, ranked by last activity. Skipped silently when no matches.

**Launcher (THEO) v2.5:** Section 7 (Personal Command Center) Daily Digest row renamed to "🦖 Theo's Field Guide" with updated description and trigger phrase "open my field guide". Legacy "daily digest" trigger phrase preserved as alias so habit does not break.

**Migration:** the first time you run Theo's Field Guide in a Project that has a legacy `daily_digest_state.json`, the skill:
1. Backs up the original to `daily_digest_state.json.backup`
2. Reads your username from the `user.email` field
3. Translates: each `project` becomes an Issue with a `<username>/<NNN>` ID; entries with a `project_key` become evidence under those Issues; standalone entries go to `ungrouped[]`; history and run-log carry over
4. Saves as `field_guide_state.json`
5. Shows you a summary: "Migrated N projects → Issues, M entries → evidence, K entries → ungrouped"
6. Waits for your confirmation before running its first full pass on the new data

If you want to revert at any point: the backup is right there. Restore it, then contact the package owner or your workspace administrator for the prior approved Field Guide version; you are back where you started.

**Why all this matters (the "mostly okay" problem).** Earlier versions of the personal command center organized around HOW work arrives. The user thinks in WHAT the work is. That impedance mismatch was the source of the "this is helpful but not quite right" feeling. The Field Guide closes that gap.

**One honest caveat.** The Field Guide is most powerful once it has a few weeks of usage history and a handful of Issues created. On day one you start with whatever migrated from daily-digest plus what you create as you go. The system gets sharper over the first month as inference accumulates evidence and your tagging habits develop.

**See also:** Field Guide chapter and dedicated walkthrough in Section 03 (within the Personal Command Center skill section). Hashtag protocol explained in Section 11. Stale-review walkthrough described in Section 13 (Troubleshooting → "When something falls off my radar").

---

**v10.0 (May 2026)**

- Added the **THEO launcher** (procurement-launcher): a light, chat-only front door that routes you to the right skill. Includes a **three-tier adaptive coaching system** ("Teach Me") that guides new users through their first skill, helps intermediate users connect skills into pipeline workflows, and gives experienced users access to advanced orchestration patterns and v10.0 changes. Built on progressive disclosure, scaffolding, and cognitive load management principles.

- Added three skills: **negotiation-simulator** (roleplay practice, now v2.0 with three simulation modes: Practice, Observe, and Drill; 8 scenario templates; structured counterparty profiling; turn-by-turn feedback with retry; progressive difficulty; structured debrief metrics), **pro-forma-builder** (financial model), and **should-cost-builder** (bottoms-up cost). Added a **finalize-for-execution** mode to comment-cleanup.

- Added shared references used across the suite: narrative standards, a validation checklist, named house styles, and a lite supplier-risk framework (with hard anti-fabrication rules: a debarment/sanctions/breach status is never asserted without a cited source).

- Execution guardrails clarified as suite-wide (G1-G10); enumerable questions are now always tappable pickers; a stop-and-wait rule covers source-document election; dashboards carry a subtle top-right Lilly mark.

- Suite-wide consistency cleanup (single-sourced shared block and design system) and removal of the Tech@Lilly label so the suite reads as category-neutral procurement. Packaged as a single drop-in install zip.

**v9.2 (May 2026)**

- User manual expanded with full RFx pipeline walkthroughs (Scenarios 10-15), end-to-end pipeline examples, common mistakes section, execution guardrail reference, and changelog.

- Executive summary section expanded with scenario variations (amendment chains, ambiguous deal values, FRAP overrides, non-standard categories).

- Decision deck section expanded with full walkthrough of the storyboard iteration workflow.

- Guardrail numbering clarified: G1-G10 are suite-wide. G1-G7 are the baseline that applies to all skills; G8-G9 (pass-artifact enforcement and the anti-collapse signal) apply to every multi-pass skill (lilly-contract-review, rfp-response-analysis, category-strategy, supplier-landscape, and any other skill that runs a multi-pass workflow), not to lilly-contract-review alone.

**v9.1 (May 2026)**

- Decision deck rebuilt as v2: story-first workflow, reads any combination of inputs, no longer requires evaluation report as input.

- lilly-contract-review v3.0: eliminated Mode A/B/C as analytical frameworks, single unified workflow with three-layer analysis for all document types, 3-panel dashboard, mandatory pass artifacts with gate checks (G8-G9).

- Added rfp-case-manager for operational coordination of in-flight RFPs.

- Category strategy: added multi-category analysis with dropdown switching.

- Market rate benchmarking: added RATIONALIZATION mode.

- Added DEVELOP vs. MANAGE mode documentation for category strategy.

- Dashboard troubleshooting section added.

**v8.x and earlier**

- Original skill suite covering contracting pipeline, RFx pipeline, spend intelligence, and executive summary.

- Contract review used Mode A/B/C analytical framework (replaced in v9.1).

- Decision deck v1 required evaluation report as input (replaced in v9.1).

| **15** | **Glossary** |
| --- | --- |

| **Term** | **Meaning** |
| --- | --- |
| **MPT** | Master Procurement Terms. Lilly's standard contract playbook. |
| **Hard Stop** | Non-negotiable position. Lilly walks if not resolved. |
| **TFC** | Termination for Convenience. Lilly's right to exit without cause. |
| **DPA** | Data Processing Agreement / Addendum. |
| **NTE** | Not to Exceed. Maximum contract value. |
| **BAFO** | Best and Final Offer. |
| **SME** | Subject Matter Expert (Legal, InfoSec, Privacy, etc.). |
| **FRAP** | Financial Risk Assessment Process. Lilly's threshold framework that determines the approval chain based on deal value. |
| **ATC** | Approval to Contract. Executive summary for contract approvals. |
| **ATS** | Approval to Spend. Executive summary for spending approvals. |
| **Review approach** | Contract review adapts to the document: full redline (supplier paper), verification (Lilly paper / amendments / SOWs), or commercial assessment (order forms). The older Mode A/B/C labels were retired in v3.0/v9.1; the output (Redline Only / Full Review / Dashboard Only / Briefing Only) is chosen separately. |
| **JSX** | React component file. The format used for interactive dashboards. |
| **SHARP** | Lilly's spend reporting system. |
| **Kraljic** | A supplier positioning matrix (profit impact vs. supply risk). |
| **TCO** | Total Cost of Ownership. Full lifecycle cost including implementation, maintenance, and exit. |
| **P10/P25/P50/P75/P90** | Percentile markers for rate benchmarking. P50 = median market rate. |
| **SBE/WBE** | Small Business Enterprise / Women's Business Enterprise. Diversity classifications. |
| **Porter's Five Forces** | Market analysis framework: supplier power, buyer power, threat of substitutes, threat of new entrants, competitive rivalry. |
| **Gate Check** | A mandatory verification that all intermediate artifacts from a prior phase exist before the next phase begins. Part of the execution guardrail framework (G2). |
| **Pass Artifact** | A named intermediate output from one of the four contract review passes (PASS_1_STRUCTURE, PASS_2_COVERAGE, PASS_3_ANALYSIS, PASS_4_PREP). Enforced by guardrail G8. |
| **Sensitivity Analysis** | A test that checks whether shifting evaluation weights by 5 points changes the supplier ranking. Used by evaluation-engine to determine if a recommendation is robust or fragile. |

Company Confidential  (c) 2026 Eli Lilly and Company  |  Page