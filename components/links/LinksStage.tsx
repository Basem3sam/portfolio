"use client";

import { useEffect, useRef } from "react";
import { PROFILE_CUTOUT } from "@/data/site";
import { mountGlassFold } from "@/lib/glassfold";
import { subscribeToTheme } from "@/lib/theme";

/**
 * The /links profile-card stage: a themed gradient plate with the cutout
 * portrait bottom-aligned over the GlassFold WebGL canvas (mockup line 2812).
 *
 * Degradation ladder — the card must never show a blank rectangle:
 *  1. no WebGL / no `--gf-*` palette / shader failure → the canvas is flagged
 *     `data-glassfold="off"`, hidden, and the stage's CSS gradient carries it;
 *  2. `prefers-reduced-motion: reduce` → one static frame, redrawn only on
 *     resize or theme change;
 *  3. otherwise the folds drift, pausing while off-screen or while the tab is
 *     hidden, resizing with the stage (DPR capped in lib/glassfold).
 *
 * The canvas is `aria-hidden` and pointer-transparent; all colours live in
 * LinksPage.css (lib/glassfold reads them back off this stage element), so
 * this path stays free of colour literals. The portrait follows the home
 * hero's `<picture>` cutout pattern.
 */
type LinksStageProps = {
  /** Portrait alt text (the profile name). */
  alt: string;
};

export default function LinksStage({ alt }: LinksStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glassfold = mountGlassFold(canvas, stage, { staticFrame: reducedMotion });

    if (!glassfold) {
      canvas.dataset.glassfold = "off";
      return;
    }

    // The theme swap re-reads --gf-1 … --gf-3. The mockup picks its palette
    // every frame; here the event keeps getComputedStyle out of the loop.
    const unsubscribe = subscribeToTheme(() => glassfold.recolor());

    return () => {
      unsubscribe();
      glassfold.destroy();
    };
  }, []);

  return (
    <div className="lk-stage" ref={stageRef}>
      <canvas className="lk-gl" ref={canvasRef} aria-hidden="true" />
      <picture>
        <source srcSet={PROFILE_CUTOUT} type="image/webp" />
        <img
          src={PROFILE_CUTOUT}
          alt={alt}
          width={640}
          height={598}
          className="lk-photo"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
}
