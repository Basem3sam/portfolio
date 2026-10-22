"use client";

import { useEffect, useRef, useState } from "react";
import GitHubRepoCard from "@/components/github/GitHubRepoCard";
import "@/components/github/GitHub.css";
import Icon from "@/components/ui/Icon";
import {
  getErrorInfo,
  loadRepositories,
  type ErrorInfo,
  type FallbackTone,
  type GitHubRepo,
} from "@/lib/github";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";

type GitHubProjectsProps = {
  locale: Locale;
  dict: Dictionary["github"];
};

type State =
  | { status: "loading" }
  | { status: "loaded"; repos: GitHubRepo[] }
  | { status: "error"; error: ErrorInfo };

const toneIcons: Record<FallbackTone, string> = {
  error: "text-accent",
  warning: "text-secondary",
  info: "text-status",
};

export default function GitHubProjects({ locale, dict }: GitHubProjectsProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [near, setNear] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  // The feed sits well below the fold. Start the request when the section is
  // about to scroll into view (the skeleton is already on screen until then),
  // so it does not compete with the first paint and hydration.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (typeof IntersectionObserver !== "function") {
      const timer = window.setTimeout(() => setNear(true), 0);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    const controller = new AbortController();

    loadRepositories(controller.signal)
      .then((repos) => {
        if (controller.signal.aborted) return;
        setState(
          repos.length > 0
            ? { status: "loaded", repos }
            : {
                status: "error",
                error: {
                  message: dict.noRepos,
                  tone: "info",
                  retryable: false,
                  code: "generic",
                },
              },
        );
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", error: getErrorInfo(error) });
      });

    return () => controller.abort();
  }, [near, attempt, dict]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  return (
    <div className="w-full max-w-full" ref={hostRef}>
      {state.status === "loading" && (
        <div role="status" aria-busy="true">
          <span className="sr-only">{dict.loading}</span>
          <div className="gh-grid" aria-hidden="true">
            {[0, 1, 2].map((key) => (
              <div key={key} className="gh-card gh-skel">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.status === "loaded" && (
        <ul className="gh-grid">
          {state.repos.map((repo, index) => (
            <GitHubRepoCard key={repo.id} repo={repo} index={index} locale={locale} dict={dict} />
          ))}
        </ul>
      )}

      {state.status === "error" && (
        <div role="alert" className="gh-state">
          <Icon name="github" className={`size-8 ${toneIcons[state.error.tone]}`} />
          <p>{dict.errors[state.error.code] ?? state.error.message}</p>
          {state.error.retryable && (
            <button className="btn btn-ghost" onClick={retry}>
              {dict.tryAgain}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
