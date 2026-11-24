import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

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

// Hosts that serve uploaded media (images AND videos).
const MEDIA_CLOUDFRONT = "https://d2eb3zuw9j68gk.cloudfront.net";
const MEDIA_S3 = "https://kankana-bucket.s3.ap-south-1.amazonaws.com";
const MEDIA_VERCEL_BLOB = "https://*.public.blob.vercel-storage.com";

/**
 * Compatibility CSP for the current statically rendered App Router storefront.
 *
 * Next.js emits inline bootstrap/Flight scripts, while the Adobe Fonts kit
 * requires inline styles. This policy therefore allows inline script/style
 * execution but blocks eval, plugins, arbitrary HTTPS origins and untrusted
 * frames. It is an important baseline, not a strict nonce/hash CSP.
 *
 * A nonce-based strict CSP would require request-time rendering and would
 * disable the current static/ISR caching model. Evaluate that as a separate
 * architecture change rather than silently sacrificing page caching.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self' https://*.razorpay.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.razorpay.com https://use.typekit.net https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline' https://use.typekit.net",
  `img-src 'self' data: blob: ${MEDIA_CLOUDFRONT} ${MEDIA_S3} ${MEDIA_VERCEL_BLOB} https://p.typekit.net https://www.google-analytics.com https://c.bing.com`,
  // Without media-src, <video> falls back to default-src 'self' and videos
  // from CloudFront/S3 are blocked (Safari shows a slashed play icon).
  // blob: is required for the video card's blob recovery fallback.
  `media-src 'self' blob: ${MEDIA_CLOUDFRONT} ${MEDIA_S3} ${MEDIA_VERCEL_BLOB}`,
  "font-src 'self' data: https://use.typekit.net https://p.typekit.net",
  [
    "connect-src 'self'",
    API_ORIGIN,
    // Needed for the video card's blob recovery (fetch of the video file).
    MEDIA_CLOUDFRONT,
    MEDIA_S3,
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://analytics.google.com",
    "https://stats.g.doubleclick.net",
    "https://performance.typekit.net",
    "https://*.razorpay.com",
    "https://www.clarity.ms",
    "https://*.clarity.ms",
    "https://c.bing.com",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-src 'self' https://*.razorpay.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
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
          ...(isProduction
            ? [
                {
                  key: "Content-Security-Policy",
                  value: contentSecurityPolicy,
                },
              ]
            : []),
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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // AWS S3
      {
        protocol: "https",
        hostname: "kankana-bucket.s3.ap-south-1.amazonaws.com",
      },
      // Cloudfront
      { protocol: "https", hostname: "d2eb3zuw9j68gk.cloudfront.net" },
      // LocalStack / local S3
      {
        protocol: "http",
        hostname: "localhost",
        port: "4566",
        pathname: "/**",
      },
    ],
    // WebP only: AVIF takes ~9x longer to encode, which slows the first
    // (uncached) request for each banner size.
    formats: ["image/webp"],
    qualities: [60, 75, 80],
    // Optimised images are cached for 30 days (banner URLs are content-hashed).
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;