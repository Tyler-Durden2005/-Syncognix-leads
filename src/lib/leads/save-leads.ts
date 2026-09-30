import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  BusinessSearchQuery,
  BusinessSearchResult,
  LeadsSaveStatus,
} from "@/types/business"
import type { Database } from "@/types/database"

/** Postgres/PostgREST codes for "table doesn't exist". */
const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"])

/**
 * Saves search results as the user's leads. Re-finding a business the user
 * already has refreshes its contact details instead of creating a duplicate;
 * its status (e.g. "contacted") is left untouched.
 */
export async function saveLeads(
  supabase: SupabaseClient<Database>,
  userId: string,
  query: BusinessSearchQuery,
  businesses: BusinessSearchResult[]
): Promise<LeadsSaveStatus> {
  if (businesses.length === 0) return { status: "saved", count: 0 }

  const rows = businesses.map((business) => ({
    user_id: userId,
    osm_id: business.osmId,
    osm_type: business.osmType,
    name: business.name,
    website: business.website,
    phone: business.phone,
    street: business.street,
    city: business.city,
    state: business.state,
    postcode: business.postcode,
    address: business.address,
    category: business.category,
    latitude: business.latitude,
    longitude: business.longitude,
    search_business_type: query.businessType,
    search_location: query.location,
  }))

  const { error } = await supabase
    .from("leads")
    .upsert(rows, { onConflict: "user_id,osm_id" })

  if (error) {
    console.error(`[leads] save failed: ${error.code ?? "unknown"} ${error.message}`)
    return {
      status: "failed",
      message: MISSING_TABLE_CODES.has(error.code ?? "")
        ? "Results couldn't be saved because the leads table hasn't been set up yet. Run the leads migration in Supabase."
        : "Results couldn't be saved to your Leads. Please try again.",
    }
  }

  return { status: "saved", count: rows.length }
}
