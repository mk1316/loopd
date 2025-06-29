const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // New stable configuration options for Next.js 15
  bundlePagesRouterDependencies: true,
  serverExternalPackages: [],
}

module.exports = nextConfig
