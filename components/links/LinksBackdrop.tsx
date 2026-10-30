"use client";

import { useEffect, useRef } from "react";
import { isLowTier, onLowTier } from "@/lib/perf";

type RGB = [number, number, number];

/** Reads `#rgb`, `#rrggbb` or `rgb()` (the forms the theme tokens use). */
function parseColor(value: string, fallback: RGB): RGB {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].replace(/./g, "$&$&") : hex[1];
    const n = parseInt(digits, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i.exec(text);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : fallback;
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Quiet four-point stars (the hero's sparkles), as fractions of the viewport. */
const STARS: ReadonlyArray<{ x: number; y: number; size: number; phase: number }> = [
  { x: 0.07, y: 0.14, size: 9, phase: 0.0 },
  { x: 0.93, y: 0.2, size: 12, phase: 1.7 },
  { x: 0.05, y: 0.74, size: 7, phase: 3.1 },
  { x: 0.9, y: 0.82, size: 10, phase: 4.6 },
  { x: 0.52, y: 0.035, size: 6, phase: 2.4 },
];

const LEVELS = 8;
const INTRO_MS = 1900;
const FRAME_MS = 1000 / 30;

/**
 * The page's background: a halftone dot field in the site's own motif (the home
 * hero is made of the same dots). Dots are large and bold toward the edges and
 * corners and almost vanish behind the content, so it frames the page without
 * touching legibility. A slow diagonal wave moves through it, it assembles
 * outward from the card on load, and dots swell (and warm to honey) around the
 * cursor. Colours come from the theme tokens, so it follows light/dark.
 *
 * Cost is small by design: a few thousand dots, drawn in 8 radius batches at
 * 30fps, paused while the tab is hidden. With `prefers-reduced-motion` it is a
 * single static frame. Touch screens get the wave but no cursor swell.
 */
export default function LinksBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // `let`: a device that turns out to be struggling drops to the still version.
    let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || isLowTier();
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let gap = 18;
    let ink: RGB = [59, 91, 245];
    let warm: RGB = [240, 174, 42];
    let frame = 0;
    let lastDraw = 0;
    let started = 0;
    let resizeTimer = 0;

    // Pointer (viewport px), eased so the swell glides rather than jumps.
    let px = -9999;
    let py = -9999;
    let tx = -9999;
    let ty = -9999;
    let swell = 0;
    let swellTarget = 0;

    const readColors = () => {
      const style = getComputedStyle(document.body);
      ink = parseColor(style.getPropertyValue("--c-secondary"), ink);
      warm = parseColor(style.getPropertyValue("--c-honey-hi"), warm);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      gap = width < 600 ? 15 : 18;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawStar = (x: number, y: number, r: number) => {
      const k = r * 0.28;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x + k, y - k, x + r, y);
      ctx.quadraticCurveTo(x + k, y + k, x, y + r);
      ctx.quadraticCurveTo(x - k, y + k, x - r, y);
      ctx.quadraticCurveTo(x - k, y - k, x, y - r);
      ctx.fill();
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const t = now - started;
      const intro = reduced ? 1 : clamp01((t - 150) / INTRO_MS);
      const introEase = 1 - Math.pow(1 - intro, 3);
      const rMax = gap * 0.36;
      // On a phone the content covers the full width, so the field is quieter.
      const strength = width < 600 ? 0.62 : 1;
      const centreX = width * 0.5;
      const centreY = height * 0.46;
      const swellRadius = 150;

      const hot = new Path2D();
      let hotCount = 0;
      const fresh = Array.from({ length: LEVELS }, () => new Path2D());

      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      // Offset alternate rows so the field reads as a halftone screen, not a grid.
      for (let row = 0; row < rows; row++) {
        const y = row * gap;
        const shift = row % 2 ? gap / 2 : 0;
        for (let col = 0; col < cols; col++) {
          const x = col * gap + shift;
          const nx = (x - centreX) / (width * 0.5);
          const ny = (y - centreY) / (height * 0.5);
          // Distance from the middle, weighted toward the sides: the content
          // runs top to bottom, so the free space is the margins.
          const dist = Math.hypot(nx, ny * 0.6);
          // 0 behind the content, 1 out in the margins and corners.
          const edge = smooth(0.58, 1.12, dist);
          const wave = reduced
            ? 0.5
            : 0.5 + 0.5 * Math.sin((x * 0.9 + y * 0.55) / 150 - t * 0.0006);
          let r = rMax * strength * Math.pow(edge, 1.35) * (0.6 + 0.4 * wave);
          // Assemble outward from the middle on load.
          r *= smooth(0, 1, introEase * 1.7 - dist);

          let isHot = false;
          if (swell > 0.01) {
            const d = Math.hypot(x - px, y - py);
            if (d < swellRadius) {
              const k = Math.pow(1 - d / swellRadius, 2) * swell;
              r = Math.max(r, rMax * 0.25 * k) + rMax * 0.95 * k;
              isHot = k > 0.32;
            }
          }
          if (r < 0.45) continue;

          if (isHot) {
            hot.moveTo(x + r, y);
            hot.arc(x, y, r, 0, Math.PI * 2);
            hotCount++;
          } else {
            const level = Math.min(LEVELS - 1, Math.round((r / (rMax * 1.9)) * (LEVELS - 1)));
            fresh[level].moveTo(x + r, y);
            fresh[level].arc(x, y, r, 0, Math.PI * 2);
          }
        }
      }

      // Each level is drawn at one alpha: bigger dots a touch stronger.
      for (let level = 0; level < LEVELS; level++) {
        ctx.fillStyle = rgba(ink, 0.12 + 0.26 * (level / (LEVELS - 1)));
        ctx.fill(fresh[level]);
      }
      if (hotCount) {
        ctx.fillStyle = rgba(warm, 0.75);
        ctx.fill(hot);
      }

      // Stars come in after the dots, twinkling slowly.
      const starIn = smooth(0.55, 1, introEase);
      if (starIn > 0.01) {
        for (const star of STARS) {
          const twinkle = reduced ? 0.7 : 0.5 + 0.5 * Math.sin(t * 0.0011 + star.phase);
          ctx.fillStyle = rgba(warm, (0.28 + 0.5 * twinkle) * starIn);
          drawStar(star.x * width, star.y * height, star.size * (0.8 + 0.25 * twinkle));
        }
      }
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (document.hidden || now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      px += (tx - px) * 0.25;
      py += (ty - py) * 0.25;
      swell += (swellTarget - swell) * 0.12;
      draw(now);
    };

    const onMove = (event: PointerEvent) => {
      if (px < -9000) {
        px = event.clientX;
        py = event.clientY;
      }
      tx = event.clientX;
      ty = event.clientY;
      swellTarget = 1;
    };
    const onLeave = () => {
      swellTarget = 0;
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduced) draw(performance.now());
      }, 120);
    };

    // Follow the theme toggle (it flips a class on <body>).
    const theme = new MutationObserver(() => {
      readColors();
      if (reduced) draw(performance.now());
    });
    theme.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    readColors();
    resize();
    started = performance.now();
    window.addEventListener("resize", onResize);

    if (reduced) {
      draw(started);
    } else {
      frame = requestAnimationFrame(loop);
      if (fine) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }
    }

    const offLow = onLowTier(() => {
      reduced = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      draw(performance.now());
    });

    return () => {
      offLow();
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      theme.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="lk-bd" aria-hidden="true" />;
}
