"use client"

import { signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { Button } from "@/app/components/ui/button"

interface AuthButtonProps {
  session: Session | null
}

export function AuthButton({ session }: AuthButtonProps): JSX.Element {
  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {session.user.name || session.user.email}
        </span>
        <Button onClick={() => signOut()} variant="default" size="sm">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={() => signIn("patreon")} variant="default" size="sm">
      Sign in with Patreon
    </Button>
  )
}
