/**
 * Lighthouse CI configuration.
 *
 * IMPORTANT - threshold policy (owner decision, 2026-10-13):
 *   - Accessibility, best-practices and SEO stay at 1.0 on every route.
 *   - Performance is asserted PER ROUTE with `assertMatrix` (JSON cannot
 *     carry comments, which is why this file is `.js`).
 *   - Floors were set from a fresh build of HEAD 96722a6, 3 runs per route,
 *     asserting on LHCI's median run (measured 2026-10-13, local `npm start`):
 *
 *       route          median perf   LCP      TBT     floor now
 *       /              0.83          3867ms   180ms   0.82  (below 0.85)
 *       /ar            0.72          5239ms   239ms   0.71  (below 0.85)
 *       /work/trosc    0.87          3935ms    89ms   0.85  (meets 0.85)
 *       /links         0.91          3470ms    55ms   0.85  (meets 0.85)
 *
 *   - Routes below 0.85 get a floor just under their measured median so CI
 *     reports regressions truthfully instead of failing on day one. They are
 *     NOT hidden: `/` and `/ar` are below 0.85 today and the ratchet plan
 *     below states how each is expected to climb.
 *
 * RATCHET PLAN (raise a floor only after its target is measured):
 *   Stage 1 (visual redesign pass)   / -> 0.85,  /ar -> 0.80
 *     - `/`:   LCP 3867ms dominates (LCP audit 0.53). Give the hero LCP
 *              image explicit dimensions + preload/priority so it is not
 *              discovered late under mobile throttling. Target LCP <= 3000ms.
 *     - `/ar`: LCP 5239ms / FCP 2439ms. The three Arabic IBM Plex woff2
 *              files (~107KB extra vs English routes; 607KB vs 409KB total
 *              transfer) are not preloaded - layout.tsx deliberately sets
 *              `preload: false` so English routes skip them, and `/ar` then
 *              pays the fetch late and re-renders after swap. Make the
 *              preload locale-conditional and subset the weights actually
 *              used. Target FCP <= 1600ms, LCP <= 4000ms.
 *   Stage 2 (performance pass)       all routes -> 0.90
 *     - Cut TBT (180ms `/`, 239ms `/ar`) by deferring hydration of
 *       non-critical islands (command palette, reveal-on-scroll,
 *       easter-egg terminal) and trimming the unused JavaScript that the
 *       diagnostics audits flag. Target TBT <= 100ms everywhere.
 *   Stage 3 (hardening)              all routes -> 0.95
 *     - Only after the Stage 1/2 targets are measured. Per owner decision:
 *       never at the cost of essential design or function.
 *
 * WHERE IT RUNS (changed 2026-11-04):
 *   - CI: against the Vercel PREVIEW deployment (`.github/workflows/lighthouse.yml`
 *     sets LHCI_BASE_URL). That is the real edge: brotli, HTTP/2, CDN caching,
 *     so scores are closer to what visitors get and less dependent on one
 *     local server. No build runs in CI for this job.
 *   - Local: `npm run build && npm run lighthouse` (no LHCI_BASE_URL) serves
 *     the build with `npm start`, as before.
 *   - 5 runs per route, asserted on the MEDIAN score. The default (optimistic)
 *     passes on the single best run, which hides regressions.
 *   - The floors below were measured locally / on a GitHub runner against
 *     `npm start`, NOT against a preview. The first preview run is a
 *     calibration run: re-base each floor on its median (the job summary
 *     prints it), then ratchet as planned above.
 */

const BASE_URL = (process.env.LHCI_BASE_URL || "").replace(/\/+$/, "");
const REMOTE = BASE_URL !== "";
const ORIGIN = REMOTE ? BASE_URL : "http://localhost:3000";

/** Same four routes either way; `ORIGIN` is the only thing that changes. */
const ROUTES = ["/", "/ar", "/work/trosc", "/links"];

/**
 * One assertion set per route. Accessibility and best-practices are 1.0
 * everywhere; only the performance floor differs. SEO is skipped on preview
 * deployments because Vercel previews are intentionally noindexed. Every
 * collected URL must match exactly one pattern, so each is anchored to
 * `scheme://host` + path.
 */
function route(path, perfFloor) {
  const escaped = path.replace(/[/]/g, "\\/");
  return {
    matchingUrlPattern: `^https?:\\/\\/[^/]+${escaped}$`,
    // "median" = the median of the 5 category scores. ("median-run" is ignored
    // by LHCI for `categories:*` assertions, which would silently fall back to
    // the best run.)
    aggregationMethod: "median",
    assertions: {
      "categories:performance": ["error", { minScore: perfFloor }],
      "categories:accessibility": ["error", { minScore: 1 }],
      "categories:best-practices": ["error", { minScore: 1 }],
      ...(REMOTE ? {} : { "categories:seo": ["error", { minScore: 1 }] }),
    },
  };
}

module.exports = {
  ci: {
    collect: {
      // Local runs only: needs a build first (`npm run build`). In CI the
      // site is already deployed, so there is no server to start.
      ...(REMOTE ? {} : { startServerCommand: "npm start" }),
      url: ROUTES.map((path) => `${ORIGIN}${path}`),
      numberOfRuns: 5,
      settings: {
        onlyCategories: REMOTE
          ? ["performance", "accessibility", "best-practices"]
          : ["performance", "accessibility", "best-practices", "seo"],
        // A single local server speaks HTTP/1.1, so the audit is meaningless
        // there. A Vercel deployment negotiates HTTP/2, so it stays on.
        skipAudits: REMOTE ? [] : ["uses-http2"],
      },
    },
    assert: {
      assertMatrix: [
        // Re-based 2026-11-04: a GitHub runner measured 0.62 / 0.77 / 0.67
        // here against `npm start` (local median was 0.83).
        route("/", 0.65),
        // Local median 0.72; floor just under it (see header).
        route("/ar", 0.71),
        // Local median 0.87 / 0.91; both meet the 0.85 floor.
        route("/work/trosc", 0.85),
        route("/links", 0.85),
      ],
    },
  },
};
