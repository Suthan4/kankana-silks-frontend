import type { MetadataRoute } from "next";

const SITE_URL = "https://www.kankanasilks.com";

/**
 * Keep public shopping and editorial pages crawlable while preventing
 * private, transactional, API and internal-search URLs from being indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop/", "/products/", "/about-us", "/contact-us", "/faq"],
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/order-success",
        "/my-account/",
        "/wishlist",
        "/reset-password",
        // Match the search route only when it has a query string.
        // Do not use "/s": that prefix would also block /shop and /shipping-policy.
        "/s?",
        "/coming-soon",
      ],
    },
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  };
}
