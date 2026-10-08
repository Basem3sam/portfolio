import type { IconName } from "@/components/ui/Icon";

export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export const CLICKS_NEEDED = 10;
export const CLUE_START_CLICK = 3;

export const isMobileViewport = () => window.innerWidth <= 768;

export function getHintLevel(clicks: number) {
  if (clicks <= 2) return 0;
  if (clicks <= 4) return 1;
  if (clicks <= 6) return 2;
  if (clicks <= 8) return 3;
  if (clicks === 9) return 4;
  if (clicks === 10) return 5;
  return 6;
}

type HintLevel = {
  tooltip: string;
  notification: string;
  icon: IconName;
  showNotification: boolean;
};

export const HINT_LEVELS: HintLevel[] = [
  { tooltip: "...", notification: "", icon: "helpCircle", showNotification: false },
  {
    tooltip: "You found something! Keep exploring...",
    notification: "Secret discovered! Keep clicking to reveal more... 🔍",
    icon: "search",
    showNotification: true,
  },
  {
    tooltip: "Follow the arrow patterns... 🧭",
    notification: "Notice the arrow directions? There's a pattern... ↗️↙️",
    icon: "globe",
    showNotification: true,
  },
  {
    tooltip: "Up, up, down, down...",
    notification: "It's a famous gaming sequence! Keep going... 🎮",
    icon: "arrowUp",
    showNotification: true,
  },
  {
    tooltip: "↑↑↓↓←→←→",
    notification: "Almost there! Just need the final buttons... 🔄",
    icon: "gitBranch",
    showNotification: true,
  },
  {
    tooltip: "↑↑↓↓←→←→BA - Complete the sequence!",
    notification: "🎮 ONE MORE CLICK! Complete the Konami Code!",
    icon: "star",
    showNotification: true,
  },
  {
    tooltip: "Konami Code: ↑↑↓↓←→←→BA (or Ctrl+Shift+B)",
    notification: "🏆 KONAMI CODE MASTER! Terminal unlocked!",
    icon: "trophy",
    showNotification: true,
  },
];

export const REMINDERS = [
  "Remember the Konami code?",
  "↑↑↓↓←→←→BA unlocks the terminal",
  "Try the classic gaming sequence",
  "The code from the 80s still works!",
  "Up, up, down, down, left, right, left, right, B, A",
];