/**
 * Supabase configuration. NEXT_PUBLIC_* variables are referenced literally so
 * Next.js can inline them into client bundles at build time.
 */
export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!rawUrl || !anonKey) return null
  // The client expects the project root (https://<ref>.supabase.co). A URL
  // copied with a path such as /rest/v1/ sends auth calls to the wrong API.
  let url = rawUrl
  try {
    url = new URL(rawUrl).origin
  } catch {
    // Leave malformed values as-is; the Supabase client reports them.
  }
  return { url, anonKey }
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null
}

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    )
    this.name = "SupabaseConfigError"
  }
}

export function requireSupabaseEnv() {
  const env = getSupabaseEnv()
  if (!env) throw new SupabaseConfigError()
  return env
}
