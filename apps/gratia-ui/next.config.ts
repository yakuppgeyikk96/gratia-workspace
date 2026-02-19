import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@gratia/ui"],
  async rewrites() {
    const vendorDashboardUrl =
      process.env.VENDOR_DASHBOARD_URL || "http://localhost:3100";
    return {
      beforeFiles: [
        {
          source: "/vendor",
          destination: `${vendorDashboardUrl}/vendor`,
        },
        {
          source: "/vendor/:path+",
          destination: `${vendorDashboardUrl}/vendor/:path+`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
      },
      {
        protocol: "https",
        hostname: "static.nike.com",
      },
      {
        protocol: "https",
        hostname: "images.samsung.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [128, 256, 384, 512],
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["@gratia/ui"],
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
