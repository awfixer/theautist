# Blog Post Features: Drafts & Paid Content

This document explains how to use the draft and paid post features in your blog.

## Draft Posts

Draft posts are only visible in development mode (`pnpm dev`) and are automatically hidden in production builds.

### Usage

Add `draft: true` to your post's frontmatter:

```mdx
---
title: "My Work in Progress Post"
publishedAt: "2025-10-17"
summary: "This is still being written"
draft: true
---

Your content here...
```

### Behavior

- **Development**: Draft posts appear in the blog listing with a blue "Draft" badge
- **Production**: Draft posts are completely excluded from:
  - Blog listing page
  - Individual post routes (404 error)
  - Sitemap.xml
  - RSS feed
  - Static site generation

### Use Cases

- Write and preview posts before publishing
- Keep unfinished content in the repository
- Share development previews with team members
- Test post formatting and layout

## Paid Posts (Patreon-Only Content)

Paid posts require Patreon authentication to view the full content. Unauthenticated visitors see a preview with a paywall.

### Usage

Add `paid: true` to your post's frontmatter:

```mdx
---
title: "Exclusive Content for Supporters"
publishedAt: "2025-10-17"
summary: "Premium content for Patreon members"
paid: true
---

Your premium content here...
```

### Behavior

**For Unauthenticated Visitors:**
- Post appears in blog listing with yellow "Patreon" badge
- Preview of content is visible (first ~200px with fade effect)
- Paywall notice with "Sign in with Patreon" button
- Full content is hidden

**For Authenticated Patreon Members:**
- Full content access
- "Patreon" badge still visible to indicate exclusivity
- Normal reading experience

### Authentication Flow

1. User clicks "Sign in with Patreon" button
2. NextAuth redirects to Patreon OAuth
3. User authorizes the application
4. User is redirected back with authenticated session
5. Full content becomes accessible

### Combining Features

You can use both flags together:

```mdx
---
title: "Premium Draft"
publishedAt: "2025-10-17"
summary: "Premium content still being written"
draft: true
paid: true
---

Content here...
```

This creates a paid post that's only visible in development.

## Technical Implementation

### File Structure

```
app/
├── blog/
│   ├── utils.ts              # getBlogPosts() filters drafts
│   ├── [slug]/page.tsx       # Authentication check & paywall
│   └── posts/
│       └── your-post.mdx     # Frontmatter with draft/paid flags
├── components/
│   ├── blog-search.tsx       # Badge display in listing
│   └── paid-post-gate.tsx    # Paywall component
├── sitemap.ts                # Excludes drafts
└── rss/route.ts              # Excludes drafts
```

### Metadata Type

```typescript
type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  draft?: boolean    // Optional: defaults to false
  paid?: boolean     // Optional: defaults to false
}
```

### Environment Variables

Patreon authentication requires these environment variables:

```env
AUTH_SECRET=your_auth_secret
PATREON_CLIENT_ID=your_patreon_client_id
PATREON_CLIENT_SECRET=your_patreon_client_secret
NEXTAUTH_URL=http://localhost:3000
```

See `AUTH_SETUP.md` for complete authentication setup instructions.

## Visual Indicators

### Draft Badge
- Blue background (`bg-blue-500/10`)
- Blue text and border (`text-blue-500`, `border-blue-500/20`)
- Text: "Draft"

### Patreon Badge
- Yellow background (`bg-yellow-500/10`)
- Yellow text and border (`text-yellow-500`, `border-yellow-500/20`)
- Lock icon
- Text: "Patreon"

### Paywall UI
- Gradient fade effect on content preview
- Bordered notice box with dark background
- Yellow lock icon
- "Sign in with Patreon" button with Patreon branding
- Patreon red color (`#FF424D`)

## Testing

### Test Draft Posts

```bash
# Development - drafts visible
pnpm dev

# Production - drafts hidden
pnpm build
pnpm start
```

### Test Paid Posts

1. Create a test post with `paid: true`
2. Visit post without authentication → see paywall
3. Sign in with Patreon account
4. Visit post again → see full content

## Best Practices

### Draft Posts
- Use drafts for work-in-progress content
- Set realistic `publishedAt` dates for planning
- Remove `draft: true` when ready to publish
- Review in development before publishing

### Paid Posts
- Write compelling summaries to encourage sign-ups
- Ensure preview content is engaging but not complete
- Consider mixed content strategy (free + paid)
- Test paywall experience regularly
- Verify authentication flow works correctly

### Content Strategy

**Free Content:**
```mdx
---
title: "Introduction to My Work"
publishedAt: "2025-10-17"
summary: "Get started with my content"
---
```

**Paid Content:**
```mdx
---
title: "Advanced Techniques"
publishedAt: "2025-10-17"
summary: "Deep dive for supporters"
paid: true
---
```

**Draft Content:**
```mdx
---
title: "Upcoming Post"
publishedAt: "2025-10-18"
summary: "Coming soon"
draft: true
---
```

## Troubleshooting

### Draft Posts Still Visible in Production

- Check `NODE_ENV` is set to `production`
- Rebuild the site: `pnpm build`
- Clear Next.js cache: `rm -rf .next`

### Paid Posts Not Working

- Verify environment variables are set
- Check Patreon OAuth configuration
- Test authentication flow separately
- Review browser console for errors
- Ensure `isAuthenticated()` function works

### Badges Not Appearing

- Verify frontmatter syntax (use `true`, not `"true"`)
- Check boolean parsing in `app/blog/utils.ts`
- Rebuild to regenerate static pages
- Clear browser cache

## Future Enhancements

Possible improvements to consider:

- Tier-based content (different Patreon tiers)
- Scheduled publishing (auto-remove draft flag)
- Content preview customization (control preview length)
- Analytics for paid content performance
- Email notifications for new paid posts
