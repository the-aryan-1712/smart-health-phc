import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloud Run single-container deployment
  output: "standalone",

  // Disable image optimisation cache (no persistent storage on Cloud Run)
  images: {
    unoptimized: process.env.NODE_ENV === "production",
  },

  // Strict TypeScript in build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
