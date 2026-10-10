"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

type CountUpProps = {
  value: number;
  suffix?: string;
  duration?: number;
};

export default function CountUp({ value, suffix = "", duration = 900 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      node.textContent = `${value}${suffix}`;
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${Math.round(eased * value)}${suffix}`;
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, suffix, duration]);

  return (
    <span ref={ref} className="inline-block min-w-[4ch] text-center tabular-nums">
      {`${value}${suffix}`}
    </span>
  );
}
