"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative WebGL tide behind the Contact band (mockup `.warp[data-preset="tide"]`).
 *
 * Degradation ladder — the section must never show a blank rectangle:
 *  1. no WebGL / context failure / no `--tide-*` palette / shader failure →
 *     the canvas is flagged `data-tide="off"`, hidden, and the section's
 *     CSS gradient carries the band;
 *  2. `prefers-reduced-motion: reduce` → one static frame, no loop;
 *  3. otherwise the field drifts, pausing while off-screen or while the
 *     tab is hidden, and resizing with the section (DPR capped in lib/tide).
 *
 * The canvas is `aria-hidden` and pointer-transparent; all colours live in
 * Contact.css so this path stays free of colour literals.
 */
export default function TideCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // The palette lives on the host element that carries `--tide-*`: the
    // contact section, the case-study hero, or an easter-egg overlay.
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The shader code lives in its own chunk, and the band sits far below the
    // fold. Neither the chunk nor the GL context (compile + link) is worth
    // paying for during hydration: both wait until the band is a screen or so
    // away. The CSS gradient under the transparent canvas carries it until then.
    // `cancelled` covers unmounting (or a Strict Mode re-run) in the meantime.
    let cancelled = false;
    let destroy: (() => void) | undefined;
    let started = false;

    const boot = () => {
      if (started || cancelled) return;
      started = true;
      import("@/lib/tide")
        .then(({ mountTide }) => {
          if (cancelled) return;
          const tide = mountTide(canvas, host, { staticFrame: reducedMotion });

          if (!tide) {
            canvas.dataset.tide = "off";
            return;
          }

          destroy = () => tide.destroy();
        })
        .catch(() => {
          if (!cancelled) canvas.dataset.tide = "off";
        });
    };

    let near: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      near = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          near?.disconnect();
          boot();
        },
        { rootMargin: "700px 0px" },
      );
      near.observe(canvas);
    } else {
      boot();
    }

    return () => {
      cancelled = true;
      near?.disconnect();
      destroy?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="tide-cv" aria-hidden="true" />;
}
