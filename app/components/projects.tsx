import Link from 'next/link'
import { formatDate, getAllProjects } from 'app/projects/utils'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'

export function ProjectList({ limit }: { limit?: number }) {
  const allProjects = getAllProjects()

  return (
    <div className="space-y-4">
      {allProjects
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .slice(0, limit)
        .map((project) => (
          <Link key={project.slug} href={`/projects/${project.slug}`}>
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <CardTitle className="text-lg text-white">{project.metadata.title}</CardTitle>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(project.metadata.publishedAt, false)}
                  </p>
                </div>
                {project.metadata.summary && (
                  <CardDescription>{project.metadata.summary}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
    </div>
  )
}
