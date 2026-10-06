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
