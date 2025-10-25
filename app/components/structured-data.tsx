export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'theautist',
    url: 'https://theautist.me',
    jobTitle: 'Software Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'AWFixerOS'
    },
    sameAs: [
      'https://github.com/theautist',
      'https://discord.gg/your-discord-invite'
    ],
    description: 'Developer specializing in software engineering, AWFixerOS development, and innovative tech solutions.',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://theautist.me'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}