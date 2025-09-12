
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.dropbox.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dl.dropboxusercontent.com",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true, // Let the library handle registration
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  sw: "sw.js", // The name of our combined service worker
  buildExcludes: [/middleware-manifest\.json$/],
  // We don't need swSrc if we create sw.js in src/app
});

export default pwaConfig(nextConfig);

