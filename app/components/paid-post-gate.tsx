import Link from 'next/link'

interface PaidPostGateProps {
  children: React.ReactNode
}

export function PaidPostGate({ children }: PaidPostGateProps): React.ReactElement {
  return (
    <div className="relative">
      {/* Preview of content (first few lines visible) */}
      <div className="max-h-48 overflow-hidden relative">
        {children}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
      </div>

      {/* Paywall notice */}
      <div className="mt-8 p-6 border border-neutral-700 rounded-lg bg-neutral-900/50 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-500"
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
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Patreon-Only Content
            </h3>
            <p className="text-neutral-400 mb-4">
              This post is exclusively available to my Patreon supporters. Sign in with
              your Patreon account to unlock the full content.
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center px-4 py-2 bg-[#FF424D] hover:bg-[#E03C46] text-white font-medium rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
              </svg>
              Sign in with Patreon
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
