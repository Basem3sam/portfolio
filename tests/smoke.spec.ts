import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("homepage renders the pitch with correct facts", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toContainText("Basem Esam");
  await expect(page.locator("#hero")).toContainText("85+");
  await expect(page.locator("#hero")).toContainText("200+");
  await expect(page.locator("#work")).toContainText("trosc-backend");
  await expect(page.locator("#work")).toContainText("production");
});

test("skip link focuses main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("theme toggle flips the class and persists across reload", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator("#darkModeToggle");
  await toggle.click();
  await expect(page.locator("body")).toHaveClass(/dark-mode/);
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/dark-mode/);
  await toggle.click();
  await expect(page.locator("body")).not.toHaveClass(/dark-mode/);
});

test("language switcher flips direction and content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "العربية", exact: true }).click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("h1")).toContainText("باسم عصام");
});

test("command palette opens, filters, and navigates", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();

  const input = dialog.getByRole("combobox");
  await expect(input).toBeFocused();

  await input.fill("stack");
  const option = dialog.getByRole("option", { name: "Stack" });
  await expect(option).toHaveCount(1);
  await option.click();

  await expect(page.locator("#stack")).toBeInViewport();
});

test("palette escape closes and returns focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search & commands" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("keyboard shortcut opens the hidden terminal", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Control+Shift+b");
  const terminal = page.locator("#secret-terminal");
  await expect(terminal).toBeVisible();

  const input = page.locator("#terminal-input");
  await expect(input).toBeAttached();
  await input.fill("help");
  await input.press("Enter");
  await expect(page.locator("#terminal-output")).toContainText("Available Commands");
  await input.fill("exit");
  await input.press("Enter");
  await expect(terminal).not.toBeVisible();
});

test("konami code unlocks the terminal", async ({ page }) => {
  await page.goto("/");

  for (const key of [
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
  ]) {
    await page.keyboard.press(key);
  }

  await expect(page.locator("#secret-terminal")).toBeVisible();
});

test("terminal unlock persists in localStorage", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+Shift+b");
  await expect(page.locator("#secret-terminal")).toBeVisible();

  await page.reload();
  const stored = await page.evaluate(() => localStorage.getItem("terminal_unlocked"));
  expect(stored).toBe("1");
});

test("contact exposes a tap-to-call phone link", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('#contact a[href="tel:+201123505981"]')).toBeVisible();
});

test("links page renders all cards including phone", async ({ page }) => {
  await page.goto("/links");
  await expect(page.getByRole("link", { name: "Call me" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download Resume" })).toBeVisible();
});

test("unknown route shows the bilingual 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main")).toContainText("Page not found");
  await expect(page.locator("main")).toContainText("الصفحة غير موجودة");
});

test("print emulation forces light colors in dark mode", async ({ page }) => {
  await page.goto("/");
  await page.locator("#darkModeToggle").click();
  await expect(page.locator("body")).toHaveClass(/dark-mode/);

  await page.emulateMedia({ media: "print" });
  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await expect(bgColor).toBe("rgb(255, 255, 255)");
});