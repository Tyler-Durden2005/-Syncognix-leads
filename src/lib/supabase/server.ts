import "server-only"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import { requireSupabaseEnv } from "./env"

/**
 * Creates a Supabase client bound to the current request's cookies.
 * Create a new client per request — never share one across requests.
 */
export async function createClient() {
  // Read cookies first: it opts the route into dynamic rendering, so nothing
  // touching auth is ever prerendered at build time.
  const cookieStore = await cookies()
  const { url, anonKey } = requireSupabaseEnv()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: the proxy refreshes the session on every request.
        }
      },
    },
  })
}
