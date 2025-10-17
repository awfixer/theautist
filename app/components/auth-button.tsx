"use client"

import { signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"

interface AuthButtonProps {
  session: Session | null
}

export function AuthButton({ session }: AuthButtonProps): JSX.Element {
  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("patreon")}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
    >
      Sign in with Patreon
    </button>
  )
}
