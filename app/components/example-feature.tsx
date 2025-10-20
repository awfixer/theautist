'use client'

import { FeatureFlag } from './feature-flag'
import { useFeature, useFeatureVariant } from '@/lib/growthbook'

/**
 * Example component demonstrating GrowthBook feature flags
 * This file can be deleted - it's just for demonstration purposes
 */
export function ExampleFeatureFlag(): React.ReactElement {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 my-4">
      <h3 className="font-semibold mb-2">Feature Flag Example</h3>

      {/* Example 1: Simple boolean feature flag */}
      <FeatureFlag flag="example-feature">
        <p className="text-green-600">✓ This content is visible because 'example-feature' is enabled!</p>
      </FeatureFlag>

      <FeatureFlag
        flag="example-feature"
        fallback={<p className="text-gray-600">This feature is currently disabled.</p>}
      >
        <p className="text-blue-600">This shows when enabled, fallback shows when disabled.</p>
      </FeatureFlag>
    </div>
  )
}

/**
 * Example component using feature flag hooks
 */
export function ExampleFeatureHook(): React.ReactElement {
  const isEnabled = useFeature('example-feature')
  const variant = useFeatureVariant<'control' | 'variant-a' | 'variant-b'>(
    'example-variant',
    'control'
  )

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 my-4">
      <h3 className="font-semibold mb-2">Feature Flag Hook Example</h3>
      <p>Feature Status: {isEnabled ? '✓ Enabled' : '✗ Disabled'}</p>
      <p>Current Variant: {variant}</p>

      {variant === 'variant-a' && (
        <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
          <p>You're seeing Variant A!</p>
        </div>
      )}

      {variant === 'variant-b' && (
        <div className="mt-2 p-2 bg-green-100 dark:bg-green-900 rounded">
          <p>You're seeing Variant B!</p>
        </div>
      )}

      {variant === 'control' && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
          <p>You're seeing the Control variant (default)</p>
        </div>
      )}
    </div>
  )
}
