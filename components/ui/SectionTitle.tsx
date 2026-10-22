"use client";

import { useEffect, useRef } from "react";

/**
 * The section h2. Its hand-drawn underline (`.sh h2::after` in globals.css) is
 * sized from `--sh-ul`, which this component keeps equal to the width of the
 * title's LAST rendered line.
 *
 * Why JS: when a title wraps, the h2 box stays as wide as its column while the
 * balanced lines are narrower, so a plain `width: 100%` underline overshoots
 * the text. CSS cannot read the width of the last line of wrapped text.
 * Without JS (or before hydration) the underline falls back to 100%.
 */
export default function SectionTitle({ id, children }: { id?: string; children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0);
      if (rects.length === 0) return;

      const lastBottom = Math.max(...rects.map((r) => r.bottom));
      const lastLine = rects.filter((r) => Math.abs(r.bottom - lastBottom) < 2);
      const left = Math.min(...lastLine.map((r) => r.left));
      const right = Math.max(...lastLine.map((r) => r.right));
      el.style.setProperty("--sh-ul", `${Math.ceil(right - left)}px`);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    // Web fonts change glyph widths after first paint.
    void document.fonts?.ready.then(fit);

    return () => observer.disconnect();
  }, [children]);

  return (
    <h2 id={id} ref={ref}>
      {children}
    </h2>
  );
}
