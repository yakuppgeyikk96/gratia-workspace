import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@gratia/ui"],
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
