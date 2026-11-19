import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [ 
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", },
       // AWS S3 
       { protocol: "https", hostname: "kankana-bucket.s3.ap-south-1.amazonaws.com", },
       // Cloudfront
       { protocol: "https", hostname: "d2eb3zuw9j68gk.cloudfront.net", },
        // LocalStack / local S3
         { protocol: "http", hostname: "localhost", port: "4566", pathname: "/**", }, ],
    formats: ["image/avif", "image/webp"],
    // Optimised images are cached for 30 days (banner URLs are content-hashed).
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;