'use client'

import { useFeatureIsOn, useFeatureValue } from '@growthbook/growthbook-react'

/**
 * Component that conditionally renders children based on a feature flag
 *
 * @example
 * <FeatureFlag flag="new-design">
 *   <NewDesignComponent />
 * </FeatureFlag>
 */
export function FeatureFlag({
  flag,
  children,
  fallback = null,
}: {
  flag: string
  children: React.ReactNode
  fallback?: React.ReactNode
}): React.ReactElement | null {
  const isOn = useFeatureIsOn(flag)

  return <>{isOn ? children : fallback}</>
}

/**
 * Component that renders different content based on feature value
 *
 * @example
 * <FeatureVariant flag="button-color" value="blue">
 *   <BlueButton />
 * </FeatureVariant>
 */
export function FeatureVariant({
  flag,
  value,
  children,
  fallback = null,
}: {
  flag: string
  value: unknown
  children: React.ReactNode
  fallback?: React.ReactNode
}): React.ReactElement | null {
  const currentValue = useFeatureValue(flag, null)

  return <>{currentValue === value ? children : fallback}</>
}
