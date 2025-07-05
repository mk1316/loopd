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
  // PostHog reverse proxy configuration
  async rewrites() {
    return [
      {
        source: "/relay-rNY3/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay-rNY3/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/relay-rNY3/flags",
        destination: "https://us.i.posthog.com/flags",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
