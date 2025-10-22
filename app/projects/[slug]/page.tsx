import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getAllProjects } from 'app/projects/utils'
import { baseUrl } from 'app/sitemap'
import { Button } from '@/app/components/ui/button'

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await getAllProjects()

  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await getAllProjects()
  const project = projects.find((project) => project.slug === slug)
  if (!project) {
    return
  }

  const {
    title,
    publishedAt: publishedTime,
    description,
    image,
  } = project.metadata
  const ogImage = image || `${baseUrl}/og?title=${encodeURIComponent(title)}`


  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/projects/${project.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await getAllProjects()
  const project = projects.find((project) => project.slug === slug)

  if (!project) {
    notFound()
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: project.metadata.title,
            datePublished: project.metadata.publishedAt,
            dateModified: project.metadata.publishedAt,
            description: project.metadata.description,
            image: project.metadata.image,
            url: `${baseUrl}/projects/${project.slug}`,
            author: {
              '@type': 'Person',
              name: 'My Portfolio',
            },
          }),
        }}
      />
      
      {project.metadata.image && (
        <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
          <Image
            src={project.metadata.image}
            alt={project.metadata.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="title font-semibold text-2xl tracking-tighter text-white">
          {project.metadata.title}
        </h1>
        <a href={project.metadata.link} target="_blank" rel="noopener noreferrer">
          <Button>
            Visit Project
          </Button>
        </a>
      </div>

      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-400">
          {formatDate(project.metadata.publishedAt)}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-neutral-300">{project.metadata.description}</p>
      </div>

      <article className="prose">
        <CustomMDX source={project.content} />
      </article>
    </section>
  )
}
