import { expect, test } from "@playwright/test";

/** Hero + marquee (redesign phase 4). Needs a running app. */

test("h1 is two stacked lines but still reads as one name", async ({ page }) => {
  await page.goto("/");
  const h1 = page.locator("h1");
  await expect(h1).toContainText("Basem Esam");
  const lines = await h1.locator("span.block").evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().top)),
  );
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

test("marquee loops two identical rows; the copy is hidden from assistive tech", async ({ page }) => {
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
