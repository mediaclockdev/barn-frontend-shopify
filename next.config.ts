// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // <-- Automatically fixes the Vercel timeout issue
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wasoftwaredevelopment.com.au",
        pathname: "/**", // Use wildcard to catch any plugin images too
      },
    ],
  },
};

export default nextConfig;
