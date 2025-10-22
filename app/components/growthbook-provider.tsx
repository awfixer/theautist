'use client'

import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'
import { useEffect } from 'react'

// Initialize GrowthBook singleton
const growthbook = new GrowthBook({
  apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY || '',
  enableDevMode: process.env.NODE_ENV === 'development',
  subscribeToChanges: true,
  trackingCallback: (experiment, result) => {
    // Track experiment views in your analytics
    console.log('Viewed Experiment', {
      experimentId: experiment.key,
      variationId: result.key,
    })
  },
})

export function GrowthBookProviderWrapper({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  useEffect(() => {
    // Load features from GrowthBook API
    growthbook.loadFeatures()
    
    // Set default anonymous attributes
    growthbook.setAttributes({
      id: 'anonymous',
      loggedIn: false,
    })
  }, [])

  return (
    <GrowthBookProvider growthbook={growthbook}>
      {children}
    </GrowthBookProvider>
  )
}
