/**
 * Patreon Tier Configuration
 *
 * Configure your Patreon tiers here. Each tier has:
 * - id: Unique identifier (used in code and frontmatter)
 * - name: Display name shown to users
 * - amountCents: Monthly pledge amount in cents (for ordering/comparison)
 * - benefits: Array of benefits to display
 * - color: Tailwind color for badges and UI elements
 */

export interface PatreonTier {
  id: string
  name: string
  amountCents: number
  benefits: string[]
  color: string
}

/**
 * Define your Patreon tiers here
 * Order matters: Higher tiers should come first for proper access control
 */
export const PATREON_TIERS: PatreonTier[] = [
  {
    id: 'eclipse-enigma',
    name: 'Eclipse Enigma',
    amountCents: 5000, // $50/month
    benefits: [
      'Access to all premium content',
      'Access to ultimate-tier exclusive posts',
      'Early access to new features',
      'Direct support channel',
    ],
    color: 'purple',
  },
  {
    id: 'vortex-vanguard',
    name: 'Vortex Vanguard',
    amountCents: 2500, // $25/month
    benefits: [
      'Access to premium content',
      'Access to premium-tier exclusive posts',
      'Behind-the-scenes updates',
    ],
    color: 'blue',
  },
  {
    id: 'nebula-nomad',
    name: 'Nebula Nomad',
    amountCents: 1300, // $13/month
    benefits: [
      'Access to basic tier content',
      'Support the work',
      'Early access to some posts',
    ],
    color: 'green',
  },
]

/**
 * Tier hierarchy for access control
 * Higher index = higher tier = more access
 */
export const TIER_HIERARCHY = PATREON_TIERS.map((tier) => tier.id).reverse()

/**
 * Get tier by ID
 */
export function getTierById(tierId: string): PatreonTier | undefined {
  return PATREON_TIERS.find((tier) => tier.id === tierId)
}

/**
 * Check if a user's tier has access to content requiring a specific tier
 *
 * @param userTier - The tier the user currently has
 * @param requiredTier - The tier required for the content
 * @returns true if user has sufficient access
 *
 * @example
 * hasAccess('premium', 'basic') // true - premium has access to basic content
 * hasAccess('basic', 'premium') // false - basic doesn't have access to premium content
 */
export function hasAccess(
  userTier: string | null | undefined,
  requiredTier: string | null | undefined
): boolean {
  // No tier required = free content
  if (!requiredTier) return true

  // Content requires a tier but user has none
  if (!userTier) return false

  const userTierIndex = TIER_HIERARCHY.indexOf(userTier)
  const requiredTierIndex = TIER_HIERARCHY.indexOf(requiredTier)

  // Invalid tier IDs
  if (userTierIndex === -1 || requiredTierIndex === -1) return false

  // Higher index = higher tier = more access
  return userTierIndex >= requiredTierIndex
}

/**
 * Get the minimum tier required for access
 * Returns the tier object or undefined if content is free
 */
export function getMinimumTier(requiredTier: string | null | undefined): PatreonTier | undefined {
  if (!requiredTier) return undefined
  return getTierById(requiredTier)
}

/**
 * Get tier display color classes
 */
export function getTierColorClasses(tierId: string): {
  badge: string
  text: string
  bg: string
  border: string
} {
  const tier = getTierById(tierId)
  const color = tier?.color || 'gray'

  return {
    badge: `bg-${color}-100 dark:bg-${color}-900 text-${color}-800 dark:text-${color}-100`,
    text: `text-${color}-600 dark:text-${color}-400`,
    bg: `bg-${color}-50 dark:bg-${color}-950`,
    border: `border-${color}-200 dark:border-${color}-800`,
  }
}

/**
 * Format tier amount for display
 */
export function formatTierAmount(amountCents: number): string {
  const dollars = amountCents / 100
  return `$${dollars.toFixed(dollars % 1 === 0 ? 0 : 2)}/month`
}
