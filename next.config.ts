
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
  // By setting these to false, we prevent next-pwa from auto-generating
  // manifest entries that can cause console errors if the files don't exist.
  // We are managing the manifest through the layout metadata instead.
  fallbacks: false,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwaConfig(nextConfig);
