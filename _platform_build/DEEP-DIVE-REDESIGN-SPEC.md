# Supplier Deep Dive — Redesign Spec (Marc, 2026-07-23) — LOCKED

Source: Marc's direct feedback on the Snowflake deep dive. These are contracts, not
suggestions. The Gartner/Bloomberg/Dun & Bradstreet research AUGMENTS the Market &
Financials + Risk sections; it does NOT override the structure below.

Quality bar: a professional Gartner / Bloomberg / Dun & Bradstreet company profile,
market & financial page, and risk assessment. Current state is "terrible / looks
nothing like" those. Research those real products and build to that standard.

File: `_platform_build/assets/pv/pv-07-landscape-render.js`  ·  rebuild: `python build_dashboard.py`

---

## 0. Tab order — REVERT (my mistake)
- I reordered + renamed the deep-dive inner tabs. The original order was INTENTIONAL.
- Restore to, left-to-right, default = first:
  **Profile → Market & Financials → Strengths & Risks → Lilly Fit → Requirements Fit**
- Code: `PVSL_DDT` default `'profile'`; tab array order `profile, solfin, strisk, lilly, reqs`.
- The verdict header + other non-order additions "can stay."

## 1. Profile tab
### 1a. Identity & Company — reorganize into logical sub-categories (order is currently random)
- **Corporate identity** sub-category (TOP):
  - Legal entity **first**
  - Corporate address AND Footprint as **TWO separate** points (not one "HQ & Footprint")
  - Founded
  - Leadership
  - **Headcount** — ADD (currently missing)
- **Financial Position** sub-category (its OWN block, below identity):
  - **Ticker → "NYSE: SNOW"** (currently just "SNOW"/crammed; stop duplicating it in a prose field)
  - Revenue
  - Profitability ("not yet GAAP-profitable")
  - Funding raised
  - ESG
  - (un-cram the single "financial position" field into these discrete rows)
### 1b. Profile layout
- **Offering Profile** on the LEFT.
- Separate panel on the RIGHT: **Market Presence & History**, with **Roadmap & Vision** stacked BELOW it.
  - NOTE: supersedes the earlier "Offering + Roadmap side-by-side (LOCKED)" note at ~line 1787 — Marc's new explicit call.

## 2. Market & Financials tab
- De-bubble: the boxed stat tiles ("$1.39B / Latest revenue", "+33% / Growth",
  "$93.2B / Valuation", "Not yet GAAP-profitable / Profit") look "really fucking stupid."
- Keep the **revenue-history panel** (it's the one good thing).
- Rebuild the rest to a **Bloomberg / D&B financial-page** standard (research-driven):
  clean financial summary table, key stats, hierarchy of headline vs detail — not cards.

## 3. Strengths & Risks tab
- I changed NOTHING here. Needs the same care — a **D&B-style risk assessment** treatment
  (research-driven: real risk scores/dimensions, what drives them, layout).

## 4. Lilly Fit tab
- I changed NOTHING here. Needs redesign too.
- Candidate home for the **Open Questions** panel (see §5).

## 5. Requirements Fit tab
- Reconsider the **met / partial / gap** summary block — how much does it add on top of the
  Requirements **heatmap** panel + its contents? (Likely redundant; trim or fold in.)
- **Open Questions to confirm** panel is **misplaced here** — move to Lilly Fit or rework.
- **Request more data** panel — REMOVE from the dashboard entirely.
  - Rationale: outreach-email drafting is a **related-skill capability**, not a dashboard
    panel. The supplier-landscape skill (or its companion) offers "draft outreach emails
    to these suppliers"; responses flow back via M365 to re-enrich. That belongs in the
    skill's action layer, not rendered on the deep-dive page.
  - Code: drop `pvRequestDataCard` call (~line 1941) + the function (~1693). **[DONE, verified 2026-07-29]** Neither the call nor the function exists any longer; zero occurrences in any code file.

---

## Build discipline
- Research FIRST (Gartner/Bloomberg/D&B), then build to spec + research. No guessing.
- One coherent verified pass. Grounded data only (no fabrication); label any gap state.
- Rebuild + smoke + zero-external-refs, then open for Marc. Landscape rollout stays gated
  on his sign-off.
