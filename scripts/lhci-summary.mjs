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

/*
 * Diagnostics: for each route, the run whose performance score is the median,
 * so the table above can be explained instead of only reported. Everything is
 * read defensively (audit shapes vary between Lighthouse versions); a missing
 * audit just drops its line.
 */
const short = (url) => {
  try {
    const u = new URL(url);
    return u.pathname.length > 56 ? `...${u.pathname.slice(-53)}` : u.pathname;
  } catch {
    return String(url ?? "").slice(0, 56);
  }
};
const items = (lhr, id) => lhr.audits[id]?.details?.items ?? [];

console.log("\n### Diagnostics (median run per route)\n");
for (const [path, runs] of [...byRoute].sort(([a], [b]) => a.localeCompare(b))) {
  const scores = runs.map((lhr) => score(lhr, "performance") ?? 0).sort((a, b) => a - b);
  const mid = scores[Math.floor(scores.length / 2)];
  const lhr = runs.find((r) => (score(r, "performance") ?? 0) === mid) ?? runs[0];

  console.log(`<details><summary><code>${path}</code></summary>\n`);

  // The real (unthrottled) paint times from the trace. The table above is the
  // simulated phone; if these are far smaller, the delay is the simulation.
  const real = items(lhr, "metrics")[0];
  if (real) {
    const parts = [
      ["first paint", real.observedFirstPaint],
      ["FCP", real.observedFirstContentfulPaint],
      ["LCP", real.observedLargestContentfulPaint],
      ["DOMContentLoaded", real.observedDomContentLoaded],
      ["load", real.observedLoad],
    ]
      .filter(([, v]) => typeof v === "number")
      .map(([name, v]) => `${name} ${Math.round(v)} ms`);
    if (parts.length) console.log(`**Observed (real) timings:** ${parts.join(", ")}\n`);
  }

  const longTasks = items(lhr, "long-tasks");
  if (longTasks.length) {
    const blocking = longTasks.reduce((sum, t) => sum + Math.max(0, (t.duration ?? 0) - 50), 0);
    console.log(
      `**Long tasks:** ${longTasks.length} (>50 ms), ${Math.round(blocking)} ms over the 50 ms budget`,
    );
    const worst = [...longTasks].sort((a, b) => b.duration - a.duration).slice(0, 5);
    for (const t of worst) {
      console.log(`- ${Math.round(t.duration)} ms at ${Math.round(t.startTime)} ms: ${short(t.url)}`);
    }
    console.log("");
  } else {
    console.log("**Long tasks:** none reported\n");
  }

  const bootup = items(lhr, "bootup-time")
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
    .slice(0, 6);
  if (bootup.length) {
    console.log("**Script cost (total / scripting / parse):**");
    for (const b of bootup) {
      console.log(
        `- ${short(b.url)}: ${Math.round(b.total ?? 0)} / ${Math.round(b.scripting ?? 0)} / ${Math.round(b.scriptParseCompile ?? 0)} ms`,
      );
    }
    console.log("");
  }

  const work = items(lhr, "mainthread-work-breakdown")
    .filter((g) => (g.duration ?? 0) >= 20)
    .map((g) => `${g.groupLabel ?? g.group} ${Math.round(g.duration)} ms`);
  if (work.length) console.log(`**Main thread:** ${work.join(", ")}\n`);

  const lcp = lhr.audits["largest-contentful-paint-element"]?.details?.items ?? [];
  const lcpNode = lcp[0]?.items?.[0]?.node;
  if (lcpNode) console.log(`**LCP element:** \`${lcpNode.selector ?? lcpNode.snippet ?? "?"}\``);
  const phases = lcp.find((i) => Array.isArray(i.items) && i.items[0]?.phase)?.items ?? [];
  if (phases.length) {
    console.log(
      `**LCP phases:** ${phases.map((p) => `${p.phase} ${Math.round(p.timing ?? 0)} ms`).join(", ")}`,
    );
  }

  // What the first paint waited on: fonts and stylesheets with their timing
  // (ms since navigation start), and the render-blocking list. Explains a long
  // "Render Delay" in the LCP phases.
  const requests = items(lhr, "network-requests")
    .filter((r) => r.resourceType === "Font" || r.resourceType === "Stylesheet")
    .sort((a, b) => (a.networkRequestTime ?? 0) - (b.networkRequestTime ?? 0));
  if (requests.length) {
    console.log("\n**Fonts and stylesheets (start -> end, size):**");
    for (const r of requests) {
      console.log(
        `- ${r.resourceType} ${short(r.url)}: ${Math.round(r.networkRequestTime ?? 0)} -> ${Math.round(r.networkEndTime ?? 0)} ms, ${Math.round((r.transferSize ?? 0) / 1024)} KiB`,
      );
    }
  }
  const blocking = items(lhr, "render-blocking-resources");
  if (blocking.length) {
    console.log(
      `\n**Render-blocking:** ${blocking.map((b) => `${short(b.url)} (${Math.round(b.wastedMs ?? 0)} ms)`).join(", ")}`,
    );
  }

  const unused = lhr.audits["unused-javascript"]?.details?.items ?? [];
  const unusedBytes = unused.reduce((sum, i) => sum + (i.wastedBytes ?? 0), 0);
  if (unusedBytes) console.log(`\n**Unused JavaScript:** ~${Math.round(unusedBytes / 1024)} KiB`);

  console.log("\n</details>\n");
}
