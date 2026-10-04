export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_CLASS = "dark-mode";
const THEME_EVENT = "themeChange";

const FAVICONS: Record<Theme, { png32: string; png16: string; apple: string }> = {
  light: {
    png32: "/assets/icons/light/favicon-32x32.png",
    png16: "/assets/icons/light/favicon-16x16.png",
    apple: "/assets/icons/light/apple-touch-icon.png",
  },
  dark: {
    png32: "/assets/icons/dark/favicon-32x32.png",
    png16: "/assets/icons/dark/favicon-16x16.png",
    apple: "/assets/icons/dark/apple-touch-icon.png",
  },
};

export function getPreferredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === "dark" ? "dark" : "light";
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getCurrentTheme(): Theme {
  return document.body.classList.contains(DARK_CLASS) ? "dark" : "light";
}

function updateFavicons(theme: Theme) {
  const icons = FAVICONS[theme];
  const favicon32 = document.querySelector<HTMLLinkElement>("link[sizes='32x32']");
  const favicon16 = document.querySelector<HTMLLinkElement>("link[sizes='16x16']");
  const appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");

  if (favicon32) favicon32.href = icons.png32;
  if (favicon16) favicon16.href = icons.png16;
  if (appleIcon) appleIcon.href = icons.apple;
}

export function applyTheme(theme: Theme) {
  document.body.classList.toggle(DARK_CLASS, theme === "dark");
  updateFavicons(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
}

export function toggleTheme() {
  applyTheme(getCurrentTheme() === "dark" ? "light" : "dark");
}

export function subscribeToTheme(callback: () => void) {
  document.addEventListener(THEME_EVENT, callback);
  return () => document.removeEventListener(THEME_EVENT, callback);
}
