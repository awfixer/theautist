import Link from 'next/link'
import { AuthButton } from './auth-button'
import { getSession } from '@/lib/auth'

const navItems = {
  '/': {
    name: 'home',
  },
  '/blog': {
    name: 'blog',
  },
  'https://inv.wtf/deadinside': {
    name: 'discord',
  },
  'https://patreon.com/awfixer': {
    name: 'patreon',
  },
}

export async function Navbar(): Promise<JSX.Element> {
  const session = await getSession()

  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-center justify-between relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
                >
                  {name}
                </Link>
              )
            })}
          </div>
          <AuthButton session={session} />
        </nav>
      </div>
    </aside>
  )
}
