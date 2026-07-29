/* ============================================================================
 * pv-04-domain-data.js, per-project DOMAIN business data (Negprep / Contract /
 * Terms / Obligations / Renewal / RFx scoring / golden-thread).
 *
 * P4 / #112 data-layer migration: these literals were relocated to the seed layer
 * (assets/seed/project-view.js → window.__SEED__.projectView.domain) and are read
 * back here through Theo.data.projectViewSeed(). That accessor returns a FRESH,
 * DEEP, $src-STRIPPED, MUTABLE clone, read ONCE at module-init, exactly mirroring
 * the old module-top consts, so the page keeps mutating the working copy (the RFx
 * scoring grid edits RFX.panel/criteria/finalLocked in place) while the seed stays
 * pristine. Stripping $src makes the clone byte-identical to the old literals, so
 * every render and interaction is unchanged; provenance lives in the seed only.
 *
 * Config/labels/logic stay in the pv modules (LOCKED compose-by-traits). The one
 * non-data member of this module, threadBar(), is unchanged. --seed=none / absent
 * seed degrades to safe-shaped empties so the page load does not throw.
 * ==========================================================================*/
var _PV04 = (typeof Theo !== 'undefined' && Theo.data && Theo.data.projectViewSeed) ? Theo.data.projectViewSeed() : null;
var _PVDOM = (_PV04 && typeof Theo !== 'undefined' && !Theo.isDNA(_PV04) && _PV04.domain) ? _PV04.domain : {};

// ---- Negotiation prep (target / walk-away / ZOPA · leverage · issue agenda) ----
const NEGPREP = _PVDOM.negprep || { agenda: [], talking: [], redlines: [] };
// ---- Contract review (Protection Score + gaps + redlines) ----
const CONTRACT = _PVDOM.contract || { gaps: [] };
// ---- 14-category governing-PROTECTION scan (Deal / Review). Each protection
// category carries a status trichotomy (Covered / Confirm / Gap) + a governing-doc
// citation. NO GREEN: Covered = Bold Blue, Confirm = Amber, Gap = Red. ----
const DEAL_CATEGORIES = _PVDOM.dealCategories || [];
// definition traces completed during the read (governing-agreement provenance panel)
const DEAL_DEFTRACES = _PVDOM.dealDeftraces || [];
// ---- RFx scoring matrix (sourcing projects only), editable grid. Weighted CATEGORY
// criteria + a per-REQUIREMENT model + an independent evaluator panel; the grid MUTATES
// this record (panel scores, criteria add/remove, finalLocked), the mutable clone above
// keeps those edits off the seed. ----
const RFX = _PVDOM.rfx || { criteria: [], requirements: [], suppliers: [], panel: [], qa: [] };
// ===== contract-lifecycle GOLDEN THREAD (effective terms → findings → obligations → renewal → savings) =====
const THREAD = _PVDOM.thread || [];
// The golden-thread chip row duplicated the tabs, so it's suppressed (returns nothing).
function threadBar(active) { return ''; }
// which contract findings flow downstream to which node (drawn on the Contract review tab)
const GAP_THREAD = _PVDOM.gapThread || {};
// effective terms reconciled across the amendment chain (change-order governance)
const TERMS = _PVDOM.terms || { amendments: [], effective: [], conflicts: [] };
// time-bound obligations extracted from the effective terms (register + 30/60/90/120-day alerts)
const OBLIGATIONS = _PVDOM.obligations || [];
// renewal dossier + recommendation (decision-intelligence matrix is COMPUTED from these inputs at render)
const RENEWAL = _PVDOM.renewal || { levers: [], matrix: { performance: { dims: [] }, market: { dims: [] } } };
