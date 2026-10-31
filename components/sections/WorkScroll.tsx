"use client";

import { useEffect } from "react";
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
 * With reduced motion nothing here runs and every block keeps `--sy: 0`.
 */
export default function WorkScroll() {
  useEffect(() => {
    const root = document.getElementById("work");
    if (!root || typeof IntersectionObserver !== "function") return;

    const reduced = prefersReducedMotion();
    const near = new Set<HTMLElement>();
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      near.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centre = rect.top + rect.height / 2;
        const raw = (centre - viewport / 2) / (viewport / 2 + rect.height / 2);
        el.style.setProperty("--sy", Math.max(-1, Math.min(1, raw)).toFixed(3));
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.dataset.offscreen = entry.isIntersecting ? "false" : "true";
          if (!reduced && el.hasAttribute("data-px")) {
            if (entry.isIntersecting) near.add(el);
            else near.delete(el);
          }
        }
        schedule();
      },
      { rootMargin: "160px 0px" },
    );

    root.querySelectorAll<HTMLElement>("[data-pause]").forEach((el) => observer.observe(el));

    if (!reduced) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      near.forEach((el) => el.style.removeProperty("--sy"));
      root.querySelectorAll<HTMLElement>("[data-pause]").forEach((el) => {
        el.removeAttribute("data-offscreen");
      });
    };
  }, []);

  return null;
}
