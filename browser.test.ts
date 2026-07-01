import { expect, test } from "@playwright/test";

test("WebKit browser smoke test", async ({ page }) => {
  page.on("crash", () => {
    console.error("WEBKIT PAGE CRASHED");
  });

  page.on("pageerror", (error) => {
    console.error("PAGE ERROR:", error.message);
  });

  await page.goto("https://www.kankanasilks.com", {
    waitUntil: "commit",
    timeout: 60_000,
  });

  await expect(page).toHaveTitle(/Example Domain/i);

  await page.pause();
});