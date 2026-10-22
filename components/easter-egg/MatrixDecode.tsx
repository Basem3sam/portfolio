"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

/** Plain ASCII only: every glyph is one cell wide in the terminal face, so the
    line never changes width while it resolves. */
const NOISE = "01<>/\\|{}[];=+*#$%@:.";
const TICK = 50;

type Props = { text: string; ms?: number; style?: CSSProperties };

/** A line that starts as falling-code noise and locks in left to right, the
    way the film resolves a screen. Reduced motion shows the final text. */
export default function MatrixDecode({ text, ms = 1500, style }: Props) {
  const [t, setT] = useState(() => (prefersReducedMotion() ? ms : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      setT(Math.min(elapsed, ms));
      if (elapsed >= ms) window.clearInterval(timer);
    }, TICK);
    return () => window.clearInterval(timer);
  }, [ms]);

  const resolved = Math.floor((t / ms) * text.length);
  const noise = text
    .slice(resolved)
    .replace(/\S/g, () => NOISE[Math.floor(Math.random() * NOISE.length)]);

  return (
    <div className="ln mxd" style={style} role="img" aria-label={text.trim()}>
      <span className="mxr" aria-hidden="true">
        {text.slice(0, resolved)}
      </span>
      <span className="mxn" aria-hidden="true">
        {noise}
      </span>
    </div>
  );
}
