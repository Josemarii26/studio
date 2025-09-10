
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
    ],
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Exclude Firebase messaging service worker from precaching
  buildExcludes: [/middleware-manifest\.json$/, /firebase-messaging-sw\.js$/],
  // Make sure the Firebase service worker is imported into the generated PWA service worker
  importScripts: ['/firebase-messaging-sw.js'],
});

export default pwaConfig(nextConfig);
