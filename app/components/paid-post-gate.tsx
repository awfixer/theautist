import { getTierById, formatTierAmount, hasAccess } from '@/config/patreon-tiers'

interface PaidPostGateProps {
  children: React.ReactNode
  requiredTier?: string
  userTier?: string
}

export function PaidPostGate({ children, requiredTier, userTier }: PaidPostGateProps): React.ReactElement {
  const tierInfo = requiredTier ? getTierById(requiredTier) : undefined
  const userTierInfo = userTier ? getTierById(userTier) : undefined

  // Determine if user has a tier but it's insufficient
  const hasInsufficientTier = !!userTier && !!requiredTier && !!tierInfo && !hasAccess(userTier, requiredTier)

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
            {hasInsufficientTier && tierInfo ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Upgrade Required
                </h3>
                <p className="text-neutral-400 mb-2">
                  You're currently a <span className="text-white font-medium">{userTierInfo?.name}</span> supporter.
                  This post requires <span className="text-white font-medium">{tierInfo.name}</span> tier or higher.
                </p>
                <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                  <p className="text-sm font-semibold text-white mb-2">{tierInfo.name}</p>
                  <p className="text-sm text-neutral-400 mb-3">{formatTierAmount(tierInfo.amountCents)}</p>
                  <ul className="space-y-1">
                    {tierInfo.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-neutral-400 flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="https://www.patreon.com/settings/memberships"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-[#FF424D] hover:bg-[#E03C46] text-white font-medium rounded-lg transition-colors"
                >
                  Upgrade on Patreon
                </a>
              </>
            ) : tierInfo ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tierInfo.name} Content
                </h3>
                <p className="text-neutral-400 mb-2">
                  This post is exclusively available to <span className="text-white font-medium">{tierInfo.name}</span> supporters and above.
                </p>
                <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                  <p className="text-sm font-semibold text-white mb-2">{tierInfo.name}</p>
                  <p className="text-sm text-neutral-400 mb-3">{formatTierAmount(tierInfo.amountCents)}</p>
                  <ul className="space-y-1">
                    {tierInfo.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-neutral-400 flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="https://www.patreon.com/awfixer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-[#FF424D] hover:bg-[#E03C46] text-white font-medium rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
                  </svg>
                  Support on Patreon
                </a>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Patreon-Only Content
                </h3>
                <p className="text-neutral-400 mb-4">
                  This post is exclusively available to my Patreon supporters.
                </p>
                <a
                  href="https://www.patreon.com/awfixer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#FF424D] hover:bg-[#E03C46] text-white font-medium rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
                  </svg>
                  Support on Patreon
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
