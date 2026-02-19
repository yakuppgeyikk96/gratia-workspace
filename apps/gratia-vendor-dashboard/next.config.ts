import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/vendor",
  transpilePackages: ["@gratia/ui"],
  experimental: {
    optimizePackageImports: ["@gratia/ui", "lucide-react"],
  },
};

export default nextConfig;
