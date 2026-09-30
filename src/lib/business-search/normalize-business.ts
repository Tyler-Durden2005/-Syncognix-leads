import type { BusinessSearchResult } from "@/types/business"
import type { OverpassElement } from "./search-overpass"

/** Trims a tag value and collapses whitespace; empty values become null. */
function clean(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null
  const cleaned = value.replace(/\s+/g, " ").trim()
  return cleaned || null
}

/** OSM allows several values separated by ";" — keep the first. */
function firstValue(value: string | undefined): string | null {
  return clean(value?.split(";")[0])
}

function firstTag(tags: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = firstValue(tags[key])
    if (value) return value
  }
  return null
}

/** Returns an absolute http(s) URL, or null if the tag isn't a usable website. */
export function normalizeWebsite(raw: string | null): string | null {
  if (!raw || /\s/.test(raw)) return null
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    const url = new URL(candidate)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    if (!url.hostname.includes(".")) return null
    // "mailto:a@b.com" parses as user "mailto" on host b.com — not a website.
    if (url.username || url.password) return null
    const href = url.href
    // Drop the trailing slash URL adds to bare domains ("https://a.com/").
    return url.pathname === "/" && !url.search && !url.hash ? href.slice(0, -1) : href
  } catch {
    return null
  }
}

function buildAddress(parts: {
  houseNumber: string | null
  street: string | null
  city: string | null
  state: string | null
  postcode: string | null
  full: string | null
}): string | null {
  const streetLine = [parts.houseNumber, parts.street].filter(Boolean).join(" ")
  // Without a street, "Dallas, Texas" isn't a useful address — fall back to
  // addr:full if present, otherwise report no address.
  if (!parts.street) return parts.full

  const region = [parts.state, parts.postcode].filter(Boolean).join(" ")
  return [streetLine, parts.city, region].filter(Boolean).join(", ")
}

function coordinates(element: OverpassElement) {
  const lat = element.type === "node" ? element.lat : element.center?.lat
  const lon = element.type === "node" ? element.lon : element.center?.lon
  if (typeof lat !== "number" || typeof lon !== "number") {
    return { latitude: null, longitude: null }
  }
  return { latitude: lat, longitude: lon }
}

/** Converts one Overpass element into a clean result, or null if it has no usable name. */
export function normalizeBusiness(
  element: OverpassElement,
  categoryId: string
): BusinessSearchResult | null {
  const tags = element.tags ?? {}
  const name = clean(tags.name)
  if (!name) return null

  const city = firstTag(tags, ["addr:city"])
  const state = firstTag(tags, ["addr:state", "addr:province"])
  const postcode = firstTag(tags, ["addr:postcode"])

  return {
    osmId: `${element.type}:${element.id}`,
    osmType: element.type,
    name,
    website: normalizeWebsite(firstTag(tags, ["website", "contact:website", "url"])),
    phone: firstTag(tags, ["phone", "contact:phone"]),
    address: buildAddress({
      houseNumber: firstTag(tags, ["addr:housenumber"]),
      street: firstTag(tags, ["addr:street"]),
      city,
      state,
      postcode,
      full: clean(tags["addr:full"]),
    }),
    city,
    state,
    postcode,
    category: categoryId,
    ...coordinates(element),
  }
}

/** Great-circle distance in meters. */
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6_371_000 * 2 * Math.asin(Math.sqrt(a))
}

/**
 * Same business mapped twice (commonly a point plus its building outline)
 * shows up as two objects with the same name a few meters apart. Real
 * branches of a chain are much further apart than this.
 */
const DUPLICATE_DISTANCE_METERS = 100

function nameKey(name: string) {
  return name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "")
}

/**
 * Conservative dedupe: always by osmId; by name only when two objects with the
 * same normalized name are within DUPLICATE_DISTANCE_METERS of each other.
 */
export function dedupeBusinesses(businesses: BusinessSearchResult[]) {
  const seenIds = new Set<string>()
  const keptByName = new Map<string, BusinessSearchResult[]>()
  const result: BusinessSearchResult[] = []

  for (const business of businesses) {
    if (seenIds.has(business.osmId)) continue
    seenIds.add(business.osmId)

    const key = nameKey(business.name)
    const sameName = keptByName.get(key) ?? []
    const isNearbyDuplicate =
      business.latitude !== null &&
      business.longitude !== null &&
      sameName.some(
        (other) =>
          other.latitude !== null &&
          other.longitude !== null &&
          distanceMeters(
            business.latitude!,
            business.longitude!,
            other.latitude,
            other.longitude
          ) < DUPLICATE_DISTANCE_METERS
      )
    if (isNearbyDuplicate) continue

    sameName.push(business)
    keptByName.set(key, sameName)
    result.push(business)
  }

  return result
}

/** Sorts nearest-first; results without coordinates go last. Overpass itself returns no useful order. */
export function sortByDistance(
  businesses: BusinessSearchResult[],
  latitude: number,
  longitude: number
) {
  const distance = (b: BusinessSearchResult) =>
    b.latitude === null || b.longitude === null
      ? Number.POSITIVE_INFINITY
      : distanceMeters(latitude, longitude, b.latitude, b.longitude)
  return businesses
    .map((business) => ({ business, distance: distance(business) }))
    .sort((a, b) => a.distance - b.distance)
    .map(({ business }) => business)
}
