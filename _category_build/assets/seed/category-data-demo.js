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

/* ---------------------------------------------------------------------------
   Second illustrative block, added with the 5-tab restructure. Same rule as
   above: every figure here is invented so the new screens can be judged full.
   =========================================================================== */
(function () {
  if (typeof CATEGORY_SEED === 'undefined') return;
  var d = (CATEGORY_SEED.categories || [])[0];
  if (!d || !d.__demo) return;

  /* A full Pareto curve. The real seed resolves seven megavendors by name and
     describes the other ~762 in aggregate, so there is no curve to draw. This
     synthesises one that lands on the real totals: 769 vendors, $792.6M FY25. */
  var named = [
    ['Microsoft', 91300000], ['Amazon Web Services', 74300000], ['Veeva Systems', 64300000],
    ['Adobe', 32300000], ['SAP America', 32100000], ['Salesforce', 22100000], ['ZS Associates', 15400000]
  ];
  var rest = [
    ['World Wide Technology', 14200000], ['SHI International', 12800000], ['Oracle America', 11900000],
    ['SAS Institute', 10400000], ['ServiceNow', 9600000], ['Workday', 8900000], ['Snowflake', 8100000],
    ['Databricks', 7400000], ['Atlassian', 6900000], ['Anthropic', 6800000], ['Palo Alto Networks', 6200000],
    ['CrowdStrike', 5800000], ['Okta', 5300000], ['Zoom', 4900000], ['Box', 4400000],
    ['DocuSign', 4100000], ['Smartsheet', 3800000], ['Tableau', 3500000], ['Qlik', 3200000],
    ['Tamarind Bio', 3100000], ['Communications Professionals', 2900000], ['Dassault Systemes', 2700000],
    ['MathWorks', 2500000], ['PTC', 2300000], ['Ansys', 2100000], ['Certara', 1900000],
    ['Dotmatics', 1750000], ['Benchling', 1600000], ['Schrodinger', 1480000], ['Chemaxon', 1360000],
    ['Elsevier', 1250000], ['Clarivate', 1150000], ['IQVIA', 1060000], ['Medidata', 980000],
    ['Oracle Health', 900000], ['Sparta Systems', 830000], ['MasterControl', 760000], ['Veracode', 700000],
    ['Snyk', 640000], ['GitLab', 590000], ['JFrog', 540000], ['HashiCorp', 500000],
    ['Datadog', 460000], ['New Relic', 420000], ['PagerDuty', 390000], ['Grafana Labs', 355000],
    ['Confluent', 325000], ['MongoDB', 300000], ['Redis', 275000], ['Elastic', 250000],
    ['Twilio', 230000], ['SendGrid', 210000], ['Segment', 195000], ['Amplitude', 180000],
    ['Mixpanel', 165000], ['Figma', 150000], ['Miro', 138000], ['Notion', 126000],
    ['Airtable', 115000], ['Asana', 105000]
  ];
  var all = named.concat(rest);
  var plotted = all.reduce(function (a, r) { return a + r[1]; }, 0);
  /* Everything not named is folded into a synthetic long tail that closes the
     gap to the real FY25 total across the remaining vendor count. */
  var remainingN = 769 - all.length;
  var remainingV = 792600000 - plotted;
  /* A real long tail decays, it does not step down linearly, so the synthetic
     remainder follows a power law and the curve keeps its Pareto shape. */
  var w = [], sum = 0;
  for (var i = 1; i <= remainingN; i++) { var v = Math.pow(i, -0.85); w.push(v); sum += v; }
  for (var j = 0; j < remainingN; j++) all.push(['Supplier ' + (all.length + 1), Math.max(1200, remainingV * w[j] / sum)]);

  /* A Pareto is sorted by definition. Without this the synthetic tail starts
     above the smallest named supplier and the curve steps back up. */
  all.sort(function (a, b) { return b[1] - a[1]; });
  var total = all.reduce(function (a, r) { return a + r[1]; }, 0);
  var cum = 0;
  d.paretoFull = all.map(function (r) {
    cum += r[1];
    return { name: r[0], value: r[1], cumPct: (cum / total) * 100 };
  });

  /* Tail consolidation groups */
  d.tailOpps = [
    { group: 'Project and work management', effort: 'Low', combined: 4900000, saving: 1400000,
      vendors: ['Smartsheet', 'Asana', 'Airtable', 'Notion', 'Miro'],
      action: 'Standardise on Planner and Jira, both already licensed inside existing agreements. Cancel the rest at renewal.' },
    { group: 'Observability and monitoring', effort: 'Medium', combined: 1625000, saving: 480000,
      vendors: ['Datadog', 'New Relic', 'Grafana Labs', 'PagerDuty'],
      action: 'Consolidate to one platform under an enterprise commit; the other three renew inside 9 months.' },
    { group: 'Scientific point tools', effort: 'High', combined: 8090000, saving: 900000,
      vendors: ['Chemaxon', 'Dotmatics', 'Benchling', 'Schrodinger'],
      action: 'Route through a single research-informatics agreement. High effort: each has a distinct scientific owner.' },
    { group: 'Long tail under $50K', effort: 'Low', combined: 5600000, saving: 1100000,
      vendors: ['342 suppliers'],
      action: 'Close the funnel: no new PO under $50K without a catalogue route. Existing spend migrates at renewal.' }
  ];

  /* Contract exposure */
  d.contractOpps = [
    { n: 'Microsoft', kind: 'Expiring, notice window open', days: 62, atRisk: 91300000,
      action: 'Lock before the 1 July list increase. The notice window closes before a full sourcing cycle would finish.' },
    { n: 'Long tail and named off-contract', kind: 'Off-contract', days: null, atRisk: 226700000,
      action: 'Route through the preferred-supplier catalogue or execute SOWs against existing master agreements.' },
    { n: 'Salesforce', kind: 'No master agreement', days: null, atRisk: 22100000,
      action: 'Order forms only, rolling renewal, no notice right. Put an MSA in place before the next order form.' },
    { n: 'Amazon Web Services', kind: 'EDP renewal', days: 138, atRisk: 74300000,
      action: 'Open the renegotiation against the committed-use coverage baseline, not against list.' },
    { n: 'ZS Associates', kind: 'Expired, work continuing', days: 0, atRisk: 15400000,
      action: 'Work is proceeding on an expired SOW. Reconcile scope, then renew or exit.' }
  ];

  /* The platform's own tiering shape, so the derived path is not the only one shown */
  d.supplierTiering = [
    { label: 'Strategic', tier: 1, supplierCount: 3, spendShare: 29.4,
      approach: 'Joint roadmap and executive sponsorship. Competed only at renewal, and only with a credible alternative in hand.' },
    { label: 'Preferred', tier: 2, supplierCount: 3, spendShare: 10.6,
      approach: 'Benchmarked every cycle and competed at renewal. The default posture for anything not genuinely unique.' },
    { label: 'Under review', tier: 3, supplierCount: 1, spendShare: 1.9,
      approach: 'Scope and value under active challenge. Renew, reduce or replace within this planning cycle.' },
    { label: 'Transactional tail', tier: 4, supplierCount: 762, spendShare: 58.1,
      approach: 'Catalogue or standing order. No sourcing event unless the spend crosses the threshold.' }
  ];

  /* Top-20 supplier list. The real seed resolves seven by name; the panel is
     specified as twenty with ten visible, so the demo extends the list from the
     synthetic Pareto curve. Illustrative, like everything else in this file. */
  (function () {
    var have = d.suppliers.length, tot = 792600000;
    var pool = (d.paretoFull || []).filter(function (p) {
      return !d.suppliers.some(function (s) { return s.n === p.name; });
    });
    for (var i = 0; d.suppliers.length < 20 && i < pool.length; i++) {
      var p = pool[i];
      d.suppliers.push({ r: d.suppliers.length + 1, n: p.name, tot: Math.round(p.value * 2.6),
                         s5: p.value, share: (p.value / tot) * 100,
                         yoy: Math.round((((i * 37) % 61) - 22) * 10) / 10,
                         tier: p.value > 8e6 ? 'Preferred' : 'Transactional' });
    }
  }());
}());

/* ---------------------------------------------------------------------------
   Third illustrative block: the renewal decision matrix and the per-subcategory
   consolidation opportunities. Performance and market attractiveness are
   judgements, not spend facts, so the production seed carries neither and those
   panels state the gap. Invented here, like everything else in this file.
   =========================================================================== */
(function () {
  if (typeof CATEGORY_SEED === 'undefined') return;
  var d = (CATEGORY_SEED.categories || [])[0];
  if (!d || !d.__demo) return;

  d.renewalMatrix = {
    'Microsoft': { perf: 4.1, attr: 1.6,
      read: 'Delivery and quality both trending up, but the market is thin: three enterprise-scale alternatives and a switching cost measured in years. Renew and protect terms rather than threaten a move nobody believes.',
      blocked: 'Renewal window confirmed; notice date already inside the sourcing cycle.' },
    'Amazon Web Services': { perf: 3.8, attr: 3.4,
      read: 'Strong performer in a genuinely contested market. Azure and GCP are credible for a material share of the estate, which is what makes the committed-use renegotiation winnable.' },
    'Veeva Systems': { perf: 2.9, attr: 1.2,
      read: 'Adequate performance, almost no alternative mid-migration. Leverage has to come from the migration milestones themselves, not from a competitive threat.' },
    'SAP America': { perf: 3.2, attr: 2.2,
      read: 'Steady delivery. RISE terms are negotiable at the margin but the platform decision is effectively made.' },
    'Adobe': { perf: 3.4, attr: 3.1,
      read: 'Performs well and faces real substitution at the edges of the estate. The ETLA is the lever: unbundle what is genuinely used from what came with the suite.' },
    'Salesforce': { perf: 2.4, attr: 3.6,
      read: 'Under-performing against an attractive market, and 57% seat utilisation makes the case. Compete this one, or right-size it hard at the next order form.' },
    'ZS Associates': { perf: 1.9, attr: 3.8,
      read: 'Weakest performer in the portfolio, in the most contested market, on an expired SOW. Replace or re-scope before renewing anything.' }
  };

  /* Named opportunities inside each subcategory: consolidate consumption onto
     fewer contracts, or reduce the number of suppliers serving one need. */
  var OPPS = {
    'Marketing/Sales SaaS': [
      { kind: 'supplier', t: 'Collapse four campaign and content tools onto the Adobe ETLA',
        d: 'Four vendors cover overlapping campaign, asset and content workflows. Three renew within nine months, so the sequencing works.',
        from: 4, to: 1, vehicle: 'Adobe ETLA', value: 3100000 },
      { kind: 'volume', t: 'Pool seat purchasing across the three commercial business units',
        d: 'The same platform is bought three times at three different volume tiers. Pooling to one commit moves the whole category into the top band.',
        value: 1900000 }
    ],
    'IaaS': [
      { kind: 'volume', t: 'Move reserved and savings-plan coverage from 42% to the 75-85% band',
        d: 'Coverage is 33 points below best in class on a stable base load. This is consumption consolidation, not a supplier change.',
        value: 5500000 },
      { kind: 'supplier', t: 'Consolidate three regional cloud resellers into the direct EDP',
        d: 'Regional VARs add margin without adding service on workloads already covered by the enterprise agreement.',
        from: 3, to: 1, vehicle: 'AWS EDP', value: 1200000 }
    ],
    'On-Prem SW for IT': [
      { kind: 'supplier', t: 'Retire duplicate endpoint and identity tooling',
        d: 'Defender overlaps CrowdStrike on endpoint and Entra overlaps Okta on identity, and both Microsoft components are already paid for inside the EA.',
        from: 3, to: 1, vehicle: 'Microsoft EA', value: 4200000 }
    ],
    'Medicines Development SaaS': [
      { kind: 'supplier', t: 'Route four research-informatics point tools through one agreement',
        d: 'Each has a distinct scientific owner, which is why this is high effort. The saving is in contracting and support, not licence price.',
        from: 4, to: 1, vehicle: 'Research informatics MSA', value: 900000 }
    ],
    'Collaboration/Conferencing SaaS': [
      { kind: 'supplier', t: 'Retire Zoom and Webex; standardise on Teams',
        d: 'Teams is already licensed inside the EA and carries 94% adoption. Zoom sits at 28% utilisation on 22,000 seats.',
        from: 4, to: 1, vehicle: 'Microsoft EA', value: 5600000 }
    ],
    'Info Security SaaS': [
      { kind: 'volume', t: 'Consolidate 88 security vendors onto three platform commitments',
        d: 'Point-tool sprawl is the pattern here: 88 vendors for a capability three platforms cover. Start with the 61 under $250K.',
        from: 88, to: 3, vehicle: 'Platform commitments', value: 2400000 }
    ],
    'Scientific Research SW': [
      { kind: 'supplier', t: 'Consolidate the 142-vendor scientific tail behind a catalogue route',
        d: 'The most fragmented subcategory in the portfolio. Most of it is under $50K a vendor and never went through a sourcing event.',
        from: 142, to: 40, vehicle: 'App catalogue', value: 1800000 }
    ],
    'PaaS': [
      { kind: 'volume', t: 'Fold platform consumption into the IaaS commitment',
        d: 'PaaS and IaaS run on the same hyperscaler accounts but are committed separately, which splits the volume across two tiers.',
        value: 800000 }
    ]
  };
  (d.subcats || []).forEach(function (x) { if (OPPS[x.n]) x.opps = OPPS[x.n]; });
}());

/* ---------------------------------------------------------------------------
   Fourth illustrative block: the per-segment five-force reads and the segment
   tags that let the risk band follow the Kraljic/Porter selection. A five-force
   read per segment is a judgement, not a spend fact, so the production seed
   carries none and those panels state the gap.
   =========================================================================== */
(function () {
  if (typeof CATEGORY_SEED === 'undefined') return;
  var d = (CATEGORY_SEED.categories || [])[0];
  if (!d || !d.__demo) return;

  d.forcesBySegment = {
    'Marketing / Sales': {
      'Rivalry': 'High', 'Supplier power': 'Medium', 'Substitutes': 'Medium-High',
      'New entrants': 'Medium', 'Buyer power': 'Medium-High',
      read: 'Balanced and genuinely contested. This is where running a real competition changes the price, and where the four-tool overlap is worth collapsing.'
    },
    'Cloud infrastructure': {
      'Rivalry': 'High', 'Supplier power': 'Medium-High', 'Substitutes': 'Low-Medium',
      'New entrants': 'Low', 'Buyer power': 'High',
      read: 'Three credible hyperscalers, high switching cost per workload. Leverage is real but it comes from committed-use coverage, not from a migration threat nobody believes.'
    },
    'IT operations': {
      'Rivalry': 'Medium', 'Supplier power': 'High', 'Substitutes': 'Low',
      'New entrants': 'Low', 'Buyer power': 'Medium',
      read: 'Megavendor-dominated and bundled. The EA is the only lever with any travel in it, and the July list increase is the moment it moves.'
    },
    'Medicines Development': {
      'Rivalry': 'Low', 'Supplier power': 'High', 'Substitutes': 'Low',
      'New entrants': 'Low', 'Buyer power': 'Low-Medium',
      read: 'Supplier-dominated and thin on substitutes. Competing this is theatre. Leverage comes from the migration milestones and from validation scope, not from a competitive threat.'
    },
    'Collaboration / Conferencing': {
      'Rivalry': 'High', 'Supplier power': 'Low-Medium', 'Substitutes': 'High',
      'New entrants': 'Medium', 'Buyer power': 'High',
      read: 'High rivalry, strong substitutes, and one of them is already paid for inside the EA. This is a retire-and-consolidate market, not a negotiation.'
    },
    'Info Security': {
      'Rivalry': 'High', 'Supplier power': 'Medium', 'Substitutes': 'Medium',
      'New entrants': 'High', 'Buyer power': 'Medium',
      read: 'Crowded and still attracting entrants, which keeps pricing honest but produces the 88-vendor sprawl. Consolidation here buys governance more than it buys discount.'
    },
    'Scientific Research': {
      'Rivalry': 'Low', 'Supplier power': 'High', 'Substitutes': 'Low',
      'New entrants': 'Low-Medium', 'Buyer power': 'Low',
      read: 'Niche tools with scientific owners and no real alternative. Treat as strategic: the risk is continuity, not price.'
    },
    'SaaS': { 'Rivalry': 'High', 'Supplier power': 'Medium-High', 'Substitutes': 'Medium',
      'New entrants': 'Medium', 'Buyer power': 'Medium-High',
      read: 'Broad competition at the edges, megavendor bundling at the core.' },
    'On-Premise': { 'Rivalry': 'Medium', 'Supplier power': 'High', 'Substitutes': 'Low',
      'New entrants': 'Low', 'Buyer power': 'Medium',
      read: 'Entrenched estates with high switching cost; maintenance is the negotiable line.' },
    'IaaS': { 'Rivalry': 'High', 'Supplier power': 'Medium-High', 'Substitutes': 'Low-Medium',
      'New entrants': 'Low', 'Buyer power': 'High',
      read: 'Three hyperscalers, commitment-driven pricing.' },
    'PaaS': { 'Rivalry': 'Medium', 'Supplier power': 'Medium-High', 'Substitutes': 'Low-Medium',
      'New entrants': 'Medium', 'Buyer power': 'Medium',
      read: 'Tied to the IaaS decision; rarely competed on its own.' }
  };

  /* Which segments each risk actually bites in, so the risk band can follow the
     selection instead of showing everything regardless. */
  var TAGS = {
    'AI data-governance / training rights': ['Marketing / Sales', 'Medicines Development', 'Info Security', 'SaaS'],
    'GenAI price inflation in renewals': ['Marketing / Sales', 'IT operations', 'Cloud infrastructure', 'SaaS', 'IaaS'],
    'Microsoft Jul 1 2026 increase': ['IT operations', 'Collaboration / Conferencing', 'On-Premise', 'SaaS'],
    'Reseller pass-through opacity': ['IT operations', 'On-Premise'],
    'Spend classification gap': ['Marketing / Sales', 'IT operations', 'Scientific Research'],
    'Tail sprawl': ['Scientific Research', 'Info Security', 'Collaboration / Conferencing'],
    'Veeva Vault CRM migration': ['Medicines Development']
  };
  (d.risks || []).forEach(function (r) { if (TAGS[r.risk]) r.segments = TAGS[r.risk]; });

  var TTAGS = {
    'Microsoft Jul 1 2026 increase': ['IT operations', 'Collaboration / Conferencing', 'On-Premise'],
    'GenAI price inflation in renewals': ['Marketing / Sales', 'Cloud infrastructure', 'SaaS', 'IaaS'],
    'AI data-governance / training rights': ['Marketing / Sales', 'Medicines Development', 'Info Security'],
    'Veeva Vault CRM migration': ['Medicines Development'],
    'Tail sprawl': ['Scientific Research', 'Info Security'],
    'Reseller pass-through opacity': ['IT operations', 'On-Premise']
  };
  (d.triggers || []).forEach(function (t) { if (TTAGS[t.risk]) t.segments = TTAGS[t.risk]; });
}());
