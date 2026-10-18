import { expect, test } from "@playwright/test";

/** Work section (redesign phase 5). Needs a running app. */

test("TROSC is the featured card with its facts; the other four are rows", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#work article");
  // 5 projects, plus any live GitHub cards rendered below by GitHubProjects.
  await expect(cards.filter({ hasText: "trosc-backend" }).first()).toBeVisible();
  const featured = cards.filter({ hasText: "trosc-backend" }).first();
  for (const fact of ["100+", "12", "17", "200+"]) {
    await expect(featured.locator("dd", { hasText: fact }).first()).toBeVisible();
  }
  for (const name of ["store-advisor", "zabthalahak", "laravel-ecommerce-app", "neuroscan-ai"]) {
    await expect(page.locator("#work h3", { hasText: name })).toHaveCount(1);
  }
});

test("only the production project carries the status colour", async ({ page }) => {
  await page.goto("/");
  const trosc = page.locator("#work article").filter({ hasText: "trosc-backend" }).first();
  await expect(trosc.locator("span.text-status")).toContainText("production");
  for (const name of ["store-advisor", "zabthalahak", "laravel-ecommerce-app", "neuroscan-ai"]) {
    const row = page.locator("#work article").filter({ has: page.locator("h3", { hasText: name }) });
    await expect(row.locator("span.text-status")).toHaveCount(0);
  }
});

test("spotlight follows the pointer, including while the page scrolls under it", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "pointer emulation is only asserted in Chromium");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const card = page.locator("#work article").nth(1);
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + 120, box.y + 40);
  const mx = () => card.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--mx"));
  await expect.poll(mx).toBe("120px");

  const myBefore = await card.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--my"));
  await page.mouse.wheel(0, 30);
  await expect
    .poll(() => card.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--my")))
    .not.toBe(myBefore);
});

test("reduced motion removes the glow and edge bar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const display = await page
    .locator("#work article")
    .first()
    .evaluate((el) => getComputedStyle(el, "::before").display);
  expect(display).toBe("none");
});

test("Arabic work section shows translated provenance and stats", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("#work")).toContainText("عمل حر");
  await expect(page.locator("#work")).toContainText("نقطة نهاية");
});
