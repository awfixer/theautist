import { getAllProjects } from 'app/projects/utils'

export const baseUrl = 'https://theautist.me'

export default async function sitemap() {
  // getAllProjects() includes local and remote projects, filters out drafts in production
  const projects = await getAllProjects()
  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.metadata.publishedAt,
  }))

  const routes = ['', '/projects'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...projectPages]
}
