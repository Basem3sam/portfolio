/**
 * One shared answer to "is this device keeping up?", so every optional effect
 * can step down together instead of each guessing on its own.
 *
 * The tier lives on <html data-perf="high|low">, which CSS can read directly,
 * and a "perftier" event tells scripts when it changes. It only ever moves
 * from high to low (a device that struggled once will struggle again), and a
 * low verdict is remembered for the tab so later pages start light.
 *
 * What the tier controls is decoration only: the grain overlay, the scroll
 * choreography, the marquee surge, the links backdrop. Content, layout and
 * interaction never depend on it. (The hero's WebGL has its own, finer ladder.)
 */

export type PerfTier = "high" | "low";

const EVENT = "perftier";
export const PERF_FORCE_KEY = "perf-force";
export const PERF_TIER_KEY = "perf-tier";

export function isLowTier() {
  return typeof document !== "undefined" && document.documentElement.dataset.perf === "low";
}

export function setTier(tier: PerfTier, remember = false) {
  const root = document.documentElement;
  const changed = root.dataset.perf !== tier;
  root.dataset.perf = tier;
  if (remember) {
    try {
      sessionStorage.setItem(PERF_TIER_KEY, tier);
    } catch {}
  }
  if (changed) window.dispatchEvent(new CustomEvent<PerfTier>(EVENT, { detail: tier }));
}

/** Runs `callback` once if/when the tier drops to low. Returns an unsubscribe. */
export function onLowTier(callback: () => void) {
  const handler = (event: Event) => {
    if ((event as CustomEvent<PerfTier>).detail === "low") callback();
  };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
