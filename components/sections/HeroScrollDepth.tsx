"use client";

import { useEffect } from "react";
import { isLowTier, onLowTier } from "@/lib/perf";
import { prefersReducedMotion } from "@/lib/scroll";

/**
 * Depth for the hero: as the reader scrolls away, the sky (both canvases)
 * drifts down at a fraction of the page's speed, so it reads as farther away
 * than the copy and the portrait. At rest the offset is 0, so the first screen
 * is unchanged. The hero clips its overflow, and a downward drift only ever
 * uncovers the part of the sky that is already above the viewport. Writes one
 * CSS variable on the hero, only while it is on screen; none under reduced
 * motion.
 */
export default function HeroScrollDepth() {
  useEffect(() => {
    if (prefersReducedMotion() || isLowTier()) return;
    const hero = document.getElementById("hero");
    if (!hero) return;

    let frame = 0;
    let visible = true;

    const write = () => {
      frame = 0;
      const y = Math.min(Math.max(window.scrollY, 0), hero.offsetHeight);
      hero.style.setProperty("--hero-drift", `${(y * 0.28).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(write);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });
    observer.observe(hero);
    window.addEventListener("scroll", onScroll, { passive: true });
    write();

    const teardown = () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      hero.style.removeProperty("--hero-drift");
    };
    const offLow = onLowTier(teardown);

    return () => {
      offLow();
      teardown();
    };
  }, []);

  return null;
}
