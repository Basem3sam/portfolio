"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SpotlightProps = {
  className?: string;
  /** Opts the card into the scroll story (see lib/story.ts). */
  story?: "enter" | "pass" | "read" | "exit";
  children: ReactNode;
  style?: React.CSSProperties;
};

/**
 * An <article> that tells CSS where the pointer is (--mx / --my, in px relative
 * to the card) so the `spotlight` utility can paint a glow under it. Pointer
 * events stop while the page scrolls under a still cursor, so while hovered it
 * also re-reads the last known position on scroll.
 */
export default function Spotlight({ className = "", story, children, style }: SpotlightProps) {
  const ref = useRef<HTMLElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  const apply = () => {
    frame.current = 0;
    const el = ref.current;
    const point = last.current;
    if (!el || !point) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${point.x - rect.left}px`);
    el.style.setProperty("--my", `${point.y - rect.top}px`);
  };

  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(apply);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      last.current = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onEnter = () => window.addEventListener("scroll", schedule, { passive: true });
    const onLeave = () => {
      window.removeEventListener("scroll", schedule);
      last.current = null;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", schedule);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article ref={ref} className={className} style={style} data-story={story}>
      {children}
    </article>
  );
}
