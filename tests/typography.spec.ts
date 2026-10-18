import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Typography contract (redesign phase 2). File-based like color-discipline:
 * it needs no built app, so it can run before `next build`. It checks wiring,
 * not rendering; look at / and /ar in a browser for the visual result.
 */

const ROOT = process.cwd();
const read = (...p: string[]) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const css = read("app", "globals.css");
const layout = read("app", "[lang]", "layout.tsx");

test.describe("typography wiring", () => {
  test("layout loads the four redesign faces and no IBM Plex", () => {
    for (const face of ["Instrument_Sans", "Plus_Jakarta_Sans", "Readex_Pro", "JetBrains_Mono"]) {
      expect(layout, face).toContain(face);
    }
    expect(layout).not.toMatch(/IBM_Plex/);
  });

  test("Arabic face is not preloaded on English routes", () => {
    const readex = layout.slice(layout.indexOf("Readex_Pro({"));
    expect(readex.slice(0, readex.indexOf("});"))).toContain("preload: false");
  });

  test("every next/font variable the stylesheet reads is declared in the layout", () => {
    const used = new Set([...css.matchAll(/var\((--font-(?:instrument|jakarta|readex|jetbrains))\b/g)].map((m) => m[1]));
    expect(used.size).toBeGreaterThan(0);
    for (const v of used) expect(layout, v).toContain(`variable: "${v}"`);
  });

  test("English and Arabic locales attach the right face variables", () => {
    expect(layout).toMatch(/locale === "ar"\s*\?[^:]*readexPro\.variable/);
    expect(layout).toMatch(/instrumentSans\.variable[^`]*jakartaDisplay\.variable/);
  });

  test("type scale tokens exist and headings use the display family", () => {
    for (const t of ["display", "h1", "h2", "h3", "lead"]) {
      expect(css, t).toMatch(new RegExp(`--text-${t}:`));
      expect(css, t).toMatch(new RegExp(`--text-${t}--line-height:`));
    }
    expect(css).toMatch(/h1,\s*h2,\s*h3\s*\{[^}]*font-family:\s*var\(--font-display-body\)/);
    expect(css).toMatch(/--font-display:\s*var\(--font-display-body\)/);
  });

  test("Arabic zeroes letter-spacing and uses the body family for headings", () => {
    expect(css).toMatch(/html\[lang="ar"\]\s*\*\s*\{[^}]*letter-spacing:\s*0\s*!important/);
    expect(css).toMatch(/html\[lang="ar"\]\s*\{[^}]*--font-display-body:\s*var\(--font-body\)/);
  });
});
