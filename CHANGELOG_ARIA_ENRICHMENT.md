# ARIA Enrichment Layer - change log

Base: Lilly Procurement Skills Suite v10.6.4 (Tier 1, inlined).
This drop adds an OPTIONAL ARIA data layer. Internal label: v10.6.5-aria.
Install order, `.skill` filenames, and Project workflow are unchanged. This is a drop-in replacement bundle.

## The guarantee (works without ARIA)
The suite is fully functional for users who do not have ARIA. ARIA enrichment is additive, never required.
- Each enriched skill runs a silent reachability test. No active ARIA session or no `aria_*` tools means the non-ARIA path.
- On the non-ARIA path, the skill behaves exactly as before. Where an enrichment would have appeared, it shows one neutral line - "Lilly internal enrichment (ARIA) not available in this session." - and continues.
- No skill fails, blocks, stalls, or tells the user to install anything because ARIA is absent. No ARIA-sourced figure is ever fabricated.

## What changed
- **15 skills** received an optional `ARIA ENRICHMENT (optional, suite-wide)` block, inserted immediately after the YAML front matter and fenced by `<!-- ARIA-ENRICHMENT:START -->` / `<!-- ARIA-ENRICHMENT:END -->`. Each block names only the capabilities relevant to that skill and defers to the foundation spec for method.
- **Foundation (`lilly-brand-assets-1c344a`)** now carries the canonical spec two ways: inlined as `## INLINED: references/aria-enrichment.md`, and as the companion file `references/aria-enrichment.md`.
- **10 skills untouched** (no transactional-data appetite, or already sourced from M365): comment-cleanup, meeting-prep-brief, negotiation-playbook-learning, process-navigator, procurement-launcher, rfp-case-manager, theos-field-guide, timeline-builder, voice-profile, workflow-map.
- Front matter, descriptions, version stamps, and companion reference sets (lilly-contract-review = 40 files, rfp-engine = 14) are unchanged.

## Enriched skills and what each gains
| Skill | Footprint | SEC | Forecast |
|-------|-----------|-----|----------|
| supplier-deep-dive | yes | yes | - |
| supplier-landscape | yes | yes | - |
| category-strategy | yes | - | yes |
| commercial-negotiation-prep | yes | yes | - |
| market-rate-benchmarking | yes | yes | - |
| pro-forma-builder | yes | - | yes |
| decision-deck | yes | yes | - |
| rfp-engine | yes | - | - |
| legal-negotiation-prep | yes | yes | - |
| lilly-contract-review (commercial panel only) | yes | - | - |
| executive-summary-package | yes | - | - |
| negotiation-simulator | yes | yes | - |
| should-cost-builder | light | - | yes |
| rfp-response-analysis | yes | - | - |
| evaluation-engine | yes | - | - |

## The three capabilities
1. **Internal footprint** - active-vendor status, spend (total / by year / by commodity), payment terms, IKC risk flag, supplier-performance score, via the S2P spend model, HANA AP/P2P views, the CAS vendor master, and the commodity hierarchy.
2. **Public-company financials (SEC)** - revenue, margin, liquidity, segment, and risk-factor / going-concern text with a filing citation, via the `aria_sec_*` tools. A citable source that satisfies the `supplier-risk.md` no-fabrication rule.
3. **Spend forecast** - forward projection of a spend or rate series, via the forecasting tools.

## Constraints baked into the spec
- Vendor-master attributes (active status, payment terms, risk flag) require role `FGL__00605`; if they return nothing with ARIA present, they are unavailable, not zero. Spend and performance may still be reachable.
- The procurement category-management overlay (sourceability, diversity, category owner, IBU hub, wave) is NOT in ARIA; it stays cube-sourced. ARIA supplies the transactional spine and commodity hierarchy.
- SEC is public companies only; private suppliers route to the formal screen.
- Forecasts use closed periods and are labeled as projections.

## Make it durable across your next regeneration
The `.skill` files are generated. To keep this layer after you rebuild:
1. Add `references/aria-enrichment.md` to your `lilly-brand-assets` source so it inlines into the foundation.
2. Add the `ARIA-ENRICHMENT` pointer block to your shared per-skill template / generator, gated to the 15 skills in the table, with each skill's capability list.
3. Rebuild normally.

## To remove the layer
Delete the block between `<!-- ARIA-ENRICHMENT:START -->` and `<!-- ARIA-ENRICHMENT:END -->` in any skill, and the `## INLINED: references/aria-enrichment.md` section plus `references/aria-enrichment.md` in the foundation. The layer is self-contained.
