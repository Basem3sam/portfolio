"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Pauses every CSS animation inside a top-level band once it has scrolled out
 * of view. The page has a lot of endless loops (marquee, lane flow, pings,
 * sheens, the footer mist). Browsers keep ticking them off-screen, and on a
 * phone that is main-thread and compositor time spent on pixels nobody sees.
 *
 * This only flips `data-offscreen`; the rule in globals.css does the pausing
 * (`animation-play-state`), so nothing is removed and the loops resume exactly
 * where they stopped. No effect on layout, content or transitions.
 *
 * Bands alone are not enough: the Work band is thousands of pixels tall and is
 * "visible" whenever any part of it is, yet each project plate runs its own
 * loops. So the plates and the Stack lanes are observed on their own too.
 */
export default function PauseOffscreen() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.offscreen = entry.isIntersecting ? "false" : "true";
        }
      },
      { rootMargin: "120px 0px" },
    );

    const bands = document.querySelectorAll<HTMLElement>(
      "main > *, footer.foot, main .plate, main .stx-lanes",
    );
    bands.forEach((band) => observer.observe(band));

    return () => {
      observer.disconnect();
      bands.forEach((band) => band.removeAttribute("data-offscreen"));
    };
  }, [pathname]);

  return null;
}
