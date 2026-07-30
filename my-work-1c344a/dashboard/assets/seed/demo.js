/* ===========================================================================
 * assets/seed/demo.js, the ONE canonical, cross-referenced demo dataset,
 * consolidated into window.__SEED__.demo (build plan P2).
 *
 * This is the former window.DEMO "golden thread" (assets/demo-data.js) lifted
 * verbatim into the seed layer: every entity links to the others by id /
 * GlobalID, so a supplier seen in spend is the SAME supplier in projects,
 * contracts, renewals, obligations, savings and QBR, owned by the SAME rep
 * everywhere. People still come from people.js (THEO.PEOPLE, keyed by Workday
 * GlobalID); the DEMO -> GlobalID joins happen in the PAGES (via THEO), not here.
 *
 * Each record type carries a co-located `$src` map (see _util.js) that classifies
 * and grounds its figures: spend / value / amount / dates / counts -> a sourced
 * stub(); nothing here is a live value. The plain numbers are UNCHANGED from the
 * original demo dataset (reflect-only): $src only ADDS provenance, it never edits
 * a figure. Coverage is DERIVED from `$src`, never authored.
 *
 * Read path: pages read this through the Theo.data.*Seed() facade
 * (assets/theo-data.js). assets/demo-data.js is now a thin shim that rebuilds
 * window.DEMO from THIS seed for the few non-migrated consumers (tasks-drawer.js).
 *
 * Money is in $K (thousands) unless noted. Dates are ISO. Self-assigning so the
 * same file works in dev (<script src>) and in the shell blob (window.__SEED__).
 * ======================================================================== */
(function () {
  var S = (window.__SEED__ = window.__SEED__ || {});
  var stub = window.stub;

  /* Source factories, fresh arrays so each field owns its provenance. */
  var ARIA   = function () { return [stub('ARIA S2P, trailing-12m PO / spend pull', 1)]; };
  var CLM    = function () { return [stub('CLM contract registry (LEAH)', 1)]; };
  var MASTER = function () { return [stub('Supplier / people master (SAP / Workday)', 1)]; };
  var SAV    = function () { return [stub('Savings ledger, reflect-only estimate', 2)]; };

  // rep / owner GlobalIDs (mirror people.js)
  var ML = 'WD-100237', AK = 'WD-100241', DR = 'WD-100245', SO = 'WD-100061';
  var PRIYA = 'WD-100212', NINA = 'WD-100301', RAJ = 'WD-100302', KAREN = 'WD-100303', TOM = 'WD-100304';

  var TODAY = '2026-06-26';

  // --- SUPPLIERS ------------------------------------------------------------
  // spendK = trailing-12m Lilly spend. ownerRep = the rep who owns the relationship.
  // risk = {tier, signal} where tier is Clear|Watch|Elevated|Critical (no green downstream).
  var suppliers = [
    { id:'SUP-TATA',  name:'Tata Consultancy', category:'IT services', commodity:'IT-SVC-PAYROLL',   spendK:3120, tier:'strategic',    diversity:null,  status:'active',   ownerRep:AK, singleSource:false, risk:{tier:'Watch',    signal:'Margin pressure noted in FY25 filing'} },
    { id:'SUP-VEEVA', name:'Veeva Systems',    category:'SaaS / apps', commodity:'IT-SAAS-CRM',       spendK:2480, tier:'strategic',    diversity:null,  status:'active',   ownerRep:ML, singleSource:true,  risk:{tier:'Elevated', signal:'Single-source for field CRM; usage up 22%'} },
    { id:'SUP-GLX',   name:'Globex Systems',   category:'Data & integration', commodity:'IT-DATA-PLATFORM', spendK:1980, tier:'strategic', diversity:null, status:'active', ownerRep:DR, singleSource:false, risk:{tier:'Critical', signal:'COI expired; financial-health downgrade reported'} },
    { id:'SUP-NOW',   name:'ServiceNow',       category:'ITSM / workflow', commodity:'IT-ITSM',       spendK:1340, tier:'strategic',    diversity:null,  status:'renewing', ownerRep:ML, singleSource:false, risk:{tier:'Clear',    signal:'No adverse signal'} },
    { id:'SUP-DELL',  name:'Dell Technologies',category:'Hardware & infra', commodity:'IT-HW-INFRA',  spendK:1220, tier:'transactional',diversity:null,  status:'active',   ownerRep:DR, singleSource:false, risk:{tier:'Clear',    signal:'No adverse signal'} },
    { id:'SUP-INFY',  name:'Infosys',          category:'IT services', commodity:'IT-SVC-INTEG',      spendK:1180, tier:'leverage',     diversity:null,  status:'action',   ownerRep:AK, singleSource:false, risk:{tier:'Watch',    signal:'Open TPRM action'} },
    { id:'SUP-ACME',  name:'Acme Analytics',   category:'SaaS / apps', commodity:'IT-SAAS-ANALYTICS', spendK:600,  tier:'emerging',     diversity:null,  status:'sourcing', ownerRep:ML, singleSource:false, risk:{tier:'Elevated', signal:'Processes employee PI; 1 open SOC 2 finding'} },
    { id:'SUP-FIGMA', name:'Figma',            category:'SaaS / apps', commodity:'IT-SAAS-DESIGN',    spendK:540,  tier:'leverage',     diversity:null,  status:'tprm',     ownerRep:AK, singleSource:false, risk:{tier:'Watch',    signal:'TPRM review in progress'} },
    { id:'SUP-HELIOS',name:'Helios',           category:'ITSM / workflow', commodity:'IT-ITSM-SAAS',  spendK:300,  tier:'leverage',     diversity:null,  status:'renewing', ownerRep:DR, singleSource:false, risk:{tier:'Clear',    signal:'No adverse signal'} },
    { id:'SUP-BRANDLY',name:'Brandly',         category:'SaaS / apps', commodity:'IT-SAAS-MKTG',      spendK:210,  tier:'transactional',diversity:'MBE', status:'active',   ownerRep:ML, singleSource:false, risk:{tier:'Clear',    signal:'No adverse signal'} },
    { id:'SUP-SENTRY',name:'Sentry',           category:'Security',    commodity:'IT-SEC-TOOLING',    spendK:45,   tier:'emerging',     diversity:null,  status:'sourcing', ownerRep:SO, singleSource:false, risk:{tier:'Watch',    signal:'PoC; security posture under review'} },
    { id:'SUP-QUILL', name:'Quill',            category:'SaaS / apps', commodity:'IT-SAAS-DOC',       spendK:120,  tier:'transactional',diversity:'WBE', status:'canceled', ownerRep:AK, singleSource:false, risk:{tier:'Clear',    signal:'Engagement canceled'} },
    { id:'SUP-MSFT',  name:'Microsoft',          category:'SaaS / apps',         commodity:'IT-SAAS-PROD',    spendK:4800, tier:'strategic',     diversity:null,  status:'active',   ownerRep:ML, singleSource:true,  risk:{tier:'Clear',    signal:'Enterprise agreement; no adverse signal'} },
    { id:'SUP-AWS',   name:'Amazon Web Services',category:'Cloud & infra',       commodity:'IT-CLOUD-IAAS',   spendK:3600, tier:'strategic',     diversity:null,  status:'active',   ownerRep:DR, singleSource:false, risk:{tier:'Watch',    signal:'Spend up 31% YoY; commitment true-up due'} },
    { id:'SUP-SAP',   name:'SAP',                category:'ERP / SaaS',          commodity:'IT-SAAS-ERP',     spendK:2900, tier:'strategic',     diversity:null,  status:'renewing', ownerRep:ML, singleSource:true,  risk:{tier:'Elevated', signal:'Single-source ERP; renewal in window'} },
    { id:'SUP-WIPRO', name:'Wipro',              category:'IT services',         commodity:'IT-SVC-APPDEV',   spendK:1450, tier:'leverage',     diversity:null,  status:'active',   ownerRep:AK, singleSource:false, risk:{tier:'Watch',    signal:'Open TPRM action; SOW backlog'} },
    { id:'SUP-ATOS',  name:'Atos',               category:'IT managed services', commodity:'IT-MANAGED-SVC',  spendK:1180, tier:'leverage',     diversity:null,  status:'renewing', ownerRep:AK, singleSource:false, risk:{tier:'Elevated', signal:'Financial-health watch; renewal due'} },
    { id:'SUP-CRWD',  name:'CrowdStrike',        category:'Security',            commodity:'IT-SEC-EDR',      spendK:980,  tier:'strategic',     diversity:null,  status:'renewing', ownerRep:DR, singleSource:false, risk:{tier:'Watch',    signal:'Critical security dependency; concentration risk'} },
    { id:'SUP-LENOVO',name:'Lenovo',             category:'Hardware & infra',    commodity:'IT-HW-CLIENT',    spendK:870,  tier:'transactional', diversity:null,  status:'active',   ownerRep:SO, singleSource:false, risk:{tier:'Clear',    signal:'Secondary hardware source'} },
    { id:'SUP-OKTA',  name:'Okta',               category:'Security',            commodity:'IT-SEC-IAM',      spendK:760,  tier:'leverage',     diversity:null,  status:'active',   ownerRep:AK, singleSource:false, risk:{tier:'Clear',    signal:'No adverse signal'} },
    { id:'SUP-DDOG',  name:'Datadog',            category:'Data & integration',  commodity:'IT-OBSERVABILITY',spendK:540,  tier:'leverage',     diversity:null,  status:'action',   ownerRep:DR, singleSource:false, risk:{tier:'Watch',    signal:'Usage-based spend volatility'} },
    { id:'SUP-ZOOM',  name:'Zoom',               category:'SaaS / apps',         commodity:'IT-SAAS-COLLAB',  spendK:280,  tier:'transactional', diversity:'MBE', status:'active',   ownerRep:SO, singleSource:false, risk:{tier:'Clear',    signal:'No adverse signal'} }
  ];

  // --- CONTRACTS ------------------------------------------------------------
  // end = expiry/renewal date; noticeDays = days of notice required before end.
  var contracts = [
    { id:'CW-2107', supplier:'SUP-VEEVA', project:'P-1039', paper:'MSA + WO', valueK:2480, start:'2024-10-01', end:'2026-09-30', noticeDays:90,  status:'active', autoRenew:true,   note:'Field CRM; usage up 22%, renegotiate tiers' },
    { id:'CW-1980', supplier:'SUP-TATA',  project:'P-1048', paper:'Payroll MSA', valueK:3120, start:'2023-11-15', end:'2026-11-15', noticeDays:60, status:'active', autoRenew:false,   note:'On standard rate card' },
    { id:'CW-2156', supplier:'SUP-GLX',   project:'P-1051', paper:'Data platform MSA', valueK:1980, start:'2024-09-12', end:'2026-09-12', noticeDays:90, status:'active', autoRenew:false, note:'Consolidation opportunity; COI expired' },
    { id:'CW-2291', supplier:'SUP-NOW',   project:'P-1061', paper:'ITSM platform', valueK:1340, start:'2024-09-01', end:'2026-08-31', noticeDays:60, status:'renewing', autoRenew:true, note:'Price-down round before auto-renewal' },
    { id:'CW-1899', supplier:'SUP-DELL',  project:null,     paper:'Hardware EA', valueK:1220, start:'2024-12-01', end:'2026-11-30', noticeDays:30, status:'active', autoRenew:false,   note:'Refresh cycle aligned' },
    { id:'CW-2044', supplier:'SUP-INFY',  project:'P-1059', paper:'Integration SOW', valueK:1180, start:'2024-12-20', end:'2026-12-20', noticeDays:60, status:'active', autoRenew:false, note:'TPRM action open; consider recompete' },
    { id:'CW-0990', supplier:'SUP-HELIOS',project:'P-0991', paper:'ITSM annual', valueK:300, start:'2025-10-01', end:'2026-09-30', noticeDays:30, status:'renewing', autoRenew:true, note:'Renew / recompete decision due' },
    { id:'CW-1771', supplier:'SUP-BRANDLY',project:'P-1001',paper:'DAM SaaS', valueK:210, start:'2025-05-20', end:'2027-05-19', noticeDays:30, status:'active', autoRenew:true,  note:'On standard terms' },
    { id:'CW-1402', supplier:'SUP-FIGMA', project:null,     paper:'Design SaaS', valueK:540, start:'2025-03-01', end:'2026-08-15', noticeDays:30, status:'active', autoRenew:true,  note:'TPRM review must clear before renewal' },
    { id:'CW-3001', supplier:'SUP-MSFT',  project:'P-1070', paper:'Enterprise Agreement', valueK:4800, start:'2024-07-01', end:'2027-06-30', noticeDays:90, status:'active',   autoRenew:false, note:'M365 + Azure EA; annual true-up' },
    { id:'CW-3002', supplier:'SUP-AWS',   project:'P-1071', paper:'Cloud commitment',     valueK:3600, start:'2025-01-01', end:'2026-12-31', noticeDays:60, status:'active',   autoRenew:true,  note:'EDP commitment; usage up 31%' },
    { id:'CW-3003', supplier:'SUP-SAP',   project:'P-1072', paper:'ERP subscription',     valueK:2900, start:'2023-09-16', end:'2026-09-15', noticeDays:90, status:'renewing', autoRenew:true,  note:'S/4HANA; single-source, renewal in window' },
    { id:'CW-3006', supplier:'SUP-WIPRO', project:'P-1076', paper:'App-dev MSA + SOW',     valueK:1450, start:'2024-11-01', end:'2026-10-31', noticeDays:60, status:'active',   autoRenew:false, note:'TPRM action open; SOW backlog' },
    { id:'CW-3007', supplier:'SUP-ATOS',  project:'P-1077', paper:'Managed-services MSA',  valueK:1180, start:'2023-08-21', end:'2026-08-20', noticeDays:60, status:'renewing', autoRenew:true,  note:'Renew / recompete; financial-health watch' },
    { id:'CW-3005', supplier:'SUP-CRWD',  project:'P-1074', paper:'EDR subscription',      valueK:980,  start:'2024-10-01', end:'2026-09-30', noticeDays:45, status:'renewing', autoRenew:true,  note:'Critical security; renewal in window' },
    { id:'CW-3009', supplier:'SUP-LENOVO',project:'P-1079', paper:'Hardware supply',       valueK:870,  start:'2025-02-01', end:'2027-01-31', noticeDays:30, status:'active',   autoRenew:false, note:'Secondary client-hardware source' },
    { id:'CW-3004', supplier:'SUP-OKTA',  project:'P-1073', paper:'IAM subscription',      valueK:760,  start:'2025-04-01', end:'2027-03-31', noticeDays:60, status:'active',   autoRenew:true,  note:'Identity platform; standard terms' },
    { id:'CW-3008', supplier:'SUP-ZOOM',  project:'P-1078', paper:'Collab SaaS',           valueK:280,  start:'2025-06-01', end:'2027-05-31', noticeDays:30, status:'active',   autoRenew:true,  note:'On standard terms' }
  ];

  // --- OBLIGATIONS ----------------------------------------------------------
  // party = who owes it (Lilly|Supplier); dueDate drives the standing monitor.
  var obligations = [
    { id:'OBL-01', contract:'CW-2107', supplier:'SUP-VEEVA', text:'Supplier delivers an annual SOC 2 Type II report', type:'compliance', party:'Supplier', dueDate:'2026-07-15', cadence:'annual', status:'open' },
    { id:'OBL-02', contract:'CW-2107', supplier:'SUP-VEEVA', text:'Lilly gives 90-day notice to renegotiate tiers before renewal', type:'commercial', party:'Lilly', dueDate:'2026-07-02', cadence:'once', status:'open' },
    { id:'OBL-03', contract:'CW-2156', supplier:'SUP-GLX',   text:'Supplier maintains a current Certificate of Insurance', type:'compliance', party:'Supplier', dueDate:'2026-06-20', cadence:'annual', status:'overdue' },
    { id:'OBL-04', contract:'CW-2156', supplier:'SUP-GLX',   text:'Quarterly data-platform performance review (SLA credits)', type:'service', party:'Supplier', dueDate:'2026-07-31', cadence:'quarterly', status:'open' },
    { id:'OBL-05', contract:'CW-2291', supplier:'SUP-NOW',   text:'Lilly issues notice of intent to renew or recompete', type:'commercial', party:'Lilly', dueDate:'2026-08-31', cadence:'once', status:'open' },
    { id:'OBL-06', contract:'CW-2044', supplier:'SUP-INFY',  text:'Supplier closes the open TPRM remediation action', type:'compliance', party:'Supplier', dueDate:'2026-07-10', cadence:'once', status:'open' },
    { id:'OBL-07', contract:'CW-1980', supplier:'SUP-TATA',  text:'Annual rate-card true-up against the benchmark', type:'commercial', party:'Lilly', dueDate:'2026-09-15', cadence:'annual', status:'open' },
    { id:'OBL-08', contract:'CW-0990', supplier:'SUP-HELIOS',text:'Renew / recompete decision before the notice deadline', type:'commercial', party:'Lilly', dueDate:'2026-08-31', cadence:'once', status:'open' },
    { id:'OBL-09', contract:'CW-1402', supplier:'SUP-FIGMA', text:'TPRM review must clear before the contract renews', type:'compliance', party:'Lilly', dueDate:'2026-07-16', cadence:'once', status:'open' },
    { id:'OBL-10', contract:'CW-2107', supplier:'SUP-VEEVA', text:'Price-protection cap holds at 3% on renewal', type:'commercial', party:'Supplier', dueDate:'2026-09-30', cadence:'once', status:'open' },
    { id:'OBL-11', contract:'CW-1899', supplier:'SUP-DELL',  text:'Hardware refresh true-forward reconciliation', type:'commercial', party:'Lilly', dueDate:'2026-10-30', cadence:'annual', status:'open' },
    { id:'OBL-12', contract:'CW-3003', supplier:'SUP-SAP',   text:'Lilly issues notice of intent on the ERP renewal', type:'commercial', party:'Lilly', dueDate:'2026-06-17', cadence:'once', status:'open' },
    { id:'OBL-13', contract:'CW-3007', supplier:'SUP-ATOS',  text:'Renew / recompete decision before the notice deadline', type:'commercial', party:'Lilly', dueDate:'2026-06-21', cadence:'once', status:'open' },
    { id:'OBL-14', contract:'CW-3005', supplier:'SUP-CRWD',  text:'Supplier delivers updated SOC 2 + pen-test attestation', type:'compliance', party:'Supplier', dueDate:'2026-08-01', cadence:'annual', status:'open' },
    { id:'OBL-15', contract:'CW-3002', supplier:'SUP-AWS',   text:'Cloud commitment usage true-up reconciliation', type:'commercial', party:'Lilly', dueDate:'2026-07-31', cadence:'annual', status:'open' }
  ];

  // --- PROJECTS -------------------------------------------------------------
  // state: review|active|sourcing|approval|renewing|scoping|canceled. value in $K.
  var projects = [
    { id:'P-1042', slug:'acme',    name:'AI-powered employee-analytics platform', supplier:'SUP-ACME',  rep:ML, owner:PRIYA, type:'New supplier engagement', state:'review',   valueK:1800, created:'2026-06-23', due:'2026-07-31', dueNote:'Target PO date - business-requested Q3 go-live', color:'o', rfx:false, contract:null,    waits:[['ISS security questionnaire','Acme'],['WwTP determination','WwTP team']] },
    { id:'P-1039', slug:'veevacrm', name:'Field CRM license expansion',           supplier:'SUP-VEEVA', rep:ML, owner:PRIYA, type:'Buy under existing MSA', state:'active',   valueK:2400, created:'2026-05-29', due:'', dueNote:'', color:'y', rfx:false, contract:'CW-2107', waits:[] },
    { id:'P-1056', slug:'nimbus',  name:'Enterprise data platform - competitive RFP', supplier:null,    rep:ML, owner:ML,    type:'New supplier engagement', state:'sourcing', valueK:3200, created:'2026-06-05', due:'2026-08-15', dueNote:'Award target - 4 bidders shortlisted', color:'o', rfx:true, contract:null, waits:[['4 bidder proposals','suppliers']] },
    { id:'P-1051', name:'Lab data migration & integration services', supplier:'SUP-GLX', rep:AK, owner:RAJ,   type:'Buy under existing MSA', state:'approval', valueK:680,  created:'2026-06-12', due:'2026-07-10', dueNote:'Business-requested completion', color:'y', rfx:false, contract:'CW-2156', waits:[['ATC approval','Jordan Avery']] },
    { id:'P-1048', name:'Cross-border payroll processing services', supplier:'SUP-TATA', rep:AK, owner:PRIYA, type:'Buy under existing MSA', state:'review',   valueK:800,  created:'2026-06-20', due:'2026-07-05', dueNote:'Business-requested go-live', color:'o', rfx:false, contract:'CW-1980', waits:[['CCI classification','Priya Shah'],['Covered-data screen','DLO']] },
    { id:'P-1055', name:'Security tooling proof-of-concept',     supplier:'SUP-SENTRY',rep:SO, owner:KAREN, type:'Try before buy',         state:'sourcing', valueK:45,   created:'2026-06-15', due:'', dueNote:'', color:'g', rfx:false, contract:null, waits:[['PoC evaluation','Sam Okafor']] },
    { id:'P-1058', slug:'datapipe',name:'Data pipeline tooling', supplier:null,        rep:ML, owner:RAJ,   type:'New supplier engagement', state:'sourcing', valueK:200,  created:'2026-06-18', due:'', dueNote:'', color:'y', rfx:false, contract:null, waits:[['Market scan','Marc Lane']] },
    { id:'P-0991', slug:'helios',  name:'ITSM platform - annual renewal',        supplier:'SUP-HELIOS',rep:ML, owner:KAREN, type:'Renewal',                 state:'renewing', valueK:300,  created:'2026-06-01', due:'2026-09-30', dueNote:'Contract expires Sep 30; notice due Aug 31', color:'y', rfx:false, contract:'CW-0990', dueSoon:true, waits:[['Renew / recompete decision','Dan Reed']] },
    { id:'P-1001', slug:'brandly', name:'Marketing digital-asset management',    supplier:'SUP-BRANDLY',rep:ML,owner:PRIYA, type:'Buy under existing MSA', state:'active',   valueK:210,  created:'2026-05-20', due:'', dueNote:'', color:'g', rfx:false, contract:'CW-1771', waits:[] },
    { id:'P-1012', slug:'oktasso', name:'Okta SSO seat expansion',              supplier:'SUP-INFY',  rep:ML, owner:NINA,  type:'Buy under existing MSA', state:'active',   valueK:420,  created:'2026-05-12', due:'', dueNote:'', color:'y', rfx:false, contract:'CW-2044', waits:[] },
    { id:'P-0975', name:'Document automation tool',             supplier:'SUP-QUILL', rep:AK, owner:PRIYA, type:'Buy under existing MSA', state:'canceled', valueK:120,  created:'2026-05-02', due:'', dueNote:'', color:'y', rfx:false, contract:null, waits:[] },
    { id:'P-1061', slug:'servicenow', name:'ServiceNow ITSM price-down renewal',    supplier:'SUP-NOW',   rep:ML, owner:KAREN, type:'Renewal',                 state:'renewing', valueK:1340, created:'2026-06-10', due:'2026-08-31', dueNote:'Price-down round before auto-renewal', color:'y', rfx:false, contract:'CW-2291', dueSoon:true, waits:[['Price-down proposal','ServiceNow']] },
    { id:'P-1063', name:'Hardware EA refresh - laptops',         supplier:'SUP-DELL',  rep:DR, owner:TOM,   type:'Buy under existing MSA', state:'active',   valueK:540,  created:'2026-06-08', due:'', dueNote:'', color:'g', rfx:false, contract:'CW-1899', waits:[] },
    { id:'P-1059', name:'Infosys integration SOW - phase 2',     supplier:'SUP-INFY',  rep:AK, owner:RAJ,   type:'Buy under existing MSA', state:'approval', valueK:760,  created:'2026-06-16', due:'2026-07-18', dueNote:'ATC approval pending', color:'y', rfx:false, contract:'CW-2044', waits:[['ATC approval','Jordan Avery']] },
    { id:'P-1064', name:'Figma enterprise design seats',         supplier:'SUP-FIGMA', rep:AK, owner:NINA,  type:'New supplier engagement', state:'review',   valueK:540,  created:'2026-06-21', due:'2026-07-25', dueNote:'TPRM must clear first', color:'o', rfx:false, contract:'CW-1402', waits:[['TPRM review','Aravo']] },
    { id:'P-1066', slug:'vaultqms', name:'Veeva Vault QMS add-on',               supplier:'SUP-VEEVA', rep:ML, owner:RAJ,   type:'Buy under existing MSA', state:'scoping',  valueK:380,  created:'2026-06-24', due:'', dueNote:'', color:'o', rfx:false, contract:'CW-2107', waits:[['Scope confirmation','R&D IT']] },
    { id:'P-1070', slug:'m365e5', name:'Microsoft 365 E5 true-up',             supplier:'SUP-MSFT',  rep:ML, owner:NINA,  type:'Buy under existing MSA', state:'active',   valueK:4800, created:'2026-06-02', due:'', dueNote:'', color:'g', rfx:false, contract:'CW-3001', waits:[] },
    { id:'P-1071', name:'AWS commitment true-up',               supplier:'SUP-AWS',   rep:DR, owner:TOM,   type:'Buy under existing MSA', state:'review',   valueK:3600, created:'2026-06-19', due:'2026-07-28', dueNote:'Commitment reconciliation; spend up 31%', color:'o', rfx:false, contract:'CW-3002', waits:[['Usage reconciliation','Cloud FinOps']] },
    { id:'P-1072', slug:'saps4', name:'SAP S/4HANA renewal',                 supplier:'SUP-SAP',   rep:ML, owner:RAJ,   type:'Renewal',                 state:'renewing', valueK:2900, created:'2026-06-05', due:'2026-09-15', dueNote:'Single-source ERP; notice due Jun 17', color:'y', rfx:false, contract:'CW-3003', dueSoon:true, waits:[['Renewal strategy','Marc Lane']] },
    { id:'P-1073', name:'Okta identity expansion',             supplier:'SUP-OKTA',  rep:AK, owner:NINA,  type:'Buy under existing MSA', state:'active',   valueK:240,  created:'2026-06-11', due:'', dueNote:'', color:'g', rfx:false, contract:'CW-3004', waits:[] },
    { id:'P-1074', name:'CrowdStrike EDR renewal',             supplier:'SUP-CRWD',  rep:DR, owner:KAREN, type:'Renewal',                 state:'renewing', valueK:980,  created:'2026-06-09', due:'2026-09-30', dueNote:'Critical security; notice due Aug 16', color:'y', rfx:false, contract:'CW-3005', dueSoon:true, waits:[['Renewal / recompete decision','Dan Reed']] },
    { id:'P-1075', name:'Observability tooling rationalization', supplier:'SUP-DDOG', rep:DR, owner:RAJ,  type:'New supplier engagement', state:'sourcing', valueK:300,  created:'2026-06-17', due:'', dueNote:'', color:'y', rfx:false, contract:null, waits:[['Usage analysis','Dan Reed']] },
    { id:'P-1076', name:'Wipro application-dev SOW',           supplier:'SUP-WIPRO', rep:AK, owner:RAJ,   type:'Buy under existing MSA', state:'approval', valueK:620,  created:'2026-06-14', due:'2026-07-20', dueNote:'ATC approval pending', color:'y', rfx:false, contract:'CW-3006', waits:[['ATC approval','Jordan Avery']] },
    { id:'P-1077', name:'Atos managed-services renewal',        supplier:'SUP-ATOS',  rep:AK, owner:TOM,   type:'Renewal',                 state:'renewing', valueK:1180, created:'2026-06-03', due:'2026-08-20', dueNote:'Notice due Jun 21; financial-health watch', color:'o', rfx:false, contract:'CW-3007', dueSoon:true, waits:[['Renew / recompete decision','Aisha Khan']] },
    { id:'P-1078', name:'Zoom enterprise true-up',             supplier:'SUP-ZOOM',  rep:SO, owner:NINA,  type:'Buy under existing MSA', state:'active',   valueK:120,  created:'2026-06-13', due:'', dueNote:'', color:'g', rfx:false, contract:'CW-3008', waits:[] },
    { id:'P-1079', name:'Lenovo client-hardware refresh',      supplier:'SUP-LENOVO',rep:SO, owner:TOM,   type:'Buy under existing MSA', state:'active',   valueK:870,  created:'2026-06-07', due:'', dueNote:'', color:'g', rfx:false, contract:'CW-3009', waits:[] }
  ];

  // --- SAVINGS --------------------------------------------------------------
  // kind: ci = cost improvement (price down) | ca = cost avoidance. amount in $K.
  var savings = [
    { id:'SAV-01', project:'P-1039', supplier:'SUP-VEEVA', rep:ML, kind:'ci', amountK:180, status:'achieved', note:'Tier renegotiation on usage uplift' },
    { id:'SAV-02', project:'P-0991', supplier:'SUP-HELIOS',rep:DR, kind:'ci', amountK:42,  status:'committed', note:'Renewal price-down round' },
    { id:'SAV-03', project:'P-1056', supplier:null,        rep:ML, kind:'ca', amountK:550, status:'committed', note:'Competitive RFP vs incumbent list price' },
    { id:'SAV-04', project:'P-1048', supplier:'SUP-TATA',  rep:AK, kind:'ci', amountK:96,  status:'achieved', note:'Rate-card true-up' },
    { id:'SAV-05', project:'P-1051', supplier:'SUP-GLX',   rep:AK, kind:'ca', amountK:120, status:'committed', note:'Consolidation vs separate buys' },
    { id:'SAV-06', project:'P-1061', supplier:'SUP-NOW',   rep:ML, kind:'ci', amountK:155, status:'committed', note:'Price-down before auto-renewal' },
    { id:'SAV-07', project:'P-1063', supplier:'SUP-DELL',  rep:DR, kind:'ci', amountK:64,  status:'achieved', note:'Refresh volume discount' },
    { id:'SAV-08', project:'P-1012', supplier:'SUP-INFY',  rep:ML, kind:'ca', amountK:88,  status:'committed', note:'Seat-expansion avoidance via existing MSA' },
    { id:'SAV-09', project:'P-1059', supplier:'SUP-INFY',  rep:AK, kind:'ci', amountK:73,  status:'committed', note:'Phase-2 SOW rate hold' },
    { id:'SAV-10', project:'P-1070', supplier:'SUP-MSFT', rep:ML, kind:'ci', amountK:240, status:'committed', note:'EA true-up; license tier optimization' },
    { id:'SAV-11', project:'P-1071', supplier:'SUP-AWS',  rep:DR, kind:'ca', amountK:310, status:'committed', note:'Commitment right-sizing vs on-demand' },
    { id:'SAV-12', project:'P-1077', supplier:'SUP-ATOS', rep:AK, kind:'ci', amountK:130, status:'committed', note:'Managed-services renewal price-down' },
    { id:'SAV-13', project:'P-1074', supplier:'SUP-CRWD', rep:DR, kind:'ci', amountK:85,  status:'committed', note:'EDR renewal multi-year discount' }
  ];

  // --- PORTFOLIO SCALE (context, not individually threaded) -----------------
  // The entities above are the clickable "working set", what actually needs a
  // rep this week. These aggregates convey the real book size so the app reads
  // at Lilly scale without fabricating 700 fully-connected records. $ in $K.
  var scale = {
    org: {
      suppliers: 712, reps: 8, activeContracts: 1850,
      spendByCategory: [
        { cat: 'Software & SaaS',           spendK: 700000 },
        { cat: 'IT professional services',  spendK: 138000 },
        { cat: 'Telecom & network',         spendK: 94000 },
        { cat: 'Hardware & infrastructure', spendK: 72000 },
        { cat: 'IT managed services',       spendK: 51000 }
      ]
    },
    byRep: {}   // per-rep "managed book", deliberately larger than the active/threaded slice
  };
  scale.byRep[ML] = { suppliers: 94, managedSpendK: 248000, activeContracts: 152 };
  scale.byRep[AK] = { suppliers: 88, managedSpendK: 176000, activeContracts: 138 };
  scale.byRep[DR] = { suppliers: 91, managedSpendK: 164000, activeContracts: 145 };
  scale.byRep[SO] = { suppliers: 61, managedSpendK: 58000,  activeContracts: 96 };

  /* -------- $src stamping, ADDS provenance; never edits a figure ---------- */
  suppliers.forEach(function (s) { s.$src = { spendK: ARIA() }; });
  contracts.forEach(function (c) { c.$src = { valueK: ARIA(), start: CLM(), end: CLM(), noticeDays: CLM() }; });
  obligations.forEach(function (o) { o.$src = { dueDate: CLM() }; });
  projects.forEach(function (p) { p.$src = { valueK: ARIA() }; });
  savings.forEach(function (v) { v.$src = { amountK: SAV() }; });
  scale.org.$src = { suppliers: MASTER(), reps: MASTER(), activeContracts: MASTER() };
  scale.org.spendByCategory.forEach(function (c) { c.$src = { spendK: ARIA() }; });
  Object.keys(scale.byRep).forEach(function (g) {
    scale.byRep[g].$src = { suppliers: MASTER(), managedSpendK: ARIA(), activeContracts: MASTER() };
  });

  S.demo = {
    TODAY: TODAY,
    suppliers: suppliers,
    contracts: contracts,
    obligations: obligations,
    projects: projects,
    savings: savings,
    scale: scale
    // NOTE: `renewals` is a DERIVED standing feed (Theo.data.dueWithin / renewalsSeed),
    // not a stored table, the demo never had one, so nothing is invented here.
  };
})();
