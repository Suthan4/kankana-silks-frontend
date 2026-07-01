import { devices, webkit } from "@playwright/test";

const browser = await webkit.launch({
  headless: false,
});

const context = await browser.newContext({
  ...devices["Desktop Safari"],
  viewport: {
    width: 1440,
    height: 900,
  },
});

const page = await context.newPage();

await page.goto("https://www.kankanasilks.com", {
  waitUntil: "domcontentloaded",
});

console.log("Desktop Safari WebKit is open.");
console.log("Click categories, products and scroll normally.");
console.log("Press Ctrl + C only when you want to close it.");

// A timer keeps the Node.js process and browser alive.
const keepAlive = setInterval(() => {
  // Intentionally empty.
}, 1000);

const closeBrowser = async () => {
  console.log("\nClosing WebKit browser...");

  clearInterval(keepAlive);

  try {
    await browser.close();
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", closeBrowser);
process.on("SIGTERM", closeBrowser);

browser.on("disconnected", () => {
  clearInterval(keepAlive);
  process.exit(0);
});
