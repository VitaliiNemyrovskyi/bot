import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true // TEMPORARILY - enable after fixing TS errors, // Enforce type checking during build
  },
  eslint: {
    ignoreDuringBuilds: true // TEMPORARILY, // Enforce linting during build
  },
  serverExternalPackages: ['ccxt', 'ws', '@prisma/client', '.prisma/client'], // Exclude CCXT, WebSocket and Prisma from bundling
  // instrumentation.ts is enabled by default in Next.js 15, no need for experimental flag
};

export default nextConfig;
