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

    // The shader code lives in its own chunk: this band is far below the fold,
    // so it should not weigh on the first load. `cancelled` covers unmounting
    // (or a Strict Mode re-run) before the chunk arrives.
    let cancelled = false;
    let destroy: (() => void) | undefined;

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

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="tide-cv" aria-hidden="true" />;
}
