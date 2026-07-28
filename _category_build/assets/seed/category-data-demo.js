/* ILLUSTRATIVE DATA. NOT REAL.
   ---------------------------------------------------------------------------
   This file exists for one purpose: to show what the Category Strategy dashboard
   looks like when every panel has something to render. It loads AFTER
   category-data.js, narrows the seed to Software alone, and adds the thirteen
   structures the real seed does not carry, so the panels that honestly state a
   gap in the production build instead show a populated layout here.

   Every value added below is invented. The figures are made internally
   consistent with the real Software totals (FY25 $792.6M, 769 vendors, the seven
   named suppliers) so the layout reads plausibly, but nothing here came from a
   system and none of it should be quoted, exported or shown as fact.

   The production build reads category-data.js only and is unaffected. The demo
   build stamps a banner on every screen so the two can never be confused.
   =========================================================================== */
(function () {
  if (typeof CATEGORY_SEED === 'undefined') return;

  /* Software only. */
  var only = (CATEGORY_SEED.categories || []).filter(function (c) {
    return /software/i.test(c.title || '') || (c.meta || {}).commodity === '205';
  });
  if (!only.length) return;
  CATEGORY_SEED.categories = only;

  var d = only[0];
  d.__demo = true;
  CATEGORY_SEED.__demo = true;

  /* --- Overview: contract coverage and renewal exposure ------------------ */
  d.contractCoverage = {
    pct: 71.4,
    covered: 565900000,
    uncovered: 226700000,
    note: 'Coverage is measured against FY25 recognised spend, not commitment value.',
    off: [
      { n: 'Long tail (533 vendors under $250K)', v: 27700000, why: 'No agreement of any kind; bought on PO' },
      { n: 'ZS Associates', v: 15400000, why: 'SOW expired Mar 2026, work continuing' },
      { n: 'Salesforce', v: 22100000, why: 'Order forms only, no master agreement' },
      { n: 'Anthropic', v: 6800000, why: 'New relationship, MSA in negotiation' },
      { n: 'Tamarind Bio', v: 3100000, why: 'New relationship, clickwrap terms' }
    ]
  };

  d.renewals = {
    next12m: 318400000,
    pctOfSpend: 40.2,
    windows: [
      { n: 'Microsoft', v: 91300000, notice: '01 Apr 2026', expiry: '30 Jun 2026', vehicle: 'Enterprise Agreement', state: 'critical' },
      { n: 'Amazon Web Services', v: 74300000, notice: '15 Aug 2026', expiry: '30 Nov 2026', vehicle: 'EDP', state: 'open' },
      { n: 'Veeva Systems', v: 64300000, notice: '01 Oct 2026', expiry: '31 Dec 2026', vehicle: 'Subscription + Vault CRM migration', state: 'open' },
      { n: 'Adobe', v: 32300000, notice: '30 Nov 2026', expiry: '28 Feb 2027', vehicle: 'ETLA', state: 'open' },
      { n: 'SAP America', v: 32100000, notice: '31 Jan 2027', expiry: '30 Apr 2027', vehicle: 'RISE subscription', state: 'watch' },
      { n: 'Salesforce', v: 22100000, notice: 'None', expiry: 'Rolling', state: 'nocontrol' }
    ]
  };

  /* --- Market & Risk: escalation triggers and geography ------------------ */
  d.triggers = [
    { risk: 'Microsoft Jul 1 2026 increase', cond: 'Effective uplift on the renewal quote', thr: 'Above 6%', act: 'Escalate to CIO, open the multi-year lock', owner: 'Category lead' },
    { risk: 'GenAI price inflation in renewals', cond: 'Unbudgeted AI or consumption charges, rolling 12 months', thr: 'Above $8M', act: 'Freeze new AI SKUs pending a portfolio position', owner: 'IT finance' },
    { risk: 'AI data-governance / training rights', cond: 'AI renewals closed without an opt-out and audit clause', thr: 'Any', act: 'Hard stop, route to Legal and Privacy', owner: 'Legal' },
    { risk: 'Veeva Vault CRM migration', cond: 'Migration milestones missed against the agreed plan', thr: 'Two consecutive', act: 'Trigger the alternative-platform assessment', owner: 'Business owner' },
    { risk: 'Tail sprawl', cond: 'Vendors under $250K', thr: 'Above 550', act: 'Reopen the app-catalogue funnel, restrict new PO creation', owner: 'Category lead' },
    { risk: 'Reseller pass-through opacity', cond: 'Spend routed through VARs without OEM disclosure', thr: 'Above $150M', act: 'Move the top three OEMs direct at renewal', owner: 'Sourcing' }
  ];

  d.geo = {
    note: 'Delivery and data-residency geography, not billing entity.',
    regions: [
      { r: 'United States', v: 491400000, pct: 62.0, sup: 'Microsoft, AWS, Veeva, Adobe, Salesforce' },
      { r: 'European Union', v: 166400000, pct: 21.0, sup: 'SAP, Microsoft (Ireland), regional SaaS' },
      { r: 'Asia Pacific', v: 87200000, pct: 11.0, sup: 'AWS (Singapore, Tokyo), regional resellers' },
      { r: 'Latin America', v: 31700000, pct: 4.0, sup: 'Regional resellers' },
      { r: 'Other / unallocated', v: 15900000, pct: 2.0, sup: 'Tail, geography not captured' }
    ]
  };

  /* --- Strategy & Plays: pillars and sequenced actions -------------------- */
  d.pillars = [
    { n: 'Defend the megavendor renewals', owner: 'Category lead', outcome: 'No renewal closes above a 4% effective uplift, and none closes without an AI data-use position.', measure: 'Effective uplift per renewal' },
    { n: 'Take back the consumption estate', owner: 'Cloud FinOps', outcome: 'Committed-use coverage moves from 42% to the 75-85% band on AWS and Azure.', measure: 'RI / SP coverage, monthly' },
    { n: 'Collapse the tail', owner: 'Sourcing ops', outcome: 'Vendors under $250K fall from 533 to under 300 through the catalogue funnel and anchor redirects.', measure: 'Tail vendor count, quarterly' },
    { n: 'See through the resellers', owner: 'Sourcing', outcome: 'OEM identity and margin disclosed on the VAR spend, top three OEMs moved direct.', measure: 'Spend with disclosed OEM' }
  ];

  d.actions = [
    { a: 'Lock the Microsoft renewal before the 1 Jul list increase', w: '0-3', owner: 'Category lead', dep: 'CIO approval of the multi-year term', state: 'critical' },
    { a: 'Stand up the AI clause set, opt-out plus audit plus data-use, and make it mandatory on renewal', w: '0-3', owner: 'Legal', dep: 'Privacy sign-off', state: 'open' },
    { a: 'Baseline AWS and Azure committed-use coverage and publish the monthly gap', w: '0-3', owner: 'Cloud FinOps', dep: 'Billing export access', state: 'done' },
    { a: 'Open the AWS EDP renegotiation against the coverage baseline', w: '3-6', owner: 'Sourcing', dep: 'Coverage baseline complete', state: 'open' },
    { a: 'Run the SaaS overlap review across collaboration, security and analytics', w: '3-6', owner: 'Category lead', dep: 'Capability tagging in the app catalogue', state: 'open' },
    { a: 'Demand OEM disclosure from the top three resellers at renewal', w: '3-6', owner: 'Sourcing', dep: 'None', state: 'open' },
    { a: 'Close the tail funnel: no new PO under $250K without a catalogue route', w: '6-12', owner: 'Sourcing ops', dep: 'Catalogue funnel live', state: 'open' },
    { a: 'Decide the Veeva Vault CRM position: migrate, hold, or assess alternatives', w: '6-12', owner: 'Business owner', dep: 'Migration milestone review', state: 'watch' },
    { a: 'Re-baseline the category strategy against the FY27 plan', w: '6-12', owner: 'Category lead', dep: 'FY27 budget lock', state: 'open' }
  ];

  /* --- Savings & Scorecard: realised benefits traced to levers ------------ */
  d.benefits = [
    { lever: 'AWS commitment / EDP optimization', amt: 2400000, type: 'Hard', when: 'Q1 FY26', evid: 'Billing delta against the pre-commitment run rate', state: 'validated' },
    { lever: 'Microsoft renewal-price defense', amt: 5100000, type: 'Avoidance', when: 'Q2 FY26', evid: 'Quoted uplift 9.1%, landed 3.4%, on a $91.3M base', state: 'validated' },
    { lever: 'Portfolio SaaS rationalization', amt: 3800000, type: 'Hard', when: 'Q2 FY26', evid: '11 overlapping tools retired, licences cancelled at renewal', state: 'approved' },
    { lever: 'Tail consolidation', amt: 1200000, type: 'Hard', when: 'Q3 FY26', evid: '96 vendors consolidated to catalogue routes', state: 'approved' },
    { lever: 'Reseller OEM transparency', amt: 900000, type: 'Hard', when: 'Q3 FY26', evid: 'Margin disclosed on two OEMs, re-quoted direct', state: 'modelled' },
    { lever: 'Veeva migration leverage', amt: null, type: 'Avoidance', when: 'Pending', evid: 'Not yet negotiated', state: 'pending' }
  ];

  /* Fill the two KPIs the real seed marks NEEDS_INPUT. */
  (d.kpis || []).forEach(function (k) {
    if (k.kpi === 'AI-clause coverage') { k.cur = '38%'; k.needs = false; k.note = 'Opt-out, audit and data-use across AI renewals closed since Jan 2026'; }
    if (k.kpi === 'Contract coverage %') { k.cur = '71%'; k.needs = false; k.note = 'FY25 recognised spend under an active agreement'; }
  });
  d.kpiTrend = { 'AI-clause coverage': [0, 12, 25, 38], 'Contract coverage %': [64, 66, 69, 71], 'SaaS RI/SP coverage': [38, 39, 41, 42], 'Tail vendor count (<$250K)': [601, 578, 552, 533] };

  /* --- Supplier Program: development pipeline ---------------------------- */
  d.development = [
    { n: 'Anthropic', stage: 'Onboarding', owner: 'Category lead', impact: 'Consolidates four point AI tools into one governed platform', next: 'MSA and AI data-use clause set', due: 'Q3 FY26' },
    { n: 'Veeva Systems', stage: 'Performance improvement', owner: 'Business owner', impact: 'Vault CRM migration on plan protects $64.3M of run rate', next: 'Milestone review', due: 'Q3 FY26' },
    { n: 'ZS Associates', stage: 'Under review', owner: 'Sourcing', impact: 'Scope overlaps two internal teams and one SaaS platform', next: 'Scope reconciliation, then renew or exit', due: 'Q2 FY26' },
    { n: 'SAS Institute', stage: 'Consolidation candidate', owner: 'Category lead', impact: 'Analytics overlap with three other platforms', next: 'Capability comparison', due: 'Q4 FY26' },
    { n: 'Tamarind Bio', stage: 'Qualification', owner: 'Scientific IT', impact: 'Niche capability, no incumbent alternative', next: 'Security and data review', due: 'Q3 FY26' }
  ];

  /* --- Rationalization: vendor counts, overlaps, utilization, actions ----- */
  var vc = { 'Marketing/Sales SaaS': 118, 'IaaS': 14, 'On-Prem SW for IT': 96, 'Medicines Development SaaS': 61,
             'Collaboration/Conferencing SaaS': 74, 'Info Security SaaS': 88, 'Scientific Research SW': 142, 'PaaS': 31 };
  (d.subcats || []).forEach(function (s) { if (vc[s.n] != null) s.vc = vc[s.n]; });

  d.overlaps = [
    { cap: 'Collaboration and conferencing', sup: ['Microsoft Teams', 'Zoom', 'Slack', 'Webex'], v: 122000000, read: 'Four platforms for one capability. Teams is already paid for inside the EA.' },
    { cap: 'Analytics and reporting', sup: ['SAS Institute', 'Microsoft Power BI', 'Tableau', 'Qlik'], v: 96000000, read: 'Power BI is included in the EA; the other three are separately licensed.' },
    { cap: 'Endpoint and identity security', sup: ['Microsoft Defender', 'CrowdStrike', 'Okta'], v: 61000000, read: 'Defender overlaps CrowdStrike on endpoint. Okta overlaps Entra on identity.' },
    { cap: 'Contract and document management', sup: ['Adobe', 'DocuSign', 'SharePoint'], v: 38000000, read: 'Three signing and storage routes, no single system of record.' },
    { cap: 'Project and work management', sup: ['Smartsheet', 'Asana', 'Microsoft Planner', 'Jira'], v: 24000000, read: 'Departmental sprawl, no enterprise standard.' }
  ];

  d.utilization = [
    { n: 'Salesforce', bought: 12400, active: 7100, pct: 57.3, waste: 9400000, note: 'Field reorganisation left seats provisioned' },
    { n: 'Adobe', bought: 18600, active: 12900, pct: 69.4, waste: 7200000, note: 'Full Creative Cloud where Acrobat would do' },
    { n: 'Smartsheet', bought: 9800, active: 3400, pct: 34.7, waste: 4100000, note: 'Departmental purchase, never rolled out' },
    { n: 'Microsoft E5', bought: 41200, active: 38900, pct: 94.4, waste: 2100000, note: 'Healthy. E5 features under-adopted, not the seats' },
    { n: 'Veeva Systems', bought: 8600, active: 8100, pct: 94.2, waste: null, note: 'Healthy' },
    { n: 'Zoom', bought: 22000, active: 6200, pct: 28.2, waste: 5600000, note: 'Displaced by Teams, still licensed' }
  ];

  d.actionMatrix = [
    { n: 'Microsoft', act: 'Renegotiate', v: 8200000, effort: 'High', when: '0-3 months', why: 'Renewal lands before the 1 Jul list increase' },
    { n: 'Amazon Web Services', act: 'Renegotiate', v: 8000000, effort: 'High', when: '3-6 months', why: 'Committed-use coverage is 33 points below best in class' },
    { n: 'Veeva Systems', act: 'Retain', v: null, effort: 'Medium', when: '6-12 months', why: 'No credible alternative mid-migration' },
    { n: 'Zoom', act: 'Retire', v: 5600000, effort: 'Low', when: '0-3 months', why: 'Teams is already paid for and adopted' },
    { n: 'Smartsheet', act: 'Retire', v: 4100000, effort: 'Low', when: '3-6 months', why: '35% utilisation, no enterprise mandate' },
    { n: 'SAS Institute', act: 'Consolidate', v: 6800000, effort: 'High', when: '6-12 months', why: 'Analytics overlap with three platforms' },
    { n: 'Salesforce', act: 'Renegotiate', v: 9400000, effort: 'Medium', when: '3-6 months', why: 'Seats provisioned well beyond active users, and no master agreement' },
    { n: 'ZS Associates', act: 'Replace', v: 3200000, effort: 'Medium', when: '3-6 months', why: 'Scope duplicates internal capability' }
  ];

  /* --- Execution: forecast, rate vs volume, movement, roadmap ------------- */
  d.forecast = {
    basis: 'Bottom-up by supplier: contracted escalators where a contract exists, category CAGR elsewhere, less the modelled savings at the mid-point.',
    years: [
      { y: 'FY2026', v: 868200000, lo: 842100000, hi: 894300000, actual: null },
      { y: 'FY2027', v: 921400000, lo: 866100000, hi: 976700000, actual: null },
      { y: 'FY2028', v: 967500000, lo: 880400000, hi: 1054600000, actual: null }
    ],
    hist: [
      { y: 'FY2023', v: 534700000 }, { y: 'FY2024', v: 614700000 }, { y: 'FY2025', v: 792600000 }
    ]
  };

  d.rateVolume = {
    total: 177600000,
    rate: 71000000,
    volume: 106600000,
    note: 'Rate is price and escalator movement on a like-for-like basis. Volume is new consumption, new seats and new suppliers.',
    rows: [
      { n: 'Amazon Web Services', d: 25600000, rate: 3100000, vol: 22500000, read: 'Almost entirely consumption growth' },
      { n: 'Microsoft', d: 25100000, rate: 14200000, vol: 10900000, read: 'Uplift plus E5 step-up' },
      { n: 'Veeva Systems', d: 21400000, rate: 9600000, vol: 11800000, read: 'Migration scope plus escalator' },
      { n: 'Adobe', d: 4300000, rate: 2900000, vol: 1400000, read: 'ETLA uplift' },
      { n: 'All other', d: 101200000, rate: 41200000, vol: 60000000, read: 'Spread across 765 suppliers' }
    ]
  };

  d.sinceLast = {
    asOf: 'Last approved strategy: 14 Aug 2025',
    rows: [
      { k: 'Category spend', was: '$614.7M', now: '$792.6M', dir: 'up', read: 'Consumption growth outran the plan by roughly $61M' },
      { k: 'Active vendors', was: '662', now: '769', dir: 'up', read: 'Net 107 added, against a plan to reduce' },
      { k: 'Concentration (HHI)', was: '412', now: '395', dir: 'down', read: 'Fragmented further, the opposite of the intent' },
      { k: 'Contract coverage', was: '64%', now: '71%', dir: 'up', read: 'Improving, still short of the 85% target' },
      { k: 'Open high risks', was: '4', now: '7', dir: 'up', read: 'Three AI-related risks are new since the last strategy' },
      { k: 'Realised savings', was: '$4.1M', now: '$13.4M', dir: 'up', read: 'Ahead of plan, driven by the Microsoft defence' }
    ]
  };
}());
