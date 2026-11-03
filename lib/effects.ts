const CELEBRATION_EMOJIS = ["🎉", "✨", "⭐", "🎊", "💫", "🌟", "🎆"];
const KONAMI_CHARS = ["↑", "↓", "←", "→", "B", "A", "🎮", "👾", "🏆", "⭐", "⚡", "🔥"];
const BURST_COLORS = ["#ff6b6b", "#ee5a24", "#feca57", "#48dbfb", "#ff9ff3", "#4ecdc4"];
const EPIC_COLORS = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#1dd1a1", "#f368e0"];

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function isLowEndDevice() {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  return Boolean(
    (nav.deviceMemory && nav.deviceMemory < 2) ||
    (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) ||
    nav.connection?.saveData,
  );
}

function spawn(
  className: string,
  styles: Partial<CSSStyleDeclaration>,
  lifetime: number,
  text = "",
) {
  const element = document.createElement("div");
  element.className = className;
  element.setAttribute("aria-hidden", "true");
  element.textContent = text;
  Object.assign(element.style, styles);
  document.body.appendChild(element);
  window.setTimeout(() => element.remove(), lifetime);
  return element;
}

/* ================================================================
   One canvas for every celebration.

   The celebrations used to create one <div> per piece (a big finale is ~250 of
   them), each with its own Web Animation, its own compositor layer, a timer to
   remove it, and, for the fireworks, an animated `filter: hue-rotate` plus a
   text-shadow that repainted every frame. That is what made the page stutter.

   Now every piece is just an object in a list, drawn each frame onto a single
   fixed canvas by one requestAnimationFrame loop: no DOM churn, no extra
   layers, no timers, and nothing left behind. Glyphs (arrows, emoji) are
   rasterised once into small cached sprites and then only blitted. The canvas
   exists only while something is on screen.
   ================================================================ */

type Particle = {
  /** performance.now() timestamp the piece starts at (may be in the future). */
  start: number;
  dur: number;
  render: (c: CanvasRenderingContext2D, t: number) => void;
};

/** Sprites are drawn at this multiple of their on-screen size so they stay sharp when scaled up. */
const SPRITE_SCALE = 3;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let frame = 0;
let dpr = 1;
let viewW = 0;
let viewH = 0;

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const easeIn = (t: number) => t * t;

function fit() {
  if (!canvas) return;
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  // Capped: a 3x phone screen would otherwise fill 9 device pixels per CSS pixel
  // for a few confetti flakes nobody can tell apart.
  dpr = isLowEndDevice() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
  window.removeEventListener("resize", fit);
  canvas?.remove();
  canvas = null;
  ctx = null;
  particles = [];
}

function tick(now: number) {
  frame = 0;
  if (!canvas || !ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Compact in place so a busy frame does not allocate.
  let live = 0;
  for (let index = 0; index < particles.length; index++) {
    const particle = particles[index];
    const t = (now - particle.start) / particle.dur;
    if (t >= 1) continue;
    particles[live++] = particle;
    if (t > 0) particle.render(ctx, t);
  }
  particles.length = live;
  ctx.globalAlpha = 1;

  if (live > 0) frame = requestAnimationFrame(tick);
  else stop();
}

function queue(list: Particle[]) {
  if (list.length === 0) return;

  if (!canvas) {
    const element = document.createElement("canvas");
    const context = element.getContext("2d");
    if (!context) return;
    element.setAttribute("aria-hidden", "true");
    element.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10007";
    document.body.appendChild(element);
    canvas = element;
    ctx = context;
    fit();
    window.addEventListener("resize", fit);
  }

  particles.push(...list);
  if (!frame) frame = requestAnimationFrame(tick);
}

/** Position, uniformly scale and rotate whatever is drawn next, around (x, y). */
function place(c: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number) {
  const cos = Math.cos(rotation) * scale * dpr;
  const sin = Math.sin(rotation) * scale * dpr;
  c.setTransform(cos, sin, -sin, cos, x * dpr, y * dpr);
}

const sprites = new Map<string, HTMLCanvasElement>();

function glyphSprite(glyph: string, size: number, color: string | null, glow: boolean) {
  const key = `${glyph}|${size}|${color}|${glow}`;
  const cached = sprites.get(key);
  if (cached) return cached;

  const px = size * SPRITE_SCALE;
  const font = `700 ${px}px system-ui, sans-serif`;
  const sprite = document.createElement("canvas");
  const g = sprite.getContext("2d");
  if (!g) return sprite;

  g.font = font;
  const pad = glow ? px * 0.5 : px * 0.15;
  sprite.width = Math.ceil(g.measureText(glyph).width + pad * 2);
  sprite.height = Math.ceil(px * 1.3 + pad * 2);

  // Resizing resets the context, so the style is set again.
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  if (color) g.fillStyle = color;
  if (glow && color) {
    g.shadowColor = color;
    g.shadowBlur = px * 0.5;
  }
  g.fillText(glyph, sprite.width / 2, sprite.height / 2);

  sprites.set(key, sprite);
  return sprite;
}

function drawSprite(c: CanvasRenderingContext2D, sprite: HTMLCanvasElement, scale: number) {
  const w = (sprite.width / SPRITE_SCALE) * scale;
  const h = (sprite.height / SPRITE_SCALE) * scale;
  c.drawImage(sprite, -w / 2, -h / 2, w, h);
}

/**
 * Every firework and flying glyph is drawn from ONE cached sprite per glyph and
 * colour and scaled when drawn, so the whole set is small (about 150 sprites)
 * and can be built ahead of time, while the browser is idle (see
 * `prewarmEffects`). Building them inside the tenth click used to cost a frame
 * or two right when the finale starts.
 */
const FIREWORK_SIZE = 32;
const FLY_SIZE = 22;

/** Opacity along 1 -> 0.8 -> 0 (the old keyframes), for eased progress e. */
const fadeOutAlpha = (e: number) => (e < 0.5 ? 1 - 0.4 * e : 0.8 - (e - 0.5) * 1.6);

/** A glyph that flies out from (x, y), grows, turns and shrinks away. */
function flyingParticle(
  glyph: string,
  size: number,
  color: string | null,
  x: number,
  y: number,
  dx: number,
  dy: number,
  start: number,
  /** Size variation, applied when drawing so the cached sprite is shared. */
  k = 1,
): Particle {
  const sprite = glyphSprite(glyph, size, color, false);
  return {
    start,
    dur: 2000,
    render(c, t) {
      const e = easeOut(t);
      const travel = e < 0.5 ? e * 2 : 1 + (e - 0.5);
      const scale = e < 0.5 ? e * 2 : 1 - (e - 0.5) * 2;
      if (scale < 0.02) return;
      c.globalAlpha = fadeOutAlpha(e);
      place(c, x + dx * travel, y + dy * travel, scale * k, e * Math.PI * 2);
      drawSprite(c, sprite, 1);
    },
  };
}

/** A glowing glyph that pops open to 3x, turns and fades. */
function firework(
  glyph: string,
  size: number,
  color: string,
  x: number,
  y: number,
  start: number,
  k = 1,
): Particle {
  const sprite = glyphSprite(glyph, size, color, true);
  return {
    start,
    dur: 2000,
    render(c, t) {
      const e = easeOut(t);
      const scale = e < 0.5 ? e * 5 : 2.5 + (e - 0.5);
      if (scale < 0.02) return;
      c.globalAlpha = Math.max(0, fadeOutAlpha(e));
      place(c, x, y, scale * k, e * Math.PI * 2);
      drawSprite(c, sprite, 1);
    },
  };
}

/** A paper flake that drops the full height of the screen, turning and fading. */
function fallingConfetti(color: string, x: number, start: number, duration: number): Particle {
  return {
    start,
    dur: duration,
    render(c, t) {
      const e = easeIn(t);
      c.globalAlpha = 1 - e;
      place(c, x + 5, -20 + 10 + e * viewH, 1, e * Math.PI * 4);
      c.fillStyle = color;
      c.fillRect(-5, -10, 10, 20);
    },
  };
}

export function createCelebrationParticles() {
  const now = performance.now();
  const list: Particle[] = [];

  for (let index = 0; index < 30; index++) {
    list.push(
      flyingParticle(
        pick(CELEBRATION_EMOJIS),
        20,
        null,
        window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        window.innerHeight / 2 + (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 300,
        -Math.random() * 200 - 100,
        now + index * 50,
      ),
    );
  }

  queue(list);
}

export function createConfettiBurst() {
  const now = performance.now();
  const list: Particle[] = [];
  const count = isLowEndDevice() ? 15 : 50;

  for (let index = 0; index < count; index++) {
    list.push(
      fallingConfetti(
        pick(BURST_COLORS),
        Math.random() * window.innerWidth,
        now + index * 30 + Math.random() * 500,
        (Math.random() * 2 + 2) * 1000,
      ),
    );
  }

  queue(list);
}

/**
 * A gold ring that leaves the point of the press and sweeps off the screen,
 * with a soft warm flash behind it. It is what makes the tenth press land:
 * the whole page answers before anything opens. Skipped for reduced motion.
 * The flash is one full-screen layer that only changes opacity; the rings are
 * drawn on the shared canvas.
 */
function shockwave(origin: { x: number; y: number }, now: number, list: Particle[]) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const { x, y } = origin;
  // Radius to the farthest corner, so the ring always leaves the screen.
  const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const flash = spawn(
    "pointer-events-none fixed inset-0 z-[10004]",
    { background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 233, 170, 0.5), rgba(254, 202, 87, 0.12) 38%, transparent 62%)` },
    900,
  );
  flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.16 }, { opacity: 0 }], {
    duration: 800,
    easing: "ease-out",
    fill: "forwards",
  });

  [0, 160].forEach((delay, index) => {
    list.push({
      start: now + delay,
      dur: 1100,
      render(c, t) {
        const e = 1 - Math.pow(1 - t, 4);
        const grown = reach * (0.03 + 0.97 * e);
        const radius = grown * 0.64;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.globalAlpha = 1 - e;
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        if (index === 0) {
          c.strokeStyle = "rgba(255, 159, 67, 0.35)";
          c.lineWidth = Math.max(2, grown * 0.12);
          c.stroke();
          c.strokeStyle = "rgba(254, 202, 87, 0.95)";
          c.lineWidth = Math.max(1.5, grown * 0.04);
          c.stroke();
        } else {
          c.strokeStyle = "rgba(104, 219, 251, 0.7)";
          c.lineWidth = Math.max(1.5, grown * 0.05);
          c.stroke();
        }
      },
    });
  });
}

export function createEpicCelebration(origin?: { x: number; y: number }) {
  const now = performance.now();
  const low = isLowEndDevice();
  const list: Particle[] = [];

  shockwave(origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }, now, list);

  const fireworkCount = low ? 15 : 50;
  for (let index = 0; index < fireworkCount; index++) {
    list.push(
      firework(
        pick(KONAMI_CHARS),
        FIREWORK_SIZE,
        pick(EPIC_COLORS),
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        now + index * 24,
        0.625 + Math.random() * 0.625,
      ),
    );
  }

  for (let index = 0; index < 30; index++) {
    list.push(
      flyingParticle(
        pick(KONAMI_CHARS),
        FLY_SIZE,
        pick(EPIC_COLORS),
        window.innerWidth / 2,
        window.innerHeight / 2,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        now + index * 100,
        0.7 + Math.random() * 0.65,
      ),
    );
  }

  // Confetti: a heavy burst in the first second, then a thinner rain that
  // carries on in front of the master window.
  const confettiCount = low ? 40 : 170;
  for (let index = 0; index < confettiCount; index++) {
    const delay = index < 100 ? Math.random() * 500 : 400 + Math.random() * 1500;
    list.push(
      fallingConfetti(
        pick(EPIC_COLORS),
        Math.random() * window.innerWidth,
        now + index * 9 + delay,
        2400 + Math.random() * 900,
      ),
    );
  }

  queue(list);
}

/**
 * The click particles are arrow letters and emoji. The first time the browser
 * lays out a glyph that the page font lacks, it has to find a fallback font on
 * the system, which can stall a frame or two right when a particle appears.
 * Laying the same glyphs out once, off screen and while idle, pays that cost
 * before anyone clicks. Safe to call more than once.
 */
let prewarmed = false;

export function prewarmEffects() {
  if (prewarmed || typeof document === "undefined") return;
  prewarmed = true;
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.className = "pointer-events-none fixed font-bold";
  probe.style.cssText =
    "left:-9999px;top:0;opacity:0;font-size:16px;white-space:nowrap;contain:strict;width:400px;height:40px";
  probe.textContent = KONAMI_CHARS.join("") + CELEBRATION_EMOJIS.join("");
  document.body.appendChild(probe);
  // Reading a layout property forces the glyphs to be shaped now.
  void probe.offsetWidth;
  window.setTimeout(() => probe.remove(), 250);
  prewarmSprites();
}

/**
 * Builds the celebration sprites in small slices while the browser is idle, so
 * the finale only has to copy them. Each slice stops as soon as the browser has
 * something else to do, and anything not built yet is simply built on demand.
 */
function prewarmSprites() {
  const jobs: Array<() => void> = [];
  for (const glyph of KONAMI_CHARS) {
    for (const color of EPIC_COLORS) {
      jobs.push(() => glyphSprite(glyph, FIREWORK_SIZE, color, true));
      jobs.push(() => glyphSprite(glyph, FLY_SIZE, color, false));
    }
  }
  for (const emoji of CELEBRATION_EMOJIS) jobs.push(() => glyphSprite(emoji, 20, null, false));

  const run = (deadline?: IdleDeadline) => {
    const begun = performance.now();
    while (jobs.length) {
      const room = deadline ? deadline.timeRemaining() > 2 : performance.now() - begun < 4;
      if (!room) break;
      jobs.shift()?.();
    }
    if (jobs.length) schedule();
  };
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: 3000 });
    } else {
      window.setTimeout(() => run(), 80);
    }
  };
  schedule();
}

export type ClickPoint = { x: number; y: number };

// One click, one key: the glyph and its drift are the key the portrait is
// performing on this click, so the particles repeat what the photo shows
// instead of adding noise. Same order as CLICK_ANIMATION_ORDER below.
const CLICK_KEYS: { glyph: string; dx: number; dy: number }[] = [
  { glyph: "↑", dx: 0, dy: -1 },
  { glyph: "↑", dx: 0, dy: -1 },
  { glyph: "↓", dx: 0, dy: 1 },
  { glyph: "↓", dx: 0, dy: 1 },
  { glyph: "←", dx: -1, dy: 0 },
  { glyph: "→", dx: 1, dy: 0 },
  { glyph: "←", dx: -1, dy: 0 },
  { glyph: "→", dx: 1, dy: 0 },
  { glyph: "B", dx: 0, dy: 0 },
  { glyph: "A", dx: 0, dy: 0 },
];

export function createDirectionalParticles(
  element: HTMLElement,
  clickCount: number,
  point?: ClickPoint,
) {
  const key = CLICK_KEYS[(clickCount - 1) % CLICK_KEYS.length];
  const rect = element.getBoundingClientRect();
  // Emit from the spot that was clicked; the middle of the photo is only the
  // fallback (keyboard activation has no pointer position).
  const originX = point ? point.x : rect.left + rect.width / 2;
  const originY = point ? point.y : rect.top + rect.height / 2;

  for (let index = 0; index < 3; index++) {
    const spread = (index - 1) * 14;
    const particle = spawn(
      "pointer-events-none fixed z-[10002] font-bold text-[#fbbf24]",
      {
        left: `${originX + (key.dy === 0 ? 0 : spread)}px`,
        top: `${originY + (key.dx === 0 ? 0 : spread)}px`,
        fontSize: `${14 + clickCount * 1.5}px`,
      },
      1200,
      key.glyph,
    );
    particle.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 0.9 },
        {
          transform: `translate(${key.dx * 110}px, ${key.dy * 110}px) scale(${key.dx || key.dy ? 0.4 : 1.8})`,
          opacity: 0,
        },
      ],
      { duration: 1200, easing: "ease-out", fill: "forwards" },
    );
  }
}

// Only transform is animated on the photo. The two "glow" clicks used to animate
// filter: drop-shadow (a 20-25px blur re-rasterised every frame over a 2500px
// image), which is what made those clicks stutter. The glow is now a separate
// soft light that only changes opacity and scale, so it runs on the compositor.
const CLICK_ANIMATIONS: Keyframe[][] = [
  [
    { transform: "translateY(0)" },
    { transform: "translateY(-8px)" },
    { transform: "translateY(0)" },
  ],
  [
    { transform: "translateY(0)" },
    { transform: "translateY(8px)" },
    { transform: "translateY(0)" },
  ],
  [
    { transform: "translateX(0)" },
    { transform: "translateX(-8px)" },
    { transform: "translateX(0)" },
  ],
  [
    { transform: "translateX(0)" },
    { transform: "translateX(8px)" },
    { transform: "translateX(0)" },
  ],
  [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
  [
    { transform: "scale(1) rotate(0deg)" },
    { transform: "scale(1.15) rotate(5deg)" },
    { transform: "scale(1) rotate(0deg)" },
  ],
];

/** Glow colour per animation index (only the last two clicks of the run glow). */
const CLICK_GLOWS: Record<number, string> = {
  4: "255, 107, 107",
  5: "78, 205, 196",
};

function clickGlow(rect: DOMRect, rgb: string, point?: ClickPoint) {
  const size = Math.min(rect.width, rect.height) * 0.7;
  const x = point ? point.x : rect.left + rect.width / 2;
  const y = point ? point.y : rect.top + rect.height / 2;
  const glow = spawn(
    "pointer-events-none fixed z-[10001] rounded-full",
    {
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle closest-side, rgba(${rgb}, 0.55), rgba(${rgb}, 0.18) 55%, transparent 100%)`,
    },
    700,
  );
  glow.animate(
    [
      { transform: "scale(0.6)", opacity: 0 },
      { transform: "scale(1.1)", opacity: 1, offset: 0.35 },
      { transform: "scale(1.5)", opacity: 0 },
    ],
    { duration: 620, easing: "ease-out", fill: "forwards" },
  );
}

const CLICK_ANIMATION_ORDER = [0, 0, 1, 1, 2, 3, 2, 3, 4, 5];

export function animateProfileClick(
  element: HTMLElement,
  clickCount: number,
  point?: ClickPoint,
) {
  const animationIndex = CLICK_ANIMATION_ORDER[(clickCount - 1) % 10];
  const keyframes = CLICK_ANIMATIONS[animationIndex];
  const glowRgb = CLICK_GLOWS[animationIndex];
  if (glowRgb) clickGlow(element.getBoundingClientRect(), glowRgb, point);
  if (point) {
    // Scale and rotate pivot on the clicked spot, so the photo reacts where it
    // was touched. The origin is cleared again when the animation ends.
    const rect = element.getBoundingClientRect();
    element.style.transformOrigin = `${point.x - rect.left}px ${point.y - rect.top}px`;
  }
  const animation = element.animate(keyframes, { duration: 600, easing: "ease" });
  const clear = () => element.style.removeProperty("transform-origin");
  animation.onfinish = clear;
  animation.oncancel = clear;
}

// A ring that blooms from the clicked spot, tinted by how deep into the hunt
// the visitor is.
export function createClickRipple(point: ClickPoint, clickCount: number) {
  const size = 64 + Math.min(clickCount, 10) * 8;
  const color = pick(BURST_COLORS);
  const ring = spawn(
    "pointer-events-none fixed z-[10002] rounded-full",
    {
      left: `${point.x - size / 2}px`,
      top: `${point.y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      border: `3px solid ${color}`,
    },
    700,
  );
  ring.animate(
    [
      { transform: "scale(0.1)", opacity: 0.9 },
      { transform: "scale(1)", opacity: 0 },
    ],
    { duration: 650, easing: "ease-out", fill: "forwards" },
  );
}

const CLUE_REVEAL: Keyframe[] = [
  { transform: "scale(0.5) rotate(0deg)", opacity: 0 },
  { transform: "scale(1.3) rotate(180deg)", opacity: 1, offset: 0.5 },
  { transform: "scale(1) rotate(360deg)", opacity: 0.7 },
];

const CLUE_CELEBRATION: Keyframe[] = [
  { transform: "scale(1) rotate(0deg)" },
  { transform: "scale(1.4) rotate(90deg)", offset: 0.25 },
  { transform: "scale(1.1) rotate(180deg)", offset: 0.5 },
  { transform: "scale(1.3) rotate(270deg)", offset: 0.75 },
  { transform: "scale(1) rotate(360deg)" },
];

export function animateClue(
  element: HTMLElement,
  kind: "reveal" | "celebration",
  duration: number,
) {
  element.animate(kind === "reveal" ? CLUE_REVEAL : CLUE_CELEBRATION, { duration, easing: "ease" });
}
