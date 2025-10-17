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
      if (account) {
        token.accessToken = account.access_token
        token.patreonId = profile?.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.sub as string
        session.user.patreonId = token.patreonId as string
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
