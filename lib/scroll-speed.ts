/**
 * How fast the page is scrolling right now, shared by everything that reacts to
 * scroll. One passive listener measures it for all of them.
 *
 * Why it exists: on a phone a fling covers thousands of pixels a second, and
 * the scroll-linked effects (the story engine, the Experience focus, the
 * scroll-spy) each redo their work every frame while it lasts. At that speed
 * nobody can see the in-between states, but the main thread time they cost is
 * exactly what makes a fling stutter. So on touch screens they let go while the
 * page is moving fast and catch up when it slows (see `fastScroll`).
 */

let installed = false;
let lastY = 0;
let lastAt = 0;
let speed = 0; // px per ms, smoothed

function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  lastY = window.scrollY;
  lastAt = performance.now();
  window.addEventListener(
    "scroll",
    () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastAt);
      const y = window.scrollY;
      const instant = Math.abs(y - lastY) / dt;
      // Smoothed, so one long frame does not read as a fling.
      speed = speed * 0.6 + instant * 0.4;
      lastY = y;
      lastAt = now;
    },
    { passive: true },
  );
}

/** Scroll speed in px per ms; 0 once the page has been still for a moment. */
export function scrollSpeed() {
  install();
  return performance.now() - lastAt > 120 ? 0 : speed;
}

/** Above this the page is flinging (about 1500 px/s, 25px a frame). */
const FAST = 1.5;

let coarse: MediaQueryList | null = null;

/** True on a device whose main pointer is a finger. */
export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  coarse ??= window.matchMedia("(pointer: coarse)");
  return coarse.matches;
}

/**
 * True while a touch device is flinging the page. Always false on a mouse or
 * trackpad, where the wheel is already smoothed and frames are cheap.
 */
export function fastScroll() {
  return isTouchDevice() && scrollSpeed() > FAST;
}
