'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/app/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'

type BlogPost = {
  metadata: {
    title: string
    publishedAt: string
    summary: string
    image?: string
  }
  slug: string
  content: string
}

function formatDate(date: string): string {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return fullDate
}

export function BlogSearch({ posts }: { posts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = posts.filter((post) => {
    const searchContent = `${post.metadata.title} ${post.metadata.summary} ${post.content}`.toLowerCase()
    return searchContent.includes(searchQuery.toLowerCase())
  })

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (
      new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
    ) {
      return -1
    }
    return 1
  })

  return (
    <div>
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {sortedPosts.length === 0 ? (
        <p className="text-muted-foreground">
          No posts found matching "{searchQuery}"
        </p>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <CardTitle className="text-lg text-white">{post.metadata.title}</CardTitle>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatDate(post.metadata.publishedAt)}
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
      )}
    </div>
  )
}
