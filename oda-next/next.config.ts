import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["leaflet", "react-leaflet"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;
