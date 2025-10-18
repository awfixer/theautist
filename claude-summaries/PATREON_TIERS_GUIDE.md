# Patreon Tiered Content Access Guide

Complete guide for implementing tiered content access based on Patreon membership levels.

## Overview

This system allows you to create content that's accessible only to specific Patreon tier supporters. It automatically fetches membership data from Patreon and controls access based on pledge amounts.

## Configuration

### 1. Define Your Tiers

Edit `config/patreon-tiers.ts` to configure your Patreon tiers:

```typescript
export const PATREON_TIERS: PatreonTier[] = [
  {
    id: 'ultimate',
    name: 'Ultimate Supporter',
    amountCents: 2000, // $20/month
    benefits: [
      'Access to all premium content',
      'Access to ultimate-tier exclusive posts',
      'Early access to new features',
      'Direct support channel',
    ],
    color: 'purple',
  },
  {
    id: 'premium',
    name: 'Premium Supporter',
    amountCents: 1000, // $10/month
    benefits: [
      'Access to premium content',
      'Access to premium-tier exclusive posts',
      'Behind-the-scenes updates',
    ],
    color: 'blue',
  },
  {
    id: 'basic',
    name: 'Basic Supporter',
    amountCents: 500, // $5/month
    benefits: [
      'Access to basic tier content',
      'Support the work',
      'Early access to some posts',
    ],
    color: 'green',
  },
]
```

**Important:**
- List tiers from **highest to lowest** (ultimate → premium → basic)
- `amountCents` must match your actual Patreon tier pledge amounts
- `id` is used in blog post frontmatter to require specific tiers
- `color` should be a Tailwind color name for badges

### 2. How Access Works

**Tier Hierarchy:**
- Users with higher tiers automatically get access to lower tier content
- Example: Ultimate tier gets access to Ultimate, Premium, AND Basic content
- Basic tier only gets access to Basic content

**Access Logic:**
```
User Pledge: $20/month → Ultimate Tier
  ✓ Can access: Ultimate, Premium, Basic content

User Pledge: $10/month → Premium Tier
  ✓ Can access: Premium, Basic content
  ✗ Cannot access: Ultimate content

User Pledge: $5/month → Basic Tier
  ✓ Can access: Basic content
  ✗ Cannot access: Premium, Ultimate content
```

## Creating Tiered Content

### Blog Post Frontmatter

Add the `tier` field to your MDX frontmatter:

**Free Content (no login required):**
```mdx
---
title: "Public Post"
publishedAt: "2025-01-15"
summary: "Available to everyone"
---
```

**Basic Tier Content:**
```mdx
---
title: "Basic Member Post"
publishedAt: "2025-01-15"
summary: "For Basic tier and above"
tier: basic
---
```

**Premium Tier Content:**
```mdx
---
title: "Premium Member Post"
publishedAt: "2025-01-15"
summary: "For Premium tier and above"
tier: premium
---
```

**Ultimate Tier Content:**
```mdx
---
title: "Ultimate Member Post"
publishedAt: "2025-01-15"
summary: "For Ultimate tier only"
tier: ultimate
---
```

**Backward Compatibility:**
You can still use `paid: true` for general Patreon-only content:
```mdx
---
title: "Patreon Only"
publishedAt: "2025-01-15"
summary: "For any Patreon supporter"
paid: true
---
```

## User Experience

### For Non-Authenticated Users

When visiting a tiered post without logging in, users see:
1. Preview of the content (first ~200px)
2. Gradient fade overlay
3. Paywall notice showing:
   - Tier name and monthly price
   - List of tier benefits
   - "Sign in with Patreon" button

### For Authenticated Users with Insufficient Tier

When a Basic tier member tries to access Premium content:
1. Preview of the content
2. "Upgrade Required" notice showing:
   - Current tier ("You're currently a Basic Supporter")
   - Required tier ("This post requires Premium tier or higher")
   - Tier details with benefits
   - "Upgrade on Patreon" button (links to Patreon settings)

### For Authenticated Users with Sufficient Access

When a user has the required tier or higher:
- Full content is visible
- Tier badge shown in post header
- No paywall displayed

## Technical Implementation

### Server-Side Access Check

```typescript
import { getSession } from '@/lib/auth'
import { checkTierAccess } from '@/lib/tier-access'

// In your page component
const session = await getSession()
const { hasAccess, userTier } = await checkTierAccess(session, 'premium')

if (hasAccess) {
  // Show full content
} else {
  // Show paywall
}
```

### Client-Side Tier Detection

```typescript
'use client'
import { useSession } from 'next-auth/react'
import { getUserTier } from '@/lib/tier-access'

function MyComponent() {
  const { data: session } = useSession()
  const userTier = getUserTier(session?.user?.pledgeAmountCents)

  return <div>Your tier: {userTier || 'None'}</div>
}
```

### Utility Functions

**Check if user has access:**
```typescript
import { hasContentAccess } from '@/lib/tier-access'

const canAccess = hasContentAccess(
  userPledgeAmountCents, // from session
  'premium' // required tier
)
```

**Get user's tier:**
```typescript
import { getUserTier } from '@/lib/tier-access'

const tier = getUserTier(1500) // Returns 'premium' (>= $15/month)
```

**Get tier information:**
```typescript
import { getTierById } from '@/config/patreon-tiers'

const tierInfo = getTierById('premium')
// { id: 'premium', name: 'Premium Supporter', amountCents: 1000, ... }
```

## GrowthBook Integration

Tier data is automatically added to GrowthBook user attributes for A/B testing and feature flagging:

**Available Attributes:**
```typescript
{
  patreonTier: 'premium',        // User's tier ID
  pledgeAmountCents: 1000,        // Exact pledge amount
  isActivePatron: true,           // Active Patreon status
  isBasicTier: false,             // Boolean for each tier
  isPremiumTier: true,
  isUltimateTier: false,
}
```

**Usage in GrowthBook Dashboard:**
Target features to specific tiers:
- Condition: `patreonTier` equals `"ultimate"`
- Condition: `isPremiumTier` equals `true`
- Condition: `pledgeAmountCents` >= `1000`

## Examples

### Example 1: Basic Tier Post

Create `app/blog/posts/basic-tutorial.mdx`:
```mdx
---
title: "Getting Started Tutorial"
publishedAt: "2025-01-15"
summary: "Basic tier tutorial"
tier: basic
---

# Getting Started

This content is available to Basic tier supporters and above.

All supporters at any tier level can read this content!
```

Result:
- $5+ patrons: ✓ Full access
- $10+ patrons: ✓ Full access
- $20+ patrons: ✓ Full access
- Non-patrons: ✗ Paywall

### Example 2: Premium Tier Post

Create `app/blog/posts/advanced-techniques.mdx`:
```mdx
---
title: "Advanced Techniques"
publishedAt: "2025-01-15"
summary: "Premium tier content"
tier: premium
---

# Advanced Techniques

This content is available to Premium and Ultimate tier supporters.

Basic tier supporters will see an upgrade prompt.
```

Result:
- $5 patrons: ✗ Upgrade prompt
- $10+ patrons: ✓ Full access
- $20+ patrons: ✓ Full access
- Non-patrons: ✗ Paywall

### Example 3: Ultimate Tier Post

Create `app/blog/posts/insider-insights.mdx`:
```mdx
---
title: "Insider Insights"
publishedAt: "2025-01-15"
summary: "Ultimate tier exclusive"
tier: ultimate
---

# Insider Insights

This content is exclusively for Ultimate tier supporters.

Only the highest tier gets access to this content.
```

Result:
- $5 patrons: ✗ Upgrade prompt
- $10 patrons: ✗ Upgrade prompt
- $20+ patrons: ✓ Full access
- Non-patrons: ✗ Paywall

## Testing

### Local Testing Without Patreon Account

Since tier data comes from Patreon API, you'll need to test with actual Patreon authentication in development. However, you can:

1. **Mock Session Data** (for development):
Edit your auth callback to add test pledge amounts:
```typescript
// In auth.ts (for testing only)
if (process.env.NODE_ENV === 'development') {
  token.pledgeAmountCents = 1500 // Test as Premium tier
  token.patronStatus = 'active_patron'
}
```

2. **Test Different Tiers:**
- Set `pledgeAmountCents: 500` → Basic tier
- Set `pledgeAmountCents: 1000` → Premium tier
- Set `pledgeAmountCents: 2000` → Ultimate tier

3. **Verify Access Control:**
- Create test posts with different `tier` values
- Sign in and check which posts you can access
- Verify upgrade prompts show correctly

### Production Testing Checklist

- [ ] Configure actual Patreon tier amounts in `config/patreon-tiers.ts`
- [ ] Create test posts for each tier level
- [ ] Test with real Patreon accounts at each tier
- [ ] Verify upgrade prompts show correct tier information
- [ ] Check that higher tiers can access lower tier content
- [ ] Test non-authenticated user experience
- [ ] Verify GrowthBook attributes are set correctly

## Troubleshooting

### User Has Wrong Tier

**Problem:** User pledges $15/month but sees $5 tier

**Solutions:**
1. Check `amountCents` in `config/patreon-tiers.ts` matches exactly
2. Verify Patreon API is returning correct pledge amount
3. Check browser console for `pledgeAmountCents` value
4. Have user sign out and sign in again to refresh session

### Tier Not Showing in GrowthBook

**Problem:** GrowthBook doesn't show tier attributes

**Solutions:**
1. Check that GrowthBook provider is wrapped around app
2. Verify `getUserTier()` is being called in provider
3. Check browser console: `window.growthbook?.getAttributes()`
4. Ensure user is authenticated and has a pledge amount

### Content Still Locked for Patron

**Problem:** Patron can't access content they should have access to

**Solutions:**
1. Verify patron status is `active_patron` (not `former_patron`)
2. Check that pledge amount >= required tier amount
3. Ensure post frontmatter has correct `tier` value
4. Check server logs for access check results

### Upgrade Prompt Not Showing

**Problem:** User with insufficient tier doesn't see upgrade prompt

**Solutions:**
1. Verify `userTier` is being passed to `PaidPostGate`
2. Check that `requiredTier` is set in post frontmatter
3. Ensure `hasInsufficientTier` logic in `PaidPostGate` is correct

## Advanced: Custom Tier Logic

### Non-Monetary Tiers

If you have special access tiers not based on pledge amount:

```typescript
// Add to lib/tier-access.ts
export function getUserTier(
  pledgeAmountCents: number | null | undefined,
  specialAccess?: string[]
): string | undefined {
  // Check special access first
  if (specialAccess?.includes('lifetime')) return 'ultimate'
  if (specialAccess?.includes('beta-tester')) return 'premium'

  // Fall back to pledge-based tiers
  // ... existing logic
}
```

### Time-Limited Access

Grant temporary tier upgrades:

```typescript
// Add expiration to session
token.tierUpgradeUntil = '2025-12-31'

// Check in access control
if (tierUpgradeUntil && new Date() < new Date(tierUpgradeUntil)) {
  // Grant higher tier temporarily
}
```

### Combining Tiers

Require multiple conditions:

```mdx
---
tier: premium
requiresEmailVerified: true
requiresAge: 18
---
```

Then update access check to validate all conditions.

## Security Considerations

- ✅ All access checks done server-side
- ✅ Pledge amounts verified via Patreon API
- ✅ Session data secured with JWT
- ✅ Tier logic cannot be bypassed client-side
- ⚠️ Preview content (first ~200px) is visible to all
- ⚠️ Post titles and summaries visible in listings

## Migration from `paid: true`

If you have existing posts with `paid: true`:

**Option 1:** Keep as-is (any Patreon supporter gets access)

**Option 2:** Convert to tiered:
```mdx
# Before
paid: true

# After (Basic tier)
tier: basic
```

Both `paid: true` and `tier: basic` can coexist in different posts.

## Resources

- Tier Configuration: `config/patreon-tiers.ts`
- Access Control: `lib/tier-access.ts`
- Paywall Component: `app/components/paid-post-gate.tsx`
- Blog Post Page: `app/blog/[slug]/page.tsx`
- GrowthBook Integration: `app/components/growthbook-provider.tsx`
