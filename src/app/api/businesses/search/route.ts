import { createClient } from "@/lib/supabase/server"
import {
  BusinessSearchError,
  isBusinessSearchError,
  logBusinessSearchError,
} from "@/lib/business-search/errors"
import { getSupportedCategoryIds } from "@/lib/business-search/normalize-category"
import { searchBusinesses } from "@/lib/business-search/search-businesses"
import { validateSearchRequest } from "@/lib/business-search/validate-request"
import type { BusinessSearchErrorResponse } from "@/types/business"

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
 * Signed-in users only. In `next dev` the check is skipped so the endpoint
 * can be exercised with curl/Postman without a session cookie.
 */
async function isAuthorized() {
  if (process.env.NODE_ENV === "development") return true
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    return Boolean(data?.claims?.sub)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      throw new BusinessSearchError({
        message: "You need to be signed in to search for businesses.",
        status: 401,
        code: "unauthorized",
        service: "request",
      })
    }

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
    return Response.json(result, { headers: NO_STORE })
  } catch (error) {
    logBusinessSearchError(error)
    if (isBusinessSearchError(error)) return errorResponse(error)
    return Response.json(
      { success: false, error: "Something went wrong while searching. Please try again." },
      { status: 500, headers: NO_STORE }
    )
  }
}
