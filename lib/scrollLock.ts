import { getLenis } from "@/lib/lenis";

let locked = false;
let lockedY = 0;

/**
 * Freezes page scrolling while an overlay (palette, gate, terminal) is open.
 *
 * The page is frozen in place with `overflow: hidden` on the root. It used to
 * be pinned by making the body `position: fixed; top: -Ypx`, which keeps the
 * picture still but makes `window.scrollY` read 0 for as long as the overlay is
 * open. Everything that reads the scroll position then believed the visitor
 * was back at the top of the page: the navbar capsule changed shape and the
 * progress rail emptied, the back-to-top button hid, the hero depth effect and
 * the scroll story rewound, and the marquee saw a huge jump as a burst of speed.
 *
 * With `overflow: hidden` the position is never touched, so none of that
 * happens. `scrollbar-gutter: stable` (globals.css) keeps the scrollbar's
 * space reserved, so the layout does not change width when it disappears.
 */
export function lockScroll() {
  if (locked) return;
  locked = true;
  lockedY = window.scrollY;
  // Stop Lenis so it cannot keep animating (or intercept the wheel) underneath.
  getLenis()?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  if (!locked) return;
  locked = false;
  document.documentElement.style.overflow = "";
  getLenis()?.start();
  // The position was never moved, so this only matters if something else did.
  if (Math.abs(window.scrollY - lockedY) > 1) {
    window.scrollTo({ top: lockedY, left: 0, behavior: "instant" });
  }
}
