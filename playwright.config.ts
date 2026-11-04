import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 1,
  reporter: [["list"]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // Always build here, and never reuse anything already listening on the
    // port: an earlier local server was serving a STALE build once and the
    // suite happily tested it, producing invalid evidence. Failing loudly
    // on "port already in use" is the truthful behaviour - stop the other
    // server (or let this one build) instead of testing old code.
    // CI relies on this too: the E2E job has no separate Build step, so the
    // suite always runs against a build made for that exact run.
    command: "npm run build && npm start",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
