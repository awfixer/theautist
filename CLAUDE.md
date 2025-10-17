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

### Content System (File-Based Blog)

The blog system reads MDX files from `app/blog/posts/` at build time. Posts are statically generated using `generateStaticParams()`.

**Blog Post Format:**
```mdx
---
title: "Post Title"
publishedAt: "2024-01-01"
summary: "Brief description"
image: "/optional-image.jpg"
---

MDX content here...
```

**Key Files:**
- `app/blog/utils.ts`: Core blog logic
  - `getBlogPosts()`: Reads all MDX files from posts directory
  - `parseFrontmatter()`: Extracts YAML frontmatter from MDX
  - `formatDate()`: Formats dates with relative time (e.g., "3mo ago")
- `app/blog/[slug]/page.tsx`: Dynamic blog post routes with metadata generation
- `app/blog/posts/*.mdx`: Individual blog posts (filename becomes slug)

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

1. Create `app/blog/posts/new-post-slug.mdx`
2. Add frontmatter (title, publishedAt, summary required)
3. Write content in MDX format
4. Run `pnpm build` to verify (post auto-discovered via file system)
5. No code changes needed - slug comes from filename

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

## Deployment Notes

- Site is designed for Vercel deployment (Analytics + Speed Insights integrated)
- All routes are statically generated at build time (no SSR except auth)
- Build must succeed without errors (`pnpm build`)
- TypeScript strict mode errors will fail the build
- **Auth Environment Variables**: Must be configured in deployment platform
  - Use different `AUTH_SECRET` for production
  - Update Patreon OAuth redirect URIs for production domain
  - Set `NEXTAUTH_URL` to production URL
