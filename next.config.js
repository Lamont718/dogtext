/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  // Premium was dropped (2026-09-29); the book is what DogText sells.
  async redirects() {
    return [{ source: '/premium', destination: '/book', permanent: true }];
  },
};

module.exports = nextConfig;
