import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enforce type checking during build
  },
  eslint: {
    ignoreDuringBuilds: false, // Enforce linting during build
  },
  serverExternalPackages: ['ccxt', 'ws'], // Exclude CCXT and WebSocket from bundling
  // instrumentation.ts is enabled by default in Next.js 15, no need for experimental flag
};

export default nextConfig;
