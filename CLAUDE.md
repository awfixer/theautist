# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

This is a Next.js 15 project with the following key technologies:
- **Framework**: Next.js 15 with App Router and React Server Components
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS with CSS variables and shadcn/ui components
- **Package Manager**: pnpm (with workspace configuration)
- **Linting**: ESLint 9 with comprehensive configurations for TS, JSON, CSS, and Markdown
- **Analytics**: Vercel Analytics and Speed Insights
- **Error Tracking**: Sentry with custom instrumentation
- **Feature Flags**: GrowthBook integration with type-safe hooks
- **Fonts**: Geist Sans and Mono

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint with auto-fix for all file types
- `pnpm prepare` - Set up Husky git hooks

The project uses lint-staged with Husky for pre-commit linting of TypeScript, JSON, CSS, and Markdown files.

## Architecture Overview

### Project Structure
- `/app` - Next.js App Router directory containing pages, components, and API routes
- `/app/components` - Shared React components including UI components from shadcn/ui
- `/app/projects` - Project showcase functionality with MDX content management
- `/lib` - Utility functions and configurations
- `/config` - Application configuration files

### Content Management
Projects are managed as MDX files in `/app/projects/posts/` with frontmatter metadata including:
- `title`, `publishedAt`, `summary` - Basic project info
- `draft`, `paid`, `tier` - Content visibility controls
- `url`, `repo`, `tags`, `status`, `featured` - Project metadata
- Content is parsed and displayed with custom utilities in `/app/projects/utils.ts`

### Key Components
- **Layout**: Dark theme with centered content (max-width: xl), using Geist fonts
- **Projects**: Dynamic project listing with search functionality and MDX rendering
- **Feature Flags**: GrowthBook integration with type-safe hooks in `/lib/growthbook.ts`
- **UI Components**: shadcn/ui components in `/app/components/ui/`

### Styling System
- Tailwind CSS with custom CSS variables for theming
- Dark mode configured via class strategy
- Custom color palette using HSL values
- Typography plugin enabled for content rendering

### Environment Configuration
- Draft filtering controlled by `FILTER_DRAFTS` environment variable (defaults to true in production)
- Sentry configuration for error tracking with custom org/project settings
- GrowthBook feature flag management with client-side wrapper

## Development Notes

- Components follow Next.js App Router patterns with Server Components by default
- Client components are explicitly marked with 'use client' directive
- Project content supports Patreon integration with tier-based access control
- Search functionality is client-side with filtering capabilities
- All external integrations (Sentry, GrowthBook, Vercel) are properly configured