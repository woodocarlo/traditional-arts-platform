import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your existing images configuration
  images: {
    loader: "default",
    loaderFile: "",
    path: "/_next/image",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
    contentDispositionType: "inline",
    unoptimized: true,
  },

  // --- ADDITION ---
  // This tells Next.js not to bundle '@ffmpeg-installer/ffmpeg'
  // and to use the package from node_modules at runtime.
  webpack(config) {
    config.externals = config.externals || [];
    config.externals.push('@ffmpeg-installer/ffmpeg');
    return config;
  },
};

export default nextConfig;