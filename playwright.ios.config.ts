import { defineConfig, devices } from "@playwright/test";

/**
 * iOS-vs-Android regression config. Separate from playwright.config.ts, which
 * is the manual "headed Safari" debugging setup (timeout: 0, one project).
 *
 *   npm run test:ios                       # starts `npm run dev` on :5174
 *   E2E_BASE_URL=https://staging... npm run test:ios   # against a deployed env
 *
 * NOTE: "ios-webkit" is Playwright's WebKit engine with an iPhone profile. It
 * is NOT real Safari. It catches layout/DOM/behaviour regressions but cannot
 * reproduce compositor flicker or toolbar (vh/svh) resizing - those still need
 * a physical iPhone or a cloud device (BrowserStack/Sauce) before release.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:5174";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    { name: "ios-webkit", use: { ...devices["iPhone 14"] } },
    // Same tests on the engine that never showed the bug: if a test passes
    // here and fails above, the regression is WebKit-specific.
    { name: "android-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
