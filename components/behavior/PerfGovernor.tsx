"use client";

import { useEffect } from "react";
import { PERF_FORCE_KEY, PERF_TIER_KEY, setTier } from "@/lib/perf";

/** Frames to sample, how long to let the page settle first, and what counts as slow. */
const SAMPLE_FRAMES = 90;
const SCROLL_SAMPLE_FRAMES = 45;
/** How long after load it keeps watching before it concludes the device is fine. */
const WATCH_MS = 60000;
const SETTLE_MS = 3500;
const SLOW_P75_MS = 38; // a quarter of frames slower than this is under ~26fps

/**
 * Decides the performance tier for the tab (see lib/perf.ts). Mounted first in
 * the root layout so the verdict is in place before the effects that read it.
 *
 * 1. `?perf=high|low` forces a tier for the tab (for testing).
 * 2. A remembered "low" from earlier in this tab sticks.
 * 3. Save-Data, or 2 GB of memory or less, starts low immediately.
 * 4. Otherwise it starts high and watches real frame pacing, at rest and while
 *    scrolling, for the first minute once the page has settled. Page visibility
 *    pauses the count, and frames that took over 250ms (a tab switch, not a
 *    slow frame) are ignored.
 */
export default function PerfGovernor() {
  useEffect(() => {
    const read = (key: string) => {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    };

    try {
      const asked = new URLSearchParams(location.search).get("perf");
      if (asked === "high" || asked === "low") sessionStorage.setItem(PERF_FORCE_KEY, asked);
    } catch {}

    const forced = read(PERF_FORCE_KEY);
    if (forced === "high" || forced === "low") {
      setTier(forced);
      return;
    }
    if (read(PERF_TIER_KEY) === "low") {
      setTier("low");
      return;
    }

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)) {
      setTier("low", true);
      return;
    }

    setTier("high");

    // Idle frames and scrolling frames are judged separately: a page can idle
    // at 60fps and still stutter the moment it scrolls, and scrolling is where
    // a visitor actually feels it.
    const begin = performance.now();
    const startAt = begin + SETTLE_MS;
    const idle: number[] = [];
    const scrolling: number[] = [];
    let lastScroll = -Infinity;
    let last = 0;
    let frame = 0;
    let done = false;

    const onScroll = () => {
      lastScroll = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const slow = (deltas: number[], needed: number) => {
      if (deltas.length < needed) return false;
      const sorted = [...deltas].sort((a, b) => a - b);
      deltas.length = 0;
      return sorted[Math.floor(sorted.length * 0.75)] > SLOW_P75_MS;
    };

    const stop = () => {
      done = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };

    const onFrame = (now: number) => {
      if (done) return;
      frame = requestAnimationFrame(onFrame);
      if (document.hidden) {
        last = 0;
        return;
      }
      if (last && now >= startAt) {
        const delta = now - last;
        if (delta < 250) (now - lastScroll < 100 ? scrolling : idle).push(delta);
      }
      last = now;

      if (slow(scrolling, SCROLL_SAMPLE_FRAMES) || slow(idle, SAMPLE_FRAMES)) {
        setTier("low", true);
        stop();
      } else if (now - begin > WATCH_MS) {
        stop();
      }
    };
    frame = requestAnimationFrame(onFrame);

    return stop;
  }, []);

  return null;
}
