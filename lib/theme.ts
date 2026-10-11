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

  // Remove ALL icon links at once, then recreate them fresh. Merely
  // changing href on an existing <link> doesn't trigger a favicon
  // re-render in Chrome/Firefox — the browser caches the initial
  // render and ignores subsequent href mutations. Removing and
  // re-inserting the elements forces an immediate re-fetch.
  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
    .forEach((link) => link.remove());

  const head = document.head;

  const createLink = (rel: string, href: string, sizes?: string, type?: string) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (sizes) link.setAttribute("sizes", sizes);
    if (type) link.setAttribute("type", type);
    head.appendChild(link);
  };

  createLink("icon", icons.png32, "32x32", "image/png");
  createLink("icon", icons.png16, "16x16", "image/png");
  createLink("apple-touch-icon", icons.apple, "180x180");
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
