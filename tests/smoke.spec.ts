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

/**
 * The main navbar, matched structurally rather than by accessible name: the
 * footer nav shares the role, and the Arabic locale localises the label. This
 * is the same selector `ScrollManager` and `getNavbarHeight()` rely on.
 */
const NAVIGATOR = "nav[data-scrolled]";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("homepage renders the pitch with correct facts", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toContainText("Basem Esam");
  // The hero leads with role + availability (the status ticket), not numbers.
  await expect(page.locator("#hero")).toContainText("Backend engineer");
  await expect(page.locator("#hero")).toContainText("Open to work");
  // The verified figures live with the work they describe — the featured
  // project's KPI wall (100+ endpoints, 200+ members, 94.8% coverage).
  await expect(page.locator("#work")).toContainText("trosc-backend");
  await expect(page.locator("#work")).toContainText("production");
  for (const fact of ["100+", "200+", "94.8%"]) {
    await expect(page.locator("#work")).toContainText(fact);
  }
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
  // Ten keypad clicks, each waiting for the button to settle, plus the
  // overlay's entrance: the default 30s budget is not enough for the whole
  // journey on a machine without a GPU. The assertions are unchanged.
  test.setTimeout(90_000);

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

test("the navbar progress rail is the only scroll indicator and completes at the bottom", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // The old standalone top bar is gone.
  await expect(page.locator('[data-testid="scroll-progress"]')).toHaveCount(0);

  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await page.waitForTimeout(500);
  }

  const widths = await page
    .locator("nav .nav-progress b")
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.width));
  expect(widths.length).toBeGreaterThan(0);
  expect(widths.every((w) => w === "100%")).toBe(true);
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

test("work KPI values align on one line at every width", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // The featured KPI wall packs 3-across on desktop (6 columns, tiles span 2)
  // and 2-across on phones, with the members tile filling the last row alone.
  // Rows are grouped by TILE tops: the approved layout itself lets the
  // coverage tile's label wrap to two lines on phones, which drops that
  // tile's value a line below its row-mate without changing the grid.
  const expectRows = async (expected: number[]) => {
    const tiles = page.locator("#work .fact");
    expect(await tiles.count()).toBe(5);

    const tops = await tiles.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top)),
    );

    const rows: number[][] = [];
    for (const top of tops) {
      const row = rows.find((group) => Math.abs(group[0] - top) <= 1);
      if (row) row.push(top);
      else rows.push([top]);
    }
    expect(rows.map((row) => row.length)).toEqual(expected);

    // The values themselves stay on one line at every width.
    const valueLines = await page.locator("#work .fact dd").evaluateAll((els) =>
      els.map((el) => {
        const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
        return Math.round(el.getBoundingClientRect().height / lineHeight);
      }),
    );
    expect(valueLines).toEqual([1, 1, 1, 1, 1]);
  };

  await expectRows([5]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectRows([2, 2, 1]);
  await page.setViewportSize({ width: 320, height: 568 });
  await expectRows([2, 2, 1]);
});

test("navbar highlights the section navigated to, not the previous one", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Scope to the main navbar (the footer nav shares the same hrefs)
  const mainNav = page.locator(NAVIGATOR);

  const experience = mainNav.locator('a[href="#experience"]:visible');
  await experience.click();

  // The destination section's link becomes current (aria-current="page")
  await expect(experience).toHaveAttribute("aria-current", "page");

  // And the previous section does NOT retain it
  const stack = mainNav.locator('a[href="#stack"]:visible');
  await expect(stack).not.toHaveAttribute("aria-current", "page");
});

test("scroll-spy tracks quick scrolling between consecutive sections", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const mainNav = page.locator(NAVIGATOR);

  // Jump to the bottom - Contact must become active
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await expect(mainNav.locator('a[href="#contact"]:visible')).toHaveAttribute(
    "aria-current",
    "page",
  );

  // Jump back to the top region - no section should claim current
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(mainNav.locator('a[href="#contact"]:visible')).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});

test.describe("navbar section links resolve to the home page from any route", () => {
  const SECTIONS = ["work", "experience", "stack", "about", "contact"] as const;
  // `/links` is intentionally navbar-less, so it is not a navbar case.
  const OFF_HOME_ROUTES = ["/work/trosc", "/ar/work/trosc"];

  test("never renders a bare `#section` href off the home page", async ({ page }) => {
    for (const route of OFF_HOME_ROUTES) {
      await page.goto(route);

      // The bug: a bare `#about` on /work/trosc becomes /work/trosc#about,
      // where the element does not exist and nothing scrolls.
      const hrefs = await page
        .locator(NAVIGATOR)
        .locator("[data-nav-section]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")));

      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(href?.startsWith("#"), `${route} rendered a bare hash href: ${href}`).toBe(false);
      }
    }
  });

  for (const route of ["/work/trosc", "/ar/work/trosc"]) {
    // `homeAnchorHref()` renders `/#work` for English and `/ar#work` for Arabic.
    const homeBase = route.startsWith("/ar") ? "/ar" : "/";

    test(`every section link routes home and scrolls there from ${route}`, async ({ page }) => {
      // Five cross-route navigations, each with a smooth scroll, on a page
      // that now carries a WebGL tide band: the default 30s budget is not
      // enough for the whole loop on a machine without a GPU. The assertions
      // below are unchanged.
      test.setTimeout(90_000);

      for (const section of SECTIONS) {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        // The navbar keeps both a mobile-menu and a desktop copy of every link,
        // so scope to the visible one — the same rule the scroll-spy tests use.
        const mainNav = page.locator(NAVIGATOR);
        const link = mainNav.locator(`a[href="${homeBase}#${section}"]:visible`);
        await expect(link).toHaveCount(1);

        // `click()` resolves once the event is dispatched, not once the client
        // route has settled, so wait for the URL rather than reading it raw.
        await link.click();
        await expect(page).toHaveURL(`${homeBase}#${section}`);

        // The page must actually be at the section — not merely carry the hash.
        await expect(page.locator(`#${section}`)).toBeInViewport();

        // And the navbar must mark it current once there. Off home the link is
        // a route link; back on home it collapses to a bare hash again.
        await expect(mainNav.locator(`a[href="#${section}"]:visible`)).toHaveAttribute(
          "aria-current",
          "page",
        );
      }
    });
  }

  test("works by keyboard as well as by click", async ({ page }) => {
    await page.goto("/work/trosc");
    await page.waitForLoadState("networkidle");

    const link = page.locator(NAVIGATOR).locator('a[href="/#about"]:visible');
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator("#about")).toBeInViewport();
  });

  test("keeps local smooth scrolling on the home page itself", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mainNav = page.locator(NAVIGATOR);
    // The in-page handler only calls `pushState` once the smooth scroll
    // finishes, so wait for the URL instead of reading it immediately.
    await mainNav.locator('a[href="#experience"]:visible').click();
    await expect(page).toHaveURL(/#experience$/);

    // Same-page navigation must stay a hash-only URL and an in-page scroll.
    expect(new URL(page.url()).pathname).toBe("/");
    await expect(page.locator("#experience")).toBeInViewport();
  });

  test("survives browser back and forward", async ({ page }) => {
    await page.goto("/work/trosc");
    await page.waitForLoadState("networkidle");

    await page.locator(NAVIGATOR).locator('a[href="/#work"]:visible').click();
    await expect(page.locator("#work")).toBeInViewport();

    await page.goBack();
    await expect(page).toHaveURL(/\/work\/trosc$/);

    await page.goForward();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("closes the mobile menu and still navigates", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/work/trosc");
    await page.waitForLoadState("networkidle");

    await page.locator('button[aria-controls="navbarNav"]').click();

    const link = page.locator(NAVIGATOR).locator('a[href="/#stack"]:visible');
    await link.click();

    await expect(page).toHaveURL(/#stack$/);
    await expect(page.locator("#stack")).toBeInViewport();
    await expect(page.locator("#navbarNav")).toBeHidden();
  });

  test("scrolls to the target when a home section URL is loaded directly", async ({ page }) => {
    await page.goto("/#experience");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#experience")).toBeInViewport();
  });
});
