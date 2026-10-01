"use server"

import { revalidatePath } from "next/cache"
import { MAX_LIMIT } from "@/lib/business-search/constants"
import { createClient } from "@/lib/supabase/server"
import type {
  BusinessSearchResult,
  OsmElementType,
  SaveLeadsInput,
  SaveLeadsResult,
} from "@/types/business"
import { saveLeads } from "./save-leads"

const SIGNED_OUT = "Your session has expired. Please sign in again."
const INVALID = "We couldn't save these leads. Please try again."
const OSM_TYPES = new Set<OsmElementType>(["node", "way", "relation"])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The verified user's id from the session — never from client input. */
async function getUserId() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return { supabase, userId: data?.claims?.sub ?? null }
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function coordinate(value: unknown, limit: number) {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit
    ? value
    : null
}

/**
 * Server actions accept any payload, so rebuild each business from known
 * fields only. RLS already limits writes to the caller's own rows; this keeps
 * the stored data well-formed.
 */
function parseBusiness(value: unknown): BusinessSearchResult | null {
  if (!value || typeof value !== "object") return null
  const input = value as Record<string, unknown>
  const osmId = text(input.osmId, 64)
  const osmType = input.osmType as OsmElementType
  const name = text(input.name, 300)
  const category = text(input.category, 100)
  if (!osmId || !OSM_TYPES.has(osmType) || !name || !category) return null

  const website = text(input.website, 2048)
  return {
    osmId,
    osmType,
    name,
    website: website && /^https?:\/\//i.test(website) ? website : null,
    phone: text(input.phone, 100),
    street: text(input.street, 300),
    city: text(input.city, 200),
    state: text(input.state, 200),
    postcode: text(input.postcode, 20),
    address: text(input.address, 500),
    category,
    latitude: coordinate(input.latitude, 90),
    longitude: coordinate(input.longitude, 180),
    country: "United States",
    countryCode: "US",
  }
}

/** Saves search results to the signed-in user's leads, skipping duplicates. */
export async function saveLeadsAction(input: SaveLeadsInput): Promise<SaveLeadsResult> {
  const list: unknown[] = Array.isArray(input?.businesses) ? input.businesses : []
  if (list.length === 0 || list.length > MAX_LIMIT) return { ok: false, message: INVALID }

  const businesses = list.map(parseBusiness)
  if (businesses.some((business) => business === null)) return { ok: false, message: INVALID }

  // Same business twice in one request would make the batch insert fail.
  const unique = [
    ...new Map((businesses as BusinessSearchResult[]).map((b) => [b.osmId, b])).values(),
  ]

  try {
    const { supabase, userId } = await getUserId()
    if (!userId) return { ok: false, message: SIGNED_OUT }

    const result = await saveLeads(supabase, userId, unique, {
      businessType: text(input.businessType, 200) ?? "",
      location: text(input.location, 200) ?? "",
    })
    if (result.ok && result.saved > 0) {
      revalidatePath("/leads")
      revalidatePath("/dashboard")
    }
    return result
  } catch (error) {
    console.error("[leads] save action failed:", error)
    return { ok: false, message: INVALID }
  }
}

export type DeleteLeadResult = { ok: true } | { ok: false; message: string }

/** Removes one of the signed-in user's saved leads. */
export async function deleteLeadAction(id: string): Promise<DeleteLeadResult> {
  const failed = { ok: false as const, message: "We couldn't remove this lead. Please try again." }
  if (typeof id !== "string" || !UUID.test(id)) return failed

  try {
    const { supabase, userId } = await getUserId()
    if (!userId) return { ok: false, message: SIGNED_OUT }

    // RLS enforces ownership; the user_id filter makes the intent explicit.
    const { error } = await supabase.from("leads").delete().eq("id", id).eq("user_id", userId)
    if (error) {
      console.error(`[leads] delete failed: ${error.code ?? "unknown"} ${error.message}`)
      return failed
    }
  } catch (error) {
    console.error("[leads] delete action failed:", error)
    return failed
  }

  revalidatePath("/leads")
  revalidatePath("/dashboard")
  return { ok: true }
}
