import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getAllProjects } from 'app/projects/utils'
import { baseUrl } from 'app/sitemap'
import { PaidPostGate } from 'app/components/paid-post-gate'
import { getTierById } from '@/config/patreon-tiers'

// Enable ISR: Revalidate projects every hour (3600 seconds)
// This allows premium content from remote repo to update without full rebuild
export const revalidate = 3600

/**
 * Static mapping for tier badge colors to ensure Tailwind generates these classes
 */
function getTierBadgeClasses(color: string): string {
  const colorMap: Record<string, string> = {
    purple: 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20',
    blue: 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20',
    green: 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500 border border-green-500/20',
    yellow: 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    red: 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500 border border-red-500/20',
  }
  return colorMap[color] || colorMap.yellow
}

export async function generateStaticParams() {
  const projects = await getAllProjects()

  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await getAllProjects()
  const project = projects.find((project) => project.slug === slug)
  if (!project) {
    return
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = project.metadata
  const ogImage = image || `${baseUrl}/og?title=${encodeURIComponent(title)}`


  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/projects/${project.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await getAllProjects()
  const project = projects.find((project) => project.slug === slug)

  if (!project) {
    notFound()
  }

  const requiredTier = project.metadata.tier
  const isPaidProject = project.metadata.paid === true || !!requiredTier
  const showFullContent = !isPaidProject

  // Get tier information for display
  const tierInfo = requiredTier ? getTierById(requiredTier) : undefined

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: project.metadata.title,
            datePublished: project.metadata.publishedAt,
            dateModified: project.metadata.publishedAt,
            description: project.metadata.summary,
            image: project.metadata.image
              ? `${baseUrl}${project.metadata.image}`
              : `/og?title=${encodeURIComponent(project.metadata.title)}`,
            url: `${baseUrl}/projects/${project.slug}`,
            author: {
              '@type': 'Person',
              name: 'My Portfolio',
            },
          }),
        }}
      />
      <div className="flex items-center gap-2 mb-2">
        <h1 className="title font-semibold text-2xl tracking-tighter text-white">
          {project.metadata.title}
        </h1>
        {isPaidProject && tierInfo && (
          <span className={getTierBadgeClasses(tierInfo.color)}>
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {tierInfo.name}
          </span>
        )}
        {isPaidProject && !tierInfo && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Patreon
          </span>
        )}
        {project.metadata.draft && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Draft
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-400">
          {formatDate(project.metadata.publishedAt)}
        </p>
      </div>
      <article className="prose">
        {showFullContent ? (
          <CustomMDX source={project.content} />
        ) : (
          <PaidPostGate requiredTier={requiredTier}>
            <div className="prose">
              <p>{project.metadata.summary}</p>
            </div>
          </PaidPostGate>
        )}
      </article>
    </section>
  )
}
