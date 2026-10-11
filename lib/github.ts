export type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  fork: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type FallbackTone = "error" | "warning" | "info";

export type ErrorCode =
  "userNotFound" | "rateLimit" | "authFailed" | "forbidden" | "timeout" | "cancelled" | "generic";

export type ErrorInfo = {
  message: string;
  tone: FallbackTone;
  retryable: boolean;
  code: ErrorCode;
};

/**
 * Error raised by the local `/api/github/repos` proxy (or its classifier).
 *
 * `code` is authoritative - it is derived from the upstream HTTP status and
 * GitHub's response headers on the server, so the client never has to guess
 * whether a 403 means "rate limited" or "not allowed".
 */
export class GitHubApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly retryAfterMs?: number;

  constructor(code: ErrorCode, status: number, retryAfterMs?: number, message?: string) {
    super(message ?? `GitHub API error ${status} (${code})`);
    this.name = "GitHubApiError";
    this.code = code;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Codes worth retrying automatically. Everything else is permanent for the
 * lifetime of the request: retrying a bad credential, a missing user or an
 * exhausted quota only burns time and quota.
 */
export function isTransientCode(code: ErrorCode) {
  return code === "generic" || code === "timeout";
}

const RETRY_AFTER_CAP_MS = 30_000;

function parseSeconds(value: string | null | undefined) {
  if (!value) return undefined;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return undefined;
  return seconds * 1000;
}

function parseRateLimitReset(value: string | null | undefined) {
  const reset = parseSeconds(value);
  if (reset === undefined) return undefined;
  // `x-ratelimit-reset` is a unix timestamp, not a duration.
  const remaining = reset * 1000 - Date.now();
  return remaining > 0 ? remaining : 0;
}

function clampRetryAfter(ms?: number) {
  if (ms === undefined) return undefined;
  return Math.min(Math.max(ms, 0), RETRY_AFTER_CAP_MS);
}

export type FailureClassification = {
  code: ErrorCode;
  retryAfterMs?: number;
};

const ERROR_CODES: readonly ErrorCode[] = [
  "userNotFound",
  "rateLimit",
  "authFailed",
  "forbidden",
  "timeout",
  "cancelled",
  "generic",
];

/** Narrow an untrusted string (e.g. a parsed response body) to an ErrorCode. */
export function toErrorCode(value: unknown): ErrorCode | undefined {
  return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value)
    ? (value as ErrorCode)
    : undefined;
}

/**
 * Classify a failed GitHub API response.
 *
 * Deliberately does NOT assume every 403 is rate limiting - GitHub returns
 * 403 for rate limits, secondary rate limits, SAML enforcement and missing
 * permissions, and those need different handling. Only the rate-limit
 * variants carry the relevant headers.
 */
export function classifyGitHubFailure(
  status: number,
  headers: Headers | Record<string, string | null | undefined>,
  bodyText = "",
): FailureClassification {
  const read = (name: string): string | null => {
    if (headers instanceof Headers) return headers.get(name);
    return headers[name] ?? headers[name.toLowerCase()] ?? null;
  };

  const body = bodyText.toLowerCase();

  if (status === 404) return { code: "userNotFound" };

  // 401 from GitHub means the token itself was rejected.
  if (status === 401 || body.includes("bad credentials")) return { code: "authFailed" };

  // 429 is an explicit secondary rate limit.
  if (status === 429) {
    return { code: "rateLimit", retryAfterMs: clampRetryAfter(parseSeconds(read("retry-after"))) };
  }

  if (status === 403) {
    const retryAfter = read("retry-after");
    if (retryAfter) {
      // Secondary rate limit: GitHub tells us when to come back.
      return { code: "rateLimit", retryAfterMs: clampRetryAfter(parseSeconds(retryAfter)) };
    }

    if (read("x-ratelimit-remaining") === "0") {
      // Primary rate limit (60/hr unauthenticated, 5000/hr with a token).
      return {
        code: "rateLimit",
        retryAfterMs: clampRetryAfter(parseRateLimitReset(read("x-ratelimit-reset"))),
      };
    }

    // No rate-limit signal: this is a permission or SAML/SSO restriction.
    return { code: "forbidden" };
  }

  if (status >= 500) return { code: "generic" };

  return { code: "generic" };
}

const USERNAME = "basem3sam";
// Same-origin proxy. The GitHub token lives on the server only, so the client
// must never talk to api.github.com directly.
const API_ENDPOINT = "/api/github/repos";
const REPOS_PER_PAGE = 9;
const CACHE_KEY = "github_repos_enhanced_cache";
const CACHE_VERSION = "2.0";
const CACHE_DURATION = 15 * 60 * 1000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 10000;
const MAX_DESCRIPTION_LENGTH = 120;

function readCache(): GitHubRepo[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cache = JSON.parse(cached);
    const valid =
      Date.now() - cache.timestamp < CACHE_DURATION &&
      cache.version === CACHE_VERSION &&
      cache.username === USERNAME;

    if (valid) return cache.data;

    localStorage.removeItem(CACHE_KEY);
  } catch {}

  return null;
}

function writeCache(data: GitHubRepo[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now(), version: CACHE_VERSION, username: USERNAME }),
    );
  } catch {}
}

function isAbortError(error: unknown) {
  return error instanceof Error && (error.name === "AbortError" || error.message.includes("abort"));
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

async function fetchRepositories(signal: AbortSignal): Promise<GitHubRepo[]> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  let timedOut = false;

  signal.addEventListener("abort", abort);
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    // No Authorization header here on purpose: authentication happens
    // server-side in the route handler, so the token never reaches this bundle.
    const response = await fetch(API_ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const failure = (payload as { error?: { code?: string; retryAfterMs?: number } } | null)
        ?.error;

      throw new GitHubApiError(
        toErrorCode(failure?.code) ?? "generic",
        response.status,
        failure?.retryAfterMs,
      );
    }

    const payload: unknown = await response.json();
    const repos = (payload as { repos?: GitHubRepo[] } | null)?.repos;

    if (!Array.isArray(repos)) {
      throw new GitHubApiError("generic", 502);
    }

    return repos
      .filter((repo) => !repo.fork && !repo.archived)
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
  } catch (error) {
    if (timedOut) throw new GitHubApiError("timeout", 408);
    throw error;
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

/**
 * Retry only transient failures. Permanent ones - a bad token, a missing
 * user, an exhausted quota - cannot succeed by being asked again.
 */
async function fetchWithRetry(signal: AbortSignal) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetchRepositories(signal);
    } catch (error) {
      if (attempt >= RETRY_ATTEMPTS || isAbortError(signal)) throw error;
      if (error instanceof GitHubApiError && !isTransientCode(error.code)) throw error;
      await wait(RETRY_DELAY * attempt, signal);
    }
  }
}

export async function loadRepositories(signal: AbortSignal) {
  const cached = readCache();
  if (cached) return cached;

  const repos = await fetchWithRetry(signal);
  writeCache(repos);
  return repos;
}

export function getErrorInfo(error: unknown): ErrorInfo {
  if (isAbortError(error)) {
    return { message: "Request was cancelled.", tone: "info", retryable: false, code: "cancelled" };
  }

  // Preferred path: the proxy classifies upstream failures server-side, from
  // the real status + headers, so 403 is no longer blindly called a rate limit.
  if (error instanceof GitHubApiError) {
    switch (error.code) {
      case "userNotFound":
        return {
          message: "GitHub user not found. Please check the username.",
          tone: "warning",
          retryable: false,
          code: "userNotFound",
        };
      case "rateLimit":
        return {
          message: "GitHub API rate limit exceeded. Please try again in an hour.",
          tone: "warning",
          retryable: true,
          code: "rateLimit",
        };
      case "authFailed":
        return {
          message: "GitHub authentication failed. Projects are temporarily unavailable.",
          tone: "error",
          retryable: false,
          code: "authFailed",
        };
      case "forbidden":
        return {
          message: "GitHub access is restricted. Projects are temporarily unavailable.",
          tone: "error",
          retryable: false,
          code: "forbidden",
        };
      case "timeout":
        return {
          message: "Request timeout. Please check your connection and try again.",
          tone: "warning",
          retryable: true,
          code: "timeout",
        };
      default:
        break;
    }
  }

  // Fallback for non-proxy errors (e.g. a network failure before the request
  // reaches the route handler).
  const message = error instanceof Error ? error.message : "";

  if (message.includes("timeout")) {
    return {
      message: "Request timeout. Please check your connection and try again.",
      tone: "warning",
      retryable: true,
      code: "timeout",
    };
  }
  if (message.includes("abort")) {
    return { message: "Request was cancelled.", tone: "info", retryable: false, code: "cancelled" };
  }

  return {
    message: "Unable to load GitHub projects at this time.",
    tone: "error",
    retryable: true,
    code: "generic",
  };
}

export function formatRepositoryName(name: string) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\b(Js|Ts|Api|Ui|Ux|Db|Css|Html)\b/gi, (match) => match.toUpperCase());
}

export function truncateDescription(description: string | null) {
  const text = description || "No description available.";
  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.substring(0, MAX_DESCRIPTION_LENGTH)}...`
    : text;
}

export function formatCount(count: number) {
  return count > 999 ? `${(count / 1000).toFixed(1)}k` : count;
}

export function formatDate(dateString: string, locale: string = "en") {
  const dateLocale = locale === "ar" ? "ar-u-nu-latn" : locale;
  const date = new Date(dateString);
  const diffDays = Math.ceil(Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const relative = new Intl.RelativeTimeFormat(dateLocale, { numeric: "auto" });

  if (diffDays === 0) return relative.format(0, "day");
  if (diffDays === 1) return relative.format(-1, "day");
  if (diffDays < 7) return relative.format(-diffDays, "day");
  if (diffDays < 30) return relative.format(-Math.floor(diffDays / 7), "week");
  if (diffDays < 365) return relative.format(-Math.floor(diffDays / 30), "month");

  return date.toLocaleDateString(dateLocale, { year: "numeric", month: "short", day: "numeric" });
}

export function isWebUrl(url: string) {
  return /^https?:\/\//i.test(url);
}
