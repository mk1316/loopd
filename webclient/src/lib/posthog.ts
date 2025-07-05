import posthog from 'posthog-js'

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://www.loopd.dev/relay-rNY3',
    // Capture page views automatically
    capture_pageview: true,
    // Capture clicks automatically
    capture_pageleave: true,
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug()
        console.log('PostHog loaded in development mode with reverse proxy')
      }
    }
  })
}

export { posthog } 