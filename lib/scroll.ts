const SCROLL_DURATION = 800;

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

  const padding = nav.dataset.scrolled === "true" ? 16 : 24;
  return logo.offsetHeight + padding + 1;
}
