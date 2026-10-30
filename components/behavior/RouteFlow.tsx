"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { isLowTier } from "@/lib/perf";
import { prefersReducedMotion } from "@/lib/scroll";
import "./RouteFlow.css";

type TransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<unknown> };
};

/** The longest the old page is held while the next one loads. */
const MAX_WAIT_MS = 1200;
/** The route styling must never outlive its transition (it would restyle the theme toggle's). */
const SCOPE_FAILSAFE_MS = MAX_WAIT_MS + 1500;
/** If a navigation never completes, the bar gives up after this long. */
const BAR_FAILSAFE_MS = 10000;

/**
 * Feedback and flow for going from one page to another.
 *
 * - A thin progress bar starts the instant an internal link is pressed and
 *   completes when the new page is on screen, so a slow network never looks
 *   like a dead click.
 * - Where the browser supports View Transitions, the page change is a soft
 *   fade-and-settle instead of a hard swap. The old page is held only until
 *   the new route has rendered (capped), so it can never trap the visitor.
 *
 * It takes over a click only for ordinary same-origin page links (not files,
 * downloads, new-tab or modified clicks, or same-page anchors, which
 * ScrollManager owns) and hands the navigation to the same router `<Link>`
 * uses, so history, scroll reset and prefetching behave exactly as before.
 * Without View Transitions, with reduced motion, or on a low performance tier,
 * it only shows the bar.
 */
export default function RouteFlow() {
  const router = useRouter();
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const settle = useRef<(() => void) | null>(null);
  const hideTimer = useRef(0);
  const failTimer = useRef(0);

  const finishBar = () => {
    const bar = barRef.current;
    window.clearTimeout(failTimer.current);
    if (!bar || bar.style.opacity !== "1") return;
    bar.style.transition = "transform 0.18s ease-out";
    bar.style.transform = "scaleX(1)";
    hideTimer.current = window.setTimeout(() => {
      bar.style.transition = "opacity 0.25s ease";
      bar.style.opacity = "0";
    }, 200);
  };

  const startBar = () => {
    const bar = barRef.current;
    if (!bar || prefersReducedMotion()) return;
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(failTimer.current);
    bar.style.transition = "none";
    bar.style.opacity = "1";
    bar.style.transform = "scaleX(0.04)";
    void bar.offsetWidth; // commit the reset before easing toward 92%
    bar.style.transition = "transform 9s cubic-bezier(0.08, 0.7, 0.2, 1)";
    bar.style.transform = "scaleX(0.92)";
    failTimer.current = window.setTimeout(finishBar, BAR_FAILSAFE_MS);
  };

  // The new route is on screen: complete the bar and release the held page.
  useEffect(() => {
    finishBar();
    settle.current?.();
    settle.current = null;
  }, [pathname]);

  useEffect(() => {
    const go = (href: string) => {
      startBar();
      const doc = document as TransitionDocument;
      const soft =
        typeof doc.startViewTransition === "function" && !prefersReducedMotion() && !isLowTier();
      if (!soft) {
        router.push(href);
        return;
      }

      const root = document.documentElement;
      root.setAttribute("data-vt", "route");
      try {
        const transition = doc.startViewTransition!(
          () =>
            new Promise<void>((resolve) => {
              settle.current = resolve;
              router.push(href);
              window.setTimeout(() => {
                if (settle.current !== resolve) return;
                settle.current = null;
                resolve();
              }, MAX_WAIT_MS);
            }),
        );
        const clearScope = () => root.removeAttribute("data-vt");
        void transition.finished.finally(clearScope);
        window.setTimeout(clearScope, SCOPE_FAILSAFE_MS);
      } catch {
        root.removeAttribute("data-vt");
        router.push(href);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (settle.current) return; // a page change is already in flight

      const link = (event.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download") || link.hasAttribute("data-no-transition")) return;
      if (link.origin !== location.origin) return;
      if (link.pathname === location.pathname) return; // anchors and same-page links
      // Files (the CV, images) and API routes are not pages.
      if (/\.[a-z0-9]{2,5}$/i.test(link.pathname) || link.pathname.startsWith("/api/")) return;

      event.preventDefault();
      go(link.pathname + link.search + link.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return <div ref={barRef} className="nav-progress" aria-hidden="true" />;
}
