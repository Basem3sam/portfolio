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
  const src = image.currentSrc || image.src;
  loading = new Promise<void>((resolve) => {
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(probe, 0, 0, SIZE, SIZE);
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
    probe.onerror = () => resolve();
    probe.src = src;
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

/**
 * Pointer cursor only over the person (the button itself is a larger box).
 * Returns a cleanup function.
 */
export function bindPortraitCursor(hit: HTMLElement, image: HTMLImageElement) {
  preparePortraitHit(image);
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    hit.style.cursor = isOnPortrait(image, event.clientX, event.clientY) ? "pointer" : "default";
  };
  const leave = () => {
    hit.style.cursor = "";
  };
  hit.addEventListener("pointermove", move);
  hit.addEventListener("pointerleave", leave);
  return () => {
    hit.removeEventListener("pointermove", move);
    hit.removeEventListener("pointerleave", leave);
    hit.style.cursor = "";
  };
}
