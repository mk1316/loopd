'use client'

import { usePostHog as usePostHogOriginal } from 'posthog-js/react'

export function usePostHog() {
  const posthog = usePostHogOriginal()
  
  return {
    ...posthog,
    // Custom tracking methods
    trackButtonClick: (buttonName: string, properties?: Record<string, any>) => {
      posthog?.capture('button_clicked', {
        button_name: buttonName,
        ...properties
      })
    },
    trackPageView: (pageName: string, properties?: Record<string, any>) => {
      posthog?.capture('$pageview', {
        page_name: pageName,
        ...properties
      })
    },
    trackSignUp: (method: string, properties?: Record<string, any>) => {
      posthog?.capture('sign_up', {
        method,
        ...properties
      })
    },
    trackLogin: (method: string, properties?: Record<string, any>) => {
      posthog?.capture('login', {
        method,
        ...properties
      })
    },
    trackFeatureUsage: (featureName: string, properties?: Record<string, any>) => {
      posthog?.capture('feature_used', {
        feature_name: featureName,
        ...properties
      })
    }
  }
} 