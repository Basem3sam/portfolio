import { getLenis } from "@/lib/lenis";
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

/** Expo-out: fast departure, long soft landing. Matches Lenis's own wheel feel. */
const easeOutExpo = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/** Longer trips take a little longer, but never feel slow or abrupt. */
function travelSeconds(distance: number) {
  return Math.min(1.8, Math.max(0.8, 0.7 + distance / 3200));
}

/** Jump without animation, keeping Lenis's internal position in step. */
export function scrollToImmediate(top: number) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, { immediate: true, force: true });
    // `scrollTo` skips work when the target equals Lenis's own target; make
    // sure the browser agrees in every case.
    if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: "instant" });
    return;
  }
  window.scrollTo({ top, behavior: "instant" });
}

export function scrollByImmediate(delta: number) {
  scrollToImmediate(window.scrollY + delta);
}

/**
 * Glide to an absolute document position and report when it lands. The
 * returned function cancels the completion callback (an interrupted glide -
 * the reader scrolled away - never reports a landing).
 */
export function scrollToPosition(top: number, onComplete?: () => void) {
  if (Math.abs(top - window.scrollY) < 2 || prefersReducedMotion()) {
    scrollToImmediate(top);
    onComplete?.();
    window.dispatchEvent(new CustomEvent("navbar-sync-section"));
    return () => {};
  }

  const lenis = getLenis();
  if (lenis && !lenis.isStopped) {
    let cancelled = false;
    lenis.scrollTo(top, {
      duration: travelSeconds(Math.abs(top - lenis.scroll)),
      easing: easeOutExpo,
      onComplete: () => {
        if (!cancelled) onComplete?.();
      },
    });
    return () => {
      cancelled = true;
    };
  }

  // Native fallback (no Lenis yet, or it failed to start).
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

/** Time to wait before treating a scroll-to-top as finished (matches the glide). */
export const SCROLL_TOP_SETTLE_MS = 1900;

export function scrollToTop() {
  return scrollToPosition(0);
}

export function scrollToBottom() {
  return scrollToPosition(Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
}

/** Scroll by a page-ish amount (PageUp / PageDown). */
export function scrollByPage(direction: 1 | -1) {
  const lenis = getLenis();
  const base = lenis ? lenis.targetScroll : window.scrollY;
  const top = Math.max(0, base + window.innerHeight * 0.8 * direction);
  scrollToPosition(top);
}

/**
 * Bring an element fully into view with a small margin, only if it is cut off
 * at the bottom (what `scrollIntoView({ block: "nearest" })` did, but on the
 * same easing as every other scroll).
 */
export function revealBelow(element: HTMLElement, margin = 16) {
  const { bottom } = element.getBoundingClientRect();
  const overflow = bottom - (window.innerHeight - margin);
  if (overflow <= 0) return;
  scrollToPosition(window.scrollY + overflow);
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
