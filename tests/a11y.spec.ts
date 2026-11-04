import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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

test.use({ reducedMotion: "reduce" });

test.describe("accessibility", () => {
  test("homepage (en) has no axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("homepage (ar) has no axe violations", async ({ page }) => {
    await page.goto("/ar");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("case study has no axe violations", async ({ page }) => {
    await page.goto("/work/trosc");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("links page has no axe violations", async ({ page }) => {
    await page.goto("/links");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("command palette has no axe violations while open", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("open terminal has no axe violations", async ({ page }) => {
    await page.goto("/");

    test.setTimeout(150_000);

    // The konami listener attaches on hydration and nothing in the DOM marks
    // that, so keys typed too early are lost. Type the code until the egg
    // mounts, then give the terminal time to open.
    await expect(async () => {
      for (const key of KONAMI) {
        await page.keyboard.press(key);
      }
      await expect(page.locator(".egg").first()).toBeAttached({ timeout: 3_000 });
    }).toPass({ timeout: 45_000 });
    await expect(page.locator("#secret-terminal")).toBeVisible({ timeout: 45_000 });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
