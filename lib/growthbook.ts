'use client'

import { useFeatureIsOn, useFeatureValue } from '@growthbook/growthbook-react'

/**
 * Hook to check if a feature flag is enabled
 *
 * @example
 * const showNewFeature = useFeature('new-feature')
 * if (showNewFeature) {
 *   return <NewFeature />
 * }
 */
export function useFeature(flag: string): boolean {
  return useFeatureIsOn(flag)
}

/**
 * Hook to get a feature flag value with type safety
 *
 * @example
 * const buttonColor = useFeatureVariant('button-color', 'blue')
 * return <button className={buttonColor === 'blue' ? 'bg-blue-500' : 'bg-red-500'} />
 */
export function useFeatureVariant<T extends string | number | boolean>(
  flag: string,
  defaultValue: T
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useFeatureValue(flag, defaultValue as any) as T
}

/**
 * Type-safe feature flag definitions
 * Add your feature flags here for autocomplete and type safety
 */
export type FeatureFlags = {
  // Example feature flags:
  'new-project-design': boolean
  'paid-content-preview': boolean
  'dark-mode-toggle': boolean
  'experimental-search': boolean
}

/**
 * Type-safe hook for feature flags
 *
 * @example
 * const isEnabled = useTypedFeature('new-project-design')
 */
export function useTypedFeature(flag: keyof FeatureFlags): boolean {
  return useFeatureIsOn(flag)
}
