"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/scroll";
import { createStory } from "@/lib/story";
import "./ScrollStory.css";

/**
 * Starts the scroll story (see `lib/story.ts`) for the current page. It follows
 * Lenis's smoothed position, so the story moves with the glide instead of
 * jittering against the raw wheel. Mounted once in the root layout and re-armed
 * on every client navigation. Does nothing under reduced motion.
 */
export default function ScrollStory() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const story = createStory();
    let stop = () => {};

    // One frame later, so the new page has laid out and Lenis is registered.
    const start = requestAnimationFrame(() => {
      story.mount(window.scrollY);
      const lenis = getLenis();
      if (lenis) {
        stop = lenis.on("scroll", (instance) => story.update(instance.scroll));
      } else {
        const onScroll = () => story.update(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        stop = () => window.removeEventListener("scroll", onScroll);
      }
    });

    return () => {
      cancelAnimationFrame(start);
      stop();
      story.destroy();
    };
  }, [pathname]);

  return null;
}
