/* ===========================================================================
 * assets/seed/project-view.js, project-view flagship business data (build plan P4 / #112).
 *
 * Relocates the inline per-project business-data literals from the pv modules
 * (assets/pv/pv-04-domain-data.js and pv-08-deal-contract.js) into the seed
 * layer, read back through Theo.data.projectViewSeed(). Two groups:
 *
 *   projectView.domain, pv-04 read-only-ish domain data (negprep / contract /
 *     dealCategories / rfx / terms / obligations / renewal / thread / gapThread).
 *   projectView.deal  , pv-08 deal-contract literals, several of which the page
 *     MUTATES at runtime (cversions grows a version each turn; paper.onSupplierPaper
 *     flips; msas[].tied re-ties; contractComments is stripped; supplierContact is
 *     refreshed on ingest; inbound.pending clears). rfx (in domain) is ALSO mutated
 *     by the in-app scoring grid (panel scores, criteria add/remove, finalLocked).
 *
 * Theo.data.projectViewSeed() returns a FRESH DEEP CLONE with $src stripped, so the
 * page holds a mutable working copy while this seed stays pristine, no runtime edit
 * can corrupt the shared seed. The clone is $src-stripped, so the values are byte-
 * identical to the old inline literals and the render is unchanged (no provenance UI
 * is added here, behavior-preserving; $src is for the validator only). Reflect-only
 * illustrative mock throughout; Theo owns none of this data.
 * ======================================================================== */
(function () {
  var S = (window.__SEED__ = window.__SEED__ || {});
  var stub = window.stub || function (n, t) { return { name: n, tier: t || 1, confidence: t === 1 ? 'Medium' : 'Low', asOf: '2026-06-01', stub: true }; };
  var PV = stub('Project-view illustrative demo, reflect-only', 1);

  S.projectView = {
    // ======================================================================
    // DOMAIN, pv-04-domain-data.js  (Negprep / Contract / Terms / Obligations /
    // Renewal / RFx scoring). Read-only display data (rfx is mutated by the grid).
    // ======================================================================
    domain: {
      negprep: {
        target: '$540K/yr', walk: '$640K/yr', zone: '$540–640K/yr',
        leverage: 'Moderate-to-strong on Lilly\'s side: it is a sole-source candidate but multi-year, multi-entity, and a marquee pharma logo Acme wants publicly. Their leverage: switching cost and the bespoke HR data mapping. Best lever is the 3-year term + expansion roadmap traded against price and liability.',
        agenda: [
          { iss: 'Annual fee', target: '$540K/yr (3-yr lock)', fallback: '$600K with year-1 ramp credit', hs: '> $640K/yr' },
          { iss: 'Liability cap', target: '2× fees, no carve-out limit on PI breach', fallback: '1.5× fees, PI breach uncapped', hs: '< 1× fees' },
          { iss: 'Term & exit', target: '3 yrs + 30-day termination for convenience', fallback: '2 yrs + 60-day', hs: 'no convenience exit' },
          { iss: 'Data / sub-processors', target: 'Lilly DPA, prior-approval on sub-processors', fallback: 'notice + objection right', hs: 'no sub-processor control' },
          { iss: 'Price protection', target: 'CPI-capped renewals (≤3%)', fallback: 'fixed yr-1 renewal', hs: 'uncapped uplift' }
        ],
        talking: ['Anchor on the 3-year, multi-entity commitment, that is the value Acme is buying.', 'Reference the marquee-logo / case-study value to Acme as a non-cash concession.', 'Bundle price and liability: concede a higher fee only against a stronger PI-breach cap.', 'Keep the convenience-exit on the table as a walk signal, not a giveaway.'],
        redlines: ['No cap below 1× fees, and PI-breach liability must never be capped at the standard cap.', 'Lilly DPA + Standard Contractual Clauses are non-negotiable for employee PI.', 'No auto-renewal without an explicit, CPI-capped renewal price.']
      },
      contract: {
        score: 72,
        $src: { score: [stub('Contract protection scoring, reflect-only read of the Acme MSA', 1)] },
        summary: 'Protection Score reflects how well the current draft protects Lilly (0–100, higher is better). The MSA is broadly sound but three protection gaps hold the score down, liability cap, sub-processor control, and renewal pricing. Closing the two high-severity gaps would lift it into the 80s.',
        gaps: [
          { sev: 'high', sevt: 'High', sec: '§4', n: 'Liability cap below playbook', d: '§4 caps Acme\'s liability at 2× fees but applies the same cap to a personal-data breach. Lilly playbook requires PI-breach liability to sit outside the general cap.', fix: 'Carve PI-breach liability out of the §4 cap (uncapped, or a separate higher cap).' },
          { sev: 'high', sevt: 'High', sec: '§11', n: 'Sub-processors not controlled', d: '§11 lets Acme appoint sub-processors with notice only. For employee PI this needs a prior-approval right.', fix: 'Insert a prior-approval right plus an annual audit right (Lilly DPA cl. 7).' },
          { sev: 'med', sevt: 'Medium', sec: '§3', n: 'Uncapped renewal uplift', d: '§3 renews at "then-current list price" with no cap, exposing Lilly to open-ended increases.', fix: 'Cap renewal uplift at CPI or 3%, whichever is lower.' },
          { sev: 'low', sevt: 'Low', sec: '§18', n: 'Governing-law venue', d: '§18 specifies the supplier\'s home venue. Minor: playbook prefers a neutral or Lilly-favourable venue.', fix: 'Propose a neutral venue. Low priority.' }
        ]
      },
      dealCategories: [
        { cat: 'Liability', status: 'Gap', src: 'Base MSA §4, 2x-fees cap applies to a PI breach too (Finding: carve PI out of the cap)' },
        { cat: 'Indemnity', status: 'Covered', src: 'Base MSA §7, mutual indemnity; IP-infringement included' },
        { cat: 'Termination', status: 'Confirm', src: 'Base MSA §13, for-cause, 90-day cure; add termination-for-convenience (30-day)' },
        { cat: 'Data Protection', status: 'Gap', src: 'Change Order 3 · DPA cl.5, sub-processors on notice only (Finding: prior-approval + audit right, DPA cl.7)' },
        { cat: 'IP', status: 'Gap', src: 'Base MSA §9 baseline; supplier retains models trained on Lilly data (Finding: add Lilly-owns-outputs clause)' },
        { cat: 'Payment', status: 'Covered', src: 'Amendment 1 §2, annual-in-advance; Ariba Net-45' },
        { cat: 'Warranty', status: 'Covered', src: 'Base MSA §8, service warranty; remedy via SLA credits (Annex I)' },
        { cat: 'SLA/Performance', status: 'Covered', src: 'Base MSA §5 + Annex I, uptime >=99.5%, service credits; 2 minor misses, no escalation' },
        { cat: 'AI Governance', status: 'Confirm', src: 'AI platform improves on Lilly data; confirm use limited to Lilly outputs, no cross-client model reuse' },
        { cat: 'Security/Audit', status: 'Covered', src: 'Base MSA §9 (SOC 2 Type II annually) + DPA cl.7 (annual audit, 30-day notice)' },
        { cat: 'Insurance', status: 'Covered', src: 'Base MSA §12, cyber + E&O >= $5M; certificates annually' },
        { cat: 'Renewal/Price', status: 'Confirm', src: 'Amendment 2 §3, renews at then-current list, UNCAPPED (Finding: CPI / 3% cap)' },
        { cat: 'Flexibility', status: 'Confirm', src: 'Seats fixed at 400; no volume-reduction or scope-adjustment mechanism' },
        { cat: 'Commitment', status: 'Covered', src: '$1.8M committed (3-yr); MSA §7.2 anti-corruption training + evidence; employee-PI handling' }
      ],
      dealDeftraces: ['Lilly Data', 'Derived Outputs', 'Employee Personal Data', 'Sub-processor', 'Trained Model', 'Confidential Information'],
      rfx: {
        intent: 'Competitive RFP to select an enterprise data platform that consolidates analytics workloads. ~$3.2M TCO over 3 years, Yellow CCI. Award is subject to contract.',
        doc: 'RFP_Enterprise_Data_Platform_v2.pdf',
        scale: '0-5 bands · 5 Exceptional · 4 Exceeds · 3 Meets · 2 Partially · 1 Minimal · 0 Does Not Meet',
        dueDate: '2026-07-15',
        tco: '~$3.2M / 3 yrs',
        cci: 'Yellow',
        awardBasis: 'Award subject to contract',
        // Overview #3 (Marc): an INTERNAL delaying item (a step/person/requirement holding up progress) + INTERNAL
        // process flags only (NEVER supplier issues like a missing SOC 2, those live in the scoring/risk views).
        blocker: { what: 'Security scoring outstanding', who: 'James Wright · Security evaluator', note: 'The panel cannot finalize until the security scores are entered.' },
        internalFlags: [ { sev: 'warn', text: 'Business funding for the initial Work Order is not yet confirmed by Finance.' } ],
        structureLocked: true,
        finalLocked: false,
        // Recommendation > Model the decision (2026-07-26 build): AUTHORED weight profiles for the
        // two named what-if scenarios (faithful port of RFx-RECOMMENDATION-OPTIONS-6.html's fixed
        // COST/SEC arrays). Everything else that panel needs (the filed/base category weights, the
        // per-supplier per-category fit matrix, which suppliers are gate-conforming) is DERIVED live
        // from rfxCategoryWeights()/rfxCatFit()/rfxCoverage() over criteria/requirements/suppliers
        // above, never duplicated here, so it can never drift from the rest of the tab. Weight keys
        // are the exact category strings shared by both RFX.criteria[].cat and
        // RFX.requirements[].category (verified identical set/order); a category with no key here
        // reads as 0% in that scenario. Percentages need not sum to 100, the render normalizes.
        modelDecision: {
          scenarios: {
            cost: { name: 'Cost-priority', desc: 'Total cost (TCO) pushed to 50% of the weight, the rest compressed proportionally.',
              weights: { 'Functional fit': 10, 'Integration & architecture': 8, 'Security & compliance': 10, 'Performance & scalability': 5, 'Operational support': 4, 'Total cost (TCO)': 50, 'Innovation & roadmap': 5, 'Risk & stability': 8 } },
            security: { name: 'Security-priority', desc: 'Security & compliance pushed to 50% of the weight, the rest compressed proportionally.',
              weights: { 'Functional fit': 10, 'Integration & architecture': 10, 'Security & compliance': 50, 'Performance & scalability': 5, 'Operational support': 5, 'Total cost (TCO)': 8, 'Innovation & roadmap': 4, 'Risk & stability': 8 } }
          }
        },
        criteria: [
          { cat: 'Functional fit', w: 22, subs: [{ k: 'Data modeling & schema flexibility', w: 30 }, { k: 'ETL / ingestion & transformation', w: 25 }, { k: 'Self-service analytics & usability', w: 25 }, { k: 'Roadmap & extensibility', w: 20 }] },
          { cat: 'Integration & architecture', w: 18, subs: [{ k: 'Cloud-native architecture', w: 35 }, { k: 'API maturity & openness', w: 35 }, { k: 'Legacy / SAP integration', w: 30 }] },
          { cat: 'Security & compliance', w: 20, subs: [{ k: 'Encryption at rest & in transit', w: 22, must: true }, { k: 'SOC 2 Type II certification', w: 20, must: true }, { k: 'Data residency controls (EU/US)', w: 20 }, { k: 'Audit logging & monitoring', w: 16 }, { k: 'Access control / SSO (Entra)', w: 22 }] },
          { cat: 'Performance & scalability', w: 12, subs: [{ k: 'Query throughput at scale', w: 40 }, { k: 'Concurrency / multi-tenant isolation', w: 30 }, { k: 'Latency SLAs', w: 30 }] },
          { cat: 'Operational support', w: 10, subs: [{ k: 'Uptime SLA & service credits', w: 40 }, { k: 'Support coverage (24x7)', w: 35 }, { k: 'Incident response & RCA', w: 25 }] },
          { cat: 'Total cost (TCO)', w: 10, subs: [{ k: 'Licensing model & unit economics', w: 45 }, { k: 'Implementation cost', w: 30 }, { k: 'Run & support cost', w: 25 }] },
          { cat: 'Innovation & roadmap', w: 5, subs: [{ k: 'Feature velocity & delivery', w: 55 }, { k: 'AI / emerging-tech support', w: 45 }] },
          { cat: 'Risk & stability', w: 3, subs: [{ k: 'Financial stability', w: 60 }, { k: 'Key-person / continuity risk', w: 40 }] }
        ],
        requirements: [
          { id: 'r1', text: 'Data modeling & schema flexibility', category: 'Functional fit', weight: 5, mandatory: true, moscow: 'must', confidence: 0.9, objective: 'Consolidate analytics workloads onto one governed platform', acceptance: 'Supports Lilly’s dimensional + semi-structured models with schema evolution and no lock-in on the model layer.' },
          { id: 'r2', text: 'ETL / ingestion & transformation', category: 'Functional fit', weight: 4, mandatory: false, moscow: 'should', confidence: 0.8, objective: 'Reduce hand-built pipelines', acceptance: 'Ingests the top 10 Lilly source systems with scheduled and streaming transforms.' },
          { id: 'r3', text: 'Self-service analytics & usability', category: 'Functional fit', weight: 3, mandatory: false, moscow: 'should', confidence: 0.75, objective: 'Broaden analyst self-service', acceptance: 'Business analysts build and publish dashboards without engineering tickets.' },
          { id: 'r4', text: 'Cloud-native architecture', category: 'Integration & architecture', weight: 4, mandatory: true, moscow: 'must', confidence: 0.9, objective: 'Fit the Lilly cloud reference architecture', acceptance: 'Runs cloud-native with elastic compute separated from storage.' },
          { id: 'r5', text: 'API maturity & openness', category: 'Integration & architecture', weight: 4, mandatory: false, moscow: 'should', confidence: 0.8, objective: 'Enable programmatic integration', acceptance: 'Documented REST/GraphQL APIs cover data, metadata and admin operations.' },
          { id: 'r6', text: 'Legacy / SAP integration', category: 'Integration & architecture', weight: 3, mandatory: false, moscow: 'could', confidence: 0.7, objective: 'Protect the SAP backbone investment', acceptance: 'Integrates with SAP/S4HANA sources at validated throughput.' },
          { id: 'r7', text: 'Encryption at rest & in transit', category: 'Security & compliance', weight: 5, mandatory: true, moscow: 'must', confidence: 0.95, objective: 'Meet Lilly data-protection policy', acceptance: 'AES-256 at rest, TLS 1.2+ in transit, Lilly-managed keys.' },
          { id: 'r8', text: 'SOC 2 Type II certification', category: 'Security & compliance', weight: 5, mandatory: true, moscow: 'must', confidence: 0.95, objective: 'Satisfy third-party assurance', acceptance: 'Current SOC 2 Type II report on file at award (Type I does not satisfy the gate).' },
          { id: 'r9', text: 'Access control / SSO (Entra)', category: 'Security & compliance', weight: 4, mandatory: false, moscow: 'should', confidence: 0.85, objective: 'Centralize identity on Entra', acceptance: 'SAML/OIDC SSO with Entra, SCIM provisioning, MFA enforced.' },
          { id: 'r10', text: 'Query throughput at scale', category: 'Performance & scalability', weight: 4, mandatory: true, moscow: 'must', confidence: 0.8, objective: 'Sustain enterprise query load', acceptance: 'Meets the stated concurrency and latency targets at production scale.' },
          { id: 'r11', text: 'Uptime SLA & service credits', category: 'Operational support', weight: 3, mandatory: false, moscow: 'should', confidence: 0.8, objective: 'Assure availability', acceptance: '≥ 99.5% monthly uptime backed by service credits.' },
          { id: 'r12', text: 'Licensing model & unit economics', category: 'Total cost (TCO)', weight: 4, mandatory: false, moscow: 'should', confidence: 0.75, objective: 'Control 3-year TCO', acceptance: 'Transparent unit economics with a firm, capped-escalator quote.' },
          { id: 'r13', text: 'AI / emerging-tech support', category: 'Innovation & roadmap', weight: 2, mandatory: false, moscow: 'could', confidence: 0.6, objective: 'Keep pace with the AI roadmap', acceptance: 'Native GenAI / ML feature support on the roadmap with delivery dates.' },
          { id: 'r14', text: 'Financial stability', category: 'Risk & stability', weight: 2, mandatory: false, moscow: 'could', confidence: 0.65, objective: 'Limit continuity risk', acceptance: 'Audited financials evidence going-concern stability at Lilly scale.' }
        ],
        suppliers: [
          { n: 'Nimbus Data', contact: 'Sam Rivera', email: 'sam.rivera@nimbusdata.io', landscapeScore: 4.5, mustFail: ['SOC 2 Type II certification'],
            rq: { r1: 5, r2: 5, r3: 5, r4: 5, r5: 4, r6: 3, r7: 4, r8: 1, r9: 4, r10: 4, r11: 4, r12: 5, r13: 5, r14: 2 },
            // lineItemSplit is AUTHORED, INDICATIVE data added for the Business Case tab's Line-Item Mini-P&L
            // (rfxBcLineItemPnlHTML): the submitted pricing schedule bundles subscription+support into one
            // annual fee and does not itemize implementation vs training, so these are indicative divisions
            // only, not submitted figures. Every split reconciles exactly to the submitted totals (985,000
            // split 85/15 = 833,000+147,000; 210,000 split 90/10 = 189,000+21,000).
            pricing: { model: 'Per-seat SaaS subscription', annual: '$980,000', list: '$1,420,000', discount: '31%', impl: '$210,000 fixed-fee', terms: 'Annual, prepaid', escalator: 'Capped 3%/yr', binding: 'Yes, held 90 days',
              lineItemSplit: { subscriptionOfAnnualPct: 85, supportOfAnnualPct: 15, implOfImplPct: 90, trainingOfImplPct: 10 } },
            profile: { hq: 'San Francisco, USA', founded: '2015', employees: '480', revenue: '$88M (2024 est.)', ownership: 'Private, VC-backed (Series D)', analyst: 'Gartner Visionary (2024)',
              strengths: ['Best-in-class self-service analytics UX', 'Aggressive, transparent pricing with a firm 90-day hold', 'Rapid feature velocity (6-week release train)'],
              weaknesses: ['SOC 2 Type II not yet certified (Type I only)', 'Thin pharma / GxP reference base', 'Smaller balance sheet, continuity risk at Lilly scale'],
              redFlags: ['SOC 2 Type II certification in progress, not complete, a Must-Have gap', 'Single recent funding round; request audited financials before award'] },
            narr: { legal: 'Standard Nimbus SaaS MSA offered; redlines assessed as moderate, the liability cap and a PI carve-out remain open.', impl: '8–10 week implementation with named Nimbus delivery consultants; SI partners Accenture and Slalom.', integ: 'REST/GraphQL APIs plus pre-built connectors; SAP integration runs through middleware, not native, to be validated against the Lilly stack.' },
            lilly: { relationship: 'Registered supplier; no Lilly contracts on file', spend: null, tprm: { status: 'under-review', open: 2 }, defender: null },
            report: {
              pill: 'Leader · gate risk · advisory', stage: 'Evaluation · panel scoring in progress',
              lede: '<b>The strongest functional and commercial submission in the field, and Theo’s advisory recommendation on panel score.</b> Full marks (<span class="pos">5 of 5</span>) across data modeling, ETL and self-service analytics, and the most aggressive price on the table at <span class="pos">$980,000/yr</span>, 31% below list and held firm for 90 days. It leads the field on merit; one open item is flagged below, the <span class="em">SOC 2 Type II gate</span>, a business call for the panel, with three further material but non-fatal risks behind it.',
              gate: '<b>SOC 2 Type II gate.</b> Nimbus submitted a Type I report; the RFP requires a current Type II at award. The recommendation stands on the panel score with this gate flagged, not demoted; the executed award is barred until the Type II is in hand or the panel accepts the risk.',
              sections: [
                { title: 'Response assessment', rn: 'How they answered', sub: 'requirements matrix', score: 9,
                  facts: [['Technical proposal', '42 pages'], ['Requirements matrix', '14 of 14 answered', 'pos'], ['Pricing schedule', 'Submitted · firm 90 days'], ['Security questionnaire', 'SOC 2 Type I letter'], ['Product demo', 'Recorded · 38 min'], ['Not submitted', 'MSA redline, pilot plan, audited financials', 'em']],
                  summary: ['Nimbus returned a complete, well-structured 42-page proposal with all fourteen requirements addressed in the response matrix. Each requirement carries a self-assessed score and a short capability note, and the self-scores span the full <b>1-to-5 range rather than a uniform 5</b>. Pricing was submitted on the standard schedule and held firm for 90 days, and the security questionnaire came back with a SOC 2 Type I attestation letter attached.', 'The functional chapters (architecture, data modeling, analytics) are the longest and cite specific product behaviour; the security, legal and implementation chapters are shorter and use “in progress” or “on roadmap” phrasing in several places. Three items the RFP asked for were not in the pack: a legal redline against the Lilly MSA, a phased pilot plan, and audited financial statements.'],
                  read: [{ cls: 'pos', html: '<b>Differentiated self-scoring</b> reads as candour, not a marketing pass.' }, { cls: 'watch', html: '<b>Security, legal and implementation run thin</b> against the functional chapters.' }, { cls: 'gap', html: '<b>Three high-value artefacts missing</b> (redline, pilot plan, audited financials).' }],
                  deeper: 'The submission’s shape is itself a signal: effort tracks confidence. Depth sits exactly where Nimbus is strongest, the platform, and thins out precisely where a regulated buyer carries the most risk, in assurance, contracting and validated delivery. The three missing artefacts are not incidental; each is the single document that would most reduce contracting, delivery or continuity risk, so their absence pre-shapes the security, implementation and legal sections below and belongs on the clarification list.' },
                { title: 'Solution architecture', rn: 'Platform & data model', sub: 'how it is built', hint: 'Proposal pp. 8–19', score: 9,
                  summary: ['Nimbus proposes its cloud-native warehouse as the single consolidation target for the Lilly analytics estate. The chapter describes storage and compute as fully decoupled so each scales independently, with idle compute auto-suspending to contain spend, and states plainly that data models stay portable, that no proprietary query language is required to use the platform, and that new capability ships on a fixed six-week release train. The component-level claims below are taken directly from the architecture chapter and its self-scores.'],
                  comp: [['Data modeling', 'Dimensional and Data Vault patterns, versioned schemas, column-level lineage. <span class="pos">5 / 5</span>'], ['ETL / ELT', 'Native ELT plus dbt-compatible transforms; change-data-capture connectors for SAP and Oracle. <span class="pos">5 / 5</span>'], ['Self-service analytics', 'Governed semantic layer, row-level security, BI-tool agnostic. <span class="pos">5 / 5</span>'], ['Machine learning', 'In-warehouse feature store; advanced ML served through a named partner rather than first-party.'], ['EU data residency', 'Described as on the roadmap; EU topology deferred, not yet generally available.']],
                  read: [{ cls: 'pos', html: '<b>Field-best modeling and self-service,</b> matching the Lilly reference architecture.' }, { cls: 'pos', html: '<b>Decoupled, portable, no lock-in</b> language is credible and specific.' }, { cls: 'watch', html: '<b>ML leans on a partner</b> and <b>EU topology is deferred</b>; confirm both in the demo.' }],
                  deeper: 'This is the deepest and most specifically-argued chapter in the submission and it maps cleanly onto the Lilly reference architecture, which is why it earns the field’s top marks on capability. Both caveats are scope-of-delivery questions rather than capability gaps: confirm in the demo that the advanced-ML partner arrangement inherits the same SLAs, support path and data-residency guarantees as the core platform, and press for a committed GA date for EU topology rather than a roadmap reference, since EU residency is itself an evaluated requirement.' },
                { title: 'Integration', rn: 'Connectivity & SSO', sub: 'fit to the Lilly estate', hint: 'Proposal pp. 20–27', score: 6,
                  facts: [['APIs', 'REST + GraphQL', 'pos'], ['Identity', 'Native Entra SSO / SCIM', 'pos'], ['SAP / S4HANA', 'Via middleware, not native', 'em'], ['Throughput evidence', 'Not provided', 'em']],
                  summary: ['The chapter describes REST and GraphQL APIs with published documentation, native Microsoft Entra single sign-on with SCIM provisioning, and pre-built connectors for common cloud sources. For SAP and S4HANA, the two systems that matter most to Lilly, the response states that connectivity is delivered through a third-party middleware layer rather than a native connector. No throughput figures at Lilly data volumes are provided, and the submission does not name which party licenses or supports that middleware.'],
                  read: [{ cls: 'pos', html: '<b>Native Entra SSO</b> is a clean fit for the estate.' }, { cls: 'gap', html: '<b>SAP is middleware, unproven</b> at volume; the highest-value thing to validate in the demo.' }, { cls: 'watch', html: '<b>Ownership of the middleware</b> (license + support) is unnamed.' }],
                  deeper: 'Everything except SAP is strong, and SAP is where the estate’s real integration load sits, so the score is held down by one specific, testable unknown rather than a broad weakness. A middleware-mediated SAP path is workable, but it adds a component Lilly would depend on without knowing its owner, its cost or its ceiling. Resolve it concretely: a live throughput test against the Lilly SAP backbone in the capability demo, plus a named, contracted owner for the middleware, converts a 6 into a defensible 8.' },
                { title: 'Implementation plan', rn: 'Delivery approach', sub: 'how they stand it up', hint: 'Proposal pp. 28–33', score: 5,
                  summary: ['The chapter proposes an 8-to-10 week stand-up with a named delivery team and tier-1 systems integrators (Accenture and Slalom) attached, and lays out the workstreams at a high level: environment set-up, source onboarding, model build and handover. It cites the SIs’ prior warehouse programmes as evidence of delivery capacity.', 'The plan is described at the workstream level only. It does not include a phased pilot, defined acceptance gates, a rollback procedure, or a resource-loaded schedule tied to named roles and dates, and it does not reference Lilly’s computer-system-validation obligations for a GxP environment.'],
                  read: [{ cls: 'pos', html: '<b>Named team + tier-1 SIs;</b> the timeline is realistic.' }, { cls: 'gap', html: '<b>No phased pilot, acceptance gates or rollback</b> for a regulated rollout.' }, { cls: 'watch', html: '<b>Not resource-loaded;</b> ask for a schedule Lilly can hold them to.' }],
                  deeper: 'This reads as a capable vendor’s default delivery plan rather than one shaped to a validated pharmaceutical environment, which is why it scores mid-pack despite a credible team. The 8-to-10 week figure is believable for the platform but is almost certainly optimistic once validation, acceptance testing and change control are layered in. The ask is not a new team, it is a plan with the rigour Lilly’s environment requires: a phased pilot, explicit acceptance gates, a rollback path, and a resource-loaded schedule against named roles.' },
                { title: 'Commercial offer', rn: 'Price & terms', sub: 'what it costs', hint: 'Pricing schedule', score: 8,
                  priceblk: { pn: '$980,000', unit: '/yr', psub: '<b style="color:var(--pri-tx)">31% below</b> the $1.42M list, held firm for 90 days. The most aggressive price in the field.', terms: [['Model', 'Per-seat SaaS'], ['Implementation', '$210K fixed fee'], ['Term / escalator', '3 yr · capped 3%/yr'], ['Est. 3-yr TCO', '~$3.1M']] },
                  summary: ['The offer is a per-seat SaaS subscription at $980,000/yr, quoted as a 31% reduction from the $1.42M list price and held firm for 90 days, with a $210K fixed implementation fee and a three-year term whose annual escalator is capped at 3%. The discount is stated explicitly in the schedule rather than buried in the line items. Two elements are left open: the per-seat unit price is not broken out, and the premium capability tier referenced in the architecture chapter is not priced.'],
                  read: [{ cls: 'pos', html: '<b>Lowest price, transparent discount,</b> firm for 90 days.' }, { cls: 'watch', html: '<b>Per-seat and premium tier unpriced;</b> pin them before signature.' }, { cls: 'watch', html: '<b>$60–120K above should-cost;</b> negotiable room remains.' }],
                  deeper: 'Price is a real strength, not just the headline: lowest in the field and transparent, which is a good-faith signal. It lands at 8 rather than 9 for reasons that are entirely negotiable. Theo’s independent should-cost model puts a fair price <b>$60–120K below</b> the quote, and the two unpriced elements are exactly where scope tends to drift after signature. Both are leverage: hold the 90-day firmness, close the should-cost gap, and pin the unit prices before award.' },
                { title: 'Product demo', rn: 'What they showed', sub: 'capability evidence', hint: 'Recorded · 38 min', score: 7,
                  summary: ['Nimbus submitted a 38-minute recorded walkthrough on live product rather than slideware. It exercises the data-modeling and self-service claims end to end, including schema versioning, the semantic layer and row-level security, and it visibly substantiates the strongest chapters of the written response. The recording uses Nimbus’s own sample data; it was not run live against a Lilly scenario, and no pilot or proof-of-concept plan was attached alongside it.'],
                  read: [{ cls: 'pos', html: '<b>Real functional depth</b> on live product, not slideware.' }, { cls: 'watch', html: '<b>Recorded on sample data,</b> not live against a Lilly scenario.' }, { cls: 'gap', html: '<b>No pilot plan;</b> a scoped POC would close the SAP and throughput questions.' }],
                  deeper: 'The demo does its job for capability and is a meaningful notch above a deck, which is why it clears the mid-point comfortably. What it cannot do on sample data is answer the two questions that actually gate this deal, SAP throughput and behaviour at Lilly volumes, so it corroborates strength without retiring risk. A short, scoped proof-of-concept against a real Lilly workload is the single highest-leverage next step and would speak to integration, implementation and references at once.' },
                { title: 'Security & compliance', rn: 'Controls & certifications', sub: 'the gate lives here', hint: 'Security questionnaire', score: 4,
                  facts: [['Encryption', 'At rest + in transit', 'pos'], ['Access / SSO', 'Entra SSO · RBAC', 'pos'], ['SOC 2', 'Type I only · Type II required', 'em'], ['ISO 27001', 'Not held', 'em'], ['EU residency', 'Unevidenced', 'em']],
                  summary: ['The questionnaire confirms the baseline controls with evidence: AES-256 encryption at rest and TLS in transit, Microsoft Entra SSO with role-based access control, and standard logging and key-management practices. On formal certification, Nimbus provided a <b>SOC 2 Type I</b> attestation letter dated within the year and stated that a Type II examination is in progress; the RFP names a current <b>Type II</b> as a Must-Have. ISO 27001 is not held, and EU data residency is asserted in the response but not evidenced with a data-flow or hosting attestation.'],
                  read: [{ cls: 'pos', html: '<b>Encryption, SSO and RBAC</b> are in place and evidenced.' }, { cls: 'gap', html: '<b>SOC 2 Type II is the gate;</b> a Type I plus a roadmap does not satisfy the Must-Have.' }, { cls: 'watch', html: '<b>No ISO 27001, EU residency unevidenced;</b> both need documentation.' }],
                  deeper: 'The distinction is what makes this the gate rather than a deduction: a Type I attests that controls are designed at a point in time, while a Type II attests they operated effectively over a period, which is the assurance a regulated buyer actually relies on. An in-progress Type II and a dated roadmap do not satisfy a Must-Have, so award is barred until the report is in hand regardless of how strongly the platform grades elsewhere. Confirm the examination window and completion date; treat ISO 27001 and evidenced EU residency as the next tier of documentation, not blockers.' },
                { title: 'MSA & legal terms', rn: 'Contractual position', sub: 'distance to signature', hint: 'Contract posture', score: 3,
                  summary: ['Nimbus submitted its own standard SaaS Master Services Agreement and did not provide a redline against <b>Lilly Master Procurement Terms 5.0</b>. On the two clauses Lilly weights most heavily, the standard MSA caps liability at twelve months of fees and carries a broad personal-information handling clause that does not track Lilly’s required data-protection carve-out. The submission does not reference Lilly’s mandatory clauses on audit rights, sub-processors or termination for convenience.'],
                  read: [{ cls: 'gap', html: '<b>No redline against Lilly MPT 5.0;</b> a full negotiation, not a markup.' }, { cls: 'gap', html: '<b>Liability cap and PI carve-out open,</b> the two clauses that matter most.' }, { cls: 'watch', html: '<b>Budget legal time;</b> this is the critical path to contract even if the gate clears.' }],
                  deeper: 'Starting from a vendor paper with no engagement of Lilly’s terms means the parties are further apart than a markup would imply, which is why this is the lowest score in the set and the likely critical path to signature even after the gate clears. The twelve-month liability cap and the PI clause are the two positions most likely to require escalation, not just legal review. Get an MSA redline against MPT 5.0 into the process early and in parallel with the security remediation, so contracting is not the thing that stalls an otherwise-winning bid.' },
                { title: 'References & regulated fit', rn: 'Proof at Lilly’s context', sub: 'is it proven where it matters', hint: 'Reference set', score: 3,
                  summary: ['Nimbus supplied three customer references, all in technology and financial services, each at comparable data scale to Lilly and each speaking to platform performance and support. The reference set contains <b>no pharmaceutical, life-sciences, GxP or otherwise regulated-industry customer</b>, and the response does not cite any validated or inspection-exposed deployment. The stated customer base is concentrated in exactly the sectors that do not carry Lilly’s validation, data-integrity and inspection obligations.'],
                  read: [{ cls: 'pos', html: '<b>Credible references</b> at comparable scale in tech and finance.' }, { cls: 'gap', html: '<b>No pharma / GxP reference;</b> regulated fit is unproven.' }, { cls: 'watch', html: '<b>A POC would convert</b> asserted fit into evidence.' }],
                  deeper: 'The references are good evidence of scale and reliability but silent on the thing Lilly most needs to know: whether the platform holds up under validation, data-integrity and inspection regimes it has never operated in. That is a proof gap, not a capability verdict, which is why it scores low without condemning the platform. A scoped proof-of-concept on a real Lilly workload is the most efficient way to close it, and it doubles as the evidence the implementation and integration sections are also asking for.' }
              ],
              profile: { score: 5,
                leadership: ['<b>Sam Okonkwo</b> <span>· CEO & co-founder · prev. VP Product, Snowflake</span>', '<b>Dana Lin</b> <span>· CTO & co-founder · prev. Principal Engineer, AWS Redshift</span>', '<b>Maria Alvarez</b> <span>· CFO · prev. Datadog finance</span>'],
                backers: [{ t: 'ICONIQ · D lead', hl: true }, { t: 'Sequoia' }, { t: 'Lightspeed' }, { t: 'SI · Accenture' }, { t: 'SI · Slalom' }],
                risk: [{ cat: 'Financial', tx: 'Unaudited financials on a single recent round; runway around 18 months.', sev: 'hi', sevlabel: 'Elevated' }, { cat: 'Continuity', tx: 'Venture-stage and not yet profitable.', sev: 'mid', sevlabel: 'Watch' }, { cat: 'Legal', tx: 'No material litigation on public record.', sev: 'ok', sevlabel: 'Clear' }, { cat: 'Security', tx: 'No disclosed breach on record.', sev: 'ok', sevlabel: 'Clear' }, { cat: 'Concentration', tx: 'Tech and financial-services base; no pharmaceutical customers.', sev: 'mid', sevlabel: 'Watch' }],
                read: 'A venture-stage challenger, not an incumbent. The same economics that produce the field’s lowest price also mean a small, unaudited balance sheet funded through a single round, which is a real continuity consideration on a multi-year commitment. The reassuring side is a clean public record and a leadership bench drawn from Snowflake, AWS and Datadog. The two facts most worth pressing before award are the <span class="em">absence of audited financials</span> and the <span class="em">absence of any pharmaceutical or GxP customer</span>.' },
              overall: {
                take: '<b>Nimbus is Theo&rsquo;s recommendation: the top panel score and the lowest price in the field.</b> It carries one open item, the SOC 2 Type II Must-Have, a hard gate, flagged prominently rather than a reason to drop it from #1. This is the panel&rsquo;s call: accept the risk of proceeding with Nimbus, or secure a dated SOC 2 Type II commitment before award, or select <b>Lakehouse Co</b>, the highest-scored bidder that clears every Must-Have, as the clean conforming alternative.',
                narr: ['On the merits Nimbus wins the functional and commercial comparison outright: field-best data modeling and self-service, the deepest architecture response, a working demo, and the lowest price on the table with the discount stated transparently. Nothing else in the field beats it on what the platform does or what it costs.', 'The reservations are concentrated and specific rather than diffuse. One is a hard gate: SOC 2 Type II, a Must-Have, is a Type I today, and the award is barred until a current Type II is in hand. Behind it sit three material risks, none fatal on its own: the SAP integration runs through unproven middleware, the vendor is venture-stage on an unaudited balance sheet, and there is no pharmaceutical or GxP reference. If Nimbus produces the Type II and satisfies the three, most of the remaining exposure moves to the negotiation table, where the above-should-cost price and the un-redlined MSA are both winnable.'],
                steps: [{ pr: 'Gating', prcls: 'g', cat: 'Security · SOC 2 Type II', q: 'Provide a current SOC 2 Type II report at award; a Type I plus a dated roadmap does not satisfy the Must-Have. Confirm the certification date and any remediation window.' }, { pr: 'High', prcls: 'g', cat: 'Integration · SAP throughput', q: 'Validate SAP and S4HANA throughput through the proposed middleware against the Lilly backbone in the capability demo, and name who licenses and supports that layer.' }, { pr: 'High', prcls: 'g', cat: 'Legal · MSA redline', q: 'Submit an MSA redline against Lilly Master Procurement Terms 5.0 and resolve the open liability cap and the personal-information carve-out.' }, { pr: 'Medium', prcls: 'm', cat: 'Risk · financial stability', q: 'Supply audited financials that evidence going-concern stability at Lilly scale, given the single recent round and the smaller balance sheet.' }, { pr: 'Medium', prcls: 'm', cat: 'References · regulated fit', q: 'Provide pharmaceutical, GxP or regulated-industry references, or propose a proof-of-concept to evidence regulated-analytics fit.' }],
                close: 'Nimbus stays Theo&rsquo;s recommendation on the panel score, gate flagged, business call for the panel. <b>Lakehouse Co</b>, the gate-pass leader and clean on every Must-Have, is the conforming alternative if the panel prefers to avoid the gate risk rather than accept it or wait on remediation.' },
              strengths: ['Field-best data modeling, ETL and self-service analytics (5 / 5 across the board).', 'Lowest price in the field, 31% below list and firm for 90 days.', 'Deepest, most specific architecture response, substantiated by a working demo.', 'Native Entra SSO and a leadership bench from Snowflake, AWS and Datadog.'],
                concerns: [{ i: '✗', html: 'SOC 2 Type II not met (Type I only), a Must-Have that gates the award.' }, { i: '!', html: 'SAP integration runs through unproven middleware with no throughput evidence.' }, { i: '!', html: 'Venture-stage vendor on an unaudited balance sheet; ~18-month runway.' }, { i: '!', html: 'No pharma / GxP reference and no redline against Lilly MPT 5.0.' }],
              scorecard: [['Requirements matrix', 9, 'All 14 answered with differentiated self-scores and capability notes; a credible self-assessment, not marketing.'], ['Solution architecture', 9, 'Cloud-native, decoupled storage and compute, field-best modeling and self-service. ML partly partner-served; EU topology deferred.'], ['Commercial / pricing', 8, 'Lowest price, transparent 31% discount, firm 90 days. Per-seat model and premium tier unpriced; $60–120K over should-cost.'], ['Product demo', 7, 'The 38-minute recorded demo shows real functional depth; no pilot plan accompanied it.'], ['Integration', 6, 'Modern REST and GraphQL plus native Entra SSO, but SAP is middleware rather than native, with no throughput evidence.'], ['Vendor profile / financials', 5, 'VC-backed with ~$88M revenue and no audited statements; continuity risk at Lilly scale.'], ['Implementation plan', 5, 'Eight to ten weeks with a named team and tier-1 SIs, but no phased pilot, acceptance gates, rollback or resource-loaded plan.'], ['Security & compliance', 4, 'Encryption and Entra SSO met, but SOC 2 Type II is Type I only (the Must-Have gate), no ISO 27001, EU residency unevidenced.'], ['References', 3, 'No pharmaceutical or GxP references; the base is concentrated in tech and financial services, so regulated fit is unproven.'], ['MSA / legal', 3, 'Standard SaaS MSA with no redline against Lilly MPT 5.0. Liability cap and PI carve-out open; a full negotiation is required.']]
            } },
          { n: 'Lakehouse Co', contact: 'Dana Brooks', email: 'dana.brooks@lakehouse.co', landscapeScore: 4.4, mustFail: [],
            rq: { r1: 4, r2: 4, r3: 4, r4: 5, r5: 5, r6: 3, r7: 5, r8: 5, r9: 5, r10: 4, r11: 5, r12: 3, r13: 4, r14: 5 },
            pricing: { model: 'Platform subscription (3-yr)', annual: '$1,060,000', list: '$1,180,000', discount: '10.2%', impl: '$340,000 (T&M est.)', terms: '3-year term', escalator: 'CPI, capped 4%/yr', binding: 'Yes, held 120 days' },
            profile: { hq: 'Boston, USA', founded: '2011', employees: '2,200', revenue: '$410M (2024)', ownership: 'Public (NASDAQ: LKHS)', analyst: 'Gartner Leader (2024)',
              strengths: ['Full SOC 2 Type II and FedRAMP Moderate', 'Mature open API surface with native Entra SSO', 'Strong regulated-industry reference base'],
              weaknesses: ['Higher list price; smaller headline discount', 'Legacy / SAP integration via partner, not native'],
              redFlags: [] },
            narr: { legal: 'MSA redlines submitted and assessed as low-deviation; among the cleaner legal postures in the field.', impl: 'Fixed-scope onboarding with a defined phase plan; certified-partner delivery.', integ: 'Cloud-native with a mature open API surface and native Entra SSO; SAP integration delivered through a certified partner.' },
            lilly: { relationship: '1 active MSA (analytics pilot) on file; SAP vendor master matched', spend: '$2.4M trailing 12 months', tprm: { status: 'approved' }, defender: null },
            report: {
              pill: 'Conforming · clean alternative', stage: 'Evaluation · panel scoring in progress',
              lede: '<b>The conforming benchmark of the field.</b> Lakehouse clears <span class="pos">every Must-Have</span>, holds full SOC 2 Type II and FedRAMP Moderate, and brings the strongest regulated-industry reference base on the table. It trails Nimbus on the panel’s weighted score and on price, at <span class="em">$1.06M/yr</span> against a 10% discount, but it carries no gate and no material risk. Theo&rsquo;s advisory recommendation is Nimbus, the top panel score, with its SOC 2 Type II gate flagged; Lakehouse is the clean conforming alternative if the panel prefers to avoid that gate risk.',
              gate: null,
              sections: [
                { title: 'Response assessment', rn: 'How they answered', sub: 'requirements matrix', score: 8,
                  facts: [['Technical proposal', '58 pages'], ['Requirements matrix', '14 of 14 answered', 'pos'], ['Pricing schedule', 'Submitted · firm 120 days'], ['Security questionnaire', 'SOC 2 Type II + FedRAMP', 'pos'], ['MSA redline', 'Submitted · low-deviation', 'pos'], ['Not submitted', 'None material']],
                  summary: ['Lakehouse returned the most complete and best-evidenced submission in the field: all fourteen requirements answered, an MSA redline supplied, and certifications (SOC 2 Type II, FedRAMP Moderate) attached rather than promised. The self-scores are more conservative than Nimbus’s, which reads as an incumbent’s caution rather than a weakness, and every claim is backed by a document.'],
                  read: [{ cls: 'pos', html: '<b>Most complete pack</b> in the field; nothing material missing.' }, { cls: 'pos', html: '<b>Claims are evidenced,</b> not asserted; certifications attached.' }, { cls: 'watch', html: '<b>Conservative self-scoring;</b> confirm the few 3s are floors, not ceilings.' }],
                  deeper: 'Completeness is itself a differentiator here: where Nimbus leaves three high-value artefacts out, Lakehouse supplies them, which lowers execution risk before a single clarification is sent. The conservative self-scoring is worth probing only to confirm the mid-scored areas are honest floors; nothing in the pack suggests inflation.' },
                { title: 'Solution architecture', rn: 'Platform & data model', sub: 'how it is built', hint: 'Proposal pp. 10–24', score: 8,
                  summary: ['A mature, cloud-native platform with a broad open API surface and a governed semantic layer. Data modeling, ETL and self-service are all strong and well-documented. It is a notch behind Nimbus on self-service UX polish and feature velocity, but ahead on operational maturity and the breadth of what is generally available today rather than on a roadmap.'],
                  read: [{ cls: 'pos', html: '<b>Mature, broad, generally available</b>, little is roadmap-deferred.' }, { cls: 'pos', html: '<b>Governed semantic layer</b> and open APIs fit the Lilly estate.' }, { cls: 'watch', html: '<b>Self-service UX trails Nimbus;</b> weigh polish against maturity.' }],
                  deeper: 'The architecture trade against Nimbus is maturity versus polish. Lakehouse ships more of its capability today and has operated it at scale, which de-risks delivery; Nimbus has the better UX and faster cadence. For a regulated, multi-year commitment the maturity premium is defensible, and it is why this section grades close to the top despite lacking Nimbus’s flourish.' },
                { title: 'Integration', rn: 'Connectivity & SSO', sub: 'fit to the Lilly estate', hint: 'Proposal pp. 25–31', score: 7,
                  facts: [['APIs', 'Mature open REST/GraphQL', 'pos'], ['Identity', 'Native Entra SSO / SCIM', 'pos'], ['SAP / S4HANA', 'Via certified partner'], ['Throughput evidence', 'Reference benchmarks cited', 'pos']],
                  summary: ['A mature open API surface with native Entra SSO, and SAP / S4HANA delivered through a certified partner with reference throughput benchmarks cited from existing deployments. That is a stronger evidentiary position than Nimbus on SAP, though the partner-delivered path means a third party sits in the integration chain and should be named and contracted explicitly.'],
                  read: [{ cls: 'pos', html: '<b>Native Entra SSO</b> plus cited SAP benchmarks beats an unproven middleware path.' }, { cls: 'watch', html: '<b>Certified partner delivers SAP;</b> confirm it is named and under contract.' }, { cls: 'pos', html: '<b>Mature open APIs</b> across the estate.' }],
                  deeper: 'Lakehouse’s SAP story is evidence-backed where Nimbus’s is not, which is the main reason it out-scores Nimbus on integration. The residual question is contractual, not technical: make sure the certified partner is named, its SLAs flow through to Lilly, and its benchmarks reflect Lilly-scale volumes rather than a smaller reference site.' },
                { title: 'Implementation plan', rn: 'Delivery approach', sub: 'how they stand it up', hint: 'Proposal pp. 32–38', score: 7,
                  summary: ['A fixed-scope onboarding with a defined phase plan, named milestones and certified-partner delivery. It is more rigorous than Nimbus’s workstream-level plan, with clearer gates, though it still stops short of a fully resource-loaded schedule and explicit GxP-validation steps.'],
                  read: [{ cls: 'pos', html: '<b>Defined phase plan with gates;</b> more rigorous than the field.' }, { cls: 'watch', html: '<b>Not fully resource-loaded;</b> and GxP-validation steps are light.' }, { cls: 'pos', html: '<b>Certified-partner delivery</b> with named milestones.' }],
                  deeper: 'This is the best implementation plan in the field on structure, which is why it grades above Nimbus. The two things to press are the same for any vendor here: a resource-loaded schedule against named roles, and explicit computer-system-validation gates for the regulated environment.' },
                { title: 'Commercial offer', rn: 'Price & terms', sub: 'what it costs', hint: 'Pricing schedule', score: 6,
                  priceblk: { pn: '$1,060,000', unit: '/yr', psub: '<b style="color:var(--pri-tx)">10.2% below</b> the $1.18M list, held firm for 120 days. The highest annual price in the field.', terms: [['Model', 'Platform subscription (3-yr)'], ['Implementation', '$340K (T&M est.)'], ['Term / escalator', '3 yr · CPI, capped 4%/yr'], ['Est. 3-yr TCO', '~$3.6M']] },
                  summary: ['The offer is a three-year platform subscription at $1.06M/yr, a 10.2% discount off a $1.18M list, held firm for 120 days, with implementation quoted on a time-and-materials estimate of $340K. It is the highest annual price and the shallowest discount in the field, and the T&M implementation basis leaves delivery cost less certain than a fixed fee.'],
                  read: [{ cls: 'watch', html: '<b>Highest price, shallowest discount</b> in the field.' }, { cls: 'watch', html: '<b>T&M implementation</b> is less certain than a fixed fee; ask for a cap.' }, { cls: 'pos', html: '<b>120-day price hold</b> gives negotiating room.' }],
                  deeper: 'Price is Lakehouse’s clear weakness against Nimbus, roughly $80K/yr higher with a much smaller headline discount, and the T&M implementation adds cost uncertainty. The offsetting value is conformance and assurance, which Nimbus cannot yet match. If Lakehouse becomes the pick, the levers are a firmer implementation cap and a deeper subscription discount using the 120-day hold.' },
                { title: 'Product demo', rn: 'What they showed', sub: 'capability evidence', hint: 'Live · 45 min', score: 7,
                  summary: ['A 45-minute live demo run against a representative dataset, covering the governed semantic layer, access controls and SAP-connected reporting through the certified partner. It was live rather than recorded, which is stronger evidence than Nimbus’s recorded walkthrough, though it was not run against a Lilly-specific scenario.'],
                  read: [{ cls: 'pos', html: '<b>Live, not recorded;</b> stronger evidence of real capability.' }, { cls: 'pos', html: '<b>Showed SAP-connected reporting</b> through the partner path.' }, { cls: 'watch', html: '<b>Not a Lilly scenario;</b> a scoped POC would still add value.' }],
                  deeper: 'A live demo that exercises the partner SAP path is meaningful corroboration of the integration claims, and it is why the demo grades solidly. The remaining gap is Lilly-specificity: a short POC on a real workload would convert strong general evidence into decisive evidence.' },
                { title: 'Security & compliance', rn: 'Controls & certifications', sub: 'the field’s strongest', hint: 'Security questionnaire', score: 9,
                  facts: [['Encryption', 'At rest + in transit', 'pos'], ['Access / SSO', 'Entra SSO · RBAC', 'pos'], ['SOC 2', 'Type II · current', 'pos'], ['FedRAMP', 'Moderate', 'pos'], ['EU residency', 'Evidenced', 'pos']],
                  summary: ['The strongest security posture in the field, and fully evidenced: a current SOC 2 Type II report, FedRAMP Moderate authorization, encryption and Entra SSO all in place, and EU data residency evidenced with a hosting attestation. This is exactly the Must-Have that gates Nimbus, and Lakehouse clears it outright.'],
                  read: [{ cls: 'pos', html: '<b>SOC 2 Type II current + FedRAMP Moderate;</b> clears the gate outright.' }, { cls: 'pos', html: '<b>EU residency evidenced,</b> not asserted.' }, { cls: 'pos', html: '<b>Full baseline controls</b> in place and documented.' }],
                  deeper: 'This section is the crux of the whole field comparison: the certification that bars Nimbus is one Lakehouse already holds. It is the single strongest reason Lakehouse is the conforming benchmark and the fallback recommendation, and it needs no clarification.' },
                { title: 'MSA & legal terms', rn: 'Contractual position', sub: 'distance to signature', hint: 'Contract posture', score: 8,
                  summary: ['Lakehouse submitted an MSA redline against Lilly Master Procurement Terms 5.0 assessed as low-deviation, among the cleaner legal postures in the field. The liability and data-protection positions are close to Lilly’s standard, and there is an existing analytics-pilot MSA on file that de-risks contracting further.'],
                  read: [{ cls: 'pos', html: '<b>Redline submitted, low-deviation;</b> a markup, not a negotiation.' }, { cls: 'pos', html: '<b>Existing MSA on file</b> shortens the contracting path.' }, { cls: 'watch', html: '<b>Confirm the residual clauses</b> close inside standard legal review.' }],
                  deeper: 'This is the opposite of Nimbus’s legal position: an engaged redline plus an existing contract means Lakehouse is the closest to signature in the field. It is a genuine schedule advantage if timeline matters, and it needs only standard legal review to close.' },
                { title: 'References & regulated fit', rn: 'Proof at Lilly’s context', sub: 'is it proven where it matters', hint: 'Reference set', score: 8,
                  summary: ['Lakehouse supplied a strong regulated-industry reference base, including life-sciences and other inspection-exposed deployments at comparable scale. Unlike Nimbus, its regulated-analytics fit is demonstrated rather than asserted, which materially lowers the proof risk on a multi-year Lilly commitment.'],
                  read: [{ cls: 'pos', html: '<b>Regulated-industry references,</b> including life-sciences.' }, { cls: 'pos', html: '<b>Fit is demonstrated,</b> not asserted; low proof risk.' }, { cls: 'watch', html: '<b>Confirm at least one reference</b> matches Lilly’s scale and controls.' }],
                  deeper: 'Regulated references are the second pillar (with security) of Lakehouse’s conforming case: it has operated where Lilly operates. That closes the exact proof gap that most weakens Nimbus, and it is why references grade near the top here.' }
              ],
              profile: { score: 9,
                risk: [{ cat: 'Financial', tx: 'Public company, $410M revenue, audited statements available.', sev: 'ok', sevlabel: 'Clear' }, { cat: 'Continuity', tx: 'Established, profitable, NASDAQ-listed.', sev: 'ok', sevlabel: 'Clear' }, { cat: 'Legal', tx: 'No material litigation on public record.', sev: 'ok', sevlabel: 'Clear' }, { cat: 'Security', tx: 'SOC 2 Type II and FedRAMP; no disclosed breach.', sev: 'ok', sevlabel: 'Clear' }, { cat: 'Concentration', tx: 'Broad regulated-industry base, including life-sciences.', sev: 'ok', sevlabel: 'Clear' }],
                read: 'An established, public, profitable incumbent with audited financials, full assurance certifications and a regulated-industry reference base. This is the low-risk profile in the field on every public marker. The trade against Nimbus is price and self-service polish, not stability: where Nimbus carries continuity and assurance questions, Lakehouse carries none.' },
              overall: {
                take: '<b>The clean conforming alternative to Theo&rsquo;s recommendation.</b> Lakehouse holds the field&rsquo;s strongest security and reference posture and is closest to signature, and clears every Must-Have. Nimbus outscores it on capability and price and is Theo&rsquo;s advisory recommendation on panel score, with its SOC 2 Type II gate flagged, not a demotion. Lakehouse is the pick if the panel prefers to avoid that gate risk rather than accept it or wait on remediation.',
                narr: ['Lakehouse is the safe, conforming choice. It is the only bidder that both clears every Must-Have and evidences it, pairing a current SOC 2 Type II and FedRAMP with a strong regulated-industry reference base and the cleanest legal posture in the field. On execution risk it is the lowest of the three.', 'What it gives up to Nimbus is real but bounded: a higher price (about $80K/yr more on a shallower discount), less self-service polish, and a lower panel-weighted score. None of these is a gate. The decision is therefore a straight comparison the panel can make on the evidence: Nimbus’s capability and price against Lakehouse’s conformance and certainty, with Nimbus’s open gate as the tiebreaker.'],
                steps: [{ pr: 'High', prcls: 'g', cat: 'Commercial · price', q: 'Use the 120-day hold to close the price gap to Nimbus: a deeper subscription discount and a fixed (not T&M) implementation cap.' }, { pr: 'Medium', prcls: 'm', cat: 'Integration · SAP partner', q: 'Name the certified SAP partner, confirm its SLAs flow through to Lilly, and confirm the cited throughput benchmarks reflect Lilly-scale volumes.' }, { pr: 'Medium', prcls: 'm', cat: 'Implementation · schedule', q: 'Provide a resource-loaded schedule against named roles and explicit GxP computer-system-validation gates.' }],
                close: 'Lakehouse needs no gate cleared, which makes it the low-risk alternative to Nimbus, Theo&rsquo;s recommendation on panel score. The choice between them is the panel&rsquo;s business call: accept Nimbus&rsquo;s open SOC 2 gate risk (or wait on remediation), or select Lakehouse for certainty.' },
              strengths: ['Clears every Must-Have; the only fully conforming bidder with evidence.', 'Field-strongest security: current SOC 2 Type II plus FedRAMP Moderate.', 'Strong regulated-industry reference base, including life-sciences.', 'Cleanest legal posture and an existing MSA on file; closest to signature.'],
              concerns: [{ i: '!', html: 'Highest annual price and shallowest discount in the field.' }, { i: '!', html: 'Self-service UX and feature velocity trail Nimbus.' }, { i: '!', html: 'SAP delivered via a certified partner rather than natively.' }, { i: '!', html: 'Implementation quoted on a T&M basis; delivery cost less certain.' }],
              scorecard: [['Security & compliance', 9, 'Current SOC 2 Type II plus FedRAMP Moderate, EU residency evidenced; clears the Must-Have gate outright.'], ['Requirements matrix', 8, 'All 14 answered and evidenced with certifications and a redline attached; the most complete pack.'], ['Solution architecture', 8, 'Mature, generally-available cloud-native platform; trails Nimbus on self-service polish, ahead on operational maturity.'], ['MSA / legal', 8, 'Low-deviation redline against Lilly MPT 5.0 plus an existing MSA on file; closest to signature.'], ['References', 8, 'Strong regulated-industry base including life-sciences; regulated fit demonstrated, not asserted.'], ['Integration', 7, 'Native Entra SSO plus certified-partner SAP with cited throughput benchmarks; partner should be named and contracted.'], ['Implementation plan', 7, 'Defined phase plan with gates and certified-partner delivery; not fully resource-loaded, GxP steps light.'], ['Product demo', 7, 'Live 45-minute demo including SAP-connected reporting; not run against a Lilly scenario.'], ['Vendor profile / financials', 9, 'Public, profitable, $410M revenue with audited statements; lowest-risk profile in the field.'], ['Commercial / pricing', 6, 'Highest annual price and shallowest discount; T&M implementation adds cost uncertainty.']]
            } },
          { n: 'Helio Warehouse', contact: 'Theo Vance', email: 'theo.vance@heliowh.com', landscapeScore: 3.8, mustFail: [],
            rq: { r1: 3, r2: 3, r3: 2, r4: 4, r5: 3, r6: 5, r7: 4, r8: 4, r9: 3, r10: 5, r11: 3, r12: 5, r14: 3 },
            pricing: { model: 'Consumption / usage-based', annual: 'Not submitted', list: 'Not submitted', discount: 'Not submitted', impl: 'Not submitted', terms: 'Not submitted', escalator: 'Not submitted', binding: 'No' },
            profile: { hq: 'Austin, USA', founded: '2009', employees: '1,050', revenue: 'Not disclosed (private)', ownership: 'Private', analyst: 'Gartner Challenger (2024)',
              strengths: ['Native SAP / legacy integration depth', 'Lowest run-cost via consumption economics', 'Strong query throughput at very large scale'],
              weaknesses: ['Did not submit a full commercial proposal', 'Self-service analytics UX lags the field', 'Left the AI-roadmap requirement unanswered'],
              redFlags: ['Commercial submission incomplete, pricing shows Not submitted across the board'] },
            narr: { legal: 'No MSA redlines submitted in this run; contract risk cannot be assessed until legal materials are provided.', impl: 'No formal implementation plan submitted; delivery typically via in-house consultants.', integ: 'Native SAP / S4HANA adapters, the strongest integration posture in the field given the Lilly SAP backbone.' },
            lilly: { relationship: 'Registered supplier; 1 expired order on file', spend: null, tprm: { status: 'not-started' }, defender: { count: 1, recoverable: null } },
            report: {
              pill: 'Incomplete bid · not scored on price', stage: 'Evaluation · panel scoring in progress',
              lede: '<b>The strongest SAP integration in the field, attached to an incomplete bid.</b> Helio brings native SAP / S4HANA adapters and the lowest run-cost economics, but it <span class="em">submitted no price, no MSA and no implementation plan</span>, left the AI-roadmap requirement unanswered, and trails the field on coverage at <span class="em">43%</span>. It is not a contender on today’s evidence until the submission is completed.',
              gate: '<b>Incomplete commercial submission.</b> Helio provided no price, no MSA redline and no implementation plan, and left one requirement unanswered. It cannot be scored on cost or contracted until these are provided.',
              sections: [
                { title: 'Response assessment', rn: 'How they answered', sub: 'requirements matrix', score: 5,
                  facts: [['Technical proposal', '31 pages'], ['Requirements matrix', '13 of 14 answered', 'em'], ['Pricing schedule', 'Not submitted', 'em'], ['MSA redline', 'Not submitted', 'em'], ['Implementation plan', 'Not submitted', 'em'], ['Unanswered', 'AI roadmap requirement', 'em']],
                  summary: ['Helio’s submission is partial. The technical response is competent where it is present, with genuine depth on integration and throughput, but the commercial schedule, the MSA and the implementation plan were all left blank, and the AI-roadmap requirement was not answered at all. What is on the page is credible; the problem is how much is missing.'],
                  read: [{ cls: 'pos', html: '<b>Real technical depth</b> where the response is present.' }, { cls: 'gap', html: '<b>Price, MSA and implementation plan all absent.</b>' }, { cls: 'gap', html: '<b>One requirement unanswered</b> (AI roadmap).' }],
                  deeper: 'The completeness gap is decisive, not cosmetic: without a price Helio cannot be compared on cost, without an MSA its contract risk cannot be assessed, and without an implementation plan its delivery cannot be judged. These are not clarifications so much as missing bid sections, and until they arrive Helio cannot be ranked against Nimbus or Lakehouse on anything but capability.' },
                { title: 'Integration', rn: 'Connectivity & SSO', sub: 'the field’s strongest', hint: 'Proposal pp. 6–14', score: 9,
                  facts: [['SAP / S4HANA', 'Native adapters', 'pos'], ['Legacy systems', 'Deep native connectors', 'pos'], ['Throughput', 'Benchmarked at very large scale', 'pos'], ['Identity', 'SSO supported']],
                  summary: ['This is Helio’s standout. It offers native SAP / S4HANA adapters rather than a middleware or partner path, plus deep connectors into legacy systems, and it cites throughput benchmarks at very large scale. Given the Lilly SAP backbone, this is the strongest integration posture in the field by a clear margin.'],
                  read: [{ cls: 'pos', html: '<b>Native SAP / S4HANA adapters</b>, best in the field for the Lilly backbone.' }, { cls: 'pos', html: '<b>Benchmarked throughput</b> at very large scale.' }, { cls: 'watch', html: '<b>Confirm SSO and residency</b> match the estate’s requirements.' }],
                  deeper: 'Helio solves natively the exact problem that most weakens Nimbus and that Lakehouse handles through a partner. If the rest of the bid were complete, this section alone would make it a serious contender, and it is the strongest reason to keep Helio in the field long enough to complete its submission.' },
                { title: 'Solution architecture', rn: 'Platform & data model', sub: 'how it is built', hint: 'Proposal pp. 15–22', score: 6,
                  summary: ['A capable warehouse with strong query performance at very large scale and consumption-based economics that produce the lowest run cost in the field. The weakness is at the consumption layer: the self-service analytics UX lags the field, and the AI / roadmap story is thin, with the roadmap requirement left unanswered.'],
                  read: [{ cls: 'pos', html: '<b>Strongest throughput at scale</b> and lowest run-cost economics.' }, { cls: 'watch', html: '<b>Self-service UX lags</b> Nimbus and Lakehouse.' }, { cls: 'gap', html: '<b>AI / roadmap requirement unanswered.</b>' }],
                  deeper: 'The engine is strong; the experience and forward story are not. For a platform meant to serve self-service analytics broadly, the UX gap is material, and the unanswered roadmap requirement leaves a hole in the evaluation that has to be filled before the section can be graded up.' },
                { title: 'Commercial offer', rn: 'Price & terms', sub: 'not submitted', hint: 'Pricing schedule', score: 2,
                  summary: ['No commercial proposal was submitted. Every pricing field, model, annual fee, list, discount, implementation and term, reads “Not submitted”. Helio indicated a consumption / usage-based model and asked (open question Q3) whether a consumption estimate may be provided in place of a fixed annual fee, but no numbers accompanied the response.'],
                  read: [{ cls: 'gap', html: '<b>No price submitted;</b> cannot be scored or compared on cost.' }, { cls: 'watch', html: '<b>Consumption model signalled</b> but unquantified.' }, { cls: 'gap', html: '<b>No TCO can be modelled</b> until an estimate arrives.' }],
                  deeper: 'This is the single largest gap in Helio’s bid. Consumption pricing can be attractive at Helio’s run-cost, but without an estimate it is impossible to model TCO or compare against Nimbus and Lakehouse. A consumption estimate against a defined Lilly workload profile is the minimum needed to bring Helio onto the price axis at all.' },
                { title: 'Implementation plan', rn: 'Delivery approach', sub: 'not submitted', hint: 'Proposal', score: 3,
                  summary: ['No formal implementation plan was submitted. The response notes that delivery is typically handled by Helio’s in-house consultants, but provides no phase plan, no timeline, no named team and no acceptance criteria. Delivery capacity and approach therefore cannot be assessed.'],
                  read: [{ cls: 'gap', html: '<b>No formal plan;</b> delivery cannot be assessed.' }, { cls: 'watch', html: '<b>In-house delivery</b> asserted but unspecified.' }, { cls: 'gap', html: '<b>No timeline, team or acceptance gates.</b>' }],
                  deeper: 'As with pricing, this is a missing bid section rather than a weak one. There is nothing to evaluate. A phased plan with a named team, timeline and acceptance gates is required before delivery risk can be judged at all.' },
                { title: 'Security & compliance', rn: 'Controls & certifications', sub: 'baseline only', hint: 'Security questionnaire', score: 5,
                  summary: ['The questionnaire indicates baseline controls, encryption and access management, are in place, but formal certifications were not evidenced in this run. No Must-Have security gap is recorded, but the assurance position is documented more thinly than either Nimbus or Lakehouse.'],
                  read: [{ cls: 'pos', html: '<b>Baseline controls</b> indicated in the questionnaire.' }, { cls: 'watch', html: '<b>Certifications not evidenced;</b> request SOC 2 status.' }, { cls: 'watch', html: '<b>Residency and audit rights</b> undocumented.' }],
                  deeper: 'Security is under-documented rather than failing. Before Helio could advance, it would need to evidence its certification status and residency controls to the standard Lakehouse already meets and Nimbus is being pressed on.' },
                { title: 'References & regulated fit', rn: 'Proof at Lilly’s context', sub: 'thinly evidenced', hint: 'Reference set', score: 5,
                  summary: ['References were provided but are thin on regulated-industry relevance. Helio’s strength is technical scale rather than pharma or GxP deployment, so regulated fit is only partly evidenced, similar to Nimbus but without Nimbus’s completeness elsewhere.'],
                  read: [{ cls: 'watch', html: '<b>References present</b> but light on regulated industries.' }, { cls: 'pos', html: '<b>Scale references</b> support the throughput claims.' }, { cls: 'watch', html: '<b>A POC</b> would evidence regulated fit.' }],
                  deeper: 'The reference set corroborates Helio’s scale and integration strengths but not its fit for a validated, inspection-exposed environment. Given the incomplete bid overall, references are a secondary concern behind the missing price, MSA and plan.' },
                { title: 'MSA & legal terms', rn: 'Contractual position', sub: 'not submitted', hint: 'Contract posture', score: 2,
                  summary: ['No MSA redlines were submitted. Contract risk cannot be assessed until legal materials are provided, and there is no basis in the current submission to judge distance to signature.'],
                  read: [{ cls: 'gap', html: '<b>No redlines;</b> contract risk cannot be assessed.' }, { cls: 'gap', html: '<b>No basis to judge</b> distance to signature.' }, { cls: 'watch', html: '<b>Legal materials required</b> before any contracting.' }],
                  deeper: 'Like price and implementation, the legal position is simply absent. This is the third missing bid section, and together the three make Helio uncontractable on today’s submission regardless of its integration strength.' }
              ],
              profile: { score: 4,
                risk: [{ cat: 'Submission', tx: 'Commercial, legal and implementation sections all incomplete.', sev: 'hi', sevlabel: 'Elevated' }, { cat: 'Financial', tx: 'Revenue not disclosed; privately held, no audited statements provided.', sev: 'mid', sevlabel: 'Watch' }, { cat: 'Continuity', tx: 'Established 2009, ~1,050 employees; privately held.', sev: 'ok', sevlabel: 'Clear' }, { cat: 'Legal', tx: 'No MSA redlines submitted; contract risk cannot be assessed.', sev: 'mid', sevlabel: 'Watch' }, { cat: 'Security', tx: 'Baseline controls; certifications not evidenced in this run.', sev: 'mid', sevlabel: 'Watch' }],
                read: 'Helio is a capable, privately-held vendor with genuine integration and scale strengths, but its public and submission profile is the least complete in the field. The undisclosed financials and the missing commercial, legal and implementation sections mean risk cannot be fully assessed. The profile is not disqualifying on its own, but combined with the incomplete bid it puts Helio behind the field pending a completed submission.' },
              overall: {
                take: '<b>Not a contender on today’s evidence, but worth keeping alive for its integration strength.</b> Helio has the best SAP posture in the field and the lowest run-cost, yet it submitted no price, no MSA and no implementation plan and left a requirement unanswered. It cannot be ranked or contracted until the submission is completed.',
                narr: ['On capability Helio has a genuine, field-leading strength: native SAP / S4HANA integration against the exact backbone Lilly runs, plus consumption economics that would be the cheapest to operate. In a complete bid that combination would make it a real third option.', 'But the bid is not complete. With no price it cannot be compared on cost, with no MSA its contract risk is unknown, and with no implementation plan its delivery cannot be judged; on top of that it trails the field on coverage and left the AI-roadmap requirement unanswered. The right posture is to request the missing sections and re-evaluate, rather than to rank Helio against Nimbus and Lakehouse on a partial submission.'],
                steps: [{ pr: 'Gating', prcls: 'g', cat: 'Commercial · pricing', q: 'Submit a commercial proposal, a consumption estimate against a defined Lilly workload profile is acceptable, so the bid can be scored on cost and TCO modelled.' }, { pr: 'Gating', prcls: 'g', cat: 'Legal · MSA', q: 'Provide MSA redlines against Lilly Master Procurement Terms 5.0 so contract risk can be assessed.' }, { pr: 'High', prcls: 'g', cat: 'Implementation · plan', q: 'Provide a phased implementation plan with a named team, timeline and acceptance gates.' }, { pr: 'High', prcls: 'g', cat: 'Requirements · AI roadmap', q: 'Answer the unanswered AI / roadmap requirement so coverage can be re-scored.' }],
                close: 'Complete the four items above and Helio becomes a genuine third option on the strength of its integration; until then it cannot be ranked against the field and is not recommendable.' },
              strengths: ['Native SAP / S4HANA adapters, the strongest integration posture in the field.', 'Lowest run-cost via consumption-based economics.', 'Strong query throughput benchmarked at very large scale.'],
              concerns: [{ i: '✗', html: 'No commercial proposal submitted; cannot be scored on cost.' }, { i: '✗', html: 'No MSA redlines; contract risk cannot be assessed.' }, { i: '✗', html: 'No implementation plan; delivery cannot be judged.' }, { i: '!', html: 'Trails the field on coverage (43%); AI-roadmap requirement unanswered.' }],
              scorecard: [['Integration', 9, 'Native SAP / S4HANA adapters and benchmarked throughput; the strongest integration posture in the field.'], ['Solution architecture', 6, 'Strong throughput and lowest run-cost, but self-service UX lags and the roadmap requirement is unanswered.'], ['Requirements matrix', 5, '13 of 14 answered; competent where present but the commercial, legal and implementation sections are blank.'], ['Product demo', 5, 'Limited capability evidence supplied in this run.'], ['Security & compliance', 5, 'Baseline controls indicated but certifications not evidenced.'], ['References', 5, 'References present but thin on regulated-industry relevance.'], ['Vendor profile / financials', 4, 'Private with undisclosed revenue and no audited statements provided.'], ['Implementation plan', 3, 'No formal plan submitted; delivery cannot be assessed.'], ['Commercial / pricing', 2, 'No price submitted; cannot be scored or compared on cost.'], ['MSA / legal', 2, 'No redlines submitted; contract risk cannot be assessed.']]
            } }
        ],
        panel: [
          { n: 'Priya Shah', role: 'Project owner / evaluator', submitted: true, scores: [[5, 5, 4, 5, 4, 4, 4, 4], [4, 4, 5, 4, 4, 4, 4, 5], [3, 3, 3, 4, 3, 5, 3, 3]] },
          { n: 'Aisha Khan', role: 'Functional evaluator', submitted: true, scores: [[5, 4, 4, 5, 4, 3, 5, 4], [4, 4, 5, 4, 4, 4, 3, 4], [3, 3, 2, 4, 3, 5, 3, 2]] },
          { n: 'James Wright', role: 'Security evaluator', scores: null },
          { n: 'Marc Lane', role: 'Sourcing rep (facilitator)', scores: null }
        ],
        me: 3,
        phase: { name: 'Evaluation', phaseIndex: 3, phaseCount: 6, nextMilestone: 'Evaluation complete', daysToNext: 10, deadlineStatus: 'at-risk',
          suppliersTotal: 3, suppliersAwaiting: 0, openQuestions: 2, commsAnomalies: 0, stale: false, judgmentCall: true,
          nextAction: 'Resolve the SOC 2 Type II gating item with Nimbus, or confirm Lakehouse as the gate-pass leader with the panel.' },
        qa: [
          { id: 'Q1', category: 'Security & compliance', from: 'Multiple bidders', question: 'Will a SOC 2 Type II report (not Type I) be required at award, and what remediation window is allowed if certification is still in progress?', status: 'answered', answer: 'SOC 2 Type II is a Must-Have. A Type I plus a dated Type II roadmap may be clarified but does not satisfy the gate at award.' },
          { id: 'Q2', category: 'Integration & architecture', from: 'Nimbus Data', question: 'Is native SAP / S4HANA integration mandatory, or is validated middleware-based integration acceptable?', status: 'answered', answer: 'Middleware is acceptable if validated against the Lilly SAP backbone during the capability demo; native adapters are preferred, not mandatory.' },
          { id: 'Q3', category: 'Total cost (TCO)', from: 'Helio Warehouse', question: 'May commercial pricing be submitted as a consumption-based estimate rather than a fixed annual fee?', status: 'pending', answer: null },
          { id: 'Q4', category: 'Security & compliance', from: 'Lakehouse Co', question: 'Are EU and US data-residency controls both required at go-live, or is a phased rollout acceptable?', status: 'answered', answer: 'Both EU and US residency controls are required at go-live for in-scope employee personal data.' },
          { id: 'Q5', category: 'Operational support', from: 'Multiple bidders', question: 'What uptime SLA and service-credit structure will the final contract require?', status: 'pending', answer: null }
        ]
      },
      thread: [
        { id: 'terms', label: 'Effective terms' },
        { id: 'contract', label: 'Findings' },
        { id: 'obligations', label: 'Obligations' },
        { id: 'renewal', label: 'Renewal' },
        { id: 'savings', label: 'Savings', ext: 'savings.html' }
      ],
      gapThread: {
        'Sub-processors not controlled': { id: 'terms', l: '→ tracked in Terms & Obligations (audit right)' },
        'Uncapped renewal uplift': { id: 'renewal', l: '→ feeds the Renewal recommendation' }
      },
      terms: {
        base: 'MSA · Acme Analytics · executed 2024-08-01',
        amendments: [
          { n: 'Amendment 1', date: '2025-02-14', chg: 'Work Order 2 added, seats 250→400; pricing tier updated.' },
          { n: 'Amendment 2', date: '2025-09-30', chg: 'Term extended 2→3 yrs; renewal-pricing clause replaced.' },
          { n: 'Change Order 3', date: '2026-03-12', chg: 'DPA addendum added (employee PI); sub-processor list appended.' }
        ],
        effective: [
          { term: 'Annual fee', val: '$600K / yr', src: 'Amendment 1', doc: 'Amendment 1', clause: '§2 Pricing', date: '2025-02-14', quote: 'Seats are increased from 250 to 400 and the annual fee is set at $600,000, billed annually in advance.', flag: '' },
          { term: 'Term / expiry', val: '3 yrs → expires 2027-08-01', src: 'Amendment 2', doc: 'Amendment 2', clause: '§1 Term', date: '2025-09-30', quote: 'The Term is extended from two (2) to three (3) years and now expires on 2027-08-01.', flag: '' },
          { term: 'Renewal pricing', val: 'then-current list, UNCAPPED', src: 'Amendment 2', doc: 'Amendment 2', clause: '§3 Renewal', date: '2025-09-30', quote: 'Section 6 (Renewal) of the Base MSA is deleted and replaced: each renewal term prices at Acme\'s then-current list price. (Base MSA had capped renewals at CPI.)', flag: 'drift' },
          { term: 'Liability cap', val: '2× fees (PI breach inside cap)', src: 'Base MSA §4', doc: 'Base MSA', clause: '§4 Limitation of Liability', date: '2024-08-01', quote: 'Except for the excluded claims in §4.3, each party\'s aggregate liability shall not exceed two times (2x) the fees paid in the prior twelve (12) months. No PI carve-out was added.', flag: 'drift' },
          { term: 'Sub-processors', val: 'notice-only', src: 'CO 3 · DPA', doc: 'Change Order 3 · DPA', clause: 'DPA clause 5', date: '2026-03-12', quote: 'Acme may engage sub-processors on prior written notice to Lilly; Lilly may object within ten (10) business days. (No prior-approval right.)', flag: 'drift' },
          { term: 'Data protection', val: 'Lilly DPA + SCCs', src: 'CO 3', doc: 'Change Order 3', clause: 'DPA + Annex II', date: '2026-03-12', quote: 'The Lilly Data Processing Addendum and the EU Standard Contractual Clauses (module 2) are incorporated by reference for all processing of employee personal data.', flag: '' }
        ],
        conflicts: [
          { t: 'Renewal pricing modified twice', d: 'Base MSA capped renewals at CPI; Amendment 2 replaced it with uncapped “then-current list”. The uncapped term governs today, a drift from playbook.', to: 'renewal' },
          { t: 'Liability cap never carved for PI', d: 'CO 3 added PI obligations but §4 was never carved out, PI-breach liability still sits inside the 2× cap.', to: 'contract' }
        ]
      },
      obligations: [
        { ob: 'Non-renewal notice window', type: 'Commercial', party: 'lilly', due: '2027-05-03', days: 111, win: 120, sev: 'high',
          d: '90-day non-renewal notice; the decision window opens 120 days before expiry. Miss it and the contract auto-renews at the uncapped list price.', cons: 'The contract auto-renews at the uncapped then-current list price for a full further term.', action: 'Calendar the 120-day window; decide renew / renegotiate / exit before 2027-05-03.', from: 'Uncapped renewal uplift', links: 'renewal', doc: 'Amendment 2', clause: '§3 Renewal', quote: 'Either party may give notice of non-renewal no later than ninety (90) days before the end of the then-current term.' },
        { ob: 'Sub-processor audit right', type: 'Legal', party: 'lilly', due: '2026-09-15', days: 81, win: 90, sev: 'med',
          d: 'Annual audit right over Acme\'s sub-processors (DPA cl. 7). The exercise window opens in Q3.', cons: 'Un-audited sub-processors keep handling employee PI; residual data risk goes unchecked for another year.', action: 'Exercise the annual audit in Q3 (30-day written notice to Acme).', from: 'Sub-processors not controlled', links: 'contract', doc: 'Change Order 3 · DPA', clause: 'DPA clause 7', quote: 'Lilly may audit Acme\'s sub-processors no more than once per year on thirty (30) days written notice.' },
        { ob: 'SOC 2 Type II report', type: 'Legal', party: 'supplier', due: '2026-07-20', days: 24, win: 30, sev: 'low',
          d: 'Annual SOC 2 Type II report due from Acme; chase if it is not received inside the 30-day window.', cons: 'No current assurance over Acme\'s controls; Lilly may suspend new processing until it is provided.', action: 'Chase Acme if the report is not received inside the 30-day window.', from: null, links: 'contract', doc: 'Base MSA', clause: '§9 Security', quote: 'Acme shall provide its current SOC 2 Type II report annually within thirty (30) days of issuance.' },
        { ob: 'Personal-data breach notification', type: 'Legal', party: 'supplier', due: null, timing: 'Within 24h of discovery', sev: 'high',
          d: 'Acme must notify Lilly within 24 hours of a known personal-data breach. Event-triggered, no calendar date, but a hard 24-hour clock once discovered.', cons: 'Lilly cannot mitigate or meet its own regulator deadlines in time; regulatory and reputational harm.', action: 'Confirm the 24-hour breach-notification path is tested and single-owned on both sides.', from: 'Sub-processors not controlled', links: 'contract', doc: 'Change Order 3 · DPA', clause: 'DPA clause 9', quote: 'Acme shall notify Lilly without undue delay and in any event within twenty-four (24) hours of becoming aware of a Personal Data Breach.' },
        { ob: 'Service-level review (QBR)', type: 'Performance', party: 'mutual', due: '2026-09-30', days: 96, win: 90, sev: 'low',
          d: 'Quarterly review of SLA attainment (uptime >= 99.5%, support response times). Two minor SLA misses in the last 12 months, no escalations.', cons: 'SLA drift goes unreviewed and earned service credits are never claimed.', action: 'Hold the quarterly review; log attainment and any credits due under Annex I.', from: null, links: null, doc: 'Base MSA', clause: '§5 Service Levels', quote: 'The parties shall meet quarterly to review service-level attainment; sustained breach triggers the service credits set out in Annex I.' },
        { ob: 'Insurance certificate refresh', type: 'Financial', party: 'supplier', due: '2026-08-01', days: 36, win: 60, sev: 'med',
          d: 'Updated cyber + E&O certificates are due annually; the current certificate expires 2026-08-01.', cons: 'Coverage cannot be verified; potential uninsured exposure if an incident lands in the gap.', action: 'Request the refreshed cyber + E&O certificate before 2026-08-01.', from: null, links: null, doc: 'Base MSA', clause: '§12 Insurance', quote: 'Acme shall maintain cyber and E&O cover of not less than $5M and furnish certificates of insurance annually.' },
        { ob: 'Annual fee true-up vs CPI cap', type: 'Financial', party: 'lilly', due: '2027-02-14', days: 231, win: 120, sev: 'low',
          d: 'On each anniversary, confirm any fee uplift stays within the negotiated cap (target: CPI or 3%). The current renewal term is uncapped until redlined.', cons: 'An uplift above the intended cap slips through; open-ended cost creep over the term.', action: 'On each anniversary, confirm the uplift stays within CPI / 3%.', from: 'Uncapped renewal uplift', links: 'savings', doc: 'Amendment 1', clause: '§2 Pricing', quote: 'Fees may be adjusted annually; any adjustment shall not exceed the cap in §2.3 (currently uncapped, pending amendment).' },
        { ob: 'Prompt payment of annual invoice', type: 'Financial', party: 'lilly', due: '2026-08-15', days: 50, win: 60, sev: 'low',
          d: 'Lilly pays the annual fee within Net-45 of a valid invoice (billed annually in advance per Amendment 1).', cons: 'Late-payment interest accrues under §2 and strains the relationship at renewal.', action: 'Approve and pay the annual invoice within Net-45 of receipt.', from: null, links: null, doc: 'Amendment 1', clause: '§2 Pricing', quote: 'The annual fee is billed annually in advance and payable within forty-five (45) days of a valid invoice.' },
        { ob: 'Scope / seat change-control', type: 'Commercial', party: 'mutual', due: null, noTimeline: true, sev: 'low',
          d: 'Seat or scope changes should route through a written change order, but the contract sets no cadence or trigger, so mid-term true-ups can happen ad hoc, outside the pricing model.', cons: 'Scope creep and seat true-ups land outside the agreed pricing model; unbudgeted spend.', action: 'Agree a written change-control step and a review cadence, none is set today.', from: null, links: null, doc: 'Base MSA', clause: '§3 Change Control', quote: 'Changes to scope or seat counts shall be documented; no review cadence is specified.' }
      ],
      renewal: {
        expiry: '2027-08-01', window: '> 120 days out',
        spend: '$600K / yr · $1.8M committed (3-yr)',
        perf: 'On-track, 2 minor SLA misses in 12 mo, no escalations.',
        compliance: '1 open protection gap (sub-processor control); DPA in place.',
        market: '2 credible alternatives near parity; switching cost moderate (bespoke HR data mapping).',
        price: 'Uncapped renewal exposes Lilly to open-ended uplift, the last indicative quote implied +9%.',
        recT: 'Renegotiate', rec: 'renegotiate',
        why: 'Strong functional fit + high switching cost argue against recompete, but the uncapped renewal term and the PI-liability gap must be fixed first. Open negotiation at the 120-day window and use the non-renewal notice as leverage.',
        saving: 54000, savingNote: 'modeled if the renewal is CPI-capped (≤3%) vs. the implied +9%.',
        $src: { saving: [stub('Renewal savings model, CPI-cap vs implied uplift (reflect-only)', 1)] },
        executed: false,
        levers: [
          { id: 'cpi', type: 'contract', n: 'CPI-cap the renewal price', on: true, save: 54000, d: 'Replace the uncapped then-current-list renewal with a CPI or 3% cap (vs the implied +9%).' },
          { id: 'mkt', type: 'market', n: 'Competitive tension', on: true, save: 30000, d: 'Use the two near-parity alternatives plus the non-renewal notice as leverage on price.' },
          { id: 'term', type: 'contract', n: 'Longer term for a lower rate', on: false, save: 18000, d: 'Offer a 4-year term in exchange for a step-down on the annual fee.' }
        ],
        matrix: {
          recommendation: 'renegotiate',
          quadrant: 'renegotiate',
          alternative: 'recompete',
          alternativeWhy: 'two near-parity alternatives and an above-market renewal make a competitive recompete the credible fallback',
          renegotiateFocus: ['commercial', 'legal'],
          rationale: 'Performance is adequate and the relationship is worth keeping, but the terms are not, a CPI cap and the sub-processor / PI-liability gap must be fixed before the renewal rolls rather than letting it auto-renew.',
          annualValueUsd: 600000, spendSharePct: 12, complianceGapHighSeverity: true, strategyConflict: false,
          $src: { annualValueUsd: [stub('Contract annual value, reflect-only read of effective terms', 1)], spendSharePct: [stub('Category spend-share, reflect-only estimate', 1)] },
          performance: { axis: 'performance', dims: [
            { key: 'sla', label: 'SLA / KPI achievement', score: 3.5, weight: 0.25, basis: 'measured', factor: 'On-track: 2 minor SLA misses in 12 months, no escalations or credits owed.' },
            { key: 'compliance', label: 'Compliance history', score: 3.0, weight: 0.20, basis: 'measured', factor: '1 open protection gap (sub-processor control is notice-only); DPA otherwise in place and current.' },
            { key: 'pricing', label: 'Pricing position', score: 2.5, weight: 0.20, basis: 'measured', factor: 'Uncapped renewal term; the last indicative implied +9%, above market.' },
            { key: 'responsiveness', label: 'Responsiveness', score: 3.5, weight: 0.15, basis: 'assessed', factor: 'Support responsiveness within tolerance; rated 3.5 of 5.' },
            { key: 'relationship', label: 'Relationship quality', score: 3.5, weight: 0.10, basis: 'assessed', factor: 'Stable 4-year relationship; no escalations in the current term.' },
            { key: 'innovation', label: 'Innovation', score: 3.0, weight: 0.10, basis: 'assessed', factor: 'Roadmap keeps pace; no differentiating innovation vs the alternatives.' }
          ] },
          market: { axis: 'market-attractiveness', dims: [
            { key: 'alternatives', label: 'Alternative count', score: 3.0, weight: 0.25, basis: 'assessed', factor: '2 credible alternatives identified, near parity.' },
            { key: 'switching', label: 'Switching cost', score: 3.0, weight: 0.25, basis: 'assessed', factor: 'Switching cost moderate, bespoke data mapping to unwind (lower cost = easier to move).' },
            { key: 'priceGap', label: 'Price gap', score: 3.5, weight: 0.20, basis: 'measured', factor: 'Renewal running above market; material room to improve on price via a switch.' },
            { key: 'capability', label: 'Capability gap', score: 3.0, weight: 0.15, basis: 'assessed', factor: 'Alternatives comparable in capability; no critical feature lock-in.' },
            { key: 'supply', label: 'Supply conditions', score: 3.0, weight: 0.15, basis: 'assessed', factor: 'Category supply conditions balanced.' }
          ] },
          timing: { asOf: '2026-07-01', expiryISO: '2027-08-01', noticeDays: 90, requiredLeadDays: 90 },
          bundling: { windowMonths: 6, siblings: [
            { id: 'CW-2025-ITAM-204', label: 'ITAM add-on module', expiryISO: '2026-11-15' },
            { id: 'CW-2025-DISC-311', label: 'Discovery / dependency mapping', expiryISO: '2026-09-30' }
          ] }
        }
      }
    },

    // ======================================================================
    // DEAL, pv-08-deal-contract.js. MUTABLE literals (the P4 crux): the page
    // grows cversions.versions each turn, flips paper.onSupplierPaper, re-ties
    // msas[].tied, strips contractComments, refreshes supplierContact on ingest,
    // and clears inbound.pending. projectViewSeed() hands back a fresh clone so
    // every one of these edits lands on the working copy, never this seed.
    // ======================================================================
    deal: {
      cversions: { doc: 'MSA_Acme', repApproved: false, repApprover: 'Marc Lane', closed: false, versions: [
        { v: 'v1', by: 'Lilly · Theo draft', actor: 'Theo (for Marc Lane)', side: 'lilly', chan: 'internal', date: '2026-06-24 14:02', note: 'Initial MSA on Lilly paper with 12 playbook redlines.', hash: 'a3f1c9', sp: 'SP 1.0', st: 'Sent' },
        { v: 'v2', by: 'Acme', actor: 'Sam Rivera · Acme', side: 'supplier', chan: 'graph', date: '2026-06-26 09:18', note: 'Accepted 7, countered 5 (liability cap, sub-processors).', hash: '7b22e4', sp: 'SP 2.0', st: 'Received' },
        { v: 'v3', by: 'Lilly · Theo redline', actor: 'Theo (for Marc Lane)', side: 'lilly', chan: 'internal', date: '2026-06-28 08:40', note: 'Held the 1x liability cap + PI carve-out; conceded the venue.', hash: 'f09a17', sp: 'SP 3.0', st: 'Current' }
      ] },
      supplierContact: { name: 'Sam Rivera', email: 'sam@acme.ai', company: 'Acme Analytics' },
      contractComments: [
        { who: 'Marc Lane', txt: 'Hold the 1x liability cap; do not signal any flexibility here.', aud: 'internal' },
        { who: 'Leah Carter', txt: 'Fallback on sub-processors is prior-approval, else a 10-day objection window.', aud: 'internal' },
        { who: 'Theo', txt: 'Proposed a neutral venue (Delaware) per the playbook.', aud: 'supplier' }
      ],
      replyRedlines: [
        { pt: '§4 Liability cap', move: 'Held at 1x fees with PI-breach carved out' },
        { pt: '§11 Sub-processors', move: 'Added a prior-approval right + annual audit' },
        { pt: '§3 Renewal pricing', move: 'Proposed a CPI / 3% cap (was uncapped)' },
        { pt: '§18 Governing law', move: 'Conceded a neutral venue (Delaware)' }
      ],
      paper: { onSupplierPaper: true, deviations: [
        { sec: 'Limitation of liability', supplier: 'Mutual cap at 1x fees, no PI carve-out', lilly: '1x cap with PI-breach carved OUT of the cap', sev: 'high' },
        { sec: 'IP ownership', supplier: 'Acme retains all models trained on Lilly data', lilly: 'Lilly owns outputs derived from Lilly data', sev: 'high' },
        { sec: 'Data protection', supplier: 'Acme standard DPA', lilly: 'Lilly DPA + EU SCCs (employee PI)', sev: 'high' },
        { sec: 'Governing law / venue', supplier: 'California (Acme home)', lilly: 'Delaware (neutral) or Indiana', sev: 'med' },
        { sec: 'Termination', supplier: 'For cause only, 90-day cure', lilly: 'Adds termination for convenience, 30-day notice', sev: 'med' }
      ] },
      msas: [
        { id: 'msa-acme-2024', name: 'Acme MSA (2024)', scope: 'Analytics + data services', status: 'Active', match: true, tied: true },
        { id: 'msa-acme-emea', name: 'Acme MSA - EMEA (2023)', scope: 'EU entities only', status: 'Active', match: false, tied: false }
      ],
      inbound: { pending: true, from: { name: 'Sam Rivera', email: 'sam@acme.ai' }, received: 'today · 9:12 AM',
        attachment: 'MSA_Acme_Acme-redline.docx', matchedProject: 'P-1042 · Acme Analytics',
        matchBy: 'sender sam@acme.ai matches the Acme contact on this active project', onSupplierPaper: true }
    }
  };

  // ======================================================================
  // P4/#132, remaining pv business-data slices (relocated from the pv modules,
  // read back via Theo.data.projectViewSeed()). landscape (pv-02) · neg (pv-11) ·
  // commercial (pv-12) · reviewRenew (pv-13) · docsComms (pv-14) · boot (pv-01).
  // Illustrative reflect-only mock; mutable literals land on the clone, seed stays pristine.
  // ======================================================================
  S.projectView.landscape = [
 {n:'Acme Analytics',id:'acme_a',incumbent:true,sub:'Incumbent candidate · sole-source under review',fit:88,fitc:'hi',
  note:'Purpose-built AI employee-analytics platform; SOC 2 Type II (self-reported), Entra SSO, US hosting. Strongest functional fit; the only candidate already mapped to Lilly\'s HR data model.',
  tags:['credible public sources · not validated','SOC 2 (self-reported)','US · AWS'],
  reqFit:{people:5,integ:4,privacy:4,security:4,adoption:4,commercial:4},
  risk:{security:2,privacy:3,financial:3,lockin:2,support:2},flags:[],
  subFit:{people:{pe_model:4.8,pe_metrics:4.6,pe_predict:4.5,pe_viz:4.4,pe_dei:4.3},integ:{ig_hris:4.5,ig_api:4.2,ig_ats:4.3,ig_payroll:4.0,ig_export:3.6},privacy:{pr_pi:4.4,pr_consent:4.1,pr_resid:3.0,pr_reten:4.0,pr_anon:4.1},security:{sc_soc2:4.2,sc_iso:2.8,sc_sso:4.5,sc_enc:4.4,sc_audit:4.1},adoption:{ad_ux:4.5,ad_nl:4.2,ad_mobile:4.0,ad_enable:4.3},commercial:{co_lic:3.9,co_impl:4.2,co_run:3.8,co_flex:3.6}},
  riskSub:{security:{k_breach:1.4,k_cert:2.4,k_pi:1.8,k_vuln:2.0},privacy:{kp_gdpr:2.6,kp_council:2.6,kp_resid:2.9},financial:{kf_scale:3.2,kf_runway:2.9,kf_owner:2.6},lockin:{kl_portab:2.3,kl_exit:2.6,kl_eco:2.1},support:{ks_sla:2.0,ks_cover:2.3,ks_ir:2.0}},
  riskNarr:{security:'SOC 2 Type II is self-reported rather than independently attested, and ISO 27001 is not held; no public breach is on record and pen-test cadence looks adequate. The certification gap is the item to close before award.',privacy:'A US-only hosting footprint is the main privacy watch: EU employee data would need a residency and transfer story, and works-council notification is unproven for a bespoke people-analytics deployment.',financial:'The smallest, most specialised vendor in the field; a plausible external read puts revenue well under $100M with venture backing, so scale and runway carry a moderate watch across a multi-year term.',lockin:'The bespoke HR data mapping is the switching cost that makes this a sole-source candidate; export and exit terms should be negotiated up front so the mapping stays portable.',support:'Support is responsive at Lilly\'s scale today; 24x7 global coverage and formal incident-response RCA depth should be pinned in the expansion schedule.'},
  riskSubNarr:{security:{k_breach:'No public breach or material incident on record; a clean history holds this low.',k_cert:'SOC 2 Type II is self-reported and ISO 27001 is not held, the field-high certification watch, to be closed by an independent attestation before award.',k_pi:'Employee-PI handling is purpose-built and looks sound, with only routine residual exposure.',k_vuln:'Vulnerability management and pen-test cadence appear adequate for the estate.'},privacy:{kp_gdpr:'US-only hosting raises a GDPR transfer question for EU employee data that a DPA and SCCs would need to close.',kp_council:'Works-council / co-determination handling is unproven for a bespoke deployment; a mild elevated watch in EU entities.',kp_resid:'No EU data-residency region today; residency for EU employee data is the open privacy item.'},financial:{kf_scale:'A small, specialised vendor well under $100M on an illustrative external read; scale is the elevated factor.',kf_runway:'Venture-backed with adequate but not deep runway; a mild watch across a multi-year commitment.',kf_owner:'Independent, VC-backed ownership is stable but concentrated.'},lockin:{kl_portab:'The bespoke HR mapping should be made contractually portable so export is not blocked.',kl_exit:'Exit and data-egress terms are standard supplier paper and must be negotiated up front.',kl_eco:'A single specialised vendor for people analytics is a manageable concentration.'},support:{ks_sla:'SLA guarantees are workable today; specific uptime credits to be pinned in the schedule.',ks_cover:'24x7 global coverage should be validated beyond the current US business-hours pattern.',ks_ir:'Incident-response and RCA processes exist; RCA depth is the item to confirm.'}},
  financials:{revenue:'Illustrative: est. <$100M revenue (external estimate · not validated)',growth:'Illustrative: ~40% YoY (early-growth · not validated)',margin:'Illustrative: SaaS gross margin ~70% (not validated)',arr:'Illustrative: ARR in the tens of millions (not validated)',cash:'Illustrative: VC-backed; adequate runway (not validated)',guidance:'Private; no public guidance'},
  deepDive:{
   overview:'Acme Analytics is a purpose-built AI employee-analytics / people-analytics platform, the incumbent candidate under a sole-source review. It already carries a bespoke mapping to Lilly\'s HR data model, which is the core reason the engagement is framed sole-source rather than competitive.',
   identity:{legal:'Acme Analytics, Inc.',parent:'Independent / VC-backed (no ultimate parent)',ownership:'Private · VC-backed',ticker:null,jurisdiction:'Delaware, US',confidence:'Confirmed',delivery:'Managed cloud SaaS (US · AWS)'},
   offerings:[{name:'Acme People Analytics',note:'Core workforce analytics and dashboards over an employee/org data model.'},{name:'Acme Attrition AI',note:'Predictive attrition / flight-risk and driver analysis.'},{name:'Acme DEI & Pay Equity',note:'Diversity, pay-equity and representation analytics.'},{name:'Acme Connect',note:'HRIS / ATS / payroll connectors and the Lilly HR-model mapping.'}],
   news:[{date:'2026-04',headline:'Ships a natural-language "ask your workforce data" feature',note:'Illustrative; strengthens the self-service story.'},{date:'2026-01',headline:'Raises a growth round from existing VC backers',note:'Illustrative external read; not validated.'},{date:'2025-09',headline:'Still US-only hosting; EU region on the roadmap',note:'Illustrative; relevant to the residency watch.'}],
   lillyFit:{relation:'Active incumbent',strategic:'supports',pharma:'SOC 2 Type II is self-reported and ISO 27001 is not held; employee-PI and US/EU residency for EU staff would need a formal privacy screen before an expansion (a risk signal, not a routed screen).',value:'Deepest functional fit and the only vendor already mapped to Lilly\'s HR model; the next move is to close the certification and EU-residency gaps and benchmark the sole-source price before committing.'},
   whyLilly:'Strongest functional fit in the field and the only candidate already mapped to Lilly\'s HR data model, which is what makes a sole-source path defensible. The open items are an independent SOC 2 attestation, ISO 27001, and an EU data-residency story.',
   attrs:{hq:'Illustrative: US-based (AWS us-east)',founded:'Illustrative: circa 2017',financial:'Illustrative: small VC-backed specialist, <$100M revenue (not validated)',gartner:'Illustrative: niche / specialist people-analytics vendor (not validated)',pricing:'Per-employee-per-month subscription; sole-source estimate ~$1.8M TCO',contractFlex:'Sole-source paper; exit and export terms to be negotiated',integration:'Native HRIS/ATS/payroll connectors + the bespoke Lilly HR-model mapping',esg:'Illustrative: early-stage ESG posture; not validated'},
   attrsSrc:{hq:'ext',founded:'ext',financial:'ext',gartner:'ext',pricing:'int',contractFlex:'int',integration:'ext',esg:'ext'},
   solution:'A purpose-built people-analytics platform: an employee/org data model, workforce KPIs, predictive attrition, and DEI / pay-equity analytics, delivered as managed SaaS on US AWS. The differentiator is the pre-built mapping to Lilly\'s HR data model; the trade-off is a US-only footprint and self-reported certifications.',
   finHealth:'Illustrative external read (credible public sources · not validated): a small, specialised VC-backed vendor with revenue plausibly under $100M and adequate venture runway. Scale and runway carry a moderate watch across a multi-year term; a live deep dive would source audited statements before commitment.',
   strengths:['Only candidate pre-mapped to Lilly\'s HR data model','Purpose-built people-analytics depth (attrition, DEI, pay equity)','Entra SSO and role-based access already in place','Strong analyst / manager self-service UX','Responsive support at Lilly\'s current scale','Sole-source path avoids a full competitive cycle'],
   risksNarr:[{cat:'Security certification',sev:'med',detail:'SOC 2 Type II is self-reported and ISO 27001 is not held; close with an independent attestation before award.'},{cat:'Data residency (EU)',sev:'med',detail:'US-only hosting; EU employee data needs a residency and transfer story before any EU-entity rollout.'},{cat:'Financial stability',sev:'med',detail:'Small, specialised vendor; monitor scale and runway across a multi-year commitment.'},{cat:'Commercial leverage',sev:'low',detail:'Sole-source reduces price tension; benchmark the per-employee price before locking a multi-year term.'}],
   reqNarr:{people:'The strongest people-data model in the field, with mature attrition, DEI and pay-equity analytics purpose-built for HR, the category where the incumbent clearly leads.',integ:'Native HRIS/ATS/payroll connectors plus the bespoke Lilly HR-model mapping give the lowest integration friction; warehouse export portability is the one factor to firm up.',privacy:'Employee-PI controls are purpose-built and sound, but US-only hosting caps the residency sub-factor and works-council handling is unproven, the category to close before an EU rollout.',security:'Entra SSO, encryption and audit logging are solid; the drag is that SOC 2 is self-reported and ISO 27001 is absent, so certification depth trails a larger vendor.',adoption:'A polished analyst/manager self-service experience with natural-language querying drives quick adoption, a genuine strength.',commercial:'Per-employee pricing is reasonable, but a sole-source path removes price tension; the estimate should be benchmarked before a multi-year lock.'},
   reqSubNarr:{people:{pe_model:'Purpose-built employee/org data model leads the field.',pe_metrics:'Comprehensive workforce KPI library out of the box.',pe_predict:'Mature predictive attrition / flight-risk with driver analysis.',pe_viz:'Strong dashboards and self-service visualisation.',pe_dei:'DEI and pay-equity analytics are a first-party strength.'},integ:{ig_hris:'Native HRIS connectors plus the pre-built Lilly HR-model mapping, the lowest-friction integration in the field.',ig_api:'Documented APIs cover the main data and admin operations.',ig_ats:'ATS / recruiting sources are covered by native connectors.',ig_payroll:'Payroll and finance sources connect with standard connectors.',ig_export:'Warehouse export / portability is workable but should be firmed up so the HR mapping stays portable.'},privacy:{pr_pi:'Employee-PI controls and minimisation are purpose-built and sound.',pr_consent:'Consent and purpose-limitation handling is adequate.',pr_resid:'No EU residency region today, the capped sub-factor and the key open privacy item.',pr_reten:'Retention and deletion controls are present and configurable.',pr_anon:'Aggregation / anonymisation thresholds are supported for small-group protection.'},security:{sc_soc2:'SOC 2 Type II is self-reported rather than independently attested, the item to close.',sc_iso:'ISO 27001 is not held; a certification gap versus larger vendors.',sc_sso:'Entra SSO and role-based access are in place.',sc_enc:'Encryption at rest and in transit meets enterprise requirements.',sc_audit:'Audit logging is available and adequate.'},adoption:{ad_ux:'Polished analyst / manager self-service UX.',ad_nl:'Natural-language querying is a differentiator for adoption.',ad_mobile:'Mobile and embedded access are available if a step behind desktop.',ad_enable:'Enablement and training materials are solid.'},commercial:{co_lic:'Per-employee-per-month licensing is transparent and reasonable.',co_impl:'Implementation is light given the pre-built mapping.',co_run:'Run and support cost is moderate.',co_flex:'Contract and exit flexibility is the commercial soft spot under a sole-source path.'}},
   commercial:{contracting:'Sole-source supplier paper; export of the bespoke HR mapping and exit terms should be negotiated up front.',regulatory:'SOC 2 self-reported; ISO 27001 absent; employee-PI and EU residency would require a formal privacy screen before an EU rollout.',implementation:'Light implementation thanks to the pre-built Lilly HR-model mapping; mostly configuration and validation.',integration:'Native HRIS/ATS/payroll connectors plus the Lilly HR-model mapping.'},
   clients:'Illustrative (credible public sources · not validated): referenced across mid-to-large enterprise HR / people-analytics deployments; limited named pharma references.',
   gating:[],
   conditions:['Obtain an independent SOC 2 Type II attestation and an ISO 27001 roadmap before award.','Confirm an EU data-residency and transfer path before any EU-entity rollout.','Benchmark the per-employee sole-source price against a comparable people-analytics quote before a multi-year lock.'],
   relationship:'Active incumbent under a sole-source review; a bespoke Lilly HR-model mapping is already in place. No prior adverse incident on record.'
  }},
 {n:'Northwind Insights',id:'northwind',incumbent:false,sub:'Adjacent BI vendor',fit:61,fitc:'mid',
  note:'Broader BI suite with an analytics add-on; weaker on employee-PI controls and would need custom HR connectors. Larger install base, public references in pharma. EU + US regions.',
  tags:['credible public sources · not validated','G2 reviews','EU + US regions'],
  reqFit:{people:3,integ:3,privacy:3,security:5,adoption:4,commercial:4},
  risk:{security:1,privacy:3,financial:1,lockin:2,support:2},flags:[],
  subFit:{people:{pe_model:3.2,pe_metrics:3.6,pe_predict:2.8,pe_viz:4.2,pe_dei:2.9},integ:{ig_hris:2.8,ig_api:4.0,ig_ats:2.6,ig_payroll:3.0,ig_export:4.2},privacy:{pr_pi:2.8,pr_consent:3.2,pr_resid:4.2,pr_reten:3.4,pr_anon:3.0},security:{sc_soc2:4.4,sc_iso:4.3,sc_sso:4.2,sc_enc:4.3,sc_audit:4.1},adoption:{ad_ux:3.8,ad_nl:3.4,ad_mobile:3.6,ad_enable:3.7},commercial:{co_lic:3.6,co_impl:3.0,co_run:3.4,co_flex:3.5}},
  riskSub:{security:{k_breach:1.2,k_cert:1.0,k_pi:2.6,k_vuln:1.4},privacy:{kp_gdpr:2.8,kp_council:3.0,kp_resid:1.6},financial:{kf_scale:1.2,kf_runway:1.0,kf_owner:1.4},lockin:{kl_portab:1.8,kl_exit:2.0,kl_eco:2.2},support:{ks_sla:1.8,ks_cover:1.6,ks_ir:2.0}},
  riskNarr:{security:'A mature BI vendor with a full independent SOC 2 Type II and ISO 27001 stack and no public breach on record, the strongest security posture in the field.',privacy:'The privacy watch is functional, not infrastructural: as a general BI suite, employee-PI minimisation and purpose-limitation controls are less tailored to HR data than a purpose-built people-analytics tool.',financial:'A large, established BI vendor with the strongest balance sheet in the field; financial-stability risk is minimal.',lockin:'A broad BI platform invites consolidation, but open export keeps portability reasonable; ecosystem concentration is the mild structural watch.',support:'Enterprise support with global coverage is solid; standard SLA and RCA commitments apply.'},
  financials:{revenue:'Illustrative: est. $600M–$1B BI-suite revenue (external · not validated)',growth:'Illustrative: ~15% YoY (mature growth · not validated)',margin:'Illustrative: gross margin ~78% (not validated)',arr:'Illustrative: recurring subscription majority (not validated)',cash:'Illustrative: profitable, strong liquidity (not validated)',guidance:'Illustrative: steady double-digit growth (not validated)'},
  deepDive:{
   overview:'Northwind Insights is a broad enterprise BI suite with a people-analytics add-on. It is the adjacent-market option: strong general analytics and security, but not purpose-built for HR, so it would need custom connectors and configuration to reach Lilly\'s workforce use cases.',
   identity:{legal:'Northwind Insights Ltd.',parent:'Independent / publicly held (illustrative · not validated)',ownership:'Public (illustrative)',ticker:null,jurisdiction:'US / UK',confidence:'Best-guess',delivery:'Managed cloud SaaS (EU + US regions)'},
   offerings:[{name:'Northwind BI',note:'General-purpose enterprise BI and dashboards.'},{name:'Northwind People',note:'People-analytics add-on module (requires HR connectors).'},{name:'Northwind Data Prep',note:'ETL / data-prep and modeling layer.'}],
   news:[{date:'2026-03',headline:'Expands EU data-region coverage',note:'Illustrative; supports the residency story.'},{date:'2025-12',headline:'Adds an HR-analytics content pack',note:'Illustrative; narrows but does not close the HR gap.'},{date:'2025-08',headline:'Named a Leader in a BI analyst square',note:'Analyst position; illustrative.'}],
   lillyFit:{relation:'Net new',strategic:'neutral',pharma:'Independent SOC 2 Type II and ISO 27001 are in place with EU + US regions; the gap is HR-specific employee-PI tailoring rather than certification (a functional watch, not a routed screen).',value:'Strong general analytics and the best security stack in the field, but reaching HR parity needs custom connectors; weigh the build cost against the incumbent\'s pre-built mapping.'},
   whyLilly:'A credible, well-secured general BI platform with EU + US regions and pharma references, but it is adjacent rather than purpose-built for people analytics, closing the HR gap means custom connectors and configuration.',
   attrs:{hq:'Illustrative: US / UK',founded:'Illustrative: circa 2009',financial:'Illustrative: established, profitable BI vendor (not validated)',gartner:'Illustrative: Leader in general BI (not validated)',pricing:'Per-user + capacity; mid-market to enterprise tiers',contractFlex:'Enterprise agreement; standard flexibility',integration:'Broad BI connectors; HR sources need custom connectors',esg:'Illustrative: published ESG commitments; not validated'},
   attrsSrc:{hq:'ext',founded:'ext',financial:'ext',gartner:'ext',pricing:'int',contractFlex:'int',integration:'ext',esg:'ext'},
   solution:'A general enterprise BI suite with data-prep, modeling and a people-analytics add-on. Visualisation and security are strong; HR-specific analytics (attrition, pay equity) and native HR connectors are configuration and custom-build rather than out-of-the-box.',
   finHealth:'Illustrative external read (not validated): an established, profitable BI vendor with strong liquidity, the lowest financial-stability risk in the field. Figures are owner-sanctioned mock; audited statements would be sourced before commitment.',
   strengths:['Full independent SOC 2 Type II + ISO 27001 stack','EU + US data regions in place','Strong visualisation and self-service BI','Largest install base and pharma references in the field','Best financial-stability position in the field','Open export keeps data portable'],
   risksNarr:[{cat:'HR functional gap',sev:'med',detail:'A general BI suite, not purpose-built for people analytics; attrition/DEI/pay-equity need custom build.'},{cat:'Employee-PI tailoring',sev:'med',detail:'PI minimisation and purpose-limitation controls are less HR-tailored than a specialist tool.'},{cat:'Integration effort',sev:'med',detail:'Native HR connectors are limited; HRIS/ATS sources need custom connectors.'},{cat:'Ecosystem concentration',sev:'low',detail:'A broad BI platform invites consolidation; open export mitigates lock-in.'}],
   reqNarr:{people:'A capable general analytics engine with strong visualisation, but attrition, predictive and DEI/pay-equity depth trail a purpose-built people-analytics tool, the functional gap for HR use cases.',integ:'Broad BI connectors and open export are strong, but native HRIS/ATS coverage is thin, so reaching Lilly\'s HR sources means custom connectors.',privacy:'EU + US regions cover residency well, but employee-PI minimisation and purpose-limitation are less tailored to HR data than a specialist platform.',security:'A full independent SOC 2 Type II and ISO 27001 stack with strong encryption and SSO, the security leader in this field.',adoption:'A polished, widely-adopted BI experience; HR-specific self-service is a step behind a purpose-built tool.',commercial:'Competitive per-user and capacity pricing with standard enterprise flexibility; the HR build cost is the hidden line item.'},
   commercial:{contracting:'Standard enterprise agreement; open export supports exit.',regulatory:'Independent SOC 2 Type II + ISO 27001; EU + US regions; HR-specific PI tailoring is a functional item.',implementation:'Heavier than the incumbent for HR use cases, custom connectors and content build.',integration:'Broad BI connectors; HRIS/ATS sources require custom connectors.'},
   clients:'Illustrative (credible public sources · not validated): the largest install base in the field, with named pharma and life-sciences BI references.',
   gating:[],
   conditions:['Scope and cost the custom HR connectors and analytics content build.','Confirm employee-PI minimisation and purpose-limitation controls meet Lilly HR-data standards.','Validate the people-analytics add-on against the priority workforce use cases in a pilot.'],
   relationship:'No prior Lilly people-analytics contract on file; a general-BI relationship may exist elsewhere in the estate. Net-new for this scope.'
  }},
 {n:'Vela People Cloud',id:'vela',incumbent:false,sub:'HR-tech challenger',fit:44,fitc:'lo',
  note:'Newer entrant; attractive pricing but thin third-party assurance and no public pharma references. Higher onboarding and risk overhead.',
  tags:['credible public sources · not validated','early-stage','limited assurance'],
  reqFit:{people:3,integ:3,privacy:2,security:2,adoption:3,commercial:5},
  risk:{security:3,privacy:3,financial:4,lockin:2,support:3},
  flags:[{code:'ASSURANCE_GAP',severity:'SOFT',detail:'No independent SOC 2 / ISO attestation on file; limited third-party assurance for employee data.'}],
  subFit:{people:{pe_model:3.0,pe_metrics:3.2,pe_predict:2.6,pe_viz:3.4,pe_dei:2.6},integ:{ig_hris:3.0,ig_api:3.2,ig_ats:2.8,ig_payroll:2.8,ig_export:3.4},privacy:{pr_pi:2.2,pr_consent:2.6,pr_resid:2.4,pr_reten:2.4,pr_anon:2.2},security:{sc_soc2:1.8,sc_iso:1.6,sc_sso:3.2,sc_enc:3.4,sc_audit:2.8},adoption:{ad_ux:3.6,ad_nl:2.8,ad_mobile:3.4,ad_enable:2.8},commercial:{co_lic:4.8,co_impl:4.4,co_run:4.2,co_flex:4.0}},
  riskSub:{security:{k_breach:2.4,k_cert:3.6,k_pi:3.2,k_vuln:3.0},privacy:{kp_gdpr:3.2,kp_council:3.2,kp_resid:3.0},financial:{kf_scale:4.2,kf_runway:4.0,kf_owner:3.4},lockin:{kl_portab:2.0,kl_exit:2.2,kl_eco:1.8},support:{ks_sla:3.0,ks_cover:3.2,ks_ir:3.0}},
  riskNarr:{security:'The certification gap is the headline risk: no independent SOC 2 or ISO 27001 is on file, so security assurance for employee data rests on self-attestation, carried as a soft flag routed for a formal screen if pursued.',privacy:'As an early-stage vendor, employee-PI controls, consent handling and residency are less mature; an elevated privacy watch for regulated workforce data.',financial:'The smallest and least-capitalised vendor in the field; scale and runway are the field-high financial-stability risk across a multi-year term.',lockin:'Attractive open pricing and export keep lock-in low; the trade-off is maturity, not portability.',support:'Support depth and 24x7 coverage are unproven at Lilly\'s scale; an elevated watch to validate.'},
  financials:{revenue:'Illustrative: est. <$30M revenue (early-stage · not validated)',growth:'Illustrative: high % YoY off a small base (not validated)',margin:'Illustrative: pre-profit, reinvesting (not validated)',arr:'Illustrative: single-digit-millions ARR (not validated)',cash:'Illustrative: seed/Series-A runway; watch (not validated)',guidance:'Private; no guidance'},
  deepDive:{
   overview:'Vela People Cloud is a newer HR-tech challenger with an attractive price point and a modern UX, but thin third-party assurance and no public pharma references. It is the value option that carries the most onboarding and risk overhead.',
   identity:{legal:'Vela People Cloud, Inc.',parent:'Independent / VC-backed (early stage)',ownership:'Private · early-stage VC',ticker:null,jurisdiction:'Delaware, US',confidence:'Best-guess',delivery:'Cloud SaaS (single region)'},
   offerings:[{name:'Vela People',note:'Core people-analytics dashboards.'},{name:'Vela Pulse',note:'Engagement and sentiment surveys.'}],
   news:[{date:'2026-02',headline:'Raises an early growth round',note:'Illustrative; runway extends but stays a watch.'},{date:'2025-10',headline:'Publishes a security whitepaper (self-attested)',note:'Illustrative; not an independent attestation.'}],
   lillyFit:{relation:'Net new',strategic:'neutral',pharma:'No independent SOC 2 / ISO attestation and no pharma references; employee-PI and assurance gaps would require a formal screen before any pilot (a risk signal).',value:'Lowest price in the field, but the assurance and maturity gaps make it a benchmark / negotiation lever rather than a primary candidate for regulated workforce data.'},
   whyLilly:'A modern, low-cost people-analytics tool that is useful mainly as a price benchmark; the certification, assurance and financial-scale gaps make it hard to justify for regulated employee data without significant risk mitigation.',
   attrs:{hq:'Illustrative: US-based (single region)',founded:'Illustrative: circa 2021',financial:'Illustrative: early-stage, pre-profit (not validated)',gartner:'Illustrative: not rated / emerging vendor (not validated)',pricing:'Low per-employee subscription; the value option',contractFlex:'Flexible short terms; open export',integration:'Standard HRIS connectors; narrower coverage',esg:'Illustrative: no formal ESG program yet (not validated)'},
   attrsSrc:{hq:'ext',founded:'ext',financial:'ext',gartner:'ext',pricing:'int',contractFlex:'int',integration:'ext',esg:'ext'},
   solution:'A modern, lightweight people-analytics and engagement tool with a clean UX and low price. Depth (predictive attrition, pay equity), security certification and enterprise support are the areas that trail the rest of the field.',
   finHealth:'Illustrative external read (not validated): an early-stage, pre-profit vendor with the smallest balance sheet in the field, the field-high financial-stability watch. A live deep dive would scrutinise runway before any multi-year commitment.',
   strengths:['Lowest price in the field','Modern, clean self-service UX','Flexible short terms and open export','Fast, lightweight onboarding for basic use cases'],
   risksNarr:[{cat:'Security assurance',sev:'high',detail:'No independent SOC 2 / ISO attestation; assurance for employee data rests on self-attestation.'},{cat:'Financial stability',sev:'high',detail:'Early-stage, pre-profit vendor; the field-high scale and runway risk.'},{cat:'Privacy maturity',sev:'med',detail:'Employee-PI, consent and residency controls are less mature.'},{cat:'Support depth',sev:'med',detail:'24x7 coverage and RCA depth are unproven at Lilly scale.'}],
   reqNarr:{people:'A usable analytics layer for basic workforce reporting, but predictive attrition and DEI/pay-equity depth trail the specialists.',integ:'Standard HRIS connectors with narrower coverage; open export is a plus.',privacy:'Employee-PI, consent and residency controls are the least mature in the field, an elevated watch for regulated data.',security:'The certification gap is the headline: no independent SOC 2 / ISO, held to a low score and a soft flag.',adoption:'A modern, clean UX aids adoption for lighter use cases.',commercial:'The clear price leader with flexible terms, the reason it stays in the field as a value lever.'},
   commercial:{contracting:'Flexible short-term paper with open export; low switching cost.',regulatory:'No independent SOC 2 / ISO; employee-PI and residency would require a formal screen before a pilot.',implementation:'Fast and light for basic use cases; deeper HR analytics need more configuration.',integration:'Standard HRIS connectors; narrower source coverage.'},
   clients:'Illustrative (credible public sources · not validated): early-stage references in mid-market HR; no named pharma references.',
   gating:[],
   conditions:['Obtain an independent SOC 2 Type II / ISO 27001 attestation before any pilot.','Assess financial runway before a multi-year commitment.','Validate employee-PI, consent and residency controls for regulated workforce data.'],
   relationship:'No prior Lilly relationship; net-new early-stage vendor. Carried mainly as a price benchmark.'
  }},
 {n:'Visterra Workforce Analytics',id:'visterra',incumbent:false,sub:'Purpose-built people-analytics leader',fit:79,fitc:'hi',
  note:'Dedicated people-analytics platform with a strong employee data model, mature privacy controls and EU + US residency; premium pricing. A credible competitive alternative to the incumbent.',
  tags:['credible public sources · not validated','SOC 2 + ISO 27001','EU + US regions'],
  reqFit:{people:5,integ:4,privacy:5,security:5,adoption:4,commercial:3},
  risk:{security:1,privacy:1,financial:2,lockin:2,support:1},flags:[],
  subFit:{people:{pe_model:4.7,pe_metrics:4.6,pe_predict:4.4,pe_viz:4.3,pe_dei:4.5},integ:{ig_hris:4.4,ig_api:4.3,ig_ats:4.0,ig_payroll:3.8,ig_export:4.2},privacy:{pr_pi:4.7,pr_consent:4.6,pr_resid:4.6,pr_reten:4.4,pr_anon:4.5},security:{sc_soc2:4.7,sc_iso:4.6,sc_sso:4.4,sc_enc:4.5,sc_audit:4.4},adoption:{ad_ux:4.4,ad_nl:4.0,ad_mobile:3.9,ad_enable:4.2},commercial:{co_lic:3.2,co_impl:3.0,co_run:3.4,co_flex:3.3}},
  riskSub:{security:{k_breach:1.0,k_cert:0.9,k_pi:1.2,k_vuln:1.2},privacy:{kp_gdpr:1.2,kp_council:1.4,kp_resid:1.0},financial:{kf_scale:2.0,kf_runway:1.8,kf_owner:1.6},lockin:{kl_portab:2.0,kl_exit:2.2,kl_eco:2.0},support:{ks_sla:1.4,ks_cover:1.4,ks_ir:1.5}},
  riskNarr:{security:'A full independent SOC 2 Type II + ISO 27001 stack with a clean breach history and strong pen-test cadence, the lowest security risk in the field alongside Northwind.',privacy:'Purpose-built for employee data with mature PI minimisation, consent handling and EU + US residency; the strongest privacy posture in the field.',financial:'A well-capitalised, category-leading people-analytics platform; a mild scale watch as a still-growing specialist, but runway is not a concern.',lockin:'A single-vendor people-analytics estate is a manageable concentration; open export keeps portability reasonable.',support:'Strong enterprise support with 24x7 coverage and documented RCA, a low support risk.'},
  riskSubNarr:{security:{k_breach:'No public breach on record; a clean history holds this to the lowest band.',k_cert:'Independent SOC 2 Type II and ISO 27001 both in place, deepest certification stack in the field.',k_pi:'Purpose-built employee-PI handling with minimisation by design; minimal residual exposure.',k_vuln:'Regular third-party pen-testing and a managed vulnerability program.'},privacy:{kp_gdpr:'GDPR lawfulness for employee data is a designed-in strength with EU processing.',kp_council:'Works-council / co-determination workflows are supported out of the box.',kp_resid:'EU + US residency regions cover the Lilly footprint cleanly.'},financial:{kf_scale:'A growing specialist below the mega-vendors; a mild scale watch, not a concern.',kf_runway:'Well-capitalised with ample runway.',kf_owner:'Backed by top-tier investors; stable ownership.'},lockin:{kl_portab:'Open export supports portability of the people-data model.',kl_exit:'Exit terms are standard enterprise paper; negotiate egress up front.',kl_eco:'A single specialist platform is a manageable concentration.'},support:{ks_sla:'Enterprise SLA guarantees are solid.',ks_cover:'24x7 global coverage is in place.',ks_ir:'Documented incident-response and RCA.'}},
  financials:{revenue:'Illustrative: est. $200–400M revenue (external · not validated)',growth:'Illustrative: ~35% YoY (not validated)',margin:'Illustrative: SaaS gross margin ~76% (not validated)',arr:'Illustrative: majority-recurring, high retention (not validated)',cash:'Illustrative: well-capitalised, ample runway (not validated)',guidance:'Illustrative: sustained growth toward profitability (not validated)'},
  deepDive:{
   overview:'Visterra Workforce Analytics is a dedicated, purpose-built people-analytics platform, the category-leading competitive alternative to the incumbent. It pairs a strong employee data model with mature privacy controls and EU + US residency, at a premium price.',
   identity:{legal:'Visterra Workforce Analytics, Inc.',parent:'Independent / late-stage private',ownership:'Private · late-stage (pre-IPO)',ticker:null,jurisdiction:'Delaware, US',confidence:'Confirmed',delivery:'Managed cloud SaaS (EU + US regions)'},
   offerings:[{name:'Visterra People Model',note:'Unified employee/org data model and workforce metrics.'},{name:'Visterra Predict',note:'Attrition, flight-risk and workforce planning analytics.'},{name:'Visterra Equity',note:'DEI, pay-equity and representation analytics.'},{name:'Visterra Govern',note:'Employee-PI controls, consent and residency governance.'}],
   news:[{date:'2026-05',headline:'Adds an EU employee-data residency boundary',note:'Illustrative; strengthens the residency story.'},{date:'2026-02',headline:'Named a Leader in a workforce-analytics evaluation',note:'Analyst position; illustrative.'},{date:'2025-11',headline:'Closes a late-stage growth round',note:'Illustrative; reinforces the balance sheet.'}],
   lillyFit:{relation:'Net new',strategic:'supports',pharma:'Independent SOC 2 Type II + ISO 27001 with EU + US residency and designed-in employee-PI controls; a formal privacy screen would be light. The main trade-off is premium pricing and no pre-built Lilly HR mapping.',value:'The strongest competitive alternative to the incumbent, closes the certification and residency gaps the incumbent carries, at a higher price and with an integration build.'},
   whyLilly:'A purpose-built people-analytics leader that closes exactly the gaps the incumbent carries, independent certifications, EU residency and mature employee-PI governance, at a premium price and without the incumbent\'s pre-built HR mapping.',
   attrs:{hq:'Illustrative: US-based (EU + US regions)',founded:'Illustrative: circa 2014',financial:'Illustrative: well-capitalised late-stage private (not validated)',gartner:'Illustrative: Leader in workforce / people analytics (not validated)',pricing:'Premium per-employee subscription; higher than the incumbent',contractFlex:'Enterprise agreement; committed term',integration:'Native HRIS/ATS connectors; open export; API-mature',esg:'Illustrative: published ESG commitments; not validated'},
   attrsSrc:{hq:'ext',founded:'ext',financial:'ext',gartner:'ext',pricing:'int',contractFlex:'int',integration:'ext',esg:'ext'},
   solution:'A purpose-built people-analytics platform: a unified employee data model, predictive workforce analytics, DEI / pay-equity, and designed-in employee-PI governance with EU + US residency. The trade-off versus the incumbent is premium pricing and an integration build (no pre-built Lilly mapping).',
   finHealth:'Illustrative external read (not validated): a well-capitalised, category-leading specialist with ample runway and high retention, a low financial-stability risk with only a mild scale watch. Figures are owner-sanctioned mock.',
   strengths:['Independent SOC 2 Type II + ISO 27001 in place','EU + US employee-data residency','Purpose-built people data model and predictive analytics','Designed-in employee-PI and consent governance','Strong DEI / pay-equity analytics','Well-capitalised, low financial-stability risk'],
   risksNarr:[{cat:'Commercial / price',sev:'med',detail:'Premium pricing above the incumbent; model the per-employee TCO before shortlisting.'},{cat:'Integration build',sev:'med',detail:'No pre-built Lilly HR mapping; native connectors still need an integration project.'},{cat:'Scale',sev:'low',detail:'A growing specialist below the mega-vendors; a mild scale watch, not a concern.'},{cat:'Lock-in',sev:'low',detail:'Single-vendor people-analytics estate; open export mitigates.'}],
   reqNarr:{people:'A purpose-built people data model with strong predictive and DEI/pay-equity analytics, level with the incumbent on functional depth and ahead on governance.',integ:'Native HRIS/ATS connectors and open export are strong; the gap versus the incumbent is the absence of a pre-built Lilly HR mapping, so an integration project is required.',privacy:'The privacy leader in the field: designed-in employee-PI minimisation, consent handling and EU + US residency.',security:'A full independent SOC 2 Type II + ISO 27001 stack with strong encryption and SSO.',adoption:'A polished, HR-oriented self-service experience with good enablement.',commercial:'The commercial soft spot, premium pricing and a committed term mean the TCO must be modelled against the incumbent.'},
   commercial:{contracting:'Enterprise agreement with a committed term; open export supports exit.',regulatory:'Independent SOC 2 Type II + ISO 27001; EU + US residency; designed-in employee-PI governance.',implementation:'An integration project is required (no pre-built Lilly mapping); native connectors shorten it.',integration:'Native HRIS/ATS connectors, open export, mature APIs.'},
   clients:'Illustrative (credible public sources · not validated): named enterprise and life-sciences people-analytics references.',
   gating:[],
   conditions:['Model the premium per-employee TCO against the incumbent\'s sole-source estimate.','Scope the HRIS integration project (no pre-built Lilly mapping).','Confirm EU residency and works-council workflows for EU entities.'],
   relationship:'No prior Lilly contract on file; net-new competitive alternative to the incumbent.'
  }},
 {n:'Cadence People Cloud',id:'cadence',incumbent:false,sub:'HCM-suite-adjacent analytics',fit:70,fitc:'mid',
  note:'People-analytics native to a broader HCM suite; strongest HRIS integration and solid security, but analytics depth is moderate and it concentrates the estate on one suite.',
  tags:['credible public sources · not validated','SOC 2 + ISO 27001','suite-native'],
  reqFit:{people:4,integ:5,privacy:4,security:4,adoption:4,commercial:3},
  risk:{security:1,privacy:2,financial:1,lockin:3,support:2},flags:[],
  subFit:{people:{pe_model:4.0,pe_metrics:4.2,pe_predict:3.4,pe_viz:3.8,pe_dei:3.6},integ:{ig_hris:4.8,ig_api:4.0,ig_ats:4.4,ig_payroll:4.6,ig_export:3.4},privacy:{pr_pi:4.0,pr_consent:3.8,pr_resid:4.2,pr_reten:4.0,pr_anon:3.8},security:{sc_soc2:4.5,sc_iso:4.4,sc_sso:4.3,sc_enc:4.4,sc_audit:4.2},adoption:{ad_ux:4.0,ad_nl:3.6,ad_mobile:4.2,ad_enable:4.0},commercial:{co_lic:3.4,co_impl:3.2,co_run:3.6,co_flex:3.0}},
  riskSub:{security:{k_breach:1.2,k_cert:1.0,k_pi:1.6,k_vuln:1.4},privacy:{kp_gdpr:1.8,kp_council:2.0,kp_resid:1.6},financial:{kf_scale:1.0,kf_runway:0.8,kf_owner:1.2},lockin:{kl_portab:3.2,kl_exit:3.4,kl_eco:3.6},support:{ks_sla:1.8,ks_cover:1.6,ks_ir:1.9}},
  riskNarr:{security:'An independent SOC 2 Type II + ISO 27001 stack backed by a large HCM vendor with a clean breach history, a low security risk.',privacy:'Mature employee-PI and residency controls inherited from the HCM suite; a low-to-mild privacy watch.',financial:'Part of a large, established HCM vendor with the strongest balance sheet in the field; financial-stability risk is minimal.',lockin:'The field-high lock-in: analytics are native to the HCM suite, so value depends on adopting (or already running) that suite, export and exit are the structural watch.',support:'Enterprise support with global coverage inherited from the suite; standard SLA and RCA.'},
  financials:{revenue:'Illustrative: analytics line within a multi-$B HCM vendor (external · not validated)',growth:'Illustrative: steady suite growth (not validated)',margin:'Illustrative: strong subscription margin (not validated)',arr:'Illustrative: majority-recurring suite revenue (not validated)',cash:'Illustrative: large, profitable parent; strong liquidity (not validated)',guidance:'Illustrative: steady growth (not validated)'},
  deepDive:{
   overview:'Cadence People Cloud is a people-analytics capability native to a broader HCM suite. Its strength is the deepest HRIS/payroll integration in the field; the trade-offs are moderate analytics depth and a structural dependence on the surrounding suite.',
   identity:{legal:'Cadence People Cloud (HCM-suite line)',parent:'Large HCM-suite vendor (illustrative · not validated)',ownership:'Subsidiary / product line (illustrative)',ticker:null,jurisdiction:'US',confidence:'Best-guess',delivery:'Managed cloud SaaS (suite-native)'},
   offerings:[{name:'Cadence Analytics',note:'People analytics native to the HCM suite.'},{name:'Cadence Planning',note:'Workforce planning and headcount analytics.'},{name:'Cadence Connect',note:'Native HRIS / payroll data integration.'}],
   news:[{date:'2026-04',headline:'Deepens native payroll analytics',note:'Illustrative; reinforces integration strength.'},{date:'2025-12',headline:'Adds packaged workforce-planning content',note:'Illustrative.'},{date:'2025-09',headline:'Analytics remain best inside the suite',note:'Illustrative; the lock-in trade-off.'}],
   lillyFit:{relation:'Net new',strategic:'neutral',pharma:'Independent SOC 2 Type II + ISO 27001 and mature residency inherited from the suite; a light privacy screen. The strategic question is suite adoption, not certification.',value:'Best-in-field HRIS/payroll integration if Lilly runs (or adopts) the surrounding HCM suite; otherwise the suite dependence outweighs the analytics.'},
   whyLilly:'The deepest HRIS/payroll integration in the field with strong security and a rock-solid balance sheet, compelling if Lilly already runs the surrounding HCM suite, and a structural lock-in question if not.',
   attrs:{hq:'Illustrative: US-based',founded:'Illustrative: suite line, analytics circa 2016',financial:'Illustrative: large profitable HCM parent (not validated)',gartner:'Illustrative: Leader in HCM, analytics a component (not validated)',pricing:'Suite-tied per-employee; standalone value is limited',contractFlex:'Suite enterprise agreement; exit tied to the suite',integration:'Best-in-field native HRIS/payroll; export is the weaker path',esg:'Illustrative: parent ESG program; not validated'},
   attrsSrc:{hq:'ext',founded:'ext',financial:'ext',gartner:'ext',pricing:'int',contractFlex:'int',integration:'ext',esg:'ext'},
   solution:'People analytics native to a broader HCM suite: strongest-in-field HRIS and payroll integration, solid security, and packaged workforce-planning content. Analytics depth (predictive, DEI) is moderate, and the value is tightly coupled to the surrounding suite.',
   finHealth:'Illustrative external read (not validated): part of a large, profitable HCM vendor with the strongest balance sheet in the field, minimal financial-stability risk. Figures are owner-sanctioned mock.',
   strengths:['Best-in-field native HRIS / payroll integration','Independent SOC 2 Type II + ISO 27001','Strongest balance sheet in the field','Mature residency and employee-PI controls','Packaged workforce-planning content','Enterprise support inherited from the suite'],
   risksNarr:[{cat:'Lock-in / suite dependence',sev:'high',detail:'Analytics are native to the HCM suite; value and portability depend on suite adoption, the field-high lock-in.'},{cat:'Analytics depth',sev:'med',detail:'Predictive and DEI/pay-equity depth trail the purpose-built specialists.'},{cat:'Export / portability',sev:'med',detail:'Export is the weaker path; egress terms need negotiating.'},{cat:'Commercial coupling',sev:'low',detail:'Standalone pricing value is limited outside the suite.'}],
   reqNarr:{people:'Solid workforce metrics and planning, but predictive and DEI/pay-equity depth are moderate versus the specialists.',integ:'The integration leader, native HRIS and payroll connectivity is best-in-field; export is the one weaker sub-factor.',privacy:'Mature employee-PI and residency controls inherited from the suite.',security:'Independent SOC 2 Type II + ISO 27001 with strong encryption and SSO.',adoption:'A familiar, suite-consistent UX with good mobile access.',commercial:'Value is tied to the suite; standalone pricing and exit flexibility are the soft spots.'},
   commercial:{contracting:'Suite enterprise agreement; exit and export are tied to the suite.',regulatory:'Independent SOC 2 Type II + ISO 27001; mature residency from the suite.',implementation:'Fast if the suite is present; otherwise a suite adoption is implied.',integration:'Best-in-field native HRIS/payroll; export is the weaker path.'},
   clients:'Illustrative (credible public sources · not validated): large enterprise HCM references; analytics adopted alongside the suite.',
   gating:[],
   conditions:['Confirm whether Lilly runs or would adopt the surrounding HCM suite.','Negotiate export / egress terms to mitigate suite lock-in.','Validate predictive and DEI analytics depth against the priority use cases.'],
   relationship:'No prior Lilly people-analytics contract on file; a suite relationship may exist elsewhere. Net-new for this scope.'
  }}
];
  S.projectView.neg = {
    positions: [
 {key:'liability',title:'Liability cap (PI-breach carve-out)',cat:'Legal',tier:'redline',compliance:false,
  accept:'38% · N=24 (buyer-favorable, gaining traction)',confidence:'Med',
  position:'General cap at 2x fees is acceptable, but PI-breach liability sits OUTSIDE the general cap (uncapped, or a separate higher cap).',
  target:'2x fees general cap; PI breach carved out (uncapped)',fallback:'1.5x fees general; PI breach at a separate higher cap',hs:'PI-breach capped at the standard 2x cap',
  args:['Employee-PI breach is exactly the harm this engagement creates; the general cap must not limit recovery for it.','Lilly playbook LP-04 requires PI-breach liability outside the general cap.','Regulatory exposure for a PI breach routinely exceeds 2x annual fees.'],
  pushback:'A carve-out is hard to insure; our cyber policy caps at a fixed amount.',
  rebuttal:'Insurance sizing is your commercial choice. We can accept a separate, higher PI-breach cap tied to your cyber-policy limit rather than fully uncapped.',
  tones:{
   Standard:'MSA §4 caps liability at 2x fees but applies the same cap to a personal-data breach. We need PI-breach liability carved out of the §4 cap.',
   Collaborative:'We would like the §4 cap to work for both of us. Could we carve PI-breach liability out of the general cap, since that is the one exposure this engagement uniquely creates?',
   Aggressive:'Applying the 2x cap to a personal-data breach is unacceptable. Carve PI-breach liability out of §4 - uncapped, or a separate higher cap. We cannot proceed otherwise.',
   Curious:'Help us understand the reasoning behind capping a PI breach at 2x fees. Given regulatory exposure often exceeds that, would a separate PI-breach cap work on your side?',
   Astonished:'We are surprised the §4 cap covers a personal-data breach at 2x fees, when that is exactly the harm employee PI creates. This needs to sit outside the general cap.'
  }},
 {key:'ip',title:'IP ownership (Lilly-derived outputs)',cat:'Legal',tier:'hold-firm',compliance:true,
  complianceNote:'The executed AI Standard §3.5 bars Lilly Content from cross-client model training. Deploy this citation to anchor the ownership ask across the package.',
  accept:'41% · N=19 (emerging AI clause)',confidence:'Med',
  position:'Lilly owns outputs and derivatives created from Lilly data; Acme keeps its background models. No Lilly Content trains cross-client / General Use models.',
  target:'Lilly owns outputs derived from Lilly data',fallback:'Joint ownership of derived outputs',hs:'Supplier owns all models trained on Lilly data',
  args:['Call/HR data is Lilly Content under the AI Standard, not Usage Data.','AI Standard §3.5 bars Lilly Content as Supplier Training Content.','Client-dedicated tuning preserves accuracy without crossing into cross-client models.'],
  pushback:'Model training across clients is how we maintain platform accuracy.',
  rebuttal:'Client-dedicated model tuning preserves accuracy for Lilly without using Lilly Content for General Use models, which §3.5 prohibits.',
  tones:{
   Standard:'The WO is silent on ownership of models trained on Lilly data. We need Lilly to own outputs derived from Lilly data, with no Lilly Content used for cross-client models.',
   Collaborative:'We want to make sure the IP terms honor the AI Standard we both signed. Could we confirm Lilly owns outputs derived from Lilly data, while Acme keeps its background models?',
   Aggressive:'The ownership gap is not acceptable. Add a clause: Lilly owns outputs and derivatives from Lilly data, and no Lilly Content trains General Use models. AI Standard §3.5 requires it.',
   Curious:'Which models do the Lilly-derived outputs improve today? The AI Standard treats our data as Lilly Content under §3.5 - can you confirm it never flows to cross-client models?',
   Astonished:'We are surprised the WO is silent on who owns models trained on Lilly data, given AI Standard §3.5 squarely bars Lilly Content from Supplier Training Content.'
  }},
 {key:'subproc',title:'Sub-processors / data (Lilly DPA + prior approval)',cat:'Data-protection',tier:'redline',compliance:true,
  complianceNote:'Lilly DPA + EU SCCs are non-negotiable for employee PI; this is a compliance-grounded red line, not a commercial lever.',
  accept:'63% · N=37',confidence:'High',
  position:'Lilly DPA + EU SCCs govern; sub-processors require Lilly prior approval plus an annual audit right.',
  target:'Lilly DPA, prior-approval on sub-processors',fallback:'Notice + a 10-business-day objection right',hs:'No sub-processor control',
  args:['§11 allows sub-processors on notice only; employee PI needs prior approval.','The Lilly DPA cl. 7 requires an annual audit right.','EU SCCs are mandatory for the cross-border employee-PI transfer.'],
  pushback:'Prior approval slows our operations; notice with an objection window is our standard.',
  rebuttal:'For employee PI, prior approval is the baseline; if speed is the concern, we can pre-approve a named list and require approval only for additions. The Lilly DPA and SCCs are non-negotiable.',
  tones:{
   Standard:'MSA §11 lets Acme add sub-processors on notice only. Employee PI needs a prior-approval right plus an annual audit right under the Lilly DPA, with EU SCCs.',
   Collaborative:'For employee PI we would like to align on prior approval for sub-processors and an annual audit right. Could we adopt the Lilly DPA and SCCs so we are both covered?',
   Aggressive:'Notice-only sub-processor rights are unacceptable for employee PI. Insert prior approval, an annual audit right, the Lilly DPA and EU SCCs. This is non-negotiable.',
   Curious:'How do you vet new sub-processors today? For employee PI we need prior approval rather than an objection window - can you accommodate the Lilly DPA and SCCs?',
   Astonished:'We are surprised sub-processors can be added on notice for employee PI. Prior approval, the Lilly DPA, and EU SCCs are baseline protections for this data.'
  }},
 {key:'renewal',title:'Renewal pricing (CPI cap)',cat:'Commercial',tier:'hold-firm',compliance:false,
  accept:'58% · N=44',confidence:'High',
  position:'Renewals capped at CPI or 3%, whichever is lower; no auto-renewal at then-current list price.',
  target:'CPI-capped renewals (<= 3%)',fallback:'Fixed year-1 renewal price',hs:'Uncapped uplift / then-current list',
  args:['The base MSA capped renewals at CPI; Amendment 2 §3 replaced that with then-current list.','The last indicative quote implied +9%, unbounded across the 3-year term.','A CPI-or-3% cap keeps renewal predictable for budgeting and Finance.'],
  pushback:'Our list prices move with the market; a hard cap limits our ability to reprice.',
  rebuttal:'A CPI-linked cap tracks the market you are pricing against; it bounds risk without freezing your list. We can accept a fixed year-1 renewal as the fallback.',
  tones:{
   Standard:'Amendment 2 §3 renews at then-current list price with no cap. We need renewals capped at CPI or 3%, whichever is lower.',
   Collaborative:'Could we restore the capped-renewal framework the base MSA had? A CPI-or-3% cap gives us both predictability across the term.',
   Aggressive:'Open-ended renewal at then-current list is unacceptable. Cap renewal uplift at CPI or 3%, whichever is lower, and remove the auto-renewal-at-list language.',
   Curious:'What drove the move from the MSA capped renewals to then-current list in Amendment 2? Could we return to a CPI-linked cap?',
   Astonished:'We are surprised Amendment 2 deleted the MSA capped-renewal clause in favor of then-current list price - that is open-ended exposure across a 3-year term.'
  }},
 {key:'fee',title:'Annual fee / unit price',cat:'Commercial',tier:'strategic-trade',compliance:false,
  accept:'52% · N=61 (discount acceptance at this band)',confidence:'Med',
  position:'Target $540K/yr on a 3-year lock. A higher fee is only on the table against a stronger PI-breach cap or a longer term.',
  target:'$540K/yr (3-yr lock)',fallback:'$600K with a year-1 ramp credit',hs:'> $640K/yr',
  args:['The 3-year, multi-entity commitment is the value Acme is buying - price against that.','Our benchmark target is $540K/yr; the ask sits above the market band.','The marquee case-study value is a non-cash concession Acme gains.'],
  pushback:'The platform scope and the bespoke HR data mapping justify the premium.',
  rebuttal:'We recognize the mapping effort - trade it against the 3-year lock or a stronger PI-breach cap, not a higher steady-state fee. Fallback is $600K with a year-1 ramp credit.',
  tones:{
   Standard:'We are targeting $540K/yr on a 3-year lock. A higher fee is only on the table against a stronger PI-breach cap or a longer term.',
   Collaborative:'We value the multi-year relationship. Could we land at $540K/yr on a 3-year lock? We can be flexible on fee if you can move on the PI-breach cap.',
   Aggressive:'The proposed fee is above our walk-away. Bring it to $540K/yr on a 3-year lock; anything above $640K/yr does not work.',
   Curious:'Can you walk us through what drives the current annual number? We are anchored at $540K/yr and want to understand the gap.',
   Astonished:'We are surprised the annual number sits this far above the market band for a multi-year, multi-entity commitment of this size.'
  }},
 {key:'term',title:'Term & exit (convenience)',cat:'Legal',tier:'strategic-trade',compliance:false,
  accept:'71% · N=52',confidence:'High',
  position:'3-year term with a 30-day termination for convenience, added to the MSA for-cause framework. The multi-year commitment is the trade currency for price.',
  target:'3 yrs + 30-day termination for convenience',fallback:'2 yrs + 60-day notice',hs:'No convenience exit',
  args:['A 3-year commitment is real, bankable value for Acme; it earns the convenience exit.','30-day notice is standard for a SaaS engagement of this profile.','Lilly needs an orderly exit path if strategy or scope changes.'],
  pushback:'A convenience exit undermines the revenue certainty the multi-year term gives us.',
  rebuttal:'The 3-year commitment already gives you certainty; a 30-day convenience exit with notice is a normal counterbalance. Fallback is 2 years with 60-day notice.',
  tones:{
   Standard:'We want a 3-year term with a 30-day termination for convenience, adding to the MSA for-cause framework.',
   Collaborative:'We are happy to commit for 3 years, which is real value for you. In exchange, could we add a 30-day termination for convenience?',
   Aggressive:'A for-cause-only exit is not acceptable for a 3-year commitment. Add a 30-day termination for convenience.',
   Curious:'How have other multi-year clients handled the exit terms? We would trade the 3-year commitment for a 30-day convenience exit.',
   Astonished:'We are surprised a 3-year commitment carries no convenience exit at all - that is unusual for a deal of this length.'
  }},
 {key:'venue',title:'Governing-law venue',cat:'Legal',tier:'easy-concede',compliance:false,
  accept:'34% · N=28',confidence:'Low',
  position:'Prefer a neutral venue (Delaware); concede early for goodwill if resisted.',
  target:'Neutral or Lilly-favorable venue (Delaware)',fallback:'Supplier venue with carve-outs',hs:'',
  args:['Playbook prefers a neutral or Lilly-favorable venue.','A neutral Delaware forum is a minor, low-cost alignment.','Conceding this early builds goodwill for the substantive items.'],
  pushback:'Our standard contracts specify our home venue.',
  rebuttal:'Understood - this is low priority for us and a candidate to concede for goodwill if you hold firm.',
  tones:{
   Standard:'MSA §18 specifies Acme home venue. We prefer a neutral venue such as Delaware, but this is a low-priority point.',
   Collaborative:'A neutral venue like Delaware would suit us both. That said, this is not a sticking point and we can be flexible.',
   Aggressive:'We would prefer a neutral Delaware venue over Acme home turf, though we are not going to hold the deal on it.',
   Curious:'Is there a reason venue is set to your home courts? A neutral Delaware forum would work - but happy to hear your view.',
   Astonished:'We noticed venue defaults to Acme home courts; a neutral forum is more typical, though this is minor.'
  }},
 {key:'confid',title:'Confidentiality / NDA scope',cat:'Legal',msaCovered:true,
  msaRef:'Acme MSA §12 (Confidentiality)',
  msaNote:'The executed MSA sets mutual confidentiality with survival for personal information. No separate WO position is needed.'},
 {key:'audit',title:'Audit & records rights',cat:'Data-protection',msaCovered:true,
  msaRef:'Acme MSA §14 (Audit & Records)',
  msaNote:'The MSA already grants Lilly annual audit and records-inspection rights; a WO audit position would duplicate coverage.'}
],
    seq: [
 {cls:'',title:'Round 1 · Collaborative alignment',obj:'Resolve the corrections and MSA-alignment items in a single collaborative exchange.',
  moves:['Concede the neutral-venue point early (easy concede) to signal goodwill.','Present the sub-processor + Lilly DPA/SCCs ask as aligning the WO with the DPA both parties executed.','Present the renewal cap as restoring the MSA capped-renewal framework Amendment 2 replaced.','Raise Lilly-derived IP ownership as clarifying AI Standard §3.5, which both parties signed.','Open the annual fee anchored at the $540K/yr target on a 3-year lock.'],
  risk:'Low. Most items are MSA or AI-Standard alignment, not new asks.'},
 {cls:'r2',title:'Round 2 · Deploy calibrated fallbacks',obj:'Close the remaining commercial gaps with pre-authorized fallbacks, without touching the red lines.',
  moves:['If the fee is resisted: move to $600K with a year-1 ramp credit, traded for the 3-year lock.','If the renewal cap is resisted: accept a fixed year-1 renewal price rather than then-current list.','If IP ownership is resisted: accept joint ownership of derived outputs.','If prior-approval on sub-processors is resisted: accept notice + a 10-business-day objection right - but never drop the Lilly DPA or SCCs.'],
  risk:'Low-Medium. Hold the two red lines (PI-breach carve-out, Lilly DPA/SCCs) regardless of commercial movement.'},
 {cls:'r3',title:'Round 3 · Escalate the red lines',obj:'If the two red lines remain open, escalate rather than concede them.',
  moves:['Escalate the PI-breach liability carve-out and the Lilly DPA/SCCs to the Contracts COE.','Offer a separate, higher PI-breach cap tied to Acme cyber-policy limits as the only movement on liability.','Pause the signature step until the red lines resolve; nothing binds Lilly before execution.'],
  risk:'Medium. These positions are compliance-grounded; do not trade them for commercial terms.'}
],
    batna: {
 head:'BATNA / escalation path',
 body:'This is a sole-source continuation for a marquee, multi-year, multi-entity Acme engagement - no vendor switch is contemplated. Lilly leverage: the 3-year commitment, the multi-entity expansion roadmap, and the public case-study value Acme wants; Acme leverage: switching cost and the bespoke HR data mapping. If Acme refuses the PI-breach carve-out or the Lilly DPA/SCCs, escalate through the Contracts COE to the Global Procurement Attorney and, if needed, Acme GC. The AI Standard §3.5 and Lilly DPA positions are contractually grounded and backed by Mailbox_Privacy_Contracts. Overall leverage: Moderate-to-strong on Lilly side.'
},
    sme: [
 {name:'Legal AIPC / Privacy Contracts',mail:'Mailbox_Privacy_Contracts@lilly.com',tag:'Standard',
  from:['Sub-processors / data','IP ownership'],
  topic:'Sub-processor control and Lilly DPA/SCCs for employee PI; AI Standard §3.5 on Lilly-derived models.',
  brief:'This Acme engagement processes employee personal information through an AI analytics platform. The base MSA §11 lets Acme add sub-processors on notice only, and Change Order 3 (DPA clause 5) gives Lilly a 10-day objection but no prior-approval right. For employee PI we need prior approval plus an annual audit right under the Lilly DPA, with EU SCCs. Separately, AI Standard §3.5 bars Lilly Content from being used as Supplier Training Content, which grounds the ask that Lilly own outputs derived from Lilly data and that no Lilly Content trains cross-client models. Please confirm the interpretation and review the proposed clause language before Round 1.',
  asks:['Confirm the prior-approval + annual-audit position for sub-processors is required for employee PI.','Confirm AI Standard §3.5 supports Lilly ownership of Lilly-derived outputs and the no-cross-client-training restriction.','Advise whether the Lilly DPA + EU SCCs must attach to the WO or can be incorporated by reference.']},
 {name:'Global Procurement Attorney',mail:'Mailbox_Legal_Contracts@lilly.com',tag:'Standard',
  from:['Liability cap','Term & exit'],
  topic:'PI-breach liability carve-out from the §4 cap; termination-for-convenience terms.',
  brief:'MSA §4 caps aggregate liability at 2x fees and currently applies the same cap to a personal-data breach. Lilly playbook LP-04 requires PI-breach liability to sit outside the general cap because regulatory exposure for an employee-PI breach routinely exceeds 2x annual fees. We plan to hold the PI-breach carve-out as a red line and, if resisted, offer a separate higher PI-breach cap tied to Acme cyber-policy limits rather than a fully uncapped position. We also want to add a 30-day termination for convenience to the MSA for-cause framework. Please review the carve-out language and the convenience-exit wording.',
  asks:['Confirm the PI-breach carve-out from the §4 cap is a hold-firm red line for this data type.','Advise on an acceptable separate PI-breach cap tied to Acme cyber-policy limits as the fallback.','Review the 30-day termination-for-convenience clause against the MSA for-cause framework.']},
 {name:'Cyber ISS Review',mail:'Cyber_ISS_Review@lilly.com',tag:'Standard',
  from:['Sub-processors / data'],
  topic:'SFTP/API integration security and the data-escrow decision for employee-PI data flows.',
  brief:'The engagement moves employee-PI records to Acme via SFTP/API into a cloud-hosted analytics platform. Given the volume and sensitivity, we need Cyber to confirm the integration meets ISS requirements and to weigh the data-escrow decision. This informs the sub-processor and data-protection positions above - if residual risk is high, prior-approval on sub-processors becomes non-negotiable. Please review before we set the Round 1 data-protection asks.',
  asks:['Confirm the SFTP/API integration meets ISS requirements per MSA §3.2.3.','Advise whether a data-escrow arrangement is appropriate for this data volume and sensitivity.','Flag any residual risk that should harden the sub-processor prior-approval position.']}
]
  };
  S.projectView.commercial = {
    priceModels: [
 {id:'perseat',name:'Per-seat subscription (flat)',fitCls:'good',fitLabel:'Recommended',
  when:'Stable, named-user deployment with predictable headcount',
  pros:['Predictable annual budget; no usage surprises','Simple to true-up at renewal','Caps exposure when adoption is high'],
  cons:['Pays for inactive seats if adoption dips','No automatic credit for lower usage'],
  risk:'Recommended for Lilly. 400 named seats at ~78% active suit a flat per-seat rate; hold this and resist the supplier push to usage-based, which raises cost at current adoption.'},
 {id:'fixed',name:'Fixed-fee',fitCls:'good',fitLabel:'Recommended (impl)',
  when:'Well-defined, bounded scope (e.g. the implementation)',
  pros:['Total price known up front','Vendor absorbs overrun risk','Clean for Finance and the ATC'],
  cons:['Change orders if scope moves','Priced at a premium for the certainty'],
  risk:'Recommended for the implementation. Replace the $185/hr T&M overflow with a fixed-fee cap so the build cannot drift on an hourly meter.'},
 {id:'consumption',name:'Consumption / usage',fitCls:'warn',fitLabel:'Caution, supplier push',
  when:'Highly variable demand with real quiet periods',
  pros:['Pay only for what is used','Rewards genuinely low-usage months'],
  cons:['Budget unpredictable; hard to forecast','Cost rises as adoption grows','Meter definitions tend to favor the vendor'],
  risk:'Supplier is proposing a switch to $0.45 per active-user-day. At ~78% active this ADDS ~$36K/yr and breaks even only below 62% active. Do not accept without a hard annual cap.'},
 {id:'tm',name:'Time & materials (T&M)',fitCls:'mut',fitLabel:'Weak fit',
  when:'Genuinely undefined or discovery-phase scope',
  pros:['Flexible for unknown scope','Only pay hours actually worked'],
  cons:['No cost ceiling','Weak incentive to be efficient','Hard to govern and forecast'],
  risk:'Weak fit here. The $185/hr implementation overflow is open-ended; scope is defined enough to fix-fee it.'},
 {id:'outcome',name:'Outcome / value-based',fitCls:'mut',fitLabel:'Weak fit',
  when:'A measurable business outcome both sides can attribute',
  pros:['Aligns the vendor to results','Shifts delivery risk to the vendor'],
  cons:['Attribution disputes','Hard to define fair metrics','Vendor prices in a risk premium'],
  risk:'Weak fit. Analytics adoption is hard to attribute cleanly to a dollar outcome; not worth the measurement overhead for this deal.'},
 {id:'hybrid',name:'Hybrid (base + capped usage)',fitCls:'warn',fitLabel:'Fallback only',
  when:'A predictable core plus some elastic demand',
  pros:['Budget floor with room to flex','Can cap the variable layer'],
  cons:['More complex to administer','Two meters to reconcile'],
  risk:'Worth considering as the fallback: a flat per-seat base with a capped usage layer, only if the supplier insists on a usage component - and only with a hard annual cap.'}
],
    bench: [
 {line:'Licenses (per seat / yr)',ask:1500,unit:'/seat',fmtK:false,
  p10:1180,p50:1390,p90:1720,n:9,asOf:'May 2026',infl:'3.8% (SaaS)',
  log:[
   {q:'"employee analytics platform per-seat enterprise 400 users"',src:'Executed Lilly contracts (2 peer SaaS)',tier:'T1',pts:2,conf:'High'},
   {q:'Lilly internal price base, HR / analytics category',src:'Internal price base',tier:'T2',pts:4,conf:'High'},
   {q:'Gartner "Workforce Analytics" pricing note 2026',src:'Analyst published',tier:'T3',pts:3,conf:'Med'}
  ]},
 {line:'Implementation (one-time)',ask:120000,unit:' one-time',fmtK:true,
  p10:72000,p50:94000,p90:138000,n:6,asOf:'Apr 2026',infl:'4.2% (prof-services)',
  log:[
   {q:'"SaaS analytics implementation fixed fee 400 seats HR data"',src:'Peer / consortium benchmark',tier:'T4',pts:3,conf:'Med'},
   {q:'Lilly internal SOW history, comparable integrations',src:'Internal price base',tier:'T2',pts:3,conf:'Med'}
  ]},
 {line:'Premium support (per yr)',ask:60000,unit:'/yr',fmtK:true,
  p10:null,p50:null,p90:null,n:3,asOf:'Mar 2026',infl:'4.2% (prof-services)',
  log:[
   {q:'"enterprise SaaS premium support annual fee analytics"',src:'Vendor public list pages',tier:'T5',pts:2,conf:'Low'},
   {q:'Aggregator estimate (unverified)',src:'Web aggregator',tier:'T6',pts:1,conf:'Low'}
  ]}
],
    counters: [
 {ask:'License step-down to $1,300/seat (from $1,500)',why:'Biggest single lever; the ask sits above the market band. Anchor to target on the 3-yr lock.',impact:240000,prio:'Must-have'},
 {ask:'Block the switch to usage pricing; hold flat per-seat',why:'Proposed $0.45/active-user-day adds cost at current adoption (breakeven 62% active).',impact:108000,prio:'Must-have'},
 {ask:'CPI-cap renewals (≤3%); remove then-current-list',why:'Last indicative quote implied +9%; uncapped uplift across the term (annual exposure).',impact:54000,prio:'High'},
 {ask:'Implementation fixed-fee cap at $85K (drop $185/hr T&M)',why:'33% above median and highly negotiable; remove the open-ended hourly overflow.',impact:35000,prio:'High'},
 {ask:'Hold premium support at $55K/yr target',why:'In line with market; do not trade it away for a headline license cut.',impact:15000,prio:'Med'}
],
    trades: [
 {give:'3-year term lock',gv:'Revenue certainty, high value to Acme (non-cash to Lilly)',get:'License step-down to $1,300/seat',getv:240000},
 {give:'Public case study + logo',gv:'Marketing value to Acme (non-cash)',get:'Implementation fixed-fee cap',getv:35000},
 {give:'Faster payment (Net-30 from Net-45)',gv:'~$4K/yr cost of capital to Lilly',get:'2–3% headline discount',getv:54000},
 {give:'Drop the sandbox / non-prod tier',gv:'Scope trim (low value to Lilly)',get:'Hold the per-seat rate at target',getv:15000}
],
    varRisk: [
 {risk:'Uncapped renewal uplift',exp:'$54K/yr',notes:'Amendment 2 §3 renews at then-current list; the last quote implied +9%.'},
 {risk:'Usage-model switch',exp:'$36K/yr',notes:'Adds cost at ~78% active; exposure climbs as adoption grows.'},
 {risk:'Implementation T&M overflow',exp:'Unbounded',notes:'$185/hr overflow with no ceiling if scope grows.'},
 {risk:'PI-breach above the 2x cap',exp:'High / unquantified',notes:'Regulatory exposure for an employee-PI breach routinely exceeds 2x fees.'},
 {risk:'Sub-processor added over objection',exp:'Data risk',notes:'§11 is notice-only; employee PI could reach an unvetted party.'}
],
    assume: [
 {a:'400 seats at ~78% active',risk:'Overpay if adoption dips under a usage model; no credit',bearer:'Lilly',prot:'Hold flat per-seat'},
 {a:'Scope stable across the 3-yr term',risk:'Change orders / T&M overflow if scope grows',bearer:'Shared',prot:'Fixed-fee cap'},
 {a:'Implementation lands within the fixed fee',risk:'$185/hr overflow billed on top',bearer:'Lilly',prot:'Fixed-fee cap (proposed)'},
 {a:'Renewal prices at CPI, not list',risk:'Open-ended uplift (~+9% implied)',bearer:'Lilly',prot:'CPI cap (proposed)'},
 {a:'Employee PI stays within approved sub-processors',risk:'Unvetted party receives PI',bearer:'Lilly',prot:'None'}
],
    waterfall: [
 {amt:2375000,kind:'top',label:'Gross list (implied)',sub:'Per-line market-high list across 400 seats / 3-yr + implementation + support'},
 {amt:-275000,kind:'sub',label:'Layer 1, volume + term discount',sub:'The supplier discount off list for the 400-seat, 3-yr commitment (~12%)'},
 {amt:2100000,kind:'sub',label:'Subtotal, supplier ask',sub:'The proposal as it stands today'},
 {amt:-290000,kind:'sub',label:'Layer 2, negotiated target',sub:'License step-down + implementation cap + support at target (~14% more)'},
 {amt:1810000,kind:'net',label:'Net target (TCO)',sub:'Where the ZOPA target anchors the deal'}
],
    levers: [
 {id:'license',name:'License step-down to target',eff:'md',price:true,rec:true,
  sub:'Anchor the per-seat rate to the $1,300 target on the 3-yr lock, the single biggest lever.',sav:80000,y1f:0.9,prot:1},
 {id:'flatseat',name:'Hold flat per-seat (block usage switch)',eff:'md',price:true,rec:true,
  sub:'Refuse the $0.45/active-user-day shift; keep predictable per-seat pricing.',sav:36000,y1f:0.85,prot:5},
 {id:'implfix',name:'Implementation fixed-fee cap',eff:'lo',price:true,rec:true,
  sub:'Replace the $185/hr T&M overflow with an $85K fixed-fee cap (amortized).',sav:12000,y1f:1,prot:3},
 {id:'cpicap',name:'CPI renewal cap (≤3%)',eff:'lo',price:false,rec:true,
  sub:'Cap renewal uplift at CPI or 3%; remove then-current-list pricing.',sav:0,y1f:1,prot:8},
 {id:'pibreach',name:'PI-breach liability carve-out',eff:'md',price:false,rec:true,
  sub:'Carve employee-PI breach out of the 2x cap, a compliance-grounded red line.',sav:0,y1f:1,prot:9},
 {id:'dpa',name:'Lilly DPA + SCCs + prior approval',eff:'md',price:false,rec:true,
  sub:'Adopt the Lilly DPA and EU SCCs; prior approval on sub-processors.',sav:0,y1f:1,prot:7},
 {id:'support',name:'Support at target',eff:'lo',price:true,rec:false,
  sub:'Hold premium support at the $55K/yr target.',sav:5000,y1f:1,prot:1}
],
    email: {
 subject:'Acme Analytics, Work Order pricing & terms (Lilly review)',
 asks:[
  'Per-seat license at $1,300 on the 3-year lock (from $1,500)',
  'Implementation at an $85K fixed-fee cap, replacing the $185/hr overflow',
  'Renewals capped at CPI or 3%, whichever is lower'
 ],
 tones:{
  Standard:{open:'Thank you for the proposal. Following our review, we have three pricing items to align before we can move to signature.',close:'Please confirm whether these work on your side and we will schedule the next round.'},
  Collaborative:{open:'Thanks for the detailed proposal, we are keen to get this across the line together. A few adjustments would let us align the commercials with our benchmarks and the value of the multi-year commitment.',close:'We think these are fair given the 3-year, multi-entity commitment, and we are flexible on sequencing. Shall we walk through them Thursday?'},
  Aggressive:{open:'We have reviewed the proposal and it sits above our walk-away on the commercial terms. To keep this deal on track, the following need to move.',close:'These are firm asks. Please come back with movement on all three before the next call.'},
  Curious:{open:'Thanks for the proposal. Before we proceed, we want to understand the drivers behind a few numbers and align them to the market data we are seeing.',close:'Could you help us understand the pricing basis on these, and whether there is room to move? Happy to share our benchmarks.'},
  Astonished:{open:'Thanks for sending this over. Candidly, a few of the commercial terms surprised us against the market band and our prior pricing.',close:'We would like to understand the gap and bring these back in line before we go further.'}
 }
},
    demoPrep: {
 anchor:'$505K/yr',anchorNote:'bottoms-up base',
 bench:'$525K/yr',benchConf:'High',
 model:'Fixed-fee (not T&M)',
 combinedLo:'$540K/yr',combinedHi:'$640K/yr'
}
  };
  S.projectView.reviewRenew = {
    tactics: [
 {cat:'Pricing Integrity',       flag:true,  txt:'Multi-line discount (per-seat list vs blanket) obscures true list-to-net; platform subscription sits 11% above median.',accept:'62% N=38'},
 {cat:'Deliverable Ambiguity',   flag:false, txt:'Scope defined per Work Order; seat count and modules enumerated.'},
 {cat:'Timeline Manipulation',   flag:true,  txt:'"Quarter-end discount expires Friday" urgency applied to the implementation fee.',accept:'48% N=52'},
 {cat:'Resource Substitution',   flag:false, txt:'Fixed-fee SaaS; no named-resource substitution risk.'},
 {cat:'Responsibility Shifting', flag:true,  txt:'Broad SLA exclusions + sub-processor notice-only shift availability and data risk to Lilly.'},
 {cat:'Hidden Recurring Costs',  flag:true,  txt:'Premium support $60K/yr billed separately; may overlap MSA-baseline support obligations.',accept:'55% N=30'},
 {cat:'Contractual Conflicts',   flag:true,  txt:'Renewal pricing modified twice (CPI cap deleted -> uncapped); annual prepay vs Net-45 terms.'},
 {cat:'Compliance/Security Gaps',flag:false, txt:'Lilly DPA + EU SCCs incorporated; SOC 2 Type II on file.'},
 {cat:'Dependency Inflation',    flag:false, txt:'No forced add-ons; sandbox / non-prod included.'},
 {cat:'Hidden Scope Reduction',  flag:false, txt:'No scope carve-outs detected versus the prior Work Order.'},
 {cat:'Approval Manipulation',   flag:false, txt:'Standard signature workflow; no pressure to skip Legal.'},
 {cat:'Effort Padding',          flag:false, txt:'Fixed-price SaaS, not T&M, no effort padding.'}
],
    renewFastpath: { settingOn:false, checks:[
 {k:'Renewal of an executed MSA',ok:true,note:'Helios ITSM MSA executed 2023; this is its annual renewal.'},
 {k:'TCO under the admin ceiling',ok:true,note:'$300K/yr is under the $500K ceiling.'},
 {k:'Price within the admin rule',ok:false,note:'Supplier proposes +7% YoY; the rule is a CPI / 3% cap, so this is above the cap.'},
 {k:'Zero material deviations',ok:false,note:'1 material deviation: sub-processor control is still notice-only (DPA gap, high severity).'},
 {k:'No new data / sub-processors / cross-border',ok:true,note:'No change to data types or transfer.'},
 {k:'Classification unchanged',ok:true,note:'Yellow, unchanged from the prior term.'},
 {k:'Compliance current (SOC 2 / insurance / DPA)',ok:true,note:'All current.'},
 {k:'Performance SLAs met',ok:true,note:'Uptime and support within tolerance; no open credits.'}
]},
    rateCards: {
 'Acme Analytics':{contract:'MSA-ACME-2026',expires:'2029-01-31',
  note:'Rates locked for the 3-year MSA term; the annual rate-card true-up against market is a tracked obligation.',
  lines:[
   {item:'Platform subscription (per seat)',rate:'$1,500 / seat / yr',unit:'per seat, annual'},
   {item:'Premium support',rate:'$60K / yr',unit:'annual'},
   {item:'Implementation (T&M overflow)',rate:'$185 / hr',unit:'per hour'}
  ]}
},
    rfxStages: ['CDA','MSA draft','Legal','Cyber / ISS','WwTP','Onboarding'],
    rfxProgress: [
 {name:'Nimbus Data',    st:['done','active','active','active','pending','pending']},
 {name:'Lakehouse Co',   st:['done','active','pending','pending','pending','pending']},
 {name:'Helio Warehouse',st:['done','pending','pending','pending','pending','pending']}
],
    rfxStands: [
 {name:'Nimbus Data',existing:false,msaState:'redlines',msaLabel:'Redlines returned',paper:'lilly',paperLabel:'Lilly paper',crit:0,iss:'std',issLabel:'Standard ISS in draft',wwtpLabel:'Not triggered',onbLabel:'After award',read:'Accepted Lilly&rsquo;s MSA as the base paper and returned redlines. Two significant deviations to negotiate, a lower liability cap and a data-residency carve-out, but neither is a hard blocker. No prior Lilly MSA (net-new); ISS / WwTP / onboarding trigger after down-select.'},
 {name:'Lakehouse Co',existing:false,msaState:'redlines',msaLabel:'Redlines returned',paper:'mixed',paperLabel:'Pushing own terms',crit:1,critLabel:'1 critical',iss:'std',issLabel:'Standard ISS in draft',wwtpLabel:'Not triggered',onbLabel:'After award',read:'Returned redlines but is pushing several own-paper terms (IP ownership, liability). <b>Critical:</b> a proposed liability cap below Lilly&rsquo;s floor, must be resolved before this bidder can advance. Net-new; ISS / WwTP / onboarding trigger after down-select.'},
 {name:'Helio Warehouse',existing:false,msaState:'own',msaLabel:'Refusing Lilly paper',paper:'own',paperLabel:'Own paper',crit:1,critLabel:'critical',iss:'unknown',issLabel:'Depends on final paper',wwtpLabel:'Not triggered',onbLabel:'After award',read:'<b>Critical:</b> declining Lilly&rsquo;s MSA and insisting on its own paper, no redlines on the Lilly draft. A material contracting risk needing Legal engagement and a paper decision before it can advance. Net-new; ISS coverage is not assessable until the paper question is resolved.'}
],
    rfxCommercial: [
 {id:'nimbus',name:'Nimbus Data',col:'#0F3A85',norm:'$7,750',tco:'~$9.3M',basis:'Consumption + committed-use',discount:'Committed-use discount (standard)',pay:'Net 45',protect:'Renewal cap TBD',trueup:'Consumption true-up at committed tier',term:'3-yr',paper:'Lilly paper',liability:'Cap below Lilly floor (negotiable)',ip:'Standard',data:'Standard ISS in draft',exit:'Exit terms TBD'},
 {id:'lakehouse',name:'Lakehouse Co',col:'#6A4C93',norm:'$7,375',tco:'~$8.85M',basis:'Flat committed-use',discount:'Committed-use discount',pay:'Net 30',protect:'3% annual cap',trueup:'Fixed (no consumption variability)',term:'3-yr',paper:'Mixed (pushing own terms)',liability:'Cap BELOW Lilly floor',ip:'Pushing own IP terms',data:'Standard ISS in draft',exit:'Standard'},
 {id:'helio',name:'Helio Warehouse',col:'#A6541C',norm:'$6,375',tco:'~$7.65M',basis:'Bundled (platform + support)',discount:'Bundled (less flexible)',pay:'Net 60',protect:'None stated',trueup:'Bundled',term:'3-yr',paper:'Own paper',liability:'Per own paper',ip:'Per own paper',data:'Depends on final paper',exit:'Per own paper'}
],
    rfxOfferRows: ['Elastic storage/compute separation','Multi-cluster concurrency scaling','Native semi-structured data','First-party ML / data-science','Open table formats','Governance & lineage tooling','SOC 2 Type II','ISO 27001','EU + US data residency','Fully-managed (vendor-hosted)','24/7 support · 99.9% SLA','Named pharma references'],
    rfxOffer: [
 {name:'Nimbus Data',    has:[1,1,1,0,0,1,1,1,1,1,1,1]},
 {name:'Lakehouse Co',   has:[1,1,1,1,1,1,0,1,1,1,1,1]},
 {name:'Helio Warehouse',has:[1,0,1,0,1,1,0,1,1,1,0,0]}
]
  };
  S.projectView.docsComms = {
    commLog: [
 {id:'cm-1',date:'2026-06-28',time:'2:14 PM',channel:'email',topic:'pricing',facing:'supplier-facing',sentiment:'neu',state:'included',parties:['Sam Okoro (Acme)','Marc Lane'],subject:'Revised pricing for the 3-yr term',summary:'Acme sent a revised quote holding the per-seat rate but adding a 3% annual uplift.',detail:'Acme returned a revised pricing sheet after the last call. The per-seat rate holds at $1,500 but they added a 3% annual uplift and a longer payment term. Flagged for the ZOPA.'},
 {id:'cm-7',date:'2026-06-26',time:'9:02 AM',channel:'teams',topic:'pricing',facing:'supplier-facing',sentiment:'neu',state:'included',parties:['Sam Okoro (Acme)','Marc Lane'],subject:'Heads-up: revised quote on its way',summary:'Teams message from Acme flagging the revised pricing sheet would follow by email.',detail:'A short Teams message from Acme letting the team know the revised quote was coming by email later that day. Logged for the record.'},
 {id:'cm-2',date:'2026-06-22',time:'10:30 AM',channel:'meeting',topic:'negotiation',facing:'supplier-facing',sentiment:'pos',state:'included',parties:['Sam Okoro (Acme)','Marc Lane','Priya Shah'],subject:'Kickoff negotiation call',summary:'Constructive kickoff; agreed to exchange the security questionnaire and a revised quote.',detail:'First negotiation call. Tone constructive. Acme agreed to return the security questionnaire and a revised quote within the week. No commitments on price yet.'},
 {id:'cm-3',date:'2026-06-15',time:'4:48 PM',channel:'email',topic:'security',facing:'supplier-facing',sentiment:'neu',state:'included',parties:['Marc Lane','Sam Okoro (Acme)'],subject:'Security questionnaire request',summary:'Sent the WwTP security questionnaire; asked for the SOC 2 report and data-residency confirmation.',detail:'Sent Acme the security questionnaire on behalf of the WwTP review. Requested the current SOC 2 Type II report and written confirmation of US data residency.'},
 {id:'cm-4',date:'2026-06-10',time:'11:05 AM',channel:'email',topic:'legal',facing:'supplier-facing',sentiment:'neg',unresolved:true,deadline:'2026-06-20',state:'included',parties:['Dana Kim (Acme Legal)','Marc Lane'],subject:'Pushback on the AI addendum',summary:'Acme legal pushed back on the AI addendum language; the thread is unresolved past its deadline.',detail:'Acme legal objected to the standalone AI addendum, proposing to fold the terms into the MSA body. No agreement reached; the thread is past the stated response deadline and needs a reply.'},
 {id:'cm-5',date:'2026-05-30',time:'1:20 PM',channel:'meeting',topic:'commitment',facing:'supplier-facing',sentiment:'pos',state:'included',parties:['Sam Okoro (Acme)','Marc Lane'],subject:'Implementation scoping',summary:'Acme committed to a fixed implementation scope; logged as a commitment, not yet in the contract.',detail:'Scoping call. Acme committed verbally to a fixed implementation fee if signed by quarter end. Logged as a commitment for the contract; not yet papered.'},
 {id:'cm-6',date:'2026-04-15',time:'6:41 PM',channel:'call',topic:'relationship',facing:'supplier-facing',sentiment:'neu',offChannel:true,state:'included',parties:['Sam Okoro (Acme)','Marc Lane'],subject:'Personal-line call',summary:'Brief call on a personal line; flagged as off the procurement-controlled channel.',detail:'A short call reportedly took place on a personal line rather than the procurement-controlled channel. Off-channel contact is a communications-discipline concern; routed to the rep, the Lead, and Legal. Surface-only, nothing adjudicated.'},
 // ---- Review queue: candidates Theo surfaced but did NOT auto-include. Human-gated (Add / Skip). ----
 {id:'cm-c1',date:'2026-06-25',time:'8:57 AM',channel:'email',topic:'relationship',facing:'internal',sentiment:'neg',state:'candidate',personal:true,parties:['Priya Shah','Marc Lane'],subject:'Re: honestly, Jordan is hard to work with on this',summary:'Internal note venting about a teammate; mentions the Acme RFx deadline in a single line.',detail:'This internal email is largely a personal complaint about a colleague’s working style. It happens to reference the Acme RFx deadline in one line, which is why it surfaced. Theo held it as a candidate rather than filing it to the supplier record, it reads personal and its bearing on the RFx is marginal. A human decides whether it belongs here.'},
 {id:'cm-c2',date:'2026-06-20',time:'3:12 PM',channel:'teams',topic:'relationship',facing:'internal',sentiment:'neu',state:'candidate',parties:['Dev Rao','Marc Lane'],subject:'Did you see Acme in the analyst round-up?',summary:'Teams message forwarding an analyst round-up that name-checks Acme; relevance to this RFx is unclear.',detail:'A colleague forwarded an analyst round-up that mentions Acme among several vendors. It may or may not bear on this sourcing event. Held as a candidate for a human to decide rather than auto-filed.'}
]
  };
  S.projectView.boot = {
    tree: [
 {f:'Contracts',files:[
   {n:'MSA_Acme_draft_v3.docx',c:'DOC',st:'In review',cls:'draft',created:'2026-06-24',modified:'2026-06-27',ret:{c:'WORKING',p:'working copy - no long-term retention (supersede on execution)'},desc:'Working draft of the Acme master services agreement, in Legal review against the Lilly playbook; a working copy that supersedes once the contract is executed.'}
 ],sub:[
   {f:'Executed',files:[],sub:[
     {f:'2024',files:[
       {n:'MSA_Acme_2024_executed.pdf',c:'PDF',st:'Executed',tier:'cold',created:'2024-03-14',modified:'2024-03-14',ret:{c:'CONTRACT-ACTIVE',p:'retain 10 years post-expiration'},desc:'Fully executed 2024 Acme master agreement with both signatures, the governing contract of record; archived to cold storage and retained 10 years post-expiration.'}
     ]}
   ]}
 ]},
 {f:'Sourcing',files:[],sub:[]},
 {f:'Onboarding',files:[
   {n:'MSA_Acme_amendment1.docx',c:'DOC',st:'Filed',created:'2026-05-30',modified:'2026-05-30',ret:{c:'CONTRACT-ACTIVE',p:'retain 10 years post-expiration'},misfiled:{to:'Contracts',why:'A contract amendment is sitting in Onboarding. By name and content (an MSA amendment) it belongs in Contracts, with the master agreement.'},desc:'First amendment to the Acme master agreement. Currently filed under Onboarding but reads as a Contracts record, so it is flagged as possibly misfiled.'}
 ],sub:[
   {f:'Screening',files:[
     {n:'Acme_W-9.pdf',c:'PDF',st:'Filed',created:'2026-06-10',modified:'2026-06-10',ret:{c:'COMPLIANCE-EVIDENCE',p:'retain per the underlying obligation'},desc:'Supplier W-9 tax form collected during onboarding; retained as compliance evidence per the underlying obligation.'},
     {n:'Acme_SOC2.pdf',c:'PDF',st:'Filed',created:'2026-06-11',modified:'2026-06-11',ret:{c:'COMPLIANCE-EVIDENCE',p:'retain per the underlying obligation'},desc:'Acme SOC 2 Type II attestation supplied for the Cyber security review as third-party assurance evidence.'}
   ]}
 ]},
 {f:'Reviews',files:[
   {n:'ISS_security_questionnaire.docx',c:'DOC',st:'Awaiting',cls:'need',created:'2026-06-20',modified:'2026-06-26',ret:{c:'COMPLIANCE-EVIDENCE',p:'retain per the underlying obligation'},desc:'Information Security questionnaire awaiting the supplier response; the Cyber review gate depends on it before it can clear.'}
 ]},
 {f:'Risk & deviation approvals',files:[
   {n:'Risk_acceptance_Acme_residual.docx',c:'DOC',st:'Draft',cls:'draft',created:'2026-06-25',modified:'2026-06-28',ret:{c:'WORKING',p:'working copy - no long-term retention (supersede on execution)'},desc:'Draft risk-acceptance memo for the residual Cyber finding, prepared for owner and Information Security sign-off.'},
   {n:'Policy_deviation_approval_request.pdf',c:'PDF',st:'Pending',cls:'need',created:'2026-06-22',modified:'2026-06-22',ret:{c:'COMPLIANCE-EVIDENCE',p:'retain per the underlying obligation'},desc:'Policy-deviation approval request pending review; retained as compliance evidence for the exception.'},
   {n:'Cross-border_SCC_TIA.pdf',c:'PDF',st:'Filed',created:'2026-06-18',modified:'2026-06-18',ret:{c:'COMPLIANCE-EVIDENCE',p:'retain per the underlying obligation'},desc:'Standard Contractual Clauses and transfer impact assessment covering the cross-border employee-PI transfer.'}
 ]},
 {f:'(root)',files:[
   {n:'Acme_Analytics_Proposal.pdf',c:'PDF',st:'Filed',created:'2026-06-19',modified:'2026-06-21',ret:{c:'SOURCING-RECORD',p:'retain 7 years post-award'},desc:'Acme analytics proposal that seeded this engagement; retained as a sourcing record for 7 years post-award.'}
 ]}
],
    liveSla: [
 {n:'WwTP risk · supplier questionnaire',sys:'Aravo',node:'t-wwtp',el:9,sla:10,proj:12,st:'over',stt:'Overdue',note:'awaiting supplier',
  wait:[{who:'Acme (supplier)',act:'Return the completed WwTP questionnaire'},{who:'Dan Reed · WwTP analyst',act:'Issue the residual-risk determination'}]},
 {n:'Cyber → ISS questionnaire',sys:'ServiceNow',node:'r-cyber',el:6,sla:8,proj:9,st:'warn',stt:'In danger',note:'out to supplier',
  wait:[{who:'Acme (supplier)',act:'Complete the ISS security questionnaire'},{who:'James Wright · Security reviewer',act:'Review the responses and sign off'}]},
 {n:'Legal, MSA contractual review',sys:'LEAH',node:'r-legal',el:3,sla:7,proj:6,st:'ok',stt:'On track',note:'reviewing terms',
  wait:[{who:'Leah Carter · Legal counsel',act:'Finish the MSA terms review against the playbook'}]},
 {n:'Supplier enablement · SAP vendor ID',sys:'Ariba SLP',node:'t-enable',el:2,sla:12,proj:8,st:'ok',stt:'On track',note:'SAP vendor ID being issued',
  wait:[{who:'Ariba SLP (automated)',act:'Issue the SAP vendor ID'}]}
],
    chat: [{who:'Theo',av:'T',cls:'sys',tm:'6/23/2026 · 9:14 AM',tx:'Fanned out the work: Contract & reviews (Legal · Cyber · AI) · WwTP · Enablement.'},{who:'Priya Shah',av:'PS',cls:'own',tm:'6/24/2026 · 2:30 PM',tx:'Confirmed the data set includes employee PI.'},{who:'Marc Lane',av:'ML',cls:'rep',tm:'6/25/2026 · 6:02 AM',tx:'Sent Cyber the data-flow diagram. Priya, the ISS questionnaire is back to you.'},{who:'Claude assistant',av:'✦',cls:'ai',model:'Claude Opus 4.8',tm:'6/25/2026 · 8:09 AM',tx:'Concept (pending integration): the reviews gate is waiting on the supplier\'s WwTP questionnaire. I could pre-fill it in Aravo from the proposal + SOC 2, the supplier still confirms it there. Want to see a draft?',skill:'sec-answers'}]
  };
  S.projectView.commercial.demoPrep.$src = { anchor: [stub('Should-cost anchor, bottoms-up base (reflect-only)', 1)], bench: [stub('Market rate benchmark, labeled illustrative (reflect-only)', 1)] };

  // ======================================================================
  // P4/#133, FINAL pv business-data slices (relocated from the pv modules,
  // read back via Theo.data.projectViewSeed()). termsRenew (pv-10) · rfxNorm
  // (pv-09) · landscapeAug (pv-07). Illustrative reflect-only mock; the pv
  // modules read a fresh $src-stripped clone (byte-identical to the old inline
  // literals), so render + interaction are unchanged. Headline money/§ figures
  // carry $src (stripped on read); provenance is for the validator only.
  // ======================================================================

  // ---- pv-10 terms/renewal-deal: PERF_OBLIGATIONS · PRICING · SYSDATA ·
  //      ZOPA_LINES · DEAL_TCO · DEAL_ISSUES ----
  S.projectView.termsRenew = {
    perfObligations: [
 {ob:'Platform uptime',target:'>= 99.5% per month',remedy:'Service credits: 5% of the monthly fee for each 0.5% below target, capped at 25%.',standing:'Meeting it · 99.7% over the last 90 days',met:true,doc:'Base MSA',clause:'Sec 5 + Annex I'},
 {ob:'Support response · P1 (critical)',target:'<= 1 hour, 24x7',remedy:'Credit per Annex I for each breach; a chronic breach is a termination trigger.',standing:'1 miss in 12 months · within tolerance',met:true,doc:'Base MSA',clause:'Sec 5 Service Levels'},
 {ob:'Data-breach notification',target:'Notify Lilly within 24 hours of a known breach',remedy:'PI-breach liability should sit OUTSIDE the cap; the Sec 4 carve-out is still open (gap).',standing:'No incidents to date · cap carve-out still open',met:false,doc:'Change Order 3 · DPA',clause:'DPA cl. 9'},
 {ob:'SOC 2 Type II report',target:'Current report on file every year',remedy:'Right to suspend new processing until it is provided.',standing:'On file · next due 7/20',met:true,doc:'Base MSA',clause:'Sec 9 Security'}
    ],
    pricing: {
 benchmarks:[
  {item:'Platform subscription',ours:'$1,500 / seat',med:'$1,350 / seat',lo:'$1,150',hi:'$1,650',flag:'over',note:'11% above median',$src:{ours:[stub('Platform-subscription rate, supplier ask vs market median band (reflect-only)',1)]}},
  {item:'Implementation (one-time)',ours:'$120K',med:'$90K',lo:'$70K',hi:'$140K',flag:'over',note:'33% above median'},
  {item:'Premium support',ours:'$60K / yr',med:'$65K / yr',lo:'$45K',hi:'$85K',flag:'ok',note:'in line'},
  {item:'Sandbox / non-prod',ours:'included',med:'included',lo:'$0',hi:'$20K',flag:'ok',note:'often charged elsewhere'}
 ],
 normalize:{raw:'$600K/yr list + $120K implementation (one-time) + $60K/yr support · 400 seats · 3-yr term',
  normalized:'$1,650 / seat / yr all-in',
  note:'Normalized to one per-seat-per-year all-in figure (implementation amortized over the 3-year term, support included) so it is comparable to the market benchmark and to the two alternatives.'},
 reconcile:{from:'Per-seat flat · $1,500/seat x 400 = $600K/yr',
  to:'Tiered usage · $420K base + $0.45 per active-user-day',
  at:'400 seats · ~78% active today',
  delta:'+$36K/yr at current usage; breakeven at 62% active. Exposure rises if adoption climbs.'}
    },
    sysData: {
 captured:[
  ['Supplier','Acme Analytics (new) · US'],
  ['Need','AI employee-analytics platform · 400 seats · 3 yr'],
  ['Spend','$1.8M TCO ($600K / yr)'],
  ['CCI classification','Orange · employee PI'],
  ['Data','Employee PI · cross-border (US hosting)'],
  ['Standards','SPS · ISS · AIS'],
  ['Owner / Rep','Priya Shah / Marc Lane']
 ],
 systems:[
  {sys:'Aravo',need:'Third-party risk (WwTP) record',ready:false,fields:[['Supplier legal name','Acme Analytics, Inc.','intake'],['Data types processed','Employee PI','intake'],['Hosting region','US (AWS us-east)','SOC 2'],['Sub-processor list','needed','gap']]},
  {sys:'ServiceNow',need:'Security review (ISS) ticket',ready:false,fields:[['Engagement','Acme analytics platform','intake'],['Data classification','Orange','intake'],['SSO / SAML','Entra ID','proposal'],['Last pen-test date','needed','gap']]},
  {sys:'Ariba',need:'Supplier (SLP) + PR record',ready:true,fields:[['Supplier','Acme Analytics','intake'],['Category','IT Services','intake'],['Spend band','$1.8M','intake'],['Payment terms','Net 45','proposal']]},
  {sys:'SAP',need:'Vendor master ID',ready:false,fields:[['Legal name','Acme Analytics, Inc.','intake'],['Tax ID (W-9)','on file','onboarding'],['Remit-to address','needed','gap'],['Banking details','needed','gap']]},
  {sys:'LEAH',need:'Contract (CLM) record',ready:true,fields:[['Counterparty','Acme Analytics','intake'],['Contract type','MSA + initial WO','intake'],['Governing MSA','Acme MSA (2024)','contract'],['Term','3 yr','proposal']]}
 ]
    },
    zopa: [
 {item:'Licenses (per seat / yr)',unit:'seat',lo:1150,med:1350,hi:1650,ask:1500,target:1300,walk:1450,cadence:'seat-yr',bench:'Platform subscription',read:'Top of range and above median; anchor to the target and trade a longer term for a per-seat step-down.',$src:{ask:[stub('Supplier per-seat license ask, Acme proposal (reflect-only)',1)]}},
 {item:'Implementation (one-time)',unit:'K',lo:70,med:90,hi:140,ask:120,target:85,walk:110,cadence:'one-time',bench:'Implementation (one-time)',read:'33% above median and highly negotiable; push toward the $85K target or a fixed-fee cap.'},
 {item:'Premium support (per yr)',unit:'K',lo:45,med:65,hi:85,ask:60,target:55,walk:70,cadence:'yr',bench:'Premium support',read:'In line with market; hold near target, do not trade it away for a headline license cut.'}
    ],
    dealTco: { seats:400, years:3, $src:{ seats:[stub('Deal volume, Acme Work Order seat count (proposal)',1)], years:[stub('Deal term, 3-year MSA (proposal)',1)] } },
    issues: [
 {name:'Annual fee / unit price',cat:'Commercial',sev:'med',sec:'',neg:{target:'$540K/yr (3-yr lock)',fallback:'$600K with yr-1 ramp credit',hs:'> $640K/yr'},review:null},
 {name:'Liability cap',cat:'Legal',sev:'high',sec:'§4',neg:{target:'2x fees, no carve-out limit on PI breach',fallback:'1.5x fees, PI breach uncapped',hs:'< 1x fees'},review:{d:'§4 caps liability at 2x fees but applies the same cap to a personal-data breach.',fix:'Carve PI-breach liability out of the §4 cap (uncapped or a separate higher cap).',evidence:'"Except for the excluded claims in §4.3, each party\'s aggregate liability shall not exceed two times (2x) the fees paid in the prior twelve (12) months. No PI carve-out was added."',xref:'Base MSA §4 (Limitation of Liability); Lilly playbook LP-04',impact:'A personal-data breach could exceed the 2x-fees cap; the cap would limit Lilly\'s recovery for exactly the harm employee PI creates.',loc:'Base MSA §4, Limitation of Liability'},paper:{supplier:'Mutual cap at 1x fees, no PI carve-out',lilly:'1x cap with PI-breach carved OUT of the cap'}},
 {name:'IP ownership',cat:'Legal',sev:'high',sec:'',neg:{target:'Lilly owns outputs derived from Lilly data',fallback:'joint ownership of derived outputs',hs:'supplier owns all models trained on Lilly data'},review:{d:'The supplier retains all models trained on Lilly data; Lilly should own the outputs derived from Lilly data.',fix:'Add an IP clause: Lilly owns outputs and derivatives created from Lilly data.',evidence:'The Work Order is silent on ownership of models trained on Lilly data; MSA §9 grants Acme its background IP and does not assign Lilly-derived model outputs to Lilly.',xref:'Base MSA §9 (Intellectual Property); Work Order (silent)',impact:'Ambiguity over ownership of models and outputs derived from Lilly data; potential cross-client reuse of Lilly-tuned models.',loc:'Base MSA §9 / Work Order (no ownership clause)'},paper:{supplier:'Acme retains all models trained on Lilly data',lilly:'Lilly owns outputs derived from Lilly data'}},
 {name:'Sub-processors / data',cat:'Data-protection',sev:'high',sec:'§11',neg:{target:'Lilly DPA, prior-approval on sub-processors',fallback:'notice + objection right',hs:'no sub-processor control'},review:{d:'§11 lets the supplier appoint sub-processors with notice only; employee PI needs a prior-approval right.',fix:'Insert a prior-approval right plus an annual audit right (Lilly DPA cl. 7).',evidence:'"Acme may engage sub-processors on prior written notice to Lilly; Lilly may object within ten (10) business days." (No prior-approval right.)',xref:'Change Order 3 · DPA clause 5; Lilly DPA cl. 7 (audit right)',impact:'Acme can add a sub-processor over Lilly\'s objection; employee PI could reach an unvetted party before Lilly can act.',loc:'Change Order 3 · DPA clause 5'},paper:{supplier:'Acme standard DPA',lilly:'Lilly DPA + EU SCCs (employee PI)'}},
 {name:'Renewal pricing',cat:'Commercial',sev:'med',sec:'§3',neg:{target:'CPI-capped renewals (<= 3%)',fallback:'fixed yr-1 renewal',hs:'uncapped uplift'},review:{d:'§3 renews at then-current list price with no cap, exposing Lilly to open-ended increases.',fix:'Cap renewal uplift at CPI or 3%, whichever is lower.',evidence:'"Section 6 (Renewal) of the Base MSA is deleted and replaced: each renewal term prices at Acme\'s then-current list price." (Base MSA had capped renewals at CPI.)',xref:'Amendment 2 §3 (Renewal); Base MSA §6 (superseded)',impact:'Open-ended renewal uplift, the last indicative quote implied +9%; unbounded exposure across the 3-year term.',loc:'Amendment 2 §3 (replacing Base MSA §6)'}},
 {name:'Term & exit',cat:'Legal',sev:'med',sec:'',neg:{target:'3 yrs + 30-day termination for convenience',fallback:'2 yrs + 60-day',hs:'no convenience exit'},review:null,paper:{supplier:'For cause only, 90-day cure',lilly:'Adds termination for convenience, 30-day notice'}},
 {name:'Governing-law venue',cat:'Legal',sev:'low',sec:'§18',neg:{target:'Neutral or Lilly-favourable venue',fallback:'supplier venue with carve-outs',hs:''},review:{d:'§18 specifies the supplier home venue; playbook prefers neutral or Lilly-favourable.',fix:'Propose a neutral venue (Delaware). Low priority.',evidence:'"§18 designates the courts of California (Acme\'s home venue) as the exclusive forum for disputes arising under this Agreement."',xref:'Base MSA §18 (Governing Law & Venue)',impact:'Disputes would be litigated on Acme\'s home turf; a minor cost and leverage disadvantage.',loc:'Base MSA §18'},paper:{supplier:'California (Acme home)',lilly:'Delaware (neutral) or Indiana'}}
    ]
  };

  // ---- pv-09 RFx pricing-normalization: RFX_NORM (competitive-RFP cross-supplier ZOPA) ----
  // Round-2 rework (2026-07-26) RECONCILED the price-scale mismatch: this block previously read
  // ~$3M/yr per bidder (seat rate x 400 seats), while RFX.suppliers[].pricing.annual reads
  // ~$1M/yr (Nimbus $980,000, Lakehouse $1,060,000) and the RFP intent/rfx.tco both state
  // ~$3.2M over the 3-yr term (~$1.07M/yr), not ~$3M/yr. Platform-fee and Support (the two
  // recurring, "/yr" lines) are rescaled to the ~$1M/yr annual scale so ZOPA, Business Case and
  // the intro agree; Implementation (a one-time $K line, not "/yr") was already in scale and is
  // untouched. The relative ORDER is also corrected to match RFX.suppliers: Nimbus's combined
  // platform+support run-rate (~$976K/yr) now sits BELOW Lakehouse's (~$1.06M/yr, exact match to
  // its submitted annual fee), matching Nimbus's "most aggressive price in the field" narrative,
  // which the old (unscaled) figures contradicted (Nimbus priced above Lakehouse there).
  // Round-3 rework (2026-07-26) FIXED a pricing contradiction: Helio Warehouse's own RFP response
  // (RFX.suppliers[].pricing.annual = 'Not submitted', and its narrative says so explicitly, "no
  // price, no MSA and no implementation plan") disagreed with this block, which previously carried
  // fabricated per-line asks/rawAnnual/seat figures for Helio. Helio is kept in `bidders` (its color
  // + name are still referenced elsewhere, e.g. category-leader chips) but with NO priced figures at
  // all, so every consumer (Commercial Comparison, Cross-Supplier ZOPA, Individual ZOPA) reads it as
  // unpriced, honest gap-state, not a zero and not a guess.
  S.projectView.rfxNorm = {
 unit:'$ / seat / yr',termNote:'400 seats · 3-yr term',
 bidders:[
  {id:'nimbus',name:'Nimbus Data',finalist:true,col:'#0F3A85',basis:'Consumption + committed-use (per credit)',rawAnnual:'~$820K / yr',seat:2050,norm:{clean:false,method:'Committed-use annual divided by 400 seats over the 3-yr term.',assumption:'Consumption credits vary by workload, so overage is priced at the committed tier and a peak-concurrency assumption is applied, the per-seat figure moves up if actual usage runs hot.'}},
  {id:'lakehouse',name:'Lakehouse Co',finalist:true,col:'#6A4C93',basis:'Flat committed-use (per cluster)',rawAnnual:'~$890K / yr',seat:2225,norm:{clean:true,method:'Flat committed annual divided by 400 seats.',assumption:'Cleanest of the field to normalize, a fixed annual with no consumption variability or bundling to unpick.'}},
  {id:'helio',name:'Helio Warehouse',finalist:false,col:'#A6541C',basis:'Not submitted',priced:false}
 ],
 lines:[
  {item:'Platform fee',unit:'$/seat/yr',lo:1600,hi:2400,target:1950,walk:2150,asks:{nimbus:2050,lakehouse:2225},$src:{target:[stub('Platform-fee negotiation target, normalized $/seat/yr (reflect-only)',1)]}},
  {item:'Implementation',unit:'$K one-time',lo:70,hi:150,target:90,walk:130,asks:{nimbus:140,lakehouse:120}},
  {item:'Support',unit:'$/seat/yr',lo:280,hi:480,target:360,walk:410,asks:{nimbus:390,lakehouse:425}}
 ]
  };

  // ---- pv-07 landscape augmentation: PVSL_ESG · PVSL_ESG_NARR · PV_EXEC_AUTH ·
  //      PVSL_RFX_SUGGEST (illustrative reflect-only vendor reads injected at render) ----
  S.projectView.landscapeAug = {
    esg: {nimbus:1.6,lakehouse:1.8,helio:2.6,aurora:2.2,vertex:2.0,meridian:2.1,quanta:3.3},
    esgNarr: {
 nimbus:'Public net-zero and DEI commitments with established governance disclosure; strong regulatory posture (SOC 2 Type II + ISO 27001). Illustrative, external, not validated.',
 lakehouse:'Public ESG commitments and mature governance; late-stage-private disclosure is lighter than a listed issuer. Illustrative, external.',
 helio:'Smaller vendor, ESG disclosure and formal governance are lighter, regulatory posture (TPRM) in progress. Illustrative, external.',
 aurora:'Stated sustainability goals; governance disclosure is forming. Illustrative, external.',
 vertex:'Net-zero roadmap stated; moderate governance disclosure. Illustrative, external.',
 meridian:'Adequate governance disclosure and a stated ESG program. Illustrative, external.',
 quanta:'Price-led challenger, ESG disclosure and formal governance unconfirmed; regulatory posture is a watch item. Illustrative, external.'
    },
    execAuth: {nimbus:{comp:87,risk:1.8},lakehouse:{comp:82,risk:1.5},helio:{comp:68,risk:2.6}},
    rfxSuggest: [
 {id:'sug:fabric',n:'Microsoft Fabric / Synapse (incumbent-adjacent)',why:'Enterprise data platform already under Lilly\'s Microsoft agreement, qualified on the warehouse, governance and security requirements; including it adds competitive tension at low switching cost.'},
 {id:'sug:incumbent-wh',n:'Current on-prem warehouse vendor (incumbent)',why:'The platform this consolidation would replace, qualified on the core requirements; include to benchmark switching cost and hold as a downshift lever.'}
    ]
  };
})();
