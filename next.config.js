/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: export as we're using API routes
  experimental: {
    serverActions: true,
  }
}

module.exports = nextConfig