import fs from 'fs'
import path from 'path'
import slugify from 'slugify'

type Metadata = {
  title: string
  description?: string
  publishedAt: string
  image?: string
  link?: string
  summary?: string
  draft?: boolean
  paid?: boolean
  tier?: string
  url?: string
  repo?: string
  tags?: string[]
  status?: 'active' | 'archived' | 'planning'
  featured?: boolean
}

export type Project = {
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

function getMDXData(dir: string): Project[] {
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

/**
 * Get projects from local filesystem
 *
 * This function loads projects from the local posts directory.
 */
function getLocalProjects(): Project[] {
  const projectsDir = path.join(process.cwd(), 'app', 'projects', 'posts')

  // Check if projects directory exists
  if (!fs.existsSync(projectsDir)) {
    console.warn('Local projects directory does not exist.')
    return []
  }

  const allProjects = getMDXData(projectsDir)

  return allProjects
}

/**
 * Get all projects from local filesystem
 *
 * This is the primary function for fetching projects. All content is stored
 * locally in the projects/posts directory.
 *
 * @returns Array of projects sorted by publishedAt date (newest first)
 */
export function getAllProjects(): Project[] {
  const localProjects = getLocalProjects()
  
  // Filter out drafts in production if FILTER_DRAFTS is true
  const filteredProjects = process.env.NODE_ENV === 'production' && process.env.FILTER_DRAFTS !== 'false'
    ? localProjects.filter(project => !project.metadata.draft)
    : localProjects

  return filteredProjects.sort((a, b) => {
    const dateA = new Date(a.metadata.publishedAt)
    const dateB = new Date(b.metadata.publishedAt)
    return dateB.getTime() - dateA.getTime()
  })
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
