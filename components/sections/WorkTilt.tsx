"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

type WorkTiltProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Tells CSS where the pointer is inside the flagship's artwork, as --px / --py
 * from -1 to 1, so the live-site window can lean toward it and the trace card
 * can drift the other way. Mouse and pen only; touch and reduced motion get
 * the resting pose.
 */
export default function WorkTilt({ className, children }: WorkTiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    const set = (x: number, y: number) => {
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => set(x, y));
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      set(0, 0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
