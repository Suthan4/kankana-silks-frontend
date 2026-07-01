# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: browser.test.ts >> WebKit browser smoke test
- Location: browser.test.ts:3:1

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Example Domain/i
Received string:  "Kankana Silks - Timeless Heritage | Authentic Silk Sarees"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    9 × unexpected value "Kankana Silks - Timeless Heritage | Authentic Silk Sarees"

```

```yaml
- banner:
  - button "Deliver to Select Location"
  - link "Kankana Silks":
    - /url: /
    - img "Kankana Silks"
  - button "Search…"
  - link "Cart":
    - /url: /cart
    - button
    - text: Cart
  - link "Wishlist":
    - /url: /wishlist
    - button
    - text: Wishlist
  - button
  - text: Connect on WhatsApp
  - button "Sign In"
  - navigation "Primary navigation":
    - list:
      - listitem: No categories available
- img
- main:
  - paragraph: Loading amazing content...
- contentinfo:
  - img "Kankana Silks"
  - paragraph: Celebrating centuries of saree-making tradition with modern elegance.
  - button "Find Our Stores"
  - heading "Shop" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: /about
    - listitem:
      - link "Contact Us":
        - /url: /contact
    - listitem:
      - link "FAQ":
        - /url: /faq
    - listitem:
      - link "Return & Refund Policy":
        - /url: /return-policy
    - listitem:
      - link "Cancellation Policy":
        - /url: /cancellation-policy
    - listitem:
      - link "Product Details & Appearance":
        - /url: /product-details-appearance
    - listitem:
      - link "Shipping Policy":
        - /url: /shipping-policy
  - heading "Connect" [level=4]
  - list:
    - listitem:
      - link "Instagram":
        - /url: https://instagram.com/kankanasilks
    - listitem:
      - link "Youtube":
        - /url: https://youtube.com/@kankanasilks
    - listitem:
      - button "Store Locator"
  - heading "Newsletter" [level=4]
  - paragraph: New collections and exclusive offers, straight to your inbox.
  - textbox "Your email"
  - button "Join"
  - paragraph: © 2026 Kankana Silks. All rights reserved.
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
  - button "Stores"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("WebKit browser smoke test", async ({ page }) => {
  4  |   page.on("crash", () => {
  5  |     console.error("WEBKIT PAGE CRASHED");
  6  |   });
  7  | 
  8  |   page.on("pageerror", (error) => {
  9  |     console.error("PAGE ERROR:", error.message);
  10 |   });
  11 | 
  12 |   await page.goto("https://www.kankanasilks.com", {
  13 |     waitUntil: "commit",
  14 |     timeout: 60_000,
  15 |   });
  16 | 
> 17 |   await expect(page).toHaveTitle(/Example Domain/i);
     |                      ^ Error: expect(page).toHaveTitle(expected) failed
  18 | 
  19 |   await page.pause();
  20 | });
```