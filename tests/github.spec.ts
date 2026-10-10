import { expect, test, type Page } from "@playwright/test";
import {
  classifyGitHubFailure,
  getErrorInfo,
  GitHubApiError,
  isTransientCode,
  toErrorCode,
} from "../lib/github";

/**
 * F-10: GitHub proxy error handling.
 *
 * Two layers:
 *  1. Pure unit tests for the classifier - this is the logic that decides
 *     whether a 403 is a rate limit, a bad token or a permission problem.
 *  2. Client integration tests, driven by intercepting /api/github/repos so
 *     no real GitHub quota is consumed.
 */

const fakeRepo = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  name: `repo-${id}`,
  description: `description ${id}`,
  html_url: `https://github.com/basem3sam/repo-${id}`,
  homepage: null,
  language: "TypeScript",
  stargazers_count: id,
  forks_count: 0,
  watchers_count: 0,
  open_issues_count: 0,
  fork: false,
  archived: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-06-01T00:00:00Z",
  ...overrides,
});

test.describe("classifyGitHubFailure", () => {
  test("403 with exhausted x-ratelimit-remaining is a rate limit", () => {
    const result = classifyGitHubFailure(
      403,
      {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 60),
      },
      "API rate limit exceeded",
    );
    expect(result.code).toBe("rateLimit");
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  test("403 with retry-after is a secondary rate limit", () => {
    const result = classifyGitHubFailure(403, { "retry-after": "30" }, "");
    expect(result.code).toBe("rateLimit");
    expect(result.retryAfterMs).toBe(30_000);
  });

  test("403 with NO rate-limit signal is NOT misclassified as a rate limit", () => {
    // The core defect: the old code called every 403 a rate limit.
    const result = classifyGitHubFailure(
      403,
      { "x-ratelimit-remaining": "4999" },
      "Resource not accessible by integration",
    );
    expect(result.code).toBe("forbidden");
  });

  test("403 with an SAML/permission message is forbidden", () => {
    const result = classifyGitHubFailure(
      403,
      { "x-ratelimit-remaining": "100" },
      "Resource not accessible by personal access token",
    );
    expect(result.code).toBe("forbidden");
  });

  test("401 bad credentials is authFailed", () => {
    expect(classifyGitHubFailure(401, {}, "Bad credentials").code).toBe("authFailed");
    // 401 with an empty body still classifies from status alone.
    expect(classifyGitHubFailure(401, {}, "").code).toBe("authFailed");
  });

  test("404 is userNotFound", () => {
    expect(classifyGitHubFailure(404, {}, "Not Found").code).toBe("userNotFound");
  });

  test("429 is a rate limit honouring retry-after", () => {
    const result = classifyGitHubFailure(429, { "retry-after": "12" }, "");
    expect(result.code).toBe("rateLimit");
    expect(result.retryAfterMs).toBe(12_000);
  });

  test("5xx is transient", () => {
    for (const status of [500, 502, 503, 504]) {
      expect(classifyGitHubFailure(status, {}, "").code).toBe("generic");
    }
  });

  test("accepts a real Headers instance, not just a plain object", () => {
    const headers = new Headers({ "x-ratelimit-remaining": "0" });
    expect(classifyGitHubFailure(403, headers, "").code).toBe("rateLimit");
  });

  test("retryAfterMs is capped so the client never waits absurdly long", () => {
    const reset = Math.floor(Date.now() / 1000) + 3600; // one hour out
    const result = classifyGitHubFailure(
      403,
      { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(reset) },
      "",
    );
    expect(result.retryAfterMs).toBeLessThanOrEqual(30_000);
  });
});

test.describe("isTransientCode", () => {
  test("only transient codes are auto-retried", () => {
    expect(isTransientCode("generic")).toBe(true);
    expect(isTransientCode("timeout")).toBe(true);

    expect(isTransientCode("rateLimit")).toBe(false);
    expect(isTransientCode("authFailed")).toBe(false);
    expect(isTransientCode("forbidden")).toBe(false);
    expect(isTransientCode("userNotFound")).toBe(false);
    expect(isTransientCode("cancelled")).toBe(false);
  });
});

test.describe("toErrorCode", () => {
  test("narrows known codes and rejects unknown strings", () => {
    expect(toErrorCode("rateLimit")).toBe("rateLimit");
    expect(toErrorCode("authFailed")).toBe("authFailed");
    expect(toErrorCode("nonsense")).toBeUndefined();
    expect(toErrorCode(42)).toBeUndefined();
    expect(toErrorCode(undefined)).toBeUndefined();
  });
});

test.describe("getErrorInfo", () => {
  test("does not label a permission failure as a rate limit", () => {
    const info = getErrorInfo(new GitHubApiError("forbidden", 403));
    expect(info.code).toBe("forbidden");
    expect(info.retryable).toBe(false);
    expect(info.message).not.toMatch(/rate limit/i);
  });

  test("auth failures are not retryable", () => {
    const info = getErrorInfo(new GitHubApiError("authFailed", 401));
    expect(info.code).toBe("authFailed");
    expect(info.retryable).toBe(false);
  });

  test("a real rate limit stays user-retryable", () => {
    const info = getErrorInfo(new GitHubApiError("rateLimit", 403));
    expect(info.code).toBe("rateLimit");
    expect(info.retryable).toBe(true);
  });

  test("never echoes credential material", () => {
    const info = getErrorInfo(new GitHubApiError("authFailed", 401, undefined, "Bad credentials"));
    expect(JSON.stringify(info)).not.toMatch(/ghp_|github_pat_|Bearer/);
  });
});

test.describe("client / proxy contract", () => {
  const stubApi = async (page: Page, reply: { status: number; body: unknown }) => {
    let calls = 0;
    await page.route("**/api/github/repos", async (route) => {
      calls += 1;
      await route.fulfill({
        status: reply.status,
        contentType: "application/json",
        body: JSON.stringify(reply.body),
      });
    });
    return () => calls;
  };

  const renderWork = async (page: Page) => {
    // <GitHubProjects/> mounts inside the Work section of the home page.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.querySelector("#work")?.scrollIntoView());
  };

  test("renders repositories from the proxy payload", async ({ page }) => {
    const getCalls = await stubApi(page, {
      status: 200,
      body: { repos: [fakeRepo(1), fakeRepo(2, { fork: true }), fakeRepo(3)] },
    });

    await renderWork(page);
    await expect(page.locator("#work").getByText("Repo 1")).toBeVisible();
    // Forks are filtered out client-side.
    await expect(page.locator("#work").getByText("Repo 2")).toHaveCount(0);

    // The stub records every call, so this already proves the client went
    // through /api/github/repos rather than hitting GitHub itself.
    expect(getCalls()).toBeGreaterThanOrEqual(1);
  });

  test("sends no Authorization header to the proxy", async ({ page }) => {
    const authHeaders: string[] = [];
    await page.route("**/api/github/repos", async (route) => {
      const headers = await route.request().allHeaders();
      if (headers.authorization) authHeaders.push(headers.authorization);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ repos: [fakeRepo(1)] }),
      });
    });

    await renderWork(page);
    await expect(page.locator("#work").getByText("Repo 1")).toBeVisible();
    expect(authHeaders).toEqual([]);
  });

  test("invalid credentials show a non-retryable error and are not retried", async ({ page }) => {
    const getCalls = await stubApi(page, {
      status: 401,
      body: { error: { code: "authFailed" } },
    });

    await renderWork(page);
    // The "Try again" button only renders when retryable is true.
    await expect(page.getByRole("button", { name: /try again|إعادة/i })).toHaveCount(0);

    // Wait long enough that the old 1s/2s retry loop would have fired.
    await page.waitForTimeout(3500);
    expect(getCalls()).toBe(1);
  });

  test("404 is not retried either", async ({ page }) => {
    const getCalls = await stubApi(page, {
      status: 404,
      body: { error: { code: "userNotFound" } },
    });

    await renderWork(page);
    await page.waitForTimeout(3500);
    expect(getCalls()).toBe(1);
  });

  test("a rate limit surfaces as a retryable warning", async ({ page }) => {
    await stubApi(page, { status: 429, body: { error: { code: "rateLimit" } } });

    await renderWork(page);
    await expect(page.getByRole("button", { name: /try again|إعادة/i })).toBeVisible();
  });

  test("transient failures are retried a bounded number of times", async ({ page }) => {
    const getCalls = await stubApi(page, {
      status: 502,
      body: { error: { code: "generic" } },
    });

    await renderWork(page);
    // RETRY_ATTEMPTS is 3; it must not loop forever.
    await page.waitForTimeout(6000);
    expect(getCalls()).toBeLessThanOrEqual(3);
    expect(getCalls()).toBeGreaterThanOrEqual(1);
  });

  test("never hits api.github.com directly", async ({ page }) => {
    const direct: string[] = [];
    await page.route("**/api.github.com/**", (route) => {
      direct.push(route.request().url());
      return route.abort();
    });

    await stubApi(page, { status: 200, body: { repos: [fakeRepo(1)] } });
    await renderWork(page);
    await expect(page.locator("#work").getByText("Repo 1")).toBeVisible();

    expect(direct).toEqual([]);
  });
});
