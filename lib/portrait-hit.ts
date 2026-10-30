// Hit-testing for the hero portrait.
//
// The portrait button covers the photo's whole (partly transparent) frame, but
// only the person should react to a click. This builds a small alpha mask of
// the cut-out once, grows it a few pixels so the outline is forgiving to a
// fingertip, and answers "is this screen point on the person?".

const SIZE = 256; // mask resolution (the photo is square)
const ALPHA_MIN = 24; // alpha above this counts as "the person"
const GROW = 7; // outline forgiveness, in mask pixels (about 2.7% of the photo)

let mask: Uint8Array | null = null;
let loading: Promise<void> | null = null;

function grow(src: Uint8Array, radius: number): Uint8Array {
  // Separable max-filter: horizontal pass, then vertical.
  const tmp = new Uint8Array(SIZE * SIZE);
  const out = new Uint8Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let hit = 0;
      for (let k = -radius; k <= radius && !hit; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < SIZE && src[y * SIZE + xx]) hit = 1;
      }
      tmp[y * SIZE + x] = hit;
    }
  }
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let hit = 0;
      for (let k = -radius; k <= radius && !hit; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < SIZE && tmp[yy * SIZE + x]) hit = 1;
      }
      out[y * SIZE + x] = hit;
    }
  }
  return out;
}

function build(image: HTMLImageElement) {
  if (mask || loading) return loading ?? Promise.resolve();
  // Reads the pixels of the <img> that is already on screen. This used to load
  // the photo a second time through a `new Image()` with `crossOrigin`, which
  // is a CORS-mode request the browser cannot answer from the <img>'s cache
  // entry, so every visit downloaded the portrait twice (44 to 75 KB on the
  // page's most important image). The photo is same-origin, so the canvas is
  // never tainted; if it ever were, the catch below falls back as before.
  loading = new Promise<void>((resolve) => {
    const read = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(image, 0, 0, SIZE, SIZE);
          const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
          const solid = new Uint8Array(SIZE * SIZE);
          for (let i = 0; i < solid.length; i++) solid[i] = data[i * 4 + 3] > ALPHA_MIN ? 1 : 0;
          mask = grow(solid, GROW);
        }
      } catch {
        mask = null; // canvas unavailable: fall back to "everything is a hit"
      }
      resolve();
    };
    if (image.complete && image.naturalWidth > 0) {
      read();
    } else {
      image.addEventListener("load", read, { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    }
  });
  return loading;
}

/** Start building the mask early (safe to call repeatedly). */
export function preparePortraitHit(image: HTMLImageElement | null) {
  if (image) void build(image);
}

/**
 * True when the viewport point lands on the person. Uses the photo's live
 * bounding box, so it stays correct while a click animation scales or rotates
 * the photo. If the mask is not ready (or cannot be built) every point in the
 * photo's box counts, so the portrait never goes dead.
 */
export function isOnPortrait(image: HTMLElement, x: number, y: number) {
  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return true;
  const u = (x - rect.left) / rect.width;
  const v = (y - rect.top) / rect.height;
  if (u < 0 || u >= 1 || v < 0 || v >= 1) return false;
  if (!mask) {
    if (image instanceof HTMLImageElement) preparePortraitHit(image);
    return true;
  }
  return mask[Math.floor(v * SIZE) * SIZE + Math.floor(u * SIZE)] === 1;
}

// The last mouse position, tracked once for the whole page. The click hunt
// hands the portrait from the loader to the full game on the first press; the
// new binding reads this to restore the cursor at once instead of waiting for
// the next pointer move.
let lastPointer: { x: number; y: number } | null = null;
let tracking = false;

function trackPointer() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "touch") lastPointer = { x: event.clientX, y: event.clientY };
    },
    { passive: true },
  );
}

/**
 * Keeps the portrait's cursor an ordinary arrow. The photo hunt is an easter
 * egg, so nothing about the portrait may announce that it can be pressed: no
 * pointer cursor, no hover label. (It used to switch to a pointer over the
 * person, which gave the egg away.) The portrait still answers the pointer
 * with its tilt and press, and that is the whole invitation. Kept as a binding
 * so the egg code that calls it does not change. Returns a cleanup function.
 */
export function bindPortraitCursor(hit: HTMLElement, image: HTMLImageElement) {
  trackPointer();
  // The mask decodes the portrait a second time and reads it back, so it waits
  // for an idle moment instead of competing with hydration and the hero (it is
  // also built on demand by `isOnPortrait`, so nothing depends on this timing).
  let idle = 0;
  if (typeof window.requestIdleCallback === "function") {
    idle = window.requestIdleCallback(() => preparePortraitHit(image), { timeout: 3000 });
  } else {
    idle = window.setTimeout(() => preparePortraitHit(image), 1500);
  }
  const apply = (x: number, y: number) => {
    void image;
    void x;
    void y;
    hit.style.cursor = "default";
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    apply(event.clientX, event.clientY);
  };
  const leave = () => {
    hit.style.cursor = "";
  };
  hit.addEventListener("pointermove", move);
  hit.addEventListener("pointerleave", leave);
  // Re-binding while the mouse is already over the portrait: no move event is
  // coming, so restore the cursor from the last known position.
  if (lastPointer && hit.matches(":hover")) apply(lastPointer.x, lastPointer.y);
  return () => {
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    window.clearTimeout(idle);
    hit.removeEventListener("pointermove", move);
    hit.removeEventListener("pointerleave", leave);
    // The inline cursor is left in place on purpose: the button outlives this
    // binding, and clearing it here made the cursor flip to the default one
    // until the next move. `leave` still clears it when the mouse exits.
  };
}
