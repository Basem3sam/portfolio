import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
    await page.keyboard.press("Control+Shift+b");
    await expect(page.locator("#secret-terminal")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});