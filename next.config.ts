import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export for Tauri desktop app
  output: "export",
  // Disable image optimization (not needed for static export)
  images: {
    unoptimized: true,
  },
  // Add trailing slashes for file-based routing
  trailingSlash: true,
  // Disable TypeScript checking during build (we handle it separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
