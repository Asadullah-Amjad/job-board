import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resume upload (max 5 MB) ke liye server action body limit barhai hai
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
