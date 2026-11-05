import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Avoid filling Netlify's disk: reuse dependency/source caches across builds.
  experimental: {
    webpackBuildWorker: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.thewhiskyworld.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'lllipyzpdoiennpspafh.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // <-- Added this
      },
    ],
  },
};

export default nextConfig;