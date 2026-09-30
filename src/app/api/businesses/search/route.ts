import { createClient } from "@/lib/supabase/server"
import {
  BusinessSearchError,
  isBusinessSearchError,
  logBusinessSearchError,
} from "@/lib/business-search/errors"
import { getSupportedCategoryIds } from "@/lib/business-search/normalize-category"
import { searchBusinesses } from "@/lib/business-search/search-businesses"
import { validateSearchRequest } from "@/lib/business-search/validate-request"
import { saveLeads } from "@/lib/leads/save-leads"
import type {
  BusinessSearchErrorResponse,
  BusinessSearchSuccessResponse,
  LeadsSaveStatus,
} from "@/types/business"

// searchBusinesses caps itself at SEARCH_DEADLINE_MS (50s), under this limit.
export const maxDuration = 60

const NO_STORE = { "Cache-Control": "no-store" }

function errorResponse(error: BusinessSearchError) {
  const body: BusinessSearchErrorResponse = { success: false, error: error.message }
  if (error.code === "unsupported_category") {
    body.supportedCategories = getSupportedCategoryIds()
  }
  return Response.json(body, { status: error.status, headers: NO_STORE })
}

/**
 * Returns the signed-in user's id, or null. Signed-in users only — except in
 * `next dev`, where anonymous requests are allowed so the endpoint can be
 * exercised with curl/Postman (their results just aren't saved).
 */
async function getRequestUser() {
  const supabase = await createClient()
  let userId: string | null = null
  try {
    const { data } = await supabase.auth.getClaims()
    userId = data?.claims?.sub ?? null
  } catch {
    userId = null
  }

  if (!userId && process.env.NODE_ENV !== "development") {
    throw new BusinessSearchError({
      message: "You need to be signed in to search for businesses.",
      status: 401,
      code: "unauthorized",
      service: "request",
    })
  }
  return { supabase, userId }
}

export async function POST(request: Request) {
  try {
    const { supabase, userId } = await getRequestUser()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new BusinessSearchError({
        message: "Request body must be valid JSON.",
        status: 400,
        code: "invalid_request",
        service: "request",
      })
    }

    const query = validateSearchRequest(body)
    const result = await searchBusinesses(query)

    // Saving never hides results: a failed save is reported alongside them.
    const leads: LeadsSaveStatus = userId
      ? await saveLeads(supabase, userId, query, result.businesses)
      : { status: "skipped", message: "Sign in to save results to your Leads." }

    const response: BusinessSearchSuccessResponse = { ...result, leads }
    return Response.json(response, { headers: NO_STORE })
  } catch (error) {
    logBusinessSearchError(error)
    if (isBusinessSearchError(error)) return errorResponse(error)
    return Response.json(
      { success: false, error: "Something went wrong while searching. Please try again." },
      { status: 500, headers: NO_STORE }
    )
  }
}
