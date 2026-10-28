import { getLenis } from "@/lib/lenis";

let locked = false;

export function lockScroll() {
  if (locked) return;
  locked = true;
  // Read the position before stopping Lenis, and stop it so it cannot keep
  // animating (or intercept the wheel) underneath the fixed body.
  const y = window.scrollY;
  getLenis()?.stop();
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.top = `-${y}px`;
}

export function unlockScroll() {
  if (!locked) return;
  locked = false;
  const top = document.body.style.top;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.top = "";
  // Wake Lenis first, then restore: its native-scroll listener picks the
  // restored position up, so there is no jump or drift.
  getLenis()?.start();
  window.scrollTo({ top: parseInt(top || "0") * -1, left: 0, behavior: "instant" });
}
