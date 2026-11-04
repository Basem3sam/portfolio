/**
 * Prints a Markdown table of the Lighthouse CI results in `.lighthouseci/`:
 * per route, the MEDIAN of the runs for each score and the metrics that
 * explain performance (FCP, LCP, TBT). CI appends it to the job summary so a
 * failing floor comes with the numbers needed to re-base it.
 *
 * Usage: node scripts/lhci-summary.mjs [dir]   (dir defaults to .lighthouseci)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? ".lighthouseci";

function median(values) {
  const sorted = values.filter((v) => typeof v === "number").sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const byRoute = new Map();
let files = [];
try {
  files = readdirSync(dir).filter((name) => /^lhr-.*\.json$/.test(name));
} catch {
  // No directory: nothing ran. Fall through to the "no results" message.
}

for (const name of files) {
  const lhr = JSON.parse(readFileSync(join(dir, name), "utf8"));
  const path = new URL(lhr.finalUrl ?? lhr.requestedUrl).pathname;
  const runs = byRoute.get(path) ?? [];
  runs.push(lhr);
  byRoute.set(path, runs);
}

if (byRoute.size === 0) {
  console.log("### Lighthouse\n\nNo results were collected.");
  process.exit(0);
}

const score = (lhr, id) => lhr.categories[id]?.score ?? null;
const metric = (lhr, id) => lhr.audits[id]?.numericValue ?? null;
const pct = (v) => (v === null ? "n/a" : v.toFixed(2));
const ms = (v) => (v === null ? "n/a" : `${Math.round(v)} ms`);

console.log("### Lighthouse (median of runs)\n");
console.log("| Route | Runs | Perf | A11y | Best practices | SEO | FCP | LCP | TBT |");
console.log("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");

for (const [path, runs] of [...byRoute].sort(([a], [b]) => a.localeCompare(b))) {
  const m = (pick) => median(runs.map(pick));
  const perfRuns = runs.map((lhr) => pct(score(lhr, "performance"))).join(", ");
  console.log(
    `| \`${path}\` | ${runs.length} | **${pct(m((l) => score(l, "performance")))}** (${perfRuns}) ` +
      `| ${pct(m((l) => score(l, "accessibility")))} | ${pct(m((l) => score(l, "best-practices")))} ` +
      `| ${pct(m((l) => score(l, "seo")))} | ${ms(m((l) => metric(l, "first-contentful-paint")))} ` +
      `| ${ms(m((l) => metric(l, "largest-contentful-paint")))} | ${ms(m((l) => metric(l, "total-blocking-time")))} |`,
  );
}
