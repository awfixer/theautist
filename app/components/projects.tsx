import Link from 'next/link'
import Image from 'next/image'
import { formatDate, getAllProjects } from 'app/projects/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

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
          <Card key={project.slug} className="transition-all hover:shadow-md">
            {project.metadata.image && (
              <div className="relative h-48 w-full">
                <Image
                  src={project.metadata.image}
                  alt={project.metadata.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <CardTitle className="text-lg text-white">{project.metadata.title}</CardTitle>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {formatDate(project.metadata.publishedAt, false)}
                </p>
              </div>
              <CardDescription>{project.metadata.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Link href={`/projects/${project.slug}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              <a href={project.metadata.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  Visit Project
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
