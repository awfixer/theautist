'use client'

import { useState } from 'react'
import Link from 'next/link'

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
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
        />
      </div>

      {sortedPosts.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">
          No posts found matching "{searchQuery}"
        </p>
      ) : (
        <div>
          {sortedPosts.map((post) => (
            <Link
              key={post.slug}
              className="flex flex-col space-y-1 mb-4"
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
                <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
                  {formatDate(post.metadata.publishedAt)}
                </p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {post.metadata.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
