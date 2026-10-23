import { expect, test } from "@playwright/test";

/** Hero + marquee (redesign phase 4). Needs a running app. */

test("h1 is two stacked lines but still reads as one name", async ({ page }) => {
  await page.goto("/");
  const h1 = page.locator("h1");
  await expect(h1).toContainText("Basem Esam");
  const lines = await h1
    .locator("span.block")
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
  expect(lines).toHaveLength(2);
  expect(lines[1]).toBeGreaterThan(lines[0]);
});

test("the name never overflows its column from 320px to desktop", async ({ page }) => {
  for (const width of [320, 375, 768, 992, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      const h1 = document.querySelector("h1") as HTMLElement;
      return h1.scrollWidth - h1.clientWidth;
    });
    expect(overflow, `width ${width}`).toBeLessThanOrEqual(0);
    const page_overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(page_overflow, `page width ${width}`).toBeLessThanOrEqual(0);
  }
});

test("Arabic hero stacks the name and keeps a visible role line", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("h1")).toContainText("باسم عصام");
  await expect(page.locator("#hero")).toContainText("مهندس Backend");
});

test("phone is a visible, tappable number in the hero", async ({ page }) => {
  await page.goto("/");
  const tel = page.locator('#hero a[href="tel:+201123505981"]');
  await expect(tel).toBeVisible();
  await expect(tel).toContainText("+20 112 350 5981");
});

test("marquee loops two identical rows; the copy is hidden from assistive tech", async ({
  page,
}) => {
  await page.goto("/");
  const track = page.locator("main > div").first().locator("ul");
  await expect(track).toHaveCount(2);
  await expect(track.nth(1)).toHaveAttribute("aria-hidden", "true");
  await expect(track.first()).toContainText("Node.js");
});

test("reduced motion stops the marquee", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const name = await page
    .locator("main > div")
    .first()
    .locator("ul")
    .first()
    .evaluate((el) => getComputedStyle(el.parentElement as HTMLElement).animationName);
  expect(name).toBe("none");
});

test("status ticket text stays readable on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const sizes = await page.evaluate(() => {
    const px = (selector: string) =>
      parseFloat(getComputedStyle(document.querySelector(selector) as HTMLElement).fontSize);
    return { key: px("#hero .hb-k"), detail: px("#hero .hb-t small") };
  });
  expect(sizes.key).toBeGreaterThanOrEqual(8);
  expect(sizes.detail).toBeGreaterThanOrEqual(10);
});

test("phone hero actions and contact row share one left and right edge", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const edges = await page.evaluate(() => {
    const rects = (selector: string) =>
      [...document.querySelectorAll(selector)].map((el) => el.getBoundingClientRect());
    const ctas = rects("#hero .actions .btn");
    const reach = rects("#hero .reach > *");
    return {
      ctaLeft: Math.min(...ctas.map((r) => r.left)),
      ctaRight: Math.max(...ctas.map((r) => r.right)),
      reachLeft: reach[0].left,
      reachRight: reach[reach.length - 1].right,
      sameRow: new Set(reach.map((r) => Math.round(r.top))).size === 1,
    };
  });
  expect(Math.abs(edges.reachLeft - edges.ctaLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(edges.reachRight - edges.ctaRight)).toBeLessThanOrEqual(1);
  expect(edges.sameRow).toBe(true);
});

test("desktop hero actions and contact row share edges and the centre gutter", async ({ page }) => {
  for (const width of [992, 1100, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const m = await page.evaluate(() => {
      const rects = (selector: string) =>
        [...document.querySelectorAll(selector)].map((el) => el.getBoundingClientRect());
      const [primary, ghost] = rects("#hero .actions .btn");
      const [tel, ...tiles] = rects("#hero .reach > *");
      const telEl = document.querySelector("#hero .reach .tel") as HTMLElement;
      return {
        outerLeft: [primary.left, tel.left],
        outerRight: [ghost.right, tiles[tiles.length - 1].right],
        // the phone tile ends where the primary button ends, and the three
        // icon tiles start where the ghost button starts
        primaryRight: [primary.right, tel.right],
        ghostLeft: [ghost.left, tiles[0].left],
        sameRow:
          new Set(tiles.map((r) => Math.round(r.top)).concat(Math.round(tel.top))).size === 1,
        telFits: telEl.scrollWidth <= telEl.clientWidth + 1,
      };
    });
    for (const [a, b] of [m.outerLeft, m.outerRight, m.primaryRight, m.ghostLeft]) {
      expect(Math.abs(a - b), `edge mismatch at ${width}px`).toBeLessThanOrEqual(1);
    }
    expect(m.sameRow).toBe(true);
    expect(m.telFits).toBe(true);
  }
});

test("status ticket uses one compact shape from 320px to 991px and stays inside the portrait", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 412, 430, 475, 520, 768, 991]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const t = await page.evaluate(() => {
      const hb = document.querySelector("#hero .hire-b") as HTMLElement;
      const pf = document.querySelector("#hero .pf") as HTMLElement;
      return {
        w: hb.getBoundingClientRect().width,
        frame: pf.getBoundingClientRect().width,
        squiggle: getComputedStyle(hb.querySelector(".hb-sq") as Element).display,
        maxWidth: getComputedStyle(hb).maxWidth,
        hscroll: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    // no step at a container breakpoint: the squiggle is off at every width
    expect(t.squiggle, `squiggle at ${width}px`).toBe("none");
    expect(t.w, `ticket inside the frame at ${width}px`).toBeLessThanOrEqual(t.frame * 0.94 + 1);
    expect(t.hscroll, `horizontal scroll at ${width}px`).toBe(false);
  }
});

test("below 992px the portrait stays on screen, centred, and lines up with the text column", async ({
  page,
}) => {
  const sizes: number[] = [];
  for (const width of [320, 360, 390, 430, 500, 528, 600, 768, 991]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const m = await page.evaluate(() => {
      const pf = (document.querySelector("#pf") as HTMLElement).getBoundingClientRect();
      const h1 = (document.querySelector("#hero h1") as HTMLElement).getBoundingClientRect();
      const view = document.documentElement.clientWidth;
      return {
        w: Math.round(pf.width),
        left: pf.left,
        right: view - pf.right,
        off: Math.abs(pf.left + pf.width / 2 - view / 2),
        edge: Math.abs(pf.left - h1.left),
      };
    });
    expect(m.left, `left ${width}`).toBeGreaterThanOrEqual(0);
    expect(m.right, `right ${width}`).toBeGreaterThanOrEqual(0);
    expect(m.off, `centre ${width}`).toBeLessThanOrEqual(2);
    expect(m.edge, `edge ${width}`).toBeLessThanOrEqual(1);
    if (width >= 528) sizes.push(m.w);
  }
  expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
});

test("below 992px every text block sits on one left edge", async ({ page }) => {
  for (const width of [390, 600, 768, 991]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const edges = await page.evaluate(() => {
      const left = (selector: string) =>
        Math.round((document.querySelector(selector) as HTMLElement).getBoundingClientRect().left);
      return {
        name: left("#hero h1"),
        lead: left("#hero .lead"),
        cta: left("#hero .actions .btn"),
        align: getComputedStyle(document.querySelector(".hero-top") as HTMLElement).textAlign,
      };
    });
    expect(edges.align, `width ${width}`).not.toBe("center");
    expect(Math.abs(edges.lead - edges.name), `lead ${width}`).toBeLessThanOrEqual(1);
    expect(Math.abs(edges.cta - edges.name), `cta ${width}`).toBeLessThanOrEqual(1);
  }
});

test("from 992px the copy and the portrait sit side by side", async ({ page }) => {
  await page.setViewportSize({ width: 992, height: 800 });
  await page.goto("/");
  const gap = await page.evaluate(() => {
    const h1 = (document.querySelector("h1") as HTMLElement).getBoundingClientRect();
    const pf = (document.querySelector("#pf") as HTMLElement).getBoundingClientRect();
    return pf.left - h1.right;
  });
  expect(gap).toBeGreaterThan(0);
});

test("the side-by-side portrait holds one size from 992px to 1199px", async ({ page }) => {
  const sizes: number[] = [];
  for (const width of [992, 1045, 1100, 1199]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    sizes.push(
      await page.evaluate(() => (document.querySelector("#pf") as HTMLElement).offsetWidth),
    );
  }
  expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
});
