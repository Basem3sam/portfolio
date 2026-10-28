"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLenis, setLenis } from "@/lib/lenis";

/**
 * Smooth wheel scrolling for every route (home, case study, links, both
 * languages). It sits in the root layout, so one instance lives across client
 * navigations.
 *
 * Choices, each for a reason:
 * - Native scroll underneath: sticky panels, the scroll-spy, the progress rail
 *   and the timeline keep reading `window.scrollY` and keep working.
 * - `lerp` (not duration): the page answers the wheel immediately and settles
 *   smoothly, which suits a reading-heavy page better than a fixed-time glide.
 * - Touch stays native: phones already have good momentum scrolling.
 * - `anchors` is off: `ScrollManager` owns in-page links because it knows the
 *   floating navbar's real height.
 * - `allowNestedScroll`: the command palette, mobile menu, terminal and code
 *   panes scroll natively instead of being captured by the page.
 * - Reduced motion: Lenis does not run at all (plain native scrolling, instant
 *   jumps). It starts and stops live if the system setting changes.
 */
/**
 * The two numbers that decide how the scroll feels. `LERP` is how much of the
 * remaining distance is covered each frame: higher is snappier, lower is
 * floatier (0.1 felt slow; 0.14 settles about twice as fast and is still
 * silky). `WHEEL` scales how far one wheel notch travels.
 */
const LERP = 0.14;
const WHEEL = 1.15;

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const start = () => {
      if (lenis || reduced.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: LERP,
        wheelMultiplier: WHEEL,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        allowNestedScroll: true,
      });
      setLenis(lenis);
    };

    const stop = () => {
      if (!lenis) return;
      setLenis(null);
      lenis.destroy();
      lenis = null;
    };

    const sync = () => (reduced.matches ? stop() : start());
    sync();
    reduced.addEventListener("change", sync);

    return () => {
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, []);

  // A client navigation swaps the page under a live instance. If the reader
  // was still gliding, the old target would drag the new page along, so cancel
  // the glide (stop/start is Lenis's public way to do that). Back/forward
  // scroll restoration still wins because it sets the native position, which
  // Lenis re-reads on its next native scroll event.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis || lenis.isStopped) return;
    lenis.stop();
    lenis.start();
    lenis.resize();
  }, [pathname]);

  return null;
}
