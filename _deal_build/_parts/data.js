/* =============================================================================
 * data.js — the SINGLE canonical model that drives every tab of the Deal artifact.
 *
 * Exposes one global:  const dashboardData = {...}
 *
 * HARD RULES (see DEAL-REDESIGN-BRIEF.md):
 *  - One object drives ALL tabs. No fact is hard-coded twice in the UI.
 *  - The SAME issue object drives Brief top-issues + Contract register +
 *    Negotiation positions + Meeting Brief + Sources cross-ref. Look them up by id.
 *  - Every material value carries an evidenceType from this fixed set:
 *      'contract'   Contract fact  (text in an uploaded/related contract)
 *      'internal'   Internal fact  (playbook / template / finance / risk / M365)
 *      'public'     Public fact    (credible external source)
 *      'calculated' Calculated     (client-side arithmetic over the above)
 *      'inference'  Claude inference (reasoned, not directly stated)
 *      'assumption' User assumption (editable LOCAL input)
 *      'unavailable'Unavailable    (not in session — drives a gap, never a fake panel)
 *  - Plain-language coverage only: 'Strong' | 'Moderate' | 'Limited'. Never a % .
 *  - Sample data = an ILLUSTRATIVE Visier (people-analytics SaaS) MSA + SOW deal.
 *    Internally consistent, fully evidence-classified, NOT a live record.
 * ========================================================================== */
const dashboardData = {

  /* ---- session envelope: this is a snapshot, say so in the UI --------------- */
  meta: {
    artifactKind: 'session-snapshot',
    generatedAt: '2026-07-23T14:10:00',
    disclaimer: 'Session snapshot — a single Claude analysis of the information available at generation time. Not a live system, not a version of record. Figures are illustrative and internally consistent for a sample Visier deal.',
    contractSet: 'new-msa-plus-sow'   // drives adaptive tabs: MSA + initial SOW both present
  },

  /* ---- 1. deal ------------------------------------------------------------- */
  deal: {
    title: 'Visier People Analytics — Master Services Agreement + Initial SOW',
    supplier: 'Visier Inc.',
    supplierCategory: 'HR / People-Analytics SaaS',
    projectId: 'PRJ-2026-0417',
    analysisDate: '2026-07-23',
    negotiationType: 'New MSA + initial Statement of Work (SaaS subscription + implementation)',
    stage: 'Pre-negotiation redline review',
    counterparties: { buyer: 'Eli Lilly and Company', supplier: 'Visier Inc.' },
    evidenceCoverage: 'Moderate',   // Strong | Moderate | Limited
    recommendation: {
      stance: 'Negotiate — do not sign as drafted',
      headline: 'Sound platform fit, but three signature-blocking terms and a soft commercial anchor.',
      rationale: 'The MSA is broadly workable and the SOW scope matches the stated objective, but the liability cap, auto-renewal, and data-protection terms sit outside playbook tolerance and must move before signature. Commercials are anchored high versus internal precedent, leaving a credible path to a low-seven-figure reduction across the initial term.',
      conditions: [
        { text: 'Liability cap raised from 12 months to at least 24 months of fees, with data-breach and confidentiality carve-outs uncapped or super-capped.', issueId: 'ISS-01' },
        { text: 'Auto-renewal converted to opt-in, or notice window cut from 90 to 30 days with a price-increase cap at renewal.', issueId: 'ISS-04' },
        { text: 'Signed DPA with EU SCCs and a defined sub-processor change-notice mechanism attached before execution.', issueId: 'ISS-03' }
      ],
      limitations: [
        'DPA and Security Exhibit were referenced in the MSA but not provided in this session — protection assessment on data terms is Limited.',
        'No prior-year Visier pricing or a competing quote is in-session; the benchmark rests on one internal analytics precedent.',
        'Internal budget ceiling for FY27 was not supplied; max-acceptable is a working assumption, not an approved figure.'
      ]
    },
    // compact top-strip values (each clickable -> jump-to). Counts, not a score.
    summaryStrip: [
      { key: 'hardStops',    label: 'Hard stops',            value: 2,  tone: 'danger', jump: 'tab:contract/sub:terms', evidenceType: 'calculated' },
      { key: 'high',         label: 'High-priority issues',  value: 7,  tone: 'warn',   jump: 'tab:contract/sub:terms', evidenceType: 'calculated' },
      { key: 'unresolved',   label: 'Open / unresolved',     value: 9,  tone: 'warn',   jump: 'tab:contract/sub:terms', evidenceType: 'calculated' },
      { key: 'signConds',    label: 'Signature conditions',  value: 3,  tone: 'danger', jump: 'tab:brief',              evidenceType: 'inference' },
      { key: 'tcvGap',       label: 'Target vs ask (3-yr)',  value: '−$0.68M', tone: 'info', jump: 'tab:commercials/sub:scenarios', evidenceType: 'calculated' }
    ]
  },

  /* ---- 2. documents -------------------------------------------------------- */
  // role: governing | ordering | scope | data | security | correspondence | reference
  documents: [
    { id: 'DOC-01', name: 'Visier Master Services Agreement (v3 redline)', type: 'MSA', status: 'Draft — supplier paper, 2nd redline', date: '2026-07-15', sourceType: 'Uploaded contract', role: 'governing', relatedTo: ['DOC-02','DOC-03'], pages: 34, evidenceType: 'contract', limitations: [] },
    { id: 'DOC-02', name: 'SOW-01 — Platform Implementation & Data Onboarding', type: 'SOW', status: 'Draft — under review', date: '2026-07-15', sourceType: 'Uploaded contract', role: 'scope', relatedTo: ['DOC-01','DOC-03'], pages: 11, evidenceType: 'contract', limitations: [] },
    { id: 'DOC-03', name: 'Order Form — Subscription & Fees', type: 'Order Form', status: 'Draft', date: '2026-07-15', sourceType: 'Uploaded contract', role: 'ordering', relatedTo: ['DOC-01','DOC-02'], pages: 3, evidenceType: 'contract', limitations: [] },
    { id: 'DOC-04', name: 'Data Processing Addendum (DPA)', type: 'DPA', status: 'Referenced, not provided', date: null, sourceType: 'Referenced in MSA §9.4', role: 'data', relatedTo: ['DOC-01'], pages: null, evidenceType: 'unavailable', limitations: ['Not in session — data-protection assessment is Limited and partly inferred from the MSA body.'] },
    { id: 'DOC-05', name: 'Security & Availability Exhibit (Exhibit B)', type: 'Exhibit', status: 'Referenced, not provided', date: null, sourceType: 'Referenced in MSA §7.2', role: 'security', relatedTo: ['DOC-01'], pages: null, evidenceType: 'unavailable', limitations: ['Not in session — SLA credit schedule and security controls could not be verified.'] },
    { id: 'DOC-06', name: 'Supplier redline cover email (07-15)', type: 'Email', status: 'Received', date: '2026-07-15', sourceType: 'M365 / Outlook', role: 'correspondence', relatedTo: ['DOC-01'], pages: null, evidenceType: 'internal', limitations: [] }
  ],

  /* ---- 3. issues (THE spine — referenced by id everywhere) ------------------ */
  // category: Liability | Data & Privacy | Commercial | Term & Renewal | Service Levels |
  //           IP | Audit & Compliance | Scope & Acceptance | Continuity
  // priority: 'hard-stop' | 'high' | 'medium' | 'low'
  // internalDecision: 'pending' | 'accept' | 'reject' | 'trade'
  issues: [
    {
      id: 'ISS-01', title: 'Liability cap set at 12 months of fees, all damages capped',
      category: 'Liability', priority: 'hard-stop', documentId: 'DOC-01', clause: 'MSA §11.2 (Limitation of Liability)',
      supplierPosition: 'Aggregate liability capped at fees paid in the 12 months preceding the claim; all categories capped, no carve-outs.',
      sourceExcerpt: '“…the total aggregate liability of either party … shall not exceed the fees paid by Customer in the twelve (12) months preceding the event giving rise to the claim.”',
      playbookPosition: 'Minimum 24 months fees for SaaS handling workforce data; data-breach, confidentiality and IP-infringement liability must be uncapped or super-capped at 3× fees.',
      deviation: 'Cap is half the floor and contains no carve-outs for the highest-exposure events.',
      impact: 'A workforce-data breach could generate exposure far exceeding a single year of fees; a 12-month all-inclusive cap leaves the buyer materially under-protected.',
      recommendedPosition: '24-month cap; data-breach and confidentiality breaches carved out to a 3× super-cap; IP indemnity uncapped.',
      fallback: '24-month cap with a 2× super-cap on data-breach only.',
      hardStop: '12-month all-inclusive cap with no data-breach carve-out.',
      supplierPushback: '“Our standard cap is 12 months; super-caps are non-standard and require executive approval.”',
      recommendedResponse: 'Anchor on the workforce-data sensitivity and regulatory exposure; offer to accept a 24-month cap (not 3×) if the data-breach super-cap holds.',
      tradeOpportunity: 'Buyer can concede the mutual 24-month cap symmetry in exchange for the data-breach carve-out.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','PLAYBOOK-01']
    },
    {
      id: 'ISS-02', title: 'Mutual indemnity narrow; no IP-infringement defense of the platform',
      category: 'Liability', priority: 'high', documentId: 'DOC-01', clause: 'MSA §10.1–10.3 (Indemnification)',
      supplierPosition: 'Supplier indemnifies only for third-party bodily injury and tangible property damage; no IP-infringement indemnity for the platform.',
      sourceExcerpt: '“Supplier shall indemnify Customer against third-party claims for bodily injury or damage to tangible property arising from Supplier’s gross negligence…”',
      playbookPosition: 'SaaS supplier must indemnify and defend against third-party claims that the service infringes IP, with a repair/replace/refund remedy.',
      deviation: 'IP-infringement indemnity absent entirely; injury/property indemnity gated on “gross” negligence.',
      impact: 'If a third party alleges the platform infringes their IP, the buyer bears its own defense and any settlement.',
      recommendedPosition: 'Add standard IP-infringement indemnity with defense obligation and repair/replace/refund; remove the “gross” qualifier.',
      fallback: 'IP indemnity capped at the super-cap; retain “gross” qualifier on injury only.',
      hardStop: 'No IP-infringement indemnity of any kind.',
      supplierPushback: '“IP indemnity is covered by the general warranty.”',
      recommendedResponse: 'Distinguish warranty (a promise) from indemnity (a defense obligation); the platform aggregates third-party data connectors, raising real IP exposure.',
      tradeOpportunity: 'Pair with ISS-01 super-cap — a single liability package.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','PLAYBOOK-01']
    },
    {
      id: 'ISS-03', title: 'Data-protection terms reference an unsigned DPA; no SCCs attached',
      category: 'Data & Privacy', priority: 'hard-stop', documentId: 'DOC-01', clause: 'MSA §9.4 (Data Protection)',
      supplierPosition: 'MSA states a DPA “will be entered into” but none is attached; no EU Standard Contractual Clauses referenced.',
      sourceExcerpt: '“The parties will enter into a Data Processing Addendum in Supplier’s standard form, which is incorporated herein by reference.”',
      playbookPosition: 'A signed DPA with EU SCCs and a sub-processor change-notice mechanism must be attached and executed at signature for any processor of employee personal data.',
      deviation: 'DPA incorporated “by reference” but not provided; no SCCs; sub-processor notice mechanism unstated.',
      impact: 'Processing of global workforce personal data without an executed, reviewed DPA is a compliance exposure and likely a policy blocker.',
      recommendedPosition: 'Attach and execute a reviewed DPA with EU SCCs, a 30-day sub-processor objection right, and breach-notice within 72 hours, before MSA signature.',
      fallback: 'Execute DPA within 15 days of MSA signature with the platform paused for production data until executed.',
      hardStop: 'Signature with no DPA and no SCCs.',
      supplierPushback: '“Our standard DPA is sufficient and rarely modified.”',
      recommendedResponse: 'Require the actual DPA text in-session for review; “standard and rarely modified” is not a substitute for reviewing the sub-processor and SCC terms.',
      tradeOpportunity: 'Low trade value — this is a compliance gate, not a lever.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','DOC-04','PLAYBOOK-01']
    },
    {
      id: 'ISS-04', title: 'Auto-renewal with 90-day notice and uncapped renewal uplift',
      category: 'Term & Renewal', priority: 'high', documentId: 'DOC-01', clause: 'MSA §3.2 / Order Form §4 (Term & Renewal)',
      supplierPosition: 'Auto-renews for successive 12-month terms unless cancelled 90 days before expiry; renewal price “at then-current list.”',
      sourceExcerpt: '“…renew automatically for successive one-year periods unless either party provides written notice at least ninety (90) days prior … at Supplier’s then-current list price.”',
      playbookPosition: 'Auto-renewal acceptable only with a ≤30-day notice window and a contractual cap on renewal price increases (CPI or 3–5%).',
      deviation: '90-day window (3× tolerance) and no renewal-price cap expose the buyer to an unbounded uplift.',
      impact: 'A missed 90-day window locks in another year at an uncapped increase; renewal leverage is lost.',
      recommendedPosition: 'Opt-in renewal, or 30-day notice with renewal uplift capped at CPI or 4%, whichever is lower.',
      fallback: '45-day notice with a 5% renewal cap.',
      hardStop: '90-day window with no price cap.',
      supplierPushback: '“90 days is needed for capacity planning; list price protects our roadmap investment.”',
      recommendedResponse: 'Offer a 45-day window in exchange for the uplift cap; capacity planning does not require a pricing free hand.',
      tradeOpportunity: 'Concede notice window (45 vs 30) to win the renewal-price cap.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','DOC-03','PLAYBOOK-01']
    },
    {
      id: 'ISS-05', title: 'No termination for convenience for the customer',
      category: 'Term & Renewal', priority: 'medium', documentId: 'DOC-01', clause: 'MSA §12.1 (Termination)',
      supplierPosition: 'Termination only for uncured material breach; no convenience right for the customer; fees non-refundable.',
      sourceExcerpt: '“Either party may terminate for material breach uncured within thirty (30) days. Fees are non-cancellable and non-refundable.”',
      playbookPosition: 'Prefer a convenience-termination right after year 1 with pro-rata refund of prepaid, unused fees.',
      deviation: 'No convenience exit; prepaid fees fully sunk on any exit.',
      impact: 'If the platform underdelivers, the buyer is locked in for the full term with no refund path.',
      recommendedPosition: 'Convenience termination after month 12 with 60-day notice and pro-rata refund of unused prepaid fees.',
      fallback: 'Convenience right only at each anniversary.',
      hardStop: 'None — this is a trade item, not a gate.',
      supplierPushback: '“Subscriptions are committed; convenience termination undermines the discount.”',
      recommendedResponse: 'Tie the convenience right to a sustained SLA miss rather than a free walk-away, if a clean convenience right is refused.',
      tradeOpportunity: 'High trade value — can be conceded to protect ISS-01/03.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','PLAYBOOK-01']
    },
    {
      id: 'ISS-06', title: 'Uptime SLA 99.5% with weak, capped service credits',
      category: 'Service Levels', priority: 'high', documentId: 'DOC-01', clause: 'MSA §7.2 / Exhibit B (referenced)',
      supplierPosition: '99.5% monthly uptime; credit of 5% of monthly fee per 1% below target, capped at 15%; credits are sole remedy.',
      sourceExcerpt: '“Supplier will use commercially reasonable efforts to achieve 99.5% availability … service credits are Customer’s sole and exclusive remedy.”',
      playbookPosition: '99.9% for a system-of-engagement analytics platform; credits meaningful (up to 100% of monthly fee); chronic-failure termination right.',
      deviation: '99.5% target (≈3.6h/mo permitted downtime), credit cap low, and “sole remedy” blocks other recourse.',
      impact: 'A quarter of degraded service yields a token credit and no exit; downtime during quarterly reporting is costly.',
      recommendedPosition: '99.9% target; credits scaled to 50% of monthly fee; three consecutive misses trigger a termination right.',
      fallback: '99.7% with a chronic-failure termination right retained.',
      hardStop: 'None — but chronic-failure exit is a firm ask.',
      supplierPushback: '“99.5% is our contractual standard; 99.9% is an enterprise-tier upgrade.”',
      recommendedResponse: 'Ask whether 99.9% is genuinely a paid tier or a negotiation posture; require the actual achieved-uptime history to justify 99.5%.',
      tradeOpportunity: 'Data gap (Exhibit B) — resolve before trading.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','DOC-05','PLAYBOOK-01']
    },
    {
      id: 'ISS-07', title: 'Customer configurations and dashboards deemed supplier IP',
      category: 'IP', priority: 'high', documentId: 'DOC-01', clause: 'MSA §8.3 (Intellectual Property)',
      supplierPosition: 'All configurations, dashboards and derived analytics models are supplier IP; customer gets a license during the term only.',
      sourceExcerpt: '“All configurations, templates and analytic models created within the Service shall be the exclusive property of Supplier.”',
      playbookPosition: 'Customer-specific configurations and dashboards built with customer data should be customer-owned or perpetually licensed; customer data is unambiguously customer-owned.',
      deviation: 'Supplier claims ownership of buyer-built configurations and dashboards, retrievable only during the term.',
      impact: 'On exit, the buyer loses the dashboards and models it built and paid to configure; raises switching cost and lock-in.',
      recommendedPosition: 'Customer owns customer-specific configurations and dashboards; supplier retains platform IP; customer data always customer-owned with export rights.',
      fallback: 'Perpetual, royalty-free licence to configurations plus a defined export format on exit.',
      hardStop: 'Supplier ownership of customer data (not just configs).',
      supplierPushback: '“Configurations rely on our proprietary modelling engine.”',
      recommendedResponse: 'Separate the engine (theirs) from the buyer’s specific configuration and dashboard layer (buyer’s); require machine-readable export on exit either way.',
      tradeOpportunity: 'Bundle with ISS-05 continuity/exit terms.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','PLAYBOOK-01']
    },
    {
      id: 'ISS-08', title: 'Sub-processors listed by reference; no change-notice or objection right',
      category: 'Data & Privacy', priority: 'medium', documentId: 'DOC-01', clause: 'MSA §9.6 (Sub-processors)',
      supplierPosition: 'Supplier may add or replace sub-processors at any time; list maintained on a webpage; no notice to customer.',
      sourceExcerpt: '“Supplier may engage sub-processors and will maintain a current list at its website; continued use constitutes consent.”',
      playbookPosition: 'Advance notice of new sub-processors (≥30 days) with a right to object; onward-transfer safeguards required.',
      deviation: 'No notice, no objection right; “continued use = consent” is not affirmative consent.',
      impact: 'A new sub-processor in a high-risk jurisdiction could be added silently, undermining the data-transfer posture.',
      recommendedPosition: '30-day advance email notice of new sub-processors with a good-faith objection-and-remediation right.',
      fallback: 'Notice via a subscribed change-feed with 15-day objection window.',
      hardStop: 'None.',
      supplierPushback: '“Web-list notice is standard SaaS practice.”',
      recommendedResponse: 'Web-list without push notice is not sufficient for employee data; require an emailed change-feed at minimum.',
      tradeOpportunity: 'Fold into the DPA negotiation (ISS-03).',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','DOC-04','PLAYBOOK-01']
    },
    {
      id: 'ISS-09', title: 'Audit rights limited to a SOC 2 report once per year',
      category: 'Audit & Compliance', priority: 'low', documentId: 'DOC-01', clause: 'MSA §7.5 (Audit)',
      supplierPosition: 'Customer audit satisfied by an annual SOC 2 Type II report; no on-site or for-cause audit right.',
      sourceExcerpt: '“Supplier will provide its SOC 2 Type II report annually in lieu of any audit right.”',
      playbookPosition: 'SOC 2 acceptable for routine assurance, plus a for-cause audit right following a security incident.',
      deviation: 'No for-cause audit right after an incident.',
      impact: 'After a breach, the buyer cannot independently verify remediation.',
      recommendedPosition: 'Keep SOC 2 for routine assurance; add a for-cause audit (or independent assessor) right triggered by a reportable incident.',
      fallback: 'For-cause right satisfied by an agreed third-party assessor’s report.',
      hardStop: 'None.',
      supplierPushback: '“SOC 2 is comprehensive and independently assured.”',
      recommendedResponse: 'SOC 2 is periodic and general; a for-cause right is incident-specific — the two are complementary, not redundant.',
      tradeOpportunity: 'Low-cost concession item for the supplier — easy give to bank goodwill.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-01','PLAYBOOK-01']
    },
    {
      id: 'ISS-10', title: 'SOW acceptance is deemed after 10 days of silence',
      category: 'Scope & Acceptance', priority: 'high', documentId: 'DOC-02', clause: 'SOW-01 §5 (Acceptance)',
      supplierPosition: 'Each deliverable is deemed accepted if the customer does not reject in writing within 10 business days.',
      sourceExcerpt: '“Deliverables shall be deemed accepted unless Customer provides written notice of non-conformance within ten (10) business days.”',
      playbookPosition: 'Acceptance requires positive sign-off against written acceptance criteria; deemed-acceptance windows ≥20 business days with defined criteria.',
      deviation: 'Silence = acceptance in a short window, and the SOW lists no objective acceptance criteria.',
      impact: 'A busy stakeholder could “accept” a non-conforming milestone by inaction, weakening remedies and triggering payment.',
      recommendedPosition: 'Positive sign-off against acceptance criteria defined per milestone; 20-business-day review; a cure period on rejection.',
      fallback: 'Deemed acceptance at 20 business days but only against written criteria.',
      hardStop: 'Deemed acceptance with no acceptance criteria at all.',
      supplierPushback: '“Deemed acceptance keeps the project timeline moving.”',
      recommendedResponse: 'Timelines are protected by criteria + a cure period, not by a silence trap; offer a named reviewer with an SLA on turnaround.',
      tradeOpportunity: 'Links to SOW milestone schedule — negotiate together.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-02','PLAYBOOK-01','TEMPLATE-01']
    },
    {
      id: 'ISS-11', title: 'Annual price uplift uncapped after the initial 3-year term',
      category: 'Commercial', priority: 'high', documentId: 'DOC-03', clause: 'Order Form §4.2 (Fees)',
      supplierPosition: 'Fees fixed for the 3-year initial term; thereafter “at then-current list price” with no cap.',
      sourceExcerpt: '“Subscription fees are fixed during the Initial Term and thereafter adjust to Supplier’s then-current list price.”',
      playbookPosition: 'Post-term uplift capped at CPI or a fixed 3–5%; a price-protection window beyond the initial term.',
      deviation: 'No cap on the first post-term renewal — pairs with ISS-04 auto-renewal to create real exposure.',
      impact: 'Year-4 fees could jump materially with the buyer already locked into the platform.',
      recommendedPosition: 'Cap post-term uplift at CPI or 4% for renewals 4 and 5; extend price protection two years past initial term.',
      fallback: '5% cap for the first renewal only.',
      hardStop: 'None on its own — but jointly with ISS-04 it is high-priority.',
      supplierPushback: '“List pricing rises with roadmap investment.”',
      recommendedResponse: 'Fixed-term protection is meaningless if year 4 is unbounded; a CPI cap still lets list price rise with the market.',
      tradeOpportunity: 'Package with ISS-04 renewal terms.',
      internalDecision: 'pending',
      evidenceType: 'contract', sourceIds: ['DOC-03','PLAYBOOK-01']
    },
    {
      id: 'ISS-12', title: 'Total contract value anchored ~15% above internal precedent',
      category: 'Commercial', priority: 'high', documentId: 'DOC-03', clause: 'Order Form §2 (Fees) + SOW-01 §7',
      supplierPosition: 'Year-1 all-in of $1.168M (platform $780K + implementation $220K + support $95K + connectors $45K + training $28K).',
      sourceExcerpt: 'Order Form §2 subscription and SOW-01 §7 fee schedule (see Commercials tab for the line-item breakdown).',
      playbookPosition: 'Target discount to internal precedent benchmark; implementation and support are the most negotiable lines.',
      deviation: 'Ask sits ≈15% above the comparable internal analytics deal on a per-user basis (see Benchmarks).',
      impact: 'Accepting the ask overpays by an estimated $0.6M across the 3-year term versus a defensible target.',
      recommendedPosition: 'Anchor to the target scenario ($908K Y1); implementation and premium support carry the largest concessions.',
      fallback: 'Fallback scenario ($1.008M Y1) if platform discount is resisted.',
      hardStop: 'Above the max-acceptable Y1 of $1.07M.',
      supplierPushback: '“Pricing reflects the platform’s premium analytics capability.”',
      recommendedResponse: 'Separate platform value (defensible) from implementation and support loading (negotiable); benchmark the services lines against day-rate norms.',
      tradeOpportunity: 'Multi-year prepay or a case-study reference can fund a platform discount.',
      internalDecision: 'pending',
      evidenceType: 'calculated', sourceIds: ['DOC-03','DOC-02','FIN-01','BENCH-int']
    }
  ],

  /* ---- 4. scope (SOW-01 — prominent because a SOW exists) ------------------- */
  scope: {
    objective: 'Stand up Visier People Analytics for ~18,000 employees: onboard core HR data sources, configure the standard workforce-analytics model, deliver an executive dashboard set, and train the people-analytics team.',
    objectiveEvidence: 'contract',
    inScope: [
      { text: 'Onboarding of 4 core data sources (HRIS, payroll, recruiting, learning).', evidenceType: 'contract' },
      { text: 'Configuration of Visier’s standard workforce-analytics content model.', evidenceType: 'contract' },
      { text: 'Executive and manager dashboard set (up to 12 dashboards).', evidenceType: 'contract' },
      { text: 'Admin and analyst training (2 sessions, up to 25 users).', evidenceType: 'contract' },
      { text: 'Single-sign-on and role-based access configuration.', evidenceType: 'contract' }
    ],
    outOfScope: [
      { text: 'Custom data-source connectors beyond the 4 named sources.', evidenceType: 'contract' },
      { text: 'Bespoke predictive models beyond the standard content pack.', evidenceType: 'contract' },
      { text: 'Historical data migration older than 3 years.', evidenceType: 'contract' },
      { text: 'Integration with non-HR systems (finance, CRM).', evidenceType: 'inference' }
    ],
    deliverables: [
      { id: 'D1', name: 'Data-source integration (4 sources)', milestone: 'M2', owner: 'Supplier', acceptanceRef: 'AC-1', evidenceType: 'contract' },
      { id: 'D2', name: 'Configured content model + validation', milestone: 'M3', owner: 'Supplier', acceptanceRef: 'AC-2', evidenceType: 'contract' },
      { id: 'D3', name: 'Dashboard set (up to 12)', milestone: 'M4', owner: 'Supplier', acceptanceRef: 'AC-3', evidenceType: 'contract' },
      { id: 'D4', name: 'SSO / RBAC configuration', milestone: 'M4', owner: 'Joint', acceptanceRef: 'AC-3', evidenceType: 'contract' },
      { id: 'D5', name: 'Admin + analyst training (2 sessions)', milestone: 'M5', owner: 'Supplier', acceptanceRef: 'AC-4', evidenceType: 'contract' }
    ],
    milestones: [
      { id: 'M1', name: 'Kickoff & discovery', date: '2026-09-01', end: '2026-09-15', dependsOn: [],          evidenceType: 'contract' },
      { id: 'M2', name: 'Data onboarding',    date: '2026-09-15', end: '2026-10-20', dependsOn: ['M1'],       evidenceType: 'contract' },
      { id: 'M3', name: 'Model configuration', date: '2026-10-20', end: '2026-11-17', dependsOn: ['M2'],       evidenceType: 'contract' },
      { id: 'M4', name: 'Dashboards + access',  date: '2026-11-17', end: '2026-12-15', dependsOn: ['M3'],       evidenceType: 'contract' },
      { id: 'M5', name: 'Training & go-live',   date: '2026-12-15', end: '2027-01-12', dependsOn: ['M4'],       evidenceType: 'contract' }
    ],
    acceptance: [
      { id: 'AC-1', deliverable: 'D1', criteria: 'All 4 sources ingest with <2% record-reject rate over 2 cycles.', defined: true,  evidenceType: 'contract' },
      { id: 'AC-2', deliverable: 'D2', criteria: 'Validation pack reconciles headcount to HRIS within ±0.5%.',       defined: true,  evidenceType: 'contract' },
      { id: 'AC-3', deliverable: 'D3', criteria: 'Dashboards render agreed metrics; no objective criteria stated for “agreed”.', defined: false, evidenceType: 'inference' },
      { id: 'AC-4', deliverable: 'D5', criteria: 'Training delivered; no competency or attendance threshold stated.', defined: false, evidenceType: 'inference' }
    ],
    dependencies: [
      { id: 'DEP-1', text: 'Buyer provides HRIS/payroll extract access by M1+5 days.', owner: 'Buyer', risk: 'high', evidenceType: 'contract' },
      { id: 'DEP-2', text: 'Buyer confirms data-classification for employee PII.',      owner: 'Buyer', risk: 'medium', evidenceType: 'inference' },
      { id: 'DEP-3', text: 'Supplier provisions production tenant before M2.',           owner: 'Supplier', risk: 'low', evidenceType: 'contract' }
    ],
    // RACI matrix — activities x roles; value: R|A|C|I|'' ; flag ambiguity where >1 A or none
    raci: {
      roles: ['Buyer PMO', 'Buyer HRIS', 'Supplier PM', 'Supplier Eng'],
      rows: [
        { activity: 'Data extract & access', vals: ['A','R','C','I'], ambiguous: false, evidenceType: 'contract' },
        { activity: 'Content-model config',  vals: ['C','I','A','R'], ambiguous: false, evidenceType: 'contract' },
        { activity: 'Dashboard design',      vals: ['A','C','A','R'], ambiguous: true,  evidenceType: 'inference', note: 'Two Accountable owners — unclear who signs off dashboards.' },
        { activity: 'Acceptance sign-off',   vals: ['','','','' ],    ambiguous: true,  evidenceType: 'unavailable', note: 'No accountable owner named for acceptance (links to ISS-10).' },
        { activity: 'Training delivery',     vals: ['I','I','A','R'], ambiguous: false, evidenceType: 'contract' }
      ]
    },
    serviceLevels: [
      { id: 'SL-1', metric: 'Platform uptime', target: '99.5% / month', remedy: '5% credit per 1% miss, capped 15%', playbook: '99.9%', status: 'deviation', issueId: 'ISS-06', evidenceType: 'contract' },
      { id: 'SL-2', metric: 'Support response (P1)', target: '4 business hours', remedy: 'None stated', playbook: '1 hour, 24×7', status: 'partial', issueId: null, evidenceType: 'contract' },
      { id: 'SL-3', metric: 'Data refresh latency', target: 'Next-day (T+1)', remedy: 'None stated', playbook: 'T+1 acceptable', status: 'aligned', issueId: null, evidenceType: 'contract' }
    ],
    changeControl: [
      { text: 'Changes require a signed Change Order; supplier estimates effort at standard day-rate.', evidenceType: 'contract' },
      { text: 'No cap on change-order day-rate; ties to ISS-11 uncapped pricing.', evidenceType: 'inference' }
    ]
  },

  /* ---- 5. commercialLines -------------------------------------------------- */
  // All money is annual unless frequency='one-time'. termValue = value across the 3-yr term
  // computed with the base assumptions below (see assumptions ASM-*).
  commercialLines: [
    { id: 'CL-1', item: 'Platform subscription (18,000 employees)', supplierAmount: 780000, unit: 'per year', frequency: 'annual',   quantity: 18000, target: 640000, fallback: 690000, maximumAcceptable: 720000, negotiability: 'medium', evidenceType: 'contract', sourceIds: ['DOC-03'] },
    { id: 'CL-2', item: 'Implementation services (SOW-01)',          supplierAmount: 220000, unit: 'fixed fee',  frequency: 'one-time', quantity: 1,     target: 160000, fallback: 185000, maximumAcceptable: 200000, negotiability: 'high',   evidenceType: 'contract', sourceIds: ['DOC-02'] },
    { id: 'CL-3', item: 'Premium support tier',                      supplierAmount: 95000,  unit: 'per year',   frequency: 'annual',   quantity: 1,     target: 60000,  fallback: 75000,  maximumAcceptable: 85000,  negotiability: 'high',   evidenceType: 'contract', sourceIds: ['DOC-03'] },
    { id: 'CL-4', item: 'Additional data connectors (2)',            supplierAmount: 45000,  unit: 'fixed fee',  frequency: 'one-time', quantity: 2,     target: 30000,  fallback: 36000,  maximumAcceptable: 40000,  negotiability: 'medium', evidenceType: 'contract', sourceIds: ['DOC-02'] },
    { id: 'CL-5', item: 'Training (2 sessions, 25 users)',           supplierAmount: 28000,  unit: 'fixed fee',  frequency: 'one-time', quantity: 2,     target: 18000,  fallback: 22000,  maximumAcceptable: 25000,  negotiability: 'high',   evidenceType: 'contract', sourceIds: ['DOC-02'] }
  ],

  /* ---- 6. scenarios -------------------------------------------------------- */
  // values keyed by commercialLine id (Year-1 figure per line). total = 3-yr TCV
  // calculated with baseUplift + term from assumptions; interpretation is narrative.
  scenarios: [
    { id: 'SC-ask',  name: 'Supplier ask',      basis: 'As drafted', values: { 'CL-1':780000, 'CL-2':220000, 'CL-3':95000, 'CL-4':45000, 'CL-5':28000 }, y1Total: 1168000, total: 3051000, interpretation: 'Opening anchor. Platform + support loaded high; services priced at a premium day-rate.', evidenceType: 'contract' },
    { id: 'SC-target', name: 'Target',          basis: 'Playbook + internal precedent', values: { 'CL-1':640000, 'CL-2':160000, 'CL-3':60000, 'CL-4':30000, 'CL-5':18000 }, y1Total: 908000, total: 2372000, interpretation: 'Defensible goal: ~15% platform discount to precedent, services to day-rate norms. Aim here.', evidenceType: 'calculated' },
    { id: 'SC-fallback', name: 'Fallback',      basis: 'If platform discount resisted', values: { 'CL-1':690000, 'CL-2':185000, 'CL-3':75000, 'CL-4':36000, 'CL-5':22000 }, y1Total: 1008000, total: 2634000, interpretation: 'Acceptable if the platform line holds firm but services and support concede.', evidenceType: 'calculated' },
    { id: 'SC-max',  name: 'Max acceptable',    basis: 'Working ceiling (unapproved)', values: { 'CL-1':720000, 'CL-2':200000, 'CL-3':85000, 'CL-4':40000, 'CL-5':25000 }, y1Total: 1070000, total: 2797000, interpretation: 'Walk-away line. Above this, escalate rather than sign. Budget ceiling not yet confirmed (see gaps).', evidenceType: 'assumption' }
  ],

  /* ---- 7. benchmarks (ONLY internal precedent + one public norm are real) --- */
  benchmarks: [
    { id: 'BENCH-int', item: 'Platform $/employee/yr', comparisonValue: '$37 (this ask) vs $32 (precedent)', sourceId: 'FIN-01', comparability: 'Moderate', explanation: 'Internal precedent: a 2024 workforce-analytics platform at ~14,000 employees. Scale and scope differ; directional, not exact.', evidenceType: 'internal' },
    { id: 'BENCH-svc', item: 'Implementation day-rate', comparisonValue: '≈$2,000/day (this SOW) vs $1,500–1,750 norm', sourceId: 'FIN-01', comparability: 'Moderate', explanation: 'Derived from SOW effort estimate against internal services-rate range. Effort split is inferred, not itemised in the SOW.', evidenceType: 'calculated' },
    { id: 'BENCH-pub', item: 'SaaS auto-renewal notice', comparisonValue: '30–45 days typical', sourceId: 'WEB-01', comparability: 'Weak', explanation: 'General market practice for enterprise SaaS; not a Visier-specific or verified figure. Context only.', evidenceType: 'public' }
  ],

  /* ---- 8. negotiation (positions reference issue ids — never re-state them) - */
  negotiation: {
    objectives: [
      { id: 'OBJ-1', text: 'Close the three signature-blocking terms (liability, DPA, renewal).', priority: 1, issueIds: ['ISS-01','ISS-03','ISS-04'], evidenceType: 'inference' },
      { id: 'OBJ-2', text: 'Bring 3-year TCV to the target scenario (~$2.37M).', priority: 2, issueIds: ['ISS-12','ISS-11'], evidenceType: 'calculated' },
      { id: 'OBJ-3', text: 'Secure meaningful SLA credits and a chronic-failure exit.', priority: 3, issueIds: ['ISS-06'], evidenceType: 'inference' },
      { id: 'OBJ-4', text: 'Protect buyer ownership of configurations and data on exit.', priority: 4, issueIds: ['ISS-07','ISS-05'], evidenceType: 'inference' }
    ],
    // leverage: what we can push with; strength label + basis
    leverage: [
      { id: 'LV-1', text: 'Multi-year prepay available if platform line discounts.', strength: 'Strong', basis: 'Internal finance confirms prepay appetite.', evidenceType: 'internal' },
      { id: 'LV-2', text: 'Reference-customer / case-study consent as trade currency.', strength: 'Moderate', basis: 'Marketing value to Visier in pharma vertical.', evidenceType: 'inference' },
      { id: 'LV-3', text: 'Competitive alternative exists (incumbent BI + one rival).', strength: 'Moderate', basis: 'Landscape analysis; no competing quote in-session.', evidenceType: 'inference' },
      { id: 'LV-4', text: 'End-of-quarter timing aligns with supplier bookings pressure.', strength: 'Weak', basis: 'General SaaS sales-cycle inference, not confirmed.', evidenceType: 'inference' }
    ],
    // give-get matrix: what we give vs what we get; value low/med/high to each side
    giveGets: [
      { id: 'GG-1', give: '3-year prepay', giveCost: 'low', get: 'Platform discount to target', getValue: 'high', issueIds: ['ISS-12'], evidenceType: 'internal' },
      { id: 'GG-2', give: 'Case-study reference', giveCost: 'low', get: 'Support-tier discount', getValue: 'medium', issueIds: ['ISS-12'], evidenceType: 'inference' },
      { id: 'GG-3', give: '45-day renewal notice (vs 30)', giveCost: 'low', get: 'Renewal price cap', getValue: 'high', issueIds: ['ISS-04','ISS-11'], evidenceType: 'inference' },
      { id: 'GG-4', give: 'Mutual 24-month cap symmetry', giveCost: 'medium', get: 'Data-breach super-cap', getValue: 'high', issueIds: ['ISS-01'], evidenceType: 'inference' },
      { id: 'GG-5', give: 'Drop clean convenience-termination', giveCost: 'medium', get: 'Config ownership + export', getValue: 'high', issueIds: ['ISS-05','ISS-07'], evidenceType: 'inference' }
    ],
    concessionLadders: [
      { id: 'CLAD-1', issueId: 'ISS-01', steps: ['24mo cap + 3× breach super-cap + uncapped IP', '24mo cap + 2× breach super-cap', '24mo cap + breach carve-out only'], evidenceType: 'inference' },
      { id: 'CLAD-2', issueId: 'ISS-04', steps: ['Opt-in renewal', '30-day notice + CPI cap', '45-day notice + 5% cap'], evidenceType: 'inference' },
      { id: 'CLAD-3', issueId: 'ISS-12', steps: ['Target TCV $2.37M', 'Split the difference ~$2.5M', 'Fallback TCV $2.63M'], evidenceType: 'calculated' }
    ],
    // packages: bundled asks that trade together
    packages: [
      { id: 'PKG-A', name: 'Protection package', issueIds: ['ISS-01','ISS-02','ISS-03'], give: 'Mutual cap symmetry + 3-yr commitment', get: 'Breach super-cap, IP indemnity, executed DPA', priority: 1, evidenceType: 'inference' },
      { id: 'PKG-B', name: 'Commercial package', issueIds: ['ISS-12','ISS-04','ISS-11','ISS-03b'], give: '3-year prepay + case-study', get: 'Platform discount + renewal/uplift caps', priority: 2, evidenceType: 'calculated' },
      { id: 'PKG-C', name: 'Service & exit package', issueIds: ['ISS-06','ISS-07','ISS-05','ISS-10'], give: 'Concede clean convenience-termination', get: '99.9% SLA + chronic-exit + config ownership + real acceptance', priority: 3, evidenceType: 'inference' }
    ],
    sequence: [
      { step: 1, text: 'Open with the Protection package — these are gates, frame them as non-negotiable compliance.', packageId: 'PKG-A', evidenceType: 'inference' },
      { step: 2, text: 'Move to the Commercial package once protection is verbally agreed; lead with prepay-for-discount.', packageId: 'PKG-B', evidenceType: 'inference' },
      { step: 3, text: 'Close on the Service & exit package; trade the convenience-termination give for SLA + ownership.', packageId: 'PKG-C', evidenceType: 'inference' }
    ],
    meetingBrief: {
      objective: 'Secure agreement in principle on the three signature conditions and land the 3-year TCV within the target–fallback band.',
      objectiveEvidence: 'inference',
      agenda: [
        { block: '0–10 min', item: 'Confirm scope and shared understanding of SOW-01 objective.', evidenceType: 'contract' },
        { block: '10–25 min', item: 'Protection package — liability cap, IP indemnity, DPA/SCCs.', evidenceType: 'inference' },
        { block: '25–45 min', item: 'Commercial package — platform discount, renewal + uplift caps.', evidenceType: 'calculated' },
        { block: '45–55 min', item: 'Service & exit — SLA, config ownership, acceptance.', evidenceType: 'inference' },
        { block: '55–60 min', item: 'Recap agreed points, owners, and next-draft date.', evidenceType: 'inference' }
      ],
      opening: 'We see strong platform fit and want to move quickly. Three terms are compliance gates for us — liability, data protection, and renewal — and we have a straightforward path to close them. On commercials we are ready to commit multi-year if the platform pricing reflects that commitment.',
      asks: [
        { text: 'Raise the liability cap to 24 months with a data-breach super-cap.', issueId: 'ISS-01', evidenceType: 'contract' },
        { text: 'Attach and execute a reviewed DPA with EU SCCs before signature.', issueId: 'ISS-03', evidenceType: 'contract' },
        { text: 'Convert auto-renewal to 45-day notice with a renewal price cap.', issueId: 'ISS-04', evidenceType: 'contract' },
        { text: 'Discount the platform line toward $640K in exchange for 3-year prepay.', issueId: 'ISS-12', evidenceType: 'calculated' },
        { text: 'Move uptime to 99.9% with meaningful credits and a chronic-failure exit.', issueId: 'ISS-06', evidenceType: 'contract' }
      ],
      questions: [
        { text: 'Can you share the actual DPA text and Security Exhibit today?', issueId: 'ISS-03', evidenceType: 'inference' },
        { text: 'What achieved-uptime history supports the 99.5% target?', issueId: 'ISS-06', evidenceType: 'inference' },
        { text: 'Is 99.9% a genuine paid tier or a negotiation position?', issueId: 'ISS-06', evidenceType: 'inference' },
        { text: 'What is the real floor on the platform line for a 3-year prepay?', issueId: 'ISS-12', evidenceType: 'inference' }
      ],
      expectedPushback: [
        { pushback: '“12-month cap is standard.”', response: 'Workforce-data sensitivity justifies 24 months; we will accept mutual symmetry.', issueId: 'ISS-01', evidenceType: 'inference' },
        { pushback: '“Our standard DPA is fine.”', response: 'We must review the actual text; standard is not a substitute for review.', issueId: 'ISS-03', evidenceType: 'inference' },
        { pushback: '“99.5% is our contractual standard.”', response: 'Show the achieved-uptime history; a system-of-record needs 99.9%.', issueId: 'ISS-06', evidenceType: 'inference' },
        { pushback: '“Pricing reflects premium capability.”', response: 'Platform value is defensible; services and support loading are not.', issueId: 'ISS-12', evidenceType: 'calculated' }
      ],
      closing: 'To recap: we are aligned on platform fit and ready to commit for three years. Closing depends on the liability, data-protection and renewal terms, and platform pricing that reflects a multi-year commitment. Let us confirm owners and a date for the next draft.'
    }
  },

  /* ---- 9. assumptions (editable LOCAL inputs; drive recalc) ------------------ */
  // classification uses the evidence set; materiality: high|medium|low
  assumptions: [
    { id: 'ASM-1', label: 'Employee count (subscription basis)', value: 18000, unit: 'employees', min: 12000, max: 24000, step: 500, classification: 'internal',  usedIn: ['CL-1','BENCH-int'], materiality: 'high',  evidenceType: 'internal' },
    { id: 'ASM-2', label: 'Initial term',                        value: 3,     unit: 'years',     min: 1,     max: 5,     step: 1,   classification: 'contract',  usedIn: ['scenarios'],       materiality: 'high',  evidenceType: 'contract' },
    { id: 'ASM-3', label: 'Annual uplift (post-term modelling)',  value: 4,     unit: '%',         min: 0,     max: 10,    step: 0.5, classification: 'assumption',usedIn: ['scenarios','ISS-11'], materiality: 'medium', evidenceType: 'assumption' },
    { id: 'ASM-4', label: 'Target platform discount',            value: 18,    unit: '%',         min: 0,     max: 30,    step: 1,   classification: 'assumption',usedIn: ['SC-target','CL-1'], materiality: 'high',  evidenceType: 'assumption' },
    { id: 'ASM-5', label: 'Discount rate (NPV of prepay)',       value: 6,     unit: '%',         min: 0,     max: 12,    step: 0.5, classification: 'internal',  usedIn: ['scenarios'],       materiality: 'medium', evidenceType: 'internal' }
  ],

  /* ---- 10. gaps (ranked; render as list/matrix, NEVER an empty chart) ------- */
  // priority: 'critical' | 'important' | 'helpful'
  gaps: [
    { id: 'GAP-1', priority: 'critical',  input: 'Executed DPA text + EU SCCs (DOC-04)', whyItMatters: 'Data-protection assessment is Limited and partly inferred; this is a signature gate.', possibleSource: 'Supplier legal / MSA §9.4 reference', decisionImpact: 5, ease: 4, affectedAnalysis: ['ISS-03','ISS-08','Contract/Terms & Risk','Sources'], evidenceType: 'unavailable' },
    { id: 'GAP-2', priority: 'critical',  input: 'Security & Availability Exhibit B (DOC-05)', whyItMatters: 'SLA credit schedule and security controls cannot be verified without it.', possibleSource: 'Supplier / MSA §7.2 reference', decisionImpact: 4, ease: 4, affectedAnalysis: ['ISS-06','Scope/SLAs'], evidenceType: 'unavailable' },
    { id: 'GAP-3', priority: 'important', input: 'Approved FY27 budget ceiling', whyItMatters: 'Max-acceptable is a working assumption, not an approved walk-away figure.', possibleSource: 'Internal finance / category budget', decisionImpact: 5, ease: 3, affectedAnalysis: ['SC-max','ISS-12','Commercials/Scenarios'], evidenceType: 'unavailable' },
    { id: 'GAP-4', priority: 'important', input: 'Prior-year Visier quote or a competing bid', whyItMatters: 'Benchmark rests on a single internal precedent; a second reference would firm the target.', possibleSource: 'Sourcing history / RFx', decisionImpact: 4, ease: 2, affectedAnalysis: ['BENCH-int','ISS-12','Commercials/Benchmarks'], evidenceType: 'unavailable' },
    { id: 'GAP-5', priority: 'helpful',   input: 'Visier achieved-uptime history', whyItMatters: 'Would test whether 99.5% reflects real performance or a conservative posture.', possibleSource: 'Supplier status page / references', decisionImpact: 2, ease: 3, affectedAnalysis: ['ISS-06'], evidenceType: 'unavailable' },
    { id: 'GAP-6', priority: 'helpful',   input: 'SOW effort breakdown by workstream', whyItMatters: 'Day-rate benchmark is inferred from a lump-sum; itemised effort would sharpen it.', possibleSource: 'Supplier delivery team', decisionImpact: 2, ease: 3, affectedAnalysis: ['BENCH-svc','ISS-10'], evidenceType: 'unavailable' }
  ],

  /* ---- 11. sources (IDs referenced by sourceIds[] everywhere) --------------- */
  // kind: contract | playbook | template | internal | finance | risk | m365 | web
  // coverage[]: analysis areas this source materially supports (for the coverage matrix)
  sources: [
    { id: 'DOC-01',     kind: 'contract', label: 'Visier MSA v3 (redline)',        detail: 'Uploaded 2026-07-15 · 34 pp · supplier paper', coverage: ['Liability','Data & Privacy','Term & Renewal','Service Levels','IP','Audit & Compliance'], evidenceType: 'contract' },
    { id: 'DOC-02',     kind: 'contract', label: 'SOW-01 (Implementation)',        detail: 'Uploaded 2026-07-15 · 11 pp',                 coverage: ['Scope & Acceptance','Commercial','Service Levels'], evidenceType: 'contract' },
    { id: 'DOC-03',     kind: 'contract', label: 'Order Form (Fees)',              detail: 'Uploaded 2026-07-15 · 3 pp',                  coverage: ['Commercial','Term & Renewal'], evidenceType: 'contract' },
    { id: 'DOC-04',     kind: 'contract', label: 'DPA (referenced, missing)',      detail: 'Not provided — MSA §9.4',                     coverage: ['Data & Privacy'], evidenceType: 'unavailable' },
    { id: 'DOC-05',     kind: 'contract', label: 'Security Exhibit B (missing)',   detail: 'Not provided — MSA §7.2',                     coverage: ['Service Levels','Audit & Compliance'], evidenceType: 'unavailable' },
    { id: 'PLAYBOOK-01',kind: 'playbook', label: 'Procurement Contract Playbook',  detail: 'Internal · SaaS + data-processing positions',  coverage: ['Liability','Data & Privacy','Term & Renewal','Service Levels','IP','Audit & Compliance','Scope & Acceptance','Commercial'], evidenceType: 'internal' },
    { id: 'TEMPLATE-01',kind: 'template', label: 'Standard SOW template',          detail: 'Internal · acceptance + milestone norms',      coverage: ['Scope & Acceptance'], evidenceType: 'internal' },
    { id: 'EMAIL-01',   kind: 'm365',     label: 'Supplier redline cover email',   detail: 'Outlook · 2026-07-15 (DOC-06)',                coverage: ['Term & Renewal','Commercial'], evidenceType: 'internal' },
    { id: 'FIN-01',     kind: 'finance',  label: 'Internal analytics precedent',   detail: 'Finance · 2024 platform, ~14k employees',      coverage: ['Commercial'], evidenceType: 'internal' },
    { id: 'WEB-01',     kind: 'web',      label: 'Enterprise-SaaS renewal norms',  detail: 'Public · general market practice',             coverage: ['Term & Renewal'], evidenceType: 'public' }
  ],

  /* ---- coverage matrix axis (source coverage x analysis area) --------------- */
  analysisAreas: ['Liability','Data & Privacy','Term & Renewal','Commercial','Service Levels','IP','Scope & Acceptance','Audit & Compliance']
};

/* one alias referenced in PKG-B (renewal-price cap issue folded into ISS-11/ISS-04) */
dashboardData.negotiation.packages.find(p => p.id === 'PKG-B').issueIds =
  dashboardData.negotiation.packages.find(p => p.id === 'PKG-B').issueIds.filter(id => id !== 'ISS-03b');

if (typeof window !== 'undefined') { window.dashboardData = dashboardData; }
