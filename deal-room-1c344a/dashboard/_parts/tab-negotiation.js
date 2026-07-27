/* =============================================================================
 * tab-negotiation.js, "Negotiation" primary tab (id `negotiation`) of the
 * redesigned 4-tab Lilly Deal Dashboard.  Question: "how do I move them?"
 *
 * Attaches window.renderTab_negotiation(d) and window.DealTabs.negotiation(d).
 * Reads ONLY from dashboardData (param d). No fact is restated/hard-coded, every
 * value is looked up from d.issues / d.negotiation / d.comms / d.protection etc.
 * The SAME issue objects that drive Terms & Review and Economics drive the
 * positions, trades and comms events here; they are referenced by id, never
 * re-typed (anti-drift). Reflect-only: copy / print / jump affordances ONLY —
 * no send / assign / approve / route.
 *
 * Subtabs (group="negotiation"):
 *   positions  ->  data-subpanel="negotiation/positions"   (4A)
 *   trade      ->  data-subpanel="negotiation/trade"        (4B)
 *   comms      ->  data-subpanel="negotiation/comms"        (4C, replaces Meeting Brief)
 * ========================================================================== */
(function (global) {
'use strict';

const PR_RANK = { 'hard-stop': 0, high: 1, medium: 2, low: 3 };
const STRENGTH_RANK = { Strong: 0, Moderate: 1, Weak: 2 };
const MAG_LEVEL = { low: 1.4, medium: 3, high: 4.6 };
const SEV_LABEL_LOCAL = { 'hard-stop': 'Hard stop', high: 'High', medium: 'Medium', low: 'Low' };

function magPill(level) {
  const cls = level === 'high' ? 'warn' : level === 'medium' ? 'info' : 'muted';
  return '<span class="pill ' + cls + '">' + esc(level) + '</span>';
}

// 2-way collaborative<->direct wording pair (CSS-only toggle owns the visibility).
function wordingPair(text) {
  return '<span class="word-collab clamp2">We would like to move toward: ' + esc(text) + '</span>' +
         '<span class="word-direct clamp2">We require: ' + esc(text) + '</span>';
}

function hardStopCell(row) {
  if (/^none/i.test(row.hardStop || '')) {
    return '<span class="muted tiny">No walk-away line drawn</span>';
  }
  return '<span class="hs-line">' + icon('flag') + '<span>' + esc(row.hardStop) + '</span></span>';
}

// vendor-tactic flag folded onto the issue spine (replaces the old 12-cat grid).
function tacticChip(r) {
  const tf = r.tacticFlag;
  if (!tf || !tf.present) return '';
  return '<span class="tac-chip" title="' + esc(tf.triggeringText || '') + '">' + icon('flag') +
    'Tactic: ' + esc(tf.tactic) + '</span> ' + evidenceChip(tf.evidenceType || 'inference', { short: true });
}

// a signed delta chip (savings / protection lift). positive protection = good (ok);
// negative TCO = savings (ok). zero = neutral muted.
function deltaChip(delta, kind) {
  if (delta === 0 || delta == null) return '<span class="pill muted">no change</span>';
  if (kind === 'tco') {
    const cls = delta < 0 ? 'ok' : 'danger';
    const sign = delta < 0 ? '−' : '+';
    return '<span class="pill ' + cls + '">' + sign + money(Math.abs(delta), { compact: true }) + '</span>';
  }
  const cls = delta > 0 ? 'ok' : 'danger';
  return '<span class="pill ' + cls + '">' + (delta > 0 ? '+' : '−') + Math.abs(delta) + ' pts</span>';
}

function renderTab_negotiation(d) {
  const neg = d.negotiation || {};
  const comms = d.comms || {};
  const issueById = (id) => d.issues.find((i) => i.id === id);
  const docById = (id) => (d.documents || []).find((x) => x.id === id);
  const pkgById = (id) => (neg.packages || []).find((p) => p.id === id);
  const scenById = (id) => (d.scenarios || []).find((s) => s.id === id);

  // cross-reference chip, points back at the SAME issue object that drives Terms.
  function issueTag(id) {
    const iss = issueById(id);
    const t = iss ? iss.title : id;
    return '<span class="pill info neg-tag" data-jump="tab:contract/sub:legal" title="' +
      esc(id + ', ' + t + ' (jump to Terms & Review register)') + '">' + esc(id) + '</span>';
  }
  // source-reference chip, jumps to Sources; every comms row is cited to one.
  function srcChip(ref) {
    if (!ref) return '';
    return '<span class="pill muted src-chip" data-jump="tab:sources/sub:sources" title="' +
      esc(ref + ', jump to Sources') + '">' + esc(ref) + '</span>';
  }

  /* ============================== 4A, POSITIONS =========================== *
   * Per-term workbench (locked MOCKUP-negotiation-positions.html): an orienting
   * posture header (signature gates Now->Need + protection trajectory 58->97 +
   * difficulty + severity distribution) over a master-detail of the 12 terms.
   * Selection reuses the tested delegated data-scpick handler (helpers.js) - all
   * detail panels render up front, only the selected shows; NO new JS, reflect-only.
   * Every value is looked up from d.issues / d.negotiation / d.protection / d.comms;
   * the stance toggle + live severity filter from the mockup are intentionally left
   * out (reflect-only / not-a-live-dashboard). Content is not re-typed. */
  function buildPositions() {
    const tp = neg.tradePlan || {};
    const prot = d.protection || {};
    const gates = tp.signatureGates || [];
    const pkgs = neg.packages || [];

    // posture 1: signature gates (Now -> Need)
    const gateHtml = gates.map((g) => {
      const iss = issueById(g.id);
      return '<div class="ps-gate"><div class="ps-gate-top">' + severityPill(iss ? iss.priority : 'high') +
        '<span class="ps-gate-t">' + esc(g.label) + '</span>' +
        '<span class="ps-gate-id">' + esc(g.id) + (iss ? ' · ' + esc(iss.clause) : '') + '</span></div>' +
        '<div class="ps-gate-status"><span class="ps-g-now"><b>Now</b>' + esc(g.now) + '</span>' +
        '<span class="ps-g-need"><b>Need</b>' + esc(g.need) + '</span></div></div>';
    }).join('');
    const gatesCard = '<div class="ps-pcard"><div class="ps-pc-h">Signature gates &middot; must clear before signing</div>' +
      '<div class="ps-gates">' + gateHtml + '</div></div>';

    // posture 2: protection trajectory + package chips + difficulty + distribution
    const protNow = prot.score != null ? prot.score : null;
    const protTgt = tp.scoreboard ? tp.scoreboard.protTarget : null;
    const pkgChips = pkgs.map((p) => {
      const dp = p.deltas ? p.deltas.protection : null;
      return '<span class="ps-pk-chip">' + esc(p.name.replace(' package', '')) + ' <b>+' + (dp != null ? dp : '?') + '</b></span>';
    }).join('');
    const counts = { 'hard-stop': 0, high: 0, medium: 0, low: 0 };
    d.issues.forEach((i) => { if (counts[i.priority] != null) counts[i.priority]++; });
    const diffScore = counts['hard-stop'] * 3 + counts.high;
    const diffLabel = diffScore >= 8 ? 'High' : diffScore >= 4 ? 'Moderate' : 'Low';
    const dist = ['hard-stop', 'high', 'medium', 'low'].map((k) =>
      '<span class="ps-dist-i">' + sevIcon(k) + '<b>' + counts[k] + '</b> ' + (k === 'hard-stop' ? 'hard stop' : k === 'medium' ? 'med' : k) + '</span>').join('');
    const trajPct = protNow != null ? Math.max(0, Math.min(100, protNow)) : 0;
    const trajCard = '<div class="ps-pcard"><div class="ps-pc-h">Playbook Alignment score &middot; where we can get to</div>' +
      '<div class="ps-traj-top"><span class="ps-traj-now">' + (protNow != null ? protNow : '&mdash;') + '</span>' +
      '<span class="ps-traj-lbl">' + esc(prot.band || 'Weak') + ', on the<br>current redline</span>' +
      '<span class="ps-traj-arr">&rarr;</span><span class="ps-traj-goal">' + (protTgt != null ? protTgt : '&mdash;') + '</span>' +
      '<span class="ps-traj-lbl">Strong, if the<br>packages land</span></div>' +
      '<div class="ps-traj-bar"><div class="ps-traj-fill" style="width:' + trajPct + '%"></div></div>' +
      '<div class="ps-traj-marks"><span>0</span><span>now ' + (protNow != null ? protNow : '&mdash;') + '</span>' +
      '<span>target ' + (protTgt != null ? protTgt : '&mdash;') + '</span><span>100</span></div>' +
      (pkgChips ? '<div class="ps-pk-legend">' + pkgChips + '</div>' : '') +
      '<div class="ps-diff-row"><span class="pill warn ps-diff-pill">Difficulty: ' + diffLabel + '</span>' +
      '<span class="ps-dist">' + dist + '</span></div></div>';

    const posture = '<div class="ps-posture">' + gatesCard + trajCard + '</div>';

    // master-detail (delegated data-scpick; all panels rendered, selected shown)
    const PR = { 'hard-stop': 0, high: 1, medium: 2, low: 3 };
    const rows = d.issues.slice().sort((a, b) => (PR[a.priority] - PR[b.priority]) || a.id.localeCompare(b.id));
    const pkgOf = (id) => pkgs.find((p) => (p.issueIds || []).indexOf(id) !== -1);

    const listHtml = rows.map((iss, i) => {
      const pkg = pkgOf(iss.id);
      return '<div class="ps-row' + (i === 0 ? ' sc-sel' : '') + '" role="button" tabindex="0" data-scpick="' + esc(iss.id) + '" title="Show detail">' +
        severityPill(iss.priority) +
        '<span class="ps-r-txt"><span class="ps-r-t">' + esc(iss.title) + '</span>' +
        '<span class="ps-r-c">' + esc(iss.id) + ' &middot; ' + esc(iss.category) + '</span></span>' +
        '<span class="ps-r-pkg">' + (pkg ? esc(pkg.name.replace(' package', '')) : '&mdash;') + '</span></div>';
    }).join('');

    function detailPanel(iss, i) {
      const rung = (cls, k, v) => '<div class="ps-rung ' + cls + '"><div class="ps-rk">' + k + '</div>' +
        '<div class="ps-rv">' + esc(v || '—') + '</div></div>';
      const movesWith = new Set();
      pkgs.forEach((p) => { if ((p.issueIds || []).indexOf(iss.id) !== -1) (p.issueIds || []).forEach((x) => { if (x !== iss.id) movesWith.add(x); }); });
      const deps = [];
      const pkg = pkgOf(iss.id);
      if (pkg) deps.push('<span class="ps-dep"><span class="ps-dk">bundle</span><b>' + esc(pkg.name) + '</b></span>');
      Array.from(movesWith).forEach((x) => { const xi = issueById(x); deps.push('<span class="ps-dep"><span class="ps-dk">moves with</span><b>' + esc(x) + '</b> ' + esc(xi ? xi.category : '') + '</span>'); });
      const evs = (comms.events || []).filter((e) => e.issueId === iss.id).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      const hist = evs.length
        ? '<div class="ps-hist">' + evs.map((e) => '<div class="ps-hev"><div class="ps-h-d">' + esc(e.date) + '</div>' +
            '<div class="ps-h-t"><span class="ps-h-who">' + esc(e.party || '') + '</span> ' + esc(e.text) + '</div></div>').join('') + '</div>'
        : '<div class="ps-ladder-note">No recorded movement on this term yet.</div>';
      const tacticHtml = (iss.tacticFlag && iss.tacticFlag.present)
        ? '<span class="ps-tactic">' + icon('flag') + ' tactic: ' + esc(iss.tacticFlag.tactic) + '</span>' : '';
      return '<div class="ps-detail" data-scpanel="' + esc(iss.id) + '"' + (i === 0 ? '' : ' hidden') + '>' +
        '<div class="ps-d-eyebrow"><span class="ps-d-id">' + esc(iss.id) + '</span>' + severityPill(iss.priority) +
        '<span class="ps-d-clause">' + esc(iss.category) + ' &middot; ' + esc(iss.clause) + '</span></div>' +
        '<div class="ps-d-title">' + esc(iss.title) + '</div>' +
        '<div class="ps-sec-h">Position ladder &middot; as-drafted &rarr; walk-away</div>' +
        '<div class="ps-ladder">' + rung('sup', 'As drafted', iss.supplierPosition) + rung('tgt', 'Target', iss.recommendedPosition) +
        rung('fb', 'Fallback', iss.fallback) + rung('walk', 'Walk-away', iss.hardStop) + '</div>' +
        '<div class="ps-ladder-note">Open at Target; drop only one rung at a time, and only for a matching give.</div>' +
        '<div class="ps-sec-h">Why it matters</div>' +
        '<dl class="ps-kv"><dt>Playbook</dt><dd>' + esc(iss.playbookPosition || '—') + '</dd><dt>Impact</dt><dd>' + esc(iss.impact || '—') + '</dd></dl>' +
        '<div class="ps-sec-h">The exchange</div>' +
        '<div class="ps-exch"><div class="ps-e ps-push"><div class="ps-e-k">Expected pushback</div><div class="ps-e-v">' + esc(iss.supplierPushback || '—') + '</div>' + tacticHtml + '</div>' +
        '<div class="ps-e ps-rebut"><div class="ps-e-k">Our rebuttal</div><div class="ps-e-v">' + esc(iss.recommendedResponse || '—') + '</div></div></div>' +
        (iss.tradeOpportunity ? '<div class="ps-trade"><b>Trade:</b> ' + esc(iss.tradeOpportunity) + '</div>' : '') +
        '<div class="ps-sec-h">Dependencies</div><div class="ps-deps">' + (deps.length ? deps.join('') : '<span class="ps-ladder-note">Standalone term.</span>') + '</div>' +
        '<div class="ps-sec-h">History &middot; this term across the redlines</div>' + hist + '</div>';
    }
    const md = '<div class="ps-md" data-scmaster><div class="ps-list">' + listHtml + '</div>' +
      '<div class="ps-detailwrap">' + rows.map(detailPanel).join('') + '</div></div>';

    return '<div class="grid"><div class="col-12">' +
      saCard('Positions · per-term workbench', posture + md,
        { accent: 'plum', icon: 'target', sub: rows.length + ' terms &middot; click one' }) +
      '</div></div>';
  }

  /* ===== 4B, TRADE PLAN (item-driven, per locked mockup) ===================
   * For every ask where we and the supplier are not aligned: what we want, what
   * we would trade to get it, and our floor, with how far apart we are and how
   * likely they move. CONTENT is looked up, never re-typed: want=recommendedPosition,
   * floor=fallback, trade=tradeOpportunity + matching giveGets, range=ladder ends,
   * currency=giveGets, scoreboard=protection.score + SC-ask/SC-target scenarios.
   * neg.tradePlan adds ONLY the read (gap / movement / status) + category grouping.
   * Static: reflects the CURRENT record; regenerated when asks are made / trades land. */
  function buildTradePlan() {
    const tp = neg.tradePlan || {};
    const read = tp.read || {};
    const sb = tp.scoreboard || {};
    const prot = d.protection || {};
    const askScen = scenById(sb.askScenarioId || 'SC-ask');
    const tgtScen = scenById(sb.targetScenarioId || 'SC-target');
    const protNow = prot.score != null ? prot.score : null;
    const protTgt = sb.protTarget != null ? sb.protTarget : null;
    const askT = askScen ? askScen.total : null;
    const tgtT = tgtScen ? tgtScen.total : null;
    const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v)));

    // --- scoreboard (two gauges; static current-state) -----------------------
    const protPct = protNow != null ? clampPct(protNow) : 0;
    const tcvPct = (askT && tgtT) ? clampPct((tgtT / askT) * 100) : 0;
    const scoreInner =
      '<div class="tp-score">' +
        '<div class="tp-gauge tp-prot">' +
          '<div class="tp-g-top"><span class="tp-g-lbl">Playbook Alignment score</span>' +
            '<span class="tp-g-now">' + (protNow != null ? protNow : '&mdash;') + '</span></div>' +
          '<div class="tp-g-bar"><div class="tp-g-fill" style="width:' + protPct + '%"></div>' +
            (protTgt != null ? '<div class="tp-g-tgt" style="left:' + clampPct(protTgt) + '%"></div>' : '') + '</div>' +
          '<div class="tp-g-marks"><span>0 &middot; Weak</span><span>now <b>' + (protNow != null ? protNow : '&mdash;') +
            '</b></span><span>target <b>' + (protTgt != null ? protTgt : '&mdash;') + '</b></span></div>' +
        '</div>' +
        '<div class="tp-gauge tp-tcv">' +
          '<div class="tp-g-top"><span class="tp-g-lbl">3-yr TCV</span>' +
            '<span class="tp-g-now">' + (askT != null ? money(askT, { compact: true }) : '&mdash;') + '</span></div>' +
          '<div class="tp-g-bar"><div class="tp-g-fill" style="width:100%"></div>' +
            (tcvPct ? '<div class="tp-g-tgt" style="left:' + tcvPct + '%"></div>' : '') + '</div>' +
          '<div class="tp-g-marks"><span>target <b>' + (tgtT != null ? money(tgtT, { compact: true }) : '&mdash;') +
            '</b></span><span>now <b>' + (askT != null ? money(askT, { compact: true }) : '&mdash;') + '</b> ask</span></div>' +
        '</div>' +
        '<div class="tp-score-note">Where the deal stands now: protection <b>' + (protNow != null ? protNow : '&mdash;') +
          '</b> (' + esc(prot.band || 'Weak') + ') at the <b>' + (askT != null ? money(askT, { compact: true }) : '&mdash;') +
          '</b> ask. Target once the asks below land: <b>' + (protTgt != null ? protTgt : '&mdash;') + ' / ' +
          (tgtT != null ? money(tgtT, { compact: true }) : '&mdash;') + '</b>. ' + evidenceChip('calculated', { short: true }) +
          ' It updates when the record is regenerated as asks are made and trades close.</div>' +
      '</div>';
    const scoreCard = saCard('Payoff · where the current asks land the deal', scoreInner,
      { accent: 'teal', icon: 'scenarios',
        sub: 'target ' + (protTgt != null ? protTgt : '—') + ' / ' + (tgtT != null ? money(tgtT, { compact: true }) : '—') });

    // --- BATNA strip (prominent, collapsible) --------------------------------
    const bat = neg.batna || {};
    const batnaBlock = bat.alternative
      ? '<details class="tp-batna"><summary class="tp-batna-hd">' + icon('flag') +
          '<span class="tp-bt-t">BATNA &middot; your floor</span>' +
          '<span class="tp-bt-s">' + (bat.hasRealAlternative ? 'Real alternative exists. ' : 'Soft floor. ') + esc(bat.costDelta) + '</span>' +
          '<span class="tp-bt-chev"></span></summary>' +
          '<div class="tp-batna-bd"><dl class="kv">' +
            '<dt>Alternative</dt><dd>' + esc(bat.alternative) + '</dd>' +
            '<dt>Costed delta</dt><dd>' + esc(bat.costDelta) + '</dd>' +
            '<dt>Trigger</dt><dd>' + esc(bat.trigger) + ' ' + evidenceChip(bat.evidenceType, { short: true }) + '</dd>' +
          '</dl></div></details>'
      : '';

    // --- currency table (from giveGets) --------------------------------------
    const curRows = (neg.giveGets || []).map((g) =>
      '<tr><td class="tp-cur-give">' + esc(g.give) + '</td>' +
        '<td>' + magPill(g.giveCost) + '</td>' +
        '<td class="tp-cur-for">' + esc(g.get) + ' ' + (g.issueIds || []).map(issueTag).join(' ') + '</td></tr>').join('');
    const curCard = saCard('What we can spend · our trading currency',
      '<table class="tp-cur"><thead><tr><th>What we would give</th><th style="width:88px">Cost to us</th>' +
        '<th>Best used to win</th></tr></thead><tbody>' + curRows + '</tbody></table>',
      { accent: 'plum', icon: 'handshake', sub: 'the concessions we would actually give' });

    // --- categorised accordion of asks (native single-open via name) ---------
    const GAP = { far: 'Far apart', moderate: 'Moderate gap', close: 'Close' };
    const GAPCLS = { far: 'tp-far', moderate: 'tp-mod', close: 'tp-close' };
    const MOVE = { likely: 'Likely to move', possible: 'Might move', resistant: 'Resistant' };
    const MOVECLS = { likely: 'tp-mlikely', possible: 'tp-mposs', resistant: 'tp-mres' };
    const STT = { awaiting: 'Awaiting them', discussion: 'In discussion', unraised: 'Not yet raised' };

    function ladderRange(issueId) {
      const cl = (neg.concessionLadders || []).find((c) => c.issueId === issueId);
      if (!cl || !cl.steps || cl.steps.length < 2) return '';
      return '<div class="tp-range"><span class="tp-range-lbl">Our settlement range</span>' +
        '<div class="tp-range-band"><span class="tp-r-e a">' + esc(cl.steps[0]) + '</span>' +
          '<span class="tp-r-line"></span><span class="tp-r-e b">' + esc(cl.steps[cl.steps.length - 1]) + '</span></div></div>';
    }

    function tradeItem(id) {
      const iss = issueById(id);
      if (!iss) return '';
      const r = read[id] || {};
      const gap = r.gap || 'moderate', move = r.move || 'possible', status = r.status || 'unraised';
      const ggForIssue = (neg.giveGets || []).filter((g) => (g.issueIds || []).indexOf(id) !== -1);
      const tradeCol =
        (iss.tradeOpportunity ? '<div class="tp-give"><span>' + esc(iss.tradeOpportunity) + '</span></div>' : '') +
        ggForIssue.map((g) => '<div class="tp-give"><span>' + esc(g.give) + '</span> ' + magPill(g.giveCost) + '</div>').join('');
      return '<details name="tp-acc" class="tp-item">' +
        '<summary class="tp-hd"><span class="tp-chev"></span><span class="tp-id">' + esc(id) + '</span>' +
          '<span class="tp-main"><span class="tp-t">' + esc(iss.title) + '</span>' +
            '<span class="tp-sig"><span class="tp-status stt-' + esc(status) + '">' + esc(STT[status] || status) + '</span>' +
              '<span class="tp-sg"><b>Gap</b><span class="' + GAPCLS[gap] + '">' + GAP[gap] + '</span></span>' +
              '<span class="tp-sg"><b>Movement</b><span class="' + MOVECLS[move] + '">' + MOVE[move] + '</span></span>' +
            '</span></span></summary>' +
        '<div class="tp-body"><div class="tp-cols">' +
          '<div class="tp-col want"><div class="tp-col-k">We want</div><div class="tp-col-v">' + esc(iss.recommendedPosition || '—') + '</div></div>' +
          '<div class="tp-col trade"><div class="tp-col-k">We can trade</div><div class="tp-col-v">' +
            (tradeCol || '<span class="tiny muted">No trade identified; press on the merits.</span>') + '</div></div>' +
          '<div class="tp-col floor"><div class="tp-col-k">If they will not move</div><div class="tp-col-v">' + esc(iss.fallback || iss.hardStop || '—') + '</div></div>' +
        '</div>' + ladderRange(id) + '</div></details>';
    }

    const catBlocks = (tp.categories || []).map((cat) => {
      const items = (cat.issueIds || []).map(tradeItem).filter(Boolean).join('');
      if (!items) return '';
      return '<div class="tp-cat"><div class="tp-cat-h"><span class="tp-c-name">' + esc(cat.name) +
        '</span><span class="tp-c-cnt">' + (cat.issueIds || []).length + ' open</span></div>' + items + '</div>';
    }).join('');
    const asksInner = catBlocks
      ? '<div class="tp-cats">' + catBlocks + '</div>'
      : '<div class="tiny muted">No open asks recorded.</div>';
    const asksCard = saCard('The asks · what we want & what we would trade', asksInner,
      { accent: 'emph', icon: 'trade', sub: 'by category &middot; one open at a time' });

    return '<div class="grid">' +
      '<div class="col-12">' + scoreCard + '</div>' +
      (batnaBlock ? '<div class="col-12">' + batnaBlock + '</div>' : '') +
      '<div class="col-12">' + curCard + '</div>' +
      '<div class="col-12">' + asksCard + '</div>' +
      '</div>';
  }

  /* ===== 4C, COMMUNICATIONS (item-driven alignment map, per locked mockup) ===
   * The evidence layer, organised by what we are negotiating: for every contested
   * redline/ask, where each side stands (the gap) mapped to the SPECIFIC messages
   * and quotes that got them there, how it evolved, and the next move. CONTENT is
   * looked up, never re-typed: gapUs=recommendedPosition, gapThem=supplierPosition,
   * cited messages=comms.events (by issueId + direction), the redline quote=
   * issue.sourceExcerpt, next move=recommendedResponse. Status + category come from
   * neg.tradePlan. Reflect-only: expand only, no send / route.
   * NOTE: interactive filters (status / category / search + expand-all) are not yet
   * wired (they need a delegated handler in DealUI); see the build tracker. */
  function buildComms() {
    const tp = neg.tradePlan || {};
    const readOf = (id) => (tp.read && tp.read[id]) || {};
    const catOf = (id) => {
      const c = (tp.categories || []).find((x) => (x.issueIds || []).indexOf(id) !== -1);
      return c ? c.name : ((issueById(id) || {}).category || '');
    };
    const events = comms.events || [];
    const evForIssue = (id) => events.filter((e) => e.issueId === id)
      .slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    if (!d.issues || !d.issues.length) {
      return gapCard('No contested items', 'No issues are available to map communications against.');
    }

    const STT = { awaiting: 'Awaiting them', discussion: 'In discussion', unraised: 'Not yet raised', agreed: 'Agreed' };
    const CH = {
      email: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3 6l9 7 9-7" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
      teams: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h9v3H9v8H7V8H4V5z"/></svg>',
      paper: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l3 3v17H6z"/></svg>'
    };
    const chan = (c) => c ? '<span class="co-chan co-' + esc(c) + '">' + (CH[c] || '') + '</span>' : '';

    function cite(ev, quote) {
      const party = ev.party || (ev.direction === 'in' ? 'Supplier' : 'Lilly');
      return '<div class="co-cite"><div class="co-cite-m">' + chan(ev.channel) +
        '<span class="co-cite-party">' + esc(party) + '</span>' +
        (ev.date ? '<span class="co-cite-d">' + esc(ev.date) + '</span>' : '') + '</div>' +
        '<div class="co-cite-x' + (quote ? ' co-quote' : '') + '">' + esc(ev.text) + '</div></div>';
    }

    function itemRow(iss) {
      const id = iss.id;
      const status = readOf(id).status || 'unraised';
      const cat = catOf(id) || '';
      const evs = evForIssue(id);
      const usEvs = evs.filter((e) => e.direction !== 'in');
      const themEvs = evs.filter((e) => e.direction === 'in');
      const full = evs.length > 0 || status !== 'unraised';
      const typeLabel = 'Redline · ' + (SEV_LABEL_LOCAL[iss.priority] || iss.priority);

      const head =
        '<summary class="co-hd"><span class="co-chev"></span><span class="co-id">' + esc(id) + '</span>' +
        '<span class="co-t">' + esc(iss.title) + '</span>' +
        '<span class="co-type">' + esc(typeLabel) + '</span>' +
        (catOf(id) ? '<span class="co-cat">' + esc(catOf(id)) + '</span>' : '') +
        '<span class="co-status stt-' + esc(status) + '">' + esc(STT[status] || status) + '</span></summary>';

      const gap =
        '<div class="co-gap"><div class="co-gap-side co-us"><div class="co-gap-k">What we want</div>' +
          '<div class="co-gap-v">' + esc(iss.recommendedPosition || '—') + '</div></div>' +
          '<div class="co-gap-mid">vs</div>' +
          '<div class="co-gap-side co-them"><div class="co-gap-k">What they hold</div>' +
          '<div class="co-gap-v">' + esc(iss.supplierPosition || '—') + '</div></div></div>';

      if (!full) {
        return '<details class="co-item" data-status="' + esc(status) + '" data-cat="' + esc(cat) + '">' + head + '<div class="co-body">' + gap +
          '<div class="co-open co-o-unraised"><b>Next move:</b> <span>Not yet raised with Visier; the position is set in the redline but there are no communications on it yet. Put it on the table.</span></div>' +
          '</div></details>';
      }

      const themCites =
        (iss.sourceExcerpt ? cite({ party: 'Visier', date: 'redline', channel: 'paper',
          text: iss.sourceExcerpt + (iss.clause ? '  (' + iss.clause + ')' : '') }, true) : '') +
        themEvs.map((e) => cite(e, false)).join('');
      const usCites = usEvs.length
        ? usEvs.map((e) => cite(e, false)).join('')
        : '<div class="co-nocite">Our position is set in the redline; not yet put to Visier verbally.</div>';
      const evidence =
        '<div class="co-ev-sec">Where each position came from · the exact messages</div>' +
        '<div class="co-ev-cols"><div class="co-ev-col co-us"><h4>Our side</h4>' + usCites + '</div>' +
          '<div class="co-ev-col co-them"><h4>Supplier</h4>' + (themCites || '<div class="co-nocite">No supplier message recorded.</div>') + '</div></div>';
      const exch = evs.length
        ? '<div class="co-ev-sec">How it evolved</div><div class="co-exch">' +
            evs.map((e) => {
              const s = e.direction === 'in' ? 'them' : e.direction === 'internal' ? 'int' : 'us';
              const who = s === 'them' ? 'Visier' : s === 'int' ? 'Internal' : 'Lilly';
              return '<div class="co-exev co-' + s + '"><span class="co-ex-d">' + esc(e.date) + '</span>' +
                '<span class="co-ex-w">' + who + '</span> ' + esc(e.text) + '</div>';
            }).join('') + '</div>'
        : '';
      const openTxt = status === 'unraised'
        ? 'Internal position established but not yet raised with Visier. Put it on the table.'
        : (iss.recommendedResponse || 'Continue the exchange on the merits.');
      const openLbl = status === 'awaiting' ? 'Waiting on them' : status === 'discussion' ? 'In play' : 'Next move';
      const open = '<div class="co-open co-o-' + esc(status) + '"><b>' + openLbl + ':</b> <span>' + esc(openTxt) + '</span></div>';

      return '<details class="co-item" data-status="' + esc(status) + '" data-cat="' + esc(cat) + '">' + head + '<div class="co-body">' + gap + evidence + exch + open + '</div></details>';
    }

    const order = { awaiting: 0, discussion: 1, unraised: 2, agreed: 3 };
    const items = d.issues.slice().sort((a, b) => {
      const sa = order[readOf(a.id).status || 'unraised'], sb = order[readOf(b.id).status || 'unraised'];
      return (sa - sb) || a.id.localeCompare(b.id);
    });
    const counts = { awaiting: 0, discussion: 0, unraised: 0, agreed: 0 };
    d.issues.forEach((i) => { const s = readOf(i.id).status || 'unraised'; if (counts[s] != null) counts[s]++; });

    const cats = (tp.categories || []).map((c) => c.name);
    const summary = '<div class="co-summary">' +
      ['awaiting', 'discussion', 'unraised', 'agreed'].map((k) =>
        '<div class="co-st-card co-' + k + '" role="button" tabindex="0" data-cofilter="status:' + k + '" aria-pressed="false">' +
        '<span class="co-st-n">' + counts[k] + '</span>' +
        '<span class="co-st-l">' + STT[k] + '</span></div>').join('') + '</div>';
    const catFilter = cats.length
      ? '<div class="co-catfilter"><button class="co-cf" data-cofilter="cat:" aria-pressed="true">All</button>' +
        cats.map((c) => '<button class="co-cf" data-cofilter="cat:' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>').join('') + '</div>'
      : '';
    const listctl = '<div class="co-listctl"><span class="co-lc-count"><b data-cocount>' + items.length + '</b> contested items</span>' +
      '<button class="co-lc-btn" data-coexpand>Expand all</button></div>';
    const evNote = events.length
      ? insight('Every contested term below shows both sides and the exact messages and quotes that got them there, cited to the M365 thread. ' + coverageBadge(d.deal.evidenceCoverage))
      : insight('No in-session email/Teams thread was available; positions below are mapped from the redline only.', 'warn');
    const list = '<div class="co-list">' + items.map(itemRow).join('') + '</div>';
    const body = '<div data-coscope data-fstatus="" data-fcat="">' + summary + catFilter + evNote + listctl + list + '</div>';

    return '<div class="grid"><div class="col-12">' +
      saCard('Alignment map · contested terms', body,
        { accent: 'plum', icon: 'sources', sub: items.length + ' contested items · filter or click a row' }) +
      '</div></div>';
  }

  /* ================================ SHELL ================================== */
  const scopedStyle = '<style>' +
    '.neg-tab .section-lead{margin:2px 0 2px}' +
    '.neg-tab .obj-row{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line)}' +
    '.neg-tab .obj-row:first-child{border-top:0}' +
    '.neg-tab .obj-num{flex:none;width:24px;height:24px;border-radius:50%;background:var(--pri);color:var(--pri-fg);' +
    'font:800 var(--fz-sm)/24px var(--sans);text-align:center}' +
    '.neg-tab .obj-body{font-size:var(--fz-sm)}' +
    '.neg-tab .obj-issues{margin-top:5px;display:flex;gap:5px;flex-wrap:wrap}' +
    '.neg-tab .neg-tag{cursor:pointer;font-family:var(--mono)}' +
    '.neg-tab .src-chip{cursor:pointer;font-family:var(--mono)}' +
    '.neg-tab .ladder-hd{font-weight:700;font-size:var(--fz-sm);margin-bottom:8px;display:flex;align-items:center}' +
    '.neg-tab .hs-line{display:flex;gap:5px;align-items:flex-start;color:var(--danger-fg);font-weight:600;font-size:var(--fz-sm)}' +
    '.neg-tab .hs-line svg{width:13px;height:13px;flex:none;margin-top:2px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.neg-tab .clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    /* tactic flag chip on the spine */
    '.neg-tab .tac-chip{display:inline-flex;align-items:center;gap:4px;font:700 var(--fz-floor)/1 var(--sans);color:var(--warn-fg);' +
    'background:transparent;border:1px solid color-mix(in srgb,var(--warn-bar) 45%,transparent);border-radius:20px;padding:3px 8px}' +
    '.neg-tab .tac-chip svg{width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2}' +
    /* posture difficulty */
    '.neg-tab .diff-read{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
    '.neg-tab .diff-pill{font-size:var(--fz-sm);padding:6px 12px}' +
    /* wording toggle (CSS-only) */
    '.neg-tab .word-direct{display:none}' +
    '.neg-tab .word-toggle-row{display:flex;align-items:center;gap:6px;margin:10px 0;flex-wrap:wrap}' +
    '.neg-tab #wm-collab-pos:checked ~ .word-toggle-row label[for="wm-collab-pos"],' +
    '.neg-tab #wm-direct-pos:checked ~ .word-toggle-row label[for="wm-direct-pos"]{background:var(--pri);color:var(--pri-fg);border-color:var(--pri)}' +
    '.neg-tab #wm-direct-pos:checked ~ .word-scope .word-collab{display:none}' +
    '.neg-tab #wm-direct-pos:checked ~ .word-scope .word-direct{display:-webkit-box}' +
    '.neg-tab .plain-list{margin:0;padding-left:18px;font-size:var(--fz-sm);line-height:1.6}' +
    '.neg-tab .plain-list li{margin-bottom:6px}' +
    '.neg-tab .subtab-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;vertical-align:-2px;margin-right:2px}' +
    '.neg-tab #negPositionsTable tbody tr:not(.expander-row){cursor:pointer}' +
    '.neg-tab .row-chevron{display:inline-flex;margin-right:5px;color:var(--mut);transition:transform .15s;vertical-align:-3px}' +
    '.neg-tab .row-chevron svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.neg-tab tr.is-open .row-chevron{transform:rotate(90deg)}' +
    /* interdependency map */
    '.neg-tab .idep-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--line)}' +
    '.neg-tab .idep-name{font-weight:700;font-size:var(--fz-sm);min-width:150px;color:var(--ink2)}' +
    '.neg-tab .idep-chips{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap}' +
    '.neg-tab .idep-x{color:var(--mut);font-weight:800;margin:0 2px}' +
    /* round plan focus */
    '.neg-tab .rp-focus{font-size:var(--fz-sm);line-height:1.45;color:var(--ink2)}' +
    /* package simulator (CSS radio swap over precomputed fields) */
    '.neg-tab .pkg-toggle{display:flex;align-items:center;gap:6px;margin:2px 0 14px;flex-wrap:wrap}' +
    '.neg-tab .pkg-result{display:none}' +
    '.neg-tab #pkg-base:checked ~ .pkg-scope .pkg-r-base,' +
    '.neg-tab #pkg-PKG-A:checked ~ .pkg-scope .pkg-r-PKG-A,' +
    '.neg-tab #pkg-PKG-B:checked ~ .pkg-scope .pkg-r-PKG-B,' +
    '.neg-tab #pkg-PKG-C:checked ~ .pkg-scope .pkg-r-PKG-C{display:block;animation:fade .18s ease}' +
    '.neg-tab #pkg-base:checked ~ .pkg-toggle label[for="pkg-base"],' +
    '.neg-tab #pkg-PKG-A:checked ~ .pkg-toggle label[for="pkg-PKG-A"],' +
    '.neg-tab #pkg-PKG-B:checked ~ .pkg-toggle label[for="pkg-PKG-B"],' +
    '.neg-tab #pkg-PKG-C:checked ~ .pkg-toggle label[for="pkg-PKG-C"]{background:var(--emph);color:var(--emph-fg);border-color:var(--emph)}' +
    '.neg-tab .pkg-metrics{display:flex;gap:28px;flex-wrap:wrap;padding:4px 0 10px;border-bottom:1px solid var(--line)}' +
    '.neg-tab .pkg-metric .pm-lbl{font-size:var(--fz-floor);text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:700}' +
    '.neg-tab .pkg-metric .pm-val{font:800 26px/1.05 var(--sans);font-variant-numeric:tabular-nums;letter-spacing:-.02em;color:var(--ink);margin:3px 0}' +
    '.neg-tab .pkg-metric .pm-max{font-size:14px;font-weight:700;color:var(--mut)}' +
    '.neg-tab .pkg-detail{padding-top:10px}' +
    /* commitments board */
    '.neg-tab .cmt-hd{font-weight:800;font-size:var(--fz-sm);text-transform:uppercase;letter-spacing:.05em;color:var(--ink);margin-bottom:6px}' +
    '.neg-tab .cmt-item{padding:9px 0;border-top:1px solid var(--line)}' +
    '.neg-tab .cmt-item:first-of-type{border-top:0}' +
    '.neg-tab .cmt-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px}' +
    '.neg-tab .cmt-text{font-size:var(--fz-sm);color:var(--ink2);line-height:1.4}' +
    /* derived brief */
    '.neg-tab .brief-meta{font-size:var(--fz-sm);color:var(--ink2);margin-bottom:6px}' +
    /* ===== 4B Trade Plan (item-driven) ===== */
    '.neg-tab .tp-score{display:grid;grid-template-columns:1fr 1fr;gap:22px}' +
    '.neg-tab .tp-g-top{display:flex;align-items:baseline;gap:8px;margin-bottom:6px}' +
    '.neg-tab .tp-g-lbl{font:800 10px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;color:var(--mut)}' +
    '.neg-tab .tp-g-now{font:800 26px/1 var(--sans);font-variant-numeric:tabular-nums}' +
    '.neg-tab .tp-prot .tp-g-now{color:var(--sec-tx)}' +
    '.neg-tab .tp-tcv .tp-g-now{color:var(--pri-tx)}' +
    '.neg-tab .tp-g-bar{position:relative;height:12px;border-radius:7px;background:var(--nested);overflow:hidden}' +
    '.neg-tab .tp-g-fill{position:absolute;left:0;top:0;bottom:0;border-radius:7px;background:linear-gradient(90deg,var(--danger),var(--emph) 55%,var(--sec))}' +
    '.neg-tab .tp-tcv .tp-g-fill{background:linear-gradient(90deg,var(--sec),var(--emph) 60%,var(--danger))}' +
    '.neg-tab .tp-g-tgt{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--ink2)}' +
    '.neg-tab .tp-g-marks{display:flex;justify-content:space-between;font-size:10px;color:var(--mut2);margin-top:4px}' +
    '.neg-tab .tp-g-marks b{color:var(--ink)}' +
    '.neg-tab .tp-score-note{grid-column:1/-1;font-size:var(--fz-sm);color:var(--ink2);border-top:1px solid var(--line);padding-top:11px;margin-top:3px}' +
    '.neg-tab .tp-score-note b{color:var(--ink)}' +
    '.neg-tab .tp-batna{border:1px solid color-mix(in srgb,var(--pri) 45%,var(--line2));border-radius:var(--r);background:var(--pri-t);overflow:hidden}' +
    '.neg-tab .tp-batna-hd{display:flex;align-items:center;gap:10px;padding:11px 15px;cursor:pointer;list-style:none}' +
    '.neg-tab .tp-batna-hd::-webkit-details-marker{display:none}' +
    '.neg-tab .tp-batna-hd svg{width:15px;height:15px;flex:none;stroke:var(--pri-tx);fill:none;stroke-width:2}' +
    '.neg-tab .tp-bt-t{font:800 10px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;color:var(--pri-tx);flex:none}' +
    '.neg-tab .tp-bt-s{font-size:var(--fz-sm);color:var(--ink2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.neg-tab .tp-bt-chev{width:8px;height:8px;border-right:2px solid var(--pri-tx);border-bottom:2px solid var(--pri-tx);transform:rotate(-45deg);transition:transform .15s;flex:none}' +
    '.neg-tab .tp-batna[open] .tp-bt-chev{transform:rotate(45deg)}' +
    '.neg-tab .tp-batna-bd{padding:2px 15px 13px}' +
    '.neg-tab .tp-batna-bd .kv{display:grid;grid-template-columns:104px 1fr;gap:5px 12px;font-size:var(--fz-sm)}' +
    '.neg-tab .tp-batna-bd dt{color:var(--pri-tx);font-weight:700}' +
    '.neg-tab .tp-batna-bd dd{margin:0;color:var(--ink2);line-height:1.5}' +
    '.neg-tab .tp-cur{width:100%;border-collapse:collapse;font-size:var(--fz-sm)}' +
    '.neg-tab .tp-cur th{text-align:left;font:800 9px/1.2 var(--sans);letter-spacing:.04em;text-transform:uppercase;color:var(--mut);padding:0 10px 8px;border-bottom:1px solid var(--line2)}' +
    '.neg-tab .tp-cur td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}' +
    '.neg-tab .tp-cur tr:last-child td{border-bottom:0}' +
    '.neg-tab .tp-cur-give{font-weight:700;color:var(--ink)}' +
    '.neg-tab .tp-cur-for{color:var(--ink2)}' +
    '.neg-tab .tp-cat{margin-bottom:14px}' +
    '.neg-tab .tp-cat-h{display:flex;align-items:center;gap:9px;margin:2px 0 8px;padding-bottom:5px;border-bottom:2px solid var(--pri)}' +
    '.neg-tab .tp-c-name{font:800 11.5px/1 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--pri-tx)}' +
    '.neg-tab .tp-c-cnt{font-size:11px;color:var(--mut2)}' +
    '.neg-tab .tp-item{border:1px solid var(--line2);border-top:0;background:var(--surface)}' +
    '.neg-tab .tp-cat .tp-item:first-of-type{border-top:1px solid var(--line2);border-radius:9px 9px 0 0}' +
    '.neg-tab .tp-cat .tp-item:last-of-type{border-radius:0 0 9px 9px}' +
    '.neg-tab .tp-cat .tp-item:only-of-type{border-radius:9px}' +
    '.neg-tab .tp-hd{display:grid;grid-template-columns:auto auto 1fr;gap:11px;align-items:center;padding:11px 14px;cursor:pointer;list-style:none}' +
    '.neg-tab .tp-hd::-webkit-details-marker{display:none}' +
    '.neg-tab .tp-hd:hover{background:var(--surface2)}' +
    '.neg-tab .tp-item[open] .tp-hd{background:var(--surface2);border-bottom:1px solid var(--line)}' +
    '.neg-tab .tp-chev{width:7px;height:7px;border-right:2px solid var(--mut2);border-bottom:2px solid var(--mut2);transform:rotate(-45deg);transition:transform .15s}' +
    '.neg-tab .tp-item[open] .tp-chev{transform:rotate(45deg)}' +
    '.neg-tab .tp-id{font:800 10px/1 var(--mono);color:var(--mut)}' +
    '.neg-tab .tp-main{min-width:0}' +
    '.neg-tab .tp-t{font-weight:700;font-size:13px;color:var(--ink);line-height:1.3}' +
    '.neg-tab .tp-sig{display:flex;gap:14px;flex-wrap:wrap;margin-top:5px;align-items:center}' +
    '.neg-tab .tp-sg{font-size:10.5px;color:var(--mut2);display:inline-flex;align-items:center;gap:4px}' +
    '.neg-tab .tp-sg b{font:800 8px/1.4 var(--sans);letter-spacing:.03em;text-transform:uppercase;color:var(--mut2)}' +
    '.neg-tab .tp-sg span{font-weight:700}' +
    '.neg-tab .tp-status{font:800 8px/1.4 var(--sans);text-transform:uppercase;letter-spacing:.03em;padding:2px 7px;border-radius:5px;white-space:nowrap;border:1px solid transparent}' +
    '.neg-tab .stt-awaiting{color:var(--warn-fg);border-color:color-mix(in srgb,var(--warn-bar) 52%,transparent)}' +
    '.neg-tab .stt-discussion{color:var(--sec-tx);border-color:color-mix(in srgb,var(--sec) 50%,transparent)}' +
    '.neg-tab .stt-unraised{color:var(--mut);border-color:var(--line2)}' +
    '.neg-tab .tp-far{color:var(--danger-fg)}.neg-tab .tp-mod{color:var(--warn-fg)}.neg-tab .tp-close{color:var(--sec-tx)}' +
    '.neg-tab .tp-mlikely{color:var(--sec-tx)}.neg-tab .tp-mposs{color:var(--warn-fg)}.neg-tab .tp-mres{color:var(--danger-fg)}' +
    '.neg-tab .tp-body{padding:14px}' +
    '.neg-tab .tp-cols{display:grid;grid-template-columns:1fr 1.2fr 1fr;border:1px solid var(--line2);border-radius:9px;overflow:hidden}' +
    '.neg-tab .tp-col{padding:12px 13px;border-right:1px solid var(--line2)}' +
    '.neg-tab .tp-col:last-child{border-right:0}' +
    '.neg-tab .tp-col-k{font:800 8.5px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;margin-bottom:7px}' +
    '.neg-tab .tp-col.want{background:var(--sec-t)}.neg-tab .tp-col.want .tp-col-k{color:var(--sec-tx)}' +
    '.neg-tab .tp-col.trade{background:var(--surface)}.neg-tab .tp-col.trade .tp-col-k{color:var(--emph-tx)}' +
    '.neg-tab .tp-col.floor{background:var(--pri-t)}.neg-tab .tp-col.floor .tp-col-k{color:var(--pri-tx)}' +
    '.neg-tab .tp-col-v{font-size:var(--fz-sm);color:var(--ink2);line-height:1.45}' +
    '.neg-tab .tp-give{display:flex;gap:7px;align-items:baseline;margin-bottom:7px}' +
    '.neg-tab .tp-give:last-child{margin-bottom:0}' +
    '.neg-tab .tp-give::before{content:"\\25CB";color:var(--emph);font-size:10px;flex:none}' +
    '.neg-tab .tp-range{margin-top:11px;font-size:11px;color:var(--mut2)}' +
    '.neg-tab .tp-range-lbl{display:block;margin-bottom:5px}' +
    '.neg-tab .tp-range-band{display:flex;align-items:center;font:700 10px/1.3 var(--mono)}' +
    '.neg-tab .tp-r-e{padding:4px 8px;border-radius:5px}' +
    '.neg-tab .tp-r-e.a{background:var(--sec-t);color:var(--sec-tx)}.neg-tab .tp-r-e.b{background:var(--pri-t);color:var(--pri-tx)}' +
    '.neg-tab .tp-r-line{flex:1;height:2px;background:linear-gradient(90deg,var(--sec),var(--pri));min-width:24px}' +
    '@media(max-width:760px){.neg-tab .tp-score{grid-template-columns:1fr}.neg-tab .tp-cols{grid-template-columns:1fr}}' +
    /* ===== 4C Communications (alignment map) ===== */
    '.neg-tab .co-summary{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:4px}' +
    '.neg-tab .co-st-card{flex:1 1 150px;min-width:130px;display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid var(--line2);border-radius:10px;background:var(--surface)}' +
    '.neg-tab .co-st-n{font:800 22px/1 var(--sans);font-variant-numeric:tabular-nums;min-width:22px;text-align:center}' +
    '.neg-tab .co-st-l{font-size:11px;line-height:1.3;color:var(--mut2)}' +
    '.neg-tab .co-awaiting .co-st-n{color:var(--warn-fg)}' +
    '.neg-tab .co-discussion .co-st-n{color:var(--sec-tx)}' +
    '.neg-tab .co-unraised .co-st-n{color:var(--mut)}' +
    '.neg-tab .co-agreed .co-st-n{color:var(--ok-fg)}' +
    '.neg-tab .co-list{border:1px solid var(--line2);border-radius:11px;overflow:hidden;background:var(--surface);margin-top:12px}' +
    '.neg-tab .co-item{border-top:1px solid var(--line)}' +
    '.neg-tab .co-list>.co-item:first-child{border-top:0}' +
    '.neg-tab .co-hd{display:flex;align-items:center;gap:10px;padding:11px 15px;cursor:pointer;background:var(--surface);flex-wrap:wrap;list-style:none}' +
    '.neg-tab .co-hd::-webkit-details-marker{display:none}' +
    '.neg-tab .co-hd:hover{background:var(--surface2)}' +
    '.neg-tab .co-item[open]>.co-hd{background:var(--surface2);border-bottom:1px solid var(--line)}' +
    '.neg-tab .co-chev{width:8px;height:8px;border-right:2px solid var(--mut2);border-bottom:2px solid var(--mut2);transform:rotate(-45deg);transition:transform .15s;flex:none;margin-right:1px}' +
    '.neg-tab .co-item[open] .co-chev{transform:rotate(45deg)}' +
    '.neg-tab .co-id{font:800 10px/1 var(--mono);color:var(--mut)}' +
    '.neg-tab .co-t{font-weight:800;font-size:13.5px;color:var(--ink)}' +
    '.neg-tab .co-type{font:700 8.5px/1.4 var(--sans);text-transform:uppercase;letter-spacing:.03em;color:var(--mut2);background:var(--nested);border-radius:4px;padding:2px 6px}' +
    '.neg-tab .co-cat{font:700 8.5px/1.4 var(--sans);text-transform:uppercase;letter-spacing:.03em;color:var(--pri-tx);border:1px solid color-mix(in srgb,var(--pri) 30%,transparent);border-radius:4px;padding:2px 6px}' +
    '.neg-tab .co-status{margin-left:auto;font:800 8.5px/1.4 var(--sans);text-transform:uppercase;letter-spacing:.03em;padding:3px 9px;border-radius:6px;border:1px solid transparent}' +
    '.neg-tab .co-status.stt-awaiting{color:var(--warn-fg);border-color:color-mix(in srgb,var(--warn-bar) 52%,transparent)}' +
    '.neg-tab .co-status.stt-discussion{color:var(--sec-tx);border-color:color-mix(in srgb,var(--sec) 50%,transparent)}' +
    '.neg-tab .co-status.stt-unraised{color:var(--mut);border-color:var(--line2)}' +
    '.neg-tab .co-status.stt-agreed{color:var(--ok-fg);border-color:color-mix(in srgb,var(--ok-bar) 50%,transparent)}' +
    '.neg-tab .co-body{padding:14px 15px}' +
    '.neg-tab .co-gap{display:grid;grid-template-columns:1fr auto 1fr;align-items:stretch;margin-bottom:14px;border:1px solid var(--line2);border-radius:9px;overflow:hidden}' +
    '.neg-tab .co-gap-side{padding:11px 13px}' +
    '.neg-tab .co-gap-side.co-us{background:var(--sec-t)}' +
    '.neg-tab .co-gap-side.co-them{background:var(--surface);border-left:3px solid var(--danger-bar)}' +
    '.neg-tab .co-gap-k{font:800 8.5px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;margin-bottom:5px}' +
    '.neg-tab .co-us .co-gap-k{color:var(--sec-tx)}' +
    '.neg-tab .co-them .co-gap-k{color:var(--danger-fg)}' +
    '.neg-tab .co-gap-v{font-size:12px;color:var(--ink2);line-height:1.4}' +
    '.neg-tab .co-gap-mid{display:flex;align-items:center;justify-content:center;padding:0 10px;background:var(--surface);color:var(--mut2);font:800 11px/1 var(--sans);text-transform:uppercase;border-left:1px solid var(--line2);border-right:1px solid var(--line2)}' +
    '.neg-tab .co-ev-sec{font:800 9px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--mut);margin:14px 0 8px}' +
    '.neg-tab .co-ev-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}' +
    '.neg-tab .co-ev-col h4{font:800 9px/1 var(--sans);letter-spacing:.03em;text-transform:uppercase;margin:0 0 8px}' +
    '.neg-tab .co-ev-col.co-us h4{color:var(--sec-tx)}' +
    '.neg-tab .co-ev-col.co-them h4{color:var(--danger-fg)}' +
    '.neg-tab .co-cite{border-left:2px solid var(--line2);padding:6px 0 6px 11px;margin-bottom:9px}' +
    '.neg-tab .co-ev-col.co-us .co-cite{border-color:color-mix(in srgb,var(--sec) 45%,transparent)}' +
    '.neg-tab .co-ev-col.co-them .co-cite{border-color:color-mix(in srgb,var(--danger) 40%,transparent)}' +
    '.neg-tab .co-cite-m{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:3px}' +
    '.neg-tab .co-cite-party{font-weight:700;font-size:11px;color:var(--ink)}' +
    '.neg-tab .co-cite-d{font:700 9px/1 var(--mono);color:var(--mut2)}' +
    '.neg-tab .co-chan{display:inline-flex;width:16px;height:16px;border-radius:4px;align-items:center;justify-content:center;color:#fff;flex:none}' +
    '.neg-tab .co-chan.co-email{background:var(--info-fg)}' +
    '.neg-tab .co-chan.co-teams{background:var(--pri)}' +
    '.neg-tab .co-chan.co-paper{background:var(--mut2)}' +
    '.neg-tab .co-chan svg{width:10px;height:10px}' +
    '.neg-tab .co-cite-x{font-size:12px;color:var(--ink2);line-height:1.45}' +
    '.neg-tab .co-cite-x.co-quote{font-style:italic}' +
    '.neg-tab .co-cite-x.co-quote::before{content:"\\201C"}.neg-tab .co-cite-x.co-quote::after{content:"\\201D"}' +
    '.neg-tab .co-nocite{font-size:11.5px;color:var(--mut2);font-style:italic}' +
    '.neg-tab .co-exch{border-left:2px solid var(--line2);margin-left:5px;padding-left:14px;margin-top:4px}' +
    '.neg-tab .co-exev{position:relative;padding:5px 0;font-size:11.5px;color:var(--ink2)}' +
    '.neg-tab .co-exev::before{content:"";position:absolute;left:-20px;top:9px;width:8px;height:8px;border-radius:50%;border:2px solid var(--surface)}' +
    '.neg-tab .co-exev.co-us::before{background:var(--sec)}' +
    '.neg-tab .co-exev.co-them::before{background:var(--danger-bar)}' +
    '.neg-tab .co-exev.co-int::before{background:var(--pri)}' +
    '.neg-tab .co-ex-d{font:700 9px/1 var(--mono);color:var(--mut2);margin-right:7px}' +
    '.neg-tab .co-ex-w{font-weight:700;margin-right:4px}' +
    '.neg-tab .co-open{margin-top:13px;padding:10px 12px;border-radius:9px;font-size:12px;line-height:1.45;background:var(--surface2);border-left:3px solid var(--line2)}' +
    '.neg-tab .co-open b{font-weight:800}' +
    '.neg-tab .co-open.co-o-awaiting{border-left-color:var(--warn-bar)}' +
    '.neg-tab .co-open.co-o-discussion{border-left-color:var(--sec)}' +
    '.neg-tab .co-open.co-o-unraised{border-left-color:var(--line2)}' +
    '.neg-tab .co-st-card{cursor:pointer}' +
    '.neg-tab .co-st-card[aria-pressed="true"]{border-color:var(--pri);box-shadow:inset 0 0 0 1px var(--pri)}' +
    '.neg-tab .co-catfilter{display:flex;gap:7px;flex-wrap:wrap;margin:11px 0 2px}' +
    '.neg-tab .co-cf{font:700 11px/1 var(--sans);padding:5px 11px;border-radius:20px;border:1px solid var(--line2);background:transparent;color:var(--mut);cursor:pointer}' +
    '.neg-tab .co-cf[aria-pressed="true"]{border-color:var(--pri);color:var(--pri-tx)}' +
    '.neg-tab .co-listctl{display:flex;align-items:center;gap:10px;margin-top:11px;padding-top:10px;border-top:1px solid var(--line)}' +
    '.neg-tab .co-lc-count{font-size:11px;color:var(--mut2)}.neg-tab .co-lc-count b{color:var(--ink);font-variant-numeric:tabular-nums}' +
    '.neg-tab .co-lc-btn{margin-left:auto;font:700 11px/1 var(--sans);color:var(--pri-tx);background:none;border:0;cursor:pointer}' +
    '@media(max-width:720px){.neg-tab .co-gap{grid-template-columns:1fr}.neg-tab .co-ev-cols{grid-template-columns:1fr}}' +
    /* ===== 4A Positions (per-term workbench) ===== */
    '.neg-tab .ps-posture{display:grid;grid-template-columns:1.15fr 1fr;gap:15px;margin-bottom:16px}' +
    '.neg-tab .ps-pcard{background:var(--surface);border:1px solid var(--line2);border-radius:var(--r);padding:14px}' +
    '.neg-tab .ps-pc-h{font:800 10px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--mut);margin-bottom:12px}' +
    '.neg-tab .ps-gates{display:flex;flex-direction:column;gap:9px}' +
    '.neg-tab .ps-gate{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--line2);border-radius:9px;background:var(--surface2)}' +
    '.neg-tab .ps-gate-top{display:flex;align-items:center;gap:9px}' +
    '.neg-tab .ps-gate-t{font-weight:700;font-size:12.5px;color:var(--ink)}' +
    '.neg-tab .ps-gate-id{margin-left:auto;font:700 9px/1 var(--mono);color:var(--mut2)}' +
    '.neg-tab .ps-gate-status{display:flex;flex-direction:column;gap:3px}' +
    '.neg-tab .ps-g-now,.neg-tab .ps-g-need{font-size:11px;line-height:1.35}' +
    '.neg-tab .ps-g-now{color:var(--danger-fg)}.neg-tab .ps-g-need{color:var(--sec-tx)}' +
    '.neg-tab .ps-g-now b,.neg-tab .ps-g-need b{font:800 9px/1.4 var(--sans);letter-spacing:.03em;text-transform:uppercase;margin-right:5px}' +
    '.neg-tab .ps-traj-top{display:flex;align-items:baseline;gap:8px;margin-bottom:10px;flex-wrap:wrap}' +
    '.neg-tab .ps-traj-now{font:800 30px/1 var(--sans);color:var(--danger-fg)}' +
    '.neg-tab .ps-traj-goal{font:800 30px/1 var(--sans);color:var(--sec-tx)}' +
    '.neg-tab .ps-traj-arr{color:var(--mut2);font-size:16px;margin:0 3px}' +
    '.neg-tab .ps-traj-lbl{font-size:11px;color:var(--mut2);line-height:1.2}' +
    '.neg-tab .ps-traj-bar{position:relative;height:12px;border-radius:6px;background:var(--nested);overflow:hidden;margin:4px 0 3px}' +
    '.neg-tab .ps-traj-fill{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,var(--danger),var(--emph) 55%,var(--sec))}' +
    '.neg-tab .ps-traj-marks{display:flex;justify-content:space-between;font-size:10px;color:var(--mut2);margin-top:3px}' +
    '.neg-tab .ps-pk-legend{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}' +
    '.neg-tab .ps-pk-chip{font-size:10.5px;color:var(--ink2);border:1px solid var(--line2);border-radius:6px;padding:3px 8px}' +
    '.neg-tab .ps-pk-chip b{color:var(--sec-tx)}' +
    '.neg-tab .ps-diff-row{display:flex;align-items:center;gap:10px;margin-top:12px;padding-top:11px;border-top:1px solid var(--line);flex-wrap:wrap}' +
    '.neg-tab .ps-diff-pill{font-size:var(--fz-sm)}' +
    '.neg-tab .ps-dist{display:flex;gap:12px;font-size:11px;color:var(--mut2);flex-wrap:wrap}' +
    '.neg-tab .ps-dist-i{display:inline-flex;align-items:center;gap:4px}' +
    '.neg-tab .ps-dist-i .sev-ic{width:12px;height:12px}' +
    '.neg-tab .ps-dist-i b{color:var(--ink);font-variant-numeric:tabular-nums}' +
    '.neg-tab .ps-md{display:grid;grid-template-columns:300px 1fr;background:var(--surface);border:1px solid var(--line2);border-radius:var(--r);overflow:hidden}' +
    '.neg-tab .ps-list{border-right:1px solid var(--line);max-height:660px;overflow:auto}' +
    '.neg-tab .ps-row{display:flex;gap:9px;align-items:flex-start;padding:11px 13px;border-bottom:1px solid var(--line);cursor:pointer}' +
    '.neg-tab .ps-row:hover{background:var(--surface2)}' +
    '.neg-tab .ps-row.sc-sel{background:var(--pri-t)}' +
    '.neg-tab .ps-r-txt{min-width:0;flex:1}' +
    '.neg-tab .ps-r-t{font-weight:700;font-size:12px;color:var(--ink);line-height:1.3}' +
    '.neg-tab .ps-r-c{display:block;font-size:10.5px;color:var(--mut2);margin-top:2px}' +
    '.neg-tab .ps-r-pkg{margin-left:auto;font:700 8.5px/1.4 var(--sans);text-transform:uppercase;letter-spacing:.03em;color:var(--mut2);flex:none}' +
    '.neg-tab .ps-detailwrap{max-height:660px;overflow:auto}' +
    '.neg-tab .ps-detail{padding:18px 20px}' +
    '.neg-tab .ps-d-eyebrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px}' +
    '.neg-tab .ps-d-id{font:800 11px/1 var(--mono);color:var(--mut)}' +
    '.neg-tab .ps-d-clause{font-size:11px;color:var(--mut2)}' +
    '.neg-tab .ps-d-title{font-size:17px;font-weight:800;line-height:1.3;margin:3px 0 16px;color:var(--ink)}' +
    '.neg-tab .ps-sec-h{font:800 9.5px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;color:var(--mut);margin:18px 0 9px}' +
    '.neg-tab .ps-ladder{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}' +
    '.neg-tab .ps-rung{border:1px solid var(--line2);border-radius:9px;padding:10px 11px;background:var(--surface2)}' +
    '.neg-tab .ps-rk{font:800 8.5px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;margin-bottom:5px}' +
    '.neg-tab .ps-rv{font-size:11.5px;color:var(--ink2);line-height:1.4}' +
    '.neg-tab .ps-rung.sup{background:var(--surface);border-left:3px solid var(--danger-bar)}.neg-tab .ps-rung.sup .ps-rk{color:var(--danger-fg)}' +
    '.neg-tab .ps-rung.tgt{background:var(--sec-t)}.neg-tab .ps-rung.tgt .ps-rk{color:var(--sec-tx)}' +
    '.neg-tab .ps-rung.fb{background:var(--pri-t)}.neg-tab .ps-rung.fb .ps-rk{color:var(--pri-tx)}' +
    '.neg-tab .ps-rung.walk{background:var(--pri-t);border-color:color-mix(in srgb,var(--pri) 40%,transparent)}.neg-tab .ps-rung.walk .ps-rk{color:var(--pri-tx)}' +
    '.neg-tab .ps-ladder-note{font-size:10.5px;color:var(--mut2);font-style:italic;margin-top:7px}' +
    '.neg-tab .ps-kv{display:grid;grid-template-columns:110px 1fr;gap:5px 12px;font-size:12.5px;margin:0}' +
    '.neg-tab .ps-kv dt{color:var(--mut2);font-weight:700}' +
    '.neg-tab .ps-kv dd{margin:0;color:var(--ink2);line-height:1.5}' +
    '.neg-tab .ps-exch{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.neg-tab .ps-e{border:1px solid var(--line2);border-radius:9px;padding:11px 12px}' +
    '.neg-tab .ps-e-k{font:800 9px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px}' +
    '.neg-tab .ps-e.ps-push{background:var(--surface);border-left:3px solid var(--danger-bar)}.neg-tab .ps-e.ps-push .ps-e-k{color:var(--danger-fg)}' +
    '.neg-tab .ps-e.ps-rebut{background:var(--sec-t)}.neg-tab .ps-e.ps-rebut .ps-e-k{color:var(--sec-tx)}' +
    '.neg-tab .ps-e-v{font-size:12px;line-height:1.5;color:var(--ink2)}' +
    '.neg-tab .ps-tactic{display:inline-flex;align-items:center;gap:5px;margin-top:7px;font:700 10.5px/1 var(--sans);color:var(--emph);background:transparent;border:1px solid color-mix(in srgb,var(--emph) 45%,transparent);border-radius:5px;padding:3px 7px}' +
    '.neg-tab .ps-tactic svg{width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2}' +
    '.neg-tab .ps-trade{margin-top:10px;font-size:12px;color:var(--ink2);background:var(--nested);border-radius:8px;padding:9px 11px}' +
    '.neg-tab .ps-trade b{color:var(--pri-tx)}' +
    '.neg-tab .ps-deps{display:flex;flex-wrap:wrap;gap:8px}' +
    '.neg-tab .ps-dep{font-size:11px;padding:5px 9px;border-radius:6px;border:1px solid var(--line2);background:var(--surface2)}' +
    '.neg-tab .ps-dep .ps-dk{font:700 8.5px/1 var(--sans);text-transform:uppercase;letter-spacing:.03em;color:var(--mut2);margin-right:5px}' +
    '.neg-tab .ps-dep b{color:var(--pri-tx)}' +
    '.neg-tab .ps-hist{display:flex;flex-direction:column;border-left:2px solid var(--line2);margin-left:5px;padding-left:14px}' +
    '.neg-tab .ps-hev{position:relative;padding:7px 0}' +
    '.neg-tab .ps-hev::before{content:"";position:absolute;left:-20px;top:11px;width:8px;height:8px;border-radius:50%;background:var(--pri);border:2px solid var(--surface)}' +
    '.neg-tab .ps-h-d{font:700 10px/1 var(--mono);color:var(--mut2)}' +
    '.neg-tab .ps-h-t{font-size:12px;color:var(--ink2);margin-top:2px;line-height:1.4}' +
    '.neg-tab .ps-h-who{font-weight:700;color:var(--pri-tx)}' +
    '@media(max-width:820px){.neg-tab .ps-posture{grid-template-columns:1fr}.neg-tab .ps-md{grid-template-columns:1fr}.neg-tab .ps-ladder{grid-template-columns:1fr 1fr}.neg-tab .ps-exch{grid-template-columns:1fr}}' +
    '</style>';

  // Consistent with every other subtabbed tab (Terms & Review, Economics): the subtab bar sits
  // directly under the primary nav, and each subtab panel leads with its OWN title + intro
  // (there is no separate tab-level "Negotiation" heading).
  const cov = coverageBadge(d.deal.evidenceCoverage);
  const intro = (h2, q) => '<div class="tab-intro"><h2>' + h2 + '</h2><p class="q">' + q + ' ' + cov + '</p></div>';
  const posIntro = intro('Positions', 'One term at a time: its full arc (as-drafted → target → fallback → walk-away), why it matters, the exchange, its dependencies and its history, under an orienting posture header of the signature gates and where the playbook alignment score can get to.');
  const tradeIntro = intro('Trade Plan', 'For each ask where we and the supplier are not aligned: what we want, what we would trade to get it, and our floor, with how far apart we are and how likely they move, plus the currency we can spend and the walk-away.');
  const commsIntro = intro('Communications', 'Where every contested redline, ask and gap stands between us and the supplier, mapped to the specific messages and quotes on each side. The evidence layer, organised by what you are actually negotiating.');
  return scopedStyle + '<div class="neg-tab">' +
    '<div class="subtabbar" data-subtab-group="negotiation"><div class="wrap">' +
    '<button class="subtab-btn" data-subtab="positions" aria-selected="true">' + icon('target') + ' Positions</button>' +
    '<button class="subtab-btn" data-subtab="trade">' + icon('trade') + ' Trade Plan</button>' +
    '<button class="subtab-btn" data-subtab="comms">' + icon('sources') + ' Communications</button>' +
    '</div></div>' +
    '<div class="tab-body"><div class="wrap">' +
    '<div data-subpanel="negotiation/positions" class="is-active">' + posIntro + buildPositions() + '</div>' +
    '<div data-subpanel="negotiation/trade">' + tradeIntro + buildTradePlan() + '</div>' +
    '<div data-subpanel="negotiation/comms">' + commsIntro + buildComms() + '</div>' +
    '</div></div>' +
    '</div>';
}

if (typeof global !== 'undefined') {
  global.renderTab_negotiation = renderTab_negotiation;
  global.DealTabs = global.DealTabs || {};
  global.DealTabs.negotiation = renderTab_negotiation;
}

})(typeof window !== 'undefined' ? window : this);
