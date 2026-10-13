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
 * Note: measured against local `npm start`. Vercel serves brotli at the edge,
 * so the local `uses-text-compression` finding is expected to be smaller in
 * production; re-measure before moving any floor.
 */
module.exports = {
  ci: {
    collect: {
      // Requires a build first (`npm run build`); CI does that as a step,
      // locally run it before `npm run lighthouse`.
      startServerCommand: "npm start",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/ar",
        "http://localhost:3000/work/trosc",
        "http://localhost:3000/links",
      ],
      numberOfRuns: 3,
      settings: {
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        // Not meaningful against a single local server on one HTTP/1.1
        // connection; the production CDN negotiates HTTP/2. Removing it
        // would weaken nothing real - but it was already skipped, so this
        // is unchanged behaviour, not a new exemption.
        skipAudits: ["uses-http2"],
      },
    },
    assert: {
      // One entry per route. Every collected URL must match exactly one
      // pattern; a URL matching no entry would be asserted on nothing.
      assertMatrix: [
        {
          matchingUrlPattern: "^http://localhost:3000/$",
          assertions: {
            // Measured median 0.83 - floor set just under it (see header).
            "categories:performance": ["error", { minScore: 0.82 }],
            "categories:accessibility": ["error", { minScore: 1 }],
            "categories:best-practices": ["error", { minScore: 1 }],
            "categories:seo": ["error", { minScore: 1 }],
          },
        },
        {
          matchingUrlPattern: "^http://localhost:3000/ar$",
          assertions: {
            // Measured median 0.72 - floor set just under it (see header).
            "categories:performance": ["error", { minScore: 0.71 }],
            "categories:accessibility": ["error", { minScore: 1 }],
            "categories:best-practices": ["error", { minScore: 1 }],
            "categories:seo": ["error", { minScore: 1 }],
          },
        },
        {
          matchingUrlPattern: "^http://localhost:3000/work/trosc$",
          assertions: {
            // Measured median 0.87 - meets the 0.85 floor.
            "categories:performance": ["error", { minScore: 0.85 }],
            "categories:accessibility": ["error", { minScore: 1 }],
            "categories:best-practices": ["error", { minScore: 1 }],
            "categories:seo": ["error", { minScore: 1 }],
          },
        },
        {
          matchingUrlPattern: "^http://localhost:3000/links$",
          assertions: {
            // Measured median 0.91 - meets the 0.85 floor.
            "categories:performance": ["error", { minScore: 0.85 }],
            "categories:accessibility": ["error", { minScore: 1 }],
            "categories:best-practices": ["error", { minScore: 1 }],
            "categories:seo": ["error", { minScore: 1 }],
          },
        },
      ],
    },
  },
};
