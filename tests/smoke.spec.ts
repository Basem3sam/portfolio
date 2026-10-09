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

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("homepage renders the pitch with correct facts", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toContainText("Basem Esam");
  await expect(page.locator("#hero")).toContainText("100+");
  await expect(page.locator("#hero")).toContainText("200+");
  await expect(page.locator("#hero")).toContainText("95%+");
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

test("locked users unlock through the code entry area and on-screen keypad", async ({ page }) => {
  await page.goto("/");

  // Locked: the shortcut opens the code entry area, never the terminal
  await page.keyboard.press("Control+Shift+b");
  const enterButton = page.getByRole("button", { name: "Enter Konami Code" });
  await expect(enterButton).toBeVisible();

  await enterButton.click();

  // The complete mouse-only journey: solve the code on the on-screen keypad
  for (const key of ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"]) {
    await page.getByRole("button", { name: key, exact: true }).click();
  }

  await expect(page.locator("#secret-terminal")).toBeVisible();
});

test("konami code unlocks the terminal", async ({ page }) => {
  await page.goto("/");

  for (const key of KONAMI) {
    await page.keyboard.press(key);
  }

  await expect(page.locator("#secret-terminal")).toBeVisible();
});

test("terminal access resets when the page is refreshed", async ({ page }) => {
  await page.goto("/");

  for (const key of KONAMI) {
    await page.keyboard.press(key);
  }
  await expect(page.locator("#secret-terminal")).toBeVisible();

  await page.reload();
  await page.keyboard.press("Control+Shift+b");

  // Locked again: the shortcut opens the code entry area, not the terminal
  await expect(page.getByRole("button", { name: "Enter Konami Code" })).toBeVisible();
  await expect(page.locator("#secret-terminal")).not.toBeVisible();
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

test("scroll progress bar reaches exactly 100% at the bottom", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await page.waitForTimeout(500);
  }

  const width = await page
    .locator('[data-testid="scroll-progress"]')
    .evaluate((el) => el.style.width);
  expect(width).toBe("100%");
});

test("no permanent overlay is painted when the palette is closed", async ({ page }) => {
  await page.goto("/");

  const paintedOverlays = await page.evaluate(() => {
    const overlays = [];

    for (const el of document.querySelectorAll("body *")) {
      const style = getComputedStyle(el);
      if (style.position !== "fixed" && style.position !== "absolute") continue;
      if (el.closest("[inert], [aria-hidden='true']")) continue;
      if (style.opacity === "0" || style.visibility === "hidden") continue;

      const background = style.backgroundColor;
      const alpha =
        background.startsWith("rgba") && !background.endsWith(", 0)")
          ? Number(background.split(", ")[3]?.replace(")", ""))
          : background !== "transparent"
            ? 1
            : 0;

      if (alpha > 0) {
        const rect = el.getBoundingClientRect();
        if (rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9) {
          overlays.push(`${el.tagName}.${el.className?.toString().split(" ")[0]}`);
        }
      }
    }

    return overlays;
  });

  expect(paintedOverlays).toEqual([]);
});

test("hero metric values align on one line at every width", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const expectRowAligned = async (perRow: number) => {
    const tops = await page.locator('[data-testid="metric-value"]').evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().top),
    );
    expect(tops).toHaveLength(4);
    for (let i = 0; i < tops.length; i += perRow) {
      for (let j = 1; j < perRow; j += 1) {
        expect(Math.abs(tops[i + j] - tops[i])).toBeLessThanOrEqual(1);
      }
    }
  };

  await expectRowAligned(4);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectRowAligned(2);
  await page.setViewportSize({ width: 320, height: 568 });
  await expectRowAligned(2);
});

test("navbar highlights the section navigated to, not the previous one", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const experience = page.locator('nav a[href="#experience"]');
  await experience.click();

  // The destination section's link becomes current (aria-current="page")
  await expect(experience).toHaveAttribute("aria-current", "page");

  // And the previous section does NOT retain it
  const stack = page.locator('nav a[href="#stack"]');
  await expect(stack).not.toHaveAttribute("aria-current", "page");
});

test("scroll-spy tracks quick scrolling between consecutive sections", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Jump to the bottom - Contact must become active
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await expect(page.locator('nav a[href="#contact"]')).toHaveAttribute("aria-current", "page");

  // Jump back to the top region - no section should claim current
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator('nav a[href="#contact"]')).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});