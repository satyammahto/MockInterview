import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin and its Google Cloud dependencies use dynamic requires internally
  // that Turbopack cannot bundle. This tells Next.js to leave them as native Node.js modules.
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@opentelemetry/api",
    "pdf-parse",
    "canvas",
    "mammoth",
  ],
};

export default nextConfig;
