import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'

export function BlogPosts({ limit }: { limit?: number }) {
  const allBlogs = getBlogPosts()

  return (
    <div className="space-y-4">
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .slice(0, limit)
        .map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <CardTitle className="text-lg text-white">{post.metadata.title}</CardTitle>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(post.metadata.publishedAt, false)}
                  </p>
                </div>
                {post.metadata.summary && (
                  <CardDescription>{post.metadata.summary}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
    </div>
  )
}
