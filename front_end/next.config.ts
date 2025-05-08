import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "google.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
