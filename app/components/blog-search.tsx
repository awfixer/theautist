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
    draft?: boolean
    paid?: boolean
    tier?: string
  }
  slug: string
  content: string
}

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

export function BlogSearch({ posts }: { posts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = posts.filter((post) => {
    const searchContent = `${post.metadata.title} ${post.metadata.summary} ${post.content}`.toLowerCase()
    return searchContent.includes(searchQuery.toLowerCase())
  })

  const sortedPosts = filteredPosts.sort((a, b) => {
    const dateA = new Date(a.metadata.publishedAt)
    const dateB = new Date(b.metadata.publishedAt)
    if (dateA > dateB) {
      return -1
    }
    if (dateA < dateB) {
      return 1
    }
    return 0
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
            <Link key={post.slug} href={`/blog/${encodeURIComponent(post.slug)}`}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg text-white">{post.metadata.title}</CardTitle>
                      {(post.metadata.paid || post.metadata.tier) && (
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
                      {post.metadata.draft && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          Draft
                        </span>
                      )}
                    </div>
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
