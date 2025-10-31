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
  experimental: {
    instrumentationHook: true, // Enable instrumentation with Node.js runtime
  },
};

export default nextConfig;
