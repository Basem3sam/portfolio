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
    fallingConfetti(pick(EPIC_COLORS), `${Math.random() * 100}vw`, Math.random() * 2000, 3000, 3000);
  });
}

export function createDirectionalParticles(element: HTMLElement, clickCount: number) {
  const directions = ["↑", "↓", "←", "→", "B", "A"];
  const rect = element.getBoundingClientRect();

  for (let index = 0; index < Math.min(clickCount, 4); index++) {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    const particle = spawn(
      "pointer-events-none fixed z-[10002] font-bold text-[#fbbf24]",
      {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top + rect.height / 2}px`,
        fontSize: `${12 + clickCount * 1.5}px`,
      },
      1200,
      directions[index % directions.length],
    );
    particle.animate(
      [
        { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 0.8 },
        {
          transform: `translate(${x * 120}px, ${y * 120 - 60}px) scale(0) rotate(180deg)`,
          opacity: 0,
        },
      ],
      { duration: 1200, easing: "ease-out", fill: "forwards" },
    );
  }
}

const CLICK_ANIMATIONS: Keyframe[][] = [
  [{ transform: "translateY(0)" }, { transform: "translateY(-8px)" }, { transform: "translateY(0)" }],
  [{ transform: "translateY(0)" }, { transform: "translateY(8px)" }, { transform: "translateY(0)" }],
  [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(0)" }],
  [{ transform: "translateX(0)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }],
  [
    { transform: "scale(1)", boxShadow: "0 0 0 rgba(255, 107, 107, 0.4)" },
    { transform: "scale(1.1)", boxShadow: "0 0 20px rgba(255, 107, 107, 0.8)" },
    { transform: "scale(1)", boxShadow: "0 0 0 rgba(255, 107, 107, 0.4)" },
  ],
  [
    { transform: "scale(1) rotate(0deg)", boxShadow: "0 0 0 rgba(78, 205, 196, 0.4)" },
    { transform: "scale(1.15) rotate(5deg)", boxShadow: "0 0 25px rgba(78, 205, 196, 0.9)" },
    { transform: "scale(1) rotate(0deg)", boxShadow: "0 0 0 rgba(78, 205, 196, 0.4)" },
  ],
];

const CLICK_ANIMATION_ORDER = [0, 0, 1, 1, 2, 3, 2, 3, 4, 5];

export function animateProfileClick(element: HTMLElement, clickCount: number) {
  const keyframes = CLICK_ANIMATIONS[CLICK_ANIMATION_ORDER[(clickCount - 1) % 10]];
  element.animate(keyframes, { duration: 600, easing: "ease" });
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

export function animateClue(element: HTMLElement, kind: "reveal" | "celebration", duration: number) {
  element.animate(kind === "reveal" ? CLUE_REVEAL : CLUE_CELEBRATION, { duration, easing: "ease" });
}
