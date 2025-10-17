import { auth } from "@/auth"
import { cache } from "react"

/**
 * Get the current session on the server side
 * This function is cached for the duration of the request
 */
export const getSession = cache(async () => {
  return await auth();

})

/**
 * Get the current user on the server side
 * Returns null if not authenticated
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession()
  return session?.user ?? null
})

/**
 * Check if user is authenticated
 */
export const isAuthenticated = cache(async (): Promise<boolean> => {
  const session = await getSession()
  return !!session?.user
})
