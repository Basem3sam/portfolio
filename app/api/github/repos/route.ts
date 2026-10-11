import { NextResponse } from "next/server";
import { classifyGitHubFailure, type GitHubRepo } from "@/lib/github";

/**
 * Same-origin proxy for the GitHub repositories feed.
 *
 * Why this exists: `lib/github.ts` runs in the browser (it uses localStorage
 * and window), so it cannot read a server-side secret. Talking to GitHub from
 * here keeps `GITHUB_TOKEN` out of the client bundle entirely.
 *
 * The upstream URL is a fixed constant - this is deliberately NOT an open
 * proxy. Nothing about the request can steer it to another host or path.
 */

// Evaluate per request. Never call GitHub during `next build`: the site must
// still build when the API is unreachable or rate-limited.
export const dynamic = "force-dynamic";

const GITHUB_USER = "basem3sam";
const REPOS_PER_PAGE = 9;
const UPSTREAM_TIMEOUT_MS = 8_000;
const CACHE_SECONDS = 15 * 60;

/** Only ever read server-side. Never referenced by client code. */
function readToken() {
  const token = process.env.GITHUB_TOKEN;
  return token && token.trim().length > 0 ? token.trim() : undefined;
}

/**
 * Validate and project a repository down to exactly the fields the UI renders.
 *
 * GitHub returns ~60 fields per repo (owner, permissions, license, urls, ...).
 * Shipping all of that raw measured ~49 KB for 9 repos and made this the
 * slowest request on the page. The client only ever reads these 15 fields, so
 * anything else is discarded server-side.
 *
 * Returns `null` for entries that are not shaped like a repository.
 */
function projectRepo(value: unknown): GitHubRepo | null {
  const repo = value as Partial<GitHubRepo> | null;
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof repo.id !== "number" ||
    typeof repo.name !== "string" ||
    typeof repo.html_url !== "string" ||
    typeof repo.stargazers_count !== "number"
  ) {
    return null;
  }

  const projected: GitHubRepo = {
    id: repo.id,
    name: repo.name,
    description: typeof repo.description === "string" ? repo.description : null,
    html_url: repo.html_url,
    homepage: typeof repo.homepage === "string" ? repo.homepage : null,
    language: typeof repo.language === "string" ? repo.language : null,
    stargazers_count: repo.stargazers_count,
    forks_count: typeof repo.forks_count === "number" ? repo.forks_count : 0,
    watchers_count: typeof repo.watchers_count === "number" ? repo.watchers_count : 0,
    open_issues_count: typeof repo.open_issues_count === "number" ? repo.open_issues_count : 0,
    fork: repo.fork === true,
    archived: repo.archived === true,
    created_at: typeof repo.created_at === "string" ? repo.created_at : "",
    updated_at: typeof repo.updated_at === "string" ? repo.updated_at : "",
  };

  if (Array.isArray(repo.topics))
    projected.topics = repo.topics.filter((t) => typeof t === "string");

  return projected;
}

/**
 * Error envelope. Only the classified code and an optional retry hint cross
 * this boundary - the upstream body, headers and any credential material are
 * never echoed to the client.
 */
function errorResponse(status: number, code: string, retryAfterMs?: number) {
  return NextResponse.json(
    { error: { code, ...(retryAfterMs === undefined ? {} : { retryAfterMs }) } },
    { status },
  );
}

export async function GET() {
  const url = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&direction=desc&per_page=${REPOS_PER_PAGE}&page=1`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "basem-esam-portfolio",
  };

  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    // Network failure or timeout - transient, so the client may retry.
    return errorResponse(502, "generic");
  }

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      /* the body is only a classification hint */
    }

    const { code, retryAfterMs } = classifyGitHubFailure(
      response.status,
      response.headers,
      bodyText,
    );

    // Keep real statuses for permanent client-visible conditions; normalise
    // transient upstream trouble to 502 so it is never cached as a result.
    const transient = code === "generic" || code === "timeout";
    const status = transient ? 502 : code === "rateLimit" ? 429 : response.status;

    return errorResponse(status, code, retryAfterMs);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return errorResponse(502, "generic");
  }

  if (!Array.isArray(payload)) return errorResponse(502, "generic");

  return NextResponse.json(
    { repos: payload.map(projectRepo).filter((repo): repo is GitHubRepo => repo !== null) },
    {
      headers: {
        // Server-side cache hint only; the client keeps its own localStorage
        // cache, so this guards against accidental request amplification.
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
