import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",

  // Manual testing should not end because of a timeout.
  timeout: 0,

  workers: 1,
  fullyParallel: false,

  use: {
    trace: "on",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "desktop-safari",
      use: {
        ...devices["Desktop Safari"],

        browserName: "webkit",

        viewport: {
          width: 1440,
          height: 900,
        },

        ignoreHTTPSErrors: true,

        // Avoid an old service worker interfering with navigation.
        serviceWorkers: "block",
      },
    },
  ],
});