# GrowthBook Quick Start

Quick reference guide for using GrowthBook in this project.

## Setup (One-Time)

1. **Get GrowthBook Client Key:**
   - Sign up at [https://app.growthbook.io](https://app.growthbook.io)
   - Go to **Features → SDK Connections**
   - Copy your **Client Key** (starts with `sdk-`)

2. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY="sdk-your-key-here"
   ```

3. **Create your first feature flag:**
   - In GrowthBook dashboard: **Features → Add Feature**
   - Name: `example-feature`
   - Type: Boolean
   - Default: `true`
   - Click **Save & Publish**

## Usage Examples

### 1. Simple Feature Toggle

**Component approach:**
```tsx
'use client'
import { FeatureFlag } from '@/app/components/feature-flag'

export function MyComponent() {
  return (
    <FeatureFlag flag="new-design">
      <NewDesignComponent />
    </FeatureFlag>
  )
}
```

**Hook approach:**
```tsx
'use client'
import { useFeature } from '@/lib/growthbook'

export function MyComponent() {
  const enabled = useFeature('new-design')

  return enabled ? <NewDesign /> : <OldDesign />
}
```

### 2. A/B Testing with Variants

**Create multi-variant feature in GrowthBook:**
- Type: **String**
- Default: `"control"`
- Add variants: `control`, `variant-a`, `variant-b`

**Use in code:**
```tsx
'use client'
import { useFeatureVariant } from '@/lib/growthbook'

export function PricingPage() {
  const pricingVariant = useFeatureVariant('pricing-layout', 'control')

  if (pricingVariant === 'variant-a') {
    return <PricingLayoutA />
  }

  if (pricingVariant === 'variant-b') {
    return <PricingLayoutB />
  }

  return <PricingLayoutControl />
}
```

### 3. User Targeting

**Automatically tracked attributes:**
- `id`: User ID or "anonymous"
- `loggedIn`: Boolean (authenticated or not)
- `patreonId`: Patreon user ID (if authenticated)
- `email`: User email (if authenticated)

**Target authenticated users only:**
1. In GrowthBook, open your feature flag
2. Add **Targeting Rule**
3. Condition: `loggedIn` equals `true`
4. Set value: `true` (or your variant)

**Target specific users:**
1. Add targeting rule
2. Condition: `id` is in list `["user-id-1", "user-id-2"]`

## Testing Locally

### Force feature flags via URL
```
http://localhost:3000?gb~new-design=true
http://localhost:3000?gb~pricing-layout=variant-a
```

### Check feature state in browser console
```javascript
// See all features
console.log(window.growthbook?.getAllFeatures())

// Check specific feature
console.log(window.growthbook?.getFeatureValue('new-design'))
```

## Type Safety

**Add your feature flags to the type system:**

Edit `lib/growthbook.ts`:
```typescript
export type FeatureFlags = {
  'new-design': boolean
  'pricing-layout': 'control' | 'variant-a' | 'variant-b'
  'paid-preview-length': number
}
```

**Use type-safe hook:**
```tsx
'use client'
import { useTypedFeature } from '@/lib/growthbook'

// TypeScript autocompletes feature flag names
const enabled = useTypedFeature('new-design')
```

## Common Patterns

### Gradual Rollout
1. Set feature flag to `false` by default
2. Add targeting rule with **Rollout Percentage**: 10%
3. Gradually increase: 10% → 25% → 50% → 100%

### Beta Features for Logged-In Users
```tsx
'use client'
import { FeatureFlag } from '@/app/components/feature-flag'

export function BetaFeature() {
  return (
    <FeatureFlag flag="beta-search">
      <EnhancedSearch />
    </FeatureFlag>
  )
}
```

In GrowthBook:
- Add targeting rule: `loggedIn` equals `true`
- Value: `true`

### Dark Mode Toggle (Coming Soon Feature)
```tsx
'use client'
import { useFeature } from '@/lib/growthbook'

export function Header() {
  const showDarkModeToggle = useFeature('dark-mode-toggle')

  return (
    <header>
      {/* existing nav */}
      {showDarkModeToggle && <DarkModeButton />}
    </header>
  )
}
```

## Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY` in Vercel/hosting platform
- [ ] Create production features in GrowthBook dashboard
- [ ] Test feature flags in staging environment
- [ ] Set appropriate rollout percentages (start small!)
- [ ] Configure analytics tracking if using A/B tests

## Troubleshooting

**Features not showing up?**
- Check environment variable is set
- Verify feature is **published** in GrowthBook (not draft)
- Check browser console for GrowthBook errors
- Clear browser cache/localStorage

**Wrong variant displaying?**
- Check targeting rules in GrowthBook dashboard
- Verify user attributes in browser console: `window.growthbook?.getAttributes()`
- Check rollout percentage settings

**TypeScript errors?**
- Make sure `'use client'` is at top of file
- Component must be a Client Component to use hooks
- Update `FeatureFlags` type in `lib/growthbook.ts`

## Next Steps

- Read full setup guide: `GROWTHBOOK_SETUP.md`
- GrowthBook docs: [https://docs.growthbook.io](https://docs.growthbook.io)
- Example components: `app/components/example-feature.tsx`
