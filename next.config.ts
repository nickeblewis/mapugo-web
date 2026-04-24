import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // No upload size cap while testing — remove once limits are agreed.
    serverActions: { bodySizeLimit: "100mb" },
  },
  images: {
    // Allow next/image to optimise images served from Sanity's CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
