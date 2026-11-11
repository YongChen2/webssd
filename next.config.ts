import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // náhled z telefonu / jiného zařízení v domácí síti (jen dev)
  allowedDevOrigins: ["192.168.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
