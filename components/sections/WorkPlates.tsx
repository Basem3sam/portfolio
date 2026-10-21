"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

/**
 * The featured project's KPI wall (`<dl class="kp">`). The tiles themselves
 * are server-rendered; this wrapper only adds two small pointer/scroll
 * behaviours from the mockup (rev 12 / rev 23):
 *
 * - `.sg` on the wall once it scrolls into view — the segment micro-graphs
 *   inside the tiles grow from a stub to full height (Work.css).
 * - a two-degree tilt toward the pointer on the hovered tile
 *   (`--rx` / `--ry`, read by `.kpi`'s transform in Work.css).
 *
 * Both are skipped under `prefers-reduced-motion`. Without JavaScript the
 * tiles simply stay flat and the segment graphics keep their static state.
 */
export default function WorkKpis({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const wall = ref.current;
    if (!wall || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          wall.classList.add("sg");
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(wall);

    const tiles = Array.from(wall.querySelectorAll<HTMLElement>(".kpi"));
    const detach: Array<() => void> = [];

    for (const tile of tiles) {
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = tile.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        tile.classList.add("tilting");
        tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
        tile.style.setProperty("--rx", `${(-py * 3).toFixed(2)}deg`);
        tile.style.setProperty("--ry", `${(px * 3).toFixed(2)}deg`);
      };
      const onLeave = () => {
        tile.classList.remove("tilting");
        tile.style.setProperty("--rx", "0deg");
        tile.style.setProperty("--ry", "0deg");
      };

      tile.addEventListener("pointermove", onMove);
      tile.addEventListener("pointerleave", onLeave);
      detach.push(() => {
        tile.removeEventListener("pointermove", onMove);
        tile.removeEventListener("pointerleave", onLeave);
      });
    }

    return () => {
      observer.disconnect();
      detach.forEach((fn) => fn());
    };
  }, []);

  return (
    <dl ref={ref} className="kp" data-n={Math.max(Children.count(children), 1)} data-animate>
      {children}
    </dl>
  );
}
