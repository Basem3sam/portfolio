"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Pauses every CSS animation inside a top-level band once it has scrolled out
 * of view. The page has a lot of endless loops (marquee, lane flow, pings,
 * sheens, the footer mist). Browsers keep ticking them off-screen, and on a
 * phone that is main-thread and compositor time spent on pixels nobody sees.
 *
 * This only flips `data-offscreen` on the band; Footer/globals CSS does the
 * pausing (`animation-play-state`), so nothing is removed and the loops resume
 * exactly where they stopped. No effect on layout, content or transitions.
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

    const bands = document.querySelectorAll<HTMLElement>("main > *, footer.foot");
    bands.forEach((band) => observer.observe(band));

    return () => {
      observer.disconnect();
      bands.forEach((band) => band.removeAttribute("data-offscreen"));
    };
  }, [pathname]);

  return null;
}
