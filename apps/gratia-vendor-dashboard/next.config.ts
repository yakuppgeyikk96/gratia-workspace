import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/vendor",
  transpilePackages: ["@gratia/ui"],
  async rewrites() {
    const apiUrl = process.env.API_URL || "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["@gratia/ui", "lucide-react"],
  },
};

export default nextConfig;
