# Content Repository Architecture

This document describes the remote content fetching system that stores all blog content in a separate GitHub repository, keeping source code and content completely separate.

## Overview

**All blog content is stored in a separate GitHub repository** and fetched at build time via the GitHub API. This repository contains only source code.

### Why Separate Content from Code?

1. **Clean Separation of Concerns**: Source code and content have different lifecycles
2. **Independent Updates**: Update blog posts without triggering code deployments
3. **Content Management**: Non-technical editors can manage content without touching code
4. **Security**: Content repository can have different access controls
5. **Version Control**: Separate git history for content vs code changes

## Architecture

### Components

- **`lib/remote-content.ts`**: GitHub API utilities for fetching content
- **`app/blog/utils.ts`**: Post fetching with remote-first approach
- **Build-time Fetch**: Content fetched during `pnpm build`
- **ISR Revalidation**: Posts refresh every 1 hour (configurable)
- **Graceful Degradation**: Falls back to local posts if remote fetch fails

### Data Flow

```
Build Time:
1. getAllPosts() called
2. getRemotePosts() fetches from GitHub API
3. Posts parsed and sorted by publishedAt
4. Static pages generated

Runtime (ISR):
1. After 1 hour, next request triggers revalidation
2. Background fetch from GitHub API
3. Static page regenerated
4. User gets updated content
```

## Setup Instructions

### 1. Create Content Repository

Create a new GitHub repository for your blog content:

```bash
# Example structure
theautist-content/
├── posts/
│   ├── my-first-post.mdx
│   ├── another-post.mdx
│   └── ...
└── README.md
```

**Repository Settings:**
- Can be public or private (private recommended for draft control)
- No code required, just MDX files
- Branch protection optional

### 2. Create GitHub Personal Access Token

Create a **fine-grained personal access token** with read-only access:

1. Go to https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Configure:
   - **Token name**: `theautist-content-access`
   - **Expiration**: 1 year (or custom)
   - **Repository access**: Only select repositories → choose your content repo
   - **Permissions**:
     - Repository permissions → Contents: **Read-only**
4. Generate and copy the token (starts with `ghp_`)

### 3. Configure Environment Variables

Add these variables to your `.env.local` file (development) and deployment platform (production):

```bash
# Content Repository (REQUIRED)
CONTENT_REPO_OWNER="your-github-username"        # Your GitHub username or org
CONTENT_REPO_NAME="theautist-content"            # Repository name
CONTENT_REPO_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxx"   # Fine-grained PAT from step 2
CONTENT_REPO_BRANCH="main"                       # Branch to fetch from (default: main)
CONTENT_POSTS_PATH="posts"                       # Path to posts directory (default: posts)
```

**Security Note**: Never commit `CONTENT_REPO_TOKEN` to git. It's already in `.gitignore` via `.env.local`.

**Legacy Variables**: For backward compatibility, `PREMIUM_*` variables are still supported but deprecated.

### 4. Create Blog Posts

Posts use MDX format with YAML frontmatter:

```mdx
---
title: "My First Post"
publishedAt: "2024-01-15"
summary: "Brief description of the post"
image: "/optional-image.jpg"
draft: false            # Optional: hide in production (default: false)
paid: false             # Optional: require Patreon auth (default: false)
tier: "premium"         # Optional: specific Patreon tier requirement
---

# My First Post

This is the content of my blog post.

You can use all MDX features:
- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks with syntax highlighting
- Images and more!
```

**Post Properties:**
- **title** (required): Post title displayed in list and detail pages
- **publishedAt** (required): ISO date string (YYYY-MM-DD)
- **summary** (required): Brief description for previews and SEO
- **image** (optional): Path to post image (relative to public/)
- **draft** (optional): Hide from production builds if true
- **paid** (optional): Require Patreon authentication
- **tier** (optional): Specific Patreon tier requirement (basic, premium, ultimate)

### 5. Test Locally

```bash
# Build with remote content
pnpm build

# You should see in the logs:
# "Fetching posts from owner/repo/posts"
# "Found X post(s)"

# Start production server
pnpm start

# Visit http://localhost:3000/blog
# Posts should appear in the list
```

## Usage

### Post Data Structure

All posts have this structure:

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
  slug: string          // Generated from filename
  content: string       // Full MDX content
  source: 'remote'      // Always 'remote' for content repo posts
}
```

### Accessing Posts

```typescript
import { getAllPosts } from '@/app/blog/utils'

// Get all posts from remote repository
const posts = await getAllPosts()

// Posts are pre-sorted by publishedAt (newest first)
```

### ISR Configuration

ISR revalidation is configured in `app/blog/[slug]/page.tsx`:

```typescript
// Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600
```

Adjust based on your content update frequency:
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

- **Build Time**: All posts fetched and cached in static pages
- **ISR**: Background revalidation every hour
- **Fallback**: If GitHub API fails, serves last successful build

## Error Handling

The system is designed to fail gracefully:

### Missing Configuration
```
⚠️  Remote content repository not configured
→ Falls back to local posts (deprecated)
```

### GitHub API Errors
```
❌ GitHub API error: Failed to fetch directory
→ Returns empty array or falls back to local posts
```

### Invalid Post Format
```
❌ Failed to process post my-post.mdx: Missing required frontmatter
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

- **No content**: ~5 seconds
- **With 5 posts**: ~7 seconds (+2 seconds)
- **With 20 posts**: ~10 seconds (+5 seconds)

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
2. Add all `CONTENT_*` variables
3. Use different token for production (best practice)
4. Deploy

### Other Platforms

Ensure environment variables are set before build:

```bash
export CONTENT_REPO_OWNER="username"
export CONTENT_REPO_NAME="repo"
export CONTENT_REPO_TOKEN="ghp_xxx"
export CONTENT_REPO_BRANCH="main"
export CONTENT_POSTS_PATH="posts"

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

- Content repo can be public or private
- Use branch protection for content repo
- Review all commits to content
- Use different tokens for dev/prod

### Error Messages

- API errors logged server-side only
- No token/repo details exposed to clients
- Generic error messages in production

## Troubleshooting

### Posts Not Appearing

1. Check environment variables are set:
   ```bash
   echo $CONTENT_REPO_TOKEN
   ```

2. Verify GitHub token permissions:
   - Go to https://github.com/settings/tokens
   - Check token has Contents: Read permission
   - Verify token hasn't expired

3. Check build logs:
   ```
   pnpm build
   # Look for "Fetching posts" messages
   ```

4. Test GitHub API manually:
   ```bash
   curl -H "Authorization: Bearer ghp_xxx" \
     https://api.github.com/repos/owner/repo/contents/posts
   ```

### Build Failures

If build fails due to remote content:

1. **Temporary fix**: Remove `CONTENT_REPO_TOKEN` to use local fallback
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

## Migration from Local Posts

If you have existing local posts in `app/blog/posts/`:

1. **Move posts to content repository**:
   ```bash
   # In your content repo
   mkdir posts
   cp /path/to/code-repo/app/blog/posts/*.mdx posts/
   git add posts/
   git commit -m "Import existing blog posts"
   git push
   ```

2. **Configure environment variables** (see Setup Instructions)

3. **Test build**:
   ```bash
   pnpm build
   # Verify posts are fetched from remote
   ```

4. **Remove local posts**:
   ```bash
   # In your code repo
   rm -rf app/blog/posts/
   git commit -am "Remove local posts (now in content repo)"
   ```

The system will automatically fall back to local posts if remote fetch fails, so you can test safely before removing local files.

## API Reference

### `getRemotePosts()`

Fetch all posts from GitHub content repository.

```typescript
async function getRemotePosts(): Promise<RemotePost[]>
```

**Returns**: Array of posts, or empty array if:
- Environment variables not configured
- GitHub API request fails
- No .mdx files found

**Errors**: All errors caught and logged, never throws

### `getAllPosts()`

Get all blog posts (remote-first, local fallback).

```typescript
async function getAllPosts(): Promise<Post[]>
```

**Returns**: Array of posts, sorted by `publishedAt` (newest first)

### `clearRemoteContentCache()`

Clear the in-memory cache.

```typescript
function clearRemoteContentCache(): void
```

**Usage**: Testing, manual cache invalidation

## Future Enhancements

- [ ] Webhook integration for instant updates
- [ ] Content CDN caching
- [ ] Multi-repository support (e.g., separate repos per category)
- [ ] Incremental post fetching
- [ ] ETag-based cache validation
- [ ] Admin dashboard for content management
- [ ] Content preview for drafts

## Questions?

- Review `lib/remote-content.ts` for implementation details
- See `app/blog/utils.ts` for post fetching logic
- Consult Next.js ISR docs: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
