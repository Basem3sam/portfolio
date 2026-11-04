import { defineConfig } from "@playwright/test";

/** Runs only the puzzle fair-play spec. It reads game data, needs no browser
    and no build, so it finishes in a couple of seconds. */
export default defineConfig({
  testDir: "./tests",
  testMatch: "puzzle-fairness.spec.ts",
  reporter: [["list"]],
});
