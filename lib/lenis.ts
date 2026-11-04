import type Lenis from "lenis";

/**
 * The one Lenis instance, shared with code that lives outside React (the
 * scroll helpers, the scroll lock, anchor handling). `SmoothScroll` registers
 * it on mount and clears it on unmount. Everything that scrolls the page goes
 * through `lib/scroll.ts`, which falls back to native scrolling whenever this
 * is `null` (before hydration, reduced motion off-screen tests, or if Lenis
 * ever fails to start), so the page never depends on it to be usable.
 */
let instance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return instance;
}

export function setLenis(next: Lenis | null) {
  instance = next;
}
