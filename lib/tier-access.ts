import { PATREON_TIERS, hasAccess as configHasAccess } from '@/config/patreon-tiers'

/**
 * Get user's tier based on their pledge amount
 *
 * @param pledgeAmountCents - User's current pledge amount in cents
 * @returns Tier ID or undefined if no tier matches
 */
export function getUserTier(pledgeAmountCents: number | null | undefined): string | undefined {
  if (!pledgeAmountCents || pledgeAmountCents <= 0) return undefined

  // Find the highest tier the user qualifies for
  // PATREON_TIERS is ordered from highest to lowest
  for (const tier of PATREON_TIERS) {
    if (pledgeAmountCents >= tier.amountCents) {
      return tier.id
    }
  }

  return undefined
}

/**
 * Check if user has access to content requiring a specific tier
 *
 * @param userPledgeAmountCents - User's pledge amount in cents
 * @param requiredTier - Tier required for content (or undefined for free content)
 * @returns true if user has access
 */
export function hasContentAccess(
  userPledgeAmountCents: number | null | undefined,
  requiredTier: string | null | undefined
): boolean {
  // No tier required = free content
  if (!requiredTier) return true

  // Get user's tier based on pledge amount
  const userTier = getUserTier(userPledgeAmountCents)

  // Use config function to check access
  return configHasAccess(userTier, requiredTier)
}

/**
 * Server-side access check using session data
 * Use this in Server Components and API routes
 */
export async function checkTierAccess(
  session: { user?: { pledgeAmountCents?: number; patronStatus?: string } } | null,
  requiredTier: string | null | undefined
): Promise<{
  hasAccess: boolean
  userTier: string | undefined
  isActivePatron: boolean
}> {
  const pledgeAmount = session?.user?.pledgeAmountCents
  const patronStatus = session?.user?.patronStatus

  const userTier = getUserTier(pledgeAmount)
  const isActivePatron = patronStatus === 'active_patron'
  const hasAccess = hasContentAccess(pledgeAmount, requiredTier)

  return {
    hasAccess,
    userTier,
    isActivePatron,
  }
}
