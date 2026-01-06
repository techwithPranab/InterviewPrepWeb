import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/lib/*": require("path").resolve(__dirname, "src/lib"),
      "@/app/*": require("path").resolve(__dirname, "src/app"),
      "@/*": require("path").resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
