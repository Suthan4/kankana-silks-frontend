import type { MetadataRoute } from "next";

const SITE_URL = "https://www.kankanasilks.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/order-success",
        "/my-account",
        "/wishlist",
        "/reset-password",
        "/s?",
        "/coming-soon",
      ],
    },
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  };
}
