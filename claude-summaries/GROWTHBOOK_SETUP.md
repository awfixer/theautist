# GrowthBook Setup Guide

This guide covers setting up GrowthBook for A/B testing and feature flagging in your Next.js application.

## What is GrowthBook?

GrowthBook is an open-source feature flagging and A/B testing platform that allows you to:
- Toggle features on/off without deploying code
- Run A/B tests and experiments
- Target specific user segments
- Gradually roll out new features

## Prerequisites

1. A GrowthBook account (free tier available at [growthbook.io](https://www.growthbook.io))
2. Environment variables configured (see below)

## Setup Steps

### 1. Create a GrowthBook Account

1. Sign up at [https://app.growthbook.io](https://app.growthbook.io)
2. Create a new organization and project
3. Navigate to **SDK Configuration** in the sidebar

### 2. Get Your Client Key

1. In the GrowthBook dashboard, go to **Features → SDK Connections**
2. Create a new SDK Connection or use the default one
3. Copy your **Client Key** (looks like `sdk-abc123xyz`)
4. Optionally, note your **API Host** if using self-hosted GrowthBook

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# GrowthBook Configuration
NEXT_PUBLIC_GROWTHBOOK_API_HOST="https://cdn.growthbook.io" # Optional
NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY="sdk-your-key-here"       # Required
```

**Important:** The `NEXT_PUBLIC_` prefix makes these variables available in the browser, which is necessary for client-side feature flagging.

### 4. Create Your First Feature Flag

1. In GrowthBook dashboard, go to **Features**
2. Click **Add Feature**
3. Create a feature flag (e.g., `new-blog-design`)
4. Set the default value (typically `true` or `false`)
5. Publish the feature

## Usage Examples

### Basic Feature Flag (Boolean)

**Component Usage:**
```tsx
'use client'
import { FeatureFlag } from '@/app/components/feature-flag'

export function MyComponent() {
  return (
    <FeatureFlag flag="new-blog-design">
      <NewBlogDesign />
    </FeatureFlag>
  )
}
```

**Hook Usage:**
```tsx
'use client'
import { useFeature } from '@/lib/growthbook'

export function MyComponent() {
  const showNewDesign = useFeature('new-blog-design')

  return showNewDesign ? <NewBlogDesign /> : <OldBlogDesign />
}
```

### Feature Variants (A/B Testing)

**Create a Multi-Variant Feature:**
1. In GrowthBook, create a feature with type **String** or **JSON**
2. Set variants like `{ "control": "red", "variant-a": "blue", "variant-b": "green" }`

**Component Usage:**
```tsx
'use client'
import { FeatureVariant } from '@/app/components/feature-flag'

export function MyButton() {
  return (
    <>
      <FeatureVariant flag="button-color" value="red">
        <button className="bg-red-500">Red Button</button>
      </FeatureVariant>

      <FeatureVariant flag="button-color" value="blue">
        <button className="bg-blue-500">Blue Button</button>
      </FeatureVariant>
    </>
  )
}
```

**Hook Usage:**
```tsx
'use client'
import { useFeatureVariant } from '@/lib/growthbook'

export function MyButton() {
  const buttonColor = useFeatureVariant('button-color', 'red')

  return (
    <button className={`bg-${buttonColor}-500`}>
      Dynamic Color Button
    </button>
  )
}
```

### Type-Safe Feature Flags

Update `lib/growthbook.ts` to add your feature flags:

```typescript
export type FeatureFlags = {
  'new-blog-design': boolean
  'paid-content-preview': boolean
  'button-color': 'red' | 'blue' | 'green'
  'experimental-search': boolean
}
```

Then use the type-safe hook:

```tsx
'use client'
import { useTypedFeature } from '@/lib/growthbook'

export function MyComponent() {
  // TypeScript will autocomplete feature flag names
  const enabled = useTypedFeature('new-blog-design')

  return enabled ? <NewFeature /> : <OldFeature />
}
```

## User Targeting

The GrowthBook provider automatically sets user attributes based on authentication:

```typescript
{
  id: session?.user?.id || 'anonymous',
  loggedIn: !!session,
  patreonId: session?.user?.patreonId,
  email: session?.user?.email,
}
```

You can target features to specific users in the GrowthBook dashboard:

1. Go to your feature flag
2. Click **Add Targeting Rule**
3. Set conditions like:
   - `loggedIn` equals `true`
   - `patreonId` exists
   - `id` is in list `[user-id-1, user-id-2]`

## A/B Testing Best Practices

### 1. Define Clear Hypotheses
- **Bad:** "Let's try a blue button"
- **Good:** "We believe a blue CTA button will increase conversions by 10% because it provides better contrast"

### 2. Set Success Metrics
In GrowthBook dashboard:
1. Go to **Metrics**
2. Create metrics like "Blog Post Views", "Patreon Conversions"
3. Attach metrics to your experiments

### 3. Sample Size Calculation
- Use GrowthBook's built-in sample size calculator
- Typically need 100+ conversions per variant for statistical significance
- Don't end tests too early

### 4. Gradual Rollouts
```typescript
// In GrowthBook dashboard, set rollout percentage:
// 0% = off for everyone
// 10% = on for 10% of users
// 100% = on for everyone
```

## Common Use Cases

### 1. New Blog Design Rollout
```tsx
'use client'
import { FeatureFlag } from '@/app/components/feature-flag'

export function BlogLayout({ children }) {
  return (
    <FeatureFlag flag="new-blog-design" fallback={<OldLayout>{children}</OldLayout>}>
      <NewLayout>{children}</NewLayout>
    </FeatureFlag>
  )
}
```

### 2. Paid Content Paywall Testing
```tsx
'use client'
import { useFeatureVariant } from '@/lib/growthbook'

export function PaywallMessage() {
  const variant = useFeatureVariant('paywall-message', 'control')

  const messages = {
    control: 'Sign in with Patreon to read this post',
    variant_a: 'Unlock this post by supporting on Patreon',
    variant_b: 'Become a patron to access premium content',
  }

  return <p>{messages[variant]}</p>
}
```

### 3. Dark Mode Toggle Feature
```tsx
'use client'
import { useFeature } from '@/lib/growthbook'

export function ThemeToggle() {
  const showDarkMode = useFeature('dark-mode-toggle')

  if (!showDarkMode) return null

  return <button>Toggle Dark Mode</button>
}
```

## Analytics Integration

The provider includes a tracking callback that logs experiment views. You can integrate with analytics:

```typescript
// In growthbook-provider.tsx
trackingCallback: (experiment, result) => {
  // Example: Google Analytics
  window.gtag?.('event', 'experiment_viewed', {
    experiment_id: experiment.key,
    variation_id: result.key,
  })

  // Example: Vercel Analytics
  track('Experiment Viewed', {
    experimentId: experiment.key,
    variationId: result.key,
  })
}
```

## Testing Locally

### 1. Force Feature Flags
Add URL parameters to force feature flags:
```
http://localhost:3000?gb~new-blog-design=true
http://localhost:3000?gb~button-color=blue
```

### 2. Dev Mode
The provider enables dev mode in development (`enableDevMode: true`), which:
- Shows helpful console logs
- Allows URL override parameters
- Displays feature flag state in browser console

### 3. Check Feature State
In browser console:
```javascript
// Access GrowthBook instance
window.growthbook.getFeatureValue('new-blog-design')
window.growthbook.getAllFeatures()
```

## Deployment Checklist

- [ ] Environment variables set in production (Vercel, etc.)
- [ ] Feature flags created in GrowthBook dashboard
- [ ] Analytics integration configured
- [ ] User attributes properly tracked
- [ ] Experiments have defined success metrics
- [ ] Gradual rollout percentage set appropriately

## Troubleshooting

### Features Not Loading
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY` is set
3. Check GrowthBook dashboard for published features
4. Ensure features are published (not in draft state)

### Wrong Variant Showing
1. Check user attributes in browser console
2. Verify targeting rules in GrowthBook dashboard
3. Clear localStorage and cookies
4. Check if user is in correct percentage rollout

### TypeScript Errors
1. Ensure `'use client'` directive at top of components using hooks
2. Update `FeatureFlags` type in `lib/growthbook.ts`
3. Restart TypeScript server

## Resources

- [GrowthBook Documentation](https://docs.growthbook.io)
- [GrowthBook Next.js Guide](https://docs.growthbook.io/lib/nextjs)
- [GrowthBook React SDK](https://docs.growthbook.io/lib/react)
- [Feature Flag Best Practices](https://docs.growthbook.io/features/best-practices)
- [A/B Testing Guide](https://docs.growthbook.io/guide/experiments)
