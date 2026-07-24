/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Auth proxy is implemented in src/app/backend/[...path]/route.ts
  // (rewrites alone drop/mangle Set-Cookie on some mobile browsers)
};

module.exports = nextConfig;
