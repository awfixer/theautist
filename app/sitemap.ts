import { getAllPosts } from 'app/blog/utils'

export const baseUrl = 'https://theautist.me'

export default async function sitemap() {
  // getAllPosts() includes local and remote posts, filters out drafts in production
  const posts = await getAllPosts()
  const blogs = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  const routes = ['', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
