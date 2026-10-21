"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getNavbarHeight, scrollBehavior, scrollToPosition } from "@/lib/scroll";

// The section's own top padding already clears the floating bar, so the
// section edge lands under it and the heading sits just below. A fixed
// offset used to leave the previous section peeking above, or cut the
// heading, depending on the section's padding.
function getOffset(target: HTMLElement) {
  const padding = parseFloat(window.getComputedStyle(target).paddingTop) || 0;
  return Math.max(0, getNavbarHeight() - padding + 16);
}

function topFor(target: HTMLElement) {
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - getOffset(target));
}

// Images and the GitHub cards finish loading after a jump and move everything
// below them, so the landing is checked again and nudged back into place -
// unless the reader has already scrolled on their own.
function settleOn(target: HTMLElement) {
  let expected = window.scrollY;

  [140, 900].forEach((delay) =>
    window.setTimeout(() => {
      if (!target.isConnected || Math.abs(window.scrollY - expected) > 3) return;
      const drift = topFor(target) - window.scrollY;
      if (Math.abs(drift) < 3) return;
      window.scrollBy({ top: drift, behavior: "instant" });
      expected = window.scrollY;
    }, delay),
  );
}

function findTarget(hash: string) {
  try {
    return document.querySelector<HTMLElement>(hash);
  } catch {
    return null;
  }
}

/** Hashes that pointed at sections which have since moved or merged. */
const LEGACY_HASHES: Record<string, string> = {
  "#education": "#about",
};

export default function ScrollManager() {
  const pathname = usePathname();

  // Reconcile the hash after a cross-route navigation.
  //
  // This component lives in the root layout, so it never unmounts between
  // routes: React has committed the destination DOM by the time this effect
  // runs, which is what makes "scroll once the section exists" reliable without
  // polling or timeouts. It covers client-side navigation to `/#section`,
  // direct loads of such URLs, and back/forward.
  //
  // In-page clicks never reach here — they call `preventDefault()` and update
  // the URL with `pushState`, which does not change the pathname.
  useEffect(() => {
    const raw = window.location.hash;
    if (!raw || raw === "#" || raw === "#0") return;

    // Education was merged into About: old bookmarks and shared links still
    // carry `#education`, which no longer exists. Rewrite the URL in place so
    // they land on the section that absorbed it instead of nowhere.
    const hash = LEGACY_HASHES[raw] ?? raw;
    if (hash !== raw) window.history.replaceState(null, "", hash);

    const target = findTarget(hash);
    if (!target) return;

    // Arriving at a destination, not moving within a page: the browser was
    // reset to the top by the navigation, so jump rather than animate.
    window.scrollTo({ top: topFor(target), behavior: "instant" });

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent("navbar-sync-section"));

    // Late layout above the target - the live GitHub block swapping its
    // skeleton for cards, an image load - grows the page and leaves the
    // reader short of the section they asked for (the browser's own scroll
    // anchoring does not correct hash landings after a route change).
    // Track the target's document position and compensate for shifts while
    // the landing settles; the window is time-boxed so the correction can
    // never follow the reader around later.
    let anchorTop = target.getBoundingClientRect().top + window.scrollY;
    const reflow = new ResizeObserver(() => {
      if (!target.isConnected) return;
      const nextTop = target.getBoundingClientRect().top + window.scrollY;
      const delta = nextTop - anchorTop;
      anchorTop = nextTop;
      if (delta !== 0) window.scrollBy({ top: delta, behavior: "instant" });
    });
    reflow.observe(document.body);
    const settle = window.setTimeout(() => reflow.disconnect(), 3000);

    return () => {
      reflow.disconnect();
      window.clearTimeout(settle);
    };
  }, [pathname]);

  useEffect(() => {
    let cancelScroll = () => {};

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!hash) return;

      if (hash === "#" || hash === "#0") {
        event.preventDefault();
        return;
      }

      const target = findTarget(hash);
      if (!target) return;

      event.preventDefault();
      cancelScroll();

      cancelScroll = scrollToPosition(topFor(target), () => {
        history.pushState(null, "", hash);
        settleOn(target);
        window.setTimeout(() => {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, 100);
        window.dispatchEvent(new CustomEvent("navbar-sync-section"));
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (event.key === " " && target.matches('a[href^="#"]')) {
        event.preventDefault();
        target.click();
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (target.matches("input, textarea, select") || target.isContentEditable) return;

      switch (event.key) {
        case "PageDown":
        case "PageUp": {
          event.preventDefault();
          const direction = event.key === "PageDown" ? 1 : -1;
          window.scrollBy({
            top: window.innerHeight * 0.8 * direction,
            behavior: scrollBehavior(),
          });
          break;
        }
        case "Home":
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: scrollBehavior() });
          break;
        case "End":
          event.preventDefault();
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: scrollBehavior(),
          });
          break;
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      cancelScroll();
    };
  }, []);

  return null;
}
