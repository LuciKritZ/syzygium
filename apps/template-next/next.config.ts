import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@syzygium/protos'],
  reactStrictMode: true,
};

export default nextConfig;
