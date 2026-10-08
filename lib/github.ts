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

export type ErrorCode = "userNotFound" | "rateLimit" | "timeout" | "cancelled" | "generic";

export type ErrorInfo = {
  message: string;
  tone: FallbackTone;
  retryable: boolean;
  code: ErrorCode;
};

const USERNAME = "basem3sam";
const API_URL = "https://api.github.com";
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
    const url = `${API_URL}/users/${USERNAME}/repos?sort=updated&direction=desc&per_page=${REPOS_PER_PAGE}&page=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const repos: GitHubRepo[] = await response.json();

    return repos
      .filter((repo) => !repo.fork && !repo.archived)
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
  } catch (error) {
    if (timedOut) throw new Error("Request timeout");
    throw error;
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

async function fetchWithRetry(signal: AbortSignal) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetchRepositories(signal);
    } catch (error) {
      if (attempt >= RETRY_ATTEMPTS || isAbortError(error)) throw error;
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
  const message = error instanceof Error ? error.message : "";

  if (message.includes("404")) {
    return {
      message: "GitHub user not found. Please check the username.",
      tone: "warning",
      retryable: false,
      code: "userNotFound",
    };
  }
  if (message.includes("403")) {
    return {
      message: "GitHub API rate limit exceeded. Please try again in an hour.",
      tone: "warning",
      retryable: true,
      code: "rateLimit",
    };
  }
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