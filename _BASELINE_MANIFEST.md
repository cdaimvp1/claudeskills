# Baseline manifest - v10.6.6 bundle, seeded 2026-07-21

Source: Lilly_Procurement_Skills_v10_6_6_Bundle_ARIA_G10.zip
Purpose: byte-for-byte baseline to diff against before any split/move is considered complete.
Rule: dashboard/analytical/pass-gate content that moves into a companion file must be
byte-identical to its baseline block, verified by diff, never rewritten during a move.

## Stage 2 change log (lilly-brand-assets split)

`lilly-brand-assets-1c344a/SKILL.md` was split: the inlined user manual (1467 lines,
baseline lines 1217-2683) was extracted verbatim to `references/user-manual.md` and
verified byte-identical by diff before the original was removed. The duplicated inlined
ARIA enrichment block (97 lines, already shipping separately as
`references/aria-enrichment.md` per the ARIA changelog) was verified byte-identical to
its existing companion, then the duplicate inline copy was removed. Both removals were
replaced with a pointer sentence, not silently dropped. No other content in this file
changed except the "References" section header/framing and the manual-generation
instructions, updated to say the manual and ARIA spec load as companions rather than
being inlined (they no longer are). Post-split SKILL.md: see updated row below;
row below reflects the ORIGINAL pre-split baseline for hash-verification purposes.

| Skill folder | SKILL.md SHA256 | SKILL.md size (bytes) | Companion files |
|---|---|---|---|
| category-strategy-1c344a | D7D235A2D1E2A019F1D8D8CF6D728EA106379727D1DCC1D54FFF504237C6988B | 212283 | 0 |
| comment-cleanup-1c344a | 67CAD1E7380BF226132BB0E36F65F93045ECFAF8E940CD3D11FB24C747F3E47F | 36573 | 0 |
| commercial-negotiation-prep-1c344a | 69F54CEB9108AF9FC59329ADF2E5897AAD904A0F2B599E18D7846B0EAEE9F473 | 90518 | 0 |
| decision-deck-1c344a | F17B6E0D107D0AA1766CA840FECBA578D9E3A9B833ECFB042AFC193CA22D2257 | 135274 | 0 |
| evaluation-engine-1c344a | 7AD4DDF06AA0F72920DCA900594B21F853017913FD18F186D02D5560FBC83DB8 | 85312 | 0 |
| executive-summary-package-1c344a | EC4B311649747C2377BF6DE4FCEC4933F06C3BDFE3EB95B10C68A5F207164721 | 75618 | 0 |
| legal-negotiation-prep-1c344a | 2455031E84869B6653505023F215209D42AE885A9BCE7F8565CF6494062FB2D9 | 72851 | 0 |
| lilly-brand-assets-1c344a (PRE-SPLIT baseline) | 48A79435FD095A6E671CD6B097B6505F1C537553DB42BF4026F119369661A107 | 236684 | 16 |
| lilly-contract-review-1c344a | 4A03614B5B4957F9CF4DB1953EF7FF478A9880321F1C50F02D7BDFDA4BFEA972 | 147350 | 35 |
| market-rate-benchmarking-1c344a | 4D6FF27FF7F0D81938C7D79D9E000E2916E4034C22CEA6D6389BAB563F243ED9 | 75938 | 0 |
| meeting-prep-brief-1c344a | 3AB49D58BE452605F228FF2AB2ACE06D4AC80013CCC06CD661CC33FE1E092A6A | 16524 | 0 |
| negotiation-playbook-learning-1c344a | 1C21EC19B7F1F17496901FA70F4EAB974144422D03A286F32FDBD3947346FDAC | 61538 | 0 |
| negotiation-simulator-1c344a | BF174DD070B871ADEBCE4C314E3FB75A87D7D8CC857B5452BEC5337482E35F4A | 57176 | 0 |
| process-navigator-1c344a | 287E49A968013A2E02A36F5340A4A7D1FF260905D1C24B17E63937374C502E52 | 24696 | 0 |
| procurement-launcher-1c344a | 0932DE86171BBFFBC9B877648F93B8B35A50736D6286E35EF427DE6BCB3E1894 | 96462 | 0 |
| pro-forma-builder-1c344a | F3D56CE14EE67D4B946A3617E2C6A7B5329C954717C2A91F686A01919BF2CB43 | 37706 | 0 |
| rfp-case-manager-1c344a | FE812E0EC559798B1C65F03C79825F9A4E288BD48F9CA0208F208B6CB80C1072 | 76310 | 0 |
| rfp-engine-1c344a | 1C9C25274B0759C799A71E66276CFF29BFEBBC73465CE5F45C8962A2537145BD | 60435 | 10 |
| rfp-response-analysis-1c344a | A25136E52CDD72C61EDA10ECEB50E61ACFFC37FEC4842322B4A4CF55D7F80639 | 142341 | 0 |
| should-cost-builder-1c344a | 2F3194B372CB44785CB315690A8998F3FABEB763B43B07734A5281F6CFAA7A2C | 40507 | 0 |
| supplier-deep-dive-1c344a | 083CA7EA80A7AE76F4F04781DAE1BEE6C6DBF839045FD565D2EFC262B4FC008D | 67203 | 0 |
| supplier-landscape-1c344a | 858B1D53450FCFC94CC81AD82050679C92D114ED0D2A1EE03E7ECB9502A6B821 | 140475 | 0 |
| theos-field-guide-1c344a | 87B8BE2CD474333BD3DEC2A7E4EFAB155565F84552E0CEABFBE84985F98C43E2 | 126136 | 2 |
| timeline-builder-1c344a | 5EA01932C410E5A9C56B713573F37EF05C1381DA8B7454EEB9DF2911138E8153 | 44906 | 0 |
| voice-profile-1c344a | F2A9C8B861FBA5821022D2C0E14DEBACF6ECF7AA67A692DC5252801E960A70BA | 39699 | 0 |
| workflow-map-1c344a | 5CDCC2E4B4E27AE52749557108DD2CC876C97AFE07574DBB34CF24F053813444 | 27921 | 0 |

## Post-Stage-2 state (lilly-brand-assets-1c344a only)

| File | Lines | Notes |
|---|---|---|
| SKILL.md | 1305 | was 2853 pre-split; 54% reduction |
| references/user-manual.md | 1467 | verified byte-identical to baseline lines 1217-2683 by diff before original removed |
| references/aria-enrichment.md | 97 | pre-existing companion; verified byte-identical to the removed duplicate inline copy |

## Stage 3 change log (procurement-launcher split + chain-aware routing)

`procurement-launcher-1c344a/SKILL.md` baseline hash (0932DE86...) confirmed unchanged
immediately before Stage 3 began. Two content blocks extracted to companions, verified
byte-identical by diff before each original was removed (per three separate background
agents, cross-checked): the Teach mode section (186 lines, baseline lines 153-338) to
`references/teach-mode.md`, and the widget HTML body (261 lines, baseline lines
444-704) to `assets/theo-widget.html`. A new companion, `references/routing-and-chains.md`
(106 lines), was authored from a full 26-skill compilation of each skill's own stated
Consumes/Feeds/Integration/Cross-Skill-Handoffs text - every entry traces to a quoted
source in that skill's own SKILL.md, nothing inferred or invented. SKILL.md itself was
edited to add a "Chain-aware routing" section, replace both extracted blocks with
pointers, and add a companion-file-unreadable case to Graceful Degradation.

**Incident: a real corruption bug was found and fixed during this stage.** The first
attempt at removing the two extracted blocks from SKILL.md used PowerShell's
`Get-Content` (line-array) plus `-join` without an explicit UTF-8 encoding parameter.
Because the file has no byte-order-mark, PowerShell 5.1 silently decoded it using the
system ANSI codepage instead of UTF-8, corrupting every non-ASCII character in the
ENTIRE file (not just the edited regions) into mojibake - the rex-emoji, arrow, degree-
sign, and chevron characters throughout the changelog and styling sections were all
mangled. This was caught via direct inspection of the file's raw character codes (not
by eye - the garbled text was plausible-looking at a glance), traced to its root cause,
and fixed by discarding the corrupted file entirely and rebuilding fresh from the
verified-clean, hash-confirmed original (temp-extracted bundle copy, hash re-verified
0932DE86... immediately before rebuild), reading it via `[System.IO.File]::ReadAllBytes`
+ `[System.Text.Encoding]::UTF8.GetString` and applying every content change as
precise string operations on the correctly-decoded string, rather than a line-array
splice. Post-fix verification: rex emoji, chevrons, arrows, and degree signs all
confirmed present and correct by direct character-code inspection; zero mojibake, zero
control characters, zero em dashes; every untouched region (frontmatter through the
full version changelog, the "what this skill is" block, the complete 26-row routing
table, and the entire Styling/Tone section) confirmed byte-identical to the original
baseline by direct string comparison, not just a visual check.

**Follow-up full-suite sweep.** Given the mechanism of this bug (an unsafe encoding
default, not something specific to this one file), every markdown and HTML file across
all 26 skills (58 files total: every SKILL.md plus every companion created or modified
in Stages 1-3) was scanned for the same mojibake signature and for stray control
characters. Result: clean across all 58 files. The corruption was confirmed isolated
to the one file where the unsafe splice pattern was used, and it has since been fixed
and re-verified there. No other Stage 1 or Stage 2 file used that unsafe pattern (Stage
1 used the Edit tool exclusively; Stage 2 used `[System.IO.File]::WriteAllText` with
an explicit UTF8Encoding object throughout, after an earlier, smaller instance of the
same class of mistake was caught and fixed within Stage 2 itself).

Final state: `procurement-launcher-1c344a/SKILL.md` 298 lines (was 704), hash
CCC68308FDBE3521EE84CB48372B84E71721CCDC3DA9249437F94513F397D8B3 (post-fix, post
spacing-cleanup). Test-trace verification (static, not a live Claude Desktop run) is
in `docs/stage3-test-trace.md`; it recommends a live smoke test of the widget render
and Teach mode paths before this is treated as fully verified.

