import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      patreonId: string
      pledgeAmountCents?: number
      patronStatus?: string
    } & DefaultSession["user"]
  }

  interface User {
    patreonId?: string
    pledgeAmountCents?: number
    patronStatus?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    patreonId?: string
    pledgeAmountCents?: number
    patronStatus?: string
  }
}
