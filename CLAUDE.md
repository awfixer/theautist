# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog site for theautist.me built with Next.js 15, React 19, and TypeScript in strict mode. The site features MDX-based blog posts with syntax highlighting, automatic sitemap/RSS generation, OpenGraph image generation, and Patreon-based authentication via NextAuth.js.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (localhost:3000)
pnpm dev

# Production build (must pass before deploying)
pnpm build

# Start production server
pnpm start
```

## Architecture

### Content System (Remote Content Repository)

**All blog content and projects are stored in a separate GitHub repository.** This repository contains only source code.

Posts and projects are fetched from the remote content repository via GitHub API at build time and refreshed hourly via ISR. The content repository keeps source code and content completely separate for better organization and independent updates.

**Blog Post Format:**
```mdx
---
title: "Post Title"
publishedAt: "2024-01-01"
summary: "Brief description"
image: "/optional-image.jpg"
draft: false        # Optional: hide in production (default: false)
paid: false         # Optional: require Patreon auth (default: false)
tier: "premium"     # Optional: specific Patreon tier requirement
---

MDX content here...
```

**Post Features:**
- **Draft Posts** (`draft: true`): Only visible in development, excluded from production builds, sitemap, and RSS
- **Paid Posts** (`paid: true`): Require Patreon authentication, show paywall to unauthenticated users
- **Remote-Only Content**: All posts fetched from GitHub content repository
- See `BLOG_FEATURES.md` and `CONTENT_REPOSITORY.md` for complete documentation

**Projects Format:**
```json
[
  {
    "name": "Project Name",
    "description": "Project description",
    "url": "https://project-url.com",
    "repo": "https://github.com/username/repo",
    "image": "/images/project.jpg",
    "tags": ["Next.js", "TypeScript"],
    "status": "active",
    "featured": true
  }
]
```

**Key Files:**
- `app/blog/utils.ts`: Core blog logic
  - `getAllPosts()`: Fetches posts from remote content repository (primary function)
  - `getBlogPosts()`: Legacy local fallback (deprecated)
  - `parseFrontmatter()`: Extracts YAML frontmatter from MDX
  - `formatDate()`: Formats dates with relative time (e.g., "3mo ago")
- `lib/remote-content.ts`: GitHub API utilities for fetching content from remote repository
  - `getRemotePosts()`: Fetch blog posts from content repo
  - `getRemoteProjects()`: Fetch projects from content repo (projects.json)
- `app/blog/[slug]/page.tsx`: Dynamic blog post routes with ISR revalidation (1 hour)
- `app/projects/page.tsx`: Projects page with ISR revalidation (1 hour)
- `app/blog/posts/`: Deprecated local posts directory (for fallback only)

### MDX Rendering Pipeline

MDX content is rendered using `next-mdx-remote/rsc` with custom component overrides in `app/components/mdx.tsx`:

**Custom Components:**
- All headings (h1-h6) get automatic anchor links via `createHeading()`
- Internal links use Next.js `<Link>` for client-side navigation
- External links get `target="_blank"` and `rel="noopener noreferrer"`
- Code blocks use `sugar-high` for lightweight syntax highlighting
- Images are processed through Next.js `<Image>` with rounded corners

**Component Override Pattern:**
```typescript
// MDX uses these instead of standard HTML elements
components = {
  h1: createHeading(1),  // Adds anchor links
  a: CustomLink,         // Smart link routing
  code: Code,           // Syntax highlighting
  Image: RoundedImage   // Optimized images
}
```

### SEO & Metadata System

**Single Source of Truth:**
- `app/sitemap.ts` exports `baseUrl = 'https://theautist.me'`
- All metadata, OpenGraph, and canonical URLs reference this constant
- Update `baseUrl` in one place to change across entire site

**Generated Routes:**
- `/sitemap.xml`: Auto-generated from blog posts + static routes
- `/rss`: XML RSS feed of all posts
- `/og?title=...`: Dynamic OpenGraph image generation
- `/robots.txt`: SEO crawler configuration

### Next.js 15 Async Params Pattern

**Critical:** Next.js 15 changed params from synchronous objects to async Promises:

```typescript
// ✓ Correct (Next.js 15)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // use slug...
}

// ✗ Wrong (Next.js 14 pattern)
export function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params  // Will fail in Next.js 15
}
```

### Styling Architecture

**Tailwind CSS Setup:**
- Uses Tailwind v3 with `@tailwind` directives in `app/global.css`
- Typography plugin for prose content styling
- Custom `.prose` classes for blog post formatting
- Dark mode via `prefers-color-scheme` media query (no toggle)

**Font System:**
- Geist Sans for body text (`GeistSans.variable`)
- Geist Mono for code (`GeistMono.variable`)
- Fonts loaded in root layout with CSS variables

### Type Safety Requirements

**TypeScript Strict Mode is enabled.** All functions must have explicit return types and parameter types:

```typescript
// ✓ Good
function formatDate(date: string, includeRelative = false): string {
  // implementation
}

// ✗ Bad
function formatDate(date, includeRelative) {  // Implicit any
  // implementation
}
```

**Component Props:**
- Use `React.ComponentPropsWithoutRef<'element'>` for HTML elements
- Use `React.ComponentPropsWithoutRef<typeof Component>` for components
- React 19 requires explicit handling of `ReactNode` vs `string` children

## Key Patterns

### Adding New Blog Posts

**Important: All blog posts must be added to the remote content repository, not this code repository.**

1. Go to your content repository (e.g., `theautist-content`)
2. Create `posts/new-post-slug.mdx` in the content repo
3. Add frontmatter (title, publishedAt, summary required)
4. Write content in MDX format
5. Commit and push to the content repository
6. Run `pnpm build` in this repository to fetch and verify
7. Posts are auto-discovered via GitHub API - no code changes needed

**For local testing without content repo:**
- Posts can temporarily be placed in `app/blog/posts/` (deprecated)
- System will fall back to local posts if remote fetch fails
- Always migrate to content repository for production

### Adding New Projects

**Important: Projects must be added to the remote content repository, not this code repository.**

1. Go to your content repository (e.g., `theautist-content`)
2. Create or edit `projects.json` (or `projects/projects.json`)
3. Add project objects with required fields (name, description)
4. Optionally add url, repo, image, tags, status, and featured fields
5. Commit and push to the content repository
6. Run `pnpm build` in this repository to fetch and verify
7. Visit `/projects` to see your projects

**Example backup:** See `claudedocs/content-backup/projects.json.example` for a complete example

### Updating Site Metadata

All site-wide metadata lives in `app/layout.tsx` metadata export:
- Title template
- Description
- OpenGraph defaults
- Social media cards

Update `baseUrl` in `app/sitemap.ts` to change domain across entire site.

### MDX Component Customization

To add new MDX components:
1. Create component in `app/components/mdx.tsx`
2. Add to `components` object export
3. Component will override default HTML element rendering

Example: Custom callout boxes, embedded videos, interactive elements

### Authentication System (NextAuth.js)

The site uses NextAuth.js 5.0 (Auth.js) with Patreon as the sole authentication provider.

**Key Files:**
- `auth.ts`: NextAuth configuration with Patreon provider
- `middleware.ts`: Auth middleware for protecting routes
- `lib/auth.ts`: Server-side auth utility functions
- `types/next-auth.d.ts`: TypeScript type extensions for session/user data
- `app/api/auth/[...nextauth]/route.ts`: NextAuth API route handler
- `app/auth/signin/page.tsx`: Custom sign-in page with Patreon branding
- `app/auth/error/page.tsx`: Authentication error page
- `app/components/auth-button.tsx`: Client-side sign in/out button
- `app/components/session-provider.tsx`: Session provider wrapper

**Environment Variables Required:**
- `AUTH_SECRET`: Generated via `npx auth secret`
- `PATREON_CLIENT_ID`: From Patreon OAuth app
- `PATREON_CLIENT_SECRET`: From Patreon OAuth app
- `NEXTAUTH_URL`: Base URL for callbacks (e.g., `http://localhost:3000`)

**Setup Guide:**
See `AUTH_SETUP.md` for complete setup instructions including:
- Creating a Patreon OAuth application
- Configuring redirect URIs
- Setting up environment variables
- Testing authentication flow
- Security best practices

**Session Data Structure:**
```typescript
{
  user: {
    id: string              // NextAuth user ID
    patreonId: string       // Patreon user ID
    name: string | null     // User's name
    email: string | null    // User's email
    image: string | null    // User's avatar
  }
}
```

**Usage Patterns:**

Server Components:
```typescript
import { getSession, getCurrentUser, isAuthenticated } from '@/lib/auth'

const session = await getSession()
const user = await getCurrentUser()
const authed = await isAuthenticated()
```

Client Components:
```typescript
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

const { data: session, status } = useSession()
```

Protected Routes:
- Add route patterns to `middleware.ts` for authentication checks
- Default: `/protected/*` requires authentication
- Unauthenticated users redirected to `/auth/signin`

### Feature Flags & A/B Testing (GrowthBook)

The site uses GrowthBook for feature flagging and A/B testing capabilities.

**Key Files:**
- `app/components/growthbook-provider.tsx`: GrowthBook provider with user attribute tracking
- `app/components/feature-flag.tsx`: React components for conditional rendering
- `lib/growthbook.ts`: Type-safe hooks and utilities

**Environment Variables Required:**
- `NEXT_PUBLIC_GROWTHBOOK_API_HOST`: GrowthBook CDN URL (optional, defaults to `https://cdn.growthbook.io`)
- `NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY`: SDK client key from GrowthBook dashboard

**Setup Guide:**
See `GROWTHBOOK_SETUP.md` for complete setup instructions including:
- Creating a GrowthBook account
- Configuring SDK connections
- Creating feature flags
- User targeting strategies
- A/B testing best practices

**User Attributes:**
GrowthBook automatically tracks these user attributes for targeting:
```typescript
{
  id: session?.user?.id || 'anonymous',
  loggedIn: !!session,
  patreonId: session?.user?.patreonId,
  email: session?.user?.email,
}
```

**Usage Patterns:**

Simple Feature Flag:
```typescript
'use client'
import { FeatureFlag } from '@/app/components/feature-flag'

<FeatureFlag flag="new-design">
  <NewDesign />
</FeatureFlag>
```

Feature with Hook:
```typescript
'use client'
import { useFeature } from '@/lib/growthbook'

const enabled = useFeature('new-design')
```

A/B Testing Variant:
```typescript
'use client'
import { useFeatureVariant } from '@/lib/growthbook'

const variant = useFeatureVariant('button-color', 'blue')
```

Type-Safe Features:
- Add feature flags to `FeatureFlags` type in `lib/growthbook.ts` for autocomplete
- Use `useTypedFeature()` for type-safe flag access

## Deployment Notes

- Site is designed for Vercel deployment (Analytics + Speed Insights integrated)
- All routes are statically generated at build time with ISR for blog posts (1 hour revalidation)
- Build must succeed without errors (`pnpm build`)
- TypeScript strict mode errors will fail the build

**Environment Variables:**

- **Auth (NextAuth.js)**: Must be configured in deployment platform
  - Use different `AUTH_SECRET` for production (generate with `npx auth secret`)
  - Update Patreon OAuth redirect URIs for production domain
  - Set `NEXTAUTH_URL` to production URL
  - Set `PATREON_CLIENT_ID` and `PATREON_CLIENT_SECRET`

- **GrowthBook**: Must be configured in deployment platform
  - Set `NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY` from GrowthBook dashboard
  - Optionally set `NEXT_PUBLIC_GROWTHBOOK_API_HOST` for self-hosted instances

- **Remote Content Repository (REQUIRED)**: All blog content and projects stored in separate GitHub repository
  - Create fine-grained GitHub PAT with read-only Contents permission
  - Set `CONTENT_REPO_OWNER` (GitHub username/org)
  - Set `CONTENT_REPO_NAME` (repository name)
  - Set `CONTENT_REPO_TOKEN` (fine-grained PAT starting with `ghp_`)
  - Set `CONTENT_REPO_BRANCH` (default: `main`)
  - Set `CONTENT_POSTS_PATH` (default: `posts`)
  - Projects stored in `projects.json` at repository root or `projects/projects.json`
  - See `CONTENT_REPOSITORY.md` for complete setup instructions
  - Legacy `PREMIUM_*` variables still supported for backward compatibility
  - If not configured, falls back to deprecated local posts directory (projects will be empty)
