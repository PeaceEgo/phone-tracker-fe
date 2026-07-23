/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = (
      process.env.BACKEND_URL ||
      "https://phone-tracker-be.onrender.com"
    ).replace(/\/$/, "");

    return [
      {
        // Same-origin proxy so auth cookies are first-party on the FE host
        // (required for mobile Safari/Chrome ITP with split FE/BE domains)
        source: "/backend/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
