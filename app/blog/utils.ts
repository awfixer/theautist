import fs from 'fs'
import path from 'path'
import slugify from 'slugify'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  draft?: boolean
  paid?: boolean
  tier?: string // Patreon tier required for access (basic, premium, ultimate)
}

export type Post = {
  metadata: Metadata
  slug: string
  content: string
  source: 'local' | 'remote'
}

export function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  const match = frontmatterRegex.exec(fileContent)
  const frontMatterBlock = match![1]
  const content = fileContent.replace(frontmatterRegex, '').trim()
  const frontMatterLines = frontMatterBlock.trim().split('\n')
  const metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    const trimmedKey = key.trim() as keyof Metadata

    // Normalize value for boolean checks
    const normalizedValue = value.trim().toLowerCase();

    // Handle boolean values
    if (normalizedValue === 'true') {
      metadata[trimmedKey] = true as never
    } else if (normalizedValue === 'false') {
      metadata[trimmedKey] = false as never
    } else {
      metadata[trimmedKey] = value as never
    }
  })

  return { metadata: metadata as Metadata, content }
}

function getMDXFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath: string): { metadata: Metadata; content: string } {
  const rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir: string): Post[] {
  const mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file))
    const baseName = path.basename(file, path.extname(file))
    const slug = slugify(baseName, { lower: true, strict: true })

    return {
      metadata,
      slug,
      content,
      source: 'local' as const,
    }
  })
}

export function getBlogPosts(): Post[] {
  const allPosts = getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))

  // Filter out drafts if configured (defaults to true in production)
  const shouldFilterDrafts = process.env.FILTER_DRAFTS === 'true' ||
    (process.env.FILTER_DRAFTS === undefined && process.env.NODE_ENV === 'production')

  if (shouldFilterDrafts) {
    return allPosts.filter((post) => !post.metadata.draft)
  }

  return allPosts
}

/**
 * Get all blog posts including local and remote (premium) posts
 *
 * This function merges posts from:
 * - Local filesystem (app/blog/posts/)
 * - Remote GitHub repository (premium content)
 *
 * Remote posts are fetched from a separate private repository if configured.
 * If remote fetching fails or is not configured, only local posts are returned.
 *
 * @returns Combined array of local and remote posts, sorted by publishedAt date
 */
export async function getAllPosts(): Promise<Post[]> {
  // Dynamic import to avoid circular dependency and reduce bundle size
  const { getRemotePosts } = await import('@/lib/remote-content')

  // Get local posts (synchronous)
  const localPosts = getBlogPosts()

  // Get remote posts (asynchronous, may return empty array)
  const remotePosts = await getRemotePosts()

  // Merge and sort by publishedAt date (newest first)
  const allPosts = [...localPosts, ...remotePosts].sort((a, b) => {
    const dateA = new Date(a.metadata.publishedAt)
    const dateB = new Date(b.metadata.publishedAt)
    return dateB.getTime() - dateA.getTime()
  })

  return allPosts
}

export function formatDate(date: string, includeRelative = false) {
  const currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  const targetDate = new Date(date)

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  const daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
