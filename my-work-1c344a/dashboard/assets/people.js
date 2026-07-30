/* ===========================================================================
 * people.js, the canonical PERSON / IDENTITY foundation for Theo.
 *
 * Identity is keyed by Workday GlobalID (gid), the stable key that survives
 * name, email, and role changes. Name + email are for display only. Every
 * project/task/assignment in the system should reference a person by gid.
 *
 * Systems of record (Theo never owns these): Workday owns identity, base role,
 * and the supervisor relationship; Entra ID owns access/role grants. Theo
 * administers WORK OWNERSHIP and ROUTING only, and always reflect-don't-enforce
 * (it suggests an assignment/delegation/reassignment; a human confirms).
 *
 * This file exposes:
 *   THEO.PEOPLE        - the registry (gid, name, email, role, admin, supervisor, av, load)
 *   THEO.COVERAGE      - the ownership map a procurement admin maintains
 *   THEO.suggestRep()  - the intake triage: supplier-override -> commodity -> infer -> capacity -> OOO
 *   THEO.resolveAssignee() / delegation helpers - OOO + permanent delegation
 *   small lookup helpers (person, byName, repsManagedBy, isAdmin, supervisorOf...)
 *
 * Pure, self-contained, vanilla. Load it before any page script that assigns,
 * delegates, or renders the roster.
 * ======================================================================== */
(function () {
  var THEO = (window.THEO = window.THEO || {});

  // --- registry -------------------------------------------------------------
  // role: base "door" (rep | owner | lead). admin: null | 'business' | 'it'
  // (an admin flag is ORTHOGONAL to the base role - a rep or a manager can also
  // be an admin; business and IT admins get the same view + the same powers).
  // load: a coarse current active-work load (the backend team-load engine does
  // the full 6-signal version; this seed drives the capacity tie-break here).
  THEO.PEOPLE = [
    { gid: 'WD-100237', name: 'Marc Lane',  email: 'lane_marc@lilly.com',  av: 'ML', role: 'rep',   admin: null,       supervisor: 'WD-100200', load: 7 },
    { gid: 'WD-100241', name: 'Aisha Khan', email: 'khan_aisha@lilly.com', av: 'AK', role: 'rep',   admin: null,       supervisor: 'WD-100200', load: 4 },
    { gid: 'WD-100245', name: 'Dan Reed',   email: 'reed_dan@lilly.com',   av: 'DR', role: 'rep',   admin: null,       supervisor: 'WD-100200', load: 3 },
    { gid: 'WD-100061', name: 'Sam Okafor', email: 'okafor_sam@lilly.com', av: 'SO', role: 'rep',   admin: 'it',       supervisor: 'WD-100200', load: 5 }, // a rep who is ALSO an IT admin
    { gid: 'WD-100200', name: 'Lee Davis',  email: 'davis_lee@lilly.com',  av: 'LD', role: 'lead',  admin: 'business', supervisor: 'WD-100050', load: 0 }, // team lead + business admin
    { gid: 'WD-100212', name: 'Priya Shah', email: 'shah_priya@lilly.com', av: 'PS', role: 'owner', admin: null,       supervisor: 'WD-100070', load: 0 }, // business owner (stakeholder)
    { gid: 'WD-100301', name: 'Nina Okonkwo', email: 'okonkwo_nina@lilly.com', av: 'NO', role: 'owner', admin: null,   supervisor: 'WD-100070', load: 0, org: 'Commercial IT' },
    { gid: 'WD-100302', name: 'Raj Mehta',    email: 'mehta_raj@lilly.com',    av: 'RM', role: 'owner', admin: null,   supervisor: 'WD-100070', load: 0, org: 'R&D IT' },
    { gid: 'WD-100303', name: 'Karen Liu',    email: 'liu_karen@lilly.com',    av: 'KL', role: 'owner', admin: 'business', supervisor: 'WD-100070', load: 0, org: 'Infrastructure' }, // a business owner who is also an admin
    { gid: 'WD-100304', name: 'Tom Becker',   email: 'becker_tom@lilly.com',   av: 'TB', role: 'owner', admin: null,   supervisor: 'WD-100070', load: 0, org: 'End-user computing' }
  ];

  // --- ownership coverage map (the "who owns what", maintained by an admin) --
  // Per rep gid: explicitly owned suppliers, owned commodity / NSCMP codes, and
  // aligned internal orgs / reporting lines. This is the single source of truth
  // the intake triage READS. Catch-all codes are listed separately so they
  // infer best-fit instead of dumping on a bucket owner.
  THEO.COVERAGE = {
    'WD-100237': { suppliers: ['Veeva', 'Veeva Systems', 'ServiceNow', 'Acme Analytics', 'Acme AI'], commodities: ['IT-SAAS-CRM', 'IT-ITSM', 'IT-SAAS-ANALYTICS'], orgs: ['Commercial IT', 'Field Operations'] },
    'WD-100241': { suppliers: ['Tata Consultancy', 'Tata', 'Infosys', 'Figma'],                       commodities: ['IT-SVC-PAYROLL', 'IT-SVC-INTEG', 'IT-SAAS-DESIGN'], orgs: ['Clinical IT', 'R&D IT'] },
    'WD-100245': { suppliers: ['Globex Systems', 'Globex', 'Dell Technologies', 'Helios'],            commodities: ['IT-DATA-PLATFORM', 'IT-HW-INFRA', 'IT-ITSM-SAAS'],  orgs: ['Infrastructure', 'Data Platform'] },
    'WD-100061': { suppliers: ['Sentry', 'CrowdStrike'],                                              commodities: ['IT-SEC-TOOLING'],                                  orgs: ['Security', 'Cyber'] }
  };
  // Catch-all / generic codes: never auto-assign their nominal owner; infer instead.
  THEO.CATCHALL_COMMODITIES = ['IT-MISC-9999', 'IT-OTHER', 'IT-GEN', 'UNCODED'];

  // --- delegations (OOO + permanent). gid -> redirect for a window or forever.
  // scope: 'all' or an array of project ids. permanent: true means no window.
  THEO.DELEGATIONS = [
    // demo: Dan Reed is out this week, delegating everything to Aisha.
    { gid: 'WD-100245', delegateGid: 'WD-100241', fromISO: '2026-06-24', toISO: '2026-06-30', scope: 'all', permanent: false, note: 'PTO' }
  ];

  var TODAY = '2026-06-26';

  // --- lookups --------------------------------------------------------------
  THEO.person = function (gid) { for (var i = 0; i < THEO.PEOPLE.length; i++) if (THEO.PEOPLE[i].gid === gid) return THEO.PEOPLE[i]; return null; };
  THEO.byName = function (name) {
    if (!name) return null;
    var n = ('' + name).trim().toLowerCase();
    var P = THEO.PEOPLE, i;
    for (i = 0; i < P.length; i++) if (P[i].name.toLowerCase() === n) return P[i];          // exact full name
    for (i = 0; i < P.length; i++) if (P[i].name.toLowerCase().split(' ')[0] === n) return P[i]; // first name
    for (i = 0; i < P.length; i++) if (P[i].name.toLowerCase().indexOf(n) === 0) return P[i];  // starts-with
    return null;
  };
  THEO.reps = function () { return THEO.PEOPLE.filter(function (p) { return p.role === 'rep'; }); };
  THEO.isAdmin = function (gid) { var p = THEO.person(gid); return !!(p && p.admin); };
  THEO.supervisorOf = function (gid) { var p = THEO.person(gid); return p ? THEO.person(p.supervisor) : null; };
  THEO.repsManagedBy = function (gid) { return THEO.PEOPLE.filter(function (p) { return p.supervisor === gid && p.role === 'rep'; }); };
  THEO.displayName = function (gid) { var p = THEO.person(gid); return p ? p.name : gid; };

  // --- OOO / delegation -----------------------------------------------------
  THEO.delegationFor = function (gid, nowISO) {
    nowISO = nowISO || TODAY;
    for (var i = 0; i < THEO.DELEGATIONS.length; i++) {
      var d = THEO.DELEGATIONS[i];
      if (d.gid !== gid) continue;
      if (d.permanent) return d;
      if (d.fromISO <= nowISO && nowISO <= d.toISO) return d;
    }
    return null;
  };
  // Who work for `gid` should route to right now (delegate if delegated, else self).
  // REFLECT: informs routing; never moves work on its own.
  THEO.resolveAssignee = function (gid, nowISO) {
    var d = THEO.delegationFor(gid, nowISO);
    return d ? d.delegateGid : gid;
  };

  // --- capacity (coarse load tie-break; full model is team-load.service.ts) -
  THEO.loadOf = function (gid) { var p = THEO.person(gid); return p ? (p.load || 0) : 0; };

  // --- intake triage: suggest the owning rep ---------------------------------
  // project: { supplier, commodity, reqOrg, valueTCO, type, stage }
  // Returns: { gid, name, via, confidence, reason, ooo, delegateGid, forLeadTriage, candidates[] }
  // Precedence (first strong signal wins; the rest corroborate / tie-break):
  //   1. SUPPLIER ownership  -> overrides commodity (explicit ownership claim).
  //   2. COMMODITY / NSCMP   -> when it's a specific (non catch-all) owned code.
  //   3. CATCH-ALL / no match -> INFER from reqOrg + history (do not assign the bucket).
  //   4. CAPACITY            -> tie-break among equally-good candidates (lowest load).
  //   5. OOO                 -> route to the delegate, but keep the true owner visible.
  THEO.suggestRep = function (project, opts) {
    project = project || {};
    opts = opts || {};
    var sup = (project.supplier || '').trim();
    var commodity = (project.commodity || '').trim();
    var org = (project.reqOrg || '').trim();
    var repGids = THEO.reps().map(function (p) { return p.gid; });
    var lc = function (s) { return (s || '').toLowerCase(); };
    var inList = function (arr, v) { for (var i = 0; i < (arr || []).length; i++) if (lc(arr[i]) === lc(v)) return true; return false; };

    var pick = function (gid, via, confidence, reason) {
      var owner = gid;
      var del = THEO.delegationFor(gid);
      return {
        gid: owner, name: THEO.displayName(owner),
        via: via, confidence: confidence, reason: reason,
        ooo: !!del, delegateGid: del ? del.delegateGid : null,
        forLeadTriage: confidence === 'Low'
      };
    };
    var lowestLoad = function (gids) {
      return gids.slice().sort(function (a, b) { return THEO.loadOf(a) - THEO.loadOf(b) || a.localeCompare(b); })[0];
    };

    // 1. supplier ownership override
    if (sup) {
      var supOwners = repGids.filter(function (g) { return THEO.COVERAGE[g] && inList(THEO.COVERAGE[g].suppliers, sup); });
      if (supOwners.length) {
        var g1 = supOwners.length === 1 ? supOwners[0] : lowestLoad(supOwners);
        return pick(g1, 'supplier', 'High', 'Owns ' + sup + ' (supplier ownership overrides commodity)');
      }
    }
    // 2. specific commodity / NSCMP code
    var isCatchall = commodity && inList(THEO.CATCHALL_COMMODITIES, commodity);
    if (commodity && !isCatchall) {
      var comOwners = repGids.filter(function (g) { return THEO.COVERAGE[g] && inList(THEO.COVERAGE[g].commodities, commodity); });
      if (comOwners.length) {
        var g2 = comOwners.length === 1 ? comOwners[0] : lowestLoad(comOwners);
        return pick(g2, 'commodity', 'High', 'Owns commodity ' + commodity);
      }
    }
    // 3. catch-all / no direct match -> infer from org + history (existing assignments)
    var orgOwners = org ? repGids.filter(function (g) { return THEO.COVERAGE[g] && inList(THEO.COVERAGE[g].orgs, org); }) : [];
    var hist = opts.history || {}; // { 'supplier|org' : gid } learned from prior projects + corrections
    var histGid = hist[lc(sup)] || hist[lc(org)] || null;
    var inferred = [];
    if (histGid && repGids.indexOf(histGid) >= 0) inferred.push(histGid);
    inferred = inferred.concat(orgOwners.filter(function (g) { return inferred.indexOf(g) < 0; }));
    if (inferred.length) {
      var g3 = inferred.length === 1 ? inferred[0] : lowestLoad(inferred);
      var why = isCatchall ? ('Catch-all code ' + commodity + '; inferred') : 'No direct supplier/commodity owner; inferred';
      why += histGid && histGid === g3 ? ' from history' : (org ? ' from reporting line / org ' + org : '');
      return pick(g3, 'inferred', 'Medium', why);
    }
    // 4./5. no ownership signal -> suggest by capacity, flag for lead triage
    var g4 = lowestLoad(repGids);
    return pick(g4, 'capacity', 'Low', 'No ownership signal yet; suggested by lowest current load - recommend lead triage');
  };

  // Build a history map from a list of prior projects ({supplier, reqOrg, repName|repGid}).
  // Used to disambiguate catch-alls and to LEARN from past assignments/corrections.
  THEO.historyFrom = function (projects) {
    var h = {};
    (projects || []).forEach(function (p) {
      var gid = p.repGid || (p.rep ? (THEO.byName(p.rep) || {}).gid : null);
      if (!gid) return;
      if (p.supplier) h[(p.supplier + '').toLowerCase()] = gid;
      if (p.reqOrg) h[(p.reqOrg + '').toLowerCase()] = gid;
    });
    return h;
  };

  // --- delegation lifecycle: PROPOSAL -> one approval -> active --------------
  // A delegation a user creates is a PROPOSAL. It notifies the owner's supervisor
  // AND the delegatee; EITHER ONE (not both) approving makes it active. Reflect:
  // nothing routes to the delegate until it is approved.
  var _delSeq = 1;
  THEO.PENDING_DELEGATIONS = [];

  // Permission gate for delegating/reassigning ownerGid's work:
  //   own work always; admins anyone; a supervisor may act on their own reps.
  THEO.canDelegate = function (actorGid, ownerGid) {
    if (actorGid === ownerGid) return true;
    if (THEO.isAdmin(actorGid)) return true;
    var owner = THEO.person(ownerGid);
    return !!(owner && owner.supervisor === actorGid && owner.role === 'rep');
  };

  // Create a PROPOSED delegation; approvers = [supervisor, delegatee]. Returns the
  // record so the caller can draft the two notices. permanent:true => no window.
  THEO.createDelegation = function (d) {
    var owner = THEO.person(d.gid);
    var supGid = owner ? owner.supervisor : null;
    var rec = {
      id: 'DLG-' + (_delSeq++), gid: d.gid, delegateGid: d.delegateGid,
      scope: d.scope || 'all', fromISO: d.fromISO || null, toISO: d.toISO || null,
      permanent: !!d.permanent, note: d.note || '', source: d.source || 'self',
      status: 'pending', approvers: [supGid, d.delegateGid].filter(Boolean)
    };
    THEO.PENDING_DELEGATIONS.push(rec);
    return rec;
  };
  // Either the supervisor OR the delegatee can approve (one is enough).
  THEO.approveDelegation = function (id, byGid) {
    for (var i = 0; i < THEO.PENDING_DELEGATIONS.length; i++) {
      var r = THEO.PENDING_DELEGATIONS[i];
      if (r.id !== id) continue;
      if (r.approvers.indexOf(byGid) < 0) return null;   // only supervisor or delegatee may approve
      r.status = 'active';
      THEO.PENDING_DELEGATIONS.splice(i, 1);
      THEO.DELEGATIONS.push(r);                            // now effective for routing
      return r;
    }
    return null;
  };
  THEO.rejectDelegation = function (id, byGid) {
    for (var i = 0; i < THEO.PENDING_DELEGATIONS.length; i++) {
      var r = THEO.PENDING_DELEGATIONS[i];
      if (r.id === id && r.approvers.indexOf(byGid) >= 0) { r.status = 'rejected'; THEO.PENDING_DELEGATIONS.splice(i, 1); return r; }
    }
    return null;
  };
  // Delegations awaiting THIS person's approval (they are a supervisor or the delegatee).
  THEO.pendingFor = function (gid) { return THEO.PENDING_DELEGATIONS.filter(function (r) { return r.approvers.indexOf(gid) >= 0; }); };

  // --- supervisor workload rebalance (reflect-only; OVERRIDES individual delegations) ---
  // Scoped to the reps a supervisor manages; suggests shifting load from the most-
  // to the least-loaded rep. Full 6-signal model is backend team-load.service.ts.
  THEO.suggestRebalance = function (supervisorGid) {
    var team = THEO.repsManagedBy(supervisorGid).slice().sort(function (a, b) { return b.load - a.load; });
    if (team.length < 2) return { moves: [], note: 'Not enough reps to rebalance.' };
    var hi = team[0], lo = team[team.length - 1];
    if (hi.load - lo.load < 2) return { moves: [], note: 'Team load is already balanced.' };
    return {
      moves: [{ fromGid: hi.gid, toGid: lo.gid, fromLoad: hi.load, toLoad: lo.load,
        label: 'Shift 1-2 projects from ' + hi.name.split(' ')[0] + ' (load ' + hi.load + ') to ' + lo.name.split(' ')[0] + ' (load ' + lo.load + ')' }],
      note: 'A supervisor rebalance overrides individual delegations for the moved work.'
    };
  };
})();
