import type { NextConfig } from "next";

const blobHost = process.env.BLOB_PUBLIC_HOST; // e.g. xxxx.public.blob.vercel-storage.com

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(blobHost ? [{ protocol: "https" as const, hostname: blobHost }] : []),
    ],
  },
};

export default config;
