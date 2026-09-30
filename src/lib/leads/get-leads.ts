import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Lead } from "@/types"

export const LEADS_PAGE_SIZE = 25

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"])

export type LeadsPage =
  | { status: "ok"; leads: Lead[]; total: number; page: number; pageCount: number }
  | { status: "not_set_up" }
  | { status: "error" }

/** One page of the user's saved leads, newest first. */
export async function getLeadsPage(userId: string, page: number): Promise<LeadsPage> {
  const supabase = await createClient()
  const from = (page - 1) * LEADS_PAGE_SIZE

  const { data, count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
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
