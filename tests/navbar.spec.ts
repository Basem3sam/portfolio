import { expect, test } from "@playwright/test";

/**
 * Navbar capsule and progress rail (redesign phase 3). Needs a running app.
 * Same structural selector as smoke.spec.ts / ScrollManager.
 */
const NAVIGATOR = "nav[data-scrolled]";

const np = (page: import("@playwright/test").Page) =>
  page.locator(NAVIGATOR).evaluate((el) => Number.parseFloat(el.style.getPropertyValue("--np") || "0"));

test("capsule is driven by scroll: flat at the top, fully formed after the ramp", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect.poll(() => np(page)).toBe(0);

  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await expect.poll(() => np(page)).toBe(1);

  // Halfway through the ramp is an in-between state, not a jump.
  await page.evaluate(() => window.scrollTo({ top: 40, behavior: "instant" }));
  await expect.poll(() => np(page)).toBeGreaterThan(0.3);
  await expect.poll(() => np(page)).toBeLessThan(0.7);
});

test("progress rail fills with scroll and clears the controls above it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const rail = page.locator(`${NAVIGATOR} .nav-progress`);
  const fills = rail.locator("b");
  await expect(fills).toHaveCount(6);

  const width = async () =>
    fills.evaluateAll((els) => els.map((el) => Number.parseFloat((el as HTMLElement).style.width || "0")));

  expect((await width()).every((w) => w === 0)).toBe(true);

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect.poll(async () => (await width())[5]).toBeGreaterThan(50);
  expect((await width())[0]).toBe(100);

  // At least 4px between the rail and the lowest control (the old bug was ~1px).
  const gap = await page.evaluate(() => {
    const nav = document.querySelector("nav[data-scrolled]") as HTMLElement;
    const rail = nav.querySelector(".nav-progress") as HTMLElement;
    const controls = Array.from(nav.querySelectorAll<HTMLElement>("a, button")).filter(
      (el) => el.offsetParent !== null && el.getBoundingClientRect().height > 0,
    );
    const lowest = Math.max(...controls.map((el) => el.getBoundingClientRect().bottom));
    return rail.getBoundingClientRect().top - lowest;
  });
  expect(gap).toBeGreaterThanOrEqual(4);
});

test("xl shows one #contact link (the button); lg keeps the plain link", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator(NAVIGATOR).locator('a[href="#contact"]:visible')).toHaveCount(1);
  await expect(page.locator(NAVIGATOR).locator('a[href="#contact"]:visible')).toContainText(/talk/i);

  await page.setViewportSize({ width: 1024, height: 800 });
  await expect(page.locator(NAVIGATOR).locator('a[href="#contact"]:visible')).toHaveCount(1);
  await expect(page.locator(NAVIGATOR).locator('a[href="#contact"]:visible')).not.toContainText(/talk/i);
});

test("the Arabic bar fills from the right", async ({ page }) => {
  await page.goto("/ar");
  await page.waitForLoadState("networkidle");
  const fill = page.locator(`${NAVIGATOR} .nav-progress b`).first();
  const dir = await fill.evaluate((el) => getComputedStyle(el.parentElement!).direction);
  expect(dir).toBe("rtl");
});
