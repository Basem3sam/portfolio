import { expect, test, type Page } from "@playwright/test";

/**
 * Minimal SEO contract for the four public routes:
 * robots.txt, the sitemap, per-page canonical, and hreflang alternates.
 *
 * The site is bilingual (en at `/...`, ar at `/ar/...`); every route must
 * declare both language variants plus x-default, and the canonical must be
 * the page's own locale-prefixed URL.
 *
 * Trailing slashes: the metadata layer emits the site root WITHOUT one
 * (`https://basemesam.vercel.app`), while the sitemap serialises the same
 * URL WITH one. Both are asserted exactly as the site emits them.
 */

const ROUTES = [
  // `""` = the bare origin, i.e. the site root without a trailing slash.
  { path: "/", canonical: "", en: "", ar: "/ar", xDefault: "" },
  { path: "/ar", canonical: "/ar", en: "", ar: "/ar", xDefault: "" },
  {
    path: "/work/trosc",
    canonical: "/work/trosc",
    en: "/work/trosc",
    ar: "/ar/work/trosc",
    xDefault: "/work/trosc",
  },
  {
    path: "/links",
    canonical: "/links",
    en: "/links",
    ar: "/ar/links",
    xDefault: "/links",
  },
] as const;

/**
 * `<loc>` entries the sitemap emits. `app/sitemap.ts` lists each route's
 * English URL as its own entry and exposes the Arabic variant through that
 * entry's hreflang alternates (see SITEMAP_AR_ALTERNATES below) - it does
 * not give Arabic pages separate `<loc>` entries.
 */
const SITEMAP_PATHS = ["/", "/work/trosc", "/links"];
const SITEMAP_AR_ALTERNATES = ["/ar", "/ar/work/trosc", "/ar/links"];

/**
 * The metadata layer emits absolute URLs against `SITE_URL`
 * (https://basemesam.vercel.app), not the test server's origin. Discover
 * that base from robots.txt so the assertions stay true if the domain
 * ever changes.
 */
async function siteOrigin(page: Page): Promise<string> {
  const response = await page.request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  const match = /Sitemap:\s*(\S+)/i.exec(body);
  expect(match, "robots.txt must reference a sitemap").not.toBeNull();
  return new URL(match![1]).origin;
}

test.describe("SEO", () => {
  test("robots.txt allows crawling and points at the sitemap", async ({ page }) => {
    const response = await page.request.get("/robots.txt");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/plain");

    const body = await response.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toMatch(/Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/);
  });

  test("sitemap.xml lists every public route in both locales", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/xml/);

    const body = await response.text();
    expect(body).toContain("<urlset");

    const origin = await siteOrigin(page);
    for (const path of SITEMAP_PATHS) {
      expect(body, `sitemap must list ${path}`).toContain(`<loc>${origin}${path}</loc>`);
    }

    // Language alternates are advertised for each URL entry, and the Arabic
    // variant of every route is linked from its English entry.
    expect(body).toContain('hreflang="en"');
    expect(body).toContain('hreflang="ar"');
    for (const path of SITEMAP_AR_ALTERNATES) {
      expect(body, `sitemap must link the Arabic variant ${path}`).toContain(
        `href="${origin}${path}"`,
      );
    }
  });

  for (const route of ROUTES) {
    test(`${route.path} declares canonical and hreflang alternates`, async ({ page }) => {
      await page.goto(route.path);

      const origin = await siteOrigin(page);
      const href = (path: string) => `${origin}${path}`;

      // Exactly one canonical per page, pointing at its own locale URL.
      const canonicals = page.locator('link[rel="canonical"]');
      await expect(canonicals).toHaveCount(1);
      await expect(canonicals).toHaveAttribute("href", href(route.canonical));

      // en / ar / x-default alternates, each present exactly once.
      const alternates = page.locator('link[rel="alternate"]');
      await expect(alternates).toHaveCount(3);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
        "href",
        href(route.en),
      );
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute(
        "href",
        href(route.ar),
      );
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
        "href",
        href(route.xDefault),
      );

      // The document language must agree with the locale route.
      const expectedLang = route.path.startsWith("/ar") ? "ar" : "en";
      await expect(page.locator("html")).toHaveAttribute("lang", expectedLang);
    });
  }
});
