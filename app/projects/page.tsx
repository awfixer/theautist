import Link from 'next/link'
import { getAllProjects } from 'app/projects/utils'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'

export const metadata = {
  title: 'Projects',
  description: 'My projects and work.',
}

// Revalidate every 1 hour
export const revalidate = 3600

function formatDate(date: string): string {
  let dateString = date
  if (!dateString.includes('T')) {
    dateString = `${dateString}T00:00:00`
  }
  const targetDate = new Date(dateString)

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return fullDate
}

export default async function ProjectsPage() {
  const allProjects = await getAllProjects()

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-white">My Projects</h1>
      <div className="space-y-4">
        {allProjects.map((project) => (
          <Link key={project.slug} href={`/projects/${encodeURIComponent(project.slug)}`}>
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg text-white">{project.metadata.title}</CardTitle>
                    {project.metadata.featured && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        ⭐ Featured
                      </span>
                    )}
                    {project.metadata.status && (
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        project.metadata.status === 'active'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : project.metadata.status === 'archived'
                          ? 'bg-neutral-500/10 text-neutral-500 border border-neutral-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {project.metadata.status}
                      </span>
                    )}
                    {(project.metadata.paid || project.metadata.tier) && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
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
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(project.metadata.publishedAt)}
                  </p>
                </div>
                {project.metadata.summary && (
                  <CardDescription>{project.metadata.summary}</CardDescription>
                )}
                {project.metadata.tags && project.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(project.metadata.url || project.metadata.repo) && (
                  <div className="flex gap-3 text-sm mt-2">
                    {project.metadata.url && (
                      <a
                        href={project.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit →
                      </a>
                    )}
                    {project.metadata.repo && (
                      <a
                        href={project.metadata.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-neutral-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        GitHub →
                      </a>
                    )}
                  </div>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

