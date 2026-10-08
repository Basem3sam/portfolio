"use client";

import { useEffect, useState } from "react";
import GitHubRepoCard from "@/components/github/GitHubRepoCard";
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

const retryButton =
  "mt-2 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-secondary px-5 text-sm font-semibold text-on-secondary transition-colors duration-200 hover:bg-[#7e3907] dark:hover:bg-[#fcd34d]";

export default function GitHubProjects({ locale, dict }: GitHubProjectsProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
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
  }, [attempt, dict]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {state.status === "loading" && (
        <div className="px-5 py-16 text-center">
          <div
            className="inline-block size-10 animate-[spin_0.75s_linear_infinite] rounded-full border-[0.3em] border-secondary border-r-transparent align-[-0.125em]"
            role="status"
          >
            <span className="sr-only">{dict.loading}</span>
          </div>
          <p className="mt-4 text-sm text-light-text">{dict.loading}</p>
        </div>
      )}

      {state.status === "loaded" && (
        <div className="-mx-3 flex flex-wrap">
          {state.repos.map((repo, index) => (
            <GitHubRepoCard key={repo.id} repo={repo} index={index} locale={locale} dict={dict} />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div role="alert" className="rounded-lg border border-dashed border-hairline p-8 text-center">
          <Icon name="github" className={`mx-auto size-8 ${toneIcons[state.error.tone]}`} />
          <p className="mt-4 text-light-text">
            {dict.errors[state.error.code] ?? state.error.message}
          </p>
          {state.error.retryable && (
            <button className={retryButton} onClick={retry}>
              {dict.tryAgain}
            </button>
          )}
        </div>
      )}
    </div>
  );
}