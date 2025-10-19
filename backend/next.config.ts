import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Temporarily skip type checking during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily skip linting during build
  },
  serverExternalPackages: ['ccxt'], // Exclude CCXT from bundling
};

export default nextConfig;
