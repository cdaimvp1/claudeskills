# Review Summary Report - Document Design Specification

## Design Principle

The review summary report is the primary internal strategy document a procurement rep reads before acting on a contract review. It must be designed like a marketing piece: magazine-quality layout with visual hierarchy, table-based design elements, and professional typographic treatment. It should feel like it belongs in the same visual family as the supplier landscape report, the RFP response analysis report, and the evaluation report from the RFx pipeline.

**The review summary is now produced as a `.docx` file** (not `.md`). Use the `docx` skill. Filename: `[Supplier]_Review_Summary_v[N].docx`.

---

## DOCX Design (Marketing-Piece Style)

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Lilly Red | #E1251B | Title page accent bar, table header rows, HIGH RISK cell backgrounds (light tint #FDE8E5) |
| Charcoal | #212121 | All body text (NOT #000000 per Lilly brand rules) |
| Bold Blue | #0F3A85 | Section header text, LOW RISK cell backgrounds (light tint Neutral Sky #D4E5F7), SME escalation badges, cross-reference links |
| Amber | #B45309 | MEDIUM RISK cell backgrounds (light tint #FFF0D8) |
| Stone | #E4EBF1 | Callout box backgrounds, label column in profile tables, Protection Gap cell backgrounds |
| Dark Red | #521207 | Title page header bar background |

### Typography

Calibri throughout:
- **Body:** 10.5-11pt, Charcoal (#212121), 1.15 line spacing
- **H1 (section titles):** 14pt, Bold Blue (#0F3A85), bold
- **H2 (subsection titles):** 12pt, Charcoal (#212121), bold
- **H3 (finding titles):** 11pt, Charcoal (#212121), bold
- **Footnotes / secondary text:** 9pt, gray (#666666)
- **KPI large numbers:** 28-32pt, Lilly Red (#E1251B) or Bold Blue (#0F3A85) depending on context

### Layout Techniques

**Section number badges:** Use 1x2 table cells as visual section dividers. Left cell: large section number (01, 02, 03...) in 28pt bold, Lilly Red on white. Right cell: section title in H1 style. No visible borders; use light bottom border only.

**KPI highlight cards:** Use a 1x4 table row immediately after the title page. Each cell contains:
- Large number (28pt, bold, colored by context)
- Label below (9pt, gray)

The four KPI cards for a contract review summary are:
1. **Protection Score** - [N]/100 (higher = better protected), colored red (<50), amber (50-74), Bold Blue #0F3A85 (75+)
2. **Hard Stops** - count, always Lilly Red
3. **Total Findings** - count with tier breakdown in label (e.g., "4 High / 6 Med / 3 Low")
4. **Negotiation Rounds** - estimated count, colored by complexity

**Risk heatmap table:** Rendered as a proper formatted table, NOT emoji characters. Use cell background shading:
- High Risk: #FDE8E5 (light red) with bold red text
- Medium Risk: #FFF0D8 (light amber) with bold amber text
- Low Risk: #D4E5F7 (Neutral Sky, light blue) with bold Bold Blue (#0F3A85) text
- N/A: #E4EBF1 (light gray) with gray text

Header row uses Lilly Red (#E1251B) background with white text. Left column (category names) uses Stone (#E4EBF1) background.

**Finding cards:** Each finding in the Findings by Risk Tier section is rendered as a 1-column bordered table cell:
- Left border: 4pt colored stripe matching tier (red / amber / Bold Blue #0F3A85 / gray)
- Finding number and topic in bold as first line
- One-line description and recommended action below
- Cross-reference to redlined document comment number in small italic

**Negotiation strategy section:** Two-column table layout:
- Left column: Must-Haves and Should-Haves (the positions to fight for)
- Right column: Nice-to-Haves and Potential Compromises (the trading chips)
- Each position is a compact card within its column cell

**Callout boxes:** 1x1 bordered/shaded table cells (Stone background, thin gray border) for:
- Executive elevator pitch (top of document, after KPI cards)
- Supplier context profile
- Key warnings or blocking issues

**Lilly logo:** Include on the title page using a bundled transparent Lilly logo from the shared `/mnt/skills/user/lilly-brand-assets-1c344a/assets/logos/` directory (for example `Lilly-Script-Black-RGB.png`). No external skill is required; the PNG backgrounds are transparent, so use a Black or Red variant on light pages, White on dark; backgrounds are transparent. Logotype on page 1, top-left or centered above the title bar.

### Formatting Rules

- No excessive whitespace; consistent spacing (3-4pt after paragraphs)
- Page breaks between major sections only (before each section number badge)
- No orphaned headings (heading must have at least 2 lines of content below on same page)
- Tight table cell padding (0.05" vertical, 0.08" horizontal)
- Tables span full page width
- Footer: "Eli Lilly and Company - Confidential - Internal Use Only" left, page number right
- Header (pages 2+): "[Supplier Name] - Contract Review Summary" right-aligned, italic, gray

---

## Document Structure with Design Mapping

### Title Page
- Dark Red (#521207) header bar across top
- Lilly logo centered
- Document title: "CONTRACT REVIEW SUMMARY" in 20pt bold
- Supplier name, contract type, review approach, output, date, preparer as a clean metadata table (Stone background)
- "CONFIDENTIAL - LILLY INTERNAL USE ONLY" in small caps at bottom

### KPI Card Row (page 1, below title)
4 KPI cards as described above: Protection Score, Hard Stops, Total Findings, Negotiation Rounds

### Executive Elevator Pitch (callout box)
3-sentence summary in a Stone-background callout box. This is the "can we sign this?" answer.

### Section 01: Supplier Context & Document Statistics
- Section number badge (01)
- Supplier context as a narrative paragraph (not key-value pairs)
- Party map as a compact 2-column table
- Document statistics as a 2x4 KPI grid (existing changes, comments, review actions, gaps)
- Overall Protection, Execution Recommendation, Negotiation Complexity, Redline Tone as a horizontal badge row

### Section 02: Risk Heatmap
- Section number badge (02)
- Full 12-category risk heatmap as a formatted table with cell shading (per palette above)
- For multi-supplier mode: cross-supplier heatmap with supplier names as column headers

### Section 03: Findings by Risk Tier
- Section number badge (03)
- Subsections for each tier: HIGH RISK, MEDIUM RISK, LOW RISK, PROTECTION GAPS
- Each finding rendered as a finding card (colored left-border table cell)
- Findings sorted within tier by financial exposure (highest first)

### Section 04: Commercial Analysis (conditional)
- Section number badge (04) - only present when pricing/commercial terms exist
- Proposed value, market benchmark, value at risk as KPI cards
- Full commercial analysis narrative
- Counter-proposal summary table (when commercial terms are present)

### Section 05: SME Escalation Routing
- Section number badge (05)
- Table with columns: SME Name, Email, Topic, Finding #, Urgency
- Bold Blue (#0F3A85) row highlighting for urgent pre-engagement items

### Section 06: Negotiation Strategy
- Section number badge (06)
- Two-column layout as described above (fight-for vs. trade-away)
- Concession sequencing as a numbered timeline
- BATNA / escalation path in a callout box

### Section 07: Recommended Next Steps
- Section number badge (07)
- Numbered action items with owners and deadlines where known
- Supplier transmission reminder (strip internal comments) in a warning callout box (light red background)

### Deliverables List (final element)
- Clean table listing all produced files with filenames and one-line descriptions

---

## Anti-Patterns (Explicitly Prohibited)

1. **No monospace code blocks.** The review summary is not a terminal output. Unicode box-drawing characters (═, ━, ─, ┌, └, etc.) must NOT appear in the DOCX. Use proper table formatting instead.

2. **No emoji as visual indicators.** Do not use 🔴, 🟡, 🟢, ⬜, 🟣, 🔵 in the DOCX. Use colored cell backgrounds, colored text, or colored left-border stripes to indicate risk tiers. Emoji are acceptable only in the chat-displayed summary if the user is not receiving the DOCX.

3. **No key-value dump headers.** The opening metadata (supplier, contract type, mode, date) should be a designed title page, not a flat text block with colons.

4. **No flat text lists for findings.** Each finding gets a finding card (bordered table cell with colored stripe), not a bullet point with dashes.

5. **No orphaned tables.** Every table must have a preceding explanatory sentence or paragraph. No table appears without narrative context.

6. **No generic "professional formatting."** This document has a specific design system. Vague instructions like "use headers and tables" are not sufficient - follow the color palette, typography, layout techniques, and structural template above.

---

## Compatibility Note

When the review is performed through the Claude Word plugin (application modes), the summary report is still produced as a separate `.docx` file alongside the in-document edits. The design spec applies to the standalone summary document, not to tracked changes or comments applied within the original contract.

---