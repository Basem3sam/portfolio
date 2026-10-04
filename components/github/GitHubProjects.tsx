"use client";

import { useEffect, useState } from "react";
import GitHubRepoCard from "@/components/github/GitHubRepoCard";
import { buttonStyles } from "@/components/ui/buttonStyles";
import {
  getErrorInfo,
  loadRepositories,
  type ErrorInfo,
  type FallbackTone,
  type GitHubRepo,
} from "@/lib/github";

type State =
  | { status: "loading" }
  | { status: "loaded"; repos: GitHubRepo[] }
  | { status: "error"; error: ErrorInfo };

const fallbackTones: Record<FallbackTone, { box: string; icon: string }> = {
  error: { box: "bg-[rgba(220,53,69,0.1)]", icon: "text-[#dc3545]" },
  warning: { box: "bg-[rgba(255,193,7,0.1)]", icon: "text-[#ffc107]" },
  info: { box: "bg-[rgba(13,202,240,0.1)]", icon: "text-[#0dcaf0]" },
};

const emptyError: ErrorInfo = {
  message: "No public repositories found.",
  tone: "info",
  retryable: false,
};

export default function GitHubProjects() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState({ status: "loading" });

    loadRepositories(controller.signal)
      .then((repos) => {
        if (controller.signal.aborted) return;
        setState(
          repos.length > 0
            ? { status: "loaded", repos }
            : { status: "error", error: emptyError },
        );
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", error: getErrorInfo(error) });
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {state.status === "loading" && (
        <div className="px-5 py-[60px] text-center">
          <div
            className="inline-block size-12 animate-[spin_0.75s_linear_infinite] rounded-full border-[0.3em] border-secondary border-r-transparent align-[-0.125em]"
            role="status"
          >
            <span className="sr-only">Loading projects...</span>
          </div>
          <p className="mt-4">Fetching projects from GitHub...</p>
        </div>
      )}

      {state.status === "loaded" && (
        <div className="-mx-3 flex flex-wrap">
          {state.repos.map((repo, index) => (
            <GitHubRepoCard key={repo.id} repo={repo} index={index} />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div
          className={`rounded-md border-2 border-dashed border-black/10 p-6 text-center text-light-text ${fallbackTones[state.error.tone].box}`}
        >
          <i
            className={`fab fa-github fa-2x mb-4 ${fallbackTones[state.error.tone].icon}`}
            aria-hidden="true"
          ></i>
          <p className="mb-4 text-[1.1rem]">{state.error.message}</p>
          {state.error.retryable && (
            <button
              className={`${buttonStyles("primary")} mt-2`}
              onClick={() => setAttempt((value) => value + 1)}
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
