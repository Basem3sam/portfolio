// TEMPORARY diagnostics: do not commit. Run:
//   npx playwright test tests/zz-diag.spec.ts --workers=1 --retries=0 --reporter=list
import { test } from "@playwright/test";

const scenarios: Array<{ name: string; url: string; reduce?: boolean; noWebgl?: boolean }> = [
  { name: "default", url: "/" },
  { name: "?perf=low", url: "/?perf=low" },
  { name: "reduced motion", url: "/", reduce: true },
  { name: "WebGL blocked", url: "/", noWebgl: true },
];

for (const sc of scenarios) {
  test(`rAF rate and main-thread blocking: ${sc.name}`, async ({ page }) => {
    test.setTimeout(60_000);
    if (sc.reduce) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((noWebgl) => {
      (window as unknown as { __long: number }).__long = 0;
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            (window as unknown as { __long: number }).__long += e.duration;
        }).observe({ entryTypes: ["longtask"] });
      } catch {}
      if (noWebgl) {
        const orig = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...rest: unknown[]
        ) {
          if (/webgl/i.test(type)) return null;
          return (orig as (...a: unknown[]) => unknown).call(this, type, ...rest) as never;
        } as typeof orig;
      }
    }, !!sc.noWebgl);
    await page.goto(sc.url);
    await page.waitForLoadState("networkidle");
    const r = await page.evaluate(
      () =>
        new Promise<{ fps: number; longTaskMs: number }>((resolve) => {
          const start = performance.now();
          const long0 = (window as unknown as { __long: number }).__long;
          let n = 0;
          const tick = () => {
            n++;
            if (performance.now() - start >= 5000) {
              resolve({
                fps: Math.round((n / 5) * 10) / 10,
                longTaskMs: Math.round((window as unknown as { __long: number }).__long - long0),
              });
            } else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
    console.log(`DIAG [${sc.name}] 5s idle:`, JSON.stringify(r));
  });
}

for (const width of [320, 1045]) {
  test(`hero rects at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const out = await page.evaluate(() => {
      const r = (s: string) => {
        const el = document.querySelector(s) as HTMLElement | null;
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return {
          left: +b.left.toFixed(1),
          top: +b.top.toFixed(1),
          w: +b.width.toFixed(1),
          h: +b.height.toFixed(1),
          tf: getComputedStyle(el).transform,
        };
      };
      return {
        view: document.documentElement.clientWidth,
        pf: r("#pf"),
        h1: r("#hero h1"),
        heroTop: r("#hero .hero-top"),
        heroBody: r("#hero .hero-body"),
      };
    });
    console.log(`DIAG hero ${width}px:`, JSON.stringify(out));
  });
}
