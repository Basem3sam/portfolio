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

const ICON_SELECTOR = 'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]';

function iconHref(link: HTMLLinkElement, icons: (typeof FAVICONS)[Theme]) {
  if (link.rel === "apple-touch-icon") return icons.apple;
  return link.getAttribute("sizes") === "16x16" ? icons.png16 : icons.png32;
}

// The metadata API renders these <link> tags and React owns them: removing
// one makes React throw "Cannot read properties of null (reading
// 'removeChild')" when it later unmounts it. Swap the href in place instead.
function updateFavicons(theme: Theme) {
  const icons = FAVICONS[theme];
  const links = Array.from(document.head.querySelectorAll<HTMLLinkElement>(ICON_SELECTOR));

  if (links.length > 0) {
    links.forEach((link) => {
      const href = iconHref(link, icons);
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    });
    return;
  }

  const fallback: [string, string, string?][] = [
    ["icon", icons.png32, "32x32"],
    ["icon", icons.png16, "16x16"],
    ["apple-touch-icon", icons.apple, "180x180"],
  ];

  fallback.forEach(([rel, href, sizes]) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (sizes) link.setAttribute("sizes", sizes);
    document.head.appendChild(link);
  });
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
