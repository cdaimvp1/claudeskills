# Deal #16 — full-tab verification and malicious-code sweep

Run 2026-07-28 against the built artifacts in
`C:\Users\marcs\OneDrive\Desktop\dashboards\` and the source trees. This is the
gate on #17, which locks the Deal dashboard.

---

## 1. Full-tab verification — PASS

Every tab and subtab driven in a live browser, not read from source.

| Screen | Text | Cards |
|---|---|---|
| Overview | 6,053 | 7 |
| Terms & Review · Documents & Conflicts | 2,850 | 13 |
| Terms & Review · Legal & Protection | 6,172 | 13 |
| Terms & Review · Scope & Performance | 6,282 | 13 |
| Terms & Review · Sources & Evidence | 1,526 | 13 |
| Economics · Deal Table & ZOPA | 4,828 | 10 |
| Economics · Financial Model | 2,843 | 10 |
| Negotiation · Positions | 4,226 | 5 |
| Negotiation · Trade Plan | 2,841 | 5 |
| Negotiation · Communications | 1,973 | 5 |

- **10 of 10 screens render.** None empty, none throwing.
- **0 JavaScript errors** across the full traversal.
- **No `[object Object]`, no `NaN`, no leaked `undefined`.**

One flagged hit was checked by hand and is a **false positive**: Scope &
Performance uses the English word "undefined" correctly, in "2 undefined
acceptance", "of 4 acceptance gates undefined" and "acceptance AC-4 undefined".
That is the panel describing acceptance criteria that have not been defined, not
a JavaScript value leaking into the page.

Type renders at 9 / 11 / 13 / 16 / 20 / 28. Deal keeps 9 and 16; the reduction to
11/13/20/28 was applied to Category Strategy only, on Marc's instruction about
that dashboard. Not a defect against #16.

Interactive behaviour confirmed the same session:
- Positions severity filter: 12 to 2 hard-stop, 12 to 7 high, counts follow,
  selection stays visible, All restores 12.
- Communications: search 12 to 2, search plus status 12 to 1, no-match shows the
  stated empty message, clearing restores 12.

---

## 2. Malicious-code sweep — PASS, nothing found

Scope: the four built artifacts, plus `deal-room-1c344a/dashboard/_parts`,
`_rfx_build/assets/pv`, `supplier-landscape-1c344a/dashboard/assets/pv`,
`_platform_build/assets/pv` and `_category_build/assets`.

| Check | Result |
|---|---|
| Network egress: `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, dynamic `import()` | **0** in every artifact and every source file |
| Code execution: `eval(`, `new Function(`, `document.write(` | **0** |
| String-bodied `setTimeout` / `setInterval` | **0** |
| Credential-shaped literals (api key, secret, password, bearer, authorization, private key) | **0** |
| External `<script src>` / `<link href="http">` | **0** |
| Auto-loaded external resources (`img`/`script`/`link`/`iframe`/`embed`/`object`/`source` pointing at http) | **0** |
| Inline event handlers referencing an off-page URL | **0** |

**External URLs present, and why they are inert.** The Category Strategy artifact
contains 14 external URLs. Every one is a market-research citation I added, and
every one is an `<a href target="_blank" rel="noopener">` anchor. None is a
resource reference, so none is fetched unless a reader deliberately clicks it.
No other artifact carries an external URL.

**Encoded payloads.** Every `data:` URI across all four artifacts is an asset and
nothing else: 45 to 59 `data:font/woff2` per file, and 2 to 3 `data:image/png`
(the Lilly logo and the Theo dino). **Zero data URIs of any other type**, which is
where an obfuscated payload would have to hide.

SQL injection is not applicable: there is no database, no query construction and
no server. These are static single-file artifacts.

---

## Verdict

#16 passes on both halves. #17 — lock and commit the Deal dashboard — is not
blocked by this gate.

Still open on Deal, and none of it blocks the lock: the six judgment calls parked
for Marc (L&P group bands versus per-row tag; boot auto-expand; Protection-
Scorecard 8-category spine versus 26-row union; Cross-Doc "Open Document Risks"
reframe; Document Family Register click-to-open; #13 Next-Session Brief re-home
or drop).
