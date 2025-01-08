import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEON_DOCSDB_URL: process.env.NEON_DOCSDB_URL,
    NEON_DOCSDB_URL_READONLY: process.env.NEON_DOCSDB_URL_READONLY,
    NEON_VECTORDB_URL: process.env.NEON_VECTORDB_URL,
    NEON_VECTORDB_URL_READONLY: process.env.NEON_VECTORDB_URL_READONLY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "super-rag.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
