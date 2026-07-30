/* ===========================================================================
 * demo-data.js, THIN SHIM (build plan P2).
 *
 * The canonical golden-thread demo dataset moved into the seed layer
 * (assets/seed/demo.js -> window.__SEED__.demo) and is read through the
 * Theo.data.*Seed() facade (assets/theo-data.js). There is NO hardcoded data
 * here anymore.
 *
 * This shim rebuilds the legacy window.DEMO surface FROM that one seed, purely
 * so a couple of non-migrated consumers keep working without change, notably
 * assets/tasks-drawer.js, which calls window.DEMO.dueWithin(...) for the standing
 * renewals/obligations monitor. The six migrated pages (my-work, projects,
 * savings, settings, suppliers-spend, team-workload) read Theo.data.* directly
 * and no longer touch window.DEMO.
 *
 * LOAD ORDER: after assets/seed/_util.js + assets/seed/demo.js + assets/theo-data.js
 * (this shim delegates to Theo.data / __SEED__.demo). The arrays are LIVE
 * references into __SEED__.demo so the live-mode supplier swap stays consistent.
 * ======================================================================== */
(function () {
  if (window.DEMO) return;
  var T = window.Theo && window.Theo.data;
  var seed = (window.__SEED__ && window.__SEED__.demo) || {};
  var DEMO = (window.DEMO = {});

  // live references into the one seed (not copies)
  DEMO.TODAY = seed.TODAY || '2026-06-26';
  DEMO.suppliers = seed.suppliers || [];
  DEMO.contracts = seed.contracts || [];
  DEMO.obligations = seed.obligations || [];
  DEMO.projects = seed.projects || [];
  DEMO.savings = seed.savings || [];
  DEMO.scale = seed.scale || { org: { suppliers: 0, reps: 0, activeContracts: 0, spendByCategory: [] }, byRep: {} };

  // accessors delegate to the Theo.data facade (which reads __SEED__.demo).
  // Guarded so the shim is harmless if the facade is somehow absent.
  function dele(name, fallback) {
    return function () {
      if (T && typeof T[name] === 'function') return T[name].apply(T, arguments);
      return fallback;
    };
  }
  DEMO.supplier = dele('supplier', null);
  DEMO.supplierByName = dele('supplierByName', null);
  DEMO.project = dele('project', null);
  DEMO.contract = dele('contract', null);
  DEMO.projectsByRep = dele('projectsByRep', []);
  DEMO.projectsByOwner = dele('projectsByOwner', []);
  DEMO.suppliersByRep = dele('suppliersByRep', []);
  DEMO.savingsByRep = dele('savingsByRep', []);
  DEMO.contractsForSupplier = dele('contractsForSupplier', []);
  DEMO.obligationsForContract = dele('obligationsForContract', []);
  DEMO.orgSpendK = dele('orgSpendK', 0);
  DEMO.repScale = dele('repScale', { suppliers: 70, managedSpendK: 120000, activeContracts: 110 });
  DEMO.daysOut = dele('daysOut', 0);
  DEMO.dueWithin = dele('dueWithin', []);
  DEMO.activeSpendK = function () {
    if (T && typeof T.activeSpendK === 'function') { var v = T.activeSpendK(); return (window.Theo && window.Theo.isDNA(v)) ? 0 : v; }
    return 0;
  };
})();
