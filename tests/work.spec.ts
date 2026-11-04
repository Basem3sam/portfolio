import { expect, test } from "@playwright/test";

/** Work section (redesign phase 5). Needs a running app. */

test("TROSC is the featured card with its facts; the other four are rows", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#work article");
  // 5 projects, plus any live GitHub cards rendered below by GitHubProjects.
  await expect(cards.filter({ hasText: "trosc-backend" }).first()).toBeVisible();
  const featured = cards.filter({ hasText: "trosc-backend" }).first();
  for (const fact of ["100+", "12", "17", "200+"]) {
    // WorkStat resets each figure to 0 after hydration and counts up once it is
    // mostly on screen, so bring the card's facts into view before reading them.
    await featured.locator(".fact").first().scrollIntoViewIfNeeded();
    await expect(featured.locator("dd", { hasText: fact }).first()).toBeVisible({
      timeout: 15_000,
    });
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
    const row = page
      .locator("#work article")
      .filter({ has: page.locator("h3", { hasText: name }) });
    await expect(row.locator("span.text-status")).toHaveCount(0);
  }
});

test("spotlight follows the pointer, including while the page scrolls under it", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "pointer emulation is only asserted in Chromium");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const card = page.locator("#work article").nth(1);
  await card.scrollIntoViewIfNeeded();
  const mx = () => card.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--mx"));
  // Re-send the move from the card's current position each attempt: the card
  // can still be settling (scroll story) and a single move may land elsewhere.
  await expect
    .poll(
      async () => {
        const box = (await card.boundingBox())!;
        // scrollIntoViewIfNeeded can leave a tall card's top edge above the
        // viewport or under the navbar, and the mouse cannot reach a point
        // outside the viewport. Aim at a point of the card that is on screen.
        const y = Math.min(Math.max(box.y + 40, 110), box.y + box.height - 20, 780);
        await page.mouse.move(box.x + 100, y);
        await page.mouse.move(box.x + 120, y);
        return mx();
      },
      { timeout: 15_000 },
    )
    .toBe("120px");

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
