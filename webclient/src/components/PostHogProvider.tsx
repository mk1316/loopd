'use client'

import { PostHogProvider as Provider } from 'posthog-js/react'
import { posthog } from '@/lib/posthog'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Fire a $pageview event on every route change
    if (posthog) {
      posthog.capture('$pageview', {
        pathname,
        search: searchParams?.toString() || '',
      })
    }
  }, [pathname, searchParams])

  return (
    <Provider client={posthog}>
      {children}
    </Provider>
  )
} 