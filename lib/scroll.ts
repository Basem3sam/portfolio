import type { Locale } from "@/lib/i18n";

const SCROLL_DURATION = 800;

/**
 * Absolute href for a section that only exists on the home page.
 *
 * Section anchors such as `#work` resolve only on `/`. Rendered unchanged on
 * any other route they produce URLs like `/work/trosc#work`, where the element
 * does not exist and nothing scrolls — so callers that can render outside the
 * home page must prefix them.
 *
 * English home is `/` because `proxy.ts` rewrites it to `/en`; this matches the
 * convention already used by the work index redirect and the TROSC case study
 * back-link.
 */
export function homeAnchorHref(locale: Locale, hash: string) {
  return locale === "ar" ? `/ar${hash}` : `/${hash}`;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "instant" : "smooth";
}

export function scrollToPosition(top: number, onComplete?: () => void) {
  if (Math.abs(top - window.scrollY) < 2 || prefersReducedMotion()) {
    window.scrollTo({ top, behavior: "instant" });
    onComplete?.();
    window.dispatchEvent(new CustomEvent("navbar-sync-section"));
    return () => {};
  }

  let finished = false;

  const stop = () => {
    window.removeEventListener("scroll", handleScroll);
    window.clearTimeout(timer);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    stop();
    onComplete?.();
  };

  const handleScroll = () => {
    if (Math.abs(window.scrollY - top) < 5) finish();
  };

  const timer = window.setTimeout(finish, SCROLL_DURATION);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.scrollTo({ top, behavior: "smooth" });

  return () => {
    finished = true;
    stop();
  };
}

// Height of the navbar's top bar only. nav.offsetHeight also includes the
// expanded mobile menu, which would corrupt every scroll offset computed
// while (or just after) the menu is open.
export function getNavbarHeight() {
  const nav = document.querySelector<HTMLElement>("nav[data-scrolled]");
  const logo = nav?.querySelector<HTMLElement>("[data-nav-logo]");
  if (!nav || !logo) return 70;

  // Matches `nav-shell`: 22px per side at the top, 16px once the capsule forms.
  const padding = nav.dataset.scrolled === "true" ? 32 : 44;
  return logo.offsetHeight + padding + 1;
}
