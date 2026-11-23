import type { NextConfig } from "next";

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
