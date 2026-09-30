import "server-only"

import type {
  BusinessSearchQuery,
  BusinessSearchResult,
  BusinessSearchSuccessResponse,
} from "@/types/business"
import { buildOverpassQuery } from "./build-overpass-query"
import { DATA_PROVIDER, DEFAULT_SEARCH_RADIUS_METERS } from "./constants"
import { deduplicateBusinesses } from "./deduplicate-businesses"
import { BusinessSearchError } from "./errors"
import { geocodeUsLocation } from "./geocode-us-location"
import { normalizeBusiness } from "./normalize-business"
import { resolveBusinessCategory } from "./normalize-category"
import { rankBusinesses } from "./rank-businesses"
import { searchOverpass } from "./search-overpass"

/**
 * Full search pipeline: category → US geocode → Overpass → normalize and
 * US-filter → rank → dedupe → limit. Upstream calls run one after the other.
 */
export async function searchBusinesses(
  query: BusinessSearchQuery
): Promise<BusinessSearchSuccessResponse> {
  // Resolve the category before any network call so unsupported types cost nothing.
  const category = resolveBusinessCategory(query.businessType)
  if (!category) {
    throw new BusinessSearchError({
      message: "This business category is not supported yet.",
      status: 422,
      code: "unsupported_category",
      service: "request",
    })
  }

  const radiusMeters = DEFAULT_SEARCH_RADIUS_METERS
  const searchLocation = await geocodeUsLocation(query.location)
  const elements = await searchOverpass(
    buildOverpassQuery(category, searchLocation.latitude, searchLocation.longitude, radiusMeters)
  )

  const normalized = elements
    .map((element) => normalizeBusiness(element, category.id))
    .filter((business): business is BusinessSearchResult => business !== null)

  const ranked = deduplicateBusinesses(
    rankBusinesses(normalized, searchLocation.latitude, searchLocation.longitude)
  )
  const businesses = ranked.slice(0, query.limit)

  return {
    success: true,
    query: { ...query, normalizedBusinessType: category.id },
    searchLocation,
    count: businesses.length,
    businesses,
    meta: {
      provider: DATA_PROVIDER,
      radiusMeters,
      resultsBeforeLimit: ranked.length,
    },
  }
}
