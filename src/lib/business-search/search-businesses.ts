import "server-only"

import type {
  BusinessSearchQuery,
  BusinessSearchResult,
  BusinessSearchSuccessResponse,
} from "@/types/business"
import { resolveBusinessCategory } from "./category-map"
import { BusinessSearchError } from "./errors"
import { geocodeLocation } from "./geocode-location"
import { dedupeBusinesses, normalizeBusiness, sortByDistance } from "./normalize-business"
import { searchOverpass } from "./search-overpass"

/**
 * Full search pipeline: category → geocode → Overpass → normalize → sort →
 * dedupe → limit. Upstream calls run strictly one after the other.
 */
export async function searchBusinesses(
  query: BusinessSearchQuery
): Promise<BusinessSearchSuccessResponse> {
  // Resolve the category before any network call so unsupported types cost nothing.
  const category = resolveBusinessCategory(query.businessType)
  if (!category) {
    throw new BusinessSearchError({
      message: "This business category is not supported yet.",
      status: 400,
      code: "unsupported_category",
      service: "request",
    })
  }

  const location = await geocodeLocation(query.location)
  const elements = await searchOverpass(category, location.latitude, location.longitude)

  const normalized = elements
    .map((element) => normalizeBusiness(element, category.id))
    .filter((business): business is BusinessSearchResult => business !== null)

  const businesses = dedupeBusinesses(
    sortByDistance(normalized, location.latitude, location.longitude)
  ).slice(0, query.limit)

  return {
    success: true,
    query,
    location,
    count: businesses.length,
    businesses,
  }
}
