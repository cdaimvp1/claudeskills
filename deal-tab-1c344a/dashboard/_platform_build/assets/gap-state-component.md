# Gap-State Component — Spec + Snippet

**What it is:** the one reusable "labeled gap, never fabricated" component referenced by `CONVERGED-DASHBOARD-OPERATING-RULES.md` §1.2 (fallback ladder, step 3). Any panel drops it in wherever a required input is missing, instead of zero-filling, inventing a placeholder, or silently omitting the panel. Framework-free, matches the platform's `theo-color.css` / `pv.css` token layer, works in light and dark automatically because it only ever references CSS custom properties.

**What it is not:** a loading spinner, an error toast, or a red alert. A gap is an honest, expected state — the panel structure stays visible, the message is calm and specific, and nothing about it should read as broken or urgent.

---

## 1. The four states

| State | Meaning | Typical trigger |
|---|---|---|
| `NEEDS_INPUT` | A value is missing and a person can supply it (directly, by pointing to a source, or by confirming "unavailable"). | Fallback ladder step 2 didn't get an answer yet, or the value has never been asked for. |
| `RESEARCH_PENDING` | Sourcing is in progress or queued (ARIA lookup, web research, a materialized artifact not generated yet) — no user action needed, just a wait. | The analysis-core hasn't run this artifact yet, or an async source lookup is outstanding. |
| `NOT_APPLICABLE` | The field genuinely doesn't apply to this project/supplier/deal — not missing, just out of scope here. | e.g. an incumbent-only field on a project with no incumbent; a GxP field on a non-regulated category. |
| `UNAVAILABLE` | Sourced as far as the fallback ladder goes (step 1–2 exhausted) and the answer is "no, this cannot be obtained" — a confirmed gap, not a pending one. | User answered "unavailable" to the batched ask; a connector is off and out of the user's control; a role-gated field returns empty. |

Never invent a fifth state ad hoc — if a new case doesn't fit one of these four cleanly, it's a sign the case needs its own conversation, not a new chip.

## 2. Anatomy

Every instance renders three parts, the last one optional:

1. **State chip** — a small pill naming the state (`Needs input`, `Research pending`, `Not applicable`, `Unavailable`). Mono, uppercase-tracked, matches the platform's existing chip idiom (`.pvsl .needs`, `.bchip`).
2. **One-line message** — `Missing <X> · needed for <Y> · provide to enable` (wording flexes slightly per state — see §3). Always names the specific missing thing and the specific downstream use, never a generic "data unavailable."
3. **Unblock line** (optional) — a short, muted second line stating exactly what resolves the gap, when that's known and worth saying (e.g. "Unlocks once Treasury confirms WACC" or "Resolves automatically once the SharePoint connector is enabled").

No icon beyond the chip. No red. No animation beyond an optional subtle pulse on the `RESEARCH_PENDING` dot, which is decorative only and safe to omit.

## 3. Message wording per state

| State | Message pattern |
|---|---|
| `NEEDS_INPUT` | `Missing {missing} · needed for {neededFor} · provide to enable` |
| `RESEARCH_PENDING` | `Researching {missing} · needed for {neededFor} · check back shortly` |
| `NOT_APPLICABLE` | `{missing} does not apply here · {neededFor} is skipped for this project` |
| `UNAVAILABLE` | `{missing} unavailable · needed for {neededFor} · no path to source it right now` |

`{missing}` and `{neededFor}` are always supplied by the caller; the snippet in §4 fills the pattern automatically from the `state` argument so callers don't hand-author wording per state.

## 4. Color mapping (tokens only — no hardcoded hex)

| State | Chip bg | Chip text | Left bar / accent |
|---|---|---|---|
| `NEEDS_INPUT` | `var(--amber-t, var(--warn-bg))` | `var(--amber-d, var(--warn-fg))` | `var(--amber-d, var(--warn-bar))` |
| `RESEARCH_PENDING` | `var(--panel)` | `var(--mut2)` | `var(--line2)` |
| `NOT_APPLICABLE` | `var(--panel)` | `var(--mut2)` | `var(--line)` |
| `UNAVAILABLE` | `var(--nested)` | `var(--mut2)` | `var(--line2)` |

Only `NEEDS_INPUT` gets the amber "this wants your attention" treatment, because it's the one state with a concrete next action for a person. The other three are deliberately neutral (`--mut2` / `--line*`) — they are honest information, not alerts. This mirrors the existing platform convention (`.pvsl .needs` already uses amber for the same reason) rather than introducing a new palette.

---

## 5. Snippet — drop-in, framework-free

Include the CSS once per page (inline `<style>` or append to the page's stylesheet), then call `gapStateHTML(opts)` anywhere a panel needs to render a gap instead of a value. No dependencies, no build step — matches how `pv-07-landscape-render.js` and friends build HTML today (functions returning strings, inlined into `innerHTML`).

```js
/* gap-state-component.js — reusable "labeled data-gap" panel state.
   Renders NEEDS_INPUT / RESEARCH_PENDING / NOT_APPLICABLE / UNAVAILABLE.
   Never renders a fabricated or zero-filled value — this is the honest-gap surface. */

function gapStateHTML(opts) {
  opts = opts || {};
  var state     = opts.state || 'NEEDS_INPUT';
  var missing   = opts.missing || 'this value';
  var neededFor = opts.neededFor || 'this panel';
  var unblock   = opts.unblock || null;

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var CHIP_LABEL = {
    NEEDS_INPUT:       'Needs input',
    RESEARCH_PENDING:  'Research pending',
    NOT_APPLICABLE:    'Not applicable',
    UNAVAILABLE:       'Unavailable'
  };
  var MESSAGE = {
    NEEDS_INPUT:      'Missing ' + esc(missing) + ' · needed for ' + esc(neededFor) + ' · provide to enable',
    RESEARCH_PENDING: 'Researching ' + esc(missing) + ' · needed for ' + esc(neededFor) + ' · check back shortly',
    NOT_APPLICABLE:   esc(missing) + ' does not apply here · ' + esc(neededFor) + ' is skipped for this project',
    UNAVAILABLE:      esc(missing) + ' unavailable · needed for ' + esc(neededFor) + ' · no path to source it right now'
  };

  var cls   = 'gap-state gap-state--' + state.toLowerCase().replace(/_/g, '-');
  var chip  = CHIP_LABEL[state] || CHIP_LABEL.NEEDS_INPUT;
  var msg   = MESSAGE[state] || MESSAGE.NEEDS_INPUT;
  var unblockHtml = unblock
    ? '<div class="gap-unblock">' + esc(unblock) + '</div>'
    : '';

  return (
    '<div class="' + cls + '" role="status" aria-live="polite">' +
      '<span class="gap-chip">' + chip + '</span>' +
      '<span class="gap-msg">' + msg + '</span>' +
      unblockHtml +
    '</div>'
  );
}
```

```css
/* gap-state-component.css — relies only on platform tokens (theo-color.css / pv.css).
   Theme-aware automatically: every color here is a var(), so light/dark both work
   with no separate dark-mode block. */

.gap-state{
  display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 10px;
  padding:9px 12px;
  border:1px solid var(--line);border-left-width:3px;border-left-style:solid;
  border-radius:0 8px 8px 0;
  background:var(--panel);
  font-size:12.5px;line-height:1.5;color:var(--ink2);
}

.gap-state .gap-chip{
  flex:none;
  font-family:var(--mono,monospace);font-size:9.5px;font-weight:700;
  text-transform:uppercase;letter-spacing:.05em;
  padding:3px 9px;border-radius:30px;white-space:nowrap;
}

.gap-state .gap-msg{color:var(--ink2)}

.gap-state .gap-unblock{
  flex-basis:100%;
  font-size:11px;color:var(--mut2);font-style:italic;
}

/* NEEDS_INPUT — the one state with a concrete next action; amber, matches .pvsl .needs */
.gap-state--needs-input{border-left-color:var(--amber-d, var(--warn-bar))}
.gap-state--needs-input .gap-chip{
  background:var(--amber-t, var(--warn-bg));color:var(--amber-d, var(--warn-fg));
}

/* RESEARCH_PENDING — sourcing in flight, no action needed; fully neutral */
.gap-state--research-pending{border-left-color:var(--line2)}
.gap-state--research-pending .gap-chip{background:var(--nested);color:var(--mut2)}

/* NOT_APPLICABLE — out of scope by design; fully neutral, quietest treatment */
.gap-state--not-applicable{border-left-color:var(--line)}
.gap-state--not-applicable .gap-chip{background:var(--nested);color:var(--mut2)}

/* UNAVAILABLE — fallback ladder exhausted; neutral but a touch more defined */
.gap-state--unavailable{border-left-color:var(--line2)}
.gap-state--unavailable .gap-chip{background:var(--well);color:var(--mut2)}
```

## 6. Usage example

```js
document.querySelector('#style-once').insertAdjacentHTML('beforeend', '<style>' + GAP_STATE_CSS + '</style>'); // once per page
wacRow.innerHTML = gapStateHTML({ state: 'NEEDS_INPUT', missing: 'discount rate (WACC)', neededFor: 'the NPV and sensitivity table', unblock: 'Provide Treasury’s approved WACC, or accept the labeled 8% default assumption.' });
```

## 7. Rules for callers

- Never pass a real or placeholder numeric value alongside a gap state — if there's a number to show, this component doesn't apply; use the per-panel-type gap rendering in `CONVERGED-DASHBOARD-OPERATING-RULES.md` §1.3 instead (e.g. a financial model's unknown driver becomes a labeled default-assumption slider, not this chip, once a default exists — use `NEEDS_INPUT` only while no default is set).
- `missing` and `neededFor` are always specific ("Q3 spend by category," "the risk-weighted composite") — never generic ("data," "this section").
- Pick `UNAVAILABLE` only after the fallback ladder (source harder → ask once) has actually run; don't reach for it as a shortcut past asking the user.
- `RESEARCH_PENDING` implies the system will resolve this on its own (a queued materialized-artifact run, an async lookup) — if resolution actually depends on a person, that's `NEEDS_INPUT`, not `RESEARCH_PENDING`.
