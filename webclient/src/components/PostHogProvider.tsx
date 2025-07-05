'use client'

import { PostHogProvider as Provider } from 'posthog-js/react'
import { posthog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider client={posthog}>
      {children}
    </Provider>
  )
} 