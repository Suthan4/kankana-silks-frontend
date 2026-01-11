import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // ✅ AWS S3 (your bucket)
      {
        protocol: "https",
        hostname: "kankana-bucket.s3.ap-south-1.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
