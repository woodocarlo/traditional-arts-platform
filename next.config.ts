import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
