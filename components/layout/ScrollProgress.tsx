"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const bar = barRef.current;
      const doc = document.scrollingElement;
      if (!bar || !doc) return;

      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) {
        bar.style.width = "0%";
        return;
      }

      // Fractional-DPI environments (Windows display scaling) can leave the
      // reachable maximum scroll a pixel or two short of the theoretical
      // maximum; snap to complete when we are within 2px of the bottom.
      const remaining = scrollable - window.scrollY;
      const progress = remaining <= 2 ? 1 : Math.min(window.scrollY / scrollable, 1);
      bar.style.width = `${progress * 100}%`;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={barRef}
      data-testid="scroll-progress"
      className="fixed inset-x-0 top-0 z-[1035] h-0.5 w-0 bg-secondary opacity-90 print:hidden"
      aria-hidden="true"
    ></div>
  );
}