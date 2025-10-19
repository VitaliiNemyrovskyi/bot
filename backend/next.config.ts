import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Temporarily skip type checking during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily skip linting during build
  },
  serverExternalPackages: ['ccxt', 'ws'], // Exclude CCXT and WebSocket from bundling
};

export default nextConfig;
