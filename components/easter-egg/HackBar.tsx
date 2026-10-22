"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

const TICK = 60;
const WIDTH = 10;

type Props = { label: string; ms: number; style?: CSSProperties };

/** A progress bar that fills the way a movie hacker's does: in jerks, with a
    stall or two, then a check mark. Reduced motion shows it already done.
    37 columns at most, so it fits the 40-column terminal. */
export default function HackBar({ label, ms, style }: Props) {
  const [pct, setPct] = useState(() => (prefersReducedMotion() ? 100 : 0));
  const peak = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const p = Math.min((performance.now() - start) / ms, 1);
      // A wobble on top of the straight line; the peak keeps it from going back.
      const wobble = p < 1 ? 0.07 * Math.sin(p * 17) : 0;
      peak.current = Math.max(peak.current, Math.min(100, Math.round((p + wobble) * 100)));
      setPct(p >= 1 ? 100 : peak.current);
      if (p >= 1) window.clearInterval(timer);
    }, TICK);
    return () => window.clearInterval(timer);
  }, [ms]);

  const filled = Math.round((pct / 100) * WIDTH);
  const done = pct >= 100;

  return (
    <div className="ln hkb" style={style} role="img" aria-label={`${label} ${pct}%`}>
      <span aria-hidden="true">
        <span className="dim">{`  ${label.padEnd(16)}[`}</span>
        <span className="hkf">{"█".repeat(filled)}</span>
        <span className="dim">{"░".repeat(WIDTH - filled)}]</span>
        {` ${String(pct).padStart(3, " ")}%`}
        {done ? <span className="ok"> ✔</span> : null}
      </span>
    </div>
  );
}
