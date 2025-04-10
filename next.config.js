/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for Vercel deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add rewrites to handle API routes properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;