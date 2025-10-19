# Remote Content System

This document describes the remote content fetching system that allows premium blog posts to be stored in a separate private GitHub repository and fetched at build time.

## Overview

The blog system supports two content sources:

1. **Local Posts**: MDX files in `app/blog/posts/` (committed to this repository)
2. **Remote Posts**: MDX files fetched from a separate private GitHub repository (premium content)

All posts are merged and displayed together, with remote posts fetched via the GitHub API at build time and refreshed hourly via Incremental Static Regeneration (ISR).

## Architecture

### Components

- **`lib/remote-content.ts`**: GitHub API utilities for fetching remote content
- **`app/blog/utils.ts`**: Unified post fetching (`getAllPosts()` merges local + remote)
- **Build-time Fetch**: Remote posts fetched during `pnpm build`
- **ISR Revalidation**: Posts refresh every 1 hour (configurable)
- **Graceful Degradation**: Site works even if remote fetch fails

### Data Flow

```
Build Time:
1. getAllPosts() called
2. getBlogPosts() reads local MDX files
3. getRemotePosts() fetches from GitHub API
4. Posts merged and sorted by publishedAt
5. Static pages generated

Runtime (ISR):
1. After 1 hour, next request triggers revalidation
2. Background fetch from GitHub API
3. Static page regenerated
4. User gets updated content
```

## Setup Instructions

### 1. Create Premium Content Repository

Create a new private GitHub repository for your premium content:

```bash
# Example structure
premium-repo/
├── posts/
│   ├── premium-post-1.mdx
│   ├── premium-post-2.mdx
│   └── ...
└── README.md
```

### 2. Create GitHub Personal Access Token

Create a **fine-grained personal access token** with read-only access:

1. Go to https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Configure:
   - **Token name**: `theautist-premium-content`
   - **Expiration**: 1 year (or custom)
   - **Repository access**: Only select repositories → choose your premium repo
   - **Permissions**:
     - Repository permissions → Contents: **Read-only**
4. Generate and copy the token (starts with `ghp_`)

### 3. Configure Environment Variables

Add these variables to your `.env.local` file (development) and deployment platform (production):

```bash
# Premium Content Repository
PREMIUM_REPO_OWNER="your-github-username"        # Your GitHub username or org
PREMIUM_REPO_NAME="your-premium-repo"            # Repository name
PREMIUM_REPO_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxx"   # Fine-grained PAT from step 2
PREMIUM_REPO_BRANCH="main"                       # Branch to fetch from (default: main)
PREMIUM_POSTS_PATH="posts"                       # Path to posts directory (default: posts)
```

**Security Note**: Never commit `PREMIUM_REPO_TOKEN` to git. It's already in `.gitignore` via `.env.local`.

### 4. Create Premium Posts

Premium posts use the same MDX format as local posts:

```mdx
---
title: "Premium Post Title"
publishedAt: "2024-01-15"
summary: "Brief description of the premium content"
image: "/optional-image.jpg"
paid: true              # Requires Patreon authentication
tier: "premium"         # Optional: specific tier requirement
draft: false
---

# Premium Content

This content is only available to Patreon supporters.

[Rest of MDX content...]
```

Commit and push to your premium repository.

### 5. Test Locally

```bash
# Build with remote content
pnpm build

# You should see in the logs:
# "Fetching remote posts from owner/repo/posts"
# "Found X remote post(s)"

# Start production server
pnpm start

# Visit http://localhost:3000/blog
# Premium posts should appear in the list
```

## Usage

### Post Properties

All posts (local and remote) have a `source` field:

```typescript
type Post = {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    image?: string
    draft?: boolean
    paid?: boolean
    tier?: string
  }
  slug: string
  content: string
  source: 'local' | 'remote'  // Indicates post origin
}
```

### Accessing Posts

```typescript
import { getAllPosts } from '@/app/blog/utils'

// Get all posts (local + remote)
const posts = await getAllPosts()

// Filter by source if needed
const localPosts = posts.filter(p => p.source === 'local')
const remotePosts = posts.filter(p => p.source === 'remote')
```

### ISR Configuration

ISR revalidation is configured in `app/blog/[slug]/page.tsx`:

```typescript
// Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600
```

Adjust this value based on your content update frequency:
- `60`: 1 minute (frequent updates)
- `3600`: 1 hour (default, balanced)
- `86400`: 24 hours (daily updates)
- `false`: Disable ISR (build-time only)

## Caching Strategy

### Development

- **Cache Duration**: 1 minute
- **Purpose**: Reduce API calls during hot reload
- **Cleared**: On server restart

### Production

- **Build Time**: All remote posts fetched and cached in static pages
- **ISR**: Background revalidation every hour
- **Fallback**: If GitHub API fails, serves last successful build

### Cache Behavior

```typescript
import { clearRemoteContentCache } from '@/lib/remote-content'

// Clear cache manually (useful for testing)
clearRemoteContentCache()
```

## Error Handling

The system is designed to fail gracefully:

### Missing Configuration
```
⚠️  Remote content not configured, skipping premium posts
→ Site works with local posts only
```

### GitHub API Errors
```
❌ GitHub API error: Failed to fetch directory
→ Returns empty array, local posts still work
```

### Invalid Post Format
```
❌ Failed to process remote post premium-post-1.mdx: Missing required frontmatter
→ Skips invalid post, continues with others
```

### Rate Limits
```
GitHub API rate limit: 4995/5000
⚠️  Approaching rate limit
→ Logs warning, continues normally
```

## Performance

### Build Time Impact

- **Local only**: ~5 seconds
- **With remote posts (5 posts)**: ~7 seconds (+2 seconds)
- **With remote posts (20 posts)**: ~10 seconds (+5 seconds)

### API Calls

- **Directory listing**: 1 call
- **File fetching**: N parallel calls (where N = number of posts)
- **Total**: 1 + N calls per build/revalidation

### GitHub API Limits

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Typical usage**: <10 requests per build

## Deployment

### Vercel

1. Go to Project Settings → Environment Variables
2. Add all `PREMIUM_*` variables
3. Use different token for production (best practice)
4. Deploy

### Other Platforms

Ensure environment variables are set before build:

```bash
export PREMIUM_REPO_OWNER="username"
export PREMIUM_REPO_NAME="repo"
export PREMIUM_REPO_TOKEN="ghp_xxx"
export PREMIUM_REPO_BRANCH="main"
export PREMIUM_POSTS_PATH="posts"

pnpm build
```

## Security Best Practices

### Token Management

- ✅ Use fine-grained tokens (not classic PATs)
- ✅ Grant read-only access
- ✅ Limit to single repository
- ✅ Set expiration date
- ✅ Rotate tokens annually
- ❌ Never commit tokens to git
- ❌ Don't share tokens across environments

### Content Security

- Premium repo should be **private**
- Only grant access to trusted collaborators
- Use branch protection on premium repo
- Review all commits to premium content

### Error Messages

- API errors logged server-side only
- No token/repo details exposed to clients
- Generic error messages in production

## Troubleshooting

### Posts Not Appearing

1. Check environment variables are set:
   ```bash
   echo $PREMIUM_REPO_TOKEN
   ```

2. Verify GitHub token permissions:
   - Go to https://github.com/settings/tokens
   - Check token has Contents: Read permission
   - Verify token hasn't expired

3. Check build logs:
   ```
   pnpm build
   # Look for "Fetching remote posts" messages
   ```

4. Test GitHub API manually:
   ```bash
   curl -H "Authorization: Bearer ghp_xxx" \
     https://api.github.com/repos/owner/repo/contents/posts
   ```

### Build Failures

If build fails due to remote content:

1. **Temporary fix**: Remove `PREMIUM_REPO_TOKEN` to skip remote posts
2. **Debug**: Check GitHub API rate limits
3. **Fix**: Resolve token/repo issues
4. **Rebuild**: Restore token and rebuild

### Cache Issues

If seeing stale content:

1. **Clear build cache**:
   ```bash
   rm -rf .next
   pnpm build
   ```

2. **Force revalidation** (Vercel):
   - Trigger new deployment
   - Or wait for ISR interval

3. **Clear runtime cache**:
   ```typescript
   import { clearRemoteContentCache } from '@/lib/remote-content'
   clearRemoteContentCache()
   ```

## Future Enhancements

### Planned Features

- [ ] Webhook integration for instant updates
- [ ] Content CDN caching
- [ ] Multi-repository support
- [ ] Incremental post fetching
- [ ] ETag-based cache validation
- [ ] Admin dashboard for content management

### Webhook Integration (Future)

GitHub webhooks could trigger immediate ISR revalidation:

```typescript
// app/api/revalidate/route.ts (future)
export async function POST(request: Request) {
  // Verify webhook signature
  // Trigger ISR revalidation
  // Return success
}
```

## API Reference

### `getRemotePosts()`

Fetch all remote posts from GitHub repository.

```typescript
async function getRemotePosts(): Promise<RemotePost[]>
```

**Returns**: Array of remote posts, or empty array if:
- Environment variables not configured
- GitHub API request fails
- No .mdx files found

**Errors**: All errors caught and logged, never throws

### `getAllPosts()`

Get all blog posts (local + remote).

```typescript
async function getAllPosts(): Promise<Post[]>
```

**Returns**: Combined array of local and remote posts, sorted by `publishedAt` (newest first)

### `clearRemoteContentCache()`

Clear the in-memory remote content cache.

```typescript
function clearRemoteContentCache(): void
```

**Usage**: Testing, manual cache invalidation

## Questions?

- Check existing posts in `app/blog/posts/` for MDX format examples
- Review `lib/remote-content.ts` for implementation details
- See `app/blog/utils.ts` for post merging logic
- Consult Next.js ISR docs: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
