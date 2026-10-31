"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { prefersReducedMotion } from "@/lib/scroll";

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

/** Two rows of three on a wide screen: close to what the feed usually returns. */
const SKELETON_CARDS = 6;
/** Keep in step with `.gh-frame` and `.gh-skel-layer` in GitHub.css. */
const RESIZE_MS = 520;
const FADE_MS = 420;

function Skeleton({ leaving = false }: { leaving?: boolean }) {
  return (
    <ul
      className={`gh-grid gh-skel-grid${leaving ? " gh-skel-layer" : ""}`}
      aria-hidden="true"
      data-leaving={leaving ? "" : undefined}
    >
      {Array.from({ length: SKELETON_CARDS }, (_, key) => (
        <li key={key} className="gh-item">
          <div className="gh-card gh-skel">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function GitHubProjects({ locale, dict }: GitHubProjectsProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [near, setNear] = useState(false);
  // The skeleton outlives the data by one fade, drawn over the new content.
  const [fading, setFading] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const lastHeight = useRef<number | null>(null);
  const fadeTimer = useRef(0);

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

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  // Whatever arrives replaces the skeleton, which fades out over it rather than
  // vanishing. Set in the same update as the data, so there is no empty frame.
  const startFade = useCallback(() => {
    if (prefersReducedMotion()) return;
    window.clearTimeout(fadeTimer.current);
    setFading(true);
    fadeTimer.current = window.setTimeout(() => setFading(false), FADE_MS + 40);
  }, []);

  useEffect(() => {
    if (!near) return;
    const controller = new AbortController();

    loadRepositories(controller.signal)
      .then((repos) => {
        if (controller.signal.aborted) return;
        startFade();
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
        startFade();
        setState({ status: "error", error: getErrorInfo(error) });
      });

    return () => controller.abort();
  }, [near, attempt, dict, startFade]);

  // Skeleton, cards and error notice all have different heights. Instead of
  // jumping from one to the next (and pushing everything below it), the frame
  // eases from the old height to the new one while the content swaps.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;

    const next = inner.offsetHeight;
    const from = lastHeight.current;
    lastHeight.current = next;

    if (from === null || Math.abs(from - next) < 2 || prefersReducedMotion()) {
      frame.style.height = "";
      return;
    }

    frame.style.overflow = "hidden";
    frame.style.height = `${from}px`;
    void frame.offsetHeight; // commit the start height before animating
    frame.style.transition = `height ${RESIZE_MS}ms var(--ease-out)`;
    frame.style.height = `${next}px`;

    const finish = () => {
      frame.style.height = "";
      frame.style.overflow = "";
      frame.style.transition = "";
      frame.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target === frame && event.propertyName === "height") finish();
    };
    frame.addEventListener("transitionend", onEnd);
    const fallback = window.setTimeout(finish, RESIZE_MS + 120);

    return () => {
      frame.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
    };
  }, [state.status]);

  // A resize between swaps changes the content's height; keep the measurement
  // current so the next swap starts from what is really on screen.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(() => {
      if (!frameRef.current?.style.height) lastHeight.current = inner.offsetHeight;
    });
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  return (
    <div className="w-full max-w-full" ref={hostRef}>
      <div className="gh-frame" ref={frameRef}>
        <div ref={innerRef}>
          {state.status === "loading" && (
            <div role="status" aria-busy="true">
              <span className="sr-only">{dict.loading}</span>
              <Skeleton />
            </div>
          )}

          {state.status === "loaded" && (
            <ul className="gh-grid">
              {state.repos.map((repo, index) => (
                <GitHubRepoCard
                  key={repo.id}
                  repo={repo}
                  index={index}
                  locale={locale}
                  dict={dict}
                />
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

        {fading && state.status !== "loading" && <Skeleton leaving />}
      </div>
    </div>
  );
}
