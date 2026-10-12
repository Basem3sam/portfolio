"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getNavbarHeight, scrollBehavior, scrollToPosition } from "@/lib/scroll";

function getOffset() {
  const navbar = document.querySelector<HTMLElement>("nav[data-scrolled]");
  const height = getNavbarHeight();
  let offset = navbar?.dataset.scrolled === "true" ? height - 10 : height + 10;

  if (window.innerWidth < 768) offset *= 0.8;

  return Math.max(50, offset);
}

function findTarget(hash: string) {
  try {
    return document.querySelector<HTMLElement>(hash);
  } catch {
    return null;
  }
}

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
    const { hash } = window.location;
    if (!hash || hash === "#" || hash === "#0") return;

    const target = findTarget(hash);
    if (!target) return;

    // Arriving at a destination, not moving within a page: the browser was
    // reset to the top by the navigation, so jump rather than animate.
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getOffset());
    window.scrollTo({ top, behavior: "instant" });

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent("navbar-sync-section"));
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

      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getOffset());

      cancelScroll = scrollToPosition(top, () => {
        history.pushState(null, "", hash);
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
