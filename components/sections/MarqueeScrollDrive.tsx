"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

/**
 * Couples the "built with" band to the reader's scroll speed: scroll fast and
 * the band surges forward, stop and it eases back to its calm 32s loop. It
 * only changes the playback rate of the existing CSS animation (position stays
 * continuous, direction never flips), runs only while the band is on screen,
 * and does nothing under reduced motion.
 */
export default function MarqueeScrollDrive() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const view = document.querySelector<HTMLElement>(".mq-view");
    const row = view?.querySelector<HTMLElement>(".mq-row");
    if (!view || !row) return;

    let rate = 1;
    let frame = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let visible = false;

    const apply = (value: number) => {
      row.getAnimations().forEach((animation) => {
        animation.playbackRate = value;
      });
    };

    const tick = (now: number) => {
      const dt = Math.max(1, now - lastT);
      const speed = (Math.abs(window.scrollY - lastY) / dt) * 1000; // px per second
      lastY = window.scrollY;
      lastT = now;

      const target = 1 + Math.min(speed / 700, 5);
      // Rise quickly, fall back slowly, so a flick reads and then relaxes.
      const steps = Math.min(dt, 64) / (1000 / 60);
      const follow = target > rate ? 0.16 : 0.045;
      rate += (target - rate) * (1 - Math.pow(1 - follow, steps));
      if (Math.abs(rate - 1) < 0.01 && target === 1) {
        rate = 1;
        apply(1);
        frame = 0;
        return; // idle: stop looping until the next scroll
      }
      apply(rate);
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!visible || frame) return;
      lastY = window.scrollY;
      lastT = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        rate = 1;
        apply(1);
      }
    });
    observer.observe(view);
    window.addEventListener("scroll", wake, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", wake);
      if (frame) cancelAnimationFrame(frame);
      apply(1);
    };
  }, []);

  return null;
}
