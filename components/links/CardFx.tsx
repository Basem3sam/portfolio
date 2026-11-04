"use client";

import { useEffect, useRef } from "react";

/**
 * The profile card leans a few degrees toward the pointer, a soft light follows
 * it, and the portrait and ring shift by different amounts so the layers read
 * as sitting at different depths. This component only writes CSS variables on
 * the card; every visual decision lives in LinksPage.css.
 *
 * Smoothness is the point, so one number drives everything. `lift` (0..1) is
 * how much of the effect is currently on. It eases in when the pointer enters
 * and out when it leaves, and the tilt, the shadow, the light and the parallax
 * are all scaled by it. Entering therefore starts from rest and builds up
 * (instead of snapping to wherever the pointer happened to cross the edge),
 * and leaving fades the lean out in the direction it was already leaning
 * (instead of swinging back through the centre). The card always carries an
 * identity transform, so nothing pops when the effect starts or stops.
 *
 * All easing is by elapsed time, so 60, 120 and 144Hz screens feel the same.
 * The loop only runs while the effect is visible; at rest nothing runs. It is
 * skipped entirely for touch pointers and under `prefers-reduced-motion`,
 * where the static card is complete on its own.
 */
const MAX_TILT = 5;
/** Share of the remaining distance covered per 60Hz frame. */
const FOLLOW = 0.1;
const FADE_IN = 0.085;
const FADE_OUT = 0.06;
const FRAME = 1000 / 60;

const smooth = (t: number) => t * t * (3 - 2 * t);

export default function CardFx() {
  const glareRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const glare = glareRef.current;
    const card = glare?.parentElement;
    if (!glare || !card) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduced) return;

    let frame = 0;
    let last = 0;
    let inside = false;
    let lift = 0;
    // Target and smoothed pointer position, 0..1 across the card.
    let tx = 0.5;
    let ty = 0.5;
    let cx = 0.5;
    let cy = 0.5;

    const apply = () => {
      const a = smooth(lift);
      const dx = cx - 0.5;
      const dy = cy - 0.5;
      const style = card.style;
      style.setProperty("--lift", a.toFixed(4));
      // Face the pointer: rotateX leans the top toward it, rotateY the right.
      style.setProperty("--rx", `${(-dy * 2 * MAX_TILT * a).toFixed(3)}deg`);
      style.setProperty("--ry", `${(dx * 2 * MAX_TILT * a).toFixed(3)}deg`);
      style.setProperty("--mx", `${(cx * 100).toFixed(1)}%`);
      style.setProperty("--my", `${(cy * 100).toFixed(1)}%`);
      // Nearer layers travel further than farther ones.
      style.setProperty("--px", `${(-dx * 16 * a).toFixed(2)}px`);
      style.setProperty("--py", `${(-dy * 12 * a).toFixed(2)}px`);
      style.setProperty("--rpx", `${(-dx * 7 * a).toFixed(2)}px`);
      style.setProperty("--rpy", `${(-dy * 5 * a).toFixed(2)}px`);
      // The shadow falls away from the side the card leans toward.
      style.setProperty("--sx", `${(-dx * 26 * a).toFixed(2)}px`);
      style.setProperty("--sy", `${(-dy * 18 * a).toFixed(2)}px`);
    };

    const reset = () => {
      for (const name of ["lift", "rx", "ry", "mx", "my", "px", "py", "rpx", "rpy", "sx", "sy"]) {
        card.style.removeProperty(`--${name}`);
      }
    };

    const tick = (now: number) => {
      const steps = last ? Math.min(now - last, 64) / FRAME : 1;
      last = now;
      const ease = (rate: number) => 1 - Math.pow(1 - rate, steps);

      cx += (tx - cx) * ease(FOLLOW);
      cy += (ty - cy) * ease(FOLLOW);
      lift += ((inside ? 1 : 0) - lift) * ease(inside ? FADE_IN : FADE_OUT);

      if (!inside && lift < 0.001) {
        frame = 0;
        last = 0;
        reset();
        return;
      }
      apply();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const track = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      tx = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      ty = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    };

    const onEnter = (event: PointerEvent) => {
      track(event);
      // From rest, begin at the pointer so the lean points the right way from
      // the first frame; the build-up comes from `lift`, not from travel.
      if (lift < 0.02) {
        cx = tx;
        cy = ty;
      }
      inside = true;
      start();
    };

    const onMove = (event: PointerEvent) => {
      track(event);
      if (!inside) onEnter(event);
    };

    // Keep the last lean while fading out; do not swing back through centre.
    const onLeave = () => {
      inside = false;
      start();
    };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    card.addEventListener("pointercancel", onLeave);

    return () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("pointercancel", onLeave);
      if (frame) cancelAnimationFrame(frame);
      reset();
    };
  }, []);

  return <span className="lk-glare" ref={glareRef} aria-hidden="true" />;
}
