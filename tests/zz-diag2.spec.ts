// TEMPORARY diagnostics: do not commit. Copy to tests/zz-diag2.spec.ts and run:
//   npx playwright test tests/zz-diag2.spec.ts --workers=1 --retries=0 --reporter=list
// Paste the whole console output back.
import { test, type Page } from "@playwright/test";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const installProbes = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __long: number; __raf: number };
    w.__long = 0;
    w.__raf = 0;
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) w.__long += e.duration;
      }).observe({ entryTypes: ["longtask"] });
    } catch {}
    const loop = () => {
      w.__raf++;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

// One snapshot; rAF and long-task counters are deltas since the previous one.
const snap = (page: Page, sel: string) =>
  page.evaluate((selector) => {
    const w = window as unknown as {
      __long: number;
      __raf: number;
      __p?: [number, number, number];
    };
    const now = performance.now();
    const prev = w.__p ?? [now, 0, 0];
    const secs = Math.max((now - prev[0]) / 1000, 0.001);
    const out = {
      perf: document.documentElement.dataset.perf,
      fps: Math.round((w.__raf - prev[1]) / secs),
      longMs: Math.round(w.__long - prev[2]),
      anims: document.getAnimations().length,
      el: "",
    };
    w.__p = [now, w.__raf, w.__long];
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      const cs = getComputedStyle(el);
      out.el = `${el.className} | vis=${cs.visibility} op=${cs.opacity}`;
    } else out.el = "(missing)";
    return out;
  }, sel);

for (const url of ["/", "/?perf=high"]) {
  test(`terminal after Konami: ${url}`, async ({ page }) => {
    test.setTimeout(90_000);
    await installProbes(page);
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    console.log(`T[${url}] idle`, JSON.stringify(await snap(page, ".eov")));
    await page.waitForTimeout(8000);
    console.log(`T[${url}] idle+8s`, JSON.stringify(await snap(page, ".eov")));
    for (const key of KONAMI) await page.keyboard.press(key);
    for (let i = 1; i <= 16; i++) {
      await page.waitForTimeout(1000);
      console.log(`T[${url}] +${i}s`, JSON.stringify(await snap(page, ".egg .eov")));
    }
  });

  test(`spotlight: ${url}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await installProbes(page);
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    const card = page.locator("#work article").nth(1);
    await card.scrollIntoViewIfNeeded();
    for (let i = 1; i <= 8; i++) {
      const box = (await card.boundingBox())!;
      await page.mouse.move(box.x + 100, box.y + 40);
      await page.mouse.move(box.x + 120, box.y + 40);
      await page.waitForTimeout(700);
      const info = await page.evaluate(
        ([x, y]) => {
          const vp = { sy: Math.round(scrollY), ih: innerHeight, iw: innerWidth };
          const hit = document.elementFromPoint(x, y) as HTMLElement | null;
          return {
            vp,
            box: [Math.round(x), Math.round(y)],
            hit: hit ? `${hit.tagName}.${String(hit.className).slice(0, 40)}` : "none",
            insideCard: !!hit?.closest("#work article"),
          };
        },
        [box.x + 120, box.y + 40],
      );
      const mx = await card.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--mx"));
      console.log(
        `S[${url}] try${i}`,
        JSON.stringify({ mx, ...info, ...(await snap(page, "#work")) }),
      );
    }
  });
}
