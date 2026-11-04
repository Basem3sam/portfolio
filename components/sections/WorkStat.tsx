"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

type WorkStatProps = {
  /** A figure as written: "100+", "94.8%", "12". */
  value: string;
  duration?: number;
};

/**
 * A headline figure that counts up to itself once, the first time it is mostly
 * on screen. The server renders the final value, so with no script, or with
 * reduced motion, nothing is ever shown but the real number. The suffix (+ or
 * %) is set apart so it can be styled lighter.
 */
export default function WorkStat({ value, duration = 1500 }: WorkStatProps) {
  const root = useRef<HTMLSpanElement>(null);
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const figure = match ? match[1] : value;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    const node = root.current?.firstElementChild as HTMLElement | null;
    if (!root.current || !node || !match || prefersReducedMotion()) return;

    const target = Number.parseFloat(match[1]);
    const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
    let raf = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        node.textContent = (eased * target).toFixed(decimals);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver !== "function") return;

    // Off screen the figure waits at zero; nobody sees the swap.
    node.textContent = (0).toFixed(decimals);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    observer.observe(root.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      node.textContent = match[1];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span ref={root}>
      <span>{figure}</span>
      {suffix && <em>{suffix}</em>}
    </span>
  );
}
