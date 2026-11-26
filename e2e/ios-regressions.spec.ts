import { expect, test, type Page } from "@playwright/test";

/**
 * Regression checks for the iOS/Safari glitches fixed in this change.
 * Runs on "ios-webkit" (iPhone profile) and "android-chromium" (Pixel profile).
 *
 * WebKit here is Playwright's engine, NOT real Safari: these tests catch
 * layout/behaviour regressions, but compositor flicker still needs a real
 * iPhone (see scripts/analyze-recording.py).
 */

// The server-rendered HTML is visible long before React attaches its event
// handlers (seconds in `next dev`, which compiles on first visit). A click in
// that window silently does nothing, so wait until React owns the nav buttons.
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector("nav.fixed.bottom-0 button");
    return (
      !!el && Object.keys(el).some((k) => k.startsWith("__reactProps$"))
    );
  });
}

async function openHome(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHydration(page);
}

// Pre-answer the cookie banner. Otherwise it appears after hydration and
// covers the bottom of the screen (bottom nav and hero controls).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("kankana-analytics-consent", "denied");
    } catch {
      /* storage unavailable: the banner just shows */
    }
  });
});

test.describe("home page on a phone", () => {
  test("hero does not move or resize while the page loads", async ({ page }) => {
    await openHome(page);

    const hero = page.getByTestId("hero-banner");
    test.skip(
      (await hero.count()) === 0,
      "No banners returned by the API in this environment",
    );
    await hero.waitFor({ state: "visible" });

    // Sample the hero's box for ~2.5s. After the first paint it must not move.
    const samples: { top: number; height: number }[] = [];
    for (let i = 0; i < 25; i++) {
      samples.push(
        await hero.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { top: Math.round(r.top), height: Math.round(r.height) };
        }),
      );
      await page.waitForTimeout(100);
    }
    const settled = samples.slice(3); // ignore the first ~300ms
    const tops = settled.map((s) => s.top);
    const heights = settled.map((s) => s.height);
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2);
  });

  test("bottom nav is visible immediately (no slide-in on load)", async ({
    page,
  }) => {
    await openHome(page);
    const nav = page.locator("nav.fixed.bottom-0");
    await nav.waitFor({ state: "attached" });

    // Previously: opacity 0 + translateY(100px) for ~0.9s after every load.
    const opacity = await nav.evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
  });

  test("modal locks the page and restores the original scroll position", async ({
    page,
  }) => {
    await openHome(page);

    const initialScrollY = await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(500, Math.max(0, maxScroll)));
      return window.scrollY;
    });
    test.skip(initialScrollY < 1, "Page is not tall enough to verify scroll restoration");

    const dialog = page.locator('[role="dialog"][aria-labelledby="modal-title"]');
    const loginButton = page
      .locator("nav.fixed.bottom-0")
      .getByRole("button", { name: /login/i });

    await loginButton.click();
    await expect(dialog).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.body.dataset.modalScrollLocked ?? ""),
      )
      .toBe("true");

    const lockedStyles = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      position: document.body.style.position,
    }));
    expect(lockedStyles.overflow).toBe("hidden");

    await page.getByRole("button", { name: "Close dialog" }).click();
    await expect(dialog).toBeHidden();
    await expect
      .poll(() =>
        page.evaluate(() => document.body.dataset.modalScrollLocked ?? ""),
      )
      .toBe("");

    const restoredScrollY = await page.evaluate(() => window.scrollY);
    expect(Math.abs(restoredScrollY - initialScrollY)).toBeLessThanOrEqual(2);
  });

  test("login modal plays its exit animation instead of vanishing", async ({
    page,
  }) => {
    await openHome(page);

    const dialog = page.locator('[role="dialog"][aria-labelledby="modal-title"]');
    const loginButton = page
      .locator("nav.fixed.bottom-0")
      .getByRole("button", { name: /login/i });

    // The modal is code-split (dynamic import on first open), so the first
    // open can take a moment in dev. Retry the tap until it shows.
    await expect(async () => {
      if (!(await dialog.isVisible())) await loginButton.click({ timeout: 2000 });
      await expect(dialog).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20_000 });
    await expect(dialog).toHaveCSS("opacity", "1"); // finished fading in

    // Record when the close button is clicked and when the dialog leaves the DOM.
    await page.evaluate(() => {
      const w = window as unknown as { __clickAt?: number; __goneAt?: number };
      const btn = document.querySelector('button[aria-label="Close dialog"]')!;
      btn.addEventListener(
        "click",
        () => {
          w.__clickAt = performance.now();
        },
        { capture: true },
      );
      const dlg = document.querySelector(
        '[role="dialog"][aria-labelledby="modal-title"]',
      )!;
      new MutationObserver(() => {
        if (!dlg.isConnected && !w.__goneAt) w.__goneAt = performance.now();
      }).observe(document.body, { childList: true, subtree: true });
    });

    await page.getByRole("button", { name: "Close dialog" }).click();
    await page.waitForFunction(
      () => (window as unknown as { __goneAt?: number }).__goneAt !== undefined,
    );

    const elapsed = await page.evaluate(() => {
      const w = window as unknown as { __clickAt: number; __goneAt: number };
      return w.__goneAt - w.__clickAt;
    });
    // Exit tween is 180ms. Before the fix the dialog was removed in the same frame.
    expect(elapsed).toBeGreaterThan(120);
  });

  test("consultation sheet completes its exit and can reopen cleanly", async ({
    page,
  }) => {
    await openHome(page);

    const consultationButton = page
      .locator("nav.fixed.bottom-0")
      .getByRole("button", { name: "Consultation" });
    const dialog = page.locator(
      '[role="dialog"][aria-labelledby="video-consultation-title"]',
    );

    await consultationButton.click();
    await expect(dialog).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.body.dataset.modalScrollLocked ?? ""),
      )
      .toBe("true");

    await page.getByRole("button", { name: "Close video consultation" }).click();
    await expect(dialog).toBeHidden();
    await expect
      .poll(() =>
        page.evaluate(() => document.body.dataset.modalScrollLocked ?? ""),
      )
      .toBe("");

    await consultationButton.click();
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "Close video consultation" }).click();
    await expect(dialog).toBeHidden();
  });

  test("mobile navigation drawer slides out before releasing the page lock", async ({
    page,
  }) => {
    await openHome(page);

    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.locator(
      '[role="dialog"][aria-label="Mobile navigation"]',
    );
    await expect(drawer).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.body.dataset.modalScrollLocked ?? ""),
      )
      .toBe("true");

    await drawer.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toBeHidden();
    await expect
      .poll(() =>
        page.evaluate(() => document.body.dataset.modalScrollLocked ?? ""),
      )
      .toBe("");
  });

  test("hero cross-fade keeps the old slide opaque under the new one", async ({
    page,
  }) => {
    await openHome(page);
    const dot = page.getByRole("button", { name: "Go to slide 2" });
    test.skip((await dot.count()) === 0, "Fewer than 2 banners in this environment");

    // Wait until the 2nd image is mounted (it loads once the 1st is ready).
    await page.waitForFunction(
      () => document.querySelectorAll("picture.hero-slide").length >= 2,
      undefined,
      { timeout: 15_000 },
    );

    await dot.click();

    // Immediately after the swap the outgoing slide must still be opaque,
    // otherwise the black section background flashes through mid-fade.
    const state = await page.evaluate(() => {
      const slides = [...document.querySelectorAll("picture.hero-slide")];
      return slides.map((el) => ({
        active: el.getAttribute("data-active") === "true",
        opacity: Number(getComputedStyle(el).opacity),
      }));
    });
    expect(state.filter((s) => s.active)).toHaveLength(1);
    expect(state.some((s) => !s.active && s.opacity === 1)).toBe(true);

    // ...and it is gone once the fade has finished.
    await page.waitForTimeout(1000);
    const after = await page.evaluate(() =>
      [...document.querySelectorAll("picture.hero-slide")]
        .filter((el) => el.getAttribute("data-active") !== "true")
        .map((el) => Number(getComputedStyle(el).opacity)),
    );
    expect(after.every((o) => o === 0)).toBe(true);
  });
});
