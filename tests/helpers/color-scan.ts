import fs from "node:fs";
import path from "node:path";

/**
 * Pure helpers for tests/color-discipline.spec.ts. No Playwright imports, so
 * the logic can also be exercised from plain Node.
 */

export const SCAN_DIRS = ["app", "components", "lib", "data"] as const;

/**
 * Closed exempt list. Each entry is a prefix of a repo-relative POSIX path and
 * carries its reason. Do not add to it without a reason that is not "it was
 * easier".
 */
export const EXEMPT: ReadonlyArray<{ prefix: string; reason: string }> = [
  { prefix: "app/[lang]/opengraph-image.tsx", reason: "draws pixels for the share image; no CSS variables exist there" },
  { prefix: "app/[lang]/layout.tsx", reason: "viewport themeColor reaches browser chrome before any CSS loads" },
  { prefix: "lib/effects.ts", reason: "canvas particle colours" },
  { prefix: "lib/terminalCommands.ts", reason: "easter-egg terminal output; restyled in the motion and overlay phase" },
  { prefix: "components/easter-egg/", reason: "a deliberate simulation of a shell; restyled in the motion and overlay phase" },
];

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
// Lookbehind instead of \b: Tailwind arbitrary values write spaces as "_", and "_" is a word
// character, so `shadow-[0_0_8px_rgba(` has no \b before "rgba".
const FUNC = /(?<![A-Za-z0-9-])(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g;
const ARBITRARY_COLOUR =
  /\b(?:bg|text|border|ring|outline|fill|stroke|from|to|via|decoration|shadow|accent|caret|divide|placeholder)-\[(?:color:)?(?:#|rgb|hsl|oklch)/g;
const OFF_PALETTE =
  /\b(?:bg|text|border|ring|outline|fill|stroke|from|to|via|decoration|shadow|accent|caret|divide|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

export type Violation = { file: string; line: number; kind: string; text: string };

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

export function isExempt(rel: string): boolean {
  return EXEMPT.some((e) => rel.startsWith(e.prefix));
}

export function scanSources(root: string): Violation[] {
  const found: Violation[] = [];
  for (const dir of SCAN_DIRS) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      if (isExempt(rel)) continue;
      const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((text, i) => {
        const checks: Array<[string, RegExp]> = [
          ["hex literal", HEX],
          ["colour function", FUNC],
          ["arbitrary colour class", ARBITRARY_COLOUR],
          ["off-palette Tailwind class", OFF_PALETTE],
        ];
        for (const [kind, re] of checks) {
          re.lastIndex = 0;
          if (re.test(text)) found.push({ file: rel, line: i + 1, kind, text: text.trim().slice(0, 140) });
        }
      });
    }
  }
  return found;
}

/* ---------- stylesheet tokens ---------- */

export type Theme = "light" | "dark";
export type Tokens = Record<string, string>;

/** Extracts `--c-*: #hex;` declarations from the :root and .dark-mode blocks. */
export function parseTokens(css: string): Record<Theme, Tokens> {
  const grab = (selector: RegExp): Tokens => {
    const m = selector.exec(css);
    if (!m) throw new Error(`block not found: ${selector}`);
    const start = css.indexOf("{", m.index) + 1;
    let depth = 1;
    let i = start;
    while (depth > 0 && i < css.length) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    const body = css.slice(start, i - 1);
    const tokens: Tokens = {};
    for (const d of body.matchAll(/--c-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) tokens[d[1]] = d[2].toLowerCase();
    return tokens;
  };
  return { light: grab(/^:root\s*\{/m), dark: grab(/^\.dark-mode\s*\{/m) };
}

export function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

/** Chroma = max - min of the RGB channels, 0 (grey) to 1 (fully saturated). */
export function chroma(hex: string): number {
  const [r, g, b] = rgb(hex);
  return Math.max(r, g, b) - Math.min(r, g, b);
}

/** HSL lightness, used for ladders (WCAG luminance compresses dark surfaces). */
export function lightness(hex: string): number {
  const [r, g, b] = rgb(hex);
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
}

function lin(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map(lin) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Tokens above this chroma are "chromatic". Cool neutrals stay under about 0.2. */
export const CHROMATIC_THRESHOLD = 0.3;

export const EXPECTED_CHROMATIC = [
  "accent",
  "honey",
  "honey-hi",
  "mark",
  "note",
  "secondary",
  "signal",
  "status",
] as const;

/** Resolves `--color-x: var(--c-y)` aliases in the @theme inline block. */
export function parseAliases(css: string): Array<{ alias: string; token: string }> {
  return [...css.matchAll(/--color-([a-z-]+):\s*var\(--c-([a-z-]+)\)\s*;/g)].map((m) => ({
    alias: m[1],
    token: m[2],
  }));
}
