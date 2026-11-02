"use client";

import { useEffect } from "react";
import { isLowTier, onLowTier } from "@/lib/perf";
import { prefersReducedMotion } from "@/lib/scroll";

/**
 * Ties the Work section to the page's smooth scroll.
 *
 * Lenis scrolls the real document (just with easing), so a plain scroll
 * listener sees every eased frame; there is no second source of truth to keep
 * in step. For each `[data-px]` block that is near the screen this sets
 * `--sy`, from -1 (entering from below) through 0 (centred) to 1 (leaving
 * above), and the stylesheet turns that into depth: the aurora and the rings
 * lag behind, the live window drifts, the trace card moves faster than the
 * window it overlaps, each card's diagram slides a little inside its stage.
 *
 * It also marks every `[data-pause]` block `data-offscreen` while it is away
 * from the viewport. The site's global rule then pauses that block's endless
 * loops (rings, packet, floating pills), the same mechanism the other bands use.
 *
 * Performance: all rects are read first and all writes happen after (no
 * layout thrash), the depth effect is skipped entirely on the "low" tier and
 * with reduced motion, and `data-scrolling` is held on #work while the page
 * moves so the one main-thread loop (the rings) can rest until it stops.
 */
export default function WorkScroll() {
  useEffect(() => {
    const root = document.getElementById("work");
    if (!root || typeof IntersectionObserver !== "function") return;

    let depth = !prefersReducedMotion() && !isLowTier();
    const near = new Set<HTMLElement>();
    let frame = 0;
    let idle = 0;

    const clearDepth = () => {
      near.forEach((el) => el.style.removeProperty("--sy"));
      near.clear();
    };

    const update = () => {
      frame = 0;
      if (!depth) return;
      const viewport = window.innerHeight;
      const els = Array.from(near);
      // Read everything, then write everything.
      const values = els.map((el) => {
        const rect = el.getBoundingClientRect();
        const centre = rect.top + rect.height / 2;
        const raw = (centre - viewport / 2) / (viewport / 2 + rect.height / 2);
        return Math.max(-1, Math.min(1, raw)).toFixed(3);
      });
      els.forEach((el, i) => el.style.setProperty("--sy", values[i]));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onScroll = () => {
      if (!root.hasAttribute("data-scrolling")) root.setAttribute("data-scrolling", "");
      window.clearTimeout(idle);
      idle = window.setTimeout(() => root.removeAttribute("data-scrolling"), 140);
      schedule();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.dataset.offscreen = entry.isIntersecting ? "false" : "true";
          if (depth && el.hasAttribute("data-px")) {
            if (entry.isIntersecting) near.add(el);
            else near.delete(el);
          }
        }
        schedule();
      },
      { rootMargin: "160px 0px" },
    );

    root.querySelectorAll<HTMLElement>("[data-pause]").forEach((el) => observer.observe(el));

    window.addEventListener("scroll", onScroll, { passive: true });
    if (depth) window.addEventListener("resize", schedule);

    // A device that turns out to be slow loses the depth effect at once.
    const offLow = onLowTier(() => {
      depth = false;
      window.removeEventListener("resize", schedule);
      clearDepth();
    });

    return () => {
      offLow();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      window.clearTimeout(idle);
      root.removeAttribute("data-scrolling");
      if (frame) cancelAnimationFrame(frame);
      clearDepth();
      root.querySelectorAll<HTMLElement>("[data-pause]").forEach((el) => {
        el.removeAttribute("data-offscreen");
      });
    };
  }, []);

  return null;
}
