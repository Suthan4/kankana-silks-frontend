import type { NextConfig } from "next";

const API_ORIGIN = (() => {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredApiUrl) return undefined;

  try {
    return new URL(configuredApiUrl).origin;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be an absolute URL so it can be included in the Content-Security-Policy.",
    );
  }
})();

/**
 * Baseline production CSP for the current statically rendered App Router site.
 *
 * The current storefront needs inline scripts for Next.js App Router's streamed
 * payload and the Google Analytics integration. Adobe Fonts also requires
 * inline styles. We therefore allow inline scripts/styles for compatibility,
 * but do not allow eval, plugins, arbitrary HTTPS origins, or unrestricted
 * frames. A nonce-based strict CSP would require dynamic rendering and would
 * disable the current static/ISR caching model; evaluate that separately before
 * changing the rendering strategy.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self' https://api.razorpay.com https://checkout.razorpay.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://checkout.razorpay.com https://use.typekit.net https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline' https://use.typekit.net",
  "img-src 'self' data: blob: https://d2eb3zuw9j68gk.cloudfront.net https://kankana-bucket.s3.ap-south-1.amazonaws.com https://*.public.blob.vercel-storage.com https://p.typekit.net https://www.google-analytics.com https://c.bing.com",
  "font-src 'self' data: https://use.typekit.net https://p.typekit.net",
  [
    "connect-src 'self'",
    API_ORIGIN,
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://analytics.google.com",
    "https://stats.g.doubleclick.net",
    "https://performance.typekit.net",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    "https://*.clarity.ms",
    "https://c.bing.com",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Keep route metadata in the document <head> for search crawlers.
  htmlLimitedBots:
    /Googlebot|Google-InspectionTool|bingbot|BingPreview|DuckDuckBot|Slurp|YandexBot|Baiduspider|Screaming Frog SEO Spider|AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot/i,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/policies/cancellation-policy",
        destination: "/cancellation-policy",
        permanent: true,
      },
      {
        source: "/policies/product-details-appearance",
        destination: "/product-details-appearance",
        permanent: true,
      },
      {
        source: "/policies/shipping-policy",
        destination: "/shipping-policy",
        permanent: true,
      },
      {
        source: "/policies/return-refund-policy",
        destination: "/return-policy",
        permanent: true,
      },
    ];
  },
  experimental: {
    // Inlines the ~25 KB of CSS into the HTML so it no longer blocks rendering
    // as 3 separate requests. Remove this line if you see any styling issue.
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // AWS S3
      { protocol: "https", hostname: "kankana-bucket.s3.ap-south-1.amazonaws.com" },
      // Cloudfront
      { protocol: "https", hostname: "d2eb3zuw9j68gk.cloudfront.net" },
      // LocalStack / local S3
      { protocol: "http", hostname: "localhost", port: "4566", pathname: "/**" },
    ],
    // WebP only: AVIF takes ~9x longer to encode, which slows the first
    // (uncached) request for each banner size.
    formats: ["image/webp"],
    qualities: [60, 75],
    // Optimised images are cached for 30 days (banner URLs are content-hashed).
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
