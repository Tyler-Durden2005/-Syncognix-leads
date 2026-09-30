import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getInitials } from "@/lib/format"
import type { AppUser } from "@/types"

/**
 * Returns the verified signed-in user (with profile) or null.
 * Wrapped in React `cache` so layouts and pages share one lookup per request.
 */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient()

  // getClaims() verifies the JWT signature (locally when the project uses
  // asymmetric signing keys), so it is safe for authorization decisions.
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (error || !claims?.sub) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", claims.sub)
    .maybeSingle()

  const email = claims.email ?? ""
  const metadataName = claims.user_metadata?.full_name as string | undefined
  const fullName =
    profile?.full_name?.trim() ||
    metadataName?.trim() ||
    email.split("@")[0] ||
    "there"

  return {
    id: claims.sub,
    email,
    fullName,
    firstName: fullName.split(/\s+/)[0],
    initials: getInitials(fullName),
    avatarUrl: profile?.avatar_url ?? null,
  }
})

/** Like getCurrentUser, but redirects to /login when there is no session. */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}
