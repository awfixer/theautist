/**
 * Remote Content Fetching
 *
 * Fetches blog posts from a separate GitHub repository.
 * All content is stored in a dedicated content repository.
 * Uses GitHub API with fine-grained personal access token.
 */

import { parseFrontmatter } from '@/app/blog/utils'

// ============================================================================
// Types
// ============================================================================

export type GitHubFile = {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir'
  content?: string // base64 encoded
  encoding?: string
}

export type RemoteRepoConfig = {
  owner: string
  repo: string
  token: string
  branch: string
  path: string
}

export type RemotePost = {
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
  source: 'remote'
}

export type Project = {
  name: string
  description: string
  url?: string
  repo?: string
  image?: string
  tags?: string[]
  status?: 'active' | 'archived' | 'planning'
  featured?: boolean
}

// ============================================================================
// Errors
// ============================================================================

export class GitHubAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

export class RemoteContentConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RemoteContentConfigError'
  }
}

// ============================================================================
// Cache
// ============================================================================

type CacheEntry<T> = {
  data: T
  timestamp: number
}

class RemoteContentCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private ttl: number

  constructor(ttlSeconds: number = 60) {
    this.ttl = ttlSeconds * 1000
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > this.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

// Development: 1 minute cache, Production: cache for build duration
const cache = new RemoteContentCache(process.env.NODE_ENV === 'development' ? 60 : 3600)

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get remote repository configuration from environment variables
 * Supports both new (CONTENT_*) and legacy (PREMIUM_*) variable names
 * @throws {RemoteContentConfigError} If required env vars are missing
 */
export function getRemoteRepoConfig(): RemoteRepoConfig {
  // Try new variable names first, fallback to legacy names
  const owner = process.env.CONTENT_REPO_OWNER || process.env.PREMIUM_REPO_OWNER
  const repo = process.env.CONTENT_REPO_NAME || process.env.PREMIUM_REPO_NAME
  const token = process.env.CONTENT_REPO_TOKEN || process.env.PREMIUM_REPO_TOKEN
  const branch = process.env.CONTENT_REPO_BRANCH || process.env.PREMIUM_REPO_BRANCH || 'main'
  const path = process.env.CONTENT_POSTS_PATH || process.env.PREMIUM_POSTS_PATH || 'posts'

  if (!owner || !repo || !token) {
    throw new RemoteContentConfigError(
      'Missing required environment variables: CONTENT_REPO_OWNER, CONTENT_REPO_NAME, CONTENT_REPO_TOKEN (or legacy PREMIUM_* equivalents)'
    )
  }

  return { owner, repo, token, branch, path }
}

/**
 * Check if remote content is configured
 */
export function isRemoteContentConfigured(): boolean {
  try {
    getRemoteRepoConfig()
    return true
  } catch {
    return false
  }
}

// ============================================================================
// GitHub API
// ============================================================================

/**
 * Fetch directory contents from GitHub API
 */
async function fetchGitHubDirectory(config: RemoteRepoConfig): Promise<GitHubFile[]> {
  const { owner, repo, token, branch, path } = config
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'theautist-blog',
    },
    // Cache for 5 minutes during builds
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new GitHubAPIError(
      `Failed to fetch directory: ${response.statusText} - ${errorText}`,
      response.status
    )
  }

  // Log rate limit info
  const remaining = response.headers.get('X-RateLimit-Remaining')
  const limit = response.headers.get('X-RateLimit-Limit')
  if (remaining && limit) {
    console.log(`GitHub API rate limit: ${remaining}/${limit}`)
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    throw new GitHubAPIError('Expected array response from GitHub API')
  }

  return data as GitHubFile[]
}

/**
 * Fetch file content from GitHub API
 */
async function fetchGitHubFile(config: RemoteRepoConfig, filename: string): Promise<string> {
  const { owner, repo, token, branch, path } = config
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}/${filename}?ref=${branch}`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'theautist-blog',
    },
    // Cache for 5 minutes during builds
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new GitHubAPIError(
      `Failed to fetch file ${filename}: ${response.statusText}`,
      response.status
    )
  }

  const data = await response.json()

  if (!data.content || data.encoding !== 'base64') {
    throw new GitHubAPIError(`Unexpected file format for ${filename}`)
  }

  // Decode base64 content
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return content
}

/**
 * Parse MDX content into a RemotePost
 */
async function parseRemotePost(slug: string, rawContent: string): Promise<RemotePost> {
  // Use the same frontmatter parser as local posts
  const { metadata, content } = parseFrontmatter(rawContent)

  // Ensure required fields are present
  if (!metadata.title || !metadata.publishedAt || !metadata.summary) {
    throw new Error(`Missing required frontmatter fields in ${slug}`)
  }

  return {
    metadata: {
      title: metadata.title,
      publishedAt: metadata.publishedAt,
      summary: metadata.summary,
      image: metadata.image,
      draft: metadata.draft,
      paid: metadata.paid,
    },
    slug,
    content,
    source: 'remote',
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch all remote posts from the content repository
 *
 * Returns empty array if:
 * - Environment variables not configured
 * - GitHub API request fails
 * - No .mdx files found
 *
 * Errors are logged but don't throw to allow graceful degradation.
 */
export async function getRemotePosts(): Promise<RemotePost[]> {
  // Check cache first
  const cached = cache.get<RemotePost[]>('remote-posts')
  if (cached) {
    console.log('Returning cached remote posts')
    return cached
  }

  try {
    // Get configuration
    const config = getRemoteRepoConfig()

    // Fetch directory listing
    console.log(`Fetching posts from ${config.owner}/${config.repo}/${config.path}`)
    const files = await fetchGitHubDirectory(config)

    // Filter for .mdx files only
    const mdxFiles = files.filter(
      (file) => file.type === 'file' && file.name.endsWith('.mdx')
    )

    if (mdxFiles.length === 0) {
      console.warn('No .mdx files found in content repository')
      return []
    }

    console.log(`Found ${mdxFiles.length} post(s)`)

    // Fetch and parse all files in parallel
    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        try {
          // Extract slug from filename (remove .mdx extension)
          const slug = file.name.replace(/\.mdx$/, '')

          // Fetch file content
          const content = await fetchGitHubFile(config, file.name)

          // Parse into post
          return await parseRemotePost(slug, content)
        } catch (error) {
          console.error(`Failed to process post ${file.name}:`, error)
          return null
        }
      })
    )

    // Filter out failed posts
    const validPosts = posts.filter((post): post is RemotePost => post !== null)

    // Update cache
    cache.set('remote-posts', validPosts)

    return validPosts
  } catch (error) {
    if (error instanceof RemoteContentConfigError) {
      // Configuration missing - this is expected in development without content repo
      console.warn('Remote content repository not configured')
    } else if (error instanceof GitHubAPIError) {
      // API error - log but don't fail build
      console.error('GitHub API error:', error.message)
    } else {
      // Unexpected error
      console.error('Unexpected error fetching remote posts:', error)
    }

    return []
  }
}

/**
 * Fetch projects from the content repository
 *
 * Projects are stored in a JSON file (e.g., projects.json) at the root
 * or in a projects directory of the content repository.
 *
 * Returns empty array if:
 * - Environment variables not configured
 * - GitHub API request fails
 * - projects.json not found or invalid
 *
 * Errors are logged but don't throw to allow graceful degradation.
 */
export async function getRemoteProjects(): Promise<Project[]> {
  // Check cache first
  const cached = cache.get<Project[]>('remote-projects')
  if (cached) {
    console.log('Returning cached remote projects')
    return cached
  }

  try {
    // Get configuration
    const config = getRemoteRepoConfig()

    // Try projects.json at root first, then projects/projects.json
    const possiblePaths = ['projects.json', 'projects/projects.json']

    for (const projectPath of possiblePaths) {
      try {
        console.log(`Fetching projects from ${config.owner}/${config.repo}/${projectPath}`)

        const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${projectPath}?ref=${config.branch}`

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'theautist-blog',
          },
          // Cache for 5 minutes during builds
          next: { revalidate: 300 },
        })

        if (!response.ok) {
          continue // Try next path
        }

        const data = await response.json()

        if (!data.content || data.encoding !== 'base64') {
          continue // Try next path
        }

        // Decode base64 content
        const content = Buffer.from(data.content, 'base64').toString('utf-8')
        const projects = JSON.parse(content) as Project[]

        if (!Array.isArray(projects)) {
          console.warn(`projects.json is not an array`)
          return []
        }

        console.log(`Found ${projects.length} project(s)`)

        // Update cache
        cache.set('remote-projects', projects)

        return projects
      } catch {
        // Continue to next path if this location fails
        continue
      }
    }

    console.warn('No projects.json found in content repository')
    return []
  } catch (error) {
    if (error instanceof RemoteContentConfigError) {
      // Configuration missing - this is expected in development without content repo
      console.warn('Remote content repository not configured for projects')
    } else if (error instanceof GitHubAPIError) {
      // API error - log but don't fail build
      console.error('GitHub API error fetching projects:', error.message)
    } else {
      // Unexpected error
      console.error('Unexpected error fetching remote projects:', error)
    }

    return []
  }
}

/**
 * Clear the remote content cache
 * Useful for testing or forcing a refresh
 */
export function clearRemoteContentCache(): void {
  cache.clear()
}
