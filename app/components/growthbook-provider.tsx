'use client'

import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getUserTier } from '@/lib/tier-access'

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

  useEffect(() => {
    // Load features from GrowthBook API
    growthbook.loadFeatures()
  }, [])

  useEffect(() => {
    // Update user attributes when session changes
    if (status === 'loading') return

    const pledgeAmount = session?.user?.pledgeAmountCents
    const userTier = getUserTier(pledgeAmount)
    const isActivePatron = session?.user?.patronStatus === 'active_patron'

    growthbook.setAttributes({
      id: session?.user?.id || 'anonymous',
      loggedIn: !!session,
      patreonId: session?.user?.patreonId,
      email: session?.user?.email,
      // Patreon tier attributes for targeting
      patreonTier: userTier,
      pledgeAmountCents: pledgeAmount,
      isActivePatron,
      // Tier-specific booleans for easy targeting
      isBasicTier: userTier === 'basic',
      isPremiumTier: userTier === 'premium',
      isUltimateTier: userTier === 'ultimate',
    })
  }, [session, status])

  return (
    <GrowthBookProvider growthbook={growthbook}>
      {children}
    </GrowthBookProvider>
  )
}
