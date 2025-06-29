const nextConfig = {
  experimental: {
    // appDir: true, // Removed as it's not needed in Next.js 14+
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.svg"],
    unoptimized: true,
  },
}

module.exports = nextConfig
