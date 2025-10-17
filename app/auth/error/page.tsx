"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent(): JSX.Element {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-red-400">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            {error === "Configuration"
              ? "There is a problem with the server configuration."
              : error === "AccessDenied"
                ? "You do not have permission to sign in."
                : error === "Verification"
                  ? "The verification token has expired or has already been used."
                  : "An error occurred during authentication."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/signin"
            className="rounded-md bg-neutral-100 px-4 py-3 text-center text-sm font-semibold text-neutral-900 hover:bg-neutral-300"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="rounded-md border border-neutral-700 px-4 py-3 text-center text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-sm text-neutral-400">
            Loading...
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
