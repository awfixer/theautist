import { ProjectSearch } from 'app/components/project-search'
import { getAllProjects } from 'app/projects/utils'

export const metadata = {
  title: 'Projects',
  description: 'My projects and work.',
}

// Revalidate every 1 hour
export const revalidate = 3600

export default async function ProjectsPage() {
  const allProjects = await getAllProjects()

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-white">My Projects</h1>
      <ProjectSearch projects={allProjects} />
    </section>
  )
}

