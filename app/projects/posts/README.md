# Local Posts Directory (DEPRECATED)

⚠️ **This directory is deprecated and maintained only for backward compatibility.**

## Current Architecture

All blog content is now stored in a **separate GitHub repository** (the "content repository"). This keeps source code and content completely separate.

Posts in this directory are only used as a fallback if:
1. The content repository is not configured
2. The GitHub API fetch fails
3. You're testing locally without setting up the content repository

## How to Add New Posts

**Do NOT add posts to this directory.** Instead:

1. Create your content repository (see `CONTENT_REPOSITORY.md`)
2. Add posts to the content repository's `posts/` directory
3. Push to GitHub
4. This codebase will fetch posts via GitHub API at build time

## Migration

If you have posts in this directory that you want to keep:

1. Move them to your content repository:
   ```bash
   # In your content repo
   mkdir posts
   cp /path/to/this/repo/app/blog/posts/*.mdx posts/
   git add posts/
   git commit -m "Import existing blog posts"
   git push
   ```

2. Configure environment variables (see `CONTENT_REPOSITORY.md`)

3. Test that posts are being fetched:
   ```bash
   pnpm build
   # Look for: "Fetching posts from owner/repo/posts"
   ```

4. Once verified, you can safely remove posts from this directory

## For Developers

- **getBlogPosts()**: Reads from this directory (deprecated)
- **getAllPosts()**: Fetches from content repository (primary function)
- See `app/blog/utils.ts` for implementation details
- See `lib/remote-content.ts` for GitHub API integration

## Documentation

- Full documentation: `CONTENT_REPOSITORY.md`
- Project overview: `CLAUDE.md`
- Blog features: `BLOG_FEATURES.md`
