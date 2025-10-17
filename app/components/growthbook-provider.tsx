'use client'

import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

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
  const { data: session, status } = useSession()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load features from GrowthBook API
    growthbook.loadFeatures().then(() => {
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    // Update user attributes when session changes
    if (status === 'loading') return

    growthbook.setAttributes({
      id: session?.user?.id || 'anonymous',
      loggedIn: !!session,
      patreonId: session?.user?.patreonId,
      email: session?.user?.email,
      // Add any custom attributes you want to target
      // e.g., userType, subscriptionTier, etc.
    })
  }, [session, status])

  return (
    <GrowthBookProvider growthbook={growthbook}>
      {children}
    </GrowthBookProvider>
  )
}
