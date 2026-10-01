import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { Database, SearchHistoryEntry } from "@/types/database"
import { MISSING_TABLE_CODES } from "./save-leads"

/**
 * Records a search for the dashboard's "Recent searches". History is a
 * nice-to-have: failures (including the table not existing yet) are ignored.
 */
export async function recordSearch(
  supabase: SupabaseClient<Database>,
  userId: string,
  entry: { businessType: string; location: string; resultCount: number }
) {
  const { error } = await supabase.from("searches").insert({
    user_id: userId,
    business_type: entry.businessType,
    location: entry.location,
    result_count: entry.resultCount,
  })
  if (error && !MISSING_TABLE_CODES.has(error.code ?? "")) {
    console.error(`[searches] record failed: ${error.code ?? "unknown"} ${error.message}`)
  }
}

/** The user's latest searches, newest first. Empty when unavailable. */
export async function getRecentSearches(userId: string, limit = 5): Promise<SearchHistoryEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("searches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    if (!MISSING_TABLE_CODES.has(error.code ?? "")) {
      console.error(`[searches] load failed: ${error.code ?? "unknown"} ${error.message}`)
    }
    return []
  }
  return data ?? []
}
