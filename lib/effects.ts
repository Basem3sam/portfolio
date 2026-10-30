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

function spawnSequence(count: number, interval: number, create: (index: number) => void) {
  for (let index = 0; index < count; index++) {
    window.setTimeout(() => create(index), index * interval);
  }
}

function flyingParticle(
  text: string,
  className: string,
  styles: Partial<CSSStyleDeclaration>,
  x: number,
  y: number,
) {
  const particle = spawn(className, styles, 2000, text);
  particle.animate(
    [
      { transform: "translate(0px, 0px) scale(0) rotate(0deg)", opacity: 1 },
      {
        transform: `translate(${x}px, ${y}px) scale(1) rotate(180deg)`,
        opacity: 0.8,
        offset: 0.5,
      },
      {
        transform: `translate(${x * 1.5}px, ${y * 1.5}px) scale(0) rotate(360deg)`,
        opacity: 0,
      },
    ],
    { duration: 2000, easing: "ease-out", fill: "forwards" },
  );
}

function fallingConfetti(
  color: string,
  left: string,
  delay: number,
  duration: number,
  lifetime: number,
) {
  const confetti = spawn(
    "pointer-events-none fixed top-[-20px] z-[10002] h-5 w-2.5 opacity-0",
    { background: color, left },
    lifetime,
  );
  confetti.animate(
    [
      { transform: "translateY(0) rotate(0deg)", opacity: 1 },
      { transform: "translateY(100vh) rotate(720deg)", opacity: 0 },
    ],
    { duration, delay, easing: "ease-in", fill: "forwards" },
  );
}

export function createCelebrationParticles() {
  spawnSequence(30, 50, () => {
    flyingParticle(
      pick(CELEBRATION_EMOJIS),
      "pointer-events-none fixed z-[10003] text-[20px]",
      {
        left: `${window.innerWidth / 2 + (Math.random() - 0.5) * 200}px`,
        top: `${window.innerHeight / 2 + (Math.random() - 0.5) * 200}px`,
      },
      (Math.random() - 0.5) * 300,
      -Math.random() * 200 - 100,
    );
  });
}

export function createConfettiBurst() {
  spawnSequence(isLowEndDevice() ? 15 : 50, 30, () => {
    fallingConfetti(
      pick(BURST_COLORS),
      `${Math.random() * 100}%`,
      Math.random() * 500,
      (Math.random() * 2 + 2) * 1000,
      5000,
    );
  });
}

export function createEpicCelebration() {
  spawnSequence(isLowEndDevice() ? 15 : 50, 50, () => {
    const color = pick(EPIC_COLORS);
    const firework = spawn(
      "pointer-events-none fixed z-[10003] font-bold",
      {
        left: `${Math.random() * window.innerWidth}px`,
        top: `${Math.random() * window.innerHeight}px`,
        fontSize: `${20 + Math.random() * 20}px`,
        color,
        textShadow: "0 0 10px currentColor",
      },
      2000,
      pick(KONAMI_CHARS),
    );
    firework.animate(
      [
        { transform: "scale(0) rotate(0deg)", opacity: 1, filter: "hue-rotate(0deg)" },
        {
          transform: "scale(2.5) rotate(180deg)",
          opacity: 0.8,
          filter: "hue-rotate(180deg)",
          offset: 0.5,
        },
        { transform: "scale(3) rotate(360deg)", opacity: 0, filter: "hue-rotate(360deg)" },
      ],
      { duration: 2000, easing: "ease-out", fill: "forwards" },
    );
  });

  spawnSequence(30, 100, () => {
    flyingParticle(
      pick(KONAMI_CHARS),
      "pointer-events-none fixed top-1/2 left-1/2 z-[10003] font-bold",
      { fontSize: `${15 + Math.random() * 15}px`, color: pick(EPIC_COLORS) },
      (Math.random() - 0.5) * 300,
      (Math.random() - 0.5) * 300,
    );
  });

  spawnSequence(isLowEndDevice() ? 30 : 150, 20, () => {
    fallingConfetti(
      pick(EPIC_COLORS),
      `${Math.random() * 100}vw`,
      Math.random() * 2000,
      3000,
      3000,
    );
  });
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

// The glow uses filter: drop-shadow, which follows the portrait's cut-out
// silhouette. box-shadow lit up the photo's whole (transparent) square box.
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
  [
    { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(255, 107, 107, 0.4))" },
    { transform: "scale(1.1)", filter: "drop-shadow(0 0 20px rgba(255, 107, 107, 0.8))" },
    { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(255, 107, 107, 0.4))" },
  ],
  [
    { transform: "scale(1) rotate(0deg)", filter: "drop-shadow(0 0 0 rgba(78, 205, 196, 0.4))" },
    { transform: "scale(1.15) rotate(5deg)", filter: "drop-shadow(0 0 25px rgba(78, 205, 196, 0.9))" },
    { transform: "scale(1) rotate(0deg)", filter: "drop-shadow(0 0 0 rgba(78, 205, 196, 0.4))" },
  ],
];

const CLICK_ANIMATION_ORDER = [0, 0, 1, 1, 2, 3, 2, 3, 4, 5];

export function animateProfileClick(
  element: HTMLElement,
  clickCount: number,
  point?: ClickPoint,
) {
  const keyframes = CLICK_ANIMATIONS[CLICK_ANIMATION_ORDER[(clickCount - 1) % 10]];
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
      border: `2px solid ${color}`,
      boxShadow: `0 0 18px ${color}`,
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
