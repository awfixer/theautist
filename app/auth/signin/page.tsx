"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SignInContent(): JSX.Element {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-neutral-800 bg-neutral-900 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in with your Patreon account to continue
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/10 p-4">
            <p className="text-sm text-red-400">
              {error === "OAuthSignin"
                ? "Error occurred during sign in. Please try again."
                : error === "OAuthCallback"
                  ? "Error occurred during callback. Please try again."
                  : error === "OAuthCreateAccount"
                    ? "Error occurred creating your account. Please try again."
                    : error === "EmailCreateAccount"
                      ? "Error occurred creating your account. Please try again."
                      : error === "Callback"
                        ? "Error occurred during callback. Please try again."
                        : "An error occurred. Please try again."}
            </p>
          </div>
        )}

        <button
          onClick={() => signIn("patreon", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-[#FF424D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#FF424D] focus:ring-offset-2"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613s8.613-3.864 8.613-8.613C24 4.4 20.15.524 15.386.524M.003 23.537h4.22V.524H.003" />
          </svg>
          Sign in with Patreon
        </button>
      </div>
    </div>
  )
}

export default function SignInPage(): JSX.Element {
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
      <SignInContent />
    </Suspense>
  )
}
