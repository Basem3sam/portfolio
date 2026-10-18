import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  CHROMATIC_THRESHOLD,
  EXPECTED_CHROMATIC,
  chroma,
  contrast,
  lightness,
  parseAliases,
  parseTokens,
  scanSources,
} from "./helpers/color-scan";

/**
 * Colour discipline. Two checks, because a hex search alone is not a colour
 * system:
 *   1. source scan: no colour literals, arbitrary colour classes or
 *      off-palette Tailwind classes outside a short, closed exempt list;
 *   2. stylesheet: the chromatic token set is exactly the designed one, the
 *      surface ladder means the same thing in both themes, every Tailwind
 *      alias points at a token that exists in both themes, and the text
 *      tokens meet WCAG AA on every surface.
 *
 * Both read files only; neither needs a built app. Measuring colours in a
 * browser is only valid against a fresh build (see playwright.config.ts).
 */

const ROOT = process.cwd();
const css = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");
const tokens = parseTokens(css);

test.describe("colour discipline", () => {
  test("no colour literals outside the exempt list", () => {
    const violations = scanSources(ROOT);
    const report = violations.map((v) => `${v.file}:${v.line}  [${v.kind}]  ${v.text}`).join("\n");
    expect(violations, `Use a design token from app/globals.css instead:\n${report}`).toEqual([]);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme}: chromatic token set is exactly the designed one`, () => {
      const chromatic = Object.entries(tokens[theme])
        .filter(([, hex]) => chroma(hex) > CHROMATIC_THRESHOLD)
        .map(([name]) => name)
        .sort();
      expect(chromatic).toEqual([...EXPECTED_CHROMATIC].sort());
    });

    test(`${theme}: surface ladder runs dark-bg < light-bg < page < surface`, () => {
      const t = tokens[theme];
      const order = ["dark-bg", "light-bg", "page", "surface"].map((n) => lightness(t[n]));
      expect(order, "lightness must rise from the deepest recess to the raised card").toEqual(
        [...order].sort((a, b) => a - b),
      );
      expect(new Set(order).size, "no two ladder steps may be identical").toBe(order.length);
    });

    test(`${theme}: text tokens meet WCAG AA on every surface`, () => {
      const t = tokens[theme];
      const surfaces = ["page", "light-bg", "dark-bg", "surface"];
      // secondary is a fill (on-secondary sits on it), so it is checked as a fill below.
      const textTokens = ["dark-text", "light-text", "muted-text", "note", "signal", "status", "accent"];
      const failures: string[] = [];
      for (const text of textTokens) {
        for (const surface of surfaces) {
          const ratio = contrast(t[text], t[surface]);
          if (ratio < 4.5) failures.push(`${text} on ${surface}: ${ratio.toFixed(2)}`);
        }
      }
      expect(failures).toEqual([]);
      expect(contrast(t["on-secondary"], t["secondary"])).toBeGreaterThanOrEqual(4.5);
    });
  }

  test("every Tailwind colour alias points at a token defined in both themes", () => {
    const aliases = parseAliases(css);
    expect(aliases.length).toBeGreaterThan(0);
    const missing = aliases.filter(
      ({ token }) => !(token in tokens.light) && !/^(glass|glass-edge|inner-light)$/.test(token),
    );
    expect(missing).toEqual([]);
    for (const { token } of aliases) {
      if (token in tokens.light) expect(tokens.dark, `${token} missing in dark`).toHaveProperty(token);
    }
  });
});
