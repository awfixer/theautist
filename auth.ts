import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Patreon from "next-auth/providers/patreon"

export const authConfig: NextAuthConfig = {
  providers: [
    Patreon({
      clientId: process.env.PATREON_CLIENT_ID!,
      clientSecret: process.env.PATREON_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identity identity[email] identity.memberships",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user data to the token right after signin
      if (account && account.access_token) {
        token.accessToken = account.access_token
        token.patreonId = profile?.id

        // Fetch Patreon membership data
        try {
          const response = await fetch(
            'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=currently_entitled_amount_cents,patron_status',
            {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            }
          )

          if (response.ok) {
            const data = await response.json()

            // Extract membership data
            const memberships = data.included?.filter(
              (item: { type: string }) => item.type === 'member'
            ) || []

            // Get active membership with highest pledge
            const activeMembership = memberships
              .filter((m: { attributes: { patron_status: string } }) =>
                m.attributes.patron_status === 'active_patron'
              )
              .sort((a: { attributes: { currently_entitled_amount_cents: number } },
                     b: { attributes: { currently_entitled_amount_cents: number } }) =>
                b.attributes.currently_entitled_amount_cents -
                a.attributes.currently_entitled_amount_cents
              )[0]

            if (activeMembership) {
              token.pledgeAmountCents = activeMembership.attributes.currently_entitled_amount_cents
              token.patronStatus = activeMembership.attributes.patron_status
            }
          }
        } catch (error) {
          console.error('Failed to fetch Patreon membership data:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.sub as string
        session.user.patreonId = token.patreonId as string
        session.user.pledgeAmountCents = token.pledgeAmountCents as number | undefined
        session.user.patronStatus = token.patronStatus as string | undefined
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith("/auth")

      // Allow access to auth pages for everyone
      if (isAuthPage) {
        return true
      }

      // Redirect unauthenticated users to sign in page for protected routes
      if (!isLoggedIn) {
        return false
      }

      return true
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
