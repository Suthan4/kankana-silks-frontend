# Storefront analytics setup

## Environment
Set these variables on the storefront deployment (public IDs only):

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxxxx
```

The IDs are optional during development. Tracking stays disabled until an analytics consent choice is saved. The consent banner is mounted from the root layout; existing storefront providers and page behavior remain in place.

## Events currently instrumented
- `page_view` on route changes after consent.
- `view_item` when a product detail view is displayed / selected variant changes.
- `add_to_cart` after the existing add-to-cart mutation succeeds.
- `view_cart` when the cart route is visited.
- `begin_checkout` when a checkout route is visited.

No customer name, email, phone, address, order payload, or other directly identifying data is sent.

## Create GA4
1. Create a GA4 property and a Web data stream for `https://www.kankanasilks.com`.
2. Copy the Measurement ID into `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
3. Set the GA4 property reporting timezone to Asia/Kolkata.
4. Verify events in GA4 DebugView / Realtime after accepting analytics consent.

## Create Microsoft Clarity
1. Create a Clarity project for `https://www.kankanasilks.com`.
2. Copy its Project ID into `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
3. Review masking and consent settings before production use.

The consent choice is stored in browser local storage. Users can decline analytics; the scripts are not initialized for Clarity until consent is granted. Ensure the site's privacy/cookie notice accurately describes the tools and consent choice.
