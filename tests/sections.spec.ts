import { expect, test } from "@playwright/test";

/** Remaining sections (redesign phase 6). Needs a running app. */

test("experience is a timeline: three entries, one current, case-study link on it", async ({
  page,
}) => {
  await page.goto("/");
  const entries = page.locator("#experience ol > li");
  await expect(entries).toHaveCount(3);
  await expect(entries.first()).toContainText("Current role");
  const link = entries.first().locator('a[href="/work/trosc"]');
  await expect(link).toBeVisible();
  await expect(entries.nth(1).locator("a")).toHaveCount(0);
  for (const chip of ["100+ endpoints", "50+ students", "Hackathons"]) {
    await expect(page.locator("#experience")).toContainText(chip);
  }
});

test("Arabic timeline links to the Arabic case study", async ({ page }) => {
  await page.goto("/ar");
  const link = page.locator('#experience a[href="/ar/work/trosc"]');
  await expect(link).toBeVisible();
  await expect(page.locator("#experience")).toContainText("الدور الحالي");
});

test("timeline dots sit on the rail in LTR and RTL", async ({ page }) => {
  for (const route of ["/", "/ar"]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);
    const ol = page.locator("#experience ol");
    await ol.scrollIntoViewIfNeeded();
    const rail = await ol.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const rtl = getComputedStyle(el).direction === "rtl";
      return rtl ? r.right - 18 : r.left + 18;
    });
    const dot = page.locator("#experience ol > li > span[aria-hidden]").first();
    const box = (await dot.boundingBox())!;
    expect(Math.abs(box.x + box.width / 2 - rail), route).toBeLessThanOrEqual(2);
  }
});

test("green is only for live things: About (incl. education) is not status-coloured", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#about .bg-status")).toHaveCount(0);
  await expect(page.locator("#about .bg-secondary")).toHaveCount(0);
});

test("no horizontal overflow in the lower sections at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ["/", "/ar"]) {
    await page.goto(route);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(over, route).toBeLessThanOrEqual(0);
  }
});
