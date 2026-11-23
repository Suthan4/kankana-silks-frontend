import type { MetadataRoute } from "next";

const SITE_URL = "https://www.kankanasilks.com";

/**
 * Keep all application routes crawlable so search engines can read page-level
 * robots metadata. Private and utility pages are marked noindex,follow in
 * their route layouts. Only API endpoints and the coming-soon page are blocked.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop/", "/products/", "/about-us", "/contact-us", "/faq"],
      disallow: ["/api/", "/coming-soon"],
    },
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  };
}
