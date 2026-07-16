/** @type {import('next').NextConfig} */
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: "standalone",
  // Typecheck during CI/local: run `npx tsc --noEmit` or remove ignore when clean
  typescript: {
    // Keep false so real type errors fail the build
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.zipd.io https://*.vercel-insights.com",
              "connect-src 'self' https://*.clerk.accounts.dev https://clerk.zipd.io https://*.neon.tech https://vitals.vercel-insights.com https://*.vercel-insights.com",
              "img-src 'self' data: https://www.google.com https://images.unsplash.com https://img.clerk.com https://*.googleusercontent.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-src 'self' https://*.clerk.accounts.dev https://accounts.google.com",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  cacheComponents: true,
};

export default nextConfig;
