import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: true,
    turbopackPluginRuntimeStrategy: 'workerThreads',
    cpus: 2,
  },
};

export default nextConfig;
