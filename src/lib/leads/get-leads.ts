import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Lead } from "@/types"
import { MISSING_TABLE_CODES } from "./save-leads"

export const LEADS_PAGE_SIZE = 25

export type LeadsPage =
  | { status: "ok"; leads: Lead[]; total: number; page: number; pageCount: number }
  | { status: "not_set_up" }
  | { status: "error" }

/**
 * Strips characters with meaning in PostgREST filter syntax (`,()` separate
 * conditions, `*%` are wildcards) so a search term can't alter the filter.
 */
function toSearchPattern(query: string) {
  const term = query.replace(/[,()*%\\:"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100)
  return term ? `%${term}%` : null
}

/** One page of the user's saved leads, newest first, optionally searched. */
export async function getLeadsPage(
  userId: string,
  page: number,
  query = ""
): Promise<LeadsPage> {
  const supabase = await createClient()
  const from = (page - 1) * LEADS_PAGE_SIZE

  let request = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("user_id", userId)

  const pattern = toSearchPattern(query)
  if (pattern) {
    request = request.or(
      ["name", "city", "state", "category"].map((column) => `${column}.ilike.${pattern}`).join(",")
    )
  }

  const { data, count, error } = await request
    .order("created_at", { ascending: false })
    .order("name", { ascending: true })
    .range(from, from + LEADS_PAGE_SIZE - 1)

  if (error) {
    if (MISSING_TABLE_CODES.has(error.code ?? "")) return { status: "not_set_up" }
    console.error(`[leads] load failed: ${error.code ?? "unknown"} ${error.message}`)
    return { status: "error" }
  }

  const total = count ?? 0
  return {
    status: "ok",
    leads: data ?? [],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE)),
  }
}

/** Total saved leads for the dashboard; null when it can't be loaded. */
export async function getLeadCount(userId: string): Promise<number | null> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
  if (error) return null
  return count ?? 0
}
