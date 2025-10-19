import { BlogSearch } from 'app/components/blog-search'
import { getAllPosts } from 'app/blog/utils'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default async function Page() {
  const allPosts = await getAllPosts()

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-white">My Blog</h1>
      <BlogSearch posts={allPosts} />
    </section>
  )
}
