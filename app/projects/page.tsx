import { getRemoteProjects } from '@/lib/remote-content'
import Link from 'next/link'

export const metadata = {
  title: 'Projects',
  description: 'My projects and work.',
}

// Revalidate every 1 hour (same as blog posts)
export const revalidate = 3600

export default async function ProjectsPage() {
  const projects = await getRemoteProjects()

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-white">
        My Projects
      </h1>

      {projects.length === 0 ? (
        <p className="text-neutral-400">
          No projects to display yet. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}

type ProjectCardProps = {
  project: {
    name: string
    description: string
    url?: string
    repo?: string
    image?: string
    tags?: string[]
    status?: 'active' | 'archived' | 'planning'
    featured?: boolean
  }
}

function ProjectCard({ project }: ProjectCardProps) {
  const { name, description, url, repo, image, tags, status, featured } = project

  return (
    <div className="border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition-colors">
      {/* Featured badge */}
      {featured && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
            ⭐ Featured
          </span>
        </div>
      )}

      {/* Project image */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-40 object-cover"
          />
        </div>
      )}

      {/* Project name and status */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-white">{name}</h2>
        {status && (
          <span
            className={`text-xs px-2 py-1 rounded ${
              status === 'active'
                ? 'bg-green-500/10 text-green-500'
                : status === 'archived'
                ? 'bg-neutral-500/10 text-neutral-500'
                : 'bg-blue-500/10 text-blue-500'
            }`}
          >
            {status}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-neutral-400 mb-4 text-sm">{description}</p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex gap-3 text-sm">
        {url && (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            Visit →
          </Link>
        )}
        {repo && (
          <Link
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            GitHub →
          </Link>
        )}
      </div>
    </div>
  )
}
