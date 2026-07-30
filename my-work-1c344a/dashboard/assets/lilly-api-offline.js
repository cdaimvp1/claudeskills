/* ==========================================================================
 * lilly-api-offline.js -- the offline stand-in for the platform's api.js.
 *
 * WHY THIS FILE EXISTS, AND WHY IT IS NOT A VENDORED COPY
 * ------------------------------------------------------
 * Every other asset in this dashboard is vendored byte-identical from the
 * platform so drift is detectable. This one is deliberately NOT, and the
 * reason matters: the platform's api.js is 75KB and contains a live
 * `fetch(base() + path)`. A skill installs as a single folder and runs from
 * the local filesystem. Shipping a network client inside it would put an
 * egress path into a procurement skill that can never succeed and can only
 * mislead.
 *
 * The my-work module chain touches exactly six LillyAPI methods:
 *   tryLive, listProjects, tasks, workload, badge, esc
 * They are reimplemented here against the vendored seed. Nothing else from
 * api.js is reachable from this page, so nothing else is provided. If a
 * future module reaches for a seventh method it will fail loudly at the call
 * site rather than silently returning undefined, which is the correct
 * direction: a missing method is a build error, not a blank panel.
 *
 * THE DEGRADATION IS THE PLATFORM'S OWN, NOT A BOLT-ON
 * ---------------------------------------------------
 * api.js's real tryLive already returns `{data: mock, source:'demo'}` when
 * there is no configured HTTP origin. Opening this file locally hits exactly
 * that branch in the real platform too. So this shim is not inventing a
 * degraded mode; it is pinning the page to the branch the platform already
 * takes offline, and `badge()` still renders the honest "Demo data" label.
 * The live/demo distinction stays visible to the reader rather than being
 * quietly dropped.
 * ========================================================================== */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Always the demo branch, and always LABELLED as such. Returning
   * source:'demo' rather than faking 'live' is the whole point: a reader must
   * be able to tell a seeded figure from a fetched one. */
  function tryLive(fn, mock) {
    return Promise.resolve({ data: mock, source: 'demo' });
  }

  /* The three data readers resolve to null so the my-work modules take their
   * own seeded fallback path, which is what they already do offline. They are
   * present because tryLive is called WITH them as the live function; they are
   * never actually invoked on this path. Defining them as explicit rejections
   * rather than omitting them keeps `LillyAPI.tasks` from being undefined at
   * the call site. */
  function offline(name) {
    return function () {
      return Promise.reject(new Error(
        'LillyAPI.' + name + ' is unavailable offline; this dashboard renders '
        + 'from its vendored seed and labels the result as demo data.'));
    };
  }

  /* Byte-for-byte the platform's badge, including the locked accent: Live uses
   * Bold Blue #0F3A85, never green. Kept identical so the one visual element
   * that reports data provenance cannot drift from the platform's. */
  function badge(elId, source) {
    var el = document.getElementById(elId);
    if (!el) return;
    var live = source === 'live';
    el.innerHTML =
      '<span style="display:inline-flex;align-items:center;gap:6px;font-family:var(--mono,monospace);font-size:10px;font-weight:600;'
      + 'padding:2px 9px;border-radius:30px;'
      + (live
        ? 'background:rgba(15,58,133,.10);color:#0F3A85'
        : 'background:#F2EEEE;color:var(--mut2,#6b6b6b)')
      + '"><span style="width:6px;height:6px;border-radius:50%;background:currentColor"></span>'
      + (live ? 'Live · platform API' : 'Demo data')
      + '</span>';
  }

  window.LillyAPI = window.LillyAPI || {};
  window.LillyAPI.tryLive = tryLive;
  window.LillyAPI.esc = esc;
  window.LillyAPI.badge = badge;
  window.LillyAPI.listProjects = offline('listProjects');
  window.LillyAPI.tasks = offline('tasks');
  window.LillyAPI.workload = offline('workload');

  /* Declared so the build can assert the shim's surface matches what the
   * my-work chain actually calls. The selftest reads this list out of the
   * file and diffs it against a grep of the modules, so adding a method here
   * without a caller, or calling one that is not here, fails the build. */
  window.LillyAPI.__offlineSurface = [
    'tryLive', 'esc', 'badge', 'listProjects', 'tasks', 'workload'];
})();
