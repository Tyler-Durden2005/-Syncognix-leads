import type { BusinessSearchResult } from "@/types/business"
import { distanceMeters } from "./geo"

/**
 * The same business mapped twice (commonly a point plus its building
 * outline) shows up as two objects with the same name a few meters apart.
 * Real branches of a chain are much further apart than this.
 */
const DUPLICATE_DISTANCE_METERS = 100

function nameKey(name: string) {
  return name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "")
}

function websiteKey(website: string | null) {
  if (!website) return null
  try {
    return new URL(website).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

function isSamePlace(a: BusinessSearchResult, b: BusinessSearchResult) {
  if (a.latitude !== null && a.longitude !== null && b.latitude !== null && b.longitude !== null) {
    return distanceMeters(a.latitude, a.longitude, b.latitude, b.longitude) < DUPLICATE_DISTANCE_METERS
  }
  // Without coordinates, only treat an identical street address as the same place.
  return a.address !== null && a.address.toLowerCase() === b.address?.toLowerCase()
}

/**
 * Conservative dedupe. Always by osmId; otherwise two results are merged only
 * when they share a normalized name AND are the same place (within 100 m, or
 * the same street address). Websites must not conflict. Chains sharing a name
 * and website across a city are kept as separate branches.
 *
 * Input order matters: the first of each duplicate group is kept, so rank
 * results best-first before calling this.
 */
export function deduplicateBusinesses(businesses: BusinessSearchResult[]) {
  const seenIds = new Set<string>()
  const keptByName = new Map<string, BusinessSearchResult[]>()
  const result: BusinessSearchResult[] = []

  for (const business of businesses) {
    if (seenIds.has(business.osmId)) continue
    seenIds.add(business.osmId)

    const key = nameKey(business.name)
    const sameName = keptByName.get(key) ?? []
    const site = websiteKey(business.website)
    const isDuplicate = sameName.some((other) => {
      const otherSite = websiteKey(other.website)
      const websitesConflict = site !== null && otherSite !== null && site !== otherSite
      return !websitesConflict && isSamePlace(business, other)
    })
    if (isDuplicate) continue

    sameName.push(business)
    keptByName.set(key, sameName)
    result.push(business)
  }

  return result
}
