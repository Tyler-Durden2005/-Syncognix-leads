import type { BusinessSearchResult } from "@/types/business"
import { distanceMeters } from "./geo"

/**
 * How much usable contact information a result has. This only orders search
 * results so the most useful ones survive the limit — it is not a lead score.
 */
export function contactCompleteness(business: BusinessSearchResult) {
  let points = 0
  if (business.website) points += 1
  if (business.phone) points += 1
  if (business.address && business.city) points += 1
  if (business.city) points += 1
  return points
}

/**
 * Sorts best-first: more contact info first, then nearest to the search
 * center. Overpass itself returns results in no useful order.
 */
export function rankBusinesses(
  businesses: BusinessSearchResult[],
  latitude: number,
  longitude: number
) {
  const distance = (b: BusinessSearchResult) =>
    b.latitude === null || b.longitude === null
      ? Number.POSITIVE_INFINITY
      : distanceMeters(latitude, longitude, b.latitude, b.longitude)

  return businesses
    .map((business) => ({
      business,
      completeness: contactCompleteness(business),
      distance: distance(business),
    }))
    .sort((a, b) => b.completeness - a.completeness || a.distance - b.distance)
    .map(({ business }) => business)
}
